//! The Bitcoin clock's batch anchors (the clock Module draft 2, "A batch
//! anchor"; the anchoring cMIP draft 2): a sibling of the on-chain rail's
//! rule, with the same tweak and the same header checks against the chain
//! the verifier follows (F204), no amount to match (review section 9, item
//! 7), final at the rail's depth (F205). Blocks are built with rust-bitcoin
//! (`support`); the Module's code only reads them.

mod support;

use mor_anchoring::tree::{self, Batch};
use mor_core::envelope::anchoring::{Anchors, AnchoringCmip};
use mor_core::hash::Hash;
use mor_onchain::chain::HeaderChain;
use mor_onchain::clock::{self, BatchAnchor, BitcoinClock};
use mor_onchain::{block, tx, Block, Network};
use mor_payment::Answer;
use support::*;

/// A batch of `acts` (each with its blind), committed by `key` with an
/// output of `value` in a transaction mined on `chain` second in its block,
/// with `n` headers in all: the batch, and the anchor of act `i`.
fn anchor_on(chain: &mut HeaderChain, acts: &[(Hash, [u8; 32])], key: &[u8; 32], value: u64, n: usize, i: usize) -> (Batch, BatchAnchor) {
    let b = Batch::new(acts.iter().map(|(a, bl)| tree::leaf(a, bl)).collect()).unwrap();
    let out = tx::taproot_script(&mor_onchain::p2c::pay_to_contract(key, None, &b.root()).unwrap());
    assert_eq!(&out[2..], &bitcoin_output_key(key, &b.root()), "the tweak is BIP 341's, as rust-bitcoin computes it");
    let t = bytes(&support::tx("the service's coins", &[(out, value), (vec![0x51, 0x20].into_iter().chain([9u8; 32]).collect(), 50_000)]));
    let txids = [h("a coinbase"), txid(&t), h("someone else's payment")];
    let headers = mine_on(chain, &txids, n);
    let a = BatchAnchor {
        blind: acts[i].1,
        index: i as u64,
        count: b.count(),
        branch: b.branch(i as u64).unwrap(),
        key: *key,
        tree: None,
        tx: t,
        output: 0,
        block: Some(Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers }),
    };
    (b, a)
}

fn acts(n: usize) -> Vec<(Hash, [u8; 32])> {
    (0..n).map(|i| (h(&format!("an act {i}")), h(&format!("its blind {i}")))).collect()
}

fn service() -> [u8; 32] {
    xonly(&secret("the anchoring service's key"))
}

fn regtest_chain() -> HeaderChain {
    chain(&[mine(h("the chain so far"), &[h("genesis of this test")], REGTEST_BITS, 1)])
}

/// Anyone verifies inclusion from the chain: the act's leaf in the batch,
/// the batch's root tweaking the service's key in a transaction's output,
/// that transaction in a block of the chain followed, six headers deep: the
/// anchor places the act at the block's height, on the Bitcoin clock's
/// reference, through the core's anchoring interface.
#[test]
fn a_batch_anchor_places_its_act_at_its_block() {
    let mut c = regtest_chain();
    let xs = acts(5);
    let (batch, a) = anchor_on(&mut c, &xs, &service(), 330, N, 3);
    let height = START + 1;
    let bitcoin = BitcoinClock { chain: &c };
    let got = bitcoin.batch_anchor(&xs[3].0, &a.encode()).expect("a batch anchor");
    assert_eq!((got.act, got.point, got.reference.clone()), (xs[3].0, height, clock::reference(Network::Regtest)));
    let mut held = Anchors::new();
    assert!(held.add_proof(&bitcoin, &clock::reference(Network::Regtest), &xs[3].0, &a.encode()));
    assert_eq!(held.earliest(&xs[3].0, &clock::reference(Network::Regtest)), Some(height), "the point is the block (F201)");
    assert_eq!(BatchAnchor::decode(&a.encode()), Some(a.clone()));
    // Every act in the batch, each at its own index.
    for (i, x) in xs.iter().enumerate() {
        let p = BatchAnchor { blind: x.1, index: i as u64, branch: batch.branch(i as u64).unwrap(), ..a.clone() };
        assert_eq!(bitcoin.verify(&x.0, &mor_core::cbor::Value::Uint(3), &p.encode()), Some(height));
    }
}

/// No amount is matched (review section 9, item 7): an anchor's output is
/// whatever the service paid, dust or more.
#[test]
fn a_batch_anchor_matches_no_amount() {
    for value in [0, 1, 330, 25_000] {
        let mut c = regtest_chain();
        let xs = acts(2);
        let (_, a) = anchor_on(&mut c, &xs, &service(), value, N, 0);
        assert!(BitcoinClock { chain: &c }.batch_anchor(&xs[0].0, &a.encode()).is_ok(), "an output of {value}");
    }
}

/// Final at the rail's depth (F205): pending short of six headers, on the
/// proof or on the chain held; invalid with more than six, as on the rail;
/// unknown where the block is not on the chain the verifier follows (F204),
/// or the chain is another network's.
#[test]
fn a_batch_anchor_counts_at_the_rails_depth_on_the_chain_followed() {
    let xs = acts(3);
    let mut c = regtest_chain();
    let (_, a) = anchor_on(&mut c, &xs, &service(), 330, 2, 1);
    let r = BitcoinClock { chain: &c }.batch_anchor(&xs[1].0, &a.encode());
    assert!(matches!(&r, Err(Answer::Pending(w)) if w.contains("2 of 6")), "{r:?}");
    assert_eq!(BitcoinClock { chain: &c }.verify(&xs[1].0, &mor_core::cbor::Value::Uint(3), &a.encode()), None);
    // Six on the chain, and the proof brought to six.
    grow(&mut c, N - 2);
    let mut six = a.clone();
    let start = START + 1;
    let blk = six.block.as_mut().unwrap();
    for k in 2..N as u64 {
        blk.headers.push(c.header_at(start + k).unwrap());
    }
    assert!(BitcoinClock { chain: &c }.batch_anchor(&xs[1].0, &six.encode()).is_ok());
    let mut seven = six.clone();
    grow(&mut c, 1);
    seven.block.as_mut().unwrap().headers.push(c.header_at(start + N as u64).unwrap());
    assert!(matches!(BitcoinClock { chain: &c }.batch_anchor(&xs[1].0, &seven.encode()), Err(Answer::Invalid(_))));
    // Off the chain followed: the same proof, against another chain.
    let other = chain(&[mine(h("another chain"), &[h("x")], REGTEST_BITS, 9)]);
    assert!(matches!(BitcoinClock { chain: &other }.batch_anchor(&xs[1].0, &six.encode()), Err(Answer::Unknown(_))));
    // Not mined: pending.
    let unmined = BatchAnchor { block: None, ..six.clone() };
    assert!(matches!(BitcoinClock { chain: &c }.batch_anchor(&xs[1].0, &unmined.encode()), Err(Answer::Pending(_))));
    // The reference names another network than the chain held.
    assert_eq!(BitcoinClock { chain: &c }.verify(&xs[1].0, &mor_core::cbor::Value::Uint(Network::Testnet.number()), &six.encode()), None);
}

/// The anchor holds only for its act, its blind and its root: another act,
/// another blind, an output tweaked by another root, a leaf proven at the
/// twin of its position in the block (F200), and an anchor whose leaf is
/// past the batch's leaves are all refused.
#[test]
fn a_batch_anchor_holds_for_its_act_blind_and_root_only() {
    let xs = acts(3);
    let mut c = regtest_chain();
    let (_, a) = anchor_on(&mut c, &xs, &service(), 330, N, 2);
    let bitcoin = BitcoinClock { chain: &c };
    assert!(bitcoin.batch_anchor(&xs[2].0, &a.encode()).is_ok());
    assert!(matches!(bitcoin.batch_anchor(&h("another act"), &a.encode()), Err(Answer::Invalid(_))));
    assert!(matches!(bitcoin.batch_anchor(&xs[2].0, &BatchAnchor { blind: h("another blind"), ..a.clone() }.encode()), Err(Answer::Invalid(_))));
    assert!(matches!(bitcoin.batch_anchor(&xs[2].0, &BatchAnchor { count: 4, ..a.clone() }.encode()), Err(Answer::Invalid(_))), "the root binds the count");
    assert!(matches!(bitcoin.batch_anchor(&xs[2].0, &BatchAnchor { index: 3, ..a.clone() }.encode()), Err(Answer::Invalid(_))), "the twin of the last leaf");
    assert!(matches!(bitcoin.batch_anchor(&xs[2].0, &BatchAnchor { key: xonly(&secret("another key")), ..a.clone() }.encode()), Err(Answer::Invalid(_))));
    // The transaction's twin position in its block (three transactions:
    // the last repeated), as on the rail.
    let mut c2 = regtest_chain();
    let t = a.tx.clone();
    let txids = [h("a coinbase"), h("someone else's payment"), txid(&t)];
    let headers = mine_on(&mut c2, &txids, N);
    let honest = BatchAnchor { block: Some(Block { index: 2, branch: block::merkle_branch(&txids, 2).unwrap(), headers }), ..a.clone() };
    assert!(BitcoinClock { chain: &c2 }.batch_anchor(&xs[2].0, &honest.encode()).is_ok());
    let mut twin = honest.clone();
    twin.block.as_mut().unwrap().index = 3;
    let r = BitcoinClock { chain: &c2 }.batch_anchor(&xs[2].0, &twin.encode());
    assert!(matches!(&r, Err(Answer::Invalid(w)) if w.contains("canonical")), "{r:?}");
    assert!(BatchAnchor::decode(b"not a proof").is_none());
}

/// An on-chain rail payment is not a batch anchor, and a batch anchor's
/// output is not a payment (review 7d): the payment's output is the payee's
/// key tweaked by its commitment, and no batch has a commitment for root.
#[test]
fn a_payment_output_is_not_a_batch_anchor() {
    let key = service();
    let commitment = h("a payment commitment, as the payment cMIP makes it");
    let mut c = regtest_chain();
    let out = tx::taproot_script(&mor_onchain::p2c::pay_to_contract(&key, None, &commitment).unwrap());
    let t = bytes(&support::tx("a payer's coins", &[(out, 1_000)]));
    let txids = [h("a coinbase"), txid(&t)];
    let headers = mine_on(&mut c, &txids, N);
    // Read as a batch of one leaf, the commitment itself as the leaf.
    let a = BatchAnchor { blind: [0; 32], index: 0, count: 1, branch: vec![], key, tree: None, tx: t, output: 0, block: Some(Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers }) };
    assert!(matches!(BitcoinClock { chain: &c }.batch_anchor(&commitment, &a.encode()), Err(Answer::Invalid(_))));
    assert_ne!(Batch::new(vec![commitment]).unwrap().root(), commitment);
}
