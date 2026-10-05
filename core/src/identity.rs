//! The Identity MIP's act formats, and the checks that need no other act
//! (Identity, "Act formats"; "Verification procedures": genesis checks 1 to
//! 5, rotation checks 1, 4 and 5).
//!
//! Each payload decodes strictly: its CDDL map is closed, so an unknown key,
//! a missing required key or a value of the wrong kind makes the act invalid,
//! as for the outside and inside (Envelope rule 1). Every payload also
//! encodes, so clients and tests can build acts.
//!
//! What depends on other acts (which predecessor counts, receipts, homes,
//! audits, objections) is in [`crate::chain`].

use crate::act::{Act, Inside, Scheme, Signature};
use crate::cbor::Value;
use crate::hash::Hash;
use std::fmt;

/// The types this MIP defines (Identity, "Types defined by this MIP").
pub mod types {
    pub const GENESIS: u64 = 0;
    pub const ROTATION: u64 = 1;
    pub const RECEIPT: u64 = 2;
    pub const ROUTES: u64 = 3;
    pub const NAME: u64 = 4;
    pub const NAME_WITHDRAWAL: u64 = 5;
    pub const LINK_CLAIM: u64 = 6;
    pub const LINK_CONFIRMATION: u64 = 7;
    pub const LINK_TERMINATION: u64 = 8;
    pub const LOG_SUMMARY: u64 = 9;
    pub const COSIGNATURE: u64 = 10;
    // 11, home closure, is retired and never reused (F56).
    pub const OBJECTION: u64 = 12;
    pub const ABSENCE: u64 = 13;
    pub const ESCAPE_ENDORSEMENT: u64 = 14;
    /// "I received this act and rely on it" (F110, Identity draft 11).
    pub const WITNESS: u64 = 15;
    /// A signature made with the safety key, on the identity chain (F132,
    /// U1 refined): Law's ending signature.
    pub const CHAIN_SIGNATURE: u64 = 16;
}

/// Why an Identity act is invalid on its own.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum IdError {
    /// The payload is not in the type's shape. Names the field.
    Shape(&'static str),
    /// A type number this MIP does not define (11 is retired).
    UnknownType(u64),
    /// A check of the verification procedures failed. Names it.
    Check(&'static str),
}

impl fmt::Display for IdError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            IdError::Shape(w) => write!(f, "payload not in the type's shape: {w}"),
            IdError::UnknownType(t) => write!(f, "type {t} is not defined by the Identity MIP"),
            IdError::Check(w) => write!(f, "{w}"),
        }
    }
}

impl std::error::Error for IdError {}

type R<T> = Result<T, IdError>;

// ---------------------------------------------------------------- shared parts

/// `signing-key = [ scheme, key: bstr ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SigningKey {
    pub scheme: Scheme,
    pub key: Vec<u8>,
}

impl SigningKey {
    /// Whether a signature is made by this key: same scheme, same key bytes.
    pub fn made(&self, sig: &Signature) -> bool {
        self.scheme == sig.scheme && self.key == sig.key
    }
}

/// `safety-commit = [ scheme, commit: hash ]`
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct SafetyCommit {
    pub scheme: Scheme,
    pub commit: Hash,
}

/// `home = [ operator: hash / null, hint: tstr ]`; null means self-hosted.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Home {
    pub operator: Option<Hash>,
    pub hint: String,
}

/// `home-rule = [ 0, index ] / [ 1, threshold ]`
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum HomeRule {
    /// One authoritative home, by its index in the home list.
    Authoritative(u64),
    /// A rotation counts once homes of this many distinct operators hold it.
    Threshold(u64),
}

/// `audit = [ threshold, auditors: [+ hash] ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Audit {
    pub threshold: u64,
    pub auditors: Vec<Hash>,
}

/// `declaration = [ spec: hash, kind: uint, value: any / null ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Declaration {
    pub spec: Hash,
    pub kind: u64,
    /// `None` is the null value: the kind is removed.
    pub value: Option<Value>,
}

/// `successor = [ protocol: tstr, identifier: bstr ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Successor {
    pub protocol: String,
    pub identifier: Vec<u8>,
}

/// `kept-tip = [ act: hash, position: uint, summary: hash ]`
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct KeptTip {
    pub act: Hash,
    pub position: u64,
    /// The running summary including the tip itself.
    pub summary: Hash,
}

// ---------------------------------------------------------------- payloads

/// Genesis (type 0).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Genesis {
    pub signing_key: SigningKey,
    pub safety: SafetyCommit,
    pub homes: Vec<Home>,
    pub rule: Option<HomeRule>,
    pub declarations: Option<Vec<Declaration>>,
    pub audit: Option<Audit>,
}

/// Rotation (type 1). A field that may be null is `Option<Option<_>>`:
/// absent, present with a value, or present as null.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rotation {
    pub prev: Hash,
    pub position: u64,
    pub signing_key: SigningKey,
    pub safety: SafetyCommit,
    pub kept: Vec<KeptTip>,
    pub disowned: Option<Vec<Hash>>,
    pub homes: Option<Vec<Home>>,
    pub rule: Option<Option<HomeRule>>,
    pub declarations: Option<Vec<Declaration>>,
    pub successor: Option<Option<Successor>>,
    pub audit: Option<Option<Audit>>,
    pub homeless: bool,
    pub closure: bool,
}

/// Chain signature (type 16, F132): an identity-chain act signed with the
/// revealed safety key, naming the act it signs. It commits the next safety
/// key and changes nothing else: the signing key, homes, rules and
/// declarations carry on, and it judges no act.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ChainSignature {
    pub prev: Hash,
    pub position: u64,
    pub safety: SafetyCommit,
    /// The act it signs; what the signature means is the signed act's MIP's.
    pub signs: Hash,
}

/// Receipt (type 2).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Receipt {
    pub identity: Hash,
    pub act: Hash,
    pub position: u64,
    pub log_position: u64,
}

/// Log summary (type 9).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct LogSummary {
    pub size: u64,
    pub root: Hash,
    pub prev: Option<Hash>,
}

/// Objection (type 12).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Objection {
    pub identity: Hash,
}

/// Absence statement (type 13).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Absence {
    pub operator: Hash,
    pub last_summary: Option<Hash>,
}

/// Escape endorsement (type 14).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Endorsement {
    /// Earlier rotations at the same position the owner abandons.
    pub abandoned: Option<Vec<Hash>>,
}

/// A decoded Identity payload.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Payload {
    Genesis(Genesis),
    Rotation(Rotation),
    ChainSignature(ChainSignature),
    Receipt(Receipt),
    LogSummary(LogSummary),
    Cosignature,
    Objection(Objection),
    Absence(Absence),
    Endorsement(Endorsement),
    /// A witness act (type 15): its payload is empty; what it witnesses is
    /// in its `acks` (F110).
    Witness,
    /// Routes, names and links (types 3 to 8): decoded by their own checks,
    /// not needed for the identity chain.
    Other(u64),
}

// ---------------------------------------------------------------- decoding

fn hash(v: &Value, w: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| IdError::Shape(w)),
        _ => Err(IdError::Shape(w)),
    }
}

fn uint(v: &Value, w: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(IdError::Shape(w)),
    }
}

fn array<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) => Ok(a),
        _ => Err(IdError::Shape(w)),
    }
}

fn nonempty<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    let a = array(v, w)?;
    if a.is_empty() {
        return Err(IdError::Shape(w));
    }
    Ok(a)
}

fn tuple<'a>(v: &'a Value, n: usize, w: &'static str) -> R<&'a [Value]> {
    let a = array(v, w)?;
    if a.len() != n {
        return Err(IdError::Shape(w));
    }
    Ok(a)
}

fn hashes(v: &Value, w: &'static str) -> R<Vec<Hash>> {
    nonempty(v, w)?.iter().map(|x| hash(x, w)).collect()
}

fn is_null(v: &Value) -> bool {
    matches!(v, Value::Null)
}

fn scheme(v: &Value, w: &'static str) -> R<Scheme> {
    match v {
        Value::Uint(n @ 1..=3) => Ok(Scheme::Founding(*n as u8)),
        Value::Bytes(_) => Ok(Scheme::Spec(hash(v, w)?)),
        _ => Err(IdError::Shape(w)),
    }
}

/// Decode `signing-key = [ scheme, key: bstr ]`; Finance reads an anonymous
/// payer's bare key in this form (F113).
pub fn signing_key(v: &Value) -> R<SigningKey> {
    let a = tuple(v, 2, "signing-key")?;
    let Value::Bytes(key) = &a[1] else {
        return Err(IdError::Shape("signing-key key"));
    };
    Ok(SigningKey {
        scheme: scheme(&a[0], "signing-key scheme")?,
        key: key.clone(),
    })
}

fn safety_commit(v: &Value) -> R<SafetyCommit> {
    let a = tuple(v, 2, "safety-commit")?;
    Ok(SafetyCommit {
        scheme: scheme(&a[0], "safety-commit scheme")?,
        commit: hash(&a[1], "safety-commit commit")?,
    })
}

fn homes(v: &Value) -> R<Vec<Home>> {
    nonempty(v, "homes")?
        .iter()
        .map(|h| {
            let a = tuple(h, 2, "home")?;
            let operator = if is_null(&a[0]) {
                None
            } else {
                Some(hash(&a[0], "home operator")?)
            };
            let Value::Text(hint) = &a[1] else {
                return Err(IdError::Shape("home hint"));
            };
            Ok(Home {
                operator,
                hint: hint.clone(),
            })
        })
        .collect()
}

fn home_rule(v: &Value) -> R<HomeRule> {
    let a = tuple(v, 2, "home-rule")?;
    let n = uint(&a[1], "home-rule value")?;
    match uint(&a[0], "home-rule form")? {
        0 => Ok(HomeRule::Authoritative(n)),
        1 => Ok(HomeRule::Threshold(n)),
        _ => Err(IdError::Shape("home-rule form")),
    }
}

fn audit(v: &Value) -> R<Audit> {
    let a = tuple(v, 2, "audit")?;
    Ok(Audit {
        threshold: uint(&a[0], "audit threshold")?,
        auditors: hashes(&a[1], "audit auditors")?,
    })
}

fn declarations(v: &Value) -> R<Vec<Declaration>> {
    nonempty(v, "declarations")?
        .iter()
        .map(|d| {
            let a = tuple(d, 3, "declaration")?;
            Ok(Declaration {
                spec: hash(&a[0], "declaration spec")?,
                kind: uint(&a[1], "declaration kind")?,
                value: if is_null(&a[2]) {
                    None
                } else {
                    Some(a[2].clone())
                },
            })
        })
        .collect()
}

fn successor(v: &Value) -> R<Successor> {
    let a = tuple(v, 2, "successor")?;
    let (Value::Text(p), Value::Bytes(id)) = (&a[0], &a[1]) else {
        return Err(IdError::Shape("successor"));
    };
    Ok(Successor {
        protocol: p.clone(),
        identifier: id.clone(),
    })
}

fn kept(v: &Value) -> R<Vec<KeptTip>> {
    array(v, "kept")?
        .iter()
        .map(|t| {
            let a = tuple(t, 3, "kept-tip")?;
            Ok(KeptTip {
                act: hash(&a[0], "kept-tip act")?,
                position: uint(&a[1], "kept-tip position")?,
                summary: hash(&a[2], "kept-tip summary")?,
            })
        })
        .collect()
}

fn flag(v: &Value, w: &'static str) -> R<bool> {
    match v {
        Value::Bool(true) => Ok(true),
        _ => Err(IdError::Shape(w)),
    }
}

/// A payload map with small integer keys, all below `n`, as `(key, value)`.
fn fields<'a>(p: &'a [(Value, Value)], n: u64, w: &'static str) -> R<Vec<(u64, &'a Value)>> {
    p.iter()
        .map(|(k, v)| match k {
            Value::Uint(k) if *k < n => Ok((*k, v)),
            _ => Err(IdError::Shape(w)),
        })
        .collect()
}

fn get<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

fn req<'a>(f: &[(u64, &'a Value)], k: u64, w: &'static str) -> R<&'a Value> {
    get(f, k).ok_or(IdError::Shape(w))
}

/// "Absent, a value, or null" for the fields of a rotation that take null.
fn nullable<T>(f: &[(u64, &Value)], k: u64, dec: impl Fn(&Value) -> R<T>) -> R<Option<Option<T>>> {
    match get(f, k) {
        None => Ok(None),
        Some(v) if is_null(v) => Ok(Some(None)),
        Some(v) => Ok(Some(Some(dec(v)?))),
    }
}

impl Payload {
    /// Decode an Identity act's payload by its type.
    pub fn decode(type_: u64, p: &[(Value, Value)]) -> R<Payload> {
        use types::*;
        let empty = |w| {
            if p.is_empty() {
                Ok(())
            } else {
                Err(IdError::Shape(w))
            }
        };
        Ok(match type_ {
            GENESIS => {
                let f = fields(p, 6, "genesis: unknown key")?;
                Payload::Genesis(Genesis {
                    signing_key: signing_key(req(&f, 0, "genesis 0: signing key")?)?,
                    safety: safety_commit(req(&f, 1, "genesis 1: safety commitment")?)?,
                    homes: homes(req(&f, 2, "genesis 2: homes")?)?,
                    rule: get(&f, 3).map(home_rule).transpose()?,
                    declarations: get(&f, 4).map(declarations).transpose()?,
                    audit: get(&f, 5).map(audit).transpose()?,
                })
            }
            ROTATION => {
                let f = fields(p, 13, "rotation: unknown key")?;
                Payload::Rotation(Rotation {
                    prev: hash(req(&f, 0, "rotation 0: previous act")?, "rotation 0")?,
                    position: uint(req(&f, 1, "rotation 1: position")?, "rotation 1")?,
                    signing_key: signing_key(req(&f, 2, "rotation 2: signing key")?)?,
                    safety: safety_commit(req(&f, 3, "rotation 3: safety commitment")?)?,
                    kept: kept(req(&f, 4, "rotation 4: kept")?)?,
                    disowned: get(&f, 5)
                        .map(|v| hashes(v, "rotation 5: disowned"))
                        .transpose()?,
                    homes: get(&f, 6).map(homes).transpose()?,
                    rule: nullable(&f, 7, home_rule)?,
                    declarations: get(&f, 8).map(declarations).transpose()?,
                    successor: nullable(&f, 9, successor)?,
                    audit: nullable(&f, 10, audit)?,
                    homeless: get(&f, 11)
                        .map(|v| flag(v, "rotation 11: homeless"))
                        .transpose()?
                        .unwrap_or(false),
                    closure: get(&f, 12)
                        .map(|v| flag(v, "rotation 12: closure"))
                        .transpose()?
                        .unwrap_or(false),
                })
            }
            CHAIN_SIGNATURE => {
                let f = fields(p, 4, "chain signature: unknown key")?;
                Payload::ChainSignature(ChainSignature {
                    prev: hash(req(&f, 0, "chain signature 0: previous act")?, "chain signature 0")?,
                    position: uint(req(&f, 1, "chain signature 1: position")?, "chain signature 1")?,
                    safety: safety_commit(req(&f, 2, "chain signature 2: safety commitment")?)?,
                    signs: hash(req(&f, 3, "chain signature 3: the act signed")?, "chain signature 3")?,
                })
            }
            RECEIPT => {
                let f = fields(p, 4, "receipt: unknown key")?;
                Payload::Receipt(Receipt {
                    identity: hash(req(&f, 0, "receipt 0")?, "receipt 0: identity")?,
                    act: hash(req(&f, 1, "receipt 1")?, "receipt 1: act")?,
                    position: uint(req(&f, 2, "receipt 2")?, "receipt 2: position")?,
                    log_position: uint(req(&f, 3, "receipt 3")?, "receipt 3: log position")?,
                })
            }
            LOG_SUMMARY => {
                let f = fields(p, 3, "log summary: unknown key")?;
                Payload::LogSummary(LogSummary {
                    size: uint(req(&f, 0, "log summary 0")?, "log summary 0: size")?,
                    root: hash(req(&f, 1, "log summary 1")?, "log summary 1: root")?,
                    prev: get(&f, 2)
                        .map(|v| hash(v, "log summary 2: previous"))
                        .transpose()?,
                })
            }
            COSIGNATURE => {
                empty("cosignature: payload not empty")?;
                Payload::Cosignature
            }
            OBJECTION => {
                let f = fields(p, 1, "objection: unknown key")?;
                Payload::Objection(Objection {
                    identity: hash(req(&f, 0, "objection 0")?, "objection 0: identity")?,
                })
            }
            ABSENCE => {
                let f = fields(p, 2, "absence: unknown key")?;
                Payload::Absence(Absence {
                    operator: hash(req(&f, 0, "absence 0")?, "absence 0: operator")?,
                    last_summary: get(&f, 1).map(|v| hash(v, "absence 1")).transpose()?,
                })
            }
            ESCAPE_ENDORSEMENT => {
                let f = fields(p, 1, "escape endorsement: unknown key")?;
                Payload::Endorsement(Endorsement {
                    abandoned: get(&f, 0)
                        .map(|v| hashes(v, "endorsement 0: abandoned"))
                        .transpose()?,
                })
            }
            WITNESS => {
                empty("witness: the payload is empty")?;
                Payload::Witness
            }
            ROUTES | NAME | NAME_WITHDRAWAL | LINK_CLAIM | LINK_CONFIRMATION | LINK_TERMINATION => {
                Payload::Other(type_)
            }
            t => return Err(IdError::UnknownType(t)),
        })
    }
}

// ---------------------------------------------------------------- encoding

fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn scheme_v(s: &Scheme) -> Value {
    match s {
        Scheme::Founding(n) => Value::Uint(*n as u64),
        Scheme::Spec(h) => b(h),
    }
}

impl SigningKey {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![scheme_v(&self.scheme), Value::Bytes(self.key.clone())])
    }
}

impl SafetyCommit {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![scheme_v(&self.scheme), b(&self.commit)])
    }
}

fn homes_v(hs: &[Home]) -> Value {
    Value::Array(
        hs.iter()
            .map(|h| {
                Value::Array(vec![
                    h.operator.as_ref().map(b).unwrap_or(Value::Null),
                    Value::Text(h.hint.clone()),
                ])
            })
            .collect(),
    )
}

impl HomeRule {
    pub fn to_value(&self) -> Value {
        let (f, n) = match self {
            HomeRule::Authoritative(i) => (0, *i),
            HomeRule::Threshold(k) => (1, *k),
        };
        Value::Array(vec![Value::Uint(f), Value::Uint(n)])
    }
}

impl Audit {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            Value::Uint(self.threshold),
            Value::Array(self.auditors.iter().map(b).collect()),
        ])
    }
}

fn decls_v(ds: &[Declaration]) -> Value {
    Value::Array(
        ds.iter()
            .map(|d| {
                Value::Array(vec![
                    b(&d.spec),
                    Value::Uint(d.kind),
                    d.value.clone().unwrap_or(Value::Null),
                ])
            })
            .collect(),
    )
}

fn hashes_v(hs: &[Hash]) -> Value {
    Value::Array(hs.iter().map(b).collect())
}

fn put(m: &mut Vec<(Value, Value)>, k: u64, v: Value) {
    m.push((Value::Uint(k), v));
}

fn put_nullable(m: &mut Vec<(Value, Value)>, k: u64, v: &Option<Option<Value>>) {
    if let Some(v) = v {
        put(m, k, v.clone().unwrap_or(Value::Null));
    }
}

impl Payload {
    /// The payload as an inside's payload map.
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = Vec::new();
        match self {
            Payload::Genesis(g) => {
                put(&mut m, 0, g.signing_key.to_value());
                put(&mut m, 1, g.safety.to_value());
                put(&mut m, 2, homes_v(&g.homes));
                if let Some(r) = &g.rule {
                    put(&mut m, 3, r.to_value());
                }
                if let Some(d) = &g.declarations {
                    put(&mut m, 4, decls_v(d));
                }
                if let Some(a) = &g.audit {
                    put(&mut m, 5, a.to_value());
                }
            }
            Payload::Rotation(r) => {
                put(&mut m, 0, b(&r.prev));
                put(&mut m, 1, Value::Uint(r.position));
                put(&mut m, 2, r.signing_key.to_value());
                put(&mut m, 3, r.safety.to_value());
                let kept = r
                    .kept
                    .iter()
                    .map(|t| Value::Array(vec![b(&t.act), Value::Uint(t.position), b(&t.summary)]))
                    .collect();
                put(&mut m, 4, Value::Array(kept));
                if let Some(d) = &r.disowned {
                    put(&mut m, 5, hashes_v(d));
                }
                if let Some(h) = &r.homes {
                    put(&mut m, 6, homes_v(h));
                }
                put_nullable(&mut m, 7, &r.rule.map(|o| o.map(|x| x.to_value())));
                if let Some(d) = &r.declarations {
                    put(&mut m, 8, decls_v(d));
                }
                let succ = r.successor.as_ref().map(|o| {
                    o.as_ref().map(|s| {
                        Value::Array(vec![
                            Value::Text(s.protocol.clone()),
                            Value::Bytes(s.identifier.clone()),
                        ])
                    })
                });
                put_nullable(&mut m, 9, &succ);
                put_nullable(
                    &mut m,
                    10,
                    &r.audit.as_ref().map(|o| o.as_ref().map(|a| a.to_value())),
                );
                if r.homeless {
                    put(&mut m, 11, Value::Bool(true));
                }
                if r.closure {
                    put(&mut m, 12, Value::Bool(true));
                }
            }
            Payload::ChainSignature(c) => {
                put(&mut m, 0, b(&c.prev));
                put(&mut m, 1, Value::Uint(c.position));
                put(&mut m, 2, c.safety.to_value());
                put(&mut m, 3, b(&c.signs));
            }
            Payload::Receipt(r) => {
                put(&mut m, 0, b(&r.identity));
                put(&mut m, 1, b(&r.act));
                put(&mut m, 2, Value::Uint(r.position));
                put(&mut m, 3, Value::Uint(r.log_position));
            }
            Payload::LogSummary(s) => {
                put(&mut m, 0, Value::Uint(s.size));
                put(&mut m, 1, b(&s.root));
                if let Some(p) = &s.prev {
                    put(&mut m, 2, b(p));
                }
            }
            Payload::Cosignature | Payload::Witness | Payload::Other(_) => {}
            Payload::Objection(o) => put(&mut m, 0, b(&o.identity)),
            Payload::Absence(a) => {
                put(&mut m, 0, b(&a.operator));
                if let Some(s) = &a.last_summary {
                    put(&mut m, 1, b(s));
                }
            }
            Payload::Endorsement(e) => {
                if let Some(a) = &e.abandoned {
                    put(&mut m, 0, hashes_v(a));
                }
            }
        }
        m
    }

    /// The type number of this payload.
    pub fn type_(&self) -> u64 {
        use types::*;
        match self {
            Payload::Genesis(_) => GENESIS,
            Payload::Rotation(_) => ROTATION,
            Payload::ChainSignature(_) => CHAIN_SIGNATURE,
            Payload::Receipt(_) => RECEIPT,
            Payload::LogSummary(_) => LOG_SUMMARY,
            Payload::Cosignature => COSIGNATURE,
            Payload::Objection(_) => OBJECTION,
            Payload::Absence(_) => ABSENCE,
            Payload::Endorsement(_) => ESCAPE_ENDORSEMENT,
            Payload::Witness => WITNESS,
            Payload::Other(t) => *t,
        }
    }
}

// ---------------------------------------------------------------- homes and rules

/// A home's operator, as homes are counted: per operator, with every null
/// entry, and the identity's own hash, counting as one operator, the
/// identity itself (F82, M6).
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Operator {
    /// Self-hosted: the identity is its own home.
    Own,
    Id(Hash),
}

/// The distinct operators of a home list, in order of first appearance.
/// `identity` is the identity's own hash, unknown at genesis.
pub fn operators(homes: &[Home], identity: Option<&Hash>) -> Vec<Operator> {
    let mut out = Vec::new();
    for h in homes {
        let op = operator_of(h, identity);
        if !out.contains(&op) {
            out.push(op);
        }
    }
    out
}

/// The operator of one home.
pub fn operator_of(h: &Home, identity: Option<&Hash>) -> Operator {
    match &h.operator {
        None => Operator::Own,
        Some(o) if Some(o) == identity => Operator::Own,
        Some(o) => Operator::Id(*o),
    }
}

/// The rule that decides which rotation counts, once the default of rule 5
/// is applied.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Effective {
    /// One home decides: a single operator, or the authoritative home. With
    /// several operators and a self-hosted home, the self-host by default.
    Single(Operator),
    /// Homes of at least this many distinct operators must hold the rotation.
    Threshold(u64),
}

/// Whether a declared home rule meets genesis check 4 against these homes.
pub fn rule_valid(rule: &HomeRule, homes: &[Home], identity: Option<&Hash>) -> bool {
    let d = operators(homes, identity).len() as u64;
    if d < 2 {
        return false;
    }
    match *rule {
        HomeRule::Authoritative(i) => i < homes.len() as u64,
        HomeRule::Threshold(k) => 2 * k > d && k <= d,
    }
}

/// Whether an audit requirement meets genesis check 5.
pub fn audit_valid(a: &Audit) -> bool {
    let mut distinct = a.auditors.clone();
    distinct.sort();
    distinct.dedup();
    a.threshold >= 1 && a.threshold <= distinct.len() as u64
}

/// The effective rule for a home list and an optional declared rule (rule 5).
/// The declared rule must already be valid for these homes.
pub fn effective(homes: &[Home], rule: Option<&HomeRule>, identity: Option<&Hash>) -> Effective {
    let ops = operators(homes, identity);
    match rule {
        Some(HomeRule::Authoritative(i)) => {
            Effective::Single(operator_of(&homes[*i as usize], identity))
        }
        Some(HomeRule::Threshold(k)) => Effective::Threshold(*k),
        None if ops.len() == 1 => Effective::Single(ops[0]),
        None if ops.contains(&Operator::Own) => Effective::Single(Operator::Own),
        None => Effective::Threshold(ops.len() as u64 / 2 + 1),
    }
}

// ---------------------------------------------------------------- checks on one act

/// Genesis checks 1 to 5, and that it is signed by the key it declares
/// (validity rule 4). The signature itself is checked separately.
pub fn check_genesis(act: &Act, inside: &Inside, g: &Genesis) -> R<()> {
    let o = &act.outside;
    if o.signer.is_some()
        || o.binding.is_some()
        || inside.prev.is_some()
        || inside.objects.is_some()
    {
        return Err(IdError::Check(
            "genesis carries signer, binding, prev or objects",
        ));
    }
    if !g.signing_key.made(&act.signature) {
        return Err(IdError::Check(
            "genesis is not signed by the signing key it declares",
        ));
    }
    if let Some(r) = &g.rule {
        if !rule_valid(r, &g.homes, None) {
            return Err(IdError::Check("genesis home rule does not fit its homes"));
        }
    }
    if let Some(a) = &g.audit {
        if !audit_valid(a) {
            return Err(IdError::Check(
                "genesis audit requirement is not satisfiable",
            ));
        }
    }
    Ok(())
}

/// Rotation check 1, and the homeless flag's requirement of new homes.
pub fn check_rotation_shape(act: &Act, inside: &Inside, r: &Rotation) -> R<()> {
    let o = &act.outside;
    if o.signer.is_none() || o.binding.is_some() || inside.prev.is_some() {
        return Err(IdError::Check(
            "rotation must carry signer, and no binding or prev",
        ));
    }
    if r.position == 0 {
        return Err(IdError::Check("a rotation's position starts at 1"));
    }
    if r.homeless && r.homes.is_none() {
        return Err(IdError::Check("a homeless rotation must declare new homes"));
    }
    Ok(())
}

/// A chain signature's shape (F132): as a rotation, `signer` and no
/// `binding` or `prev`; a position from 1.
pub fn check_chain_signature_shape(act: &Act, inside: &Inside, c: &ChainSignature) -> R<()> {
    if act.outside.signer.is_none() || act.outside.binding.is_some() || inside.prev.is_some() {
        return Err(IdError::Check(
            "a chain signature must carry signer, and no binding or prev",
        ));
    }
    if c.position == 0 {
        return Err(IdError::Check("a chain signature's position starts at 1"));
    }
    Ok(())
}

/// Everyday check 1: `signer`, `binding` and `prev` are present.
pub fn check_everyday_shape(act: &Act, inside: &Inside) -> R<()> {
    if act.outside.signer.is_none() || act.outside.binding.is_none() || inside.prev.is_none() {
        return Err(IdError::Check(
            "an everyday act must carry signer, binding and prev",
        ));
    }
    Ok(())
}

/// A witness act's shape (Identity rule 18b, F110): it acknowledges at
/// least one act, and belongs to no object's chain.
pub fn check_witness_shape(inside: &Inside) -> R<()> {
    if inside.acks.as_ref().is_none_or(|a| a.is_empty()) {
        return Err(IdError::Check("a witness act names at least one act in acks"));
    }
    if inside.objects.is_some() {
        return Err(IdError::Check("a witness act carries no objects"));
    }
    Ok(())
}

/// Whether an act names `target` in `objects`, in the chain `chain`: an
/// entry `[chain, target]` (Envelope, "Chains"; F81).
pub fn names(inside: &Inside, chain: &Hash, target: &Hash) -> bool {
    inside.objects.as_ref().is_some_and(|os| {
        os.iter()
            .any(|o| &o.chain == chain && &o.predecessor == target)
    })
}

// ---------------------------------------------------------------- the state an identity-chain act sets

/// What the identity chain says after a given act: keys, homes, rules and
/// the high-risk settings (declarations, succession).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ChainState {
    pub identity: Hash,
    pub signing_key: SigningKey,
    pub safety: SafetyCommit,
    pub homes: Vec<Home>,
    pub rule: Option<HomeRule>,
    pub audit: Option<Audit>,
    /// The latest declaration of each (spec, kind); a null removes the kind.
    pub declarations: Vec<Declaration>,
    pub successor: Option<Successor>,
}

fn merge_declarations(into: &mut Vec<Declaration>, new: &[Declaration]) {
    for d in new {
        into.retain(|x| !(x.spec == d.spec && x.kind == d.kind));
        if d.value.is_some() {
            into.push(d.clone());
        }
    }
}

impl ChainState {
    /// The state genesis sets. `identity` is the genesis act id.
    pub fn genesis(identity: Hash, g: &Genesis) -> Self {
        let mut declarations = Vec::new();
        merge_declarations(&mut declarations, g.declarations.as_deref().unwrap_or(&[]));
        ChainState {
            identity,
            signing_key: g.signing_key.clone(),
            safety: g.safety,
            homes: g.homes.clone(),
            rule: g.rule,
            audit: g.audit.clone(),
            declarations,
            successor: None,
        }
    }

    /// The state after a rotation: rotation check 5, then its changes.
    ///
    /// A home rule the rotation leaves in place must still fit the homes it
    /// sets; if it does not, the rotation is invalid (reading, see the README).
    pub fn apply(&self, r: &Rotation) -> R<ChainState> {
        let homes = r.homes.clone().unwrap_or_else(|| self.homes.clone());
        let rule = match r.rule {
            None => self.rule,
            Some(x) => x,
        };
        if let Some(rule) = &rule {
            if !rule_valid(rule, &homes, Some(&self.identity)) {
                return Err(IdError::Check(
                    "rotation home rule does not fit the homes in effect",
                ));
            }
        }
        let audit = match &r.audit {
            None => self.audit.clone(),
            Some(a) => a.clone(),
        };
        if let Some(Some(a)) = &r.audit {
            if !audit_valid(a) {
                return Err(IdError::Check(
                    "rotation audit requirement is not satisfiable",
                ));
            }
        }
        let mut declarations = self.declarations.clone();
        merge_declarations(&mut declarations, r.declarations.as_deref().unwrap_or(&[]));
        Ok(ChainState {
            identity: self.identity,
            signing_key: r.signing_key.clone(),
            safety: r.safety,
            homes,
            rule,
            audit,
            declarations,
            successor: match &r.successor {
                None => self.successor.clone(),
                Some(s) => s.clone(),
            },
        })
    }

    /// The state after a chain signature (F132): the next safety key
    /// committed, nothing else changed.
    pub fn sign(&self, c: &ChainSignature) -> ChainState {
        ChainState { safety: c.safety, ..self.clone() }
    }

    /// The distinct operators of the homes in effect.
    pub fn operators(&self) -> Vec<Operator> {
        operators(&self.homes, Some(&self.identity))
    }

    /// The effective home rule (rule 5's default applied).
    pub fn effective(&self) -> Effective {
        effective(&self.homes, self.rule.as_ref(), Some(&self.identity))
    }
}
