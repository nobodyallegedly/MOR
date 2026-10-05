//! The identity-chain checks (Identity, "Verification procedures" and
//! "Validity rules"): which act counts at each position of an identity
//! chain, and what standing an everyday act has.
//!
//! A [`Verifier`] holds the acts a verifier holds, plus the three things a
//! verifier knows that are not acts: inclusion proofs a home served, the
//! homes the verifier itself tried and failed to reach, and the acts a
//! keeper recorded before recording a rotation (Law). Every answer is a pure
//! function of what it holds: two verifiers holding the same acts and facts
//! give the same answers.
//!
//! In plain words, for each position of an identity chain:
//!
//! 1. Take the rotations that name the act counting at the position before,
//!    and reveal the safety key it committed.
//! 2. A rotation counts if the homes the rule names hold it, shown by their
//!    receipts. A home whose receipts name two different genuine rotations
//!    counts for nothing there. Such a rotation always beats a homeless one.
//! 3. Otherwise, a homeless rotation that no longer depends on the
//!    verifier's own failed attempt (an escape, a closure, auditors' absence
//!    statements), and whose next rotation already counts, is final: no
//!    objection voids it (F92).
//! 4. Otherwise a homeless rotation may count, provisionally, if its new
//!    homes hold it and either the owner endorsed it with the signing key
//!    (escape), or no old home objected and enough old homes are gone.
//! 5. If nothing counts, the chain ends at the position before.

use crate::act::{Act, ActError, Inside};
use crate::hash::Hash;
use crate::identity::{
    self, check_everyday_shape, check_genesis, check_chain_signature_shape, check_rotation_shape, check_witness_shape, names, types, ChainState,
    Effective, Endorsement, IdError, Operator, Payload, Rotation,
};
use crate::lock::ContentKey;
use crate::merkle;
use crate::mmr;
use crate::sig::{self, Verdict};
use std::cell::RefCell;
use std::collections::{BTreeMap, BTreeSet};
use std::rc::Rc;

// ---------------------------------------------------------------- held acts

/// An act the verifier holds, opened.
#[derive(Clone, Debug)]
pub struct Held {
    pub id: Hash,
    pub act: Act,
    pub inside: Inside,
    /// The signature over the act id, checked once when the act is added.
    pub verdict: Verdict,
    /// For an act of the Identity MIP: its payload, if it decoded and passed
    /// the checks that need no other act; the reason otherwise.
    pub identity: Option<Result<Payload, IdError>>,
}

impl Held {
    fn signer(&self) -> Option<&Hash> {
        self.act.outside.signer.as_ref()
    }

    fn payload(&self) -> Option<&Payload> {
        match &self.identity {
            Some(Ok(p)) if self.verdict == Verdict::Valid => Some(p),
            _ => None,
        }
    }
}

// ---------------------------------------------------------------- answers

/// How an identity-chain act came to count.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum How {
    Genesis,
    /// Receipts from the homes the rule names; for a self-hosted home, the
    /// rotation it serves (rule 22a).
    Homes,
    /// Resolving operators led back to this identity, so its chain is
    /// accepted on its own signatures ("Resolving an operator").
    OwnSignatures,
    /// A homeless rotation.
    Homeless {
        basis: Basis,
        final_: bool,
    },
}

/// What a homeless rotation counts through.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Basis {
    /// An escape endorsement: both keys.
    Escape,
    /// Old homes gone by their operators' closure or by auditors' absence
    /// statements.
    Gone,
    /// Only the verifier's own failed attempt to reach an old home. Shown as
    /// "re-homed without audit"; never made final by the next rotation.
    OwnAttempt,
}

/// One counting act of an identity chain.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Link {
    pub act: Hash,
    pub how: How,
}

/// Why the chain ends where it does.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Stop {
    /// The genesis is not held.
    NoGenesis,
    /// The genesis is signed under a scheme this client does not implement.
    Unknown,
    /// The genesis is invalid.
    Invalid,
    /// No rotation at the next position is held.
    End,
    /// Rotations at the next position are held; none counts yet.
    Pending(Vec<Hash>),
    /// Rotations at the next position are held, and a conflict keeps any
    /// from counting: the identity is contested there, not frozen.
    Contested(Vec<Hash>),
}

/// An identity chain as this verifier resolves it.
#[derive(Clone, Debug)]
pub struct Resolution {
    pub identity: Hash,
    /// The act that counts at each position, genesis first.
    pub links: Vec<Link>,
    /// The state each counting act leaves (same length as `links`).
    pub states: Vec<ChainState>,
    pub stop: Stop,
    /// Positions at which a conflict between receipts, or a voided receipt
    /// another identity acknowledged, is shown (conflicts 1; receipt check 6).
    pub contested: Vec<u64>,
    /// Home operators proven dishonest for this identity, and where.
    pub dishonest: Vec<(Operator, u64)>,
}

impl Resolution {
    /// The latest counting act and the state it leaves, if any.
    pub fn latest(&self) -> Option<(&Link, &ChainState)> {
        self.links.last().zip(self.states.last())
    }

    /// The position of an identity-chain act, if it counts.
    pub fn position_of(&self, act: &Hash) -> Option<usize> {
        self.links.iter().position(|l| &l.act == act)
    }

    fn waiting(&self) -> &[Hash] {
        match &self.stop {
            Stop::Pending(c) | Stop::Contested(c) => c,
            _ => &[],
        }
    }
}

/// The standing of an act.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Status {
    /// Valid.
    Valid,
    /// Valid, and shown as disputed: voided by a rotation, but another
    /// identity acknowledged it or a keeper recorded it (rule 16).
    Disputed,
    /// Voided by the signer's rotation (rules 16, 17).
    Void,
    /// Bound to a rotation that does not count yet (rule 7).
    Pending,
    /// Invalid.
    Invalid,
    /// Signed under a scheme, or of a type, this client does not implement.
    Unknown,
    /// Signed with a scoped key (F128): its binding names an act of a higher
    /// MIP that installs a key of this identity, such as a Law grant's grant
    /// key. Identity checks only that the signature is valid; that MIP
    /// judges whether the key is the identity's and the act within its
    /// scope. A client that does not implement it shows the act as unknown.
    Scoped,
}

// ---------------------------------------------------------------- the verifier

/// The position of the first counting rotation of an operator that declares
/// closure, if any.
fn closure_at(v: &Verifier, res: &Resolution) -> Option<usize> {
    res.links
        .iter()
        .position(|l| matches!(v.acts[&l.act].payload(), Some(Payload::Rotation(r)) if r.closure))
}

/// Everything a verifier holds, and the answers it gives.
#[derive(Debug)]
pub struct Verifier {
    /// The spec hash of the Identity MIP (`IDENTITY`), fixed at the freeze.
    identity_spec: Hash,
    /// The spec hashes of the Finance and Law MIPs, whose act types may
    /// carry acknowledgements beside Identity's (Envelope rule 4a, F110).
    /// Unset: this verifier cannot tell, and an act of another specification
    /// carrying `acks` is unknown to it, never valid.
    ack_specs: Option<(Hash, Hash)>,
    acts: BTreeMap<Hash, Held>,
    by_type: BTreeMap<u64, Vec<Hash>>,
    by_signer: BTreeMap<Hash, Vec<Hash>>,
    acked_by: BTreeMap<Hash, Vec<Hash>>,
    proofs: BTreeMap<(Hash, u64), Vec<Hash>>,
    unreachable: BTreeSet<Hash>,
    recorded: BTreeSet<Hash>,
    cache: RefCell<BTreeMap<Hash, Rc<Resolution>>>,
}

/// The resolution in progress: which identities are being resolved, to
/// detect a loop through operators, and whether one was met.
#[derive(Default)]
struct Cx {
    stack: Vec<Hash>,
    loops: u32,
}

enum Judged {
    /// Counts as support. `protected`: under a cosigned log summary, or
    /// kept by a rotation of the operator (so it survived it).
    Support {
        protected: bool,
    },
    /// Voided by the operator's rotation but acknowledged: never support,
    /// and the position is shown contested (receipt check 6).
    Disputed,
    No,
}

enum Judgement {
    Kept,
    Disputed,
    Void,
}

/// A rotation that can count at a position: valid, naming the act that
/// counts at the position before, revealing the committed safety key.
struct Cand {
    id: Hash,
    /// A homeless rotation (never a chain signature).
    homeless: bool,
    /// The state it would leave.
    state: ChainState,
}

struct Tally {
    winner: Option<Hash>,
    dishonest: Vec<Operator>,
    contested: bool,
}

struct StepOut {
    result: Result<(Link, ChainState), Stop>,
    dishonest: Vec<Operator>,
    contested: bool,
}

impl StepOut {
    fn stop(s: Stop) -> Self {
        StepOut {
            result: Err(s),
            dishonest: vec![],
            contested: false,
        }
    }
}

impl Verifier {
    /// A verifier for acts naming `identity_spec` as the Identity MIP.
    pub fn new(identity_spec: Hash) -> Self {
        Verifier {
            identity_spec,
            ack_specs: None,
            acts: BTreeMap::new(),
            by_type: BTreeMap::new(),
            by_signer: BTreeMap::new(),
            acked_by: BTreeMap::new(),
            proofs: BTreeMap::new(),
            unreachable: BTreeSet::new(),
            recorded: BTreeSet::new(),
            cache: RefCell::new(BTreeMap::new()),
        }
    }

    /// A verifier that also knows the Finance and Law MIPs' spec hashes, so
    /// it can tell which acts may carry acknowledgements (F110).
    pub fn with_mips(identity_spec: Hash, finance: Hash, law: Hash) -> Self {
        let mut v = Verifier::new(identity_spec);
        v.ack_specs = Some((finance, law));
        v
    }

    /// Whether an act may carry the acknowledgements it carries (Envelope
    /// rules 4a and 7b, F110): `Some(true)` if it carries none or is of an
    /// Identity, Finance or Law type; `Some(false)` if it carries some and is
    /// of any other specification; `None` if this verifier does not know the
    /// Finance and Law hashes and cannot tell.
    pub fn acks_allowed(&self, inside: &Inside) -> Option<bool> {
        if inside.acks.as_ref().is_none_or(|a| a.is_empty()) || inside.spec == self.identity_spec {
            return Some(true);
        }
        let (finance, law) = self.ack_specs?;
        Some(inside.spec == finance || inside.spec == law)
    }

    fn changed(&mut self) {
        self.cache.get_mut().clear();
    }

    /// Hold a public act. It is opened with the key on its outside and
    /// checked against it; its signature is checked once, here.
    pub fn add(&mut self, act: Act) -> Result<Hash, ActError> {
        self.add_with_key(act, None)
    }

    /// Hold an act, opening a private one with its content key.
    pub fn add_with_key(&mut self, act: Act, key: Option<&ContentKey>) -> Result<Hash, ActError> {
        let inside = act.open(key)?;
        let id = act.id();
        let verdict = sig::verify(&act.signature, &id);
        let identity = (inside.spec == self.identity_spec).then(|| {
            if !act.outside.is_public() {
                return Err(IdError::Check("Identity acts are public"));
            }
            let p = Payload::decode(inside.type_, &inside.payload)?;
            match &p {
                Payload::Genesis(g) => check_genesis(&act, &inside, g)?,
                Payload::Rotation(r) => check_rotation_shape(&act, &inside, r)?,
                Payload::ChainSignature(c) => check_chain_signature_shape(&act, &inside, c)?,
                Payload::Witness => {
                    check_everyday_shape(&act, &inside)?;
                    check_witness_shape(&inside)?
                }
                _ => check_everyday_shape(&act, &inside)?,
            }
            Ok(p)
        });
        let held = Held {
            id,
            act,
            inside,
            verdict,
            identity,
        };
        if let Some(old) = self.acts.get_mut(&id) {
            // The same act again, from another home or relay. Its outside,
            // and so its inside, are the same; only the signature can differ,
            // since it is not part of the act id. It is indexed once, and a
            // copy with a valid signature is kept over one without.
            if old.verdict != Verdict::Valid && held.verdict == Verdict::Valid {
                *old = held;
                self.changed();
            }
            return Ok(id);
        }
        // Each index is kept in act-id order, never in arrival order, so that
        // nothing read from it depends on the order acts were delivered in.
        // Found by the Law invariants (`docs/law-invariants.md`, IC6).
        fn put(v: &mut Vec<Hash>, id: Hash) {
            if let Err(i) = v.binary_search(&id) {
                v.insert(i, id);
            }
        }
        let (act, inside) = (&held.act, &held.inside);
        if inside.spec == self.identity_spec {
            put(self.by_type.entry(inside.type_).or_default(), id);
        }
        if let Some(s) = act.outside.signer {
            put(self.by_signer.entry(s).or_default(), id);
        }
        for a in inside.acks.iter().flatten() {
            put(self.acked_by.entry(*a).or_default(), id);
        }
        self.acts.insert(id, held);
        self.changed();
        Ok(id)
    }

    /// An inclusion proof a home served: the receipt at `index` of the log
    /// under `summary` (Identity, "Log summary"; relay transport cMIP).
    pub fn add_inclusion_proof(&mut self, summary: Hash, index: u64, proof: Vec<Hash>) {
        self.proofs.insert((summary, index), proof);
        self.changed();
    }

    /// The verifier itself tried every known way to reach this operator's
    /// home and failed (homeless procedure, step 4, last case).
    pub fn failed_to_reach(&mut self, operator: Hash) {
        self.unreachable.insert(operator);
        self.changed();
    }

    /// A named keeper recorded this act before recording the rotation that
    /// voids it (Law). Law checks the record; Identity takes its answer.
    pub fn keeper_recorded(&mut self, act: Hash) {
        self.recorded.insert(act);
        self.changed();
    }

    /// An act this verifier holds.
    pub fn get(&self, id: &Hash) -> Option<&Held> {
        self.acts.get(id)
    }

    /// The acts this verifier holds whose outside names `signer`.
    /// Every act this verifier holds, by id.
    pub fn held_acts(&self) -> impl Iterator<Item = &Held> {
        self.acts.values()
    }

    pub fn signed_by(&self, signer: &Hash) -> impl Iterator<Item = &Held> {
        self.by_signer
            .get(signer)
            .into_iter()
            .flatten()
            .filter_map(|id| self.acts.get(id))
    }

    /// The acts this verifier holds whose `acks` name `id` (Envelope), in
    /// act-id order. Law places a member's signature at an act
    /// of the collective acknowledging it ("Made before, made after").
    /// Only acts that may carry acknowledgements are returned (F110).
    pub fn acknowledgements(&self, id: &Hash) -> impl Iterator<Item = &Held> {
        self.acked_by
            .get(id)
            .into_iter()
            .flatten()
            .filter_map(|a| self.acts.get(a))
            .filter(|h| self.acks_allowed(&h.inside) == Some(true))
    }

    /// The act ids of `signer`'s line ending in the tip `t`, in order, if the
    /// verifier can rebuild it and the tip's running summary matches: the
    /// same proof a rotation's kept ancestry uses. Law uses it for the tips a
    /// collective's record names (record field 1).
    pub fn tip_line(&self, signer: &Hash, t: &identity::KeptTip) -> Option<Vec<Hash>> {
        self.line(signer, t)
    }

    /// Resolve an identity chain: which act counts at each position.
    pub fn resolve(&self, identity: &Hash) -> Rc<Resolution> {
        self.resolve_cx(&mut Cx::default(), identity)
    }

    /// The standing of an act this verifier holds.
    pub fn status(&self, act: &Hash) -> Status {
        match self.acts.get(act) {
            None => Status::Invalid,
            Some(h) => self.status_cx(&mut Cx::default(), h),
        }
    }

    // ------------------------------------------------------------ resolving

    fn resolve_cx(&self, cx: &mut Cx, id: &Hash) -> Rc<Resolution> {
        if let Some(r) = self.cache.borrow().get(id) {
            return r.clone();
        }
        if cx.stack.contains(id) {
            // Resolving operators led back here: accept this identity's
            // chain on its own signatures, as for a self-hosted identity.
            cx.loops += 1;
            return Rc::new(self.resolve_inner(cx, id, true));
        }
        cx.stack.push(*id);
        let before = cx.loops;
        let r = Rc::new(self.resolve_inner(cx, id, false));
        cx.stack.pop();
        if cx.loops == before {
            self.cache.borrow_mut().insert(*id, r.clone());
        }
        r
    }

    fn resolve_inner(&self, cx: &mut Cx, id: &Hash, own: bool) -> Resolution {
        let mut res = Resolution {
            identity: *id,
            links: vec![],
            states: vec![],
            stop: Stop::End,
            contested: vec![],
            dishonest: vec![],
        };
        let Some(g) = self.acts.get(id) else {
            res.stop = Stop::NoGenesis;
            return res;
        };
        match (&g.verdict, &g.identity) {
            (Verdict::Unknown, _) => res.stop = Stop::Unknown,
            (Verdict::Valid, Some(Ok(Payload::Genesis(gen)))) => {
                res.links.push(Link {
                    act: *id,
                    how: How::Genesis,
                });
                res.states.push(ChainState::genesis(*id, gen));
            }
            _ => res.stop = Stop::Invalid,
        }
        if res.links.is_empty() {
            return res;
        }
        loop {
            let out = self.step(cx, id, &res.links, &res.states, &res.dishonest, own);
            let n = res.links.len() as u64;
            res.dishonest
                .extend(out.dishonest.into_iter().map(|o| (o, n)));
            if out.contested {
                res.contested.push(n);
            }
            match out.result {
                Ok((link, state)) => {
                    res.links.push(link);
                    res.states.push(state);
                }
                Err(stop) => {
                    res.stop = stop;
                    return res;
                }
            }
        }
    }

    /// The rotations that can count at position `n` (rotation checks 2 to 5).
    fn candidates(&self, id: &Hash, n: u64, prev: &Hash, ps: &ChainState) -> Vec<Cand> {
        let mut out = vec![];
        for rid in self.by_type.get(&types::ROTATION).into_iter().flatten() {
            let h = &self.acts[rid];
            let Some(Payload::Rotation(r)) = h.payload() else {
                continue;
            };
            if h.signer() != Some(id) || r.position != n || &r.prev != prev {
                continue;
            }
            let s = &h.act.signature;
            if s.scheme != ps.safety.scheme
                || sig::safety_commitment(&s.scheme, &s.key) != ps.safety.commit
            {
                continue;
            }
            if let Ok(state) = ps.apply(r) {
                out.push(Cand {
                    id: *rid,
                    homeless: r.homeless,
                    state,
                });
            }
        }
        // Chain signatures (F132): signed with the same safety key, they
        // compete for the position as rotations do, and count as they do.
        for cid in self.by_type.get(&types::CHAIN_SIGNATURE).into_iter().flatten() {
            let h = &self.acts[cid];
            let Some(Payload::ChainSignature(c)) = h.payload() else {
                continue;
            };
            if h.signer() != Some(id) || c.position != n || &c.prev != prev {
                continue;
            }
            let s = &h.act.signature;
            if s.scheme != ps.safety.scheme
                || sig::safety_commitment(&s.scheme, &s.key) != ps.safety.commit
            {
                continue;
            }
            out.push(Cand {
                id: *cid,
                homeless: false,
                state: ps.sign(c),
            });
        }
        out
    }

    fn step(
        &self,
        cx: &mut Cx,
        id: &Hash,
        links: &[Link],
        states: &[ChainState],
        dishonest: &[(Operator, u64)],
        own: bool,
    ) -> StepOut {
        let n = links.len() as u64;
        let prev = links[links.len() - 1].act;
        let ps = &states[states.len() - 1];
        let cands = self.candidates(id, n, &prev, ps);
        let ids: Vec<Hash> = cands.iter().map(|c| c.id).collect();
        let counted = |c: &Cand, how| StepOut {
            result: Ok((Link { act: c.id, how }, c.state.clone())),
            dishonest: vec![],
            contested: false,
        };
        if cands.is_empty() {
            return StepOut::stop(Stop::End);
        }
        if own {
            return match cands.len() {
                1 => counted(&cands[0], How::OwnSignatures),
                _ => StepOut::stop(Stop::Contested(ids)),
            };
        }

        // Escape endorsements abandon earlier rotations at this position.
        let abandoned: BTreeSet<Hash> = cands
            .iter()
            .filter(|c| c.homeless)
            .flat_map(|c| self.endorsements(id, &prev, ps, &c.id))
            .flat_map(|e| e.abandoned.clone().unwrap_or_default())
            .collect();
        let pool: Vec<&Cand> = cands
            .iter()
            .filter(|c| !abandoned.contains(&c.id))
            .collect();
        let homeless: Vec<&Cand> = pool.iter().copied().filter(|c| c.homeless).collect();

        // 1. Under the home rule in effect. A rotation that counts under the
        //    old home rule always beats a homeless rotation at the same
        //    position, final or not (rule 31; F92).
        let t = self.tally(
            cx,
            id,
            n,
            ps,
            &cands,
            &pool,
            &|c| !abandoned.contains(c),
            dishonest,
        );
        if let Some(w) = t.winner {
            let c = cands.iter().find(|c| c.id == w).unwrap();
            let mut out = counted(c, How::Homes);
            out.dishonest = t.dishonest;
            out.contested = t.contested;
            return out;
        }

        // 2. Final: a homeless rotation not resting on the verifier's own
        //    attempt, whose next rotation counts under the rule it declared.
        //    No objection can void it any more (F63, F92).
        let mut finals = vec![];
        for h in &homeless {
            let b = self.homeless_basis(cx, id, n, &prev, ps, h, &cands, &pool, dishonest, false);
            if let Some(b @ (Basis::Escape | Basis::Gone)) = b {
                let mut l2 = links.to_vec();
                let mut s2 = states.to_vec();
                l2.push(Link {
                    act: h.id,
                    how: How::Homeless {
                        basis: b,
                        final_: false,
                    },
                });
                s2.push(h.state.clone());
                if self.step(cx, id, &l2, &s2, dishonest, false).result.is_ok() {
                    finals.push((*h, b));
                }
            }
        }
        match finals.len() {
            0 => {}
            1 => {
                let (h, basis) = finals[0];
                let mut out = counted(
                    h,
                    How::Homeless {
                        basis,
                        final_: true,
                    },
                );
                out.dishonest = t.dishonest;
                out.contested = t.contested;
                return out;
            }
            _ => {
                let mut out = StepOut::stop(Stop::Contested(ids));
                out.dishonest = t.dishonest;
                out.contested = true;
                return out;
            }
        }

        // 3. A homeless rotation, still provisional.
        let prov: Vec<(&Cand, Basis)> = homeless
            .iter()
            .filter_map(|h| {
                self.homeless_basis(cx, id, n, &prev, ps, h, &cands, &pool, dishonest, true)
                    .map(|b| (*h, b))
            })
            .collect();
        let mut out = match prov.len() {
            0 if t.contested => StepOut::stop(Stop::Contested(ids)),
            0 => StepOut::stop(Stop::Pending(ids)),
            1 => counted(
                prov[0].0,
                How::Homeless {
                    basis: prov[0].1,
                    final_: false,
                },
            ),
            _ => StepOut::stop(Stop::Contested(ids)),
        };
        out.dishonest = t.dishonest;
        out.contested = t.contested;
        out
    }

    /// Count the receipts of the homes of `st` for the rotations at `n`
    /// ("Which rotation counts", steps 2 and 3; conflicting receipts).
    #[allow(clippy::too_many_arguments)]
    fn tally(
        &self,
        cx: &mut Cx,
        id: &Hash,
        n: u64,
        st: &ChainState,
        cands: &[Cand],
        pool: &[&Cand],
        eligible: &dyn Fn(&Hash) -> bool,
        dishonest: &[(Operator, u64)],
    ) -> Tally {
        let eff = st.effective();
        let voters = match eff {
            Effective::Single(op) => vec![op],
            Effective::Threshold(_) => st.operators(),
        };
        let mut votes: BTreeMap<Hash, u64> = BTreeMap::new();
        let mut t = Tally {
            winner: None,
            dishonest: vec![],
            contested: false,
        };
        for op in voters {
            match op {
                Operator::Own => match pool.len() {
                    1 if eligible(&pool[0].id) => *votes.entry(pool[0].id).or_default() += 1,
                    0 | 1 => {}
                    _ => t.contested = true,
                },
                Operator::Id(o) => {
                    if dishonest.iter().any(|(d, p)| *d == op && *p < n) {
                        continue;
                    }
                    let mut sup: Vec<(Hash, bool)> = vec![];
                    for c in cands {
                        let mut best: Option<bool> = None;
                        for r in self.receipts(&o, id, &c.id, n) {
                            match self.judge_receipt(cx, r, c.state.audit.as_ref()) {
                                Judged::Support { protected } => {
                                    best = Some(best.unwrap_or(false) || protected)
                                }
                                Judged::Disputed => t.contested = true,
                                Judged::No => {}
                            }
                        }
                        if let Some(p) = best {
                            sup.push((c.id, p));
                        }
                    }
                    if sup.len() >= 2 {
                        // A standing conflict: this home counts for nothing here.
                        t.contested = true;
                        if sup.iter().filter(|s| s.1).count() >= 2 {
                            t.dishonest.push(op);
                        }
                    } else if let [(c, _)] = sup[..] {
                        if eligible(&c) {
                            *votes.entry(c).or_default() += 1;
                        }
                    }
                }
            }
        }
        let need = match eff {
            Effective::Single(_) => 1,
            Effective::Threshold(k) => k,
        };
        t.winner = votes.iter().find(|(_, v)| **v >= need).map(|(c, _)| *c);
        t
    }

    fn receipts<'a>(
        &'a self,
        op: &'a Hash,
        id: &'a Hash,
        act: &'a Hash,
        n: u64,
    ) -> impl Iterator<Item = &'a Held> + 'a {
        self.by_type
            .get(&types::RECEIPT)
            .into_iter()
            .flatten()
            .map(|r| &self.acts[r])
            .filter(move |h| {
                h.signer() == Some(op)
                    && matches!(h.payload(), Some(Payload::Receipt(r))
                        if &r.identity == id && &r.act == act && r.position == n)
            })
    }

    /// Receipt checks 2, 4, 5 and 6 (check 1 is the caller's: the act named
    /// is a candidate; check 3 too: the operator is one of the homes).
    fn judge_receipt(&self, cx: &mut Cx, r: &Held, audit: Option<&identity::Audit>) -> Judged {
        let op = *r.signer().unwrap();
        let res = self.resolve_cx(cx, &op);
        let Some(k) = self.bound(&res, r) else {
            return Judged::No;
        };
        // Closure ends the operator's role as a home for good (rule 8c): a
        // receipt signed with the key the closing rotation set, or a later
        // one, is no home's receipt.
        if closure_at(self, &res).is_some_and(|c| k >= c) {
            return Judged::No;
        }
        let cosigned = audit.is_some_and(|a| self.cosigned(cx, r, &op, &res, a));
        if audit.is_some() && !cosigned {
            return Judged::No;
        }
        if let Some(j) = self.judging(&res, k) {
            match self.judge(cx, r, &res.links[j].act, &op) {
                Judgement::Kept => Judged::Support { protected: true },
                _ if cosigned => Judged::Support { protected: true },
                Judgement::Disputed => Judged::Disputed,
                Judgement::Void => Judged::No,
            }
        } else {
            Judged::Support {
                protected: cosigned,
            }
        }
    }

    /// Whether a receipt sits under a log summary of its home carrying at
    /// least the required cosignatures from the declared auditors (receipt
    /// check 4; "Log summaries and audits", 3).
    fn cosigned(
        &self,
        cx: &mut Cx,
        r: &Held,
        op: &Hash,
        op_res: &Resolution,
        a: &identity::Audit,
    ) -> bool {
        let Some(Payload::Receipt(rc)) = r.payload() else {
            return false;
        };
        for sid in self.by_type.get(&types::LOG_SUMMARY).into_iter().flatten() {
            let s = &self.acts[sid];
            let Some(Payload::LogSummary(ls)) = s.payload() else {
                continue;
            };
            if s.signer() != Some(op)
                || rc.log_position >= ls.size
                || self.bound(op_res, s).is_none()
            {
                continue;
            }
            let Some(proof) = self.proofs.get(&(*sid, rc.log_position)) else {
                continue;
            };
            if !merkle::verify_inclusion(&r.id, rc.log_position, ls.size, &ls.root, proof) {
                continue;
            }
            let mut by: BTreeSet<Hash> = BTreeSet::new();
            for cid in self.by_type.get(&types::COSIGNATURE).into_iter().flatten() {
                let c = &self.acts[cid];
                let Some(auditor) = c.signer() else { continue };
                if c.payload().is_none()
                    || !a.auditors.contains(auditor)
                    || !c
                        .inside
                        .objects
                        .iter()
                        .flatten()
                        .any(|o| &o.predecessor == sid)
                {
                    continue;
                }
                let ares = self.resolve_cx(cx, auditor);
                if self.bound(&ares, c).is_some() {
                    by.insert(*auditor);
                }
            }
            if by.len() as u64 >= a.threshold {
                return true;
            }
        }
        false
    }

    /// The position of the rotation that judges acts signed with the key
    /// set at position `k`: the first counting rotation after it. A chain
    /// signature changes no key and judges nothing (F132).
    fn judging(&self, res: &Resolution, k: usize) -> Option<usize> {
        (k + 1..res.links.len()).find(|j| matches!(self.acts[&res.links[*j].act].payload(), Some(Payload::Rotation(_))))
    }

    /// Whether a counting link is a chain signature, which binds no key.
    fn is_chain_signature(&self, res: &Resolution, k: usize) -> bool {
        matches!(self.acts[&res.links[k].act].payload(), Some(Payload::ChainSignature(_)))
    }

    /// Everyday check 2: the position of the counting identity-chain act
    /// that bound the act's key, if the binding counts and the key matches.
    /// A binding names the genesis or a rotation, the act that set the key,
    /// never a chain signature (F132).
    fn bound(&self, res: &Resolution, h: &Held) -> Option<usize> {
        if h.verdict != Verdict::Valid {
            return None;
        }
        let k = res.position_of(h.act.outside.binding.as_ref()?)?;
        if self.is_chain_signature(res, k) {
            return None;
        }
        res.states[k]
            .signing_key
            .made(&h.act.signature)
            .then_some(k)
    }

    /// Validity rules 15 to 17: how the rotation `rot` of `signer` judges an
    /// act signed with the key it replaces.
    fn judge(&self, cx: &mut Cx, x: &Held, rot: &Hash, signer: &Hash) -> Judgement {
        let Some(Payload::Rotation(r)) = self.acts[rot].payload() else {
            unreachable!("a counting rotation is held and valid")
        };
        // F88: an escape endorsement is never judged by the rotation it endorses.
        if x.inside.spec == self.identity_spec
            && x.inside.type_ == types::ESCAPE_ENDORSEMENT
            && names(&x.inside, signer, rot)
        {
            return Judgement::Kept;
        }
        let disowned = r.disowned.as_ref().is_some_and(|d| d.contains(&x.id));
        if self.in_kept_ancestry(x, r, signer) && !disowned {
            Judgement::Kept
        } else if self.recorded.contains(&x.id) || self.acknowledged(cx, x) {
            Judgement::Disputed
        } else {
            Judgement::Void
        }
    }

    /// Whether another identity acknowledged this act, by a valid act whose
    /// key is bound by a counting act of its signer (Envelope, "Chains",
    /// rule 4: the acknowledgement counts only alongside the act it names,
    /// which the verifier holds, since it is judging it).
    fn acknowledged(&self, cx: &mut Cx, x: &Held) -> bool {
        for a in self.acked_by.get(&x.id).into_iter().flatten() {
            let y = &self.acts[a];
            // Only an Identity, Finance or Law act acknowledges (F110); an
            // Identity act only if its own shape holds (a witness act).
            if self.acks_allowed(&y.inside) != Some(true) || matches!(y.identity, Some(Err(_))) {
                continue;
            }
            let Some(s) = y.signer() else { continue };
            if Some(s) == x.signer() {
                continue;
            }
            let res = self.resolve_cx(cx, s);
            if self.bound(&res, y).is_some() {
                return true;
            }
        }
        false
    }

    /// Whether an act lies in a rotation's kept ancestry: it is a kept tip,
    /// or an earlier act of the same line, proved by the tip's running
    /// summary from the act ids the verifier holds.
    fn in_kept_ancestry(&self, x: &Held, r: &Rotation, signer: &Hash) -> bool {
        let Some(p) = x.inside.position else {
            return false;
        };
        r.kept.iter().any(|t| {
            t.act == x.id
                || (p >= 1
                    && p < t.position
                    && self
                        .line(signer, t)
                        .is_some_and(|ids| ids[p as usize - 1] == x.id))
        })
    }

    /// The act ids of the line ending in a kept tip, in order, if the
    /// verifier can rebuild it: from the tip itself if held, or from the act
    /// before it (so a private tip needs no opening). The running summary
    /// it carries must match.
    fn line(&self, signer: &Hash, t: &identity::KeptTip) -> Option<Vec<Hash>> {
        let back = |start: &Held, extra: Option<Hash>| -> Option<Vec<Hash>> {
            let mut ids = vec![];
            let mut cur = start;
            loop {
                ids.push(cur.id);
                if ids.len() as u64 > t.position {
                    return None;
                }
                match cur.inside.prev.as_deref() {
                    Some([]) => break,
                    Some([p]) => {
                        cur = self.acts.get(p)?;
                        if cur.signer() != Some(signer) {
                            return None;
                        }
                    }
                    _ => return None,
                }
            }
            ids.reverse();
            ids.extend(extra);
            (ids.len() as u64 == t.position && mmr::summary(&ids) == t.summary).then_some(ids)
        };
        if let Some(tip) = self.acts.get(&t.act) {
            return back(tip, None);
        }
        if t.position == 1 {
            return (mmr::summary(&[t.act]) == t.summary).then(|| vec![t.act]);
        }
        self.by_signer
            .get(signer)
            .into_iter()
            .flatten()
            .find_map(|a| {
                let y = &self.acts[a];
                (y.inside.position == Some(t.position - 1))
                    .then(|| back(y, Some(t.act)))
                    .flatten()
            })
    }

    // ------------------------------------------------------------ homeless

    /// The valid escape endorsements of a homeless rotation: signed by the
    /// owner with the key bound by the act just before it.
    fn endorsements<'a>(
        &'a self,
        id: &'a Hash,
        prev: &'a Hash,
        ps: &'a ChainState,
        h: &'a Hash,
    ) -> impl Iterator<Item = &'a Endorsement> + 'a {
        self.by_type
            .get(&types::ESCAPE_ENDORSEMENT)
            .into_iter()
            .flatten()
            .filter_map(move |e| {
                let x = &self.acts[e];
                match x.payload() {
                    Some(Payload::Endorsement(en))
                        if x.signer() == Some(id)
                            && x.act.outside.binding.as_ref().is_some_and(|b| b == prev || self.sets_key(id, b))
                            && ps.signing_key.made(&x.act.signature)
                            && names(&x.inside, id, h) =>
                    {
                        Some(en)
                    }
                    _ => None,
                }
            })
    }

    /// Whether `b` is a genesis or rotation of `id`, an act that sets a
    /// signing key: where a chain signature is the act just before a
    /// homeless rotation, the endorsement is bound to the act that set the
    /// key in effect (F132).
    fn sets_key(&self, id: &Hash, b: &Hash) -> bool {
        self.acts.get(b).is_some_and(|h| match h.payload() {
            Some(Payload::Genesis(_)) => h.id == *id,
            Some(Payload::Rotation(_)) => h.signer() == Some(id),
            _ => false,
        })
    }

    /// Whether an operator closed its homes by a counting rotation.
    fn closed(&self, cx: &mut Cx, op: &Hash) -> bool {
        closure_at(self, &self.resolve_cx(cx, op)).is_some()
    }

    /// Homeless procedure steps 1, 3 (if `objections`), 4 and 5, and escape.
    #[allow(clippy::too_many_arguments)]
    fn homeless_basis(
        &self,
        cx: &mut Cx,
        id: &Hash,
        n: u64,
        prev: &Hash,
        ps: &ChainState,
        h: &Cand,
        cands: &[Cand],
        pool: &[&Cand],
        dishonest: &[(Operator, u64)],
        objections: bool,
    ) -> Option<Basis> {
        // Step 5: receipts from the new homes meet the new rule, under the
        // audit requirement it declares or inherits (F60, F86).
        let t = self.tally(cx, id, n, &h.state, cands, pool, &|c| *c == h.id, dishonest);
        if t.winner != Some(h.id) {
            return None;
        }
        if self.endorsements(id, prev, ps, &h.id).next().is_some() {
            return Some(Basis::Escape);
        }
        let old = ps.operators();
        // Step 3: no valid objection from a home of the old set.
        if objections {
            for oid in self.by_type.get(&types::OBJECTION).into_iter().flatten() {
                let o = &self.acts[oid];
                let (Some(Payload::Objection(ob)), Some(s)) = (o.payload(), o.signer()) else {
                    continue;
                };
                if &ob.identity != id
                    || !names(&o.inside, id, &h.id)
                    || !old.contains(&Operator::Id(*s))
                {
                    continue;
                }
                if dishonest
                    .iter()
                    .any(|(d, p)| *d == Operator::Id(*s) && *p < n)
                    || self.closed(cx, s)
                {
                    continue;
                }
                if matches!(self.status_cx(cx, o), Status::Valid | Status::Disputed) {
                    return None;
                }
            }
        }
        // Step 4: enough old homes are gone.
        let mut strong = 0u64;
        let mut weak = 0u64;
        let mut gone_ops: Vec<(Operator, bool)> = vec![];
        for op in &old {
            let Operator::Id(o) = op else { continue };
            let g = if self.closed(cx, o) {
                Some(true)
            } else if let Some(a) = &ps.audit {
                let mut by = BTreeSet::new();
                for aid in self.by_type.get(&types::ABSENCE).into_iter().flatten() {
                    let x = &self.acts[aid];
                    let (Some(Payload::Absence(ab)), Some(s)) = (x.payload(), x.signer()) else {
                        continue;
                    };
                    if &ab.operator == o
                        && a.auditors.contains(s)
                        && names(&x.inside, id, &h.id)
                        && matches!(self.status_cx(cx, x), Status::Valid | Status::Disputed)
                    {
                        by.insert(*s);
                    }
                }
                (by.len() as u64 >= a.threshold).then_some(true)
            } else {
                self.unreachable.contains(o).then_some(false)
            };
            if let Some(strong_) = g {
                gone_ops.push((*op, strong_));
                weak += 1;
                if strong_ {
                    strong += 1;
                }
            }
        }
        let met = |count: u64, only_strong: bool| match ps.effective() {
            Effective::Single(op) => gone_ops
                .iter()
                .any(|(g, s)| *g == op && (*s || !only_strong)),
            Effective::Threshold(k) => count > old.len() as u64 - k,
        };
        if met(strong, true) {
            Some(Basis::Gone)
        } else if met(weak, false) {
            Some(Basis::OwnAttempt)
        } else {
            None
        }
    }

    // ------------------------------------------------------------ status

    fn status_cx(&self, cx: &mut Cx, x: &Held) -> Status {
        match x.verdict {
            Verdict::Unknown => return Status::Unknown,
            Verdict::Invalid => return Status::Invalid,
            Verdict::Valid => {}
        }
        match self.acks_allowed(&x.inside) {
            Some(false) => return Status::Invalid,
            None => return Status::Unknown,
            Some(true) => {}
        }
        match &x.identity {
            Some(Err(_)) => return Status::Invalid,
            Some(Ok(Payload::Genesis(_))) | Some(Ok(Payload::Rotation(_))) | Some(Ok(Payload::ChainSignature(_))) => {
                let who = x.signer().copied().unwrap_or(x.id);
                let res = self.resolve_cx(cx, &who);
                return if res.position_of(&x.id).is_some() {
                    Status::Valid
                } else if res.waiting().contains(&x.id) {
                    Status::Pending
                } else {
                    Status::Invalid
                };
            }
            _ => {}
        }
        let (Some(signer), Some(binding)) = (x.signer(), x.act.outside.binding.as_ref()) else {
            return Status::Invalid;
        };
        if x.inside.prev.is_none() {
            return Status::Invalid;
        }
        let res = self.resolve_cx(cx, signer);
        let Some(k) = res.position_of(binding) else {
            if res.waiting().contains(binding) {
                return Status::Pending;
            }
            // F128: a scoped key, installed by an act of a higher MIP.
            return match self.acts.get(binding) {
                Some(b) if b.inside.spec != self.identity_spec && b.id != x.id => Status::Scoped,
                _ => Status::Invalid,
            };
        };
        if self.is_chain_signature(&res, k) || !res.states[k].signing_key.made(&x.act.signature) {
            return Status::Invalid;
        }
        if let Some(j) = self.judging(&res, k) {
            match self.judge(cx, x, &res.links[j].act, signer) {
                Judgement::Kept => Status::Valid,
                Judgement::Disputed => Status::Disputed,
                Judgement::Void => Status::Void,
            }
        } else {
            Status::Valid
        }
    }
}
