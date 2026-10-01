//! The Law MIP (Law draft 7): exact formats, tiers, and the checks a
//! collective needs, judged on the collective's own sequence (F109).
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
    Agreement, AreaCount, Backing, CloneState, Consent, Current, Departure, DepartureKind,
    LawView, RecordEval,
};
