//! The Agreements MIR (Agreements draft 10): exact formats, tiers, and the checks a
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
/// The publication (Agreements type 6): the offer, with its partners, split
/// service and split plan.
pub mod publication;
/// The owners' acts of draft 14: the issuance offer and proxies (F309, F327).
pub mod owners;
/// What a version pays a stake less (Agreements draft 12, rule 48: F270,
/// F274, F279, F280).
pub mod pay;
/// Two classes of offers and the proof checker (Agreements draft 11, F261).
pub mod proofs;
pub mod tiers;
pub mod view;

pub use formats::*;
pub use owners::{decode_proxy_revocation, in_format, owner_types, proxy_revocation_payload, IssuanceOffer, Proxy};
pub use open_formats::{
    new_types, Fee, FeeScope, JudgeRequest, Liveness, Metric, RefundTerms, ShareRule, Sold, SplitPlan,
    StakeTransfer, Unfilled, WorkClaim, FEES_FIELD, RETIRED_TYPES, WITHDRAWN_FIELDS,
};
pub use publication::{Partner, Publication, PublicationAct};
pub use pay::{owners_line_lowered, pay_signers, stakes_paid_less, PaidLess};
pub use proofs::{delivery_checkers, OfferClass, ProofChecker, ProofVerdict};
pub use tiers::{changes, judicial_changes, powers_needed, rollback_powers, Change, Tier};
pub use view::{
    Deadline, KeeperSequence, Agreement, AreaCount, AreaLimits, Backing, CutCheck, CloneState, Closed, ClosingEval, Consent, Current, DebtReleaseEval, Departure, Disagreement, Payment,
    BrokenAct, ChainBreak, DepartureKind, ForkEval, AgreementsView, Mismatch, NegotiationRecord, NextVoices, PointerCheck, RecordEval,
    ReleaseEval, Role, ServiceAccount, SplitEval, PurchaseEval, PurchaseVerdict, Unpaid, Unsplit, DealFork, DealState, ForkAlarm,
    AlarmKind, NumberBreak, OwedBack, SplitNumbers, PublicationEval, PublicationTip, TagUnder, TransferEval, WorkOwners, SuccessorCheck, SaleState, VowEval, VowSale, ForwardOwed, HopRecord, RouteVerdict, RouteBuyer, RefundHop,
};
