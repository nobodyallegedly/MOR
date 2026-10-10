//! The checks run on every world, and the tally the report prints.

use crate::gen::{self, Run};
use crate::model::{Kind, Tips, World};
use crate::rule::{Clock, Deal, Eval, Keepers, Placement, Rule, Verdict};

pub const ALPHA: Rule = Rule::Root {
    placement: Placement::ActSigned,
    keepers: Keepers::None,
    named_sigs: true,
    c5: false,
    b11: false,
};
pub const ALPHA_K: Rule = Rule::Root {
    placement: Placement::ActSigned,
    keepers: Keepers::AllActs,
    named_sigs: true,
    c5: false,
    b11: false,
};
pub const ALPHA_KC: Rule = Rule::Root {
    placement: Placement::ActSigned,
    keepers: Keepers::CollectiveActs,
    named_sigs: true,
    c5: false,
    b11: false,
};
/// α with records acknowledging signatures implicitly, as draft 7 writes them.
pub const ALPHA_IMPLICIT: Rule = Rule::Root {
    placement: Placement::ActSigned,
    keepers: Keepers::None,
    named_sigs: false,
    c5: false,
    b11: false,
};
pub const BETA: Rule = Rule::Root {
    placement: Placement::AckOnly,
    keepers: Keepers::None,
    named_sigs: true,
    c5: false,
    b11: false,
};

pub fn verdict(w: &World, rule: Rule, clock: Clock) -> Verdict {
    Eval::new(w, rule, clock).verdict()
}

/// Counts, over all runs. A `fail_*` field above zero is a wrong answer of the rule tested.
#[derive(Debug, Default, Clone)]
pub struct Tally {
    pub runs: u64,
    pub honest_runs: u64,
    pub lagging_runs: u64,
    pub omitting_runs: u64,
    pub keeper_runs: u64,
    pub multi_device_runs: u64,
    pub member_rotation_runs: u64,
    pub acts: u64,
    pub area_acts: u64,
    pub records: u64,
    pub deals: u64,
    pub sigs: u64,
    pub departures: u64,
    pub registrations: u64,

    // Situations reached.
    pub sig_forgotten_device: u64,
    pub late_sig: u64,
    pub declaration_with_prior_sigs: u64,
    pub concurrent_registrations: u64,
    pub sibling_records_both_before: u64,
    pub backdated_forks: u64,
    pub collective_forks: u64,
    pub freezes: u64,
    pub reinstated: u64,
    pub sealed: u64,
    pub friend_acks: u64,
    pub acked_sig_after_line_counted: u64,

    // Root rule, option α.
    pub fail_honest_mismatch: u64,
    pub fail_unstable: u64,
    pub fail_unsafe: u64,
    pub fail_friend_ack: u64,
    pub fail_personal_sequences: u64,
    pub fail_placed_deal: u64,
    pub fail_undetermined_after_refit: u64,
    pub fail_status_quo: u64,
    pub alpha_late_completions: u64,
    pub alpha_losses_by_omission: u64,
    pub alpha_moved_later_counted: u64,
    pub keeper_rescues: u64,
    pub keeper_misplaced: u64,
    pub keeper_collective_only_rescues: u64,
    pub keeper_collective_only_misplaced: u64,
    pub boundary_member_rotation_losses: u64,

    // Option β, and draft 7 as written, for contrast.
    pub alpha_implicit_unstable_runs: u64,
    pub beta_unstable_runs: u64,
    pub beta_late_completions: u64,
    pub d7_wrong_runs: u64,
    pub d7_false_negative_sigs: u64,
    pub d7_false_positive_sigs: u64,
    pub d7_unstable_runs: u64,
    pub d7_personal_sequence_runs: u64,
}

fn counted_area(v: &Verdict) -> Vec<usize> {
    v.area
        .iter()
        .filter(|&&(_, c)| c)
        .map(|&(x, _)| x)
        .collect()
}
fn valid_records(v: &Verdict) -> Vec<usize> {
    v.records
        .iter()
        .filter(|&&(_, c)| c)
        .map(|&(x, _)| x)
        .collect()
}

/// Something that counted on the acts made by one time and stops counting once later acts
/// exist: the harm of flaws F and L (a completed clone falling back, a paid publication
/// un-signed, a year of receipts lost).
fn unstable(run: &World, rule: Rule, ignore_rotation: bool) -> bool {
    if ignore_rotation && run.has_member_rotation() {
        return false;
    }
    let end = *run.t.last().unwrap_or(&0);
    let mut prev: Option<Verdict> = None;
    for tau in (1..=end).step_by(3).chain(std::iter::once(end)) {
        let w = run.prefix(tau);
        let v = verdict(&w, rule, Clock::Structure);
        if let Some(p) = &prev {
            if counted_area(p).iter().any(|&x| !v.area_of(x))
                || valid_records(p).iter().any(|&x| !v.record_of(x))
            {
                return true;
            }
            for &(d, s) in &p.deals {
                if s == Deal::Binds && placed(&w, d) && v.deal_of(d) != Deal::Binds {
                    return true;
                }
            }
        }
        prev = Some(v);
    }
    false
}

fn placed(w: &World, d: usize) -> bool {
    w.acts.iter().any(|a| match &a.kind {
        Kind::Ack { of } => of.contains(&d),
        Kind::PayOn { deal } => *deal == d,
        Kind::Import { deals } => deals.contains(&d),
        _ => false,
    })
}

pub fn check(seed: u64, t: &mut Tally) {
    let Run { world: w, settings } = gen::world(seed);
    t.runs += 1;
    let honest = w.honest();
    t.honest_runs += honest as u64;
    match settings.tips {
        Some(Tips::Lagging) if !honest => t.lagging_runs += 1,
        Some(Tips::Omitting) if !honest => t.omitting_runs += 1,
        _ => {}
    }
    t.keeper_runs += settings.keeper as u64;
    t.multi_device_runs += (settings.col_devices > 1) as u64;
    t.member_rotation_runs += settings.member_rotation as u64;
    t.acts += w.acts.len() as u64;

    let s = verdict(&w, ALPHA, Clock::Structure);
    let o = verdict(&w, ALPHA, Clock::RealTime);
    let ev = Eval::new(&w, ALPHA, Clock::Structure);
    t.area_acts += s.area.len() as u64;
    t.records += s.records.len() as u64;
    t.deals += s.deals.len() as u64;
    t.sigs += s.sigs.len() as u64;

    let d7 = Eval::new(&w, Rule::Draft7, Clock::Structure);
    // Situations.
    for (x, a) in w.acts.iter().enumerate() {
        match &a.kind {
            Kind::Resign | Kind::StepDown | Kind::Declare { .. } => t.departures += 1,
            Kind::Register { .. } => t.registrations += 1,
            Kind::FriendAck { .. } => t.friend_acks += 1,
            Kind::Revoke { .. } if s.area_of(x) => t.sealed += 1,
            Kind::Reinstate { .. } if s.area_of(x) => t.reinstated += 1,
            _ => {}
        }
        if w.is_col(x) {
            if let Some(p) = a.prev {
                let siblings = w
                    .acts
                    .iter()
                    .filter(|b| b.prev == Some(p) && b.who == a.who)
                    .count();
                if siblings > 1 && w.acts[p].dev == a.dev {
                    t.collective_forks += 1;
                }
                // A fork from an act that a line made before this act already passed.
                if w.acts.iter().enumerate().any(|(l, _)| {
                    w.is_line(l)
                        && l < x
                        && ev_anc(&ev, l, p)
                        && w.t[l] < w.t[x]
                        && a.prev != Some(l)
                }) {
                    t.backdated_forks += 1;
                }
            }
        }
        if let Kind::Sig { .. } = a.kind {
            if let Some(line_t) = ev.first_line_time(x) {
                if w.t[x] > line_t {
                    t.late_sig += 1;
                    if s.sig_of(x) {
                        t.alpha_late_completions += 1;
                    }
                }
            }
            // Signed from a device its signer's resignation forgot.
            let m = w.signer(x).unwrap();
            if w.acts.iter().enumerate().any(|(d, da)| {
                matches!(da.kind, Kind::Resign | Kind::StepDown)
                    && w.signer(d) == Some(m)
                    && w.t[x] < w.t[d]
                    && !d7.sig_counts_draft7_personal(x, d)
            }) {
                t.sig_forgotten_device += 1;
            }
        }
        if let Kind::Declare { member } = a.kind {
            if w.acts.iter().enumerate().any(|(y, ya)| {
                matches!(ya.kind, Kind::Sig { .. })
                    && w.signer(y) == Some(member)
                    && w.t[y] < w.t[x]
            }) {
                t.declaration_with_prior_sigs += 1;
            }
        }
    }
    let regs: Vec<usize> = (0..w.acts.len())
        .filter(|&x| matches!(w.acts[x].kind, Kind::Register { .. }))
        .collect();
    for &a in &regs {
        for &b in &regs {
            if a < b && !ev_anc(&ev, b, a) {
                t.concurrent_registrations += 1;
            }
        }
    }

    // 1. With complete tips, the structure gives exactly the real-time verdict.
    if honest && s != o {
        t.fail_honest_mismatch += 1;
        if std::env::var("SIM_DEBUG").is_ok() {
            eprintln!("seed {seed}: honest mismatch\n{:?}\n{:?}", s, o);
        }
    }

    // 2. Nothing that counted stops counting (complete tips; a member's own rotation is the
    //    boundary, tallied apart).
    if honest && unstable(&w, ALPHA, true) {
        t.fail_unstable += 1;
        if std::env::var("SIM_DEBUG").is_ok() {
            eprintln!("seed {seed}: unstable");
        }
    }
    if honest && w.has_member_rotation() && unstable(&w, ALPHA, false) {
        t.boundary_member_rotation_losses += 1;
    }

    // 3. Safety, in every run: no signature counts that real time places after its signer's
    //    line (no backdating, whatever the tips). With keepers, a mismatch is a keeper that
    //    recorded a line late: the trust in keepers Agreements already states.
    for &(x, c) in &s.sigs {
        if c && !o.sig_of(x) {
            t.fail_unsafe += 1;
        }
    }
    let k = verdict(&w, ALPHA_K, Clock::Structure);
    let kc = verdict(&w, ALPHA_KC, Clock::Structure);
    for &(x, c) in &kc.sigs {
        if c && !o.sig_of(x) {
            t.keeper_collective_only_misplaced += 1;
        }
    }
    for &(x, c) in &k.sigs {
        if c && !o.sig_of(x) {
            t.keeper_misplaced += 1;
        }
    }
    // Losses and rescues when tips are not complete.
    if !honest {
        for &(x, c) in &o.area {
            if c && !s.area_of(x) {
                t.alpha_losses_by_omission += 1;
                if k.area_of(x) {
                    t.keeper_rescues += 1;
                }
                if kc.area_of(x) {
                    t.keeper_collective_only_rescues += 1;
                }
            }
            if !c && s.area_of(x) {
                t.alpha_moved_later_counted += 1;
            }
        }
        for &(x, c) in &o.records {
            if c && !s.record_of(x) {
                t.alpha_losses_by_omission += 1;
                if k.record_of(x) {
                    t.keeper_rescues += 1;
                }
                if kc.record_of(x) {
                    t.keeper_collective_only_rescues += 1;
                }
            }
        }
    }
    for &(x, c) in &s.sigs {
        if c && w.acts[x].kind != Kind::Noise {
            if let Some(line_t) = ev.first_line_time(x) {
                let acked = w.acts.iter().enumerate().any(|(y, ya)| {
                    matches!(&ya.kind, Kind::Ack { of } if of.contains(&x)) && w.t[y] < line_t
                });
                if acked
                    && matches!(
                        w.acts[x].kind,
                        Kind::Sig {
                            on: crate::model::On::Clone(_)
                        }
                    )
                {
                    t.acked_sig_after_line_counted += 1;
                }
            }
        }
    }

    // 4. Friends' acknowledgements change nothing.
    if verdict(&w.without_friend_acks(), ALPHA, Clock::Structure) != s {
        t.fail_friend_ack += 1;
    }

    // 5. Members' personal sequences change nothing (a member's own rotation aside).
    if !w.has_member_rotation() {
        let r = gen::rethread(&w, seed ^ 0x5EED);
        if verdict(&r, ALPHA, Clock::Structure) != s {
            t.fail_personal_sequences += 1;
        }
        if verdict(&r, Rule::Draft7, Clock::Structure).sigs
            != verdict(&w, Rule::Draft7, Clock::Structure).sigs
        {
            t.d7_personal_sequence_runs += 1;
        }
    }

    // 6. Deals: placed deals bind; after a seal or a reinstatement nothing is undetermined.
    let ev = Eval::new(&w, ALPHA, Clock::Structure);
    for &(d, st) in &s.deals {
        let Kind::Deal { grant } = w.acts[d].kind else {
            continue;
        };
        if placed(&w, d) && ev.area_counts(grant) && st != Deal::Binds {
            t.fail_placed_deal += 1;
        }
        let refitted = w.acts.iter().enumerate().any(|(y, ya)| matches!(ya.kind, Kind::Reinstate { grant: g } | Kind::Revoke { grant: g } if g == grant) && s.area_of(y));
        if refitted && st == Deal::Undetermined {
            t.fail_undetermined_after_refit += 1;
        }
        if st == Deal::Undetermined {
            t.freezes += 1;
        }
    }

    // 7. Forks of the agreement chain: an act after two sibling records stands under their
    //    common parent.
    let recs: Vec<usize> = s
        .records
        .iter()
        .filter(|&&(_, c)| c)
        .map(|&(x, _)| x)
        .collect();
    for x in 0..w.acts.len() {
        if !w.is_col(x) || w.is_line(x) {
            continue;
        }
        let after: Vec<u8> = recs
            .iter()
            .filter(|&&r| !ev.before(x, r))
            .map(|&r| match w.acts[r].kind {
                Kind::Record { clone, .. } => clone,
                _ => 0,
            })
            .collect();
        for &a in &after {
            for &b in &after {
                if a != b && w.clones[a as usize].parent == w.clones[b as usize].parent {
                    t.sibling_records_both_before += 1;
                    let f = ev.in_force_at(x);
                    if f == a || f == b {
                        t.fail_status_quo += 1;
                    }
                }
            }
        }
    }

    // Contrast: option β and draft 7, judged against their own intent.
    let bs = verdict(&w, BETA, Clock::Structure);
    for &(x, c) in &bs.sigs {
        if c {
            if let Some(line_t) = ev.first_line_time(x) {
                if w.t[x] > line_t {
                    t.beta_late_completions += 1;
                }
            }
        }
    }
    if honest && unstable(&w, ALPHA_IMPLICIT, true) {
        t.alpha_implicit_unstable_runs += 1;
    }
    if honest && unstable(&w, BETA, true) {
        t.beta_unstable_runs += 1;
    }
    let ds = verdict(&w, Rule::Draft7, Clock::Structure);
    let dt = verdict(&w, Rule::Draft7, Clock::RealTime);
    let mut wrong = false;
    for &(x, c) in &ds.sigs {
        let want = dt.sig_of(x);
        if c && !want {
            t.d7_false_positive_sigs += 1;
            wrong = true;
        }
        if !c && want {
            t.d7_false_negative_sigs += 1;
            wrong = true;
        }
    }
    t.d7_wrong_runs += wrong as u64;
    if honest && unstable(&w, Rule::Draft7, true) {
        t.d7_unstable_runs += 1;
    }
}

fn ev_anc(ev: &Eval, l: usize, x: usize) -> bool {
    ev.anc_of(l, x)
}

impl Tally {
    pub fn failures(&self) -> u64 {
        self.fail_honest_mismatch
            + self.fail_unstable
            + self.fail_unsafe
            + self.fail_friend_ack
            + self.fail_personal_sequences
            + self.fail_placed_deal
            + self.fail_undetermined_after_refit
            + self.fail_status_quo
    }
}

/// Prints the first thing that stops counting in a world, with the acts (for debugging).
pub fn explain_unstable(seed: u64, rule: Rule) {
    let w = gen::world(seed).world;
    let end = *w.t.last().unwrap_or(&0);
    let mut prev: Option<(u64, Verdict)> = None;
    for tau in 1..=end {
        let v = verdict(&w.prefix(tau), rule, Clock::Structure);
        if let Some((pt, p)) = &prev {
            let lost: Vec<usize> = counted_area(p)
                .into_iter()
                .filter(|&x| !v.area_of(x))
                .chain(valid_records(p).into_iter().filter(|&x| !v.record_of(x)))
                .collect();
            if !lost.is_empty() {
                println!(
                    "between t={pt} and t={tau}, lost {lost:?}; holders0 {:?} k {}",
                    w.holders0, w.area_k
                );
                for (x, a) in w.acts.iter().enumerate() {
                    if w.t[x] <= tau {
                        println!(
                            "{x:3} t={:3} {:?} dev{} prev {:?} tips {:?} {:?} k@{:?}",
                            w.t[x], a.who, a.dev, a.prev, a.tips, a.kind, w.keeper_at[x]
                        );
                    }
                }
                return;
            }
        }
        prev = Some((tau, v));
    }
}

// ---------------------------------------------------------------------------------------
// The rules as Agreements draft 7's seventh pass writes them (F109 with C1 to C8): a signature is
// placed at the act it signs or where the collective acknowledged it (C1, C2); a record
// counts only with the signature acts it names (A2); the collective's keepers place only its
// own acts a line left out (C4); a member's own rotation is registered on the collective's
// line, and old-key signatures placed before it stay valid for the collective (C5); deals
// are settled by the collective's acknowledgement, payment or import (A6, C6, C8);
// declarations take effect at the collective's line (C7); concurrent records leave their
// parent in force (A4), until a clone of either branch recorded after both lines resolves
// the fork (Agreements draft 8, B11).
// ---------------------------------------------------------------------------------------

/// The rules as written.
pub const WRITTEN: Rule = Rule::Root {
    placement: Placement::ActSigned,
    keepers: Keepers::CollectiveActs,
    named_sigs: true,
    c5: true,
    b11: true,
};
/// The same, without the keepers, to tell the window C4 states (a keeper recording a line
/// late) from anything else.
pub const WRITTEN_NO_KEEPERS: Rule = Rule::Root {
    placement: Placement::ActSigned,
    keepers: Keepers::None,
    named_sigs: true,
    c5: true,
    b11: true,
};

/// Counts for the rules as written, over all runs. A `fail_*` field above zero is a wrong
/// answer of the written text against its own intent.
#[derive(Debug, Default, Clone)]
pub struct WrittenTally {
    pub runs: u64,
    pub honest_runs: u64,
    pub member_rotation_runs: u64,
    pub member_rotations_registered: u64,
    pub acts: u64,
    pub sigs: u64,

    /// With complete tips and no keeper, the structure gives the real-time verdict.
    pub fail_honest_mismatch: u64,
    /// Something that counted stops counting (complete tips; member rotations included,
    /// which C5 is meant to cover).
    pub fail_unstable: u64,
    /// A signature counts that real time places after its signer's line (no keeper).
    pub fail_unsafe: u64,
    pub fail_friend_ack: u64,
    /// Re-threading members' devices changes a verdict (worlds without a member rotation).
    pub fail_personal_sequences: u64,
    pub fail_placed_deal: u64,
    pub fail_undetermined_after_refit: u64,
    pub fail_status_quo: u64,

    // Stated costs, reported, not failures.
    /// Worlds with a member rotation where re-threading changes a verdict: an old-key
    /// signature placed after the line that registers the rotation (on a branch a line left
    /// out) is judged by Identity alone, as the text says.
    pub rotation_personal_sequence_runs: u64,
    /// Worlds where a member's rotation made something stop counting, without keepers.
    pub rotation_unstable_runs: u64,
    /// The keeper window (C4, stated): verdicts in honest worlds that differ from real time
    /// only because a keeper recorded a line late.
    pub keeper_window_honest_runs: u64,
    pub keeper_window_unstable_runs: u64,
    pub keeper_misplaced_sigs: u64,
    pub losses_by_omission: u64,
    pub keeper_rescues: u64,
    pub late_completions: u64,
    /// Records resolving a fork of records, a clone of one branch recorded after both
    /// lines (Agreements draft 8, B11).
    pub fork_resolutions: u64,
}

impl WrittenTally {
    pub fn failures(&self) -> u64 {
        self.fail_honest_mismatch
            + self.fail_unstable
            + self.fail_unsafe
            + self.fail_friend_ack
            + self.fail_personal_sequences
            + self.fail_placed_deal
            + self.fail_undetermined_after_refit
            + self.fail_status_quo
    }
}

pub fn check_written(seed: u64, t: &mut WrittenTally) {
    let Run { world: w, .. } = gen::world_opts(seed, true);
    check_written_on(w, seed, t);
}

/// The same checks on a world built elsewhere (the targeted sweep of forks, B11); `seed`
/// re-threads members' sequences for check 5.
pub fn check_written_world(w: World, seed: u64, t: &mut WrittenTally) {
    check_written_on(w, seed, t);
}

fn check_written_on(w: World, seed: u64, t: &mut WrittenTally) {
    t.runs += 1;
    let honest = w.honest();
    t.honest_runs += honest as u64;
    let rot = w.has_member_rotation();
    t.member_rotation_runs += rot as u64;
    t.acts += w.acts.len() as u64;
    t.member_rotations_registered += w
        .acts
        .iter()
        .filter(|a| matches!(&a.kind, Kind::Register { departures } if departures.iter().any(|&d| w.acts[d].kind == Kind::MemberRotate)))
        .count() as u64;

    let s = verdict(&w, WRITTEN, Clock::Structure);
    let n = verdict(&w, WRITTEN_NO_KEEPERS, Clock::Structure);
    let o = verdict(&w, WRITTEN_NO_KEEPERS, Clock::RealTime);
    t.sigs += s.sigs.len() as u64;
    let ev = Eval::new(&w, WRITTEN, Clock::Structure);

    // 1. Complete tips: the structure gives the real-time answer; with keepers, any
    //    difference is the stated window.
    if honest && n != o {
        t.fail_honest_mismatch += 1;
        if std::env::var("SIM_DEBUG").is_ok() {
            eprintln!("seed {seed}: written, honest mismatch");
        }
    }
    if honest && s != o {
        t.keeper_window_honest_runs += 1;
    }

    // 2. Stability, member rotations included (C5).
    if honest && unstable(&w, WRITTEN_NO_KEEPERS, false) {
        t.fail_unstable += 1;
        if rot {
            t.rotation_unstable_runs += 1;
        }
        if std::env::var("SIM_DEBUG").is_ok() {
            eprintln!("seed {seed}: written, unstable");
        }
    }
    if honest && unstable(&w, WRITTEN, false) && !unstable(&w, WRITTEN_NO_KEEPERS, false) {
        t.keeper_window_unstable_runs += 1;
        if std::env::var("SIM_DEBUG").is_ok() {
            eprintln!("seed {seed}: written, keeper window unstable");
        }
    }

    // 3. Safety in every world.
    for &(x, c) in &n.sigs {
        if c && !o.sig_of(x) {
            t.fail_unsafe += 1;
        }
    }
    for &(x, c) in &s.sigs {
        if c && !o.sig_of(x) {
            t.keeper_misplaced_sigs += 1;
        }
    }
    if !honest {
        for &(x, c) in &o.area {
            if c && !n.area_of(x) {
                t.losses_by_omission += 1;
                if s.area_of(x) {
                    t.keeper_rescues += 1;
                }
            }
        }
        for &(x, c) in &o.records {
            if c && !n.record_of(x) {
                t.losses_by_omission += 1;
                if s.record_of(x) {
                    t.keeper_rescues += 1;
                }
            }
        }
    }
    for &(x, c) in &s.sigs {
        if c {
            if let Some(line_t) = ev.first_line_time(x) {
                if w.t[x] > line_t {
                    t.late_completions += 1;
                }
            }
        }
    }

    t.fork_resolutions += s
        .records
        .iter()
        .filter(|&&(r, v)| v && ev.resolves_fork(r))
        .count() as u64;

    // 4. Friends' acknowledgements change nothing.
    if verdict(&w.without_friend_acks(), WRITTEN, Clock::Structure) != s {
        t.fail_friend_ack += 1;
    }

    // 5. Members' personal sequences change nothing; with a member rotation, only through
    //    an old-key signature placed after the registering line (reported).
    let r = gen::rethread(&w, seed ^ 0x5EED);
    if verdict(&r, WRITTEN, Clock::Structure) != s {
        if rot {
            t.rotation_personal_sequence_runs += 1;
            if std::env::var("SIM_DEBUG").is_ok() {
                eprintln!(
                    "seed {seed}: written, rotation world re-threaded differs (honest {honest})"
                );
            }
        } else {
            t.fail_personal_sequences += 1;
        }
    }

    // 6. Deals.
    for &(d, st) in &s.deals {
        let Kind::Deal { grant } = w.acts[d].kind else {
            continue;
        };
        if placed(&w, d) && ev.area_counts(grant) && st != Deal::Binds {
            t.fail_placed_deal += 1;
        }
        let refitted = w.acts.iter().enumerate().any(|(y, ya)| matches!(ya.kind, Kind::Reinstate { grant: g } | Kind::Revoke { grant: g } if g == grant) && s.area_of(y));
        if refitted && st == Deal::Undetermined {
            t.fail_undetermined_after_refit += 1;
        }
    }

    // 7. Concurrent records of sibling clones leave their parent in force (A4).
    let recs: Vec<usize> = s
        .records
        .iter()
        .filter(|&&(_, c)| c)
        .map(|&(x, _)| x)
        .collect();
    for x in 0..w.acts.len() {
        if !w.is_col(x) || w.is_line(x) {
            continue;
        }
        let after: Vec<u8> = recs
            .iter()
            .filter(|&&r| !ev.before(x, r))
            .map(|&r| match w.acts[r].kind {
                Kind::Record { clone, .. } => clone,
                _ => 0,
            })
            .collect();
        for &a in &after {
            for &b in &after {
                if a != b && w.clones[a as usize].parent == w.clones[b as usize].parent {
                    let f = ev.in_force_at(x);
                    if f == a || f == b {
                        t.fail_status_quo += 1;
                    }
                }
            }
        }
    }
}
