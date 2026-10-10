//! A hostile review of the on-chain rail Module, draft 1 (roadmap step 12a;
//! `docs/reviews/onchain-rail-review-2026-10-10.md`). Written to record what
//! the rule and Finance did, with the attacks that followed. *Rewritten
//! after F200 to F205 were built (`docs/onchain-rail-f200-f205-build-2026-10-10.md`):
//! the tests of findings 1 to 4 now pin the fixes; where a cost was
//! accepted instead of fixed (F203), the test pins it at the size found.*
//!
//! Test identities and regtest units only. The blocks are mined by
//! rust-bitcoin at regtest difficulty, as in `tests/rule.rs`.

#[path = "../../../core/tests/common/mod.rs"]
mod common;
mod support;

use bitcoin::hashes::Hash as _;
use bitcoin::{consensus, Transaction};
use common::{home, Person, Rot, World};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::envelope::anchoring::{AnchoringCmip, Anchors, Reference};
use mor_onchain::chain::HeaderChain;
use mor_core::finance::{self as fin, Amount, Citations, Claim, Clock, Holding, LockPoint, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry};
use mor_core::hash::{tagged_hash, Hash};
use mor_core::identity::Payload as Id;
use mor_core::law::{self, LawView, Mips};
use mor_core::sig::{self, SchnorrKey, Verdict};
use mor_onchain::{block, unit, Block, Network, Onchain, OnchainAddress, OnchainProof, Paid};
use mor_payment::{paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, RailInput, Record};
use std::collections::{BTreeMap, BTreeSet};
use support::{bytes, h, header_hash, mine, mine_on, request, tx, Keys, N, REGTEST_BITS};

fn sat(n: u64) -> Amount {
    Amount { unit: unit(Network::Regtest), value: n }
}

fn rule(a: &OnchainAddress, c: &Hash, amount: &Amount, p: &OnchainProof, chain: &HeaderChain) -> Answer {
    Onchain::rule(&RailInput { commitment: *c, amount, address: &a.encode(), rail_proof: &p.encode() }, Some(chain))
}

/// A regtest chain a verifier follows, its tip a block holding `txids`
/// with `n` headers in all: the chain, and the block's headers.
fn chain_over(txids: &[[u8; 32]], n: usize) -> (HeaderChain, Vec<[u8; 80]>) {
    let headers = headers_over(h("the chain so far"), txids, n);
    (support::chain(&headers), headers)
}

fn txid_of(t: &[u8]) -> [u8; 32] {
    consensus::deserialize::<Transaction>(t).unwrap().compute_txid().to_byte_array()
}

/// Six regtest headers on `previous`, the first committing to `txids`.
fn headers_over(previous: [u8; 32], txids: &[[u8; 32]], n: usize) -> Vec<[u8; 80]> {
    let mut headers = vec![mine(previous, txids, REGTEST_BITS, 1_790_000_000)];
    while headers.len() < n {
        let prev = header_hash(headers.last().unwrap());
        headers.push(mine(prev, &[h(&format!("coinbase {}", headers.len()))], REGTEST_BITS, 1_790_000_000 + headers.len() as u32));
    }
    headers
}

// ================================================================ 1. The proof and the rule

// ---------------------------------------------------------------- 1a. One payment, two proofs, no reorganisation

/// *Pinned after F200 (decided 10 October 2026): the proof is canonical.*
///
/// Bitcoin's Merkle tree duplicates the last node of every level with an
/// odd number of nodes (CVE-2012-2459). A transaction in such a position
/// has a second index whose branch is the same bytes: the sibling at that
/// level is the node itself. The review found the rule accepted both
/// indexes, so one payment had two valid proofs in one block. The rule now
/// accepts only one index where a node is duplicated: where the sibling at
/// a level equals the running hash, the index's bit at that level must be
/// 0 (the node's own position, not its copy). The twin is invalid.
#[test]
fn one_payment_has_one_valid_proof_in_its_block_where_its_merkle_node_is_duplicated() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a payment");
    let t = bytes(&tx("the payer's coins", &[(a.script(&c).unwrap(), 1_000)]));
    let txid = txid_of(&t);
    // Three transactions: the coinbase, another, and the payment last. The
    // tree has four leaves, the payment twice.
    let txids = [h("a coinbase"), h("another payment"), txid];
    let (chain, headers) = chain_over(&txids, N);
    let branch = block::merkle_branch(&txids, 2).unwrap();
    let root = block::merkle_root(&txid, 2, &branch).unwrap();
    assert_eq!(block::merkle_root(&txid, 3, &branch), Some(root), "index 3, the duplicate, still gives the same root: Bitcoin's tree is as it is");
    let proof_at = |index: u64| OnchainProof {
        request: request(&k.request, &c),
        confirmations: None,
        paid: Some(Paid { tx: t.clone(), output: 0, block: Some(Block { index, branch: branch.clone(), headers: headers.clone() }) }),
    };
    let (honest, twin) = (proof_at(2), proof_at(3));
    assert_eq!(rule(&a, &c, &sat(1_000), &honest, &chain), Answer::Valid);
    assert!(
        matches!(rule(&a, &c, &sat(1_000), &twin, &chain), Answer::Invalid(ref w) if w.contains("canonical")),
        "FIXED (F200): the duplicate index is no proof: {:?}",
        rule(&a, &c, &sat(1_000), &twin, &chain)
    );

    // Deeper: with five transactions the payment at index 4 has three
    // twins (5, 6 and 7) by the tree; only index 4 is a proof.
    let txids = [h("a coinbase"), h("b"), h("c"), h("d"), txid];
    let (chain, headers) = chain_over(&txids, N);
    let branch = block::merkle_branch(&txids, 4).unwrap();
    let valid: Vec<u64> = (0..8)
        .filter(|&i| {
            let p = OnchainProof {
                request: request(&k.request, &c),
                confirmations: None,
                paid: Some(Paid { tx: t.clone(), output: 0, block: Some(Block { index: i, branch: branch.clone(), headers: headers.clone() }) }),
            };
            rule(&a, &c, &sat(1_000), &p, &chain) == Answer::Valid
        })
        .collect();
    assert_eq!(valid, vec![4], "one payment, one index");
}

/// Which transactions of a block have such a twin: those whose node is the
/// duplicated last one at some level, by the structure of the tree. The
/// structural count is checked against a brute force over small blocks,
/// then printed for blocks of realistic sizes: it is not a rare case
/// needing a reorganisation; it is a few transactions in most blocks, and
/// a miner-payer chooses its position.
#[test]
fn how_often_a_payment_has_a_twin_proof() {
    fn twins_by_structure(n: usize) -> Vec<usize> {
        let mut out = vec![];
        for i in 0..n {
            let (mut count, mut pos) = (n, i);
            let mut twin = false;
            while count > 1 {
                if count % 2 == 1 && pos == count - 1 {
                    twin = true;
                }
                count = count.div_ceil(2);
                pos /= 2;
            }
            if twin {
                out.push(i);
            }
        }
        out
    }
    for n in 2..=40usize {
        let txids: Vec<[u8; 32]> = (0..n).map(|i| h(&format!("tx {i}"))).collect();
        let levels = (n as f64).log2().ceil() as u32;
        let mut by_force = vec![];
        for i in 0..n {
            let branch = block::merkle_branch(&txids, i).unwrap();
            let root = block::merkle_root(&txids[i], i as u64, &branch).unwrap();
            if (0..1u64 << levels).any(|j| j != i as u64 && block::merkle_root(&txids[i], j, &branch) == Some(root)) {
                by_force.push(i);
            }
        }
        assert_eq!(by_force, twins_by_structure(n), "{n} transactions");
    }
    for n in [3usize, 7, 101, 1_000, 2_001, 3_000, 4_095] {
        let t = twins_by_structure(n);
        eprintln!("a block of {n} transactions: {} have a twin proof ({:.2}%), among them indexes {:?}", t.len(), 100.0 * t.len() as f64 / n as f64, &t[..t.len().min(4)]);
    }
    let fractions: Vec<f64> = (1_000..=4_000usize).map(|n| twins_by_structure(n).len() as f64 / n as f64).collect();
    let mean = fractions.iter().sum::<f64>() / fractions.len() as f64;
    eprintln!("over blocks of 1,000 to 4,000 transactions, on average {:.1}% of transactions have a twin proof; in {:.0}% of block sizes at least 1% do", 100.0 * mean, 100.0 * fractions.iter().filter(|f| **f >= 0.01).count() as f64 / fractions.len() as f64);
    assert!(mean > 0.05, "blocks of ordinary size have transactions with twin proofs: about one in eight");
}

// ---------------------------------------------------------------- 1b. The headers: checked against the chain followed (F204)

/// *Pinned after F204.* The review found the rule read of a header only
/// that each names the one before, meets its own target, and is no easier
/// than a floor: six headers with six different targets, times running
/// backwards, building on a hash no chain ever had, answered valid. Now the
/// proof is checked against the headers of the chain the verifier follows,
/// handed to the rule as data: those forged headers, whatever their work,
/// are on no chain the verifier holds, and answer unknown, never valid.
#[test]
fn a_forged_header_chain_answers_unknown_whatever_its_work() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a payment");
    let t = bytes(&tx("coins", &[(a.script(&c).unwrap(), 1_000)]));
    let txids = [h("a coinbase"), txid_of(&t)];
    let bits = [0x207f_ffff, 0x1f7f_ffff, 0x2000_ffff, 0x1f00_ffff, 0x207f_ffff, 0x1f0f_ffff];
    let mut headers = vec![mine(h("no chain ever had this hash"), &txids, bits[0], 2_000_000_000)];
    for (i, b) in bits.iter().enumerate().skip(1) {
        let prev = header_hash(headers.last().unwrap());
        headers.push(mine(prev, &[h(&format!("cb {i}"))], *b, 2_000_000_000 - 1_000 * i as u32));
    }
    let p = OnchainProof {
        request: request(&k.request, &c),
        confirmations: None,
        paid: Some(Paid { tx: t, output: 0, block: Some(Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers: headers.clone() }) }),
    };
    // The honest verifier's chain: the real one, which never held them.
    let (real, _) = chain_over(&[h("a real block")], 30);
    assert!(matches!(rule(&a, &c, &sat(1_000), &p, &real), Answer::Unknown(w) if w.contains("not on the chain")), "FIXED (F204): forged headers prove nothing");
    // Had the verifier's chain held them, they would be the chain.
    assert_eq!(rule(&a, &c, &sat(1_000), &p, &support::chain(&headers)), Answer::Valid);
}

/// *Pinned after F204.* The floor is gone: its two jobs (the price of a
/// forged proof; telling one network's headers from another's) are done by
/// the chain the verifier follows and the starting point the Module names
/// for each network. So the review's other consequence, every honest proof
/// answering unknown when the network's difficulty falls below a fixed
/// floor (as in July 2021), cannot happen: a header on the chain counts at
/// whatever difficulty the network had. The arithmetic the review printed
/// is kept for the record.
#[test]
fn honest_proofs_verify_at_any_difficulty_and_forging_now_costs_the_chain_itself() {
    let floor_difficulty = 2f64.powi(44);
    for (when, difficulty) in [("July 2021 (13.7 T)", 1.37e13), ("early 2026 (about 150 T)", 1.5e14), ("ten times that", 1.5e15)] {
        let per_block = difficulty * 2f64.powi(32);
        eprintln!("{when}: under draft 1, forging six floor headers cost {:.2} of a block; under draft 2 a forged proof must be on the chain the verifier follows, which only the network's own work extends", 6.0 * 2f64.powi(76) / per_block);
    }
    assert!(1.37e13 < floor_difficulty, "under draft 1, July 2021's honest proofs would have answered unknown");
    // A header at regtest's easiest target, on the held chain: valid.
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a payment");
    let p = support::proof(&k.request, &c, Some((a.script(&c).unwrap(), 1_000)), Some(N));
    assert_eq!(rule(&a, &c, &sat(1_000), &p, &support::held(&p).unwrap()), Answer::Valid);
}

// ---------------------------------------------------------------- 1c. The rule proves payment to the key, not payment by the payer

/// The payee pays its own tweaked address from its own coins, with a
/// commitment naming someone else as payer, and holds a receipt the rule
/// and the payment cMIP answer valid: "Alice paid Bob". The Module's
/// pattern-1 text says the payee "cannot make a transaction from the
/// payer's coins"; true, and beside the point: the rule never reads whose
/// coins a transaction spends. A receipt is the payee's word about who
/// paid, as the Lightning Module says of itself.
#[test]
fn the_payee_alone_holds_a_valid_receipt_naming_any_payer() {
    struct W {
        payee: Hash,
        pointer_id: Hash,
        pointer: PayeePointer,
    }
    impl Held for W {
        fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
            (id == &self.pointer_id).then(|| self.pointer.clone())
        }
        fn vault(&self, _: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
            None
        }
        fn obligation(&self, _: &Hash) -> Option<Obligation> {
            None
        }
        fn holding(&self, _: &Hash, _: &Hash) -> Option<Holding> {
            None
        }
        fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
            None
        }
        fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
            (payee == &self.payee).then(|| vec![(self.pointer_id, self.pointer.clone())]).unwrap_or_default()
        }
        fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
            None
        }
        fn payment_counts(&self, _: &Hash, _: &PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
            None
        }
    }
    let flow = Keys::new("Bob's flow");
    let (bob, alice) = (h("Bob"), h("Alice"));
    let w = W {
        payee: bob,
        pointer_id: h("Bob's pointer"),
        pointer: PayeePointer { payee: bob, version: 1, previous: None, rails: vec![Rail { module: mor_onchain::spec(), address: flow.address(Network::Regtest).encode() }] },
    };
    let paid_to = PaidTo::Flow { pointer: w.pointer_id, rail: 0 };
    let salt = [9; 16];
    let c = Commitment { rail: mor_onchain::spec(), payee: bob, amount: sat(5_000), fulfils: w.pointer_id, payer: Some(Payer::Identity(alice)), paid_to, salt, purchase: None };
    let a = flow.address(Network::Regtest);
    // Bob's own coins, to Bob's address for "Alice's" payment.
    let t = bytes(&tx("Bob's own coins", &[(a.script(&c.hash()).unwrap(), 5_000)]));
    let p = OnchainProof { request: request(&flow.request, &c.hash()), confirmations: None, paid: Some(Paid { tx: t.clone(), output: 0, block: Some(support::confirm(&t, N)) }) };
    let r = Receipt { rail: mor_onchain::spec(), proof: Proof { paid_to, salt, rail: p.encode() }.encode(), payer: Some(Payer::Identity(alice)), payee: bob, amount: sat(5_000), fulfils: w.pointer_id, previous: None, forward: None, batch: None, purchase: None };
    let held = support::held(&p).unwrap();
    let onchain = Onchain::on(&held);
    assert_eq!(verify(Record::Receipt(&r), &w, &Modules::new().adopt(&onchain)).answer, Answer::Valid, "Bob's receipt 'Alice paid me 5,000' verifies, Alice having paid nothing");
}

// ================================================================ 2. The three questions, in Finance

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

/// The test anchoring cMIP of `tests/finance.rs`: a clock service signs
/// `(act, point)`.
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

struct Story {
    w: World,
    anchors: Anchors,
    rail_valid: BTreeMap<Hash, PaidAt>,
    /// Claims whose rail answer is pending, with a transaction shown.
    rail_pending: BTreeSet<Hash>,
    /// The payment each proof is, as the rail Module says (F200).
    payments: BTreeMap<Vec<u8>, Vec<u8>>,
    /// The chain the verifier follows (F204).
    chain: HeaderChain,
    main: Clockwork,
    payee: Hash,
}

impl Story {
    fn view(&self) -> LawView<'_> {
        let mut v = LawView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.rail_pending = self.rail_pending.clone();
        v.payments = self.payments.clone();
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
        assert!(self.anchors.add_proof(&TestAnchoring, &r, &act, &p));
    }

    fn act(&mut self, p: &mut Person, spec: Hash, t: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>, refs: Option<Vec<Ref>>) -> Hash {
        let a = self.w.everyday_act_refs(p, spec, t, payload, objects, None, refs);
        self.w.add(&a)
    }

    fn debt(&mut self, debtor: &mut Person, deal: Hash, value: u64, named: Hash) -> Hash {
        let o = Payload::Obligation(Obligation { debtor: debtor.id, creditor: self.payee, amount: sat(value), pointer: named, agreement: Some(deal) });
        self.act(debtor, mips().finance, fin::types::OBLIGATION, o.to_map(), None, None)
    }

    fn claim(&mut self, payer: &mut Person, debt: Hash, paid_to: PaidTo, salt: [u8; 16], amount: Amount, rail_proof: &OnchainProof) -> (Hash, Answer) {
        let proof = Proof { paid_to, salt, rail: rail_proof.encode() }.encode();
        let claim = Claim { rail: mor_onchain::spec(), proof, payee: self.payee, amount, fulfils: debt, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        let id = self.act(payer, mips().finance, fin::types::CLAIM, Payload::Claim(claim.clone()).to_map(), None, None);
        let rec = Record::Claim(&claim, payer.id, &Citations::default());
        let answer = {
            let onchain = Onchain::on(&self.chain);
            let held = LawHeld { view: self.view() };
            verify(rec.clone(), &held, &Modules::new().adopt(&onchain)).answer
        };
        self.state(id, &rec, &answer);
        (id, answer)
    }

    fn receipt(&mut self, payee: &mut Person, payer: Hash, debt: Hash, paid_to: PaidTo, salt: [u8; 16], amount: Amount, rail_proof: &OnchainProof) -> (Hash, Answer) {
        let proof = Proof { paid_to, salt, rail: rail_proof.encode() }.encode();
        let r = Receipt { rail: mor_onchain::spec(), proof, payer: Some(Payer::Identity(payer)), payee: self.payee, amount, fulfils: debt, previous: None, forward: None, batch: None, purchase: None };
        let id = self.act(payee, mips().finance, fin::types::RECEIPT, Payload::Receipt(r.clone()).to_map(), None, None);
        let rec = Record::Receipt(&r);
        let answer = {
            let onchain = Onchain::on(&self.chain);
            let held = LawHeld { view: self.view() };
            verify(rec.clone(), &held, &Modules::new().adopt(&onchain)).answer
        };
        self.state(id, &rec, &answer);
        (id, answer)
    }
}

/// A deal between a payee (`name`) and a label, the payee's on-chain flow
/// pointer `v1` cited by its signature: (story, payee, label, the payee's
/// home operator, v1, deal).
fn deal(name: &str, flow: &Keys, with_clock: bool) -> (Story, Person, Person, Person, Hash, Hash) {
    let mut w = World::new();
    let op = w.operator(&format!("{name}'s home"));
    let main = Clockwork::new("the public chain");
    let decls = with_clock.then(|| vec![fin::clock_declaration(&mips().finance, &Clock { main: main.reference(), backup: None })]);
    let mut payee = w.genesis_with(name, vec![home(&op)], None, None, decls, 3);
    let pid = payee.id;
    let mut s = Story { w, anchors: Anchors::new(), rail_valid: BTreeMap::new(), rail_pending: BTreeSet::new(), payments: BTreeMap::new(), chain: support::chain(&[mine(h("the chain so far"), &[h("a block")], REGTEST_BITS, 1)]), main, payee: pid };
    let mut label = s.w.genesis("the label", vec![common::own_home()], None, None);
    let v1 = s.act(&mut payee, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: pid, version: 1, previous: None, rails: vec![Rail { module: mor_onchain::spec(), address: flow.address(Network::Regtest).encode() }] }).to_map(), None, None);
    let deal = s.act(&mut label, mips().law, law::types::TERMS, vec![], None, None);
    let on = |t: Hash| Some(vec![Object { chain: t, predecessor: t }]);
    s.act(&mut label, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), None);
    s.act(&mut payee, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v1)]));
    (s, payee, label, op, v1, deal)
}

/// One commitment, and the transactions paying its address: a payer's
/// wallet may sign several (replacing a stuck one, or paying twice).
struct Payment {
    salt: [u8; 16],
    c: Commitment,
    request: [u8; 64],
}

impl Payment {
    fn new(payee: Hash, payer: Hash, debt: Hash, paid_to: PaidTo, keys: &Keys, amount: Amount, label: &str) -> Self {
        let salt = h(label)[..16].try_into().unwrap();
        let c = Commitment { rail: mor_onchain::spec(), payee, amount, fulfils: debt, payer: Some(Payer::Identity(payer)), paid_to, salt, purchase: None };
        Payment { salt, request: request(&keys.request, &c.hash()), c }
    }
    fn script(&self, keys: &Keys) -> Vec<u8> {
        keys.address(Network::Regtest).script(&self.c.hash()).unwrap()
    }
    fn tx(&self, keys: &Keys, coins: &str) -> Vec<u8> {
        bytes(&tx(coins, &[(self.script(keys), self.c.amount.value)]))
    }
    fn unconfirmed(&self, t: &[u8]) -> OnchainProof {
        OnchainProof { request: self.request, confirmations: None, paid: Some(Paid { tx: t.to_vec(), output: 0, block: None }) }
    }
    /// Mined on the tip of `chain`, second in its block, with six headers.
    fn confirmed(&self, t: &[u8], chain: &mut HeaderChain) -> OnchainProof {
        let txids = [h("a coinbase"), txid_of(t), h("another payment")];
        let headers = mine_on(chain, &txids, N);
        OnchainProof { request: self.request, confirmations: None, paid: Some(Paid { tx: t.to_vec(), output: 0, block: Some(Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers }) }) }
    }
}

// ---------------------------------------------------------------- 2a. Question 3 without a reorganisation

/// *Pinned after F200.* The twin proof of 1a, through Finance: Bob's
/// receipt carries the honest index, the label's claim the twin. The twin
/// is no longer a proof (the index is canonical), so the claim's rail
/// answer is invalid, and one payment of 1,000 toward a debt of 2,000
/// counts 1,000. And even a claim that differed from the receipt in
/// nothing but its proof's bytes would be the same payment, by the output
/// the rail Module names (part two of F200, pinned in `tests/finance.rs`).
#[test]
fn a_twin_proof_is_invalid_and_one_payment_counts_once() {
    let flow = Keys::new("Bob's flow");
    let (mut s, mut bob, mut label, _op, v1, deal) = deal("Bob", &flow, false);
    let debt = s.debt(&mut label, deal, 2_000, v1);
    let to_bob = PaidTo::Flow { pointer: v1, rail: 0 };
    let p = Payment::new(bob.id, label.id, debt, to_bob, &flow, sat(1_000), "the label's coins");
    let t = p.tx(&flow, "the label's coins");
    let txids = [h("a coinbase"), h("another payment"), txid_of(&t)];
    let headers = mine_on(&mut s.chain, &txids, N);
    let branch = block::merkle_branch(&txids, 2).unwrap();
    let at = |index: u64| OnchainProof { request: p.request, confirmations: None, paid: Some(Paid { tx: t.clone(), output: 0, block: Some(Block { index, branch: branch.clone(), headers: headers.clone() }) }) };
    let (_, a) = s.receipt(&mut bob, label.id, debt, to_bob, p.salt, sat(1_000), &at(2));
    assert_eq!(a, Answer::Valid);
    assert_eq!(s.view().paid_toward(&debt), 1_000);
    let (_, a) = s.claim(&mut label, debt, to_bob, p.salt, sat(1_000), &at(3));
    assert!(matches!(a, Answer::Invalid(ref w) if w.contains("canonical")), "FIXED (F200): {a:?}");
    assert_eq!(s.view().paid_toward(&debt), 1_000, "FIXED (F200): one payment of 1,000 counts once");
}

// ---------------------------------------------------------------- 2b. Question 2, option 1: the pending claim's anchor

/// *Pinned after F200 and F203.* On a clock that is not Bitcoin, rule 15
/// reads the earliest anchor among the payer's claims of the same payment,
/// once one of them is valid (F203, option 1), "the same payment" being what
/// the rail Module says: on-chain, the output the transaction created
/// (F200), not the commitment. The review's widest attack, a pending claim
/// for a transaction never broadcast and a payment after the lock change
/// with another transaction for the same commitment, now fails: two
/// transactions are two payments. Its narrower form stands, as F203's
/// stated cost: a payer (or the thief as payer) who anchors a pending claim
/// in the window for a signed transaction it holds back, and broadcasts
/// that very transaction after the lock change, is protected; the owner
/// bears, having accepted on-chain payments under a clock that cannot see
/// them, and closes it by declaring Bitcoin as its clock (F201).
#[test]
fn on_a_clock_that_is_not_bitcoin_a_pending_claim_counts_only_for_its_own_transaction() {
    let ana_flow = Keys::new("Ana's flow");
    let (mut s, ana, mut label, mut op, v1, deal) = deal("Ana", &ana_flow, true);
    let aid = ana.id;
    // The thief re-points the flow and the deal.
    let thief_keys = Keys::new("the thief's wallet");
    let mut thief = ana.clone();
    let v2 = s.act(&mut thief, mips().finance, fin::types::PAYEE_POINTER, Payload::PayeePointer(PayeePointer { payee: aid, version: 2, previous: Some(v1), rails: vec![Rail { module: mor_onchain::spec(), address: thief_keys.address(Network::Regtest).encode() }] }).to_map(), None, None);
    let on = |t: Hash| Some(vec![Object { chain: t, predecessor: t }]);
    let resigned = s.act(&mut thief, mips().law, law::types::SIGNATURE, law::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v2)]));
    let to_thief = PaidTo::Flow { pointer: v2, rail: 0 };
    let d1 = s.debt(&mut label, deal, 20_000, v2);
    let d2 = s.debt(&mut label, deal, 20_000, v2);
    let p1 = Payment::new(aid, label.id, d1, to_thief, &thief_keys, sat(20_000), "a royalty");
    let p2 = Payment::new(aid, label.id, d2, to_thief, &thief_keys, sat(20_000), "another royalty");
    // In the window: two claims at "payment", each with a transaction
    // signed and held back, anchored at 100.
    let kept1 = p1.tx(&thief_keys, "coins kept back, 1");
    let kept2 = p2.tx(&thief_keys, "coins kept back, 2");
    let (pending1, a) = s.claim(&mut label, d1, to_thief, p1.salt, sat(20_000), &p1.unconfirmed(&kept1));
    assert!(matches!(a, Answer::Pending(_)));
    s.anchor(pending1, 100);
    let (pending2, _) = s.claim(&mut label, d2, to_thief, p2.salt, sat(20_000), &p2.unconfirmed(&kept2));
    s.anchor(pending2, 100);
    // Ana changes her locks; the quorum is anchored at 160.
    let (rot_act, _) = s.w.rotation(&ana, Rot { disowned: Some(vec![v2, resigned]), ..Default::default() });
    let rot = rot_act.id();
    s.w.add(&rot_act);
    let home_receipt = s.w.receipt(&mut op, &aid, &rot, 1);
    assert_eq!(s.w.v.status(&v2), Status::Void);
    s.anchor(home_receipt, 160);
    let q = s.w.v.quorum(&aid, &rot).unwrap();
    assert_eq!(fin::quorum_point(&q, &rot, &s.anchors, &s.main.reference()), Some(160), "the lock change's point");
    // After the point. The first royalty is paid with other coins, for the
    // same commitment: another transaction, another payment.
    let other = p1.tx(&thief_keys, "coins spent after the lock change");
    assert_ne!(txid_of(&kept1), txid_of(&other));
    let proof1 = p1.confirmed(&other, &mut s.chain);
    let (valid1, a) = s.claim(&mut label, d1, to_thief, p1.salt, sat(20_000), &proof1);
    assert_eq!(a, Answer::Valid);
    s.anchor(valid1, 170);
    assert_eq!(s.view().paid_toward(&d1), 0, "FIXED (F200): the pending claim was for another transaction, another payment; nothing protects this one");
    // The second is the very transaction held back, broadcast now.
    let proof2 = p2.confirmed(&kept2, &mut s.chain);
    let (valid2, a) = s.claim(&mut label, d2, to_thief, p2.salt, sat(20_000), &proof2);
    assert_eq!(a, Answer::Valid);
    s.anchor(valid2, 175);
    assert_eq!(s.view().paid_toward(&d2), 20_000, "STATED COST (F203): a transaction held back and anchored in the window is protected though paid after the lock change; the owner bears, and closes it by declaring Bitcoin as its clock");
    let clock = Clock { main: s.main.reference(), backup: None };
    assert!(fin::claim_in_time(LockPoint::Main(160), &clock, &pending2, &s.anchors));
}

// ---------------------------------------------------------------- 2c. Question 2, option 2: the owner's lever, an hour wide

/// *Pinned after F203.* The review found that if only a valid claim's
/// anchor counted, the owner had an hour-wide lever no prompt anchoring
/// beat: receive a payment at its own flow, change the locks before it
/// confirms, and keep the coins with the debt still open. Under F203, on a
/// clock that is not Bitcoin, the label's claim written and anchored at
/// payment counts once the same payment is proven valid: the lever is shut.
#[test]
fn the_owners_hour_wide_lever_is_shut_by_the_pending_claims_anchor() {
    let own_flow = Keys::new("the owner's own flow key");
    let (mut s, owner, mut label, mut op, v1, deal) = deal("Ana", &own_flow, true);
    let aid = owner.id;
    let to_owner = PaidTo::Flow { pointer: v1, rail: 0 };
    let d = s.debt(&mut label, deal, 20_000, v1);
    let p = Payment::new(aid, label.id, d, to_owner, &own_flow, sat(20_000), "a royalty");
    let t = p.tx(&own_flow, "the label's coins");
    // The label pays the owner's own address, and anchors its claim at
    // payment, promptly, at 100: pending.
    let (pending, a) = s.claim(&mut label, d, to_owner, p.salt, sat(20_000), &p.unconfirmed(&t));
    assert!(matches!(a, Answer::Pending(_)));
    s.anchor(pending, 100);
    // Within the hour, the owner "changes the locks": a rotation disowning
    // its own pointer v1, as if stolen; its home's receipt anchored at 160.
    let (rot_act, _) = s.w.rotation(&owner, Rot { disowned: Some(vec![v1]), ..Default::default() });
    let rot = rot_act.id();
    s.w.add(&rot_act);
    let home_receipt = s.w.receipt(&mut op, &aid, &rot, 1);
    assert_eq!(s.w.v.status(&v1), Status::Void, "the owner's own pointer, voided by the owner");
    s.anchor(home_receipt, 160);
    // Six blocks later, the valid claim, anchored at once, at 170.
    let proof = p.confirmed(&t, &mut s.chain);
    let (valid, a) = s.claim(&mut label, d, to_owner, p.salt, sat(20_000), &proof);
    assert_eq!(a, Answer::Valid);
    s.anchor(valid, 170);
    assert_eq!(s.view().paid_toward(&d), 20_000, "FIXED (F203): the claim anchored at payment counts once the same payment is valid; the owner's lever is shut");
}

// ================================================================ 3. Privacy: what the chain and others learn

// ---------------------------------------------------------------- 3a. A script-path spend publishes the key and the commitment

/// The Module: "Nobody watching the chain can link two payments to the
/// same payee, or an output to the payee's declared key, without the
/// commitment." True while the output is unspent, and for a key-path
/// spend. For an address with a `tree` (the k-of-n script multisig the
/// Module offers for a vault), the owner spends by a script path, and BIP
/// 341's control block then carries the internal key and the Merkle path
/// to the root: the payee's declared key `key`, and the commitment hash as
/// the sibling beside the owner's scripts. Both are on the chain forever,
/// and `key` is in the payee's public pointer or vault.
#[test]
fn a_script_path_spend_publishes_the_payees_declared_key_and_the_commitment_on_the_chain() {
    use bitcoin::key::XOnlyPublicKey;
    use bitcoin::secp256k1::Secp256k1;
    use bitcoin::taproot::{LeafVersion, TapLeafHash, TapNodeHash, TaprootBuilder};
    use bitcoin::ScriptBuf;
    let k = Keys::new("a vault, 2-of-3 by script");
    let c = h("a vault payment's commitment");
    // The owner's one script leaf: its TapLeaf hash is the `tree` the
    // address declares.
    let script = ScriptBuf::from_bytes(vec![0x51]); // stands in for the multisig script
    let leaf: [u8; 32] = TapLeafHash::from_script(&script, LeafVersion::TapScript).to_byte_array();
    let a = OnchainAddress { tree: Some(leaf), ..k.address(Network::Regtest) };
    let secp = Secp256k1::new();
    let info = TaprootBuilder::new()
        .add_leaf(1, script.clone())
        .unwrap()
        .add_hidden_node(1, TapNodeHash::from_byte_array(c))
        .unwrap()
        .finalize(&secp, XOnlyPublicKey::from_slice(&a.key).unwrap())
        .unwrap();
    // The chain's output is the Module's address for this payment.
    assert_eq!(info.output_key().to_x_only_public_key().serialize(), a.output_key(&c).unwrap());
    // What the owner must put on the chain to spend by its script.
    let control = info.control_block(&(script, LeafVersion::TapScript)).unwrap().serialize();
    assert_eq!(&control[1..33], &a.key, "the control block carries the declared key");
    assert!(control.windows(32).any(|w| w == c), "and the commitment hash, as the sibling");
    eprintln!("a script-path spend reveals on the chain: the declared key {} and the commitment {}", hex(&a.key), hex(&c));
}

fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

// ---------------------------------------------------------------- 3b. The salt is the only secret

/// Everything else in the commitment is public or guessable: the payee
/// and its pointer act are public, the amount is a published price, what
/// it fulfils is a public act, the payer is one of a short list, and the
/// address's key is in the pointer. The output script is a deterministic
/// function of these and the salt, so a client that makes salts from a
/// counter, a clock or anything short lets an observer of the chain
/// recompute the address and read, from a bare Taproot output, who paid
/// whom for what. The Module says "chosen by the payer, fresh for each
/// payment" and no more; the privacy claim rests on 128 random bits the
/// payer's client must supply.
#[test]
fn a_weak_salt_lets_an_observer_of_the_chain_name_the_payer_the_payee_and_the_work() {
    let flow = Keys::new("Bob's flow");
    let a = flow.address(Network::Regtest);
    let (bob, pointer, offer) = (h("Bob"), h("Bob's pointer act"), h("Bob's standing offer"));
    let price = sat(4_321);
    let payers = [h("Alice"), h("Carol"), h("Dan")];
    // A careless wallet: the salt is a one-byte counter.
    let mut salt = [0u8; 16];
    salt[0] = 37;
    let secret = Commitment { rail: mor_onchain::spec(), payee: bob, amount: price, fulfils: offer, payer: Some(Payer::Identity(payers[1])), paid_to: PaidTo::Flow { pointer, rail: 0 }, salt, purchase: None };
    let on_chain = a.script(&secret.hash()).unwrap();
    // The observer holds Bob's public pointer and offer, the price, and a
    // list of three people who might buy; it tries every salt.
    let mut found = None;
    for payer in payers {
        for n in 0..=255u8 {
            let mut s = [0u8; 16];
            s[0] = n;
            let guess = Commitment { rail: mor_onchain::spec(), payee: bob, amount: price, fulfils: offer, payer: Some(Payer::Identity(payer)), paid_to: PaidTo::Flow { pointer, rail: 0 }, salt: s, purchase: None };
            if a.script(&guess.hash()).unwrap() == on_chain {
                found = Some((payer, n));
            }
        }
    }
    assert_eq!(found, Some((payers[1], 37)), "from the output alone: Carol bought Bob's offer at 4,321, with salt 37");
}
