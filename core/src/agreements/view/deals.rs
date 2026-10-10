//! Client conformance on a deal's versions (rule 45b; F221, F222): what a
//! client checks before its owner signs a successor of a version, and
//! before a newcomer signs onto a deal. The core binds no verifier by them;
//! it gives every client the same answer from what it holds. What it holds
//! is the client's to gather: across all its owner's devices (F221), at the
//! parties' relays and keepers (F222).

use super::*;

/// What a client shows before its owner signs a version of a deal (F221,
/// client conformance).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SuccessorCheck {
    /// Other successors of the same version its owner already signed
    /// (proposed, or by a signature act), from any device: the client shows
    /// the first, and never signs a second silently.
    pub already_signed: Vec<Hash>,
    /// For a settling version (field 26): successors of the version it
    /// settles from (the reference) that its owner signed and that it
    /// leaves unnamed: neither on its own line nor at or above a tip it
    /// names. A conforming client names them all before signing.
    pub unnamed: Vec<Hash>,
}

impl SuccessorCheck {
    /// Nothing to show: the client may sign.
    pub fn clear(&self) -> bool {
        self.already_signed.is_empty() && self.unnamed.is_empty()
    }
}

impl<'a> AgreementsView<'a> {
    /// Whether `owner` signed the version `x`: proposed it, or signed a
    /// signature act naming it (any device: the verifier reads its owner's
    /// acts, not one device's sequence).
    fn signed_version(&self, x: &Hash, owner: &Hash) -> bool {
        self.v.get(x).is_some_and(|h| h.act.outside.signer.as_ref() == Some(owner)) || !self.signers(x, &[*owner]).is_empty()
    }

    /// The versions held cloning `parent` (any, complete or not).
    fn successors_of(&self, parent: &Hash) -> Vec<Hash> {
        let mut out: Vec<Hash> = self
            .v
            .held_acts()
            .filter(|h| self.is_agreements(h, types::TERMS) && self.terms(&h.id).is_ok_and(|t| t.parent == Some(*parent)))
            .map(|h| h.id)
            .collect();
        out.sort();
        out
    }

    /// F221, decided by Nobody, allegedly, 10 October 2026 (client
    /// conformance): before `owner` signs `candidate`, a version of a deal,
    /// its client checks whether its owner has already signed another
    /// successor of the same version; if so, it shows the first and does
    /// not sign silently. A settling version (field 26) names every
    /// successor of the reference its owner signed. The reference is read
    /// as the latest version both the candidate's line and every tip it
    /// names descend from (mechanic, the build's); a successor counts as
    /// named where it is on the candidate's line or at or above a tip it
    /// names (F188's reading of "names every tip it saw").
    pub fn before_signing(&self, owner: &Hash, candidate: &Hash) -> R<SuccessorCheck> {
        let t = self.terms(candidate)?;
        let line: Vec<Hash> = self.lineage(candidate)?.into_iter().map(|(h, _)| h).collect();
        let mut already_signed = vec![];
        if let Some(p) = t.parent {
            for s in self.successors_of(&p) {
                if &s != candidate && self.signed_version(&s, owner) {
                    already_signed.push(s);
                }
            }
        }
        let mut unnamed = vec![];
        if let Some(tips) = t.settles.as_ref() {
            let tip_lines: Vec<Vec<Hash>> = tips.iter().filter_map(|o| self.lineage(o).ok()).map(|l| l.into_iter().map(|(h, _)| h).collect()).collect();
            // The reference: the nearest version on the candidate's line
            // that every named tip's line holds.
            let reference = line.iter().skip(1).find(|r| !tip_lines.is_empty() && tip_lines.iter().all(|l| l.contains(r)));
            if let Some(r) = reference {
                for s in self.successors_of(r) {
                    let named = line.contains(&s) || tip_lines.iter().any(|l| l.contains(&s));
                    if !named && self.signed_version(&s, owner) {
                        unnamed.push(s);
                    }
                }
            }
        }
        Ok(SuccessorCheck { already_signed, unnamed })
    }

    /// F222, decided by Nobody, allegedly, 10 October 2026 (client
    /// conformance): before a newcomer signs onto a deal by signing
    /// `joining` (the version that names her), her client looks for another
    /// successor of a version on the line she joins, at the parties' relays
    /// and keepers, and warns her if it finds one: each successor of a
    /// version on `joining`'s line, not itself on that line, that no
    /// settling version on that line names (at or above a tip it names);
    /// one a settlement on her line already dropped is final and harms
    /// nobody (F192), so it is not warned of (mechanic, the build's).
    pub fn joining_warnings(&self, joining: &Hash) -> R<Vec<Hash>> {
        let lx = self.lineage(joining)?;
        let line: Vec<Hash> = lx.iter().map(|(h, _)| *h).collect();
        let mut dropped: Vec<Vec<Hash>> = vec![];
        for (_, t) in &lx {
            for o in t.settles.iter().flatten() {
                if let Ok(l) = self.lineage(o) {
                    dropped.push(l.into_iter().map(|(h, _)| h).collect());
                }
            }
        }
        let mut out = vec![];
        for r in line.iter().skip(1) {
            for s in self.successors_of(r) {
                if line.contains(&s) || dropped.iter().any(|l| l.contains(&s)) {
                    continue;
                }
                out.push(s);
            }
        }
        out.sort();
        Ok(out)
    }
}
