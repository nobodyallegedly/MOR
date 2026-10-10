//! # mor-relay
//!
//! MOR relays and homes, speaking the relay transport cMIP (draft 1).
//!
//! - [`wire`]: the cMIP's messages, strict both ways.
//! - [`store`]: storage, one SQLite file per relay.
//! - [`operator`]: the identity that runs a home and signs what it states
//!   (test identities only, chain key in software).
//! - [`node`]: what a relay and a home do with each request.
//! - [`http`]: the requests over HTTP.
//! - [`client`]: a client for the cMIP, checking what it fetches.
//! - [`manage`]: the management page, where an operator runs the relay
//!   from a browser (outside the protocol).
//!
//! Written against the relay transport cMIP draft 2, core v16, Identity
//! draft 10, Envelopes draft 6 and Text draft 5.

pub mod client;
pub mod http;
pub mod manage;
pub mod node;
pub mod operator;
pub mod store;
pub mod wire;

pub use node::{AddedBase, Config, Node, Policy, Role, Specs};
