//! The checks the bytes alone allow, for one act or for the acts a verifier
//! holds (`encoding-1.md`, "What the checker answers").
//!
//! In plain words: given an act's bytes (and its content key, if it is
//! private), say whether it is an act of this encoding; whether its shape,
//! its fields and its signature pass; and if not, which rule it fails. The
//! order is the act format's own (Envelopes, "Every act": the outside, the
//! lock, the inside, its shape and text), then the signature, then the
//! payload, then what the payload shows by itself to the grammar rules.
//! Invalid beats unknown: a signature scheme this library does not implement
//! makes the act **unknown** only where nothing else fails.

use super::{report::Report, statement::Statement, terms::Terms, Finding, Rejected, SPEC_DRAFT_24, SPEC_REPORT_BLOCK_3};
use crate::act::{Act, ActError, Inside};
use crate::hash::Hash;
use crate::lock::ContentKey;
use crate::sig;

/// The checker's answer (encoding-1, E23 and "What the checker answers").
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Verdict {
    /// Shape, fields and signature pass, and the act shows no invalid case by
    /// itself. The grammar's answers are not given here.
    Pass,
    /// Draft 24's **rejected**: no Agreements act (the core's "invalid as an
    /// act": outside its specification's format, or its act format refused).
    Rejected,
    /// Draft 24's **invalid**: an act of this encoding whose bytes show, by
    /// themselves or among the acts held, that it cannot count.
    Invalid,
    /// A signature scheme this library does not implement (Identity,
    /// "Signature schemes"), with nothing else failing.
    Unknown,
    /// A private act and no key to open it: nothing can be said of its inside.
    Unopened,
    /// An act, of another specification or type than this encoding's.
    NotThisEncoding,
}

impl Verdict {
    pub fn word(self) -> &'static str {
        match self {
            Verdict::Pass => "pass",
            Verdict::Rejected => "rejected",
            Verdict::Invalid => "invalid",
            Verdict::Unknown => "unknown",
            Verdict::Unopened => "cannot open",
            Verdict::NotThisEncoding => "not this encoding",
        }
    }
}

/// Which act of this encoding it is.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Decoded {
    Terms(Terms),
    Statement(Statement),
    Report(Report),
}

impl Decoded {
    pub fn word(&self) -> &'static str {
        match self {
            Decoded::Terms(_) => "Terms",
            Decoded::Statement(_) => "Statement",
            Decoded::Report(_) => "report",
        }
    }
}

/// The answer about one act.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Answer {
    pub verdict: Verdict,
    /// The act's id, where its bytes are an act.
    pub id: Option<Hash>,
    /// Its signer, where its outside names one.
    pub signer: Option<Hash>,
    /// What it is, where its payload decoded.
    pub act: Option<Decoded>,
    /// The rule failed first: an E rule of encoding-1, an Envelopes or
    /// Identity rule, or a grammar rule of draft 24. `None` for a pass.
    pub rule: Option<String>,
    /// In plain words.
    pub says: String,
    /// Every invalid case found (the first is `rule`).
    pub invalid: Vec<Finding>,
    /// What was left unread, and answers the act already gives by itself.
    pub notes: Vec<Finding>,
}

impl Answer {
    fn stop(verdict: Verdict, id: Option<Hash>, signer: Option<Hash>, rule: &str, says: impl Into<String>) -> Answer {
        Answer { verdict, id, signer, act: None, rule: Some(rule.into()), says: says.into(), invalid: vec![], notes: vec![] }
    }

    fn rejected(id: Option<Hash>, signer: Option<Hash>, r: Rejected) -> Answer {
        Answer::stop(Verdict::Rejected, id, signer, r.rule, r.says)
    }

    /// The `previous` this act names, where it is a Terms act or a Statement.
    pub fn previous(&self) -> Option<Hash> {
        match &self.act {
            Some(Decoded::Terms(t)) => t.previous,
            Some(Decoded::Statement(s)) => s.previous,
            _ => None,
        }
    }

    /// The agreement this act is within: a Statement's `agreement`; a Terms
    /// act's `agreement`, or for the first Terms act its own id (the root).
    pub fn agreement(&self) -> Option<Hash> {
        match &self.act {
            Some(Decoded::Terms(t)) => t.agreement.or(self.id),
            Some(Decoded::Statement(s)) => Some(s.agreement),
            _ => None,
        }
    }
}

fn envelopes_rule(e: &ActError) -> &'static str {
    match e {
        ActError::Text(_) => "Envelopes rule 5",
        ActError::LockedHash | ActError::Unlock | ActError::InsideCommitment => "Envelopes rule 3",
        ActError::Cbor(crate::cbor::CborError::TooDeep) => "Envelopes rule 2",
        _ => "Envelopes rule 1",
    }
}

/// Check one act's bytes. `key` opens a private act.
pub fn check(bytes: &[u8], key: Option<&ContentKey>) -> Answer {
    let act = match Act::decode(bytes) {
        Ok(a) => a,
        Err(e) => return Answer::stop(Verdict::Rejected, None, None, envelopes_rule(&e), format!("the bytes are not an act of the act format in force: {e}")),
    };
    let id = Some(act.id());
    let signer = act.outside.signer;
    let inside = match act.open(key) {
        Ok(i) => i,
        Err(ActError::NoKey) => {
            return Answer::stop(Verdict::Unopened, id, signer, "Envelopes rule 10", "a private act, and no content key to open it: nothing can be said of its inside")
        }
        Err(e) => return Answer::stop(Verdict::Rejected, id, signer, envelopes_rule(&e), format!("the act does not open as the act format asks: {e}")),
    };
    let which = match (inside.spec, inside.type_) {
        (s, super::types::TERMS) if s == SPEC_DRAFT_24 => 0,
        (s, super::types::STATEMENT) if s == SPEC_DRAFT_24 => 1,
        (s, super::types::REPORT) if s == SPEC_REPORT_BLOCK_3 => 2,
        (s, t) if s == SPEC_DRAFT_24 => {
            return Answer::stop(Verdict::Rejected, id, signer, "E2", format!("draft 24's specification defines types 0 (Terms) and 1 (Statement), not {t}"))
        }
        (s, t) if s == SPEC_REPORT_BLOCK_3 => {
            return Answer::stop(Verdict::Rejected, id, signer, "E2", format!("the report block's proposal defines type 0 (report), not {t}"))
        }
        _ => {
            return Answer::stop(
                Verdict::NotThisEncoding,
                id,
                signer,
                "E2",
                "the act names another specification than draft 24's or the report block's: not an act of this encoding",
            )
        }
    };
    if signer.is_none() {
        return Answer::stop(Verdict::Rejected, id, signer, "E1", "an act of this encoding is an everyday act: its outside names its signer");
    }
    if let Err(r) = everyday(&inside) {
        return Answer::rejected(id, signer, r);
    }
    let sig_verdict = sig::verify(&act.signature, &act.id());
    if sig_verdict == sig::Verdict::Invalid {
        return Answer::stop(Verdict::Rejected, id, signer, "E1", "the signature does not verify over the act id with the key it carries (Identity, \"Signature schemes\")");
    }
    let decoded = match which {
        0 => Terms::from_payload(&inside.payload).map(Decoded::Terms),
        1 => Statement::from_payload(&inside.payload).map(Decoded::Statement),
        _ => Report::from_payload(&inside.payload).map(Decoded::Report),
    };
    let decoded = match decoded {
        Ok(d) => d,
        Err(r) => return Answer::rejected(id, signer, r),
    };
    let (invalid, notes) = match &decoded {
        Decoded::Terms(t) => t.grammar(),
        Decoded::Statement(s) => s.grammar(),
        Decoded::Report(_) => (vec![], vec![]),
    };
    let mut a = Answer { verdict: Verdict::Pass, id, signer, act: Some(decoded), rule: None, says: String::new(), invalid, notes };
    if let Some(f) = a.invalid.first() {
        a.verdict = Verdict::Invalid;
        a.rule = Some(f.rule.into());
        a.says = f.says.clone();
    } else if sig_verdict == sig::Verdict::Unknown {
        a.verdict = Verdict::Unknown;
        a.rule = Some("E1".into());
        a.says = "a signature scheme this library does not implement: the act is unknown, never valid (Identity, \"Signature schemes\")".into();
    } else {
        a.says = format!(
            "a {} act of this encoding: its shape, fields and signature pass (the signature verifies with the key the act carries; that the key is its signer's is the identity chain's to show, and is not checked here)",
            a.act.as_ref().unwrap().word()
        );
        if let Some(Decoded::Report(_)) = &a.act {
            a.says.push_str(" (the report is a proposal, as the block is)");
        }
    }
    a
}

/// The act format's own rules for an everyday act that the act does not
/// check by its shape (E1, E3): `prev` present with at most one entry
/// (Envelopes rule 13); no `objects` and no `acks`.
fn everyday(inside: &Inside) -> Result<(), Rejected> {
    match &inside.prev {
        None => return super::rej("Envelopes rule 13", "an everyday act carries prev (empty for the first act of a sequence)"),
        Some(p) if p.len() > 1 => return super::rej("Envelopes rule 13", "an everyday act's prev carries at most one entry"),
        _ => {}
    }
    if inside.objects.is_some() {
        return super::rej("E3", "an act of this encoding carries no objects: its lines are in its payload (replaces, previous)");
    }
    if inside.acks.is_some() {
        return super::rej("E3", "an act of this encoding carries no acks: what it names is in its payload");
    }
    Ok(())
}

/// Check the acts a verifier holds: each alone ([`check`]), then G6.1 among
/// them. An act whose `previous` names, among the acts held, anything that is
/// not an act of the same signer within the same agreement is invalid; where
/// `previous` names nothing held, the act counts and its line is unchecked
/// before it (a note).
pub fn check_held(acts: &[(&[u8], Option<&ContentKey>)]) -> Vec<Answer> {
    let mut answers: Vec<Answer> = acts.iter().map(|(b, k)| check(b, *k)).collect();
    let held: Vec<(Option<Hash>, Option<Hash>, Option<Hash>, bool, bool)> = answers
        .iter()
        .map(|a| {
            let agreement_act = matches!(a.act, Some(Decoded::Terms(_) | Decoded::Statement(_)));
            (a.id, a.signer, a.agreement(), agreement_act, a.verdict == Verdict::Unopened)
        })
        .collect();
    for a in answers.iter_mut() {
        if !matches!(a.verdict, Verdict::Pass | Verdict::Invalid | Verdict::Unknown) {
            continue;
        }
        let Some(p) = a.previous() else { continue };
        match held.iter().find(|(id, ..)| *id == Some(p)) {
            None => a.notes.push(Finding::new("G6.1", "previous names an act this verifier does not hold: the act counts, and its signer's line is unchecked before it (G6.1)")),
            Some((.., true)) => a.notes.push(Finding::new(
                "G6.1",
                "previous names a private act held without its key: what it is cannot be read, so the signer's line before this act is unchecked (G6.1, G9)",
            )),
            Some((_, s, ag, is_agreement_act, _)) => {
                let why = if !is_agreement_act {
                    Some("an act that is no Terms act and no Statement")
                } else if *s != a.signer {
                    Some("an act of another signer")
                } else if *ag != a.agreement() {
                    Some("an act within another agreement")
                } else {
                    None
                };
                if let Some(why) = why {
                    let f = Finding::new("G6.1", format!("previous names, among the acts held, {why}, so this act is invalid (G6.1)"));
                    if a.verdict != Verdict::Invalid {
                        a.verdict = Verdict::Invalid;
                        a.rule = Some(f.rule.into());
                        a.says = f.says.clone();
                    }
                    a.invalid.push(f);
                }
            }
        }
    }
    answers
}
