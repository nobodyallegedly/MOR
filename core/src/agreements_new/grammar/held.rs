//! The acts a verifier holds, decoded, indexed, and what each names.
//!
//! In plain words: the verifier is handed acts as bytes. Each is checked as
//! the encoding's checker checks it ([`crate::agreements_new::check_held`]):
//! a rejected act never reaches the grammar rules; an invalid act is held and
//! shown, and counts for nothing; a private act without its key, or one
//! signed by a scheme this library does not implement, is held but cannot be
//! read, and every answer that needs it is unchecked (G9). Beside the acts,
//! a verifier may hold pieces that are no acts (the words of a body, a piece
//! Terms rely on), so that it can tell them from an act it lacks.

use crate::agreements_new::check::{check_held, Decoded, Verdict};
use crate::agreements_new::{Finding, Named, Report, Statement, Terms};
use crate::hash::Hash;
use crate::lock::ContentKey;
use std::collections::{HashMap, HashSet, VecDeque};

/// One act held that reached the grammar rules.
#[derive(Clone, Debug)]
pub struct HeldAct {
    pub id: Hash,
    pub signer: Hash,
    pub act: Decoded,
    /// The cases of invalid the act shows by itself or among the acts held
    /// (G2.1, G3.1, G4.2, G10.1, G6.1). An act with any counts for nothing.
    pub invalid: Vec<Finding>,
    /// What it leaves unread, and notes (G2.2, G5.2, G10.4, G12.3, G6.1).
    pub notes: Vec<Finding>,
}

/// The acts a verifier holds.
#[derive(Clone, Debug, Default)]
pub struct Held {
    acts: Vec<HeldAct>,
    by_id: HashMap<Hash, usize>,
    /// Held, but not readable: private without key, or unknown scheme.
    unreadable: HashSet<Hash>,
    /// Bytes held that were rejected: never reach the grammar rules.
    rejected: HashSet<Hash>,
    /// Pieces held that are no acts.
    pieces: HashSet<Hash>,
}

/// The fields of an act that name another act by fingerprint (G13.1), with
/// the field's name.
pub type Naming = (&'static str, Hash);

impl Held {
    /// Read acts as bytes, each with its content key where it is private.
    pub fn from_bytes(acts: &[(&[u8], Option<&ContentKey>)]) -> Held {
        let mut h = Held::default();
        for a in check_held(acts) {
            let Some(id) = a.id else { continue };
            match a.verdict {
                Verdict::Pass | Verdict::Invalid => {
                    let (Some(signer), Some(act)) = (a.signer, a.act) else { continue };
                    h.by_id.insert(id, h.acts.len());
                    h.acts.push(HeldAct { id, signer, act, invalid: a.invalid, notes: a.notes });
                }
                Verdict::Unknown | Verdict::Unopened => {
                    h.unreadable.insert(id);
                }
                Verdict::Rejected | Verdict::NotThisEncoding => {
                    h.rejected.insert(id);
                }
            }
        }
        h
    }

    /// Hold a piece that is no act (words, a piece relied on).
    pub fn hold_piece(&mut self, h: Hash) {
        self.pieces.insert(h);
    }

    pub fn acts(&self) -> &[HeldAct] {
        &self.acts
    }

    pub fn get(&self, id: &Hash) -> Option<&HeldAct> {
        self.by_id.get(id).map(|i| &self.acts[*i])
    }

    pub fn terms(&self, id: &Hash) -> Option<&Terms> {
        match self.get(id).map(|a| &a.act) {
            Some(Decoded::Terms(t)) => Some(t),
            _ => None,
        }
    }

    pub fn statement(&self, id: &Hash) -> Option<&Statement> {
        match self.get(id).map(|a| &a.act) {
            Some(Decoded::Statement(s)) => Some(s),
            _ => None,
        }
    }

    pub fn report(&self, id: &Hash) -> Option<&Report> {
        match self.get(id).map(|a| &a.act) {
            Some(Decoded::Report(r)) => Some(r),
            _ => None,
        }
    }

    pub fn is_unreadable(&self, id: &Hash) -> bool {
        self.unreadable.contains(id)
    }

    pub fn is_piece(&self, id: &Hash) -> bool {
        self.pieces.contains(id)
    }

    pub fn is_invalid(&self, id: &Hash) -> bool {
        self.get(id).is_some_and(|a| !a.invalid.is_empty())
    }

    /// The agreement an act is within (its root): a Statement's `agreement`;
    /// a Terms act's `agreement`, or for a first Terms act its own id.
    pub fn agreement_of(&self, id: &Hash) -> Option<Hash> {
        match self.get(id).map(|a| &a.act) {
            Some(Decoded::Terms(t)) => Some(t.agreement.unwrap_or(*id)),
            Some(Decoded::Statement(s)) => Some(s.agreement),
            _ => None,
        }
    }

    /// The previous act in its signer's line, for Terms and Statements.
    pub fn previous_of(&self, id: &Hash) -> Option<Option<Hash>> {
        match self.get(id).map(|a| &a.act) {
            Some(Decoded::Terms(t)) => Some(t.previous),
            Some(Decoded::Statement(s)) => Some(s.previous),
            _ => None,
        }
    }

    /// Every naming of another act an act makes (G13.1; G4.7(a): every field
    /// that holds a fingerprint of an act; a report's call and the acts it
    /// relied on, G11.3). The words of a body and a cMIP are not acts, and
    /// are not listed.
    pub fn namings(&self, id: &Hash) -> Vec<Naming> {
        let Some(a) = self.get(id) else { return vec![] };
        let mut v: Vec<Naming> = vec![];
        let rel = |v: &mut Vec<Naming>, r: &Option<Vec<Named>>| {
            for n in r.iter().flatten() {
                if let Some(h) = n.fp() {
                    v.push(("relies_on", h));
                }
            }
        };
        match &a.act {
            Decoded::Terms(t) => {
                t.replaces.iter().for_each(|h| v.push(("replaces", *h)));
                t.agreement.iter().for_each(|h| v.push(("agreement", *h)));
                rel(&mut v, &t.relies_on);
                t.envelope.iter().for_each(|h| v.push(("envelope", *h)));
                t.envelope_at.iter().for_each(|h| v.push(("envelope_at", *h)));
                t.resolves.iter().flatten().for_each(|h| v.push(("resolves", *h)));
                t.continues.iter().for_each(|h| v.push(("continues", *h)));
                t.previous.iter().for_each(|h| v.push(("previous", *h)));
            }
            Decoded::Statement(s) => {
                v.push(("agreement", s.agreement));
                v.push(("terms", s.terms));
                s.under.iter().for_each(|h| v.push(("under", *h)));
                s.previous.iter().for_each(|h| v.push(("previous", *h)));
                s.answers.iter().flatten().for_each(|h| v.push(("answers", *h)));
                rel(&mut v, &s.relies_on);
                s.settlement.iter().for_each(|h| v.push(("settlement", *h)));
                s.resolves.iter().flatten().for_each(|h| v.push(("resolves", *h)));
                s.continues.iter().for_each(|h| v.push(("continues", *h)));
            }
            Decoded::Report(r) => {
                v.push(("call", r.call.act));
                r.relies_on.iter().flatten().for_each(|h| v.push(("relies_on", *h)));
                for l in r.lines.iter().flatten() {
                    match l {
                        crate::agreements_new::Line::Received { by, .. } | crate::agreements_new::Line::PassedOn { by, .. } => v.push(("by", *by)),
                        _ => {}
                    }
                    if let crate::agreements_new::Line::PassedOn { closes: Some((r, _)), .. } = l {
                        v.push(("closes", *r));
                    }
                }
            }
        }
        v
    }

    /// Everything an act names, directly or through acts that name them
    /// (G13.3: each naming is a knot), the act itself included. `extra`
    /// gives the namings of acts this module does not hold as decoded acts
    /// (a payment's naming of its version and settlement).
    pub fn closure(&self, start: &Hash, extra: &dyn Fn(&Hash) -> Vec<Hash>) -> HashSet<Hash> {
        let mut seen = HashSet::new();
        let mut q = VecDeque::from([*start]);
        while let Some(x) = q.pop_front() {
            if !seen.insert(x) {
                continue;
            }
            for (_, n) in self.namings(&x) {
                q.push_back(n);
            }
            for n in extra(&x) {
                q.push_back(n);
            }
        }
        seen
    }

    /// The acts held that name `target`, directly or through acts that name
    /// it, `target` itself included.
    pub fn naming_it(&self, target: &Hash, extra: &dyn Fn(&Hash) -> Vec<Hash>) -> HashSet<Hash> {
        let mut out = HashSet::from([*target]);
        loop {
            let before = out.len();
            for a in &self.acts {
                if out.contains(&a.id) {
                    continue;
                }
                if self.namings(&a.id).iter().map(|(_, h)| *h).chain(extra(&a.id)).any(|h| out.contains(&h)) {
                    out.insert(a.id);
                }
            }
            if out.len() == before {
                return out;
            }
        }
    }
}
