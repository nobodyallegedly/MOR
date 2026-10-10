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
pub mod open_formats;
pub mod tiers;
pub mod view;

pub use formats::*;
pub use open_formats::{
    new_types, Fee, FeeScope, JudgeRequest, Liveness, Metric, Offer, OfferAct, Paid, RefundTerms, ShareRule, Sold, SplitPlan,
    StakeTransfer, Unfilled, WorkClaim, FEES_FIELD, RETIRED_TYPES, WITHDRAWN_FIELDS,
};
pub use tiers::{changes, judicial_changes, powers_needed, rollback_powers, Change, Tier};
pub use view::{
    Agreement, AreaCount, Backing, CloneState, Closed, ClosingEval, Consent, Current, DebtReleaseEval, Departure, Disagreement,
    BrokenAct, ChainBreak, DepartureKind, ForkEval, LawView, Mismatch, NegotiationRecord, NextVoices, PointerCheck, RecordEval,
    ReleaseEval, Role, ServiceAccount, SplitEval, PurchaseEval, PurchaseVerdict, Unpaid, Unsplit, DealFork, DealState, ForkAlarm,
    AlarmKind, NumberBreak, OwedBack, SplitNumbers, OfferEval, TransferEval, WorkOwners, SuccessorCheck,
};
