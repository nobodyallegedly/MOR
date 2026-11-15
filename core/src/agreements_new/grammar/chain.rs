//! An agreement's chain: which Terms are in force, updates, late updates,
//! forks of Terms and their resolving updates (draft 24, G4.5 to G4.9,
//! G4.11, G12.1 to G12.7 for Terms).
//!
//! In plain words: start from the first Terms act (the root). If it is in
//! force, look at every Terms act that names it in `replaces`. Each is an
//! update where the original's update condition (or the default: everyone who
//! signed the original) answers valid, and it is in force by its own
//! `in_force`. One update: the line goes on from it. None: the line stops
//! here, and these Terms stay in force. Two: they are a fork, unless the
//! knots or the place show that one came after the other had already
//! replaced the original (a late update, which replaces nothing). While a
//! fork stands, both tips stop and the Terms both replace stay in force; a
//! resolving update that names every tip and says which continues resolves
//! it.

use super::answer::{short, Answer, CmipNamed, Qualifier, Word};
use super::{Scope, Tri, Verifier};
use crate::agreements_new::PowerKind;
use crate::hash::Hash;
use std::collections::{HashMap, HashSet};

/// What one Terms act naming a version in `replaces` turned out to be.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Outcome {
    /// An update: it replaced the original (G4.8).
    Replaces,
    /// Valid and in force, and late: replaces nothing, is no tip (G4.7).
    Late,
    /// A tip of a fork (G4.7, G12.1).
    Tip,
    /// A tip set aside by a resolving update (G12.3).
    SetAside,
    /// A resolving update that resolved the fork (G12.3, G12.4).
    Resolves,
    /// Replaces nothing: not valid, not shown, invalid, or not a version.
    Nothing,
    /// Whether it replaces cannot be told (G4.8(e), G9).
    Unchecked,
    /// Not read: the original it names is not a version that counted.
    NotReached,
}

/// One Terms act that names a version in `replaces`, and its answer.
#[derive(Clone, Debug)]
pub struct Step {
    pub act: Hash,
    pub original: Hash,
    pub outcome: Outcome,
    pub answer: Answer,
}

/// How the line of versions ends.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum End {
    /// The root is not in force (or counts for nothing): no Terms of the
    /// agreement are in force.
    NotInForce(Word, &'static str, String),
    /// The last version counted is in force.
    Settled,
    /// A fork stands: both tips stop, the shared version stays in force.
    Fork { shared: Hash, tips: Vec<Hash> },
    /// Unchecked from this version on (G4.8(e), G9).
    Unchecked { at: Hash, why: String },
}

/// An agreement's chain, as the verifier reads it.
#[derive(Clone, Debug)]
pub struct Chain {
    pub root: Hash,
    /// The versions that counted, the root first.
    pub line: Vec<Hash>,
    pub end: End,
    /// Every Terms act read as naming a version in `replaces`.
    pub steps: Vec<Step>,
    /// Each tip set aside, with the versions of its branch read as if it had
    /// stood alone (G12.5).
    pub set_aside: Vec<(Hash, Vec<Hash>)>,
    /// Each fork resolved: (shared version, resolving update, tip continued).
    pub resolved: Vec<(Hash, Hash, Hash)>,
    /// The Terms acts in the branches of a fork that stands (G12.2).
    pub stopped: HashSet<Hash>,
    /// What the answers about the last version stand on.
    pub qualifier: Qualifier,
}

impl Chain {
    pub(crate) fn unchecked(root: Hash, why: &str) -> Chain {
        Chain {
            root,
            line: vec![],
            end: End::Unchecked { at: root, why: why.into() },
            steps: vec![],
            set_aside: vec![],
            resolved: vec![],
            stopped: HashSet::new(),
            qualifier: Qualifier::AsShown,
        }
    }

    /// The version in force: the last that counted (G4.6); while a fork
    /// stands, the shared version (G4.7(e)). `None` where none is in force.
    pub fn last(&self) -> Option<Hash> {
        match self.end {
            End::NotInForce(..) => None,
            End::Unchecked { .. } => self.line.last().copied(),
            _ => self.line.last().copied(),
        }
    }

    /// The version that replaced `v` in the line, where one did.
    pub fn next_after(&self, v: &Hash) -> Option<Hash> {
        let i = self.line.iter().position(|x| x == v)?;
        self.line.get(i + 1).copied()
    }

    pub fn step(&self, act: &Hash) -> Option<&Step> {
        self.steps.iter().find(|s| s.act == *act)
    }

    /// Why Terms `v` are not in force, where they are not the last version.
    pub(crate) fn why_not(&self, v: &Hash) -> Option<Tri> {
        if self.stopped.contains(v) {
            return Some(Tri::No("those Terms are a tip of a fork that stands, or built on one (G12.2)".into()));
        }
        if self.set_aside.iter().any(|(t, b)| t == v || b.contains(v)) {
            return Some(Tri::No("those Terms are in a branch set aside (G12.3)".into()));
        }
        if let Some(s) = self.step(v) {
            return Some(match s.outcome {
                Outcome::Unchecked => Tri::Unchecked(s.answer.says.clone()),
                _ => Tri::No(s.answer.says.clone()),
            });
        }
        None
    }

    /// Whether a version is in a branch set aside, and which tip's.
    pub fn set_aside_of(&self, v: &Hash) -> Option<Hash> {
        self.set_aside.iter().find(|(t, b)| t == v || b.contains(v)).map(|(t, _)| *t)
    }
}

impl<'a> Verifier<'a> {
    /// The Terms acts that name `v` in `replaces` (the candidates), with
    /// whether their `agreement` is the root.
    fn candidates(&self, v: &Hash, root: &Hash) -> (Vec<Hash>, Vec<Hash>) {
        let mut ok = vec![];
        let mut other = vec![];
        for a in self.held.acts() {
            if let crate::agreements_new::check::Decoded::Terms(t) = &a.act {
                if t.replaces == Some(*v) {
                    if t.agreement == Some(*root) {
                        ok.push(a.id);
                    } else {
                        other.push(a.id);
                    }
                }
            }
        }
        ok.sort();
        other.sort();
        (ok, other)
    }

    /// G4.8 with the gates every Terms act passes first: whether `l` is an
    /// update of `o` in a scope (valid by the condition of `o`, in force by
    /// its own `in_force`, G14.3 met where it names an envelope). Lateness is
    /// not read here (G4.7 reads it among the updates).
    pub(crate) fn is_update(&self, l: &Hash, o: &Hash, scope: &Scope) -> Tri {
        if let Some(t) = self.baker_gate(l) {
            return t;
        }
        self.update_raw(l, o, scope).0
    }

    /// G14.3 as a gate: where Terms name an envelope, they count only where
    /// the answer is shown. `None` where it is, or where they name none.
    pub(crate) fn baker_gate(&self, t: &Hash) -> Option<Tri> {
        let terms = self.held.terms(t)?;
        terms.envelope?;
        let a = self.baker(t);
        match a.word {
            Word::Shown => None,
            Word::Invalid => Some(Tri::No(format!("invalid: {} (G14.3(a))", a.says))),
            Word::Unchecked => Some(Tri::Unchecked(format!("{} (G14.3(c))", a.says))),
            _ => Some(Tri::NotShown(format!("{} ({})", a.says, a.rule))),
        }
    }

    /// The first position of the place in `scope` at which, counting only
    /// the acts it shows at or before it, `l` is valid and in force as an
    /// update of `o` (G4.7(b), G5.4, G13.3).
    pub(crate) fn first_position(&self, l: &Hash, o: &Hash, scope: &Scope) -> Result<Option<u64>, String> {
        let Some(p) = scope.place else { return Ok(None) };
        let place = self.layers.places.get(&p).ok_or("no answer from the place")?;
        let mut positions: Vec<u64> = self
            .held
            .acts()
            .iter()
            .filter_map(|a| match place.position(&a.id) {
                super::PlaceSays::At(n) => Some(n),
                _ => None,
            })
            .collect();
        positions.sort();
        positions.dedup();
        for n in positions {
            match self.is_update(l, o, &Scope { upto: Some(n), ..scope.clone() }) {
                Tri::Yes => return Ok(Some(n)),
                Tri::Unchecked(w) => return Err(w),
                _ => {}
            }
        }
        Ok(None)
    }

    /// The first time of a clock at which `l` is valid and in force as an
    /// update of `o` (G4.7(b), per clock).
    fn first_time(&self, l: &Hash, o: &Hash, clock: &Hash) -> Option<u64> {
        let c = self.layers.clocks.get(clock)?;
        let mut times: Vec<u64> = self.held.acts().iter().filter_map(|a| c.time(&a.id)).collect();
        times.sort();
        times.dedup();
        times.into_iter().find(|t| self.is_update(l, o, &Scope { clock: Some(*clock), until: Some(*t), ..Scope::default() }).yes())
    }

    /// G4.7: whether the update `l` of `o` is late against the update `f`:
    /// by knots (as shown), or per the place `o` names, per the clock the
    /// agreement names, or per the anchoring the reader accepts. `Ok(None)`:
    /// not shown late. `Err`: whether it is late is unchecked (G4.7(c)).
    pub(crate) fn late_against(&self, l: &Hash, f: &Hash, o: &Hash, scope: &Scope, q: Qualifier) -> Result<Option<Answer>, String> {
        // (a) By knots: L, or an assent without which L is not an update of
        // O, names enough acts for F to be valid and in force.
        let named = self.closure(l);
        if self.is_update(f, o, &scope.only(named.clone())).yes() {
            return Ok(Some(
                Answer::new(Word::Shown, "G4.7", format!(
                    "late: the Terms act {} names, directly or through acts that name them, enough acts for {} to be valid and in force: it came after {} was replaced, replaces nothing, and is no tip (G4.7(a))",
                    short(l), short(f), short(o)
                ))
                .q(Qualifier::AsShown)
                .acts([*l, *f]),
            ));
        }
        let mut lacking = self.lacking_in(&named);
        for k in self.counted(l, scope).sure {
            let an = self.closure(&k.assent);
            if self.is_update(f, o, &scope.only(an.clone())).yes() && !self.is_update(l, o, &scope.without(HashSet::from([k.assent]))).yes() {
                return Ok(Some(
                    Answer::new(Word::Shown, "G4.7", format!(
                        "late: the assent {} to {}, without which it is not an update of {}, names enough acts for {} to be valid and in force: it came after the original was replaced, replaces nothing, and is no tip (G4.7(a))",
                        short(&k.assent), short(l), short(o), short(f)
                    ))
                    .q(Qualifier::AsShown)
                    .acts([k.assent, *f]),
                ));
            }
            lacking.extend(self.lacking_in(&an));
        }
        // (b) By anchoring.
        if scope.place.is_some() {
            let fl = self.first_position(l, o, scope)?;
            let ff = self.first_position(f, o, scope)?;
            if let (Some(a), Some(b)) = (fl, ff) {
                if a > b {
                    let word = match q {
                        Qualifier::PerAnchoring(_) => "per the anchoring the reader accepts",
                        _ => "per place",
                    };
                    return Ok(Some(
                        Answer::new(Word::Shown, "G4.7", format!(
                            "late, {word}: {} is valid and in force first at position {a}, after {} at position {b}: it replaces nothing, and is no tip (G4.7(b))",
                            short(l), short(f)
                        ))
                        .q(q)
                        .acts([*l, *f]),
                    ));
                }
            }
        }
        if let Some(c) = self.held.terms(o).and_then(|t| t.clock) {
            if self.layers.clocks.contains_key(&c) {
                if let (Some(a), Some(b)) = (self.first_time(l, o, &c), self.first_time(f, o, &c)) {
                    if a > b {
                        return Ok(Some(
                            Answer::new(Word::Shown, "G4.7", format!(
                                "late, per clock: {} is valid and in force at time {a}, after {} at time {b}: it replaces nothing, and is no tip (G4.7(b))",
                                short(l), short(f)
                            ))
                            .q(Qualifier::PerClock(c))
                            .acts([*l, *f]),
                        ));
                    }
                }
            }
        }
        lacking.sort();
        lacking.dedup();
        if let Some(h) = lacking.first() {
            return Err(format!(
                "the Terms act {}, or an assent it needs, names an act this verifier does not hold ({}), which might be what shows it came late (G4.7(c), G9)",
                short(l),
                short(h)
            ));
        }
        Ok(None)
    }

    /// Read an agreement's chain from its root (G4, G12).
    pub(crate) fn walk(&self, root: &Hash) -> Chain {
        let mut c = Chain::unchecked(*root, "");
        if self.held.terms(root).is_none() {
            c.end = End::Unchecked { at: *root, why: format!("the first Terms act {} is not held (G9)", short(root)) };
            return c;
        }
        let (scope, q) = match self.scope_of(root) {
            Ok(x) => x,
            Err(w) => {
                c.end = End::Unchecked { at: *root, why: w };
                return c;
            }
        };
        c.qualifier = q;
        if let Some(a) = self.held.get(root) {
            if let Some(f) = a.invalid.first() {
                c.end = End::NotInForce(Word::Invalid, f.rule, format!("the first Terms act is invalid: {}", f.says));
                return c;
            }
        }
        if self.held.terms(root).is_some_and(|t| t.envelope.is_some()) {
            let b = self.baker(root);
            match b.word {
                Word::Shown => {}
                Word::Unchecked => {
                    c.end = End::Unchecked { at: *root, why: b.says };
                    return c;
                }
                w => {
                    c.end = End::NotInForce(w, b.rule, b.says);
                    return c;
                }
            }
        }
        match self.in_force_raw(root, &scope) {
            Tri::Yes => {}
            Tri::No(w) | Tri::NotShown(w) => {
                c.end = End::NotInForce(Word::NotShown, "G4.1", w);
                return c;
            }
            Tri::Unchecked(w) => {
                c.end = End::Unchecked { at: *root, why: w };
                return c;
            }
        }
        c.line.push(*root);
        let mut aliases: HashMap<Hash, Vec<Hash>> = HashMap::new();
        let mut cur = *root;
        let mut rounds = 0;
        loop {
            rounds += 1;
            if rounds > 10_000 {
                c.end = End::Unchecked { at: cur, why: "the verifier stopped following a long chain (G9.2)".into() };
                return c;
            }
            match self.step_from(&mut c, root, &cur, &aliases) {
                Next::Settled => {
                    c.end = End::Settled;
                    break;
                }
                Next::To(n) => {
                    if let Some(a) = aliases.remove(&cur) {
                        aliases.insert(n, a);
                    }
                    c.line.push(n);
                    cur = n;
                }
                Next::Resolved { resolver, tip } => {
                    c.line.push(tip);
                    // G12.3: an act naming the resolving update is read as
                    // following the last act of the continued branch.
                    let end = self.branch_end(root, &tip);
                    aliases.entry(end).or_default().push(resolver);
                    cur = tip;
                }
                Next::Fork(tips) => {
                    for t in &tips {
                        for v in self.branch(root, t) {
                            c.stopped.insert(v);
                        }
                    }
                    c.end = End::Fork { shared: cur, tips };
                    break;
                }
                Next::Unchecked(why) => {
                    c.end = End::Unchecked { at: cur, why };
                    break;
                }
            }
        }
        // The qualifier of the last version's answer: the place those Terms
        // name, or as shown (G4.6, "Where versions name different places").
        if let Some(l) = c.line.last() {
            if let Ok((_, q)) = self.scope_of(l) {
                c.qualifier = q;
            }
        }
        c
    }

    /// The Terms acts of a branch: the tip and every Terms act of the
    /// agreement that follows it by `replaces`.
    pub(crate) fn branch(&self, root: &Hash, tip: &Hash) -> Vec<Hash> {
        let mut out = vec![*tip];
        let mut i = 0;
        while i < out.len() {
            let (next, _) = self.candidates(&out[i], root);
            for n in next {
                if !out.contains(&n) {
                    out.push(n);
                }
            }
            i += 1;
        }
        out
    }

    /// The last act of a continued branch: following, from the tip, each
    /// version that is the one update of the one before (G12.3).
    fn branch_end(&self, root: &Hash, tip: &Hash) -> Hash {
        let mut cur = *tip;
        for _ in 0..10_000 {
            let (cands, _) = self.candidates(&cur, root);
            let (scope, _) = match self.scope_of(&cur) {
                Ok(x) => x,
                Err(_) => return cur,
            };
            let ups: Vec<Hash> = cands.iter().filter(|l| self.held.terms(l).is_some_and(|t| !t.is_resolving()) && self.is_update(l, &cur, &scope).yes()).copied().collect();
            if ups.len() != 1 {
                return cur;
            }
            cur = ups[0];
        }
        cur
    }

    /// The versions of a branch set aside, read as if its tip had stood
    /// alone (G12.5): from the tip, each version that is the one update of
    /// the one before.
    fn as_if_alone(&self, root: &Hash, tip: &Hash) -> Vec<Hash> {
        let mut v = vec![*tip];
        let mut cur = *tip;
        for _ in 0..10_000 {
            let (cands, _) = self.candidates(&cur, root);
            let (scope, _) = match self.scope_of(&cur) {
                Ok(x) => x,
                Err(_) => break,
            };
            let ups: Vec<Hash> = cands.iter().filter(|l| self.is_update(l, &cur, &scope).yes()).copied().collect();
            if ups.len() != 1 {
                break;
            }
            cur = ups[0];
            v.push(cur);
        }
        v
    }

    /// One step of the walk, from the version `cur` in force.
    fn step_from(&self, c: &mut Chain, root: &Hash, cur: &Hash, aliases: &HashMap<Hash, Vec<Hash>>) -> Next {
        let (mut cands, others) = self.candidates(cur, root);
        for a in aliases.get(cur).into_iter().flatten() {
            let (more, other2) = self.candidates(a, root);
            cands.extend(more);
            for o in other2 {
                c.steps.push(not_version(&o, cur));
            }
        }
        for o in others {
            c.steps.push(not_version(&o, cur));
        }
        if cands.is_empty() {
            return Next::Settled;
        }
        let (scope, q) = match self.scope_of(cur) {
            Ok(x) => x,
            Err(w) => return Next::Unchecked(w),
        };
        // Each candidate that is not written as a resolving update: is it an
        // update?
        let resolving: Vec<Hash> = cands.iter().filter(|l| self.held.terms(l).is_some_and(|t| t.is_resolving())).copied().collect();
        let mut ups = vec![];
        let mut unchecked = None;
        let mut answers: HashMap<Hash, Answer> = HashMap::new();
        for l in cands.iter().filter(|l| !resolving.contains(l)) {
            let a = self.update_answer(l, cur, &scope, q);
            match a.word {
                Word::Valid => ups.push(*l),
                Word::Unchecked => unchecked = Some(a.says.clone()),
                _ => {}
            }
            answers.insert(*l, a);
        }
        // Resolving updates that do not resolve are acts like any other
        // (G12.3): they may be updates, and tips.
        let mut genuine: Vec<(Hash, Hash)> = vec![];
        let mut settled_resolvers = false;
        for _ in 0..4 {
            let tips = self.not_late(&ups, cur, &scope, q, c, &mut unchecked);
            genuine.clear();
            let mut grew = false;
            for r in &resolving {
                if ups.contains(r) {
                    continue;
                }
                match self.resolves(r, cur, &tips, &scope) {
                    Tri::Yes => {
                        let t = self.held.terms(r).unwrap();
                        genuine.push((*r, t.continues.unwrap()));
                    }
                    Tri::Unchecked(w) if tips.len() > 1 => unchecked = Some(w),
                    _ => {
                        let a = self.update_answer(r, cur, &scope, q);
                        if a.word == Word::Valid && !ups.contains(r) {
                            ups.push(*r);
                            grew = true;
                        }
                        answers.insert(*r, a);
                    }
                }
            }
            if !grew {
                settled_resolvers = true;
                break;
            }
        }
        let _ = settled_resolvers;
        let tips = self.not_late(&ups, cur, &scope, q, c, &mut unchecked);
        let mut keys: Vec<&Hash> = answers.keys().collect();
        keys.sort();
        for l in keys {
            let a = &answers[l];
            if !ups.contains(l) {
                let outcome = if a.word == Word::Unchecked { Outcome::Unchecked } else { Outcome::Nothing };
                c.steps.push(Step { act: *l, original: *cur, outcome, answer: a.clone() });
            }
        }
        if let Some(w) = unchecked {
            for l in &tips {
                c.steps.push(Step { act: *l, original: *cur, outcome: Outcome::Unchecked, answer: answers.get(l).cloned().unwrap_or_else(|| Answer::new(Word::Unchecked, "G4.8", "")) });
            }
            return Next::Unchecked(format!("{w}; which Terms are in force is unchecked from {} on (G4.8(e))", short(cur)));
        }
        match tips.len() {
            0 => Next::Settled,
            1 => {
                c.steps.push(Step { act: tips[0], original: *cur, outcome: Outcome::Replaces, answer: answers[&tips[0]].clone() });
                Next::To(tips[0])
            }
            _ => {
                // A fork. Is it resolved (G12.3, G12.4, G12.7)?
                let genuine: Vec<(Hash, Hash)> = genuine.into_iter().filter(|(_, t)| tips.contains(t)).collect();
                let resolution = self.pick_resolution(&genuine, cur, &scope, q, &cands, c);
                match resolution {
                    Some(Ok((resolver, tip))) => {
                        for t in &tips {
                            let outcome = if *t == tip { Outcome::Replaces } else { Outcome::SetAside };
                            let mut a = answers[t].clone();
                            if *t != tip {
                                a = Answer::new(Word::NotShown, "G12.3", format!(
                                    "set aside by the resolving update {}, which continues {}: it never counted as the next version (G12.3)",
                                    short(&resolver), short(&tip)
                                ))
                                .q(q)
                                .acts([resolver, tip]);
                                c.set_aside.push((*t, self.as_if_alone(root, t)));
                            }
                            c.steps.push(Step { act: *t, original: *cur, outcome, answer: a });
                        }
                        c.resolved.push((*cur, resolver, tip));
                        c.steps.push(Step {
                            act: resolver,
                            original: *cur,
                            outcome: Outcome::Resolves,
                            answer: Answer::new(Word::Shown, "G12.3", format!("the resolving update resolves the fork of {} and continues {}", short(cur), short(&tip))).q(q).acts([tip]),
                        });
                        Next::Resolved { resolver, tip }
                    }
                    Some(Err(w)) => Next::Unchecked(w),
                    None => {
                        for t in &tips {
                            c.steps.push(Step {
                                act: *t,
                                original: *cur,
                                outcome: Outcome::Tip,
                                answer: Answer::new(Word::Fork, "G4.7", format!(
                                    "a tip of a fork of {}: valid and in force, as is another update of the same version; both tips stop until a resolving update resolves it (G4.7(e), G12.2)",
                                    short(cur)
                                ))
                                .q(q)
                                .acts(tips.iter().copied()),
                            });
                        }
                        // Rival resolving updates that continue different
                        // tips are themselves tips, of the fork they form
                        // (G12.7); the first fork stands.
                        for (r, _) in &genuine {
                            c.steps.push(Step {
                                act: *r,
                                original: *cur,
                                outcome: Outcome::Tip,
                                answer: Answer::new(Word::Fork, "G12.7", "a rival resolving update: another continues a different tip; neither resolves the fork while the other stands (G12.7)").q(q).acts(genuine.iter().map(|(r, _)| *r)),
                            });
                        }
                        Next::Fork(tips)
                    }
                }
            }
        }
    }

    /// The updates among `ups` that are not late against another (G4.7),
    /// recording the late ones as steps.
    fn not_late(&self, ups: &[Hash], o: &Hash, scope: &Scope, q: Qualifier, c: &mut Chain, unchecked: &mut Option<String>) -> Vec<Hash> {
        if ups.len() < 2 {
            return ups.to_vec();
        }
        let mut keep = vec![];
        for l in ups {
            let mut late = None;
            for f in ups.iter().filter(|f| *f != l) {
                match self.late_against(l, f, o, scope, q) {
                    Ok(Some(a)) => {
                        late = Some(a);
                        break;
                    }
                    Ok(None) => {}
                    Err(w) => *unchecked = Some(w),
                }
            }
            match late {
                Some(a) => {
                    if !c.steps.iter().any(|s| s.act == *l) {
                        c.steps.push(Step { act: *l, original: *o, outcome: Outcome::Late, answer: a });
                    }
                }
                None => keep.push(*l),
            }
        }
        keep
    }

    /// Of the genuine resolving updates, the one resolution they give: all
    /// continue the same tip (G12.7: they resolve it, and are no fork); else
    /// they are rivals, resolved by a resolving update naming them; else the
    /// fork stands (`None`).
    fn pick_resolution(&self, genuine: &[(Hash, Hash)], o: &Hash, scope: &Scope, q: Qualifier, cands: &[Hash], c: &mut Chain) -> Option<Result<(Hash, Hash), String>> {
        if genuine.is_empty() {
            return None;
        }
        // A resolving update that came after another had resolved the fork is
        // a late update and resolves nothing (G12.7).
        let rs: Vec<Hash> = genuine.iter().map(|(r, _)| *r).collect();
        let mut unchecked = None;
        let alive = self.not_late(&rs, o, scope, q, c, &mut unchecked);
        if let Some(w) = unchecked {
            return Some(Err(w));
        }
        let alive: Vec<(Hash, Hash)> = genuine.iter().filter(|(r, _)| alive.contains(r)).copied().collect();
        let first = alive[0];
        if alive.iter().all(|(_, t)| *t == first.1) {
            return Some(Ok(first));
        }
        // Rivals: resolved by a resolving update that names them in
        // `resolves` and one of them in `continues`.
        let rivals: Vec<Hash> = alive.iter().map(|(r, _)| *r).collect();
        for r2 in cands {
            let Some(t) = self.held.terms(r2) else { continue };
            if rivals.contains(r2) || !t.is_resolving() {
                continue;
            }
            if rivals.iter().all(|r| t.resolves.as_ref().unwrap().contains(r)) {
                if let Tri::Yes = self.resolves(r2, o, &rivals, scope) {
                    let chosen = t.continues.unwrap();
                    let tip = alive.iter().find(|(r, _)| *r == chosen).map(|(_, t)| *t)?;
                    return Some(Ok((chosen, tip)));
                }
            }
        }
        None
    }

    /// G12.3 and G12.4: whether `r` resolves the fork of `o` with these tips:
    /// it names every tip, continues one, and is signed as an update of `o`
    /// must be (its condition, or by default everyone who signed `o`), or
    /// under a power to resolve that `o` gives.
    pub(crate) fn resolves(&self, r: &Hash, o: &Hash, tips: &[Hash], scope: &Scope) -> Tri {
        let Some(t) = self.held.terms(r) else { return Tri::Unchecked("not held".into()) };
        if tips.len() < 2 {
            return Tri::No("there is no fork: what it names in `resolves` is one update and no other (G12.3)".into());
        }
        let names = t.resolves.as_ref().unwrap();
        if !tips.iter().all(|x| names.contains(x)) {
            return Tri::No("it does not name every tip (G12.3)".into());
        }
        if !tips.contains(&t.continues.unwrap()) {
            return Tri::No("the tip it continues is not a tip of this fork".into());
        }
        // Under a power to resolve that the shared Terms give (G12.4).
        if let Some(orig) = self.held.terms(o) {
            let signer = self.held.get(r).unwrap().signer;
            for p in orig.powers.iter().flatten().filter(|p| p.kind == PowerKind::Resolves) {
                if let Ok((super::Out::YesNo { yes: true, .. }, _)) = self.ask(&p.rule, super::Ask::Power { terms: *o, kind: PowerKind::Resolves, act: *r, signer }) {
                    return Tri::Yes;
                }
            }
        }
        self.update_raw(r, o, scope).0
    }

    /// The answer about one Terms act as an update of `o` (G4.8, G4.11), not
    /// yet read for lateness.
    pub(crate) fn update_answer(&self, l: &Hash, o: &Hash, scope: &Scope, q: Qualifier) -> Answer {
        if let Some(g) = self.baker_gate(l) {
            return match g {
                Tri::No(w) => Answer::new(Word::Invalid, "G14.3", w),
                Tri::Unchecked(w) => Answer::new(Word::Unchecked, "G14.3", w),
                Tri::NotShown(w) => Answer::new(Word::NotShown, "G14.3", w).q(q),
                Tri::Yes => unreachable!(),
            };
        }
        if let Some(f) = self.held.get(l).and_then(|a| a.invalid.first().cloned()) {
            return Answer::new(Word::Invalid, f.rule, format!("the Terms act is invalid: {}", f.says));
        }
        let (tri, cmip) = self.update_raw(l, o, scope);
        let mut a = match tri {
            Tri::Yes => Answer::new(Word::Valid, "G4.11", format!("{} is an update of {}: the update condition answers valid, and it is in force by its own `in_force` (G4.8)", short(l), short(o))),
            Tri::No(w) if w.starts_with("not valid") => Answer::new(Word::NotValid, "G4.11", format!("{w}; it replaces nothing, whoever signed it, and is no tip of a fork")),
            Tri::No(w) => Answer::new(Word::NotShown, "G4.8", format!("{w}; it replaces nothing")),
            Tri::NotShown(w) => Answer::new(Word::NotShown, "G4.8", format!("{w}; it replaces nothing, and is no tip of a fork; an assent not held may exist")),
            Tri::Unchecked(w) => Answer::new(Word::Unchecked, "G4.8", w),
        };
        if a.word != Word::Unchecked && a.word != Word::Invalid {
            a = a.q(q);
        }
        if let Some(cm) = cmip {
            a = a.cmip(cm);
        }
        a
    }
}

fn not_version(o: &Hash, cur: &Hash) -> Step {
    Step {
        act: *o,
        original: *cur,
        outcome: Outcome::Nothing,
        answer: Answer::new(Word::NotShown, "G4.8", "its `agreement` is not the root of the agreement whose Terms its `replaces` names: not shown as a version of that agreement (section 3.1)"),
    }
}

enum Next {
    Settled,
    To(Hash),
    Resolved { resolver: Hash, tip: Hash },
    Fork(Vec<Hash>),
    Unchecked(String),
}

#[allow(dead_code)]
fn _cmip(_: CmipNamed) {}
