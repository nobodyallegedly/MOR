//! What a version pays a stake less (Agreements draft 12, rule 48: F270, as
//! F273 and F274 read it).
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
//! parent; in a collective, a holder the parent's departed members entry
//! (field 22) names. Members are left to the collective's own rules. F273's
//! advance permission, which reaches a departed holder's pay and never a
//! deal's non-party holder's, is the view's to read: it rests on acts, not
//! on the terms ([`super::view::AgreementsView`]).

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
/// power making the change. In a deal, a holder who is no party of the
/// parent (every party signs every version of a deal, rule 47, F107); in a
/// collective, a holder the parent's departed members entry names (rule 68).
/// Without F273's advance permission, which only the view reads.
pub fn pay_signers(parent: &Terms, clone: &Terms) -> Vec<Hash> {
    let mut out: Vec<Hash> = vec![];
    for (o, _) in stakes_paid_less(parent, clone) {
        let Some((_, st)) = parent.stake_on(&o) else { continue };
        for (h, n) in st.identified() {
            if n == 0 || out.contains(&h) {
                continue;
            }
            let voiceless = if parent.is_collective() {
                parent.departed.iter().flatten().any(|d| d == &h)
            } else {
                !parent.parties.contains(&h)
            };
            if voiceless {
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
/// the plan's own division: shares off the top first (key 4), each by its
/// own part; the rest in proportion to their parts; a role share nobody
/// fills to the stakes in proportion to their parts, where the plan sends it
/// there (rule 22, F218). Judged for every way the roles can be filled or
/// not, since the plan as written lets a stake expect each. What comes off
/// the top is in the split cMIP's units (OF8 b), so it is compared only
/// share by share: anything taken off the top growing, a share moving onto
/// or off it, or a role nobody fills where a stake or role sits on the top,
/// cannot be read, and counts.
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
    for e in c.iter().filter(|e| e.top) {
        match find(p, &e.key) {
            Some(x) if x.top && x.part >= e.part => {}
            _ => return true,
        }
    }
    if p.iter().filter(|e| e.top).any(|e| find(c, &e.key).is_some_and(|x| !x.top)) {
        return true;
    }
    let unread = |es: &[Entry], u: &Unfilled| {
        *u == Unfilled::Stakes
            && es.iter().any(|e| matches!(e.key, Key::Role(_)))
            && es.iter().any(|e| e.top && matches!(e.key, Key::Stake(_) | Key::Role(_)))
    };
    if unread(p, pu) || unread(c, cu) {
        return true;
    }
    let mut roles: Vec<&str> = vec![];
    for e in p.iter().chain(c.iter()) {
        if let Key::Role(r) = &e.key {
            if !roles.contains(&r.as_str()) {
                roles.push(r);
            }
        }
    }
    if roles.len() > 12 {
        return true;
    }
    for mask in 0u32..(1 << roles.len()) {
        let filled = |r: &str| roles.iter().position(|x| *x == r).is_some_and(|i| mask & (1 << i) != 0);
        let (pn, pd) = portion(p, pu, &ko, &filled);
        let (cn, cd) = portion(c, cu, &ko, &filled);
        if Big::product(&[cn.clone(), pd.clone()]).lt(&Big::product(&[pn, cd])) {
            return true;
        }
    }
    false
}

/// The stake's portion of what is left after the top, as a fraction, with
/// the roles `filled` filled and every other role unfilled.
fn portion(es: &[Entry], u: &Unfilled, ko: &Key, filled: &dyn Fn(&str) -> bool) -> (Big, Big) {
    let rest: u128 = es.iter().filter(|e| !e.top).map(|e| e.part).sum();
    let part = find(es, ko).map(|e| e.part).unwrap_or(0);
    if rest == 0 || part == 0 {
        return (Big::from(0), Big::from(1));
    }
    if *u == Unfilled::Stakes {
        let stakes: u128 = es.iter().filter(|e| !e.top && matches!(e.key, Key::Stake(_))).map(|e| e.part).sum();
        let open: u128 = es
            .iter()
            .filter(|e| !e.top && matches!(&e.key, Key::Role(r) if !filled(r)))
            .map(|e| e.part)
            .sum();
        // part × (stakes + open) / (rest × stakes): its own part, and its
        // share of the roles nobody fills.
        return (
            Big::product(&[Big::from(part), Big::from(stakes).add(&Big::from(open))]),
            Big::product(&[Big::from(rest), Big::from(stakes)]),
        );
    }
    (Big::from(part), Big::from(rest))
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

    fn add(&self, o: &Big) -> Big {
        let n = self.0.len().max(o.0.len());
        let mut out = Vec::with_capacity(n + 1);
        let mut carry = 0u128;
        for i in 0..n {
            let s = *self.0.get(i).unwrap_or(&0) as u128 + *o.0.get(i).unwrap_or(&0) as u128 + carry;
            out.push(s as u64);
            carry = s >> 64;
        }
        out.push(carry as u64);
        Big(out).trim()
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

    fn product(xs: &[Big]) -> Big {
        xs.iter().fold(Big::from(1), |a, x| a.mul(x))
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
        let a = Big::product(&[m.clone(), m.clone(), m.clone()]);
        let b = Big::product(&[m.clone(), m.clone(), m.add(&Big::from(1))]);
        assert!(a.lt(&b));
        assert!(!b.lt(&a));
        assert!(!a.lt(&a));
        assert_eq!(Big::from(6), Big::product(&[Big::from(2), Big::from(3)]));
        assert!(Big::from(0).lt(&Big::from(1)));
    }
}
