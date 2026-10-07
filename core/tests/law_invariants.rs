//! Law's promises as invariants, checked over random histories
//! (`docs/law-invariants.md`).
//!
//! In plain words: a generator writes random stories of collectives and
//! deals (members, devices, debts, grants and their keys, departures, forks,
//! closings, payments, splits), honest and dishonest; the core library
//! judges each story; and each promise of Law draft 10 is checked against
//! what the library says, by an independent reading of the same acts (a
//! plain walk over what each act cites). The same acts are then delivered
//! again in shuffled orders, with the verifier queried while they arrive,
//! and every verdict must come out the same. When a promise breaks,
//! proptest shrinks the story to its smallest form; each such story is kept
//! below as a named test.
//!
//! The number of cases per property is `LAW_INVARIANT_CASES` (default 48,
//! so that `cargo test` stays quick); the report's runs used thousands.
//!
//! Every run prints its random seed, and names it again if it fails. Set
//! `LAW_INVARIANT_SEED` to that number, with the same `LAW_INVARIANT_CASES`,
//! to replay the run exactly: the same stories, in the same order, the same
//! failure shrunk the same way (`docs/law-invariants.md`, "Seeds").

mod common;

use common::{own_home, schnorr, signing_key, Person, World};
use mor_core::act::{Act, Object};
use mor_core::cbor::Value;
use mor_core::chain::{Status, Verifier};
use mor_core::finance::{self as fin, Amount, Payer, Payload as Fin, Purchase, Receipt};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::KeptTip;
use mor_core::law::{
    self, outcomes, Abandonment, Area, Authority, Backing, Field4, Grant, Holding, KeyGrammar, Kind,
    LawView, MarkEntry, Mips, Power, Record, Recovery, Resignation, Rule, Terms, Who,
};
use mor_core::lock::ContentKey;
use mor_core::mmr::Mmr;
use mor_core::sig::SchnorrKey;
use proptest::prelude::*;
use proptest::test_runner::{Config, RngAlgorithm, TestCaseError, TestRng, TestRunner};
use std::collections::{BTreeMap, BTreeSet};
use std::sync::atomic::{AtomicU64, Ordering};

// ---------------------------------------------------------------- shared

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: common::identity_spec(),
        envelope: t("ENVELOPE"),
        text: t("TEXT"),
        finance: t("FINANCE"),
        law: t("LAW"),
        production: t("PRODUCTION"),
    }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn pay() -> Hash {
    spec("a payment cMIP")
}

fn rail() -> Hash {
    spec("a rail Module")
}

fn unit() -> Hash {
    spec("a unit")
}

fn cases(default: u32) -> u32 {
    std::env::var("LAW_INVARIANT_CASES").ok().and_then(|s| s.parse().ok()).unwrap_or(default)
}

fn config(n: u32) -> Config {
    Config {
        cases: cases(n),
        failure_persistence: None,
        max_shrink_iters: 4096,
        ..Config::default()
    }
}

/// The seed of a property's run: `LAW_INVARIANT_SEED` where set, otherwise
/// a fresh one. Nothing else in a story is random: every key, nonce and
/// shuffle is drawn from the story itself, so the seed and the number of
/// cases decide the whole run.
fn seed() -> u64 {
    match std::env::var("LAW_INVARIANT_SEED") {
        Ok(s) => s.trim().parse().expect("LAW_INVARIANT_SEED must be a whole number"),
        Err(_) => {
            use std::hash::{BuildHasher, Hasher};
            // The standard library's per-process random keys, and the time.
            let mut h = std::collections::hash_map::RandomState::new().build_hasher();
            h.write_u128(std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or(0));
            h.finish()
        }
    }
}

/// One property's run: its name, seed and number of cases.
struct Run {
    name: &'static str,
    seed: u64,
    cases: u32,
}

impl Run {
    fn replay(&self) -> String {
        format!(
            "LAW_INVARIANT_SEED={} LAW_INVARIANT_CASES={} cargo test -p mor-core --test law_invariants -- --exact {} --nocapture",
            self.seed, self.cases, self.name
        )
    }

    /// A failure, naming the seed that replays it.
    fn failed(&self, e: impl std::fmt::Display) -> ! {
        panic!("{e}\n[{}] failed with seed {}; replay: {}", self.name, self.seed, self.replay())
    }
}

/// A property's runner, from a seed it prints, so the run can be replayed.
fn runner(name: &'static str, n: u32) -> (TestRunner, Run) {
    let config = config(n);
    let run = Run { name, seed: seed(), cases: config.cases };
    eprintln!("[{name}] seed {}, {} cases; replay: {}", run.seed, run.cases, run.replay());
    let rng = TestRng::from_seed(RngAlgorithm::ChaCha, &sha256(&run.seed.to_le_bytes()));
    (TestRunner::new_with_rng(config, rng), run)
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object { chain: x, predecessor: x }])
}

fn law_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mips().law, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    law_act(w, p, law::types::SIGNATURE, law::signature_payload(x), obj(*x))
}

fn grant_key(name: &str) -> (SchnorrKey, mor_core::identity::SigningKey) {
    let k = schnorr(&format!("{name}/grant"), 0);
    let p = signing_key(&k);
    (k, p)
}

/// The kept tip of a sequence at position `k` (1-based): the line a fork,
/// closing or record names. `k` below the sequence's length draws a stale
/// line, one that leaves the later acts out.
fn tip_at(seq: &[Hash], k: usize) -> KeptTip {
    KeptTip {
        act: seq[k - 1],
        position: k as u64,
        summary: Mmr::from_ids(&seq[..k]).root(),
    }
}

/// Divide in millionths, leftovers to the first: a fork's members counted
/// alike, for the share each leaving member keeps (how their ties are
/// ordered is left open, F162; the library keeps this rule).
fn alike(n: usize) -> Vec<u64> {
    let each = 1_000_000 / n as u64;
    let mut v = vec![each; n];
    v[0] += 1_000_000 - each * n as u64;
    v
}

fn sorted(mut v: Vec<Hash>) -> Vec<Hash> {
    v.sort();
    v
}

/// A small deterministic generator, for shuffles drawn from a proptest seed.
struct Lcg(u64);
impl Lcg {
    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        self.0 >> 33
    }
    fn below(&mut self, n: usize) -> usize {
        (self.next() % n.max(1) as u64) as usize
    }
}

/// Coverage counters: how often each kind of event really happened.
#[derive(Default)]
struct Stats(BTreeMap<&'static str, AtomicU64>);
impl Stats {
    fn new(keys: &[&'static str]) -> Self {
        Stats(keys.iter().map(|k| (*k, AtomicU64::new(0))).collect())
    }
    fn hit(&self, k: &'static str) {
        if let Some(c) = self.0.get(k) {
            c.fetch_add(1, Ordering::Relaxed);
        }
    }
    fn show(&self, name: &str) {
        let s: Vec<String> = self.0.iter().map(|(k, v)| format!("{k}={}", v.load(Ordering::Relaxed))).collect();
        eprintln!("[{name}] {}", s.join(" "));
    }
}

/// Every act a collective's chain names that this act cites (F127): its
/// sequence's previous act, its `objects` on the chain, and, for a record,
/// its kept tips. Read from the acts held, independently of the library.
fn cites_on(v: &Verifier, chain: &Hash, x: &Hash) -> Vec<Hash> {
    let Some(h) = v.get(x) else { return vec![] };
    let mut out: Vec<Hash> = h.inside.prev.iter().flatten().copied().collect();
    out.extend(h.inside.objects.iter().flatten().filter(|o| &o.chain == chain).map(|o| o.predecessor));
    if h.inside.spec == mips().law && h.inside.type_ == law::types::RECORD {
        if let Ok(r) = Record::decode(&h.inside) {
            out.extend(r.kept.iter().map(|t| t.act));
        }
    }
    out
}

/// The history of a set of starting acts on a collective's chain: every act
/// reached by following what each cites, transitively (F127, "History").
/// Every node reachable from `from` along `edges`, `from` left out.
fn reach(edges: &BTreeMap<Hash, BTreeSet<Hash>>, from: &Hash) -> BTreeSet<Hash> {
    let mut out = BTreeSet::new();
    let mut todo = vec![*from];
    while let Some(x) = todo.pop() {
        for y in edges.get(&x).into_iter().flatten() {
            if y != from && out.insert(*y) {
                todo.push(*y);
            }
        }
    }
    out
}

fn history(v: &Verifier, chain: &Hash, start: &[Hash]) -> BTreeSet<Hash> {
    let mut seen = BTreeSet::new();
    let mut todo: Vec<Hash> = start.to_vec();
    while let Some(x) = todo.pop() {
        if !seen.insert(x) {
            continue;
        }
        todo.extend(cites_on(v, chain, &x));
    }
    seen
}

/// A decision's or action's own history: what it cites, not itself.
fn history_of(v: &Verifier, chain: &Hash, x: &Hash) -> BTreeSet<Hash> {
    let mut h = history(v, chain, &cites_on(v, chain, x));
    h.remove(x);
    h
}

fn binds(b: &Backing) -> bool {
    matches!(b, Backing::Backed { .. } | Backing::Binds { .. })
}

// ---------------------------------------------------------------- order independence

/// Every verdict the library gives on every act held, as text: what a
/// client would show. Two deliveries of the same acts must give the same.
/// What the caller states about rails: the push rails, and the receipts a
/// rail showed wrong (F131, IT3).
type Rails = (BTreeSet<Hash>, BTreeSet<Hash>);

fn verdicts(v: &Verifier, rails: &Rails) -> BTreeMap<Hash, String> {
    let mut lv = LawView::new(v, mips());
    lv.push_rails = rails.0.clone();
    lv.rail_invalid = rails.1.clone();
    let mut out = BTreeMap::new();
    let ids: Vec<Hash> = v.held_acts().map(|h| h.id).collect();
    for id in ids {
        let h = v.get(&id).unwrap();
        let mut s = format!("status={:?}", v.status(&id));
        if h.inside.spec == mips().law || h.inside.spec == mips().finance || h.inside.spec == mips().envelope {
            s += &format!(" consent={:?} backing={:?} done={:?}", lv.consent(&id), lv.backing(&id), lv.done(&id));
        }
        if h.inside.spec == mips().finance {
            s += &format!(" binds={:?} debtors={:?} purchase={:?}", lv.obligation_binds(&id), lv.debtors(&id), lv.purchase(&id).map(|p| p.map(|p| p.verdict)));
        }
        if h.inside.spec == mips().law {
            match h.inside.type_ {
                law::types::TERMS => s += &format!(" agreement={:?}", lv.agreement(&id).map(|a| (a.exists, a.ready, a.invalid))),
                law::types::FORK => s += &format!(" fork={:?}", lv.fork(&id).map(|e| (e.complete, e.why, e.unassigned))),
                law::types::CLOSING => s += &format!(" closing={:?}", lv.closing(&id).map(|e| (e.complete, e.why, e.open_debts))),
                law::types::SPLIT => s += &format!(" split={:?}", lv.split(&id).map(|e| (e.sums, e.mismatched, e.undelivered))),
                _ => {}
            }
        }
        if h.act.outside.signer.is_none() {
            s += &format!(" current={:?} closed_by={:?} owes={:?}", lv.current(&id).map(|c| c.map(|c| (c.agreement, c.closed, c.frozen, c.departed))), lv.closed_by(&id).map(|c| c.map(|c| c.by)), lv.owes(&id));
        }
        out.insert(id, s);
    }
    out
}

/// The same acts delivered into a fresh verifier in a shuffled order. With
/// `probe`, the verifier is queried while they arrive (a client reading as
/// acts come in), so any state cached from a partial delivery shows.
fn replay(log: &[(Act, Option<ContentKey>)], seed: u64, probe: bool, push: &Rails) -> BTreeMap<Hash, String> {
    let mut order: Vec<usize> = (0..log.len()).collect();
    let mut r = Lcg(seed);
    for i in (1..order.len()).rev() {
        order.swap(i, r.below(i + 1));
    }
    let mut v = Verifier::with_mips(common::identity_spec(), common::finance_spec(), common::law_spec());
    for (n, i) in order.iter().enumerate() {
        let (a, k) = &log[*i];
        v.add_with_key(a.clone(), k.as_ref()).unwrap();
        if probe && r.below(4) == 0 {
            let lv = LawView::new(&v, mips());
            let held: Vec<Hash> = v.held_acts().map(|h| h.id).collect();
            for _ in 0..3 {
                let x = held[r.below(held.len())];
                let _ = lv.consent(&x);
                let _ = lv.backing(&x);
                let _ = lv.obligation_binds(&x);
                let _ = lv.purchase(&x);
                let _ = v.status(&x);
                let _ = n;
            }
        }
    }
    verdicts(&v, push)
}

fn same_verdicts(a: &BTreeMap<Hash, String>, b: &BTreeMap<Hash, String>, what: &str) -> Result<(), TestCaseError> {
    for (k, x) in a {
        let y = b.get(k).map(String::as_str).unwrap_or("(not held)");
        if x != y {
            return Err(TestCaseError::fail(format!("{what}: act {k:?} judged differently:\n  first:  {x}\n  second: {y}")));
        }
    }
    Ok(())
}

// ================================================================ the collective world

/// How an act in the collective's name is sealed (rule 35a).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Seal {
    Public,
    /// Sealed to every member (and its counterparty).
    All,
    /// Sealed to some members only: planning, never done.
    TooFew,
}

fn seal() -> impl Strategy<Value = Seal> {
    prop_oneof![4 => Just(Seal::Public), 2 => Just(Seal::All), 1 => Just(Seal::TooFew)]
}

#[derive(Clone, Copy, Debug)]
enum AgentWhat {
    /// An act within the grant's reach.
    InScope,
    /// An act of another layer than the grant reaches.
    OutOfScope,
    /// A decision signed with the grant key: a record, a grant, a revocation.
    Record,
    Grant,
    Revocation,
}

#[derive(Clone, Copy, Debug)]
enum DebtsMode {
    /// What the library says the line must hand out.
    Honest,
    /// One left out.
    DropOne,
    /// None at all.
    Nothing,
    /// One more, from outside the history.
    Extra,
}

#[derive(Clone, Copy, Debug)]
enum PaidBy {
    /// The creditor's own receipt (Finance rule 7).
    Creditor,
    /// A receipt the debtor signs itself, naming the debt: a payout disguised.
    Debtor,
    /// A stranger's receipt naming the debt.
    Stranger,
}

#[derive(Clone, Copy, Debug)]
enum Disguise {
    None,
    /// The service names itself as payer: a payout (H7).
    PayerIsService,
    /// The receipt carries a batch: a payout (H5).
    Batch,
}

#[derive(Clone, Debug)]
enum Op {
    Publish { dev: u8, seal: Seal },
    Debt { dev: u8, seal: Seal, cited: bool, creditor: u8, amount: u16, lane_sign: bool },
    Join { dev: u8, other: u8 },
    Grant { dev: u8, agent: u8, in_area: bool, accept: bool, holders_sign: bool },
    AgentAct { grant: u8, strand: u8, what: AgentWhat, seal: Seal },
    Revoke { grant: u8, dev: u8, join_strand: bool, holders_sign: bool },
    Ack { dev: u8, target: u8 },
    Resign { member: u8, area_only: bool, dev: u8, tips: u8, inform: bool },
    /// `names`: the ending names every earlier ending of the collective it
    /// holds (client conformance, F131 IT1); otherwise none.
    Fork { stale: u8, sides: u8, debts: DebtsMode, seal: Seal, all_sign: bool, succ_sign: bool, names: bool },
    Closing { stale: u8, seal: Seal, all_sign: bool, names: bool },
    /// A member listed on an earlier ending who has not signed it signs it
    /// now, after whatever came since: an old proposal finished late (U4).
    LateSign { ending: u8, member: u8 },
    Pay { debt: u8, by: PaidBy, full: bool },
    Release { debt: u8, by_creditor: bool },
    Sale { strand: u8, proof: u8, disguise: Disguise, lane_sign: bool, line_current: bool },
}

fn op() -> impl Strategy<Value = Op> {
    let agent_what = prop_oneof![
        6 => Just(AgentWhat::InScope),
        2 => Just(AgentWhat::OutOfScope),
        1 => Just(AgentWhat::Record),
        1 => Just(AgentWhat::Grant),
        1 => Just(AgentWhat::Revocation),
    ];
    let debts = prop_oneof![5 => Just(DebtsMode::Honest), 2 => Just(DebtsMode::DropOne), 1 => Just(DebtsMode::Nothing), 1 => Just(DebtsMode::Extra)];
    let paid = prop_oneof![4 => Just(PaidBy::Creditor), 1 => Just(PaidBy::Debtor), 1 => Just(PaidBy::Stranger)];
    let disguise = prop_oneof![4 => Just(Disguise::None), 1 => Just(Disguise::PayerIsService), 1 => Just(Disguise::Batch)];
    prop_oneof![
        3 => (any::<u8>(), seal()).prop_map(|(dev, seal)| Op::Publish { dev, seal }),
        4 => (any::<u8>(), seal(), prop::bool::weighted(0.85), any::<u8>(), 1u16..500, prop::bool::weighted(0.8))
            .prop_map(|(dev, seal, cited, creditor, amount, lane_sign)| Op::Debt { dev, seal, cited, creditor, amount, lane_sign }),
        3 => (any::<u8>(), any::<u8>()).prop_map(|(dev, other)| Op::Join { dev, other }),
        2 => (any::<u8>(), any::<u8>(), any::<bool>(), prop::bool::weighted(0.85), prop::bool::weighted(0.85))
            .prop_map(|(dev, agent, in_area, accept, holders_sign)| Op::Grant { dev, agent, in_area, accept, holders_sign }),
        4 => (any::<u8>(), any::<u8>(), agent_what, seal()).prop_map(|(grant, strand, what, seal)| Op::AgentAct { grant, strand, what, seal }),
        2 => (any::<u8>(), any::<u8>(), any::<bool>(), prop::bool::weighted(0.85))
            .prop_map(|(grant, dev, join_strand, holders_sign)| Op::Revoke { grant, dev, join_strand, holders_sign }),
        1 => (any::<u8>(), any::<u8>()).prop_map(|(dev, target)| Op::Ack { dev, target }),
        1 => (any::<u8>(), any::<bool>(), any::<u8>(), any::<u8>(), any::<bool>())
            .prop_map(|(member, area_only, dev, tips, inform)| Op::Resign { member, area_only, dev, tips, inform }),
        2 => (prop_oneof![3 => Just(0u8), 1 => 1u8..3], any::<u8>(), debts, seal(), prop::bool::weighted(0.85), prop::bool::weighted(0.85), prop::bool::weighted(0.75))
            .prop_map(|(stale, sides, debts, seal, all_sign, succ_sign, names)| Op::Fork { stale, sides, debts, seal, all_sign, succ_sign, names }),
        1 => (prop_oneof![3 => Just(0u8), 1 => 1u8..3], seal(), prop::bool::weighted(0.85), prop::bool::weighted(0.75))
            .prop_map(|(stale, seal, all_sign, names)| Op::Closing { stale, seal, all_sign, names }),
        1 => (any::<u8>(), any::<u8>()).prop_map(|(ending, member)| Op::LateSign { ending, member }),
        2 => (any::<u8>(), paid, prop::bool::weighted(0.8)).prop_map(|(debt, by, full)| Op::Pay { debt, by, full }),
        1 => (any::<u8>(), prop::bool::weighted(0.8)).prop_map(|(debt, by_creditor)| Op::Release { debt, by_creditor }),
        2 => (any::<u8>(), 0u8..3, disguise, prop::bool::weighted(0.8), any::<bool>())
            .prop_map(|(strand, proof, disguise, lane_sign, line_current)| Op::Sale { strand, proof, disguise, lane_sign, line_current }),
    ]
}

/// The shape of a collective: its founding terms' choices.
#[derive(Clone, Debug)]
struct Shape {
    members: usize,
    devices: usize,
    member_devices: usize,
    /// The constitutional change rule: `None` every party, else a threshold.
    constitutional: Option<u8>,
    /// A Finance lane: its holders (a mask over members) and its number.
    lane: Option<(u8, u8)>,
    /// The collective owns a work it sells; it then names a split service.
    owns_work: bool,
}

fn shape() -> impl Strategy<Value = Shape> {
    (2usize..=5, 1usize..=3, 1usize..=3, prop::option::of(1u8..5), prop::option::weighted(0.5, (1u8..32, 1u8..3)), any::<bool>()).prop_map(
        |(members, devices, member_devices, constitutional, lane, owns_work)| Shape {
            members,
            devices,
            member_devices,
            constitutional: constitutional.map(|k| k.min(members as u8)),
            lane: lane.map(|(mask, k)| {
                let mask = mask & ((1u8 << members) - 1);
                let mask = if mask == 0 { 1 } else { mask };
                (mask, k.min(mask.count_ones() as u8))
            }),
            owns_work,
        },
    )
}

/// What the generator knows about each act it made: the oracle's own
/// bookkeeping, never read from the library.
#[derive(Clone, Debug)]
struct Info {
    seal: Seal,
    /// It cites the collective's chain (F127, rule 35b).
    cited: bool,
    /// Signed with this grant's key (by index), if any.
    grant: Option<usize>,
    /// What it is.
    kind: K,
    /// Finance-lane holders who signed it.
    lane_signed: Vec<Hash>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
enum K {
    Publication,
    Debt { creditor: Hash, amount: u64 },
    Revocation { grant: usize },
    Record,
    GrantAct,
    Ack { target: Hash },
    Receipt { proof: u8, payer_is_service: bool, batch: bool },
}

struct GrantInfo {
    id: Hash,
    agent: usize,
    in_area: bool,
    accepted: bool,
    holders_signed: bool,
    strands: Vec<Person>,
    /// The split service's grant, named by field 14.
    service: bool,
}

struct EndingInfo {
    id: Hash,
    fork: bool,
    tips: Vec<Hash>,
    /// The members it lists: a fork's sides, a closing's voices.
    listed: Vec<Hash>,
}

struct ColWorld {
    w: World,
    shape: Shape,
    /// Each member's devices.
    m: Vec<Vec<Person>>,
    /// The collective's devices.
    c: Vec<Person>,
    col: Hash,
    founding: Hash,
    /// The agreement in force (the founding terms, or the clone naming the
    /// split service).
    current: Hash,
    agents: Vec<Person>,
    creditors: Vec<Person>,
    stranger: Person,
    work: Hash,
    publication: Option<Hash>,
    lane_holders: Vec<Hash>,
    info: BTreeMap<Hash, Info>,
    grants: Vec<GrantInfo>,
    debts: Vec<Hash>,
    /// Receipts paying debts, with their payee: the rail's answer for each
    /// is stated valid, paid to the payee's vault (Finance rule 4), so only
    /// who signed decides (IC2).
    paid: Vec<(Hash, Hash)>,
    endings: Vec<EndingInfo>,
    /// Every member's ending signature (a chain signature, F132), in the
    /// order made, so in each member's chain order: (member, ending, op
    /// index, late: a LateSign).
    end_sigs: Vec<(Hash, Hash, usize, bool)>,
    /// The op being applied.
    step: usize,
    /// Departures registered: (record, party, area only).
    departures: Vec<(Hash, Hash, bool)>,
    records: Vec<Hash>,
    /// A complete ending first seen: (op index, ending, the verdicts then of
    /// the acts in its history).
    first_end: Option<(usize, Hash, BTreeMap<Hash, String>)>,
    successors: Vec<Hash>,
    succ_people: Vec<Person>,
    /// Acts a later act of the collective cited (joined) while they counted:
    /// a counterparty that waited for that is promised safety (rule 43).
    cited_counting: Vec<(Hash, Hash)>,
    /// A line names the grant keys' strands' tips too, as kept tips (a
    /// named test only).
    line_strands: bool,
    rng: Lcg,
    seed: u64,
}

fn col_terms(ids: &[Hash], authority: Hash, shape: &Shape, work: Hash) -> Terms {
    let lane = shape.lane.map(|(mask, k)| Area {
        name: "Finance".into(),
        holders: ids.iter().enumerate().filter(|(i, _)| mask & (1 << i) != 0).map(|(_, h)| *h).collect(),
        threshold: k as u64,
        kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]),
        fields: None,
        id: 2,
    });
    Terms {
        parties: ids.to_vec(),
        text: "A collective, as the generator drew it.".into(),
        cmips: vec![(6, pay())],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::Threshold(ids.len().min(2) as u64),
        time: None,
        abandonment: Some(Abandonment { authority: Authority::Named(authority), outcomes: vec![outcomes::VOICE_REMOVED], proof: None }),
        parent: None,
        grammar: Some(KeyGrammar {
            signing: Holding::Shares { threshold: 1, members: ids.to_vec() },
            safety: Holding::Shares { threshold: ids.len() as u64, members: ids.to_vec() },
            recovery: Some(Recovery::Escrow { authority }),
        }),
        arbitrators: None,
        split_grant: None,
        payee_grants: None,
        extensions: None,
        succession: None,
        constitutional: shape.constitutional.map(|k| Rule::Threshold(k as u64)),
        areas: lane.map(|a| vec![a]),
        area_words: None,
        chain: None,
        departed: None,
        stakes: shape.owns_work.then(|| vec![law::Stake { object: Who::Id(work), holders: vec![(Who::This, 1_000_000)] }]),
        forked_from: None,
        release_rule: None,
    }
}

impl ColWorld {
    fn new(shape: &Shape, seed: u64) -> ColWorld {
        let mut w = World::new();
        let names = ["ana", "ben", "cy", "dee", "eli"];
        let mut m: Vec<Vec<Person>> = names[..shape.members]
            .iter()
            .map(|n| {
                let p = w.genesis(n, vec![own_home()], None, None);
                (0..shape.member_devices).map(|_| {
                    let mut d = p.clone();
                    d.seq = vec![];
                    d
                })
                .collect()
            })
            .collect();
        let authority = w.genesis("authority", vec![own_home()], None, None);
        let ids: Vec<Hash> = m.iter().map(|d| d[0].id).collect();
        let work = spec("a work the collective owns");
        let t = col_terms(&ids, authority.id, shape, work);
        assert_eq!(t.check(&mips()), Ok(()), "the generator's own founding terms");
        let founding = law_act(&mut w, &mut m[0][0], law::types::TERMS, t.to_map(), None);
        for d in m.iter_mut() {
            sign(&mut w, &mut d[0], &founding);
        }
        let mut c0 = w.genesis_with("collective", vec![own_home()], None, None, Some(vec![law::founding_declaration(&mips().law, &founding)]), 3);
        c0.cite = Some((c0.id, vec![c0.id]));
        let col = c0.id;
        let c = vec![c0; shape.devices];
        let agents = (0..2).map(|i| w.genesis(&format!("agent {i}"), vec![own_home()], None, None)).collect();
        let creditors = (0..2).map(|i| w.genesis(&format!("creditor {i}"), vec![own_home()], None, None)).collect();
        let stranger = w.genesis("a stranger", vec![own_home()], None, None);
        let lane_holders = t.areas().first().map(|a| a.holders.clone()).unwrap_or_default();
        let mut cw = ColWorld {
            w,
            shape: shape.clone(),
            m,
            c,
            col,
            founding,
            current: founding,
            agents,
            creditors,
            stranger,
            work,
            publication: None,
            lane_holders,
            info: BTreeMap::new(),
            grants: vec![],
            debts: vec![],
            paid: vec![],
            endings: vec![],
            end_sigs: vec![],
            step: 0,
            departures: vec![],
            records: vec![],
            first_end: None,
            successors: vec![],
            succ_people: vec![],
            cited_counting: vec![],
            line_strands: false,
            rng: Lcg(seed),
            seed,
        };
        if shape.owns_work {
            cw.setup_sales();
        }
        cw
    }

    fn ids(&self) -> Vec<Hash> {
        self.m.iter().map(|d| d[0].id).collect()
    }

    fn view(&self) -> LawView<'_> {
        let mut lv = LawView::new(&self.w.v, mips());
        for (x, payee) in &self.paid {
            lv.rail_valid.insert(*x, mor_core::finance::PaidAt::VaultEntry(*payee, 0));
        }
        lv
    }

    /// Members whose voice the generator has registered as gone.
    fn gone(&self) -> Vec<Hash> {
        self.departures.iter().filter(|(_, _, area)| !area).map(|(_, p, _)| *p).collect()
    }

    fn lane_now(&self) -> Vec<Hash> {
        let gone: Vec<Hash> = self.departures.iter().map(|(_, p, _)| *p).collect();
        self.lane_holders.iter().filter(|h| !gone.contains(h)).copied().collect()
    }

    /// A member signs an act, from one of their devices.
    /// Member `i` signs an ending: a chain signature, with their safety
    /// key, on their identity chain (F132), which every one of their
    /// devices then carries on from.
    fn member_end(&mut self, i: usize, x: &Hash, late: bool) -> Hash {
        let d = self.rng.below(self.m[i].len());
        let (id, q) = self.w.chain_sign(&self.m[i][d], *x);
        for dv in self.m[i].iter_mut() {
            dv.tip = q.tip;
            dv.safety = q.safety.clone();
            dv.position = q.position;
        }
        self.end_sigs.push((q.id, *x, self.step, late));
        id
    }

    fn member_sign(&mut self, i: usize, x: &Hash) -> Hash {
        let d = self.rng.below(self.m[i].len());
        sign(&mut self.w, &mut self.m[i][d], x)
    }

    fn lane_sign(&mut self, x: &Hash) -> Vec<Hash> {
        let ids = self.ids();
        let holders = self.lane_now();
        for h in &holders {
            let i = ids.iter().position(|x| x == h).unwrap();
            self.member_sign(i, x);
        }
        holders
    }

    /// An act on a strand of the collective's actions chain (a device, or
    /// a grant key's strand): citing the decisions the strand knows and
    /// these joined heads, or nothing when `cited` is false; sealed as asked.
    #[allow(clippy::too_many_arguments)]
    fn act_on(&mut self, who: Who2, spec_: Hash, type_: u64, payload: Vec<(Value, Value)>, mut objects: Vec<Object>, joined: &[Hash], cited: bool, seal: Seal, acks: Option<Vec<Hash>>, extra_to: &[Hash]) -> Hash {
        let col = self.col;
        let ids = self.ids();
        let blank = self.c[0].clone();
        let mut p = match who {
            Who2::Dev(d) => std::mem::replace(&mut self.c[d], blank),
            Who2::Strand(g, s) => std::mem::replace(&mut self.grants[g].strands[s], blank),
        };
        if cited {
            let ds = p.cite.as_ref().map(|c| c.1.clone()).unwrap_or_default();
            objects.extend(ds.iter().chain(joined).map(|d| Object { chain: col, predecessor: *d }));
        }
        let saved = p.cite.take();
        let objects = (!objects.is_empty()).then_some(objects);
        let id = match seal {
            Seal::Public => {
                let a = self.w.everyday_act(&mut p, spec_, type_, payload, objects, acks);
                self.w.add(&a)
            }
            Seal::All | Seal::TooFew => {
                let mut to: Vec<Hash> = extra_to.to_vec();
                let keep = if seal == Seal::All { ids.len() } else { self.rng.below(ids.len()) };
                to.extend(ids.iter().take(keep));
                if to.is_empty() {
                    to.push(self.stranger.id);
                }
                assert!(acks.is_none());
                self.w.private_act(&mut p, spec_, type_, payload, objects, to)
            }
        };
        p.cite = saved;
        match who {
            Who2::Dev(d) => self.c[d] = p,
            Who2::Strand(g, s) => self.grants[g].strands[s] = p,
        }
        id
    }

    fn note(&mut self, x: Hash, seal: Seal, cited: bool, grant: Option<usize>, kind: K) {
        self.info.insert(x, Info { seal, cited, grant, kind, lane_signed: vec![] });
    }

    /// The heads of every strand, as joinable acts: devices, then grant strands.
    fn heads(&self) -> Vec<Hash> {
        let mut v: Vec<Hash> = self.c.iter().filter_map(|d| d.seq.last().copied()).collect();
        for g in &self.grants {
            v.extend(g.strands.iter().filter_map(|s| s.seq.last().copied()));
        }
        v
    }

    /// The collective names a split service (field 14): a grant in its
    /// Finance lane where it has one, put in force by a judicial clone
    /// every member signs, recorded. Its work's publication and pointer.
    fn setup_sales(&mut self) {
        let svc = self.w.genesis("the split service", vec![own_home()], None, None);
        self.agents.push(svc.clone());
        let agent = self.agents.len() - 1;
        let gi = self.make_grant(0, agent, true, true, true, true);
        let g = self.grants[gi].id;
        let mut t = self.view().terms(&self.founding).unwrap();
        t.parent = Some(self.founding);
        t.split_grant = Some(g);
        t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Judicial, signers: sorted(self.ids()) }]);
        let k = law_act(&mut self.w, &mut self.m[0][0], law::types::TERMS, t.to_map(), obj(self.founding));
        let sigs: Vec<Hash> = (0..self.m.len()).map(|i| sign(&mut self.w, &mut self.m[i][0], &k)).collect();
        let r = Record { clone: Some(k), signatures: Some(sigs), kept: vec![], registers: None };
        let rec = self.record(0, r, k, &[], true);
        self.current = k;
        for s in self.grants[gi].strands.iter_mut() {
            s.cite.as_mut().unwrap().1.push(rec);
        }
        let ptr = mor_core::finance::Payload::PayeePointer(mor_core::finance::PayeePointer {
            payee: self.col,
            version: 1,
            previous: None,
            rails: vec![mor_core::finance::Rail { module: rail(), address: b"an address".to_vec() }],
        });
        let x = self.act_on(Who2::Dev(0), mips().finance, 0, ptr.to_map(), vec![], &[], true, Seal::Public, None, &[]);
        self.lane_sign(&x);
        let p = self.act_on(Who2::Dev(0), mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(self.work.to_vec()))], vec![], &[], true, Seal::Public, None, &[]);
        self.note(p, Seal::Public, true, None, K::Publication);
        self.publication = Some(p);
    }

    /// A record on device `d`: a decision citing by its kept tips (F127).
    fn record(&mut self, d: usize, r: Record, named: Hash, _tips: &[usize], inform: bool) -> Hash {
        let saved = self.c[d].cite.take();
        let a = self.w.everyday_act(&mut self.c[d], mips().law, law::types::RECORD, r.to_map(), obj(named), None);
        self.c[d].cite = saved;
        let id = self.w.add(&a);
        for (i, dev) in self.c.iter_mut().enumerate() {
            if inform || i == d {
                dev.cite.as_mut().unwrap().1.push(id);
            }
        }
        self.records.push(id);
        id
    }

    fn make_grant(&mut self, d: usize, agent: usize, in_area: bool, accept: bool, holders_sign: bool, service: bool) -> usize {
        let in_area = in_area && self.shape.lane.is_some();
        let a = self.agents[agent].clone();
        let n = self.grants.len();
        let (k, pk) = grant_key(&format!("{:?} grant {n}", a.id));
        let g = Grant {
            grantee: a.id,
            scope: 2,
            agreements: None,
            this_agreement: false,
            limits: None,
            limits_cmip: None,
            area: in_area.then_some(2),
            kinds: in_area.then(|| vec![Kind::Layer(law::layers::FINANCE)]),
            reinstates: None,
            by_this: false,
            key: pk,
        };
        let id = self.act_on(Who2::Dev(d), mips().law, law::types::GRANT, g.to_map(), vec![], &[], true, Seal::Public, None, &[]);
        self.note(id, Seal::Public, true, None, K::GrantAct);
        if in_area && holders_sign {
            self.lane_sign(&id);
        }
        if accept {
            sign(&mut self.w, &mut self.agents[agent], &id);
        }
        let mut strand = self.c[0].clone();
        strand.binding = id;
        strand.sign = k.clone();
        strand.seq = vec![];
        strand.cite = Some((self.col, vec![id]));
        self.grants.push(GrantInfo { id, agent, in_area, accepted: accept, holders_signed: holders_sign, strands: vec![strand.clone(), strand], service });
        n
    }

    fn debt_payload(&self, creditor: Hash, amount: u64) -> Vec<(Value, Value)> {
        Fin::Obligation(fin::Obligation { debtor: self.col, creditor, amount: Amount { unit: unit(), value: amount }, pointer: spec("its pointer"), agreement: None }).to_map()
    }

    /// The line a fork or closing draws: each device's tip, `stale` acts back.
    fn line(&self, stale: u8) -> Vec<KeptTip> {
        let mut out: Vec<KeptTip> = self
            .c
            .iter()
            .filter(|d| !d.seq.is_empty())
            .map(|d| tip_at(&d.seq, d.seq.len().saturating_sub(stale as usize).max(1)))
            .collect();
        if self.line_strands {
            for g in &self.grants {
                out.extend(g.strands.iter().filter(|d| !d.seq.is_empty()).map(|d| tip_at(&d.seq, d.seq.len())));
            }
        }
        out
    }

    /// A successor collective founded by one side of a fork (N4), keeping
    /// every member leaving at their share.
    fn successor(&mut self, members: &[usize], kept: &[(Hash, u64)]) -> Hash {
        let ids = self.ids();
        let side: Vec<Hash> = members.iter().map(|i| ids[*i]).collect();
        let n = self.successors.len();
        let auth = spec("a successor's authority");
        let mut t = col_terms(&side, auth, &Shape { lane: None, owns_work: false, constitutional: None, ..self.shape.clone() }, self.work);
        if !kept.is_empty() {
            let rest = 1_000_000 - kept.iter().map(|(_, n)| n).sum::<u64>();
            let shares = {
                let each = rest / side.len() as u64;
                let mut v = vec![each; side.len()];
                v[0] += rest - each * side.len() as u64;
                v
            };
            let mut holders: Vec<(Who, u64)> = kept.iter().map(|(h, n)| (Who::Id(*h), *n)).collect();
            holders.extend(side.iter().zip(shares).map(|(h, n)| (Who::Id(*h), n)));
            t.stakes = Some(vec![law::Stake { object: Who::This, holders }]);
            t.departed = Some(kept.iter().map(|(h, _)| *h).collect());
        }
        t.forked_from = Some(self.col);
        let x = law_act(&mut self.w, &mut self.m[members[0]][0], law::types::TERMS, t.to_map(), None);
        for i in members {
            sign(&mut self.w, &mut self.m[*i][0], &x);
        }
        let mut p = self.w.genesis_with(&format!("successor {n}"), vec![own_home()], None, None, Some(vec![law::founding_declaration(&mips().law, &x)]), 3);
        p.cite = Some((p.id, vec![p.id]));
        self.successors.push(p.id);
        self.succ_people.push(p.clone());
        p.id
    }
}

#[derive(Clone, Copy)]
enum Who2 {
    Dev(usize),
    Strand(usize, usize),
}

impl ColWorld {
    fn apply(&mut self, i: usize, op: &Op) {
        // Each step draws its own randomness from what it is, so that
        // shrinking a story never changes the steps it keeps.
        self.rng = Lcg(u64::from_le_bytes(sha256(format!("{op:?}/{}", self.seed).as_bytes())[..8].try_into().unwrap()));
        self.step = i;
        let devs = self.c.len();
        match *op {
            Op::Publish { dev, seal } => {
                let d = dev as usize % devs;
                let x = self.act_on(Who2::Dev(d), mips().envelope, 0, vec![(Value::Uint(0), Value::Text("a publication".into()))], vec![], &[], true, seal, None, &[]);
                self.note(x, seal, true, None, K::Publication);
            }
            Op::Debt { dev, seal, cited, creditor, amount, lane_sign } => {
                let d = dev as usize % devs;
                let cr = self.creditors[creditor as usize % 2].id;
                let p = self.debt_payload(cr, amount as u64);
                let x = self.act_on(Who2::Dev(d), mips().finance, 1, p, vec![], &[], cited, seal, None, &[cr]);
                self.note(x, seal, cited, None, K::Debt { creditor: cr, amount: amount as u64 });
                if lane_sign && self.shape.lane.is_some() {
                    let s = self.lane_sign(&x);
                    self.info.get_mut(&x).unwrap().lane_signed = s;
                }
                self.debts.push(x);
            }
            Op::Join { dev, other } => {
                let heads = self.heads();
                if heads.is_empty() {
                    return;
                }
                let d = dev as usize % devs;
                let h = heads[other as usize % heads.len()];
                let x = self.act_on(Who2::Dev(d), mips().envelope, 0, vec![(Value::Uint(0), Value::Text("a joining publication".into()))], vec![], &[h], true, Seal::Public, None, &[]);
                self.note(x, Seal::Public, true, None, K::Publication);
                if self.info.contains_key(&h) {
                    let lv = self.view();
                    if self.counts(&lv, &h) && self.counts(&lv, &x) {
                        drop(lv);
                        self.cited_counting.push((h, x));
                    }
                }
            }
            Op::Grant { dev, agent, in_area, accept, holders_sign } => {
                if self.grants.len() >= 4 {
                    return;
                }
                self.make_grant(dev as usize % devs, agent as usize % 2, in_area, accept, holders_sign, false);
            }
            Op::AgentAct { grant, strand, what, seal } => {
                let ordinary: Vec<usize> = (0..self.grants.len()).filter(|g| !self.grants[*g].service).collect();
                if ordinary.is_empty() {
                    return;
                }
                let gi = ordinary[grant as usize % ordinary.len()];
                let s = strand as usize % 2;
                let finance_in = self.grants[gi].in_area;
                let finance = match what {
                    AgentWhat::InScope => finance_in,
                    _ => !finance_in,
                };
                let cr = self.creditors[0].id;
                let (x, kind) = match what {
                    AgentWhat::InScope | AgentWhat::OutOfScope if finance => {
                        let p = self.debt_payload(cr, 25);
                        let x = self.act_on(Who2::Strand(gi, s), mips().finance, 1, p, vec![], &[], true, seal, None, &[cr]);
                        self.debts.push(x);
                        (x, K::Debt { creditor: cr, amount: 25 })
                    }
                    AgentWhat::InScope | AgentWhat::OutOfScope => {
                        let x = self.act_on(Who2::Strand(gi, s), mips().envelope, 0, vec![(Value::Uint(0), Value::Text("an agent's publication".into()))], vec![], &[], true, seal, None, &[]);
                        (x, K::Publication)
                    }
                    AgentWhat::Record => {
                        let r = Record { clone: None, signatures: None, kept: vec![], registers: Some(vec![spec("a departure")]) };
                        let x = self.act_on(Who2::Strand(gi, s), mips().law, law::types::RECORD, r.to_map(), vec![Object { chain: self.current, predecessor: self.current }], &[], true, seal, None, &[]);
                        (x, K::Record)
                    }
                    AgentWhat::Grant => {
                        let (_, pk) = grant_key("a grant the grant key made");
                        let g = Grant { grantee: self.agents[0].id, scope: 2, agreements: None, this_agreement: false, limits: None, limits_cmip: None, area: None, kinds: None, reinstates: None, by_this: false, key: pk };
                        let x = self.act_on(Who2::Strand(gi, s), mips().law, law::types::GRANT, g.to_map(), vec![], &[], true, seal, None, &[]);
                        (x, K::GrantAct)
                    }
                    AgentWhat::Revocation => {
                        let r = law::Revocation { grant: self.grants[gi].id };
                        let x = self.act_on(Who2::Strand(gi, s), mips().law, law::types::REVOCATION, r.to_map(), vec![], &[], true, seal, None, &[]);
                        (x, K::Revocation { grant: gi })
                    }
                };
                self.note(x, seal, true, Some(gi), kind);
            }
            Op::Revoke { grant, dev, join_strand, holders_sign } => {
                if self.grants.is_empty() {
                    return;
                }
                let gi = grant as usize % self.grants.len();
                let joined: Vec<Hash> = if join_strand { self.grants[gi].strands.iter().filter_map(|s| s.seq.last().copied()).collect() } else { vec![] };
                let r = law::Revocation { grant: self.grants[gi].id };
                let x = self.act_on(Who2::Dev(dev as usize % devs), mips().law, law::types::REVOCATION, r.to_map(), vec![], &joined, true, Seal::Public, None, &[]);
                self.note(x, Seal::Public, true, None, K::Revocation { grant: gi });
                if self.grants[gi].in_area && holders_sign {
                    let s = self.lane_sign(&x);
                    self.info.get_mut(&x).unwrap().lane_signed = s;
                }
            }
            Op::Ack { dev, target } => {
                let agent_acts: Vec<Hash> = self.info.iter().filter(|(_, f)| f.grant.is_some()).map(|(x, _)| *x).collect();
                if agent_acts.is_empty() {
                    return;
                }
                let t = agent_acts[target as usize % agent_acts.len()];
                let d = dev as usize % devs;
                let x = self.w.ack(&mut self.c[d], t);
                self.note(x, Seal::Public, true, None, K::Ack { target: t });
            }
            Op::Resign { member, area_only, dev, tips, inform } => {
                let n = self.m.len();
                let i = member as usize % n;
                let who = self.ids()[i];
                if self.gone().contains(&who) || self.gone().len() + 1 >= n {
                    return;
                }
                let area_only = area_only && self.lane_now().contains(&who);
                let res = Resignation { agreement: self.current, area: area_only.then_some(2) };
                let cur = self.current;
                let res = law_act(&mut self.w, &mut self.m[i][0], law::types::RESIGNATION, res.to_map(), obj(cur));
                let d = dev as usize % devs;
                let kept: Vec<KeptTip> = self
                    .c
                    .iter()
                    .enumerate()
                    .filter(|(j, x)| *j != d && !x.seq.is_empty() && tips & (1 << j) != 0)
                    .map(|(_, x)| tip_at(&x.seq, x.seq.len()))
                    .collect();
                let r = Record { clone: None, signatures: None, kept, registers: Some(vec![res]) };
                let rec = self.record(d, r, cur, &[], inform);
                self.note(rec, Seal::Public, true, None, K::Record);
                self.departures.push((rec, who, area_only));
                let _ = i;
            }
            Op::Fork { stale, sides, debts, seal, all_sign, succ_sign, names } => {
                if self.endings.iter().filter(|e| e.fork).count() >= 2 {
                    return;
                }
                let ids = self.ids();
                let gone = self.gone();
                let voices: Vec<usize> = (0..ids.len()).filter(|i| !gone.contains(&ids[*i])).collect();
                if voices.len() < 2 {
                    return;
                }
                let mut leaving = vec![];
                let mut on: Vec<usize> = voices.clone();
                if self.shape.constitutional.is_some() && sides & 0x80 != 0 && voices.len() >= 3 {
                    leaving.push(on.remove(0));
                }
                let mut a: Vec<usize> = on.iter().enumerate().filter(|(k, _)| sides & (1 << k) != 0).map(|(_, v)| *v).collect();
                let mut b: Vec<usize> = on.iter().copied().filter(|v| !a.contains(v)).collect();
                if a.is_empty() {
                    a.push(b.pop().unwrap());
                } else if b.is_empty() {
                    b.push(a.pop().unwrap());
                }
                let pct = alike(voices.len());
                let kept: Vec<(Hash, u64)> = leaving.iter().map(|l| (ids[*l], pct[voices.iter().position(|v| v == l).unwrap()])).collect();
                let sa = self.successor(&a, &kept);
                let sb = self.successor(&b, &kept);
                let tips = self.line(stale);
                let chain_act = self.c[0].binding;
                let owed = self.view().hand_out(&self.col, &self.current, &chain_act, &tips).ok().flatten().unwrap_or_default();
                let mut list: Vec<(Hash, Vec<u64>)> = owed.iter().map(|d| (*d, match self.rng.below(3) { 0 => vec![0], 1 => vec![1], _ => vec![0, 1] })).collect();
                match debts {
                    DebtsMode::Honest => {}
                    DebtsMode::DropOne => {
                        if !list.is_empty() {
                            let k = self.rng.below(list.len());
                            list.remove(k);
                        }
                    }
                    DebtsMode::Nothing => list.clear(),
                    DebtsMode::Extra => {
                        if let Some(d) = self.debts.iter().find(|d| !owed.contains(d)) {
                            list.push((*d, vec![0]));
                        }
                    }
                }
                let f = law::Fork {
                    agreement: self.current,
                    collective: self.col,
                    chain_act,
                    tips: tips.clone(),
                    sides: vec![law::Side { successor: sa, members: a.iter().map(|i| ids[*i]).collect() }, law::Side { successor: sb, members: b.iter().map(|i| ids[*i]).collect() }],
                    shares: vec![],
                    debts: list,
                };
                let signer = a[0];
                let o = self.ending_objects(names);
                let x = match seal {
                    Seal::Public => law_act(&mut self.w, &mut self.m[signer][0], law::types::FORK, f.to_map(), o),
                    _ => {
                        let keep = if seal == Seal::All { ids.len() } else { ids.len() - 1 };
                        let to: Vec<Hash> = ids.iter().take(keep).copied().collect();
                        self.w.private_act(&mut self.m[signer][0], mips().law, law::types::FORK, f.to_map(), o, to)
                    }
                };
                self.member_end(signer, &x, false);
                let others: Vec<usize> = a.iter().chain(b.iter()).copied().filter(|m| *m != signer).collect();
                let skip = if all_sign { usize::MAX } else { self.rng.below(others.len().max(1)) };
                for (k, m) in others.iter().enumerate() {
                    if k != skip {
                        self.member_end(*m, &x, false);
                    }
                }
                let n = self.succ_people.len();
                for (k, j) in [n - 2, n - 1].into_iter().enumerate() {
                    if succ_sign || k == 0 {
                        let mut p = self.succ_people[j].clone();
                        sign(&mut self.w, &mut p, &x);
                        self.succ_people[j] = p;
                    }
                }
                let listed = a.iter().chain(b.iter()).map(|m| ids[*m]).collect();
                self.endings.push(EndingInfo { id: x, fork: true, tips: tips.iter().map(|t| t.act).collect(), listed });
            }
            Op::Closing { stale, seal, all_sign, names } => {
                if self.endings.len() >= 3 {
                    return;
                }
                let ids = self.ids();
                let gone = self.gone();
                let voices: Vec<usize> = (0..ids.len()).filter(|i| !gone.contains(&ids[*i])).collect();
                let tips = self.line(stale);
                let c = law::Closing { agreement: self.current, collective: self.col, chain_act: self.c[0].binding, tips: tips.clone() };
                if voices.is_empty() {
                    return;
                }
                // Who signs: every voice; or, under a threshold, sometimes
                // just enough of them from a random start, so that two
                // closings may share no signer (a true tie, F132 U1); or
                // every voice but one.
                let signers: Vec<usize> = match self.shape.constitutional {
                    _ if all_sign => voices.clone(),
                    Some(k) if self.rng.below(2) == 0 => {
                        let o = self.rng.below(voices.len());
                        (0..(k as usize).clamp(1, voices.len())).map(|j| voices[(o + j) % voices.len()]).collect()
                    }
                    _ => {
                        let skip = 1 + self.rng.below(voices.len().saturating_sub(1).max(1));
                        voices.iter().enumerate().filter(|(k, _)| *k != skip).map(|(_, m)| *m).collect()
                    }
                };
                let signer = signers[0];
                let o = self.ending_objects(names);
                let x = match seal {
                    Seal::Public => law_act(&mut self.w, &mut self.m[signer][0], law::types::CLOSING, c.to_map(), o),
                    _ => {
                        let keep = if seal == Seal::All { ids.len() } else { ids.len() - 1 };
                        let to: Vec<Hash> = ids.iter().take(keep).copied().collect();
                        self.w.private_act(&mut self.m[signer][0], mips().law, law::types::CLOSING, c.to_map(), o, to)
                    }
                };
                for m in &signers {
                    self.member_end(*m, &x, false);
                }
                let listed = voices.iter().map(|m| ids[*m]).collect();
                self.endings.push(EndingInfo { id: x, fork: false, tips: tips.iter().map(|t| t.act).collect(), listed });
            }
            Op::LateSign { ending, member } => {
                if self.endings.is_empty() {
                    return;
                }
                let e = &self.endings[ending as usize % self.endings.len()];
                let x = e.id;
                let unsigned: Vec<Hash> = e.listed.iter().filter(|m| !self.end_sigs.iter().any(|(s, y, _, _)| s == *m && *y == x)).copied().collect();
                if unsigned.is_empty() {
                    return;
                }
                let who = unsigned[member as usize % unsigned.len()];
                let i = self.ids().iter().position(|h| *h == who).unwrap();
                self.member_end(i, &x, true);
            }
            Op::Pay { debt, by, full } => {
                if self.debts.is_empty() {
                    return;
                }
                let o = self.debts[debt as usize % self.debts.len()];
                let K::Debt { creditor, amount } = self.info[&o].kind.clone() else { return };
                let value = if full { amount } else { amount / 2 };
                let rc = |payee: Hash, payer: Hash| {
                    Fin::Receipt(Receipt {
                        rail: rail(),
                        proof: vec![],
                        payer: Some(Payer::Identity(payer)),
                        payee,
                        amount: Amount { unit: unit(), value },
                        fulfils: o,
                        previous: None,
                        forward: None,
                        batch: None,
                        purchase: None,
                    })
                    .to_map()
                };
                let col = self.col;
                match by {
                    PaidBy::Creditor => {
                        let k = self.creditors.iter().position(|c| c.id == creditor).unwrap();
                        let a = self.w.everyday_act(&mut self.creditors[k], mips().finance, 2, rc(creditor, col), None, None);
                        let x = self.w.add(&a);
                        self.paid.push((x, creditor));
                    }
                    PaidBy::Debtor => {
                        let x = self.act_on(Who2::Dev(0), mips().finance, 2, rc(col, col), vec![], &[], true, Seal::Public, None, &[]);
                        self.lane_sign(&x);
                        self.paid.push((x, col));
                    }
                    PaidBy::Stranger => {
                        let s = self.stranger.id;
                        let a = self.w.everyday_act(&mut self.stranger, mips().finance, 2, rc(s, col), None, None);
                        let x = self.w.add(&a);
                        self.paid.push((x, s));
                    }
                }
            }
            Op::Release { debt, by_creditor } => {
                if self.debts.is_empty() {
                    return;
                }
                let o = self.debts[debt as usize % self.debts.len()];
                let K::Debt { creditor, .. } = self.info[&o].kind.clone() else { return };
                let r = Fin::Release(fin::Release { obligation: o, against: vec![] }).to_map();
                let who = if by_creditor { self.creditors.iter_mut().find(|c| c.id == creditor).unwrap() } else { &mut self.stranger };
                let a = self.w.everyday_act(who, mips().finance, fin::types::RELEASE, r, None, None);
                self.w.add(&a);
            }
            Op::Sale { strand, proof, disguise, lane_sign, line_current } => {
                let Some(publication) = self.publication else { return };
                let svc = self.grants.iter().position(|g| g.service).unwrap();
                let who = if strand % 2 == 0 { Who2::Dev((strand as usize / 2) % devs) } else { Who2::Strand(svc, (strand as usize / 2) % 2) };
                let svc_id = self.agents[self.grants[svc].agent].id;
                let r = Fin::Receipt(Receipt {
                    rail: rail(),
                    proof: vec![proof],
                    payer: Some(Payer::Identity(if matches!(disguise, Disguise::PayerIsService) { svc_id } else { spec(&format!("a fan {proof}")) })),
                    payee: self.col,
                    amount: Amount { unit: unit(), value: 10 },
                    fulfils: publication,
                    previous: None,
                    forward: None,
                    batch: matches!(disguise, Disguise::Batch).then(|| spec("a batch")),
                    purchase: Some(Purchase { agreement: self.founding, line: if line_current { self.current } else { self.founding } }),
                });
                let x = self.act_on(who, mips().finance, 2, r.to_map(), vec![], &[], true, Seal::Public, None, &[]);
                let grant = match who {
                    Who2::Strand(g, _) => Some(g),
                    Who2::Dev(_) => None,
                };
                self.note(x, Seal::Public, true, grant, K::Receipt { proof, payer_is_service: matches!(disguise, Disguise::PayerIsService), batch: matches!(disguise, Disguise::Batch) });
                if grant.is_none() && lane_sign {
                    let s = self.lane_sign(&x);
                    self.info.get_mut(&x).unwrap().lane_signed = s;
                }
            }
        }
        let _ = i;
        if self.first_end.is_none() && !self.endings.is_empty() {
            let lv = self.view();
            if let Ok(Some(e)) = lv.closed_by(&self.col) {
                let snap = self.ending_snapshot(&lv, &e.tips.iter().map(|t| t.act).collect::<Vec<_>>());
                self.first_end = Some((i, e.by, snap));
            }
        }
    }

    /// The endings an ending names, directly or through the endings it
    /// names (the oracle's own reading of F131 IT1 and F132 U1): in its
    /// `objects`, read from the acts, or through a member's chain, read
    /// from the generator's own order of the members' ending signatures.
    fn ending_names(&self, x: &Hash) -> BTreeSet<Hash> {
        reach(&self.ending_model().1, x)
    }

    /// The oracle's own reading of F132: the ending signatures that count,
    /// as (member, ending), and the endings each ending names directly.
    /// U4: a member's signature on an ending counts for nothing where the
    /// member signed, earlier, another ending naming it; judged first with
    /// naming by `objects`, then, among the signatures left, with naming
    /// through members' chains too.
    fn ending_model(&self) -> (BTreeSet<(Hash, Hash)>, BTreeMap<Hash, BTreeSet<Hash>>) {
        let (sigs, names, _) = self.ending_model_full();
        (sigs, names)
    }

    /// As `ending_model`, with the endings that are no ending (U4b): their
    /// drafter signed, earlier, another ending they do not name in their
    /// `objects`. Those are left out of the rest.
    fn ending_model_full(&self) -> (BTreeSet<(Hash, Hash)>, BTreeMap<Hash, BTreeSet<Hash>>, BTreeSet<Hash>) {
        let all: BTreeSet<Hash> = self.endings.iter().map(|e| e.id).collect();
        let objects_all: BTreeMap<Hash, BTreeSet<Hash>> = all
            .iter()
            .map(|e| {
                let os = self.w.v.get(e).and_then(|h| h.inside.objects.clone()).unwrap_or_default();
                (*e, os.iter().map(|o| o.predecessor).filter(|p| all.contains(p) && p != e).collect())
            })
            .collect();
        let no_ending: BTreeSet<Hash> = all
            .iter()
            .filter(|e| {
                let Some(d) = self.w.v.get(e).and_then(|h| h.act.outside.signer) else { return false };
                let Some(p) = self.end_sigs.iter().position(|(m, x, _, _)| *m == d && x == *e) else { return false };
                let named = reach(&objects_all, e);
                self.end_sigs[..p].iter().any(|(m, y, _, _)| *m == d && y != *e && !named.contains(y))
            })
            .copied()
            .collect();
        let ends: BTreeSet<Hash> = all.difference(&no_ending).copied().collect();
        let objects: BTreeMap<Hash, BTreeSet<Hash>> = ends
            .iter()
            .map(|e| {
                let os = self.w.v.get(e).and_then(|h| h.inside.objects.clone()).unwrap_or_default();
                (*e, os.iter().map(|o| o.predecessor).filter(|p| ends.contains(p) && p != e).collect())
            })
            .collect();
        let sigs: Vec<(Hash, Hash)> = self.end_sigs.iter().filter(|(_, x, _, _)| ends.contains(x)).map(|(m, x, _, _)| (*m, *x)).collect();
        let voided = |sigs: &[(Hash, Hash)], names: &BTreeMap<Hash, BTreeSet<Hash>>| -> Vec<(Hash, Hash)> {
            sigs.iter()
                .enumerate()
                .filter(|(k, (m, x))| sigs[..*k].iter().any(|(m2, y)| m2 == m && y != x && reach(names, y).contains(x)))
                .map(|(_, s)| *s)
                .collect()
        };
        let chains = |sigs: &[(Hash, Hash)]| {
            let mut names = objects.clone();
            for (k, (m, y)) in sigs.iter().enumerate() {
                for (m2, x) in &sigs[..k] {
                    if m2 == m && x != y {
                        names.entry(*y).or_default().insert(*x);
                    }
                }
            }
            names
        };
        let v1 = voided(&sigs, &objects);
        let left: Vec<(Hash, Hash)> = sigs.iter().filter(|s| !v1.contains(s)).copied().collect();
        let v2 = voided(&left, &chains(&left));
        let left: Vec<(Hash, Hash)> = left.into_iter().filter(|s| !v2.contains(s)).collect();
        let names = chains(&left);
        (left.into_iter().collect(), names, no_ending)
    }

    /// An ending's `objects`: the agreement as chain and predecessor, and,
    /// where it names them, every earlier ending as the act it follows on
    /// that chain (F131, IT1).
    fn ending_objects(&self, names: bool) -> Option<Vec<Object>> {
        let cur = self.current;
        let mut o = obj(cur).unwrap();
        if names {
            o.extend(self.endings.iter().map(|e| Object { chain: cur, predecessor: e.id }));
        }
        Some(o)
    }

    /// What must never change once an ending is complete: whether each act
    /// in its history counts, and whether each debt there binds.
    fn ending_snapshot(&self, lv: &LawView, tips: &[Hash]) -> BTreeMap<Hash, String> {
        let h = history(&self.w.v, &self.col, tips);
        self.info
            .keys()
            .filter(|x| h.contains(*x))
            .map(|x| (*x, format!("counts={:?} backing={:?} binds={:?}", lv.consent(x).map(|c| c.counts()), lv.backing(x).map(|b| binds(&b)), lv.obligation_binds(x))))
            .collect()
    }

    /// Whether an act of the collective counts, as the library says.
    fn counts(&self, lv: &LawView, x: &Hash) -> bool {
        let f = &self.info[x];
        let c = lv.consent(x).map(|c| c.counts()).unwrap_or(false);
        match (&f.kind, f.grant) {
            (K::Debt { .. }, _) => lv.obligation_binds(x).ok().flatten() == Some(true),
            (_, Some(_)) => c && lv.backing(x).map(|b| binds(&b)).unwrap_or(false),
            (K::Record | K::Ack { .. }, None) => false,
            _ => c,
        }
    }

    /// The citing act still stands as the collective's (it is not itself
    /// voided by an ending's tie rule): the counterparty saw a real citation.
    fn counts_or_was(&self, lv: &LawView, x: &Hash) -> bool {
        self.counts(lv, x)
    }

    /// Acts of the collective's own key acknowledging `y` that count: an
    /// adoption (rule 40, A6).
    fn adopters(&self, lv: &LawView, y: &Hash) -> Vec<Hash> {
        // F131 (IT2a): an act of the collective's own key whose history
        // holds it (reading U3) adopts it too.
        let cites = |a: &Hash| history_of(&self.w.v, &self.col, a).contains(y);
        self.info
            .iter()
            // F142 (rule 42): a witness act (K::Ack) is on neither chain, and
            // adopts nothing; the collective adopts by an action citing it.
            .filter(|(a, f)| !matches!(f.kind, K::Ack { .. }) && f.grant.is_none() && *a != y && self.w.v.get(a).is_some_and(|h| h.act.outside.signer == Some(self.col)) && cites(a))
            .filter(|(a, _)| lv.consent(a).map(|c| c.counts()).unwrap_or(false) && self.w.v.status(a) == Status::Valid)
            .map(|(a, _)| *a)
            .collect()
    }

    /// Whether `y`, an act of a grant key, lies within its grant's reach,
    /// as the generator built that grant.
    fn in_reach(&self, y: &Hash) -> bool {
        let f = &self.info[y];
        let g = &self.grants[f.grant.unwrap()];
        let finance = matches!(f.kind, K::Debt { .. } | K::Receipt { .. });
        let decision = matches!(f.kind, K::Record | K::GrantAct | K::Revocation { .. });
        if decision {
            return false;
        }
        if g.in_area {
            finance
        } else {
            !(finance && self.shape.lane.is_some())
        }
    }

    /// Paid in full to the creditor (Finance rule 7: routes ending at the
    /// creditor), or released by the creditor (rule 47b).
    fn settled(&self, o: &Hash) -> bool {
        let K::Debt { creditor, amount } = self.info[o].kind.clone() else { return true };
        let mut paid = 0u64;
        let mut released = false;
        for h in self.w.v.held_acts() {
            if h.inside.spec != mips().finance || self.w.v.status(&h.id) != Status::Valid || h.act.outside.signer != Some(creditor) {
                continue;
            }
            match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Receipt(r)) if r.fulfils == *o && r.payee == creditor => paid += r.amount.value,
                Ok(Fin::Release(r)) if r.obligation == *o => released = true,
                _ => {}
            }
        }
        released || paid >= amount
    }

    /// Every promise, checked on the final state.
    fn check(&self) -> Result<(), String> {
        let mut bad: Vec<String> = vec![];
        let lv = self.view();
        let v = &self.w.v;
        let col = self.col;
        // Done (rule 35a, F126, F128) and cited (rule 35b, F127).
        for (x, f) in &self.info {
            // F156 (rule 35b): the collective's witness act is on neither
            // chain and counts for nothing in Law.
            if matches!(f.kind, K::Ack { .. }) && lv.consent(x).is_ok_and(|c| c.counts()) {
                bad.push(format!("WITNESS-COUNTS: a witness act of the collective counts in Law (F156): {x:?} consent={:?}", lv.consent(x)));
            }
            if f.kind == K::Record || matches!(f.kind, K::Ack { .. }) {
                continue;
            }
            if f.seal == Seal::TooFew && self.counts(&lv, x) {
                bad.push(format!("NOT-DONE: an act sealed to too few members counts ({:?}): {x:?} consent={:?} binds={:?} backing={:?}", f.kind, lv.consent(x), lv.obligation_binds(x), lv.backing(x)));
            }
            if !f.cited && self.counts(&lv, x) {
                bad.push(format!("UNCITED: an act citing nothing on the collective's chain counts ({:?}): {x:?} consent={:?} binds={:?}", f.kind, lv.consent(x), lv.obligation_binds(x)));
            }
        }
        // A grant key: within its grant, never a decision (rules 38, 44; F128).
        for (y, f) in &self.info {
            let Some(gi) = f.grant else { continue };
            let g = &self.grants[gi];
            let b = lv.backing(y).map_err(|e| format!("{e:?}"))?;
            if matches!(f.kind, K::Record | K::GrantAct | K::Revocation { .. }) && (binds(&b) || lv.consent(y).map(|c| c.counts()).unwrap_or(false)) {
                bad.push(format!("GRANT-DECISION: a grant key's {:?} counts: {y:?} {b:?}", f.kind));
            }
            if f.kind == K::Record {
                if let Ok(r) = lv.record(&col, y) {
                    if r.line {
                        bad.push(format!("GRANT-DECISION: a record signed with a grant key is a line: {y:?}"));
                    }
                }
            }
            if !binds(&b) {
                continue;
            }
            if !self.in_reach(y) {
                bad.push(format!("GRANT-SCOPE: an act beyond its grant's reach binds ({:?}, grant in area: {}): {y:?} {b:?}", f.kind, g.in_area));
            }
            if !g.accepted || (g.in_area && !g.holders_signed) {
                bad.push(format!("GRANT-COUNTS: an act of a grant that does not count binds (accepted {}, holders signed {}): {y:?}", g.accepted, g.holders_signed));
            }
            if let K::Receipt { payer_is_service, batch, .. } = f.kind {
                if g.service && (payer_is_service || batch) {
                    bad.push(format!("SERVICE-PAYOUT: the split service's grant key signed a payout as an incoming receipt (payer is service: {payer_is_service}, batch: {batch}): {y:?}"));
                }
            }
            // The tie rule at every revocation of its grant that counts (G1).
            for (r, rf) in &self.info {
                if rf.kind != (K::Revocation { grant: gi }) || rf.grant.is_some() || !lv.consent(r).map(|c| c.counts()).unwrap_or(false) {
                    continue;
                }
                if !history_of(v, &col, r).contains(y) && self.adopters(&lv, y).is_empty() {
                    bad.push(format!("TIE-REVOCATION: an act of a revoked grant key that the revocation's history does not hold, never adopted, binds: {y:?} revocation {r:?} {b:?}"));
                }
            }
            // The tie rule at a line emptying its area (G2).
            if g.in_area {
                for l in &self.records {
                    let hl = history_of(v, &col, l);
                    if !hl.contains(&g.id) {
                        continue;
                    }
                    let gone: Vec<Hash> = self.departures.iter().filter(|(rec, _, _)| rec == l || hl.contains(rec)).map(|(_, p, _)| *p).collect();
                    if self.lane_holders.iter().all(|h| gone.contains(h)) && !hl.contains(y) && self.adopters(&lv, y).is_empty() {
                        bad.push(format!("TIE-EMPTIED: an act of a grant key whose area a line emptied, not in that line's history, never adopted, binds: {y:?} line {l:?} {b:?}"));
                    }
                }
            }
        }
        // Endings: the tie rule, handing out, owing (rules 47a, 47b; F127).
        let ended = lv.closed_by(&col).map_err(|e| format!("{e:?}"))?;
        if let Some(e) = &ended {
            let he = history(v, &col, &e.tips.iter().map(|t| t.act).collect::<Vec<_>>());
            for (x, f) in &self.info {
                if matches!(f.kind, K::Record | K::Ack { .. } | K::Revocation { .. } | K::GrantAct) && f.grant.is_none() {
                    continue;
                }
                if !self.counts(&lv, x) || he.contains(x) {
                    continue;
                }
                if f.grant.is_some() && self.adopters(&lv, x).iter().any(|a| he.contains(a)) {
                    continue;
                }
                bad.push(format!("TIE-ENDING: an act outside the history of the ending {:?} counts ({:?}): {x:?}", e.by, f.kind));
            }
        }
        for en in &self.endings {
            let he = history(v, &col, &en.tips);
            if en.fork {
                let fe = lv.fork(&en.id).map_err(|e| format!("{e:?}"))?;
                if !fe.complete {
                    continue;
                }
                let listed: Vec<Hash> = fe.fork.debts.iter().map(|(d, _)| *d).collect();
                for d in &self.debts {
                    let f = &self.info[d];
                    let should = he.contains(d)
                        && f.seal != Seal::TooFew
                        && f.cited
                        && match f.grant {
                            None => self.shape.lane.is_none() || !f.lane_signed.is_empty(),
                            Some(_) => self.in_reach(d) && { let g = &self.grants[f.grant.unwrap()]; g.accepted && (!g.in_area || g.holders_signed) },
                        };
                    if should && !listed.contains(d) {
                        bad.push(format!("FORK-HANDS-OUT: a complete fork {:?} leaves out a debt in its history: {d:?}", en.id));
                    }
                }
                // No successor owes a debt not handed to it, nor one outside
                // the fork's history (the tie rule).
                if ended.as_ref().map(|e| e.by) == Some(en.id) {
                    for d in &self.debts {
                        let ds = lv.debtors(d).map_err(|e| format!("{e:?}"))?.unwrap_or_default();
                        for s in &ds {
                            let side = fe.fork.sides.iter().position(|x| &x.successor == s);
                            let assigned = fe.fork.debts.iter().any(|(o, sides)| o == d && side.is_some_and(|i| sides.contains(&(i as u64))));
                            if side.is_some() && !assigned {
                                bad.push(format!("FORK-OWES: successor {s:?} owes debt {d:?}, which the fork did not hand it"));
                            }
                        }
                        if !ds.is_empty() && !he.contains(d) {
                            bad.push(format!("FORK-OWES: debt {d:?}, outside the fork's history, is owed by {ds:?} (the tie rule: no successor owes it)"));
                        }
                    }
                }
            } else {
                let ce = lv.closing(&en.id).map_err(|e| format!("{e:?}"))?;
                if !ce.complete {
                    continue;
                }
                for d in &self.debts {
                    if he.contains(d) && lv.obligation_binds(d).ok().flatten() == Some(true) && !self.settled(d) {
                        bad.push(format!("CLOSING-OWES: a complete closing {:?} with an open debt in its history: {d:?} (paid to the creditor or released: no)", en.id));
                    }
                }
            }
        }
        // A counterparty that waited until a later act of the collective cited
        // its act is safe: from then on it is in every ending's history
        // (rules 35a, 43; F128).
        for (y, by) in &self.cited_counting {
            if !self.counts(&lv, y) {
                let code = if self.counts_or_was(&lv, by) { "SAFE-ONCE-CITED" } else { "SAFE-STALE-LINE" };
                bad.push(format!("{code}: act {y:?} counted and a later act of the collective {by:?} cited it, yet it no longer counts ({:?}; backing {:?}; binds {:?}; the citing act counts: {})", self.info[y].kind, lv.backing(y), lv.obligation_binds(y), self.counts(&lv, by)));
            }
        }
        // A member signs an ending by a chain signature (F132); one placed
        // after the member's signature on another ending naming it counts
        // for nothing (U4).
        let (counting, _, no_ending) = self.ending_model_full();
        let lib: BTreeSet<Hash> = lv.ending_sigs(&col).no_ending.keys().copied().collect();
        if lib != no_ending {
            bad.push(format!("ENDING-NO-ENDING: the library's endings that are no ending {lib:?}, expected {no_ending:?} (F132 U4b)"));
        }
        for x in &self.endings {
            for m in &x.listed {
                let want = counting.contains(&(*m, x.id));
                let got = !lv.ending_signed(&col, &x.id, &[*m]).is_empty();
                if want != got {
                    bad.push(format!("ENDING-SIGNATURES: {m:?}'s signature on the ending {:?} counts: {got}, expected {want} (F132 U1, U4)", x.id));
                }
            }
        }
        // Nothing published after a complete ending undoes it (F131, IT1):
        // a later ending names it, in its objects or through a member's
        // chain (F132 U1), and counts for nothing. Only a later ending
        // sharing no signer with it and naming none of the earlier ones is
        // concurrent: neither counts (ENDING-RACE, counted). U4's stated
        // cost (U4b): an old proposal the complete ending's drafter never
        // signed nor named, finished late (ENDING-LATE, counted).
        if let Some((at, e, snap)) = &self.first_end {
            let now = lv.closed_by(&col).map_err(|e| format!("{e:?}"))?.map(|c| c.by);
            let complete = |x: &EndingInfo| -> bool {
                if x.fork { lv.fork(&x.id).is_ok_and(|f| f.complete) } else { lv.closing(&x.id).is_ok_and(|c| c.complete) }
            };
            let unnamed = self.endings.iter().any(|x| x.id != *e && complete(x) && !self.ending_names(&x.id).contains(e));
            // U4's stated cost (F132, U4b): the complete ending's drafter
            // never signed, before it, an old proposal it does not name,
            // and that proposal was signed late, after it.
            let drafter = self.w.v.get(e).and_then(|h| h.act.outside.signer);
            let pe = self.end_sigs.iter().position(|(m, x, _, _)| Some(*m) == drafter && x == e).unwrap_or(0);
            let named: BTreeSet<Hash> = self.w.v.get(e).and_then(|h| h.inside.objects.clone()).unwrap_or_default().iter().map(|o| o.predecessor).collect();
            let late = self.end_sigs.iter().any(|(_, x, s, late)| {
                *late && s > at && x != e && !named.contains(x) && !self.end_sigs[..pe].iter().any(|(m, y, _, _)| Some(*m) == drafter && y == x)
            });
            let code = if late { "ENDING-LATE" } else if unnamed { "ENDING-RACE" } else { "ENDING-UNDONE" };
            if now != Some(*e) {
                bad.push(format!("{code}: the ending {e:?}, complete after step {at}, no longer ends the collective (now {now:?})"));
            }
            let tips: Vec<Hash> = self.endings.iter().find(|x| x.id == *e).map(|x| x.tips.clone()).unwrap_or_default();
            let again = self.ending_snapshot(&lv, &tips);
            for (x, s) in snap {
                if again.get(x) != Some(s) {
                    bad.push(format!("{code}: act {x:?} in the ending's history changed after it: {s} -> {:?}", again.get(x)));
                }
            }
        }
        // A purchase (rule 32a, F127 W2): never a purchase and owed back at once.
        let mut by_proof: BTreeMap<u8, Vec<(Hash, String)>> = BTreeMap::new();
        for (x, f) in &self.info {
            if let K::Receipt { proof, .. } = f.kind {
                let p = lv.purchase(x).map_err(|e| format!("{e:?}"))?.map(|p| p.verdict);
                let tag = match p {
                    Some(law::PurchaseVerdict::Purchase) => "purchase",
                    Some(law::PurchaseVerdict::NoPurchase { .. }) => "refund",
                    Some(law::PurchaseVerdict::Unrecorded) => "unrecorded",
                    Some(law::PurchaseVerdict::WrongReceipt { .. }) => "wrong",
                    None => "none",
                };
                if tag == "purchase" && !self.counts(&lv, x) && !by_proof.contains_key(&proof) {
                    // checked below against its siblings
                }
                by_proof.entry(proof).or_default().push((*x, tag.into()));
            }
        }
        for (proof, rs) in &by_proof {
            let p = rs.iter().any(|(_, t)| t == "purchase");
            let r = rs.iter().any(|(_, t)| t == "refund");
            if p && r {
                bad.push(format!("PURCHASE-AND-REFUND: one payment (rail proof {proof}) is both a purchase and owed back: {rs:?}"));
            }
            // Recorded (rule 32a): a receipt that counts, or an act of the
            // collective that counts acknowledging one.
            let recorded = rs.iter().any(|(x, _)| self.counts(&lv, x) || !self.adopters(&lv, x).is_empty());
            if p && !recorded {
                bad.push(format!("PURCHASE-UNRECORDED: a purchase no act of the collective that counts records (proof {proof}): {rs:?}"));
            }
        }
        Violations(bad).into_result()
    }
}

/// Violations found in one case, one per kind (the word before the colon).
struct Violations(Vec<String>);

/// Promises the text itself lets break (TEXT findings): counted, shown by a
/// named test each, and reported for Nobody, allegedly; never "fixed" here.
///
/// After F131: IT1, IT2a and IT3 are decided, and ENDING-UNDONE,
/// SAFE-ONCE-CITED and PAYMENT-CLAIMS-DISAGREE are failures again.
/// SAFE-STALE-LINE is IT2b's stated cost (an ending whose line leaves out
/// the citing act: its signers colluding, or a client breaking the
/// conformance rule), counted, not failed. ENDING-RACE is a later ending
/// naming none of the earlier ones, open for Nobody, allegedly (U1).
///
/// After F132: an ending is signed on each member's identity chain, so
/// ENDING-UNDONE fails wherever the two endings share a signer;
/// ENDING-RACE now counts only endings sharing no signer (a true tie,
/// settled by a third ending naming both, U2). ENDING-LATE is U4's stated
/// cost (U4b): the complete ending's drafter never signed an old proposal
/// it leaves unnamed, which is then finished late.
const TEXT: &[&str] = &["SAFE-STALE-LINE", "ENDING-RACE", "ENDING-LATE"];

fn known() -> &'static Stats {
    static S: std::sync::OnceLock<Stats> = std::sync::OnceLock::new();
    S.get_or_init(|| Stats::new(TEXT))
}

impl Violations {
    fn into_result(self) -> Result<(), String> {
        let mut seen = BTreeSet::new();
        let mut out = vec![];
        for v in self.0 {
            let code = v.split(':').next().unwrap_or("").to_string();
            if !seen.insert(code.clone()) {
                continue;
            }
            match TEXT.iter().find(|t| **t == code) {
                Some(t) => known().hit(t),
                None => out.push(v),
            }
        }
        if out.is_empty() { Ok(()) } else { Err(out.join("\n")) }
    }
}

fn col_stats() -> &'static Stats {
    static S: std::sync::OnceLock<Stats> = std::sync::OnceLock::new();
    S.get_or_init(|| Stats::new(&["cases", "acts", "fork_complete", "closing_complete", "ended", "revocation_counts", "area_emptied", "grant_binds", "grant_void", "debt_binds", "purchase", "refund", "adopted_by_citation", "later_ending_named", "named_through_chains", "ending_signatures", "late_signature_counts", "late_signature_void", "tie_unsettled", "no_ending"]))
}

fn run_col(shape: &Shape, ops: &[Op], seed: u64) -> ColWorld {
    let mut cw = ColWorld::new(shape, seed);
    for (i, o) in ops.iter().enumerate() {
        cw.apply(i, o);
    }
    cw
}

fn tally(cw: &ColWorld) {
    let s = col_stats();
    let lv = cw.view();
    s.hit("cases");
    for _ in 0..cw.w.log.len() {
        s.hit("acts");
    }
    if lv.closed_by(&cw.col).ok().flatten().is_some() {
        s.hit("ended");
    }
    for e in &cw.endings {
        if e.fork && lv.fork(&e.id).is_ok_and(|f| f.complete) {
            s.hit("fork_complete");
        }
        if !e.fork && lv.closing(&e.id).is_ok_and(|c| c.complete) {
            s.hit("closing_complete");
        }
        if let Some((_, first, _)) = &cw.first_end {
            if e.id != *first && cw.ending_names(&e.id).contains(first) {
                s.hit("later_ending_named");
                if !lv.ending_objects(&cw.col, &e.id).contains(first) {
                    s.hit("named_through_chains");
                }
            }
        }
    }
    let (counting, _) = cw.ending_model();
    for (m, x, _, late) in &cw.end_sigs {
        s.hit("ending_signatures");
        if *late {
            s.hit(if counting.contains(&(*m, *x)) { "late_signature_counts" } else { "late_signature_void" });
        }
    }
    for _ in cw.ending_model_full().2 {
        s.hit("no_ending");
    }
    let complete = cw.endings.iter().filter(|x| if x.fork { lv.fork(&x.id).is_ok_and(|f| f.complete) } else { lv.closing(&x.id).is_ok_and(|c| c.complete) }).count();
    if complete >= 2 && lv.closed_by(&cw.col).ok().flatten().is_none() {
        s.hit("tie_unsettled");
    }
    for (x, f) in &cw.info {
        if matches!(f.kind, K::Revocation { .. }) && f.grant.is_none() && lv.consent(x).is_ok_and(|c| c.counts()) {
            s.hit("revocation_counts");
        }
        if f.grant.is_some() {
            if lv.backing(x).is_ok_and(|b| binds(&b)) {
                s.hit("grant_binds");
                if cw.adopters(&lv, x).iter().any(|a| !matches!(cw.info[a].kind, K::Ack { .. })) {
                    s.hit("adopted_by_citation");
                }
            } else {
                s.hit("grant_void");
            }
        }
        if matches!(f.kind, K::Debt { .. }) && lv.obligation_binds(x).ok().flatten() == Some(true) {
            s.hit("debt_binds");
        }
        if matches!(f.kind, K::Receipt { .. }) {
            match lv.purchase(x).ok().flatten().map(|p| p.verdict) {
                Some(law::PurchaseVerdict::Purchase) => s.hit("purchase"),
                Some(law::PurchaseVerdict::NoPurchase { .. }) => s.hit("refund"),
                _ => {}
            }
        }
    }
    if cw.shape.lane.is_some() && cw.lane_now().is_empty() {
        s.hit("area_emptied");
    }
}

fn story() -> impl Strategy<Value = (Shape, Vec<Op>, u64)> {
    (shape(), prop::collection::vec(op(), 1..28), any::<u64>())
}

/// Every promise over random collective histories.
#[test]
fn collective_promises_hold() {
    let (mut runner, run) = runner("collective_promises_hold", 48);
    let r = runner.run(&story(), |(shape, ops, seed)| {
        let cw = run_col(&shape, &ops, seed);
        tally(&cw);
        cw.check().map_err(TestCaseError::fail)
    });
    col_stats().show("collective_promises_hold");
    known().show("stated costs and open questions met (not failures)");
    if let Err(e) = r {
        run.failed(e);
    }
}

/// Rule 15a (F150): leftovers by largest remainder, ties by the receipt's
/// hash with each holder. Over random stakes, amounts and receipts:
/// listing the holders in another order moves no unit; the parts sum
/// exactly; each is its exact share rounded down or up; a holder rounded
/// up never has a smaller remainder than one rounded down, and where the
/// remainders are equal, never a larger tie key.
#[test]
fn leftovers_ignore_the_order_of_holders() {
    let (mut runner, run) = runner("leftovers_ignore_the_order_of_holders", 2000);
    let strategy = (
        prop::collection::vec(1u64..1_000_000, 1..9),
        prop_oneof![0u64..10, 0u64..1_000_000, any::<u64>()],
        any::<[u8; 32]>(),
        any::<u64>(),
        any::<bool>(),
    );
    let r = runner.run(&strategy, |(weights, amount, receipt, shuffle, equal)| {
        // Shares in millionths summing exactly, equal ones where asked, so
        // that ties arise.
        let n = weights.len();
        let shares: Vec<u64> = if equal {
            let mut v = vec![1_000_000 / n as u64; n];
            v[0] += 1_000_000 - v.iter().sum::<u64>();
            v
        } else {
            let total: u64 = weights.iter().sum();
            let mut v: Vec<u64> = weights.iter().map(|w| w * 1_000_000 / total).collect();
            let rest = 1_000_000 - v.iter().sum::<u64>();
            v[n - 1] += rest;
            v
        };
        let holders: Vec<(Hash, u64)> = shares.iter().enumerate().map(|(i, s)| (sha256(format!("holder {i}").as_bytes()), *s)).collect();
        // Turns so far (F165), drawn from the case.
        let counts: Vec<u64> = (0..n).map(|i| u64::from(receipt[i % 32] % 3)).collect();
        let parts = law::divide_stake(amount, &holders, law::Ties::Turns(&counts)).map_err(TestCaseError::fail)?;
        let sum: u128 = parts.iter().map(|p| *p as u128).sum();
        prop_assert_eq!(sum, amount as u128, "the parts sum exactly (rule 21)");
        for ((_, s), p) in holders.iter().zip(&parts) {
            let exact = amount as u128 * *s as u128;
            let floor = exact / 1_000_000;
            prop_assert!(*p as u128 == floor || (*p as u128 == floor + 1 && exact % 1_000_000 != 0), "within one unit of its exact share");
        }
        let key = |i: usize| (counts[i], holders[i].0);
        let rem = |i: usize| (amount as u128 * holders[i].1 as u128) % 1_000_000;
        for i in 0..n {
            for j in 0..n {
                let up = |k: usize| parts[k] as u128 > (amount as u128 * holders[k].1 as u128) / 1_000_000;
                if up(i) && !up(j) {
                    prop_assert!(rem(i) > rem(j) || (rem(i) == rem(j) && key(i) < key(j)), "largest remainder, ties by turns: the fewest so far, then the smallest identity hash (F165)");
                }
            }
        }
        // Another order: a deterministic shuffle drawn from the case.
        let mut l = Lcg(shuffle);
        let mut order: Vec<usize> = (0..n).collect();
        for k in (1..n).rev() {
            order.swap(k, l.below(k + 1));
        }
        let listed: Vec<(Hash, u64)> = order.iter().map(|i| holders[*i]).collect();
        let listed_counts: Vec<u64> = order.iter().map(|i| counts[*i]).collect();
        let again = law::divide_stake(amount, &listed, law::Ties::Turns(&listed_counts)).map_err(TestCaseError::fail)?;
        for (k, i) in order.iter().enumerate() {
            prop_assert_eq!(again[k], parts[*i], "reordering holders moves nothing (F150)");
        }
        Ok(())
    });
    if let Err(e) = r {
        run.failed(e);
    }
}

/// The same acts in any order, with the verifier read while they arrive,
/// give the same verdicts; and the same acts always give the same answer.
#[test]
fn collective_verdicts_do_not_depend_on_order() {
    let (mut runner, run) = runner("collective_verdicts_do_not_depend_on_order", 24);
    let r = runner.run(&(story(), any::<u64>(), any::<u64>()), |((shape, ops, seed), s1, s2)| {
        let cw = run_col(&shape, &ops, seed);
        let push = Rails::default();
        let first = verdicts(&cw.w.v, &push);
        same_verdicts(&first, &verdicts(&cw.w.v, &push), "determinism (the same verifier read twice)")?;
        same_verdicts(&first, &replay(&cw.w.log, s1, false, &push), "another order")?;
        same_verdicts(&first, &replay(&cw.w.log, s2, true, &push), "another order, read while arriving")?;
        Ok(())
    });
    if let Err(e) = r {
        run.failed(e);
    }
}

/// Prints what the library says of every act a story made (for reading a
/// counterexample).
#[allow(dead_code)]
fn explain(cw: &ColWorld) {
    let lv = cw.view();
    for (x, f) in &cw.info {
        eprintln!(
            "{:?} {:?} grant={:?} seal={:?}\n   consent={:?}\n   backing={:?}\n   binds={:?} purchase={:?}",
            &x[..4],
            f.kind,
            f.grant,
            f.seal,
            lv.consent(x),
            lv.backing(x),
            lv.obligation_binds(x),
            lv.purchase(x).map(|p| p.map(|p| p.verdict))
        );
    }
    eprintln!("closed_by={:?}", lv.closed_by(&cw.col).map(|c| c.map(|c| c.by[..4].to_vec())));
}

// ================================================================ the deal world

#[derive(Clone, Copy, Debug)]
enum DealDisguise {
    None,
    /// The service names itself (or the backup) as payer: a payout (H7).
    PayerIsService,
    /// A batch: a payout (H5).
    Batch,
    /// A receipt the payee did not receive: another party's money.
    OtherPayee,
    /// Money under another agreement's claim.
    OtherDeal,
}

#[derive(Clone, Copy, Debug)]
enum SplitMode {
    Exact,
    /// One holder's payout moved by this many units (the fee absorbing it).
    Perturb(u8, i8),
    /// Amounts that overflow when summed.
    Overflow,
}

/// Which previous split a split cites for the stake (rule 15a, F171).
#[derive(Clone, Copy, Debug)]
enum SplitCite {
    /// The latest split made so far: the chain continues.
    Latest,
    /// None: a reset, once any split exists.
    Reset,
    /// The one the latest cites: a fork with the latest (a reset where the
    /// latest cites none).
    Fork,
}

#[derive(Clone, Debug)]
enum DOp {
    /// A new version: new shares, signed by some parties, some signatures a
    /// thief's (a copy of the party's everyday key).
    Clone { shares: Vec<u16>, signers: u8, thieves: u8, from_latest: bool },
    /// A party rotates, keeping only its own sequence: a thief's acts on
    /// other sequences become void (Identity rules 15 to 17).
    Rotate { party: u8 },
    Revoke { payee: u8, cite_last: bool },
    Receipt { payee: u8, backup: bool, disguise: DealDisguise, proof: u8, line_latest: bool },
    /// A push-rail payment: each payee in the mask signs its own receipt
    /// for the same rail proof.
    Push { proof: u8, payees: u8, line_latest: bool },
    /// A split; `cite` its previous split for the stake; `lie`: the running
    /// count it carries is one too many for the first holder (F171).
    Split { receipt: u8, mode: SplitMode, fee: u16, deliver_all: bool, cite: SplitCite, lie: bool },
}

fn dop() -> impl Strategy<Value = DOp> {
    let disguise = prop_oneof![5 => Just(DealDisguise::None), 1 => Just(DealDisguise::PayerIsService), 1 => Just(DealDisguise::Batch), 1 => Just(DealDisguise::OtherPayee), 1 => Just(DealDisguise::OtherDeal)];
    let cite = prop_oneof![6 => Just(SplitCite::Latest), 1 => Just(SplitCite::Reset), 1 => Just(SplitCite::Fork)];
    let mode = prop_oneof![3 => Just(SplitMode::Exact), 3 => (any::<u8>(), -3i8..=3).prop_map(|(i, d)| SplitMode::Perturb(i, d)), 1 => Just(SplitMode::Overflow)];
    prop_oneof![
        3 => (prop::collection::vec(1u16..1000, 4), prop_oneof![3 => Just(0xffu8), 2 => any::<u8>()], prop_oneof![4 => Just(0u8), 1 => any::<u8>()], any::<bool>())
            .prop_map(|(shares, signers, thieves, from_latest)| DOp::Clone { shares, signers, thieves, from_latest }),
        1 => any::<u8>().prop_map(|party| DOp::Rotate { party }),
        1 => (any::<u8>(), any::<bool>()).prop_map(|(payee, cite_last)| DOp::Revoke { payee, cite_last }),
        4 => (any::<u8>(), any::<bool>(), disguise, 0u8..3, any::<bool>()).prop_map(|(payee, backup, disguise, proof, line_latest)| DOp::Receipt { payee, backup, disguise, proof, line_latest }),
        2 => (3u8..6, any::<u8>(), any::<bool>()).prop_map(|(proof, payees, line_latest)| DOp::Push { proof, payees, line_latest }),
        3 => (any::<u8>(), mode, 0u16..50, prop::bool::weighted(0.8), cite, prop::bool::weighted(0.1))
            .prop_map(|(receipt, mode, fee, deliver_all, cite, lie)| DOp::Split { receipt, mode, fee, deliver_all, cite, lie }),
    ]
}

#[derive(Clone, Debug)]
struct DealShape {
    parties: usize,
    shares: Vec<u16>,
    service: bool,
    backup: bool,
    /// Every party signs the founding terms.
    all_found: bool,
}

fn deal_shape() -> impl Strategy<Value = DealShape> {
    (2usize..=4, prop::collection::vec(1u16..1000, 4), any::<bool>(), any::<bool>(), prop::bool::weighted(0.9))
        .prop_map(|(parties, shares, service, backup, all_found)| DealShape { parties, shares, service, backup: service && backup, all_found })
}

/// Shares in millionths from weights, summing exactly (leftovers to the first).
fn millionths(w: &[u16]) -> Vec<u64> {
    let total: u64 = w.iter().map(|x| *x as u64).sum();
    let mut v: Vec<u64> = w.iter().map(|x| *x as u64 * 1_000_000 / total).collect();
    let rest = 1_000_000 - v.iter().sum::<u64>();
    v[0] += rest;
    v
}

struct DealWorld {
    w: World,
    p: Vec<Person>,
    /// A thief holding a copy of each party's everyday key, signing from a
    /// sequence of its own.
    thief: Vec<Person>,
    /// Which parties rotated after a thief signed for them.
    svc: Option<Person>,
    backup: Option<Person>,
    /// Each payee's grant and key, to the service and to the backup.
    grants: Vec<(Hash, SchnorrKey)>,
    strands: Vec<Person>,
    backup_strands: Vec<Person>,
    work: Hash,
    publication: Hash,
    deal: Hash,
    /// Every version made: (id, parent, its stakes on the work).
    versions: Vec<(Hash, Option<Hash>, Vec<(Hash, u64)>)>,
    /// For each version, the signature acts on it: (party index, act, by a thief).
    sigs: BTreeMap<Hash, Vec<(usize, Hash, bool)>>,
    /// Receipts the service signed: (act, payee index, disguise, backup).
    receipts: Vec<(Hash, usize, DealDisguise, bool)>,
    /// Push receipts: (act, proof).
    push: Vec<(Hash, u8)>,
    /// The claim each push payment's commitment names, by proof: the line
    /// its first receipt names (F131, IT3).
    committed: BTreeMap<u8, Hash>,
    /// Push receipts naming another claim than their payment's commitment:
    /// the rail shows them wrong (F131, IT3).
    wrong: BTreeSet<Hash>,
    revocations: Vec<(Hash, usize)>,
    splits: Vec<(Hash, SplitMode, bool, u64)>,
    /// Each split's place in the service's tally chain for the stake
    /// (F171): the previous split it cites, the running count it carries,
    /// and whether that count lies.
    links: BTreeMap<Hash, (Option<Hash>, Vec<(Hash, u64)>, bool)>,
    rng: Lcg,
    seed: u64,
}

fn push_rail() -> Hash {
    spec("a push rail")
}

impl DealWorld {
    fn new(s: &DealShape, seed: u64) -> DealWorld {
        let mut w = World::new();
        let names = ["ana", "ben", "cy", "dee"];
        let mut p: Vec<Person> = names[..s.parties].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
        let thief = p.iter().map(|x| { let mut t = x.clone(); t.seq = vec![]; t }).collect();
        let ids: Vec<Hash> = p.iter().map(|x| x.id).collect();
        let work = spec("their song");
        let mut svc = s.service.then(|| w.genesis("service S", vec![own_home()], None, None));
        let mut backup = s.backup.then(|| w.genesis("service T", vec![own_home()], None, None));
        let mut grants = vec![];
        let mut backup_grants = vec![];
        let mk = |w: &mut World, payee: &mut Person, sv: &mut Person, tag: &str| {
            let (k, pk) = grant_key(&format!("{:?} {tag} {:?}", sv.id, payee.id));
            let g = Grant { grantee: sv.id, scope: 1, agreements: None, this_agreement: true, limits: None, limits_cmip: None, area: None, kinds: None, reinstates: None, by_this: false, key: pk };
            let g = law_act(w, payee, law::types::GRANT, g.to_map(), None);
            sign(w, sv, &g);
            (g, k)
        };
        if let Some(sv) = svc.as_mut() {
            for x in p.iter_mut() {
                grants.push(mk(&mut w, x, sv, "S"));
            }
        }
        if let Some(bv) = backup.as_mut() {
            for x in p.iter_mut() {
                backup_grants.push(mk(&mut w, x, bv, "T"));
            }
        }
        let shares = millionths(&s.shares[..s.parties]);
        let stakes: Vec<(Hash, u64)> = ids.iter().copied().zip(shares).collect();
        let mut t = Terms {
            parties: ids.clone(),
            text: "A deal, as the generator drew it.".into(),
            cmips: vec![(6, pay())],
            keepers: None,
            field4: Field4::Rule(Rule::All),
            clone: Rule::All,
            time: s.backup.then(|| (spec("a clock"), Value::Uint(0))),
            abandonment: None,
            parent: None,
            grammar: None,
            arbitrators: None,
            split_grant: None,
            payee_grants: s.service.then(|| grants.iter().map(|g| g.0).collect()),
            extensions: None,
            succession: None,
            constitutional: None,
            areas: None,
            area_words: None,
            chain: s.backup.then(|| vec![law::ChainLink { judge: law::Judge::SplitService, next: vec![(law::Taker::Grants(backup_grants.iter().map(|g| g.0).collect()), 30)] }]),
            departed: None,
            stakes: Some(vec![law::Stake { object: Who::Id(work), holders: stakes.iter().map(|(h, n)| (Who::Id(*h), *n)).collect() }]),
            forked_from: None,
            release_rule: None,
        };
        assert_eq!(t.check(&mips()), Ok(()), "the generator's own deal terms");
        let deal = law_act(&mut w, &mut p[0], law::types::TERMS, t.to_map(), None);
        let mut sigs = vec![];
        for (i, x) in p.iter_mut().enumerate() {
            if s.all_found || i + 1 < s.parties {
                sigs.push((i, sign(&mut w, x, &deal), false));
            }
        }
        t.parent = None;
        let publication = {
            let a = w.everyday_act(&mut p[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(work.to_vec()))], None, None);
            w.add(&a)
        };
        let strand = |x: &Person, g: &(Hash, SchnorrKey)| {
            let mut st = x.clone();
            st.binding = g.0;
            st.sign = g.1.clone();
            st.seq = vec![];
            st.cite = Some((x.id, vec![g.0]));
            st
        };
        let strands = if s.service { p.iter().zip(&grants).map(|(x, g)| strand(x, g)).collect() } else { vec![] };
        let backup_strands = if s.backup { p.iter().zip(&backup_grants).map(|(x, g)| strand(x, g)).collect() } else { vec![] };
        let mut sm = BTreeMap::new();
        sm.insert(deal, sigs);
        DealWorld {
            w,
            p,
            thief,
            svc,
            backup,
            grants,
            strands,
            backup_strands,
            work,
            publication,
            deal,
            versions: vec![(deal, None, stakes)],
            sigs: sm,
            receipts: vec![],
            push: vec![],
            committed: BTreeMap::new(),
            wrong: BTreeSet::new(),
            revocations: vec![],
            splits: vec![],
            links: BTreeMap::new(),
            rng: Lcg(seed),
            seed,
        }
    }

    fn view(&self) -> LawView<'_> {
        let mut lv = LawView::new(&self.w.v, mips());
        lv.push_rails.insert(push_rail());
        lv.rail_invalid = self.wrong.clone();
        lv
    }

    fn ids(&self) -> Vec<Hash> {
        self.p.iter().map(|x| x.id).collect()
    }

    /// The latest version every party signed: from the deal, the one
    /// existing clone of each version in turn; where two exist, the status
    /// quo stands (rule 5b: no concurrency rule, its format open).
    fn latest(&self) -> Hash {
        let lv = self.view();
        let mut at = self.deal;
        loop {
            let kids: Vec<Hash> = self
                .versions
                .iter()
                .filter(|(v, parent, _)| *parent == Some(at) && lv.agreement(v).is_ok_and(|a| a.exists == Some(true)))
                .map(|(v, _, _)| *v)
                .collect();
            match kids.as_slice() {
                [k] => at = *k,
                _ => return at,
            }
        }
    }

    fn apply(&mut self, op: &DOp) {
        self.rng = Lcg(u64::from_le_bytes(sha256(format!("{op:?}/{}", self.seed).as_bytes())[..8].try_into().unwrap()));
        let n = self.p.len();
        let ids = self.ids();
        match op {
            DOp::Clone { shares, signers, thieves, from_latest } => {
                if self.versions.len() >= 6 {
                    return;
                }
                let parent = if *from_latest { self.latest() } else { self.versions[self.rng.below(self.versions.len())].0 };
                let mut t = self.view().terms(&parent).unwrap();
                let sh = millionths(&shares[..n]);
                let stakes: Vec<(Hash, u64)> = ids.iter().copied().zip(sh).collect();
                t.parent = Some(parent);
                t.text = format!("version {}", self.versions.len());
                t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(ids.clone()) }]);
                t.stakes = Some(vec![law::Stake { object: Who::Id(self.work), holders: stakes.iter().map(|(h, n)| (Who::Id(*h), *n)).collect() }]);
                let by = self.rng.below(n);
                let k = law_act(&mut self.w, &mut self.p[by], law::types::TERMS, t.to_map(), obj(parent));
                let mut sigs = vec![];
                for i in 0..n {
                    if thieves & (1 << i) != 0 {
                        sigs.push((i, sign(&mut self.w, &mut self.thief[i], &k), true));
                    } else if signers & (1 << i) != 0 {
                        sigs.push((i, sign(&mut self.w, &mut self.p[i], &k), false));
                    }
                }
                self.sigs.insert(k, sigs);
                self.versions.push((k, Some(parent), stakes));
            }
            DOp::Rotate { party } => {
                let i = *party as usize % n;
                if self.p[i].gen >= 2 {
                    return;
                }
                let (_, q) = self.w.rotate(&self.p[i], common::Rot::default());
                self.p[i] = q;
            }
            DOp::Revoke { payee, cite_last } => {
                if self.grants.is_empty() {
                    return;
                }
                let i = *payee as usize % n;
                let last: Option<Hash> = self.strands[i].seq.last().copied().filter(|_| *cite_last);
                let objects = last.map(|x| vec![Object { chain: ids[i], predecessor: x }]);
                let r = law_act(&mut self.w, &mut self.p[i], law::types::REVOCATION, law::Revocation { grant: self.grants[i].0 }.to_map(), objects);
                self.revocations.push((r, i));
            }
            DOp::Receipt { payee, backup, disguise, proof, line_latest } => {
                if self.grants.is_empty() {
                    return;
                }
                let i = *payee as usize % n;
                let backup = *backup && self.backup.is_some();
                let svc = if backup { self.backup.as_ref().unwrap().id } else { self.svc.as_ref().unwrap().id };
                let line = if *line_latest { self.latest() } else { self.deal };
                let other = spec("another deal");
                let r = Receipt {
                    rail: rail(),
                    proof: vec![*proof],
                    payer: Some(Payer::Identity(if matches!(disguise, DealDisguise::PayerIsService) { svc } else { spec(&format!("a fan {proof}")) })),
                    payee: if matches!(disguise, DealDisguise::OtherPayee) { ids[(i + 1) % n] } else { ids[i] },
                    amount: Amount { unit: unit(), value: 1000 },
                    fulfils: if matches!(disguise, DealDisguise::OtherDeal) { other } else { self.publication },
                    previous: None,
                    forward: None,
                    batch: matches!(disguise, DealDisguise::Batch).then(|| spec("a batch")),
                    purchase: Some(Purchase { agreement: if matches!(disguise, DealDisguise::OtherDeal) { other } else { self.deal }, line: if matches!(disguise, DealDisguise::OtherDeal) { other } else { line } }),
                };
                let st = if backup { &mut self.backup_strands[i] } else { &mut self.strands[i] };
                let a = self.w.everyday_act(st, mips().finance, 2, Fin::Receipt(r).to_map(), None, None);
                let x = self.w.add(&a);
                self.receipts.push((x, i, *disguise, backup));
            }
            DOp::Push { proof, payees, line_latest } => {
                let line = if *line_latest { self.latest() } else { self.deal };
                // The payment commits to one claim; a holder's receipt naming
                // another recomputes another commitment, which the rail
                // refuses (F131, IT3).
                let committed = *self.committed.entry(*proof).or_insert(line);
                for i in 0..n {
                    if payees & (1 << i) == 0 {
                        continue;
                    }
                    let r = Receipt {
                        rail: push_rail(),
                        proof: vec![*proof],
                        payer: Some(Payer::Identity(spec(&format!("a fan {proof}")))),
                        payee: ids[i],
                        amount: Amount { unit: unit(), value: 5 },
                        fulfils: self.publication,
                        previous: None,
                        forward: None,
                        batch: None,
                        purchase: Some(Purchase { agreement: self.deal, line }),
                    };
                    let a = self.w.everyday_act(&mut self.p[i], mips().finance, 2, Fin::Receipt(r).to_map(), None, None);
                    let x = self.w.add(&a);
                    self.push.push((x, *proof));
                    if line != committed {
                        self.wrong.insert(x);
                    }
                }
            }
            DOp::Split { receipt, mode, fee, deliver_all, cite, lie } => {
                let Some(sv) = self.svc.clone() else { return };
                let incoming: Vec<Hash> = self.receipts.iter().map(|r| r.0).collect();
                if incoming.is_empty() {
                    return;
                }
                let rc = incoming[*receipt as usize % incoming.len()];
                let latest = self.latest();
                let stakes = self.versions.iter().find(|v| v.0 == latest).unwrap().2.clone();
                let amount: u64 = 1000;
                let fee = (*fee as u64).min(amount);
                let pot = amount - fee;
                // The previous split it cites for the stake (F171): the
                // latest, none (a reset), or the latest's own previous (a
                // fork).
                let latest_split = self.splits.last().map(|x| x.0);
                let previous = match cite {
                    SplitCite::Latest => latest_split,
                    SplitCite::Reset => None,
                    SplitCite::Fork => latest_split.and_then(|l| self.links[&l].0),
                };
                let before: Vec<(Hash, u64)> = previous.map(|p| self.links[&p].1.clone()).unwrap_or_default();
                let count_of = |h: &Hash| before.iter().filter(|(x, _)| x == h).map(|(_, n)| *n).sum::<u64>();
                // Exact shares, rounded down, leftovers by largest remainder,
                // ties by turns (rule 15a, F165), counted as the previous
                // split carries them (F171).
                let turns: Vec<u64> = stakes.iter().map(|(h, _)| count_of(h)).collect();
                let mut each: Vec<u64> = law::divide_stake(pot, &stakes, law::Ties::Turns(&turns)).expect("turns settle every tie");
                let mut fee_paid = fee;
                match mode {
                    SplitMode::Exact | SplitMode::Overflow => {}
                    SplitMode::Perturb(i, d) => {
                        let i = *i as usize % each.len();
                        let d = *d as i64;
                        let new = (each[i] as i64 + d).max(0) as u64;
                        let delta = new as i64 - each[i] as i64;
                        if (fee_paid as i64) - delta >= 0 {
                            fee_paid = (fee_paid as i64 - delta) as u64;
                            each[i] = new;
                        }
                    }
                }
                let svc_id = sv.id;
                let mut payouts = vec![law::Payout { receiver: svc_id, amount: fee_paid, stake: None, role: None, evidence: None, fee_module: Some(spec("a fee Module")), rail_fee: None }];
                for ((h, _), a) in stakes.iter().zip(&each) {
                    payouts.push(law::Payout { receiver: *h, amount: *a, stake: Some(0), role: None, evidence: None, fee_module: None, rail_fee: None });
                }
                if matches!(mode, SplitMode::Overflow) {
                    payouts[0].amount = u64::MAX - 1;
                    payouts[1].amount = u64::MAX - 1;
                }
                // The running count it carries (F171): the previous one plus
                // what each holder was paid above its share rounded down,
                // reckoned here from the text, not by the library; one too
                // many for the first holder where it lies. An overflowing
                // split carries the previous count as it is.
                // Every holder is named, a zero count included.
                let mut carried: BTreeMap<Hash, u64> = before.iter().copied().collect();
                for (h, _) in &stakes {
                    carried.entry(*h).or_insert(0);
                }
                if !matches!(mode, SplitMode::Overflow) {
                    // What the split pays the stake, a perturbed payout included.
                    let paid_pot: u128 = each.iter().map(|a| *a as u128).sum();
                    let sum: u128 = stakes.iter().map(|(_, n)| *n as u128).sum::<u128>().max(1);
                    for ((h, n), a) in stakes.iter().zip(&each) {
                        let floor = (paid_pot * *n as u128 / sum) as u64;
                        *carried.entry(*h).or_insert(0) += a.saturating_sub(floor);
                    }
                }
                if *lie {
                    *carried.entry(stakes[0].0).or_insert(0) += 1;
                }
                let carried: Vec<(Hash, u64)> = carried.into_iter().collect();
                let s = law::Split { receipt: rc, payouts, cmip: spec("a split cMIP"), agreement: latest, tally: Some(vec![(0, carried.clone())]) };
                let to: Vec<Hash> = if *deliver_all { ids.clone() } else { ids[1..].to_vec() };
                let mut svp = self.svc.take().unwrap();
                let x = self.w.private_act_refs(&mut svp, mips().law, law::types::SPLIT, s.to_map(), None, to, previous.map(|p| vec![mor_core::act::Ref::Act(p)]));
                self.svc = Some(svp);
                self.splits.push((x, *mode, *deliver_all, pot));
                self.links.insert(x, (previous, carried, *lie));
            }
        }
    }

    fn check(&self) -> Result<(), String> {
        let mut bad = vec![];
        let lv = self.view();
        let v = &self.w.v;
        let ids = self.ids();
        // A deal changes only with every party (F107); a party is bound only
        // by its own signature, a thief's voided by its rotation (F71, F74).
        for (k, parent, stakes) in &self.versions {
            let a = lv.agreement(k).map_err(|e| format!("{e:?}"))?;
            let parent_exists = match parent {
                None => true,
                Some(p) => lv.agreement(p).map(|a| a.exists == Some(true)).unwrap_or(false),
            };
            let valid_signer = |i: usize| self.sigs[k].iter().any(|(j, s, _)| *j == i && v.status(s) == Status::Valid);
            let all = (0..ids.len()).all(valid_signer);
            if a.exists == Some(true) && !all {
                bad.push(format!("DEAL-EVERY-PARTY: version {k:?} exists without every party's valid signature: {:?}", self.sigs[k].iter().map(|(j, s, t)| (j, *t, v.status(s))).collect::<Vec<_>>()));
            }
            if a.exists == Some(true) && !parent_exists {
                bad.push(format!("DEAL-PARENT: version {k:?} exists though its parent does not"));
            }
            if a.exists != Some(true) && all && parent_exists && a.invalid.is_none() {
                bad.push(format!("DEAL-LIVENESS: every party validly signed version {k:?} and its parent exists, yet it does not exist ({:?})", a));
            }
            // A stake moves only with its holder's signature (rules 13, 46).
            if let (Some(p), Some(true)) = (parent, a.exists) {
                let before = &self.versions.iter().find(|x| &x.0 == p).unwrap().2;
                for (h, n) in stakes {
                    let was = before.iter().find(|x| &x.0 == h).map(|x| x.1).unwrap_or(0);
                    let i = ids.iter().position(|x| x == h).unwrap();
                    if *n < was && !valid_signer(i) {
                        bad.push(format!("STAKE-MOVED: {h:?}'s stake fell from {was} to {n} in {k:?} without its valid signature"));
                    }
                }
            }
            // A thief's signature, once its victim rotated, counts for nothing.
            for (j, s, thief) in &self.sigs[k] {
                if *thief && self.p[*j].gen > 0 && v.status(s) == Status::Valid {
                    let rotated_after = true;
                    if rotated_after {
                        bad.push(format!("THIEF-SIGNATURE: a thief's signature for party {j} is still valid after the party rotated without keeping it: {s:?}"));
                    }
                }
            }
        }
        // A split service's grant key signs only incoming receipts for the
        // payee itself (F129 H5, F130 H7), and never after its revocation
        // unless the revocation's history holds the act (G1).
        for (x, i, disguise, backup) in &self.receipts {
            let b = lv.backing(x).map_err(|e| format!("{e:?}"))?;
            if !binds(&b) {
                continue;
            }
            if !matches!(disguise, DealDisguise::None) {
                bad.push(format!("SERVICE-PAYOUT: a split service's grant key signed a receipt it may not ({disguise:?}, backup {backup}): {x:?} {b:?}"));
            }
            if !*backup {
                for (r, j) in &self.revocations {
                    if j == i && !history_of(v, &ids[*i], r).contains(x) {
                        bad.push(format!("TIE-REVOCATION: a payee's revoked grant key's receipt, not in the revocation's history, binds: {x:?} revocation {r:?}"));
                    }
                }
            }
            if lv.agreement(&self.deal).map(|a| a.exists != Some(true)).unwrap_or(true) {
                bad.push(format!("SERVICE-NO-DEAL: a grant key binds though the deal does not exist (H4): {x:?}"));
            }
        }
        // One payment, one verdict: never a purchase and owed back at once.
        // F131 (IT3): the payment decides; a receipt naming another claim
        // than its commitment is a wrong receipt, counting for nothing.
        // Judged with the rail's answers, and again without them (a
        // verifier that has not checked the rail yet).
        let line_of = |x: &Hash| match v.get(x).map(|h| Fin::decode(h.inside.type_, &h.inside.payload)) {
            Some(Ok(Fin::Receipt(r))) => r.purchase.map(|p| p.line),
            _ => None,
        };
        let mut bare = LawView::new(&self.w.v, mips());
        bare.push_rails.insert(push_rail());
        for (answers, lv) in [(true, &lv), (false, &bare)] {
            let mut groups: BTreeMap<(Hash, u8), Vec<String>> = BTreeMap::new();
            let mut lines: BTreeMap<(Hash, u8), BTreeSet<Hash>> = BTreeMap::new();
            let tag = |x: &Hash| -> Result<&'static str, String> {
                Ok(match lv.purchase(x).map_err(|e| format!("{e:?}"))?.map(|p| p.verdict) {
                    Some(law::PurchaseVerdict::Purchase) => "purchase",
                    Some(law::PurchaseVerdict::NoPurchase { .. }) => "refund",
                    Some(law::PurchaseVerdict::Unrecorded) => "unrecorded",
                    Some(law::PurchaseVerdict::WrongReceipt { .. }) => "wrong",
                    None => "none",
                })
            };
            for (x, proof) in &self.push {
                let t = tag(x)?;
                let wrong = answers && self.wrong.contains(x);
                if wrong != (t == "wrong") {
                    bad.push(format!("RAIL-WRONG: a receipt the rail shows {} is judged {t} (F131 IT3): {x:?}", if wrong { "wrong" } else { "right" }));
                }
                if t == "wrong" {
                    continue;
                }
                lines.entry((push_rail(), *proof)).or_default().extend(line_of(x));
                groups.entry((push_rail(), *proof)).or_default().push(t.into());
            }
            for (x, _, d, _) in &self.receipts {
                if !matches!(d, DealDisguise::None) {
                    continue;
                }
                let h = v.get(x).unwrap();
                let Ok(Fin::Receipt(r)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
                let t = tag(x)?;
                lines.entry((r.rail, r.proof[0])).or_default().extend(line_of(x));
                groups.entry((r.rail, r.proof[0])).or_default().push(t.into());
            }
            for (k, ts) in &groups {
                if ts.iter().any(|t| t == "purchase") && ts.iter().any(|t| t == "refund") {
                    // Receipts of one rail payment naming different claims
                    // (F131 IT3: the payment's claim decides), or the same.
                    let code = if lines[k].len() > 1 { "PAYMENT-CLAIMS-DISAGREE" } else { "PURCHASE-AND-REFUND" };
                    bad.push(format!("{code}: one payment ({k:?}, rail answers {answers}) is both a purchase and owed back: {ts:?}; the claims its receipts name: {:?}", lines[k]));
                }
            }
        }
        // Every split sums exactly; every payout matches its stake within the
        // rounding the text allows; every holder it pays receives it (rules
        // 20, 21, 26; N10; Q9).
        for (x, mode, all, _pot) in &self.splits {
            let e = match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| lv.split(x))) {
                Ok(e) => e.map_err(|e| format!("{e:?}"))?,
                Err(_) => {
                    bad.push(format!("SPLIT-PANIC: judging a split panicked ({mode:?}): {x:?}"));
                    continue;
                }
            };
            match mode {
                SplitMode::Overflow => {
                    if e.sums == Some(true) {
                        bad.push(format!("SPLIT-SUM: payouts that overflow are read as summing exactly: {x:?}"));
                    }
                }
                _ => {
                    if e.sums != Some(true) {
                        bad.push(format!("SPLIT-SUM: a split whose payouts sum to the amount is not read as summing ({mode:?}): {x:?}"));
                    }
                    // The oracle, from the text: the stakes as currently
                    // held (rule 26), those of the latest version every party
                    // signed, whichever version the split names (audit,
                    // October 2026, gap 8); each holder is owed its share
                    // rounded down, the leftover units one each by largest
                    // remainder, ties by turns (rule 15a, F165): the fewest
                    // leftover units so far, as the previous split it cites
                    // carries them (F171), then the smallest identity hash;
                    // any other amount breaks the plan; so does a payout to
                    // someone who holds no part of it.
                    let latest = self.latest();
                    let stakes = &self.versions.iter().find(|v| v.0 == latest).unwrap().2;
                    let pot: u128 = e.split.payouts.iter().filter(|p| p.stake == Some(0)).map(|p| p.amount as u128).sum();
                    let sum: u128 = stakes.iter().map(|(_, n)| *n as u128).sum::<u128>().max(1);
                    let mut owed: Vec<(Hash, u128, u128)> = stakes.iter().map(|(h, n)| (*h, pot * *n as u128 / sum, pot * *n as u128 % sum)).collect();
                    let left = pot - owed.iter().map(|o| o.1).sum::<u128>();
                    let mut by: Vec<usize> = (0..owed.len()).collect();
                    let (previous, _, _) = &self.links[x];
                    let before: Vec<(Hash, u64)> = previous.map(|p| self.links[&p].1.clone()).unwrap_or_default();
                    let so_far = |h: &Hash| before.iter().filter(|(y, _)| y == h).map(|(_, n)| *n).sum::<u64>();
                    by.sort_by(|a, b| owed[*b].2.cmp(&owed[*a].2).then(so_far(&owed[*a].0).cmp(&so_far(&owed[*b].0))).then(owed[*a].0.cmp(&owed[*b].0)));
                    for i in by.into_iter().take(left as usize) {
                        owed[i].1 += 1;
                    }
                    let mut expect = BTreeSet::new();
                    for (h, due, _) in &owed {
                        let paid: u128 = e.split.payouts.iter().filter(|p| p.stake == Some(0) && p.receiver == *h).map(|p| p.amount as u128).sum();
                        if paid != *due {
                            expect.insert(*h);
                        }
                    }
                    for p in e.split.payouts.iter().filter(|p| p.stake == Some(0)) {
                        if !stakes.iter().any(|(h, _)| *h == p.receiver) {
                            expect.insert(p.receiver);
                        }
                    }
                    let got: BTreeSet<Hash> = e.mismatched.iter().map(|m| m.holder).collect();
                    if got != expect {
                        bad.push(format!("SPLIT-STAKE: payouts judged against their stakes differently from the text ({mode:?}): library {got:?}, text {expect:?}"));
                    }
                    if e.in_force != latest {
                        bad.push(format!("SPLIT-IN-FORCE: the split is judged against {:?}, not the latest version every party signed {latest:?}", e.in_force));
                    }
                    if matches!(mode, SplitMode::Exact) && e.split.agreement == latest && !got.is_empty() {
                        bad.push(format!("SPLIT-EXACT: an exact split under the version in force is judged as breaking its plan: {got:?}"));
                    }
                    if e.split.agreement != latest && !e.problems.iter().any(|p| p.contains("not in force")) {
                        bad.push(format!("SPLIT-VERSION: a split naming a version the parties have left is not shown so (rule 26): {x:?}"));
                    }
                }
            }
            // The tally chain (rule 15a, rule 46b, F171): a split citing no
            // previous one while another does too is a reset; two citing the
            // same one, a fork; a count that is not the previous one plus
            // this split's leftover units, a break; each shown on every
            // split of the pair, naming the others. Every split here is held.
            {
                let (previous, _, lie) = &self.links[x];
                let mut with: Vec<Hash> = self.links.iter().filter(|(y, l)| *y != x && l.0 == *previous).map(|(y, _)| *y).collect();
                with.sort();
                let mut expect: Vec<String> = vec![];
                if !with.is_empty() {
                    expect.push(match previous {
                        None => format!("{:?}", law::ChainBreak::Reset { stake: 0, with: with.clone() }),
                        Some(p) => format!("{:?}", law::ChainBreak::Fork { stake: 0, previous: *p, with: with.clone() }),
                    });
                }
                // A split under a version since left is judged against the
                // stakes in force (rule 26), its count with them: already
                // shown broken, its count is not foreseen here.
                let unforeseen = matches!(mode, SplitMode::Overflow) || e.split.agreement != self.latest();
                let mut got: Vec<String> = vec![];
                let mut counted = false;
                for b in &e.breaks {
                    match b {
                        law::ChainBreak::Count { .. } => counted = true,
                        other => got.push(format!("{other:?}")),
                    }
                }
                if got != expect {
                    bad.push(format!("SPLIT-CHAIN: a split's place in the tally chain judged differently from the text: library {got:?}, text {expect:?}"));
                }
                if !unforeseen && counted != *lie {
                    bad.push(format!("SPLIT-COUNT: a running count {} is {} as one: {x:?} {:?}", if *lie { "that lies" } else { "that is right" }, if *lie { "not shown" } else { "shown" }, e.breaks));
                }
                if !e.count_unknown.is_empty() || !e.turns_unknown.is_empty() {
                    bad.push(format!("SPLIT-UNKNOWN: every act is held, yet a count is unknown: {x:?}"));
                }
            }
            let first = ids[0];
            let owed_first = e.split.payouts.iter().any(|p| p.stake.is_some() && p.receiver == first);
            if !*all && owed_first && !e.undelivered.contains(&first) {
                bad.push(format!("SPLIT-DELIVERY: a split not delivered to a holder it pays is not shown so: {x:?}"));
            }
            if *all && !e.undelivered.is_empty() {
                bad.push(format!("SPLIT-DELIVERY: a split delivered to every holder is shown as undelivered: {x:?} {:?}", e.undelivered));
            }
        }
        Violations(bad).into_result()
    }
}

fn run_deal(s: &DealShape, ops: &[DOp], seed: u64) -> DealWorld {
    let mut d = DealWorld::new(s, seed);
    for o in ops {
        d.apply(o);
    }
    d
}

fn deal_stats() -> &'static Stats {
    static S: std::sync::OnceLock<Stats> = std::sync::OnceLock::new();
    S.get_or_init(|| Stats::new(&["cases", "acts", "versions_exist", "versions_draft", "thief_voided", "service_binds", "service_refused", "purchase", "refund", "unrecorded", "wrong_receipt", "splits", "split_mismatch", "split_reset", "split_fork", "split_count"]))
}

fn deal_tally(d: &DealWorld) {
    let s = deal_stats();
    let lv = d.view();
    s.hit("cases");
    for _ in 0..d.w.log.len() {
        s.hit("acts");
    }
    for (k, _, _) in d.versions.iter().skip(1) {
        if lv.agreement(k).is_ok_and(|a| a.exists == Some(true)) {
            s.hit("versions_exist");
        } else {
            s.hit("versions_draft");
        }
        for (_, x, t) in &d.sigs[k] {
            if *t && d.w.v.status(x) != Status::Valid {
                s.hit("thief_voided");
            }
        }
    }
    for (x, ..) in &d.receipts {
        if lv.backing(x).is_ok_and(|b| binds(&b)) {
            s.hit("service_binds");
        } else {
            s.hit("service_refused");
        }
    }
    for (x, _) in &d.push {
        match lv.purchase(x).ok().flatten().map(|p| p.verdict) {
            Some(law::PurchaseVerdict::Purchase) => s.hit("purchase"),
            Some(law::PurchaseVerdict::NoPurchase { .. }) => s.hit("refund"),
            Some(law::PurchaseVerdict::Unrecorded) => s.hit("unrecorded"),
            Some(law::PurchaseVerdict::WrongReceipt { .. }) => s.hit("wrong_receipt"),
            None => {}
        }
    }
    for (x, ..) in &d.splits {
        s.hit("splits");
        if std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| lv.split(x).is_ok_and(|e| !e.mismatched.is_empty()))).unwrap_or(false) {
            s.hit("split_mismatch");
        }
        if let Ok(Ok(e)) = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| lv.split(x))) {
            for b in &e.breaks {
                s.hit(match b {
                    law::ChainBreak::Reset { .. } => "split_reset",
                    law::ChainBreak::Fork { .. } => "split_fork",
                    _ => "split_count",
                });
            }
        }
    }
}

fn deal_story() -> impl Strategy<Value = (DealShape, Vec<DOp>, u64)> {
    (deal_shape(), prop::collection::vec(dop(), 1..20), any::<u64>())
}

/// Every promise over random deals.
#[test]
fn deal_promises_hold() {
    let (mut runner, run) = runner("deal_promises_hold", 48);
    let r = runner.run(&deal_story(), |(shape, ops, seed)| {
        let d = run_deal(&shape, &ops, seed);
        deal_tally(&d);
        d.check().map_err(TestCaseError::fail)
    });
    deal_stats().show("deal_promises_hold");
    known().show("stated costs and open questions met (not failures)");
    if let Err(e) = r {
        run.failed(e);
    }
}

/// Deals: the same acts in any order give the same verdicts.
#[test]
fn deal_verdicts_do_not_depend_on_order() {
    let (mut runner, run) = runner("deal_verdicts_do_not_depend_on_order", 24);
    let r = runner.run(&(deal_story(), any::<u64>(), any::<u64>()), |((shape, ops, seed), s1, s2)| {
        let d = run_deal(&shape, &ops, seed);
        let push: Rails = ([push_rail()].into(), d.wrong.clone());
        let first = verdicts(&d.w.v, &push);
        same_verdicts(&first, &verdicts(&d.w.v, &push), "determinism")?;
        same_verdicts(&first, &replay(&d.w.log, s1, false, &push), "another order")?;
        same_verdicts(&first, &replay(&d.w.log, s2, true, &push), "another order, read while arriving")?;
        Ok(())
    });
    if let Err(e) = r {
        run.failed(e);
    }
}

// ================================================================ stakes in a collective

/// A collective whose stake in itself is held by its members and by
/// departed holders (rule 46b); a clone redraws the shares, some holders
/// sign, a record names the signatures it was given.
#[derive(Clone, Debug)]
struct StakeCase {
    members: usize,
    departed: usize,
    before: Vec<u16>,
    after: Vec<u16>,
    /// Drop the last holder from the stake altogether.
    drop_last: bool,
    signers: u8,
    /// Signature acts made but not named by the record (A2).
    unnamed: u8,
}

fn stake_case() -> impl Strategy<Value = StakeCase> {
    (2usize..=4, 0usize..=2, prop::collection::vec(1u16..100, 6), prop::collection::vec(1u16..100, 6), prop::bool::weighted(0.2), any::<u8>(), prop_oneof![3 => Just(0u8), 1 => any::<u8>()])
        .prop_map(|(members, departed, before, after, drop_last, signers, unnamed)| StakeCase { members, departed, before, after, drop_last, signers, unnamed })
}

fn stake_check(c: &StakeCase) -> Result<(), String> {
    let mut w = World::new();
    let names = ["ana", "ben", "cy", "dee"];
    let mut m: Vec<Person> = names[..c.members].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let mut gone: Vec<Person> = (0..c.departed).map(|i| w.genesis(&format!("departed {i}"), vec![own_home()], None, None)).collect();
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let holders: Vec<Hash> = ids.iter().chain(gone.iter().map(|p| &p.id)).copied().collect();
    let k = holders.len();
    let shape = Shape { members: c.members, devices: 1, member_devices: 1, constitutional: None, lane: None, owns_work: false };
    let mut t = col_terms(&ids, spec("an authority"), &shape, spec("a work"));
    let before = millionths(&c.before[..k]);
    t.stakes = Some(vec![law::Stake { object: Who::This, holders: holders.iter().copied().zip(before.iter().copied()).map(|(h, n)| (Who::Id(h), n)).collect() }]);
    if c.departed > 0 {
        t.departed = Some(gone.iter().map(|p| p.id).collect());
    }
    t.check(&mips()).map_err(|e| format!("generator's founding terms: {e:?}"))?;
    let founding = law_act(&mut w, &mut m[0], law::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &founding);
    }
    let mut c0 = w.genesis_with("collective", vec![own_home()], None, None, Some(vec![law::founding_declaration(&mips().law, &founding)]), 3);
    c0.cite = Some((c0.id, vec![c0.id]));
    // The clone: new shares; the clone rule's power, by the members it
    // needs (operational field 7, in no area).
    let mut after = millionths(&c.after[..k]);
    let mut kept: Vec<Hash> = holders.clone();
    // Dropping a member's share altogether (a departed holder's would
    // change the departed members entry, constitutional).
    if c.drop_last && c.members > 1 {
        let j = c.members - 1;
        let x = after.remove(j);
        after[0] += x;
        kept.remove(j);
    }
    let mut k2 = t.clone();
    k2.parent = Some(founding);
    k2.stakes = Some(vec![law::Stake { object: Who::This, holders: kept.iter().copied().zip(after.iter().copied()).map(|(h, n)| (Who::Id(h), n)).collect() }]);
    let need = ids.len().min(2);
    let mark_signers: Vec<Hash> = sorted(ids[..need].to_vec());
    k2.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: mark_signers }]);
    let clone = law_act(&mut w, &mut m[0], law::types::TERMS, k2.to_map(), obj(founding));
    let mut named = vec![];
    let mut signed = BTreeSet::new();
    for (i, h) in holders.iter().enumerate() {
        if c.signers & (1 << i) == 0 && i >= need {
            continue;
        }
        let p = if i < c.members { &mut m[i] } else { &mut gone[i - c.members] };
        let s = sign(&mut w, p, &clone);
        if c.unnamed & (1 << i) == 0 {
            named.push(s);
            signed.insert(*h);
        }
    }
    let r = Record { clone: Some(clone), signatures: Some(named), kept: vec![], registers: None };
    let a = {
        let saved = c0.cite.take();
        let a = w.everyday_act(&mut c0, mips().law, law::types::RECORD, r.to_map(), obj(clone), None);
        c0.cite = saved;
        a
    };
    let rec = w.add(&a);
    let lv = LawView::new(&w.v, mips());
    let puts = lv.record(&c0.id, &rec).map_err(|e| format!("{e:?}"))?.puts;
    let fell: Vec<Hash> = holders
        .iter()
        .enumerate()
        .filter(|(i, h)| kept.iter().position(|x| x == *h).map(|j| after[j]).unwrap_or(0) < before[*i])
        .map(|(_, h)| *h)
        .collect();
    let mark_ok = ids[..need].iter().all(|h| signed.contains(h));
    if puts == Some(clone) {
        for h in &fell {
            if !signed.contains(h) {
                return Err(format!("STAKE-MOVED: the record put in force a clone lowering {h:?}'s share without that holder's signature among those it names (rules 45, 46, 46b)"));
            }
        }
    } else if mark_ok && fell.iter().all(|h| signed.contains(h)) {
        let e = lv.record(&c0.id, &rec).map_err(|e| format!("{e:?}"))?;
        return Err(format!("STAKE-LIVENESS: every signature the clone needs is named, yet the record puts nothing in force: {:?} {:?}", e.clone, lv.agreement(&clone).map(|a| a.invalid)));
    }
    Ok(())
}

/// A stake in a collective never shrinks without its holder, departed
/// holders included.
#[test]
fn collective_stakes_move_only_with_their_holders() {
    let (mut runner, run) = runner("collective_stakes_move_only_with_their_holders", 96);
    let r = runner.run(&stake_case(), |c| stake_check(&c).map_err(TestCaseError::fail));
    if let Err(e) = r {
        run.failed(e);
    }
}

// ================================================================ counterexamples, kept
//
// Each story below is a counterexample the properties found, shrunk to its
// smallest form. IC-numbered: the library broke a clear rule; the code was
// fixed and the test checks the fix. IT-numbered: the text itself allows it,
// is silent, or reads two ways; the test pins what the code does today, for
// Nobody, allegedly, to decide (`docs/law-invariants.md`).

fn two() -> Shape {
    Shape { members: 2, devices: 1, member_devices: 1, constitutional: None, lane: None, owns_work: false }
}

fn fork_op(stale: u8, debts: DebtsMode) -> Op {
    Op::Fork { stale, sides: 0, debts, seal: Seal::Public, all_sign: true, succ_sign: true, names: true }
}

fn debt_op(dev: u8, cited: bool) -> Op {
    Op::Debt { dev, seal: Seal::Public, cited, creditor: 0, amount: 1, lane_sign: true }
}

/// IC1 (rule 35b, F127): a debt in the collective's name citing nothing on
/// its chain is on no chain of the collective and counts for nothing; it
/// binds no one. The library's consent said so, but `obligation_binds`
/// never asked it, and said the debt bound.
#[test]
fn ic1_a_debt_citing_nothing_binds_no_one() {
    let cw = run_col(&two(), &[debt_op(0, false)], 0);
    let d = cw.debts[0];
    let lv = cw.view();
    assert!(matches!(lv.consent(&d).unwrap(), law::Consent::Uncited { .. }));
    assert_eq!(lv.obligation_binds(&d).unwrap(), Some(false));
    // The same in a collective with a Finance lane whose holder never
    // signed the debt (rule 36a): not the collective's.
    let lane = Shape { lane: Some((1, 1)), ..two() };
    let cw = run_col(&lane, &[Op::Debt { dev: 0, seal: Seal::Public, cited: true, creditor: 0, amount: 1, lane_sign: false }], 0);
    assert_eq!(cw.view().obligation_binds(&cw.debts[0]).unwrap(), Some(false));
    let cw = run_col(&lane, &[debt_op(0, true)], 0);
    assert_eq!(cw.view().obligation_binds(&cw.debts[0]).unwrap(), Some(true));
}

/// IC2 (Finance rule 7, Law rule 47a D5): a debt is discharged by routes
/// ending at its creditor. The debtor collective signed a "receipt" naming
/// its own debt, and that let it close owing it.
#[test]
fn ic2_only_the_creditors_receipt_pays_a_debt() {
    let close = Op::Closing { stale: 0, seal: Seal::Public, all_sign: true, names: true };
    for (by, closes) in [(PaidBy::Debtor, false), (PaidBy::Stranger, false), (PaidBy::Creditor, true)] {
        let cw = run_col(&two(), &[debt_op(0, true), Op::Pay { debt: 0, by, full: true }, close.clone()], 0);
        let e = cw.view().closing(&cw.endings[0].id).unwrap();
        assert_eq!(e.complete, closes, "{by:?}: {:?}", e.why);
    }
}

/// IC3 (rules 40, 43; G1): an act of a grant key that a revocation does not
/// hold is void. A fork whose history held it brought it back: the fork's
/// branch returned "binds" before looking at revocations. Since F131
/// (IT2a), an act the collective's own key cites is adopted, so the story
/// that found this (a revocation on the other device citing the act)
/// now binds by adoption; the fork's history here holds the act through
/// its line naming the grant key's strand, which adopts nothing.
#[test]
fn ic3_a_revoked_act_stays_void_inside_a_forks_history() {
    let shape = Shape { devices: 2, ..two() };
    let ops = [
        Op::Grant { dev: 0, agent: 0, in_area: false, accept: true, holders_sign: false },
        Op::AgentAct { grant: 0, strand: 0, what: AgentWhat::InScope, seal: Seal::Public },
        // Device 0 revokes, never having heard of it: it races it.
        Op::Revoke { grant: 0, dev: 0, join_strand: false, holders_sign: false },
    ];
    let mut cw = run_col(&shape, &ops, 0);
    cw.line_strands = true;
    cw.apply(3, &fork_op(0, DebtsMode::Honest));
    let y = *cw.info.iter().find(|(_, f)| f.grant.is_some()).unwrap().0;
    assert!(history(&cw.w.v, &cw.col, &cw.endings[0].tips).contains(&y), "the fork's history holds it");
    let lv = cw.view();
    assert!(lv.closed_by(&cw.col).unwrap().is_some(), "the fork ends the collective: {:?}", lv.fork(&cw.endings[0].id).unwrap().why);
    assert!(matches!(lv.backing(&y).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G1")), "{:?}", lv.backing(&y));
    // The story that found it: the other device's revocation cites the
    // act, and adopts it (F131, IT2a).
    let ops = [
        Op::Grant { dev: 0, agent: 0, in_area: false, accept: true, holders_sign: false },
        Op::AgentAct { grant: 0, strand: 0, what: AgentWhat::InScope, seal: Seal::Public },
        Op::Revoke { grant: 0, dev: 1, join_strand: true, holders_sign: false },
        Op::Revoke { grant: 0, dev: 0, join_strand: false, holders_sign: false },
        fork_op(0, DebtsMode::Honest),
    ];
    let cw = run_col(&shape, &ops, 0);
    let y = *cw.info.iter().find(|(_, f)| f.grant.is_some()).unwrap().0;
    assert!(binds(&cw.view().backing(&y).unwrap()));
}

/// IC4 (rule 32a, F127 W2): a sale is recorded by an act of the collective
/// that acknowledges the payment. One rail payment, two receipts: the
/// collective acknowledged one; the other was judged "never recorded,
/// refunded": one payment both a purchase and owed back. The
/// acknowledgement here is the collective's witness act, which since F156
/// counts for nothing in Law and records nothing (rule 35b): both receipts
/// now share one verdict, never recorded before the fork, refunded. (Before
/// F156 this test had the witness act record both: a purchase.)
#[test]
fn ic4_an_acknowledgement_records_the_whole_payment() {
    let shape = Shape { lane: Some((3, 1)), owns_work: true, ..two() };
    let ops = [
        Op::Sale { strand: 1, proof: 0, disguise: Disguise::PayerIsService, lane_sign: false, line_current: false },
        Op::Sale { strand: 0, proof: 0, disguise: Disguise::None, lane_sign: false, line_current: false },
        Op::Ack { dev: 0, target: 0 },
        fork_op(0, DebtsMode::Honest),
    ];
    let cw = run_col(&shape, &ops, 0);
    let lv = cw.view();
    let verdicts: Vec<law::PurchaseVerdict> = cw.info.iter().filter(|(_, f)| matches!(f.kind, K::Receipt { .. })).map(|(x, _)| lv.purchase(x).unwrap().unwrap().verdict).collect();
    assert_eq!(verdicts.len(), 2);
    assert_eq!(verdicts[0], verdicts[1], "one payment, one verdict");
    assert!(matches!(verdicts[0], law::PurchaseVerdict::NoPurchase { .. }), "the witness act records nothing (F156): {verdicts:?}");
}

/// IC5 (rule 47a, the tie rule): an obligation outside the history a fork
/// cites binds no one, and no successor owes it, whatever the fork's field
/// 6 lists. A fork drawn one act back listed such a debt, and its
/// successor was named as owing it.
#[test]
fn ic5_no_successor_owes_a_debt_outside_the_forks_history() {
    let shape = Shape { owns_work: true, ..two() };
    let cw = run_col(&shape, &[debt_op(0, true), fork_op(1, DebtsMode::Extra)], 0);
    let lv = cw.view();
    assert!(lv.fork(&cw.endings[0].id).unwrap().complete);
    let d = cw.debts[0];
    assert!(lv.fork(&cw.endings[0].id).unwrap().fork.debts.iter().any(|(x, _)| x == &d), "the fork lists it");
    assert_eq!(lv.obligation_binds(&d).unwrap(), Some(false));
    assert_eq!(lv.debtors(&d).unwrap(), Some(vec![]));
}

/// IC10 (F144, verifier2 reading C, reworded after the review of F133 to
/// F144): a fork hands out only obligations that bind the collective: done,
/// on its chain, and within its signer's powers, or adopted. A debt a
/// device signed citing nothing on the collective's chain, or one the
/// Finance lane's holder never signed, binds no one, and a fork whose line
/// reaches it, handing out nothing, is complete all the same.
#[test]
fn ic10_a_fork_hands_out_only_debts_that_bind() {
    let uncited = run_col(&two(), &[debt_op(0, false), fork_op(0, DebtsMode::Nothing)], 0);
    let lane = Shape { lane: Some((1, 1)), ..two() };
    let unsigned = run_col(&lane, &[Op::Debt { dev: 0, seal: Seal::Public, cited: true, creditor: 0, amount: 1, lane_sign: false }, fork_op(0, DebtsMode::Nothing)], 0);
    for (cw, why) in [(uncited, "on no chain (rule 35b)"), (unsigned, "beyond its signer's powers: the lane never signed it (rule 36a)")] {
        let lv = cw.view();
        let d = cw.debts[0];
        assert_eq!(lv.obligation_binds(&d).unwrap(), Some(false), "it binds no one, {why}");
        let e = lv.fork(&cw.endings[0].id).unwrap();
        assert!(e.complete, "{why}: {:?}", e.why);
        assert!(e.unassigned.is_empty());
        assert_eq!(e.counts, Some(true));
        assert_eq!(lv.debtors(&d).unwrap(), Some(vec![]));
    }
    // One the lane signed is handed out, or the fork does not take effect.
    let signed = run_col(&lane, &[debt_op(0, true), fork_op(0, DebtsMode::Nothing)], 0);
    let lv = signed.view();
    assert_eq!(lv.obligation_binds(&signed.debts[0]).unwrap(), Some(true));
    assert!(!lv.fork(&signed.endings[0].id).unwrap().complete);
}

/// IC6 (determinism): the verifier kept its indexes in arrival order, so a
/// fork's list of debts it failed to hand out came out in the order the
/// debts arrived. Verdicts and explanations must not depend on delivery.
#[test]
fn ic6_explanations_do_not_depend_on_arrival_order() {
    let cw = run_col(&two(), &[debt_op(0, false), debt_op(0, false), fork_op(0, DebtsMode::Nothing)], 0);
    let first = verdicts(&cw.w.v, &Rails::default());
    for seed in 0..16 {
        same_verdicts(&first, &replay(&cw.w.log, seed, seed % 2 == 0, &Rails::default()), "another order").unwrap();
    }
}

/// IC7 (rules 15a, 21): sums of money and shares are taken wide. A split
/// whose payouts overflow 64 bits panicked the verifier (a release build
/// would wrap, and could read them as summing exactly); shares near the
/// top could wrap round to exactly 1,000,000 and pass the terms check.
#[test]
fn ic7_sums_that_overflow_never_pass() {
    let shape = DealShape { parties: 2, shares: vec![1, 1, 1, 1], service: true, backup: false, all_found: true };
    let ops = [
        DOp::Receipt { payee: 0, backup: false, disguise: DealDisguise::None, proof: 0, line_latest: false },
        DOp::Split { receipt: 0, mode: SplitMode::Overflow, fee: 0, deliver_all: true, cite: SplitCite::Latest, lie: false },
    ];
    let d = run_deal(&shape, &ops, 0);
    assert_eq!(d.view().split(&d.splits[0].0).unwrap().sums, Some(false));
    let (a, b) = (spec("ana"), spec("ben"));
    let mut t = run_deal(&shape, &[], 0).view().terms(&d.deal).unwrap();
    t.payee_grants = None;
    t.stakes = Some(vec![law::Stake { object: Who::Id(spec("a work")), holders: vec![(Who::Id(a), u64::MAX), (Who::Id(b), 1_000_001)] }]);
    t.parties = vec![a, b];
    assert!(t.check(&mips()).is_err(), "shares wrapping round to 1,000,000 are refused");
}

/// IC8 (rule 47a): after the line of the fork or closing that ended a
/// collective, its keys count for nothing in Law, so a record drawn there
/// registers no departure. A member's resignation, registered by a record
/// on a device the fork's line never named, took the member's voice off an
/// act in the fork's history: an ending undone from after it. Hidden until
/// F131 made ENDING-UNDONE a failure again.
#[test]
fn ic8_a_record_after_the_ending_registers_nothing() {
    let shape = Shape { members: 2, devices: 3, member_devices: 1, constitutional: None, lane: Some((1, 1)), owns_work: false };
    let ops = [
        Op::Grant { dev: 49, agent: 0, in_area: true, accept: false, holders_sign: true },
        Op::Fork { stale: 0, sides: 0, debts: DebtsMode::Honest, seal: Seal::Public, all_sign: true, succ_sign: false, names: false },
    ];
    let mut cw = run_col(&shape, &ops, 0);
    let g = *cw.info.iter().find(|(_, f)| matches!(f.kind, K::GrantAct)).unwrap().0;
    assert!(cw.view().closed_by(&cw.col).unwrap().is_some());
    assert!(cw.view().consent(&g).unwrap().counts());
    cw.apply(2, &Op::Resign { member: 30, area_only: false, dev: 65, tips: 4, inform: false });
    assert!(cw.view().consent(&g).unwrap().counts(), "{:?}", cw.view().consent(&g));
}

/// IC9 (F131 IT2a, the tie rule): an act the collective's own key cited
/// while it counted is adopted, and a departure racing that citation takes
/// no voice off it. A grant the Finance area's holders signed, cited by the
/// other device's next act; then both holders leave the area by records on
/// a device that never heard of either: the grant stopped counting. Hidden
/// until F131 made SAFE-ONCE-CITED a failure again.
#[test]
fn ic9_a_departure_racing_a_citation_takes_no_voice() {
    let shape = Shape { members: 2, devices: 2, member_devices: 1, constitutional: None, lane: Some((3, 1)), owns_work: false };
    let ops = [
        Op::Grant { dev: 1, agent: 0, in_area: true, accept: false, holders_sign: true },
        Op::Join { dev: 29, other: 0 },
        Op::Resign { member: 90, area_only: true, dev: 90, tips: 104, inform: false },
        Op::Resign { member: 13, area_only: false, dev: 68, tips: 4, inform: false },
    ];
    let cw = run_col(&shape, &ops, 0);
    assert_eq!(cw.cited_counting.len(), 1);
    let (y, by) = cw.cited_counting[0];
    let lv = cw.view();
    assert!(lv.consent(&by).unwrap().counts());
    assert!(lv.consent(&y).unwrap().counts(), "{:?}", lv.consent(&y));
    // Setting a racing departure aside must never make an act fail: here
    // the departure lowers the holders a threshold of two counts among, and
    // a later act of the device that signed the grant holds it without
    // holding the departure. (A first fix, skipping the departure outright,
    // brought the departed holder's voice back and failed the grant.)
    let shape = Shape { members: 2, devices: 2, member_devices: 1, constitutional: None, lane: Some((3, 2)), owns_work: true };
    let ops = [
        Op::Resign { member: 0, area_only: false, dev: 91, tips: 5, inform: false },
        Op::Grant { dev: 12, agent: 0, in_area: true, accept: false, holders_sign: true },
        Op::AgentAct { grant: 0, strand: 0, what: AgentWhat::InScope, seal: Seal::Public },
        Op::Join { dev: 73, other: 66 },
        Op::Join { dev: 92, other: 26 },
    ];
    let cw = run_col(&shape, &ops, 0);
    let (y, _) = cw.cited_counting[0];
    assert!(cw.view().consent(&y).unwrap().counts());
}

/// IT1, decided (F131): a complete ending is final. A later fork naming
/// the first counts for nothing: the first still ends the collective, its
/// successors keep what it handed them; a closing naming both, nothing
/// either. Two endings neither naming the other are tested in
/// `u1_a_signers_chain_orders_two_endings` and
/// `u2_a_third_ending_naming_both_settles_a_tie` (F132).
#[test]
fn it1_a_complete_ending_is_final() {
    let mut cw = ColWorld::new(&two(), 0);
    cw.apply(0, &fork_op(0, DebtsMode::Honest));
    let first = cw.endings[0].id;
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(first));
    // A second fork, complete, naming the first: it counts for nothing.
    cw.apply(1, &fork_op(0, DebtsMode::Honest));
    let second = cw.endings[1].id;
    let lv = cw.view();
    assert!(lv.fork(&first).unwrap().complete && lv.fork(&second).unwrap().complete);
    assert!(lv.ending_knows(&cw.col, &second).contains(&first));
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|c| c.by), Some(first), "the first stays final");
    // A closing naming both: later again, nothing.
    drop(lv);
    cw.apply(2, &Op::Closing { stale: 0, seal: Seal::Public, all_sign: true, names: true });
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(first));
}

/// A closing of `cw`'s collective drafted by `signers[0]`, signed by each
/// of `signers` with a chain signature (F132), naming in `objects` the
/// endings `names` (none: an ending drawn without knowing the others).
fn close_with(cw: &mut ColWorld, signers: &[usize], names: &[Hash]) -> Hash {
    let c = law::Closing { agreement: cw.current, collective: cw.col, chain_act: cw.c[0].binding, tips: cw.line(0) };
    let mut o = obj(cw.current).unwrap();
    o.extend(names.iter().map(|e| Object { chain: cw.current, predecessor: *e }));
    let x = law_act(&mut cw.w, &mut cw.m[signers[0]][0], law::types::CLOSING, c.to_map(), Some(o));
    for m in signers {
        cw.member_end(*m, &x, false);
    }
    let listed = cw.ids();
    cw.endings.push(EndingInfo { id: x, fork: false, tips: c.tips.iter().map(|t| t.act).collect(), listed });
    x
}

/// U1, decided (F132): a member signs a fork or closing with their safety
/// key, by a chain signature (Identity type 16) on their identity chain, so
/// any two of one member's ending signatures are ordered, whatever devices
/// they use. Of Ana, Ben and Cy (two of three suffice), Ana and Ben close
/// the collective. Cy, who did not sign it, drafts a second closing naming
/// nothing, and Ben signs it too: it names the first through Ben's chain,
/// counts for nothing, and the first stays final. A signature act (Law
/// type 1) on an ending counts for nothing. And U4b: a drafter who signed
/// an earlier ending must name it in `objects`; Ben's own closing leaving
/// it out is no ending.
#[test]
fn u1_a_signers_chain_orders_two_endings() {
    let shape = Shape { members: 3, devices: 1, member_devices: 3, constitutional: Some(2), lane: None, owns_work: false };
    let mut cw = ColWorld::new(&shape, 0);
    let first = close_with(&mut cw, &[0, 1], &[]);
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(first));
    let second = close_with(&mut cw, &[2, 1], &[]);
    let lv = cw.view();
    assert!(lv.closing(&first).unwrap().complete && lv.closing(&second).unwrap().complete, "{:?}", lv.closing(&second).unwrap().why);
    assert!(lv.ending_objects(&cw.col, &second).is_empty(), "the second names nothing in its objects");
    assert!(lv.ending_knows(&cw.col, &second).contains(&first), "it names the first through Ben's chain");
    assert!(!lv.ending_knows(&cw.col, &first).contains(&second));
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|c| c.by), Some(first), "the first stays final");
    drop(lv);
    // Ben drafts a closing leaving out the endings he signed: no ending.
    let third = close_with(&mut cw, &[1, 2], &[]);
    let lv = cw.view();
    let e = lv.closing(&third).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("U4b")), "{:?}", e.why);
    assert!(lv.ending_sigs(&cw.col).no_ending.contains_key(&third));
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|c| c.by), Some(first));
    drop(lv);
    // Signature acts (Law type 1) on a closing, the old way: no signature.
    let ids = cw.ids();
    let c = law::Closing { agreement: cw.current, collective: cw.col, chain_act: cw.c[0].binding, tips: cw.line(0) };
    let x = law_act(&mut cw.w, &mut cw.m[0][0], law::types::CLOSING, c.to_map(), obj(cw.current));
    sign(&mut cw.w, &mut cw.m[1][0], &x);
    let e = cw.view().closing(&x).unwrap();
    assert!(e.signed.is_empty() && !e.complete, "{:?}", e.why);
    assert!(cw.view().ending_signed(&cw.col, &x, &ids).is_empty());
}

/// U2, confirmed (F132): only endings sharing no signer can tie. Ana and
/// Ben close the collective; Cy and Dee, unaware, close it too (two of
/// four suffice): a true tie, and neither counts. A third closing Ana
/// drafts, naming in its `objects` the one she signed (U4b), and Cy signs,
/// settles it: it names the other through Cy's chain, and counts.
#[test]
fn u2_a_third_ending_naming_both_settles_a_tie() {
    let shape = Shape { members: 4, devices: 1, member_devices: 1, constitutional: Some(2), lane: None, owns_work: false };
    let mut cw = ColWorld::new(&shape, 0);
    let c1 = close_with(&mut cw, &[0, 1], &[]);
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(c1));
    let c2 = close_with(&mut cw, &[2, 3], &[]);
    let lv = cw.view();
    assert!(lv.closing(&c1).unwrap().complete && lv.closing(&c2).unwrap().complete);
    assert!(lv.ending_knows(&cw.col, &c2).is_empty() && lv.ending_knows(&cw.col, &c1).is_empty());
    assert_eq!(lv.closed_by(&cw.col).unwrap(), None, "a race between equals: neither counts");
    drop(lv);
    let c3 = close_with(&mut cw, &[0, 2], &[c1]);
    let lv = cw.view();
    assert_eq!(lv.ending_knows(&cw.col, &c3), [c1, c2].into_iter().collect());
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|x| x.by), Some(c3));
}

/// U4, decided (F132, option a): a member's signature on an ending counts
/// for nothing where it lies, on their identity chain, after their own
/// signature on another ending naming it. Ben drafts a closing and signs
/// it; Ana does not. They then close by a second closing, naming the
/// first; it is complete, and final. Weeks later Ana signs the first: her
/// signature counts for nothing, and the second stays final. (Before F132
/// the first then counted, and the second for nothing.)
///
/// The stated cost: under a threshold, a member who signed no ending
/// naming the old proposal can still finish it with others' earlier
/// signatures. Of Ana, Ben and Cy (two of three suffice), Ben drafts and
/// signs a closing; Ana and Ben close by a second one naming it; Cy, who
/// signed neither, signs the first: it is complete with Ben's earlier
/// signature, named by the second, so the earlier: it counts, and the
/// second for nothing. Visible: Cy's late signature is on Cy's chain.
#[test]
fn u4_an_old_proposal_finished_late_counts_for_nothing() {
    let mut cw = ColWorld::new(&two(), 0);
    let ids = cw.ids();
    let old = close_with(&mut cw, &[1], &[]);
    assert!(!cw.view().closing(&old).unwrap().complete);
    let new = close_with(&mut cw, &[0, 1], &[old]);
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(new));
    cw.member_end(0, &old, true);
    let lv = cw.view();
    let sigs = lv.ending_sigs(&cw.col);
    assert_eq!(sigs.void.get(&(old, ids[0])).map(|v| v.1), Some(new), "Ana's late signature counts for nothing");
    assert!(!lv.closing(&old).unwrap().complete);
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|c| c.by), Some(new));
    drop(lv);

    let shape = Shape { members: 3, devices: 1, member_devices: 1, constitutional: Some(2), lane: None, owns_work: false };
    let mut cw = ColWorld::new(&shape, 0);
    let old = close_with(&mut cw, &[1], &[]);
    let new = close_with(&mut cw, &[0, 1], &[old]);
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(new));
    cw.member_end(2, &old, true);
    let lv = cw.view();
    assert!(lv.closing(&old).unwrap().complete);
    assert!(lv.ending_sigs(&cw.col).void.is_empty());
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|c| c.by), Some(old), "the stated cost");
}

/// U4b, decided (F132, option b; found by the large run): an ending's
/// drafter names, in its `objects`, every ending of the collective they
/// signed earlier on their own chain; otherwise it is no ending. Ben drafts
/// and signs a fork; Ana does not. Ben then drafts a second fork leaving
/// the first out, and both sign it. Before U4b, Ana's late signature on the
/// first made the two forks name each other through their chains, and
/// neither counted: an ending undone, even under the every-member rule. Now
/// the second fork is no ending; the first, once Ana signs it, is complete
/// and ends the collective.
#[test]
fn u4b_a_drafter_names_the_endings_they_signed() {
    let mut cw = ColWorld::new(&two(), 0);
    cw.apply(0, &Op::Fork { stale: 0, sides: 0, debts: DebtsMode::Honest, seal: Seal::Public, all_sign: false, succ_sign: false, names: false });
    let first = cw.endings[0].id;
    cw.apply(1, &Op::Fork { stale: 0, sides: 0, debts: DebtsMode::Honest, seal: Seal::Public, all_sign: true, succ_sign: false, names: false });
    let second = cw.endings[1].id;
    let lv = cw.view();
    let e = lv.fork(&second).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("U4b")), "{:?}", e.why);
    assert_eq!(lv.ending_sigs(&cw.col).no_ending.get(&second), Some(&first));
    assert_eq!(lv.closed_by(&cw.col).unwrap(), None);
    drop(lv);
    cw.apply(2, &Op::LateSign { ending: 0, member: 0 });
    let lv = cw.view();
    assert!(lv.fork(&first).unwrap().complete, "{:?}", lv.fork(&first).unwrap().why);
    assert_eq!(lv.closed_by(&cw.col).unwrap().map(|c| c.by), Some(first));
    drop(lv);
    assert!(cw.check().is_ok(), "{:?}", cw.check());

    // The stated cost, found by the large run after U4b: Ana drafts the
    // second fork, never having signed the first, and names nothing; both
    // sign it. Ana then signs the first: Ben's chain puts the first before
    // the second, Ana's the second before the first; each names the other,
    // and neither counts, as in a true race.
    let ops = [
        Op::Fork { stale: 0, sides: 188, debts: DebtsMode::Honest, seal: Seal::Public, all_sign: false, succ_sign: false, names: false },
        Op::Fork { stale: 0, sides: 125, debts: DebtsMode::Honest, seal: Seal::Public, all_sign: true, succ_sign: false, names: false },
    ];
    let mut cw = run_col(&two(), &ops, 0);
    let second = cw.endings[1].id;
    assert_eq!(cw.view().closed_by(&cw.col).unwrap().map(|c| c.by), Some(second));
    cw.apply(2, &Op::LateSign { ending: 134, member: 0 });
    assert_eq!(cw.view().closed_by(&cw.col).unwrap(), None);
    // Counted as the stated cost (ENDING-LATE), not failed.
    assert!(cw.check().is_ok(), "{:?}", cw.check());
}

/// IT2a, decided (F131): an act that a counting act of the collective's
/// own key cites is adopted (rule 40), and no ending racing that citation
/// voids it. Device 1 cites the agent's act; device 0, which never heard of
/// it, revokes the grant: the act still binds; the revocation ends the
/// grant for everything after it.
#[test]
fn it2_a_cited_act_is_adopted() {
    let shape = Shape { devices: 2, ..two() };
    let ops = [
        Op::Grant { dev: 0, agent: 0, in_area: false, accept: true, holders_sign: false },
        Op::AgentAct { grant: 0, strand: 0, what: AgentWhat::InScope, seal: Seal::Public },
        // Device 1 cites the agent's act: the counterparty performs.
        Op::Join { dev: 1, other: 1 },
        // Device 0, which never heard of it, revokes the grant.
        Op::Revoke { grant: 0, dev: 0, join_strand: false, holders_sign: false },
        // The agent acts again, after the revocation: void.
        Op::AgentAct { grant: 0, strand: 0, what: AgentWhat::InScope, seal: Seal::Public },
    ];
    let cw = run_col(&shape, &ops, 0);
    let ys: Vec<Hash> = cw.info.iter().filter(|(_, f)| f.grant.is_some()).map(|(x, _)| *x).collect();
    let (cited, later): (Vec<Hash>, Vec<Hash>) = ys.iter().partition(|y| cw.cited_counting.iter().any(|(c, _)| c == *y));
    assert_eq!(cited.len(), 1, "the collective cited one act while it counted");
    let lv = cw.view();
    assert!(binds(&lv.backing(&cited[0]).unwrap()), "{:?}", lv.backing(&cited[0]));
    for y in &later {
        assert!(matches!(lv.backing(y).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G1")), "{:?}", lv.backing(y));
    }
}

/// IT2b, decided (F131): a fork drawn on an old line on purpose is a
/// stated cost. No verifier can tell a line drawn early on purpose from one
/// drawn before the later acts existed, and every cure would let something
/// published after a fork reopen it (against IT1). It needs every signer of
/// the fork to break the client conformance rule (pull every device's
/// latest acts before signing an ending), and it stays legible: the signed
/// debt, the act citing it and the fork leaving it out stand as evidence.
#[test]
fn it2b_a_stale_line_is_a_stated_cost() {
    let shape = Shape { owns_work: true, ..two() };
    let mut cw = ColWorld::new(&shape, 0);
    cw.apply(0, &debt_op(0, true));
    let d = cw.debts[0];
    // The collective's next act cites the debt (its sequence's previous act).
    cw.apply(1, &Op::Publish { dev: 0, seal: Seal::Public });
    let citing = *cw.info.iter().find(|(_, f)| f.kind == K::Publication).unwrap().0;
    assert_eq!(cw.view().obligation_binds(&d).unwrap(), Some(true));
    cw.apply(2, &fork_op(2, DebtsMode::Honest));
    let lv = cw.view();
    let f = lv.fork(&cw.endings[0].id).unwrap();
    assert!(f.complete, "{:?}", f.why);
    // The cost: the debt, outside the stale line's history, binds no one.
    assert_eq!(lv.obligation_binds(&d).unwrap(), Some(false));
    assert_eq!(lv.debtors(&d).unwrap(), Some(vec![]));
    // Legible: the debt and the act citing it stand, and the fork's line
    // leaves out an act the collective's own chain had moved past.
    assert_eq!(cw.w.v.status(&d), Status::Valid);
    assert_eq!(cw.w.v.status(&citing), Status::Valid);
    assert!(!history(&cw.w.v, &cw.col, &cw.endings[0].tips).contains(&citing));
}

/// IT3, decided (F131): the payment decides. One push payment, its
/// commitment naming the new version; Ben's wallet signs two receipts for
/// it, one naming the old version, one the new; Ana's names the new. The
/// rail shows Ben's old-version receipt wrong (its commitment, recomputed,
/// is not the payment's): it counts for nothing, and the payment is judged
/// by the receipts naming its claim. A verifier that has not checked the
/// rail yet cannot tell which is wrong: it judges none of them a purchase
/// or a refund until it can.
#[test]
fn it3_the_payments_claim_decides() {
    let shape = DealShape { parties: 2, shares: vec![1, 1, 1, 1], service: false, backup: false, all_found: true };
    let ops = [
        DOp::Clone { shares: vec![1, 2, 1, 1], signers: 0xff, thieves: 0, from_latest: false },
        DOp::Push { proof: 4, payees: 0b11, line_latest: true },
        DOp::Push { proof: 4, payees: 0b10, line_latest: false },
    ];
    let d = run_deal(&shape, &ops, 0);
    assert_eq!(d.wrong.len(), 1, "Ben's old-version receipt");
    let lv = d.view();
    for (x, _) in &d.push {
        let got = lv.purchase(x).unwrap().unwrap().verdict;
        if d.wrong.contains(x) {
            assert!(matches!(got, law::PurchaseVerdict::WrongReceipt { ref why } if why.contains("IT3")), "{got:?}");
        } else {
            assert_eq!(got, law::PurchaseVerdict::Purchase);
        }
    }
    let mut bare = LawView::new(&d.w.v, mips());
    bare.push_rails.insert(push_rail());
    for (x, _) in &d.push {
        assert_eq!(bare.purchase(x).unwrap().unwrap().verdict, law::PurchaseVerdict::Unrecorded, "no rail answer yet");
    }
}


// verifier2 (docs/verifier2-report.md): exports the random collective
// histories above, and the library's verdicts on them, for the independent
// verifier in verifier2/ to judge. Ignored unless asked for; changes nothing.
mod verifier2_export {
    include!("../../verifier2/export/export.rs");
}
