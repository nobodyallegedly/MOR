//! The conversion cMIP, draft 2 (`cmips/cmip-conversion-draft-2.md`): a
//! rail swap sold as a proven offer, with receipts per hop, offline.
//! Lightning in (real BOLT 11 invoices signed by a test node key, each
//! committing to its payment commitment, checked by the Lightning rail
//! Module through the payment cMIP), on-chain out (a regtest chain built
//! with rust-bitcoin, each onward payment checked by the on-chain rail
//! Module on the chain followed, and placed by the Bitcoin clock Module).
//!
//! The route: Ana pays the conversion service over Lightning, following
//! its standing offer; the service's receipt declares the forward its
//! order promised; the service pays the forward on the chain to the next
//! payee, whose receipt names the service's. Freeze suite, scenario 2,
//! steps 4 (the route reads as one chain of receipts) and 4b (the
//! conversion service fails to forward; the receipts name that hop and its
//! agreement). End to end on regtest: `harness/tests/conversion.rs`.
//!
//! Test identities and regtest units only.

#[path = "../../../core/tests/common/mod.rs"]
mod common;
mod support;

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use common::{own_home, World};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_conversion::route::{self, Route};
use mor_conversion::{acceptable, delivery_proof, judge, ordered, Checker, Hop, Judgment, Offer, Order, Owed, Payment, Rate, Terms};
use mor_core::act::{Object, Ref};
use mor_core::agreements::{self, AgreementsView, Mips, ProofChecker, ProofVerdict};
use mor_core::hash::Hash;
use mor_core::money::{self as fin, Amount, Citations, Claim, Forward, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry};
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::chain::HeaderChain;
use mor_onchain::clock::{self, BitcoinClock};
use mor_onchain::{block, Block, Network, Onchain, OnchainProof, Paid};
use mor_payment::{verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::time::Duration;
use support::*;

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

/// A real BOLT 11 invoice signed by a test node key, for `msat`,
/// committing to `dh`, settled by `preimage`.
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

fn ln_rail(node: &SecretKey) -> Rail {
    Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node: PublicKey::from_secret_key(&Secp256k1::new(), node).serialize(), endpoint: None }.encode() }
}

fn genesis() -> HeaderChain {
    chain(&[mine(h("before the tests"), &[h("the first coinbase")], REGTEST_BITS, 1_789_999_000)])
}

// ---------------------------------------------------------------- the pointers the payment cMIP asks for

struct Pointers(Vec<(Hash, PayeePointer)>);

impl Held for Pointers {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        self.0.iter().find(|(i, _)| i == id).map(|(_, p)| p.clone())
    }
    fn vault(&self, _: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        None
    }
    fn obligation(&self, _: &Hash) -> Option<fin::Obligation> {
        None
    }
    fn holding(&self, _: &Hash, _: &Hash) -> Option<fin::Holding> {
        None
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        self.0.iter().filter(|(_, p)| &p.payee == payee).cloned().collect()
    }
    fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
        None
    }
    fn payment_counts(&self, _: &Hash, _: &fin::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }
}

// ---------------------------------------------------------------- the story

/// The conversion service, Ana who pays it, and the owners' split service
/// it pays on to; the service's standing offer, held by a verifier; a
/// regtest chain.
struct Story {
    w: World,
    service: Hash,
    /// The service's Lightning node: it issues the invoices for the first
    /// hop.
    node: SecretKey,
    service_pointer: Hash,
    ana: Hash,
    /// The owners' split service, the next payee: its on-chain keys.
    owners: Hash,
    owners_keys: Keys,
    owners_pointer: Hash,
    pointers: Pointers,
    offer: Offer,
    chain: HeaderChain,
}

/// Lightning in, on-chain out: 1:1 (a regtest satoshi either way), a fee of
/// 100, the onward payment within 6 blocks of the order.
fn swap_terms() -> Terms {
    Terms { out_rail: mor_onchain::spec(), out_unit: mor_onchain::unit(Network::Regtest), rate: Rate::Fixed { num: 1, den: 1 }, fee: 100, blocks: 6 }
}

impl Story {
    fn new(terms: Terms) -> Story {
        let mut w = World::new();
        let mut service = w.genesis("the conversion service", vec![own_home()], None, None);
        let ana = w.genesis("ana", vec![own_home()], None, None);
        let mut owners = w.genesis("the owners' split service", vec![own_home()], None, None);
        let node = secret("the conversion service's Lightning node, a test key");
        let owners_keys = Keys::new("the owners' split service's on-chain coins");
        let sp = PayeePointer { payee: service.id, version: 1, previous: None, rails: vec![ln_rail(&node)] };
        let op = PayeePointer { payee: owners.id, version: 1, previous: None, rails: vec![Rail { module: mor_onchain::spec(), address: owners_keys.address(Network::Regtest).encode() }] };
        let a = w.everyday_act(&mut service, mips().money, fin::types::PAYEE_POINTER, Payload::PayeePointer(sp.clone()).to_map(), None, None);
        let service_pointer = w.add(&a);
        let a = w.everyday_act(&mut owners, mips().money, fin::types::PAYEE_POINTER, Payload::PayeePointer(op.clone()).to_map(), None, None);
        let owners_pointer = w.add(&a);
        // The service's standing offer: public, citing its latest pointer
        // (Money rule 17's client conformance for an act that can pay its
        // signer).
        let standing = terms.standing_offer(sat(100_000), &clock::reference(Network::Regtest), Some("Lightning in, Bitcoin regtest out, 1:1, a fee of 100, within 6 blocks.".into()));
        let a = w.everyday_act_refs(&mut service, mips().agreements, agreements::types::STANDING_OFFER, standing.to_map(), None, None, Some(vec![Ref::Act(service_pointer)]));
        let offer_id = w.add(&a);
        let lo = agreements::Offer::decode(&w.v.get(&offer_id).unwrap().inside).expect("an offer in Agreements' format").offer;
        let offer = Offer::read(offer_id, service.id, &lo).expect("a conversion offer");
        Story {
            service: service.id,
            node,
            service_pointer,
            ana: ana.id,
            owners: owners.id,
            owners_keys,
            owners_pointer,
            pointers: Pointers(vec![(service_pointer, sp), (owners_pointer, op)]),
            offer,
            chain: genesis(),
            w,
        }
    }

    fn now(&self) -> u64 {
        self.chain.tip()
    }

    /// Ana's payment of `paid` to the service, following its offer, and
    /// the order the service signs for it: the forward to the owners'
    /// split service, following its pointer, by `deadline`.
    fn order(&self, label: &str, paid: u64, quote: Option<(u64, u64)>, deadline: u64) -> (Commitment, Order) {
        let c = Commitment { rail: mor_lightning::spec(), payee: self.service, amount: sat(paid), fulfils: self.offer.id, payer: Some(Payer::Identity(self.ana)), paid_to: PaidTo::Flow { pointer: self.service_pointer, rail: 0 }, salt: h(label)[..16].try_into().unwrap(), purchase: None };
        let out = self.offer.out(&c.amount, quote).unwrap_or(sat(paid));
        let order = Order { offer: self.offer.id, commitment: c.hash(), forward: Forward { next_payee: self.owners, amount: out, agreement: self.offer.id }, onward: self.owners_pointer, deadline, quote };
        (c, order)
    }

    /// The first hop paid over Lightning, settled: its rail proof.
    fn pay_in(&self, c: &Commitment, label: &str) -> Vec<u8> {
        let preimage = h(&format!("{label}: the preimage"));
        let ln = LnProof { invoice: invoice(&self.node, c.amount.value * 1000, &c.hash(), &preimage), preimage: Some(preimage) };
        Proof { paid_to: c.paid_to, salt: c.salt, rail: ln.encode() }.encode()
    }

    /// The service's receipt of the first hop, declaring `forward`, held
    /// as `id`, checked by the Lightning rail Module.
    fn first(&self, c: &Commitment, proof: Vec<u8>, forward: Option<Forward>, id: &str) -> Hop {
        let r = Receipt { rail: c.rail, proof, payer: c.payer.clone(), payee: c.payee, amount: c.amount, fulfils: c.fulfils, previous: None, forward, batch: None, purchase: None };
        let ln = Lightning;
        let modules = Modules::new().adopt(&ln);
        let answer = verify(Record::Receipt(&r), &self.pointers, &modules).answer;
        let payment = mor_payment::payment(&Record::Receipt(&r), &modules);
        Hop::receipt(h(id), r, vec![], answer, payment)
    }

    /// The service pays `amount` on the chain to the owners' split service,
    /// following `onward`, mined on the chain's tip and buried at the
    /// rail's depth: the commitment and the rail proof.
    fn pay_on(&mut self, amount: u64, onward: Hash, label: &str) -> (Commitment, Vec<u8>) {
        let c = Commitment { rail: mor_onchain::spec(), payee: self.owners, amount: sat(amount), fulfils: onward, payer: Some(Payer::Identity(self.service)), paid_to: PaidTo::Flow { pointer: self.owners_pointer, rail: 0 }, salt: h(label)[..16].try_into().unwrap(), purchase: None };
        let script = self.owners_keys.address(Network::Regtest).script(&c.hash()).unwrap();
        let t = bytes(&tx(&format!("the service's coins, {label}"), &[(script, amount)]));
        let txids = [h(&format!("a coinbase under {:?}", self.chain.tip())), txid(&t)];
        let headers = mine_on(&mut self.chain, &txids, N);
        let at = Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers };
        let rail = OnchainProof { request: request(&self.owners_keys.request, &c.hash()), confirmations: None, paid: Some(Paid { tx: t, output: 0, block: Some(at) }) };
        (c.clone(), Proof { paid_to: c.paid_to, salt: c.salt, rail: rail.encode() }.encode())
    }

    /// The next payee's receipt of the onward payment, naming `previous`
    /// in field 6 and (where `cites`) in its `objects`, checked by the
    /// on-chain rail Module on the chain followed.
    fn onward(&self, c: &Commitment, proof: Vec<u8>, previous: &Hash, cites: bool, id: &str) -> Hop {
        let r = Receipt { rail: c.rail, proof, payer: c.payer.clone(), payee: c.payee, amount: c.amount, fulfils: c.fulfils, previous: Some(*previous), forward: None, batch: None, purchase: None };
        let onchain = Onchain::on(&self.chain);
        let modules = Modules::new().adopt(&onchain);
        let answer = verify(Record::Receipt(&r), &self.pointers, &modules).answer;
        let payment = mor_payment::payment(&Record::Receipt(&r), &modules);
        Hop::receipt(h(id), r, if cites { vec![*previous] } else { vec![] }, answer, payment)
    }

    /// The service's own claim of the onward payment (Money rule 11; F267),
    /// naming `previous` in its field 10 and (where `cites`) in its act's
    /// `objects`, checked by the on-chain rail Module on the chain
    /// followed. The next payee signs nothing.
    fn claim_on(&self, c: &Commitment, proof: Vec<u8>, previous: &Hash, cites: bool, id: &str) -> Hop {
        let claim = Claim { rail: c.rail, proof, payee: c.payee, amount: c.amount, fulfils: c.fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: Some(*previous) };
        let cited = Citations { objects: cites.then(|| vec![Object { chain: *previous, predecessor: *previous }]), acks: None, refs: None };
        let onchain = Onchain::on(&self.chain);
        let modules = Modules::new().adopt(&onchain);
        let answer = verify(Record::Claim(&claim, self.service, &cited), &self.pointers, &modules).answer;
        let payment = mor_payment::payment(&Record::Claim(&claim, self.service, &cited), &modules);
        Hop::claim(h(id), claim, self.service, cited, answer, payment)
    }

    fn judge(&self, order: &Order, paid: &Payment, first: Option<&Hop>, hops: &[Hop]) -> Judgment {
        judge(&self.offer, &h("the order"), order, paid, first, hops, &BitcoinClock { chain: &self.chain }, &self.pointers)
    }

    /// The core's verdict on a proof of delivery under the offer
    /// (Agreements draft 11, rule 11, F261), asking this cMIP's checker
    /// where `with_checker`.
    fn verdict(&self, order: &Order, paid: &Payment, hops: Vec<Hop>, onward: Option<&Hash>, with_checker: bool) -> ProofVerdict {
        let clock = BitcoinClock { chain: &self.chain };
        let checker = Checker { offers: vec![self.offer.clone()], orders: vec![(h("the order"), order.clone())], payments: vec![paid.clone()], hops, clock: &clock, held: &self.pointers };
        let held: Vec<(Hash, &dyn ProofChecker)> = if with_checker { vec![(mor_conversion::spec(), &checker)] } else { vec![] };
        AgreementsView::new(&self.w.v, mips()).proven_delivery(&self.offer.id, &delivery_proof(&h("the order"), onward), &held).unwrap()
    }
}

/// Mine empty blocks until the deadline is buried at the clock's depth (a
/// point at the deadline would now count).
fn bury(s: &mut Story, deadline: u64) {
    let target = deadline + N as u64 - 1;
    let n = target.saturating_sub(s.now()) as usize;
    grow(&mut s.chain, n);
}

fn valid(c: &Commitment) -> Payment {
    Payment { commitment: c.clone(), answer: Answer::Valid }
}

// ---------------------------------------------------------------- delivered: scenario 2, step 4

/// Freeze suite, scenario 2, step 4 (the route): Ana pays 10,000 regtest
/// satoshis over Lightning to the conversion service, following its
/// standing offer; the order promises 9,900 on the chain to the owners'
/// split service within 6 blocks. The service receipts the first hop with
/// that forward, pays it on the chain, and the owners' receipt names the
/// service's. The route reads as one chain of receipts (Money rule 24);
/// the delivery is proven by the checker, which the core asks (Agreements
/// rule 11, F261); a verifier holding no checker for this cMIP: not proven
/// for it.
#[test]
fn a_rail_swap_lightning_in_onchain_out_delivered_by_its_deadline_is_proven() {
    let mut s = Story::new(swap_terms());
    let lo = agreements::Offer::decode(&s.w.v.get(&s.offer.id).unwrap().inside).unwrap().offer;
    assert!(matches!(lo.sold[0].class(), agreements::OfferClass::Proven { cmip, .. } if cmip == mor_conversion::spec()), "the access form: a proven offer");
    let (c, order) = s.order("ana's swap", 10_000, None, s.now() + 6);
    assert_eq!(order.forward.amount, sat(9_900), "1:1, less the fee of 100");
    acceptable(&s.offer, &order, &c, s.now()).expect("ana's client accepts the order before paying");
    let first = s.first(&c, s.pay_in(&c, "ana's swap"), Some(order.forward.clone()), "the service's receipt of ana's payment");
    assert_eq!(first.answer, Answer::Valid, "the first hop, valid on the Lightning rail");
    let (c2, p2) = s.pay_on(9_900, order.onward, "ana's swap, on");
    let onward = s.onward(&c2, p2, &first.id, true, "the owners' receipt of the onward payment");
    assert_eq!(onward.answer, Answer::Valid, "the onward hop, valid on the chain followed");
    let held = vec![first.clone(), onward.clone()];

    assert_eq!(route::ending_at(&onward.id, &held), Route::Complete { hops: vec![first.id, onward.id] }, "one chain of receipts, as its final creditor reads it");
    assert_eq!(route::from(&first.id, &held), Route::Complete { hops: vec![first.id, onward.id] });
    assert_eq!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Delivered { point: START + 1, onward: onward.id });
    assert_eq!(s.verdict(&order, &valid(&c), held.clone(), Some(&onward.id), true), ProofVerdict::Proven);
    assert!(matches!(s.verdict(&order, &valid(&c), held, Some(&onward.id), false), ProofVerdict::Unknown(_)), "no checker held: not proven here");
}

/// The swap the anchoring custody's question named (CQ1, option 1): the
/// payer and the next payee are one identity, paying itself on the chain
/// through the service. The route is the same chain of receipts.
#[test]
fn a_swap_to_the_payer_itself_reads_as_the_same_route() {
    let mut s = Story::new(swap_terms());
    // The owners' split service converts its own Lightning takings.
    s.ana = s.owners;
    let (c, order) = s.order("a swap to itself", 50_000, None, s.now() + 6);
    assert_eq!(c.payer, Some(Payer::Identity(order.forward.next_payee)), "the next payee is the payer");
    let first = s.first(&c, s.pay_in(&c, "a swap to itself"), Some(order.forward.clone()), "the service's receipt");
    let (c2, p2) = s.pay_on(49_900, order.onward, "a swap to itself, on");
    let onward = s.onward(&c2, p2, &first.id, true, "its own receipt of the coins");
    let held = vec![first.clone(), onward.clone()];
    assert_eq!(route::ending_at(&onward.id, &held), Route::Complete { hops: vec![first.id, onward.id] });
    assert_eq!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Delivered { point: START + 1, onward: onward.id });
}

// ---------------------------------------------------------------- forwarded nothing: scenario 2, step 4b

/// Freeze suite, scenario 2, step 4b: on a second payment the conversion
/// service fails to forward. Before the deadline is buried, pending; after
/// it, a default: the forward stays the service's open obligation, under
/// its offer (Money rule 27, was 9). The route stops at the service's
/// receipt, naming that hop and its agreement (rule 28, was 11). The
/// checker: not proven.
#[test]
fn a_hop_that_forwarded_nothing_owes_the_forward_under_the_offer() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (c, order) = s.order("ben's swap", 20_000, None, deadline);
    let first = s.first(&c, s.pay_in(&c, "ben's swap"), Some(order.forward.clone()), "the service's receipt of the second payment");
    let held = vec![first.clone()];
    assert_eq!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Pending, "the deadline not yet buried");
    assert!(matches!(s.verdict(&order, &valid(&c), held.clone(), None, true), ProofVerdict::Unknown(_)), "pending");
    bury(&mut s, deadline);
    let owed = Owed { debtor: s.service, forward: order.forward.clone(), declared_by: first.id };
    assert_eq!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Default { owed: owed.clone() });
    assert_eq!(route::from(&first.id, &held), Route::Stopped { hops: vec![first.id], owed: owed.clone(), near: vec![] }, "the receipts name the hop that failed and its agreement");
    assert_eq!(owed.forward.agreement, s.offer.id);
    assert!(matches!(s.verdict(&order, &valid(&c), held, None, true), ProofVerdict::NotProven(_)));
}

/// A service that signs no receipt of the first hop is not let off: the
/// payer's claim shows the money arrived (Money rule 11), and the order the
/// service signed binds the forward. Past the deadline, it is owed,
/// declared by the order.
#[test]
fn a_silent_service_still_owes_what_its_order_promised() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (c, order) = s.order("cal's swap", 5_000, None, deadline);
    let claim = Claim { rail: c.rail, proof: s.pay_in(&c, "cal's swap"), payee: c.payee, amount: c.amount, fulfils: c.fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None };
    let ln = Lightning;
    let answer = verify(Record::Claim(&claim, s.ana, &Citations::default()), &s.pointers, &Modules::new().adopt(&ln)).answer;
    assert_eq!(answer, Answer::Valid, "the payer's claim alone shows the money arrived");
    bury(&mut s, deadline);
    let paid = Payment { commitment: c.clone(), answer };
    assert_eq!(s.judge(&order, &paid, None, &[]), Judgment::Default { owed: Owed { debtor: s.service, forward: order.forward.clone(), declared_by: h("the order") } });
}

// ---------------------------------------------------------------- late, short, and not named

/// The forward paid after the deadline: the money reached its payee and the
/// route is complete, but the delivery is not what the order promised:
/// late, not proven.
#[test]
fn a_late_onward_payment_completes_the_route_but_is_not_proven() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (c, order) = s.order("dan's swap", 3_000, None, deadline);
    let first = s.first(&c, s.pay_in(&c, "dan's swap"), Some(order.forward.clone()), "the service's receipt");
    grow(&mut s.chain, 10);
    let (c2, p2) = s.pay_on(2_900, order.onward, "dan's swap, late");
    let onward = s.onward(&c2, p2, &first.id, true, "the owners' receipt, late");
    let held = vec![first.clone(), onward.clone()];
    assert_eq!(route::ending_at(&onward.id, &held), Route::Complete { hops: vec![first.id, onward.id] });
    assert_eq!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Late { point: START + 11, onward: onward.id });
    assert!(matches!(s.verdict(&order, &valid(&c), held, Some(&onward.id), true), ProofVerdict::NotProven(_)), "late");
}

/// Money rule 24: each hop's received amount equals the previous hop's
/// forward, and each receipt names the previous one (field 6, and its
/// `objects`). An onward receipt for less than the forward is not the
/// forward, nor one naming the service's receipt in field 6 alone: the
/// route stops at the service's hop, each shown beside it; past the
/// deadline, the forward is owed.
#[test]
fn an_onward_receipt_for_less_or_not_citing_the_previous_hop_is_not_the_forward() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (c, order) = s.order("eve's swap", 8_000, None, deadline);
    let first = s.first(&c, s.pay_in(&c, "eve's swap"), Some(order.forward.clone()), "the service's receipt");
    let (c2, p2) = s.pay_on(7_000, order.onward, "eve's swap, short");
    let short = s.onward(&c2, p2, &first.id, true, "a receipt for 7,000");
    let (c3, p3) = s.pay_on(7_900, order.onward, "eve's swap, uncited");
    let uncited = s.onward(&c3, p3, &first.id, false, "a receipt naming it in field 6 only");
    assert_eq!((short.answer.clone(), uncited.answer.clone()), (Answer::Valid, Answer::Valid), "both payments valid on their rail");
    let held = vec![first.clone(), short.clone(), uncited.clone()];
    let Route::Stopped { hops, owed, near } = route::from(&first.id, &held) else { panic!("stopped at the service's hop") };
    assert_eq!((hops, owed.debtor, owed.forward.amount), (vec![first.id], s.service, sat(7_900)));
    assert_eq!(near.iter().map(|(id, _)| *id).collect::<Vec<_>>(), {
        let mut v = vec![short.id, uncited.id];
        v.sort();
        v
    });
    assert!(matches!(route::ending_at(&short.id, &held), Route::Broken { at, .. } if at == short.id));
    bury(&mut s, deadline);
    assert!(matches!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Default { .. }));
}

/// The service's own receipt of the first hop declaring another forward
/// than the order it signed: two of its acts disagree, shown; the order's
/// forward is what is owed.
#[test]
fn the_services_receipt_contradicting_its_order_is_shown() {
    let s = Story::new(swap_terms());
    let (c, order) = s.order("fay's swap", 4_000, None, s.now() + 6);
    let mut less = order.forward.clone();
    less.amount = sat(3_000);
    let first = s.first(&c, s.pay_in(&c, "fay's swap"), Some(less), "a receipt declaring less");
    assert_eq!(s.judge(&order, &valid(&c), Some(&first), std::slice::from_ref(&first)), Judgment::Contradicted { owed: Owed { debtor: s.service, forward: order.forward.clone(), declared_by: h("the order") } });
}

// ---------------------------------------------------------------- the order and the terms

/// The order binds the forward before the money moves, and the payer's
/// client checks it against the offer: the payment follows the offer, to
/// the service, in its unit, at most its field 2; the forward is the
/// terms' rate less the fee, under the offer; the deadline within the
/// terms' blocks. A tip to the service's pointer buys no conversion.
#[test]
fn the_order_binds_the_forward_before_the_money_moves() {
    let s = Story::new(swap_terms());
    let now = s.now();
    let (c, order) = s.order("gus's swap", 1_000, None, now + 6);
    acceptable(&s.offer, &order, &c, now).unwrap();
    let refused = |o: &Order, c: &Commitment| acceptable(&s.offer, o, c, now).unwrap_err();
    let mut o = order.clone();
    o.forward.amount = sat(1_000);
    assert!(refused(&o, &c).contains("the offer's terms make 900"), "the fee is taken");
    let mut o = order.clone();
    o.forward.agreement = h("another agreement");
    assert!(refused(&o, &c).contains("another agreement"));
    assert!(refused(&Order { deadline: now + 8, ..order.clone() }, &c).contains("within the terms' 6 blocks"));
    assert!(refused(&Order { quote: Some((2, 1)), ..order.clone() }, &c).contains("fixed"));
    let tip = Commitment { fulfils: s.service_pointer, ..c.clone() };
    assert!(refused(&Order { commitment: tip.hash(), ..order.clone() }, &tip).contains("tip"));
    let (big, o) = s.order("too much", 100_001, None, now + 6);
    assert!(ordered(&s.offer, &o, &big).unwrap_err().contains("at most 100000"));
    let (dust, o) = s.order("dust", 100, None, now + 6);
    assert!(ordered(&s.offer, &o, &dust).unwrap_err().contains("fee takes all"));
    assert!(ordered(&s.offer, &order, &Commitment { salt: [9; 16], ..c.clone() }).unwrap_err().contains("not the one the order names"));
    // Its acts' format: the order round-trips; the terms too.
    assert_eq!(Order::from_map(&order.to_map()), Some(order.clone()));
    assert_eq!(Terms::decode(&swap_terms().to_value()), Some(swap_terms()));
}

/// A rate source: under a quoted rate, each order quotes its own, no worse
/// than the offer's floor; the forward follows the quote.
#[test]
fn a_quoted_rate_no_worse_than_the_floor() {
    let s = Story::new(Terms { rate: Rate::Quoted { num: 99, den: 100 }, ..swap_terms() });
    let now = s.now();
    let (c, order) = s.order("hal's swap", 10_000, Some((995, 1_000)), now + 6);
    assert_eq!(order.forward.amount, sat(9_950 - 100));
    acceptable(&s.offer, &order, &c, now).unwrap();
    let (c, order) = s.order("ida's swap", 10_000, Some((98, 100)), now + 6);
    assert!(acceptable(&s.offer, &order, &c, now).unwrap_err().contains("worse than the offer's floor 99/100"));
    let (c, order) = s.order("jo's swap", 10_000, None, now + 6);
    assert!(acceptable(&s.offer, &order, &c, now).unwrap_err().contains("names its quote"));
}

/// Read as this cMIP's: a lone seller's offer selling exactly these terms,
/// on its own time reference, paid to its signer.
#[test]
fn a_conversion_offer_is_a_lone_sellers_selling_these_terms() {
    let s = Story::new(swap_terms());
    let good = swap_terms().standing_offer(sat(100_000), &clock::reference(Network::Regtest), None);
    assert!(Offer::read(h("x"), s.service, &good).is_ok());
    assert!(Offer::read(h("x"), s.service, &agreements::Offer { under: Some(h("a deal")), ..good.clone() }).is_err(), "co-owners' offer");
    assert!(Offer::read(h("x"), s.service, &agreements::Offer { time: None, ..good.clone() }).is_err(), "no time reference");
    assert!(Offer::read(h("x"), s.service, &agreements::Offer { paid: Some(agreements::Paid::Payee(h("someone else"))), ..good.clone() }).is_err(), "paid to another");
    let mut two = good.clone();
    two.sold.push(agreements::Sold::Vow(h("a vow")));
    assert!(Offer::read(h("x"), s.service, &two).is_err(), "sells something else too");
}

// ---------------------------------------------------------------- what the clock cannot place

/// An onward payment on a rail the offer's clock cannot read (Lightning,
/// on the Bitcoin clock) completes the route, but "by the deadline" cannot
/// be read: unknown, not proven (a stated cost of drafts 1 and 2).
#[test]
fn an_onward_payment_the_offers_clock_cannot_place_is_unknown() {
    let mut s = Story::new(Terms { out_rail: mor_lightning::spec(), ..swap_terms() });
    // The owners take Lightning too.
    let owners_node = secret("the owners' Lightning node, a test key");
    let op = PayeePointer { payee: s.owners, version: 1, previous: None, rails: vec![ln_rail(&owners_node)] };
    s.owners_pointer = h("the owners' Lightning pointer");
    s.pointers.0.push((s.owners_pointer, op));
    let (c, mut order) = s.order("kai's swap", 2_000, None, s.now() + 6);
    order.onward = s.owners_pointer;
    let first = s.first(&c, s.pay_in(&c, "kai's swap"), Some(order.forward.clone()), "the service's receipt");
    let c2 = Commitment { rail: mor_lightning::spec(), payee: s.owners, amount: sat(1_900), fulfils: s.owners_pointer, payer: Some(Payer::Identity(s.service)), paid_to: PaidTo::Flow { pointer: s.owners_pointer, rail: 0 }, salt: [3; 16], purchase: None };
    let preimage = h("kai's onward preimage");
    let ln = LnProof { invoice: invoice(&owners_node, 1_900_000, &c2.hash(), &preimage), preimage: Some(preimage) };
    let r = Receipt { rail: c2.rail, proof: Proof { paid_to: c2.paid_to, salt: c2.salt, rail: ln.encode() }.encode(), payer: c2.payer.clone(), payee: s.owners, amount: c2.amount, fulfils: c2.fulfils, previous: Some(first.id), forward: None, batch: None, purchase: None };
    let lnm = Lightning;
    let answer = verify(Record::Receipt(&r), &s.pointers, &Modules::new().adopt(&lnm)).answer;
    assert_eq!(answer, Answer::Valid);
    let onward = Hop::receipt(h("the owners' Lightning receipt"), r, vec![first.id], answer, None);
    let held = vec![first.clone(), onward.clone()];
    assert_eq!(route::ending_at(&onward.id, &held), Route::Complete { hops: vec![first.id, onward.id] });
    assert!(matches!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Unknown(_)));
}

// ---------------------------------------------------------------- question CV1, pinned

/// F267 (CV1, decided by Nobody, allegedly, 12 October 2026): the next
/// payee receives the forward and never signs a receipt. The service's own
/// claim of the onward payment names its receipt of the first hop (claim
/// field 10, and `objects`): "a valid receipt or claim of the next hop
/// names it" (Money rules 24 and 27), so the route is one chain, the
/// forward is not owed, and the delivery is proven. *Was pinned the other
/// way, as Money draft 7 read it before F267: the route stopped and the
/// forward stayed owed, though paid.*
#[test]
fn f267_a_silent_next_payee_the_services_claim_carries_the_forward_on() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (c, order) = s.order("lea's swap", 6_000, None, deadline);
    let first = s.first(&c, s.pay_in(&c, "lea's swap"), Some(order.forward.clone()), "the service's receipt");
    let (c2, p2) = s.pay_on(5_900, order.onward, "lea's swap, on");
    bury(&mut s, deadline);
    let claim = s.claim_on(&c2, p2, &first.id, true, "the service's claim of the onward payment");
    assert_eq!(claim.answer, Answer::Valid, "the service's claim: the forward's money arrived (rule 11)");
    let held = vec![first.clone(), claim.clone()];
    let chain = Route::Complete { hops: vec![first.id, claim.id] };
    assert_eq!(route::from(&first.id, &held), chain, "rule 24: a valid claim of the next hop names it");
    assert_eq!(route::ending_at(&claim.id, &held), chain, "read back from the claim, as the final creditor reads it");
    assert!(matches!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Delivered { onward, .. } if onward == claim.id), "delivered: nothing owed");
    assert_eq!(s.verdict(&order, &valid(&c), held, Some(&claim.id), true), ProofVerdict::Proven, "the checker proves it from the claim");
}

/// F267, mirroring a receipt (reading 4 of the conversion build): a claim
/// naming the previous hop's receipt in its field 10 but not in its act's
/// `objects` does not carry the forward on.
#[test]
fn f267_a_claim_not_citing_the_previous_hop_is_not_the_forward() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (c, order) = s.order("mia's swap", 6_000, None, deadline);
    let first = s.first(&c, s.pay_in(&c, "mia's swap"), Some(order.forward.clone()), "the service's receipt");
    let (c2, p2) = s.pay_on(5_900, order.onward, "mia's swap, on");
    bury(&mut s, deadline);
    let claim = s.claim_on(&c2, p2, &first.id, false, "a claim naming it in field 10 only");
    assert_eq!(claim.answer, Answer::Valid);
    let held = vec![first.clone(), claim.clone()];
    assert!(matches!(route::from(&first.id, &held), Route::Stopped { near, .. } if near.iter().any(|(id, _)| id == &claim.id)));
    assert!(matches!(s.judge(&order, &valid(&c), Some(&first), &held), Judgment::Default { .. }));
}

/// F267, bounded by Money rule 12 (one payment, one count): one onward
/// payment claimed by the service for two forwards serves neither. In two
/// swaps to the same next payee, for the same amount, the service pays on
/// once and claims the payment twice, each claim naming another first
/// hop: both routes stop, both forwards stay owed.
#[test]
fn f267_one_payment_claimed_for_two_forwards_serves_neither() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (ca, oa) = s.order("nia's swap", 6_000, None, deadline);
    let (cb, ob) = s.order("oto's swap", 6_000, None, deadline);
    assert_eq!(oa.forward, ob.forward, "the same forward twice: the same payee, amount and offer");
    let fa = s.first(&ca, s.pay_in(&ca, "nia's swap"), Some(oa.forward.clone()), "the service's receipt for nia");
    let fb = s.first(&cb, s.pay_in(&cb, "oto's swap"), Some(ob.forward.clone()), "the service's receipt for oto");
    let (c2, p2) = s.pay_on(5_900, oa.onward, "one onward payment");
    bury(&mut s, deadline);
    let xa = s.claim_on(&c2, p2.clone(), &fa.id, true, "the service's claim, naming nia's hop");
    let xb = s.claim_on(&c2, p2, &fb.id, true, "the service's claim of the same payment, naming oto's hop");
    assert_eq!((xa.answer.clone(), xb.answer.clone()), (Answer::Valid, Answer::Valid), "each claim alone verifies");
    assert_eq!(xa.payment, xb.payment, "one payment, as the rail Module tells payments apart (F200)");
    let held = vec![fa.clone(), fb.clone(), xa.clone(), xb.clone()];
    for (first, claim) in [(&fa, &xa), (&fb, &xb)] {
        match route::from(&first.id, &held) {
            Route::Stopped { near, .. } => assert!(near.iter().any(|(id, why)| id == &claim.id && why.contains("rule 12")), "{near:?}"),
            other => panic!("one payment served two forwards: {other:?}"),
        }
    }
    assert!(matches!(s.judge(&oa, &valid(&ca), Some(&fa), &held), Judgment::Default { .. }));
    assert!(matches!(s.judge(&ob, &valid(&cb), Some(&fb), &held), Judgment::Default { .. }));
    assert!(matches!(s.verdict(&oa, &valid(&ca), held, Some(&xa.id), true), ProofVerdict::NotProven(_)), "the checker sees the second claim of the payment");
}

/// F267 with Money rule 12: where the next payee does sign, its receipt
/// decides which forward a payment served; the service's claim of the same
/// payment naming another hop carries nothing on.
#[test]
fn f267_the_next_payees_receipt_decides_which_forward_a_payment_served() {
    let mut s = Story::new(swap_terms());
    let deadline = s.now() + 6;
    let (ca, oa) = s.order("pia's swap", 6_000, None, deadline);
    let (cb, ob) = s.order("quy's swap", 6_000, None, deadline);
    let fa = s.first(&ca, s.pay_in(&ca, "pia's swap"), Some(oa.forward.clone()), "the service's receipt for pia");
    let fb = s.first(&cb, s.pay_in(&cb, "quy's swap"), Some(ob.forward.clone()), "the service's receipt for quy");
    let (c2, p2) = s.pay_on(5_900, oa.onward, "one onward payment, receipted");
    bury(&mut s, deadline);
    let receipt = s.onward(&c2, p2.clone(), &fa.id, true, "the owners' receipt, naming pia's hop");
    let claim = s.claim_on(&c2, p2, &fb.id, true, "the service's claim of the same payment, naming quy's hop");
    let held = vec![fa.clone(), fb.clone(), receipt.clone(), claim.clone()];
    assert_eq!(route::from(&fa.id, &held), Route::Complete { hops: vec![fa.id, receipt.id] });
    assert!(matches!(route::from(&fb.id, &held), Route::Stopped { near, .. } if near.iter().any(|(id, why)| id == &claim.id && why.contains("rule 12"))));
    assert!(matches!(s.judge(&ob, &valid(&cb), Some(&fb), &held), Judgment::Default { .. }));
}
