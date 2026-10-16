//! The identity carry Module (`modules/module-identity-carry-words-draft-1.md`):
//! how an identity is carried from one app to another, written down by a
//! person. What travels is the identity's ID and its current signing seed,
//! the 32-byte secret of its Schnorr signing key (scheme 1), written as 24
//! words in the words seed Module's encoding (BIP-39's English list and
//! checksum, never its wallet derivation).
//!
//! The chain key never travels: it stays on the device that holds it.
//! Whoever holds these words can sign as the identity until its signing key
//! is rotated.
//!
//! Draft 2 (`modules/module-identity-carry-words-draft-2.md`): the words
//! carry the identity's encryption key too, derived from the signing seed
//! (`encryption_secret`), so whoever holds them can also open its private
//! messages, a cost the draft states.

use crate::seed::{Seed, SeedError, SeedModule};
use mor_core::sig::SchnorrKey;
use std::fmt;

/// Why written words do not carry a signing key.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CarryError {
    /// Not 24 words of the list, or a wrong checksum (as the words seed Module).
    Words(SeedError),
    /// The 256 bits are not a Schnorr secret key (zero, or not below the
    /// curve's order): never made by a client, refused.
    NotAKey,
}

impl fmt::Display for CarryError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CarryError::Words(e) => e.fmt(f),
            CarryError::NotAKey => f.write_str("the words do not hold a signing key"),
        }
    }
}

impl std::error::Error for CarryError {}

/// The tag of the encryption key's derivation (draft 2, section 2a).
pub const ENCRYPTION_TAG: &str = "MOR/module/carry/encryption";

/// The X-Wing secret (32 bytes) an identity's encryption key is made from,
/// derived from its signing seed (draft 2, section 2a):
/// `tagged_hash("MOR/module/carry/encryption", signing seed)`.
pub fn encryption_secret(signing_seed: &[u8; 32]) -> [u8; 32] {
    mor_core::hash::tagged_hash(ENCRYPTION_TAG, signing_seed)
}

/// The words of a signing seed.
pub fn words(signing_seed: &[u8; 32]) -> String {
    Seed::new(SeedModule::Words, *signing_seed).backup()
}

/// Read written words back to the signing seed and its public key. Letter
/// case and spacing do not matter; a wrong word or checksum is refused.
pub fn restore(written: &str) -> Result<([u8; 32], [u8; 32]), CarryError> {
    let seed = Seed::restore(SeedModule::Words, written).map_err(CarryError::Words)?;
    let key = SchnorrKey::from_secret(&seed.entropy).ok_or(CarryError::NotAKey)?;
    Ok((seed.entropy, key.public()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_and_refusals() {
        let s: [u8; 32] = core::array::from_fn(|i| (i as u8).wrapping_mul(7).wrapping_add(1));
        let w = words(&s);
        assert_eq!(w.split(' ').count(), 24);
        let (back, public) = restore(&w.to_uppercase().replace(' ', "  \n")).unwrap();
        assert_eq!(back, s);
        assert_eq!(public, SchnorrKey::from_secret(&s).unwrap().public());
        // One word changed: the checksum fails (or the word is not on the list).
        let mut ws: Vec<&str> = w.split(' ').collect();
        ws[3] = if ws[3] == "zoo" { "abandon" } else { "zoo" };
        assert!(matches!(restore(&ws.join(" ")), Err(CarryError::Words(_))));
        assert!(matches!(
            restore("abandon abandon"),
            Err(CarryError::Words(_))
        ));
        // All zero is valid words but not a key.
        assert_eq!(restore(&words(&[0u8; 32])), Err(CarryError::NotAKey));
    }

    #[test]
    fn the_encryption_secret_follows_the_signing_seed() {
        let a = encryption_secret(&[1u8; 32]);
        assert_ne!(a, encryption_secret(&[2u8; 32]));
        assert_eq!(a, mor_core::hash::tagged_hash(ENCRYPTION_TAG, &[1u8; 32]));
        // Never the signing seed itself.
        assert_ne!(a, [1u8; 32]);
    }
}
