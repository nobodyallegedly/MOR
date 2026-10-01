//! The rules under test, and the oracle.
//!
//! One evaluator serves every rule. What differs is (1) where a member's signature is placed
//! and who draws the line it is judged against (`Rule`), and (2) what "before" means
//! (`Clock`): the structure of the acts, as any verifier sees it, or the real time, which only
//! the oracle knows.

use crate::model::{Id, Kind, On, Who, World, M};

/// Where the root rule places a member's signature on the collective's sequence.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Placement {
    /// At the act of the collective it signs (or the record putting its clone in force),
    /// and at any act of the collective acknowledging it. Option α of the write-up.
    ActSigned,
    /// Only at an act of the collective acknowledging it, or the record putting its clone in
    /// force: a signature on an everyday act needs the collective's acknowledgement before
    /// the line to survive it. Option β.
    AckOnly,
}

/// What the collective's own keepers may place against a line (addition A3).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Keepers {
    None,
    /// Only acts of the collective a line left out.
    CollectiveActs,
    /// Those, and acts of others done in its name (members' signatures, deals).
    AllActs,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Rule {
    /// The rule tested: before and after judged only on the collective's own sequence.
    /// `keepers`: the collective's own keepers may also place an act that is not a line
    /// against a line (addition A3 of the write-up). `named_sigs`: a record counts only the
    /// signature acts it names (addition A2); otherwise every signature on its clone.
    Root {
        placement: Placement,
        keepers: Keepers,
        named_sigs: bool,
    },
    /// Law draft 7 as written, simplified: a departure draws its line in the departing
    /// member's personal sequences (Flaw E), a keeper places only signatures on clones
    /// (rule 11a, Flaw J), any record naming a clone places its signatures (Flaw F), a
    /// declaration places nothing (Q28, Flaw L).
    Draft7,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Clock {
    /// What a verifier can compute: sequences, tips, the keeper's own sequence.
    Structure,
    /// The real time: the oracle.
    RealTime,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Deal {
    Binds,
    NotBacked,
    NotBinding,
    Undetermined,
}

#[derive(Clone, Debug, PartialEq, Eq, Default)]
pub struct Verdict {
    /// Area acts, grants, revocations, reinstatements: whether each counts.
    pub area: Vec<(Id, bool)>,
    /// Records: whether each is valid, so its clone in force.
    pub records: Vec<(Id, bool)>,
    pub deals: Vec<(Id, Deal)>,
    /// Members' signatures on area acts or clones: whether each counts for what it signs.
    pub sigs: Vec<(Id, bool)>,
}

impl Verdict {
    pub fn area_of(&self, x: Id) -> bool {
        self.area
            .iter()
            .find(|&&(a, _)| a == x)
            .map(|&(_, c)| c)
            .unwrap_or(false)
    }
    pub fn record_of(&self, x: Id) -> bool {
        self.records
            .iter()
            .find(|&&(a, _)| a == x)
            .map(|&(_, c)| c)
            .unwrap_or(false)
    }
    pub fn deal_of(&self, x: Id) -> Deal {
        self.deals
            .iter()
            .find(|&&(a, _)| a == x)
            .map(|&(_, c)| c)
            .unwrap_or(Deal::NotBacked)
    }
    pub fn sig_of(&self, x: Id) -> bool {
        self.sigs
            .iter()
            .find(|&&(a, _)| a == x)
            .map(|&(_, c)| c)
            .unwrap_or(false)
    }
}

pub struct Eval<'w> {
    pub w: &'w World,
    pub rule: Rule,
    pub clock: Clock,
    /// `anc[x][y]`: act `y` lies in the ancestry of `x` (its own sequence before it, and the
    /// ancestry of every tip it names). Computed for every act; the collective's acts and
    /// members' acts never name each other's.
    anc: Vec<Vec<bool>>,
    /// Position of each act in the keeper's own sequence.
    kpos: Vec<Option<usize>>,
    rec_memo: std::cell::RefCell<Vec<Option<bool>>>,
}

impl<'w> Eval<'w> {
    pub fn new(w: &'w World, rule: Rule, clock: Clock) -> Self {
        let n = w.acts.len();
        let mut anc = vec![vec![false; n]; n];
        for x in 0..n {
            let a = &w.acts[x];
            let mut direct: Vec<Id> = a.tips.clone();
            if let Some(p) = a.prev {
                direct.push(p);
            }
            for p in direct {
                anc[x][p] = true;
                let (lo, hi) = anc.split_at_mut(x);
                for (y, &v) in lo[p].iter().enumerate() {
                    if v {
                        hi[0][y] = true;
                    }
                }
            }
        }
        let mut order: Vec<Id> = (0..n).filter(|&x| w.keeper_at[x].is_some()).collect();
        order.sort_by_key(|&x| (w.keeper_at[x].unwrap(), x));
        let mut kpos = vec![None; n];
        for (i, &x) in order.iter().enumerate() {
            kpos[x] = Some(i);
        }
        Eval {
            w,
            rule,
            clock,
            anc,
            kpos,
            rec_memo: std::cell::RefCell::new(vec![None; n]),
        }
    }

    fn acts(&self) -> impl Iterator<Item = Id> + '_ {
        0..self.w.acts.len()
    }

    fn named_sigs(&self) -> bool {
        matches!(
            self.rule,
            Rule::Root {
                named_sigs: true,
                ..
            }
        )
    }

    fn keepers(&self) -> bool {
        !matches!(
            self.rule,
            Rule::Root {
                keepers: Keepers::None,
                ..
            } | Rule::Draft7
        )
    }

    /// The keeper recorded `x` before it recorded `l`.
    fn kb(&self, x: Id, l: Id) -> bool {
        matches!((self.kpos[x], self.kpos[l]), (Some(a), Some(b)) if a < b)
    }

    /// Acts of the collective that place `o` on its sequence: those naming it, and, for a
    /// signature, the act it signs or the records putting its clone in force.
    pub fn placings(&self, o: Id) -> Vec<Id> {
        let w = self.w;
        let mut out = vec![];
        for y in self.acts() {
            if !w.is_col(y) {
                continue;
            }
            let names = match &w.acts[y].kind {
                Kind::Ack { of } => of.contains(&o),
                Kind::PayOn { deal } => *deal == o,
                Kind::Import { deals } => deals.contains(&o),
                Kind::Register { departures } => departures.contains(&o),
                Kind::Record { clone, sigs } => {
                    if self.named_sigs() {
                        sigs.contains(&o)
                    } else {
                        matches!(w.acts[o].kind, Kind::Sig { on: On::Clone(c) } if c == *clone)
                    }
                }
                _ => false,
            };
            if names {
                out.push(y);
            }
        }
        if let (
            Kind::Sig { on: On::Act(x) },
            Rule::Root {
                placement: Placement::ActSigned,
                ..
            },
        ) = (&w.acts[o].kind, self.rule)
        {
            out.push(*x);
        }
        out
    }

    /// Whether `x` (an act of the collective, or an act of anyone else as placed on the
    /// collective's sequence) counts as made before the line `l`.
    pub fn before(&self, x: Id, l: Id) -> bool {
        let w = self.w;
        if w.is_col(x) {
            return self.col_before(x, l);
        }
        self.placings(x).into_iter().any(|p| self.col_before(p, l))
            || (matches!(
                self.rule,
                Rule::Root {
                    keepers: Keepers::AllActs,
                    ..
                }
            ) && self.clock == Clock::Structure
                && self.kb(x, l))
    }

    fn col_before(&self, x: Id, l: Id) -> bool {
        match self.clock {
            Clock::RealTime => self.w.t[x] < self.w.t[l],
            Clock::Structure => {
                self.anc[l][x]
                    // A keeper places an ordinary act the line left out; never one line
                    // against another, which only the collective's own tips order.
                    || (self.keepers() && !self.w.is_line(x) && !self.anc[x][l] && self.kb(x, l))
            }
        }
    }

    /// Departure acts of member `m`: resignations and declarations always; steppings down
    /// for the area only.
    fn departures(&self, m: M, area: bool) -> Vec<Id> {
        self.acts()
            .filter(|&d| match &self.w.acts[d].kind {
                Kind::Resign => self.w.signer(d) == Some(m),
                Kind::StepDown => area && self.w.signer(d) == Some(m),
                Kind::Declare { member } => *member == m,
                _ => false,
            })
            .collect()
    }

    /// The collective's lines registering any departure of `m`.
    fn reg_lines(&self, m: M, area: bool) -> Vec<Id> {
        let deps = self.departures(m, area);
        self.acts()
            .filter(|&l| matches!(&self.w.acts[l].kind, Kind::Register { departures } if departures.iter().any(|d| deps.contains(d))))
            .collect()
    }

    /// Under the root rule: `m`'s voice remains at the collective's act `x` when `x` is
    /// before every line registering its departure. Under draft 7: the voice remains while
    /// no departure exists at all (rule 44d counts voices that remain now).
    fn voice_at(&self, m: M, x: Id, area: bool) -> bool {
        match self.rule {
            Rule::Root { .. } => self
                .reg_lines(m, area)
                .into_iter()
                .all(|l| self.before(x, l)),
            Rule::Draft7 => self.departures(m, area).is_empty(),
        }
    }

    /// The signature act is valid under Identity: a member's own rotation voids a signature
    /// made with the old key outside its kept ancestry (Identity rules 15 to 17; an
    /// acknowledged one is disputed and confers nothing, Law rule 5).
    fn sig_valid(&self, s: Id) -> bool {
        let m = self.w.signer(s).unwrap();
        let e = self.w.acts[s].epoch;
        for r in self.acts() {
            if self.w.acts[r].kind == Kind::MemberRotate
                && self.w.signer(r) == Some(m)
                && self.w.acts[r].epoch == e
            {
                return self.anc[r][s];
            }
        }
        true
    }

    /// Whether a member's signature counts for what it signs, judged against its signer's
    /// departures.
    pub fn sig_counts(&self, s: Id) -> bool {
        if !self.sig_valid(s) {
            return false;
        }
        let m = self.w.signer(s).unwrap();
        let (area, clone) = match self.w.acts[s].kind {
            Kind::Sig { on: On::Act(_) } => (true, None),
            Kind::Sig { on: On::Clone(c) } => (false, Some(c)),
            _ => unreachable!(),
        };
        match self.rule {
            Rule::Root { .. } => self
                .reg_lines(m, area)
                .into_iter()
                .all(|l| self.before(s, l)),
            Rule::Draft7 => self.departures(m, area).into_iter().all(|d| {
                if self.clock == Clock::RealTime {
                    // Draft 7's intent: a signature made before leaving counts.
                    return self.w.t[s] < self.w.t[d];
                }
                let personal =
                    matches!(self.w.acts[d].kind, Kind::Resign | Kind::StepDown) && self.anc[d][s];
                let recorded = clone.is_some_and(|c| {
                    self.acts().any(
                        |r| matches!(self.w.acts[r].kind, Kind::Record { clone, .. } if clone == c),
                    )
                });
                let kept = clone.is_some() && self.kb(s, d);
                personal || recorded || kept
            }),
        }
    }

    /// The area's holders for an act: those of the latest refit it counts as made after.
    fn holders_at(&self, x: Id) -> Vec<M> {
        let mut best: Option<(u32, &Vec<M>)> = None;
        for r in self.acts() {
            if let Kind::Refit { holders, rank } = &self.w.acts[r].kind {
                if r != x && !self.before(x, r) && best.is_none_or(|(b, _)| *rank > b) {
                    best = Some((*rank, holders));
                }
            }
        }
        best.map(|(_, h)| h.clone())
            .unwrap_or_else(|| self.w.holders0.clone())
    }

    fn sigs_on(&self, on: On) -> Vec<Id> {
        self.acts()
            .filter(|&s| self.w.acts[s].kind == Kind::Sig { on })
            .collect()
    }

    /// Count a power (rule 44d): voices that remain, plus departed signers whose signature
    /// still counts (Q23); when fewer voices remain than the number, all of them meet it
    /// (flaw C); with no voice, nothing meets it.
    fn power_met(
        &self,
        number: usize,
        candidates: &[M],
        x: Id,
        area: bool,
        on: On,
        only: Option<&[Id]>,
    ) -> bool {
        let mut signers: Vec<M> = vec![];
        for s in self.sigs_on(on) {
            if only.is_some_and(|o| !o.contains(&s)) {
                continue;
            }
            let m = self.w.signer(s).unwrap();
            if candidates.contains(&m) && !signers.contains(&m) && self.sig_counts(s) {
                signers.push(m);
            }
        }
        let mut voices: Vec<M> = candidates
            .iter()
            .copied()
            .filter(|&m| self.voice_at(m, x, area))
            .collect();
        for &m in &signers {
            if !voices.contains(&m) {
                voices.push(m);
            }
        }
        if voices.is_empty() {
            return false;
        }
        let required = number.min(voices.len());
        signers.len() >= required
    }

    pub fn area_counts(&self, x: Id) -> bool {
        let hs = self.holders_at(x);
        self.power_met(self.w.area_k, &hs, x, true, On::Act(x), None)
    }

    /// A record is valid when its clone is complete, judged at the record, and the clone's
    /// parent is the agreement in force for the record (rule 37c).
    pub fn record_valid(&self, r: Id) -> bool {
        if let Some(v) = self.rec_memo.borrow()[r] {
            return v;
        }
        let Kind::Record { clone, sigs } = &self.w.acts[r].kind else {
            unreachable!()
        };
        let clone = *clone;
        let def = &self.w.clones[clone as usize];
        let parties: Vec<M> = (0..self.w.members).collect();
        let only = if self.named_sigs() {
            Some(sigs.as_slice())
        } else {
            None
        };
        let complete = self.power_met(def.k, &parties, r, false, On::Clone(clone), only);
        let earlier: Vec<Id> = self
            .acts()
            .filter(|&q| {
                q != r
                    && matches!(self.w.acts[q].kind, Kind::Record { .. })
                    && self.col_before(q, r)
            })
            .collect();
        let v = complete && self.resolve(&earlier) == def.parent;
        self.rec_memo.borrow_mut()[r] = Some(v);
        v
    }

    /// The agreement in force from a set of records: the furthest clone when they form one
    /// chain; otherwise the latest clone they all descend from (status quo, rule 47).
    fn resolve(&self, recs: &[Id]) -> u8 {
        let cs: Vec<u8> = recs
            .iter()
            .filter(|&&q| self.record_valid(q))
            .map(|&q| match self.w.acts[q].kind {
                Kind::Record { clone, .. } => clone,
                _ => unreachable!(),
            })
            .collect();
        if cs.is_empty() {
            return 0;
        }
        let line = |c: u8| {
            let mut v = vec![c];
            let mut c = c;
            while c != 0 {
                c = self.w.clones[c as usize].parent;
                v.push(c);
            }
            v
        };
        if let Some(&d) = cs
            .iter()
            .find(|&&d| cs.iter().all(|&c| line(d).contains(&c)))
        {
            return d;
        }
        let mut common = line(cs[0]);
        for &c in &cs[1..] {
            let l = line(c);
            common.retain(|x| l.contains(x));
        }
        common[0]
    }

    /// The agreement in force for an act of the collective that is not a record.
    pub fn in_force_at(&self, x: Id) -> u8 {
        let after: Vec<Id> = self
            .acts()
            .filter(|&r| {
                matches!(self.w.acts[r].kind, Kind::Record { .. }) && r != x && !self.before(x, r)
            })
            .collect();
        self.resolve(&after)
    }

    /// The fate of a grantee's deal. Placed (acknowledged, paid on or imported by the
    /// collective, wherever that sits): binds (rule 40, generalised). Otherwise: binds while
    /// the grant is live; after a freeze, undetermined until the refit, which reinstates the
    /// grant (taking the deal on) or seals it (dropping it).
    pub fn deal(&self, d: Id) -> Deal {
        let Kind::Deal { grant } = self.w.acts[d].kind else {
            unreachable!()
        };
        if !self.area_counts(grant) {
            return Deal::NotBacked;
        }
        let placed = self.acts().any(|y| {
            self.w.is_col(y)
                && match &self.w.acts[y].kind {
                    Kind::Ack { of } => of.contains(&d),
                    Kind::PayOn { deal } => *deal == d,
                    Kind::Import { deals } => deals.contains(&d),
                    _ => false,
                }
        });
        if placed {
            return Deal::Binds;
        }
        let sealed = self
            .acts()
            .any(|y| self.w.acts[y].kind == Kind::Revoke { grant } && self.area_counts(y));
        if sealed {
            return Deal::NotBinding;
        }
        let ended = self.acts().any(|l| {
            matches!(self.w.acts[l].kind, Kind::Register { .. })
                && self.col_before(grant, l)
                && self.frozen_after(l)
        });
        if !ended {
            return Deal::Binds;
        }
        let reinstated = self
            .acts()
            .any(|y| self.w.acts[y].kind == Kind::Reinstate { grant } && self.area_counts(y));
        if reinstated {
            Deal::Binds
        } else {
            Deal::Undetermined
        }
    }

    /// After line `l`, no holder of the area keeps its voice.
    fn frozen_after(&self, l: Id) -> bool {
        let hs = self.holders_at(l);
        hs.iter().all(|&h| {
            self.reg_lines(h, true)
                .into_iter()
                .any(|q| q == l || self.col_before(q, l))
        })
    }

    pub fn verdict(&self) -> Verdict {
        let mut v = Verdict::default();
        for x in self.acts() {
            match &self.w.acts[x].kind {
                Kind::AreaAct | Kind::Grant | Kind::Revoke { .. } | Kind::Reinstate { .. } => {
                    v.area.push((x, self.area_counts(x)))
                }
                Kind::Record { .. } => v.records.push((x, self.record_valid(x))),
                Kind::Deal { .. } => v.deals.push((x, self.deal(x))),
                Kind::Sig { .. } if self.w.acts[x].who != Who::Collective => {
                    v.sigs.push((x, self.sig_counts(x)))
                }
                _ => {}
            }
        }
        v
    }

    /// `x` lies in the ancestry of `l`.
    pub fn anc_of(&self, l: Id, x: Id) -> bool {
        self.anc[l][x]
    }

    /// Draft 7: the signature lies in the personal ancestry its signer's resignation names.
    pub fn sig_counts_draft7_personal(&self, s: Id, d: Id) -> bool {
        self.anc[d][s]
    }

    /// Departure lines of the signer of `s`, for the late-completion count.
    pub fn first_line_time(&self, s: Id) -> Option<u64> {
        let m = self.w.signer(s)?;
        let area = matches!(self.w.acts[s].kind, Kind::Sig { on: On::Act(_) });
        self.reg_lines(m, area)
            .into_iter()
            .map(|l| self.w.t[l])
            .min()
    }
}
