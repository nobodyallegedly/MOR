//! The online device's side of the Module: build a genesis from a commitment
//! export, prepare a pending rotation, and check the signed rotation that
//! comes back before publishing it. The genesis client (roadmap step 5)
//! calls these through WebAssembly; the tests call them directly.

use crate::msg::{kind, CommitmentExport, Message, MsgError, PendingRotation, SignedRotation};
use crate::summary::fingerprint;
use mor_core::act::{self, Act, Addressing, Inside};
use mor_core::cbor::{self, Value};
use mor_core::hash::Hash;
use mor_core::identity::{self, Genesis, Home, HomeRule, Payload, Rotation, SigningKey};
use mor_core::sig::{self, SchnorrKey, Verdict};
use rand_core::{CryptoRng, RngCore};
use std::fmt;

/// Why the online device rejects what came back.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Rejection {
    Message(MsgError),
    /// Not a rotation act, or not the rotation that was asked for.
    NotAsked(String),
    /// The signature, or the revealed key, does not check.
    Signature(&'static str),
}

impl fmt::Display for Rejection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Rejection::Message(e) => write!(f, "{e}"),
            Rejection::NotAsked(e) => write!(f, "not the rotation that was asked for: {e}"),
            Rejection::Signature(e) => write!(f, "{e}"),
        }
    }
}

impl std::error::Error for Rejection {}

impl From<MsgError> for Rejection {
    fn from(e: MsgError) -> Self {
        Rejection::Message(e)
    }
}

fn random<const N: usize>(rng: &mut (impl RngCore + CryptoRng)) -> [u8; N] {
    let mut b = [0u8; N];
    rng.fill_bytes(&mut b);
    b
}

/// What a genesis declares besides its keys.
#[derive(Clone, Debug, Default)]
pub struct GenesisPlan {
    pub homes: Vec<Home>,
    pub rule: Option<HomeRule>,
    pub declarations: Option<Vec<identity::Declaration>>,
    pub audit: Option<identity::Audit>,
}

/// A genesis committing to the exported safety key, signed by the first
/// signing key. Refuses an export for any key but the first.
pub fn genesis(
    identity_spec: Hash,
    export: &[u8],
    signing: &SchnorrKey,
    plan: GenesisPlan,
    rng: &mut (impl RngCore + CryptoRng),
) -> Result<Act, Rejection> {
    let Message::CommitmentExport(CommitmentExport { safety, index }) =
        Message::decode_kind(export, kind::COMMITMENT_EXPORT)?
    else {
        unreachable!()
    };
    if index != 0 {
        return Err(Rejection::NotAsked("a genesis commits to key 0".into()));
    }
    let g = Payload::Genesis(Genesis {
        signing_key: SigningKey {
            scheme: sig::SCHNORR,
            key: signing.public().to_vec(),
        },
        safety,
        homes: plan.homes,
        rule: plan.rule,
        declarations: plan.declarations,
        audit: plan.audit,
    });
    let inside = Inside {
        spec: identity_spec,
        type_: identity::types::GENESIS,
        prev: None,
        objects: None,
        payload: g.to_map(),
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: random(rng),
    };
    let aux: [u8; 32] = random(rng);
    Ok(act::make(
        &inside,
        &random(rng),
        &random(rng),
        &Addressing {
            public: true,
            ..Default::default()
        },
        |id| signing.sign(id, &aux),
    ))
}

/// The rotation inside the online device sends: spec, type 1 and the
/// payload without key 3 (the next safety commitment), and no salt.
fn stripped_inside(identity_spec: &Hash, r: &Rotation) -> Vec<u8> {
    let mut payload = Payload::Rotation(r.clone()).to_map();
    payload.retain(|(k, _)| k != &Value::Uint(3));
    cbor::encode(&Value::Map(vec![
        (Value::Uint(0), Value::Bytes(identity_spec.to_vec())),
        (Value::Uint(1), Value::Uint(identity::types::ROTATION)),
        (Value::Uint(4), Value::Map(payload)),
    ]))
}

/// 2.2: a pending rotation after `prev`. The `safety` field of `r` is
/// ignored: the offline device supplies it.
pub fn pending(
    identity_spec: &Hash,
    prev: &Act,
    r: &Rotation,
    context: Option<Vec<String>>,
    escape: bool,
) -> Message {
    Message::PendingRotation(PendingRotation {
        inside: stripped_inside(identity_spec, r),
        prev: prev.encode(),
        index: r.position - 1,
        context: context.map(|c| c.into_iter().map(String::into_bytes).collect()),
        escape: escape.then_some(true),
    })
}

/// A signed rotation, checked against the pending rotation it answers.
#[derive(Clone)]
pub struct Accepted {
    pub act: Act,
    pub rotation: Rotation,
    /// Clean-device mode: the new signing key, to load and back up.
    pub signing_key: Option<SchnorrKey>,
}

/// Check what came back before publishing it: it must be the rotation that
/// was asked for, with only the next safety commitment filled in (and, in
/// clean-device mode, the new signing key, whose secret must come with it),
/// signed by the key the previous act committed to.
pub fn accept(
    identity_spec: &Hash,
    pending_msg: &[u8],
    signed: &[u8],
) -> Result<Accepted, Rejection> {
    let Message::PendingRotation(p) = Message::decode_kind(pending_msg, kind::PENDING_ROTATION)?
    else {
        unreachable!()
    };
    let Message::SignedRotation(SignedRotation {
        act,
        signing_secret,
    }) = Message::decode_kind(signed, kind::SIGNED_ROTATION)?
    else {
        unreachable!()
    };
    let na = |e: &str| Rejection::NotAsked(e.to_string());
    let a = Act::decode(&act).map_err(|e| na(&format!("{e:?}")))?;
    let inside = a.open(None).map_err(|e| na(&format!("{e:?}")))?;
    let prev = Act::decode(&p.prev).map_err(|e| na(&format!("{e:?}")))?;
    let prev_inside = prev.open(None).map_err(|e| na(&format!("{e:?}")))?;
    let (identity, commit) = match Payload::decode(prev_inside.type_, &prev_inside.payload) {
        Ok(Payload::Genesis(g)) => (prev.id(), g.safety),
        Ok(Payload::Rotation(r)) => (
            prev.outside.signer.ok_or_else(|| na("previous act"))?,
            r.safety,
        ),
        _ => return Err(na("the previous act is not an identity-chain act")),
    };
    if inside.spec != *identity_spec || inside.type_ != identity::types::ROTATION {
        return Err(na("not a rotation"));
    }
    if a.outside.signer != Some(identity) {
        return Err(na("signed for another identity"));
    }
    let Ok(Payload::Rotation(r)) = Payload::decode(1, &inside.payload) else {
        return Err(na("the rotation payload does not decode"));
    };
    identity::check_rotation_shape(&a, &inside, &r).map_err(|e| na(&e.to_string()))?;

    // Everything but key 3 (and key 2 in clean-device mode) is as asked.
    let Ok(Value::Map(asked_inside)) = cbor::decode(&p.inside) else {
        return Err(na("the pending inside"));
    };
    let asked = asked_inside
        .iter()
        .find(|(k, _)| k == &Value::Uint(4))
        .and_then(|(_, v)| match v {
            Value::Map(m) => Some(m.clone()),
            _ => None,
        })
        .ok_or_else(|| na("the pending inside"))?;
    let except: &[u64] = if signing_secret.is_some() {
        &[2, 3]
    } else {
        &[3]
    };
    let keep = |m: &[(Value, Value)]| -> Vec<(Value, Value)> {
        let mut m: Vec<_> = m
            .iter()
            .filter(|(k, _)| !matches!(k, Value::Uint(n) if except.contains(n)))
            .cloned()
            .collect();
        m.sort_by_key(|(k, _)| cbor::encode(k));
        m
    };
    if keep(&asked) != keep(&inside.payload) {
        return Err(na("a field differs from the pending rotation"));
    }
    let key = match signing_secret {
        None => None,
        Some(s) => {
            let k = SchnorrKey::from_secret(&s)
                .ok_or_else(|| na("the new signing secret is not a key"))?;
            if r.signing_key.scheme != sig::SCHNORR || r.signing_key.key != k.public() {
                return Err(na(
                    "the new signing secret does not match the key in the rotation",
                ));
            }
            Some(k)
        }
    };

    if sig::verify(&a.signature, &a.id()) != Verdict::Valid {
        return Err(Rejection::Signature(
            "the rotation's signature is not valid",
        ));
    }
    if sig::safety_commitment(&a.signature.scheme, &a.signature.key) != commit.commit
        || a.signature.scheme != commit.scheme
    {
        return Err(Rejection::Signature(
            "the revealed safety key is not the one the previous act committed to",
        ));
    }
    Ok(Accepted {
        act: a,
        rotation: r,
        signing_key: key,
    })
}

/// The fingerprint the online device shows for the signing key it put into
/// the pending rotation, to compare with the offline screen (section 4).
pub fn signing_fingerprint(k: &SchnorrKey) -> String {
    fingerprint(&sig::SCHNORR, &k.public())
}
