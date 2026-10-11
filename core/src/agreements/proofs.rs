//! Two classes of offers, and the checker a proven offer is judged by
//! (Agreements draft 11, rule 11, new in draft 11, F261; F264).
//!
//! In plain words: an offer sells either something whose delivery leaves a
//! proof anyone can check from data alone (a **proven** offer, written in
//! the access form `[2, [cMIP, params]]`), or something resting on
//! someone's word (a **promised** offer, naming a vow, `[3, vow]`), or a
//! publication. For a proven offer, the core asks the checker of the cMIP
//! the offer names for the proof's verdict; the cMIP produces the proof,
//! and its checker runs on data, never on the cMIP's say-so. A verifier
//! that holds no checker for that cMIP cannot check the proof, so the
//! delivery is not proven for it. The anchoring cMIP's existing judgment
//! is the first checker (`mor_anchoring::service::Checker`).
//!
//! Inside a vow, a proof (a key delivered in keeping it, F264) is evidence
//! beside the buyer's confirmation or contest, never moving the sale's
//! state by itself ([`crate::agreements::VowSale::evidence`]).

use crate::agreements::open_formats::Sold;
use crate::hash::Hash;

/// The class of one thing an offer sells (draft 11, rule 11).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OfferClass {
    /// `[0, publication]`: a publication.
    Publication(Hash),
    /// `[2, [cmip, params]]`: a proven offer, judged by that cMIP's
    /// checker (F261, the access form widened from access to bytes to any
    /// delivery whose proof a verifier checks from data).
    Proven { cmip: Hash, params: Vec<u8> },
    /// `[3, vow]`: a promised offer, each sale confirmed or contested by
    /// its buyer (rule 13, F240).
    Promised(Hash),
}

impl Sold {
    /// Its class (draft 11, rule 11, F261).
    pub fn class(&self) -> OfferClass {
        match self {
            Sold::Publication(p) => OfferClass::Publication(*p),
            Sold::Access(c, params) => OfferClass::Proven { cmip: *c, params: params.clone() },
            Sold::Vow(v) => OfferClass::Promised(*v),
        }
    }
}

/// A checker's verdict on a proof of delivery (F261). Only [`Proven`]
/// makes a delivery proven.
///
/// [`Proven`]: ProofVerdict::Proven
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ProofVerdict {
    /// The proof shows delivery, checked from data.
    Proven,
    /// The proof shows no delivery, or a delivery that breaks the offer's
    /// terms (late, omitted): why.
    NotProven(String),
    /// The checker cannot tell yet, or this verifier cannot check it (no
    /// checker for the cMIP, a clock it does not follow): why. Not proven.
    Unknown(String),
}

/// A cMIP's checker (F261): the verdict on a proof of delivery under one
/// of the offer's items in the access form. It is given the offer's id,
/// the item's parameters (its cMIP's terms, as the offer carries them,
/// encoded CBOR) and the proof, in the cMIP's own encoding. What the proof
/// is, and what the checker reads beside it (a clock, the cMIP's own
/// acts), is the cMIP's.
pub trait ProofChecker {
    fn check(&self, offer: &Hash, params: &[u8], proof: &[u8]) -> ProofVerdict;
}
