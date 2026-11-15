//! Legs of a sequence: the Control task, calls, leg reports and their two
//! halves, silence, the buyer's leg, the data socket, and the contest (draft
//! 24, G11).
//!
//! In plain words: a leg is one obligation carried out between two sides,
//! the one who does it and the one who receives it. Terms that hold the
//! Control task may carry a call for reports. Each side's report goes to the
//! other side of its own leg and nowhere else. Where both sides report on
//! the same settlement, the verifier shows the two halves as matched,
//! mismatched, or one side only, and chooses neither.

use super::answer::{short, Answer, CmipNamed, Qualifier, Said, SaidBy, Word};
use super::sockets::{Ask, Out};
use super::{Scope, Verifier};
use crate::agreements_new::check::Decoded;
use crate::agreements_new::{CallFrom, Kind, Line, Party, Receiver, Report, Who};
use crate::hash::Hash;

impl<'a> Verifier<'a> {
    /// G11.2: whether Terms hold the Control task (K6).
    pub fn holds_control(&self, t: &Hash) -> Answer {
        let Some(terms) = self.held.terms(t) else { return Answer::new(Word::Unchecked, "G11.2", "the Terms are not held (G9)") };
        if let Some(s) = &terms.control {
            let Some(fp) = s.cmip.fp() else { return Answer::new(Word::Invalid, "G2.1", "the cMIP in `control` is not named by fingerprint") };
            if !self.cmips.holds(&fp) {
                return Answer::new(Word::Unchecked, "G11.2", format!("the Terms name a cMIP in `control` ({}) that this verifier lacks: whether they hold the task is unchecked (G9)", short(&fp)));
            }
            return Answer::new(Word::Shown, "G11.2", "the Terms hold the Control task: their `control` names a cMIP").cmip(CmipNamed::Cmip { task: "K6", fingerprint: fp, ground: String::new() });
        }
        let Some(Receiver::Party(i)) = terms.receiver else {
            return Answer::new(Word::NotShown, "G11.2", "the `control` socket is empty, and the Terms name no party of their own as receiver: they do not hold the Control task");
        };
        if !matches!(terms.parties.as_ref().and_then(|p| p.get(i as usize)), Some(Party::Signer(_) | Party::Role(_))) {
            return Answer::new(Word::NotShown, "G11.2", "the `control` socket is empty, and the receiver is no signer or role among the parties: no Control task is held");
        }
        let Some(body) = &terms.body else { return Answer::new(Word::NotShown, "G11.2", "no body to read") };
        match self.ask(&body.socket, Ask::Body { terms: *t }) {
            Ok((Out::Body(r), fp)) => {
                if r.parts.iter().any(|p| *p != i) {
                    Answer::new(Word::Shown, "G11.2", "with `control` empty, the receiver is one of the Terms' own parties and the body gives a part to another party: the receiver holds for the others, and passing on is its obligation").cmip(CmipNamed::Cmip {
                        task: "K1",
                        fingerprint: fp,
                        ground: "the part each party is given".into(),
                    })
                } else {
                    Answer::new(Word::NotShown, "G11.2", "with `control` empty, the body gives no part to any party other than the receiver: the Terms do not hold the Control task")
                }
            }
            Ok(_) => Answer::new(Word::Unchecked, "G11.2", "the body's cMIP gave no reading (K1)"),
            Err(w) => Answer::new(Word::Unchecked, "G11.2", format!("the verifier cannot read the body: {w}")),
        }
    }

    /// The doer under Terms that hold K6: the party they name as receiver
    /// among their own parties (G11.2).
    pub(crate) fn doer(&self, t: &Hash) -> Option<Hash> {
        let terms = self.held.terms(t)?;
        let Some(Receiver::Party(i)) = terms.receiver else { return None };
        match terms.parties.as_ref()?.get(i as usize)? {
            Party::Signer(h) => Some(*h),
            Party::Role(_) => self.receiver(&self.held.agreement_of(t)?, Some(t)).who.and_then(|w| if let Who::Signer(h) = w { Some(h) } else { None }),
            Party::Agreement(_) => None,
        }
    }

    /// The call attached to K6 in Terms that hold it, if any (G11.2).
    pub(crate) fn k6_call(&self, t: &Hash) -> Option<CallFrom> {
        self.held.terms(t)?.calls.as_ref()?.iter().find(|c| c.task == 6).map(|c| c.from)
    }

    fn reports_for(&self, call_act: &Hash, task: Option<u8>) -> Vec<(Hash, Hash, &Report)> {
        self.held
            .acts()
            .iter()
            .filter_map(|a| match &a.act {
                Decoded::Report(r) if r.call.act == *call_act && r.call.task == task => Some((a.id, a.signer, r)),
                _ => None,
            })
            .collect()
    }

    /// The receiving side for a line passed on to `to` (G11.4(b)): a signer,
    /// or an agreement's receiver for the act (G1.4).
    fn receiving_side(&self, to: &Who) -> Option<Hash> {
        match to {
            Who::Signer(h) => Some(*h),
            Who::Agreement(x) => match self.receiver(x, None).who {
                Some(Who::Signer(h)) => Some(h),
                _ => None,
            },
        }
    }

    /// G11.4(b), (c), (d): the leg reports answering the K6 call of Terms
    /// `t`: for each settlement a doer's line names, the two halves; the
    /// confirmations no doer's report speaks of; and silence.
    pub fn leg(&self, t: &Hash) -> Vec<Answer> {
        let holds = self.holds_control(t);
        if holds.word != Word::Shown {
            return vec![holds];
        }
        let Some(from) = self.k6_call(t) else {
            return vec![Answer::new(Word::NoReportCalledFor, "G11.4", "the Terms hold the Control task and carry no call: no report called for (the report block's words; G11.4(d))").acts([*t])];
        };
        let reports = self.reports_for(t, Some(6));
        if reports.is_empty() {
            return vec![self.silence(t)];
        }
        let doer = self.doer(t);
        let mut out = vec![];
        let mut confirmed_used = vec![];
        for (rid, signer, r) in &reports {
            if Some(*signer) != doer {
                continue;
            }
            for l in r.lines.iter().flatten() {
                let Line::PassedOn { amount, to, by, .. } = l else { continue };
                let side = self.receiving_side(to);
                let said_doer = Said { who: SaidBy::Signer(*signer), as_: "the doer, in its leg report".into(), act: Some(*rid) };
                if from != CallFrom::Both {
                    out.push(Answer::new(Word::Shown, "G11.4", format!("the doer states {} passed on by {}: shown as stated; the call expects one side only, so no tie is answered (G11.4(b))", amount.value, short(by))).acts([*rid, *by]).said(said_doer));
                    continue;
                }
                let mut halves = vec![];
                let mut unchecked = None;
                for (cid, csigner, c) in &reports {
                    if Some(*csigner) != side || cid == rid {
                        continue;
                    }
                    for cl in c.lines.iter().flatten() {
                        let Line::Received { amount: ca, by: cb } = cl else { continue };
                        let same = if cb == by {
                            Some(true)
                        } else {
                            self.layers.money.as_ref().and_then(|m| m.same_payment(by, cb))
                        };
                        match same {
                            Some(true) => halves.push((*cid, *csigner, *ca)),
                            Some(false) => {}
                            None => unchecked = Some(*cid),
                        }
                    }
                }
                let settled_held = self.layers.money.as_ref().is_some_and(|m| m.settlement(by));
                let a = if !settled_held || (halves.is_empty() && unchecked.is_some()) {
                    Answer::new(Word::Unchecked, "G11.4", format!("the verifier does not hold the settlement {}, or the layer that holds value's answer: the tie is unchecked; each side's statement is still shown (G11.4(b), G9)", short(by)))
                } else if let Some((cid, cs, ca)) = halves.first() {
                    confirmed_used.push(*cid);
                    let w = if *ca == *amount { Word::Matched } else { Word::Mismatched };
                    Answer::new(w, "G11.4", if w == Word::Matched {
                        format!("matched: the doer and the receiving side state the same amount ({}) for the settlement {} (the report block's word)", amount.value, short(by))
                    } else {
                        format!("mismatched: the doer states {} and the receiving side {} for the settlement {}; both are shown, neither is chosen (G11.4(c))", amount.value, ca.value, short(by))
                    })
                    .acts([*rid, *cid, *by])
                    .said(Said { who: SaidBy::Signer(*cs), as_: "the receiving side, in its confirmation".into(), act: Some(*cid) })
                } else {
                    Answer::new(Word::OneSideOnly, "G11.4", format!("one side only: the doer's line for the settlement {} has no confirmation from the receiving side held (the report block's words)", short(by))).acts([*rid, *by])
                };
                out.push(a.said(said_doer).who(side.map(Who::Signer).unwrap_or(*to)));
            }
        }
        // Confirmations of which no doer's report speaks.
        let signers: Vec<Hash> = self.held.terms(t).unwrap().parties.iter().flatten().filter_map(|p| if let Party::Signer(h) = p { Some(*h) } else { None }).collect();
        for (cid, cs, _) in &reports {
            if Some(*cs) == doer || confirmed_used.contains(cid) {
                continue;
            }
            let said = Said { who: SaidBy::Signer(*cs), as_: "the signer of the report".into(), act: Some(*cid) };
            if signers.contains(cs) && from == CallFrom::Both {
                out.push(Answer::new(Word::OneSideOnly, "G11.4", "one side only: a confirmation by a party the Terms name as a signer, of which no doer's report held speaks").acts([*cid]).said(said));
            } else {
                out.push(Answer::new(Word::Shown, "G11.4", "listed, as its signer's word: a report by someone who is not a side of this leg ties nothing (G8, G11.4(b))").acts([*cid]).said(said));
            }
        }
        out
    }

    /// G11.4(d): a call with no report: **unanswered** for a reader who is a
    /// side of the leg, or reads along a path its people signed for (K8);
    /// for any other reader, that leg's reports are **not shown**.
    pub fn silence(&self, t: &Hash) -> Answer {
        let Some(reader) = self.reader.on_behalf_of else {
            return Answer::new(Word::NotShown, "G11.4", "the verifier was told on whose behalf it reads by no one: it reads as no side of any leg, and for it that leg's reports are not shown (G11.4(d))");
        };
        let terms = self.held.terms(t).unwrap();
        let doer = self.doer(t);
        let mut side = Some(match reader {
            Who::Signer(h) => h,
            Who::Agreement(_) => [0; 32],
        }) == doer;
        for p in terms.parties.iter().flatten() {
            match p {
                Party::Signer(h) if reader == Who::Signer(*h) => side = true,
                Party::Agreement(x) => {
                    if self.receiver(x, None).who == Some(reader) {
                        side = true;
                    }
                }
                _ => {}
            }
        }
        if side {
            return Answer::new(Word::Unanswered, "G11.4", "the call has no report held, and the verifier reads as a side of that leg: unanswered (the report block's word); not read as kept, nor as failed (G11.4(d))").acts([*t]);
        }
        match self.data_yes(t, reader, None, Some(*t)) {
            Ok(true) => Answer::new(Word::Unanswered, "G11.4", "the call has no report held, and the Terms' data cMIP says this reader may read beyond the leg: unanswered (G11.4(d), K8)").acts([*t]),
            Ok(false) => Answer::new(Word::NotShown, "G11.4", "the verifier reads as no side of that leg, along no path its people signed for: for it, that leg's reports are not shown (G11.4(d))").acts([*t]),
            Err(w) => Answer::new(Word::Unchecked, "G11.4", w),
        }
    }

    /// K8 for one Terms act (G11.6(a)): `Ok(false)` where `data` is empty.
    fn data_yes(&self, t: &Hash, reader: Who, report: Option<Hash>, call: Option<Hash>) -> Result<bool, String> {
        let Some(terms) = self.held.terms(t) else { return Err(format!("the Terms to be asked ({}) are not held (G9)", short(t))) };
        let Some(s) = &terms.data else { return Ok(false) };
        match self.ask(s, Ask::Data { terms: *t, reader, report, call }) {
            Ok((Out::YesNo { yes, .. }, _)) => Ok(yes),
            Ok(_) => Err("the data cMIP gave no yes or no (K8)".into()),
            Err(w) => Err(w),
        }
    }

    /// G11.6(a), (b): may the reader read this report, or what it states,
    /// beyond its own leg? The data cMIP of every Terms asked must answer yes;
    /// an empty `data` is no: one leg. The task's output.
    pub fn data(&self, report: &Hash, reader: Who) -> Answer {
        let Some(r) = self.held.report(report) else { return Answer::new(Word::Unchecked, "G11.6", "the report is not held (G9)") };
        let mut asked: Vec<Hash> = vec![];
        if r.call.task.is_some() {
            asked.push(r.call.act);
        } else {
            // The buyer's leg (G11.6(b)): the version the payment names, where
            // an assent of the payer to it is held.
            let p = self.layers.money.as_ref().and_then(|m| m.payment(&r.call.act).or_else(|| m.payments().into_iter().find(|p| p.settlement == r.call.act)));
            let Some(p) = p else { return Answer::new(Word::Unchecked, "G11.6", "the payment the report answers is not held (G9)") };
            let assented = self.counted(&p.version, &Scope::default()).sure.iter().any(|k| k.name == Who::Signer(p.payer));
            if !assented {
                return Answer::new(Word::TaskNo, "G11.6", "no assent of the payer to the version its payment names is held: the payer is not shown bound by those Terms, nothing they signed says they agreed to be read beyond their leg, and the answer is no for every reader who is not a side of it (G11.6(b))").acts([p.version]);
            }
            asked.push(p.version);
            if let Some(Receiver::Agreement(x)) = self.held.terms(&p.version).and_then(|t| t.receiver) {
                if let Some(v) = self.chain(&x).last() {
                    asked.push(v);
                }
            }
        }
        for l in r.lines.iter().flatten() {
            let to = match l {
                Line::PassedOn { to: Who::Agreement(x), .. } | Line::StillOwed { to: Who::Agreement(x), .. } => *x,
                _ => continue,
            };
            match self.chain(&to).last() {
                Some(v) => asked.push(v),
                None => return Answer::new(Word::Unchecked, "G11.6", format!("the Terms in force of {}, which a line names, are not held (G9)", short(&to))),
            }
        }
        asked.dedup();
        for t in &asked {
            match self.data_yes(t, reader, Some(*report), None) {
                Ok(true) => {}
                Ok(false) => {
                    let empty = self.held.terms(t).is_some_and(|x| x.data.is_none());
                    return Answer::new(Word::TaskNo, "G11.6", if empty {
                        format!("the Terms {} name no data cMIP: no path beyond the leg (one leg)", short(t))
                    } else {
                        format!("the data cMIP of {} answers no for this reader", short(t))
                    })
                    .acts(asked.iter().copied());
                }
                Err(w) => return Answer::new(Word::Unchecked, "G11.6", w),
            }
        }
        Answer::new(Word::TaskYes, "G11.6", "the data cMIP of every Terms asked answers yes: this reader may read the report beyond its leg (K8)").acts(asked)
    }

    /// G11.7: the buyer's leg: the payment is the doer's half, the receiving
    /// side's confirmation the other; matched, mismatched, or one side only.
    pub fn buyer_leg(&self, payment: &Hash) -> Answer {
        let Some(p) = self.layers.money.as_ref().and_then(|m| m.payment(payment)) else { return Answer::new(Word::Unchecked, "G11.7", "the payment is not held (G9)") };
        let recv = self.receiver_for_payment(payment);
        let Some(Who::Signer(side)) = recv.who else {
            return Answer::new(recv.word, "G11.7", format!("the receiving side of the buyer's leg is not shown: {}", recv.says)).with(recv);
        };
        let said_payer = Said { who: SaidBy::Signer(p.payer), as_: "the payer, in its payment (the doer's half)".into(), act: Some(p.id) };
        let mut confirmations = self.reports_for(payment, None);
        confirmations.extend(self.reports_for(&p.settlement, None));
        let mut others = vec![];
        for (cid, cs, c) in &confirmations {
            if *cs != side {
                others.push(*cid);
                continue;
            }
            for l in c.lines.iter().flatten() {
                if let Line::Received { amount, by } = l {
                    if *by == p.settlement || self.layers.money.as_ref().and_then(|m| m.same_payment(by, &p.settlement)) == Some(true) {
                        let w = if *amount == p.amount { Word::Matched } else { Word::Mismatched };
                        return Answer::new(w, "G11.7", if w == Word::Matched {
                            format!("matched: the receiving side confirms the amount the payment states ({}); the payment is shown as received on the receiving side's word", amount.value)
                        } else {
                            format!("mismatched: the payment states {}, the receiving side's confirmation {}; both shown, neither chosen", p.amount.value, amount.value)
                        })
                        .acts([p.id, *cid])
                        .who(Who::Signer(side))
                        .said(said_payer)
                        .said(Said { who: SaidBy::Signer(*cs), as_: "the receiving side, in its confirmation".into(), act: Some(*cid) })
                        .disputed(recv.disputed);
                    }
                }
            }
        }
        let mut a = Answer::new(Word::OneSideOnly, "G11.7", "one side only: the receiving side has not confirmed the payment; it is not shown as received on the buyer's word alone (G8.3)").acts([p.id]).who(Who::Signer(side)).said(said_payer).disputed(recv.disputed);
        for o in others {
            a = a.with(Answer::new(Word::Shown, "G11.4", "listed, as its signer's word: a confirmation by someone who is not the receiving side ties nothing").acts([o]));
        }
        a
    }

    /// G11.4(e): before paying: for the agreement asked about and each one
    /// its receiver leads to, whether its Terms carry a call for reports,
    /// from whom, and whether they name a data cMIP.
    pub fn before_paying(&self, root: &Hash) -> Vec<Answer> {
        let mut out = vec![];
        let mut cur = *root;
        let mut seen = vec![];
        loop {
            if seen.contains(&cur) {
                break;
            }
            if seen.len() >= self.limits.receivers {
                out.push(Answer::new(Word::Unchecked, "G11.4", format!("the verifier stopped following receivers after {} agreements (G9.2)", seen.len())));
                break;
            }
            seen.push(cur);
            if self.held.terms(&cur).is_none() {
                out.push(Answer::new(Word::Unchecked, "G11.4", format!("this verifier lacks the acts of {} (G9)", short(&cur))));
                break;
            }
            let chain = self.chain(&cur);
            let Some(v) = chain.last() else {
                out.push(Answer::new(Word::NotShown, "G11.4", format!("no Terms of {} are in force", short(&cur))));
                break;
            };
            let t = self.held.terms(&v).unwrap();
            let call = self.k6_call(&v);
            let holds = self.holds_control(&v);
            let data = match &t.data {
                Some(s) => format!("a data cMIP is named ({}): its signers agreed to a path beyond the leg as it says", s.cmip.fp().map(|h| short(&h)).unwrap_or_default()),
                None => "no data cMIP is named: no path beyond the leg is agreed in these Terms".into(),
            };
            let callw = match (holds.word, call) {
                (Word::Shown, Some(f)) => format!("they carry a call for reports, from {}", ["the doer", "the receiving side", "both sides"][f as usize]),
                (Word::Shown, None) => "they hold the Control task and carry no call (no report called for)".into(),
                (Word::Unchecked, _) => format!("whether they hold the Control task is unchecked: {}", holds.says),
                _ => "they do not hold the Control task".into(),
            };
            let w = if holds.word == Word::Unchecked { Word::Unchecked } else { Word::Shown };
            out.push(Answer::new(w, "G11.4", format!("the Terms in force of {} ({}): {callw}; {data}", short(&cur), short(&v))).q(chain.qualifier).acts([v]));
            match t.receiver {
                Some(Receiver::Agreement(x)) => cur = x,
                _ => break,
            }
        }
        out
    }

    /// G11.8: a contest: what it is made against, whom it reaches, and whether
    /// it is a buyer's.
    pub fn contest(&self, c: &Hash) -> Answer {
        let Some(s) = self.held.statement(c) else { return Answer::new(Word::Unchecked, "G11.8", "the act is not held (G9)") };
        if s.kind != Kind::Contest {
            return Answer::new(Word::NotShown, "G11.8", "the act is not a contest");
        }
        let signer = self.held.get(c).unwrap().signer;
        let said = Said { who: SaidBy::Signer(signer), as_: "the signer of the contest: its word (G8.1)".into(), act: Some(*c) };
        let Some(v) = self.held.terms(&s.terms) else { return Answer::new(Word::Unchecked, "G11.8", "the version it is made against is not held (G9)") };
        let root = self.held.agreement_of(&s.terms).unwrap();
        if root != s.agreement {
            return Answer::new(Word::NotShown, "G11.8", "its `agreement` is not the root of the agreement of the Terms it names: not shown as made against them").said(said);
        }
        let chain = self.chain(&root);
        let disputed = chain.set_aside_of(&s.terms).is_some();
        if !chain.line.contains(&s.terms) && !disputed {
            return Answer::new(Word::NotShown, "G11.8", "the Terms it names are not shown as a version of that offer or vow, nor as a tip set aside: the contest is not shown").said(said);
        }
        let reaches: Vec<Hash> = v.parties.iter().flatten().filter_map(|p| if let Party::Signer(h) = p { Some(*h) } else { None }).collect();
        let roles = v.parties.iter().flatten().any(|p| matches!(p, Party::Role(_)));
        let mut a = Answer::new(Word::Shown, "G11.8", format!(
            "a contest made against the version {}: it reaches the {} parties that version names as signers, and no one else (a signer who fills a role is not counted); {}",
            short(&s.terms),
            reaches.len(),
            if roles { "that version names a party by role, which changes no answer" } else { "that version names no party by role" }
        ))
        .q(Qualifier::AsShown)
        .acts(std::iter::once(s.terms).chain(reaches.iter().copied()))
        .said(said)
        .disputed(disputed);
        if let Some(st) = s.settlement {
            let pay = self.layers.money.as_ref().and_then(|m| m.payments().into_iter().find(|p| p.payer == signer && p.settlement == st && p.version == s.terms));
            a = a.with(match pay {
                Some(p) => Answer::new(Word::Shown, "G11.8", "a buyer's contest: the verifier holds a payment by the same signer that names the same settlement and the same version; that what was bought was not delivered is the buyer's word (G8.1)").acts([p.id]),
                None => Answer::new(Word::Unchecked, "G11.8", "the verifier holds no payment by the same signer naming the same settlement and version: whether the contest is a buyer's is unchecked (G9)"),
            });
        }
        if let Some(ft) = self.stopped(c, None) {
            a.word = Word::NotShown;
            a.says = format!("the contest counts for nothing while the fork stands: {ft}");
        }
        a
    }
}
