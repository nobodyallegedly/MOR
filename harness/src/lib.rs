//! # mor-harness
//!
//! The freeze-suite harness (roadmap step 7): it runs scenarios of the
//! freeze test suite against real relays and homes, and judges every answer
//! with the core library's verifier. It starts with the identity gauntlet,
//! scenario 5, steps 6 to 7d.
//!
//! - [`person`]: test identities, and the acts they (or thieves) sign.
//! - [`net`]: deployed homes by address, and throwaway homes on this machine.
//! - [`reader`]: a reader that trusts no relay.
//! - [`auditor`]: cosigning log summaries, absence statements.
//! - [`carry`]: the proofs an owner keeps and carries to new homes (F101).
//! - [`report`]: each check, passed or not, and where it ran.
//! - [`gauntlet`]: the steps themselves.

pub mod auditor;
pub mod carry;
pub mod gauntlet;
pub mod net;
pub mod person;
pub mod reader;
pub mod report;
