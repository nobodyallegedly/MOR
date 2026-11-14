//! The new Agreements acts, as bytes (`docs/agreements-from-scratch/encoding-1.md`).
//!
//! In plain words: Agreements has been written again from scratch as a
//! grammar (`docs/agreements-from-scratch/draft-24.md`), which says what its
//! acts carry and not their bytes. This module gives them bytes, in the act
//! format already in force (Envelopes, Part three): a **Terms** act and a
//! **Statement** are everyday acts under draft 24's own spec hash, types 0
//! and 1; a **report**, the shared language's block, is an everyday act under
//! the spec hash of the block's third proposal, type 0, and is a proposal
//! like the block itself. Each payload is a closed map with small integer
//! keys, decoded strictly: anything the encoding does not give is refused.
//!
//! Precisely, this module:
//!
//! - encodes and decodes each payload strictly both ways ([`terms`],
//!   [`statement`], [`report`]): one byte form for each meaning, and the
//!   decoder refuses every other (unsorted or repeated set entries, empty
//!   lists, unknown keys);
//! - applies the checks the bytes alone allow ([`check`]): the act format's
//!   own (deterministic CBOR, lock, commitment, canonical text, the
//!   signature), the shape and the required fields of each payload
//!   (**rejected**, draft 24's word for an act that never reaches the grammar
//!   rules), and every case of **invalid** that draft 24 says an act shows by
//!   itself (G2.1, G3.1, G4.2, G10.1), with G6.1 among the acts a verifier
//!   holds;
//! - builds each act ready to sign: a payload, which the existing everyday
//!   act (`act::make`, or the binding's `makeEveryday`) seals and signs.
//!
//! It builds none of the grammar's answers (in force, fork, unchecked): that
//! is a later step. Nothing here reads or changes the earlier Agreements
//! module ([`crate::agreements`]).

use crate::cbor::{self, Value};
use crate::hash::Hash;
use std::fmt;

pub mod check;
pub mod report;
pub mod statement;
pub mod terms;

pub use check::{check, check_held, Answer, Verdict};
pub use report::{Amount, CallRef, Line, Report};
pub use statement::{Kind, Statement};
pub use terms::{Body, Call, CallFrom, Party, Power, PowerKind, Receiver, Role, RoleKind, Terms};

/// Draft 24's spec hash: `tagged_hash("MOR/spec", {0: 4, 9: text})`, the
/// text being `draft-24.md` with its final line break removed, as the core
/// computes a MIR's hash from its file (Development rule 26,
/// [`crate::development::Spec::mir_file_hash`]). Terms and Statements are
/// written under it. A test recomputes it from the file.
pub const SPEC_DRAFT_24: Hash = hex32("af5e41f9476deff36fb97397815b96293288d190f2fcf9e24d636465eefc0439");

/// The spec hash of the report block's third proposal
/// (`docs/lead/proposals/report-block-3.md`), computed the same way. A
/// report is written under it: a proposal, as the block is (encoding-1,
/// E2). A test recomputes it from the file.
pub const SPEC_REPORT_BLOCK_3: Hash = hex32("99a3b2d6711c0541128e93c2d893b19f3eede2b9f24b9cdf40cc37d65a9a6d78");

/// The type numbers (encoding-1, E2).
pub mod types {
    /// Terms, under [`super::SPEC_DRAFT_24`].
    pub const TERMS: u64 = 0;
    /// Statement, under [`super::SPEC_DRAFT_24`].
    pub const STATEMENT: u64 = 1;
    /// Report, under [`super::SPEC_REPORT_BLOCK_3`] (a proposal).
    pub const REPORT: u64 = 0;
}

const fn hex32(s: &str) -> Hash {
    let b = s.as_bytes();
    let mut out = [0u8; 32];
    let mut i = 0;
    while i < 32 {
        out[i] = (nib(b[2 * i]) << 4) | nib(b[2 * i + 1]);
        i += 1;
    }
    out
}

const fn nib(c: u8) -> u8 {
    match c {
        b'0'..=b'9' => c - b'0',
        b'a'..=b'f' => c - b'a' + 10,
        _ => panic!("not lowercase hex"),
    }
}

// ---------------------------------------------------------------- answers

/// An act refused before the grammar rules: draft 24's **rejected** (section
/// 2, "Not an Agreements act"), which the core calls an act outside its
/// specification's format. `rule` names the rule of `encoding-1.md` (E1 to
/// E23) or of the act format (an Envelopes rule) it fails.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rejected {
    pub rule: &'static str,
    pub says: String,
}

impl fmt::Display for Rejected {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.rule, self.says)
    }
}

impl std::error::Error for Rejected {}

/// What the bytes show by themselves to the grammar rules: an **invalid**
/// case (a grammar rule named, G2.1 and so on), or a note (something left
/// unread, or an answer the act alone already gives).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Finding {
    pub rule: &'static str,
    pub says: String,
}

impl Finding {
    pub(crate) fn new(rule: &'static str, says: impl Into<String>) -> Self {
        Finding { rule, says: says.into() }
    }
}

pub type R<T> = Result<T, Rejected>;

pub(crate) fn rej<T>(rule: &'static str, says: impl Into<String>) -> R<T> {
    Err(Rejected { rule, says: says.into() })
}

// ---------------------------------------------------------------- the kinds of value

/// A value draft 24 says is named by fingerprint, in a place where one that
/// is not reaches the grammar rules instead of being rejected: a body's
/// words, a cMIP in a socket of Terms, an entry of `relies_on`, a role's
/// `what` (draft 24, section 3: "with three exceptions").
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Named {
    /// A fingerprint: a 32-byte byte string (E5).
    Fp(Hash),
    /// Anything else, kept as it was written.
    Not(Value),
}

impl Named {
    pub fn from_value(v: &Value) -> Named {
        match v {
            Value::Bytes(b) if b.len() == 32 => Named::Fp(b.as_slice().try_into().unwrap()),
            other => Named::Not(other.clone()),
        }
    }

    pub fn to_value(&self) -> Value {
        match self {
            Named::Fp(h) => hv(h),
            Named::Not(v) => v.clone(),
        }
    }

    pub fn fp(&self) -> Option<Hash> {
        match self {
            Named::Fp(h) => Some(*h),
            Named::Not(_) => None,
        }
    }
}

/// A socket: a cMIP and its parameters, `[cmip, params]` (E7), as the act
/// format writes "a cMIP and its parameters" for a vow. Its parameters are
/// any value, which only that cMIP reads. An empty socket is the field left
/// out.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Socket {
    pub cmip: Named,
    pub params: Value,
}

impl Socket {
    /// A cMIP named by its spec hash, with its parameters.
    pub fn new(cmip: Hash, params: Value) -> Socket {
        Socket { cmip: Named::Fp(cmip), params }
    }

    pub fn to_value(&self) -> Value {
        Value::Array(vec![self.cmip.to_value(), self.params.clone()])
    }

    pub(crate) fn from_value(v: &Value, what: &str) -> R<Socket> {
        match v {
            Value::Array(a) if a.len() == 2 => Ok(Socket { cmip: Named::from_value(&a[0]), params: a[1].clone() }),
            _ => rej("E7", format!("{what} is a socket, written [cmip, params]: an array of exactly two items")),
        }
    }
}

/// In whose name an act is made, or to whom a line of a report goes: a
/// signer, `[0, identity]`, or an agreement, `[2, root]` (E11).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Who {
    Signer(Hash),
    Agreement(Hash),
}

impl Who {
    pub fn to_value(&self) -> Value {
        match self {
            Who::Signer(h) => Value::Array(vec![Value::Uint(0), hv(h)]),
            Who::Agreement(h) => Value::Array(vec![Value::Uint(2), hv(h)]),
        }
    }

    pub(crate) fn from_value(v: &Value, what: &str) -> R<Who> {
        let says = || format!("{what} is a signer, [0, identity hash], or an agreement, [2, root]");
        match v {
            Value::Array(a) if a.len() == 2 => {
                let h = match &a[1] {
                    Value::Bytes(b) if b.len() == 32 => b.as_slice().try_into().unwrap(),
                    _ => return rej("E11", says()),
                };
                match a[0] {
                    Value::Uint(0) => Ok(Who::Signer(h)),
                    Value::Uint(2) => Ok(Who::Agreement(h)),
                    _ => rej("E11", says()),
                }
            }
            _ => rej("E11", says()),
        }
    }
}

// ---------------------------------------------------------------- helpers

pub(crate) fn hv(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

pub(crate) fn hash_of(v: &Value, rule: &'static str, what: &str) -> R<Hash> {
    match v {
        Value::Bytes(b) if b.len() == 32 => Ok(b.as_slice().try_into().unwrap()),
        _ => rej(rule, format!("{what} is a fingerprint: a byte string of exactly 32 bytes")),
    }
}

pub(crate) fn uint_of(v: &Value, rule: &'static str, what: &str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => rej(rule, format!("{what} is an unsigned integer")),
    }
}

/// A list field: an array of one or more items. An empty list is never
/// written: the field is left out (E18).
pub(crate) fn list_of<'a>(v: &'a Value, what: &str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if !a.is_empty() => Ok(a),
        Value::Array(_) => rej("E18", format!("{what} is never an empty list: a list with nothing in it is left out")),
        _ => rej("E18", format!("{what} is a list (an array)")),
    }
}

/// A set-like list: its entries in the bytewise order of their encodings,
/// each once (E18), as the keys of a map are.
pub(crate) fn check_set(items: &[Value], what: &str) -> R<()> {
    let enc: Vec<Vec<u8>> = items.iter().map(cbor::encode).collect();
    for w in enc.windows(2) {
        if w[0] == w[1] {
            return rej("E18", format!("{what} names the same entry twice"));
        }
        if w[0] > w[1] {
            return rej("E18", format!("{what} is not in order: its entries are sorted by the bytes of their encodings"));
        }
    }
    Ok(())
}

/// A list whose order is the writer's and carries meaning (parties, a
/// report's lines): each entry once (E18).
pub(crate) fn check_distinct(items: &[Value], what: &str) -> R<()> {
    let mut enc: Vec<Vec<u8>> = items.iter().map(cbor::encode).collect();
    enc.sort();
    if enc.windows(2).any(|w| w[0] == w[1]) {
        return rej("E18", format!("{what} names the same entry twice"));
    }
    Ok(())
}

/// Sort a set-like list as [`check_set`] wants it. Repeated entries are kept,
/// so that the decoder refuses them.
pub(crate) fn sorted(mut items: Vec<Value>) -> Value {
    items.sort_by_cached_key(cbor::encode);
    Value::Array(items)
}

/// The entries of a closed payload map, every key a small unsigned integer
/// below `keys` (E4).
pub(crate) fn closed<'a>(payload: &'a [(Value, Value)], keys: u64, what: &str) -> R<Vec<(u64, &'a Value)>> {
    payload
        .iter()
        .map(|(k, v)| match k {
            Value::Uint(n) if *n < keys => Ok((*n, v)),
            Value::Uint(n) => rej("E4", format!("{what} has no field {n}: its map is closed (keys 0 to {})", keys - 1)),
            _ => rej("E4", format!("{what}'s keys are small unsigned integers")),
        })
        .collect()
}

pub(crate) fn get<'a>(m: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    m.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

pub(crate) fn put(m: &mut Vec<(Value, Value)>, k: u64, v: Value) {
    m.push((Value::Uint(k), v));
}

/// `previous`: `[]` for none, `[act id]` for the signer's previous act in
/// this agreement (E17), as the act format writes `prev`.
pub(crate) fn previous_of(v: &Value) -> R<Option<Hash>> {
    match v {
        Value::Array(a) if a.is_empty() => Ok(None),
        Value::Array(a) if a.len() == 1 => hash_of(&a[0], "E17", "previous's entry").map(Some),
        _ => rej("E17", "previous is [] (none) or [act id]: an array of at most one fingerprint"),
    }
}

pub(crate) fn previous_value(p: &Option<Hash>) -> Value {
    Value::Array(p.iter().map(hv).collect())
}

/// `resolves` and `continues`, shared by Terms and Statements (E19, E20):
/// `continues` only beside `resolves`, and one of its entries.
pub(crate) fn resolves_of(resolves: Option<&Value>, continues: Option<&Value>, rule: &'static str) -> R<(Option<Vec<Hash>>, Option<Hash>)> {
    let r = resolves
        .map(|v| {
            let l = list_of(v, "resolves")?;
            check_set(l, "resolves")?;
            l.iter().map(|x| hash_of(x, "E5", "an entry of resolves")).collect::<R<Vec<_>>>()
        })
        .transpose()?;
    let c = continues.map(|v| hash_of(v, "E5", "continues")).transpose()?;
    if let Some(c) = &c {
        match &r {
            None => return rej(rule, "continues is written only beside resolves (draft 24, section 3: an act that names continues and no resolves is rejected)"),
            Some(r) if !r.contains(c) => return rej(rule, "continues names one of the entries of resolves (draft 24, section 3: \"one of the fingerprints in resolves\")"),
            _ => {}
        }
    }
    Ok((r, c))
}

pub(crate) fn hashes_value(hs: &[Hash]) -> Value {
    sorted(hs.iter().map(hv).collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::development::Spec;

    fn file(rel: &str) -> String {
        std::fs::read_to_string(std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("..").join(rel)).unwrap()
    }

    #[test]
    fn spec_hashes_are_the_files() {
        assert_eq!(Spec::mir_file_hash(&file("docs/agreements-from-scratch/draft-24.md")).unwrap(), SPEC_DRAFT_24);
        assert_eq!(Spec::mir_file_hash(&file("docs/lead/proposals/report-block-3.md")).unwrap(), SPEC_REPORT_BLOCK_3);
    }

    #[test]
    fn set_lists_and_previous() {
        assert_eq!(check_set(&[Value::Uint(1), Value::Uint(2)], "x"), Ok(()));
        assert_eq!(check_set(&[Value::Uint(2), Value::Uint(1)], "x").unwrap_err().rule, "E18");
        assert_eq!(check_set(&[Value::Uint(1), Value::Uint(1)], "x").unwrap_err().rule, "E18");
        assert_eq!(previous_of(&Value::Array(vec![])), Ok(None));
        assert_eq!(previous_of(&Value::Array(vec![hv(&[1; 32]), hv(&[2; 32])])).unwrap_err().rule, "E17");
        assert_eq!(Socket::from_value(&Value::Uint(1), "s").unwrap_err().rule, "E7");
        assert_eq!(Who::from_value(&Value::Array(vec![Value::Uint(1), hv(&[1; 32])]), "for").unwrap_err().rule, "E11");
    }
}
