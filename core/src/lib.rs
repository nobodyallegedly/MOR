//! # mor-core
//!
//! The MOR core library: the building blocks every act is made of, and the
//! identity-chain checks, exactly as the MIP drafts define them.
//!
//! Part 1 (roadmap step 2):
//!
//! - [`cbor`]: deterministic CBOR, strict both ways (Identity, "Encoding").
//! - [`hash`]: SHA-256 and BIP-340 style tagged hashes (Identity, "Hashes").
//! - [`act`]: the act, its outside and locked inside, act ids, the inside
//!   commitment, sealing and opening, and sequence checks (Envelope).
//! - [`lock`]: XChaCha20-Poly1305 locking (Envelope).
//! - [`text`]: canonical text, with Unicode 17.0 normalization (Text).
//! - [`mmr`]: running summaries, a Merkle mountain range (Envelope, "Sequences").
//!
//! Part 2 (roadmap step 3):
//!
//! - [`sig`]: signature schemes 1 to 3 (Schnorr, SLH-DSA 128s and 128f),
//!   safety key commitments (Identity, "Signature schemes").
//! - [`merkle`]: a home's receipt log, RFC 9162 trees and proofs (Identity,
//!   "Log summary").
//! - [`identity`]: the Identity MIP's act formats, home rules and the
//!   checks that need no other act.
//! - [`chain`]: which identity-chain act counts, and the standing of every
//!   other act (Identity, "Verification procedures", "Validity rules").
//!
//! Written against core v15, Identity draft 9, Envelope draft 5 and Text draft 5.

pub mod act;
pub mod cbor;
pub mod chain;
pub mod envelope;
pub mod hash;
pub mod identity;
pub mod lock;
pub mod merkle;
pub mod mmr;
pub mod sig;
pub mod text;
pub mod xwing;

pub use act::{Act, ActError, Inside, Outside};
pub use hash::{tagged_hash, Hash};
