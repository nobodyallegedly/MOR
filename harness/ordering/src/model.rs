//! The world: acts by members, the collective, an abandonment authority, a grantee and a
//! friend, each in its signer's sequences, with the real time each was made.
//!
//! The real time (`World::t`) is the simulation's god's-eye clock. MOR has none: only the
//! oracle reads it, never a rule.

pub type Id = usize;
pub type M = u8;

/// The identity that signs an act.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Who {
    Member(M),
    Collective,
    Authority,
    Grantee,
    Friend,
}

/// What a member's signature act signs.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum On {
    /// An act of the collective that an area reaches (a receipt, a publication, a grant, a
    /// revocation or a reinstatement within the area).
    Act(Id),
    /// A clone of the collective's agreement, by its index in `World::clones`.
    Clone(u8),
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Kind {
    // --- Acts of the collective, in its own sequences ---
    /// An everyday act the area reaches: it counts only with the area's holders' signatures.
    AreaAct,
    /// A grant within the area (Law rule 38a): counts like an area act.
    Grant,
    /// A record (type 17) putting a clone in force. A line. `sigs`: the signature acts it
    /// names as completing the clone (addition A2 of the write-up; draft 7 leaves them
    /// implicit: every signature naming the clone by a party its mark names).
    Record {
        clone: u8,
        sigs: Vec<Id>,
    },
    /// The collective's own line for departures: resignations, steppings down and
    /// declarations of absence it names. A line. (New under the rule tested.)
    Register {
        departures: Vec<Id>,
    },
    /// The collective acknowledges acts of other identities (members' signatures, deals).
    Ack {
        of: Vec<Id>,
    },
    /// A receipt of the collective naming a grantee's deal: it paid, or was paid, on it.
    PayOn {
        deal: Id,
    },
    /// An import of deals from a grant's branch (Law rule 41).
    Import {
        deals: Vec<Id>,
    },
    /// A revocation sealing a grant (counts like an area act: the area that issued the grant alone judges it, Law draft 7, Q29).
    Revoke {
        grant: Id,
    },
    /// A reinstatement of an ended grant (counts like an area act, Q27).
    Reinstate {
        grant: Id,
    },
    /// A rotation declaring a constitutional clone that refits the area. A line.
    Refit {
        holders: Vec<M>,
        rank: u32,
    },

    // --- Acts of members, in their personal sequences ---
    Sig {
        on: On,
    },
    /// Resignation (type 16). Its personal kept tips (draft 7, Flaw E) are `Act::tips`.
    Resign,
    /// Stepping down from the area (type 16 with field 1).
    StepDown,
    /// The member's own key rotation (Identity), keeping `Act::tips` and their ancestry.
    MemberRotate,

    // --- Acts of others ---
    /// An abandonment declaration, outcome 0, by the authority.
    Declare {
        member: M,
    },
    /// A deal the grantee signs for the collective under a grant, on the grant's branch.
    Deal {
        grant: Id,
    },
    /// A friend's acknowledgement (Envelope `acks`): it carries no place in time.
    FriendAck {
        of: Id,
    },
    /// A friend's acknowledgement struck out, to test that acknowledgements change nothing.
    Noise,
}

#[derive(Clone, Debug)]
pub struct Act {
    pub who: Who,
    pub kind: Kind,
    /// The signer's sequence (one per device).
    pub dev: u8,
    /// The previous act in that sequence. Two acts naming the same `prev` are a fork.
    pub prev: Option<Id>,
    /// For a line of the collective: the latest act of every other sequence it names.
    /// For a resignation, a stepping down or a member's rotation: the member's personal tips.
    pub tips: Vec<Id>,
    /// For a member's act: the key it is bound to (0 before the member's rotation, 1 after).
    pub epoch: u8,
}

/// How a line's tips were drawn.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tips {
    /// Every act of the collective existing when the line is drawn lies in its ancestry.
    Complete,
    /// The drafter knew other devices' acts only after a delay (concurrency, offline signing).
    Lagging,
    /// The drafter left a fork out on purpose, or named a stale tip.
    Omitting,
}

#[derive(Clone, Debug)]
pub struct CloneDef {
    pub parent: u8,
    /// The clone rule's number, counted among the voices that remain (flaw C).
    pub k: usize,
}

#[derive(Clone, Debug)]
pub struct World {
    pub acts: Vec<Act>,
    /// Real time of each act. Read by the oracle only.
    pub t: Vec<u64>,
    /// When the collective's keeper recorded each act, if it did. The keeper's own sequence
    /// is these, in this order (ties by act id).
    pub keeper_at: Vec<Option<u64>>,
    /// How each line's tips were drawn (`None` for other acts).
    pub tips_quality: Vec<Option<Tips>>,
    /// Parties of the collective's agreement: members `0..members`.
    pub members: M,
    pub holders0: Vec<M>,
    pub area_k: usize,
    /// Clone 0 is the founding agreement, in force from genesis.
    pub clones: Vec<CloneDef>,
}

impl World {
    pub fn new(members: M, holders0: Vec<M>, area_k: usize) -> Self {
        World {
            acts: vec![],
            t: vec![],
            keeper_at: vec![],
            tips_quality: vec![],
            members,
            holders0,
            area_k,
            clones: vec![CloneDef {
                parent: 0,
                k: members as usize,
            }],
        }
    }

    pub fn is_col(&self, x: Id) -> bool {
        self.acts[x].who == Who::Collective
    }

    pub fn is_line(&self, x: Id) -> bool {
        matches!(
            self.acts[x].kind,
            Kind::Record { .. } | Kind::Register { .. } | Kind::Refit { .. }
        )
    }

    /// Every line was drawn with complete tips.
    pub fn honest(&self) -> bool {
        self.tips_quality
            .iter()
            .all(|q| !matches!(q, Some(Tips::Lagging) | Some(Tips::Omitting)))
    }

    pub fn has_member_rotation(&self) -> bool {
        self.acts.iter().any(|a| a.kind == Kind::MemberRotate)
    }

    /// The world as a verifier holding only the acts made by time `tau` would see it.
    pub fn prefix(&self, tau: u64) -> World {
        let n = self.t.iter().take_while(|&&t| t <= tau).count();
        World {
            acts: self.acts[..n].to_vec(),
            t: self.t[..n].to_vec(),
            keeper_at: self.keeper_at[..n]
                .iter()
                .map(|k| k.filter(|&k| k <= tau))
                .collect(),
            tips_quality: self.tips_quality[..n].to_vec(),
            members: self.members,
            holders0: self.holders0.clone(),
            area_k: self.area_k,
            clones: self.clones.clone(),
        }
    }

    /// Friends' acknowledgements struck out (same ids).
    pub fn without_friend_acks(&self) -> World {
        let mut w = self.clone();
        for a in &mut w.acts {
            if matches!(a.kind, Kind::FriendAck { .. }) {
                a.kind = Kind::Noise;
            }
        }
        w
    }

    pub fn signer(&self, x: Id) -> Option<M> {
        match self.acts[x].who {
            Who::Member(m) => Some(m),
            _ => None,
        }
    }
}

/// Builds worlds act by act, keeping each signer's sequences.
pub struct Builder {
    pub w: World,
    pub now: u64,
    /// The collective's current head on each device.
    pub ctip: Vec<Option<Id>>,
    /// Each member's current head on each personal device.
    pub ptip: Vec<Vec<Option<Id>>>,
    pub epoch: Vec<u8>,
    /// For lagging lines: how long each collective device's acts take to reach the drafter.
    pub lag: Vec<u64>,
    /// Keeper delay applied to every act sent to it (None: no keeper).
    pub keeper_delay: Option<Box<dyn FnMut(Id) -> Option<u64>>>,
}

impl Builder {
    pub fn new(w: World, col_devices: usize, member_devices: &[usize]) -> Self {
        let ptip = member_devices.iter().map(|&d| vec![None; d]).collect();
        let epoch = vec![0; member_devices.len()];
        Builder {
            w,
            now: 0,
            ctip: vec![None; col_devices],
            ptip,
            epoch,
            lag: vec![0; col_devices],
            keeper_delay: None,
        }
    }

    fn push(&mut self, act: Act, quality: Option<Tips>) -> Id {
        self.now += 1;
        let id = self.w.acts.len();
        self.w.acts.push(act);
        self.w.t.push(self.now);
        self.w.tips_quality.push(quality);
        let k = match &mut self.keeper_delay {
            Some(f) => f(id).map(|d| self.now + d),
            None => None,
        };
        self.w.keeper_at.push(k);
        id
    }

    /// An act of the collective on device `dev`, after that device's head.
    pub fn col(&mut self, kind: Kind, dev: u8) -> Id {
        let prev = self.ctip[dev as usize];
        self.col_from(kind, dev, prev)
    }

    /// An act of the collective on device `dev`, forking from `prev` (any earlier act of the
    /// collective). The device's head moves to it; the old head stays a leaf.
    pub fn col_from(&mut self, kind: Kind, dev: u8, prev: Option<Id>) -> Id {
        let id = self.push(
            Act {
                who: Who::Collective,
                kind,
                dev,
                prev,
                tips: vec![],
                epoch: 0,
            },
            None,
        );
        self.ctip[dev as usize] = Some(id);
        id
    }

    /// The collective's acts that no act of the collective names as `prev`.
    pub fn leaves(&self) -> Vec<Id> {
        let n = self.w.acts.len();
        let mut child = vec![false; n];
        for a in &self.w.acts {
            if a.who == Who::Collective {
                if let Some(p) = a.prev {
                    child[p] = true;
                }
            }
        }
        (0..n).filter(|&x| self.w.is_col(x) && !child[x]).collect()
    }

    /// Tips a drafter on `dev` would name, given what it knows by now.
    pub fn tips(&self, dev: u8, quality: Tips, omit: Option<Id>) -> Vec<Id> {
        let own = self.ctip[dev as usize];
        let mut out = vec![];
        for leaf in self.leaves() {
            if Some(leaf) == own {
                continue;
            }
            let mut x = Some(leaf);
            if quality == Tips::Lagging {
                // Walk back to the latest act of that line the drafter has heard of.
                while let Some(a) = x {
                    let d = self.w.acts[a].dev;
                    if d == dev || self.w.t[a] + self.lag[d as usize] <= self.now {
                        break;
                    }
                    x = self.w.acts[a].prev;
                }
            }
            if quality == Tips::Omitting && omit == Some(leaf) {
                // A stale tip: name the leaf's grandparent, or nothing.
                x = self.w.acts[leaf].prev.and_then(|p| self.w.acts[p].prev);
            }
            if let Some(a) = x {
                if Some(a) != own && !out.contains(&a) {
                    out.push(a);
                }
            }
        }
        out
    }

    /// A line of the collective (record, registration, refit) on device `dev`.
    pub fn line(&mut self, kind: Kind, dev: u8, quality: Tips, omit: Option<Id>) -> Id {
        let tips = self.tips(dev, quality, omit);
        let prev = self.ctip[dev as usize];
        let id = self.push(
            Act {
                who: Who::Collective,
                kind,
                dev,
                prev,
                tips,
                epoch: 0,
            },
            Some(quality),
        );
        self.ctip[dev as usize] = Some(id);
        id
    }

    /// An act of member `m` on personal device `dev`.
    pub fn member(&mut self, m: M, dev: u8, kind: Kind) -> Id {
        self.member_with_tips(m, dev, kind, vec![])
    }

    pub fn member_with_tips(&mut self, m: M, dev: u8, kind: Kind, tips: Vec<Id>) -> Id {
        let prev = self.ptip[m as usize][dev as usize];
        let rotate = kind == Kind::MemberRotate;
        let id = self.push(
            Act {
                who: Who::Member(m),
                kind,
                dev,
                prev,
                tips,
                epoch: self.epoch[m as usize],
            },
            None,
        );
        if rotate {
            // A rotation is on the identity chain, not in a sequence: later acts start afresh.
            self.epoch[m as usize] += 1;
            for d in self.ptip[m as usize].iter_mut() {
                *d = None;
            }
        } else {
            self.ptip[m as usize][dev as usize] = Some(id);
        }
        id
    }

    /// The member's personal heads on every device but `dev`, leaving out `forget`.
    pub fn personal_tips(&self, m: M, dev: u8, forget: Option<u8>) -> Vec<Id> {
        self.ptip[m as usize]
            .iter()
            .enumerate()
            .filter(|&(d, _)| d as u8 != dev && Some(d as u8) != forget)
            .filter_map(|(_, &x)| x)
            .collect()
    }

    /// A member's resignation or stepping down from device `dev`, naming its other heads
    /// except the device `forget`.
    pub fn leave(&mut self, m: M, dev: u8, kind: Kind, forget: Option<u8>) -> Id {
        let tips = self.personal_tips(m, dev, forget);
        self.member_with_tips(m, dev, kind, tips)
    }

    /// A member's own rotation, keeping every head except `forget`'s.
    pub fn rotate_member(&mut self, m: M, forget: Option<u8>) -> Id {
        let mut tips = self.personal_tips(m, u8::MAX, forget);
        tips.sort();
        self.member_with_tips(m, 0, Kind::MemberRotate, tips)
    }

    pub fn other(&mut self, who: Who, kind: Kind) -> Id {
        self.push(
            Act {
                who,
                kind,
                dev: 0,
                prev: None,
                tips: vec![],
                epoch: 0,
            },
            None,
        )
    }

    pub fn clone_def(&mut self, parent: u8, k: usize) -> u8 {
        self.w.clones.push(CloneDef { parent, k });
        (self.w.clones.len() - 1) as u8
    }

    /// The keeper records `x` now (directed stories).
    pub fn keeper_records(&mut self, x: Id) {
        self.now += 1;
        self.w.keeper_at[x] = Some(self.now);
    }

    pub fn finish(self) -> World {
        self.w
    }
}
