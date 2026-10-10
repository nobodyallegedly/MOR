//! The messages that cross the air gap (Module, section 2), and the share a
//! collective's members hold (section 5).
//!
//! Every message is one CBOR map with small integer keys, in deterministic
//! encoding, and decodes strictly: a closed map, every value of its kind,
//! nothing after it, nothing larger than [`MAX_MESSAGE`] (rule 3.6). The
//! device parses the message it expects and nothing else; it never runs
//! anything it receives.

use mor_core::act::Scheme;
use mor_core::cbor::{self, Value};
use mor_core::hash::{tagged_hash, Hash};
use mor_core::identity::ChainKeyCommit;
use mor_core::text;
use std::fmt;

/// The largest message a device reads, in bytes. A pending rotation whose
/// previous act carries a fast-variant signature is about 18 KB.
pub const MAX_MESSAGE: usize = 256 * 1024;

/// Message kinds (key 0).
pub mod kind {
    pub const COMMITMENT_EXPORT: u64 = 0;
    pub const PENDING_ROTATION: u64 = 1;
    pub const SIGNED_ROTATION: u64 = 2;
    pub const SHARE: u64 = 3;
}

/// Why bytes are not the message expected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum MsgError {
    TooLarge(usize),
    /// Not deterministic CBOR, or text that is not canonical.
    Encoding(String),
    /// Not in the message's shape. Names the field.
    Shape(&'static str),
    /// A message of another kind than the one expected.
    Kind {
        expected: u64,
        found: u64,
    },
}

impl fmt::Display for MsgError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MsgError::TooLarge(n) => {
                write!(f, "{n} bytes: larger than any message ({MAX_MESSAGE})")
            }
            MsgError::Encoding(e) => write!(f, "not a message: {e}"),
            MsgError::Shape(w) => write!(f, "not in the message's shape: {w}"),
            MsgError::Kind { expected, found } => {
                write!(
                    f,
                    "a message of kind {found}, where kind {expected} was expected"
                )
            }
        }
    }
}

impl std::error::Error for MsgError {}

type R<T> = Result<T, MsgError>;

// ---------------------------------------------------------------- the messages

/// 2.1, offline to online at genesis (kind 0).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CommitmentExport {
    pub chain_key: ChainKeyCommit,
    /// The key's number in the identity's life: 0 for the key genesis commits.
    pub index: u64,
}

/// 2.2, online to offline (kind 1).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PendingRotation {
    /// The rotation's inside, encoded, without the salt (key 10) and without
    /// the next chain-key commitment (payload key 3).
    pub inside: Vec<u8>,
    /// The previous identity-chain act, complete with its signature.
    pub prev: Vec<u8>,
    /// The number of the chain key to use: the rotation's position minus one.
    pub index: u64,
    /// Context for display, never trusted.
    pub context: Option<Vec<Vec<u8>>>,
    /// Whether the online device has prepared an escape endorsement.
    pub escape: Option<bool>,
}

/// 2.3, offline to online (kind 2).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SignedRotation {
    /// The complete rotation act.
    pub act: Vec<u8>,
    /// Clean-device mode: the new signing key's 32-byte secret.
    pub signing_secret: Option<[u8; 32]>,
}

/// Who holds a share (5.2): a member, a custodian under the collective's
/// grant, or an escrow released by the abandonment authority.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Role {
    Member,
    Custodian,
    Escrow,
}

/// `holder = [ role: 0 / 1 / 2, identity: hash / null ]`
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Holder {
    pub role: Role,
    pub identity: Option<Hash>,
}

/// The public part of a dealing, the same for every member.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Dealing {
    /// The next chain key the shares rebuild.
    pub chain_key: ChainKeyCommit,
    /// The seed Module that derives the key from the rebuilt seed.
    pub seed_module: Hash,
    /// The key's number in the collective's life.
    pub index: u64,
    /// Any `threshold` shares rebuild the seed.
    pub threshold: u64,
    /// One holder per share; share x is held by `holders[x - 1]`.
    pub holders: Vec<Holder>,
    /// Pedersen commitments to the two polynomials' coefficients, 33 bytes
    /// each (compressed secp256k1 points), `threshold` of them.
    pub commitments: Vec<[u8; 33]>,
}

/// One member's share (kind 3).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Share {
    pub dealing: Dealing,
    /// This share's number, 1 to n.
    pub x: u64,
    /// f(x), the share of the seed.
    pub value: [u8; 32],
    /// g(x), the share of the blinding.
    pub blinding: [u8; 32],
}

/// Any message.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Message {
    CommitmentExport(CommitmentExport),
    PendingRotation(PendingRotation),
    SignedRotation(SignedRotation),
    Share(Share),
}

impl Message {
    pub fn kind(&self) -> u64 {
        match self {
            Message::CommitmentExport(_) => kind::COMMITMENT_EXPORT,
            Message::PendingRotation(_) => kind::PENDING_ROTATION,
            Message::SignedRotation(_) => kind::SIGNED_ROTATION,
            Message::Share(_) => kind::SHARE,
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }

    pub fn to_value(&self) -> Value {
        let mut m = vec![(u(0), u(self.kind()))];
        match self {
            Message::CommitmentExport(c) => {
                m.push((u(1), c.chain_key.to_value()));
                m.push((u(2), u(c.index)));
            }
            Message::PendingRotation(p) => {
                m.push((u(1), Value::Bytes(p.inside.clone())));
                m.push((u(2), Value::Bytes(p.prev.clone())));
                m.push((u(3), u(p.index)));
                if let Some(c) = &p.context {
                    m.push((
                        u(4),
                        Value::Array(c.iter().cloned().map(Value::Bytes).collect()),
                    ));
                }
                if let Some(e) = p.escape {
                    m.push((u(5), Value::Bool(e)));
                }
            }
            Message::SignedRotation(s) => {
                m.push((u(1), Value::Bytes(s.act.clone())));
                if let Some(k) = &s.signing_secret {
                    m.push((u(2), Value::Bytes(k.to_vec())));
                }
            }
            Message::Share(s) => {
                m.push((u(1), s.dealing.to_value()));
                m.push((u(2), u(s.x)));
                m.push((u(3), Value::Bytes(s.value.to_vec())));
                m.push((u(4), Value::Bytes(s.blinding.to_vec())));
            }
        }
        Value::Map(m)
    }

    /// Decode any message, strictly.
    pub fn decode(bytes: &[u8]) -> R<Message> {
        if bytes.len() > MAX_MESSAGE {
            return Err(MsgError::TooLarge(bytes.len()));
        }
        let v = cbor::decode(bytes).map_err(|e| MsgError::Encoding(e.to_string()))?;
        text::check_value(&v).map_err(|e| MsgError::Encoding(format!("{e:?}")))?;
        let Value::Map(entries) = &v else {
            return Err(MsgError::Shape("a message is a map"));
        };
        let f = fields(entries)?;
        let k = uint(req(&f, 0, "0: kind")?, "0: kind")?;
        let allowed: &[u64] = match k {
            kind::COMMITMENT_EXPORT => &[0, 1, 2],
            kind::PENDING_ROTATION => &[0, 1, 2, 3, 4, 5],
            kind::SIGNED_ROTATION => &[0, 1, 2],
            kind::SHARE => &[0, 1, 2, 3, 4],
            _ => return Err(MsgError::Shape("0: an unknown kind")),
        };
        if f.iter().any(|(n, _)| !allowed.contains(n)) {
            return Err(MsgError::Shape("a key the message kind does not define"));
        }
        Ok(match k {
            kind::COMMITMENT_EXPORT => Message::CommitmentExport(CommitmentExport {
                chain_key: chain_key_commit(req(&f, 1, "1: chain-key-commit")?)?,
                index: uint(req(&f, 2, "2: index")?, "2: index")?,
            }),
            kind::PENDING_ROTATION => Message::PendingRotation(PendingRotation {
                inside: bytes_of(req(&f, 1, "1: inside")?, "1: inside")?,
                prev: bytes_of(req(&f, 2, "2: previous act")?, "2: previous act")?,
                index: uint(req(&f, 3, "3: index")?, "3: index")?,
                context: get(&f, 4)
                    .map(|v| {
                        nonempty(v, "4: context")?
                            .iter()
                            .map(|x| bytes_of(x, "4: context"))
                            .collect()
                    })
                    .transpose()?,
                escape: get(&f, 5)
                    .map(|v| match v {
                        Value::Bool(b) => Ok(*b),
                        _ => Err(MsgError::Shape("5: escape")),
                    })
                    .transpose()?,
            }),
            kind::SIGNED_ROTATION => Message::SignedRotation(SignedRotation {
                act: bytes_of(req(&f, 1, "1: act")?, "1: act")?,
                signing_secret: get(&f, 2)
                    .map(|v| fixed(v, "2: signing secret"))
                    .transpose()?,
            }),
            _ => Message::Share(Share {
                dealing: Dealing::from_value(req(&f, 1, "1: dealing")?)?,
                x: uint(req(&f, 2, "2: x")?, "2: x")?,
                value: fixed(req(&f, 3, "3: value")?, "3: value")?,
                blinding: fixed(req(&f, 4, "4: blinding")?, "4: blinding")?,
            }),
        })
    }

    /// Decode a message, and only of the kind expected.
    pub fn decode_kind(bytes: &[u8], expected: u64) -> R<Message> {
        let m = Message::decode(bytes)?;
        if m.kind() != expected {
            return Err(MsgError::Kind {
                expected,
                found: m.kind(),
            });
        }
        Ok(m)
    }
}

impl Dealing {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            self.chain_key.to_value(),
            Value::Bytes(self.seed_module.to_vec()),
            u(self.index),
            u(self.threshold),
            Value::Array(
                self.holders
                    .iter()
                    .map(|h| {
                        Value::Array(vec![
                            u(match h.role {
                                Role::Member => 0,
                                Role::Custodian => 1,
                                Role::Escrow => 2,
                            }),
                            h.identity
                                .map(|i| Value::Bytes(i.to_vec()))
                                .unwrap_or(Value::Null),
                        ])
                    })
                    .collect(),
            ),
            Value::Array(
                self.commitments
                    .iter()
                    .map(|c| Value::Bytes(c.to_vec()))
                    .collect(),
            ),
        ])
    }

    fn from_value(v: &Value) -> R<Dealing> {
        let a = tuple(v, 6, "dealing")?;
        let holders = nonempty(&a[4], "dealing holders")?
            .iter()
            .map(|h| {
                let t = tuple(h, 2, "holder")?;
                let role = match uint(&t[0], "holder role")? {
                    0 => Role::Member,
                    1 => Role::Custodian,
                    2 => Role::Escrow,
                    _ => return Err(MsgError::Shape("holder role")),
                };
                let identity = match &t[1] {
                    Value::Null => None,
                    x => Some(fixed(x, "holder identity")?),
                };
                Ok(Holder { role, identity })
            })
            .collect::<R<Vec<_>>>()?;
        let commitments = nonempty(&a[5], "dealing commitments")?
            .iter()
            .map(|c| fixed(c, "dealing commitment"))
            .collect::<R<Vec<_>>>()?;
        let d = Dealing {
            chain_key: chain_key_commit(&a[0])?,
            seed_module: fixed(&a[1], "dealing seed module")?,
            index: uint(&a[2], "dealing index")?,
            threshold: uint(&a[3], "dealing threshold")?,
            holders,
            commitments,
        };
        if d.threshold < 1
            || d.threshold as usize > d.holders.len()
            || d.commitments.len() as u64 != d.threshold
        {
            return Err(MsgError::Shape(
                "dealing: threshold, holders and commitments disagree",
            ));
        }
        Ok(d)
    }

    /// What every member compares with every other, out of band, so that
    /// nobody was handed a different dealing: `tagged_hash("MOR/module/airgap/dealing", dealing)`.
    pub fn fingerprint(&self) -> Hash {
        tagged_hash(crate::tag::DEALING, &cbor::encode(&self.to_value()))
    }
}

// ---------------------------------------------------------------- helpers

fn u(n: u64) -> Value {
    Value::Uint(n)
}

fn fields(entries: &[(Value, Value)]) -> R<Vec<(u64, &Value)>> {
    entries
        .iter()
        .map(|(k, v)| match k {
            Value::Uint(k) => Ok((*k, v)),
            _ => Err(MsgError::Shape("a key that is not a small integer")),
        })
        .collect()
}

fn get<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

fn req<'a>(f: &[(u64, &'a Value)], k: u64, w: &'static str) -> R<&'a Value> {
    get(f, k).ok_or(MsgError::Shape(w))
}

fn uint(v: &Value, w: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(MsgError::Shape(w)),
    }
}

fn bytes_of(v: &Value, w: &'static str) -> R<Vec<u8>> {
    match v {
        Value::Bytes(b) => Ok(b.clone()),
        _ => Err(MsgError::Shape(w)),
    }
}

fn fixed<const N: usize>(v: &Value, w: &'static str) -> R<[u8; N]> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| MsgError::Shape(w)),
        _ => Err(MsgError::Shape(w)),
    }
}

fn tuple<'a>(v: &'a Value, n: usize, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if a.len() == n => Ok(a),
        _ => Err(MsgError::Shape(w)),
    }
}

fn nonempty<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if !a.is_empty() => Ok(a),
        _ => Err(MsgError::Shape(w)),
    }
}

/// `chain-key-commit = [ scheme, commit: hash ]`, as in the Identity MIP.
pub fn chain_key_commit(v: &Value) -> R<ChainKeyCommit> {
    let a = tuple(v, 2, "chain-key-commit")?;
    let scheme = match &a[0] {
        Value::Uint(n @ 1..=3) => Scheme::Founding(*n as u8),
        x @ Value::Bytes(_) => Scheme::Spec(fixed(x, "chain-key-commit scheme")?),
        _ => return Err(MsgError::Shape("chain-key-commit scheme")),
    };
    Ok(ChainKeyCommit {
        scheme,
        commit: fixed(&a[1], "chain-key-commit commit")?,
    })
}
