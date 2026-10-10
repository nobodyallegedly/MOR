//! The batch tree (anchoring cMIP draft 2, "The batch"): the Merkle tree a
//! pooled anchoring service builds over the hashes it was paid to anchor,
//! whose root it commits to on a clock (on Bitcoin, by pay-to-contract).
//!
//! - **Domain-separated** (review 7d; section 9, item 6): a leaf, an inner
//!   node and the root are tagged hashes under three different tags, none
//!   of them the payment cMIP's commitment tag. So a batch root never
//!   equals a payment commitment (a service choosing its leaves cannot make
//!   its output read as a payment on the on-chain rail), a batch of one leaf
//!   has a root that is not the leaf, and an inner node is never read as a
//!   leaf.
//! - **The root binds the number of leaves**: `root = H_root(count || top)`,
//!   so a proof's length is fixed by the count, and an index past the leaves
//!   is refused.
//! - **One canonical proof per leaf** (F200 applied to the batch): rows are
//!   built as Bitcoin builds its own (an odd row repeats its last node), and
//!   wherever a sibling equals the running hash only the left position is a
//!   proof. With the count bound, the twin index is past the leaves anyway;
//!   the rule is kept as Bitcoin's is, so the batch reads as the block does.
//!
//! *Mechanics, the build's: the three tags; the count in the root (eight
//! bytes, big-endian); the leaf as the act and a blind; Bitcoin's repeated
//! last node; a batch never holding two equal leaves.*

use mor_core::hash::{tagged_hash_parts, Hash};

pub const LEAF_TAG: &str = "MOR/cmip/anchoring/leaf";
pub const NODE_TAG: &str = "MOR/cmip/anchoring/node";
pub const ROOT_TAG: &str = "MOR/cmip/anchoring/root";

/// A leaf: the act anchored and a blind of 32 bytes the payer chooses at
/// random (client conformance), so the service, and anyone reading a
/// published batch, learns nothing of the act from the leaf (privacy,
/// review section 9, item 8). Whoever relies on the anchor is shown the
/// blind with the proof.
pub fn leaf(act: &Hash, blind: &[u8; 32]) -> Hash {
    tagged_hash_parts(LEAF_TAG, &[act, blind])
}

/// An inner node: its two children, left then right.
pub fn node(left: &Hash, right: &Hash) -> Hash {
    tagged_hash_parts(NODE_TAG, &[left, right])
}

/// The batch root: the number of leaves and the top node.
pub fn root(count: u64, top: &Hash) -> Hash {
    tagged_hash_parts(ROOT_TAG, &[&count.to_be_bytes(), top])
}

/// The length of every proof in a batch of `count` leaves: the number of
/// rows above the leaves.
pub fn depth(count: u64) -> usize {
    let (mut n, mut d) = (count, 0);
    while n > 1 {
        n = n.div_ceil(2);
        d += 1;
    }
    d
}

fn rows(leaves: &[Hash]) -> Vec<Vec<Hash>> {
    let mut rows = vec![leaves.to_vec()];
    while rows.last().unwrap().len() > 1 {
        let mut row = rows.last().unwrap().clone();
        if row.len() % 2 == 1 {
            row.push(*row.last().unwrap());
        }
        rows.push(row.chunks(2).map(|p| node(&p[0], &p[1])).collect());
    }
    rows
}

/// A batch: its leaves, in the order the service put them.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Batch {
    leaves: Vec<Hash>,
}

impl Batch {
    /// A batch of these leaves; `None` where there are none, or two are
    /// equal (one payment, one leaf).
    pub fn new(leaves: Vec<Hash>) -> Option<Batch> {
        let distinct: std::collections::BTreeSet<_> = leaves.iter().collect();
        (!leaves.is_empty() && distinct.len() == leaves.len()).then_some(Batch { leaves })
    }

    pub fn leaves(&self) -> &[Hash] {
        &self.leaves
    }

    pub fn count(&self) -> u64 {
        self.leaves.len() as u64
    }

    pub fn root(&self) -> Hash {
        root(self.count(), &rows(&self.leaves).last().unwrap()[0])
    }

    /// The proof of the leaf at `index`: its siblings, from the leaves up.
    pub fn branch(&self, index: u64) -> Option<Vec<Hash>> {
        let mut i = usize::try_from(index).ok()?;
        if i >= self.leaves.len() {
            return None;
        }
        let rows = rows(&self.leaves);
        let mut out = vec![];
        for row in &rows[..rows.len() - 1] {
            let sib = i ^ 1;
            out.push(if sib < row.len() { row[sib] } else { row[i] });
            i /= 2;
        }
        Some(out)
    }

    /// Where a leaf is, if it is in the batch.
    pub fn index_of(&self, leaf: &Hash) -> Option<u64> {
        self.leaves.iter().position(|l| l == leaf).map(|i| i as u64)
    }
}

/// The root a proof gives for `leaf` at `index` in a batch of `count`
/// leaves; `None` where the index is past the leaves, the branch is not
/// exactly the batch's depth, or the index is not canonical (F200).
pub fn verify(leaf: &Hash, index: u64, count: u64, branch: &[Hash]) -> Option<Hash> {
    if count == 0 || index >= count || branch.len() != depth(count) {
        return None;
    }
    let mut h = *leaf;
    for (level, s) in branch.iter().enumerate() {
        let right = (index >> level) & 1 == 1;
        if right && s == &h {
            return None;
        }
        h = if right { node(s, &h) } else { node(&h, s) };
    }
    Some(root(count, &h))
}
