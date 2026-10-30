//! # mor-anchoring
//!
//! The anchoring cMIP, draft 6 (`cmips/cmip-anchoring-draft-6.md`): the
//! Envelopes' anchoring task (F173), one cMIP with each clock a Module under
//! it (F202). **Experimental**: an instrument for testing the core.
//!
//! - [`tree`]: the batch tree a pooled anchoring service commits to on a
//!   clock, domain-separated (leaf, node and root hashes distinct, a batch
//!   root never equal to a payment commitment) with one canonical proof per
//!   leaf (F200 applied to the batch).
//! - [`service`]: the pooled anchoring service: its offer (an Agreements
//!   publication, a lone seller's, and its price tag, F225, F407), its
//!   terms (urgency tiers, each priced), the ticket it signs for each paid
//!   hash, the batch notice of each batch, and the judgment: delivered, provably omitted, late, or
//!   not delivered by the deadline (a default), each default a refund; and
//!   its checker for the core (`service::Checker`), a proven delivery (F261).
//! - [`custody`]: the pool as visible custody: each batch's money followed
//!   from the payers' payments to the transaction anchoring it, from
//!   receipts and the service's own acts, and what the service kept.

pub mod custody;
pub mod service;
pub mod tree;

use mor_core::hash::{sha256, Hash};

/// This cMIP's spec hash. A test value until its creator is named at step
/// 17.
pub fn spec() -> Hash {
    sha256(b"anchoring cMIP, draft 2, test value until publication")
}
