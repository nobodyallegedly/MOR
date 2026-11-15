//! The verifier's cases: each a set of real encoded acts (written with the
//! encoding's builders, signed by test identities), the stand-in layers'
//! tables, a question, the expected answer and the sentence of draft 25 it
//! tests. The unit tests run every case; the vector generator writes them
//! (`core/vectors/agreements-new/grammar.json`). **For tests and vectors
//! only.**

use super::answer::{Answer, Qualifier, Word};
use super::recording::{recorded_stubs, Asked};
use super::scenario::{fixed, tid, Book, Tid};
use super::stubs::{fp, name};
use super::{Limits, Reader, Verifier};
use crate::agreements_new::{Amount, Body, Call, CallFrom, CallRef, Kind, Line, Party, Power, PowerKind, Receiver, Report, Role, RoleKind, Socket, Statement, Terms, Who};
use crate::cbor::Value;
use crate::hash::{work_hash, Hash};
use std::collections::HashMap;

/// The question a case asks.
#[derive(Clone, Debug)]
pub enum Question {
    Act(Hash),
    Whole(Hash),
    InForce(Hash),
    LastVersion(Hash),
    Update(Hash),
    Assent(Hash),
    CounterSignature(Hash),
    Bound(Who, Hash),
    Signature(Hash),
    Line(Hash, Hash),
    Resolution(Hash),
    Order(Hash, Hash),
    Receiver(Hash, Option<Hash>),
    ReceiverForPayment(Hash),
    Fillings(Hash, u64),
    TakesNew(Hash, u64),
    Rights(Hash, Hash),
    HoldsControl(Hash),
    Leg(Hash),
    Silence(Hash),
    Data(Hash, Who),
    BuyerLeg(Hash),
    BeforePaying(Hash),
    Contest(Hash),
    Baker(Hash),
}

impl Question {
    /// The question's name and its arguments, for the vectors.
    pub fn describe(&self) -> (&'static str, Vec<String>) {
        let h = |x: &Hash| super::answer::hex(x);
        let w = |x: &Who| match x {
            Who::Signer(s) => format!("signer:{}", h(s)),
            Who::Agreement(a) => format!("agreement:{}", h(a)),
        };
        match self {
            Question::Act(a) => ("act", vec![h(a)]),
            Question::Whole(a) => ("whole", vec![h(a)]),
            Question::InForce(a) => ("in_force", vec![h(a)]),
            Question::LastVersion(a) => ("last_version", vec![h(a)]),
            Question::Update(a) => ("update", vec![h(a)]),
            Question::Assent(a) => ("assent", vec![h(a)]),
            Question::CounterSignature(a) => ("counter_signature", vec![h(a)]),
            Question::Bound(p, a) => ("bound", vec![w(p), h(a)]),
            Question::Signature(a) => ("signature_of", vec![h(a)]),
            Question::Line(s, a) => ("line", vec![h(s), h(a)]),
            Question::Resolution(a) => ("resolution", vec![h(a)]),
            Question::Order(a, b) => ("order", vec![h(a), h(b)]),
            Question::Receiver(r, v) => ("receiver", std::iter::once(h(r)).chain(v.iter().map(h)).collect()),
            Question::ReceiverForPayment(p) => ("receiver_for_payment", vec![h(p)]),
            Question::Fillings(r, i) => ("fillings", vec![h(r), i.to_string()]),
            Question::TakesNew(r, i) => ("takes_new", vec![h(r), i.to_string()]),
            Question::Rights(v, s) => ("rights", vec![h(v), h(s)]),
            Question::HoldsControl(t) => ("holds_control", vec![h(t)]),
            Question::Leg(t) => ("leg", vec![h(t)]),
            Question::Silence(t) => ("silence", vec![h(t)]),
            Question::Data(r, x) => ("data", vec![h(r), w(x)]),
            Question::BuyerLeg(p) => ("buyer_leg", vec![h(p)]),
            Question::BeforePaying(r) => ("before_paying", vec![h(r)]),
            Question::Contest(c) => ("contest", vec![h(c)]),
            Question::Baker(t) => ("baker", vec![h(t)]),
        }
    }
}

/// The expected answer: its word, the rule named, its qualifier (by its
/// kind), whether disputed, and who, where it names someone. `pick` is the
/// answer's position where the question gives several.
#[derive(Clone, Debug)]
pub struct Want {
    pub word: Word,
    pub rule: &'static str,
    pub qualifier: &'static str,
    pub disputed: bool,
    pub who: Option<Who>,
    pub pick: usize,
}

pub fn want(word: Word, rule: &'static str) -> Want {
    Want { word, rule, qualifier: "any", disputed: false, who: None, pick: 0 }
}

impl Want {
    pub fn q(mut self, q: &'static str) -> Want {
        self.qualifier = q;
        self
    }
    pub fn who(mut self, w: Who) -> Want {
        self.who = Some(w);
        self
    }
    pub fn disputed(mut self) -> Want {
        self.disputed = true;
        self
    }
    pub fn pick(mut self, i: usize) -> Want {
        self.pick = i;
        self
    }
}

/// The kind of a qualifier, as the vectors write it.
pub fn qualifier_kind(q: &Qualifier) -> &'static str {
    match q {
        Qualifier::None => "none",
        Qualifier::AsShown => "as shown",
        Qualifier::PerPlace(_) => "per place",
        Qualifier::PerClock(_) => "per clock",
        Qualifier::PerAnchoring(_) => "per anchoring",
    }
}

/// One case.
#[derive(Clone)]
pub struct Case {
    pub name: String,
    /// The grammar rule it tests.
    pub rule: &'static str,
    /// The sentence of draft 25 it tests, quoted.
    pub sentence: &'static str,
    pub book: Book,
    pub reader: Reader,
    pub limits: Option<Limits>,
    pub question: Question,
    pub want: Want,
    /// Labels of the acts, by id, for the vectors' readers.
    pub labels: HashMap<Hash, String>,
}

impl Case {
    /// Ask the question; the answers, and what the stubs were asked.
    pub fn run(&self) -> (Vec<Answer>, Vec<Asked>) {
        let held = self.book.held();
        let (cmips, log) = recorded_stubs();
        let layers = self.book.layers();
        let mut v = Verifier::new(&held, &cmips, &layers).with_reader(self.reader.clone());
        if let Some(l) = self.limits {
            v = v.with_limits(l);
        }
        let (name, args) = self.question.describe();
        let args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
        let answers = v.ask_named(name, &args).expect("a question the verifier knows");
        let asked = log.borrow().clone();
        (answers, asked)
    }

    /// Whether the verifier gives the expected answer.
    pub fn check(&self) -> Result<Answer, String> {
        let (answers, _) = self.run();
        let Some(a) = answers.get(self.want.pick) else { return Err(format!("{}: no answer at position {}: {answers:?}", self.name, self.want.pick)) };
        let w = &self.want;
        let ok = a.word == w.word
            && a.rule == w.rule
            && (w.qualifier == "any" || qualifier_kind(&a.qualifier) == w.qualifier)
            && a.disputed == w.disputed
            && (w.who.is_none() || a.who == w.who);
        if ok {
            Ok(a.clone())
        } else {
            Err(format!(
                "{}: want {} {} ({}{}{}), got {} {} ({}{}{:?}): {}",
                self.name,
                w.word.word(),
                w.rule,
                w.qualifier,
                if w.disputed { ", disputed" } else { "" },
                w.who.map(|x| format!(", {x:?}")).unwrap_or_default(),
                a.word.word(),
                a.rule,
                qualifier_kind(&a.qualifier),
                if a.disputed { ", disputed, " } else { ", " },
                a.who,
                a.says
            ))
        }
    }
}

// ---------------------------------------------------------------- building

fn sk(n: &str, params: Value) -> Socket {
    Socket::new(fp(n), params)
}

fn body() -> Body {
    Body::new(work_hash(b"The words of these Terms (test)."), sk(name::BODY, Value::Null))
}

fn body_p(params: Value) -> Body {
    Body::new(work_hash(b"The words of these Terms (test)."), sk(name::BODY, params))
}

fn signers(ids: &[&Tid]) -> Vec<Party> {
    ids.iter().map(|t| Party::Signer(t.id)).collect()
}

fn base(parties: Vec<Party>) -> Terms {
    Terms { parties: Some(parties), authors: Some(vec![0]), body: Some(body()), ..Default::default() }
}

fn u(n: u64) -> Value {
    Value::Uint(n)
}

fn arr(v: Vec<Value>) -> Value {
    Value::Array(v)
}

fn bv(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn amount(n: u64) -> Amount {
    Amount { unit: fixed("unit: a test unit (stand-in)"), value: n }
}

/// A scenario: a book, and each signer's last act within each agreement, so
/// that every act names its signer's previous act there (G6.1).
#[derive(Clone, Default)]
struct S {
    book: Book,
    last: HashMap<(Hash, Hash), Hash>,
    labels: HashMap<Hash, String>,
}

impl S {
    fn prev(&self, who: &Tid, root: &Hash) -> Option<Hash> {
        self.last.get(&(who.id, *root)).copied()
    }

    fn root(&mut self, label: &str, who: &Tid, mut t: Terms) -> Hash {
        t.previous = None;
        let id = self.book.terms(label, who, t);
        self.last.insert((who.id, id), id);
        self.labels.insert(id, label.into());
        id
    }

    fn version(&mut self, label: &str, who: &Tid, root: Hash, replaces: Hash, mut t: Terms) -> Hash {
        t.replaces = Some(replaces);
        t.agreement = Some(root);
        t.previous = self.prev(who, &root);
        let id = self.book.terms(label, who, t);
        self.last.insert((who.id, root), id);
        self.labels.insert(id, label.into());
        id
    }

    /// A Terms act whose `previous` is given, not tracked (for forks).
    #[allow(dead_code)]
    fn terms_raw(&mut self, label: &str, who: &Tid, t: Terms) -> Hash {
        let root = t.agreement;
        let id = self.book.terms(label, who, t);
        if let Some(r) = root {
            self.last.insert((who.id, r), id);
        }
        self.labels.insert(id, label.into());
        id
    }

    fn st(&mut self, label: &str, who: &Tid, mut s: Statement) -> Hash {
        s.previous = self.prev(who, &s.agreement);
        self.st_raw(label, who, s)
    }

    fn st_raw(&mut self, label: &str, who: &Tid, s: Statement) -> Hash {
        let root = s.agreement;
        let id = self.book.statement(label, who, s);
        self.last.insert((who.id, root), id);
        self.labels.insert(id, label.into());
        id
    }

    fn assent(&mut self, label: &str, who: &Tid, root: Hash, t: Hash) -> Hash {
        self.st(label, who, Statement::new(root, t, Kind::Assent, None))
    }

    fn assent_rel(&mut self, label: &str, who: &Tid, root: Hash, t: Hash, rel: Vec<Hash>) -> Hash {
        let mut s = Statement::new(root, t, Kind::Assent, None);
        s.relies_on = Some(rel.into_iter().map(crate::agreements_new::Named::Fp).collect());
        self.st(label, who, s)
    }

    fn report(&mut self, label: &str, who: &Tid, r: Report) -> Hash {
        let id = self.book.report(label, who, r);
        self.labels.insert(id, label.into());
        id
    }

    fn case(&self, name: &str, rule: &'static str, sentence: &'static str, question: Question, want: Want) -> Case {
        Case { name: name.into(), rule, sentence, book: self.book.clone(), reader: Reader::default(), limits: None, question, want, labels: self.labels.clone() }
    }
}

fn reader(mut c: Case, r: Reader) -> Case {
    c.reader = r;
    c
}

fn rel(v: Vec<Hash>) -> Option<Vec<crate::agreements_new::Named>> {
    Some(v.into_iter().map(crate::agreements_new::Named::Fp).collect())
}

// ---------------------------------------------------------------- the cases

/// Every case.
pub fn all() -> Vec<Case> {
    let mut out = vec![];
    in_force_cases(&mut out);
    update_cases(&mut out);
    fork_cases(&mut out);
    counter_cases(&mut out);
    line_cases(&mut out);
    agreement_party_cases(&mut out);
    bound_cases(&mut out);
    place_cases(&mut out);
    receiver_cases(&mut out);
    spot_cases(&mut out);
    leg_cases(&mut out);
    baker_cases(&mut out);
    misc_cases(&mut out);
    out
}

fn ab() -> (Tid, Tid) {
    (tid("A"), tid("B"))
}

fn in_force_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let mut s = S::default();
    let root = s.root("in force/root", &a, base(signers(&[&a, &b])));
    let aa = s.assent("in force/A's assent", &a, root, root);
    out.push(s.case(
        "in force by the default: an assent of one of two signers is not enough",
        "G4.1",
        "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer",
        Question::InForce(root),
        want(Word::NotShown, "G4.1").q("as shown"),
    ));
    let ab_ = s.assent("in force/B's assent", &b, root, root);
    out.push(s.case(
        "in force by the default: an assent in the name of every party named as a signer",
        "G4.1",
        "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    out.push(s.case(
        "an assent counted, to Terms in force, binds: shown",
        "G4.3",
        "About an assent, a verifier answers **shown** where it is counted in a party's name and those Terms are in force",
        Question::Assent(ab_),
        want(Word::Shown, "G4.3").who(Who::Signer(b.id)),
    ));
    out.push(s.case(
        "order from citing: B's assent names the Terms, and came after them",
        "G13.3",
        "An act that names another, directly or through acts that name it, came after it",
        Question::Order(ab_, root),
        want(Word::Shown, "G13.3").q("none"),
    ));
    out.push(s.case(
        "order from citing: two assents that name nothing of each other: no order",
        "G13.3",
        "Between two acts of which neither so names the other, no order is shown from the acts alone.",
        Question::Order(aa, ab_),
        want(Word::NotShown, "G13.3"),
    ));
    // in_force by a K2 cMIP.
    let mut s = S::default();
    let t = Terms { in_force: Some(sk(name::IN_FORCE, u(1))), ..base(signers(&[&a, &b])) };
    let root = s.root("in force/K2 root", &a, t);
    s.assent("in force/K2 A's assent", &a, root, root);
    out.push(s.case(
        "in force by `in_force`: the cMIP (a stub asking one name) says the assents it requires are present",
        "G4.1",
        "Terms are in force when the assents their `in_force` rule requires are present.",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // a cMIP the verifier lacks.
    let mut s = S::default();
    let t = Terms { in_force: Some(Socket::new(fixed("a cMIP this verifier does not hold"), Value::Null)), ..base(signers(&[&a])) };
    let root = s.root("in force/unknown K2 root", &a, t);
    s.assent("in force/unknown K2 assent", &a, root, root);
    out.push(s.case(
        "in force by an `in_force` cMIP the verifier does not hold: unchecked",
        "G9.1",
        "Where a verifier cannot apply a rule it needs, because it lacks a cMIP named by fingerprint ... it MUST answer **unchecked** for every answer that depends on it.",
        Question::LastVersion(root),
        want(Word::Unchecked, "G4.6"),
    ));
}

fn update_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let mut s = S::default();
    let root = s.root("update/root", &a, base(signers(&[&a, &b])));
    s.assent("update/A's assent to root", &a, root, root);
    s.assent("update/B's assent to root", &b, root, root);
    let v2 = s.version("update/v2", &a, root, root, base(signers(&[&a, &b])));
    s.assent("update/A's assent to v2", &a, root, v2);
    out.push(s.case(
        "an update by the default, lacking one of those who signed the original: not shown, never not valid",
        "G4.11",
        "where one is lacking it answers **not shown** for the update as a replacement (G4.8(c)), and never **not valid**: the missing assent may exist",
        Question::Update(v2),
        want(Word::NotShown, "G4.8").q("as shown").who_none(),
    ));
    s.assent("update/B's assent to v2", &b, root, v2);
    out.push(s.case(
        "an update by the default: everyone who signed the original signs it: valid, by default",
        "G4.11",
        "Where Terms name no update condition, an update is valid when everyone who signed the original signs it.",
        Question::Update(v2),
        want(Word::Valid, "G4.11").q("as shown"),
    ));
    out.push(s.case(
        "Terms replaced: not shown, naming the Terms that replace them",
        "G4.9",
        "Asked whether Terms that have been replaced are in force, a verifier answers **not shown**, names the Terms that replace them (G4.5), and shows the agreement as going on in its last version.",
        Question::InForce(root),
        want(Word::NotShown, "G4.9").q("as shown"),
    ));
    out.push(s.case(
        "the last version, in force",
        "G4.6",
        "Which Terms of an agreement are in force is an answer about what is latest.",
        Question::LastVersion(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // By an update condition.
    let c = tid("C");
    let mut s = S::default();
    let t = Terms { condition: Some(sk(name::CONDITION, arr(vec![u(0), u(1)]))), ..base(signers(&[&a, &b, &c])) };
    let root = s.root("condition/root", &a, t);
    for (l, w) in [("A", &a), ("B", &b), ("C", &c)] {
        s.assent(&format!("condition/{l}'s assent to root"), w, root, root);
    }
    let v2 = s.version("condition/v2", &a, root, root, Terms { in_force: Some(sk(name::IN_FORCE, u(1))), ..base(signers(&[&a, &b, &c])) });
    s.assent("condition/A's assent to v2", &a, root, v2);
    out.push(s.case(
        "an update by an update condition (a stub: one of the original's signers): valid, the condition named",
        "G4.11",
        "Where the cMIP answers valid, the verifier answers **valid**, named and qualified in the same way, and the update replaces the version in force (G4.8).",
        Question::Update(v2),
        want(Word::Valid, "G4.11").q("as shown"),
    ));
    out.push(s.case(
        "bound by an update without an assent of one's own, where the update condition answers valid",
        "G5.1",
        "the act is a Terms act that replaces Terms by which they are bound, and the update condition of those Terms answers valid for it (G5.2).",
        Question::Bound(Who::Signer(b.id), v2),
        want(Word::Shown, "G5.1(c)"),
    ));
    // A condition that answers not valid.
    let mut s = S::default();
    let t = Terms { condition: Some(sk(name::CONDITION, arr(vec![u(1)]))), ..base(signers(&[&a, &b])) };
    let root = s.root("never/root", &a, t);
    s.assent("never/A's assent", &a, root, root);
    s.assent("never/B's assent", &b, root, root);
    let v2 = s.version("never/v2", &a, root, root, base(signers(&[&a, &b])));
    s.assent("never/A's assent to v2", &a, root, v2);
    s.assent("never/B's assent to v2", &b, root, v2);
    out.push(s.case(
        "an update condition that answers not valid: not valid, whoever signed it",
        "G4.11",
        "Where the cMIP answers not valid, the proposed update replaces nothing, whoever signed it (G4.8)",
        Question::Update(v2),
        want(Word::NotValid, "G4.11").q("as shown"),
    ));
    out.push(s.case(
        "the agreement goes on in its last version: the original stays in force",
        "G4.9",
        "Terms stop being in force only as G4.5 says: when a version replacing them is in force.",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // A power of kind replaces is left unread.
    let mut s = S::default();
    let t = Terms { powers: Some(vec![Power { kind: PowerKind::Replaces, rule: sk(name::POWER, arr(vec![bv(&a.id)])) }]), ..base(signers(&[&a, &b])) };
    let root = s.root("replaces power/root", &a, t);
    s.assent("replaces power/A", &a, root, root);
    s.assent("replaces power/B", &b, root, root);
    let v2 = s.version("replaces power/v2", &a, root, root, base(signers(&[&a, &b])));
    s.assent("replaces power/A's assent to v2", &a, root, v2);
    out.push(s.case(
        "a power of kind `replaces` gives no power: the default still asks everyone who signed the original",
        "G5.2",
        "No power makes a Terms act replace, and no power binds a party to one: `powers` has no kind `replaces`.",
        Question::Update(v2),
        want(Word::NotShown, "G4.8").q("as shown"),
    ));
    out.push(s.case(
        "a power of kind `replaces` is left unread, and the verifier says so",
        "G2.2",
        "An entry of `powers` of that kind gives no power; a verifier says that it left it unread (G2.2).",
        Question::Whole(root),
        want(Word::Shown, "G2.2"),
    ));
}

trait WhoNone {
    fn who_none(self) -> Want;
}
impl WhoNone for Want {
    fn who_none(self) -> Want {
        self
    }
}

/// A fork of Terms: v2a by A and v2b by B, each assented by both, neither
/// naming enough of the other to be late.
fn fork_base(s: &mut S, a: &Tid, b: &Tid, place: Option<Hash>) -> (Hash, Hash, Hash, Vec<Hash>) {
    let t = |p: Vec<Party>| Terms { place, ..base(p) };
    let root = s.root("fork/root", a, Terms { receiver: Some(Receiver::Party(0)), ..t(signers(&[a, b])) });
    let r1 = s.assent("fork/A's assent to root", a, root, root);
    let r2 = s.assent("fork/B's assent to root", b, root, root);
    let v2a = s.version("fork/v2a", a, root, root, t(signers(&[a, b])));
    let a1 = s.assent("fork/A's assent to v2a", a, root, v2a);
    let v2b = s.version("fork/v2b", b, root, root, Terms { receiver: Some(Receiver::Party(1)), ..t(signers(&[a, b])) });
    let b1 = s.assent("fork/B's assent to v2b", b, root, v2b);
    let b2 = s.assent("fork/B's assent to v2a", b, root, v2a);
    let a2 = s.assent("fork/A's assent to v2b", a, root, v2b);
    (root, v2a, v2b, vec![root, r1, r2, v2a, a1, v2b, b1, b2, a2])
}

fn fork_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let mut s = S::default();
    let (root, v2a, v2b, _) = fork_base(&mut s, &a, &b, None);
    out.push(s.case(
        "a fork of Terms: two updates of the same version, each signed by all who needed to: fork",
        "G4.7",
        "A verifier MUST answer **fork** for which Terms replace them, show both tips, and MUST NOT choose between them",
        Question::LastVersion(root),
        want(Word::Fork, "G4.7").q("as shown"),
    ));
    out.push(s.case(
        "while a fork stands, the Terms both branches replace stay in force",
        "G4.7",
        "until the fork is resolved (G12.3), neither is in force, nothing built on either counts, and the Terms both replace, the last shared version, stay in force.",
        Question::InForce(root),
        want(Word::Shown, "G4.7").q("as shown"),
    ));
    out.push(s.case(
        "a tip of a fork that stands: not in force",
        "G4.7",
        "Both tips stop (G12.2): until the fork is resolved (G12.3), neither is in force",
        Question::InForce(v2a),
        want(Word::NotShown, "G4.7").q("as shown"),
    ));
    let mut f = s.case(
        "the receiver while a fork of Terms stands: the one named by the Terms both branches replace, the fork shown",
        "G1.4",
        "while a fork of its Terms stands, the receiver is the one named by the Terms both branches replace, and the verifier MUST show the fork with that answer and MUST NOT choose a branch (G4.7).",
        Question::Receiver(root, None),
        want(Word::Shown, "G1.4").q("as shown").who(Who::Signer(a.id)),
    );
    f.want.pick = 0;
    out.push(f);
    out.push(s.case(
        "the receiver while a fork stands is shown with the fork",
        "G4.7",
        "It MUST show the fork with each such answer, per place or as shown.",
        Question::Receiver(root, None),
        want(Word::Fork, "G4.7").q("as shown").pick(1),
    ));
    // Resolved by a resolving update signed by everyone who signed the shared version.
    let mut s2 = s.clone();
    let r = s2.version("fork/resolving update", &a, root, root, Terms { resolves: Some(vec![v2a, v2b]), continues: Some(v2a), ..Default::default() });
    s2.assent("fork/A's assent to the resolving update", &a, root, r);
    s2.assent("fork/B's assent to the resolving update", &b, root, r);
    out.push(s2.case(
        "a fork of Terms resolved by an update of the shared Terms that names every tip and the one that continues",
        "G12.3",
        "A fork is resolved by an update of the shared act ... which names every tip in `resolves`; and which names one of them in `continues`.",
        Question::Resolution(r),
        want(Word::Shown, "G12.3").q("as shown"),
    ));
    out.push(s2.case(
        "after the resolving update, the tip continued is in force",
        "G12.3",
        "The tip it names in `continues` then counts as the next act of the line",
        Question::LastVersion(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    out.push(s2.case(
        "the other tip is set aside: it never counted as the next version",
        "G12.3",
        "Every other tip is **set aside**: it never counted as the next act of the line (for Terms, it never counted as the next version)",
        Question::InForce(v2b),
        want(Word::NotShown, "G12.3").q("as shown"),
    ));
    // A payment by an outsider that names the tip set aside stands, disputed.
    let mut s3 = s2.clone();
    let buyer = tid("U");
    let pay = fixed("verifier/a payment naming the tip set aside");
    s3.book.payment(pay, buyer.id, v2b, fixed("verifier/its settlement"), amount(5));
    out.push(s3.case(
        "a payment that names a version of a branch set aside stands: its receiver read from that version, disputed",
        "G12.5",
        "A payment that names a version of that branch is read as if the tip had stood alone: its receiver is read from that version (G1.4), and both are shown as disputed.",
        Question::ReceiverForPayment(pay),
        want(Word::Shown, "G1.4").disputed().who(Who::Signer(b.id)),
    ));
    // Both tips stopped: B's later contest against v2a counts for nothing.
    // A resolving update with no fork: an act like any other, a tip.
    let mut s = S::default();
    let root = s.root("no fork/root", &a, base(signers(&[&a, &b])));
    s.assent("no fork/A's assent to root", &a, root, root);
    s.assent("no fork/B's assent to root", &b, root, root);
    let v2 = s.version("no fork/v2", &a, root, root, base(signers(&[&a, &b])));
    s.assent("no fork/A's assent to v2", &a, root, v2);
    let x = s.version("no fork/x", &a, root, root, Terms { resolves: Some(vec![v2]), continues: Some(v2), ..Default::default() });
    s.assent("no fork/B's assent to x", &b, root, x);
    s.assent("no fork/A's assent to x", &a, root, x);
    s.assent("no fork/B's assent to v2", &b, root, v2);
    out.push(s.case(
        "an act shaped as a resolving update where there is no fork is an update like any other: with the other, a fork",
        "G12.3",
        "An act that names `resolves` and does not in fact resolve the fork it sits in (it is not signed as G12.3 asks, or does not name every tip, or there is no fork: what it names in `resolves` is one update and no other) is an act like any other, and may itself be a tip: a fork is not hidden by adding the field.",
        Question::LastVersion(root),
        want(Word::Fork, "G4.7").q("as shown"),
    ));
    // Rival resolving updates.
    let mut s = S::default();
    let (root, v2a, v2b, _) = fork_base(&mut s, &a, &b, None);
    let r1 = s.version("rivals/R1 (continues v2a)", &a, root, root, Terms { resolves: Some(vec![v2a, v2b]), continues: Some(v2a), ..Default::default() });
    let r2 = s.version("rivals/R2 (continues v2b)", &b, root, root, Terms { resolves: Some(vec![v2a, v2b]), continues: Some(v2b), ..Default::default() });
    s.assent("rivals/A's assent to R1", &a, root, r1);
    s.assent("rivals/B's assent to R2", &b, root, r2);
    s.assent("rivals/A's assent to R2", &a, root, r2);
    s.assent("rivals/B's assent to R1", &b, root, r1);
    out.push(s.case(
        "two resolving updates that continue different tips: neither resolves the first fork while the other stands",
        "G12.7",
        "Two that continue different tips are themselves a fork: two updates of the same shared act. Neither resolves the first fork while the other stands",
        Question::LastVersion(root),
        want(Word::Fork, "G4.7").q("as shown"),
    ));
    // A power to resolve (G12.4).
    let j = tid("J");
    let mut s = S::default();
    let root = s.root("power to resolve/root", &a, Terms { powers: Some(vec![Power { kind: PowerKind::Resolves, rule: sk(name::POWER, arr(vec![bv(&j.id)])) }]), ..base(signers(&[&a, &b])) });
    s.assent("power to resolve/A's assent to root", &a, root, root);
    s.assent("power to resolve/B's assent to root", &b, root, root);
    let v2a = s.version("power to resolve/v2a", &a, root, root, base(signers(&[&a, &b])));
    s.assent("power to resolve/A's assent to v2a", &a, root, v2a);
    let v2b = s.version("power to resolve/v2b", &b, root, root, base(signers(&[&a, &b])));
    s.assent("power to resolve/B's assent to v2b", &b, root, v2b);
    s.assent("power to resolve/B's assent to v2a", &b, root, v2a);
    s.assent("power to resolve/A's assent to v2b", &a, root, v2b);
    let r = s.version("power to resolve/J's resolving update", &j, root, root, Terms { resolves: Some(vec![v2a, v2b]), continues: Some(v2b), ..Default::default() });
    out.push(s.case(
        "a fork resolved under a power to resolve given in advance: shown, naming G12.4, the power and its signer",
        "G12.4",
        "Its answer about it is **shown**, naming G12.4, the power and its rule's answer, and the signer: the update condition is not asked of it (G4.11(g)), so it is neither valid nor not valid.",
        Question::Resolution(r),
        want(Word::Shown, "G12.4").q("as shown"),
    ));
    // A late rival, by knots.
    let mut s = S::default();
    let root = s.root("late/root", &a, base(signers(&[&a, &b])));
    s.assent("late/A's assent to root", &a, root, root);
    s.assent("late/B's assent to root", &b, root, root);
    let v2a = s.version("late/v2a", &a, root, root, base(signers(&[&a, &b])));
    let a1 = s.assent("late/A's assent to v2a", &a, root, v2a);
    s.assent("late/B's assent to v2a", &b, root, v2a);
    let v2b = s.version("late/v2b (relies on what made v2a)", &b, root, root, Terms { relies_on: rel(vec![a1]), ..base(signers(&[&a, &b])) });
    s.assent("late/B's assent to v2b", &b, root, v2b);
    s.assent("late/A's assent to v2b", &a, root, v2b);
    out.push(s.case(
        "a late rival, shown by knots: it names enough acts for the other update to be valid and in force",
        "G4.7",
        "L is a **late update** where the knots, or an anchoring, show that L came after O was replaced. A late update replaces nothing, and is no tip of a fork",
        Question::Update(v2b),
        want(Word::Shown, "G4.7").q("as shown"),
    ));
    out.push(s.case(
        "after a late rival, the line goes on from the update that came first",
        "G4.7",
        "O stays replaced by F, and the line goes on from F as if L were not there.",
        Question::LastVersion(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // Lateness that cannot be checked: the rival names an act not held.
    let mut s4 = S::default();
    let root = s4.root("late?/root", &a, base(signers(&[&a, &b])));
    s4.assent("late?/A's assent to root", &a, root, root);
    s4.assent("late?/B's assent to root", &b, root, root);
    let lacking = fixed("an act this verifier does not hold");
    let v2c = s4.version("late?/v2c (names an act not held)", &a, root, root, Terms { relies_on: rel(vec![lacking]), ..base(signers(&[&a, &b])) });
    s4.assent("late?/A's assent to v2c", &a, root, v2c);
    let v2a = s4.version("late?/v2a", &a, root, root, base(signers(&[&a, &b])));
    s4.assent("late?/A's assent to v2a", &a, root, v2a);
    s4.assent("late?/B's assent to v2c", &b, root, v2c);
    s4.assent("late?/B's assent to v2a", &b, root, v2a);
    out.push(s4.case(
        "an update that names an act the verifier does not hold, which might show it late: which Terms are in force is unchecked",
        "G4.7",
        "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late, whether L is late is **unchecked** (G9), and so is which Terms are in force from O on (G4.8(e)).",
        Question::LastVersion(root),
        want(Word::Unchecked, "G4.8"),
    ));
}

fn counter_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    // Before: the completing assent names the counter signature.
    let mut s = S::default();
    let root = s.root("counter/before/root", &a, base(signers(&[&a, &b])));
    s.assent("counter/before/A's assent", &a, root, root);
    let cs = s.st("counter/before/A's counter signature", &a, Statement::new(root, root, Kind::CounterSignature, None));
    s.assent_rel("counter/before/B's assent, naming it", &b, root, root, vec![cs]);
    out.push(s.case(
        "a counter signature before the Terms came into force (the completing assent names it): it cancels",
        "G4.10",
        "a completing assent that names the counter signature came after it.",
        Question::CounterSignature(cs),
        want(Word::Shown, "G4.10"),
    ));
    out.push(s.case(
        "with A's assent cancelled, the Terms are not in force by the default",
        "G4.10",
        "It cancels that assent, and no one else's: an assent so cancelled is not counted by G4.1.",
        Question::InForce(root),
        want(Word::NotShown, "G4.1").q("as shown"),
    ));
    // After: the counter signature names every assent the Terms need.
    let mut s = S::default();
    let root = s.root("counter/after/root", &a, base(signers(&[&a, &b])));
    s.assent("counter/after/A's assent", &a, root, root);
    let bb = s.assent("counter/after/B's assent", &b, root, root);
    let mut st = Statement::new(root, root, Kind::CounterSignature, None);
    st.relies_on = rel(vec![bb]);
    let cs = s.st("counter/after/A's counter signature, naming B's assent", &a, st);
    out.push(s.case(
        "a counter signature that names every assent the Terms need came after them: it changes nothing",
        "G4.10",
        "Under the default of G4.1 this is: a counter signature that names every assent the Terms need came after them",
        Question::CounterSignature(cs),
        want(Word::NotShown, "G4.10"),
    ));
    out.push(s.case(
        "a counter signature made after the Terms came into force: they stay in force",
        "G4.10",
        "One made for Terms that are in force changes nothing: Terms in force change only as G4.5 and G4.9 say.",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // No order.
    let mut s = S::default();
    let root = s.root("counter/no order/root", &a, base(signers(&[&a, &b])));
    s.assent("counter/no order/A's assent", &a, root, root);
    let cs = s.st("counter/no order/A's counter signature", &a, Statement::new(root, root, Kind::CounterSignature, None));
    s.assent("counter/no order/B's assent", &b, root, root);
    out.push(s.case(
        "a counter signature and a completing assent, neither naming the other: whether the Terms are in force is not shown",
        "G4.10",
        "Otherwise whether those Terms are in force is **not shown**, and the verifier says why.",
        Question::CounterSignature(cs),
        want(Word::NotShown, "G4.10"),
    ));
    out.push(s.case(
        "with the counter signature's order not shown, in force is not shown",
        "G4.10",
        "Otherwise whether those Terms are in force is **not shown**, and the verifier says why.",
        Question::InForce(root),
        want(Word::NotShown, "G4.1").q("as shown"),
    ));
}

fn line_cases(out: &mut Vec<Case>) {
    let a = tid("A");
    let mut s = S::default();
    let root = s.root("line/root", &a, base(signers(&[&a])));
    let a1 = s.st_raw("line/A's first assent", &a, Statement::new(root, root, Kind::Assent, Some(root)));
    let a2 = s.st_raw("line/A's second assent, naming the same previous", &a, Statement::new(root, root, Kind::Assent, Some(root)));
    out.push(s.case(
        "a fork in a signer's line: two acts that name the same previous act",
        "G6.2",
        "Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork.",
        Question::Line(a.id, root),
        want(Word::Fork, "G6.2").q("as shown"),
    ));
    out.push(s.case(
        "both tips of a signer's fork stop: neither assent counts, and the Terms are not in force",
        "G12.2",
        "While a fork stands, neither tip counts as the next act of its line, and nothing built on either tip counts",
        Question::InForce(root),
        want(Word::NotShown, "G4.1").q("as shown"),
    ));
    out.push(s.case(
        "an assent that is a tip of a signer's fork: not shown, it does not count",
        "G12.2",
        "While a fork stands, neither tip counts as the next act of its line",
        Question::Assent(a1),
        want(Word::NotShown, "G12.2"),
    ));
    let mut s2 = s.clone();
    let mut r = Statement::new(root, root, Kind::Resolve, Some(root));
    r.resolves = Some(vec![a1, a2]);
    r.continues = Some(a1);
    s2.st_raw("line/A's resolving update", &a, r);
    out.push(s2.case(
        "a signer's fork resolved by that signer's resolving update: the line goes on from the tip continued",
        "G12.3",
        "It resolves the fork only when it is signed as an update of the shared act must be: for one signer's line, by that signer (G6)",
        Question::Line(a.id, root),
        want(Word::Shown, "G12.3").q("as shown"),
    ));
    out.push(s2.case(
        "after the resolution, the continued assent counts: the Terms are in force",
        "G12.3",
        "The tip it names in `continues` then counts as the next act of the line, what is built on that tip counts as these grammar rules read it",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // A signer's fork resolved under a power to resolve, by a resolve made
    // for that signer (G12.4).
    let j = tid("J");
    let mut s = S::default();
    let d = s.root("line power/D, a power to resolve for A", &a, Terms { powers: Some(vec![Power { kind: PowerKind::Resolves, rule: sk(name::POWER, arr(vec![bv(&j.id)])) }]), ..base(signers(&[&a, &j])) });
    s.assent("line power/A's assent to D", &a, d, d);
    s.assent("line power/J's assent to D", &j, d, d);
    let root = s.root("line power/Y", &a, base(signers(&[&a])));
    let a1 = s.st_raw("line power/A's first assent", &a, Statement::new(root, root, Kind::Assent, Some(root)));
    let a2 = s.st_raw("line power/A's second assent, naming the same previous", &a, Statement::new(root, root, Kind::Assent, Some(root)));
    let mut r = Statement::new(root, root, Kind::Resolve, None);
    r.for_ = Some(Who::Signer(a.id));
    r.under = Some(d);
    r.resolves = Some(vec![a1, a2]);
    r.continues = Some(a2);
    s.st("line power/J's resolve for A, under D", &j, r);
    out.push(s.case(
        "a signer's fork resolved by a resolve made for that signer under a power to resolve",
        "G12.4",
        "For a fork in one signer's line too, it is an entry of `powers` of kind `resolves`, in Terms by which that signer is bound",
        Question::Line(a.id, root),
        want(Word::Shown, "G12.4").q("as shown"),
    ));
    out.push(s.case(
        "after a resolve under a power, the continued assent counts",
        "G12.4",
        "A resolving update signed under such a power carries the signatures G12.3 asks for, and resolves the fork as G12.3 says.",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // A line unchecked before: previous names an act not held.
    let b = tid("B");
    let mut s = S::default();
    let root = s.root("unchecked line/root", &a, base(signers(&[&a, &b])));
    s.assent("unchecked line/A's assent", &a, root, root);
    s.st_raw("unchecked line/B's assent after an act not held", &b, Statement::new(root, root, Kind::Assent, Some(fixed("an act of B not held"))));
    out.push(s.case(
        "an act whose `previous` names nothing held counts, and its signer's line is shown unchecked before it",
        "G6.1",
        "Where `previous` names nothing the verifier holds, the act counts, and the verifier shows that signer's line as **unchecked** before it.",
        Question::Line(b.id, root),
        want(Word::Shown, "G6.1").q("as shown"),
    ));
    out.push(s.case(
        "the act after an act not held still counts toward in force",
        "G6.1",
        "Where `previous` names nothing the verifier holds, the act counts",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // previous naming another signer's act: invalid.
    let mut s = S::default();
    let root = s.root("invalid previous/root", &a, base(signers(&[&a, &b])));
    let aa = s.assent("invalid previous/A's assent", &a, root, root);
    let bad = s.st_raw("invalid previous/B's assent naming A's act", &b, Statement::new(root, root, Kind::Assent, Some(aa)));
    out.push(s.case(
        "`previous` naming another signer's act: invalid, and it counts for nothing",
        "G6.1",
        "An act whose `previous` names, among the acts held, anything that is not an act of the same signer within the same agreement ... is **invalid**",
        Question::Act(bad),
        want(Word::Invalid, "G6.1"),
    ));
    out.push(s.case(
        "an invalid assent counts for nothing: the Terms are not in force",
        "section 2",
        "An invalid act counts for nothing, for anything: no answer of these grammar rules rests on it, and no act counts through it.",
        Question::InForce(root),
        want(Word::NotShown, "G4.1").q("as shown"),
    ));
}

fn agreement_party_cases(out: &mut Vec<Case>) {
    let a = tid("A");
    let j = tid("J");
    let k = tid("K");
    // X signs through a power.
    let mut s = S::default();
    let x = s.root("party/X, with a power to assent", &j, Terms { powers: Some(vec![Power { kind: PowerKind::Assent, rule: sk(name::POWER, arr(vec![bv(&j.id)])) }]), ..base(signers(&[&j])) });
    s.assent("party/J's assent to X", &j, x, x);
    let need = arr(vec![Who::Signer(a.id).to_value(), Who::Agreement(x).to_value()]);
    let y = s.root("party/Y, naming X as a party", &a, Terms { in_force: Some(sk(name::IN_FORCE, need.clone())), ..base(vec![Party::Signer(a.id), Party::Agreement(x)]) });
    s.assent("party/A's assent to Y", &a, y, y);
    let mut st = Statement::new(y, y, Kind::Assent, None);
    st.for_ = Some(Who::Agreement(x));
    st.under = Some(x);
    let sig = s.st("party/J's assent to Y for X, under X", &j, st);
    out.push(s.case(
        "an agreement as a party signs through a power its own Terms give: its signature",
        "G1.2",
        "An act is signed by an agreement x when its `for` names x, by its root; its `under` names Terms of x that are in force (G4.6) and give a power for acts of that kind; and that power's rule, applied to the acts held, says yes.",
        Question::Signature(sig),
        want(Word::Shown, "G1.2").who(Who::Agreement(x)),
    ));
    out.push(s.case(
        "Terms whose `in_force` asks for the agreement's signing: in force once it signed",
        "G4.4",
        "An `in_force` rule MAY ask for its signing; it has then signed when what its own Terms require is present (G1.2).",
        Question::InForce(y),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // X2 signs by all its signers (no power).
    let mut s = S::default();
    let x2 = s.root("party/X2, two signers, no power", &j, base(signers(&[&j, &k])));
    s.assent("party/J's assent to X2", &j, x2, x2);
    s.assent("party/K's assent to X2", &k, x2, x2);
    let y2 = s.root("party/Y2, naming X2", &a, Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(a.id).to_value(), Who::Agreement(x2).to_value()]))), ..base(vec![Party::Signer(a.id), Party::Agreement(x2)]) });
    s.assent("party/A's assent to Y2", &a, y2, y2);
    let mut st = Statement::new(y2, y2, Kind::Assent, None);
    st.for_ = Some(Who::Agreement(x2));
    st.under = Some(x2);
    let sj = s.st("party/J's assent to Y2 for X2", &j, st.clone());
    out.push(s.case(
        "an agreement with no power signs by every one of its signers: one of two signed: not shown",
        "G1.2",
        "Where x's Terms give no such power, x signs by every one of its signers: one act by each of them, its `for` naming x and its `under` naming x's Terms in force.",
        Question::Signature(sj),
        want(Word::NotShown, "G1.2"),
    ));
    s.st("party/K's assent to Y2 for X2", &k, st);
    out.push(s.case(
        "an agreement with no power signs by every one of its signers: the same act from each: one signing",
        "G1.2",
        "x has signed once an act so matched is held from every one of its signers",
        Question::Signature(sj),
        want(Word::Shown, "G1.2"),
    ));
    // An agreement named and not counted by the default.
    let mut s = S::default();
    let x3 = s.root("party/X3", &j, base(signers(&[&j])));
    let y3 = s.root("party/Y3, naming X3, no in_force", &a, base(vec![Party::Signer(a.id), Party::Agreement(x3)]));
    s.assent("party/A's assent to Y3", &a, y3, y3);
    out.push(s.case(
        "a party named as an agreement is not counted by the default: in force with the signers' assents",
        "G4.4",
        "A party named as an agreement is not counted by the default of G4.1.",
        Question::InForce(y3),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    // Under names Terms of another agreement.
    let mut st = Statement::new(y3, y3, Kind::Assent, None);
    st.for_ = Some(Who::Agreement(x3));
    st.under = Some(y3);
    let bad = s.st("party/J's assent for X3 under Y3", &j, st);
    out.push(s.case(
        "an act made for an agreement under Terms of another agreement is not its signature",
        "G1.2",
        "Where an act's `for` names an agreement, its `under` MUST name Terms of that agreement: an act made for an agreement under any other Terms is not that agreement's signature.",
        Question::Signature(bad),
        want(Word::NotShown, "G1.2"),
    ));
}

fn bound_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let g = tid("G");
    // A delegation: A gives G a power to assent.
    let mut s = S::default();
    let d = s.root(
        "bound/delegation D",
        &a,
        Terms {
            body: Some(body_p(Value::Map(vec![(u(1), arr(vec![u(0), u(1), u(0)]))]))),
            powers: Some(vec![Power { kind: PowerKind::Assent, rule: sk(name::POWER, arr(vec![bv(&g.id)])) }]),
            ..base(signers(&[&a, &g]))
        },
    );
    s.assent("bound/A's assent to D", &a, d, d);
    s.assent("bound/G's assent to D", &g, d, d);
    let y = s.root("bound/Y", &b, base(signers(&[&a, &b])));
    s.assent("bound/B's assent to Y", &b, y, y);
    let before_g = s.clone();
    let mut st = Statement::new(y, y, Kind::Assent, None);
    st.for_ = Some(Who::Signer(a.id));
    st.under = Some(d);
    s.st("bound/G's assent to Y for A, under D", &g, st);
    out.push(s.case(
        "bound through a power: the act's `for` names them, its `under` Terms that bind them, in force, whose power's rule says yes",
        "G5.1",
        "the act's `for` names them, or names an agreement by whose Terms they are bound (G1.2); its `under` names Terms by which they are bound and which are in force; those Terms give a power for acts of this kind; and that power's rule, applied to the acts held, says yes",
        Question::Bound(Who::Signer(a.id), y),
        want(Word::Shown, "G5.1(b)"),
    ));
    out.push(s.case(
        "bound by one's own assent",
        "G5.1",
        "they signed it in their own name",
        Question::Bound(Who::Signer(b.id), y),
        want(Word::Shown, "G5.1(a)"),
    ));
    out.push(s.case(
        "an act with no `for` is made in its signer's own name only",
        "G5.3",
        "An act with no `for` and no `under` is made in its signer's own name only.",
        Question::Bound(Who::Signer(a.id), s.labels.iter().find(|(_, l)| l.as_str() == "bound/B's assent to Y").map(|(h, _)| *h).unwrap()),
        want(Word::NotShown, "G5.3"),
    ));
    // The delegator ends the delegation alone (G5.5).
    let mut s2 = s.clone();
    let d2 = s2.version("bound/D2, without the power", &a, d, d, Terms { body: Some(body_p(Value::Map(vec![(u(1), arr(vec![u(0), u(1), u(0)]))]))), ..base(signers(&[&a, &g])) });
    let e1 = s2.assent("bound/A's assent to D2", &a, d, d2);
    out.push(s2.case(
        "a delegation ended by the delegator alone: a version that removes the power, with the delegator's part alone, is valid by default",
        "G5.5",
        "By default the delegator can end it at any time: where those Terms name no update condition, a version of them that removes or narrows the power is valid, and replaces them (G4.8, G4.11(e)), when it carries the delegator's part alone, without the agent's.",
        Question::Update(d2),
        want(Word::Valid, "G4.11").q("as shown"),
    ));
    // G5.4: an act made under the power after it was ended.
    let mut st = Statement::new(y, y, Kind::Assent, None);
    st.for_ = Some(Who::Signer(a.id));
    st.under = Some(d);
    st.relies_on = rel(vec![e1]);
    // G made no act for A before D2: only the late one is held.
    let mut s3 = before_g;
    let d2b = s3.version("bound/D2, without the power", &a, d, d, Terms { body: Some(body_p(Value::Map(vec![(u(1), arr(vec![u(0), u(1), u(0)]))]))), ..base(signers(&[&a, &g])) });
    let e1b = s3.assent("bound/A's assent to D2", &a, d, d2b);
    assert_eq!((d2b, e1b), (d2, e1));
    let late = s3.st("bound/G's assent to Y for A, made after D2", &g, st);
    out.push(s3.case(
        "an act made under a power after the Terms that gave it were replaced: not bound",
        "G5.4",
        "they are bound by the act if it was made before the Terms that replace those were in force, and not bound if it was made after.",
        Question::Bound(Who::Signer(a.id), late),
        want(Word::NotShown, "G5.1(b)"),
    ));
}

fn place_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let p = fixed("a place (stand-in)");
    let mut s = S::default();
    let root = s.root("place/root", &a, Terms { place: Some(p), ..base(signers(&[&a, &b])) });
    let x = s.assent("place/A's assent", &a, root, root);
    let y = s.assent("place/B's assent", &b, root, root);
    let mut s1 = s.clone();
    s1.book.place(p, &[root, x, y]);
    out.push(s1.case(
        "in force per the place the Terms name",
        "G7.2",
        "A verifier MUST take those answers from the place, qualified **per place**.",
        Question::InForce(root),
        want(Word::Shown, "G4.6").q("per place"),
    ));
    let mut s2 = s.clone();
    s2.book.place(p, &[root, x]);
    out.push(s2.case(
        "an assent the place does not show does not count: not in force, per place",
        "G7.2",
        "an act within the agreement counts for any answer about what is latest (including which Terms are in force, G4.6) ... only once the place shows it",
        Question::InForce(root),
        want(Word::NotShown, "G4.1").q("per place"),
    ));
    out.push(s.case(
        "a place named, and no answer from it: unchecked",
        "G9.1",
        "or cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it.",
        Question::LastVersion(root),
        want(Word::Unchecked, "G4.6"),
    ));
    let mut s3 = s.clone();
    s3.book.place(p, &[root, x, y]);
    s3.book.places.get_mut(&p).unwrap().contradicted.insert(y);
    out.push(s3.case(
        "two answers of one place that contradict each other: no answer from that place, unchecked",
        "G7.2",
        "Where the verifier holds two answers of one place that contradict each other, it has no answer from that place: **unchecked** (G9).",
        Question::LastVersion(root),
        want(Word::Unchecked, "G4.6"),
    ));
    // Per anchoring: no place named, the reader accepts one.
    let mut s = S::default();
    let root = s.root("anchoring/root", &a, base(signers(&[&a, &b])));
    let x = s.assent("anchoring/A's assent", &a, root, root);
    let y = s.assent("anchoring/B's assent", &b, root, root);
    let anch = fixed("an anchoring the reader accepts (stand-in)");
    s.book.place(anch, &[root, x, y]);
    out.push(reader(
        s.case(
            "no place named: in force per the anchoring the reader accepts, with it named",
            "G7.3",
            "Where no place is named, a verifier MUST qualify every such answer **as shown**, or **per anchoring** where the reader accepts one, with it named (G13.4).",
            Question::InForce(root),
            want(Word::Shown, "G4.6").q("per anchoring"),
        ),
        Reader { on_behalf_of: None, anchoring: Some(anch) },
    ));
    // A late rival per place.
    let mut s = S::default();
    let (root, _v2a, v2b, order) = fork_base(&mut s, &a, &b, Some(p));
    s.book.place(p, &order);
    out.push(s.case(
        "a late rival shown by the place the original names: replaces nothing, per place",
        "G4.7",
        "L came after O was replaced, per that place, where the first position at which ... L is valid and in force comes after the first position at which, so counted, F is valid and in force",
        Question::Update(v2b),
        want(Word::Shown, "G4.7").q("per place"),
    ));
    let _ = root;
}

fn receiver_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let j = tid("J");
    let mut s = S::default();
    let x = s.root("receiver/X", &j, Terms { receiver: Some(Receiver::Party(0)), ..base(signers(&[&j])) });
    s.assent("receiver/J's assent to X", &j, x, x);
    let w = s.root("receiver/W, receiver X", &a, Terms { receiver: Some(Receiver::Agreement(x)), ..base(signers(&[&a, &b])) });
    s.assent("receiver/A's assent to W", &a, w, w);
    s.assent("receiver/B's assent to W", &b, w, w);
    out.push(s.case(
        "the receiver for an act: the receiver named by the version it read",
        "G1.4",
        "it gives or owes to that agreement's **receiver for the act**: the `receiver` named by the version of that agreement which the act that gives or owes names (G13.1).",
        Question::Receiver(x, Some(x)),
        want(Word::Shown, "G1.4").who(Who::Signer(j.id)),
    ));
    out.push(s.case(
        "a receiver that is another agreement: followed until one of an agreement's own parties is reached",
        "G1.4",
        "Where it is another agreement (G1.3), the two are agreements of a sequence (G11.1), and a verifier reads that agreement's receiver in the same way, and so on, until one of an agreement's own parties is reached.",
        Question::Receiver(w, None),
        want(Word::Shown, "G1.4").who(Who::Signer(j.id)),
    ));
    let mut c = s.case(
        "a verifier that stops following receivers answers unchecked, and says how far it followed",
        "G9.2",
        "A verifier that stops following receivers from agreement to agreement before a party is reached answers **unchecked**, and says how far it followed (G9.2; P8).",
        Question::Receiver(w, None),
        want(Word::Unchecked, "G1.4"),
    );
    c.limits = Some(Limits { receivers: 1, ..Limits::default() });
    out.push(c);
    let w2 = s.root("receiver/W2, no receiver", &a, base(signers(&[&a, &b])));
    out.push(s.case(
        "a version that names no receiver: no one receives, not shown",
        "G1.4",
        "If a version read names no receiver ... no one receives, and the answer is **not shown**.",
        Question::Receiver(w2, Some(w2)),
        want(Word::NotShown, "G1.4"),
    ));
    // A loop.
    let mut s = S::default();
    let y1_id_guess = fixed("unused");
    let _ = y1_id_guess;
    let y1 = s.root("loop/Y1, receiver itself", &a, Terms { receiver: None, ..base(signers(&[&a])) });
    s.assent("loop/A's assent to Y1", &a, y1, y1);
    let y2 = s.root("loop/Y2, receiver Y2's partner", &b, Terms { receiver: Some(Receiver::Agreement(y1)), ..base(signers(&[&b])) });
    s.assent("loop/B's assent to Y2", &b, y2, y2);
    let y1b = s.version("loop/Y1 v2, receiver Y2", &a, y1, y1, Terms { receiver: Some(Receiver::Agreement(y2)), ..base(signers(&[&a])) });
    s.assent("loop/A's assent to Y1 v2", &a, y1, y1b);
    out.push(s.case(
        "an agreement met a second time on the way: no one receives",
        "G1.4",
        "or an agreement is met a second time on the way, no one receives, and the answer is **not shown**.",
        Question::Receiver(y2, None),
        want(Word::NotShown, "G1.4"),
    ));
}

fn spot_cases(out: &mut Vec<Case>) {
    let m = tid("M");
    let buyer = tid("U");
    let mut s = S::default();
    let what = fixed("what: a deed (stand-in)");
    // The proof of the filling is the buyer's assent; it names the offer.
    let root_placeholder = Party::Role(Role::new(RoleKind::Done, Some(what), sk(name::SPOT, Value::Null)));
    let _ = root_placeholder;
    // First the offer, whose spot cMIP's parameters list the filling.
    // The filling names the version it was earned under, which is the
    // offer itself: we write the offer, then a second offer whose spot lists
    // the buyer, as the stub's table cannot name the act it sits in.
    let o0 = s.root("spot/offer O", &m, Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(m.id).to_value()]))), receiver: Some(Receiver::Party(0)), ..base(vec![Party::Signer(m.id), Party::Role(Role::new(RoleKind::Done, Some(what), sk(name::SPOT, Value::Null)))]) });
    s.assent("spot/M's assent to O", &m, o0, o0);
    let au = s.assent("spot/U's assent to O (the proof)", &buyer, o0, o0);
    let spot = |takes: bool| sk(name::SPOT, arr(vec![arr(vec![arr(vec![bv(&buyer.id), arr(vec![bv(&au)]), bv(&o0), Who::Signer(m.id).to_value()])]), Value::Bool(false), Value::Bool(takes)]));
    let o = s.version(
        "spot/O v2, the spot naming U's filling",
        &m,
        o0,
        o0,
        Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(m.id).to_value()]))), condition: Some(sk(name::CONDITION, arr(vec![u(2)]))), receiver: Some(Receiver::Party(0)), ..base(vec![Party::Signer(m.id), Party::Role(Role::new(RoleKind::Done, Some(what), spot(true)))]) },
    );
    s.assent("spot/M's assent to O v2", &m, o0, o);
    out.push(s.case(
        "a spot filled: each filling with its proof, reported by who signed it",
        "G10.2",
        "A verifier MUST answer each filling with its proof, each act reported by who signed it (G8.4), qualified per place or as shown (G7).",
        Question::Fillings(o0, 1),
        want(Word::Shown, "G10.2").who(Who::Signer(buyer.id)).pick(1),
    ));
    out.push(s.case(
        "whether a spot still takes new identities: the task's output, with its cause",
        "G10.5",
        "Whether a spot still takes new identities is said by its K5 cMIP, applied to the version in force",
        Question::TakesNew(o0, 1),
        want(Word::TaskYes, "G10.5"),
    ));
    let mut s2 = s.clone();
    let o3 = s2.version(
        "spot/O v3, closed",
        &m,
        o0,
        o,
        Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(m.id).to_value()]))), condition: Some(sk(name::CONDITION, arr(vec![u(2)]))), receiver: Some(Receiver::Party(0)), ..base(vec![Party::Signer(m.id), Party::Role(Role::new(RoleKind::Done, Some(what), spot(false)))]) },
    );
    s2.assent("spot/M's assent to O v3", &m, o0, o3);
    out.push(s2.case(
        "an offer stops taking new identities by a new version",
        "G10.5",
        "an offer stops taking new identities, or takes them again, by a new version (G4.8, G4.11)",
        Question::TakesNew(o0, 1),
        want(Word::TaskNo, "G10.5"),
    ));
    out.push(s2.case(
        "a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid",
        "G10.6",
        "the version the filling was earned under names an update condition, and that condition's cMIP, given that version and the later one, answers valid (G4.11).",
        Question::Rights(o0, buyer.id),
        want(Word::Shown, "G10.6").q("as shown"),
    ));
    out.push(s.case(
        "the receiver named by an offer: its maker",
        "G1.4",
        "Where the receiver so named is one of that agreement's own parties, the answer is that party.",
        Question::Receiver(o0, None),
        want(Word::Shown, "G1.4").who(Who::Signer(m.id)),
    ));
    // A role as receiver, filled once; and an unknown spot cMIP.
    let mut s = S::default();
    let x0 = s.root("spot receiver/X", &m, Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(m.id).to_value()]))), receiver: Some(Receiver::Party(1)), ..base(vec![Party::Signer(m.id), Party::Role(Role::new(RoleKind::Fits, Some(what), sk(name::SPOT, arr(vec![arr(vec![arr(vec![bv(&buyer.id), arr(vec![]), bv(&fixed("x"))])]), Value::Bool(false), Value::Bool(true)]))))]) });
    s.assent("spot receiver/M's assent", &m, x0, x0);
    out.push(s.case(
        "a receiver named as a role, filled once: the one who fills it receives",
        "G1.4",
        "the `receiver` named by the version of that agreement which the act that gives or owes names",
        Question::Receiver(x0, Some(x0)),
        want(Word::Shown, "G1.4").who(Who::Signer(buyer.id)),
    ));
    let mut s = S::default();
    let x1 = s.root("spot unknown/X", &m, Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(m.id).to_value()]))), receiver: Some(Receiver::Party(1)), ..base(vec![Party::Signer(m.id), Party::Role(Role::new(RoleKind::Fits, Some(what), Socket::new(fixed("a spot cMIP not held"), Value::Null)))]) });
    s.assent("spot unknown/M's assent", &m, x1, x1);
    out.push(s.case(
        "a receiver named as a role whose cMIP the verifier lacks: unchecked",
        "G9.1",
        "If the verifier lacks that agreement's acts, it is **unchecked** (G9).",
        Question::Receiver(x1, Some(x1)),
        want(Word::Unchecked, "G1.4"),
    ));
}

fn leg_cases(out: &mut Vec<Case>) {
    let sv = tid("S");
    let p = tid("P");
    let settlement = fixed("verifier/settlement s1");
    let leg = |from: CallFrom, report_p: Option<u64>, report_s: bool| -> (S, Hash) {
        let mut s = S::default();
        let w = s.root(
            "leg/W, a service passing on to P",
            &sv,
            Terms { receiver: Some(Receiver::Party(0)), control: Some(sk(name::CONTROL, Value::Null)), calls: Some(vec![Call { task: 6, from }]), data: None, ..base(signers(&[&sv, &p])) },
        );
        s.assent("leg/S's assent", &sv, w, w);
        s.assent("leg/P's assent", &p, w, w);
        s.book.settlement(settlement);
        if report_s {
            s.report("leg/S's leg report", &sv, Report { call: CallRef { act: w, task: Some(6) }, relies_on: None, lines: Some(vec![Line::PassedOn { amount: amount(5), to: Who::Signer(p.id), by: settlement, closes: None }]) });
        }
        if let Some(n) = report_p {
            s.report("leg/P's confirmation", &p, Report { call: CallRef { act: w, task: Some(6) }, relies_on: None, lines: Some(vec![Line::Received { amount: amount(n), by: settlement }]) });
        }
        (s, w)
    };
    let (s, w) = leg(CallFrom::Both, Some(5), true);
    out.push(s.case(
        "one leg's call, its two halves matched",
        "G11.4",
        "As the block asks, the verifier shows, for each such act, **matched**, **mismatched** (both shown, neither chosen), or **one side only**.",
        Question::Leg(w),
        want(Word::Matched, "G11.4").who(Who::Signer(p.id)),
    ));
    out.push(s.case(
        "Terms whose `control` names a cMIP hold the Control task",
        "G11.2",
        "Terms hold the Control task (K6) where their field `control` names a cMIP (G2)",
        Question::HoldsControl(w),
        want(Word::Shown, "G11.2"),
    ));
    let (s, w) = leg(CallFrom::Both, Some(4), true);
    out.push(s.case(
        "one leg's call, its two halves mismatched: both shown, neither chosen",
        "G11.4",
        "Where they do not, the verifier MUST show both, with the amount each states, and MUST NOT choose between them.",
        Question::Leg(w),
        want(Word::Mismatched, "G11.4"),
    ));
    let (s, w) = leg(CallFrom::Both, None, true);
    out.push(s.case(
        "one leg's call, the doer's half only: one side only",
        "G11.4",
        "the verifier shows, for each such act, **matched**, **mismatched** (both shown, neither chosen), or **one side only**.",
        Question::Leg(w),
        want(Word::OneSideOnly, "G11.4"),
    ));
    let (s, w) = leg(CallFrom::Both, Some(5), false);
    out.push(s.case(
        "a confirmation by a party named as a signer, of which no doer's report speaks: one side only",
        "G11.4",
        "A confirmation by a party those Terms name as a signer, of which no doer's report held speaks, is shown as **one side only**.",
        Question::Leg(w),
        want(Word::OneSideOnly, "G11.4"),
    ));
    let (s, w) = leg(CallFrom::Doer, None, true);
    out.push(s.case(
        "a call that expects one side only: each report shown as stated, no tie answered",
        "G11.4",
        "Where a call expects one side only, each report held is shown as stated, and no tie is answered.",
        Question::Leg(w),
        want(Word::Shown, "G11.4"),
    ));
    let (s, w) = leg(CallFrom::Both, None, false);
    out.push(reader(
        s.case(
            "a call with no report, read by a side of that leg: unanswered",
            "G11.4",
            "As the block asks, the verifier shows a call with no report as **unanswered**",
            Question::Silence(w),
            want(Word::Unanswered, "G11.4"),
        ),
        Reader { on_behalf_of: Some(Who::Signer(p.id)), anchoring: None },
    ));
    out.push(s.case(
        "a call with no report, read on behalf of no one: that leg's reports are not shown",
        "G11.4",
        "A verifier told nothing reads as no side of any leg. ... A verifier that does not ... MUST NOT show the call as unanswered: for it, that leg's reports are **not shown**.",
        Question::Silence(w),
        want(Word::NotShown, "G11.4"),
    ));
    // No report called for.
    let mut s = S::default();
    let w = s.root("leg/W0, no call", &sv, Terms { receiver: Some(Receiver::Party(0)), control: Some(sk(name::CONTROL, Value::Null)), ..base(signers(&[&sv, &p])) });
    s.assent("leg/W0 S's assent", &sv, w, w);
    out.push(s.case(
        "Terms that hold the Control task and carry no call: no report called for",
        "G11.4",
        "and Terms that hold the Control task and carry no call as **no report called for**.",
        Question::Leg(w),
        want(Word::NoReportCalledFor, "G11.4"),
    ));
    // Control held with the socket empty, by a party who holds for others.
    let mut s = S::default();
    let w = s.root("leg/W1, empty control, a share for P", &sv, Terms { receiver: Some(Receiver::Party(0)), body: Some(body_p(Value::Map(vec![(u(0), arr(vec![u(0), u(1)]))]))), ..base(signers(&[&sv, &p])) });
    out.push(s.case(
        "with `control` empty, a receiver among the parties who holds for others holds the Control task",
        "G11.2",
        "or, with that socket empty, where they name as `receiver` one of their own parties (G1.3) and give a part to any other party",
        Question::HoldsControl(w),
        want(Word::Shown, "G11.2"),
    ));
    let mut s = S::default();
    let w = s.root("leg/W2, empty control, no share", &sv, Terms { receiver: Some(Receiver::Party(0)), ..base(signers(&[&sv, &p])) });
    out.push(s.case(
        "with `control` empty and no part given to another party: the Control task is not held",
        "G11.2",
        "Whether Terms give a part to a party is read from their words, as the body's cMIP gives them (task K1): a share for any party other than the receiver.",
        Question::HoldsControl(w),
        want(Word::NotShown, "G11.2"),
    ));
    // Data: a path beyond one leg.
    let x = tid("X");
    for (with_data, word, n) in [(true, Word::TaskYes, "a data cMIP that answers yes for this reader"), (false, Word::TaskNo, "an empty data socket: one leg")] {
        let mut s = S::default();
        let w = s.root(
            &format!("data/W ({n})"),
            &sv,
            Terms {
                receiver: Some(Receiver::Party(0)),
                control: Some(sk(name::CONTROL, Value::Null)),
                calls: Some(vec![Call { task: 6, from: CallFrom::Both }]),
                data: with_data.then(|| sk(name::DATA, arr(vec![Who::Signer(x.id).to_value()]))),
                ..base(signers(&[&sv, &p]))
            },
        );
        s.assent("data/S's assent", &sv, w, w);
        s.assent("data/P's assent", &p, w, w);
        let r = s.report("data/S's leg report", &sv, Report { call: CallRef { act: w, task: Some(6) }, relies_on: None, lines: Some(vec![Line::PassedOn { amount: amount(5), to: Who::Signer(p.id), by: settlement, closes: None }]) });
        out.push(s.case(
            &format!("may a reader read a leg report beyond its leg: {n}"),
            "G11.6",
            "Its one question, asked for one reader and one report of a leg carried out under those Terms: may this reader read it, or what it states, beyond its leg? It answers yes or no. ... Where it is empty the answer is no: one leg.",
            Question::Data(r, Who::Signer(x.id)),
            want(word, "G11.6"),
        ));
    }
    // Before paying.
    let mut s = S::default();
    let w = s.root("before paying/W", &sv, Terms { receiver: Some(Receiver::Party(0)), control: Some(sk(name::CONTROL, Value::Null)), calls: Some(vec![Call { task: 6, from: CallFrom::Both }]), ..base(signers(&[&sv, &p])) });
    s.assent("before paying/S's assent", &sv, w, w);
    s.assent("before paying/P's assent", &p, w, w);
    let o = s.root("before paying/the work, receiver W", &p, Terms { receiver: Some(Receiver::Agreement(w)), ..base(signers(&[&p])) });
    s.assent("before paying/P's assent to the work", &p, o, o);
    out.push(s.case(
        "before paying: which agreements of a sequence carry a call, from whom, and their data cMIP, one at a time",
        "G11.4",
        "Asked which agreements of a sequence carry a call for reports, a verifier answers from their Terms alone (G11.2), one agreement at a time, per place or as shown (G4.6)",
        Question::BeforePaying(o),
        want(Word::Shown, "G11.4").q("as shown").pick(1),
    ));
    // The buyer's leg.
    let m = tid("M");
    let buyer = tid("U");
    let what = fixed("what: a buyer (stand-in)");
    let offer = |s: &mut S| -> Hash {
        let o = s.root(
            "buyer/the offer",
            &m,
            Terms { in_force: Some(sk(name::IN_FORCE, arr(vec![Who::Signer(m.id).to_value()]))), receiver: Some(Receiver::Party(0)), ..base(vec![Party::Signer(m.id), Party::Role(Role::new(RoleKind::Fits, Some(what), sk(name::SPOT, Value::Null)))]) },
        );
        s.assent("buyer/M's assent", &m, o, o);
        s.assent("buyer/U's assent (the buyer signs the offer's Terms)", &buyer, o, o);
        o
    };
    let pay = fixed("verifier/the buyer's payment");
    let st = fixed("verifier/the buyer's settlement");
    for (conf, word, n) in [(Some(10), Word::Matched, "matched"), (Some(9), Word::Mismatched, "mismatched"), (None, Word::OneSideOnly, "one side only")] {
        let mut s = S::default();
        let o = offer(&mut s);
        s.book.payment(pay, buyer.id, o, st, amount(10));
        if let Some(v) = conf {
            s.report("buyer/M's confirmation", &m, Report { call: CallRef { act: st, task: None }, relies_on: None, lines: Some(vec![Line::Received { amount: amount(v), by: st }]) });
        }
        out.push(s.case(
            &format!("the buyer's leg: the payment and the receiving side's confirmation, {n}"),
            "G11.7",
            "As for any two halves, a verifier shows a payment so confirmed as **matched**, one whose confirmation states another amount as **mismatched**, and one the receiving side has not confirmed as **one side only**",
            Question::BuyerLeg(pay),
            want(word, "G11.7").who(Who::Signer(m.id)),
        ));
    }
    // A contest, and a buyer's contest.
    let mut s = S::default();
    let o = offer(&mut s);
    s.book.payment(pay, buyer.id, o, st, amount(10));
    let mut c = Statement::new(o, o, Kind::Contest, None);
    c.settlement = Some(st);
    let cid = s.st("buyer/U's contest", &buyer, c);
    out.push(s.case(
        "a contest made against an offer: it reaches the signers that version names, and no one else",
        "G11.8",
        "Whom it reaches follows from what it is made against: the signers of that offer or vow (one level, G1.2), and no one else.",
        Question::Contest(cid),
        want(Word::Shown, "G11.8").q("as shown"),
    ));
    out.push(s.case(
        "a buyer's contest: a payment by the same signer naming the same settlement and version is held",
        "G11.8",
        "A verifier shows a contest as a buyer's where it holds a payment by the same signer that names the same settlement and the same version",
        Question::Contest(cid),
        want(Word::Shown, "G11.8").pick(1),
    ));
    let mut s2 = s.clone();
    s2.book.money = None;
    out.push(s2.case(
        "a contest naming a settlement, and no such payment held: whether it is a buyer's is unchecked",
        "G11.8",
        "where it holds no such payment, whether the contest is a buyer's is **unchecked** (G9).",
        Question::Contest(cid),
        want(Word::Unchecked, "G11.8").pick(1),
    ));
    let mut s3 = S::default();
    let o = offer(&mut s3);
    s3.book.payment(pay, buyer.id, o, st, amount(10));
    let mut d = Statement::new(o, o, Kind::Assent, None);
    d.previous = None;
    let _ = d;
    let conf = s3.report("buyer/M's confirmation (data)", &m, Report { call: CallRef { act: st, task: None }, relies_on: None, lines: Some(vec![Line::Received { amount: amount(10), by: st }]) });
    out.push(s3.case(
        "the buyer's leg beyond it: the offer's `data` is empty: no, one leg",
        "G11.6",
        "Where the version's `data` is empty, the answer is no: one leg.",
        Question::Data(conf, Who::Signer(tid("X").id)),
        want(Word::TaskNo, "G11.6"),
    ));
}

fn baker_cases(out: &mut Vec<Case>) {
    let k = tid("K");
    let a = tid("A");
    let n = tid("N");
    let z = tid("Z");
    let bake = fixed("verifier/a bake (the envelope)");
    let work = fixed("verifier/the work's bytes");
    let t1 = fixed("verifier/a transfer of the baker's rights to N");
    let env = |at: Hash, p: Vec<Party>| Terms { envelope: Some(bake), envelope_at: Some(at), ..base(p) };
    let mut s = S::default();
    s.book.envelope(bake, k.id, work);
    let t = s.root("baker/Terms with the baker, citing the bake", &k, env(bake, signers(&[&k, &a])));
    s.assent("baker/K's assent", &k, t, t);
    let aa = s.assent("baker/A's assent", &a, t, t);
    out.push(s.case(
        "the baker at the cited act is a party, bound: the Terms count",
        "G14.3",
        "Where the acts held establish G14.2, the Terms count, for the work and for everything else",
        Question::Baker(t),
        want(Word::Shown, "G14.3").q("none").who(Who::Signer(k.id)),
    ));
    let mut s1 = s.clone();
    s1.book.chain = None;
    out.push(s1.case(
        "no answer from the envelope's chain: unchecked",
        "G14.3",
        "Where the verifier lacks the envelope, the act the Terms cite, an act of the chain between them ... the answer is **unchecked** (G9)",
        Question::Baker(t),
        want(Word::Unchecked, "G14.3"),
    ));
    // After a sale.
    let mut s2 = s.clone();
    s2.book.transfer(bake, t1, bake, n.id);
    out.push(s2.case(
        "after a sale, Terms made with the holder of the moment keep counting",
        "G14.2",
        "Terms made with the holder of the moment keep counting after a later transfer: it takes nothing from them",
        Question::Baker(t),
        want(Word::Shown, "G14.3").who(Who::Signer(k.id)),
    ));
    out.push(s2.case(
        "after a sale, Terms with the holder of the moment stay in force",
        "G14.2",
        "Terms made with the holder of the moment keep counting after a later transfer",
        Question::InForce(t),
        want(Word::Shown, "G4.6").q("as shown"),
    ));
    let tn = s2.root("baker/N's Terms, citing the transfer to N", &n, env(t1, signers(&[&n, &a])));
    s2.assent("baker/N's assent", &n, tn, tn);
    s2.assent("baker/A's assent to N's Terms", &a, tn, tn);
    out.push(s2.case(
        "the buyer of the rights holds them from the transfer on: Terms citing it need that holder",
        "G14.2",
        "The one a transfer names holds the baker's rights from that transfer on: Terms that cite that transfer, or a later act of the chain, need that holder, and not the baker.",
        Question::Baker(tn),
        want(Word::Shown, "G14.3").who(Who::Signer(n.id)),
    ));
    let tk = s2.root("baker/K's Terms citing the transfer, after selling", &k, env(t1, signers(&[&k])));
    out.push(s2.case(
        "Terms citing the transfer, without the holder it names: invalid",
        "G14.3",
        "Once a transfer names another holder**, Terms that cite it ask nothing of the baker, or of any earlier holder, under G14.",
        Question::Baker(tk),
        want(Word::Invalid, "G14.3").who(Who::Signer(n.id)),
    ));
    // Late Terms: K, after the sale, cites the bake, and names the transfer.
    let tl = s2.root("baker/K's late Terms (cite the bake, name the transfer)", &k, Terms { relies_on: rel(vec![t1]), ..env(bake, signers(&[&k, &a])) });
    s2.assent("baker/K's assent to late Terms", &k, tl, tl);
    s2.assent("baker/A's assent to late Terms", &a, tl, tl);
    out.push(s2.case(
        "late Terms, shown by knots: they name a transfer that follows the act they cite: they count for nothing",
        "G14.2",
        "Late Terms count for nothing, for anything, as a late update replaces nothing (G4.7): no answer rests on them. (a) **By knots:** the Terms, or an assent without which they are not in force or not a version (G4.1, G4.11), name Y, directly or through acts that name it",
        Question::Baker(tl),
        want(Word::NotShown, "G14.2").q("as shown"),
    ));
    out.push(s2.case(
        "late Terms are not in force",
        "G14.2",
        "Late Terms count for nothing, for anything",
        Question::InForce(tl),
        want(Word::NotShown, "G14.2"),
    ));
    // A thief's Terms.
    let tz = s2.root("baker/Z's Terms, citing the bake", &z, env(bake, signers(&[&z])));
    s2.assent("baker/Z's assent", &z, tz, tz);
    out.push(s2.case(
        "a thief's Terms cite a point of the chain where he held nothing: invalid, for good",
        "G14.3",
        "A thief's Terms cite a point of the chain where he held nothing: they are invalid for good, and no later transfer, to him or to anyone, makes them count",
        Question::Baker(tz),
        want(Word::Invalid, "G14.3").who(Who::Signer(k.id)),
    ));
    out.push(s2.case(
        "a thief's Terms: no one receives by them",
        "G14.3",
        "They never count, for anything, their receiver included. No one receives by them (G1.4)",
        Question::Receiver(tz, Some(tz)),
        want(Word::Invalid, "G14.3"),
    ));
    // `envelope_at` naming an act held that is not of the chain.
    let te = s2.root("baker/Terms whose envelope_at names an agreement's act", &k, env(aa, signers(&[&k])));
    out.push(s2.case(
        "`envelope_at` names an act, held, that is not an act of the envelope's chain: invalid",
        "G14.3",
        "so are Terms whose `envelope_at` names an act, held, that is not an act of the chain of the envelope they name.",
        Question::Baker(te),
        want(Word::Invalid, "G14.3"),
    ));
    // The holder named but not shown bound.
    let tb = s2.root("baker/Terms naming the baker, signed only by A", &a, env(bake, signers(&[&a, &k])));
    s2.assent("baker/A's assent to Terms naming K", &a, tb, tb);
    out.push(s2.case(
        "Terms that name the holder, who is not shown bound by them: not shown, they count for nothing until it is",
        "G14.3",
        "Where they name the holder at the act they cite, or reach that holder through a role, and the acts held do not establish that the holder is bound by them ... the answer is **not shown**",
        Question::Baker(tb),
        want(Word::NotShown, "G14.3").who(Who::Signer(k.id)),
    ));
    // A double sale.
    let mut s3 = s.clone();
    let t2 = fixed("verifier/a second transfer of the same rights, to A");
    s3.book.transfer(bake, t1, bake, n.id);
    s3.book.transfer(bake, t2, bake, a.id);
    let td = s3.root("baker/N's Terms after a double sale", &n, env(t1, signers(&[&n])));
    s3.assent("baker/N's assent (double sale)", &n, td, td);
    out.push(s3.case(
        "a double sale: the act cited lies in a fork of the envelope's chain for which that layer gives no holder: not shown",
        "G14.3",
        "Where that layer gives no holder while the fork stands, no party is shown to be the holder at that act, and the answer is **not shown** (G14.3(b)).",
        Question::Baker(td),
        want(Word::NotShown, "G14.3"),
    ));
    // The same work baked again.
    let mut s4 = s.clone();
    let l = tid("L");
    let bake2 = fixed("verifier/another bake of the same work");
    s4.book.envelope(bake2, l.id, work);
    out.push(s4.case(
        "the same work baked again: shown beside the answer, with each other envelope and the baker it states, as shown",
        "G14.5",
        "it MUST show, beside each of them and beside every answer of G14.3 about Terms for one of them, that the same work is baked by others too, with each other envelope it holds and the baker each states (G8). The answer is given **as shown**",
        Question::Baker(t),
        want(Word::Shown, "G14.5").q("as shown").who(Who::Signer(l.id)).pick(1),
    ));
    let tl2 = s4.root("baker/L's Terms, citing L's own bake", &l, Terms { envelope: Some(bake2), envelope_at: Some(bake2), ..base(signers(&[&l])) });
    s4.assent("baker/L's assent", &l, tl2, tl2);
    out.push(s4.case(
        "the same bytes baked by another: Terms that name that envelope and its baker, citing its bake, meet G14.2",
        "G14.5",
        "Anyone may bake the same bytes, unedited; that is another envelope, with its own baker, and Terms that name it and its baker, and cite its bake, meet G14.2",
        Question::Baker(tl2),
        want(Word::Shown, "G14.3").who(Who::Signer(l.id)),
    ));
}

fn misc_cases(out: &mut Vec<Case>) {
    let (a, b) = ab();
    let mut s = S::default();
    let t = Terms { relies_on: Some(vec![crate::agreements_new::Named::Not(Value::Text("a side piece, by name".into()))]), ..base(signers(&[&a])) };
    let root = s.root("whole/root, a relies_on entry that is no fingerprint", &a, t);
    out.push(s.case(
        "an entry of `relies_on` that is no fingerprint is not part of the Terms, and is left unread",
        "G2.2",
        "An entry of `relies_on` that is not a fingerprint is not read, and does not make the Terms invalid; a verifier says that it left it unread.",
        Question::Whole(root),
        want(Word::Shown, "G2.2"),
    ));
    let mut s = S::default();
    let t = Terms { calls: Some(vec![Call { task: 6, from: CallFrom::Both }]), ..base(signers(&[&a, &b])) };
    let root = s.root("whole/a call in Terms that do not hold its task", &a, t);
    out.push(s.case(
        "a call in Terms that do not hold the task it is attached to is left unread",
        "G2.2",
        "A call in Terms that do not hold the task it is attached to is left unread, and the verifier says so (G2.2).",
        Question::Whole(root),
        want(Word::Shown, "G2.2"),
    ));
    let mut s = S::default();
    let t = Terms { authors: Some(vec![1]), ..base(signers(&[&a])) };
    let bad = s.root("author/an author who is no party", &a, t);
    out.push(s.case(
        "an author who is not one of the parties: invalid",
        "G3.1",
        "`authors` MUST name one or more of the parties named as signers or roles.",
        Question::Act(bad),
        want(Word::Invalid, "G3.1"),
    ));
    let mut s = S::default();
    let t = Terms { body: Some(Body { words: crate::agreements_new::Named::Not(Value::Text("words by address".into())), socket: sk(name::BODY, Value::Null) }), ..base(signers(&[&a])) };
    let bad = s.root("whole/a body not named by fingerprint", &a, t);
    out.push(s.case(
        "a body not named by fingerprint makes the Terms invalid",
        "G2.1",
        "The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.",
        Question::InForce(bad),
        want(Word::Invalid, "G2.1"),
    ));
    // An assent made under Terms not held: unchecked.
    let mut s = S::default();
    let root = s.root("unchecked under/root", &a, base(signers(&[&a, &b])));
    s.assent("unchecked under/A's assent", &a, root, root);
    let mut st = Statement::new(root, root, Kind::Assent, None);
    st.for_ = Some(Who::Signer(b.id));
    st.under = Some(fixed("a delegation this verifier does not hold"));
    let x = s.st("unchecked under/G's assent for B under Terms not held", &tid("G"), st);
    out.push(s.case(
        "an assent made under Terms the verifier lacks: unchecked",
        "G9.1",
        "Where a verifier cannot apply a rule it needs, because it ... lacks an act named by fingerprint ... it MUST answer **unchecked** for every answer that depends on it.",
        Question::Assent(x),
        want(Word::Unchecked, "G5.1"),
    ));
    out.push(s.case(
        "Terms whose completing assent rests on Terms not held: in force is unchecked",
        "G9.1",
        "it MUST answer **unchecked** for every answer that depends on it.",
        Question::InForce(root),
        want(Word::Unchecked, "G4.6"),
    ));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_case_gives_its_answer() {
        let mut fails = vec![];
        for c in all() {
            if let Err(e) = c.check() {
                fails.push(e);
            }
        }
        assert!(fails.is_empty(), "{} case(s) failed:\n{}", fails.len(), fails.join("\n"));
    }

    #[test]
    fn every_grammar_rule_has_a_case() {
        let cases = all();
        for g in ["G1.2", "G1.4", "G2.2", "G3.1", "G4.1", "G4.3", "G4.4", "G4.7", "G4.9", "G4.10", "G4.11", "G5.1", "G5.2", "G5.3", "G5.4", "G5.5", "G6.1", "G6.2", "G7.2", "G7.3", "G9.1", "G9.2", "G10.2", "G10.5", "G10.6", "G11.2", "G11.4", "G11.6", "G11.7", "G11.8", "G12.2", "G12.3", "G12.4", "G12.5", "G12.7", "G13.3", "G14.2", "G14.3", "G14.5"] {
            assert!(cases.iter().any(|c| c.rule == g), "no case for {g}");
        }
    }

    #[test]
    fn every_sentence_is_draft_25s() {
        let text = std::fs::read_to_string(std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../docs/agreements-from-scratch/draft-25.md")).unwrap();
        let mut missing = vec![];
        for c in all() {
            for part in c.sentence.split(" ... ") {
                let part = part.trim_matches(|ch: char| ch == '.' || ch == ' ' || ch == '(' || ch == ')');
                if !text.contains(part) {
                    missing.push(format!("{}: {part}", c.name));
                }
            }
        }
        assert!(missing.is_empty(), "not found in draft 25:\n{}", missing.join("\n"));
    }

    #[test]
    fn every_act_stands_in_its_signers_sequence() {
        use crate::act::{Act, Sequence};
        for c in all() {
            let mut seqs: HashMap<Hash, Sequence> = HashMap::new();
            for w in &c.book.acts {
                let a = Act::decode(&w.bytes).unwrap();
                let inside = a.open(None).unwrap();
                let q = seqs.entry(a.outside.signer.unwrap()).or_default();
                q.check_next(&inside).unwrap_or_else(|e| panic!("{}: {}: {e:?}", c.name, w.label));
                q.append(&a.id(), &inside).unwrap();
            }
        }
    }

    #[test]
    fn names_are_distinct() {
        let cases = all();
        let mut names: Vec<&str> = cases.iter().map(|c| c.name.as_str()).collect();
        names.sort();
        let n = names.len();
        names.dedup();
        assert_eq!(n, names.len());
    }
}
