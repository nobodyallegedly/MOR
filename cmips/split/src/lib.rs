//! # mor-split
//!
//! The split cMIP, draft 1 (`cmips/cmip-split-draft-1.md`), filling the
//! Agreements MIP's split task (task 8; F249, F250, roadmap step 13). It
//! does two things, and signs nothing:
//!
//! - **The receiver for a payment** ([`route`]): given the split services
//!   the owners signed, in order (field 14's, then the backups of terms
//!   field 29), and the attempts made for this payment, which service is
//!   paid. Attempts run per payment: the first service first, the next only
//!   where the attempt before it failed as this cMIP defines failure
//!   ([`Failure`]); the next payment starts again from the first. It only
//!   ever chooses among the services it is given, never another.
//! - **The amounts** ([`divide`]): an amount received, divided by the split
//!   plan, summing exactly, every leftover unit where rule 15a sends it,
//!   with the running count of leftover units the split carries (F171).
//!
//! *Experimental, an instrument for testing the core, never for real money
//! (decided by Nobody, allegedly, 2 October 2026).*

use mor_core::agreements::{divide_stake, leftovers, running_count, Payout, ShareRule, SplitPlan, Terms, Ties, Who};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};

/// This cMIP's spec hash: a test value until its creator is named at step
/// 17. An agreement names it for task 8 (field 2), or as its split plan's
/// key 1.
pub fn spec() -> Hash {
    sha256(b"split cMIP, draft 1, test value until publication")
}

// ---------------------------------------------------------------- failure

/// What counts as a failed attempt (terms field 29, key 1: this cMIP's
/// parameters), signed with the terms:
///
/// ```cddl
/// failure = {
///   ? 0 => uint     ; seconds a payer waits for the service's payment request; absent: 60
/// }
/// ```
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Failure {
    /// How long, in seconds, the payer waits for a payment request from
    /// the service once asked, above zero.
    pub wait: u64,
}

impl Default for Failure {
    fn default() -> Self {
        Failure { wait: 60 }
    }
}

impl Failure {
    /// Read from field 29's key 1, absent meaning the defaults.
    pub fn decode(v: Option<&Value>) -> Result<Failure, String> {
        let Some(v) = v else { return Ok(Failure::default()) };
        let Value::Map(m) = v else { return Err("the split cMIP's failure parameters are a map".into()) };
        let mut f = Failure::default();
        for (k, x) in m {
            match (k, x) {
                (Value::Uint(0), Value::Uint(n)) if *n > 0 => f.wait = *n,
                (Value::Uint(0), _) => return Err("the wait is a whole number of seconds above zero".into()),
                _ => return Err("the split cMIP's failure parameters: unknown key".into()),
            }
        }
        Ok(f)
    }

    pub fn to_value(&self) -> Value {
        Value::Map(vec![(Value::Uint(0), Value::Uint(self.wait))])
    }
}

/// One attempt to pay one service for one payment, as the payer saw it.
/// All of V1's rail Modules are request rails (payment cMIP draft 2): the
/// payer asks the service for a payment request (an invoice, an address),
/// and pays it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Attempt {
    /// Paid: Money's receipt is the proof. The attempt succeeded.
    Paid,
    /// The service gave a payment request, not yet paid: in progress.
    Requested,
    /// The service refused, or gave no payment request on any rail its own
    /// signed pointer names that the payer can pay: failed.
    Refused,
    /// Asked, and no payment request after this many seconds: failed once
    /// the wait has passed, in progress before.
    Silent { waited: u64 },
    /// The service's request could not be paid: the rail found no route to
    /// it, or it expired before the payment could complete: failed.
    Unpayable,
}

impl Failure {
    /// Whether an attempt failed: `Some(true)` failed, `Some(false)`
    /// succeeded, `None` still in progress.
    pub fn failed(&self, a: &Attempt) -> Option<bool> {
        match a {
            Attempt::Paid => Some(false),
            Attempt::Requested => None,
            Attempt::Refused | Attempt::Unpayable => Some(true),
            Attempt::Silent { waited } => (*waited >= self.wait).then_some(true),
        }
    }
}

/// What to do with a payment, given the attempts made for it so far.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Route {
    /// Try (or keep trying) this service, the one at this place in order.
    Try { at: usize, service: Hash },
    /// Paid to this service: its receipt ends the payer's obligation.
    Paid { at: usize, service: Hash },
    /// Every service's attempt failed: the money stays with the payer, its
    /// obligation open (rules 24, 29); nobody else may be paid.
    Exhausted,
}

/// The receiver for one payment (the split task, F250): `services` in the
/// order the owners signed them (field 14's first, the designated pointer,
/// F248; then field 29's backups), `attempts` the attempts made for this
/// payment, in that order, one per service tried. The first service whose
/// attempt has not failed is the one to pay; a payment never skips a
/// service whose attempt did not fail, and a fresh payment starts from the
/// first again (F249: "Everything reverts back if attempts 1 succeeds.").
pub fn route(services: &[Hash], attempts: &[Attempt], f: &Failure) -> Route {
    for (at, service) in services.iter().enumerate() {
        match attempts.get(at).map(|a| f.failed(a)) {
            Some(Some(true)) => continue,
            Some(Some(false)) => return Route::Paid { at, service: *service },
            _ => return Route::Try { at, service: *service },
        }
    }
    Route::Exhausted
}

/// The services whose attempts failed for this payment, in order: what a
/// verifier states to the core as `attempts_failed`, each with the
/// payment.
pub fn failed(services: &[Hash], attempts: &[Attempt], f: &Failure) -> Vec<Hash> {
    services.iter().zip(attempts).take_while(|(_, a)| f.failed(a) == Some(true)).map(|(s, _)| *s).collect()
}

// ---------------------------------------------------------------- the amounts

/// A payment divided: the payouts, and the running count of leftover units
/// per stake the split carries (its key 4, F171).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Divided {
    pub payouts: Vec<Payout>,
    pub tally: Vec<(u64, Vec<(Hash, u64)>)>,
}

/// `amount` smallest units received, divided by the plan of `terms`:
///
/// 1. each share the plan takes off the top (its key 4) gets its part in
///    millionths of the amount, rounded down;
/// 2. the rest is divided among the other shares in proportion to their
///    parts, every share its exact part rounded down, leftover units one
///    each to the shares with the largest remainders, and where remainders
///    are equal, to the share listed first in the plan (the plan's order,
///    signed with the terms; holders' order plays no part, rule 21);
/// 3. a stake's pot goes to its current holders by rule 15a, ties by turns
///    (`before`: the running count the service's previous split for that
///    stake carried, empty for the first, F165, F171); a named receiver's
///    pot to it.
///
/// `collective`: the collective whose terms these are, for holders written
/// null (S1). Draft 1 computes stakes and named receivers only: a plan with
/// roles or metrics, or terms with fees (field 28), are refused, never
/// guessed.
pub fn divide(amount: u64, terms: &Terms, collective: Option<&Hash>, before: &dyn Fn(u64) -> Vec<(Hash, u64)>) -> Result<Divided, String> {
    let plan: &SplitPlan = terms.plan.as_ref().ok_or("the terms carry no split plan")?;
    if terms.fees.is_some() {
        return Err("draft 1 does not compute fees (terms field 28)".into());
    }
    let mut taken: u64 = 0;
    let mut pots: Vec<u64> = vec![0; plan.shares.len()];
    for i in &plan.top {
        let part = part_of(&plan.shares[*i as usize]);
        let x = (amount as u128 * part as u128 / 1_000_000u128) as u64;
        pots[*i as usize] = x;
        taken = taken.checked_add(x).ok_or("shares off the top above the amount")?;
    }
    let rest = amount.checked_sub(taken).ok_or("shares off the top above the amount")?;
    let others: Vec<usize> = (0..plan.shares.len()).filter(|i| !plan.top.contains(&(*i as u64))).collect();
    let weights: Vec<u128> = others.iter().map(|i| part_of(&plan.shares[*i]) as u128).collect();
    let sum: u128 = weights.iter().sum();
    if sum == 0 && rest > 0 {
        return Err("the shares left after the top have no parts".into());
    }
    if sum > 0 {
        let exact: Vec<u128> = weights.iter().map(|w| rest as u128 * w).collect();
        let mut parts: Vec<u64> = exact.iter().map(|e| (e / sum) as u64).collect();
        let left = rest - parts.iter().sum::<u64>();
        let mut order: Vec<usize> = (0..others.len()).collect();
        // Largest remainder first; equal remainders, the earlier share.
        order.sort_by(|a, b| (exact[*b] % sum).cmp(&(exact[*a] % sum)).then(a.cmp(b)));
        for k in order.into_iter().take(left as usize) {
            parts[k] += 1;
        }
        for (k, i) in others.iter().enumerate() {
            pots[*i] = parts[k];
        }
    }
    let mut payouts = vec![];
    let mut tally = vec![];
    for (i, share) in plan.shares.iter().enumerate() {
        match share {
            ShareRule::Stake { stake, .. } => {
                let st = terms.stakes.iter().flatten().nth(*stake as usize).ok_or("a stake share names no stake")?;
                let holders: Vec<(Hash, u64)> = st
                    .holders
                    .iter()
                    .map(|(w, n)| match w {
                        Who::Id(h) => Ok((*h, *n)),
                        Who::This => collective.map(|c| (*c, *n)).ok_or("a holder written null, and no collective given"),
                    })
                    .collect::<Result<_, _>>()?;
                let prior = before(*stake);
                let counts: Vec<u64> = holders.iter().map(|(h, _)| prior.iter().filter(|(x, _)| x == h).map(|(_, n)| *n).sum()).collect();
                let parts = divide_stake(pots[i], &holders, Ties::Turns(&counts))?;
                let paid: Vec<(Hash, u64)> = holders.iter().map(|(h, _)| *h).zip(parts.iter().copied()).collect();
                tally.push((*stake, running_count(&prior, &leftovers(pots[i], &holders, &paid))));
                for (h, n) in paid {
                    if n > 0 {
                        payouts.push(Payout { receiver: h, amount: n, stake: Some(*stake), ..Default::default() });
                    }
                }
            }
            ShareRule::Receiver { receiver, .. } => {
                if pots[i] > 0 {
                    payouts.push(Payout { receiver: *receiver, amount: pots[i], ..Default::default() });
                }
            }
            _ => return Err("draft 1 computes stakes and named receivers only: roles and metrics are refused, never guessed".into()),
        }
    }
    debug_assert_eq!(payouts.iter().map(|p| p.amount as u128).sum::<u128>(), amount as u128);
    Ok(Divided { payouts, tally })
}

fn part_of(s: &ShareRule) -> u64 {
    match s {
        ShareRule::Stake { part, .. } | ShareRule::Role { part, .. } | ShareRule::Receiver { part, .. } | ShareRule::Metric { part, .. } => *part,
    }
}
