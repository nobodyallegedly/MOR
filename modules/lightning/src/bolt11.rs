//! BOLT 11 invoices: decoding, and recovering the key that signed one.
//!
//! Written from the BOLT 11 text, strictly where the Module needs it (the
//! amount, the payment hash, the description hash, the payee's node key, the
//! feature bits), and checked in the tests against a second, independent
//! decoder (`lightning-invoice`) and against lnd's own.

use k256::ecdsa::{RecoveryId, Signature, VerifyingKey};
use sha2::{Digest, Sha256};

/// The Bitcoin network an invoice's prefix names.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Network {
    Mainnet,
    Testnet,
    Signet,
    Regtest,
}

impl Network {
    pub fn number(self) -> u64 {
        match self {
            Network::Mainnet => 0,
            Network::Testnet => 1,
            Network::Signet => 2,
            Network::Regtest => 3,
        }
    }

    pub fn from_number(n: u64) -> Option<Self> {
        Some(match n {
            0 => Network::Mainnet,
            1 => Network::Testnet,
            2 => Network::Signet,
            3 => Network::Regtest,
            _ => return None,
        })
    }

    fn prefix(self) -> &'static str {
        match self {
            Network::Mainnet => "lnbc",
            Network::Testnet => "lntb",
            Network::Signet => "lntbs",
            Network::Regtest => "lnbcrt",
        }
    }
}

/// A decoded invoice: the fields the Module reads.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Invoice {
    pub network: Network,
    /// In millisatoshis; `None` for an invoice without an amount.
    pub amount_msat: Option<u64>,
    pub timestamp: u64,
    pub payment_hash: [u8; 32],
    pub description_hash: Option<[u8; 32]>,
    /// A plain description, which the Module never accepts.
    pub has_description: bool,
    /// The node key that signed the invoice, recovered from its signature
    /// (and equal to the `n` field where the invoice carries one).
    pub node: [u8; 33],
    /// Feature bits, lowest bit first.
    pub features: Vec<bool>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Bolt11Error {
    /// Not a BOLT 11 invoice, or broken: names why.
    Malformed(&'static str),
    /// The signature does not recover a key, or not the one in `n`.
    Signature,
}

const CHARSET: &[u8; 32] = b"qpzry9x8gf2tvdw0s3jn54khce6mua7l";

fn polymod(values: &[u8]) -> u32 {
    const GEN: [u32; 5] = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let mut chk: u32 = 1;
    for v in values {
        let b = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ (*v as u32);
        for (i, g) in GEN.iter().enumerate() {
            if (b >> i) & 1 == 1 {
                chk ^= g;
            }
        }
    }
    chk
}

fn hrp_expand(hrp: &[u8]) -> Vec<u8> {
    let mut v: Vec<u8> = hrp.iter().map(|c| c >> 5).collect();
    v.push(0);
    v.extend(hrp.iter().map(|c| c & 31));
    v
}

/// 5-bit words to bytes, the last partial byte padded with zero bits.
fn to_bytes_padded(words: &[u8]) -> Vec<u8> {
    let mut out = Vec::new();
    let (mut acc, mut bits) = (0u32, 0u32);
    for w in words {
        acc = (acc << 5) | *w as u32;
        bits += 5;
        while bits >= 8 {
            bits -= 8;
            out.push((acc >> bits) as u8);
            acc &= (1 << bits) - 1;
        }
    }
    if bits > 0 {
        out.push((acc << (8 - bits)) as u8);
    }
    out
}

/// 5-bit words to exactly `n` bytes, the spare bits being zero.
fn to_bytes_exact(words: &[u8], n: usize) -> Option<Vec<u8>> {
    let b = to_bytes_padded(words);
    if b.len() < n || b[n..].iter().any(|x| *x != 0) {
        return None;
    }
    Some(b[..n].to_vec())
}

fn number(words: &[u8]) -> u64 {
    words.iter().fold(0u64, |a, w| (a << 5) | *w as u64)
}

fn amount_msat(s: &str) -> Result<Option<u64>, Bolt11Error> {
    if s.is_empty() {
        return Ok(None);
    }
    let bad = Bolt11Error::Malformed("amount");
    let (digits, mult) = match s.as_bytes()[s.len() - 1] {
        c @ (b'm' | b'u' | b'n' | b'p') => (&s[..s.len() - 1], Some(c)),
        _ => (s, None),
    };
    if digits.is_empty() || !digits.bytes().all(|c| c.is_ascii_digit()) || digits.starts_with('0') {
        return Err(bad);
    }
    let n: u64 = digits.parse().map_err(|_| bad.clone())?;
    // One bitcoin is 10^11 millisatoshis.
    let msat = match mult {
        None => n.checked_mul(100_000_000_000),
        Some(b'm') => n.checked_mul(100_000_000),
        Some(b'u') => n.checked_mul(100_000),
        Some(b'n') => n.checked_mul(100),
        Some(_) => {
            if !n.is_multiple_of(10) {
                return Err(bad);
            }
            Some(n / 10)
        }
    };
    msat.map(Some).ok_or(bad)
}

/// Decode an invoice and recover the node key that signed it.
pub fn decode(invoice: &str) -> Result<Invoice, Bolt11Error> {
    let m = Bolt11Error::Malformed;
    if invoice.bytes().any(|c| c.is_ascii_uppercase()) {
        return Err(m("an invoice is lower case here"));
    }
    let sep = invoice.rfind('1').ok_or(m("no separator"))?;
    let (hrp, data) = (&invoice[..sep], &invoice[sep + 1..]);
    if !hrp.is_ascii() || hrp.bytes().any(|c| !(33..=126).contains(&c)) {
        return Err(m("prefix"));
    }
    let words: Vec<u8> = data
        .bytes()
        .map(|c| CHARSET.iter().position(|x| *x == c).map(|p| p as u8))
        .collect::<Option<_>>()
        .ok_or(m("not bech32"))?;
    let mut chk = hrp_expand(hrp.as_bytes());
    chk.extend(&words);
    if polymod(&chk) != 1 {
        return Err(m("checksum"));
    }
    // Timestamp (7 words), tagged fields, signature (104 words), checksum (6).
    if words.len() < 7 + 104 + 6 {
        return Err(m("too short"));
    }
    let words = &words[..words.len() - 6];
    let (signed, sig) = words.split_at(words.len() - 104);
    // The network, longest prefix first, then the amount.
    let network = [
        Network::Regtest,
        Network::Signet,
        Network::Mainnet,
        Network::Testnet,
    ]
    .into_iter()
    .find(|n| {
        hrp.strip_prefix(n.prefix())
            .is_some_and(|rest| rest.is_empty() || rest.as_bytes()[0].is_ascii_digit())
    })
    .ok_or(m("not a Bitcoin Lightning prefix"))?;
    let amount_msat = amount_msat(&hrp[network.prefix().len()..])?;
    let timestamp = number(&signed[..7]);
    let (mut payment_hash, mut description_hash, mut node) = (None, None, None);
    let (mut has_description, mut features) = (false, Vec::new());
    let mut rest = &signed[7..];
    while !rest.is_empty() {
        if rest.len() < 3 {
            return Err(m("field header"));
        }
        let (tag, len) = (rest[0], (rest[1] as usize) * 32 + rest[2] as usize);
        if rest.len() < 3 + len {
            return Err(m("field length"));
        }
        let field = &rest[3..3 + len];
        rest = &rest[3 + len..];
        match (tag, len) {
            // p: the payment hash. Exactly one, of 52 words.
            (1, 52) => {
                if payment_hash.is_some() {
                    return Err(m("two payment hashes"));
                }
                payment_hash = Some(to_bytes_exact(field, 32).ok_or(m("payment hash"))?);
            }
            // h: the description hash.
            (23, 52) => {
                if description_hash.is_some() {
                    return Err(m("two description hashes"));
                }
                description_hash = Some(to_bytes_exact(field, 32).ok_or(m("description hash"))?);
            }
            // n: the payee's node key.
            (19, 53) => node = Some(to_bytes_exact(field, 33).ok_or(m("node key"))?),
            // d: a plain description.
            (13, _) => has_description = true,
            // 9: feature bits, the last word holding the lowest bits.
            (5, _) => {
                features = field
                    .iter()
                    .rev()
                    .flat_map(|w| (0..5).map(move |i| (w >> i) & 1 == 1))
                    .collect();
            }
            // Other fields, and p, h, n of another length, are skipped
            // (BOLT 11: "MUST skip").
            _ => {}
        }
    }
    let payment_hash: [u8; 32] = payment_hash
        .ok_or(m("no payment hash"))?
        .try_into()
        .unwrap();
    let description_hash = description_hash.map(|h| h.try_into().unwrap());
    // The signature: 64 bytes and a recovery id, over the prefix's bytes and
    // the data words before it, packed and padded.
    let sb = to_bytes_exact(sig, 65).ok_or(m("signature"))?;
    let mut msg = hrp.as_bytes().to_vec();
    msg.extend(to_bytes_padded(signed));
    let digest = Sha256::digest(&msg);
    let s = Signature::from_slice(&sb[..64]).map_err(|_| Bolt11Error::Signature)?;
    let rid = RecoveryId::from_byte(sb[64]).ok_or(Bolt11Error::Signature)?;
    let key =
        VerifyingKey::recover_from_prehash(&digest, &s, rid).map_err(|_| Bolt11Error::Signature)?;
    let recovered: [u8; 33] = key.to_encoded_point(true).as_bytes().try_into().unwrap();
    if let Some(n) = node {
        if n != recovered {
            return Err(Bolt11Error::Signature);
        }
    }
    Ok(Invoice {
        network,
        amount_msat,
        timestamp,
        payment_hash,
        description_hash,
        has_description,
        node: recovered,
        features,
    })
}
