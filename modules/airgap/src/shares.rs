//! Split chain keys for collectives (Module, section 5; Agreements rule 36).
//!
//! The seed of the collective's next chain key is split with Shamir's
//! scheme, any k of n shares rebuilding it, and the shares are dealt with
//! Pedersen commitments (Pedersen, 1991), so that each member can check,
//! alone, that their share lies on the same polynomial as every other
//! member's. The commitments hide the seed perfectly: they reveal nothing
//! about it even to an attacker with unlimited computing power, a quantum
//! computer included. What they cannot show is that the seed they commit to
//! is the one behind the collective's hash-committed SLH-DSA key; that is
//! checked once, right after dealing, by a rebuild on a second offline
//! device ([`rebuild_check`]).
//!
//! What this stops: a dealing device that hands out shares that do not
//! rebuild the committed key, so that it alone could rotate. What nothing can
//! stop: the dealing device, or the checking device, keeping a copy of the
//! key it held for a moment. That is the stated price (F97).
//!
//! The group is secp256k1. `G` is its generator; `H` is a point nobody knows
//! the logarithm of, found by hashing ([`h`]). A seed is read as a scalar,
//! big-endian; a seed at or above the group order is never dealt (the dealer
//! draws again; the chance is below 2⁻¹²⁷).

use crate::msg::{Dealing, Holder, Share};
use crate::seed::{Seed, SeedModule};
use k256::elliptic_curve::group::GroupEncoding;
use k256::elliptic_curve::PrimeField;
use k256::{AffinePoint, FieldBytes, ProjectivePoint, Scalar};
use mor_core::hash::{tagged_hash, Hash};
use mor_core::identity::ChainKeyCommit;
use rand_core::{CryptoRng, RngCore};
use std::fmt;
use std::sync::OnceLock;

/// Why shares were refused.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ShareError {
    /// The share does not lie on the committed polynomials: it was altered,
    /// or dealt dishonestly.
    NotOnPolynomial { x: u64 },
    /// A number outside 1 to n, a value outside the group, or a commitment
    /// that is not a point.
    Malformed(&'static str),
    /// Shares from different dealings.
    MixedDealings,
    /// Two shares with the same number.
    Duplicate { x: u64 },
    /// Fewer shares than the threshold.
    TooFew { have: usize, need: u64 },
    /// The dealing names a seed Module this device does not implement, or a
    /// scheme it does not sign with.
    Unsupported(&'static str),
    /// The rebuilt seed does not give the key the dealing commits to: the
    /// dealer handed out shares of another seed.
    WrongKey,
}

impl fmt::Display for ShareError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ShareError::NotOnPolynomial { x } => write!(f, "share {x} does not match the dealing's commitments"),
            ShareError::Malformed(w) => write!(f, "malformed share: {w}"),
            ShareError::MixedDealings => f.write_str("the shares come from different dealings"),
            ShareError::Duplicate { x } => write!(f, "share {x} was given twice"),
            ShareError::TooFew { have, need } => write!(f, "{have} shares; the dealing needs {need}"),
            ShareError::Unsupported(w) => write!(f, "unsupported: {w}"),
            ShareError::WrongKey => f.write_str(
                "the shares rebuild a key other than the one the dealing commits to: the dealer cheated",
            ),
        }
    }
}

impl std::error::Error for ShareError {}

type R<T> = Result<T, ShareError>;

/// `H`: the first `x` in `tagged_hash("MOR/module/airgap/pedersen-h", [i])`,
/// for i = 0, 1, …, that is the x-coordinate of a curve point, taken with
/// even y. Nobody knows its logarithm to `G`.
pub fn h() -> ProjectivePoint {
    static H: OnceLock<ProjectivePoint> = OnceLock::new();
    *H.get_or_init(|| {
        for i in 0u8..=255 {
            let x = tagged_hash(crate::tag::PEDERSEN_H, &[i]);
            let mut c = [0u8; 33];
            c[0] = 0x02;
            c[1..].copy_from_slice(&x);
            let p: Option<AffinePoint> =
                AffinePoint::from_bytes(k256::CompressedPoint::from_slice(&c)).into();
            if let Some(p) = p {
                return p.into();
            }
        }
        unreachable!("half of all x-coordinates are on the curve")
    })
}

fn scalar(b: &[u8; 32]) -> Option<Scalar> {
    Scalar::from_repr(*FieldBytes::from_slice(b)).into()
}

fn bytes(s: &Scalar) -> [u8; 32] {
    s.to_repr().into()
}

fn point(b: &[u8; 33]) -> Option<ProjectivePoint> {
    let p: Option<AffinePoint> =
        AffinePoint::from_bytes(k256::CompressedPoint::from_slice(b)).into();
    p.map(Into::into)
}

fn encode_point(p: &ProjectivePoint) -> [u8; 33] {
    p.to_affine().to_bytes().into()
}

fn random_scalar(rng: &mut (impl RngCore + CryptoRng)) -> Scalar {
    loop {
        let mut b = [0u8; 32];
        rng.fill_bytes(&mut b);
        if let Some(s) = scalar(&b) {
            return s;
        }
    }
}

/// A seed that can be dealt: its 256 bits read as a scalar below the group order.
pub fn dealable(seed: &Seed) -> bool {
    scalar(&seed.entropy).is_some()
}

/// A fresh seed that can be dealt.
pub fn fresh_dealable_seed(module: SeedModule, rng: &mut (impl RngCore + CryptoRng)) -> Seed {
    loop {
        let mut e = [0u8; 32];
        rng.fill_bytes(&mut e);
        let s = Seed::new(module, e);
        if dealable(&s) {
            return s;
        }
    }
}

fn eval(coeffs: &[Scalar], x: u64) -> Scalar {
    let x = Scalar::from(x);
    coeffs.iter().rev().fold(Scalar::ZERO, |acc, c| acc * x + c)
}

/// Deal `seed` into shares, one per holder, any `threshold` of which rebuild
/// it. The dealing commits to the key the seed gives at `index` under
/// `scheme`. The dealer then forgets the seed, which nothing can check.
pub fn deal(
    seed: &Seed,
    scheme: u8,
    index: u64,
    threshold: u64,
    holders: Vec<Holder>,
    rng: &mut (impl RngCore + CryptoRng),
) -> Vec<Share> {
    let n = holders.len() as u64;
    assert!(threshold >= 1 && threshold <= n, "1 ≤ threshold ≤ holders");
    let s = scalar(&seed.entropy).expect("a dealable seed");
    let mut f = vec![s];
    let mut g = vec![random_scalar(rng)];
    for _ in 1..threshold {
        f.push(random_scalar(rng));
        g.push(random_scalar(rng));
    }
    let hp = h();
    let commitments = f
        .iter()
        .zip(&g)
        .map(|(a, b)| encode_point(&(ProjectivePoint::GENERATOR * a + hp * b)))
        .collect();
    let key = seed.key(scheme, index);
    let dealing = Dealing {
        chain_key: ChainKeyCommit {
            scheme: key.scheme(),
            commit: key.commitment(),
        },
        seed_module: seed.module.spec(),
        index,
        threshold,
        holders,
        commitments,
    };
    (1..=n)
        .map(|x| Share {
            dealing: dealing.clone(),
            x,
            value: bytes(&eval(&f, x)),
            blinding: bytes(&eval(&g, x)),
        })
        .collect()
}

/// A member's own check: the share lies on the committed polynomials,
/// `f(x)·G + g(x)·H = Σ xʲ·Cⱼ`. Needs nothing but the share itself.
pub fn verify_share(share: &Share) -> R<()> {
    let d = &share.dealing;
    if share.x == 0 || share.x > d.holders.len() as u64 {
        return Err(ShareError::Malformed("share number outside 1 to n"));
    }
    let v = scalar(&share.value).ok_or(ShareError::Malformed("value outside the group"))?;
    let b = scalar(&share.blinding).ok_or(ShareError::Malformed("blinding outside the group"))?;
    let cs = d
        .commitments
        .iter()
        .map(point)
        .collect::<Option<Vec<_>>>()
        .ok_or(ShareError::Malformed("a commitment is not a point"))?;
    let x = Scalar::from(share.x);
    let mut rhs = ProjectivePoint::IDENTITY;
    let mut xp = Scalar::ONE;
    for c in &cs {
        rhs += *c * xp;
        xp *= x;
    }
    if ProjectivePoint::GENERATOR * v + h() * b != rhs {
        return Err(ShareError::NotOnPolynomial { x: share.x });
    }
    Ok(())
}

/// Rebuild the seed from at least `threshold` shares of one dealing, each
/// checked first, and check the result against the commitments (the
/// constant terms rebuild to C₀). Returns the seed and the dealing.
pub fn rebuild(shares: &[Share]) -> R<(Seed, Dealing)> {
    let Some(first) = shares.first() else {
        return Err(ShareError::TooFew { have: 0, need: 1 });
    };
    let d = first.dealing.clone();
    if shares.iter().any(|s| s.dealing != d) {
        return Err(ShareError::MixedDealings);
    }
    for (i, s) in shares.iter().enumerate() {
        if shares[..i].iter().any(|t| t.x == s.x) {
            return Err(ShareError::Duplicate { x: s.x });
        }
        verify_share(s)?;
    }
    if (shares.len() as u64) < d.threshold {
        return Err(ShareError::TooFew {
            have: shares.len(),
            need: d.threshold,
        });
    }
    let module = SeedModule::from_spec(&d.seed_module)
        .ok_or(ShareError::Unsupported("the dealing's seed Module"))?;
    let used = &shares[..d.threshold as usize];
    let (mut s, mut t) = (Scalar::ZERO, Scalar::ZERO);
    for (i, a) in used.iter().enumerate() {
        let xi = Scalar::from(a.x);
        let mut l = Scalar::ONE;
        for (j, b) in used.iter().enumerate() {
            if i != j {
                let xj = Scalar::from(b.x);
                l *= xj * (xj - xi).invert().unwrap();
            }
        }
        s += scalar(&a.value).unwrap() * l;
        t += scalar(&a.blinding).unwrap() * l;
    }
    let c0 = point(&d.commitments[0]).unwrap();
    if ProjectivePoint::GENERATOR * s + h() * t != c0 {
        // Unreachable when every share verified; kept as a guard.
        return Err(ShareError::MixedDealings);
    }
    Ok((Seed::new(module, bytes(&s)), d))
}

/// The key a dealing's rebuilt seed gives, checked against the dealing's
/// commitment. The error [`ShareError::WrongKey`] is the one that catches a
/// dealer who kept sole control.
pub fn rebuild_key(shares: &[Share]) -> R<(mor_core::sig::SlhKey, Dealing)> {
    let (seed, d) = rebuild(shares)?;
    let scheme = match d.chain_key.scheme {
        mor_core::act::Scheme::Founding(n @ (2 | 3)) => n,
        _ => return Err(ShareError::Unsupported("the dealing's chain-key scheme")),
    };
    let key = seed.key(scheme, d.index);
    if key.commitment() != d.chain_key.commit {
        return Err(ShareError::WrongKey);
    }
    Ok((key, d))
}

/// The check right after dealing (Module 5.1): k members bring their shares
/// to a second offline device, which rebuilds the key, compares it with the
/// commitment, and forgets it. Returns the commitment that was confirmed.
pub fn rebuild_check(shares: &[Share]) -> R<Hash> {
    let (_key, d) = rebuild_key(shares)?;
    Ok(d.chain_key.commit)
}
