//! # mor-onchain
//!
//! The on-chain Bitcoin rail Module, draft 2
//! (`modules/module-onchain-rail-draft-2.md`), a rail Module under the
//! payment cMIP (`mor-payment`). **Experimental**: an instrument for testing
//! the Finance MIP, never for real money.
//!
//! - [`p2c`]: pay-to-contract on Taproot: the payee's key tweaked by the
//!   payment commitment gives the payment's address (BIP 341).
//! - [`tx`], [`block`]: a transaction without its witness, block headers and
//!   Merkle branches, as the rule reads them.
//! - [`OnchainAddress`]: what a payee pointer's rail address, or a vault
//!   entry's source, holds for this Module: a network, the key the money
//!   goes to, the key that signs requests, and an optional script tree.
//! - [`Onchain`]: the verification rule: a request signed by the payee's
//!   request key; a transaction paying exactly the amount to the key tweaked
//!   by the commitment; at its one canonical position in a block of the
//!   chain the verifier follows ([`chain::HeaderChain`], F204), with
//!   [`CONFIRMATIONS`] headers on that chain (or more, where the request
//!   names more, F205): valid; fewer: pending; a block not on that chain,
//!   or no chain held: unknown.
//! - [`clock`]: the Bitcoin clock Module (F201, F202): a payment's proof
//!   read as an anchor, the point being the block.
//! - `btcd` (feature `btcd`): a client for a btcd node, with which the tests
//!   pay on regtest.
//!
//! The Module signs nothing and holds no key: the payee's side signs the
//! request and the receipt, the payer signs the claim (F112).

pub mod block;
#[cfg(feature = "btcd")]
pub mod btcd;
pub mod chain;
pub mod clock;
pub mod p2c;
pub mod tx;

use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};
use mor_payment::{Answer, RailInput, RailKind, RailModule, Verification};

/// This Module's spec hash. A test value until the Module is published by
/// its creator (roadmap step 17).
pub fn spec() -> Hash {
    sha256(b"on-chain rail Module, draft 2, test value until publication")
}

/// The confirmations a payment needs at least: the headers a valid proof
/// carries, the block's own included. A parameter of this Module; a
/// payee's request may name more (F205). The Bitcoin clock Module reads
/// anchors at the same depth (F205: one number for both).
pub const CONFIRMATIONS: usize = 6;

/// A Bitcoin network, numbered as the Lightning rail Module numbers it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Network {
    Mainnet,
    Testnet,
    Signet,
    Regtest,
}

impl Network {
    pub fn number(self) -> u64 {
        match self {
            Network::Mainnet => 0,
            Network::Testnet => 1,
            Network::Signet => 2,
            Network::Regtest => 3,
        }
    }

    pub fn from_number(n: u64) -> Option<Self> {
        Some(match n {
            0 => Network::Mainnet,
            1 => Network::Testnet,
            2 => Network::Signet,
            3 => Network::Regtest,
            _ => return None,
        })
    }
}

/// The units this Module carries, one per network: the same units the
/// Lightning rail Module carries (`modules/units-bitcoin-draft-1.md`): one
/// name per unit. A regtest satoshi is not a satoshi. Test values until
/// publication.
pub fn unit(network: Network) -> Hash {
    sha256(match network {
        Network::Mainnet => {
            b"unit: satoshi (bitcoin), draft 1, test value until publication".as_slice()
        }
        Network::Testnet => b"unit: satoshi (testnet3), draft 1, test value until publication",
        Network::Signet => b"unit: satoshi (signet), draft 1, test value until publication",
        Network::Regtest => b"unit: satoshi (regtest), draft 1, test value until publication",
    })
}

/// `onchain-address = [ network, key, request, ? tree, ? endpoint ]`: a
/// payee pointer's rail address, and a vault entry's source.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OnchainAddress {
    pub network: Network,
    /// The x-only Taproot internal key the payee's money goes to, before the
    /// tweak: a single key, or a key aggregating several.
    pub key: [u8; 32],
    /// The x-only key that signs the payee's side's requests (BIP 340).
    pub request: [u8; 32],
    /// The Merkle root of the owner's own Taproot scripts (a script
    /// multisig), beside which the commitment sits.
    pub tree: Option<[u8; 32]>,
    /// Where the payee answers address requests: a hint, never
    /// load-bearing.
    pub endpoint: Option<String>,
}

impl OnchainAddress {
    pub fn encode(&self) -> Vec<u8> {
        let mut a = vec![
            Value::Uint(self.network.number()),
            Value::Bytes(self.key.to_vec()),
            Value::Bytes(self.request.to_vec()),
        ];
        if let Some(t) = &self.tree {
            a.push(Value::Bytes(t.to_vec()));
        }
        if let Some(e) = &self.endpoint {
            a.push(Value::Text(e.clone()));
        }
        cbor::encode(&Value::Array(a))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let Ok(Value::Array(a)) = cbor::decode(bytes) else {
            return None;
        };
        let k32 = |v: &Value| match v {
            Value::Bytes(b) => <[u8; 32]>::try_from(b.as_slice()).ok(),
            _ => None,
        };
        let (n, key, request, rest) = match a.as_slice() {
            [Value::Uint(n), k, r, rest @ ..] => (*n, k32(k)?, k32(r)?, rest),
            _ => return None,
        };
        let (tree, endpoint) = match rest {
            [] => (None, None),
            [Value::Bytes(_)] => (Some(k32(&rest[0])?), None),
            [Value::Text(e)] => (None, Some(e.clone())),
            [Value::Bytes(_), Value::Text(e)] => (Some(k32(&rest[0])?), Some(e.clone())),
            _ => return None,
        };
        Some(OnchainAddress {
            network: Network::from_number(n)?,
            key,
            request,
            tree,
            endpoint,
        })
    }

    /// The x-only output key paying a commitment to this address.
    pub fn output_key(&self, commitment: &Hash) -> Option<[u8; 32]> {
        p2c::pay_to_contract(&self.key, self.tree.as_ref(), commitment)
    }

    /// The output script paying a commitment to this address.
    pub fn script(&self, commitment: &Hash) -> Option<Vec<u8>> {
        Some(tx::taproot_script(&self.output_key(commitment)?))
    }
}

/// Where a confirmed transaction sits: its position in the block, its
/// Merkle branch, and the block's header followed by those built on it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Block {
    pub index: u64,
    pub branch: Vec<[u8; 32]>,
    pub headers: Vec<[u8; 80]>,
}

/// The payment, once made: the transaction without its witness, the output
/// paying the commitment's address, and, once mined, its block.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Paid {
    pub tx: Vec<u8>,
    pub output: u64,
    pub block: Option<Block>,
}

/// `onchain-proof = [ request, ? [ tx, output, ? [ index, branch, headers ] ] ]`,
/// `request = bstr .size 64 / [ bstr .size 64, confirmations ]`: the rail
/// proof a receipt or claim carries, inside the payment cMIP's proof.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OnchainProof {
    /// The payee's side's BIP 340 signature over the request message.
    pub request: [u8; 64],
    /// The confirmations the payee's request names, where it names more
    /// than [`CONFIRMATIONS`] (F205): the payment counts only at that
    /// depth. Signed with the request.
    pub confirmations: Option<u64>,
    pub paid: Option<Paid>,
}

impl OnchainProof {
    pub fn encode(&self) -> Vec<u8> {
        let request = match self.confirmations {
            None => Value::Bytes(self.request.to_vec()),
            Some(k) => Value::Array(vec![Value::Bytes(self.request.to_vec()), Value::Uint(k)]),
        };
        let mut a = vec![request];
        if let Some(p) = &self.paid {
            let mut q = vec![Value::Bytes(p.tx.clone()), Value::Uint(p.output)];
            if let Some(b) = &p.block {
                q.push(Value::Array(vec![
                    Value::Uint(b.index),
                    Value::Array(b.branch.iter().map(|h| Value::Bytes(h.to_vec())).collect()),
                    Value::Array(b.headers.iter().map(|h| Value::Bytes(h.to_vec())).collect()),
                ]));
            }
            a.push(Value::Array(q));
        }
        cbor::encode(&Value::Array(a))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let Ok(Value::Array(a)) = cbor::decode(bytes) else {
            return None;
        };
        let (request, paid) = match a.as_slice() {
            [r] => (r, None),
            [r, Value::Array(p)] => (r, Some(p)),
            _ => return None,
        };
        let (request, confirmations) = match request {
            Value::Bytes(r) => (r, None),
            Value::Array(x) => match x.as_slice() {
                [Value::Bytes(r), Value::Uint(k)] => (r, Some(*k)),
                _ => return None,
            },
            _ => return None,
        };
        let request: [u8; 64] = request.as_slice().try_into().ok()?;
        let paid = match paid {
            None => None,
            Some(p) => {
                let (tx, output, block) = match p.as_slice() {
                    [Value::Bytes(t), Value::Uint(o)] => (t, *o, None),
                    [Value::Bytes(t), Value::Uint(o), Value::Array(b)] => (t, *o, Some(b)),
                    _ => return None,
                };
                let block = match block {
                    None => None,
                    Some(b) => {
                        let [Value::Uint(index), Value::Array(branch), Value::Array(headers)] = b.as_slice() else {
                            return None;
                        };
                        let branch = branch
                            .iter()
                            .map(|h| match h {
                                Value::Bytes(h) => <[u8; 32]>::try_from(h.as_slice()).ok(),
                                _ => None,
                            })
                            .collect::<Option<Vec<_>>>()?;
                        let headers = headers
                            .iter()
                            .map(|h| match h {
                                Value::Bytes(h) => <[u8; 80]>::try_from(h.as_slice()).ok(),
                                _ => None,
                            })
                            .collect::<Option<Vec<_>>>()?;
                        if headers.is_empty() {
                            return None;
                        }
                        Some(Block {
                            index: *index,
                            branch,
                            headers,
                        })
                    }
                };
                Some(Paid {
                    tx: tx.clone(),
                    output,
                    block,
                })
            }
        };
        Some(OnchainProof { request, confirmations, paid })
    }

    /// The confirmations this proof's payment needs: what its request
    /// names, or [`CONFIRMATIONS`].
    pub fn needs(&self) -> u64 {
        self.confirmations.unwrap_or(CONFIRMATIONS as u64)
    }

    /// The hash of the block the proof places the transaction in, in
    /// Bitcoin's byte order: what a client running a node looks up to see
    /// whether that block is on its best chain. `None` before it is mined.
    pub fn block_hash(&self) -> Option<[u8; 32]> {
        let h = self.paid.as_ref()?.block.as_ref()?.headers.first()?;
        Some(tx::dsha256(h))
    }

    /// The output the payment created, `(txid, index)`, in Bitcoin's byte
    /// order: the same in every proof of the payment, whichever block holds
    /// it.
    pub fn outpoint(&self) -> Option<([u8; 32], u64)> {
        let p = self.paid.as_ref()?;
        Some((tx::dsha256(&p.tx), p.output))
    }

    /// What "the same payment" is on this rail (F200): the output the
    /// payment created, `[txid, output]`, encoded in deterministic CBOR.
    /// Every proof of the payment names it, pending or valid, in whichever
    /// block a reorganisation puts it. `None` before a transaction is shown.
    pub fn payment(&self) -> Option<Vec<u8>> {
        let (txid, i) = self.outpoint()?;
        Some(cbor::encode(&Value::Array(vec![Value::Bytes(txid.to_vec()), Value::Uint(i)])))
    }

    /// The height of the proof's block on `chain`, if it is on it.
    pub fn height_on(&self, chain: &chain::HeaderChain) -> Option<u64> {
        chain.height_of(&self.block_hash()?)
    }
}

/// The on-chain rail Module, as a verifier adopts it: with the headers of
/// the chain it follows (F204), or with none, offline, where every mined
/// payment answers unknown.
#[derive(Clone, Copy, Debug, Default)]
pub struct Onchain<'a> {
    pub chain: Option<&'a chain::HeaderChain>,
}

impl<'a> Onchain<'a> {
    /// The Module with the chain the verifier follows.
    pub fn on(chain: &'a chain::HeaderChain) -> Self {
        Onchain { chain: Some(chain) }
    }

    /// The Module with no chain: a client offline, or keeping no headers.
    pub fn offline() -> Self {
        Onchain { chain: None }
    }

    /// The rule itself, on its inputs and the chain's headers handed to it
    /// as data (the Module's "Verification rule"; Production rule 12).
    pub fn rule(input: &RailInput, chain: Option<&chain::HeaderChain>) -> Answer {
        // 1. The shapes.
        let Some(addr) = OnchainAddress::decode(input.address) else {
            return Answer::Invalid("the address is not an on-chain rail address".into());
        };
        let Some(proof) = OnchainProof::decode(input.rail_proof) else {
            return Answer::Invalid("the rail proof is not in this Module's shape".into());
        };
        // 2. The unit.
        if input.amount.unit != unit(addr.network) {
            return Answer::Invalid("the amount is not in the rail's unit".into());
        }
        // 3. The payee's side's request, for this commitment, naming at
        // least N confirmations where it names any (F205).
        if proof.confirmations.is_some_and(|k| k < CONFIRMATIONS as u64) {
            return Answer::Invalid(format!("the request names fewer confirmations than this Module's {CONFIRMATIONS}"));
        }
        let signed = k256::schnorr::VerifyingKey::from_bytes(&addr.request).ok().zip(k256::schnorr::Signature::try_from(proof.request.as_slice()).ok());
        let Some((rk, sig)) = signed else {
            return Answer::Invalid("the request is not a signature by the address's request key".into());
        };
        if rk.verify_raw(&p2c::request_message_for(&input.commitment, proof.confirmations), &sig).is_err() {
            return Answer::Invalid("the request is not signed by the payee's request key for this commitment".into());
        }
        // 4. The address the commitment gives.
        let Some(q) = addr.output_key(&input.commitment) else {
            return Answer::Invalid("the address's key gives no Taproot output key for this commitment".into());
        };
        // 5. Not paid.
        let need = proof.needs();
        let Some(paid) = proof.paid else {
            return Answer::Pending("the payment is not made: a request only".into());
        };
        // 6. The transaction pays exactly the amount to that address.
        let Some(t) = tx::decode(&paid.tx) else {
            return Answer::Invalid("not one transaction serialised without its witness".into());
        };
        let Some(out) = usize::try_from(paid.output).ok().and_then(|i| t.outputs.get(i)) else {
            return Answer::Invalid("the transaction has no such output".into());
        };
        if out.script != tx::taproot_script(&q) {
            return Answer::Invalid("paid to an address not tweaked by this payment's commitment".into());
        }
        if out.value != input.amount.value {
            return Answer::Invalid("the output's value is not the amount".into());
        }
        // 7. Not mined.
        let Some(b) = paid.block else {
            return Answer::Pending("the transaction is unconfirmed".into());
        };
        // 8. In the block, at its one canonical position, under headers
        // that build on each other and meet their targets.
        let mut headers = Vec::with_capacity(b.headers.len());
        for (i, raw) in b.headers.iter().enumerate() {
            let Some(hd) = block::Header::decode(raw) else {
                return Answer::Invalid("a header is not 80 bytes".into());
            };
            if i > 0 && hd.previous != headers.last().map(|p: &block::Header| p.hash).unwrap_or_default() {
                return Answer::Invalid("a header does not build on the one before it".into());
            }
            if !hd.meets_its_target() {
                return Answer::Invalid("a header's hash is above the target it states".into());
            }
            headers.push(hd);
        }
        if block::merkle_root(&t.txid, b.index, &b.branch) != Some(headers[0].merkle_root) {
            return Answer::Invalid("the Merkle branch does not place the transaction in the block".into());
        }
        if !block::canonical(&t.txid, b.index, &b.branch) {
            return Answer::Invalid("the index is not canonical: where the tree repeats a node, only the node's own position is its proof (one payment, one proof, F200)".into());
        }
        // 9. On the chain this verifier follows (F204).
        let Some(chain) = chain.filter(|c| c.network() == addr.network) else {
            return Answer::Unknown("this verifier holds no headers of the address's network: a mined payment is checked against the chain it follows, never against its own headers alone (F204)".into());
        };
        let Some(height) = chain.height_of(&headers[0].hash) else {
            return Answer::Unknown("the proof's block is not on the chain this verifier follows (F204)".into());
        };
        for (i, hd) in headers.iter().enumerate().skip(1) {
            match chain.hash_at(height + i as u64) {
                Some(x) if x == hd.hash => {}
                Some(_) => return Answer::Unknown("the proof's confirmations are on another branch than the chain this verifier follows (F204)".into()),
                None => break,
            }
        }
        // 10, 11. The confirmations: on the proof, and on the chain held.
        let shown = headers.len() as u64;
        let held = chain.tip() - height + 1;
        if shown < need || held < need {
            return Answer::Pending(format!("{} of {need} confirmations", shown.min(held)));
        }
        if shown > need {
            return Answer::Invalid(format!("{shown} headers: one payment has one proof, with exactly {need}"));
        }
        // 12.
        Answer::Valid
    }
}

impl RailModule for Onchain<'_> {
    fn spec(&self) -> Hash {
        spec()
    }

    fn implements(&self) -> Hash {
        mor_payment::spec()
    }

    fn kind(&self) -> RailKind {
        RailKind::Request
    }

    fn unit(&self, address: &[u8]) -> Option<Hash> {
        OnchainAddress::decode(address).map(|a| unit(a.network))
    }

    /// The same payment (F200): the output the transaction created.
    fn payment(&self, rail_proof: &[u8]) -> Option<Vec<u8>> {
        OnchainProof::decode(rail_proof)?.payment()
    }

    fn check(&self, input: &RailInput) -> Verification {
        Verification {
            answer: Onchain::rule(input, self.chain),
            module: spec(),
            trusted: None,
        }
    }
}
