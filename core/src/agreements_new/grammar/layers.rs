//! The layers draft 24 leans on and that do not exist yet (section 8.1):
//! each behind one small interface, with a test stand-in.
//!
//! In plain words: draft 24 reads some answers from other layers of MOR that
//! are not written yet: a **place** (the layer that orders acts), a
//! **clock**, the **envelope's chain** and the holder of the baker's rights
//! (the layer below), and **Money** (a payment, its settlement, "the same
//! payment"). The verifier asks each through one small interface below.
//! Each has a stand-in, built from a table, for tests and vectors only: it
//! answers what its table says, and nothing else. A verifier that has no
//! answer from a layer it needs answers **unchecked** (G9).
//!
//! The stand-ins are named `Table*`, and each says in its documentation the
//! sentence of section 8.1 it stands in for. None is a design of the layer.

use crate::agreements_new::Amount;
use crate::hash::Hash;
use std::collections::{HashMap, HashSet};

// ---------------------------------------------------------------- a place

/// What a place answers of one act (section 8.1, "A place", items 3 and 5).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PlaceSays {
    /// The act is in the place's line, at this position.
    At(u64),
    /// The place does not show the act.
    NotShown,
    /// The verifier holds two answers of the place about this act that
    /// contradict each other (G7.2): it has no answer from it.
    Contradicts,
}

/// A place, as the layer that orders acts would give it (G7). Draft 24,
/// section 8.1: "(2) one line of the acts the place was shown, in the order
/// it was shown them; (3) a signed answer, by the place, that says of an
/// act, or of an agreement's root, whether it is in that line and at which
/// position; (4) in the same answer, whether anything of the same agreement
/// comes after it ...; (5) a way for a verifier to tell that two answers of
/// one place contradict each other (G7.2)." Item (4) is read here from the
/// positions the place gives for the acts held.
pub trait Place {
    fn position(&self, act: &Hash) -> PlaceSays;
}

/// A test stand-in for a place: a table of positions. **Stand-in, for tests
/// only.**
#[derive(Clone, Debug, Default)]
pub struct TablePlace {
    pub positions: HashMap<Hash, u64>,
    pub contradicted: HashSet<Hash>,
}

impl TablePlace {
    /// A place that shows these acts, in this order (positions from 1).
    pub fn in_order(acts: &[Hash]) -> TablePlace {
        TablePlace { positions: acts.iter().enumerate().map(|(i, h)| (*h, i as u64 + 1)).collect(), contradicted: HashSet::new() }
    }
}

impl Place for TablePlace {
    fn position(&self, act: &Hash) -> PlaceSays {
        if self.contradicted.contains(act) {
            return PlaceSays::Contradicts;
        }
        match self.positions.get(act) {
            Some(p) => PlaceSays::At(*p),
            None => PlaceSays::NotShown,
        }
    }
}

// ---------------------------------------------------------------- a clock

/// A clock (G7.4): what time it was for an agreement. Draft 24, section 8.1:
/// "What a clock is, which layer gives it, and how it is identified without
/// a server address (G7.4)." Read here as: a time for an act, where the clock
/// gives one; times are ordered numbers.
pub trait Clock {
    fn time(&self, act: &Hash) -> Option<u64>;
}

/// A test stand-in for a clock. **Stand-in, for tests only.**
#[derive(Clone, Debug, Default)]
pub struct TableClock {
    pub times: HashMap<Hash, u64>,
}

impl Clock for TableClock {
    fn time(&self, act: &Hash) -> Option<u64> {
        self.times.get(act).copied()
    }
}

// ---------------------------------------------------------------- the envelope's chain

/// What the envelope's chain says of one act of it (G14.1).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ChainSays {
    /// The act is of this envelope's chain, and this is the holder of the
    /// baker's rights at it. Where it lies in a fork of the chain for which
    /// the layer still gives a holder, the fork's tips are given beside it.
    Holder { holder: Hash, fork: Vec<Hash> },
    /// The act lies in a fork of the chain for which the layer gives no
    /// holder (G14.2, "A double sale").
    NoHolder { fork: Vec<Hash> },
    /// The act, held, is not an act of this envelope's chain (G14.3(a)).
    NotOfChain,
    /// The verifier lacks the envelope, the act, or an act of the chain
    /// between them (G14.3(c)).
    Lacking(String),
}

/// The envelope's chain, from the layer below (G14; section 8.1, "The
/// envelope's chain"): "(1) the bake names the baker ...; (2) a transfer act
/// ...; (3) who may sign it ...; (4) how a reader gets the holder at an act
/// ...; how a verifier tells that an act is of a given envelope's chain ...;
/// (5) what a fork there shows ... Also, as before: how a verifier tells that
/// two envelopes carry the same work."
pub trait EnvelopeChain {
    /// The baker the envelope states, where the envelope is held.
    fn baker(&self, envelope: &Hash) -> Option<Hash>;
    /// The holder at an act of the envelope's chain (G14.1).
    fn at(&self, envelope: &Hash, act: &Hash) -> ChainSays;
    /// The transfers held that follow `act` in that chain (G14.2, "Late
    /// Terms": each is a Y).
    fn transfers_after(&self, envelope: &Hash, act: &Hash) -> Vec<Hash>;
    /// Other envelopes held that carry the same work, with the baker each
    /// states (G14.5).
    fn same_work(&self, envelope: &Hash) -> Vec<(Hash, Hash)>;
    /// Whether this is an act of some envelope's chain the layer holds.
    fn holds(&self, act: &Hash) -> bool;
}

/// One envelope in the stand-in: its bake (the envelope's own id), its
/// baker, its transfers (id, the act it follows, the next holder), and the
/// work it carries.
#[derive(Clone, Debug)]
pub struct TableEnvelope {
    pub baker: Hash,
    pub work: Hash,
    pub transfers: Vec<(Hash, Hash, Hash)>,
    /// Acts of the chain the verifier is told it lacks (held by no one here).
    pub lacking: HashSet<Hash>,
    /// Whether the layer gives a holder at a tip of a fork (a double sale).
    pub holder_in_fork: bool,
}

/// A test stand-in for the envelope's chain. **Stand-in, for tests only.**
#[derive(Clone, Debug, Default)]
pub struct TableChain {
    pub envelopes: HashMap<Hash, TableEnvelope>,
}

impl TableChain {
    fn follows(e: &TableEnvelope, act: &Hash) -> Option<Hash> {
        e.transfers.iter().find(|(id, ..)| id == act).map(|(_, f, _)| *f)
    }
}

impl EnvelopeChain for TableChain {
    fn baker(&self, envelope: &Hash) -> Option<Hash> {
        self.envelopes.get(envelope).map(|e| e.baker)
    }

    fn at(&self, envelope: &Hash, act: &Hash) -> ChainSays {
        let Some(e) = self.envelopes.get(envelope) else { return ChainSays::Lacking("the envelope is not held".into()) };
        if e.lacking.contains(act) {
            return ChainSays::Lacking("the act cited is not held".into());
        }
        if act != envelope && !e.transfers.iter().any(|(id, ..)| id == act) {
            let elsewhere = self.envelopes.values().any(|o| o.transfers.iter().any(|(id, ..)| id == act)) || self.envelopes.contains_key(act);
            return if elsewhere { ChainSays::NotOfChain } else { ChainSays::Lacking("the act cited is not held".into()) };
        }
        // Walk back to the bake: the holder is named by the last transfer at
        // or before the act; a fork is two transfers following one act.
        let mut fork = vec![];
        let mut cur = *act;
        let mut holder = None;
        loop {
            if cur == *envelope {
                break;
            }
            if e.lacking.contains(&cur) {
                return ChainSays::Lacking("an act of the chain between is not held".into());
            }
            let (_, f, to) = *e.transfers.iter().find(|(id, ..)| *id == cur).unwrap();
            let siblings: Vec<Hash> = e.transfers.iter().filter(|(_, g, _)| *g == f).map(|(id, ..)| *id).collect();
            if siblings.len() > 1 && fork.is_empty() {
                fork = siblings;
            }
            if holder.is_none() {
                holder = Some(to);
            }
            if e.lacking.contains(&f) {
                return ChainSays::Lacking("an act of the chain between is not held".into());
            }
            cur = f;
        }
        let holder = holder.unwrap_or(e.baker);
        if !fork.is_empty() && !e.holder_in_fork {
            return ChainSays::NoHolder { fork };
        }
        ChainSays::Holder { holder, fork }
    }

    fn transfers_after(&self, envelope: &Hash, act: &Hash) -> Vec<Hash> {
        let Some(e) = self.envelopes.get(envelope) else { return vec![] };
        e.transfers
            .iter()
            .filter(|(id, ..)| {
                let mut cur = *id;
                while let Some(f) = TableChain::follows(e, &cur) {
                    if f == *act {
                        return true;
                    }
                    cur = f;
                }
                false
            })
            .map(|(id, ..)| *id)
            .collect()
    }

    fn same_work(&self, envelope: &Hash) -> Vec<(Hash, Hash)> {
        let Some(e) = self.envelopes.get(envelope) else { return vec![] };
        let mut v: Vec<(Hash, Hash)> = self.envelopes.iter().filter(|(k, o)| *k != envelope && o.work == e.work).map(|(k, o)| (*k, o.baker)).collect();
        v.sort();
        v
    }

    fn holds(&self, act: &Hash) -> bool {
        self.envelopes.contains_key(act) || self.envelopes.values().any(|e| e.transfers.iter().any(|(id, ..)| id == act))
    }
}

// ---------------------------------------------------------------- Money

/// A payment, as the layer that holds value would give it (G11.7, G13.2):
/// its signer (the payer), the version of the work agreement it read, the
/// settlement it names, and its amount.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Payment {
    pub id: Hash,
    pub payer: Hash,
    pub version: Hash,
    pub settlement: Hash,
    pub amount: Amount,
}

/// The layer that holds value (Control; Money). Draft 24, section 8.1:
/// "What a settlement is, as the layer that holds value gives it ...; and
/// what a payment is there: how it names the version of the work agreement it
/// read"; and "this text needs its answer to whether two such acts are of the
/// same payment (G11.4(b))".
pub trait Money {
    fn payment(&self, id: &Hash) -> Option<Payment>;
    fn payments(&self) -> Vec<Payment>;
    /// Whether the verifier holds this settlement.
    fn settlement(&self, id: &Hash) -> bool;
    /// Whether two acts are of the same payment; `None` where the layer gives
    /// no answer.
    fn same_payment(&self, a: &Hash, b: &Hash) -> Option<bool>;
}

/// A test stand-in for Money. **Stand-in, for tests only.**
#[derive(Clone, Debug, Default)]
pub struct TableMoney {
    pub payments: Vec<Payment>,
    pub settlements: HashSet<Hash>,
    /// Pairs of acts the layer says are of the same payment (a claim and a
    /// receipt).
    pub same: Vec<(Hash, Hash)>,
}

impl Money for TableMoney {
    fn payment(&self, id: &Hash) -> Option<Payment> {
        self.payments.iter().find(|p| p.id == *id).copied()
    }

    fn payments(&self) -> Vec<Payment> {
        self.payments.clone()
    }

    fn settlement(&self, id: &Hash) -> bool {
        self.settlements.contains(id)
    }

    fn same_payment(&self, a: &Hash, b: &Hash) -> Option<bool> {
        if a == b {
            return Some(true);
        }
        if !self.settlements.contains(a) || !self.settlements.contains(b) {
            return None;
        }
        Some(self.same.iter().any(|(x, y)| (x == a && y == b) || (x == b && y == a)))
    }
}

// ---------------------------------------------------------------- all of them

/// The layers a verifier is given.
#[derive(Default)]
pub struct Layers {
    pub places: HashMap<Hash, Box<dyn Place>>,
    pub clocks: HashMap<Hash, Box<dyn Clock>>,
    pub chain: Option<Box<dyn EnvelopeChain>>,
    pub money: Option<Box<dyn Money>>,
}
