//! Control models (Agreements draft 18, rule 99): the boundary every
//! control cMIP meets, shaped like the proven delivery's checker
//! ([`super::proofs::ProofChecker`]).
//!
//! In plain words: a collective may name, in its terms' field 35, a cMIP
//! and its parameters. The core never reads the parameters. A model the
//! verifier holds answers the core's queries from them: the areas it gives
//! (id, holders, number, reach), their words, the holders' rule of each
//! stake, and an issuance's offer. The core counts; the model never does.
//! A model the verifier does not hold answers nothing, and what depends on
//! it is unknown to that verifier.

use super::formats::{Area, HoldersEntry, IssuesUnder, Terms, R};
use crate::cbor::Value;
use crate::hash::Hash;
use std::rc::Rc;

/// A model's answers to the queries of rule 99, read from its parameters.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Answers {
    pub areas: Option<Vec<Area>>,
    pub area_words: Option<Vec<(u64, String)>>,
    pub holders_rules: Option<Vec<HoldersEntry>>,
    pub issues_under: Option<IssuesUnder>,
}

/// A control model (rule 99), as a verifier holds it.
pub trait ControlModel {
    /// The answers to the queries, read from the model's parameters; an
    /// error where the parameters are outside the model's format (refused).
    fn read(&self, params: &Value) -> R<Answers>;
    /// The model's encoder of its answers, where it has one: terms read
    /// through it then encode their parameters from their answers, so a copy
    /// changed in memory encodes the change (and an unchanged one, the same
    /// bytes, its encoding being deterministic).
    fn pack(&self) -> Option<fn(&Terms) -> Value> {
        None
    }
}

/// The control models a verifier holds, by cMIP.
pub type Held = Vec<(Hash, Rc<dyn ControlModel>)>;

/// Fill `t`'s answers from the model `held` names for its field 35. `Ok(false)`
/// where the terms name a model the verifier does not hold.
pub fn fill(t: &mut Terms, held: &Held) -> R<bool> {
    let Some(c) = &t.control else { return Ok(true) };
    let Some((_, m)) = held.iter().find(|(h, _)| *h == c.cmip) else { return Ok(false) };
    let a = m.read(&c.params)?;
    t.areas = a.areas;
    t.area_words = a.area_words;
    t.holders_rules = a.holders_rules;
    t.issues_under = a.issues_under;
    let pack = m.pack();
    if let Some(c) = t.control.as_mut() {
        c.pack = pack;
    }
    Ok(true)
}
