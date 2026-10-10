//! Locking (Envelopes, "How it fits together", step 1).
//!
//! An inside, or a media object, is locked with its own 32-byte content key
//! and a 24-byte nonce using XChaCha20-Poly1305. The locked bytes are the
//! ciphertext followed by the 16-byte Poly1305 tag. No associated data is
//! used: the outside already commits to both the locked bytes (locked hash)
//! and the unlocked inside (inside commitment).

use chacha20poly1305::aead::{Aead, KeyInit, Payload};
use chacha20poly1305::{XChaCha20Poly1305, XNonce};
use std::fmt;

/// A content key: 32 bytes, new for every object (Envelopes rule 9).
pub type ContentKey = [u8; 32];
/// A lock nonce: 24 bytes.
pub type Nonce = [u8; 24];

/// The key does not open the locked bytes (wrong key, wrong nonce, or the
/// bytes were changed).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct UnlockError;

impl fmt::Display for UnlockError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("the content key does not open the locked bytes")
    }
}

impl std::error::Error for UnlockError {}

/// Lock `plaintext` with `key` and `nonce`. Returns ciphertext || tag.
pub fn lock(plaintext: &[u8], key: &ContentKey, nonce: &Nonce) -> Vec<u8> {
    XChaCha20Poly1305::new(key.into())
        .encrypt(
            XNonce::from_slice(nonce),
            Payload {
                msg: plaintext,
                aad: b"",
            },
        )
        .expect("XChaCha20-Poly1305 encryption cannot fail for in-memory input")
}

/// Unlock bytes made by [`lock`].
pub fn unlock(locked: &[u8], key: &ContentKey, nonce: &Nonce) -> Result<Vec<u8>, UnlockError> {
    XChaCha20Poly1305::new(key.into())
        .decrypt(
            XNonce::from_slice(nonce),
            Payload {
                msg: locked,
                aad: b"",
            },
        )
        .map_err(|_| UnlockError)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// draft-irtf-cfrg-xchacha-03, appendix A.3.1: the primitive itself
    /// (this vector uses associated data; MOR locks with none).
    #[test]
    fn xchacha20poly1305_reference_vector() {
        let pt = b"Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.";
        let aad = hex::decode("50515253c0c1c2c3c4c5c6c7").unwrap();
        let key: [u8; 32] =
            hex::decode("808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f")
                .unwrap()
                .try_into()
                .unwrap();
        let nonce = hex::decode("404142434445464748494a4b4c4d4e4f5051525354555657").unwrap();
        let ct = XChaCha20Poly1305::new((&key).into())
            .encrypt(XNonce::from_slice(&nonce), Payload { msg: pt, aad: &aad })
            .unwrap();
        assert_eq!(
            hex::encode(&ct),
            "bd6d179d3e83d43b9576579493c0e939572a1700252bfaccbed2902c21396cbb\
             731c7f1b0b4aa6440bf3a82f4eda7e39ae64c6708c54c216cb96b72e1213b452\
             2f8c9ba40db5d945b11b69b982c1bb9e3f3fac2bc369488f76b2383565d3fff9\
             21f9664c97637da9768812f615c68b13b52e\
             c0875924c1c7987947deafd8780acf49"
        );
    }

    #[test]
    fn round_trip_and_wrong_key() {
        let key = [7u8; 32];
        let nonce = [9u8; 24];
        let locked = lock(b"hello", &key, &nonce);
        assert_eq!(locked.len(), 5 + 16);
        assert_eq!(unlock(&locked, &key, &nonce).unwrap(), b"hello");
        assert_eq!(unlock(&locked, &[8u8; 32], &nonce), Err(UnlockError));
        let mut tampered = locked.clone();
        tampered[0] ^= 1;
        assert_eq!(unlock(&tampered, &key, &nonce), Err(UnlockError));
    }
}
