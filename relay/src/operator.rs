//! The operator: the identity that runs a home and signs everything it
//! states (Identity, "Definitions"). Its receipts, log summaries, objections
//! and routes are ordinary everyday acts in one sequence.
//!
//! **Test identities only (roadmap, until step 17).** An operator created
//! here holds its safety key in software, in the key file beside the
//! database. That is a prototype, clearly labelled in the file itself; real
//! identities are created with the air-gapped safety key Module.
//!
//! The operator is self-hosted at its own home: its genesis names one home,
//! with no operator (itself), and the home's base address as the hint. A
//! verifier resolves it from that home, on its own signatures (Identity,
//! "Resolving an operator").

use mor_core::act::{self, Act, Addressing, Inside, Object};
use mor_core::cbor::{self, Value};
use mor_core::hash::{Hash, ZERO_HASH};
use mor_core::identity::{Genesis, Home, Payload, SafetyCommit, SigningKey};
use mor_core::mmr::Mmr;
use mor_core::sig::{self, SchnorrKey, SlhKey};
use std::path::Path;

/// Written into every key file this software creates.
pub const TEST_LABEL: &str = "MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.";

/// Fresh random bytes from the operating system.
pub fn random<const N: usize>() -> [u8; N] {
    let mut b = [0u8; N];
    getrandom::fill(&mut b).expect("the operating system's random source");
    b
}

/// A fresh, valid Schnorr secret.
fn schnorr_secret() -> ([u8; 32], SchnorrKey) {
    loop {
        let s = random::<32>();
        if let Some(k) = SchnorrKey::from_secret(&s) {
            return (s, k);
        }
    }
}

/// The key file: what the operator must keep secret.
#[derive(Clone)]
pub struct Keys {
    pub identity: Hash,
    /// The identity-chain act that bound the current signing key.
    pub binding: Hash,
    pub signing_secret: [u8; 32],
    /// The safety key the current chain act committed: scheme and FIPS 205 seeds.
    pub safety_scheme: u8,
    pub safety_seeds: [u8; 48],
}

impl Keys {
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&Value::Map(vec![
            (Value::Uint(0), Value::Text(TEST_LABEL.into())),
            (Value::Uint(1), Value::Bytes(self.identity.to_vec())),
            (Value::Uint(2), Value::Bytes(self.binding.to_vec())),
            (Value::Uint(3), Value::Bytes(self.signing_secret.to_vec())),
            (Value::Uint(4), Value::Uint(self.safety_scheme as u64)),
            (Value::Uint(5), Value::Bytes(self.safety_seeds.to_vec())),
        ]))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let v = cbor::decode(bytes).ok()?;
        let b = |k| match v.map_get(k) {
            Some(Value::Bytes(b)) => Some(b.clone()),
            _ => None,
        };
        let scheme = match v.map_get(4) {
            Some(Value::Uint(n @ 2..=3)) => *n as u8,
            _ => return None,
        };
        Some(Keys {
            identity: b(1)?.try_into().ok()?,
            binding: b(2)?.try_into().ok()?,
            signing_secret: b(3)?.try_into().ok()?,
            safety_scheme: scheme,
            safety_seeds: b(5)?.try_into().ok()?,
        })
    }

    pub fn load(path: &Path) -> std::io::Result<Self> {
        let bytes = std::fs::read(path)?;
        Keys::decode(&bytes)
            .ok_or_else(|| std::io::Error::new(std::io::ErrorKind::InvalidData, "not a key file"))
    }

    /// Write the key file, readable by its owner only.
    pub fn save(&self, path: &Path) -> std::io::Result<()> {
        use std::io::Write;
        let mut o = std::fs::OpenOptions::new();
        o.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            o.mode(0o600);
        }
        o.open(path)?.write_all(&self.encode())
    }

    pub fn safety(&self) -> SlhKey {
        let s = &self.safety_seeds;
        SlhKey::from_seeds(
            self.safety_scheme,
            s[..16].try_into().unwrap(),
            s[16..32].try_into().unwrap(),
            s[32..].try_into().unwrap(),
        )
    }
}

/// A public act, sealed with a fresh content key and nonce, signed by `sign`.
pub fn seal_public(
    inside: &Inside,
    signer: Option<Hash>,
    binding: Option<Hash>,
    sign: impl FnOnce(&Hash) -> act::Signature,
) -> Act {
    act::make(
        inside,
        &random::<32>(),
        &random::<24>(),
        &Addressing {
            signer,
            binding,
            public: true,
            to: None,
        },
        sign,
    )
}

/// A new test operator identity, self-hosted at `base`: its key file and
/// its genesis act.
pub fn create(identity_spec: &Hash, base: &str) -> (Keys, Act) {
    let (secret, key) = schnorr_secret();
    let scheme = sig::SLH_128S;
    let seeds = random::<48>();
    let safety = SlhKey::from_seeds(
        2,
        seeds[..16].try_into().unwrap(),
        seeds[16..32].try_into().unwrap(),
        seeds[32..].try_into().unwrap(),
    );
    let g = Payload::Genesis(Genesis {
        signing_key: SigningKey {
            scheme: sig::SCHNORR,
            key: key.public().to_vec(),
        },
        safety: SafetyCommit {
            scheme,
            commit: safety.commitment(),
        },
        homes: vec![Home {
            operator: None,
            hint: base.to_string(),
        }],
        rule: None,
        declarations: None,
        audit: None,
    });
    let inside = Inside {
        spec: *identity_spec,
        type_: g.type_(),
        prev: None,
        objects: None,
        payload: g.to_map(),
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: random::<16>(),
    };
    let genesis = seal_public(&inside, None, None, |id| key.sign(id, &random::<32>()));
    let keys = Keys {
        identity: genesis.id(),
        binding: genesis.id(),
        signing_secret: secret,
        safety_scheme: 2,
        safety_seeds: seeds,
    };
    (keys, genesis)
}

/// The operator as a running home holds it: keys, and its sequence so far.
pub struct Operator {
    pub id: Hash,
    pub binding: Hash,
    key: SchnorrKey,
    seq: Vec<Hash>,
    mmr: Mmr,
}

impl Operator {
    /// `seq`: the operator's everyday acts so far, in order.
    pub fn new(keys: &Keys, seq: Vec<Hash>) -> Self {
        Operator {
            id: keys.identity,
            binding: keys.binding,
            key: SchnorrKey::from_secret(&keys.signing_secret).expect("a valid signing secret"),
            mmr: Mmr::from_ids(&seq),
            seq,
        }
    }

    /// The next everyday act in the operator's sequence, signed. Not yet
    /// part of the sequence: call [`Operator::push`] once it is stored.
    pub fn sign(
        &self,
        spec: &Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
    ) -> Act {
        let inside = Inside {
            spec: *spec,
            type_,
            prev: Some(self.seq.last().map(|x| vec![*x]).unwrap_or_default()),
            objects,
            payload,
            position: Some(self.seq.len() as u64 + 1),
            summary: Some(if self.seq.is_empty() {
                ZERO_HASH
            } else {
                self.mmr.root()
            }),
            acks: None,
            refs: None,
            hint: None,
            salt: random::<16>(),
        };
        seal_public(&inside, Some(self.id), Some(self.binding), |id| {
            self.key.sign(id, &random::<32>())
        })
    }

    /// The position the next act will take.
    pub fn next_position(&self) -> u64 {
        self.seq.len() as u64 + 1
    }

    pub fn push(&mut self, id: Hash) {
        self.seq.push(id);
        self.mmr.push(&id);
    }
}

/// A routes payload (Identity type 3), first version, with one outbox route
/// for `scope` (cMIP, "Addresses": an operator's Identity acts are found
/// where its outbox route for `IDENTITY` points).
pub fn routes_payload(scope: &Hash, hints: &[String]) -> Vec<(Value, Value)> {
    vec![
        (Value::Uint(0), Value::Uint(1)),
        (
            Value::Uint(2),
            Value::Array(vec![Value::Array(vec![
                Value::Bytes(scope.to_vec()),
                Value::Array(hints.iter().cloned().map(Value::Text).collect()),
            ])]),
        ),
    ]
}
