//! Control models (Agreements draft 19, rule 99): the boundary every
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

//! ## The line as data (rule 99's "What a control model accepts")
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
    /// Its payload, read by the model.
    pub offer: R<OfferRead>,
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
    pub latest: Option<(ProxyRead, bool)>,
}


/// What an act of a model's own specification is to the core (rule 99,
/// "A model's own acts"), by the type the model's specification declares:
/// the core gathers the line's facts for it accordingly.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ActKind {
    /// An offer holders take up by a signature act naming it, with its
    /// payment where it names a price (the default model's issuance offer).
    Offer,
    /// A holder's act handing its vote on a stake to another identity (the
    /// default model's proxy).
    Proxy,
    /// A holder's act ending its own proxy (the default model's revocation
    /// of a proxy).
    Revocation,
    /// Any other act of the model, placed by the line and handed over as it
    /// is.
    Other,
}

/// An offer as the core reads it, from the model's reading of its payload.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OfferRead {
    /// The version of the collective's agreement defining the stake.
    pub version: Hash,
    /// The stake, by its index there.
    pub stake: u64,
    /// The new shares' part of the stake after the issuance, in millionths.
    pub size: u64,
    /// The new holders and their parts, in millionths.
    pub new_holders: Vec<(Hash, u64)>,
    /// The period: a point on the agreement's time reference.
    pub period: Value,
    /// The price of the whole issuance, each holder taking up paying its
    /// proportion; absent, none.
    pub price: Option<crate::money::Amount>,
}

/// A proxy as the core reads it, from the model's reading of its payload.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ProxyRead {
    /// The version of the collective's agreement defining the stake.
    pub version: Hash,
    /// The stake, by its index there.
    pub stake: u64,
    /// The identity whose signature act counts as the holder's vote.
    pub proxy: Hash,
    /// The version it votes on; absent, standing.
    pub scoped: Option<Hash>,
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
    /// The act types the model's specification declares, and what each is
    /// to the core (rule 99, "A model's own acts"); `None`, a type it does
    /// not declare: an act of it is invalid.
    fn act_kind(&self, type_: u64) -> Option<ActKind> {
        let _ = type_;
        None
    }
    /// Whether an act of the model's specification is in its type's format
    /// (Dependencies; rule 99): an error makes it invalid.
    fn act_format(&self, inside: &crate::act::Inside) -> R<()> {
        let _ = inside;
        Err(AgreementsError::Shape("this control model declares no acts"))
    }
    /// An act of kind [`ActKind::Offer`], read.
    fn read_offer(&self, inside: &crate::act::Inside) -> R<OfferRead> {
        let _ = inside;
        Err(AgreementsError::Shape("this control model declares no offer"))
    }
    /// An act of kind [`ActKind::Proxy`], read.
    fn read_proxy(&self, inside: &crate::act::Inside) -> R<ProxyRead> {
        let _ = inside;
        Err(AgreementsError::Shape("this control model declares no proxy"))
    }
    /// An act of kind [`ActKind::Revocation`]: the act it ends.
    fn read_revocation(&self, inside: &crate::act::Inside) -> R<Hash> {
        let _ = inside;
        Err(AgreementsError::Shape("this control model declares no revocation"))
    }
    /// Whether a holder's vote is cast by its proxy, from the line's facts
    /// (`proxy_signed`: whether the proxy's signature act is among those the
    /// line names; `version`: the version voted on).
    fn proxy_votes(&self, facts: &ProxyFacts, version: &Hash, proxy_signed: &dyn Fn(&Hash) -> bool) -> bool {
        let _ = (facts, version, proxy_signed);
        false
    }
}

/// The model's answer for an operational clone, overreaching where it
/// reaches the constitution or the judicial tier (rule 99): then set
/// aside, and the clone judged as this MIR alone judges it.
pub fn checked(powers: Vec<Power>) -> R<Vec<Power>> {
    if powers.iter().any(|p| matches!(p, Power::Constitutional | Power::Judicial | Power::Plan(_))) {
        return Err(AgreementsError::Check("a control model names no power for the constitution or the judicial tier (rules 67, 98, 99): overreaching"));
    }
    Ok(powers)
}

/// A model's answer, in rule 99's format (`answer`), as the core reads it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Answer {
    /// `[0, [0]]`: no power of the model reaches the act.
    NoArea,
    /// `[0, [1, area]]`: the area of this id reaches the act.
    Area(u64),
    /// `[1, clone-answer]`: the powers the clone's operational changes need,
    /// each with the parties it is counted among and its rule; and the
    /// holders for whom a stake's holders consenting together stand in.
    Clone { powers: Vec<(Power, Vec<Hash>, super::formats::Rule)>, stand_in: Vec<(Hash, Power)> },
    /// `[2, reason]`: refused; the act or clone is invalid.
    Refused(String),
    /// `[3]`: unknown.
    Unknown,
}

/// Read a model's answer in rule 99's format. `Err` where it is outside the
/// format, or reaches what a model may never decide (a power for the
/// constitution, a succession plan or the judicial tier): overreaching, set
/// aside (rule 99).
pub fn read_answer(v: &Value) -> R<Answer> {
    use super::formats::{hash, tuple, uint};
    let over = |w: &'static str| AgreementsError::Check(w);
    let Value::Array(a) = v else { return Err(over("an answer is an array: overreaching")) };
    let (Some(tag), rest) = (a.first(), &a[a.len().min(1)..]) else { return Err(over("an answer names its kind: overreaching")) };
    let ascending = |hs: &[Hash]| hs.windows(2).all(|w| w[0] < w[1]);
    match (uint(tag, "an answer names its kind: overreaching")?, rest) {
        (0, [x]) => {
            let Value::Array(b) = x else { return Err(over("an act's answer is [0] or [1, area]: overreaching")) };
            match b.as_slice() {
                [Value::Uint(0)] => Ok(Answer::NoArea),
                [Value::Uint(1), Value::Uint(id)] => Ok(Answer::Area(*id)),
                _ => Err(over("an act's answer is [0] or [1, area]: overreaching")),
            }
        }
        (1, [Value::Map(m)]) => {
            let mut powers = vec![];
            let mut stand_in = vec![];
            for (k, x) in m {
                match k {
                    Value::Uint(0) => {
                        let Value::Array(ps) = x else { return Err(over("a clone's answer: its powers, an array: overreaching")) };
                        for p in ps {
                            let t = tuple(p, 3, "a counted power is [power, among, rule]: overreaching")?;
                            let power = super::formats::power(&t[0]).map_err(|_| over("a counted power names a power of the mark's grammar: overreaching"))?;
                            if matches!(power, Power::Constitutional | Power::Judicial | Power::Plan(_)) {
                                return Err(over("a control model names no power for the constitution, a succession plan or the judicial tier (rules 67, 83, 98, 99): overreaching"));
                            }
                            let Value::Array(am) = &t[1] else { return Err(over("a counted power's parties: overreaching")) };
                            let among = am.iter().map(|h| hash(h, "a counted power's parties: overreaching")).collect::<R<Vec<_>>>()?;
                            if among.is_empty() || !ascending(&among) {
                                return Err(over("a counted power's parties, ascending, none twice: overreaching"));
                            }
                            let rule = super::formats::rule(&t[2]).map_err(|_| over("a counted power's rule, in the terms' grammar: overreaching"))?;
                            powers.push((power, among, rule));
                        }
                        let enc: Vec<Vec<u8>> = powers.iter().map(|(p, _, _)| p.encoding()).collect();
                        if !enc.windows(2).all(|w| w[0] < w[1]) {
                            return Err(over("a clone's answer: its powers ascending, none twice: overreaching"));
                        }
                    }
                    Value::Uint(1) => {
                        let Value::Array(hs) = x else { return Err(over("a clone's answer: its stand-ins, an array: overreaching")) };
                        if hs.is_empty() {
                            return Err(over("a clone's answer: its stand-ins, none empty: overreaching"));
                        }
                        for e in hs {
                            let t = tuple(e, 2, "a stand-in is [holder, power]: overreaching")?;
                            let p = super::formats::power(&t[1]).map_err(|_| over("a stand-in's power: overreaching"))?;
                            if !matches!(p, Power::Holders(_)) {
                                return Err(over("a stand-in's power is a stake's holders' rule, [5, stake]: overreaching"));
                            }
                            stand_in.push((hash(&t[0], "a stand-in's holder: overreaching")?, p));
                        }
                        let hs: Vec<Hash> = stand_in.iter().map(|(h, _)| *h).collect();
                        if !ascending(&hs) {
                            return Err(over("a clone's answer: its stand-ins ascending by holder, none twice: overreaching"));
                        }
                    }
                    _ => return Err(over("a clone's answer has keys 0 and 1: overreaching")),
                }
            }
            if !m.iter().any(|(k, _)| *k == Value::Uint(0)) {
                return Err(over("a clone's answer names its powers (key 0): overreaching"));
            }
            Ok(Answer::Clone { powers, stand_in })
        }
        (2, [Value::Text(w)]) => Ok(Answer::Refused(w.clone())),
        (3, []) => Ok(Answer::Unknown),
        _ => Err(over("an answer is [0, act-answer], [1, clone-answer], [2, reason] or [3]: overreaching")),
    }
}

/// The control models a verifier holds, by cMIP.
pub type Held = Vec<(Hash, Rc<dyn ControlModel>)>;

/// Fill `t`'s answers from the model `held` names for its field 35. `Ok(false)`
/// where the terms name a model the verifier does not hold.
pub fn fill(t: &mut Terms, held: &Held) -> R<bool> {
    let Some(c) = &t.control else { return Ok(true) };
    let Some((_, m)) = held.iter().find(|(h, _)| *h == c.cmip) else { return Ok(false) };
    let mut a = m.read(&c.params)?;
    // An area's holders are parties of the agreement in force (rule 99,
    // `area-answer`): in a clone, a holder who is no party (removed, or
    // passed on by succession, rules 69 and 83, the parameters left as they
    // were) is read out of its areas. Its terms then encode their parameters
    // as written, never from the answers read out.
    let mut pack = m.pack();
    if t.parent.is_some() {
        for x in a.areas.iter_mut().flatten() {
            if x.holders.iter().any(|h| !t.parties.contains(h)) {
                x.holders.retain(|h| t.parties.contains(h));
                pack = None;
            }
        }
    }
    t.areas = a.areas;
    t.area_words = a.area_words;
    t.holders_rules = a.holders_rules;
    t.issues_under = a.issues_under;
    if let Some(c) = t.control.as_mut() {
        c.pack = pack;
    }
    Ok(true)
}
