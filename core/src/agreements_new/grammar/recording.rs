//! A wrapper that records every question a verifier asks of the cMIPs it
//! holds, and the answer each gave: the vectors list them as "the stubs'
//! answers", so that a second reader can check the grammar's answers without
//! running the stubs.

use super::held::Held;
use super::sockets::{Ask, Cmip, Cmips, Out};
use crate::cbor::Value;
use crate::hash::Hash;
use std::cell::RefCell;
use std::rc::Rc;

/// One question asked of a cMIP, and its answer.
#[derive(Clone, Debug)]
pub struct Asked {
    pub cmip: Hash,
    pub name: String,
    pub task: &'static str,
    /// The acts the question is about (the Terms, the proposed update, the
    /// act asked about), in the order the task gives them.
    pub about: Vec<Hash>,
    pub answer: String,
}

pub type Log = Rc<RefCell<Vec<Asked>>>;

struct Rec {
    fp: Hash,
    inner: Box<dyn Cmip>,
    log: Log,
}

impl Cmip for Rec {
    fn name(&self) -> &str {
        self.inner.name()
    }
    fn ask(&self, params: &Value, ask: &Ask, held: &Held) -> Out {
        let out = self.inner.ask(params, ask, held);
        let about = match ask {
            Ask::Body { terms } | Ask::InForce { terms, .. } | Ask::Spot { terms, .. } | Ask::Control { terms } => vec![*terms],
            Ask::Power { terms, act, .. } => vec![*terms, *act],
            Ask::Update { original, proposed, .. } => vec![*original, *proposed],
            Ask::FillingRights { earned_under, later, .. } => vec![*earned_under, *later],
            Ask::Kind { statement } => vec![*statement],
            Ask::Data { terms, report, call, .. } => std::iter::once(*terms).chain(*report).chain(*call).collect(),
        };
        let answer = match &out {
            Out::YesNo { yes, .. } => if *yes { "yes" } else { "no" }.to_string(),
            Out::Update { valid, .. } => if *valid { "valid" } else { "not valid" }.to_string(),
            Out::Body(b) => format!("parts {:?}{}", b.parts, if b.delegation.is_some() { ", a delegation" } else { "" }),
            Out::Spot(s) => format!("{} filling(s), {}", s.fillings.len(), if s.takes_new { "takes new identities" } else { "takes no new identities" }),
            Out::Kind { meaning } => meaning.clone(),
            Out::CannotAnswer(w) => format!("cannot answer: {w}"),
        };
        let e = Asked { cmip: self.fp, name: self.inner.name().to_string(), task: ask.task().word(), about, answer };
        let mut l = self.log.borrow_mut();
        if !l.iter().any(|x| x.cmip == e.cmip && x.task == e.task && x.about == e.about && x.answer == e.answer) {
            l.push(e);
        }
        out
    }
}

/// The stubs, each wrapped so that what it is asked is recorded.
pub fn recorded_stubs() -> (Cmips, Log) {
    let log: Log = Rc::new(RefCell::new(vec![]));
    let mut c = Cmips::new();
    use super::stubs::*;
    let list: Vec<(&str, Box<dyn Cmip>)> = vec![
        (name::BODY, Box::new(StubBody)),
        (name::IN_FORCE, Box::new(StubInForce)),
        (name::POWER, Box::new(StubPower)),
        (name::CONDITION, Box::new(StubCondition)),
        (name::SPOT, Box::new(StubSpot)),
        (name::CONTROL, Box::new(StubControl)),
        (name::KIND, Box::new(StubKind)),
        (name::DATA, Box::new(StubData)),
    ];
    for (n, s) in list {
        c.hold(fp(n), Box::new(Rec { fp: fp(n), inner: s, log: log.clone() }));
    }
    (c, log)
}
