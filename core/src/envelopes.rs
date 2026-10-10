//! The Envelopes MIP's encryption keys, key deliveries and sealed containers
//! (Envelopes draft 6, "Encryption keys and key delivery", "Sealed
//! containers"; F98, F99).
//!
//! In plain words:
//!
//! - An identity publishes an **encryption key** (type 4): an X-Wing public
//!   key, in a numbered chain like its routes, signed with its signing key.
//! - Anything private travels in a **sealed container**: the act, and the
//!   key that opens it, locked with X-Wing to each recipient's encryption
//!   key, or to a bare key the recipient handed out. The container is signed
//!   by a one-time key that belongs to nobody, so relays see the recipients
//!   and the size, never the sender.
//! - A **key delivery** (type 1) is an act saying "the key of act X is K"
//!   (or "the key of the media X publishes is K"). Sent privately, it
//!   travels in a sealed container; published openly, addressed to no one,
//!   it makes X public.
//!
//! Precisely: the formats below, strict both ways (closed maps, exact
//! lengths). As everywhere in this library, randomness is the caller's.

use crate::act::{Act, ActError, Inside, Scheme, Signature};
use crate::cbor::{self, Value};
use crate::hash::{tagged_hash, tagged_hash_parts, Hash};
use crate::lock::{self, ContentKey, Nonce};
use crate::sig::{self, SchnorrKey, Verdict};
use crate::xwing::{self, XWingError};
use std::fmt;

pub mod anchoring;

/// The types this MIP defines (Envelopes, "Types defined by this MIP").
pub mod types {
    pub const PUBLICATION: u64 = 0;
    pub const KEY_DELIVERY: u64 = 1;
    pub const COMMITMENT: u64 = 2;
    pub const WITHDRAWAL: u64 = 3;
    pub const ENCRYPTION_KEY: u64 = 4;
}

/// Key-exchange schemes, in the scheme number space Identity defines
/// (1 to 3 are signature schemes).
pub const XWING: Scheme = Scheme::Founding(4);

pub mod tag {
    /// The sealed container's one-time signature: over `[to, one-time-key, locked-act]`.
    pub const SEALED: &str = "MOR/sealed";
    /// The key that locks a container key to one recipient: over the X-Wing shared secret.
    pub const WRAP: &str = "MOR/sealed/wrap";
}

/// Why an Envelopes object is refused.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EnvError {
    /// Not in the format's shape. Names the field.
    Shape(&'static str),
    Cbor(cbor::CborError),
    /// An encryption key under a scheme this client does not implement.
    UnknownScheme,
    XWing(XWingError),
    /// The container's one-time signature is not valid.
    Signature,
    /// None of the given private keys opens the container.
    NotForUs,
    /// The inner act is broken, or its key does not open it.
    Act(ActError),
    /// The inner act and the container disagree on who it is for (rule 10).
    Addressing(&'static str),
}

impl fmt::Display for EnvError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EnvError::Shape(w) => write!(f, "not in the Envelopes' shape: {w}"),
            EnvError::Cbor(e) => write!(f, "not deterministic CBOR: {e}"),
            EnvError::UnknownScheme => f.write_str("an encryption key under an unknown scheme"),
            EnvError::XWing(e) => write!(f, "{e}"),
            EnvError::Signature => f.write_str("the sealed container's signature is not valid"),
            EnvError::NotForUs => f.write_str("the sealed container does not open with these keys"),
            EnvError::Act(e) => write!(f, "the inner act: {e}"),
            EnvError::Addressing(w) => write!(f, "addressing: {w}"),
        }
    }
}

impl std::error::Error for EnvError {}

impl From<cbor::CborError> for EnvError {
    fn from(e: cbor::CborError) -> Self {
        EnvError::Cbor(e)
    }
}

impl From<XWingError> for EnvError {
    fn from(e: XWingError) -> Self {
        EnvError::XWing(e)
    }
}

impl From<ActError> for EnvError {
    fn from(e: ActError) -> Self {
        EnvError::Act(e)
    }
}

type R<T> = Result<T, EnvError>;

// ---------------------------------------------------------------- small readers

fn map_fields<'a>(
    p: &'a [(Value, Value)],
    allowed: &[u64],
    w: &'static str,
) -> R<Vec<(u64, &'a Value)>> {
    let mut out = Vec::new();
    for (k, v) in p {
        match k {
            Value::Uint(n) if allowed.contains(n) => out.push((*n, v)),
            _ => return Err(EnvError::Shape(w)),
        }
    }
    Ok(out)
}

fn get<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

fn hash(v: &Value, w: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| EnvError::Shape(w)),
        _ => Err(EnvError::Shape(w)),
    }
}

fn bytes<'a>(v: &'a Value, w: &'static str) -> R<&'a [u8]> {
    match v {
        Value::Bytes(b) => Ok(b),
        _ => Err(EnvError::Shape(w)),
    }
}

fn uint(v: &Value, w: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(EnvError::Shape(w)),
    }
}

fn array<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) => Ok(a),
        _ => Err(EnvError::Shape(w)),
    }
}

fn b(x: &[u8]) -> Value {
    Value::Bytes(x.to_vec())
}

fn scheme_value(s: &Scheme) -> Value {
    match s {
        Scheme::Founding(n) => Value::Uint(*n as u64),
        Scheme::Spec(h) => b(h),
    }
}

// ---------------------------------------------------------------- keys

/// `enc-key = [ scheme, key: bstr ]`: an encryption key, or a bare key a
/// recipient supplies (Identity's `[scheme, key]` form).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EncKey {
    pub scheme: Scheme,
    pub key: Vec<u8>,
}

impl EncKey {
    pub fn xwing(public: Vec<u8>) -> Self {
        EncKey {
            scheme: XWING,
            key: public,
        }
    }

    pub fn to_value(&self) -> Value {
        Value::Array(vec![scheme_value(&self.scheme), b(&self.key)])
    }

    /// Decode, and check the length for a scheme this library implements.
    /// A founding number other than 4 is not a key-exchange scheme; a
    /// specification hash is allowed, and unknown to this library.
    pub fn from_value(v: &Value) -> R<Self> {
        let a = array(v, "enc-key")?;
        if a.len() != 2 {
            return Err(EnvError::Shape("enc-key"));
        }
        let scheme = match &a[0] {
            Value::Uint(4) => XWING,
            Value::Bytes(_) => Scheme::Spec(hash(&a[0], "enc-key scheme")?),
            _ => return Err(EnvError::Shape("enc-key scheme")),
        };
        let key = bytes(&a[1], "enc-key key")?.to_vec();
        if scheme == XWING && key.len() != xwing::PUBLIC_LEN {
            return Err(EnvError::Shape("enc-key: an X-Wing key is 1216 bytes"));
        }
        Ok(EncKey { scheme, key })
    }

    /// The pickup tag of this key as a bare key (relay transport cMIP).
    pub fn pickup_tag(&self) -> Hash {
        tagged_hash_parts(
            "MOR/transport/pickup",
            &[&sig::scheme_bytes(&self.scheme), &self.key],
        )
    }
}

/// An X-Wing private key and its public key.
#[derive(Clone)]
pub struct DecKey {
    pub secret: xwing::SecretKey,
    pub public: EncKey,
}

impl DecKey {
    pub fn from_secret(secret: xwing::SecretKey) -> Self {
        DecKey {
            public: EncKey::xwing(xwing::public_key(&secret)),
            secret,
        }
    }
}

impl fmt::Debug for DecKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("DecKey(..)")
    }
}

// ---------------------------------------------------------------- versioned chains

/// A numbered chain entry, as routes (Identity type 3) and encryption keys
/// (type 4) share: version, and the act it replaces.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Version {
    pub version: u64,
    pub previous: Option<Hash>,
}

fn version_of(f: &[(u64, &Value)], w: &'static str) -> R<Version> {
    let version = uint(get(f, 0).ok_or(EnvError::Shape(w))?, w)?;
    let previous = get(f, 1).map(|v| hash(v, w)).transpose()?;
    // Version 1 names nothing; every later version names the act it replaces.
    if (version == 1) != previous.is_none() || version == 0 {
        return Err(EnvError::Shape(w));
    }
    Ok(Version { version, previous })
}

fn version_fields(v: &Version, m: &mut Vec<(Value, Value)>) {
    m.push((Value::Uint(0), Value::Uint(v.version)));
    if let Some(p) = &v.previous {
        m.push((Value::Uint(1), b(p)));
    }
}

/// Which act of a versioned chain counts (Identity, "Routes"; Envelopes,
/// "Encryption key"): follow the chain from version 1, each act naming the
/// one before and carrying its version plus one. The latest act of an
/// unbroken, unforked chain counts. Where two acts name the same
/// predecessor, the chain is contested from there: the last act before the
/// fork counts, and `contested` says so.
///
/// `acts` are the chain's acts that the caller found valid (a disputed or
/// void act never counts: Identity, "Declarations, succession, routes...").
/// A fork whose other branch a later rotation voided is therefore settled.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Latest {
    pub act: Option<Hash>,
    pub contested: bool,
}

pub fn latest(acts: &[(Hash, Version)]) -> Latest {
    let mut current: Option<(Hash, u64)> = None;
    loop {
        let next: Vec<&(Hash, Version)> = acts
            .iter()
            .filter(|(_, v)| match current {
                None => v.version == 1 && v.previous.is_none(),
                Some((id, n)) => v.previous == Some(id) && v.version == n + 1,
            })
            .collect();
        match next.len() {
            0 => {
                return Latest {
                    act: current.map(|c| c.0),
                    contested: false,
                }
            }
            1 => current = Some((next[0].0, next[0].1.version)),
            _ => {
                return Latest {
                    act: current.map(|c| c.0),
                    contested: true,
                }
            }
        }
    }
}

// ---------------------------------------------------------------- routes (Identity type 3)

/// `route = [ scope: hash / null, hints: [+ tstr], ? kind: 0 / 1 ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Route {
    pub scope: Option<Hash>,
    pub hints: Vec<String>,
    /// 0 outbox (the default, written as absent), 1 inbox.
    pub kind: u64,
}

/// The routes payload (Identity type 3).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Routes {
    pub version: Version,
    pub routes: Vec<Route>,
}

impl Routes {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = Vec::new();
        version_fields(&self.version, &mut m);
        let routes = self
            .routes
            .iter()
            .map(|r| {
                let mut a = vec![
                    r.scope.map(|h| b(&h)).unwrap_or(Value::Null),
                    Value::Array(r.hints.iter().map(|h| Value::Text(h.clone())).collect()),
                ];
                if r.kind != 0 {
                    a.push(Value::Uint(r.kind));
                }
                Value::Array(a)
            })
            .collect();
        m.push((Value::Uint(2), Value::Array(routes)));
        m
    }

    pub fn decode(p: &[(Value, Value)]) -> R<Self> {
        let f = map_fields(p, &[0, 1, 2], "routes")?;
        let version = version_of(&f, "routes version")?;
        let routes = array(get(&f, 2).ok_or(EnvError::Shape("routes 2"))?, "routes 2")?
            .iter()
            .map(|r| {
                let a = array(r, "route")?;
                if !(2..=3).contains(&a.len()) {
                    return Err(EnvError::Shape("route"));
                }
                let scope = match &a[0] {
                    Value::Null => None,
                    v => Some(hash(v, "route scope")?),
                };
                let hints = array(&a[1], "route hints")?;
                if hints.is_empty() {
                    return Err(EnvError::Shape("route hints"));
                }
                let hints = hints
                    .iter()
                    .map(|h| match h {
                        Value::Text(t) => Ok(t.clone()),
                        _ => Err(EnvError::Shape("route hint")),
                    })
                    .collect::<R<Vec<_>>>()?;
                // The default kind is written as absent, so each route has one encoding.
                let kind = match a.get(2) {
                    None => 0,
                    Some(Value::Uint(1)) => 1,
                    _ => return Err(EnvError::Shape("route kind")),
                };
                Ok(Route { scope, hints, kind })
            })
            .collect::<R<Vec<_>>>()?;
        Ok(Routes { version, routes })
    }

    /// The inbox for acts of `spec`: the inbox route with that scope, or
    /// else the one with a null scope (relay transport cMIP, "Delivering").
    pub fn inbox(&self, spec: &Hash) -> Option<&Route> {
        let inboxes = || self.routes.iter().filter(|r| r.kind == 1);
        inboxes()
            .find(|r| r.scope.as_ref() == Some(spec))
            .or_else(|| inboxes().find(|r| r.scope.is_none()))
    }
}

// ---------------------------------------------------------------- encryption key (type 4)

/// The encryption-key payload (Envelopes type 4):
/// `{ 0 => uint, ? 1 => hash, 2 => enc-key }`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EncryptionKey {
    pub version: Version,
    pub key: EncKey,
}

impl EncryptionKey {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = Vec::new();
        version_fields(&self.version, &mut m);
        m.push((Value::Uint(2), self.key.to_value()));
        m
    }

    pub fn decode(p: &[(Value, Value)]) -> R<Self> {
        let f = map_fields(p, &[0, 1, 2], "encryption key")?;
        Ok(EncryptionKey {
            version: version_of(&f, "encryption key version")?,
            key: EncKey::from_value(get(&f, 2).ok_or(EnvError::Shape("encryption key 2"))?)?,
        })
    }
}

// ---------------------------------------------------------------- key delivery (type 1)

/// The key-delivery payload (Envelopes type 1):
/// `{ 0 => hash, 1 => bstr .size 32, ? 2 => true }`: the act whose content
/// key this is, the key, and, when present, that it is the key of the media
/// that act (a publication) describes rather than of the act itself.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KeyDelivery {
    pub target: Hash,
    pub key: ContentKey,
    pub media: bool,
}

impl KeyDelivery {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.target)),
            (Value::Uint(1), b(&self.key)),
        ];
        if self.media {
            m.push((Value::Uint(2), Value::Bool(true)));
        }
        m
    }

    pub fn decode(p: &[(Value, Value)]) -> R<Self> {
        let f = map_fields(p, &[0, 1, 2], "key delivery")?;
        let target = hash(
            get(&f, 0).ok_or(EnvError::Shape("key delivery 0"))?,
            "key delivery 0",
        )?;
        let key = hash(
            get(&f, 1).ok_or(EnvError::Shape("key delivery 1"))?,
            "key delivery 1",
        )?;
        let media = match get(&f, 2) {
            None => false,
            Some(Value::Bool(true)) => true,
            _ => return Err(EnvError::Shape("key delivery 2")),
        };
        Ok(KeyDelivery { target, key, media })
    }

    /// Check a delivered key against the act it names: it opens it (a
    /// private act of which the recipient holds the locked bytes).
    pub fn opens(&self, act: &Act) -> Result<Inside, ActError> {
        act.open(Some(&self.key))
    }
}

// ---------------------------------------------------------------- sealed containers

/// A recipient of a sealed container: an identity, through its current
/// encryption key, or a bare key (no identity on the outside).
#[derive(Clone, Debug)]
pub enum Recipient {
    Identity { id: Hash, key: EncKey },
    Bare(EncKey),
}

/// A sealed container: `[ to: [* hash], one-time-key: bstr, locked-act: bstr, sig: bstr ]`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Sealed {
    pub to: Vec<Hash>,
    /// A one-time Schnorr key (scheme 1, 32 bytes x-only) belonging to no identity.
    pub one_time_key: [u8; 32],
    /// `locked-act`, encoded: `[ capsules: [+ capsule], nonce, locked ]`.
    pub locked_act: Vec<u8>,
    pub sig: [u8; 64],
}

/// `capsule = [ ct: bstr .size 1120, wrapped: bstr .size 48 ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Capsule {
    pub ct: Vec<u8>,
    pub wrapped: Vec<u8>,
}

/// What a container holds: `contents = [ act: bstr, ? key: bstr .size 32 ]`,
/// the inner act encoded whole, and its content key when it is private.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Contents {
    pub act: Vec<u8>,
    pub key: Option<ContentKey>,
}

/// The randomness sealing needs, one fresh value each.
pub struct SealRandom {
    pub container_key: ContentKey,
    pub nonce: Nonce,
    /// One X-Wing `eseed` per recipient.
    pub eseeds: Vec<[u8; 64]>,
    /// The one-time key's secret, and the signature's auxiliary randomness.
    pub one_time_secret: [u8; 32],
    pub aux: [u8; 32],
}

const ZERO_NONCE: Nonce = [0u8; 24];

fn wrap_key(ss: &[u8; 32]) -> ContentKey {
    tagged_hash(tag::WRAP, ss)
}

fn signed_hash(to: &[Hash], otk: &[u8; 32], locked_act: &[u8]) -> Hash {
    let v = Value::Array(vec![
        Value::Array(to.iter().map(|h| b(h)).collect()),
        b(otk),
        b(locked_act),
    ]);
    tagged_hash(tag::SEALED, &cbor::encode(&v))
}

impl Sealed {
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&Value::Array(vec![
            Value::Array(self.to.iter().map(|h| b(h)).collect()),
            b(&self.one_time_key),
            b(&self.locked_act),
            b(&self.sig),
        ]))
    }

    pub fn decode(data: &[u8]) -> R<Self> {
        let v = cbor::decode(data)?;
        let a = array(&v, "sealed")?;
        if a.len() != 4 {
            return Err(EnvError::Shape(
                "sealed: [to, one-time-key, locked-act, sig]",
            ));
        }
        let to = array(&a[0], "sealed to")?
            .iter()
            .map(|h| hash(h, "sealed to"))
            .collect::<R<Vec<_>>>()?;
        Ok(Sealed {
            to,
            one_time_key: bytes(&a[1], "one-time-key")?
                .try_into()
                .map_err(|_| EnvError::Shape("one-time-key"))?,
            locked_act: bytes(&a[2], "locked-act")?.to_vec(),
            sig: bytes(&a[3], "sealed sig")?
                .try_into()
                .map_err(|_| EnvError::Shape("sealed sig"))?,
        })
    }

    /// Check the one-time signature over `[to, one-time-key, locked-act]`.
    pub fn check_signature(&self) -> R<()> {
        let s = Signature {
            scheme: sig::SCHNORR,
            key: self.one_time_key.to_vec(),
            sig: self.sig.to_vec(),
        };
        match sig::verify(
            &s,
            &signed_hash(&self.to, &self.one_time_key, &self.locked_act),
        ) {
            Verdict::Valid => Ok(()),
            _ => Err(EnvError::Signature),
        }
    }

    /// The parts of `locked-act`.
    pub fn parts(&self) -> R<(Vec<Capsule>, Nonce, Vec<u8>)> {
        let v = cbor::decode(&self.locked_act)?;
        let a = array(&v, "locked-act")?;
        if a.len() != 3 {
            return Err(EnvError::Shape("locked-act: [capsules, nonce, locked]"));
        }
        let capsules = array(&a[0], "capsules")?
            .iter()
            .map(|c| {
                let c = array(c, "capsule")?;
                if c.len() != 2 {
                    return Err(EnvError::Shape("capsule"));
                }
                let ct = bytes(&c[0], "capsule ct")?;
                let wrapped = bytes(&c[1], "capsule wrapped")?;
                if ct.len() != xwing::CIPHERTEXT_LEN || wrapped.len() != 48 {
                    return Err(EnvError::Shape("capsule lengths"));
                }
                Ok(Capsule {
                    ct: ct.to_vec(),
                    wrapped: wrapped.to_vec(),
                })
            })
            .collect::<R<Vec<_>>>()?;
        // One capsule per recipient in `to`; exactly one for a bare key.
        if capsules.len() != self.to.len().max(1) {
            return Err(EnvError::Shape("one capsule per recipient"));
        }
        let nonce: Nonce = bytes(&a[1], "locked-act nonce")?
            .try_into()
            .map_err(|_| EnvError::Shape("locked-act nonce"))?;
        let locked = bytes(&a[2], "locked-act locked")?.to_vec();
        Ok((capsules, nonce, locked))
    }
}

impl Contents {
    pub fn encode(&self) -> Vec<u8> {
        let mut a = vec![b(&self.act)];
        if let Some(k) = &self.key {
            a.push(b(k));
        }
        cbor::encode(&Value::Array(a))
    }

    pub fn decode(bytes_: &[u8]) -> R<Self> {
        let v = cbor::decode(bytes_)?;
        let a = array(&v, "contents")?;
        if !(1..=2).contains(&a.len()) {
            return Err(EnvError::Shape("contents: [act, ? key]"));
        }
        Ok(Contents {
            act: bytes(&a[0], "contents act")?.to_vec(),
            key: a.get(1).map(|k| hash(k, "contents key")).transpose()?,
        })
    }
}

/// Seal an act for its recipients (Envelopes, "Sealed containers"; rule 10).
///
/// `key` is the inner act's content key when it is private. For recipients
/// that are identities, the container's `to` lists them in order, each
/// with a capsule locked to its encryption key; a bare key is the only
/// recipient, with an empty `to`.
pub fn seal(
    act: &Act,
    key: Option<&ContentKey>,
    recipients: &[Recipient],
    rnd: &SealRandom,
) -> R<Sealed> {
    let bare = recipients.iter().any(|r| matches!(r, Recipient::Bare(_)));
    if recipients.is_empty() || (bare && recipients.len() != 1) {
        return Err(EnvError::Addressing(
            "a bare key is the only recipient; otherwise at least one identity",
        ));
    }
    if rnd.eseeds.len() != recipients.len() {
        return Err(EnvError::Addressing("one eseed per recipient"));
    }
    let mut to = Vec::new();
    let mut capsules = Vec::new();
    for (r, eseed) in recipients.iter().zip(&rnd.eseeds) {
        let k = match r {
            Recipient::Identity { id, key } => {
                to.push(*id);
                key
            }
            Recipient::Bare(key) => key,
        };
        if k.scheme != XWING {
            return Err(EnvError::UnknownScheme);
        }
        let (ss, ct) = xwing::encapsulate(&k.key, eseed)?;
        let wrapped = lock::lock(&rnd.container_key, &wrap_key(&ss), &ZERO_NONCE);
        capsules.push(Value::Array(vec![b(&ct), b(&wrapped)]));
    }
    let contents = Contents {
        act: act.encode(),
        key: key.copied(),
    };
    let locked = lock::lock(&contents.encode(), &rnd.container_key, &rnd.nonce);
    let locked_act = cbor::encode(&Value::Array(vec![
        Value::Array(capsules),
        b(&rnd.nonce),
        b(&locked),
    ]));
    let otk = SchnorrKey::from_secret(&rnd.one_time_secret).ok_or(EnvError::Addressing(
        "the one-time secret is not a valid key",
    ))?;
    let one_time_key = otk.public();
    let s = otk.sign(&signed_hash(&to, &one_time_key, &locked_act), &rnd.aux);
    Ok(Sealed {
        to,
        one_time_key,
        locked_act,
        sig: s.sig.try_into().expect("a Schnorr signature is 64 bytes"),
    })
}

/// A sealed container, opened and checked.
#[derive(Clone, Debug)]
pub struct Opened {
    pub act: Act,
    /// Its inside, opened with the key the container carried (or its own,
    /// for a public act) and checked against its outside.
    pub inside: Inside,
    /// The content key the container carried, for a private inner act.
    pub key: Option<ContentKey>,
}

/// Open a sealed container with one private key. `me` is the identity the
/// key belongs to, or `None` for a bare key.
///
/// Checks: the one-time signature; the capsule for this recipient (its
/// place in `to`, or the single capsule of a bare-key container); the inner
/// act's shape, locked hash and inside commitment; and rule 10's addressing:
/// an inner act sent to an identity names it in its own `to`, an inner act
/// sent to a bare key names no one. The inner act's signature is judged by
/// the caller, like any act's.
pub fn open(sealed: &Sealed, me: Option<&Hash>, dk: &DecKey) -> R<Opened> {
    sealed.check_signature()?;
    let (capsules, nonce, locked) = sealed.parts()?;
    let index = match me {
        Some(id) => sealed
            .to
            .iter()
            .position(|t| t == id)
            .ok_or(EnvError::NotForUs)?,
        None if sealed.to.is_empty() => 0,
        None => return Err(EnvError::NotForUs),
    };
    let c = &capsules[index];
    let ss = xwing::decapsulate(&dk.secret, &c.ct)?;
    let container_key: ContentKey = lock::unlock(&c.wrapped, &wrap_key(&ss), &ZERO_NONCE)
        .map_err(|_| EnvError::NotForUs)?
        .try_into()
        .map_err(|_| EnvError::Shape("wrapped key"))?;
    let plain = lock::unlock(&locked, &container_key, &nonce)
        .map_err(|_| EnvError::Shape("locked contents"))?;
    let contents = Contents::decode(&plain)?;
    let act = Act::decode(&contents.act)?;
    let inside = act.open(contents.key.as_ref())?;
    if act.outside.is_public() && contents.key.is_some() {
        return Err(EnvError::Shape("a key carried for a public act"));
    }
    match me {
        Some(id) if !act.outside.to.as_ref().is_some_and(|t| t.contains(id)) => {
            return Err(EnvError::Addressing(
                "the inner act is not addressed to this recipient",
            ))
        }
        None if act.outside.to.is_some() => {
            return Err(EnvError::Addressing(
                "an act sent to a bare key names no recipient",
            ))
        }
        _ => {}
    }
    Ok(Opened {
        act,
        inside,
        key: contents.key,
    })
}
