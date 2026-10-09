//! The on-chain rail against Finance's rules, offline, over the core
//! library's verifier and Law view:
//!
//! - **vault limits per unit** (rule 14a, F114): a vault holding the same
//!   unit on Lightning and on-chain takes the smaller limit, whichever rail
//!   the payer has; a unit the vault does not cover is undeliverable;
//! - **the theft rule** (rule 15: anchor or bear the loss, F169, F176 to
//!   F181) on a rail where the claim written at payment is pending: a payer
//!   that paid and anchored its claim before the lock change, but whose
//!   payment was confirmed only after the lock change's point, is not
//!   protected under the rules as they stand (question 2 of
//!   `docs/onchain-rail-step-12a.md`);
//! - **one payment, two proofs** (rules 8a, 10): the same transaction mined
//!   again after a reorganisation has a second valid proof, and Finance
//!   counts it as a second payment (question 3).
//!
//! The last two tests assert what the rules do today, not what they should
//! do: Finance is silent, and Nobody, allegedly, decides. Test identities
//! and regtest units only.

#[path = "../../../core/tests/common/mod.rs"]
mod common;
mod support;

use common::{home, Person, Rot, World};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::envelope::anchoring::{AnchoringCmip, Anchors, Reference};
use mor_core::finance::{self as fin, Amount, Choice, Citations, Claim, Clock, Holding, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt, Undeliverable, VaultEntry};
use mor_core::hash::{tagged_hash, Hash};
use mor_core::identity::Payload as Id;
use mor_core::law::{self, LawView, Mips};
use mor_core::sig::{self, SchnorrKey, Verdict};
use mor_onchain::{unit, Network, Onchain, OnchainProof, Paid};
use mor_payment::{paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, RailModule, Record};
use std::collections::BTreeMap;
use support::{bytes, confirm, confirm_on, h, request, tx, Keys, N};

fn mips() -> Mips {
    Mips {
        identity: common::identity_spec(),
        text: h("a text specification"),
        envelope: h("the envelope specification"),
        finance: common::finance_spec(),
        law: common::law_spec(),
        production: h("the production specification"),
    }
}

fn sat(n: u64) -> Amount {
    Amount { unit: unit(Network::Regtest), value: n }
}

// ---------------------------------------------------------------- rule 14a, across both rails

#[test]
fn a_vault_holding_one_unit_on_both_rails_takes_the_smaller_limit() {
    let (flow, safe) = (Keys::new("flow"), Keys::new("vault"));
    let pointer = PayeePointer {
        payee: h("payee"),
        version: 1,
        previous: None,
        rails: vec![Rail { module: mor_onchain::spec(), address: flow.address(Network::Regtest).encode() }],
    };
    // 10,000 on Lightning, 50,000 on-chain: the unit's limit is 10,000 (F114).
    let vault = vec![
        VaultEntry { unit: unit(Network::Regtest), rail_module: mor_lightning::spec(), source: b"a Lightning vault node".to_vec(), limit: 10_000 },
        VaultEntry { unit: unit(Network::Regtest), rail_module: mor_onchain::spec(), source: safe.address(Network::Regtest).encode(), limit: 50_000 },
    ];
    // A payer with an on-chain wallet only.
    let onchain = Onchain;
    let can_pay = |m: &Hash, a: &[u8], u: &Hash| m == &mor_onchain::spec() && onchain.unit(a) == Some(*u);
    assert_eq!(fin::choose(Some(&pointer), Some(&vault), &sat(10_000), can_pay), Choice::Flow(0));
    assert_eq!(fin::choose(Some(&pointer), Some(&vault), &sat(20_000), can_pay), Choice::Vault(1), "above the smaller limit: to the vault, on the rail the payer has");
    assert!(!fin::flow_followed_vault(Some(&vault), &sat(20_000)), "paid to the flow, it would not have followed the vault");
    // Signet satoshis: a unit the vault does not cover.
    let signet = Amount { unit: unit(Network::Signet), value: 500 };
    assert_eq!(fin::choose(Some(&pointer), Some(&vault), &signet, can_pay), Choice::Undeliverable(Undeliverable::UnitNotCovered));
    // A vault entry with a limit of zero turns the flow off for the unit.
    let mut off = vault.clone();
    off[1].limit = 0;
    assert_eq!(fin::choose(Some(&pointer), Some(&off), &sat(1), can_pay), Choice::Vault(1));
}

// ---------------------------------------------------------------- the clocks

/// A test anchoring cMIP: a clock service signs `(act, point)`, as in the
/// Lightning rail's stolen-phone story. Experimental, tests only.
struct Clockwork {
    key: SchnorrKey,
}

impl Clockwork {
    fn new(name: &str) -> Self {
        Clockwork { key: SchnorrKey::from_secret(&h(name)).unwrap() }
    }
    fn reference(&self) -> Reference {
        Reference { cmip: h("a test anchoring cMIP"), params: Value::Bytes(self.key.public().to_vec()) }
    }
    fn message(act: &Hash, point: u64) -> Hash {
        let mut m = act.to_vec();
        m.extend(point.to_be_bytes());
        tagged_hash("MOR/test/anchor", &m)
    }
    fn proof(&self, act: &Hash, point: u64) -> Vec<u8> {
        let mut p = point.to_be_bytes().to_vec();
        p.extend(self.key.sign(&Self::message(act, point), &[0; 32]).sig);
        p
    }
}

struct TestAnchoring;

impl AnchoringCmip for TestAnchoring {
    fn spec(&self) -> Hash {
        h("a test anchoring cMIP")
    }
    fn verify(&self, act: &Hash, params: &Value, proof: &[u8]) -> Option<u64> {
        let Value::Bytes(key) = params else { return None };
        let point = u64::from_be_bytes(proof.get(..8)?.try_into().ok()?);
        let s = mor_core::act::Signature { scheme: mor_core::act::Scheme::Founding(1), key: key.clone(), sig: proof[8..].to_vec() };
        (sig::verify(&s, &Clockwork::message(act, point)) == Verdict::Valid).then_some(point)
    }
}

// ---------------------------------------------------------------- a Law client's Held

struct LawHeld<'a> {
    view: LawView<'a>,
}

impl LawHeld<'_> {
    fn fin(&self, id: &Hash) -> Option<(Payload, Hash)> {
        let x = self.view.v.get(id)?;
        if x.inside.spec != mips().finance {
            return None;
        }
        Some((Payload::decode(x.inside.type_, &x.inside.payload).ok()?, x.act.outside.signer?))
    }
}

impl Held for LawHeld<'_> {
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
        Some((who, fin::vault_in(&mips().finance, &decls).ok()??.unwrap_or_default()))
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
    fn voided_pointer(&self, id: &Hash) -> Option<(PayeePointer, Hash)> {
        if !matches!(self.view.v.status(id), Status::Void | Status::Disputed) {
            return None;
        }
        match self.fin(id)? {
            (Payload::PayeePointer(p), s) if s == p.payee => Some((p, self.view.v.judged_by(id)?)),
            _ => None,
        }
    }
    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>> {
        let res = self.view.v.resolve(payee);
        let mut out = None;
        for st in &res.states {
            if let Ok(Some(v)) = fin::vault_in(&mips().finance, &st.declarations) {
                out = v;
            }
        }
        out
    }
    fn payment_counts(&self, payee: &Hash, at: &PaidAt, amount: &Amount, proof: &[u8], fulfils: &Hash) -> Option<bool> {
        Some(self.view.payment_counts(payee, at, amount, proof, fulfils))
    }
}

// ---------------------------------------------------------------- the world

struct Story {
    w: World,
    anchors: Anchors,
    rail_valid: BTreeMap<Hash, PaidAt>,
    main: Clockwork,
    payee: Hash,
}

impl Story {
    fn view(&self) -> LawView<'_> {
        let mut v = LawView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.anchored = self.anchors.clone();
        v
    }

    fn anchor(&mut self, act: Hash, point: u64) {
        let (r, p) = (self.main.reference(), self.main.proof(&act, point));
        assert!(self.anchors.add_proof(&TestAnchoring, &r, &act, &p), "the anchoring cMIP checks its proof");
    }

    fn act(&mut self, p: &mut Person, spec: Hash, t: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>, refs: Option<Vec<Ref>>) -> Hash {
        let a = self.w.everyday_act_refs(p, spec, t, payload, objects, None, refs);
        self.w.add(&a)
    }

    fn debt(&mut self, label: &mut Person, deal: Hash, value: u64, named: Hash) -> Hash {
        let o = Payload::Obligation(Obligation { debtor: label.id, creditor: self.payee, amount: sat(value), pointer: named, agreement: Some(deal) });
        self.act(label, mips().finance, fin::types::OBLIGATION, o.to_map(), None, None)
    }

    /// Sign and hold a claim of `payer`'s carrying `rail_proof`; where the
    /// rail's answer is valid, hand it to the Law view as the caller states
    /// it. Returns the claim's act id and the rail's answer.
    fn claim(&mut self, payer: &mut Person, debt: Hash, paid_to: PaidTo, salt: [u8; 16], amount: Amount, rail_proof: &OnchainProof) -> (Hash, Answer) {
        let proof = Proof { paid_to, salt, rail: rail_proof.encode() }.encode();
        let claim = Claim { rail: mor_onchain::spec(), proof, payee: self.payee, amount, fulfils: debt, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        let id = self.act(payer, mips().finance, fin::types::CLAIM, Payload::Claim(claim.clone()).to_map(), None, None);
        let onchain = Onchain;
        let held = LawHeld { view: self.view() };
        let rec = Record::Claim(&claim, payer.id, &Citations::default());
        let answer = verify(rec.clone(), &held, &Modules::new().adopt(&onchain)).answer;
        if answer == Answer::Valid {
            self.rail_valid.insert(id, paid_at(&rec).unwrap());
        }
        (id, answer)
    }

    /// The payee's receipt carrying `rail_proof`, held, with its rail answer.
    fn receipt(&mut self, payee: &mut Person, payer: Hash, debt: Hash, paid_to: PaidTo, salt: [u8; 16], amount: Amount, rail_proof: &OnchainProof) -> (Hash, Answer) {
        let proof = Proof { paid_to, salt, rail: rail_proof.encode() }.encode();
        let r = Receipt { rail: mor_onchain::spec(), proof, payer: Some(Payer::Identity(payer)), payee: self.payee, amount, fulfils: debt, previous: None, forward: None, batch: None, purchase: None };
        let id = self.act(payee, mips().finance, fin::types::RECEIPT, Payload::Receipt(r.clone()).to_map(), None, None);
        let onchain = Onchain;
        let held = LawHeld { view: self.view() };
        let rec = Record::Receipt(&r);
        let answer = verify(rec.clone(), &held, &Modules::new().adopt(&onchain)).answer;
        if answer == Answer::Valid {
            self.rail_valid.insert(id, paid_at(&rec).unwrap());
        }
        (id, answer)
    }
}

/// What the payer's wallet holds of one on-chain payment as it goes: the
/// commitment's salt, the request, the transaction, and its proofs at each
/// stage.
struct OnchainPayment {
    salt: [u8; 16],
    request: [u8; 64],
    tx: Vec<u8>,
}

impl OnchainPayment {
    /// Ask the payee's side (`keys`) for a request committing to the
    /// payment, and make the transaction paying the address it gives.
    fn new(payee: Hash, payer: Hash, debt: Hash, paid_to: PaidTo, keys: &Keys, amount: Amount, coins: &str) -> Self {
        let salt = h(coins)[..16].try_into().unwrap();
        let c = Commitment { rail: mor_onchain::spec(), payee, amount, fulfils: debt, payer: Some(Payer::Identity(payer)), paid_to, salt, purchase: None };
        let a = keys.address(Network::Regtest);
        let t = bytes(&tx(coins, &[(a.script(&c.hash()).unwrap(), amount.value)]));
        OnchainPayment { salt, request: request(&keys.request, &c.hash()), tx: t }
    }
    fn unconfirmed(&self) -> OnchainProof {
        OnchainProof { request: self.request, paid: Some(Paid { tx: self.tx.clone(), output: 0, block: None }) }
    }
    fn confirmed_on(&self, previous: Hash) -> OnchainProof {
        OnchainProof { request: self.request, paid: Some(Paid { tx: self.tx.clone(), output: 0, block: Some(confirm_on(previous, &self.tx, N, support::REGTEST_BITS)) }) }
    }
    fn confirmed(&self) -> OnchainProof {
        OnchainProof { request: self.request, paid: Some(Paid { tx: self.tx.clone(), output: 0, block: Some(confirm(&self.tx, N)) }) }
    }
}

// ---------------------------------------------------------------- the theft rule, with a pending claim

/// Ana's on-chain flow, a deal with a label, a thief's window, and a lock
/// change between a payment and its confirmation.
#[test]
fn a_payment_confirmed_after_the_lock_change_is_not_protected_by_its_pending_claim_as_finance_stands() {
    let mut w = World::new();
    let mut op = w.operator("Ana's home");
    let main = Clockwork::new("the public chain");
    let clock = Clock { main: main.reference(), backup: None };
    let ana_vault = Keys::new("Ana's vault");
    let decls = vec![
        fin::clock_declaration(&mips().finance, &clock),
        fin::vault_declaration(&mips().finance, &[VaultEntry { unit: unit(Network::Regtest), rail_module: mor_onchain::spec(), source: ana_vault.address(Network::Regtest).encode(), limit: 50_000 }]),
    ];
    let mut ana = w.genesis_with("Ana", vec![home(&op)], None, None, Some(decls), 3);
    let aid = ana.id;
    let mut s = Story { w, anchors: Anchors::new(), rail_valid: BTreeMap::new(), main, payee: aid };
    let mut label = s.w.genesis("the label", vec![common::own_home()], None, None);

    // Ana's on-chain flow, and her signature on the label's deal citing it.
    let ana_flow = Keys::new("Ana's flow");
    let rail = |k: &Keys| vec![Rail { module: mor_onchain::spec(), address: k.address(Network::Regtest).encode() }];
    let v1 = s.act(&mut ana, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: aid, version: 1, previous: None, rails: rail(&ana_flow) }).to_map(), None, None);
    let deal = s.act(&mut label, mips().law, law::types::TERMS, vec![], None, None);
    let on = |t: Hash| Some(vec![Object { chain: t, predecessor: t }]);
    s.act(&mut label, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), None);
    s.act(&mut ana, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v1)]));

    // The phone is stolen: the thief's own Bitcoin keys become Ana's flow,
    // and the deal is re-pointed to them.
    let thief_keys = Keys::new("the thief's wallet");
    let mut thief = ana.clone();
    let v2 = s.act(&mut thief, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: aid, version: 2, previous: Some(v1), rails: rail(&thief_keys) }).to_map(), None, None);
    let resigned = s.act(&mut thief, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v2)]));
    let to_thief = PaidTo::Flow { pointer: v2, rail: 0 };

    // Two royalties, each paid on-chain to the thief's address in the
    // window, each claim written at the moment of payment and anchored at
    // once, at 100 (rule 15, client conformance): pending, unconfirmed.
    let d1 = s.debt(&mut label, deal, 20_000, v2);
    let d2 = s.debt(&mut label, deal, 20_000, v2);
    let p1 = OnchainPayment::new(aid, label.id, d1, to_thief, &thief_keys, sat(20_000), "the label's coins, 1");
    let p2 = OnchainPayment::new(aid, label.id, d2, to_thief, &thief_keys, sat(20_000), "the label's coins, 2");
    let (pending1, a) = s.claim(&mut label, d1, to_thief, p1.salt, sat(20_000), &p1.unconfirmed());
    assert!(matches!(a, Answer::Pending(_)), "{a:?}");
    s.anchor(pending1, 100);
    let (pending2, _) = s.claim(&mut label, d2, to_thief, p2.salt, sat(20_000), &p2.unconfirmed());
    s.anchor(pending2, 100);
    assert_eq!(s.view().paid_toward(&d1), 0, "pending: nothing counts yet (Finance rule 4)");

    // The second confirms quickly: its claim with six confirmations is
    // written and anchored at 120.
    let (confirmed2, a) = s.claim(&mut label, d2, to_thief, p2.salt, sat(20_000), &p2.confirmed());
    assert_eq!(a, Answer::Valid);
    s.anchor(confirmed2, 120);

    // Ana changes her locks: a rotation disowning the thief's acts; her
    // home receipts it, and her client anchors the receipt at 160: the lock
    // change's point.
    let (rot_act, _) = s.w.rotation(&ana, Rot { disowned: Some(vec![v2, resigned]), ..Default::default() });
    let rot = rot_act.id();
    s.w.add(&rot_act);
    let receipt = s.w.receipt(&mut op, &aid, &rot, 1);
    assert_eq!(s.w.v.resolve(&aid).position_of(&rot), Some(1));
    assert_eq!(s.w.v.status(&v2), Status::Void);
    s.anchor(receipt, 160);
    let q = s.w.v.quorum(&aid, &rot).unwrap();
    assert_eq!(fin::quorum_point(&q, &rot, &s.anchors, &s.main.reference()), Some(160));

    // The first payment confirms only now; its valid claim is written and
    // anchored at 170, after the point.
    let (confirmed1, a) = s.claim(&mut label, d1, to_thief, p1.salt, sat(20_000), &p1.confirmed());
    assert_eq!(a, Answer::Valid);
    s.anchor(confirmed1, 170);

    // As Finance stands: the second counts (its valid claim is anchored
    // before the point); the first does not, though the label paid at the
    // same moment and anchored its claim at 100. Rule 15 reads the claims
    // that carry the payment's valid proof (`payers_claims`); the claim
    // written at payment carries a pending proof, other bytes.
    assert_eq!(s.view().paid_toward(&d2), 20_000);
    assert_eq!(s.view().paid_toward(&d1), 0, "QUESTION 2: the claim anchored at payment was pending; the valid one came after the point");
    assert!(s.view().payers_claims(&Proof { paid_to: to_thief, salt: p1.salt, rail: p1.confirmed().encode() }.encode()) == vec![confirmed1]);
}

// ---------------------------------------------------------------- one payment, two proofs

/// A payment confirmed six times, then moved by a reorganisation into
/// another block, where it is confirmed six times again: both proofs are
/// valid by the rule, and Finance, which tells payments apart by their
/// proofs' bytes, counts it twice.
#[test]
fn one_payment_mined_again_after_a_reorganisation_counts_twice_as_finance_stands() {
    let mut w = World::new();
    let op = w.operator("Bob's home");
    let mut bob = w.genesis("Bob", vec![home(&op)], None, None);
    let bid = bob.id;
    let mut s = Story { w, anchors: Anchors::new(), rail_valid: BTreeMap::new(), main: Clockwork::new("a clock"), payee: bid };
    let mut label = s.w.genesis("the label", vec![common::own_home()], None, None);
    let flow = Keys::new("Bob's flow");
    let v1 = s.act(&mut bob, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: bid, version: 1, previous: None, rails: vec![Rail { module: mor_onchain::spec(), address: flow.address(Network::Regtest).encode() }] }).to_map(), None, None);
    let deal = s.act(&mut label, mips().law, law::types::TERMS, vec![], None, None);
    let on = |t: Hash| Some(vec![Object { chain: t, predecessor: t }]);
    s.act(&mut label, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), None);
    s.act(&mut bob, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v1)]));

    // A debt of 2,000, and one payment of 1,000 toward it.
    let debt = s.debt(&mut label, deal, 2_000, v1);
    let to_bob = PaidTo::Flow { pointer: v1, rail: 0 };
    let p = OnchainPayment::new(bid, label.id, debt, to_bob, &flow, sat(1_000), "the label's coins");
    let (first, before) = (p.confirmed_on(h("the chain before")), p.confirmed_on(h("the chain after a reorganisation")));
    assert_ne!(first.block_hash(), before.block_hash(), "two blocks");
    assert_eq!(first.outpoint(), before.outpoint(), "one payment: the same output");

    // Bob receipts it in the first block; the label's claim, written after
    // the reorganisation, carries the second.
    let (_, a) = s.receipt(&mut bob, label.id, debt, to_bob, p.salt, sat(1_000), &first);
    assert_eq!(a, Answer::Valid);
    assert_eq!(s.view().paid_toward(&debt), 1_000);
    let (_, a) = s.claim(&mut label, debt, to_bob, p.salt, sat(1_000), &before);
    assert_eq!(a, Answer::Valid, "the rule sees each proof alone: both valid");
    assert_eq!(s.view().paid_toward(&debt), 2_000, "QUESTION 3: one payment of 1,000, counted twice, and the debt shows discharged");
}
