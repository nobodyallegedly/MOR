//! What the tests build with a second, independent implementation
//! (rust-bitcoin): keys, BIP 340 requests, Taproot output keys,
//! transactions, and blocks mined at regtest's difficulty. The Module's own
//! code reads what this makes; it never makes it.
#![allow(dead_code)]

use bitcoin::block::{Header, Version as BlockVersion};
use bitcoin::hashes::Hash as _;
use bitcoin::key::{Keypair, TapTweak, XOnlyPublicKey};
use bitcoin::secp256k1::{Message, Secp256k1, SecretKey};
use bitcoin::taproot::TapNodeHash;
use bitcoin::transaction::Version;
use bitcoin::{absolute, consensus, BlockHash, CompactTarget, OutPoint, ScriptBuf, Sequence, Transaction, TxIn, TxMerkleNode, TxOut, Txid, Witness};
use mor_core::hash::{sha256, Hash};
use mor_onchain::chain::HeaderChain;
use mor_onchain::{Block, Network, OnchainAddress, OnchainProof, Paid, CONFIRMATIONS};

pub fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

pub fn secret(label: &str) -> SecretKey {
    SecretKey::from_slice(&h(label)).unwrap()
}

/// The x-only public key of a secret, by rust-bitcoin.
pub fn xonly(sk: &SecretKey) -> [u8; 32] {
    Keypair::from_secret_key(&Secp256k1::new(), sk).x_only_public_key().0.serialize()
}

/// The payee's side's request for a commitment: a BIP 340 signature by
/// rust-bitcoin's secp256k1, over the Module's request message.
pub fn request(sk: &SecretKey, commitment: &Hash) -> [u8; 64] {
    let m = mor_onchain::p2c::request_message(commitment);
    let kp = Keypair::from_secret_key(&Secp256k1::new(), sk);
    Secp256k1::new()
        .sign_schnorr_with_aux_rand(&Message::from_digest(m), &kp, &[0; 32])
        .serialize()
}

/// The payee's side's request naming confirmations (F205).
pub fn request_for(sk: &SecretKey, commitment: &Hash, confirmations: Option<u64>) -> [u8; 64] {
    let m = mor_onchain::p2c::request_message_for(commitment, confirmations);
    let kp = Keypair::from_secret_key(&Secp256k1::new(), sk);
    Secp256k1::new()
        .sign_schnorr_with_aux_rand(&Message::from_digest(m), &kp, &[0; 32])
        .serialize()
}

/// rust-bitcoin's Taproot output key for an internal key and a Merkle root.
pub fn bitcoin_output_key(key: &[u8; 32], root: &[u8; 32]) -> [u8; 32] {
    let k = XOnlyPublicKey::from_slice(key).unwrap();
    let (q, _) = k.tap_tweak(&Secp256k1::new(), Some(TapNodeHash::from_byte_array(*root)));
    q.to_x_only_public_key().serialize()
}

/// rust-bitcoin's branch hash of two Taproot nodes.
pub fn bitcoin_branch(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    TapNodeHash::from_node_hashes(TapNodeHash::from_byte_array(*a), TapNodeHash::from_byte_array(*b)).to_byte_array()
}

/// A transaction spending a made-up output, paying each `(script, value)`.
pub fn tx(spends: &str, outputs: &[(Vec<u8>, u64)]) -> Transaction {
    Transaction {
        version: Version::TWO,
        lock_time: absolute::LockTime::ZERO,
        input: vec![TxIn {
            previous_output: OutPoint { txid: Txid::from_byte_array(h(spends)), vout: 0 },
            script_sig: ScriptBuf::new(),
            sequence: Sequence::MAX,
            witness: Witness::new(),
        }],
        output: outputs
            .iter()
            .map(|(s, v)| TxOut { value: bitcoin::Amount::from_sat(*v), script_pubkey: ScriptBuf::from_bytes(s.clone()) })
            .collect(),
    }
}

/// The txid of a transaction's bytes, by rust-bitcoin.
pub fn txid(tx: &[u8]) -> [u8; 32] {
    consensus::deserialize::<Transaction>(tx).unwrap().compute_txid().to_byte_array()
}

/// Its bytes without witness.
pub fn bytes(t: &Transaction) -> Vec<u8> {
    consensus::serialize(t)
}

/// A header on `previous` committing to `txids`, mined at `bits`.
pub fn mine(previous: [u8; 32], txids: &[[u8; 32]], bits: u32, time: u32) -> [u8; 80] {
    let root = bitcoin::merkle_tree::calculate_root(txids.iter().map(|t| TxMerkleNode::from_byte_array(*t))).unwrap();
    let mut header = Header {
        version: BlockVersion::from_consensus(0x2000_0000),
        prev_blockhash: BlockHash::from_byte_array(previous),
        merkle_root: root,
        time,
        bits: CompactTarget::from_consensus(bits),
        nonce: 0,
    };
    while !header.target().is_met_by(header.block_hash()) {
        header.nonce += 1;
    }
    consensus::serialize(&header).try_into().unwrap()
}

/// The hash of a header, by rust-bitcoin.
pub fn header_hash(header: &[u8; 80]) -> [u8; 32] {
    consensus::deserialize::<Header>(header).unwrap().block_hash().to_byte_array()
}

/// A block holding `tx` second, after a stand-in for the coinbase, on
/// `previous`, with `n` headers in all: the proof's `block`.
pub fn confirm_on(previous: [u8; 32], tx: &[u8], n: usize, bits: u32) -> Block {
    let txid = consensus::deserialize::<Transaction>(tx).unwrap().compute_txid().to_byte_array();
    let txids = [h("a coinbase"), txid, h("another payment")];
    let first = mine(previous, &txids, bits, 1_790_000_000);
    let mut headers = vec![first];
    while headers.len() < n {
        let prev = header_hash(headers.last().unwrap());
        headers.push(mine(prev, &[h(&format!("coinbase {}", headers.len()))], bits, 1_790_000_000 + headers.len() as u32));
    }
    Block { index: 1, branch: mor_onchain::block::merkle_branch(&txids, 1).unwrap(), headers }
}

pub const REGTEST_BITS: u32 = 0x207f_ffff;

pub fn confirm(tx: &[u8], n: usize) -> Block {
    confirm_on(h("the chain so far"), tx, n, REGTEST_BITS)
}

/// The payee's flow and vault, on regtest: (address, its key's secret, its
/// request key's secret).
pub struct Keys {
    pub key: SecretKey,
    pub request: SecretKey,
}

impl Keys {
    pub fn new(label: &str) -> Keys {
        Keys { key: secret(&format!("{label} key")), request: secret(&format!("{label} request key")) }
    }
    pub fn address(&self, network: Network) -> OnchainAddress {
        OnchainAddress { network, key: xonly(&self.key), request: xonly(&self.request), tree: None, endpoint: None }
    }
}

/// A proof of a payment to `address` committing to `c`: the request signed
/// by `request`, a transaction paying `value` to `script`, confirmed `n`
/// times (`None`: not mined; no transaction where `script` is `None`).
pub fn proof(request_key: &SecretKey, c: &Hash, pays: Option<(Vec<u8>, u64)>, n: Option<usize>) -> OnchainProof {
    let paid = pays.map(|(script, value)| {
        let t = bytes(&tx("the payer's coins", &[(script, value), (vec![0x51, 0x20].into_iter().chain([7u8; 32]).collect(), 99_000)]));
        let block = n.map(|n| confirm(&t, n));
        Paid { tx: t, output: 0, block }
    });
    OnchainProof { request: request(request_key, c), confirmations: None, paid }
}

/// The height at which the tests' regtest chains start.
pub const START: u64 = 100;

/// A regtest chain held by a verifier, from `START`: these headers.
pub fn chain(headers: &[[u8; 80]]) -> HeaderChain {
    HeaderChain::new(Network::Regtest, START, headers.to_vec()).unwrap()
}

/// The chain an honest verifier holds for a mined proof: the proof's own
/// block and the headers on it, as its node followed them (F204). `None`
/// for a proof not mined.
pub fn held(p: &OnchainProof) -> Option<HeaderChain> {
    Some(chain(&p.paid.as_ref()?.block.as_ref()?.headers))
}

/// Mine `n` empty regtest blocks on the tip of `chain`.
pub fn grow(chain: &mut HeaderChain, n: usize) {
    for i in 0..n {
        let tip = chain.hash_at(chain.tip()).unwrap();
        chain.extend(mine(tip, &[h(&format!("an empty block on {tip:?} {i}"))], REGTEST_BITS, 1_790_100_000 + i as u32)).unwrap();
    }
}

/// A block holding `txids` mined on the tip of `chain`, with `n` headers in
/// all, added to the chain: the headers.
pub fn mine_on(chain: &mut HeaderChain, txids: &[[u8; 32]], n: usize) -> Vec<[u8; 80]> {
    let tip = chain.hash_at(chain.tip()).unwrap();
    let mut headers = vec![mine(tip, txids, REGTEST_BITS, 1_790_200_000)];
    while headers.len() < n {
        let prev = header_hash(headers.last().unwrap());
        headers.push(mine(prev, &[h(&format!("coinbase {} on {tip:?}", headers.len()))], REGTEST_BITS, 1_790_200_000 + headers.len() as u32));
    }
    for x in &headers {
        chain.extend(*x).unwrap();
    }
    headers
}

pub const N: usize = CONFIRMATIONS;
