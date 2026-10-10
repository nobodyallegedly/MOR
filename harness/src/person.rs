//! Test identities as their owner, or a thief holding their keys, sees
//! them: keys, and the acts they sign.
//!
//! Every key comes from the run's own random seed and a name, so a run can
//! rebuild a key it needs (a backed-up signing seed, a thief's copy of a
//! chain key) and no two runs share keys. Test identities only: the safety
//! key is held in software.

use mor_core::act::{self, Act, Addressing, Inside, Object};
use mor_core::cbor::Value;
use mor_core::envelopes::{DecKey, EncKey, EncryptionKey, Route, Routes, Version};
use mor_core::hash::{sha256, Hash, ZERO_HASH};
use mor_core::identity::{
    Absence, Audit, Declaration, Endorsement, Genesis, Home, HomeRule, KeptTip, Objection, Payload, Receipt,
    Rotation, ChainKeyCommit, SigningKey,
};
use mor_core::mmr::Mmr;
use mor_core::sig::{self, SchnorrKey, SlhKey};
use mor_relay::operator::random;
use mor_relay::Specs;

/// The chain-key scheme of the gauntlet's identities: SLH-DSA-SHA2-128f
/// (scheme 3), fast to sign. Both schemes are allowed (Identity).
pub const CHAIN_KEY_SCHEME: u8 = 3;

fn derive(seed: &[u8; 32], label: &str) -> Hash {
    let mut b = seed.to_vec();
    b.extend_from_slice(label.as_bytes());
    sha256(&b)
}

/// A signing key from the run's seed. Several derivations of one label
/// never collide with a valid key in practice; if one did, the next is used.
pub fn schnorr(seed: &[u8; 32], label: &str) -> SchnorrKey {
    SchnorrKey::from_secret(&schnorr_secret(seed, label)).unwrap()
}

pub fn schnorr_secret(seed: &[u8; 32], label: &str) -> [u8; 32] {
    (0u32..)
        .map(|i| derive(seed, &format!("{label}/sign/{i}")))
        .find(|s| SchnorrKey::from_secret(s).is_some())
        .unwrap()
}

pub fn slh(seed: &[u8; 32], label: &str) -> SlhKey {
    let h = derive(seed, &format!("{label}/safety"));
    let g = sha256(&h);
    SlhKey::from_seeds(
        CHAIN_KEY_SCHEME,
        h[..16].try_into().unwrap(),
        h[16..].try_into().unwrap(),
        g[..16].try_into().unwrap(),
    )
}

fn signing_key(k: &SchnorrKey) -> SigningKey {
    SigningKey {
        scheme: sig::SCHNORR,
        key: k.public().to_vec(),
    }
}

fn commit(k: &SlhKey) -> ChainKeyCommit {
    ChainKeyCommit {
        scheme: k.scheme(),
        commit: k.commitment(),
    }
}

fn inside(spec: Hash, type_: u64, payload: Vec<(Value, Value)>) -> Inside {
    Inside {
        spec,
        type_,
        prev: None,
        objects: None,
        payload,
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: random::<16>(),
    }
}

fn seal(
    i: &Inside,
    signer: Option<Hash>,
    binding: Option<Hash>,
    to: Option<Vec<Hash>>,
    key: &[u8; 32],
    sign: impl FnOnce(&Hash) -> act::Signature,
) -> Act {
    act::make(
        i,
        key,
        &random::<24>(),
        &Addressing {
            signer,
            binding,
            public: to.is_none(),
            to,
        },
        sign,
    )
}

/// What a rotation changes, besides the keys (which always roll forward).
#[derive(Clone, Default)]
pub struct Rot {
    pub homes: Option<Vec<Home>>,
    pub rule: Option<Option<HomeRule>>,
    pub audit: Option<Option<Audit>>,
    pub homeless: bool,
    pub closure: bool,
    /// A signing key other than the owner's next one: a thief's rival.
    pub signing_key: Option<SchnorrKey>,
    /// Kept tips; `None` keeps the tip of the person's sequence, if any.
    pub kept: Option<Vec<KeptTip>>,
}

/// One identity, as whoever holds its keys sees it.
#[derive(Clone)]
pub struct Person {
    pub name: String,
    pub id: Hash,
    /// Generation of the current keys: 0 at genesis, one more per rotation.
    pub gen: u32,
    pub sign: SchnorrKey,
    /// The chain key the current chain act committed, to reveal next.
    pub chain_key: SlhKey,
    /// The identity-chain act that bound the current signing key.
    pub binding: Hash,
    pub position: u64,
    /// The everyday sequence, as act ids.
    pub seq: Vec<Hash>,
    seed: [u8; 32],
    specs: Specs,
    /// The content key of every everyday act this person signed.
    keys: std::collections::BTreeMap<Hash, [u8; 32]>,
}

/// The objects field naming an act of an identity chain.
pub fn naming(identity: &Hash, act: &Hash) -> Option<Vec<Object>> {
    Some(vec![Object {
        chain: *identity,
        predecessor: *act,
    }])
}

impl Person {
    /// A new identity: its genesis act, and the person.
    pub fn genesis(
        seed: &[u8; 32],
        name: &str,
        homes: Vec<Home>,
        rule: Option<HomeRule>,
        audit: Option<Audit>,
    ) -> (Act, Person) {
        Self::genesis_declaring(seed, name, homes, rule, audit, None)
    }

    /// A new identity whose genesis makes declarations (a Money vault).
    pub fn genesis_declaring(
        seed: &[u8; 32],
        name: &str,
        homes: Vec<Home>,
        rule: Option<HomeRule>,
        audit: Option<Audit>,
        declarations: Option<Vec<Declaration>>,
    ) -> (Act, Person) {
        let specs = Specs::test();
        let sign = schnorr(seed, &format!("{name}/0"));
        let chain_key = slh(seed, &format!("{name}/0"));
        let g = Payload::Genesis(Genesis {
            signing_key: signing_key(&sign),
            chain_key: commit(&chain_key),
            homes,
            rule,
            declarations,
            audit,
        });
        let i = inside(specs.identity, 0, g.to_map());
        let a = seal(&i, None, None, None, &random::<32>(), |id| {
            sign.sign(id, &random::<32>())
        });
        let id = a.id();
        (
            a,
            Person {
                name: name.into(),
                id,
                gen: 0,
                sign,
                chain_key,
                binding: id,
                position: 0,
                seq: vec![],
                seed: *seed,
                specs,
                keys: Default::default(),
            },
        )
    }

    /// The current signing key's secret, as the owner's key file holds it
    /// (for a self-hosted home run under this identity). Only for keys this
    /// person derived itself.
    pub fn signing_secret(&self) -> [u8; 32] {
        schnorr_secret(&self.seed, &format!("{}/{}", self.name, self.gen))
    }

    /// A key only a thief would install, derived apart from the owner's.
    pub fn thief_key(&self, label: &str) -> SchnorrKey {
        schnorr(&self.seed, &format!("{}/thief/{label}", self.name))
    }

    /// A rotation, signed with the chain key the current chain act
    /// committed. Returns the act and the person as it is if it counts.
    pub fn rotation(&self, r: Rot) -> (Act, Person) {
        let gen = self.gen + 1;
        let label = format!("{}/{gen}", self.name);
        let next_sign = r
            .signing_key
            .clone()
            .unwrap_or_else(|| schnorr(&self.seed, &label));
        // A thief's rival commits a chain key of its own.
        let next_chain_key = if r.signing_key.is_some() {
            slh(&self.seed, &format!("{label}/thief"))
        } else {
            slh(&self.seed, &label)
        };
        let kept = r.kept.clone().unwrap_or_else(|| self.kept());
        let payload = Payload::Rotation(Rotation {
            prev: self.binding,
            position: self.position + 1,
            signing_key: signing_key(&next_sign),
            chain_key: commit(&next_chain_key),
            kept,
            disowned: None,
            homes: r.homes,
            rule: r.rule,
            declarations: None,
            successor: None,
            audit: r.audit,
            homeless: r.homeless,
            closure: r.closure,
        });
        let i = inside(self.specs.identity, 1, payload.to_map());
        let chain_key = self.chain_key.clone();
        let a = seal(&i, Some(self.id), None, None, &random::<32>(), |id| {
            chain_key.sign(id, Some(&random::<16>()))
        });
        let mut q = self.clone();
        if r.signing_key.is_some() {
            // The thief's line from here: its later keys are its own.
            q.name = format!("{}~thief", self.name);
        }
        q.gen = gen;
        q.sign = next_sign;
        q.chain_key = next_chain_key;
        q.binding = a.id();
        q.position += 1;
        (a, q)
    }

    /// The kept tip of the whole sequence so far.
    pub fn kept(&self) -> Vec<KeptTip> {
        self.kept_upto(self.seq.len())
    }

    /// The kept tip of the first `n` acts of the sequence.
    pub fn kept_upto(&self, n: usize) -> Vec<KeptTip> {
        if n == 0 {
            return vec![];
        }
        vec![KeptTip {
            act: self.seq[n - 1],
            position: n as u64,
            summary: Mmr::from_ids(&self.seq[..n]).root(),
        }]
    }

    /// The next everyday act of the sequence, public unless `to` is given.
    pub fn act(
        &mut self,
        spec: Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
        to: Option<Vec<Hash>>,
    ) -> Act {
        self.act_keyed(spec, type_, payload, objects, to, &random::<32>())
    }

    /// A private message to one identity, and its content key.
    pub fn message(&mut self, to: Hash, text: &str) -> (Act, [u8; 32]) {
        let key = random::<32>();
        let a = self.act_keyed(
            sha256(b"a text specification"),
            0,
            vec![(Value::Uint(0), Value::Text(text.into()))],
            None,
            Some(vec![to]),
            &key,
        );
        (a, key)
    }

    fn act_keyed(
        &mut self,
        spec: Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
        to: Option<Vec<Hash>>,
        key: &[u8; 32],
    ) -> Act {
        let mut i = inside(spec, type_, payload);
        i.prev = Some(self.seq.last().map(|x| vec![*x]).unwrap_or_default());
        i.objects = objects;
        i.position = Some(self.seq.len() as u64 + 1);
        i.summary = Some(if self.seq.is_empty() {
            ZERO_HASH
        } else {
            Mmr::from_ids(&self.seq).root()
        });
        let sign = self.sign.clone();
        let a = seal(&i, Some(self.id), Some(self.binding), to, key, |id| {
            sign.sign(id, &random::<32>())
        });
        self.seq.push(a.id());
        self.keys.insert(a.id(), *key);
        a
    }

    /// The content key of an everyday act this person signed.
    pub fn key_of(&self, act: &Hash) -> Option<[u8; 32]> {
        self.keys.get(act).copied()
    }

    pub fn identity_act(&mut self, p: Payload, objects: Option<Vec<Object>>) -> Act {
        let spec = self.specs.identity;
        self.act(spec, p.type_(), p.to_map(), objects, None)
    }

    /// A public post of some text specification.
    pub fn post(&mut self, text: &str) -> Act {
        self.act(
            sha256(b"a text specification"),
            0,
            vec![(Value::Uint(0), Value::Text(text.into()))],
            None,
            None,
        )
    }

    /// A routes act with one inbox route for everything.
    pub fn routes(&mut self, version: u64, previous: Option<Hash>, inbox: &str) -> Act {
        let r = Routes {
            version: Version { version, previous },
            routes: vec![Route {
                scope: None,
                hints: vec![inbox.to_string()],
                kind: 1,
            }],
        };
        let spec = self.specs.identity;
        self.act(spec, 3, r.to_map(), None, None)
    }

    /// An encryption-key act (Envelopes type 4) for an X-Wing key.
    pub fn encryption_key(&mut self, version: u64, previous: Option<Hash>, key: &DecKey) -> Act {
        let e = EncryptionKey {
            version: Version { version, previous },
            key: EncKey::xwing(key.public.key.clone()),
        };
        let spec = self.specs.envelopes;
        self.act(spec, 4, e.to_map(), None, None)
    }

    /// A receipt, as the operator's signing key signs one.
    pub fn receipt(
        &mut self,
        identity: &Hash,
        act: &Hash,
        position: u64,
        log_position: u64,
    ) -> Act {
        self.identity_act(
            Payload::Receipt(Receipt {
                identity: *identity,
                act: *act,
                position,
                log_position,
            }),
            None,
        )
    }

    pub fn cosign(&mut self, operator: &Hash, summary: &Hash) -> Act {
        self.identity_act(Payload::Cosignature, naming(operator, summary))
    }

    pub fn absent(&mut self, operator: &Hash, identity: &Hash, rotation: &Hash) -> Act {
        self.identity_act(
            Payload::Absence(Absence {
                operator: *operator,
                last_summary: None,
            }),
            naming(identity, rotation),
        )
    }

    pub fn object(&mut self, identity: &Hash, rotation: &Hash) -> Act {
        self.identity_act(
            Payload::Objection(Objection {
                identity: *identity,
            }),
            naming(identity, rotation),
        )
    }

    /// An escape endorsement of a homeless rotation, signed with the key the
    /// act just before it bound (this person as it was then).
    pub fn endorse(&mut self, rotation: &Hash, abandoned: Option<Vec<Hash>>) -> Act {
        let id = self.id;
        self.identity_act(
            Payload::Endorsement(Endorsement { abandoned }),
            naming(&id, rotation),
        )
    }

    /// The same identity as someone holding only its signing key and its
    /// public sequence sees it: a home operator's key, stolen.
    pub fn from_signing_key(
        name: &str,
        id: Hash,
        binding: Hash,
        secret: &[u8; 32],
        seq: Vec<Hash>,
    ) -> Person {
        Person {
            name: name.into(),
            id,
            gen: 0,
            sign: SchnorrKey::from_secret(secret).expect("a valid signing secret"),
            // Not held: a thief with the signing key has no chain key.
            chain_key: slh(&random::<32>(), "not held"),
            binding,
            position: 0,
            seq,
            seed: random::<32>(),
            specs: Specs::test(),
            keys: Default::default(),
        }
    }
}
