//! The Law MIP (Law draft 10): exact formats, tiers, and the checks a
//! collective needs, judged on the collective's own sequence (F109); the
//! negotiation record (F118) and role-share evidence (F119); the judicial
//! tier changed only by every member, the chain of judgment and the
//! departed members entry (F120, F121); a version changing a judge and the
//! constitution needing both rules (F122); the pointer check (F123); the
//! chain's periods, stakes in the collective itself, splits shown to every
//! holder they pay with their fees, equal treatment, the fork of a
//! collective and the public domain release (F121).
//!
//! - [`formats`]: terms, areas, marks, signatures, resignations, records,
//!   grants, and the checks that need no other act.
//! - [`tiers`]: what a clone changes, and the powers it needs.
//! - [`view`]: agreements, records, lines, consent and grants, read from
//!   what a verifier holds.

pub mod formats;
pub mod tiers;
pub mod view;

pub use formats::*;
pub use tiers::{changes, judicial_changes, powers_needed, Change, Tier};
pub use view::{
    Agreement, AreaCount, Backing, CloneState, Closed, ClosingEval, Consent, Current, DebtReleaseEval, Departure, Disagreement,
    DepartureKind, ForkEval, LawView, Mismatch, NegotiationRecord, PointerCheck, RecordEval,
    ReleaseEval, Role, SplitEval, PurchaseEval, PurchaseVerdict,
};
