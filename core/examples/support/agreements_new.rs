//! The vectors of the new Agreements acts (`core/vectors/agreements-new/`;
//! `docs/agreements-from-scratch/encoding-2.md`).
//!
//! Every case states, here, the answer the checker must give and the rule it
//! tests, from encoding-2 and draft 25; the generator writes a case only
//! after the library gives that answer, so a file never holds an answer the
//! code does not give. Every input is fixed: keys, salts, nonces and content
//! keys are derived from labels, so running this again gives the same bytes.
//! Every identity is a test identity: a stand-in hash, never a real one.
//!
//! Every act is written into its signer's real sequence, as Envelopes gives
//! it: `prev` names the signer's act made before it (none for the first),
//! its position counts from 1, and its running summary is over every act
//! before it. The sequences run through both files, in the order the acts
//! are made here. Only acts that test the act format's own sequence fields
//! (no `prev`, two `prev`), and acts whose outside names no signer, are left
//! out of a sequence. Within each agreement, every act's payload `previous`
//! names its signer's act before it there, as G6.1 asks, but in the cases
//! that test otherwise.

use mor_core::act::{self, Act, Addressing, Inside, Object, Scheme, Sequence, Signature};
use mor_core::agreements_new::{
    self as an, check, check_held, Amount, Body, Call, CallFrom, CallRef, Kind, Line, Named, Party, Power, PowerKind, Receiver, Report, Role,
    RoleKind, Socket, Statement, Terms, Who,
};
use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, work_hash, Hash};
use mor_core::sig::SchnorrKey;
use serde_json::{json, Value as J};
use std::cell::RefCell;
use std::collections::HashMap;
use std::path::Path;

thread_local! {
    /// Each test identity's sequence, as far as it has been written.
    static SEQUENCES: RefCell<HashMap<Hash, Sequence>> = RefCell::new(HashMap::new());
}

fn hx(b: &[u8]) -> String {
    hex::encode(b)
}

fn fixed(label: &str) -> Hash {
    sha256(format!("agreements-new/{label}").as_bytes())
}

/// A test identity: a stand-in identity hash, a binding, and a signing key
/// derived from its label.
#[derive(Clone)]
struct Tid {
    id: Hash,
    binding: Hash,
    key: SchnorrKey,
}

fn tid(label: &str) -> Tid {
    Tid {
        id: fixed(&format!("test identity {label}")),
        binding: fixed(&format!("test identity {label}/binding")),
        key: SchnorrKey::from_secret(&fixed(&format!("test identity {label}/signing secret"))).unwrap(),
    }
}

/// How an act is written: the parts of the act format the cases vary.
struct Make<'a> {
    label: &'a str,
    who: &'a Tid,
    spec: Hash,
    type_: u64,
    payload: Vec<(Value, Value)>,
    public: bool,
    signer: bool,
    tweak: Option<&'a dyn Fn(&mut Inside)>,
}

struct Made {
    bytes: Vec<u8>,
    id: Hash,
    key: Option<[u8; 32]>,
}

fn make(m: Make) -> Made {
    let (prev, position, summary) = SEQUENCES.with(|s| {
        let s = s.borrow();
        let q = s.get(&m.who.id);
        (q.and_then(|q| q.last().copied()), q.map_or(0, Sequence::len) + 1, q.map_or([0; 32], Sequence::summary))
    });
    let mut inside = Inside {
        spec: m.spec,
        type_: m.type_,
        prev: Some(prev.into_iter().collect()),
        objects: None,
        payload: m.payload,
        position: Some(position),
        summary: Some(summary),
        acks: None,
        refs: None,
        hint: None,
        salt: fixed(&format!("{}/salt", m.label))[..16].try_into().unwrap(),
    };
    if let Some(t) = m.tweak {
        t(&mut inside);
    }
    let key = fixed(&format!("{}/content key", m.label));
    let nonce: [u8; 24] = fixed(&format!("{}/nonce", m.label))[..24].try_into().unwrap();
    let addr = Addressing { signer: m.signer.then_some(m.who.id), binding: Some(m.who.binding), public: m.public, to: None };
    let aux = fixed(&format!("{}/aux", m.label));
    let a = act::make(&inside, &key, &nonce, &addr, |id| m.who.key.sign(id, &aux));
    // Into the signer's sequence, unless the act tests the sequence's own
    // fields or names no signer on its outside.
    if m.signer {
        SEQUENCES.with(|s| {
            let mut s = s.borrow_mut();
            let q = s.entry(m.who.id).or_default();
            if q.check_next(&inside).is_ok() {
                q.append(&a.id(), &inside).unwrap();
            }
        });
    }
    Made { bytes: a.encode(), id: a.id(), key: (!m.public).then_some(key) }
}

fn terms_act(label: &str, who: &Tid, payload: Vec<(Value, Value)>) -> Made {
    make(Make { label, who, spec: an::SPEC_DRAFT_25, type_: an::types::TERMS, payload, public: true, signer: true, tweak: None })
}

fn statement_act(label: &str, who: &Tid, payload: Vec<(Value, Value)>) -> Made {
    make(Make { label, who, spec: an::SPEC_DRAFT_25, type_: an::types::STATEMENT, payload, public: true, signer: true, tweak: None })
}

fn report_act(label: &str, who: &Tid, payload: Vec<(Value, Value)>) -> Made {
    make(Make { label, who, spec: an::SPEC_REPORT_BLOCK_4, type_: an::types::REPORT, payload, public: true, signer: true, tweak: None })
}

/// Set (or with `None` remove) one key of a payload.
fn with(mut p: Vec<(Value, Value)>, k: u64, v: Option<Value>) -> Vec<(Value, Value)> {
    p.retain(|(x, _)| *x != Value::Uint(k));
    if let Some(v) = v {
        p.push((Value::Uint(k), v));
    }
    p
}

fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn arr(v: Vec<Value>) -> Value {
    Value::Array(v)
}

fn u(n: u64) -> Value {
    Value::Uint(n)
}

fn txt(s: &str) -> Value {
    Value::Text(s.into())
}

// ---------------------------------------------------------------- stand-ins

fn cmip(name: &str) -> Hash {
    fixed(&format!("cMIP: {name} (stand-in)"))
}

fn sock(name: &str) -> Socket {
    Socket::new(cmip(name), Value::Null)
}

fn words(s: &str) -> Hash {
    work_hash(s.as_bytes())
}

struct Out {
    cases: Vec<J>,
}

impl Out {
    /// One case: the acts held (in order), what the checker must answer for
    /// the last of them (or, with `all`, for each), and the rule it tests.
    fn case(&mut self, name: &str, tests: &str, acts: &[&Made], want: (&str, Option<&str>), notes: &[&str]) {
        let input: Vec<(&[u8], Option<&[u8; 32]>)> = acts.iter().map(|m| (m.bytes.as_slice(), m.key.as_ref())).collect();
        let answers = if acts.len() == 1 { vec![check(input[0].0, input[0].1)] } else { check_held(&input) };
        let got = answers.last().unwrap();
        let got_notes: Vec<&str> = got.notes.iter().map(|f| f.rule).collect();
        assert_eq!(
            (got.verdict.word(), got.rule.as_deref(), got_notes.as_slice()),
            (want.0, want.1, notes),
            "case {name}: {}",
            got.says
        );
        self.cases.push(json!({
            "name": name,
            "tests": tests,
            "acts": acts.iter().map(|m| json!({
                "id": hx(&m.id),
                "bytes": hx(&m.bytes),
                "key": m.key.map(|k| hx(&k)),
            })).collect::<Vec<_>>(),
            "answer": { "verdict": want.0, "rule": want.1, "notes": notes, "says": got.says },
        }));
    }
}

fn raw(bytes: Vec<u8>) -> Made {
    Made { id: [0; 32], bytes, key: None }
}

/// Each signer's line within each agreement (G6.1): the act it made there
/// last, which its next act there names in `previous`.
#[derive(Default)]
struct Lines(HashMap<(Hash, Hash), Hash>);

impl Lines {
    fn last(&self, signer: &Tid, agreement: Hash) -> Option<Hash> {
        self.0.get(&(signer.id, agreement)).copied()
    }

    fn made(&mut self, signer: &Tid, agreement: Hash, m: &Made) {
        self.0.insert((signer.id, agreement), m.id);
    }
}

// ---------------------------------------------------------------- the cases

pub fn write(dir: &Path) {
    let dir = dir.join("agreements-new");
    std::fs::create_dir_all(&dir).unwrap();
    let a = tid("A");
    let bb = tid("B");
    let cc = tid("C");
    let mut valid = Out { cases: vec![] };
    let mut invalid = Out { cases: vec![] };
    let mut lines = Lines::default();

    // ================================================================ the agreement most acts are made in
    // A writes and signs the first Terms act; A and B are its parties. The
    // acts within it follow one another in each signer's line (G6.1): A's
    // assent names A's Terms act; B's first act there names none.
    let base = Terms {
        parties: Some(vec![Party::Signer(a.id)]),
        authors: Some(vec![0]),
        body: Some(Body::new(words("The words of these Terms (test)."), sock("body reader"))),
        ..Default::default()
    };
    let root_terms = Terms { parties: Some(vec![Party::Signer(a.id), Party::Signer(bb.id)]), ..base.clone() };
    let root = terms_act("terms/root", &a, root_terms.to_payload().unwrap());
    let agr = root.id;
    lines.made(&a, agr, &root);
    let st = |label: &str, who: &Tid, s: Statement| statement_act(label, who, s.to_payload().unwrap());
    // A Statement within `agr` by `who`, naming its signer's act before it there.
    let next = |lines: &mut Lines, label: &str, who: &Tid, mut s: Statement| {
        s.previous = lines.last(who, s.agreement);
        let m = st(label, who, s.clone());
        lines.made(who, s.agreement, &m);
        m
    };

    let s_assent = next(&mut lines, "statement/assent", &a, Statement::new(agr, root.id, Kind::Assent, None));
    let b_assent = next(&mut lines, "statement/B's assent", &bb, Statement::new(agr, root.id, Kind::Assent, None));
    let s_counter = next(&mut lines, "statement/counter", &a, Statement::new(agr, root.id, Kind::CounterSignature, None));
    let s_again = next(&mut lines, "statement/assent again", &a, Statement::new(agr, root.id, Kind::Assent, None));
    let settlement = fixed("a settlement (Money)");
    let mut c = Statement::new(agr, root.id, Kind::Contest, None);
    c.content = Some(txt("What I bought was not delivered after payment."));
    c.settlement = Some(settlement);
    let s_contest = next(&mut lines, "statement/contest", &bb, c);
    let s_contest_bare = next(&mut lines, "statement/contest bare", &cc, Statement::new(agr, root.id, Kind::Contest, None));
    let mut k7 = Statement::new(agr, root.id, Kind::Defined { cmip: cmip("kind: a vote"), params: Value::Null }, None);
    k7.content = Some(arr(vec![txt("yes")]));
    let s_k7 = next(&mut lines, "statement/k7", &a, k7);
    let mut f = Statement::new(agr, root.id, Kind::Assent, None);
    f.for_ = Some(Who::Signer(bb.id));
    f.under = Some(fixed("a delegation's Terms"));
    let s_for_signer = next(&mut lines, "statement/for signer", &a, f);
    let other_agreement = fixed("another agreement's root");
    let mut f = Statement::new(agr, root.id, Kind::Assent, None);
    f.for_ = Some(Who::Agreement(other_agreement));
    f.under = Some(fixed("that agreement's own Terms in force"));
    let s_for_agreement = next(&mut lines, "statement/for agreement", &a, f);
    let mut r = Statement::new(agr, root.id, Kind::Contest, None);
    r.answers = Some(vec![s_contest.id, s_contest_bare.id]);
    r.relies_on = Some(vec![Named::Fp(fixed("a version of another agreement"))]);
    r.settlement = Some(settlement);
    let s_answers = next(&mut lines, "statement/answers", &a, r);
    let mut r = Statement::new(agr, root.id, Kind::Assent, None);
    r.relies_on = Some(vec![Named::Not(u(7))]);
    let s_unread = next(&mut lines, "statement/relies_on unread", &a, r);
    // A private act of A's line, which the case below holds without its key.
    let hidden = make(Make {
        label: "held/private",
        who: &a,
        spec: an::SPEC_DRAFT_25,
        type_: an::types::STATEMENT,
        payload: Statement::new(agr, root.id, Kind::Assent, lines.last(&a, agr)).to_payload().unwrap(),
        public: false,
        signer: true,
        tweak: None,
    });
    lines.made(&a, agr, &hidden);
    let hidden = Made { key: None, ..hidden };
    let after_private = next(&mut lines, "held/after private", &a, Statement::new(agr, root.id, Kind::Contest, None));
    // A version, then a second by B replacing the same Terms (a fork of
    // Terms), and A's resolving update of it.
    let version = Terms { replaces: Some(root.id), agreement: Some(agr), previous: lines.last(&a, agr), ..root_terms.clone() };
    let v2 = terms_act("terms/version 2", &a, version.to_payload().unwrap());
    lines.made(&a, agr, &v2);
    let version_b = Terms {
        replaces: Some(root.id),
        agreement: Some(agr),
        body: Some(Body::new(words("B's words for the same agreement (test)."), sock("body reader"))),
        previous: lines.last(&bb, agr),
        ..root_terms.clone()
    };
    let v2b = terms_act("terms/version 2 by B", &bb, version_b.to_payload().unwrap());
    lines.made(&bb, agr, &v2b);
    let resolving = Terms {
        replaces: Some(root.id),
        agreement: Some(agr),
        resolves: Some(vec![v2.id, v2b.id]),
        continues: Some(v2.id),
        previous: lines.last(&a, agr),
        ..Default::default()
    };
    let t_resolving = terms_act("terms/resolving", &a, resolving.to_payload().unwrap());
    lines.made(&a, agr, &t_resolving);
    // An act naming, as the one before it, an act not held.
    let gap = st("held/gap", &a, Statement::new(agr, root.id, Kind::Contest, Some(fixed("an act not held"))));

    // ================================================================ a fork in one signer's line, and the resolve
    // B's Terms give a power of kind resolves. A, acting in two windows,
    // makes two acts that both name A's assent: a fork in A's own line. A's
    // resolve names both tips and continues one; C, under B's power, makes
    // one for A; A's next act names A's resolve.
    let fork_terms = Terms {
        parties: Some(vec![Party::Signer(bb.id), Party::Signer(a.id)]),
        authors: Some(vec![0]),
        body: Some(Body::new(words("Terms with a power to resolve (test)."), sock("body reader"))),
        powers: Some(vec![Power { kind: PowerKind::Resolves, rule: sock("power: resolves, a named judge") }]),
        ..Default::default()
    };
    let root_b = terms_act("fork/terms", &bb, fork_terms.to_payload().unwrap());
    let agr_b = root_b.id;
    lines.made(&bb, agr_b, &root_b);
    let f_assent = next(&mut lines, "fork/A's assent", &a, Statement::new(agr_b, root_b.id, Kind::Assent, None));
    let tip_1 = st("fork/tip 1", &a, Statement::new(agr_b, root_b.id, Kind::Contest, Some(f_assent.id)));
    let mut t2 = Statement::new(agr_b, root_b.id, Kind::Defined { cmip: cmip("kind: a vote"), params: Value::Null }, Some(f_assent.id));
    t2.content = Some(arr(vec![txt("no")]));
    let tip_2 = st("fork/tip 2", &a, t2);
    let mut rs = Statement::new(agr_b, root_b.id, Kind::Resolve, Some(f_assent.id));
    rs.resolves = Some(vec![tip_1.id, tip_2.id]);
    rs.continues = Some(tip_1.id);
    let resolve = st("fork/resolve", &a, rs.clone());
    lines.made(&a, agr_b, &resolve);
    let mut rc = rs.clone();
    rc.previous = lines.last(&cc, agr_b);
    rc.for_ = Some(Who::Signer(a.id));
    rc.under = Some(root_b.id);
    let resolve_c = st("fork/resolve under a power", &cc, rc);
    lines.made(&cc, agr_b, &resolve_c);
    let after_resolve = next(&mut lines, "fork/after the resolve", &a, Statement::new(agr_b, root_b.id, Kind::Contest, None));

    // ================================================================ valid: Terms
    valid.case("terms: the first Terms act, its required fields only", "section 3.1; E19", &[&root], ("pass", None), &[]);

    let bake = fixed("a bake (the envelope)");
    let full = Terms {
        parties: Some(vec![
            Party::Signer(a.id),
            Party::Signer(bb.id),
            Party::Role(Role::new(RoleKind::Done, Some(fixed("what: X, a deed")), sock("spot: done"))),
            Party::Agreement(other_agreement),
        ]),
        authors: Some(vec![0, 1, 2]),
        relies_on: Some(vec![Named::Fp(fixed("a piece relied on")), Named::Fp(fixed("a version relied on"))]),
        in_force: Some(sock("in force: every signer")),
        powers: Some(vec![
            Power { kind: PowerKind::Assent, rule: sock("power: assent") },
            Power { kind: PowerKind::CounterSignature, rule: sock("power: counter signature") },
            Power { kind: PowerKind::Contest, rule: sock("power: contest") },
            Power { kind: PowerKind::Resolves, rule: sock("power: resolves") },
            Power { kind: PowerKind::Defined(cmip("kind: a vote")), rule: sock("power: a vote") },
        ]),
        place: Some(fixed("a place's identifier")),
        clock: Some(fixed("a clock's identifier")),
        receiver: Some(Receiver::Party(0)),
        envelope: Some(bake),
        envelope_at: Some(bake),
        condition: Some(Socket::new(cmip("condition: two of three"), arr(vec![u(2), u(3)]))),
        control: Some(sock("control: a split service")),
        calls: Some(vec![Call { task: 6, from: CallFrom::Both }]),
        data: Some(sock("data: a list of readers")),
        ..base.clone()
    };
    let full_act = terms_act("terms/full", &a, full.to_payload().unwrap());
    valid.case("terms: every optional field of section 3.1 at once (the receiver a party, by position; the bake cited in both envelope fields)", "section 3.1; E5 to E18", &[&full_act], ("pass", None), &[]);

    for (k, name) in [(RoleKind::Received, "received"), (RoleKind::Holding, "holding"), (RoleKind::Fits, "fits")] {
        let t = Terms {
            parties: Some(vec![Party::Signer(a.id), Party::Role(Role::new(k, Some(fixed(&format!("what for {name}"))), sock(&format!("spot: {name}"))))]),
            in_force: Some(sock("in force: the signer and a filling")),
            ..base.clone()
        };
        let m = terms_act(&format!("terms/role {name}"), &a, t.to_payload().unwrap());
        valid.case(&format!("terms: a role of kind {name}"), "G10.1; E10", &[&m], ("pass", None), &[]);
    }
    let fut = Terms {
        parties: Some(vec![Party::Signer(a.id), Party::Role(Role::new(RoleKind::Future, None, sock("spot: future")))]),
        in_force: Some(sock("in force: the signer and a filling")),
        ..base.clone()
    };
    let m = terms_act("terms/role future", &a, fut.to_payload().unwrap());
    valid.case("terms: a role of kind future, with no what", "G10.1, G10.4; E10", &[&m], ("pass", None), &[]);
    let mut fut_what = fut.clone();
    if let Some(Party::Role(r)) = fut_what.parties.as_mut().unwrap().get_mut(1) {
        r.what = Some(b(&fixed("a what on a future role")));
    }
    let m = terms_act("terms/role future with what", &a, fut_what.to_payload().unwrap());
    valid.case("terms: a role of kind future with a what, which is not read", "G10.4; E10", &[&m], ("pass", None), &["G10.4"]);

    let roles_only = Terms {
        parties: Some(vec![Party::Role(Role::new(RoleKind::Fits, Some(fixed("what: a member")), sock("spot: fits")))]),
        authors: Some(vec![0]),
        in_force: Some(sock("in force: once filled")),
        ..base.clone()
    };
    let m = terms_act("terms/roles only", &a, roles_only.to_payload().unwrap());
    valid.case("terms: no party named as a signer, an author named by role", "G3.1, G4.1, G4.2; E13", &[&m], ("pass", None), &[]);

    let t = Terms { receiver: Some(Receiver::Agreement(other_agreement)), ..base.clone() };
    let m = terms_act("terms/receiver agreement", &a, t.to_payload().unwrap());
    valid.case("terms: the receiver is another agreement, by its root", "G1.3; E12", &[&m], ("pass", None), &[]);
    let t = Terms {
        parties: Some(vec![Party::Signer(a.id), Party::Agreement(other_agreement)]),
        receiver: Some(Receiver::Agreement(other_agreement)),
        ..base.clone()
    };
    let m = terms_act("terms/receiver agreement party", &a, t.to_payload().unwrap());
    valid.case("terms: the receiver is an agreement that is also a party, named by its root", "G1.3; E12", &[&m], ("pass", None), &[]);
    let t = Terms { receiver: Some(Receiver::Party(5)), ..base.clone() };
    let m = terms_act("terms/receiver out of range", &a, t.to_payload().unwrap());
    valid.case("terms: the receiver's position is beyond the parties (G1.4 answers not shown, a note)", "G1.4; E12", &[&m], ("pass", None), &["G1.4"]);

    valid.case("terms: a version, naming replaces, agreement and its signer's act before it", "section 3.1; E17, E19", &[&v2], ("pass", None), &[]);
    valid.case("terms: a second version of the same Terms, by another signer (with the first, a fork of Terms)", "section 3.1; G4.7", &[&v2b], ("pass", None), &[]);

    let t = Terms { envelope: Some(bake), envelope_at: Some(fixed("a transfer in the envelope's chain")), ..base.clone() };
    let m = terms_act("terms/envelope at transfer", &a, t.to_payload().unwrap());
    valid.case("terms: an envelope, citing a transfer of its chain", "G14.1; E19", &[&m], ("pass", None), &[]);

    let t = Terms { calls: Some(vec![Call { task: 6, from: CallFrom::Doer }, Call { task: 8, from: CallFrom::ReceivingSide }]), ..base.clone() };
    let m = terms_act("terms/calls", &a, t.to_payload().unwrap());
    valid.case("terms: two calls, from the doer and from the receiving side", "G11.2; E16", &[&m], ("pass", None), &[]);

    valid.case("terms: a resolving update: replaces, agreement, resolves, continues, previous, and nothing else", "G12.3; E19", &[&t_resolving], ("pass", None), &[]);
    let resolving_relied = Terms {
        replaces: Some(fixed("a shared version (stand-in)")),
        agreement: Some(fixed("its agreement's root (stand-in)")),
        relies_on: Some(vec![Named::Fp(fixed("a judge's decision relied on"))]),
        resolves: Some(vec![fixed("tip one (stand-in)"), fixed("tip two (stand-in)")]),
        continues: Some(fixed("tip two (stand-in)")),
        ..Default::default()
    };
    let m = terms_act("terms/resolving relied", &cc, resolving_relied.to_payload().unwrap());
    valid.case("terms: a resolving update naming what it relied on", "G12.3, G13.2; E19", &[&m], ("pass", None), &[]);
    let t = Terms { resolves: Some(vec![v2.id, v2b.id]), ..base.clone() };
    let m = terms_act("terms/resolves alone", &a, t.to_payload().unwrap());
    valid.case("terms: resolves and no continues: read as an act like any other", "G12.3; E19", &[&m], ("pass", None), &["G12.3"]);

    let t = Terms { relies_on: Some(vec![Named::Fp(fixed("a piece")), Named::Not(txt("https://example.org/side-piece"))]), ..base.clone() };
    let m = terms_act("terms/relies_on unread", &a, t.to_payload().unwrap());
    valid.case("terms: an entry of relies_on that is not a fingerprint is left unread", "G2.2; E18", &[&m], ("pass", None), &["G2.2"]);
    let t = Terms { powers: Some(vec![Power { kind: PowerKind::Replaces, rule: sock("power: replaces") }]), ..base.clone() };
    let m = terms_act("terms/power replaces", &a, t.to_payload().unwrap());
    valid.case("terms: a power of kind replaces gives no power, and is left unread", "G5.2; E14", &[&m], ("pass", None), &["G5.2"]);
    let t = Terms {
        powers: Some(vec![Power { kind: PowerKind::Assent, rule: sock("power: assent, by A") }, Power { kind: PowerKind::Assent, rule: sock("power: assent, by a vote") }]),
        ..base.clone()
    };
    let m = terms_act("terms/two powers", &a, t.to_payload().unwrap());
    valid.case("terms: two powers of one kind, each with its rule (either saying yes is enough)", "G5.1(b); E14, E18", &[&m], ("pass", None), &[]);

    let m = make(Make {
        label: "terms/private",
        who: &a,
        spec: an::SPEC_DRAFT_25,
        type_: an::types::TERMS,
        payload: base.to_payload().unwrap(),
        public: false,
        signer: true,
        tweak: None,
    });
    valid.case("terms: a private act, opened with its content key", "E1", &[&m], ("pass", None), &[]);

    // ================================================================ valid: Statements
    valid.case("statement: an author's assent, naming the Terms act its signer made in previous", "section 3.2, G6.1; E20", &[&s_assent], ("pass", None), &[]);
    valid.case("statement: an assent by a party with no act in the agreement yet (previous [])", "G6.1; E17, E20", &[&b_assent], ("pass", None), &[]);
    valid.case("statement: a counter signature, following the assent in the signer's line", "G4.10; E17, E20", &[&s_counter], ("pass", None), &[]);
    valid.case("statement: a buyer's contest, with content, naming the settlement", "G11.8; E20", &[&s_contest], ("pass", None), &[]);
    valid.case("statement: a contest with no content", "G11.8; E20", &[&s_contest_bare], ("pass", None), &[]);
    valid.case("statement: a kind defined by a cMIP (K7), with content", "K7; E15", &[&s_k7], ("pass", None), &[]);
    valid.case("statement: made for a signer, under a delegation", "G5.1(b); E11, E20", &[&s_for_signer], ("pass", None), &[]);
    valid.case("statement: an agreement's signature, for its root, under its own Terms", "G1.2; E11, E20", &[&s_for_agreement], ("pass", None), &[]);
    valid.case("statement: answers, relies_on and settlement", "G13.1, G13.2, G8.5; E18", &[&s_answers], ("pass", None), &[]);
    valid.case("statement: an entry of relies_on that is not a fingerprint is left unread", "section 3, G2.2", &[&s_unread], ("pass", None), &["G2.2"]);
    valid.case("statement: a resolve, in one signer's line: its own kind, naming every tip and the one that continues", "section 3.2, G12.3; E15, E20", &[&resolve], ("pass", None), &[]);
    valid.case("statement: a resolve made for the signer whose line forked, under a power of kind resolves", "G12.4; E11, E20", &[&resolve_c], ("pass", None), &[]);

    // ================================================================ valid: reports (a proposal)
    let unit = fixed("a unit (Money, stand-in)");
    let amount = Amount { unit, value: 1000 };
    let conf = Report { call: CallRef { act: settlement, task: None }, relies_on: Some(vec![root.id]), lines: Some(vec![Line::Received { amount, by: settlement }]) };
    let m = report_act("report/confirmation", &bb, conf.to_payload().unwrap());
    valid.case("report: the receiving side's confirmation of a payment, naming its settlement as the call made by default", "G11.7; E21, E22 (proposal)", &[&m], ("pass", None), &[]);
    let leg = Report {
        call: CallRef { act: full_act.id, task: Some(6) },
        relies_on: Some(vec![full_act.id]),
        lines: Some(vec![
            Line::Received { amount: Amount { unit, value: 1000 }, by: settlement },
            Line::PassedOn { amount: Amount { unit, value: 600 }, to: Who::Signer(bb.id), by: fixed("a settlement onward"), closes: None },
            Line::PassedOn {
                amount: Amount { unit, value: 100 },
                to: Who::Agreement(other_agreement),
                by: fixed("a settlement onward, 2"),
                closes: Some((fixed("an earlier report"), 3)),
            },
            Line::OwnPart { amount: Amount { unit, value: 200 } },
            Line::Kept { amount: Amount { unit, value: 50 } },
            Line::StillOwed { amount: Amount { unit, value: 50 }, to: Who::Signer(cc.id) },
        ]),
    };
    let leg_act = report_act("report/leg", &a, leg.to_payload().unwrap());
    valid.case("report: a doer's leg report, every kind of line", "K6's row; E21, E22 (proposal)", &[&leg_act], ("pass", None), &[]);
    let bare = Report { call: CallRef { act: full_act.id, task: Some(6) }, relies_on: None, lines: None };
    let m = report_act("report/bare", &a, bare.to_payload().unwrap());
    valid.case("report: the call it answers, and nothing more", "the block's R2; E21 (proposal)", &[&m], ("pass", None), &[]);

    // ================================================================ valid: acts held together (G6.1)
    valid.case("held: the author's Terms act, then the author's assent naming it", "G6.1, section 3.2", &[&root, &s_assent], ("pass", None), &[]);
    valid.case("held: one signer's line in one agreement, act after act", "G6.1", &[&root, &s_assent, &s_counter, &s_again], ("pass", None), &[]);
    valid.case("held: previous names an act not held: the act counts, its line unchecked before it", "G6.1", &[&root, &gap], ("pass", None), &["G6.1"]);
    valid.case("held: previous names a private act held without its key: unchecked, not invalid", "G6.1, G9", &[&root, &hidden, &after_private], ("pass", None), &["G6.1"]);
    valid.case("held: a fork in one signer's line (two acts naming the same act), and the resolve", "G6.2, G12.3", &[&root_b, &f_assent, &tip_1, &tip_2, &resolve], ("pass", None), &[]);
    valid.case("held: after the resolve, the signer's next act names it", "G12.3", &[&root_b, &f_assent, &tip_1, &tip_2, &resolve, &after_resolve], ("pass", None), &[]);
    valid.case("held: a fork of Terms, and the resolving update", "G4.7, G12.3", &[&root, &v2, &v2b, &t_resolving], ("pass", None), &[]);

    // ================================================================ invalid
    let p = base.to_payload().unwrap();
    let t = |label: &str, payload: Vec<(Value, Value)>| terms_act(label, &a, payload);
    let rj = |out: &mut Out, name: &str, tests: &str, m: &Made, rule: &str| out.case(name, tests, &[m], ("rejected", Some(rule)), &[]);

    // The act format.
    rj(&mut invalid, "act: not deterministic CBOR", "Envelopes rule 1", &raw(vec![0xff]), "Envelopes rule 1");
    rj(&mut invalid, "act: an array of two items, not [outside, locked, signature]", "Envelopes rule 1", &raw(cbor::encode(&arr(vec![u(1), u(2)]))), "Envelopes rule 1");
    let mut tampered = Act::decode(&root.bytes).unwrap();
    tampered.locked[0] ^= 1;
    rj(&mut invalid, "act: locked bytes changed after signing", "Envelopes rule 3", &raw(tampered.encode()), "Envelopes rule 3");
    let mut commit = Act::decode(&root.bytes).unwrap();
    commit.outside.inside_commitment = fixed("another inside");
    commit.signature = a.key.sign(&commit.id(), &fixed("aux"));
    rj(&mut invalid, "act: the inside does not match the inside commitment", "Envelopes rule 3", &raw(commit.encode()), "Envelopes rule 3");
    let m = t("act/text", with(p.clone(), 6, Some(arr(vec![b(&cmip("in force")), txt("trailing space ")]))));
    rj(&mut invalid, "act: a text string that is not canonical text (a socket's parameters)", "Envelopes rule 5", &m, "Envelopes rule 5");
    let m = make(Make { label: "act/other spec", who: &a, spec: fixed("another specification"), type_: 0, payload: p.clone(), public: true, signer: true, tweak: None });
    invalid.case("act: another specification", "E2", &[&m], ("not this encoding", Some("E2")), &[]);
    let private = make(Make { label: "act/private", who: &a, spec: an::SPEC_DRAFT_25, type_: 0, payload: p.clone(), public: false, signer: true, tweak: None });
    let unopened = Made { key: None, ..private };
    invalid.case("act: a private act, and no key to open it", "Envelopes rule 10", &[&unopened], ("cannot open", Some("Envelopes rule 10")), &[]);
    let m = make(Make { label: "act/type 2", who: &a, spec: an::SPEC_DRAFT_25, type_: 2, payload: p.clone(), public: true, signer: true, tweak: None });
    rj(&mut invalid, "act: type 2 under draft 25's spec hash", "E2", &m, "E2");
    let m = make(Make { label: "act/report type 1", who: &a, spec: an::SPEC_REPORT_BLOCK_4, type_: 1, payload: p.clone(), public: true, signer: true, tweak: None });
    rj(&mut invalid, "act: type 1 under the report block's spec hash", "E2", &m, "E2");
    let m = make(Make { label: "act/no signer", who: &a, spec: an::SPEC_DRAFT_25, type_: 0, payload: p.clone(), public: true, signer: false, tweak: None });
    rj(&mut invalid, "act: an outside that names no signer (in no sequence)", "E1", &m, "E1");
    let no_prev = |i: &mut Inside| i.prev = None;
    let m = make(Make { label: "act/no prev", who: &a, spec: an::SPEC_DRAFT_25, type_: 0, payload: p.clone(), public: true, signer: true, tweak: Some(&no_prev) });
    rj(&mut invalid, "act: no prev (in no sequence)", "Envelopes rule 13", &m, "Envelopes rule 13");
    let two_prev = |i: &mut Inside| i.prev = Some(vec![fixed("one"), fixed("two")]);
    let m = make(Make { label: "act/two prev", who: &a, spec: an::SPEC_DRAFT_25, type_: 0, payload: p.clone(), public: true, signer: true, tweak: Some(&two_prev) });
    rj(&mut invalid, "act: prev with two entries (in no sequence)", "Envelopes rule 13", &m, "Envelopes rule 13");
    let objects = |i: &mut Inside| i.objects = Some(vec![Object { chain: fixed("chain"), predecessor: fixed("before") }]);
    let m = make(Make { label: "act/objects", who: &a, spec: an::SPEC_DRAFT_25, type_: 0, payload: p.clone(), public: true, signer: true, tweak: Some(&objects) });
    rj(&mut invalid, "act: carries objects", "E3", &m, "E3");
    let acks = |i: &mut Inside| i.acks = Some(vec![fixed("an act acknowledged")]);
    let m = make(Make { label: "act/acks", who: &a, spec: an::SPEC_DRAFT_25, type_: 0, payload: p.clone(), public: true, signer: true, tweak: Some(&acks) });
    rj(&mut invalid, "act: carries acks", "E3", &m, "E3");
    let mut badsig = Act::decode(&root.bytes).unwrap();
    badsig.signature.sig[0] ^= 1;
    rj(&mut invalid, "act: a signature that does not verify", "E1", &raw(badsig.encode()), "E1");
    let mut unknown = Act::decode(&root.bytes).unwrap();
    unknown.signature = Signature { scheme: Scheme::Spec(fixed("a signature-scheme specification")), key: vec![1; 32], sig: vec![2; 64] };
    invalid.case("act: a signature scheme this library does not implement", "E1", &[&raw(unknown.encode())], ("unknown", Some("E1")), &[]);

    // Terms: rejected.
    let ps = |k: u64, v: Option<Value>| with(p.clone(), k, v);
    let tip1 = fixed("tip one");
    let tip2 = fixed("tip two");
    let rp_terms = resolving.to_payload().unwrap();
    let rs_terms = |k: u64, v: Option<Value>| with(rp_terms.clone(), k, v);
    let cases: Vec<(&str, &str, Vec<(Value, Value)>, &str)> = vec![
        ("terms: a key the encoding does not give (20)", "E4", ps(20, Some(u(0))), "E4"),
        ("terms: a text key", "E4", { let mut x = p.clone(); x.push((txt("x"), u(0))); x }, "E4"),
        ("terms: no previous", "E19", ps(19, None), "E19"),
        ("terms: previous with two entries", "E17", ps(19, Some(arr(vec![b(&tip1), b(&tip2)]))), "E17"),
        ("terms: previous not a list", "E17", ps(19, Some(b(&tip1))), "E17"),
        ("terms: replaces without agreement", "E19", ps(0, Some(b(&root.id))), "E19"),
        ("terms: agreement without replaces", "E19", ps(1, Some(b(&root.id))), "E19"),
        ("terms: no parties, and no resolving update", "E19", ps(2, None), "E19"),
        ("terms: no authors", "E19", ps(3, None), "E19"),
        ("terms: no body", "E19", ps(4, None), "E19"),
        ("terms: envelope without envelope_at", "E19", ps(11, Some(b(&bake))), "E19"),
        ("terms: envelope_at without envelope", "E19", ps(12, Some(b(&bake))), "E19"),
        ("terms: continues without resolves", "E19", ps(18, Some(b(&tip1))), "E19"),
        ("terms: continues names no entry of resolves", "E19", with(ps(17, Some(arr(vec![b(&tip1)]))), 18, Some(b(&tip2))), "E19"),
        ("terms: a resolving update that also carries parties", "E19", rs_terms(2, Some(arr(vec![arr(vec![u(0), b(&a.id)])]))), "E19"),
        ("terms: a resolving update that also carries a body", "E19", rs_terms(4, Some(arr(vec![b(&words("w")), sock("body").to_value()]))), "E19"),
        ("terms: a resolving update that also carries in_force", "E19", rs_terms(6, Some(sock("in force").to_value())), "E19"),
        ("terms: a resolving update that names no replaces", "E19", rs_terms(1, None).into_iter().filter(|(k, _)| *k != u(0)).collect(), "E19"),
        ("terms: replaces not a fingerprint", "E5", with(ps(0, Some(Value::Bytes(vec![1; 31]))), 1, Some(b(&root.id))), "E5"),
        ("terms: an entry of resolves not a fingerprint", "E5", ps(17, Some(arr(vec![u(1)]))), "E5"),
        ("terms: a place that is not an identifier", "E6", ps(8, Some(txt("a server address"))), "E6"),
        ("terms: in_force not a socket", "E7", ps(6, Some(b(&cmip("in force")))), "E7"),
        ("terms: a socket of three items", "E7", ps(13, Some(arr(vec![b(&cmip("c")), Value::Null, Value::Null]))), "E7"),
        ("terms: a body that is not [words, socket]", "E8", ps(4, Some(b(&words("w")))), "E8"),
        ("terms: a party of an unknown way (3)", "E9", ps(2, Some(arr(vec![arr(vec![u(3), b(&a.id)])]))), "E9"),
        ("terms: a party named as a signer, not by a fingerprint (one fault: E9, the party's form)", "E9", ps(2, Some(arr(vec![arr(vec![u(0), txt("A")])]))), "E9"),
        ("terms: a role that is not a map", "E10", ps(2, Some(arr(vec![arr(vec![u(0), b(&a.id)]), arr(vec![u(1), u(0)])]))), "E10"),
        ("terms: a role with a key it does not give (3)", "E4", ps(2, Some(arr(vec![arr(vec![u(1), Value::Map(vec![(u(3), u(0))])])]))), "E4"),
        ("terms: a role's spot that is not a socket", "E7", ps(2, Some(arr(vec![arr(vec![u(1), Value::Map(vec![(u(0), u(0)), (u(1), b(&words("x"))), (u(2), u(5))])])]))), "E7"),
        ("terms: a receiver that is text", "E12", ps(10, Some(txt("party 0"))), "E12"),
        ("terms: a receiver written as a bare position (encoding 1's form)", "E12", ps(10, Some(u(0))), "E12"),
        ("terms: a receiver written as a bare root (encoding 1's form)", "E12", ps(10, Some(b(&other_agreement))), "E12"),
        ("terms: a receiver [0, a signer's identity hash], not a position", "E12", ps(10, Some(arr(vec![u(0), b(&a.id)]))), "E12"),
        ("terms: a receiver [1, ...], of an unknown way", "E12", ps(10, Some(arr(vec![u(1), u(0)]))), "E12"),
        (
            "terms: a receiver whose position names a party named as an agreement (name it by its root)",
            "E12",
            with(ps(2, Some(arr(vec![arr(vec![u(0), b(&a.id)]), arr(vec![u(2), b(&other_agreement)])]))), 10, Some(arr(vec![u(0), u(1)]))),
            "E12",
        ),
        ("terms: an author that is not an index", "E13", ps(3, Some(arr(vec![b(&a.id)]))), "E13"),
        ("terms: authors out of order", "E18", with(ps(2, Some(arr(vec![arr(vec![u(0), b(&a.id)]), arr(vec![u(0), b(&bb.id)])]))), 3, Some(arr(vec![u(1), u(0)]))), "E18"),
        ("terms: an author named twice", "E18", ps(3, Some(arr(vec![u(0), u(0)]))), "E18"),
        ("terms: a power of an unknown kind (5)", "E14", ps(7, Some(arr(vec![arr(vec![u(5), sock("p").to_value()])]))), "E14"),
        ("terms: a power whose kind is text, not a fingerprint", "E14", ps(7, Some(arr(vec![arr(vec![txt("a vote"), sock("p").to_value()])]))), "E14"),
        ("terms: a power that is not [kind, rule]", "E14", ps(7, Some(arr(vec![arr(vec![u(0)])]))), "E14"),
        ("terms: powers out of order", "E18", ps(7, Some(arr(vec![arr(vec![u(1), sock("p").to_value()]), arr(vec![u(0), sock("p").to_value()])]))), "E18"),
        ("terms: a call for task 0", "E16", ps(15, Some(arr(vec![arr(vec![u(0), u(0)])]))), "E16"),
        ("terms: a call from an unknown side (3)", "E16", ps(15, Some(arr(vec![arr(vec![u(6), u(3)])]))), "E16"),
        ("terms: two calls for the same task", "E16", ps(15, Some(arr(vec![arr(vec![u(6), u(0)]), arr(vec![u(6), u(1)])]))), "E16"),
        ("terms: an empty list of parties", "E18", ps(2, Some(arr(vec![]))), "E18"),
        ("terms: the same party twice", "E18", ps(2, Some(arr(vec![arr(vec![u(0), b(&a.id)]), arr(vec![u(0), b(&a.id)])]))), "E18"),
        ("terms: relies_on out of order", "E18", ps(5, Some(arr(vec![b(&[2; 32]), b(&[1; 32])]))), "E18"),
        ("terms: an empty relies_on", "E18", ps(5, Some(arr(vec![]))), "E18"),
    ];
    for (i, (name, tests, payload, rule)) in cases.into_iter().enumerate() {
        let m = t(&format!("terms/rejected/{i}"), payload);
        rj(&mut invalid, name, tests, &m, rule);
    }

    // Terms: invalid (the grammar rules, from the bytes alone).
    let iv = |out: &mut Out, name: &str, tests: &str, m: &Made, rule: &str| out.case(name, tests, &[m], ("invalid", Some(rule)), &[]);
    let role = |k: Option<Value>, w: Option<Value>, s: Option<Value>| {
        let mut m = vec![];
        if let Some(k) = k {
            m.push((u(0), k));
        }
        if let Some(w) = w {
            m.push((u(1), w));
        }
        if let Some(s) = s {
            m.push((u(2), s));
        }
        arr(vec![u(1), Value::Map(m)])
    };
    let with_role = |r: Value| with(with(p.clone(), 2, Some(arr(vec![arr(vec![u(0), b(&a.id)]), r]))), 6, Some(sock("in force").to_value()));
    let spot = sock("spot").to_value();
    let what = b(&fixed("what"));
    let cases: Vec<(&str, &str, Vec<(Value, Value)>, &str)> = vec![
        ("terms: the body's words named by an address, not a fingerprint", "G2.1", ps(4, Some(arr(vec![txt("https://example.org/terms"), sock("body").to_value()]))), "G2.1"),
        ("terms: the body's cMIP not named by fingerprint (one fault: G2.1, not G2.2)", "G2.1", ps(4, Some(arr(vec![b(&words("w")), arr(vec![txt("a reader"), Value::Null])]))), "G2.1"),
        ("terms: in_force's cMIP not named by fingerprint", "G2.1", ps(6, Some(arr(vec![Value::Bytes(vec![1; 20]), Value::Null]))), "G2.1"),
        ("terms: a power's rule not named by fingerprint", "G2.1", ps(7, Some(arr(vec![arr(vec![u(0), arr(vec![u(9), Value::Null])])]))), "G2.1"),
        ("terms: a role's spot cMIP not named by fingerprint", "G2.1", with_role(role(Some(u(0)), Some(what.clone()), Some(arr(vec![txt("spot"), Value::Null])))), "G2.1"),
        ("terms: an author beyond the parties", "G3.1", ps(3, Some(arr(vec![u(0), u(1)]))), "G3.1"),
        ("terms: an author that is a party named as an agreement", "G3.1", with(ps(2, Some(arr(vec![arr(vec![u(0), b(&a.id)]), arr(vec![u(2), b(&other_agreement)])]))), 3, Some(arr(vec![u(0), u(1)]))), "G3.1"),
        ("terms: a party by role and no in_force", "G4.2", with(with_role(role(Some(u(0)), Some(what.clone()), Some(spot.clone()))), 6, None), "G4.2"),
        ("terms: a role with no kind", "G10.1", with_role(role(None, Some(what.clone()), Some(spot.clone()))), "G10.1"),
        ("terms: a role of kind 5, not one of the five", "G10.1", with_role(role(Some(u(5)), Some(what.clone()), Some(spot.clone()))), "G10.1"),
        ("terms: a role whose kind is text", "G10.1", with_role(role(Some(txt("done")), Some(what.clone()), Some(spot.clone()))), "G10.1"),
        ("terms: a role of kind done with no what", "G10.1", with_role(role(Some(u(0)), None, Some(spot.clone()))), "G10.1"),
        ("terms: a role whose what is not a fingerprint", "G10.1", with_role(role(Some(u(1)), Some(txt("X")), Some(spot.clone()))), "G10.1"),
        ("terms: a role with no spot socket", "G10.1", with_role(role(Some(u(2)), Some(what.clone()), None)), "G10.1"),
        (
            "terms: two faults: a role with no kind, and no in_force (the first in section 2's order: G10.1, then G4.2)",
            "G10.1, G4.2; section 2's order",
            with(with_role(role(None, Some(what.clone()), Some(spot.clone()))), 6, None),
            "G10.1",
        ),
        (
            "terms: two faults: a power's rule not named by fingerprint, and an author beyond the parties (G2.1 first)",
            "G2.1, G3.1; section 2's order",
            with(ps(7, Some(arr(vec![arr(vec![u(0), arr(vec![u(9), Value::Null])])]))), 3, Some(arr(vec![u(0), u(1)]))),
            "G2.1",
        ),
    ];
    for (i, (name, tests, payload, rule)) in cases.into_iter().enumerate() {
        let m = t(&format!("terms/invalid/{i}"), payload);
        iv(&mut invalid, name, tests, &m, rule);
    }

    // Statements: rejected.
    let sp = Statement::new(agr, root.id, Kind::Assent, Some(root.id)).to_payload().unwrap();
    let ss = |k: u64, v: Option<Value>| with(sp.clone(), k, v);
    let resolves_v = arr(vec![b(&tip_1.id), b(&tip_2.id)]);
    let resolves_v = if cbor::encode(&b(&tip_1.id)) < cbor::encode(&b(&tip_2.id)) { resolves_v } else { arr(vec![b(&tip_2.id), b(&tip_1.id)]) };
    let cases: Vec<(&str, &str, Vec<(Value, Value)>, &str)> = vec![
        ("statement: a key the encoding does not give (12)", "E4", ss(12, Some(u(0))), "E4"),
        ("statement: no agreement", "E20", ss(0, None), "E20"),
        ("statement: no terms", "E20", ss(1, None), "E20"),
        ("statement: no kind", "E20", ss(2, None), "E20"),
        ("statement: no previous", "E20", ss(6, None), "E20"),
        ("statement: a kind of an unknown number (4)", "E15", ss(2, Some(u(4))), "E15"),
        ("statement: a K7 kind not named by fingerprint", "E15", ss(2, Some(arr(vec![txt("a vote"), Value::Null]))), "E15"),
        ("statement: an assent with content", "E20", ss(3, Some(txt("I agree"))), "E20"),
        ("statement: a counter signature with content", "E20", with(ss(2, Some(u(1))), 3, Some(txt("I withdraw"))), "E20"),
        ("statement: for without under", "E20", ss(4, Some(Who::Signer(bb.id).to_value())), "E20"),
        ("statement: under without for", "E20", ss(5, Some(b(&fixed("a delegation")))), "E20"),
        ("statement: for naming a role", "E11", with(ss(4, Some(arr(vec![u(1), b(&bb.id)]))), 5, Some(b(&fixed("a delegation")))), "E11"),
        ("statement: an entry of answers not a fingerprint", "E5", ss(7, Some(arr(vec![txt("that one")]))), "E5"),
        ("statement: answers out of order", "E18", ss(7, Some(arr(vec![b(&[2; 32]), b(&[1; 32])]))), "E18"),
        ("statement: a settlement that is not a fingerprint", "E5", ss(9, Some(u(1))), "E5"),
        ("statement: continues without resolves", "E20", ss(11, Some(b(&tip1))), "E20"),
        ("statement: agreement not a fingerprint", "E5", ss(0, Some(txt("root"))), "E5"),
        ("statement: an assent carrying resolves and continues (a resolve is its own kind)", "E20", with(ss(10, Some(resolves_v.clone())), 11, Some(b(&tip_1.id))), "E20"),
        ("statement: a contest carrying resolves and no continues", "E20", with(ss(2, Some(u(2))), 10, Some(resolves_v.clone())), "E20"),
        ("statement: a resolve with no continues", "E20", with(ss(2, Some(u(3))), 10, Some(resolves_v.clone())), "E20"),
        ("statement: a resolve with no resolves", "E20", ss(2, Some(u(3))), "E20"),
        ("statement: a resolve with content", "E20", with(with(with(ss(2, Some(u(3))), 10, Some(resolves_v.clone())), 11, Some(b(&tip_1.id))), 3, Some(txt("I pick this one"))), "E20"),
    ];
    for (i, (name, tests, payload, rule)) in cases.into_iter().enumerate() {
        let m = statement_act(&format!("statement/rejected/{i}"), &a, payload);
        rj(&mut invalid, name, tests, &m, rule);
    }

    // Reports: rejected (a proposal).
    let rp = conf.to_payload().unwrap();
    let rs = |k: u64, v: Option<Value>| with(rp.clone(), k, v);
    let line = |l: Value| rs(2, Some(arr(vec![l])));
    let am = arr(vec![b(&unit), u(5)]);
    let cases: Vec<(&str, &str, Vec<(Value, Value)>, &str)> = vec![
        ("report: a key the encoding does not give (3)", "E4", rs(3, Some(u(0))), "E4"),
        ("report: no call", "E21", rs(0, None), "E21"),
        ("report: a call for task 9", "E21", rs(0, Some(arr(vec![b(&settlement), u(9)]))), "E21"),
        ("report: a call whose act is not a fingerprint", "E21", rs(0, Some(arr(vec![txt("the payment")]))), "E21"),
        ("report: relies_on out of order", "E18", rs(1, Some(arr(vec![b(&[2; 32]), b(&[1; 32])]))), "E18"),
        ("report: an empty list of lines", "E18", rs(2, Some(arr(vec![]))), "E18"),
        ("report: a line of an unknown kind (5)", "E22", line(arr(vec![u(5), am.clone()])), "E22"),
        ("report: an amount that is not [unit, value]", "E22", line(arr(vec![u(2), u(5)])), "E22"),
        ("report: a passed-on line closing a line named badly", "E22", line(arr(vec![u(1), am.clone(), Who::Signer(bb.id).to_value(), b(&settlement), u(3)])), "E22"),
    ];
    for (i, (name, tests, payload, rule)) in cases.into_iter().enumerate() {
        let m = report_act(&format!("report/rejected/{i}"), &a, payload);
        rj(&mut invalid, name, tests, &m, rule);
    }

    // Held together: G6.1. These acts' `previous` are wrong on purpose.
    let m = st("held/other signer", &a, Statement::new(agr, root.id, Kind::Contest, Some(b_assent.id)));
    invalid.case("held: previous names another signer's act", "G6.1", &[&root, &b_assent, &m], ("invalid", Some("G6.1")), &[]);
    let other_root = terms_act("held/other root", &a, Terms { body: Some(Body::new(words("Other words (test)."), sock("body reader"))), ..base.clone() }.to_payload().unwrap());
    let other_assent = st("held/assent in other", &a, Statement::new(other_root.id, other_root.id, Kind::Assent, Some(other_root.id)));
    let m = st("held/other agreement", &a, Statement::new(agr, root.id, Kind::Contest, Some(other_assent.id)));
    invalid.case("held: previous names the signer's act within another agreement", "G6.1", &[&root, &other_root, &other_assent, &m], ("invalid", Some("G6.1")), &[]);
    let m = st("held/a report", &a, Statement::new(agr, root.id, Kind::Contest, Some(leg_act.id)));
    invalid.case("held: previous names a report", "G6.1", &[&root, &leg_act, &m], ("invalid", Some("G6.1")), &[]);
    let refused = t("held/refused", ps(19, None));
    let m = st("held/after refused", &a, Statement::new(agr, root.id, Kind::Contest, Some(refused.id)));
    invalid.case("held: previous names a held act that is rejected, no Terms act and no Statement", "G6.1", &[&root, &refused, &m], ("invalid", Some("G6.1")), &[]);

    write_file(&dir, "valid.json", &json!({
        "about": "Acts of the new Agreements encoding that pass the checker: shape, fields and signature, and no case of invalid the bytes show (docs/agreements-from-scratch/encoding-2.md). Each case lists the acts a verifier holds, in order (each act's id, its complete bytes in hex, and its content key where it is private); the answer is about the last act. Notes are what the act leaves unread or already answers by itself, by the rule named. Every act stands in its signer's sequence (prev, position, running summary), which runs through valid.json and then invalid.json. Every identity is a test identity: stand-in hashes, test keys derived from labels.",
        "spec": spec_json(),
        "cases": valid.cases,
    }));
    write_file(&dir, "invalid.json", &json!({
        "about": "One case for every check of encoding-2 (the act format's rules, E1 to E23, and the cases of invalid draft 25 says an act shows, by itself or among the acts held), each with the checker's expected answer and the rule it tests. Verdicts: rejected (draft 25's word: no Agreements act; the core's invalid as an act), invalid (a grammar rule named), unknown (a signature scheme not implemented, nothing else failing), cannot open (private, no key), not this encoding (another specification). The acts continue their signers' sequences from valid.json; the acts marked \"in no sequence\", and changed copies of an act, stand in none.",
        "spec": spec_json(),
        "cases": invalid.cases,
    }));
}

fn spec_json() -> J {
    json!({
        "draft_25": hx(&an::SPEC_DRAFT_25),
        "report_block_4": hx(&an::SPEC_REPORT_BLOCK_4),
        "types": { "terms": [hx(&an::SPEC_DRAFT_25), an::types::TERMS], "statement": [hx(&an::SPEC_DRAFT_25), an::types::STATEMENT], "report": [hx(&an::SPEC_REPORT_BLOCK_4), an::types::REPORT] },
    })
}

fn write_file(dir: &Path, name: &str, v: &J) {
    let s = serde_json::to_string_pretty(v).unwrap() + "\n";
    std::fs::write(dir.join(name), s).unwrap();
    println!("wrote agreements-new/{name}");
}
