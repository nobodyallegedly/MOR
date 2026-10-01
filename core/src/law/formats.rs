//! The Law MIP's exact formats (Law draft 7, "Act formats"), and the checks
//! that need no other act.
//!
//! In plain words: terms (an agreement's proposal), with the fields draft 7
//! adds (a clone's mark, the constitutional change rule, areas and their
//! words); the key grammar, which no longer lists act types; signatures;
//! resignations (leaving, or stepping down from one area); records (the
//! collective's everyday line); grants, which a collective may issue within
//! an area, and which may reinstate an ended grant.
//!
//! Terms fields whose formats are still open (stakes, the split plan, the
//! fork rule, refund terms) are refused as unsupported: a client never signs
//! or accepts what it does not implement (Envelope rule 11, fail closed).

use crate::act::{Inside, Object};
use crate::cbor::{self, Value};
use crate::hash::Hash;
use crate::identity::{Declaration, KeptTip};
use std::fmt;

/// The Law act types (Law, "Act formats").
pub mod types {
    pub const TERMS: u64 = 0;
    pub const SIGNATURE: u64 = 1;
    pub const KEEPER_RECORD: u64 = 2;
    pub const GRANT: u64 = 9;
    pub const REVOCATION: u64 = 10;
    pub const IMPORT: u64 = 11;
    pub const DECLARATION: u64 = 13;
    pub const RESIGNATION: u64 = 16;
    pub const RECORD: u64 = 17;
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
pub const LAST_TASK: u64 = 13;

/// The judicial tasks: condition evaluation, time reference, anchoring.
pub const JUDICIAL_TASKS: [u64; 3] = [9, 10, 11];

/// The time reference task (field 6 is a naming for it, Q25).
pub const TIME_REFERENCE_TASK: u64 = 10;

/// Stakes and succession shares are written in millionths.
pub const MILLION: u64 = 1_000_000;

/// The layer of a task's MIP (Production, task table).
pub fn task_layer(task: u64) -> Option<u64> {
    match task {
        1..=3 => Some(layers::IDENTITY),
        4 | 5 => Some(layers::ENVELOPE_AND_TEXT),
        6 | 7 => Some(layers::FINANCE),
        8..=13 => Some(layers::LAW),
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

/// Who decides absence (Law rule 49): always an identity, or a threshold of
/// the other parties, each of whom is one.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Authority {
    /// `[ 0, identity ]`: a named identity (a keeper's operator, or a third
    /// party).
    Named(Hash),
    /// `[ 1, threshold ]`: this many of the other parties.
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

/// `abandonment`: the authority, the outcomes allowed, ascending, and the
/// period of absence on the agreement's time reference.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Abandonment {
    pub authority: Authority,
    pub outcomes: Vec<u64>,
    pub period: Option<u64>,
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
        if let Some(p) = self.period {
            m.push((Value::Uint(2), Value::Uint(p)));
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
}

impl Power {
    pub fn to_value(&self) -> Value {
        match self {
            Power::Constitutional => Value::Array(vec![Value::Uint(0)]),
            Power::Clone => Value::Array(vec![Value::Uint(1)]),
            Power::Area(a) => Value::Array(vec![Value::Uint(2), Value::Uint(*a)]),
            Power::Plan(p) => Value::Array(vec![Value::Uint(3), b(p)]),
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
    /// 14: the split service's grant.
    pub split_grant: Option<Hash>,
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
                Value::Uint(7) => return Err(LawError::Unsupported("terms field 7 (stakes)")),
                Value::Uint(8) => return Err(LawError::Unsupported("terms field 8 (split plan)")),
                Value::Uint(10) => return Err(LawError::Unsupported("terms field 10 (fork rule)")),
                Value::Uint(17) => {
                    return Err(LawError::Unsupported("terms field 17 (refund terms)"))
                }
                Value::Uint(n) if *n <= 20 => f.push((*n, v)),
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
            split_grant: get(14).map(|v| hash(v, "terms split grant")).transpose()?,
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
        })
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
            if a.period.is_some() && self.time.is_none() && self.cmip(TIME_REFERENCE_TASK).is_none() {
                return Err(LawError::Check("an absence period needs a time reference"));
            }
        }
        for s in self.succession.iter().flatten() {
            if !parties.contains(&s.party) {
                return Err(LawError::Check(
                    "a succession plan is for someone who is not a party",
                ));
            }
            if let Some(st) = &s.stakes {
                if st.iter().map(|(_, n)| n).sum::<u64>() != MILLION {
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
        Ok(())
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
        if !distinct(&e.signers) {
            return Err(LawError::Check("a mark names a signer twice for one power"));
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

fn check_objects_self(inside: &Inside, x: &Hash, w: &'static str) -> R<()> {
    let expected = [Object {
        chain: *x,
        predecessor: *x,
    }];
    if inside.objects.as_deref() != Some(&expected[..]) {
        return Err(LawError::Shape(w));
    }
    Ok(())
}

/// The inside `objects` a terms act carries: none for founding terms; for a
/// clone, `[[parent, the parent-chain act it follows]]`.
pub(crate) fn check_terms_inside(inside: &Inside, t: &Terms) -> R<()> {
    match (&t.parent, &inside.objects) {
        (None, None) => Ok(()),
        (Some(p), Some(o)) if o.len() == 1 && &o[0].chain == p => Ok(()),
        (None, Some(_)) => Err(LawError::Shape("terms without a parent name no chain")),
        _ => Err(LawError::Shape(
            "a clone names its parent's chain in objects, once",
        )),
    }
}

// ---------------------------------------------------------------- resignation

/// Resignation (type 16): giving up one's voice in a collective's
/// agreement, or stepping down from one area of it (field 1).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Resignation {
    pub agreement: Hash,
    pub area: Option<u64>,
}

impl Resignation {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![(Value::Uint(0), b(&self.agreement))];
        if let Some(a) = self.area {
            m.push((Value::Uint(1), Value::Uint(a)));
        }
        m
    }

    /// Decode, and check the inside names the agreement as chain and
    /// predecessor.
    pub fn decode(inside: &Inside) -> R<Resignation> {
        let mut agreement = None;
        let mut area = None;
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(0) => agreement = Some(hash(v, "resignation: the agreement")?),
                Value::Uint(1) => area = Some(uint(v, "resignation: the area")?),
                _ => return Err(LawError::Shape("resignation: unknown field")),
            }
        }
        let agreement = agreement.ok_or(LawError::Shape("resignation: the agreement"))?;
        check_objects_self(inside, &agreement, "resignation: objects must name the agreement")?;
        Ok(Resignation { agreement, area })
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
}

impl Grant {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.grantee)),
            (Value::Uint(1), Value::Uint(self.scope)),
        ];
        if let Some(a) = &self.agreements {
            m.push((Value::Uint(2), hashes_value(a)));
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
        m
    }

    /// Fields 0 to 6, which a reinstatement repeats.
    pub fn same_grant(&self, other: &Grant) -> bool {
        Grant {
            reinstates: None,
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
                Value::Uint(n) if *n <= 7 => f.push((*n, v)),
                _ => return Err(LawError::Shape("grant: unknown field")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let g = Grant {
            grantee: hash(get(0).ok_or(LawError::Shape("grant: grantee"))?, "grant: grantee")?,
            scope: uint(get(1).ok_or(LawError::Shape("grant: scope"))?, "grant: scope")?,
            agreements: get(2).map(|v| hashes(v, "grant: agreements")).transpose()?,
            limits: get(3).cloned(),
            limits_cmip: get(4).map(|v| hash(v, "grant: limits cMIP")).transpose()?,
            area: get(5).map(|v| uint(v, "grant: area")).transpose()?,
            kinds: get(6)
                .map(|v| nonempty(v, "grant: kinds")?.iter().map(kind).collect())
                .transpose()?,
            reinstates: get(7).map(|v| hash(v, "grant: reinstates")).transpose()?,
        };
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

// ---------------------------------------------------------------- declarations

/// A collective's Law declaration of kind 0: at genesis, the founding terms;
/// at a rotation, a constitutional clone and the signature acts completing
/// it (Flaw M).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Declared {
    pub agreement: Hash,
    pub signatures: Option<Vec<Hash>>,
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
            }),
            Some(Value::Array(a)) if a.len() == 2 => Ok(Declared {
                agreement: hash(&a[0], "Law declaration: the clone")?,
                signatures: Some(hashes(&a[1], "Law declaration: signatures")?),
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

fn power(v: &Value) -> R<Power> {
    let a = nonempty(v, "power")?;
    match (uint(&a[0], "power form")?, a.len()) {
        (0, 1) => Ok(Power::Constitutional),
        (1, 1) => Ok(Power::Clone),
        (2, 2) => Ok(Power::Area(uint(&a[1], "power area")?)),
        (3, 2) => Ok(Power::Plan(hash(&a[1], "power party")?)),
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
    let f = map_fields(v, 3, "abandonment")?;
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
        period: field(&f, 2)
            .map(|x| uint(x, "abandonment period"))
            .transpose()?,
    })
}
