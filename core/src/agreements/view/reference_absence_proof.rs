//! A reference absence-proof module: **experimental, outside the core
//! path** (Agreements rule 51, task "Absence proof"; F172).
//!
//! In plain words: the core no longer proves absence by time. An
//! abandonment clause may name an absence-proof cMIP (key 3) that must
//! accept a declaration before it counts; the core reads no cMIP, and takes
//! that answer from its caller ([`AgreementsView::absence_accepted`]). This file
//! keeps the time checks the core used before F172 (F136, F148, F158, F162
//! items 3 and 5) as one such module, so a caller can compute an answer
//! with it. It is a reference, not a specification: no MIP defines it,
//! its spec hash and parameters are this file's own, and nothing in the
//! core path calls it.
//!
//! Precisely: the clause names [`spec`] in key 3, with a period (a `uint`,
//! counted on the agreement's time reference) as its parameters
//! ([`params`]). Given the anchors (each act's point on that reference, as
//! the anchoring cMIP places it), the declaration is accepted when it is
//! anchored at a point D; no act of the declared party on the agreement is
//! anchored from D less the period to D; and an acknowledgement of it by
//! another party or a keeper's operator, never its signers nor the declared
//! party, is anchored within one further period, with no act of the party
//! anchored between the two. Bounds are inclusive.
//!
//! *What it does not do* (F178 item 12): an absence-proof cMIP judges only
//! the acts the history of the record or clone using the declaration
//! holds. This reference judges every act the verifier holds; a caller
//! must run it on a verifier holding that history only, and must not
//! revise an answer it gave for an act already put in force.

use super::AgreementsView;
use crate::cbor::Value;
use crate::chain::Held;
use crate::hash::{sha256, Hash};
use crate::agreements::formats::{decode_signature, types, R};
use std::collections::BTreeMap;

/// This reference module's spec hash, as a clause names it in key 3.
/// Its own, experimental: no MIP defines it.
pub fn spec() -> Hash {
    sha256(b"MOR reference absence-proof module, experimental (F172)")
}

/// The parameters a clause gives this module in key 3: the period of
/// absence, on the agreement's time reference.
pub fn params(period: u64) -> Value {
    Value::Uint(period)
}

impl<'a> AgreementsView<'a> {
    /// The reference module's answer for declaration `decl` on `anchors`
    /// (each act's point on the agreement's time reference): `Ok(())` for
    /// accepted, or why it refuses. A declaration failing its own checks
    /// ([`Self::declaration`]), or under a clause that does not name this
    /// module with a period, is refused.
    pub fn reference_absence_proof(&self, decl: &Hash, anchors: &BTreeMap<Hash, u64>) -> R<Result<(), String>> {
        let (d, clause) = match self.declaration(decl)? {
            Ok(v) => v,
            Err(w) => return Ok(Err(w)),
        };
        let period = match &clause.proof {
            Some((s, Value::Uint(p))) if *s == spec() => *p,
            _ => return Ok(Err("the clause does not name this reference module with a period".into())),
        };
        let lineage = self.lineage(&d.agreement)?;
        let terms = &lineage[0].1;
        let Some(&at) = anchors.get(decl) else {
            return Ok(Err("the declaration is not anchored on the agreement's time reference, or the anchors cannot place it (F136)".into()));
        };
        // F162 (5): any version of the agreement, earlier or later by
        // clones; in a collective, a member's acts on the collective's
        // chain.
        let mut versions: Vec<Hash> = lineage.iter().map(|(v, _)| *v).collect();
        loop {
            let later: Vec<Hash> = self
                .v
                .held_acts()
                .filter(|h| self.is_agreements(h, types::TERMS) && !versions.contains(&h.id))
                .filter(|h| self.terms(&h.id).ok().and_then(|t| t.parent).is_some_and(|p| versions.contains(&p)))
                .map(|h| h.id)
                .collect();
            if later.is_empty() {
                break;
            }
            versions.extend(later);
        }
        let collective = if terms.is_collective() { versions.first().and_then(|a| self.collective_of(a).ok().flatten()) } else { None };
        let on_agreement = |h: &Held| {
            h.inside.objects.iter().flatten().any(|o| {
                versions.contains(&o.chain) || versions.contains(&o.predecessor) || collective.as_ref() == Some(&o.chain)
            }) || (self.is_agreements(h, types::SIGNATURE) && decode_signature(&h.inside).is_ok_and(|x| versions.contains(&x)))
        };
        let presence: Vec<u64> = self
            .v
            .signed_by(&d.party)
            .filter(|h| h.id != *decl && self.valid(&h.id) && on_agreement(h))
            .filter_map(|h| anchors.get(&h.id).copied())
            .collect();
        if presence.iter().any(|p| *p >= at.saturating_sub(period) && *p <= at) {
            return Ok(Err("an act of the party on the agreement is anchored within the period before the declaration (F136)".into()));
        }
        let keepers: Vec<Hash> = terms.keepers.iter().flat_map(|k| k.operators.iter().copied()).collect();
        // F158: never the declaration's signer, nor, for a threshold, its
        // signers (the other parties whose signature acts name it).
        let mut signers: Vec<Hash> = self.v.get(decl).and_then(|h| h.act.outside.signer).into_iter().collect();
        signers.extend(self.signers(decl, &terms.parties));
        let ack = self
            .v
            .acknowledgements(decl)
            .filter(|a| self.valid(&a.id))
            .filter(|a| {
                a.act.outside.signer.is_some_and(|s| {
                    s != d.party && !signers.contains(&s) && (terms.parties.contains(&s) || keepers.contains(&s))
                })
            })
            .filter_map(|a| anchors.get(&a.id).copied())
            .filter(|p| *p >= at && *p <= at.saturating_add(period))
            .min();
        let Some(ack) = ack else {
            return Ok(Err("no acknowledgement of the declaration by another party or by the keeper, other than its signers and the declared party, is anchored within one further period after its own anchor (F148, F158)".into()));
        };
        if presence.iter().any(|p| *p >= at && *p <= ack) {
            return Ok(Err("an act of the declared party on the agreement is anchored between the declaration and its acknowledgement (F148)".into()));
        }
        Ok(Ok(()))
    }
}
