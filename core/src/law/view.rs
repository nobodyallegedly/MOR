//! Law read from what a verifier holds (Law draft 9): agreements and their
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
//! 4. A departure (resignation, stepping down, a declaration of absence)
//!    takes effect at the line registering it (record field 3); in a deal,
//!    a declaration draws its own line, the deal's keepers ordering it. Each rule is counted among the
//!    voices that remain, all of them meeting it where fewer remain than
//!    its number (flaw C); an area with no voice left is frozen.
//! 5. An act of the collective that an area reaches counts only with its
//!    holders' signature acts, meeting the area's number.

use super::formats::*;
use super::tiers::{changes, powers_needed, Change, Tier};
use crate::chain::{Resolution, Status, Verifier, Held};
use crate::hash::Hash;
use crate::identity::{KeptTip, Payload, Rotation};
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
    /// The rail Modules this verifier read, in their specifications, as
    /// push rails (F128, W4): rails on which the payer pays an address with
    /// no request from the payee's side committing to each payment. Every
    /// other rail is a request rail, as every rail Module under the payment
    /// cMIP draft 2 is: the payee's side commits to the payment, and to the
    /// claim a purchase names, before it is made. Like `ext_layers`, a fact
    /// the caller states from the specifications it holds.
    pub push_rails: BTreeSet<Hash>,
    /// Receipts and claims whose rail proof the caller checked under the
    /// payment cMIP and found not to carry the commitment recomputed from
    /// them (F131, IT3): on a payment whose receipts name different claims,
    /// those naming a claim the payment did not commit to. The rail's
    /// answer, like `push_rails`, a fact the caller states: the core reads
    /// no rail.
    pub rail_invalid: BTreeSet<Hash>,
    /// Receipts and claims whose rail proof the caller checked under the
    /// payment cMIP and found valid (Finance rules 2 and 4: `verify`, or
    /// `verify_under` with the payment cMIP the agreement names), with where
    /// the proof says the payment was paid (`mor_payment::paid_at`). The
    /// rail's answer, a fact the caller states: the core reads no rail. A
    /// receipt or claim not listed has no rail answer, and pays nothing
    /// toward a debt ([`Self::paid_toward`]).
    pub rail_valid: BTreeMap<Hash, crate::finance::PaidAt>,
    /// Anchoring (rules 50 and 51; F136, F148): for each act the anchoring
    /// cMIP the agreement names places on the agreement's time reference,
    /// the point it places it at, as the caller states it, the anchoring
    /// and time-reference formats being open; counted in the unit the
    /// abandonment clause's period (key 2) is written in (reading). Whoever
    /// anchored the act, it is placed (anyone may anchor anyone's act,
    /// F148). An act not listed is not anchored, or the anchors cannot
    /// place it. Consulted only where an abandonment clause names a period
    /// ([`Self::declaration`]).
    pub anchors: BTreeMap<Hash, u64>,
    cache: RefCell<BTreeMap<Hash, Rc<RecordEval>>>,
    busy: RefCell<BTreeSet<Hash>>,
    closed: RefCell<BTreeMap<Hash, Option<Closed>>>,
    ending: RefCell<BTreeSet<Hash>>,
    citing: RefCell<BTreeSet<Hash>>,
    adopting: RefCell<BTreeSet<Hash>>,
    histories: RefCell<BTreeMap<(Hash, usize, Vec<Hash>), Rc<History>>>,
    ending_sigs: RefCell<BTreeMap<Hash, Rc<EndingSigs>>>,
}

/// What a decision cites on the collective's chain (F127): every act it
/// reaches back from its own sequence and the tips it names, following the
/// previous acts and the citations of each act on the chain, the tips of
/// each record reached included; and the acts named on the way that this
/// verifier does not hold.
struct History {
    acts: BTreeSet<Hash>,
    missing: BTreeSet<Hash>,
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
    /// An abandonment declaration removing the whole voice (outcome 0,
    /// rule 53), in this agreement and its descendants.
    Declared { agreement: Hash },
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
    /// Whether that clone, a clone of one branch of a fork, resolves the
    /// fork, the record coming after both lines (rule 47, B11).
    pub resolves: bool,
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
    /// Not done (F126, F128): not sealed to every member of the agreement
    /// in force for it, nor public. It is planning, and binds no one, its
    /// signer included. (Where it is held is never a condition, F128.)
    NotDone { agreement: Hash, reason: String },
    /// Not on the collective's actions chain (F127): it does not cite the
    /// decision it acts under, or names there an act that is not on the
    /// collective's chain. It counts for nothing.
    Uncited { reason: String },
    /// No area reaches it: it counts on the collective's own signature.
    NoArea { agreement: Hash },
    /// The collective was ended by a fork or a closing, and the act counts
    /// as made after it: it counts for nothing in Law (rule 47a, F121, N9).
    Closed { by: Hash },
    /// Its specification is adopted nowhere in a collective with areas: it
    /// counts for nothing (Q16).
    Unadopted { agreement: Hash },
    /// A receipt or claim naming a rail Module that no payee pointer of the
    /// collective that counts, and not its vault in force, names: it counts
    /// for nothing (Finance rule 12a, F115).
    RailNotAccepted { agreement: Hash, rail: Hash },
    /// It is invalid as an act of the collective (a grant beyond its area,
    /// a reinstatement that does not repeat its grant...).
    Invalid { agreement: Hash, reason: String },
    /// Signed with a grant key (F128) and backed by its grant: it counts
    /// as the collective's own act, within the grant's reach.
    Granted { agreement: Hash, grant: Hash },
    /// Signed with a grant key (F128), and not backed by its grant: the
    /// grant does not count, was revoked or ended before it, or the act
    /// lies beyond its reach. It counts for nothing.
    Ungranted { grant: Hash, reason: String },
    /// Signed with a grant key whose grant carries limits (fields 3 and 4,
    /// rule 18d) under a cMIP this verifier does not implement: whether
    /// the act lies within them cannot be read. The answer is unknown,
    /// never "it counts" (audit, October 2026, gap 10).
    Unknown { grant: Hash, reason: String },
    /// A negotiation message (F128, W6): talk, binding nothing, on neither
    /// of the collective's chains; the deal it leads to is an action.
    Talk,
    /// One of Identity's own everyday acts of the collective (a witness
    /// act, routes, an encryption key): on neither of its chains, it counts
    /// for nothing in Law, adopts nothing (F142) and places nothing (F156,
    /// rule 35b). Identity governs it, and it keeps its Identity role: a
    /// witness act still keeps the acts it names visible as received.
    Identity,
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
            Consent::NotCollective
                | Consent::NoArea { .. }
                | Consent::Granted { .. }
                | Consent::Areas { met: true, .. }
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

/// Whether an act signed with a grant key binds the collective whose key it
/// is (rule 44, F128).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Backing {
    /// The act is not signed with a grant key.
    NotUnderGrant,
    /// Backed by a grant that counts and has not ended for it.
    Backed { grant: Hash },
    /// Not backed: the reason.
    NotBacked { grant: Hash, reason: String },
    /// The grant ended (a revocation, a departure emptying its area, a fork
    /// or closing) and the act binds all the same: the ending's history
    /// holds it, or the collective itself acknowledged it (rule 40, A6).
    Binds { grant: Hash },
    /// The grant carries limits (fields 3 and 4: a cap, a holding period,
    /// the rails it may use, as its cMIP defines them; rule 18d), and this
    /// verifier implements no limits cMIP: it cannot tell whether the act
    /// lies within them. Unknown, never "Backed" (audit, October 2026,
    /// gap 10); the collective's own adoption still binds (rule 40).
    Unknown { grant: Hash, reason: String },
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
    /// The fork or closing that ended it, if any (rule 47a).
    pub closed: Option<Hash>,
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

/// Every node reachable from `from` in `edges`, `from` itself left out.
fn closure(edges: &BTreeMap<Hash, BTreeSet<Hash>>, from: &Hash) -> BTreeSet<Hash> {
    let mut out = BTreeSet::new();
    let mut todo = vec![*from];
    while let Some(x) = todo.pop() {
        for y in edges.get(&x).into_iter().flatten() {
            if y != from && out.insert(*y) {
                todo.push(*y);
            }
        }
    }
    out
}

/// What a fold over records leaves in force.
struct InForce {
    agreement: Hash,
    fork: bool,
    /// In a fork: the sibling clones whose records are concurrent.
    branches: Vec<Hash>,
}

impl<'a> LawView<'a> {
    pub fn new(v: &'a Verifier, mips: Mips) -> Self {
        LawView {
            v,
            mips,
            ext_layers: BTreeMap::new(),
            keeper_logs: BTreeMap::new(),
            push_rails: BTreeSet::new(),
            rail_invalid: BTreeSet::new(),
            rail_valid: BTreeMap::new(),
            anchors: BTreeMap::new(),
            cache: RefCell::new(BTreeMap::new()),
            busy: RefCell::new(BTreeSet::new()),
            closed: RefCell::new(BTreeMap::new()),
            ending: RefCell::new(BTreeSet::new()),
            citing: RefCell::new(BTreeSet::new()),
            adopting: RefCell::new(BTreeSet::new()),
            histories: RefCell::new(BTreeMap::new()),
            ending_sigs: RefCell::new(BTreeMap::new()),
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

    // ------------------------------------------------------------ grant keys (F128)

    /// The grant whose key signed `h`, where `h` is signed with a grant key
    /// (F128): its binding names a grant (type 9) whose field 9 made its
    /// signature, and its signer is the grantor: the grant's signer, or,
    /// for a grant by founding terms (field 8), the collective they found.
    fn key_grant(&self, h: &Held) -> Option<(&'a Held, Grant)> {
        let b = h.act.outside.binding.as_ref()?;
        let g = self.v.get(b)?;
        if !self.is_law(g, types::GRANT) || g.id == h.id || h.verdict != crate::sig::Verdict::Valid {
            return None;
        }
        let x = Grant::decode(&g.inside.payload).ok()?;
        if !x.key.made(&h.act.signature) {
            return None;
        }
        let c = h.act.outside.signer?;
        let grantor_ok = if x.by_this {
            self.founding_grant(&c, g)
        } else {
            g.act.outside.signer == Some(c) && self.col(&c).pos(g).is_some()
        };
        grantor_ok.then_some((g, x))
    }

    /// Whether `g` is a grant of `collective` by its founding terms (F124
    /// S1, F125 D6): field 8, named by the founding terms its genesis
    /// declares, as the split service's grant (field 14) or in its chain
    /// of judgment (field 21).
    fn founding_grant(&self, collective: &Hash, g: &Held) -> bool {
        if !self.is_law(g, types::GRANT) || !Grant::decode(&g.inside.payload).is_ok_and(|x| x.by_this) {
            return false;
        }
        let Some(f) = self.founding_of(collective) else { return false };
        let Ok(t) = self.terms(&f) else { return false };
        t.split_grant == Some(g.id)
            || t.chain.iter().flatten().any(|l| l.successors().contains(&g.id))
    }

    /// Whether an act stands under Identity, for Law: valid; or signed with
    /// a grant key (Identity's `Scoped`, F128) whose grant itself stands.
    /// Whether the grant backs the act is [`Self::backing`].
    fn valid(&self, id: &Hash) -> bool {
        match self.v.status(id) {
            Status::Valid => true,
            Status::Scoped => self
                .v
                .get(id)
                .and_then(|h| self.key_grant(h))
                .is_some_and(|(g, _)| self.v.status(&g.id) == Status::Valid),
            _ => false,
        }
    }

    /// Whether `h` is signed with the collective's own key: bound to a link
    /// of its identity chain (a device of the collective, F127).
    fn own_key(col: &Col, h: &Held) -> bool {
        h.act.outside.signer == Some(col.id) && col.pos(h).is_some()
    }

    /// Whether `h` is on one of the collective's strands: signed with its
    /// own key or with a grant key of its (F128: a grantee's strand is like
    /// a device of the collective, limited to its grant's scope).
    fn strand(&self, col: &Col, h: &Held) -> bool {
        Self::own_key(col, h) || (h.act.outside.signer == Some(col.id) && self.key_grant(h).is_some())
    }

    /// The link of the collective's identity chain an act of its is judged
    /// at: its binding's, for its own key; for a grant key (F128), the
    /// latest link among its grant and the decisions it cites.
    fn link(&self, col: &Col, h: &Held) -> Option<usize> {
        if let Some(k) = col.pos(h) {
            return Some(k);
        }
        if h.act.outside.signer != Some(col.id) {
            return None;
        }
        let (g, _) = self.key_grant(h)?;
        let mut k = self.decision_link(col, g)?;
        for y in Self::cites(h, &col.id) {
            if let Some(d) = self.v.get(&y) {
                if self.is_decision(col, d) {
                    if let Some(l) = self.decision_link(col, d) {
                        k = k.max(l);
                    }
                }
            }
        }
        Some(k)
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
                    && self.valid(&h.id)
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
            if !parent.is_collective() {
                return Ok(Err("a deal's clone names the clone rule (rule 45b)".into()));
            }
            return Ok(Self::plan_static(parent, clone, mark));
        }
        let needs = powers_needed(parent, clone, &self.mips, &self.ext())?;
        let named: Vec<Power> = mark.iter().map(|e| e.power.clone()).collect();
        if named != needs {
            return Ok(Err(
                "the mark names other powers than those the clone's changes require (rule 45a)".into(),
            ));
        }
        if !parent.is_collective() {
            // Every party whose voice remains: checked with the
            // declarations held ([`Self::deal_voices`]).
            if !mark[0].signers.iter().all(|s| parent.parties.contains(s)) {
                return Ok(Err(
                    "a deal's clone names the clone rule and every party whose voice remains in its mark (rule 45b)".into(),
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

    /// Rule 36b: every party the constitutional change rule counts is
    /// covered by the clone's abandonment clause. The judicial tier is one
    /// version for everyone (F121), so the clause in force judges each.
    fn coverage(&self, clone: &Terms) -> Option<String> {
        for p in clone.constitutional_rule().counted_among(&clone.parties) {
            if !clone.abandonment.as_ref().is_some_and(|a| a.covers(&p)) {
                return Some(
                    "a member with constitutional power is not covered by an abandonment clause able to remove their voice (F105)".into(),
                );
            }
        }
        None
    }

    /// Those who must sign a clone besides its mark (rules 13, 46; F121,
    /// F124): every holder, named by identity, whose share of a stake the
    /// clone drops or lowers, member or not (rule 46); a departed holder
    /// whose own stake plan it changes or drops (M1's stake part, reading);
    /// and, where it changes the release rule, every holder of every stake
    /// the parent defines (N8). A holder written null is this collective,
    /// whose consent is the mark itself.
    fn must_sign(parent: &Terms, clone: &Terms) -> Vec<Hash> {
        let mut out: Vec<Hash> = vec![];
        let mut add = |h: Hash| {
            if !out.contains(&h) {
                out.push(h)
            }
        };
        for st in parent.stakes.iter().flatten() {
            let after = clone.stake_on(&st.object).map(|(_, s)| s);
            for (h, n) in st.identified() {
                if after.is_none_or(|s| s.share_of(&Who::Id(h)) < n) {
                    add(h);
                }
            }
        }
        for plan in parent.succession.iter().flatten() {
            if parent.parties.contains(&plan.party) {
                continue;
            }
            if clone.succession.iter().flatten().find(|q| q.party == plan.party) != Some(plan) {
                add(plan.party);
            }
        }
        if clone.release_rule != parent.release_rule {
            for st in parent.stakes.iter().flatten() {
                for (h, _) in st.identified() {
                    add(h);
                }
            }
        }
        out
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
            let voices = self.deal_voices(id, &lineage)?;
            if invalid.is_none() {
                let mut a = terms.field4.mark().map(|m| m[0].signers.clone()).unwrap_or_default();
                let mut b = voices.clone();
                a.sort();
                b.sort();
                if a != b {
                    invalid = Some(
                        "a deal's clone names the clone rule and every party whose voice remains in its mark (rule 45b)".into(),
                    );
                }
            }
            let complete = invalid.is_none()
                && parent_exists
                && voices.iter().all(|p| parent_signers.contains(p))
                && Self::newcomers(parent, &terms).iter().all(|p| all_sigs.contains(p))
                && Self::must_sign(parent, &terms).iter().all(|h| !self.signers(id, &[*h]).is_empty());
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
            invalid = self.coverage(&terms);
        }
        // S1: in its own terms, the collective is written null, never by its
        // identity: one meaning, one encoding (reading, as B8).
        if invalid.is_none() {
            if let Some(c) = self.collective_of(id)? {
                let me = Who::Id(c);
                if terms.stakes.iter().flatten().any(|s| s.object == me || s.holders.iter().any(|(h, _)| *h == me)) {
                    invalid = Some("in its own terms the collective is written null, never by its identity (S1)".into());
                }
            }
        }
        let mark = terms.field4.mark().unwrap_or(&[]);
        let losing = Self::must_sign(parent, &terms);
        let ready = invalid.is_none()
            && mark.iter().all(|e| e.signers.iter().all(|s| all_sigs.contains(s)))
            && Self::newcomers(parent, &terms).iter().all(|p| all_sigs.contains(p))
            && losing.iter().all(|h| !self.signers(id, &[*h]).is_empty());
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

    /// The parties of a deal's parent whose voice remains for its clone
    /// `id` (rule 45b, Q28): in a deal a declaration draws its own line, so
    /// a valid declaration with outcome 0 removes a party's voice from then
    /// on, and that party's signature act on the clone still counts only
    /// where the deal's keepers recorded it before recording the
    /// declaration (rules 8, 11, 11a; B9).
    fn deal_voices(&self, id: &Hash, lineage: &[(Hash, Terms)]) -> R<Vec<Hash>> {
        let up = &lineage[1..];
        let parent = &up[0].1;
        let mut out = vec![];
        for p in &parent.parties {
            let mut gone = false;
            // B19: the authority is one identity, which signs alone; terms
            // naming a threshold of the parties are invalid in a deal.
            for (x, _, _, _) in self.declarations_against(p, up, &parent.parties)? {
                let placed = self
                    .valid_sigs(id, &[*p])
                    .iter()
                    .any(|(_, s)| self.keepers_before(parent, s, &x));
                if !placed {
                    gone = true;
                    break;
                }
            }
            if !gone {
                out.push(*p);
            }
        }
        Ok(out)
    }

    /// Whether the keepers `t` names recorded `x` before recording `y`,
    /// as the keepers' own rule counts it (rule 8, B9).
    fn keepers_before(&self, t: &Terms, x: &Hash, y: &Hash) -> bool {
        let Some(k) = &t.keepers else { return false };
        let placed: Vec<Hash> = k
            .operators
            .iter()
            .filter(|op| {
                self.keeper_logs.get(*op).is_some_and(|log| {
                    let a = log.iter().position(|z| z == x);
                    let b = log.iter().position(|z| z == y);
                    matches!((a, b), (Some(a), Some(b)) if a < b)
                })
            })
            .copied()
            .collect();
        !placed.is_empty() && k.rule.met(&k.operators, &placed)
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
                // A rotation that declares nothing new changes keys, not
                // rules: the agreement in force carries forward, records
                // included (Flaw B1), since the records made since the last
                // declaration keep counting ([`Self::records_since`]).
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
                            "a rotation declares only a clone that changes the constitutional tier (rule 37, B5)".into(),
                        ));
                    }
                    if let Some(w) = self.recovery_signatures(&at.agreement, &d.agreement, d.absence.as_deref())? {
                        return Ok(Err(w));
                    }
                    let own = self.recovery_departures(col, j, &at.agreement, &d.agreement)?;
                    match self.clone_at(col, &d.agreement, sigs, Line::Rotation(j), &own)? {
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

    /// The agreement in force just before rotation `j`: the one declared
    /// last before it (`base`), and the clones recorded since, before it.
    fn in_force_at_rotation(&self, col: &Col, j: usize, base: Hash) -> R<InForce> {
        let mut puts = vec![];
        for r in self.records_since(col, j - 1) {
            if self.before_struct(col, r, Line::Rotation(j)) {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push((k, e.resolves));
                }
            }
        }
        self.fold(base, &puts)
    }

    /// The link at which the agreement the chain declares at link `k` was
    /// declared: the genesis, or the latest rotation up to `k` whose Law
    /// declaration differs from the one before it.
    fn declared_at(&self, col: &Col, k: usize) -> usize {
        let law = self.law();
        let mut d = 0;
        for j in 1..=k.min(col.res.states.len().saturating_sub(1)) {
            let a = declared_in(&col.res.states[j - 1].declarations, &law).and_then(|x| x.ok());
            let b = declared_in(&col.res.states[j].declarations, &law).and_then(|x| x.ok());
            if a != b {
                d = j;
            }
        }
        d
    }

    /// The records that can bear on the agreement in force at link `k`:
    /// those bound at every link since the agreement the chain declares
    /// there was declared. A rotation that declares nothing new carries
    /// them forward (Flaw B1); one that declares a clone supersedes them.
    fn records_since(&self, col: &Col, k: usize) -> Vec<&'a Held> {
        (self.declared_at(col, k)..=k)
            .flat_map(|j| self.records_at(col, j))
            .collect()
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
                    && self.valid(&h.id)
            })
            .collect()
    }

    /// Follow the agreement chain through the clones these records put in
    /// force: one clone at a time; two different clones of one parent on
    /// records neither before the other are a fork, and the parent stays
    /// in force (A4; the fork rule's format is open, Q38), until a clone of
    /// the latest clone of one branch, recorded after both lines, resolves
    /// it (rule 47, B11). Each put carries whether its record resolved a
    /// fork; a fork's `branches` are its branches' latest clones.
    fn fold(&self, base: Hash, puts: &[(Hash, bool)]) -> R<InForce> {
        let mut cur = base;
        for _ in 0..=puts.len() {
            let next = self.children(&cur, puts, true)?;
            match next.len() {
                0 => break,
                1 => cur = next[0],
                _ => {
                    let mut tips = vec![];
                    for n in &next {
                        if let Some(t) = self.branch_tip(n, puts)? {
                            tips.push(t);
                        }
                    }
                    let mut res: Vec<Hash> = vec![];
                    for (k, r) in puts {
                        if *r
                            && self.terms(k)?.parent.is_some_and(|p| tips.contains(&p))
                            && !res.contains(k)
                        {
                            res.push(*k);
                        }
                    }
                    if res.len() == 1 {
                        cur = res[0];
                        continue;
                    }
                    return Ok(InForce {
                        agreement: cur,
                        fork: true,
                        branches: tips,
                    });
                }
            }
        }
        Ok(InForce {
            agreement: cur,
            fork: false,
            branches: vec![],
        })
    }

    /// The distinct clones put in force whose parent is `of`; with
    /// `resolvers` false, leaving out those whose record resolved a fork.
    fn children(&self, of: &Hash, puts: &[(Hash, bool)], resolvers: bool) -> R<Vec<Hash>> {
        let mut out: Vec<Hash> = vec![];
        for (k, r) in puts {
            if (resolvers || !*r) && self.terms(k)?.parent.as_ref() == Some(of) && !out.contains(k) {
                out.push(*k);
            }
        }
        Ok(out)
    }

    /// The latest clone of a fork's branch starting at `n`, followed one
    /// clone at a time; `None` where the branch forks again.
    fn branch_tip(&self, n: &Hash, puts: &[(Hash, bool)]) -> R<Option<Hash>> {
        let mut cur = *n;
        for _ in 0..=puts.len() {
            let kids = self.children(&cur, puts, false)?;
            match kids.len() {
                0 => return Ok(Some(cur)),
                1 => cur = kids[0],
                _ => return Ok(None),
            }
        }
        Ok(Some(cur))
    }

    // ------------------------------------------------------------ before and after

    /// Whether the collective's act `x` precedes the line `l` on the
    /// collective's own sequences ("Made before, made after", 1): in the
    /// history the line cites (F127): its own sequence, the tips it names,
    /// and whatever the acts there cite on the collective's chain. A
    /// grantee's act on the chain is before a line when that history
    /// reaches it. Lines are ordered among themselves this way alone.
    fn before_struct(&self, col: &Col, x: &Held, l: Line) -> bool {
        // A grant key's act (F128) has no place by its key: like any act
        // off the collective's own key, it is before a line when the line's
        // history holds it.
        let own = Self::own_key(col, x);
        match l {
            Line::Rotation(j) => {
                let Some(r) = col.rotation(self.v, j) else {
                    return false;
                };
                if !own {
                    // A grantee's act: reached from the rotation's kept tips.
                    let start: Vec<Hash> = r.kept.iter().map(|t| t.act).collect();
                    return self.history(col, j, &start, &r.kept).acts.contains(&x.id);
                }
                let Some(bx) = col.pos(x) else { return false };
                if bx + 1 < j {
                    return true;
                }
                if bx + 1 != j {
                    return false;
                }
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
                let Some(bl) = self.link(col, lh) else { return false };
                if own {
                    let Some(bx) = col.pos(x) else { return false };
                    if bx != bl {
                        return bx < bl;
                    }
                }
                self.history(col, bl, &[lh.id], &[]).acts.contains(&x.id)
            }
        }
    }

    // ------------------------------------------------------------ the two chains (F127)

    /// The acts `x` names on the collective's chain: its `objects` entries
    /// whose chain is the collective's identity. For an action: its previous
    /// actions (the heads it joins) and the decision it acts under (F127).
    fn cites(x: &Held, c: &Hash) -> Vec<Hash> {
        x.inside
            .objects
            .iter()
            .flatten()
            .filter(|o| &o.chain == c)
            .map(|o| o.predecessor)
            .collect()
    }

    /// Whether `h` is a decision of the collective an action can act under
    /// (F127, F128): its genesis or a rotation counting in its identity
    /// chain, one of its records, grants or revocations signed with its own
    /// key, or a grant its founding terms carry. Its forks and closings are
    /// decisions too, signed by members; an act acting under one counts for
    /// nothing.
    /// One of Identity's own everyday acts of the collective (a witness
    /// act, routes, an encryption key): an Identity act that is no link of
    /// the collective's identity chain. On neither chain (rule 35b).
    fn identity_everyday(col: &Col, h: &Held, mips: &Mips) -> bool {
        h.inside.spec == mips.identity && col.res.position_of(&h.id).is_none()
    }

    fn is_decision(&self, col: &Col, h: &Held) -> bool {
        col.res.position_of(&h.id).is_some()
            || ((self.is_law(h, types::RECORD) || self.is_law(h, types::GRANT) || self.is_law(h, types::REVOCATION))
                && Self::own_key(col, h))
            || self.founding_grant(&col.id, h)
    }

    /// The link of the collective's identity chain a decision sits at: the
    /// chain act itself, a decision's binding, or the genesis for a grant
    /// the founding terms carry.
    fn decision_link(&self, col: &Col, h: &Held) -> Option<usize> {
        col.res
            .position_of(&h.id)
            .or_else(|| col.pos(h))
            .or_else(|| self.founding_grant(&col.id, h).then_some(0))
    }

    /// The history cited from `start` (acts) and `tips` (kept tips) on the
    /// collective's chain, under link `link`: each act's previous act in
    /// the collective's own sequence, what it cites on the chain, and, for a
    /// record, the tips it names; acts under an earlier key are before
    /// anyway, and are not followed further (F127, "Made before, made
    /// after", 1).
    fn history(&self, col: &Col, link: usize, start: &[Hash], tips: &[KeptTip]) -> Rc<History> {
        let key = (col.id, link, start.iter().chain(tips.iter().map(|t| &t.summary)).copied().collect::<Vec<_>>());
        if let Some(h) = self.histories.borrow().get(&key) {
            return h.clone();
        }
        let mut acts = BTreeSet::new();
        let mut missing = BTreeSet::new();
        let mut todo: Vec<Hash> = start.to_vec();
        let push_tip = |t: &KeptTip, todo: &mut Vec<Hash>, missing: &mut BTreeSet<Hash>| match self.v.tip_line(&col.id, t) {
            Some(ids) => todo.extend(ids),
            None => {
                missing.insert(t.act);
            }
        };
        for t in tips {
            push_tip(t, &mut todo, &mut missing);
        }
        let mut steps = 0usize;
        while let Some(y) = todo.pop() {
            steps += 1;
            if steps > 1_000_000 || !acts.insert(y) {
                continue;
            }
            let Some(h) = self.v.get(&y) else {
                missing.insert(y);
                continue;
            };
            if Self::own_key(col, h) || col.res.position_of(&y).is_some() {
                if col.pos(h).is_none_or(|b| b < link) || col.res.position_of(&y).is_some() {
                    continue;
                }
                if let Some([p]) = h.inside.prev.as_deref() {
                    todo.push(*p);
                }
                if self.is_law(h, types::RECORD) {
                    if let Ok(r) = Record::decode(&h.inside) {
                        for t in &r.kept {
                            push_tip(t, &mut todo, &mut missing);
                        }
                    }
                }
            } else if self.strand(col, h) {
                // A grantee's strand (F128): its previous act is cited.
                if let Some([p]) = h.inside.prev.as_deref() {
                    todo.push(*p);
                }
            }
            todo.extend(Self::cites(h, &col.id));
        }
        let h = Rc::new(History { acts, missing });
        self.histories.borrow_mut().insert(key, h.clone());
        h
    }

    /// Why an action of the collective is not on its actions chain (F127),
    /// if it is not: an action cites the decision it acts under (a record,
    /// or a link of the collective's identity chain, under its own key or an
    /// earlier one), and names on the chain nothing but acts on it.
    fn uncited(&self, col: &Col, x: &Held, b: Option<usize>) -> R<Option<String>> {
        // Identity's own everyday acts (a witness act, routes, an encryption
        // key) carry no objects: Identity governs them, and they are on no
        // chain of Law's (reading, F127); they count for nothing in Law
        // ([`Consent::Identity`], F156), which `consent` answers first.
        if x.inside.spec == self.mips.identity {
            return Ok(None);
        }
        let mut decision = false;
        for y in Self::cites(x, &col.id) {
            let h = self.held(&y)?;
            if self.is_decision(col, h) {
                if let (Some(b), Some(at)) = (b, self.decision_link(col, h)) {
                    if at > b {
                        return Ok(Some("it cites a decision under a later key than its own (F127)".into()));
                    }
                }
                decision = true;
            } else if h.act.outside.signer != Some(col.id) && Self::cites(h, &col.id).is_empty() {
                return Ok(Some("it names on the collective's chain an act that is not on it (F127)".into()));
            }
        }
        Ok((!decision).then(|| {
            "it does not cite, on the collective's chain, the decision it acts under: it is on no chain of the collective, and counts for nothing (F127)".into()
        }))
    }

    /// The records an action knows (F127): those it reaches back on the
    /// collective's chain under its own key, through its previous acts and
    /// what it cites, a record carrying what is before it.
    fn known_records(&self, col: &Col, x: &Held, b: usize) -> R<Vec<&'a Held>> {
        let mut out = vec![];
        let mut seen = BTreeSet::new();
        let mut todo: Vec<Hash> = Self::cites(x, &col.id);
        if self.strand(col, x) {
            if let Some([p]) = x.inside.prev.as_deref() {
                todo.push(*p);
            }
        }
        while let Some(y) = todo.pop() {
            if !seen.insert(y) {
                continue;
            }
            let h = self.held(&y)?;
            let own = Self::own_key(col, h);
            if col.res.position_of(&y).is_some() {
                continue;
            }
            if own && col.pos(h).is_none_or(|k| k < b) {
                continue;
            }
            if own && self.is_law(h, types::RECORD) {
                out.push(h);
                continue;
            }
            if own || self.strand(col, h) {
                if let Some([p]) = h.inside.prev.as_deref() {
                    todo.push(*p);
                }
            }
            todo.extend(Self::cites(h, &col.id));
        }
        Ok(out)
    }

    /// The agreement in force for an action of the collective bound at link
    /// `b` (F127): the one its decisions leave in force: the chain's
    /// declarations, the records under earlier keys carried forward (Flaw
    /// B1), and, under its own key, the records it knows and those before
    /// them. A record it does not know, a concurrent one included, does not
    /// decide for it; where that record ends a power the act uses, the tie
    /// rule voids it (the departures, [`Self::voices`]; a fork or closing).
    fn in_force_action(&self, col: &Col, x: &'a Held, b: usize, base: Hash) -> R<InForce> {
        let known = self.known_records(col, x, b)?;
        let mut puts = vec![];
        for r in self.records_since(col, b) {
            if r.id == x.id {
                continue;
            }
            let counts = col.pos(r).is_some_and(|k| k < b)
                || known.iter().any(|k| k.id == r.id || self.before_struct(col, r, Line::Record(k)));
            if counts {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push((k, e.resolves));
                }
            }
        }
        self.fold(base, &puts)
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
        if self.is_law(x, types::RECORD) || !matches!(l, Line::Record(_)) {
            return Ok(false);
        }
        let ag = self.line_agreement(col, l)?;
        self.keepers_place(col, x, l, ag)
    }

    /// Whether the keepers of agreement `ag`, in force for line `l`, place
    /// the collective's own act `x` before it (C4, Q34, B9).
    fn keepers_place(&self, col: &Col, x: &Held, l: Line, ag: Option<Hash>) -> R<bool> {
        if self.before_struct(col, x, l) {
            return Ok(true);
        }
        if self.is_law(x, types::RECORD) {
            return Ok(false);
        }
        let (Line::Record(lh), Some(ag)) = (l, ag) else {
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
            (Line::Rotation(i), Line::Record(lh)) => self.link(col, lh).is_some_and(|b| b >= i),
        }
    }

    /// The places the collective's acts give a member's signature act `s`
    /// ("Made before, made after", 2; C1, C2, A2, Flaw M): the act of the
    /// collective it signs, a record naming it, a rotation naming it, and
    /// an act of the collective on its chain acknowledging it. Identity's
    /// own everyday acts of the collective, a witness act included, are on
    /// neither chain and place nothing (F156, rule 35b).
    fn placements(&self, col: &Col, s: &Held) -> Vec<(Line<'a>, bool)> {
        // (where, whether it is a line: lines are not placed by keepers)
        let mut out = vec![];
        if let Ok(signed) = decode_signature(&s.inside) {
            if let Some(a) = self.v.get(&signed) {
                if Self::own_key(col, a)
                    && self.v.status(&a.id) == Status::Valid
                    && !Self::identity_everyday(col, a, &self.mips)
                {
                    out.push((Line::Record(a), self.is_law(a, types::RECORD)));
                }
            }
        }
        for h in self.v.signed_by(&col.id) {
            if !Self::own_key(col, h) || self.v.status(&h.id) != Status::Valid {
                continue;
            }
            if self.is_law(h, types::RECORD) {
                if let Ok(r) = Record::decode(&h.inside) {
                    // A record that is no line places nothing (W3, F127); a
                    // record being judged places its own clone's signatures.
                    if r.signatures.iter().flatten().any(|x| x == &s.id)
                        && self.record_eval(col, h).map(|e| e.line).unwrap_or(true)
                    {
                        out.push((Line::Record(h), true));
                    }
                }
            }
        }
        for a in self.v.acknowledgements(&s.id) {
            if Self::own_key(col, a) && self.v.status(&a.id) == Status::Valid && self.on_chain(col, a) {
                out.push((Line::Record(a), self.is_law(a, types::RECORD)));
            }
        }
        for j in 1..col.res.links.len() {
            if let Some(Ok(d)) = declared_in(&col.res.states[j].declarations, &self.law()) {
                if d.signatures.iter().chain(d.absence.iter()).flatten().any(|x| x == &s.id) {
                    out.push((Line::Rotation(j), true));
                }
            }
        }
        out
    }

    /// Whether an act of the collective's own key is on one of its chains
    /// (rule 35b): a decision, or an action citing the decision it acts
    /// under. Identity's own everyday acts (a witness act) and negotiation
    /// messages are on neither (F156, W6).
    fn on_chain(&self, col: &Col, a: &Held) -> bool {
        if self.is_decision(col, a) {
            return true;
        }
        if Self::identity_everyday(col, a, &self.mips) || self.is_law(a, types::NEGOTIATION) {
            return false;
        }
        matches!(self.uncited(col, a, col.pos(a)), Ok(None))
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
            resolves: false,
            registers: vec![],
        };
        let no = |mut e: RecordEval, w: &str| {
            e.not_a_line = Some(w.into());
            Ok(e)
        };
        if !self.is_law(h, types::RECORD)
            || h.act.outside.signer != Some(col.id)
            || !self.valid(&h.id)
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
        for r in self.records_since(col, b) {
            if self.before_struct(col, r, Line::Record(h)) {
                let x = self.record_eval(col, r)?;
                if let Some(k) = x.puts {
                    puts.push((k, x.resolves));
                }
            }
        }
        let f = self.fold(base, &puts)?;
        let at = f.agreement;
        e.in_force_at = Some(at);
        // W3 (F127): a record is an act in the collective's name like any
        // other: not done, it is no line, and puts nothing in force.
        if let Some(w) = self.not_done(h, &at)? {
            return no(e, &w);
        }
        if rec.clone.is_none() && Record::named(&h.inside) != Some(at) {
            return no(e, "a record naming no clone names the agreement in force for it");
        }
        let at_terms = self.terms(&at)?;
        let at_lineage: Vec<Hash> = self.lineage(&at)?.into_iter().map(|(i, _)| i).collect();
        let mut declarations: Vec<(Hash, Hash)> = vec![];
        for x in rec.registers.iter().flatten() {
            let a = self.held(x)?;
            let Some(p) = a.act.outside.signer else {
                return no(e, "it registers an act with no signer");
            };
            if self.is_law(a, types::DECLARATION) {
                // Signed by the authority, judged once the record's other
                // registrations are known.
                declarations.push((*x, p));
                continue;
            }
            if !at_terms.parties.contains(&p) {
                return no(e, "it registers an act of someone who is not a party of the agreement in force");
            }
            if self.is_law(a, types::RESIGNATION) {
                if !self.valid(&a.id) {
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
        // Declarations removing a voice (rule 53, B12), their authority
        // counted at this line (Q37), with the record's resignations and
        // steppings down in effect, other declarations not.
        let others = e.registers.clone();
        for (x, p) in declarations {
            let (d, clause) = match self.declaration(&x)? {
                Ok(v) => v,
                Err(w) => return no(e, &format!("it registers a declaration that fails: {w}")),
            };
            if !at_terms.parties.contains(&d.party) {
                return no(e, "it registers a declaration against someone who is not a party of the agreement in force");
            }
            if !d.outcomes.contains(&outcomes::VOICE_REMOVED) {
                return no(e, "it registers a declaration that removes no voice (outcome 0)");
            }
            if !at_lineage.contains(&d.agreement) {
                return no(e, "it registers a declaration in an agreement not in force for it");
            }
            if let Err(w) = self.authority_at(col, Point::Line(Line::Record(h)), &at, &clause, &d, &x, &p, &others)? {
                return no(e, &w);
            }
            e.registers.push(Departure {
                act: x,
                party: d.party,
                kind: DepartureKind::Declared { agreement: d.agreement },
            });
        }
        e.line = true;
        if let (Some(k), Some(sigs)) = (&rec.clone, &rec.signatures) {
            let kt = self.terms(k)?;
            // A clone of the latest clone of one branch of a fork, recorded
            // after both lines, resolves it (rule 47, B11).
            let resolves = f.fork && kt.parent.is_some_and(|p| f.branches.contains(&p));
            let parent_terms = match kt.parent {
                Some(pp) if resolves => self.terms(&pp)?,
                _ => at_terms.clone(),
            };
            let state = if kt.parent != Some(at) && !resolves {
                CloneState::Invalid(
                    "its parent is not the agreement in force for the record (rule 37c)".into(),
                )
            } else if changes(&parent_terms, &kt)
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
                e.resolves = resolves;
            }
            e.clone = Some((*k, state));
        }
        Ok(e)
    }

    /// The lines that may register a departure in effect at a point, and
    /// what each registers: records under earlier keys, and records under
    /// the point's key that can precede it. A line point adds its own
    /// registrations (`own`): a record is not before itself, and judges its
    /// clone with them in effect; a recovery rotation's declarations take
    /// effect at it (C7).
    fn departure_lines(&self, col: &Col, point: Point<'a>, own: &[Departure]) -> R<Vec<(Line<'a>, Departure)>> {
        let mut out = vec![];
        // A record after the line of the fork or closing that ended the
        // collective counts for nothing in Law (rule 47a): it registers no
        // departure. Found by the Law invariants (`docs/law-invariants.md`,
        // IC8), hidden until F131 made ENDING-UNDONE a failure again.
        // Judged for an act only: a line's own judgment is part of judging
        // the ending, and the ending is judged before any act (`consent`).
        let ended = match point {
            Point::Act(_) => self.closed_by(&col.id)?,
            Point::Line(_) => None,
        };
        let (limit, me): (usize, Option<&'a Held>) = match point {
            Point::Act(x) => (self.link(col, x).unwrap_or(0), None),
            Point::Line(Line::Record(r)) => (col.pos(r).unwrap_or(0), Some(r)),
            Point::Line(Line::Rotation(j)) => (j - 1, None),
        };
        for k in 0..=limit.min(col.res.links.len().saturating_sub(1)) {
            for r in self.records_at(col, k) {
                if me.is_some_and(|m| m.id == r.id) {
                    continue;
                }
                if k == limit && !self.applies(col, r, point)? {
                    continue;
                }
                // F131 (IT2a): an act the collective's own key cites, by an
                // act that counts and that the line does not follow, is
                // adopted: a departure racing that citation takes no voice
                // off it. Found by the Law invariants
                // (`docs/law-invariants.md`, IC9).
                if let Point::Act(x) = point {
                    if k == limit && self.adopting.borrow().contains(&x.id) && self.cited_against(col, x, r)? {
                        continue;
                    }
                }
                if ended.as_ref().is_some_and(|e| !self.before_line(col, r, &e.chain_act, &e.tips)) {
                    continue;
                }
                let e = self.record_eval(col, r)?;
                if e.line {
                    for d in &e.registers {
                        out.push((Line::Record(r), d.clone()));
                    }
                }
            }
        }
        if let Point::Line(l) = point {
            for d in own {
                out.push((l, d.clone()));
            }
        }
        Ok(out)
    }

    /// Whether an act of the collective's own key that counts, other than
    /// `x`, holds `x` in its history while the line `l` does not hold it:
    /// the collective took `x` on, by a citation `l` races (F131, IT2a;
    /// "cites" as a line reads it, reading U3, confirmed, F132).
    fn cited_against(&self, col: &Col, x: &'a Held, l: &'a Held) -> R<bool> {
        // Judging the citing act may ask again about acts being judged here:
        // an act under judgment adopts nothing.
        if !self.citing.borrow_mut().insert(x.id) {
            return Ok(false);
        }
        let r = self.cited_against_inner(col, x, l);
        self.citing.borrow_mut().remove(&x.id);
        r
    }

    fn cited_against_inner(&self, col: &Col, x: &'a Held, l: &'a Held) -> R<bool> {
        for a in self.v.signed_by(&col.id) {
            // F142: a citation is an action on the chain; Identity's own
            // everyday acts are on neither chain.
            if a.id == x.id || a.id == l.id || !Self::own_key(col, a) || a.inside.spec == self.mips.identity || self.is_law(a, types::RECORD) || self.citing.borrow().contains(&a.id) {
                continue;
            }
            if !self.before_struct(col, x, Line::Record(a)) || self.before_struct(col, l, Line::Record(a)) {
                continue;
            }
            if self.valid(&a.id) && self.consent(&a.id)?.counts() {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// The records naming `p`'s rotation `rot` in field 3: valid record acts
    /// of the collective, read without judging the rest of the record, so
    /// that C5 can look at lines after the point it judges.
    fn rotation_lines(&self, col: &Col, rot: &Hash) -> Vec<&'a Held> {
        self.v
            .signed_by(&col.id)
            .filter(|h| {
                self.is_law(h, types::RECORD)
                    && self.valid(&h.id)
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
            let mut regs: Vec<Line<'a>> = vec![];
            for (l, d) in &lines {
                if &d.party != p {
                    continue;
                }
                let (from, hits) = match &d.kind {
                    DepartureKind::Resigned { agreement } | DepartureKind::Declared { agreement } => (*agreement, true),
                    DepartureKind::SteppedDown { agreement, area: a } => (*agreement, area == Some(*a)),
                    DepartureKind::Rotated { .. } => (*ag, false),
                };
                // The tie rule (F127): an action judged under an earlier
                // version than the one a departure names, and not before
                // the line registering it, uses a power that line ends:
                // the ending wins.
                let later = matches!(point, Point::Act(_))
                    && !lineage.contains(&from)
                    && self.lineage(&from)?.iter().any(|(i, _)| i == ag);
                if !hits || !(lineage.contains(&from) || later) {
                    continue;
                }
                // Named again by a later version they signed, after the line.
                if self.restored(col, p, &lineage, &from, area, *l)? {
                    continue;
                }
                regs.push(*l);
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
                    all &= self.sig_before(col, s, *l)?;
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
    fn restored(&self, col: &Col, p: &Hash, lineage: &[Hash], from: &Hash, area: Option<u64>, l: Line<'a>) -> R<bool> {
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
                if !self.sig_before(col, self.held(&s)?, l)? {
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
        if let [MarkEntry { power: Power::Plan(party), signers }] = mark {
            if !Self::newcomers(parent, clone).iter().all(|p| by.contains_key(p)) {
                return Ok(CloneState::Draft(
                    "a party it adds, or makes a holder, has not signed it (Q11)".into(),
                ));
            }
            if let Some(w) = self.coverage(clone) {
                return Ok(CloneState::Invalid(w));
            }
            return self.plan_at(col, at, &lineage, party, signers, &by, own);
        }
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
        if !Self::must_sign(parent, clone).iter().all(|h| by.contains_key(h)) {
            return Ok(CloneState::Draft(
                "it lowers a holder's stake, changes a departed holder's plan or changes the release rule, and a holder it must have has not signed it (rules 46, 46b; N8)".into(),
            ));
        }
        if let Some(w) = self.coverage(clone) {
            return Ok(CloneState::Invalid(w));
        }
        Ok(CloneState::Complete)
    }


    // ------------------------------------------------------------ abandonment

    /// An abandonment declaration's own checks (rules 46a, 49, 51; B12):
    /// valid under Identity; the party is a party of the agreement it names;
    /// the clause it applies is the last version of that agreement, back
    /// from it, that the party signed; every outcome is one that clause
    /// allows; and its signer can be that clause's authority: the identity
    /// it names, or one of the other parties, whose number is counted where
    /// the declaration takes effect ([`Self::authority_at`]); and, where
    /// the clause names a period of absence, the anchors' checks (F136,
    /// F148: [`Self::absence_by_anchors`]). Returns the declaration and the
    /// clause, or why it fails.
    pub fn declaration(&self, id: &Hash) -> R<Result<(AbsenceDeclaration, Abandonment), String>> {
        let h = self.held(id)?;
        if !self.is_law(h, types::DECLARATION) {
            return Ok(Err("not an abandonment declaration (type 13)".into()));
        }
        if !self.valid(&h.id) {
            return Ok(Err("the declaration is not valid under Identity".into()));
        }
        let d = match AbsenceDeclaration::decode(&h.inside) {
            Ok(d) => d,
            Err(e) => return Ok(Err(e.to_string())),
        };
        let lineage = self.lineage(&d.agreement)?;
        if !lineage[0].1.parties.contains(&d.party) {
            return Ok(Err("the party declared absent is not a party of the agreement it names".into()));
        }
        let Some((version, vt)) = lineage
            .iter()
            .find(|(v, _)| !self.signers(v, &[d.party]).is_empty())
        else {
            return Ok(Err("the party signed no version of the agreement it names".into()));
        };
        if version != &d.clause {
            return Ok(Err(
                "the clause it applies is not the last version of the agreement the party signed (rule 46a)".into(),
            ));
        }
        if vt.abandonment.is_none() {
            return Ok(Err("the version the party signed carries no abandonment clause".into()));
        }
        // Reading 7, corrected (F121): the clause in force applies, that of
        // the agreement the declaration names, for every party, one whose
        // voice was removed before a judicial change included; field 1
        // still names the last version the party signed.
        let Some(clause) = lineage[0].1.abandonment.clone() else {
            return Ok(Err("the agreement it names carries no abandonment clause".into()));
        };
        if !d.outcomes.iter().all(|o| clause.outcomes.contains(o)) {
            return Ok(Err("an outcome the clause does not allow (rule 51)".into()));
        }
        let signer = h.act.outside.signer.ok_or(LawError::Check("a declaration with no signer"))?;
        let ok = match clause.authority {
            Authority::Named(a) => signer == a,
            Authority::Others(_) => signer != d.party,
        };
        if !ok {
            return Ok(Err("it is not signed by the authority the clause names (rule 51)".into()));
        }
        // F136, F148: where the clause names a period of absence, judged by
        // anchors alone ([`Self::absence_by_anchors`]). With no period, the
        // declaration is the authority's judgment, a stated cost.
        if let Some(period) = clause.period {
            let versions: Vec<Hash> = lineage.iter().map(|(v, _)| *v).collect();
            if let Err(w) = self.absence_by_anchors(id, &d, period, &versions, &lineage[0].1) {
                return Ok(Err(w));
            }
        }
        Ok(Ok((d, clause)))
    }

    /// Rule 51's checks under a clause naming a period of absence (F136,
    /// F148), on the anchors the caller states ([`Self::anchors`]): the
    /// declaration is anchored, at a point D; no act of the declared party
    /// on the agreement is anchored within the period before it, from D
    /// less the period to D; and an acknowledgement of it (Envelope,
    /// `acks`) by another party of the agreement or by one of its keepers'
    /// operators is anchored within one further period, from D to D plus
    /// the period, with no act of the declared party on the agreement
    /// anchored between the two. Only acts on the agreement count as
    /// presence (rule 50): acts naming, in `objects`, the agreement or a
    /// version back through its parents, as chain or predecessor, and
    /// signature acts signing one; activity elsewhere does not. An act of
    /// the party that nobody anchored is no presence (a stated cost, rule
    /// 50). Bounds are taken inclusive, so that an act anchored at the
    /// declaration's own point, or at its acknowledgement's, protects the
    /// party (reading).
    fn absence_by_anchors(&self, decl: &Hash, d: &AbsenceDeclaration, period: u64, versions: &[Hash], terms: &Terms) -> Result<(), String> {
        let Some(&at) = self.anchors.get(decl) else {
            return Err("the clause names a period of absence, and the declaration is not anchored on the agreement's time reference, or the anchors cannot place it: it does not count (rule 51, F136); until the anchoring cMIP and the time-reference format exist, the anchors are the caller's statement".into());
        };
        let on_agreement = |h: &Held| {
            h.inside.objects.iter().flatten().any(|o| versions.contains(&o.chain) || versions.contains(&o.predecessor))
                || (self.is_law(h, types::SIGNATURE) && decode_signature(&h.inside).is_ok_and(|x| versions.contains(&x)))
        };
        let presence: Vec<u64> = self
            .v
            .signed_by(&d.party)
            .filter(|h| h.id != *decl && self.valid(&h.id) && on_agreement(h))
            .filter_map(|h| self.anchors.get(&h.id).copied())
            .collect();
        if presence.iter().any(|p| *p >= at.saturating_sub(period) && *p <= at) {
            return Err("the clause names a period of absence, and an act of the party on the agreement is anchored on its time reference within that period before the declaration (rule 51, F136)".into());
        }
        let keepers: Vec<Hash> = terms.keepers.iter().flat_map(|k| k.operators.iter().copied()).collect();
        let ack = self
            .v
            .acknowledgements(decl)
            .filter(|a| self.valid(&a.id))
            .filter(|a| {
                a.act.outside.signer.is_some_and(|s| s != d.party && (terms.parties.contains(&s) || keepers.contains(&s)))
            })
            .filter_map(|a| self.anchors.get(&a.id).copied())
            .filter(|p| *p >= at && *p <= at.saturating_add(period))
            .min();
        let Some(ack) = ack else {
            return Err("no acknowledgement of the declaration by another party or by the keeper is anchored within one further period after its own anchor: it does not count, so a declaration cannot be kept and used later (rule 51, F148)".into());
        };
        if presence.iter().any(|p| *p >= at && *p <= ack) {
            return Err("an act of the declared party on the agreement is anchored between the declaration and its acknowledgement: it does not count (rule 51, F148)".into());
        }
        Ok(())
    }

    /// A threshold authority, counted where the declaration takes effect
    /// (rule 49, Q37, flaw C): among the other parties of the agreement in
    /// force whose voice remains there. One of them signs the declaration;
    /// the others add signature acts naming it (B15), which count where the
    /// collective placed them at or before that line: an act of the
    /// collective before it acknowledges them, or the record registering the
    /// declaration does ("Made before, made after", 2). It counts once the
    /// required number have signed. At a recovery rotation (C7), which the
    /// collective cannot precede with any act of its own without the
    /// declared party, the rotation places the signature acts its Law
    /// declaration names (Flaw B18).
    #[allow(clippy::too_many_arguments)]
    fn authority_at(
        &self,
        col: &Col,
        point: Point<'a>,
        ag: &Hash,
        clause: &Abandonment,
        d: &AbsenceDeclaration,
        decl: &Hash,
        signer: &Hash,
        own: &[Departure],
    ) -> R<Result<(), String>> {
        let Authority::Others(k) = clause.authority else {
            return Ok(Ok(()));
        };
        let t = self.terms(ag)?;
        let others: Vec<Hash> = t.parties.iter().filter(|p| **p != d.party).copied().collect();
        let (_, remaining) = self.voices(col, point, ag, &others, None, &BTreeMap::new(), own)?;
        if !remaining.contains(signer) {
            return Ok(Err(
                "its signer is not among the other parties whose voice remains at the line (rule 49, Q37)".into(),
            ));
        }
        let Some(need) = Rule::Threshold(k).needed(remaining.len()) else {
            return Ok(Err("no other voice remains to declare absence".into()));
        };
        let Point::Line(l) = point else {
            return Err(LawError::Check("a declaration is counted at a line"));
        };
        let mut signed = vec![*signer];
        for (who, s) in self.valid_sigs(decl, &remaining) {
            if signed.contains(&who) {
                continue;
            }
            let h = self.held(&s)?;
            let mut placed = false;
            for (p, is_line) in self.placements(col, h) {
                placed |= match (p, l) {
                    (Line::Record(a), Line::Record(b)) if a.id == b.id => true,
                    (Line::Rotation(i), Line::Rotation(j)) if i == j => true,
                    (Line::Record(a), _) if !is_line => self.keepers_place(col, a, l, Some(*ag))?,
                    _ => self.line_before(col, p, l),
                };
                if placed {
                    break;
                }
            }
            if placed {
                signed.push(who);
            }
        }
        if signed.len() >= need {
            return Ok(Ok(()));
        }
        Ok(Err(format!(
            "it has {} of the {need} signatures of the other parties its number needs, placed at or before the line (rule 49, B15)",
            signed.len()
        )))
    }

    /// The declarations against `party` that its possible authorities
    /// signed, under the clauses of `lineage`: the identities they name, or
    /// the other parties of `parties`. Checked on their own only.
    fn declarations_against(&self, party: &Hash, lineage: &[(Hash, Terms)], parties: &[Hash]) -> R<Vec<(Hash, AbsenceDeclaration, Abandonment, Hash)>> {
        let mut who: Vec<Hash> = vec![];
        for (_, t) in lineage {
            match t.abandonment.as_ref().map(|a| &a.authority) {
                Some(Authority::Named(a)) => who.push(*a),
                Some(Authority::Others(_)) => who.extend(parties.iter().filter(|p| *p != party)),
                None => {}
            }
        }
        let ids: Vec<Hash> = lineage.iter().map(|(i, _)| *i).collect();
        let mut out = vec![];
        let mut seen = BTreeSet::new();
        for w in who {
            for h in self.v.signed_by(&w) {
                if !self.is_law(h, types::DECLARATION) || !seen.insert(h.id) {
                    continue;
                }
                if let Ok((d, c)) = self.declaration(&h.id)? {
                    if &d.party == party
                        && d.outcomes.contains(&outcomes::VOICE_REMOVED)
                        && ids.contains(&d.agreement)
                    {
                        out.push((h.id, d, c, w));
                    }
                }
            }
        }
        Ok(out)
    }

    /// C7: where the declared party is one the collective's signing key
    /// cannot be produced without, under the agreement in force at rotation
    /// `j`, its declaration takes effect at the rotation the recovery path
    /// makes, a line by its kept tips. Read here as the rotation declaring
    /// the clone `k` that takes that party out (question B16).
    fn recovery_departures(&self, col: &Col, j: usize, at: &Hash, k: &Hash) -> R<Vec<Departure>> {
        let t = self.terms(at)?;
        let kt = self.terms(k)?;
        let Some(g) = &t.grammar else { return Ok(vec![]) };
        let lineage = self.lineage(at)?;
        let mut out = vec![];
        for p in &t.parties {
            if kt.parties.contains(p) || !needed_to_sign(&g.signing, p) {
                continue;
            }
            let mut open = None;
            for (x, d, clause, signer) in self.declarations_against(p, &lineage, &t.parties)? {
                match self.authority_at(col, Point::Line(Line::Rotation(j)), at, &clause, &d, &x, &signer, &[]) {
                    Ok(Ok(())) => {
                        out.push(Departure {
                            act: x,
                            party: *p,
                            kind: DepartureKind::Declared { agreement: d.agreement },
                        });
                        open = None;
                        break;
                    }
                    Ok(Err(_)) => {}
                    Err(e @ LawError::Unsettled(_)) => open = Some(e),
                    Err(e) => return Err(e),
                }
            }
            if let Some(e) = open {
                return Err(e);
            }
        }
        Ok(out)
    }

    /// The third element of a recovery rotation's Law declaration (Flaw
    /// B18): each act it names is a valid signature act on an abandonment
    /// declaration against a party the declared clone `k` takes out and
    /// the collective's signing key cannot be produced without under the
    /// agreement in force `at` (C7, B16). Naming any other act puts nothing
    /// in force, as for the clone's own signatures (Flaw M).
    fn recovery_signatures(&self, at: &Hash, k: &Hash, absence: Option<&[Hash]>) -> R<Option<String>> {
        let Some(absence) = absence else { return Ok(None) };
        let t = self.terms(at)?;
        let kt = self.terms(k)?;
        let removed: Vec<Hash> = match &t.grammar {
            Some(g) => t
                .parties
                .iter()
                .filter(|p| !kt.parties.contains(p) && needed_to_sign(&g.signing, p))
                .copied()
                .collect(),
            None => vec![],
        };
        for s in absence {
            let h = self.held(s)?;
            let on = if self.is_law(h, types::SIGNATURE) && self.valid(&h.id) {
                decode_signature(&h.inside).ok()
            } else {
                None
            };
            let ok = match on {
                Some(x) => match self.declaration(&x) {
                    Ok(Ok((d, _))) => removed.contains(&d.party),
                    _ => false,
                },
                None => false,
            };
            if !ok {
                return Ok(Some(
                    "the rotation names, beside its clone's, an act that is not a valid signature act on a declaration taking effect at it (C7, Flaw B18)".into(),
                ));
            }
        }
        Ok(None)
    }

    // ------------------------------------------------------------ succession

    /// A clone whose mark names a party's succession plan, `[3, party]`
    /// (rules 44c, 48c), checked against its parent alone: the mark names
    /// nothing else; the parent carries an automatic plan for that party;
    /// the signers are its seat successors; and the clone changes nothing
    /// but what the plan gives (Flaw B14): the party out of the parties and
    /// every area, its seat successors in; the successors in the party's
    /// place in every holding of the key grammar, every threshold
    /// unchanged; the executed plan dropped from field 16, and, where the
    /// party held the safety key alone, a plan for the successor in its
    /// place (Flaw B17). What the texts
    /// leave open ([`plan_open`]) is refused at the line
    /// ([`Self::plan_at`]), never guessed.
    fn plan_static(parent: &Terms, clone: &Terms, mark: &[MarkEntry]) -> Result<Vec<Power>, String> {
        let [MarkEntry { power: Power::Plan(p), signers }] = mark else {
            return Err("a mark naming a succession plan names it alone (rule 44c)".into());
        };
        let Some(plan) = parent.succession.iter().flatten().find(|s| &s.party == p) else {
            return Err("the parent carries no succession plan for that party".into());
        };
        if plan.entry != Some(0) {
            return Err(
                "the plan's seat does not enter automatically: its successor is a nomination (rule 48c, Q14)".into(),
            );
        }
        let seats: Vec<Hash> = plan.seats.iter().flatten().map(|(h, _)| *h).collect();
        if seats.is_empty() {
            return Err("the plan names no seat successor".into());
        }
        let mut a = signers.clone();
        let mut b = seats.clone();
        a.sort();
        b.sort();
        if a != b {
            return Err("its signers are the seat successors entering, all of them (rule 48c)".into());
        }
        // Field 0: the others stay, in their order; the successors enter.
        let others: Vec<Hash> = clone.parties.iter().filter(|x| !seats.contains(x)).copied().collect();
        let kept: Vec<Hash> = parent.parties.iter().filter(|x| *x != p && !seats.contains(x)).copied().collect();
        if others != kept || !seats.iter().all(|x| clone.parties.contains(x)) {
            return Err("it changes the parties beyond what the plan gives (rule 48c)".into());
        }
        if clone.areas().iter().any(|x| x.holders.contains(p)) {
            return Err("it leaves the party among an area's holders (Q21)".into());
        }
        let ids = |t: &Terms| t.areas().iter().map(|x| x.id).collect::<Vec<_>>();
        if ids(parent) != ids(clone) {
            return Err("it changes the areas beyond taking the party off them (rule 44c)".into());
        }
        for x in parent.areas() {
            let mut y = x.clone();
            y.holders.retain(|h| h != p);
            if clone.area(x.id) != Some(&y) {
                return Err("it changes an area beyond taking the party off it (rule 44c, Q26)".into());
            }
        }
        // The key grammar: the successors take the party's place in every
        // holding, every threshold unchanged (B14). Where the texts leave
        // the place open, the grammar is checked at the line.
        if plan_open(parent, plan).is_none() && clone.grammar != plan_grammar(parent, p, &seats) {
            return Err(
                "it does not put the seat successors in the party's place in the key grammar, every threshold unchanged (B14)".into(),
            );
        }
        // Field 16: the executed plan dropped, every other plan as it was;
        // where the party held the safety key alone, a plan for the
        // successor in its place, naming their own successor (Flaw B17,
        // rule 36), signed by the successor as the mark's signer.
        let plans: Vec<SuccessionPlan> = parent.succession.clone().unwrap_or_default();
        let rest: Vec<SuccessionPlan> = plans.iter().filter(|s| &s.party != p).cloned().collect();
        let got = clone.succession.clone().unwrap_or_default();
        let sole = matches!(parent.grammar.as_ref().map(|g| &g.safety), Some(Holding::One(x)) if x == p);
        if sole && plan_open(parent, plan).is_none() {
            let i = plans.iter().position(|s| &s.party == p).expect("found above");
            let theirs = (got.len() == plans.len()).then(|| &got[i]);
            let others: Vec<SuccessionPlan> = got.iter().enumerate().filter(|(j, _)| *j != i).map(|(_, x)| x.clone()).collect();
            let named = theirs.is_some_and(|x| x.party == seats[0] && x.seats.as_ref().is_some_and(|v| !v.is_empty()));
            if !named || others != rest {
                return Err(
                    "the party held the safety key alone: it drops the executed plan and carries, in its place, a plan for the successor naming their own successor (rule 36, B17)".into(),
                );
            }
        } else if got != rest {
            return Err("it does not drop the executed plan alone from the succession plans (B14)".into());
        }
        for c in changes(parent, clone) {
            if !matches!(c, Change::Field(0 | 12 | 16 | 19)) {
                return Err("it changes more than the plan gives (rule 44c)".into());
            }
        }
        Ok(vec![Power::Plan(*p)])
    }

    /// A clone marked with a succession plan, at a line (rules 48b, 48c,
    /// Q14): every seat successor named signed it; the plan's trigger, a
    /// declaration removing the party's voice, is in effect there; and
    /// every party whose voice remains signed a version, up to the parent,
    /// carrying that plan exactly. It is then complete, the seat passing
    /// (B14), save where the texts leave its shape open ([`plan_open`]):
    /// refused, never guessed.
    #[allow(clippy::too_many_arguments)]
    fn plan_at(
        &self,
        col: &Col,
        at: Line<'a>,
        lineage: &[(Hash, Terms)],
        party: &Hash,
        signers: &[Hash],
        by: &BTreeMap<Hash, Hash>,
        own: &[Departure],
    ) -> R<CloneState> {
        let parent = &lineage[1].1;
        let pid = lineage[1].0;
        let plan = parent
            .succession
            .iter()
            .flatten()
            .find(|s| &s.party == party)
            .expect("checked by plan_static");
        if !signers.iter().all(|s| by.contains_key(s)) {
            return Ok(CloneState::Draft(
                "a seat successor its mark names has no signature act among those named".into(),
            ));
        }
        let up: Vec<Hash> = lineage[1..].iter().map(|(i, _)| *i).collect();
        let triggered = self
            .departure_lines(col, Point::Line(at), own)?
            .iter()
            .any(|(_, d)| {
                &d.party == party
                    && matches!(&d.kind, DepartureKind::Declared { agreement } if up.contains(agreement))
            });
        if !triggered {
            return Ok(CloneState::Draft(
                "the plan's trigger, a declaration removing the party's voice, is not in effect at this line (rule 48b)".into(),
            ));
        }
        let (_, remaining) = self.voices(col, Point::Line(at), &pid, &parent.parties, None, &BTreeMap::new(), own)?;
        for v in remaining.iter().filter(|v| *v != party) {
            let signed = lineage[1..].iter().any(|(id, t)| {
                t.succession.iter().flatten().any(|s| s == plan) && !self.signers(id, &[*v]).is_empty()
            });
            if !signed {
                return Ok(CloneState::Invalid(
                    "a party whose voice remains never signed a version carrying this plan: the seat is a nomination (rule 48c, Q14)".into(),
                ));
            }
        }
        if let Some(w) = plan_open(parent, plan) {
            return Err(LawError::Unsettled(w));
        }
        let seats: Vec<Hash> = plan.seats.iter().flatten().map(|(h, _)| *h).collect();
        let clone = &lineage[0].1;
        let placed: Vec<Hash> = parent
            .parties
            .iter()
            .flat_map(|x| if x == party { seats.clone() } else { vec![*x] })
            .collect();
        if clone.parties != placed {
            return Err(LawError::Unsettled(
                "a clone executing a succession plan that puts the seat successors elsewhere than in the party's place among the parties: where they go is not written (Flaw B14, its first remaining point)",
            ));
        }
        Ok(CloneState::Complete)
    }

    // ------------------------------------------------------------ acts of the collective

    /// The agreement in force for an act of the collective, and whether
    /// records of sibling clones leave it at their parent (rule 37c).
    fn in_force_act(&self, col: &Col, x: &'a Held, b: usize, base: Hash) -> R<InForce> {
        let mut puts = vec![];
        for r in self.records_since(col, b) {
            if r.id == x.id {
                continue;
            }
            if !self.before(col, x, Line::Record(r))? {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push((k, e.resolves));
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
        let Some(b) = self.link(&col, x) else {
            return Err(LawError::Check("the act's binding does not count"));
        };
        if !self.declares(&col, b) {
            return Ok(None);
        }
        match self.base(&col, b)? {
            Ok(base) if self.is_law(x, types::RECORD) => Ok(Some(self.in_force_act(&col, x, b, base)?.agreement)),
            Ok(base) => Ok(Some(self.in_force_action(&col, x, b, base)?.agreement)),
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

    /// For a receipt or claim of the collective (Finance types 2 and 3) as
    /// payee: the rail Module it names, if the collective never accepted it
    /// (Finance rule 12a, F115). Accepted: a rail of one of the collective's
    /// payee pointers that counts (its Finance lane's holders signed it), or
    /// an entry of the vault its identity chain declares at the act's
    /// binding. *Which exact rail or entry a payment went to is in the rail's
    /// proof, which the payment cMIP reads (`paid-to`); Law checks only that
    /// the collective ever accepted the rail Module.*
    fn rail_not_accepted(&self, col: &Col, c: &Hash, x: &Held, b: usize) -> R<Option<Hash>> {
        use crate::finance::{self as fin, Payload as Fin};
        let finance = self.mips.finance;
        if x.inside.spec != finance {
            return Ok(None);
        }
        let rail = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Receipt(r)) if &r.payee == c => r.rail,
            Ok(Fin::Claim(cl)) if &cl.payee == c => cl.rail,
            _ => return Ok(None),
        };
        if let Some(state) = col.res.states.get(b) {
            if let Ok(Some(Some(entries))) = fin::vault_in(&finance, &state.declarations) {
                if entries.iter().any(|e| e.rail_module == rail) {
                    return Ok(None);
                }
            }
        }
        for h in self.v.signed_by(c) {
            if h.inside.spec != finance || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(p)) = Fin::decode(h.inside.type_, &h.inside.payload) else {
                continue;
            };
            if &p.payee == c
                && p.rails.iter().any(|r| r.module == rail)
                && self.valid(&h.id)
                && self.consent(&h.id)?.counts()
            {
                return Ok(None);
            }
        }
        Ok(Some(rail))
    }

    /// Law's answer for an act of a collective (rules 36a, 37b, 38a, 44d;
    /// F100, F106, F109). The act's own standing is Identity's, from
    /// [`Verifier::status`]; this asks only what Law adds.
    pub fn consent(&self, act: &Hash) -> R<Consent> {
        // F131 (IT2a): an act of the collective's own key that does not count
        // as judged counts all the same where the departures racing a
        // citation of it by a counting act of its own key are set aside: no
        // ending racing that citation voids it. Judged again only then, so
        // that setting a departure aside never makes an act fail.
        let first = self.consent_judged(act)?;
        if first.counts() || self.adopting.borrow().contains(act) {
            return Ok(first);
        }
        self.adopting.borrow_mut().insert(*act);
        let again = self.consent_judged(act);
        self.adopting.borrow_mut().remove(act);
        let again = again?;
        Ok(if again.counts() { again } else { first })
    }

    fn consent_judged(&self, act: &Hash) -> R<Consent> {
        let x = self.held(act)?;
        let (Some(c), Some(_)) = (x.act.outside.signer, x.act.outside.binding) else {
            return Err(LawError::Check("the act has no signer or binding"));
        };
        let col = self.col(&c);
        // F128: an act signed with a grant key is the collective's own,
        // backed by its grant, with no area's signatures: the grant is the
        // area's consent, given once.
        if col.pos(x).is_none() {
            if let Some((g, _)) = self.key_grant(x) {
                return Ok(match self.backing(act)? {
                    Backing::Backed { grant } | Backing::Binds { grant } => Consent::Granted {
                        agreement: self.in_force(act)?.unwrap_or(g.id),
                        grant,
                    },
                    Backing::NotBacked { grant, reason } => Consent::Ungranted { grant, reason },
                    Backing::Unknown { grant, reason } => Consent::Unknown { grant, reason },
                    Backing::NotUnderGrant => Consent::Ungranted {
                        grant: g.id,
                        reason: "not signed with its grant's key".into(),
                    },
                });
            }
        }
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
        if let Some(e) = self.closed_by(&c)? {
            if !self.before_line(&col, x, &e.chain_act, &e.tips) {
                return Ok(Consent::Closed { by: e.by });
            }
        }
        if self.is_law(x, types::RECORD) {
            let ag = self.in_force_act(&col, x, b, base)?.agreement;
            return Ok(Consent::Line { agreement: ag });
        }
        // W6 (F128): negotiation is talk, binding nothing, on neither chain;
        // it need not be sealed to every member. The deal it leads to is
        // signed, and that signature is an action.
        if self.is_law(x, types::NEGOTIATION) {
            return Ok(Consent::Talk);
        }
        // F156 (rule 35b): Identity's own everyday acts, a witness act of the
        // collective included, are on neither chain and count for nothing in
        // Law.
        if Self::identity_everyday(&col, x, &self.mips) {
            return Ok(Consent::Identity);
        }
        // F127: an action cites, on the collective's chain, the decision it
        // acts under, and is judged under what its decisions leave in force.
        if let Some(reason) = self.uncited(&col, x, Some(b))? {
            return Ok(Consent::Uncited { reason });
        }
        let ag = self.in_force_action(&col, x, b, base)?.agreement;
        if let Some(reason) = self.not_done(x, &ag)? {
            return Ok(Consent::NotDone { agreement: ag, reason });
        }
        if self.is_law(x, types::IMPORT) {
            return Err(LawError::Unsupported("imports (type 11): the format is open"));
        }
        if let Some(rail) = self.rail_not_accepted(&col, &c, x, b)? {
            return Ok(Consent::RailNotAccepted { agreement: ag, rail });
        }
        let t = self.terms(&ag)?;
        let mut reaching: Vec<&Area> = vec![];
        // A revocation is judged, like the grant it names, by that grant's
        // area alone (rule 38a, Q29); it names a grant of this collective.
        if self.is_law(x, types::REVOCATION) {
            let r = match Revocation::decode(&x.inside.payload) {
                Ok(r) => r,
                Err(e) => return Ok(Consent::Invalid { agreement: ag, reason: e.to_string() }),
            };
            let g = self.v.get(&r.grant).filter(|g| self.is_law(g, types::GRANT));
            let Some(g) = g.and_then(|g| Grant::decode(&g.inside.payload).ok().map(|d| (g, d))) else {
                return Ok(Consent::Invalid { agreement: ag, reason: "it names no grant this verifier holds".into() });
            };
            if !(Self::own_key(&col, g.0) || self.founding_grant(&c, g.0)) {
                return Ok(Consent::Invalid { agreement: ag, reason: "it names a grant of another grantor".into() });
            }
            if let Some(a) = g.1.area.and_then(|id| t.area(id)) {
                reaching.push(a);
            }
        }
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
        // N7 (F124): a collective releasing a work, or signing its release,
        // decides by its own rules across the lanes of every layer a release
        // touches: Envelope, Finance and Law.
        if self.is_release_act(x) {
            for l in [layers::ENVELOPE_AND_TEXT, layers::FINANCE, layers::LAW] {
                if let Some(a) = t.lane(l) {
                    if !reaching.iter().any(|r| r.id == a.id) {
                        reaching.push(a);
                    }
                }
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

    /// A release (type 5), or a signature act naming one.
    fn is_release_act(&self, x: &Held) -> bool {
        self.is_law(x, types::RELEASE)
            || (self.is_law(x, types::SIGNATURE)
                && decode_signature(&x.inside)
                    .ok()
                    .and_then(|r| self.v.get(&r))
                    .is_some_and(|r| self.is_law(r, types::RELEASE)))
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

    /// Whether the grantee signed to accept the grant (F128): a valid
    /// signature act (type 1) of its own identity naming it.
    fn accepted(&self, gh: &Held, g: &Grant) -> bool {
        self.v.signed_by(&g.grantee).any(|h| {
            self.is_law(h, types::SIGNATURE)
                && decode_signature(&h.inside).ok() == Some(gh.id)
                && self.v.status(&h.id) == Status::Valid
        })
    }

    /// The services a deal's grants name, if they are well formed (F129,
    /// H4; F130, H6): field 14 and each group of its chain of judgment's
    /// link for the split service list, each, one grant per payee to one
    /// service: every grant held, naming this agreement by null and the
    /// group's one grantee, each signed by a distinct party; every group
    /// signed by the same payees as field 14, each to a service of its own.
    /// `None` otherwise: the deal then carries none of them (reading 3,
    /// fail closed). Field 14's service comes first, then those taking over,
    /// in order.
    fn deal_services(&self, t: &Terms) -> Option<Vec<Hash>> {
        let list = t.payee_grants.as_ref()?;
        let mut groups = vec![list.clone()];
        if let Some(l) = t.chain.iter().flatten().find(|l| l.judge == Judge::SplitService) {
            for (taker, _) in &l.next {
                match taker {
                    crate::law::Taker::Grants(g) => groups.push(g.clone()),
                    crate::law::Taker::One(_) => return None,
                }
            }
        }
        let mut services: Vec<Hash> = vec![];
        let mut payees: Option<Vec<Hash>> = None;
        for group in &groups {
            let mut grantee = None;
            let mut grantors: Vec<Hash> = vec![];
            for x in group {
                let xh = self.v.get(x).filter(|xh| self.is_law(xh, types::GRANT))?;
                let xg = Grant::decode(&xh.inside.payload).ok()?;
                let by = xh.act.outside.signer?;
                if !xg.this_agreement || grantors.contains(&by) || !t.parties.contains(&by) || *grantee.get_or_insert(xg.grantee) != xg.grantee {
                    return None;
                }
                grantors.push(by);
            }
            grantors.sort();
            if payees.get_or_insert_with(|| grantors.clone()) != &grantors {
                return None;
            }
            let service = grantee?;
            if services.contains(&service) {
                return None;
            }
            services.push(service);
        }
        Some(services)
    }

    /// The deals that carry a grant naming "this agreement" by null (F129,
    /// H4; F130, H6): held terms of a deal listing it in field 14, or in a
    /// group of its chain of judgment's link for the split service, which
    /// exist (every party signed them), its grantor among their parties,
    /// their grants well formed ([`Self::deal_services`]). "This
    /// agreement" is each such deal, with the versions it clones. With
    /// them, every service those deals name for the split service.
    fn carrying_deals(&self, gh: &Held, grantor: &Hash) -> R<(Vec<Hash>, Vec<Hash>)> {
        let mut out = vec![];
        let mut all_services = vec![];
        for h in self.v.held_acts() {
            if !self.is_law(h, types::TERMS) {
                continue;
            }
            let Ok(t) = self.terms(&h.id) else { continue };
            let listed = t.payee_grants.iter().flatten().any(|x| x == &gh.id)
                || t.chain
                    .iter()
                    .flatten()
                    .any(|l| l.judge == Judge::SplitService && l.successors().contains(&gh.id));
            if t.is_collective() || !listed || !t.parties.contains(grantor) {
                continue;
            }
            if self.agreement(&h.id)?.exists != Some(true) {
                continue;
            }
            let Some(services) = self.deal_services(&t) else { continue };
            for s in services {
                if !all_services.contains(&s) {
                    all_services.push(s);
                }
            }
            for (id, _) in self.lineage(&h.id)? {
                if !out.contains(&id) {
                    out.push(id);
                }
            }
        }
        Ok((out, all_services))
    }

    /// What keeps an act of a payee's grant key to a deal's split service,
    /// or to a service its chain of judgment names to take over, from being
    /// backed (F129, H4, H5; F130, H6), or nothing. The grant counts only
    /// through a deal its grantor signed that lists it ("signing the deal
    /// signs them"); its key is a split service's grant key
    /// ([`Self::split_key_problem`]).
    fn deal_grant_problem(&self, gh: &Held, g: &Grant, grantor: &Hash, y: &Held) -> R<Option<String>> {
        let (deals, mut services) = self.carrying_deals(gh, grantor)?;
        if deals.is_empty() {
            return Ok(Some(
                "the grant names this agreement, and no deal its grantor signed lists it, in field 14 or for a service taking over, with one grant per payee to one split service and to each service taking over (F129, H4; F130, H6)".into(),
            ));
        }
        if !services.contains(&g.grantee) {
            services.push(g.grantee);
        }
        Ok(self.split_key_problem(y, grantor, &deals, &services))
    }

    /// The services a collective's agreement names for its split service,
    /// in any version of the lineage of `agreement` or of the collective's
    /// current agreement (field 14 and its chain of judgment), if one of
    /// them names the grant `gh` (F130, H7): with the versions, its own
    /// claims and offers. The current lineage too, so that an act citing an
    /// older head than the version naming the service is held to the limit
    /// all the same.
    fn collective_split_grant(&self, collective: &Hash, agreement: &Hash, gh: &Hash) -> R<Option<(Vec<Hash>, Vec<Hash>)>> {
        let mut lineage = self.lineage(agreement)?;
        if let Some(cur) = self.current(collective)? {
            for (id, t) in self.lineage(&cur.agreement)? {
                if !lineage.iter().any(|(x, _)| *x == id) {
                    lineage.push((id, t));
                }
            }
        }
        let mut named = false;
        let mut services = vec![];
        for (_, t) in &lineage {
            let mut grants: Vec<Hash> = t.split_grant.iter().copied().collect();
            if let Some(l) = t.chain.iter().flatten().find(|l| l.judge == Judge::SplitService) {
                grants.extend(l.successors());
            }
            named |= grants.contains(gh);
            for x in grants {
                if let Some(s) = self.v.get(&x).and_then(|xh| Grant::decode(&xh.inside.payload).ok()).map(|xg| xg.grantee) {
                    if !services.contains(&s) {
                        services.push(s);
                    }
                }
            }
        }
        Ok(named.then(|| (lineage.into_iter().map(|(id, _)| id).collect(), services)))
    }

    /// What a split service's grant key may sign (F129, H5; F130, H7: one
    /// rule for every split service, whoever granted it, a person or a
    /// collective): only a Finance receipt for money coming in under the
    /// grantor's own claims and offers, received by the grantor: a purchase
    /// naming one of `own` (field 9), or a payment following one (field 5);
    /// never one whose payer is a split service the grantor's agreements
    /// name (`services`), nor a split's payout (a batch, or a split named
    /// in field 5 or `objects`). Narrower kinds the grantor named still
    /// apply, before this.
    fn split_key_problem(&self, y: &Held, grantor: &Hash, own: &[Hash], services: &[Hash]) -> Option<String> {
        use crate::finance::{self as fin, Payer, Payload as Fin};
        if y.inside.spec != self.mips.finance || y.inside.type_ != fin::types::RECEIPT {
            return Some("a split service's grant key signs only receipts for money coming in under its grantor's own claims and offers (F129, H5; F130, H7)".into());
        }
        let Ok(Fin::Receipt(r)) = Fin::decode(y.inside.type_, &y.inside.payload) else {
            return Some("the receipt does not decode".into());
        };
        if &r.payee != grantor {
            return Some("a split service's grant key signs only receipts its grantor received (F129, H5; F130, H7)".into());
        }
        if matches!(&r.payer, Some(Payer::Identity(p)) if services.contains(p)) {
            return Some(
                "a split service's grant key never signs a receipt whose payer is the split service itself (F129, H5; F130, H7; rule 29)".into(),
            );
        }
        let names_split = |x: &Hash| self.v.get(x).is_some_and(|h| self.is_law(h, types::SPLIT));
        let objects_split = y.inside.objects.iter().flatten().any(|o| names_split(&o.chain) || names_split(&o.predecessor));
        if r.batch.is_some() || names_split(&r.fulfils) || objects_split {
            return Some("a split service's grant key never signs a split's payout, one its grantor is owed (F129, H5; F130, H7; rule 29)".into());
        }
        let incoming = r.purchase.as_ref().is_some_and(|p| own.contains(&p.agreement)) || own.contains(&r.fulfils);
        if !incoming {
            return Some(
                "a split service's grant key signs only receipts for money coming in under its grantor's own claims and offers (in a deal, money coming into the deal): a purchase naming one, or a payment following one (F129, H5; F130, H7)".into(),
            );
        }
        None
    }

    /// The revocations of a grant that count (F128): decisions of the
    /// grantor, signed with its own key, naming the grant.
    fn revocations(&self, col: &Col, grant: &Hash) -> R<Vec<&'a Held>> {
        let mut out = vec![];
        for h in self.v.signed_by(&col.id) {
            if self.is_law(h, types::REVOCATION)
                && Self::own_key(col, h)
                && (h.act.outside.is_public() || (0..col.res.links.len()).any(|k| self.declares(col, k)))
                && Revocation::decode(&h.inside.payload).is_ok_and(|r| &r.grant == grant)
                && self.valid(&h.id)
                && self.consent(&h.id)?.counts()
            {
                out.push(h);
            }
        }
        Ok(out)
    }

    /// Whether an act signed with a grant key binds the collective whose key
    /// it is (rules 38a, 40, 44; F128). The grant counts (its area's
    /// holders, or the founding terms carrying it) and its grantee signed to
    /// accept it; the act cites its grant, is on the collective's chain,
    /// done, and within the grant's reach. A decision ending the grant's
    /// powers (a revocation, G1; a departure emptying its area, G2; a fork
    /// or closing) leaves it binding only where that decision's history
    /// holds it: otherwise the ending wins, and the act is void (the tie
    /// rule), unless the collective itself acknowledged it (rule 40, A6).
    pub fn backing(&self, act: &Hash) -> R<Backing> {
        let y = self.held(act)?;
        let Some(c) = y.act.outside.signer else {
            return Ok(Backing::NotUnderGrant);
        };
        let col = self.col(&c);
        if col.pos(y).is_some() {
            return Ok(Backing::NotUnderGrant);
        }
        let Some((gh, g)) = self.key_grant(y) else {
            return Ok(Backing::NotUnderGrant);
        };
        let not = |w: &str| {
            Ok(Backing::NotBacked {
                grant: gh.id,
                reason: w.into(),
            })
        };
        let founding = self.founding_grant(&c, gh);
        // F128, extended: any identity grants keys, a person as well as a
        // collective. A person's grant, and its revocation, are public
        // (reading: "scoped and visible"), since every verifier of the
        // grantee's acts must read them; a person has no members to seal to.
        let collective = (0..col.res.links.len()).any(|k| self.declares(&col, k));
        let counts = if !collective {
            self.valid(&gh.id) && gh.act.outside.is_public()
        } else if founding {
            // Carried by the founding terms every founder signed (D6).
            self.v.status(&gh.id) == Status::Valid
        } else {
            self.valid(&gh.id) && self.consent(&gh.id)?.counts()
        };
        if !counts {
            return not("the grant does not count");
        }
        if !self.accepted(gh, &g) {
            return not("the grantee has not signed to accept the grant (F128)");
        }
        // F128: the grantee's act cites the decision it acts under, its grant.
        if !Self::cites(y, &c).contains(&gh.id) {
            return not("it does not cite its grant on the collective's chain (F128)");
        }
        if let Some(w) = self.uncited(&col, y, None)? {
            return not(&w);
        }
        // A grant key never signs a decision: records, grants, revocations
        // and identity-chain acts are signed with the grantor's own key.
        if self.is_law(y, types::RECORD) || self.is_law(y, types::GRANT) || self.is_law(y, types::REVOCATION) {
            return not("a grant key signs no decision of its grantor (F128)");
        }
        let (spec, ty) = (&y.inside.spec, y.inside.type_);
        if collective {
            let Some(ag) = self.in_force(act)? else {
                return not("the grantor's agreement in force cannot be read");
            };
            // Reach: the act's kind lies within the grant's (rule 44).
            let t = self.terms(&ag)?;
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
            // Rule 38: the grant's scope (field 1), and the agreements it
            // names (field 2), limit what the key signs within its kinds.
            if let Some(w) = self.scope_problem(&g, y)? {
                return not(&w);
            }
            // F130, H7: a collective's split service, named by its field 14
            // or its chain of judgment, signs with its grant key only
            // receipts for money coming in under the collective's own claims
            // and offers; a collective's grant in a deal, as a payee's.
            if g.this_agreement {
                if let Some(w) = self.deal_grant_problem(gh, &g, &c, y)? {
                    return not(&w);
                }
            } else if let Some((own, services)) = self.collective_split_grant(&c, &ag, &gh.id)? {
                if let Some(w) = self.split_key_problem(y, &c, &own, &services) {
                    return not(&w);
                }
            }
            // F126: an act in the collective's name is done only once sealed
            // to every member.
            if let Some(w) = self.not_done(y, &ag)? {
                return not(&w);
            }
        } else {
            // A person's grant: its reach is the kinds it names (a MIP's
            // layer, or a type of a specification); naming none, every act
            // but a decision (reading).
            let within = match &g.kinds {
                Some(k) => k.iter().any(|k| match k {
                    Kind::Layer(l) => self.mips.layer(spec) == Some(*l),
                    Kind::Type { spec: s2, type_ } => s2 == spec && *type_ == ty,
                }),
                None => true,
            };
            if !within {
                return not("the act lies beyond the grant's reach (rule 44)");
            }
            if let Some(w) = self.scope_problem(&g, y)? {
                return not(&w);
            }
            // F129, H4 and H5: a payee's grant to a deal's split service.
            if g.this_agreement {
                if let Some(w) = self.deal_grant_problem(gh, &g, &c, y)? {
                    return not(&w);
                }
            }
        }
        // An adoption (rule 40): an act of the collective's own key that
        // counts, acknowledging it or citing it on the collective's chain.
        // F131 (IT2a): once such an act cites it, the act is adopted, and no
        // ending racing that citation voids it; the tie rule voids only
        // acts the collective never took on. "Cites" as a line does
        // (reading U3, confirmed, F132): the act lies in the citing act's
        // history, so citing the grantee's later act cites it too.
        // F142 (rule 42): an adopter is an action of the grantor's own key
        // that counts, done and on its chain; an Identity witness act, on
        // neither chain, adopts nothing.
        let on_chain = |a: &Held| a.inside.spec != self.mips.identity;
        let citing: Vec<&Held> = if collective {
            self.v
                .signed_by(&c)
                .filter(|a| a.id != y.id && Self::own_key(&col, a) && on_chain(a) && self.before_struct(&col, y, Line::Record(a)))
                .collect()
        } else {
            vec![]
        };
        let acked = |before: &dyn Fn(&Held) -> bool| -> R<bool> {
            for a in self.v.acknowledgements(act).into_iter().chain(citing.iter().copied()) {
                if Self::own_key(&col, a) && on_chain(a) && self.valid(&a.id) && before(a) && self.consent(&a.id)?.counts() {
                    return Ok(true);
                }
            }
            Ok(false)
        };
        let mut ended = false;
        // A fork or closing ends every grant (N14): every grant key ends at
        // its line. An act in the history it cites binds, as a debt the
        // fork hands out; so does a deal the original acknowledged before
        // it. Any other is missing from the ending's history, and void.
        // An act the ending's history holds still answers to the other
        // decisions ending its grant (rule 43): a revocation, or a departure
        // emptying its area, that does not hold it voids it, unless the
        // collective adopted it. Found by the Law invariants
        // (`docs/law-invariants.md`, IC3).
        if let Some(e) = self.closed_by(&c)? {
            if acked(&|a| self.before_line(&col, a, &e.chain_act, &e.tips))? {
                return Ok(Backing::Binds { grant: gh.id });
            }
            if !self.before_line(&col, y, &e.chain_act, &e.tips) {
                return not("the fork or closing that ended the grant does not cite it: an action missing from the ending's history is void (the tie rule, F127)");
            }
            ended = true;
        }
        // G1 (F128): a revocation removes the grant key, a decision ending
        // powers. An act its history holds was done within the grant's
        // powers; any other, racing it or after it, is void, the ending
        // winning, unless the collective itself acknowledged it (A6).
        for r in self.revocations(&col, &gh.id)? {
            if self.before_struct(&col, y, Line::Record(r)) {
                ended = true;
                continue;
            }
            if acked(&|_| true)? {
                return Ok(Backing::Binds { grant: gh.id });
            }
            return not("the revocation ended the grant, and its history does not hold the act: the ending wins (the tie rule, F128 G1)");
        }
        // G2 (F128): a departure emptying the grant's area ends every grant
        // in it, a decision ending powers: the same, with no suspension and
        // no undetermined act. A reinstatement is a new grant, and takes
        // nothing on.
        if let Some(area) = g.area {
            for l in self.freezes(&col, area)? {
                let here = match l {
                    Line::Record(_) => self.before(&col, gh, l)?,
                    Line::Rotation(_) => self.before_struct(&col, gh, l),
                };
                if !here {
                    continue;
                }
                if self.before_struct(&col, y, l) {
                    ended = true;
                    continue;
                }
                if acked(&|_| true)? {
                    return Ok(Backing::Binds { grant: gh.id });
                }
                return not("the departure that emptied the grant's area ended it, and that line's history does not hold the act: the ending wins (the tie rule, F128 G2)");
            }
        }
        // Rule 18d (audit, October 2026, gap 10): the grant's limits
        // (field 3), as the cMIP of field 4 defines them, are not read by
        // this verifier, which implements no limits cMIP: whether the act
        // lies within them is unknown, so the answer is, rather than
        // "backed". An adoption by the collective's own key (above) binds
        // whatever the limits say (rule 40).
        if g.limits.is_some() || g.limits_cmip.is_some() {
            if acked(&|_| true)? {
                return Ok(Backing::Binds { grant: gh.id });
            }
            return Ok(Backing::Unknown {
                grant: gh.id,
                reason: "the grant carries limits (fields 3 and 4, rule 18d) under a cMIP this verifier does not implement: whether the act lies within them cannot be read".into(),
            });
        }
        Ok(if ended { Backing::Binds { grant: gh.id } } else { Backing::Backed { grant: gh.id } })
    }

    /// What keeps an act from lying within its grant's scope (rule 38, grant
    /// field 1; audit, October 2026, gap 9), or nothing. Scope 0, signing
    /// new deals: the terms of a new agreement (no parent), or a signature
    /// act on such terms. Scope 1, managing named existing ones: an act that
    /// names one of the agreements of field 2, in any of its versions, or an
    /// act it names there (rule 40: an adopted act another grantee manages);
    /// "this agreement" (null) is judged by the deal carrying the grant
    /// (F129, [`Self::deal_grant_problem`]). Scope 2, acting for the grantor
    /// (posting, publishing, spending): any act within the grant's kinds but
    /// one on an agreement, which scopes 0 and 1 are for. A negotiation
    /// message is talk (F128, W6), binding nothing, and passes under every
    /// scope. *Readings, stated: which acts "sign a new deal", and that
    /// scope 2 covers no act on an agreement.*
    fn scope_problem(&self, g: &Grant, y: &Held) -> R<Option<String>> {
        if self.is_law(y, types::NEGOTIATION) {
            return Ok(None);
        }
        let new_terms = |x: &Held| self.is_law(x, types::TERMS) && Terms::decode(&x.inside.payload).is_ok_and(|t| t.parent.is_none());
        match g.scope {
            0 => {
                let new = new_terms(y)
                    || (self.is_law(y, types::SIGNATURE)
                        && decode_signature(&y.inside).ok().and_then(|s| self.v.get(&s)).is_some_and(new_terms));
                Ok((!new).then(|| {
                    "the grant's scope is signing new deals (field 1, scope 0): the act is neither the terms of a new agreement nor a signature act on them (rule 38)".into()
                }))
            }
            1 => {
                if g.this_agreement {
                    return Ok(None);
                }
                let Some(named) = &g.agreements else {
                    return Ok(Some("the grant's scope is managing named agreements (field 1, scope 1), and it names none (field 2; rule 38)".into()));
                };
                Ok((!self.concerns(y, named)?).then(|| {
                    "the grant's scope is managing the agreements it names (field 1, scope 1; field 2): the act names none of them, in any version (rule 38)".into()
                }))
            }
            2 => {
                let on_agreement = [
                    types::TERMS,
                    types::SIGNATURE,
                    types::RESIGNATION,
                    types::DECLARATION,
                    types::RELEASE,
                    types::FORK,
                    types::CLOSING,
                    types::SPLIT,
                ]
                .iter()
                .any(|t| self.is_law(y, *t));
                Ok(on_agreement.then(|| {
                    "the grant's scope is acting for its grantor (field 1, scope 2: posting, publishing, spending): signing a new deal or managing an agreement needs scope 0 or 1 (rule 38)".into()
                }))
            }
            _ => Ok(Some("a grant's scope is 0, 1 or 2 (rule 38)".into())),
        }
    }

    /// Whether an act names one of `named` (grant field 2, scope 1), in any
    /// version where a named act is an agreement: in its `objects`, or in a
    /// field the core decodes (a Finance obligation's agreement, a receipt's
    /// or claim's `fulfils` and purchase; a clone's parent, a signature act's
    /// act and what that act names, a split's agreement, a release's
    /// stakes).
    fn concerns(&self, y: &Held, named: &[Hash]) -> R<bool> {
        use crate::finance::Payload as Fin;
        let mut set: BTreeSet<Hash> = named.iter().copied().collect();
        for x in self.v.held_acts() {
            if self.is_law(x, types::TERMS) {
                if let Ok(l) = self.lineage(&x.id) {
                    if l.iter().any(|(i, _)| named.contains(i)) {
                        set.insert(x.id);
                    }
                }
            }
        }
        let names = |x: &Held| x.inside.objects.iter().flatten().any(|o| set.contains(&o.chain) || set.contains(&o.predecessor));
        if names(y) {
            return Ok(true);
        }
        if y.inside.spec == self.mips.finance {
            return Ok(match Fin::decode(y.inside.type_, &y.inside.payload) {
                Ok(Fin::Obligation(o)) => o.agreement.is_some_and(|a| set.contains(&a)),
                Ok(Fin::Receipt(r)) => set.contains(&r.fulfils) || r.purchase.is_some_and(|p| set.contains(&p.agreement)),
                Ok(Fin::Claim(c)) => set.contains(&c.fulfils) || c.purchase.is_some_and(|p| set.contains(&p.agreement)),
                _ => false,
            });
        }
        if self.is_law(y, types::TERMS) {
            return Ok(Terms::decode(&y.inside.payload).is_ok_and(|t| t.parent.is_some_and(|p| set.contains(&p))));
        }
        if self.is_law(y, types::SIGNATURE) {
            return Ok(decode_signature(&y.inside)
                .ok()
                .is_some_and(|s| set.contains(&s) || self.v.get(&s).is_some_and(names)));
        }
        if self.is_law(y, types::SPLIT) {
            return Ok(Split::decode(&y.inside.payload).is_ok_and(|s| set.contains(&s.agreement)));
        }
        if self.is_law(y, types::RELEASE) {
            return Ok(Release::decode(&y.inside).is_ok_and(|r| r.stakes.iter().any(|(a, _)| set.contains(a))));
        }
        Ok(false)
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
        for r in self.records_since(&col, b) {
            let e = self.record_eval(&col, r)?;
            if let Some(k) = e.puts {
                puts.push((k, e.resolves));
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
                DepartureKind::Resigned { agreement } | DepartureKind::Declared { agreement }
                    if lineage.contains(&agreement) =>
                {
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
            closed: self.closed_by(collective)?.map(|e| e.by),
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

/// Whether the collective's signing key cannot be produced without `p`
/// under this holding: its sole holder or custodian, or a share too few
/// others hold to meet the threshold without it (C7).
fn needed_to_sign(h: &Holding, p: &Hash) -> bool {
    match h {
        Holding::One(x) => x == p,
        Holding::Custodian { custodian, .. } => custodian == p,
        Holding::Shares { threshold, members } => {
            members.contains(p) && ((members.len() - 1) as u64) < *threshold
        }
    }
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
        Power::Judicial => Some((parent.parties.clone(), Rule::All)),
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

/// The key grammar a succession clone carries (Flaw B14): the parent's,
/// with the seat successors in the party's place in every holding, every
/// threshold unchanged.
fn plan_grammar(parent: &Terms, party: &Hash, seats: &[Hash]) -> Option<KeyGrammar> {
    let swap = |h: &Holding| match h {
        Holding::One(x) if x == party => Holding::One(seats[0]),
        Holding::Shares { threshold, members } => Holding::Shares {
            threshold: *threshold,
            members: members
                .iter()
                .flat_map(|m| if m == party { seats.to_vec() } else { vec![*m] })
                .collect(),
        },
        other => other.clone(),
    };
    parent.grammar.as_ref().map(|g| KeyGrammar {
        signing: swap(&g.signing),
        safety: swap(&g.safety),
        recovery: g.recovery.clone(),
    })
}

/// What Flaw B14's answer leaves open for a plan, refused rather than
/// guessed: a seat's voting weight other than one, which no rule counts; a
/// seat successor who is already a party; several successors to a holding
/// of one; a party who is a custodian or holds the recovery path.
fn plan_open(parent: &Terms, plan: &SuccessionPlan) -> Option<&'static str> {
    let seats = plan.seats.as_deref().unwrap_or_default();
    if seats.iter().any(|(_, w)| *w != 1) {
        return Some("a seat successor with a voting weight other than one: no rule counts weights (Flaw B14, its second remaining point)");
    }
    if seats.iter().any(|(h, _)| parent.parties.contains(h)) {
        return Some("a seat successor who is already a party: what taking the party's place in the keys then means is not written (Flaw B14)");
    }
    let p = &plan.party;
    if let Some(g) = &parent.grammar {
        for h in [&g.signing, &g.safety] {
            match h {
                Holding::One(x) if x == p && seats.len() != 1 => {
                    return Some("several seat successors to a key held by one: who takes that place is not written (Flaw B14)");
                }
                Holding::Custodian { custodian, .. } if custodian == p => {
                    return Some("a party who holds a key as custodian, under a grant: taking that place is not written (Flaw B14)");
                }
                _ => {}
            }
        }
        match &g.recovery {
            Some(Recovery::Custodian { custodian, .. }) if custodian == p => {
                return Some("a party who holds the recovery path: taking that place is not written (Flaw B14)");
            }
            Some(Recovery::Escrow { authority }) if authority == p => {
                return Some("a party who releases the escrowed share: taking that place is not written (Flaw B14)");
            }
            _ => {}
        }
    }
    None
}

// ---------------------------------------------------------------- negotiation (F118) and role-share evidence (F119)

/// A negotiation thread as a verifier holds it (rule 56, F118).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NegotiationRecord {
    /// The thread's first message.
    pub thread: Hash,
    /// The signer of the first message, then the other side once one of
    /// its messages is held.
    pub sides: Vec<Hash>,
    /// The messages of the record: valid negotiation messages whose chain of
    /// previous messages reaches the first one through messages of the
    /// thread, signed by its two sides only.
    pub messages: Vec<Hash>,
    /// The latest message that a message of the other side acknowledges:
    /// the record is proven complete up to it, every message before it
    /// fixed by the previous messages each names.
    pub complete_up_to: Option<Hash>,
    /// Two messages of the record naming the same previous message.
    pub forked: bool,
}

/// Which role a role share pays (Law rule 22).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Role {
    /// A rail Module the payment ran through, by its hash (F119).
    RailModule(Hash),
    /// Any other role: a referral, a delivery, a service's use (F116).
    Other,
}

impl<'a> LawView<'a> {
    /// A held negotiation message of this verifier's Law MIP, valid under
    /// Identity, with its decoded payload.
    fn negotiation_message(&self, id: &Hash) -> Option<(&'a Held, NegotiationMessage)> {
        let h = self.v.get(id)?;
        if !self.is_law(h, types::NEGOTIATION) || !self.valid(id) {
            return None;
        }
        NegotiationMessage::decode(&h.inside).ok().map(|m| (h, m))
    }

    /// The chain from the thread's first message to `id`, first message
    /// first, if every step is a valid negotiation message of the thread.
    fn negotiation_chain(&self, thread: &Hash, id: &Hash) -> Option<Vec<(Hash, Hash)>> {
        let mut out = vec![];
        let mut at = *id;
        let bound = self.v.held_acts().count();
        loop {
            let (h, m) = self.negotiation_message(&at)?;
            let signer = h.act.outside.signer?;
            out.push((at, signer));
            match m.follows {
                None if &at == thread => break,
                Some((t, prev)) if &t == thread && prev != at => at = prev,
                _ => return None,
            }
            if out.len() > bound {
                return None;
            }
        }
        out.reverse();
        Some(out)
    }

    /// The negotiation record of a thread, by its first message (rule 56,
    /// F118). Only negotiation messages count: a text act naming the thread,
    /// or a message following one, is no part of it.
    pub fn negotiation(&self, thread: &Hash) -> R<NegotiationRecord> {
        let (first, m) = self
            .negotiation_message(thread)
            .ok_or(LawError::Check("the thread's first message is not a valid negotiation message"))?;
        if m.follows.is_some() {
            return Err(LawError::Check("a thread's first message names no chain"));
        }
        let a = first.act.outside.signer.ok_or(LawError::Check("the act has no signer"))?;
        let mut chains: Vec<Vec<(Hash, Hash)>> = vec![];
        for h in self.v.held_acts() {
            if !self.is_law(h, types::NEGOTIATION) {
                continue;
            }
            if let Some(c) = self.negotiation_chain(thread, &h.id) {
                chains.push(c);
            }
        }
        // The other side: the first signer other than the first message's
        // along any chain, the nearest the first message.
        let b = chains
            .iter()
            .filter_map(|c| c.iter().position(|(_, s)| s != &a).map(|i| (i, c[i])))
            .min_by_key(|(i, (id, _))| (*i, *id))
            .map(|(_, (_, s))| s);
        let side_ok = |c: &Vec<(Hash, Hash)>| c.iter().all(|(_, s)| s == &a || Some(*s) == b);
        let mut messages: Vec<Hash> = vec![];
        let mut previous: BTreeMap<Hash, Hash> = BTreeMap::new();
        let mut forked = false;
        let mut best: Option<(usize, Hash)> = None;
        for c in chains.iter().filter(|c| side_ok(c)) {
            let (last, signer) = *c.last().expect("a chain holds its own message");
            if !messages.contains(&last) {
                messages.push(last);
                if c.len() > 1 {
                    let prev = c[c.len() - 2].0;
                    if previous.values().any(|p| p == &prev) {
                        forked = true;
                    }
                    previous.insert(last, prev);
                }
            }
            // What this message acknowledges: a message of the other side on
            // its own chain proves the record complete up to it.
            let (_, msg) = self.negotiation_message(&last).expect("held in the chain");
            if let Some(n) = msg.acks {
                if let Some(i) = c.iter().position(|(x, s)| x == &n && s != &signer) {
                    if best.is_none_or(|(d, _)| i > d) {
                        best = Some((i, n));
                    }
                }
            }
        }
        messages.sort();
        let mut sides = vec![a];
        sides.extend(b);
        Ok(NegotiationRecord {
            thread: *thread,
            sides,
            messages,
            complete_up_to: best.map(|(_, n)| n),
            forked,
        })
    }

    /// Whether the payee ever accepted a rail Module: a valid payee pointer
    /// it signed names it (for a collective, one that counts with its
    /// Finance lane), or a vault its identity chain declared does (Finance
    /// rule 12a, F115). *As for a collective's own receipts, which exact
    /// rail or entry a payment went to is in the rail's proof, which the
    /// payment cMIP reads.*
    pub fn accepts_rail(&self, payee: &Hash, rail: &Hash) -> R<bool> {
        use crate::finance::{self as fin, Payload as Fin};
        let finance = self.mips.finance;
        let res = self.v.resolve(payee);
        for state in &res.states {
            if let Ok(Some(Some(entries))) = fin::vault_in(&finance, &state.declarations) {
                if entries.iter().any(|e| &e.rail_module == rail) {
                    return Ok(true);
                }
            }
        }
        for h in self.v.signed_by(payee) {
            if h.inside.spec != finance || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(p)) = Fin::decode(h.inside.type_, &h.inside.payload) else {
                continue;
            };
            if &p.payee == payee
                && p.rails.iter().any(|r| &r.module == rail)
                && self.valid(&h.id)
                && self.consent(&h.id)?.counts()
            {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Whether an act is evidence for a role share in a split by
    /// `service` for `payee`, the identity the payment was made to (rules
    /// 19 and 22). For any role but a rail Module's, the evidence is a
    /// valid act signed by someone other than the service and the payee
    /// (F75, F116). For a rail Module's role share (F119), it is a valid
    /// receipt or claim naming that rail Module in its field 0, whoever
    /// signed it, the split service included, provided the payee's own
    /// pointer or vault names that Module (F115).
    pub fn role_evidence(&self, evidence: &Hash, role: &Role, service: &Hash, payee: &Hash) -> R<bool> {
        use crate::finance::Payload as Fin;
        let x = self.held(evidence)?;
        if !self.valid(evidence) {
            return Ok(false);
        }
        match role {
            Role::Other => {
                let s = x.act.outside.signer;
                Ok(s.is_some() && s.as_ref() != Some(service) && s.as_ref() != Some(payee))
            }
            Role::RailModule(module) => {
                if x.inside.spec != self.mips.finance {
                    return Ok(false);
                }
                let rail = match Fin::decode(x.inside.type_, &x.inside.payload) {
                    Ok(Fin::Receipt(r)) => r.rail,
                    Ok(Fin::Claim(c)) => c.rail,
                    _ => return Ok(false),
                };
                Ok(&rail == module && self.accepts_rail(payee, module)?)
            }
        }
    }
}

// ---------------------------------------------------------------- endings, money and the pointer (F121 to F123)

/// A fork act, judged (rule 47a, F121 shape B, F124).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ForkEval {
    pub id: Hash,
    pub fork: Fork,
    /// Complete: the members on its sides signed it, meeting the
    /// constitutional change rule (N1), each successor fits its side, and
    /// each successor a debt is assigned to signed it (N13), and it hands
    /// out every obligation in the history it cites (F127): the original is
    /// closed in Law.
    pub complete: bool,
    /// Why it is not complete, or not valid.
    pub why: Option<String>,
    /// The members whose voice remains at the fork.
    pub voices: Vec<Hash>,
    /// Those of them who signed it (its signer, or a signature act).
    pub signed: Vec<Hash>,
    /// Members whose voice remains who are on no side (N1): no seat in any
    /// successor, a departed holder of each at their percentage.
    pub leaving: Vec<Hash>,
    /// The default share of each side in every stake the original held, in
    /// millionths: by the stakes of its members in the original itself (Q8).
    pub shares: Vec<u64>,
    /// The original carries no stake in itself: the default fell to each
    /// member counting alike (N3).
    pub by_count: bool,
    /// Who every successor keeps as a departed holder, at their share of all
    /// its income: the original's departed holders and the members leaving.
    pub kept: Vec<(Hash, u64)>,
    /// For each side, its successor's founding agreement, where it fits.
    pub successors: Vec<Option<Hash>>,
    /// Obligations in the history the fork cites that it does not hand
    /// out: while any remains, the fork does not take effect (F127,
    /// replacing F125 D1's joint liability).
    pub unassigned: Vec<Hash>,
    /// Whether it is the ending that counts (F143): complete, and not made
    /// to count for nothing by an earlier final ending (F131, IT1). `None`
    /// while the ending is judged within that choice.
    pub counts: Option<bool>,
}

/// A closing act, judged (rule 47a, F124 N9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ClosingEval {
    pub id: Hash,
    pub closing: Closing,
    pub complete: bool,
    pub why: Option<String>,
    pub voices: Vec<Hash>,
    pub signed: Vec<Hash>,
    /// Stakes the collective still holds, by agreement and index.
    pub holds: Vec<(Hash, u64)>,
    /// What it owes (F125, D5): its own obligations that bind, before its
    /// line, and those it owes as a fork's successor, that receipts held do
    /// not fulfil in full and no creditor's release ends.
    pub open_debts: Vec<Hash>,
    /// Whether it is the ending that counts (F143): complete, and not made
    /// to count for nothing by an earlier final ending (F131, IT1). `None`
    /// while the ending is judged within that choice.
    pub counts: Option<bool>,
}

/// A creditor's release, judged (Finance type 4, F126; rule 47b).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DebtReleaseEval {
    pub id: Hash,
    pub release: crate::finance::Release,
    /// It ends the obligation: signed by the creditor the obligation names,
    /// a collective creditor's consent counting by its own rules, a Finance
    /// act reached by its Finance lane (F126, E2).
    pub counts: bool,
    pub why: Option<String>,
}

/// The act that ended a collective in Law, and the line it drew (N2, N9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Closed {
    pub by: Hash,
    pub chain_act: Hash,
    pub tips: Vec<KeptTip>,
    /// Where a fork ended it: the fork, judged.
    pub fork: Option<ForkEval>,
}

/// The ending signatures of one collective's forks and closings (F132): a
/// member signs an ending by a chain signature (Identity type 16), on its
/// identity chain with its safety key, so any two of one signer's ending
/// signatures are ordered by their positions there.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct EndingSigs {
    /// The signatures that count, by (ending, signer): the chain signature
    /// and its position in the signer's identity chain. Only one counting
    /// in the signer's chain is read, the earliest for each ending.
    pub counting: BTreeMap<(Hash, Hash), (Hash, u64)>,
    /// Signatures that count for nothing (U4): each lies, in its signer's
    /// chain, after the signer's signature on another ending naming the one
    /// it signs. By (ending, signer): the chain signature, and that other
    /// ending.
    pub void: BTreeMap<(Hash, Hash), (Hash, Hash)>,
    /// The endings each ending names directly: in its own `objects`, or
    /// through a signer's chain (U1): a signer's counting signature on it
    /// placed after the same signer's counting signature on the other.
    pub names: BTreeMap<Hash, BTreeSet<Hash>>,
    /// Fork and closing acts that are no ending (U4b): their drafter (the
    /// act's signer) signed, earlier in their own identity chain than their
    /// signature on it, another ending of the collective that it does not
    /// name in its `objects` (directly or through the endings it names
    /// there). Each with that other ending. Their signatures are left out
    /// of everything above.
    pub no_ending: BTreeMap<Hash, Hash>,
}

/// Where a pointer leads, for Law (rule 18, F123, F124 P2).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PointerCheck {
    /// The agreement names no split service.
    NoSplitService,
    /// Every address in the owners' pointer, and every entry of their vault
    /// in force, is in one service's own pointer and vault in force: the
    /// pointer counts for Law.
    Ordinary { pointer: Hash, service: Hash },
    /// Some address or vault entry is in no service's own: shown as
    /// bypassing the split service, never as an ordinary pointer.
    Bypasses {
        pointer: Hash,
        missing: Vec<crate::finance::Rail>,
        vault_missing: Vec<crate::finance::VaultEntry>,
    },
    /// What the check needs is not held, or a pointer chain is contested.
    Undetermined { reason: String },
}

/// A payout that does not match its stake (F124 N10, rule 26): paid more or
/// less than the holder's share of what the split pays that stake, beyond
/// one smallest unit of rounding per payout.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Mismatch {
    /// The stake, by its index in the agreement's field 7.
    pub stake: u64,
    /// Who was paid, or should have been.
    pub holder: Hash,
    pub paid: u64,
    /// Its exact share, rounded down.
    pub due: u64,
}

/// A split, judged for what Law checks of it (rules 20, 21, 26; Q9; N10).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SplitEval {
    pub id: Hash,
    pub split: Split,
    /// Whether its payouts sum exactly to the receipt's amount (rule 21);
    /// `None` when the receipt is not held.
    pub sums: Option<bool>,
    /// Each fee it takes: the module, who received it, how much (Q9).
    pub fees: Vec<(Hash, Hash, u64)>,
    /// Holders it pays to whom it was not delivered (Q9): neither among its
    /// recipients nor public.
    pub undelivered: Vec<Hash>,
    /// The collective whose agreement it pays, where found.
    pub collective: Option<Hash>,
    /// Payouts that do not match their stake (N10): any breaks the plan.
    pub mismatched: Vec<Mismatch>,
    /// What makes it no split of the service the owners named, under the
    /// agreement in force (rules 20, 26; audit, October 2026, gap 8): not
    /// signed by a split service the agreement in force names, with its
    /// own key; or naming a version that is not in force. Any entry breaks
    /// it; the payouts are still judged, against the stakes in force.
    pub problems: Vec<String>,
    /// The version in force, against which the payouts are judged: the
    /// latest version of the agreement the split names.
    pub in_force: Hash,
    /// Receivers of role payouts whose evidence does not hold (rule 22): no
    /// evidence named, not held, signed by the service or the payee, or,
    /// for a rail Module's share, a receipt or claim naming a Module the
    /// payee never published (F119). Such a share is earned by nothing.
    pub unevidenced: Vec<Hash>,
    /// Receivers of payouts that only the split plan could justify: a fee
    /// (rule 27) or a named receiver (rule 26). The plan's format is open
    /// (terms field 8), so the core cannot check them: shown, never passed
    /// as right.
    pub unplanned: Vec<Hash>,
}

/// What a split service owes (rule 29; audit, October 2026, gap 3): every
/// incoming receipt, and every payer's claim showing money arrived, without
/// a matching split, and every payout without the receiver's receipt, each
/// naming one receiver and one agreement (rule 55). What makes theft
/// provable from the receipts and the payers' claims (rule 31).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ServiceAccount {
    pub service: Hash,
    /// Money the service received for its grantors and never split (rules
    /// 20, 25, 30: the old service still owes on everything it received).
    pub unsplit: Vec<Unsplit>,
    /// Payouts of its splits that no receipt of the receiver discharges
    /// (rules 23, 24, 24a, 29).
    pub unpaid: Vec<Unpaid>,
}

/// An incoming payment with no split by the service (rules 20, 29).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Unsplit {
    /// The receipt the service signed with its grant key, or the payer's
    /// claim with the rail's answer, for which the grantor holds no receipt.
    pub payment: Hash,
    /// Whether `payment` is a payer's claim (true) or a receipt.
    pub claim: bool,
    /// The grantor the money came in for: the payee.
    pub receiver: Hash,
    /// The agreement the money came in under.
    pub agreement: Hash,
    pub amount: crate::finance::Amount,
}

/// A payout of a split with no receipt of its receiver naming the split
/// (rules 23, 29), or one for less (rule 24a: the plan's maximum fee is not
/// readable, its format open, so a shortfall stays open).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Unpaid {
    pub split: Hash,
    /// The payout's index in the split.
    pub payout: usize,
    pub receiver: Hash,
    pub agreement: Hash,
    pub amount: u64,
    /// What the receiver's receipts naming the split show received.
    pub received: u64,
}

/// A public domain release, judged (rule 17, F121 shape D, F124 N7, N11).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReleaseEval {
    pub id: Hash,
    pub release: Release,
    /// Its rule is met among the work's direct owners: the claim ends, at
    /// once, or at its point for a timed release.
    pub complete: bool,
    pub why: Option<String>,
    /// The direct owners of the work: the holders of each stake it ends, a
    /// collective among them by its own identity (N7).
    pub holders: Vec<Hash>,
    /// Those of them whose signature counts (a collective's by its rules,
    /// meeting the lanes of Envelope, Finance and Law).
    pub signed: Vec<Hash>,
}

impl ReleaseEval {
    /// Whether the claim has ended (N11): at once for a release naming no
    /// point; for a timed one, as the time reference says whether its
    /// point has passed (`None`: undetermined).
    pub fn ended(&self, point_passed: Option<bool>) -> Option<bool> {
        if !self.complete {
            return Some(false);
        }
        match self.release.timed {
            None => Some(true),
            Some(_) => point_passed,
        }
    }
}

/// A payment that reached the old split service of a collective a fork
/// closed, for one of its withdrawn offers: the service's open debt to the
/// work's current owners (F124 N14, rule 30), in the shares the fork act
/// What it is (F126).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PurchaseVerdict {
    /// A purchase: on a request rail, the claim its seller's request
    /// committed to, recorded by a collective seller's actions chain (F127
    /// W2, F128 W4); on a push rail, every holder's receipt a sale (W4).
    Purchase,
    /// No purchase: money received for nothing, owed back to the payer as a
    /// refund (Finance rule 10a; with no key committed, an open debt nobody
    /// can claim).
    NoPurchase { why: String },
    /// Not settled yet: on a request rail, a collective seller's actions
    /// chain has not recorded it (F127, W2); on a push rail, a holder the
    /// claim names has not signed its receipt (F128, W4). It becomes a sale
    /// once recorded, or is refunded where a receipt comes too late. Also
    /// where receipts of one payment name different claims and the rail has
    /// not yet shown which the payment committed to (F131, IT3).
    Unrecorded,
    /// A wrong receipt (F131, IT3): the payment's commitment names another
    /// claim than this receipt does. Shown as such; it counts for nothing,
    /// neither a sale nor a refund: the payment is judged by the receipts
    /// naming the claim it committed to.
    WrongReceipt { why: String },
}

/// An open question on a receiver (Finance rule 10, double entry): a valid
/// payer's claim its receiver has signed no matching receipt for.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Disagreement {
    /// No receipt names the claim's rail proof: the claim alone shows the
    /// money arrived.
    NoReceipt { claim: Hash },
    /// A receipt naming the same rail proof disagrees with the claim: in
    /// amount, payee or what the payment fulfils.
    Differs {
        claim: Hash,
        receipt: Hash,
        claimed: crate::finance::Amount,
        receipted: crate::finance::Amount,
        payee: bool,
        fulfils: bool,
    },
}

/// A payment for a work, judged (F126).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PurchaseEval {
    pub id: Hash,
    /// The claim it names, if any.
    pub purchase: Option<crate::finance::Purchase>,
    pub verdict: PurchaseVerdict,
    /// Who a refund would be owed to (Finance rule 10a).
    pub refund_to: crate::finance::RefundTo,
}

/// The constitutional change rule, counted among the voices that remain
/// (rule 44d), met by these signers.
fn constitution_met(t: &Terms, voices: &[Hash], signed: &[Hash]) -> bool {
    let rule = t.constitutional_rule();
    let counted: Vec<Hash> = rule.counted_among(&t.parties).into_iter().filter(|p| voices.contains(p)).collect();
    match rule.needed(counted.len()) {
        None => false,
        Some(n) => counted.iter().filter(|p| signed.contains(p)).count() >= n,
    }
}

impl<'a> LawView<'a> {
    // ------------------------------------------------------------ endings

    /// The collective whose agreement this is: the identity whose genesis
    /// declares the root of its lineage, where held. What null names in its
    /// terms (S1).
    pub fn collective_of(&self, agreement: &Hash) -> R<Option<Hash>> {
        let root = self.lineage(agreement)?.pop().expect("a lineage has a root").0;
        Ok(self.v.held_acts().find_map(|g| match &g.identity {
            Some(Ok(Payload::Genesis(gen)))
                if g.verdict == crate::sig::Verdict::Valid
                    && declared_in(gen.declarations.as_deref().unwrap_or(&[]), &self.law())
                        .and_then(|d| d.ok())
                        .is_some_and(|d| d.agreement == root) =>
            {
                Some(g.id)
            }
            _ => None,
        }))
    }

    /// The founding agreement a collective's genesis declares, where held.
    fn founding_of(&self, collective: &Hash) -> Option<Hash> {
        let res = self.v.resolve(collective);
        declared_in(&res.states.first()?.declarations, &self.law())?.ok().map(|d| d.agreement)
    }

    /// Whether the original's act `x` counts as made before a line drawn by
    /// a fork or closing (N2, F127): bound to an earlier link of its identity
    /// chain than the line's chain act, or, bound to it, in the history the
    /// tips it names cite (their sequences, and what the acts there cite on
    /// the collective's chain). A grantee's act on the chain is before it
    /// when that history reaches it.
    fn before_line(&self, col: &Col, x: &Held, chain_act: &Hash, tips: &[KeptTip]) -> bool {
        let Some(bf) = col.res.position_of(chain_act) else {
            return false;
        };
        if Self::own_key(col, x) {
            let Some(bx) = col.pos(x) else { return false };
            if bx != bf {
                return bx < bf;
            }
        }
        self.history(col, bf, &[], tips).acts.contains(&x.id)
    }

    /// The acts the history a fork or closing cites names but this verifier
    /// does not hold (F127): until it holds them, it cannot tell what that
    /// history holds.
    fn line_missing(&self, col: &Col, chain_act: &Hash, tips: &[KeptTip]) -> Vec<Hash> {
        let Some(bf) = col.res.position_of(chain_act) else {
            return vec![];
        };
        self.history(col, bf, &[], tips).missing.iter().copied().collect()
    }

    /// The agreement in force at a fork's or closing's line, and the members
    /// whose voice remains there; or why the line does not hold.
    fn at_line(&self, col: &Col, agreement: &Hash, chain_act: &Hash, tips: &[KeptTip]) -> R<Result<(Terms, Vec<Hash>), String>> {
        let Some(bf) = col.res.position_of(chain_act) else {
            return Ok(Err("it names a chain act of the collective that does not count".into()));
        };
        if tips.iter().any(|t| self.v.tip_line(&col.id, t).is_none()) {
            return Ok(Err("it names a kept tip of the collective that does not hold".into()));
        }
        if !self.declares(col, bf) {
            return Ok(Err("it does not name a collective".into()));
        }
        let base = match self.base(col, bf)? {
            Ok(b) => b,
            Err(w) => return Ok(Err(w)),
        };
        let mut puts = vec![];
        let mut departures = vec![];
        for k in 0..=bf {
            for r in self.records_at(col, k) {
                if !self.before_line(col, r, chain_act, tips) {
                    continue;
                }
                let re = self.record_eval(col, r)?;
                if re.line {
                    departures.extend(re.registers.iter().cloned());
                }
                if k >= self.declared_at(col, bf) {
                    if let Some(c) = re.puts {
                        puts.push((c, re.resolves));
                    }
                }
            }
        }
        let inf = self.fold(base, &puts)?;
        if &inf.agreement != agreement {
            return Ok(Err("it names an agreement other than the one in force at its line".into()));
        }
        let t = self.terms(agreement)?;
        let lineage: Vec<Hash> = self.lineage(agreement)?.into_iter().map(|(i, _)| i).collect();
        let mut gone = vec![];
        for d in &departures {
            if let DepartureKind::Resigned { agreement } | DepartureKind::Declared { agreement } = d.kind {
                if lineage.contains(&agreement) {
                    gone.push(d.party);
                }
            }
        }
        let voices = t.parties.iter().filter(|p| !gone.contains(p)).copied().collect();
        Ok(Ok((t, voices)))
    }

    /// Whether `who` signed `act`: by being its signer, or by a valid
    /// signature act naming it; a collective's signature counting only where
    /// its consent does (its own rules and lanes).
    fn signed_act(&self, act: &Held, who: &Hash) -> R<bool> {
        if act.act.outside.signer.as_ref() == Some(who) {
            return Ok(self.consent(&act.id)?.counts());
        }
        for (_, sid) in self.valid_sigs(&act.id, &[*who]) {
            if self.consent(&sid)?.counts() {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Whether an obligation binds its debtor (F66): signed by its debtor,
    /// and, where the debtor is a collective, only once done, like any act
    /// in its name (F128, withdrawing N13's public outside): publishing it
    /// is the creditor's choice and protection. `None` where the act is not
    /// an obligation.
    pub fn obligation_binds(&self, id: &Hash) -> R<Option<bool>> {
        use crate::finance::Payload as Fin;
        let x = self.held(id)?;
        if x.inside.spec != self.mips.finance {
            return Ok(None);
        }
        let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else {
            return Ok(None);
        };
        if !self.valid(id) || x.act.outside.signer != Some(o.debtor) {
            return Ok(Some(false));
        }
        let col = self.col(&o.debtor);
        let collective = (0..col.res.links.len()).any(|k| self.declares(&col, k));
        if !collective {
            return Ok(Some(true));
        }
        if self.done(id)? != Some(Ok(())) {
            return Ok(Some(false));
        }
        // An act in the collective's name binds it only where Law's consent
        // counts (rules 35b, 36a, 44): it cites the decision it acts under,
        // its area's holders signed it (the Finance lane, for a debt), and,
        // signed with a grant key, its grant backs it. Found by the Law
        // invariants (`docs/law-invariants.md`, IC1).
        if !self.consent(id)?.counts() {
            return Ok(Some(false));
        }
        // The tie rule (F127): an obligation outside the history of the fork
        // or closing that ended its debtor was made with powers that were
        // ending, and is void.
        Ok(Some(self.after_closing(id)?.is_none()))
    }

    /// Whether an act in a collective's name is done (F126, F128): sealed to
    /// every member of the agreement in force for it (public, or every
    /// member among its recipients). Where it is held is never a condition
    /// (F128: relays are transport); that it is on the collective's chain,
    /// citing its head, is [`Consent::Uncited`]. `None` where the act is not
    /// in a collective's name: signed neither with a collective's own key
    /// nor with a grant key of its.
    pub fn done(&self, act: &Hash) -> R<Option<Result<(), String>>> {
        let x = self.held(act)?;
        if x.act.outside.signer.is_none() {
            return Ok(None);
        }
        let agreement = match self.in_force(act) {
            Ok(Some(a)) => a,
            _ => return Ok(None),
        };
        Ok(Some(match self.not_done(x, &agreement)? {
            None => Ok(()),
            Some(w) => Err(w),
        }))
    }

    /// Why an act in the name of the collective whose agreement in force is
    /// `agreement` is not done (F126, F128), if it is not.
    fn not_done(&self, x: &Held, agreement: &Hash) -> R<Option<String>> {
        let t = self.terms(agreement)?;
        if !self.sealed_to_all(x, &t) {
            let to = x.act.outside.to.clone().unwrap_or_default();
            let missing = t.parties.iter().filter(|p| !to.contains(p)).count();
            return Ok(Some(format!(
                "not done: it is not sealed to every member ({missing} missing), nor public, so it binds no one (F126)"
            )));
        }
        Ok(None)
    }

    /// What a fork must hand out (F127, F126 item 2 rewritten): every
    /// obligation in the history it cites, paid or not, so that whether a
    /// fork took effect never changes with what happens after it (reading):
    /// the original's own, published or
    /// not, unless sealed neither to every member nor publicly, which is
    /// never the collective's (F126); and every obligation an earlier fork
    /// assigned to it, where its own signature act on that fork lies in
    /// that history (F125 reading 4, as adjusted in F126).
    fn to_hand_out(&self, col: &Col, t: &Terms, chain_act: &Hash, tips: &[KeptTip]) -> R<Vec<Hash>> {
        use crate::finance::Payload as Fin;
        let mut out = vec![];
        for x in self.v.signed_by(&col.id) {
            if x.inside.spec != self.mips.finance || !self.valid(&x.id) {
                continue;
            }
            let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else { continue };
            // F144 (reworded after the review of F133 to F144): an
            // obligation is handed out only if it binds the collective:
            // done (sealed to every member or public, and on its chain,
            // rules 35a and 35b) and within its signer's powers, or adopted
            // (rules 40 and 42). One that binds no one cannot block a fork,
            // and stays visible as what it is.
            let _ = t;
            if o.debtor == col.id && self.obligation_binds(&x.id)? == Some(true) && self.before_line(col, x, chain_act, tips) {
                out.push(x.id);
            }
        }
        for y in self.v.held_acts() {
            if !self.is_law(y, types::FORK) || y.id == col.id {
                continue;
            }
            let Ok(f0) = Fork::decode(&y.inside) else { continue };
            let Some(side) = f0.sides.iter().position(|s| s.successor == col.id) else { continue };
            let signed = self
                .valid_sigs(&y.id, &[col.id])
                .iter()
                .filter_map(|(_, s)| self.v.get(s))
                .any(|s| self.before_line(col, s, chain_act, tips));
            if !signed || !self.fork(&y.id)?.complete {
                continue;
            }
            for (d, sides) in &f0.debts {
                if sides.contains(&(side as u64)) && !out.contains(d) {
                    out.push(*d);
                }
            }
        }
        Ok(out)
    }

    /// What a fork of `collective` drawing its line at `chain_act` and `tips`
    /// must hand out (F127), for a client preparing one; `None` where the
    /// line does not hold.
    pub fn hand_out(&self, collective: &Hash, agreement: &Hash, chain_act: &Hash, tips: &[KeptTip]) -> R<Option<Vec<Hash>>> {
        let col = self.col(collective);
        let Ok((t, _)) = self.at_line(&col, agreement, chain_act, tips)? else {
            return Ok(None);
        };
        Ok(Some(self.to_hand_out(&col, &t, chain_act, tips)?))
    }

    /// The acts the history a line drawn at `chain_act` and `tips` would
    /// cite that this verifier does not hold: until it holds them, a fork or
    /// closing drawn there is not complete for it (F127). A member's client
    /// signs no ending while any is missing (F131, IT2b, client
    /// conformance).
    pub fn line_unheld(&self, collective: &Hash, chain_act: &Hash, tips: &[KeptTip]) -> Vec<Hash> {
        self.line_missing(&self.col(collective), chain_act, tips)
    }

    /// Every fork and closing of a collective this verifier holds, complete
    /// or not, in id order: what a new ending names (F131, IT1, client
    /// conformance).
    pub fn ending_acts(&self, collective: &Hash) -> Vec<Hash> {
        let mut out: Vec<Hash> = self
            .v
            .held_acts()
            .filter(|x| {
                (self.is_law(x, types::FORK) && Fork::decode(&x.inside).is_ok_and(|f| &f.collective == collective))
                    || (self.is_law(x, types::CLOSING) && Closing::decode(&x.inside).is_ok_and(|c| &c.collective == collective))
            })
            .map(|x| x.id)
            .collect();
        out.sort();
        out
    }

    /// Whether an act is sealed to every party of `t`, or public (F126).
    fn sealed_to_all(&self, x: &Held, t: &Terms) -> bool {
        x.act.outside.content_key.is_some()
            || t.parties.iter().all(|p| x.act.outside.to.iter().flatten().any(|q| q == p))
    }

    /// A fork act, judged.
    pub fn fork(&self, id: &Hash) -> R<ForkEval> {
        let h = self.held(id)?;
        if !self.is_law(h, types::FORK) {
            return Err(LawError::Check("not a fork act"));
        }
        let collective = Fork::decode(&h.inside)?.collective;
        let (mut e, nested) = self.on_own_history(&collective, |v| v.fork_inner(id))?;
        if !nested {
            e.counts = Some(e.complete && self.closed_by(&collective)?.is_some_and(|c| &c.by == id));
        }
        Ok(e)
    }

    /// Judges an ending on its own history (F143): while `f` runs, no
    /// ending of the collective is in force, as during the choice of the
    /// one that counts (`closed_by`), so the answer is the same whenever
    /// a verifier asks. Returns whether the judgment was already nested in
    /// that choice.
    fn on_own_history<T>(&self, collective: &Hash, f: impl FnOnce(&Self) -> R<T>) -> R<(T, bool)> {
        let nested = !self.ending.borrow_mut().insert(*collective);
        let r = f(self);
        if !nested {
            self.ending.borrow_mut().remove(collective);
        }
        Ok((r?, nested))
    }

    fn fork_inner(&self, id: &Hash) -> R<ForkEval> {
        let h = self.held(id)?;
        let f = Fork::decode(&h.inside)?;
        let mut e = ForkEval {
            id: *id,
            fork: f.clone(),
            complete: false,
            why: None,
            voices: vec![],
            signed: vec![],
            leaving: vec![],
            shares: vec![],
            by_count: false,
            kept: vec![],
            successors: vec![None; f.sides.len()],
            unassigned: vec![],
            counts: None,
        };
        let fail = |mut e: ForkEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the fork act is not valid under Identity");
        }
        let col = self.col(&f.collective);
        let (t, voices) = match self.at_line(&col, &f.agreement, &f.chain_act, &f.tips)? {
            Ok(x) => x,
            Err(w) => return fail(e, &format!("the fork: {w}")),
        };
        e.voices = voices.clone();
        e.leaving = voices.iter().filter(|v| f.side_of(v).is_none()).copied().collect();
        // Each member's percentage of all the original's income: its stake
        // in itself (Q8, N5), else each member alike (N3).
        let own = t.own_stake().map(|(_, s)| s.clone());
        let alike = divide_first(MILLION, &vec![1; voices.len()]);
        let pct = |m: &Hash| -> u64 {
            match &own {
                Some(st) => st.share_of(&Who::Id(*m)),
                None => voices.iter().position(|v| v == m).map_or(0, |i| alike[i]),
            }
        };
        let mut weights: Vec<u64> = f.sides.iter().map(|s| s.members.iter().map(&pct).sum()).collect();
        if own.is_none() || weights.iter().sum::<u64>() == 0 {
            e.by_count = own.is_none();
            weights = f.sides.iter().map(|s| s.members.len() as u64).collect();
        }
        e.shares = divide_first(MILLION, &weights);
        for d in t.departed.iter().flatten() {
            e.kept.push((*d, pct(d)));
        }
        for m in &e.leaving {
            e.kept.push((*m, pct(m)));
        }
        // W5 (F128): a fork counts only once done: sealed to every member,
        // or public, as it cites the collective's head by its line.
        if !self.sealed_to_all(h, &t) {
            return fail(e, "not done: the fork is not sealed to every member, nor public (W5, F128)");
        }
        if f.sides.iter().any(|s| s.members.iter().any(|m| !voices.contains(m))) {
            return fail(e, "a side lists someone who is not a member whose voice remains at the fork");
        }
        let signer = h.act.outside.signer.ok_or(LawError::Check("a fork act has a signer"))?;
        if f.side_of(&signer).is_none() {
            return fail(e, "the fork act is signed by someone on no side");
        }
        let members: Vec<Hash> = f.sides.iter().flat_map(|s| s.members.iter()).copied().collect();
        e.signed = self.ending_signed(&f.collective, id, &members);
        if let Some(y) = self.ending_sigs(&f.collective).no_ending.get(id) {
            return fail(e, &format!("no fork: its signer signed another ending of the collective, {}, earlier on their own chain, and the fork does not name it in its objects (F132, U4b)", y.iter().map(|b| format!("{b:02x}")).collect::<String>()));
        }
        // Successors (N4): each side founded its collective first; its
        // founding terms have that side's members as parties, and keep every
        // departed holder and every member leaving at their percentage.
        for (i, side) in f.sides.iter().enumerate() {
            let Some(ag) = self.founding_of(&side.successor) else { continue };
            let Ok(st) = self.terms(&ag) else { continue };
            let mut a = st.parties.clone();
            let mut b2 = side.members.clone();
            a.sort();
            b2.sort();
            let own2 = st.own_stake().map(|(_, s)| s);
            let keeps = e.kept.iter().all(|(h, n)| {
                own2.is_some_and(|s| s.share_of(&Who::Id(*h)) == *n) && st.departed.iter().flatten().any(|d| d == h)
            });
            if st.is_collective() && st.parent.is_none() && a == b2 && keeps {
                e.successors[i] = Some(ag);
            }
        }
        if e.signed.len() < members.len() {
            return fail(
                e,
                "every member on a side signs the fork, with their own identity (F121), by a chain signature with their safety key (F132); a signature placed after the signer's own signature on an ending naming this one counts for nothing (U4)",
            );
        }
        if !constitution_met(&t, &voices, &e.signed) {
            return fail(e, "the fork follows the constitutional change rule, every member by default (N1)");
        }
        if let Some(i) = e.successors.iter().position(|s| s.is_none()) {
            return fail(
                e,
                &format!("side {i}'s successor is not held, or its founding terms do not have that side's members as parties, keeping every departed holder and member leaving at their share (N4)"),
            );
        }
        // Debts (N13; F127, replacing F125 D1): the fork cites its history
        // (its line) and hands out everything in it, or does not take
        // effect; each successor a debt is assigned to signs for it. What is
        // missing from that history is void (the tie rule): no successor
        // owes it.
        let missing = self.line_missing(&col, &f.chain_act, &f.tips);
        if !missing.is_empty() {
            return fail(
                e,
                &format!("{} act(s) in the history the fork cites are not held: until they are, what it must hand out cannot be told (F127)", missing.len()),
            );
        }
        e.unassigned = self
            .to_hand_out(&col, &t, &f.chain_act, &f.tips)?
            .into_iter()
            .filter(|x| !f.debts.iter().any(|(d, _)| d == x))
            .collect();
        if !e.unassigned.is_empty() {
            return fail(
                e,
                "the fork hands out every obligation in the history it cites, or does not take effect (F127)",
            );
        }
        let mut owing: Vec<u64> = f.debts.iter().flat_map(|(_, s)| s.iter().copied()).collect();
        owing.sort();
        owing.dedup();
        for i in owing {
            if !self.signed_act(h, &f.sides[i as usize].successor)? {
                return fail(e, &format!("side {i}'s successor signs for the debts the fork assigns to it (N13)"));
            }
        }
        e.complete = true;
        Ok(e)
    }

    /// Stakes a collective holds in what this verifier holds: stakes of
    /// latest versions of agreements naming it as a holder (by its identity,
    /// or by null in its own terms), other than of its own income, whose
    /// work is not released. *A stake sold by a transfer (type 4, format
    /// open) is not seen.*
    fn holdings(&self, col: &Col, chain_act: &Hash, tips: &[KeptTip]) -> R<Vec<(Hash, u64)>> {
        let collective = &col.id;
        let mut parents = BTreeSet::new();
        let mut terms = vec![];
        for x in self.v.held_acts() {
            if !self.is_law(x, types::TERMS) {
                continue;
            }
            let Ok(t) = self.terms(&x.id) else { continue };
            if let Some(p) = t.parent {
                parents.insert(p);
            }
            terms.push((x.id, t));
        }
        let mut out = vec![];
        for (id, t) in terms {
            if parents.contains(&id) {
                continue;
            }
            let this = if t.is_collective() { self.collective_of(&id)? } else { None };
            for (i, st) in t.stakes.iter().flatten().enumerate() {
                if st.object == Who::This {
                    continue;
                }
                if !st.holders.iter().any(|(h, _)| h.resolve(this.as_ref()) == Some(*collective)) {
                    continue;
                }
                // Released, the collective's own consent to it placed before
                // the line: a release it signs after its line counts for
                // nothing (rule 47a).
                let released = match st.object {
                    Who::Id(w) => match self.released(&w)? {
                        Some(r) if r.release.stakes.contains(&(id, i as u64)) => {
                            let rh = self.held(&r.id)?;
                            let mine: Vec<&Held> = std::iter::once(rh)
                                .filter(|x| x.act.outside.signer.as_ref() == Some(collective))
                                .chain(self.valid_sigs(&r.id, &[*collective]).iter().filter_map(|(_, s)| self.v.get(s)))
                                .collect();
                            mine.iter().any(|x| self.before_line(col, x, chain_act, tips))
                        }
                        _ => false,
                    },
                    Who::This => false,
                };
                if !released {
                    out.push((id, i as u64));
                }
            }
        }
        Ok(out)
    }

    /// A closing act, judged (N9).
    pub fn closing(&self, id: &Hash) -> R<ClosingEval> {
        let h = self.held(id)?;
        if !self.is_law(h, types::CLOSING) {
            return Err(LawError::Check("not a closing act"));
        }
        let collective = Closing::decode(&h.inside)?.collective;
        let (mut e, nested) = self.on_own_history(&collective, |v| v.closing_inner(id))?;
        if !nested {
            e.counts = Some(e.complete && self.closed_by(&collective)?.is_some_and(|c| &c.by == id));
        }
        Ok(e)
    }

    fn closing_inner(&self, id: &Hash) -> R<ClosingEval> {
        let h = self.held(id)?;
        let c = Closing::decode(&h.inside)?;
        let mut e = ClosingEval {
            id: *id,
            closing: c.clone(),
            complete: false,
            why: None,
            voices: vec![],
            signed: vec![],
            holds: vec![],
            open_debts: vec![],
            counts: None,
        };
        let fail = |mut e: ClosingEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the closing act is not valid under Identity");
        }
        let col = self.col(&c.collective);
        let (t, voices) = match self.at_line(&col, &c.agreement, &c.chain_act, &c.tips)? {
            Ok(x) => x,
            Err(w) => return fail(e, &format!("the closing: {w}")),
        };
        e.voices = voices.clone();
        // W5 (F128): a closing counts only once done.
        if !self.sealed_to_all(h, &t) {
            return fail(e, "not done: the closing is not sealed to every member, nor public (W5, F128)");
        }
        let signer = h.act.outside.signer.ok_or(LawError::Check("a closing act has a signer"))?;
        e.signed = self.ending_signed(&c.collective, id, &voices);
        if let Some(y) = self.ending_sigs(&c.collective).no_ending.get(id) {
            return fail(e, &format!("no closing: its signer signed another ending of the collective, {}, earlier on their own chain, and the closing does not name it in its objects (F132, U4b)", y.iter().map(|b| format!("{b:02x}")).collect::<String>()));
        }
        e.holds = self.holdings(&col, &c.chain_act, &c.tips)?;
        e.open_debts = self.open_debts(&col, Some((&c.chain_act, &c.tips)))?;
        if !voices.contains(&signer) {
            return fail(e, "the closing act is signed by someone who is not a member whose voice remains");
        }
        if !e.signed.contains(&signer) {
            return fail(e, "the closing's signer signs it too, by a chain signature with their safety key (F132)");
        }
        if !constitution_met(&t, &voices, &e.signed) {
            return fail(e, "a closing follows the constitutional change rule, every member by default (N9), each signing by a chain signature with their safety key (F132)");
        }
        if !e.holds.is_empty() {
            return fail(e, "a closing ends only a collective that holds nothing: every work sold or released (N9)");
        }
        if !e.open_debts.is_empty() {
            return fail(
                e,
                "a collective cannot close while it owes anything: every debt paid or released by its creditor (F125, D5); one that cannot pay stays open, its debts visible",
            );
        }
        e.complete = true;
        Ok(e)
    }

    /// The act that ended a collective in Law, if any (rule 47a): its one
    /// complete fork or closing that counts. A complete ending is final
    /// (F131, IT1): a later ending of the same collective, one that names it
    /// (`ending_knows`: in its `objects`, or through a signer's chain,
    /// F132 U1), counts for nothing. Two complete endings sharing no signer
    /// and neither naming the other are concurrent, made without knowing
    /// each other: neither counts (F125 reading 4, narrowed by F131 and
    /// F132 to that case), until an ending naming both settles the race
    /// (U2, confirmed, F132). Two endings each naming the other, through
    /// two signers' chains, are not ordered either.
    pub fn closed_by(&self, collective: &Hash) -> R<Option<Closed>> {
        // Judging a fork or closing asks for the consent of acts of the same
        // collective (its signature on a release, say), made before its line:
        // while it is judged, nothing has ended it yet (F143: an ending is
        // judged on its own history, whenever a verifier asks, so the
        // guard comes before the cache).
        if self.ending.borrow().contains(collective) {
            return Ok(None);
        }
        if let Some(e) = self.closed.borrow().get(collective) {
            return Ok(e.clone());
        }
        self.ending.borrow_mut().insert(*collective);
        let e = self.closed_by_inner(collective);
        self.ending.borrow_mut().remove(collective);
        let e = e?;
        self.closed.borrow_mut().insert(*collective, e.clone());
        Ok(e)
    }

    /// Every complete fork and closing of a collective.
    pub fn endings(&self, collective: &Hash) -> R<Vec<Closed>> {
        let mut out = vec![];
        for x in self.v.held_acts() {
            if self.is_law(x, types::FORK) {
                if !Fork::decode(&x.inside).is_ok_and(|f| &f.collective == collective) {
                    continue;
                }
                let e = self.fork(&x.id)?;
                if e.complete {
                    out.push(Closed { by: x.id, chain_act: e.fork.chain_act, tips: e.fork.tips.clone(), fork: Some(e) });
                }
            } else if self.is_law(x, types::CLOSING) {
                if !Closing::decode(&x.inside).is_ok_and(|c| &c.collective == collective) {
                    continue;
                }
                let e = self.closing(&x.id)?;
                if e.complete {
                    out.push(Closed { by: x.id, chain_act: e.closing.chain_act, tips: e.closing.tips.clone(), fork: None });
                }
            }
        }
        Ok(out)
    }

    fn closed_by_inner(&self, collective: &Hash) -> R<Option<Closed>> {
        let all = self.endings(collective)?;
        let knows: Vec<BTreeSet<Hash>> = all.iter().map(|e| self.ending_knows(collective, &e.by)).collect();
        // An ending is ordered against every other complete one when it
        // names it or is named by it; those form one line, and the earliest
        // of them is the one that counts: every later one names it, and
        // counts for nothing (F131, IT1). Where none is ordered against all
        // the others, some two are concurrent, and none counts.
        let ordered: Vec<usize> = (0..all.len())
            .filter(|i| (0..all.len()).all(|j| j == *i || knows[*i].contains(&all[j].by) || knows[j].contains(&all[*i].by)))
            .collect();
        let first = ordered.iter().copied().find(|i| !ordered.iter().any(|j| j != i && knows[*i].contains(&all[*j].by)));
        Ok(first.map(|i| all[i].clone()))
    }

    /// The forks and closings of a collective that an ending act names,
    /// directly or through the endings it names (F131, IT1): an `objects`
    /// entry whose predecessor is another fork or closing of the same
    /// collective, `[agreement, ending]`, its chain the agreement; or,
    /// through a signer's own chain (F132, U1), another ending the same
    /// member signed earlier in their identity chain. A later ending names
    /// every earlier one it holds (client conformance). Acts are immutable;
    /// two endings may still name each other through two signers' chains,
    /// and then neither is the earlier.
    pub fn ending_knows(&self, collective: &Hash, ending: &Hash) -> BTreeSet<Hash> {
        let sigs = self.ending_sigs(collective);
        closure(&sigs.names, ending)
    }

    /// The forks and closings of a collective an ending names in its own
    /// `objects`, directly.
    pub fn ending_objects(&self, collective: &Hash, ending: &Hash) -> BTreeSet<Hash> {
        let mut out = BTreeSet::new();
        let Some(h) = self.v.get(ending) else { return out };
        for o in h.inside.objects.iter().flatten() {
            let p = o.predecessor;
            if p == *ending {
                continue;
            }
            let Some(ph) = self.v.get(&p) else { continue };
            let of_this = (self.is_law(ph, types::FORK) && Fork::decode(&ph.inside).is_ok_and(|f| &f.collective == collective))
                || (self.is_law(ph, types::CLOSING) && Closing::decode(&ph.inside).is_ok_and(|c| &c.collective == collective));
            if of_this {
                out.insert(p);
            }
        }
        out
    }

    /// The members who signed an ending, among `among`, in that order: each
    /// by a chain signature that counts (F132, U1 refined), not made void
    /// by U4.
    pub fn ending_signed(&self, collective: &Hash, ending: &Hash, among: &[Hash]) -> Vec<Hash> {
        let sigs = self.ending_sigs(collective);
        among.iter().filter(|m| sigs.counting.contains_key(&(*ending, **m))).copied().collect()
    }

    /// A collective's ending signatures, judged (F132).
    ///
    /// Every chain signature (Identity type 16) naming a fork or closing of
    /// the collective that counts in its signer's identity chain is read, at
    /// its position there. Then U4: a signature counts for nothing where it
    /// lies, in its signer's chain, after the signer's signature on another
    /// ending naming the one it signs. "Names" is judged in two steps, so
    /// that no signature both judges and is judged (reading, to confirm):
    /// first by `objects`; then, among the signatures left, through
    /// signers' chains (U1). The endings named through signers' chains are
    /// read from the signatures left after both steps.
    pub fn ending_sigs(&self, collective: &Hash) -> Rc<EndingSigs> {
        if let Some(s) = self.ending_sigs.borrow().get(collective) {
            return s.clone();
        }
        let s = Rc::new(self.ending_sigs_inner(collective));
        self.ending_sigs.borrow_mut().insert(*collective, s.clone());
        s
    }

    fn ending_sigs_inner(&self, collective: &Hash) -> EndingSigs {
        let endings: BTreeSet<Hash> = self.ending_acts(collective).into_iter().collect();
        let mut raw: BTreeMap<(Hash, Hash), (Hash, u64)> = BTreeMap::new();
        for x in self.v.held_acts() {
            if x.inside.spec != self.mips.identity || x.inside.type_ != crate::identity::types::CHAIN_SIGNATURE {
                continue;
            }
            let (Some(Ok(Payload::ChainSignature(c))), Some(signer)) = (&x.identity, x.act.outside.signer) else {
                continue;
            };
            if !endings.contains(&c.signs) {
                continue;
            }
            let Some(p) = self.v.resolve(&signer).position_of(&x.id) else { continue };
            let p = p as u64;
            let e = raw.entry((c.signs, signer)).or_insert((x.id, p));
            if p < e.1 {
                *e = (x.id, p);
            }
        }
        let objects: BTreeMap<Hash, BTreeSet<Hash>> =
            endings.iter().map(|e| (*e, self.ending_objects(collective, e))).collect();
        // U4b: an ending's drafter names, in its `objects`, every ending of
        // the collective they signed earlier on their own chain; otherwise
        // it is no ending, and its signatures count for nothing.
        let mut no_ending = BTreeMap::new();
        for e in &endings {
            let Some(d) = self.v.get(e).and_then(|h| h.act.outside.signer) else { continue };
            let Some((_, p)) = raw.get(&(*e, d)) else { continue };
            let named = closure(&objects, e);
            if let Some(((y, _), _)) = raw.iter().find(|((y, m), (_, q))| *m == d && y != e && q < p && !named.contains(y)) {
                no_ending.insert(*e, *y);
            }
        }
        raw.retain(|(e, _), _| !no_ending.contains_key(e));
        let objects: BTreeMap<Hash, BTreeSet<Hash>> = objects
            .into_iter()
            .filter(|(e, _)| !no_ending.contains_key(e))
            .map(|(e, s)| (e, s.into_iter().filter(|x| !no_ending.contains_key(x)).collect()))
            .collect();
        // Whether, in `sigs`, the signer of (x, m) signed an ending naming x
        // (in `names`, transitively) earlier in their chain: that ending.
        let voided = |sigs: &BTreeMap<(Hash, Hash), (Hash, u64)>, names: &BTreeMap<Hash, BTreeSet<Hash>>| {
            let mut out = BTreeMap::new();
            for ((x, m), (cs, p)) in sigs {
                let by = sigs
                    .iter()
                    .find(|((y, m2), (_, q))| m2 == m && y != x && q < p && closure(names, y).contains(x))
                    .map(|((y, _), _)| *y);
                if let Some(y) = by {
                    out.insert((*x, *m), (*cs, y));
                }
            }
            out
        };
        let through_chains = |sigs: &BTreeMap<(Hash, Hash), (Hash, u64)>| {
            let mut names = objects.clone();
            for ((y, m), (_, q)) in sigs {
                for ((x, m2), (_, p)) in sigs {
                    if m2 == m && x != y && p < q {
                        names.entry(*y).or_default().insert(*x);
                    }
                }
            }
            names
        };
        let mut void = voided(&raw, &objects);
        let mut left: BTreeMap<_, _> = raw.iter().filter(|(k, _)| !void.contains_key(k)).map(|(k, v)| (*k, *v)).collect();
        let names = through_chains(&left);
        let more = voided(&left, &names);
        left.retain(|k, _| !more.contains_key(k));
        void.extend(more);
        let names = through_chains(&left);
        EndingSigs { counting: left, void, names, no_ending }
    }

    /// Whether an act of a collective counts as made after the fork or
    /// closing that ended it, and so counts for nothing in Law: that act.
    pub fn after_closing(&self, act: &Hash) -> R<Option<Hash>> {
        let x = self.held(act)?;
        let Some(c) = x.act.outside.signer else { return Ok(None) };
        let Some(e) = self.closed_by(&c)? else { return Ok(None) };
        let col = self.col(&c);
        Ok((!self.before_line(&col, x, &e.chain_act, &e.tips)).then_some(e.by))
    }

    /// The fork or closing that withdrew a standing offer of a collective it
    /// ended: every open offer of the original, whenever made (Q6).
    pub fn offer_withdrawn(&self, offer: &Hash) -> R<Option<Hash>> {
        let x = self.held(offer)?;
        if !self.is_law(x, types::STANDING_OFFER) {
            return Ok(None);
        }
        let Some(c) = x.act.outside.signer else { return Ok(None) };
        Ok(self.closed_by(&c)?.map(|e| e.by))
    }

    /// Who takes a stake the original held, after its fork: each side's
    /// share of it, in millionths of the stake, as the fork names, else by
    /// default (F121). `None` where the original does not hold it.
    pub fn fork_transfer(&self, fork: &Hash, agreement: &Hash, index: u64) -> R<Option<Vec<u64>>> {
        let e = self.fork(fork)?;
        let t = self.terms(agreement)?;
        let Some(stake) = t.stakes.iter().flatten().nth(index as usize) else {
            return Ok(None);
        };
        let this = if t.is_collective() { self.collective_of(agreement)? } else { None };
        let held: u64 = stake
            .holders
            .iter()
            .filter(|(h, _)| h.resolve(this.as_ref()) == Some(e.fork.collective))
            .map(|(_, n)| n)
            .sum();
        if held == 0 {
            return Ok(None);
        }
        let sides = match e.fork.shares.iter().find(|s| &s.agreement == agreement && s.index == index) {
            Some(s) => s.shares.clone(),
            None => e.shares.clone(),
        };
        Ok(Some(divide_first(held, &sides)))
    }

    /// Who owes an obligation of a collective a fork closed: the successors
    /// the fork assigns it to, jointly where several (N13). A complete fork
    /// hands out everything in the history it cites (F127), so an obligation
    /// it does not assign lies outside that history and is void (the tie
    /// rule): nobody owes it (D1's joint liability withdrawn). A successor a
    /// later fork closed passes it on the same way (F125 reading 4, as
    /// adjusted in F126). `None` where its debtor is not closed by a fork.
    pub fn debtors(&self, obligation: &Hash) -> R<Option<Vec<Hash>>> {
        use crate::finance::Payload as Fin;
        let x = self.held(obligation)?;
        if x.inside.spec != self.mips.finance {
            return Ok(None);
        }
        let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else {
            return Ok(None);
        };
        if !matches!(self.closed_by(&o.debtor)?, Some(Closed { fork: Some(_), .. })) {
            return Ok(None);
        }
        // An obligation that does not bind (outside the fork's history, the
        // tie rule; not done; not the collective's by its own rules) is owed
        // by nobody, whatever field 6 lists (rule 47a). Found by the Law
        // invariants (`docs/law-invariants.md`, IC5).
        if self.obligation_binds(obligation)? != Some(true) {
            return Ok(Some(vec![]));
        }
        let mut out: Vec<Hash> = vec![];
        let mut todo = vec![(o.debtor, 0u32)];
        while let Some((who, depth)) = todo.pop() {
            match self.closed_by(&who)? {
                Some(Closed { fork: Some(e), .. }) if depth < 64 => {
                    if let Some((_, sides)) = e.fork.debts.iter().find(|(d, _)| d == obligation) {
                        for i in sides.iter().rev() {
                            todo.push((e.fork.sides[*i as usize].successor, depth + 1));
                        }
                    }
                }
                _ => {
                    if !out.contains(&who) {
                        out.push(who);
                    }
                }
            }
        }
        Ok(Some(out))
    }

    /// What payments held pay toward an obligation (Finance rule 7: valid
    /// routes ending at the creditor's payee pointer, each naming the
    /// obligation). A receipt counts when it names the obligation, is
    /// received and signed by the creditor the obligation names (a receipt
    /// anyone else signs, the debtor's own among them, pays nothing; Law
    /// invariants, IC2), and:
    ///
    /// - has the rail's answer, valid (rule 4; [`Self::rail_valid`]): no
    ///   rail answer, nothing counted;
    /// - is in the debt's unit: 100 of another unit pay nothing;
    /// - was paid where the creditor's rules let it count for this debt
    ///   ([`Self::paid_where_it_counts`]: rules 12, 12a, 14 and 14a).
    ///
    /// Double entry (rule 10): a valid payer's claim counts on equal footing.
    /// Where the creditor signed no receipt for its rail proof, the claim
    /// alone shows the money arrived; where its receipt shows less, the
    /// greater amount counts. Either is shown as a disagreement on the
    /// receiver ([`Self::disagreements`]). A claim whose rail proof a receipt
    /// names for another payee or another obligation, with none matching
    /// it, is not counted here (see `docs/must-audit-2026-10.md`, Finance,
    /// U5).
    pub fn paid_toward(&self, obligation: &Hash) -> u64 {
        use crate::finance::Payload as Fin;
        let o = match self.v.get(obligation).map(|o| (o, Fin::decode(o.inside.type_, &o.inside.payload))) {
            Some((x, Ok(Fin::Obligation(o)))) if x.inside.spec == self.mips.finance => o,
            _ => return 0,
        };
        let creditor = o.creditor;
        let counts = |id: &Hash, amount: &crate::finance::Amount| {
            amount.unit == o.amount.unit
                && self
                    .rail_valid
                    .get(id)
                    .is_some_and(|at| self.paid_where_it_counts(at, amount, obligation, &o))
        };
        let mut receipts: Vec<(Vec<u8>, u64)> = vec![];
        let mut claims: BTreeMap<Vec<u8>, u64> = BTreeMap::new();
        for r in self.v.held_acts() {
            if r.inside.spec != self.mips.finance {
                continue;
            }
            match Fin::decode(r.inside.type_, &r.inside.payload) {
                Ok(Fin::Receipt(rc))
                    if &rc.fulfils == obligation
                        && rc.payee == creditor
                        && r.act.outside.signer == Some(creditor)
                        && self.valid(&r.id)
                        && counts(&r.id, &rc.amount) =>
                {
                    receipts.push((rc.proof, rc.amount.value));
                }
                Ok(Fin::Claim(c))
                    if &c.fulfils == obligation
                        && c.payee == creditor
                        && self.payers_claim(r)
                        && counts(&r.id, &c.amount)
                        && !self.claim_unsettled(&c) =>
                {
                    let m = claims.entry(c.proof).or_default();
                    *m = (*m).max(c.amount.value);
                }
                _ => {}
            }
        }
        let mut sum = receipts.iter().map(|(_, v)| *v).fold(0u64, u64::saturating_add);
        for (proof, claimed) in claims {
            let receipted = receipts
                .iter()
                .filter(|(p, _)| p == &proof)
                .map(|(_, v)| *v)
                .fold(0u64, u64::saturating_add);
            sum = sum.saturating_add(claimed.saturating_sub(receipted));
        }
        sum
    }

    /// Whether a payment its rail shows paid at `at` can count for the
    /// obligation `ob` (`o`), by the creditor's rules: Finance rule 12a (the
    /// creditor's own pointer, in force for that payment by rules 12, 14 and
    /// 14a; the rail Module and the vault entry are the rail answer's), rule
    /// 12 (a forked pointer chain counts only up to the fork), rule 14 with
    /// F133 (a payment to the flow counts only for a debt naming that
    /// version or a later one, which its agreement act cites), and rule 14a
    /// (paid to the flow, only within the vault's limit for its unit). A
    /// payment to the vault counts (rule 14).
    fn paid_where_it_counts(
        &self,
        at: &crate::finance::PaidAt,
        amount: &crate::finance::Amount,
        ob: &Hash,
        o: &crate::finance::Obligation,
    ) -> bool {
        use crate::finance::{self as fin, PaidAt, Payload as Fin};
        let PaidAt::Flow(p) = at else { return true };
        let pointers = self.pointers_held(&o.creditor).unwrap_or_default();
        let Some((_, paid)) = pointers.iter().find(|(i, _)| i == p) else { return false };
        if !fin::pointer_counts(&pointers, p) {
            return false;
        }
        if fin::pointer_cited(self.v, ob, o) != Some(true) {
            return false;
        }
        let named = match self.v.get(&o.pointer).map(|x| (x, Fin::decode(x.inside.type_, &x.inside.payload))) {
            Some((x, Ok(Fin::PayeePointer(q)))) if x.inside.spec == self.mips.finance && q.payee == o.creditor => q.version,
            _ => return false,
        };
        if !fin::counts_toward(named, fin::PaidInto::Flow(paid.version)) {
            return false;
        }
        let vault = self.vault_in_force(&o.creditor);
        fin::flow_followed_vault((!vault.is_empty()).then_some(vault.as_slice()), amount)
    }

    /// Whether `h` is a payer's claim that stands: valid under Identity,
    /// signed by its payer (or carrying its anonymous payer's key, F113).
    fn payers_claim(&self, h: &Held) -> bool {
        use crate::finance::{self as fin, Payload as Fin};
        let Ok(p @ Fin::Claim(_)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return false };
        h.inside.spec == self.mips.finance
            && self.valid(&h.id)
            && h.act.outside.signer.is_some_and(|s| fin::check_signer(&p, &s).is_ok())
    }

    /// The receipts held naming a rail proof, each valid under Identity and
    /// signed by its payee.
    fn receipts_for_proof(&self, proof: &[u8]) -> Vec<(Hash, crate::finance::Receipt)> {
        use crate::finance::{self as fin, Payload as Fin};
        self.v
            .held_acts()
            .filter(|r| r.inside.spec == self.mips.finance)
            .filter_map(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
                Ok(p @ Fin::Receipt(_))
                    if self.valid(&r.id)
                        && r.act.outside.signer.is_some_and(|s| fin::check_signer(&p, &s).is_ok()) =>
                {
                    match p {
                        Fin::Receipt(rc) if rc.proof == proof => Some((r.id, rc)),
                        _ => None,
                    }
                }
                _ => None,
            })
            .collect()
    }

    /// A claim whose rail proof receipts name for another payee or another
    /// act, none of them for its own: Finance rule 10's "the greater
    /// amount counts as received" does not say toward what, and rule 8a
    /// counts neither of two acts sharing a proof outside a batch. Left
    /// uncounted for the author to rule on (audit U5).
    fn claim_unsettled(&self, c: &crate::finance::Claim) -> bool {
        let rs = self.receipts_for_proof(&c.proof);
        !rs.is_empty() && !rs.iter().any(|(_, r)| r.payee == c.payee && r.fulfils == c.fulfils)
    }

    /// Double entry (Finance rule 10): the open questions on a receiver.
    /// Each valid payer's claim to `receiver` with the rail's answer, valid
    /// ([`Self::rail_valid`]), for which the receiver has signed no receipt
    /// matching it (same rail proof, amount, payee and what it fulfils): no
    /// receipt at all (the claim alone shows the money arrived), or receipts
    /// naming the same proof that disagree with it. Until the receiver signs
    /// a receipt matching the proof, the greater amount counts as received
    /// ([`Self::paid_toward`]).
    pub fn disagreements(&self, receiver: &Hash) -> Vec<Disagreement> {
        use crate::finance::Payload as Fin;
        let mut out = vec![];
        for h in self.v.held_acts() {
            if h.inside.spec != self.mips.finance || !self.rail_valid.contains_key(&h.id) || !self.payers_claim(h) {
                continue;
            }
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if &c.payee != receiver {
                continue;
            }
            let rs = self.receipts_for_proof(&c.proof);
            let same = |r: &crate::finance::Receipt| r.amount == c.amount && r.payee == c.payee && r.fulfils == c.fulfils;
            if rs.iter().any(|(_, r)| same(r)) {
                continue;
            }
            if rs.is_empty() {
                out.push(Disagreement::NoReceipt { claim: h.id });
            }
            for (id, r) in rs {
                out.push(Disagreement::Differs {
                    claim: h.id,
                    receipt: id,
                    claimed: c.amount,
                    receipted: r.amount,
                    payee: r.payee != c.payee,
                    fulfils: r.fulfils != c.fulfils,
                });
            }
        }
        out
    }

    /// A creditor's release, judged (Finance type 4, F126; Law rule 47b):
    /// it ends the obligation it names when signed by the creditor that
    /// obligation names, a collective creditor's consent counting by its own
    /// rules: a Finance act, reached by its Finance lane alone (E2). Only the
    /// creditor signs it.
    pub fn debt_release(&self, id: &Hash) -> R<DebtReleaseEval> {
        use crate::finance::{self as fin, Payload as Fin};
        let h = self.held(id)?;
        let r = match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Release(r)) if h.inside.spec == self.mips.finance && h.inside.type_ == fin::types::RELEASE => r,
            _ => return Err(LawError::Check("not a creditor's release")),
        };
        let mut e = DebtReleaseEval { id: *id, release: r.clone(), counts: false, why: None };
        let fail = |mut e: DebtReleaseEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the creditor's release is not valid under Identity");
        }
        let Some(x) = self.v.get(&r.obligation) else {
            return fail(e, "the obligation it names is not held");
        };
        let o = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Obligation(o)) if x.inside.spec == self.mips.finance => o,
            _ => return fail(e, "it names an act that is not an obligation"),
        };
        if h.act.outside.signer != Some(o.creditor) {
            return fail(e, "only the creditor the obligation names signs its release (F125)");
        }
        if !self.consent(id)?.counts() {
            return fail(e, "the creditor's consent does not count, by its own rules (its Finance lane, F126)");
        }
        e.counts = true;
        Ok(e)
    }

    /// The creditor's release that ended an obligation, if one held counts.
    pub fn debt_released(&self, obligation: &Hash) -> R<Option<Hash>> {
        use crate::finance::{self as fin, Payload as Fin};
        for x in self.v.held_acts() {
            if x.inside.spec != self.mips.finance || x.inside.type_ != fin::types::RELEASE {
                continue;
            }
            if !matches!(Fin::decode(x.inside.type_, &x.inside.payload), Ok(Fin::Release(r)) if &r.obligation == obligation) {
                continue;
            }
            if self.debt_release(&x.id)?.counts {
                return Ok(Some(x.id));
            }
        }
        Ok(None)
    }

    /// Whether an obligation is still owed: neither fulfilled in full by
    /// receipts held nor ended by a creditor's release.
    fn still_owed(&self, obligation: &Hash, amount: u64) -> R<bool> {
        Ok(self.paid_toward(obligation) < amount && self.debt_released(obligation)?.is_none())
    }

    /// What a collective owes (F125, D5): its own obligations that bind,
    /// signed before the line where one is given, and every obligation that
    /// binds a collective a fork closed which it owes as a successor; each
    /// still owed.
    fn open_debts(&self, col: &Col, line: Option<(&Hash, &[KeptTip])>) -> R<Vec<Hash>> {
        use crate::finance::Payload as Fin;
        let mut out = vec![];
        for x in self.v.held_acts() {
            if x.inside.spec != self.mips.finance {
                continue;
            }
            let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else { continue };
            if self.obligation_binds(&x.id)? != Some(true) {
                continue;
            }
            let owes = if o.debtor == col.id {
                line.is_none_or(|(c, t)| self.before_line(col, x, c, t))
            } else {
                self.debtors(&x.id)?.is_some_and(|d| d.contains(&col.id))
            };
            if owes && self.still_owed(&x.id, o.amount.value)? {
                out.push(x.id);
            }
        }
        Ok(out)
    }

    /// What a collective owes now, for showing (F125, D5): its debts and
    /// those it owes as a fork's successor, still owed.
    pub fn owes(&self, collective: &Hash) -> R<Vec<Hash>> {
        let col = self.col(collective);
        self.open_debts(&col, None)
    }

    /// The work a payment is for (F126): a publication's work hash, where
    /// some agreement held carries a stake in it (a claimed work); `None`
    /// for a standing offer (its format is open) or anything else.
    fn work_of(&self, fulfils: &Hash) -> Option<Hash> {
        let x = self.v.get(fulfils)?;
        if x.inside.spec != self.mips.envelope || x.inside.type_ != 0 {
            return None;
        }
        x.inside.payload.iter().find_map(|(k, v)| match (k, v) {
            (crate::cbor::Value::Uint(1), crate::cbor::Value::Bytes(b)) => b.as_slice().try_into().ok(),
            _ => None,
        })
    }

    /// Whether some agreement held carries a stake in `work`.
    fn claimed(&self, work: &Hash) -> bool {
        self.v.held_acts().any(|x| {
            self.is_law(x, types::TERMS)
                && self.terms(&x.id).is_ok_and(|t| t.stake_on(&Who::Id(*work)).is_some())
        })
    }

    /// The latest version of an agreement that exists: for a collective's
    /// own agreement, the one in force at its current state; for a deal,
    /// the furthest version every party signed.
    fn latest_version(&self, agreement: &Hash) -> R<Hash> {
        let t = self.terms(agreement)?;
        if t.is_collective() {
            if let Some(c) = self.collective_of(agreement)? {
                if let Some(cur) = self.current(&c)? {
                    return Ok(cur.agreement);
                }
            }
            return Ok(*agreement);
        }
        // Rule 5b: two clones of one version that exist are a fork of the
        // deal; with no concurrency rule (terms field 10, format open), the
        // status quo stands: the parent stays the latest version (audit,
        // October 2026, R5b). Walked from the deal's founding terms, so
        // that a version off the line in force is never "latest".
        let mut at = self.lineage(agreement)?.pop().expect("a lineage has a root").0;
        loop {
            let next: Vec<Hash> = self
                .v
                .held_acts()
                .filter(|x| {
                    self.is_law(x, types::TERMS)
                        && self.terms(&x.id).is_ok_and(|c| c.parent == Some(at))
                        && self.agreement(&x.id).is_ok_and(|a| a.exists == Some(true))
                })
                .map(|x| x.id)
                .collect();
            match next.as_slice() {
                [x] => at = *x,
                _ => return Ok(at),
            }
        }
    }

    /// The act at which a work's claim under `agreement` is current, as this
    /// verifier holds it (F126): the latest version of the agreement, or,
    /// where a collective holding the work's stake in it was ended by a fork
    /// or closing, that act; or the work's release.
    fn claim_line(&self, agreement: &Hash, work: Option<&Hash>) -> R<Hash> {
        let v = self.latest_version(agreement)?;
        if let Some(w) = work {
            if let Some(r) = self.released(w)? {
                return Ok(r.id);
            }
        }
        let t = self.terms(&v)?;
        let this = if t.is_collective() { self.collective_of(&v)? } else { None };
        for st in t.stakes.iter().flatten() {
            if work.is_some_and(|w| st.object != Who::Id(*w)) || st.object == Who::This {
                continue;
            }
            for (h, _) in &st.holders {
                if let Some(c) = h.resolve(this.as_ref()) {
                    if let Some(e) = self.closed_by(&c)? {
                        return Ok(e.by);
                    }
                }
            }
        }
        Ok(v)
    }

    /// A payment for a work, judged (F126): a purchase names the claim it
    /// pays under (receipt or claim field 9). A payment for a claimed work,
    /// or for a standing offer, that names none, or names a line that is
    /// none of that agreement's claims, is no purchase: money received for
    /// nothing, owed back to the payer as a refund (Finance rule 10a). W4
    /// (F128): on a request rail, the claim named is the one the seller's
    /// request committed to; on a push rail, each holder's own chain
    /// settles it. `None` where the payment is not for a work.
    pub fn purchase(&self, id: &Hash) -> R<Option<PurchaseEval>> {
        use crate::finance::{self as fin, Payer, Payload as Fin};
        let x = self.held(id)?;
        if x.inside.spec != self.mips.finance {
            return Ok(None);
        }
        let (purchase, fulfils, refund_to, rail) = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Receipt(r)) => (r.purchase.clone(), r.fulfils, fin::refund_owed_to(&r), r.rail),
            Ok(Fin::Claim(c)) => {
                let signer = x.act.outside.signer.unwrap_or_default();
                let to = match c.payer(&signer) {
                    Payer::Identity(h) => fin::RefundTo::Identity(h),
                    Payer::Key(k) => fin::RefundTo::Key(k),
                };
                (c.purchase.clone(), c.fulfils, to, c.rail)
            }
            _ => return Ok(None),
        };
        let work = self.work_of(&fulfils);
        let for_offer = self.v.get(&fulfils).is_some_and(|f| self.is_law(f, types::STANDING_OFFER));
        let for_work = for_offer || work.is_some_and(|w| self.claimed(&w));
        if purchase.is_none() && !for_work {
            return Ok(None);
        }
        let mut e = PurchaseEval { id: *id, purchase: purchase.clone(), verdict: PurchaseVerdict::Purchase, refund_to };
        let no = |mut e: PurchaseEval, w: &str| {
            e.verdict = PurchaseVerdict::NoPurchase { why: w.into() };
            Ok(Some(e))
        };
        // F131 (IT3): the payment decides. The claim is the one the
        // payment's commitment names; a receipt naming another is a wrong
        // receipt, which the rail shows: its commitment, recomputed from it,
        // is not the one the rail proof carries.
        if self.rail_invalid.contains(id) {
            e.verdict = PurchaseVerdict::WrongReceipt {
                why: "its rail proof does not carry the commitment recomputed from it: the payment committed to another claim; a wrong receipt counts for nothing (F131, IT3)".into(),
            };
            return Ok(Some(e));
        }
        if self.same_payment(id).iter().any(|(_, q)| q != &purchase) {
            // Receipts of one payment naming different claims, and no rail
            // answer yet saying which one the payment committed to.
            e.verdict = PurchaseVerdict::Unrecorded;
            return Ok(Some(e));
        }
        let Some(p) = purchase else {
            return no(e, "it names no claim: a Finance-only payment for a claimed work is no purchase (F126)");
        };
        let Ok(t) = self.terms(&p.agreement) else {
            return no(e, "the agreement it names is not held terms");
        };
        if let Some(w) = &work {
            if t.stake_on(&Who::Id(*w)).is_none() && self.latest_version(&p.agreement).ok().and_then(|v| self.terms(&v).ok()).is_none_or(|v| v.stake_on(&Who::Id(*w)).is_none()) {
                return no(e, "the agreement it names carries no stake in the work it pays for");
            }
        }
        // The line: a version of the agreement, or an act ending a holder
        // of the work's stake in it, or the work's release.
        let in_history = match self.v.get(&p.line) {
            None => false,
            Some(l) if self.is_law(l, types::TERMS) => {
                self.lineage(&p.line).is_ok_and(|ls| ls.iter().any(|(i, _)| i == &p.agreement))
            }
            Some(l) if self.is_law(l, types::FORK) || self.is_law(l, types::CLOSING) || self.is_law(l, types::RELEASE) => true,
            Some(_) => false,
        };
        if !in_history {
            return no(e, "the line it names carries none of that agreement's claims");
        }
        let current = self.claim_line(&p.agreement, work.as_ref())?;
        let sellers = self.sellers(&p, work.as_ref())?;
        if !self.push_rails.contains(&rail) {
            // W4 (F128), request rails: the claim the payment names is the
            // one the seller's request committed to, so a buyer cannot pay a
            // version the seller has left. Where the seller is a collective,
            // the payment becomes a sale once its actions chain records it
            // (F127, W2); one the original's chain never recorded before the
            // fork or closing that superseded its claim is refunded.
            if sellers.is_empty() {
                return Ok(Some(e));
            }
            for c in &sellers {
                if self.recorded(id, c, &p, work.as_ref(), &current, true)? {
                    return Ok(Some(e));
                }
            }
            if p.line != current && sellers.iter().any(|c| matches!(self.closed_by(c), Ok(Some(ref x)) if x.by == current)) {
                return no(
                    e,
                    "the seller's actions chain never recorded it before the fork or closing that superseded its claim: no purchase, refunded (F127, W2)",
                );
            }
            e.verdict = PurchaseVerdict::Unrecorded;
            return Ok(Some(e));
        }
        // W4 (F128), push rails: each holder the claim names settles on its
        // own chain. A holder's receipt recorded before that holder's
        // signature on the act superseding the claim is a sale under it; one
        // recorded after it is not. The payment is a purchase only if every
        // holder's receipt is a sale; otherwise every holder refunds what it
        // received, and the buyer buys again under the current claim.
        let holders = self.claim_holders(&p, work.as_ref())?;
        if holders.is_empty() {
            return no(e, "the claim it names has no holder of the work's stake");
        }
        let superseded = self.claim_version(&current, work.as_ref())? != self.claim_version(&p.line, work.as_ref())?;
        let mut waiting = false;
        for h in &holders {
            let col = self.col(h);
            let collective = (0..col.res.links.len()).any(|k| self.declares(&col, k));
            let sale = if collective {
                if self.recorded(id, h, &p, work.as_ref(), &current, false)? {
                    Some(true)
                } else if !self.holder_receipts(id, h).is_empty()
                    || (p.line != current && matches!(self.closed_by(h), Ok(Some(ref x)) if x.by == current))
                {
                    // Its receipt came too late, or its fork or closing
                    // superseded the claim before its chain recorded it.
                    Some(false)
                } else {
                    None
                }
            } else {
                let rs = self.holder_receipts(id, h);
                if rs.is_empty() {
                    None
                } else if !superseded {
                    Some(true)
                } else {
                    let over = self.superseding(&p, &current, work.as_ref())?;
                    Some(rs.iter().any(|r| !self.after_own_signature(r, h, &over)))
                }
            };
            match sale {
                Some(true) => {}
                Some(false) => {
                    return no(
                        e,
                        "on a push rail, a holder recorded its receipt after its own signature on the act superseding the claim: no purchase, every holder refunds (F128, W4)",
                    )
                }
                None => waiting = true,
            }
        }
        if waiting {
            e.verdict = PurchaseVerdict::Unrecorded;
        }
        Ok(Some(e))
    }

    /// The other receipts and claims of the same rail payment as `id` (one
    /// rail proof, one payment), valid and not shown wrong by their rail,
    /// with the claim each names (F131, IT3).
    fn same_payment(&self, id: &Hash) -> Vec<(Hash, Option<crate::finance::Purchase>)> {
        use crate::finance::Payload as Fin;
        let of = |h: &Held| match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) if h.inside.spec == self.mips.finance => Some(((r.rail, r.proof), r.purchase)),
            Ok(Fin::Claim(r)) if h.inside.spec == self.mips.finance => Some(((r.rail, r.proof), r.purchase)),
            _ => None,
        };
        let Some(Some((mine, _))) = self.v.get(id).map(of) else { return vec![] };
        if mine.1.is_empty() {
            return vec![];
        }
        let mut out = vec![];
        for h in self.v.held_acts() {
            if h.id == *id || self.rail_invalid.contains(&h.id) || !self.valid(&h.id) {
                continue;
            }
            if let Some((k, q)) = of(h) {
                if k == mine {
                    out.push((h.id, q));
                }
            }
        }
        out
    }

    /// The holders of the work's stake in the claim a purchase names (W4,
    /// F128): the successors where it names a fork; otherwise the holders
    /// in that version of the claiming agreement, a holder written null
    /// being the collective whose terms they are.
    fn claim_holders(&self, p: &crate::finance::Purchase, work: Option<&Hash>) -> R<Vec<Hash>> {
        if let Some(l) = self.v.get(&p.line) {
            if self.is_law(l, types::FORK) {
                if let Ok(f) = Fork::decode(&l.inside) {
                    return Ok(f.sides.iter().map(|s| s.successor).collect());
                }
            }
        }
        let version = match self.v.get(&p.line) {
            Some(l) if self.is_law(l, types::TERMS) => p.line,
            _ => p.agreement,
        };
        let t = self.terms(&version)?;
        let this = if t.is_collective() { self.collective_of(&p.agreement)? } else { None };
        let mut out = vec![];
        for st in t.stakes.iter().flatten() {
            if st.object == Who::This || work.is_some_and(|w| st.object != Who::Id(*w)) {
                continue;
            }
            for (h, _) in &st.holders {
                if let Some(c) = h.resolve(this.as_ref()) {
                    if !out.contains(&c) {
                        out.push(c);
                    }
                }
            }
        }
        Ok(out)
    }

    /// The receipts `holder` signed for the same rail payment as `id` (the
    /// payment itself, where `holder` signed it, or a receipt carrying the
    /// same rail proof), that stand: a push rail's one payment to several
    /// holders (W4, F128).
    fn holder_receipts(&self, id: &Hash, holder: &Hash) -> Vec<&'a Held> {
        use crate::finance::Payload as Fin;
        let proof = |h: &Held| match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) if h.inside.spec == self.mips.finance => Some((r.rail, r.proof)),
            Ok(Fin::Claim(r)) if h.inside.spec == self.mips.finance => Some((r.rail, r.proof)),
            _ => None,
        };
        let Some(x) = self.v.get(id) else { return vec![] };
        let mine = proof(x);
        self.v
            .signed_by(holder)
            .filter(|h| {
                h.inside.spec == self.mips.finance
                    && h.inside.type_ == crate::finance::types::RECEIPT
                    && self.valid(&h.id)
                    && !self.rail_invalid.contains(&h.id)
                    && (h.id == *id || mine.as_ref().is_some_and(|m| !m.1.is_empty() && proof(h).as_ref() == Some(m)))
            })
            .collect()
    }

    /// The acts superseding the claim a purchase names, up to the current
    /// claim (W4): the versions of the claiming agreement after the one it
    /// names, or the fork, closing or release that is current.
    fn superseding(&self, p: &crate::finance::Purchase, current: &Hash, work: Option<&Hash>) -> R<Vec<Hash>> {
        let named = self.claim_version(&p.line, work)?;
        match self.v.get(current) {
            Some(c) if self.is_law(c, types::TERMS) => {
                let mut out = vec![];
                for (v, _) in self.lineage(current)? {
                    if v == named || v == p.line {
                        break;
                    }
                    out.push(v);
                }
                Ok(out)
            }
            _ => Ok(vec![*current]),
        }
    }

    /// Whether `holder`'s receipt `r` was recorded after its own signature
    /// on one of the acts `over` (W4, F128): that signature (the act itself,
    /// or its signature act naming it) lies before `r` on `r`'s own
    /// sequence. A signature on another of the holder's sequences is not
    /// before it: each holder's clock is its own, and it answers for it.
    fn after_own_signature(&self, r: &Held, holder: &Hash, over: &[Hash]) -> bool {
        let mut signed: BTreeSet<Hash> = BTreeSet::new();
        for a in over {
            if self.v.get(a).is_some_and(|h| h.act.outside.signer.as_ref() == Some(holder)) {
                signed.insert(*a);
            }
            for (_, s) in self.valid_sigs(a, &[*holder]) {
                signed.insert(s);
            }
        }
        let mut cur = r.inside.prev.as_deref().and_then(|p| p.first()).copied();
        for _ in 0..1_000_000 {
            let Some(y) = cur else { return false };
            if signed.contains(&y) {
                return true;
            }
            cur = self
                .v
                .get(&y)
                .filter(|h| h.act.outside.signer.as_ref() == Some(holder))
                .and_then(|h| h.inside.prev.as_deref().and_then(|p| p.first()).copied());
        }
        false
    }

    /// The version at which a claim stands, from a version of its agreement
    /// (F126 reading 4, confirmed in F127): back through the parents while
    /// the work's stake, who is paid for it, stays the same. A fork, closing
    /// or release stands for itself.
    fn claim_version(&self, line: &Hash, work: Option<&Hash>) -> R<Hash> {
        let Some(l) = self.v.get(line) else { return Ok(*line) };
        if !self.is_law(l, types::TERMS) {
            return Ok(*line);
        }
        let Some(w) = work else { return Ok(*line) };
        let mut at = *line;
        let mut t = self.terms(&at)?;
        for _ in 0..10_000 {
            let Some(p) = t.parent else { break };
            let Ok(pt) = self.terms(&p) else { break };
            if pt.stake_on(&Who::Id(*w)).map(|(_, s)| s.clone()) != t.stake_on(&Who::Id(*w)).map(|(_, s)| s.clone()) {
                break;
            }
            at = p;
            t = pt;
        }
        Ok(at)
    }

    /// The collectives that sell a work under a purchase's claim (F127,
    /// W2): the holders of the work's stake in the agreement it names that
    /// are collectives, and, where the claim names a fork, its successors.
    fn sellers(&self, p: &crate::finance::Purchase, work: Option<&Hash>) -> R<Vec<Hash>> {
        let mut out = vec![];
        if let Some(l) = self.v.get(&p.line) {
            if self.is_law(l, types::FORK) {
                if let Ok(f) = Fork::decode(&l.inside) {
                    out.extend(f.sides.iter().map(|s| s.successor));
                    return Ok(out);
                }
            }
        }
        let t = self.terms(&p.agreement)?;
        let this = if t.is_collective() { self.collective_of(&p.agreement)? } else { None };
        for st in t.stakes.iter().flatten() {
            if st.object == Who::This || work.is_some_and(|w| st.object != Who::Id(*w)) {
                continue;
            }
            for (h, _) in &st.holders {
                if let Some(c) = h.resolve(this.as_ref()) {
                    let col = self.col(&c);
                    if (0..col.res.links.len()).any(|k| self.declares(&col, k)) && !out.contains(&c) {
                        out.push(c);
                    }
                }
            }
        }
        Ok(out)
    }

    /// Whether collective `c`'s actions chain records the payment `id`
    /// where the claim it names was current (F127, W2): an act in its name
    /// that counts (done, on its chain, not void at an ending), signed by it
    /// or by its split service under its grant, that is the payment's
    /// receipt, acknowledges it, or is a receipt for the same rail proof.
    fn recorded(
        &self,
        id: &Hash,
        c: &Hash,
        p: &crate::finance::Purchase,
        work: Option<&Hash>,
        current: &Hash,
        request: bool,
    ) -> R<bool> {
        use crate::finance::Payload as Fin;
        let x = self.held(id)?;
        let proof = |h: &Held| match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) if h.inside.spec == self.mips.finance => Some((r.rail, r.proof)),
            Ok(Fin::Claim(r)) if h.inside.spec == self.mips.finance => Some((r.rail, r.proof)),
            _ => None,
        };
        let mine = proof(x);
        let mut candidates: Vec<&Held> = vec![x];
        candidates.extend(self.v.acknowledgements(id));
        // The payment is the rail proof's (one proof, one payment): an act
        // acknowledging any receipt for it records it, so that one payment
        // is never a purchase by one receipt and refunded by another. Found
        // by the Law invariants (`docs/law-invariants.md`, IC4).
        for h in self.v.held_acts() {
            if h.id != *id
                && h.inside.spec == self.mips.finance
                && h.inside.type_ == crate::finance::types::RECEIPT
                && mine.as_ref().is_some_and(|m| !m.1.is_empty() && proof(h).as_ref() == Some(m))
            {
                candidates.push(h);
                candidates.extend(self.v.acknowledgements(&h.id));
            }
        }
        let claim_here = self.claim_version(&p.line, work)?;
        for r in candidates {
            if self.rail_invalid.contains(&r.id) {
                continue;
            }
            // Signed with the collective's own key, or with a grant key of
            // its, its split service's among them (F128, reading 6).
            if r.act.outside.signer.as_ref() != Some(c) || !self.valid(&r.id) || !self.consent(&r.id)?.counts() {
                continue;
            }
            // W4 (F128): on a request rail the claim is the one the
            // seller's request committed to: the recording act counting is
            // enough.
            if request {
                return Ok(true);
            }
            let at = self.in_force(&r.id)?;
            // Where the claim it names was current at that act.
            let current_there = match self.v.get(&p.line) {
                Some(l) if self.is_law(l, types::TERMS) => {
                    let version = match at {
                        Some(a) if self.lineage(&a)?.iter().any(|(i, _)| i == &p.agreement) => a,
                        _ => self.latest_version(&p.agreement)?,
                    };
                    self.claim_version(&version, work)? == claim_here
                }
                _ => &p.line == current,
            };
            // A release by the seller, an action on its chain, ends the claim
            // (W4, F128): a receipt recorded after it, its history holding the
            // release, is no sale; one recorded before it, or knowing nothing
            // of it, is judged as it knew the claim.
            let released_first = match self.v.get(current) {
                Some(rl) if self.is_law(rl, types::RELEASE) && rl.act.outside.signer.as_ref() == Some(c) => {
                    let col = self.col(c);
                    self.before_struct(&col, rl, Line::Record(r))
                }
                _ => false,
            };
            if current_there && !released_first {
                return Ok(true);
            }
        }
        Ok(false)
    }

    // ------------------------------------------------------------ the pointer

    /// The latest valid payee pointer of an identity that counts: for a
    /// collective, one its Finance lane's consent carries.
    fn pointer_in_force(&self, who: &Hash) -> R<Result<(Hash, crate::finance::PayeePointer), String>> {
        use crate::finance as fin;
        let held = self.pointers_held(who)?;
        let l = fin::latest_pointer(&held);
        if l.contested {
            return Ok(Err("a payee pointer chain is contested".into()));
        }
        match l.act.and_then(|a| held.into_iter().find(|(i, _)| *i == a)) {
            Some(x) => Ok(Ok(x)),
            None => Ok(Err("no payee pointer in force is held".into())),
        }
    }

    /// Every valid payee pointer of an identity held: for a collective,
    /// those its Finance lane's consent carries.
    fn pointers_held(&self, who: &Hash) -> R<Vec<(Hash, crate::finance::PayeePointer)>> {
        use crate::finance::{self as fin, Payload as Fin};
        let mut held = vec![];
        for h in self.v.signed_by(who) {
            if h.inside.spec != self.mips.finance || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(p)) = Fin::decode(h.inside.type_, &h.inside.payload) else {
                continue;
            };
            if &p.payee == who && self.valid(&h.id) && self.consent(&h.id)?.counts() {
                held.push((h.id, p));
            }
        }
        Ok(held)
    }

    /// The vault an identity's chain declares in force (Finance rule 14a):
    /// its entries, none where it declares no vault.
    fn vault_in_force(&self, who: &Hash) -> Vec<crate::finance::VaultEntry> {
        let res = self.v.resolve(who);
        let mut out = vec![];
        for st in &res.states {
            match crate::finance::vault_in(&self.mips.finance, &st.declarations) {
                Ok(Some(Some(e))) => out = e,
                Ok(Some(None)) => out = vec![],
                _ => {}
            }
        }
        out
    }

    /// The pointer check (rule 18, F123, F124 P2): where `agreement` names a
    /// split service, the payee pointer of `owners` counts for Law only if
    /// every address in it also appears in the split service's own signed
    /// pointer in force, and every entry of the owners' vault in force in
    /// that service's own vault, or both in those of a service its chain of
    /// judgment names to take over (reading 4).
    pub fn pointer_check(&self, owners: &Hash, agreement: &Hash) -> R<PointerCheck> {
        let t = self.terms(agreement)?;
        // F129, H4: in a deal, the payee's own grant to the service.
        let g = match (&t.split_grant, &t.payee_grants) {
            (Some(g), _) => *g,
            (None, Some(list)) => match list.iter().find(|x| self.v.get(x).is_some_and(|h| h.act.outside.signer == Some(*owners))) {
                Some(g) => *g,
                None => {
                    return Ok(PointerCheck::Undetermined {
                        reason: "the deal lists no grant of this payee to its split service that this verifier holds (F129, H4)".into(),
                    })
                }
            },
            (None, None) => return Ok(PointerCheck::NoSplitService),
        };
        let mut grants = vec![g];
        if let Some(l) = t.chain.iter().flatten().find(|l| l.judge == Judge::SplitService) {
            for (taker, _) in &l.next {
                match taker {
                    crate::law::Taker::One(h) => grants.push(*h),
                    // F130, H6: in a deal, the payee's own grant to each
                    // service taking over.
                    crate::law::Taker::Grants(list) => {
                        if let Some(x) = list.iter().find(|x| self.v.get(x).is_some_and(|h| h.act.outside.signer == Some(*owners))) {
                            grants.push(*x);
                        }
                    }
                }
            }
        }
        let undetermined = |w: String| Ok(PointerCheck::Undetermined { reason: w });
        let (pid, mine) = match self.pointer_in_force(owners)? {
            Ok(x) => x,
            Err(w) => return undetermined(format!("the owners' pointer: {w}")),
        };
        let my_vault = self.vault_in_force(owners);
        let mut first_missing = None;
        for g in grants {
            let Some(gh) = self.v.get(&g) else {
                return undetermined("the split service's grant is not held".into());
            };
            let Ok(grant) = Grant::decode(&gh.inside.payload) else {
                return undetermined("the split service's grant does not decode".into());
            };
            let service = grant.grantee;
            let theirs = match self.pointer_in_force(&service)? {
                Ok((_, p)) => p,
                Err(_) => continue,
            };
            let their_vault = self.vault_in_force(&service);
            let missing: Vec<_> = mine.rails.iter().filter(|r| !theirs.rails.contains(r)).cloned().collect();
            let vault_missing: Vec<_> = my_vault.iter().filter(|e| !their_vault.contains(e)).cloned().collect();
            if missing.is_empty() && vault_missing.is_empty() {
                return Ok(PointerCheck::Ordinary { pointer: pid, service });
            }
            first_missing.get_or_insert((missing, vault_missing));
        }
        match first_missing {
            Some((missing, vault_missing)) => Ok(PointerCheck::Bypasses { pointer: pid, missing, vault_missing }),
            None => undetermined("no split service's own pointer in force is held".into()),
        }
    }

    /// Payer-side splitting (F124 P2, F64): where the owners' agreement
    /// names no split service, what a paying wallet that reads Law pays each
    /// holder's own pointer for `amount` on the stake in `object`, by its
    /// shares, leftovers by largest remainder (rule 15a, F150), the order of
    /// holders deciding nothing. Holders with equal remainders are ordered
    /// by the hash of the payment's receipt, `receipt`; where they compete
    /// for a leftover unit and none is given, the split is undetermined
    /// (`Err`): which hash orders them before a payer-side payment has a
    /// receipt is open. A holder that is a collective splitting payer-side
    /// too is followed to the holders of its stake in itself: one flow,
    /// holders' identities as destinations. `Err` where the agreement names
    /// a split service, or no such stake.
    pub fn payer_split(&self, agreement: &Hash, object: &Who, amount: u64, receipt: Option<&Hash>) -> R<Result<Vec<(Hash, u64)>, String>> {
        self.payer_split_depth(agreement, object, amount, receipt, 0)
    }

    fn payer_split_depth(&self, agreement: &Hash, object: &Who, amount: u64, receipt: Option<&Hash>, depth: usize) -> R<Result<Vec<(Hash, u64)>, String>> {
        if depth > 8 {
            return Ok(Err("collectives nested deeper than 8".into()));
        }
        let t = self.terms(agreement)?;
        if t.split_grant.is_some() || t.payee_grants.is_some() {
            return Ok(Err("the agreement names a split service: payments go to the owners' pointer, which leads to it".into()));
        }
        let Some((_, stake)) = t.stake_on(object) else {
            return Ok(Err("the agreement defines no such stake".into()));
        };
        let this = if t.is_collective() { self.collective_of(agreement)? } else { None };
        let mut ids: Vec<(Hash, u64)> = vec![];
        for (h, n) in &stake.holders {
            let Some(id) = h.resolve(this.as_ref()) else {
                return Ok(Err("a holder written null, and the collective is not held".into()));
            };
            ids.push((id, *n));
        }
        let parts = match divide_stake(amount, &ids, receipt) {
            Ok(p) => p,
            Err(w) => return Ok(Err(w)),
        };
        let mut out: Vec<(Hash, u64)> = vec![];
        let mut add = |h: Hash, n: u64| match out.iter_mut().find(|(x, _)| *x == h) {
            Some(e) => e.1 += n,
            None => out.push((h, n)),
        };
        for ((id, _), n) in ids.into_iter().zip(parts) {
            let inner = match self.current(&id)? {
                Some(cur) if Some(id) != this || *object != Who::This => {
                    let ct = self.terms(&cur.agreement)?;
                    if ct.split_grant.is_none() && ct.payee_grants.is_none() && ct.own_stake().is_some() {
                        Some(self.payer_split_depth(&cur.agreement, &Who::This, n, receipt, depth + 1)?)
                    } else {
                        None
                    }
                }
                _ => None,
            };
            match inner {
                Some(Ok(v)) => v.into_iter().for_each(|(x, m)| add(x, m)),
                Some(Err(w)) => return Ok(Err(w)),
                None => add(id, n),
            }
        }
        Ok(Ok(out))
    }

    // ------------------------------------------------------------ splits

    /// A split, judged: conservation, each fee and its receiver, delivery
    /// to every holder it pays (Q9), and every payout matching its stake
    /// exactly (N10): for each stake it pays, each holder gets their share
    /// of what the split pays that stake, within one smallest unit of
    /// rounding per payout, so every fee falls alike on every stake.
    pub fn split(&self, id: &Hash) -> R<SplitEval> {
        use crate::finance::Payload as Fin;
        let h = self.held(id)?;
        if !self.is_law(h, types::SPLIT) {
            return Err(LawError::Check("not a split"));
        }
        let s = Split::decode(&h.inside.payload)?;
        // Summed wide (rule 21): payouts that overflow 64 bits never sum to
        // the amount received, and never panic the verifier. Found by the Law
        // invariants (`docs/law-invariants.md`, IC7).
        let total: u128 = s.payouts.iter().map(|p| p.amount as u128).sum();
        let sums = self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => Some(x.amount.value as u128 == total),
            Ok(Fin::Claim(x)) => Some(x.amount.value as u128 == total),
            _ => None,
        });
        let fees = s
            .payouts
            .iter()
            .filter_map(|p| p.fee_module.map(|m| (m, p.receiver, p.amount)))
            .collect();
        let public = h.act.outside.content_key.is_some();
        let to = h.act.outside.to.clone().unwrap_or_default();
        let mut undelivered = vec![];
        for p in &s.payouts {
            if p.stake.is_some() && !public && !to.contains(&p.receiver) && !undelivered.contains(&p.receiver) {
                undelivered.push(p.receiver);
            }
        }
        // Rule 26: the stakes as currently held, those of the agreement in
        // force (audit, October 2026, gap 8). A split naming an older
        // version is judged against the version in force all the same.
        let in_force = self.latest_version(&s.agreement)?;
        let t = self.terms(&in_force)?;
        let collective = if t.is_collective() { self.collective_of(&in_force)? } else { None };
        let mut problems = vec![];
        if in_force != s.agreement {
            problems.push("it names a version of the owners' agreement that is not in force: the stakes as currently held are the version in force's (rule 26)".to_string());
        }
        // Rule 20: signed by the split service with its own key; the
        // service the agreement in force names (field 14, or its chain of
        // judgment), never anyone else.
        if !self.valid(id) {
            problems.push("it is not valid under Identity".into());
        }
        if self.key_grant(h).is_some() {
            problems.push("it is signed with a grant key, not the service's own key (rule 20)".into());
        }
        let services = self.named_services(&t)?;
        match h.act.outside.signer {
            Some(signer) if services.contains(&signer) => {}
            _ if services.is_empty() => {
                problems.push("the agreement in force names no split service this verifier can read (rule 18): payer-side splitting, or grants not held, and no split is its".into())
            }
            _ => problems.push("its signer is none of the split services the agreement in force names (rule 20)".into()),
        }
        // Rule 22: each role payout names its evidence, which must hold. A
        // rail Module's share is evidenced by a receipt or claim naming the
        // Module, which the payee's own pointer or vault must name (F119);
        // any other role, by an act signed by neither the service nor the
        // payee. The payee is the identity the payment was made to.
        let payee = self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => Some(x.payee),
            Ok(Fin::Claim(x)) => Some(x.payee),
            _ => None,
        });
        let mut unevidenced = vec![];
        let mut unplanned = vec![];
        for p in &s.payouts {
            if p.role.is_some() {
                let holds = match (p.evidence, payee, h.act.outside.signer) {
                    (Some(ev), Some(payee), Some(service)) => {
                        let role = match self.v.get(&ev).map(|x| (x.inside.spec == self.mips.finance, Fin::decode(x.inside.type_, &x.inside.payload))) {
                            Some((true, Ok(Fin::Receipt(x)))) => Role::RailModule(x.rail),
                            Some((true, Ok(Fin::Claim(x)))) => Role::RailModule(x.rail),
                            _ => Role::Other,
                        };
                        self.v.get(&ev).is_some() && self.role_evidence(&ev, &role, &service, &payee)?
                    }
                    _ => false,
                };
                if !holds && !unevidenced.contains(&p.receiver) {
                    unevidenced.push(p.receiver);
                }
            } else if p.stake.is_none() && !unplanned.contains(&p.receiver) {
                unplanned.push(p.receiver);
            }
        }
        let mut mismatched = vec![];
        let mut idxs: Vec<u64> = s.payouts.iter().filter_map(|p| p.stake).collect();
        idxs.sort();
        idxs.dedup();
        for idx in idxs {
            let paid_on: Vec<&Payout> = s.payouts.iter().filter(|p| p.stake == Some(idx)).collect();
            let pot: u128 = paid_on.iter().map(|p| p.amount as u128).sum();
            let Some(stake) = t.stakes.iter().flatten().nth(idx as usize) else {
                for p in paid_on {
                    mismatched.push(Mismatch { stake: idx, holder: p.receiver, paid: p.amount, due: 0 });
                }
                continue;
            };
            let holders: Vec<(Option<Hash>, u64)> = stake.holders.iter().map(|(w, n)| (w.resolve(collective.as_ref()), *n)).collect();
            let n = holders.len() as u128;
            for (who, share) in &holders {
                let paid: u128 = paid_on.iter().filter(|p| Some(p.receiver) == *who).map(|p| p.amount as u128).sum();
                let exact = pot * (*share as u128); // in millionths of a unit
                let m = MILLION as u128;
                // Short of its exact share by a whole unit or more, or over
                // it by more than the leftovers rounding can leave.
                if paid * m + m <= exact || paid * m >= exact + n * m {
                    mismatched.push(Mismatch {
                        stake: idx,
                        holder: who.unwrap_or_default(),
                        paid: paid as u64,
                        due: (exact / m) as u64,
                    });
                }
            }
            for p in paid_on {
                if !holders.iter().any(|(w, _)| *w == Some(p.receiver)) {
                    mismatched.push(Mismatch { stake: idx, holder: p.receiver, paid: p.amount, due: 0 });
                }
            }
        }
        Ok(SplitEval {
            id: *id,
            split: s,
            sums,
            fees,
            undelivered,
            collective,
            mismatched,
            problems,
            in_force,
            unevidenced,
            unplanned,
        })
    }

    /// The split services an agreement's terms name (rule 18): in a
    /// collective, the grantee of field 14's grant and of each grant its
    /// chain of judgment names to take over; in a deal, the services its
    /// payees' grants name ([`Self::deal_services`]).
    fn named_services(&self, t: &Terms) -> R<Vec<Hash>> {
        if !t.is_collective() {
            return Ok(self.deal_services(t).unwrap_or_default());
        }
        let mut grants: Vec<Hash> = t.split_grant.iter().copied().collect();
        if let Some(l) = t.chain.iter().flatten().find(|l| l.judge == Judge::SplitService) {
            grants.extend(l.successors());
        }
        let mut out = vec![];
        for g in grants {
            if let Some(s) = self.v.get(&g).filter(|x| self.is_law(x, types::GRANT)).and_then(|x| Grant::decode(&x.inside.payload).ok()).map(|x| x.grantee) {
                if !out.contains(&s) {
                    out.push(s);
                }
            }
        }
        Ok(out)
    }

    /// The identities that name `service` as their split service, by any
    /// version of an agreement held (rule 18): a collective, by field 14's
    /// grant or its chain of judgment; in a deal, each payee whose own
    /// grant to the service the deal lists.
    fn grantors_of(&self, service: &Hash) -> R<Vec<Hash>> {
        let mut out = vec![];
        for x in self.v.held_acts() {
            if !self.is_law(x, types::TERMS) {
                continue;
            }
            let Ok(t) = self.terms(&x.id) else { continue };
            if t.is_collective() {
                // A version in force, or one the version in force descends
                // from: a draft clone names nothing.
                let Some(c) = self.collective_of(&x.id)? else { continue };
                let Some(cur) = self.current(&c)? else { continue };
                if !self.lineage(&cur.agreement)?.iter().any(|(i, _)| i == &x.id) {
                    continue;
                }
                if self.named_services(&t)?.contains(service) && !out.contains(&c) {
                    out.push(c);
                }
                continue;
            }
            // A deal that exists: every party signed it.
            if self.agreement(&x.id)?.exists != Some(true) {
                continue;
            }
            let mut grants: Vec<Hash> = t.payee_grants.iter().flatten().copied().collect();
            if let Some(l) = t.chain.iter().flatten().find(|l| l.judge == Judge::SplitService) {
                grants.extend(l.successors());
            }
            for g in grants {
                let Some(gh) = self.v.get(&g).filter(|x| self.is_law(x, types::GRANT)) else { continue };
                if Grant::decode(&gh.inside.payload).is_ok_and(|x| &x.grantee == service) {
                    if let Some(p) = gh.act.outside.signer.filter(|p| t.parties.contains(p)) {
                        if !out.contains(&p) {
                            out.push(p);
                        }
                    }
                }
            }
        }
        Ok(out)
    }

    /// The splits a service published with its own key (rule 20), valid
    /// under Identity, each decoded.
    fn splits_of(&self, service: &Hash) -> Vec<(&'a Held, Split)> {
        self.v
            .signed_by(service)
            .filter(|h| self.is_law(h, types::SPLIT) && self.key_grant(h).is_none() && self.valid(&h.id))
            .filter_map(|h| Split::decode(&h.inside.payload).ok().map(|s| (h, s)))
            .collect()
    }

    /// What a split service owes (rule 29; audit, October 2026, gap 3).
    /// Unsplit: every receipt the service signed with a grant key, backed,
    /// binding, or unknown under a limited grant (money coming in for its
    /// grantor, rules 19 and 20), and every
    /// payer's claim with the rail's answer ([`Self::rail_valid`]) to a
    /// grantor of the service for which the grantor holds no receipt, that
    /// no split of the service's own key names; the old service owes on
    /// everything it received before (rule 30). Unpaid: every payout of
    /// such a split that no receipt of its receiver naming the split
    /// discharges in full (rules 23, 24, 24a); a receiver that is a
    /// collective signs by its own rules. Each names one receiver and one
    /// agreement (rule 55).
    pub fn service_account(&self, service: &Hash) -> R<ServiceAccount> {
        use crate::finance::Payload as Fin;
        let splits = self.splits_of(service);
        let split_names = |payment: &Hash| splits.iter().any(|(_, s)| &s.receipt == payment);
        let mut unsplit = vec![];
        // Receipts the service signed with a grant key, backed.
        for h in self.v.held_acts() {
            if h.inside.spec != self.mips.finance {
                continue;
            }
            let Ok(Fin::Receipt(r)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if !self.key_grant(h).is_some_and(|(_, g)| &g.grantee == service) {
                continue;
            }
            // Backed, binding after the grant ended (rule 30), or unknown
            // under a limited grant (rule 18d): the service signed that the
            // money came in, and answers for it either way.
            if !matches!(self.backing(&h.id)?, Backing::Backed { .. } | Backing::Binds { .. } | Backing::Unknown { .. }) {
                continue;
            }
            if !split_names(&h.id) {
                unsplit.push(Unsplit {
                    payment: h.id,
                    claim: false,
                    receiver: r.payee,
                    agreement: r.purchase.as_ref().map(|p| p.agreement).unwrap_or(r.fulfils),
                    amount: r.amount,
                });
            }
        }
        // Payers' claims showing money arrived for a grantor without a receipt.
        let grantors = self.grantors_of(service)?;
        for h in self.v.held_acts() {
            if h.inside.spec != self.mips.finance || !self.rail_valid.contains_key(&h.id) || !self.payers_claim(h) {
                continue;
            }
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if !grantors.contains(&c.payee) {
                continue;
            }
            if self.receipts_for_proof(&c.proof).iter().any(|(_, r)| r.payee == c.payee) {
                continue;
            }
            if !split_names(&h.id) {
                unsplit.push(Unsplit {
                    payment: h.id,
                    claim: true,
                    receiver: c.payee,
                    agreement: c.purchase.as_ref().map(|p| p.agreement).unwrap_or(c.fulfils),
                    amount: c.amount,
                });
            }
        }
        // Each payout, discharged by the receiver's own receipts naming the split.
        let mut unpaid = vec![];
        for (sh, s) in &splits {
            for (i, p) in s.payouts.iter().enumerate() {
                let mut received: u64 = 0;
                for r in self.v.signed_by(&p.receiver) {
                    if r.inside.spec != self.mips.finance || self.key_grant(r).is_some() || !self.valid(&r.id) {
                        continue;
                    }
                    let Ok(Fin::Receipt(x)) = Fin::decode(r.inside.type_, &r.inside.payload) else { continue };
                    let names = x.fulfils == sh.id || r.inside.objects.iter().flatten().any(|o| o.chain == sh.id || o.predecessor == sh.id);
                    if x.payee != p.receiver || !names || !self.consent(&r.id)?.counts() {
                        continue;
                    }
                    received = received.saturating_add(x.amount.value);
                }
                if received < p.amount {
                    unpaid.push(Unpaid {
                        split: sh.id,
                        payout: i,
                        receiver: p.receiver,
                        agreement: s.agreement,
                        amount: p.amount,
                        received,
                    });
                }
            }
        }
        Ok(ServiceAccount { service: *service, unsplit, unpaid })
    }

    // ------------------------------------------------------------ the release

    /// A public domain release, judged (rule 17, F121 shape D): every direct
    /// owner of the work signs (N7), unless the release rule says otherwise;
    /// a collective owner signs by its own rules, meeting the lanes of every
    /// layer a release touches (Envelope, Finance, Law). A timed release
    /// names a point on each agreement's time reference (N11).
    pub fn release(&self, id: &Hash) -> R<ReleaseEval> {
        let h = self.held(id)?;
        if !self.is_law(h, types::RELEASE) {
            return Err(LawError::Check("not a release"));
        }
        let r = Release::decode(&h.inside)?;
        let mut e = ReleaseEval {
            id: *id,
            release: r.clone(),
            complete: false,
            why: None,
            holders: vec![],
            signed: vec![],
        };
        let fail = |mut e: ReleaseEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the release is not valid under Identity");
        }
        if h.act.outside.content_key.is_none() {
            return fail(e, "a release is public, so that its content keys are published");
        }
        let mut met = true;
        for (ag, i) in &r.stakes {
            let lineage = self.lineage(ag)?;
            let named = &lineage[0].1;
            let Some(stake) = named.stakes.iter().flatten().nth(*i as usize) else {
                return fail(e, "a release names a stake its agreement does not define");
            };
            if stake.object != Who::Id(r.work) {
                return fail(e, "a release names a stake in another work");
            }
            // The release rule, the holders and the time reference are those
            // of the agreement in force (rule 17, "the release rule of each
            // such agreement in force"): its latest version, which the
            // version the release names must be, or one it descends from
            // (audit, October 2026, gap 7: naming an older, looser version
            // ends nothing).
            let current = self.latest_version(ag)?;
            let in_force = self.lineage(&current)?;
            if !in_force.iter().any(|(x, _)| x == ag) {
                return fail(e, "a release names a version of the claiming agreement that is neither in force nor one the version in force descends from (rule 17)");
            }
            let t = &in_force[0].1;
            let Some((_, stake)) = t.stake_on(&Who::Id(r.work)) else {
                return fail(e, "the claiming agreement in force holds no stake in the work (rule 17)");
            };
            if r.timed.is_some() && t.time.is_none() && t.cmip(TIME_REFERENCE_TASK).is_none() {
                return fail(e, "a timed release names a point on the time reference of each agreement whose stake it ends (N11)");
            }
            let this = if t.is_collective() { self.collective_of(ag)? } else { None };
            let mut holders = vec![];
            for (w, _) in &stake.holders {
                match w.resolve(this.as_ref()) {
                    Some(x) => holders.push(x),
                    None => return fail(e, "a holder written null, and the collective is not held"),
                }
            }
            let mut signed = vec![];
            for x in &holders {
                if self.signed_act(h, x)? {
                    signed.push(*x);
                }
            }
            // The release rule in force: set at founding, changed only by a
            // clone every owner signs (N8).
            let rule = t.release_rule.clone().unwrap_or(Rule::All);
            met &= rule.met(&holders, &signed);
            for x in holders {
                if !e.holders.contains(&x) {
                    e.holders.push(x);
                }
            }
            for x in signed {
                if !e.signed.contains(&x) {
                    e.signed.push(x);
                }
            }
        }
        let order = e.holders.clone();
        e.signed.sort_by_key(|x| order.iter().position(|h| h == x));
        if !met {
            return fail(e, "the release rule is not met: by default, every direct owner of the work signs (N7)");
        }
        e.complete = true;
        Ok(e)
    }

    /// The complete release of a work, if one is held.
    pub fn released(&self, work: &Hash) -> R<Option<ReleaseEval>> {
        for x in self.v.held_acts() {
            if !self.is_law(x, types::RELEASE) {
                continue;
            }
            if !Release::decode(&x.inside).is_ok_and(|r| &r.work == work) {
                continue;
            }
            let e = self.release(&x.id)?;
            if e.complete {
                return Ok(Some(e));
            }
        }
        Ok(None)
    }

    /// A claim on a released work that the release does not name in its
    /// history: shown beside the release, openly contested (rule 15, N12),
    /// which the release cannot end. The release, if so.
    pub fn claim_after_release(&self, claim: &Hash, work: &Hash) -> R<Option<Hash>> {
        let Some(e) = self.released(work)? else { return Ok(None) };
        Ok((!e.release.claims.contains(claim) && claim != &e.id).then_some(e.id))
    }
}

/// `total` divided by `weights`, in whole parts, leftovers to the first:
/// a fork's sides, which "Fork (type 19)" still divides "leftovers to the
/// first side", and a fork's members counted alike. A payment divided on a
/// stake follows rule 15a instead ([`divide_stake`], F150), its leftovers
/// ordered by no list.
fn divide_first(total: u64, weights: &[u64]) -> Vec<u64> {
    let sum: u128 = weights.iter().map(|w| *w as u128).sum();
    if sum == 0 {
        return vec![0; weights.len()];
    }
    let mut out: Vec<u64> = weights
        .iter()
        .map(|w| ((total as u128) * (*w as u128) / sum) as u64)
        .collect();
    let left = total - out.iter().sum::<u64>();
    if let Some(f) = out.first_mut() {
        *f += left;
    }
    out
}
