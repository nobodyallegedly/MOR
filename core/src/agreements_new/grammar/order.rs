//! The public questions about Terms, assents, counter signatures, being bound,
//! an agreement's signature, a signer's line, resolving updates and the
//! order from citing (draft 25, G1.2, G2.2, G4, G5, G6, G12, G13.3).

use super::answer::{short, Answer, Qualifier, Said, SaidBy, Word};
use super::chain::{End, Outcome};
use super::force::{power_kind_of, Name};
use super::{Scope, Tri, Verifier};
use crate::agreements_new::check::Decoded;
use crate::agreements_new::{Kind, PowerKind, Who};
use crate::hash::Hash;

impl<'a> Verifier<'a> {
    /// Whether an act counts at all: invalid (the rule named), unreadable,
    /// or held and read by the grammar rules (section 2).
    pub fn act(&self, id: &Hash) -> Answer {
        if self.held.is_unreadable(id) {
            return Answer::new(Word::Unchecked, "G9", "the act is held but cannot be read (a private act without its key, or a signature scheme this library does not implement)");
        }
        match self.held.get(id) {
            None => Answer::new(Word::Unchecked, "G9", "the act is not held, or was rejected and never reaches the grammar rules"),
            Some(a) => match a.invalid.first() {
                Some(f) => Answer::new(Word::Invalid, f.rule, format!("{}; an invalid act counts for nothing, for anything, and stays readable", f.says)),
                None => Answer::new(Word::Shown, "section 2", "the act reaches the grammar rules").said(Said { who: SaidBy::Signer(a.signer), as_: "its signer".into(), act: Some(*id) }),
            },
        }
    }

    /// G2.2: what a Terms act leaves unread (the checker's notes).
    pub fn whole(&self, t: &Hash) -> Answer {
        let Some(a) = self.held.get(t) else { return Answer::new(Word::Unchecked, "G2.2", "not held") };
        let mut unread: Vec<String> = a.notes.iter().filter(|n| matches!(n.rule, "G2.2" | "G5.2" | "G10.4")).map(|n| format!("{} ({})", n.says, n.rule)).collect();
        // A call in Terms that do not hold the task it is attached to (G2.2,
        // G11.2): the checker leaves it to the verifier.
        if let Some(t) = self.held.terms(t) {
            for c in t.calls.iter().flatten() {
                if c.task != 6 {
                    unread.push(format!("a call attached to task K{}: these grammar rules read only a call attached to the Control task (G11.2)", c.task));
                } else if self.holds_control(&a.id).word == Word::NotShown {
                    unread.push("a call attached to the Control task, in Terms that do not hold it (G11.2)".into());
                }
            }
        }
        if unread.is_empty() {
            Answer::new(Word::Shown, "G2.2", "nothing in these Terms is left unread")
        } else {
            Answer::new(Word::Shown, "G2.2", format!("left unread, and not part of the Terms: {}", unread.join("; ")))
        }
    }

    /// G4.6 and G4.9: whether Terms are in force.
    pub fn in_force(&self, t: &Hash) -> Answer {
        let Some(a) = self.held.get(t) else { return Answer::new(Word::Unchecked, "G4.6", "the Terms are not held (G9)") };
        if let Some(f) = a.invalid.first() {
            return Answer::new(Word::Invalid, f.rule, format!("the Terms are invalid: {}", f.says));
        }
        let root = self.held.agreement_of(t).unwrap();
        let chain = self.chain(&root);
        let q = self.scope_of(t).map(|(_, q)| q).unwrap_or(Qualifier::AsShown);
        if let End::NotInForce(w, r, why) = &chain.end {
            if *t == root {
                return Answer::new(if *w == Word::Invalid { Word::Invalid } else { *w }, r, format!("not in force: {why}")).q(if *w == Word::NotShown { q } else { Qualifier::None });
            }
            return Answer::new(Word::NotShown, "G4.6", "no Terms of the agreement are in force: its first Terms act is not").q(q);
        }
        if chain.last() == Some(*t) {
            return match &chain.end {
                End::Unchecked { why, .. } => Answer::new(Word::Unchecked, "G4.8", format!("the last version this verifier has established is {}, and from it on which Terms are in force is unchecked: {why}", short(t))).acts([*t]),
                End::Fork { tips, .. } => Answer::new(Word::Shown, "G4.7", "in force: a fork of the Terms that replace them stands, and the Terms both branches replace, the last shared version, stay in force (G4.7(e))")
                    .q(q)
                    .acts([*t])
                    .with(Answer::new(Word::Fork, "G4.7", "which Terms replace them: fork; both tips are shown, and the verifier does not choose between them").q(q).acts(tips.iter().copied())),
                _ => Answer::new(Word::Shown, "G4.6", if *t == root { "in force: the assents its `in_force` rule requires (or, by default, one in the name of every party named as a signer) are present, and no Terms replace them" } else { "in force: the last version of the agreement, by an update its original's update condition answered valid" }).q(q).acts([*t]),
            };
        }
        if let Some(next) = chain.next_after(t) {
            return Answer::new(Word::NotShown, "G4.9", format!("not in force: replaced by {}; the agreement goes on in its last version, {}", short(&next), short(&chain.last().unwrap_or(next)))).q(q).acts([next]);
        }
        if chain.stopped.contains(t) {
            let End::Fork { tips, .. } = &chain.end else { unreachable!() };
            return Answer::new(Word::NotShown, "G4.7", "not in force: a tip of a fork that stands, or built on one; both tips stop (G4.7(e), G12.2)")
                .q(q)
                .with(Answer::new(Word::Fork, "G4.7", "fork").q(q).acts(tips.iter().copied()));
        }
        if let Some(tip) = chain.set_aside_of(t) {
            return Answer::new(Word::NotShown, "G12.3", format!("not in force: in the branch of {}, set aside by a resolving update; it never counted as a version", short(&tip))).q(q);
        }
        if let Some(s) = chain.step(t) {
            return match s.outcome {
                Outcome::Late => Answer::new(Word::NotShown, "G4.7", "not in force: a late update, which replaces nothing").q(s.answer.qualifier).with(s.answer.clone()),
                Outcome::Unchecked => Answer::new(Word::Unchecked, s.answer.rule, s.answer.says.clone()),
                _ if s.answer.word == Word::Invalid => s.answer.clone(),
                _ => Answer::new(Word::NotShown, s.answer.rule, format!("not in force: {}", s.answer.says)).q(q).with(s.answer.clone()),
            };
        }
        if let End::Unchecked { why, .. } = &chain.end {
            // No version established: whether the first Terms act is in force
            // is unchecked (G4.6); past one, an update could not be read (G4.8(e)).
            let rule = if chain.line.is_empty() { "G4.6" } else { "G4.8" };
            return Answer::new(Word::Unchecked, rule, format!("which Terms are in force is unchecked: {why}"));
        }
        Answer::new(Word::NotShown, "G4.6", "not in force: not shown as a version of the agreement that counted").q(q)
    }

    /// G4.6: the agreement's last version, with what it stands on; while a
    /// fork stands, **fork**, with both tips, and the last shared version.
    pub fn last_version(&self, root: &Hash) -> Answer {
        let chain = self.chain(root);
        match &chain.end {
            End::NotInForce(w, r, why) => Answer::new(*w, r, format!("no Terms of the agreement are in force: {why}")),
            End::Unchecked { at, why } if chain.line.is_empty() => Answer::new(Word::Unchecked, "G4.6", why.clone()).acts([*at]),
            End::Unchecked { at, why } => Answer::new(Word::Unchecked, "G4.8", format!("the last version established is {}; from it on, unchecked: {why}", short(at))).acts([*at]),
            End::Fork { shared, tips } => Answer::new(Word::Fork, "G4.7", format!("which Terms replace {}: fork; both tips stop, and {} stays in force", short(shared), short(shared))).q(chain.qualifier).acts(tips.iter().copied()).with(Answer::new(Word::Shown, "G4.7", "the last shared version, in force").q(chain.qualifier).acts([*shared])),
            End::Settled => Answer::new(Word::Shown, "G4.6", "the last version, in force").q(chain.qualifier).acts([chain.last().unwrap()]),
        }
    }

    /// G4.7, G4.8, G4.11: a proposed update, as the original's update
    /// condition (or the default) answers it; late; a tip.
    pub fn update(&self, l: &Hash) -> Answer {
        let Some(t) = self.held.terms(l) else { return Answer::new(Word::Unchecked, "G4.8", "not held (G9)") };
        let Some(o) = t.replaces else { return Answer::new(Word::NotShown, "G4.8", "the first Terms act of an agreement replaces nothing") };
        let root = self.held.agreement_of(l).unwrap();
        let chain = self.chain(&root);
        if let Some(s) = chain.step(l) {
            return match s.outcome {
                Outcome::Tip => s.answer.clone(),
                Outcome::Resolves => s.answer.clone(),
                _ => s.answer.clone(),
            };
        }
        match self.scope_of(&o) {
            Ok((scope, q)) => {
                let mut a = self.update_answer(l, &o, &scope, q);
                a.says.push_str(&format!("; the original {} is not a version that counted, so this act replaces nothing in the line", short(&o)));
                if a.word == Word::Valid {
                    a.word = Word::NotShown;
                    a.rule = "G4.8";
                }
                a
            }
            Err(w) => Answer::new(Word::Unchecked, "G4.8", w),
        }
    }

    /// G4.3: an assent: shown where it is counted in a party's name and the
    /// Terms it names are in force; otherwise not shown, with the reason.
    pub fn assent(&self, id: &Hash) -> Answer {
        let Some(a) = self.held.get(id) else { return Answer::new(Word::Unchecked, "G4.3", "not held (G9)") };
        let Decoded::Statement(s) = &a.act else { return Answer::new(Word::NotShown, "G4.3", "not an assent") };
        if s.kind != Kind::Assent {
            return Answer::new(Word::NotShown, "G4.3", "not an assent");
        }
        if let Some(f) = a.invalid.first() {
            return Answer::new(Word::Invalid, f.rule, f.says.clone());
        }
        if self.held.agreement_of(&s.terms).is_some_and(|r| r != s.agreement) {
            return Answer::new(Word::NotShown, "G4.3", "its `agreement` is not the root of the agreement of the Terms it names: not shown as made within them, and it counts for nothing there (section 3.2)");
        }
        if let Some((tip, _)) = self.rests_on_set_aside(id) {
            return Answer::new(Word::NotShown, "G12.5", format!("made within the branch of {}, set aside: it stands as an act, shown as disputed, and binds no one", short(&tip))).disputed(true);
        }
        if let Some(why) = self.stopped(id, Some(&s.terms)) {
            return Answer::new(Word::NotShown, "G12.2", why);
        }
        let name = match self.name_of(id, PowerKind::Assent) {
            Name::In(w) => w,
            Name::Not(w) => return Answer::new(Word::NotShown, "G5.1", format!("not counted in anyone's name but its signer's own: {w}")),
            Name::Unchecked(w) => return Answer::new(Word::Unchecked, "G5.1", w),
        };
        let inf = self.in_force(&s.terms);
        let scope = self.scope_of(&s.terms).map(|(s, _)| s).unwrap_or_default();
        match self.cancelled(id, name, &s.terms, &scope) {
            Tri::Yes => return Answer::new(Word::NotShown, "G4.10", "the assent is cancelled by a counter signature made before the Terms came into force; it stays an act, shown as cancelled").who(name),
            Tri::Unchecked(w) => return Answer::new(Word::Unchecked, "G4.10", w).who(name),
            Tri::NotShown(w) if inf.word != Word::Shown => return Answer::new(Word::NotShown, "G4.10", w).who(name),
            _ => {}
        }
        if self.chain(&self.held.agreement_of(&s.terms).unwrap_or(s.agreement)).stopped.contains(&s.terms) {
            return Answer::new(Word::NotShown, "G4.3", "the Terms it names are a tip of a fork: the assent counts for whether that tip was signed, and binds no one while the fork stands (G12.2)").who(name);
        }
        match inf.word {
            Word::Shown => Answer::new(Word::Shown, "G4.3", format!("the assent is counted in the name of {}, and the Terms it names are in force: it binds", who_short(&name))).q(inf.qualifier).who(name).acts([s.terms]),
            Word::Unchecked => Answer::new(Word::Unchecked, "G4.3", inf.says).who(name),
            _ => Answer::new(Word::NotShown, "G4.3", format!("counted in the name of {}, and it binds no one: {}", who_short(&name), inf.says)).q(inf.qualifier).who(name),
        }
    }

    /// G4.10: a counter signature: shown where it cancels the assent it is
    /// read against; not shown otherwise, with the reason.
    pub fn counter_signature(&self, c: &Hash) -> Answer {
        let Some(s) = self.held.statement(c) else { return Answer::new(Word::Unchecked, "G4.10", "not held (G9)") };
        if s.kind != Kind::CounterSignature {
            return Answer::new(Word::NotShown, "G4.10", "not a counter signature");
        }
        let scope = self.scope_of(&s.terms).map(|(s, _)| s).unwrap_or_default();
        let signer = self.held.get(c).unwrap().signer;
        let name = s.for_.unwrap_or(Who::Signer(signer));
        for a in self.held.acts() {
            let Decoded::Statement(x) = &a.act else { continue };
            if x.kind != Kind::Assent || x.terms != s.terms {
                continue;
            }
            let Name::In(n) = self.name_of(&a.id, PowerKind::Assent) else { continue };
            if n != name {
                continue;
            }
            if self.first_counter_signature(&a.id, n, &s.terms, &scope) == Some(*c) {
                return match self.counter_cancels(c, &a.id, &s.terms, &scope) {
                    Tri::Yes => Answer::new(Word::Shown, "G4.10", format!("it cancels the assent {}: made before the Terms came into force; that assent stays an act, shown as cancelled", short(&a.id))).acts([a.id]),
                    Tri::No(w) => Answer::new(Word::NotShown, "G4.10", format!("it changes nothing: {w}")).acts([a.id]),
                    Tri::NotShown(w) => Answer::new(Word::NotShown, "G4.10", w).acts([a.id]),
                    Tri::Unchecked(w) => Answer::new(Word::Unchecked, "G4.10", w),
                };
            }
        }
        Answer::new(Word::NotShown, "G4.10", "it follows no assent in the same name: it cancels nothing")
    }

    /// G5.1: whether a person (or an agreement) is bound by an act.
    pub fn bound(&self, person: Who, act: &Hash) -> Answer {
        let Some(a) = self.held.get(act) else { return Answer::new(Word::Unchecked, "G5.1", "not held (G9)") };
        if let Some(f) = a.invalid.first() {
            return Answer::new(Word::Invalid, f.rule, f.says.clone());
        }
        match &a.act {
            Decoded::Terms(t) => {
                let c = self.counted(act, &Scope::default());
                let via = c.sure.iter().find(|k| k.name == person);
                let rule = match via {
                    Some(k) if self.held.statement(&k.assent).is_some_and(|s| s.for_.is_some()) => Some("G5.1(b)"),
                    Some(_) => Some("G5.1(a)"),
                    None => {
                        let by_update = t.replaces.is_some_and(|p| {
                            self.signed_by(&p, &Scope::default()).0.contains(&person)
                                && self.chain(&self.held.agreement_of(act).unwrap()).step(act).is_some_and(|s| matches!(s.outcome, Outcome::Replaces))
                        });
                        by_update.then_some("G5.1(c)")
                    }
                };
                let Some(rule) = rule else {
                    return Answer::new(Word::NotShown, "G5.1", format!("{} is not shown bound by these Terms: no assent in their name is counted, and no update condition of Terms that bind them answers valid for them", who_short(&person))).who(person);
                };
                let inf = self.in_force(act);
                match inf.word {
                    Word::Shown => Answer::new(Word::Shown, rule, format!("{} is bound by these Terms, which are in force", who_short(&person))).q(inf.qualifier).who(person),
                    Word::Unchecked => Answer::new(Word::Unchecked, rule, inf.says).who(person),
                    _ => Answer::new(Word::NotShown, "G4.3", format!("{} signed (or is bound through an update), and the Terms bind no one now: {}", who_short(&person), inf.says)).q(inf.qualifier).who(person),
                }
            }
            Decoded::Statement(s) => {
                if s.for_.is_none() {
                    return if person == Who::Signer(a.signer) {
                        Answer::new(Word::Shown, "G5.1(a)", "signed in their own name").who(person)
                    } else {
                        Answer::new(Word::NotShown, "G5.3", "an act with no `for` and no `under` is made in its signer's own name only").who(person)
                    };
                }
                let kind = power_kind_of(&s.kind);
                match self.name_of(act, kind) {
                    Name::In(w) if w == person => Answer::new(Word::Shown, "G5.1(b)", "made in their name, under Terms that bind them and are in force, by a power whose rule says yes").who(person),
                    Name::In(Who::Agreement(x)) => {
                        // Bound through an agreement by whose Terms they are bound.
                        let inner = self.chain(&x).last().map(|v| self.signed_by(&v, &Scope::default()).0.contains(&person)).unwrap_or(false);
                        if inner {
                            Answer::new(Word::Shown, "G5.1(b)", "the act is the agreement's signature, and they are bound by its Terms in force (G1.2)").who(person)
                        } else {
                            Answer::new(Word::NotShown, "G5.1(b)", "the act is the agreement's signature, and they are not shown bound by its Terms").who(person)
                        }
                    }
                    Name::In(_) => Answer::new(Word::NotShown, "G5.1", "made in another's name").who(person),
                    Name::Not(w) => Answer::new(Word::NotShown, "G5.1(b)", w).who(person),
                    Name::Unchecked(w) => Answer::new(Word::Unchecked, "G5.1(b)", w).who(person),
                }
            }
            Decoded::Report(_) => Answer::new(Word::NotShown, "G5.1", "a report is its signer's word, and binds no one"),
        }
    }

    /// G1.2: whether an act is an agreement's signature.
    pub fn signature_of(&self, act: &Hash) -> Answer {
        let Some(s) = self.held.statement(act) else { return Answer::new(Word::Unchecked, "G1.2", "not held (G9)") };
        let Some(Who::Agreement(x)) = s.for_ else { return Answer::new(Word::NotShown, "G1.2", "its `for` names no agreement: not an agreement's signature") };
        match self.name_of(act, power_kind_of(&s.kind)) {
            Name::In(_) => Answer::new(Word::Shown, "G1.2", format!("the act is the signature of the agreement {}: made for it, under its Terms in force, by a power whose rule says yes, or by every one of its signers", short(&x))).who(Who::Agreement(x)),
            Name::Not(w) => Answer::new(Word::NotShown, "G1.2", w).who(Who::Agreement(x)),
            Name::Unchecked(w) => Answer::new(Word::Unchecked, "G1.2", w).who(Who::Agreement(x)),
        }
    }

    /// G6 and G12 for one signer's line within an agreement: **fork**, with
    /// the tips; or the line as shown, with the last act and whether it is
    /// unchecked before.
    pub fn line(&self, signer: &Hash, agreement: &Hash) -> Answer {
        let lines = self.lines();
        for f in lines.forks.iter().filter(|f| f.signer == *signer && f.agreement == *agreement) {
            match f.resolved_by {
                None => return Answer::new(Word::Fork, "G6.2", "two acts of this signer within this agreement name the same previous act (or both none): a fork, whatever a place shows; both tips stop").q(Qualifier::AsShown).acts(f.tips.iter().copied()).who(Who::Signer(*signer)),
                Some((r, c)) => {
                    let rule = if f.under_power.is_some() { "G12.4" } else { "G12.3" };
                    let mut a = Answer::new(Word::Shown, rule, format!("a fork in this line was resolved by {}, which continues {}; the other tips are set aside", short(&r), short(&c))).q(Qualifier::AsShown).acts([r, c]).who(Who::Signer(*signer));
                    if let Some(u) = f.under_power {
                        let rs = self.held.get(&r).map(|x| x.signer).unwrap_or(*signer);
                        a = a.said(Said { who: SaidBy::Signer(rs), as_: format!("who signed the resolving update, under a power to resolve given in {}", short(&u)), act: Some(r) });
                    }
                    return a;
                }
            }
        }
        let mine: Vec<Hash> = self.held.acts().iter().filter(|a| a.signer == *signer && a.invalid.is_empty() && self.held.agreement_of(&a.id) == Some(*agreement)).map(|a| a.id).collect();
        if mine.is_empty() {
            return Answer::new(Word::NotShown, "G6.1", "no act of this signer within this agreement is held");
        }
        let last: Vec<Hash> = mine.iter().filter(|x| !mine.iter().any(|y| self.held.previous_of(y) == Some(Some(**x)))).copied().collect();
        let unchecked = mine.iter().any(|x| matches!(self.held.previous_of(x), Some(Some(p)) if self.held.get(&p).is_none()));
        Answer::new(Word::Shown, "G6.1", format!("no fork in this line among the acts held; its last act held is {}{}", last.first().map(short).unwrap_or_default(), if unchecked { "; the line is unchecked before its first act held, whose `previous` names an act not held" } else { "" }))
            .q(Qualifier::AsShown)
            .acts(last)
            .who(Who::Signer(*signer))
    }

    /// G13.3: the order of two acts from citing alone.
    pub fn order(&self, a: &Hash, b: &Hash) -> Answer {
        if self.closure(a).contains(b) {
            return Answer::new(Word::Shown, "G13.3", format!("{} came after {}: it names it, directly or through acts that name it", short(a), short(b))).acts([*a, *b]);
        }
        if self.closure(b).contains(a) {
            return Answer::new(Word::Shown, "G13.3", format!("{} came after {}: it names it, directly or through acts that name it", short(b), short(a))).acts([*b, *a]);
        }
        Answer::new(Word::NotShown, "G13.3", "neither names the other: no order is shown from the acts alone")
    }

    /// G12.3, G12.4: a resolving update, of Terms or of a signer's line.
    pub fn resolution(&self, r: &Hash) -> Answer {
        if let Some(root) = self.held.agreement_of(r) {
            if self.held.terms(r).is_some() {
                let chain = self.chain(&root);
                if let Some((shared, _, tip)) = chain.resolved.iter().find(|(_, x, _)| x == r) {
                    let mut a = Answer::new(Word::Shown, "G12.3", format!("it resolves the fork of {} and continues {}; the other tips are set aside", short(shared), short(tip))).q(chain.qualifier).acts([*tip]);
                    if let Some(o) = self.held.terms(shared) {
                        if o.powers.iter().flatten().any(|p| p.kind == PowerKind::Resolves) && !self.update_raw(r, shared, &Scope::default()).0.yes() {
                            a.rule = "G12.4";
                            a.says.push_str("; signed under a power to resolve that the shared Terms give, which the update condition is not asked about");
                            a = a.said(Said { who: SaidBy::Signer(self.held.get(r).unwrap().signer), as_: "who signed it under the power to resolve".into(), act: Some(*r) });
                        }
                    }
                    return a;
                }
            }
        }
        let lines = self.lines();
        if let Some(f) = lines.forks.iter().find(|f| f.resolved_by.map(|x| x.0) == Some(*r)) {
            return self.line(&f.signer, &f.agreement);
        }
        let mut a = self.update(r);
        a.says = format!("it resolves nothing, and is read as an act like any other (G12.3): {}", a.says);
        a
    }
}

fn who_short(w: &Who) -> String {
    match w {
        Who::Signer(h) => short(h),
        Who::Agreement(h) => format!("the agreement {}", short(h)),
    }
}
