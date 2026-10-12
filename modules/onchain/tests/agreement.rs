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
use mor_core::agreements::{self, AgreementsView, Mirs};
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::clock::{self, BitcoinClock};
use mor_onchain::Network;
use mor_payment::{beside, paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::collections::BTreeMap;
use std::time::Duration;
use support::{grow, h, mine, secret, N, REGTEST_BITS};

fn mirs() -> Mirs {
    Mirs {
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
        if x.inside.spec != mirs().money {
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
        Some((who, fin::vault_in(&mirs().money, &decls).ok()??.unwrap_or_default()))
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
    fn claim(&self, id: &Hash) -> Option<(Claim, Hash, Citations)> {
        let x = self.view.v.get(id)?;
        match self.fin(id)? {
            (Payload::Claim(c), s) if self.view.v.binding_status(id) == Status::Valid => Some((c, s, Citations::of(&x.inside))),
            _ => None,
        }
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
            let a = w.everyday_act(p, mirs().money, fin::types::PAYEE_POINTER, Payload::PayeePointer(x).to_map(), None, None);
            w.add(&a)
        };
        let service_pointer = pointer(&mut w, &mut service, "the service's node");
        let ana_pointer = pointer(&mut w, &mut ana, "ana's node");
        let ben_pointer = pointer(&mut w, &mut ben, "ben's node");
        // The service's standing offer, public, citing its latest pointer
        // (Money rule 14's client conformance for an act that can pay its
        // signer).
        let offer = terms.standing_offer(mor_onchain::unit(Network::Regtest), Some("Anchoring on Bitcoin regtest, priced by urgency".into()), None);
        let a = w.everyday_act_refs(&mut service, mirs().agreements, agreements::types::STANDING_OFFER, offer.to_map(), None, None, Some(vec![Ref::Act(service_pointer)]));
        let offer_id = w.add(&a);
        Story { w, service, ana, ben, service_pointer, ana_pointer, ben_pointer, offer_id, rail_valid: BTreeMap::new(), payments: BTreeMap::new() }
    }

    fn view(&self) -> AgreementsView<'_> {
        let mut v = AgreementsView::new(&self.w.v, mirs());
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
        let a = self.w.everyday_act(payer, mirs().money, fin::types::CLAIM, Payload::Claim(c.clone()).to_map(), None, None);
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
        self.pay_to(payer, payee, PaidTo::Flow { pointer, rail: 0 }, node, amount, fulfils, label, None)
    }

    /// As [`Self::pay`], paid to `paid_to`, the payer's claim naming
    /// `refund` as its refund rail (key 7) where given.
    #[allow(clippy::too_many_arguments)]
    fn pay_to(&mut self, payer: &mut Person, payee: Hash, paid_to: PaidTo, node: &str, amount: u64, fulfils: Hash, label: &str, refund: Option<Rail>) -> (Commitment, Hash, Answer) {
        let salt: [u8; 16] = h(label)[..16].try_into().unwrap();
        let c = Commitment { rail: mor_lightning::spec(), payee, amount: sat(amount), fulfils, payer: Some(Payer::Identity(payer.id)), paid_to, salt, purchase: None };
        let preimage = h(&format!("{label}: the preimage"));
        let ln = LnProof { invoice: invoice(&secret(node), amount * 1000, &c.hash(), &preimage), preimage: Some(preimage) };
        let claim = Claim { rail: mor_lightning::spec(), proof: Proof { paid_to, salt, rail: ln.encode() }.encode(), payee, amount: sat(amount), fulfils, disagrees: None, referral: None, refund, anonymous: None, purchase: None, previous: None };
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

/// RQ1, taken as option 1, for QG2 (Money rule 14, decided 9 October 2026,
/// "Agreed"): Ana's claim on her payment names a refund rail (key 7), so a
/// refund owed to her is paid there. The service pays it back over
/// Lightning to `[2, claim]`, "the refund rail this claim names": the
/// payment cMIP finds the address in Ana's claim, as it does in a pointer,
/// and the Lightning rule checks the invoice against it. Money shows it
/// repaid, checked, not stated by hand. A refund to her pointer now repays
/// nothing; one whose invoice another node signed, one to a claim naming no
/// refund rail, and one naming another identity as payee are invalid.
#[test]
fn rq1_a_refund_to_the_refund_rail_the_payers_claim_names_is_checked_and_shown_repaid() {
    let mut s = Story::new(&terms());
    let mut ana = s.ana.clone();
    let mut service = s.service.clone();
    let (aid, sid, sp, ap, oid) = (ana.id, s.service.id, s.service_pointer, s.ana_pointer, s.offer_id);
    let refund_rail = ln_rail(&secret("ana's refund node")).remove(0);
    let (_, owed, a) = s.pay_to(&mut ana, sid, PaidTo::Flow { pointer: sp, rail: 0 }, "the service's node", 50, oid, "ana buys one hash", Some(refund_rail));
    assert_eq!(a, Answer::Valid);
    let to = RefundTo::Identity(aid);
    let repaid = |s: &Story| s.view().refund_repaid(&owed, &to, &sat(1).unit);
    // To her pointer: valid on the rail, but her claim named a refund rail.
    let (_, _, a) = s.pay(&mut service, aid, ap, "ana's node", 50, owed, "back to ana's pointer");
    assert_eq!(a, Answer::Valid);
    assert_eq!(repaid(&s), 0, "her claim names a refund rail: a repayment elsewhere repays nothing (QG2)");
    // To her claim's refund rail, but the invoice signed by another node.
    let there = PaidTo::Refund { claim: owed };
    let (_, _, a) = s.pay_to(&mut service, aid, there, "ana's node", 50, owed, "signed by the wrong node", None);
    assert!(matches!(a, Answer::Invalid(_)), "{a:?}");
    assert_eq!(repaid(&s), 0);
    // Naming another identity as payee: the claim is Ana's act, not Ben's.
    let bid = s.ben.id;
    let (_, _, a) = s.pay_to(&mut service, bid, there, "ana's refund node", 50, owed, "payee ben", None);
    assert_eq!(a, Answer::Invalid("paid to the refund rail of another identity's claim".into()));
    // A claim naming no refund rail: the service's own first repayment claim.
    let (_, plain, _) = s.pay(&mut ana, sid, sp, "the service's node", 5, sp, "a tip naming no refund rail");
    let (_, _, a) = s.pay_to(&mut service, aid, PaidTo::Refund { claim: plain }, "ana's refund node", 5, plain, "to no refund rail", None);
    assert_eq!(a, Answer::Invalid("the claim names no refund rail".into()));
    // A claim not held: unknown.
    let (_, _, a) = s.pay_to(&mut service, aid, PaidTo::Refund { claim: h("a claim nobody holds") }, "ana's refund node", 50, owed, "to a claim not held", None);
    assert!(matches!(a, Answer::Unknown(_)), "{a:?}");
    assert_eq!(repaid(&s), 0);
    // Where her claim said: checked by the rail's rule, and repaid.
    let (_, back, a) = s.pay_to(&mut service, aid, there, "ana's refund node", 50, owed, "back to ana's refund rail", None);
    assert_eq!(a, Answer::Valid, "the address read from her claim's key 7, the invoice signed by that node");
    assert_eq!(s.rail_valid.get(&back), Some(&PaidAt::Flow(owed)), "the core's reading: paid at the claim");
    let x = s.w.v.get(&back).unwrap();
    let Ok(Payload::Claim(cl)) = Payload::decode(x.inside.type_, &x.inside.payload) else { panic!() };
    assert_eq!(beside(Record::Claim(&cl, service.id, &Citations::default()), &AgreementsHeld { view: s.view() }), Answer::Valid);
    assert_eq!(repaid(&s), 50, "Money shows it repaid, its rail answer checked (QG2)");
}

/// RQ1, taken as option 1, for QG1 (Money rule 10a, decided 9 October
/// 2026): an anonymous payer commits a bare key, and its claim, signed by a
/// one-time identity and carrying the key's signature, names a refund rail.
/// The refund owed to the key is paid to `[2, claim]`, its payee the
/// one-time identity that signed the claim; the payment cMIP checks it
/// against the rail, and Money shows it repaid to the key.
#[test]
fn rq1_a_refund_to_a_bare_key_is_checked_where_its_claim_said() {
    use mor_core::money::Anonymous;
    use mor_core::sig::SchnorrKey;
    let mut s = Story::new(&terms());
    let mut service = s.service.clone();
    let (sid, sp, oid) = (s.service.id, s.service_pointer, s.offer_id);
    let key = SchnorrKey::from_secret(&h("a one-time key")).unwrap();
    let bare = mor_core::identity::SigningKey { scheme: mor_core::act::Scheme::Founding(1), key: key.public().to_vec() };
    let mut once = s.w.genesis("a one-time identity", vec![own_home()], None, None);
    // The anonymous payment: its commitment names the bare key as payer.
    let paid_to = PaidTo::Flow { pointer: sp, rail: 0 };
    let salt: [u8; 16] = h("an anonymous purchase")[..16].try_into().unwrap();
    let c = Commitment { rail: mor_lightning::spec(), payee: sid, amount: sat(50), fulfils: oid, payer: Some(Payer::Key(bare.clone())), paid_to, salt, purchase: None };
    let preimage = h("the anonymous preimage");
    let ln = LnProof { invoice: invoice(&secret("the service's node"), 50_000, &c.hash(), &preimage), preimage: Some(preimage) };
    let refund_rail = ln_rail(&secret("the key's refund node")).remove(0);
    let mut claim = Claim { rail: mor_lightning::spec(), proof: Proof { paid_to, salt, rail: ln.encode() }.encode(), payee: sid, amount: sat(50), fulfils: oid, disagrees: None, referral: None, refund: Some(refund_rail), anonymous: None, purchase: None, previous: None };
    claim.anonymous = Some(Anonymous { key: bare.clone(), sig: key.sign(&claim.anonymous_message(&Citations::default()), &[0; 32]).sig });
    let (owed, a) = s.claim(&mut once, &claim);
    assert_eq!(a, Answer::Valid, "the anonymous payment, verified");
    let to = RefundTo::Key(bare);
    let repaid = |s: &Story| s.view().refund_repaid(&owed, &to, &sat(1).unit);
    assert_eq!(repaid(&s), 0);
    let there = PaidTo::Refund { claim: owed };
    let (_, _, a) = s.pay_to(&mut service, once.id, there, "the service's node", 50, owed, "to the wrong node", None);
    assert!(matches!(a, Answer::Invalid(_)), "{a:?}");
    assert_eq!(repaid(&s), 0);
    let (_, _, a) = s.pay_to(&mut service, once.id, there, "the key's refund node", 50, owed, "back where the key's claim said", None);
    assert_eq!(a, Answer::Valid, "the address read from the claim the key signed");
    assert_eq!(repaid(&s), 50, "Money shows it repaid to the key, its rail answer checked (QG1)");
}

/// A clock standing in for the Bitcoin clock Module, for the checker's
/// verdicts alone: it places a leaf at the point its proof states, as
/// `"anchored at N"`. The Bitcoin clock's own batch anchors are tested in
/// `anchor.rs`.
struct StatedClock {
    now: u64,
}

impl service::BatchClock for StatedClock {
    fn reference(&self) -> mor_core::envelopes::anchoring::Reference {
        clock::reference(Network::Regtest)
    }
    fn leaf_point(&self, _leaf: &Hash, proof: &[u8]) -> Result<u64, Answer> {
        std::str::from_utf8(proof).ok().and_then(|s| s.strip_prefix("anchored at ")).and_then(|n| n.parse().ok()).ok_or(Answer::Invalid("no stated point".into()))
    }
    fn now(&self) -> Option<u64> {
        Some(self.now)
    }
    fn depth(&self) -> u64 {
        N as u64
    }
}

/// Agreements draft 11, rule 11 (new in draft 11, F261): the pooled
/// anchoring service is a proven offer, and the anchoring cMIP's existing
/// judgment is the first checker the core asks. Ana's hash anchored by the
/// deadline: proven. Anchored late, or left out of a batch the service
/// published: not proven. A verifier holding no checker for the anchoring
/// cMIP: not proven for it (unknown). The core reads the offer as a proven
/// offer by its form alone.
#[test]
fn draft_11_f261_the_anchoring_check_is_the_first_proof_checker() {
    let mut s = Story::new(&terms());
    let offer = s.offer();
    let mut ana = s.ana.clone();
    let (sid, sp, oid) = (s.service.id, s.service_pointer, s.offer_id);
    let (c, _, answer) = s.pay(&mut ana, sid, sp, "the service's node", 50, oid, "ana buys one hash");
    assert_eq!(answer, Answer::Valid);
    let leaf = tree::leaf(&h("ana's act"), &h("ana's blind"));
    let ticket = Ticket { offer: oid, leaf, commitment: c.hash(), tier: 0, batch: 0, deadline: 102, quote: None };
    let o = agreements::Offer::decode(&s.w.v.get(&oid).unwrap().inside).unwrap().offer;
    assert!(matches!(o.sold[0].class(), agreements::OfferClass::Proven { cmip, .. } if cmip == mor_anchoring::spec()), "the access form: a proven offer");
    let verdict = |s: &Story, publications: Vec<service::Publication>, anchor: Option<&[u8]>, now: u64, with_checker: bool| {
        let clock = StatedClock { now };
        let checker = service::Checker { offers: vec![offer.clone()], publications, payments: vec![Payment { commitment: c.clone(), answer: Answer::Valid }], clock: &clock };
        let held: Vec<(Hash, &dyn agreements::ProofChecker)> = if with_checker { vec![(mor_anchoring::spec(), &checker)] } else { vec![] };
        s.view().proven_delivery(&oid, &service::delivery_proof(&ticket, anchor), &held).unwrap()
    };
    assert_eq!(verdict(&s, vec![], Some(b"anchored at 101"), 120, true), agreements::ProofVerdict::Proven);
    assert!(matches!(verdict(&s, vec![], Some(b"anchored at 110"), 120, true), agreements::ProofVerdict::NotProven(_)), "late");
    let without = service::Publication { offer: oid, batch: 0, leaves: vec![h("someone else's leaf")], tx: h("the batch's transaction"), output: 0 };
    assert!(matches!(verdict(&s, vec![without], None, 101, true), agreements::ProofVerdict::NotProven(_)), "left out of its batch");
    assert!(matches!(verdict(&s, vec![], None, 101, true), agreements::ProofVerdict::Unknown(_)), "pending");
    assert!(matches!(verdict(&s, vec![], Some(b"anchored at 101"), 120, false), agreements::ProofVerdict::Unknown(_)), "no checker held: not proven here");
}
