//! The Law MIP's exact formats (Law draft 9, "Act formats"), and the checks
//! that need no other act.
//!
//! In plain words: terms (an agreement's proposal), with the fields draft 7
//! adds (a clone's mark, the constitutional change rule, areas and their
//! words); the key grammar, which no longer lists act types; signatures;
//! resignations (leaving, or stepping down from one area); records (the
//! collective's everyday line); grants, which a collective may issue within
//! an area, and which may reinstate an ended grant; abandonment declarations
//! (draft 8, B12).
//!
//! Terms fields whose formats are still open (stakes, the split plan, the
//! fork rule, refund terms) are refused as unsupported: a client never signs
//! or accepts what it does not implement (Envelope rule 11, fail closed).

use crate::act::{Inside, Object};
use crate::cbor::{self, Value};
use crate::hash::Hash;
use crate::identity::{Declaration, KeptTip, SigningKey};
use std::fmt;

/// The Law act types (Law, "Act formats").
pub mod types {
    pub const TERMS: u64 = 0;
    pub const SIGNATURE: u64 = 1;
    pub const KEEPER_RECORD: u64 = 2;
    pub const WORK_CLAIM: u64 = 3;
    /// A public domain release (rule 17, F121 shape D).
    pub const RELEASE: u64 = 5;
    pub const STANDING_OFFER: u64 = 6;
    /// A split (rules 20 to 24, F121 Q9).
    pub const SPLIT: u64 = 8;
    pub const GRANT: u64 = 9;
    pub const REVOCATION: u64 = 10;
    /// An import (rule 41): the grantor adopting acts of an ended grant
    /// (format open). The handover is withdrawn (F129, H3).
    pub const IMPORT: u64 = 11;
    pub const DECLARATION: u64 = 13;
    /// A contest of a declaration of absence (rule 52; BQ4, F188).
    pub const CONTEST: u64 = 14;
    pub const RESIGNATION: u64 = 16;
    pub const RECORD: u64 = 17;
    /// A negotiation message (F118, rule 56).
    pub const NEGOTIATION: u64 = 18;
    /// The fork of a collective (rule 47a, F121 shape B).
    pub const FORK: u64 = 19;
    /// The closing of a collective that holds nothing (rule 47a, F124 N9).
    pub const CLOSING: u64 = 20;
    /// A party's request that the arbitrator settle a deal's fork (rule
    /// 45b; DQ8, F188).
    pub const SETTLEMENT_REQUEST: u64 = 22;
    /// The arbitrator's settlement of a deal's fork, naming the request
    /// that activated it (rule 45b; DQ8, F188).
    pub const FORK_SETTLEMENT: u64 = 23;
    /// A notice to a payer owed money back who gave no address (rule 37d;
    /// F197): sealed to the payer, with a deadline on a time reference.
    pub const NOTICE: u64 = 24;
    // 21, the creditor's release (F125), is retired and never reused: it is
    // a Finance act (Finance type 4, F126).
}

/// The declaration kinds Law defines (Identity, declarations slot).
pub mod kinds {
    /// The agreement a collective lives under: its founding agreement at
    /// genesis (the terms' id), then each constitutional clone a rotation
    /// declares (`[clone, [+ signature act]]`, Flaw M).
    pub const FOUNDING_AGREEMENT: u64 = 0;
}

/// The core's layers, as Law's kinds number them (Law, `kind`).
pub mod layers {
    pub const IDENTITY: u64 = 0;
    pub const ENVELOPE_AND_TEXT: u64 = 1;
    pub const FINANCE: u64 = 2;
    pub const LAW: u64 = 3;
    pub const PRODUCTION: u64 = 4;
}

/// The highest task number (Production, task table).
pub const LAST_TASK: u64 = 14;

/// The judicial tasks: condition evaluation, time reference, anchoring,
/// absence proof (F178, F182).
pub const JUDICIAL_TASKS: [u64; 4] = [9, 10, 11, 14];

/// The absence-proof task (F172, F182): the abandonment clause's key 3
/// names its cMIP, and a chain of judgment names it as `[ 0, 14 ]`.
pub const ABSENCE_PROOF_TASK: u64 = 14;

/// The time reference task (field 6 is a naming for it, Q25).
pub const TIME_REFERENCE_TASK: u64 = 10;

/// Stakes and succession shares are written in millionths.
pub const MILLION: u64 = 1_000_000;

/// The tag of rule 15a's tie key (F150).
pub const LEFTOVER_TAG: &str = "MOR/law/leftover";

/// Rule 15a's tie key for a holder (F150): `tagged_hash("MOR/law/leftover",
/// [ act hash, holder ])`, the array encoded as CBOR, as Law writes its
/// arrays (F162, 7). Since F165 it orders only a fork's sides, by the fork
/// act every member signs (F162, 10): a split service's receipt no longer
/// orders ties, since its signer picks its salt (F165).
pub fn leftover_key(act: &Hash, holder: &Hash) -> Hash {
    let v = Value::Array(vec![Value::Bytes(act.to_vec()), Value::Bytes(holder.to_vec())]);
    crate::hash::tagged_hash(LEFTOVER_TAG, &cbor::encode(&v))
}

/// How rule 15a settles holders with equal remainders competing for fewer
/// leftover units than they are.
#[derive(Clone, Copy, Debug)]
pub enum Ties<'a> {
    /// Take turns (F165): each holder's leftover units from this stake so
    /// far, as the split service's previous split act for the stake
    /// carries them (F171), in the holders' order; the fewest first, and
    /// where counts are equal, the smallest identity hash.
    Turns(&'a [u64]),
    /// A fork's sides: by [`leftover_key`] with the fork act (F162, 10).
    Hash(&'a Hash),
    /// Nothing given decides them: a tie that decides a unit is reported,
    /// not settled ([`divide_stake`] answers `Err`).
    Open,
}

/// Rule 15a before ties: every holder its exact share rounded down, the
/// leftover units one each to the holders whose exact shares have the
/// largest fractional remainders, as far as remainders decide. `tied` are
/// the holders (indexes) with equal remainders at the cut, competing for
/// the `units` leftover units remainders do not decide; empty where none.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rounded {
    pub parts: Vec<u64>,
    pub tied: Vec<usize>,
    pub units: usize,
}

/// [`Rounded`] for `total` among `holders` (each its identity and share).
/// Shares need not sum to a million; they are divided in proportion. The
/// order in which holders are listed decides nothing (F150).
pub fn round_stake(total: u64, holders: &[(Hash, u64)]) -> Rounded {
    let sum: u128 = holders.iter().map(|(_, w)| *w as u128).sum();
    if sum == 0 {
        return Rounded { parts: vec![0; holders.len()], tied: vec![], units: 0 };
    }
    let exact: Vec<u128> = holders.iter().map(|(_, w)| total as u128 * *w as u128).collect();
    let mut parts: Vec<u64> = exact.iter().map(|e| (e / sum) as u64).collect();
    let rem: Vec<u128> = exact.iter().map(|e| e % sum).collect();
    let left = (total as u128 - parts.iter().map(|x| *x as u128).sum::<u128>()) as usize;
    if left == 0 {
        return Rounded { parts, tied: vec![], units: 0 };
    }
    let mut order: Vec<usize> = (0..holders.len()).collect();
    order.sort_by(|a, b| rem[*b].cmp(&rem[*a]));
    let cut = rem[order[left - 1]];
    let above: Vec<usize> = order.iter().copied().filter(|i| rem[*i] > cut).collect();
    let at_cut: Vec<usize> = order.iter().copied().filter(|i| rem[*i] == cut).collect();
    for i in &above {
        parts[*i] += 1;
    }
    let units = left - above.len();
    if at_cut.len() == units {
        for i in &at_cut {
            parts[*i] += 1;
        }
        return Rounded { parts, tied: vec![], units: 0 };
    }
    let mut tied = at_cut;
    tied.sort();
    Rounded { parts, tied, units }
}

/// Rule 15a (F150, F165): `total` smallest units of a payment divided
/// among a stake's `holders` (each its identity and its share), every
/// holder its exact share rounded down, and the leftover units one each to
/// the holders whose exact shares have the largest fractional remainders
/// ([`round_stake`]); holders with equal remainders settled by `ties`. The
/// parts come back in the order given, each holder's the same however they
/// are listed.
///
/// With [`Ties::Open`], a tie that decides a unit is undetermined: `Err`,
/// saying so.
pub fn divide_stake(total: u64, holders: &[(Hash, u64)], ties: Ties) -> Result<Vec<u64>, String> {
    let Rounded { mut parts, mut tied, units } = round_stake(total, holders);
    if units == 0 {
        return Ok(parts);
    }
    match ties {
        Ties::Open => return Err("holders with equal remainders compete for the leftover units, and nothing given settles the tie (rule 15a, F165)".into()),
        Ties::Turns(counts) => {
            let count = |i: usize| counts.get(i).copied().unwrap_or(0);
            tied.sort_by(|a, b| count(*a).cmp(&count(*b)).then_with(|| holders[*a].0.cmp(&holders[*b].0)));
        }
        Ties::Hash(h) => tied.sort_by_key(|i| leftover_key(h, &holders[*i].0)),
    }
    for i in &tied[..units] {
        parts[*i] += 1;
    }
    Ok(parts)
}

/// The layer of a task's MIP (Production, task table).
pub fn task_layer(task: u64) -> Option<u64> {
    match task {
        1..=3 => Some(layers::IDENTITY),
        4 | 5 => Some(layers::ENVELOPE_AND_TEXT),
        6 | 7 => Some(layers::FINANCE),
        8..=14 => Some(layers::LAW),
        _ => None,
    }
}

/// The six MIPs' spec hashes, fixed at the freeze. Law computes an act's
/// layer from its `spec` field, these hashes and the collective's own terms
/// ("Layer", F106).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Mips {
    pub identity: Hash,
    pub envelope: Hash,
    pub text: Hash,
    pub finance: Hash,
    pub law: Hash,
    pub production: Hash,
}

impl Mips {
    /// The layer of a MIP's own acts. Production defines none.
    pub fn layer(&self, spec: &Hash) -> Option<u64> {
        if spec == &self.identity {
            Some(layers::IDENTITY)
        } else if spec == &self.envelope || spec == &self.text {
            Some(layers::ENVELOPE_AND_TEXT)
        } else if spec == &self.finance {
            Some(layers::FINANCE)
        } else if spec == &self.law {
            Some(layers::LAW)
        } else if spec == &self.production {
            Some(layers::PRODUCTION)
        } else {
            None
        }
    }

    pub fn is_mip(&self, spec: &Hash) -> bool {
        self.layer(spec).is_some()
    }
}

/// Why a Law act, or an agreement, fails.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum LawError {
    /// The payload or inside is not in the type's shape. Names the field.
    Shape(&'static str),
    /// A field or act whose exact format Law has not fixed yet: refused,
    /// never accepted unchecked.
    Unsupported(&'static str),
    /// A rule of the Law MIP fails. Names it.
    Check(&'static str),
    /// An act the check needs is not held (or not opened).
    Missing(Hash),
    /// A case the texts leave unsettled, found while building: refused
    /// rather than guessed (CLAUDE.md: never guess at a rule).
    Unsettled(&'static str),
    /// Unknown: the answer rests on this verifier's own failed attempts to
    /// reach a home (an identity "re-homed without audit"), and nothing
    /// binding rests on them (Identity, the sentence after rule 17, F153).
    /// It is neither valid nor invalid until it no longer rests on them.
    OwnAttempt,
}

impl fmt::Display for LawError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LawError::Shape(w) => write!(f, "not in the Law format: {w}"),
            LawError::Unsupported(w) => write!(f, "not supported yet (format still open): {w}"),
            LawError::Check(w) => write!(f, "{w}"),
            LawError::Missing(h) => {
                write!(f, "act ")?;
                for x in h {
                    write!(f, "{x:02x}")?;
                }
                write!(f, " is not held")
            }
            LawError::Unsettled(w) => write!(f, "unsettled by the texts: {w}"),
            LawError::OwnAttempt => f.write_str(
                "unknown: it rests on this reader's own failed attempts to reach a home (re-homed without audit), and nothing binding rests on them (F153)",
            ),
        }
    }
}

impl std::error::Error for LawError {}

/// A short machine-readable code for each error kind, so clients need not
/// match the wording.
impl LawError {
    pub fn code(&self) -> &'static str {
        match self {
            LawError::Shape(_) => "shape",
            LawError::Unsupported(_) => "unsupported",
            LawError::Check(_) => "check",
            LawError::Missing(_) => "missing",
            LawError::Unsettled(_) => "unsettled",
            LawError::OwnAttempt => "own-attempt",
        }
    }
}

pub(crate) type R<T> = Result<T, LawError>;

// ---------------------------------------------------------------- rules

/// `rule = [ 0 ] / [ 1, uint ] / [ 2, [+ hash] ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Rule {
    /// Every party.
    All,
    /// Any `k` distinct parties.
    Threshold(u64),
    /// These named parties.
    Named(Vec<Hash>),
}

impl Rule {
    /// Whether the rule's own numbers and names fit the parties.
    pub fn fits(&self, parties: &[Hash]) -> bool {
        match self {
            Rule::All => true,
            Rule::Threshold(k) => *k >= 1 && *k <= parties.len() as u64,
            Rule::Named(n) => !n.is_empty() && distinct(n) && n.iter().all(|x| parties.contains(x)),
        }
    }

    /// The parties this rule is counted among (rule 36b: every party under
    /// the default or a threshold, the named parties under a rule naming
    /// parties).
    pub fn counted_among(&self, parties: &[Hash]) -> Vec<Hash> {
        match self {
            Rule::Named(n) => n.clone(),
            _ => parties.to_vec(),
        }
    }

    /// How many signatures the rule needs from `remaining` voices, of the
    /// parties it counts among: the number as written where enough remain,
    /// all of them where fewer remain (rule 44d, flaw C). `None` when no
    /// voice remains: nothing meets the rule.
    pub fn needed(&self, remaining: usize) -> Option<usize> {
        if remaining == 0 {
            return None;
        }
        Some(match self {
            Rule::Threshold(k) => (*k as usize).min(remaining),
            Rule::All | Rule::Named(_) => remaining,
        })
    }

    /// Whether these distinct signers, all parties, meet the rule, with
    /// every party's voice remaining.
    pub fn met(&self, parties: &[Hash], signers: &[Hash]) -> bool {
        let signed = |p: &Hash| signers.contains(p);
        match self {
            Rule::All => parties.iter().all(signed),
            Rule::Threshold(k) => parties.iter().filter(|p| signed(p)).count() as u64 >= *k,
            Rule::Named(n) => n.iter().all(signed),
        }
    }

    pub fn to_value(&self) -> Value {
        match self {
            Rule::All => Value::Array(vec![Value::Uint(0)]),
            Rule::Threshold(k) => Value::Array(vec![Value::Uint(1), Value::Uint(*k)]),
            Rule::Named(n) => Value::Array(vec![Value::Uint(2), hashes_value(n)]),
        }
    }
}

/// `keepers = [ [+ hash], rule ]`: keeper operators, and the rule for what
/// counts as recorded (any one, a threshold, or all of them).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Keepers {
    pub operators: Vec<Hash>,
    pub rule: Rule,
}

/// `holding`: how a key is held (Law rule 36).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Holding {
    /// `[ 0, holder ]`: one holder.
    One(Hash),
    /// `[ 1, threshold, members ]`: any k of these members; jointly for the
    /// signing key, by shares for the safety key.
    Shares { threshold: u64, members: Vec<Hash> },
    /// `[ 2, custodian, grant ]`: a custodian under the collective's grant.
    Custodian { custodian: Hash, grant: Hash },
}

impl Holding {
    pub fn to_value(&self) -> Value {
        match self {
            Holding::One(h) => Value::Array(vec![Value::Uint(0), b(h)]),
            Holding::Shares { threshold, members } => Value::Array(vec![
                Value::Uint(1),
                Value::Uint(*threshold),
                hashes_value(members),
            ]),
            Holding::Custodian { custodian, grant } => {
                Value::Array(vec![Value::Uint(2), b(custodian), b(grant)])
            }
        }
    }
}

/// `recovery`: a way to rotate that needs less than every member.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Recovery {
    /// `[ 0, custodian, grant ]`: a custodian holds a share under grant.
    Custodian { custodian: Hash, grant: Hash },
    /// `[ 1, authority ]`: an escrowed share released by the abandonment
    /// authority.
    Escrow { authority: Hash },
}

impl Recovery {
    pub fn to_value(&self) -> Value {
        match self {
            Recovery::Custodian { custodian, grant } => {
                Value::Array(vec![Value::Uint(0), b(custodian), b(grant)])
            }
            Recovery::Escrow { authority } => Value::Array(vec![Value::Uint(1), b(authority)]),
        }
    }
}

/// `key-grammar` (draft 7): how the keys are held, and a way to rotate.
/// Key 2 (draft 6's listed act types) is retired and never reused: areas
/// reach acts (field 19).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KeyGrammar {
    pub signing: Holding,
    pub safety: Holding,
    pub recovery: Option<Recovery>,
}

impl KeyGrammar {
    pub fn to_value(&self) -> Value {
        let mut m = vec![
            (Value::Uint(0), self.signing.to_value()),
            (Value::Uint(1), self.safety.to_value()),
        ];
        if let Some(r) = &self.recovery {
            m.push((Value::Uint(3), r.to_value()));
        }
        Value::Map(m)
    }
}

/// `succession-plan` (Law rule 48a).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SuccessionPlan {
    pub party: Hash,
    /// Stake successors, shares in millionths of the party's stakes.
    pub stakes: Option<Vec<(Hash, u64)>>,
    /// Seat successors, with their voting weight.
    pub seats: Option<Vec<(Hash, u64)>>,
    /// Seat entry: 0 automatic where every voice signed this version of the
    /// plan, 1 a nomination (Q14).
    pub entry: Option<u64>,
}

impl SuccessionPlan {
    pub fn to_value(&self) -> Value {
        let pairs = |v: &[(Hash, u64)]| {
            Value::Array(
                v.iter()
                    .map(|(h, n)| Value::Array(vec![b(h), Value::Uint(*n)]))
                    .collect(),
            )
        };
        let mut m = vec![(Value::Uint(0), b(&self.party))];
        if let Some(s) = &self.stakes {
            m.push((Value::Uint(1), pairs(s)));
        }
        if let Some(s) = &self.seats {
            m.push((Value::Uint(2), pairs(s)));
        }
        if let Some(e) = self.entry {
            m.push((Value::Uint(3), Value::Uint(e)));
        }
        Value::Map(m)
    }
}

/// Who decides absence (Law rule 49): always an identity, or, in a
/// collective only (B19), a threshold of the other parties, each of whom is
/// one.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Authority {
    /// `[ 0, identity ]`: a named identity (a keeper's operator, a party, a
    /// collective, or a third party).
    Named(Hash),
    /// `[ 1, threshold ]`: this many of the other parties; in a collective
    /// only (B19).
    Others(u64),
}

/// The outcomes an abandonment clause may allow (Law rule 53).
pub mod outcomes {
    pub const VOICE_REMOVED: u64 = 0;
    pub const STAKE_REDISTRIBUTED: u64 = 1;
    pub const STAKE_TRANSFERRED: u64 = 2;
    pub const OBLIGATIONS_REDIRECTED: u64 = 3;
    pub const AGREEMENT_CLOSED: u64 = 4;
}

/// `abandonment`: the authority, the outcomes allowed, ascending, and,
/// optionally, the absence-proof cMIP standing between the authority's word
/// and the party's stake (key 3, F172). Key 2, the period of absence
/// (F140), is retired and never reused: terms carrying it are invalid.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Abandonment {
    pub authority: Authority,
    pub outcomes: Vec<u64>,
    /// Key 3: an absence-proof cMIP and its parameters, `[ hash, any ]`
    /// (task "Absence proof", F172). Where named, a declaration counts only
    /// if that cMIP accepts it (rule 51). The parameters are the cMIP's own
    /// (a period, a time reference): the core reads none of them.
    pub proof: Option<(Hash, Value)>,
}

impl Abandonment {
    pub fn to_value(&self) -> Value {
        let a = match &self.authority {
            Authority::Named(h) => Value::Array(vec![Value::Uint(0), b(h)]),
            Authority::Others(k) => Value::Array(vec![Value::Uint(1), Value::Uint(*k)]),
        };
        let mut m = vec![
            (Value::Uint(0), a),
            (
                Value::Uint(1),
                Value::Array(self.outcomes.iter().map(|o| Value::Uint(*o)).collect()),
            ),
        ];
        if let Some((h, params)) = &self.proof {
            m.push((Value::Uint(3), Value::Array(vec![b(h), params.clone()])));
        }
        Value::Map(m)
    }

    /// Whether this clause covers `party` (rule 36b, F105): it allows
    /// outcome 0, and its authority can declare that party absent, so a
    /// named authority does not cover itself.
    pub fn covers(&self, party: &Hash) -> bool {
        self.outcomes.contains(&outcomes::VOICE_REMOVED)
            && match &self.authority {
                Authority::Named(a) => a != party,
                Authority::Others(_) => true,
            }
    }
}

// ---------------------------------------------------------------- areas, marks

/// `kind`: the acts of the collective an area reaches.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Kind {
    /// `[ 0, layer ]`: every act of this layer ("Layer", F106).
    Layer(u64),
    /// `[ 1, spec, type ]`: every act of this type in this specification.
    Type { spec: Hash, type_: u64 },
}

impl Kind {
    pub fn to_value(&self) -> Value {
        match self {
            Kind::Layer(l) => Value::Array(vec![Value::Uint(0), Value::Uint(*l)]),
            Kind::Type { spec, type_ } => {
                Value::Array(vec![Value::Uint(1), b(spec), Value::Uint(*type_)])
            }
        }
    }
}

/// `field-ref`: an operational field of the terms an area reaches.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FieldRef {
    /// `[ 0, field ]`: a whole operational field (7, 8, 17).
    Field(u64),
    /// `[ 1, task ]`: one entry of field 2, where the task is operational.
    Task(u64),
}

impl FieldRef {
    pub fn to_value(&self) -> Value {
        match self {
            FieldRef::Field(f) => Value::Array(vec![Value::Uint(0), Value::Uint(*f)]),
            FieldRef::Task(t) => Value::Array(vec![Value::Uint(1), Value::Uint(*t)]),
        }
    }
}

/// `area` (field 19): a part of the operational tier the constitution gives
/// to some members, identified by a permanent id (Q32).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Area {
    /// 0: its name, as canonical text.
    pub name: String,
    /// 1: its holders: parties; empty only in a clone (Q21).
    pub holders: Vec<Hash>,
    /// 2: how many holders decide together.
    pub threshold: u64,
    /// 3: the acts of the collective it reaches.
    pub kinds: Option<Vec<Kind>>,
    /// 4: the operational fields it reaches.
    pub fields: Option<Vec<FieldRef>>,
    /// 5: its permanent id.
    pub id: u64,
}

impl Area {
    pub fn to_value(&self) -> Value {
        let mut m = vec![
            (Value::Uint(0), Value::Text(self.name.clone())),
            (Value::Uint(1), Value::Array(self.holders.iter().map(b).collect())),
            (Value::Uint(2), Value::Uint(self.threshold)),
        ];
        if let Some(k) = &self.kinds {
            m.push((Value::Uint(3), Value::Array(k.iter().map(Kind::to_value).collect())));
        }
        if let Some(f) = &self.fields {
            m.push((
                Value::Uint(4),
                Value::Array(f.iter().map(FieldRef::to_value).collect()),
            ));
        }
        m.push((Value::Uint(5), Value::Uint(self.id)));
        Value::Map(m)
    }

    /// The area's rule: its threshold among its holders.
    pub fn rule(&self) -> Rule {
        Rule::Threshold(self.threshold)
    }

    /// Whether the area reaches a whole layer: it is that layer's lane.
    pub fn is_lane(&self, layer: u64) -> bool {
        self.kinds
            .iter()
            .flatten()
            .any(|k| *k == Kind::Layer(layer))
    }
}

/// `power`: a change rule of the parent a clone's mark claims to meet.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Power {
    /// `[ 0 ]`: the constitutional change rule (field 18, else every party).
    Constitutional,
    /// `[ 1 ]`: the clone rule (field 5).
    Clone,
    /// `[ 2, area ]`: the power over the parent's area of this id.
    Area(u64),
    /// `[ 3, party ]`: the succession plan of this party (rule 48c).
    Plan(Hash),
    /// `[ 4 ]`: the judicial tier, every party of the parent whose voice
    /// remains (rule 46a, F121).
    Judicial,
}

impl Power {
    pub fn to_value(&self) -> Value {
        match self {
            Power::Constitutional => Value::Array(vec![Value::Uint(0)]),
            Power::Clone => Value::Array(vec![Value::Uint(1)]),
            Power::Area(a) => Value::Array(vec![Value::Uint(2), Value::Uint(*a)]),
            Power::Plan(p) => Value::Array(vec![Value::Uint(3), b(p)]),
            Power::Judicial => Value::Array(vec![Value::Uint(4)]),
        }
    }

    /// The deterministic encoding, which orders a mark's entries.
    pub fn encoding(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }
}

/// One entry of a mark: a power claimed, and the parties whose signatures
/// meet it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MarkEntry {
    pub power: Power,
    pub signers: Vec<Hash>,
}

/// Terms field 4: founding terms' signing rule, or a clone's mark (F104).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Field4 {
    Rule(Rule),
    Mark(Vec<MarkEntry>),
}

impl Field4 {
    pub fn to_value(&self) -> Value {
        match self {
            Field4::Rule(r) => r.to_value(),
            Field4::Mark(m) => Value::Array(
                m.iter()
                    .map(|e| Value::Array(vec![e.power.to_value(), hashes_value(&e.signers)]))
                    .collect(),
            ),
        }
    }

    pub fn mark(&self) -> Option<&[MarkEntry]> {
        match self {
            Field4::Mark(m) => Some(m),
            Field4::Rule(_) => None,
        }
    }
}

// ---------------------------------------------------------------- the chain of judgment

/// `judge`: a judge a chain of judgment follows (F121; terms field 21).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Judge {
    /// `[ 0, task ]`: the specification named for judicial task 9, 10, 11
    /// or 14 (field 2, field 6 for the time reference, or the abandonment
    /// clause's key 3 for absence proof, F182).
    Task(u64),
    /// `[ 1, identity ]`: an identity the terms name as a keeper's
    /// operator, an arbitrator or verifier, or the abandonment authority.
    Identity(Hash),
    /// `[ 2 ]`: the split service, named by the grant of field 14.
    SplitService,
}

impl Judge {
    pub fn to_value(&self) -> Value {
        match self {
            Judge::Task(t) => Value::Array(vec![Value::Uint(0), Value::Uint(*t)]),
            Judge::Identity(h) => Value::Array(vec![Value::Uint(1), b(h)]),
            Judge::SplitService => Value::Array(vec![Value::Uint(2)]),
        }
    }

    /// The deterministic encoding, which orders field 21's links.
    pub fn encoding(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }
}

/// One that takes over from a judge (F121; F130, H6): a specification, an
/// identity or a grant, by its hash; or, for a deal's split service, the
/// service taking over by a group of grants, one per payee, each naming
/// "this agreement" by null like field 14's.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Taker {
    /// `hash`.
    One(Hash),
    /// `[+ hash]`: in a deal, one grant per payee to the service taking
    /// over from its split service.
    Grants(Vec<Hash>),
}

impl From<Hash> for Taker {
    fn from(h: Hash) -> Self {
        Taker::One(h)
    }
}

impl Taker {
    pub fn to_value(&self) -> Value {
        match self {
            Taker::One(h) => b(h),
            Taker::Grants(g) => Value::Array(g.iter().map(b).collect()),
        }
    }

    /// Every hash it names: one, or the group's grants.
    pub fn hashes(&self) -> Vec<Hash> {
        match self {
            Taker::One(h) => vec![*h],
            Taker::Grants(g) => g.clone(),
        }
    }
}

/// `chain = [ judge, [+ [ next: hash / [+ hash], period: uint ]] ]`: a
/// judge, and in order those that take over when it answers "unknown" or
/// cannot act: specifications for a judicial task, identities for an
/// identity, grants for the split service (in a deal, a group of grants per
/// service taking over, one per payee, F130 H6). Each names the period, on
/// the agreement's time reference, that the one before it has to act once
/// asked, after which it may act (Q7): compulsory, above zero.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ChainLink {
    pub judge: Judge,
    pub next: Vec<(Taker, u64)>,
}

impl ChainLink {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            self.judge.to_value(),
            Value::Array(
                self.next
                    .iter()
                    .map(|(t, p)| Value::Array(vec![t.to_value(), Value::Uint(*p)]))
                    .collect(),
            ),
        ])
    }

    /// Those that take over, in order, without their periods: one hash
    /// each, or, for a group, the hashes of its grants in its place.
    pub fn successors(&self) -> Vec<Hash> {
        self.next.iter().flat_map(|(t, _)| t.hashes()).collect()
    }

    /// Whether this judge is one that can stay silent: an identity or a
    /// split service, rather than a specification, which always answers.
    pub fn can_stay_silent(&self) -> bool {
        !matches!(self.judge, Judge::Task(_))
    }
}

/// One answer, or its absence, along a chain of judgment (rule 34a, Q7).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Step<T> {
    /// The judge answered, within its period.
    Answer(T),
    /// It answered "unknown" (a time reference: "undetermined").
    Unknown,
    /// It has been asked and has not acted. Whether its period has passed,
    /// as the agreement's time reference says: `Some(true)` after,
    /// `Some(false)` before, `None` undetermined. An answer made after its
    /// period passed is no answer here (reading, Law draft 10, section 6).
    Silent { period_passed: Option<bool> },
}

/// What a chain of judgment gives (rule 34a, Q7).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ChainAnswer<T> {
    /// Decided by the judge at this place in the chain (0: the judge itself).
    Decided { by: usize, answer: T },
    /// Every one answered "unknown", or let its period pass.
    Unknown,
    /// Waiting on the judge at this place: asked, its period not yet passed.
    Waiting { on: usize },
    /// The time reference cannot tell whether that judge's period passed.
    Undetermined { on: usize },
}

/// The chain's answer from the steps the judge and each that takes over
/// gave, in the chain's order (rule 34a, Q7): the first answer; "unknown"
/// passes to the next, and so does silence once its period has passed on
/// the time reference.
pub fn chain_answer<T: Clone>(steps: &[Step<T>]) -> ChainAnswer<T> {
    for (i, s) in steps.iter().enumerate() {
        match s {
            Step::Answer(a) => return ChainAnswer::Decided { by: i, answer: a.clone() },
            Step::Unknown | Step::Silent { period_passed: Some(true) } => {}
            Step::Silent { period_passed: Some(false) } => return ChainAnswer::Waiting { on: i },
            Step::Silent { period_passed: None } => return ChainAnswer::Undetermined { on: i },
        }
    }
    ChainAnswer::Unknown
}

/// The answer a chain of judgment gives (F121): the first answer in the
/// chain's order that is not "unknown" (`None`), with its place in the
/// chain (0 for the judge itself); `None` when every one answers unknown.
/// The answers are those the judge and each that takes over gave, in the
/// chain's order ([`Terms::chain_of`]); a client that does not hold a
/// judge's specification shows the question as unknown, and never passes
/// it down the chain.
pub fn judged<T: Clone>(answers: &[Option<T>]) -> Option<(usize, T)> {
    answers
        .iter()
        .enumerate()
        .find_map(|(i, a)| a.clone().map(|a| (i, a)))
}

/// Who a stake names (F124, S1): an identity, or null, meaning "this
/// collective", the collective whose agreement these terms are, as Identity
/// lets a genesis name itself as its home's operator by null. Only a
/// collective's terms use null; founding terms can so carry stakes in the
/// collective itself, which does not exist before its genesis.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Who {
    /// null: this collective.
    This,
    /// An identity, by its hash.
    Id(Hash),
}

impl Who {
    pub fn to_value(&self) -> Value {
        match self {
            Who::This => Value::Null,
            Who::Id(h) => b(h),
        }
    }

    /// The identity named, `this` standing for the collective whose
    /// agreement it is (`None` where that is not known).
    pub fn resolve(&self, this: Option<&Hash>) -> Option<Hash> {
        match self {
            Who::This => this.copied(),
            Who::Id(h) => Some(*h),
        }
    }

    /// The identity, where named by its hash.
    pub fn id(&self) -> Option<&Hash> {
        match self {
            Who::This => None,
            Who::Id(h) => Some(h),
        }
    }

    /// The deterministic encoding, which orders field 7's stakes.
    pub fn encoding(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }
}

/// One stake of terms field 7: `[ object, [+ [ holder, share ]] ]`, its
/// shares in millionths summing to 1,000,000. An object or holder written
/// null is this collective (S1); a stake whose object is this collective is
/// a share of all its income (F121, Q8), for members and departed holders
/// alike (N5).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Stake {
    pub object: Who,
    pub holders: Vec<(Who, u64)>,
}

impl Stake {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            self.object.to_value(),
            Value::Array(
                self.holders
                    .iter()
                    .map(|(h, n)| Value::Array(vec![h.to_value(), Value::Uint(*n)]))
                    .collect(),
            ),
        ])
    }

    /// A holder's share of this stake, 0 if none.
    pub fn share_of(&self, holder: &Who) -> u64 {
        self.holders.iter().filter(|(h, _)| h == holder).map(|(_, n)| n).sum()
    }

    /// The holders named by their identity, with their shares.
    pub fn identified(&self) -> Vec<(Hash, u64)> {
        self.holders.iter().filter_map(|(h, n)| h.id().map(|x| (*x, *n))).collect()
    }
}

// ---------------------------------------------------------------- terms

/// Terms (type 0), in the fields Law draft 7 fixes.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Terms {
    /// 0: parties, identity or collective hashes, in order.
    pub parties: Vec<Hash>,
    /// 1: the words, as canonical text: in a collective, the constitution's.
    pub text: String,
    /// 2: cMIPs, at most one per task (task number, cMIP hash), ascending.
    pub cmips: Vec<(u64, Hash)>,
    /// 3: keepers.
    pub keepers: Option<Keepers>,
    /// 4: founding terms' signing rule, or a clone's mark.
    pub field4: Field4,
    /// 5: clone rule.
    pub clone: Rule,
    /// 6: time reference: the task cMIP and its parameters.
    pub time: Option<(Hash, Value)>,
    /// 9: the abandonment clause.
    pub abandonment: Option<Abandonment>,
    /// 11: parent, for a clone.
    pub parent: Option<Hash>,
    /// 12: key grammar, for a collective.
    pub grammar: Option<KeyGrammar>,
    /// 13: arbitrators or verifiers.
    pub arbitrators: Option<Vec<Hash>>,
    /// 14, in a collective: the split service's grant, one hash (its one
    /// payee is the collective).
    pub split_grant: Option<Hash>,
    /// 14, in a deal: the payees' grants to the split service, one per
    /// payee, each naming "this agreement" by null (F129, H4).
    pub payee_grants: Option<Vec<Hash>>,
    /// 15: extensions.
    pub extensions: Option<Vec<Hash>>,
    /// 16: succession plans of parties.
    pub succession: Option<Vec<SuccessionPlan>>,
    /// 18: constitutional change rule; absent: every party.
    pub constitutional: Option<Rule>,
    /// 19: operational areas.
    pub areas: Option<Vec<Area>>,
    /// 20: each area's own words, by area id, ascending.
    pub area_words: Option<Vec<(u64, String)>>,
    /// 21: the chain of judgment: who takes over from each judge (F121).
    pub chain: Option<Vec<ChainLink>>,
    /// 22: the departed members entry: who left, and nothing else (F121,
    /// F124 N5); their stake is in field 7.
    pub departed: Option<Vec<Hash>>,
    /// 7: stakes, in works, publications, or the collective itself (Q8).
    pub stakes: Option<Vec<Stake>>,
    /// 23: forked from: the original collective, a back-link only, deciding
    /// nothing (F121, F124 N4).
    pub forked_from: Option<Hash>,
    /// 24: the release rule, set in founding terms: who among a stake's
    /// holders must sign its release to the public domain (F121, D);
    /// absent: every holder. A clone every owner signs may change it (N8).
    pub release_rule: Option<Rule>,
    /// 26: in a deal's clone settling a fork, every tip it discards, beside
    /// its one parent, ascending, none twice (rule 45b, F186; QF3, F190,
    /// decided 9 October 2026: a list, so a tangled deal settles cleanly).
    pub settles: Option<Vec<Hash>>,
    /// 27: in a deal, the judge that settles its forks, one identity of
    /// field 13 (rule 45b, DQ8; QF2, F190, decided 9 October 2026); absent,
    /// no judge settles them, and the deal waits on its reference.
    pub fork_judge: Option<Hash>,
}

impl Terms {
    /// Whether these terms found or continue a collective (field 12).
    pub fn is_collective(&self) -> bool {
        self.grammar.is_some()
    }

    /// The constitutional change rule: field 18, else every party.
    pub fn constitutional_rule(&self) -> Rule {
        self.constitutional.clone().unwrap_or(Rule::All)
    }

    /// The areas (field 19), none if absent.
    pub fn areas(&self) -> &[Area] {
        self.areas.as_deref().unwrap_or(&[])
    }

    /// The area of this id.
    pub fn area(&self, id: u64) -> Option<&Area> {
        self.areas().iter().find(|a| a.id == id)
    }

    /// The lane: the area reaching this layer as a whole.
    pub fn lane(&self, layer: u64) -> Option<&Area> {
        self.areas().iter().find(|a| a.is_lane(layer))
    }

    /// The cMIP named for a task.
    pub fn cmip(&self, task: u64) -> Option<&Hash> {
        self.cmips.iter().find(|(t, _)| *t == task).map(|(_, h)| h)
    }

    pub fn extensions(&self) -> &[Hash] {
        self.extensions.as_deref().unwrap_or(&[])
    }

    /// The layers a specification's acts belong to under these terms
    /// ("Layer", F106): a MIP's layer; for a cMIP, the layer of each task
    /// the terms name it for; Production for an extension. Empty: the
    /// specification is named nowhere.
    pub fn spec_layers(&self, mips: &Mips, spec: &Hash) -> Vec<u64> {
        if let Some(l) = mips.layer(spec) {
            return vec![l];
        }
        let mut out: Vec<u64> = self
            .cmips
            .iter()
            .filter(|(_, h)| h == spec)
            .filter_map(|(t, _)| task_layer(*t))
            .collect();
        if self.extensions().contains(spec) {
            out.push(layers::PRODUCTION);
        }
        out.sort();
        out.dedup();
        out
    }

    /// Whether some act of `spec` and `type_` could belong to `kind`.
    pub fn kind_reaches(&self, mips: &Mips, kind: &Kind, spec: &Hash, type_: u64) -> bool {
        match kind {
            Kind::Layer(l) => self.spec_layers(mips, spec).contains(l),
            Kind::Type { spec: s, type_: t } => s == spec && *t == type_,
        }
    }

    /// Whether some act could belong to both kinds ("Areas"). Two lanes
    /// never overlap: a specification named for tasks of two layers belongs
    /// to both, and both lanes reach it (R4).
    pub fn kinds_overlap(&self, mips: &Mips, a: &Kind, b: &Kind) -> bool {
        match (a, b) {
            (Kind::Layer(x), Kind::Layer(y)) => x == y,
            (Kind::Layer(l), Kind::Type { spec, .. }) | (Kind::Type { spec, .. }, Kind::Layer(l)) => {
                self.spec_layers(mips, spec).contains(l)
            }
            (Kind::Type { .. }, Kind::Type { .. }) => a == b,
        }
    }

    /// The payload map.
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), hashes_value(&self.parties)),
            (Value::Uint(1), Value::Text(self.text.clone())),
            (
                Value::Uint(2),
                Value::Map(
                    self.cmips
                        .iter()
                        .map(|(t, h)| (Value::Uint(*t), b(h)))
                        .collect(),
                ),
            ),
            (Value::Uint(4), self.field4.to_value()),
            (Value::Uint(5), self.clone.to_value()),
        ];
        if let Some(k) = &self.keepers {
            m.push((
                Value::Uint(3),
                Value::Array(vec![hashes_value(&k.operators), k.rule.to_value()]),
            ));
        }
        if let Some((h, p)) = &self.time {
            m.push((Value::Uint(6), Value::Array(vec![b(h), p.clone()])));
        }
        if let Some(a) = &self.abandonment {
            m.push((Value::Uint(9), a.to_value()));
        }
        if let Some(p) = &self.parent {
            m.push((Value::Uint(11), b(p)));
        }
        if let Some(g) = &self.grammar {
            m.push((Value::Uint(12), g.to_value()));
        }
        if let Some(a) = &self.arbitrators {
            m.push((Value::Uint(13), hashes_value(a)));
        }
        if let Some(g) = &self.split_grant {
            m.push((Value::Uint(14), b(g)));
        }
        if let Some(g) = &self.payee_grants {
            m.push((Value::Uint(14), hashes_value(g)));
        }
        if let Some(e) = &self.extensions {
            m.push((Value::Uint(15), hashes_value(e)));
        }
        if let Some(s) = &self.succession {
            m.push((
                Value::Uint(16),
                Value::Array(s.iter().map(|p| p.to_value()).collect()),
            ));
        }
        if let Some(r) = &self.constitutional {
            m.push((Value::Uint(18), r.to_value()));
        }
        if let Some(a) = &self.areas {
            m.push((Value::Uint(19), Value::Array(a.iter().map(Area::to_value).collect())));
        }
        if let Some(w) = &self.area_words {
            m.push((
                Value::Uint(20),
                Value::Map(
                    w.iter()
                        .map(|(id, t)| (Value::Uint(*id), Value::Text(t.clone())))
                        .collect(),
                ),
            ));
        }
        if let Some(c) = &self.chain {
            m.push((Value::Uint(21), Value::Array(c.iter().map(ChainLink::to_value).collect())));
        }
        if let Some(d) = &self.departed {
            m.push((Value::Uint(22), hashes_value(d)));
        }
        if let Some(st) = &self.stakes {
            m.push((Value::Uint(7), Value::Array(st.iter().map(Stake::to_value).collect())));
        }
        if let Some(f) = &self.forked_from {
            m.push((Value::Uint(23), b(f)));
        }
        if let Some(r) = &self.release_rule {
            m.push((Value::Uint(24), r.to_value()));
        }
        if let Some(x) = &self.settles {
            m.push((Value::Uint(26), hashes_value(x)));
        }
        if let Some(x) = &self.fork_judge {
            m.push((Value::Uint(27), b(x)));
        }
        m
    }

    /// The deterministic encoding of each field present, by field number:
    /// what "a clone changes a field" compares (rule 44b).
    pub fn field_values(&self) -> Vec<(u64, Value)> {
        self.to_map()
            .into_iter()
            .filter_map(|(k, v)| match k {
                Value::Uint(n) => Some((n, v)),
                _ => None,
            })
            .collect()
    }

    /// Decode a terms payload, strictly.
    pub fn decode(p: &[(Value, Value)]) -> R<Terms> {
        let mut f: Vec<(u64, &Value)> = Vec::new();
        for (k, v) in p {
            match k {
                Value::Uint(8) => return Err(LawError::Unsupported("terms field 8 (split plan)")),
                Value::Uint(10) => {
                    return Err(LawError::Unsupported("terms field 10 (concurrency rule)"))
                }
                Value::Uint(17) => {
                    return Err(LawError::Unsupported("terms field 17 (refund terms)"))
                }
                // 25, the relays (F126), is withdrawn (F128): relays are
                // transport, never a condition of validity. It is never
                // reused, and terms carrying it are refused.
                Value::Uint(25) => {
                    return Err(LawError::Check(
                        "terms field 25 (the relays) is withdrawn: an act is done by its signatures, seals and citations, wherever held (F128)",
                    ))
                }
                Value::Uint(n) if *n <= 24 || *n == 26 || *n == 27 => f.push((*n, v)),
                _ => return Err(LawError::Shape("terms: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let req = |k: u64, w| get(k).ok_or(LawError::Shape(w));
        let Value::Text(text) = req(1, "terms text")? else {
            return Err(LawError::Shape("terms text"));
        };
        let Value::Map(cm) = req(2, "terms cMIPs")? else {
            return Err(LawError::Shape("terms cMIPs"));
        };
        let cmips = cm
            .iter()
            .map(|(k, v)| Ok((uint(k, "terms cMIP task")?, hash(v, "terms cMIP hash")?)))
            .collect::<R<Vec<_>>>()?;
        Ok(Terms {
            parties: hashes(req(0, "terms parties")?, "terms parties")?,
            text: text.clone(),
            cmips,
            keepers: get(3)
                .map(|v| {
                    let a = tuple(v, 2, "keepers")?;
                    Ok(Keepers {
                        operators: hashes(&a[0], "keepers")?,
                        rule: rule(&a[1])?,
                    })
                })
                .transpose()?,
            field4: field4(req(4, "terms field 4")?)?,
            clone: rule(req(5, "terms clone rule")?)?,
            time: get(6)
                .map(|v| {
                    let a = tuple(v, 2, "time reference")?;
                    Ok((hash(&a[0], "time reference cMIP")?, a[1].clone()))
                })
                .transpose()?,
            abandonment: get(9).map(abandonment).transpose()?,
            parent: get(11).map(|v| hash(v, "terms parent")).transpose()?,
            grammar: get(12).map(key_grammar).transpose()?,
            arbitrators: get(13)
                .map(|v| hashes(v, "terms arbitrators"))
                .transpose()?,
            split_grant: match get(14) {
                Some(v @ Value::Bytes(_)) => Some(hash(v, "terms split grant")?),
                Some(Value::Array(_)) | None => None,
                Some(_) => return Err(LawError::Shape("terms field 14: a grant, or a deal's list of grants (F129)")),
            },
            payee_grants: match get(14) {
                Some(v @ Value::Array(_)) => Some(hashes(v, "terms payee grants")?),
                _ => None,
            },
            extensions: get(15).map(|v| hashes(v, "terms extensions")).transpose()?,
            succession: get(16)
                .map(|v| {
                    nonempty(v, "succession plans")?
                        .iter()
                        .map(succession_plan)
                        .collect()
                })
                .transpose()?,
            constitutional: get(18).map(rule).transpose()?,
            areas: get(19)
                .map(|v| nonempty(v, "terms areas")?.iter().map(area).collect())
                .transpose()?,
            area_words: get(20)
                .map(|v| {
                    let Value::Map(m) = v else {
                        return Err(LawError::Shape("terms area words"));
                    };
                    if m.is_empty() {
                        return Err(LawError::Shape("terms area words"));
                    }
                    m.iter()
                        .map(|(k, v)| match v {
                            Value::Text(t) => Ok((uint(k, "area words id")?, t.clone())),
                            _ => Err(LawError::Shape("area words")),
                        })
                        .collect()
                })
                .transpose()?,
            chain: get(21)
                .map(|v| nonempty(v, "chain of judgment")?.iter().map(chain_link).collect())
                .transpose()?,
            departed: get(22).map(|v| hashes(v, "departed members")).transpose()?,
            stakes: get(7)
                .map(|v| {
                    nonempty(v, "stakes")?
                        .iter()
                        .map(|e| {
                            let a = tuple(e, 2, "stake")?;
                            Ok(Stake {
                                object: who(&a[0], "stake object")?,
                                holders: nonempty(&a[1], "stake holders")?
                                    .iter()
                                    .map(|x| {
                                        let y = tuple(x, 2, "stake holder")?;
                                        Ok((who(&y[0], "stake holder")?, uint(&y[1], "stake share")?))
                                    })
                                    .collect::<R<Vec<_>>>()?,
                            })
                        })
                        .collect()
                })
                .transpose()?,
            forked_from: get(23).map(|v| hash(v, "forked from")).transpose()?,
            release_rule: get(24).map(rule).transpose()?,
            settles: get(26).map(|v| hashes(v, "settles")).transpose()?,
            fork_judge: get(27).map(|v| hash(v, "the judge of forks")).transpose()?,
        })
    }

    /// The stake whose object is `object` (field 7), and its index.
    pub fn stake_on(&self, object: &Who) -> Option<(usize, &Stake)> {
        self.stakes.iter().flatten().enumerate().find(|(_, s)| &s.object == object)
    }

    /// The stake in this collective itself (object null, S1): a share of
    /// all its income (Q8), and its index.
    pub fn own_stake(&self) -> Option<(usize, &Stake)> {
        self.stake_on(&Who::This)
    }

    /// The checks that need no other act (Law rules 1, 2, 36, 36b for
    /// founding terms, 48a, 49; "Areas"; F96, F105, F107, Q20, Q21, Q24,
    /// Q25, Q31, Q32). A clone's checks against its parent and lineage are
    /// the view's ([`super::LawView::agreement`]).
    pub fn check(&self, mips: &Mips) -> R<()> {
        let parties = &self.parties;
        if !distinct(parties) {
            return Err(LawError::Check("a party is listed twice"));
        }
        let mut last = 0;
        for (t, _) in &self.cmips {
            if *t == 0 || *t > LAST_TASK {
                return Err(LawError::Check(
                    "a cMIP names a task number that does not exist",
                ));
            }
            // The abandonment clause names the absence-proof cMIP (key 3,
            // rule 51), and only there (a reading, F182).
            if *t == ABSENCE_PROOF_TASK {
                return Err(LawError::Check(
                    "the absence-proof cMIP is named by the abandonment clause (key 3), not in field 2 (F172, F182)",
                ));
            }
            if *t <= last {
                return Err(LawError::Check("at most one cMIP per task"));
            }
            last = *t;
        }
        // Field 4: a rule in founding terms, every party (F107, Q11); a
        // mark in a clone (F104).
        match (&self.parent, &self.field4) {
            (None, Field4::Rule(Rule::All)) => {}
            (None, Field4::Rule(_)) => {
                return Err(LawError::Check(
                    "founding terms exist only when every party has signed them: field 4 must be every party",
                ))
            }
            (None, Field4::Mark(_)) => {
                return Err(LawError::Check("founding terms carry a signing rule, not a mark"))
            }
            (Some(_), Field4::Rule(_)) => {
                return Err(LawError::Check("a clone carries a mark in field 4, not a rule"))
            }
            (Some(_), Field4::Mark(m)) => check_mark_shape(m)?,
        }
        if !self.clone.fits(parties) {
            return Err(LawError::Check(
                "the clone rule names a threshold or party that does not fit the parties",
            ));
        }
        if let Some(r) = &self.constitutional {
            if !r.fits(parties) {
                return Err(LawError::Check(
                    "the constitutional change rule names a threshold or party that does not fit the parties",
                ));
            }
        }
        if !self.is_collective() {
            // A deal (F107): every party signs it and every clone of it.
            if self.clone != Rule::All {
                return Err(LawError::Check(
                    "a deal changes only with every party's signature: its clone rule must be every party",
                ));
            }
            if self.constitutional.is_some() || self.areas.is_some() || self.area_words.is_some() {
                return Err(LawError::Check(
                    "tiers and areas belong to collectives: a deal carries no field 18, 19 or 20",
                ));
            }
            // F129, H4: a deal lists its payees' grants, one per payee.
            if self.split_grant.is_some() {
                return Err(LawError::Check(
                    "a deal lists its payees' grants to the split service in field 14, one per payee (F129, H4)",
                ));
            }
            if let Some(g) = &self.payee_grants {
                if g.is_empty() || !distinct(g) {
                    return Err(LawError::Check("field 14 lists each payee's grant once (F129, H4)"));
                }
            }
            // B19: in a deal, the absence authority is one identity.
            if matches!(&self.abandonment, Some(Abandonment { authority: Authority::Others(_), .. })) {
                return Err(LawError::Check(
                    "in a deal, the absence authority is one identity, never a threshold of the other parties (B19)",
                ));
            }
        }
        if self.is_collective() && self.payee_grants.is_some() {
            return Err(LawError::Check(
                "a collective names its split service by one grant in field 14; a list of payees' grants is a deal's (F129, H4)",
            ));
        }
        if let Some(k) = &self.keepers {
            if !distinct(&k.operators) || !k.rule.fits(&k.operators) {
                return Err(LawError::Check(
                    "the keepers' rule does not fit the keepers",
                ));
            }
        }
        for list in [&self.arbitrators, &self.extensions].into_iter().flatten() {
            if !distinct(list) {
                return Err(LawError::Check(
                    "a list names the same identity or cMIP twice",
                ));
            }
        }
        self.check_judges()?;
        self.check_chain()?;
        self.check_departed()?;
        self.check_stakes()?;
        if let Some(r) = &self.release_rule {
            let ok = match r {
                Rule::All => true,
                Rule::Threshold(k) => *k > 0,
                Rule::Named(n) => !n.is_empty() && distinct(n),
            };
            if !ok {
                return Err(LawError::Check("the release rule is a rule among a stake's holders"));
            }
        }
        if let Some(x) = &self.settles {
            if self.parent.is_none() || self.is_collective() {
                return Err(LawError::Check(
                    "only a deal's clone names the tips it settles (field 26, rule 45b, F186); a collective's forks are settled by its records (rule 47)",
                ));
            }
            if self.parent.as_ref().is_some_and(|p| x.contains(p)) {
                return Err(LawError::Check("a version settles the other branches, never its own parent (field 26, F186)"));
            }
            if !x.windows(2).all(|w| w[0] < w[1]) {
                return Err(LawError::Check("the tips a version settles are ascending, none twice (field 26, QF3)"));
            }
        }
        if let Some(j) = &self.fork_judge {
            if self.is_collective() {
                return Err(LawError::Check(
                    "only a deal names the judge of its forks (field 27, QF2); a collective's forks are settled by its records (rule 47)",
                ));
            }
            if !self.arbitrators.iter().flatten().any(|a| a == j) {
                return Err(LawError::Check(
                    "the judge of a deal's forks is one of its arbitrators or verifiers (field 27 among field 13, QF2)",
                ));
            }
        }
        if self.forked_from.is_some() && (self.parent.is_some() || !self.is_collective()) {
            return Err(LawError::Check(
                "only a collective's founding terms name the original it forked from (F121)",
            ));
        }
        if let Some(a) = &self.abandonment {
            if let Authority::Others(k) = a.authority {
                if k == 0 || k >= parties.len() as u64 {
                    return Err(LawError::Check(
                        "the abandonment authority's threshold does not fit the other parties",
                    ));
                }
            }
            if a.outcomes.is_empty()
                || a.outcomes.iter().any(|o| *o > outcomes::AGREEMENT_CLOSED)
                || a.outcomes.windows(2).any(|w| w[0] >= w[1])
            {
                return Err(LawError::Check(
                    "the abandonment clause lists unknown or repeated outcomes",
                ));
            }
        }
        for s in self.succession.iter().flatten() {
            // M1 (F124): a departed holder's plan keeps only its stake part,
            // which stays with the stake; the seat part went with the seat.
            let departed = self.departed.iter().flatten().any(|d| d == &s.party);
            let stake_only = s.seats.is_none() && s.entry.is_none() && s.stakes.is_some();
            if !parties.contains(&s.party) && !(departed && stake_only) {
                return Err(LawError::Check(
                    "a succession plan is for someone who is not a party (a departed holder's carries only its stake part, M1)",
                ));
            }
            if let Some(st) = &s.stakes {
                if st.iter().map(|(_, n)| *n as u128).sum::<u128>() != MILLION as u128 {
                    return Err(LawError::Check(
                        "stake successors' shares do not sum to 1,000,000",
                    ));
                }
            }
            if matches!(s.entry, Some(e) if e > 1) {
                return Err(LawError::Check("seat entry is 0 or 1"));
            }
        }
        if let Some(plans) = &self.succession {
            let who: Vec<Hash> = plans.iter().map(|p| p.party).collect();
            if !distinct(&who) {
                return Err(LawError::Check("two succession plans for one party"));
            }
        }
        if let Some(g) = &self.grammar {
            self.check_grammar(g)?;
            self.check_areas(mips)?;
            if self.parent.is_none() {
                // F105, rule 36b: every founder signs the founding terms, so
                // each is judged under this clause. A clone's coverage is
                // judged per party, under the version each signed (the view).
                for p in self.constitutional_rule().counted_among(parties) {
                    if !self.abandonment.as_ref().is_some_and(|a| a.covers(&p)) {
                        return Err(LawError::Check(
                            "a member with constitutional power is not covered by an abandonment clause able to remove their voice (F105)",
                        ));
                    }
                }
            }
        }
        Ok(())
    }

    /// Q20, Q24, Q25, Q31: a judge never handles what it judges, and an
    /// agreement has one time reference.
    fn check_judges(&self) -> R<()> {
        if let (Some((t, _)), Some(c)) = (&self.time, self.cmip(TIME_REFERENCE_TASK)) {
            if t != c {
                return Err(LawError::Check(
                    "the time reference (field 6) and the cMIP for task 10 name different specifications (Q31)",
                ));
            }
        }
        let mut judges: Vec<Hash> = self
            .cmips
            .iter()
            .filter(|(t, _)| JUDICIAL_TASKS.contains(t))
            .map(|(_, h)| *h)
            .collect();
        if let Some((t, _)) = &self.time {
            judges.push(*t);
        }
        for j in &judges {
            let tasks: Vec<u64> = self
                .cmips
                .iter()
                .filter(|(_, h)| h == j)
                .map(|(t, _)| *t)
                .collect();
            // Field 6 is a naming for task 10 (Q25): it counts as one.
            let as_time = self.time.as_ref().is_some_and(|(t, _)| t == j)
                && !tasks.contains(&TIME_REFERENCE_TASK);
            if tasks.len() + as_time as usize > 1 {
                return Err(LawError::Check(
                    "a judge never handles what it judges: a specification named for a judicial task is named for no other task (Q20, Q25)",
                ));
            }
            if self.extensions().contains(j) {
                return Err(LawError::Check(
                    "a judge never handles what it judges: a specification named for a judicial task is no extension (Q25)",
                ));
            }
        }
        // F172, F178 (14): absence proof is a judicial task. The cMIP the
        // abandonment clause names for it (key 3) serves no other task, is
        // not the time reference, and is no extension (core v21, "A judge
        // never handles what it judges").
        if let Some((p, _)) = self.abandonment.as_ref().and_then(|a| a.proof.as_ref()) {
            let elsewhere = self.cmips.iter().any(|(_, c)| c == p)
                || self.time.as_ref().is_some_and(|(t, _)| t == p)
                || self.extensions().contains(p);
            if elsewhere {
                return Err(LawError::Check(
                    "a judge never handles what it judges: the absence-proof cMIP the abandonment clause names serves no other task and is no extension (F172, F178)",
                ));
            }
        }
        Ok(())
    }

    /// The specification the terms name for task `t`: field 2's, field 6's
    /// for the time reference (Q25), or the abandonment clause's key 3 for
    /// absence proof (task 14, F182).
    fn task_judge(&self, t: u64) -> Option<Hash> {
        if t == ABSENCE_PROOF_TASK {
            return self.abandonment.as_ref().and_then(|a| a.proof.as_ref()).map(|(h, _)| *h);
        }
        self.cmip(t).copied().or_else(|| (t == TIME_REFERENCE_TASK).then(|| self.time.as_ref().map(|(h, _)| *h)).flatten())
    }

    /// The chain of judgment (field 21, F121): each judge it follows is one
    /// the terms name, once, the links ascending by the judge's encoding;
    /// those that take over are distinct, and none is the judge itself. A
    /// specification that takes over from a judicial task is a judge too,
    /// so it is named nowhere else in the terms: for no task, as no
    /// extension, and in no other link (Q20, Q25).
    fn check_chain(&self) -> R<()> {
        let Some(chain) = &self.chain else { return Ok(()) };
        for w in chain.windows(2) {
            if w[0].judge.encoding() >= w[1].judge.encoding() {
                return Err(LawError::Check(
                    "the chain of judgment's links are ascending by their judge, no judge twice (F121)",
                ));
            }
        }
        let authority = match &self.abandonment {
            Some(Abandonment { authority: Authority::Named(a), .. }) => Some(*a),
            _ => None,
        };
        let mut fallbacks: Vec<Hash> = vec![];
        for l in chain {
            let judge: Hash = match &l.judge {
                Judge::Task(t) => {
                    match self.task_judge(*t) {
                        Some(h) if JUDICIAL_TASKS.contains(t) => h,
                        _ => {
                            return Err(LawError::Check(
                                "the chain of judgment follows a judicial task the terms name no judge for (F121)",
                            ))
                        }
                    }
                }
                Judge::Identity(x) => {
                    let named = self.keepers.as_ref().is_some_and(|k| k.operators.contains(x))
                        || self.arbitrators.iter().flatten().any(|a| a == x)
                        || authority.as_ref() == Some(x);
                    if !named {
                        return Err(LawError::Check(
                            "the chain of judgment follows an identity the terms name as no keeper, arbitrator or authority (F121)",
                        ));
                    }
                    *x
                }
                Judge::SplitService => match (&self.split_grant, &self.payee_grants) {
                    (Some(g), _) => *g,
                    // F130, H6: in a deal, each service taking over carries
                    // one grant per payee, grouped by service, as many as
                    // field 14 lists; every grant is listed once.
                    (None, Some(list)) => {
                        if !l.next.iter().all(|(t, _)| matches!(t, Taker::Grants(g) if g.len() == list.len())) {
                            return Err(LawError::Check(
                                "in a deal, each service taking over from the split service is a group of grants, one per payee, as many as field 14 lists (F130, H6)",
                            ));
                        }
                        let mut all = list.clone();
                        all.extend(l.successors());
                        if !distinct(&all) {
                            return Err(LawError::Check(
                                "a deal lists each grant to its split service, and to each service taking over, once (F130, H6)",
                            ));
                        }
                        list[0]
                    }
                    (None, None) => {
                        return Err(LawError::Check(
                            "the chain of judgment follows a split service the terms do not name (F121)",
                        ))
                    }
                },
            };
            // A group of grants takes over only from a deal's split service.
            let grouped = l.next.iter().any(|(t, _)| matches!(t, Taker::Grants(_)));
            if grouped && (l.judge != Judge::SplitService || self.payee_grants.is_none()) {
                return Err(LawError::Check(
                    "a group of grants takes over only from a deal's split service; every other one that takes over is one hash (F130, H6)",
                ));
            }
            let next = l.successors();
            if l.next.iter().any(|(_, p)| *p == 0) {
                return Err(LawError::Check(
                    "every link of the chain of judgment names a period above zero (Q7)",
                ));
            }
            if !distinct(&next) || next.contains(&judge) {
                return Err(LawError::Check(
                    "those that take over from a judge are distinct, and none is the judge itself (F121)",
                ));
            }
            if let Judge::Task(_) = l.judge {
                for h in &next {
                    let elsewhere = self.cmips.iter().any(|(_, c)| c == h)
                        || self.time.as_ref().is_some_and(|(t, _)| t == h)
                        || self.extensions().contains(h)
                        || self.abandonment.as_ref().and_then(|a| a.proof.as_ref()).is_some_and(|(p, _)| p == h)
                        || fallbacks.contains(h);
                    if elsewhere {
                        return Err(LawError::Check(
                            "a judge never handles what it judges: a specification that takes over from a judge is named nowhere else in the terms (F121, Q20)",
                        ));
                    }
                    fallbacks.push(*h);
                }
            }
        }
        // Q7: a period is measured on the time reference, which is
        // compulsory wherever a judge can stay silent.
        if chain.iter().any(ChainLink::can_stay_silent)
            && self.time.is_none()
            && self.cmip(TIME_REFERENCE_TASK).is_none()
        {
            return Err(LawError::Check(
                "a chain of judgment following a judge that can stay silent needs a time reference (Q7)",
            ));
        }
        Ok(())
    }

    /// The departed members entry (field 22, F121, F124 N5): in a
    /// collective only; each holder once, none of them a party, each a
    /// holder of the stake in the collective itself (field 7), which is what
    /// pays them: the entry records only that the identity is departed.
    fn check_departed(&self) -> R<()> {
        let Some(d) = &self.departed else { return Ok(()) };
        if !self.is_collective() {
            return Err(LawError::Check(
                "a departed members entry belongs to a collective (F121)",
            ));
        }
        if !distinct(d) || d.iter().any(|h| self.parties.contains(h)) {
            return Err(LawError::Check(
                "a departed members entry names each holder once, and no party (F121)",
            ));
        }
        let own = self.own_stake().map(|(_, s)| s);
        if d.iter().any(|h| own.is_none_or(|s| s.share_of(&Who::Id(*h)) == 0)) {
            return Err(LawError::Check(
                "a departed holder holds a share of the stake in the collective itself (field 7): the entry records only that they are departed (N5)",
            ));
        }
        Ok(())
    }

    /// Terms field 7: each stake's holders distinct, each share above zero,
    /// summing to 1,000,000; no object twice; null, this collective, only in
    /// a collective's terms (S1), and never holding a stake in itself.
    fn check_stakes(&self) -> R<()> {
        let Some(st) = &self.stakes else { return Ok(()) };
        let objects: Vec<Who> = st.iter().map(|s| s.object).collect();
        if objects.iter().enumerate().any(|(i, o)| objects[..i].contains(o)) {
            return Err(LawError::Check("two stakes on one object"));
        }
        // Shares are summed wide: summed in 64 bits, shares near the top
        // could wrap round to exactly 1,000,000 and pass (found by the Law
        // invariants, `docs/law-invariants.md`, IC7).
        for s in st {
            let who: Vec<Who> = s.holders.iter().map(|(h, _)| *h).collect();
            if who.iter().enumerate().any(|(i, o)| who[..i].contains(o))
                || s.holders.iter().any(|(_, n)| *n == 0)
                || s.holders.iter().map(|(_, n)| *n as u128).sum::<u128>() != MILLION as u128
            {
                return Err(LawError::Check(
                    "a stake's holders are distinct, each share above zero, summing to 1,000,000 (rule 15a)",
                ));
            }
            let this = s.object == Who::This || who.contains(&Who::This);
            if this && !self.is_collective() {
                return Err(LawError::Check(
                    "null names this collective: only a collective's terms use it (S1)",
                ));
            }
            if s.object == Who::This && who.contains(&Who::This) {
                return Err(LawError::Check("a collective holds no stake in itself"));
            }
        }
        Ok(())
    }

    /// The judge and, in order, those that take over from it (F121): the
    /// chain of judgment for `judge`, starting with the judge itself.
    /// `None` when the terms name no such judge.
    pub fn chain_of(&self, judge: &Judge) -> Option<Vec<Hash>> {
        let first = match judge {
            Judge::Task(t) => self.task_judge(*t)?,
            Judge::Identity(x) => *x,
            Judge::SplitService => self.split_grant?,
        };
        let mut out = vec![first];
        if let Some(l) = self.chain.iter().flatten().find(|l| &l.judge == judge) {
            out.extend(l.successors());
        }
        Some(out)
    }

    /// "Areas" and Q21, Q32: fields 18 to 20, areas' holders, numbers,
    /// reach and ids. A clone's number left above its holders is checked
    /// against the parent (the view).
    fn check_areas(&self, mips: &Mips) -> R<()> {
        let areas = self.areas();
        let ids: Vec<u64> = areas.iter().map(|a| a.id).collect();
        if ids.iter().enumerate().any(|(i, x)| ids[..i].contains(x)) {
            return Err(LawError::Check("two areas carry the same id (Q32)"));
        }
        for a in areas {
            if !distinct(&a.holders) || !a.holders.iter().all(|h| self.parties.contains(h)) {
                return Err(LawError::Check("an area's holders are distinct parties"));
            }
            if a.holders.is_empty() && self.parent.is_none() {
                return Err(LawError::Check(
                    "founding terms never list an area without holders (Q21)",
                ));
            }
            if a.threshold == 0 {
                return Err(LawError::Check("an area's number is at least 1"));
            }
            if a.kinds.is_none() && a.fields.is_none() {
                return Err(LawError::Check("an area reaches at least one act kind or one field"));
            }
            for k in a.kinds.iter().flatten() {
                match k {
                    Kind::Layer(l) if *l > layers::PRODUCTION => {
                        return Err(LawError::Check("an area names a layer that does not exist"))
                    }
                    Kind::Type { spec, type_ }
                        if (spec == &mips.identity && (*type_ == 0 || *type_ == 1))
                            || (spec == &mips.law && *type_ == crate::law::types::RECORD) =>
                    {
                        // Genesis, rotations and records are never in an
                        // area's reach ("Areas").
                        return Err(LawError::Check(
                            "genesis, rotations and records are never in an area's reach",
                        ));
                    }
                    _ => {}
                }
            }
            for f in a.fields.iter().flatten() {
                let ok = match f {
                    FieldRef::Field(n) => [7, 8, 17].contains(n),
                    FieldRef::Task(t) => (1..=LAST_TASK).contains(t) && !JUDICIAL_TASKS.contains(t),
                };
                if !ok {
                    return Err(LawError::Check(
                        "an area's field references name only operational fields and tasks",
                    ));
                }
            }
        }
        // No two areas reach the same act or the same field (Q5).
        for (i, a) in areas.iter().enumerate() {
            for b2 in &areas[i + 1..] {
                for x in a.kinds.iter().flatten() {
                    for y in b2.kinds.iter().flatten() {
                        if self.kinds_overlap(mips, x, y) {
                            return Err(LawError::Check("two areas reach the same acts (Q5)"));
                        }
                    }
                }
                for x in a.fields.iter().flatten() {
                    if b2.fields.iter().flatten().any(|y| y == x) {
                        return Err(LawError::Check("two areas reach the same field (Q5)"));
                    }
                }
                // A lane overlaps a field reference to a task of its layer.
                for (p, q) in [(a, b2), (b2, a)] {
                    for f in q.fields.iter().flatten() {
                        if let FieldRef::Task(t) = f {
                            if task_layer(*t).is_some_and(|l| p.is_lane(l)) {
                                return Err(LawError::Check(
                                    "a lane and another area both reach a task of its layer (Q5)",
                                ));
                            }
                        }
                    }
                }
            }
        }
        if let Some(w) = &self.area_words {
            let mut last = None;
            for (id, _) in w {
                if !ids.contains(id) {
                    return Err(LawError::Check("area words for an area that does not exist"));
                }
                if last.is_some_and(|l| l >= *id) {
                    return Err(LawError::Shape("area words, ascending by id"));
                }
                last = Some(*id);
            }
        }
        Ok(())
    }

    /// Law rule 36 with F96: the grammar fits the parties, and leaves a way
    /// to rotate that survives the loss of any one key holder.
    fn check_grammar(&self, g: &KeyGrammar) -> R<()> {
        let parties = &self.parties;
        for h in [&g.signing, &g.safety] {
            if let Holding::Shares { threshold, members } = h {
                if members.is_empty()
                    || !distinct(members)
                    || !members.iter().all(|m| parties.contains(m))
                    || *threshold == 0
                    || *threshold > members.len() as u64
                {
                    return Err(LawError::Check(
                        "a holding's members or threshold do not fit the parties",
                    ));
                }
            }
        }
        if let Some(Recovery::Escrow { authority }) = &g.recovery {
            match &self.abandonment {
                Some(Abandonment {
                    authority: Authority::Named(a),
                    ..
                }) if a == authority => {}
                _ => {
                    return Err(LawError::Check(
                        "an escrowed share is released by the abandonment authority, which the clause must name",
                    ))
                }
            }
        }
        match &g.safety {
            Holding::Shares { threshold, members } => {
                if *threshold == members.len() as u64 && g.recovery.is_none() {
                    return Err(LawError::Check(
                        "the grammar needs every member to rotate and names no recovery path",
                    ));
                }
            }
            Holding::One(holder) => {
                if !matches!(g.recovery, Some(Recovery::Escrow { .. })) {
                    return Err(LawError::Check(
                        "one holder keeps the safety key and no escrowed share is named for a successor (F96)",
                    ));
                }
                let has_successor =
                    self.succession.iter().flatten().any(|p| {
                        &p.party == holder && p.seats.as_ref().is_some_and(|s| !s.is_empty())
                    });
                if !has_successor {
                    return Err(LawError::Check(
                        "one holder keeps the safety key and no successor to the seat is named (F96)",
                    ));
                }
            }
            Holding::Custodian { custodian, .. } => {
                let other = match &g.recovery {
                    Some(Recovery::Custodian { custodian: c, .. }) => c != custodian,
                    Some(Recovery::Escrow { authority }) => authority != custodian,
                    None => false,
                };
                if !other {
                    return Err(LawError::Check(
                        "one custodian keeps the safety key and no recovery path held by another is named (F96)",
                    ));
                }
            }
        }
        Ok(())
    }
}

/// A mark's shape: at least one power, ascending by deterministic encoding,
/// no power twice, each with distinct signers.
fn check_mark_shape(m: &[MarkEntry]) -> R<()> {
    if m.is_empty() {
        return Err(LawError::Shape("a mark names at least one power"));
    }
    for w in m.windows(2) {
        if w[0].power.encoding() >= w[1].power.encoding() {
            return Err(LawError::Check(
                "a mark's powers are ascending by their encoding, no power twice",
            ));
        }
    }
    for e in m {
        // Ascending by hash, so one meaning has one encoding (B8); that
        // also names no signer twice.
        if e.signers.is_empty() || e.signers.windows(2).any(|w| w[0] >= w[1]) {
            return Err(LawError::Check(
                "a mark's signers for a power are ascending by hash, none twice (B8)",
            ));
        }
    }
    Ok(())
}

// ---------------------------------------------------------------- signatures

/// Decode a signature act's payload, `{ 0 => hash }`, and check its inside:
/// it names, in `objects`, the act it signs as both chain and predecessor.
pub fn decode_signature(inside: &Inside) -> R<Hash> {
    let mut signed = None;
    for (k, v) in &inside.payload {
        match k {
            Value::Uint(0) => signed = Some(hash(v, "signature: the act signed")?),
            _ => return Err(LawError::Shape("signature: unknown field")),
        }
    }
    let signed = signed.ok_or(LawError::Shape("signature: the act signed"))?;
    check_objects_self(inside, &signed, "signature: objects must name the act signed")?;
    Ok(signed)
}

/// The signature payload.
pub fn signature_payload(signed: &Hash) -> Vec<(Value, Value)> {
    vec![(Value::Uint(0), b(signed))]
}

/// F127: an act in a collective's name cites, in `objects`, the
/// collective's chain (its previous actions and the decision it acts
/// under), after the entries its type defines: entries all naming one
/// chain that none of the type's own entries names. Splits `objects` into
/// the type's `own` first entries and those citations.
pub fn chain_citations(objects: &[Object], own: usize) -> R<(&[Object], &[Object])> {
    let (a, c) = objects.split_at(own.min(objects.len()));
    if let Some(first) = c.first() {
        if c.iter().any(|o| o.chain != first.chain) || a.iter().any(|o| o.chain == first.chain) {
            return Err(LawError::Shape(
                "objects: after the entries the type defines, only citations of one collective's chain (F127)",
            ));
        }
    }
    Ok((a, c))
}

fn check_objects_self(inside: &Inside, x: &Hash, w: &'static str) -> R<()> {
    let expected = [Object {
        chain: *x,
        predecessor: *x,
    }];
    let o = inside.objects.as_deref().unwrap_or(&[]);
    match chain_citations(o, 1) {
        Ok((own, _)) if own == &expected[..] => Ok(()),
        _ => Err(LawError::Shape(w)),
    }
}

/// A fork's or closing's `objects` (F131, IT1): the agreement as chain and
/// predecessor, `[agreement, agreement]`, then one entry `[agreement,
/// ending]` for each earlier fork or closing of the same collective it
/// names, the act it follows on that chain, distinct, none the agreement.
fn check_objects_ending(inside: &Inside, x: &Hash, w: &'static str) -> R<()> {
    let o = inside.objects.as_deref().unwrap_or(&[]);
    let named = o.iter().skip(1).take_while(|e| &e.chain == x).count();
    let first = o.first().is_some_and(|e| &e.chain == x && &e.predecessor == x);
    let ends: Vec<Hash> = o.iter().skip(1).take(named).map(|e| e.predecessor).collect();
    if !first || ends.contains(x) || !distinct(&ends) || chain_citations(&o[1 + named..], 0).is_err() {
        return Err(LawError::Shape(w));
    }
    Ok(())
}

/// The inside `objects` a terms act carries: none for founding terms; for a
/// clone, `[[parent, the parent-chain act it follows]]`; either followed, for
/// terms a collective proposes, by its chain citations (F127).
pub(crate) fn check_terms_inside(inside: &Inside, t: &Terms) -> R<()> {
    let o = inside.objects.as_deref().unwrap_or(&[]);
    match &t.parent {
        None => match chain_citations(o, 0) {
            Ok(_) => Ok(()),
            Err(_) => Err(LawError::Shape("terms without a parent name no chain")),
        },
        // F189 (6): a settling version also cites each tip it settles,
        // `[tip, tip]`, after its parent, in field 26's order, so that a
        // verifier fetching by citation finds them (QF3: every tip).
        Some(p) => {
            let tips = t.settles.as_deref().unwrap_or(&[]);
            let n = 1 + tips.len();
            let own_ok = o.len() >= n
                && &o[0].chain == p
                && o[1..n].iter().zip(tips).all(|(e, x)| e.chain == *x && e.predecessor == *x);
            if !own_ok {
                return Err(LawError::Shape(if tips.is_empty() {
                    "a clone names its parent's chain in objects, once"
                } else {
                    "a settling version names its parent's chain in objects, then each tip it settles as chain and predecessor (F189, 6)"
                }));
            }
            let rest = &o[n..];
            if t.is_collective() {
                return match chain_citations(rest, 0) {
                    Ok(_) if !rest.iter().any(|e| &e.chain == p) => Ok(()),
                    _ => Err(LawError::Shape("a clone names its parent's chain in objects, once")),
                };
            }
            // A deal's version may cite acts it was made after, each
            // `[act, act]`, none twice: a settlement it follows shows so
            // (QF1, F190: a version citing the settlement is plainly after
            // it); then, proposed by a collective, its chain citations (F127).
            let k = rest.iter().take_while(|e| e.chain == e.predecessor).count();
            let cited: Vec<Hash> = rest[..k].iter().map(|e| e.predecessor).collect();
            let fine = distinct(&cited)
                && !cited.contains(p)
                && !cited.iter().any(|c| tips.contains(c))
                && chain_citations(&rest[k..], 0).is_ok();
            if fine {
                Ok(())
            } else {
                Err(LawError::Shape("a deal's version cites, after its parent and the tips it settles, the acts it was made after, each as chain and predecessor, none twice, then a collective's chain"))
            }
        }
    }
}

/// The acts a deal's version cites after its parent and the tips it
/// settles (QF1, F190): what it shows it was made after.
pub fn deal_citations(inside: &Inside, t: &Terms) -> Vec<Hash> {
    if t.parent.is_none() || t.is_collective() {
        return vec![];
    }
    let n = 1 + t.settles.as_ref().map_or(0, |x| x.len());
    inside
        .objects
        .as_deref()
        .unwrap_or(&[])
        .iter()
        .skip(n)
        .take_while(|e| e.chain == e.predecessor)
        .map(|e| e.predecessor)
        .collect()
}

// ---------------------------------------------------------------- resignation

/// Resignation (type 16): giving up one's voice in a collective's
/// agreement, or stepping down from one area of it (field 1). Field 2
/// (F207, decided 10 October 2026): the drafts its signer had signed and
/// leaves behind, ascending, none twice (the field's number and shape, the
/// build's mechanic); a version it names never brings its signer back. Her
/// client names them (client conformance); one it fails to name is her
/// stated cost (F195).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Resignation {
    pub agreement: Hash,
    pub area: Option<u64>,
    /// 2: the drafts left behind (F207).
    pub drafts: Vec<Hash>,
}

impl Resignation {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![(Value::Uint(0), b(&self.agreement))];
        if let Some(a) = self.area {
            m.push((Value::Uint(1), Value::Uint(a)));
        }
        if !self.drafts.is_empty() {
            m.push((Value::Uint(2), hashes_value(&self.drafts)));
        }
        m
    }

    /// Decode, and check the inside names the agreement as chain and
    /// predecessor.
    pub fn decode(inside: &Inside) -> R<Resignation> {
        let mut agreement = None;
        let mut area = None;
        let mut drafts = vec![];
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => agreement = Some(hash(v, "resignation: the agreement")?),
                Value::Uint(1) => area = Some(uint(v, "resignation: the area")?),
                Value::Uint(2) => {
                    drafts = nonempty(v, "resignation: the drafts left behind")?
                        .iter()
                        .map(|x| hash(x, "resignation: a draft left behind"))
                        .collect::<R<Vec<_>>>()?;
                    if !drafts.windows(2).all(|w| w[0] < w[1]) {
                        return Err(LawError::Check("resignation: the drafts left behind are ascending, none twice (F207)"));
                    }
                }
                _ => return Err(LawError::Shape("resignation: unknown field")),
            }
        }
        let agreement = agreement.ok_or(LawError::Shape("resignation: the agreement"))?;
        check_objects_self(inside, &agreement, "resignation: objects must name the agreement")?;
        Ok(Resignation { agreement, area, drafts })
    }
}

// ---------------------------------------------------------------- contest

/// Contest (type 14; BQ4, decided 9 October 2026): the party a declaration
/// of absence names answers it, which shows presence. It names the
/// declaration as chain and predecessor, `[[declaration, declaration]]`,
/// and voids nothing (rule 52, F172): it is shown beside the declaration.
/// A contest of any other act, or by another with standing (rule 57a),
/// keeps its format open.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Contest {
    /// 0: the declaration of absence (type 13) it answers.
    pub declaration: Hash,
}

impl Contest {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.declaration))]
    }

    /// Decode, and check the inside names the declaration as chain and
    /// predecessor.
    pub fn decode(inside: &Inside) -> R<Contest> {
        let mut declaration = None;
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => declaration = Some(hash(v, "contest: the declaration")?),
                _ => return Err(LawError::Shape("contest: unknown field (only a declaration of absence's format is written, BQ4)")),
            }
        }
        let declaration = declaration.ok_or(LawError::Shape("contest: the declaration"))?;
        check_objects_self(inside, &declaration, "contest: objects must name the declaration")?;
        Ok(Contest { declaration })
    }
}

// ---------------------------------------------------------------- a deal's fork, settled by its arbitrator

/// Settlement request (type 22; DQ8, decided 9 October 2026): a party who
/// signed a deal's reference version asks the arbitrator that version
/// names to settle the fork of that version. It names the reference as
/// chain and predecessor, `[[reference, reference]]`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SettlementRequest {
    /// 0: the reference: the version with two complete clones.
    pub reference: Hash,
}

impl SettlementRequest {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.reference))]
    }

    pub fn decode(inside: &Inside) -> R<SettlementRequest> {
        let mut reference = None;
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => reference = Some(hash(v, "settlement request: the reference")?),
                _ => return Err(LawError::Shape("settlement request: unknown field")),
            }
        }
        let reference = reference.ok_or(LawError::Shape("settlement request: the reference"))?;
        check_objects_self(inside, &reference, "settlement request: objects must name the reference")?;
        Ok(SettlementRequest { reference })
    }
}

/// Notice (type 24; F197, decided 10 October 2026): before closing, a
/// collective owing money back to a payer who gave no address sends that
/// payer a notice, sealed to their identity (or public), asking where the
/// money should go, with a deadline on a time reference. Its conditions are
/// visible, so its good faith can be judged. It names the payment owed
/// back (one receipt or claim of it) as chain and predecessor,
/// `[[payment, payment]]`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Notice {
    /// 0: the payment owed back, by one receipt or claim of it.
    pub payment: Hash,
    /// 1: the deadline: a time reference, and the point on it.
    pub deadline: (Hash, Value),
}

impl Notice {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.payment)), (Value::Uint(1), Value::Array(vec![b(&self.deadline.0), self.deadline.1.clone()]))]
    }

    pub fn decode(inside: &Inside) -> R<Notice> {
        let (mut payment, mut deadline) = (None, None);
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => payment = Some(hash(v, "notice: the payment owed back")?),
                Value::Uint(1) => {
                    let a = tuple(v, 2, "notice: the deadline")?;
                    deadline = Some((hash(&a[0], "notice: the deadline's time reference")?, a[1].clone()));
                }
                _ => return Err(LawError::Shape("notice: unknown field")),
            }
        }
        let payment = payment.ok_or(LawError::Shape("notice: the payment owed back"))?;
        let deadline = deadline.ok_or(LawError::Shape("notice: the deadline"))?;
        check_objects_self(inside, &payment, "notice: objects must name the payment owed back")?;
        Ok(Notice { payment, deadline })
    }
}

/// Fork settlement (type 23; DQ8): the judge of forks a deal's reference
/// version names (field 27, QF2) settles its fork, once a party's request
/// activated it: the branch kept, by its tip, and every tip discarded
/// (QF3), ascending, none twice. It names the request as chain and
/// predecessor, `[[request, request]]`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ForkSettlement {
    /// 0: the settlement request (type 22) that activated the arbitrator.
    pub request: Hash,
    /// 1: the tip of the branch kept, in force from then on.
    pub kept: Hash,
    /// 2: every tip discarded (QF3).
    pub discarded: Vec<Hash>,
}

impl ForkSettlement {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.request)), (Value::Uint(1), b(&self.kept)), (Value::Uint(2), hashes_value(&self.discarded))]
    }

    pub fn decode(inside: &Inside) -> R<ForkSettlement> {
        let (mut request, mut kept, mut discarded) = (None, None, None);
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => request = Some(hash(v, "fork settlement: the request")?),
                Value::Uint(1) => kept = Some(hash(v, "fork settlement: the tip kept")?),
                Value::Uint(2) => discarded = Some(hashes(v, "fork settlement: the tips discarded")?),
                _ => return Err(LawError::Shape("fork settlement: unknown field")),
            }
        }
        let request = request.ok_or(LawError::Shape("fork settlement: the request"))?;
        check_objects_self(inside, &request, "fork settlement: objects must name the request")?;
        let kept = kept.ok_or(LawError::Shape("fork settlement: the tip kept"))?;
        let discarded = discarded.ok_or(LawError::Shape("fork settlement: the tips discarded"))?;
        if !discarded.windows(2).all(|w| w[0] < w[1]) || discarded.contains(&kept) {
            return Err(LawError::Check("fork settlement: the tips discarded are ascending, none twice, none the tip kept (QF3)"));
        }
        Ok(ForkSettlement { request, kept, discarded })
    }
}

// ---------------------------------------------------------------- abandonment declaration

/// Abandonment declaration (type 13, B12): the authority the clause names
/// declares a party absent, under the clause the party signed (rules 46a,
/// 51), with outcomes the clause allows.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AbsenceDeclaration {
    /// 0: the agreement in which the party is declared absent.
    pub agreement: Hash,
    /// 1: the version of the agreement whose abandonment clause it applies:
    /// the last version, back from field 0, that the party signed.
    pub clause: Hash,
    /// 2: the party declared absent.
    pub party: Hash,
    /// 3: the outcomes, ascending, each one the clause allows.
    pub outcomes: Vec<u64>,
}

impl AbsenceDeclaration {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![
            (Value::Uint(0), b(&self.agreement)),
            (Value::Uint(1), b(&self.clause)),
            (Value::Uint(2), b(&self.party)),
            (
                Value::Uint(3),
                Value::Array(self.outcomes.iter().map(|o| Value::Uint(*o)).collect()),
            ),
        ]
    }

    /// Decode, and check the inside names the agreement as chain and
    /// predecessor, as a resignation does.
    pub fn decode(inside: &Inside) -> R<AbsenceDeclaration> {
        let (mut agreement, mut clause, mut party, mut outs) = (None, None, None, None);
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => agreement = Some(hash(v, "declaration: the agreement")?),
                Value::Uint(1) => clause = Some(hash(v, "declaration: the clause's version")?),
                Value::Uint(2) => party = Some(hash(v, "declaration: the party")?),
                Value::Uint(3) => {
                    outs = Some(
                        nonempty(v, "declaration: outcomes")?
                            .iter()
                            .map(|x| uint(x, "declaration: outcome"))
                            .collect::<R<Vec<u64>>>()?,
                    )
                }
                _ => return Err(LawError::Shape("declaration: unknown field")),
            }
        }
        let d = AbsenceDeclaration {
            agreement: agreement.ok_or(LawError::Shape("declaration: the agreement"))?,
            clause: clause.ok_or(LawError::Shape("declaration: the clause's version"))?,
            party: party.ok_or(LawError::Shape("declaration: the party"))?,
            outcomes: outs.ok_or(LawError::Shape("declaration: outcomes"))?,
        };
        if d.outcomes.iter().any(|o| *o > outcomes::AGREEMENT_CLOSED)
            || d.outcomes.windows(2).any(|w| w[0] >= w[1])
        {
            return Err(LawError::Check(
                "a declaration's outcomes are known ones, ascending, none twice",
            ));
        }
        check_objects_self(inside, &d.agreement, "declaration: objects must name the agreement")?;
        Ok(d)
    }
}

// ---------------------------------------------------------------- record

/// Record (type 17): the collective's everyday line (A1, A2, C3, C5).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Record {
    /// 0: the complete clone it writes on the record.
    pub clone: Option<Hash>,
    /// 2: the signature acts that complete that clone (A2).
    pub signatures: Option<Vec<Hash>>,
    /// 1: the latest act of every other sequence the collective keeps.
    pub kept: Vec<KeptTip>,
    /// 3: what it registers: resignations, steppings down, abandonment
    /// declarations, members' own rotations.
    pub registers: Option<Vec<Hash>>,
}

impl Record {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![];
        if let Some(c) = &self.clone {
            m.push((Value::Uint(0), b(c)));
        }
        m.push((
            Value::Uint(1),
            Value::Array(
                self.kept
                    .iter()
                    .map(|t| {
                        Value::Array(vec![b(&t.act), Value::Uint(t.position), b(&t.summary)])
                    })
                    .collect(),
            ),
        ));
        if let Some(s) = &self.signatures {
            m.push((Value::Uint(2), hashes_value(s)));
        }
        if let Some(r) = &self.registers {
            m.push((Value::Uint(3), hashes_value(r)));
        }
        m
    }

    /// The act its inside names as chain and predecessor: the clone, or for
    /// a record naming none, the agreement in force for it.
    pub fn decode(inside: &Inside) -> R<Record> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(n) if *n <= 3 => f.push((*n, v)),
                _ => return Err(LawError::Shape("record: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let kept = match get(1).ok_or(LawError::Shape("record: kept tips"))? {
            Value::Array(a) => a
                .iter()
                .map(|t| {
                    let x = tuple(t, 3, "record: kept tip")?;
                    Ok(KeptTip {
                        act: hash(&x[0], "kept tip act")?,
                        position: uint(&x[1], "kept tip position")?,
                        summary: hash(&x[2], "kept tip summary")?,
                    })
                })
                .collect::<R<Vec<_>>>()?,
            _ => return Err(LawError::Shape("record: kept tips")),
        };
        let r = Record {
            clone: get(0).map(|v| hash(v, "record: the clone")).transpose()?,
            signatures: get(2).map(|v| hashes(v, "record: signatures")).transpose()?,
            kept,
            registers: get(3).map(|v| hashes(v, "record: registrations")).transpose()?,
        };
        if r.clone.is_some() != r.signatures.is_some() {
            return Err(LawError::Shape(
                "record: field 2 is present exactly when field 0 is",
            ));
        }
        if r.clone.is_none() && r.registers.is_none() {
            return Err(LawError::Shape("record: at least one of fields 0 and 3"));
        }
        let o = inside.objects.as_deref().unwrap_or(&[]);
        if o.len() != 1 || o[0].chain != o[0].predecessor {
            return Err(LawError::Shape(
                "record: objects name the clone, or the agreement in force, as chain and predecessor",
            ));
        }
        if let Some(c) = &r.clone {
            if &o[0].chain != c {
                return Err(LawError::Shape("record: objects must name its clone"));
            }
        }
        for s in [&r.signatures, &r.registers].into_iter().flatten() {
            if !distinct(s) {
                return Err(LawError::Check("a record names one act twice"));
            }
        }
        Ok(r)
    }

    /// The act the record's inside names: its clone, or the agreement in
    /// force it registers under.
    pub fn named(inside: &Inside) -> Option<Hash> {
        inside.objects.as_deref().and_then(|o| o.first()).map(|o| o.chain)
    }
}

// ---------------------------------------------------------------- grant

/// Grant (type 9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Grant {
    /// 0: the grantee.
    pub grantee: Hash,
    /// 1: scope: 0 sign new deals, 1 manage named ones, 2 act for an identity.
    pub scope: u64,
    /// 2: the agreements concerned, for scope 1.
    pub agreements: Option<Vec<Hash>>,
    /// 2, null: "this agreement", the deal whose terms list the grant in
    /// field 14 (F129, H4), as founding terms name "this collective" (S1).
    pub this_agreement: bool,
    /// 3: limits, as the grant's cMIP defines.
    pub limits: Option<Value>,
    /// 4: the cMIP defining the limits.
    pub limits_cmip: Option<Hash>,
    /// 5: for a collective: the area whose power issues it, by id.
    pub area: Option<u64>,
    /// 6: the acts it reaches; required with field 5.
    pub kinds: Option<Vec<Kind>>,
    /// 7: a reinstatement: the ended grant it reinstates (Flaw N).
    pub reinstates: Option<Hash>,
    /// 8, null: the grantor is this collective, the one whose founding
    /// terms name the grant (F124, S1); absent: the grant's signer.
    pub by_this: bool,
    /// 9: the grant key (F128): a key of the collective, scoped to the
    /// grant, held by the grantee, who made it and keeps its secret part.
    /// Acts signed with it are the collective's own, bound to this grant.
    pub key: SigningKey,
}

impl Grant {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.grantee)),
            (Value::Uint(1), Value::Uint(self.scope)),
        ];
        if let Some(a) = &self.agreements {
            m.push((Value::Uint(2), hashes_value(a)));
        } else if self.this_agreement {
            m.push((Value::Uint(2), Value::Null));
        }
        if let Some(l) = &self.limits {
            m.push((Value::Uint(3), l.clone()));
        }
        if let Some(c) = &self.limits_cmip {
            m.push((Value::Uint(4), b(c)));
        }
        if let Some(a) = self.area {
            m.push((Value::Uint(5), Value::Uint(a)));
        }
        if let Some(k) = &self.kinds {
            m.push((Value::Uint(6), Value::Array(k.iter().map(Kind::to_value).collect())));
        }
        if let Some(r) = &self.reinstates {
            m.push((Value::Uint(7), b(r)));
        }
        if self.by_this {
            m.push((Value::Uint(8), Value::Null));
        }
        m.push((Value::Uint(9), self.key.to_value()));
        m
    }

    /// Fields 0 to 6, which a reinstatement repeats; its key is its own
    /// (F128: reinstating is cloning the ended grant, a new decision).
    pub fn same_grant(&self, other: &Grant) -> bool {
        Grant {
            reinstates: None,
            key: other.key.clone(),
            ..self.clone()
        } == Grant {
            reinstates: None,
            ..other.clone()
        }
    }

    pub fn decode(p: &[(Value, Value)]) -> R<Grant> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in p {
            match k {
                Value::Uint(n) if *n <= 9 => f.push((*n, v)),
                _ => return Err(LawError::Shape("grant: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let g = Grant {
            grantee: hash(get(0).ok_or(LawError::Shape("grant: grantee"))?, "grant: grantee")?,
            scope: uint(get(1).ok_or(LawError::Shape("grant: scope"))?, "grant: scope")?,
            agreements: match get(2) {
                Some(Value::Null) | None => None,
                Some(v) => Some(hashes(v, "grant: agreements")?),
            },
            this_agreement: matches!(get(2), Some(Value::Null)),
            limits: get(3).cloned(),
            limits_cmip: get(4).map(|v| hash(v, "grant: limits cMIP")).transpose()?,
            area: get(5).map(|v| uint(v, "grant: area")).transpose()?,
            kinds: get(6)
                .map(|v| nonempty(v, "grant: kinds")?.iter().map(kind).collect())
                .transpose()?,
            reinstates: get(7).map(|v| hash(v, "grant: reinstates")).transpose()?,
            by_this: match get(8) {
                None => false,
                Some(Value::Null) => true,
                Some(_) => return Err(LawError::Shape("grant: field 8 is null, this collective (S1)")),
            },
            key: crate::identity::signing_key(get(9).ok_or(LawError::Shape("grant: field 9, the grant key (F128)"))?)
                .map_err(|_| LawError::Shape("grant: field 9, the grant key, is a signing key (F128)"))?,
        };
        if g.by_this && (g.area.is_some() || g.reinstates.is_some()) {
            return Err(LawError::Shape(
                "grant: a grant of this collective by its founding terms (field 8) names no area and reinstates nothing",
            ));
        }
        if g.this_agreement && (g.scope != 1 || g.by_this || g.area.is_some() || g.reinstates.is_some()) {
            return Err(LawError::Shape(
                "grant: a grant naming this agreement by null (F129, H4) manages that deal (scope 1), and names no area, reinstates nothing and is not a collective's founding grant",
            ));
        }
        if g.scope > 2 {
            return Err(LawError::Check("a grant's scope is 0, 1 or 2"));
        }
        if g.area.is_some() && g.kinds.is_none() {
            return Err(LawError::Shape("grant: field 6 is required with field 5"));
        }
        if g.reinstates.is_some() && g.area.is_none() {
            return Err(LawError::Shape("grant: field 7 only with field 5"));
        }
        Ok(g)
    }
}

// ---------------------------------------------------------------- revocation

/// Revocation (type 10, F128): a decision of the grantor ending a grant's
/// powers, which removes its grant key. It names the grant, never a place
/// on the grantee's strand (C6). `{ 0 => hash }`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Revocation {
    /// 0: the grant revoked.
    pub grant: Hash,
}

impl Revocation {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.grant))]
    }

    pub fn decode(p: &[(Value, Value)]) -> R<Revocation> {
        let mut grant = None;
        for (k, v) in p {
            match k {
                Value::Uint(0) => grant = Some(hash(v, "revocation: the grant")?),
                _ => return Err(LawError::Shape("revocation: unknown field")),
            }
        }
        Ok(Revocation {
            grant: grant.ok_or(LawError::Shape("revocation: the grant"))?,
        })
    }
}

// ---------------------------------------------------------------- declarations

/// A collective's Law declaration of kind 0: at genesis, the founding terms;
/// at a rotation, a constitutional clone and the signature acts completing
/// it (Flaw M), and, at a recovery rotation, the signature acts on the
/// declaration taking effect there (Flaw B18); at a rollback (rule 37d,
/// F185), the broken act it names and the departures it registers.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Declared {
    pub agreement: Hash,
    pub signatures: Option<Vec<Hash>>,
    pub absence: Option<Vec<Hash>>,
    pub rollback: Option<Rollback>,
}

/// What a rollback names beside its clone and signatures (rule 37d, F185):
/// the broken act, a rotation of the collective, by its id; and the
/// resignations and steppings down (type 16) it registers, possibly none.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rollback {
    pub broken: Hash,
    pub registers: Vec<Hash>,
}

/// The Law declaration of kind 0 among these declarations, decoded. `None`
/// when there is none; `Err` when its value is in neither form.
pub fn declared_in(ds: &[Declaration], law: &Hash) -> Option<R<Declared>> {
    ds.iter()
        .find(|d| &d.spec == law && d.kind == kinds::FOUNDING_AGREEMENT)
        .map(|d| match &d.value {
            Some(Value::Bytes(x)) => Ok(Declared {
                agreement: x
                    .as_slice()
                    .try_into()
                    .map_err(|_| LawError::Shape("Law declaration"))?,
                signatures: None,
                absence: None,
                rollback: None,
            }),
            // A rollback: `[clone, [+ hash], broken, [* hash]]`, its third
            // element a hash, where the recovery form has a list (F185).
            Some(Value::Array(a)) if a.len() == 4 => Ok(Declared {
                agreement: hash(&a[0], "Law declaration: the clone")?,
                signatures: Some(hashes(&a[1], "Law declaration: signatures")?),
                absence: None,
                rollback: Some(Rollback {
                    broken: hash(&a[2], "Law declaration: the broken act")?,
                    registers: match &a[3] {
                        Value::Array(x) => x
                            .iter()
                            .map(|h| hash(h, "Law declaration: what a rollback registers"))
                            .collect::<R<_>>()?,
                        _ => return Err(LawError::Shape("Law declaration: what a rollback registers")),
                    },
                }),
            }),
            Some(Value::Array(a)) if a.len() == 2 || a.len() == 3 => Ok(Declared {
                agreement: hash(&a[0], "Law declaration: the clone")?,
                signatures: Some(hashes(&a[1], "Law declaration: signatures")?),
                absence: a
                    .get(2)
                    .map(|x| hashes(x, "Law declaration: signatures on a declaration"))
                    .transpose()?,
                rollback: None,
            }),
            _ => Err(LawError::Shape("Law declaration")),
        })
}

/// The declaration a collective's genesis carries: its founding terms.
pub fn founding_declaration(law: &Hash, agreement: &Hash) -> Declaration {
    Declaration {
        spec: *law,
        kind: kinds::FOUNDING_AGREEMENT,
        value: Some(b(agreement)),
    }
}

/// The declaration a rotation carries for a constitutional clone: the clone
/// and the signature acts that complete it (Flaw M).
pub fn clone_declaration(law: &Hash, clone: &Hash, signatures: &[Hash]) -> Declaration {
    Declaration {
        spec: *law,
        kind: kinds::FOUNDING_AGREEMENT,
        value: Some(Value::Array(vec![b(clone), hashes_value(signatures)])),
    }
}

/// The declaration a recovery rotation carries (C7, B16): the clone that
/// takes the declared party out, the signature acts that complete it, and
/// the signature acts on the declaration that takes effect there, which
/// the rotation places (Flaw B18).
pub fn recovery_declaration(law: &Hash, clone: &Hash, signatures: &[Hash], absence: &[Hash]) -> Declaration {
    Declaration {
        spec: *law,
        kind: kinds::FOUNDING_AGREEMENT,
        value: Some(Value::Array(vec![b(clone), hashes_value(signatures), hashes_value(absence)])),
    }
}

/// The declaration a rollback carries (rule 37d, F185): the clone of the
/// agreement in force just before the broken act, the signature acts that
/// complete it, the broken act it names, and the resignations and
/// steppings down it registers, possibly none.
pub fn rollback_declaration(law: &Hash, clone: &Hash, signatures: &[Hash], broken: &Hash, registers: &[Hash]) -> Declaration {
    Declaration {
        spec: *law,
        kind: kinds::FOUNDING_AGREEMENT,
        value: Some(Value::Array(vec![
            b(clone),
            hashes_value(signatures),
            b(broken),
            Value::Array(registers.iter().map(b).collect()),
        ])),
    }
}

// ---------------------------------------------------------------- negotiation message

/// Negotiation message (type 18, F118): a Law act carrying text, by which
/// two sides negotiate (rule 56). Its inside names, in `objects`, nothing
/// for a thread's first message, and `[[thread, previous]]` for every later
/// one; its `acks` name at most the latest message of the other side its
/// signer received.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NegotiationMessage {
    /// 0: the message, as canonical text.
    pub text: String,
    /// 1: a text format cMIP, as a text act may name one.
    pub format: Option<Hash>,
    /// The thread it belongs to and the message it follows, from `objects`;
    /// `None` for a thread's first message.
    pub follows: Option<(Hash, Hash)>,
    /// The other side's message it acknowledges, from `acks`.
    pub acks: Option<Hash>,
}

impl NegotiationMessage {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![(Value::Uint(0), Value::Text(self.text.clone()))];
        if let Some(f) = &self.format {
            m.push((Value::Uint(1), b(f)));
        }
        m
    }

    /// Decode, and check the inside's `objects` and `acks` have the shape
    /// rule 56 gives them.
    pub fn decode(inside: &Inside) -> R<NegotiationMessage> {
        let mut text = None;
        let mut format = None;
        for (k, v) in &inside.payload {
            match (k, v) {
                (Value::Uint(0), Value::Text(t)) => text = Some(t.clone()),
                (Value::Uint(1), _) => format = Some(hash(v, "negotiation message: the format")?),
                _ => return Err(LawError::Shape("negotiation message: unknown field")),
            }
        }
        let text = text.ok_or(LawError::Shape("negotiation message: the text"))?;
        if !crate::text::is_canonical(&text) {
            return Err(LawError::Check("negotiation message: the text is not canonical (Text MIP)"));
        }
        let follows = match inside.objects.as_deref() {
            None => None,
            Some([o]) => Some((o.chain, o.predecessor)),
            Some(_) => {
                return Err(LawError::Shape(
                    "negotiation message: objects name the thread and the previous message, once",
                ))
            }
        };
        let acks = match inside.acks.as_deref() {
            None | Some([]) => None,
            Some([a]) => Some(*a),
            Some(_) => {
                return Err(LawError::Shape(
                    "negotiation message: acks name only the latest message received from the other side",
                ))
            }
        };
        Ok(NegotiationMessage { text, format, follows, acks })
    }
}

// ---------------------------------------------------------------- the fork of a collective

fn tip_value(t: &KeptTip) -> Value {
    Value::Array(vec![b(&t.act), Value::Uint(t.position), b(&t.summary)])
}

fn tips(v: &Value, w: &'static str) -> R<Vec<KeptTip>> {
    match v {
        Value::Array(a) => a
            .iter()
            .map(|t| {
                let x = tuple(t, 3, w)?;
                Ok(KeptTip {
                    act: hash(&x[0], w)?,
                    position: uint(&x[1], w)?,
                    summary: hash(&x[2], w)?,
                })
            })
            .collect(),
        _ => Err(LawError::Shape(w)),
    }
}

/// One stake the original held, and the share of it each side's successor
/// takes (fork field 5): `[ agreement, index, [+ share] ]`, in millionths.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ForkShare {
    pub agreement: Hash,
    pub index: u64,
    pub shares: Vec<u64>,
}

/// One side of a fork (fork field 4): the successor collective it founded
/// first, by its identity, and the members who join it (F124, N4).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Side {
    pub successor: Hash,
    pub members: Vec<Hash>,
}

/// The fork act (type 19, rule 47a, F121 shape B, F124): signed by one
/// member of the original collective with their own identity, completed by
/// the signature acts of every other member it lists, under the
/// constitutional change rule (N1), and of each successor a debt is
/// assigned to (N13). Its inside names, in `objects`, the original
/// agreement as chain and predecessor.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Fork {
    /// 0: the original's agreement in force at the fork.
    pub agreement: Hash,
    /// 1: the original collective.
    pub collective: Hash,
    /// 2: the original's identity-chain act (genesis or rotation) its
    /// latest acts are bound to.
    pub chain_act: Hash,
    /// 3: the latest act of every sequence the original keeps under it: the
    /// fork's line, as a record's or a rotation's kept tips (N2).
    pub tips: Vec<KeptTip>,
    /// 4: the sides, at least two: each its successor and its members.
    pub sides: Vec<Side>,
    /// 5: shares of stakes the original held, where not the default.
    pub shares: Vec<ForkShare>,
    /// 6: every obligation of the original, each assigned to one side's
    /// successor or to several jointly (N13): (obligation, sides).
    pub debts: Vec<(Hash, Vec<u64>)>,
}

fn line_map(agreement: &Hash, collective: &Hash, chain_act: &Hash, t: &[KeptTip]) -> Vec<(Value, Value)> {
    vec![
        (Value::Uint(0), b(agreement)),
        (Value::Uint(1), b(collective)),
        (Value::Uint(2), b(chain_act)),
        (Value::Uint(3), Value::Array(t.iter().map(tip_value).collect())),
    ]
}

impl Fork {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = line_map(&self.agreement, &self.collective, &self.chain_act, &self.tips);
        m.push((
            Value::Uint(4),
            Value::Array(
                self.sides
                    .iter()
                    .map(|s| Value::Array(vec![b(&s.successor), hashes_value(&s.members)]))
                    .collect(),
            ),
        ));
        if !self.shares.is_empty() {
            m.push((
                Value::Uint(5),
                Value::Array(
                    self.shares
                        .iter()
                        .map(|x| {
                            Value::Array(vec![
                                b(&x.agreement),
                                Value::Uint(x.index),
                                Value::Array(x.shares.iter().map(|n| Value::Uint(*n)).collect()),
                            ])
                        })
                        .collect(),
                ),
            ));
        }
        if !self.debts.is_empty() {
            m.push((
                Value::Uint(6),
                Value::Array(
                    self.debts
                        .iter()
                        .map(|(o, s)| {
                            Value::Array(vec![b(o), Value::Array(s.iter().map(|i| Value::Uint(*i)).collect())])
                        })
                        .collect(),
                ),
            ));
        }
        m
    }

    /// Decode, with the checks that need no other act.
    pub fn decode(inside: &Inside) -> R<Fork> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(n) if *n <= 6 => f.push((*n, v)),
                _ => return Err(LawError::Shape("fork: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let req = |k: u64, w| get(k).ok_or(LawError::Shape(w));
        let sides = nonempty(req(4, "fork: sides")?, "fork: sides")?
            .iter()
            .map(|x| {
                let a = tuple(x, 2, "fork: a side")?;
                Ok(Side {
                    successor: hash(&a[0], "fork: a side's successor")?,
                    members: hashes(&a[1], "fork: a side's members")?,
                })
            })
            .collect::<R<Vec<_>>>()?;
        let shares = match get(5) {
            None => vec![],
            Some(v) => nonempty(v, "fork: shares")?
                .iter()
                .map(|x| {
                    let a = tuple(x, 3, "fork: a share")?;
                    Ok(ForkShare {
                        agreement: hash(&a[0], "fork: a share's agreement")?,
                        index: uint(&a[1], "fork: a share's stake")?,
                        shares: match &a[2] {
                            Value::Array(n) => n.iter().map(|y| uint(y, "fork: share")).collect::<R<Vec<_>>>()?,
                            _ => return Err(LawError::Shape("fork: shares")),
                        },
                    })
                })
                .collect::<R<Vec<_>>>()?,
        };
        let debts = match get(6) {
            None => vec![],
            Some(v) => nonempty(v, "fork: debts")?
                .iter()
                .map(|x| {
                    let a = tuple(x, 2, "fork: a debt")?;
                    Ok((
                        hash(&a[0], "fork: a debt's obligation")?,
                        nonempty(&a[1], "fork: a debt's sides")?
                            .iter()
                            .map(|y| uint(y, "fork: a debt's side"))
                            .collect::<R<Vec<_>>>()?,
                    ))
                })
                .collect::<R<Vec<_>>>()?,
        };
        let x = Fork {
            agreement: hash(req(0, "fork: the agreement")?, "fork: the agreement")?,
            collective: hash(req(1, "fork: the collective")?, "fork: the collective")?,
            chain_act: hash(req(2, "fork: the chain act")?, "fork: the chain act")?,
            tips: tips(req(3, "fork: kept tips")?, "fork: kept tip")?,
            sides,
            shares,
            debts,
        };
        if x.sides.len() < 2 {
            return Err(LawError::Check("a fork has at least two sides (F121)"));
        }
        let all: Vec<Hash> = x.sides.iter().flat_map(|s| s.members.iter()).copied().collect();
        if !distinct(&all) {
            return Err(LawError::Check("a member is on one side of a fork at most (F121)"));
        }
        let successors: Vec<Hash> = x.sides.iter().map(|s| s.successor).collect();
        if !distinct(&successors) || successors.iter().any(|s| s == &x.collective) {
            return Err(LawError::Check("each side names its own successor, never the original (N4)"));
        }
        for sh in &x.shares {
            if sh.shares.len() != x.sides.len() || sh.shares.iter().map(|n| *n as u128).sum::<u128>() != MILLION as u128 {
                return Err(LawError::Check(
                    "a fork's shares name one share per side, in millionths, summing to 1,000,000 (F121)",
                ));
            }
        }
        for (i, a) in x.shares.iter().enumerate() {
            if x.shares[..i].iter().any(|b2| b2.agreement == a.agreement && b2.index == a.index) {
                return Err(LawError::Check("a fork names one stake's shares once"));
            }
        }
        let obligations: Vec<Hash> = x.debts.iter().map(|(o, _)| *o).collect();
        if !distinct(&obligations)
            || x.debts.iter().any(|(_, s)| {
                s.windows(2).any(|w| w[0] >= w[1]) || s.iter().any(|i| *i as usize >= x.sides.len())
            })
        {
            return Err(LawError::Check(
                "a fork assigns each debt once, to sides it lists, ascending (F121, N13)",
            ));
        }
        check_objects_ending(inside, &x.agreement, "fork")?;
        Ok(x)
    }

    /// The side a member is on.
    pub fn side_of(&self, member: &Hash) -> Option<usize> {
        self.sides.iter().position(|s| s.members.contains(member))
    }
}

/// The closing act (type 20, F124 N9): ends a collective that holds
/// nothing, every work sold or released. Signed by one member with their
/// own identity, completed by the signature acts of members meeting the
/// constitutional change rule, as the fork act is. Its fields draw its line
/// as the fork's do; its inside names the agreement as chain and
/// predecessor.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Closing {
    pub agreement: Hash,
    pub collective: Hash,
    pub chain_act: Hash,
    pub tips: Vec<KeptTip>,
    /// 4: the money owed back it leaves open (rule 37d; QG1, F191; F197):
    /// ascending by payment, none twice.
    pub open: Vec<OpenOwed>,
}

/// `open-owed = [ payment: hash, notice: hash / null, ? holder: hash ]`: a
/// payment owed back that a closing leaves open (rule 37d), by one receipt
/// or claim of it; the notice sent to its payer (type 24, F197), or null
/// where it is owed to nobody (QG1, F191: the payment committed no key);
/// and, where the collective chose one, the holder that outlives the
/// closing and pays the payer when they turn up (F197: a cMIP's role; the
/// core shows it, and requires none).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OpenOwed {
    pub payment: Hash,
    pub notice: Option<Hash>,
    pub holder: Option<Hash>,
}

impl OpenOwed {
    pub fn to_value(&self) -> Value {
        let mut v = vec![b(&self.payment), self.notice.as_ref().map_or(Value::Null, b)];
        if let Some(h) = &self.holder {
            v.push(b(h));
        }
        Value::Array(v)
    }

    fn decode(v: &Value) -> R<OpenOwed> {
        let w = "closing: an obligation left open";
        let Value::Array(a) = v else { return Err(LawError::Shape(w)) };
        if a.len() != 2 && a.len() != 3 {
            return Err(LawError::Shape(w));
        }
        Ok(OpenOwed {
            payment: hash(&a[0], w)?,
            notice: match &a[1] {
                Value::Null => None,
                x => Some(hash(x, w)?),
            },
            holder: a.get(2).map(|x| hash(x, w)).transpose()?,
        })
    }
}

impl Closing {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = line_map(&self.agreement, &self.collective, &self.chain_act, &self.tips);
        if !self.open.is_empty() {
            m.push((Value::Uint(4), Value::Array(self.open.iter().map(OpenOwed::to_value).collect())));
        }
        m
    }

    pub fn decode(inside: &Inside) -> R<Closing> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(n) if *n <= 4 => f.push((*n, v)),
                _ => return Err(LawError::Shape("closing: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let req = |k: u64, w| get(k).ok_or(LawError::Shape(w));
        let open = match get(4) {
            None => vec![],
            Some(v) => nonempty(v, "closing: the obligations left open")?.iter().map(OpenOwed::decode).collect::<R<Vec<_>>>()?,
        };
        if !open.windows(2).all(|w| w[0].payment < w[1].payment) {
            return Err(LawError::Check("closing: the obligations left open are ascending by payment, none twice (field 4)"));
        }
        let x = Closing {
            agreement: hash(req(0, "closing: the agreement")?, "closing: the agreement")?,
            collective: hash(req(1, "closing: the collective")?, "closing: the collective")?,
            chain_act: hash(req(2, "closing: the chain act")?, "closing: the chain act")?,
            tips: tips(req(3, "closing: kept tips")?, "closing: kept tip")?,
            open,
        };
        check_objects_ending(inside, &x.agreement, "closing")?;
        Ok(x)
    }
}

// ---------------------------------------------------------------- the release

/// A stake, by the agreement defining it and its index there.
pub type StakeRef = (Hash, u64);

/// The public domain release (type 5, rule 17, F121 shape D): signed by one
/// holder, completed by the signature acts of the others the release rule
/// needs; public, so that its content keys are published. Its inside
/// names, in `objects`, each agreement whose stake it ends, as chain and
/// predecessor.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Release {
    /// 0: the work released, by its hash.
    pub work: Hash,
    /// 1: the stakes in it whose claim ends: its owners' history.
    pub stakes: Vec<StakeRef>,
    /// 2: the work claims binding it to its creators: its creators' history.
    pub claims: Vec<Hash>,
    /// 3: the content key of each publication carrying it; may be absent
    /// in a timed release, whose keeper delivers the keys at its point.
    pub keys: Vec<(Hash, Vec<u8>)>,
    /// 4: a timed release (F124, N11): the point on the time reference of
    /// each agreement whose stake it ends, at which the claim ends, and the
    /// identity that delivers the content keys then.
    pub timed: Option<(Value, Hash)>,
}

impl Release {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.work)),
            (
                Value::Uint(1),
                Value::Array(
                    self.stakes
                        .iter()
                        .map(|(a, i)| Value::Array(vec![b(a), Value::Uint(*i)]))
                        .collect(),
                ),
            ),
        ];
        if !self.claims.is_empty() {
            m.push((Value::Uint(2), hashes_value(&self.claims)));
        }
        if !self.keys.is_empty() {
            m.push((
                Value::Uint(3),
                Value::Array(
                    self.keys
                        .iter()
                        .map(|(p, k)| Value::Array(vec![b(p), Value::Bytes(k.clone())]))
                        .collect(),
                ),
            ));
        }
        if let Some((point, keeper)) = &self.timed {
            m.push((Value::Uint(4), Value::Array(vec![point.clone(), b(keeper)])));
        }
        m
    }

    pub fn decode(inside: &Inside) -> R<Release> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(n) if *n <= 4 => f.push((*n, v)),
                _ => return Err(LawError::Shape("release: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let req = |k: u64, w| get(k).ok_or(LawError::Shape(w));
        let r = Release {
            work: hash(req(0, "release: the work")?, "release: the work")?,
            stakes: pairs(req(1, "release: stakes")?, "release: a stake")?,
            claims: get(2).map(|v| hashes(v, "release: claims")).transpose()?.unwrap_or_default(),
            keys: match get(3) {
                None if get(4).is_some() => vec![],
                _ => nonempty(req(3, "release: content keys")?, "release: content keys")?
                    .iter()
                    .map(|x| {
                        let a = tuple(x, 2, "release: a content key")?;
                        match &a[1] {
                            Value::Bytes(k) if k.len() == 32 => Ok((hash(&a[0], "release: a publication")?, k.clone())),
                            _ => Err(LawError::Shape("release: a content key is 32 bytes")),
                        }
                    })
                    .collect::<R<Vec<_>>>()?,
            },
            timed: get(4)
                .map(|v| {
                    let a = tuple(v, 2, "release: the point and its keeper")?;
                    Ok((a[0].clone(), hash(&a[1], "release: the keeper of the keys")?))
                })
                .transpose()?,
        };
        if get(2).is_some() && r.claims.is_empty() {
            return Err(LawError::Shape("release: claims"));
        }
        for (i, a) in r.stakes.iter().enumerate() {
            if r.stakes[..i].contains(a) {
                return Err(LawError::Check("a release names one stake twice"));
            }
        }
        if !distinct(&r.claims) {
            return Err(LawError::Check("a release names one claim twice"));
        }
        let mut ags: Vec<Hash> = r.stakes.iter().map(|(a, _)| *a).collect();
        ags.sort();
        ags.dedup();
        let mut named: Vec<Hash> = vec![];
        let (own, _) = chain_citations(inside.objects.as_deref().unwrap_or(&[]), ags.len())
            .map_err(|_| LawError::Shape("release: objects name each agreement whose stake it ends"))?;
        for o in own {
            if o.chain != o.predecessor {
                return Err(LawError::Shape("release: objects name each agreement as chain and predecessor"));
            }
            named.push(o.chain);
        }
        named.sort();
        if named != ags {
            return Err(LawError::Shape("release: objects name each agreement whose stake it ends"));
        }
        Ok(r)
    }
}

// ---------------------------------------------------------------- the split

/// One payout of a split (F121, Q9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Payout {
    /// 0: who receives it.
    pub receiver: Hash,
    /// 1: how much, in the smallest part of the receipt's unit.
    pub amount: u64,
    /// 2: the stake it pays, by its index in the agreement's terms.
    pub stake: Option<u64>,
    /// 3: the role it fills.
    pub role: Option<String>,
    /// 4: the evidence for that role.
    pub evidence: Option<Hash>,
    /// 5: a fee: the module whose fee it pays, its receiver being key 0.
    pub fee_module: Option<Hash>,
    /// 6: the rail fee deducted, within the plan's maximum.
    pub rail_fee: Option<u64>,
}

impl Payout {
    pub fn to_value(&self) -> Value {
        let mut m = vec![
            (Value::Uint(0), b(&self.receiver)),
            (Value::Uint(1), Value::Uint(self.amount)),
        ];
        if let Some(x) = self.stake {
            m.push((Value::Uint(2), Value::Uint(x)));
        }
        if let Some(x) = &self.role {
            m.push((Value::Uint(3), Value::Text(x.clone())));
        }
        if let Some(x) = &self.evidence {
            m.push((Value::Uint(4), b(x)));
        }
        if let Some(x) = &self.fee_module {
            m.push((Value::Uint(5), b(x)));
        }
        if let Some(x) = self.rail_fee {
            m.push((Value::Uint(6), Value::Uint(x)));
        }
        Value::Map(m)
    }
}

/// A split (type 8, rules 20 to 24): signed by the split service with its
/// own key, delivered to every holder it pays, naming each fee and who
/// received it (F121, Q9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Split {
    /// 0: the receipt or payer's claim that brought the money.
    pub receipt: Hash,
    /// 1: every payout, summing exactly to the amount received.
    pub payouts: Vec<Payout>,
    /// 2: the split cMIP used.
    pub cmip: Hash,
    /// 3: the owners' agreement whose stakes it pays.
    pub agreement: Hash,
    /// 4: the tally (rule 15a; F165, F171, F178 item 15): for each stake it
    /// pays, the running count of leftover units each holder has received
    /// from the service's splits for that stake, this split's included.
    /// The split act also cites, in its envelope, the service's previous
    /// split act for each stake, so a tie is checked from two acts.
    ///
    /// *PROPOSED format, to confirm with Nobody, allegedly (the spec gives
    /// the field, not its key):* `? 4 => [+ [stake: uint, [+ [holder:
    /// hash, count: uint]]]]`, stakes distinct, each stake's holders
    /// distinct. A holder not listed counts zero.
    pub tally: Option<Vec<(u64, Vec<(Hash, u64)>)>>,
    /// 5: the split's number (DQ6, decided 9 October 2026): one numbering
    /// runs across every split the service makes under a deal, on any
    /// branch of a fork, from 1, each split showing its number, so that a
    /// holder's client raises the alarm where the numbers it receives skip.
    pub number: Option<u64>,
}

/// Each holder's leftover units in what a split pays a stake (rule 15a,
/// F165): what it was paid above its exact share rounded down, its share
/// of `pot`, the sum of the split's payouts on the stake, among `holders`
/// (each its identity and share). `paid` is each receiver's payouts on the
/// stake; a receiver that holds no part of the stake is left out, and a
/// holder paid less than its share rounded down has none.
pub fn leftovers(pot: u64, holders: &[(Hash, u64)], paid: &[(Hash, u64)]) -> Vec<(Hash, u64)> {
    let sum: u128 = holders.iter().map(|(_, w)| *w as u128).sum::<u128>().max(1);
    let mut out: Vec<(Hash, u64)> = vec![];
    for (who, _) in holders {
        if out.iter().any(|(x, _)| x == who) {
            continue;
        }
        let got: u64 = paid.iter().filter(|(x, _)| x == who).map(|(_, n)| *n).fold(0, u64::saturating_add);
        let floor: u128 = holders.iter().filter(|(w, _)| w == who).map(|(_, n)| pot as u128 * *n as u128 / sum).sum();
        out.push((*who, got.saturating_sub(u64::try_from(floor).unwrap_or(u64::MAX))));
    }
    out
}

/// The running count after a split (rule 15a, F171): `before`, the count
/// the previous split for the stake carried (empty for the first), plus
/// `add`, this split's [`leftovers`]. Every holder named in either, by
/// identity hash; a holder named in neither counts zero.
pub fn running_count(before: &[(Hash, u64)], add: &[(Hash, u64)]) -> Vec<(Hash, u64)> {
    let mut out: std::collections::BTreeMap<Hash, u64> = std::collections::BTreeMap::new();
    for (h, n) in before.iter().chain(add) {
        let e = out.entry(*h).or_insert(0);
        *e = e.saturating_add(*n);
    }
    out.into_iter().collect()
}

/// Whether two running counts are the same, a holder not named counting
/// zero.
pub fn same_count(a: &[(Hash, u64)], b: &[(Hash, u64)]) -> bool {
    let get = |v: &[(Hash, u64)], h: &Hash| v.iter().filter(|(x, _)| x == h).map(|(_, n)| *n).fold(0, u64::saturating_add);
    a.iter().chain(b).all(|(h, _)| get(a, h) == get(b, h))
}

impl Split {
    /// The count the split carries for stake `idx` (field 4), if any.
    pub fn tally_of(&self, idx: u64) -> Option<&[(Hash, u64)]> {
        self.tally.as_ref()?.iter().find(|(s, _)| *s == idx).map(|(_, v)| v.as_slice())
    }

    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.receipt)),
            (Value::Uint(1), Value::Array(self.payouts.iter().map(Payout::to_value).collect())),
            (Value::Uint(2), b(&self.cmip)),
            (Value::Uint(3), b(&self.agreement)),
        ];
        if let Some(t) = &self.tally {
            let v = t
                .iter()
                .map(|(s, hs)| Value::Array(vec![Value::Uint(*s), Value::Array(hs.iter().map(|(h, n)| Value::Array(vec![b(h), Value::Uint(*n)])).collect())]))
                .collect();
            m.push((Value::Uint(4), Value::Array(v)));
        }
        if let Some(n) = self.number {
            m.push((Value::Uint(5), Value::Uint(n)));
        }
        m
    }

    pub fn decode(p: &[(Value, Value)]) -> R<Split> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in p {
            match k {
                Value::Uint(n) if *n <= 5 => f.push((*n, v)),
                _ => return Err(LawError::Shape("split: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let req = |k: u64, w| get(k).ok_or(LawError::Shape(w));
        let payouts = nonempty(req(1, "split: payouts")?, "split: payouts")?
            .iter()
            .map(|v| {
                let fl = map_fields(v, 7, "split: a payout")?;
                let pf = |k| field(&fl, k);
                Ok(Payout {
                    receiver: hash(pf(0).ok_or(LawError::Shape("payout: receiver"))?, "payout: receiver")?,
                    amount: uint(pf(1).ok_or(LawError::Shape("payout: amount"))?, "payout: amount")?,
                    stake: pf(2).map(|v| uint(v, "payout: stake")).transpose()?,
                    role: pf(3)
                        .map(|v| match v {
                            Value::Text(t) => Ok(t.clone()),
                            _ => Err(LawError::Shape("payout: role")),
                        })
                        .transpose()?,
                    evidence: pf(4).map(|v| hash(v, "payout: evidence")).transpose()?,
                    fee_module: pf(5).map(|v| hash(v, "payout: fee module")).transpose()?,
                    rail_fee: pf(6).map(|v| uint(v, "payout: rail fee")).transpose()?,
                })
            })
            .collect::<R<Vec<_>>>()?;
        for x in &payouts {
            if x.fee_module.is_some() && (x.stake.is_some() || x.role.is_some()) {
                return Err(LawError::Check("a payout pays a fee, a stake or a role, one at a time"));
            }
            if x.evidence.is_some() && x.role.is_none() {
                return Err(LawError::Shape("payout: evidence goes with a role"));
            }
        }
        Ok(Split {
            receipt: hash(req(0, "split: the receipt")?, "split: the receipt")?,
            payouts,
            cmip: hash(req(2, "split: the split cMIP")?, "split: the split cMIP")?,
            agreement: hash(req(3, "split: the agreement")?, "split: the agreement")?,
            tally: get(4).map(decode_tally).transpose()?,
            number: match get(5).map(|v| uint(v, "split: its number")).transpose()? {
                Some(0) => return Err(LawError::Shape("split: its number counts from 1 (DQ6)")),
                n => n,
            },
        })
    }
}

/// Field 4 of a split, the tally (PROPOSED format, to confirm with Nobody,
/// allegedly: the spec gives the field, not its key).
fn decode_tally(v: &Value) -> R<Vec<(u64, Vec<(Hash, u64)>)>> {
    let mut out: Vec<(u64, Vec<(Hash, u64)>)> = vec![];
    for e in nonempty(v, "split: the tally")? {
        let Value::Array(pair) = e else { return Err(LawError::Shape("split: a stake's tally")) };
        let [s, hs] = pair.as_slice() else { return Err(LawError::Shape("split: a stake's tally")) };
        let stake = uint(s, "split: the tally's stake")?;
        if out.iter().any(|(x, _)| *x == stake) {
            return Err(LawError::Shape("split: a stake tallied twice"));
        }
        let mut holders: Vec<(Hash, u64)> = vec![];
        for x in nonempty(hs, "split: a stake's tally")? {
            let Value::Array(hn) = x else { return Err(LawError::Shape("split: a holder's count")) };
            let [h, n] = hn.as_slice() else { return Err(LawError::Shape("split: a holder's count")) };
            let h = hash(h, "split: the tally's holder")?;
            if holders.iter().any(|(y, _)| *y == h) {
                return Err(LawError::Shape("split: a holder counted twice"));
            }
            holders.push((h, uint(n, "split: the tally's count")?));
        }
        out.push((stake, holders));
    }
    Ok(out)
}

// ---------------------------------------------------------------- decoding helpers

pub(crate) fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

pub(crate) fn hashes_value(v: &[Hash]) -> Value {
    Value::Array(v.iter().map(b).collect())
}

pub(crate) fn distinct(v: &[Hash]) -> bool {
    v.iter().enumerate().all(|(i, x)| !v[..i].contains(x))
}

fn hash(v: &Value, w: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(x) => x.as_slice().try_into().map_err(|_| LawError::Shape(w)),
        _ => Err(LawError::Shape(w)),
    }
}

fn uint(v: &Value, w: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(LawError::Shape(w)),
    }
}

fn nonempty<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if !a.is_empty() => Ok(a),
        _ => Err(LawError::Shape(w)),
    }
}

fn tuple<'a>(v: &'a Value, n: usize, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if a.len() == n => Ok(a),
        _ => Err(LawError::Shape(w)),
    }
}

fn hashes(v: &Value, w: &'static str) -> R<Vec<Hash>> {
    nonempty(v, w)?.iter().map(|x| hash(x, w)).collect()
}

fn rule(v: &Value) -> R<Rule> {
    let a = nonempty(v, "rule")?;
    match (uint(&a[0], "rule form")?, a.len()) {
        (0, 1) => Ok(Rule::All),
        (1, 2) => Ok(Rule::Threshold(uint(&a[1], "rule threshold")?)),
        (2, 2) => Ok(Rule::Named(hashes(&a[1], "rule names")?)),
        _ => Err(LawError::Shape("rule")),
    }
}

fn chain_link(v: &Value) -> R<ChainLink> {
    let a = tuple(v, 2, "chain link")?;
    let j = nonempty(&a[0], "judge")?;
    let judge = match (uint(&j[0], "judge form")?, j.len()) {
        (0, 2) => Judge::Task(uint(&j[1], "judge task")?),
        (1, 2) => Judge::Identity(hash(&j[1], "judge identity")?),
        (2, 1) => Judge::SplitService,
        _ => return Err(LawError::Shape("judge")),
    };
    let next = nonempty(&a[1], "chain of judgment")?
        .iter()
        .map(|n| {
            let x = tuple(n, 2, "chain of judgment: one that takes over, and its period")?;
            let taker = match &x[0] {
                Value::Array(_) => Taker::Grants(hashes(&x[0], "chain of judgment: a service's grants, one per payee")?),
                v => Taker::One(hash(v, "chain of judgment")?),
            };
            Ok((taker, uint(&x[1], "chain of judgment: period")?))
        })
        .collect::<R<Vec<_>>>()?;
    Ok(ChainLink { judge, next })
}

fn power(v: &Value) -> R<Power> {
    let a = nonempty(v, "power")?;
    match (uint(&a[0], "power form")?, a.len()) {
        (0, 1) => Ok(Power::Constitutional),
        (1, 1) => Ok(Power::Clone),
        (2, 2) => Ok(Power::Area(uint(&a[1], "power area")?)),
        (3, 2) => Ok(Power::Plan(hash(&a[1], "power party")?)),
        (4, 1) => Ok(Power::Judicial),
        _ => Err(LawError::Shape("power")),
    }
}

/// Field 4: a rule (its first item a number) or a mark (its first item an
/// entry, itself an array).
fn field4(v: &Value) -> R<Field4> {
    let a = nonempty(v, "terms field 4")?;
    match &a[0] {
        Value::Uint(_) => Ok(Field4::Rule(rule(v)?)),
        Value::Array(_) => Ok(Field4::Mark(
            a.iter()
                .map(|e| {
                    let x = tuple(e, 2, "mark entry")?;
                    Ok(MarkEntry {
                        power: power(&x[0])?,
                        signers: hashes(&x[1], "mark signers")?,
                    })
                })
                .collect::<R<_>>()?,
        )),
        _ => Err(LawError::Shape("terms field 4")),
    }
}

fn kind(v: &Value) -> R<Kind> {
    let a = nonempty(v, "kind")?;
    match (uint(&a[0], "kind form")?, a.len()) {
        (0, 2) => Ok(Kind::Layer(uint(&a[1], "kind layer")?)),
        (1, 3) => Ok(Kind::Type {
            spec: hash(&a[1], "kind spec")?,
            type_: uint(&a[2], "kind type")?,
        }),
        _ => Err(LawError::Shape("kind")),
    }
}

fn field_ref(v: &Value) -> R<FieldRef> {
    let a = tuple(v, 2, "field reference")?;
    match uint(&a[0], "field reference form")? {
        0 => Ok(FieldRef::Field(uint(&a[1], "field reference")?)),
        1 => Ok(FieldRef::Task(uint(&a[1], "field reference task")?)),
        _ => Err(LawError::Shape("field reference")),
    }
}

fn area(v: &Value) -> R<Area> {
    let f = map_fields(v, 6, "area")?;
    let Some(Value::Text(name)) = field(&f, 0) else {
        return Err(LawError::Shape("area name"));
    };
    let holders = match field(&f, 1).ok_or(LawError::Shape("area holders"))? {
        Value::Array(a) => a.iter().map(|x| hash(x, "area holders")).collect::<R<_>>()?,
        _ => return Err(LawError::Shape("area holders")),
    };
    Ok(Area {
        name: name.clone(),
        holders,
        threshold: uint(field(&f, 2).ok_or(LawError::Shape("area number"))?, "area number")?,
        kinds: field(&f, 3)
            .map(|v| nonempty(v, "area kinds")?.iter().map(kind).collect())
            .transpose()?,
        fields: field(&f, 4)
            .map(|v| nonempty(v, "area fields")?.iter().map(field_ref).collect())
            .transpose()?,
        id: uint(field(&f, 5).ok_or(LawError::Shape("area id"))?, "area id")?,
    })
}

fn holding(v: &Value) -> R<Holding> {
    let a = nonempty(v, "holding")?;
    match (uint(&a[0], "holding form")?, a.len()) {
        (0, 2) => Ok(Holding::One(hash(&a[1], "holding holder")?)),
        (1, 3) => Ok(Holding::Shares {
            threshold: uint(&a[1], "holding threshold")?,
            members: hashes(&a[2], "holding members")?,
        }),
        (2, 3) => Ok(Holding::Custodian {
            custodian: hash(&a[1], "holding custodian")?,
            grant: hash(&a[2], "holding grant")?,
        }),
        _ => Err(LawError::Shape("holding")),
    }
}

fn recovery(v: &Value) -> R<Recovery> {
    let a = nonempty(v, "recovery")?;
    match (uint(&a[0], "recovery form")?, a.len()) {
        (0, 3) => Ok(Recovery::Custodian {
            custodian: hash(&a[1], "recovery custodian")?,
            grant: hash(&a[2], "recovery grant")?,
        }),
        (1, 2) => Ok(Recovery::Escrow {
            authority: hash(&a[1], "recovery authority")?,
        }),
        _ => Err(LawError::Shape("recovery")),
    }
}

fn map_fields<'a>(v: &'a Value, n: u64, w: &'static str) -> R<Vec<(u64, &'a Value)>> {
    let Value::Map(m) = v else {
        return Err(LawError::Shape(w));
    };
    m.iter()
        .map(|(k, v)| match k {
            Value::Uint(k) if *k < n => Ok((*k, v)),
            _ => Err(LawError::Shape(w)),
        })
        .collect()
}

fn field<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

fn key_grammar(v: &Value) -> R<KeyGrammar> {
    let f = map_fields(v, 4, "key grammar")?;
    if field(&f, 2).is_some() {
        return Err(LawError::Shape(
            "key grammar key 2 (draft 6's listed act types) is retired: areas reach acts",
        ));
    }
    Ok(KeyGrammar {
        signing: holding(field(&f, 0).ok_or(LawError::Shape("key grammar signing key"))?)?,
        safety: holding(field(&f, 1).ok_or(LawError::Shape("key grammar safety key"))?)?,
        recovery: field(&f, 3).map(recovery).transpose()?,
    })
}

fn who(v: &Value, w: &'static str) -> R<Who> {
    match v {
        Value::Null => Ok(Who::This),
        _ => Ok(Who::Id(hash(v, w)?)),
    }
}

fn pairs(v: &Value, w: &'static str) -> R<Vec<(Hash, u64)>> {
    nonempty(v, w)?
        .iter()
        .map(|x| {
            let a = tuple(x, 2, w)?;
            Ok((hash(&a[0], w)?, uint(&a[1], w)?))
        })
        .collect()
}

fn succession_plan(v: &Value) -> R<SuccessionPlan> {
    let f = map_fields(v, 4, "succession plan")?;
    Ok(SuccessionPlan {
        party: hash(
            field(&f, 0).ok_or(LawError::Shape("succession plan party"))?,
            "succession plan party",
        )?,
        stakes: field(&f, 1)
            .map(|x| pairs(x, "stake successors"))
            .transpose()?,
        seats: field(&f, 2)
            .map(|x| pairs(x, "seat successors"))
            .transpose()?,
        entry: field(&f, 3).map(|x| uint(x, "seat entry")).transpose()?,
    })
}

fn abandonment(v: &Value) -> R<Abandonment> {
    let f = map_fields(v, 4, "abandonment")?;
    if field(&f, 2).is_some() {
        return Err(LawError::Shape(
            "abandonment key 2 (the period of absence, F140) is retired and never reused: terms carrying it are invalid (F172)",
        ));
    }
    let a = nonempty(
        field(&f, 0).ok_or(LawError::Shape("abandonment authority"))?,
        "abandonment authority",
    )?;
    let authority = match (uint(&a[0], "abandonment authority form")?, a.len()) {
        (0, 2) => Authority::Named(hash(&a[1], "abandonment authority")?),
        (1, 2) => Authority::Others(uint(&a[1], "abandonment authority threshold")?),
        _ => return Err(LawError::Shape("abandonment authority")),
    };
    Ok(Abandonment {
        authority,
        outcomes: nonempty(
            field(&f, 1).ok_or(LawError::Shape("abandonment outcomes"))?,
            "abandonment outcomes",
        )?
        .iter()
        .map(|x| uint(x, "abandonment outcome"))
        .collect::<R<_>>()?,
        proof: field(&f, 3)
            .map(|x| {
                let p = tuple(x, 2, "abandonment: an absence-proof cMIP and its parameters (key 3)")?;
                Ok((hash(&p[0], "abandonment: the absence-proof cMIP (key 3)")?, p[1].clone()))
            })
            .transpose()?,
    })
}
