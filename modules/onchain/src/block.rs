//! Block headers and Merkle branches, as far as the rule reads them: an
//! 80-byte header, its hash, the target its `bits` state, and the root a
//! branch gives. Written from Bitcoin's serialisation; the tests check it
//! against rust-bitcoin.

use crate::tx::dsha256;

/// An 80-byte block header, read.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Header {
    /// Its hash, in Bitcoin's own byte order.
    pub hash: [u8; 32],
    pub previous: [u8; 32],
    pub merkle_root: [u8; 32],
    pub bits: u32,
}

impl Header {
    pub fn decode(b: &[u8]) -> Option<Header> {
        let b: &[u8; 80] = b.try_into().ok()?;
        Some(Header {
            hash: dsha256(b),
            previous: b[4..36].try_into().ok()?,
            merkle_root: b[36..68].try_into().ok()?,
            bits: u32::from_le_bytes(b[72..76].try_into().ok()?),
        })
    }

    /// Whether its hash, read as a number, is at or below the target its
    /// own `bits` state.
    pub fn meets_its_target(&self) -> bool {
        match target(self.bits) {
            Some(t) => le_number(&self.hash) <= t,
            None => false,
        }
    }
}

/// A 32-byte hash in Bitcoin's byte order, as a big-endian number.
fn le_number(h: &[u8; 32]) -> [u8; 32] {
    let mut n = *h;
    n.reverse();
    n
}

/// The target a compact `bits` value states, as a 32-byte big-endian
/// number; `None` where it is negative, zero, or does not fit 256 bits.
pub fn target(bits: u32) -> Option<[u8; 32]> {
    let exponent = (bits >> 24) as usize;
    let mantissa = bits & 0x007f_ffff;
    if bits & 0x0080_0000 != 0 || mantissa == 0 {
        return None;
    }
    let m = mantissa.to_be_bytes(); // [0, a, b, c]
    let mut out = [0u8; 32];
    // The number is mantissa × 256^(exponent − 3).
    for (i, byte) in m[1..].iter().enumerate() {
        // Byte i of the mantissa sits at power exponent − 1 − i.
        let power = exponent as isize - 1 - i as isize;
        if power < 0 {
            continue; // shifted out below the units
        }
        if power >= 32 {
            if *byte != 0 {
                return None;
            }
            continue;
        }
        out[31 - power as usize] = *byte;
    }
    (out != [0u8; 32]).then_some(out)
}

/// Whether target `a` is easier (a larger number) than target `b`.
pub fn easier(a: &[u8; 32], b: &[u8; 32]) -> bool {
    a > b
}

/// The Merkle root a branch gives, from a txid at `index` up.
pub fn merkle_root(txid: &[u8; 32], index: u64, branch: &[[u8; 32]]) -> Option<[u8; 32]> {
    // A branch longer than the index's bits cannot place it.
    if branch.len() < 64 && index >> branch.len() != 0 {
        return None;
    }
    let mut h = *txid;
    for (level, sibling) in branch.iter().enumerate() {
        let mut both = [0u8; 64];
        if (index >> level) & 1 == 0 {
            both[..32].copy_from_slice(&h);
            both[32..].copy_from_slice(sibling);
        } else {
            both[..32].copy_from_slice(sibling);
            both[32..].copy_from_slice(&h);
        }
        h = dsha256(&both);
    }
    Some(h)
}

/// The branch for the txid at `index` among a block's txids, in order: what
/// the payee's or payer's software puts in the proof.
pub fn merkle_branch(txids: &[[u8; 32]], index: usize) -> Option<Vec<[u8; 32]>> {
    if index >= txids.len() {
        return None;
    }
    let mut level = txids.to_vec();
    let mut i = index;
    let mut branch = vec![];
    while level.len() > 1 {
        if level.len() % 2 == 1 {
            level.push(*level.last().unwrap());
        }
        branch.push(level[i ^ 1]);
        level = level
            .chunks(2)
            .map(|p| {
                let mut both = [0u8; 64];
                both[..32].copy_from_slice(&p[0]);
                both[32..].copy_from_slice(&p[1]);
                dsha256(&both)
            })
            .collect();
        i /= 2;
    }
    Some(branch)
}

/// Whether `index` is the one canonical position a branch gives for a
/// txid (F200). Bitcoin's tree repeats the last node of a level with an odd
/// number of nodes, so a node in that place has its own copy as sibling,
/// and the index with that level's bit set gives the same root with the
/// same branch: a twin. Canonical means: wherever the sibling equals the
/// running hash, the index's bit at that level is 0, the node's own
/// position. *An honest block has no two equal siblings anywhere else
/// (Bitcoin Core refuses such a block as mutated), so no honest proof is
/// refused.*
pub fn canonical(txid: &[u8; 32], index: u64, branch: &[[u8; 32]]) -> bool {
    let mut h = *txid;
    for (level, sibling) in branch.iter().enumerate() {
        let right = level < 64 && (index >> level) & 1 == 1;
        if sibling == &h && right {
            return false;
        }
        let mut both = [0u8; 64];
        if right {
            both[..32].copy_from_slice(sibling);
            both[32..].copy_from_slice(&h);
        } else {
            both[..32].copy_from_slice(&h);
            both[32..].copy_from_slice(sibling);
        }
        h = dsha256(&both);
    }
    true
}
