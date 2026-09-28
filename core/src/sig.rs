//! Signatures (Identity, "Signature schemes").
//!
//! | Scheme | Name | Public key | Signature |
//! | --- | --- | --- | --- |
//! | 1 | Schnorr over secp256k1 (BIP-340) | 32 bytes (x-only) | 64 bytes |
//! | 2 | SLH-DSA-SHA2-128s (FIPS 205) | 32 bytes | 7,856 bytes |
//! | 3 | SLH-DSA-SHA2-128f (FIPS 205) | 32 bytes | 17,088 bytes |
//! | hash | as the specification defines | | |
//!
//! A signature always signs the 32-byte act id. SLH-DSA signatures use the
//! context string `MOR` (FIPS 205 pure signing, no pre-hash). A scheme named
//! by specification hash is one this library does not implement: the act is
//! unknown, never valid.
//!
//! Schnorr is the `k256` crate (RustCrypto); SLH-DSA is the `fips205` crate
//! (IntegrityChain), adopted by Nobody, allegedly on condition that the tests check every
//! SLH-DSA signature against a second, independent implementation.
//!
//! Signing is here too, for tests and for the clients through WebAssembly.
//! Like the rest of the library it never draws randomness: the caller gives
//! the keys' seeds and any auxiliary randomness.

use crate::act::{Scheme, Signature};
use crate::hash::{tag, tagged_hash_parts, Hash};
use fips205::traits::{KeyGen, SerDes, Signer, Verifier};
use fips205::{slh_dsa_sha2_128f as f128, slh_dsa_sha2_128s as s128};

/// The FIPS 205 context string every MOR SLH-DSA signature uses.
pub const SLH_CONTEXT: &[u8] = b"MOR";

/// Schnorr over secp256k1 (BIP-340), for signing keys.
pub const SCHNORR: Scheme = Scheme::Founding(1);
/// SLH-DSA-SHA2-128s, for safety keys (recommended).
pub const SLH_128S: Scheme = Scheme::Founding(2);
/// SLH-DSA-SHA2-128f, for safety keys.
pub const SLH_128F: Scheme = Scheme::Founding(3);

/// The answer to "is this signature valid for this act id?".
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Verdict {
    Valid,
    /// Wrong key or signature length, a key that is not a key, or a
    /// signature that does not verify.
    Invalid,
    /// A scheme this library does not implement: the act is unknown.
    Unknown,
}

/// The public key and signature lengths of a founding scheme.
pub fn lengths(scheme: &Scheme) -> Option<(usize, usize)> {
    match scheme {
        Scheme::Founding(1) => Some((32, 64)),
        Scheme::Founding(2) => Some((32, s128::SIG_LEN)),
        Scheme::Founding(3) => Some((32, f128::SIG_LEN)),
        _ => None,
    }
}

/// Whether a scheme is a safety-key scheme this library implements.
pub fn is_slh(scheme: &Scheme) -> bool {
    matches!(scheme, Scheme::Founding(2) | Scheme::Founding(3))
}

/// Verify a signature over an act id (Identity, "Every act", step 4).
pub fn verify(sig: &Signature, act_id: &Hash) -> Verdict {
    let Some((klen, slen)) = lengths(&sig.scheme) else {
        return Verdict::Unknown;
    };
    if sig.key.len() != klen || sig.sig.len() != slen {
        return Verdict::Invalid;
    }
    let ok = match sig.scheme {
        Scheme::Founding(1) => verify_schnorr(&sig.key, &sig.sig, act_id),
        Scheme::Founding(2) => {
            let key: [u8; s128::PK_LEN] = sig.key.as_slice().try_into().unwrap();
            let s: [u8; s128::SIG_LEN] = sig.sig.as_slice().try_into().unwrap();
            s128::PublicKey::try_from_bytes(&key)
                .map(|pk| pk.verify(act_id, &s, SLH_CONTEXT))
                .unwrap_or(false)
        }
        Scheme::Founding(3) => {
            let key: [u8; f128::PK_LEN] = sig.key.as_slice().try_into().unwrap();
            let s: [u8; f128::SIG_LEN] = sig.sig.as_slice().try_into().unwrap();
            f128::PublicKey::try_from_bytes(&key)
                .map(|pk| pk.verify(act_id, &s, SLH_CONTEXT))
                .unwrap_or(false)
        }
        _ => unreachable!(),
    };
    if ok {
        Verdict::Valid
    } else {
        Verdict::Invalid
    }
}

fn verify_schnorr(key: &[u8], sig: &[u8], msg: &Hash) -> bool {
    use k256::schnorr::{Signature as S, VerifyingKey};
    let Ok(vk) = VerifyingKey::from_bytes(key) else {
        return false;
    };
    let Ok(s) = S::try_from(sig) else {
        return false;
    };
    vk.verify_raw(msg, &s).is_ok()
}

/// The scheme's bytes as a safety commitment hashes them: the one-byte
/// number, or the 32-byte specification hash.
pub fn scheme_bytes(scheme: &Scheme) -> Vec<u8> {
    match scheme {
        Scheme::Founding(n) => vec![*n],
        Scheme::Spec(h) => h.to_vec(),
    }
}

/// A safety key commitment: `tagged_hash("MOR/safety", scheme || key)`.
pub fn safety_commitment(scheme: &Scheme, key: &[u8]) -> Hash {
    tagged_hash_parts(tag::SAFETY, &[&scheme_bytes(scheme), key])
}

// ---------------------------------------------------------------- signing

/// A Schnorr signing key (BIP-340), from its 32-byte secret.
#[derive(Clone)]
pub struct SchnorrKey(k256::schnorr::SigningKey);

impl SchnorrKey {
    /// Fails only if the secret is zero or not below the group order.
    pub fn from_secret(secret: &[u8; 32]) -> Option<Self> {
        k256::schnorr::SigningKey::from_bytes(secret).ok().map(Self)
    }

    /// The 32-byte x-only public key.
    pub fn public(&self) -> [u8; 32] {
        self.0.verifying_key().to_bytes().into()
    }

    /// Sign an act id. `aux` is BIP-340's auxiliary randomness; the caller
    /// draws it fresh (zeros are allowed and deterministic).
    pub fn sign(&self, act_id: &Hash, aux: &[u8; 32]) -> Signature {
        let s = self.0.sign_raw(act_id, aux).expect("BIP-340 signing");
        Signature {
            scheme: SCHNORR,
            key: self.public().to_vec(),
            sig: s.to_bytes().to_vec(),
        }
    }
}

/// An SLH-DSA key pair, SHA2-128s (scheme 2) or SHA2-128f (scheme 3).
#[derive(Clone)]
pub enum SlhKey {
    S(s128::PrivateKey),
    F(f128::PrivateKey),
}

impl SlhKey {
    /// A key pair from FIPS 205's three 16-byte seeds (`slh_keygen_internal`).
    /// `scheme` is 2 or 3.
    pub fn from_seeds(
        scheme: u8,
        sk_seed: &[u8; 16],
        sk_prf: &[u8; 16],
        pk_seed: &[u8; 16],
    ) -> Self {
        match scheme {
            2 => SlhKey::S(s128::KG::keygen_with_seeds(sk_seed, sk_prf, pk_seed).1),
            3 => SlhKey::F(f128::KG::keygen_with_seeds(sk_seed, sk_prf, pk_seed).1),
            _ => panic!("SLH-DSA schemes are 2 and 3"),
        }
    }

    pub fn scheme(&self) -> Scheme {
        match self {
            SlhKey::S(_) => SLH_128S,
            SlhKey::F(_) => SLH_128F,
        }
    }

    /// The 32-byte public key: `pk_seed || pk_root`.
    pub fn public(&self) -> Vec<u8> {
        match self {
            SlhKey::S(k) => k.get_public_key().into_bytes().to_vec(),
            SlhKey::F(k) => k.get_public_key().into_bytes().to_vec(),
        }
    }

    /// The commitment that must precede this key's use.
    pub fn commitment(&self) -> Hash {
        safety_commitment(&self.scheme(), &self.public())
    }

    /// Sign an act id, context `MOR`. With `opt_rand` absent the signature is
    /// deterministic (FIPS 205's `opt_rand = pk_seed`); otherwise it is
    /// hedged with the caller's 16 fresh bytes.
    pub fn sign(&self, act_id: &Hash, opt_rand: Option<&[u8; 16]>) -> Signature {
        let mut rng = GivenBytes(opt_rand.map(|r| r.to_vec()).unwrap_or_default());
        let hedged = opt_rand.is_some();
        let sig = match self {
            SlhKey::S(k) => k
                .try_sign_with_rng(&mut rng, act_id, SLH_CONTEXT, hedged)
                .expect("SLH-DSA signing")
                .to_vec(),
            SlhKey::F(k) => k
                .try_sign_with_rng(&mut rng, act_id, SLH_CONTEXT, hedged)
                .expect("SLH-DSA signing")
                .to_vec(),
        };
        Signature {
            scheme: self.scheme(),
            key: self.public(),
            sig,
        }
    }
}

/// A "random" source that yields exactly the bytes the caller supplied, so
/// the library itself never draws randomness.
struct GivenBytes(Vec<u8>);

impl rand_core::RngCore for GivenBytes {
    fn next_u32(&mut self) -> u32 {
        unimplemented!("SLH-DSA draws bytes only")
    }
    fn next_u64(&mut self) -> u64 {
        unimplemented!("SLH-DSA draws bytes only")
    }
    fn fill_bytes(&mut self, dest: &mut [u8]) {
        self.try_fill_bytes(dest)
            .expect("opt_rand has the wrong length")
    }
    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand_core::Error> {
        if dest.len() > self.0.len() {
            let code = core::num::NonZeroU32::new(rand_core::Error::CUSTOM_START).unwrap();
            return Err(rand_core::Error::from(code));
        }
        let rest = self.0.split_off(dest.len());
        dest.copy_from_slice(&self.0);
        self.0 = rest;
        Ok(())
    }
}

impl rand_core::CryptoRng for GivenBytes {}
