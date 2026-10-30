//! Agreements draft 12 (F280, decided by Nobody, allegedly: "Shared
//! ownership means shared fruits"), run on the split cMIP's division: a
//! plan paying a non-owner in the rest is refused by the core; the same
//! non-owner as a partner, off the top, is accepted, and what is left goes
//! to the owners alone, by their shares, to the smallest unit. Freeze suite
//! v24, the split plan's line; Agreements draft 17, rule 22.
//!
//! Ported to the publication (the Dubsar Suite's round 8): draft 2's plan
//! had two stakes in the rest (the album three parts, the artwork one) and
//! a mastering service in it or off the top. A plan now has neither stakes
//! nor named receivers: the core's format refuses them (F280 made
//! structural), the mastering service is a partner, and the owners' line is
//! the one stake of the ownership agreement the publication names. Two
//! works' owners weighted against each other is now an ownership agreement
//! whose holders say so, not a plan's business.

use mor_core::agreements::{Partner, Publication, ShareRule, Sold, SplitPlan, Unfilled};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use mor_split::{divide, Facts, Owners};

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn plan(shares: Vec<ShareRule>) -> SplitPlan {
    SplitPlan {
        shares,
        cmip: mor_split::spec(),
        unfilled: Unfilled::Stakes,
        top: vec![],
        service_bears_rail_fees: false,
        max_rail_fee: None,
        params: None,
        metrics: vec![],
        fees: vec![],
    }
}

#[test]
fn f280_the_overhead_off_the_top_and_the_rest_to_the_owners_by_ownership() {
    // The mastering service in the plan, beside the owners: refused by the
    // core's format (a named receiver, or a stake share, in a plan), and by
    // the cMIP.
    for other in [ShareRule::Receiver { receiver: h("a mastering service"), part: 100_000 }, ShareRule::Stake { stake: 0, part: 3 }] {
        let v = plan(vec![other.clone()]).to_value();
        assert!(SplitPlan::decode(&v).is_err(), "the core refuses {other:?} in a plan");
        // The old keys 2 and 4 (stakes' rest, the top) are not used either.
        let Value::Map(mut m) = plan(vec![]).to_value() else { unreachable!() };
        m.push((Value::Uint(4), Value::Array(vec![Value::Uint(0)])));
        assert!(SplitPlan::decode(&Value::Map(m)).is_err());
    }
    let holders = [(h("ana"), 500_000), (h("ben"), 300_000), (h("cy"), 200_000)];
    let mut p = Publication {
        sold: Some(vec![Sold::Bake(h("the album"))]),
        owners: Some(h("the album's ownership agreement")),
        partners: vec![],
        service: h("S"),
        plan: plan(vec![ShareRule::Receiver { receiver: h("a mastering service"), part: 100_000 }]),
        words: None,
        time: None,
        until: None,
        refund: None,
        cmips: vec![(8, mor_split::spec())],
        designated: None,
        backups: vec![],
        failed: None,
    };
    let owners = Owners::Line { agreement: h("the album's ownership agreement"), holders: &holders, before: &[] };
    assert!(divide(1_000, &p, owners, &Facts::default()).is_err_and(|e| e.contains("F280")));
    // A partner, off the top: accepted, and divided so.
    p.plan = plan(vec![]);
    p.partners = vec![Partner { identity: h("a mastering service"), share: 100_000, label: Some("mastering".into()) }];
    assert!(SplitPlan::decode(&p.plan.to_value()).is_ok());
    for amount in [1_000u64, 1_001, 999_999, 7] {
        let d = divide(amount, &p, owners, &Facts::default()).unwrap();
        let paid = |who: &str, line: bool| d.payouts.iter().filter(|p| p.receiver == h(who) && p.stake.is_some() == line).map(|p| p.amount).sum::<u64>();
        let overhead = paid("a mastering service", false);
        assert_eq!(overhead as u128, amount as u128 * 100_000 / 1_000_000, "the overhead, rounded down, of {amount}");
        let left = amount - overhead;
        let line: u64 = ["ana", "ben", "cy"].iter().map(|w| paid(w, true)).sum();
        assert_eq!(line, left, "everything left goes to the owners, of {amount}");
        // By ownership, each within one smallest unit.
        for (w, n) in [("ana", 500_000u64), ("ben", 300_000), ("cy", 200_000)] {
            let exact = line as u128 * n as u128 / 1_000_000;
            assert!((paid(w, true) as u128).abs_diff(exact) <= 1, "{w}'s share of the line, of {amount}");
        }
        assert!(d.payouts.iter().filter(|x| x.stake.is_some()).all(|x| x.owners == Some(h("the album's ownership agreement"))));
        assert_eq!(d.payouts.iter().map(|p| p.amount).sum::<u64>(), amount, "exact to the unit");
    }
}
