//! Running summaries (Envelopes, "Sequences").
//!
//! The running summary of a sequence is the root of a Merkle mountain range
//! over the act ids of the sequence, in order:
//!
//! - leaves are `tagged_hash("MOR/mmr-leaf", act id)`;
//! - internal nodes are `tagged_hash("MOR/mmr-node", left || right)`;
//! - the range is a list of perfect binary trees ("peaks"), highest on the
//!   left, as the binary digits of the number of leaves;
//! - the peaks are bagged right to left, each pair hashed as a node:
//!   the rightmost peak is the start, and each peak to its left is hashed
//!   with it as `node(peak, bagged so far)`;
//! - the root of a single peak is that peak; the root of no acts is the
//!   empty summary, 32 zero bytes.
//!
//! An act carries the summary of its sequence up to and including the
//! previous act (the first act carries the empty summary). A rotation's kept
//! tip carries the summary including the tip itself (Identity).

use crate::hash::{tag, tagged_hash, tagged_hash_parts, Hash, ZERO_HASH};

/// The leaf hash of an act id.
pub fn leaf(act_id: &Hash) -> Hash {
    tagged_hash(tag::MMR_LEAF, act_id)
}

/// An internal node over two children.
pub fn node(left: &Hash, right: &Hash) -> Hash {
    tagged_hash_parts(tag::MMR_NODE, &[left, right])
}

/// A Merkle mountain range, kept as its peaks, so acts can be added one by one.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Mmr {
    /// The peaks, left to right, each with its height (0 for a lone leaf).
    peaks: Vec<(u32, Hash)>,
    len: u64,
}

impl Mmr {
    /// An empty range.
    pub fn new() -> Self {
        Self::default()
    }

    /// A range over the given act ids, in order.
    pub fn from_ids<'a>(ids: impl IntoIterator<Item = &'a Hash>) -> Self {
        let mut m = Self::new();
        for id in ids {
            m.push(id);
        }
        m
    }

    /// The number of acts in the range.
    pub fn len(&self) -> u64 {
        self.len
    }

    /// Whether the range is empty.
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Add the next act of the sequence.
    pub fn push(&mut self, act_id: &Hash) {
        let mut h = leaf(act_id);
        let mut height = 0;
        while let Some(&(ph, left)) = self.peaks.last() {
            if ph != height {
                break;
            }
            self.peaks.pop();
            h = node(&left, &h);
            height += 1;
        }
        self.peaks.push((height, h));
        self.len += 1;
    }

    /// The peaks, left to right.
    pub fn peaks(&self) -> impl Iterator<Item = &Hash> {
        self.peaks.iter().map(|(_, h)| h)
    }

    /// The running summary: the peaks bagged right to left; 32 zero bytes if empty.
    pub fn root(&self) -> Hash {
        let mut it = self.peaks.iter().rev();
        let Some(&(_, mut acc)) = it.next() else {
            return ZERO_HASH;
        };
        for (_, p) in it {
            acc = node(p, &acc);
        }
        acc
    }
}

/// The running summary over these act ids, in order.
pub fn summary<'a>(ids: impl IntoIterator<Item = &'a Hash>) -> Hash {
    Mmr::from_ids(ids).root()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::hash::sha256;

    fn ids(n: u8) -> Vec<Hash> {
        (1..=n).map(|i| sha256(&[i])).collect()
    }

    #[test]
    fn small_ranges_by_hand() {
        let a = ids(7);
        let l: Vec<Hash> = a.iter().map(leaf).collect();
        assert_eq!(summary(&a[..0]), ZERO_HASH);
        assert_eq!(summary(&a[..1]), l[0]);
        assert_eq!(summary(&a[..2]), node(&l[0], &l[1]));
        assert_eq!(summary(&a[..3]), node(&node(&l[0], &l[1]), &l[2]));
        let n01 = node(&l[0], &l[1]);
        let n23 = node(&l[2], &l[3]);
        let n0123 = node(&n01, &n23);
        assert_eq!(summary(&a[..4]), n0123);
        assert_eq!(summary(&a[..5]), node(&n0123, &l[4]));
        let n45 = node(&l[4], &l[5]);
        assert_eq!(summary(&a[..6]), node(&n0123, &n45));
        // Seven: peaks of heights 2, 1, 0, bagged right to left.
        assert_eq!(summary(&a[..7]), node(&n0123, &node(&n45, &l[6])));
    }

    #[test]
    fn peaks_follow_the_binary_digits() {
        let a = ids(200);
        let mut m = Mmr::new();
        for (i, id) in a.iter().enumerate() {
            m.push(id);
            assert_eq!(m.peaks().count() as u32, (i as u64 + 1).count_ones());
            assert_eq!(m.len(), i as u64 + 1);
        }
    }
}
