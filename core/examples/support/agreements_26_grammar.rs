//! The grammar vectors of verifier 3 (`core/vectors/agreements-26/grammar.json`):
//! cases of Agreements draft 26 in the bytes of encoding 3, each a set of
//! complete acts, the stand-in tables of the other layers, the reader, the
//! question, what the stub cMIPs were asked and answered, and the answer a
//! grammar verifier must give.
//!
//! In plain words: no grammar verifier of draft 26 exists yet, and none is
//! written here. Every answer below is read from draft 26 (at b58e417), with
//! the ledger and the lead's notes, and quoted beside it: never from code,
//! never from the codemeister's sheet's prediction. The bytes are the
//! builder's; the answers are the texts'.
//!
//! Precisely:
//! - Every act is an everyday act sealed and signed by the core's own
//!   functions (`act::make`), as the checker's vectors are
//!   ([`super::agreements_26`]), but each case keeps its own sequences
//!   ([`Sc`]): a case's acts are each signer's whole sequence, from its first
//!   act, so that no `prev` names an act the case does not hold (a `prev` is
//!   a knot, draft 26, 5.13.1, and an act named and not held leaves an order
//!   unchecked, 5.13.3).
//! - Every Terms act names its words: a Text act (Text draft 11) written by
//!   its signer just before it and held in the case.
//! - The other layers are tables, test data: each keeper's signed records
//!   (the copies the verifier holds of them; a dead keeper's stop), clocks,
//!   Money's payments and settlements, an envelope's chain.
//! - The stub cMIPs (K1 to K9) answer from their own parameters; each case
//!   lists what each was asked and what it answered. **Stubs, for tests
//!   only**: no real Terms should name one.
//! - **Test data**: every identity, keeper, clock, key, cMIP and record
//!   signature is a stand-in derived from a fixed label
//!   (`agreements-26/...`). Nothing names a real identity, server or key.

#![allow(dead_code)]
#![allow(unused_imports)]

pub(crate) use crate::agreements_26::{self as v, arr, b, previous, socket, sk, tk, txt, u, P, SPEC_DRAFT_26, STATEMENT, TERMS};
pub use mor_core::act::{self, Addressing, Inside, Sequence};
pub use mor_core::cbor::Value;
pub use mor_core::hash::{sha256, Hash};
pub use serde_json::{json, Value as J};
pub use std::collections::HashMap;
pub use std::path::Path;

#[path = "agreements_26_grammar_v2.rs"]
mod from_v2;
#[path = "agreements_26_grammar_sheet_a.rs"]
mod sheet_a;
#[path = "agreements_26_grammar_sheet_b.rs"]
mod sheet_b;
#[path = "agreements_26_grammar_evening.rs"]
mod evening;

// ================================================================ identities, stubs

/// A stand-in from a label, for the grammar vectors: test data.
pub fn g(label: &str) -> Hash {
    sha256(format!("agreements-26/grammar/{label}").as_bytes())
}

/// A test identity of the grammar vectors (the same derivation as the
/// checker's: `agreements-26/test identity X`), so the same test identities.
pub use crate::agreements_26::{tid, Tid};

/// A test keeper: its identifier is its identity hash (taken by the
/// codemeister, to check: encoding 3, section 11, item 7). Test data.
pub fn keeper_id(label: &str) -> Hash {
    tid(&format!("keeper {label}")).id
}

/// The stubs, K1 to K9: each answers its socket's question from its own
/// parameters, as a table. **For tests only.**
pub mod stub {
    pub const K1: &str = "K1 body: parts, and whether what a filling gave still applies, from its parameters";
    pub const K2: &str = "K2 in force: the names its parameters list must each have an assent counted";
    pub const K3: &str = "K3 power: yes for an act signed by one of the signers its parameters list";
    pub const K4: &str = "K4 update condition: valid when k of the original's known parties sign (k its parameter), never, or always";
    pub const K5: &str = "K5 spot: a filling for each assent, to a version naming the role, by a signer its parameters list";
    pub const K6: &str = "K6 control: always yes";
    pub const K7: &str = "K7 kind: a note, stating nothing these grammar rules read";
    pub const K8: &str = "K8 data: yes for the readers its parameters list";
    pub const K9: &str = "K9 keepers: enough where k of the keepers named show the act (k its parameter)";
    pub const ALL: &[(&str, &str, &str)] = &[
        ("K1", K1, "params: a map; key 0: the positions of the parties given a part; key 1: true or false, whether what a filling gave still applies"),
        ("K2", K2, "params: a list of who (`[0, signer]` or `[2, root]`): yes where an assent is counted in each of those names; it names those assents as the ones it requires"),
        ("K3", K3, "params: a list of identity hashes: yes for an act whose signer is one of them"),
        ("K4", K4, "params: `[0, k]`: valid where assents of k of the original's known parties to the update are among those that count; `[1]`: never valid; `[2]`: always valid"),
        ("K5", K5, "params: `[signers, takes_new]`: a list of identity hashes, and true or false. Each assent held, by one of those signers, to a version naming this role, is a filling: its proof is that assent, and the version it was earned under the one it names. One filling or many: many. Takes new identities where takes_new is true (a version's own parameters say it). Its parameters never name an act, so a version can name its own fillings' signers before they assent"),
        ("K6", K6, "params: null"),
        ("K7", K7, "params: null; its content is not read"),
        ("K8", K8, "params: a list of who: yes for those readers, no for any other"),
        ("K9", K9, "params: `[k]`: yes where k of the keepers named show the act in a record the verifier holds"),
    ];
}

/// A stub's fingerprint: the SHA-256 of a label that says it is a stub.
pub fn stub(name: &str) -> Hash {
    sha256(format!("agreements-26/stub cMIP (for tests only): {name}").as_bytes())
}

pub fn stub_socket(name: &str, params: Value) -> Value {
    socket(&stub(name), params)
}

/// A who (E11): `[0, signer]`.
pub fn who_signer(id: &Hash) -> Value {
    arr(vec![u(0), b(id)])
}

/// A who (E11): `[2, root]`.
pub fn who_agreement(root: &Hash) -> Value {
    arr(vec![u(2), b(root)])
}

// ================================================================ a scenario

/// One keeper's tables: its signed records as the verifier holds them.
#[derive(Clone)]
pub struct KeeperT {
    pub id: Hash,
    pub label: String,
    /// "live", or "dead: it shows nothing after position n".
    pub state: String,
    /// Each signed record the verifier holds a copy of: the acts it places,
    /// in order, at positions counting from 1. Empty: none of its records
    /// is held.
    pub records: Vec<Vec<Hash>>,
}

/// A reader's own anchoring, or its own keeper: an order it accepts, never
/// the Terms' answer (5.13.5).
#[derive(Clone)]
pub struct AnchorT {
    pub id: Hash,
    pub label: String,
    pub order: Vec<Hash>,
}

/// A scenario: the acts of one case, each signer's sequence from its first
/// act, each signer's last act within each agreement (for `previous`), and
/// the stand-in tables.
#[derive(Clone, Default)]
pub struct Sc {
    pub acts: Vec<v::Made>,
    seqs: HashMap<Hash, Sequence>,
    last: HashMap<(Hash, Hash), Hash>,
    pub names: HashMap<Hash, String>,
    pub keepers: Vec<KeeperT>,
    pub clocks: Vec<J>,
    pub money: Vec<J>,
    pub chain: Option<J>,
    pub anchoring: Option<AnchorT>,
    pub on_behalf_of: Option<Hash>,
    pub limits: Option<J>,
    pub not_held: Vec<Hash>,
    words_n: usize,
}

impl Sc {
    pub fn new() -> Sc {
        Sc::default()
    }

    /// Name a test identity, for the vectors' readers.
    pub fn who(&mut self, t: &Tid, name: &str) {
        self.names.insert(t.id, format!("identity {name} (test)"));
    }

    /// Seal and sign the next act of `who`'s sequence in this case.
    pub fn make(&mut self, label: &str, who: &Tid, spec: Hash, type_: u64, payload: P, public: bool) -> Hash {
        let q = self.seqs.entry(who.id).or_default();
        let inside = Inside {
            spec,
            type_,
            prev: Some(q.last().copied().into_iter().collect()),
            objects: None,
            payload: payload.entries(),
            position: Some(q.len() + 1),
            summary: Some(q.summary()),
            acks: None,
            refs: None,
            hint: None,
            salt: g(&format!("{label}/salt"))[..16].try_into().unwrap(),
        };
        let key = g(&format!("{label}/content key"));
        let nonce: [u8; 24] = g(&format!("{label}/nonce"))[..24].try_into().unwrap();
        let addr = Addressing { signer: Some(who.id), binding: Some(who.binding), public, to: None };
        let aux = g(&format!("{label}/aux"));
        let a = act::make(&inside, &key, &nonce, &addr, |id| who.key.sign(id, &aux));
        q.check_next(&inside).expect("the next act of the signer's sequence");
        q.append(&a.id(), &inside).unwrap();
        let id = a.id();
        self.acts.push(v::Made { label: label.into(), bytes: a.encode(), id, key: (!public).then_some(key), payload: payload.bytes() });
        self.names.insert(id, label.into());
        id
    }

    /// The words of Terms: a Text act (Text draft 11) by `who`, written just
    /// before the Terms that name it (5.2.2: "The Text act comes first").
    pub fn words(&mut self, who: &Tid, label: &str) -> Hash {
        self.words_n += 1;
        let text = format!("The words of {label} (test).");
        self.make(&format!("{label}/its words"), who, v::text_11(), 0, v::text_payload(&text), true)
    }

    /// A first Terms act: its words written first; `previous` `[]`.
    pub fn root(&mut self, label: &str, who: &Tid, t: P) -> Hash {
        let w = self.words(who, label);
        let t = t.set(tk::BODY, v::body(&w, stub_socket(stub::K1, Value::Null))).set(tk::PREVIOUS, previous(None));
        let id = self.make(label, who, SPEC_DRAFT_26, TERMS, t, true);
        self.last.insert((who.id, id), id);
        id
    }

    /// A first Terms act whose body socket's parameters are given (K1).
    pub fn root_body(&mut self, label: &str, who: &Tid, t: P, k1: Value) -> Hash {
        let w = self.words(who, label);
        let t = t.set(tk::BODY, v::body(&w, stub_socket(stub::K1, k1))).set(tk::PREVIOUS, previous(None));
        let id = self.make(label, who, SPEC_DRAFT_26, TERMS, t, true);
        self.last.insert((who.id, id), id);
        id
    }

    /// A version replacing `replaces`, of the agreement `root`: its words
    /// first; `previous` the signer's last act within the agreement.
    pub fn version(&mut self, label: &str, who: &Tid, root: &Hash, replaces: &Hash, t: P) -> Hash {
        let w = self.words(who, label);
        let prev = self.last.get(&(who.id, *root)).copied();
        let t = t
            .set(tk::BODY, v::body(&w, stub_socket(stub::K1, Value::Null)))
            .set(tk::REPLACES, b(replaces))
            .set(tk::AGREEMENT, b(root))
            .set(tk::PREVIOUS, previous(prev.as_ref()));
        let id = self.make(label, who, SPEC_DRAFT_26, TERMS, t, true);
        self.last.insert((who.id, *root), id);
        id
    }

    /// A resolving update of Terms (§4.3: `replaces`, `agreement`,
    /// `resolves`, `continues`, `previous`, and nothing else): `previous`
    /// names the signer's act given (the shared act, 5.12.4).
    pub fn resolving(&mut self, label: &str, who: &Tid, root: &Hash, shared: &Hash, tips: &[Hash], continues: &Hash, prev: Option<&Hash>) -> Hash {
        let t = P::new()
            .set(tk::REPLACES, b(shared))
            .set(tk::AGREEMENT, b(root))
            .set(tk::RESOLVES, v::sorted_set(tips.iter().map(b).collect()))
            .set(tk::CONTINUES, b(continues))
            .set(tk::PREVIOUS, previous(prev));
        let id = self.make(label, who, SPEC_DRAFT_26, TERMS, t, true);
        self.last.insert((who.id, *root), id);
        id
    }

    /// Any Terms act whose payload is given whole (`previous` included).
    pub fn terms_raw(&mut self, label: &str, who: &Tid, root: Option<&Hash>, t: P) -> Hash {
        let id = self.make(label, who, SPEC_DRAFT_26, TERMS, t, true);
        if let Some(r) = root {
            self.last.insert((who.id, *r), id);
        }
        id
    }

    /// A Statement: `previous` the signer's last act within the agreement.
    pub fn st(&mut self, label: &str, who: &Tid, s: P) -> Hash {
        let root = match s.0.iter().find(|(k, _)| *k == sk::AGREEMENT) {
            Some((_, Value::Bytes(x))) => <Hash>::try_from(x.as_slice()).unwrap(),
            _ => panic!("a Statement names its agreement"),
        };
        let prev = self.last.get(&(who.id, root)).copied();
        let s = s.set(sk::PREVIOUS, previous(prev.as_ref()));
        self.st_raw(label, who, s)
    }

    /// A Statement whose `previous` is given.
    pub fn st_raw(&mut self, label: &str, who: &Tid, s: P) -> Hash {
        let root = match s.0.iter().find(|(k, _)| *k == sk::AGREEMENT) {
            Some((_, Value::Bytes(x))) => <Hash>::try_from(x.as_slice()).unwrap(),
            _ => panic!("a Statement names its agreement"),
        };
        let id = self.make(label, who, SPEC_DRAFT_26, STATEMENT, s, true);
        self.last.insert((who.id, root), id);
        id
    }

    /// An assent to `terms`, within `root`.
    pub fn assent(&mut self, label: &str, who: &Tid, root: &Hash, terms: &Hash) -> Hash {
        self.st(label, who, v::statement(root, terms, v::kind::ASSENT, None))
    }

    /// An assent naming acts in `relies_on`.
    pub fn assent_rel(&mut self, label: &str, who: &Tid, root: &Hash, terms: &Hash, rel: &[Hash]) -> Hash {
        self.st(label, who, v::statement(root, terms, v::kind::ASSENT, None).set(sk::RELIES_ON, v::sorted_set(rel.iter().map(b).collect())))
    }

    /// A note: a Statement of the stub K7 kind, in its signer's own name,
    /// within `root`, made within `terms`, naming `names` in `relies_on`.
    /// It is what pins a party's side where the Terms name no keeper (5.4.1:
    /// "an act in that same name within the agreement (a Terms act or a
    /// Statement of that agreement, and no other knot)").
    pub fn note(&mut self, label: &str, who: &Tid, root: &Hash, terms: &Hash, names: &[Hash]) -> Hash {
        let mut s = P::new().set(sk::AGREEMENT, b(root)).set(sk::TERMS, b(terms)).set(sk::KIND, stub_socket(stub::K7, Value::Null));
        if !names.is_empty() {
            s = s.set(sk::RELIES_ON, v::sorted_set(names.iter().map(b).collect()));
        }
        self.st(label, who, s)
    }

    /// A keeper, with the records of it the verifier holds.
    pub fn keeper(&mut self, label: &str, state: &str, records: Vec<Vec<Hash>>) -> Hash {
        let id = keeper_id(label);
        self.names.insert(id, format!("keeper {label} (test)"));
        self.keepers.retain(|k| k.id != id);
        self.keepers.push(KeeperT { id, label: label.into(), state: state.into(), records });
        id
    }

    /// An act named and not held: a stand-in id, listed so.
    pub fn missing(&mut self, label: &str) -> Hash {
        let id = g(&format!("not held/{label}"));
        self.names.insert(id, format!("{label} (not held)"));
        self.not_held.push(id);
        id
    }

    pub fn label(&self, h: &Hash) -> String {
        self.names.get(h).cloned().unwrap_or_else(|| v::hx(h))
    }
}

/// Terms' common fields: `parties`, `authors` (`[0]` unless given). The body
/// and `previous` are written by [`Sc::root`] and [`Sc::version`].
pub fn terms(parties: Vec<Value>) -> P {
    P::new().set(tk::PARTIES, arr(parties)).set(tk::AUTHORS, arr(vec![u(0)]))
}

pub fn signers(ids: &[&Tid]) -> Vec<Value> {
    ids.iter().map(|t| v::party_signer(&t.id)).collect()
}

pub fn keepers(ids: &[Hash]) -> Value {
    v::keeper(ids)
}

// ================================================================ the case

/// One answer: its word, the grammar rule named, its qualifier, the keepers
/// that counted and those named as not showing it (per keeper), who it
/// names, whether disputed, and its reason in words.
#[derive(Clone)]
pub struct Ans {
    pub word: &'static str,
    pub rule: &'static str,
    pub qualifier: &'static str,
    pub counted: Vec<Hash>,
    pub not_showing: Vec<Hash>,
    pub who: Option<Hash>,
    pub disputed: bool,
    pub reason: String,
}

pub fn ans(word: &'static str, rule: &'static str, qualifier: &'static str, reason: &str) -> Ans {
    Ans { word, rule, qualifier, counted: vec![], not_showing: vec![], who: None, disputed: false, reason: reason.into() }
}

impl Ans {
    pub fn who(mut self, h: &Hash) -> Ans {
        self.who = Some(*h);
        self
    }
    pub fn counted(mut self, k: &[Hash]) -> Ans {
        self.counted = k.to_vec();
        self
    }
    pub fn not_showing(mut self, k: &[Hash]) -> Ans {
        self.not_showing = k.to_vec();
        self
    }
    pub fn disputed(mut self) -> Ans {
        self.disputed = true;
        self
    }
}

/// What one stub was asked, and what it answered.
pub struct Asked {
    pub task: &'static str,
    pub stub: &'static str,
    pub asked: String,
    pub answered: String,
}

pub fn asked(task: &'static str, stub: &'static str, asked: &str, answered: &str) -> Asked {
    Asked { task, stub, asked: asked.into(), answered: answered.into() }
}

/// One grammar case.
pub struct G {
    pub name: String,
    /// Where it comes from: "4.1", "4.2", "4.3" (verifier 2's case, by the
    /// sheet's sections), "4.4" (the sheet's new lines), or "evening",
    /// "the lead's five", "K9", "the author's first act".
    pub part: &'static str,
    /// Verifier 2's case, by its position in `agreements-new/grammar.json`.
    pub v2: Option<usize>,
    /// The sheet's line (`docs/code/impact-draft-26.md`, section 4.4).
    pub sheet: Option<&'static str>,
    /// "rewritten" (answer kept), "changed" (answer changed from verifier
    /// 2's), "new".
    pub status: &'static str,
    /// Where the answer differs from the sheet's prediction: what the sheet
    /// said, and why the text wins.
    pub against_sheet: Option<String>,
    /// The grammar rule it tests.
    pub tests: &'static str,
    /// Sentences of draft 26 that decide it, quoted (`draft 26, 5.4.1: "..."`).
    pub decides: Vec<&'static str>,
    /// What it rests on: a ledger entry (title and time), or a row of a
    /// lead's note (path and row), or "the text alone".
    pub reading: Vec<String>,
    /// Items of encoding 3's section 11 it rests on, taken by the codemeister.
    pub choices: Vec<u8>,
    pub sc: Sc,
    pub ask: &'static str,
    pub args: Vec<Hash>,
    pub stubs: Vec<Asked>,
    pub answer: Ans,
    /// Further answers the same question gives (a second answer beside the
    /// first: "valid", then "not shown" as in force).
    pub also: Vec<Ans>,
}

pub const TEXT_ALONE: &str = "the text alone: no reading is needed";

fn ans_json(sc: &Sc, a: &Ans) -> J {
    json!({
        "word": a.word,
        "rule": a.rule,
        "qualifier": a.qualifier,
        "keepers_counted": a.counted.iter().map(|h| json!({ "keeper": v::hx(h), "label": sc.label(h) })).collect::<Vec<_>>(),
        "keepers_not_showing": a.not_showing.iter().map(|h| json!({ "keeper": v::hx(h), "label": sc.label(h) })).collect::<Vec<_>>(),
        "who": a.who.map(|h| json!({ "id": v::hx(&h), "label": sc.label(&h) })),
        "disputed": a.disputed,
        "reason": a.reason,
    })
}

pub fn case_json(c: &G) -> J {
    let sc = &c.sc;
    let mut reading = c.reading.clone();
    reading.extend(c.choices.iter().map(|&i| v::taken(i)));
    let mut identities: Vec<(String, String)> = sc.names.iter().filter(|(_, n)| n.starts_with("identity ")).map(|(h, n)| (n.clone(), v::hx(h))).collect();
    identities.sort();
    json!({
        "name": c.name,
        "part": c.part,
        "verifier_2_case": c.v2,
        "sheet_line": c.sheet,
        "status": c.status,
        "against_sheet": c.against_sheet,
        "tests": c.tests,
        "decides": c.decides,
        "reading": reading,
        "identities": identities.iter().map(|(n, h)| json!({ "label": n, "id": h })).collect::<Vec<_>>(),
        "acts": sc.acts.iter().map(v::act_json).collect::<Vec<_>>(),
        "not_held": sc.not_held.iter().map(|h| json!({ "id": v::hx(h), "label": sc.label(h) })).collect::<Vec<_>>(),
        "layers": {
            "keepers": sc.keepers.iter().map(|k| json!({
                "keeper": v::hx(&k.id),
                "label": format!("keeper {} (test)", k.label),
                "state": k.state,
                "records_held": k.records.iter().enumerate().map(|(i, r)| json!({
                    "signed_by": v::hx(&k.id),
                    "signature": v::hx(&g(&format!("keeper {}/record {i}/signature (stand-in)", k.label))),
                    "places": r.iter().enumerate().map(|(p, h)| json!({ "position": p + 1, "act": v::hx(h), "label": sc.label(h) })).collect::<Vec<_>>(),
                })).collect::<Vec<_>>(),
            })).collect::<Vec<_>>(),
            "clocks": sc.clocks,
            "money": sc.money,
            "envelope_chain": sc.chain,
        },
        "reader": {
            "anchoring": sc.anchoring.as_ref().map(|a| json!({ "id": v::hx(&a.id), "label": a.label, "order": a.order.iter().map(|h| json!({ "act": v::hx(h), "label": sc.label(h) })).collect::<Vec<_>>() })),
            "on_behalf_of": sc.on_behalf_of.map(|h| json!({ "id": v::hx(&h), "label": sc.label(&h) })),
        },
        "limits": sc.limits,
        "question": { "ask": c.ask, "args": c.args.iter().map(|h| json!({ "id": v::hx(h), "label": sc.label(h) })).collect::<Vec<_>>() },
        "stubs_asked": c.stubs.iter().map(|s| json!({ "task": s.task, "cmip": v::hx(&stub(s.stub)), "stub": s.stub, "asked": s.asked, "answered": s.answered })).collect::<Vec<_>>(),
        "answer": ans_json(sc, &c.answer),
        "also": c.also.iter().map(|a| ans_json(sc, a)).collect::<Vec<_>>(),
    })
}

/// A verifier 2 case retired: the rule that retires it, quoted.
pub struct Retired {
    pub v2: usize,
    pub rule: &'static str,
    pub says: Vec<&'static str>,
    pub reading: Vec<String>,
}

/// A case not written: waiting, with why.
pub struct Waiting {
    pub what: String,
    pub why: String,
}

#[derive(Default)]
pub struct Out {
    pub cases: Vec<G>,
    pub retired: Vec<Retired>,
    pub waiting: Vec<Waiting>,
}

pub const ASKS: &[(&str, &str)] = &[
    ("in_force", "args: [Terms act]. Whether those Terms are in force: `in force`, or `not shown` with the reason; `fork`; `unchecked`; `invalid` where the act is"),
    ("last_version", "args: [root]. Which Terms of the agreement are in force: `in force`, naming the version in `who`; `fork`; `unchecked`"),
    ("update", "args: [Terms act with `replaces`]. Its gate: `valid` (with the condition, or \"by default\"), `not valid`, `not shown` (an assent lacking), `late`, `fork`, `unchecked`; `also`: whether it is in force"),
    ("assent", "args: [assent]. `shown` (counted, its Terms in force, or a filling earned), `not shown` with the reason, `unchecked`"),
    ("counter_signature", "args: [counter signature]. `shown` (it cancels), `not shown` (late, or follows no assent), `fork`"),
    ("bound", "args: [person, act]. Whether that person is bound by that act (5.6.1): `shown`, `not shown`, `unchecked`"),
    ("signature_of", "args: [act]. Whether it is an agreement's signature (5.1.2): `shown`, naming the agreement, or `not shown`"),
    ("line", "args: [signer, root]. That signer's line within the agreement: `shown`, `fork`, `unchecked` before an act"),
    ("resolution", "args: [resolving update]. `valid` and `in force` (of Terms), `shown` (a line, or under a power to resolve), `not shown` with the reason"),
    ("order", "args: [B, A]. Whether B is shown after A (5.13.3, 5.13.4)"),
    ("receiver", "args: [root, version or none]. The receiver for an act (5.1.4): `shown`, naming a party, `not shown`, `unchecked`"),
    ("receiver_for_payment", "args: [payment]. The receiver for that payment (5.1.4)"),
    ("fillings", "args: [root, position]. Each filling of the spot at that position (5.10.2)"),
    ("takes_new", "args: [root, position]. Whether the spot still takes new identities: the task's output (5.10.5)"),
    ("rights", "args: [version, signer]. The version a filling was earned under, and each later version that changes what it earned (5.10.7)"),
    ("still_applies", "args: [version, signer]. Whether what a filling gave still applies: the task's output (K1, 5.10.8)"),
    ("holds_control", "args: [Terms]. Whether the Terms hold the Control task (5.11.2)"),
    ("data", "args: [report or settlement, reader]. The data task's output (K8, 5.11.5)"),
    ("before_paying", "args: [root]. Which agreements of a sequence carry a call (5.11.4)"),
    ("contest", "args: [contest]. Whom it reaches, and whether it is a buyer's or a baker's (5.11.8, 5.11.9)"),
    ("whole", "args: [Terms act]. What the verifier left unread (5.2.3)"),
    ("act", "args: [act]. Whether the act is invalid (§3.6, §4.4)"),
    ("placed", "args: [act, root]. Whether the act is placed per the keepers the Terms name (§3.4, 5.8.3)"),
];

/// Every grammar case, in draft 26's order within each part.
pub fn all() -> Out {
    let mut out = Out::default();
    from_v2::cases(&mut out);
    sheet_a::cases(&mut out);
    sheet_b::cases(&mut out);
    evening::cases(&mut out);
    out
}

/// Write `grammar.json` and `retired/grammar-retired.json` under `dir`
/// (the `agreements-26` directory).
pub fn write(dir: &Path) {
    let out = all();
    let mut names: Vec<&str> = out.cases.iter().map(|c| c.name.as_str()).collect();
    names.sort();
    let n = names.len();
    names.dedup();
    assert_eq!(n, names.len(), "two grammar cases share a name");
    v::write_file(dir, "grammar.json", &json!({
        "about": "The grammar verifier's answers under Agreements draft 26 (docs/agreements-from-scratch/draft-26.md, at b58e417), each case built from complete acts in the bytes of encoding 3, signed by test identities. Each case lists the acts held (label, id, complete bytes in hex, payload), acts named and not held, the stand-in tables of the other layers (each keeper's signed records the verifier holds a copy of, its state; clocks; Money; the envelope's chain), the reader, the question, what each stub cMIP was asked and what it answered, and the expected answer: its word, the grammar rule named, its qualifier, the keepers that counted and those not showing it, who it names, whether disputed. `also` gives further answers to the same question. Every answer is read from draft 26 with the ledger and the lead's notes, quoted in `decides` and named in `reading`, never from code: no grammar verifier of draft 26 exists yet. TEST DATA: every identity, keeper, clock, key, cMIP and record signature is a stand-in derived from a fixed label.",
        "spec": v::spec_json(),
        "asks": ASKS.iter().map(|(a, d)| json!({ "ask": a, "about": d })).collect::<Vec<_>>(),
        "stubs": stub::ALL.iter().map(|(t, n, p)| json!({ "task": t, "stub": n, "cmip": v::hx(&stub(n)), "parameters": p, "for": "tests only: answers from its own parameters, as a table" })).collect::<Vec<_>>(),
        "words": "Answer words are draft 26's (§3.6): shown, not shown, unchecked, invalid; valid, not valid (of a proposed update); in force (of Terms); fork; late. A task's output is passed on as the task's: \"yes (the task's output)\", \"no (the task's output)\". Qualifiers: as shown, per keeper, per clock, per anchoring, none.",
        "cases": out.cases.iter().map(case_json).collect::<Vec<_>>(),
        "waiting": out.waiting.iter().map(|w| json!({ "what": w.what, "why": w.why })).collect::<Vec<_>>(),
    }));
    let v2: J = serde_json::from_str(&std::fs::read_to_string(v::repo_root().join("core/vectors/agreements-new/grammar.json")).unwrap()).unwrap();
    v::write_file(dir, "retired/grammar-retired.json", &json!({
        "about": "Verifier 2's grammar cases that draft 26 retires, each copied whole from core/vectors/agreements-new/grammar.json (which stays as it is), with the rule that retires it, quoted, and what the retirement rests on. These answers are draft 25's; they are kept as a record, and no verifier of draft 26 is tested against them.",
        "cases": out.retired.iter().map(|r| json!({
            "from": "core/vectors/agreements-new/grammar.json",
            "index": r.v2,
            "retired_by": { "rule": r.rule, "says": r.says, "reading": r.reading },
            "case": v2["cases"][r.v2],
        })).collect::<Vec<_>>(),
    }));
}
