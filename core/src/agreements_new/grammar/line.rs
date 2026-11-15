//! Each signer's line within an agreement, its forks, and what is built on a
//! tip (draft 25, G6, G12.1 to G12.6 for lines; G12.2 for what is built on
//! any tip).
//!
//! In plain words: every act a signer makes within an agreement names their
//! previous act there. Two acts of one signer that name the same previous
//! act (or both name none) are a fork, whatever a place shows: both stop,
//! and so does everything built on either, until a resolving update by that
//! signer (or one made under a power to resolve) names both and says which
//! continues.

use super::answer::short;
use super::chain::Outcome;
use super::{Tri, Verifier};
use crate::agreements_new::check::Decoded;
use crate::agreements_new::{PowerKind, Who};
use crate::hash::Hash;
use std::collections::{HashMap, HashSet, VecDeque};

/// A fork in one signer's line (G6.2).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LineFork {
    pub signer: Hash,
    pub agreement: Hash,
    /// The shared act; `None` where both tips name no `previous`.
    pub shared: Option<Hash>,
    pub tips: Vec<Hash>,
    /// The resolving update and the tip it continues, where resolved.
    pub resolved_by: Option<(Hash, Hash)>,
    /// Whether it was resolved under a power to resolve (G12.4), and whose.
    pub under_power: Option<Hash>,
}

/// The signers' lines, as read.
#[derive(Clone, Debug, Default)]
pub struct Lines {
    pub forks: Vec<LineFork>,
    /// Tips of forks that stand, and the acts that follow them in the line.
    pub stopped: HashSet<Hash>,
    /// Tips set aside by a resolving update, and what follows them.
    pub set_aside: HashSet<Hash>,
    /// Resolving updates, and the last act of the branch they continue:
    /// an act naming the resolver is read as following that act (G12.3).
    pub alias: HashMap<Hash, Hash>,
}

impl<'a> Verifier<'a> {
    /// The acts that count in a line: Terms and Statements held, readable,
    /// not invalid.
    fn line_acts(&self) -> Vec<(Hash, Hash, Hash, Option<Hash>)> {
        self.held
            .acts()
            .iter()
            .filter(|a| a.invalid.is_empty() && matches!(a.act, Decoded::Terms(_) | Decoded::Statement(_)))
            .map(|a| (a.id, a.signer, self.held.agreement_of(&a.id).unwrap(), self.held.previous_of(&a.id).flatten()))
            .collect()
    }

    fn resolves_fields(&self, id: &Hash) -> Option<(Vec<Hash>, Hash)> {
        match &self.held.get(id)?.act {
            Decoded::Terms(t) => Some((t.resolves.clone()?, t.continues?)),
            Decoded::Statement(s) => Some((s.resolves.clone()?, s.continues?)),
            _ => None,
        }
    }

    pub(crate) fn read_lines(&self) -> Lines {
        let acts = self.line_acts();
        let mut lines = Lines::default();
        // Pass 1: forks, and resolutions by the signer itself; acts naming a
        // resolver are read as following the end of the continued branch.
        for _round in 0..4 {
            let mut groups: HashMap<(Hash, Hash, Option<Hash>), Vec<Hash>> = HashMap::new();
            for (id, s, ag, prev) in &acts {
                let prev = prev.map(|p| *lines.alias.get(&p).unwrap_or(&p));
                groups.entry((*s, *ag, prev)).or_default().push(*id);
            }
            let mut forks = vec![];
            let mut keys: Vec<_> = groups.keys().copied().collect();
            keys.sort();
            for k in keys {
                let mut members = groups[&k].clone();
                members.sort();
                if members.len() < 2 {
                    continue;
                }
                // A resolving update in the group, naming every other member
                // and continuing one, resolves them (G12.3).
                let plain: Vec<Hash> = members.iter().filter(|m| self.resolves_fields(m).is_none()).copied().collect();
                let resolvers: Vec<(Hash, Hash)> = members
                    .iter()
                    .filter_map(|m| {
                        let (rs, c) = self.resolves_fields(m)?;
                        (plain.len() >= 2 && plain.iter().all(|o| rs.contains(o)) && plain.contains(&c)).then_some((*m, c))
                    })
                    .collect();
                let tips: Vec<Hash> = members.iter().filter(|m| !resolvers.iter().any(|(r, _)| r == *m)).copied().collect();
                if tips.len() < 2 {
                    continue;
                }
                let continued: HashSet<Hash> = resolvers.iter().map(|(_, c)| *c).collect();
                let resolved_by = if continued.len() == 1 { resolvers.first().copied() } else { None };
                forks.push(LineFork { signer: k.0, agreement: k.1, shared: k.2, tips, resolved_by, under_power: None });
            }
            let mut alias = HashMap::new();
            for f in &forks {
                if let Some((r, c)) = f.resolved_by {
                    alias.insert(r, self.line_end(&acts, &c, &lines.alias));
                }
            }
            let done = alias == lines.alias;
            lines.alias = alias;
            lines.forks = forks;
            if done {
                break;
            }
        }
        self.mark(&mut lines, &acts);
        lines
    }

    /// Pass 2 (G12.4): forks resolved under a power to resolve, given in
    /// Terms by which the signer is bound; the resolving update stands in its
    /// own signer's line, and its `for` names the signer whose line forked.
    pub(crate) fn lines_with_powers(&self, mut lines: Lines) -> Lines {
        let acts = self.line_acts();
        let mut changed = false;
        for f in lines.forks.iter_mut().filter(|f| f.resolved_by.is_none()) {
            for a in self.held.acts() {
                let Decoded::Statement(s) = &a.act else { continue };
                if s.for_ != Some(Who::Signer(f.signer)) || s.agreement != f.agreement {
                    continue;
                }
                let (Some(rs), Some(c), Some(under)) = (&s.resolves, s.continues, s.under) else { continue };
                if !f.tips.iter().all(|t| rs.contains(t)) || !f.tips.contains(&c) {
                    continue;
                }
                if let Tri::Yes = self.power(&a.id, s, &under, Who::Signer(f.signer), PowerKind::Resolves) {
                    f.resolved_by = Some((a.id, c));
                    f.under_power = Some(under);
                    changed = true;
                    break;
                }
            }
        }
        if changed {
            lines.stopped.clear();
            lines.set_aside.clear();
            self.mark(&mut lines, &acts);
        }
        lines
    }

    /// The last act of the branch continued from `tip`: following, in the
    /// signer's line, the one act that names the one before.
    fn line_end(&self, acts: &[(Hash, Hash, Hash, Option<Hash>)], tip: &Hash, alias: &HashMap<Hash, Hash>) -> Hash {
        let mut cur = *tip;
        for _ in 0..10_000 {
            let next: Vec<Hash> = acts.iter().filter(|(_, _, _, p)| p.map(|p| *alias.get(&p).unwrap_or(&p)) == Some(cur)).map(|(id, ..)| *id).collect();
            if next.len() != 1 {
                return cur;
            }
            cur = next[0];
        }
        cur
    }

    fn mark(&self, lines: &mut Lines, acts: &[(Hash, Hash, Hash, Option<Hash>)]) {
        let follows = |root: &Hash| -> HashSet<Hash> {
            let mut out = HashSet::from([*root]);
            loop {
                let before = out.len();
                for (id, _, _, p) in acts {
                    if let Some(p) = p {
                        if out.contains(p) {
                            out.insert(*id);
                        }
                    }
                }
                if out.len() == before {
                    return out;
                }
            }
        };
        for f in &lines.forks {
            match f.resolved_by {
                None => {
                    for t in &f.tips {
                        lines.stopped.extend(follows(t));
                    }
                }
                Some((_, c)) => {
                    for t in f.tips.iter().filter(|t| **t != c) {
                        lines.set_aside.extend(follows(t));
                    }
                }
            }
        }
    }

    /// G12.2: whether an act does not count because it is a tip of a fork
    /// that stands, follows one in its line, or rests on a tip or on an act
    /// built on it, however many namings lie between; or is set aside. An
    /// assent to a Terms tip still counts for whether that tip was signed:
    /// `except` is the Terms act it names in `terms`, read for that alone.
    pub(crate) fn stopped(&self, id: &Hash, except: Option<&Hash>) -> Option<String> {
        let lines = self.lines();
        if lines.stopped.contains(id) {
            return Some("a tip of a fork in its signer's line, or an act that follows one: it does not count while the fork stands (G6.2, G12.2)".into());
        }
        if lines.set_aside.contains(id) {
            return Some("set aside by a resolving update in its signer's line, or follows an act set aside: it never counted (G12.3)".into());
        }
        // Built on a tip: anything it names, directly or through acts that
        // name them.
        let mut seen = HashSet::from([*id]);
        let mut q = VecDeque::new();
        for (field, n) in self.held.namings(id) {
            if field == "terms" && except == Some(&n) {
                continue;
            }
            q.push_back(n);
        }
        while let Some(x) = q.pop_front() {
            if !seen.insert(x) {
                continue;
            }
            if lines.stopped.contains(&x) {
                return Some(format!("it rests on {}, a tip of a fork that stands in a signer's line, or on an act built on one (G12.2)", short(&x)));
            }
            if let Some(Decoded::Terms(_)) = self.held.get(&x).map(|a| &a.act) {
                let root = self.held.agreement_of(&x).unwrap();
                if !self.walking(&root) {
                    let c = self.chain(&root);
                    if c.stopped.contains(&x) {
                        return Some(format!("it rests on {}, Terms in a branch of a fork that stands, and counts for nothing while it stands (G12.2)", short(&x)));
                    }
                    if let Some(s) = c.step(&x) {
                        if s.outcome == Outcome::Late {
                            return Some(format!("it rests on {}, a late update, and nothing built on a late update counts (G4.7(c))", short(&x)));
                        }
                    }
                }
            }
            for (_, n) in self.held.namings(&x) {
                q.push_back(n);
            }
        }
        None
    }

    /// G12.5: the branch set aside an act rests on, where it rests on one:
    /// the tip, and whether the act's signer signed one of that branch's
    /// Terms acts (then it is not protected, and counts for nothing).
    pub(crate) fn rests_on_set_aside(&self, id: &Hash) -> Option<(Hash, bool)> {
        let named = self.closure(id);
        for x in &named {
            if x == id {
                continue;
            }
            if self.held.terms(x).is_none() {
                continue;
            }
            let root = self.held.agreement_of(x).unwrap();
            if self.walking(&root) {
                continue;
            }
            let c = self.chain(&root);
            if let Some(tip) = c.set_aside_of(x) {
                let branch: Vec<Hash> = c.set_aside.iter().find(|(t, _)| *t == tip).map(|(_, b)| b.clone()).unwrap_or_default();
                let me = self.held.get(id).map(|a| a.signer).or_else(|| self.layers.money.as_ref().and_then(|m| m.payment(id)).map(|p| p.payer));
                let signed_one = branch.iter().chain(std::iter::once(&tip)).any(|v| self.held.get(v).map(|a| a.signer) == me);
                return Some((tip, signed_one));
            }
        }
        None
    }
}
