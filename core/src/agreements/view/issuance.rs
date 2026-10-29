//! Issuance with pre-emption (Agreements draft 14, rule 96; F309, F315,
//! F328 Q13 and Q14): a clone of a collective's agreement adding new holders
//! to one stake, every existing share scaled alike, each existing holder
//! first offered its proportion by an issuance offer (type 26).

use super::*;
use crate::agreements::owners::{owner_types, IssuanceOffer};

/// One millionth of a whole share, squared: exact shares are written over
/// this denominator, so a share an issuance gives is checked to within rule
/// 9's rounding (less than one millionth from exact).
const EXACT: u128 = (MILLION as u128) * (MILLION as u128);

impl<'a> AgreementsView<'a> {
    /// A collective's clone carrying field 32, judged as rule 96 says, at
    /// line `at` (`by`: the signers its record names, each with a signature
    /// act). `Ok(None)` for a clone that is no issuance. `Ok(Some(excused))`
    /// for an issuance that passes rule 96's checks: `excused`, the holders
    /// of the issued stake whose share it scales down by the stake's
    /// holders' rule, who then do not sign for themselves (rule 48's
    /// exception, rule 96: "pro rata issuance under the holders' rule is
    /// excepted from the bullet on shares dropped or lowered"). `Err` with
    /// the clone's state where it fails: invalid where it is no issuance in
    /// form, a draft where it waits (on an offer reaching a holder, a
    /// period, a take-up, a new holder's signature) or gives a holder other
    /// than its proportion.
    #[allow(clippy::too_many_arguments)]
    pub(super) fn issuance_at(
        &self,
        col: &Col,
        at: Line<'a>,
        pid: &Hash,
        parent: &Terms,
        clone: &Terms,
        lineage: &[(Hash, Terms)],
        by: &BTreeMap<Hash, Hash>,
    ) -> R<Result<Option<Vec<Hash>>, CloneState>> {
        let Some(under) = &clone.issues_under else {
            return Ok(Ok(None));
        };
        let invalid = |w: &str| Ok(Err(CloneState::Invalid(w.into())));
        let draft = |w: &str| Ok(Err(CloneState::Draft(w.into())));
        let (ps, cs) = (parent.stakes.as_deref().unwrap_or(&[]), clone.stakes.as_deref().unwrap_or(&[]));
        let changed: Vec<usize> = (0..ps.len().max(cs.len())).filter(|i| ps.get(*i) != cs.get(*i)).collect();
        let [i] = changed.as_slice() else {
            return invalid("an issuance changes exactly one stake, and no other (rule 96; new in draft 14, F309)");
        };
        let i = *i;
        let (Some(before), Some(after)) = (ps.get(i), cs.get(i)) else {
            return invalid("an issuance adds holders to a stake its parent defines (rule 96, F309)");
        };
        if before.object != after.object || after.holders.len() != after.identified().len() {
            return invalid("an issuance adds holders to a stake, on the same object, each holder named (rule 96, F309)");
        }
        let written: Vec<(Hash, u64)> = after.identified();
        let roster = self.roster_at(col, at, pid, i as u64)?;
        let share_at = |h: &Hash| roster.iter().find(|(x, _)| x == h).map_or(0, |(_, n)| *n);
        // Every new holder it adds signs it (rule 96).
        if written.iter().any(|(h, n)| *n > 0 && share_at(h) == 0 && !by.contains_key(h)) {
            return draft("a new holder the issuance adds has not signed it (rule 96; new in draft 14, F309)");
        }
        let (rule, waived) = parent.holders_rule(i as u64);
        if *under == IssuesUnder::Waived && !waived {
            return invalid("an issuance naming no offer ([0]) stands only under that stake's standing waiver of pre-emption in its parent (field 30; new in draft 14, F328)");
        }
        // Decided by every holder (no holders' rule by share), or signed by
        // every holder: pre-emption is waived, and every holder whose share
        // falls signs as rule 8 asks (rule 96).
        let every_signed = roster.iter().all(|(h, _)| by.contains_key(h));
        if !matches!(rule, HoldersRule::Share(_)) || every_signed {
            return Ok(Ok(Some(vec![])));
        }
        let excused: Vec<Hash> = roster.iter().map(|(h, _)| *h).collect();
        match under {
            IssuesUnder::Waived => {
                // Every existing share scaled by one factor: what the
                // existing holders hold together after it.
                let kept: u128 = roster.iter().map(|(h, _)| written.iter().find(|(x, _)| x == h).map_or(0, |(_, n)| *n) as u128).sum();
                if kept >= MILLION as u128 {
                    return invalid("an issuance adds new holders to the stake (rule 96, F309)");
                }
                for (h, s) in &roster {
                    let w = written.iter().find(|(x, _)| x == h).map_or(0, |(_, n)| *n) as u128;
                    if !near(w, *s as u128 * kept * MILLION as u128) {
                        return draft("the issuance scales one existing share unlike the others (rule 96; new in draft 14, F309)");
                    }
                }
                Ok(Ok(Some(excused)))
            }
            IssuesUnder::Offer(o) => {
                let Some(x) = self.v.get(o) else {
                    return Err(AgreementsError::Missing(*o));
                };
                if !self.is_agreements(x, owner_types::ISSUANCE_OFFER) {
                    return invalid("field 32 names an act that is no issuance offer (type 26; rule 96)");
                }
                let offer = IssuanceOffer::decode(&x.inside)?;
                if offer.stake != i as u64 || !lineage.iter().any(|(v, _)| *v == offer.version) {
                    return invalid("the issuance offer it names offers another stake, or of another agreement (rule 96, F309)");
                }
                let ot = self.terms(&offer.version)?;
                if !Self::for_col(col, x) || !self.valid(o) || !self.on_chain(col, x) || !self.sealed_to_all(x, &ot) {
                    return draft("the issuance offer is not an act of the collective that is done: valid, on its chain and sealed to every member (rule 57; type 26)");
                }
                if !self.before_struct(col, x, at) {
                    return draft("the issuance offer is not placed before the line putting the issuance in force (rule 96)");
                }
                if ot.time.is_none() && ot.cmip(TIME_REFERENCE_TASK).is_none() {
                    return draft("the issuance offer counts for nothing: the agreement names no time reference for its period (rule 96, type 26; F315)");
                }
                // Every holder at the offer had to be reached: an offer that
                // did not reach one started no period for it (F315).
                for (h, _) in self.roster_at(col, Line::Record(x), &offer.version, i as u64)? {
                    if !self.reaches_holder(x, &h)? {
                        return draft("the issuance offer did not reach a holder of the stake, public or sealed to it: it started no period for that holder, and the issuance waits (rule 96; new in draft 14, F315, F328)");
                    }
                }
                let lapsed = self.offer_periods_lapsed.contains(o);
                // Exact shares, over EXACT: each existing holder scaled by
                // what the new shares leave; each holder taking up keeps its
                // whole proportion; the rest to the offer's new holders.
                let size = offer.size as u128;
                let mut exact: BTreeMap<Hash, u128> = BTreeMap::new();
                let mut left = size * MILLION as u128;
                for (h, s) in &roster {
                    let s = *s as u128;
                    let mut e = s * (MILLION as u128 - size) * MILLION as u128;
                    if self.took_up(col, at, x, &offer, h, s as u64, lapsed)? {
                        e += s * size * MILLION as u128;
                        left -= s * size;
                    } else if !lapsed {
                        return draft("a holder's period on the issuance offer still runs, and it has not taken up its proportion (rule 96; new in draft 14, F309)");
                    }
                    *exact.entry(*h).or_default() += e;
                }
                for (h, n) in &offer.new_holders {
                    *exact.entry(*h).or_default() += left * *n as u128;
                }
                let names: BTreeSet<Hash> = exact.keys().copied().chain(written.iter().map(|(h, _)| *h)).collect();
                for h in names {
                    let w = written.iter().find(|(x, _)| *x == h).map_or(0, |(_, n)| *n) as u128;
                    if !near(w, exact.get(&h).copied().unwrap_or(0)) {
                        return draft("the issuance gives a holder other than its proportion: each holder that took up receives exactly its proportion of the new shares, every existing share is scaled alike, and the rest goes to the offer's new holders in its shares (rule 96; new in draft 14, F309)");
                    }
                }
                Ok(Ok(Some(excused)))
            }
        }
    }

    /// Whether `h`, holding `share` of the stake at the issuance's line,
    /// took up its proportion of offer `x`: a signature act of its naming
    /// the offer (type 1), kept at `at` where the line placed it (F302),
    /// within the period, placed by the collective's line or not (new in
    /// draft 14, F329 Q3: any take-up while the period runs; once it
    /// lapsed, those the caller states the time reference places within
    /// it, by the take-up's anchor or, with none, where the line placed it),
    /// and paid where the offer names a price: Money receipts or claims
    /// fulfilling the take-up, paid to the collective in the price's unit,
    /// together at least its exact proportion of the price (mechanic, the
    /// build's: no holder pays less than its exact part).
    #[allow(clippy::too_many_arguments)]
    /// Judged as [`Self::judged`] says: unknown only where it depends on
    /// whether two records whose payment is not stated are one payment.
    fn took_up(&self, col: &Col, at: Line<'a>, x: &Held, offer: &IssuanceOffer, h: &Hash, share: u64, lapsed: bool) -> R<bool> {
        self.judged_r(|| self.took_up_unjudged(col, at, x, offer, h, share, lapsed))
    }

    #[allow(clippy::too_many_arguments)]
    fn took_up_unjudged(&self, col: &Col, at: Line<'a>, x: &Held, offer: &IssuanceOffer, h: &Hash, share: u64, lapsed: bool) -> R<bool> {
        for s in self.v.signed_by(h) {
            if !self.is_agreements(s, types::SIGNATURE) || decode_signature(&s.inside).ok() != Some(x.id) {
                continue;
            }
            if !self.kept_at(col, s, at)? {
                continue;
            }
            if lapsed && !self.take_ups_within.contains(&s.id) {
                continue;
            }
            if let Some(price) = &offer.price {
                let paid = self.paid_to_for(&col.id, &s.id, &price.unit) as u128;
                if paid * (MILLION as u128) < (price.value as u128) * (share as u128) {
                    continue;
                }
            }
            return Ok(true);
        }
        Ok(false)
    }

    /// Whether the collective's line places act `y` before line `at`, as it
    /// places a stake transfer (rule 94; F316): an act of the collective on
    /// its chain acknowledging it, or a record that is a line naming it in
    /// field 3.
    pub(super) fn placed_by_line(&self, col: &Col, y: &Held, at: Line<'a>) -> R<bool> {
        Ok(!self.placing_acts(col, y, at)?.is_empty())
    }

    /// The acts of the collective that place `y` before line `at`
    /// ([`Self::placed_by_line`]).
    pub(super) fn placing_acts(&self, col: &Col, y: &Held, at: Line<'a>) -> R<Vec<&'a Held>> {
        let mut out = vec![];
        for a in self.v.acknowledgements(&y.id) {
            if Self::for_col(col, a) && self.status(&a.id) == Status::Valid && self.on_chain(col, a) && self.before_struct(col, a, at) {
                out.push(a);
            }
        }
        for r in self.col_acts(col) {
            if self.status(&r.id) != Status::Valid || !self.is_agreements(r, types::RECORD) {
                continue;
            }
            if !Record::decode(&r.inside).is_ok_and(|d| d.registers.iter().flatten().any(|z| *z == y.id)) {
                continue;
            }
            if self.line_before(col, Line::Record(r), at) {
                let e = self.record_eval(col, r)?;
                if e.line && e.places.contains(&y.id) {
                    out.push(r);
                }
            }
        }
        Ok(out)
    }

    /// Whether act `x` reaches holder `h` (rule 96, type 26; F315; new in
    /// draft 14, F328 Q13, F329 Q4): public, or sealed to `h` among its
    /// recipients (a collective holder: to the collective); a holder that is
    /// itself an agreement, only where it is public: a deal has no line, so
    /// no verifier could tell which version was in force when it was sealed.
    pub(super) fn reaches_holder(&self, x: &Held, h: &Hash) -> R<bool> {
        let to = |p: &Hash| x.act.outside.to.iter().flatten().any(|q| q == p);
        if x.act.outside.content_key.is_some() {
            return Ok(true);
        }
        // Sealed to an agreement's own hash (its pointer, a split service's
        // address) or to its parties, an act reaches no agreement holder.
        if self.v.get(h).is_some_and(|a| self.is_agreements(a, types::TERMS)) {
            return Ok(false);
        }
        Ok(to(h))
    }

    /// What Money receipts and payers' claims fulfilling `fulfils` pay to
    /// `payee` in `unit`, counted as [`Self::paid_toward_if`] counts a
    /// payment toward an obligation: each receipt signed by the payee, each
    /// claim its payer's, with the rail's valid answer, paid where the
    /// payee's rules let it count; a claim beside a receipt of the same
    /// payment counts only above it (Money rule 10).
    pub(super) fn paid_to_for(&self, payee: &Hash, fulfils: &Hash, unit: &Hash) -> u64 {
        use crate::money::Payload as Fin;
        let counts = |id: &Hash, amount: &crate::money::Amount, proof: &[u8]| {
            &amount.unit == unit && self.rail_valid.get(id).is_some_and(|at| self.payment_counts_rec(payee, at, amount, (Some(id), proof), fulfils))
        };
        let mut receipts: Vec<((Hash, Payment), u64)> = vec![];
        let mut claims: Vec<((Hash, Payment), u64)> = vec![];
        for r in self.v.held_acts() {
            if r.inside.spec != self.mirs.money {
                continue;
            }
            match Fin::decode(r.inside.type_, &r.inside.payload) {
                Ok(Fin::Receipt(rc))
                    if &rc.fulfils == fulfils
                        && &rc.payee == payee
                        && r.act.outside.signer == Some(*payee)
                        && self.valid(&r.id)
                        && counts(&r.id, &rc.amount, &rc.proof)
                        && !self.receipt_overruled(&rc) =>
                {
                    receipts.push(((rc.rail, self.record_payment(&r.id, &rc.proof)), rc.amount.value));
                }
                Ok(Fin::Claim(c))
                    if &c.fulfils == fulfils && &c.payee == payee && self.payers_claim(r) && counts(&r.id, &c.amount, &c.proof) && !self.claim_overruled(&c) =>
                {
                    claims.push(((c.rail, self.record_payment(&r.id, &c.proof)), c.amount.value));
                }
                _ => {}
            }
        }
        self.one_count(&receipts, &claims)
    }
}

/// Whether a written share `w` (millionths) lies within rule 9's rounding of
/// the exact share `exact` (over [`EXACT`]): less than one millionth away.
fn near(w: u128, exact: u128) -> bool {
    (w * EXACT).abs_diff(exact) < EXACT
}

impl<'a> AgreementsView<'a> {
    /// Whether `a` is a take-up: a signature act naming an issuance offer.
    pub(super) fn takes_up(&self, a: &Held) -> bool {
        self.is_agreements(a, types::SIGNATURE) && decode_signature(&a.inside).ok().and_then(|o| self.v.get(&o)).is_some_and(|o| self.is_agreements(o, owner_types::ISSUANCE_OFFER))
    }
}
