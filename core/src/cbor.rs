//! Deterministic CBOR (RFC 8949, section 4.2.1, core deterministic encoding).
//!
//! Every MOR act is encoded this way, and a verifier MUST reject any act whose
//! bytes are not in that encoding (Identity, "Encoding"). So this decoder is
//! strict: it accepts a byte string only if it is the one deterministic
//! encoding of the value it holds. In particular it rejects:
//!
//! - integer, length and tag arguments not in their shortest form;
//! - indefinite-length strings, arrays and maps;
//! - map keys that are not in bytewise lexicographic order of their
//!   encodings, and duplicate keys;
//! - floating-point values not in the shortest form that preserves the
//!   value (RFC 8949, section 4.1, preferred serialization, NaN included);
//! - text strings that are not valid UTF-8;
//! - anything that is not well-formed, and trailing bytes;
//! - any data item nested more than 128 levels below the outermost one
//!   (Envelopes validity rule 1a, F91).
//!
//! Tags and simple values are carried as they are: RFC 8949 section 4.2.1
//! puts no further constraint on them, and nor does the core.
//!
//! Checking that every text string is canonical text is a separate step
//! (`crate::text::check_value`), because it is a Text MIP rule, not a CBOR one.

use std::fmt;

/// A decoded CBOR data item.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Value {
    /// Major type 0: an unsigned integer.
    Uint(u64),
    /// Major type 1: the negative integer `-1 - n`, holding `n`.
    Nint(u64),
    /// Major type 2: a byte string.
    Bytes(Vec<u8>),
    /// Major type 3: a text string (valid UTF-8).
    Text(String),
    /// Major type 4: an array.
    Array(Vec<Value>),
    /// Major type 5: a map. After decoding, entries are in deterministic
    /// order. When encoding, entries are sorted, so any order may be given;
    /// keys must be distinct.
    Map(Vec<(Value, Value)>),
    /// Major type 6: a tagged item.
    Tag(u64, Box<Value>),
    /// Simple values 20 and 21.
    Bool(bool),
    /// Simple value 22.
    Null,
    /// Simple value 23.
    Undefined,
    /// Any other simple value (0 to 19, 32 to 255).
    Simple(u8),
    /// A floating-point number, held as the bits of an IEEE 754 double.
    /// Every half and single precision value, NaN payloads included, is
    /// exactly representable this way; the encoder picks the shortest form.
    Float(u64),
}

/// Why a byte string was rejected.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CborError {
    /// The input ended in the middle of an item.
    UnexpectedEnd,
    /// Bytes remain after the one top-level item.
    TrailingBytes,
    /// An argument (integer, length, tag number) was not in its shortest form.
    NonShortestArgument,
    /// An indefinite-length item, which deterministic encoding forbids.
    IndefiniteLength,
    /// Additional information 28 to 30, which is reserved (not well-formed).
    ReservedAdditionalInfo,
    /// A two-byte simple value below 32 (not well-formed).
    InvalidSimpleValue,
    /// A text string that is not valid UTF-8.
    InvalidUtf8,
    /// Map keys not in bytewise lexicographic order of their encodings.
    UnsortedMapKeys,
    /// The same key twice in one map.
    DuplicateMapKey,
    /// A float not in the shortest form that preserves its value.
    NonPreferredFloat,
    /// The bytes are not the one deterministic encoding of what they hold
    /// (a safety net behind the specific checks; not expected to fire).
    NotDeterministic,
    /// A data item nested more than [`MAX_DEPTH`] levels below the
    /// outermost one. Invalid for every verifier (Envelopes rule 1a, F91).
    TooDeep,
}

impl fmt::Display for CborError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            CborError::UnexpectedEnd => "input ends in the middle of an item",
            CborError::TrailingBytes => "bytes remain after the item",
            CborError::NonShortestArgument => "an argument is not in its shortest form",
            CborError::IndefiniteLength => "indefinite length is not deterministic",
            CborError::ReservedAdditionalInfo => "reserved additional information (28 to 30)",
            CborError::InvalidSimpleValue => "two-byte simple value below 32",
            CborError::InvalidUtf8 => "text string is not valid UTF-8",
            CborError::UnsortedMapKeys => "map keys are not in deterministic order",
            CborError::DuplicateMapKey => "duplicate map key",
            CborError::NonPreferredFloat => "float is not in its shortest form",
            CborError::NotDeterministic => "not the deterministic encoding of its value",
            CborError::TooDeep => "a data item is nested more than 128 levels deep",
        };
        f.write_str(s)
    }
}

impl std::error::Error for CborError {}

/// How many levels below the outermost item a data item may be nested: the
/// outermost item is at level 0, and nothing may be deeper than level 128.
/// A core rule, the same for every verifier (Envelopes rule 1a, F91); it also
/// guards every decoder's stack against hostile input.
pub const MAX_DEPTH: usize = 128;

// ---------------------------------------------------------------- encoding

/// Encode a value in deterministic CBOR.
pub fn encode(v: &Value) -> Vec<u8> {
    let mut out = Vec::new();
    encode_into(v, &mut out);
    out
}

fn head(major: u8, arg: u64, out: &mut Vec<u8>) {
    let m = major << 5;
    if arg < 24 {
        out.push(m | arg as u8);
    } else if arg <= 0xff {
        out.push(m | 24);
        out.push(arg as u8);
    } else if arg <= 0xffff {
        out.push(m | 25);
        out.extend_from_slice(&(arg as u16).to_be_bytes());
    } else if arg <= 0xffff_ffff {
        out.push(m | 26);
        out.extend_from_slice(&(arg as u32).to_be_bytes());
    } else {
        out.push(m | 27);
        out.extend_from_slice(&arg.to_be_bytes());
    }
}

fn encode_into(v: &Value, out: &mut Vec<u8>) {
    match v {
        Value::Uint(n) => head(0, *n, out),
        Value::Nint(n) => head(1, *n, out),
        Value::Bytes(b) => {
            head(2, b.len() as u64, out);
            out.extend_from_slice(b);
        }
        Value::Text(s) => {
            head(3, s.len() as u64, out);
            out.extend_from_slice(s.as_bytes());
        }
        Value::Array(items) => {
            head(4, items.len() as u64, out);
            for i in items {
                encode_into(i, out);
            }
        }
        Value::Map(entries) => {
            let mut enc: Vec<(Vec<u8>, &Value)> =
                entries.iter().map(|(k, v)| (encode(k), v)).collect();
            enc.sort_by(|a, b| a.0.cmp(&b.0));
            debug_assert!(
                enc.windows(2).all(|w| w[0].0 != w[1].0),
                "a map must not hold the same key twice"
            );
            head(5, enc.len() as u64, out);
            for (k, v) in enc {
                out.extend_from_slice(&k);
                encode_into(v, out);
            }
        }
        Value::Tag(t, inner) => {
            head(6, *t, out);
            encode_into(inner, out);
        }
        Value::Bool(false) => out.push(0xf4),
        Value::Bool(true) => out.push(0xf5),
        Value::Null => out.push(0xf6),
        Value::Undefined => out.push(0xf7),
        Value::Simple(n) => {
            if *n < 24 {
                out.push(0xe0 | n);
            } else {
                out.push(0xf8);
                out.push(*n);
            }
        }
        Value::Float(bits) => encode_float(*bits, out),
    }
}

fn encode_float(bits: u64, out: &mut Vec<u8>) {
    match f64_to_f32_exact(bits) {
        Some(b32) => match f32_to_f16_exact(b32) {
            Some(b16) => {
                out.push(0xf9);
                out.extend_from_slice(&b16.to_be_bytes());
            }
            None => {
                out.push(0xfa);
                out.extend_from_slice(&b32.to_be_bytes());
            }
        },
        None => {
            out.push(0xfb);
            out.extend_from_slice(&bits.to_be_bytes());
        }
    }
}

/// The single precision bits holding exactly this double, if there are any.
/// A NaN narrows if dropping the low significand bits loses nothing.
fn f64_to_f32_exact(bits: u64) -> Option<u32> {
    let sign = ((bits >> 63) as u32) << 31;
    let exp = ((bits >> 52) & 0x7ff) as i32;
    let mant = bits & 0x000f_ffff_ffff_ffff;
    if exp == 0x7ff {
        // Infinity or NaN.
        if mant & 0x1fff_ffff != 0 {
            return None;
        }
        return Some(sign | 0x7f80_0000 | (mant >> 29) as u32);
    }
    if exp == 0 {
        // Zero or a double subnormal, far below the single range.
        return if mant == 0 { Some(sign) } else { None };
    }
    let e = exp - 1023;
    let full = mant | (1u64 << 52); // 53 significant bits, value = full * 2^(e-52)
    if (-126..=127).contains(&e) {
        if mant & 0x1fff_ffff != 0 {
            return None;
        }
        return Some(sign | (((e + 127) as u32) << 23) | (mant >> 29) as u32);
    }
    if (-149..-126).contains(&e) {
        // A single subnormal: m * 2^-149, so m = full * 2^(e-52+149).
        let shift = (52 - 149 - e) as u32; // 30..=52
        if full & ((1u64 << shift) - 1) != 0 {
            return None;
        }
        return Some(sign | (full >> shift) as u32);
    }
    None
}

/// The half precision bits holding exactly this single, if there are any.
fn f32_to_f16_exact(bits: u32) -> Option<u16> {
    let sign = ((bits >> 31) as u16) << 15;
    let exp = ((bits >> 23) & 0xff) as i32;
    let mant = bits & 0x007f_ffff;
    if exp == 0xff {
        if mant & 0x1fff != 0 {
            return None;
        }
        return Some(sign | 0x7c00 | (mant >> 13) as u16);
    }
    if exp == 0 {
        return if mant == 0 { Some(sign) } else { None };
    }
    let e = exp - 127;
    let full = mant | (1u32 << 23);
    if (-14..=15).contains(&e) {
        if mant & 0x1fff != 0 {
            return None;
        }
        return Some(sign | (((e + 15) as u16) << 10) | (mant >> 13) as u16);
    }
    if (-24..-14).contains(&e) {
        // A half subnormal: m * 2^-24, so m = full * 2^(e-23+24).
        let shift = (-1 - e) as u32; // 14..=23
        if full & ((1u32 << shift) - 1) != 0 {
            return None;
        }
        return Some(sign | (full >> shift) as u16);
    }
    None
}

fn f16_to_f64_bits(h: u16) -> u64 {
    let sign = ((h >> 15) as u64) << 63;
    let exp = ((h >> 10) & 0x1f) as i64;
    let mant = (h & 0x3ff) as u64;
    if exp == 0x1f {
        return sign | (0x7ffu64 << 52) | (mant << 42);
    }
    if exp == 0 {
        if mant == 0 {
            return sign;
        }
        // Subnormal: mant * 2^-24, exact in a double.
        let v = mant as f64 * 2f64.powi(-24);
        return sign | v.to_bits();
    }
    sign | (((exp - 15 + 1023) as u64) << 52) | (mant << 42)
}

fn f32_to_f64_bits(b: u32) -> u64 {
    let sign = ((b >> 31) as u64) << 63;
    let exp = (b >> 23) & 0xff;
    let mant = (b & 0x007f_ffff) as u64;
    if exp == 0xff {
        // Done by hand so a NaN payload is carried over exactly.
        return sign | (0x7ffu64 << 52) | (mant << 29);
    }
    (f32::from_bits(b) as f64).to_bits()
}

// ---------------------------------------------------------------- decoding

/// Decode exactly one deterministic CBOR item, with nothing after it.
pub fn decode(bytes: &[u8]) -> Result<Value, CborError> {
    let mut d = Decoder { buf: bytes, pos: 0 };
    let v = d.item(0)?;
    if d.pos != bytes.len() {
        return Err(CborError::TrailingBytes);
    }
    // Belt and braces: the one deterministic encoding of what was read must
    // be exactly what was given. The checks above should make this hold.
    if encode(&v) != bytes {
        return Err(CborError::NotDeterministic);
    }
    Ok(v)
}

struct Decoder<'a> {
    buf: &'a [u8],
    pos: usize,
}

impl<'a> Decoder<'a> {
    fn take(&mut self, n: usize) -> Result<&'a [u8], CborError> {
        if self.buf.len() - self.pos < n {
            return Err(CborError::UnexpectedEnd);
        }
        let s = &self.buf[self.pos..self.pos + n];
        self.pos += n;
        Ok(s)
    }

    fn remaining(&self) -> usize {
        self.buf.len() - self.pos
    }

    /// Read an argument for additional information `info`, requiring the
    /// shortest form. Returns `None` for info 31 (indefinite).
    fn argument(&mut self, info: u8) -> Result<u64, CborError> {
        let (v, min) = match info {
            0..=23 => return Ok(info as u64),
            24 => (self.take(1)?[0] as u64, 24),
            25 => (
                u16::from_be_bytes(self.take(2)?.try_into().unwrap()) as u64,
                0x100,
            ),
            26 => (
                u32::from_be_bytes(self.take(4)?.try_into().unwrap()) as u64,
                0x1_0000,
            ),
            27 => (
                u64::from_be_bytes(self.take(8)?.try_into().unwrap()),
                0x1_0000_0000,
            ),
            28..=30 => return Err(CborError::ReservedAdditionalInfo),
            _ => return Err(CborError::IndefiniteLength),
        };
        if v < min {
            return Err(CborError::NonShortestArgument);
        }
        Ok(v)
    }

    fn length(&mut self, info: u8) -> Result<usize, CborError> {
        let n = self.argument(info)?;
        // Every element takes at least one byte, so a count beyond what is
        // left cannot be honest; refusing it early avoids a huge allocation.
        if n > self.remaining() as u64 {
            return Err(CborError::UnexpectedEnd);
        }
        Ok(n as usize)
    }

    fn item(&mut self, depth: usize) -> Result<Value, CborError> {
        if depth > MAX_DEPTH {
            return Err(CborError::TooDeep);
        }
        let ib = self.take(1)?[0];
        let major = ib >> 5;
        let info = ib & 0x1f;
        match major {
            0 => Ok(Value::Uint(self.argument(info)?)),
            1 => Ok(Value::Nint(self.argument(info)?)),
            2 => {
                let n = self.length(info)?;
                Ok(Value::Bytes(self.take(n)?.to_vec()))
            }
            3 => {
                let n = self.length(info)?;
                let b = self.take(n)?;
                let s = std::str::from_utf8(b).map_err(|_| CborError::InvalidUtf8)?;
                Ok(Value::Text(s.to_owned()))
            }
            4 => {
                let n = self.length(info)?;
                let mut items = Vec::with_capacity(n);
                for _ in 0..n {
                    items.push(self.item(depth + 1)?);
                }
                Ok(Value::Array(items))
            }
            5 => {
                let n = self.length(info)?;
                let mut entries = Vec::with_capacity(n);
                let mut prev_key: Option<&'a [u8]> = None;
                for _ in 0..n {
                    let start = self.pos;
                    let k = self.item(depth + 1)?;
                    let key_bytes = &self.buf[start..self.pos];
                    if let Some(p) = prev_key {
                        match p.cmp(key_bytes) {
                            std::cmp::Ordering::Less => {}
                            std::cmp::Ordering::Equal => return Err(CborError::DuplicateMapKey),
                            std::cmp::Ordering::Greater => return Err(CborError::UnsortedMapKeys),
                        }
                    }
                    prev_key = Some(key_bytes);
                    let v = self.item(depth + 1)?;
                    entries.push((k, v));
                }
                Ok(Value::Map(entries))
            }
            6 => {
                let t = self.argument(info)?;
                Ok(Value::Tag(t, Box::new(self.item(depth + 1)?)))
            }
            _ => match info {
                0..=19 => Ok(Value::Simple(info)),
                20 => Ok(Value::Bool(false)),
                21 => Ok(Value::Bool(true)),
                22 => Ok(Value::Null),
                23 => Ok(Value::Undefined),
                24 => {
                    let n = self.take(1)?[0];
                    if n < 32 {
                        return Err(CborError::InvalidSimpleValue);
                    }
                    Ok(Value::Simple(n))
                }
                25 => {
                    let h = u16::from_be_bytes(self.take(2)?.try_into().unwrap());
                    Ok(Value::Float(f16_to_f64_bits(h)))
                }
                26 => {
                    let b = u32::from_be_bytes(self.take(4)?.try_into().unwrap());
                    if f32_to_f16_exact(b).is_some() {
                        return Err(CborError::NonPreferredFloat);
                    }
                    Ok(Value::Float(f32_to_f64_bits(b)))
                }
                27 => {
                    let b = u64::from_be_bytes(self.take(8)?.try_into().unwrap());
                    if f64_to_f32_exact(b).is_some() {
                        return Err(CborError::NonPreferredFloat);
                    }
                    Ok(Value::Float(b))
                }
                28..=30 => Err(CborError::ReservedAdditionalInfo),
                _ => Err(CborError::IndefiniteLength), // 0xff "break" outside an indefinite item
            },
        }
    }
}

// ---------------------------------------------------------------- helpers

impl Value {
    /// Look up an integer key in a map.
    pub fn map_get(&self, key: u64) -> Option<&Value> {
        match self {
            Value::Map(entries) => entries
                .iter()
                .find(|(k, _)| *k == Value::Uint(key))
                .map(|(_, v)| v),
            _ => None,
        }
    }

    /// A float value, from an `f64`.
    pub fn float(x: f64) -> Value {
        Value::Float(x.to_bits())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn h(s: &str) -> Vec<u8> {
        hex::decode(s).unwrap()
    }

    #[test]
    fn rfc8949_appendix_a_examples_round_trip() {
        // A selection of RFC 8949 Appendix A examples that are in
        // deterministic encoding (preferred serialization).
        let cases: &[(&str, Value)] = &[
            ("00", Value::Uint(0)),
            ("17", Value::Uint(23)),
            ("1818", Value::Uint(24)),
            ("1903e8", Value::Uint(1000)),
            ("1b000000e8d4a51000", Value::Uint(1_000_000_000_000)),
            ("1bffffffffffffffff", Value::Uint(u64::MAX)),
            ("20", Value::Nint(0)),
            ("3863", Value::Nint(99)),
            ("f90000", Value::float(0.0)),
            ("f98000", Value::float(-0.0)),
            ("f93c00", Value::float(1.0)),
            ("fb3ff199999999999a", Value::float(1.1)),
            ("f93e00", Value::float(1.5)),
            ("f97bff", Value::float(65504.0)),
            ("fa47c35000", Value::float(100000.0)),
            ("fa7f7fffff", Value::float(3.4028234663852886e+38)),
            ("fb7e37e43c8800759c", Value::float(1.0e+300)),
            ("f90001", Value::float(5.960464477539063e-8)),
            ("f90400", Value::float(0.00006103515625)),
            ("f9c400", Value::float(-4.0)),
            ("fbc010666666666666", Value::float(-4.1)),
            ("f97c00", Value::float(f64::INFINITY)),
            ("f97e00", Value::Float(0x7ff8_0000_0000_0000)),
            ("f9fc00", Value::float(f64::NEG_INFINITY)),
            ("f4", Value::Bool(false)),
            ("f5", Value::Bool(true)),
            ("f6", Value::Null),
            ("f7", Value::Undefined),
            ("f0", Value::Simple(16)),
            ("f8ff", Value::Simple(255)),
            (
                "c11a514b67b0",
                Value::Tag(1, Box::new(Value::Uint(1363896240))),
            ),
            ("40", Value::Bytes(vec![])),
            ("4401020304", Value::Bytes(vec![1, 2, 3, 4])),
            ("60", Value::Text(String::new())),
            ("6449455446", Value::Text("IETF".into())),
            ("62c3bc", Value::Text("\u{fc}".into())),
            ("64f0908591", Value::Text("\u{10151}".into())),
            ("80", Value::Array(vec![])),
            (
                "83010203",
                Value::Array(vec![Value::Uint(1), Value::Uint(2), Value::Uint(3)]),
            ),
            ("a0", Value::Map(vec![])),
            (
                "a201020304",
                Value::Map(vec![
                    (Value::Uint(1), Value::Uint(2)),
                    (Value::Uint(3), Value::Uint(4)),
                ]),
            ),
        ];
        for (hx, v) in cases {
            assert_eq!(hex::encode(encode(v)), *hx, "encoding {v:?}");
            assert_eq!(&decode(&h(hx)).unwrap(), v, "decoding {hx}");
        }
    }

    #[test]
    fn map_keys_sorted_by_encoded_bytes() {
        // Bytewise order of encodings: 10 (0x0a) < 100 (0x1864) < -1 (0x20) < "z" (0x617a) < "aa" (0x626161).
        let m = Value::Map(vec![
            (Value::Text("aa".into()), Value::Uint(0)),
            (Value::Nint(0), Value::Uint(0)),
            (Value::Text("z".into()), Value::Uint(0)),
            (Value::Uint(100), Value::Uint(0)),
            (Value::Uint(10), Value::Uint(0)),
        ]);
        let e = encode(&m);
        assert_eq!(hex::encode(&e), "a50a001864002000617a0062616100");
        assert!(decode(&e).is_ok());
    }

    #[test]
    fn rejects_what_is_not_deterministic() {
        let bad: &[(&str, CborError)] = &[
            ("1817", CborError::NonShortestArgument),
            ("190017", CborError::NonShortestArgument),
            ("1a0000ffff", CborError::NonShortestArgument),
            ("1b00000000ffffffff", CborError::NonShortestArgument),
            ("5801ff", CborError::NonShortestArgument),
            ("5f41ff", CborError::IndefiniteLength),
            ("9f01ff", CborError::IndefiniteLength),
            ("bf0102ff", CborError::IndefiniteLength),
            ("a203040102", CborError::UnsortedMapKeys),
            ("a201020103", CborError::DuplicateMapKey),
            ("fa3f800000", CborError::NonPreferredFloat),
            ("fb3ff0000000000000", CborError::NonPreferredFloat),
            ("fb7ff8000000000000", CborError::NonPreferredFloat),
            ("fa7fc00000", CborError::NonPreferredFloat),
            ("62c328", CborError::InvalidUtf8),
            ("63eda080", CborError::InvalidUtf8), // a UTF-8 encoded surrogate
            ("f818", CborError::InvalidSimpleValue),
            ("1c", CborError::ReservedAdditionalInfo),
            ("ff", CborError::IndefiniteLength),
            ("0000", CborError::TrailingBytes),
            ("830102", CborError::UnexpectedEnd),
            ("5a00010000", CborError::UnexpectedEnd),
            ("", CborError::UnexpectedEnd),
        ];
        for (hx, e) in bad {
            assert_eq!(decode(&h(hx)), Err(*e), "input {hx}");
        }
    }

    #[test]
    fn nan_payloads_keep_their_shortest_form() {
        // A single NaN whose payload does not fit in a half stays a single.
        let v = decode(&h("fa7fc00001")).unwrap();
        assert_eq!(encode(&v), h("fa7fc00001"));
        // A double NaN whose payload fits in a single must be a single.
        assert_eq!(
            decode(&h("fb7ff8000020000000")),
            Err(CborError::NonPreferredFloat)
        );
        assert!(decode(&h("fb7ff8000000000001")).is_ok());
    }

    #[test]
    fn subnormals_narrow_exactly() {
        for bits in [0x0001u16, 0x03ff, 0x8200, 0x0400, 0x7bff] {
            let v = Value::Float(f16_to_f64_bits(bits));
            let mut want = vec![0xf9];
            want.extend_from_slice(&bits.to_be_bytes());
            assert_eq!(encode(&v), want);
            assert_eq!(decode(&want).unwrap(), v);
        }
        // Smallest single subnormal: not a half.
        let v = Value::Float(f32_to_f64_bits(1));
        assert_eq!(hex::encode(encode(&v)), "fa00000001");
        // Smallest double subnormal: a double.
        let v = Value::Float(1);
        assert_eq!(hex::encode(encode(&v)), "fb0000000000000001");
    }

    #[test]
    fn deep_nesting_is_refused_not_crashed() {
        let mut b = vec![0x81u8; 10_000];
        b.push(0x00);
        assert_eq!(decode(&b), Err(CborError::TooDeep));
    }

    #[test]
    fn nesting_limit_is_exactly_128_levels() {
        // 128 one-element arrays around a 0: the 0 is at level 128.
        let mut b = vec![0x81u8; 128];
        b.push(0x00);
        assert!(decode(&b).is_ok());
        // One more array: the 0 is at level 129.
        let mut b = vec![0x81u8; 129];
        b.push(0x00);
        assert_eq!(decode(&b), Err(CborError::TooDeep));
        // Deep data carried as a byte string is not decoded, so it is not nested.
        let mut inner = vec![0x81u8; 1000];
        inner.push(0x00);
        let mut b = vec![0x59, 0x03, 0xe9];
        b.extend_from_slice(&inner);
        assert!(decode(&b).is_ok());
    }
}
