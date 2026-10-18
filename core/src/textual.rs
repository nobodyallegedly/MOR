//! How the core's objects are written for people (Identity draft 14, part
//! three, "Written for people"; F349, decided by Nobody, allegedly, 18
//! October 2026): bech32m (BIP-350), lowercase, one label per kind of thing
//! hashed, a checksum that refuses a mistyped or cut string. A label says
//! what was hashed, not what the thing means: a collective and an agent are
//! identities (`mid`), a vow, an offer and a publication are acts (`mact`).
//! No form for any secret: signing words stay words, private keys get none.
//!
//! The where-it-lives form is the short form followed by `?r=` hints, each an
//! address hint, outside the checksum: hints guide, never decide. Bare hex
//! (64 characters, for a 32-byte hash) stays accepted.
//!
//! Written here by hand, as an independent implementation would be, and
//! checked against the `bech32` crate in the tests.

use crate::hash::Hash;

/// The kinds of object the core writes, each with its label (the
/// human-readable part).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Kind {
    /// An identity: a person's, a collective's, an agent's (its genesis act's id).
    Identity,
    /// An act, by its act id.
    Act,
    /// A public key, signing or encryption, in Identity's form `[scheme, key]`, deterministic CBOR.
    Key,
    /// A specification: a MIR, a cMIP, a Module or a MIP, by its spec hash.
    Spec,
    /// A work: the hash of a file's bytes (Envelopes, the work hash).
    Work,
}

impl Kind {
    pub const ALL: [Kind; 5] = [Kind::Identity, Kind::Act, Kind::Key, Kind::Spec, Kind::Work];

    pub fn label(self) -> &'static str {
        match self {
            Kind::Identity => "mid",
            Kind::Act => "mact",
            Kind::Key => "mkey",
            Kind::Spec => "mspec",
            Kind::Work => "mwork",
        }
    }

    /// What it is, in words, for a refusal.
    pub fn words(self) -> &'static str {
        match self {
            Kind::Identity => "an identity",
            Kind::Act => "an act",
            Kind::Key => "a public key",
            Kind::Spec => "a specification",
            Kind::Work => "a work",
        }
    }

    pub fn of_label(l: &str) -> Option<Kind> {
        Kind::ALL.into_iter().find(|k| k.label() == l)
    }

    /// A 32-byte hash (every kind but a key, whose data is `[scheme, key]`).
    pub fn is_hash(self) -> bool {
        self != Kind::Key
    }
}

/// Why a string is refused, in words a person can act on.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Refusal {
    /// Not in the textual form at all, nor bare hex.
    NotAForm(String),
    /// The checksum does not hold: a character mistyped, swapped, added or missing.
    Checksum,
    /// Upper and lower case mixed (BIP-350 refuses it).
    MixedCase,
    /// A label the core does not define (perhaps a cMIP's own).
    UnknownLabel(String),
    /// Another kind than the one wanted: `got` where `wanted` is asked.
    WrongKind { got: Kind, wanted: Kind },
    /// The data is not of its kind's length or shape (a cut string that kept a valid checksum cannot happen; a forged one can).
    Shape(String),
}

impl core::fmt::Display for Refusal {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            Refusal::NotAForm(w) => write!(f, "not a MOR identifier: {w}"),
            Refusal::Checksum => write!(f, "its checksum does not hold: a character is mistyped, missing or added (copy it again, whole)"),
            Refusal::MixedCase => write!(f, "it mixes capital and small letters: write it all in small letters"),
            Refusal::UnknownLabel(l) => write!(f, "its label “{l}” is none of the core’s (mid, mact, mkey, mspec, mwork)"),
            Refusal::WrongKind { got, wanted } => write!(f, "this is {} ({}), not {} ({})", got.words(), got.label(), wanted.words(), wanted.label()),
            Refusal::Shape(w) => write!(f, "{w}"),
        }
    }
}

const CHARSET: &[u8; 32] = b"qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32M: u32 = 0x2bc8_30a3;

fn polymod(values: impl IntoIterator<Item = u8>) -> u32 {
    const G: [u32; 5] = [0x3b6a_57b2, 0x2650_8e6d, 0x1ea1_19fa, 0x3d42_33dd, 0x2a14_62b3];
    let mut chk: u32 = 1;
    for v in values {
        let b = chk >> 25;
        chk = ((chk & 0x01ff_ffff) << 5) ^ u32::from(v);
        for (i, g) in G.iter().enumerate() {
            if (b >> i) & 1 == 1 {
                chk ^= g;
            }
        }
    }
    chk
}

fn hrp_expand(hrp: &str) -> Vec<u8> {
    let b = hrp.as_bytes();
    let mut v: Vec<u8> = b.iter().map(|c| c >> 5).collect();
    v.push(0);
    v.extend(b.iter().map(|c| c & 31));
    v
}

fn to_five(data: &[u8]) -> Vec<u8> {
    let mut out = vec![];
    let (mut acc, mut bits) = (0u32, 0u32);
    for &x in data {
        acc = (acc << 8) | u32::from(x);
        bits += 8;
        while bits >= 5 {
            bits -= 5;
            out.push(((acc >> bits) & 31) as u8);
        }
    }
    if bits > 0 {
        out.push(((acc << (5 - bits)) & 31) as u8);
    }
    out
}

fn from_five(data: &[u8]) -> Option<Vec<u8>> {
    let mut out = vec![];
    let (mut acc, mut bits) = (0u32, 0u32);
    for &x in data {
        acc = (acc << 5) | u32::from(x);
        bits += 5;
        if bits >= 8 {
            bits -= 8;
            out.push(((acc >> bits) & 0xff) as u8);
        }
    }
    // BIP-173's padding rule: at most four bits left over, all zero.
    if bits >= 5 || (acc & ((1 << bits) - 1)) != 0 {
        return None;
    }
    Some(out)
}

/// The short form of `data` under `kind`'s label: bech32m, lowercase.
pub fn encode(kind: Kind, data: &[u8]) -> String {
    encode_label(kind.label(), data)
}

/// The same form under any label: a kind a cMIP defines writes its objects
/// so, under a label of its own, never one of the core's (F349).
pub fn encode_label(hrp: &str, data: &[u8]) -> String {
    let five = to_five(data);
    let mut values = hrp_expand(hrp);
    values.extend(&five);
    values.extend([0u8; 6]);
    let pm = polymod(values) ^ BECH32M;
    let mut s = String::with_capacity(hrp.len() + 1 + five.len() + 6);
    s.push_str(hrp);
    s.push('1');
    for v in five {
        s.push(CHARSET[v as usize] as char);
    }
    for i in 0..6 {
        s.push(CHARSET[((pm >> (5 * (5 - i))) & 31) as usize] as char);
    }
    s
}

/// A 32-byte hash's short form.
pub fn encode_hash(kind: Kind, h: &Hash) -> String {
    encode(kind, h)
}

/// Decode a short form: its kind and its data. Refused, saying why, for a
/// broken checksum, mixed case, a label the core does not define, or data
/// of the wrong length for its kind. All capitals is read as small letters
/// (BIP-350), so a string read back from a QR code is accepted.
pub fn decode(s: &str) -> Result<(Kind, Vec<u8>), Refusal> {
    let has_lower = s.bytes().any(|c| c.is_ascii_lowercase());
    let has_upper = s.bytes().any(|c| c.is_ascii_uppercase());
    if has_lower && has_upper {
        return Err(Refusal::MixedCase);
    }
    let s = s.to_ascii_lowercase();
    let Some(sep) = s.rfind('1') else { return Err(Refusal::NotAForm("it has no separator “1”".into())) };
    let (hrp, rest) = (&s[..sep], &s[sep + 1..]);
    if hrp.is_empty() || rest.len() < 6 || s.bytes().any(|c| !(33..=126).contains(&c)) {
        return Err(Refusal::NotAForm("it is not in the textual form".into()));
    }
    let mut five = Vec::with_capacity(rest.len());
    for c in rest.bytes() {
        match CHARSET.iter().position(|&x| x == c) {
            Some(p) => five.push(p as u8),
            None => return Err(Refusal::Checksum),
        }
    }
    let mut values = hrp_expand(hrp);
    values.extend(&five);
    if polymod(values) != BECH32M {
        return Err(Refusal::Checksum);
    }
    let kind = Kind::of_label(hrp).ok_or_else(|| Refusal::UnknownLabel(hrp.into()))?;
    let data = from_five(&five[..five.len() - 6]).ok_or(Refusal::Checksum)?;
    if kind.is_hash() && data.len() != 32 {
        return Err(Refusal::Shape(format!("{} is a 32-byte hash; this carries {} bytes", kind.words(), data.len())));
    }
    if kind == Kind::Key {
        check_key(&data)?;
    }
    Ok((kind, data))
}

/// A key's data: Identity's `[scheme, key]`, deterministic CBOR, the scheme a founding number or a spec hash.
fn check_key(data: &[u8]) -> Result<(), Refusal> {
    use crate::cbor::{decode as cbor, encode as enc, Value};
    let bad = || Refusal::Shape("a key is written as Identity’s [scheme, key], in deterministic CBOR".into());
    let v = cbor(data).map_err(|_| bad())?;
    if enc(&v) != data {
        return Err(bad());
    }
    match v {
        Value::Array(a) if a.len() == 2 => match (&a[0], &a[1]) {
            (Value::Uint(_), Value::Bytes(_)) => Ok(()),
            (Value::Bytes(h), Value::Bytes(_)) if h.len() == 32 => Ok(()),
            _ => Err(bad()),
        },
        _ => Err(bad()),
    }
}

/// Read a string where `want` is asked: its short form, its where-it-lives
/// form (hints after `?r=`), or bare hex (a 32-byte hash, 64 characters).
/// Spaces at either end are ignored. A string of another kind is refused,
/// naming both kinds.
pub fn read(s: &str, want: Kind) -> Result<Read, Refusal> {
    let s = s.trim();
    let (head, hints) = match s.find('?') {
        Some(q) => (&s[..q], hints_of(&s[q + 1..])),
        None => (s, vec![]),
    };
    if want.is_hash() && head.len() == 64 && head.bytes().all(|c| c.is_ascii_hexdigit()) {
        let mut h = [0u8; 32];
        for (i, b) in h.iter_mut().enumerate() {
            *b = u8::from_str_radix(&head[2 * i..2 * i + 2], 16).map_err(|_| Refusal::NotAForm("not hexadecimal".into()))?;
        }
        return Ok(Read { kind: want, data: h.to_vec(), hints, bare: true });
    }
    let (kind, data) = decode(head)?;
    if kind != want {
        return Err(Refusal::WrongKind { got: kind, wanted: want });
    }
    Ok(Read { kind, data, hints, bare: false })
}

/// What was read: its kind, its data, the hints it carried, and whether it was bare hex.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Read {
    pub kind: Kind,
    pub data: Vec<u8>,
    pub hints: Vec<String>,
    pub bare: bool,
}

/// The where-it-lives form: the short form, then each hint as `r=`, percent-encoded where it must be.
pub fn with_hints(kind: Kind, data: &[u8], hints: &[&str]) -> String {
    let mut s = encode(kind, data);
    for (i, h) in hints.iter().enumerate() {
        s.push(if i == 0 { '?' } else { '&' });
        s.push_str("r=");
        s.push_str(&percent(h));
    }
    s
}

/// RFC 3986's unreserved characters and the few a base address needs (`:`, `/`), the rest percent-encoded.
fn percent(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || b"-._~:/".contains(&b) {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

fn unpercent(s: &str) -> Option<String> {
    let b = s.as_bytes();
    let mut out = vec![];
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let h = s.get(i + 1..i + 3)?;
            out.push(u8::from_str_radix(h, 16).ok()?);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).ok()
}

/// The hints after `?`: each `r=` value, decoded; anything else ignored (hints guide, never decide).
fn hints_of(q: &str) -> Vec<String> {
    let mut out: Vec<String> = vec![];
    for part in q.split('&') {
        if let Some(v) = part.strip_prefix("r=") {
            if let Some(h) = unpercent(v) {
                if !h.is_empty() && !out.contains(&h) {
                    out.push(h);
                }
            }
        }
    }
    out
}
