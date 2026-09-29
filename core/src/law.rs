//! The Law MIP's first exact formats, and the checks a collective needs
//! (Law draft 6; roadmap step 5a): terms, including a founding agreement and
//! its key grammar; signature acts; clones; which agreement is in force for
//! a collective; and whether an act of the collective has the visible member
//! signatures its key grammar requires.
//!
//! Law draft 6 fixes only the formats a collective needs. Terms fields whose
//! formats are still open (stakes, the split plan, the fork rule, refund
//! terms) are refused as unsupported: a client never signs or accepts what
//! it does not implement (Envelope rule 11, fail closed).
//!
//! In plain words:
//!
//! 1. An agreement is its terms plus one signature act per party. It exists
//!    once the signing rule is met; a clone is complete once the parent's
//!    clone rule is met by the parent's parties.
//! 2. A collective's genesis, and each rotation that changes its members,
//!    declares the agreement it lives under. Which one is in force for an
//!    act of the collective is read from the collective's own identity
//!    chain, at the chain act that bound the act's signing key. So the
//!    collective's rotation at a member change fences the old rules off:
//!    whatever the old key signs after it is void (Identity), F100.
//! 3. Where the key grammar lists an act type, an act of the collective of
//!    that type counts only with visible signature acts by the parties the
//!    rule requires.

use crate::act::{Inside, Object};
use crate::cbor::Value;
use crate::chain::{Status, Verifier};
use crate::hash::Hash;
use crate::identity::Declaration;
use std::fmt;

/// The types this step settles (Law, "Act formats").
pub mod types {
    pub const TERMS: u64 = 0;
    pub const SIGNATURE: u64 = 1;
}

/// The declaration kinds Law defines (Identity, declarations slot).
pub mod kinds {
    /// The agreement a collective lives under: its founding agreement, then
    /// each clone that changes it. The value is the agreement's id.
    pub const FOUNDING_AGREEMENT: u64 = 0;
}

/// The highest task number (Production, task table).
pub const LAST_TASK: u64 = 13;

/// Stakes and succession shares are written in millionths.
pub const MILLION: u64 = 1_000_000;

/// Why a Law act, or an agreement, fails.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum LawError {
    /// The payload or inside is not in the type's shape. Names the field.
    Shape(&'static str),
    /// A field whose exact format Law has not fixed yet: refused, never
    /// accepted unchecked.
    Unsupported(&'static str),
    /// A rule of the Law MIP fails. Names it.
    Check(&'static str),
    /// An act the check needs is not held (or not opened).
    Missing(Hash),
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
        }
    }
}

impl std::error::Error for LawError {}

type R<T> = Result<T, LawError>;

// ---------------------------------------------------------------- formats

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

    /// Whether these distinct signers, all parties, meet the rule.
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

/// One act type the grammar makes require visible member signature acts:
/// `[ spec: hash, type: uint, rule ]` (Law draft 6: the rule says which).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Listed {
    pub spec: Hash,
    pub type_: u64,
    pub rule: Rule,
}

/// `key-grammar`, present if the agreement founds a collective.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KeyGrammar {
    pub signing: Holding,
    pub safety: Holding,
    pub listed: Option<Vec<Listed>>,
    pub recovery: Option<Recovery>,
}

impl KeyGrammar {
    pub fn to_value(&self) -> Value {
        let mut m = vec![
            (Value::Uint(0), self.signing.to_value()),
            (Value::Uint(1), self.safety.to_value()),
        ];
        if let Some(l) = &self.listed {
            m.push((
                Value::Uint(2),
                Value::Array(
                    l.iter()
                        .map(|x| {
                            Value::Array(vec![b(&x.spec), Value::Uint(x.type_), x.rule.to_value()])
                        })
                        .collect(),
                ),
            ));
        }
        if let Some(r) = &self.recovery {
            m.push((Value::Uint(3), r.to_value()));
        }
        Value::Map(m)
    }

    /// The rule for acts of this spec and type, if the grammar lists them.
    pub fn listed(&self, spec: &Hash, type_: u64) -> Option<&Rule> {
        self.listed
            .iter()
            .flatten()
            .find(|l| &l.spec == spec && l.type_ == type_)
            .map(|l| &l.rule)
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
    /// Seat entry: 0 automatic, 1 with the members' approval.
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

/// `abandonment` (Law draft 6):
///
/// ```cddl
/// abandonment = {
///   0 => [ 0, hash ] / [ 1, uint ],   ; authority: a named identity, or a threshold of the other parties
///   1 => [+ uint],                    ; outcomes allowed (rule 53), ascending
///   ? 2 => uint                       ; period of absence, on the agreement's time reference
/// }
/// ```
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
}

/// Terms (type 0), in the fields Law draft 6 fixes.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Terms {
    /// 0: parties, identity or collective hashes, in order.
    pub parties: Vec<Hash>,
    /// 1: the terms, as canonical text.
    pub text: String,
    /// 2: cMIPs, at most one per task (task number, cMIP hash), ascending.
    pub cmips: Vec<(u64, Hash)>,
    /// 3: keepers.
    pub keepers: Option<Keepers>,
    /// 4: signing rule.
    pub signing: Rule,
    /// 5: clone rule.
    pub clone: Rule,
    /// 6: time reference: the task cMIP and its parameters.
    pub time: Option<(Hash, Value)>,
    /// 9: the abandonment clause.
    pub abandonment: Option<Abandonment>,
    /// 11: parent, for a clone.
    pub parent: Option<Hash>,
    /// 12: key grammar, for a founding agreement.
    pub grammar: Option<KeyGrammar>,
    /// 13: arbitrators or verifiers.
    pub arbitrators: Option<Vec<Hash>>,
    /// 14: the split service's grant.
    pub split_grant: Option<Hash>,
    /// 15: extensions.
    pub extensions: Option<Vec<Hash>>,
    /// 16: succession plans of parties.
    pub succession: Option<Vec<SuccessionPlan>>,
}

impl Terms {
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
            (Value::Uint(4), self.signing.to_value()),
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
        m
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
                Value::Uint(n) if *n <= 16 => f.push((*n, v)),
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
            signing: rule(req(4, "terms signing rule")?)?,
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
        })
    }

    /// The checks that need no other act (Law rules 1, 2, 36, 48a, 49; F96).
    pub fn check(&self) -> R<()> {
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
        if !self.signing.fits(parties) || !self.clone.fits(parties) {
            return Err(LawError::Check(
                "a rule names a threshold or party that does not fit the parties",
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
            if a.period.is_some() && self.time.is_none() {
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
        if let Some(l) = &g.listed {
            for (i, x) in l.iter().enumerate() {
                if l[..i]
                    .iter()
                    .any(|y| y.spec == x.spec && y.type_ == x.type_)
                {
                    return Err(LawError::Check("the grammar lists one act type twice"));
                }
                if !x.rule.fits(parties) {
                    return Err(LawError::Check(
                        "a member-signature rule does not fit the parties",
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
        // The way to rotate (F96): whoever is lost, the rest can still
        // rebuild the safety key.
        match &g.safety {
            Holding::Shares { threshold, members } => {
                if *threshold == members.len() as u64 && g.recovery.is_none() {
                    return Err(LawError::Check(
                        "the grammar needs every member to rotate and names no recovery path",
                    ));
                }
            }
            Holding::One(holder) => {
                // F96: one person holds the safety key. A successor and an
                // escrowed share released to them must be named.
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
                // A single custodian has the same flaw (F96).
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

/// Decode a signature act's payload, `{ 0 => hash }`, and check its inside:
/// it names, in `objects`, the act it signs as both chain and predecessor
/// (Law draft 6: a signature follows the act it signs).
pub fn decode_signature(inside: &Inside) -> R<Hash> {
    let mut signed = None;
    for (k, v) in &inside.payload {
        match k {
            Value::Uint(0) => signed = Some(hash(v, "signature: the act signed")?),
            _ => return Err(LawError::Shape("signature: unknown field")),
        }
    }
    let signed = signed.ok_or(LawError::Shape("signature: the act signed"))?;
    let expected = [Object {
        chain: signed,
        predecessor: signed,
    }];
    if inside.objects.as_deref() != Some(&expected[..]) {
        return Err(LawError::Shape(
            "signature: objects must name the act signed",
        ));
    }
    Ok(signed)
}

/// The signature payload.
pub fn signature_payload(signed: &Hash) -> Vec<(Value, Value)> {
    vec![(Value::Uint(0), b(signed))]
}

/// The inside `objects` a terms act carries: none for a founding agreement;
/// for a clone, `[[parent, the parent-chain act it follows]]`.
fn check_terms_inside(inside: &Inside, t: &Terms) -> R<()> {
    match (&t.parent, &inside.objects) {
        (None, None) => Ok(()),
        (Some(p), Some(o)) if o.len() == 1 && &o[0].chain == p => Ok(()),
        (None, Some(_)) => Err(LawError::Shape("terms without a parent name no chain")),
        _ => Err(LawError::Shape(
            "a clone names its parent's chain in objects, once",
        )),
    }
}

// ---------------------------------------------------------------- agreements

/// An agreement as a verifier holds it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Agreement {
    pub id: Hash,
    pub terms: Terms,
    /// The parties with a valid signature act on these terms, in party order.
    pub signed: Vec<Hash>,
    /// Founding: the signing rule is met. Clone: the parent's clone rule is
    /// met by the parent's parties, and the parent exists.
    pub exists: bool,
    /// For a clone, the parent as held.
    pub parent: Option<Box<Agreement>>,
}

/// Read Law from what a verifier holds. `law` is the Law MIP's spec hash
/// (`LAW`), fixed at the freeze.
pub struct LawView<'a> {
    pub v: &'a Verifier,
    pub law: Hash,
}

/// Whether an act of the collective counts, as far as Law's member
/// signatures go.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Consent {
    /// The signer declares no founding agreement at the act's binding: it is
    /// not a collective, and Law asks nothing more.
    NotCollective,
    /// The collective's grammar does not list this act type.
    NotListed { agreement: Hash },
    /// The grammar lists it: these parties signed it visibly, and the rule
    /// is met or not.
    Listed {
        agreement: Hash,
        rule: Rule,
        signers: Vec<Hash>,
        met: bool,
    },
}

impl<'a> LawView<'a> {
    pub fn new(v: &'a Verifier, law: Hash) -> Self {
        LawView { v, law }
    }

    /// The terms of a held, opened terms act, checked.
    pub fn terms(&self, id: &Hash) -> R<Terms> {
        let h = self.v.get(id).ok_or(LawError::Missing(*id))?;
        if h.inside.spec != self.law || h.inside.type_ != types::TERMS {
            return Err(LawError::Check("not a terms act"));
        }
        let t = Terms::decode(&h.inside.payload)?;
        check_terms_inside(&h.inside, &t)?;
        t.check()?;
        Ok(t)
    }

    /// The distinct identities with a valid signature act naming `act`, in
    /// the order of `among`. Only a valid act confers consent (Law rule 5:
    /// void or disputed acts confer nothing).
    pub fn signers(&self, act: &Hash, among: &[Hash]) -> Vec<Hash> {
        among
            .iter()
            .filter(|who| {
                self.v.signed_by(who).any(|h| {
                    h.inside.spec == self.law
                        && h.inside.type_ == types::SIGNATURE
                        && decode_signature(&h.inside).ok() == Some(*act)
                        && self.v.status(&h.id) == Status::Valid
                })
            })
            .copied()
            .collect()
    }

    /// An agreement: its terms, who signed, and whether it exists. Parents
    /// are followed up to 64 deep.
    pub fn agreement(&self, id: &Hash) -> R<Agreement> {
        self.agreement_depth(id, 0)
    }

    fn agreement_depth(&self, id: &Hash, depth: u32) -> R<Agreement> {
        if depth > 64 {
            return Err(LawError::Check("a clone lineage deeper than 64"));
        }
        let terms = self.terms(id)?;
        let signed = self.signers(id, &terms.parties);
        let (exists, parent) = match &terms.parent {
            None => (terms.signing.met(&terms.parties, &signed), None),
            Some(p) => {
                let parent = self.agreement_depth(p, depth + 1)?;
                let by_parent = self.signers(id, &parent.terms.parties);
                let complete =
                    parent.exists && parent.terms.clone.met(&parent.terms.parties, &by_parent);
                (complete, Some(Box::new(parent)))
            }
        };
        Ok(Agreement {
            id: *id,
            terms,
            signed,
            exists,
            parent,
        })
    }

    /// The agreement declared in force for `identity` at the chain act
    /// `binding`: the latest Law declaration of kind 0 at that position
    /// (Identity rule 8b). `None` when the identity declares none, or the
    /// binding does not count.
    pub fn declared(&self, identity: &Hash, binding: &Hash) -> Option<Hash> {
        let res = self.v.resolve(identity);
        let k = res.position_of(binding)?;
        declared_in(&res.states[k].declarations, &self.law)
    }

    /// Law's answer for an act of a collective (rule 36, last sentence;
    /// F100): read the agreement in force at the act's binding; check it
    /// exists and descends from the one declared before it; if its grammar
    /// lists the act's type, count the visible signature acts of the parties
    /// who signed that agreement.
    ///
    /// The act's own standing (valid, void…) is Identity's, from
    /// [`Verifier::status`]; this asks only what Law adds.
    pub fn consent(&self, act: &Hash) -> R<Consent> {
        let h = self.v.get(act).ok_or(LawError::Missing(*act))?;
        let (Some(signer), Some(binding)) = (h.act.outside.signer, h.act.outside.binding) else {
            return Err(LawError::Check("the act has no signer or binding"));
        };
        let res = self.v.resolve(&signer);
        let Some(k) = res.position_of(&binding) else {
            return Err(LawError::Check("the act's binding does not count"));
        };
        let Some(id) = declared_in(&res.states[k].declarations, &self.law) else {
            return Ok(Consent::NotCollective);
        };
        // Each agreement declared along the chain up to k is a complete
        // clone of the one declared before it (rule 37: members change by
        // rotation plus a clone of the founding agreement).
        let mut before: Option<Hash> = None;
        for s in &res.states[..=k] {
            let Some(d) = declared_in(&s.declarations, &self.law) else {
                if before.is_some() {
                    return Err(LawError::Check(
                        "a collective removed its founding agreement",
                    ));
                }
                continue;
            };
            if before == Some(d) {
                continue;
            }
            let a = self.agreement(&d)?;
            if !a.exists {
                return Err(LawError::Check("the declared agreement is not complete"));
            }
            if a.terms.grammar.is_none() {
                return Err(LawError::Check("the declared agreement has no key grammar"));
            }
            if a.terms.parent != before {
                return Err(LawError::Check(
                    "the declared agreement is not a clone of the one declared before it",
                ));
            }
            before = Some(d);
        }
        let a = self.agreement(&id)?;
        let g = a.terms.grammar.as_ref().expect("checked above");
        let Some(rule) = g.listed(&h.inside.spec, h.inside.type_) else {
            return Ok(Consent::NotListed { agreement: id });
        };
        let signers = self.signers(act, &a.signed);
        let met = rule.met(&a.terms.parties, &signers);
        Ok(Consent::Listed {
            agreement: id,
            rule: rule.clone(),
            signers,
            met,
        })
    }
}

/// The value of the Law declaration of kind 0 among these declarations.
pub fn declared_in(ds: &[Declaration], law: &Hash) -> Option<Hash> {
    ds.iter()
        .find(|d| &d.spec == law && d.kind == kinds::FOUNDING_AGREEMENT)
        .and_then(|d| match &d.value {
            Some(Value::Bytes(x)) => x.as_slice().try_into().ok(),
            _ => None,
        })
}

/// The declaration a collective's genesis or rotation carries.
pub fn founding_declaration(law: &Hash, agreement: &Hash) -> Declaration {
    Declaration {
        spec: *law,
        kind: kinds::FOUNDING_AGREEMENT,
        value: Some(b(agreement)),
    }
}

// ---------------------------------------------------------------- decoding helpers

fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn hashes_value(v: &[Hash]) -> Value {
    Value::Array(v.iter().map(b).collect())
}

fn distinct(v: &[Hash]) -> bool {
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
    Ok(KeyGrammar {
        signing: holding(field(&f, 0).ok_or(LawError::Shape("key grammar signing key"))?)?,
        safety: holding(field(&f, 1).ok_or(LawError::Shape("key grammar safety key"))?)?,
        listed: field(&f, 2)
            .map(|l| {
                nonempty(l, "key grammar listed types")?
                    .iter()
                    .map(|x| {
                        let a = tuple(x, 3, "listed type")?;
                        Ok(Listed {
                            spec: hash(&a[0], "listed spec")?,
                            type_: uint(&a[1], "listed type")?,
                            rule: rule(&a[2])?,
                        })
                    })
                    .collect()
            })
            .transpose()?,
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
