//! A home's receipt log as a Merkle tree (Identity, "Log summary").
//!
//! Built as in RFC 9162, section 2.1, with SHA-256. The leaves are the
//! receipts' act ids, in log order; a receipt's log position is its index.
//!
//! - `MTH({}) = SHA-256()`
//! - `MTH({d}) = SHA-256(0x00 || d)`
//! - `MTH(D[n]) = SHA-256(0x01 || MTH(D[0:k]) || MTH(D[k:n]))`, `k` the
//!   largest power of two smaller than `n`.
//!
//! Proofs are not acts: a home serves them on request (relay transport cMIP,
//! "Log summaries and proofs"), and they are checked here against a signed
//! summary's size and root, so they need no trust.

use crate::hash::{sha256, Hash};
use sha2::{Digest, Sha256};

fn leaf_hash(d: &Hash) -> Hash {
    let mut h = Sha256::new();
    h.update([0u8]);
    h.update(d);
    h.finalize().into()
}

fn node_hash(l: &Hash, r: &Hash) -> Hash {
    let mut h = Sha256::new();
    h.update([1u8]);
    h.update(l);
    h.update(r);
    h.finalize().into()
}

/// The largest power of two smaller than `n` (`n >= 2`).
fn split(n: usize) -> usize {
    let mut k = 1;
    while k * 2 < n {
        k *= 2;
    }
    k
}

fn mth(d: &[Hash]) -> Hash {
    match d.len() {
        0 => sha256(&[]),
        1 => leaf_hash(&d[0]),
        n => {
            let k = split(n);
            node_hash(&mth(&d[..k]), &mth(&d[k..]))
        }
    }
}

/// The root over these act ids, in log order.
pub fn root(ids: &[Hash]) -> Hash {
    mth(ids)
}

/// The inclusion proof for the leaf at `index` (RFC 9162, 2.1.3.1).
pub fn inclusion_proof(ids: &[Hash], index: usize) -> Vec<Hash> {
    assert!(index < ids.len());
    fn path(m: usize, d: &[Hash]) -> Vec<Hash> {
        if d.len() <= 1 {
            return vec![];
        }
        let k = split(d.len());
        if m < k {
            let mut p = path(m, &d[..k]);
            p.push(mth(&d[k..]));
            p
        } else {
            let mut p = path(m - k, &d[k..]);
            p.push(mth(&d[..k]));
            p
        }
    }
    path(index, ids)
}

/// Check that `id` is the leaf at `index` of a tree of `size` leaves with
/// this `root` (RFC 9162, 2.1.3.2).
pub fn verify_inclusion(id: &Hash, index: u64, size: u64, root: &Hash, proof: &[Hash]) -> bool {
    if index >= size {
        return false;
    }
    let (mut f, mut s) = (index, size - 1);
    let mut r = leaf_hash(id);
    for p in proof {
        if s == 0 {
            return false;
        }
        if f & 1 == 1 || f == s {
            r = node_hash(p, &r);
            while f & 1 == 0 && f != 0 {
                f >>= 1;
                s >>= 1;
            }
        } else {
            r = node_hash(&r, p);
        }
        f >>= 1;
        s >>= 1;
    }
    s == 0 && r == *root
}

/// The consistency proof from the first `old` leaves to all of `ids`
/// (RFC 9162, 2.1.4.1). `0 < old <= ids.len()`.
pub fn consistency_proof(ids: &[Hash], old: usize) -> Vec<Hash> {
    assert!(0 < old && old <= ids.len());
    fn sub(m: usize, d: &[Hash], whole: bool) -> Vec<Hash> {
        let n = d.len();
        if m == n {
            return if whole { vec![] } else { vec![mth(d)] };
        }
        let k = split(n);
        if m <= k {
            let mut p = sub(m, &d[..k], whole);
            p.push(mth(&d[k..]));
            p
        } else {
            let mut p = sub(m - k, &d[k..], false);
            p.push(mth(&d[..k]));
            p
        }
    }
    sub(old, ids, true)
}

/// Check that the tree of `new_size` leaves with `new_root` extends the
/// tree of `old_size` leaves with `old_root` (RFC 9162, 2.1.4.2).
pub fn verify_consistency(
    old_size: u64,
    old_root: &Hash,
    new_size: u64,
    new_root: &Hash,
    proof: &[Hash],
) -> bool {
    if old_size == 0 || old_size > new_size {
        return false;
    }
    if old_size == new_size {
        return proof.is_empty() && old_root == new_root;
    }
    let mut path: Vec<Hash> = Vec::with_capacity(proof.len() + 1);
    if old_size.is_power_of_two() {
        path.push(*old_root);
    }
    path.extend_from_slice(proof);
    let Some((first, rest)) = path.split_first() else {
        return false;
    };
    let (mut f, mut s) = (old_size - 1, new_size - 1);
    while f & 1 == 1 {
        f >>= 1;
        s >>= 1;
    }
    let (mut fr, mut sr) = (*first, *first);
    for c in rest {
        if s == 0 {
            return false;
        }
        if f & 1 == 1 || f == s {
            fr = node_hash(c, &fr);
            sr = node_hash(c, &sr);
            while f & 1 == 0 && f != 0 {
                f >>= 1;
                s >>= 1;
            }
        } else {
            sr = node_hash(&sr, c);
        }
        f >>= 1;
        s >>= 1;
    }
    s == 0 && fr == *old_root && sr == *new_root
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ids(n: usize) -> Vec<Hash> {
        (0..n).map(|i| sha256(&(i as u64).to_be_bytes())).collect()
    }

    #[test]
    fn small_trees_by_hand() {
        let d = ids(3);
        let l: Vec<Hash> = d.iter().map(leaf_hash).collect();
        assert_eq!(root(&[]), sha256(&[]));
        assert_eq!(root(&d[..1]), l[0]);
        assert_eq!(root(&d[..2]), node_hash(&l[0], &l[1]));
        assert_eq!(root(&d), node_hash(&node_hash(&l[0], &l[1]), &l[2]));
    }

    #[test]
    fn every_inclusion_proof_verifies_and_no_other() {
        for n in 1..=20 {
            let d = ids(n);
            let r = root(&d);
            for i in 0..n {
                let p = inclusion_proof(&d, i);
                assert!(verify_inclusion(&d[i], i as u64, n as u64, &r, &p));
                // The wrong leaf, the wrong index: both fail. (The size is not bound by
                // the proof alone, but it is signed with the root in the summary.)
                assert!(!verify_inclusion(&d[(i + 1) % n], i as u64, n as u64, &r, &p) || n == 1);
                assert!(
                    !verify_inclusion(&d[i], (i as u64 + 1) % n as u64, n as u64, &r, &p) || n == 1
                );
                // An index outside the tree.
                assert!(!verify_inclusion(&d[i], n as u64, n as u64, &r, &p));
            }
        }
    }

    #[test]
    fn every_consistency_proof_verifies_and_a_fork_does_not() {
        for n in 1..=20 {
            let d = ids(n);
            for m in 1..=n {
                let p = consistency_proof(&d, m);
                assert!(
                    verify_consistency(m as u64, &root(&d[..m]), n as u64, &root(&d), &p),
                    "{m} -> {n}"
                );
                if m < n {
                    // A log that rewrote its past does not extend the old one.
                    let mut forked = d.clone();
                    forked[m - 1] = sha256(b"rewritten");
                    let p = consistency_proof(&forked, m);
                    assert!(!verify_consistency(
                        m as u64,
                        &root(&d[..m]),
                        n as u64,
                        &root(&forked),
                        &p
                    ));
                }
            }
        }
    }
}
