//! The split cMIP draft 2's amounts and routing, without acts: every split
//! sums exactly, leftovers follow rule 15a, the plan's order decides only
//! between shares, the overhead comes off the top and the rest goes to the
//! stakes alone (F280), and the receiver is always one of the services given.

use mor_core::agreements::{Field4, Rule, ShareRule, SplitPlan, Stake, Terms, Unfilled, Who};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use mor_split::{divide, failed, route, Attempt, Failure, Route};

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn terms(shares: Vec<ShareRule>, top: Vec<u64>, stakes: Vec<Vec<(Hash, u64)>>) -> Terms {
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
        stakes: Some(
            stakes
                .into_iter()
                .enumerate()
                .map(|(i, hs)| Stake { object: Who::Id(h(&format!("work {i}"))), holders: hs.into_iter().map(|(x, n)| (Who::Id(x), n)).collect() })
                .collect(),
        ),
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: Some(SplitPlan { shares, cmip: mor_split::spec(), unfilled: Unfilled::Stakes, top, service_bears_rail_fees: false, max_rail_fee: None, params: None, metrics: vec![] }),
        refund: None,
        fees: None,
        backups: None,
    }
}

fn thirds() -> Vec<(Hash, u64)> {
    vec![(h("ana"), 333_334), (h("ben"), 333_333), (h("cy"), 333_333)]
}

#[test]
fn every_split_sums_exactly() {
    let t = terms(
        vec![ShareRule::Receiver { receiver: h("a host"), part: 50_000 }, ShareRule::Stake { stake: 0, part: 700_000 }, ShareRule::Stake { stake: 1, part: 300_000 }],
        vec![0],
        vec![thirds(), vec![(h("ana"), 1), (h("ben"), 1)]],
    );
    for amount in [0u64, 1, 2, 3, 7, 10, 99, 100, 101, 997, 1000, 123_457, u32::MAX as u64] {
        let d = divide(amount, &t, None, &|_| vec![]).unwrap();
        assert_eq!(d.payouts.iter().map(|p| p.amount as u128).sum::<u128>(), amount as u128, "{amount}");
        let host: u64 = d.payouts.iter().filter(|p| p.receiver == h("a host")).map(|p| p.amount).sum();
        assert_eq!(host as u128, amount as u128 * 50_000 / 1_000_000, "the top share, rounded down, of {amount}");
    }
}

#[test]
fn leftovers_follow_rule_15a_and_take_turns() {
    let t = terms(vec![ShareRule::Stake { stake: 0, part: 1 }], vec![], vec![vec![(h("ana"), 1), (h("ben"), 1)]]);
    // 3 between two equal holders: one unit left, tied. The first split
    // gives it to the smaller identity hash (F165); the count carries it.
    let d = divide(3, &t, None, &|_| vec![]).unwrap();
    let first = d.payouts.iter().find(|p| p.amount == 2).unwrap().receiver;
    assert_eq!(first, h("ana").min(h("ben")));
    let tally = d.tally[0].1.clone();
    // The next split: the other holder's turn.
    let d2 = divide(3, &t, None, &|_| tally.clone()).unwrap();
    let second = d2.payouts.iter().find(|p| p.amount == 2).unwrap().receiver;
    assert_ne!(first, second, "turns (F165)");
}

#[test]
fn the_plans_order_decides_only_between_shares() {
    // Two equal stakes, one unit left: the stake listed first (draft 2: only stakes share the rest).
    let t = terms(
        vec![ShareRule::Stake { stake: 0, part: 1 }, ShareRule::Stake { stake: 1, part: 1 }],
        vec![],
        vec![vec![(h("x"), 1)], vec![(h("y"), 1)]],
    );
    let d = divide(1, &t, None, &|_| vec![]).unwrap();
    assert_eq!(d.payouts.len(), 1);
    assert_eq!(d.payouts[0].receiver, h("x"));
    // Listed the other way round, the other.
    let t = terms(
        vec![ShareRule::Stake { stake: 1, part: 1 }, ShareRule::Stake { stake: 0, part: 1 }],
        vec![],
        vec![vec![(h("x"), 1)], vec![(h("y"), 1)]],
    );
    assert_eq!(divide(1, &t, None, &|_| vec![]).unwrap().payouts[0].receiver, h("y"));
    // Holders' order decides nothing (rule 21, F150).
    let a = terms(vec![ShareRule::Stake { stake: 0, part: 1 }], vec![], vec![thirds()]);
    let mut rev = thirds();
    rev.reverse();
    let b = terms(vec![ShareRule::Stake { stake: 0, part: 1 }], vec![], vec![rev]);
    for amount in [1, 2, 5, 100] {
        let mut x: Vec<(Hash, u64)> = divide(amount, &a, None, &|_| vec![]).unwrap().payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        let mut y: Vec<(Hash, u64)> = divide(amount, &b, None, &|_| vec![]).unwrap().payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        x.sort();
        y.sort();
        assert_eq!(x, y);
    }
}

#[test]
fn draft_2_pays_non_owners_off_the_top_only() {
    // F280: a named receiver, a role or a metric in the rest is refused, never divided.
    for other in [
        ShareRule::Receiver { receiver: h("a host"), part: 1 },
        ShareRule::Role { role: "relay".into(), part: 1 },
    ] {
        let t = terms(vec![other, ShareRule::Stake { stake: 0, part: 1 }], vec![], vec![thirds()]);
        let e = divide(10, &t, None, &|_| vec![]).unwrap_err();
        assert!(e.contains("F280"), "{e}");
    }
    // The top's parts are millionths of the payment, the whole at most.
    let t = terms(
        vec![ShareRule::Receiver { receiver: h("x"), part: 600_000 }, ShareRule::Receiver { receiver: h("y"), part: 400_001 }, ShareRule::Stake { stake: 0, part: 1 }],
        vec![0, 1],
        vec![thirds()],
    );
    assert!(divide(1, &t, None, &|_| vec![]).unwrap_err().contains("more than the whole payment"));
    // No stake in the rest (F283: a deal with no owners): the top makes the whole, its rounding's units by largest remainder.
    let t = terms(
        vec![ShareRule::Receiver { receiver: h("worker"), part: 700_000 }, ShareRule::Receiver { receiver: h("platform"), part: 300_000 }],
        vec![0, 1],
        vec![thirds()],
    );
    for amount in [0u64, 1, 2, 3, 7, 9, 10, 999, 1001, 123_457] {
        let d = divide(amount, &t, None, &|_| vec![]).unwrap();
        let paid = |w: &str| d.payouts.iter().filter(|p| p.receiver == h(w)).map(|p| p.amount).sum::<u64>();
        assert_eq!(paid("worker") + paid("platform"), amount, "exact, of {amount}");
        assert!((paid("worker") as u128).abs_diff(amount as u128 * 7 / 10) <= 1, "the worker's seven tenths, of {amount}");
    }
    // 3 units: 2.1 and 0.9; the unit the rounding leaves goes to the larger remainder, the platform's.
    let d = divide(3, &t, None, &|_| vec![]).unwrap();
    assert_eq!(d.payouts.iter().find(|p| p.receiver == h("platform")).unwrap().amount, 1);
    // With no stake in the rest, a top making less than the whole leaves money to no one: refused.
    let t = terms(vec![ShareRule::Receiver { receiver: h("worker"), part: 700_000 }], vec![0], vec![thirds()]);
    assert!(divide(10, &t, None, &|_| vec![]).unwrap_err().contains("no stake is left"));
}

#[test]
fn draft_2_refuses_what_it_does_not_compute() {
    // A role off the top: draft 2, as draft 1, does not compute roles.
    let t = terms(vec![ShareRule::Role { role: "relay".into(), part: 1 }, ShareRule::Stake { stake: 0, part: 1 }], vec![0], vec![thirds()]);
    assert!(divide(10, &t, None, &|_| vec![]).unwrap_err().contains("roles and metrics are refused"));
    let mut t = terms(vec![ShareRule::Stake { stake: 0, part: 1 }], vec![], vec![thirds()]);
    t.fees = Some(vec![]);
    assert!(divide(10, &t, None, &|_| vec![]).is_err());
}

#[test]
fn the_failure_condition_and_the_route() {
    assert_eq!(Failure::decode(None).unwrap(), Failure { wait: 60 });
    let f = Failure::decode(Some(&Value::Map(vec![(Value::Uint(0), Value::Uint(20))]))).unwrap();
    assert_eq!(f.wait, 20);
    assert!(Failure::decode(Some(&Value::Map(vec![(Value::Uint(0), Value::Uint(0))]))).is_err());
    assert!(Failure::decode(Some(&Value::Map(vec![(Value::Uint(1), Value::Uint(5))]))).is_err());
    assert_eq!(Failure::decode(Some(&f.to_value())).unwrap(), f);
    let s = [h("S"), h("T"), h("U")];
    assert_eq!(route(&s, &[], &f), Route::Try { at: 0, service: s[0] });
    assert_eq!(route(&s, &[Attempt::Silent { waited: 19 }], &f), Route::Try { at: 0, service: s[0] });
    assert_eq!(route(&s, &[Attempt::Silent { waited: 20 }], &f), Route::Try { at: 1, service: s[1] });
    assert_eq!(route(&s, &[Attempt::Refused, Attempt::Requested], &f), Route::Try { at: 1, service: s[1] });
    assert_eq!(route(&s, &[Attempt::Unpayable, Attempt::Paid], &f), Route::Paid { at: 1, service: s[1] });
    assert_eq!(route(&s, &[Attempt::Refused, Attempt::Refused, Attempt::Refused], &f), Route::Exhausted);
    // Only failed attempts are stated, and only before the one in progress.
    assert_eq!(failed(&s, &[Attempt::Refused, Attempt::Requested], &f), vec![s[0]]);
    assert_eq!(failed(&s, &[Attempt::Requested, Attempt::Refused], &f), Vec::<Hash>::new());
    // Never a service not given.
    for attempts in [vec![], vec![Attempt::Refused], vec![Attempt::Refused, Attempt::Paid]] {
        match route(&s, &attempts, &f) {
            Route::Try { service, .. } | Route::Paid { service, .. } => assert!(s.contains(&service)),
            Route::Exhausted => {}
        }
    }
}
