//! The chain's headers, handed to the rule as data (F204): a verifier
//! checks a Bitcoin proof against the headers of the chain it follows,
//! never against the proof's own headers alone. The rule stays frozen and
//! reads no network (Development rule 12): the client supplies the headers,
//! and the rule reads them as it reads the proof.
//!
//! *Mechanics chosen by the build under the delegation of F204 (the
//! project lead's, recorded in `docs/onchain-rail-f200-f205-build-2026-10-10.md`):*
//!
//! - **What is handed over:** the headers of the client's best chain, in
//!   order, from a starting height to its tip. Each must name the one
//!   before and meet the target it states; the first must be a starting
//!   point this Module names for the network (its genesis block on
//!   Bitcoin, testnet and signet). On regtest any start is accepted: a test
//!   network's chain is whatever the test makes.
//! - **How far back:** from the network's genesis (about 75 MB of headers
//!   on Bitcoin in 2026, about 4 MB more a year). A later starting point,
//!   frozen in a later draft of this Module, would let a client keep less.
//! - **What it does not check:** Bitcoin's difficulty schedule and its
//!   timestamp rules. The client's header sync does that, as every Bitcoin
//!   node does, or the client trusts a header service for it, and says so
//!   (client conformance; stated cost).

use crate::block::Header;
use crate::Network;
use std::collections::HashMap;

/// A starting point this Module names for a network: `(height, hash)`, the
/// hash in Bitcoin's own byte order (the order hashed, not the reversed
/// order block explorers show).
pub fn starts(network: Network) -> Vec<(u64, [u8; 32])> {
    let shown = |s: &str| {
        let mut b = [0u8; 32];
        for (i, out) in b.iter_mut().enumerate() {
            *out = u8::from_str_radix(&s[2 * i..2 * i + 2], 16).expect("hex");
        }
        b.reverse();
        b
    };
    match network {
        Network::Mainnet => vec![(0, shown("000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"))],
        Network::Testnet => vec![(0, shown("000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943"))],
        Network::Signet => vec![(0, shown("00000008819873e925422c1ff0f99f7cc9bbb232af63a077a480a3633bee1ef6"))],
        Network::Regtest => vec![],
    }
}

/// The headers of the chain a verifier follows, from `start` to its tip.
#[derive(Clone, Debug)]
pub struct HeaderChain {
    network: Network,
    start: u64,
    hashes: Vec<[u8; 32]>,
    headers: Vec<[u8; 80]>,
    at: HashMap<[u8; 32], u64>,
}

impl HeaderChain {
    /// The chain from `start`, its first header at that height. Refused
    /// where it is empty, where its first header is not a starting point
    /// this Module names for the network (regtest aside), or where a
    /// header does not name the one before it or misses its own target.
    pub fn new(network: Network, start: u64, headers: Vec<[u8; 80]>) -> Result<HeaderChain, String> {
        let Some(first) = headers.first() else {
            return Err("no headers".into());
        };
        let h0 = Header::decode(first).ok_or("a header is not 80 bytes")?;
        if network != Network::Regtest && !starts(network).contains(&(start, h0.hash)) {
            return Err("the first header is not a starting point this Module names for the network".into());
        }
        let mut c = HeaderChain { network, start, hashes: vec![], headers: vec![], at: HashMap::new() };
        for h in headers {
            c.extend(h)?;
        }
        Ok(c)
    }

    /// Add the next header at the tip.
    pub fn extend(&mut self, raw: [u8; 80]) -> Result<(), String> {
        let h = Header::decode(&raw).ok_or("a header is not 80 bytes")?;
        if let Some(tip) = self.hashes.last() {
            if &h.previous != tip {
                return Err("a header does not name the one before it".into());
            }
        }
        if !h.meets_its_target() {
            return Err("a header's hash is above the target it states".into());
        }
        let height = self.start + self.hashes.len() as u64;
        self.at.insert(h.hash, height);
        self.hashes.push(h.hash);
        self.headers.push(raw);
        Ok(())
    }

    pub fn network(&self) -> Network {
        self.network
    }

    /// The height of its tip.
    pub fn tip(&self) -> u64 {
        self.start + self.hashes.len() as u64 - 1
    }

    /// The height of a block on this chain, if it is on it.
    pub fn height_of(&self, hash: &[u8; 32]) -> Option<u64> {
        self.at.get(hash).copied()
    }

    /// The hash of the block at a height, if the chain holds it.
    pub fn hash_at(&self, height: u64) -> Option<[u8; 32]> {
        let i = usize::try_from(height.checked_sub(self.start)?).ok()?;
        self.hashes.get(i).copied()
    }

    /// The header at a height, if the chain holds it.
    pub fn header_at(&self, height: u64) -> Option<[u8; 80]> {
        let i = usize::try_from(height.checked_sub(self.start)?).ok()?;
        self.headers.get(i).copied()
    }
}
