//! The builder of verifier 3's vectors: acts of Agreements draft 26 in the
//! bytes of encoding 3 (`docs/agreements-from-scratch/draft-26.md`,
//! `docs/agreements-from-scratch/encoding-3.md`), and the checker's vectors
//! written with it (`core/vectors/agreements-26/`).
//!
//! In plain words: this file writes acts as bytes. It does not check them.
//! No verifier of encoding 3 exists yet, and none is written here: every
//! answer a vector states is taken from the texts (encoding 3, draft 26, the
//! ledger, the lead's note), quoted beside it, never from code. The bytes
//! are the builder's; the answers are the texts'.
//!
//! Precisely:
//! - Every act is an everyday act of the act format in force (Envelopes,
//!   Part three), sealed and signed by the core's own functions
//!   (`act::make`, `SchnorrKey::sign`), in its signer's real sequence (`prev`,
//!   position, running summary), as verifier 2's builder does
//!   (`agreements_new.rs`), whose shape this file follows.
//! - Payloads are written as deterministic CBOR maps (`cbor::encode`), from
//!   the keys encoding 3 gives (sections 4 and 5). The builder writes any
//!   payload, so a vector can hold a fault on purpose.
//! - Every key, salt, nonce and content key is derived from a label: the
//!   files come out the same, byte for byte, each time they are written.
//!   **Test data**: every identity, binding, key, cMIP, keeper and clock here
//!   is a stand-in, the SHA-256 of a label beginning `agreements-26/` (or,
//!   for the reference payloads, `test:`). Nothing names a real identity,
//!   server or key.
//! - Draft 26 is not final. Its spec hash is one constant,
//!   [`SPEC_DRAFT_26`], checked against the file by a test
//!   (`core/tests/agreements_26_vectors.rs`) and again each time the vectors
//!   are written. When the file changes, change the constant and run
//!   `cargo run -q -p mor-core --example gen_vectors_26 --locked`: every file
//!   is written again. No answer depends on the hash's value.
//!
//! Where encoding 3 leaves a byte open (its section 11, "Open in this text,
//! not yet chosen"), the builder takes the codemeister's proposal
//! (`docs/code/impact-draft-26.md`, section 5) and says so beside the
//! choice, in the words "taken by the codemeister, to check: encoding 3,
//! section 11, item N". Each vector that rests on one says so too.

#![allow(dead_code)]

use mor_core::act::{self, Inside, Addressing, Sequence};
use mor_core::agreements_new as an;
use mor_core::cbor::{self, Value};
use mor_core::development::Spec;
use mor_core::hash::{sha256, tagged_hash_parts, Hash};
use mor_core::money;
use mor_core::sig::SchnorrKey;
use serde_json::{json, Value as J};
use std::cell::RefCell;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

// ================================================================ constants

const fn nib(c: u8) -> u8 {
    match c {
        b'0'..=b'9' => c - b'0',
        b'a'..=b'f' => c - b'a' + 10,
        _ => panic!("not lowercase hex"),
    }
}

const fn h32(s: &str) -> Hash {
    let b = s.as_bytes();
    assert!(b.len() == 64);
    let mut out = [0u8; 32];
    let mut i = 0;
    while i < 32 {
        out[i] = (nib(b[2 * i]) << 4) | nib(b[2 * i + 1]);
        i += 1;
    }
    out
}

/// Draft 26's spec hash (encoding 3, E2): `Spec::mir_file_hash` of
/// `docs/agreements-from-scratch/draft-26.md`, as the scribe's session P7
/// left it on branch `claude/draft-26-outline-vbtvu7` (commit b58e417; 436
/// lines, 158,140 bytes; plain sha256 `afadb7d5…4307`). The value encoding
/// 3, E2, gives. Taken by the codemeister, to check: encoding 3, section 11,
/// item 12 (`SPEC_DRAFT_26` computed from the file, with a test). If the file
/// changes again: change it here, and write the vectors again.
pub const SPEC_DRAFT_26: Hash = h32("eb8bfb8735a73517f44679d532098bb9779d0e1cc2092a0d3472f5ff223b6fcc");

/// The file [`SPEC_DRAFT_26`] is the hash of, from the repository root.
pub const DRAFT_26_FILE: &str = "docs/agreements-from-scratch/draft-26.md";

/// The two types of draft 26 (encoding 3, E2).
pub const TERMS: u64 = 0;
pub const STATEMENT: u64 = 1;

/// The tag of a set of acts. Taken by the codemeister, to check: encoding 3,
/// section 11, item 1 (the set's label: `MOR/act-set`).
pub const SET_LABEL: &str = "MOR/act-set";

/// Every Text draft's spec hash is `TEXT`, listed (E25). Taken by the
/// codemeister, to check: encoding 3, section 11, item 10. The list is the
/// Text drafts held in `spec/` as MIR files, each hashed as a MIR from its
/// file (E2's recipe). Drafts before 6, and the two files named
/// `MIP-text-draft-6.md` and `MIP-text-draft-7.md`, are not in it: which
/// files make the list is a question the build log carries.
pub const TEXT_FILES: &[(&str, &str)] = &[
    ("Text draft 6", "spec/MIR-text-draft-6.md"),
    ("Text draft 7", "spec/MIR-text-draft-7.md"),
    ("Text draft 8", "spec/MIR-text-draft-8.md"),
    ("Text draft 9", "spec/MIR-text-draft-9.md"),
    ("Text draft 10", "spec/MIR-text-draft-10.md"),
    ("Text draft 11", "spec/MIR-text-draft-11.md"),
];

/// The Money draft a payment is written under, for the vector that holds
/// one (its payload is no concern of the checker's: an act of another
/// specification).
pub const MONEY_FILE: &str = "spec/MIR-money-draft-14.md";

pub fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("..")
}

/// A MIR's spec hash from its file in the repository (E2's recipe,
/// `Spec::mir_file_hash`).
pub fn file_hash(rel: &str) -> Hash {
    let text = std::fs::read_to_string(repo_root().join(rel)).unwrap_or_else(|e| panic!("{rel}: {e}"));
    Spec::mir_file_hash(&text).unwrap_or_else(|e| panic!("{rel}: {e}"))
}

/// The spec hash of one Text draft of [`TEXT_FILES`], by its name.
pub fn text_hash(draft: &str) -> Hash {
    let (_, f) = TEXT_FILES.iter().find(|(n, _)| *n == draft).unwrap();
    file_hash(f)
}

pub fn text_11() -> Hash {
    text_hash("Text draft 11")
}

/// Panics, saying what to do, if [`SPEC_DRAFT_26`] is not the file's.
pub fn check_spec_hash() {
    let got = file_hash(DRAFT_26_FILE);
    assert_eq!(
        hex::encode(got),
        hex::encode(SPEC_DRAFT_26),
        "{DRAFT_26_FILE} has changed: set SPEC_DRAFT_26 in core/examples/support/agreements_26.rs to its new hash, then write the vectors again"
    );
}

// ================================================================ values

pub fn hx(b: &[u8]) -> String {
    hex::encode(b)
}

/// A stand-in fingerprint for the checker's vectors: test data.
pub fn fixed(label: &str) -> Hash {
    sha256(format!("agreements-26/{label}").as_bytes())
}

/// A stand-in fingerprint for the reference payloads: the SHA-256 of the
/// ASCII label as given (`test:ana`), test data.
pub fn test_fp(label: &str) -> Hash {
    sha256(label.as_bytes())
}

pub fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

pub fn u(n: u64) -> Value {
    Value::Uint(n)
}

pub fn arr(v: Vec<Value>) -> Value {
    Value::Array(v)
}

pub fn txt(s: &str) -> Value {
    Value::Text(s.into())
}

/// A set written in a field (E18): entries in the bytewise order of their
/// deterministic encodings, each once.
pub fn sorted_set(mut v: Vec<Value>) -> Value {
    v.sort_by_key(cbor::encode);
    v.dedup_by(|x, y| cbor::encode(x) == cbor::encode(y));
    Value::Array(v)
}

/// A socket (E7): `[cmip, params]`; `null` for a cMIP that takes none.
pub fn socket(cmip: &Hash, params: Value) -> Value {
    arr(vec![b(cmip), params])
}

/// The body (E8): `[words, socket]`, the words the Text act's act id.
pub fn body(words: &Hash, sock: Value) -> Value {
    arr(vec![b(words), sock])
}

/// A party named as a signer (E9).
pub fn party_signer(id: &Hash) -> Value {
    arr(vec![u(0), b(id)])
}

/// A party named as a role (E9, E10): the role's map, any of its three
/// fields left out where `None`.
pub fn party_role(sort: Option<u64>, what: Option<&Hash>, spot: Option<Value>) -> Value {
    let mut m = vec![];
    if let Some(s) = sort {
        m.push((u(0), u(s)));
    }
    if let Some(w) = what {
        m.push((u(1), b(w)));
    }
    if let Some(s) = spot {
        m.push((u(2), s));
    }
    arr(vec![u(1), Value::Map(m)])
}

/// The keeper field, key 8. Taken by the codemeister, to check: encoding 3,
/// section 11, item 5 (one form, a list always: `[+ hash]`, one keeper a
/// list of one) and item 6 (the list a set: sorted, each keeper once). Each
/// entry is the keeper's identifier, its identity hash: taken by the
/// codemeister, to check: encoding 3, section 11, item 7 (here, stand-ins).
pub fn keeper(ids: &[Hash]) -> Value {
    sorted_set(ids.iter().map(b).collect())
}

/// The value of a set of acts (encoding 3, "The set of acts", steps 1 to 5):
/// the act ids sorted bytewise, repeats dropped, concatenated, and hashed
/// with the set's label. Taken by the codemeister, to check: encoding 3,
/// section 11, item 1 (the label `MOR/act-set`), item 2 (the members
/// concatenated, 32 bytes after 32 bytes, nothing between; the empty set
/// the label over no bytes) and item 3 (the rule its own E-rule, E26).
pub fn set_value(ids: &[Hash]) -> Hash {
    let mut v: Vec<Hash> = ids.to_vec();
    v.sort();
    v.dedup();
    let parts: Vec<&[u8]> = v.iter().map(|h| h.as_slice()).collect();
    tagged_hash_parts(SET_LABEL, &parts)
}

// ================================================================ payloads

/// The keys of a Terms payload (encoding 3, section 4).
pub mod tk {
    pub const REPLACES: u64 = 0;
    pub const AGREEMENT: u64 = 1;
    pub const PARTIES: u64 = 2;
    pub const AUTHORS: u64 = 3;
    pub const BODY: u64 = 4;
    pub const RELIES_ON: u64 = 5;
    pub const IN_FORCE: u64 = 6;
    pub const POWERS: u64 = 7;
    pub const KEEPER: u64 = 8;
    pub const CLOCK: u64 = 9;
    pub const RECEIVER: u64 = 10;
    pub const ENVELOPE: u64 = 11;
    pub const ENVELOPE_AT: u64 = 12;
    pub const CONDITION: u64 = 13;
    pub const CONTROL: u64 = 14;
    pub const CALLS: u64 = 15;
    pub const DATA: u64 = 16;
    pub const RESOLVES: u64 = 17;
    pub const CONTINUES: u64 = 18;
    pub const PREVIOUS: u64 = 19;
    /// The keepers' cMIP (task K9), a socket beside key 8. Taken by the
    /// codemeister, to check: encoding 3, section 11, item 15 (key 20; an
    /// empty socket is the field left out; written only beside key 8, and
    /// never on a resolving update, E19).
    pub const KEEPERS_CMIP: u64 = 20;
}

/// The keys of a Statement payload (encoding 3, section 5).
pub mod sk {
    pub const AGREEMENT: u64 = 0;
    pub const TERMS: u64 = 1;
    pub const KIND: u64 = 2;
    pub const CONTENT: u64 = 3;
    pub const FOR: u64 = 4;
    pub const UNDER: u64 = 5;
    pub const PREVIOUS: u64 = 6;
    pub const ANSWERS: u64 = 7;
    pub const RELIES_ON: u64 = 8;
    pub const SETTLEMENT: u64 = 9;
    pub const RESOLVES: u64 = 10;
    pub const CONTINUES: u64 = 11;
}

/// A Statement's kinds (E15).
pub mod kind {
    pub const ASSENT: u64 = 0;
    pub const COUNTER_SIGNATURE: u64 = 1;
    pub const CONTEST: u64 = 2;
    pub const RESOLVE: u64 = 3;
}

/// A payload: a closed map of small unsigned keys (E4). `cbor::encode`
/// sorts the keys, so the order given here is not the order written.
#[derive(Clone, Debug, Default)]
pub struct P(pub Vec<(u64, Value)>);

impl P {
    pub fn new() -> Self {
        P(vec![])
    }

    /// Set one key (replacing it where it is already set).
    pub fn set(mut self, k: u64, v: Value) -> Self {
        self.0.retain(|(x, _)| *x != k);
        self.0.push((k, v));
        self
    }

    /// Take one key out.
    pub fn drop(mut self, k: u64) -> Self {
        self.0.retain(|(x, _)| *x != k);
        self
    }

    pub fn entries(&self) -> Vec<(Value, Value)> {
        self.0.iter().map(|(k, v)| (u(*k), v.clone())).collect()
    }

    /// The payload's bytes, as they stand in the act's inside.
    pub fn bytes(&self) -> Vec<u8> {
        cbor::encode(&Value::Map(self.entries()))
    }
}

/// `previous` (E17): `[]` for none, `[h]` for one.
pub fn previous(h: Option<&Hash>) -> Value {
    arr(h.into_iter().map(b).collect())
}

/// A first Terms act: one party, a signer, who is its author; the words;
/// `previous` `[]` (the author's first act within the agreement, E17).
pub fn first_terms(signer: &Hash, words: &Hash, reader: &Hash) -> P {
    P::new()
        .set(tk::PARTIES, arr(vec![party_signer(signer)]))
        .set(tk::AUTHORS, arr(vec![u(0)]))
        .set(tk::BODY, body(words, socket(reader, Value::Null)))
        .set(tk::PREVIOUS, previous(None))
}

/// An update of `root` (its version replaced being `replaces`), naming the
/// signer's act before it within the agreement.
pub fn update(base: P, replaces: &Hash, root: &Hash, prev: &Hash) -> P {
    base.set(tk::REPLACES, b(replaces)).set(tk::AGREEMENT, b(root)).set(tk::PREVIOUS, previous(Some(prev)))
}

/// A Statement of one of the four kinds of E15.
pub fn statement(agreement: &Hash, terms: &Hash, k: u64, prev: Option<&Hash>) -> P {
    P::new().set(sk::AGREEMENT, b(agreement)).set(sk::TERMS, b(terms)).set(sk::KIND, u(k)).set(sk::PREVIOUS, previous(prev))
}

/// A Text act's payload (Text draft 11, Part three): `{0: text}`.
pub fn text_payload(s: &str) -> P {
    P::new().set(0, txt(s))
}

// ================================================================ acts

thread_local! {
    /// Each test identity's sequence, as far as it has been written.
    static SEQUENCES: RefCell<HashMap<Hash, Sequence>> = RefCell::new(HashMap::new());
}

/// Start every sequence afresh (one run of the generator writes them once).
pub fn reset() {
    SEQUENCES.with(|s| s.borrow_mut().clear());
}

/// A test identity: a stand-in identity hash, a binding, and a signing key
/// derived from its label. Test data.
#[derive(Clone)]
pub struct Tid {
    pub id: Hash,
    pub binding: Hash,
    pub key: SchnorrKey,
}

pub fn tid(label: &str) -> Tid {
    Tid {
        id: fixed(&format!("test identity {label}")),
        binding: fixed(&format!("test identity {label}/binding")),
        key: SchnorrKey::from_secret(&fixed(&format!("test identity {label}/signing secret"))).unwrap(),
    }
}

/// How an act is written: the parts of the act format a vector varies.
pub struct Make<'a> {
    pub label: &'a str,
    pub who: &'a Tid,
    pub spec: Hash,
    pub type_: u64,
    pub payload: P,
    pub public: bool,
}

/// An act written: its bytes, its act id, its content key where it is
/// private, and its payload's bytes.
#[derive(Clone)]
pub struct Made {
    pub label: String,
    pub bytes: Vec<u8>,
    pub id: Hash,
    pub key: Option<[u8; 32]>,
    pub payload: Vec<u8>,
}

impl Made {
    /// The same act, handed over without its content key.
    pub fn without_key(&self) -> Made {
        Made { key: None, ..self.clone() }
    }
}

/// Seal and sign an everyday act, the next in its signer's sequence (E1):
/// `prev` its signer's act before it (`[]` for the first), its position
/// counting from 1, its running summary over every act before it.
pub fn make(m: Make) -> Made {
    make_full(m, None)
}

/// As [`make`], the act's inside carrying `acks` (for a Text act that its
/// own Text draft makes invalid: "A text act carrying `acks` is invalid",
/// Text draft 11, Part three).
pub fn make_full(m: Make, acks: Option<Vec<Hash>>) -> Made {
    let (prev, position, summary) = SEQUENCES.with(|s| {
        let s = s.borrow();
        let q = s.get(&m.who.id);
        (q.and_then(|q| q.last().copied()), q.map_or(0, Sequence::len) + 1, q.map_or([0; 32], Sequence::summary))
    });
    let inside = Inside {
        spec: m.spec,
        type_: m.type_,
        prev: Some(prev.into_iter().collect()),
        objects: None,
        payload: m.payload.entries(),
        position: Some(position),
        summary: Some(summary),
        acks,
        refs: None,
        hint: None,
        salt: fixed(&format!("{}/salt", m.label))[..16].try_into().unwrap(),
    };
    let key = fixed(&format!("{}/content key", m.label));
    let nonce: [u8; 24] = fixed(&format!("{}/nonce", m.label))[..24].try_into().unwrap();
    let addr = Addressing { signer: Some(m.who.id), binding: Some(m.who.binding), public: m.public, to: None };
    let aux = fixed(&format!("{}/aux", m.label));
    let a = act::make(&inside, &key, &nonce, &addr, |id| m.who.key.sign(id, &aux));
    SEQUENCES.with(|s| {
        let mut s = s.borrow_mut();
        let q = s.entry(m.who.id).or_default();
        q.check_next(&inside).expect("the act is the next of its signer's sequence");
        q.append(&a.id(), &inside).unwrap();
    });
    Made { label: m.label.into(), bytes: a.encode(), id: a.id(), key: (!m.public).then_some(key), payload: m.payload.bytes() }
}

/// A public act under draft 26's spec hash.
pub fn act26(label: &str, who: &Tid, type_: u64, payload: P) -> Made {
    make(Make { label, who, spec: SPEC_DRAFT_26, type_, payload, public: true })
}

pub fn terms_act(label: &str, who: &Tid, payload: P) -> Made {
    act26(label, who, TERMS, payload)
}

pub fn statement_act(label: &str, who: &Tid, payload: P) -> Made {
    act26(label, who, STATEMENT, payload)
}

/// A Text act: type 0 under a Text draft's spec hash, its payload `{0: text}`.
pub fn text_act(label: &str, who: &Tid, spec: Hash, words: &str, public: bool) -> Made {
    make(Make { label, who, spec, type_: 0, payload: text_payload(words), public })
}

/// A payment: a Money claim (type 3, signed by the payer) under Money draft
/// 14's spec hash, its payload written by the core library's Money builder.
/// The checker reads none of it: it is an act of another specification.
pub fn payment_act(label: &str, who: &Tid, payee: &Hash, fulfils: &Hash) -> Made {
    let claim = money::Payload::Claim(money::Claim {
        rail: fixed("a rail Module (stand-in)"),
        proof: fixed("a rail's proof (stand-in)").to_vec(),
        payee: *payee,
        amount: money::Amount { unit: fixed("a unit (stand-in)"), value: 1000 },
        fulfils: *fulfils,
        disagrees: None,
        referral: None,
        refund: None,
        purchase: None,
        previous: None,
    });
    let payload = P(claim.to_map().into_iter().map(|(k, v)| (if let Value::Uint(k) = k { k } else { unreachable!() }, v)).collect());
    make(Make { label, who, spec: file_hash(MONEY_FILE), type_: claim.type_(), payload, public: true })
}

// ================================================================ the vectors' shape

/// What the checker must answer about the last act of a case (encoding 3,
/// section 9, "The answer is written"): its verdict, the rule named, every
/// case of invalid found (in step 7's order) and the notes.
pub struct Want<'a> {
    pub verdict: &'a str,
    pub rule: Option<&'a str>,
    pub invalid: &'a [&'a str],
    pub notes: &'a [&'a str],
}

pub const PASS: Want<'static> = Want { verdict: "pass", rule: None, invalid: &[], notes: &[] };

pub fn rejected(rule: &str) -> Want<'_> {
    Want { verdict: "rejected", rule: Some(rule), invalid: &[], notes: &[] }
}

/// One vector: what it holds, what it must answer, and why.
pub struct Case<'a> {
    pub name: &'a str,
    /// The sheet's line (`docs/code/impact-draft-26.md`, section 4).
    pub line: &'a str,
    pub acts: Vec<&'a Made>,
    pub want: Want<'a>,
    /// The sentence of the text that decides it, quoted, with where it is.
    pub decides: &'a [&'a str],
    /// The reading it rests on: a ledger entry, a row of the lead's note,
    /// or a choice taken by the codemeister.
    pub reading: &'a [&'a str],
    /// The items of encoding 3's section 11 it rests on, taken by the
    /// codemeister.
    pub choices: &'a [u8],
}

pub fn taken(item: u8) -> String {
    format!("taken by the codemeister, to check: encoding 3, section 11, item {item}")
}

pub fn act_json(m: &Made) -> J {
    json!({ "label": m.label, "id": hx(&m.id), "bytes": hx(&m.bytes), "key": m.key.map(|k| hx(&k)), "payload": hx(&m.payload) })
}

pub fn case_json(c: &Case) -> J {
    let mut reading: Vec<String> = c.reading.iter().map(|s| s.to_string()).collect();
    reading.extend(c.choices.iter().map(|&i| taken(i)));
    json!({
        "name": c.name,
        "line": c.line,
        "acts": c.acts.iter().map(|m| act_json(m)).collect::<Vec<_>>(),
        "answer": {
            "verdict": c.want.verdict,
            "rule": c.want.rule,
            "invalid": c.want.invalid,
            "notes": c.want.notes,
        },
        "decides": c.decides,
        "reading": reading,
    })
}

pub fn spec_json() -> J {
    json!({
        "draft_26": hx(&SPEC_DRAFT_26),
        "draft_26_file": DRAFT_26_FILE,
        "draft_26_is_final": false,
        "types": { "terms": TERMS, "statement": STATEMENT },
        "text": TEXT_FILES.iter().map(|(n, f)| json!({ "draft": n, "file": f, "spec": hx(&file_hash(f)) })).collect::<Vec<_>>(),
        "text_reading": taken(10),
        "set_label": SET_LABEL,
        "set_reading": [taken(1), taken(2), taken(3)],
        "not_this_encoding": { "draft_25": hx(&an::SPEC_DRAFT_25), "report_block_4": hx(&an::SPEC_REPORT_BLOCK_4) },
    })
}

pub fn write_file(dir: &Path, name: &str, v: &J) {
    let s = serde_json::to_string_pretty(v).unwrap() + "\n";
    if let Some(p) = dir.join(name).parent() {
        std::fs::create_dir_all(p).unwrap();
    }
    std::fs::write(dir.join(name), s).unwrap();
}

// ================================================================ the vectors

/// Write every file of `core/vectors/agreements-26/` under `dir`.
pub fn write(dir: &Path) {
    check_spec_hash();
    reset();
    let dir = dir.join("agreements-26");
    std::fs::create_dir_all(&dir).unwrap();
    write_checker(&dir);
    write_sets(&dir);
    write_reference(&dir);
    write_retired(&dir);
}

const Q_E2: &str = "encoding 3, E2: \"An act under any other spec hash is **not this encoding**.\"";
const Q_E2_OLD: &str = "encoding 3, E2: \"Encoding 2's hashes (draft 25's, `dd90f8af…`, and the report block's fourth proposal's, `7b65c60f…`) and encoding 1's name other specifications: an act under them is **not this encoding**.\"";
const Q_E2_REPORT: &str = "encoding 3, E2: \"*A report is not one of draft 26's act types (draft 26, §4.3: \"one act type, defined once, in the MICS's report block\"): it is written under the MICS's hash and type, by the MICS's bytes, and this checker answers a report **not this encoding**.*\"";
const Q_STEP3: &str = "encoding 3, section 9, step 3: \"Its spec hash and type (E2): another spec, **not this encoding**; another type, **rejected**, E2.\"";
const Q_KEEPER_I: &str = "encoding 3, section 4, \"Key 8, the keeper field\": \"keeper = [+ hash]              ; one keeper is a list of one; sorted, each keeper once (E18)\"";
const Q_KEY8: &str = "encoding 3, section 4, \"Key 8, the keeper field\": \"One keeper and several are written the same way. A bare `hash` in key 8, or any form but a list of identifiers, is rejected under E6, the rule that gives the keeper's form; an empty list, one out of order, or one keeper twice, under E18.\"";
const Q_E6: &str = "encoding 3, E6: \"of a keeper or of a clock is `hash`. Anything else is rejected, under E6.\"";
const Q_FAULT_E6: &str = "encoding 3, section 9, \"One fault, one rule\": \"E6 for a keeper and a clock (key 8's form: a list of identifiers, section 4)\"";
const Q_FAULT_E18: &str = "encoding 3, section 9, \"One fault, one rule\": \"E18 for a list's emptiness, order and repeats\"";
const Q_E18_EMPTY: &str = "encoding 3, E18: \"A list with nothing in it is left out: absent means none (no power, no call, no keeper, nothing relied on). An empty list is rejected.\"";
const Q_E18_SET: &str = "encoding 3, E18: \"An entry out of order, or twice, is rejected.\"";
const Q_E19_RESOLVING: &str = "encoding 3, E19: \"One that lacks `replaces`, or carries any other field (`parties`, `authors`, `body`, `in_force`, `keeper`, `clock`, the receiver, a socket, anything), is rejected (§4.3: \"it carries nothing else\").\"";
const Q_D26_RESOLVING: &str = "draft 26, §4.3, \"What a resolving update carries\": \"A Terms act written as a resolving update (with `resolves` and `continues`) carries `replaces`, `agreement`, `resolves`, `continues` and `previous`, and MAY carry `relies_on` (§5.13); it carries nothing else.\"";
const Q_NOTE_IN_FORCE: &str = "encoding 3, section 4, \"Notes the checker gives\": \"`in_force` in a Terms act that carries `replaces`, its answer on coming into force left unread, still read for who fills a role (5.2.3, 5.4.2)\"";
const Q_523: &str = "draft 26, 5.2.3: \"and the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (5.4.2, §5.5). A verifier says of each that it left it unread.\"";
const Q_542: &str = "draft 26, 5.4.2: \"Terms that name a party by role MUST carry `in_force`, in every version: an update that names a party by role carries it too.\"";
const Q_571: &str = "draft 26, 5.7.1: \"An act whose `previous` names, among the acts held, anything that is not an act of the same signer within the same agreement (an act of another signer, or of another agreement; a report; a payment; any record that is no Terms act and no Statement) is **invalid** (§3.6).\"";
const Q_E23_TEXT: &str = "encoding 3, E23: \"Otherwise the act is **invalid** (5.7.1): `previous` names an act of another signer, an act within another agreement, a report, a payment, an act of another specification (a Text act among them), or an act held that is **rejected**\"";
const Q_522: &str = "draft 26, 5.2.2: \"Where the act `body` names is held and is not a Text act, the Terms are **invalid**: they lack what they need.\"";
const Q_E25_TEXT: &str = "encoding 3, E25: \"A Text act is an act under a Text spec hash, `TEXT` (below), of type 0, whose payload is as that Text draft's Part three gives it (Text, rule 14 and \"Text act (type 0)\").\"";
const Q_E25_FOUND: &str = "encoding 3, E25: \"Where the act it names is held, opens, and is a **Text act**, nothing is found.\"";
const Q_E25_NOT: &str = "encoding 3, E25: \"Where the act it names is held, opens, and is not a Text act (an act under another spec hash, of another type, or with a payload Text does not give), the Terms are **invalid**\"";
const Q_E25_NOT_HELD: &str = "encoding 3, E25: \"Where the act it names is **not held**, or is held and **cannot be opened** (a private Text act, held without its key), the Terms are **not invalid** ... The checker passes the act with a note naming 5.2.2 and the act lacking, by its act id, and whether it is not held or held and not opened\"";
const Q_E25_PRIVATE: &str = Q_E25_NOT_HELD;
const Q_522_LACK: &str = "draft 26, 5.2.2: \"Where that act is not held, or is held and cannot be opened, whether the Terms are invalid under this rule is **unchecked**, with a note of what is lacking; where several acts are checked together, the note names each.\"";
const Q_NOTE_RULE: &str = "encoding 3, section 9, \"One fault, one rule\": \"the note on the words (E25) names 5.2.2\"";
const Q_UNCHECKED: &str = "draft 26, §3.6: \"**Unchecked**: the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, an act named in a field that it does not hold, or a keeper's record that it does not hold. A missing act never becomes a yes, and never a no.\"";
const Q_E25_TEXT_LIST: &str = "encoding 3, E25: \"**`TEXT`**: the spec hash of any draft of Text, each listed here.\"";
const Q_TEXT_11: &str = "Text draft 11, Part three: \"a text act with no field 0, a byte string in field 0, a field 2, or type 7 under `TEXT` is not a text act anywhere.\"";
const Q_ORDER: &str = "draft 26, §4.4, case 2: \"*Invalid*, under §5.2: the body's words, then the cMIP of the body's socket, ... not named by fingerprint; then the act `body` names, held and not a Text act.\"";
const Q_ORDER3: &str = "draft 26, §4.4, case 3: \"*Invalid*, for each role in `parties`, in their order: its sort lacking or not one of the five, then its `what` lacking or not a fingerprint (but for sort future), then its spot's cMIP lacking (§5.10), or not named by fingerprint (§5.2).\"";
const Q_STEP7: &str = "encoding 3, section 9, step 7: \"**Invalid** (draft 26, §4.4, cases 2 to 8), every case found listed in `invalid`, in this order, and `rule` the first of them\"";
const Q_E10_SORT: &str = "encoding 3, E10: \"a role with no sort, or a sort that is not an unsigned integer from 0 to 4, is read as lacking it; ... each makes the Terms invalid (5.10.1)\"";
const Q_SET_FIELD: &str = "encoding 3, \"The set of acts\": \"The checker cannot tell a set's value from an act id by its bytes: where one stands in a field that holds act ids (an entry of `relies_on`, say), it is read as an act id, which no act held has.\"";
const Q_ONE_ACT: &str = "encoding 3, section 7: \"A checker handed several acts reads them as the acts a verifier holds. It reads two things among them: what `previous` names (E23), and what `body` names (E25).\" One act is handed here, so neither is read.";

const Q_531_MUST: &str = "draft 26, 5.3.1: \"`authors` MUST name one or more of the parties these Terms name, each named as a signer: an author is never a party named by role, and never one named as an agreement (§3.2).\"";
const Q_531_INVALID: &str = "draft 26, 5.3.1: \"Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, are **invalid**; so are Terms that carry `parties` and whose signer is not one of the parties they name as signers.\"";
const Q_531_SIGNER: &str = "draft 26, 5.3.1: \"The signer of a Terms act is its first author, whether or not `authors` names them: `authors` names the other authors, and MAY name the signer too. No Terms are invalid for leaving their signer out of `authors`.\"";
const Q_CASE5: &str = "draft 26, §4.4, case 5: \"*Invalid*, under §5.3: Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, in the order of `authors`; then Terms whose signer is not one of the parties they name as signers.\"";
const Q_STEP74: &str = "encoding 3, section 9, step 7: \"case 5, 5.3.1: each author at fault, in the order of `authors`; then the act's signer named by no party `[0, signer]`\"";
const Q_E13_SIGNER: &str = "encoding 3, E13: \"Where the act's signer is the `signer` of no party `[0, signer]` in `parties`, the Terms are **invalid**, at §4.4's case 5, after the authors\"";
const Q_521: &str = "draft 26, 5.2.1: \"The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.\"";
const Q_D26_K9: &str = "draft 26, §4.2, `keeper`: \"Beside them, a socket (task K9): the cMIP that says how many of them must show an act; empty means every keeper named (5.8.3)\"";
const Q_D26_K9_533: &str = "draft 26, 5.8.3: \"Where the Terms name several keepers, how many of them must show an act is said by the cMIP the same Terms name beside them (task K9); where that socket is empty, every keeper named is needed.\"";
const Q_D26_NEW_ACT: &str = "draft 26, 5.8.3: \"What its parties do next is a new agreement: a new first act, which MAY name the earlier agreement, and is not an update of it and no fork with it (5.4.1, §5.12).\"";
const Q_E14_OPEN: &str = "encoding 3, section 11, item 14: \"`agreement` (key 1) is carried exactly when `replaces` is (§4.2), so a first act does not carry it.\"";
const R_LEAD_SIGNER: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C1, S: \"The signer is the first author whether or not listed; `authors` names the others; no Terms are invalid for leaving the signer out.\" The lead's reading, resting on the ledger's \"The signer of a Terms act is an author\" (27 November, 16:48–16:50) and its correction";
const R_LEAD_NO_PARTY: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), the seven, row 6: \"A Terms act signed by someone who is not a party is invalid.\" The lead's reading, resting on the ledger's \"There is no unsigned act: the author is a known party\" (27 November, 07:13–07:18)";
const R_K9_HIS: &str = "the ledger, \"Keepers: cross verification by default, a socket to lift it\" (27 November, 23:52, to 28 November, 00:00): \"Agreed, and there is a socket to lift it. (Which needs to be in the header)\"";
const R_NEW_ACT_HIS: &str = "the ledger, \"A dead keeper: the agreement is dead; what follows is a new act\" (27 November, 22:36): \"So, whatever they do next is a new act, a new agreement, that can point to the dead one if they wish to show lineage\"";
const R_LEAD_KEEPER: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C8, C35, C34: \"One form, always a list, sorted, each once; key 9 (the clock) kept, 32 bytes.\" The lead's reading, resting on the ledger's \"More than one place\" and \"Ana's month ends by the clock\"";
const R_LEAD_WORDS: &str = "the lead's note of 27 November, row C16, F11: \"Unchecked, with a note of what is lacking; several acts checked together, the note names each.\" The lead's reading, resting on the ledger's \"Missing act is always I don't know\" (27 November, \"Knots are knots\")";
const R_LEAD_TEXT: &str = "the lead's note of 27 November, row C33, F15: \"Every Text draft, listed in encoding 3; after the Development change, the words act is named by id and the list goes.\" The lead's reading";
const R_LEAD_SET: &str = "the lead's note of 27 November, row C36, C45, F14: \"No grammar field holds a set's value for now; a cMIP's parameters may.\" The lead's reading, resting on the ledger's \"One way to name a set of acts\"";
const R_TEXT: &str = "the text alone: no choice is needed";
const R_NOTE_NAME: &str = "the note named 5.2.2, as encoding 3's \"One fault, one rule\" now names it, on the lead's answer 2 to the codemeister of 20:41 (docs/lead/notes/2026-11-27-readings-for-p2.md): \"5.2.2 names the fault on a words note: the rule that names it is 5.2.2.\" The lead's reading";

fn write_checker(dir: &Path) {
    let a = tid("A");
    let bb = tid("B");
    let reader = fixed("cMIP: body reader (stand-in)");
    let t11 = text_11();

    // ================================================================ the agreement most acts are made in
    // A publishes the words as a Text act, then the first Terms act naming
    // them; B assents. The words come first (5.2.2: "The Text act comes
    // first").
    let words = text_act("words/root", &a, t11, "The words of these Terms (test).", true);
    let root_p = first_terms(&a.id, &words.id, &reader);
    let root = terms_act("terms/root", &a, root_p.clone());
    let agr = root.id;
    let b_assent = statement_act("statement/B's assent", &bb, statement(&agr, &root.id, kind::ASSENT, None));

    let mut valid: Vec<J> = vec![];
    let mut invalid: Vec<J> = vec![];
    let push = |out: &mut Vec<J>, c: Case| out.push(case_json(&c));

    // ---------------------------------------------------------------- line 83: a set's value in relies_on
    let set = set_value(&[root.id, words.id]);
    let p = statement(&agr, &root.id, kind::CONTEST, Some(&b_assent.id)).set(sk::RELIES_ON, arr(vec![b(&set)]));
    let m = statement_act("statement/a set in relies_on", &bb, p);
    push(&mut valid, Case {
        name: "statement: an entry of relies_on holding a set's value (of the root and its words), nothing else held: read as an act id, which no act held has",
        line: "83",
        acts: vec![&m],
        want: PASS,
        decides: &[Q_SET_FIELD, Q_ONE_ACT],
        reading: &[R_LEAD_SET, "the set's value computed as the builder computes it (items 1 to 3); the answer does not depend on its bytes"],
        choices: &[4],
    });

    // ---------------------------------------------------------------- line 85: the keeper field
    let k1 = fixed("a keeper's identity (stand-in) 1");
    let k2 = fixed("a keeper's identity (stand-in) 2");
    let (lo, hi) = if k1 < k2 { (k1, k2) } else { (k2, k1) };
    let w = |label: &str| text_act(&format!("words/{label}"), &a, t11, &format!("The words of {label} (test)."), true);

    let wk = w("one keeper");
    let m = terms_act("terms/one keeper", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, keeper(&[k1])));
    push(&mut valid, Case {
        name: "terms: one keeper, written as a list of one",
        line: "85 (1 of 7)",
        acts: vec![&m],
        want: PASS,
        decides: &[Q_KEEPER_I],
        reading: &[R_LEAD_KEEPER],
        choices: &[5, 7],
    });
    let wk = w("two keepers");
    let m = terms_act("terms/two keepers", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, arr(vec![b(&lo), b(&hi)])));
    push(&mut valid, Case {
        name: "terms: two keepers, in the bytewise order of their encodings",
        line: "85 (3 of 7)",
        acts: vec![&m],
        want: PASS,
        decides: &[Q_KEEPER_I, "encoding 3, E18: \"**Sets are sorted.** ... their entries are in the bytewise lexicographic order of their deterministic encodings\""],
        reading: &[R_LEAD_KEEPER],
        choices: &[5, 6, 7],
    });
    let wk = w("keeper bare");
    let m = terms_act("terms/keeper bare", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, b(&k1)));
    push(&mut invalid, Case {
        name: "terms: one keeper written bare, 32 bytes, not a list",
        line: "85 (2 of 7)",
        acts: vec![&m],
        want: rejected("E6"),
        decides: &[Q_KEY8, Q_FAULT_E6],
        reading: &[R_LEAD_KEEPER],
        choices: &[5],
    });
    let wk = w("keepers out of order");
    let m = terms_act("terms/keepers out of order", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, arr(vec![b(&hi), b(&lo)])));
    push(&mut invalid, Case {
        name: "terms: two keepers out of order",
        line: "85 (4 of 7)",
        acts: vec![&m],
        want: rejected("E18"),
        decides: &[Q_E18_SET, Q_FAULT_E18],
        reading: &[R_LEAD_KEEPER],
        choices: &[6],
    });
    let wk = w("keeper twice");
    let m = terms_act("terms/keeper twice", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, arr(vec![b(&k1), b(&k1)])));
    push(&mut invalid, Case {
        name: "terms: the same keeper twice",
        line: "85 (5 of 7)",
        acts: vec![&m],
        want: rejected("E18"),
        decides: &[Q_E18_SET, Q_FAULT_E18],
        reading: &[R_LEAD_KEEPER],
        choices: &[6],
    });
    let wk = w("keepers empty");
    let m = terms_act("terms/keepers empty", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, arr(vec![])));
    push(&mut invalid, Case {
        name: "terms: an empty list of keepers",
        line: "85 (6 of 7)",
        acts: vec![&m],
        want: rejected("E18"),
        decides: &[Q_E18_EMPTY, Q_FAULT_E18],
        reading: &[R_LEAD_KEEPER, "E18, not E6: \"One fault, one rule\" names E18 for a list's emptiness; the sheet's line 85 gives \"E18 (or E6)\". The codemeister's reading of the text, to check"],
        choices: &[5],
    });
    let wk = w("keeper short");
    let m = terms_act("terms/keeper short", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, arr(vec![Value::Bytes(k1[..31].to_vec())])));
    push(&mut invalid, Case {
        name: "terms: a keeper whose identifier is 31 bytes",
        line: "85 (7 of 7)",
        acts: vec![&m],
        want: rejected("E6"),
        decides: &[Q_E6, Q_FAULT_E6],
        reading: &[R_LEAD_KEEPER],
        choices: &[5],
    });

    // ---------------------------------------------------------------- line 86: a resolving update carries no keeper, no clock
    let tip1 = fixed("a tip of a fork of Terms (stand-in) 1");
    let tip2 = fixed("a tip of a fork of Terms (stand-in) 2");
    let resolving = P::new()
        .set(tk::REPLACES, b(&root.id))
        .set(tk::AGREEMENT, b(&agr))
        .set(tk::RESOLVES, sorted_set(vec![b(&tip1), b(&tip2)]))
        .set(tk::CONTINUES, b(&tip1))
        .set(tk::PREVIOUS, previous(Some(&root.id)));
    let m = terms_act("terms/resolving with keeper", &a, resolving.clone().set(tk::KEEPER, keeper(&[k1])));
    push(&mut invalid, Case {
        name: "terms: a resolving update carrying a keeper",
        line: "86 (1 of 2)",
        acts: vec![&m],
        want: rejected("E19"),
        decides: &[Q_E19_RESOLVING, Q_D26_RESOLVING],
        reading: &[R_TEXT, "the keeper written as a list, so that the field's only fault is its presence"],
        choices: &[5],
    });
    let m = terms_act("terms/resolving with clock", &a, resolving.clone().set(tk::CLOCK, b(&fixed("a clock's identifier (stand-in)"))));
    push(&mut invalid, Case {
        name: "terms: a resolving update carrying a clock",
        line: "86 (2 of 2)",
        acts: vec![&m],
        want: rejected("E19"),
        decides: &[Q_E19_RESOLVING, Q_D26_RESOLVING],
        reading: &[R_TEXT, "the clock written as 32 bytes"],
        choices: &[8],
    });

    // ---------------------------------------------------------------- line 87: an update carrying in_force
    let in_force = socket(&fixed("cMIP: in force (stand-in)"), Value::Null);
    let m = terms_act("terms/update with in_force", &a, update(root_p.clone(), &root.id, &agr, &root.id).set(tk::IN_FORCE, in_force.clone()));
    push(&mut valid, Case {
        name: "terms: an update carrying in_force: its answer on coming into force left unread",
        line: "87",
        acts: vec![&m],
        want: Want { verdict: "pass", rule: None, invalid: &[], notes: &["5.2.3"] },
        decides: &[Q_NOTE_IN_FORCE, Q_523],
        reading: &[R_TEXT, "the note named 5.2.3, as encoding 3's list of notes cites it first; draft 26's 5.4.2 also points to 5.5.1, which the scribe's closing pass changes (a question in the build log)"],
        choices: &[],
    });

    // ---------------------------------------------------------------- line 88: an update naming a role, no in_force
    let role = party_role(Some(0), Some(&fixed("what: a deed (stand-in)")), Some(socket(&fixed("cMIP: spot (stand-in)"), Value::Null)));
    let p = update(root_p.clone(), &root.id, &agr, &root.id).set(tk::PARTIES, arr(vec![party_signer(&a.id), role.clone()]));
    let m = terms_act("terms/update with a role, no in_force", &a, p);
    push(&mut invalid, Case {
        name: "terms: an update naming a party by role and carrying no in_force",
        line: "88",
        acts: vec![&m],
        want: Want { verdict: "invalid", rule: Some("5.4.2"), invalid: &["5.4.2"], notes: &[] },
        decides: &[Q_542, "encoding 3, section 4, \"What Terms show by themselves\", 3: \"Case 4, 5.4.2: a party is named by role, and `in_force` is absent, in every Terms act that carries `parties`, an update included.\""],
        reading: &[R_TEXT],
        choices: &[],
    });

    // ---------------------------------------------------------------- lines 89, 90: previous names a Text act, a payment
    let a_text = text_act("held/A's text", &a, t11, "A note of A's, no Agreements act (test).", true);
    let m = statement_act("held/previous a Text act", &a, statement(&agr, &root.id, kind::ASSENT, Some(&a_text.id)));
    push(&mut invalid, Case {
        name: "held: previous names a Text act held, of the same signer",
        line: "89",
        acts: vec![&root, &a_text, &m],
        want: Want { verdict: "invalid", rule: Some("5.7.1"), invalid: &["5.7.1"], notes: &[] },
        decides: &[Q_571, Q_E23_TEXT],
        reading: &[R_TEXT],
        choices: &[],
    });
    let pay = payment_act("held/A's payment", &a, &bb.id, &agr);
    let m = statement_act("held/previous a payment", &a, statement(&agr, &root.id, kind::ASSENT, Some(&pay.id)));
    push(&mut invalid, Case {
        name: "held: previous names a payment held, of the same signer (a Money claim)",
        line: "90",
        acts: vec![&root, &pay, &m],
        want: Want { verdict: "invalid", rule: Some("5.7.1"), invalid: &["5.7.1"], notes: &[] },
        decides: &[Q_571, Q_E23_TEXT],
        reading: &[R_TEXT, "the payment written as a Money claim (type 3) under Money draft 14's spec hash; the checker reads none of its payload"],
        choices: &[],
    });

    // ---------------------------------------------------------------- lines 91 to 97: the act body names
    let w_absent = w("not held");
    let other = w("held, another");
    let m = terms_act("terms/words not held", &a, first_terms(&a.id, &w_absent.id, &reader));
    push(&mut valid, Case {
        name: "held: Terms, with another Text act held but not the one body names: not invalid, a note (the words unchecked)",
        line: "91",
        acts: vec![&other, &m],
        want: Want { verdict: "pass", rule: None, invalid: &[], notes: &["5.2.2"] },
        decides: &[Q_E25_NOT_HELD, Q_522_LACK, Q_NOTE_RULE, Q_UNCHECKED],
        reading: &[R_LEAD_WORDS, R_NOTE_NAME],
        choices: &[9],
    });
    let w_public = w("held, public");
    let m = terms_act("terms/words held", &a, first_terms(&a.id, &w_public.id, &reader));
    push(&mut valid, Case {
        name: "held: Terms, with the Text act their body names held and public",
        line: "92",
        acts: vec![&w_public, &m],
        want: PASS,
        decides: &[Q_E25_FOUND, Q_E25_TEXT],
        reading: &[R_TEXT, "the Text act under Text draft 11's spec hash, in every reading of item 10"],
        choices: &[],
    });
    let m = terms_act("terms/words a Statement", &a, first_terms(&a.id, &b_assent.id, &reader));
    push(&mut invalid, Case {
        name: "held: Terms whose body names a Statement held",
        line: "93",
        acts: vec![&b_assent, &m],
        want: Want { verdict: "invalid", rule: Some("5.2.2"), invalid: &["5.2.2"], notes: &[] },
        decides: &[Q_522, Q_E25_NOT],
        reading: &[R_TEXT],
        choices: &[],
    });
    let x = make(Make { label: "words/TEXT type 1", who: &a, spec: t11, type_: 1, payload: text_payload("Words under TEXT, type 1 (test)."), public: true });
    let m = terms_act("terms/words TEXT type 1", &a, first_terms(&a.id, &x.id, &reader));
    push(&mut invalid, Case {
        name: "held: Terms whose body names an act under TEXT (Text draft 11) of type 1",
        line: "94 (1 of 2)",
        acts: vec![&x, &m],
        want: Want { verdict: "invalid", rule: Some("5.2.2"), invalid: &["5.2.2"], notes: &[] },
        decides: &[Q_522, Q_E25_NOT, Q_E25_TEXT],
        reading: &[R_TEXT],
        choices: &[],
    });
    let x = make(Make { label: "words/TEXT bytes", who: &a, spec: t11, type_: 0, payload: P::new().set(0, Value::Bytes(b"Words as a byte string (test).".to_vec())), public: true });
    let m = terms_act("terms/words TEXT bytes", &a, first_terms(&a.id, &x.id, &reader));
    push(&mut invalid, Case {
        name: "held: Terms whose body names an act under TEXT (Text draft 11), type 0, its field 0 a byte string",
        line: "94 (2 of 2)",
        acts: vec![&x, &m],
        want: Want { verdict: "invalid", rule: Some("5.2.2"), invalid: &["5.2.2"], notes: &[] },
        decides: &[Q_522, Q_E25_NOT, Q_TEXT_11],
        reading: &[R_TEXT],
        choices: &[],
    });
    let x = text_act("words/private", &a, t11, "Private words (test).", false);
    let m = terms_act("terms/words private", &a, first_terms(&a.id, &x.id, &reader));
    let held = x.without_key();
    push(&mut valid, Case {
        name: "held: Terms whose body names a private Text act held without its key: not invalid, a note (the words unchecked)",
        line: "95",
        acts: vec![&held, &m],
        want: Want { verdict: "pass", rule: None, invalid: &[], notes: &["5.2.2"] },
        decides: &[Q_E25_PRIVATE, Q_522_LACK, Q_NOTE_RULE, Q_UNCHECKED],
        reading: &[R_LEAD_WORDS, R_NOTE_NAME],
        choices: &[9],
    });
    let no_sort = party_role(None, Some(&fixed("what: a deed (stand-in)")), Some(socket(&fixed("cMIP: spot (stand-in)"), Value::Null)));
    let p = first_terms(&a.id, &b_assent.id, &reader)
        .set(tk::PARTIES, arr(vec![party_signer(&a.id), no_sort]))
        .set(tk::IN_FORCE, in_force.clone());
    let m = terms_act("terms/words a Statement, a role with no sort", &a, p);
    push(&mut invalid, Case {
        name: "held: Terms whose body names a Statement held, with a role lacking its sort (in_force present): both cases listed, 5.2.2 first",
        line: "96",
        acts: vec![&b_assent, &m],
        want: Want { verdict: "invalid", rule: Some("5.2.2"), invalid: &["5.2.2", "5.10.1"], notes: &[] },
        decides: &[Q_ORDER, Q_ORDER3, Q_STEP7, Q_522, Q_E10_SORT],
        reading: &[R_TEXT],
        choices: &[],
    });
    let x = text_act("words/Text draft 10", &a, text_hash("Text draft 10"), "Words under Text draft 10 (test).", true);
    let m = terms_act("terms/words Text draft 10", &a, first_terms(&a.id, &x.id, &reader));
    push(&mut valid, Case {
        name: "held: Terms whose body names a Text act made under an earlier Text draft's spec hash (Text draft 10)",
        line: "97",
        acts: vec![&x, &m],
        want: PASS,
        decides: &[Q_E25_TEXT_LIST, Q_E25_FOUND],
        reading: &[R_LEAD_TEXT],
        choices: &[10],
    });

    // ================================================================ session 2: the five that waited, and the new ones
    // Draft 26 at b58e417 (the scribe's P7). Each answer from 5.3.1 as it now
    // reads, the sentence quoted.
    let pos = |label: &str| fixed(&format!("a stand-in {label}"));
    let role_ok = party_role(Some(0), Some(&fixed("what: a deed (stand-in)")), Some(socket(&fixed("cMIP: spot (stand-in)"), Value::Null)));

    // ---------------------------------------------------------------- V 1: every optional field, an author at position 2 naming a role
    let wv1 = w("V 1");
    let other_root = pos("root of another agreement, named as a party");
    let bake = pos("bake of an envelope");
    let powers = sorted_set(vec![
        arr(vec![u(0), socket(&fixed("cMIP: power, assent (stand-in)"), Value::Null)]),
        arr(vec![u(1), socket(&fixed("cMIP: power, counter signature (stand-in)"), Value::Null)]),
        arr(vec![u(2), socket(&fixed("cMIP: power, contest (stand-in)"), Value::Null)]),
        arr(vec![u(3), socket(&fixed("cMIP: power, resolves (stand-in)"), Value::Null)]),
        arr(vec![b(&fixed("cMIP: a K7 kind (stand-in)")), socket(&fixed("cMIP: power, a K7 kind (stand-in)"), Value::Null)]),
    ]);
    let v1 = first_terms(&a.id, &wv1.id, &reader)
        .set(tk::PARTIES, arr(vec![party_signer(&a.id), party_signer(&bb.id), role_ok.clone(), arr(vec![u(2), b(&other_root)])]))
        .set(tk::AUTHORS, arr(vec![u(0), u(1), u(2)]))
        .set(tk::RELIES_ON, sorted_set(vec![b(&pos("piece relied on 1")), b(&pos("piece relied on 2"))]))
        .set(tk::IN_FORCE, in_force.clone())
        .set(tk::POWERS, powers)
        .set(tk::KEEPER, keeper(&[k1]))
        .set(tk::CLOCK, b(&fixed("a clock's identifier (stand-in)")))
        .set(tk::RECEIVER, arr(vec![u(0), u(0)]))
        .set(tk::ENVELOPE, b(&bake))
        .set(tk::ENVELOPE_AT, b(&bake))
        .set(tk::CONDITION, socket(&fixed("cMIP: update condition (stand-in)"), arr(vec![u(2), u(3)])))
        .set(tk::CONTROL, socket(&fixed("cMIP: control (stand-in)"), Value::Null))
        .set(tk::CALLS, arr(vec![arr(vec![u(6), u(2)])]))
        .set(tk::DATA, socket(&fixed("cMIP: data (stand-in)"), Value::Null));
    let m = terms_act("terms/V 1, every optional field", &a, v1);
    push(&mut invalid, Case {
        name: "terms: every optional field of section 4 at once (the receiver a party, by position; the bake cited in both envelope fields; one keeper, as a list); an author at position 2 naming a party named by role (verifier 2's V 1, rewritten)",
        line: "V 1 (section 4.1)",
        acts: vec![&m],
        want: Want { verdict: "invalid", rule: Some("5.3.1"), invalid: &["5.3.1"], notes: &[] },
        decides: &[Q_531_MUST, Q_531_INVALID, Q_CASE5, Q_STEP74],
        reading: &[R_TEXT, "rewritten in encoding 3's bytes: the words a Text act's act id (not held, one act handed), key 8 a list of one; written as a bare hash, as verifier 2 wrote key 8, it is rejected under E6 before any case of invalid (line 85, 2 of 7)"],
        choices: &[5, 6, 7, 8],
    });

    // ---------------------------------------------------------------- V 7: no party named as a signer, an author named by role
    let wv7 = w("V 7");
    let p = first_terms(&a.id, &wv7.id, &reader)
        .set(tk::PARTIES, arr(vec![party_role(Some(3), Some(&fixed("what: an identity that fits (stand-in)")), Some(socket(&fixed("cMIP: spot (stand-in)"), Value::Null)))]))
        .set(tk::AUTHORS, arr(vec![u(0)]))
        .set(tk::IN_FORCE, in_force.clone());
    let m = terms_act("terms/V 7, an author by role", &a, p);
    push(&mut invalid, Case {
        name: "terms: no party named as a signer, the one author a party named by role, signed by A, who is no party (verifier 2's V 7, rewritten): both faults of case 5 listed, the author's first",
        line: "V 7 (section 4.1)",
        acts: vec![&m],
        want: Want { verdict: "invalid", rule: Some("5.3.1"), invalid: &["5.3.1", "5.3.1"], notes: &[] },
        decides: &[Q_531_MUST, Q_531_INVALID, Q_CASE5, Q_STEP74, Q_E13_SIGNER, Q_STEP7],
        reading: &[R_TEXT, R_LEAD_NO_PARTY, "the two faults are listed as two cases, both 5.3.1, in step 7.4's order (the author first, then the signer named by no party): encoding 3, section 9, \"Several faults\": \"Where an act shows several cases of invalid, all are listed, in step 7's order\""],
        choices: &[],
    });

    // ---------------------------------------------------------------- line 84: an author naming a role, in_force present
    let w84 = w("line 84");
    let p = first_terms(&a.id, &w84.id, &reader)
        .set(tk::PARTIES, arr(vec![party_signer(&a.id), role_ok.clone()]))
        .set(tk::AUTHORS, arr(vec![u(1)]))
        .set(tk::IN_FORCE, in_force.clone());
    let m = terms_act("terms/line 84, an author by role", &a, p);
    push(&mut invalid, Case {
        name: "terms: the one author named in `authors` a party named by role, in_force present, the signer a party named as a signer",
        line: "84",
        acts: vec![&m],
        want: Want { verdict: "invalid", rule: Some("5.3.1"), invalid: &["5.3.1"], notes: &[] },
        decides: &[Q_531_MUST, Q_531_INVALID, Q_CASE5],
        reading: &[R_TEXT],
        choices: &[],
    });

    // ---------------------------------------------------------------- V 12: a second version by a signer `authors` leaves out
    let w12 = w("V 12, v2 by B");
    let p = update(P::new().set(tk::PARTIES, arr(vec![party_signer(&a.id), party_signer(&bb.id)])).set(tk::AUTHORS, arr(vec![u(0)])).set(tk::BODY, body(&w12.id, socket(&reader, Value::Null))), &root.id, &agr, &b_assent.id);
    let v12 = terms_act("terms/V 12, a second version by B", &bb, p);
    push(&mut valid, Case {
        name: "terms: a second version of the root, signed by B, a party named as a signer whom `authors` leaves out (verifier 2's V 12, rewritten)",
        line: "V 12 (section 4.2)",
        acts: vec![&v12],
        want: PASS,
        decides: &[Q_531_SIGNER, Q_531_INVALID],
        reading: &[R_LEAD_SIGNER, "the lead's reading for V 12 and V 43, in the prompt of this session: valid where the signer is a party named as a signer"],
        choices: &[],
    });

    // ---------------------------------------------------------------- V 43: a fork of Terms, and the resolving update
    let w43a = w("V 43, v2a by A");
    let v2a = terms_act("terms/V 43, v2a by A", &a, update(P::new().set(tk::PARTIES, arr(vec![party_signer(&a.id), party_signer(&bb.id)])).set(tk::AUTHORS, arr(vec![u(0)])).set(tk::BODY, body(&w43a.id, socket(&reader, Value::Null))), &root.id, &agr, &root.id));
    let mut tips = [v2a.id, v12.id];
    tips.sort();
    let res = P::new()
        .set(tk::REPLACES, b(&root.id))
        .set(tk::AGREEMENT, b(&agr))
        .set(tk::RESOLVES, arr(vec![b(&tips[0]), b(&tips[1])]))
        .set(tk::CONTINUES, b(&v2a.id))
        .set(tk::PREVIOUS, previous(Some(&root.id)));
    let r43 = terms_act("terms/V 43, the resolving update by A", &a, res);
    push(&mut valid, Case {
        name: "held: the root, B's assent, two versions replacing the root (the second signed by B, whom `authors` leaves out: V 12's act), and A's resolving update naming both: the resolving update passes (verifier 2's V 43, rewritten)",
        line: "V 43 (section 4.2)",
        acts: vec![&root, &b_assent, &v2a, &v12, &r43],
        want: PASS,
        decides: &[Q_531_SIGNER, Q_D26_RESOLVING, "encoding 3, E17: \"a resolve, and a Terms act written as a resolving update, name **the shared act** both tips follow (5.12.4), not either tip\""],
        reading: &[R_LEAD_SIGNER, "the lead's reading for V 12 and V 43, in the prompt of this session: valid where the signer is a party named as a signer", "the answer is about the last act, the resolving update; the third act (V 12's) passes too, as V 12 says"],
        choices: &[],
    });

    // ---------------------------------------------------------------- the signer named by no party
    let wnp = w("signer no party");
    let p = first_terms(&bb.id, &wnp.id, &reader);
    let m = terms_act("terms/signed by A, naming only B", &a, p);
    push(&mut invalid, Case {
        name: "terms: one party, B, named as a signer and named in `authors`; signed by A, who is no party",
        line: "session 2: the signer named by no party",
        acts: vec![&m],
        want: Want { verdict: "invalid", rule: Some("5.3.1"), invalid: &["5.3.1"], notes: &[] },
        decides: &[Q_531_INVALID, Q_CASE5, Q_E13_SIGNER],
        reading: &[R_TEXT, R_LEAD_NO_PARTY],
        choices: &[],
    });

    // ---------------------------------------------------------------- F11: a Text act its own Text draft makes invalid
    let bad_text = make_full(Make { label: "words/a Text act carrying acks", who: &a, spec: t11, type_: 0, payload: text_payload("Words in a text act carrying acks (test)."), public: true }, Some(vec![fixed("an act acknowledged (stand-in)")]));
    let m = terms_act("terms/words a Text act carrying acks", &a, first_terms(&a.id, &bad_text.id, &reader));
    push(&mut invalid, Case {
        name: "held: Terms whose body names a Text act (TEXT, Text draft 11, type 0, field 0 a text string) that carries `acks`, which its own Text draft makes invalid",
        line: "session 2: F11",
        acts: vec![&bad_text, &m],
        want: Want { verdict: "invalid", rule: Some("5.2.2"), invalid: &["5.2.2"], notes: &[] },
        decides: &["draft 26, 5.2.2: \"A Text act invalid under Text's own grammar rules is no Text act here.\"", Q_522, "Text draft 11, rule 14: \"A text act carrying `acks` is invalid.\""],
        reading: &["the lead's note of 27 November, row F11: \"a Text act invalid under its own layer is no Text act for 5.2.2.\" The lead's reading, resting on the ledger's \"Signing an agreement relies on its words\"", "Text's own rules as the core library applies them (`core/src/text.rs`, `check_act`: \"a text act carries no acks (Envelopes rule 18)\")"],
        choices: &[13],
    });

    // ---------------------------------------------------------------- item 15: the keepers' cMIP, key 20
    let k9 = socket(&fixed("cMIP: keepers, how many must show an act (stand-in)"), arr(vec![u(1)]));
    let wk = w("key 20 beside key 8");
    let m = terms_act("terms/key 20 beside key 8", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, keeper(&[k1, k2])).set(tk::KEEPERS_CMIP, k9.clone()));
    push(&mut valid, Case {
        name: "terms: two keepers (key 8) and, beside them, the keepers' cMIP (task K9) under key 20, a socket",
        line: "session 2: item 15 (1 of 5)",
        acts: vec![&m],
        want: PASS,
        decides: &[Q_D26_K9, Q_D26_K9_533],
        reading: &[R_K9_HIS],
        choices: &[5, 6, 7, 15],
    });
    let wk = w("key 20 without key 8");
    let m = terms_act("terms/key 20 without key 8", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPERS_CMIP, k9.clone()));
    push(&mut invalid, Case {
        name: "terms: the keepers' cMIP under key 20, and no keeper (no key 8)",
        line: "session 2: item 15 (2 of 5)",
        acts: vec![&m],
        want: rejected("E19"),
        decides: &[Q_D26_K9, "draft 26, §4.4, case 1: \"a field allowed only beside another (`agreement` beside `replaces`, `envelope_at` beside `envelope`, `continues` beside `resolves`, `for` beside `under`) without it\""],
        reading: &[R_K9_HIS, "key 20 written only beside key 8; without it, rejected under E19, the presence rule: the codemeister's taking (item 15), not yet in encoding 3's text; draft 26's case 1 lists the fields allowed only beside another, and K9's socket is \"beside them\" (§4.2, `keeper`)"],
        choices: &[15],
    });
    let m = terms_act("terms/resolving with key 20", &a, resolving.clone().set(tk::KEEPERS_CMIP, k9.clone()));
    push(&mut invalid, Case {
        name: "terms: a resolving update carrying the keepers' cMIP (key 20)",
        line: "session 2: item 15 (3 of 5)",
        acts: vec![&m],
        want: rejected("E19"),
        decides: &[Q_D26_RESOLVING, Q_E19_RESOLVING],
        reading: &[R_TEXT, "key 20 is \"a socket\" among the fields a resolving update does not carry (E19's list); the codemeister's taking (item 15)"],
        choices: &[15],
    });
    let wk = w("key 20 not a fingerprint");
    let m = terms_act("terms/key 20 cmip not a fingerprint", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, keeper(&[k1, k2])).set(tk::KEEPERS_CMIP, arr(vec![txt("keepers: any one of those named"), arr(vec![u(1)])])));
    push(&mut invalid, Case {
        name: "terms: two keepers, and under key 20 a socket whose cMIP is a text, not a fingerprint",
        line: "session 2: item 15 (4 of 5)",
        acts: vec![&m],
        want: Want { verdict: "invalid", rule: Some("5.2.1"), invalid: &["5.2.1"], notes: &[] },
        decides: &[Q_521, "draft 26, 5.2.3: \"A `body`, or a cMIP in a socket, that is not named by fingerprint makes the Terms **invalid**, under 5.2.1 (§3.6).\"", Q_D26_K9],
        reading: &[R_K9_HIS, "checked in case 2 after each power's rule (the codemeister's taking, item 15): draft 26's case 2 names the sockets of its day and not K9's"],
        choices: &[15],
    });
    let wk = w("key 20 bare");
    let m = terms_act("terms/key 20 not a socket", &a, first_terms(&a.id, &wk.id, &reader).set(tk::KEEPER, keeper(&[k1, k2])).set(tk::KEEPERS_CMIP, b(&fixed("cMIP: keepers, how many must show an act (stand-in)"))));
    push(&mut invalid, Case {
        name: "terms: two keepers, and under key 20 a bare fingerprint, not a socket",
        line: "session 2: item 15 (5 of 5)",
        acts: vec![&m],
        want: rejected("E7"),
        decides: &["encoding 3, E7: \"A socket that is not an array of exactly two items is rejected\"", "draft 26, §4.1: \"a socket that is not written as a socket at all (a cMIP and its parameters), and a power's sort that is neither one of its words nor a fingerprint, hold another kind than their field's, and are not Agreements acts.\""],
        reading: &[R_K9_HIS, "key 20 written as a socket (E7), as item 15 takes it"],
        choices: &[15],
    });

    // ---------------------------------------------------------------- item 14: a first act naming an earlier agreement
    let wo = w("an earlier agreement");
    let old_root = terms_act("terms/an earlier agreement's root", &a, first_terms(&a.id, &wo.id, &reader).set(tk::KEEPER, keeper(&[k1])));
    let wo2 = w("an earlier agreement, its last version");
    let old_tip = terms_act("terms/an earlier agreement's last version (its tip)", &a, update(first_terms(&a.id, &wo2.id, &reader).set(tk::KEEPER, keeper(&[k1])), &old_root.id, &old_root.id, &old_root.id));
    let wn = w("a new agreement naming the earlier one");
    let m = terms_act("terms/a new first act naming the earlier agreement's tip", &a, first_terms(&a.id, &wn.id, &reader).set(tk::KEEPER, keeper(&[k2])).set(tk::RELIES_ON, arr(vec![b(&old_tip.id)])));
    push(&mut valid, Case {
        name: "held: an earlier agreement (its root and its last version, its tip, naming keeper 1), and a new first act, naming keeper 2, whose `relies_on` names that tip",
        line: "session 2: item 14 (1 of 2)",
        acts: vec![&wo, &old_root, &wo2, &old_tip, &wn, &m],
        want: PASS,
        decides: &[Q_D26_NEW_ACT, "draft 26, §4.2, `relies_on`: \"fingerprints of every other piece the Terms use, and of every version or act they relied on\"", Q_E14_OPEN],
        reading: &[R_NEW_ACT_HIS, "the codemeister's taking (item 14): a first act names an earlier agreement in `relies_on` (key 5), by the act id of that agreement's last version, the tip; no new field (the lead's 22:45, 3: \"No new field.\")"],
        choices: &[5, 6, 7, 14],
    });
    let wn = w("a new agreement naming the earlier one in key 1");
    let m = terms_act("terms/a new first act naming the earlier agreement in agreement", &a, first_terms(&a.id, &wn.id, &reader).set(tk::KEEPER, keeper(&[k2])).set(tk::AGREEMENT, b(&old_root.id)));
    push(&mut invalid, Case {
        name: "terms: a new first act (no `replaces`) naming an earlier agreement's root in `agreement` (key 1)",
        line: "session 2: item 14 (2 of 2)",
        acts: vec![&m],
        want: rejected("E19"),
        decides: &["encoding 3, E19: \"`agreement` (1) is written exactly when `replaces` (0) is; one without the other is rejected.\"", Q_E14_OPEN],
        reading: &[R_TEXT, "the field a first act names an earlier agreement in is `relies_on` (item 14); `agreement` is not it"],
        choices: &[5, 6, 7, 14],
    });

    // ---------------------------------------------------------------- lines 80, 81 and I 8: not this encoding
    let v2 = an::Terms {
        parties: Some(vec![an::Party::Signer(a.id)]),
        authors: Some(vec![0]),
        body: Some(an::Body::new(mor_core::hash::work_hash(b"Encoding 2's words (test)."), an::Socket::new(reader, Value::Null))),
        ..Default::default()
    };
    let p = P(v2.to_payload().unwrap().into_iter().map(|(k, v)| (if let Value::Uint(k) = k { k } else { unreachable!() }, v)).collect());
    let m = make(Make { label: "act/draft 25", who: &a, spec: an::SPEC_DRAFT_25, type_: an::types::TERMS, payload: p, public: true });
    push(&mut invalid, Case {
        name: "act: a Terms act of encoding 2 (valid there), under draft 25's spec hash",
        line: "80",
        acts: vec![&m],
        want: Want { verdict: "not this encoding", rule: Some("E2"), invalid: &[], notes: &[] },
        decides: &[Q_E2, Q_E2_OLD, Q_STEP3],
        reading: &[R_TEXT, "the payload written by verifier 2's builder (`Terms::to_payload`), encoding 2's bytes"],
        choices: &[],
    });
    let rep = an::Report { call: an::CallRef { act: root.id, task: Some(6) }, relies_on: None, lines: None };
    let p = P(rep.to_payload().unwrap().into_iter().map(|(k, v)| (if let Value::Uint(k) = k { k } else { unreachable!() }, v)).collect());
    let m = make(Make { label: "act/report", who: &a, spec: an::SPEC_REPORT_BLOCK_4, type_: an::types::REPORT, payload: p, public: true });
    push(&mut invalid, Case {
        name: "act: a report under the report block's fourth proposal's spec hash, valid under encoding 2's E21",
        line: "81",
        acts: vec![&m],
        want: Want { verdict: "not this encoding", rule: Some("E2"), invalid: &[], notes: &[] },
        decides: &[Q_E2, Q_E2_REPORT, Q_E2_OLD],
        reading: &[R_TEXT, "the payload written by verifier 2's builder (`Report::to_payload`), encoding 2's bytes"],
        choices: &[],
    });
    let m = make(Make { label: "act/report block type 1", who: &a, spec: an::SPEC_REPORT_BLOCK_4, type_: 1, payload: root_p.clone(), public: true });
    push(&mut invalid, Case {
        name: "act: type 1 under the report block's spec hash (verifier 2's invalid case 8, rewritten: a Terms payload of encoding 3)",
        line: "I 8 (section 4.1)",
        acts: vec![&m],
        want: Want { verdict: "not this encoding", rule: Some("E2"), invalid: &[], notes: &[] },
        decides: &[Q_E2, Q_STEP3],
        reading: &[R_TEXT, "the spec hash is read before the type (section 9, step 3), so the type is never reached"],
        choices: &[],
    });

    write_file(dir, "valid.json", &json!({
        "about": "Acts of Agreements draft 26, in the bytes of encoding 3, that the checker must pass. Each case lists the acts handed to the checker, in order (each act's label, id, complete bytes in hex, its content key where it is private and given, and its payload's bytes); the answer is about the last act. Every answer is taken from the texts, quoted in `decides`, never from code: no checker of encoding 3 exists yet. `reading` names what the answer rests on. TEST DATA: every identity, key, cMIP, keeper and clock is a stand-in derived from a label; draft 26 is not final, and its spec hash, which every act carries, will change: the bytes are written again then, the answers stay.",
        "spec": spec_json(),
        "cases": valid,
    }));
    write_file(dir, "invalid.json", &json!({
        "about": "Acts the checker must not pass: rejected (no Agreements act, the rule of encoding 3 named), invalid (draft 26's rule named; every case found listed in `invalid`, the first named in `rule`), or not this encoding. The shape is valid.json's. TEST DATA, as there.",
        "spec": spec_json(),
        "cases": invalid,
    }));
}

/// Line 82: the set of acts, a recipe file: ids in, value out.
fn write_sets(dir: &Path) {
    let x = fixed("an act id (stand-in) x");
    let y = fixed("an act id (stand-in) y");
    let reading = [taken(1), taken(2), taken(3)];
    let one = |name: &str, ids: &[Hash], same_as: Option<&str>| {
        json!({
            "name": name,
            "ids": ids.iter().map(|h| hx(h)).collect::<Vec<_>>(),
            "value": hx(&set_value(ids)),
            "same_as": same_as,
        })
    };
    let cases = vec![
        one("two ids, in one order", &[x, y], None),
        one("the same two ids, in the other order: the same value", &[y, x], Some("two ids, in one order")),
        one("one id", &[x], None),
        one("one id twice: the same value as once", &[x, x], Some("one id")),
        one("the empty set: the label over no members", &[], None),
    ];
    let x_not_value = set_value(&[x]) != x;
    assert!(x_not_value);
    write_file(dir, "sets.json", &json!({
        "about": "The set of acts (encoding 3, \"The set of acts\"; draft 26, §4.1): ids in, value out. The value is tagged_hash(\"MOR/act-set\", the ids sorted bytewise, repeats dropped, concatenated). A set of one id is not that id. Line 82 of the codemeister's sheet (four vectors: two orders, a repeat, one id, the empty set). TEST DATA: the ids are stand-ins.",
        "decides": [
            "draft 26, §4.1: \"is a value computed from a list of act ids: the ids sorted, repeats dropped, and hashed with a label for a set of acts.\"",
            "draft 26, §4.1: \"The same acts give the same value, whoever computes it.\"",
            "draft 26, §4.1: \"The empty set has the label and no members.\"",
        ],
        "reading": reading,
        "label": SET_LABEL,
        "cases": cases,
    }));
}

/// The reference payloads (X1 to X8, X2 twice): payload bytes only, before
/// signing, without the act around them. Every fingerprint is the SHA-256
/// of the ASCII label given. Test data.
fn write_reference(dir: &Path) {
    let ana = test_fp("test:ana");
    let words = test_fp("test:words-1");
    let cmip = test_fp("test:cmip-in-force");
    let k1 = test_fp("test:keeper-1");
    let k2 = test_fp("test:keeper-2");
    let v1 = test_fp("test:terms-v1");
    let x1 = first_terms(&ana, &words, &cmip).set(tk::KEEPER, keeper(&[k1]));
    let one = |name: &str, about: &str, type_: Option<u64>, p: &P, choices: &[u8], notes: &[&str]| {
        let bytes = p.bytes();
        json!({
            "name": name,
            "about": about,
            "type": type_,
            "payload": hx(&bytes),
            "payload_sha256": hx(&sha256(&bytes)),
            "reading": choices.iter().map(|&i| taken(i)).collect::<Vec<_>>(),
            "notes": notes,
        })
    };
    let socket_note = "the one socket is the body's (key 4: [words, [cmip, null]]): E8 asks every body for a socket, and X1 gives one socket only. Read as key 6 (in_force), as the cMIP's name suggests, X1 cannot be written: its body would lack its socket. The codemeister's reading of the example, to check";
    let mut out = vec![
        one("X1", "first Terms: one party, a signer, test:ana; its authors, that party; the words, act test:words-1; one socket naming cMIP test:cmip-in-force, no parameters (null); one keeper, test:keeper-1; previous []", Some(TERMS), &x1, &[5, 6, 7], &[socket_note]),
        one("X2", "as X1, with two keepers, test:keeper-2 then test:keeper-1 as the writer gives them: written sorted", Some(TERMS), &x1.clone().set(tk::KEEPER, keeper(&[k2, k1])), &[5, 6, 7], &[socket_note, if k2 < k1 { "test:keeper-2 sorts first: the writer's order is the sorted order, so this example does not tell a sorted list from the writer's order" } else { "test:keeper-1 sorts first: the writer's order is reversed" }]),
        {
            let (first, second) = if k1 < k2 { (k2, k1) } else { (k1, k2) };
            let (fl, sl) = if k1 < k2 { ("test:keeper-2", "test:keeper-1") } else { ("test:keeper-1", "test:keeper-2") };
            let about = format!("as X1, with two keepers given by the writer in the order {fl} then {sl}, which is not their sorted order: written sorted, {sl} first");
            let _ = (first, second);
            one("X2 (the writer's order unsorted)", &about, Some(TERMS), &x1.clone().set(tk::KEEPER, keeper(&[first, second])), &[5, 6, 7], &[socket_note, "the writer's order is not the bytes' order: a set is written sorted, each keeper once (E18), whatever order the writer gives"])
        },
        one("X3", "as X1, with a clock, test:clock-1 (key 9, 32 bytes)", Some(TERMS), &x1.clone().set(tk::CLOCK, b(&test_fp("test:clock-1"))), &[5, 6, 7, 8], &[socket_note]),
        one("X5", "an update of X1, naming act test:terms-v1 as the version it replaces, otherwise as X1: agreement test:terms-v1 (X1 is the first Terms, the root); previous [test:terms-v1] (the author's next act within the agreement names the Terms act she made, E17)", Some(TERMS), &update(x1.clone(), &v1, &v1, &v1), &[5, 6, 7], &[socket_note, "agreement and previous are not given by the example: read so, the codemeister's reading, to check (if Ana made another act within the agreement between them, previous names that one)"]),
        one("X6 (an author's assent)", "a Statement assenting to Terms test:terms-v1, signed by their author: agreement test:terms-v1 (the root), previous [test:terms-v1]", Some(STATEMENT), &statement(&v1, &v1, kind::ASSENT, Some(&v1)), &[], &["the signer is not given by the example: written twice, by the Terms' author (previous names the Terms act) and by a party with no act in the agreement yet (previous [])"]),
        one("X6 (a party's first act)", "a Statement assenting to Terms test:terms-v1, by a party with no act in the agreement yet: agreement test:terms-v1 (the root), previous []", Some(STATEMENT), &statement(&v1, &v1, kind::ASSENT, None), &[], &[]),
        one("X8", "as X1, relying on act test:payment-1 (key 5)", Some(TERMS), &x1.clone().set(tk::RELIES_ON, arr(vec![b(&test_fp("test:payment-1"))])), &[5, 6, 7], &[socket_note]),
    ];
    let a = test_fp("test:act-a");
    let bb = test_fp("test:act-b");
    let mut sorted = [a, bb];
    sorted.sort();
    let preimage = sorted.concat();
    out.push(json!({
        "name": "X7",
        "about": "the set of the acts test:act-a and test:act-b, and the empty set: their values (no payload: a set's value is no field's, encoding 3, section 11, item 4)",
        "type": null,
        "set_ab": hx(&set_value(&[a, bb])),
        "set_ab_preimage": hx(&preimage),
        "set_empty": hx(&set_value(&[])),
        "reading": [taken(1), taken(2), taken(3), taken(4)],
        "notes": [],
    }));
    let labels: Vec<J> = ["test:ana", "test:words-1", "test:cmip-in-force", "test:keeper-1", "test:keeper-2", "test:clock-1", "test:terms-v1", "test:act-a", "test:act-b", "test:payment-1"]
        .iter()
        .map(|l| json!({ "label": l, "sha256": hx(&test_fp(l)) }))
        .collect();
    write_file(dir, "reference-payloads.json", &json!({
        "about": "Nine reference payloads (X2 twice), for comparing a stranger's encoder with this one: each payload's deterministic CBOR bytes, before signing, without the act around it, and their plain SHA-256. Every fingerprint is the SHA-256 of the ASCII label given (test:ana and so on). TEST DATA. Encoding 3 does not let X4 be written (see `left_out`). A Terms act carries draft 26's spec hash in its inside, not in its payload, so these bytes do not change when draft 26 does.",
        "labels": labels,
        "payloads": out,
        "left_out": [{
            "name": "X4",
            "about": "as X1, with a second party: a role named `buyer`",
            "why": "encoding 3, E10, \"How a role is named\": \"by its position in `parties` (E13, E12). A role carries no label.\" A role has no name to write `buyer` in. Its sort, its `what` and its spot socket are not given either (E10), and Terms naming a role and no `in_force` are invalid (5.4.2).",
        }],
    }));
}

/// The checker vectors of verifier 2 the sheet retires (section 4.3, and V 7
/// as a passing case, section 4.1), copied whole from
/// `core/vectors/agreements-new/`, with the rule that retires each.
fn write_retired(dir: &Path) {
    let read = |f: &str| -> J {
        let p = repo_root().join("core/vectors/agreements-new").join(f);
        serde_json::from_str(&std::fs::read_to_string(&p).unwrap()).unwrap()
    };
    let valid = read("valid.json");
    let invalid = read("invalid.json");
    let report = json!({
        "rule": "E2",
        "says": [
            "encoding 3, E2: \"*A report is not one of draft 26's act types (draft 26, §4.3: \"one act type, defined once, in the MICS's report block\"): it is written under the MICS's hash and type, by the MICS's bytes, and this checker answers a report **not this encoding**.*\"",
            "encoding 3, section 6: \"This text gives a report no bytes, and its checker answers an act under the block's hash **not this encoding** (E2).\"",
            "draft 26, §4.3: \"A report (§3.1) is one act type, defined once, in the MICS's report block; every layer's tasks use that one type, and this text uses it and gives it no fields of its own.\"",
        ],
        "sheet": "docs/code/impact-draft-26.md, section 4.3: \"V 34, 35, 36 (E2 and section 6, part 3): three reports that pass: a report is the MICS's act, **not this encoding**.\" and \"I 103 to 111 (E2, part 3): nine reports rejected under E4, E21, E18, E22: the same.\"",
    });
    let mut cases = vec![];
    for (file, data, idx) in [("valid.json", &valid, vec![34usize, 35, 36]), ("invalid.json", &invalid, (103usize..=111).collect())] {
        for i in idx {
            cases.push(json!({ "from": format!("core/vectors/agreements-new/{file}"), "index": i, "retired_by": report, "case": data["cases"][i] }));
        }
    }
    cases.push(json!({
        "from": "core/vectors/agreements-new/valid.json",
        "index": 7,
        "retired_by": {
            "rule": "5.3.1",
            "says": ["draft 26, 5.3.1: \"`authors` MUST name one or more of the parties these Terms name, each named as a signer: an author is never a party named by role, and never one named as an agreement (§3.2).\""],
            "sheet": "docs/code/impact-draft-26.md, section 4.1: \"V 7: Terms with no party named as a signer, an author named by role: **pass** → **invalid**, 5.3.1 (then retired as a passing case).\"",
            "confirmed": "draft 26 at b58e417 (the scribe's P7): 5.3.1 reads as quoted; the case is rewritten in encoding 3's bytes as invalid, 5.3.1 (invalid.json, line \"V 7 (section 4.1)\").",
        },
        "case": valid["cases"][7],
    }));
    write_file(dir, "retired/retired.json", &json!({
        "about": "Verifier 2's checker vectors that the codemeister's sheet retires under draft 26 and encoding 3, each copied whole from core/vectors/agreements-new/ (which stays as it is), with the rule that retires it and the lines of the texts that say so. These answers are encoding 2's; they are kept here as a record, and no checker of encoding 3 is tested against them.",
        "cases": cases,
    }));
}
