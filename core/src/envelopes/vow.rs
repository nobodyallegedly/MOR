//! The vow: an act naming something to come (F237, F239, F240; the texts
//! still say "announcement" until the redraft before review, F241; the code
//! says "vow", so nothing new needs renaming then).
//!
//! In plain words: someone wants to sell what has no bytes yet, or never
//! will (a concert seat, an album not recorded, a chair to be made). They
//! sign a **vow**: a short act saying, in words, what is to come. The id of
//! that first act is the vow's **name**, for good: offers point at it, and
//! nothing else ever takes it. A vow is its own chain: the first act is its
//! genesis; a change (a new date, a better description) is a later version,
//! signed again by the same signer, naming the first and the one it
//! follows, as an offer's versions do. The core says nothing about what the
//! vow is for, how it is delivered or what it becomes: that is the cMIPs'
//! (F237: "The core should not care").
//!
//! Precisely, an act of type [`types::VOW`](super::types::VOW) of the
//! Envelopes MIP (the next free number; mechanic, the build's):
//!
//! ```cddl
//! vow-payload = {
//!   0 => tstr,          ; its words: what is to come, canonical text
//!   ? 1 => [hash, any]  ; a cMIP and its parameters: what the vow is in that cMIP's terms (its kind, its terms)
//! }
//! ```
//!
//! Its `objects`: none on the genesis; a later version names the vow's
//! chain as `[genesis, previous]`, one entry beside any a collective's
//! actions chain needs (mechanic, the build's, as
//! OF4 a reads an offer's chain). It carries no `acks` (Envelopes rule 4a).
//! The checks that need other acts (a later version is its signer's, two
//! versions of one previous are its signer's fork) are the verifier's:
//! `AgreementsView::vow`.

use super::EnvError;
use crate::act::Inside;
use crate::cbor::Value;
use crate::hash::Hash;

type R<T> = Result<T, EnvError>;

/// A vow's payload (Envelopes type 5).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Vow {
    /// 0: its words, canonical text.
    pub words: String,
    /// 1: a cMIP and its parameters, in deterministic CBOR; the core reads
    /// neither.
    pub cmip: Option<(Hash, Value)>,
}

/// A vow as an act names it: the vow, and, for a later version, its
/// genesis and the version it follows.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VowAct {
    pub vow: Vow,
    /// `(genesis, previous)` for a later version; `None` for the genesis,
    /// whose id is the vow's name.
    pub follows: Option<(Hash, Hash)>,
}

fn hash(v: &Value, w: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| EnvError::Shape(w)),
        _ => Err(EnvError::Shape(w)),
    }
}

impl Vow {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![(Value::Uint(0), Value::Text(self.words.clone()))];
        if let Some((c, p)) = &self.cmip {
            m.push((Value::Uint(1), Value::Array(vec![Value::Bytes(c.to_vec()), p.clone()])));
        }
        m
    }

    /// Decode a vow act's inside: its payload, closed, and its chain.
    /// `signer` is the act's signer, whose own chain entries (a
    /// collective's actions chain) are not the vow's.
    pub fn decode(inside: &Inside, signer: Option<&Hash>) -> R<VowAct> {
        let mut words = None;
        let mut cmip = None;
        for (k, v) in &inside.payload {
            match (k, v) {
                (Value::Uint(0), Value::Text(t)) if words.is_none() => words = Some(t.clone()),
                (Value::Uint(1), Value::Array(a)) if cmip.is_none() && a.len() == 2 => {
                    cmip = Some((hash(&a[0], "vow: its cMIP")?, a[1].clone()))
                }
                _ => return Err(EnvError::Shape("vow: a field outside { 0 => words, ? 1 => [cMIP, parameters] }")),
            }
        }
        let words = words.ok_or(EnvError::Shape("vow: its words (field 0)"))?;
        if inside.acks.is_some() {
            return Err(EnvError::Shape("vow: an Envelopes act carries no acks (rule 4a)"));
        }
        // A collective's acts cite its actions chain, named by its own
        // identity (Agreements rule 35b): those entries are not the vow's.
        let own: Vec<_> = inside.objects.iter().flatten().filter(|o| Some(&o.chain) != signer).collect();
        let follows = match own.as_slice() {
            [] => None,
            [o] => Some((o.chain, o.predecessor)),
            _ => return Err(EnvError::Shape("vow: a later version names one chain entry, [genesis, previous]")),
        };
        Ok(VowAct { vow: Vow { words, cmip }, follows })
    }
}
