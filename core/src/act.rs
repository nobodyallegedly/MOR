//! The act (Envelope, "The act").
//!
//! ```cddl
//! act = [ outside, locked: bstr, signature ]
//! ```
//!
//! This module decodes and encodes acts in exactly the Envelope MIP's shape,
//! computes act ids and inside commitments, seals an inside into an act's
//! outside and locked bytes, opens it again with every check the Envelope
//! requires, and checks an everyday act's place in its sequence.
//!
//! Signatures are carried and decoded here but not verified: that, and every
//! rule that depends on who signed, is part 2 of the core library.

use crate::cbor::{self, CborError, Value};
use crate::hash::{sha256, tag, tagged_hash, Hash, ZERO_HASH};
use crate::lock::{self, ContentKey, Nonce};
use crate::mmr::Mmr;
use crate::text::{self, TextError};
use std::fmt;

/// The salt that makes an inside commitment impossible to guess: 16 random bytes.
pub type Salt = [u8; 16];

/// Why an act, or part of one, was rejected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ActError {
    /// Not deterministic CBOR.
    Cbor(CborError),
    /// Deterministic CBOR, but not in the Envelope's shape: a missing or
    /// unknown field, or a field of the wrong kind. Names the field.
    Shape(&'static str),
    /// A text string that is not canonical text.
    Text(TextError),
    /// The locked bytes do not hash to the outside's locked hash.
    LockedHash,
    /// The content key does not open the locked bytes.
    Unlock,
    /// The opened inside does not match the outside's inside commitment.
    InsideCommitment,
    /// A private act, and no content key was supplied to open it.
    NoKey,
}

impl fmt::Display for ActError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActError::Cbor(e) => write!(f, "not deterministic CBOR: {e}"),
            ActError::Shape(what) => write!(f, "not in the Envelope's shape: {what}"),
            ActError::Text(e) => write!(f, "not canonical text: {e}"),
            ActError::LockedHash => f.write_str("the locked bytes do not match the locked hash"),
            ActError::Unlock => f.write_str("the content key does not open the inside"),
            ActError::InsideCommitment => {
                f.write_str("the inside does not match the inside commitment")
            }
            ActError::NoKey => f.write_str("a private act, and no key to open it"),
        }
    }
}

impl std::error::Error for ActError {}

impl From<CborError> for ActError {
    fn from(e: CborError) -> Self {
        ActError::Cbor(e)
    }
}

impl From<TextError> for ActError {
    fn from(e: TextError) -> Self {
        ActError::Text(e)
    }
}

// ---------------------------------------------------------------- the parts

/// The outside: what every relay can read.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Outside {
    /// 0: the signer's identity hash; absent only in genesis.
    pub signer: Option<Hash>,
    /// 1: the identity-chain act that bound the signing key.
    pub binding: Option<Hash>,
    /// 2: `tagged_hash("MOR/inside", inside)`.
    pub inside_commitment: Hash,
    /// 3: SHA-256 of the locked bytes.
    pub locked_hash: Hash,
    /// 4: the nonce of the lock.
    pub nonce: Nonce,
    /// 5: the content key, on a public act only.
    pub content_key: Option<ContentKey>,
    /// 6: recipients' identity hashes.
    pub to: Option<Vec<Hash>>,
}

/// The inside: everything else, always locked.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Inside {
    /// 0: the specification defining the type, by hash.
    pub spec: Hash,
    /// 1: the type, numbered within that specification.
    pub type_: u64,
    /// 2: the previous act in the signer's sequence (empty for the first).
    pub prev: Option<Vec<Hash>>,
    /// 3: the chains this act belongs to, and the act it follows in each.
    pub objects: Option<Vec<Object>>,
    /// 4: the payload, a map defined by the type.
    pub payload: Vec<(Value, Value)>,
    /// 5: position in the signer's sequence.
    pub position: Option<u64>,
    /// 6: running summary of the signer's sequence up to this act.
    pub summary: Option<Hash>,
    /// 7: acts by other identities this act acknowledges.
    pub acks: Option<Vec<Hash>>,
    /// 8: acts or web resources this act refers to.
    pub refs: Option<Vec<Ref>>,
    /// 9: a hint, never load-bearing.
    pub hint: Option<String>,
    /// 10: random salt.
    pub salt: Salt,
}

/// One entry of `objects`: the chain's root act, and the act in that chain this one follows.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Object {
    pub chain: Hash,
    pub predecessor: Hash,
}

/// A reference: another act by its id, or a web resource.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Ref {
    Act(Hash),
    Web { address: String, hash: Option<Hash> },
}

/// A signature scheme: a founding number (1, 2, 3) or a specification hash.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Scheme {
    /// 1: Schnorr over secp256k1 (BIP-340); 2: SLH-DSA-SHA2-128s; 3: SLH-DSA-SHA2-128f.
    Founding(u8),
    /// A signature-scheme specification, by its spec hash.
    Spec(Hash),
}

/// `[ scheme, key, sig ]`. Decoded, not verified, in part 1.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Signature {
    pub scheme: Scheme,
    pub key: Vec<u8>,
    pub sig: Vec<u8>,
}

/// A whole act.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Act {
    pub outside: Outside,
    pub locked: Vec<u8>,
    pub signature: Signature,
}

// ---------------------------------------------------------------- to CBOR

fn hash_v(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn hashes_v(hs: &[Hash]) -> Value {
    Value::Array(hs.iter().map(hash_v).collect())
}

fn put(m: &mut Vec<(Value, Value)>, k: u64, v: Value) {
    m.push((Value::Uint(k), v));
}

impl Outside {
    pub fn to_value(&self) -> Value {
        let mut m = Vec::new();
        if let Some(s) = &self.signer {
            put(&mut m, 0, hash_v(s));
        }
        if let Some(b) = &self.binding {
            put(&mut m, 1, hash_v(b));
        }
        put(&mut m, 2, hash_v(&self.inside_commitment));
        put(&mut m, 3, hash_v(&self.locked_hash));
        put(&mut m, 4, Value::Bytes(self.nonce.to_vec()));
        if let Some(k) = &self.content_key {
            put(&mut m, 5, Value::Bytes(k.to_vec()));
        }
        if let Some(to) = &self.to {
            put(&mut m, 6, hashes_v(to));
        }
        Value::Map(m)
    }

    /// The deterministic encoding of the outside.
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }

    /// The act id: `tagged_hash("MOR/act", outside)`. What the signature signs.
    pub fn act_id(&self) -> Hash {
        tagged_hash(tag::ACT, &self.encode())
    }

    /// Whether the act is public: its content key travels on its outside.
    pub fn is_public(&self) -> bool {
        self.content_key.is_some()
    }
}

/// Inside key 3, `objects`, as the act encodes it: `[* [chain, predecessor]]`.
/// *Also signed by an anonymous payer's key over its claim (Finance, F147).*
pub fn objects_value(objs: &[Object]) -> Value {
    Value::Array(
        objs.iter()
            .map(|o| Value::Array(vec![hash_v(&o.chain), hash_v(&o.predecessor)]))
            .collect(),
    )
}

/// Inside key 7, `acks`, as the act encodes it.
pub fn acks_value(acks: &[Hash]) -> Value {
    hashes_v(acks)
}

/// Inside key 8, `refs`, as the act encodes it.
pub fn refs_value(refs: &[Ref]) -> Value {
    Value::Array(
        refs.iter()
            .map(|r| match r {
                Ref::Act(h) => hash_v(h),
                Ref::Web { address, hash } => {
                    let mut v = vec![Value::Text(address.clone())];
                    if let Some(h) = hash {
                        v.push(hash_v(h));
                    }
                    Value::Array(v)
                }
            })
            .collect(),
    )
}

impl Inside {
    pub fn to_value(&self) -> Value {
        let mut m = Vec::new();
        put(&mut m, 0, hash_v(&self.spec));
        put(&mut m, 1, Value::Uint(self.type_));
        if let Some(p) = &self.prev {
            put(&mut m, 2, hashes_v(p));
        }
        if let Some(objs) = &self.objects {
            put(&mut m, 3, objects_value(objs));
        }
        put(&mut m, 4, Value::Map(self.payload.clone()));
        if let Some(p) = self.position {
            put(&mut m, 5, Value::Uint(p));
        }
        if let Some(s) = &self.summary {
            put(&mut m, 6, hash_v(s));
        }
        if let Some(a) = &self.acks {
            put(&mut m, 7, acks_value(a));
        }
        if let Some(refs) = &self.refs {
            put(&mut m, 8, refs_value(refs));
        }
        if let Some(h) = &self.hint {
            put(&mut m, 9, Value::Text(h.clone()));
        }
        put(&mut m, 10, Value::Bytes(self.salt.to_vec()));
        Value::Map(m)
    }

    /// The deterministic encoding of the inside: what gets locked.
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }

    /// The inside commitment: `tagged_hash("MOR/inside", inside)`.
    pub fn commitment(&self) -> Hash {
        tagged_hash(tag::INSIDE, &self.encode())
    }
}

impl Signature {
    pub fn to_value(&self) -> Value {
        let scheme = match &self.scheme {
            Scheme::Founding(n) => Value::Uint(*n as u64),
            Scheme::Spec(h) => hash_v(h),
        };
        Value::Array(vec![
            scheme,
            Value::Bytes(self.key.clone()),
            Value::Bytes(self.sig.clone()),
        ])
    }
}

impl Act {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            self.outside.to_value(),
            Value::Bytes(self.locked.clone()),
            self.signature.to_value(),
        ])
    }

    /// The deterministic encoding of the whole act.
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }

    /// The act id.
    pub fn id(&self) -> Hash {
        self.outside.act_id()
    }
}

// ---------------------------------------------------------------- from CBOR

type R<T> = Result<T, ActError>;

fn as_hash(v: &Value, what: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| ActError::Shape(what)),
        _ => Err(ActError::Shape(what)),
    }
}

fn as_fixed<const N: usize>(v: &Value, what: &'static str) -> R<[u8; N]> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| ActError::Shape(what)),
        _ => Err(ActError::Shape(what)),
    }
}

fn as_uint(v: &Value, what: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(ActError::Shape(what)),
    }
}

fn as_array<'a>(v: &'a Value, what: &'static str, non_empty: bool) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if !(non_empty && a.is_empty()) => Ok(a),
        _ => Err(ActError::Shape(what)),
    }
}

fn as_hashes(v: &Value, what: &'static str, non_empty: bool) -> R<Vec<Hash>> {
    as_array(v, what, non_empty)?
        .iter()
        .map(|x| as_hash(x, what))
        .collect()
}

/// The entries of a map whose keys must all be small unsigned integers from
/// `allowed`. An unknown key makes the act invalid (Envelope rule 1).
fn int_map<'a>(v: &'a Value, allowed: u64, what: &'static str) -> R<Vec<(u64, &'a Value)>> {
    let Value::Map(entries) = v else {
        return Err(ActError::Shape(what));
    };
    entries
        .iter()
        .map(|(k, v)| match k {
            Value::Uint(n) if *n < allowed => Ok((*n, v)),
            _ => Err(ActError::Shape(what)),
        })
        .collect()
}

fn field<'a>(m: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    m.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

impl Outside {
    pub fn from_value(v: &Value) -> R<Self> {
        let m = int_map(v, 7, "outside: unknown or non-integer key")?;
        let req = |k, what| field(&m, k).ok_or(ActError::Shape(what));
        Ok(Outside {
            signer: field(&m, 0)
                .map(|x| as_hash(x, "outside 0: signer"))
                .transpose()?,
            binding: field(&m, 1)
                .map(|x| as_hash(x, "outside 1: binding"))
                .transpose()?,
            inside_commitment: as_hash(
                req(2, "outside 2: inside commitment missing")?,
                "outside 2: inside commitment",
            )?,
            locked_hash: as_hash(
                req(3, "outside 3: locked hash missing")?,
                "outside 3: locked hash",
            )?,
            nonce: as_fixed(req(4, "outside 4: nonce missing")?, "outside 4: nonce")?,
            content_key: field(&m, 5)
                .map(|x| as_fixed(x, "outside 5: content key"))
                .transpose()?,
            to: field(&m, 6)
                .map(|x| as_hashes(x, "outside 6: to", true))
                .transpose()?,
        })
    }
}

impl Inside {
    pub fn from_value(v: &Value) -> R<Self> {
        let m = int_map(v, 11, "inside: unknown or non-integer key")?;
        let req = |k, what| field(&m, k).ok_or(ActError::Shape(what));
        let objects = field(&m, 3)
            .map(|x| {
                as_array(x, "inside 3: objects", true)?
                    .iter()
                    .map(|o| {
                        let pair = as_array(o, "inside 3: object", true)?;
                        if pair.len() != 2 {
                            return Err(ActError::Shape("inside 3: object"));
                        }
                        Ok(Object {
                            chain: as_hash(&pair[0], "inside 3: object chain")?,
                            predecessor: as_hash(&pair[1], "inside 3: object predecessor")?,
                        })
                    })
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?;
        let refs = field(&m, 8)
            .map(|x| {
                as_array(x, "inside 8: refs", true)?
                    .iter()
                    .map(|r| match r {
                        Value::Bytes(_) => Ok(Ref::Act(as_hash(r, "inside 8: ref")?)),
                        Value::Array(a) if a.len() == 1 || a.len() == 2 => {
                            let Value::Text(address) = &a[0] else {
                                return Err(ActError::Shape("inside 8: web ref address"));
                            };
                            let hash = a
                                .get(1)
                                .map(|h| as_hash(h, "inside 8: web ref hash"))
                                .transpose()?;
                            Ok(Ref::Web {
                                address: address.clone(),
                                hash,
                            })
                        }
                        _ => Err(ActError::Shape("inside 8: ref")),
                    })
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?;
        let payload = match req(4, "inside 4: payload missing")? {
            Value::Map(entries) => entries.clone(),
            _ => return Err(ActError::Shape("inside 4: payload")),
        };
        let hint = match field(&m, 9) {
            None => None,
            Some(Value::Text(s)) => Some(s.clone()),
            Some(_) => return Err(ActError::Shape("inside 9: hint")),
        };
        Ok(Inside {
            spec: as_hash(req(0, "inside 0: spec missing")?, "inside 0: spec")?,
            type_: as_uint(req(1, "inside 1: type missing")?, "inside 1: type")?,
            prev: field(&m, 2)
                .map(|x| as_hashes(x, "inside 2: prev", false))
                .transpose()?,
            objects,
            payload,
            position: field(&m, 5)
                .map(|x| as_uint(x, "inside 5: position"))
                .transpose()?,
            summary: field(&m, 6)
                .map(|x| as_hash(x, "inside 6: summary"))
                .transpose()?,
            acks: field(&m, 7)
                .map(|x| as_hashes(x, "inside 7: acks", true))
                .transpose()?,
            refs,
            hint,
            salt: as_fixed(req(10, "inside 10: salt missing")?, "inside 10: salt")?,
        })
    }

    /// Decode an unlocked inside: deterministic CBOR, the Envelope's shape,
    /// and canonical text in every text string, payload included.
    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = cbor::decode(bytes)?;
        let inside = Inside::from_value(&v)?;
        text::check_value(&v)?;
        Ok(inside)
    }
}

impl Signature {
    pub fn from_value(v: &Value) -> R<Self> {
        let a = as_array(v, "signature", true)?;
        if a.len() != 3 {
            return Err(ActError::Shape("signature"));
        }
        let scheme = match &a[0] {
            Value::Uint(n @ 1..=3) => Scheme::Founding(*n as u8),
            Value::Bytes(_) => Scheme::Spec(as_hash(&a[0], "signature scheme")?),
            _ => return Err(ActError::Shape("signature scheme")),
        };
        let bytes = |x: &Value, what| match x {
            Value::Bytes(b) => Ok(b.clone()),
            _ => Err(ActError::Shape(what)),
        };
        Ok(Signature {
            scheme,
            key: bytes(&a[1], "signature key")?,
            sig: bytes(&a[2], "signature bytes")?,
        })
    }
}

impl Act {
    pub fn from_value(v: &Value) -> R<Self> {
        let a = as_array(v, "act", true)?;
        if a.len() != 3 {
            return Err(ActError::Shape("act: not [outside, locked, signature]"));
        }
        let locked = match &a[1] {
            Value::Bytes(b) => b.clone(),
            _ => return Err(ActError::Shape("act: locked")),
        };
        Ok(Act {
            outside: Outside::from_value(&a[0])?,
            locked,
            signature: Signature::from_value(&a[2])?,
        })
    }

    /// Decode an act from its bytes: deterministic CBOR in the Envelope's
    /// shape (Envelope rule 1). Its inside stays locked; see [`Act::open`].
    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = cbor::decode(bytes)?;
        let act = Act::from_value(&v)?;
        text::check_value(&v)?;
        Ok(act)
    }

    /// Check the locked bytes against the locked hash, the check any relay
    /// can make (Envelope rule 2, first half).
    pub fn check_locked_hash(&self) -> R<()> {
        if sha256(&self.locked) != self.outside.locked_hash {
            return Err(ActError::LockedHash);
        }
        Ok(())
    }

    /// Open the inside. A public act opens with the key on its outside; a
    /// private one needs `key`. See [`open`].
    pub fn open(&self, key: Option<&ContentKey>) -> R<Inside> {
        open(&self.outside, &self.locked, key)
    }
}

// ---------------------------------------------------------------- seal and open

/// What the signer chooses for the outside, besides what sealing computes.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Addressing {
    pub signer: Option<Hash>,
    pub binding: Option<Hash>,
    /// Put the content key on the outside (a public act).
    pub public: bool,
    pub to: Option<Vec<Hash>>,
}

/// Lock an inside and build the outside that commits to it.
///
/// The caller supplies a fresh random content key, nonce and (in the inside)
/// salt; they are parameters so that test vectors are reproducible. Returns
/// the outside and the locked bytes; signing the act id is part 2.
pub fn seal(
    inside: &Inside,
    key: &ContentKey,
    nonce: &Nonce,
    addr: &Addressing,
) -> (Outside, Vec<u8>) {
    seal_encoded(&inside.encode(), key, nonce, addr)
}

/// Seal an inside and sign the act id: the whole act. `sign` is given the
/// act id and returns the signature (see [`crate::sig`]).
pub fn make(
    inside: &Inside,
    key: &ContentKey,
    nonce: &Nonce,
    addr: &Addressing,
    sign: impl FnOnce(&Hash) -> Signature,
) -> Act {
    let (outside, locked) = seal(inside, key, nonce, addr);
    let signature = sign(&outside.act_id());
    Act {
        outside,
        locked,
        signature,
    }
}

/// [`seal`] for an inside already encoded. Nothing here checks the bytes;
/// it exists so that tests can seal insides that [`open`] must reject.
pub fn seal_encoded(
    encoded: &[u8],
    key: &ContentKey,
    nonce: &Nonce,
    addr: &Addressing,
) -> (Outside, Vec<u8>) {
    let locked = lock::lock(encoded, key, nonce);
    let outside = Outside {
        signer: addr.signer,
        binding: addr.binding,
        inside_commitment: tagged_hash(tag::INSIDE, encoded),
        locked_hash: sha256(&locked),
        nonce: *nonce,
        content_key: if addr.public { Some(*key) } else { None },
        to: addr.to.clone(),
    };
    (outside, locked)
}

/// Open an act's inside and check it against its outside (Envelope rules 2,
/// 3 and 5; Identity, "Every act", step 2):
///
/// 1. the locked bytes hash to the locked hash;
/// 2. the content key (the outside's, for a public act) opens them;
/// 3. what they open to matches the inside commitment;
/// 4. it is deterministic CBOR in the inside's shape, with canonical text.
pub fn open(outside: &Outside, locked: &[u8], key: Option<&ContentKey>) -> R<Inside> {
    if sha256(locked) != outside.locked_hash {
        return Err(ActError::LockedHash);
    }
    let key = outside
        .content_key
        .as_ref()
        .or(key)
        .ok_or(ActError::NoKey)?;
    let plain = lock::unlock(locked, key, &outside.nonce).map_err(|_| ActError::Unlock)?;
    if tagged_hash(tag::INSIDE, &plain) != outside.inside_commitment {
        return Err(ActError::InsideCommitment);
    }
    Inside::decode(&plain)
}

// ---------------------------------------------------------------- sequences

/// Why an everyday act does not fit its place in a sequence (Envelope rule 4).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SequenceError {
    /// An everyday act carries `prev` (empty for the first act of a sequence).
    MissingPrev,
    /// More than one `prev`: sequences are single lines.
    SeveralPrev,
    /// `prev` does not name the sequence's previous act (or is not empty on the first).
    WrongPrev,
    /// Position missing.
    MissingPosition,
    /// Position is not the predecessor's plus one (1 for the first act).
    WrongPosition,
    /// Running summary missing.
    MissingSummary,
    /// Running summary does not match the sequence up to and including the previous act.
    WrongSummary,
}

impl fmt::Display for SequenceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            SequenceError::MissingPrev => "an everyday act must carry prev",
            SequenceError::SeveralPrev => "more than one prev",
            SequenceError::WrongPrev => "prev does not name the previous act",
            SequenceError::MissingPosition => "position missing",
            SequenceError::WrongPosition => "position is not the previous position plus one",
            SequenceError::MissingSummary => "running summary missing",
            SequenceError::WrongSummary => "running summary does not match the sequence",
        };
        f.write_str(s)
    }
}

impl std::error::Error for SequenceError {}

/// A sequence being read from its first act: checks each next act's `prev`,
/// position and running summary, then adds it.
#[derive(Clone, Debug, Default)]
pub struct Sequence {
    mmr: Mmr,
    last: Option<Hash>,
}

impl Sequence {
    /// An empty sequence, before its first act.
    pub fn new() -> Self {
        Self::default()
    }

    /// The number of acts so far; also the position of the last one.
    pub fn len(&self) -> u64 {
        self.mmr.len()
    }

    /// Whether no act has been added yet.
    pub fn is_empty(&self) -> bool {
        self.mmr.is_empty()
    }

    /// The running summary the next act must carry: over every act so far
    /// (the empty summary before the first). It is also the summary
    /// "including" the last act, as a rotation's kept tip carries it.
    pub fn summary(&self) -> Hash {
        self.mmr.root()
    }

    /// The last act added, if any.
    pub fn last(&self) -> Option<&Hash> {
        self.last.as_ref()
    }

    /// Check that an act fits as the next of this sequence, without adding it.
    pub fn check_next(&self, inside: &Inside) -> Result<(), SequenceError> {
        let prev = inside.prev.as_ref().ok_or(SequenceError::MissingPrev)?;
        if prev.len() > 1 {
            return Err(SequenceError::SeveralPrev);
        }
        if prev.first() != self.last.as_ref() {
            return Err(SequenceError::WrongPrev);
        }
        let pos = inside.position.ok_or(SequenceError::MissingPosition)?;
        if pos != self.mmr.len() + 1 {
            return Err(SequenceError::WrongPosition);
        }
        let summary = inside.summary.ok_or(SequenceError::MissingSummary)?;
        if summary != self.mmr.root() {
            return Err(SequenceError::WrongSummary);
        }
        Ok(())
    }

    /// Check an act as the next of this sequence and add it.
    pub fn append(&mut self, act_id: &Hash, inside: &Inside) -> Result<(), SequenceError> {
        self.check_next(inside)?;
        self.mmr.push(act_id);
        self.last = Some(*act_id);
        Ok(())
    }
}

/// The empty running summary, carried by the first act of a sequence.
pub const EMPTY_SUMMARY: Hash = ZERO_HASH;
