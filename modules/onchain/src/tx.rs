//! Bitcoin transactions, as far as the rule reads them: a transaction
//! serialised without its witness (the bytes its txid is the hash of), its
//! outputs, and its txid. Written from Bitcoin's serialisation; the tests
//! check it against a second, independent implementation (rust-bitcoin).

use mor_core::hash::sha256;

/// One output: its value in satoshis and its script.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Output {
    pub value: u64,
    pub script: Vec<u8>,
}

/// A transaction serialised without witness, read.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Tx {
    /// Its txid, in Bitcoin's own byte order (the order hashed).
    pub txid: [u8; 32],
    pub inputs: usize,
    pub outputs: Vec<Output>,
}

/// Bitcoin's double SHA-256.
pub fn dsha256(b: &[u8]) -> [u8; 32] {
    sha256(&sha256(b))
}

struct Reader<'a> {
    b: &'a [u8],
    at: usize,
}

impl<'a> Reader<'a> {
    fn take(&mut self, n: usize) -> Option<&'a [u8]> {
        let end = self.at.checked_add(n)?;
        let s = self.b.get(self.at..end)?;
        self.at = end;
        Some(s)
    }

    fn u64le(&mut self) -> Option<u64> {
        Some(u64::from_le_bytes(self.take(8)?.try_into().ok()?))
    }

    /// Bitcoin's compact size, in its shortest form only.
    fn varint(&mut self) -> Option<u64> {
        let first = self.take(1)?[0];
        let (n, min) = match first {
            0xfd => (u16::from_le_bytes(self.take(2)?.try_into().ok()?) as u64, 0xfd),
            0xfe => (u32::from_le_bytes(self.take(4)?.try_into().ok()?) as u64, 0x1_0000),
            0xff => (u64::from_le_bytes(self.take(8)?.try_into().ok()?), 0x1_0000_0000),
            n => return Some(n as u64),
        };
        (n >= min).then_some(n)
    }

    fn bytes(&mut self) -> Option<&'a [u8]> {
        let n = usize::try_from(self.varint()?).ok()?;
        self.take(n)
    }
}

/// Read a transaction serialised without witness: exactly one, with no
/// bytes left over. `None` where the bytes are not one: among them a
/// transaction with no inputs, which is how the witness serialisation
/// begins, and one of exactly 64 bytes, which could be read as an inner
/// node of a Merkle tree.
pub fn decode(b: &[u8]) -> Option<Tx> {
    if b.len() == 64 {
        return None;
    }
    let mut r = Reader { b, at: 0 };
    r.take(4)?; // version
    let inputs = usize::try_from(r.varint()?).ok()?;
    if inputs == 0 {
        return None;
    }
    for _ in 0..inputs {
        r.take(36)?; // the output it spends
        r.bytes()?; // its script
        r.take(4)?; // sequence
    }
    let n = usize::try_from(r.varint()?).ok()?;
    // Each output takes at least nine bytes: no count can promise more.
    if n > b.len() / 9 {
        return None;
    }
    let mut outputs = Vec::with_capacity(n);
    for _ in 0..n {
        let value = r.u64le()?;
        let script = r.bytes()?.to_vec();
        outputs.push(Output { value, script });
    }
    r.take(4)?; // lock time
    if r.at != b.len() {
        return None;
    }
    Some(Tx {
        txid: dsha256(b),
        inputs,
        outputs,
    })
}

/// The script of a Taproot output (witness version 1) paying the x-only
/// output key `q`: `OP_1 <32 bytes>`.
pub fn taproot_script(q: &[u8; 32]) -> Vec<u8> {
    let mut s = vec![0x51, 0x20];
    s.extend_from_slice(q);
    s
}
