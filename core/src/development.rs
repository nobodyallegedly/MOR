//! What a specification declares about itself that the core library reads
//! (Development draft 7, Part three, "The specification format"), and, from
//! Development draft 10, the decoder of the whole format ([`Spec::decode`]),
//! read at adoption and by the listing (F323).
//!
//! In plain words: a specification says what kind of thing it is (a cMIP,
//! a Module, a unit…). A cMIP that checks proofs of delivery says so, by
//! one field, so that verifiers can find checkers (F268, decided 12 October
//! 2026: a proof checker is not a task; "a cMIP that checks proofs of
//! delivery declares so in its specification by one field (as rail Modules
//! declare their kind), so checkers stay discoverable"). From Development
//! 11 the field serves discovery only: the checker of whatever cMIP an
//! offer names is asked, declared or not.
//!
//! ```cddl
//! spec = {
//!   0 => uint,      ; kind: 0 cMIP, 1 Module, 2 unit, 3 media type, 4 MIR, 5 signature scheme
//!   ...
//!   ? 12 => true    ; a cMIP that checks proofs of delivery (F268)
//! }
//! ```
//!
//! *Mechanic, the build's (F268 names "one declared field" and no number
//! or value): field 12, the next free one, and the value `true` alone, so
//! that one specification has one encoding (absent: not declared). The
//! field is valid only on a cMIP (kind 0); any other value, or on another
//! kind, makes the specification invalid, as field 10's rule does.*

use crate::cbor::Value;

/// The specification format's field naming its kind.
pub const KIND: u64 = 0;
/// Kind 0: a cMIP.
pub const CMIP: u64 = 0;
/// The specification format's field marking a cMIP that checks proofs of
/// delivery (F268).
pub const CHECKS_DELIVERY: u64 = 12;

/// Whether a specification's content (its CBOR map, decoded) declares a
/// cMIP that checks proofs of delivery (F268): `Ok(true)` where field 12 is
/// `true` on a cMIP; `Ok(false)` where field 12 is absent; an error, the
/// specification invalid, where field 0 is not a kind, or field 12 holds
/// anything else or sits on another kind.
pub fn checks_delivery(content: &Value) -> Result<bool, &'static str> {
    let Value::Map(m) = content else {
        return Err("a specification's content is a map");
    };
    let field = |k: u64| m.iter().find(|(key, _)| matches!(key, Value::Uint(n) if *n == k)).map(|(_, v)| v);
    let Some(Value::Uint(kind)) = field(KIND) else {
        return Err("a specification names its kind in field 0");
    };
    match field(CHECKS_DELIVERY) {
        None => Ok(false),
        Some(Value::Bool(true)) if *kind == CMIP => Ok(true),
        Some(Value::Bool(true)) => Err("only a cMIP declares that it checks proofs of delivery (field 12, F268)"),
        Some(_) => Err("field 12, where present, is true (F268)"),
    }
}

// ---------------------------------------------------------------- the whole format (Development draft 10)

use crate::hash::{self, Hash};
use std::collections::BTreeSet;
use std::fmt;

/// The kinds of specification (Development draft 10, Part three, field 0).
pub mod kinds {
    pub const CMIP: u64 = 0;
    pub const MODULE: u64 = 1;
    pub const UNIT: u64 = 2;
    pub const MEDIA_TYPE: u64 = 3;
    pub const MIR: u64 = 4;
    pub const SIGNATURE_SCHEME: u64 = 5;
    /// The MICS document (F291).
    pub const MICS: u64 = 6;
    /// A test suite (F291).
    pub const TEST_SUITE: u64 = 7;
    /// A MIP, a proposal toward a successor protocol (F325).
    pub const MIP: u64 = 8;
}

/// A rail Module's kind, field 11 (Development draft 10, F301; Money rules
/// 11 and 18): read from the specification, never from a Module's code.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum RailKind {
    /// 0: the payee's side commits to each payment before it is made.
    Request,
    /// 1: the payer pays a published address with no request.
    Push,
}

/// What a rail Module's proof binds, field 13 (F301): 0 the payee, 1 the
/// purpose, 2 the previous hop.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Bound {
    Payee,
    Purpose,
    PreviousHop,
}

/// A rail Module's fields 11 and 13, as its specification declares them.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rail {
    pub kind: RailKind,
    pub binds: BTreeSet<Bound>,
}

impl Rail {
    /// Whether the rail's proof binds this element (Money rule 11, element
    /// by element: F328, Q4).
    pub fn binds(&self, b: Bound) -> bool {
        self.binds.contains(&b)
    }
}

/// `rule-ref = [ bytes-hash, size, budget, profile ]` (F328, Q7).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RuleRef {
    pub bytes_hash: Hash,
    pub size: u64,
    pub budget: u64,
    /// The spec hash of the machine profile the rule runs on (F326, F328 Q7).
    pub profile: Hash,
}

/// `type-def = [ type, name, payload-schema ]`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TypeDef {
    pub type_: u64,
    pub name: String,
    pub schema: String,
}

/// `fee = [ rate, ? paid ]`, `rate = [0, part] / [1, amount]`. The amount is
/// in the form the Money MIR defines; it is carried as given.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Fee {
    pub rate: Value,
    pub paid: Option<Hash>,
}

/// A specification's content, decoded (Development draft 10, Part three).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Spec {
    pub kind: u64,
    pub creator: Option<Hash>,
    pub tasks: Option<Vec<(Hash, u64)>>,
    pub types: Option<Vec<TypeDef>>,
    pub dependencies: Option<Vec<Hash>>,
    pub implements: Option<Hash>,
    pub rules: Option<Vec<RuleRef>>,
    pub fee: Option<Fee>,
    pub predecessor: Option<Hash>,
    pub text: String,
    pub layers: Option<Vec<u64>>,
    pub checks_delivery: bool,
    /// Fields 11 and 13, on a rail Module.
    pub rail: Option<Rail>,
}

/// Why content is no specification (F323): the field and the rule broken.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NoSpecification(pub String);

impl fmt::Display for NoSpecification {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "no specification: {}", self.0)
    }
}

/// The spec hashes the format names: the payment cMIP, whose Modules carry
/// fields 11 and 13 (F301). Unset, a Module naming a payment cMIP the
/// decoder does not know is read without that requirement, and the caller
/// says so.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Known {
    pub payment_cmip: Option<Hash>,
}

/// Money's payment task (Development, the task table: task 6).
pub const PAYMENT_TASK: u64 = 6;

/// A specification decoded with the payment cMIP told from bytes
/// ([`Spec::decode_judged`]).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Judged {
    Spec(Spec),
    NoSpecification(NoSpecification),
    /// Whether it is a specification rests on a specification this verifier
    /// does not hold: the cMIP its field 5 names.
    Unknown(Hash),
}

fn no<T>(w: impl Into<String>) -> Result<T, NoSpecification> {
    Err(NoSpecification(w.into()))
}

fn as_hash(v: &Value, w: &str) -> Result<Hash, NoSpecification> {
    match v {
        Value::Bytes(b) => Hash::try_from(b.as_slice()).or_else(|_| no(format!("{w}: a 32-byte hash"))),
        _ => no(format!("{w}: a 32-byte hash")),
    }
}

fn as_uint(v: &Value, w: &str) -> Result<u64, NoSpecification> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => no(format!("{w}: an unsigned integer")),
    }
}

fn as_text(v: &Value, w: &str) -> Result<String, NoSpecification> {
    match v {
        Value::Text(t) => Ok(t.clone()),
        _ => no(format!("{w}: a text string")),
    }
}

fn nonempty<'a>(v: &'a Value, w: &str) -> Result<&'a [Value], NoSpecification> {
    match v {
        Value::Array(a) if !a.is_empty() => Ok(a),
        _ => no(format!("{w}: a non-empty array")),
    }
}

/// A list of small numbers, ascending and without repeats, each in `allowed`.
fn ascending(v: &Value, w: &str, allowed: &[u64], may_be_empty: bool) -> Result<Vec<u64>, NoSpecification> {
    let Value::Array(a) = v else { return no(format!("{w}: an array")) };
    if a.is_empty() && !may_be_empty {
        return no(format!("{w}: a non-empty array"));
    }
    let mut out: Vec<u64> = vec![];
    for x in a {
        let n = as_uint(x, w)?;
        if !allowed.contains(&n) {
            return no(format!("{w}: {n} is not one of {allowed:?}"));
        }
        if out.last().is_some_and(|l| *l >= n) {
            return no(format!("{w}: ascending, without repeats"));
        }
        out.push(n);
    }
    Ok(out)
}

impl Spec {
    /// Decode a specification's encoded content, strictly (Development
    /// draft 10, Part three; F322, F323, F325, F301; F328 Q4 to Q10).
    /// Content not in the format is no specification: an act naming it is
    /// unknown to every client, since none can have adopted it.
    pub fn decode(encoded: &[u8], known: &Known) -> Result<Spec, NoSpecification> {
        let v = crate::cbor::decode(encoded).map_err(|e| NoSpecification(format!("not deterministic CBOR: {e}")))?;
        crate::text::check_value(&v).map_err(|e| NoSpecification(format!("a text that is not canonical: {e}")))?;
        Self::from_value(&v, known)
    }

    /// [`Self::decode`], from the decoded map.
    pub fn from_value(v: &Value, known: &Known) -> Result<Spec, NoSpecification> {
        use kinds::*;
        let Value::Map(m) = v else { return no("its content is a map") };
        let mut fields: Vec<(u64, &Value)> = vec![];
        for (k, x) in m {
            match k {
                Value::Uint(n) if *n <= 13 => fields.push((*n, x)),
                _ => return no("a field the format does not define"),
            }
        }
        let get = |k: u64| fields.iter().find(|(n, _)| *n == k).map(|(_, x)| *x);
        let kind = as_uint(get(0).ok_or_else(|| NoSpecification("field 0, its kind, is required".into()))?, "field 0, the kind")?;
        if kind > MIP {
            return no(format!("field 0: {kind} is not a kind of the format (0 to 8)"));
        }
        let text = as_text(get(9).ok_or_else(|| NoSpecification("field 9, its text, is required".into()))?, "field 9, the text")?;
        let creator = get(1).map(|x| as_hash(x, "field 1, the creator")).transpose()?;
        // F291, F325: a MIR, the MICS document and a test suite carry no
        // creator; every other kind carries one (F322).
        match (kind, creator) {
            (MIR | MICS | TEST_SUITE, Some(_)) => return no("a MIR, the MICS document and a test suite name no creator (field 1)"),
            (MIR | MICS | TEST_SUITE, None) => {}
            (_, None) => return no("field 1, the creator, is required for this kind (F322)"),
            _ => {}
        }
        let tasks = get(2)
            .map(|x| {
                nonempty(x, "field 2, the tasks")?
                    .iter()
                    .map(|t| match t {
                        Value::Array(a) if a.len() == 2 => Ok((as_hash(&a[0], "field 2: a task's MIR")?, as_uint(&a[1], "field 2: a task's number")?)),
                        _ => no("field 2: a task is [mir, task]"),
                    })
                    .collect::<Result<Vec<_>, _>>()
            })
            .transpose()?;
        let types = get(3)
            .map(|x| {
                nonempty(x, "field 3, the types")?
                    .iter()
                    .map(|t| match t {
                        Value::Array(a) if a.len() == 3 => Ok(TypeDef {
                            type_: as_uint(&a[0], "field 3: a type's number")?,
                            name: as_text(&a[1], "field 3: a type's name")?,
                            schema: as_text(&a[2], "field 3: a type's schema")?,
                        }),
                        _ => no("field 3: a type is [type, name, payload-schema]"),
                    })
                    .collect::<Result<Vec<_>, _>>()
            })
            .transpose()?;
        let dependencies = get(4)
            .map(|x| nonempty(x, "field 4, the dependencies")?.iter().map(|h| as_hash(h, "field 4: a dependency")).collect::<Result<Vec<_>, _>>())
            .transpose()?;
        let implements = get(5).map(|x| as_hash(x, "field 5, what it implements")).transpose()?;
        if kind == MODULE && implements.is_none() {
            return no("field 5, the cMIP a Module implements or the MIR it works under, is required for a Module (F322, F328 Q6)");
        }
        if kind != MODULE && implements.is_some() {
            return no("field 5 is a Module's");
        }
        let rules = get(6)
            .map(|x| {
                nonempty(x, "field 6, the verification rules")?
                    .iter()
                    .map(|r| match r {
                        Value::Array(a) if a.len() == 4 => Ok(RuleRef {
                            bytes_hash: as_hash(&a[0], "field 6: a rule's bytes hash")?,
                            size: as_uint(&a[1], "field 6: a rule's size")?,
                            budget: as_uint(&a[2], "field 6: a rule's budget")?,
                            profile: as_hash(&a[3], "field 6: a rule's profile")?,
                        }),
                        _ => no("field 6: a rule is [bytes-hash, size, budget, profile] (F328, Q7)"),
                    })
                    .collect::<Result<Vec<_>, _>>()
            })
            .transpose()?;
        let fee = get(7)
            .map(|x| -> Result<Fee, NoSpecification> {
                let Value::Array(a) = x else { return no("field 7, the fee: [rate, ? paid]") };
                if !(1..=2).contains(&a.len()) {
                    return no("field 7, the fee: [rate, ? paid]");
                }
                match &a[0] {
                    Value::Array(r) if r.len() == 2 && r[0] == Value::Uint(0) => {
                        as_uint(&r[1], "field 7: a rate's part in millionths")?;
                    }
                    Value::Array(r) if r.len() == 2 && r[0] == Value::Uint(1) => {}
                    _ => return no("field 7: a rate is [0, part] or [1, amount]"),
                }
                Ok(Fee { rate: a[0].clone(), paid: a.get(1).map(|p| as_hash(p, "field 7: who is paid")).transpose()? })
            })
            .transpose()?;
        let predecessor = get(8).map(|x| as_hash(x, "field 8, the predecessor")).transpose()?;
        if kind == MIP && predecessor.is_none() {
            return no("field 8, the MIR or MIP a MIP forks, or the MICS document for a new layer, is required for a MIP (F325, F328 Q10)");
        }
        let layers = get(10).map(|x| ascending(x, "field 10, the layers", &[0, 1, 2, 3, 4], false)).transpose()?;
        let checks_delivery = match get(12) {
            None => false,
            Some(Value::Bool(true)) if kind == CMIP => true,
            Some(Value::Bool(true)) => return no("only a cMIP declares that it checks proofs of delivery (field 12, F268)"),
            Some(_) => return no("field 12, where present, is true (F268)"),
        };
        let rail = match (get(11), get(13)) {
            (None, None) => None,
            (Some(k), Some(b)) if kind == MODULE => {
                let kind_ = match as_uint(k, "field 11, the rail's kind")? {
                    0 => RailKind::Request,
                    1 => RailKind::Push,
                    n => return no(format!("field 11: {n} is not a rail's kind (0 request, 1 push)")),
                };
                let binds: BTreeSet<Bound> = ascending(b, "field 13, what the proof binds", &[0, 1, 2], true)?
                    .into_iter()
                    .map(|n| match n {
                        0 => Bound::Payee,
                        1 => Bound::Purpose,
                        _ => Bound::PreviousHop,
                    })
                    .collect();
                // F328 Q5 (FR11): a request rail binds payee and purpose.
                if kind_ == RailKind::Request && !(binds.contains(&Bound::Payee) && binds.contains(&Bound::Purpose)) {
                    return no("a request rail (field 11 is 0) binds payee and purpose: field 13 holds 0 and 1 (F328, Q5)");
                }
                Some(Rail { kind: kind_, binds })
            }
            (Some(_), Some(_)) => return no("fields 11 and 13 are a rail Module's"),
            _ => return no("fields 11 and 13 go together: a rail Module carries both (F301)"),
        };
        // F301: a Module under the payment cMIP carries fields 11 and 13.
        if kind == MODULE && known.payment_cmip.is_some() && implements == known.payment_cmip && rail.is_none() {
            return no("a Module naming the payment cMIP carries fields 11 and 13, the rail's kind and what its proof binds (F301)");
        }
        Ok(Spec { kind, creator, tasks, types, dependencies, implements, rules, fee, predecessor, text, layers, checks_delivery, rail })
    }

    /// Whether this is a payment cMIP (Development, "A rail Module's kind
    /// and binding"): a cMIP whose field 2 lists Money's payment task,
    /// `[money, 6]`, `money` being the Money MIR's spec hash.
    pub fn is_payment_cmip(&self, money: &Hash) -> bool {
        self.kind == kinds::CMIP && self.tasks.iter().flatten().any(|(m, t)| m == money && *t == PAYMENT_TASK)
    }

    /// Decode a specification's content as Development 11 has it, the
    /// payment cMIP told from bytes: a Module whose field 5 names a payment
    /// cMIP (one whose own field 2 lists Money's task 6) must carry fields 11
    /// and 13. `cmip` gives the content, encoded, of a specification the
    /// verifier holds, by hash, the MIRs it ships among them (rule 26; the
    /// Money MIR is known by `money`). A Module lacking fields 11 and 13 whose field
    /// 5 names a specification the verifier does not hold is unknown (that
    /// hash); one naming a held payment cMIP is no specification. Held
    /// content not in the format is no specification, so no payment cMIP.
    /// Every other answer is [`Self::decode`]'s with no payment cMIP named.
    pub fn decode_judged(encoded: &[u8], money: &Hash, cmip: &dyn Fn(&Hash) -> Option<Vec<u8>>) -> Judged {
        let s = match Self::decode(encoded, &Known::default()) {
            Ok(s) => s,
            Err(e) => return Judged::NoSpecification(e),
        };
        if s.kind != kinds::MODULE || s.rail.is_some() {
            return Judged::Spec(s);
        }
        let Some(target) = s.implements else { return Judged::Spec(s) };
        // A Module working under the Money MIR names it (Development, "What
        // each kind must carry"): a MIR, kind 4, is no payment cMIP, and
        // every verifier holds the MIRs whose hashes it accepts (rule 26).
        // The other MIRs reach this function only through `cmip`.
        if target == *money {
            return Judged::Spec(s);
        }
        let Some(bytes) = cmip(&target) else { return Judged::Unknown(target) };
        match Self::decode(&bytes, &Known::default()) {
            Ok(c) if c.is_payment_cmip(money) => Judged::NoSpecification(NoSpecification(
                "a Module whose field 5 names a payment cMIP (its field 2 lists Money's task 6) carries fields 11 and 13".into(),
            )),
            _ => Judged::Spec(s),
        }
    }

    /// The spec hash of encoded content: `tagged_hash("MOR/spec", content)`.
    pub fn hash_of(encoded: &[u8]) -> Hash {
        hash::spec_hash(encoded)
    }

    /// The text a specification's file holds (Development rule 26): the
    /// file's content with at most one final line break removed, and
    /// nothing else. Every other line of the file, its header included, is
    /// part of the text; at the freeze each header is the text's name alone,
    /// so the frozen file is the hashed text. Nothing on a verdict's path
    /// drops a line: a draft's status line is dropped only by a tool that
    /// says so ([`Self::draft_without_status_line`]).
    pub fn frozen_text(file: &str) -> String {
        file.strip_suffix('\n').unwrap_or(file).to_string()
    }

    /// A tool's option, never on a verdict's path: a draft's file read as
    /// the frozen file would be once its status line is removed, the first
    /// line (`# ` and the name) followed by a blank line, one line in
    /// italics beginning `*Draft ` or `*Version ` and a blank line, that
    /// italic line and the blank line before it dropped. For showing what a
    /// draft would hash to at the freeze; the hash of the file itself is
    /// [`Self::mir_file_hash`].
    pub fn draft_without_status_line(file: &str) -> String {
        let t = Self::frozen_text(file);
        let mut lines = t.split('\n');
        let (Some(first), Some(blank), Some(status), after) = (lines.next(), lines.next(), lines.next(), lines.next()) else {
            return t;
        };
        let draft = (status.starts_with("*Draft ") || status.starts_with("*Version ")) && status.ends_with('*');
        if first.starts_with("# ") && blank.is_empty() && draft && after == Some("") {
            let head = first.len() + 1 + blank.len() + 1 + status.len() + 1;
            return format!("{first}\n{}", &t[head..]);
        }
        t
    }

    /// The content of a core document's file, as rule 26 hashes it: kind 4
    /// (a MIR), 6 (the MICS document) or 7 (a test suite), and the text the
    /// file holds ([`Self::frozen_text`]), which must be canonical text: a file
    /// with two final line breaks, or a trailing space, is refused.
    pub fn file_content(kind: u64, file: &str) -> Result<Vec<u8>, String> {
        let text = Self::frozen_text(file);
        crate::text::check(&text).map_err(|e| format!("not canonical text: {e}"))?;
        Ok(crate::cbor::encode(&Value::Map(vec![(Value::Uint(0), Value::Uint(kind)), (Value::Uint(9), Value::Text(text))])))
    }

    /// A MIR's spec hash from its file (Development rule 26).
    pub fn mir_file_hash(file: &str) -> Result<Hash, String> {
        Ok(Self::hash_of(&Self::file_content(kinds::MIR, file)?))
    }

    /// A MIR's content as the format writes it: kind 4 and the text, no
    /// creator (F291, rule 26): what a client hashes to recompute the root
    /// from a text it ships (F324).
    pub fn mir_content(text: &str) -> Vec<u8> {
        crate::cbor::encode(&Value::Map(vec![(Value::Uint(0), Value::Uint(kinds::MIR)), (Value::Uint(9), Value::Text(text.into()))]))
    }
}
