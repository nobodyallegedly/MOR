//! Each flaw's story, replayed under the rule tested, by hand, with the verdict the write-up
//! claims. Then a short random sweep.

use mor_ordering_sim::check::{
    check, check_written, verdict, Tally, WrittenTally, ALPHA, ALPHA_IMPLICIT, ALPHA_K, ALPHA_KC,
    BETA, WRITTEN,
};
use mor_ordering_sim::model::{Builder, Kind, On, Tips, Who, World};
use mor_ordering_sim::rule::{Clock, Deal, Rule};

/// Three members; member 0 is the treasurer, sole holder of the area, deciding alone.
/// The collective keeps two devices; members keep three each (phone, laptop, tablet).
fn label() -> Builder {
    Builder::new(World::new(3, vec![0], 1), 2, &[3, 3, 3, 3])
}

fn root(w: &World) -> mor_ordering_sim::rule::Verdict {
    verdict(w, ALPHA, Clock::Structure)
}

fn draft7(w: &World) -> mor_ordering_sim::rule::Verdict {
    verdict(w, Rule::Draft7, Clock::Structure)
}

/// Flaws E and F: the treasurer keeps a phone, a laptop and a tablet; resigns from the
/// laptop naming the phone only. Receipts signed before, from every device, keep counting;
/// one signed after the collective's line does not, whatever device it comes from.
#[test]
fn flaw_e_and_f_forgotten_devices() {
    let mut b = label();
    let x1 = b.col(Kind::AreaAct, 0);
    b.member(0, 0, Kind::Sig { on: On::Act(x1) }); // phone
    let x2 = b.col(Kind::AreaAct, 1);
    b.member(0, 2, Kind::Sig { on: On::Act(x2) }); // tablet, forgotten below
    let res = b.leave(0, 1, Kind::Resign, Some(2));
    let l = b.line(
        Kind::Register {
            departures: vec![res],
        },
        0,
        Tips::Complete,
        None,
    );
    let x3 = b.col(Kind::AreaAct, 1);
    b.member(0, 2, Kind::Sig { on: On::Act(x3) }); // after the line, from the tablet
    let w = b.finish();
    let v = root(&w);
    assert!(
        v.area_of(x1) && v.area_of(x2),
        "receipts before the line stand"
    );
    assert!(
        !v.area_of(x3),
        "a receipt after the line does not count with the departed treasurer"
    );
    // Draft 7 as written loses the tablet's receipt: its sequence was left out (flaw F).
    assert!(!draft7(&w).area_of(x2));
    let _ = l;
}

/// Flaw F: a clone signed from the forgotten tablet, recorded before the line, stays in
/// force; a paid publication signed from it stays the collective's.
#[test]
fn flaw_f_completed_clone_stays_complete() {
    let mut b = label();
    let c = b.clone_def(0, 2);
    let s0 = b.member(0, 2, Kind::Sig { on: On::Clone(c) });
    let s1 = b.member(1, 0, Kind::Sig { on: On::Clone(c) });
    let r = b.line(
        Kind::Record {
            clone: c,
            sigs: vec![s0, s1],
        },
        0,
        Tips::Complete,
        None,
    );
    let res = b.leave(0, 1, Kind::Resign, Some(2));
    b.line(
        Kind::Register {
            departures: vec![res],
        },
        1,
        Tips::Complete,
        None,
    );
    let w = b.finish();
    assert!(root(&w).record_of(r));
}

/// Flaw G: a friend acknowledges a signature the departed treasurer made after the line.
/// Nothing changes: acknowledgements by others place nothing.
#[test]
fn flaw_g_friend_ack_places_nothing() {
    let mut b = label();
    let res = b.leave(0, 0, Kind::Resign, None);
    b.line(
        Kind::Register {
            departures: vec![res],
        },
        0,
        Tips::Complete,
        None,
    );
    let x = b.col(Kind::AreaAct, 0);
    let s = b.member(0, 2, Kind::Sig { on: On::Act(x) });
    b.other(Who::Friend, Kind::FriendAck { of: s });
    let w = b.finish();
    assert!(!root(&w).area_of(x));
    assert_eq!(root(&w), root(&w.without_friend_acks()));
}

/// Flaws H and I, Q30: the release manager (sole holder) steps down; a grant's deals: A
/// recorded by a keeper, B paid on, C nothing, D made during the freeze. With a
/// reinstatement every deal binds (I, option 1); with a seal only B binds, A once imported.
#[test]
fn flaws_h_i_and_q30_grant_through_a_freeze() {
    for reinstate in [true, false] {
        let mut b = label();
        let g = b.col(Kind::Grant, 0);
        b.member(0, 0, Kind::Sig { on: On::Act(g) });
        let a = b.other(Who::Grantee, Kind::Deal { grant: g });
        b.keeper_records(a);
        let bb = b.other(Who::Grantee, Kind::Deal { grant: g });
        b.col(Kind::PayOn { deal: bb }, 1);
        let c = b.other(Who::Grantee, Kind::Deal { grant: g });
        let sd = b.leave(0, 0, Kind::StepDown, None);
        let f = b.line(
            Kind::Register {
                departures: vec![sd],
            },
            0,
            Tips::Complete,
            None,
        );
        b.keeper_records(f);
        let d = b.other(Who::Grantee, Kind::Deal { grant: g });
        let mid = b.w.clone();
        let v = root(&mid);
        assert_eq!(v.deal_of(bb), Deal::Binds, "paid on: binds");
        for x in [a, c, d] {
            assert_eq!(
                v.deal_of(x),
                Deal::Undetermined,
                "unplaced, awaiting the refit"
            );
        }
        b.line(
            Kind::Refit {
                holders: vec![3],
                rank: 1,
            },
            0,
            Tips::Complete,
            None,
        );
        let kind = if reinstate {
            Kind::Reinstate { grant: g }
        } else {
            Kind::Revoke { grant: g }
        };
        let y = b.col(kind, 0);
        b.member(3, 0, Kind::Sig { on: On::Act(y) });
        if !reinstate {
            b.col(Kind::Import { deals: vec![a] }, 0);
        }
        let w = b.finish();
        let v = root(&w);
        assert_eq!(v.deal_of(bb), Deal::Binds);
        assert_eq!(v.deal_of(a), Deal::Binds);
        let rest = if reinstate {
            Deal::Binds
        } else {
            Deal::NotBinding
        };
        assert_eq!(v.deal_of(c), rest);
        assert_eq!(v.deal_of(d), rest);
    }
}

/// Flaw J: a signature on an everyday act needs no keeper: the act's own place in the
/// collective's sequence places it.
#[test]
fn flaw_j_no_keeper_needed_for_area_acts() {
    let mut b = label();
    let x = b.col(Kind::AreaAct, 0);
    b.member(0, 2, Kind::Sig { on: On::Act(x) });
    let res = b.leave(0, 0, Kind::Resign, Some(2));
    b.line(
        Kind::Register {
            departures: vec![res],
        },
        1,
        Tips::Complete,
        None,
    );
    let w = b.finish();
    assert!(root(&w).area_of(x));
}

/// Flaw K: the collective acknowledges a deal after revoking its grant: it still binds.
#[test]
fn flaw_k_ack_after_the_seal_binds() {
    let mut b = label();
    let g = b.col(Kind::Grant, 0);
    b.member(0, 0, Kind::Sig { on: On::Act(g) });
    let d = b.other(Who::Grantee, Kind::Deal { grant: g });
    let rv = b.col(Kind::Revoke { grant: g }, 1);
    b.member(0, 0, Kind::Sig { on: On::Act(rv) });
    b.col(Kind::Ack { of: vec![d] }, 1);
    let w = b.finish();
    assert_eq!(root(&w).deal_of(d), Deal::Binds);
}

/// Flaw L: a treasurer signs a year of receipts, is declared absent; the collective draws
/// its line. Every receipt before the line stands; one after does not.
#[test]
fn flaw_l_a_year_of_receipts_survives_a_declaration() {
    let mut b = label();
    let mut year = vec![];
    for i in 0..12 {
        let x = b.col(Kind::AreaAct, (i % 2) as u8);
        b.member(0, (i % 3) as u8, Kind::Sig { on: On::Act(x) });
        year.push(x);
    }
    let dec = b.other(Who::Authority, Kind::Declare { member: 0 });
    let late = b.col(Kind::AreaAct, 1);
    b.member(0, 0, Kind::Sig { on: On::Act(late) });
    b.line(
        Kind::Register {
            departures: vec![dec],
        },
        0,
        Tips::Complete,
        None,
    );
    let after = b.col(Kind::AreaAct, 0);
    b.member(0, 0, Kind::Sig { on: On::Act(after) });
    let w = b.finish();
    let v = root(&w);
    assert!(year.iter().all(|&x| v.area_of(x)), "the year stands");
    assert!(
        v.area_of(late),
        "made before the collective's line: it counts (the line is the collective's)"
    );
    assert!(!v.area_of(after));
    let d = draft7(&w);
    assert!(
        year.iter().all(|&x| !d.area_of(x)),
        "draft 7 as written loses the whole year (flaw L)"
    );
}

/// Q23: two of three; A signs, the collective acknowledges it, A resigns; B signs later.
/// A counts as a voice: A and B complete it. Without the acknowledgement, B and C are needed.
/// Under three of three, B and C are needed either way.
#[test]
fn q23_signature_placed_before_leaving() {
    for (k, ack, c_signs, complete) in [
        (2, true, false, true),
        (2, false, false, false),
        (2, false, true, true),
        (3, true, false, false),
        (3, true, true, true),
        (3, false, true, true),
    ] {
        let mut b = label();
        let c = b.clone_def(0, k);
        let sa = b.member(1, 0, Kind::Sig { on: On::Clone(c) });
        if ack {
            b.col(Kind::Ack { of: vec![sa] }, 0);
        }
        let res = b.leave(1, 0, Kind::Resign, None);
        b.line(
            Kind::Register {
                departures: vec![res],
            },
            0,
            Tips::Complete,
            None,
        );
        let sb = b.member(0, 0, Kind::Sig { on: On::Clone(c) });
        let mut sigs = vec![sa, sb];
        if c_signs {
            sigs.push(b.member(2, 0, Kind::Sig { on: On::Clone(c) }));
        }
        let r = b.line(Kind::Record { clone: c, sigs }, 0, Tips::Complete, None);
        let w = b.finish();
        assert_eq!(
            root(&w).record_of(r),
            complete,
            "k={k} ack={ack} c={c_signs}"
        );
    }
}

/// Q28: a clone recorded before the declaration's line stays in force; an unrecorded,
/// unacknowledged signature of the absent member on another clone no longer counts.
#[test]
fn q28_declaration_never_undoes_a_recorded_clone() {
    let mut b = label();
    let c1 = b.clone_def(0, 2);
    let s0 = b.member(0, 0, Kind::Sig { on: On::Clone(c1) });
    let s1 = b.member(1, 0, Kind::Sig { on: On::Clone(c1) });
    let r1 = b.line(
        Kind::Record {
            clone: c1,
            sigs: vec![s0, s1],
        },
        0,
        Tips::Complete,
        None,
    );
    let c2 = b.clone_def(c1, 2);
    let t0 = b.member(0, 1, Kind::Sig { on: On::Clone(c2) });
    let t1 = b.member(1, 1, Kind::Sig { on: On::Clone(c2) });
    let dec = b.other(Who::Authority, Kind::Declare { member: 0 });
    b.line(
        Kind::Register {
            departures: vec![dec],
        },
        1,
        Tips::Complete,
        None,
    );
    let r2 = b.line(
        Kind::Record {
            clone: c2,
            sigs: vec![t0, t1],
        },
        0,
        Tips::Complete,
        None,
    );
    let w = b.finish();
    let v = root(&w);
    assert!(v.record_of(r1));
    assert!(!v.record_of(r2), "needs both who remain");
}

/// Attack: the collective's line leaves out a fork holding a receipt made before it. The
/// receipt counts as made after: lost, unless the collective's keeper recorded it first.
#[test]
fn attack_omitted_fork_and_the_keeper() {
    let mut b = label();
    let x = b.col(Kind::AreaAct, 1);
    b.member(0, 0, Kind::Sig { on: On::Act(x) });
    b.keeper_records(x);
    let res = b.leave(0, 0, Kind::Resign, None);
    let l = b.line(
        Kind::Register {
            departures: vec![res],
        },
        0,
        Tips::Omitting,
        Some(x),
    );
    b.keeper_records(l);
    let w = b.finish();
    assert!(!root(&w).area_of(x), "left out: counts as made after");
    assert!(
        verdict(&w, ALPHA_KC, Clock::Structure).area_of(x),
        "the keeper placed it before"
    );
}

/// Attack: after the line, the key holders fork from an act before it, to backdate a
/// receipt the departed treasurer signs. It counts as made after the line.
#[test]
fn attack_backdated_fork() {
    let mut b = label();
    let x0 = b.col(Kind::AreaAct, 0);
    let res = b.leave(0, 0, Kind::Resign, None);
    let l = b.line(
        Kind::Register {
            departures: vec![res],
        },
        0,
        Tips::Complete,
        None,
    );
    b.keeper_records(l);
    let x = b.col_from(Kind::AreaAct, 1, Some(x0));
    b.member(0, 0, Kind::Sig { on: On::Act(x) });
    b.keeper_records(x);
    let w = b.finish();
    assert!(!root(&w).area_of(x));
    assert!(!verdict(&w, ALPHA_K, Clock::Structure).area_of(x));
}

/// Attack: two registrations of one departure, drawn concurrently on two devices. An act
/// concurrent with either counts as made after the departure.
#[test]
fn attack_concurrent_lines() {
    let mut b = label();
    let res = b.leave(0, 0, Kind::Resign, None);
    let x = b.col(Kind::AreaAct, 1);
    b.member(0, 0, Kind::Sig { on: On::Act(x) });
    // Device 0 draws its line without having heard of x yet.
    b.lag[1] = 100;
    b.line(
        Kind::Register {
            departures: vec![res],
        },
        0,
        Tips::Lagging,
        None,
    );
    let w = b.finish();
    assert!(
        !root(&w).area_of(x),
        "not named by the line: counts as made after it"
    );
}

/// Option α lets the departed treasurer complete, after the line, an act the collective
/// signed before it; option β does not, at the price of flaw L for unacknowledged signatures.
#[test]
fn choice_late_completion() {
    let mut b = label();
    let x = b.col(Kind::AreaAct, 0);
    let y = b.col(Kind::AreaAct, 0);
    b.member(0, 0, Kind::Sig { on: On::Act(y) });
    let res = b.leave(0, 0, Kind::Resign, None);
    b.line(
        Kind::Register {
            departures: vec![res],
        },
        0,
        Tips::Complete,
        None,
    );
    b.member(0, 0, Kind::Sig { on: On::Act(x) });
    let w = b.finish();
    assert!(root(&w).area_of(x), "α: late completion");
    let beta = verdict(&w, BETA, Clock::Structure);
    assert!(!beta.area_of(x), "β: no late completion");
    assert!(
        !beta.area_of(y),
        "β: but an unacknowledged signature made in time is lost too"
    );
}

/// A record that acknowledges signatures implicitly (as draft 7 writes it) can be completed
/// late, and then unseat a later record: a completed clone falls back.
#[test]
fn addition_a2_records_name_their_signatures() {
    let mut b = label();
    let c1 = b.clone_def(0, 3);
    let a1 = b.member(1, 0, Kind::Sig { on: On::Clone(c1) });
    let r1 = b.line(
        Kind::Record {
            clone: c1,
            sigs: vec![a1],
        },
        0,
        Tips::Complete,
        None,
    ); // incomplete
    let c2 = b.clone_def(0, 1);
    let a2 = b.member(1, 0, Kind::Sig { on: On::Clone(c2) });
    let r2 = b.line(
        Kind::Record {
            clone: c2,
            sigs: vec![a2],
        },
        0,
        Tips::Complete,
        None,
    );
    let before = b.w.clone();
    b.member(0, 0, Kind::Sig { on: On::Clone(c1) });
    b.member(2, 0, Kind::Sig { on: On::Clone(c1) });
    let w = b.finish();
    assert!(verdict(&before, ALPHA_IMPLICIT, Clock::Structure).record_of(r2));
    let implicit = verdict(&w, ALPHA_IMPLICIT, Clock::Structure);
    assert!(
        implicit.record_of(r1) && !implicit.record_of(r2),
        "implicit: r2 falls back"
    );
    let named = root(&w);
    assert!(
        !named.record_of(r1) && named.record_of(r2),
        "named: r2 stays"
    );
}

/// Two sibling clones recorded concurrently on two devices: an act after both stands under
/// their common parent.
#[test]
fn agreement_fork_status_quo() {
    let mut b = label();
    b.lag = vec![100, 100];
    let c1 = b.clone_def(0, 1);
    let c2 = b.clone_def(0, 1);
    let s1 = b.member(1, 0, Kind::Sig { on: On::Clone(c1) });
    let s2 = b.member(2, 0, Kind::Sig { on: On::Clone(c2) });
    let r1 = b.line(
        Kind::Record {
            clone: c1,
            sigs: vec![s1],
        },
        0,
        Tips::Lagging,
        None,
    );
    let r2 = b.line(
        Kind::Record {
            clone: c2,
            sigs: vec![s2],
        },
        1,
        Tips::Lagging,
        None,
    );
    let x = b.col(Kind::AreaAct, 0);
    let w = b.finish();
    let v = root(&w);
    assert!(v.record_of(r1) && v.record_of(r2));
    let ev = mor_ordering_sim::rule::Eval::new(&w, ALPHA, Clock::Structure);
    assert_eq!(ev.in_force_at(x), 0);
}

/// Where the rule stops: the treasurer's own rotation forgets the tablet; the receipts
/// signed from it lose their signature under Identity, whatever the collective's sequence.
#[test]
fn boundary_member_rotation() {
    let mut b = label();
    let x = b.col(Kind::AreaAct, 0);
    b.member(0, 2, Kind::Sig { on: On::Act(x) });
    b.member(0, 0, Kind::Sig { on: On::Clone(0) });
    let before = b.w.clone();
    b.rotate_member(0, Some(2));
    let w = b.finish();
    assert!(root(&before).area_of(x));
    assert!(
        !root(&w).area_of(x),
        "a personal sequence still decides, through Identity"
    );
}

#[test]
fn random_sweep() {
    let mut t = Tally::default();
    for seed in 1..=600 {
        check(seed, &mut t);
    }
    assert_eq!(t.failures(), 0, "{t:#?}");
    assert!(t.honest_runs > 0 && t.omitting_runs > 0 && t.lagging_runs > 0);
}

/// Law draft 7, seventh pass, C5: the treasurer's own rotation forgets the tablet, and the
/// collective registers the rotation on its line. Receipts the collective signed before that
/// line keep the tablet's signature; an old-key signature on a receipt after it does not
/// count. (Under the rule as first tested, `boundary_member_rotation` above, they were lost.)
#[test]
fn c5_member_rotation_registered_on_the_line() {
    let mut b = label();
    let x = b.col(Kind::AreaAct, 0);
    b.member(0, 2, Kind::Sig { on: On::Act(x) }); // tablet, forgotten by the rotation
    let y = b.col(Kind::AreaAct, 0); // pending: signed only after the rotation, old key
    let rot = b.rotate_member(0, Some(2));
    b.line(
        Kind::Register {
            departures: vec![rot],
        },
        0,
        Tips::Complete,
        None,
    );
    let z = b.col(Kind::AreaAct, 0);
    // A thief holding the old key signs y (before the line) and z (after it).
    b.w.acts.push(mor_ordering_sim::model::Act {
        who: Who::Member(0),
        kind: Kind::Sig { on: On::Act(y) },
        dev: 2,
        prev: None,
        tips: vec![],
        epoch: 0,
    });
    b.w.t.push(b.now + 1);
    b.w.keeper_at.push(None);
    b.w.tips_quality.push(None);
    b.w.acts.push(mor_ordering_sim::model::Act {
        who: Who::Member(0),
        kind: Kind::Sig { on: On::Act(z) },
        dev: 2,
        prev: None,
        tips: vec![],
        epoch: 0,
    });
    b.w.t.push(b.now + 2);
    b.w.keeper_at.push(None);
    b.w.tips_quality.push(None);
    let w = b.finish();
    let v = verdict(&w, WRITTEN, Clock::Structure);
    assert!(
        v.area_of(x),
        "a receipt before the line keeps the tablet's signature"
    );
    assert!(
        v.area_of(y),
        "an old-key signature completes an act the collective signed before the line"
    );
    assert!(
        !v.area_of(z),
        "an old-key signature on an act after the line counts for nothing"
    );
    assert!(!root(&w).area_of(x), "without C5, Identity takes it back");
}

/// The rules as Law draft 7's seventh pass writes them, over a sweep of random worlds.
#[test]
fn written_rules_random_sweep() {
    let mut t = WrittenTally::default();
    for seed in 1..=600 {
        check_written(seed, &mut t);
    }
    assert_eq!(t.failures(), 0, "{t:#?}");
    assert!(t.member_rotation_runs > 0 && t.member_rotations_registered > 0);
}
