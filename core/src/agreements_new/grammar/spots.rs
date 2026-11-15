//! Spots: who fills a role, by which proof, whether it still takes new
//! identities, and the rights of a filling (draft 24, G10).

use super::answer::{short, Answer, Qualifier, Said, SaidBy, Word};
use super::sockets::{Ask, Filling, Out};
use super::{Scope, Verifier};
use crate::agreements_new::{Party, Who};
use crate::hash::Hash;

impl<'a> Verifier<'a> {
    /// The role's K5 reading, from the Terms in force of the agreement (while
    /// a fork stands, the Terms both branches replace, G10.2).
    fn spot_reading(&self, root: &Hash, party: u64) -> Result<(Hash, super::sockets::SpotReading, Hash, Qualifier), Answer> {
        let chain = self.chain(root);
        let Some(v) = chain.last() else { return Err(Answer::new(Word::NotShown, "G10.2", "no Terms of the agreement are in force")) };
        let terms = self.held.terms(&v).unwrap();
        let Some(Party::Role(r)) = terms.parties.as_ref().and_then(|p| p.get(party as usize)) else {
            return Err(Answer::new(Word::NotShown, "G10.2", "the Terms in force name no role at that position"));
        };
        let Some(spot) = &r.spot else { return Err(Answer::new(Word::Invalid, "G10.1", "the role lacks its cMIP")) };
        match self.ask(spot, Ask::Spot { terms: v, party }) {
            Ok((Out::Spot(s), fp)) => Ok((v, s, fp, chain.qualifier)),
            Ok(_) => Err(Answer::new(Word::Unchecked, "G10.2", "the spot's cMIP gave no fillings (K5)")),
            Err(w) => Err(Answer::new(Word::Unchecked, "G10.2", w)),
        }
    }

    /// G10.2: each filling of a spot, with its proof, reported by who signed
    /// it, qualified per place or as shown. The fillings are in `with`.
    pub fn fillings(&self, root: &Hash, party: u64) -> Answer {
        let (v, s, fp, q) = match self.spot_reading(root, party) {
            Ok(x) => x,
            Err(a) => return a,
        };
        let mut a = Answer::new(
            if s.fillings.is_empty() { Word::NotShown } else { Word::Shown },
            "G10.2",
            format!(
                "the spot at position {party} of the Terms in force ({}) is filled {} time(s); it holds {} (as its cMIP says)",
                short(&v),
                s.fillings.len(),
                if s.many { "many fillings" } else { "one filling" }
            ),
        )
        .q(q)
        .acts([v])
        .said(Said { who: SaidBy::Cmip(fp), as_: "the spot's cMIP (K5)".into(), act: None });
        for f in &s.fillings {
            a = a.with(self.filling_answer(f, q, fp));
        }
        a
    }

    fn filling_answer(&self, f: &Filling, q: Qualifier, fp: Hash) -> Answer {
        let mut a = Answer::new(Word::Shown, "G10.2", format!("{} fills the spot, on the strength of its proof, earned under the version {}", short(&f.signer), short(&f.version)))
            .q(q)
            .who(Who::Signer(f.signer))
            .acts(f.proof.iter().copied())
            .said(Said { who: SaidBy::Cmip(fp), as_: "the spot's cMIP, naming who fills it (K5)".into(), act: None });
        for p in &f.proof {
            if let Some(h) = self.held.get(p) {
                a = a.said(Said { who: SaidBy::Signer(h.signer), as_: "the signer of an act of the proof (G8.4)".into(), act: Some(*p) });
            }
        }
        if let Some(c) = f.confirmed_by {
            a = a.said(Said { who: c.into(), as_: "who confirmed the filling (G8.4)".into(), act: None });
        }
        if let Some((tip, signed)) = self.rests_on_set_aside_version(&f.version) {
            if !signed {
                a = a.disputed(true);
                a.says.push_str(&format!("; earned within the branch of {}, set aside: it stands, shown as disputed (G12.5)", short(&tip)));
            }
        }
        a
    }

    fn rests_on_set_aside_version(&self, v: &Hash) -> Option<(Hash, bool)> {
        let root = self.held.agreement_of(v)?;
        let c = self.chain(&root);
        c.set_aside_of(v).map(|t| (t, false))
    }

    /// G10.5: whether the spot still takes new identities: the task's output,
    /// with its cause, as its cMIP gives it.
    pub fn takes_new(&self, root: &Hash, party: u64) -> Answer {
        match self.spot_reading(root, party) {
            Ok((v, s, fp, q)) => Answer::new(if s.takes_new { Word::TaskYes } else { Word::TaskNo }, "G10.5", format!("the spot's cMIP says it {} new identities: {}", if s.takes_new { "still takes" } else { "no longer takes" }, s.why))
                .q(q)
                .acts([v])
                .cmip(super::CmipNamed::Cmip { task: "K5", fingerprint: fp, ground: s.why.clone() }),
            Err(a) => a,
        }
    }

    /// G10.6: the rights of a filling: the version it was earned under, and
    /// each later version that changes them, with what that rests on (the
    /// holder's own assent, or the condition named by the version it was
    /// earned under, and its answer).
    pub fn rights(&self, earned_under: &Hash, holder: &Hash) -> Answer {
        let Some(root) = self.held.agreement_of(earned_under) else { return Answer::new(Word::Unchecked, "G10.6", "the version is not held") };
        let chain = self.chain(&root);
        let Some(i) = chain.line.iter().position(|x| x == earned_under) else {
            return Answer::new(Word::Shown, "G10.6", "the filling keeps the rights of the version it was earned under; no later version of the line is read as changing them").acts([*earned_under]);
        };
        let v = self.held.terms(earned_under).unwrap();
        let mut a = Answer::new(Word::Shown, "G10.6", format!("the filling has exactly the rights offered by the version it was earned under ({})", short(earned_under))).q(chain.qualifier).acts([*earned_under]);
        for later in &chain.line[i + 1..] {
            let own = self.counted(later, &Scope::default()).sure.iter().any(|k| k.name == Who::Signer(*holder) && self.held.statement(&k.assent).is_some_and(|s| s.for_.is_none()));
            if own {
                a.acts.push(*later);
                a = a.with(Answer::new(Word::Shown, "G10.6", format!("the later version {} changes them, as far as its words say: it carries an assent by the filling's holder in their own name (G10.6(a))", short(later))).acts([*later]));
                continue;
            }
            if let Some(cond) = &v.condition {
                match self.ask(cond, Ask::FillingRights { earned_under: *earned_under, later: *later, holder: *holder }) {
                    Ok((Out::Update { valid: true, ground }, fp)) => {
                        a.acts.push(*later);
                        a = a.with(
                            Answer::new(Word::Valid, "G10.6", format!("the later version {} changes them, as far as its words say: the update condition of the version the filling was earned under answers valid (G10.6(b))", short(later)))
                                .acts([*later])
                                .cmip(super::CmipNamed::Cmip { task: "K4", fingerprint: fp, ground }),
                        );
                    }
                    Ok(_) => {}
                    Err(w) => a = a.with(Answer::new(Word::Unchecked, "G10.6", w).acts([*later])),
                }
            }
        }
        if a.acts.len() == 1 {
            a.says.push_str("; no later version changes them");
        }
        a
    }
}
