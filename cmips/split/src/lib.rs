//! # mor-split
//!
//! The split cMIP, draft 4 (`cmips/cmip-split-draft-4.md`), filling the
//! Agreements MIR's split task (task 8; rules 16 to 29) for a publication
//! (Agreements type 6). It does two things, and signs nothing:
//!
//! - **The receiver for a payment** ([`route`]): the split services the
//!   publication names, in order (field 3's, then the backups of field 11),
//!   and the attempts made for this payment: which service is paid.
//!   Attempts run per payment: the first service first, the next only where
//!   the attempt before it failed as this cMIP defines failure ([`Failure`],
//!   the publication's field 12); the next payment starts again from the
//!   first. It only ever chooses among the services the publication names.
//! - **The amounts** ([`divide`]): an amount received, divided by the
//!   publication, summing exactly. Everything but the owners' line comes off
//!   the top, each a fraction of the payment in millionths, rounded down:
//!   the partners (field 2), the plan's role shares and metric shares (field
//!   4, key 0) and the fees its entries make owed (key 9). What is left is
//!   the owners' line: the drafter's, for a lone seller's publication; or
//!   divided among the holders of the one stake of the ownership agreement
//!   field 1 names, in the version in force for this payment, by rule 9,
//!   ties by turns, with the running count the split carries.
//!
//! *Experimental, an instrument for testing the core, never for real money
//! (decided by Nobody, allegedly, 2 October 2026).*

use mor_core::agreements::{divide_stake, leftovers, running_count, FeeScope, Payout, Publication, ShareRule, Sold, Ties, Unfilled};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};

/// A fraction of the payment, in millionths: the whole.
const WHOLE: u128 = 1_000_000;

/// This cMIP's spec hash: a test value until its creator is named at step
/// 17. A publication names it for task 8 (field 9), or as its split plan's
/// key 1.
pub fn spec() -> Hash {
    sha256(b"split cMIP, draft 4, test value until publication")
}

// ---------------------------------------------------------------- failure

/// What counts as a failed attempt (the publication's field 12: this
/// cMIP's parameters for it), signed with the publication by every party:
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
    /// Read from the publication's field 12, absent meaning the defaults.
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

    /// The publication's own: its field 12.
    pub fn of(p: &Publication) -> Result<Failure, String> {
        Failure::decode(p.failed.as_ref())
    }

    pub fn to_value(&self) -> Value {
        Value::Map(vec![(Value::Uint(0), Value::Uint(self.wait))])
    }

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

/// What to do with a payment, given the attempts made for it so far.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Route {
    /// Try (or keep trying) this service, the one at this place in order.
    Try { at: usize, service: Hash },
    /// Paid to this service: its receipt ends the payer's obligation.
    Paid { at: usize, service: Hash },
    /// Every service's attempt failed: the money stays with the payer, its
    /// obligation open (Agreements rules 24, 30); nobody else may be paid.
    Exhausted,
}

/// The receiver for one payment under the publication `p` (rule 17):
/// `attempts` the attempts made for this payment, in the order of
/// `p.services()` (field 3's service, then field 11's backups), one per
/// service tried. The first service whose attempt has not failed, as field
/// 12 defines failure, is the one to pay; a payment never skips a service
/// whose attempt did not fail, and a fresh payment starts from the first
/// again. Field 12 out of this cMIP's format: refused (fail closed: a
/// verifier then reads only field 3's service as paid under the
/// publication).
pub fn route(p: &Publication, attempts: &[Attempt]) -> Result<Route, String> {
    let f = Failure::of(p)?;
    for (at, service) in p.services().into_iter().enumerate() {
        match attempts.get(at).map(|a| f.failed(a)) {
            Some(Some(true)) => continue,
            Some(Some(false)) => return Ok(Route::Paid { at, service }),
            _ => return Ok(Route::Try { at, service }),
        }
    }
    Ok(Route::Exhausted)
}

/// The services whose attempts failed for this payment, in order: what a
/// verifier states to the core as `attempts_failed`, each with the
/// payment.
pub fn failed(p: &Publication, attempts: &[Attempt]) -> Result<Vec<Hash>, String> {
    let f = Failure::of(p)?;
    Ok(p.services().into_iter().zip(attempts).take_while(|(_, a)| f.failed(a) == Some(true)).map(|(s, _)| s).collect())
}

// ---------------------------------------------------------------- the amounts

/// Who takes the owners' line of a payment (rules 11, 12, 15).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Owners<'a> {
    /// A lone seller's publication (no field 1): its drafter, the owners'
    /// line whole, unsplit.
    Lone(Hash),
    /// The ownership agreement field 1 names: `agreement` its founding
    /// version; `holders` the holders of its one stake in the version in
    /// force for this payment (rule 12: the version the receipt's field 9
    /// names, read by reference), each by identity (a holder written null
    /// given as the collective it founds); `before` the running count the
    /// service's previous split on this line carries (split key 4), empty
    /// for the first.
    Line { agreement: Hash, holders: &'a [(Hash, u64)], before: &'a [(Hash, u64)] },
}

/// Who filled a role for this payment, and the evidence (rule 22): the
/// caller checks the evidence; this cMIP divides.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Filler {
    pub role: String,
    pub who: Hash,
    pub evidence: Hash,
}

/// One identity's measure under a metric share (rule 29), as the records
/// the split names (key 7) give it: the record's format is the metric
/// Module's, so the caller reads it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Measure {
    /// The metric share, by its index in plan key 0.
    pub share: u64,
    pub who: Hash,
    pub weight: u64,
}

/// What this payment brings beside its amount, each read by the caller from
/// acts this cMIP does not read.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Facts {
    /// The rail Module the receipt or claim names (its field 0), for a fee
    /// scoped to a rail.
    pub rail: Option<Hash>,
    /// The roles filled, with their evidence.
    pub fillers: Vec<Filler>,
    /// The measures under each metric share.
    pub measures: Vec<Measure>,
    /// Each fee's receiver, by the module whose fee it is: the module's
    /// specification names it (Development field 7, `paid`; absent, the
    /// creator).
    pub fee_receivers: Vec<(Hash, Hash)>,
}

/// A payment divided: the payouts, and the running count of leftover units
/// on the owners' line the split carries (its key 4, `[(0, count)]`; empty
/// for a lone seller's).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Divided {
    pub payouts: Vec<Payout>,
    pub tally: Vec<(u64, Vec<(Hash, u64)>)>,
}

/// `amount` smallest units received under the publication `p`, divided
/// (draft 4):
///
/// 1. **off the top**, each a fraction of the payment in millionths, rounded
///    down: every partner its share (field 2), every role share among its
///    fillers equally (several fillers, the units left one each to the
///    smallest identity hashes), every metric share among the identities
///    measured by their measures (largest remainder, ties to the smallest
///    identity hash), and every fee the plan's key 9 makes owed on this
///    payment, to its receiver; together at most the whole payment;
/// 2. **the owners' line, what is left**, every unit the rounding above
///    leaves included: for a lone seller's publication, its drafter's,
///    whole; otherwise among the holders of the ownership agreement's one
///    stake by their shares, rule 9, ties by turns (`before`), each payout
///    naming the agreement (payout key 2).
///
/// A role nobody fills follows the plan's key 3: to the owners' line (the
/// default). Held open, or to a named party, is refused: a split sums
/// exactly to the amount received, and the core has no payout for either
/// (draft 4's open question QS3). Only role and metric shares are in the
/// plan: a stake share or a named receiver in it (a plan the core's format
/// refuses) is refused here too, never divided: a named receiver is a
/// partner, and the owners' line is what is left (F280, now structural).
pub fn divide(amount: u64, p: &Publication, owners: Owners, facts: &Facts) -> Result<Divided, String> {
    let plan = &p.plan;
    match (&owners, &p.owners) {
        (Owners::Lone(_), None) => {}
        (Owners::Line { agreement, .. }, Some(a)) if agreement == a => {}
        (Owners::Lone(_), Some(_)) => return Err("the publication names an ownership agreement (field 1): its holders take the owners' line".into()),
        (Owners::Line { .. }, None) => return Err("a lone seller's publication (no field 1): its drafter takes the owners' line".into()),
        (Owners::Line { .. }, Some(_)) => return Err("the owners' line is the ownership agreement field 1 names, by its founding version".into()),
    }
    if plan.shares.iter().any(|s| !matches!(s, ShareRule::Role { .. } | ShareRule::Metric { .. })) {
        return Err("a plan's share is a role or a metric share: a stake share or a named receiver pays someone beside the owners in the rest; a named receiver is a partner, paid off the top, and the owners' line is what is left (F280)".into());
    }
    let off = |part: u64| -> u64 { (amount as u128 * part as u128 / WHOLE) as u64 };
    let mut payouts: Vec<Payout> = vec![];
    let mut parts: u128 = 0;

    // Partners, each its share of the payment.
    for (i, q) in p.partners.iter().enumerate() {
        parts += q.share as u128;
        let x = off(q.share);
        if x > 0 {
            payouts.push(Payout { receiver: q.identity, amount: x, partner: Some(i as u64), ..Default::default() });
        }
    }

    // The identities the plan already pays, for a metric (rule 29).
    let mut paid_by_plan: Vec<Hash> = p.partners.iter().map(|q| q.identity).collect();
    match &owners {
        Owners::Lone(d) => paid_by_plan.push(*d),
        Owners::Line { holders, .. } => paid_by_plan.extend(holders.iter().map(|(h, _)| *h)),
    }

    for f in &facts.fillers {
        if !plan.roles().contains(&f.role.as_str()) {
            return Err(format!("the role {:?} is not the plan's", f.role));
        }
    }
    for (i, s) in plan.shares.iter().enumerate() {
        match s {
            ShareRule::Role { role, part } => {
                let mut fillers: Vec<&Filler> = facts.fillers.iter().filter(|f| &f.role == role).collect();
                fillers.sort_by_key(|f| f.who);
                if fillers.windows(2).any(|w| w[0].who == w[1].who) {
                    return Err(format!("the role {role:?} filled twice by one identity"));
                }
                if fillers.is_empty() {
                    match &plan.unfilled {
                        Unfilled::Stakes => continue,
                        Unfilled::HeldOpen => return Err(format!("the role {role:?} is unfilled and the plan holds it open: draft 4 does not split such a payment (QS3)")),
                        Unfilled::To(_) => return Err(format!("the role {role:?} is unfilled and the plan sends it to a named party: draft 4 does not split such a payment (QS3)")),
                    }
                }
                parts += *part as u128;
                let pot = off(*part);
                let n = fillers.len() as u64;
                for (k, f) in fillers.iter().enumerate() {
                    let x = pot / n + u64::from((k as u64) < pot % n);
                    if x > 0 {
                        payouts.push(Payout { receiver: f.who, amount: x, role: Some(role.clone()), evidence: Some(f.evidence), ..Default::default() });
                    }
                }
            }
            ShareRule::Metric { metric, part } => {
                let m = plan.metrics.get(*metric as usize).ok_or("a metric share names no metric of the plan's key 8")?;
                let mut measured: Vec<(Hash, u64)> = vec![];
                for x in facts.measures.iter().filter(|x| x.share == i as u64) {
                    if x.who == m.measurer {
                        return Err("the metric's measurer is never paid by its own metric (rule 29)".into());
                    }
                    if !paid_by_plan.contains(&x.who) {
                        return Err("a metric pays only identities the publication already pays (rule 29)".into());
                    }
                    match measured.iter_mut().find(|(w, _)| *w == x.who) {
                        Some(e) => e.1 = e.1.checked_add(x.weight).ok_or("a measure above what this cMIP counts")?,
                        None => measured.push((x.who, x.weight)),
                    }
                }
                let sum: u128 = measured.iter().map(|(_, w)| *w as u128).sum();
                if sum == 0 {
                    return Err(format!("metric share {i} has no measure: draft 4 does not split such a payment (QS4)"));
                }
                parts += *part as u128;
                let pot = off(*part);
                let exact: Vec<u128> = measured.iter().map(|(_, w)| pot as u128 * *w as u128).collect();
                let mut xs: Vec<u64> = exact.iter().map(|e| (e / sum) as u64).collect();
                let left = pot - xs.iter().sum::<u64>();
                let mut order: Vec<usize> = (0..measured.len()).collect();
                order.sort_by(|a, b| (exact[*b] % sum).cmp(&(exact[*a] % sum)).then(measured[*a].0.cmp(&measured[*b].0)));
                for k in order.into_iter().take(left as usize) {
                    xs[k] += 1;
                }
                for (k, (who, _)) in measured.iter().enumerate() {
                    if xs[k] > 0 {
                        payouts.push(Payout { receiver: *who, amount: xs[k], metric: Some(i as u64), ..Default::default() });
                    }
                }
            }
            _ => unreachable!("checked above"),
        }
    }

    // Fees each entry makes owed on this payment (rule 28).
    for f in &plan.fees {
        let owed = match &f.scope {
            FeeScope::Every => true,
            FeeScope::Rail(r) => facts.rail.as_ref() == Some(r),
            FeeScope::Bake(b) => p.sold.iter().flatten().any(|x| x == &Sold::Bake(*b)),
        };
        if !owed {
            continue;
        }
        let to = facts
            .fee_receivers
            .iter()
            .find(|(m, _)| *m == f.module)
            .map(|(_, r)| *r)
            .ok_or("a fee owed on this payment, and its receiver (the module's specification, Development field 7) not given")?;
        parts += f.part as u128;
        let x = off(f.part);
        if x > 0 {
            payouts.push(Payout { receiver: to, amount: x, fee_module: Some(f.module), ..Default::default() });
        }
    }

    if parts > WHOLE {
        return Err("what comes off the top (partners, roles, metric shares and fees owed) takes more than the whole payment: their parts are millionths of it, 1,000,000 at most".into());
    }

    // The owners' line: what is left.
    let taken: u64 = payouts.iter().map(|x| x.amount).sum();
    let line = amount.checked_sub(taken).ok_or("what comes off the top above the amount")?;
    let mut tally = vec![];
    match owners {
        Owners::Lone(drafter) => {
            if line > 0 {
                payouts.push(Payout { receiver: drafter, amount: line, ..Default::default() });
            }
        }
        Owners::Line { agreement, holders, before } => {
            if holders.is_empty() || holders.iter().map(|(_, n)| *n as u128).sum::<u128>() == 0 {
                return Err("the ownership agreement's stake has no holder with a share: the owners' line cannot be paid".into());
            }
            let counts: Vec<u64> = holders.iter().map(|(h, _)| before.iter().filter(|(x, _)| x == h).map(|(_, n)| *n).sum()).collect();
            let xs = divide_stake(line, holders, Ties::Turns(&counts))?;
            let paid: Vec<(Hash, u64)> = holders.iter().map(|(h, _)| *h).zip(xs.iter().copied()).collect();
            tally.push((0, running_count(before, &leftovers(line, holders, &paid))));
            for (h, n) in paid {
                if n > 0 {
                    payouts.push(Payout { receiver: h, amount: n, stake: Some(0), owners: Some(agreement), ..Default::default() });
                }
            }
        }
    }
    debug_assert_eq!(payouts.iter().map(|p| p.amount as u128).sum::<u128>(), amount as u128);
    Ok(Divided { payouts, tally })
}
