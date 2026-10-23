//! Agreements as parties of agreements (Agreements draft 11, rule 15, new
//! in draft 11, F254; to build, now built).
//!
//! In plain words: any agreement may be a party of another, the way a
//! work's agreement is a participant of a publication's. It is named by its
//! **line**: its founding version, never a later one, so that every later
//! version carries outward what the line signed and cannot escape it by
//! re-versioning. It consents by its own rule: a collective with its own
//! keys (it is named by its identity, as before); a deal when every party
//! of a version of its line signs. An agreement is never a party of
//! itself, directly or through others: terms making one so are refused,
//! failing closed. Nesting stops at [`NESTING_BOUND`] layers.
//!
//! This replaces the build's earlier mechanic, a party named by a version's
//! hash (draft 11, rule 15, "Mechanics, the build's (replaced by F254)").
//! Every choice no decision made is marked "(mechanic, the build's)" and
//! listed in `docs/agreements-draft-11-build.md`.

use super::*;

impl<'a> AgreementsView<'a> {
    /// The line `x` names, where `x` is a held terms act: its founding
    /// version, the root of its lineage. `None` for anything else.
    pub(super) fn line_of(&self, x: &Hash) -> Option<Hash> {
        let h = self.v.get(x)?;
        if !self.is_agreements(h, types::TERMS) {
            return None;
        }
        Some(self.lineage(x).ok()?.pop()?.0)
    }

    /// Whether `x` names an agreement's line: a held terms act that is a
    /// founding version (draft 11, rule 15, F254: "named by its line: its
    /// founding version, never a single later version").
    pub(super) fn names_a_line(&self, x: &Hash) -> bool {
        self.line_of(x).as_ref() == Some(x)
    }

    /// Whether the agreement-party `party` (a line) signed `act` by its own
    /// rule (F216, F235; draft 11, rule 15, F254): every party of some
    /// version of its line, from its founding version up to its version in
    /// force, signed it, each by its own signature act or, where it is
    /// itself an agreement, the same way. What a version signed stays
    /// signed through every later version: the line carries it outward
    /// (mechanic, the build's: "carrying what it signed" read as consent by
    /// any version on the line up to the one in force, since no clock
    /// orders a signature against a later version). A collective's own
    /// agreement signs with the collective's keys, by its identity, never
    /// here. Fails closed: a party named by a later version, a line already
    /// on the way (a loop), or one more layer than [`NESTING_BOUND`] gives
    /// no consent. So does a line asked again while its own consent is
    /// being read: two later versions naming each other's lines each read
    /// the other's version in force, which reads the first again (the
    /// build's walk recursed without end there, `docs/f254-loop-walk-fix.md`;
    /// mechanic, the build's).
    pub(super) fn line_signed(&self, act: &Hash, party: &Hash, depth: usize, path: &mut Vec<Hash>) -> bool {
        if depth >= NESTING_BOUND || !self.names_a_line(party) || path.contains(party) {
            return false;
        }
        if !self.consenting.borrow_mut().insert(*party) {
            return false;
        }
        path.push(*party);
        let signed = self.version_in_force(party).ok().and_then(|v| self.lineage(&v).ok()).is_some_and(|versions| {
            versions.iter().any(|(id, t)| {
                if t.is_collective() || t.parties.is_empty() || self.agreement_refused(id) {
                    return false;
                }
                let own: Vec<Hash> = self.valid_sigs(act, &t.parties).into_iter().map(|(p, _)| p).collect();
                t.parties.iter().all(|p| own.contains(p) || self.line_signed(act, p, depth + 1, path))
            })
        });
        path.pop();
        self.consenting.borrow_mut().remove(party);
        signed
    }

    /// The layer this verifier cannot follow behind `party`, which has not
    /// signed `act` by a signature act of its own (draft 17, rule 15: "a
    /// verifier that cannot follow every layer of it answers unknown"): the
    /// party itself where it holds neither its identity nor its terms; or,
    /// where it is an agreement's line, such a layer among the parties of a
    /// version of that line up to its version in force that did not sign
    /// either, at most [`NESTING_BOUND`] layers deep. `None` where every
    /// layer is held (a party that has not signed then has not signed).
    pub(super) fn unfollowed_layer(&self, act: &Hash, party: &Hash, depth: usize, path: &mut Vec<Hash>) -> Option<Hash> {
        if self.v.get(party).is_none() {
            return Some(*party);
        }
        if depth >= NESTING_BOUND || !self.names_a_line(party) || path.contains(party) {
            return None;
        }
        path.push(*party);
        let found = self.version_in_force(party).ok().and_then(|v| self.lineage(&v).ok()).and_then(|versions| {
            versions.iter().find_map(|(_, t)| {
                let own: Vec<Hash> = self.valid_sigs(act, &t.parties).into_iter().map(|(p, _)| p).collect();
                t.parties.iter().filter(|p| !own.contains(p)).find_map(|p| self.unfollowed_layer(act, p, depth + 1, path))
            })
        });
        path.pop();
        found
    }

    /// Where every party in `unsigned` (parties that have not signed `act`)
    /// stands behind a layer this verifier cannot follow
    /// ([`Self::unfollowed_layer`]): the first such layer, so that whether
    /// `act` exists is unknown (rule 15), never "does not exist".
    pub(super) fn unfollowed(&self, act: &Hash, unsigned: &[Hash]) -> Option<Hash> {
        let mut first = None;
        for p in unsigned {
            let mut path = self.line_of(act).into_iter().collect();
            let x = self.unfollowed_layer(act, p, 0, &mut path)?;
            first.get_or_insert(x);
        }
        first
    }

    /// Whether a version stands refused by [`Self::party_problem`]: terms
    /// that make a loop or pass the nesting bound give no consent.
    fn agreement_refused(&self, id: &Hash) -> bool {
        self.terms(id).is_ok_and(|t| self.party_problem(id, &t).is_some())
    }

    /// The versions of the line `line` that may carry it into a loop or
    /// past the bound: every held version of it every party signed
    /// ([`Self::walk_signed`]). Read from the terms and signature acts
    /// alone, never from another version's verdict, so no judgment depends
    /// on itself. A draft some party has not signed is no version of the
    /// line and moves nothing (F254, F107; the build's earlier mechanic,
    /// which counted only the parties that are not agreements, let the
    /// parties of an inner agreement alone sign a version naming its outer
    /// one: fixed, `docs/f254-loop-walk-fix.md`).
    fn signed_versions(&self, line: &Hash) -> Vec<(Hash, Terms)> {
        let mut out = vec![];
        for h in self.v.held_acts() {
            if !self.is_agreements(h, types::TERMS) || self.line_of(&h.id).as_ref() != Some(line) {
                continue;
            }
            let Ok(t) = self.terms(&h.id) else { continue };
            if self.walk_signed(&h.id, &t, 0, &mut vec![*line]) {
                out.push((h.id, t));
            }
        }
        out
    }

    /// Whether every party of the version `id` (terms `t`) signed it, as
    /// the loop and bound walk reads it (F254, the walk's mechanic, settled
    /// 11 October 2026): each by its own signature act; a party that is an
    /// agreement only through its own line ([`Self::walk_line_signed`]).
    /// A deal's clone needs whom rule 45b needs (F107, B19, Q28): every
    /// party of its parent whose voice remains for it, every newcomer, and
    /// every holder it takes a stake from; so a clone signed by its own
    /// parties alone (anyone may draft one naming themselves) is no version
    /// of the line, and one made after a party's voice was removed is, as
    /// rule 45b reads it (mechanic, the build's; the voices read as
    /// [`Self::deal_voices`] reads them, from declarations, signatures and
    /// the keepers' records the caller states, never from a verdict).
    /// Where those cannot be read, the clone is followed, failing closed:
    /// the walk may then refuse a loop that is not there, never miss one.
    /// `path` holds the lines on the way.
    fn walk_signed(&self, id: &Hash, t: &Terms, depth: usize, path: &mut Vec<Hash>) -> bool {
        let need = match t.parent {
            Some(_) if !t.is_collective() => {
                let Ok(lineage) = self.lineage(id) else { return true };
                let Ok(voices) = self.deal_voices(id, &lineage) else { return true };
                let parent = &lineage[1].1;
                union(&union(&voices, &Self::newcomers(parent, t)), &Self::must_sign(parent, t))
            }
            _ => t.parties.clone(),
        };
        let own: Vec<Hash> = self.valid_sigs(id, &need).into_iter().map(|(p, _)| p).collect();
        need.iter().all(|p| own.contains(p) || self.walk_line_signed(id, p, depth, path))
    }

    /// [`Self::line_signed`] as the walk reads it: the agreement-party
    /// `party` (a line) signed `act` where every party of some version of
    /// its line, itself signed by every party ([`Self::walk_signed`]),
    /// signed it. Its version in force and its versions' verdicts are not
    /// read: they depend on this walk. Fails closed: a party named by a
    /// later version, a line already on the way, or one more layer than
    /// [`NESTING_BOUND`] gives no consent.
    fn walk_line_signed(&self, act: &Hash, party: &Hash, depth: usize, path: &mut Vec<Hash>) -> bool {
        if depth >= NESTING_BOUND || !self.names_a_line(party) || path.contains(party) {
            return false;
        }
        path.push(*party);
        let signed = self.v.held_acts().any(|h| {
            if !self.is_agreements(h, types::TERMS) || self.line_of(&h.id).as_ref() != Some(party) {
                return false;
            }
            let Ok(t) = self.terms(&h.id) else { return false };
            if t.is_collective() || t.parties.is_empty() || !self.walk_signed(&h.id, &t, depth + 1, path) {
                return false;
            }
            let own: Vec<Hash> = self.valid_sigs(act, &t.parties).into_iter().map(|(p, _)| p).collect();
            t.parties.iter().all(|p| own.contains(p) || self.walk_line_signed(act, p, depth + 1, path))
        });
        path.pop();
        signed
    }

    /// What refuses the terms `t` of the version `id` as a party structure
    /// (draft 11, rule 15, F254), failing closed:
    ///
    /// - a party or stake holder naming an agreement by a later version,
    ///   not its line;
    /// - a loop: the version's line reached again through its
    ///   agreement-parties' lines, read on the versions every party
    ///   signed ([`Self::signed_versions`]). A founding version is never refused
    ///   for a loop: whatever names its line was made after it, so the
    ///   terms making the loop are the later ones (mechanic, the build's).
    ///   A later version is refused wherever such a loop holds: no clock
    ///   orders two versions of different lines, so where two make a loop
    ///   together, both are refused (fail closed);
    /// - nesting past [`NESTING_BOUND`] layers below it.
    pub(super) fn party_problem(&self, id: &Hash, t: &Terms) -> Option<String> {
        let held_terms = |x: &Hash| self.v.get(x).is_some_and(|h| self.is_agreements(h, types::TERMS));
        let named: Vec<Hash> = t
            .parties
            .iter()
            .copied()
            .chain(t.stakes.iter().flatten().flat_map(|s| s.holders.iter().filter_map(|(w, _)| match w {
                Who::Id(h) => Some(*h),
                Who::This => None,
            })))
            .filter(|x| held_terms(x))
            .collect();
        if named.iter().any(|x| !self.names_a_line(x)) {
            return Some("it names an agreement by a later version: an agreement is named by its line, its founding version (rule 15, F254)".into());
        }
        let lines: Vec<Hash> = t.parties.iter().filter(|p| held_terms(p)).copied().collect();
        if lines.is_empty() {
            return None;
        }
        let me = self.line_of(id)?;
        let founding = &me == id;
        if !founding && lines.contains(&me) {
            return Some("it names its own line as a party: an agreement is never a party of itself (rule 15, F254)".into());
        }
        // Depth-first over the lines below, carrying the path: a line met
        // again on its own path is another agreement's loop, refused where
        // it is made, and not followed round (mechanic, the build's).
        let mut path = vec![me];
        for l in lines {
            if let Some(w) = self.loop_walk(&me, founding, &l, 1, &mut path) {
                return Some(w);
            }
        }
        None
    }

    /// One step of [`Self::party_problem`]'s walk: the line `line`, at
    /// `layer` below the version judged, whose own line is `me`.
    fn loop_walk(&self, me: &Hash, founding: bool, line: &Hash, layer: usize, path: &mut Vec<Hash>) -> Option<String> {
        if line == me {
            return (!founding).then(|| "it makes a loop: through its parties, its own line is a party of itself (rule 15, F254)".into());
        }
        if layer > NESTING_BOUND {
            return Some("its agreement-parties nest deeper than the nesting bound, 8 layers (rule 15, F254)".into());
        }
        if path.contains(line) {
            return None;
        }
        path.push(*line);
        let mut below: Vec<Hash> = vec![];
        for (_, v) in self.signed_versions(line) {
            for p in &v.parties {
                if let Some(l) = self.line_of(p) {
                    if !below.contains(&l) {
                        below.push(l);
                    }
                }
            }
        }
        let found = below.iter().find_map(|l| self.loop_walk(me, founding, l, layer + 1, path));
        path.pop();
        found
    }
}
