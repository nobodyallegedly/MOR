//! # mor-lightning
//!
//! The Lightning rail Module, draft 2 (`modules/module-lightning-rail-draft-2.md`),
//! a rail Module under the payment cMIP (`mor-payment`).
//!
//! - [`bolt11`]: decoding a BOLT 11 invoice and recovering the node key
//!   that signed it.
//! - [`LnAddress`]: what a payee pointer's rail address, or a vault entry's
//!   source, holds for this Module: a network, a node key, and where to ask
//!   for an invoice.
//! - [`Lightning`]: the verification rule: an invoice signed by the node key
//!   the payee declared, committing (by its description hash) to the payment
//!   commitment, for exactly the amount, with the preimage of its payment
//!   hash: valid; no preimage: pending.
//! - `lnd` (feature `lnd`): a client for an lnd node's REST interface, with
//!   which the tests pay on regtest.
//!
//! The Module signs nothing and holds no key: the payee's node signs the
//! invoice, the payee signs the receipt, the payer signs the claim (F112).

pub mod bolt11;
#[cfg(feature = "lnd")]
pub mod lnd;

use bolt11::{Bolt11Error, Network};
use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};
use mor_payment::{Answer, RailInput, RailKind, RailModule, Verification};

/// This Module's spec hash. A test value until the Module is published by
/// its creator (roadmap step 17).
pub fn spec() -> Hash {
    sha256(b"Lightning rail Module, draft 1, test value until publication")
}

/// The units this Module carries, one per network (`modules/units-bitcoin-draft-1.md`):
/// a regtest satoshi is not a satoshi. Test values until publication.
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

/// `ln-address = [ network: uint, node: bstr .size 33, ? endpoint: tstr ]`:
/// a payee pointer's rail address, and a vault entry's source.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LnAddress {
    pub network: Network,
    /// The compressed secp256k1 key of the node that issues the payee's
    /// invoices on this rail.
    pub node: [u8; 33],
    /// Where the payee answers invoice requests: a hint, never load-bearing.
    pub endpoint: Option<String>,
}

impl LnAddress {
    pub fn encode(&self) -> Vec<u8> {
        let mut a = vec![
            Value::Uint(self.network.number()),
            Value::Bytes(self.node.to_vec()),
        ];
        if let Some(e) = &self.endpoint {
            a.push(Value::Text(e.clone()));
        }
        cbor::encode(&Value::Array(a))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let Ok(Value::Array(a)) = cbor::decode(bytes) else {
            return None;
        };
        let (n, node, endpoint) = match a.as_slice() {
            [Value::Uint(n), Value::Bytes(k)] => (n, k, None),
            [Value::Uint(n), Value::Bytes(k), Value::Text(e)] => (n, k, Some(e.clone())),
            _ => return None,
        };
        let node: [u8; 33] = node.as_slice().try_into().ok()?;
        if node[0] != 2 && node[0] != 3 {
            return None;
        }
        Some(LnAddress {
            network: Network::from_number(*n)?,
            node,
            endpoint,
        })
    }
}

/// `ln-proof = [ invoice: tstr, ? preimage: bstr .size 32 ]`: the rail
/// proof a receipt or claim carries, inside the payment cMIP's proof.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LnProof {
    pub invoice: String,
    pub preimage: Option<[u8; 32]>,
}

impl LnProof {
    pub fn encode(&self) -> Vec<u8> {
        let mut a = vec![Value::Text(self.invoice.clone())];
        if let Some(p) = &self.preimage {
            a.push(Value::Bytes(p.to_vec()));
        }
        cbor::encode(&Value::Array(a))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let Ok(Value::Array(a)) = cbor::decode(bytes) else {
            return None;
        };
        match a.as_slice() {
            [Value::Text(i)] => Some(LnProof {
                invoice: i.clone(),
                preimage: None,
            }),
            [Value::Text(i), Value::Bytes(p)] => Some(LnProof {
                invoice: i.clone(),
                preimage: Some(p.as_slice().try_into().ok()?),
            }),
            _ => None,
        }
    }
}

/// Feature bits this rule knows: var_onion_optin (8, 9), payment_secret
/// (14, 15), basic_mpp (16, 17), option_payment_metadata (48, 49). An
/// invoice requiring any other feature answers unknown.
const KNOWN_FEATURES: [usize; 8] = [8, 9, 14, 15, 16, 17, 48, 49];

/// The Lightning rail Module.
#[derive(Clone, Copy, Debug, Default)]
pub struct Lightning;

impl Lightning {
    /// The rule itself, on its inputs (the module's "Verification rule").
    pub fn rule(input: &RailInput) -> Answer {
        let Some(addr) = LnAddress::decode(input.address) else {
            return Answer::Invalid("the address is not a Lightning rail address".into());
        };
        let Some(proof) = LnProof::decode(input.rail_proof) else {
            return Answer::Invalid("the rail proof is not in this Module's shape".into());
        };
        let inv = match bolt11::decode(&proof.invoice) {
            Ok(i) => i,
            Err(Bolt11Error::Malformed(w)) => {
                return Answer::Invalid(format!("not a valid BOLT 11 invoice: {w}"))
            }
            Err(Bolt11Error::Signature) => {
                return Answer::Invalid("the invoice's signature does not hold".into())
            }
        };
        if inv.network != addr.network {
            return Answer::Invalid("the invoice is for another network than the rail".into());
        }
        if input.amount.unit != unit(addr.network) {
            return Answer::Invalid("the amount is not in the rail's unit".into());
        }
        if inv.node != addr.node {
            return Answer::Invalid(
                "the invoice is signed by a node the payee did not declare".into(),
            );
        }
        if inv.has_description || inv.description_hash != Some(input.commitment) {
            return Answer::Invalid(
                "the invoice does not commit to this payment (description hash)".into(),
            );
        }
        if input.amount.value.checked_mul(1000) != inv.amount_msat {
            return Answer::Invalid("the invoice's amount is not the amount".into());
        }
        if let Some(bit) = (0..inv.features.len())
            .step_by(2)
            .find(|b| inv.features[*b] && !KNOWN_FEATURES.contains(b))
        {
            return Answer::Unknown(format!(
                "the invoice requires feature {bit}, unknown to this rule"
            ));
        }
        match proof.preimage {
            None => Answer::Pending("no preimage: the payment is not shown complete".into()),
            Some(p) if sha256(&p) != inv.payment_hash => {
                Answer::Invalid("the preimage does not match the payment hash".into())
            }
            Some(_) => Answer::Valid,
        }
    }
}

impl RailModule for Lightning {
    fn spec(&self) -> Hash {
        spec()
    }

    fn implements(&self) -> Hash {
        mor_payment::spec()
    }

    /// A request rail (F128, W4): the payee's node issues each invoice.
    fn kind(&self) -> RailKind {
        RailKind::Request
    }

    fn unit(&self, address: &[u8]) -> Option<Hash> {
        LnAddress::decode(address).map(|a| unit(a.network))
    }

    fn check(&self, input: &RailInput) -> Verification {
        Verification {
            answer: Lightning::rule(input),
            module: spec(),
            trusted: None,
        }
    }
}
