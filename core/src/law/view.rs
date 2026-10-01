//! Law read from what a verifier holds (Law draft 7): agreements and their
//! clones, the collective's own lines, which agreement is in force for an
//! act of a collective, and whether that act has the consent its areas
//! require.
//!
//! In plain words:
//!
//! 1. A deal exists when every party has signed it, and a clone of it
//!    completes only when every party has signed the clone (F107).
//! 2. A collective's genesis declares its founding agreement, which exists
//!    once every founder has signed it (Q11). A rotation declares each
//!    constitutional clone with the signature acts that complete it (Flaw
//!    M). Every other clone is written by a record act, the collective's
//!    everyday line, naming the signature acts that complete it (A2).
//! 3. "Before" and "after" are judged on the collective's own sequences
//!    only (F109): an act of the collective is before a line when it
//!    precedes it in the line's own sequence or lies in the ancestry of a
//!    tip the line names; every other act counts as after it. A member's
//!    signature is placed by the collective's acts: the act it signs, a
//!    record or rotation naming it, an act acknowledging it.
//! 4. A departure (resignation, stepping down) takes effect at the line
//!    registering it (record field 3). Each rule is counted among the
//!    voices that remain, all of them meeting it where fewer remain than
//!    its number (flaw C); an area with no voice left is frozen.
//! 5. An act of the collective that an area reaches counts only with its
//!    holders' signature acts, meeting the area's number.

use super::formats::*;
use super::tiers::{changes, powers_needed, Tier};
use crate::act::Ref;
use crate::chain::{Resolution, Status, Verifier, Held};
use crate::hash::Hash;
use crate::identity::{Payload, Rotation};
use std::cell::RefCell;
use std::collections::{BTreeMap, BTreeSet};
use std::rc::Rc;

/// Read Law from what a verifier holds.
pub struct LawView<'a> {
    pub v: &'a Verifier,
    pub mips: Mips,
    /// The layers each extension declares in its specification (Production,
    /// field 10), as the caller read them from the specifications it holds.
    pub ext_layers: BTreeMap<Hash, Vec<u64>>,
    /// Each keeper operator's records, as act ids in the keeper's own order.
    /// The keeper record's exact format is still open (Law, type 2), so a
    /// verifier states what it holds, as it states `keeper_recorded` to
    /// Identity.
    pub keeper_logs: BTreeMap<Hash, Vec<Hash>>,
    cache: RefCell<BTreeMap<Hash, Rc<RecordEval>>>,
    busy: RefCell<BTreeSet<Hash>>,
}

/// An agreement as a verifier holds it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Agreement {
    pub id: Hash,
    pub terms: Terms,
    /// The parties with a valid signature act on these terms, in party order.
    pub signed: Vec<Hash>,
    /// For a clone: the powers its changes need (rule 44c, 45b).
    pub needs: Option<Vec<Power>>,
    /// Why the terms are invalid against their parent and lineage, if they
    /// are (a false mark, a reused area id, an uncovered member...).
    pub invalid: Option<String>,
    /// Founding terms and deals: whether the agreement exists (every party
    /// signed; for a clone, its parent exists too). A collective's clone is
    /// put in force only by a record or rotation: `None`.
    pub exists: Option<bool>,
    /// A collective's clone: every party its mark names, and every party it
    /// adds or makes a holder, has a valid signature act on it, so a record
    /// or rotation naming them could put it in force.
    pub ready: bool,
}

/// What a clone is at a record or rotation (rules 45, 45a, A2, Flaw M).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CloneState {
    Complete,
    /// Still a draft: signatures missing among those named.
    Draft(String),
    /// Invalid there: a false mark, a signature act that does not sign it...
    Invalid(String),
}

/// What a line registers (record field 3).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DepartureKind {
    /// A resignation: the whole voice, in this agreement and its descendants.
    Resigned { agreement: Hash },
    /// A stepping down from one area, by id.
    SteppedDown { agreement: Hash, area: u64 },
    /// The member's own rotation (C5).
    Rotated { rotation: Hash },
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Departure {
    /// The act registered.
    pub act: Hash,
    pub party: Hash,
    pub kind: DepartureKind,
}

/// A record act, judged.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RecordEval {
    pub id: Hash,
    /// Whether it counts as a line of the collective.
    pub line: bool,
    /// Why not, if it does not.
    pub not_a_line: Option<String>,
    /// The agreement in force for the record act itself.
    pub in_force_at: Option<Hash>,
    /// The clone it names, and what it is there.
    pub clone: Option<(Hash, CloneState)>,
    /// The clone it puts in force, if any.
    pub puts: Option<Hash>,
    /// What it registers.
    pub registers: Vec<Departure>,
}

/// Law's answer for an act of a collective.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Consent {
    /// The signer declares no agreement: it is not a collective, and Law
    /// asks nothing more.
    NotCollective,
    /// The collective's declarations do not hold (rule 37): its acts that
    /// need member signatures count for nothing.
    Broken { reason: String },
    /// A record: judged by the clone it names alone ([`LawView::record`]).
    Line { agreement: Hash },
    /// No area reaches it: it counts on the collective's own signature.
    NoArea { agreement: Hash },
    /// Its specification is adopted nowhere in a collective with areas: it
    /// counts for nothing (Q16).
    Unadopted { agreement: Hash },
    /// It is invalid as an act of the collective (a grant beyond its area,
    /// a reinstatement that does not repeat its grant...).
    Invalid { agreement: Hash, reason: String },
    /// The areas reaching it, each counted.
    Areas {
        agreement: Hash,
        areas: Vec<AreaCount>,
        met: bool,
    },
}

impl Consent {
    /// Whether the act counts, as far as Law goes.
    pub fn counts(&self) -> bool {
        matches!(
            self,
            Consent::NotCollective | Consent::NoArea { .. } | Consent::Areas { met: true, .. }
        )
    }
}

/// One area's count for an act.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AreaCount {
    pub area: u64,
    pub name: String,
    /// No holder's voice remains: the area is frozen, and its acts count
    /// for nothing (rule 37b).
    pub frozen: bool,
    /// The holders counted as voices for this act.
    pub voices: Vec<Hash>,
    /// How many of them must sign (flaw C applied).
    pub needed: usize,
    /// Those who did, by a signature act that counts.
    pub signers: Vec<Hash>,
    pub met: bool,
}

/// Whether an act under a grant binds the grantor collective (rule 44).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Backing {
    /// The act names no grant to its signer.
    NotUnderGrant,
    /// Backed by a live grant (or a reinstatement of it).
    Backed { grant: Hash },
    /// Not backed: the reason.
    NotBacked { grant: Hash, reason: String },
    /// The grant ended with its area's freeze, and the collective itself
    /// acknowledged the act: it binds (rule 40, A6).
    Binds { grant: Hash },
    /// The grant ended with its area's freeze; nothing the collective did
    /// places the act: undetermined until the refit decides (C8).
    Undetermined { grant: Hash },
}

/// The collective's state after everything held: for showing.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Current {
    pub agreement: Hash,
    /// Parties of the agreement in force whose whole voice is gone.
    pub departed: Vec<Hash>,
    /// (area id, holder) pairs whose holders stepped down.
    pub stepped_down: Vec<(u64, Hash)>,
    /// Areas with no holder whose voice remains.
    pub frozen: Vec<u64>,
    /// Records under the current key, judged.
    pub records: Vec<RecordEval>,
    /// Two records of different clones of one parent on concurrent lines.
    pub fork: bool,
}

/// A line: a record of the collective, or a rotation of it (by link).
#[derive(Clone, Copy)]
enum Line<'h> {
    Record(&'h Held),
    Rotation(usize),
}

/// The collective being judged.
struct Col {
    id: Hash,
    res: Rc<Resolution>,
}

impl Col {
    fn pos(&self, h: &Held) -> Option<usize> {
        self.res.position_of(h.act.outside.binding.as_ref()?)
    }
    fn rotation(&self, v: &Verifier, j: usize) -> Option<Rotation> {
        match &v.get(&self.res.links.get(j)?.act)?.identity {
            Some(Ok(Payload::Rotation(r))) => Some(r.clone()),
            _ => None,
        }
    }
}

/// What a fold over records leaves in force.
struct InForce {
    agreement: Hash,
    fork: bool,
}

impl<'a> LawView<'a> {
    pub fn new(v: &'a Verifier, mips: Mips) -> Self {
        LawView {
            v,
            mips,
            ext_layers: BTreeMap::new(),
            keeper_logs: BTreeMap::new(),
            cache: RefCell::new(BTreeMap::new()),
            busy: RefCell::new(BTreeSet::new()),
        }
    }

    fn law(&self) -> Hash {
        self.mips.law
    }

    fn is_law(&self, h: &Held, t: u64) -> bool {
        h.inside.spec == self.law() && h.inside.type_ == t
    }

    fn held(&self, id: &Hash) -> R<&'a Held> {
        self.v.get(id).ok_or(LawError::Missing(*id))
    }

    fn ext(&self) -> impl Fn(&Hash) -> R<Vec<u64>> + '_ {
        move |e: &Hash| self.ext_layers.get(e).cloned().ok_or(LawError::Missing(*e))
    }

    // ------------------------------------------------------------ terms

    /// The terms of a held, opened terms act, checked.
    pub fn terms(&self, id: &Hash) -> R<Terms> {
        let h = self.held(id)?;
        if !self.is_law(h, types::TERMS) {
            return Err(LawError::Check("not a terms act"));
        }
        let t = Terms::decode(&h.inside.payload)?;
        check_terms_inside(&h.inside, &t)?;
        t.check(&self.mips)?;
        Ok(t)
    }

    /// An agreement's lineage, itself first, back to its founding terms.
    pub fn lineage(&self, id: &Hash) -> R<Vec<(Hash, Terms)>> {
        let mut out = vec![];
        let mut cur = *id;
        loop {
            if out.len() > 64 {
                return Err(LawError::Check("a clone lineage deeper than 64"));
            }
            let t = self.terms(&cur)?;
            let next = t.parent;
            out.push((cur, t));
            match next {
                Some(p) => cur = p,
                None => return Ok(out),
            }
        }
    }

    /// The signature acts naming `act` with a valid standing under
    /// Identity, by signer, among `among`.
    fn valid_sigs(&self, act: &Hash, among: &[Hash]) -> Vec<(Hash, Hash)> {
        let mut out = vec![];
        for who in among {
            if let Some(h) = self.v.signed_by(who).find(|h| {
                self.is_law(h, types::SIGNATURE)
                    && decode_signature(&h.inside).ok() == Some(*act)
                    && self.v.status(&h.id) == Status::Valid
            }) {
                out.push((*who, h.id));
            }
        }
        out
    }

    /// The distinct identities with a valid signature act naming `act`, in
    /// the order of `among`.
    pub fn signers(&self, act: &Hash, among: &[Hash]) -> Vec<Hash> {
        self.valid_sigs(act, among).into_iter().map(|(p, _)| p).collect()
    }

    /// The checks a clone needs against its parent and lineage (rules 44c,
    /// 45a, 45b; "Areas"; Q26, Q32), without signatures. Returns the
    /// powers needed.
    fn clone_static(&self, parent: &Terms, clone: &Terms, lineage: &[(Hash, Terms)]) -> R<Result<Vec<Power>, String>> {
        if parent.is_collective() != clone.is_collective() {
            return Ok(Err("a clone keeps the parent's kind: a collective, or a deal".into()));
        }
        let Some(mark) = clone.field4.mark() else {
            return Ok(Err("a clone carries a mark".into()));
        };
        if mark.iter().any(|e| matches!(e.power, Power::Plan(_))) {
            return Err(LawError::Unsupported(
                "a mark naming a succession plan: its trigger needs the abandonment declaration (type 13), whose format is open",
            ));
        }
        let needs = powers_needed(parent, clone, &self.mips, &self.ext())?;
        let named: Vec<Power> = mark.iter().map(|e| e.power.clone()).collect();
        if named != needs {
            return Ok(Err(
                "the mark names other powers than those the clone's changes require (rule 45a)".into(),
            ));
        }
        if !parent.is_collective() {
            let m = &mark[0];
            let mut a = m.signers.clone();
            let mut b = parent.parties.clone();
            a.sort();
            b.sort();
            if a != b {
                return Ok(Err(
                    "a deal's clone names the clone rule and every party in its mark (rule 45b)".into(),
                ));
            }
            return Ok(Ok(needs));
        }
        for e in mark {
            let base = power_base(parent, &e.power);
            let Some((base, _)) = base else {
                return Ok(Err("the mark names an area the parent does not have".into()));
            };
            if !e.signers.iter().all(|s| base.contains(s)) {
                return Ok(Err(
                    "the mark names a signer that power is not counted among (rule 45a)".into(),
                ));
            }
        }
        // Q26: a number left above its holders only where the parent's
        // entry for that area has the same number.
        for a in clone.areas() {
            if a.threshold > a.holders.len() as u64
                && parent.area(a.id).map(|p| p.threshold) != Some(a.threshold)
            {
                return Ok(Err(
                    "an area's number exceeds its holders, and is not the parent's number for that area (Q26)".into(),
                ));
            }
        }
        // Q32: a new area takes an id no earlier version gave.
        for a in clone.areas() {
            if parent.area(a.id).is_none()
                && lineage.iter().any(|(_, t)| t.area(a.id).is_some())
            {
                return Ok(Err("a new area reuses a retired id (Q32)".into()));
            }
        }
        Ok(Ok(needs))
    }

    /// The parties a clone adds, and those it makes holders of an area they
    /// did not hold: each must sign it (rule 45, Q11, Q13).
    fn newcomers(parent: &Terms, clone: &Terms) -> Vec<Hash> {
        let mut out: Vec<Hash> = clone
            .parties
            .iter()
            .filter(|p| !parent.parties.contains(p))
            .copied()
            .collect();
        for a in clone.areas() {
            for h in &a.holders {
                let held = parent.area(a.id).is_some_and(|p| p.holders.contains(h));
                if !held && !out.contains(h) {
                    out.push(*h);
                }
            }
        }
        out
    }

    /// Rule 36b per party: the version of the abandonment clause each party
    /// counted by the constitutional change rule signed must cover them.
    fn coverage(&self, clone: &Terms, lineage: &[(Hash, Terms)], signed_clone: &dyn Fn(&Hash) -> bool) -> Option<String> {
        for p in clone.constitutional_rule().counted_among(&clone.parties) {
            let clause = if signed_clone(&p) {
                clone.abandonment.clone()
            } else {
                lineage
                    .iter()
                    .skip(1)
                    .find(|(id, _)| !self.signers(id, &[p]).is_empty())
                    .map(|(_, t)| t.abandonment.clone())
                    .unwrap_or_else(|| clone.abandonment.clone())
            };
            if !clause.is_some_and(|a| a.covers(&p)) {
                return Some(
                    "a member with constitutional power is not covered, under the clause they signed, by an abandonment clause able to remove their voice (F105)".into(),
                );
            }
        }
        None
    }

    /// An agreement: its terms, who signed, and what can be said of it
    /// without a collective's sequence.
    pub fn agreement(&self, id: &Hash) -> R<Agreement> {
        let lineage = self.lineage(id)?;
        let terms = lineage[0].1.clone();
        let signed = self.signers(id, &terms.parties);
        let Some(pid) = terms.parent else {
            let exists = terms.parties.iter().all(|p| signed.contains(p));
            return Ok(Agreement {
                id: *id,
                terms,
                signed,
                needs: None,
                invalid: None,
                exists: Some(exists),
                ready: exists,
            });
        };
        let parent = &lineage[1].1;
        let st = self.clone_static(parent, &terms, &lineage[1..])?;
        let (needs, mut invalid) = match st {
            Ok(n) => (Some(n), None),
            Err(e) => (None, Some(e)),
        };
        let parent_signers = self.signers(id, &parent.parties);
        let all_sigs: Vec<Hash> = self.signers(id, &union(&terms.parties, &parent.parties));
        if !terms.is_collective() {
            let parent_exists = self.agreement(&pid)?.exists == Some(true);
            let complete = invalid.is_none()
                && parent_exists
                && parent.parties.iter().all(|p| parent_signers.contains(p))
                && Self::newcomers(parent, &terms).iter().all(|p| all_sigs.contains(p));
            return Ok(Agreement {
                id: *id,
                terms,
                signed,
                needs,
                invalid,
                exists: Some(complete),
                ready: complete,
            });
        }
        if invalid.is_none() {
            invalid = self.coverage(&terms, &lineage, &|p| all_sigs.contains(p));
        }
        let mark = terms.field4.mark().unwrap_or(&[]);
        let ready = invalid.is_none()
            && mark.iter().all(|e| e.signers.iter().all(|s| all_sigs.contains(s)))
            && Self::newcomers(parent, &terms).iter().all(|p| all_sigs.contains(p));
        Ok(Agreement {
            id: *id,
            terms,
            signed,
            needs,
            invalid,
            exists: None,
            ready,
        })
    }

    /// The powers a clone needs (rule 44c).
    pub fn powers_needed(&self, clone: &Terms) -> R<Vec<Power>> {
        let p = clone.parent.ok_or(LawError::Check("not a clone"))?;
        powers_needed(&self.terms(&p)?, clone, &self.mips, &self.ext())
    }

    // ------------------------------------------------------------ the collective

    fn col(&self, id: &Hash) -> Col {
        Col {
            id: *id,
            res: self.v.resolve(id),
        }
    }

    /// The agreement declared in force for `identity` at the chain act
    /// `binding` (Identity rule 8b). `None` when the identity declares none,
    /// or the binding does not count.
    pub fn declared(&self, identity: &Hash, binding: &Hash) -> Option<Hash> {
        let res = self.v.resolve(identity);
        let k = res.position_of(binding)?;
        declared_in(&res.states[k].declarations, &self.law())?
            .ok()
            .map(|d| d.agreement)
    }

    /// Whether any chain act up to `k` declares an agreement.
    fn declares(&self, col: &Col, k: usize) -> bool {
        col.res.states[..=k]
            .iter()
            .any(|s| declared_in(&s.declarations, &self.law()).is_some())
    }

    /// The agreement in force at link `k` from the chain's declarations
    /// alone (before any record under that key), checked (rule 37, Flaw M).
    fn base(&self, col: &Col, k: usize) -> R<Result<Hash, String>> {
        let mut cur: Option<Hash> = None;
        for j in 0..=k {
            let d = match declared_in(&col.res.states[j].declarations, &self.law()) {
                None if cur.is_none() => continue,
                None => return Ok(Err("a collective removed its agreement".into())),
                Some(Err(_)) => return Ok(Err("a Law declaration in neither form".into())),
                Some(Ok(d)) => d,
            };
            let changed = j == 0
                || declared_in(&col.res.states[j - 1].declarations, &self.law())
                    .and_then(|x| x.ok())
                    .as_ref()
                    != Some(&d);
            if !changed {
                // A rotation that declares nothing new: the texts say the
                // agreement in force is the one declared, which drops any
                // clone recorded under the previous key (build question B1).
                if let (true, Some(c)) = (j > 0, cur) {
                    let at = self.in_force_at_rotation(col, j, c)?;
                    if at.agreement != c {
                        return Err(LawError::Unsettled(
                            "a rotation of the collective declares nothing new after a clone was recorded under the key it replaces (build question B1)",
                        ));
                    }
                }
                continue;
            }
            match (cur, &d.signatures) {
                (None, None) => {
                    let a = self.agreement(&d.agreement)?;
                    if a.terms.parent.is_some() {
                        return Ok(Err("the first declared agreement is not founding terms".into()));
                    }
                    if !a.terms.is_collective() {
                        return Ok(Err("the declared agreement has no key grammar".into()));
                    }
                    if a.exists != Some(true) {
                        return Ok(Err(
                            "the founding agreement does not exist: a founder has not signed (Q11)".into(),
                        ));
                    }
                    cur = Some(d.agreement);
                }
                (Some(_), None) | (None, Some(_)) => {
                    return Ok(Err(
                        "a genesis declares founding terms; a rotation declares a clone with its signature acts (Flaw M)".into(),
                    ))
                }
                (Some(c), Some(sigs)) => {
                    let at = self.in_force_at_rotation(col, j, c)?;
                    let k_terms = self.terms(&d.agreement)?;
                    if k_terms.parent != Some(at.agreement) {
                        return Ok(Err(
                            "the declared clone does not descend from the agreement in force at the rotation (rule 37)".into(),
                        ));
                    }
                    let parent = self.terms(&at.agreement)?;
                    if !changes(&parent, &k_terms)
                        .iter()
                        .any(|c| c.tier() == Tier::Constitutional)
                    {
                        return Ok(Err(
                            "a rotation declares a clone that changes the constitutional tier (rule 37; build question B5)".into(),
                        ));
                    }
                    match self.clone_at(col, &d.agreement, sigs, Line::Rotation(j), &[])? {
                        CloneState::Complete => cur = Some(d.agreement),
                        CloneState::Draft(w) | CloneState::Invalid(w) => {
                            return Ok(Err(format!(
                                "the rotation's declared clone is not complete with the signature acts it names: {w}"
                            )))
                        }
                    }
                }
            }
        }
        Ok(cur.ok_or_else(|| "no agreement declared".to_string()))
    }

    /// The agreement in force just before rotation `j`: the one declared at
    /// `j - 1` (`base`), and the clones recorded under that key before it.
    fn in_force_at_rotation(&self, col: &Col, j: usize, base: Hash) -> R<InForce> {
        let mut puts = vec![];
        for r in self.records_at(col, j - 1) {
            if self.before_struct(col, r, Line::Rotation(j)) {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push(k);
                }
            }
        }
        self.fold(base, &puts)
    }

    /// The collective's record acts bound at link `k`, valid under Identity.
    fn records_at(&self, col: &Col, k: usize) -> Vec<&'a Held> {
        let Some(link) = col.res.links.get(k) else {
            return vec![];
        };
        self.v
            .signed_by(&col.id)
            .filter(|h| {
                self.is_law(h, types::RECORD)
                    && h.act.outside.binding == Some(link.act)
                    && self.v.status(&h.id) == Status::Valid
            })
            .collect()
    }

    /// Follow the agreement chain through the clones these records put in
    /// force: one clone at a time; two different clones of one parent on
    /// records neither before the other are a fork, and the parent stays
    /// in force (A4; the fork rule's format is open, Q38).
    fn fold(&self, base: Hash, puts: &[Hash]) -> R<InForce> {
        let mut cur = base;
        let mut fork = false;
        for _ in 0..=puts.len() {
            let mut next: Vec<Hash> = vec![];
            for k in puts {
                if self.terms(k)?.parent == Some(cur) && !next.contains(k) {
                    next.push(*k);
                }
            }
            match next.len() {
                0 => break,
                1 => cur = next[0],
                _ => {
                    fork = true;
                    break;
                }
            }
        }
        Ok(InForce { agreement: cur, fork })
    }

    // ------------------------------------------------------------ before and after

    /// Whether the collective's act `x` precedes the line `l` on the
    /// collective's own sequences ("Made before, made after", 1): in the
    /// line's own sequence, or in the ancestry of a tip it names. Lines are
    /// ordered among themselves this way alone.
    fn before_struct(&self, col: &Col, x: &Held, l: Line) -> bool {
        let Some(bx) = col.pos(x) else { return false };
        match l {
            Line::Rotation(j) => {
                if bx + 1 < j {
                    return true;
                }
                if bx + 1 != j {
                    return false;
                }
                let Some(r) = col.rotation(self.v, j) else {
                    return false;
                };
                r.kept.iter().any(|t| {
                    t.act == x.id
                        || self
                            .v
                            .tip_line(&col.id, t)
                            .is_some_and(|ids| ids.contains(&x.id))
                })
            }
            Line::Record(lh) => {
                if x.id == lh.id {
                    return false;
                }
                let Some(bl) = col.pos(lh) else { return false };
                if bx != bl {
                    return bx < bl;
                }
                // The line's own sequence.
                let mut cur = lh;
                for _ in 0..1_000_000 {
                    match cur.inside.prev.as_deref() {
                        Some([p]) => {
                            if p == &x.id {
                                return true;
                            }
                            match self.v.get(p) {
                                Some(h) if h.act.outside.signer == Some(col.id) => cur = h,
                                _ => break,
                            }
                        }
                        _ => break,
                    }
                }
                let Ok(rec) = Record::decode(&lh.inside) else {
                    return false;
                };
                rec.kept.iter().any(|t| {
                    t.act == x.id
                        || self
                            .v
                            .tip_line(&col.id, t)
                            .is_some_and(|ids| ids.contains(&x.id))
                })
            }
        }
    }

    /// The agreement in force for a line, for its keepers (Q34).
    fn line_agreement(&self, col: &Col, l: Line) -> R<Option<Hash>> {
        match l {
            Line::Record(r) => Ok(self.record_eval(col, r)?.in_force_at),
            Line::Rotation(j) => match self.base(col, j - 1)? {
                Ok(b) => Ok(Some(self.in_force_at_rotation(col, j, b)?.agreement)),
                Err(_) => Ok(None),
            },
        }
    }

    /// Whether the collective's own act `x` counts as made before line `l`:
    /// on its sequences, or placed there by the keepers of the agreement in
    /// force for the line, who recorded it before recording the line (C4).
    /// Lines are never placed by keepers.
    fn before(&self, col: &Col, x: &Held, l: Line) -> R<bool> {
        if self.before_struct(col, x, l) {
            return Ok(true);
        }
        if self.is_law(x, types::RECORD) {
            return Ok(false);
        }
        let (Line::Record(lh), Some(ag)) = (l, self.line_agreement(col, l)?) else {
            return Ok(false);
        };
        let Some(k) = self.terms(&ag)?.keepers else {
            return Ok(false);
        };
        let placed: Vec<Hash> = k
            .operators
            .iter()
            .filter(|op| {
                self.keeper_logs.get(*op).is_some_and(|log| {
                    let px = log.iter().position(|a| a == &x.id);
                    let pl = log.iter().position(|a| a == &lh.id);
                    matches!((px, pl), (Some(a), Some(b)) if a < b)
                })
            })
            .copied()
            .collect();
        Ok(!placed.is_empty() && k.rule.met(&k.operators, &placed))
    }

    /// Whether the line `p` (a placement) is before the line `l`.
    fn line_before(&self, col: &Col, p: Line, l: Line) -> bool {
        match (p, l) {
            (Line::Record(ph), l) => self.before_struct(col, ph, l),
            (Line::Rotation(i), Line::Rotation(j)) => i < j,
            (Line::Rotation(i), Line::Record(lh)) => col.pos(lh).is_some_and(|b| b >= i),
        }
    }

    /// The places the collective's acts give a member's signature act `s`
    /// ("Made before, made after", 2; C1, C2, A2, Flaw M).
    fn placements(&self, col: &Col, s: &Held) -> Vec<(Line<'a>, bool)> {
        // (where, whether it is a line: lines are not placed by keepers)
        let mut out = vec![];
        if let Ok(signed) = decode_signature(&s.inside) {
            if let Some(a) = self.v.get(&signed) {
                if a.act.outside.signer == Some(col.id) && self.v.status(&a.id) == Status::Valid {
                    out.push((Line::Record(a), self.is_law(a, types::RECORD)));
                }
            }
        }
        for h in self.v.signed_by(&col.id) {
            if self.v.status(&h.id) != Status::Valid {
                continue;
            }
            if self.is_law(h, types::RECORD) {
                if let Ok(r) = Record::decode(&h.inside) {
                    if r.signatures.iter().flatten().any(|x| x == &s.id) {
                        out.push((Line::Record(h), true));
                    }
                }
            }
        }
        for a in self.v.acknowledgements(&s.id) {
            if a.act.outside.signer == Some(col.id) && self.v.status(&a.id) == Status::Valid {
                out.push((Line::Record(a), self.is_law(a, types::RECORD)));
            }
        }
        for j in 1..col.res.links.len() {
            if let Some(Ok(d)) = declared_in(&col.res.states[j].declarations, &self.law()) {
                if d.signatures.iter().flatten().any(|x| x == &s.id) {
                    out.push((Line::Rotation(j), true));
                }
            }
        }
        out
    }

    /// Whether a member's signature act counts as made before line `l`.
    fn sig_before(&self, col: &Col, s: &Held, l: Line) -> R<bool> {
        for (p, is_line) in self.placements(col, s) {
            let yes = match p {
                Line::Record(h) if !is_line => self.before(col, h, l)?,
                _ => self.line_before(col, p, l),
            };
            if yes {
                return Ok(true);
            }
        }
        Ok(false)
    }

    // ------------------------------------------------------------ records and departures

    /// A record act of the collective, judged.
    pub fn record(&self, collective: &Hash, record: &Hash) -> R<RecordEval> {
        let col = self.col(collective);
        let h = self.held(record)?;
        Ok((*self.record_eval(&col, h)?).clone())
    }

    fn record_eval(&self, col: &Col, h: &'a Held) -> R<Rc<RecordEval>> {
        if let Some(e) = self.cache.borrow().get(&h.id) {
            return Ok(e.clone());
        }
        if !self.busy.borrow_mut().insert(h.id) {
            return Err(LawError::Check("records order themselves in a loop"));
        }
        let e = self.record_eval_inner(col, h);
        self.busy.borrow_mut().remove(&h.id);
        let e = Rc::new(e?);
        self.cache.borrow_mut().insert(h.id, e.clone());
        Ok(e)
    }

    fn record_eval_inner(&self, col: &Col, h: &'a Held) -> R<RecordEval> {
        let mut e = RecordEval {
            id: h.id,
            line: false,
            not_a_line: None,
            in_force_at: None,
            clone: None,
            puts: None,
            registers: vec![],
        };
        let no = |mut e: RecordEval, w: &str| {
            e.not_a_line = Some(w.into());
            Ok(e)
        };
        if !self.is_law(h, types::RECORD)
            || h.act.outside.signer != Some(col.id)
            || self.v.status(&h.id) != Status::Valid
        {
            return no(e, "not a valid record act of the collective");
        }
        let rec = match Record::decode(&h.inside) {
            Ok(r) => r,
            Err(x) => return no(e, &x.to_string()),
        };
        let Some(b) = col.pos(h) else {
            return no(e, "its binding does not count");
        };
        let base = match self.base(col, b)? {
            Ok(x) => x,
            Err(w) => return no(e, &w),
        };
        let mut puts = vec![];
        for r in self.records_at(col, b) {
            if self.before_struct(col, r, Line::Record(h)) {
                if let Some(k) = self.record_eval(col, r)?.puts {
                    puts.push(k);
                }
            }
        }
        let at = self.fold(base, &puts)?.agreement;
        e.in_force_at = Some(at);
        if rec.clone.is_none() && Record::named(&h.inside) != Some(at) {
            return no(e, "a record naming no clone names the agreement in force for it");
        }
        let at_terms = self.terms(&at)?;
        let at_lineage: Vec<Hash> = self.lineage(&at)?.into_iter().map(|(i, _)| i).collect();
        for x in rec.registers.iter().flatten() {
            let a = self.held(x)?;
            let Some(p) = a.act.outside.signer else {
                return no(e, "it registers an act with no signer");
            };
            if !at_terms.parties.contains(&p) {
                return no(e, "it registers an act of someone who is not a party of the agreement in force");
            }
            if self.is_law(a, types::DECLARATION) {
                return Err(LawError::Unsupported(
                    "registering an abandonment declaration (type 13): its format is open",
                ));
            }
            if self.is_law(a, types::RESIGNATION) {
                if self.v.status(&a.id) != Status::Valid {
                    return no(e, "it registers a resignation that is not valid");
                }
                let r = match Resignation::decode(&a.inside) {
                    Ok(r) => r,
                    Err(_) => return no(e, "it registers a resignation not in the format"),
                };
                if !at_lineage.contains(&r.agreement) {
                    return no(e, "it registers a resignation from an agreement not in force for it");
                }
                let kind = match r.area {
                    None => DepartureKind::Resigned {
                        agreement: r.agreement,
                    },
                    Some(area) => {
                        if !self
                            .terms(&r.agreement)?
                            .area(area)
                            .is_some_and(|ar| ar.holders.contains(&p))
                        {
                            return no(e, "it registers a stepping down from an area its signer does not hold");
                        }
                        DepartureKind::SteppedDown {
                            agreement: r.agreement,
                            area,
                        }
                    }
                };
                e.registers.push(Departure { act: *x, party: p, kind });
                continue;
            }
            if a.inside.spec == self.mips.identity && a.inside.type_ == 1 {
                let res = self.v.resolve(&p);
                if res.position_of(x).is_none() {
                    return no(e, "it registers a rotation that does not count");
                }
                e.registers.push(Departure {
                    act: *x,
                    party: p,
                    kind: DepartureKind::Rotated { rotation: *x },
                });
                continue;
            }
            return no(e, "it registers an act that is no departure or rotation");
        }
        e.line = true;
        if let (Some(k), Some(sigs)) = (&rec.clone, &rec.signatures) {
            let kt = self.terms(k)?;
            let state = if kt.parent != Some(at) {
                CloneState::Invalid(
                    "its parent is not the agreement in force for the record (rule 37c)".into(),
                )
            } else if changes(&at_terms, &kt)
                .iter()
                .any(|c| c.tier() == Tier::Constitutional)
            {
                CloneState::Invalid(
                    "it changes the constitutional tier: only a rotation declares it (rule 37)".into(),
                )
            } else {
                self.clone_at(col, k, sigs, Line::Record(h), &e.registers)?
            };
            if state == CloneState::Complete {
                e.puts = Some(*k);
            }
            e.clone = Some((*k, state));
        }
        Ok(e)
    }

    /// The lines that may register a departure in effect at a point, and
    /// what each registers: records under earlier keys, and records under
    /// the point's key that can precede it. A record point adds its own
    /// registrations (`own`): the record is not before itself, and judges
    /// its clone with them in effect.
    fn departure_lines(&self, col: &Col, point: Point<'a>, own: &[Departure]) -> R<Vec<(&'a Held, Departure)>> {
        let mut out = vec![];
        let (limit, me): (usize, Option<&'a Held>) = match point {
            Point::Act(x) => (col.pos(x).unwrap_or(0), None),
            Point::Line(Line::Record(r)) => (col.pos(r).unwrap_or(0), Some(r)),
            Point::Line(Line::Rotation(j)) => (j - 1, None),
        };
        for k in 0..=limit.min(col.res.links.len().saturating_sub(1)) {
            for r in self.records_at(col, k) {
                if let Some(m) = me {
                    if r.id == m.id {
                        for d in own {
                            out.push((r, d.clone()));
                        }
                        continue;
                    }
                }
                if k == limit && !self.applies(col, r, point)? {
                    continue;
                }
                let e = self.record_eval(col, r)?;
                if e.line {
                    for d in &e.registers {
                        out.push((r, d.clone()));
                    }
                }
            }
        }
        Ok(out)
    }

    /// The records naming `p`'s rotation `rot` in field 3: valid record acts
    /// of the collective, read without judging the rest of the record, so
    /// that C5 can look at lines after the point it judges.
    fn rotation_lines(&self, col: &Col, rot: &Hash) -> Vec<&'a Held> {
        self.v
            .signed_by(&col.id)
            .filter(|h| {
                self.is_law(h, types::RECORD)
                    && self.v.status(&h.id) == Status::Valid
                    && Record::decode(&h.inside)
                        .is_ok_and(|r| r.registers.iter().flatten().any(|x| x == rot))
            })
            .collect()
    }

    /// Whether a line registering a departure applies at a point: it is
    /// before the point (for a line, or itself when the point is that
    /// record), or, for an act, the act is not before it.
    fn applies(&self, col: &Col, l: &'a Held, point: Point<'a>) -> R<bool> {
        Ok(match point {
            Point::Line(Line::Record(p)) => p.id == l.id || self.before_struct(col, l, Line::Record(p)),
            Point::Line(Line::Rotation(j)) => self.before_struct(col, l, Line::Rotation(j)),
            Point::Act(x) => !self.before(col, x, Line::Record(l))?,
        })
    }

    /// The voices a power is counted among at a point (rule 44d): the
    /// parties of `base` whose voice remains in agreement `ag`, and those
    /// who left but count through a signature act on `target` placed before
    /// every line registering their departure. `area`: for an area's power.
    /// Returns (voices, remaining without any placed signature).
    #[allow(clippy::too_many_arguments)]
    fn voices(
        &self,
        col: &Col,
        point: Point<'a>,
        ag: &Hash,
        base: &[Hash],
        area: Option<u64>,
        target_sigs: &BTreeMap<Hash, Vec<Hash>>,
        own: &[Departure],
    ) -> R<(Vec<Hash>, Vec<Hash>)> {
        let lineage: Vec<Hash> = self.lineage(ag)?.into_iter().map(|(i, _)| i).collect();
        let lines = self.departure_lines(col, point, own)?;
        let mut voices = vec![];
        let mut remaining = vec![];
        for p in base {
            let mut regs: Vec<&'a Held> = vec![];
            for (l, d) in &lines {
                if &d.party != p {
                    continue;
                }
                let (from, hits) = match &d.kind {
                    DepartureKind::Resigned { agreement } => (*agreement, true),
                    DepartureKind::SteppedDown { agreement, area: a } => (*agreement, area == Some(*a)),
                    DepartureKind::Rotated { .. } => (*ag, false),
                };
                if !hits || !lineage.contains(&from) {
                    continue;
                }
                // Named again by a later version they signed, after the line.
                if self.restored(col, p, &lineage, &from, area, l)? {
                    continue;
                }
                regs.push(l);
            }
            if regs.is_empty() {
                voices.push(*p);
                remaining.push(*p);
                continue;
            }
            for s in target_sigs.get(p).into_iter().flatten() {
                let s = self.held(s)?;
                let mut all = true;
                for l in &regs {
                    all &= self.sig_before(col, s, Line::Record(l))?;
                }
                if all {
                    voices.push(*p);
                    break;
                }
            }
        }
        Ok((voices, remaining))
    }

    /// Whether `p`, departed from agreement `from` at line `l`, is named
    /// again by a version between `from` (excluded) and the agreement
    /// counted (lineage[0]) that `p` signed by a signature not placed before
    /// that line (third pass reading).
    fn restored(&self, col: &Col, p: &Hash, lineage: &[Hash], from: &Hash, area: Option<u64>, l: &'a Held) -> R<bool> {
        let Some(i) = lineage.iter().position(|x| x == from) else {
            return Ok(false);
        };
        for v in &lineage[..i] {
            let t = self.terms(v)?;
            let named = match area {
                None => t.parties.contains(p),
                Some(a) => t.area(a).is_some_and(|ar| ar.holders.contains(p)),
            };
            // Named again: by a constitutional clone (rule 37b's refit), never
            // by an ordinary clone that only copies the list (build question B10).
            let constitutional = match &t.parent {
                Some(pp) => changes(&self.terms(pp)?, &t)
                    .iter()
                    .any(|c| c.tier() == Tier::Constitutional),
                None => false,
            };
            if !named || !constitutional {
                continue;
            }
            for (_, s) in self.valid_sigs(v, &[*p]) {
                if !self.sig_before(col, self.held(&s)?, Line::Record(l))? {
                    return Ok(true);
                }
            }
        }
        Ok(false)
    }

    /// Whether a member's signature act counts for the collective: valid
    /// under Identity, or kept by C5 (placed before the collective's line
    /// registering the rotation that replaced its key).
    fn sig_counts(&self, col: &Col, s: &Held) -> R<bool> {
        match self.v.status(&s.id) {
            Status::Valid => return Ok(true),
            Status::Void | Status::Disputed => {}
            _ => return Ok(false),
        }
        let Some(p) = s.act.outside.signer else {
            return Ok(false);
        };
        let res = self.v.resolve(&p);
        let Some(kb) = s.act.outside.binding.and_then(|b| res.position_of(&b)) else {
            return Ok(false);
        };
        let Some(next) = res.links.get(kb + 1) else {
            return Ok(false);
        };
        for l in self.rotation_lines(col, &next.act) {
            if self.sig_before(col, s, Line::Record(l))? {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// A clone at a record or rotation, judged with the signature acts it
    /// names, and only those (A2, Flaw M), each power counted at that line
    /// (rule 44d).
    fn clone_at(
        &self,
        col: &Col,
        k: &Hash,
        sigs: &[Hash],
        at: Line<'a>,
        own: &[Departure],
    ) -> R<CloneState> {
        let lineage = self.lineage(k)?;
        let clone = &lineage[0].1;
        let Some(pid) = clone.parent else {
            return Ok(CloneState::Invalid("not a clone".into()));
        };
        let parent = &lineage[1].1;
        let needs = match self.clone_static(parent, clone, &lineage[1..])? {
            Ok(n) => n,
            Err(w) => return Ok(CloneState::Invalid(w)),
        };
        let _ = needs;
        let mut by: BTreeMap<Hash, Hash> = BTreeMap::new();
        for s in sigs {
            let h = self.held(s)?;
            if !self.is_law(h, types::SIGNATURE) || decode_signature(&h.inside).ok() != Some(*k) {
                return Ok(CloneState::Invalid(
                    "it names an act that is not a signature act on the clone".into(),
                ));
            }
            if !self.sig_counts(col, h)? {
                return Ok(CloneState::Invalid("it names a signature act that is not valid".into()));
            }
            if let Some(p) = h.act.outside.signer {
                by.entry(p).or_insert(*s);
            }
        }
        // Every signature act on the clone that counts, named or not: a
        // departed party is a voice through one placed before its line
        // (rule 44d, Q23, C2), though only those named count toward the
        // clone here (A2, Flaw M).
        let mut any: BTreeMap<Hash, Vec<Hash>> = BTreeMap::new();
        for p in union(&parent.parties, &clone.parties) {
            for h in self.v.signed_by(&p) {
                if self.is_law(h, types::SIGNATURE)
                    && decode_signature(&h.inside).ok() == Some(*k)
                    && self.sig_counts(col, h)?
                {
                    any.entry(p).or_default().push(h.id);
                }
            }
        }
        let mark = clone.field4.mark().unwrap_or(&[]);
        let mut missing = false;
        for e in mark {
            let (base, rule) = power_base(parent, &e.power).expect("checked by clone_static");
            let area = match e.power {
                Power::Area(a) => Some(a),
                _ => None,
            };
            let (voices, _) = self.voices(col, Point::Line(at), &pid, &base, area, &any, own)?;
            if !e.signers.iter().all(|s| voices.contains(s)) {
                return Ok(CloneState::Invalid(
                    "the mark names a signer whose voice no longer counts there (rule 44d)".into(),
                ));
            }
            let Some(need) = rule.needed(voices.len()) else {
                return Ok(CloneState::Invalid("no voice remains to meet a power it names".into()));
            };
            if e.signers.len() < need {
                return Ok(CloneState::Invalid(
                    "the mark names too few signers to meet the power (rule 45a)".into(),
                ));
            }
            missing |= !e.signers.iter().all(|s| by.contains_key(s));
        }
        if missing {
            return Ok(CloneState::Draft(
                "a party its mark names has no signature act among those named".into(),
            ));
        }
        if !Self::newcomers(parent, clone).iter().all(|p| by.contains_key(p)) {
            return Ok(CloneState::Draft(
                "a party it adds, or makes a holder, has not signed it (Q11)".into(),
            ));
        }
        if let Some(w) = self.coverage(clone, &lineage, &|p| by.contains_key(p)) {
            return Ok(CloneState::Invalid(w));
        }
        Ok(CloneState::Complete)
    }

    // ------------------------------------------------------------ acts of the collective

    /// The agreement in force for an act of the collective, and whether
    /// records of sibling clones leave it at their parent (rule 37c).
    fn in_force_act(&self, col: &Col, x: &'a Held, b: usize, base: Hash) -> R<InForce> {
        let mut puts = vec![];
        for r in self.records_at(col, b) {
            if r.id == x.id {
                continue;
            }
            if !self.before(col, x, Line::Record(r))? {
                if let Some(k) = self.record_eval(col, r)?.puts {
                    puts.push(k);
                }
            }
        }
        self.fold(base, &puts)
    }

    /// The agreement in force for an act of a collective.
    pub fn in_force(&self, act: &Hash) -> R<Option<Hash>> {
        let x = self.held(act)?;
        let Some(c) = x.act.outside.signer else {
            return Err(LawError::Check("the act has no signer"));
        };
        let col = self.col(&c);
        let Some(b) = col.pos(x) else {
            return Err(LawError::Check("the act's binding does not count"));
        };
        if !self.declares(&col, b) {
            return Ok(None);
        }
        match self.base(&col, b)? {
            Ok(base) => Ok(Some(self.in_force_act(&col, x, b, base)?.agreement)),
            Err(_) => Ok(None),
        }
    }

    /// Whether the collective's act `x` counts as made before the line
    /// `line` (a record or rotation of the same collective).
    pub fn counts_before(&self, x: &Hash, line: &Hash) -> R<bool> {
        let xh = self.held(x)?;
        let c = xh.act.outside.signer.ok_or(LawError::Check("the act has no signer"))?;
        let col = self.col(&c);
        let lh = self.held(line)?;
        let l = match col.res.position_of(line) {
            Some(j) => Line::Rotation(j),
            None => Line::Record(lh),
        };
        self.before(&col, xh, l)
    }

    /// Law's answer for an act of a collective (rules 36a, 37b, 38a, 44d;
    /// F100, F106, F109). The act's own standing is Identity's, from
    /// [`Verifier::status`]; this asks only what Law adds.
    pub fn consent(&self, act: &Hash) -> R<Consent> {
        let x = self.held(act)?;
        let (Some(c), Some(_)) = (x.act.outside.signer, x.act.outside.binding) else {
            return Err(LawError::Check("the act has no signer or binding"));
        };
        let col = self.col(&c);
        let Some(b) = col.pos(x) else {
            return Err(LawError::Check("the act's binding does not count"));
        };
        if !self.declares(&col, b) {
            return Ok(Consent::NotCollective);
        }
        let base = match self.base(&col, b)? {
            Ok(x) => x,
            Err(reason) => return Ok(Consent::Broken { reason }),
        };
        let ag = self.in_force_act(&col, x, b, base)?.agreement;
        if self.is_law(x, types::RECORD) {
            return Ok(Consent::Line { agreement: ag });
        }
        if self.is_law(x, types::REVOCATION) || self.is_law(x, types::IMPORT) {
            return Err(LawError::Unsupported(
                "revocations and imports (types 10, 11): their formats are open",
            ));
        }
        let t = self.terms(&ag)?;
        let mut reaching: Vec<&Area> = vec![];
        if self.is_law(x, types::GRANT) {
            let g = match Grant::decode(&x.inside.payload) {
                Ok(g) => g,
                Err(e) => {
                    return Ok(Consent::Invalid {
                        agreement: ag,
                        reason: e.to_string(),
                    })
                }
            };
            if let Some(id) = g.area {
                let Some(a) = t.area(id) else {
                    return Ok(Consent::Invalid {
                        agreement: ag,
                        reason: "the grant names an area the agreement in force does not have".into(),
                    });
                };
                if let Some(w) = self.grant_reach_problem(&g, a, &t)? {
                    return Ok(Consent::Invalid { agreement: ag, reason: w });
                }
                reaching.push(a);
            } else if !t.areas().is_empty() {
                // A grant naming no area reaches only acts no area reaches.
                for k in g.kinds.iter().flatten() {
                    if t.areas()
                        .iter()
                        .any(|a| a.kinds.iter().flatten().any(|ak| t.kinds_overlap(&self.mips, ak, k)))
                    {
                        return Ok(Consent::Invalid {
                            agreement: ag,
                            reason: "a grant naming no area reaches acts an area reaches (rule 38a)".into(),
                        });
                    }
                }
            }
        }
        if reaching.is_empty() {
            let (spec, ty) = (&x.inside.spec, x.inside.type_);
            reaching = t
                .areas()
                .iter()
                .filter(|a| {
                    a.kinds
                        .iter()
                        .flatten()
                        .any(|k| t.kind_reaches(&self.mips, k, spec, ty))
                })
                .collect();
            if reaching.is_empty()
                && !t.areas().is_empty()
                && !self.mips.is_mip(spec)
                && t.spec_layers(&self.mips, spec).is_empty()
            {
                return Ok(Consent::Unadopted { agreement: ag });
            }
        }
        if reaching.is_empty() {
            return Ok(Consent::NoArea { agreement: ag });
        }
        let lineage: Vec<Hash> = self.lineage(&ag)?.into_iter().map(|(i, _)| i).collect();
        let mut out = vec![];
        for a in reaching {
            // Holders' signature acts naming the act, that count.
            let mut by: BTreeMap<Hash, Vec<Hash>> = BTreeMap::new();
            for p in &a.holders {
                for h in self.v.signed_by(p) {
                    if self.is_law(h, types::SIGNATURE)
                        && decode_signature(&h.inside).ok() == Some(*act)
                        && self.sig_counts(&col, h)?
                    {
                        by.entry(*p).or_default().push(h.id);
                    }
                }
            }
            let (voices, remaining) =
                self.voices(&col, Point::Act(x), &ag, &a.holders, Some(a.id), &by, &[])?;
            let frozen = remaining.is_empty();
            let needed = a.rule().needed(voices.len());
            let mut signers = vec![];
            for p in &voices {
                if by.contains_key(p) && lineage.iter().any(|v| !self.signers(v, &[*p]).is_empty()) {
                    signers.push(*p);
                }
            }
            let met = !frozen && needed.is_some_and(|n| signers.len() >= n);
            out.push(AreaCount {
                area: a.id,
                name: a.name.clone(),
                frozen,
                voices,
                needed: needed.unwrap_or(0),
                signers,
                met,
            });
        }
        let met = out.iter().all(|a| a.met);
        Ok(Consent::Areas {
            agreement: ag,
            areas: out,
            met,
        })
    }

    /// Rule 38a and Flaw N: a grant within an area reaches only that area's
    /// acts; a reinstatement repeats the grant it names, within the same
    /// area.
    fn grant_reach_problem(&self, g: &Grant, a: &Area, t: &Terms) -> R<Option<String>> {
        if let Some(old) = &g.reinstates {
            let h = self.held(old)?;
            let ok = self.is_law(h, types::GRANT)
                && Grant::decode(&h.inside.payload)
                    .is_ok_and(|o| o.area == Some(a.id) && o.reinstates.is_none() && o.same_grant(g));
            return Ok((!ok).then(|| {
                "a reinstatement repeats fields 0 to 6 of a grant within the same area (Flaw N)".to_string()
            }));
        }
        for k in g.kinds.iter().flatten() {
            let within = match k {
                Kind::Layer(l) => a.is_lane(*l),
                Kind::Type { spec, type_ } => a
                    .kinds
                    .iter()
                    .flatten()
                    .any(|ak| t.kind_reaches(&self.mips, ak, spec, *type_)),
            };
            if !within {
                return Ok(Some(
                    "a grant reaches beyond the power of the area that issues it (rule 38a)".into(),
                ));
            }
        }
        Ok(None)
    }

    /// Lines at which an area froze: records after which no holder of that
    /// area keeps a voice, and rotations declaring it with none (rule 37b).
    fn freezes(&self, col: &Col, area: u64) -> R<Vec<Line<'a>>> {
        let mut out = vec![];
        for k in 0..col.res.links.len() {
            for r in self.records_at(col, k) {
                let e = self.record_eval(col, r)?;
                if !e.line {
                    continue;
                }
                let ag = e.puts.or(e.in_force_at).expect("a line has an agreement");
                let t = self.terms(&ag)?;
                if let Some(a) = t.area(area) {
                    let (_, remaining) = self.voices(
                        col,
                        Point::Line(Line::Record(r)),
                        &ag,
                        &a.holders,
                        Some(area),
                        &BTreeMap::new(),
                        &e.registers,
                    )?;
                    if remaining.is_empty() {
                        out.push(Line::Record(r));
                    }
                }
            }
            if k > 0 {
                if let Some(Ok(d)) = declared_in(&col.res.states[k].declarations, &self.law()) {
                    if d.signatures.is_some()
                        && self.base(col, k)?.is_ok()
                        && self.terms(&d.agreement)?.area(area).is_some_and(|a| a.holders.is_empty())
                    {
                        out.push(Line::Rotation(k));
                    }
                }
            }
        }
        Ok(out)
    }

    /// Whether an act under a grant binds the collective that issued the
    /// grant (rules 38a, 40, 44; A6, C8, Flaw N). Revocations' format is
    /// open: a collective holding any is refused.
    pub fn backing(&self, act: &Hash) -> R<Backing> {
        let y = self.held(act)?;
        let Some(signer) = y.act.outside.signer else {
            return Ok(Backing::NotUnderGrant);
        };
        let mut grant = None;
        for r in y.inside.refs.iter().flatten() {
            if let Ref::Act(g) = r {
                if let Some(h) = self.v.get(g) {
                    if self.is_law(h, types::GRANT)
                        && Grant::decode(&h.inside.payload).is_ok_and(|x| x.grantee == signer)
                    {
                        grant = Some(h);
                        break;
                    }
                }
            }
        }
        let Some(gh) = grant else {
            return Ok(Backing::NotUnderGrant);
        };
        let g = Grant::decode(&gh.inside.payload)?;
        let c = gh.act.outside.signer.ok_or(LawError::Check("a grant with no signer"))?;
        let col = self.col(&c);
        if self
            .v
            .signed_by(&c)
            .any(|h| self.is_law(h, types::REVOCATION))
        {
            return Err(LawError::Unsupported("revocation (type 10): its format is open"));
        }
        let not = |w: &str| {
            Ok(Backing::NotBacked {
                grant: gh.id,
                reason: w.into(),
            })
        };
        if self.v.status(&gh.id) != Status::Valid || !self.consent(&gh.id)?.counts() {
            return not("the grant does not count");
        }
        if g.reinstates.is_some() {
            return not("a reinstatement is named instead of the grant it reinstates");
        }
        // Reach: the act's kind lies within the grant's (rule 44).
        let Some(ag) = self.in_force(&gh.id)? else {
            return not("the grantor is not a collective");
        };
        let t = self.terms(&ag)?;
        let (spec, ty) = (&y.inside.spec, y.inside.type_);
        let within = match &g.kinds {
            Some(k) => k.iter().any(|k| t.kind_reaches(&self.mips, k, spec, ty)),
            None => !t.areas().iter().any(|a| {
                a.kinds
                    .iter()
                    .flatten()
                    .any(|k| t.kind_reaches(&self.mips, k, spec, ty))
            }),
        };
        if !within {
            return not("the act lies beyond the grant's reach (rule 44)");
        }
        let Some(area) = g.area else {
            return Ok(Backing::Backed { grant: gh.id });
        };
        let mut ended = false;
        for l in self.freezes(&col, area)? {
            ended |= match l {
                Line::Record(_) => self.before(&col, gh, l)?,
                Line::Rotation(_) => self.before_struct(&col, gh, l),
            };
        }
        if !ended {
            return Ok(Backing::Backed { grant: gh.id });
        }
        // Ended: a reinstatement that counts backs it again (Flaw N).
        for h in self.v.signed_by(&c) {
            if self.is_law(h, types::GRANT)
                && Grant::decode(&h.inside.payload).is_ok_and(|r| r.reinstates == Some(gh.id))
                && self.v.status(&h.id) == Status::Valid
                && self.consent(&h.id)?.counts()
            {
                return Ok(Backing::Backed { grant: h.id });
            }
        }
        if self.v.acknowledgements(act).any(|a| {
            a.act.outside.signer == Some(c) && self.v.status(&a.id) == Status::Valid
        }) {
            return Ok(Backing::Binds { grant: gh.id });
        }
        Ok(Backing::Undetermined { grant: gh.id })
    }

    /// The collective's state after everything held under its latest key.
    pub fn current(&self, collective: &Hash) -> R<Option<Current>> {
        let col = self.col(collective);
        if col.res.links.is_empty() {
            return Ok(None);
        }
        let b = col.res.links.len() - 1;
        if !self.declares(&col, b) {
            return Ok(None);
        }
        let base = match self.base(&col, b)? {
            Ok(x) => x,
            Err(_) => return Ok(None),
        };
        let mut puts = vec![];
        let mut records = vec![];
        for r in self.records_at(&col, b) {
            let e = self.record_eval(&col, r)?;
            if let Some(k) = e.puts {
                puts.push(k);
            }
            records.push((*e).clone());
        }
        let f = self.fold(base, &puts)?;
        let t = self.terms(&f.agreement)?;
        let lineage: Vec<Hash> = self.lineage(&f.agreement)?.into_iter().map(|(i, _)| i).collect();
        let mut departed = vec![];
        let mut stepped_down = vec![];
        let mut all = vec![];
        for k in 0..col.res.links.len() {
            for r in self.records_at(&col, k) {
                let e = self.record_eval(&col, r)?;
                if e.line {
                    all.extend(e.registers.iter().cloned());
                }
            }
        }
        for d in all {
            match d.kind {
                DepartureKind::Resigned { agreement } if lineage.contains(&agreement) => {
                    if t.parties.contains(&d.party) && !departed.contains(&d.party) {
                        departed.push(d.party);
                    }
                }
                DepartureKind::SteppedDown { agreement, area }
                    if lineage.contains(&agreement)
                        && t.area(area).is_some_and(|a| a.holders.contains(&d.party)) =>
                {
                    stepped_down.push((area, d.party));
                }
                _ => {}
            }
        }
        let frozen = t
            .areas()
            .iter()
            .filter(|a| {
                a.holders.iter().all(|h| {
                    departed.contains(h) || stepped_down.contains(&(a.id, *h))
                })
            })
            .map(|a| a.id)
            .collect();
        Ok(Some(Current {
            agreement: f.agreement,
            departed,
            stepped_down,
            frozen,
            records,
            fork: f.fork,
        }))
    }
}

/// A point at which voices are counted: an act of the collective, or a
/// line judging the clone it names.
#[derive(Clone, Copy)]
enum Point<'h> {
    Act(&'h Held),
    Line(Line<'h>),
}

/// The parties a power is counted among in the parent, and its rule.
fn power_base(parent: &Terms, p: &Power) -> Option<(Vec<Hash>, Rule)> {
    match p {
        Power::Constitutional => {
            let r = parent.constitutional_rule();
            Some((r.counted_among(&parent.parties), r))
        }
        Power::Clone => Some((parent.clone.counted_among(&parent.parties), parent.clone.clone())),
        Power::Area(id) => parent.area(*id).map(|a| (a.holders.clone(), a.rule())),
        Power::Plan(_) => None,
    }
}

fn union(a: &[Hash], b: &[Hash]) -> Vec<Hash> {
    let mut out = a.to_vec();
    for x in b {
        if !out.contains(x) {
            out.push(*x);
        }
    }
    out
}
