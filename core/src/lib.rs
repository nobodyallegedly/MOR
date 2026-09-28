//! # mor-core
//!
//! The MOR core library, part 1 (roadmap step 2): the building blocks every
//! act is made of, exactly as the MIP drafts define them.
//!
//! - [`cbor`]: deterministic CBOR, strict both ways (Identity, "Encoding").
//! - [`hash`]: SHA-256 and BIP-340 style tagged hashes (Identity, "Hashes").
//! - [`act`]: the act, its outside and locked inside, act ids, the inside
//!   commitment, sealing and opening, and sequence checks (Envelope).
//! - [`lock`]: XChaCha20-Poly1305 locking (Envelope).
//! - [`text`]: canonical text, with Unicode 17.0 normalization (Text).
//! - [`mmr`]: running summaries, a Merkle mountain range (Envelope, "Sequences").
//!
//! Part 2 (roadmap step 3) adds signatures and the identity-chain checks.
//!
//! Written against core v14, Identity draft 8, Envelope draft 5 and Text draft 5.

pub mod act;
pub mod cbor;
pub mod hash;
pub mod lock;
pub mod mmr;
pub mod text;

pub use act::{Act, ActError, Inside, Outside};
pub use hash::{tagged_hash, Hash};
