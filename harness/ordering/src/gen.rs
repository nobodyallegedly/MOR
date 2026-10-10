//! Random worlds: many orderings of the stories of flaws E to L, Q23, Q28 and Q30, with the
//! attacks of the write-up mixed in (forks of the collective's own sequence, offline and
//! lagging devices, omitted tips, backdated forks, late signatures, friends' acknowledgements,
//! keepers with delays, a member's own rotation).

use crate::model::{Builder, Id, Kind, On, Tips, Who, World, M};

/// A small deterministic generator (xorshift64*), so runs replay from their seed.
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        Rng(seed.wrapping_mul(0x9E37_79B9_7F4A_7C15) | 1)
    }
    pub fn next_u64(&mut self) -> u64 {
        self.0 ^= self.0 >> 12;
        self.0 ^= self.0 << 25;
        self.0 ^= self.0 >> 27;
        self.0.wrapping_mul(0x2545_F491_4F6C_DD1D)
    }
    pub fn below(&mut self, n: u64) -> u64 {
        self.next_u64() % n.max(1)
    }
    pub fn chance(&mut self, p: f64) -> bool {
        (self.next_u64() >> 11) as f64 / (1u64 << 53) as f64 <= p
    }
    pub fn pick<T: Copy>(&mut self, v: &[T]) -> Option<T> {
        if v.is_empty() {
            None
        } else {
            Some(v[self.below(v.len() as u64) as usize])
        }
    }
}

/// What a run's settings were, for the coverage report.
#[derive(Clone, Debug, Default)]
pub struct Settings {
    pub col_devices: usize,
    pub tips: Option<Tips>,
    pub keeper: bool,
    pub member_rotation: bool,
}

pub struct Run {
    pub world: World,
    pub settings: Settings,
}

/// The new holder a refit brings in.
pub const NEWCOMER: M = 3;

pub fn world(seed: u64) -> Run {
    world_opts(seed, false)
}

/// As `world`, and, with `register_rotations`, a member's own rotation is registered on the
/// collective's next registration line like a departure (Agreements draft 7, seventh pass, C5).
/// Without it the worlds are exactly those of the ordering test's write-up.
pub fn world_opts(seed: u64, register_rotations: bool) -> Run {
    let mut r = Rng::new(seed);
    let members: M = 3;
    let mut holders0: Vec<M> = (0..members).filter(|_| r.chance(0.5)).collect();
    if holders0.is_empty() {
        holders0.push(r.below(members as u64) as M);
    }
    let area_k = 1 + r.below(holders0.len() as u64) as usize;
    let w = World::new(members, holders0.clone(), area_k);

    let col_devices = 1 + r.below(3) as usize;
    let member_devices: Vec<usize> = (0..=members).map(|_| 1 + r.below(3) as usize).collect();
    let mut b = Builder::new(w, col_devices, &member_devices);
    for d in 0..col_devices {
        // Some devices are slow or offline for a while.
        b.lag[d] = if r.chance(0.3) {
            2 + r.below(6)
        } else {
            r.below(2)
        };
    }
    let tips = match r.below(10) {
        0..=4 => Tips::Complete,
        5..=7 => Tips::Lagging,
        _ => Tips::Omitting,
    };
    let keeper = r.chance(0.7);
    if keeper {
        let mut kr = Rng::new(seed ^ 0xA5A5);
        let max = kr.below(4);
        b.keeper_delay = Some(Box::new(move |_| {
            if kr.chance(0.1) {
                None
            } else {
                Some(kr.below(max + 1))
            }
        }));
    }
    let member_rotation = r.chance(0.15);

    let mut pending: Vec<Id> = vec![]; // area acts, grants, revocations, reinstatements
    let mut sigs: Vec<Id> = vec![];
    let mut clones: Vec<u8> = vec![];
    let mut departures: Vec<Id> = vec![];
    let mut unregistered: Vec<Id> = vec![];
    let mut left: Vec<M> = vec![]; // members who resigned or were declared absent
    let mut stepped: Vec<M> = vec![];
    let mut grants: Vec<Id> = vec![];
    let mut deals: Vec<Id> = vec![];
    let mut refit_rank = 0u32;
    let mut rotated = false;
    let mut all_col: Vec<Id> = vec![];

    let steps = 40 + r.below(50);
    for _ in 0..steps {
        let dev = r.below(col_devices as u64) as u8;
        let line_tips = |r: &mut Rng, b: &Builder| -> (Tips, Option<Id>) {
            let omit = if tips == Tips::Omitting {
                r.pick(&b.leaves())
            } else {
                None
            };
            (tips, omit)
        };
        match r.below(100) {
            // An everyday act of the collective, now and then on a fork.
            0..=17 => {
                let x = if r.chance(0.15) && !all_col.is_empty() {
                    let from = r.pick(&all_col);
                    b.col_from(Kind::AreaAct, dev, from)
                } else {
                    b.col(Kind::AreaAct, dev)
                };
                pending.push(x);
                all_col.push(x);
            }
            // A holder (or anyone) signs a pending act; departed members too, now and then.
            18..=37 => {
                if let Some(x) = r.pick(&pending) {
                    let m = r.below(members as u64 + 1) as M;
                    if (left.contains(&m) || stepped.contains(&m)) && !r.chance(0.3) {
                        continue;
                    }
                    let d = r.below(member_devices[m as usize] as u64) as u8;
                    sigs.push(b.member(m, d, Kind::Sig { on: On::Act(x) }));
                }
            }
            // A clone is proposed: sometimes a sibling of the last, a fork of the agreement.
            38..=40 => {
                let parent = if r.chance(0.3) {
                    clones
                        .last()
                        .map(|&c| b.w.clones[c as usize].parent)
                        .unwrap_or(0)
                } else {
                    clones.last().copied().unwrap_or(0)
                };
                let k = 1 + r.below(members as u64) as usize;
                clones.push(b.clone_def(parent, k));
            }
            41..=47 => {
                if let Some(c) = r.pick(&clones) {
                    let m = r.below(members as u64) as M;
                    if left.contains(&m) && !r.chance(0.3) {
                        continue;
                    }
                    let d = r.below(member_devices[m as usize] as u64) as u8;
                    sigs.push(b.member(m, d, Kind::Sig { on: On::Clone(c) }));
                }
            }
            48..=51 => {
                if let Some(c) = r.pick(&clones) {
                    let (q, omit) = line_tips(&mut r, &b);
                    let sigs: Vec<Id> = sigs
                        .iter()
                        .copied()
                        .filter(|&x| b.w.acts[x].kind == Kind::Sig { on: On::Clone(c) })
                        .collect();
                    let x = b.line(Kind::Record { clone: c, sigs }, dev, q, omit);
                    all_col.push(x);
                }
            }
            // The collective acknowledges signatures and deals as they arrive.
            52..=57 => {
                let mut of = vec![];
                for _ in 0..1 + r.below(3) {
                    let pool: Vec<Id> = sigs.iter().chain(deals.iter()).copied().collect();
                    if let Some(x) = r.pick(&pool) {
                        of.push(x);
                    }
                }
                if !of.is_empty() {
                    all_col.push(b.col(Kind::Ack { of }, dev));
                }
            }
            // Departures: resignation, stepping down (personal tips, a device forgotten
            // now and then), declaration of absence.
            58..=61 => {
                let m = r.below(members as u64) as M;
                if left.contains(&m) {
                    continue;
                }
                let nd = member_devices[m as usize];
                let d = r.below(nd as u64) as u8;
                let forget = if r.chance(0.35) {
                    Some(r.below(nd as u64) as u8)
                } else {
                    None
                };
                let x = match r.below(3) {
                    0 => {
                        left.push(m);
                        b.leave(m, d, Kind::Resign, forget)
                    }
                    1 => {
                        if stepped.contains(&m) {
                            continue;
                        }
                        stepped.push(m);
                        b.leave(m, d, Kind::StepDown, forget)
                    }
                    _ => {
                        left.push(m);
                        b.other(Who::Authority, Kind::Declare { member: m })
                    }
                };
                departures.push(x);
                unregistered.push(x);
            }
            // The collective registers departures on its own sequence; now and then a
            // second registration in another fork, concurrently.
            62..=65 => {
                let deps = if !unregistered.is_empty() && r.chance(0.85) {
                    std::mem::take(&mut unregistered)
                } else if let Some(x) = r.pick(&departures) {
                    vec![x]
                } else {
                    continue;
                };
                let (q, omit) = line_tips(&mut r, &b);
                all_col.push(b.line(Kind::Register { departures: deps }, dev, q, omit));
            }
            66..=68 => {
                if grants.len() < 2 {
                    let g = b.col(Kind::Grant, dev);
                    grants.push(g);
                    pending.push(g);
                    all_col.push(g);
                }
            }
            69..=75 => {
                if let Some(g) = r.pick(&grants) {
                    deals.push(b.other(Who::Grantee, Kind::Deal { grant: g }));
                }
            }
            76..=78 => {
                if let Some(d) = r.pick(&deals) {
                    let x = if r.chance(0.5) {
                        b.col(Kind::PayOn { deal: d }, dev)
                    } else {
                        b.col(Kind::Import { deals: vec![d] }, dev)
                    };
                    all_col.push(x);
                }
            }
            // A refit (a rotation declaring a constitutional clone) brings the newcomer in.
            79..=80 => {
                if !departures.is_empty() && refit_rank < 2 {
                    refit_rank += 1;
                    let mut holders = vec![NEWCOMER];
                    if r.chance(0.3) {
                        holders.push(r.below(members as u64) as M);
                    }
                    let (q, omit) = line_tips(&mut r, &b);
                    all_col.push(b.line(
                        Kind::Refit {
                            holders,
                            rank: refit_rank,
                        },
                        dev,
                        q,
                        omit,
                    ));
                }
            }
            81..=83 => {
                if let Some(g) = r.pick(&grants) {
                    let kind = if r.chance(0.5) {
                        Kind::Reinstate { grant: g }
                    } else {
                        Kind::Revoke { grant: g }
                    };
                    let x = b.col(kind, dev);
                    pending.push(x);
                    all_col.push(x);
                }
            }
            84..=88 => {
                let n = b.w.acts.len() as u64;
                if n > 0 {
                    let of = r.below(n) as Id;
                    b.other(Who::Friend, Kind::FriendAck { of });
                }
            }
            // A backdated fork: a new act of the collective whose `prev` is an old act.
            89..=91 => {
                if let Some(from) = r.pick(&all_col) {
                    let x = b.col_from(Kind::AreaAct, dev, Some(from));
                    pending.push(x);
                    all_col.push(x);
                }
            }
            92..=93 => {
                if member_rotation && !rotated {
                    let m = r.below(members as u64) as M;
                    let nd = member_devices[m as usize];
                    let forget = if r.chance(0.6) {
                        Some(r.below(nd as u64) as u8)
                    } else {
                        None
                    };
                    let x = b.rotate_member(m, forget);
                    if register_rotations {
                        unregistered.push(x);
                    }
                    rotated = true;
                }
            }
            _ => {
                // Quiet step.
                b.now += 1;
            }
        }
    }
    let settings = Settings {
        col_devices,
        tips: Some(tips),
        keeper,
        member_rotation: rotated,
    };
    Run {
        world: b.finish(),
        settings,
    }
}

/// The same world with every member's personal acts re-threaded at random over their
/// devices, and resignations naming random personal tips. The root rule must not notice.
pub fn rethread(w: &World, seed: u64) -> World {
    let mut r = Rng::new(seed);
    let mut w = w.clone();
    let mut heads: Vec<Vec<Option<Id>>> = (0..=w.members).map(|_| vec![None; 3]).collect();
    for x in 0..w.acts.len() {
        if let Who::Member(m) = w.acts[x].who {
            if w.acts[x].kind == Kind::MemberRotate {
                continue;
            }
            let d = r.below(3) as usize;
            w.acts[x].dev = d as u8;
            w.acts[x].prev = heads[m as usize][d];
            if matches!(w.acts[x].kind, Kind::Resign | Kind::StepDown) {
                w.acts[x].tips = heads[m as usize]
                    .iter()
                    .enumerate()
                    .filter(|&(e, h)| e != d && h.is_some() && r.chance(0.5))
                    .map(|(_, h)| h.unwrap())
                    .collect();
            }
            heads[m as usize][d] = Some(x);
        }
    }
    w
}
