//! The messages of the relay transport cMIP (draft 1), encoded and decoded
//! strictly: deterministic CBOR, closed maps with small integer keys,
//! canonical text (cMIP, "Encoding").
//!
//! A message with a key the cMIP does not define is malformed. Items (acts,
//! sealed containers, media) travel as byte strings, exactly as received.

use mor_core::act::Scheme;
use mor_core::cbor::{self, Value};
use mor_core::hash::{tagged_hash, Hash};
use mor_core::sig::scheme_bytes;
use mor_core::text;
use std::fmt;

/// Tags this cMIP defines.
pub mod tag {
    /// The sealed id: `tagged_hash("MOR/transport/sealed", bytes)`.
    pub const SEALED: &str = "MOR/transport/sealed";
    /// The pickup tag: `tagged_hash("MOR/transport/pickup", scheme || key)`.
    pub const PICKUP: &str = "MOR/transport/pickup";
}

/// The name of a sealed container, which is not an act and has no act id.
pub fn sealed_id(bytes: &[u8]) -> Hash {
    tagged_hash(tag::SEALED, bytes)
}

/// The pickup tag of a bare key `[scheme, key]`.
pub fn pickup_tag(scheme: &Scheme, key: &[u8]) -> Hash {
    let mut b = scheme_bytes(scheme);
    b.extend_from_slice(key);
    tagged_hash(tag::PICKUP, &b)
}

// ---------------------------------------------------------------- errors

/// The error codes of the cMIP ("Errors").
pub mod code {
    pub const MALFORMED: u64 = 0;
    pub const INVALID: u64 = 1;
    pub const NOT_SERVED: u64 = 2;
    pub const MISSING_PREDECESSOR: u64 = 3;
    pub const CONFLICT: u64 = 4;
    pub const REFUSED: u64 = 5;
    pub const TOO_LARGE: u64 = 6;
    pub const NOT_ACCEPTED: u64 = 7;
    pub const NOT_HELD: u64 = 8;
    pub const NOT_SUPPORTED: u64 = 9;
    pub const SLOW_DOWN: u64 = 10;
}

/// An error answer: a code, a plain-text reason, and acts that explain it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WireError {
    pub code: u64,
    pub reason: Option<String>,
    /// Code 4: the rotation this home holds, and its receipt for it.
    pub acts: Vec<Vec<u8>>,
}

impl WireError {
    pub fn new(code: u64, reason: impl Into<String>) -> Self {
        WireError {
            code,
            reason: Some(reason.into()),
            acts: vec![],
        }
    }

    pub fn malformed(reason: impl Into<String>) -> Self {
        Self::new(code::MALFORMED, reason)
    }

    pub fn invalid(reason: impl Into<String>) -> Self {
        Self::new(code::INVALID, reason)
    }

    pub fn not_held() -> Self {
        Self::new(code::NOT_HELD, "not held here (this proves nothing)")
    }

    /// The HTTP status this implementation answers with. The cMIP leaves the
    /// mapping open ("Open technical parameters"); clients read the code in
    /// the body, never the status.
    pub fn http_status(&self) -> u16 {
        match self.code {
            code::MALFORMED => 400,
            code::INVALID => 422,
            code::NOT_SERVED | code::NOT_HELD => 404,
            code::MISSING_PREDECESSOR | code::CONFLICT => 409,
            code::REFUSED | code::NOT_ACCEPTED => 403,
            code::TOO_LARGE => 413,
            code::NOT_SUPPORTED => 501,
            code::SLOW_DOWN => 429,
            _ => 500,
        }
    }

    pub fn to_value(&self) -> Value {
        let mut m = vec![(Value::Uint(0), Value::Uint(self.code))];
        if let Some(r) = &self.reason {
            m.push((Value::Uint(1), Value::Text(r.clone())));
        }
        if !self.acts.is_empty() {
            m.push((Value::Uint(2), bstrs(&self.acts)));
        }
        Value::Map(m)
    }

    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&self.to_value())
    }

    pub fn decode(bytes: &[u8]) -> Result<Self, Malformed> {
        let v = decode(bytes)?;
        let f = fields(&v, 3)?;
        Ok(WireError {
            code: uint(req(&f, 0)?)?,
            reason: get(&f, 1).map(text_of).transpose()?,
            acts: get(&f, 2)
                .map(|v| bytes_list(v, true))
                .transpose()?
                .unwrap_or_default(),
        })
    }
}

impl fmt::Display for WireError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "error {}", self.code)?;
        if let Some(r) = &self.reason {
            write!(f, ": {r}")?;
        }
        Ok(())
    }
}

impl std::error::Error for WireError {}

/// A message that is not a message of this cMIP.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Malformed(pub String);

impl fmt::Display for Malformed {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "malformed: {}", self.0)
    }
}

impl std::error::Error for Malformed {}

impl From<Malformed> for WireError {
    fn from(m: Malformed) -> Self {
        WireError::malformed(m.0)
    }
}

type R<T> = Result<T, Malformed>;

fn bad<T>(what: &str) -> R<T> {
    Err(Malformed(what.to_string()))
}

// ---------------------------------------------------------------- helpers

/// Decode a message: deterministic CBOR with canonical text throughout.
pub fn decode(bytes: &[u8]) -> R<Value> {
    let v = cbor::decode(bytes).map_err(|e| Malformed(e.to_string()))?;
    text::check_value(&v).map_err(|e| Malformed(e.to_string()))?;
    Ok(v)
}

/// The entries of a closed map whose keys are all below `n`.
fn fields(v: &Value, n: u64) -> R<Vec<(u64, &Value)>> {
    let Value::Map(m) = v else {
        return bad("expected a map");
    };
    m.iter()
        .map(|(k, v)| match k {
            Value::Uint(k) if *k < n => Ok((*k, v)),
            _ => bad("a key this cMIP does not define"),
        })
        .collect()
}

fn get<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

fn req<'a>(f: &[(u64, &'a Value)], k: u64) -> R<&'a Value> {
    get(f, k).ok_or_else(|| Malformed(format!("key {k} missing")))
}

fn uint(v: &Value) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => bad("expected an unsigned integer"),
    }
}

fn hash(v: &Value) -> R<Hash> {
    match v {
        Value::Bytes(b) => b
            .as_slice()
            .try_into()
            .map_err(|_| Malformed("expected a 32-byte hash".into())),
        _ => bad("expected a hash"),
    }
}

fn bytes_of(v: &Value) -> R<Vec<u8>> {
    match v {
        Value::Bytes(b) => Ok(b.clone()),
        _ => bad("expected a byte string"),
    }
}

fn text_of(v: &Value) -> R<String> {
    match v {
        Value::Text(t) => Ok(t.clone()),
        _ => bad("expected a text string"),
    }
}

fn array(v: &Value, non_empty: bool) -> R<&[Value]> {
    match v {
        Value::Array(a) if !(non_empty && a.is_empty()) => Ok(a),
        Value::Array(_) => bad("an empty array where one item at least is required"),
        _ => bad("expected an array"),
    }
}

fn bytes_list(v: &Value, non_empty: bool) -> R<Vec<Vec<u8>>> {
    array(v, non_empty)?.iter().map(bytes_of).collect()
}

fn hash_list(v: &Value, non_empty: bool) -> R<Vec<Hash>> {
    array(v, non_empty)?.iter().map(hash).collect()
}

fn text_list(v: &Value, non_empty: bool) -> R<Vec<String>> {
    array(v, non_empty)?.iter().map(text_of).collect()
}

pub fn bstrs(items: &[Vec<u8>]) -> Value {
    Value::Array(items.iter().map(|b| Value::Bytes(b.clone())).collect())
}

pub fn hashes(items: &[Hash]) -> Value {
    Value::Array(items.iter().map(|h| Value::Bytes(h.to_vec())).collect())
}

fn put(m: &mut Vec<(Value, Value)>, k: u64, v: Value) {
    m.push((Value::Uint(k), v));
}

/// A hash as the cMIP writes it in a URL: 64 lowercase hexadecimal characters.
pub fn hex(h: &Hash) -> String {
    h.iter().map(|b| format!("{b:02x}")).collect()
}

/// Parse a hash written in a URL. Uppercase is refused, as the cMIP fixes lowercase.
pub fn parse_hex(s: &str) -> Option<Hash> {
    if s.len() != 64
        || !s
            .bytes()
            .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
    {
        return None;
    }
    let mut h = [0u8; 32];
    for (i, b) in h.iter_mut().enumerate() {
        *b = u8::from_str_radix(&s[2 * i..2 * i + 2], 16).ok()?;
    }
    Some(h)
}

// ---------------------------------------------------------------- discovery

/// `limits`: what a relay accepts and returns.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Limits {
    /// Largest act or sealed container accepted, in bytes.
    pub act: u64,
    /// Largest media object accepted, in bytes.
    pub media: u64,
    /// Most items returned by one feed request.
    pub feed: u64,
    /// Longest wait a feed request may ask for, in seconds.
    pub wait: u64,
}

impl Default for Limits {
    /// A rotation under scheme 3 is over 17 KB; 256 KiB leaves room for
    /// any act the MIPs define today.
    fn default() -> Self {
        Limits {
            act: 256 * 1024,
            media: 64 * 1024 * 1024,
            feed: 500,
            wait: 60,
        }
    }
}

impl Limits {
    fn to_value(self) -> Value {
        Value::Map(vec![
            (Value::Uint(0), Value::Uint(self.act)),
            (Value::Uint(1), Value::Uint(self.media)),
            (Value::Uint(2), Value::Uint(self.feed)),
            (Value::Uint(3), Value::Uint(self.wait)),
        ])
    }

    fn from_value(v: &Value) -> R<Self> {
        let f = fields(v, 4)?;
        Ok(Limits {
            act: uint(req(&f, 0)?)?,
            media: uint(req(&f, 1)?)?,
            feed: uint(req(&f, 2)?)?,
            wait: uint(req(&f, 3)?)?,
        })
    }
}

/// Roles a relay declares in `info`.
pub mod role {
    pub const RELAY: u64 = 0;
    pub const HOME: u64 = 1;
    pub const INBOX: u64 = 2;
}

/// `info`: everything in it is a hint.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Info {
    pub operator: Option<Hash>,
    pub bases: Vec<String>,
    pub roles: Vec<u64>,
    pub limits: Limits,
    pub policy: Option<String>,
}

impl Info {
    pub fn encode(&self) -> Vec<u8> {
        let mut m = Vec::new();
        put(
            &mut m,
            0,
            self.operator
                .map(|h| Value::Bytes(h.to_vec()))
                .unwrap_or(Value::Null),
        );
        put(
            &mut m,
            1,
            Value::Array(self.bases.iter().cloned().map(Value::Text).collect()),
        );
        put(
            &mut m,
            2,
            Value::Array(self.roles.iter().map(|r| Value::Uint(*r)).collect()),
        );
        put(&mut m, 3, self.limits.to_value());
        if let Some(p) = &self.policy {
            put(&mut m, 4, Value::Text(p.clone()));
        }
        cbor::encode(&Value::Map(m))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 5)?;
        let op = req(&f, 0)?;
        Ok(Info {
            operator: if matches!(op, Value::Null) {
                None
            } else {
                Some(hash(op)?)
            },
            bases: text_list(req(&f, 1)?, true)?,
            roles: array(req(&f, 2)?, true)?
                .iter()
                .map(uint)
                .collect::<R<_>>()?,
            limits: Limits::from_value(req(&f, 3)?)?,
            policy: get(&f, 4).map(text_of).transpose()?,
        })
    }
}

// ---------------------------------------------------------------- publishing

/// `put-result`: the answer to a publication.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PutResult {
    /// The act id, or the sealed id.
    pub id: Hash,
    /// Its arrival number at this relay.
    pub arrival: u64,
    /// Home only: the receipt it signed.
    pub receipt: Option<Vec<u8>>,
    /// Home only: the objection it signed.
    pub objection: Option<Vec<u8>>,
}

impl PutResult {
    pub fn encode(&self) -> Vec<u8> {
        let mut m = Vec::new();
        put(&mut m, 0, Value::Bytes(self.id.to_vec()));
        put(&mut m, 1, Value::Uint(self.arrival));
        if let Some(r) = &self.receipt {
            put(&mut m, 2, Value::Bytes(r.clone()));
        }
        if let Some(o) = &self.objection {
            put(&mut m, 3, Value::Bytes(o.clone()));
        }
        cbor::encode(&Value::Map(m))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 4)?;
        Ok(PutResult {
            id: hash(req(&f, 0)?)?,
            arrival: uint(req(&f, 1)?)?,
            receipt: get(&f, 2).map(bytes_of).transpose()?,
            objection: get(&f, 3).map(bytes_of).transpose()?,
        })
    }
}

/// `put-sealed`: a sealed container, and pickup tags for a bare key.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PutSealed {
    pub sealed: Vec<u8>,
    pub pickup: Vec<Hash>,
}

impl PutSealed {
    pub fn encode(&self) -> Vec<u8> {
        let mut m = Vec::new();
        put(&mut m, 0, Value::Bytes(self.sealed.clone()));
        if !self.pickup.is_empty() {
            put(&mut m, 1, hashes(&self.pickup));
        }
        cbor::encode(&Value::Map(m))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 2)?;
        Ok(PutSealed {
            sealed: bytes_of(req(&f, 0)?)?,
            pickup: get(&f, 1)
                .map(|v| hash_list(v, true))
                .transpose()?
                .unwrap_or_default(),
        })
    }
}

/// A sealed container, as far as a relay reads it (Envelope):
/// `[ to: [* hash], one-time-key: bstr, locked-act: bstr, sig: bstr ]`.
/// The relay checks the shape only; the container is opaque.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Sealed {
    pub to: Vec<Hash>,
    pub one_time_key: Vec<u8>,
    pub locked_act: Vec<u8>,
    pub sig: Vec<u8>,
}

impl Sealed {
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&Value::Array(vec![
            hashes(&self.to),
            Value::Bytes(self.one_time_key.clone()),
            Value::Bytes(self.locked_act.clone()),
            Value::Bytes(self.sig.clone()),
        ]))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let a = array(&v, true)?;
        if a.len() != 4 {
            return bad("a sealed container is [to, one-time-key, locked-act, sig]");
        }
        Ok(Sealed {
            to: hash_list(&a[0], false)?,
            one_time_key: bytes_of(&a[1])?,
            locked_act: bytes_of(&a[2])?,
            sig: bytes_of(&a[3])?,
        })
    }
}

/// The answer to a media upload: `[ locked-hash, size ]`.
pub fn encode_media_result(locked_hash: &Hash, size: u64) -> Vec<u8> {
    cbor::encode(&Value::Array(vec![
        Value::Bytes(locked_hash.to_vec()),
        Value::Uint(size),
    ]))
}

pub fn decode_media_result(bytes: &[u8]) -> R<(Hash, u64)> {
    let v = decode(bytes)?;
    let a = array(&v, true)?;
    if a.len() != 2 {
        return bad("a media result is [locked-hash, size]");
    }
    Ok((hash(&a[0])?, uint(&a[1])?))
}

// ---------------------------------------------------------------- fetching

/// `[+ hash]`, the body of a batch fetch.
pub fn encode_ids(ids: &[Hash]) -> Vec<u8> {
    cbor::encode(&hashes(ids))
}

pub fn decode_ids(bytes: &[u8]) -> R<Vec<Hash>> {
    hash_list(&decode(bytes)?, true)
}

/// `[* bstr / null]`, the answer to a batch fetch.
pub fn encode_maybe_items(items: &[Option<Vec<u8>>]) -> Vec<u8> {
    cbor::encode(&Value::Array(
        items
            .iter()
            .map(|i| {
                i.as_ref()
                    .map(|b| Value::Bytes(b.clone()))
                    .unwrap_or(Value::Null)
            })
            .collect(),
    ))
}

pub fn decode_maybe_items(bytes: &[u8]) -> R<Vec<Option<Vec<u8>>>> {
    array(&decode(bytes)?, false)?
        .iter()
        .map(|v| match v {
            Value::Null => Ok(None),
            v => bytes_of(v).map(Some),
        })
        .collect()
}

/// `[* bstr]`: acts, as a probe answers.
pub fn encode_items(items: &[Vec<u8>]) -> Vec<u8> {
    cbor::encode(&bstrs(items))
}

pub fn decode_items(bytes: &[u8]) -> R<Vec<Vec<u8>>> {
    bytes_list(&decode(bytes)?, false)
}

/// `[* hash]`: an inclusion or consistency proof.
pub fn encode_proof(p: &[Hash]) -> Vec<u8> {
    cbor::encode(&hashes(p))
}

pub fn decode_proof(bytes: &[u8]) -> R<Vec<Hash>> {
    hash_list(&decode(bytes)?, false)
}

/// Kind of a feed item.
pub mod kind {
    pub const ACT: u64 = 0;
    pub const SEALED: u64 = 1;
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FeedItem {
    pub arrival: u64,
    pub kind: u64,
    pub item: Vec<u8>,
}

/// `feed-page`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct FeedPage {
    pub items: Vec<FeedItem>,
    /// The arrival number to pass as `after` next time.
    pub next: u64,
}

impl FeedPage {
    pub fn encode(&self) -> Vec<u8> {
        let items = self
            .items
            .iter()
            .map(|i| {
                Value::Array(vec![
                    Value::Uint(i.arrival),
                    Value::Uint(i.kind),
                    Value::Bytes(i.item.clone()),
                ])
            })
            .collect();
        cbor::encode(&Value::Map(vec![
            (Value::Uint(0), Value::Array(items)),
            (Value::Uint(1), Value::Uint(self.next)),
        ]))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 2)?;
        let items = array(req(&f, 0)?, false)?
            .iter()
            .map(|i| {
                let a = array(i, true)?;
                if a.len() != 3 {
                    return bad("a feed item is [arrival, kind, item]");
                }
                let kind = uint(&a[1])?;
                if kind > 1 {
                    return bad("a feed item's kind is 0 or 1");
                }
                Ok(FeedItem {
                    arrival: uint(&a[0])?,
                    kind,
                    item: bytes_of(&a[2])?,
                })
            })
            .collect::<R<_>>()?;
        Ok(FeedPage {
            items,
            next: uint(req(&f, 1)?)?,
        })
    }
}

// ---------------------------------------------------------------- homes

/// Parts of an identity record, by number.
pub mod part {
    pub const CHAIN: u64 = 1;
    pub const RECEIPTS: u64 = 2;
    pub const ROUTES: u64 = 3;
    pub const ENCRYPTION_KEY: u64 = 4;
    pub const NAMES: u64 = 5;
    pub const LINKS: u64 = 6;
    pub const EVIDENCE: u64 = 7;
    pub const OTHER_RECEIPTS: u64 = 8;
    pub const PROOFS: u64 = 9;
    pub const CARRIED: u64 = 10;
    pub const ALL: [u64; 10] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}

/// `inclusion = [ summary: hash, receipt: hash, index: uint, path: [* hash] ]`:
/// an inclusion proof that anyone may carry (F101). It is checked against
/// the signed log summary it names, so it needs no trust.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Inclusion {
    pub summary: Hash,
    pub receipt: Hash,
    pub index: u64,
    pub path: Vec<Hash>,
}

impl Inclusion {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            Value::Bytes(self.summary.to_vec()),
            Value::Bytes(self.receipt.to_vec()),
            Value::Uint(self.index),
            hashes(&self.path),
        ])
    }

    pub fn from_value(v: &Value) -> R<Self> {
        let a = array(v, true)?;
        if a.len() != 4 {
            return bad("an inclusion proof is [summary, receipt, index, path]");
        }
        Ok(Inclusion {
            summary: hash(&a[0])?,
            receipt: hash(&a[1])?,
            index: uint(&a[2])?,
            path: hash_list(&a[3], false)?,
        })
    }

    fn list(v: &Value) -> R<Vec<Self>> {
        array(v, false)?.iter().map(Self::from_value).collect()
    }

    /// `[* inclusion]`, the body of `POST /proofs`.
    pub fn encode_list(items: &[Inclusion]) -> Vec<u8> {
        cbor::encode(&Value::Array(items.iter().map(|i| i.to_value()).collect()))
    }

    pub fn decode_list(bytes: &[u8]) -> R<Vec<Self>> {
        Self::list(&decode(bytes)?)
    }
}

/// `identity-record`. An empty part is absent: the home holds nothing of
/// that kind, which proves nothing.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct IdentityRecord {
    pub identity: Hash,
    /// Genesis and every rotation the home holds as this identity's, in position order.
    pub chain: Vec<Vec<u8>>,
    /// This home's receipts for those acts.
    pub receipts: Vec<Vec<u8>>,
    /// The whole routes chain, every branch.
    pub routes: Vec<Vec<u8>>,
    /// The whole encryption-key chain, every branch.
    pub encryption_keys: Vec<Vec<u8>>,
    /// Names and name withdrawals.
    pub names: Vec<Vec<u8>>,
    /// Public link claims, confirmations and terminations.
    pub links: Vec<Vec<u8>>,
    /// Objections, refused homeless rotations, escape endorsements, absence
    /// statements, cosignatures.
    pub evidence: Vec<Vec<u8>>,
    /// Other homes' receipts for this identity's chain acts.
    pub other_receipts: Vec<Vec<u8>>,
    /// Carried inclusion proofs for other homes' receipts (F101).
    pub proofs: Vec<Inclusion>,
    /// The acts those proofs rest on: the log summaries they name, the
    /// cosignatures of those summaries, and their signers' chain acts.
    pub carried: Vec<Vec<u8>>,
}

impl IdentityRecord {
    fn parts(&self) -> [(u64, &Vec<Vec<u8>>); 9] {
        [
            (1, &self.chain),
            (2, &self.receipts),
            (3, &self.routes),
            (4, &self.encryption_keys),
            (5, &self.names),
            (6, &self.links),
            (7, &self.evidence),
            (8, &self.other_receipts),
            (10, &self.carried),
        ]
    }

    pub fn encode(&self) -> Vec<u8> {
        let mut m = vec![(Value::Uint(0), Value::Bytes(self.identity.to_vec()))];
        for (k, items) in self.parts() {
            if !items.is_empty() {
                put(&mut m, k, bstrs(items));
            }
        }
        if !self.proofs.is_empty() {
            put(
                &mut m,
                9,
                Value::Array(self.proofs.iter().map(|i| i.to_value()).collect()),
            );
        }
        // Keys in ascending order, as deterministic CBOR requires.
        m.sort_by_key(|(k, _)| match k {
            Value::Uint(n) => *n,
            _ => u64::MAX,
        });
        cbor::encode(&Value::Map(m))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 11)?;
        let part = |k: u64| -> R<Vec<Vec<u8>>> {
            // Part 1 is `[+ bstr]`; the others `[* bstr]`.
            get(&f, k)
                .map(|v| bytes_list(v, k == 1))
                .transpose()
                .map(Option::unwrap_or_default)
        };
        Ok(IdentityRecord {
            identity: hash(req(&f, 0)?)?,
            chain: part(1)?,
            receipts: part(2)?,
            routes: part(3)?,
            encryption_keys: part(4)?,
            names: part(5)?,
            links: part(6)?,
            evidence: part(7)?,
            other_receipts: part(8)?,
            proofs: get(&f, 9)
                .map(Inclusion::list)
                .transpose()?
                .unwrap_or_default(),
            carried: part(10)?,
        })
    }

    /// Every act in the record, in part order.
    pub fn all_acts(&self) -> Vec<Vec<u8>> {
        self.parts()
            .iter()
            .flat_map(|(_, p)| p.iter().cloned())
            .collect()
    }
}

/// `[ summary: bstr, cosignatures: [* bstr] ]`.
pub fn encode_summary(summary: &[u8], cosignatures: &[Vec<u8>]) -> Vec<u8> {
    cbor::encode(&Value::Array(vec![
        Value::Bytes(summary.to_vec()),
        bstrs(cosignatures),
    ]))
}

pub fn decode_summary(bytes: &[u8]) -> R<(Vec<u8>, Vec<Vec<u8>>)> {
    let v = decode(bytes)?;
    let a = array(&v, true)?;
    if a.len() != 2 {
        return bad("a summary answer is [summary, cosignatures]");
    }
    Ok((bytes_of(&a[0])?, bytes_list(&a[1], false)?))
}

// ---------------------------------------------------------------- reaching a home

/// `probe`: a homeless rotation, and the base addresses of the old home to try.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Probe {
    pub rotation: Vec<u8>,
    pub addresses: Vec<String>,
}

impl Probe {
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&Value::Map(vec![
            (Value::Uint(0), Value::Bytes(self.rotation.clone())),
            (
                Value::Uint(1),
                Value::Array(self.addresses.iter().cloned().map(Value::Text).collect()),
            ),
        ]))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 2)?;
        Ok(Probe {
            rotation: bytes_of(req(&f, 0)?)?,
            addresses: text_list(req(&f, 1)?, true)?,
        })
    }
}

/// A bundle: acts (and sealed containers) in a file, so evidence can cross
/// a border by any means. Media type `application/cbor`, file name `.mor`.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Bundle {
    pub acts: Vec<Vec<u8>>,
    pub sealed: Vec<Vec<u8>>,
    /// Carried inclusion proofs (F101).
    pub proofs: Vec<Inclusion>,
}

impl Bundle {
    pub fn encode(&self) -> Vec<u8> {
        let mut m = vec![(Value::Uint(0), bstrs(&self.acts))];
        if !self.sealed.is_empty() {
            put(&mut m, 1, bstrs(&self.sealed));
        }
        if !self.proofs.is_empty() {
            put(
                &mut m,
                2,
                Value::Array(self.proofs.iter().map(|i| i.to_value()).collect()),
            );
        }
        cbor::encode(&Value::Map(m))
    }

    pub fn decode(bytes: &[u8]) -> R<Self> {
        let v = decode(bytes)?;
        let f = fields(&v, 3)?;
        Ok(Bundle {
            proofs: get(&f, 2)
                .map(Inclusion::list)
                .transpose()?
                .unwrap_or_default(),
            acts: bytes_list(req(&f, 0)?, true)?,
            sealed: get(&f, 1)
                .map(|v| bytes_list(v, true))
                .transpose()?
                .unwrap_or_default(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hex_round_trip_and_lowercase_only() {
        let h = [0xabu8; 32];
        assert_eq!(parse_hex(&hex(&h)), Some(h));
        assert_eq!(parse_hex(&hex(&h).to_uppercase()), None);
        assert_eq!(parse_hex("ab"), None);
    }

    #[test]
    fn closed_maps() {
        let r = PutResult {
            id: [1; 32],
            arrival: 7,
            receipt: None,
            objection: None,
        };
        assert_eq!(PutResult::decode(&r.encode()).unwrap(), r);
        // A key the cMIP does not define makes the message malformed.
        let extra = cbor::encode(&Value::Map(vec![
            (Value::Uint(0), Value::Bytes(vec![1; 32])),
            (Value::Uint(1), Value::Uint(7)),
            (Value::Uint(9), Value::Uint(0)),
        ]));
        assert!(PutResult::decode(&extra).is_err());
    }

    #[test]
    fn identity_record_needs_a_chain_when_part_one_is_present() {
        let empty_chain = cbor::encode(&Value::Map(vec![
            (Value::Uint(0), Value::Bytes(vec![1; 32])),
            (Value::Uint(1), Value::Array(vec![])),
        ]));
        assert!(IdentityRecord::decode(&empty_chain).is_err());
        let rec = IdentityRecord {
            identity: [2; 32],
            chain: vec![vec![1]],
            ..Default::default()
        };
        assert_eq!(IdentityRecord::decode(&rec.encode()).unwrap(), rec);
    }
}
