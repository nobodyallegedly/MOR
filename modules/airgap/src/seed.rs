//! The two seed Modules: how a safety seed is written down, and how safety
//! keys come from it (`modules/module-safety-seed-words-draft-1.md`,
//! `modules/module-safety-seed-hex-draft-1.md`).
//!
//! Both hold a 256-bit seed and derive every safety key from it by a tagged
//! hash of the seed, the scheme and the key index. They differ in how the
//! backup is written, and each uses its own tag, so the same 256 bits under
//! the two Modules give unrelated keys: a backup restores only under the
//! Module it was made with, and says which.
//!
//! - **Words:** 24 words from BIP-39's English list, the last word carrying
//!   an 8-bit checksum. Only BIP-39's encoding is used, not its wallet
//!   derivation: these words are not a Bitcoin wallet.
//! - **Hex:** 64 hexadecimal characters and an 8-character checksum, in
//!   groups of four.

use mor_core::hash::{sha256, tagged_hash, tagged_hash_parts, Hash};
use mor_core::sig::SlhKey;
use std::fmt;

/// Tags of the words Module.
pub mod tag {
    pub const WORDS_KEY: &str = "MOR/module/seed-words/key";
    pub const HEX_KEY: &str = "MOR/module/seed-hex/key";
    pub const HEX_CHECK: &str = "MOR/module/seed-hex/check";
}

/// A seed Module this signer implements.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum SeedModule {
    Words,
    Hex,
}

impl SeedModule {
    pub const ALL: [SeedModule; 2] = [SeedModule::Words, SeedModule::Hex];

    /// The Module's spec hash. A test value until the Module is published
    /// at the first acts, when its creator is known (build brief, open 3).
    pub fn spec(&self) -> Hash {
        match self {
            SeedModule::Words => {
                sha256(b"seed Module: words, draft 1, test value until publication")
            }
            SeedModule::Hex => sha256(b"seed Module: hex, draft 1, test value until publication"),
        }
    }

    pub fn from_spec(h: &Hash) -> Option<SeedModule> {
        Self::ALL.into_iter().find(|m| &m.spec() == h)
    }

    pub fn name(&self) -> &'static str {
        match self {
            SeedModule::Words => "words",
            SeedModule::Hex => "hex",
        }
    }

    pub fn from_name(s: &str) -> Option<SeedModule> {
        Self::ALL.into_iter().find(|m| m.name() == s)
    }

    fn key_tag(&self) -> &'static str {
        match self {
            SeedModule::Words => tag::WORDS_KEY,
            SeedModule::Hex => tag::HEX_KEY,
        }
    }
}

/// Why a written backup does not restore.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum SeedError {
    /// Not 24 words of the list, or a wrong checksum.
    Words(String),
    /// Not 72 hexadecimal characters.
    HexLength(usize),
    HexCharacter,
    /// The checksum does not match: a character was written or read wrong.
    Checksum,
}

impl fmt::Display for SeedError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SeedError::Words(e) => write!(f, "not a valid 24-word backup: {e}"),
            SeedError::HexLength(n) => write!(f, "expected 72 hexadecimal characters, found {n}"),
            SeedError::HexCharacter => f.write_str("a character is not hexadecimal"),
            SeedError::Checksum => f.write_str("the checksum does not match: a character is wrong"),
        }
    }
}

impl std::error::Error for SeedError {}

/// A safety seed under one seed Module.
#[derive(Clone, PartialEq, Eq)]
pub struct Seed {
    pub module: SeedModule,
    pub entropy: [u8; 32],
}

impl fmt::Debug for Seed {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Seed({}, {})", self.module.name(), hexs(&self.id()[..4]))
    }
}

/// Forgetting, as far as software can: the seed's bytes are overwritten
/// when it is dropped. Copies the system made elsewhere (swap, a crash dump)
/// are out of reach, which is one reason the device is kept offline.
impl Drop for Seed {
    fn drop(&mut self) {
        for b in self.entropy.iter_mut() {
            // SAFETY: a valid, aligned, exclusive reference to a byte.
            unsafe { std::ptr::write_volatile(b, 0) };
        }
    }
}

impl Seed {
    pub fn new(module: SeedModule, entropy: [u8; 32]) -> Self {
        Seed { module, entropy }
    }

    /// The written backup.
    pub fn backup(&self) -> String {
        match self.module {
            SeedModule::Words => bip39::Mnemonic::from_entropy(&self.entropy)
                .expect("32 bytes is a valid BIP-39 entropy length")
                .words()
                .collect::<Vec<_>>()
                .join(" "),
            SeedModule::Hex => {
                let check = tagged_hash(tag::HEX_CHECK, &self.entropy);
                let mut all = hexs(&self.entropy);
                all.push_str(&hexs(&check[..4]));
                all.as_bytes()
                    .chunks(4)
                    .map(|c| std::str::from_utf8(c).unwrap())
                    .collect::<Vec<_>>()
                    .join(" ")
            }
        }
    }

    /// Restore a seed from its written backup. Spacing and letter case do
    /// not matter; everything else does.
    pub fn restore(module: SeedModule, written: &str) -> Result<Seed, SeedError> {
        match module {
            SeedModule::Words => {
                let words: Vec<String> = written
                    .split_whitespace()
                    .map(|w| w.to_ascii_lowercase())
                    .collect();
                if words.len() != 24 {
                    return Err(SeedError::Words(format!("{} words, not 24", words.len())));
                }
                let m = bip39::Mnemonic::parse_in(bip39::Language::English, words.join(" "))
                    .map_err(|e| SeedError::Words(e.to_string()))?;
                let e = m.to_entropy();
                Ok(Seed::new(
                    module,
                    e.as_slice().try_into().expect("24 words hold 32 bytes"),
                ))
            }
            SeedModule::Hex => {
                let s: String = written.split_whitespace().collect();
                if s.len() != 72 {
                    return Err(SeedError::HexLength(s.len()));
                }
                let bytes = unhex(&s).ok_or(SeedError::HexCharacter)?;
                let entropy: [u8; 32] = bytes[..32].try_into().unwrap();
                if tagged_hash(tag::HEX_CHECK, &entropy)[..4] != bytes[32..] {
                    return Err(SeedError::Checksum);
                }
                Ok(Seed::new(module, entropy))
            }
        }
    }

    /// The safety key at `index` for `scheme` (2 or 3): FIPS 205's three
    /// 16-byte key-generation seeds are the first 48 bytes of
    /// `tagged_hash(tag, seed ‖ scheme ‖ index ‖ 0) ‖ tagged_hash(tag, seed ‖ scheme ‖ index ‖ 1)`,
    /// with the index as 8 bytes, big-endian, in the order sk_seed, sk_prf, pk_seed.
    pub fn key(&self, scheme: u8, index: u64) -> SlhKey {
        let s = self.key_seeds(scheme, index);
        SlhKey::from_seeds(
            scheme,
            s[..16].try_into().unwrap(),
            s[16..32].try_into().unwrap(),
            s[32..].try_into().unwrap(),
        )
    }

    /// The 48 bytes of FIPS 205 seeds [`Seed::key`] derives (sk_seed,
    /// sk_prf, pk_seed), for a signer that takes seeds rather than a key.
    pub fn key_seeds(&self, scheme: u8, index: u64) -> [u8; 48] {
        assert!(scheme == 2 || scheme == 3, "safety schemes are 2 and 3");
        let t = self.module.key_tag();
        let i = index.to_be_bytes();
        let a = tagged_hash_parts(t, &[&self.entropy, &[scheme], &i, &[0]]);
        let b = tagged_hash_parts(t, &[&self.entropy, &[scheme], &i, &[1]]);
        let mut out = [0u8; 48];
        out[..32].copy_from_slice(&a);
        out[32..].copy_from_slice(&b[..16]);
        out
    }

    /// A short name for this seed, never secret: the hash of the commitment
    /// to its key 0 under scheme 2. Shown so the user can tell seeds apart.
    pub fn id(&self) -> Hash {
        sha256(&self.key(2, 0).commitment())
    }
}

pub(crate) fn hexs(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

pub(crate) fn unhex(s: &str) -> Option<Vec<u8>> {
    if !s.len().is_multiple_of(2) || !s.bytes().all(|c| c.is_ascii_hexdigit()) {
        return None;
    }
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(s.get(i..i + 2)?, 16).ok())
        .collect()
}
