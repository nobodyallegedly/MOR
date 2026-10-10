//! The batch tree (anchoring cMIP draft 2, "The batch"): domain-separated,
//! one canonical proof per leaf (review 7d and section 9, item 6; F200).

use mor_anchoring::tree::{self, Batch};
use mor_core::money::{Amount, Payer};
use mor_core::hash::{sha256, Hash};
use mor_payment::{Commitment, PaidTo};

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn leaves(n: usize) -> Vec<Hash> {
    (0..n).map(|i| tree::leaf(&h(&format!("act {i}")), &h(&format!("blind {i}")))).collect()
}

/// Every leaf of every batch from one to seventeen leaves has a proof that
/// gives the batch's root, and exactly one: where a row is odd and its last
/// node is repeated, the twin position (the index Bitcoin's own tree would
/// also accept, F200) is refused, as is any index past the leaves and any
/// branch of the wrong length.
#[test]
fn every_leaf_has_one_proof_and_its_twin_is_refused() {
    for n in 1..=17u64 {
        let b = Batch::new(leaves(n as usize)).unwrap();
        assert_eq!(b.count(), n);
        for i in 0..n {
            let br = b.branch(i).unwrap();
            assert_eq!(br.len(), tree::depth(n));
            assert_eq!(tree::verify(&b.leaves()[i as usize], i, n, &br), Some(b.root()), "batch of {n}, leaf {i}");
            // Every other index with the same branch: refused, or another root.
            for j in 0..(1u64 << br.len()) {
                if j != i {
                    assert_ne!(tree::verify(&b.leaves()[i as usize], j, n, &br), Some(b.root()), "batch of {n}: leaf {i} also proven at {j}");
                }
            }
            let mut long = br.clone();
            long.push(h("one more"));
            assert_eq!(tree::verify(&b.leaves()[i as usize], i, n, &long), None, "a branch longer than the batch's depth");
            if !br.is_empty() {
                assert_eq!(tree::verify(&b.leaves()[i as usize], i, n, &br[1..]), None, "a branch shorter than the batch's depth");
            }
        }
        assert_eq!(b.branch(n), None);
    }
}

/// The canonical rule itself (F200, applied to the batch): wherever the
/// sibling equals the running hash, only the left position is a proof. A
/// batch never holds two equal leaves, so no honest proof meets it.
#[test]
fn where_a_sibling_equals_the_node_only_the_left_position_is_a_proof() {
    let l = tree::leaf(&h("act"), &h("blind"));
    assert_eq!(Batch::new(vec![l, l]), None, "a batch never holds two equal leaves: one payment, one leaf");
    assert_eq!(Batch::new(vec![]), None, "a batch holds at least one leaf");
    let twin_root = tree::root(2, &tree::node(&l, &l));
    assert_eq!(tree::verify(&l, 0, 2, &[l]), Some(twin_root));
    assert_eq!(tree::verify(&l, 1, 2, &[l]), None, "the right position of a node whose sibling is itself");
}

/// Leaf, node and root hashes are distinct (review 7d): the same bytes give
/// a different hash as a leaf, as a node and as a root, and a batch's root
/// is never its only leaf nor its top node.
#[test]
fn leaf_node_and_root_hashes_are_distinct() {
    let (a, b) = (h("a"), h("b"));
    assert_ne!(tree::leaf(&a, &b), tree::node(&a, &b));
    assert_ne!(tree::root(1, &a), a);
    let one = Batch::new(vec![a]).unwrap();
    assert_ne!(one.root(), a, "a batch of one leaf: its root is not the leaf");
    let two = Batch::new(vec![a, b]).unwrap();
    assert_ne!(two.root(), tree::node(&a, &b), "the root is not the top node");
    assert_ne!(tree::root(2, &tree::node(&a, &b)), tree::root(3, &tree::node(&a, &b)), "the root binds the number of leaves");
    assert_eq!([tree::LEAF_TAG, tree::NODE_TAG, tree::ROOT_TAG].iter().collect::<std::collections::BTreeSet<_>>().len(), 3);
}

/// A batch root is never a payment commitment (review 7d): a service that
/// chooses its batch's leaves, a payment commitment among them, cannot make
/// the root it tweaks its key with equal that commitment, so an output
/// tweaked by a batch root is never also a payment on the on-chain rail.
#[test]
fn a_batch_root_is_never_a_payment_commitment() {
    let c = Commitment {
        rail: h("a rail Module"),
        payee: h("the payee"),
        amount: Amount { unit: h("a unit"), value: 1_000 },
        fulfils: h("an offer"),
        payer: Some(Payer::Identity(h("the payer"))),
        paid_to: PaidTo::Flow { pointer: h("a pointer"), rail: 0 },
        salt: [7; 16],
        purchase: None,
    }
    .hash();
    assert_ne!(tree::ROOT_TAG, mor_payment::COMMITMENT_TAG);
    for leaves in [vec![c], vec![c, h("x")], vec![h("x"), c, h("y")]] {
        assert_ne!(Batch::new(leaves).unwrap().root(), c);
    }
    assert_ne!(tree::root(1, &c), c);
}

/// An inner node is never read as a leaf: its proof would be shorter than
/// the batch's depth, and padding it gives another root.
#[test]
fn an_inner_node_is_never_read_as_a_leaf() {
    let ls = leaves(4);
    let b = Batch::new(ls.clone()).unwrap();
    let n01 = tree::node(&ls[0], &ls[1]);
    let n23 = tree::node(&ls[2], &ls[3]);
    assert_eq!(tree::verify(&n01, 0, 4, &[n23]), None, "too short for a batch of four");
    assert_eq!(tree::verify(&n01, 0, 2, &[n23]), Some(tree::root(2, &tree::node(&n01, &n23))));
    assert_ne!(tree::verify(&n01, 0, 2, &[n23]), Some(b.root()), "read as a batch of two, another root");
}
