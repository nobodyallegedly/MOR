//! What a version pays a stake less (Agreements draft 12, rule 48: F270, as
//! F274 reads it, with F279 and F280).
//!
//! F274 (decided by Nobody, allegedly: "What money sees and money expects is
//! what matters"): a stake is paid less by any change that lowers what it
//! receives from a payment or can expect from the plan as written: another
//! share added or raised, a role share added, unfilled roles sent elsewhere,
//! the rail fee moved onto receivers, the maximum fee raised or removed, the
//! split cMIP or its parameters changed (what a cMIP pays cannot be read from
//! the plan alone, so changing it counts), and, from F270 itself, a fee
//! (terms field 28) added or raised. Computed from the two versions' plans
//! (field 8) and fees (field 28) alone, judged by effect; where the effect
//! cannot be read from them, the change counts.
//!
//! F270: every holder a version pays less who has no voice in the power
//! making the change signs it: in a deal, a holder who is no party of the
//! parent; in a collective, a holder who is no member of it. Members are
//! left to the collective's own rules. No advance permission reaches any
//! holder's pay (F279, superseding F273's mechanism): abandonment moves a
//! stake by succession, never lowers its pay while it stays.
//!
//! F280: the plan pays non-owners off the top only, so what is left goes to
//! the stakes alone; the comparison of shares is read so.

use super::formats::{Terms, Who};
use super::open_formats::{Fee, Metric, ShareRule, SplitPlan, Unfilled};
use crate::cbor::Value;
use crate::hash::Hash;
use crate::money::Amount;

/// Why a version pays a stake less (F274's list, and F270's fees).
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum PaidLess {
    /// By the plan's shares (key 0, with key 4): its own share dropped or
    /// its part lowered, another share added or raised (a role share
    /// included), or a share moved onto or off the top, as the plan's own
    /// division reads it.
    Shares,
    /// A role share nobody fills sent elsewhere than the stakes (key 3).
    Unfilled,
    /// The payout rail fee moved from the split service onto the receivers
    /// (key 5).
    RailFee,
    /// The maximum fee per payout raised or removed (key 6), where the
    /// receivers bear the rail fee.
    MaxFee,
    /// A fee entry (terms field 28) added or raised: fees come off the top
    /// of every stake (rule 28).
    Fee,
    /// The split cMIP or its parameters changed (keys 1 and 7), or a plan
    /// added or removed: what a cMIP pays cannot be read from the plan
    /// alone, so it counts.
    Cmip,
}

/// Each stake of `parent` that `clone` pays less, followed by its object
/// (FR7), with why. A stake the parent's plan pays nothing (no share of the
/// plan names it, or its part is zero) is paid no less by any change. Where
/// the parent has no plan, what a stake receives is not read from the terms,
/// so every stake counts as the plan the clone writes, and every fee it adds.
pub fn stakes_paid_less(parent: &Terms, clone: &Terms) -> Vec<(Who, Vec<PaidLess>)> {
    let paid: Vec<Who> = match &parent.plan {
        Some(plan) => {
            let mut v: Vec<Who> = vec![];
            for s in &plan.shares {
                if let ShareRule::Stake { stake, part } = s {
                    if *part == 0 {
                        continue;
                    }
                    if let Some(st) = parent.stakes.iter().flatten().nth(*stake as usize) {
                        if !v.contains(&st.object) {
                            v.push(st.object);
                        }
                    }
                }
            }
            v
        }
        None => parent.stakes.iter().flatten().map(|s| s.object).collect(),
    };
    let fee = fee_raised(parent.fees.as_deref().unwrap_or(&[]), clone.fees.as_deref().unwrap_or(&[]));
    let mut out = vec![];
    for o in paid {
        let mut why = vec![];
        match (&parent.plan, &clone.plan) {
            (Some(p), Some(c)) => {
                if p.cmip != c.cmip || p.params != c.params {
                    why.push(PaidLess::Cmip);
                } else {
                    let lower = match (entries(parent, p), entries(clone, c)) {
                        (Some(pe), Some(ce)) => shares_pay_less(&pe, &p.unfilled, &ce, &c.unfilled, &o),
                        _ => true,
                    };
                    if lower {
                        let away = p.unfilled == Unfilled::Stakes && c.unfilled != Unfilled::Stakes && !c.roles().is_empty();
                        why.push(if away { PaidLess::Unfilled } else { PaidLess::Shares });
                    }
                }
                if p.service_bears_rail_fees && !c.service_bears_rail_fees {
                    why.push(PaidLess::RailFee);
                } else if !c.service_bears_rail_fees && max_raised(&p.max_rail_fee, &c.max_rail_fee) {
                    why.push(PaidLess::MaxFee);
                }
            }
            (None, None) => {}
            _ => why.push(PaidLess::Cmip),
        }
        if fee {
            why.push(PaidLess::Fee);
        }
        if !why.is_empty() {
            out.push((o, why));
        }
    }
    out
}

/// The holders whose signature F270 asks of `clone`: every identified holder
/// of a stake it pays less ([`stakes_paid_less`]) who has no voice in the
/// power making the change, that is, who is no party of the parent: in a
/// deal, a holder who is no party (every party signs every version of a
/// deal, rule 47, F107); in a collective, a holder who is no member, a
/// departed holder (rule 68) among them. No advance permission reaches
/// their pay (Agreements draft 12, F279): nothing replaces the signature.
pub fn pay_signers(parent: &Terms, clone: &Terms) -> Vec<Hash> {
    let mut out: Vec<Hash> = vec![];
    for (o, _) in stakes_paid_less(parent, clone) {
        let Some((_, st)) = parent.stake_on(&o) else { continue };
        for (h, n) in st.identified() {
            if n == 0 || out.contains(&h) {
                continue;
            }
            // In a deal, a holder who is no party; in a collective, a holder
            // who is no member: a departed holder, a stake successor (F279),
            // anyone who bought part of a stake (reading, to confirm:
            // `docs/f270-build.md`, Q2). Every party of a deal signs every
            // version (rule 47); a member holds the power or chose it.
            if !parent.parties.contains(&h) {
                out.push(h);
            }
        }
    }
    out
}

/// A share of the plan, followed across versions by what it pays: a stake
/// by its object, a role by its name, a named receiver by its identity, a
/// metric share by its metric.
#[derive(Clone, Debug, PartialEq)]
enum Key {
    Stake(Who),
    Role(String),
    Receiver(Hash),
    Metric(Metric),
}

#[derive(PartialEq)]
struct Entry {
    key: Key,
    part: u128,
    top: bool,
}

/// The plan's shares by what they pay, parts of one key summed; `None`
/// where the plan cannot be read so (a share naming a stake or a metric the
/// terms do not hold, or one key both on and off the top).
fn entries(t: &Terms, plan: &SplitPlan) -> Option<Vec<Entry>> {
    let mut out: Vec<Entry> = vec![];
    for (i, s) in plan.shares.iter().enumerate() {
        let top = plan.top.contains(&(i as u64));
        let (key, part) = match s {
            ShareRule::Stake { stake, part } => (Key::Stake(t.stakes.as_ref()?.get(*stake as usize)?.object), *part),
            ShareRule::Role { role, part } => (Key::Role(role.clone()), *part),
            ShareRule::Receiver { receiver, part } => (Key::Receiver(*receiver), *part),
            ShareRule::Metric { metric, part } => (Key::Metric(plan.metrics.get(*metric as usize)?.clone()), *part),
        };
        match out.iter_mut().find(|e| e.key == key) {
            Some(e) if e.top != top => return None,
            Some(e) => e.part += part as u128,
            None => out.push(Entry { key, part: part as u128, top }),
        }
    }
    Some(out)
}

fn find<'e>(es: &'e [Entry], k: &Key) -> Option<&'e Entry> {
    es.iter().find(|e| &e.key == k)
}

/// Whether the clone's shares pay the stake `o` less than the parent's, by
/// the plan's own division as Agreements draft 12 has it (F280): every
/// share paying anyone but a stake comes off the top, as overhead, in the
/// split cMIP's units (OF8 b); what is left goes to the stakes alone, in
/// proportion to their parts; a role nobody fills comes back to the stakes
/// where the plan sends it there (rule 22, F218). So, for a stake in the
/// rest: anything taken off the top added or raised, a role nobody fills
/// sent away from the stakes, or its part lowered against the other stakes'
/// pays it less; a stake moving onto or off the top cannot be read without
/// the cMIP's units, and counts. A stake on the top in both is paid less
/// only if its own part is lowered. A plan with a non-owner in the rest is
/// invalid (F280) and cannot be read: it counts.
fn shares_pay_less(p: &[Entry], pu: &Unfilled, c: &[Entry], cu: &Unfilled, o: &Who) -> bool {
    let ko = Key::Stake(*o);
    let Some(po) = find(p, &ko) else { return false };
    let Some(co) = find(c, &ko) else { return true };
    if po.top != co.top {
        return true;
    }
    if po.top {
        return co.part < po.part;
    }
    let owners_only = |es: &[Entry]| es.iter().all(|e| e.top || matches!(e.key, Key::Stake(_)));
    if !owners_only(p) || !owners_only(c) {
        return true;
    }
    // Overhead: what comes off the top, added or raised, leaves less.
    for e in c.iter().filter(|e| e.top) {
        match find(p, &e.key) {
            Some(x) if x.top && x.part >= e.part => {}
            _ => return true,
        }
    }
    // A stake moved off the top into the rest changes the weights.
    if p.iter().filter(|e| e.top).any(|e| find(c, &e.key).is_some_and(|x| !x.top)) {
        return true;
    }
    // A role nobody fills no longer comes back to the stakes.
    let roles = c.iter().any(|e| matches!(e.key, Key::Role(_)));
    if roles && *pu == Unfilled::Stakes && *cu != Unfilled::Stakes {
        return true;
    }
    // A role nobody fills is shared by the stakes in proportion to their
    // parts; where a stake is also taken off the top, that division is the
    // cMIP's, and a change cannot be read.
    let mixed = |es: &[Entry], u: &Unfilled| {
        *u == Unfilled::Stakes && es.iter().any(|e| matches!(e.key, Key::Role(_))) && es.iter().any(|e| e.top && matches!(e.key, Key::Stake(_)))
    };
    if (mixed(p, pu) || mixed(c, cu)) && (p != c || pu != cu) {
        return true;
    }
    // Among the stakes, by their parts: part / sum of the stakes' parts.
    let sum = |es: &[Entry]| es.iter().filter(|e| !e.top).map(|e| e.part).sum::<u128>();
    let (ps, cs) = (sum(p), sum(c));
    if cs == 0 || co.part == 0 {
        return true;
    }
    Big::from(co.part).mul(&Big::from(ps)).lt(&Big::from(po.part).mul(&Big::from(cs)))
}

/// Whether the clone adds a fee entry, widens one's scope, or raises one's
/// part: an entry of the clone with no entry of the parent for the same
/// Module and the same payments at a part as large.
fn fee_raised(p: &[Fee], c: &[Fee]) -> bool {
    c.iter().any(|f| !p.iter().any(|g| g.module == f.module && g.scope == f.scope && g.part >= f.part))
}

/// Whether the maximum fee per payout is raised or removed: removed, raised
/// in the same form (millionths, or an amount of the same unit), or moved to
/// another form or unit, which cannot be compared and so counts.
fn max_raised(p: &Option<Value>, c: &Option<Value>) -> bool {
    match (p, c) {
        (None, _) => false,
        (Some(_), None) => true,
        (Some(Value::Uint(a)), Some(Value::Uint(b))) => b > a,
        (Some(x), Some(y)) => match (Amount::decode(x), Amount::decode(y)) {
            (Ok(a), Ok(b)) if a.unit == b.unit => b.value > a.value,
            _ => true,
        },
    }
}

/// An unsigned integer of any size, for comparing fractions exactly: little
/// end first, in 64-bit limbs.
#[derive(Clone, Debug, PartialEq, Eq)]
struct Big(Vec<u64>);

impl Big {
    fn from(x: u128) -> Big {
        Big(vec![x as u64, (x >> 64) as u64]).trim()
    }

    fn trim(mut self) -> Big {
        while self.0.last() == Some(&0) {
            self.0.pop();
        }
        self
    }

    fn mul(&self, o: &Big) -> Big {
        let mut out = vec![0u64; self.0.len() + o.0.len() + 1];
        for (i, a) in self.0.iter().enumerate() {
            let mut carry = 0u128;
            for (j, b) in o.0.iter().enumerate() {
                let t = (*a as u128) * (*b as u128) + out[i + j] as u128 + carry;
                out[i + j] = t as u64;
                carry = t >> 64;
            }
            let mut k = i + o.0.len();
            while carry > 0 {
                let t = out[k] as u128 + carry;
                out[k] = t as u64;
                carry = t >> 64;
                k += 1;
            }
        }
        Big(out).trim()
    }

    fn lt(&self, o: &Big) -> bool {
        if self.0.len() != o.0.len() {
            return self.0.len() < o.0.len();
        }
        for i in (0..self.0.len()).rev() {
            if self.0[i] != o.0[i] {
                return self.0[i] < o.0[i];
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::Big;

    #[test]
    fn big_numbers_compare_exactly() {
        let m = Big::from(u128::MAX);
        let a = m.mul(&m).mul(&m);
        let b = m.mul(&m).mul(&Big::from(u128::MAX - 1));
        assert!(b.lt(&a));
        assert!(!a.lt(&b));
        assert!(!a.lt(&a));
        assert_eq!(Big::from(6), Big::from(2).mul(&Big::from(3)));
        assert!(Big::from(0).lt(&Big::from(1)));
    }
}
