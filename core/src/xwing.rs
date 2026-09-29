//! X-Wing, the hybrid key exchange for encryption keys and sealed
//! containers (Envelope, "Encryption keys and key delivery"; F98).
//!
//! In plain words: a recipient publishes a public key made of two halves,
//! one post-quantum (ML-KEM-768) and one classical (X25519). A sender uses
//! it to produce a fresh 32-byte secret and a ciphertext; only the holder of
//! the private key recovers the same secret from the ciphertext. The two
//! halves' secrets are hashed together, so what is locked stays locked if
//! either half holds.
//!
//! Precisely: X-Wing as specified in draft-connolly-cfrg-xwing-kem-11,
//! "X-Wing Construction": the 32-byte decapsulation key is expanded with
//! SHAKE256 into ML-KEM-768 key-generation seeds `d`, `z` and an X25519
//! secret; the encapsulation key is `pk_M ‖ pk_X` (1216 bytes); the
//! ciphertext `ct_M ‖ ct_X` (1120 bytes); the shared secret
//! `SHA3-256(ss_M ‖ ss_X ‖ ct_X ‖ pk_X ‖ "\./" ‖ "/^\")`.
//!
//! As everywhere in this library, randomness is the caller's: key
//! generation takes the 32-byte key, encapsulation the 64-byte `eseed`.

use fips203::ml_kem_768;
use fips203::traits::{Decaps, Encaps, KeyGen, SerDes};
use sha3::digest::{ExtendableOutput, Update, XofReader};
use sha3::{Digest, Sha3_256, Shake256};

/// The 32-byte private key (the draft's decapsulation key `sk`).
pub type SecretKey = [u8; 32];

pub const PUBLIC_LEN: usize = 1216;
pub const CIPHERTEXT_LEN: usize = 1120;
const PK_M: usize = 1184;
const CT_M: usize = 1088;

/// `XWingLabel`, `5c2e2f2f5e5c`.
pub const LABEL: &[u8; 6] = b"\\.//^\\";

/// Why an X-Wing input was refused.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum XWingError {
    /// A public key or ciphertext of the wrong length.
    Length,
    /// The ML-KEM half of a public key fails FIPS 203's input check (§7.2).
    PublicKey,
    /// ML-KEM decapsulation refused the ciphertext.
    Ciphertext,
}

impl std::fmt::Display for XWingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            XWingError::Length => "X-Wing: wrong length",
            XWingError::PublicKey => "X-Wing: the ML-KEM public key fails the input check",
            XWingError::Ciphertext => "X-Wing: the ciphertext is refused",
        })
    }
}

impl std::error::Error for XWingError {}

struct Expanded {
    dk_m: ml_kem_768::DecapsKey,
    pk_m: [u8; PK_M],
    sk_x: x25519_dalek::StaticSecret,
    pk_x: [u8; 32],
}

fn expand(sk: &SecretKey) -> Expanded {
    let mut xof = Shake256::default();
    xof.update(sk);
    let mut e = [0u8; 96];
    xof.finalize_xof().read(&mut e);
    let d: [u8; 32] = e[0..32].try_into().unwrap();
    let z: [u8; 32] = e[32..64].try_into().unwrap();
    let x: [u8; 32] = e[64..96].try_into().unwrap();
    let (ek_m, dk_m) = ml_kem_768::KG::keygen_from_seed(d, z);
    let sk_x = x25519_dalek::StaticSecret::from(x);
    let pk_x = x25519_dalek::PublicKey::from(&sk_x).to_bytes();
    e.fill(0);
    Expanded {
        dk_m,
        pk_m: ek_m.into_bytes(),
        sk_x,
        pk_x,
    }
}

fn combine(ss_m: &[u8], ss_x: &[u8; 32], ct_x: &[u8; 32], pk_x: &[u8; 32]) -> [u8; 32] {
    let mut h = Sha3_256::new();
    Digest::update(&mut h, ss_m);
    Digest::update(&mut h, ss_x);
    Digest::update(&mut h, ct_x);
    Digest::update(&mut h, pk_x);
    Digest::update(&mut h, LABEL);
    h.finalize().into()
}

/// The public key (encapsulation key) of a private key: the draft's
/// `GenerateKeyPairDerand(sk)`.
pub fn public_key(sk: &SecretKey) -> Vec<u8> {
    let e = expand(sk);
    let mut pk = Vec::with_capacity(PUBLIC_LEN);
    pk.extend_from_slice(&e.pk_m);
    pk.extend_from_slice(&e.pk_x);
    pk
}

/// A fresh shared secret for the holder of `pk`, and the ciphertext that
/// carries it: the draft's `EncapsulateDerand(pk, eseed)`. `eseed` must be
/// fresh randomness for every call.
pub fn encapsulate(pk: &[u8], eseed: &[u8; 64]) -> Result<([u8; 32], Vec<u8>), XWingError> {
    if pk.len() != PUBLIC_LEN {
        return Err(XWingError::Length);
    }
    let pk_m: [u8; PK_M] = pk[..PK_M].try_into().unwrap();
    let pk_x: [u8; 32] = pk[PK_M..].try_into().unwrap();
    let ek_m = ml_kem_768::EncapsKey::try_from_bytes(pk_m).map_err(|_| XWingError::PublicKey)?;
    let ek_x = x25519_dalek::StaticSecret::from(<[u8; 32]>::try_from(&eseed[32..64]).unwrap());
    let ct_x = x25519_dalek::PublicKey::from(&ek_x).to_bytes();
    let ss_x = ek_x
        .diffie_hellman(&x25519_dalek::PublicKey::from(pk_x))
        .to_bytes();
    let m: [u8; 32] = eseed[0..32].try_into().unwrap();
    let (ss_m, ct_m) = ek_m.encaps_from_seed(&m);
    let ss = combine(&ss_m.into_bytes(), &ss_x, &ct_x, &pk_x);
    let mut ct = Vec::with_capacity(CIPHERTEXT_LEN);
    ct.extend_from_slice(&ct_m.into_bytes());
    ct.extend_from_slice(&ct_x);
    Ok((ss, ct))
}

/// The shared secret a ciphertext carries, for the holder of `sk`: the
/// draft's `Decapsulate(ct, sk)`. A ciphertext made for another key gives a
/// different, useless secret, not an error (ML-KEM's implicit rejection);
/// what the secret then fails to open says so.
pub fn decapsulate(sk: &SecretKey, ct: &[u8]) -> Result<[u8; 32], XWingError> {
    if ct.len() != CIPHERTEXT_LEN {
        return Err(XWingError::Length);
    }
    let e = expand(sk);
    let ct_m: [u8; CT_M] = ct[..CT_M].try_into().unwrap();
    let ct_x: [u8; 32] = ct[CT_M..].try_into().unwrap();
    let ct_m = ml_kem_768::CipherText::try_from_bytes(ct_m).map_err(|_| XWingError::Ciphertext)?;
    let ss_m = e
        .dk_m
        .try_decaps(&ct_m)
        .map_err(|_| XWingError::Ciphertext)?;
    let ss_x = e
        .sk_x
        .diffie_hellman(&x25519_dalek::PublicKey::from(ct_x))
        .to_bytes();
    Ok(combine(&ss_m.into_bytes(), &ss_x, &ct_x, &e.pk_x))
}
