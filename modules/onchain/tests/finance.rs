//! The on-chain rail against Finance's rules, offline, over the core
//! library's verifier and Law view:
//!
//! - **vault limits per unit** (rule 14a, F114): a vault holding the same
//!   unit on Lightning and on-chain takes the smaller limit, whichever rail
//!   the payer has; a unit the vault does not cover is undeliverable;
//! - **the theft rule** (rule 15: anchor or bear the loss, F169, F176 to
//!   F181) on a rail where the claim written at payment is pending: on a
//!   clock that is not Bitcoin, the earliest anchor among the payer's claims
//!   of the same payment counts once one is valid (F203); on the Bitcoin
//!   clock, the payment's own block is its anchor (F201, F202);
//! - **one payment, two proofs** (rules 8a, 10): the same transaction mined
//!   again after a reorganisation is one payment, as the rail Module says
//!   (F200).
//!
//! Questions 2 and 3 of `docs/onchain-rail-step-12a.md` were decided as
//! F200 to F203; these tests pin the decisions. Test identities and regtest
//! units only.

#[path = "../../../core/tests/common/mod.rs"]
mod common;
mod support;

use common::{home, Person, Rot, World};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::envelope::anchoring::{Anchor, AnchoringCmip, Anchors, Reference};
use mor_core::finance::{self as fin, Amount, Choice, Citations, Claim, Clock, Holding, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt, Undeliverable, VaultEntry};
use mor_core::hash::{tagged_hash, Hash};
use mor_core::identity::Payload as Id;
use mor_core::law::{self, LawView, Mips};
use mor_core::sig::{self, SchnorrKey, Verdict};
use mor_onchain::chain::HeaderChain;
use mor_onchain::{block, unit, Block, Network, Onchain, OnchainProof, Paid};
use mor_payment::{paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, RailModule, Record};
use std::collections::{BTreeMap, BTreeSet};
use support::{bytes, h, mine, mine_on, request, tx, Keys, N, REGTEST_BITS};

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
    let onchain = Onchain::offline();
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
    /// Claims whose rail answer is pending, with a transaction shown.
    rail_pending: BTreeSet<Hash>,
    /// The payment each proof is, as the rail Module says (F200).
    payments: BTreeMap<Vec<u8>, Vec<u8>>,
    /// Clock and rail Modules where the clock reads the rail's proof as
    /// the payment's anchor (F201).
    rail_clocks: BTreeSet<(Hash, Hash)>,
    /// The chain the verifier follows (F204).
    chain: HeaderChain,
    main: Clockwork,
    payee: Hash,
}

fn story(w: World, main: Clockwork, payee: Hash) -> Story {
    let chain = support::chain(&[mine(h("the chain so far"), &[h("a block")], REGTEST_BITS, 1)]);
    Story { w, anchors: Anchors::new(), rail_valid: BTreeMap::new(), rail_pending: BTreeSet::new(), payments: BTreeMap::new(), rail_clocks: BTreeSet::new(), chain, main, payee }
}

impl Story {
    fn view(&self) -> LawView<'_> {
        let mut v = LawView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.rail_pending = self.rail_pending.clone();
        v.payments = self.payments.clone();
        v.rail_clocks = self.rail_clocks.clone();
        v.anchored = self.anchors.clone();
        v
    }

    /// What a Law client states of a record it checked: its rail answer,
    /// and, where the rail shows a payment, which payment it is (F200).
    fn state(&mut self, id: Hash, rec: &Record, answer: &Answer) {
        let onchain = Onchain::on(&self.chain);
        let modules = Modules::new().adopt(&onchain);
        match answer {
            Answer::Valid => {
                self.rail_valid.insert(id, paid_at(rec).unwrap());
            }
            Answer::Pending(_) => {
                self.rail_pending.insert(id);
            }
            _ => return,
        }
        let proof = match rec {
            Record::Receipt(r) => r.proof.clone(),
            Record::Claim(c, ..) => c.proof.clone(),
        };
        if let Some(p) = mor_payment::payment(rec, &modules) {
            self.payments.insert(proof, p);
        }
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
        let rec = Record::Claim(&claim, payer.id, &Citations::default());
        let answer = self.verify(&rec);
        self.state(id, &rec, &answer);
        (id, answer)
    }

    /// The payee's receipt carrying `rail_proof`, held, with its rail answer.
    fn receipt(&mut self, payee: &mut Person, payer: Hash, debt: Hash, paid_to: PaidTo, salt: [u8; 16], amount: Amount, rail_proof: &OnchainProof) -> (Hash, Answer) {
        let proof = Proof { paid_to, salt, rail: rail_proof.encode() }.encode();
        let r = Receipt { rail: mor_onchain::spec(), proof, payer: Some(Payer::Identity(payer)), payee: self.payee, amount, fulfils: debt, previous: None, forward: None, batch: None, purchase: None };
        let id = self.act(payee, mips().finance, fin::types::RECEIPT, Payload::Receipt(r.clone()).to_map(), None, None);
        let rec = Record::Receipt(&r);
        let answer = self.verify(&rec);
        self.state(id, &rec, &answer);
        (id, answer)
    }

    /// The rail's answer for a record, on the chain the verifier follows.
    fn verify(&self, rec: &Record) -> Answer {
        let onchain = Onchain::on(&self.chain);
        let held = LawHeld { view: self.view() };
        verify(rec.clone(), &held, &Modules::new().adopt(&onchain)).answer
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
        OnchainProof { request: self.request, confirmations: None, paid: Some(Paid { tx: self.tx.clone(), output: 0, block: None }) }
    }
    /// Mined on the tip of `chain`, second in its block, with six headers
    /// added to the chain.
    fn confirmed(&self, chain: &mut HeaderChain) -> OnchainProof {
        self.mined_in(chain, N)
    }
    /// Mined on the tip of `chain`, with `n` headers in all.
    fn mined_in(&self, chain: &mut HeaderChain, n: usize) -> OnchainProof {
        let txid = support::txid(&self.tx);
        let txids = [h("a coinbase"), txid, h("another payment")];
        let headers = mine_on(chain, &txids, n);
        OnchainProof { request: self.request, confirmations: None, paid: Some(Paid { tx: self.tx.clone(), output: 0, block: Some(Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers }) }) }
    }
}

// ---------------------------------------------------------------- the theft rule, with a pending claim

/// Ana, her home, a vault, her on-chain flow cited by her signature on a
/// label's deal, and a thief who re-points the flow and the deal: the
/// story, Ana, the label, her home's operator, the deal, the thief's
/// pointer, the thief's re-signature and keys. `clock` is Ana's declared
/// clock's main reference.
struct Theft {
    s: Story,
    ana: Person,
    label: Person,
    op: Person,
    deal: Hash,
    v2: Hash,
    resigned: Hash,
    thief_keys: Keys,
}

fn theft(main: Clockwork, clock: Reference) -> Theft {
    let mut w = World::new();
    let op = w.operator("Ana's home");
    let clock = Clock { main: clock, backup: None };
    let ana_vault = Keys::new("Ana's vault");
    let decls = vec![
        fin::clock_declaration(&mips().finance, &clock),
        fin::vault_declaration(&mips().finance, &[VaultEntry { unit: unit(Network::Regtest), rail_module: mor_onchain::spec(), source: ana_vault.address(Network::Regtest).encode(), limit: 50_000 }]),
    ];
    let mut ana = w.genesis_with("Ana", vec![home(&op)], None, None, Some(decls), 3);
    let aid = ana.id;
    let mut s = story(w, main, aid);
    let mut label = s.w.genesis("the label", vec![common::own_home()], None, None);
    let ana_flow = Keys::new("Ana's flow");
    let rail = |k: &Keys| vec![Rail { module: mor_onchain::spec(), address: k.address(Network::Regtest).encode() }];
    let v1 = s.act(&mut ana, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: aid, version: 1, previous: None, rails: rail(&ana_flow) }).to_map(), None, None);
    let deal = s.act(&mut label, mips().law, law::types::TERMS, vec![], None, None);
    let on = |t: Hash| Some(vec![Object { chain: t, predecessor: t }]);
    s.act(&mut label, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), None);
    s.act(&mut ana, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v1)]));
    let thief_keys = Keys::new("the thief's wallet");
    let mut thief = ana.clone();
    let v2 = s.act(&mut thief, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: aid, version: 2, previous: Some(v1), rails: rail(&thief_keys) }).to_map(), None, None);
    let resigned = s.act(&mut thief, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v2)]));
    Theft { s, ana, label, op, deal, v2, resigned, thief_keys }
}

impl Theft {
    /// Ana changes her locks: a rotation disowning the thief's acts, her
    /// home's receipt for it; the receipt is returned for anchoring.
    fn lock_change(&mut self) -> (Hash, Hash) {
        let (rot_act, _) = self.s.w.rotation(&self.ana, Rot { disowned: Some(vec![self.v2, self.resigned]), ..Default::default() });
        let rot = rot_act.id();
        self.s.w.add(&rot_act);
        let receipt = self.s.w.receipt(&mut self.op, &self.ana.id, &rot, 1);
        assert_eq!(self.s.w.v.status(&self.v2), Status::Void);
        (rot, receipt)
    }
}

/// F203, on a clock that is not Bitcoin (a clock service): the label pays
/// two royalties on-chain to the thief's address in the window, writing and
/// anchoring each claim at payment, at 100: pending. Ana changes her locks;
/// the point is 160. One payment confirms before (its valid claim anchored
/// at 120), the other after (170). The earliest anchor among the payer's
/// claims of the same payment counts once one of them is valid: both
/// count. *Under draft 1's reading the second counted for nothing, the
/// payer bearing (question 2 of the step 12a report).*
#[test]
fn on_a_clock_that_is_not_bitcoin_the_earliest_claim_of_the_same_payment_counts_once_one_is_valid() {
    let main = Clockwork::new("a clock service");
    let reference = main.reference();
    let mut t = theft(main, reference);
    let aid = t.ana.id;
    let to_thief = PaidTo::Flow { pointer: t.v2, rail: 0 };
    let d1 = t.s.debt(&mut t.label, t.deal, 20_000, t.v2);
    let d2 = t.s.debt(&mut t.label, t.deal, 20_000, t.v2);
    let p1 = OnchainPayment::new(aid, t.label.id, d1, to_thief, &t.thief_keys, sat(20_000), "the label's coins, 1");
    let p2 = OnchainPayment::new(aid, t.label.id, d2, to_thief, &t.thief_keys, sat(20_000), "the label's coins, 2");
    let (pending1, a) = t.s.claim(&mut t.label, d1, to_thief, p1.salt, sat(20_000), &p1.unconfirmed());
    assert!(matches!(a, Answer::Pending(_)), "{a:?}");
    t.s.anchor(pending1, 100);
    let (pending2, _) = t.s.claim(&mut t.label, d2, to_thief, p2.salt, sat(20_000), &p2.unconfirmed());
    t.s.anchor(pending2, 100);
    assert_eq!(t.s.view().paid_toward(&d1), 0, "pending: nothing counts yet (Finance rule 4)");

    let proof2 = p2.confirmed(&mut t.s.chain);
    let (confirmed2, a) = t.s.claim(&mut t.label, d2, to_thief, p2.salt, sat(20_000), &proof2);
    assert_eq!(a, Answer::Valid);
    t.s.anchor(confirmed2, 120);

    let (rot, receipt) = t.lock_change();
    t.s.anchor(receipt, 160);
    let q = t.s.w.v.quorum(&aid, &rot).unwrap();
    assert_eq!(fin::quorum_point(&q, &rot, &t.s.anchors, &t.s.main.reference()), Some(160));

    let proof1 = p1.confirmed(&mut t.s.chain);
    let (confirmed1, a) = t.s.claim(&mut t.label, d1, to_thief, p1.salt, sat(20_000), &proof1);
    assert_eq!(a, Answer::Valid);
    t.s.anchor(confirmed1, 170);

    assert_eq!(t.s.view().paid_toward(&d2), 20_000);
    assert_eq!(t.s.view().paid_toward(&d1), 20_000, "F203: the claim anchored at payment, 100, counts once the same payment is valid");
    // Without its pending claim's anchor, the payment confirmed after the
    // point would count for nothing.
    let mut v = t.s.view();
    v.rail_pending.clear();
    assert_eq!(v.paid_toward(&d1), 0);
}

// ---------------------------------------------------------------- one payment, two proofs

/// F200: a payment confirmed six times, then moved by a reorganisation into
/// another block, where it is confirmed six times again. Bob's receipt
/// carries the first proof, checked while that block was on the chain his
/// verifier followed; the label's claim the second, checked on the chain
/// after the reorganisation. The rail Module says both are the same
/// payment (the same output), and Finance counts it once. *Under draft 1
/// it counted twice (question 3 of the step 12a report).*
#[test]
fn one_payment_mined_again_after_a_reorganisation_counts_once() {
    let mut w = World::new();
    let op = w.operator("Bob's home");
    let mut bob = w.genesis("Bob", vec![home(&op)], None, None);
    let bid = bob.id;
    let mut s = story(w, Clockwork::new("a clock"), bid);
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
    // Two branches from the same chain: the first, then a longer one.
    let fork_point = s.chain.clone();
    let first = p.confirmed(&mut s.chain);
    let (_, a) = s.receipt(&mut bob, label.id, debt, to_bob, p.salt, sat(1_000), &first);
    assert_eq!(a, Answer::Valid);
    assert_eq!(s.view().paid_toward(&debt), 1_000);
    let old_chain = std::mem::replace(&mut s.chain, fork_point);
    support::grow(&mut s.chain, 1);
    let again = p.mined_in(&mut s.chain, N + 2);
    // The proof the label holds carries exactly six headers.
    let again = { let mut x = again; x.paid.as_mut().unwrap().block.as_mut().unwrap().headers.truncate(N); x };
    assert_ne!(first.block_hash(), again.block_hash(), "two blocks");
    assert_eq!(first.payment(), again.payment(), "one payment: the same output");
    let (_, a) = s.claim(&mut label, debt, to_bob, p.salt, sat(1_000), &again);
    assert_eq!(a, Answer::Valid, "the second proof, valid on the chain now followed");
    assert_eq!(s.view().paid_toward(&debt), 1_000, "F200: one payment of 1,000, counted once");
    // A verifier that states no payments compares proofs' bytes, as draft
    // 1 did, and counts it twice: the caller must state them.
    let mut v = s.view();
    v.payments.clear();
    assert_eq!(v.paid_toward(&debt), 2_000);
    drop(v);
    // The first proof, checked again on the chain now followed, is no
    // longer valid: its block is off the chain (F204). See the build
    // report's question on F204 and F205.
    let r = Receipt { rail: mor_onchain::spec(), proof: Proof { paid_to: to_bob, salt: p.salt, rail: first.encode() }.encode(), payer: Some(Payer::Identity(label.id)), payee: bid, amount: sat(1_000), fulfils: debt, previous: None, forward: None, batch: None, purchase: None };
    assert!(matches!(s.verify(&Record::Receipt(&r)), Answer::Unknown(_)));
    let s_old = Onchain::on(&old_chain);
    let held = LawHeld { view: s.view() };
    assert_eq!(verify(Record::Receipt(&r), &held, &Modules::new().adopt(&s_old)).answer, Answer::Valid, "on the chain it was counted on");
}

// ---------------------------------------------------------------- the Bitcoin clock

/// F201, F202: where the owner's clock is Bitcoin (the Bitcoin clock
/// Module, under the anchoring cMIP), an on-chain payment's proof is that
/// payment's anchor, its point the block, provided it passes the clock
/// Module's check (the rail's rule, on the chain the verifier follows, at
/// the same depth, F205). Rule 15 then compares "the payment's block before
/// or at the lock change's block", with no claim act in between.
///
/// Two royalties to the thief's address in the window. The first is mined
/// before the lock change's block and confirmed after it: it counts (on a
/// clock service it needed its pending claim's anchor; here it needs
/// nothing). The second is the review's attack: a transaction signed and
/// held back, its pending claim anchored on Bitcoin before the lock change,
/// broadcast after it: on the Bitcoin clock a pending claim's anchor counts
/// for nothing, and its block is after the point: it does not count. Its
/// counterpart on a clock service is F203's stated cost.
#[test]
fn on_the_bitcoin_clock_the_payments_block_is_its_anchor() {
    use mor_onchain::clock::{self, BitcoinClock};
    let reference = clock::reference(Network::Regtest);
    let mut t = theft(Clockwork::new("unused"), reference.clone());
    t.s.rail_clocks.insert(clock::reads());
    let aid = t.ana.id;
    let to_thief = PaidTo::Flow { pointer: t.v2, rail: 0 };
    let d1 = t.s.debt(&mut t.label, t.deal, 20_000, t.v2);
    let d2 = t.s.debt(&mut t.label, t.deal, 20_000, t.v2);
    let p1 = OnchainPayment::new(aid, t.label.id, d1, to_thief, &t.thief_keys, sat(20_000), "the label's coins, 1");
    let p2 = OnchainPayment::new(aid, t.label.id, d2, to_thief, &t.thief_keys, sat(20_000), "coins held back");
    // Both pending claims written at payment, anchored on Bitcoin at once
    // (a batch, step 14a: stated here) at the tip's height.
    let (pending1, _) = t.s.claim(&mut t.label, d1, to_thief, p1.salt, sat(20_000), &p1.unconfirmed());
    let (pending2, a) = t.s.claim(&mut t.label, d2, to_thief, p2.salt, sat(20_000), &p2.unconfirmed());
    assert!(matches!(a, Answer::Pending(_)));
    let now = t.s.chain.tip();
    for x in [pending1, pending2] {
        t.s.anchors.add(&Anchor { act: x, reference: reference.clone(), point: now });
    }
    // The first is mined in the next block, with two headers on it so far.
    let mined1 = p1.mined_in(&mut t.s.chain, 2);
    let block1 = mined1.height_on(&t.s.chain).unwrap();
    // Ana changes her locks; her home's receipt lands in the block after.
    let (rot, receipt) = t.lock_change();
    let point = t.s.chain.tip();
    assert!(block1 < point);
    t.s.anchors.add(&Anchor { act: receipt, reference: reference.clone(), point });
    let q = t.s.w.v.quorum(&aid, &rot).unwrap();
    assert_eq!(fin::quorum_point(&q, &rot, &t.s.anchors, &reference), Some(point));
    // The held-back transaction is broadcast and mined after the point.
    support::grow(&mut t.s.chain, 1);
    let mined2 = p2.mined_in(&mut t.s.chain, N);
    let block2 = mined2.height_on(&t.s.chain).unwrap();
    assert!(block2 > point);
    support::grow(&mut t.s.chain, N);
    // The first's proof with six headers, read from the chain followed.
    let mut proof1 = mined1.clone();
    let headers = &mut proof1.paid.as_mut().unwrap().block.as_mut().unwrap().headers;
    headers.truncate(1);
    for k in 1..N as u64 {
        headers.push(t.s.chain.header_at(block1 + k).unwrap());
    }
    // The valid claims, written now. Each payment's proof is its anchor
    // where it passes the Bitcoin clock Module's check.
    let (valid1, a) = t.s.claim(&mut t.label, d1, to_thief, p1.salt, sat(20_000), &proof1);
    assert_eq!(a, Answer::Valid);
    let (valid2, a) = t.s.claim(&mut t.label, d2, to_thief, p2.salt, sat(20_000), &mined2);
    assert_eq!(a, Answer::Valid);
    let bitcoin = BitcoinClock { chain: &t.s.chain };
    for (id, proof, debt, salt, block) in [(valid1, &proof1, d1, p1.salt, block1), (valid2, &mined2, d2, p2.salt, block2)] {
        let c = Claim { rail: mor_onchain::spec(), proof: Proof { paid_to: to_thief, salt, rail: proof.encode() }.encode(), payee: aid, amount: sat(20_000), fulfils: debt, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        let held = LawHeld { view: t.s.view() };
        let anchor = bitcoin.payment_anchor(&id, &Record::Claim(&c, t.label.id, &Citations::default()), &held).expect("the clock Module's check passes");
        assert_eq!((anchor.reference.clone(), anchor.point), (reference.clone(), block), "the point is the block");
        t.s.anchors.add(&anchor);
    }
    assert_eq!(t.s.view().paid_toward(&d1), 20_000, "F201: mined before the lock change's block, it counts");
    assert_eq!(t.s.view().paid_toward(&d2), 0, "F201: mined after it, it does not; the pending claim anchored before counts for nothing on the Bitcoin clock");
    // Read as on a clock that cannot see the rail (F203), the claim
    // anchored before the point would protect it.
    let mut v = t.s.view();
    v.rail_clocks.clear();
    assert_eq!(v.paid_toward(&d2), 20_000);
    drop(v);
    // The clock Module refuses a proof its chain does not hold, and one
    // short of the depth (F205).
    let offchain = support::chain(&[mine(h("another chain"), &[h("x")], REGTEST_BITS, 9)]);
    let held = LawHeld { view: t.s.view() };
    let c1 = Claim { rail: mor_onchain::spec(), proof: Proof { paid_to: to_thief, salt: p1.salt, rail: mined1.encode() }.encode(), payee: aid, amount: sat(20_000), fulfils: d1, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
    assert!(bitcoin.payment_anchor(&pending1, &Record::Claim(&c1, t.label.id, &Citations::default()), &held).is_none(), "two headers: not yet an anchor");
    let c1 = Claim { proof: Proof { paid_to: to_thief, salt: p1.salt, rail: proof1.encode() }.encode(), ..c1 };
    assert!(BitcoinClock { chain: &offchain }.payment_anchor(&valid1, &Record::Claim(&c1, t.label.id, &Citations::default()), &held).is_none(), "not on the chain the verifier follows");
}

/// The anchoring service, step 14a, as a test makes it: `act`'s leaf (with
/// its blind) among others in a batch, the root committed by pay-to-contract
/// to the service's key in a transaction mined on the tip of `chain` with
/// `n` headers: the act's batch anchor on the Bitcoin clock.
fn batch_anchor_of(chain: &mut HeaderChain, act: &Hash, n: usize) -> Vec<u8> {
    use mor_anchoring::tree::{self, Batch};
    use mor_onchain::clock::BatchAnchor;
    let blind = h("the owner's blind for its lock change's receipt");
    let leaves = vec![h("another payer's leaf"), tree::leaf(act, &blind), h("a third leaf")];
    let batch = Batch::new(leaves).unwrap();
    let key = support::xonly(&support::secret("the anchoring service's key"));
    let out = mor_onchain::tx::taproot_script(&mor_onchain::p2c::pay_to_contract(&key, None, &batch.root()).unwrap());
    let t = bytes(&tx("the pool's coins", &[(out, 330)]));
    let txids = [h("a coinbase"), support::txid(&t)];
    let headers = mine_on(chain, &txids, n);
    BatchAnchor { blind, index: 1, count: 3, branch: batch.branch(1).unwrap(), key, tree: None, tx: t, output: 0, block: Some(Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers }) }.encode()
}

/// Step 14a makes rule 15 work on the Bitcoin clock (F177, F180, F201;
/// reading 4 of F220): the lock change's point is its home receipt's batch
/// anchor, checked by the Bitcoin clock Module through the core's anchoring
/// interface, with no anchor stated by hand. A royalty mined before the
/// batch's block counts; one mined after it does not. And the cost of what
/// selective delay leaves (review section 9, item 3): a service that holds
/// the receipt back for its tier's two blocks moves the point two blocks
/// later, and a payment to the thief mined in between counts against the
/// owner.
#[test]
fn on_the_bitcoin_clock_a_lock_changes_point_is_its_home_receipts_batch_anchor() {
    use mor_onchain::clock::{self, BitcoinClock};
    let reference = clock::reference(Network::Regtest);
    for delay in [0usize, 2] {
        let mut t = theft(Clockwork::new("unused"), reference.clone());
        t.s.rail_clocks.insert(clock::reads());
        let aid = t.ana.id;
        let to_thief = PaidTo::Flow { pointer: t.v2, rail: 0 };
        let d1 = t.s.debt(&mut t.label, t.deal, 20_000, t.v2);
        let d2 = t.s.debt(&mut t.label, t.deal, 20_000, t.v2);
        let p1 = OnchainPayment::new(aid, t.label.id, d1, to_thief, &t.thief_keys, sat(20_000), "the label's coins, 1");
        let p2 = OnchainPayment::new(aid, t.label.id, d2, to_thief, &t.thief_keys, sat(20_000), "the label's coins, 2");
        // Ana changes her locks and pays for her home's receipt to be
        // anchored at the urgent tier. The first royalty is mined in the
        // next block; the service anchors the receipt after `delay` more.
        let (rot, receipt) = t.lock_change();
        let proof1 = p1.mined_in(&mut t.s.chain, 1);
        let block1 = proof1.height_on(&t.s.chain).unwrap();
        let proof2 = if delay > 0 { Some(p2.mined_in(&mut t.s.chain, 1)) } else { None };
        support::grow(&mut t.s.chain, delay.saturating_sub(1));
        let anchor = batch_anchor_of(&mut t.s.chain, &receipt, N);
        let point = t.s.chain.tip() - N as u64 + 1;
        assert!(t.s.anchors.add_proof(&BitcoinClock { chain: &t.s.chain }, &reference, &receipt, &anchor), "the batch anchor passes the Bitcoin clock Module's check");
        assert_eq!(t.s.anchors.earliest(&receipt, &reference), Some(point));
        let q = t.s.w.v.quorum(&aid, &rot).unwrap();
        assert_eq!(fin::quorum_point(&q, &rot, &t.s.anchors, &reference), Some(point), "the point is the batch's block");
        // Without a delay, the second royalty is mined after the point.
        let proof2 = proof2.unwrap_or_else(|| {
            support::grow(&mut t.s.chain, 1);
            p2.mined_in(&mut t.s.chain, 1)
        });
        let block2 = proof2.height_on(&t.s.chain).unwrap();
        support::grow(&mut t.s.chain, N);
        let bitcoin_chain = t.s.chain.clone();
        let deep = |p: &OnchainProof, at: u64| {
            let mut p = p.clone();
            let hs = &mut p.paid.as_mut().unwrap().block.as_mut().unwrap().headers;
            for k in 1..N as u64 {
                hs.push(bitcoin_chain.header_at(at + k).unwrap());
            }
            p
        };
        for (debt, p, salt, at) in [(d1, &proof1, p1.salt, block1), (d2, &proof2, p2.salt, block2)] {
            let full = deep(p, at);
            let (id, a) = t.s.claim(&mut t.label, debt, to_thief, salt, sat(20_000), &full);
            assert_eq!(a, Answer::Valid);
            let c = Claim { rail: mor_onchain::spec(), proof: Proof { paid_to: to_thief, salt, rail: full.encode() }.encode(), payee: aid, amount: sat(20_000), fulfils: debt, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
            let held = LawHeld { view: t.s.view() };
            let pa = BitcoinClock { chain: &bitcoin_chain }.payment_anchor(&id, &Record::Claim(&c, t.label.id, &Citations::default()), &held).unwrap();
            t.s.anchors.add(&pa);
        }
        assert!(block1 <= point);
        assert_eq!(t.s.view().paid_toward(&d1), 20_000, "mined before the batch's block: it counts");
        if delay == 0 {
            assert!(block2 > point);
            assert_eq!(t.s.view().paid_toward(&d2), 0, "mined after the batch's block: it does not");
        } else {
            assert!(block2 <= point);
            assert_eq!(t.s.view().paid_toward(&d2), 20_000, "held back {delay} blocks, the receipt's point lets a payment to the thief count: the stated cost of selective delay within a tier");
        }
    }
}
