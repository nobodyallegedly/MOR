//! Agreements draft 12 (F280, decided by Nobody, allegedly: "Shared
//! ownership means shared fruits"), run on the split cMIP draft 1's
//! division as it stands (this file adds a test; the cMIP's text and code
//! are unchanged, listed for a later pass in `docs/f270-build.md`): a plan
//! paying a non-owner in the rest is refused by the core; the same share
//! off the top is accepted, and what is left goes to the stakes alone, by
//! their parts, and within each stake by its holders' shares, to the
//! smallest unit. Freeze suite v24, the split plan's line.

use mor_core::agreements::{Field4, Rule, ShareRule, SplitPlan, Stake, Terms, Unfilled, Who};
use mor_core::hash::{sha256, Hash};
use mor_split::divide;

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn terms(top: Vec<u64>) -> Terms {
    let stake = |name: &str, holders: Vec<(Hash, u64)>| Stake { object: Who::Id(h(name)), holders: holders.into_iter().map(|(x, n)| (Who::Id(x), n)).collect() };
    Terms {
        parties: vec![h("ana"), h("ben"), h("cy")],
        text: "A deal.".into(),
        cmips: vec![(8, mor_split::spec())],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: None,
        parent: None,
        grammar: None,
        arbitrators: None,
        split_grant: None,
        payee_grants: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: Some(vec![
            stake("the album", vec![(h("ana"), 500_000), (h("ben"), 300_000), (h("cy"), 200_000)]),
            stake("the artwork", vec![(h("cy"), 1_000_000)]),
        ]),
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: Some(SplitPlan {
            shares: vec![
                ShareRule::Stake { stake: 0, part: 3 },
                ShareRule::Stake { stake: 1, part: 1 },
                ShareRule::Receiver { receiver: h("a mastering service"), part: 100_000 },
            ],
            cmip: mor_split::spec(),
            unfilled: Unfilled::Stakes,
            top,
            service_bears_rail_fees: false,
            max_rail_fee: None,
            params: None,
            metrics: vec![],
        }),
        refund: None,
        fees: None,
        backups: None,
    }
}

#[test]
fn f280_the_overhead_off_the_top_and_the_rest_to_the_stakes_by_ownership() {
    // The mastering service in the rest, beside the owners: refused.
    let rest = terms(vec![]);
    assert!(rest.check(&mor_core::agreements::Mirs { identity: h("i"), envelopes: h("e"), text: h("t"), money: h("m"), agreements: h("a"), development: h("d") }).is_err_and(|e| e.to_string().contains("F280")));
    // Off the top: accepted, and divided so.
    let t = terms(vec![2]);
    for amount in [1_000u64, 1_001, 999_999, 7] {
        let d = divide(amount, &t, None, &|_| vec![]).unwrap();
        let paid = |who: &str, stake: Option<u64>| d.payouts.iter().filter(|p| p.receiver == h(who) && p.stake == stake).map(|p| p.amount).sum::<u64>();
        let overhead = paid("a mastering service", None);
        assert_eq!(overhead as u128, amount as u128 * 100_000 / 1_000_000, "the overhead, rounded down, of {amount}");
        let left = amount - overhead;
        let album: u64 = ["ana", "ben", "cy"].iter().map(|w| paid(w, Some(0))).sum();
        let artwork = paid("cy", Some(1));
        assert_eq!(album + artwork, left, "everything left goes to the stakes, of {amount}");
        assert!(album.abs_diff(left * 3 / 4) <= 1, "the album its three parts in four, of {amount}");
        // Within the album, by ownership, each within one smallest unit.
        for (w, n) in [("ana", 500_000u64), ("ben", 300_000), ("cy", 200_000)] {
            let exact = album as u128 * n as u128 / 1_000_000;
            assert!((paid(w, Some(0)) as u128).abs_diff(exact) <= 1, "{w}'s share of the album, of {amount}");
        }
        assert_eq!(d.payouts.iter().map(|p| p.amount).sum::<u64>(), amount, "exact to the unit");
    }
}
