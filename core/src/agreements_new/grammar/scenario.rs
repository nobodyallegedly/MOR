//! Test identities and a book of acts, for the verifier's tests and vectors
//! only.
//!
//! In plain words: to test the grammar's answers, the tests and the vector
//! generator write real acts: Terms, Statements and reports built with the
//! encoding's own builders, sealed and signed as everyday acts by test
//! identities. The identities are derived from labels exactly as the
//! encoding's vectors derive theirs (`agreements-new/test identity A`), so
//! they are the same test identities. Nothing here is a real identity, key or
//! server. The book also holds the stand-in layers' tables (a place, a clock,
//! the envelope's chain, Money) for a case.

use super::layers::{Layers, Payment, TableChain, TableClock, TableEnvelope, TableMoney, TablePlace};
use super::Held;
use crate::act::{self, Addressing, Inside};
use crate::agreements_new::{self as an, Amount, Report, Statement, Terms};
use crate::cbor::Value;
use crate::hash::{sha256, Hash};
use crate::sig::SchnorrKey;
use std::collections::HashMap;

/// A stand-in fingerprint from a label, as the encoding's vectors make theirs.
pub fn fixed(label: &str) -> Hash {
    sha256(format!("agreements-new/{label}").as_bytes())
}

/// A test identity: a stand-in identity hash, a binding, and a signing key
/// derived from its label (the same derivation as the encoding's vectors).
#[derive(Clone)]
pub struct Tid {
    pub id: Hash,
    pub binding: Hash,
    key: SchnorrKey,
}

pub fn tid(label: &str) -> Tid {
    Tid {
        id: fixed(&format!("test identity {label}")),
        binding: fixed(&format!("test identity {label}/binding")),
        key: SchnorrKey::from_secret(&fixed(&format!("test identity {label}/signing secret"))).unwrap(),
    }
}

/// One act written into a book: its label, its bytes, its id.
#[derive(Clone, Debug)]
pub struct Written {
    pub label: String,
    pub bytes: Vec<u8>,
    pub id: Hash,
}

/// A book: the acts of one case, and the stand-in layers' tables.
#[derive(Clone, Default)]
pub struct Book {
    pub acts: Vec<Written>,
    pub pieces: Vec<Hash>,
    pub places: HashMap<Hash, TablePlace>,
    pub clocks: HashMap<Hash, TableClock>,
    pub chain: Option<TableChain>,
    pub money: Option<TableMoney>,
}

fn seal(label: &str, who: &Tid, spec: Hash, type_: u64, payload: Vec<(Value, Value)>) -> Written {
    let inside = Inside {
        spec,
        type_,
        prev: Some(vec![]),
        objects: None,
        payload,
        position: Some(1),
        summary: Some([0; 32]),
        acks: None,
        refs: None,
        hint: None,
        salt: fixed(&format!("verifier/{label}/salt"))[..16].try_into().unwrap(),
    };
    let key = fixed(&format!("verifier/{label}/content key"));
    let nonce: [u8; 24] = fixed(&format!("verifier/{label}/nonce"))[..24].try_into().unwrap();
    let addr = Addressing { signer: Some(who.id), binding: Some(who.binding), public: true, to: None };
    let aux = fixed(&format!("verifier/{label}/aux"));
    let a = act::make(&inside, &key, &nonce, &addr, |id| who.key.sign(id, &aux));
    Written { label: label.into(), bytes: a.encode(), id: a.id() }
}

impl Book {
    pub fn new() -> Book {
        Book::default()
    }

    /// Write a Terms act, built with the encoding's builder.
    pub fn terms(&mut self, label: &str, who: &Tid, t: Terms) -> Hash {
        let w = seal(label, who, an::SPEC_DRAFT_24, an::types::TERMS, t.to_payload().expect("a Terms act the encoding takes"));
        let id = w.id;
        self.acts.push(w);
        id
    }

    /// Write a Statement.
    pub fn statement(&mut self, label: &str, who: &Tid, s: Statement) -> Hash {
        let w = seal(label, who, an::SPEC_DRAFT_24, an::types::STATEMENT, s.to_payload().expect("a Statement the encoding takes"));
        let id = w.id;
        self.acts.push(w);
        id
    }

    /// Write a report (a proposal, under the report block's spec hash).
    pub fn report(&mut self, label: &str, who: &Tid, r: Report) -> Hash {
        let w = seal(label, who, an::SPEC_REPORT_BLOCK_3, an::types::REPORT, r.to_payload().expect("a report the encoding takes"));
        let id = w.id;
        self.acts.push(w);
        id
    }

    /// An assent to Terms `t` of the agreement `root`.
    pub fn assent(&mut self, label: &str, who: &Tid, root: Hash, t: Hash, previous: Option<Hash>) -> Hash {
        self.statement(label, who, Statement::new(root, t, an::Kind::Assent, previous))
    }

    /// A place showing these acts, in this order.
    pub fn place(&mut self, id: Hash, order: &[Hash]) {
        self.places.insert(id, TablePlace::in_order(order));
    }

    pub fn clock(&mut self, id: Hash, times: &[(Hash, u64)]) {
        self.clocks.insert(id, TableClock { times: times.iter().copied().collect() });
    }

    /// An envelope in the stand-in chain: its bake id, baker and work.
    pub fn envelope(&mut self, bake: Hash, baker: Hash, work: Hash) {
        self.chain.get_or_insert_with(TableChain::default).envelopes.insert(
            bake,
            TableEnvelope { baker, work, transfers: vec![], lacking: Default::default(), holder_in_fork: false },
        );
    }

    /// A transfer of the baker's rights in the stand-in chain.
    pub fn transfer(&mut self, bake: Hash, id: Hash, follows: Hash, to: Hash) {
        self.chain.as_mut().unwrap().envelopes.get_mut(&bake).unwrap().transfers.push((id, follows, to));
    }

    /// A payment in the stand-in Money layer, with its settlement held.
    pub fn payment(&mut self, id: Hash, payer: Hash, version: Hash, settlement: Hash, amount: Amount) {
        let m = self.money.get_or_insert_with(TableMoney::default);
        m.payments.push(Payment { id, payer, version, settlement, amount });
        m.settlements.insert(settlement);
    }

    pub fn settlement(&mut self, id: Hash) {
        self.money.get_or_insert_with(TableMoney::default).settlements.insert(id);
    }

    /// The acts held, as bytes read back.
    pub fn held(&self) -> Held {
        let input: Vec<(&[u8], Option<&[u8; 32]>)> = self.acts.iter().map(|w| (w.bytes.as_slice(), None)).collect();
        let mut h = Held::from_bytes(&input);
        for p in &self.pieces {
            h.hold_piece(*p);
        }
        h
    }

    /// The stand-in layers.
    pub fn layers(&self) -> Layers {
        let mut l = Layers::default();
        for (k, p) in &self.places {
            l.places.insert(*k, Box::new(p.clone()));
        }
        for (k, c) in &self.clocks {
            l.clocks.insert(*k, Box::new(c.clone()));
        }
        if let Some(c) = &self.chain {
            l.chain = Some(Box::new(c.clone()));
        }
        if let Some(m) = &self.money {
            l.money = Some(Box::new(m.clone()));
        }
        l
    }
}
