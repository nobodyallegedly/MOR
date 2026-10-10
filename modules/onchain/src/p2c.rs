//! Pay-to-contract on Taproot (BIP 341): a key tweaked by a 32-byte
//! commitment gives a fresh output key, which its owner can still spend once
//! told the commitment. On this rail the commitment is the payment cMIP's
//! commitment hash; anchoring (roadmap step 14a) reuses the same tweak with a
//! batch's Merkle root.
//!
//! The output key is exactly BIP 341's, for the internal key and a Merkle
//! root: the commitment itself, or, beside the owner's own script tree, the
//! branch of the two. So any Taproot wallet spends it, by the key path with
//! the tweaked secret key, or by a script path with the commitment as the
//! sibling of the owner's scripts.

use k256::elliptic_curve::point::AffineCoordinates;
use k256::elliptic_curve::PrimeField;
use k256::schnorr::VerifyingKey;
use k256::{ProjectivePoint, Scalar};
use mor_core::hash::{tagged_hash, tagged_hash_parts};

/// BIP 341's branch hash of two nodes, sorted.
pub fn tap_branch(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let (lo, hi) = if a <= b { (a, b) } else { (b, a) };
    tagged_hash_parts("TapBranch", &[lo, hi])
}

/// The Merkle root an output commits to: the commitment, or the branch of
/// the owner's script tree and the commitment.
pub fn root(tree: Option<&[u8; 32]>, commitment: &[u8; 32]) -> [u8; 32] {
    match tree {
        None => *commitment,
        Some(t) => tap_branch(t, commitment),
    }
}

/// BIP 341's tweak of an internal key by a Merkle root: `TapTweak(key ||
/// root)`, which must be below the curve order.
pub fn tweak(key: &[u8; 32], root: &[u8; 32]) -> Option<Scalar> {
    let t = tagged_hash_parts("TapTweak", &[key, root]);
    Option::from(Scalar::from_repr(t.into()))
}

/// The x-only output key for an x-only internal key and a Merkle root:
/// `lift_x(key) + t·G`. `None` where the key is not on the curve, the tweak
/// is not below the curve order, or the sum is the point at infinity.
pub fn output_key(key: &[u8; 32], root: &[u8; 32]) -> Option<[u8; 32]> {
    let p = VerifyingKey::from_bytes(key).ok()?;
    let t = tweak(key, root)?;
    let q = ProjectivePoint::from(*p.as_affine()) + ProjectivePoint::GENERATOR * t;
    if q == ProjectivePoint::IDENTITY {
        return None;
    }
    Some(q.to_affine().x().into())
}

/// The output key paying a commitment to an address's key and tree.
pub fn pay_to_contract(key: &[u8; 32], tree: Option<&[u8; 32]>, commitment: &[u8; 32]) -> Option<[u8; 32]> {
    output_key(key, &root(tree, commitment))
}

/// The message the payee's side signs for a commitment: its request.
pub fn request_message(commitment: &[u8; 32]) -> [u8; 32] {
    tagged_hash("MOR/module/onchain/request", commitment)
}

/// The request message, naming the confirmations where the payee's side
/// asks for more than the Module's minimum (F205): the commitment, then the
/// number as eight bytes, big-endian. With none, [`request_message`].
pub fn request_message_for(commitment: &[u8; 32], confirmations: Option<u64>) -> [u8; 32] {
    match confirmations {
        None => request_message(commitment),
        Some(k) => tagged_hash_parts("MOR/module/onchain/request", &[commitment, &k.to_be_bytes()]),
    }
}
