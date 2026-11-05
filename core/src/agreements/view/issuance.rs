//! Issuance with pre-emption (Agreements draft 14, rule 96; F309, F315,
//! F328 Q13 and Q14): a clone of a collective's agreement adding new holders
//! to one stake, every existing share scaled alike, each existing holder
//! first offered its proportion by an issuance offer (the default control
//! cMIP's type 26, of its own specification since Agreements draft 19).

use super::*;
use crate::agreements::control::{ActKind, OfferRead};

impl<'a> AgreementsView<'a> {
    /// A collective's clone carrying an issuance (its control model's
    /// answer `issues_under`), judged by the model the verifier holds from
    /// the line's facts, which this gathers (the line as data,
    /// [`crate::agreements::control::IssuanceFacts`]): nothing of the model's
    /// judgment is here. `Ok(None)` for a clone that is no issuance;
    /// `Ok(Some(excused))` for one that passes, `excused` the holders the
    /// model excuses from signing, of whom the caller keeps those the
    /// stake's holders' rule binds (rules 48, 98.2); `Err` with the clone's
    /// state where it fails.
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
        use crate::agreements::control::{IssuanceFacts, OfferFacts, OfferPlaced};
        let Some(under) = &clone.issues_under else {
            return Ok(Ok(None));
        };
        let Some(c) = &parent.control else { return Ok(Ok(None)) };
        let Some((_, model)) = self.control.iter().find(|(h, _)| *h == c.cmip) else {
            return Err(AgreementsError::Missing(c.cmip));
        };
        let (ps, cs) = (parent.stakes.as_deref().unwrap_or(&[]), clone.stakes.as_deref().unwrap_or(&[]));
        let changed: Vec<usize> = (0..ps.len().max(cs.len())).filter(|i| ps.get(*i) != cs.get(*i)).collect();
        let stake = match changed.as_slice() {
            [i] => Some(*i),
            _ => None,
        };
        let roster = match stake {
            Some(i) => self.roster_at(col, at, pid, i as u64),
            None => Err(AgreementsError::Check("no one stake changed")),
        };
        let offer = match (under, stake) {
            (IssuesUnder::Offer(o), Some(i)) => Some(match self.v.get(o) {
                None => Err(AgreementsError::Missing(*o)),
                Some(x) => {
                    let is_offer = x.inside.spec == c.cmip && model.act_kind(x.inside.type_) == Some(ActKind::Offer);
                    let decoded = model.read_offer(&x.inside);
                    let ours = decoded.as_ref().is_ok_and(|d| d.stake == i as u64 && lineage.iter().any(|(v, _)| *v == d.version));
                    let placed = match &decoded {
                        Ok(d) if ours => (|| -> R<OfferPlaced> {
                            let ot = self.terms(&d.version)?;
                            let reached_all = (|| -> R<bool> {
                                for (h, _) in self.roster_at(col, Line::Record(x), &d.version, i as u64)? {
                                    if !self.reaches_holder(x, &h)? {
                                        return Ok(false);
                                    }
                                }
                                Ok(true)
                            })();
                            let lapsed = self.offer_periods_lapsed.contains(o);
                            let took_up = match &roster {
                                Ok(r) => r.iter().map(|(h, s)| (*h, self.took_up(col, at, x, d, h, *s, lapsed))).collect(),
                                Err(_) => vec![],
                            };
                            Ok(OfferPlaced {
                                done: Self::for_col(col, x) && self.valid(o) && self.on_chain(col, x) && self.sealed_to_all(x, &ot),
                                before: self.before_struct(col, x, at),
                                has_time: ot.time.is_some() || ot.cmip(TIME_REFERENCE_TASK).is_some(),
                                reached_all,
                                lapsed,
                                took_up,
                            })
                        })(),
                        _ => Err(AgreementsError::Check("not this agreement's offer")),
                    };
                    Ok(OfferFacts { is_offer, offer: decoded, ours, placed })
                }
            }),
            _ => None,
        };
        let facts = IssuanceFacts { stake, roster, signed: by.keys().copied().collect(), offer };
        model.issuance(parent, clone, &facts)
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
    fn took_up(&self, col: &Col, at: Line<'a>, x: &Held, offer: &OfferRead, h: &Hash, share: u64, lapsed: bool) -> R<bool> {
        self.judged_r(|| self.took_up_unjudged(col, at, x, offer, h, share, lapsed))
    }

    #[allow(clippy::too_many_arguments)]
    fn took_up_unjudged(&self, col: &Col, at: Line<'a>, x: &Held, offer: &OfferRead, h: &Hash, share: u64, lapsed: bool) -> R<bool> {
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
                        // Its payee's: a collective's, a member's act naming it (rule 58).
                        && self.author(r).as_ref() == Some(payee)
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

impl<'a> AgreementsView<'a> {
    /// Whether `a` is a take-up: a signature act naming an offer of a
    /// control model the verifier holds (rule 99).
    pub(super) fn takes_up(&self, a: &Held) -> bool {
        self.is_agreements(a, types::SIGNATURE)
            && decode_signature(&a.inside).ok().and_then(|o| self.v.get(&o)).is_some_and(|o| self.control.iter().any(|(h, m)| o.inside.spec == *h && m.act_kind(o.inside.type_) == Some(ActKind::Offer)))
    }

    /// What `x` is as an act of the control model `cmip` names (rule 99, "A
    /// model's own acts"): of that model's specification, a type it
    /// declares, in that type's format, the verifier holding the model.
    pub(super) fn model_kind(&self, cmip: Option<&Hash>, x: &Held) -> Option<ActKind> {
        let c = cmip?;
        if x.inside.spec != *c {
            return None;
        }
        let (_, m) = self.control.iter().find(|(h, _)| h == c)?;
        let k = m.act_kind(x.inside.type_)?;
        m.act_format(&x.inside).ok()?;
        Some(k)
    }
}
