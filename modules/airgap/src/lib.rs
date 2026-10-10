//! # mor-airgap
//!
//! The air-gapped chain key Module (`modules/module-airgap-chain-key-signer-draft-4.md`)
//! and the two seed Modules it supports
//! (`modules/module-chain-key-seed-words-draft-1.md`, `modules/module-chain-key-seed-hex-draft-1.md`).
//!
//! - [`seed`]: the two seed Modules: how a chain-key seed is written down, and
//!   how its keys are derived.
//! - [`msg`]: the messages that cross the air gap, strictly decoded.
//! - [`device`]: the offline signer and its rules (3.1 to 3.7), clean-device
//!   mode, and collectives' rotations.
//! - [`summary`]: the summary the device builds itself, and key fingerprints.
//! - [`shares`]: split chain keys: Pedersen verifiable secret sharing, the
//!   rebuild, and the rebuild check.
//! - [`online`]: the online device's side: genesis from a commitment
//!   export, pending rotations, and the check of what comes back.
//! - [`transport`]: animated QR codes (Uniform Resources) and files.
//!
//! Written against Identity draft 9 and core v15, on the core library.

pub mod device;
pub mod msg;
pub mod online;
pub mod seed;
pub mod shares;
pub mod summary;
pub mod transport;

/// The Module's tags. Tags keep the hashes of different kinds of object
/// apart; a Module's tags carry its own prefix.
pub mod tag {
    pub const FINGERPRINT: &str = "MOR/module/airgap/fingerprint";
    pub const REQUEST: &str = "MOR/module/airgap/request";
    pub const DEALING: &str = "MOR/module/airgap/dealing";
    pub const PEDERSEN_H: &str = "MOR/module/airgap/pedersen-h";
}
