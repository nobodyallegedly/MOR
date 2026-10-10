//! The pooled anchoring service's second pass (F225), over the core
//! library's verifier and Agreements view: buying an anchor is an
//! agreement. The service's offer is an Agreements standing offer, a lone
//! seller's (F215), which the core reads as one that counts; a payment
//! following it is a purchase accepted under its terms; a default owes the
//! price back under those terms, and the refund is paid back for real over
//! Lightning (a real BOLT 11 invoice signed by the payer's test node key,
//! settled by its preimage): the service's claim, naming the payment
//! refunded, with the rail's proof that the money reached the payer's own
//! pointer. Money shows it repaid; the cMIP's judgment then reads the
//! refund settled.
//!
//! "Money says how money moves, that money has moved, or asks that it
//! move. Agreements say what must happen, in return or in consequence,
//! when money moves" (Nobody, allegedly, F225). Test identities and
//! regtest units only.

#[path = "../../../core/tests/common/mod.rs"]
mod common;
mod support;

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use common::{own_home, Person, World};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_anchoring::service::{self, Judgment, Offer, Payment, Price, Standing, Terms, Ticket, Tier};
use mor_anchoring::tree;
use mor_core::act::Ref;
use mor_core::chain::Status;
use mor_core::money::{self as fin, Amount, Citations, Claim, Holding, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, RefundTo, VaultEntry};
use mor_core::hash::Hash;
use mor_core::identity::Payload as Id;
use mor_core::agreements::{self, AgreementsView, Mips};
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::clock::{self, BitcoinClock};
use mor_onchain::Network;
use mor_payment::{beside, paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::collections::BTreeMap;
use std::time::Duration;
use support::{grow, h, mine, secret, N, REGTEST_BITS};

fn mips() -> Mips {
    Mips {
        identity: common::identity_spec(),
        text: h("a text specification"),
        envelopes: h("the envelope specification"),
        money: common::money_spec(),
        agreements: common::agreements_spec(),
        development: h("the production specification"),
    }
}

fn sat(n: u64) -> Amount {
    Amount { unit: mor_onchain::unit(Network::Regtest), value: n }
}

// ---------------------------------------------------------------- an Agreements client's Held

struct AgreementsHeld<'a> {
    view: AgreementsView<'a>,
}

impl AgreementsHeld<'_> {
    fn fin(&self, id: &Hash) -> Option<(Payload, Hash)> {
        let x = self.view.v.get(id)?;
        if x.inside.spec != mips().money {
            return None;
        }
        Some((Payload::decode(x.inside.type_, &x.inside.payload).ok()?, x.act.outside.signer?))
    }
}

impl Held for AgreementsHeld<'_> {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        match self.fin(id)? {
            (Payload::PayeePointer(p), s) if s == p.payee && self.view.v.binding_status(id) == Status::Valid => Some(p),
            _ => None,
        }
    }
    fn vault(&self, declared_by: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        let x = self.view.v.get(declared_by)?;
        let (who, decls) = match x.identity.as_ref()?.as_ref().ok()? {
            Id::Genesis(g) => (*declared_by, g.declarations.clone()?),
            Id::Rotation(r) => (x.act.outside.signer?, r.declarations.clone()?),
            _ => return None,
        };
        Some((who, fin::vault_in(&mips().money, &decls).ok()??.unwrap_or_default()))
    }
    fn obligation(&self, id: &Hash) -> Option<Obligation> {
        match self.fin(id)? {
            (Payload::Obligation(o), s) if s == o.debtor && self.view.v.binding_status(id) == Status::Valid => Some(o),
            _ => None,
        }
    }
    fn holding(&self, fulfils: &Hash, payee: &Hash) -> Option<Holding> {
        self.view.pointer_holding(fulfils, payee)
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        self.view.v.signed_by(payee).filter_map(|x| Some((x.id, self.pointer(&x.id)?))).filter(|(_, p)| &p.payee == payee).collect()
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
        None
    }
    fn payment_counts(&self, payee: &Hash, at: &PaidAt, amount: &Amount, proof: &[u8], fulfils: &Hash) -> Option<bool> {
        Some(self.view.payment_counts(payee, at, amount, proof, fulfils))
    }
}

// ---------------------------------------------------------------- the world

/// A real BOLT 11 invoice signed by a test node key, for `msat`, committing
/// to `dh`, settled by `preimage`.
fn invoice(sk: &SecretKey, msat: u64, dh: &Hash, preimage: &Hash) -> String {
    InvoiceBuilder::new(Currency::Regtest)
        .description_hash(bh::Hash::from_byte_array(*dh))
        .payment_hash(bh::Hash::from_byte_array(mor_core::hash::sha256(preimage)))
        .payment_secret(PaymentSecret([7; 32]))
        .amount_milli_satoshis(msat)
        .duration_since_epoch(Duration::from_secs(1_790_000_000))
        .min_final_cltv_expiry_delta(80)
        .basic_mpp()
        .build_signed(|m: &Message| Secp256k1::new().sign_ecdsa_recoverable(m, sk))
        .unwrap()
        .to_string()
}

fn ln_rail(node: &SecretKey) -> Vec<Rail> {
    vec![Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node: PublicKey::from_secret_key(&Secp256k1::new(), node).serialize(), endpoint: None }.encode() }]
}

struct Story {
    w: World,
    service: Person,
    ana: Person,
    ben: Person,
    service_pointer: Hash,
    ana_pointer: Hash,
    ben_pointer: Hash,
    offer_id: Hash,
    rail_valid: BTreeMap<Hash, PaidAt>,
    payments: BTreeMap<Vec<u8>, Vec<u8>>,
}

impl Story {
    fn new(terms: &Terms) -> Story {
        let mut w = World::new();
        let mut service = w.genesis("the anchoring service", vec![own_home()], None, None);
        let mut ana = w.genesis("ana", vec![own_home()], None, None);
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let pointer = |w: &mut World, p: &mut Person, node: &str| {
            let x = PayeePointer { payee: p.id, version: 1, previous: None, rails: ln_rail(&secret(node)) };
            let a = w.everyday_act(p, mips().money, fin::types::PAYEE_POINTER, Payload::PayeePointer(x).to_map(), None, None);
            w.add(&a)
        };
        let service_pointer = pointer(&mut w, &mut service, "the service's node");
        let ana_pointer = pointer(&mut w, &mut ana, "ana's node");
        let ben_pointer = pointer(&mut w, &mut ben, "ben's node");
        // The service's standing offer, public, citing its latest pointer
        // (Money rule 14's client conformance for an act that can pay its
        // signer).
        let offer = terms.standing_offer(mor_onchain::unit(Network::Regtest), Some("Anchoring on Bitcoin regtest, priced by urgency".into()), None);
        let a = w.everyday_act_refs(&mut service, mips().agreements, agreements::types::STANDING_OFFER, offer.to_map(), None, None, Some(vec![Ref::Act(service_pointer)]));
        let offer_id = w.add(&a);
        Story { w, service, ana, ben, service_pointer, ana_pointer, ben_pointer, offer_id, rail_valid: BTreeMap::new(), payments: BTreeMap::new() }
    }

    fn view(&self) -> AgreementsView<'_> {
        let mut v = AgreementsView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.payments = self.payments.clone();
        v
    }

    /// The offer as the anchoring cMIP reads it from the held act.
    fn offer(&self) -> Offer {
        let x = self.w.v.get(&self.offer_id).unwrap();
        let o = agreements::Offer::decode(&x.inside).expect("an offer in Agreements' format").offer;
        Offer::read(self.offer_id, self.service.id, &o).expect("an anchoring offer")
    }

    /// Sign and hold a claim; where the Lightning rail answers valid, state
    /// it to the Agreements view as an Agreements client does. Its act id and the answer.
    fn claim(&mut self, payer: &mut Person, c: &Claim) -> (Hash, Answer) {
        let a = self.w.everyday_act(payer, mips().money, fin::types::CLAIM, Payload::Claim(c.clone()).to_map(), None, None);
        let id = self.w.add(&a);
        let rec = Record::Claim(c, payer.id, &Citations::default());
        let ln = Lightning;
        let modules = Modules::new().adopt(&ln);
        let answer = verify(rec.clone(), &AgreementsHeld { view: self.view() }, &modules).answer;
        if answer == Answer::Valid {
            self.rail_valid.insert(id, paid_at(&rec).unwrap());
            if let Some(p) = mor_payment::payment(&rec, &modules) {
                self.payments.insert(c.proof.clone(), p);
            }
        }
        (id, answer)
    }

    /// A payment over Lightning by `payer` to `payee`'s pointer `pointer`,
    /// following `fulfils`, settled: its commitment and the payer's claim.
    #[allow(clippy::too_many_arguments)]
    fn pay(&mut self, payer: &mut Person, payee: Hash, pointer: Hash, node: &str, amount: u64, fulfils: Hash, label: &str) -> (Commitment, Hash, Answer) {
        let paid_to = PaidTo::Flow { pointer, rail: 0 };
        let salt: [u8; 16] = h(label)[..16].try_into().unwrap();
        let c = Commitment { rail: mor_lightning::spec(), payee, amount: sat(amount), fulfils, payer: Some(Payer::Identity(payer.id)), paid_to, salt, purchase: None };
        let preimage = h(&format!("{label}: the preimage"));
        let ln = LnProof { invoice: invoice(&secret(node), amount * 1000, &c.hash(), &preimage), preimage: Some(preimage) };
        let claim = Claim { rail: mor_lightning::spec(), proof: Proof { paid_to, salt, rail: ln.encode() }.encode(), payee, amount: sat(amount), fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        let (id, a) = self.claim(payer, &claim);
        (c, id, a)
    }
}

fn terms() -> Terms {
    Terms { reference: clock::reference(Network::Regtest), tiers: vec![Tier { price: Price::Fixed(50), blocks: 2 }, Tier { price: Price::Fixed(20), blocks: 6 }] }
}

// ---------------------------------------------------------------- the tests

/// F225: the core reads the service's offer as an Agreements standing
/// offer that counts (public, a lone seller's, its payee the service);
/// Ana's payment following it is verified on the Lightning rail, follows
/// the pointer the offer holds (Money rules 14 and 15), and is a purchase
/// accepted under the offer's terms (F215). It buys the ticket the service
/// signed. The same payment made as a tip to the service's pointer (step
/// 14a's reading 3, reversed) is no purchase under any offer, and buys no
/// ticket.
#[test]
fn f225_the_core_reads_the_services_offer_as_a_standing_offer_and_the_payment_as_a_purchase() {
    let mut s = Story::new(&terms());
    let e = s.view().offer(&s.offer_id).unwrap();
    assert!(e.counts, "{:?}", e.problems);
    assert_eq!(e.offer.payee(&s.service.id), Some(s.service.id));
    let offer = s.offer();
    let mut ana = s.ana.clone();
    let (sid, sp, oid) = (s.service.id, s.service_pointer, s.offer_id);
    let (c, claim, answer) = s.pay(&mut ana, sid, sp, "the service's node", 50, oid, "ana buys one hash");
    assert_eq!(answer, Answer::Valid, "paid over Lightning, verified by the Lightning rail Module");
    let x = s.w.v.get(&claim).unwrap();
    let Ok(Payload::Claim(cl)) = Payload::decode(x.inside.type_, &x.inside.payload) else { panic!() };
    assert_eq!(beside(Record::Claim(&cl, ana.id, &Citations::default()), &AgreementsHeld { view: s.view() }), Answer::Valid, "the pointer the service's offer holds");
    assert_eq!(s.view().purchase(&claim).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase, "accepted under the offer's terms (F215)");
    let ticket = Ticket { offer: oid, leaf: tree::leaf(&h("ana's act"), &h("ana's blind")), commitment: c.hash(), tier: 0, batch: 0, deadline: 102, quote: None };
    assert_eq!(service::acceptable(&offer, &ticket, &c, 100, None), Ok(()));
    // A tip to the service's pointer: no purchase, no ticket.
    let (tip, tip_claim, answer) = s.pay(&mut ana, sid, sp, "the service's node", 50, sp, "ana tips the service");
    assert_eq!(answer, Answer::Valid);
    assert!(s.view().purchase(&tip_claim).unwrap().is_none(), "a tip is no purchase");
    let t2 = Ticket { commitment: tip.hash(), ..ticket };
    assert!(service::acceptable(&offer, &t2, &tip, 100, None).is_err(), "reading 3 of step 14a reversed: a tip buys no ticket");
}

/// F225, the refund paid for real: Ana bought the urgent tier; the service
/// never anchored her hash; once the deadline is buried six deep, it is a
/// default and the price is owed back to Ana under the offer's terms. The
/// service pays it back over Lightning to Ana's own pointer (Money rule 14:
/// her pointer in force, since none of her acts on the payment holds
/// another), and signs its claim naming the payment refunded (her claim),
/// with the rail's proof. Money shows it repaid; the judgment reads it
/// settled. A repayment to someone else's pointer repays nothing.
#[test]
fn f225_a_default_is_refunded_for_real_and_shown_repaid() {
    let mut s = Story::new(&terms());
    let offer = s.offer();
    let mut ana = s.ana.clone();
    let mut service = s.service.clone();
    let (aid, sid, sp, oid) = (ana.id, s.service.id, s.service_pointer, s.offer_id);
    let mut chain = support::chain(&[mine(h("the chain so far"), &[h("a block")], REGTEST_BITS, 1)]);
    let now = chain.tip();
    let (c, owed, answer) = s.pay(&mut ana, sid, sp, "the service's node", 50, oid, "ana buys one hash");
    assert_eq!(answer, Answer::Valid);
    let ticket = Ticket { offer: oid, leaf: tree::leaf(&h("ana's act"), &h("ana's blind")), commitment: c.hash(), tier: 0, batch: 0, deadline: now + 2, quote: None };
    grow(&mut chain, 2 + N - 1);
    let payment = Payment { commitment: c, answer };
    let Judgment::Default { refund } = service::judge(&offer, &ticket, &payment, &[], None, &BitcoinClock { chain: &chain }) else { panic!("a default") };
    assert_eq!((refund.amount, refund.to.clone()), (sat(50), RefundTo::Identity(aid)));
    let clock = BitcoinClock { chain: &chain };
    let repaid = |s: &Story| s.view().refund_repaid(&owed, &refund.to, &refund.amount.unit);
    assert_eq!(repaid(&s), 0);
    assert_eq!(service::standing(&refund, repaid(&s), &clock), Standing::Owed { left: 50 });
    // Paid to Ben's pointer, naming Ana's payment: it repays nothing.
    let (bid, bp, ap) = (s.ben.id, s.ben_pointer, s.ana_pointer);
    let (_, wrong, a) = s.pay(&mut service, bid, bp, "ben's node", 50, owed, "the service pays the wrong person");
    assert_eq!(a, Answer::Valid);
    assert!(s.w.v.get(&wrong).is_some());
    assert_eq!(repaid(&s), 0, "paid to another identity");
    // Paid back to Ana's own pointer, naming her payment: repaid.
    let (_, back, a) = s.pay(&mut service, aid, ap, "ana's node", 50, owed, "the service pays ana back");
    assert_eq!(a, Answer::Valid, "the rail's proof that the money went back");
    assert!(s.rail_valid.contains_key(&back));
    assert_eq!(repaid(&s), 50, "Money shows it repaid: the service's claim, with the rail's proof");
    assert_eq!(service::standing(&refund, repaid(&s), &clock), Standing::Repaid);
}
