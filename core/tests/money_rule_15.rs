//! Money rule 15, theft: anchor or bear the loss (F169, F176 to F181),
//! over real signed acts: identity chains with homes, receipts, rotations,
//! payee pointers, deals, debts and claims, and anchors checked by a test
//! anchoring cMIP through the core library's Envelopes interface (F173).
//!
//! In plain words: the owner names a clock (a main time reference and,
//! optionally, a backup) with the safety key. After a theft, the owner
//! changes the locks by rotation. While that lock change is not anchored,
//! every payment that followed the chain as published counts: the owner
//! bears the theft window. Once its home quorum's receipts are anchored on
//! the declared clock, a payment it affects counts only where the payee's
//! own receipt shows it, or the payer's claim is anchored on that clock
//! before or at that point.
//!
//! Each test names the fix it pins; each was run with that fix removed and
//! failed (the build report says where).
//!
//! Test identities only.

mod common;

use common::{home, Person, Rot, World};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::{Quorum, Status};
use mor_core::envelopes::anchoring::{AnchoringCmip, Anchors, Reference};
use mor_core::money::{self as fin, Amount, Claim, Clock, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry};
use mor_core::hash::{sha256, tagged_hash, Hash};
use mor_core::identity::{Declaration, HomeRule};
use mor_core::agreements::{self, AgreementsView, Mips};
use mor_core::sig::{self, SchnorrKey, Verdict};
use std::collections::BTreeMap;

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: common::identity_spec(),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: common::money_spec(),
        agreements: common::agreements_spec(),
        development: t("PRODUCTION"),
    }
}

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn unit() -> Hash {
    h("a unit")
}

fn rail() -> Hash {
    h("a rail Module")
}

fn amount(value: u64) -> Amount {
    Amount { unit: unit(), value }
}

// ---------------------------------------------------------------- a test anchoring cMIP

/// A test anchoring cMIP: a clock service signs `(act, point)` with its
/// key; its parameters name the clock by that key. The proof is the point,
/// eight bytes big-endian, then the signature. *Experimental, tests only:
/// it stands for a real chain, which a real cMIP would read.*
struct TestClock {
    key: SchnorrKey,
}

fn anchoring_cmip() -> Hash {
    h("a test anchoring cMIP")
}

impl TestClock {
    fn new(name: &str) -> Self {
        TestClock { key: SchnorrKey::from_secret(&h(name)).unwrap() }
    }
    fn reference(&self) -> Reference {
        Reference { cmip: anchoring_cmip(), params: Value::Bytes(self.key.public().to_vec()) }
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

/// The cMIP's verification rule, as a verifier carries it: any clock key.
struct TestAnchoring;

impl AnchoringCmip for TestAnchoring {
    fn spec(&self) -> Hash {
        anchoring_cmip()
    }
    fn verify(&self, act: &Hash, params: &Value, proof: &[u8]) -> Option<u64> {
        let Value::Bytes(key) = params else { return None };
        if proof.len() < 8 {
            return None;
        }
        let point = u64::from_be_bytes(proof[..8].try_into().ok()?);
        let s = mor_core::act::Signature { scheme: mor_core::act::Scheme::Founding(1), key: key.clone(), sig: proof[8..].to_vec() };
        (sig::verify(&s, &TestClock::message(act, point)) == Verdict::Valid).then_some(point)
    }
}

// ---------------------------------------------------------------- the lab

/// A world, three home operators, and what the verifier's caller holds
/// besides acts: the rail's answers and the anchors it checked.
struct Lab {
    w: World,
    homes: Vec<Person>,
    rail_valid: BTreeMap<Hash, PaidAt>,
    anchors: Anchors,
    main: TestClock,
    backup: TestClock,
    elsewhere: TestClock,
}

impl Lab {
    fn new() -> Self {
        let mut w = World::new();
        let homes = vec![w.operator("home one"), w.operator("home two"), w.operator("home three")];
        Lab {
            w,
            homes,
            rail_valid: BTreeMap::new(),
            anchors: Anchors::new(),
            main: TestClock::new("the main clock"),
            backup: TestClock::new("the backup clock"),
            elsewhere: TestClock::new("a clock the owner never named"),
        }
    }

    fn view(&self) -> AgreementsView<'_> {
        let mut v = AgreementsView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.anchored = self.anchors.clone();
        v
    }

    fn clock(&self, backup: bool) -> Clock {
        Clock { main: self.main.reference(), backup: backup.then(|| self.backup.reference()) }
    }

    /// Anchor `act` at `point` on `clock`'s reference, checked by the
    /// anchoring cMIP. Anyone may anchor any act.
    fn anchor(&mut self, act: Hash, on: &str, point: u64) {
        let c = match on {
            "main" => &self.main,
            "backup" => &self.backup,
            _ => &self.elsewhere,
        };
        let (r, p) = (c.reference(), c.proof(&act, point));
        assert!(self.anchors.add_proof(&TestAnchoring, &r, &act, &p));
    }

    /// An owner homed at the three operators (the default majority: two
    /// of three), declaring `declarations` at genesis.
    fn owner(&mut self, name: &str, declarations: Vec<Declaration>, rule: Option<HomeRule>) -> Person {
        let homes = self.homes.iter().map(home).collect();
        let d = (!declarations.is_empty()).then_some(declarations);
        self.w.genesis_with(name, homes, rule, None, d, 3)
    }

    fn person(&mut self, name: &str) -> Person {
        self.w.genesis(name, vec![common::own_home()], None, None)
    }

    /// A rotation of `p`, held; receipts from the homes listed (by index),
    /// each held. Returns the rotation, the owner after it, and the
    /// receipts.
    fn rotate(&mut self, p: &Person, r: Rot, receipted_by: &[usize]) -> (Hash, Person, Vec<Hash>) {
        let (rot, q) = self.w.rotate(p, r);
        let receipts = receipted_by.iter().map(|&i| self.receipt(i, &q, rot)).collect();
        (rot, q, receipts)
    }

    fn receipt(&mut self, i: usize, p: &Person, rot: Hash) -> Hash {
        let mut op = self.homes[i].clone();
        let r = self.w.receipt(&mut op, &p.id, &rot, p.position);
        self.homes[i] = op;
        r
    }

    fn act(&mut self, p: &mut Person, spec: Hash, t: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>, refs: Option<Vec<Ref>>) -> Hash {
        let a = self.w.everyday_act_refs(p, spec, t, payload, objects, None, refs);
        self.w.add(&a)
    }

    fn pointer(&mut self, p: &mut Person, payee: Hash, version: u64, previous: Option<Hash>, node: &str) -> Hash {
        let x = Payload::PayeePointer(PayeePointer { payee, version, previous, rails: vec![Rail { module: rail(), address: node.as_bytes().to_vec() }] });
        self.act(p, mips().money, fin::types::PAYEE_POINTER, x.to_map(), None, None)
    }

    fn terms(&mut self, by: &mut Person) -> Hash {
        self.act(by, mips().agreements, agreements::types::TERMS, vec![], None, None)
    }

    /// `p`'s signature act on `terms`, citing `refs` (a conforming client
    /// cites the signer's latest pointer, F163).
    fn sign(&mut self, p: &mut Person, terms: Hash, refs: Vec<Hash>) -> Hash {
        let o = Some(vec![Object { chain: terms, predecessor: terms }]);
        let refs = (!refs.is_empty()).then(|| refs.into_iter().map(Ref::Act).collect());
        self.act(p, mips().agreements, agreements::types::SIGNATURE, agreements::signature_payload(&terms), o, refs)
    }

    fn debt(&mut self, debtor: &mut Person, creditor: Hash, value: u64, named: Hash, agreement: Hash) -> Hash {
        let o = Payload::Obligation(Obligation { debtor: debtor.id, creditor, amount: amount(value), pointer: named, agreement: Some(agreement) });
        self.act(debtor, mips().money, fin::types::OBLIGATION, o.to_map(), None, None)
    }

    /// The payer's claim, its rail answer stated valid, paid at `at`.
    fn claim(&mut self, payer: &mut Person, payee: Hash, fulfils: Hash, value: u64, proof: &str, at: PaidAt) -> Hash {
        let c = Claim {
            rail: rail(),
            proof: proof.as_bytes().to_vec(),
            payee,
            amount: amount(value),
            fulfils,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: None,
        };
        let id = self.act(payer, mips().money, fin::types::CLAIM, Payload::Claim(c).to_map(), None, None);
        self.rail_valid.insert(id, at);
        id
    }

    /// A receipt signed by `signer` (the payee, or a thief with its key).
    fn receipt_for(&mut self, signer: &mut Person, payer: Hash, fulfils: Hash, value: u64, proof: &str) -> Hash {
        let payee = signer.id;
        let r = Payload::Receipt(Receipt {
            rail: rail(),
            proof: proof.as_bytes().to_vec(),
            payer: Some(Payer::Identity(payer)),
            payee,
            amount: amount(value),
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        self.act(signer, mips().money, fin::types::RECEIPT, r.to_map(), None, None)
    }

    fn paid(&self, debt: &Hash) -> u64 {
        self.view().paid_toward(debt)
    }
}

fn clock_decl(c: &Clock) -> Declaration {
    fin::clock_declaration(&mips().money, c)
}

fn vault_decl(limit: u64, source: &str) -> Declaration {
    fin::vault_declaration(&mips().money, &[VaultEntry { unit: unit(), rail_module: rail(), source: source.as_bytes().to_vec(), limit }])
}

// ---------------------------------------------------------------- the clock (F176, F179, F181)

/// The clock format: a main reference and an optional backup, each an
/// anchoring cMIP and its parameters, in that order; nothing else decodes.
#[test]
fn the_clock_declares_a_main_reference_and_an_optional_backup() {
    let l = Lab::new();
    for c in [l.clock(false), l.clock(true)] {
        assert_eq!(Clock::decode(&c.to_value()).unwrap(), c);
        let d = clock_decl(&c);
        assert_eq!(fin::clock_in(&mips().money, &[d]).unwrap(), Some(Some(c)));
    }
    let three = Value::Array(vec![l.main.reference().to_value(); 3]);
    assert!(Clock::decode(&three).is_err(), "one backup at most");
    assert!(Clock::decode(&Value::Array(vec![])).is_err(), "a main reference is required");
    let removed = Declaration { spec: mips().money, kind: fin::CLOCK_KIND, value: None };
    assert_eq!(fin::clock_in(&mips().money, &[removed]).unwrap(), Some(None));
}

// ---------------------------------------------------------------- the stolen key re-points a deal

/// The theft story's acts: an owner homed at three operators, declaring a
/// clock; its version 1 pointer, cited by its signature on a deal; a thief
/// holding the stolen signing key publishes version 2 (the thief's node)
/// and signs the deal again citing it (F170: the window's cost); the
/// debtor's client follows rule 14 and pays version 2, claiming it.
struct Theft {
    l: Lab,
    owner: Person,
    debtor: Person,
    v1: Hash,
    v2: Hash,
    deal: Hash,
    debt: Hash,
    claim: Hash,
    thiefs_signature: Hash,
}

fn theft(clock: Option<Clock>) -> Theft {
    let mut l = Lab::new();
    let decls = clock.iter().map(clock_decl).collect();
    let mut owner = l.owner("owner", decls, None);
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's node");
    let deal = l.terms(&mut debtor);
    l.sign(&mut debtor, deal, vec![]);
    l.sign(&mut owner, deal, vec![v1]);
    let mut thief = owner.clone();
    let v2 = l.pointer(&mut thief, oid, 2, Some(v1), "the thief's node");
    let thiefs_signature = l.sign(&mut thief, deal, vec![v2]);
    let debt = l.debt(&mut debtor, oid, 70, v2, deal);
    let claim = l.claim(&mut debtor, oid, debt, 70, "paid to the thief's node", PaidAt::Flow(v2));
    assert_eq!(l.paid(&debt), 70, "the window: what the stolen key published counts");
    Theft { l, owner, debtor, v1, v2, deal, debt, claim, thiefs_signature }
}

/// The owner changes the locks: a rotation disowning the thief's acts.
/// Receipted by homes one and two, the quorum of the default majority.
fn lock_change(t: &mut Theft) -> (Hash, Vec<Hash>) {
    let (rot, owner, receipts) = t.l.rotate(&t.owner, Rot { disowned: Some(vec![t.v2, t.thiefs_signature]), ..Default::default() }, &[0, 1]);
    t.owner = owner;
    assert_eq!(t.l.w.v.resolve(&t.owner.id).position_of(&rot), Some(1), "the rotation counts");
    assert_eq!(t.l.w.v.status(&t.v2), Status::Void);
    (rot, receipts)
}

/// F169: an unanchored lock change leaves the loss with the owner. Once its
/// home quorum is anchored on the declared clock, the payment to the
/// thief's node counts only where the payer's claim is anchored there
/// before or at that point (F178: "before or at"). *Removal check: with
/// rule 15 reduced to "counts while the pointer stood" (no lock change
/// read), the anchored lock change changes nothing and the second
/// assertion fails.*
#[test]
fn anchor_or_bear_the_loss() {
    let mut t = theft(Some(Lab::new().clock(false)));
    let (_, receipts) = lock_change(&mut t);
    assert_eq!(t.l.paid(&t.debt), 70, "not anchored: the owner bears the window");
    t.l.anchor(receipts[0], "main", 100);
    t.l.anchor(receipts[1], "main", 120);
    assert_eq!(t.l.paid(&t.debt), 0, "anchored at 120, the claim is not: the payer bears");
    t.l.anchor(t.claim, "main", 121);
    assert_eq!(t.l.paid(&t.debt), 0, "anchored after the point");
    t.l.anchor(t.claim, "main", 120);
    assert_eq!(t.l.paid(&t.debt), 70, "anchored at the point: before or at (F178)");
}

/// F178 (items 3 and 4): where a payment counts under rule 15, the version
/// it was paid under is selected from the payee's acts as they stood
/// before the lock change, those the rotation voided included: the
/// thief's signature on the deal selects version 2, so the debtor who paid
/// it does not pay twice. Otherwise, for money, a voided act selects
/// nothing: a debt under the deal now counts on version 1 again, and a
/// payment to version 2 with no anchored claim counts for nothing.
/// *Removal check: selecting only from acts valid now (voided ones
/// excluded), the first assertion fails: the payment followed no state.*
#[test]
fn the_version_is_selected_as_the_payees_acts_stood_before_the_lock_change() {
    let mut t = theft(Some(Lab::new().clock(false)));
    t.l.anchor(t.claim, "main", 10);
    let (_, receipts) = lock_change(&mut t);
    t.l.anchor(receipts[0], "main", 50);
    t.l.anchor(receipts[1], "main", 50);
    assert_eq!(t.l.paid(&t.debt), 70, "anchored before the point: paid, once");
    // Now: the thief's signature act holds no pointer.
    let oid = t.owner.id;
    let holding = t.l.view().pointer_holding(&t.deal, &oid).unwrap();
    assert!(!holding.pointers.contains(&t.v2), "a voided act holds nothing for money");
    let d2 = t.l.debt(&mut t.debtor, oid, 30, t.v2, t.deal);
    t.l.claim(&mut t.debtor, oid, d2, 30, "a later payment to the thief", PaidAt::Flow(t.v2));
    assert_eq!(t.l.paid(&d2), 0);
    let d3 = t.l.debt(&mut t.debtor, oid, 30, t.v2, t.deal);
    t.l.claim(&mut t.debtor, oid, d3, 30, "to the owner's version 1", PaidAt::Flow(t.v1));
    assert_eq!(t.l.paid(&d3), 30);
}

/// F176, F179: anchors compare only on the clock the payee declared. A
/// colluding payer anchors its claim early, on a reference the owner never
/// named: not protected. *Removal check: comparing on any reference the
/// claim is anchored on, the first assertion fails.*
#[test]
fn a_claim_anchored_on_another_clock_is_not_protected() {
    let mut t = theft(Some(Lab::new().clock(false)));
    t.l.anchor(t.claim, "elsewhere", 1);
    let (_, receipts) = lock_change(&mut t);
    t.l.anchor(receipts[0], "main", 100);
    t.l.anchor(receipts[1], "main", 100);
    assert_eq!(t.l.paid(&t.debt), 0, "anchored, but on no reference the clock names");
    // The quorum anchored elsewhere does not make the lock change anchored.
    let mut u = theft(Some(Lab::new().clock(false)));
    let (_, receipts) = lock_change(&mut u);
    u.l.anchor(receipts[0], "elsewhere", 100);
    u.l.anchor(receipts[1], "elsewhere", 100);
    assert_eq!(u.l.paid(&u.debt), 70, "a lock change counts as anchored only on the declared clock");
}

/// F179: the backup counts only where the lock change is not anchored on
/// the main reference: then a claim anchored on the backup by its point
/// counts, and so does a claim anchored on the main reference at all.
/// Where the lock change is anchored on the main one, the backup orders
/// nothing. *Removal check: comparing on the backup whenever both carry
/// the lock change, the last assertion fails.*
#[test]
fn the_backup_clock_is_used_only_when_the_main_one_is_not() {
    let backed = || Some(Lab::new().clock(true));
    // Only on the backup.
    let mut t = theft(backed());
    let (_, r) = lock_change(&mut t);
    t.l.anchor(r[0], "backup", 50);
    t.l.anchor(r[1], "backup", 50);
    assert_eq!(t.l.paid(&t.debt), 0);
    t.l.anchor(t.claim, "backup", 40);
    assert_eq!(t.l.paid(&t.debt), 70, "on the backup, before its point");
    let mut t = theft(backed());
    let (_, r) = lock_change(&mut t);
    t.l.anchor(r[0], "backup", 50);
    t.l.anchor(r[1], "backup", 50);
    t.l.anchor(t.claim, "main", 9_000);
    assert_eq!(t.l.paid(&t.debt), 70, "a claim on the main reference also counts as made (F179)");
    // On both: the main one decides.
    let mut t = theft(backed());
    let (_, r) = lock_change(&mut t);
    for x in &r {
        t.l.anchor(*x, "main", 100);
        t.l.anchor(*x, "backup", 100);
    }
    t.l.anchor(t.claim, "backup", 1);
    assert_eq!(t.l.paid(&t.debt), 0, "anchored on the main reference: the backup orders nothing");
}

/// F182 item 1: where the lock change is anchored only on the backup, a
/// claim anchored on the main reference counts as made whatever its point:
/// the two references cannot be compared, so a main anchor long after the
/// backup point still counts, and one anchored only on the backup must be
/// before or at its point. *Removal check: comparing the main anchor's
/// point with the backup point, as if on one reference, the second
/// assertion fails.*
#[test]
fn a_main_clock_claim_counts_when_the_lock_change_is_anchored_only_on_the_backup() {
    let mut t = theft(Some(Lab::new().clock(true)));
    let (_, r) = lock_change(&mut t);
    t.l.anchor(r[0], "backup", 50);
    t.l.anchor(r[1], "backup", 50);
    t.l.anchor(t.claim, "backup", 51);
    assert_eq!(t.l.paid(&t.debt), 0, "on the backup, after its point");
    t.l.anchor(t.claim, "main", 1_000_000);
    assert_eq!(t.l.paid(&t.debt), 70, "on the main reference: counts, whatever its point (F182)");
}

/// F176: a payee that declared no clock has chosen no protection: its lock
/// changes count as not anchored, whatever is anchored where. *Removal
/// check: reading a lock change without a clock as anchored on whatever
/// reference its receipts carry, the assertion fails.*
#[test]
fn with_no_clock_declared_the_owner_bears() {
    let mut t = theft(None);
    let (rot, r) = lock_change(&mut t);
    for x in r.iter().chain([&rot]) {
        t.l.anchor(*x, "main", 5);
    }
    assert_eq!(t.l.paid(&t.debt), 70);
}

/// F176: comparison is on the clock the payee's chain declared before the
/// lock change, not one the lock change itself declares: a thief cannot
/// be the one who names it, and neither can the rotation it judges.
/// *Removal check: reading the clock at the lock change itself, the
/// assertion fails.*
#[test]
fn the_clock_declared_before_the_lock_change_decides() {
    let mut t = theft(Some(Lab::new().clock(false)));
    let elsewhere = Clock { main: t.l.elsewhere.reference(), backup: None };
    let (rot, owner, r) = t.l.rotate(&t.owner, Rot { disowned: Some(vec![t.v2, t.thiefs_signature]), declarations: Some(vec![clock_decl(&elsewhere)]), ..Default::default() }, &[0, 1]);
    t.owner = owner;
    let _ = rot;
    t.l.anchor(r[0], "main", 100);
    t.l.anchor(r[1], "main", 100);
    t.l.anchor(t.claim, "elsewhere", 1);
    assert_eq!(t.l.paid(&t.debt), 0, "compared on the main clock declared before");
}

// ---------------------------------------------------------------- the point (F177, F180)

/// F180: the lock change's point is when its home quorum is met and
/// anchored: with a majority of two of three homes, the second-earliest
/// home's anchored receipt. The owner's own home anchoring its receipt
/// early does not set the point. *Removal check: with the point set at the
/// earliest anchored receipt (F177's reading), the second assertion
/// fails.*
#[test]
fn the_point_is_when_the_home_quorum_is_anchored() {
    let mut t = theft(Some(Lab::new().clock(false)));
    let (rot, owner, r) = t.l.rotate(&t.owner, Rot { disowned: Some(vec![t.v2, t.thiefs_signature]), ..Default::default() }, &[0, 1, 2]);
    t.owner = owner;
    let q = t.l.w.v.quorum(&t.owner.id, &rot).unwrap();
    assert!(matches!(&q, Quorum::Homes { need: 2, supports } if supports.len() == 3));
    t.l.anchor(r[0], "main", 10);
    assert_eq!(t.l.paid(&t.debt), 70, "one home's receipt is no quorum: no point yet");
    t.l.anchor(t.claim, "main", 30);
    t.l.anchor(r[2], "main", 60);
    t.l.anchor(r[1], "main", 50);
    assert_eq!(fin::quorum_point(&q, &rot, &t.l.anchors, &t.l.main.reference()), Some(50));
    assert_eq!(t.l.paid(&t.debt), 70, "the point is 50; the claim at 30 is before it");
}

/// F177, F180: a rotation signed and anchored, but kept back from the
/// homes, has no point: it counts from when the homes the rule requires
/// hold it and their receipts are anchored. The owner anchors its own
/// rotation early, publishes it days later; the payer's claim anchored
/// in between still counts. *Removal check: with the rotation's own anchor
/// as its point for a homed identity, the last assertion fails.*
#[test]
fn a_rotation_held_back_has_no_point_until_its_quorum_is_anchored() {
    let mut t = theft(Some(Lab::new().clock(false)));
    let (rot_act, owner) = t.l.w.rotation(&t.owner, Rot { disowned: Some(vec![t.v2, t.thiefs_signature]), ..Default::default() });
    let rot = rot_act.id();
    t.l.anchor(rot, "main", 10);
    // Kept back: not yet with any home, not held by the verifier.
    t.l.anchor(t.claim, "main", 40);
    let rot = t.l.w.add(&rot_act);
    let r: Vec<Hash> = [0, 1].iter().map(|&i| t.l.receipt(i, &owner, rot)).collect();
    t.owner = owner;
    t.l.anchor(r[0], "main", 80);
    t.l.anchor(r[1], "main", 80);
    assert_eq!(t.l.paid(&t.debt), 70, "the point is 80, not the rotation's own 10");
}

/// F182 item 2: a lock change made by a homeless rotation (here an escape
/// with both keys, to three new homes, two of three required) takes its
/// point from the new homes' quorum under the new home rule: the second of
/// the new homes' anchored receipts. *Removal check: with a homeless
/// rotation's quorum left unread (no point), the lock change counts as
/// unanchored and the first assertion after the anchors fails.*
#[test]
fn a_homeless_rotations_point_is_read_from_the_new_homes_quorum() {
    let mut t = theft(Some(Lab::new().clock(false)));
    let mut new: Vec<Person> = ["new home one", "new home two", "new home three"].iter().map(|n| t.l.w.operator(n)).collect();
    let (rot, owner) = t.l.w.rotate(
        &t.owner,
        Rot { homeless: true, homes: Some(new.iter().map(home).collect()), disowned: Some(vec![t.v2, t.thiefs_signature]), ..Default::default() },
    );
    t.l.w.endorse(&mut t.owner, &rot, None);
    let r: Vec<Hash> = new.iter_mut().take(2).map(|op| t.l.w.receipt(op, &owner.id, &rot, 1)).collect();
    t.owner = owner;
    assert_eq!(t.l.w.v.resolve(&t.owner.id).position_of(&rot), Some(1), "the escape counts");
    assert_eq!(t.l.w.v.status(&t.v2), Status::Void);
    let q = t.l.w.v.quorum(&t.owner.id, &rot).unwrap();
    assert!(matches!(&q, Quorum::Homeless { need: 2, supports } if supports.len() == 3), "{q:?}");
    t.l.anchor(r[0], "main", 100);
    assert_eq!(t.l.paid(&t.debt), 70, "one new home's receipt is no quorum: no point yet");
    t.l.anchor(r[1], "main", 120);
    assert_eq!(fin::quorum_point(&q, &rot, &t.l.anchors, &t.l.main.reference()), Some(120));
    assert_eq!(t.l.paid(&t.debt), 0, "anchored at 120, the claim is not: the payer bears");
    t.l.anchor(t.claim, "main", 110);
    assert_eq!(t.l.paid(&t.debt), 70, "the claim anchored before the new homes' quorum");
}

/// F177: for a self-hosted identity, which counts on its rotation alone,
/// the rotation's own anchor is its point: a stated cost of that trust
/// model. *Removal check: with no point for a self-hosted rotation, the
/// lock change counts as unanchored and the assertion fails.*
#[test]
fn a_self_hosted_rotations_own_anchor_is_its_point() {
    let mut l = Lab::new();
    let c = l.clock(false);
    let mut owner = l.w.genesis_with("self-hosted", vec![common::own_home()], None, None, Some(vec![clock_decl(&c)]), 3);
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's node");
    let deal = l.terms(&mut debtor);
    l.sign(&mut owner, deal, vec![v1]);
    let mut thief = owner.clone();
    let v2 = l.pointer(&mut thief, oid, 2, Some(v1), "the thief's node");
    let s = l.sign(&mut thief, deal, vec![v2]);
    let d = l.debt(&mut debtor, oid, 70, v2, deal);
    l.claim(&mut debtor, oid, d, 70, "to the thief", PaidAt::Flow(v2));
    let (rot, _) = l.w.rotate(&owner, Rot { disowned: Some(vec![v2, s]), ..Default::default() });
    assert_eq!(l.w.v.quorum(&oid, &rot), Some(Quorum::Own));
    assert_eq!(l.paid(&d), 70);
    l.anchor(rot, "main", 5);
    assert_eq!(l.paid(&d), 0);
}

// ---------------------------------------------------------------- (a): the payee's own receipt

/// Rule 15 (a), F174, F178: the payee's own receipt shows a payment where
/// it is on a line the rotation kept or signed with a key bound after it;
/// a receipt the thief signed with the stolen key, on a line the rotation
/// did not keep, signs nothing for money. The story: a 900 payment to the
/// flow under a limit of 1,000; the owner lowers the limit to 500 (a lock
/// change by effect, F178 item 5), anchored. *Removal check: with the
/// receipt test dropped, the first post-anchor assertion fails.*
#[test]
fn the_payees_kept_receipt_answers_the_lock_change() {
    let mut l = Lab::new();
    let c = l.clock(false);
    let mut owner = l.owner("owner", vec![clock_decl(&c), vault_decl(1_000, "the owner's vault")], None);
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's node");
    let deal = l.terms(&mut debtor);
    l.sign(&mut owner, deal, vec![v1]);
    let kept = l.debt(&mut debtor, oid, 900, v1, deal);
    l.claim(&mut debtor, oid, kept, 900, "receipted by the owner", PaidAt::Flow(v1));
    l.receipt_for(&mut owner, debtor.id, kept, 900, "receipted by the owner");
    let stolen = l.debt(&mut debtor, oid, 900, v1, deal);
    l.claim(&mut debtor, oid, stolen, 900, "receipted by the thief", PaidAt::Flow(v1));
    let mut thief = owner.clone();
    let tr = l.receipt_for(&mut thief, debtor.id, stolen, 900, "receipted by the thief");
    let later = l.debt(&mut debtor, oid, 900, v1, deal);
    l.claim(&mut debtor, oid, later, 900, "receipted after the rotation", PaidAt::Flow(v1));
    let (rot, mut owner, r) = l.rotate(&owner, Rot { disowned: Some(vec![tr]), declarations: Some(vec![vault_decl(500, "the owner's vault")]), ..Default::default() }, &[0, 1]);
    assert_eq!(l.w.v.status(&tr), Status::Void);
    let at = PaidAt::Flow(v1);
    assert_eq!(l.view().lock_changes(&oid, &at, &amount(900), &kept), vec![rot], "lowering the limit is a lock change for it");
    assert_eq!((l.paid(&kept), l.paid(&stolen), l.paid(&later)), (900, 900, 900), "not anchored");
    l.anchor(r[0], "main", 100);
    l.anchor(r[1], "main", 100);
    assert_eq!(l.paid(&kept), 900, "the owner's receipt, on the kept line");
    assert_eq!(l.paid(&stolen), 0, "the thief's receipt is void: it signs nothing");
    assert_eq!(l.paid(&later), 0);
    l.receipt_for(&mut owner, debtor.id, later, 900, "receipted after the rotation");
    assert_eq!(l.paid(&later), 900, "signed with the key bound after the rotation");
}

// ---------------------------------------------------------------- the reach (F175, F178, F181)

/// F178 item 5, F181 item 4: a lock change is defined by its effect. A
/// rotation that changes nothing a payment followed (here, a limit raised)
/// is no lock change for it; a vault entry whose source is replaced is one
/// for a payment to that entry. *Removal check: treating every rotation as
/// a lock change, the first assertion fails.*
#[test]
fn a_lock_change_is_defined_by_its_effect() {
    let mut l = Lab::new();
    let c = l.clock(false);
    let mut owner = l.owner("owner", vec![clock_decl(&c), vault_decl(1_000, "the old vault")], None);
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's node");
    let deal = l.terms(&mut debtor);
    l.sign(&mut owner, deal, vec![v1]);
    let flow = l.debt(&mut debtor, oid, 900, v1, deal);
    l.claim(&mut debtor, oid, flow, 900, "to the flow", PaidAt::Flow(v1));
    let vault = l.debt(&mut debtor, oid, 5_000, v1, deal);
    l.claim(&mut debtor, oid, vault, 5_000, "to the vault", PaidAt::VaultEntry(oid, 0));
    let (raised, owner, r) = l.rotate(&owner, Rot { declarations: Some(vec![vault_decl(2_000, "the old vault")]), ..Default::default() }, &[0, 1]);
    for x in &r {
        l.anchor(*x, "main", 100);
    }
    assert!(l.view().lock_changes(&oid, &PaidAt::Flow(v1), &amount(900), &flow).is_empty(), "a raised limit affects nothing");
    assert_eq!((l.paid(&flow), l.paid(&vault)), (900, 5_000));
    let (replaced, _, r) = l.rotate(&owner, Rot { declarations: Some(vec![vault_decl(2_000, "a new vault")]), ..Default::default() }, &[0, 1]);
    assert_eq!(l.view().lock_changes(&oid, &PaidAt::VaultEntry(oid, 0), &amount(5_000), &vault), vec![replaced]);
    assert_eq!(l.paid(&vault), 5_000, "not anchored yet");
    for x in &r {
        l.anchor(*x, "main", 200);
    }
    assert_eq!(l.paid(&vault), 0, "paid to a replaced entry, its claim not anchored");
    assert_eq!(l.paid(&flow), 900, "the flow payment is untouched");
    let _ = raised;
}

/// F182 item 4: the entry-less vault payment form is dropped. A payment to
/// the vault names the entry it was paid to, as the payment cMIP's
/// `paid-to` does, and only that entry is read: here, entry 1 of a vault of
/// two, its sibling's source replaced. *Removal check: this test stops
/// compiling if the form returns, since the match below names every form;
/// judged against the whole vault the act declared, as the dropped form
/// was, the rotation is a lock change for it and the `lock_changes`
/// assertion fails.*
#[test]
fn a_vault_payment_names_its_entry() {
    fn entry(at: &PaidAt) -> Option<u64> {
        match at {
            PaidAt::Flow(_) => None,
            PaidAt::VaultEntry(_, i) => Some(*i),
        }
    }
    let mut l = Lab::new();
    let c = l.clock(false);
    let two = |a: &str| fin::vault_declaration(&mips().money, &[VaultEntry { unit: unit(), rail_module: rail(), source: a.as_bytes().to_vec(), limit: 1_000 }, VaultEntry { unit: unit(), rail_module: rail(), source: b"the kept vault".to_vec(), limit: 1_000 }]);
    let mut owner = l.owner("owner", vec![clock_decl(&c), two("the old vault")], None);
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's node");
    let deal = l.terms(&mut debtor);
    l.sign(&mut owner, deal, vec![v1]);
    let d = l.debt(&mut debtor, oid, 5_000, v1, deal);
    let at = PaidAt::VaultEntry(oid, 1);
    assert_eq!(entry(&at), Some(1));
    l.claim(&mut debtor, oid, d, 5_000, "to the kept entry", at);
    let (_, _, r) = l.rotate(&owner, Rot { declarations: Some(vec![two("a new vault")]), ..Default::default() }, &[0, 1]);
    for x in &r {
        l.anchor(*x, "main", 100);
    }
    assert!(l.view().lock_changes(&oid, &at, &amount(5_000), &d).is_empty(), "the entry paid to is untouched");
    assert_eq!(l.paid(&d), 5_000);
}

/// F175: where several anchored lock changes affect a payment, it counts
/// only if the claim is anchored before the first of them. A 900 payment
/// under a limit of 1,000; the limit is lowered (point 50), raised again,
/// then lowered again (point 100). A claim at 60 is in time for the
/// second, not the first. *Removal check: judging only the last lock
/// change, the assertion at 60 fails.*
#[test]
fn several_lock_changes_the_claim_must_be_anchored_before_the_first() {
    let mut l = Lab::new();
    let c = l.clock(false);
    let mut owner = l.owner("owner", vec![clock_decl(&c), vault_decl(1_000, "the vault")], None);
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's node");
    let deal = l.terms(&mut debtor);
    l.sign(&mut owner, deal, vec![v1]);
    let d = l.debt(&mut debtor, oid, 900, v1, deal);
    let claim = l.claim(&mut debtor, oid, d, 900, "900 to the flow", PaidAt::Flow(v1));
    let (_, owner, r1) = l.rotate(&owner, Rot { declarations: Some(vec![vault_decl(500, "the vault")]), ..Default::default() }, &[0, 1]);
    let (_, owner, _) = l.rotate(&owner, Rot { declarations: Some(vec![vault_decl(1_000, "the vault")]), ..Default::default() }, &[0, 1]);
    let (_, _, r3) = l.rotate(&owner, Rot { declarations: Some(vec![vault_decl(100, "the vault")]), ..Default::default() }, &[0, 1]);
    assert_eq!(l.view().lock_changes(&oid, &PaidAt::Flow(v1), &amount(900), &d).len(), 2);
    for x in &r1 {
        l.anchor(*x, "main", 50);
    }
    for x in &r3 {
        l.anchor(*x, "main", 100);
    }
    l.anchor(claim, "main", 60);
    assert_eq!(l.paid(&d), 0, "after the first lock change's point");
    l.anchor(claim, "main", 45);
    assert_eq!(l.paid(&d), 900);
}
