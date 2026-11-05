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

//! ## The line as data (S7m-5's design; the code still to follow it)
//!
//! A model never calls back into the view. Where it needs the collective's
//! line to answer (an issuance's offer and take-ups, a proxy's vote), the
//! core computes, at the line that would put the act or clone in force, and
//! hands over as plain data:
//!
//! - **the voices**: the parties whose voice remains there (rule 65);
//! - **the roster**: for each stake, its holders and shares, field 7 of
//!   the agreement in force with the transfers the line placed applied
//!   (rule 10);
//! - **the signatures**: for the act or clone judged, each signature act
//!   the line places on it, by its signer (rules 6, 58);
//! - **the model's placed acts**: every act of the model's own
//!   specification (an offer, a take-up, a proxy and its revocation) the
//!   line placed, each with its signer, its payload and whether it lies
//!   before that line ("Made before, made after");
//! - **the facts the caller states**: what was paid toward each act a
//!   payment names (Money), and, on the agreement's time reference, which
//!   acts lie within a period and which periods lapsed (rule 33).
//!
//! The model answers from these alone; the core counts (rule 65). These
//! are rule 99's "collective's line at the act", spelled out.

use super::formats::{Area, AgreementsError, HoldersEntry, IssuesUnder, Power, Terms, R};
use super::tiers::Change;
use crate::cbor::Value;
use crate::hash::Hash;
use std::collections::BTreeSet;
use std::rc::Rc;

/// What the core reads, at the line that would put an issuance in force, for
/// a model to judge it (the line as data; Agreements rules 98.2 and 99).
/// Each fact the core could not read is an error the model returns where its
/// judgment reaches it, never earlier.
pub struct IssuanceFacts {
    /// The one stake the clone changes, where exactly one changes.
    pub stake: Option<usize>,
    /// That stake's holders and shares at the line (field 7 with the placed
    /// transfers applied, rule 10).
    pub roster: R<Vec<(Hash, u64)>>,
    /// The holders whose signature acts on the clone the line places.
    pub signed: BTreeSet<Hash>,
    /// The act the issuance names as its offer, where it names one.
    pub offer: Option<R<OfferFacts>>,
}

/// An issuance offer as the line places it (the default control cMIP's
/// type 26), read by the core.
pub struct OfferFacts {
    /// Whether the act is of the offer's type.
    pub is_offer: bool,
    /// Its payload, decoded.
    pub offer: R<super::owners::IssuanceOffer>,
    /// Whether it offers the stake changed, of a version of this agreement.
    pub ours: bool,
    /// The rest, read where the offer is the collective's own: `Err` where
    /// the version it names cannot be read.
    pub placed: R<OfferPlaced>,
}

/// What the line shows of an offer.
pub struct OfferPlaced {
    /// An act of the collective that is done (rule 57).
    pub done: bool,
    /// Placed before the line putting the issuance in force.
    pub before: bool,
    /// The agreement names a time reference for its period.
    pub has_time: bool,
    /// It reached every holder at its own line, in order: `Ok(false)` at the
    /// first it did not reach.
    pub reached_all: R<bool>,
    /// The caller states its period lapsed (rule 33).
    pub lapsed: bool,
    /// For each holder at the issuance's line, in the roster's order,
    /// whether it took up its proportion: a signature act naming the offer,
    /// kept at the line, within the period where it lapsed, paid at least
    /// its part of the price.
    pub took_up: Vec<(Hash, R<bool>)>,
}

/// What the core reads of a holder's proxy on a stake, at a line (the line
/// as data; the default control cMIP's rule 97).
pub struct ProxyFacts {
    /// The holder placed a signature act of its own on the version at or
    /// before the line.
    pub own_vote: bool,
    /// The holder's latest proxy on the stake the line placed, a holder of
    /// the stake where it was placed, and whether a revocation of it was
    /// placed before the line.
    pub latest: Option<(super::owners::Proxy, bool)>,
}


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
    /// The model's check of its answers against the terms that carry them:
    /// an error where its parameters are outside its format (refused).
    fn check(&self, t: &Terms, mirs: &super::formats::Mirs) -> R<()> {
        let _ = (t, mirs);
        Ok(())
    }
    /// The powers a clone of a collective's agreement needs for its
    /// operational changes `ops` (never a constitutional or judicial one,
    /// which the core reads itself, rules 67 and 98): each a power in the
    /// mark's grammar, which the core counts (rule 65). `ops` empty: what a
    /// clone changing nothing needs. `ext_layers` gives the layers an
    /// extension declares. An answer naming the constitutional change rule
    /// or the judicial tier's rule is refused.
    fn clone_powers(&self, parent: &Terms, clone: &Terms, ops: &[Change], ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>) -> R<Vec<Power>> {
        let _ = (parent, clone, ops, ext_layers);
        Err(AgreementsError::Check("this control model names no powers for clones"))
    }
    /// A clone that is an issuance (its answers name what it issues under),
    /// judged from the line's facts: `Ok(Some(excused))`, the holders whose
    /// share it scales down under a holders' rule they accepted (who then do
    /// not sign for themselves, rule 98.2); `Err(state)` where it fails.
    fn issuance(&self, parent: &Terms, clone: &Terms, facts: &IssuanceFacts) -> R<Result<Option<Vec<Hash>>, super::view::CloneState>> {
        let _ = (parent, clone, facts);
        Ok(Ok(None))
    }
    /// Whether a holder's vote is cast by its proxy, from the line's facts
    /// (`proxy_signed`: whether the proxy's signature act is among those the
    /// line names; `version`: the version voted on).
    fn proxy_votes(&self, facts: &ProxyFacts, version: &Hash, proxy_signed: &dyn Fn(&Hash) -> bool) -> bool {
        let _ = (facts, version, proxy_signed);
        false
    }
}

/// The model's answer for an operational clone, refused where it reaches
/// the constitution or the judicial tier (rule 99).
pub fn checked(powers: Vec<Power>) -> R<Vec<Power>> {
    if powers.iter().any(|p| matches!(p, Power::Constitutional | Power::Judicial | Power::Plan(_))) {
        return Err(AgreementsError::Check("a control model names no power for the constitution or the judicial tier (rules 67, 98, 99): refused"));
    }
    Ok(powers)
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
