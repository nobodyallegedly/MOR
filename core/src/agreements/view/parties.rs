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
    /// no consent.
    pub(super) fn line_signed(&self, act: &Hash, party: &Hash, depth: usize, path: &mut Vec<Hash>) -> bool {
        if depth >= NESTING_BOUND || !self.names_a_line(party) || path.contains(party) {
            return false;
        }
        let Ok(v) = self.version_in_force(party) else { return false };
        let Ok(versions) = self.lineage(&v) else { return false };
        path.push(*party);
        let signed = versions.iter().any(|(id, t)| {
            if t.is_collective() || t.parties.is_empty() || self.agreement_refused(id) {
                return false;
            }
            let own: Vec<Hash> = self.valid_sigs(act, &t.parties).into_iter().map(|(p, _)| p).collect();
            t.parties.iter().all(|p| own.contains(p) || self.line_signed(act, p, depth + 1, path))
        });
        path.pop();
        signed
    }

    /// Whether a version stands refused by [`Self::party_problem`]: terms
    /// that make a loop or pass the nesting bound give no consent.
    fn agreement_refused(&self, id: &Hash) -> bool {
        self.terms(id).is_ok_and(|t| self.party_problem(id, &t).is_some())
    }

    /// The versions of the line `line` that may carry it into a loop or
    /// past the bound: every held version of it whose parties that are not
    /// themselves agreements have all signed it (mechanic, the build's: a
    /// draft nobody signed moves nothing; one every such party signed is
    /// the line's own act, whether or not it completes). Read from the
    /// terms and signature acts alone, never from another version's
    /// verdict, so no judgment depends on itself.
    fn signed_versions(&self, line: &Hash) -> Vec<(Hash, Terms)> {
        let mut out = vec![];
        for h in self.v.held_acts() {
            if !self.is_agreements(h, types::TERMS) || self.line_of(&h.id).as_ref() != Some(line) {
                continue;
            }
            let Ok(t) = self.terms(&h.id) else { continue };
            let people: Vec<Hash> = t.parties.iter().filter(|p| self.line_of(p).is_none()).copied().collect();
            if self.valid_sigs(&h.id, &people).len() == people.len() {
                out.push((h.id, t));
            }
        }
        out
    }

    /// What refuses the terms `t` of the version `id` as a party structure
    /// (draft 11, rule 15, F254), failing closed:
    ///
    /// - a party or stake holder naming an agreement by a later version,
    ///   not its line;
    /// - a loop: the version's line reached again through its
    ///   agreement-parties' lines, read on their signed versions
    ///   ([`Self::signed_versions`]). A founding version is never refused
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
        // Depth-first over the lines below, each at its layer.
        let mut todo: Vec<(Hash, usize)> = lines.into_iter().map(|l| (l, 1)).collect();
        let mut seen: BTreeSet<(Hash, usize)> = BTreeSet::new();
        while let Some((line, layer)) = todo.pop() {
            if line == me {
                if founding {
                    continue;
                }
                return Some("it makes a loop: through its parties, its own line is a party of itself (rule 15, F254)".into());
            }
            if layer > NESTING_BOUND {
                return Some("its agreement-parties nest deeper than the nesting bound, 8 layers (rule 15, F254)".into());
            }
            if !seen.insert((line, layer)) {
                continue;
            }
            for (_, v) in self.signed_versions(&line) {
                for p in v.parties.iter().filter(|p| held_terms(p)) {
                    if let Some(l) = self.line_of(p) {
                        todo.push((l, layer + 1));
                    }
                }
            }
        }
        None
    }
}
