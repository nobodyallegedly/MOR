//! A verifier's answers (draft 24, section 2, "Answers"), their qualifiers,
//! and whose word each rests on (G8).
//!
//! In plain words: every answer is one word from draft 24's short list
//! (shown, not shown, fork, valid, not valid, invalid, unchecked), always
//! with the grammar rule it comes from, a qualifier where it is about what
//! is latest or what time it was (per place, per clock, per anchoring, as
//! shown), the mark **disputed** where it rests on what someone relied on in
//! a branch set aside (G12.5), and the names of whoever said what it rests
//! on (G8). Two more families are kept apart, as draft 24 keeps them: a
//! task's own output, passed on with its cMIP named (section 2, "A task's
//! output"), and the report block's words (matched, mismatched, one side
//! only, unanswered, no report called for), which are not answers of draft
//! 24 (section 2, last paragraph).

use crate::agreements_new::Who;
use crate::hash::Hash;
use serde_like::Json;

/// The answer word (draft 24, section 2).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Word {
    /// The acts held establish it under these grammar rules.
    Shown,
    /// The acts held do not establish it; an act not held might.
    NotShown,
    /// Two acts are a fork (G12).
    Fork,
    /// Said of a proposed update only: the update condition, or the default,
    /// answers that the agreement can be updated so (G4.11).
    Valid,
    /// Said of a proposed update only: the update condition answers that it
    /// cannot (G4.11(c)). Never given by the default.
    NotValid,
    /// An act that itself shows it cannot count (section 2).
    Invalid,
    /// The verifier could not apply a rule it needed (G9).
    Unchecked,
    /// A task's own output, passed on as the task's and not as an answer of
    /// draft 24 (section 2, "A task's output"): yes.
    TaskYes,
    /// A task's own output: no.
    TaskNo,
    /// The report block's words (section 2, last paragraph; G11.4): not
    /// answers of draft 24.
    Matched,
    Mismatched,
    OneSideOnly,
    Unanswered,
    NoReportCalledFor,
}

impl Word {
    pub fn word(self) -> &'static str {
        match self {
            Word::Shown => "shown",
            Word::NotShown => "not shown",
            Word::Fork => "fork",
            Word::Valid => "valid",
            Word::NotValid => "not valid",
            Word::Invalid => "invalid",
            Word::Unchecked => "unchecked",
            Word::TaskYes => "yes (the task's output)",
            Word::TaskNo => "no (the task's output)",
            Word::Matched => "matched",
            Word::Mismatched => "mismatched",
            Word::OneSideOnly => "one side only",
            Word::Unanswered => "unanswered",
            Word::NoReportCalledFor => "no report called for",
        }
    }

    /// Whether the word is one of draft 24's own answers, rather than a
    /// task's output or the report block's word.
    pub fn is_draft_24s(self) -> bool {
        matches!(self, Word::Shown | Word::NotShown | Word::Fork | Word::Valid | Word::NotValid | Word::Invalid | Word::Unchecked)
    }
}

/// What an answer about what is latest, what else exists or what time it
/// was stands on (section 2; G7, G13.4).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Qualifier {
    /// No qualifier: the answer rests only on acts named by fingerprint
    /// (an order from citing, G13.3; the holder at an act, G14.1), or is not
    /// about what is latest.
    None,
    /// Among the acts this verifier happens to hold.
    AsShown,
    /// Per the place the Terms name, by its identifier.
    PerPlace(Hash),
    /// Per the clock the Terms name.
    PerClock(Hash),
    /// Per an anchoring the reader accepts, where the agreement names none.
    PerAnchoring(Hash),
}

impl Qualifier {
    pub fn word(&self) -> String {
        match self {
            Qualifier::None => "none".into(),
            Qualifier::AsShown => "as shown".into(),
            Qualifier::PerPlace(h) => format!("per place {}", short(h)),
            Qualifier::PerClock(h) => format!("per clock {}", short(h)),
            Qualifier::PerAnchoring(h) => format!("per anchoring {}", short(h)),
        }
    }
}

/// Whose word an answer rests on (G8): who stated it, and as what.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Said {
    /// Who: a signer by identity hash, an agreement by root, or a layer or
    /// cMIP named by its fingerprint or identifier.
    pub who: SaidBy,
    /// As what, in plain words: "the signer of the report", "the place",
    /// "the envelope's chain", "the spot's cMIP".
    pub as_: String,
    /// The act it said it in, where there is one.
    pub act: Option<Hash>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SaidBy {
    Signer(Hash),
    Agreement(Hash),
    /// A cMIP, by its spec hash.
    Cmip(Hash),
    /// A place, by its identifier.
    Place(Hash),
    /// A clock, by its identifier.
    Clock(Hash),
    /// The layer below's envelope chain (section 8.1), for an envelope.
    EnvelopeChain(Hash),
    /// The layer that holds value (Money).
    Money,
}

impl From<Who> for SaidBy {
    fn from(w: Who) -> SaidBy {
        match w {
            Who::Signer(h) => SaidBy::Signer(h),
            Who::Agreement(h) => SaidBy::Agreement(h),
        }
    }
}

/// One answer of the verifier.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Answer {
    /// The word.
    pub word: Word,
    /// The grammar rule it comes from (G4.6, G14.3 and so on).
    pub rule: &'static str,
    pub qualifier: Qualifier,
    /// Rests on what someone relied on in a branch set aside (G12.5).
    pub disputed: bool,
    /// In plain words, with the reason.
    pub says: String,
    /// The acts the answer names: the Terms in force, the tips of a fork,
    /// the act that shows an update late, a filling's proof.
    pub acts: Vec<Hash>,
    /// Who, where the answer is a person or an agreement: the receiver, the
    /// holder of the baker's rights, the one who fills a spot.
    pub who: Option<Who>,
    /// A task's cMIP that gave the answer, or the words "by default" where
    /// the socket is empty and the default answered (G4.11, section 2).
    pub cmip: Option<CmipNamed>,
    /// Whose word it rests on (G8).
    pub said: Vec<Said>,
    /// Answers shown beside this one: the fork shown with an answer from the
    /// last shared version (G4.7(e)), the baker's answer (G14.3), other bakes
    /// of the same work (G14.5).
    pub with: Vec<Answer>,
}

/// A cMIP named beside an answer, or the default.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CmipNamed {
    Cmip { task: &'static str, fingerprint: Hash, ground: String },
    ByDefault { task: &'static str },
}

impl Answer {
    pub fn new(word: Word, rule: &'static str, says: impl Into<String>) -> Answer {
        Answer {
            word,
            rule,
            qualifier: Qualifier::None,
            disputed: false,
            says: says.into(),
            acts: vec![],
            who: None,
            cmip: None,
            said: vec![],
            with: vec![],
        }
    }

    pub fn q(mut self, q: Qualifier) -> Answer {
        self.qualifier = q;
        self
    }

    pub fn acts(mut self, a: impl IntoIterator<Item = Hash>) -> Answer {
        self.acts.extend(a);
        self
    }

    pub fn who(mut self, w: Who) -> Answer {
        self.who = Some(w);
        self
    }

    pub fn cmip(mut self, c: CmipNamed) -> Answer {
        self.cmip = Some(c);
        self
    }

    pub fn said(mut self, s: Said) -> Answer {
        self.said.push(s);
        self
    }

    pub fn with(mut self, a: Answer) -> Answer {
        self.with.push(a);
        self
    }

    pub fn disputed(mut self, d: bool) -> Answer {
        self.disputed |= d;
        self
    }

    /// The answer as JSON, for the vectors and the binding.
    pub fn to_json(&self) -> Json {
        let mut o = vec![
            ("word", Json::s(self.word.word())),
            ("rule", Json::s(self.rule)),
            ("qualifier", Json::s(&self.qualifier.word())),
            ("disputed", Json::B(self.disputed)),
            ("acts", Json::A(self.acts.iter().map(|h| Json::s(&hex(h))).collect())),
            ("who", self.who.map(who_json).unwrap_or(Json::Null)),
        ];
        o.push((
            "cmip",
            match &self.cmip {
                None => Json::Null,
                Some(CmipNamed::ByDefault { task }) => Json::O(vec![("task", Json::s(task)), ("by_default", Json::B(true))]),
                Some(CmipNamed::Cmip { task, fingerprint, ground }) => {
                    Json::O(vec![("task", Json::s(task)), ("fingerprint", Json::s(&hex(fingerprint))), ("ground", Json::s(ground))])
                }
            },
        ));
        o.push(("said", Json::A(self.said.iter().map(said_json).collect())));
        o.push(("with", Json::A(self.with.iter().map(Answer::to_json).collect())));
        o.push(("says", Json::s(&self.says)));
        Json::O(o)
    }
}

fn who_json(w: Who) -> Json {
    match w {
        Who::Signer(h) => Json::O(vec![("signer", Json::s(&hex(&h)))]),
        Who::Agreement(h) => Json::O(vec![("agreement", Json::s(&hex(&h)))]),
    }
}

fn said_json(s: &Said) -> Json {
    let (k, h) = match s.who {
        SaidBy::Signer(h) => ("signer", Some(h)),
        SaidBy::Agreement(h) => ("agreement", Some(h)),
        SaidBy::Cmip(h) => ("cmip", Some(h)),
        SaidBy::Place(h) => ("place", Some(h)),
        SaidBy::Clock(h) => ("clock", Some(h)),
        SaidBy::EnvelopeChain(h) => ("envelope chain", Some(h)),
        SaidBy::Money => ("money", None),
    };
    Json::O(vec![
        ("by", Json::s(k)),
        ("id", h.map(|h| Json::s(&hex(&h))).unwrap_or(Json::Null)),
        ("as", Json::s(&s.as_)),
        ("act", s.act.map(|h| Json::s(&hex(&h))).unwrap_or(Json::Null)),
    ])
}

pub(crate) fn hex(h: &Hash) -> String {
    h.iter().map(|b| format!("{b:02x}")).collect()
}

pub(crate) fn short(h: &Hash) -> String {
    hex(h)[..12].to_string()
}

/// A small JSON value, so that the core library needs no JSON dependency:
/// the vectors and the binding print it.
pub mod serde_like {
    #[derive(Clone, Debug, PartialEq, Eq)]
    pub enum Json {
        Null,
        B(bool),
        N(u64),
        S(String),
        A(Vec<Json>),
        O(Vec<(&'static str, Json)>),
    }

    impl Json {
        pub fn s(s: &str) -> Json {
            Json::S(s.to_string())
        }

        /// Compact JSON text.
        pub fn text(&self) -> String {
            let mut out = String::new();
            self.write(&mut out);
            out
        }

        fn write(&self, out: &mut String) {
            match self {
                Json::Null => out.push_str("null"),
                Json::B(b) => out.push_str(if *b { "true" } else { "false" }),
                Json::N(n) => out.push_str(&n.to_string()),
                Json::S(s) => quote(s, out),
                Json::A(a) => {
                    out.push('[');
                    for (i, x) in a.iter().enumerate() {
                        if i > 0 {
                            out.push(',');
                        }
                        x.write(out);
                    }
                    out.push(']');
                }
                Json::O(o) => {
                    out.push('{');
                    for (i, (k, v)) in o.iter().enumerate() {
                        if i > 0 {
                            out.push(',');
                        }
                        quote(k, out);
                        out.push(':');
                        v.write(out);
                    }
                    out.push('}');
                }
            }
        }
    }

    fn quote(s: &str, out: &mut String) {
        out.push('"');
        for c in s.chars() {
            match c {
                '"' => out.push_str("\\\""),
                '\\' => out.push_str("\\\\"),
                '\n' => out.push_str("\\n"),
                c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
                c => out.push(c),
            }
        }
        out.push('"');
    }
}
