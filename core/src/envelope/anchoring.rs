//! Anchoring, an Envelope task (Envelope draft 7, Tasks, "Anchoring"; F173).
//!
//! In plain words: MOR has no clock. An **anchoring cMIP** takes any act id
//! and gives a proof that the act existed by some point on a **time
//! reference** it names (a block height, say). The core does not say how;
//! it says what such a proof must deliver, and how two of them compare:
//!
//! - an anchor places one act at one point on one reference;
//! - two anchors compare only on the same reference; anchors on references
//!   that cannot be compared order nothing;
//! - anyone may anchor any act, so an act may carry many anchors: on each
//!   reference, it is judged by its earliest (Finance rule 15, F178).
//!
//! Every layer above may rely on it: Finance for a lock change after a
//! theft (rule 15), Law for deadlines and time references, absence-proof
//! modules for presence. Identity's validity never does (F63).
//!
//! Precisely: a [`Reference`] is an anchoring cMIP's specification hash and
//! its parameters, which together name one time reference (Finance's clock
//! entry and Law's time reference have this shape, F181). A point is a
//! `u64` in the order the cMIP defines on that reference; the core only
//! compares points of one reference. A cMIP plugs in by
//! [`AnchoringCmip`]; a verifier keeps what it has checked in [`Anchors`].

use crate::cbor::{self, Value};
use crate::hash::Hash;
use std::cmp::Ordering;
use std::collections::BTreeMap;

/// One time reference: an anchoring cMIP and its parameters (`[ hash, any ]`
/// in Finance's clock and Law's time reference).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Reference {
    pub cmip: Hash,
    pub params: Value,
}

impl Reference {
    /// `[ hash, any ]`.
    pub fn decode(v: &Value) -> Option<Self> {
        match v {
            Value::Array(a) if a.len() == 2 => match &a[0] {
                Value::Bytes(b) if b.len() == 32 => Some(Reference {
                    cmip: b.as_slice().try_into().ok()?,
                    params: a[1].clone(),
                }),
                _ => None,
            },
            _ => None,
        }
    }

    pub fn to_value(&self) -> Value {
        Value::Array(vec![Value::Bytes(self.cmip.to_vec()), self.params.clone()])
    }

    /// The reference as one key: two references are the same reference
    /// exactly when they name the same cMIP with the same parameters, in
    /// deterministic encoding.
    fn key(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }
}

/// An anchor: the act existed by `point` on `reference`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Anchor {
    pub act: Hash,
    pub reference: Reference,
    pub point: u64,
}

/// An anchoring cMIP, as a verifier carries it (as it carries a rail or
/// media Module). It signs nothing; it checks proofs.
pub trait AnchoringCmip {
    /// Its specification hash.
    fn spec(&self) -> Hash;
    /// Whether `proof` shows that `act` existed by some point on the time
    /// reference `params` names: that point, or `None` where it does not.
    fn verify(&self, act: &Hash, params: &Value, proof: &[u8]) -> Option<u64>;
}

/// The anchors a verifier has checked, each act's earliest per reference.
#[derive(Clone, Debug, Default)]
pub struct Anchors {
    earliest: BTreeMap<(Hash, Vec<u8>), u64>,
}

impl Anchors {
    pub fn new() -> Self {
        Self::default()
    }

    /// Hold an anchor the caller checked (or states). An act anchored more
    /// than once on one reference keeps its earliest point.
    pub fn add(&mut self, a: &Anchor) {
        let e = self.earliest.entry((a.act, a.reference.key())).or_insert(a.point);
        *e = (*e).min(a.point);
    }

    /// Check a proof with the cMIP the reference names, and hold the anchor
    /// it gives. `false` where the cMIP is not the one the reference names,
    /// or the proof does not verify: nothing is held.
    pub fn add_proof(&mut self, cmip: &dyn AnchoringCmip, reference: &Reference, act: &Hash, proof: &[u8]) -> bool {
        if cmip.spec() != reference.cmip {
            return false;
        }
        match cmip.verify(act, &reference.params, proof) {
            Some(point) => {
                self.add(&Anchor { act: *act, reference: reference.clone(), point });
                true
            }
            None => false,
        }
    }

    /// The earliest point at which `act` is anchored on `reference`, if it
    /// is anchored there.
    pub fn earliest(&self, act: &Hash, reference: &Reference) -> Option<u64> {
        self.earliest.get(&(*act, reference.key())).copied()
    }

    /// How `a` and `b` compare on `reference`, each by its earliest anchor
    /// there: `None` where either is not anchored on it. *Anchors on
    /// different references are never compared; that is why this takes one
    /// reference.*
    pub fn compare(&self, a: &Hash, b: &Hash, reference: &Reference) -> Option<Ordering> {
        Some(self.earliest(a, reference)?.cmp(&self.earliest(b, reference)?))
    }

    /// Whether anything is held at all.
    pub fn is_empty(&self) -> bool {
        self.earliest.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::hash::sha256;

    fn r(name: &str) -> Reference {
        Reference { cmip: sha256(b"an anchoring cMIP"), params: Value::Text(name.into()) }
    }

    #[test]
    fn an_act_is_judged_by_its_earliest_anchor_on_each_reference() {
        let (x, y) = (sha256(b"x"), sha256(b"y"));
        let mut a = Anchors::new();
        a.add(&Anchor { act: x, reference: r("main"), point: 50 });
        a.add(&Anchor { act: x, reference: r("main"), point: 40 });
        a.add(&Anchor { act: x, reference: r("main"), point: 60 });
        assert_eq!(a.earliest(&x, &r("main")), Some(40));
        a.add(&Anchor { act: y, reference: r("backup"), point: 1 });
        assert_eq!(a.compare(&x, &y, &r("main")), None, "never across references");
        a.add(&Anchor { act: y, reference: r("main"), point: 40 });
        assert_eq!(a.compare(&x, &y, &r("main")), Some(Ordering::Equal));
    }

    struct Fake;
    impl AnchoringCmip for Fake {
        fn spec(&self) -> Hash {
            sha256(b"an anchoring cMIP")
        }
        fn verify(&self, act: &Hash, _: &Value, proof: &[u8]) -> Option<u64> {
            (proof.len() == 33 && &proof[..32] == act).then(|| proof[32] as u64)
        }
    }

    #[test]
    fn a_proof_is_checked_by_the_cmip_the_reference_names() {
        let x = sha256(b"x");
        let mut p = x.to_vec();
        p.push(7);
        let mut a = Anchors::new();
        let other = Reference { cmip: sha256(b"another cMIP"), params: Value::Null };
        assert!(!a.add_proof(&Fake, &other, &x, &p));
        assert!(!a.add_proof(&Fake, &r("main"), &sha256(b"y"), &p));
        assert!(a.add_proof(&Fake, &r("main"), &x, &p));
        assert_eq!(a.earliest(&x, &r("main")), Some(7));
    }
}
