//! What a specification declares about itself that the core library reads
//! (Development draft 7, Part three, "The specification format").
//!
//! In plain words: a specification says what kind of thing it is (a cMIP,
//! a Module, a unit…). A cMIP that checks proofs of delivery says so, by
//! one field, so that verifiers can find checkers and the core asks only
//! those (F268, decided 12 October 2026: a proof checker is not a task; "a
//! cMIP that checks proofs of delivery declares so in its specification by
//! one field (as rail Modules declare their kind), so checkers stay
//! discoverable").
//!
//! ```cddl
//! spec = {
//!   0 => uint,      ; kind: 0 cMIP, 1 Module, 2 unit, 3 media type, 4 MIP, 5 signature scheme
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
