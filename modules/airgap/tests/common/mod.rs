//! Shared pieces for the Module's tests: a reproducible randomness source,
//! the test spec hashes, an owner with an online and an offline device, and
//! the second SLH-DSA implementation every device signature is checked by.

#![allow(dead_code)]

use mor_airgap::device::{Choices, Config, Signer};
use mor_airgap::msg::{kind, Message};
use mor_airgap::online::{self, GenesisPlan};
use mor_airgap::seed::SeedModule;
use mor_core::act::{self, Act, Addressing, Inside, Scheme, Signature};
use mor_core::cbor::Value;
use mor_core::chain::{Status, Verifier};
use mor_core::hash::{sha256, Hash, ZERO_HASH};
use mor_core::identity::{Home, Payload, Rotation, SafetyCommit, SigningKey};
use mor_core::sig::{self, SchnorrKey, SLH_CONTEXT};
use rand_core::{CryptoRng, RngCore};
use slh_dsa::{Sha2_128f, Sha2_128s};

/// A reproducible stand-in for a device's randomness: SHA-256 in counter mode.
pub struct TestRng {
    seed: Hash,
    counter: u64,
    buf: Vec<u8>,
}

impl TestRng {
    pub fn new(label: &str) -> Self {
        TestRng {
            seed: sha256(label.as_bytes()),
            counter: 0,
            buf: vec![],
        }
    }
}

impl RngCore for TestRng {
    fn next_u32(&mut self) -> u32 {
        let mut b = [0; 4];
        self.fill_bytes(&mut b);
        u32::from_le_bytes(b)
    }
    fn next_u64(&mut self) -> u64 {
        let mut b = [0; 8];
        self.fill_bytes(&mut b);
        u64::from_le_bytes(b)
    }
    fn fill_bytes(&mut self, dest: &mut [u8]) {
        while self.buf.len() < dest.len() {
            let mut x = self.seed.to_vec();
            x.extend_from_slice(&self.counter.to_be_bytes());
            self.counter += 1;
            self.buf.extend_from_slice(&sha256(&x));
        }
        let rest = self.buf.split_off(dest.len());
        dest.copy_from_slice(&self.buf);
        self.buf = rest;
    }
    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand_core::Error> {
        self.fill_bytes(dest);
        Ok(())
    }
}

impl CryptoRng for TestRng {}

pub fn identity_spec() -> Hash {
    sha256(b"IDENTITY, test value until the freeze")
}

pub fn money_spec() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
}

pub fn config() -> Config {
    Config {
        identity_spec: identity_spec(),
        money_spec: Some(money_spec()),
    }
}

/// The second implementation's verdict on an SLH-DSA signature (RustCrypto's
/// `slh-dsa`), as in the core's tests.
pub fn second_opinion(s: &Signature, msg: &[u8]) -> bool {
    fn check<P: slh_dsa::ParameterSet>(key: &[u8], sig: &[u8], msg: &[u8]) -> bool {
        let (Ok(vk), Ok(sg)) = (
            slh_dsa::VerifyingKey::<P>::try_from(key),
            slh_dsa::Signature::<P>::try_from(sig),
        ) else {
            return false;
        };
        vk.try_verify_with_context(msg, SLH_CONTEXT, &sg).is_ok()
    }
    match s.scheme {
        Scheme::Founding(2) => check::<Sha2_128s>(&s.key, &s.sig, msg),
        Scheme::Founding(3) => check::<Sha2_128f>(&s.key, &s.sig, msg),
        _ => panic!("not SLH-DSA"),
    }
}

/// Decode a signed rotation's act, and check its SLH-DSA signature with
/// both implementations, which must agree that it is valid.
pub fn rotation_act(signed: &Message) -> Act {
    let Message::SignedRotation(s) = signed else {
        panic!("not a signed rotation")
    };
    let a = Act::decode(&s.act).unwrap();
    assert!(sig::is_slh(&a.signature.scheme));
    assert_eq!(sig::verify(&a.signature, &a.id()), sig::Verdict::Valid);
    assert!(
        second_opinion(&a.signature, &a.id()),
        "the second SLH-DSA implementation disagrees"
    );
    a
}

pub fn own_home() -> Home {
    Home {
        operator: None,
        hint: "https://self.example".into(),
    }
}

pub fn home(name: &str) -> Home {
    Home {
        operator: Some(sha256(format!("operator {name}").as_bytes())),
        hint: format!("https://{name}.example"),
    }
}

pub fn signing(name: &str, gen: u32) -> SchnorrKey {
    SchnorrKey::from_secret(&sha256(format!("{name}/sign/{gen}").as_bytes())).unwrap()
}

/// An owner: an online device (signing key, published acts) and an offline
/// device (the signer), for a self-hosted identity, so that rotations count
/// on their own signatures and the core's verifier can check the result.
pub struct Owner {
    pub name: String,
    pub rng: TestRng,
    pub device: Signer,
    pub signing: SchnorrKey,
    pub gen: u32,
    /// The latest identity-chain act, as published.
    pub last: Act,
    pub identity: Hash,
    pub position: u64,
    pub verifier: Verifier,
}

impl Owner {
    pub fn new(name: &str, module: SeedModule, scheme: u8) -> Owner {
        Self::with_homes(name, module, scheme, vec![own_home()])
    }

    pub fn with_homes(name: &str, module: SeedModule, scheme: u8, homes: Vec<Home>) -> Owner {
        let mut rng = TestRng::new(name);
        let mut device = Signer::new(config());
        device.new_seed(module, scheme, &mut rng);
        let export = device.export_commitment(0, 0).encode();
        let signing = signing(name, 0);
        let g = online::genesis(
            identity_spec(),
            &export,
            &signing,
            GenesisPlan {
                homes,
                ..Default::default()
            },
            &mut rng,
        )
        .unwrap();
        let mut verifier = Verifier::new(identity_spec());
        let identity = verifier.add(g.clone()).unwrap();
        Owner {
            name: name.into(),
            rng,
            device,
            signing,
            gen: 0,
            last: g,
            identity,
            position: 0,
            verifier,
        }
    }

    /// The rotation the online device wants next, with a fresh signing key.
    pub fn plan(&self) -> Rotation {
        let next = signing(&self.name, self.gen + 1);
        Rotation {
            prev: self.last.id(),
            position: self.position + 1,
            signing_key: SigningKey {
                scheme: sig::SCHNORR,
                key: next.public().to_vec(),
            },
            // Ignored: the offline device supplies it.
            safety: SafetyCommit {
                scheme: sig::SLH_128S,
                commit: ZERO_HASH,
            },
            kept: vec![],
            disowned: None,
            homes: None,
            rule: None,
            declarations: None,
            successor: None,
            audit: None,
            homeless: false,
            closure: false,
        }
    }

    pub fn pending(&self, r: &Rotation) -> Message {
        online::pending(&identity_spec(), &self.last, r, None, false)
    }

    /// Review and sign on the offline device, with no exception.
    pub fn sign(&mut self, pending: &Message, choices: &Choices) -> Message {
        let review = self
            .device
            .review(&pending.encode(), choices, &mut self.rng)
            .unwrap();
        let s = self.device.sign(review, false, &mut self.rng).unwrap();
        Message::SignedRotation(s.message)
    }

    /// Check what came back, publish it, and move on to the new keys.
    pub fn publish(&mut self, pending: &Message, signed: &Message) -> Act {
        let acc = online::accept(&identity_spec(), &pending.encode(), &signed.encode()).unwrap();
        let a = rotation_act(signed);
        self.verifier.add(a.clone()).unwrap();
        self.gen += 1;
        self.signing = acc
            .signing_key
            .unwrap_or_else(|| signing(&self.name, self.gen));
        self.last = a.clone();
        self.position += 1;
        a
    }

    /// One full rotation: plan, sign offline, check and publish.
    pub fn rotate(&mut self) -> Act {
        let p = self.pending(&self.plan());
        let s = self.sign(&p, &Choices::default());
        self.publish(&p, &s)
    }

    /// The identity chain as the core's verifier resolves it: the act that
    /// counts at the latest position.
    pub fn counting(&self) -> Hash {
        self.verifier
            .resolve(&self.identity)
            .latest()
            .unwrap()
            .0
            .act
    }

    /// An everyday act under the current signing key, held, and its status.
    pub fn post(&mut self, text: &str) -> Status {
        let mut salt = [0u8; 16];
        self.rng.fill_bytes(&mut salt);
        let inside = Inside {
            spec: sha256(b"a text specification"),
            type_: 0,
            prev: Some(vec![]),
            objects: None,
            payload: vec![(Value::Uint(0), Value::Text(text.into()))],
            position: Some(1),
            summary: Some(ZERO_HASH),
            acks: None,
            refs: None,
            hint: None,
            salt,
        };
        let mut key = [0u8; 32];
        let mut nonce = [0u8; 24];
        self.rng.fill_bytes(&mut key);
        self.rng.fill_bytes(&mut nonce);
        let s = self.signing.clone();
        let a = act::make(
            &inside,
            &key,
            &nonce,
            &Addressing {
                signer: Some(self.identity),
                binding: Some(self.last.id()),
                public: true,
                to: None,
            },
            |id| s.sign(id, &[0; 32]),
        );
        let id = self.verifier.add(a).unwrap();
        self.verifier.status(&id)
    }
}

/// The rotation payload of an act.
pub fn rotation_of(a: &Act) -> Rotation {
    let inside = a.open(None).unwrap();
    match Payload::decode(1, &inside.payload).unwrap() {
        Payload::Rotation(r) => r,
        _ => panic!("not a rotation"),
    }
}

pub fn decode(bytes: &[u8], k: u64) -> Message {
    Message::decode_kind(bytes, k).unwrap()
}

pub fn pending_kind() -> u64 {
    kind::PENDING_ROTATION
}
