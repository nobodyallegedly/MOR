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
//! Finance (roadmap step 12):
//!
//! - [`finance`]: the Finance MIP's exact formats (payee pointers, the vault,
//!   obligations, receipts, claims), which pointer counts, and where a
//!   payment may go under the vault (rules 12 to 14a, 16).
//!
//! Law (roadmap step 5a, reworked to Law draft 7):
//!
//! - [`law`]: the Law MIP's exact formats (terms with marks, areas and the
//!   constitutional change rule; signatures; resignations; records; grants
//!   within areas), the powers a clone needs (tiers), and the checks a
//!   collective needs, judged on its own sequence (F109): which agreement
//!   is in force for an act, and whether its areas' holders consented.
//!
//! Written against core v18, Identity draft 10, Envelope draft 6, Text
//! draft 6, Law draft 7 and Production draft 5.

pub mod act;
pub mod cbor;
pub mod chain;
pub mod envelope;
pub mod finance;
pub mod hash;
pub mod identity;
pub mod law;
pub mod lock;
pub mod merkle;
pub mod mmr;
pub mod sig;
pub mod text;
pub mod xwing;

pub use act::{Act, ActError, Inside, Outside};
pub use hash::{tagged_hash, Hash};
