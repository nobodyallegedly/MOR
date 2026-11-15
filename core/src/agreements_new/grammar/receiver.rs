//! The receiver for an act (draft 24, G1.4).
//!
//! In plain words: whatever is paid to an agreement goes to the receiver
//! named by the version the payer read. Where that receiver is another
//! agreement, the verifier reads that one's receiver in the same way, and so
//! on, until one of an agreement's own parties is reached: that party is the
//! receiving side of one leg, and the verifier follows no further.

use super::answer::{short, Answer, Qualifier, Said, SaidBy, Word};
use super::chain::End;
use super::sockets::{Ask, Out};
use super::Verifier;
use crate::agreements_new::{Party, Receiver, Who};
use crate::hash::Hash;

impl<'a> Verifier<'a> {
    /// G1.4: the receiver for an act that gives or owes to the agreement
    /// `root`, and names the version `version` it read (or none: then the
    /// Terms in force, per that agreement's place, or as shown).
    pub fn receiver(&self, root: &Hash, version: Option<&Hash>) -> Answer {
        self.receiver_rec(root, version, &mut vec![])
    }

    /// G1.4 for a payment of the layer that holds value: its receiving side
    /// is the receiver named by the version it read (G13.2).
    pub fn receiver_for_payment(&self, payment: &Hash) -> Answer {
        let Some(p) = self.layers.money.as_ref().and_then(|m| m.payment(payment)) else {
            return Answer::new(Word::Unchecked, "G1.4", "the payment is not held (G9)");
        };
        let Some(root) = self.held.agreement_of(&p.version) else {
            return Answer::new(Word::Unchecked, "G1.4", format!("the version the payment names ({}) is not held (G9)", short(&p.version)));
        };
        let mut a = self.receiver(&root, Some(&p.version)).said(Said { who: SaidBy::Money, as_: "the layer that holds value, giving the payment and the version it read".into(), act: Some(*payment) });
        if let Some((tip, _)) = self.rests_on_set_aside(payment) {
            a = a.disputed(true);
            a.says.push_str(&format!("; the payment names a version of the branch of {}, which was set aside: it stands, read as if that tip had stood alone, and is shown as disputed (G12.5)", short(&tip)));
        }
        a
    }

    fn receiver_rec(&self, root: &Hash, version: Option<&Hash>, seen: &mut Vec<Hash>) -> Answer {
        if seen.contains(root) {
            return Answer::new(Word::NotShown, "G1.4", format!("the agreement {} is met a second time on the way: no one receives (G1.4)", short(root)));
        }
        if seen.len() >= self.limits.receivers {
            return Answer::new(Word::Unchecked, "G1.4", format!("the verifier stopped following receivers after {} agreements (G9.2; P8)", seen.len()));
        }
        seen.push(*root);
        if self.held.terms(root).is_none() {
            return Answer::new(Word::Unchecked, "G1.4", format!("this verifier lacks the acts of the agreement {} (G9)", short(root)));
        }
        let chain = self.chain(root);
        let (v, mut extra, q, disputed) = match version {
            Some(v) => {
                if self.held.terms(v).is_none() {
                    return Answer::new(Word::Unchecked, "G1.4", format!("the version named ({}) is not held (G9)", short(v)));
                }
                if self.held.agreement_of(v) != Some(*root) {
                    return Answer::new(Word::NotShown, "G1.4", "the act names, as the version it read, Terms that are not shown as a version of that agreement: no one is shown to receive");
                }
                if let Some(f) = self.held.get(v).unwrap().invalid.first() {
                    return Answer::new(Word::Invalid, f.rule, format!("the version named is invalid ({}): no one receives by it", f.says));
                }
                if let Some(g) = self.baker(v).into_gate() {
                    return g;
                }
                if chain.line.contains(v) {
                    (*v, None, Qualifier::AsShown, false)
                } else if chain.stopped.contains(v) {
                    let End::Fork { shared, tips } = &chain.end else { unreachable!() };
                    let fork = Answer::new(Word::Fork, "G4.7", "the version named is a tip of a fork that stands, or built on one: the receiver is the one named by the Terms both branches replace, and the act is shown as built on a tip (G1.4, G12.2)").acts(tips.iter().copied());
                    (*shared, Some(fork), Qualifier::AsShown, false)
                } else if chain.set_aside_of(v).is_some() {
                    (*v, None, Qualifier::AsShown, true)
                } else {
                    let why = chain.why_not(v).map(|t| format!("{t:?}")).unwrap_or_default();
                    return Answer::new(Word::NotShown, "G1.4", format!("the version named is not shown as a version of that agreement: {why}"));
                }
            }
            None => match &chain.end {
                End::NotInForce(w, r, why) => return Answer::new(*w, r, format!("no Terms of the agreement {} are in force: {why}", short(root))),
                End::Unchecked { why, .. } if chain.line.is_empty() => return Answer::new(Word::Unchecked, "G1.4", why.clone()),
                End::Unchecked { why, .. } => return Answer::new(Word::Unchecked, "G1.4", format!("which Terms of {} are in force is unchecked: {why}", short(root))),
                End::Fork { shared, tips } => {
                    let fork = Answer::new(Word::Fork, "G4.7", "a fork of the agreement's Terms stands: the receiver is the one named by the Terms both branches replace, and the verifier does not choose a branch (G1.4, G4.7)").q(chain.qualifier).acts(tips.iter().copied());
                    (*shared, Some(fork), chain.qualifier, false)
                }
                End::Settled => (chain.last().unwrap(), None, chain.qualifier, false),
            },
        };
        let terms = self.held.terms(&v).unwrap();
        let mut a = match terms.receiver {
            None => Answer::new(Word::NotShown, "G1.4", format!("the version {} names no receiver: no one receives", short(&v))),
            Some(Receiver::Agreement(x)) => {
                let inner = self.receiver_rec(&x, None, seen);
                let mut a = inner.clone();
                a.says = format!("the version {} names the agreement {} as receiver (a sequence, G11.1); its receiver: {}", short(&v), short(&x), inner.says);
                a
            }
            Some(Receiver::Party(i)) => match terms.parties.as_ref().and_then(|p| p.get(i as usize)) {
                Some(Party::Signer(h)) => Answer::new(Word::Shown, "G1.4", format!("the receiver named by the version {} is its party {}: the receiving side of one leg", short(&v), short(h))).who(Who::Signer(*h)),
                Some(Party::Role(r)) => match r.spot.as_ref().map(|s| self.ask(s, Ask::Spot { terms: v, party: i })) {
                    Some(Ok((Out::Spot(s), fp))) => match s.fillings.as_slice() {
                        [f] => {
                            let mut a = Answer::new(Word::Shown, "G1.4", format!("the receiver named by the version {} is a role, filled once, by {}", short(&v), short(&f.signer))).who(Who::Signer(f.signer)).acts(f.proof.iter().copied());
                            a = a.said(Said { who: SaidBy::Cmip(fp), as_: "the spot's cMIP, naming who fills it (K5)".into(), act: None });
                            if let Some(c) = f.confirmed_by {
                                a = a.said(Said { who: c.into(), as_: "who confirmed the filling (G8.4)".into(), act: None });
                            }
                            a
                        }
                        [] => Answer::new(Word::NotShown, "G1.4", "the receiver named is a role, and its spot is not filled: no one receives"),
                        _ => Answer::new(Word::NotShown, "G1.4", "the receiver named is a role filled more than once: which of them receives is not said, so no one receives"),
                    },
                    Some(Err(w)) => Answer::new(Word::Unchecked, "G1.4", w),
                    _ => Answer::new(Word::Unchecked, "G1.4", "the role's cMIP gave no fillings (K5)"),
                },
                _ => Answer::new(Word::NotShown, "G1.4", format!("the version {} names as receiver a position that is no signer and no role among its parties: no one receives", short(&v))),
            },
        };
        if a.qualifier == Qualifier::None && a.word == Word::Shown {
            a = a.q(q);
        }
        if a.acts.is_empty() {
            a = a.acts([v]);
        } else if !a.acts.contains(&v) {
            a.acts.insert(0, v);
        }
        if let Some(f) = extra.take() {
            a = a.with(f);
        }
        a.disputed(disputed)
    }
}

impl Answer {
    /// The answer of G14.3 as a gate for answers resting on the Terms: `None`
    /// where they count.
    pub(crate) fn into_gate(self) -> Option<Answer> {
        match self.word {
            Word::Shown => None,
            _ => {
                let mut a = self.clone();
                a.says = format!("the version named names an envelope, and G14.3 comes first: {}", self.says);
                Some(a)
            }
        }
    }
}
