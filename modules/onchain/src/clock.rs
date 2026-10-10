//! The Bitcoin clock Module, draft 2 (`modules/module-bitcoin-clock-draft-2.md`):
//! a clock under the anchoring cMIP (`cmips/cmip-anchoring-draft-2.md`;
//! F202: "cMIP is the anchoring, modules are the clocks"). **Experimental.**
//!
//! - **Its reference** is one Bitcoin network: `[ this Module's spec,
//!   network ]` ([`reference`]), the shape of Finance's clock entry and
//!   Law's time reference.
//! - **Its point is the block** (F201): an anchor's point is the height, on
//!   the chain the verifier follows, of the block that carries it. Two
//!   anchors in one block are at the same point.
//! - **A payment's proof is its anchor** (F201): an on-chain rail proof
//!   anchors the receipt or claim whose payment commitment the transaction
//!   pays, recomputed from that act by the payment cMIP ("the anchoring
//!   task accepts a commitment naming its act"), where it passes this
//!   Module's check: the rail's rule answers valid on the chain the
//!   verifier follows ([`BitcoinClock::payment_anchor`]).
//! - **The same depth** (F205): an anchor counts once its block has as many
//!   confirmations as the on-chain rail Module requires; one number for
//!   both.
//! - **Checked against the real chain** (F204): the chain's headers are
//!   data the client hands over ([`crate::chain::HeaderChain`]).
//! - **Batch anchors** (step 14a's pooled anchoring service) are this
//!   Module's other proof ([`BatchAnchor`], [`BitcoinClock::batch_anchor`],
//!   and through the core's interface [`AnchoringCmip::verify`]): the
//!   anchoring cMIP's batch, its root committed by pay-to-contract, checked
//!   by a sibling of the rail's rule: the same tweak and header checks on
//!   the chain followed, no amount to match, final at the rail's depth.

use crate::chain::HeaderChain;
use crate::{Block, Network, Onchain, OnchainProof};
use mor_anchoring::service::BatchClock;
use mor_core::cbor;
use mor_core::cbor::Value;
use mor_core::envelope::anchoring::{Anchor, AnchoringCmip, Reference};
use mor_core::hash::{sha256, Hash};
use mor_payment::{Answer, Held, Modules, Proof, Record};

/// This Module's spec hash. A test value until its creator is named at
/// step 17.
pub fn spec() -> Hash {
    sha256(b"Bitcoin clock Module, draft 2, test value until publication")
}

/// The time reference this Module names for a network: `[ spec, network ]`.
/// What a clock entry names (Finance, "clock"; F202).
pub fn reference(network: Network) -> Reference {
    Reference { cmip: spec(), params: Value::Uint(network.number()) }
}

/// The pair `(clock Module, rail Module)` this Module declares: it reads
/// the on-chain rail's proofs as payments' anchors (F201). What a Law
/// client hands the core's Law view (`LawView::rail_clocks`).
pub fn reads() -> (Hash, Hash) {
    (spec(), crate::spec())
}

/// `batch-anchor = [ blind, index, count, branch, key, tree / null, tx,
/// output, ? block ]`, `block = [ index, branch, headers ]`: a batch
/// anchor, this Module's second proof (step 14a): the act's leaf in a batch
/// (the anchoring cMIP's tree), the batch's root committed by
/// pay-to-contract to the output `output` of the transaction `tx` (without
/// its witness), and where that transaction sits, as the on-chain rail's
/// proof says it. *Mechanic, the build's: the shape; a `tree` beside the
/// root as the rail allows one.*
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct BatchAnchor {
    pub blind: [u8; 32],
    pub index: u64,
    pub count: u64,
    pub branch: Vec<Hash>,
    /// The x-only internal key the output is tweaked from: whoever anchors
    /// (a service, or anyone anchoring its own act, F169).
    pub key: [u8; 32],
    pub tree: Option<[u8; 32]>,
    pub tx: Vec<u8>,
    pub output: u64,
    pub block: Option<Block>,
}

fn bytes32(v: &Value) -> Option<[u8; 32]> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().ok(),
        _ => None,
    }
}

impl BatchAnchor {
    pub fn encode(&self) -> Vec<u8> {
        let mut a = vec![
            Value::Bytes(self.blind.to_vec()),
            Value::Uint(self.index),
            Value::Uint(self.count),
            Value::Array(self.branch.iter().map(|h| Value::Bytes(h.to_vec())).collect()),
            Value::Bytes(self.key.to_vec()),
            self.tree.map(|t| Value::Bytes(t.to_vec())).unwrap_or(Value::Null),
            Value::Bytes(self.tx.clone()),
            Value::Uint(self.output),
        ];
        if let Some(b) = &self.block {
            a.push(Value::Array(vec![
                Value::Uint(b.index),
                Value::Array(b.branch.iter().map(|h| Value::Bytes(h.to_vec())).collect()),
                Value::Array(b.headers.iter().map(|h| Value::Bytes(h.to_vec())).collect()),
            ]));
        }
        cbor::encode(&Value::Array(a))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let Ok(Value::Array(a)) = cbor::decode(bytes) else {
            return None;
        };
        let hashes = |v: &Value| match v {
            Value::Array(x) => x.iter().map(bytes32).collect::<Option<Vec<_>>>(),
            _ => None,
        };
        let (fixed, block) = match a.len() {
            8 => (&a[..], None),
            9 => (&a[..8], Some(&a[8])),
            _ => return None,
        };
        let [blind, Value::Uint(index), Value::Uint(count), branch, key, tree, Value::Bytes(tx), Value::Uint(output)] = fixed else {
            return None;
        };
        let tree = match tree {
            Value::Null => None,
            t => Some(bytes32(t)?),
        };
        let block = match block {
            None => None,
            Some(Value::Array(b)) => {
                let [Value::Uint(i), br, Value::Array(hs)] = b.as_slice() else {
                    return None;
                };
                let headers = hs
                    .iter()
                    .map(|h| match h {
                        Value::Bytes(h) => <[u8; 80]>::try_from(h.as_slice()).ok(),
                        _ => None,
                    })
                    .collect::<Option<Vec<_>>>()?;
                if headers.is_empty() {
                    return None;
                }
                Some(Block { index: *i, branch: hashes(br)?, headers })
            }
            Some(_) => return None,
        };
        Some(BatchAnchor {
            blind: bytes32(blind)?,
            index: *index,
            count: *count,
            branch: hashes(branch)?,
            key: bytes32(key)?,
            tree,
            tx: tx.clone(),
            output: *output,
            block,
        })
    }
}

/// The clock, with the chain the verifier follows.
pub struct BitcoinClock<'a> {
    pub chain: &'a HeaderChain,
}

impl BitcoinClock<'_> {
    /// F201: the anchor an on-chain payment's proof gives the receipt or
    /// claim `act` (`record`, held as `act`): the payment's block, on this
    /// clock's reference. `None` where the record is not on the on-chain
    /// rail, or its rail answer is not valid on the chain this clock
    /// follows (pending, short of the depth, a block off that chain,
    /// invalid): no anchor.
    pub fn payment_anchor(&self, act: &Hash, record: &Record, held: &dyn Held) -> Option<Anchor> {
        let (rail, proof) = match record {
            Record::Receipt(r) => (&r.rail, &r.proof),
            Record::Claim(c, ..) => (&c.rail, &c.proof),
        };
        if rail != &crate::spec() {
            return None;
        }
        let onchain = Onchain::on(self.chain);
        if mor_payment::verify(record.clone(), held, &Modules::new().adopt(&onchain)).answer != Answer::Valid {
            return None;
        }
        let point = OnchainProof::decode(&Proof::decode(proof)?.rail)?.height_on(self.chain)?;
        Some(Anchor { act: *act, reference: reference(self.chain.network()), point })
    }
}

impl BitcoinClock<'_> {
    /// A batch anchor of `act` (step 14a), checked by this Module's rule
    /// for it, a sibling of the on-chain rail's (review section 9, item 7):
    ///
    /// 1. The shape.
    /// 2. The leaf: the act and the blind, in the anchoring cMIP's tree,
    ///    at its one canonical index, giving the batch's root (domain
    ///    separated, the count bound, F200 applied to the batch).
    /// 3. The tweak: the output `output` of `tx` pays the Taproot key
    ///    `key` tweaked by that root (beside `tree`, where one is given),
    ///    BIP 341's tweak as the rail uses it. **No amount is matched.**
    /// 4. Not mined: pending.
    /// 5. The rail's own steps 8 to 11 (`confirmed`): the transaction at
    ///    its canonical position in the block, the block on the chain this
    ///    clock follows (F204), exactly [`crate::CONFIRMATIONS`] headers
    ///    (F205: final at the rail's depth, one number for both).
    ///
    /// The anchor places the act at the block's height (F201). Otherwise
    /// the answer, as the rail gives it: invalid, pending or unknown.
    pub fn batch_anchor(&self, act: &Hash, proof: &[u8]) -> Result<Anchor, Answer> {
        let Some(a) = BatchAnchor::decode(proof) else {
            return Err(Answer::Invalid("not a batch anchor in this Module's shape".into()));
        };
        let point = self.leaf_anchor(&mor_anchoring::tree::leaf(act, &a.blind), a)?;
        Ok(Anchor { act: *act, reference: reference(self.chain.network()), point })
    }

    /// Steps 2 to 5 of [`BitcoinClock::batch_anchor`] for a leaf, whoever's
    /// act it holds: what the anchoring service's judgment reads, since the
    /// service holds the leaf and never the act.
    fn leaf_anchor(&self, leaf: &Hash, a: BatchAnchor) -> Result<u64, Answer> {
        let leaf = *leaf;
        let Some(root) = mor_anchoring::tree::verify(&leaf, a.index, a.count, &a.branch) else {
            return Err(Answer::Invalid("the branch does not place the leaf in a batch of that many leaves at its one canonical index".into()));
        };
        let Some(q) = crate::p2c::pay_to_contract(&a.key, a.tree.as_ref(), &root) else {
            return Err(Answer::Invalid("the key gives no Taproot output key for this root".into()));
        };
        let Some(t) = crate::tx::decode(&a.tx) else {
            return Err(Answer::Invalid("not one transaction serialised without its witness".into()));
        };
        let Some(out) = usize::try_from(a.output).ok().and_then(|i| t.outputs.get(i)) else {
            return Err(Answer::Invalid("the transaction has no such output".into()));
        };
        if out.script != crate::tx::taproot_script(&q) {
            return Err(Answer::Invalid("the output is not the key tweaked by this batch's root: the act is not in the batch this transaction commits to".into()));
        }
        let Some(b) = a.block else {
            return Err(Answer::Pending("the transaction is unconfirmed".into()));
        };
        crate::confirmed(&t.txid, &b, Some(self.chain), self.chain.network(), crate::CONFIRMATIONS as u64)
    }
}

impl BatchClock for BitcoinClock<'_> {
    fn reference(&self) -> Reference {
        reference(self.chain.network())
    }

    fn leaf_point(&self, leaf: &Hash, proof: &[u8]) -> Result<u64, Answer> {
        let Some(a) = BatchAnchor::decode(proof) else {
            return Err(Answer::Invalid("not a batch anchor in this Module's shape".into()));
        };
        self.leaf_anchor(leaf, a)
    }

    /// The tip of the chain followed.
    fn now(&self) -> Option<u64> {
        Some(self.chain.tip())
    }

    /// The rail's confirmations (F205).
    fn depth(&self) -> u64 {
        crate::CONFIRMATIONS as u64
    }
}

impl AnchoringCmip for BitcoinClock<'_> {
    fn spec(&self) -> Hash {
        spec()
    }

    /// A batch anchor ([`BitcoinClock::batch_anchor`]), on the network the
    /// reference names, which must be the chain's: its point, where it
    /// counts. A payment's anchor is [`BitcoinClock::payment_anchor`],
    /// since it needs the act's content, not only its id.
    fn verify(&self, act: &Hash, params: &Value, proof: &[u8]) -> Option<u64> {
        let network = Network::from_number(match params {
            Value::Uint(n) => *n,
            _ => return None,
        })?;
        if network != self.chain.network() {
            return None;
        }
        self.batch_anchor(act, proof).ok().map(|a| a.point)
    }
}
