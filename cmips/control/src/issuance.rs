//! Issuance with pre-emption (this cMIP's rule 96), judged from the line's
//! facts the core reads ([`IssuanceFacts`]): moved from the core's
//! `view/issuance.rs` unchanged in what it decides. Pre-emption is this
//! model's way of collecting the consent Agreements rule 98.2 asks; the core
//! still has every holder whose share falls sign unless excused here.

use mor_core::agreements::control::IssuanceFacts;
use mor_core::agreements::{AgreementsError, CloneState, HoldersRule, IssuesUnder, Terms};
use mor_core::hash::Hash;
use std::collections::BTreeMap;

type R<T> = Result<T, AgreementsError>;

const MILLION: u64 = 1_000_000;
/// One millionth of a whole share, squared: exact shares are written over
/// this denominator, so a share an issuance gives is checked to within rule
/// 9's rounding (less than one millionth from exact).
const EXACT: u128 = (MILLION as u128) * (MILLION as u128);

/// Whether a written share `w` (millionths) lies within rule 9's rounding of
/// the exact share `exact` (over [`EXACT`]): less than one millionth away.
fn near(w: u128, exact: u128) -> bool {
    (w * EXACT).abs_diff(exact) < EXACT
}

/// Rule 96: `Ok(None)` for no issuance; `Ok(Some(excused))` where it passes;
/// `Err(state)` where it fails.
pub fn issuance(parent: &Terms, clone: &Terms, f: &IssuanceFacts) -> R<Result<Option<Vec<Hash>>, CloneState>> {
    let Some(under) = &clone.issues_under else {
        return Ok(Ok(None));
    };
    let invalid = |w: &str| Ok(Err(CloneState::Invalid(w.into())));
    let draft = |w: &str| Ok(Err(CloneState::Draft(w.into())));
    let (ps, cs) = (parent.stakes.as_deref().unwrap_or(&[]), clone.stakes.as_deref().unwrap_or(&[]));
    let Some(i) = f.stake else {
        return invalid("an issuance changes exactly one stake, and no other (rule 96; new in draft 14, F309)");
    };
    let (Some(before), Some(after)) = (ps.get(i), cs.get(i)) else {
        return invalid("an issuance adds holders to a stake its parent defines (rule 96, F309)");
    };
    if before.object != after.object || after.holders.len() != after.identified().len() {
        return invalid("an issuance adds holders to a stake, on the same object, each holder named (rule 96, F309)");
    }
    let written: Vec<(Hash, u64)> = after.identified();
    let roster = match &f.roster {
        Ok(r) => r.clone(),
        Err(e) => return Err(e.clone()),
    };
    let share_at = |h: &Hash| roster.iter().find(|(x, _)| x == h).map_or(0, |(_, n)| *n);
    // Every new holder it adds signs it (rule 96).
    if written.iter().any(|(h, n)| *n > 0 && share_at(h) == 0 && !f.signed.contains(h)) {
        return draft("a new holder the issuance adds has not signed it (rule 96; new in draft 14, F309)");
    }
    let (rule, waived) = parent.holders_rule(i as u64);
    if *under == IssuesUnder::Waived && !waived {
        return invalid("an issuance naming no offer ([0]) stands only under that stake's standing waiver of pre-emption in its parent (field 30; new in draft 14, F328)");
    }
    // Decided by every holder (no holders' rule by share), or signed by
    // every holder: pre-emption is waived, and every holder whose share
    // falls signs as rule 8 asks (rule 96).
    let every_signed = roster.iter().all(|(h, _)| f.signed.contains(h));
    if !matches!(rule, HoldersRule::Share(_)) || every_signed {
        return Ok(Ok(Some(vec![])));
    }
    let excused: Vec<Hash> = roster.iter().map(|(h, _)| *h).collect();
    match under {
        IssuesUnder::Waived => {
            // Every existing share scaled by one factor: what the existing
            // holders hold together after it.
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
        IssuesUnder::Offer(_) => {
            let o = match f.offer.as_ref().expect("an offer's facts, where the issuance names one") {
                Ok(o) => o,
                Err(e) => return Err(e.clone()),
            };
            if !o.is_offer {
                return invalid("field 32 names an act that is no issuance offer (type 26; rule 96)");
            }
            let offer = match &o.offer {
                Ok(d) => d,
                Err(e) => return Err(e.clone()),
            };
            if !o.ours {
                return invalid("the issuance offer it names offers another stake, or of another agreement (rule 96, F309)");
            }
            let p = match &o.placed {
                Ok(p) => p,
                Err(e) => return Err(e.clone()),
            };
            if !p.done {
                return draft("the issuance offer is not an act of the collective that is done: valid, on its chain and sealed to every member (rule 57; type 26)");
            }
            if !p.before {
                return draft("the issuance offer is not placed before the line putting the issuance in force (rule 96)");
            }
            if !p.has_time {
                return draft("the issuance offer counts for nothing: the agreement names no time reference for its period (rule 96, type 26; F315)");
            }
            match &p.reached_all {
                Err(e) => return Err(e.clone()),
                Ok(false) => return draft("the issuance offer did not reach a holder of the stake, public or sealed to it: it started no period for that holder, and the issuance waits (rule 96; new in draft 14, F315, F328)"),
                Ok(true) => {}
            }
            // Exact shares, over EXACT: each existing holder scaled by what
            // the new shares leave; each holder taking up keeps its whole
            // proportion; the rest to the offer's new holders.
            let size = offer.size as u128;
            let mut exact: BTreeMap<Hash, u128> = BTreeMap::new();
            let mut left = size * MILLION as u128;
            for (k, (h, s)) in roster.iter().enumerate() {
                let s = *s as u128;
                let mut e = s * (MILLION as u128 - size) * MILLION as u128;
                let took = match p.took_up.get(k).map(|(_, t)| t) {
                    Some(Ok(t)) => *t,
                    Some(Err(e)) => return Err(e.clone()),
                    None => false,
                };
                if took {
                    e += s * size * MILLION as u128;
                    left -= s * size;
                } else if !p.lapsed {
                    return draft("a holder's period on the issuance offer still runs, and it has not taken up its proportion (rule 96; new in draft 14, F309)");
                }
                *exact.entry(*h).or_default() += e;
            }
            for (h, n) in &offer.new_holders {
                *exact.entry(*h).or_default() += left * *n as u128;
            }
            let names: std::collections::BTreeSet<Hash> = exact.keys().copied().chain(written.iter().map(|(h, _)| *h)).collect();
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
