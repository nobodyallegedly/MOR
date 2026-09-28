//! # mor-relay
//!
//! MOR relays and homes, speaking the relay transport cMIP (draft 1).
//!
//! - [`wire`]: the cMIP's messages, strict both ways.
//! - [`store`]: storage, one SQLite file per relay.
//! - [`operator`]: the identity that runs a home and signs what it states
//!   (test identities only, safety key in software).
//! - [`node`]: what a relay and a home do with each request.
//! - [`http`]: the requests over HTTP.
//! - [`client`]: a client for the cMIP, checking what it fetches.
//!
//! Written against the relay transport cMIP draft 1, core v15, Identity
//! draft 9, Envelope draft 5 and Text draft 5.

pub mod client;
pub mod http;
pub mod node;
pub mod operator;
pub mod store;
pub mod wire;

pub use node::{Config, Node, Policy, Role, Specs};
