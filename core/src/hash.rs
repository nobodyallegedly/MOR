//! SHA-256 and tagged hashes (Identity MIP, "Hashes").
//!
//! `tagged_hash(tag, x) = SHA-256(SHA-256(tag) || SHA-256(tag) || x)`, as in
//! BIP-340. The tag is hashed as its UTF-8 bytes. Every MOR tag begins with
//! `MOR/`.

use sha2::{Digest, Sha256};

/// A 32-byte SHA-256 hash.
pub type Hash = [u8; 32];

/// The empty running summary, and nothing else: 32 zero bytes (Envelopes, "Sequences").
pub const ZERO_HASH: Hash = [0u8; 32];

/// The tags the core uses. Each one names one kind of object, so a hash of
/// one kind can never be passed off as another.
pub mod tag {
    /// Act id: over the encoded outside (Identity, Envelopes).
    pub const ACT: &str = "MOR/act";
    /// Inside commitment: over the encoded, unlocked inside (Envelopes).
    pub const INSIDE: &str = "MOR/inside";
    /// Running summary leaf: over an act id (Envelopes, "Sequences").
    pub const MMR_LEAF: &str = "MOR/mmr-leaf";
    /// Running summary internal node: over `left || right` (Envelopes, "Sequences").
    pub const MMR_NODE: &str = "MOR/mmr-node";
    /// Work hash: over a work's complete plaintext (Envelopes, "Media").
    pub const WORK: &str = "MOR/work";
    /// Spec hash: over a specification's encoded content (Development).
    pub const SPEC: &str = "MOR/spec";
    /// Chain key commitment: over `scheme || key` (Identity).
    pub const CHAIN_KEY: &str = "MOR/safety";
}

/// Plain SHA-256. Used for the locked hash (SHA-256 of the locked bytes).
pub fn sha256(data: &[u8]) -> Hash {
    Sha256::digest(data).into()
}

/// A BIP-340 style tagged hash of `data` under `tag`.
pub fn tagged_hash(tag: &str, data: &[u8]) -> Hash {
    tagged_hash_parts(tag, &[data])
}

/// A tagged hash over several byte strings, concatenated.
pub fn tagged_hash_parts(tag: &str, parts: &[&[u8]]) -> Hash {
    let t = sha256(tag.as_bytes());
    let mut h = Sha256::new();
    h.update(t);
    h.update(t);
    for p in parts {
        h.update(p);
    }
    h.finalize().into()
}

/// The work hash of a plaintext: `tagged_hash("MOR/work", plaintext)`.
/// For a text work, the plaintext is its canonical text, as UTF-8.
pub fn work_hash(plaintext: &[u8]) -> Hash {
    tagged_hash(tag::WORK, plaintext)
}

/// The spec hash of a specification's encoded content: `tagged_hash("MOR/spec", content)`.
pub fn spec_hash(encoded_content: &[u8]) -> Hash {
    tagged_hash(tag::SPEC, encoded_content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bip340_style_tagged_hash() {
        // SHA-256("abc"), a FIPS 180-2 example, to be sure of the primitive.
        assert_eq!(
            hex::encode(sha256(b"abc")),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
        // The construction itself, spelled out.
        let t = sha256(b"MOR/act");
        let mut buf = Vec::new();
        buf.extend_from_slice(&t);
        buf.extend_from_slice(&t);
        buf.extend_from_slice(b"x");
        assert_eq!(tagged_hash("MOR/act", b"x"), sha256(&buf));
        assert_eq!(
            tagged_hash_parts("MOR/mmr-node", &[b"ab", b"cd"]),
            tagged_hash("MOR/mmr-node", b"abcd")
        );
    }

    #[test]
    fn every_tag_begins_with_mor() {
        for t in [
            tag::ACT,
            tag::INSIDE,
            tag::MMR_LEAF,
            tag::MMR_NODE,
            tag::WORK,
            tag::SPEC,
            tag::CHAIN_KEY,
        ] {
            assert!(t.starts_with("MOR/"));
        }
    }
}
