//! The grammar verifier of the new Agreements (draft 24, section 4).
//!
//! In plain words: the encoding's checker ([`super::check`]) says whether
//! one act is well formed and signed. This module reads a **set** of acts
//! and gives the grammar's answers, grammar rule by grammar rule: which
//! Terms are in force, whether two acts are a fork, who receives, whether a
//! Terms act is a late update, whether a party is bound, whether Terms for a
//! baked work count, and the rest. Every answer names the grammar rule it
//! comes from, carries its qualifier (per place, per clock, per anchoring,
//! as shown), the mark **disputed** where it rests on what someone relied on
//! in a branch set aside, and the names of whoever said what it rests on
//! (G8).
//!
//! Precisely:
//!
//! - every socket (K1 to K8) is a plug-in behind one interface
//!   ([`sockets::Cmip`]); with the cMIP held, its answer is used, with none,
//!   the answer is **unchecked** (G9). Stub cMIPs, for tests only, are in
//!   [`stubs`];
//! - every layer draft 24 leans on and that does not exist yet (a place, a
//!   clock, the envelope's chain, Money) is behind one small interface with a
//!   test stand-in ([`layers`]);
//! - the verifier never computes a task's answer itself, never chooses
//!   between the tips of a fork, and never answers "ended", "locked",
//!   "triggered" or "no longer applies" (G4.9, G4.11(i), G10.7).
//!
//! Where draft 24 had to be read, the reading taken is recorded in
//! `docs/agreements-from-scratch/verifier-1-report.md` as a question. Nothing
//! here reads or changes the earlier Agreements module.

pub mod answer;
mod baker;
mod chain;
mod force;
pub mod held;
pub mod layers;
mod legs;
mod line;
mod order;
mod receiver;
pub mod recording;
pub mod scenario;
pub mod cases;
pub mod sockets;
mod spots;
pub mod stubs;

pub use answer::{Answer, CmipNamed, Qualifier, Said, SaidBy, Word};
pub use chain::{Chain, End, Outcome, Step};
pub use held::{Held, HeldAct};
pub use layers::{ChainSays, Layers, Payment, PlaceSays};
pub use line::{LineFork, Lines};
pub use sockets::{Ask, Cmip, Cmips, Counted, Out, Task};

use crate::agreements_new::{Socket, Who};
use crate::hash::Hash;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::rc::Rc;

/// On whose behalf the verifier reads, and the anchoring the reader accepts
/// (draft 24, G11.4(d): "On whose behalf a verifier reads is not in the acts:
/// whoever asks tells it"; G13.4). A verifier told nothing reads as no side of
/// any leg, and accepts no anchoring of its own.
#[derive(Clone, Debug, Default)]
pub struct Reader {
    pub on_behalf_of: Option<Who>,
    /// The anchoring the reader accepts, by the identifier of a place held in
    /// the verifier's layers; used only where the agreement names neither a
    /// place nor a clock (G13.4).
    pub anchoring: Option<Hash>,
}

/// How far the verifier follows before it stops (G9.2; P2, P8). Past each, it
/// answers **unchecked**, and says how far it followed.
#[derive(Clone, Copy, Debug)]
pub struct Limits {
    /// Receivers from agreement to agreement (G1.4; P8).
    pub receivers: usize,
    /// Readings of counter signatures that lean on one another (G9.2).
    pub counter_signatures: usize,
    /// Agreements whose acts are read to answer about another (powers
    /// through powers, an agreement's signature; P2).
    pub nesting: usize,
}

impl Default for Limits {
    fn default() -> Limits {
        Limits { receivers: 8, counter_signatures: 4, nesting: 8 }
    }
}

/// A three-valued result with reasons, used inside the verifier.
#[derive(Clone, Debug, PartialEq, Eq)]
pub(crate) enum Tri {
    Yes,
    No(String),
    NotShown(String),
    Unchecked(String),
}

impl Tri {
    pub(crate) fn yes(&self) -> bool {
        matches!(self, Tri::Yes)
    }
}

/// Which acts are counted for one reading: those a place shows (at or
/// before a position), only those named from one act, all but those that
/// name one act; and an assent read as not yet cancelled (G4.10).
#[derive(Clone, Debug, Default)]
pub(crate) struct Scope {
    pub place: Option<Hash>,
    pub upto: Option<u64>,
    pub clock: Option<Hash>,
    pub until: Option<u64>,
    pub only: Option<Rc<HashSet<Hash>>>,
    pub without: Option<Rc<HashSet<Hash>>>,
    pub uncancel: Option<Hash>,
    pub depth: usize,
}

impl Scope {
    pub(crate) fn only(&self, s: HashSet<Hash>) -> Scope {
        let s = match &self.only {
            Some(o) => o.intersection(&s).copied().collect(),
            None => s,
        };
        Scope { only: Some(Rc::new(s)), ..self.clone() }
    }

    pub(crate) fn without(&self, s: HashSet<Hash>) -> Scope {
        let s = match &self.without {
            Some(o) => o.union(&s).copied().collect(),
            None => s,
        };
        Scope { without: Some(Rc::new(s)), ..self.clone() }
    }

    pub(crate) fn deeper(&self) -> Scope {
        Scope { depth: self.depth + 1, ..self.clone() }
    }

    /// The scope without any order or filter: for a reading that does not
    /// depend on what is latest.
    pub(crate) fn plain(&self) -> Scope {
        Scope { depth: self.depth, ..Scope::default() }
    }
}

/// The grammar verifier: the acts held, the cMIPs held, the layers, and the
/// reader.
pub struct Verifier<'a> {
    pub held: &'a Held,
    pub cmips: &'a Cmips,
    pub layers: &'a Layers,
    pub reader: Reader,
    pub limits: Limits,
    chains: RefCell<HashMap<Hash, Rc<Chain>>>,
    walking: RefCell<HashSet<Hash>>,
    lines: RefCell<Option<Rc<Lines>>>,
}

impl<'a> Verifier<'a> {
    pub fn new(held: &'a Held, cmips: &'a Cmips, layers: &'a Layers) -> Verifier<'a> {
        Verifier {
            held,
            cmips,
            layers,
            reader: Reader::default(),
            limits: Limits::default(),
            chains: RefCell::new(HashMap::new()),
            walking: RefCell::new(HashSet::new()),
            lines: RefCell::new(None),
        }
    }

    pub fn with_reader(mut self, r: Reader) -> Verifier<'a> {
        self.reader = r;
        self
    }

    pub fn with_limits(mut self, l: Limits) -> Verifier<'a> {
        self.limits = l;
        self
    }

    // ------------------------------------------------------------ sockets

    /// Ask the cMIP in a socket (section 5). `Err` is unchecked (G9): the
    /// cMIP is not named by fingerprint, or not held, or cannot answer.
    pub(crate) fn ask(&self, s: &Socket, ask: Ask) -> Result<(Out, Hash), String> {
        let task = ask.task().word();
        let Some(fp) = s.cmip.fp() else { return Err(format!("the cMIP of {task} is not named by fingerprint")) };
        let Some(c) = self.cmips.get(&fp) else {
            return Err(format!("this verifier does not hold the cMIP of {task} ({}), so it cannot apply it (G9)", answer::short(&fp)));
        };
        match c.ask(&s.params, &ask, self.held) {
            Out::CannotAnswer(why) => Err(format!("the cMIP of {task} ({}) cannot answer: {why}", c.name())),
            o => Ok((o, fp)),
        }
    }

    // ------------------------------------------------------------ the place and the order

    /// Whether an act counts in a scope: shown by the place at or before the
    /// position (G7.2), within the clock's time, and in the act filters.
    /// `Err` is unchecked: no answer from the place (G7.2, G9).
    pub(crate) fn counts(&self, scope: &Scope, id: &Hash) -> Result<bool, String> {
        if scope.only.as_ref().is_some_and(|o| !o.contains(id)) {
            return Ok(false);
        }
        if scope.without.as_ref().is_some_and(|w| w.contains(id)) {
            return Ok(false);
        }
        if let Some(p) = scope.place {
            let Some(place) = self.layers.places.get(&p) else { return Err(format!("this verifier has no answer from the place {}", answer::short(&p))) };
            match place.position(id) {
                PlaceSays::At(n) => {
                    if scope.upto.is_some_and(|u| n > u) {
                        return Ok(false);
                    }
                }
                PlaceSays::NotShown => return Ok(false),
                PlaceSays::Contradicts => return Err(format!("the verifier holds two answers of the place {} that contradict each other (G7.2)", answer::short(&p))),
            }
        }
        if let (Some(c), Some(t)) = (scope.clock, scope.until) {
            let Some(clock) = self.layers.clocks.get(&c) else { return Err(format!("this verifier has no answer from the clock {}", answer::short(&c))) };
            match clock.time(id) {
                Some(x) if x <= t => {}
                _ => return Ok(false),
            }
        }
        Ok(true)
    }

    /// The scope and qualifier for answers about what is latest in an
    /// agreement whose relevant version is `t`: per the place `t` names
    /// (G7.2, G4.6, G4.8(d)); else per the anchoring the reader accepts,
    /// where the Terms name no clock either (G13.4); else as shown (G7.3).
    pub(crate) fn scope_of(&self, t: &Hash) -> Result<(Scope, Qualifier), String> {
        let terms = self.held.terms(t);
        if let Some(p) = terms.and_then(|t| t.place) {
            if !self.layers.places.contains_key(&p) {
                return Err(format!("the Terms name the place {}, and this verifier has no answer from it (G7.2, G9)", answer::short(&p)));
            }
            return Ok((Scope { place: Some(p), ..Scope::default() }, Qualifier::PerPlace(p)));
        }
        if terms.and_then(|t| t.clock).is_none() {
            if let Some(a) = self.reader.anchoring {
                if !self.layers.places.contains_key(&a) {
                    return Err(format!("the reader accepts the anchoring {}, and this verifier holds no answer from it (G13.4)", answer::short(&a)));
                }
                return Ok((Scope { place: Some(a), ..Scope::default() }, Qualifier::PerAnchoring(a)));
            }
        }
        Ok((Scope::default(), Qualifier::AsShown))
    }

    /// The namings of acts held only through a layer: a payment names the
    /// version it read and its settlement (G13.2).
    pub(crate) fn extra_namings(&self, id: &Hash) -> Vec<Hash> {
        match self.layers.money.as_ref().and_then(|m| m.payment(id)) {
            Some(p) => vec![p.version, p.settlement],
            None => vec![],
        }
    }

    pub(crate) fn closure(&self, id: &Hash) -> HashSet<Hash> {
        self.held.closure(id, &|x| self.extra_namings(x))
    }

    pub(crate) fn naming_it(&self, id: &Hash) -> HashSet<Hash> {
        self.held.naming_it(id, &|x| self.extra_namings(x))
    }

    /// Whether the verifier holds what a fingerprint names, or knows it as
    /// no act: an act held (readable), a piece, a payment or settlement,
    /// an act of an envelope's chain.
    pub(crate) fn known(&self, h: &Hash) -> bool {
        self.held.get(h).is_some()
            || self.held.is_piece(h)
            || self.layers.money.as_ref().is_some_and(|m| m.payment(h).is_some() || m.settlement(h))
            || self.layers.chain.as_ref().is_some_and(|c| c.holds(h))
    }

    /// The acts an act names, directly or through acts that name them, that
    /// the verifier does not hold or cannot read: each might be what shows
    /// an order (G4.7(c), G14.2(c)).
    pub(crate) fn lacking_in(&self, set: &HashSet<Hash>) -> Vec<Hash> {
        let mut v: Vec<Hash> = set.iter().filter(|h| !self.known(h) || self.held.is_unreadable(h)).copied().collect();
        v.sort();
        v
    }

    // ------------------------------------------------------------ the chains and lines, memoised

    /// The chain of an agreement, by its root (G4.5 to G4.9, G12).
    pub fn chain(&self, root: &Hash) -> Rc<Chain> {
        if let Some(c) = self.chains.borrow().get(root) {
            return c.clone();
        }
        if !self.walking.borrow_mut().insert(*root) {
            return Rc::new(Chain::unchecked(*root, "the reading of this agreement leans on itself through other agreements, and does not settle (G9.2)"));
        }
        if self.walking.borrow().len() > self.limits.nesting {
            self.walking.borrow_mut().remove(root);
            return Rc::new(Chain::unchecked(*root, &format!("the verifier stopped after reading {} agreements nested in one another (G9.2; P2)", self.limits.nesting)));
        }
        let c = Rc::new(self.walk(root));
        self.walking.borrow_mut().remove(root);
        self.chains.borrow_mut().insert(*root, c.clone());
        c
    }

    /// Whether the chain of `root` is being read now (a reading that leans
    /// on itself).
    pub(crate) fn walking(&self, root: &Hash) -> bool {
        self.walking.borrow().contains(root)
    }

    /// The signers' lines (G6, G12).
    pub fn lines(&self) -> Rc<Lines> {
        if let Some(l) = self.lines.borrow().as_ref() {
            return l.clone();
        }
        // Pass 1 (forks, and resolutions by the signer), then pass 2
        // (resolutions under a power to resolve, which read other Terms).
        let l1 = self.read_lines();
        *self.lines.borrow_mut() = Some(Rc::new(l1.clone()));
        let l2 = Rc::new(self.lines_with_powers(l1));
        *self.lines.borrow_mut() = Some(l2.clone());
        self.chains.borrow_mut().clear();
        l2
    }
}
