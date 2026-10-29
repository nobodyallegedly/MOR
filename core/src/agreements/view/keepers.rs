//! Keepers, read from their records (Agreements, "Keepers", rules 33 and 36
//! to 42; "Keeper record (type 2)"; "Belongs to").
//!
//! In plain words:
//!
//! 1. A keeper's records are acts its operator signs, one per act recorded,
//!    each naming the one before by `prev`: the keeper's sequence. One
//!    record is before another when it lies in the other's ancestry there;
//!    records in two sequences of one operator are never ordered against
//!    each other.
//! 2. A record counts only alongside the act it names: the verifier holds
//!    the act, the act is valid as an act, and its signer is the one the
//!    record names. A record of a rotation, a revocation or a line serves
//!    only as a point in the sequence.
//! 3. An act belongs to an agreement when it names it, or an act that
//!    belongs to it, in `objects` (chain and predecessor alike), or through
//!    the act it answers (a receipt or claim through the claim it pays
//!    under and what it fulfils; an obligation through its agreement or
//!    offer; an offer through the agreement it is made under), whatever the
//!    act named is, save an Identity act, which is followed no further.
//!    Every act in a collective's name belongs to the collective's
//!    agreement. Its keepers are those of the version in force for the act.
//! 4. A deadline is met by an anchor of the act, or by keepers whose records
//!    of it lie before records anchored by the deadline; it is missed only
//!    by keepers' sequences anchored past it that hold no record of the act,
//!    enough of them that the keepers' rule can no longer be met. Otherwise
//!    it is undetermined.
//!
//! Records a caller states (`keeper_logs`) are read beside those held, as
//! before: a log a verifier states is one more sequence.

use super::*;
use crate::envelopes::anchoring::Reference;

/// A keeper's sequence, as the records held make it.
#[derive(Clone, Debug, Default)]
pub struct KeeperSequence {
    /// Each record the operator signed that is in format, public and stands
    /// as an act of its operator: what it records, and the record before it
    /// in the sequence (its `prev`, where that is a record of the same
    /// operator).
    pub records: BTreeMap<Hash, (KeeperRecord, Option<Hash>)>,
    /// The records naming each act, whatever that act's standing.
    pub of: BTreeMap<Hash, Vec<Hash>>,
}

impl KeeperSequence {
    /// Whether record `a` lies in record `b`'s ancestry (strictly before it).
    pub fn before(&self, a: &Hash, b: &Hash) -> bool {
        let mut cur = self.records.get(b).and_then(|(_, p)| *p);
        let mut steps = 0usize;
        while let Some(c) = cur {
            if &c == a {
                return true;
            }
            steps += 1;
            if steps > self.records.len() {
                return false;
            }
            cur = self.records.get(&c).and_then(|(_, p)| *p);
        }
        false
    }

    /// Whether record `a` is `b` or lies before it.
    pub fn at_or_before(&self, a: &Hash, b: &Hash) -> bool {
        a == b || self.before(a, b)
    }
}

/// Whether a deadline was met (Agreements rule 33).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Deadline {
    /// Shown met: by an anchor of the act itself at or before the point, or
    /// by keepers meeting their rule with records of the act lying before
    /// records anchored at or before it.
    Met { by_anchor: bool },
    /// Shown missed: keepers' sequences anchored past the point hold no
    /// record of the act, enough of them that the rule can no longer be met.
    Missed { keepers: Vec<Hash> },
    /// Neither shows it.
    Undetermined,
}

impl<'a> AgreementsView<'a> {
    /// The keeper records `op` signed that this verifier holds and that
    /// stand: in format (type 2), public, and signed under a key its chain
    /// bound (valid, or voided or disputed by a later rotation of the
    /// keeper: "a keeper's own later rotation never undoes what its records
    /// placed", rule 42).
    pub fn keeper_sequence(&self, op: &Hash) -> Rc<KeeperSequence> {
        if let Some(s) = self.keeper_seqs.borrow().get(op) {
            return s.clone();
        }
        let mut seq = KeeperSequence::default();
        for h in self.v.signed_by(op) {
            if !self.is_agreements(h, types::KEEPER_RECORD) || !h.act.outside.is_public() {
                continue;
            }
            if !matches!(self.status(&h.id), Status::Valid | Status::Void | Status::Disputed) {
                continue;
            }
            let Ok(r) = KeeperRecord::decode(&h.inside) else { continue };
            let prev = h.inside.prev.as_ref().and_then(|p| p.first().copied());
            seq.records.insert(h.id, (r, prev));
        }
        // `prev` places a record in the keeper's sequence only where it
        // names a record of the same operator.
        let ids: BTreeSet<Hash> = seq.records.keys().copied().collect();
        for (_, p) in seq.records.values_mut() {
            if p.is_some_and(|x| !ids.contains(&x)) {
                *p = None;
            }
        }
        for (id, (r, _)) in &seq.records {
            seq.of.entry(r.act).or_default().push(*id);
        }
        let s = Rc::new(seq);
        self.keeper_seqs.borrow_mut().insert(*op, s.clone());
        s
    }

    /// Whether a keeper record of `op` naming `act` counts alongside it
    /// (rule 42's first two conditions): the verifier holds the act, it is
    /// valid as an act (its signature and format, whatever a rotation did
    /// to it since), and its signer is the one the record names.
    fn record_alongside(&self, rec: &KeeperRecord) -> bool {
        let Some(x) = self.v.get(&rec.act) else { return false };
        x.act.outside.signer == Some(rec.signer) && !matches!(self.v.status(&rec.act), Status::Invalid | Status::Unknown)
    }

    /// Whether the keeper `op` recorded `x` before recording `y`, in one of
    /// its sequences (rules 37, 41): `x`'s record counting alongside its
    /// act, `y`'s serving only as a point. A log the caller states counts
    /// as one more sequence.
    pub fn keeper_before(&self, op: &Hash, x: &Hash, y: &Hash) -> bool {
        let stated = self.keeper_logs.get(op).is_some_and(|log| {
            let a = log.iter().position(|z| z == x);
            let b = log.iter().position(|z| z == y);
            matches!((a, b), (Some(a), Some(b)) if a < b)
        });
        if stated {
            return true;
        }
        let s = self.keeper_sequence(op);
        let (Some(xs), Some(ys)) = (s.of.get(x), s.of.get(y)) else { return false };
        xs.iter()
            .filter(|rx| self.record_alongside(&s.records[*rx].0))
            .any(|rx| ys.iter().any(|ry| s.before(rx, ry)))
    }

    /// Whether the keeper `op` holds a record of `x` that counts alongside it.
    pub fn keeper_recorded_act(&self, op: &Hash, x: &Hash) -> bool {
        if self.keeper_logs.get(op).is_some_and(|log| log.contains(x)) {
            return true;
        }
        let s = self.keeper_sequence(op);
        s.of.get(x).is_some_and(|rs| rs.iter().any(|r| self.record_alongside(&s.records[r].0)))
    }

    // ------------------------------------------------------------ belongs to

    /// The agreements `act` belongs to ("Belongs to"), each as the version
    /// it names (a terms act, or a lone seller's offer), without repeats,
    /// followed through every step the acts held allow, at no fixed depth.
    pub fn belongs_to(&self, act: &Hash) -> Vec<Hash> {
        self.belongs_to_judged(act).0
    }

    /// [`Self::belongs_to`], and whether it is complete: `false` where a
    /// step names an act this verifier does not hold, beyond which what the
    /// act belongs to is unknown.
    pub fn belongs_to_judged(&self, act: &Hash) -> (Vec<Hash>, bool) {
        let mut out = vec![];
        let mut seen = vec![];
        let mut complete = true;
        self.belongs_into(act, &mut seen, &mut out, &mut complete);
        (out, complete)
    }

    fn belongs_into(&self, act: &Hash, seen: &mut Vec<Hash>, out: &mut Vec<Hash>, complete: &mut bool) {
        if seen.contains(act) {
            return;
        }
        seen.push(*act);
        let Some(x) = self.v.get(act) else {
            *complete = false;
            return;
        };
        let push = |h: Hash, out: &mut Vec<Hash>| {
            if !out.contains(&h) {
                out.push(h);
            }
        };
        // Every action and decision of a collective belongs to the
        // collective's agreement; its identity-chain acts and its Identity
        // everyday acts belong to none.
        if let Some(c) = x.act.outside.signer.filter(|_| x.inside.spec != self.mirs.identity) {
            if let Some(f) = self.founding_of(&c) {
                if let Ok(Some(ag)) = self.in_force(act) {
                    push(ag, out);
                } else {
                    push(f, out);
                }
            }
        }
        // One step: each `objects` entry, chain and predecessor alike, and
        // each act answered, whatever the act named is. An agreement's terms
        // are reached; an Identity act (genesis, a rotation, a chain
        // signature, an Identity everyday act) is followed no further.
        let mut follow = |h: &Hash, out: &mut Vec<Hash>| {
            let Some(y) = self.v.get(h) else {
                *complete = false;
                return;
            };
            if self.is_agreements(y, types::TERMS) {
                if !out.contains(h) {
                    out.push(*h);
                }
            } else if y.inside.spec != self.mirs.identity {
                self.belongs_into(h, seen, out, complete);
            }
        };
        // Named in `objects`: the agreement, or an act that belongs to it.
        for o in x.inside.objects.iter().flatten() {
            for c in [o.chain, o.predecessor] {
                follow(&c, out);
            }
        }
        // Through the act it answers.
        if x.inside.spec == self.mirs.money {
            match crate::money::Payload::decode(x.inside.type_, &x.inside.payload) {
                Ok(crate::money::Payload::Receipt(r)) => {
                    if let Some(p) = &r.purchase {
                        follow(&p.agreement, out);
                    }
                    follow(&r.fulfils, out);
                }
                Ok(crate::money::Payload::Claim(c)) => {
                    if let Some(p) = &c.purchase {
                        follow(&p.agreement, out);
                    }
                    follow(&c.fulfils, out);
                }
                Ok(crate::money::Payload::Obligation(o)) => {
                    if let Some(a) = &o.agreement {
                        follow(a, out);
                    }
                }
                _ => {}
            }
        } else if let Some((_, pa)) = self.pub_act(act) {
            // A publication belongs to the ownership agreement it names; a
            // lone seller's to itself.
            match pa.publication.owners {
                Some(o) => follow(&o, out),
                None => push(*act, out),
            }
        } else if let Some((_, t)) = self.tag_of(act) {
            // A price tag belongs through its publication.
            if let crate::money::Priced::Publication(p) = t.priced {
                follow(&p, out);
            }
        }
    }

    /// The version in force for `act` of an agreement it belongs to, named
    /// as `named` (a terms act, or a lone seller's offer): for a collective,
    /// the agreement in force at the act where the act is in the
    /// collective's name, the version named otherwise; for a deal, the
    /// latest complete version on `named`'s line the act's history holds,
    /// or `named` where it holds none. A lone seller's offer is its own.
    pub fn keepers_version(&self, act: &Hash, named: &Hash) -> Option<Hash> {
        let t = self.terms(named).ok()?;
        if t.is_collective() {
            let x = self.v.get(act)?;
            if let Some(c) = x.act.outside.signer {
                if self.founding_of(&c).is_some_and(|f| self.lineage(named).ok().is_some_and(|l| l.last().is_some_and(|r| r.0 == f))) {
                    if let Ok(Some(ag)) = self.in_force(act) {
                        return Some(ag);
                    }
                }
            }
            return Some(*named);
        }
        let below = self.versions_below(named);
        let history = self.act_history(act);
        // The deepest complete version below `named` the history holds.
        let mut best = *named;
        let mut depth = 0usize;
        for v in below.keys() {
            if !history.contains(v) {
                continue;
            }
            let mut d = 0usize;
            let mut cur = *v;
            while let Some(p) = below.get(&cur) {
                d += 1;
                cur = *p;
            }
            if d > depth {
                depth = d;
                best = *v;
            }
        }
        Some(best)
    }

    /// The acts in `act`'s history, as far as held: what its `prev` and its
    /// `objects` name, followed back.
    pub(super) fn act_history(&self, act: &Hash) -> BTreeSet<Hash> {
        let mut seen = BTreeSet::new();
        let mut todo = vec![*act];
        while let Some(a) = todo.pop() {
            let Some(x) = self.v.get(&a) else { continue };
            for p in x.inside.prev.iter().flatten().chain(x.inside.objects.iter().flatten().map(|o| &o.predecessor)) {
                if seen.insert(*p) {
                    todo.push(*p);
                }
            }
        }
        seen
    }

    /// The keepers that count for `act`: for each agreement it belongs to,
    /// the operators the version in force for it names, and their rule.
    pub fn keepers_for(&self, act: &Hash) -> Vec<(Hash, Keepers)> {
        let mut out = vec![];
        for named in self.belongs_to(act) {
            let Some(v) = self.keepers_version(act, &named) else { continue };
            if let Ok(t) = self.terms(&v) {
                if let Some(k) = t.keepers {
                    out.push((v, k));
                }
            }
        }
        out
    }

    /// Whether the keepers of an agreement `act` belongs to recorded it
    /// before recording `point` (a rotation, a revocation), as their rule
    /// counts them (rules 38, 41, 42).
    pub fn keepers_recorded_before(&self, act: &Hash, point: &Hash) -> bool {
        self.keepers_for(act).iter().any(|(_, k)| {
            let placed: Vec<Hash> = k.operators.iter().filter(|op| self.keeper_before(op, act, point)).copied().collect();
            !placed.is_empty() && k.rule.met(&k.operators, &placed)
        })
    }

    /// The acts a rotation voids that the keepers of an agreement they
    /// belong to recorded before recording that rotation (Identity rule 34;
    /// Agreements rules 41 and 42): what a caller states to Identity by
    /// [`Verifier::keeper_recorded`], so that Identity shows them disputed.
    pub fn keeper_disputed_acts(&self) -> Vec<Hash> {
        self.keepers_judged().0
    }

    /// The acts a rotation voids whose keepers' records cannot be read in
    /// full, since an agreement they may belong to lies beyond an act this
    /// verifier does not hold ("Belongs to"), and that no keeper read
    /// rescues: what a caller states to Identity by
    /// [`Verifier::keepers_cannot_tell`], so that Identity shows them
    /// unknown, never void.
    pub fn keeper_unknown_acts(&self) -> Vec<Hash> {
        self.keepers_judged().1
    }

    fn keepers_judged(&self) -> (Vec<Hash>, Vec<Hash>) {
        let (mut rescued, mut unknown) = (vec![], vec![]);
        for h in self.v.held_acts() {
            if !matches!(self.v.status(&h.id), Status::Void | Status::Disputed) {
                continue;
            }
            let Some(r) = self.v.judged_by(&h.id) else { continue };
            if self.keepers_recorded_before(&h.id, &r) {
                rescued.push(h.id);
            } else if self.v.status(&h.id) == Status::Void && !self.belongs_to_judged(&h.id).1 {
                unknown.push(h.id);
            }
        }
        (rescued, unknown)
    }

    // ------------------------------------------------------------ deadlines

    /// Rule 33: whether `act` met a deadline at `point` on `reference`,
    /// under the keepers `keepers` its agreement names (the version in force
    /// for it). Met by an anchor of the act at or before the point, which
    /// wins over any keeper's silence; or by keepers meeting their rule,
    /// each with a record of the act at or before a record of its anchored
    /// at or before the point. Missed only where keepers whose sequences are
    /// anchored past the point, holding no record of the act up to that
    /// anchored record, are enough that the rule can no longer be met.
    pub fn deadline(&self, act: &Hash, keepers: Option<&Keepers>, reference: &Reference, point: u64) -> Deadline {
        if self.anchored.earliest(act, reference).is_some_and(|p| p <= point) {
            return Deadline::Met { by_anchor: true };
        }
        let Some(k) = keepers else { return Deadline::Undetermined };
        let mut met = vec![];
        let mut missing = vec![];
        for op in &k.operators {
            let s = self.keeper_sequence(op);
            let recs: Vec<&Hash> = s.of.get(act).into_iter().flatten().filter(|r| self.record_alongside(&s.records[*r].0)).collect();
            let anchored = |by: &dyn Fn(u64) -> bool| -> Vec<Hash> {
                s.records.keys().filter(|r| self.anchored.earliest(r, reference).is_some_and(by)).copied().collect()
            };
            let early = anchored(&|p| p <= point);
            if recs.iter().any(|r| early.iter().any(|a| s.at_or_before(r, a))) {
                met.push(*op);
                continue;
            }
            let late = anchored(&|p| p > point);
            if late.iter().any(|a| !recs.iter().any(|r| s.at_or_before(r, a))) {
                missing.push(*op);
            }
        }
        if !met.is_empty() && k.rule.met(&k.operators, &met) {
            return Deadline::Met { by_anchor: false };
        }
        let could: Vec<Hash> = k.operators.iter().filter(|o| !missing.contains(o)).copied().collect();
        if !missing.is_empty() && !k.rule.met(&k.operators, &could) {
            return Deadline::Missed { keepers: missing };
        }
        Deadline::Undetermined
    }
}
