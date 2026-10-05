//! A small world of test identities for the identity-chain tests: keys
//! derived from names, acts built and signed, and every SLH-DSA signature
//! checked by the second implementation as it enters the verifier.

#![allow(dead_code)]

use mor_core::act::{self, Act, Addressing, Inside, Object, Scheme, Signature};
use mor_core::cbor::Value;
use mor_core::chain::Verifier;
use mor_core::hash::{sha256, Hash, ZERO_HASH};
use mor_core::identity::{
    Absence, Audit, Declaration, Endorsement, Genesis, Home, HomeRule, KeptTip, LogSummary,
    ChainSignature, Objection, Payload, Receipt, Rotation, SafetyCommit, SigningKey, Successor,
};
use mor_core::merkle;
use mor_core::mmr::Mmr;
use mor_core::sig::{self, SchnorrKey, SlhKey, Verdict, SLH_CONTEXT};
use slh_dsa::{Sha2_128f, Sha2_128s};

/// The Identity MIP's spec hash in these tests. The real one is fixed at the freeze.
pub fn identity_spec() -> Hash {
    sha256(b"IDENTITY, test value until the freeze")
}

/// The Finance and Law MIPs' spec hashes in these tests: the act types
/// that may carry acknowledgements beside Identity's (F110).
pub fn finance_spec() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
}
pub fn law_spec() -> Hash {
    sha256(b"LAW, test value until the freeze")
}

/// The second implementation's verdict on an SLH-DSA signature.
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

/// One identity as its owner (or a thief holding its keys) sees it.
#[derive(Clone)]
pub struct Person {
    pub name: String,
    pub id: Hash,
    /// Generation of the current keys: 0 at genesis, +1 per rotation made.
    pub gen: u32,
    pub sign: SchnorrKey,
    /// The safety key committed by the current chain act, to reveal next.
    pub safety: SlhKey,
    /// The identity-chain act that bound the current signing key.
    pub binding: Hash,
    /// Its position in the identity chain.
    pub position: u64,
    /// The latest act of its identity chain: the binding, or a chain
    /// signature made since (F132).
    pub tip: Hash,
    /// The safety scheme used for new commitments (2 or 3).
    pub scheme: u8,
    /// The everyday sequence, as act ids.
    pub seq: Vec<Hash>,
    /// As a home operator: the receipts signed, in log order.
    pub log: Vec<Hash>,
    pub last_summary: Option<Hash>,
    /// For a collective's device (F127): the collective's chain, and the
    /// decisions every everyday act it signs cites there, unless the act
    /// already names that chain.
    pub cite: Option<(Hash, Vec<Hash>)>,
}

/// The objects of an everyday act, with the collective's chain cited where
/// its signer is a collective's device (F127).
fn cited(p: &Person, spec: &Hash, type_: u64, objects: Option<Vec<Object>>) -> Option<Vec<Object>> {
    let Some((chain, ds)) = &p.cite else { return objects };
    // Identity's own everyday acts (a witness act...) carry no objects:
    // they are not on the actions chain (reading, F127). A record (Law
    // type 17) is a decision, citing by its kept tips.
    if spec == &identity_spec() || (spec == &law_spec() && type_ == 17) {
        return objects;
    }
    if objects.iter().flatten().any(|o| &o.chain == chain) {
        return objects;
    }
    let mut o = objects.unwrap_or_default();
    o.extend(ds.iter().map(|d| Object { chain: *chain, predecessor: *d }));
    Some(o)
}

pub fn schnorr(name: &str, gen: u32) -> SchnorrKey {
    SchnorrKey::from_secret(&sha256(format!("{name}/sign/{gen}").as_bytes())).unwrap()
}

pub fn slh(name: &str, gen: u32, scheme: u8) -> SlhKey {
    let h = sha256(format!("{name}/safety/{gen}").as_bytes());
    let g = sha256(&h);
    SlhKey::from_seeds(
        scheme,
        h[..16].try_into().unwrap(),
        h[16..].try_into().unwrap(),
        g[..16].try_into().unwrap(),
    )
}

pub fn signing_key(k: &SchnorrKey) -> SigningKey {
    SigningKey {
        scheme: sig::SCHNORR,
        key: k.public().to_vec(),
    }
}

pub fn commit(k: &SlhKey) -> SafetyCommit {
    SafetyCommit {
        scheme: k.scheme(),
        commit: k.commitment(),
    }
}

pub fn home(op: &Person) -> Home {
    Home {
        operator: Some(op.id),
        hint: format!("https://{}.example", op.name),
    }
}

pub fn own_home() -> Home {
    Home {
        operator: None,
        hint: "https://self.example".into(),
    }
}

/// What a rotation changes, besides the keys (which always roll forward).
#[derive(Clone, Default)]
pub struct Rot {
    /// Kept tips; `None` keeps the tip of the person's sequence, if any.
    pub kept: Option<Vec<KeptTip>>,
    pub disowned: Option<Vec<Hash>>,
    pub homes: Option<Vec<Home>>,
    pub rule: Option<Option<HomeRule>>,
    pub declarations: Option<Vec<Declaration>>,
    pub successor: Option<Option<Successor>>,
    pub audit: Option<Option<Audit>>,
    pub homeless: bool,
    pub closure: bool,
    /// A different signing key than the next generation's (a thief's rival).
    pub signing_key: Option<SchnorrKey>,
    /// Install an everyday key of another scheme.
    pub raw_signing_key: Option<SigningKey>,
}

pub struct World {
    pub v: Verifier,
    counter: u64,
    /// Every act held, in the order it was added, with the content key a
    /// recipient opens it with: so a history can be replayed into a fresh
    /// verifier in another order (the Law invariants).
    pub log: Vec<(Act, Option<mor_core::lock::ContentKey>)>,
}

impl Default for World {
    fn default() -> Self {
        Self::new()
    }
}

impl World {
    pub fn new() -> Self {
        World {
            v: Verifier::with_mips(identity_spec(), finance_spec(), law_spec()),
            counter: 0,
            log: vec![],
        }
    }

    fn fresh(&mut self) -> ([u8; 32], [u8; 24], [u8; 16]) {
        self.counter += 1;
        let h = sha256(&self.counter.to_be_bytes());
        let g = sha256(&h);
        (h, g[..24].try_into().unwrap(), g[..16].try_into().unwrap())
    }

    /// Hold an act. Every SLH-DSA signature is checked by both implementations.
    pub fn add(&mut self, a: &Act) -> Hash {
        if sig::is_slh(&a.signature.scheme) {
            let ours = sig::verify(&a.signature, &a.id()) == Verdict::Valid;
            assert_eq!(
                ours,
                second_opinion(&a.signature, &a.id()),
                "the two SLH-DSA implementations disagree"
            );
        }
        self.log.push((a.clone(), None));
        self.v.add(a.clone()).unwrap()
    }

    fn inside(&mut self, type_: u64, payload: &Payload) -> Inside {
        let salt = self.fresh().2;
        Inside {
            spec: identity_spec(),
            type_,
            prev: None,
            objects: None,
            payload: payload.to_map(),
            position: None,
            summary: None,
            acks: None,
            refs: None,
            hint: None,
            salt,
        }
    }

    fn seal(
        &mut self,
        inside: &Inside,
        signer: Option<Hash>,
        binding: Option<Hash>,
        sign: impl FnOnce(&Hash) -> Signature,
    ) -> Act {
        let (key, nonce, _) = self.fresh();
        act::make(
            inside,
            &key,
            &nonce,
            &Addressing {
                signer,
                binding,
                public: true,
                to: None,
            },
            sign,
        )
    }

    /// A new identity. Its genesis is held.
    pub fn genesis(
        &mut self,
        name: &str,
        homes: Vec<Home>,
        rule: Option<HomeRule>,
        audit: Option<Audit>,
    ) -> Person {
        self.genesis_with(name, homes, rule, audit, None, 3)
    }

    pub fn genesis_with(
        &mut self,
        name: &str,
        homes: Vec<Home>,
        rule: Option<HomeRule>,
        audit: Option<Audit>,
        declarations: Option<Vec<Declaration>>,
        scheme: u8,
    ) -> Person {
        let sign = schnorr(name, 0);
        let safety = slh(name, 0, scheme);
        let g = Payload::Genesis(Genesis {
            signing_key: signing_key(&sign),
            safety: commit(&safety),
            homes,
            rule,
            declarations,
            audit,
        });
        let inside = self.inside(0, &g);
        let a = self.seal(&inside, None, None, |id| sign.sign(id, &[0; 32]));
        let id = self.add(&a);
        Person {
            name: name.into(),
            id,
            gen: 0,
            sign,
            safety,
            binding: id,
            position: 0,
            tip: id,
            scheme,
            seq: vec![],
            log: vec![],
            last_summary: None,
            cite: None,
        }
    }

    /// A self-hosted identity, for operators and auditors.
    pub fn operator(&mut self, name: &str) -> Person {
        self.genesis(name, vec![own_home()], None, None)
    }

    /// A rotation of `p`, signed with the safety key its current chain act
    /// committed. Not held yet. Returns the act and the person as it would
    /// be if this rotation counts.
    pub fn rotation(&mut self, p: &Person, r: Rot) -> (Act, Person) {
        let gen = p.gen + 1;
        let next_sign = r
            .signing_key
            .clone()
            .unwrap_or_else(|| schnorr(&p.name, gen));
        let next_safety = slh(&p.name, gen, p.scheme);
        let kept = r.kept.clone().unwrap_or_else(|| {
            p.seq
                .last()
                .map(|t| {
                    vec![KeptTip {
                        act: *t,
                        position: p.seq.len() as u64,
                        summary: Mmr::from_ids(&p.seq).root(),
                    }]
                })
                .unwrap_or_default()
        });
        let payload = Payload::Rotation(Rotation {
            prev: p.tip,
            position: p.position + 1,
            signing_key: r
                .raw_signing_key
                .clone()
                .unwrap_or_else(|| signing_key(&next_sign)),
            safety: commit(&next_safety),
            kept,
            disowned: r.disowned,
            homes: r.homes,
            rule: r.rule,
            declarations: r.declarations,
            successor: r.successor,
            audit: r.audit,
            homeless: r.homeless,
            closure: r.closure,
        });
        let inside = self.inside(1, &payload);
        let safety = p.safety.clone();
        let a = self.seal(&inside, Some(p.id), None, |id| safety.sign(id, None));
        let mut q = p.clone();
        q.gen = gen;
        q.sign = next_sign;
        q.safety = next_safety;
        q.binding = a.id();
        q.tip = a.id();
        q.position += 1;
        (a, q)
    }

    /// A chain signature of `p` on `signs` (Identity type 16, F132), signed
    /// with the safety key its latest chain act committed, committing the
    /// next one. Held. Returns the act and the person as it is once the
    /// signature counts: same signing key and binding, a new safety key.
    pub fn chain_sign(&mut self, p: &Person, signs: Hash) -> (Hash, Person) {
        let next_safety = slh(&format!("{}/chain/{}", p.name, p.position + 1), p.gen, p.scheme);
        let payload = Payload::ChainSignature(ChainSignature {
            prev: p.tip,
            position: p.position + 1,
            safety: commit(&next_safety),
            signs,
        });
        let inside = self.inside(16, &payload);
        let safety = p.safety.clone();
        let a = self.seal(&inside, Some(p.id), None, |id| safety.sign(id, None));
        let id = self.add(&a);
        let mut q = p.clone();
        q.safety = next_safety;
        q.tip = id;
        q.position += 1;
        (id, q)
    }

    /// Rotate and hold the rotation.
    pub fn rotate(&mut self, p: &Person, r: Rot) -> (Hash, Person) {
        let (a, q) = self.rotation(p, r);
        (self.add(&a), q)
    }

    /// An everyday act of `p`, next in its sequence. Not held yet.
    #[allow(clippy::too_many_arguments)]
    pub fn everyday_act(
        &mut self,
        p: &mut Person,
        spec: Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
        acks: Option<Vec<Hash>>,
    ) -> Act {
        self.everyday_act_refs(p, spec, type_, payload, objects, acks, None)
    }

    /// An everyday act of `p` naming other acts in `refs` (an act under a
    /// grant names the grant). Not held yet.
    #[allow(clippy::too_many_arguments)]
    pub fn everyday_act_refs(
        &mut self,
        p: &mut Person,
        spec: Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
        acks: Option<Vec<Hash>>,
        refs: Option<Vec<act::Ref>>,
    ) -> Act {
        let salt = self.fresh().2;
        let objects = cited(p, &spec, type_, objects);
        let inside = Inside {
            spec,
            type_,
            prev: Some(p.seq.last().map(|x| vec![*x]).unwrap_or_default()),
            objects,
            payload,
            position: Some(p.seq.len() as u64 + 1),
            summary: Some(if p.seq.is_empty() {
                ZERO_HASH
            } else {
                Mmr::from_ids(&p.seq).root()
            }),
            acks,
            refs,
            hint: None,
            salt,
        };
        let sign = p.sign.clone();
        let a = self.seal(&inside, Some(p.id), Some(p.binding), |id| {
            sign.sign(id, &[0; 32])
        });
        p.seq.push(a.id());
        a
    }

    /// An everyday act of `p`, private, addressed to `to` (Envelope): held
    /// with its content key, as a recipient holds it.
    #[allow(clippy::too_many_arguments)]
    pub fn private_act(
        &mut self,
        p: &mut Person,
        spec: Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
        to: Vec<Hash>,
    ) -> Hash {
        let salt = self.fresh().2;
        let objects = cited(p, &spec, type_, objects);
        let inside = Inside {
            spec,
            type_,
            prev: Some(p.seq.last().map(|x| vec![*x]).unwrap_or_default()),
            objects,
            payload,
            position: Some(p.seq.len() as u64 + 1),
            summary: Some(if p.seq.is_empty() {
                ZERO_HASH
            } else {
                Mmr::from_ids(&p.seq).root()
            }),
            acks: None,
            refs: None,
            hint: None,
            salt,
        };
        let (key, nonce, _) = self.fresh();
        let sign = p.sign.clone();
        let a = act::make(
            &inside,
            &key,
            &nonce,
            &Addressing {
                signer: Some(p.id),
                binding: Some(p.binding),
                public: false,
                to: Some(to),
            },
            |id| sign.sign(id, &[0; 32]),
        );
        p.seq.push(a.id());
        self.log.push((a.clone(), Some(key)));
        self.v.add_with_key(a, Some(&key)).unwrap()
    }

    /// An Identity everyday act, held.
    pub fn act(&mut self, p: &mut Person, payload: Payload, objects: Option<Vec<Object>>) -> Hash {
        let a = self.everyday_act(
            p,
            identity_spec(),
            payload.type_(),
            payload.to_map(),
            objects,
            None,
        );
        self.add(&a)
    }

    /// A post (an act of some other specification), held.
    pub fn post(&mut self, p: &mut Person, text: &str) -> Hash {
        let a = self.everyday_act(
            p,
            sha256(b"a text specification"),
            0,
            vec![(Value::Uint(0), Value::Text(text.into()))],
            None,
            None,
        );
        self.add(&a)
    }

    /// A witness act acknowledging `acked` (Identity type 15, F110), held:
    /// the one way to acknowledge a post or a message.
    pub fn ack(&mut self, p: &mut Person, acked: Hash) -> Hash {
        let a = self.everyday_act(
            p,
            identity_spec(),
            mor_core::identity::types::WITNESS,
            vec![],
            None,
            Some(vec![acked]),
        );
        self.add(&a)
    }

    /// A post-like act of another specification carrying `acks`, as a
    /// reaction module might make it: invalid since F110. Held.
    pub fn like(&mut self, p: &mut Person, spec: Hash, acked: Hash) -> Hash {
        let a = self.everyday_act(p, spec, 0, vec![], None, Some(vec![acked]));
        self.add(&a)
    }

    /// A receipt by operator `op` for an identity-chain act, held.
    pub fn receipt(&mut self, op: &mut Person, identity: &Hash, act: &Hash, position: u64) -> Hash {
        let r = Payload::Receipt(Receipt {
            identity: *identity,
            act: *act,
            position,
            log_position: op.log.len() as u64,
        });
        let id = self.act(op, r, None);
        op.log.push(id);
        id
    }

    /// A log summary over the operator's whole log, held, with an
    /// inclusion proof for every receipt in it.
    pub fn log_summary(&mut self, op: &mut Person) -> Hash {
        let log = op.log.clone();
        let s = Payload::LogSummary(LogSummary {
            size: log.len() as u64,
            root: merkle::root(&log),
            prev: op.last_summary,
        });
        let sid = self.act(op, s, None);
        op.last_summary = Some(sid);
        for i in 0..log.len() {
            self.v
                .add_inclusion_proof(sid, i as u64, merkle::inclusion_proof(&log, i));
        }
        sid
    }

    /// A cosignature of a log summary by an auditor, held.
    pub fn cosign(&mut self, auditor: &mut Person, summary: &Hash, operator: &Hash) -> Hash {
        let objects = vec![Object {
            chain: *operator,
            predecessor: *summary,
        }];
        self.act(auditor, Payload::Cosignature, Some(objects))
    }

    fn naming(identity: &Hash, rotation: &Hash) -> Option<Vec<Object>> {
        Some(vec![Object {
            chain: *identity,
            predecessor: *rotation,
        }])
    }

    /// An objection by an old home's operator to a homeless rotation, held.
    pub fn object(&mut self, op: &mut Person, identity: &Hash, rotation: &Hash) -> Hash {
        let p = Payload::Objection(Objection {
            identity: *identity,
        });
        self.act(op, p, Self::naming(identity, rotation))
    }

    /// An auditor's absence statement, held.
    pub fn absent(
        &mut self,
        auditor: &mut Person,
        operator: &Hash,
        identity: &Hash,
        rotation: &Hash,
    ) -> Hash {
        let p = Payload::Absence(Absence {
            operator: *operator,
            last_summary: None,
        });
        self.act(auditor, p, Self::naming(identity, rotation))
    }

    /// An escape endorsement by the owner, with the signing key bound just
    /// before the homeless rotation, held.
    pub fn endorse(
        &mut self,
        owner: &mut Person,
        rotation: &Hash,
        abandoned: Option<Vec<Hash>>,
    ) -> Hash {
        let p = Payload::Endorsement(Endorsement { abandoned });
        let id = owner.id;
        self.act(owner, p, Self::naming(&id, rotation))
    }
}
