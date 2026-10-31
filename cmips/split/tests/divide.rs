//! The split cMIP draft 4's amounts and routing, without acts: every split
//! sums exactly, the owners' line follows rule 9 with turns, the order in
//! which anything is listed decides nothing, everything but the owners'
//! line comes off the top (F280), roles, metric shares and fees are
//! computed, what draft 4 does not split is refused, and the receiver is
//! always one of the services the publication names.
//!
//! Ported to the publication (the Dubsar Suite's round 8): the plan no
//! longer carries stakes or named receivers, so where draft 2's tests had
//! two stakes or a named receiver in one plan, these have partners off the
//! top and the one stake of the ownership agreement; each test says so.

use mor_core::agreements::{Fee, FeeScope, Metric, Partner, Publication, ShareRule, Sold, SplitPlan, Unfilled};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use mor_split::{divide, failed, route, Attempt, Facts, Failure, Filler, Measure, Owners, Route};

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

/// A publication of the ownership agreement "the song" (or, with `owners`
/// false, a lone seller's), its partners `partners`, its plan `plan`.
fn publication(owners: bool, partners: Vec<(Hash, u64)>, plan: SplitPlan) -> Publication {
    let mut partners: Vec<Partner> = partners.into_iter().map(|(identity, share)| Partner { identity, share, label: None }).collect();
    partners.sort_by_key(|p| p.identity);
    Publication {
        sold: Some(vec![Sold::Bake(h("a bake"))]),
        owners: owners.then(|| h("the song")),
        partners,
        service: h("S"),
        plan,
        words: None,
        time: None,
        until: None,
        refund: None,
        cmips: vec![(8, mor_split::spec())],
        designated: None,
        backups: vec![],
        failed: None,
    }
}

fn line<'a>(holders: &'a [(Hash, u64)], before: &'a [(Hash, u64)]) -> Owners<'a> {
    Owners::Line { agreement: h("the song"), holders, before }
}

fn thirds() -> Vec<(Hash, u64)> {
    vec![(h("ana"), 333_334), (h("ben"), 333_333), (h("cy"), 333_333)]
}

fn paid(d: &mor_split::Divided, who: Hash) -> u64 {
    d.payouts.iter().filter(|p| p.receiver == who).map(|p| p.amount).sum()
}

/// Draft 2 had a named receiver off the top and two stakes, 70 and 30, in
/// the rest; the plan carries neither now: a host as a partner off the top,
/// and the ownership agreement's one stake.
#[test]
fn every_split_sums_exactly() {
    let p = publication(true, vec![(h("a host"), 50_000), (h("a label"), 150_000)], plan(vec![]));
    let holders = thirds();
    for amount in [0u64, 1, 2, 3, 7, 10, 99, 100, 101, 997, 1000, 123_457, u32::MAX as u64] {
        let d = divide(amount, &p, line(&holders, &[]), &Facts::default()).unwrap();
        assert_eq!(d.payouts.iter().map(|p| p.amount as u128).sum::<u128>(), amount as u128, "{amount}");
        assert_eq!(paid(&d, h("a host")) as u128, amount as u128 * 50_000 / 1_000_000, "the partner's share, rounded down, of {amount}");
        assert_eq!(paid(&d, h("a label")) as u128, amount as u128 * 150_000 / 1_000_000, "the partner's share, rounded down, of {amount}");
        // Every partner payout names its partner by its index in field 2.
        for x in d.payouts.iter().filter(|x| x.partner.is_some()) {
            assert_eq!(p.partners[x.partner.unwrap() as usize].identity, x.receiver);
        }
    }
    // A lone seller's publication: the drafter takes the owners' line, whole.
    let p = publication(false, vec![(h("a host"), 50_000)], plan(vec![]));
    for amount in [0u64, 1, 19, 20, 21, 1000, 123_457] {
        let d = divide(amount, &p, Owners::Lone(h("the drafter")), &Facts::default()).unwrap();
        assert_eq!(paid(&d, h("the drafter")) + paid(&d, h("a host")), amount, "exact, of {amount}");
        assert!(d.payouts.iter().all(|x| x.stake.is_none() && x.owners.is_none()), "a lone seller's line names no ownership agreement");
        assert!(d.tally.is_empty());
    }
}

#[test]
fn leftovers_follow_rule_9_and_take_turns() {
    let p = publication(true, vec![], plan(vec![]));
    let holders = vec![(h("ana"), 1), (h("ben"), 1)];
    // 3 between two equal holders: one unit left, tied. The first split
    // gives it to the smaller identity hash (F165); the count carries it.
    let d = divide(3, &p, line(&holders, &[]), &Facts::default()).unwrap();
    let first = d.payouts.iter().find(|p| p.amount == 2).unwrap().receiver;
    assert_eq!(first, h("ana").min(h("ben")));
    assert!(d.payouts.iter().all(|x| x.stake == Some(0) && x.owners == Some(h("the song"))), "the owners' line names the ownership agreement");
    assert_eq!(d.tally[0].0, 0, "the one stake");
    let tally = d.tally[0].1.clone();
    // The next split: the other holder's turn.
    let d2 = divide(3, &p, line(&holders, &tally), &Facts::default()).unwrap();
    let second = d2.payouts.iter().find(|p| p.amount == 2).unwrap().receiver;
    assert_ne!(first, second, "turns (F165)");
}

/// Draft 2 tested that the plan's order decided between two equal stakes;
/// a plan has no stakes now, and every share off the top is rounded down
/// on its own, the units the rounding leaves going to the owners' line. So
/// no list's order decides anything: not the holders' (rule 21, F150), not
/// a role's fillers', and the units off the top go to the line, never to a
/// share by its place.
#[test]
fn no_order_decides_anything() {
    // Holders' order decides nothing.
    let p = publication(true, vec![], plan(vec![]));
    let a = thirds();
    let mut b = thirds();
    b.reverse();
    for amount in [1, 2, 5, 100] {
        let mut x: Vec<(Hash, u64)> = divide(amount, &p, line(&a, &[]), &Facts::default()).unwrap().payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        let mut y: Vec<(Hash, u64)> = divide(amount, &p, line(&b, &[]), &Facts::default()).unwrap().payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        x.sort();
        y.sort();
        assert_eq!(x, y);
    }
    // Two equal partners, one unit: neither takes it by its place; it is the line's.
    let p = publication(true, vec![(h("x"), 400_000), (h("y"), 400_000)], plan(vec![]));
    let holders = vec![(h("ana"), 1)];
    let d = divide(1, &p, line(&holders, &[]), &Facts::default()).unwrap();
    assert_eq!((paid(&d, h("x")), paid(&d, h("y")), paid(&d, h("ana"))), (0, 0, 1));
    // A role's fillers, listed either way: the same payouts.
    let p = publication(true, vec![], plan(vec![ShareRule::Role { role: "relay".into(), part: 300_000 }]));
    let f = |who: &str| Filler { role: "relay".into(), who: h(who), evidence: h(&format!("{who}'s delivery record")) };
    let one = Facts { fillers: vec![f("r1"), f("r2")], ..Default::default() };
    let two = Facts { fillers: vec![f("r2"), f("r1")], ..Default::default() };
    for amount in [1, 7, 10, 101] {
        let mut x: Vec<(Hash, u64)> = divide(amount, &p, line(&holders, &[]), &one).unwrap().payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        let mut y: Vec<(Hash, u64)> = divide(amount, &p, line(&holders, &[]), &two).unwrap().payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        x.sort();
        y.sort();
        assert_eq!(x, y, "of {amount}");
    }
}

/// F280 in draft 4: the plan holds only roles and metric shares, so a
/// non-owner can no longer be put in the rest; a plan that tries (a stake
/// share, a named receiver) is refused. Draft 2's deal with no owners (F283:
/// a worker and a platform, the top making the whole) is now a lone
/// seller's publication with the platform as a partner; and since the
/// owners' line always takes what is left, "a top making less than the
/// whole, with no stake to take the rest" cannot happen: replaced by
/// partners making the whole, their rounding's units going to the line.
#[test]
fn draft_4_pays_non_owners_off_the_top_only() {
    let holders = thirds();
    for other in [ShareRule::Receiver { receiver: h("a host"), part: 1 }, ShareRule::Stake { stake: 0, part: 1 }] {
        let p = publication(true, vec![], plan(vec![other]));
        let e = divide(10, &p, line(&holders, &[]), &Facts::default()).unwrap_err();
        assert!(e.contains("F280"), "{e}");
    }
    // The top's parts are millionths of the payment, the whole at most.
    let p = publication(true, vec![(h("x"), 600_000), (h("y"), 400_001)], plan(vec![]));
    assert!(divide(1, &p, line(&holders, &[]), &Facts::default()).unwrap_err().contains("more than the whole payment"));
    // A worker selling alone, a platform its partner for three tenths.
    let p = publication(false, vec![(h("platform"), 300_000)], plan(vec![]));
    for amount in [0u64, 1, 2, 3, 7, 9, 10, 999, 1001, 123_457] {
        let d = divide(amount, &p, Owners::Lone(h("worker")), &Facts::default()).unwrap();
        assert_eq!(paid(&d, h("worker")) + paid(&d, h("platform")), amount, "exact, of {amount}");
        assert!((paid(&d, h("worker")) as u128).abs_diff(amount as u128 * 7 / 10) <= 1, "the worker's seven tenths, of {amount}");
    }
    // 3 units: the platform's 0.9 rounds down; the unit is the owner's line's.
    let d = divide(3, &p, Owners::Lone(h("worker")), &Facts::default()).unwrap();
    assert_eq!((paid(&d, h("platform")), paid(&d, h("worker"))), (0, 3));
    // Partners making the whole: the rounding's units go to the owners' line.
    let p = publication(true, vec![(h("x"), 700_000), (h("y"), 300_000)], plan(vec![]));
    let d = divide(3, &p, line(&holders, &[]), &Facts::default()).unwrap();
    assert_eq!((paid(&d, h("x")), paid(&d, h("y"))), (2, 0));
    assert_eq!(d.payouts.iter().filter(|x| x.stake.is_some()).map(|x| x.amount).sum::<u64>(), 1);
    // The owners' side must match the publication's field 1.
    let p = publication(true, vec![], plan(vec![]));
    assert!(divide(10, &p, Owners::Lone(h("worker")), &Facts::default()).is_err());
    let p = publication(false, vec![], plan(vec![]));
    assert!(divide(10, &p, line(&holders, &[]), &Facts::default()).is_err());
}

/// New in draft 4: roles, metric shares and fees are computed (draft 2
/// refused them), each off the top, in millionths of the payment.
#[test]
fn draft_4_computes_roles_metrics_and_fees() {
    let holders = vec![(h("ana"), 600_000), (h("ben"), 400_000)];
    let mut pl = plan(vec![ShareRule::Role { role: "relay".into(), part: 100_000 }, ShareRule::Metric { metric: 0, part: 200_000 }]);
    pl.metrics = vec![Metric { module: h("a plays Module"), measurer: h("a measurer"), params: None }];
    pl.fees = vec![
        Fee { module: h("a Module"), part: 10_000, scope: FeeScope::Every },
        Fee { module: h("a rail Module's fee"), part: 5_000, scope: FeeScope::Rail(h("lightning")) },
        Fee { module: h("a bake's fee"), part: 1_000, scope: FeeScope::Bake(h("another bake")) },
    ];
    let p = publication(true, vec![(h("a label"), 150_000)], pl);
    let facts = Facts {
        rail: Some(h("lightning")),
        fillers: vec![
            Filler { role: "relay".into(), who: h("r1"), evidence: h("r1's record") },
            Filler { role: "relay".into(), who: h("r2"), evidence: h("r2's record") },
            Filler { role: "relay".into(), who: h("r3"), evidence: h("r3's record") },
        ],
        measures: vec![Measure { share: 1, who: h("ana"), weight: 3 }, Measure { share: 1, who: h("a label"), weight: 1 }],
        fee_receivers: vec![(h("a Module"), h("its creator")), (h("a rail Module's fee"), h("the rail's creator"))],
    };
    for amount in [0u64, 1, 10, 999, 1_000, 100_001, 123_457] {
        let d = divide(amount, &p, line(&holders, &[]), &facts).unwrap();
        assert_eq!(d.payouts.iter().map(|x| x.amount).sum::<u64>(), amount, "exact, of {amount}");
        let role: Vec<u64> = d.payouts.iter().filter(|x| x.role.as_deref() == Some("relay")).map(|x| x.amount).collect();
        assert_eq!(role.iter().sum::<u64>(), amount / 10, "the role its part, rounded down, of {amount}");
        assert!(role.iter().max().unwrap_or(&0) - role.iter().min().unwrap_or(&0) <= 1, "fillers equally, within one unit");
        assert!(d.payouts.iter().filter(|x| x.role.is_some()).all(|x| x.evidence.is_some()), "each role payout names its evidence");
        let metric: u64 = d.payouts.iter().filter(|x| x.metric == Some(1)).map(|x| x.amount).sum();
        assert_eq!(metric, amount / 5, "the metric share its part, of {amount}");
        let ana_m: u64 = d.payouts.iter().filter(|x| x.metric == Some(1) && x.receiver == h("ana")).map(|x| x.amount).sum();
        assert!((ana_m as u128).abs_diff(metric as u128 * 3 / 4) <= 1, "by the measures, of {amount}");
        let fee = |m: &str| d.payouts.iter().filter(|x| x.fee_module == Some(h(m))).map(|x| x.amount).sum::<u64>();
        assert_eq!(fee("a Module"), amount / 100);
        assert_eq!(fee("a rail Module's fee"), amount * 5_000 / 1_000_000);
        assert!(!d.payouts.iter().any(|x| x.fee_module == Some(h("a bake's fee"))), "a fee on a bake the publication does not sell is not owed");
    }
    // By another rail, the rail's fee is not owed.
    let other = Facts { rail: Some(h("on-chain")), ..facts.clone() };
    let d = divide(1_000, &p, line(&holders, &[]), &other).unwrap();
    assert!(!d.payouts.iter().any(|x| x.fee_module == Some(h("a rail Module's fee"))));
    // A role nobody fills goes to the owners' line by default.
    let none = Facts { fillers: vec![], ..facts.clone() };
    let d = divide(1_000, &p, line(&holders, &[]), &none).unwrap();
    assert!(!d.payouts.iter().any(|x| x.role.is_some()));
    assert_eq!(d.payouts.iter().filter(|x| x.stake.is_some()).map(|x| x.amount).sum::<u64>(), 1_000 - 150 - 200 - 10 - 5);
}

/// What draft 4 does not split is refused, never guessed.
#[test]
fn draft_4_refuses_what_it_does_not_compute() {
    let holders = vec![(h("ana"), 1)];
    let role = |unfilled: Unfilled| {
        let mut pl = plan(vec![ShareRule::Role { role: "relay".into(), part: 1 }]);
        pl.unfilled = unfilled;
        publication(true, vec![], pl)
    };
    // An unfilled role held open, or sent to a named party: the core has no payout for either (QS3).
    for u in [Unfilled::HeldOpen, Unfilled::To(h("someone"))] {
        assert!(divide(10, &role(u), line(&holders, &[]), &Facts::default()).unwrap_err().contains("QS3"));
    }
    // A filler of a role the plan does not name.
    let f = Facts { fillers: vec![Filler { role: "host".into(), who: h("x"), evidence: h("e") }], ..Default::default() };
    assert!(divide(10, &role(Unfilled::Stakes), line(&holders, &[]), &f).is_err());
    // A metric share with no measure (QS4); paying its measurer, or someone the publication does not pay (rule 29).
    let mut pl = plan(vec![ShareRule::Metric { metric: 0, part: 1 }]);
    pl.metrics = vec![Metric { module: h("m"), measurer: h("a measurer"), params: None }];
    let p = publication(true, vec![], pl);
    assert!(divide(10, &p, line(&holders, &[]), &Facts::default()).unwrap_err().contains("QS4"));
    for who in ["a measurer", "a stranger"] {
        let f = Facts { measures: vec![Measure { share: 0, who: h(who), weight: 1 }], ..Default::default() };
        assert!(divide(10, &p, line(&holders, &[]), &f).unwrap_err().contains("rule 29"));
    }
    // A fee owed with no receiver given.
    let mut pl = plan(vec![]);
    pl.fees = vec![Fee { module: h("a Module"), part: 1, scope: FeeScope::Every }];
    assert!(divide(10, &publication(true, vec![], pl), line(&holders, &[]), &Facts::default()).is_err());
    // An ownership agreement whose stake has no holder.
    assert!(divide(10, &publication(true, vec![], plan(vec![])), line(&[], &[]), &Facts::default()).is_err());
}

#[test]
fn the_failure_condition_and_the_route() {
    assert_eq!(Failure::decode(None).unwrap(), Failure { wait: 60 });
    let f = Failure::decode(Some(&Value::Map(vec![(Value::Uint(0), Value::Uint(20))]))).unwrap();
    assert_eq!(f.wait, 20);
    assert!(Failure::decode(Some(&Value::Map(vec![(Value::Uint(0), Value::Uint(0))]))).is_err());
    assert!(Failure::decode(Some(&Value::Map(vec![(Value::Uint(1), Value::Uint(5))]))).is_err());
    assert_eq!(Failure::decode(Some(&f.to_value())).unwrap(), f);
    // The services the publication names: field 3's, then field 11's in order; field 12 the failure.
    let mut p = publication(true, vec![], plan(vec![]));
    p.backups = vec![h("T"), h("U")];
    p.failed = Some(f.to_value());
    let s = [h("S"), h("T"), h("U")];
    assert_eq!(p.services(), s.to_vec());
    let r = |a: &[Attempt]| route(&p, a).unwrap();
    assert_eq!(r(&[]), Route::Try { at: 0, service: s[0] });
    assert_eq!(r(&[Attempt::Silent { waited: 19 }]), Route::Try { at: 0, service: s[0] });
    assert_eq!(r(&[Attempt::Silent { waited: 20 }]), Route::Try { at: 1, service: s[1] });
    assert_eq!(r(&[Attempt::Refused, Attempt::Requested]), Route::Try { at: 1, service: s[1] });
    assert_eq!(r(&[Attempt::Unpayable, Attempt::Paid]), Route::Paid { at: 1, service: s[1] });
    assert_eq!(r(&[Attempt::Refused, Attempt::Refused, Attempt::Refused]), Route::Exhausted);
    // Only failed attempts are stated, and only before the one in progress.
    assert_eq!(failed(&p, &[Attempt::Refused, Attempt::Requested]).unwrap(), vec![s[0]]);
    assert_eq!(failed(&p, &[Attempt::Requested, Attempt::Refused]).unwrap(), Vec::<Hash>::new());
    // Never a service the publication does not name.
    for attempts in [vec![], vec![Attempt::Refused], vec![Attempt::Refused, Attempt::Paid]] {
        match r(&attempts) {
            Route::Try { service, .. } | Route::Paid { service, .. } => assert!(s.contains(&service)),
            Route::Exhausted => {}
        }
    }
    // No backups: the one service; field 12 out of this cMIP's format: refused (fail closed).
    let q = publication(true, vec![], plan(vec![]));
    assert_eq!(route(&q, &[Attempt::Refused]).unwrap(), Route::Exhausted);
    p.failed = Some(Value::Uint(60));
    assert!(route(&p, &[]).is_err() && failed(&p, &[]).is_err());
}
