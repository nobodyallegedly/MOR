//! The baker (draft 24, G14): Terms that name an envelope count only with the
//! holder of the baker's rights at the act of the envelope's chain they cite.
//!
//! In plain words: Terms for a baked work say which act of the envelope's
//! chain they relied on (the bake, or a transfer). Whoever held the baker's
//! rights at that act must be one of their parties, and bound by them. If
//! that holder is not among the parties at all, and no role could reach
//! them, the Terms are invalid, for good (a thief's Terms). If the holder is
//! named but not yet shown bound, they count for nothing until it is shown.
//! If the knots or an anchoring show the Terms were made after a later
//! transfer, they are late, and count for nothing.

use super::answer::{short, Answer, Qualifier, Said, SaidBy, Word};
use super::layers::ChainSays;
use super::sockets::{Ask, Out};
use super::{Scope, Tri, Verifier};
use crate::agreements_new::{Party, Who};
use crate::hash::Hash;

impl<'a> Verifier<'a> {
    /// G14.3 (with G14.1, G14.2 and G14.5): what Terms that name an envelope
    /// count for.
    pub fn baker(&self, t: &Hash) -> Answer {
        let Some(terms) = self.held.terms(t) else { return Answer::new(Word::Unchecked, "G14.3", "the Terms are not held (G9)") };
        let (Some(e), Some(x)) = (terms.envelope, terms.envelope_at) else {
            return Answer::new(Word::Shown, "G14.1", "the Terms name no envelope: G14 asks nothing of them");
        };
        let mut a = self.baker_inner(t, &e, &x);
        // G14.5: shown beside every answer of G14.3, other bakes of the same
        // work.
        if let Some(chain) = &self.layers.chain {
            for (other, baker) in chain.same_work(&e) {
                a = a.with(
                    Answer::new(Word::Shown, "G14.5", format!(
                        "the same work is baked by others too: the envelope {} states the baker {}; the verifier does not choose between bakes, and does not answer which baker made the work (the bytes say who uploaded and when, not who made it)",
                        short(&other), short(&baker)
                    ))
                    .q(Qualifier::AsShown)
                    .acts([other])
                    .who(Who::Signer(baker))
                    .said(Said { who: SaidBy::EnvelopeChain(other), as_: "the envelope, stating its baker".into(), act: Some(other) }),
                );
            }
        }
        a
    }

    fn baker_inner(&self, t: &Hash, e: &Hash, x: &Hash) -> Answer {
        let terms = self.held.terms(t).unwrap();
        let Some(chain) = &self.layers.chain else {
            return Answer::new(Word::Unchecked, "G14.3", "this verifier has no answer from the envelope's chain (the layer below), so it cannot read the holder of the baker's rights (G14.3(c), G9)");
        };
        let said_chain = Said { who: SaidBy::EnvelopeChain(*e), as_: "the envelope's chain, giving the holder at the act cited".into(), act: Some(*x) };
        // G14.3(a): `envelope_at` names an act, held, that is not of the
        // envelope's chain.
        if self.held.get(x).is_some() {
            return Answer::new(Word::Invalid, "G14.3", format!("the Terms' `envelope_at` names {}, an act held that is not an act of the chain of the envelope they name: they are invalid, and count for nothing (G14.3(a))", short(x))).acts([*x]);
        }
        let holder = match chain.at(e, x) {
            ChainSays::Lacking(w) => return Answer::new(Word::Unchecked, "G14.3", format!("{w}: the holder of the baker's rights at the act cited is not known (G14.3(c), G9)")),
            ChainSays::NotOfChain => {
                return Answer::new(Word::Invalid, "G14.3", format!("the Terms' `envelope_at` names {}, an act of another envelope's chain: they are invalid, and count for nothing (G14.3(a))", short(x))).acts([*x]).said(said_chain);
            }
            ChainSays::NoHolder { fork } => {
                return Answer::new(Word::NotShown, "G14.3", "the act cited lies in a fork of the envelope's chain (a double sale) for which that layer gives no holder: no party is shown to be the holder at that act (G14.2, G14.3(b))")
                    .acts(fork)
                    .said(said_chain);
            }
            ChainSays::Holder { holder, fork } => {
                if !fork.is_empty() {
                    // Shown with the fork, as that layer gives it.
                }
                (holder, fork)
            }
        };
        let (h, fork) = holder;
        let named = terms.parties.iter().flatten().any(|p| *p == Party::Signer(h));
        let roles = terms.parties.iter().flatten().any(|p| matches!(p, Party::Role(_)));
        // "nothing they name is lacking".
        let direct: Vec<Hash> = self.held.namings(t).into_iter().filter(|(f, _)| !matches!(*f, "envelope" | "envelope_at" | "agreement")).map(|(_, h)| h).collect();
        let lacking: Vec<Hash> = direct.iter().filter(|h| !self.known(h)).copied().collect();
        if !named && !roles {
            if let Some(l) = lacking.first() {
                return Answer::new(Word::Unchecked, "G14.3", format!("the holder at the act cited is not among the Terms' parties, and they name an act this verifier does not hold ({}): G14.3(a) asks that nothing they name is lacking (G9)", short(l))).said(said_chain);
            }
            return Answer::new(Word::Invalid, "G14.3", format!(
                "the holder of the baker's rights at the act the Terms cite is {}, who is not among their parties and is reached through no role: they are invalid, for good, and count for nothing, their receiver included (G14.3(a))",
                short(&h)
            ))
            .who(Who::Signer(h))
            .acts([*x])
            .said(said_chain);
        }
        // Late Terms (G14.2): made after a transfer Y that follows X.
        match self.late_terms(t, e, x) {
            Ok(Some(late)) => {
                return Answer::new(Word::NotShown, "G14.2", format!("the Terms are late: {}; late Terms count for nothing, for anything (G14.2)", late.says))
                    .q(late.qualifier)
                    .acts(late.acts.clone())
                    .with(late)
                    .said(said_chain);
            }
            Ok(None) => {}
            Err(w) => return Answer::new(Word::Unchecked, "G14.2", w).said(said_chain),
        }
        // Bound by them (G14.2, "Bound by them"; G5.1), or a role that the
        // holder fills.
        let bound = if named {
            self.bound_raw(&h, t)
        } else {
            match self.role_fillers(t) {
                Ok(f) if f.contains(&h) => self.bound_raw(&h, t),
                Ok(_) => Tri::NotShown("the Terms reach the holder only through a role, and the role's cMIP does not name the holder as filling it".into()),
                Err(w) => Tri::Unchecked(w),
            }
        };
        let mut a = match bound {
            Tri::Yes => Answer::new(Word::Shown, "G14.3", format!(
                "the holder of the baker's rights at the act the Terms cite is {}, one of their parties, bound by them: the Terms count, for the work and for everything else (G14.2, G14.3(d))",
                short(&h)
            ))
            .who(Who::Signer(h))
            .acts([*x]),
            Tri::Unchecked(w) => Answer::new(Word::Unchecked, "G14.3", w).who(Who::Signer(h)),
            Tri::No(w) | Tri::NotShown(w) => Answer::new(Word::NotShown, "G14.3", format!(
                "the holder at the act cited is {}, and the acts held do not show that holder bound by the Terms ({w}): they count for nothing until it is shown (G14.3(b))",
                short(&h)
            ))
            .who(Who::Signer(h)),
        };
        if !fork.is_empty() {
            a = a.with(Answer::new(Word::Fork, "G14.2", "the act cited lies in a fork of the envelope's chain; the holder is given as that layer gives it, and the verifier does not choose between its branches").acts(fork));
        }
        a.said(said_chain)
    }

    /// "Bound by them" for G14.2, read from the acts apart from G14.3's own
    /// answer: an assent counted in the holder's name, or bound through the
    /// Terms they replace by their update condition (G5.1(c)), those Terms
    /// themselves meeting G14.3.
    fn bound_raw(&self, h: &Hash, t: &Hash) -> Tri {
        let scope = Scope::default();
        let c = self.counted(t, &scope);
        if c.names().contains(&Who::Signer(*h)) {
            return Tri::Yes;
        }
        let terms = self.held.terms(t).unwrap();
        if let Some(p) = terms.replaces {
            if self.held.terms(&p).is_some() {
                let (signed, _) = self.signed_by(&p, &scope);
                if signed.contains(&Who::Signer(*h)) {
                    let gate_ok = self.baker_gate(&p).is_none();
                    if gate_ok && self.update_raw(t, &p, &scope).0.yes() {
                        return Tri::Yes;
                    }
                }
            }
        }
        if let Some((_, w)) = c.doubt.first() {
            return Tri::Unchecked(w.clone());
        }
        Tri::NotShown("no assent in the holder's name to them is counted, and no update condition the holder was bound by answers valid for them".into())
    }

    /// G14.2, "Late Terms": shown late by knots (the Terms, or an assent they
    /// need, name a later transfer Y, directly or through acts that name it),
    /// or by the place or clock the agreement names.
    fn late_terms(&self, t: &Hash, e: &Hash, x: &Hash) -> Result<Option<Answer>, String> {
        let chain = self.layers.chain.as_ref().unwrap();
        let ys = chain.transfers_after(e, x);
        if ys.is_empty() {
            return Ok(None);
        }
        let named = self.closure(t);
        for y in &ys {
            if named.contains(y) {
                return Ok(Some(
                    Answer::new(Word::Shown, "G14.2", format!("the Terms name the transfer {}, which follows the act they cite, directly or through acts that name it: they came after it (G14.2(a))", short(y)))
                        .q(Qualifier::AsShown)
                        .acts([*t, *y]),
                ));
            }
        }
        let mut lacking = self.lacking_in(&named);
        for k in self.counted(t, &Scope::default()).sure {
            let an = self.closure(&k.assent);
            for y in &ys {
                if an.contains(y) {
                    return Ok(Some(
                        Answer::new(Word::Shown, "G14.2", format!("the assent {} the Terms need names the transfer {}, which follows the act they cite: they came after it (G14.2(a))", short(&k.assent), short(y)))
                            .q(Qualifier::AsShown)
                            .acts([k.assent, *y]),
                    ));
                }
            }
            lacking.extend(self.lacking_in(&an));
        }
        let terms = self.held.terms(t).unwrap();
        if let Some(p) = terms.place {
            if let Some(place) = self.layers.places.get(&p) {
                if let super::PlaceSays::At(pt) = place.position(t) {
                    for y in &ys {
                        if let super::PlaceSays::At(py) = place.position(y) {
                            if pt > py {
                                return Ok(Some(
                                    Answer::new(Word::Shown, "G14.2", format!("the place shows the Terms at position {pt}, after the transfer {} at position {py} (G14.2(b))", short(y)))
                                        .q(Qualifier::PerPlace(p))
                                        .acts([*t, *y]),
                                ));
                            }
                        }
                    }
                }
            }
        }
        if let Some(c) = terms.clock {
            if let Some(clock) = self.layers.clocks.get(&c) {
                if let Some(tt) = clock.time(t) {
                    for y in &ys {
                        if let Some(ty) = clock.time(y) {
                            if tt > ty {
                                return Ok(Some(
                                    Answer::new(Word::Shown, "G14.2", format!("the clock gives the Terms the time {tt}, after the transfer {} at {ty} (G14.2(b))", short(y))).q(Qualifier::PerClock(c)).acts([*t, *y]),
                                ));
                            }
                        }
                    }
                }
            }
        }
        lacking.retain(|h| !ys.contains(h));
        if let Some(l) = lacking.first() {
            return Err(format!("the Terms, or an assent they need, name an act this verifier does not hold ({}), which might be what shows them late (G14.2(c), G9)", short(l)));
        }
        Ok(None)
    }
}

#[allow(dead_code)]
fn _unused(_: Ask, _: Out) {}
