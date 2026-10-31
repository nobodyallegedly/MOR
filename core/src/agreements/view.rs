//! Agreements read from what a verifier holds (Agreements draft 9): agreements and their
//! clones, the collective's own lines, which agreement is in force for an
//! act of a collective, and whether that act has the consent its areas
//! require.
//!
//! In plain words:
//!
//! 1. A deal exists when every party has signed it, and a clone of it
//!    completes only when every party has signed the clone (F107).
//! 2. A collective's genesis declares its founding agreement, which exists
//!    once every founder has signed it (Q11). A rotation declares each
//!    constitutional clone with the signature acts that complete it (Flaw
//!    M). Every other clone is written by a record act, the collective's
//!    everyday line, naming the signature acts that complete it (A2).
//! 3. "Before" and "after" are judged on the collective's own sequences
//!    only (F109): an act of the collective is before a line when it
//!    precedes it in the line's own sequence or lies in the ancestry of a
//!    tip the line names; every other act counts as after it. A member's
//!    signature is placed by the collective's acts: the act it signs, a
//!    record or rotation naming it, an act acknowledging it.
//! 4. A departure (resignation, stepping down, a declaration of absence)
//!    takes effect at the line registering it (record field 3); in a deal,
//!    a declaration draws its own line, the deal's keepers ordering it. Each rule is counted among the
//!    voices that remain, all of them meeting it where fewer remain than
//!    its number (flaw C); an area with no voice left is frozen.
//! 5. An act of the collective that an area reaches counts only with its
//!    holders' signature acts, meeting the area's number.
//! 6. Everything Agreements decide binds, so nothing rests on the verifier's own
//!    failed attempts to reach homes (Identity, the sentence after rule 17,
//!    F153): an identity answer resting on them is left aside, and a fork,
//!    a closing, or what is paid toward a debt that rests on one is unknown
//!    ([`AgreementsView::binding`]).

use super::formats::*;
use super::tiers::{changes, powers_needed, rollback_powers, Change, Tier};
use crate::chain::{Resolution, Status, Verifier, Held};
use crate::hash::Hash;
use crate::identity::Payload;
use std::cell::RefCell;
use std::collections::{BTreeMap, BTreeSet};

/// A reference absence-proof module, experimental, outside the core path
/// (F172): the time checks the core used before, for a caller to compute
/// [`AgreementsView::absence_accepted`] with.
pub mod reference_absence_proof;
/// The publication (rules 11 to 17): publications judged, their price
/// tags, purchases by tag, and shares by reference.
mod publishing;
pub use publishing::{PublicationEval, PublicationTip, TagUnder};
/// Client conformance on a deal's versions (F221, F222).
mod deals;
pub use deals::SuccessorCheck;
/// The owning side of step 12b: work claims and stake transfers.
mod owning;
pub use owning::{TransferEval, WorkOwners};

mod routes;
pub use routes::{ForwardOwed, HopRecord, RouteVerdict};
/// The vow grammar (F237, F240): a vow's chain, the offers naming it, and
/// each sale's state.
mod vows;
/// Issuance with pre-emption (Agreements draft 14, rule 96; F309, F315, F328 Q13, Q14).
mod issuance;
/// Proxies (Agreements draft 14, rule 97; F327).
mod proxies;
/// Keepers read from their records (type 2), "belongs to", deadlines
/// (Agreements 17, rules 33 and 36 to 42).
mod keepers;
pub use keepers::{Deadline, KeeperSequence};
pub use vows::{SaleState, VowEval, VowSale};
/// Agreements as parties of agreements (Agreements draft 11, rule 15,
/// F254): named by their line, consenting by their own rule, no loops, the
/// nesting bound.
mod parties;
use std::rc::Rc;

/// Read Agreements from what a verifier holds.
pub struct AgreementsView<'a> {
    pub v: &'a Verifier,
    pub mirs: Mirs,
    /// The layers each extension declares in its specification (Development,
    /// field 10), as the caller read them from the specifications it holds.
    pub ext_layers: BTreeMap<Hash, Vec<u64>>,
    /// Keeper logs the caller states, each operator's records as act ids
    /// in the keeper's own order: read beside the keeper records (type 2)
    /// the verifier holds, which the view reads itself
    /// ([`Self::keeper_sequence`]). A stated log is one more sequence.
    pub keeper_logs: BTreeMap<Hash, Vec<Hash>>,
    /// The rail Modules this verifier adopted, each with its kind and what
    /// its proof binds, read from its specification, fields 11 and 13
    /// (Development draft 10, F301; the payment cMIP's `Modules::rails`),
    /// never from a Module's code. A push rail (F128, W4) is one on which
    /// the payer pays an address with no request from the payee's side; a
    /// request rail's side commits to the payment, and to the claim a
    /// purchase names, before it is made. What the proof binds is read
    /// element by element (Money rule 11; F328, Q4). *A rail not here was
    /// not adopted: the payment cMIP gives no answer for its payments, so
    /// none of them is in [`Self::rail_valid`], and nothing here decides
    /// on it; the defaults below (a request rail binding everything) are
    /// never reached for a payment that counts.*
    pub rails: BTreeMap<Hash, crate::development::Rail>,
    /// Receipts and claims whose rail proof the caller checked under the
    /// payment cMIP and found not to carry the commitment recomputed from
    /// them (F131, IT3): on a payment whose receipts name different claims,
    /// those naming a claim the payment did not commit to. The rail's
    /// answer, like `rail_valid`, a fact the caller states: the core reads
    /// no rail.
    pub rail_invalid: BTreeSet<Hash>,
    /// Receipts and claims whose rail proof the caller checked under the
    /// payment cMIP and found valid (Money rules 2 and 4: `verify`, or
    /// `verify_under` with the payment cMIP the agreement names), with where
    /// the proof says the payment was paid (`mor_payment::paid_at`). The
    /// rail's answer, a fact the caller states: the core reads no rail. A
    /// receipt or claim not listed has no rail answer, and pays nothing
    /// toward a debt ([`Self::paid_toward`]).
    pub rail_valid: BTreeMap<Hash, crate::money::PaidAt>,
    /// Claims whose rail proof the caller checked under the payment cMIP
    /// and found pending with a payment shown (on-chain: a transaction
    /// paying the commitment's address, not yet confirmed): the rail's
    /// answer, a fact the caller states. Read by rule 15 alone, on a clock
    /// that cannot see the rail's own proof (F203): such a claim's anchor
    /// counts once a claim of the same payment is valid. It pays nothing.
    pub rail_pending: BTreeSet<Hash>,
    /// What "the same payment" is (Money rule 12; F200, F380): for each
    /// receipt's or claim's proof (field 1, the payment cMIP's bytes), the
    /// payment its rail Module says it is (`mor_payment::payment`: on-chain
    /// the output the transaction created, on Lightning the payment hash).
    /// Money's rules that tell payments apart (10, 11, 12, 15, 29) compare
    /// these, never the proofs' bytes, so two proofs of one payment (a
    /// payment mined again after a reorganisation) are one payment. A proof
    /// not listed has no stated payment ([`Payment::Unstated`]): whether it
    /// is the same payment as another record is unknown, whether the bytes
    /// match or not, and an answer resting on it says so
    /// ([`AgreementsError::PaymentUnstated`], [`Self::paid_toward`],
    /// [`Self::disagreements`]). A fact the caller states, like `rail_valid`.
    pub payments: BTreeMap<Vec<u8>, Vec<u8>>,
    /// Set when an answer compared two records whose sameness rests on a
    /// payment not stated in [`Self::payments`] ([`Self::unstated_payment_read`]).
    unstated: std::cell::Cell<bool>,
    /// The pairs such comparisons asked about while an answer is judged
    /// ([`Self::judged`]), each written in order.
    read: std::cell::RefCell<BTreeSet<(Payment, Payment)>>,
    /// The one pair the answer being judged takes as one payment, on its
    /// second reading ([`Self::judged`]); every other pair is two.
    assumed: std::cell::RefCell<Option<(Payment, Payment)>>,
    /// Set when an answer read a receipt or claim whose verification answer
    /// is neither valid nor invalid: pending, or not held ([`Self::answered`]).
    unanswered_read: std::cell::Cell<bool>,
    /// Set while an answer is read a second time, as if every such record's
    /// answer were valid ([`Self::answered`]).
    as_if_answered: std::cell::Cell<bool>,
    /// Pairs `(clock Module, rail Module)` where the clock Module reads the
    /// rail's own proof as the payment's anchor (F201, F202: the Bitcoin
    /// clock and the on-chain rail): on such a clock, rule 15 compares the
    /// anchors of the payer's valid claims only, the payment's block among
    /// them, and a pending claim's anchor counts for nothing (F203 applies
    /// on every other clock). Like `rail_valid`, a fact the caller states
    /// from the specifications it holds.
    pub rail_clocks: BTreeSet<(Hash, Hash)>,
    /// Absence proof (rule 51, task "Absence proof"; F172, F178 item 12):
    /// for an abandonment declaration under a clause naming an
    /// absence-proof cMIP (key 3), and the act that uses it (the record
    /// registering it, or the clone put in force under it: a deal's clone,
    /// or the clone a recovery rotation declares), keyed `(declaration,
    /// act)`: that cMIP accepted it, judging the acts that act's history
    /// holds. The cMIP's answer, a fact the caller states, like
    /// `rail_valid`: the core reads no cMIP. A pair not listed was refused,
    /// or answered unknown, or not judged: there the declaration does not
    /// count ("a declaration it refuses or cannot judge does not count").
    /// Consulted only where the clause names such a cMIP; with none, the
    /// declaration is the authority's judgment, a stated cost.
    pub absence_accepted: BTreeSet<(Hash, Hash)>,
    /// The anchors this verifier checked (Envelopes, task "Anchoring",
    /// F173), each act judged by its earliest anchor on each reference:
    /// with an anchoring cMIP it carries (`Anchors::add_proof`), or as the
    /// caller states them. Money rule 15 reads them on the clock the
    /// payee declared (F169, F176 to F181).
    pub anchored: crate::envelopes::anchoring::Anchors,
    /// The specifications this verifier read as the relay transport cMIP,
    /// draft 3 or later, whose act type 0 is a relay's delivery record
    /// (F184): `[locked hash, size, client's nonce]`, signed by the relay's
    /// operator. Like `rail_valid`, a fact the caller states: the core reads
    /// no cMIP. A delivery record counts as evidence for a role share only
    /// where the payer's claim acknowledges it (Agreements rules 19, 22).
    pub delivery_records: BTreeSet<Hash>,
    /// The chain of judgment (rule 34a; QG4, decided 9 October 2026; F246,
    /// decided 10 October 2026, superseding F236): each `(question, judge)`
    /// whose stage on that question has passed with no answer of its within
    /// it. The chain runs per question, never per party (F246: "There is no
    /// 'one party deadline'. There is an agreed deadline."): for a deal's
    /// fork, the question is the fork's reference, the version the
    /// settlement requests name (type 22); for a request to a judge (type
    /// 25), its field 2. The first valid request with standing starts the
    /// first link's period, on the agreement's time reference; later
    /// requests on the same question join that stage; each next link's
    /// period runs from the end of the one before. The time reference's
    /// answer, a fact the caller states, like `absence_accepted`: the core
    /// reads no time reference. The next link is active only once every
    /// link before it is listed (or answered "unknown", F206); a settlement
    /// by a link listed counts for nothing on that question ("if the next
    /// judge is triggered, the previous judge is void", F124, N6). A link
    /// that is a specification signs no settlement (QG4): the caller, which
    /// holds the specifications, lists it as passed over.
    pub judges_lapsed: BTreeSet<(Hash, Hash)>,
    /// Failed attempts to pay a split service, per payment (F249, F250,
    /// decided by Nobody, allegedly, 11 October 2026: "A back up chain has
    /// attempts if previous one fails. Everything reverts back if attempts
    /// 1 succeeds."): `(payment, service)`, where the payment is the act
    /// that pays the agreement (the split of the layer above whose payout
    /// carries it, or the buyer's receipt or claim), and the service one
    /// the agreement names, field 14's or a backup of field 29. What counts
    /// as a failed attempt is the split cMIP's, which the plan names; the
    /// cMIP's answer, a fact the caller states, like `judges_lapsed`: the
    /// core runs no cMIP. Each payment starts again from field 14's service.
    pub attempts_failed: BTreeSet<(Hash, Hash)>,
    /// Judges' settlements (type 23) the agreement's time reference places
    /// before their link's stage opened on the question (F246: only the
    /// active link settles; a settlement signed outside its link's active
    /// window counts for nothing; mechanic, the project lead's, under the
    /// delegation). One signed after its link's stage passed needs no entry
    /// here: that link is in `judges_lapsed`. A fact the caller states,
    /// like `judges_lapsed`.
    pub settled_out_of_turn: BTreeSet<Hash>,
    /// Notices to a payer owed money back who gave no address (Agreements type
    /// 24; F197, decided 10 October 2026) whose deadline has passed, on the
    /// time reference the notice names, with no address given by the payer
    /// within it (no payee pointer, vault, or refund rail on a claim of
    /// theirs). The time reference's answer, a fact the caller states, like
    /// `judges_lapsed`. A closing may then leave that payment open, naming
    /// it with its notice (rule 37d; the closing's field 4).
    pub notices_lapsed: BTreeSet<Hash>,
    /// Payments following an offer that the time reference places past the
    /// offer's deadline (its field 5): the time reference's answer, a fact
    /// the caller states, like `notices_lapsed`. A payment whose place is
    /// undetermined is not listed, and is a purchase: on a push rail the
    /// seller who chose it bears the undetermined place (Fable's reading of
    /// OF4, in W4's shape); on a request rail the seller's request decides.
    pub paid_past_until: BTreeSet<Hash>,
    /// Refunds owed on payments (by one receipt or claim of the payment)
    /// whose refund terms' point the time reference places passed (terms
    /// field 17, or a lone seller's offer's field 7): ended (F219). The
    /// time reference's answer, a fact the caller states.
    pub refunds_past_terms: BTreeSet<Hash>,
    /// Issuance offers (type 26) whose period the agreement's time
    /// reference places passed (rule 96; new in draft 14, F309, F315): the
    /// time reference's answer, a fact the caller states, like
    /// `notices_lapsed`. An offer not listed is still open.
    pub offer_periods_lapsed: BTreeSet<Hash>,
    /// Take-ups of an issuance offer (signature acts naming it) that the
    /// time reference places within the offer's period: the caller's
    /// statement, read only once the offer's period has lapsed; while it
    /// runs, every take-up is within it.
    pub take_ups_within: BTreeSet<Hash>,
    /// Acts of a grant key whose grant carries limits (fields 3 and 4):
    /// whether each lies within them, an expiry on a time reference among
    /// them, as the limits cMIP judges (Agreements draft 14, rule 80; F320):
    /// the answer of a verifier holding that cMIP and the time reference,
    /// stated by the caller. An act not listed is unknown (F298).
    pub grant_limits: BTreeMap<Hash, bool>,
    cache: RefCell<BTreeMap<Hash, Rc<RecordEval>>>,
    busy: RefCell<BTreeSet<Hash>>,
    /// Money receipts and claims signed with a grant key, judged by their
    /// grant's backing (F350), once each; and those being judged.
    money_backed: RefCell<BTreeMap<Hash, bool>>,
    money_judging: RefCell<BTreeSet<Hash>>,
    /// Each keeper's sequence, read from the records held, once.
    keeper_seqs: RefCell<BTreeMap<Hash, Rc<KeeperSequence>>>,
    closed: RefCell<BTreeMap<Hash, Option<Closed>>>,
    ending: RefCell<BTreeSet<Hash>>,
    citing: RefCell<BTreeSet<Hash>>,
    adopting: RefCell<BTreeSet<Hash>>,
    /// The lines whose consent [`AgreementsView::line_signed`] is reading
    /// (F254): a line asked again while its own answer is being read gives
    /// no consent, failing closed.
    consenting: RefCell<BTreeSet<Hash>>,
    histories: RefCell<BTreeMap<(Hash, Vec<Hash>), Rc<History>>>,
    /// The acts held for each collective ([`AgreementsView::col_acts`]).
    col_acts_cache: RefCell<BTreeMap<Hash, Vec<Hash>>>,
    /// While a fork's check of the debts it must hand out runs, or a
    /// closing's of the debts it must have paid (F199; F143): the
    /// collective and the ending's line; only the departures registered in
    /// its history count there.
    fork_line: RefCell<Option<(Hash, Vec<Hash>)>>,
    ending_sigs: RefCell<BTreeMap<Hash, Rc<EndingSigs>>>,
    /// The chain read up to each link ([`AgreementsView::chain_state`]), by
    /// collective and link: it depends on what the verifier holds alone.
    chains: RefCell<BTreeMap<(Hash, usize), ChainState>>,
    /// F153: whether identity answers resting on the verifier's own failed
    /// attempts to reach homes are taken as they are. Never for a view a
    /// caller makes: only for the comparison [`Self::binding`] runs.
    trust_own_attempts: bool,
}

/// What a decision cites on the collective's chain (F127): every act it
/// reaches back from its own sequence and the tips it names, following the
/// previous acts and the citations of each act on the chain, the tips of
/// each record reached included; and the acts named on the way that this
/// verifier does not hold.
struct History {
    acts: BTreeSet<Hash>,
    missing: BTreeSet<Hash>,
}

/// An agreement as a verifier holds it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Agreement {
    pub id: Hash,
    pub terms: Terms,
    /// The parties with a valid signature act on these terms, in party order.
    pub signed: Vec<Hash>,
    /// For a clone: the powers its changes need (rule 44c, 45b).
    pub needs: Option<Vec<Power>>,
    /// Why the terms are invalid against their parent and lineage, if they
    /// are (a false mark, a reused area id, an uncovered member...).
    pub invalid: Option<String>,
    /// Founding terms and deals: whether the agreement exists (every party
    /// signed; for a clone, its parent exists too). A collective's clone is
    /// put in force only by a record or rotation: `None`.
    pub exists: Option<bool>,
    /// A collective's clone: every party its mark names, and every party it
    /// adds or makes a holder, has a valid signature act on it, so a record
    /// or rotation naming them could put it in force.
    pub ready: bool,
}

/// The collective's chain read up to a link (rules 37, 37d).
#[derive(Clone)]
enum ChainState {
    /// The agreement its declarations put in force there.
    InForce(Hash),
    /// Broken: Agreements' reason; and, where a rollback can bring it back
    /// (F185), the broken act's link and the agreement in force just
    /// before it.
    Broken { reason: String, act: Option<(usize, Hash)> },
}

/// A broken collective's broken act, where a rollback can bring it back
/// (rule 37d, F185; [`AgreementsView::broken_act`]).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct BrokenAct {
    /// The broken act: a rotation of the collective, by its id.
    pub act: Hash,
    /// The agreement in force just before it: a rollback's parent.
    pub before: Hash,
    /// Why Agreements read the rotation as failing rule 37.
    pub reason: String,
}

/// What a clone is at a record or rotation (rules 45, 45a, A2, Flaw M).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CloneState {
    Complete,
    /// Still a draft: signatures missing among those named.
    Draft(String),
    /// Invalid there: a false mark, a signature act that does not sign it...
    Invalid(String),
}

/// What a line registers (record field 3).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DepartureKind {
    /// A resignation: the whole voice, in this agreement and its descendants.
    Resigned { agreement: Hash },
    /// A stepping down from one area, by id.
    SteppedDown { agreement: Hash, area: u64 },
    /// The member's own rotation (C5).
    Rotated { rotation: Hash },
    /// An abandonment declaration removing the whole voice (outcome 0,
    /// rule 53), in this agreement and its descendants.
    Declared { agreement: Hash },
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Departure {
    /// The act registered.
    pub act: Hash,
    pub party: Hash,
    pub kind: DepartureKind,
}

/// A record act, judged.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RecordEval {
    pub id: Hash,
    /// Whether it counts as a line of the collective.
    pub line: bool,
    /// Why not, if it does not.
    pub not_a_line: Option<String>,
    /// The agreement in force for the record act itself.
    pub in_force_at: Option<Hash>,
    /// The clone it names, and what it is there.
    pub clone: Option<(Hash, CloneState)>,
    /// The clone it puts in force, if any.
    pub puts: Option<Hash>,
    /// Whether that clone, a clone of one branch of a fork, resolves the
    /// fork, the record coming after both lines (rule 47, B11).
    pub resolves: bool,
    /// What it registers.
    pub registers: Vec<Departure>,
    /// The stake transfers, proxies and revocations of proxies it places
    /// (field 3; new in draft 14, F316, F327).
    pub places: Vec<Hash>,
}

/// Agreements' answer for an act of a collective.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Consent {
    /// The signer declares no agreement: it is not a collective, and Agreements
    /// asks nothing more.
    NotCollective,
    /// The collective's declarations do not hold (rule 37): its acts that
    /// need member signatures count for nothing.
    Broken { reason: String },
    /// A record: judged by the clone it names alone ([`AgreementsView::record`]).
    Line { agreement: Hash },
    /// Not done (F126, F128): not sealed to every member of the agreement
    /// in force for it, nor public. It is planning, and binds no one, its
    /// signer included. (Where it is held is never a condition, F128.)
    NotDone { agreement: Hash, reason: String },
    /// Not on the collective's actions chain (F127): it does not cite the
    /// decision it acts under, or names there an act that is not on the
    /// collective's chain. It counts for nothing.
    Uncited { reason: String },
    /// No area reaches it: it counts on the collective's own signature.
    NoArea { agreement: Hash },
    /// The collective was ended by a fork or a closing, and the act counts
    /// as made after it: it counts for nothing in Agreements (rule 47a, F121, N9).
    Closed { by: Hash },
    /// Its specification is adopted nowhere in a collective with areas: it
    /// counts for nothing (Q16).
    Unadopted { agreement: Hash },
    /// A receipt or claim naming a rail Module that no payee pointer of the
    /// collective that counts, and not its vault in force, names: it counts
    /// for nothing (Money rule 12a, F115).
    RailNotAccepted { agreement: Hash, rail: Hash },
    /// It is invalid as an act of the collective (a grant beyond its area,
    /// a reinstatement that does not repeat its grant...).
    Invalid { agreement: Hash, reason: String },
    /// Signed with a grant key (F128) and backed by its grant: it counts
    /// as the collective's own act, within the grant's reach.
    Granted { agreement: Hash, grant: Hash },
    /// Signed with a grant key (F128), and not backed by its grant: the
    /// grant does not count, was revoked or ended before it, or the act
    /// lies beyond its reach. It counts for nothing.
    Ungranted { grant: Hash, reason: String },
    /// Signed with a grant key whose grant carries limits (fields 3 and 4,
    /// rule 18d) under a cMIP this verifier does not implement: whether
    /// the act lies within them cannot be read. The answer is unknown,
    /// never "it counts" (audit, October 2026, gap 10).
    Unknown { grant: Hash, reason: String },
    /// A negotiation message (F128, W6): talk, binding nothing, on neither
    /// of the collective's chains; the deal it leads to is an action.
    Talk,
    /// One of Identity's own everyday acts of the collective (a witness
    /// act, routes, an encryption key): on neither of its chains, it counts
    /// for nothing in Agreements, adopts nothing (F142) and places nothing (F156,
    /// rule 35b). Identity governs it, and it keeps its Identity role: a
    /// witness act still keeps the acts it names visible as received.
    Identity,
    /// The areas reaching it, each counted.
    Areas {
        agreement: Hash,
        areas: Vec<AreaCount>,
        met: bool,
    },
}

impl Consent {
    /// Whether the act counts, as far as Agreements goes.
    pub fn counts(&self) -> bool {
        matches!(
            self,
            Consent::NotCollective
                | Consent::NoArea { .. }
                | Consent::Granted { .. }
                | Consent::Areas { met: true, .. }
        )
    }
}

/// One area's count for an act.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AreaCount {
    pub area: u64,
    pub name: String,
    /// No holder's voice remains: the area is frozen, and its acts count
    /// for nothing (rule 37b).
    pub frozen: bool,
    /// The holders counted as voices for this act.
    pub voices: Vec<Hash>,
    /// How many of them must sign (flaw C applied).
    pub needed: usize,
    /// Those who did, by a signature act that counts.
    pub signers: Vec<Hash>,
    /// Where the area carries limits (key 6, F353): how the limits cMIP
    /// judged the act, a second key asked above them.
    pub limits: Option<AreaLimits>,
    pub met: bool,
}

/// How an area's limits cMIP judged an act (F353, draft 16).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AreaLimits {
    /// Within: the area's number as written.
    Within,
    /// Above: one more holder's key than the area's number.
    Above,
    /// This verifier holds no verdict of the cMIP: the act is unknown.
    Unknown,
}

/// Whether an act signed with a grant key binds the collective whose key it
/// is (rule 44, F128).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Backing {
    /// The act is not signed with a grant key.
    NotUnderGrant,
    /// Backed by a grant that counts and has not ended for it.
    Backed { grant: Hash },
    /// Not backed: the reason.
    NotBacked { grant: Hash, reason: String },
    /// The grant ended (a revocation, a departure emptying its area, a fork
    /// or closing) and the act binds all the same: the ending's history
    /// holds it, or the collective itself acknowledged it (rule 40, A6).
    Binds { grant: Hash },
    /// The grant carries limits (fields 3 and 4: a cap, a holding period,
    /// the rails it may use, as its cMIP defines them; rule 18d), and this
    /// verifier implements no limits cMIP: it cannot tell whether the act
    /// lies within them. Unknown, never "Backed" (audit, October 2026,
    /// gap 10); the collective's own adoption still binds (rule 40).
    Unknown { grant: Hash, reason: String },
    /// A revocation's history does not hold the act, but another identity
    /// (never the grantee) acknowledged it, or a keeper of an agreement it
    /// belongs to recorded it before recording the revocation (Agreements
    /// rule 76): valid, and shown as disputed. It confers nothing (no
    /// stake, no obligation, no consent) unless the grantor adopts it,
    /// which makes it [`Backing::Binds`].
    Disputed { grant: Hash, reason: String },
}

/// The collective's state after everything held: for showing.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Current {
    pub agreement: Hash,
    /// Parties of the agreement in force whose whole voice is gone.
    pub departed: Vec<Hash>,
    /// (area id, holder) pairs whose holders stepped down.
    pub stepped_down: Vec<(u64, Hash)>,
    /// Areas with no holder whose voice remains.
    pub frozen: Vec<u64>,
    /// Records under the current key, judged.
    pub records: Vec<RecordEval>,
    /// Two records of different clones of one parent on concurrent lines.
    pub fork: bool,
    /// The fork or closing that ended it, if any (rule 47a).
    pub closed: Option<Hash>,
}

/// A line: a record of the collective, or a rotation of it (by link).
#[derive(Clone, Copy)]
enum Line<'h> {
    Record(&'h Held),
    Rotation(usize),
}

/// The collective being judged.
struct Col {
    id: Hash,
    res: Rc<Resolution>,
}

/// Every node reachable from `from` in `edges`, `from` itself left out.
fn closure(edges: &BTreeMap<Hash, BTreeSet<Hash>>, from: &Hash) -> BTreeSet<Hash> {
    let mut out = BTreeSet::new();
    let mut todo = vec![*from];
    while let Some(x) = todo.pop() {
        for y in edges.get(&x).into_iter().flatten() {
            if y != from && out.insert(*y) {
                todo.push(*y);
            }
        }
    }
    out
}

/// What a fold over records leaves in force.
struct InForce {
    agreement: Hash,
    fork: bool,
    /// In a fork: the sibling clones whose records are concurrent.
    branches: Vec<Hash>,
}

impl<'a> AgreementsView<'a> {
    pub fn new(v: &'a Verifier, mirs: Mirs) -> Self {
        AgreementsView {
            v,
            mirs,
            ext_layers: BTreeMap::new(),
            keeper_logs: BTreeMap::new(),
            rails: BTreeMap::new(),
            rail_invalid: BTreeSet::new(),
            rail_valid: BTreeMap::new(),
            rail_pending: BTreeSet::new(),
            payments: BTreeMap::new(),
            unstated: Default::default(),
            read: Default::default(),
            assumed: Default::default(),
            unanswered_read: Default::default(),
            as_if_answered: Default::default(),
            rail_clocks: BTreeSet::new(),
            absence_accepted: BTreeSet::new(),
            anchored: Default::default(),
            delivery_records: BTreeSet::new(),
            judges_lapsed: BTreeSet::new(),
            attempts_failed: BTreeSet::new(),
            settled_out_of_turn: BTreeSet::new(),
            notices_lapsed: BTreeSet::new(),
            paid_past_until: BTreeSet::new(),
            refunds_past_terms: BTreeSet::new(),
            offer_periods_lapsed: BTreeSet::new(),
            take_ups_within: BTreeSet::new(),
            grant_limits: BTreeMap::new(),
            cache: RefCell::new(BTreeMap::new()),
            busy: RefCell::new(BTreeSet::new()),
            money_backed: RefCell::new(BTreeMap::new()),
            money_judging: RefCell::new(BTreeSet::new()),
            keeper_seqs: RefCell::new(BTreeMap::new()),
            closed: RefCell::new(BTreeMap::new()),
            ending: RefCell::new(BTreeSet::new()),
            citing: RefCell::new(BTreeSet::new()),
            adopting: RefCell::new(BTreeSet::new()),
            consenting: RefCell::new(BTreeSet::new()),
            histories: RefCell::new(BTreeMap::new()),
            col_acts_cache: RefCell::new(BTreeMap::new()),
            fork_line: RefCell::new(None),
            ending_sigs: RefCell::new(BTreeMap::new()),
            chains: RefCell::new(BTreeMap::new()),
            trust_own_attempts: false,
        }
    }

    // ------------------------------------------------------------ own attempts (F153)

    /// The standing of an act under Identity, for Agreements: everything Agreements
    /// decides binds, so an answer resting on the verifier's own failed
    /// attempts to reach homes is unknown (Identity, the sentence after
    /// rule 17, F153).
    fn status(&self, id: &Hash) -> Status {
        if self.trust_own_attempts {
            self.v.status(id)
        } else {
            self.v.binding_status(id)
        }
    }

    /// Whether Agreements leaves aside an identity-chain act (a chain signature, a
    /// rotation) whose counting rests on the verifier's own attempts (F153).
    fn refuses(&self, id: &Hash) -> bool {
        !self.trust_own_attempts && self.v.rests_on_own_attempt(id)
    }

    /// A view with the same facts over the verifier `v`, with fresh caches.
    /// Every field is listed, so a field added to [`AgreementsView`] must be
    /// copied here too.
    fn sibling<'b>(&self, v: &'b Verifier, trust_own_attempts: bool) -> AgreementsView<'b> {
        AgreementsView {
            v,
            mirs: self.mirs.clone(),
            ext_layers: self.ext_layers.clone(),
            keeper_logs: self.keeper_logs.clone(),
            rails: self.rails.clone(),
            rail_invalid: self.rail_invalid.clone(),
            rail_valid: self.rail_valid.clone(),
            rail_pending: self.rail_pending.clone(),
            payments: self.payments.clone(),
            unstated: Default::default(),
            read: Default::default(),
            assumed: Default::default(),
            unanswered_read: Default::default(),
            as_if_answered: Default::default(),
            rail_clocks: self.rail_clocks.clone(),
            absence_accepted: self.absence_accepted.clone(),
            anchored: self.anchored.clone(),
            delivery_records: self.delivery_records.clone(),
            judges_lapsed: self.judges_lapsed.clone(),
            attempts_failed: self.attempts_failed.clone(),
            settled_out_of_turn: self.settled_out_of_turn.clone(),
            notices_lapsed: self.notices_lapsed.clone(),
            paid_past_until: self.paid_past_until.clone(),
            refunds_past_terms: self.refunds_past_terms.clone(),
            offer_periods_lapsed: self.offer_periods_lapsed.clone(),
            take_ups_within: self.take_ups_within.clone(),
            grant_limits: self.grant_limits.clone(),
            cache: RefCell::new(BTreeMap::new()),
            busy: RefCell::new(BTreeSet::new()),
            money_backed: RefCell::new(BTreeMap::new()),
            money_judging: RefCell::new(BTreeSet::new()),
            keeper_seqs: RefCell::new(BTreeMap::new()),
            closed: RefCell::new(BTreeMap::new()),
            ending: RefCell::new(BTreeSet::new()),
            citing: RefCell::new(BTreeSet::new()),
            adopting: RefCell::new(BTreeSet::new()),
            consenting: RefCell::new(BTreeSet::new()),
            histories: RefCell::new(BTreeMap::new()),
            col_acts_cache: RefCell::new(BTreeMap::new()),
            fork_line: RefCell::new(None),
            ending_sigs: RefCell::new(BTreeMap::new()),
            chains: RefCell::new(BTreeMap::new()),
            trust_own_attempts,
        }
    }

    /// Whether a binding answer asked now must be compared ([`Self::binding`]):
    /// this verifier made attempts of its own, this view does not take
    /// them as they are, and no ending is being judged (whose inner
    /// questions the outer comparison already covers).
    fn own_attempts_open(&self) -> bool {
        !self.trust_own_attempts && self.v.has_own_attempts() && self.ending.borrow().is_empty()
    }

    /// A binding answer (Identity, the sentence after rule 17, F153): `f`'s
    /// answer, unless it rests on the verifier's own failed attempts to
    /// reach homes, when it is unknown ([`AgreementsError::OwnAttempt`]) until it
    /// no longer does. It rests on them when taking the identity answers
    /// they give as they are gives another answer than the same acts and
    /// facts without those attempts. Without any such attempt, `f` alone.
    /// Forks, closings, which ending closed a collective, and what is paid
    /// toward a debt ([`Self::paid`]) are judged so; every other answer of
    /// this view leaves such identity answers aside (never relies on them),
    /// showing the act as not standing rather than as unknown.
    pub fn binding<T: PartialEq>(&self, f: impl Fn(&AgreementsView<'_>) -> R<T>) -> R<T> {
        if self.trust_own_attempts || !self.v.has_own_attempts() {
            return f(self);
        }
        let with = f(&self.sibling(self.v, true));
        let w = self.v.without_own_attempts();
        let without = f(&self.sibling(&w, false));
        if with == without {
            with
        } else {
            Err(AgreementsError::OwnAttempt)
        }
    }

    fn agreements(&self) -> Hash {
        self.mirs.agreements
    }

    fn is_agreements(&self, h: &Held, t: u64) -> bool {
        h.inside.spec == self.agreements() && h.inside.type_ == t
    }

    fn held(&self, id: &Hash) -> R<&'a Held> {
        self.v.get(id).ok_or(AgreementsError::Missing(*id))
    }

    fn ext(&self) -> impl Fn(&Hash) -> R<Vec<u64>> + '_ {
        move |e: &Hash| self.ext_layers.get(e).cloned().ok_or(AgreementsError::Missing(*e))
    }

    // ------------------------------------------------------------ grants (rule 73)

    /// The person's grant whose key signed `h` (rule 73): its binding names
    /// a grant (type 9) whose field 9 made its signature, and its signer is
    /// the grantor, the grant's signer. A collective's grant carries no key:
    /// its grantee acts with its own ([`Self::col_grant`]).
    fn key_grant(&self, h: &Held) -> Option<(&'a Held, Grant)> {
        let b = h.act.outside.binding.as_ref()?;
        let g = self.v.get(b)?;
        if !self.is_agreements(g, types::GRANT) || g.id == h.id || h.verdict != crate::sig::Verdict::Valid {
            return None;
        }
        let x = Grant::decode(&g.inside.payload).ok()?;
        if !x.key.as_ref()?.made(&h.act.signature) {
            return None;
        }
        (g.act.outside.signer.is_some() && g.act.outside.signer == h.act.outside.signer).then_some((g, x))
    }

    /// The collective's grant an act for it cites as the decision it acts
    /// under (rules 58, 73): a grant for the collective, on its chain,
    /// naming the act's signer as its grantee.
    fn col_grant(&self, col: &Col, h: &Held) -> Option<(&'a Held, Grant)> {
        let signer = h.act.outside.signer?;
        for y in Self::cites(h, &col.id) {
            let Some(g) = self.v.get(&y) else { continue };
            if !self.is_agreements(g, types::GRANT) || !Self::for_col(col, g) {
                continue;
            }
            if let Ok(x) = Grant::decode(&g.inside.payload) {
                if x.grantee == signer {
                    return Some((g, x));
                }
            }
        }
        None
    }

    /// Whether an act stands under Identity, for Agreements: valid; or
    /// signed with a person's grant key (Identity's `Scoped`) whose grant
    /// itself stands. Whether the grant backs the act is
    /// [`Self::backing`]. A Money receipt or claim signed with a person's
    /// grant key stands only where that grant reaches its type (Money
    /// rule 7). *Its revocation and limits are rule 80's.*
    fn valid(&self, id: &Hash) -> bool {
        match self.status(id) {
            Status::Valid => true,
            Status::Scoped => {
                let Some(h) = self.v.get(id) else { return false };
                let Some((g, grant)) = self.key_grant(h) else { return false };
                if self.status(&g.id) != Status::Valid {
                    return false;
                }
                let money = h.inside.spec == self.mirs.money && (h.inside.type_ == crate::money::types::RECEIPT || h.inside.type_ == crate::money::types::CLAIM);
                !money || self.person_grant_reaches(&grant, &h.inside.spec, h.inside.type_)
            }
            _ => false,
        }
    }

    /// Whether a Money receipt or claim counts where Money counts payments
    /// (debts paid, a payer's claims, a payment's receipts): it stands
    /// ([`Self::valid`]), and, signed with a grant key, its grant backs it
    /// (Money rule 7; Agreements rule 80): not revoked before it, within its
    /// limits. Judged once per act; asked again while being judged, it
    /// does not count.
    fn money_counts(&self, h: &Held) -> bool {
        if !self.valid(&h.id) {
            return false;
        }
        if self.status(&h.id) != Status::Scoped {
            return true;
        }
        if let Some(b) = self.money_backed.borrow().get(&h.id) {
            return *b;
        }
        if !self.money_judging.borrow_mut().insert(h.id) {
            return false;
        }
        let b = matches!(self.backing(&h.id), Ok(Backing::Backed { .. } | Backing::Binds { .. }));
        self.money_judging.borrow_mut().remove(&h.id);
        self.money_backed.borrow_mut().insert(h.id, b);
        b
    }

    /// Whether a person's grant reaches an act of this specification and
    /// type: the kinds it names (a MIR's layer, or a type of a
    /// specification); naming none, every act but a decision (rule 73).
    fn person_grant_reaches(&self, g: &Grant, spec: &Hash, ty: u64) -> bool {
        match &g.kinds {
            Some(k) => k.iter().any(|k| match k {
                Kind::Layer(l) => self.mirs.layer(spec) == Some(*l),
                Kind::Type { spec: s2, type_ } => s2 == spec && *type_ == ty,
            }),
            None => true,
        }
    }

    /// Whether `h` is an act for the collective (rule 58): it names the
    /// collective's identity as chain in `objects`, and is signed by
    /// another identity, a member or a grantee. The collective signs no
    /// everyday act (rule 56).
    fn for_col(col: &Col, h: &Held) -> bool {
        h.act.outside.signer != Some(col.id) && h.inside.objects.iter().flatten().any(|o| o.chain == col.id)
    }

    /// The link of the collective's identity chain an act is judged at: a
    /// link's own position; for an act for the collective, the latest link
    /// its history holds, reached through what it cites on the
    /// collective's chain (genesis 0). `None` where its history holds none.
    fn act_link(&self, col: &Col, h: &Held) -> Option<usize> {
        if let Some(k) = col.res.position_of(&h.id) {
            return Some(k);
        }
        if !Self::for_col(col, h) {
            return None;
        }
        let hist = self.history(col, &Self::cites(h, &col.id));
        hist.acts.iter().filter_map(|a| col.res.position_of(a)).max()
    }

    /// Who did an act, for Agreements and Money: the collective an act for
    /// a collective names (rule 58), else its signer.
    pub(super) fn author(&self, h: &Held) -> Option<Hash> {
        self.named_collective(h).or(h.act.outside.signer)
    }

    /// An identity's own acts: a person's, signed with its key; a
    /// collective's, the acts for it, its members' and grantees' naming it
    /// (rule 58), Agreements judging each.
    fn payees_acts(&self, who: &Hash) -> Vec<&'a Held> {
        if self.founding_of(who).is_some() {
            return self.col_acts(&self.col(who));
        }
        self.v.signed_by(who).collect()
    }

    /// The acts held for the collective (rule 58): each naming it as chain
    /// in `objects`, signed by another identity.
    fn col_acts(&self, col: &Col) -> Vec<&'a Held> {
        let cached = self.col_acts_cache.borrow().get(&col.id).cloned();
        let ids: Vec<Hash> = match cached {
            Some(v) => v,
            None => {
                let v: Vec<Hash> = self.v.held_acts().filter(|h| Self::for_col(col, h)).map(|h| h.id).collect();
                self.col_acts_cache.borrow_mut().insert(col.id, v.clone());
                v
            }
        };
        ids.iter().filter_map(|x| self.v.get(x)).collect()
    }

    // ------------------------------------------------------------ terms

    /// The terms of a held, opened terms act, checked.
    pub fn terms(&self, id: &Hash) -> R<Terms> {
        let h = self.held(id)?;
        if !self.is_agreements(h, types::TERMS) {
            return Err(AgreementsError::Check("not a terms act"));
        }
        let t = Terms::decode(&h.inside.payload)?;
        check_terms_inside(&h.inside, &t)?;
        t.check(&self.mirs)?;
        Ok(t)
    }

    /// An agreement's lineage, itself first, back to its founding terms.
    pub fn lineage(&self, id: &Hash) -> R<Vec<(Hash, Terms)>> {
        let mut out = vec![];
        let mut cur = *id;
        loop {
            if out.len() > 64 {
                return Err(AgreementsError::Check("a clone lineage deeper than 64"));
            }
            let t = self.terms(&cur)?;
            let next = t.parent;
            out.push((cur, t));
            match next {
                Some(p) => cur = p,
                None => return Ok(out),
            }
        }
    }

    /// The signature acts naming `act` with a valid standing under
    /// Identity, by signer, among `among`.
    fn valid_sigs(&self, act: &Hash, among: &[Hash]) -> Vec<(Hash, Hash)> {
        // F314: a deal's version someone relied on keeps its completeness for
        // everyone, a disowned signature on it shown as a dispute.
        let relied = std::cell::OnceCell::new();
        let mut out = vec![];
        for who in among {
            // A collective signs by an act for it, a member's signature act
            // naming it, counting under its rule for Agreements (rule 58).
            if self.founding_of(who).is_some() {
                let col = self.col(who);
                if let Some(h) = self.col_acts(&col).into_iter().find(|h| {
                    self.is_agreements(h, types::SIGNATURE) && decode_signature(&h.inside).ok() == Some(*act) && self.valid(&h.id) && self.consent(&h.id).is_ok_and(|c| c.counts())
                }) {
                    out.push((*who, h.id));
                }
                continue;
            }
            if let Some(h) = self.v.signed_by(who).find(|h| {
                self.is_agreements(h, types::SIGNATURE)
                    && decode_signature(&h.inside).ok() == Some(*act)
                    && (self.valid(&h.id)
                        || (matches!(self.status(&h.id), Status::Void | Status::Disputed) && *relied.get_or_init(|| self.deal_version_relied(act))))
            }) {
                out.push((*who, h.id));
            }
        }
        out
    }

    /// Whether `act` is a deal's version a later act relies on (Agreements
    /// draft 14, rule 47, F314): a purchase naming it (rule 12), a split
    /// under it (rule 20), a keeper's record of it (rule 37, the keepers'
    /// logs a verifier states), or a later version cloning it (rule 45),
    /// each valid under Identity. "What others relied on stands."
    fn deal_version_relied(&self, act: &Hash) -> bool {
        use crate::money::Payload as Fin;
        let Some(h) = self.v.get(act) else { return false };
        if !self.is_agreements(h, types::TERMS) || Terms::decode(&h.inside.payload).map_or(true, |t| t.is_collective()) {
            return false;
        }
        if self.terms(act).is_ok_and(|t| t.keepers.iter().any(|k| k.operators.iter().any(|op| self.keeper_recorded_act(op, act)))) {
            return true;
        }
        if self.keeper_logs.values().any(|log| log.contains(act)) {
            return true;
        }
        self.v.held_acts().any(|x| {
            if !self.valid(&x.id) || x.id == *act {
                return false;
            }
            // A later version cloning it relies on it only once it is itself
            // complete, every party of it having signed it: a draft nobody
            // else signed is nobody's reliance (rule 47; Fable's Q-A8).
            if self.is_agreements(x, types::TERMS) {
                return Terms::decode(&x.inside.payload).is_ok_and(|t| t.parent == Some(*act) && !t.parties.is_empty() && self.signers(&x.id, &t.parties).len() == t.parties.len());
            }
            // A split relies on the version its service's receipt names in
            // field 9 (rule 12): the receipt itself, signed by its payee, the
            // split service, says so. A payer's claim naming a version is
            // information, never reliance: the payer is no party.
            if x.inside.spec == self.mirs.money {
                return match Fin::decode(x.inside.type_, &x.inside.payload) {
                    Ok(Fin::Receipt(r)) => self.author(x) == Some(r.payee) && r.purchase.is_some_and(|p| p.agreement == *act || p.line == *act),
                    _ => false,
                };
            }
            false
        })
    }

    /// The distinct identities with a valid signature act naming `act`, in
    /// the order of `among`.
    pub fn signers(&self, act: &Hash, among: &[Hash]) -> Vec<Hash> {
        let own: Vec<Hash> = self.valid_sigs(act, among).into_iter().map(|(p, _)| p).collect();
        // F216 (decided 10 October 2026): a work's agreement named as one
        // participant of another agreement (a publication's) acts as a
        // single-use collective: it signs where every party of its version
        // in force signed, each by its own signature act (a deal's rule,
        // F107). F235 ("It could even be three layers, and it should"):
        // such a party may itself be a deal with an agreement among its
        // parties, a publication's agreement in a pool's, read the same way
        // at each layer (mechanic, the layers-and-judges build, replacing
        // the F216 build's "one level"; at most eight layers, as payer-side
        // splitting reads them).
        // Agreements draft 11, rule 15 (F254): such a party is any
        // agreement, named by its line, consenting by every version of that
        // line up to the one in force; no loops; at most `NESTING_BOUND`
        // layers ([`Self::line_signed`]).
        let mut path: Vec<Hash> = self.line_of(act).into_iter().collect();
        among
            .iter()
            .filter(|p| own.contains(p) || self.line_signed(act, p, 0, &mut path))
            .copied()
            .collect()
    }

    /// The checks a clone needs against its parent and lineage (rules 44c,
    /// 45a, 45b; "Areas"; Q26, Q32), without signatures. Returns the
    /// powers needed.
    /// With `rollback`, the clone is a rollback's (rule 37d, F185): its mark
    /// names the powers [`rollback_powers`] gives, never a succession plan.
    fn clone_static(&self, parent: &Terms, clone: &Terms, lineage: &[(Hash, Terms)], rollback: bool) -> R<Result<Vec<Power>, String>> {
        if parent.is_collective() != clone.is_collective() {
            return Ok(Err("a clone keeps the parent's kind: a collective, or a deal".into()));
        }
        if parent.target != clone.target {
            return Ok(Err("a clone keeps its parent's target (field 33)".into()));
        }
        let Some(mark) = clone.field4.mark() else {
            return Ok(Err("a clone carries a mark".into()));
        };
        if rollback && !parent.is_collective() {
            return Ok(Err("only a collective is rolled back (rule 37d)".into()));
        }
        if mark.iter().any(|e| matches!(e.power, Power::Plan(_))) {
            if !parent.is_collective() {
                return Ok(Err("a deal's clone names the clone rule (rule 45b)".into()));
            }
            if rollback {
                return Ok(Err(
                    "a rollback's mark names the constitutional change rule, never a succession plan (rule 37d)".into(),
                ));
            }
            return Ok(Self::plan_static(parent, clone, mark));
        }
        let needs = if rollback {
            rollback_powers(parent, clone)
        } else {
            powers_needed(parent, clone, &self.mirs, &self.ext())?
        };
        let named: Vec<Power> = mark.iter().map(|e| e.power.clone()).collect();
        if named != needs {
            return Ok(Err(if rollback {
                "a rollback's mark names the constitutional change rule, and the judicial tier's rule where it changes a judge, nothing else (rule 37d)".into()
            } else {
                "the mark names other powers than those the clone's changes require (rule 45a)".into()
            }));
        }
        if !parent.is_collective() {
            // Every party whose voice remains: checked with the
            // declarations held ([`Self::deal_voices`]).
            if !mark[0].signers.iter().all(|s| parent.parties.contains(s)) {
                return Ok(Err(
                    "a deal's clone names the clone rule and every party whose voice remains in its mark (rule 45b)".into(),
                ));
            }
            return Ok(Ok(needs));
        }
        for e in mark {
            // A stake's holders' rule, `[5, stake]` (rule 64.4; F307): its
            // signers are that stake's holders at the line, counted there.
            if let Power::Holders(stake) = e.power {
                if !matches!(parent.holders_rule(stake).0, HoldersRule::Share(_)) {
                    return Ok(Err("the mark names a stake's holders' rule, and that stake's holders' rule is every holder (rule 64.4, F307)".into()));
                }
                continue;
            }
            let base = power_base(parent, &e.power);
            let Some((base, rule)) = base else {
                return Ok(Err("the mark names an area the parent does not have".into()));
            };
            // A rule counted among a stake's holders (F311): its holders who
            // are no parties sign too, checked at the line.
            if rule.holders_stake().is_some() {
                continue;
            }
            if !e.signers.iter().all(|s| base.contains(s)) {
                return Ok(Err(
                    "the mark names a signer that power is not counted among (rule 45a)".into(),
                ));
            }
        }
        // Q26: a number left above its holders only where the parent's
        // entry for that area has the same number.
        for a in clone.areas() {
            if a.threshold > a.holders.len() as u64
                && parent.area(a.id).map(|p| p.threshold) != Some(a.threshold)
            {
                return Ok(Err(
                    "an area's number exceeds its holders, and is not the parent's number for that area (Q26)".into(),
                ));
            }
        }
        // Q32: a new area takes an id no earlier version gave.
        for a in clone.areas() {
            if parent.area(a.id).is_none()
                && lineage.iter().any(|(_, t)| t.area(a.id).is_some())
            {
                return Ok(Err("a new area reuses a retired id (Q32)".into()));
            }
        }
        Ok(Ok(needs))
    }

    /// The parties a clone adds, and those it makes holders of an area they
    /// did not hold: each must sign it (rule 45, Q11, Q13).
    fn newcomers(parent: &Terms, clone: &Terms) -> Vec<Hash> {
        let mut out: Vec<Hash> = clone
            .parties
            .iter()
            .filter(|p| !parent.parties.contains(p))
            .copied()
            .collect();
        for a in clone.areas() {
            for h in &a.holders {
                let held = parent.area(a.id).is_some_and(|p| p.holders.contains(h));
                if !held && !out.contains(h) {
                    out.push(*h);
                }
            }
        }
        out
    }

    /// Rule 36b: every party the constitutional change rule counts is
    /// covered by the clone's abandonment clause. The judicial tier is one
    /// version for everyone (F121), so the clause in force judges each.
    fn coverage(&self, clone: &Terms) -> Option<String> {
        for p in clone.constitutional_rule().counted_among(&clone.parties) {
            if !clone.abandonment.as_ref().is_some_and(|a| a.covers(&p)) {
                return Some(
                    "a member with constitutional power is not covered by an abandonment clause able to remove their voice (F105)".into(),
                );
            }
        }
        None
    }

    /// Those who must sign a clone besides its mark (rules 13, 46; F121,
    /// F124): every holder, named by identity, whose share of a stake the
    /// clone drops or lowers, member or not (rule 46); a departed holder
    /// whose own stake plan it changes or drops (M1's stake part, reading);
    /// where it changes the release rule, every holder of every stake the
    /// parent defines (N8); and every holder it pays less who has no voice
    /// in the power making the change (Agreements draft 12, rule 48: F270,
    /// as F274 reads it; [`super::pay_signers`]). A holder written null is
    /// this collective, whose consent is the mark itself. No advance
    /// permission replaces any of these signatures (Agreements draft 12,
    /// F279); a holder whose whole stake a declaration of absence moves, by
    /// succession or, with no successor named, by outcome 1, is no longer
    /// asked, since it holds nothing after ([`Self::moved_by_abandonment`]).
    fn must_sign(parent: &Terms, clone: &Terms) -> Vec<Hash> {
        let (mut out, pay) = Self::must_sign_parts(parent, clone);
        for h in pay {
            if !out.contains(&h) {
                out.push(h);
            }
        }
        out
    }

    /// A stake's holders as a version counts them (Agreements draft 14, rule
    /// 94, F316): the parent's field 7, each effective transfer of `counted`
    /// on that stake (an agreement of the parent's lineage, its index)
    /// moving its share from its seller to its buyer.
    fn roster_with(&self, index: usize, st: &Stake, counted: &[Hash]) -> Vec<(Hash, u64)> {
        let mut out = st.identified();
        for t in counted {
            let Ok(e) = self.transfer(t) else { continue };
            if !e.effective || e.transfer.stake != index as u64 {
                continue;
            }
            let same = self.terms(&e.transfer.agreement).ok().and_then(|tt| tt.stakes.as_ref()?.get(index).map(|s| s.object)) == Some(st.object);
            if !same {
                continue;
            }
            if let Some(x) = out.iter_mut().find(|(h, _)| *h == e.seller) {
                x.1 = x.1.saturating_sub(e.transfer.share);
            }
            match out.iter_mut().find(|(h, _)| *h == e.transfer.to) {
                Some(x) => x.1 += e.transfer.share,
                None => out.push((e.transfer.to, e.transfer.share)),
            }
        }
        out
    }

    /// The holders a collective's clone pays less who have no voice in the
    /// power making the change (rule 48, F270, F282), read on the roster at
    /// line `at` (new in draft 14, F316); save, where the stake's holders'
    /// rule is by share and the mark names `[5, stake]`, the holders that
    /// rule binds: those who accepted it, by signing a version of the
    /// lineage carrying it, or by buying under it (rule 94, F307).
    fn collective_pay_signers(&self, col: &Col, at: Line<'a>, pid: &Hash, parent: &Terms, clone: &Terms, mark: &[MarkEntry]) -> R<Vec<Hash>> {
        let mut out: Vec<Hash> = vec![];
        let lineage = self.lineage(pid)?;
        for (o, _) in super::pay::stakes_paid_less(parent, clone) {
            let Some((i, st)) = parent.stake_on(&o) else { continue };
            let (rule, _) = parent.holders_rule(i as u64);
            let by_rule = matches!(rule, HoldersRule::Share(_)) && mark.iter().any(|e| e.power == Power::Holders(i as u64));
            for (h, n) in self.roster_at(col, at, pid, i as u64)? {
                if n == 0 || parent.parties.contains(&h) || out.contains(&h) {
                    continue;
                }
                if by_rule {
                    let bought = !st.identified().iter().any(|(x, _)| *x == h);
                    let signed = lineage.iter().any(|(v, vt)| {
                        vt.holders_rule(i as u64).0 == rule && vt.holders_rules.is_some() && !self.valid_sigs(v, &[h]).is_empty()
                    });
                    if bought || signed {
                        continue;
                    }
                }
                out.push(h);
            }
        }
        Ok(out)
    }

    /// [`Self::must_sign`] in two: those asked for their share, their stake
    /// plan or the release rule, whose signature nothing replaces; and those
    /// asked for their pay alone (F270), none of the first.
    fn must_sign_parts(parent: &Terms, clone: &Terms) -> (Vec<Hash>, Vec<Hash>) {
        let mut out: Vec<Hash> = vec![];
        let mut add = |h: Hash| {
            if !out.contains(&h) {
                out.push(h)
            }
        };
        for st in parent.stakes.iter().flatten() {
            let after = clone.stake_on(&st.object).map(|(_, s)| s);
            for (h, n) in st.identified() {
                if after.is_none_or(|s| s.share_of(&Who::Id(h)) < n) {
                    add(h);
                }
            }
        }
        for plan in parent.succession.iter().flatten() {
            if parent.parties.contains(&plan.party) {
                continue;
            }
            if clone.succession.iter().flatten().find(|q| q.party == plan.party) != Some(plan) {
                add(plan.party);
            }
        }
        if clone.release_rule != parent.release_rule {
            for st in parent.stakes.iter().flatten() {
                for (h, _) in st.identified() {
                    add(h);
                }
            }
        }
        let pay = super::pay_signers(parent, clone).into_iter().filter(|h| !out.contains(h)).collect();
        (out, pay)
    }

    /// The valid declarations of absence against `holder`, under the
    /// clauses of `lineage` (which starts at the parent), counting as the act
    /// `by` uses them ([`Self::declaration_used`]), whatever their outcomes.
    /// A threshold authority is counted at the line `at` where the clone is
    /// judged ([`Self::authority_at`]); with no line, by the signature acts
    /// on the declaration among the parent's other parties.
    fn absence_declared(&self, holder: &Hash, by: &Hash, lineage: &[(Hash, Terms)], at: Option<(&Col, Line<'a>, &Hash)>, own: &[Departure]) -> R<Vec<AbsenceDeclaration>> {
        let parent = &lineage[0].1;
        let mut everyone: Vec<Hash> = vec![];
        for (_, t) in lineage {
            for p in &t.parties {
                if p != holder && !everyone.contains(p) {
                    everyone.push(*p);
                }
            }
        }
        let any = [
            outcomes::VOICE_REMOVED,
            outcomes::STAKE_REDISTRIBUTED,
            outcomes::STAKE_TRANSFERRED,
            outcomes::OBLIGATIONS_REDIRECTED,
            outcomes::AGREEMENT_CLOSED,
        ];
        let mut out = vec![];
        for (x, d, clause, signer) in self.declarations_against(holder, lineage, &everyone, by, at, &any)? {
            let counted = match (at, &clause.authority) {
                (_, Authority::Named(_)) => true,
                (Some((col, l, ag)), Authority::Others(_)) => {
                    self.authority_at(col, Point::Line(l), ag, &clause, &d, &x, &signer, own)?.is_ok()
                }
                (None, Authority::Others(k)) => {
                    let others: Vec<Hash> = parent.parties.iter().filter(|p| *p != holder).copied().collect();
                    let n = 1 + self.valid_sigs(&x, &others).iter().filter(|(w, _)| *w != signer).count();
                    others.contains(&signer) && Rule::Threshold(*k).needed(others.len()).is_some_and(|need| n >= need)
                }
            };
            if counted {
                out.push(d);
            }
        }
        Ok(out)
    }

    /// Agreements draft 12, rules 48 and 89 (F279, decided by Nobody,
    /// allegedly: "What abandonment can trigger in that regard is
    /// succession. Where the stake and associated pay go to the
    /// successor."): whether `clone` moves `holder`'s stakes as a
    /// declaration of absence against it puts in force, so that its
    /// signature is not asked. Every share it held, of every stake, is gone:
    /// to the stake successors its succession plan in the parent names, in
    /// the plan's parts; or, where its plan names none and a declaration
    /// states outcome 1, to the stake's other holders in proportion to their
    /// shares. Each holder's gain may differ from its exact part by less
    /// than one millionth, the total exact (mechanic, the build's). A stake
    /// moved by succession is not a reduction (rule 48). Outcome 2 is not
    /// read: whom it transfers to is named in words (`docs/f270-build.md`).
    /// The release rule unchanged: changing it asks every holder (N8).
    #[allow(clippy::too_many_arguments)]
    fn moved_by_abandonment(&self, holder: &Hash, parent: &Terms, clone: &Terms, by: &Hash, lineage: &[(Hash, Terms)], at: Option<(&Col, Line<'a>, &Hash)>, own: &[Departure]) -> R<bool> {
        if clone.release_rule != parent.release_rule {
            return Ok(false);
        }
        let me = Who::Id(*holder);
        if !parent.stakes.iter().flatten().any(|st| st.share_of(&me) > 0) {
            return Ok(false);
        }
        let heirs: Option<Vec<(Hash, u64)>> = parent
            .succession
            .iter()
            .flatten()
            .find(|s| &s.party == holder)
            .and_then(|s| s.stakes.clone())
            .filter(|v| !v.is_empty());
        let declared = self.absence_declared(holder, by, lineage, at, own)?;
        let shared_out = declared.iter().any(|d| d.outcomes.contains(&outcomes::STAKE_REDISTRIBUTED));
        if declared.is_empty() || (heirs.is_none() && !shared_out) {
            return Ok(false);
        }
        for st in parent.stakes.iter().flatten() {
            let n = st.share_of(&me) as u128;
            if n == 0 {
                continue;
            }
            let Some((_, after)) = clone.stake_on(&st.object) else { return Ok(false) };
            if after.share_of(&me) != 0 {
                return Ok(false);
            }
            let to: Vec<(Who, u128)> = match &heirs {
                Some(h) => h.iter().map(|(w, p)| (Who::Id(*w), *p as u128)).collect(),
                None => st.holders.iter().filter(|(w, _)| *w != me).map(|(w, x)| (*w, *x as u128)).collect(),
            };
            let total: u128 = to.iter().map(|(_, x)| x).sum();
            if total == 0 {
                return Ok(false);
            }
            let mut who: Vec<Who> = vec![];
            for (w, _) in st.holders.iter().chain(after.holders.iter()) {
                if *w != me && !who.contains(w) {
                    who.push(*w);
                }
            }
            for w in who {
                let gain = after.share_of(&w) as i128 - st.share_of(&w) as i128;
                let exact = n * to.iter().filter(|(x, _)| *x == w).map(|(_, x)| x).sum::<u128>();
                let lo = (exact / total) as i128;
                let hi = lo + i128::from(exact % total != 0);
                if gain < lo || gain > hi {
                    return Ok(false);
                }
            }
        }
        Ok(true)
    }

    /// An agreement: its terms, who signed, and what can be said of it
    /// without a collective's sequence.
    pub fn agreement(&self, id: &Hash) -> R<Agreement> {
        self.agreement_as(id, false)
    }

    /// A clone read as a rollback's (rule 37d, F185): as [`Self::agreement`],
    /// its mark checked against the powers a rollback names. Whether a
    /// rotation declares it so is the chain's, not the terms'.
    pub fn rollback_agreement(&self, id: &Hash) -> R<Agreement> {
        self.agreement_as(id, true)
    }

    fn agreement_as(&self, id: &Hash, rollback: bool) -> R<Agreement> {
        let lineage = self.lineage(id)?;
        let terms = lineage[0].1.clone();
        let signed = self.signers(id, &terms.parties);
        // Draft 11, rule 15 (F254): named by line, no loops, the bound.
        // Draft 13, rule 14 (F284): a stake in a vow, held by its signer.
        let refused = match self.party_problem(id, &terms) {
            Some(r) => Some(r),
            None => self.vow_stake_problem(id, &terms, lineage.get(1).map(|(_, t)| t))?,
        };
        let Some(pid) = terms.parent else {
            let exists = refused.is_none() && terms.parties.iter().all(|p| signed.contains(p));
            // Rule 15: a verifier that cannot follow every layer answers unknown.
            if refused.is_none() {
                let unsigned: Vec<Hash> = terms.parties.iter().filter(|p| !signed.contains(p)).copied().collect();
                if let Some(x) = self.unfollowed(id, &unsigned) {
                    return Err(AgreementsError::Missing(x));
                }
            }
            return Ok(Agreement {
                id: *id,
                terms,
                signed,
                needs: None,
                invalid: refused,
                exists: Some(exists),
                ready: exists,
            });
        };
        let parent = &lineage[1].1;
        let st = self.clone_static(parent, &terms, &lineage[1..], rollback)?;
        let (needs, mut invalid) = match st {
            Ok(n) => (Some(n), refused),
            Err(e) => (None, Some(e)),
        };
        let parent_signers = self.signers(id, &parent.parties);
        let all_sigs: Vec<Hash> = self.signers(id, &union(&terms.parties, &parent.parties));
        if !terms.is_collective() {
            let parent_exists = self.agreement(&pid)?.exists == Some(true);
            let voices = self.deal_voices(id, &lineage)?;
            if invalid.is_none() {
                let mut a = terms.field4.mark().map(|m| m[0].signers.clone()).unwrap_or_default();
                let mut b = voices.clone();
                a.sort();
                b.sort();
                if a != b {
                    invalid = Some(
                        "a deal's clone names the clone rule and every party whose voice remains in its mark (rule 45b)".into(),
                    );
                }
            }
            let mut holders_signed = true;
            // Rule 94: in a deal, the version names the transfers it counts
            // (field 31); a transfer it counts makes its buyer the holder
            // asked, one it does not name counts nothing, its seller holding
            // for it.
            let counted = terms.transfers_counted.clone().unwrap_or_default();
            let as_counted = {
                let mut p = parent.clone();
                if !counted.is_empty() {
                    for (i, st) in p.stakes.iter_mut().flatten().enumerate() {
                        st.holders = self.roster_with(i, st, &counted).into_iter().filter(|(_, n)| *n > 0).map(|(h, n)| (Who::Id(h), n)).collect();
                    }
                }
                p
            };
            let (mut asked, _) = Self::must_sign_parts(&as_counted, &terms);
            for h in super::pay::pay_signers_by(parent, &terms, &|i, st| self.roster_with(i, st, &counted)) {
                if !asked.contains(&h) {
                    asked.push(h);
                }
            }
            for h in asked {
                if self.signers(id, &[h]).is_empty() && !self.moved_by_abandonment(&h, parent, &terms, id, &lineage[1..], None, &[])? {
                    holders_signed = false;
                }
            }
            let complete = invalid.is_none()
                && parent_exists
                && voices.iter().all(|p| parent_signers.contains(p))
                && Self::newcomers(parent, &terms).iter().all(|p| all_sigs.contains(p))
                && holders_signed;
            // Rule 15: a verifier that cannot follow every layer answers unknown.
            if invalid.is_none() && parent_exists && holders_signed {
                let mut unsigned: Vec<Hash> = voices.iter().filter(|p| !parent_signers.contains(p)).copied().collect();
                unsigned.extend(Self::newcomers(parent, &terms).into_iter().filter(|p| !all_sigs.contains(p)));
                if let Some(x) = self.unfollowed(id, &unsigned) {
                    return Err(AgreementsError::Missing(x));
                }
            }
            return Ok(Agreement {
                id: *id,
                terms,
                signed,
                needs,
                invalid,
                exists: Some(complete),
                ready: complete,
            });
        }
        if invalid.is_none() {
            invalid = self.coverage(&terms);
        }
        // S1: in its own terms, the collective is written null, never by its
        // identity: one meaning, one encoding (reading, as B8).
        if invalid.is_none() {
            if let Some(c) = self.collective_of(id)? {
                let me = Who::Id(c);
                if terms.stakes.iter().flatten().any(|s| s.object == me || s.holders.iter().any(|(h, _)| *h == me)) {
                    invalid = Some("in its own terms the collective is written null, never by its identity (S1)".into());
                }
            }
        }
        let mark = terms.field4.mark().unwrap_or(&[]);
        let mut holders_signed = true;
        for h in Self::must_sign(parent, &terms) {
            if self.signers(id, &[h]).is_empty() && !self.moved_by_abandonment(&h, parent, &terms, id, &lineage[1..], None, &[])? {
                holders_signed = false;
            }
        }
        let ready = invalid.is_none()
            && mark.iter().all(|e| e.signers.iter().all(|s| all_sigs.contains(s)))
            && Self::newcomers(parent, &terms).iter().all(|p| all_sigs.contains(p))
            && holders_signed;
        Ok(Agreement {
            id: *id,
            terms,
            signed,
            needs,
            invalid,
            exists: None,
            ready,
        })
    }

    /// The parties of a deal's parent whose voice remains for its clone
    /// `id` (rule 45b, Q28): in a deal a declaration draws its own line, so
    /// a valid declaration with outcome 0 removes a party's voice from then
    /// on, and that party's signature act on the clone still counts only
    /// where the deal's keepers recorded it before recording the
    /// declaration (rules 8, 11, 11a; B9).
    fn deal_voices(&self, id: &Hash, lineage: &[(Hash, Terms)]) -> R<Vec<Hash>> {
        let up = &lineage[1..];
        let parent = &up[0].1;
        let mut out = vec![];
        for p in &parent.parties {
            let mut gone = false;
            // B19: the authority is one identity, which signs alone; terms
            // naming a threshold of the parties are invalid in a deal.
            for (x, _, _, _) in self.declarations_against(p, up, &parent.parties, id, None, &[outcomes::VOICE_REMOVED])? {
                let placed = self
                    .valid_sigs(id, &[*p])
                    .iter()
                    .any(|(_, s)| self.keepers_before(parent, s, &x));
                if !placed {
                    gone = true;
                    break;
                }
            }
            if !gone {
                out.push(*p);
            }
        }
        Ok(out)
    }

    /// Whether the keepers `t` names recorded `x` before recording `y`,
    /// as the keepers' own rule counts it (rule 8, B9).
    fn keepers_before(&self, t: &Terms, x: &Hash, y: &Hash) -> bool {
        let Some(k) = &t.keepers else { return false };
        let placed: Vec<Hash> = k
            .operators
            .iter()
            .filter(|op| self.keeper_before(op, x, y))
            .copied()
            .collect();
        !placed.is_empty() && k.rule.met(&k.operators, &placed)
    }

    /// The powers a clone needs (rule 44c).
    pub fn powers_needed(&self, clone: &Terms) -> R<Vec<Power>> {
        let p = clone.parent.ok_or(AgreementsError::Check("not a clone"))?;
        powers_needed(&self.terms(&p)?, clone, &self.mirs, &self.ext())
    }

    // ------------------------------------------------------------ the collective

    fn col(&self, id: &Hash) -> Col {
        Col {
            id: *id,
            res: self.v.resolve(id),
        }
    }

    /// The agreement declared in force for `identity` at the chain act
    /// `binding` (Identity rule 8b). `None` when the identity declares none,
    /// or the binding does not count.
    pub fn declared(&self, identity: &Hash, binding: &Hash) -> Option<Hash> {
        let res = self.v.resolve(identity);
        let k = res.position_of(binding)?;
        declared_in(&res.states[k].declarations, &self.agreements())?
            .ok()
            .map(|d| d.agreement)
    }

    /// Whether any chain act up to `k` declares an agreement.
    fn declares(&self, col: &Col, k: usize) -> bool {
        col.res.states[..=k]
            .iter()
            .any(|s| declared_in(&s.declarations, &self.agreements()).is_some())
    }

    /// The agreement in force at link `k` from the chain's declarations
    /// alone (before any record under that key), checked (rule 37, Flaw M);
    /// in a broken stretch, why Agreements read the collective as broken (rule
    /// 37d, F185).
    fn base(&self, col: &Col, k: usize) -> R<Result<Hash, String>> {
        Ok(match self.chain_state(col, k)? {
            ChainState::InForce(h) => Ok(h),
            ChainState::Broken { reason, .. } => Err(reason),
        })
    }

    /// The chain read up to link `k` (rules 37, 37d): the agreement it
    /// declares in force there, or the collective broken. A rotation whose
    /// declared agreement fails rule 37 is the broken act; from it on,
    /// only a rollback naming it brings the collective back (F185). A
    /// rotation whose Agreements declaration is missing or in neither form is a
    /// broken act too, with the same way back (RB4).
    fn chain_state(&self, col: &Col, k: usize) -> R<ChainState> {
        if let Some(x) = self.chains.borrow().get(&(col.id, k)) {
            return Ok(x.clone());
        }
        let x = self.chain_state_inner(col, k)?;
        self.chains.borrow_mut().insert((col.id, k), x.clone());
        Ok(x)
    }

    fn chain_state_inner(&self, col: &Col, k: usize) -> R<ChainState> {
        let mut cur: Option<Hash> = None;
        // In a broken stretch: the broken act's link, the agreement in
        // force just before it, and Agreements' reason.
        let mut broken: Option<(usize, Hash, String)> = None;
        for j in 0..=k {
            let dd = declared_in(&col.res.states[j].declarations, &self.agreements());
            if let Some((bj, before, _)) = &broken {
                // Every rotation of the broken stretch counts for nothing,
                // save a rollback naming the broken act that completes.
                if let Some(Ok(d)) = &dd {
                    if let (Some(rb), Some(sigs)) = (&d.rollback, &d.signatures) {
                        if rb.broken == col.res.links[*bj].act
                            && self.rollback_at(col, j, *bj, before, &d.agreement, sigs, &rb.registers)?.is_ok()
                        {
                            cur = Some(d.agreement);
                            broken = None;
                        }
                    }
                }
                continue;
            }
            let d = match (dd, cur) {
                (None, None) => continue,
                (Some(Err(_)), None) => return Ok(ChainState::Broken {
                    reason: "an Agreements declaration in neither form".into(),
                    act: None,
                }),
                // RB4 (decided 9 October 2026): a rotation whose Agreements
                // declaration is missing or unreadable is a broken act, a
                // technical one, with the same way back.
                (None, Some(c)) => {
                    let before = self.in_force_at_rotation(col, j, c)?.agreement;
                    broken = Some((j, before, "a rotation removed the collective's agreement: its Agreements declaration is missing (rule 37d, RB4)".into()));
                    continue;
                }
                (Some(Err(_)), Some(c)) => {
                    let before = self.in_force_at_rotation(col, j, c)?.agreement;
                    broken = Some((j, before, "a rotation's Agreements declaration cannot be read: it is in neither form (rule 37d, RB4)".into()));
                    continue;
                }
                (Some(Ok(d)), _) => d,
            };
            let changed = j == 0
                || declared_in(&col.res.states[j - 1].declarations, &self.agreements())
                    .and_then(|x| x.ok())
                    .as_ref()
                    != Some(&d);
            if !changed {
                // A rotation that declares nothing new changes keys, not
                // rules: the agreement in force carries forward, records
                // included (Flaw B1), since the records made since the last
                // declaration keep counting ([`Self::records_since`]).
                continue;
            }
            let Some(c) = cur else {
                if d.signatures.is_some() {
                    return Ok(ChainState::Broken {
                        reason: "a genesis declares founding terms; a rotation declares a clone with its signature acts (Flaw M)".into(),
                        act: None,
                    });
                }
                let a = self.agreement(&d.agreement)?;
                let why = if a.terms.parent.is_some() {
                    Some("the first declared agreement is not founding terms")
                } else if !a.terms.is_collective() {
                    Some("the declared agreement has no key grammar")
                } else if a.exists != Some(true) {
                    Some("the founding agreement does not exist: a founder has not signed (Q11)")
                } else {
                    None
                };
                if let Some(w) = why {
                    return Ok(ChainState::Broken { reason: w.into(), act: None });
                }
                cur = Some(d.agreement);
                continue;
            };
            // A rotation after the agreement in force: its declared
            // agreement meets rule 37, or this rotation is the broken act.
            if let Some(w) = self.rotation_fails(col, j, c, &d)? {
                let before = self.in_force_at_rotation(col, j, c)?.agreement;
                broken = Some((j, before, w));
                continue;
            }
            cur = Some(d.agreement);
        }
        if let Some((bj, before, reason)) = broken {
            return Ok(ChainState::Broken {
                reason,
                act: Some((bj, before)),
            });
        }
        Ok(match cur {
            Some(h) => ChainState::InForce(h),
            None => ChainState::Broken {
                reason: "no agreement declared".into(),
                act: None,
            },
        })
    }

    /// Why rotation `j`'s declared agreement fails rule 37, the agreement
    /// `c` being declared in force before it; `None` when it meets it.
    fn rotation_fails(&self, col: &Col, j: usize, c: Hash, d: &Declared) -> R<Option<String>> {
        let Some(sigs) = &d.signatures else {
            return Ok(Some(
                "a genesis declares founding terms; a rotation declares a clone with its signature acts (Flaw M)".into(),
            ));
        };
        if d.rollback.is_some() {
            return Ok(Some("a rotation declares a rollback where the collective is not broken (rule 37d)".into()));
        }
        let at = self.in_force_at_rotation(col, j, c)?;
        let k_terms = self.terms(&d.agreement)?;
        if k_terms.parent != Some(at.agreement) {
            return Ok(Some(
                "the declared clone does not descend from the agreement in force at the rotation (rule 37)".into(),
            ));
        }
        let parent = self.terms(&at.agreement)?;
        if !changes(&parent, &k_terms)
            .iter()
            .any(|c| c.tier() == Tier::Constitutional)
        {
            return Ok(Some("a rotation declares only a clone that changes the constitutional tier (rule 37, B5)".into()));
        }
        if let Some(w) = self.recovery_signatures(col, j, &at.agreement, &d.agreement, d.absence.as_deref())? {
            return Ok(Some(w));
        }
        let own = self.recovery_departures(col, j, &at.agreement, &d.agreement)?;
        Ok(match self.clone_at(col, &d.agreement, sigs, Line::Rotation(j), &own)? {
            CloneState::Complete => None,
            CloneState::Draft(w) | CloneState::Invalid(w) => Some(format!(
                "the rotation's declared clone is not complete with the signature acts it names: {w}"
            )),
        })
    }

    /// A rollback at rotation `r` (rule 37d, F185): its clone `k` is a clone
    /// of `before`, the agreement in force just before the broken act,
    /// marked with the rollback's powers, and complete at `r` with the
    /// signature acts `sigs` alone, counted among the voices that remain
    /// there, the departures it registers in effect; never the clone the
    /// broken act at link `bj` declared, which stays on its own branch,
    /// never in force (F187, 5). Why not, otherwise.
    #[allow(clippy::too_many_arguments)]
    fn rollback_at(&self, col: &Col, r: usize, bj: usize, before: &Hash, k: &Hash, sigs: &[Hash], registers: &[Hash]) -> R<Result<(), String>> {
        if let Some(Ok(d)) = declared_in(&col.res.states[bj].declarations, &self.agreements()) {
            if &d.agreement == k {
                return Ok(Err(
                    "the rollback's clone is the clone the broken act declared, which stays on its own branch, never in force (rule 37d, F187)".into(),
                ));
            }
        }
        if self.terms(k)?.parent.as_ref() != Some(before) {
            return Ok(Err(
                "the rollback's clone is not a clone of the agreement in force just before the broken act (rule 37d)".into(),
            ));
        }
        let own = match self.rollback_departures(col, Some(r), before, registers)? {
            Ok(x) => x,
            Err(w) => return Ok(Err(w)),
        };
        Ok(match self.clone_at_as(col, k, sigs, Line::Rotation(r), &own, true)? {
            CloneState::Complete => Ok(()),
            CloneState::Draft(w) | CloneState::Invalid(w) => Err(format!(
                "the rollback's clone is not complete with the signature acts it names: {w}"
            )),
        })
    }

    /// The departures a rollback registers (rule 37d, "Collectives in the
    /// identity chain"): resignations and steppings down (type 16) by
    /// parties of `before`, naming it or an agreement it descends from by
    /// clones; and declarations of absence (type 13) with outcome 0 against
    /// such a party, under the clause of `before` or an agreement it
    /// descends from, made during the broken stretch or before it (RB3,
    /// decided 9 October 2026), each with the signature acts of the other
    /// parties it needs, which the rollback names beside it and places
    /// (as a recovery rotation does, Flaw B18). The declarations' authority
    /// is counted at the rollback at link `at`, the resignations it
    /// registers in effect, other declarations not, as a record counts it;
    /// with `at` none, at a rollback made next, every signature act it names
    /// placed there (what a client checks before the rotation, F187 2).
    /// Anything else there, and the rollback puts nothing in force.
    fn rollback_departures(&self, col: &Col, at: Option<usize>, before: &Hash, registers: &[Hash]) -> R<Result<Vec<Departure>, String>> {
        let t = self.terms(before)?;
        let lineage: Vec<Hash> = self.lineage(before)?.into_iter().map(|(i, _)| i).collect();
        let mut out = vec![];
        let mut declarations: Vec<(Hash, Hash)> = vec![];
        let mut cosigned: Vec<Hash> = vec![];
        for x in registers {
            let Some(a) = self.v.get(x) else {
                return Ok(Err("the rollback registers an act this verifier does not hold".into()));
            };
            if self.is_agreements(a, types::DECLARATION) {
                let Some(p) = a.act.outside.signer else {
                    return Ok(Err("the rollback registers a declaration with no signer".into()));
                };
                declarations.push((*x, p));
                continue;
            }
            if self.is_agreements(a, types::SIGNATURE) {
                cosigned.push(*x);
                continue;
            }
            if !self.is_agreements(a, types::RESIGNATION) {
                return Ok(Err(
                    "a rollback registers resignations, steppings down and declarations of absence, with the signature acts on those declarations (rule 37d, RB3)".into(),
                ));
            }
            let Some(p) = a.act.outside.signer.filter(|p| t.parties.contains(p)) else {
                return Ok(Err(
                    "the rollback registers a resignation of someone who is not a party of the agreement in force just before the broken act".into(),
                ));
            };
            // F302: as the rollback places it, whatever its signer's later
            // rotation disowned; a rollback still to be made places nothing
            // yet, so Identity's verdict alone.
            let kept = match at {
                Some(r) => self.kept_at(col, a, Line::Rotation(r))?,
                None => self.valid(x),
            };
            if !kept {
                return Ok(Err("the rollback registers a resignation that is not valid".into()));
            }
            let Ok(res) = Resignation::decode(&a.inside) else {
                return Ok(Err("the rollback registers a resignation not in the format".into()));
            };
            if !lineage.contains(&res.agreement) {
                return Ok(Err(
                    "the rollback registers a resignation from an agreement not in force just before the broken act (rule 37a)".into(),
                ));
            }
            if at.is_none() && res.area.is_none() && self.resignation_spent(&p, before, &res.agreement, &res.drafts)? {
                return Ok(Err(
                    "the rollback registers a resignation its signer made before coming back: spent, it registers nothing (F189, 1)".into(),
                ));
            }
            if let (None, Some(area)) = (at, res.area) {
                if self.stepping_down_spent(&p, before, &res.agreement, area, &res.drafts)? {
                    return Ok(Err(
                        "the rollback registers a stepping down its signer made before holding the area again: spent, it registers nothing (QF6)".into(),
                    ));
                }
            }
            let kind = match res.area {
                None => DepartureKind::Resigned { agreement: res.agreement },
                Some(area) => {
                    if !self.terms(&res.agreement)?.area(area).is_some_and(|ar| ar.holders.contains(&p)) {
                        return Ok(Err(
                            "the rollback registers a stepping down from an area its signer does not hold".into(),
                        ));
                    }
                    DepartureKind::SteppedDown { agreement: res.agreement, area }
                }
            };
            out.push(Departure { act: *x, party: p, kind });
        }
        // Each signature act it names must be a valid signature on one of
        // the declarations it registers (Flaw B18's rule, at the rollback).
        for s in &cosigned {
            let sh = self.held(s)?;
            let named = decode_signature(&sh.inside).ok();
            let kept = match at {
                Some(r) => self.kept_at(col, sh, Line::Rotation(r))?,
                None => self.valid(s),
            };
            if !kept || !named.is_some_and(|n| declarations.iter().any(|(d, _)| *d == n)) {
                return Ok(Err(
                    "the rollback names a signature act that is no valid signature on a declaration it registers (rule 37d, RB3)".into(),
                ));
            }
        }
        let others = out.clone();
        for (x, signer) in declarations {
            let by = match at {
                Some(r) => col.res.links[r].act,
                None => x,
            };
            let used = match at {
                Some(r) => self.declaration_used(&x, &by, Some((col, Line::Rotation(r), before)))?,
                None => self.declaration(&x)?,
            };
            let (d, clause) = match used {
                Ok(v) => v,
                Err(w) => return Ok(Err(format!("the rollback registers a declaration that fails: {w}"))),
            };
            if !t.parties.contains(&d.party) {
                return Ok(Err(
                    "the rollback registers a declaration against someone who is not a party of the agreement in force just before the broken act".into(),
                ));
            }
            if !d.outcomes.contains(&outcomes::VOICE_REMOVED) {
                return Ok(Err("the rollback registers a declaration that removes no voice (outcome 0)".into()));
            }
            if !lineage.contains(&d.agreement) {
                return Ok(Err(
                    "the rollback registers a declaration in an agreement not in force just before the broken act".into(),
                ));
            }
            let counted = match at {
                Some(r) => self.authority_at(col, Point::Line(Line::Rotation(r)), before, &clause, &d, &x, &signer, &others)?,
                None => self.authority_next(col, before, &clause, &d, &x, &signer, &others, &cosigned)?,
            };
            if let Err(w) = counted {
                return Ok(Err(format!("the rollback registers a declaration whose authority is not met: {w}")));
            }
            out.push(Departure {
                act: x,
                party: d.party,
                kind: DepartureKind::Declared { agreement: d.agreement },
            });
        }
        Ok(Ok(out))
    }

    /// A declaration's authority at a rollback made next (RB3, F187 2): as
    /// [`Self::authority_at`] counts it, among the other parties of
    /// `before` whose voice remains, the signer with the signers of the
    /// signature acts `named` on it, each placed by the rollback.
    #[allow(clippy::too_many_arguments)]
    fn authority_next(&self, col: &Col, before: &Hash, clause: &Abandonment, d: &AbsenceDeclaration, decl: &Hash, signer: &Hash, own: &[Departure], named: &[Hash]) -> R<Result<(), String>> {
        let Authority::Others(k) = clause.authority else {
            return Ok(Ok(()));
        };
        let t = self.terms(before)?;
        let others: Vec<Hash> = t.parties.iter().filter(|p| **p != d.party).copied().collect();
        let (_, remaining) = self.voices(col, Point::Tip, before, &others, None, &BTreeMap::new(), own)?;
        if !remaining.contains(signer) {
            return Ok(Err("its signer is not among the other parties whose voice remains at the line (rule 49, Q37)".into()));
        }
        let Some(need) = Rule::Threshold(k).needed(remaining.len()) else {
            return Ok(Err("no other voice remains to declare absence".into()));
        };
        let mut signed = vec![*signer];
        for (who, s) in self.valid_sigs(decl, &remaining) {
            if !signed.contains(&who) && named.contains(&s) {
                signed.push(who);
            }
        }
        if signed.len() >= need {
            return Ok(Ok(()));
        }
        Ok(Err(format!(
            "it has {} of the {need} signatures of the other parties its number needs, named by the rollback (rule 49, B15; rule 37d, RB3)",
            signed.len()
        )))
    }

    /// The rollbacks that count up to link `upto`, each the rotation's link
    /// and the departures it registers, which take effect there (rule 37d):
    /// rotations whose Agreements declaration is a rollback, new at that link, and
    /// at which the chain is in force.
    fn rollback_lines(&self, col: &Col, upto: usize) -> R<Vec<(usize, Hash, Vec<Departure>)>> {
        let mut out = vec![];
        for m in 1..=upto.min(col.res.states.len().saturating_sub(1)) {
            let Some(Ok(d)) = declared_in(&col.res.states[m].declarations, &self.agreements()) else {
                continue;
            };
            let Some(rb) = &d.rollback else { continue };
            if self.declared_at(col, m) != m || self.base(col, m)?.is_err() {
                continue;
            }
            let Some(before) = self.terms(&d.agreement)?.parent else { continue };
            if let Ok(own) = self.rollback_departures(col, Some(m), &before, &rb.registers)? {
                out.push((m, d.agreement, own));
            }
        }
        Ok(out)
    }

    /// Where Agreements read the collective as broken, and a rollback can bring it
    /// back (rule 37d, F185): the broken act (a rotation, by its id), the
    /// agreement in force just before it, and Agreements' reason. `None` where it
    /// is not broken, is no collective, or is broken with no way back.
    pub fn broken_act(&self, collective: &Hash) -> R<Option<BrokenAct>> {
        let col = self.col(collective);
        if col.res.links.is_empty() {
            return Ok(None);
        }
        let b = col.res.links.len() - 1;
        if !self.declares(&col, b) {
            return Ok(None);
        }
        Ok(match self.chain_state(&col, b)? {
            ChainState::Broken { reason, act: Some((j, before)) } => Some(BrokenAct {
                act: col.res.links[j].act,
                before,
                reason,
            }),
            _ => None,
        })
    }

    /// Who counts for a power of the agreement in force just before the
    /// broken act, at a rollback made next (rules 37d, 44d): as
    /// [`Self::next_voices`] counts it at the next line, the departures
    /// registered on lines before the broken act in effect, none of the
    /// broken stretch's, and `leaving` taken out (the parties whose
    /// resignations the rollback will register). What a client names in a
    /// rollback's mark. Err: why there is no such count (not broken, or
    /// broken with no way back).
    pub fn rollback_voices(&self, collective: &Hash, power: &Power, leaving: &[Hash]) -> R<Result<NextVoices, String>> {
        let col = self.col(collective);
        let Some(b) = self.broken_act(collective)? else {
            return Ok(Err(match self.broken(collective)? {
                Some(w) => format!("broken with no way back by a rollback: {w}"),
                None => "not broken: there is nothing to roll back".into(),
            }));
        };
        let parent = self.terms(&b.before)?;
        let Some((among, rule)) = power_base(&parent, power) else {
            return Ok(Err("a succession plan is counted as rule 48c says, not here".into()));
        };
        if matches!(power, Power::Area(a) if parent.area(*a).is_none()) {
            return Ok(Err("that agreement has no such area".into()));
        }
        let area = match power {
            Power::Area(a) => Some(*a),
            _ => None,
        };
        let (voices, _) = self.voices(&col, Point::Tip, &b.before, &among, area, &BTreeMap::new(), &[])?;
        let voices: Vec<Hash> = voices.into_iter().filter(|v| !leaving.contains(v)).collect();
        let needed = rule.needed(voices.len());
        Ok(Ok(NextVoices {
            agreement: b.before,
            among,
            voices,
            needed,
        }))
    }

    /// What a rollback made next would register (rule 37d, RB3), checked
    /// from what this verifier holds: each act `registers` names held, a
    /// resignation or stepping down of a party of the agreement in force
    /// just before the broken act, or a declaration of absence with the
    /// signature acts its authority needs. What a client asks before it
    /// sends the rotation (F187, 2). Err: why a rollback registering them
    /// would put nothing in force, or why there is no rollback to make.
    pub fn rollback_registers(&self, collective: &Hash, registers: &[Hash]) -> R<Result<Vec<Departure>, String>> {
        let col = self.col(collective);
        let Some(b) = self.broken_act(collective)? else {
            return Ok(Err("not broken with a way back: there is nothing to roll back".into()));
        };
        self.rollback_departures(&col, None, &b.before, registers)
    }

    /// The resignations the parties of a collective's agreement have
    /// published, registered or not (rule 37a; F187, 3): each a valid
    /// resignation of the whole voice (type 16, no area) by a party of the
    /// agreement in force, or, during a broken stretch, of the agreement in
    /// force just before the broken act, naming it or an agreement it
    /// descends from. Agreements count a resignation only once a line registers
    /// it; a client reads these too, so that the last voice is warned when
    /// the others resigned from other devices. Empty where the collective
    /// has no agreement Agreements can name.
    pub fn published_resignations(&self, collective: &Hash) -> R<Vec<Departure>> {
        let ag = match self.broken_act(collective)? {
            Some(b) => b.before,
            None => match self.current(collective) {
                Ok(Some(c)) => c.agreement,
                _ => return Ok(vec![]),
            },
        };
        let t = self.terms(&ag)?;
        let lineage: Vec<Hash> = self.lineage(&ag)?.into_iter().map(|(i, _)| i).collect();
        let mut out = vec![];
        for p in &t.parties {
            for h in self.v.signed_by(p) {
                if !self.is_agreements(h, types::RESIGNATION) || !self.valid(&h.id) {
                    continue;
                }
                let Ok(r) = Resignation::decode(&h.inside) else { continue };
                if r.area.is_none() && lineage.contains(&r.agreement) && !self.resignation_spent(p, &ag, &r.agreement, &r.drafts)? {
                    out.push(Departure { act: h.id, party: *p, kind: DepartureKind::Resigned { agreement: r.agreement } });
                }
            }
        }
        Ok(out)
    }

    /// The declarations of absence naming `party` that this verifier holds
    /// (type 13, rule 51), valid under Identity, each with its signer, as
    /// held: client conformance (RB3, decided 9 October 2026): a
    /// declaration naming a party MUST always be shown to that party, broken
    /// collective or not, with the way to contest it (rule 52).
    pub fn declarations_naming(&self, party: &Hash) -> Vec<(Hash, Hash, AbsenceDeclaration)> {
        let mut out = vec![];
        for h in self.v.held_acts() {
            if !self.is_agreements(h, types::DECLARATION) || !self.valid(&h.id) {
                continue;
            }
            let Ok(d) = AbsenceDeclaration::decode(&h.inside) else { continue };
            if &d.party == party {
                out.push((h.id, h.act.outside.signer.unwrap_or_default(), d));
            }
        }
        out
    }

    /// The numbers on the splits a service made under a deal (DQ6, decided
    /// 9 October 2026): one numbering across every split the service
    /// makes under the deal, on any branch of a fork. Client conformance:
    /// a holder's client MUST raise the alarm where the numbers it receives
    /// skip, since splits are then being made where it is not shown. Given
    /// the splits this verifier holds (those it received): the numbers
    /// missing below the highest, the numbers carried twice, and the
    /// splits carrying none.
    pub fn split_numbers(&self, service: &Hash, agreement: &Hash) -> R<SplitNumbers> {
        // One numbering across every split the service makes under the
        // publication `agreement` (its first version).
        let root = *agreement;
        let mut seen: BTreeMap<u64, Vec<Hash>> = BTreeMap::new();
        let mut unnumbered = vec![];
        for (h, sp) in self.splits_of(service) {
            if sp.publication != root {
                continue;
            }
            match sp.number {
                Some(n) => seen.entry(n).or_default().push(h.id),
                None => unnumbered.push(h.id),
            }
        }
        let top = seen.keys().next_back().copied().unwrap_or(0);
        Ok(SplitNumbers {
            gaps: (1..=top).filter(|n| !seen.contains_key(n)).collect(),
            repeated: seen.iter().filter(|(_, v)| v.len() > 1).map(|(n, _)| *n).collect(),
            numbers: seen.into_iter().flat_map(|(n, v)| v.into_iter().map(move |h| (n, h))).collect(),
            unnumbered,
        })
    }

    /// The contests of a declaration of absence (type 14, rule 52; BQ4,
    /// decided 9 October 2026): valid contests naming it, each signed by
    /// the party it declares absent, which shows presence. A contest voids
    /// nothing: it is shown beside the declaration. One carrying field 1,
    /// which only a purchase's contest may (F386), shows nothing.
    pub fn contests(&self, declaration: &Hash) -> R<Vec<Hash>> {
        let Some(dh) = self.v.get(declaration) else { return Ok(vec![]) };
        if !self.is_agreements(dh, types::DECLARATION) {
            return Ok(vec![]);
        }
        let Ok(d) = AbsenceDeclaration::decode(&dh.inside) else { return Ok(vec![]) };
        Ok(self
            .v
            .signed_by(&d.party)
            .filter(|h| {
                self.is_agreements(h, types::CONTEST)
                    && self.valid(&h.id)
                    && Contest::decode(&h.inside).is_ok_and(|c| c.vow.is_none() && c.promise.is_none() && &c.act == declaration)
            })
            .map(|h| h.id)
            .collect())
    }

    /// The broken stretches of a collective's chain (rule 37d): each broken
    /// act's link, and the link of the rollback that ended it, if any.
    fn stretches(&self, col: &Col) -> R<Vec<(usize, Option<usize>)>> {
        let mut out: Vec<(usize, Option<usize>)> = vec![];
        for k in 0..col.res.links.len() {
            match self.chain_state(col, k)? {
                ChainState::Broken { act: Some((bj, _)), .. } => {
                    if out.last().is_none_or(|(b, r)| *b != bj || r.is_some()) {
                        out.push((bj, None));
                    }
                }
                ChainState::InForce(_) => {
                    if let Some(last) = out.last_mut() {
                        if last.1.is_none() {
                            last.1 = Some(k);
                        }
                    }
                }
                ChainState::Broken { act: None, .. } => {}
            }
        }
        Ok(out)
    }

    /// Why an act for the collective `y` lies in a broken stretch of the
    /// collective (rule 93): its history holds the broken act, or a
    /// rotation after it, and not the rollback. `None` otherwise.
    fn in_a_stretch(&self, col: &Col, y: &Held) -> R<Option<String>> {
        let Some(at) = self.act_link(col, y) else { return Ok(None) };
        for (bj, rj) in self.stretches(col)? {
            if at < bj || rj.is_some_and(|r| at >= r) {
                continue;
            }
            return Ok(Some(match rj {
                None => "the collective is broken: an act of the broken stretch counts for nothing (rule 93)".into(),
                Some(_) => "made during a broken stretch since rolled back: an act of the stretch counts for nothing, for good; what is still wanted is signed anew, citing the rollback (rule 93)".into(),
            }));
        }
        Ok(None)
    }

    /// The agreement in force just before rotation `j`: the one declared
    /// last before it (`base`), and the clones recorded since, before it.
    fn in_force_at_rotation(&self, col: &Col, j: usize, base: Hash) -> R<InForce> {
        let mut puts = vec![];
        for r in self.records_since(col, j - 1) {
            if self.before_struct(col, r, Line::Rotation(j)) {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push((k, e.resolves));
                }
            }
        }
        self.fold(base, &puts)
    }

    /// The link at which the agreement the chain declares at link `k` was
    /// declared: the genesis, or the latest rotation up to `k` whose Agreements
    /// declaration differs from the one before it.
    fn declared_at(&self, col: &Col, k: usize) -> usize {
        let agreements = self.agreements();
        let mut d = 0;
        for j in 1..=k.min(col.res.states.len().saturating_sub(1)) {
            let a = declared_in(&col.res.states[j - 1].declarations, &agreements).and_then(|x| x.ok());
            let b = declared_in(&col.res.states[j].declarations, &agreements).and_then(|x| x.ok());
            if a != b {
                d = j;
            }
        }
        d
    }

    /// The records that can bear on the agreement in force at link `k`:
    /// those bound at every link since the agreement the chain declares
    /// there was declared. A rotation that declares nothing new carries
    /// them forward (Flaw B1); one that declares a clone supersedes them.
    fn records_since(&self, col: &Col, k: usize) -> Vec<&'a Held> {
        (self.declared_at(col, k)..=k)
            .flat_map(|j| self.records_at(col, j))
            .collect()
    }

    /// The collective's records at link `k`: records for the collective,
    /// valid under Identity, whose history's latest link is `k`.
    fn records_at(&self, col: &Col, k: usize) -> Vec<&'a Held> {
        self.col_acts(col)
            .into_iter()
            .filter(|h| self.is_agreements(h, types::RECORD) && self.valid(&h.id) && self.act_link(col, h) == Some(k))
            .collect()
    }

    /// Follow the agreement chain through the clones these records put in
    /// force: one clone at a time; two different clones of one parent on
    /// records neither before the other are a fork, and the parent stays
    /// in force (A4; the fork rule's format is open, Q38), until a clone of
    /// the latest clone of one branch, recorded after both lines, resolves
    /// it (rule 47, B11). Each put carries whether its record resolved a
    /// fork; a fork's `branches` are its branches' latest clones.
    fn fold(&self, base: Hash, puts: &[(Hash, bool)]) -> R<InForce> {
        let mut cur = base;
        for _ in 0..=puts.len() {
            let next = self.children(&cur, puts, true)?;
            match next.len() {
                0 => break,
                1 => cur = next[0],
                _ => {
                    let mut tips = vec![];
                    for n in &next {
                        if let Some(t) = self.branch_tip(n, puts)? {
                            tips.push(t);
                        }
                    }
                    let mut res: Vec<Hash> = vec![];
                    for (k, r) in puts {
                        if *r
                            && self.terms(k)?.parent.is_some_and(|p| tips.contains(&p))
                            && !res.contains(k)
                        {
                            res.push(*k);
                        }
                    }
                    if res.len() == 1 {
                        cur = res[0];
                        continue;
                    }
                    return Ok(InForce {
                        agreement: cur,
                        fork: true,
                        branches: tips,
                    });
                }
            }
        }
        Ok(InForce {
            agreement: cur,
            fork: false,
            branches: vec![],
        })
    }

    /// The distinct clones put in force whose parent is `of`; with
    /// `resolvers` false, leaving out those whose record resolved a fork.
    fn children(&self, of: &Hash, puts: &[(Hash, bool)], resolvers: bool) -> R<Vec<Hash>> {
        let mut out: Vec<Hash> = vec![];
        for (k, r) in puts {
            if (resolvers || !*r) && self.terms(k)?.parent.as_ref() == Some(of) && !out.contains(k) {
                out.push(*k);
            }
        }
        Ok(out)
    }

    /// The latest clone of a fork's branch starting at `n`, followed one
    /// clone at a time; `None` where the branch forks again.
    fn branch_tip(&self, n: &Hash, puts: &[(Hash, bool)]) -> R<Option<Hash>> {
        let mut cur = *n;
        for _ in 0..=puts.len() {
            let kids = self.children(&cur, puts, false)?;
            match kids.len() {
                0 => return Ok(Some(cur)),
                1 => cur = kids[0],
                _ => return Ok(None),
            }
        }
        Ok(Some(cur))
    }

    // ------------------------------------------------------------ before and after

    /// Whether the act `x` precedes the line `l` on the collective's chain
    /// ("Made before, made after", 1): in the history the line cites: what
    /// a record names on the chain, what a rotation's signature acts name
    /// there, and whatever the acts so reached name, transitively. A link
    /// of the identity chain is before a rotation at a later position.
    /// Lines are ordered among themselves this way alone.
    fn before_struct(&self, col: &Col, x: &Held, l: Line) -> bool {
        if let (Some(i), Line::Rotation(j)) = (col.res.position_of(&x.id), l) {
            return i < j;
        }
        match l {
            Line::Rotation(j) => self.rotation_history(col, j).acts.contains(&x.id),
            Line::Record(lh) => x.id != lh.id && self.history(col, &Self::cites(lh, &col.id)).acts.contains(&x.id),
        }
    }

    /// A rotation's history (rule 58): the histories of the signature acts
    /// its Agreements declaration names, its clone's and those it places.
    fn rotation_history(&self, col: &Col, j: usize) -> Rc<History> {
        self.history(col, &self.rotation_sigs(col, j))
    }

    /// The signature acts rotation `j`'s Agreements declaration names.
    fn rotation_sigs(&self, col: &Col, j: usize) -> Vec<Hash> {
        let Some(st) = col.res.states.get(j) else { return vec![] };
        match declared_in(&st.declarations, &self.agreements()) {
            Some(Ok(d)) => {
                let regs = d.rollback.as_ref().map(|rb| rb.registers.clone());
                d.signatures.iter().flatten().chain(d.absence.iter().flatten()).chain(regs.iter().flatten()).copied().collect()
            }
            _ => vec![],
        }
    }

    // ------------------------------------------------------------ the two chains (F127)

    /// The acts `x` names on the collective's chain: its `objects` entries
    /// whose chain is the collective's identity. For an action: its previous
    /// actions (the heads it joins) and the decision it acts under (F127).
    fn cites(x: &Held, c: &Hash) -> Vec<Hash> {
        x.inside
            .objects
            .iter()
            .flatten()
            .filter(|o| &o.chain == c)
            .map(|o| o.predecessor)
            .collect()
    }

    /// Whether `h` is a decision of the collective an action can act under
    /// (rule 58): its genesis or a rotation counting in its identity chain,
    /// or one of its records, grants or revocations, acts for it.
    fn is_decision(&self, col: &Col, h: &Held) -> bool {
        col.res.position_of(&h.id).is_some()
            || ((self.is_agreements(h, types::RECORD) || self.is_agreements(h, types::GRANT) || self.is_agreements(h, types::REVOCATION)) && Self::for_col(col, h))
    }

    /// The history cited from `start` on the collective's chain (rule 58,
    /// "Made before, made after", 1): each act and what it names on the
    /// collective's chain, transitively; for a rotation reached, the
    /// signature acts its Agreements declaration names. A member's own
    /// `prev` is never followed.
    fn history(&self, col: &Col, start: &[Hash]) -> Rc<History> {
        let key = (col.id, start.to_vec());
        if let Some(h) = self.histories.borrow().get(&key) {
            return h.clone();
        }
        let mut acts = BTreeSet::new();
        let mut missing = BTreeSet::new();
        let mut todo: Vec<Hash> = start.to_vec();
        let mut steps = 0usize;
        while let Some(y) = todo.pop() {
            steps += 1;
            if steps > 1_000_000 || !acts.insert(y) {
                continue;
            }
            if let Some(j) = col.res.position_of(&y) {
                if j > 0 {
                    todo.extend(self.rotation_sigs(col, j));
                }
                continue;
            }
            let Some(h) = self.v.get(&y) else {
                missing.insert(y);
                continue;
            };
            todo.extend(Self::cites(h, &col.id));
            // A person's own sequence, its grant keys' strands among it, is
            // its chain (F352): its `prev` is followed. A collective signs no
            // act, so a member's `prev` never is.
            if h.act.outside.signer == Some(col.id) {
                if let Some([p]) = h.inside.prev.as_deref() {
                    todo.push(*p);
                }
            }
        }
        let h = Rc::new(History { acts, missing });
        self.histories.borrow_mut().insert(key, h.clone());
        h
    }

    /// Why an act for the collective is not on its chain (rule 58), if it
    /// is not: an action cites the decision it acts under (a record, a link
    /// of the collective's identity chain, or, for a grantee, its grant),
    /// and names on the chain nothing but acts on it.
    fn uncited(&self, col: &Col, x: &Held, _b: Option<usize>) -> R<Option<String>> {
        if x.inside.spec == self.mirs.identity {
            return Ok(None);
        }
        let mut decision = false;
        for y in Self::cites(x, &col.id) {
            let h = self.held(&y)?;
            if self.is_decision(col, h) {
                decision = true;
            } else if !Self::for_col(col, h) {
                return Ok(Some("it names on the collective's chain an act that is not on it (rule 58)".into()));
            }
        }
        Ok((!decision).then(|| {
            "it does not cite, on the collective's chain, the decision it acts under: it is on no chain of the collective, and counts for nothing (rule 58)".into()
        }))
    }

    /// The records an action knows (rule 72): those its history holds.
    fn known_records(&self, col: &Col, x: &Held, _b: usize) -> R<Vec<&'a Held>> {
        let hist = self.history(col, &Self::cites(x, &col.id));
        let mut out = vec![];
        for y in &hist.acts {
            if let Some(h) = self.v.get(y) {
                if self.is_agreements(h, types::RECORD) && Self::for_col(col, h) {
                    out.push(h);
                }
            }
        }
        Ok(out)
    }

    /// The agreement in force for an action of the collective at link `b`
    /// (rule 72): the one the decisions its history holds leave in force:
    /// the chain's declarations, the records at earlier links carried
    /// forward, and, at its own link, the records its history holds. A
    /// record it does not cite, a concurrent one included, does not decide
    /// for it; where that record ends a power the act uses, the tie rule
    /// voids it (the departures, [`Self::voices`]; a fork or closing).
    fn in_force_action(&self, col: &Col, x: &'a Held, b: usize, base: Hash) -> R<InForce> {
        let known = self.known_records(col, x, b)?;
        let mut puts = vec![];
        for r in self.records_since(col, b) {
            if r.id == x.id {
                continue;
            }
            let counts = self.act_link(col, r).is_some_and(|k| k < b) || known.iter().any(|k| k.id == r.id);
            if counts {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push((k, e.resolves));
                }
            }
        }
        self.fold(base, &puts)
    }

    /// The agreement in force for a line, for its keepers (Q34).
    fn line_agreement(&self, col: &Col, l: Line) -> R<Option<Hash>> {
        match l {
            Line::Record(r) => Ok(self.record_eval(col, r)?.in_force_at),
            Line::Rotation(j) => match self.base(col, j - 1)? {
                Ok(b) => Ok(Some(self.in_force_at_rotation(col, j, b)?.agreement)),
                // A rollback's line: the agreement in force just before the
                // broken act, its clone's parent (rule 37d, F185).
                Err(_) => Ok(self.rollback_lines(col, j)?.into_iter().find(|(m, _, _)| *m == j).and_then(|(_, k, _)| self.terms(&k).ok()?.parent)),
            },
        }
    }

    /// Whether the collective's own act `x` counts as made before line `l`:
    /// on its sequences, or placed there by the keepers of the agreement in
    /// force for the line, who recorded it before recording the line (C4).
    /// Lines are never placed by keepers.
    fn before(&self, col: &Col, x: &Held, l: Line) -> R<bool> {
        if self.before_struct(col, x, l) {
            return Ok(true);
        }
        let placed = if self.is_agreements(x, types::RECORD) || !matches!(l, Line::Record(_)) {
            false
        } else {
            let ag = self.line_agreement(col, l)?;
            self.keepers_place(col, x, l, ag)?
        };
        if placed {
            return Ok(true);
        }
        // F304 (F298): "made after" is read only on a history held whole;
        // while an act the line's history names is not held, whether `x` is
        // before it is unknown, and nothing is void on it.
        if let Some(m) = self.line_hole(col, l) {
            return Err(AgreementsError::Missing(m));
        }
        Ok(false)
    }

    /// An act the history of line `l` names that this verifier does not
    /// hold, if any: the hole that keeps "made after" unknown.
    fn line_hole(&self, col: &Col, l: Line) -> Option<Hash> {
        let h = match l {
            Line::Rotation(j) => self.rotation_history(col, j),
            Line::Record(lh) => self.history(col, &Self::cites(lh, &col.id)),
        };
        h.missing.iter().next().copied()
    }

    /// Whether the keepers of agreement `ag`, in force for line `l`, place
    /// the collective's own act `x` before it (C4, Q34, B9).
    fn keepers_place(&self, col: &Col, x: &Held, l: Line, ag: Option<Hash>) -> R<bool> {
        if self.before_struct(col, x, l) {
            return Ok(true);
        }
        if self.is_agreements(x, types::RECORD) {
            return Ok(false);
        }
        let (Line::Record(lh), Some(ag)) = (l, ag) else {
            return Ok(false);
        };
        let Some(k) = self.terms(&ag)?.keepers else {
            return Ok(false);
        };
        let placed: Vec<Hash> = k
            .operators
            .iter()
            .filter(|op| self.keeper_before(op, &x.id, &lh.id))
            .copied()
            .collect();
        Ok(!placed.is_empty() && k.rule.met(&k.operators, &placed))
    }

    /// Whether the line `p` (a placement) is before the line `l`.
    fn line_before(&self, col: &Col, p: Line, l: Line) -> bool {
        match (p, l) {
            (Line::Record(ph), l) => self.before_struct(col, ph, l),
            (Line::Rotation(i), Line::Rotation(j)) => i < j,
            (Line::Rotation(i), Line::Record(lh)) => self.act_link(col, lh).is_some_and(|b| b >= i),
        }
    }

    /// The places the collective's acts give a member's signature act `s`
    /// ("Made before, made after", 2): the act for the collective it signs,
    /// a record naming it, a rotation naming it, and an act for the
    /// collective on its chain acknowledging it. Identity's witness act
    /// places nothing.
    fn placements(&self, col: &Col, s: &Held) -> Vec<(Line<'a>, bool)> {
        // (where, whether it is a line: lines are not placed by keepers)
        let mut out = vec![];
        if let Ok(signed) = decode_signature(&s.inside) {
            if let Some(a) = self.v.get(&signed) {
                if Self::for_col(col, a) && self.status(&a.id) == Status::Valid && a.inside.spec != self.mirs.identity {
                    out.push((Line::Record(a), self.is_agreements(a, types::RECORD)));
                }
            }
        }
        for h in self.col_acts(col) {
            if !self.is_agreements(h, types::RECORD) || self.status(&h.id) != Status::Valid {
                continue;
            }
            if let Ok(r) = Record::decode(&h.inside) {
                // A record that is no line places nothing; a record being
                // judged places its own clone's signatures.
                if r.signatures.iter().flatten().any(|x| x == &s.id) && self.record_eval(col, h).map(|e| e.line).unwrap_or(true) {
                    out.push((Line::Record(h), true));
                }
            }
        }
        for a in self.v.acknowledgements(&s.id) {
            if Self::for_col(col, a) && self.status(&a.id) == Status::Valid && self.on_chain(col, a) {
                out.push((Line::Record(a), self.is_agreements(a, types::RECORD)));
            }
        }
        for j in 1..col.res.links.len() {
            if self.rotation_sigs(col, j).contains(&s.id) {
                out.push((Line::Rotation(j), true));
            }
        }
        out
    }

    /// Whether an act for the collective is on one of its chains (rule 58):
    /// a decision, or an action citing the decision it acts under.
    /// Identity's acts and negotiation messages are on neither.
    fn on_chain(&self, col: &Col, a: &Held) -> bool {
        if self.is_decision(col, a) {
            return true;
        }
        if a.inside.spec == self.mirs.identity || self.is_agreements(a, types::NEGOTIATION) {
            return false;
        }
        matches!(self.uncited(col, a, None), Ok(None))
    }

    /// Whether a member's signature act counts as made before line `l`.
    fn sig_before(&self, col: &Col, s: &Held, l: Line) -> R<bool> {
        for (p, is_line) in self.placements(col, s) {
            let yes = match p {
                Line::Record(h) if !is_line => self.before(col, h, l)?,
                _ => self.line_before(col, p, l),
            };
            // An act of the broken stretch places nothing: it counts for
            // nothing in Agreements (rule 37d, F185). Asked only of a placement
            // before the line, so never of the line being judged.
            if yes && !self.in_broken_stretch(col, p)? {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Whether an act for the collective, or a rotation, lies in a broken
    /// stretch: at a link where Agreements finds no agreement in force (rule
    /// 93).
    fn in_broken_stretch(&self, col: &Col, p: Line) -> R<bool> {
        let k = match p {
            Line::Record(h) => match self.act_link(col, h) {
                Some(k) => k,
                None => return Ok(false),
            },
            Line::Rotation(j) => j,
        };
        Ok(self.base(col, k)?.is_err())
    }

    // ------------------------------------------------------------ records and departures

    /// A record act of the collective, judged.
    pub fn record(&self, collective: &Hash, record: &Hash) -> R<RecordEval> {
        let col = self.col(collective);
        let h = self.held(record)?;
        Ok((*self.record_eval(&col, h)?).clone())
    }

    fn record_eval(&self, col: &Col, h: &'a Held) -> R<Rc<RecordEval>> {
        if let Some(e) = self.cache.borrow().get(&h.id) {
            return Ok(e.clone());
        }
        if !self.busy.borrow_mut().insert(h.id) {
            return Err(AgreementsError::Check("records order themselves in a loop"));
        }
        let e = self.record_eval_inner(col, h);
        self.busy.borrow_mut().remove(&h.id);
        let e = Rc::new(e?);
        self.cache.borrow_mut().insert(h.id, e.clone());
        Ok(e)
    }

    fn record_eval_inner(&self, col: &Col, h: &'a Held) -> R<RecordEval> {
        let mut e = RecordEval {
            id: h.id,
            line: false,
            not_a_line: None,
            in_force_at: None,
            clone: None,
            puts: None,
            resolves: false,
            registers: vec![],
            places: vec![],
        };
        let no = |mut e: RecordEval, w: &str| {
            e.not_a_line = Some(w.into());
            Ok(e)
        };
        if !self.is_agreements(h, types::RECORD) || !Self::for_col(col, h) || !self.valid(&h.id) {
            return no(e, "not a valid record for the collective");
        }
        let rec = match Record::decode(&h.inside) {
            Ok(r) => r,
            Err(x) => return no(e, &x.to_string()),
        };
        let Some(b) = self.act_link(col, h) else {
            return no(e, "it names no decision of the collective: a record naming none is no decision, and no line (rule 58)");
        };
        let base = match self.base(col, b)? {
            Ok(x) => x,
            Err(w) => return no(e, &w),
        };
        let mut puts = vec![];
        for r in self.records_since(col, b) {
            if self.before_struct(col, r, Line::Record(h)) {
                let x = self.record_eval(col, r)?;
                if let Some(k) = x.puts {
                    puts.push((k, x.resolves));
                }
            }
        }
        let f = self.fold(base, &puts)?;
        let at = f.agreement;
        e.in_force_at = Some(at);
        // Any member draws it, with their own key: a stranger's record
        // naming the collective counts for nothing (rules 58, 72).
        if !h.act.outside.signer.is_some_and(|x| self.terms(&at).is_ok_and(|t| t.parties.contains(&x))) {
            return no(e, "it is drawn by no member of the agreement in force for it: a stranger's act naming a collective counts for nothing (rule 58)");
        }
        // W3 (F127): a record is an act in the collective's name like any
        // other: not done, it is no line, and puts nothing in force.
        if let Some(w) = self.not_done(h, &at)? {
            return no(e, &w);
        }
        if rec.clone.is_none() && Record::named(&h.inside) != Some(at) {
            return no(e, "a record naming no clone names the agreement in force for it");
        }
        let at_terms = self.terms(&at)?;
        let at_lineage: Vec<Hash> = self.lineage(&at)?.into_iter().map(|(i, _)| i).collect();
        let mut declarations: Vec<(Hash, Hash)> = vec![];
        for x in rec.registers.iter().flatten() {
            let a = self.held(x)?;
            let Some(p) = a.act.outside.signer else {
                return no(e, "it registers an act with no signer");
            };
            if self.is_agreements(a, types::DECLARATION) {
                // Signed by the authority, judged once the record's other
                // registrations are known.
                declarations.push((*x, p));
                continue;
            }
            // A stake transfer of a stake the agreement in force defines, a
            // proxy or its revocation by a holder of such a stake, or a
            // holder's take-up of an issuance offer: placed by this line for
            // the owners' matters (rules 94, 96, 97; new in draft 14, F316,
            // F327; the take-up placed as a transfer is, a reading of the
            // build), each judged where the owners' matters read it.
            if self.is_agreements(a, crate::agreements::open_formats::new_types::STAKE_TRANSFER)
                || self.is_agreements(a, crate::agreements::owners::owner_types::PROXY)
                || self.is_agreements(a, crate::agreements::owners::owner_types::PROXY_REVOCATION)
                || self.takes_up(a)
            {
                if !self.kept_at(col, a, Line::Record(h))? {
                    return no(e, "it registers a transfer, proxy or revocation that is not valid");
                }
                e.places.push(*x);
                continue;
            }
            if !at_terms.parties.contains(&p) {
                return no(e, "it registers an act of someone who is not a party of the agreement in force");
            }
            if self.is_agreements(a, types::RESIGNATION) {
                // F302: as this line places it, whatever its signer's later
                // rotation disowned.
                if !self.kept_at(col, a, Line::Record(h))? {
                    return no(e, "it registers a resignation that is not valid");
                }
                let r = match Resignation::decode(&a.inside) {
                    Ok(r) => r,
                    Err(_) => return no(e, "it registers a resignation not in the format"),
                };
                if !at_lineage.contains(&r.agreement) {
                    return no(e, "it registers a resignation from an agreement not in force for it");
                }
                let kind = match r.area {
                    None => DepartureKind::Resigned {
                        agreement: r.agreement,
                    },
                    Some(area) => {
                        if !self
                            .terms(&r.agreement)?
                            .area(area)
                            .is_some_and(|ar| ar.holders.contains(&p))
                        {
                            return no(e, "it registers a stepping down from an area its signer does not hold");
                        }
                        DepartureKind::SteppedDown {
                            agreement: r.agreement,
                            area,
                        }
                    }
                };
                e.registers.push(Departure { act: *x, party: p, kind });
                continue;
            }
            if a.inside.spec == self.mirs.identity && a.inside.type_ == 1 {
                let res = self.v.resolve(&p);
                if res.position_of(x).is_none() || self.refuses(x) {
                    return no(e, "it registers a rotation that does not count");
                }
                e.registers.push(Departure {
                    act: *x,
                    party: p,
                    kind: DepartureKind::Rotated { rotation: *x },
                });
                continue;
            }
            return no(e, "it registers an act that is no departure or rotation");
        }
        // Declarations removing a voice (rule 53, B12), their authority
        // counted at this line (Q37), with the record's resignations and
        // steppings down in effect, other declarations not.
        let others = e.registers.clone();
        for (x, p) in declarations {
            let (d, clause) = match self.declaration_used(&x, &h.id, Some((col, Line::Record(h), &at)))? {
                Ok(v) => v,
                Err(w) => return no(e, &format!("it registers a declaration that fails: {w}")),
            };
            if !at_terms.parties.contains(&d.party) {
                return no(e, "it registers a declaration against someone who is not a party of the agreement in force");
            }
            if !d.outcomes.contains(&outcomes::VOICE_REMOVED) {
                return no(e, "it registers a declaration that removes no voice (outcome 0)");
            }
            if !at_lineage.contains(&d.agreement) {
                return no(e, "it registers a declaration in an agreement not in force for it");
            }
            if let Err(w) = self.authority_at(col, Point::Line(Line::Record(h)), &at, &clause, &d, &x, &p, &others)? {
                return no(e, &w);
            }
            e.registers.push(Departure {
                act: x,
                party: d.party,
                kind: DepartureKind::Declared { agreement: d.agreement },
            });
        }
        e.line = true;
        if let (Some(k), Some(sigs)) = (&rec.clone, &rec.signatures) {
            let kt = self.terms(k)?;
            // A clone of the latest clone of one branch of a fork, recorded
            // after both lines, resolves it (rule 47, B11).
            let resolves = f.fork && kt.parent.is_some_and(|p| f.branches.contains(&p));
            let parent_terms = match kt.parent {
                Some(pp) if resolves => self.terms(&pp)?,
                _ => at_terms.clone(),
            };
            let state = if kt.parent != Some(at) && !resolves {
                CloneState::Invalid(
                    "its parent is not the agreement in force for the record (rule 37c)".into(),
                )
            } else if needs_rotation(&parent_terms, &kt) {
                CloneState::Invalid(
                    "it changes the key grammar, or removes a party who holds the chain key or a share of it: only a rotation declares it (rule 69)".into(),
                )
            } else {
                self.clone_at(col, k, sigs, Line::Record(h), &e.registers)?
            };
            if state == CloneState::Complete {
                e.puts = Some(*k);
                e.resolves = resolves;
            }
            e.clone = Some((*k, state));
        }
        Ok(e)
    }

    /// The lines that may register a departure in effect at a point, and
    /// what each registers: records under earlier keys, and records under
    /// the point's key that can precede it. A line point adds its own
    /// registrations (`own`): a record is not before itself, and judges its
    /// clone with them in effect; a recovery rotation's declarations take
    /// effect at it (C7).
    fn departure_lines(&self, col: &Col, point: Point<'a>, own: &[Departure]) -> R<Vec<(Line<'a>, Departure)>> {
        let mut out = vec![];
        // A record after the line of the fork or closing that ended the
        // collective counts for nothing in Agreements (rule 47a): it registers no
        // departure. Found by the Agreements invariants (`docs/law-invariants.md`,
        // IC8), hidden until F131 made ENDING-UNDONE a failure again.
        // Judged for an act only: a line's own judgment is part of judging
        // the ending, and the ending is judged before any act (`consent`).
        let ended = match point {
            Point::Act(_) | Point::Tip => self.closed_by(&col.id)?,
            Point::Line(_) => None,
        };
        let (limit, me): (usize, Option<&'a Held>) = match point {
            Point::Act(x) => (self.act_link(col, x).unwrap_or(0), None),
            Point::Line(Line::Record(r)) => (self.act_link(col, r).unwrap_or(0), Some(r)),
            Point::Line(Line::Rotation(j)) => (j - 1, None),
            Point::Tip => (col.res.links.len().saturating_sub(1), None),
        };
        for k in 0..=limit.min(col.res.links.len().saturating_sub(1)) {
            for r in self.records_at(col, k) {
                if me.is_some_and(|m| m.id == r.id) {
                    continue;
                }
                if k == limit && !self.applies(col, r, point)? {
                    continue;
                }
                // F131 (IT2a): an act the collective's own key cites, by an
                // act that counts and that the line does not follow, is
                // adopted: a departure racing that citation takes no voice
                // off it. Found by the Agreements invariants
                // (`docs/law-invariants.md`, IC9).
                if let Point::Act(x) = point {
                    if k == limit && self.adopting.borrow().contains(&x.id) && self.cited_against(col, x, r)? {
                        continue;
                    }
                }
                if ended.as_ref().is_some_and(|e| !self.before_line(col, r, &e.line)) {
                    continue;
                }
                // F199: for a fork's check of the debts it hands out, only
                // the departures registered in its own history count. Judged
                // for an act only: a line's own reading, which is cached,
                // never depends on it.
                if let (Some((c, line)), Point::Act(_)) = (self.fork_line.borrow().as_ref(), point) {
                    if c == &col.id && !self.before_line(col, r, line) {
                        continue;
                    }
                }
                let e = self.record_eval(col, r)?;
                if e.line {
                    for d in &e.registers {
                        out.push((Line::Record(r), d.clone()));
                    }
                }
            }
        }
        // A rollback is a line: the departures it registers take effect
        // there (rule 37d, F185). One at this point's own link is before
        // it: an act or record bound to its key comes after it.
        let fork_link = match point {
            Point::Act(_) => self.fork_line.borrow().as_ref().filter(|(c, _)| c == &col.id).map(|(_, l)| self.line_link(col, l)),
            _ => None,
        };
        for (m, _, ds) in self.rollback_lines(col, limit)? {
            if fork_link.is_some_and(|k| k.is_none_or(|k| m > k)) {
                continue;
            }
            for d in ds {
                out.push((Line::Rotation(m), d));
            }
        }
        if let Point::Line(l) = point {
            for d in own {
                out.push((l, d.clone()));
            }
        }
        Ok(out)
    }

    /// Whether an act of the collective's own key that counts, other than
    /// `x`, holds `x` in its history while the line `l` does not hold it:
    /// the collective took `x` on, by a citation `l` races (F131, IT2a;
    /// "cites" as a line reads it, reading U3, confirmed, F132).
    fn cited_against(&self, col: &Col, x: &'a Held, l: &'a Held) -> R<bool> {
        // Judging the citing act may ask again about acts being judged here:
        // an act under judgment adopts nothing.
        if !self.citing.borrow_mut().insert(x.id) {
            return Ok(false);
        }
        let r = self.cited_against_inner(col, x, l);
        self.citing.borrow_mut().remove(&x.id);
        r
    }

    fn cited_against_inner(&self, col: &Col, x: &'a Held, l: &'a Held) -> R<bool> {
        for a in self.col_acts(col) {
            // A citation is an action on the chain; Identity's acts are on
            // neither chain.
            if a.id == x.id || a.id == l.id || a.inside.spec == self.mirs.identity || self.is_agreements(a, types::RECORD) || self.citing.borrow().contains(&a.id) {
                continue;
            }
            if !self.before_struct(col, x, Line::Record(a)) || self.before_struct(col, l, Line::Record(a)) {
                continue;
            }
            if self.valid(&a.id) && self.consent(&a.id)?.counts() {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// The records naming `p`'s rotation `rot` in field 3: valid record acts
    /// of the collective, read without judging the rest of the record, so
    /// that C5 can look at lines after the point it judges.
    fn rotation_lines(&self, col: &Col, rot: &Hash) -> Vec<&'a Held> {
        self.col_acts(col)
            .into_iter()
            .filter(|h| {
                self.is_agreements(h, types::RECORD)
                    && self.valid(&h.id)
                    && Record::decode(&h.inside)
                        .is_ok_and(|r| r.registers.iter().flatten().any(|x| x == rot))
            })
            .collect()
    }

    /// Whether a line registering a departure applies at a point: it is
    /// before the point (for a line, or itself when the point is that
    /// record), or, for an act, the act is not before it.
    fn applies(&self, col: &Col, l: &'a Held, point: Point<'a>) -> R<bool> {
        Ok(match point {
            Point::Line(Line::Record(p)) => p.id == l.id || self.before_struct(col, l, Line::Record(p)),
            Point::Line(Line::Rotation(j)) => self.before_struct(col, l, Line::Rotation(j)),
            Point::Act(x) => !self.before(col, x, Line::Record(l))?,
            Point::Tip => true,
        })
    }

    /// The voices a power is counted among at a point (rule 44d): the
    /// parties of `base` whose voice remains in agreement `ag`, and those
    /// who left but count through a signature act on `target` placed before
    /// every line registering their departure. `area`: for an area's power.
    /// Returns (voices, remaining without any placed signature).
    #[allow(clippy::too_many_arguments)]
    fn voices(
        &self,
        col: &Col,
        point: Point<'a>,
        ag: &Hash,
        base: &[Hash],
        area: Option<u64>,
        target_sigs: &BTreeMap<Hash, Vec<Hash>>,
        own: &[Departure],
    ) -> R<(Vec<Hash>, Vec<Hash>)> {
        let lineage: Vec<Hash> = self.lineage(ag)?.into_iter().map(|(i, _)| i).collect();
        let lines = self.departure_lines(col, point, own)?;
        let mut voices = vec![];
        let mut remaining = vec![];
        for p in base {
            let returns = self.came_back(p, &lineage, None)?;
            let mut regs: Vec<Line<'a>> = vec![];
            for (l, d) in &lines {
                if &d.party != p {
                    continue;
                }
                // F207 (decided 10 October 2026, replacing QH4's reading): a
                // version the resignation or stepping down names among the
                // drafts it leaves behind never brings its signer back,
                // whichever line puts it in force; what she signed while
                // present still speaks where C2 counts it.
                let left = self.drafts_left_behind(&d.act);
                let returns: Vec<Hash> = returns.iter().filter(|v| !left.contains(v)).copied().collect();
                // F189 (1), F195: a resignation is spent once its signer
                // came back by a version naming them (B10), registered or
                // not; a line registers only one naming the version of their
                // latest return, or one descending from it.
                if let DepartureKind::Resigned { agreement } = &d.kind {
                    if self.spent(agreement, &returns)? {
                        continue;
                    }
                }
                // QF6 (decided 9 October 2026, F190): so is a stepping down,
                // once its signer holds the area again.
                if let DepartureKind::SteppedDown { agreement, area: a } = &d.kind {
                    let back: Vec<Hash> = self.came_back(p, &lineage, Some(*a))?.into_iter().filter(|v| !left.contains(v)).collect();
                    if area == Some(*a) && self.spent(agreement, &back)? {
                        continue;
                    }
                }
                let (from, hits) = match &d.kind {
                    DepartureKind::Resigned { agreement } | DepartureKind::Declared { agreement } => (*agreement, true),
                    DepartureKind::SteppedDown { agreement, area: a } => (*agreement, area == Some(*a)),
                    DepartureKind::Rotated { .. } => (*ag, false),
                };
                // The tie rule (F127): an action judged under an earlier
                // version than the one a departure names, and not before
                // the line registering it, uses a power that line ends:
                // the ending wins.
                let later = matches!(point, Point::Act(_))
                    && !lineage.contains(&from)
                    && self.lineage(&from)?.iter().any(|(i, _)| i == ag);
                if !hits || !(lineage.contains(&from) || later) {
                    continue;
                }
                // Named again by a later version they signed, after the line,
                // and not one their departure left behind (F207).
                if self.restoring(col, p, &lineage, &from, area, *l)?.is_some_and(|v| !left.contains(&v)) {
                    continue;
                }
                regs.push(*l);
            }
            if regs.is_empty() {
                voices.push(*p);
                remaining.push(*p);
                continue;
            }
            for s in target_sigs.get(p).into_iter().flatten() {
                let s = self.held(s)?;
                let mut all = true;
                for l in &regs {
                    all &= self.sig_before(col, s, *l)?;
                }
                if all {
                    voices.push(*p);
                    break;
                }
            }
        }
        Ok((voices, remaining))
    }

    /// The versions by which `p` came back (B10; F189, 1; QF6; F195,
    /// decided 10 October 2026, "Good"): the versions of the agreement
    /// counted (`lineage`) that name `p` again, as a party (`area` none) or
    /// as a holder of `area`, by a constitutional clone (B10: never an
    /// ordinary clone that only copies the list), and that `p` signed by a
    /// valid signature act. Whether or not any line registered a departure
    /// of theirs: a departure such a version comes after is spent.
    fn came_back(&self, p: &Hash, lineage: &[Hash], area: Option<u64>) -> R<Vec<Hash>> {
        let mut out = vec![];
        for v in lineage {
            let t = self.terms(v)?;
            let named = match area {
                None => t.parties.contains(p),
                Some(a) => t.area(a).is_some_and(|ar| ar.holders.contains(p)),
            };
            let constitutional = match &t.parent {
                Some(pp) => changes(&self.terms(pp)?, &t).iter().any(|c| c.tier() == Tier::Constitutional),
                None => false,
            };
            if named && constitutional && !self.valid_sigs(v, &[*p]).is_empty() {
                out.push(*v);
            }
        }
        Ok(out)
    }

    /// Whether `p`'s stepping down from `area` naming `agreement` is spent,
    /// counted in agreement `ag` (QF6, F190; F195).
    fn stepping_down_spent(&self, p: &Hash, ag: &Hash, agreement: &Hash, area: u64, drafts: &[Hash]) -> R<bool> {
        let lineage: Vec<Hash> = self.lineage(ag)?.into_iter().map(|(i, _)| i).collect();
        let back: Vec<Hash> = self.came_back(p, &lineage, Some(area))?.into_iter().filter(|v| !drafts.contains(v)).collect();
        self.spent(agreement, &back)
    }

    /// The drafts a resignation or stepping down leaves behind (F207): its
    /// field 2; none where `act` is no resignation.
    fn drafts_left_behind(&self, act: &Hash) -> Vec<Hash> {
        self.v
            .get(act)
            .filter(|h| self.is_agreements(h, types::RESIGNATION))
            .and_then(|h| Resignation::decode(&h.inside).ok())
            .map(|r| r.drafts)
            .unwrap_or_default()
    }

    /// Whether `p`'s resignation naming `agreement` is spent, counted in
    /// agreement `ag` (F189, 1; F195).
    fn resignation_spent(&self, p: &Hash, ag: &Hash, agreement: &Hash, drafts: &[Hash]) -> R<bool> {
        let lineage: Vec<Hash> = self.lineage(ag)?.into_iter().map(|(i, _)| i).collect();
        let back: Vec<Hash> = self.came_back(p, &lineage, None)?.into_iter().filter(|v| !drafts.contains(v)).collect();
        self.spent(agreement, &back)
    }

    /// Whether a resignation or stepping down naming `agreement` is spent
    /// (F189, 1; F195): its signer came back by a version it does not
    /// descend from, so it was signed before that return, the only order
    /// MOR can see between the two acts.
    fn spent(&self, agreement: &Hash, returns: &[Hash]) -> R<bool> {
        if returns.is_empty() {
            return Ok(false);
        }
        let ls: Vec<Hash> = match self.lineage(agreement) {
            Ok(ls) => ls.into_iter().map(|(i, _)| i).collect(),
            Err(_) => return Ok(false),
        };
        Ok(returns.iter().any(|v| !ls.contains(v)))
    }

    /// The latest version restoring `p` after line `l` ([`Self::restored`]).
    fn restoring(&self, col: &Col, p: &Hash, lineage: &[Hash], from: &Hash, area: Option<u64>, l: Line<'a>) -> R<Option<Hash>> {
        let Some(i) = lineage.iter().position(|x| x == from) else {
            return Ok(None);
        };
        for v in &lineage[..i] {
            let t = self.terms(v)?;
            let named = match area {
                None => t.parties.contains(p),
                Some(a) => t.area(a).is_some_and(|ar| ar.holders.contains(p)),
            };
            // Named again: by a constitutional clone (rule 37b's refit), never
            // by an ordinary clone that only copies the list (build question B10).
            let constitutional = match &t.parent {
                Some(pp) => changes(&self.terms(pp)?, &t)
                    .iter()
                    .any(|c| c.tier() == Tier::Constitutional),
                None => false,
            };
            if !named || !constitutional {
                continue;
            }
            for (_, s) in self.valid_sigs(v, &[*p]) {
                if !self.sig_before(col, self.held(&s)?, l)? {
                    return Ok(Some(*v));
                }
            }
        }
        Ok(None)
    }

    /// Whether an act of another identity that line `at` names, registers
    /// or relies on keeps, for the collective, the effect that line gives it
    /// (new in draft 14, F302, C5 extended; "Record (type 17)": "valid under
    /// Identity, or placed by this line before any line of the collective
    /// registering the rotation that voided it"): valid, or voided or
    /// disputed by its signer's next rotation where every line of the
    /// collective registering that rotation comes after `at`. A rotation no
    /// line registers (an authority who is no party, a holder who is no
    /// member, a grantee, a buyer, a creditor: none is registered) never
    /// unplaces it. Its status under Identity is unchanged; a client shows
    /// the dispute on the line.
    fn kept_at(&self, col: &Col, a: &Held, at: Line) -> R<bool> {
        match self.status(&a.id) {
            Status::Valid => return Ok(true),
            Status::Void | Status::Disputed => {}
            _ => return Ok(false),
        }
        let Some(next) = self.voiding_rotation(a) else {
            return Ok(false);
        };
        Ok(self.rotation_lines(col, &next).into_iter().all(|l| self.line_before(col, at, Line::Record(l))))
    }

    /// The rotation of `a`'s signer that replaced the key `a` is bound to.
    fn voiding_rotation(&self, a: &Held) -> Option<Hash> {
        let p = a.act.outside.signer?;
        let res = self.v.resolve(&p);
        let kb = a.act.outside.binding.and_then(|b| res.position_of(&b))?;
        res.links.get(kb + 1).map(|l| l.act)
    }

    /// Whether a member's signature act counts for the collective: valid
    /// under Identity, or kept by C5 (placed before the collective's line
    /// registering the rotation that replaced its key).
    fn sig_counts(&self, col: &Col, s: &Held) -> R<bool> {
        match self.status(&s.id) {
            Status::Valid => return Ok(true),
            Status::Void | Status::Disputed => {}
            _ => return Ok(false),
        }
        let Some(next) = self.voiding_rotation(s) else {
            return Ok(false);
        };
        // Placed by the collective, before every line registering that
        // rotation (C5; Agreements draft 14, "Record (type 17)", F302): with
        // none yet, wherever it is placed.
        let lines = self.rotation_lines(col, &next);
        if lines.is_empty() {
            return Ok(!self.placements(col, s).is_empty());
        }
        for l in lines {
            if !self.sig_before(col, s, Line::Record(l))? {
                return Ok(false);
            }
        }
        Ok(true)
    }

    /// Whether a mark's signers meet a rule by share or "all of" at line
    /// `at` (rule 65; new in draft 14, F308, F311): each rule in it counted
    /// as it would be alone, flaw C included. Among the parties (`[3, stake,
    /// share]`), each party whose voice remains counts by what it holds of
    /// the stake at the line, the share asked for being of what those
    /// voices hold together; where they hold nothing, every voice that
    /// remains together meets it. Among a stake's holders (`[5, stake,
    /// share]`), every holder at the line counts by its share of the whole
    /// stake. A rule by head counts as it always has.
    #[allow(clippy::too_many_arguments)]
    fn share_rule_met(
        &self,
        col: &Col,
        at: Line<'a>,
        pid: &Hash,
        parent: &Terms,
        rule: &Rule,
        signers: &[Hash],
        any: &BTreeMap<Hash, Vec<Hash>>,
        own: &[Departure],
    ) -> R<Result<(), String>> {
        let mut counted: Vec<Hash> = vec![];
        for part in rule.parts() {
            match part {
                Rule::Holders { stake, share } => {
                    let roster = self.roster_at(col, at, pid, *stake)?;
                    counted.extend(roster.iter().map(|(h, _)| *h));
                    let s: Vec<Hash> = signers.iter().filter(|x| roster.iter().any(|(h, _)| h == *x)).copied().collect();
                    if let Err(w) = holders_met(&roster, &s, *share) {
                        return Ok(Err(w));
                    }
                }
                Rule::ByShare { stake, share } => {
                    let (voices, _) = self.voices(col, Point::Line(at), pid, &parent.parties, None, any, own)?;
                    counted.extend(voices.iter().copied());
                    let roster = self.roster_at(col, at, pid, *stake)?;
                    let held = |x: &Hash| roster.iter().find(|(h, _)| h == x).map_or(0, |(_, n)| *n) as u128;
                    let total: u128 = voices.iter().map(held).sum();
                    let s: Vec<Hash> = signers.iter().filter(|x| voices.contains(x)).copied().collect();
                    let got: u128 = s.iter().map(held).sum();
                    let met = if total == 0 { voices.iter().all(|v| s.contains(v)) && !voices.is_empty() } else { got * MILLION as u128 >= *share as u128 * total };
                    if !met {
                        return Ok(Err("the mark names too few parties to meet the rule, counted by share of what the voices that remain hold (rule 65, F308)".into()));
                    }
                }
                head => {
                    let among = head.counted_among(&parent.parties);
                    let (voices, _) = self.voices(col, Point::Line(at), pid, &among, None, any, own)?;
                    counted.extend(voices.iter().copied());
                    let s = signers.iter().filter(|x| voices.contains(x)).count();
                    let Some(need) = head.needed(voices.len()) else {
                        return Ok(Err("no voice remains to meet a power it names".into()));
                    };
                    if s < need {
                        return Ok(Err("the mark names too few signers to meet the power (rule 45a)".into()));
                    }
                }
            }
        }
        if !signers.iter().all(|x| counted.contains(x)) {
            return Ok(Err("the mark names a signer that power is not counted among, or whose voice no longer counts there (rules 45a, 65)".into()));
        }
        Ok(Ok(()))
    }

    /// A clone at a record or rotation, judged with the signature acts it
    /// names, and only those (A2, Flaw M), each power counted at that line
    /// (rule 44d).
    fn clone_at(
        &self,
        col: &Col,
        k: &Hash,
        sigs: &[Hash],
        at: Line<'a>,
        own: &[Departure],
    ) -> R<CloneState> {
        self.clone_at_as(col, k, sigs, at, own, false)
    }

    /// [`Self::clone_at`], for a rollback's clone with `rollback` (rule 37d).
    fn clone_at_as(
        &self,
        col: &Col,
        k: &Hash,
        sigs: &[Hash],
        at: Line<'a>,
        own: &[Departure],
        rollback: bool,
    ) -> R<CloneState> {
        let lineage = self.lineage(k)?;
        let clone = &lineage[0].1;
        let Some(pid) = clone.parent else {
            return Ok(CloneState::Invalid("not a clone".into()));
        };
        let parent = &lineage[1].1;
        let needs = match self.clone_static(parent, clone, &lineage[1..], rollback)? {
            Ok(n) => n,
            Err(w) => return Ok(CloneState::Invalid(w)),
        };
        let _ = needs;
        let mut by: BTreeMap<Hash, Hash> = BTreeMap::new();
        for s in sigs {
            let h = self.held(s)?;
            if !self.is_agreements(h, types::SIGNATURE) || decode_signature(&h.inside).ok() != Some(*k) {
                return Ok(CloneState::Invalid(
                    "it names an act that is not a signature act on the clone".into(),
                ));
            }
            if !self.sig_counts(col, h)? {
                return Ok(CloneState::Invalid("it names a signature act that is not valid".into()));
            }
            if let Some(p) = h.act.outside.signer {
                by.entry(p).or_insert(*s);
            }
        }
        // Every signature act on the clone that counts, named or not: a
        // departed party is a voice through one placed before its line
        // (rule 44d, Q23, C2), though only those named count toward the
        // clone here (A2, Flaw M).
        let mut any: BTreeMap<Hash, Vec<Hash>> = BTreeMap::new();
        for p in union(&parent.parties, &clone.parties) {
            for h in self.v.signed_by(&p) {
                if self.is_agreements(h, types::SIGNATURE)
                    && decode_signature(&h.inside).ok() == Some(*k)
                    && self.sig_counts(col, h)?
                {
                    any.entry(p).or_default().push(h.id);
                }
            }
        }
        let mark = clone.field4.mark().unwrap_or(&[]);
        if let [MarkEntry { power: Power::Plan(party), signers }] = mark {
            if !Self::newcomers(parent, clone).iter().all(|p| by.contains_key(p)) {
                return Ok(CloneState::Draft(
                    "a party it adds, or makes a holder, has not signed it (Q11)".into(),
                ));
            }
            if let Some(w) = self.coverage(clone) {
                return Ok(CloneState::Invalid(w));
            }
            return self.plan_at(col, at, &lineage, party, signers, &by, own);
        }
        let mut missing = false;
        for e in mark {
            // Agreements draft 14 (rules 65, 94; F307, F308, F311): a stake's
            // holders' rule, and the rules by share or "all of", counted with
            // the roster at this line.
            if let Power::Holders(stake) = e.power {
                let HoldersRule::Share(need) = parent.holders_rule(stake).0 else {
                    return Ok(CloneState::Invalid("the mark names a stake's holders' rule, and that rule is every holder (rule 64.4)".into()));
                };
                let roster = self.roster_at(col, at, &pid, stake)?;
                if let Err(w) = holders_met(&roster, &e.signers, need) {
                    return Ok(CloneState::Invalid(w));
                }
                // A holder who is no member may vote by its proxy (rule 97;
                // new in draft 14, F327): members vote in person.
                for s in &e.signers {
                    missing |= !by.contains_key(s) && (parent.parties.contains(s) || !self.proxy_votes(col, at, &pid, k, stake, s, &by)?);
                }
                continue;
            }
            let (base, rule) = power_base(parent, &e.power).expect("checked by clone_static");
            if !rule.by_head() {
                if let Err(w) = self.share_rule_met(col, at, &pid, parent, &rule, &e.signers, &any, own)? {
                    return Ok(CloneState::Invalid(w));
                }
                // A rule counted among a stake's holders alone (rule 69,
                // F311): a holder who is no member may vote by its proxy
                // (rule 97, F327).
                let only_holders = rule.parts().iter().all(|r| matches!(r, Rule::Holders { .. }));
                for s in &e.signers {
                    let proxied = |st: u64| self.proxy_votes(col, at, &pid, k, st, s, &by);
                    let by_proxy = match (only_holders, rule.holders_stake()) {
                        (true, Some(st)) if !parent.parties.contains(s) => proxied(st)?,
                        _ => false,
                    };
                    missing |= !by.contains_key(s) && !by_proxy;
                }
                continue;
            }
            let area = match e.power {
                Power::Area(a) => Some(a),
                _ => None,
            };
            let (voices, _) = self.voices(col, Point::Line(at), &pid, &base, area, &any, own)?;
            if !e.signers.iter().all(|s| voices.contains(s)) {
                return Ok(CloneState::Invalid(
                    "the mark names a signer whose voice no longer counts there (rule 44d)".into(),
                ));
            }
            let Some(need) = rule.needed(voices.len()) else {
                return Ok(CloneState::Invalid("no voice remains to meet a power it names".into()));
            };
            if e.signers.len() < need {
                return Ok(CloneState::Invalid(
                    "the mark names too few signers to meet the power (rule 45a)".into(),
                ));
            }
            missing |= !e.signers.iter().all(|s| by.contains_key(s));
        }
        if missing {
            return Ok(CloneState::Draft(
                "a party its mark names has no signature act among those named".into(),
            ));
        }
        if !Self::newcomers(parent, clone).iter().all(|p| by.contains_key(p)) {
            return Ok(CloneState::Draft(
                "a party it adds, or makes a holder, has not signed it (Q11)".into(),
            ));
        }
        // Rule 96 (new in draft 14, F309, F315): an issuance, judged; the
        // holders it scales down pro rata under the stake's holders' rule
        // do not sign for themselves.
        let excused = match self.issuance_at(col, at, &pid, parent, clone, &lineage, &by)? {
            Err(state) => return Ok(state),
            Ok(e) => e.unwrap_or_default(),
        };
        let (losing, _) = Self::must_sign_parts(parent, clone);
        let losing: Vec<Hash> = losing.into_iter().filter(|h| !excused.contains(h)).collect();
        // Agreements draft 14 (rules 48, 94; F307, F316): who is paid less is
        // read on the roster at this line; a holder the stake's holders'
        // rule binds, where the mark meets that rule, does not sign for itself.
        let pay = self.collective_pay_signers(col, at, &pid, parent, clone, mark)?;
        // Rule 45: a change of a stake's holders' rule (field 30, its
        // standing waiver included, F328) needs every holder of that stake,
        // as the roster at the line counts them.
        for (i, _) in parent.stakes.iter().flatten().enumerate() {
            if parent.holders_rule(i as u64) != clone.holders_rule(i as u64) {
                for (h, _) in self.roster_at(col, at, &pid, i as u64)? {
                    if !by.contains_key(&h) {
                        return Ok(CloneState::Draft(
                            "it changes a stake's holders' rule, and a holder of that stake has not signed it: it is changed only by every holder (rules 45, 94; F307, F328)".into(),
                        ));
                    }
                }
            }
        }
        for h in &losing {
            if !by.contains_key(h) && !self.moved_by_abandonment(h, parent, clone, k, &lineage[1..], Some((col, at, &pid)), own)? {
                return Ok(CloneState::Draft(
                    "it lowers a holder's stake, changes a departed holder's plan or changes the release rule, and a holder it must have has not signed it, nor does a declaration of absence move that stake by succession (rules 46, 46b, 89; N8; F279)".into(),
                ));
            }
        }
        for h in &pay {
            if !by.contains_key(h) && !self.moved_by_abandonment(h, parent, clone, k, &lineage[1..], Some((col, at, &pid)), own)? {
                return Ok(CloneState::Draft(
                    "it pays a holder with no voice less, and that holder has not signed it: no advance permission reaches its pay (Agreements draft 12, rule 48; F270, F274, F279)".into(),
                ));
            }
        }
        if let Some(w) = self.coverage(clone) {
            return Ok(CloneState::Invalid(w));
        }
        Ok(CloneState::Complete)
    }

    // ------------------------------------------------------------ abandonment

    /// An abandonment declaration's own checks (rules 46a, 49, 51; B12):
    /// valid under Identity; the party is a party of the agreement it names;
    /// the clause it applies is the last version of that agreement, back
    /// from it, that the party signed; every outcome is one that clause
    /// allows; and its signer can be that clause's authority: the identity
    /// it names, or one of the other parties, whose number is counted where
    /// the declaration takes effect ([`Self::authority_at`]). Nothing else:
    /// otherwise the declaration is the authority's judgment, a stated cost
    /// the party accepted by signing the clause, and a contest shows it
    /// (rules 51, 52; F172). No time is read here: proof of absence by time
    /// is an absence-proof cMIP's, where the clause names one, judged where
    /// an act uses the declaration ([`Self::declaration_used`]). Returns the
    /// declaration and the clause, or why it fails. Every signature the
    /// party made counts here; where an act of a collective uses the
    /// declaration, only those placed at or before its line do.
    pub fn declaration(&self, id: &Hash) -> R<Result<(AbsenceDeclaration, Abandonment), String>> {
        self.declaration_as(id, &|_| Ok(true), &|h| Ok(self.valid(&h.id)))
    }

    /// [`Self::declaration`], where a signature act `s` of the declared
    /// party on a version later than the one field 1 names makes field 1
    /// no longer the last version it signed only where `counts(s)`.
    fn declaration_as(
        &self,
        id: &Hash,
        counts: &dyn Fn(&Hash) -> R<bool>,
        kept: &dyn Fn(&Held) -> R<bool>,
    ) -> R<Result<(AbsenceDeclaration, Abandonment), String>> {
        let h = self.held(id)?;
        if !self.is_agreements(h, types::DECLARATION) {
            return Ok(Err("not an abandonment declaration (type 13)".into()));
        }
        // F302: in a collective, as the line using it places it, whatever
        // its signer's later rotation disowned.
        if !kept(h)? {
            return Ok(Err("the declaration is not valid under Identity".into()));
        }
        let d = match AbsenceDeclaration::decode(&h.inside) {
            Ok(d) => d,
            Err(e) => return Ok(Err(e.to_string())),
        };
        // F189 (8): a declaration counts only if it is public, or addressed
        // (sealed) to the member it names, among others if wished: whoever
        // checks the act registering it, that member included, must obtain
        // it to accept it.
        if h.act.outside.content_key.is_none() && !h.act.outside.to.iter().flatten().any(|q| q == &d.party) {
            return Ok(Err(
                "the declaration is neither public nor addressed to the member it names: it counts for nothing (rule 51; F189, 8)".into(),
            ));
        }
        let lineage = self.lineage(&d.agreement)?;
        if !lineage[0].1.parties.contains(&d.party) {
            return self.holder_declaration(h, d, &lineage);
        }
        if d.outcomes.is_empty() {
            return Ok(Err("a declaration against a party states at least one outcome (\"Abandonment declaration (type 13)\")".into()));
        }
        // Field 1 is the last version, back from field 0, that the party
        // signed (rule 51), judged where the declaration is used (F172): a
        // signature on a later version counts against it only where
        // `counts` places it there, so a later act of the party never
        // undoes what was put in force.
        // The party's signatures field 1 is checked against, as the line
        // judged them (F302): kept where its later rotation disowned them.
        let sigs_on = |v: &Hash| -> R<Vec<Hash>> {
            let mut out = vec![];
            for s in self.v.signed_by(&d.party) {
                if self.is_agreements(s, types::SIGNATURE) && decode_signature(&s.inside).ok() == Some(*v) && kept(s)? {
                    out.push(s.id);
                }
            }
            Ok(out)
        };
        let mut found = None;
        let mut signed_any = false;
        for (v, vt) in &lineage {
            let sigs = sigs_on(v)?;
            if sigs.is_empty() {
                continue;
            }
            signed_any = true;
            if v == &d.clause {
                found = Some(vt);
                break;
            }
            for s in &sigs {
                if counts(s)? {
                    return Ok(Err(
                        "the clause it applies is not the last version of the agreement the party signed (rule 46a)".into(),
                    ));
                }
            }
        }
        let Some(vt) = found else {
            return Ok(Err(if signed_any {
                "the clause it applies is not the last version of the agreement the party signed (rule 46a)".into()
            } else {
                "the party signed no version of the agreement it names".into()
            }));
        };
        if vt.abandonment.is_none() {
            return Ok(Err("the version the party signed carries no abandonment clause".into()));
        }
        // Reading 7, corrected (F121): the clause in force applies, that of
        // the agreement the declaration names, for every party, one whose
        // voice was removed before a judicial change included; field 1
        // still names the last version the party signed.
        let Some(clause) = lineage[0].1.abandonment.clone() else {
            return Ok(Err("the agreement it names carries no abandonment clause".into()));
        };
        if !d.outcomes.iter().all(|o| clause.outcomes.contains(o)) {
            return Ok(Err("an outcome the clause does not allow (rule 51)".into()));
        }
        // Rule 89: where the party's succession plan names a stake
        // successor, its stake goes by succession; a declaration stating
        // outcome 1 is refused, never read as the
        // plan (proposal, `docs/f270-build.md`): the outcomes are the
        // authority's signed words.
        let heirs = lineage[0].1.succession.iter().flatten().any(|s| s.party == d.party && s.stakes.as_ref().is_some_and(|v| !v.is_empty()));
        if heirs && d.outcomes.contains(&outcomes::STAKE_REDISTRIBUTED) {
            return Ok(Err(
                "outcome 1 against a party whose succession plan names a stake successor: its stake goes to that successor by succession (rule 89)".into(),
            ));
        }
        let signer = h.act.outside.signer.ok_or(AgreementsError::Check("a declaration with no signer"))?;
        let ok = match clause.authority {
            Authority::Named(a) => signer == a,
            Authority::Others(_) => signer != d.party,
        };
        if !ok {
            return Ok(Err("it is not signed by the authority the clause names (rule 51)".into()));
        }
        Ok(Ok((d, clause)))
    }

    /// Rule 85: a declaration naming a holder of the collective's stake in
    /// itself who is no party (a departed holder, a stake successor, a
    /// buyer), made under the clause in force (that of the agreement it
    /// names, field 1 naming a version of its lineage), signed by its
    /// authority, with the stake-moving outcomes only: outcome 1 where the
    /// holder's succession plan names no stake successor; where it names
    /// one, no outcome (field 3 empty), the stake going by succession (rule
    /// 89). Never 0, 3 or 4.
    fn holder_declaration(&self, h: &Held, d: AbsenceDeclaration, lineage: &[(Hash, Terms)]) -> R<Result<(AbsenceDeclaration, Abandonment), String>> {
        let t = &lineage[0].1;
        let holds = t.is_collective() && t.own_stake().is_some_and(|(_, st)| st.identified().iter().any(|(x, n)| *x == d.party && *n > 0));
        if !holds {
            return Ok(Err("the party declared absent is not a party of the agreement it names, nor a holder of a collective's stake in itself (rule 85, F313)".into()));
        }
        if !lineage.iter().any(|(v, _)| *v == d.clause) {
            return Ok(Err("the clause it applies is not a version of the agreement it names (rule 85, F313)".into()));
        }
        let Some(clause) = t.abandonment.clone() else {
            return Ok(Err("the agreement it names carries no abandonment clause".into()));
        };
        if !d.outcomes.iter().all(|o| clause.outcomes.contains(o)) {
            return Ok(Err("an outcome the clause does not allow (rule 51)".into()));
        }
        let heirs = t.succession.iter().flatten().any(|s| s.party == d.party && s.stakes.as_ref().is_some_and(|v| !v.is_empty()));
        let stated: &[u64] = if heirs { &[] } else { &[outcomes::STAKE_REDISTRIBUTED] };
        if d.outcomes != stated {
            return Ok(Err(
                "against a holder who is no party, only the stake-moving outcomes: none, the stake passing by succession, where its plan names a stake successor, else outcome 1; never 0, 3 or 4 (rule 85)".into(),
            ));
        }
        let signer = h.act.outside.signer.ok_or(AgreementsError::Check("a declaration with no signer"))?;
        let ok = match clause.authority {
            Authority::Named(a) => signer == a,
            Authority::Others(_) => signer != d.party,
        };
        if !ok {
            return Ok(Err("it is not signed by the authority the clause names (rule 51)".into()));
        }
        Ok(Ok((d, clause)))
    }

    /// A declaration as the act `by` uses it (rule 51, F172): the record
    /// registering it, or the clone put in force under it (a deal's clone,
    /// or the clone a recovery rotation declares). Its own checks
    /// ([`Self::declaration`]), and, where the clause in force names an
    /// absence-proof cMIP (key 3), that cMIP's acceptance for that act, as
    /// the caller states it ([`Self::absence_accepted`]): a declaration it
    /// refused, or could not judge, does not count there. Judged at that
    /// act and nowhere else: the cMIP judges the acts that act's history
    /// holds (F178 item 12), so a later act of the party, or a later
    /// contest, never undoes what was put in force there. In a collective,
    /// `at` is the line where it takes effect, with the agreement in force
    /// there: the party's signature on a later version than field 1 counts
    /// against field 1 only where the collective placed it at or before
    /// that line ("Made before, made after", 2), never by its making.
    fn declaration_used(&self, id: &Hash, by: &Hash, at: Option<(&Col, Line<'a>, &Hash)>) -> R<Result<(AbsenceDeclaration, Abandonment), String>> {
        let got = match at {
            None => self.declaration(id)?,
            Some((col, l, ag)) => self.declaration_as(
                id,
                &|s| {
                    let h = self.held(s)?;
                    self.placed_at(col, h, l, ag)
                },
                &|h| self.kept_at(col, h, l),
            )?,
        };
        let (d, clause) = match got {
            Ok(v) => v,
            Err(w) => return Ok(Err(w)),
        };
        if clause.proof.is_some() && !self.absence_accepted.contains(&(*id, *by)) {
            return Ok(Err(
                "the clause names an absence-proof cMIP, and it has not accepted the declaration for this act: it refused it, or could not judge it, so it does not count here (rule 51, task \"Absence proof\", F172)".into(),
            ));
        }
        Ok(Ok((d, clause)))
    }

    /// A threshold authority, counted where the declaration takes effect
    /// (rule 49, Q37, flaw C): among the other parties of the agreement in
    /// force whose voice remains there. One of them signs the declaration;
    /// the others add signature acts naming it (B15), which count where the
    /// collective placed them at or before that line: an act of the
    /// collective before it acknowledges them, or the record registering the
    /// declaration does ("Made before, made after", 2). It counts once the
    /// required number have signed. At a recovery rotation (C7), which the
    /// collective cannot precede with any act of its own without the
    /// declared party, the rotation places the signature acts its Agreements
    /// declaration names (Flaw B18).
    #[allow(clippy::too_many_arguments)]
    fn authority_at(
        &self,
        col: &Col,
        point: Point<'a>,
        ag: &Hash,
        clause: &Abandonment,
        d: &AbsenceDeclaration,
        decl: &Hash,
        signer: &Hash,
        own: &[Departure],
    ) -> R<Result<(), String>> {
        let Authority::Others(k) = clause.authority else {
            return Ok(Ok(()));
        };
        let t = self.terms(ag)?;
        let others: Vec<Hash> = t.parties.iter().filter(|p| **p != d.party).copied().collect();
        let (_, remaining) = self.voices(col, point, ag, &others, None, &BTreeMap::new(), own)?;
        if !remaining.contains(signer) {
            return Ok(Err(
                "its signer is not among the other parties whose voice remains at the line (rule 49, Q37)".into(),
            ));
        }
        let Some(need) = Rule::Threshold(k).needed(remaining.len()) else {
            return Ok(Err("no other voice remains to declare absence".into()));
        };
        let Point::Line(l) = point else {
            return Err(AgreementsError::Check("a declaration is counted at a line"));
        };
        let mut signed = vec![*signer];
        for (who, s) in self.valid_sigs(decl, &remaining) {
            if signed.contains(&who) {
                continue;
            }
            let h = self.held(&s)?;
            if self.placed_at(col, h, l, ag)? {
                signed.push(who);
            }
        }
        if signed.len() >= need {
            return Ok(Ok(()));
        }
        Ok(Err(format!(
            "it has {} of the {need} signatures of the other parties its number needs, placed at or before the line (rule 49, B15)",
            signed.len()
        )))
    }

    /// Whether the collective placed a member's signature act `h` at line
    /// `l` or before it ("Made before, made after", 2): at that same line,
    /// at an earlier one, or by an act of its own the keepers of `ag`, the
    /// agreement in force there, recorded before it.
    fn placed_at(&self, col: &Col, h: &Held, l: Line<'a>, ag: &Hash) -> R<bool> {
        for (p, is_line) in self.placements(col, h) {
            let (placed, same) = match (p, l) {
                (Line::Record(a), Line::Record(b)) if a.id == b.id => (true, true),
                (Line::Rotation(i), Line::Rotation(j)) if i == j => (true, true),
                (Line::Record(a), _) if !is_line => (self.keepers_place(col, a, l, Some(*ag))?, false),
                _ => (self.line_before(col, p, l), false),
            };
            // An act of the broken stretch places nothing, a declaration's
            // signatures included (rule 37d, F187 7): only the line being
            // judged, a record or the rollback registering it, places them
            // there. Never asked of that line itself.
            if placed && (same || !self.in_broken_stretch(col, p)?) {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// The declarations against `party` that its possible authorities
    /// signed, under the clauses of `lineage`: the identities they name, or
    /// the other parties of `parties`. Checked on their own, and as the act
    /// `by` uses them (the clone put in force under them: absence proof,
    /// [`Self::declaration_used`]), stating one of the outcomes `stating`.
    fn declarations_against(&self, party: &Hash, lineage: &[(Hash, Terms)], parties: &[Hash], by: &Hash, at: Option<(&Col, Line<'a>, &Hash)>, stating: &[u64]) -> R<Vec<(Hash, AbsenceDeclaration, Abandonment, Hash)>> {
        let mut who: Vec<Hash> = vec![];
        for (_, t) in lineage {
            match t.abandonment.as_ref().map(|a| &a.authority) {
                Some(Authority::Named(a)) => who.push(*a),
                Some(Authority::Others(_)) => who.extend(parties.iter().filter(|p| *p != party)),
                None => {}
            }
        }
        let ids: Vec<Hash> = lineage.iter().map(|(i, _)| *i).collect();
        let mut out = vec![];
        let mut seen = BTreeSet::new();
        for w in who {
            for h in self.v.signed_by(&w) {
                if !self.is_agreements(h, types::DECLARATION) || !seen.insert(h.id) {
                    continue;
                }
                if let Ok((d, c)) = self.declaration_used(&h.id, by, at)? {
                    // A declaration stating no outcome, against a holder
                    // who is no party, passes the stake by succession.
                    if &d.party == party
                        && (stating.iter().any(|o| d.outcomes.contains(o)) || (d.outcomes.is_empty() && stating.len() > 1))
                        && ids.contains(&d.agreement)
                    {
                        out.push((h.id, d, c, w));
                    }
                }
            }
        }
        Ok(out)
    }

    /// C7: where the declared party is one the collective's signing key
    /// cannot be produced without, under the agreement in force at rotation
    /// `j`, its declaration takes effect at the rotation the recovery path
    /// makes, a line by its kept tips. Read here as the rotation declaring
    /// the clone `k` that takes that party out (question B16).
    fn recovery_departures(&self, col: &Col, j: usize, at: &Hash, k: &Hash) -> R<Vec<Departure>> {
        let t = self.terms(at)?;
        let kt = self.terms(k)?;
        if t.grammar.is_none() {
            return Ok(vec![]);
        }
        let lineage = self.lineage(at)?;
        let mut out = vec![];
        for p in &t.parties {
            // The declared party is the one who would draw the line: no
            // other member remains to draw a record (rule 89).
            if kt.parties.contains(p) || t.parties.iter().any(|q| q != p) {
                continue;
            }
            let mut open = None;
            for (x, d, clause, signer) in self.declarations_against(p, &lineage, &t.parties, k, Some((col, Line::Rotation(j), at)), &[outcomes::VOICE_REMOVED])? {
                match self.authority_at(col, Point::Line(Line::Rotation(j)), at, &clause, &d, &x, &signer, &[]) {
                    Ok(Ok(())) => {
                        out.push(Departure {
                            act: x,
                            party: *p,
                            kind: DepartureKind::Declared { agreement: d.agreement },
                        });
                        open = None;
                        break;
                    }
                    Ok(Err(_)) => {}
                    Err(e @ AgreementsError::Unsettled(_)) => open = Some(e),
                    Err(e) => return Err(e),
                }
            }
            if let Some(e) = open {
                return Err(e);
            }
        }
        Ok(out)
    }

    /// The third element of a recovery rotation's Agreements declaration (Flaw
    /// B18): each act it names is a valid signature act on an abandonment
    /// declaration against a party the declared clone `k` takes out and
    /// the collective's signing key cannot be produced without under the
    /// agreement in force `at` (C7, B16). Naming any other act puts nothing
    /// in force, as for the clone's own signatures (Flaw M).
    fn recovery_signatures(&self, col: &Col, j: usize, at: &Hash, k: &Hash, absence: Option<&[Hash]>) -> R<Option<String>> {
        let Some(absence) = absence else { return Ok(None) };
        let t = self.terms(at)?;
        let kt = self.terms(k)?;
        let removed: Vec<Hash> = match &t.grammar {
            Some(_) => t.parties.iter().filter(|p| !kt.parties.contains(p) && t.parties.iter().all(|q| q == *p)).copied().collect(),
            None => vec![],
        };
        for s in absence {
            let h = self.held(s)?;
            // F302: as this recovery rotation places it.
            let on = if self.is_agreements(h, types::SIGNATURE) && self.kept_at(col, h, Line::Rotation(j))? {
                decode_signature(&h.inside).ok()
            } else {
                None
            };
            let ok = match on {
                Some(x) => match self.declaration_used(&x, k, Some((col, Line::Rotation(j), at))) {
                    Ok(Ok((d, _))) => removed.contains(&d.party),
                    _ => false,
                },
                None => false,
            };
            if !ok {
                return Ok(Some(
                    "the rotation names, beside its clone's, an act that is not a valid signature act on a declaration taking effect at it (C7, Flaw B18)".into(),
                ));
            }
        }
        Ok(None)
    }

    // ------------------------------------------------------------ succession

    /// A clone whose mark names a party's succession plan, `[3, party]`
    /// (rules 44c, 48c), checked against its parent alone: the mark names
    /// nothing else; the parent carries an automatic plan for that party;
    /// the signers are its seat successors; and the clone changes nothing
    /// but what the plan gives (Flaw B14): the party out of the parties and
    /// every area, its seat successors in; the successors in the party's
    /// place in every holding of the key grammar, every threshold
    /// unchanged; the executed plan dropped from field 16, and, where the
    /// party held the chain key alone, a plan for the successor in its
    /// place (Flaw B17). What the texts
    /// leave open ([`plan_open`]) is refused at the line
    /// ([`Self::plan_at`]), never guessed.
    fn plan_static(parent: &Terms, clone: &Terms, mark: &[MarkEntry]) -> Result<Vec<Power>, String> {
        let [MarkEntry { power: Power::Plan(p), signers }] = mark else {
            return Err("a mark naming a succession plan names it alone (rule 44c)".into());
        };
        let Some(plan) = parent.succession.iter().flatten().find(|s| &s.party == p) else {
            return Err("the parent carries no succession plan for that party".into());
        };
        if plan.entry != Some(0) {
            return Err(
                "the plan's seat does not enter automatically: its successor is a nomination (rule 48c, Q14)".into(),
            );
        }
        let seats: Vec<Hash> = plan.seats.iter().flatten().copied().collect();
        if seats.is_empty() {
            return Err("the plan names no seat successor".into());
        }
        let mut a = signers.clone();
        let mut b = seats.clone();
        a.sort();
        b.sort();
        if a != b {
            return Err("its signers are the seat successors entering, all of them (rule 48c)".into());
        }
        // Field 0: the others stay, in their order; the successors enter.
        let others: Vec<Hash> = clone.parties.iter().filter(|x| !seats.contains(x)).copied().collect();
        let kept: Vec<Hash> = parent.parties.iter().filter(|x| *x != p && !seats.contains(x)).copied().collect();
        if others != kept || !seats.iter().all(|x| clone.parties.contains(x)) {
            return Err("it changes the parties beyond what the plan gives (rule 48c)".into());
        }
        // Rule 83: a seat successor placed elsewhere than in the party's own
        // place among the parties changes more than the plan gives: a false
        // mark (rule 46). Where the texts leave the place open, the clone is
        // refused at the line ([`plan_open`]).
        let placed: Vec<Hash> = parent.parties.iter().flat_map(|x| if x == p { seats.clone() } else { vec![*x] }).collect();
        if plan_open(parent, plan).is_none() && clone.parties != placed {
            return Err("it places a seat successor elsewhere than in the party's own place among the parties: a false mark (rules 46, 83)".into());
        }
        if clone.areas().iter().any(|x| x.holders.contains(p)) {
            return Err("it leaves the party among an area's holders (Q21)".into());
        }
        let ids = |t: &Terms| t.areas().iter().map(|x| x.id).collect::<Vec<_>>();
        if ids(parent) != ids(clone) {
            return Err("it changes the areas beyond taking the party off them (rule 44c)".into());
        }
        for x in parent.areas() {
            let mut y = x.clone();
            y.holders.retain(|h| h != p);
            if clone.area(x.id) != Some(&y) {
                return Err("it changes an area beyond taking the party off it (rule 44c, Q26)".into());
            }
        }
        // The key grammar: the successors take the party's place in every
        // holding, every threshold unchanged (B14). Where the texts leave
        // the place open, the grammar is checked at the line.
        if plan_open(parent, plan).is_none() && clone.grammar != plan_grammar(parent, p, &seats) {
            return Err(
                "it does not put the seat successors in the party's place in the key grammar, every threshold unchanged (B14)".into(),
            );
        }
        // Field 16: the executed plan dropped, every other plan as it was;
        // where the party held the chain key alone, a plan for the
        // successor in its place, naming their own successor (Flaw B17,
        // rule 36), signed by the successor as the mark's signer.
        let plans: Vec<SuccessionPlan> = parent.succession.clone().unwrap_or_default();
        let rest: Vec<SuccessionPlan> = plans.iter().filter(|s| &s.party != p).cloned().collect();
        let got = clone.succession.clone().unwrap_or_default();
        let sole = matches!(parent.grammar.as_ref().map(|g| &g.chain_key), Some(Holding::One(x)) if x == p);
        if sole && plan_open(parent, plan).is_none() {
            let i = plans.iter().position(|s| &s.party == p).expect("found above");
            let theirs = (got.len() == plans.len()).then(|| &got[i]);
            let others: Vec<SuccessionPlan> = got.iter().enumerate().filter(|(j, _)| *j != i).map(|(_, x)| x.clone()).collect();
            let named = theirs.is_some_and(|x| x.party == seats[0] && x.seats.as_ref().is_some_and(|v| !v.is_empty()));
            if !named || others != rest {
                return Err(
                    "the party held the chain key alone: it drops the executed plan and carries, in its place, a plan for the successor naming their own successor (rule 36, B17)".into(),
                );
            }
        } else if got != rest {
            return Err("it does not drop the executed plan alone from the succession plans (B14)".into());
        }
        // Field 19: the seat successors in the party's place in every
        // layer's rule naming it, once for each seat, as in field 0, nothing
        // else in the layers' rules changed (rules 64 and 83).
        if clone.layers != plan_layers(parent, p, &seats) {
            return Err("it changes the layers' rules beyond putting the seat successors in the party's place (rules 64, 83)".into());
        }
        // Field 7: the party's stakes passed to its stake successors, in the
        // plan's parts (rule 83); with none named, the stakes unchanged.
        if !plan_stakes(parent, clone, p, plan.stakes.as_deref().unwrap_or_default()) {
            return Err("it changes the stakes beyond passing the party's shares to its stake successors, in the plan's parts (rules 64, 83)".into());
        }
        for c in changes(parent, clone) {
            // Field 34: the party taken off every area it held (rule 64).
            if !matches!(c, Change::Field(0 | 7 | 12 | 16 | 19 | 34)) {
                return Err("it changes more than the plan gives (rule 44c)".into());
            }
        }
        Ok(vec![Power::Plan(*p)])
    }

    /// A clone marked with a succession plan, at a line (rules 48b, 48c,
    /// Q14): every seat successor named signed it; the plan's trigger, a
    /// declaration removing the party's voice, is in effect there; and
    /// every party whose voice remains signed a version, up to the parent,
    /// carrying that plan exactly. It is then complete, the seat passing
    /// (B14), save where the texts leave its shape open ([`plan_open`]):
    /// refused, never guessed.
    #[allow(clippy::too_many_arguments)]
    fn plan_at(
        &self,
        col: &Col,
        at: Line<'a>,
        lineage: &[(Hash, Terms)],
        party: &Hash,
        signers: &[Hash],
        by: &BTreeMap<Hash, Hash>,
        own: &[Departure],
    ) -> R<CloneState> {
        let parent = &lineage[1].1;
        let pid = lineage[1].0;
        let plan = parent
            .succession
            .iter()
            .flatten()
            .find(|s| &s.party == party)
            .expect("checked by plan_static");
        if !signers.iter().all(|s| by.contains_key(s)) {
            return Ok(CloneState::Draft(
                "a seat successor its mark names has no signature act among those named".into(),
            ));
        }
        let up: Vec<Hash> = lineage[1..].iter().map(|(i, _)| *i).collect();
        let triggered = self
            .departure_lines(col, Point::Line(at), own)?
            .iter()
            .any(|(_, d)| {
                &d.party == party
                    && matches!(&d.kind, DepartureKind::Declared { agreement } if up.contains(agreement))
            });
        if !triggered {
            return Ok(CloneState::Draft(
                "the plan's trigger, a declaration removing the party's voice, is not in effect at this line (rule 48b)".into(),
            ));
        }
        let (_, remaining) = self.voices(col, Point::Line(at), &pid, &parent.parties, None, &BTreeMap::new(), own)?;
        for v in remaining.iter().filter(|v| *v != party) {
            let signed = lineage[1..].iter().any(|(id, t)| {
                t.succession.iter().flatten().any(|s| s == plan) && !self.signers(id, &[*v]).is_empty()
            });
            if !signed {
                return Ok(CloneState::Invalid(
                    "a party whose voice remains never signed a version carrying this plan: the seat is a nomination (rule 48c, Q14)".into(),
                ));
            }
        }
        if let Some(w) = plan_open(parent, plan) {
            return Err(AgreementsError::Unsettled(w));
        }
        // The successors' place among the parties is checked with the
        // clone's terms ([`Self::plan_static`], rule 83).
        Ok(CloneState::Complete)
    }

    // ------------------------------------------------------------ acts of the collective

    /// The agreement in force for an act of the collective, and whether
    /// records of sibling clones leave it at their parent (rule 37c).
    fn in_force_act(&self, col: &Col, x: &'a Held, b: usize, base: Hash) -> R<InForce> {
        let mut puts = vec![];
        for r in self.records_since(col, b) {
            if r.id == x.id {
                continue;
            }
            if !self.before(col, x, Line::Record(r))? {
                let e = self.record_eval(col, r)?;
                if let Some(k) = e.puts {
                    puts.push((k, e.resolves));
                }
            }
        }
        self.fold(base, &puts)
    }

    /// The agreement in force for an act of a collective.
    pub fn in_force(&self, act: &Hash) -> R<Option<Hash>> {
        let x = self.held(act)?;
        let Some(c) = self.named_collective(x).or(x.act.outside.signer.filter(|s| self.col(s).res.position_of(act).is_some())) else {
            return Ok(None);
        };
        let col = self.col(&c);
        let Some(b) = self.act_link(&col, x) else {
            return Err(AgreementsError::Check("the act cites no decision of the collective"));
        };
        if !self.declares(&col, b) {
            return Ok(None);
        }
        match self.base(&col, b)? {
            Ok(base) if self.is_agreements(x, types::RECORD) => Ok(Some(self.in_force_act(&col, x, b, base)?.agreement)),
            Ok(base) => Ok(Some(self.in_force_action(&col, x, b, base)?.agreement)),
            Err(_) => Ok(None),
        }
    }

    /// Whether the collective's act `x` counts as made before the line
    /// `line` (a record or rotation of the same collective).
    pub fn counts_before(&self, x: &Hash, line: &Hash) -> R<bool> {
        let xh = self.held(x)?;
        // The collective an act for it names (rule 58), else its signer.
        let c = self.author(xh).ok_or(AgreementsError::Check("the act has no signer"))?;
        let col = self.col(&c);
        let lh = self.held(line)?;
        let l = match col.res.position_of(line) {
            Some(j) => Line::Rotation(j),
            None => Line::Record(lh),
        };
        self.before(&col, xh, l)
    }

    /// For a receipt or claim of the collective (Money types 2 and 3) as
    /// payee: the rail Module it names, if the collective never accepted it
    /// (Money rule 12a, F115). Accepted: a rail of one of the collective's
    /// payee pointers that counts (its Money lane's holders signed it), or
    /// an entry of the vault its identity chain declares at the act's
    /// binding. *Which exact rail or entry a payment went to is in the rail's
    /// proof, which the payment cMIP reads (`paid-to`); Agreements check only that
    /// the collective ever accepted the rail Module.*
    fn rail_not_accepted(&self, col: &Col, c: &Hash, x: &Held, b: usize) -> R<Option<Hash>> {
        use crate::money::{self as fin, Payload as Fin};
        let money = self.mirs.money;
        if x.inside.spec != money {
            return Ok(None);
        }
        let rail = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Receipt(r)) if &r.payee == c => r.rail,
            Ok(Fin::Claim(cl)) if &cl.payee == c => cl.rail,
            _ => return Ok(None),
        };
        if let Some(state) = col.res.states.get(b) {
            if let Ok(Some(Some(entries))) = fin::vault_in(&money, &state.declarations) {
                if entries.iter().any(|e| e.rail_module == rail) {
                    return Ok(None);
                }
            }
        }
        for h in self.payees_acts(c) {
            if h.inside.spec != money || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(p)) = Fin::decode(h.inside.type_, &h.inside.payload) else {
                continue;
            };
            if &p.payee == c && p.rails.iter().any(|r| r.module == rail) && self.valid(&h.id) {
                if self.consent(&h.id)?.counts() {
                    return Ok(None);
                }
                // F198 (decided 10 October 2026, "Feels like the only
                // option, agreed"): a pointer an ending left outside its
                // history still counts for payments already made to it, as
                // the chain stood for each (F181): this act, before the
                // ending's line, is one. For anything after the ending it
                // counts for nothing (rule 47a). Read here as judging the
                // pointer as the chain stood without the ending, which also
                // keeps a pointer inside the history whose taking-on (rule
                // 40, IT2a) the ending's old line left out (reading, to
                // confirm).
                if self.closed_by(c)?.is_some() && self.on_own_history(c, |v| v.consent(&h.id))?.0.counts() {
                    return Ok(None);
                }
            }
        }
        Ok(Some(rail))
    }

    /// Agreements' answer for an act of a collective (rules 36a, 37b, 38a, 44d;
    /// F100, F106, F109). The act's own standing is Identity's, from
    /// [`Verifier::status`]; this asks only what Agreements adds.
    pub fn consent(&self, act: &Hash) -> R<Consent> {
        // F131 (IT2a): an act of the collective's own key that does not count
        // as judged counts all the same where the departures racing a
        // citation of it by a counting act of its own key are set aside: no
        // ending racing that citation voids it. Judged again only then, so
        // that setting a departure aside never makes an act fail.
        let first = self.consent_judged(act)?;
        if first.counts() || self.adopting.borrow().contains(act) {
            return Ok(first);
        }
        self.adopting.borrow_mut().insert(*act);
        let again = self.consent_judged(act);
        self.adopting.borrow_mut().remove(act);
        let again = again?;
        Ok(if again.counts() { again } else { first })
    }

    /// The collective an act is for (rule 58): the identity, other than its
    /// signer, that it names as chain in `objects` and whose genesis
    /// declares an agreement. `None` for a person's own act.
    fn named_collective(&self, x: &Held) -> Option<Hash> {
        let signer = x.act.outside.signer;
        x.inside.objects.iter().flatten().map(|o| o.chain).find(|c| Some(*c) != signer && self.founding_of(c).is_some())
    }

    fn consent_judged(&self, act: &Hash) -> R<Consent> {
        let x = self.held(act)?;
        let Some(signer) = x.act.outside.signer else {
            return Err(AgreementsError::Check("the act has no signer"));
        };
        let Some(c) = self.named_collective(x) else {
            // A collective signs no everyday act: its members act for it
            // (rule 56). Its identity-chain acts are Identity's.
            if let Some(f) = self.founding_of(&signer) {
                if self.col(&signer).res.position_of(act).is_none() {
                    return Ok(Consent::Invalid { agreement: f, reason: "a collective signs no everyday act: its members act for it, each with their own key, naming it (rule 56)".into() });
                }
            }
            return Ok(Consent::NotCollective);
        };
        let col = self.col(&c);
        // A grantee's act, citing its grant on the collective's chain, is
        // judged by that grant (rule 80), with no area's signatures: the
        // grant is the consent, given once.
        if let Some((g, _)) = self.col_grant(&col, x) {
            return Ok(match self.backing(act)? {
                Backing::Backed { grant } | Backing::Binds { grant } => Consent::Granted { agreement: self.in_force(act)?.unwrap_or(g.id), grant },
                Backing::NotBacked { grant, reason } | Backing::Disputed { grant, reason } => Consent::Ungranted { grant, reason },
                Backing::Unknown { grant, reason } => Consent::Unknown { grant, reason },
                Backing::NotUnderGrant => Consent::Ungranted { grant: g.id, reason: "not signed by the grant's grantee".into() },
            });
        }
        let Some(b) = self.act_link(&col, x) else {
            return Ok(Consent::Uncited {
                reason: "it cites no decision of the collective on its chain: it is on no chain of the collective, and counts for nothing (rule 58)".into(),
            });
        };
        if !self.declares(&col, b) {
            return Ok(Consent::NotCollective);
        }
        let base = match self.base(&col, b)? {
            Ok(x) => x,
            Err(reason) => return Ok(Consent::Broken { reason }),
        };
        if let Some(e) = self.closed_by(&c)? {
            if !self.before_ending(&col, x, &e.by) {
                return Ok(Consent::Closed { by: e.by });
            }
        }
        // A text act the Text MIR makes invalid counts for nothing here
        // either: Agreements follow Text's verdict.
        if x.inside.spec == self.mirs.text && self.v.status(act) == crate::chain::Status::Invalid {
            return Ok(Consent::Invalid { agreement: base, reason: "a text act the Text MIR makes invalid: it counts for nothing".into() });
        }
        if self.is_agreements(x, types::RECORD) {
            let ag = self.in_force_act(&col, x, b, base)?.agreement;
            return Ok(Consent::Line { agreement: ag });
        }
        // Negotiation is talk, binding nothing, on neither chain.
        if self.is_agreements(x, types::NEGOTIATION) {
            return Ok(Consent::Talk);
        }
        // Identity's acts of a collective are its chain acts: a member's
        // Identity act naming it is on neither chain, and counts for
        // nothing in Agreements.
        if x.inside.spec == self.mirs.identity {
            return Ok(Consent::Identity);
        }
        if let Some(reason) = self.uncited(&col, x, Some(b))? {
            return Ok(Consent::Uncited { reason });
        }
        let ag = self.in_force_action(&col, x, b, base)?.agreement;
        if let Some(reason) = self.not_done(x, &ag)? {
            return Ok(Consent::NotDone { agreement: ag, reason });
        }
        // Retired types are never reused; an act of one is invalid.
        if x.inside.spec == self.mirs.agreements && super::open_formats::RETIRED_TYPES.contains(&x.inside.type_) {
            return Ok(Consent::Invalid { agreement: ag, reason: format!("Agreements type {} is retired, never reused", x.inside.type_) });
        }
        if self.is_agreements(x, types::PUBLICATION) {
            if let Err(e) = crate::agreements::Publication::decode(&x.inside) {
                return Ok(Consent::Invalid { agreement: ag, reason: e.to_string() });
            }
        }
        if let Some(rail) = self.rail_not_accepted(&col, &c, x, b)? {
            return Ok(Consent::RailNotAccepted { agreement: ag, rail });
        }
        let t = self.terms(&ag)?;
        let mut reaching: Vec<Area> = vec![];
        // A revocation is judged, like the grant it names, by that grant's
        // area alone, or, naming none, by the rule for Agreements (rule 74).
        if self.is_agreements(x, types::REVOCATION) {
            let r = match Revocation::decode(&x.inside.payload) {
                Ok(r) => r,
                Err(e) => return Ok(Consent::Invalid { agreement: ag, reason: e.to_string() }),
            };
            let g = self.v.get(&r.grant).filter(|g| self.is_agreements(g, types::GRANT));
            let Some(g) = g.and_then(|g| Grant::decode(&g.inside.payload).ok().map(|d| (g, d))) else {
                return Ok(Consent::Invalid { agreement: ag, reason: "it names no grant this verifier holds".into() });
            };
            if !Self::for_col(&col, g.0) {
                return Ok(Consent::Invalid { agreement: ag, reason: "it names a grant of another grantor".into() });
            }
            match g.1.area.and_then(|id| t.area(id)) {
                Some(a) => reaching.push(a.clone()),
                None => reaching.extend(t.lane(layers::AGREEMENTS)),
            }
        }
        if self.is_agreements(x, types::GRANT) {
            let g = match Grant::decode(&x.inside.payload) {
                Ok(g) => g,
                Err(e) => return Ok(Consent::Invalid { agreement: ag, reason: e.to_string() }),
            };
            // A collective's grant carries no key (rule 73).
            if g.key.is_some() {
                return Ok(Consent::Invalid { agreement: ag, reason: "a collective's grant carries no field 9: a collective has no key to scope (rule 73)".into() });
            }
            if g.kinds.is_none() {
                return Ok(Consent::Invalid { agreement: ag, reason: "a collective's grant names the acts it reaches (field 6, rule 74)".into() });
            }
            if let Some(id) = g.area {
                let Some(a) = t.area(id) else {
                    return Ok(Consent::Invalid { agreement: ag, reason: "the grant names an area the agreement in force does not have".into() });
                };
                if let Some(w) = self.grant_reach_problem(&g, a, &t)? {
                    return Ok(Consent::Invalid { agreement: ag, reason: w });
                }
                reaching.push(a.clone());
            } else {
                // A grant naming no area reaches only acts no area reaches,
                // and counts under the rule for Agreements (rule 74).
                for k in g.kinds.iter().flatten() {
                    if t.areas().iter().any(|a| a.kinds.iter().flatten().any(|ak| t.kinds_overlap(&self.mirs, ak, k))) {
                        return Ok(Consent::Invalid { agreement: ag, reason: "a grant naming no area reaches acts an area reaches (rule 74)".into() });
                    }
                }
                reaching.extend(t.lane(layers::AGREEMENTS));
            }
        }
        // The collective's own split agreement is a protected clause: its
        // versions, and its signature on them, are signed for the collective
        // under the judicial tier's rule, every member whose voice remains
        // (rules 15, 67).
        let split_agreement = |h: &Held| self.pub_act(&h.id).is_some_and(|(_, a)| a.publication.is_split_agreement());
        let names_split = split_agreement(x)
            || (self.is_agreements(x, types::SIGNATURE) && decode_signature(&x.inside).ok().and_then(|s| self.v.get(&s)).is_some_and(split_agreement));
        if reaching.is_empty() && names_split {
            reaching.push(Area {
                name: "the judicial tier".into(),
                holders: t.parties.clone(),
                threshold: t.parties.len() as u64,
                kinds: None,
                fields: None,
                id: super::formats::lane_id(0),
                limits: None,
            });
        }
        if reaching.is_empty() {
            let (spec, ty) = (&x.inside.spec, x.inside.type_);
            // An area within a layer takes the acts its kinds name out of
            // the layer's rule; every other act of a layer falls under that
            // layer's rule (rule 60).
            reaching = t.areas().iter().filter(|a| a.kinds.iter().flatten().any(|k| t.kind_reaches(&self.mirs, k, spec, ty))).cloned().collect();
            if reaching.is_empty() {
                let layers_of = t.spec_layers(&self.mirs, spec);
                if layers_of.is_empty() {
                    return Ok(Consent::Unadopted { agreement: ag });
                }
                for l in layers_of {
                    reaching.extend(t.lane(l));
                }
            }
        }
        // A collective releasing a work decides by its own rules across
        // every layer a release touches: Envelopes, Money and Agreements.
        if self.is_release_act(x) {
            for l in [layers::ENVELOPES, layers::MONEY, layers::AGREEMENTS] {
                if let Some(a) = t.lane(l) {
                    if !reaching.iter().any(|r| r.id == a.id) {
                        reaching.push(a);
                    }
                }
            }
        }
        if reaching.is_empty() {
            return Ok(Consent::Unadopted { agreement: ag });
        }
        // Rule 58: a member's power ends at the line that registers their
        // departure. An act they draft for the collective after it counts
        // for nothing, however many current members also sign it. (Their
        // signature acts are counted with the area's, where a departed
        // voice is never among the signers.)
        if t.parties.contains(&signer) && !self.is_agreements(x, types::SIGNATURE) {
            let (voices, _) = self.voices(&col, Point::Act(x), &ag, &[signer], None, &BTreeMap::new(), &[])?;
            if voices.is_empty() {
                return Ok(Consent::Invalid {
                    agreement: ag,
                    reason: "its drafter's voice was removed at a line its history holds: a member's power ends at the line that registers their departure, and the act counts for nothing, however many current members sign it (rule 58)".into(),
                });
            }
        }
        self.count_areas(&col, act, Point::Act(x), ag, reaching)
    }

    /// Rule 36a: each area reaching `act` counted, under the agreement `ag`
    /// in force for it, the holders' voices taken at `point`: their valid
    /// signature acts naming it, meeting the area's number.
    fn count_areas(&self, col: &Col, act: &Hash, point: Point<'a>, ag: Hash, reaching: Vec<Area>) -> R<Consent> {
        let lineage: Vec<Hash> = self.lineage(&ag)?.into_iter().map(|(i, _)| i).collect();
        // Its drafter signs it with their own key, naming the collective
        // (rule 60): their signature is the act itself.
        let drafter: Option<(Hash, Hash)> = self.v.get(act).and_then(|x| x.act.outside.signer.filter(|s| *s != col.id).map(|s| (s, x.id)));
        let mut out = vec![];
        for a in reaching {
            // Holders' signature acts naming the act, that count.
            let mut by: BTreeMap<Hash, Vec<Hash>> = BTreeMap::new();
            for p in &a.holders {
                for h in self.v.signed_by(p) {
                    if self.is_agreements(h, types::SIGNATURE)
                        && decode_signature(&h.inside).ok() == Some(*act)
                        && self.sig_counts(col, h)?
                    {
                        by.entry(*p).or_default().push(h.id);
                    }
                }
                if let Some((d, x)) = drafter {
                    if d == *p {
                        by.entry(*p).or_default().push(x);
                    }
                }
            }
            let (voices, remaining) =
                self.voices(col, point, &ag, &a.holders, Some(a.id), &by, &[])?;
            let frozen = remaining.is_empty();
            let mut needed = a.rule().needed(voices.len());
            let mut signers = vec![];
            for p in &voices {
                if by.contains_key(p) && lineage.iter().any(|v| !self.signers(v, &[*p]).is_empty()) {
                    signers.push(*p);
                }
            }
            // An area's limits (key 6) are a cMIP's (rule 60): within them,
            // the area's number; above them, one more holder's signature. A
            // verifier holding no verdict answers unknown: the act does not
            // count here. It adds to rule 60, never relaxes it.
            let limits = match &a.limits {
                None => None,
                Some(_) => Some(match self.grant_limits.get(act) {
                    Some(true) => AreaLimits::Within,
                    Some(false) => {
                        needed = needed.map(|n| n + 1);
                        AreaLimits::Above
                    }
                    None => AreaLimits::Unknown,
                }),
            };
            let met = !frozen && limits != Some(AreaLimits::Unknown) && needed.is_some_and(|n| signers.len() >= n);
            out.push(AreaCount {
                area: a.id,
                name: a.name.clone(),
                frozen,
                voices,
                needed: needed.unwrap_or(0),
                signers,
                limits,
                met,
            });
        }
        let met = out.iter().all(|a| a.met);
        Ok(Consent::Areas {
            agreement: ag,
            areas: out,
            met,
        })
    }

    /// F162 (13), rule 36a: whether a rotation or chain signature of a
    /// collective has the consent of the areas over the Identity layer (or
    /// over its act type) in the agreement in force just before it: valid
    /// signature acts naming it by those areas' holders whose voice remains
    /// at it, meeting each area's number. Shown only: what Agreements do with a
    /// rotation lacking that consent is open (Nobody, allegedly, 6 October
    /// 2026); under Identity it counts all the same. `NoArea` where no area
    /// reaches it; `NotCollective` where the chain declares no agreement
    /// before it.
    pub fn rotation_consent(&self, rotation: &Hash) -> R<Consent> {
        let x = self.held(rotation)?;
        if !matches!(&x.identity, Some(Ok(Payload::Rotation(_) | Payload::ChainSignature(_)))) {
            return Err(AgreementsError::Check("not a rotation or chain signature"));
        }
        let c = x.act.outside.signer.ok_or(AgreementsError::Check("a rotation names its identity"))?;
        let col = self.col(&c);
        let Some(j) = col.res.position_of(rotation).filter(|j| *j > 0) else {
            return Err(AgreementsError::Check("the rotation does not count on its identity chain"));
        };
        if !self.declares(&col, j - 1) {
            return Ok(Consent::NotCollective);
        }
        let base = match self.base(&col, j - 1)? {
            Ok(b) => b,
            Err(reason) => return Ok(Consent::Broken { reason }),
        };
        let ag = self.in_force_at_rotation(&col, j, base)?.agreement;
        let t = self.terms(&ag)?;
        let reaching: Vec<Area> = t
            .areas()
            .iter()
            .filter(|a| a.kinds.iter().flatten().any(|k| t.kind_reaches(&self.mirs, k, &x.inside.spec, x.inside.type_)))
            .cloned()
            .collect();
        if reaching.is_empty() {
            return Ok(Consent::NoArea { agreement: ag });
        }
        self.count_areas(&col, rotation, Point::Line(Line::Rotation(j)), ag, reaching)
    }

    /// A release (type 5), or a signature act naming one.
    fn is_release_act(&self, x: &Held) -> bool {
        self.is_agreements(x, types::RELEASE)
            || (self.is_agreements(x, types::SIGNATURE)
                && decode_signature(&x.inside)
                    .ok()
                    .and_then(|r| self.v.get(&r))
                    .is_some_and(|r| self.is_agreements(r, types::RELEASE)))
    }

    /// Rule 38a and Flaw N: a grant within an area reaches only that area's
    /// acts; a reinstatement repeats the grant it names, within the same
    /// area.
    fn grant_reach_problem(&self, g: &Grant, a: &Area, t: &Terms) -> R<Option<String>> {
        if let Some(old) = &g.reinstates {
            let h = self.held(old)?;
            let ok = self.is_agreements(h, types::GRANT)
                && Grant::decode(&h.inside.payload)
                    .is_ok_and(|o| o.area == Some(a.id) && o.reinstates.is_none() && o.same_grant(g));
            return Ok((!ok).then(|| {
                "a reinstatement repeats fields 0 to 6 of a grant within the same area (Flaw N)".to_string()
            }));
        }
        for k in g.kinds.iter().flatten() {
            let within = match k {
                Kind::Layer(l) => a.is_lane(*l),
                Kind::Type { spec, type_ } => a
                    .kinds
                    .iter()
                    .flatten()
                    .any(|ak| t.kind_reaches(&self.mirs, ak, spec, *type_)),
            };
            if !within {
                return Ok(Some(
                    "a grant reaches beyond the power of the area that issues it (rule 38a)".into(),
                ));
            }
        }
        Ok(None)
    }

    /// Lines at which an area froze: records after which no holder of that
    /// area keeps a voice, and rotations declaring it with none (rule 37b).
    fn freezes(&self, col: &Col, area: u64) -> R<Vec<Line<'a>>> {
        let mut out = vec![];
        for k in 0..col.res.links.len() {
            for r in self.records_at(col, k) {
                let e = self.record_eval(col, r)?;
                if !e.line {
                    continue;
                }
                let ag = e.puts.or(e.in_force_at).expect("a line has an agreement");
                let t = self.terms(&ag)?;
                if let Some(a) = t.area(area) {
                    let (_, remaining) = self.voices(
                        col,
                        Point::Line(Line::Record(r)),
                        &ag,
                        &a.holders,
                        Some(area),
                        &BTreeMap::new(),
                        &e.registers,
                    )?;
                    if remaining.is_empty() {
                        out.push(Line::Record(r));
                    }
                }
            }
            if k > 0 {
                if let Some(Ok(d)) = declared_in(&col.res.states[k].declarations, &self.agreements()) {
                    if d.signatures.is_some()
                        && self.base(col, k)?.is_ok()
                        && self.terms(&d.agreement)?.area(area).is_some_and(|a| a.holders.is_empty())
                    {
                        out.push(Line::Rotation(k));
                    }
                }
            }
        }
        // A rollback registering the departure of an area's last holder
        // whose voice there remained freezes it at its line (rules 37b, 37d).
        for (m, k, own) in self.rollback_lines(col, col.res.links.len().saturating_sub(1))? {
            if own.is_empty() || out.iter().any(|l| matches!(l, Line::Rotation(x) if *x == m)) {
                continue;
            }
            if let Some(a) = self.terms(&k)?.area(area) {
                let (_, remaining) = self.voices(col, Point::Line(Line::Rotation(m)), &k, &a.holders, Some(area), &BTreeMap::new(), &own)?;
                if remaining.is_empty() {
                    out.push(Line::Rotation(m));
                }
            }
        }
        Ok(out)
    }

    /// Whether the grantee signed to accept the grant (F128): a valid
    /// signature act (type 1) of its own identity naming it. For a
    /// collective, an acceptance an act of the collective acknowledged is
    /// placed as a member's signature is, and keeps that effect whatever
    /// the grantee's later rotation disowns ([`Self::sig_counts`];
    /// "Grant (type 9)", "Made before, made after", 2 and 4); one no act of
    /// the collective acknowledged is judged by Identity alone.
    fn accepted(&self, col: &Col, collective: bool, gh: &Held, g: &Grant) -> R<bool> {
        for h in self.v.signed_by(&g.grantee) {
            if !self.is_agreements(h, types::SIGNATURE) || decode_signature(&h.inside).ok() != Some(gh.id) {
                continue;
            }
            if self.status(&h.id) == Status::Valid {
                return Ok(true);
            }
            let acked = || self.placements(col, h).iter().any(|(l, _)| !matches!(l, Line::Record(a) if a.id == gh.id));
            if collective && acked() && self.sig_counts(col, h)? {
                return Ok(true);
            }
        }
        Ok(false)
    }






    /// The revocations of a grant that count (F128): decisions of the
    /// grantor, signed with its own key, naming the grant.
    fn revocations(&self, col: &Col, grant: &Hash) -> R<Vec<&'a Held>> {
        let mut out = vec![];
        let collective = (0..col.res.links.len()).any(|k| self.declares(col, k));
        let theirs: Vec<&'a Held> = if collective { self.col_acts(col) } else { self.v.signed_by(&col.id).filter(|h| self.key_grant(h).is_none()).collect() };
        for h in theirs {
            if self.is_agreements(h, types::REVOCATION)
                && (h.act.outside.is_public() || collective)
                && Revocation::decode(&h.inside.payload).is_ok_and(|r| &r.grant == grant)
                && self.valid(&h.id)
                && self.consent(&h.id)?.counts()
            {
                out.push(h);
            }
        }
        Ok(out)
    }

    /// Whether an act signed with a grant key binds the collective whose key
    /// it is (rules 38a, 40, 44; F128). The grant counts (its area's
    /// holders, or the founding terms carrying it) and its grantee signed to
    /// accept it; the act cites its grant, is on the collective's chain,
    /// done, and within the grant's reach. A decision ending the grant's
    /// powers (a revocation, G1; a departure emptying its area, G2; a fork
    /// or closing) leaves it binding only where that decision's history
    /// holds it: otherwise the ending wins, and the act is void (the tie
    /// rule), unless the collective itself acknowledged it (rule 40, A6).
    pub fn backing(&self, act: &Hash) -> R<Backing> {
        let y = self.held(act)?;
        // A person's grant: the grant whose key signed the act. A
        // collective's: the grant the act cites on the collective's chain,
        // its signer the grantee, acting with its own key (rule 80).
        let (c, gh, g) = if let Some((gh, g)) = self.key_grant(y) {
            let Some(c) = y.act.outside.signer else { return Ok(Backing::NotUnderGrant) };
            (c, gh, g)
        } else if let Some(c) = self.named_collective(y) {
            match self.col_grant(&self.col(&c), y) {
                Some((gh, g)) => (c, gh, g),
                None => return Ok(Backing::NotUnderGrant),
            }
        } else {
            return Ok(Backing::NotUnderGrant);
        };
        let col = self.col(&c);
        let not = |w: &str| {
            Ok(Backing::NotBacked {
                grant: gh.id,
                reason: w.into(),
            })
        };
        // A person's grant, and its revocation, are public, since every
        // verifier of the grantee's acts must read them; a person has no
        // members to seal to. A collective's is an act for it.
        let collective = (0..col.res.links.len()).any(|k| self.declares(&col, k));
        let counts = if !collective {
            self.valid(&gh.id) && gh.act.outside.is_public()
        } else {
            self.valid(&gh.id) && self.consent(&gh.id)?.counts()
        };
        if !counts {
            return not("the grant does not count");
        }
        if !self.accepted(&col, collective, gh, &g)? {
            return not("the grantee has not signed to accept the grant (F128)");
        }
        // The grantee's act cites the decision it acts under, its grant,
        // on the grantor's chain (rule 80).
        if !Self::cites(y, &c).contains(&gh.id) {
            return not("it does not cite its grant on the grantor's chain (rule 80)");
        }
        if collective {
            if let Some(w) = self.uncited(&col, y, None)? {
                return not(&w);
            }
        }
        // RB1 (decided 8 and 9 October 2026): a broken collective is
        // quarantined; its grantees' acts of the broken stretch count for
        // nothing, and are signed anew after the rollback, never adopted.
        if collective {
            if let Some(w) = self.in_a_stretch(&col, y)? {
                return not(&w);
            }
        }
        // A grant key never signs a decision: records, grants, revocations
        // and identity-chain acts are signed with the grantor's own key.
        if self.is_agreements(y, types::RECORD) || self.is_agreements(y, types::GRANT) || self.is_agreements(y, types::REVOCATION) {
            return not("a grant key signs no decision of its grantor (F128)");
        }
        let (spec, ty) = (&y.inside.spec, y.inside.type_);
        if collective {
            let Some(ag) = self.in_force(act)? else {
                return not("the grantor's agreement in force cannot be read");
            };
            // Reach: the act's kind lies within the grant's (rule 44).
            let t = self.terms(&ag)?;
            let within = match &g.kinds {
                Some(k) => k.iter().any(|k| t.kind_reaches(&self.mirs, k, spec, ty)),
                None => !t.areas().iter().any(|a| {
                    a.kinds
                        .iter()
                        .flatten()
                        .any(|k| t.kind_reaches(&self.mirs, k, spec, ty))
                }),
            };
            if !within {
                return not("the act lies beyond the grant's reach (rule 44)");
            }
            // Rule 38: the grant's scope (field 1), and the agreements it
            // names (field 2), limit what the key signs within its kinds.
            if let Some(w) = self.scope_problem(&g, y)? {
                return not(&w);
            }
            // F126: an act in the collective's name is done only once sealed
            // to every member.
            if let Some(w) = self.not_done(y, &ag)? {
                return not(&w);
            }
        } else {
            // A person's grant: its reach is the kinds it names (a MIR's
            // layer, or a type of a specification); naming none, every act
            // but a decision (reading).
            let within = match &g.kinds {
                Some(k) => k.iter().any(|k| match k {
                    Kind::Layer(l) => self.mirs.layer(spec) == Some(*l),
                    Kind::Type { spec: s2, type_ } => s2 == spec && *type_ == ty,
                }),
                None => true,
            };
            if !within {
                return not("the act lies beyond the grant's reach (rule 44)");
            }
            if let Some(w) = self.scope_problem(&g, y)? {
                return not(&w);
            }
        }
        // An adoption (rule 40; rule 76): an act of the collective's own key
        // that counts, acknowledging it, citing it on the collective's
        // chain, or paying on it.
        // F131 (IT2a): once such an act cites it, the act is adopted, and no
        // ending racing that citation voids it; the tie rule voids only
        // acts the collective never took on. "Cites" as a line does
        // (reading U3, confirmed, F132): the act lies in the citing act's
        // history, so citing the grantee's later act cites it too.
        // F142 (rule 42): an adopter is an action of the grantor's own key
        // that counts, done and on its chain; an Identity witness act, on
        // neither chain, adopts nothing.
        // An ending (a fork or a closing) is no action: it adopts nothing
        // (F142; IC3), whatever its line holds.
        let on_chain = |a: &Held| a.inside.spec != self.mirs.identity && !self.is_agreements(a, types::FORK) && !self.is_agreements(a, types::CLOSING);
        // The grantor's own acts: a person's, signed with its own key; a
        // collective's, acts for it.
        let grantors = |a: &Held| if collective { Self::for_col(&col, a) && self.col_grant(&col, a).is_none() } else { a.act.outside.signer == Some(c) && a.act.outside.binding != Some(gh.id) };
        let theirs: Vec<&Held> = if collective { self.col_acts(&col) } else { self.v.signed_by(&c).collect() };
        let citing: Vec<&Held> = if collective {
            theirs.iter().copied().filter(|a| a.id != y.id && grantors(a) && on_chain(a) && self.before_struct(&col, y, Line::Record(a))).collect()
        } else {
            vec![]
        };
        // Rule 76's third way: an act of the grantor paying on it, a Money
        // claim the grantor signs as payer whose `fulfils` names it.
        let paying: Vec<&Held> = theirs
            .iter()
            .copied()
            .filter(|a| {
                a.inside.spec == self.mirs.money
                    && matches!(crate::money::Payload::decode(a.inside.type_, &a.inside.payload), Ok(crate::money::Payload::Claim(x)) if &x.fulfils == act && x.anonymous.is_none())
            })
            .collect();
        let acked = |before: &dyn Fn(&Held) -> bool| -> R<bool> {
            for a in self.v.acknowledgements(act).into_iter().chain(citing.iter().copied()).chain(paying.iter().copied()) {
                if grantors(a) && on_chain(a) && self.valid(&a.id) && before(a) && self.consent(&a.id)?.counts() {
                    return Ok(true);
                }
            }
            Ok(false)
        };
        let mut ended = false;
        // A fork or closing ends every grant (N14): every grant key ends at
        // its line. An act in the history it cites binds, as a debt the
        // fork hands out; so does a deal the original acknowledged before
        // it. Any other is missing from the ending's history, and void.
        // An act the ending's history holds still answers to the other
        // decisions ending its grant (rule 43): a revocation, or a departure
        // emptying its area, that does not hold it voids it, unless the
        // collective adopted it. Found by the Agreements invariants
        // (`docs/law-invariants.md`, IC3).
        if let Some(e) = self.closed_by(&c)? {
            if acked(&|a| self.before_line(&col, a, &e.line))? {
                return Ok(Backing::Binds { grant: gh.id });
            }
            if !self.before_line(&col, y, &e.line) {
                return not("the fork or closing that ended the grant does not cite it: an action missing from the ending's history is void (the tie rule, F127)");
            }
            ended = true;
        }
        // G1 (F128): a revocation removes the grant key, a decision ending
        // powers. An act its history holds was done within the grant's
        // powers; any other, racing it or after it, is void, the ending
        // winning, unless the collective itself acknowledged it (A6).
        for r in self.revocations(&col, &gh.id)? {
            if self.before_struct(&col, y, Line::Record(r)) {
                ended = true;
                continue;
            }
            if acked(&|_| true)? {
                return Ok(Backing::Binds { grant: gh.id });
            }
            // Rule 76: another identity's acknowledgement, never the
            // grantee's (nor the grantor's, which is an adoption, above),
            // by an act of a type that may carry one, standing under its
            // signer's chain; or a keeper of an agreement the act belongs
            // to that recorded it before recording the revocation.
            let other = self.v.acknowledgements(act).any(|a| {
                a.act.outside.signer.is_some_and(|s| s != c && s != g.grantee) && self.status(&a.id) == Status::Valid
            });
            if other {
                return Ok(Backing::Disputed {
                    grant: gh.id,
                    reason: "the revocation's history does not hold it, but another identity acknowledged it: valid, shown as disputed, conferring nothing unless the grantor adopts it (rule 76)".into(),
                });
            }
            if self.keepers_recorded_before(act, &r.id) {
                return Ok(Backing::Disputed {
                    grant: gh.id,
                    reason: "the revocation's history does not hold it, but a keeper of an agreement it belongs to recorded it before recording the revocation: valid, shown as disputed, conferring nothing unless the grantor adopts it (rule 76)".into(),
                });
            }
            return not("the revocation ended the grant, and its history does not hold the act, and no other identity acknowledged it nor a keeper recorded it first: void, the ending winning (the tie rule, rule 76; F128 G1)");
        }
        // G2 (F128): a departure emptying the grant's area ends every grant
        // in it, a decision ending powers: the same, with no suspension and
        // no undetermined act. A reinstatement is a new grant, and takes
        // nothing on.
        if let Some(area) = g.area {
            for l in self.freezes(&col, area)? {
                let here = match l {
                    Line::Record(_) => self.before(&col, gh, l)?,
                    Line::Rotation(_) => self.before_struct(&col, gh, l),
                };
                if !here {
                    continue;
                }
                if self.before_struct(&col, y, l) {
                    ended = true;
                    continue;
                }
                if acked(&|_| true)? {
                    return Ok(Backing::Binds { grant: gh.id });
                }
                return not("the departure that emptied the grant's area ended it, and that line's history does not hold the act: the ending wins (the tie rule, F128 G2)");
            }
        }
        // Rule 18d (audit, October 2026, gap 10): the grant's limits
        // (field 3), as the cMIP of field 4 defines them, are not read by
        // this verifier, which implements no limits cMIP: whether the act
        // lies within them is unknown, so the answer is, rather than
        // "backed". An adoption by the collective's own key (above) binds
        // whatever the limits say (rule 40).
        if g.limits.is_some() || g.limits_cmip.is_some() {
            if acked(&|_| true)? {
                return Ok(Backing::Binds { grant: gh.id });
            }
            // Agreements draft 14 (F320): a verifier holding the limits
            // cMIP, and the time reference an expiry is judged against,
            // states whether the act lies within them; outside them (an
            // expiry past, among them), it is not backed, the grant quiet
            // and still revocable.
            match self.grant_limits.get(act) {
                Some(true) => return Ok(if ended { Backing::Binds { grant: gh.id } } else { Backing::Backed { grant: gh.id } }),
                Some(false) => return not("the act lies outside the limits the grant's limits cMIP sets (fields 3 and 4), an expiry past among them: not backed, the grant quiet and still revocable (rule 80; new in draft 14, F320)"),
                None => {}
            }
            return Ok(Backing::Unknown {
                grant: gh.id,
                reason: "the grant carries limits (fields 3 and 4, rule 18d) under a cMIP this verifier does not implement: whether the act lies within them cannot be read".into(),
            });
        }
        Ok(if ended { Backing::Binds { grant: gh.id } } else { Backing::Backed { grant: gh.id } })
    }

    /// What keeps an act from lying within its grant's scope (rule 38, grant
    /// field 1; audit, October 2026, gap 9), or nothing. Scope 0, signing
    /// new deals: the terms of a new agreement (no parent), or a signature
    /// act on such terms. Scope 1, managing named existing ones: an act that
    /// names one of the agreements of field 2, in any of its versions, or an
    /// act it names there (rule 40: an adopted act another grantee manages);
    /// "this agreement" (null) is judged by the deal carrying the grant
    /// (F129, [`Self::deal_grant_problem`]). Scope 2, acting for the grantor
    /// (posting, publishing, spending): any act within the grant's kinds but
    /// one on an agreement, which scopes 0 and 1 are for. A negotiation
    /// message is talk (F128, W6), binding nothing, and passes under every
    /// scope. *Readings, stated: which acts "sign a new deal", and that
    /// scope 2 covers no act on an agreement.*
    fn scope_problem(&self, g: &Grant, y: &Held) -> R<Option<String>> {
        if self.is_agreements(y, types::NEGOTIATION) {
            return Ok(None);
        }
        let new_terms = |x: &Held| self.is_agreements(x, types::TERMS) && Terms::decode(&x.inside.payload).is_ok_and(|t| t.parent.is_none());
        match g.scope {
            0 => {
                let new = new_terms(y)
                    || (self.is_agreements(y, types::SIGNATURE)
                        && decode_signature(&y.inside).ok().and_then(|s| self.v.get(&s)).is_some_and(new_terms));
                Ok((!new).then(|| {
                    "the grant's scope is signing new deals (field 1, scope 0): the act is neither the terms of a new agreement nor a signature act on them (rule 38)".into()
                }))
            }
            1 => {
                let Some(named) = &g.agreements else {
                    return Ok(Some("the grant's scope is managing named agreements (field 1, scope 1), and it names none (field 2; rule 38)".into()));
                };
                Ok((!self.concerns(y, named)?).then(|| {
                    "the grant's scope is managing the agreements it names (field 1, scope 1; field 2): the act names none of them, in any version (rule 38)".into()
                }))
            }
            2 => {
                let on_agreement = [
                    types::TERMS,
                    types::SIGNATURE,
                    types::RESIGNATION,
                    types::DECLARATION,
                    types::RELEASE,
                    types::FORK,
                    types::CLOSING,
                    types::SPLIT,
                ]
                .iter()
                .any(|t| self.is_agreements(y, *t));
                Ok(on_agreement.then(|| {
                    "the grant's scope is acting for its grantor (field 1, scope 2: posting, publishing, spending): signing a new deal or managing an agreement needs scope 0 or 1 (rule 38)".into()
                }))
            }
            _ => Ok(Some("a grant's scope is 0, 1 or 2 (rule 38)".into())),
        }
    }

    /// Whether an act names one of `named` (grant field 2, scope 1), in any
    /// version where a named act is an agreement: in its `objects`, or in a
    /// field the core decodes (a Money obligation's agreement, a receipt's
    /// or claim's `fulfils` and purchase; a clone's parent, a signature act's
    /// act and what that act names, a split's agreement, a release's
    /// stakes).
    fn concerns(&self, y: &Held, named: &[Hash]) -> R<bool> {
        use crate::money::Payload as Fin;
        let mut set: BTreeSet<Hash> = named.iter().copied().collect();
        for x in self.v.held_acts() {
            if self.is_agreements(x, types::TERMS) {
                if let Ok(l) = self.lineage(&x.id) {
                    if l.iter().any(|(i, _)| named.contains(i)) {
                        set.insert(x.id);
                    }
                }
            }
        }
        let names = |x: &Held| x.inside.objects.iter().flatten().any(|o| set.contains(&o.chain) || set.contains(&o.predecessor));
        if names(y) {
            return Ok(true);
        }
        if y.inside.spec == self.mirs.money {
            return Ok(match Fin::decode(y.inside.type_, &y.inside.payload) {
                Ok(Fin::Obligation(o)) => o.agreement.is_some_and(|a| set.contains(&a)),
                Ok(Fin::Receipt(r)) => set.contains(&r.fulfils) || r.purchase.is_some_and(|p| set.contains(&p.agreement)),
                Ok(Fin::Claim(c)) => set.contains(&c.fulfils) || c.purchase.is_some_and(|p| set.contains(&p.agreement)),
                _ => false,
            });
        }
        if self.is_agreements(y, types::TERMS) {
            return Ok(Terms::decode(&y.inside.payload).is_ok_and(|t| t.parent.is_some_and(|p| set.contains(&p))));
        }
        if self.is_agreements(y, types::SIGNATURE) {
            return Ok(decode_signature(&y.inside)
                .ok()
                .is_some_and(|s| set.contains(&s) || self.v.get(&s).is_some_and(names)));
        }
        if self.is_agreements(y, types::SPLIT) {
            return Ok(Split::decode(&y.inside.payload).is_ok_and(|s| self.split_owners(&s).is_some_and(|o| set.contains(&o))));
        }
        if self.is_agreements(y, types::RELEASE) {
            return Ok(Release::decode(&y.inside).is_ok_and(|r| r.stakes.iter().any(|(a, _)| set.contains(a))));
        }
        Ok(false)
    }

    /// The collective's state after everything held under its latest key.
    pub fn current(&self, collective: &Hash) -> R<Option<Current>> {
        let col = self.col(collective);
        if col.res.links.is_empty() {
            return Ok(None);
        }
        let b = col.res.links.len() - 1;
        if !self.declares(&col, b) {
            return Ok(None);
        }
        let base = match self.base(&col, b)? {
            Ok(x) => x,
            Err(_) => return Ok(None),
        };
        let mut puts = vec![];
        let mut records = vec![];
        for r in self.records_since(&col, b) {
            let e = self.record_eval(&col, r)?;
            if let Some(k) = e.puts {
                puts.push((k, e.resolves));
            }
            records.push((*e).clone());
        }
        let f = self.fold(base, &puts)?;
        let t = self.terms(&f.agreement)?;
        let lineage: Vec<Hash> = self.lineage(&f.agreement)?.into_iter().map(|(i, _)| i).collect();
        let mut departed = vec![];
        let mut stepped_down = vec![];
        let mut all = vec![];
        for k in 0..col.res.links.len() {
            for r in self.records_at(&col, k) {
                let e = self.record_eval(&col, r)?;
                if e.line {
                    all.extend(e.registers.iter().cloned());
                }
            }
        }
        // A rollback registers departures too (rule 37d, F185).
        for (_, _, ds) in self.rollback_lines(&col, b)? {
            all.extend(ds);
        }
        // The parties whose voice is gone, as rule 44d counts them: a party
        // named again by a version they signed counts again (B10), and a
        // spent resignation takes nothing (F189, 1).
        let (_, remaining) = self.voices(&col, Point::Tip, &f.agreement, &t.parties, None, &BTreeMap::new(), &[])?;
        for d in all {
            match d.kind {
                DepartureKind::Resigned { agreement } | DepartureKind::Declared { agreement }
                    if lineage.contains(&agreement) =>
                {
                    if t.parties.contains(&d.party) && !remaining.contains(&d.party) && !departed.contains(&d.party) {
                        departed.push(d.party);
                    }
                }
                DepartureKind::SteppedDown { agreement, area }
                    if lineage.contains(&agreement)
                        && t.area(area).is_some_and(|a| a.holders.contains(&d.party)) =>
                {
                    stepped_down.push((area, d.party));
                }
                _ => {}
            }
        }
        let frozen = t
            .areas()
            .iter()
            .filter(|a| {
                a.holders.iter().all(|h| {
                    departed.contains(h) || stepped_down.contains(&(a.id, *h))
                })
            })
            .map(|a| a.id)
            .collect();
        Ok(Some(Current {
            agreement: f.agreement,
            departed,
            stepped_down,
            frozen,
            records,
            fork: f.fork,
            closed: self.closed_by(collective)?.map(|e| e.by),
        }))
    }

    /// Why Agreements read a collective as broken: why the agreement its latest
    /// key lives under cannot be found from its chain and its records (a
    /// founding that does not exist, a rotation declaring a clone it does
    /// not complete, a false mark, rules 37 and 45a). `None` when Agreements read
    /// it as working, or when it is not a collective.
    pub fn broken(&self, collective: &Hash) -> R<Option<String>> {
        let col = self.col(collective);
        if col.res.links.is_empty() {
            return Ok(None);
        }
        let b = col.res.links.len() - 1;
        if !self.declares(&col, b) {
            return Ok(None);
        }
        Ok(self.base(&col, b)?.err())
    }

    /// Who counts for a power of the collective's agreement in force at its
    /// next line, not made yet, after every act held under its latest key
    /// (rule 44d): the agreement, the parties the power is counted among in
    /// it, the voices that remain among them, `leaving` taken out (parties
    /// whose resignations a record will register before that line, rule
    /// 37a), and how many of those voices meet it; `None` where no voice
    /// remains (an area frozen, rule 37b). What a client names in a clone's
    /// mark (rules 44c, 45a), computed before anything is signed. Err: why
    /// there is no such count: the collective broken, ended, or its record
    /// forked, or the power none of that agreement's.
    /// Agreements draft 14, rule 84 (F305): the nominee for `party`'s seat
    /// in `collective`, where the agreement in force names no succession
    /// plan for it: the successor of a succession the party declared under
    /// Identity and the successor confirmed (Identity, F300). A nomination
    /// only, approved under the constitutional change rule (rule 64), the
    /// successor signing the clone that seats it; never an automatic seat,
    /// and the stake stays with the party's identity. A declared succession
    /// the successor never confirmed nominates nobody; one whose
    /// confirmation's standing this verifier cannot tell is unknown (F298).
    pub fn nominee(&self, collective: &Hash, party: &Hash) -> R<Option<Hash>> {
        let Some(cur) = self.current(collective)? else {
            return Ok(None);
        };
        let t = self.terms(&cur.agreement)?;
        if !t.parties.contains(party) || t.succession.iter().flatten().any(|s| s.party == *party) {
            return Ok(None);
        }
        Ok(match self.v.succession(party) {
            crate::chain::SuccessionSeen::Confirmed { successor, .. } => Some(successor),
            crate::chain::SuccessionSeen::Unknown { rotation, .. } => return Err(AgreementsError::Missing(rotation)),
            _ => None,
        })
    }

    pub fn next_voices(&self, collective: &Hash, power: &Power, leaving: &[Hash]) -> R<Result<NextVoices, String>> {
        let col = self.col(collective);
        if col.res.links.is_empty() {
            return Ok(Err("not an identity this verifier holds".into()));
        }
        let b = col.res.links.len() - 1;
        if !self.declares(&col, b) {
            return Ok(Err("not a collective: its chain declares no agreement".into()));
        }
        let base = match self.base(&col, b)? {
            Ok(x) => x,
            Err(w) => return Ok(Err(w)),
        };
        if self.closed_by(collective)?.is_some() {
            return Ok(Err("ended by its fork or closing (rule 47a)".into()));
        }
        let mut puts = vec![];
        for r in self.records_since(&col, b) {
            let e = self.record_eval(&col, r)?;
            if let Some(k) = e.puts {
                puts.push((k, e.resolves));
            }
        }
        let f = self.fold(base, &puts)?;
        if f.fork {
            return Ok(Err("its record forks: two clones of one agreement on lines neither before the other (rule 47, A4)".into()));
        }
        let parent = self.terms(&f.agreement)?;
        let Some((among, rule)) = power_base(&parent, power) else {
            return Ok(Err("a succession plan is counted as rule 48c says, not here".into()));
        };
        if matches!(power, Power::Area(a) if parent.area(*a).is_none()) {
            return Ok(Err("the agreement in force has no such area".into()));
        }
        let area = match power {
            Power::Area(a) => Some(*a),
            _ => None,
        };
        let (voices, _) = self.voices(&col, Point::Tip, &f.agreement, &among, area, &BTreeMap::new(), &[])?;
        let voices: Vec<Hash> = voices.into_iter().filter(|v| !leaving.contains(v)).collect();
        let needed = rule.needed(voices.len());
        Ok(Ok(NextVoices {
            agreement: f.agreement,
            among,
            voices,
            needed,
        }))
    }
}

/// Who counts for a power at a collective's next line ([`AgreementsView::next_voices`]).
#[derive(Clone, Debug)]
pub struct NextVoices {
    /// The agreement in force, the clone's parent.
    pub agreement: Hash,
    /// The parties the power is counted among in it (rule 44d).
    pub among: Vec<Hash>,
    /// Those whose voice remains there.
    pub voices: Vec<Hash>,
    /// How many of them meet it; `None` where no voice remains.
    pub needed: Option<usize>,
}

/// A point at which voices are counted: an act of the collective, or a
/// line judging the clone it names.
#[derive(Clone, Copy)]
enum Point<'h> {
    Act(&'h Held),
    Line(Line<'h>),
    /// The collective's next line, not made yet: after every act held
    /// under its latest key, every record held counting before it.
    Tip,
}

/// Whether `signers`, holders of a stake at the line (`roster`), hold
/// together at least `need` millionths of the whole stake (rules 65, 94;
/// F307, F308, F311): a holder's share counts once, whoever signs.
fn holders_met(roster: &[(Hash, u64)], signers: &[Hash], need: u64) -> Result<(), String> {
    if signers.iter().any(|x| !roster.iter().any(|(h, _)| h == x)) {
        return Err("the mark names a signer who holds none of that stake at the line (rule 46, F307)".into());
    }
    let got: u64 = roster.iter().filter(|(h, _)| signers.contains(h)).map(|(_, n)| *n).sum();
    if got < need {
        return Err("the mark names too few holders to meet the rule, counted by share (rule 46, F308)".into());
    }
    Ok(())
}

/// The parties holding the chain key or a share of it under a key
/// grammar: its holder, its members, its custodian, and the recovery
/// path's custodian.
fn key_holders(t: &Terms) -> Vec<Hash> {
    let Some(g) = &t.grammar else { return vec![] };
    let mut out: Vec<Hash> = match &g.chain_key {
        Holding::One(h) => vec![*h],
        Holding::Shares { members, .. } => members.clone(),
        Holding::Custodian { custodian, .. } => vec![*custodian],
    };
    if let Some(Recovery::Custodian { custodian, .. }) = &g.recovery {
        out.push(*custodian);
    }
    out
}

/// Whether a clone needs a rotation of the chain key to come into force
/// (rule 69): it changes the key grammar (field 12), or takes out of the
/// parties one who holds the chain key or a share of it. Every other
/// clone a record puts in force.
fn needs_rotation(parent: &Terms, clone: &Terms) -> bool {
    parent.grammar != clone.grammar || key_holders(parent).iter().any(|h| parent.parties.contains(h) && !clone.parties.contains(h))
}

/// The parties a power is counted among in the parent, and its rule.
fn power_base(parent: &Terms, p: &Power) -> Option<(Vec<Hash>, Rule)> {
    match p {
        Power::Constitutional => {
            let r = parent.constitutional_rule();
            Some((r.counted_among(&parent.parties), r))
        }
        Power::Clone => Some((parent.clone.counted_among(&parent.parties), parent.clone.clone())),
        Power::Area(id) => parent.area(*id).map(|a| (a.holders.clone(), a.rule())),
        Power::Layer(l) => parent.lane(*l).map(|a| (a.holders.clone(), a.rule())),
        // Counted among a stake's holders by share, not among parties
        // (rule 65; F307): see `holders_power_met`.
        Power::Plan(_) | Power::Holders(_) => None,
        Power::Judicial => Some((parent.parties.clone(), Rule::All)),
    }
}

fn union(a: &[Hash], b: &[Hash]) -> Vec<Hash> {
    let mut out = a.to_vec();
    for x in b {
        if !out.contains(x) {
            out.push(*x);
        }
    }
    out
}

/// The key grammar a succession clone carries (Flaw B14): the parent's,
/// with the seat successors in the party's place in every holding, every
/// threshold unchanged.
/// The layers' rules a plan's clone carries (rules 64, 83): the seat
/// successors in the party's place in every rule naming it, once for each
/// seat, as in field 0; every other rule as it was.
fn plan_layers(parent: &Terms, party: &Hash, seats: &[Hash]) -> Option<Vec<(u64, Rule)>> {
    parent.layers.as_ref().map(|ls| {
        ls.iter()
            .map(|(l, r)| match r {
                Rule::Named(n) if n.contains(party) => (*l, Rule::Named(n.iter().flat_map(|m| if m == party { seats.to_vec() } else { vec![*m] }).collect())),
                other => (*l, other.clone()),
            })
            .collect()
    })
}

/// Whether a plan's clone passes the party's stakes to `heirs`, in their
/// parts (millionths), as rule 83 gives: every share the party held, of
/// every stake, gone; each heir's gain its exact part, or less than one
/// millionth from it (the build's rounding, as for a stake moved by
/// abandonment), the total exact; every other holder as it was. With no
/// heirs named, the stakes are unchanged.
fn plan_stakes(parent: &Terms, clone: &Terms, party: &Hash, heirs: &[(Hash, u64)]) -> bool {
    if heirs.is_empty() {
        return parent.stakes == clone.stakes;
    }
    if clone.release_rule != parent.release_rule {
        return false;
    }
    let me = Who::Id(*party);
    let (a, b) = (parent.stakes.clone().unwrap_or_default(), clone.stakes.clone().unwrap_or_default());
    if a.len() != b.len() {
        return false;
    }
    let total: u128 = heirs.iter().map(|(_, x)| *x as u128).sum();
    for (st, after) in a.iter().zip(b.iter()) {
        if st.object != after.object || after.share_of(&me) != 0 {
            return false;
        }
        let n = st.share_of(&me) as u128;
        let sum = |x: &Stake| x.holders.iter().map(|(_, k)| *k as u128).sum::<u128>();
        if sum(st) != sum(after) {
            return false;
        }
        let mut who: Vec<Who> = vec![];
        for (w, _) in st.holders.iter().chain(after.holders.iter()) {
            if *w != me && !who.contains(w) {
                who.push(*w);
            }
        }
        for w in who {
            let gain = after.share_of(&w) as i128 - st.share_of(&w) as i128;
            let exact = n * heirs.iter().filter(|(h, _)| Who::Id(*h) == w).map(|(_, x)| *x as u128).sum::<u128>();
            let lo = if total == 0 { 0 } else { (exact / total) as i128 };
            let hi = lo + i128::from(total != 0 && exact % total != 0);
            if gain < lo || gain > hi {
                return false;
            }
        }
    }
    true
}

fn plan_grammar(parent: &Terms, party: &Hash, seats: &[Hash]) -> Option<KeyGrammar> {
    let swap = |h: &Holding| match h {
        Holding::One(x) if x == party => Holding::One(seats[0]),
        Holding::Shares { threshold, members } => Holding::Shares {
            threshold: *threshold,
            members: members
                .iter()
                .flat_map(|m| if m == party { seats.to_vec() } else { vec![*m] })
                .collect(),
        },
        other => other.clone(),
    };
    parent.grammar.as_ref().map(|g| KeyGrammar {
        chain_key: swap(&g.chain_key),
        recovery: g.recovery.clone(),
    })
}

/// What Flaw B14's answer leaves open for a plan, unknown rather than
/// guessed (a seat's voting weight is out of format since draft 14, F328,
/// Q15): a seat successor who is already a party; several successors to a holding
/// of one; a party who is a custodian or holds the recovery path.
fn plan_open(parent: &Terms, plan: &SuccessionPlan) -> Option<&'static str> {
    let seats = plan.seats.as_deref().unwrap_or_default();
    if seats.iter().any(|h| parent.parties.contains(h)) {
        return Some("a seat successor who is already a party: what taking the party's place in the keys then means is not written (Flaw B14)");
    }
    let p = &plan.party;
    if let Some(g) = &parent.grammar {
        for h in [&g.chain_key] {
            match h {
                Holding::One(x) if x == p && seats.len() != 1 => {
                    return Some("several seat successors to a key held by one: who takes that place is not written (Flaw B14)");
                }
                Holding::Custodian { custodian, .. } if custodian == p => {
                    return Some("a party who holds a key as custodian, under a grant: taking that place is not written (Flaw B14)");
                }
                _ => {}
            }
        }
        match &g.recovery {
            Some(Recovery::Custodian { custodian, .. }) if custodian == p => {
                return Some("a party who holds the recovery path: taking that place is not written (Flaw B14)");
            }
            Some(Recovery::Escrow { authority }) if authority == p => {
                return Some("a party who releases the escrowed share: taking that place is not written (Flaw B14)");
            }
            _ => {}
        }
    }
    None
}

// ---------------------------------------------------------------- negotiation (F118) and role-share evidence (F119)

/// A negotiation thread as a verifier holds it (rule 56, F118).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NegotiationRecord {
    /// The thread's first message.
    pub thread: Hash,
    /// The signer of the first message, then the other side once one of
    /// its messages is held.
    pub sides: Vec<Hash>,
    /// The messages of the record: valid negotiation messages whose chain of
    /// previous messages reaches the first one through messages of the
    /// thread, signed by its two sides only.
    pub messages: Vec<Hash>,
    /// The latest message that a message of the other side acknowledges:
    /// the record is proven complete up to it, every message before it
    /// fixed by the previous messages each names.
    pub complete_up_to: Option<Hash>,
    /// Two messages of the record naming the same previous message.
    pub forked: bool,
}

/// Which role a role share pays (Agreements rule 22).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Role {
    /// A rail Module the payment ran through, by its hash (F119).
    RailModule(Hash),
    /// Any other role: a referral, a delivery, a service's use (F116):
    /// its evidence counts only acknowledged by the payer the payment
    /// commits to (F184, QG3, F193, F194).
    Other,
}

impl<'a> AgreementsView<'a> {
    /// A held negotiation message of this verifier's Agreements MIR, valid under
    /// Identity, with its decoded payload.
    fn negotiation_message(&self, id: &Hash) -> Option<(&'a Held, NegotiationMessage)> {
        let h = self.v.get(id)?;
        if !self.is_agreements(h, types::NEGOTIATION) || !self.valid(id) {
            return None;
        }
        NegotiationMessage::decode(&h.inside).ok().map(|m| (h, m))
    }

    /// The chain from the thread's first message to `id`, first message
    /// first, if every step is a valid negotiation message of the thread.
    fn negotiation_chain(&self, thread: &Hash, id: &Hash) -> Option<Vec<(Hash, Hash)>> {
        let mut out = vec![];
        let mut at = *id;
        let bound = self.v.held_acts().count();
        loop {
            let (h, m) = self.negotiation_message(&at)?;
            let signer = h.act.outside.signer?;
            out.push((at, signer));
            match m.follows {
                None if &at == thread => break,
                Some((t, prev)) if &t == thread && prev != at => at = prev,
                _ => return None,
            }
            if out.len() > bound {
                return None;
            }
        }
        out.reverse();
        Some(out)
    }

    /// The negotiation record of a thread, by its first message (rule 56,
    /// F118). Only negotiation messages count: a text act naming the thread,
    /// or a message following one, is no part of it.
    pub fn negotiation(&self, thread: &Hash) -> R<NegotiationRecord> {
        let (first, m) = self
            .negotiation_message(thread)
            .ok_or(AgreementsError::Check("the thread's first message is not a valid negotiation message"))?;
        if m.follows.is_some() {
            return Err(AgreementsError::Check("a thread's first message names no chain"));
        }
        let a = first.act.outside.signer.ok_or(AgreementsError::Check("the act has no signer"))?;
        let mut chains: Vec<Vec<(Hash, Hash)>> = vec![];
        for h in self.v.held_acts() {
            if !self.is_agreements(h, types::NEGOTIATION) {
                continue;
            }
            if let Some(c) = self.negotiation_chain(thread, &h.id) {
                chains.push(c);
            }
        }
        // The other side: the first signer other than the first message's
        // along any chain, the nearest the first message.
        let b = chains
            .iter()
            .filter_map(|c| c.iter().position(|(_, s)| s != &a).map(|i| (i, c[i])))
            .min_by_key(|(i, (id, _))| (*i, *id))
            .map(|(_, (_, s))| s);
        let side_ok = |c: &Vec<(Hash, Hash)>| c.iter().all(|(_, s)| s == &a || Some(*s) == b);
        let mut messages: Vec<Hash> = vec![];
        let mut previous: BTreeMap<Hash, Hash> = BTreeMap::new();
        let mut forked = false;
        let mut best: Option<(usize, Hash)> = None;
        for c in chains.iter().filter(|c| side_ok(c)) {
            let (last, signer) = *c.last().expect("a chain holds its own message");
            if !messages.contains(&last) {
                messages.push(last);
                if c.len() > 1 {
                    let prev = c[c.len() - 2].0;
                    if previous.values().any(|p| p == &prev) {
                        forked = true;
                    }
                    previous.insert(last, prev);
                }
            }
            // What this message acknowledges: a message of the other side on
            // its own chain proves the record complete up to it.
            let (_, msg) = self.negotiation_message(&last).expect("held in the chain");
            if let Some(n) = msg.acks {
                if let Some(i) = c.iter().position(|(x, s)| x == &n && s != &signer) {
                    if best.is_none_or(|(d, _)| i > d) {
                        best = Some((i, n));
                    }
                }
            }
        }
        messages.sort();
        let mut sides = vec![a];
        sides.extend(b);
        Ok(NegotiationRecord {
            thread: *thread,
            sides,
            messages,
            complete_up_to: best.map(|(_, n)| n),
            forked,
        })
    }

    /// Whether the payee ever accepted a rail Module: a valid payee pointer
    /// it signed names it (for a collective, one that counts with its
    /// Money lane), or a vault its identity chain declared does (Money
    /// rule 12a, F115). *As for a collective's own receipts, which exact
    /// rail or entry a payment went to is in the rail's proof, which the
    /// payment cMIP reads.*
    pub fn accepts_rail(&self, payee: &Hash, rail: &Hash) -> R<bool> {
        use crate::money::{self as fin, Payload as Fin};
        let money = self.mirs.money;
        let res = self.v.resolve(payee);
        for (l, state) in res.links.iter().zip(&res.states) {
            if self.refuses(&l.act) {
                break;
            }
            if let Ok(Some(Some(entries))) = fin::vault_in(&money, &state.declarations) {
                if entries.iter().any(|e| &e.rail_module == rail) {
                    return Ok(true);
                }
            }
        }
        for h in self.payees_acts(payee) {
            if h.inside.spec != money || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(p)) = Fin::decode(h.inside.type_, &h.inside.payload) else {
                continue;
            };
            if &p.payee == payee
                && p.rails.iter().any(|r| &r.module == rail)
                && self.valid(&h.id)
                && self.consent(&h.id)?.counts()
            {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Whether `id` is a relay's delivery record whose object this verifier
    /// can read: type 0 of a specification the caller read as the relay
    /// transport cMIP (F184).
    fn is_delivery_record(&self, id: &Hash) -> bool {
        self.v.get(id).is_some_and(|x| x.inside.type_ == 0 && self.delivery_records.contains(&x.inside.spec))
    }

    /// Whether an act offered as evidence for a role share counts for the
    /// payment `payment` (a receipt or payer's claim) a split divides: **the
    /// payer the payment's own commitment names acknowledges it** (Agreements rules
    /// 19 and 22; F184; QG3, decided 9 October 2026: whatever cMIP defines
    /// it; F193, decided 10 October 2026; F194, decided 10 October 2026: a
    /// service's use record too). That payer's claim is a payer's claim of
    /// the same rail payment (`payment` itself where it is one) whose rail
    /// proof the caller checked and found to carry the commitment
    /// recomputed from it, its signer, or the anonymous key it carries, as
    /// payer ([`Self::rail_valid`]), on a rail whose commitment binds the
    /// payer ([`Self::rail_binds`]), acknowledging it (Envelopes rule
    /// 4a), or naming it as its referral's evidence (Money, the claim's
    /// field 6: "the payer's client for a referral", rule 22); never the
    /// payer a receipt names,
    /// which the split service writes. Where the commitment names nobody,
    /// no claim carries it, and nothing can be acknowledged: the share is
    /// one nobody fills (the stated cost of F193). For a relay's delivery
    /// record of a specification the caller read as the relay transport
    /// cMIP, the object it names (its locked hash, field 0) must also be
    /// the media of the publication the payment fulfils (Envelopes,
    /// publication field 2; F184); a verifier that cannot read the record's
    /// format does not check the object ("Open in this draft", QH3).
    /// *Paying for usage invites faking usage: the confirming signature
    /// comes from the other side of the deal, as for a referral (F75).*
    fn payer_acknowledged(&self, evidence: &Hash, payment: &Hash) -> bool {
        use crate::money::Payload as Fin;
        let Some(p) = self.v.get(payment) else { return false };
        if p.inside.spec != self.mirs.money {
            return false;
        }
        let fulfils = match Fin::decode(p.inside.type_, &p.inside.payload) {
            Ok(Fin::Receipt(x)) => x.fulfils,
            Ok(Fin::Claim(x)) => x.fulfils,
            _ => return false,
        };
        if self.is_delivery_record(evidence) {
            let Some(r) = self.v.get(evidence) else { return false };
            let object: Option<Hash> = r.inside.payload.iter().find_map(|(k, v)| match (k, v) {
                (crate::cbor::Value::Uint(0), crate::cbor::Value::Bytes(b)) => b.as_slice().try_into().ok(),
                _ => None,
            });
            // The object paid for: the media of the publication the payment
            // fulfils; for a payment following an offer, of a publication
            // the offer sells (step 12b; Fable's 4b).
            let mut paid_for: Vec<Hash> = self.bake_field(&fulfils, 2).into_iter().collect();
            paid_for.extend(self.pub_media(&fulfils));
            if let Some((_, t)) = self.tag_of(&fulfils) {
                match t.priced {
                    crate::money::Priced::Bake(b) => paid_for.extend(self.bake_field(&b, 2)),
                    crate::money::Priced::Publication(p) => paid_for.extend(self.pub_media(&p)),
                }
            }
            if !object.is_some_and(|o| paid_for.contains(&o)) {
                return false;
            }
        }
        let mut claims: Vec<&Held> = vec![p];
        claims.extend(self.same_payment(payment).into_iter().filter_map(|(x, _)| self.v.get(&x)));
        let acknowledging = |c: &Held| -> Option<(Hash, Payment)> {
            let Ok(Fin::Claim(cl)) = Fin::decode(c.inside.type_, &c.inside.payload) else { return None };
            (c.inside.spec == self.mirs.money
                && self.payers_claim(c)
                && self.rail_valid.contains_key(&c.id)
                && !self.rail_invalid.contains(&c.id)
                && self.rail_binds(&cl.rail, crate::development::Bound::Purpose)
                && (c.inside.acks.iter().flatten().any(|a| a == evidence) || cl.referral.as_ref().is_some_and(|r| &r.evidence == evidence)))
            .then(|| (cl.rail, self.record_payment(&c.id, &cl.proof)))
        };
        claims.into_iter().any(|c| {
            let Some(this) = acknowledging(c) else { return false };
            // F210 (review 2.10): one record acknowledged by the same
            // payer's claims for several payments is spent after the first,
            // by position on the payer's sequence; two at one position (two
            // devices) leave it spent for both (mechanic, the build's).
            let pos = c.inside.position.unwrap_or(0);
            let spent = c.act.outside.signer.is_some_and(|payer| {
                self.v.signed_by(&payer).any(|o| {
                    o.id != c.id && acknowledging(o).is_some_and(|other| !self.same_on_rail(&other, &this)) && o.inside.position.unwrap_or(0) <= pos
                })
            });
            !spent
        })
    }

    /// Whether an act is evidence for a role share in a split by
    /// `service` for `payee`, the identity the payment was made to (rules
    /// 19 and 22). For any role but a rail Module's, the evidence is a
    /// valid act signed by someone other than the service and the payee
    /// (F75, F116). For a rail Module's role share (F119), it is a valid
    /// receipt or claim naming that rail Module in its field 0, whoever
    /// signed it, the split service included, provided the payee's own
    /// pointer or vault names that Module (F115).
    pub fn role_evidence(&self, evidence: &Hash, role: &Role, service: &Hash, payee: &Hash) -> R<bool> {
        use crate::money::Payload as Fin;
        let x = self.held(evidence)?;
        if !self.valid(evidence) {
            return Ok(false);
        }
        match role {
            Role::Other => {
                let s = x.act.outside.signer;
                Ok(s.is_some() && s.as_ref() != Some(service) && s.as_ref() != Some(payee))
            }
            Role::RailModule(module) => {
                if x.inside.spec != self.mirs.money {
                    return Ok(false);
                }
                let rail = match Fin::decode(x.inside.type_, &x.inside.payload) {
                    Ok(Fin::Receipt(r)) => r.rail,
                    Ok(Fin::Claim(c)) => c.rail,
                    _ => return Ok(false),
                };
                Ok(&rail == module && self.accepts_rail(payee, module)?)
            }
        }
    }
}

// ---------------------------------------------------------------- endings, money and the pointer (F121 to F123)

/// A fork act, judged (rule 47a, F121 shape B, F124).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ForkEval {
    pub id: Hash,
    pub fork: Fork,
    /// Complete: the members on its sides signed it, meeting the
    /// constitutional change rule (N1), each successor fits its side, and
    /// each successor a debt is assigned to signed it (N13), and it hands
    /// out every obligation in the history it cites (F127): the original is
    /// closed in Agreements.
    pub complete: bool,
    /// Why it is not complete, or not valid.
    pub why: Option<String>,
    /// The members whose voice remains at the fork.
    pub voices: Vec<Hash>,
    /// Those of them who signed it (its signer, or a signature act).
    pub signed: Vec<Hash>,
    /// Members whose voice remains who are on no side (N1): no seat in any
    /// successor, a departed holder of each at their percentage.
    pub leaving: Vec<Hash>,
    /// The default share of each side in every stake the original held, in
    /// millionths: by the stakes of its members in the original itself (Q8).
    pub shares: Vec<u64>,
    /// The original carries no stake in itself: the default fell to each
    /// member counting alike (N3).
    pub by_count: bool,
    /// Who every successor keeps as a departed holder, at their share of all
    /// its income: the original's departed holders and the members leaving.
    pub kept: Vec<(Hash, u64)>,
    /// For each side, its successor's founding agreement, where it fits.
    pub successors: Vec<Option<Hash>>,
    /// Obligations in the history the fork cites that it does not hand
    /// out: while any remains, the fork does not take effect (F127,
    /// replacing F125 D1's joint liability).
    pub unassigned: Vec<Hash>,
    /// Whether it is the ending that counts (F143): complete, and not made
    /// to count for nothing by an earlier final ending (F131, IT1). `None`
    /// while the ending is judged within that choice.
    pub counts: Option<bool>,
}

/// A closing act, judged (rule 47a, F124 N9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ClosingEval {
    pub id: Hash,
    pub closing: Closing,
    pub complete: bool,
    pub why: Option<String>,
    pub voices: Vec<Hash>,
    pub signed: Vec<Hash>,
    /// Stakes the collective still holds, by agreement and index.
    pub holds: Vec<(Hash, u64)>,
    /// What it owes (F125, D5): its own obligations that bind, before its
    /// line, and those it owes as a fork's successor, that receipts held do
    /// not fulfil in full and no creditor's release ends.
    pub open_debts: Vec<Hash>,
    /// Whether it is the ending that counts (F143): complete, and not made
    /// to count for nothing by an earlier final ending (F131, IT1). `None`
    /// while the ending is judged within that choice.
    pub counts: Option<bool>,
}

/// A creditor's release, judged (Money type 4, F126; rule 47b).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DebtReleaseEval {
    pub id: Hash,
    pub release: crate::money::Release,
    /// It ends the obligation: signed by the creditor the obligation names,
    /// a collective creditor's consent counting by its own rules, a Money
    /// act reached by its Money lane (F126, E2).
    pub counts: bool,
    pub why: Option<String>,
}

/// The act that ended a collective in Agreements, and the line it drew (N2, N9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Closed {
    pub by: Hash,
    /// The ending's line: what it cites on the collective's chain.
    pub line: Vec<Hash>,
    /// Where a fork ended it: the fork, judged.
    pub fork: Option<ForkEval>,
}

/// The ending signatures of one collective's forks and closings (F132): a
/// member signs an ending by a chain signature (Identity type 16), on its
/// identity chain with its chain key, so any two of one signer's ending
/// signatures are ordered by their positions there.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct EndingSigs {
    /// The signatures that count, by (ending, signer): the chain signature
    /// and its position in the signer's identity chain. Only one counting
    /// in the signer's chain is read, the earliest for each ending.
    pub counting: BTreeMap<(Hash, Hash), (Hash, u64)>,
    /// Signatures that count for nothing (U4): each lies, in its signer's
    /// chain, after the signer's signature on another ending naming the one
    /// it signs. By (ending, signer): the chain signature, and that other
    /// ending.
    pub void: BTreeMap<(Hash, Hash), (Hash, Hash)>,
    /// The endings each ending names directly: in its own `objects`, or
    /// through a signer's chain (U1): a signer's counting signature on it
    /// placed after the same signer's counting signature on the other.
    pub names: BTreeMap<Hash, BTreeSet<Hash>>,
    /// Fork and closing acts that are no ending (U4b): their drafter (the
    /// act's signer) signed, earlier in their own identity chain than their
    /// signature on it, another ending of the collective that it does not
    /// name in its `objects` (directly or through the endings it names
    /// there). Each with that other ending. Their signatures are left out
    /// of everything above.
    pub no_ending: BTreeMap<Hash, Hash>,
}

/// Where a pointer leads, for Agreements (rule 18, F123, F124 P2).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PointerCheck {
    /// The agreement names no split service.
    NoSplitService,
    /// Every address in the owners' pointer, and every entry of their vault
    /// in force, is in one service's own pointer and vault in force: the
    /// pointer counts for Agreements.
    Ordinary { pointer: Hash, service: Hash },
    /// Some address or vault entry is in no service's own: shown as
    /// bypassing the split service, never as an ordinary pointer.
    Bypasses {
        pointer: Hash,
        missing: Vec<crate::money::Rail>,
        vault_missing: Vec<crate::money::VaultEntry>,
    },
    /// What the check needs is not held, or a pointer chain is contested.
    Undetermined { reason: String },
}

/// A payout that does not match its stake (F124 N10, rule 26): paid more or
/// less than the holder's share of what the split pays that stake, beyond
/// one smallest unit of rounding per payout.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Mismatch {
    /// The stake, by its index in the agreement's field 7.
    pub stake: u64,
    /// Who was paid, or should have been.
    pub holder: Hash,
    pub paid: u64,
    /// What rule 15a gives it (F150, F165): its share rounded down, with
    /// its leftover unit where it has one; where a tied unit is the payer's
    /// to decide or unknown, its share rounded down.
    pub due: u64,
}

/// A split, judged for what Agreements check of it (rules 20, 21, 26; Q9; N10).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SplitEval {
    pub id: Hash,
    pub split: Split,
    /// Whether its payouts sum exactly to the receipt's amount (rule 21);
    /// `None` when the receipt is not held.
    pub sums: Option<bool>,
    /// Each fee it takes: the module, who received it, how much (Q9).
    pub fees: Vec<(Hash, Hash, u64)>,
    /// Holders it pays to whom it was not delivered (Q9): neither among its
    /// recipients nor public.
    pub undelivered: Vec<Hash>,
    /// The collective whose agreement it pays, where found.
    pub collective: Option<Hash>,
    /// Payouts that do not match their stake (N10): any breaks the plan.
    pub mismatched: Vec<Mismatch>,
    /// What makes it no split of the service the owners named, under the
    /// agreement in force (rules 20, 26; audit, October 2026, gap 8): not
    /// signed by a split service the agreement in force names, with its
    /// own key; or naming a version that is not in force. Any entry breaks
    /// it; the payouts are still judged, against the stakes in force.
    pub problems: Vec<String>,
    /// The version in force, against which the payouts are judged: the
    /// latest version of the agreement the split names.
    pub in_force: Hash,
    /// Receivers of role payouts whose evidence does not hold (rule 22): no
    /// evidence named, not held, signed by the service or the payee, or,
    /// for a rail Module's share, a receipt or claim naming a Module the
    /// payee never published (F119). Such a share is earned by nothing.
    pub unevidenced: Vec<Hash>,
    /// Receivers of payouts that only the split plan could justify: a fee
    /// (rule 27) or a named receiver (rule 26). The plan's format is open
    /// (terms field 8), so the core cannot check them: shown, never passed
    /// as right.
    pub unplanned: Vec<Hash>,
    /// Stakes whose tied leftover units cannot be checked (F165): the turns
    /// cannot be read from the previous split act for the stake (F171),
    /// so who should have had a tied unit is unknown; the rest of the
    /// payment is checked all the same, each tied holder within one unit.
    pub turns_unknown: Vec<u64>,
    /// Where the split's place in the service's tally chain breaks the plan
    /// (rule 15a, rule 46b, F171): a reset, a fork, a running count that
    /// is not the previous one plus this split's leftover units, or no
    /// count carried. Any entry breaks the plan, as a mismatched payout
    /// does.
    pub breaks: Vec<ChainBreak>,
    /// Stakes whose running count cannot be checked (F171): the act the
    /// split cites as its previous one is not held, two are cited, or the
    /// previous carries no count; shown as unknown, never as a deviation.
    pub count_unknown: Vec<u64>,
    /// For a deal's split, where its number breaks the plan (rule 15a; QF4,
    /// F190): no number, or one another split of the same service under the
    /// deal carries. A deviation, as a break of the tally chain is.
    pub numbering: Option<NumberBreak>,
    /// The acts the split's envelope cites (`objects`, `acks`, `refs`):
    /// among them, the service's previous split act for each stake.
    pub cites: Vec<Hash>,
    /// Step 12b, the plan's roles (OF11 a, Fable's reading): roles whose
    /// fillers are not paid equally, within one unit.
    pub unequal_roles: Vec<String>,
    /// F214: fees the agreement's fee entries make owed on this payment,
    /// by their module, that the split leaves out: a wrong split, each
    /// fee the service's open obligation (rule 29).
    pub fees_skipped: Vec<Hash>,
    /// Rule 28 with Fable's review 2.7 and OF13 (a), (d): what is wrong
    /// with its metric payouts (a measurer paid by its own metric, or the
    /// split service; a receiver the plan does not already pay; a record
    /// not signed by the measurer, or not of the metric's Module).
    pub metric_problems: Vec<String>,
    /// Agreements draft 14, rule 22 (F312): payments of the collective's own
    /// part (a receipt or claim naming this split, paid to the collective)
    /// that the rail shows paid anywhere but an entry of the collective's
    /// vault: to its flow pointer, its split service's address, which
    /// would split it again. Any entry breaks the plan.
    pub own_not_to_vault: Vec<Hash>,
    /// Partners not paid their share of the payment exactly, within one unit
    /// (rule 21): `stake` is the partner's index in the publication's field 2.
    pub partners_mismatched: Vec<Mismatch>,
    /// The version of the publication the split was judged under.
    pub publication: Hash,
}

/// A break in a split service's tally chain for a stake (rule 15a, rule
/// 46b, F171). The service's split acts for a stake form one chain, each
/// citing the previous one and carrying the running count of leftover
/// units.
///
/// *What "the latest" is, a verifier can tell only from the acts it holds:
/// a split citing an earlier one than the latest shares its previous with
/// the split that does cite it (a fork), and a split citing none shares
/// the start with the first (a reset). The acts carry no order a verifier
/// could trust between two splits the service signed, so each split of the
/// pair is shown, naming the other: the plan is broken either way. The
/// holder's client, which keeps the chain as the splits arrive, names the
/// one that came second.*
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ChainBreak {
    /// The split cites no previous split for the stake, and so does each
    /// of `with`: two splits start the count, one of them resetting it.
    Reset { stake: u64, with: Vec<Hash> },
    /// The split cites `previous` for the stake, and so does each of
    /// `with`: the chain forks.
    Fork { stake: u64, previous: Hash, with: Vec<Hash> },
    /// The running count carried is not the previous split's plus this
    /// split's leftover units: `carried`, `expected` (a holder not named
    /// counts zero).
    Count { stake: u64, carried: Vec<(Hash, u64)>, expected: Vec<(Hash, u64)> },
    /// The split carries no running count for a stake it pays.
    NoCount { stake: u64 },
}

/// A deal's split whose number breaks the plan (rule 15a; QF4, decided 9
/// October 2026, F190), as a reset of the tally chain does (F171).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum NumberBreak {
    /// It carries no number (split key 5).
    Unnumbered,
    /// Its number is carried by `with` too: other splits of the same
    /// service under the same deal, any version or branch.
    Repeated { number: u64, with: Vec<Hash> },
}

impl ChainBreak {
    pub fn stake(&self) -> u64 {
        match self {
            ChainBreak::Reset { stake, .. } | ChainBreak::Fork { stake, .. } | ChainBreak::Count { stake, .. } | ChainBreak::NoCount { stake } => *stake,
        }
    }
}

/// Where a split sits in its service's tally chain for a stake (F171).
#[derive(Clone, Debug, PartialEq, Eq)]
enum Prior {
    /// It cites no previous split for the stake, and every act it cites is
    /// held: the first, by its own word.
    First,
    /// It cites this one, held.
    After(Hash),
    /// It cites an act not held, or two previous splits for the stake.
    Unknown,
}

/// What a split service owes (rule 29; audit, October 2026, gap 3): every
/// incoming receipt, and every payer's claim showing money arrived, without
/// a matching split, and every payout without the receiver's receipt, each
/// naming one receiver and one agreement (rule 55). What makes theft
/// provable from the receipts and the payers' claims (rule 31).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ServiceAccount {
    pub service: Hash,
    /// Money the service received for its grantors and never split (rules
    /// 20, 25, 30: the old service still owes on everything it received).
    pub unsplit: Vec<Unsplit>,
    /// Payouts of its splits that no receipt of the receiver discharges
    /// (rules 23, 24, 24a, 29).
    pub unpaid: Vec<Unpaid>,
    /// Fees its splits left out though the agreement's fee entry made
    /// them owed (F214): each `(split, module)`, an open obligation of the
    /// service (rule 29).
    pub fees_skipped: Vec<(Hash, Hash)>,
    /// Payouts its splits made to a seller for a stake the seller had
    /// transferred, which the seller receipted after the transfer on its
    /// own line (F217): each `(split, payout index, buyer, amount)`, the
    /// share sold, owed to the buyer as the service's open obligation
    /// (rule 29); the service settles with the seller.
    pub owed_to_buyers: Vec<(Hash, usize, Hash, u64)>,
}

/// Each participant's check (F250, decided by Nobody, allegedly, 11
/// October 2026: "Core says, agreement condition triggered (purchase) where
/// is my cut at my flow address (or vault if needed)."): for one payment
/// (a purchase's receipt or claim), what the splits that follow it assign
/// a participant, and what reached its flow address or vault.
#[derive(Clone, Debug, PartialEq, Eq, Default)]
pub struct CutCheck {
    /// What the payment assigns the participant, in the smallest part of
    /// its unit: the payment itself where the participant is its payee
    /// (payer-side splitting, or a lone owner); otherwise each payout to it
    /// of a split that follows the payment, layer by layer, a split that
    /// breaks its plan included (named in `stops`).
    pub due: u64,
    /// What the participant's own receipts show arrived for it, each valid,
    /// counting by its consent, with the rail's answer (`rail_valid`)
    /// placing the payment at its flow address or vault
    /// (`AgreementsView::at_mine`).
    pub received: u64,
    /// Those receipts.
    pub receipts: Vec<Hash>,
    /// The participant's receipts for it that show nothing arrived where
    /// its pointer or vault leads: no rail answer, or paid elsewhere.
    pub elsewhere: Vec<Hash>,
    /// Where the trail stops short, in words: no split yet (the service's
    /// open obligation, rule 29), a split that breaks its plan, a payout
    /// with no receipt of the participant.
    pub stops: Vec<String>,
}

impl CutCheck {
    /// Whether the participant's whole cut is at its flow address or vault,
    /// nothing in the trail stopping short.
    pub fn arrived(&self) -> bool {
        self.due > 0 && self.received >= self.due && self.stops.is_empty()
    }
}

/// An incoming payment with no split by the service (rules 20, 29).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Unsplit {
    /// The receipt the service signed with its grant key, or the payer's
    /// claim with the rail's answer, for which the grantor holds no receipt.
    pub payment: Hash,
    /// Whether `payment` is a payer's claim (true) or a receipt.
    pub claim: bool,
    /// The grantor the money came in for: the payee.
    pub receiver: Hash,
    /// The agreement the money came in under.
    pub agreement: Hash,
    pub amount: crate::money::Amount,
}

/// A payout of a split with no receipt of its receiver naming the split
/// (rules 23, 29), or one for less (rule 24a: the plan's maximum fee is not
/// readable, its format open, so a shortfall stays open).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Unpaid {
    pub split: Hash,
    /// The payout's index in the split.
    pub payout: usize,
    pub receiver: Hash,
    pub agreement: Hash,
    pub amount: u64,
    /// What the receiver's receipts naming the split show received.
    pub received: u64,
}

/// A public domain release, judged (rule 17, F121 shape D, F124 N7, N11).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReleaseEval {
    pub id: Hash,
    pub release: Release,
    /// Its rule is met among the work's direct owners: the claim ends, at
    /// once, or at its point for a timed release.
    pub complete: bool,
    pub why: Option<String>,
    /// The direct owners of the work: the holders of each stake it ends, a
    /// collective among them by its own identity (N7).
    pub holders: Vec<Hash>,
    /// Those of them whose signature counts (a collective's by its rules,
    /// meeting the lanes of Envelopes, Money and Agreements).
    pub signed: Vec<Hash>,
}

impl ReleaseEval {
    /// Whether the claim has ended (N11): at once for a release naming no
    /// point; for a timed one, as the time reference says whether its
    /// point has passed (`None`: undetermined).
    pub fn ended(&self, point_passed: Option<bool>) -> Option<bool> {
        if !self.complete {
            return Some(false);
        }
        match self.release.timed {
            None => Some(true),
            Some(_) => point_passed,
        }
    }
}

/// A payment that reached the old split service of a collective a fork
/// closed, for one of its withdrawn offers: the service's open debt to the
/// work's current owners (F124 N14, rule 30), in the shares the fork act
/// What it is (F126).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PurchaseVerdict {
    /// A purchase: on a request rail, the claim its seller's request
    /// committed to, recorded by a collective seller's actions chain (F127
    /// W2, F128 W4); on a push rail, every holder's receipt a sale (W4).
    Purchase,
    /// No purchase: money received for nothing, owed back to the payer as a
    /// refund (Money rule 10a; with no key committed, an open debt nobody
    /// can claim).
    NoPurchase { why: String },
    /// Not settled yet: on a request rail, a collective seller's actions
    /// chain has not recorded it (F127, W2); on a push rail, a holder the
    /// claim names has not signed its receipt (F128, W4). It becomes a sale
    /// once recorded, or is refunded where a receipt comes too late. Also
    /// where receipts of one payment name different claims and the rail has
    /// not yet shown which the payment committed to (F131, IT3).
    Unrecorded,
    /// A wrong receipt (F131, IT3): the payment's commitment names another
    /// claim than this receipt does. Shown as such; it counts for nothing,
    /// neither a sale nor a refund: the payment is judged by the receipts
    /// naming the claim it committed to.
    WrongReceipt { why: String },
    /// Unknown: the answer rests on a receipt or claim whose verification
    /// answer is pending or not held (Money rules 8 and 10). A
    /// record whose answer is not valid is no purchase and no sale; until
    /// its answer is given, whether the payment is one is unknown.
    Unknown,
}

/// An open question on a receiver (Money rule 10, double entry): a valid
/// payer's claim its receiver has signed no matching receipt for.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Disagreement {
    /// No receipt names the claim's rail proof: the claim alone shows the
    /// money arrived.
    NoReceipt { claim: Hash },
    /// A receipt naming the same rail proof disagrees with the claim: in
    /// amount, payee, what the payment fulfils, or, on a route, the
    /// previous hop's receipt it passes on (receipt field 6, claim key 10;
    /// Money rule 11).
    Differs {
        claim: Hash,
        receipt: Hash,
        claimed: crate::money::Amount,
        receipted: crate::money::Amount,
        payee: bool,
        fulfils: bool,
        previous: bool,
    },
}

/// What payment a receipt or claim is (Money rule 12; F200, F380), as
/// Money's rules that tell payments apart compare it: never by the proof's
/// bytes.
/// An answer judged on whether records whose payment is not stated are one
/// payment ([`AgreementsView::two_ways`]).
pub(crate) enum Ways<T> {
    /// No such pair asked about: the answer.
    One(T),
    /// One pair: the answer taking it as two payments, then as one.
    Both(T, T),
    /// Two or more pairs: unknown (Money rule 12).
    Unknown,
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Payment {
    /// An empty proof: no payment.
    None,
    /// The payment its rail Module says, stated by the caller
    /// ([`AgreementsView::payments`]).
    Stated(Vec<u8>),
    /// Not stated: the record alone (its act id), or a bare proof alone.
    /// Whether it is the same payment as any other record is unknown.
    Unstated(Vec<u8>),
}

/// A payment for a work, judged (F126).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PurchaseEval {
    pub id: Hash,
    /// The claim it names, if any.
    pub purchase: Option<crate::money::Purchase>,
    pub verdict: PurchaseVerdict,
    /// Who a refund would be owed to (Money rule 10a).
    pub refund_to: crate::money::RefundTo,
    /// Where the tag's payee is not the publication's split service: that
    /// payee, which bypasses the service (rule 16); the purchase stands.
    pub bypassing: Option<Hash>,
}

/// A deal read as rule 45b reads its forks (F186).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum DealState {
    /// One version in force.
    InForce(Hash),
    /// Two complete versions of one version, not settled: the version
    /// before the split is the reference; each branch from the split to its
    /// latest version.
    Forked { reference: Hash, branches: Vec<Vec<Hash>> },
    /// A tangled fork (F188, DQ1 to DQ4): the deal stays on its reference
    /// until one clean settlement; each branch's versions as held.
    Tangled { reference: Hash, why: &'static str, branches: Vec<Vec<Hash>> },
}

/// A settlement of a deal's fork, as `deal_state` weighs it (QF3, F192).
struct Settlement {
    /// The settling version, or the judge's settlement (type 23).
    act: Hash,
    /// What it puts in force: the settling version, or the version kept.
    into: Hash,
    /// A judge's settlement (type 23), by the link of the chain of
    /// judgment that signed it (its place in the chain); `None` for a
    /// version of the parties.
    link: Option<usize>,
    /// What it could see (F192): its history, and, for a judge's
    /// settlement, the histories of the versions it names.
    seen: BTreeSet<Hash>,
}

/// A deal standing forked (rule 45b, F186).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DealFork {
    /// The version before the split: the last version every party agrees
    /// on, what a verifier reports as the unforked state, and the point
    /// the settling version names.
    pub reference: Hash,
    /// Each branch, from the split to its latest version.
    pub branches: Vec<Vec<Hash>>,
    /// Where the fork is tangled (F188, DQ1 to DQ4), why: the deal stays on
    /// its reference until one clean settlement.
    pub tangled: Option<&'static str>,
}

/// The alarm a seller's client and a split service raise (rule 45b, F186,
/// client conformance): a payment names a version of the deal that does
/// not descend from the version they hold.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ForkAlarm {
    /// The version the payment names.
    pub named: Hash,
    /// The version the seller or service holds.
    pub held: Hash,
    /// The last version both lines share.
    pub shared: Hash,
    /// What it is: a fork (the alarm), a version this verifier does not
    /// hold (the alarm: the hidden fork it exists for, F189 3), or an older
    /// version of the line held (a plain notice, F188 DQ7).
    pub kind: AlarmKind,
    /// The versions after `shared` up to `held`, in order.
    pub held_line: Vec<Hash>,
    /// The versions after `shared` up to `named`, in order.
    pub named_line: Vec<Hash>,
}

/// The numbers on a service's splits under a deal (DQ6, F188).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SplitNumbers {
    /// Each split held, by its number, ascending.
    pub numbers: Vec<(u64, Hash)>,
    /// The numbers missing below the highest held: the holder's alarm.
    pub gaps: Vec<u64>,
    /// Numbers carried by two splits or more.
    pub repeated: Vec<u64>,
    /// Splits under the deal carrying no number.
    pub unnumbered: Vec<Hash>,
}

/// What a payment naming a version a seller does not descend from shows
/// (rule 45b, client conformance).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AlarmKind {
    /// The two lines part: a fork of the deal. The alarm.
    Fork,
    /// A version this verifier does not hold: the alarm, a hidden fork
    /// until shown otherwise (F189, 3); fetch it from the payer's relays.
    Unheld,
    /// An older version of the line held, with no fork: a plain notice,
    /// an outdated offer still read as valid (F188, DQ7).
    Older,
}

impl AlarmKind {
    /// Whether it is the alarm, not a notice: the alarm is kept for forks
    /// (DQ7).
    pub fn is_alarm(&self) -> bool {
        !matches!(self, AlarmKind::Older)
    }
}

/// A payment a collective received during a broken stretch, owed back to
/// its payer until the sale is signed anew after the rollback (rule 37d,
/// RB2): a visible open obligation.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OwedBack {
    /// The receipt or claim of the payment, as held.
    pub payment: Hash,
    /// Who it is owed back to (Money rule 10a).
    pub to: crate::money::RefundTo,
    /// Its amount.
    pub amount: crate::money::Amount,
    /// Whether the collective is still broken (no rollback yet).
    pub still_broken: bool,
    /// Whether it rests on whether two records whose payment is not stated
    /// are one payment (Money rule 12): whether it is owed is then unknown.
    pub unknown: bool,
}

/// A rule by head, counted among the voices that remain (rule 44d), met
/// by these signers.
fn head_met(rule: &Rule, t: &Terms, voices: &[Hash], signed: &[Hash]) -> bool {
    let counted: Vec<Hash> = rule.counted_among(&t.parties).into_iter().filter(|p| voices.contains(p)).collect();
    match rule.needed(counted.len()) {
        None => false,
        Some(n) => counted.iter().filter(|p| signed.contains(p)).count() >= n,
    }
}

impl<'a> AgreementsView<'a> {
    // ------------------------------------------------------------ endings

    /// The collective whose agreement this is: the identity whose genesis
    /// declares the root of its lineage, where held. What null names in its
    /// terms (S1).
    pub fn collective_of(&self, agreement: &Hash) -> R<Option<Hash>> {
        let root = self.lineage(agreement)?.pop().expect("a lineage has a root").0;
        Ok(self.v.held_acts().find_map(|g| match &g.identity {
            Some(Ok(Payload::Genesis(gen)))
                if g.verdict == crate::sig::Verdict::Valid
                    && declared_in(gen.declarations.as_deref().unwrap_or(&[]), &self.agreements())
                        .and_then(|d| d.ok())
                        .is_some_and(|d| d.agreement == root) =>
            {
                Some(g.id)
            }
            _ => None,
        }))
    }

    /// The founding agreement a collective's genesis declares, where held.
    fn founding_of(&self, collective: &Hash) -> Option<Hash> {
        let res = self.v.resolve(collective);
        declared_in(&res.states.first()?.declarations, &self.agreements())?.ok().map(|d| d.agreement)
    }

    /// Whether the original's act `x` counts as made before a line drawn by
    /// a fork or closing ("Made before, made after", 1): in the history its
    /// chain citations `line` hold.
    fn before_line(&self, col: &Col, x: &Held, line: &[Hash]) -> bool {
        self.history(col, line).acts.contains(&x.id)
    }

    /// Whether an act for the collective counts as made before the line of
    /// the fork or closing `ending`: in the history its chain citations
    /// hold.
    fn before_ending(&self, col: &Col, x: &Held, ending: &Hash) -> bool {
        match self.v.get(ending) {
            Some(e) => self.before_line(col, x, &Self::cites(e, &col.id)),
            None => false,
        }
    }

    /// The latest link of the collective's identity chain a line's history
    /// holds (genesis 0).
    fn line_link(&self, col: &Col, line: &[Hash]) -> Option<usize> {
        self.history(col, line).acts.iter().filter_map(|a| col.res.position_of(a)).max()
    }

    /// The acts the history a fork or closing cites names but this verifier
    /// does not hold: until it holds them, it cannot tell what that history
    /// holds.
    fn line_missing(&self, col: &Col, line: &[Hash]) -> Vec<Hash> {
        self.history(col, line).missing.iter().copied().collect()
    }

    /// Whether a fork or closing meets the constitutional change rule
    /// (rules 47a, 69), each rule in it counted as it would be alone, at the
    /// ending's line (new in draft 14, F330: "operate by share, die by
    /// share"). By head, among the members whose voice remains, as before.
    /// By share among the parties (`[3, stake, share]`), each member whose
    /// voice remains counts by what it holds of the stake at the ending's
    /// line ([`Self::roster_at_ending`]), the share asked for being of what
    /// those voices hold together; where they hold nothing, every voice
    /// that remains together meets it (rule 65). Among a stake's holders
    /// (`[5, stake, share]`), every holder at the line counts by its share
    /// of the whole stake, each by its chain signature on the ending (Identity
    /// type 16): a member's, and that of a holder who is no member, as a
    /// member signs (F331), judged as every
    /// ending signature is (F132, U4).
    #[allow(clippy::too_many_arguments)]
    fn ending_rule_met(&self, col: &Col, ending: &Hash, ag: &Hash, t: &Terms, voices: &[Hash], signed: &[Hash], line: &[Hash]) -> R<bool> {
        let rule = t.constitutional_rule();
        for part in rule.parts() {
            let met = match part {
                Rule::ByShare { stake, share } => {
                    let roster = self.roster_at_ending(col, ag, *stake, line)?;
                    let held = |x: &Hash| roster.iter().find(|(h, _)| h == x).map_or(0, |(_, n)| *n) as u128;
                    let total: u128 = voices.iter().map(held).sum();
                    let got: u128 = voices.iter().filter(|v| signed.contains(v)).map(held).sum();
                    if total == 0 { !voices.is_empty() && voices.iter().all(|v| signed.contains(v)) } else { got * MILLION as u128 >= *share as u128 * total }
                }
                Rule::Holders { stake, share } => {
                    let roster = self.roster_at_ending(col, ag, *stake, line)?;
                    let others: Vec<Hash> = roster.iter().map(|(h, _)| *h).filter(|h| !voices.contains(h)).collect();
                    let mut s: Vec<Hash> = signed.iter().filter(|x| voices.contains(x) && roster.iter().any(|(h, _)| h == *x)).copied().collect();
                    s.extend(self.ending_signed(&col.id, ending, &others));
                    holders_met(&roster, &s, *share).is_ok()
                }
                head => head_met(head, t, voices, signed),
            };
            if !met {
                return Ok(false);
            }
        }
        Ok(true)
    }

    /// The agreement in force at a fork's or closing's line, and the members
    /// whose voice remains there; or why the line does not hold.
    fn at_line(&self, col: &Col, agreement: &Hash, line: &[Hash]) -> R<Result<(Terms, Vec<Hash>), String>> {
        let Some(bf) = self.line_link(col, line) else {
            return Ok(Err("it cites no decision of the collective on its chain: its line holds nothing (rule 58)".into()));
        };
        if !self.declares(col, bf) {
            return Ok(Err("it does not name a collective".into()));
        }
        let base = match self.base(col, bf)? {
            Ok(b) => b,
            Err(w) => return Ok(Err(w)),
        };
        let mut puts = vec![];
        let mut departures = vec![];
        for k in 0..=bf {
            for r in self.records_at(col, k) {
                if !self.before_line(col, r, line) {
                    continue;
                }
                let re = self.record_eval(col, r)?;
                if re.line {
                    departures.extend(re.registers.iter().cloned());
                }
                if k >= self.declared_at(col, bf) {
                    if let Some(c) = re.puts {
                        puts.push((c, re.resolves));
                    }
                }
            }
        }
        let inf = self.fold(base, &puts)?;
        if &inf.agreement != agreement {
            return Ok(Err("it names an agreement other than the one in force at its line".into()));
        }
        let t = self.terms(agreement)?;
        let lineage: Vec<Hash> = self.lineage(agreement)?.into_iter().map(|(i, _)| i).collect();
        let mut gone = vec![];
        for d in &departures {
            if let DepartureKind::Resigned { agreement } | DepartureKind::Declared { agreement } = d.kind {
                if lineage.contains(&agreement) {
                    gone.push(d.party);
                }
            }
        }
        let voices = t.parties.iter().filter(|p| !gone.contains(p)).copied().collect();
        Ok(Ok((t, voices)))
    }

    /// Whether `who` signed `act`: by being its signer, or by a valid
    /// signature act naming it; a collective's signature counting only where
    /// its consent does (its own rules and lanes).
    fn signed_act(&self, act: &Held, who: &Hash) -> R<bool> {
        if self.author(act).as_ref() == Some(who) {
            return Ok(self.consent(&act.id)?.counts());
        }
        for (_, sid) in self.valid_sigs(&act.id, &[*who]) {
            if self.consent(&sid)?.counts() {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// Whether an obligation binds its debtor (F66): signed by its debtor,
    /// and, where the debtor is a collective, only once done, like any act
    /// in its name (F128, withdrawing N13's public outside): publishing it
    /// is the creditor's choice and protection. `None` where the act is not
    /// an obligation.
    pub fn obligation_binds(&self, id: &Hash) -> R<Option<bool>> {
        use crate::money::Payload as Fin;
        let x = self.held(id)?;
        if x.inside.spec != self.mirs.money {
            return Ok(None);
        }
        let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else {
            return Ok(None);
        };
        if !self.valid(id) || self.author(x) != Some(o.debtor) {
            return Ok(Some(false));
        }
        let col = self.col(&o.debtor);
        let collective = (0..col.res.links.len()).any(|k| self.declares(&col, k));
        if !collective {
            return Ok(Some(true));
        }
        if self.done(id)? != Some(Ok(())) {
            return Ok(Some(false));
        }
        // An act in the collective's name binds it only where Agreements' consent
        // counts (rules 35b, 36a, 44): it cites the decision it acts under,
        // its area's holders signed it (the Money lane, for a debt), and,
        // signed with a grant key, its grant backs it. Found by the Agreements
        // invariants (`docs/law-invariants.md`, IC1).
        if !self.consent(id)?.counts() {
            return Ok(Some(false));
        }
        // The tie rule (F127): an obligation outside the history of the fork
        // or closing that ended its debtor was made with powers that were
        // ending, and is void.
        Ok(Some(self.after_closing(id)?.is_none()))
    }

    /// Whether an act in a collective's name is done (F126, F128): sealed to
    /// every member of the agreement in force for it (public, or every
    /// member among its recipients). Where it is held is never a condition
    /// (F128: relays are transport); that it is on the collective's chain,
    /// citing its head, is [`Consent::Uncited`]. `None` where the act is not
    /// in a collective's name: signed neither with a collective's own key
    /// nor with a grant key of its.
    pub fn done(&self, act: &Hash) -> R<Option<Result<(), String>>> {
        let x = self.held(act)?;
        if x.act.outside.signer.is_none() {
            return Ok(None);
        }
        let agreement = match self.in_force(act) {
            Ok(Some(a)) => a,
            _ => return Ok(None),
        };
        Ok(Some(match self.not_done(x, &agreement)? {
            None => Ok(()),
            Some(w) => Err(w),
        }))
    }

    /// Why an act in the name of the collective whose agreement in force is
    /// `agreement` is not done (F126, F128), if it is not.
    fn not_done(&self, x: &Held, agreement: &Hash) -> R<Option<String>> {
        let t = self.terms(agreement)?;
        if !self.sealed_to_all(x, &t) {
            let to = x.act.outside.to.clone().unwrap_or_default();
            let missing = t.parties.iter().filter(|p| !to.contains(p)).count();
            return Ok(Some(format!(
                "not done: it is not sealed to every member ({missing} missing), nor public, so it binds no one (F126)"
            )));
        }
        // Agreements draft 14, rule 57 (F318): where the collective's stake
        // in itself has holders who are no members, an act in its Money
        // lane is done only once sealed to every holder of that stake too
        // (a holder that is an agreement: every party of its version in
        // force; a collective: the collective, F328 Q13), the holders those
        // the agreement in force and the transfers its line placed name.
        if x.inside.spec == self.mirs.money && x.act.outside.content_key.is_none() {
            if let Some((i, st)) = t.own_stake() {
                let roster = match self.collective_of(agreement)? {
                    Some(c) => {
                        let col = self.col(&c);
                        self.roster_at(&col, Line::Record(x), agreement, i as u64)?
                    }
                    None => st.identified(),
                };
                if roster.iter().any(|(h, _)| !t.parties.contains(h)) {
                    for (h, _) in &roster {
                        if !self.reaches_holder(x, h)? {
                            return Ok(Some(
                                "not done: an act in the Money lane of a collective whose stake in itself has holders who are no members is sealed to every holder of that stake, or public; it is not, so it binds no one (rule 57; new in draft 14, F318, F328)".into(),
                            ));
                        }
                    }
                }
            }
        }
        Ok(None)
    }

    /// What a fork must hand out (F127, F126 item 2 rewritten): every
    /// obligation in the history it cites, paid or not, so that whether a
    /// fork took effect never changes with what happens after it (reading):
    /// the original's own, published or
    /// not, unless sealed neither to every member nor publicly, which is
    /// never the collective's (F126); and every obligation an earlier fork
    /// assigned to it, where its own signature act on that fork lies in
    /// that history (F125 reading 4, as adjusted in F126).
    fn to_hand_out(&self, col: &Col, t: &Terms, line: &[Hash]) -> R<Vec<Hash>> {
        use crate::money::Payload as Fin;
        let mut out = vec![];
        for x in self.col_acts(col) {
            if x.inside.spec != self.mirs.money || !self.valid(&x.id) {
                continue;
            }
            let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else { continue };
            // F144 (reworded after the review of F133 to F144): an
            // obligation is handed out only if it binds the collective:
            // done (sealed to every member or public, and on its chain,
            // rules 35a and 35b) and within its signer's powers, or adopted
            // (rules 40 and 42). One that binds no one cannot block a fork,
            // and stays visible as what it is.
            let _ = t;
            // F199 (decided 10 October 2026, "1 is agreed"): whether a fork
            // took effect is judged only by what its own history holds: the
            // departures registered before its line count for this check; a
            // departure registered after it never changes it.
            if o.debtor != col.id || !self.before_line(col, x, line) {
                continue;
            }
            let outer = self.fork_line.replace(Some((col.id, line.to_vec())));
            let binds = self.obligation_binds(&x.id);
            self.fork_line.replace(outer);
            if binds? == Some(true) {
                out.push(x.id);
            }
        }
        for y in self.v.held_acts() {
            if !self.is_agreements(y, types::FORK) || y.id == col.id {
                continue;
            }
            let Ok(f0) = Fork::decode(&y.inside) else { continue };
            let Some(side) = f0.sides.iter().position(|s| s.successor == col.id) else { continue };
            // F303: the original's own chain signature on that earlier fork,
            // lying in its identity chain before this fork's chain act.
            let signed = match (self.chain_signed(&col.id, &y.id), self.line_link(col, line)) {
                (Some(p), Some(q)) => p < q,
                _ => false,
            };
            if !signed || !self.fork(&y.id)?.complete {
                continue;
            }
            for (d, sides) in &f0.debts {
                if sides.contains(&(side as u64)) && !out.contains(d) {
                    out.push(*d);
                }
            }
        }
        Ok(out)
    }

    /// What a fork of `collective` drawing its line at `chain_act` and `tips`
    /// must hand out (F127), for a client preparing one; `None` where the
    /// line does not hold.
    pub fn hand_out(&self, collective: &Hash, agreement: &Hash, line: &[Hash]) -> R<Option<Vec<Hash>>> {
        let col = self.col(collective);
        let Ok((t, _)) = self.at_line(&col, agreement, line)? else {
            return Ok(None);
        };
        Ok(Some(self.to_hand_out(&col, &t, line)?))
    }

    /// The acts the history a line drawn at `chain_act` and `tips` would
    /// cite that this verifier does not hold: until it holds them, a fork or
    /// closing drawn there is not complete for it (F127). A member's client
    /// signs no ending while any is missing (F131, IT2b, client
    /// conformance).
    pub fn line_unheld(&self, collective: &Hash, line: &[Hash]) -> Vec<Hash> {
        self.line_missing(&self.col(collective), line)
    }

    /// Every fork and closing of a collective this verifier holds, complete
    /// or not, in id order: what a new ending names (F131, IT1, client
    /// conformance).
    pub fn ending_acts(&self, collective: &Hash) -> Vec<Hash> {
        let mut out: Vec<Hash> = self
            .v
            .held_acts()
            .filter(|x| {
                (self.is_agreements(x, types::FORK) && Fork::decode(&x.inside).is_ok_and(|f| &f.collective == collective))
                    || (self.is_agreements(x, types::CLOSING) && Closing::decode(&x.inside).is_ok_and(|c| &c.collective == collective))
            })
            .map(|x| x.id)
            .collect();
        out.sort();
        out
    }

    /// Whether an act is sealed to every party of `t`, or public (F126).
    fn sealed_to_all(&self, x: &Held, t: &Terms) -> bool {
        x.act.outside.content_key.is_some()
            || t.parties.iter().all(|p| x.act.outside.to.iter().flatten().any(|q| q == p))
    }

    /// A fork act, judged.
    pub fn fork(&self, id: &Hash) -> R<ForkEval> {
        // F153: a binding answer, unknown where it rests on the verifier's
        // own attempts; judged once, from outside any ending's judgment.
        if self.own_attempts_open() {
            return self.binding(|v| v.fork(id));
        }
        let h = self.held(id)?;
        if !self.is_agreements(h, types::FORK) {
            return Err(AgreementsError::Check("not a fork act"));
        }
        let collective = Fork::decode(&h.inside)?.collective;
        let (mut e, nested) = self.on_own_history(&collective, |v| v.fork_inner(id))?;
        if !nested {
            e.counts = Some(e.complete && self.closed_by(&collective)?.is_some_and(|c| &c.by == id));
        }
        Ok(e)
    }

    /// Judges an ending on its own history (F143): while `f` runs, no
    /// ending of the collective is in force, as during the choice of the
    /// one that counts (`closed_by`), so the answer is the same whenever
    /// a verifier asks. Returns whether the judgment was already nested in
    /// that choice.
    fn on_own_history<T>(&self, collective: &Hash, f: impl FnOnce(&Self) -> R<T>) -> R<(T, bool)> {
        let nested = !self.ending.borrow_mut().insert(*collective);
        let r = f(self);
        if !nested {
            self.ending.borrow_mut().remove(collective);
        }
        Ok((r?, nested))
    }

    fn fork_inner(&self, id: &Hash) -> R<ForkEval> {
        let h = self.held(id)?;
        let f = Fork::decode(&h.inside)?;
        let mut e = ForkEval {
            id: *id,
            fork: f.clone(),
            complete: false,
            why: None,
            voices: vec![],
            signed: vec![],
            leaving: vec![],
            shares: vec![],
            by_count: false,
            kept: vec![],
            successors: vec![None; f.sides.len()],
            unassigned: vec![],
            counts: None,
        };
        let fail = |mut e: ForkEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the fork act is not valid under Identity");
        }
        // F189 (7): while a collective is broken, no fork counts, whatever
        // line it names (RB6: an emergency, with emergency rules).
        if let Some(w) = self.broken(&f.collective)? {
            return fail(e, &format!("the collective is broken: no fork counts until it is rolled back, whatever line it names (rules 37d, 47a; RB6, F189 7): {w}"));
        }
        let col = self.col(&f.collective);
        // Its line: what it cites on the collective's chain (Fork, type 19).
        let fline: Vec<Hash> = self.v.get(id).map(|h| Self::cites(h, &f.collective)).unwrap_or_default();
        let (t, voices) = match self.at_line(&col, &f.agreement, &fline)? {
            Ok(x) => x,
            Err(w) => return fail(e, &format!("the fork: {w}")),
        };
        e.voices = voices.clone();
        e.leaving = voices.iter().filter(|v| f.side_of(v).is_none()).copied().collect();
        // Each member's percentage of all the original's income: its stake
        // in itself (Q8, N5), else each member alike (N3).
        let own = t.own_stake().map(|(_, s)| s.clone());
        // Members counted alike keep "leftovers to the first" (open: ordering
        // their ties by the fork act's hash is circular, since the
        // successors' founding terms name each leaving member's share before
        // the fork act exists; left open by Nobody, allegedly, 6 October
        // 2026).
        let alike = divide_first(MILLION, &vec![1; voices.len()]);
        let pct = |m: &Hash| -> u64 {
            match &own {
                Some(st) => st.share_of(&Who::Id(*m)),
                None => voices.iter().position(|v| v == m).map_or(0, |i| alike[i]),
            }
        };
        let mut weights: Vec<u64> = f.sides.iter().map(|s| s.members.iter().map(&pct).sum()).collect();
        if own.is_none() || weights.iter().sum::<u64>() == 0 {
            e.by_count = own.is_none();
            weights = f.sides.iter().map(|s| s.members.len() as u64).collect();
        }
        let by_side: Vec<(Hash, u64)> = f.sides.iter().map(|s| s.successor).zip(weights).collect();
        e.shares = divide_fork(id, MILLION, &by_side);
        for d in t.departed.iter().flatten() {
            e.kept.push((*d, pct(d)));
        }
        for m in &e.leaving {
            e.kept.push((*m, pct(m)));
        }
        // W5 (F128): a fork counts only once done: sealed to every member,
        // or public, as it cites the collective's head by its line.
        if !self.sealed_to_all(h, &t) {
            return fail(e, "not done: the fork is not sealed to every member, nor public (W5, F128)");
        }
        if f.sides.iter().any(|s| s.members.iter().any(|m| !voices.contains(m))) {
            return fail(e, "a side lists someone who is not a member whose voice remains at the fork");
        }
        let signer = h.act.outside.signer.ok_or(AgreementsError::Check("a fork act has a signer"))?;
        if f.side_of(&signer).is_none() {
            return fail(e, "the fork act is signed by someone on no side");
        }
        let members: Vec<Hash> = f.sides.iter().flat_map(|s| s.members.iter()).copied().collect();
        e.signed = self.ending_signed(&f.collective, id, &members);
        if let Some(y) = self.ending_sigs(&f.collective).no_ending.get(id) {
            return fail(e, &format!("no fork: its signer signed another ending of the collective, {}, earlier on their own chain, and the fork does not name it in its objects (F132, U4b)", y.iter().map(|b| format!("{b:02x}")).collect::<String>()));
        }
        // Successors (N4): each side founded its collective first; its
        // founding terms have that side's members as parties, and keep every
        // departed holder and every member leaving at their percentage.
        for (i, side) in f.sides.iter().enumerate() {
            let Some(ag) = self.founding_of(&side.successor) else { continue };
            let Ok(st) = self.terms(&ag) else { continue };
            let mut a = st.parties.clone();
            let mut b2 = side.members.clone();
            a.sort();
            b2.sort();
            let own2 = st.own_stake().map(|(_, s)| s);
            let keeps = e.kept.iter().all(|(h, n)| {
                own2.is_some_and(|s| s.share_of(&Who::Id(*h)) == *n) && st.departed.iter().flatten().any(|d| d == h)
            });
            if st.is_collective() && st.parent.is_none() && a == b2 && keeps {
                e.successors[i] = Some(ag);
            }
        }
        if e.signed.len() < members.len() {
            return fail(
                e,
                "every member on a side signs the fork, with their own identity (F121), by a chain signature with their chain key (F132); a signature placed after the signer's own signature on an ending naming this one counts for nothing (U4)",
            );
        }
        if !self.ending_rule_met(&col, id, &f.agreement, &t, &voices, &e.signed, &fline)? {
            return fail(e, "the fork follows the constitutional change rule, every member by default (N1), a rule by share counted at the fork's line (F330)");
        }
        if let Some(i) = e.successors.iter().position(|s| s.is_none()) {
            return fail(
                e,
                &format!("side {i}'s successor is not held, or its founding terms do not have that side's members as parties, keeping every departed holder and member leaving at their share (N4)"),
            );
        }
        // Rule 95, item 4 (new in draft 14, F310; Fable's Agreements review,
        // A10): a successor's founding terms pay no kept holder less than the
        // original's agreement in force at the fork's line, compared as the
        // kept holders' stake (each collective's stake in itself, written
        // null) as rule 48 reads "paid less"; or the kept holders consent:
        // holders of the original's stake in itself meeting its holders'
        // rule, or, under every holder, each kept holder, by a signature act
        // naming the successor's founding terms, which counts only where an
        // act of the original in the fork's history acknowledges it (F328,
        // Q12), kept there whatever its signer's later rotation disowns.
        let kept_ids: Vec<Hash> = e.kept.iter().map(|(h, _)| *h).collect();
        for (i, ag) in e.successors.clone().iter().enumerate() {
            let Some(ag) = ag else { continue };
            let st = self.terms(ag)?;
            // Compared too: the split agreement the successor's founding
            // names first, against the original's in force at the fork's
            // line (rule 95, item 4).
            let paid_less = super::pay::stakes_paid_less(&t, &st).iter().any(|(o, _)| *o == Who::This) || self.successor_split_pays_less(&f.agreement, id, ag)?;
            if !paid_less || kept_ids.is_empty() {
                continue;
            }
            let consented = |x: &Hash| {
                self.v.signed_by(x).any(|s| {
                    self.is_agreements(s, types::SIGNATURE)
                        && decode_signature(&s.inside).ok() == Some(*ag)
                        && matches!(self.status(&s.id), Status::Valid | Status::Void | Status::Disputed)
                        && self.relied_by_line(&col, &fline, s)
                })
            };
            let met = match (t.own_stake(), t.own_stake().map(|(j, _)| t.holders_rule(j as u64).0)) {
                (Some((_, own_st)), Some(HoldersRule::Share(need))) => {
                    own_st.identified().iter().filter(|(x, _)| consented(x)).map(|(_, n)| *n).sum::<u64>() >= need
                }
                _ => kept_ids.iter().all(consented),
            };
            if !met {
                return fail(
                    e,
                    &format!("side {i}'s successor's founding terms pay a kept holder less than the original's agreement in force at the fork's line, and the kept holders have not consented, acknowledged by an act of the original in the fork's history (rule 95; new in draft 14, F310, F328)"),
                );
            }
        }
        // Debts (N13; F127, replacing F125 D1): the fork cites its history
        // (its line) and hands out everything in it, or does not take
        // effect; each successor a debt is assigned to signs for it. What is
        // missing from that history is void (the tie rule): no successor
        // owes it.
        // F304 (F298): while an act that history names is not held, the
        // fork is unknown for this verifier, never complete and never "not
        // complete"; it judges again once it holds the act.
        if let Some(m) = self.line_missing(&col, &fline).first() {
            return Err(AgreementsError::Missing(*m));
        }
        e.unassigned = self
            .to_hand_out(&col, &t, &fline)?
            .into_iter()
            .filter(|x| !f.debts.iter().any(|(d, _)| d == x))
            .collect();
        if !e.unassigned.is_empty() {
            return fail(
                e,
                "the fork hands out every obligation in the history it cites, or does not take effect (F127)",
            );
        }
        let mut owing: Vec<u64> = f.debts.iter().flat_map(|(_, s)| s.iter().copied()).collect();
        owing.sort();
        owing.dedup();
        for i in owing {
            if self.chain_signed(&f.sides[i as usize].successor, id).is_none() {
                return fail(
                    e,
                    &format!("side {i}'s successor signs for the debts the fork assigns to it by a chain signature with its own chain key (N13; new in draft 14, F303): a signature act is no successor's signature on it"),
                );
            }
        }
        e.complete = true;
        Ok(e)
    }

    /// The position, in `signer`'s identity chain, of its chain signature
    /// (Identity type 16) naming `act`, where one counts there and is not
    /// void: the earliest (F132; new in draft 14, F303: a successor signs a
    /// fork so, and no later rotation voids a chain act).
    fn chain_signed(&self, signer: &Hash, act: &Hash) -> Option<usize> {
        let res = self.v.resolve(signer);
        self.v
            .signed_by(signer)
            .filter(|x| x.inside.spec == self.mirs.identity && x.inside.type_ == crate::identity::types::CHAIN_SIGNATURE)
            .filter(|x| matches!(&x.identity, Some(Ok(Payload::ChainSignature(c))) if &c.signs == act))
            .filter(|x| !self.refuses(&x.id))
            .filter_map(|x| res.position_of(&x.id))
            .min()
    }

    /// Stakes a collective holds in what this verifier holds: stakes of
    /// latest versions of agreements naming it as a holder (by its identity,
    /// or by null in its own terms), other than of its own income, whose
    /// work is not released. *A stake sold by a transfer (type 4, format
    /// open) is not seen.*
    fn holdings(&self, col: &Col, line: &[Hash]) -> R<Vec<(Hash, u64)>> {
        let collective = &col.id;
        let mut parents = BTreeSet::new();
        let mut terms = vec![];
        for x in self.v.held_acts() {
            if !self.is_agreements(x, types::TERMS) {
                continue;
            }
            let Ok(t) = self.terms(&x.id) else { continue };
            if let Some(p) = t.parent {
                parents.insert(p);
            }
            terms.push((x.id, t));
        }
        let mut out = vec![];
        for (id, t) in terms {
            if parents.contains(&id) {
                continue;
            }
            let this = if t.is_collective() { self.collective_of(&id)? } else { None };
            for (i, st) in t.stakes.iter().flatten().enumerate() {
                if st.object == Who::This {
                    continue;
                }
                if !st.holders.iter().any(|(h, _)| h.resolve(this.as_ref()) == Some(*collective)) {
                    continue;
                }
                // Released, the collective's own consent to it placed before
                // the line: a release it signs after its line counts for
                // nothing (rule 47a).
                let released = match st.object {
                    Who::Id(c) => match self.claim_work(&c).map(|w| self.released(&w)).transpose()?.flatten() {
                        Some(r) if r.release.stakes.contains(&(id, i as u64)) => {
                            let rh = self.held(&r.id)?;
                            let mine: Vec<&Held> = std::iter::once(rh)
                                .filter(|x| self.author(x).as_ref() == Some(collective))
                                .chain(self.valid_sigs(&r.id, &[*collective]).iter().filter_map(|(_, s)| self.v.get(s)))
                                .collect();
                            mine.iter().any(|x| self.before_line(col, x, line))
                        }
                        _ => false,
                    },
                    Who::This => false,
                };
                // The complete transfers of that stake the closing's history
                // cites, each placed on the collective's line, applied as
                // rule 10 counts them (rule 91, "holds nothing").
                let root = self.lineage(&id)?.last().map(|r| r.0).unwrap_or(id);
                let written: u64 = st.holders.iter().filter(|(h, _)| h.resolve(this.as_ref()) == Some(*collective)).map(|(_, n)| *n).sum();
                let mut sold: u64 = 0;
                for x in self.col_acts(col) {
                    if !self.is_agreements(x, crate::agreements::open_formats::new_types::STAKE_TRANSFER) || !self.before_line(col, x, line) {
                        continue;
                    }
                    let Ok(e) = self.transfer(&x.id) else { continue };
                    if !e.effective || e.over_sale || &e.seller != collective || e.transfer.stake != i as u64 {
                        continue;
                    }
                    if self.lineage(&e.transfer.agreement)?.last().map(|r| r.0) == Some(root) {
                        sold = sold.saturating_add(e.transfer.share);
                    }
                }
                if !released && sold < written {
                    out.push((id, i as u64));
                }
            }
        }
        Ok(out)
    }

    /// A closing act, judged (N9).
    pub fn closing(&self, id: &Hash) -> R<ClosingEval> {
        self.judged_r(|| self.closing_unjudged(id))
    }

    /// Judged as [`Self::judged`] says: unknown ([`AgreementsError::PaymentUnstated`])
    /// only where it depends on whether two records whose payment is not
    /// stated are one payment (Money rule 12).
    fn closing_unjudged(&self, id: &Hash) -> R<ClosingEval> {
        if self.own_attempts_open() {
            return self.binding(|v| v.closing(id));
        }
        let h = self.held(id)?;
        if !self.is_agreements(h, types::CLOSING) {
            return Err(AgreementsError::Check("not a closing act"));
        }
        let collective = Closing::decode(&h.inside)?.collective;
        let (mut e, nested) = self.on_own_history(&collective, |v| v.closing_inner(id))?;
        if !nested {
            e.counts = Some(e.complete && self.closed_by(&collective)?.is_some_and(|c| &c.by == id));
        }
        Ok(e)
    }

    fn closing_inner(&self, id: &Hash) -> R<ClosingEval> {
        let h = self.held(id)?;
        let c = Closing::decode(&h.inside)?;
        let mut e = ClosingEval {
            id: *id,
            closing: c.clone(),
            complete: false,
            why: None,
            voices: vec![],
            signed: vec![],
            holds: vec![],
            open_debts: vec![],
            counts: None,
        };
        let fail = |mut e: ClosingEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the closing act is not valid under Identity");
        }
        // F189 (7): while a collective is broken, no closing counts,
        // whatever line it names, the last good link included.
        if let Some(w) = self.broken(&c.collective)? {
            return fail(e, &format!("the collective is broken: no closing counts until it is rolled back, whatever line it names (rules 37d, 47a; RB6, F189 7): {w}"));
        }
        let col = self.col(&c.collective);
        let cline: Vec<Hash> = self.v.get(id).map(|h| Self::cites(h, &c.collective)).unwrap_or_default();
        let (t, voices) = match self.at_line(&col, &c.agreement, &cline)? {
            Ok(x) => x,
            Err(w) => return fail(e, &format!("the closing: {w}")),
        };
        e.voices = voices.clone();
        // W5 (F128): a closing counts only once done.
        if !self.sealed_to_all(h, &t) {
            return fail(e, "not done: the closing is not sealed to every member, nor public (W5, F128)");
        }
        // F127, as for a fork (Agreements draft 13, "Closing (type 20)": "its
        // line holds ... as for a fork"; "owes nothing" is judged on the
        // history the closing cites): while an act that history names is
        // not held, this verifier cannot tell what the collective owes
        // before its line: the closing is unknown for it, never complete and
        // never "not complete" (F304, F298; Fable's step-15 review, A3).
        if let Some(m) = self.line_missing(&col, &cline).first() {
            return Err(AgreementsError::Missing(*m));
        }
        let signer = h.act.outside.signer.ok_or(AgreementsError::Check("a closing act has a signer"))?;
        e.signed = self.ending_signed(&c.collective, id, &voices);
        if let Some(y) = self.ending_sigs(&c.collective).no_ending.get(id) {
            return fail(e, &format!("no closing: its signer signed another ending of the collective, {}, earlier on their own chain, and the closing does not name it in its objects (F132, U4b)", y.iter().map(|b| format!("{b:02x}")).collect::<String>()));
        }
        e.holds = self.holdings(&col, &cline)?;
        e.open_debts = self.open_debts(&col, Some(&cline))?;
        if !voices.contains(&signer) {
            return fail(e, "the closing act is signed by someone who is not a member whose voice remains");
        }
        if !e.signed.contains(&signer) {
            return fail(e, "the closing's signer signs it too, by a chain signature with their chain key (F132)");
        }
        if !self.ending_rule_met(&col, id, &c.agreement, &t, &voices, &e.signed, &cline)? {
            return fail(e, "a closing follows the constitutional change rule, every member by default (N9), a rule by share counted at the closing's line (F330), each signing by a chain signature with their chain key (F132)");
        }
        if !e.holds.is_empty() {
            return fail(e, "a closing ends only a collective that holds nothing: every work sold or released (N9)");
        }
        if !e.open_debts.is_empty() {
            return fail(
                e,
                "a collective cannot close while it owes anything: every debt paid or released by its creditor (F125, D5); one that cannot pay stays open, its debts visible",
            );
        }
        // F189 (7): money owed back from a broken stretch is a debt for
        // "owes nothing", whatever the closing's line; save what the
        // closing names in field 4 as left open: owed to nobody (QG1,
        // F191), or to a payer who gave no address, after a notice sealed
        // to them whose deadline lapsed (F197).
        let owed = self.owed_back(&c.collective)?;
        let mut blocking = 0usize;
        for o in &owed {
            let mut of: Vec<Hash> = vec![o.payment];
            of.extend(self.same_payment(&o.payment).into_iter().map(|(h, _)| h));
            let named = c.open.iter().find(|x| of.contains(&x.payment));
            let left_open = match (&o.to, named) {
                (crate::money::RefundTo::Nobody, Some(_)) => true,
                (crate::money::RefundTo::Identity(payer), Some(x)) => x.notice.is_some_and(|n| self.notice_lapsed(&n, &c.collective, Some(payer), &of)),
                // F208 (decided 10 October 2026): a one-time key is noticed
                // too, and never blocks a closing for good. The notice is
                // public, naming the payment (mechanic, the build's: a bare
                // signing key cannot be sealed to, so its holder finds the
                // notice by looking; the cost to the payer's privacy, the
                // key linked to this collective, is stated).
                (crate::money::RefundTo::Key(_), Some(x)) => x.notice.is_some_and(|n| self.notice_lapsed(&n, &c.collective, None, &of)),
                _ => false,
            };
            if !left_open {
                blocking += 1;
            }
        }
        if blocking > 0 {
            return fail(
                e,
                &format!("a collective cannot close while money from its broken stretch is owed back: {blocking} payment(s) not yet settled, nor left open as the rules allow (rule 37d, RB2; F189, 7; QG1, F191; F197)"),
            );
        }
        e.complete = true;
        Ok(e)
    }

    /// The act that ended a collective in Agreements, if any (rule 47a): its one
    /// complete fork or closing that counts. A complete ending is final
    /// (F131, IT1): a later ending of the same collective, one that names it
    /// (`ending_knows`: in its `objects`, or through a signer's chain,
    /// F132 U1), counts for nothing. Two complete endings sharing no signer
    /// and neither naming the other are concurrent, made without knowing
    /// each other: neither counts (F125 reading 4, narrowed by F131 and
    /// F132 to that case), until an ending naming both settles the race
    /// (U2, confirmed, F132). Two endings each naming the other, through
    /// two signers' chains, are not ordered either.
    pub fn closed_by(&self, collective: &Hash) -> R<Option<Closed>> {
        // Judging a fork or closing asks for the consent of acts of the same
        // collective (its signature on a release, say), made before its line:
        // while it is judged, nothing has ended it yet (F143: an ending is
        // judged on its own history, whenever a verifier asks, so the
        // guard comes before the cache).
        if self.ending.borrow().contains(collective) {
            return Ok(None);
        }
        if let Some(e) = self.closed.borrow().get(collective) {
            return Ok(e.clone());
        }
        if self.own_attempts_open() {
            let e = self.binding(|v| v.closed_by(collective));
            if let Ok(x) = &e {
                self.closed.borrow_mut().insert(*collective, x.clone());
            }
            return e;
        }
        self.ending.borrow_mut().insert(*collective);
        let e = self.closed_by_inner(collective);
        self.ending.borrow_mut().remove(collective);
        let e = e?;
        self.closed.borrow_mut().insert(*collective, e.clone());
        Ok(e)
    }

    /// Every complete fork and closing of a collective.
    pub fn endings(&self, collective: &Hash) -> R<Vec<Closed>> {
        let mut out = vec![];
        for x in self.v.held_acts() {
            if self.is_agreements(x, types::FORK) {
                if !Fork::decode(&x.inside).is_ok_and(|f| &f.collective == collective) {
                    continue;
                }
                let e = self.fork(&x.id)?;
                if e.complete {
                    out.push(Closed { by: x.id, line: Self::cites(x, &e.fork.collective), fork: Some(e) });
                }
            } else if self.is_agreements(x, types::CLOSING) {
                if !Closing::decode(&x.inside).is_ok_and(|c| &c.collective == collective) {
                    continue;
                }
                let e = self.closing(&x.id)?;
                if e.complete {
                    out.push(Closed { by: x.id, line: Self::cites(x, &e.closing.collective), fork: None });
                }
            }
        }
        Ok(out)
    }

    fn closed_by_inner(&self, collective: &Hash) -> R<Option<Closed>> {
        let all = self.endings(collective)?;
        let knows: Vec<BTreeSet<Hash>> = all.iter().map(|e| self.ending_knows(collective, &e.by)).collect();
        // An ending is ordered against every other complete one when it
        // names it or is named by it; those form one line, and the earliest
        // of them is the one that counts: every later one names it, and
        // counts for nothing (F131, IT1). Where none is ordered against all
        // the others, some two are concurrent, and none counts.
        let ordered: Vec<usize> = (0..all.len())
            .filter(|i| (0..all.len()).all(|j| j == *i || knows[*i].contains(&all[j].by) || knows[j].contains(&all[*i].by)))
            .collect();
        let first = ordered.iter().copied().find(|i| !ordered.iter().any(|j| j != i && knows[*i].contains(&all[*j].by)));
        Ok(first.map(|i| all[i].clone()))
    }

    /// The forks and closings of a collective that an ending act names,
    /// directly or through the endings it names (F131, IT1): an `objects`
    /// entry whose predecessor is another fork or closing of the same
    /// collective, `[agreement, ending]`, its chain the agreement; or,
    /// through a signer's own chain (F132, U1), another ending the same
    /// member signed earlier in their identity chain. A later ending names
    /// every earlier one it holds (client conformance). Acts are immutable;
    /// two endings may still name each other through two signers' chains,
    /// and then neither is the earlier.
    pub fn ending_knows(&self, collective: &Hash, ending: &Hash) -> BTreeSet<Hash> {
        let sigs = self.ending_sigs(collective);
        closure(&sigs.names, ending)
    }

    /// The forks and closings of a collective an ending names in its own
    /// `objects`, directly.
    pub fn ending_objects(&self, collective: &Hash, ending: &Hash) -> BTreeSet<Hash> {
        let mut out = BTreeSet::new();
        let Some(h) = self.v.get(ending) else { return out };
        for o in h.inside.objects.iter().flatten() {
            let p = o.predecessor;
            if p == *ending {
                continue;
            }
            let Some(ph) = self.v.get(&p) else { continue };
            let of_this = (self.is_agreements(ph, types::FORK) && Fork::decode(&ph.inside).is_ok_and(|f| &f.collective == collective))
                || (self.is_agreements(ph, types::CLOSING) && Closing::decode(&ph.inside).is_ok_and(|c| &c.collective == collective));
            if of_this {
                out.insert(p);
            }
        }
        out
    }

    /// The members who signed an ending, among `among`, in that order: each
    /// by a chain signature that counts (F132, U1 refined), not made void
    /// by U4.
    pub fn ending_signed(&self, collective: &Hash, ending: &Hash, among: &[Hash]) -> Vec<Hash> {
        let sigs = self.ending_sigs(collective);
        among.iter().filter(|m| sigs.counting.contains_key(&(*ending, **m))).copied().collect()
    }

    /// A collective's ending signatures, judged (F132).
    ///
    /// Every chain signature (Identity type 16) naming a fork or closing of
    /// the collective that counts in its signer's identity chain is read, at
    /// its position there. Then U4: a signature counts for nothing where it
    /// lies, in its signer's chain, after the signer's signature on another
    /// ending naming the one it signs. "Names" is judged in two steps, so
    /// that no signature both judges and is judged (reading, to confirm):
    /// first by `objects`; then, among the signatures left, through
    /// signers' chains (U1). The endings named through signers' chains are
    /// read from the signatures left after both steps.
    pub fn ending_sigs(&self, collective: &Hash) -> Rc<EndingSigs> {
        if let Some(s) = self.ending_sigs.borrow().get(collective) {
            return s.clone();
        }
        let s = Rc::new(self.ending_sigs_inner(collective));
        self.ending_sigs.borrow_mut().insert(*collective, s.clone());
        s
    }

    fn ending_sigs_inner(&self, collective: &Hash) -> EndingSigs {
        let endings: BTreeSet<Hash> = self.ending_acts(collective).into_iter().collect();
        let mut raw: BTreeMap<(Hash, Hash), (Hash, u64)> = BTreeMap::new();
        for x in self.v.held_acts() {
            if x.inside.spec != self.mirs.identity || x.inside.type_ != crate::identity::types::CHAIN_SIGNATURE {
                continue;
            }
            let (Some(Ok(Payload::ChainSignature(c))), Some(signer)) = (&x.identity, x.act.outside.signer) else {
                continue;
            };
            if !endings.contains(&c.signs) {
                continue;
            }
            let Some(p) = self.v.resolve(&signer).position_of(&x.id) else { continue };
            // F153: a member's chain signature counting only through the
            // verifier's own attempts is left aside (the ending is then
            // judged unknown by `binding`).
            if self.refuses(&x.id) {
                continue;
            }
            let p = p as u64;
            let e = raw.entry((c.signs, signer)).or_insert((x.id, p));
            if p < e.1 {
                *e = (x.id, p);
            }
        }
        let objects: BTreeMap<Hash, BTreeSet<Hash>> =
            endings.iter().map(|e| (*e, self.ending_objects(collective, e))).collect();
        // U4b: an ending's drafter names, in its `objects`, every ending of
        // the collective they signed earlier on their own chain; otherwise
        // it is no ending, and its signatures count for nothing.
        let mut no_ending = BTreeMap::new();
        for e in &endings {
            let Some(d) = self.v.get(e).and_then(|h| h.act.outside.signer) else { continue };
            let Some((_, p)) = raw.get(&(*e, d)) else { continue };
            let named = closure(&objects, e);
            if let Some(((y, _), _)) = raw.iter().find(|((y, m), (_, q))| *m == d && y != e && q < p && !named.contains(y)) {
                no_ending.insert(*e, *y);
            }
        }
        raw.retain(|(e, _), _| !no_ending.contains_key(e));
        let objects: BTreeMap<Hash, BTreeSet<Hash>> = objects
            .into_iter()
            .filter(|(e, _)| !no_ending.contains_key(e))
            .map(|(e, s)| (e, s.into_iter().filter(|x| !no_ending.contains_key(x)).collect()))
            .collect();
        // Whether, in `sigs`, the signer of (x, m) signed an ending naming x
        // (in `names`, transitively) earlier in their chain: that ending.
        let voided = |sigs: &BTreeMap<(Hash, Hash), (Hash, u64)>, names: &BTreeMap<Hash, BTreeSet<Hash>>| {
            let mut out = BTreeMap::new();
            for ((x, m), (cs, p)) in sigs {
                let by = sigs
                    .iter()
                    .find(|((y, m2), (_, q))| m2 == m && y != x && q < p && closure(names, y).contains(x))
                    .map(|((y, _), _)| *y);
                if let Some(y) = by {
                    out.insert((*x, *m), (*cs, y));
                }
            }
            out
        };
        let through_chains = |sigs: &BTreeMap<(Hash, Hash), (Hash, u64)>| {
            let mut names = objects.clone();
            for ((y, m), (_, q)) in sigs {
                for ((x, m2), (_, p)) in sigs {
                    if m2 == m && x != y && p < q {
                        names.entry(*y).or_default().insert(*x);
                    }
                }
            }
            names
        };
        let mut void = voided(&raw, &objects);
        let mut left: BTreeMap<_, _> = raw.iter().filter(|(k, _)| !void.contains_key(k)).map(|(k, v)| (*k, *v)).collect();
        let names = through_chains(&left);
        let more = voided(&left, &names);
        left.retain(|k, _| !more.contains_key(k));
        void.extend(more);
        let names = through_chains(&left);
        EndingSigs { counting: left, void, names, no_ending }
    }

    /// Whether an act of a collective counts as made after the fork or
    /// closing that ended it, and so counts for nothing in Agreements: that act.
    pub fn after_closing(&self, act: &Hash) -> R<Option<Hash>> {
        let x = self.held(act)?;
        // The collective the act names (rule 58), else its signer.
        let Some(c) = self.author(x) else { return Ok(None) };
        let Some(e) = self.closed_by(&c)? else { return Ok(None) };
        let col = self.col(&c);
        Ok((!self.before_line(&col, x, &e.line)).then_some(e.by))
    }


    /// Who takes a stake the original held, after its fork: each side's
    /// share of it, in millionths of the stake, as the fork names, else by
    /// default (F121). `None` where the original does not hold it.
    pub fn fork_transfer(&self, fork: &Hash, agreement: &Hash, index: u64) -> R<Option<Vec<u64>>> {
        let e = self.fork(fork)?;
        let t = self.terms(agreement)?;
        let Some(stake) = t.stakes.iter().flatten().nth(index as usize) else {
            return Ok(None);
        };
        let this = if t.is_collective() { self.collective_of(agreement)? } else { None };
        let held: u64 = stake
            .holders
            .iter()
            .filter(|(h, _)| h.resolve(this.as_ref()) == Some(e.fork.collective))
            .map(|(_, n)| n)
            .sum();
        if held == 0 {
            return Ok(None);
        }
        let sides = match e.fork.shares.iter().find(|s| &s.agreement == agreement && s.index == index) {
            Some(s) => s.shares.clone(),
            None => e.shares.clone(),
        };
        let by_side: Vec<(Hash, u64)> = e.fork.sides.iter().map(|s| s.successor).zip(sides).collect();
        Ok(Some(divide_fork(fork, held, &by_side)))
    }

    /// Who owes an obligation of a collective a fork closed: the successors
    /// the fork assigns it to, jointly where several (N13). A complete fork
    /// hands out everything in the history it cites (F127), so an obligation
    /// it does not assign lies outside that history and is void (the tie
    /// rule): nobody owes it (D1's joint liability withdrawn). A successor a
    /// later fork closed passes it on the same way (F125 reading 4, as
    /// adjusted in F126). `None` where its debtor is not closed by a fork.
    pub fn debtors(&self, obligation: &Hash) -> R<Option<Vec<Hash>>> {
        use crate::money::Payload as Fin;
        let x = self.held(obligation)?;
        if x.inside.spec != self.mirs.money {
            return Ok(None);
        }
        let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else {
            return Ok(None);
        };
        if !matches!(self.closed_by(&o.debtor)?, Some(Closed { fork: Some(_), .. })) {
            return Ok(None);
        }
        // An obligation that does not bind (outside the fork's history, the
        // tie rule; not done; not the collective's by its own rules) is owed
        // by nobody, whatever field 6 lists (rule 47a). Found by the Agreements
        // invariants (`docs/law-invariants.md`, IC5).
        if self.obligation_binds(obligation)? != Some(true) {
            return Ok(Some(vec![]));
        }
        let mut out: Vec<Hash> = vec![];
        let mut todo = vec![(o.debtor, 0u32)];
        while let Some((who, depth)) = todo.pop() {
            match self.closed_by(&who)? {
                Some(Closed { fork: Some(e), .. }) if depth < 64 => {
                    if let Some((_, sides)) = e.fork.debts.iter().find(|(d, _)| d == obligation) {
                        for i in sides.iter().rev() {
                            todo.push((e.fork.sides[*i as usize].successor, depth + 1));
                        }
                    }
                }
                _ => {
                    if !out.contains(&who) {
                        out.push(who);
                    }
                }
            }
        }
        Ok(Some(out))
    }

    /// What payments held pay toward an obligation (Money rule 15: valid
    /// routes ending at the creditor's payee pointer, each naming the
    /// obligation). A record naming a previous hop (receipt field 6, claim
    /// key 10) counts only where the route ending at it is valid (Money
    /// rule 24, [`Self::route_to`]); one naming none is a route of one hop. A receipt counts when it names the obligation, is
    /// received and signed by the creditor the obligation names (a receipt
    /// anyone else signs, the debtor's own among them, pays nothing; Agreements
    /// invariants, IC2), and:
    ///
    /// - has the rail's answer, valid (rule 4; [`Self::rail_valid`]): no
    ///   rail answer, nothing counted;
    /// - is in the debt's unit: 100 of another unit pay nothing;
    /// - was paid where the creditor's rules let it count for this debt
    ///   ([`Self::paid_where_it_counts`]: rules 12, 12a, 14, 14a and 15).
    ///
    /// Double entry (rule 10): a valid payer's claim counts on equal footing.
    /// Where the creditor signed no receipt for its rail proof, the claim
    /// alone shows the money arrived; where its receipt shows less, the
    /// greater amount counts. Either is shown as a disagreement on the
    /// receiver ([`Self::disagreements`]). Records of one payment are one
    /// count (rule 12): the creditor's receipts of one payment count once,
    /// at the greatest, and what is one payment is the rail Module's answer
    /// ([`Self::payments`]): `None` (unknown) where two records could be one
    /// payment and the answer for one of them is not stated. Where a claim and a receipt
    /// sharing a rail proof disagree in payee or in what the payment
    /// fulfils (F151, replacing F141's "neither counts"): on a rail binding
    /// payee and purpose, the payment's own commitment decides, so only the
    /// act carrying the rail's valid answer counts, and where both carry
    /// one (which a rail binding both cannot give) neither does; on a rail
    /// binding neither (field 13 of its specification, [`Self::rails`]), the payer's claim decides
    /// what the payment fulfils, and the receiver's contrary receipt counts
    /// for nothing, shown as a dispute on the receiver.
    pub fn paid_toward(&self, obligation: &Hash) -> Option<u64> {
        self.judged(|| self.paid_toward_if(obligation, &|_| true, false))
    }

    /// [`Self::paid_toward`], counting only the receipts and claims `relied`
    /// accepts (a closing's: those an act of the collective in its history
    /// acknowledges, or the collective's own; F303); with `placed`, a receipt
    /// so relied on is kept whatever its signer's later rotation disowned
    /// (F302), shown as a dispute.
    fn paid_toward_if(&self, obligation: &Hash, relied: &dyn Fn(&Held) -> bool, placed: bool) -> u64 {
        let standing = |r: &Held| self.money_counts(r) || (placed && matches!(self.status(&r.id), Status::Void | Status::Disputed));
        use crate::money::Payload as Fin;
        let o = match self.v.get(obligation).map(|o| (o, Fin::decode(o.inside.type_, &o.inside.payload))) {
            Some((x, Ok(Fin::Obligation(o)))) if x.inside.spec == self.mirs.money => o,
            _ => return 0,
        };
        let creditor = o.creditor;
        let counts = |id: &Hash, amount: &crate::money::Amount, proof: &[u8]| {
            amount.unit == o.amount.unit
                && self
                    .rail_valid
                    .get(id)
                    .is_some_and(|at| self.payment_counts_rec(&o.creditor, at, amount, (Some(id), proof), obligation))
        };
        let mut receipts: Vec<((Hash, Payment), u64)> = vec![];
        let mut claims: Vec<((Hash, Payment), u64)> = vec![];
        for r in self.v.held_acts() {
            if r.inside.spec != self.mirs.money {
                continue;
            }
            match Fin::decode(r.inside.type_, &r.inside.payload) {
                Ok(Fin::Receipt(rc))
                    if &rc.fulfils == obligation
                        && rc.payee == creditor
                        && self.author(r) == Some(creditor)
                        && relied(r)
                        && standing(r)
                        && counts(&r.id, &rc.amount, &rc.proof)
                        && !self.receipt_overruled(&rc)
                        && !self.shared_unresolved(&r.id, &rc.rail, &rc.proof, &rc.payee, &rc.fulfils, rc.batch.as_ref())
                        && (rc.previous.is_none() || self.route_to(&r.id).is_valid()) =>
                {
                    receipts.push(((rc.rail, self.record_payment(&r.id, &rc.proof)), rc.amount.value));
                }
                Ok(Fin::Claim(c))
                    if &c.fulfils == obligation
                        && c.payee == creditor
                        && self.payers_claim(r)
                        && relied(r)
                        && counts(&r.id, &c.amount, &c.proof)
                        && !self.claim_overruled(&c)
                        && !self.shared_unresolved(&r.id, &c.rail, &c.proof, &c.payee, &c.fulfils, None)
                        && (c.previous.is_none() || self.route_to(&r.id).is_valid()) =>
                {
                    claims.push(((c.rail, self.record_payment(&r.id, &c.proof)), c.amount.value));
                }
                _ => {}
            }
        }
        self.one_count(&receipts, &claims)
    }

    /// Money rule 12: receipts or claims of one payment that name different
    /// purposes or payees share it only under one batch they both name
    /// (receipt field 8; a claim names none); otherwise a verifier holding
    /// both counts neither, until the receiver signs a receipt that resolves
    /// them. Whether the record `id` (on `rail`, carrying `proof`, paying
    /// `payee` toward `fulfils`, under `batch`) is so held back: another
    /// standing record of its payment (a receipt signed by its payee, or a
    /// payer's claim) names another purpose or payee, is not already
    /// overruled under rule 11, and shares no batch with it; and the
    /// conflict is not resolved, as it is where the receiver of `id`'s
    /// payment has signed receipts of it, every receipt of the payment
    /// naming this purpose and payee. Whether two records are one payment
    /// is the rail's answer ([`Self::same_payment_of`]).
    fn shared_unresolved(&self, id: &Hash, rail: &Hash, proof: &[u8], payee: &Hash, fulfils: &Hash, batch: Option<&Hash>) -> bool {
        use crate::money::Payload as Fin;
        // (record, its payment proof, a receipt by its payee, same purpose and payee, overruled, batch)
        let mut records: Vec<(Hash, Vec<u8>, bool, bool, bool, Option<Hash>)> = vec![];
        for h in self.v.held_acts() {
            if h.inside.spec != self.mirs.money || &h.id == id {
                continue;
            }
            // A receipt rule 11 overrules still speaks for its receiver in
            // resolving; it puts no purpose of its own against `id`.
            match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Receipt(rc)) if &rc.rail == rail && self.author(h) == Some(rc.payee) && self.money_counts(h) => {
                    let o = self.receipt_overruled(&rc);
                    records.push((h.id, rc.proof, true, &rc.payee == payee && &rc.fulfils == fulfils, o, rc.batch));
                }
                Ok(Fin::Claim(c)) if &c.rail == rail && self.payers_claim(h) => {
                    let o = self.claim_overruled(&c);
                    records.push((h.id, c.proof, false, &c.payee == payee && &c.fulfils == fulfils, o, None));
                }
                _ => {}
            }
        }
        // Only the pairs the answer depends on are asked (rule 12): first
        // whether a record naming another purpose is this payment; only
        // then whether the receiver's receipts of it resolve the conflict.
        let one = |x: &Hash, p: &[u8]| self.same_payment_of((Some(x), p), (Some(id), proof));
        let conflict = records.iter().any(|(x, p, _, same, o, b)| !same && !o && !(batch.is_some() && batch == b.as_ref()) && one(x, p));
        if !conflict {
            return false;
        }
        let receipts: Vec<bool> = records.iter().filter(|(x, p, r, _, _, _)| *r && one(x, p)).map(|(_, _, _, same, _, _)| *same).collect();
        let receiver_signed = receipts.iter().any(|s| *s);
        !(receiver_signed && receipts.iter().all(|s| *s))
    }

    /// Money rules 10 to 12 over the records counted toward one purpose:
    /// receipts and claims grouped by payment (one rail, one payment as its
    /// rail Module says), each payment counting once: its greatest receipt,
    /// or its greatest claim where that is more (the greater amount counts
    /// until the receiver signs a receipt matching it). Notes the answer
    /// unknown, under [`Self::judged`], where it depends on whether two
    /// records whose payment is not stated are one payment.
    pub(super) fn one_count(&self, receipts: &[((Hash, Payment), u64)], claims: &[((Hash, Payment), u64)]) -> u64 {
        let mut payments: Vec<((Hash, Payment), u64, u64)> = vec![];
        for (k, v, is_receipt) in receipts.iter().map(|(k, v)| (k, *v, true)).chain(claims.iter().map(|(k, v)| (k, *v, false))) {
            let at = match payments.iter().position(|(p, _, _)| self.same_on_rail(p, k)) {
                Some(i) => i,
                None => {
                    payments.push((k.clone(), 0, 0));
                    payments.len() - 1
                }
            };
            let slot = if is_receipt { &mut payments[at].1 } else { &mut payments[at].2 };
            *slot = (*slot).max(v);
        }
        payments.iter().map(|(_, r, c)| (*r).max(*c)).fold(0u64, u64::saturating_add)
    }

    /// Money rules 12, 12a, 14, 14a and 15 for one payment to `payee`,
    /// paid at `at` (the rail's answer), with rail proof `proof`, toward
    /// `fulfils` (an obligation owed to the payee, an agreement, an offer,
    /// or a payee pointer of its for a tip).
    ///
    /// - **It follows the chain as published** at a link of the payee's
    ///   chain ([`Self::follows_at`]): paid to the flow, the pointer stood
    ///   there, on the unbroken chain (rule 12), the version the payee's own
    ///   acts as they stood there select is that one or later (rule 14), and
    ///   the vault in force there lets it go to the flow (rule 14a); paid to
    ///   the vault, the entry is still in the vault there.
    /// - **A lock change** (F178, F181) is a rotation after which a payment
    ///   that followed the chain as published immediately before it no
    ///   longer follows it. Where none affects it, the payment counts if it
    ///   follows the chain now.
    /// - **Rule 15** ([`crate::money::rule_15`]): where lock changes
    ///   affect it, it counts where each that is anchored (its home quorum
    ///   anchored on the clock declared before it, [`Self::anchored`]) is
    ///   answered by the payee's own receipt, valid now, or by a payer's
    ///   claim anchored by its point. An unanchored one leaves it counting:
    ///   the owner bears.
    ///
    /// The version a payment counting under rule 15 was paid under is
    /// selected from the payee's acts as they stood before the lock change,
    /// those it voided included (F178); now, an act a rotation did not keep
    /// holds no pointer and selects no version (rule 15, F178), and its
    /// receipt is no receipt.
    ///
    /// `None` (unknown) only where it depends on whether two records whose
    /// payment is not stated are one payment (Money rule 12; [`Self::judged`]).
    pub fn payment_counts(&self, payee: &Hash, at: &crate::money::PaidAt, amount: &crate::money::Amount, proof: &[u8], fulfils: &Hash) -> Option<bool> {
        self.judged(|| self.payment_counts_rec(payee, at, amount, (None, proof), fulfils))
    }

    /// [`Self::payment_counts`] for a payment that a held receipt or claim
    /// `rec.0` carries: compared with other records as that record, so that
    /// it is always its own payment, whatever the rail's answer states; and
    /// counting only where the rail Module that record names is named where
    /// it was paid (Money rule 4, [`Self::rail_named_at`]).
    pub(super) fn payment_counts_rec(&self, payee: &Hash, at: &crate::money::PaidAt, amount: &crate::money::Amount, rec: (Option<&Hash>, &[u8]), fulfils: &Hash) -> bool {
        use crate::money as fin;
        let proof = rec.1;
        if rec.0.is_some_and(|id| !self.rail_named_at(id, at)) {
            return false;
        }
        // Money rule 4: the pointer is the payee's own.
        if let fin::PaidAt::Flow(p) = at {
            let other = self.v.get(p).filter(|h| h.inside.spec == self.mirs.money).and_then(|h| match fin::Payload::decode(h.inside.type_, &h.inside.payload) {
                Ok(fin::Payload::PayeePointer(q)) if &q.payee != payee => Some(q.payee),
                _ => None,
            });
            // Paid to another identity's pointer, it counts for that
            // identity, never for the payee (Money rule 4).
            if other.is_some() {
                return false;
            }
        }
        let res = self.v.resolve(payee);
        // F153: not past a link counting only through own attempts.
        let n = res.links.iter().take_while(|l| !self.refuses(&l.act)).count();
        if n == 0 {
            return false;
        }
        let follows: Vec<bool> = (0..n).map(|j| self.follows_at(payee, at, amount, fulfils, j)).collect();
        let changes: Vec<usize> = (1..n).filter(|&k| follows[k - 1] && !follows[k]).collect();
        if changes.is_empty() {
            return follows[n - 1];
        }
        let changes: Vec<fin::LockChange> = changes
            .into_iter()
            .map(|k| fin::LockChange {
                rotation: res.links[k].act,
                clock: self.clock_at(payee, k - 1),
                // A counting rotation always has a quorum; were none read,
                // no receipt supports it, so it has no point.
                quorum: self.v.quorum(payee, &res.links[k].act).unwrap_or(crate::chain::Quorum::Homes { need: 1, supports: vec![] }),
            })
            .collect();
        let receipt = self.receipts_for(rec).iter().any(|(_, r)| &r.payee == payee);
        let claims = fin::PaymentClaims {
            valid: self.claims_of_payment(rec, |id| self.rail_valid.contains_key(id)),
            pending: self.claims_of_payment(rec, |id| self.rail_pending.contains(id) && !self.rail_valid.contains_key(id) && !self.rail_invalid.contains(id)),
        };
        let rail = self.rail_of_proof(proof);
        let sees = |r: &crate::envelopes::anchoring::Reference| rail.is_some_and(|x| self.rail_clocks.contains(&(r.cmip, x)));
        fin::rule_15_by(&changes, receipt, &claims, &self.anchored, &sees)
    }

    /// Money rule 4, first condition: a held receipt or claim `id` counts
    /// only where the rail Module its field 0 names is named where it was
    /// paid, `at`: by a rail of the payee pointer (a grantee's included),
    /// by the vault entry, or by the refund rail (key 7) of the claim it
    /// was paid at; one naming any other rail Module counts for nothing,
    /// whatever its rail's proof shows. *The rail's answer names the
    /// pointer, not which of its rails: of a pointer, one of its rails
    /// naming that Module is all the view can check (the payment cMIP
    /// checks the very rail, `paid-to`).* Where `at` names no act the view
    /// can read so, the other conditions decide.
    fn rail_named_at(&self, id: &Hash, at: &crate::money::PaidAt) -> bool {
        use crate::money::{self as fin, PaidAt, Payload as Fin};
        let rail = match self.v.get(id).map(|h| Fin::decode(h.inside.type_, &h.inside.payload)) {
            Some(Ok(Fin::Receipt(r))) => r.rail,
            Some(Ok(Fin::Claim(c))) => c.rail,
            _ => return true,
        };
        let money_act = |x: &Hash| self.v.get(x).filter(|h| h.inside.spec == self.mirs.money).and_then(|h| Fin::decode(h.inside.type_, &h.inside.payload).ok());
        match at {
            PaidAt::Flow(p) => match money_act(p) {
                Some(Fin::PayeePointer(q)) => q.rails.iter().any(|r| r.module == rail),
                Some(Fin::Claim(c)) => c.refund.is_none_or(|r| r.module == rail),
                _ => true,
            },
            PaidAt::VaultEntry(d, i) => {
                let Some(h) = self.v.get(d) else { return true };
                // A genesis is its own identity; a rotation names it as signer.
                let res = self.v.resolve(&h.act.outside.signer.unwrap_or(*d));
                let Some(k) = res.position_of(d) else { return true };
                match fin::vault_in(&self.mirs.money, &res.states[k].declarations) {
                    Ok(Some(Some(entries))) => entries.get(*i as usize).is_none_or(|e| e.rail_module == rail),
                    _ => true,
                }
            }
        }
    }


    /// Whether a held receipt or claim counts for its payee where the rail
    /// answered it paid (Money rules 4, 12 to 15; [`Self::payment_counts`]),
    /// read from the record: its payee, amount, proof and what it follows,
    /// and where the rail's answer says it was paid. `None` where the rail
    /// has not answered it valid, or where the answer rests on whether two
    /// records whose payment is not stated are one payment (Money rule 12).
    pub fn record_counts(&self, id: &Hash) -> Option<bool> {
        use crate::money::Payload as Fin;
        let x = self.v.get(id)?;
        if x.inside.spec != self.mirs.money {
            return None;
        }
        let (payee, amount, proof, fulfils) = match Fin::decode(x.inside.type_, &x.inside.payload).ok()? {
            Fin::Receipt(r) => (r.payee, r.amount, r.proof, r.fulfils),
            Fin::Claim(c) => (c.payee, c.amount, c.proof, c.fulfils),
            _ => return None,
        };
        let at = self.rail_valid.get(id)?;
        self.judged(|| self.payment_counts_rec(&payee, at, &amount, (Some(id), &proof), &fulfils))
    }

    /// The lock changes affecting a payment, by rotation (Money rule 15,
    /// F181): each rotation of the payee's chain after which the payment
    /// that followed the chain as published immediately before it no longer
    /// follows it. For a client showing why a payment needs an anchor.
    pub fn lock_changes(&self, payee: &Hash, at: &crate::money::PaidAt, amount: &crate::money::Amount, fulfils: &Hash) -> Vec<Hash> {
        let res = self.v.resolve(payee);
        let n = res.links.iter().take_while(|l| !self.refuses(&l.act)).count();
        let follows: Vec<bool> = (0..n).map(|j| self.follows_at(payee, at, amount, fulfils, j)).collect();
        (1..n).filter(|&k| follows[k - 1] && !follows[k]).map(|k| res.links[k].act).collect()
    }

    /// Whether a payment follows the payee's chain as published at its link
    /// `j` (Money rule 15: "the chain as published"): rules 12, 14 and 14a
    /// read on the payee's acts as they stood there ([`Self::stood_at`]).
    fn follows_at(&self, payee: &Hash, at: &crate::money::PaidAt, amount: &crate::money::Amount, fulfils: &Hash, j: usize) -> bool {
        use crate::money::{self as fin, PaidAt, Payload as Fin};
        let vault = self.vault_at(payee, j);
        let vault = (!vault.is_empty()).then_some(vault.as_slice());
        let same = |a: &fin::VaultEntry, b: &fin::VaultEntry| a.unit == b.unit && a.rail_module == b.rail_module && a.source == b.source;
        let res = self.v.resolve(payee);
        match at {
            // Money rule 4: a refund paid to the refund rail the payer's own
            // claim names (key 7), that claim standing there, bounded by the
            // vault there (rules 3 and 17).
            PaidAt::Flow(c) if self.v.get(c).is_some_and(|x| x.inside.spec == self.mirs.money && matches!(Fin::decode(x.inside.type_, &x.inside.payload), Ok(Fin::Claim(cl)) if cl.refund.is_some())) => {
                self.stood_at(c, &res, j) && fin::flow_followed_vault(vault, amount)
            }
            PaidAt::Flow(p) => {
                let chain = self.pointers_at(payee, j);
                let Some((_, q)) = chain.iter().find(|(i, _)| i == p) else { return false };
                if !fin::pointer_counts(&chain, p) {
                    return false;
                }
                // A tip: the payee pointer it follows, the payee's own act.
                let tip = self.v.get(fulfils).filter(|x| x.inside.spec == self.mirs.money).and_then(|x| match Fin::decode(x.inside.type_, &x.inside.payload) {
                    Ok(Fin::PayeePointer(t)) if &t.payee == payee && self.author(x).as_ref() == Some(payee) => Some(t),
                    _ => None,
                });
                // QG2: money owed back, where the payer's own acts on the
                // payment hold no pointer, goes to the payer's pointer in
                // force (not the vault alone, as for a debt).
                let refund = self
                    .v
                    .get(fulfils)
                    .is_some_and(|x| x.inside.spec == self.mirs.money && matches!(x.inside.type_, fin::types::RECEIPT | fin::types::CLAIM));
                let r14 = match tip {
                    Some(t) => self.stood_at(fulfils, &res, j) && fin::counts_toward(t.version, fin::PaidInto::Flow(q.version)),
                    None => match self.pointer_holding_at(fulfils, payee, Some(j)) {
                        Some(h) if refund && h.pointers.is_empty() && h.complete => {
                            let all: Vec<Hash> = chain.iter().map(|(i, _)| *i).collect();
                            fin::select_pointer(&all, &chain).is_some_and(|(_, v)| fin::counts_toward(v, fin::PaidInto::Flow(q.version)))
                        }
                        Some(h) => fin::rule_14(&h, &chain, q.version) == fin::Rule14::Counts,
                        None => false,
                    },
                };
                r14 && fin::flow_followed_vault(vault, amount)
            }
            PaidAt::VaultEntry(d, i) => {
                // The act declaring it, if it is a link of the payee's
                // chain declaring a vault; otherwise the vault entry is the
                // rail answer's, as before any lock change.
                let Some(k) = res.position_of(d) else { return true };
                let Ok(Some(Some(declared))) = fin::vault_in(&self.mirs.money, &res.states[k].declarations) else { return true };
                if k > j {
                    return false;
                }
                let now = vault.unwrap_or(&[]);
                declared.get(*i as usize).is_some_and(|e| now.iter().any(|x| same(x, e)))
            }
        }
    }

    /// Whether an act of the payee's stood at its chain's link `j`: bound
    /// at that link or before it, and valid then: valid now, or voided (or
    /// voided and shown as disputed) only by a rotation after `j`.
    fn stood_at(&self, id: &Hash, res: &crate::chain::Resolution, j: usize) -> bool {
        let Some(h) = self.v.get(id) else { return false };
        if !h.act.outside.binding.and_then(|b| res.position_of(&b)).is_some_and(|k| k <= j) {
            return false;
        }
        match self.status(id) {
            Status::Valid | Status::Scoped => self.valid(id),
            Status::Void | Status::Disputed => self.v.judged_by(id).and_then(|r| res.position_of(&r)).is_some_and(|k| k > j),
            _ => false,
        }
    }

    /// The payee's pointers as they stood at its chain's link `j` (Money
    /// rule 15): bound there or before, valid then ([`Self::stood_at`]); for
    /// a collective, those its Money lane's consent carries. *A payment is
    /// judged against the chain the payer could see: a pointer the owner
    /// published after a rotation, of the same version as a thief's, is no
    /// fork of it before that rotation.*
    fn pointers_at(&self, payee: &Hash, j: usize) -> Vec<(Hash, crate::money::PayeePointer)> {
        use crate::money::{self as fin, Payload as Fin};
        let res = self.v.resolve(payee);
        let mut out = vec![];
        for h in self.payees_acts(payee) {
            if h.inside.spec != self.mirs.money || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(q)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if &q.payee == payee && self.stood_at(&h.id, &res, j) && (self.status(&h.id) != Status::Valid || self.consent(&h.id).is_ok_and(|c| c.counts())) {
                out.push((h.id, q));
            }
        }
        out
    }

    /// The payee's pointer acts that the payee's own acts hold, for what a
    /// payment or a debt follows (Money rules 14 and 15, F145, F155):
    ///
    /// - an obligation owed to `payee`: from the payee's signature act on
    ///   the agreement it names (field 4, Agreements type 1, signed by the payee),
    ///   or the offer it names where the payee signed it (Agreements type 6); with
    ///   neither, as for an IOU naming no agreement (field 4 absent), from
    ///   the payee's own acts acknowledging the obligation (`acks`): until
    ///   one does, none, and the debt counts only if paid to the vault;
    /// - an agreement (Agreements type 0): from the payee's signature acts on it;
    /// - an offer (Agreements type 6): the offer itself, where the payee signed it.
    ///
    /// Each such act counts only while valid under Identity: an act a
    /// rotation did not keep holds no pointer (rule 15, F178). Where the
    /// payee has several, what any of them holds counts (the latest is
    /// taken). What an act holds is what its citations reach through the
    /// payee's own acts only, never through an act another identity signed
    /// (F157, [`crate::money::holds_own`]), and never a hash in a
    /// payload. `None` where `fulfils` is none of these, or an obligation
    /// owed to another. *The vault is not here: it applies as the payee's
    /// chain declares it (rule 14a; F160 withdrawn, F164, F169).*
    pub fn pointer_holding(&self, fulfils: &Hash, payee: &Hash) -> Option<crate::money::Holding> {
        self.pointer_holding_at(fulfils, payee, None)
    }

    /// [`Self::pointer_holding`], with the payee's acts as they stood at its
    /// chain's link `j` where given ([`Self::stood_at`]): for a payment that
    /// followed the chain as published there, those a later rotation voided
    /// included (rule 15, F178).
    fn pointer_holding_at(&self, fulfils: &Hash, payee: &Hash, j: Option<usize>) -> Option<crate::money::Holding> {
        use crate::money::{self as fin, Payload as Fin};
        let res = self.v.resolve(payee);
        let ok = |a: &Hash| match j {
            None => self.valid(a),
            Some(j) => self.stood_at(a, &res, j),
        };
        let x = self.v.get(fulfils)?;
        let mut complete = true;
        // A payment of a price tag (Money rule 17): the payee's own acts are
        // the tag, where the payee signed it, and its signature acts on the
        // publication the tag names; a tag another identity signed is not
        // the payee's act.
        if x.inside.spec == self.mirs.money {
            if let Ok(Fin::PriceTag(t)) = Fin::decode(x.inside.type_, &x.inside.payload) {
                let mut acts: Vec<Hash> = vec![];
                if self.author(x).as_ref() == Some(payee) && ok(fulfils) {
                    acts.push(*fulfils);
                }
                if let fin::Priced::Publication(p) = t.priced {
                    for v in self.pub_versions(&p).into_iter().map(|(v, _)| v) {
                        acts.extend(self.payees_acts_on(&v, payee, &ok).unwrap_or_default());
                    }
                }
                return Some(self.holding_through(&acts, payee, complete));
            }
        }
        let acts: Vec<Hash> = if x.inside.spec == self.mirs.money {
            let o = match Fin::decode(x.inside.type_, &x.inside.payload) {
                Ok(Fin::Obligation(o)) => o,
                // QG2 (decided 9 October 2026): money owed back on a
                // payment, `fulfils` one receipt or claim of it, is repaid
                // as a debt to its payer, by the pointer the payer's own
                // acts on that payment hold: its claims for it, and its acts
                // acknowledging any receipt or claim of it.
                Ok(Fin::Receipt(_)) | Ok(Fin::Claim(_)) => {
                    let mut of: Vec<Hash> = vec![*fulfils];
                    of.extend(self.same_payment(fulfils).into_iter().map(|(h, _)| h));
                    let acts: Vec<Hash> = self
                        .v
                        .signed_by(payee)
                        .filter(|h| {
                            ok(&h.id)
                                && ((of.contains(&h.id) && h.inside.spec == self.mirs.money && h.inside.type_ == fin::types::CLAIM)
                                    || h.inside.acks.iter().flatten().any(|a| of.contains(a)))
                        })
                        .map(|h| h.id)
                        .collect();
                    let mut pointers = vec![];
                    for a in acts {
                        let Some(h) = self.v.get(&a) else { continue };
                        let held = fin::holds_own(self.v, fin::cites(&h.inside), payee);
                        complete &= held.complete;
                        for p in held.acts {
                            let Some(y) = self.v.get(&p) else { continue };
                            if y.inside.spec == self.mirs.money
                                && y.inside.type_ == fin::types::PAYEE_POINTER
                                && self.author(y).as_ref() == Some(payee)
                                && !pointers.contains(&p)
                            {
                                pointers.push(p);
                            }
                        }
                    }
                    return Some(fin::Holding { pointers, complete });
                }
                _ => return None,
            };
            if &o.creditor != payee {
                return None;
            }
            let mut acts = match &o.agreement {
                None => vec![],
                Some(a) => match self.payees_acts_on(a, payee, &ok) {
                    Some(acts) => acts,
                    None => {
                        // What field 4 names is not held, or is no
                        // agreement or offer: whether the payee signed it
                        // cannot be told.
                        complete &= self.v.get(a).is_some();
                        vec![]
                    }
                },
            };
            if acts.is_empty() {
                acts = self
                    .v
                    .signed_by(payee)
                    .filter(|h| h.inside.acks.iter().flatten().any(|a| a == fulfils) && ok(&h.id))
                    .map(|h| h.id)
                    .collect();
            }
            acts
        } else {
            self.payees_acts_on(fulfils, payee, &ok)?
        };
        Some(self.holding_through(&acts, payee, complete))
    }

    /// The payee pointers the payee's own acts `acts` hold (Money rule 17),
    /// through the payee's own acts only.
    fn holding_through(&self, acts: &[Hash], payee: &Hash, mut complete: bool) -> crate::money::Holding {
        use crate::money::{self as fin, Payload as Fin};
        let mut pointers = vec![];
        for a in acts {
            let Some(h) = self.v.get(a) else { continue };
            let held = fin::holds_own(self.v, fin::cites(&h.inside), payee);
            complete &= held.complete;
            for p in held.acts {
                let Some(y) = self.v.get(&p) else { continue };
                if y.inside.spec == self.mirs.money
                    && y.inside.type_ == fin::types::PAYEE_POINTER
                    && self.author(y).as_ref() == Some(payee)
                    && matches!(Fin::decode(y.inside.type_, &y.inside.payload), Ok(Fin::PayeePointer(q)) if &q.payee == payee)
                    && !pointers.contains(&p)
                {
                    pointers.push(p);
                }
            }
        }
        fin::Holding { pointers, complete }
    }

    /// The payee's own acts on an agreement or publication `a` (Money rule
    /// 17): its signature acts naming it (Agreements type 1); for a
    /// publication (type 6), the publication itself where the payee drafted
    /// it. Each where `ok` says it stands. `None` where `a` is not held, or
    /// is neither.
    fn payees_acts_on(&self, a: &Hash, payee: &Hash, ok: &dyn Fn(&Hash) -> bool) -> Option<Vec<Hash>> {
        let x = self.v.get(a)?;
        if !self.is_agreements(x, types::TERMS) && !self.is_agreements(x, types::PUBLICATION) {
            return None;
        }
        let mut out: Vec<Hash> = vec![];
        if self.is_agreements(x, types::PUBLICATION) && self.author(x).as_ref() == Some(payee) && ok(a) {
            out.push(*a);
        }
        out.extend(
            self.v
                .signed_by(payee)
                .filter(|h| self.is_agreements(h, types::SIGNATURE) && decode_signature(&h.inside).ok() == Some(*a) && ok(&h.id))
                .map(|h| h.id),
        );
        Some(out)
    }

    /// The clock the payee's chain declared at its link `k` (Money, "The
    /// clock", F176): the one in force there, `None` where none is.
    fn clock_at(&self, who: &Hash, k: usize) -> Option<crate::money::Clock> {
        let res = self.v.resolve(who);
        let mut out = None;
        for (l, st) in res.links.iter().zip(&res.states).take(k.saturating_add(1)) {
            if self.refuses(&l.act) {
                break;
            }
            match crate::money::clock_in(&self.mirs.money, &st.declarations) {
                Ok(Some(c)) => out = c,
                _ => {}
            }
        }
        out
    }

    /// The payment a bare rail proof is (Money rule 12; F200, F380): the
    /// payment its rail Module says ([`Self::payments`]) where the caller
    /// stated it, otherwise unstated. [`Payment::None`] for an empty proof,
    /// which is no payment.
    pub fn payment_of(&self, proof: &[u8]) -> Payment {
        match (proof.is_empty(), self.payments.get(proof)) {
            (true, _) => Payment::None,
            (false, Some(p)) => Payment::Stated(p.clone()),
            (false, None) => Payment::Unstated([&[0u8][..], proof].concat()),
        }
    }

    /// The payment a receipt or claim `id` carrying `proof` is: as
    /// [`Self::payment_of`], an unstated one standing for that record alone.
    pub fn record_payment(&self, id: &Hash, proof: &[u8]) -> Payment {
        match self.payment_of(proof) {
            Payment::Unstated(_) => Payment::Unstated([&[1u8][..], id].concat()),
            p => p,
        }
    }

    /// Whether two payments are one (Money rule 12): both stated and equal,
    /// or one record compared with itself. Where either is unstated, the
    /// answer is unknown: noted, and answered as the answer being judged
    /// assumes ([`Self::judged`]): not one payment, unless it takes this
    /// pair as one.
    pub fn same_payment_as(&self, a: &Payment, b: &Payment) -> bool {
        match (a, b) {
            (Payment::None, _) | (_, Payment::None) => false,
            (Payment::Stated(x), Payment::Stated(y)) => x == y,
            _ if a == b => true,
            _ => {
                let pair = if a < b { (a.clone(), b.clone()) } else { (b.clone(), a.clone()) };
                self.unstated.set(true);
                let same = self.assumed.borrow().as_ref() == Some(&pair);
                self.read.borrow_mut().insert(pair);
                same
            }
        }
    }

    /// [`Self::same_payment_as`] for payments on rails: one payment only on
    /// one rail.
    fn same_on_rail(&self, a: &(Hash, Payment), b: &(Hash, Payment)) -> bool {
        a.0 == b.0 && self.same_payment_as(&a.1, &b.1)
    }

    /// Whether an answer given since the view was made, or since the last
    /// [`Self::paid_toward`] or [`Self::disagreements`], compared two
    /// records whose sameness rests on a payment the caller did not state
    /// ([`Self::payments`]): an answer of a function that returns no
    /// unknown of its own is then unknown, and a caller shows it so.
    pub fn unstated_payment_read(&self) -> bool {
        self.unstated.get()
    }

    /// `f` answered as Money rule 12 judges an answer that depends on
    /// whether records whose payment is not stated are one payment (F381,
    /// F383): with no such pair, `f`'s answer; with one, `f` answered taking
    /// it as two payments and then as one ([`Ways::Both`]); with two or more,
    /// unknown. The pairs counted are those `f` asks about, never every
    /// unstated pair the view holds; a pair first asked on the second
    /// reading is a second pair. Scoped to this answer: a judged answer
    /// inside `f` is judged on its own, and its pairs are not `f`'s.
    pub(super) fn two_ways<T>(&self, f: impl Fn() -> T) -> Ways<T> {
        let outer = (self.unstated.replace(false), self.read.take(), self.assumed.take());
        let first = f();
        let pairs = self.read.take();
        let r = match pairs.len() {
            0 => Ways::One(first),
            1 => {
                *self.assumed.borrow_mut() = pairs.first().cloned();
                let second = f();
                if self.read.take().is_subset(&pairs) {
                    Ways::Both(first, second)
                } else {
                    Ways::Unknown
                }
            }
            _ => Ways::Unknown,
        };
        self.unstated.set(outer.0);
        *self.read.borrow_mut() = outer.1;
        *self.assumed.borrow_mut() = outer.2;
        r
    }

    /// `f`'s answer, or `None` (unknown) where it depends on whether records
    /// whose payment is not stated are one payment ([`Self::two_ways`]): the
    /// same answer both ways stands.
    fn judged<T: PartialEq>(&self, f: impl Fn() -> T) -> Option<T> {
        match self.two_ways(f) {
            Ways::One(a) => Some(a),
            Ways::Both(a, b) => (a == b).then_some(a),
            Ways::Unknown => None,
        }
    }

    /// [`Self::judged`] for an answer that may fail: unknown is
    /// [`AgreementsError::PaymentUnstated`].
    pub(super) fn judged_r<T: PartialEq>(&self, f: impl Fn() -> R<T>) -> R<T> {
        self.judged(f).unwrap_or(Err(AgreementsError::PaymentUnstated))
    }

    /// [`Self::judged`] for a list: with one pair, each entry found both
    /// ways stands, and each found one way only is given back marked
    /// (`mark`) as resting on a payment not stated; the order is the first
    /// answer's, then the second's. With two or more pairs, the list is
    /// unknown.
    pub(super) fn judged_list<T: PartialEq + Clone>(&self, f: impl Fn() -> R<Vec<T>>, mark: impl Fn(T) -> T) -> R<Vec<T>> {
        match self.two_ways(f) {
            Ways::One(a) => a,
            Ways::Both(Ok(a), Ok(b)) => {
                let mut out: Vec<T> = a.iter().map(|x| if b.contains(x) { x.clone() } else { mark(x.clone()) }).collect();
                out.extend(b.iter().filter(|x| !a.contains(x)).map(|x| mark(x.clone())));
                Ok(out)
            }
            Ways::Both(Err(e), Err(g)) if e == g => Err(e),
            _ => Err(AgreementsError::PaymentUnstated),
        }
    }

    /// Whether the receipt or claim `id` counts toward a purchase or a sale
    /// (Money rules 8 and 10): only with the rail's answer,
    /// valid. A record whose answer is pending or not held counts on the
    /// second reading of [`Self::answered`] alone.
    pub(super) fn rail_counts(&self, id: &Hash) -> bool {
        if self.rail_valid.contains_key(id) {
            return true;
        }
        if self.rail_invalid.contains(id) {
            return false;
        }
        self.unanswered_read.set(true);
        self.as_if_answered.get()
    }

    /// `f` read fail-closed, a record whose verification answer is not
    /// valid counting toward no purchase and no sale; and, where it read a
    /// record whose answer is pending or not held, `f` read again as if that
    /// answer were valid. Where the two differ, the answer is unknown until
    /// the rail's answer is given; the caller says how unknown is shown.
    /// Inside a second reading, `f`'s answer alone.
    pub(super) fn answered<T>(&self, f: impl Fn() -> T) -> (T, Option<T>) {
        if self.as_if_answered.get() {
            return (f(), None);
        }
        let outer = self.unanswered_read.replace(false);
        let closed = f();
        if !self.unanswered_read.get() {
            self.unanswered_read.set(outer);
            return (closed, None);
        }
        self.as_if_answered.set(true);
        let open = f();
        self.as_if_answered.set(false);
        self.unanswered_read.set(true);
        (closed, Some(open))
    }

    /// [`Self::answered`] for a list: each entry found both ways stands;
    /// each found one way only is given back marked (`mark`). Unknown
    /// ([`AgreementsError::RailUnanswered`]) where one reading fails and the
    /// other does not.
    pub(super) fn answered_list<T: PartialEq + Clone>(&self, f: impl Fn() -> R<Vec<T>>, mark: impl Fn(T) -> T) -> R<Vec<T>> {
        match self.answered(f) {
            (a, None) => a,
            (Ok(a), Some(Ok(b))) => {
                let mut out: Vec<T> = a.iter().map(|x| if b.contains(x) { x.clone() } else { mark(x.clone()) }).collect();
                out.extend(b.iter().filter(|x| !a.contains(x)).map(|x| mark(x.clone())));
                Ok(out)
            }
            (Err(e), Some(Err(g))) if e == g => Err(e),
            _ => Err(AgreementsError::RailUnanswered),
        }
    }

    /// Whether two proofs are of the same payment (F200; rules 10, 12, 15).
    fn same_payment_of(&self, a: (Option<&Hash>, &[u8]), b: (Option<&Hash>, &[u8])) -> bool {
        if a.0.is_some() && a.0 == b.0 {
            return !a.1.is_empty();
        }
        let key = |(id, proof): (Option<&Hash>, &[u8])| match id {
            Some(id) => self.record_payment(id, proof),
            None => self.payment_of(proof),
        };
        self.same_payment_as(&key(a), &key(b))
    }

    /// The payer's claims of one payment, the payment proof `proof` is
    /// (F200: the same payment as its rail Module says), that stand
    /// ([`Self::payers_claim`]) with the rail's answer, valid
    /// ([`Self::rail_valid`]: on a rail whose commitment carries the payer,
    /// a claim anyone else signs fails it): their act ids, which rule 15
    /// compares by their anchors (F169, F178).
    pub fn payers_claims(&self, proof: &[u8]) -> Vec<Hash> {
        self.claims_of_payment((None, proof), |id| self.rail_valid.contains_key(id))
    }

    /// [`Self::payers_claims`] for the payment the held receipt or claim
    /// `record`, carrying `proof`, is: that record is always its own payment.
    pub fn payers_claims_for(&self, record: &Hash, proof: &[u8]) -> Vec<Hash> {
        self.claims_of_payment((Some(record), proof), |id| self.rail_valid.contains_key(id))
    }

    /// The payer's claims of the same payment as `proof` whose rail answer
    /// the caller stated pending, with the payment shown
    /// ([`Self::rail_pending`]): rule 15 reads their anchors on a clock
    /// that cannot see the rail's own proof, once a claim of the payment
    /// is valid (F203).
    pub fn payers_pending_claims(&self, proof: &[u8]) -> Vec<Hash> {
        self.claims_of_payment((None, proof), |id| self.rail_pending.contains(id) && !self.rail_valid.contains_key(id) && !self.rail_invalid.contains(id))
    }

    fn claims_of_payment(&self, rec: (Option<&Hash>, &[u8]), answered: impl Fn(&Hash) -> bool) -> Vec<Hash> {
        use crate::money::Payload as Fin;
        self.v
            .held_acts()
            .filter(|h| h.inside.spec == self.mirs.money && answered(&h.id) && self.payers_claim(h))
            .filter(|h| matches!(Fin::decode(h.inside.type_, &h.inside.payload), Ok(Fin::Claim(c)) if self.same_payment_of((Some(&h.id), &c.proof), rec)))
            .map(|h| h.id)
            .collect()
    }

    /// The rail Module a held receipt or claim carrying `proof` names.
    fn rail_of_proof(&self, proof: &[u8]) -> Option<Hash> {
        use crate::money::Payload as Fin;
        self.v.held_acts().filter(|h| h.inside.spec == self.mirs.money).find_map(|h| match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) if r.proof == proof => Some(r.rail),
            Ok(Fin::Claim(c)) if c.proof == proof => Some(c.rail),
            _ => None,
        })
    }

    /// Whether `h` is a payer's claim that stands: valid under Identity,
    /// signed by its payer (or carrying its anonymous payer's key, signed
    /// over the claim and the act's own citations: F113, F147).
    fn payers_claim(&self, h: &Held) -> bool {
        use crate::money::{self as fin, Payload as Fin};
        let Ok(p @ Fin::Claim(_)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return false };
        h.inside.spec == self.mirs.money
            && self.money_counts(h)
            && h.act.outside.signer.is_some_and(|s| fin::check_signer(&p, &s, &fin::Citations::of(&h.inside)).is_ok())
    }

    /// The receipts held naming a rail proof, each valid under Identity and
    /// signed by its payee.
    fn receipts_for_proof(&self, proof: &[u8]) -> Vec<(Hash, crate::money::Receipt)> {
        self.receipts_for((None, proof))
    }

    /// The receipts held of the payment `rec` is (a held record, or a bare
    /// proof), each valid under Identity and signed by its payee.
    fn receipts_for(&self, rec: (Option<&Hash>, &[u8])) -> Vec<(Hash, crate::money::Receipt)> {
        use crate::money::{self as fin, Payload as Fin};
        self.v
            .held_acts()
            .filter(|r| r.inside.spec == self.mirs.money)
            .filter_map(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
                Ok(p @ Fin::Receipt(_))
                    if self.money_counts(r)
                        && r.act.outside.signer.is_some_and(|s| fin::check_signer(&p, &s, &fin::Citations::of(&r.inside)).is_ok()) =>
                {
                    match p {
                        Fin::Receipt(rc) if self.same_payment_of((Some(&r.id), &rc.proof), rec) => Some((r.id, rc)),
                        _ => None,
                    }
                }
                _ => None,
            })
            .collect()
    }

    /// Money rule 10 (F151), for a payer's claim with the rail's answer,
    /// valid: whether a receipt sharing its rail proof, disagreeing with it
    /// in payee or in what the payment fulfils, keeps it from counting. On
    /// a rail binding no payee or purpose (field 13 of its specification, [`Self::rails`]), never:
    /// the payer's claim decides what the payment fulfils. On a rail
    /// binding both, the commitment decides: a contrary receipt the rail
    /// refuses, or has not answered for, does not; one the rail also
    /// answered valid for contradicts it, and neither counts.
    fn claim_overruled(&self, c: &crate::money::Claim) -> bool {
        use crate::development::Bound;
        // Element by element (F328, Q4): where the proof binds an element,
        // the commitment decides it, and a contrary receipt the rail also
        // answered valid for contradicts the claim; where it does not, the
        // payer's claim decides that element (for the payee, the payment
        // address the claim's rail answer was checked against, rule 4).
        let (payee, purpose) = (self.rail_binds(&c.rail, Bound::Payee), self.rail_binds(&c.rail, Bound::Purpose));
        self.receipts_for_proof(&c.proof)
            .iter()
            .any(|(id, r)| ((payee && r.payee != c.payee) || (purpose && r.fulfils != c.fulfils)) && self.rail_valid.contains_key(id))
    }

    /// Whether a rail is a push rail, as its specification's field 11 says
    /// (F301); a rail not adopted reads as a request rail (see [`Self::rails`]).
    pub fn is_push_rail(&self, rail: &Hash) -> bool {
        self.rails.get(rail).is_some_and(|r| r.kind == crate::development::RailKind::Push)
    }

    /// Whether a rail's proof binds an element, as its specification's
    /// field 13 says (F301, F328 Q4); a rail not adopted reads as binding
    /// every element (see [`Self::rails`]). *The payer is carried in the
    /// payment commitment with the purpose, so a proof binding the purpose
    /// binds the payer the commitment names (F193's "a rail binding the
    /// payer"; Development draft 10, field 13, F330).*
    pub fn rail_binds(&self, rail: &Hash, b: crate::development::Bound) -> bool {
        self.rails.get(rail).is_none_or(|r| r.binds(b))
    }

    /// Money rule 10 (F151), for a receipt: whether a payer's claim
    /// sharing its rail proof, with the rail's answer, valid, disagrees
    /// with it in payee or in what the payment fulfils. Then the receipt
    /// counts for nothing toward what it names: on a rail binding no payee
    /// or purpose, the payer's claim decides, and the receipt stays shown
    /// as a dispute on the receiver ([`Self::disagreements`]); on a rail
    /// binding both, the two contradict each other, and neither counts.
    fn receipt_overruled(&self, rc: &crate::money::Receipt) -> bool {
        use crate::money::Payload as Fin;
        self.v.held_acts().any(|h| {
            h.inside.spec == self.mirs.money
                && self.rail_valid.contains_key(&h.id)
                && matches!(Fin::decode(h.inside.type_, &h.inside.payload),
                    Ok(Fin::Claim(c)) if self.same_payment_of((Some(&h.id), &c.proof), (None, &rc.proof)) && (c.payee != rc.payee || c.fulfils != rc.fulfils))
                && self.payers_claim(h)
        })
    }

    /// Double entry (Money rule 10): the open questions on a receiver.
    /// Each valid payer's claim to `receiver` with the rail's answer, valid
    /// ([`Self::rail_valid`]), for which the receiver has signed no receipt
    /// matching it (same rail proof, amount, payee, what it fulfils and,
    /// on a route, the previous hop's receipt, Money rule 11): no
    /// receipt at all (the claim alone shows the money arrived), or receipts
    /// naming the same proof that disagree with it. Until the receiver signs
    /// a receipt matching the proof, the greater amount counts as received
    /// ([`Self::paid_toward`]). `None` (unknown) where whether a receipt
    /// and a claim are one payment rests on a payment the caller did not
    /// state ([`Self::payments`]).
    pub fn disagreements(&self, receiver: &Hash) -> Option<Vec<Disagreement>> {
        self.judged(|| self.disagreements_shown(receiver))
    }

    fn disagreements_shown(&self, receiver: &Hash) -> Vec<Disagreement> {
        use crate::money::Payload as Fin;
        let mut out = vec![];
        for h in self.v.held_acts() {
            if h.inside.spec != self.mirs.money || !self.rail_valid.contains_key(&h.id) || !self.payers_claim(h) {
                continue;
            }
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if &c.payee != receiver {
                continue;
            }
            let rs = self.receipts_for_proof(&c.proof);
            let same = |r: &crate::money::Receipt| r.amount == c.amount && r.payee == c.payee && r.fulfils == c.fulfils && r.previous == c.previous;
            if rs.iter().any(|(_, r)| same(r)) {
                continue;
            }
            if rs.is_empty() {
                out.push(Disagreement::NoReceipt { claim: h.id });
            }
            for (id, r) in rs {
                out.push(Disagreement::Differs {
                    claim: h.id,
                    receipt: id,
                    claimed: c.amount,
                    receipted: r.amount,
                    payee: r.payee != c.payee,
                    fulfils: r.fulfils != c.fulfils,
                    previous: r.previous != c.previous,
                });
            }
        }
        out
    }

    /// A creditor's release, judged (Money type 4, F126; Agreements rule 47b):
    /// it ends the obligation it names when signed by the creditor that
    /// obligation names, a collective creditor's consent counting by its own
    /// rules: a Money act, reached by its Money lane alone (E2). Only the
    /// creditor signs it.
    pub fn debt_release(&self, id: &Hash) -> R<DebtReleaseEval> {
        self.debt_release_as(id, false)
    }

    /// [`Self::debt_release`]; with `placed`, for a release a collective's
    /// line placed (a closing's history acknowledging it, F303): kept there
    /// whatever its signer's later rotation disowned (F302), its status
    /// under Identity shown as a dispute.
    fn debt_release_as(&self, id: &Hash, placed: bool) -> R<DebtReleaseEval> {
        use crate::money::{self as fin, Payload as Fin};
        let h = self.held(id)?;
        let r = match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Release(r)) if h.inside.spec == self.mirs.money && h.inside.type_ == fin::types::RELEASE => r,
            _ => return Err(AgreementsError::Check("not a creditor's release")),
        };
        let mut e = DebtReleaseEval { id: *id, release: r.clone(), counts: false, why: None };
        let fail = |mut e: DebtReleaseEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        let disowned = placed && matches!(self.status(id), Status::Void | Status::Disputed);
        if !self.valid(id) && !disowned {
            return fail(e, "the creditor's release is not valid under Identity");
        }
        let Some(x) = self.v.get(&r.obligation) else {
            return fail(e, "the obligation it names is not held");
        };
        let o = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Obligation(o)) if x.inside.spec == self.mirs.money => o,
            _ => return fail(e, "it names an act that is not an obligation"),
        };
        if self.author(h) != Some(o.creditor) {
            return fail(e, "only the creditor the obligation names signs its release (F125)");
        }
        if !disowned && !self.consent(id)?.counts() {
            return fail(e, "the creditor's consent does not count, by its own rules (its Money lane, F126)");
        }
        e.counts = true;
        Ok(e)
    }

    /// The creditor's release that ended an obligation, if one held counts.
    pub fn debt_released(&self, obligation: &Hash) -> R<Option<Hash>> {
        use crate::money::{self as fin, Payload as Fin};
        for x in self.v.held_acts() {
            if x.inside.spec != self.mirs.money || x.inside.type_ != fin::types::RELEASE {
                continue;
            }
            if !matches!(Fin::decode(x.inside.type_, &x.inside.payload), Ok(Fin::Release(r)) if &r.obligation == obligation) {
                continue;
            }
            if self.debt_release(&x.id)?.counts {
                return Ok(Some(x.id));
            }
        }
        Ok(None)
    }

    /// Whether an act lies in the history a closing drawn at `chain_act` and
    /// `tips` cites and was signed by the collective, or is acknowledged
    /// there by an act of the collective (Envelopes, `acks`; F303).
    fn relied_by_line(&self, col: &Col, line: &[Hash], x: &Held) -> bool {
        let h = self.history(col, line);
        if Self::for_col(col, x) && h.acts.contains(&x.id) {
            return true;
        }
        self.v.acknowledgements(&x.id).into_iter().any(|a| Self::for_col(col, a) && h.acts.contains(&a.id))
    }

    /// Whether an obligation is still owed for a closing (F303): counting
    /// only the receipts, claims and releases its line relies on.
    fn still_owed_for_closing(&self, col: &Col, line: &[Hash], obligation: &Hash, amount: u64) -> R<bool> {
        if self.own_attempts_open() {
            return self.binding(|v| {
                let col = v.col(&col.id);
                v.still_owed_for_closing(&col, line, obligation, amount)
            });
        }
        let paid = self
            .judged(|| self.paid_toward_if(obligation, &|r| self.relied_by_line(col, line, r), true))
            .ok_or(AgreementsError::PaymentUnstated)?;
        if paid >= amount {
            return Ok(false);
        }
        use crate::money::{self as fin, Payload as Fin};
        let mut released = false;
        for x in self.v.held_acts() {
            if x.inside.spec != self.mirs.money || x.inside.type_ != fin::types::RELEASE {
                continue;
            }
            if !matches!(Fin::decode(x.inside.type_, &x.inside.payload), Ok(Fin::Release(r)) if &r.obligation == obligation) {
                continue;
            }
            if self.relied_by_line(col, line, x) && self.debt_release_as(&x.id, true)?.counts {
                released = true;
                break;
            }
        }
        Ok(!released)
    }

    /// Whether an obligation is still owed: neither fulfilled in full by
    /// receipts held nor ended by a creditor's release.
    fn still_owed(&self, obligation: &Hash, amount: u64) -> R<bool> {
        Ok(self.paid(obligation)? < amount && self.debt_released(obligation)?.is_none())
    }

    /// What is paid toward an obligation ([`Self::paid_toward`]), as a
    /// binding answer (F153): unknown ([`AgreementsError::OwnAttempt`]) where it
    /// rests on the verifier's own failed attempts to reach homes, such as
    /// a payment to a pointer the creditor published after a rotation only
    /// those attempts let count.
    pub fn paid(&self, obligation: &Hash) -> R<u64> {
        if self.own_attempts_open() {
            return self.binding(|v| v.paid(obligation));
        }
        self.paid_toward(obligation).ok_or(AgreementsError::PaymentUnstated)
    }

    /// What a collective owes (F125, D5): its own obligations that bind,
    /// signed before the line where one is given, and every obligation that
    /// binds a collective a fork closed which it owes as a successor; each
    /// still owed.
    fn open_debts(&self, col: &Col, line: Option<&[Hash]>) -> R<Vec<Hash>> {
        use crate::money::Payload as Fin;
        let mut out = vec![];
        for x in self.v.held_acts() {
            if x.inside.spec != self.mirs.money {
                continue;
            }
            let Ok(Fin::Obligation(o)) = Fin::decode(x.inside.type_, &x.inside.payload) else { continue };
            // F143, as F199 reads it for forks: a closing is judged on its
            // own departures, those registered in its history.
            let own = match line {
                Some(l) if o.debtor == col.id => Some((col.id, l.to_vec())),
                _ => None,
            };
            let outer = own.map(|l| self.fork_line.replace(Some(l)));
            let binds = self.obligation_binds(&x.id);
            if let Some(o) = outer {
                self.fork_line.replace(o);
            }
            if binds? != Some(true) {
                continue;
            }
            let owes = if o.debtor == col.id {
                line.is_none_or(|l| self.before_line(col, x, l))
            } else {
                self.debtors(&x.id)?.is_some_and(|d| d.contains(&col.id))
            };
            let still = match line {
                None => self.still_owed(&x.id, o.amount.value)?,
                // F303: for a closing, a receipt or release of another
                // identity counts only where an act of the collective in the
                // closing's history acknowledges it, or the receipt is the
                // collective's own; one nobody acknowledged is shown (the
                // view's ordinary `owes`), and the closing waits.
                Some(l) => self.still_owed_for_closing(col, l, &x.id, o.amount.value)?,
            };
            if owes && still {
                out.push(x.id);
            }
        }
        Ok(out)
    }

    /// What a collective owes now, for showing (F125, D5): its debts and
    /// those it owes as a fork's successor, still owed.
    pub fn owes(&self, collective: &Hash) -> R<Vec<Hash>> {
        let col = self.col(collective);
        self.open_debts(&col, None)
    }



    /// The version in force of an agreement, against which a split of it
    /// is judged (rule 26): [`Self::latest_version`].
    pub fn version_in_force(&self, agreement: &Hash) -> R<Hash> {
        self.latest_version(agreement)
    }

    /// The latest version of an agreement that exists: for a collective's
    /// own agreement, the one in force at its current state; for a deal,
    /// the version in force as rule 45b reads its forks (F186): while two
    /// complete versions of one version stand unsettled, the version before
    /// the split, the reference.
    fn latest_version(&self, agreement: &Hash) -> R<Hash> {
        let t = self.terms(agreement)?;
        if t.is_collective() {
            if let Some(c) = self.collective_of(agreement)? {
                if let Some(cur) = self.current(&c)? {
                    return Ok(cur.agreement);
                }
            }
            return Ok(*agreement);
        }
        let root = self.lineage(agreement)?.pop().expect("a lineage has a root").0;
        Ok(match self.deal_state(&root)? {
            DealState::InForce(h) => h,
            DealState::Forked { reference, .. } | DealState::Tangled { reference, .. } => reference,
        })
    }

    /// The version an act naming the version `named` of an agreement is
    /// judged against (rules 26, 17; F186): the version in force; or, while
    /// a deal stands forked, the latest version of the branch `named` lies
    /// on, since a new act may follow either branch and counts (the buyer
    /// is protected), and the reference for a version before the split.
    fn version_for(&self, named: &Hash) -> R<Hash> {
        let t = self.terms(named)?;
        if t.is_collective() {
            return self.latest_version(named);
        }
        let root = self.lineage(named)?.pop().expect("a lineage has a root").0;
        Ok(match self.deal_state(&root)? {
            DealState::InForce(h) => h,
            DealState::Forked { reference, branches } => branches
                .iter()
                .find(|b| b.contains(named))
                .and_then(|b| b.last().copied())
                .unwrap_or(reference),
            // DQ1 to DQ4: the parties lose the changes the tangled versions made.
            DealState::Tangled { reference, .. } => reference,
        })
    }


    /// The complete versions of a deal cloning `at` (rule 45b): clones of
    /// it every party whose voice remains signed, valid.
    fn complete_clones(&self, at: &Hash) -> Vec<Hash> {
        self.v
            .held_acts()
            .filter(|x| {
                self.is_agreements(x, types::TERMS)
                    && self.terms(&x.id).is_ok_and(|c| c.parent == Some(*at))
                    && self.agreement(&x.id).is_ok_and(|a| a.exists == Some(true))
            })
            .map(|x| x.id)
            .collect()
    }

    /// The complete versions of a deal from `at` on, each with its parent:
    /// followed one complete clone at a time, `at` excluded.
    fn versions_below(&self, at: &Hash) -> BTreeMap<Hash, Hash> {
        let mut out = BTreeMap::new();
        let mut todo = vec![*at];
        while let Some(x) = todo.pop() {
            for k in self.complete_clones(&x) {
                if out.insert(k, x).is_none() {
                    todo.push(k);
                }
            }
        }
        out
    }

    /// A deal read from its founding terms `root` (rule 45b; F186, F188,
    /// F190, F192, F196): followed one complete version at a time. Where
    /// one version has two complete clones or more, the deal is forked, the
    /// version before the split its reference, until a settlement: a
    /// complete version naming in field 26 every tip it drops (QF3), signed
    /// by the parties of all the branches involved (DQ5), or the settlement
    /// of the judge of forks the reference names, or of the link of its
    /// chain of judgment that took over, activated by a party's request
    /// (DQ8, QF2, QG4).
    ///
    /// **What a settlement could see** (F192, decided 10 October 2026,
    /// replacing QF1 and the build's "clean"): its history, and nothing
    /// else: its own line, each tip it names with that tip's history, and
    /// what it cites, each with its own history ([`Self::fork_histories`]);
    /// for a judge's settlement, the request it cites with that request's
    /// history, and the histories of the version it keeps and of the tips
    /// it drops. A settlement counts only where it names every
    /// tip it saw (F188): a version of the fork in its history that is
    /// neither on the line it keeps nor at or below a tip it names leaves
    /// it settling nothing, a plain version. A settlement that counts is
    /// final for everything it saw, and for everything it did not: a
    /// version it did not hold reopens nothing, nor does a settlement whose
    /// history holds it (made after it), whoever signs them; only a version
    /// on the line it puts in force changes the deal. Two settlements of
    /// the parties, neither holding the other, keep different lines: every
    /// party signed both, and the deal stays tangled on its reference
    /// (DQ3) until one holding both settles it. Where a judge's settlement
    /// is one of two such (F206, decided 10 October 2026): a judge's two,
    /// keeping different versions, both count for nothing, the judge read
    /// as answering "unknown", and the next link of its chain settles; the
    /// parties' against a judge's, the parties' holds. Only the link of the
    /// chain of judgment active on the fork settles it (F246, decided 10
    /// October 2026, superseding F236): the chain runs per question, the
    /// fork, never per request, so two links' settlements never both count,
    /// and a link that settles after letting its stage pass counts for
    /// nothing, whatever it saw (F245, QL2). With no settlement,
    /// tangled shapes (DQ1, DQ2) leave the deal on its reference. Only
    /// complete versions of this deal are read (F189, 2); a settling
    /// version naming a version this verifier does not hold is read as a
    /// plain version until it holds it (F196).
    pub fn deal_state(&self, root: &Hash) -> R<DealState> {
        Ok(self.deal_walk(root)?.0)
    }

    /// F206 (a), decided by Nobody, allegedly, 10 October 2026: the judges
    /// of forks who settled one fork of the deal `agreement` belongs to
    /// twice or more, their first settlements neither holding the other
    /// and keeping different versions: each such link with its
    /// settlements, which count for nothing. The double signature stays
    /// visible; a client shows it beside the fork.
    pub fn judges_contradicted(&self, agreement: &Hash) -> R<Vec<(Hash, Vec<Hash>)>> {
        let root = self.lineage(agreement)?.pop().expect("a lineage has a root").0;
        Ok(self.deal_walk(&root)?.1)
    }

    /// [`Self::deal_state`], with the judges who contradicted themselves
    /// on the forks met on the way (F206 a).
    fn deal_walk(&self, root: &Hash) -> R<(DealState, Vec<(Hash, Vec<Hash>)>)> {
        let mut contradicted: Vec<(Hash, Vec<Hash>)> = vec![];
        let mut at = *root;
        loop {
            let kids = self.complete_clones(&at);
            match kids.len() {
                0 => return Ok((DealState::InForce(at), contradicted)),
                1 => {
                    at = kids[0];
                    continue;
                }
                _ => {}
            }
            let below = self.versions_below(&at);
            let up = |x: &Hash| -> Vec<Hash> {
                // x and its ancestors in `below`, nearest first.
                let mut out = vec![];
                let mut y = *x;
                while let Some(p) = below.get(&y) {
                    out.push(y);
                    y = *p;
                }
                out
            };
            let branches: Vec<Vec<Hash>> = kids
                .iter()
                .map(|k| below.keys().filter(|x| up(x).last() == Some(k)).copied().collect())
                .collect();
            let tangled = |why: &'static str, c: Vec<(Hash, Vec<Hash>)>| Ok((DealState::Tangled { reference: at, why, branches: branches.clone() }, c));
            let hist = self.fork_histories(&below)?;
            // Two versions on separate lines: neither descends from the other.
            let apart = |a: &Hash, b: &Hash| a != b && !up(a).contains(b) && !up(b).contains(a);
            // F188 under F192: every version of the fork a settlement saw is
            // on the line it keeps, or at or below a tip it names.
            let names_all = |seen: &BTreeSet<Hash>, keeps: &[Hash], tips: &[Hash]| {
                seen.iter().filter(|y| below.contains_key(*y)).all(|y| {
                    keeps.iter().any(|k| k == y || up(k).contains(y)) || tips.iter().any(|o| up(o).contains(y))
                })
            };
            let mut cands: Vec<Settlement> = vec![];
            for (x, par) in &below {
                let t = self.terms(x)?;
                let Some(tips) = t.settles.as_ref() else { continue };
                // F196: naming a version this verifier does not hold, it is
                // read as a plain version until that version is held.
                if tips.iter().any(|o| self.v.get(o).is_none()) {
                    continue;
                }
                if !tips.iter().all(|o| below.contains_key(o) && apart(o, par)) {
                    continue;
                }
                // DQ5 (QF3): the parties of every tip dropped whose voice
                // remains sign it too.
                let mut need: Vec<Hash> = vec![];
                for o in tips {
                    let mut lx = self.lineage(o)?;
                    lx.insert(0, (*x, t.clone()));
                    for p in self.deal_voices(x, &lx)? {
                        if !need.contains(&p) {
                            need.push(p);
                        }
                    }
                }
                if self.signers(x, &need).len() < need.len() {
                    continue;
                }
                let seen = hist.get(x).cloned().unwrap_or_default();
                if !names_all(&seen, &[*x], tips) {
                    continue;
                }
                cands.push(Settlement { act: *x, into: *x, link: None, seen });
            }
            // The judges' settlements, link by link of the chain of
            // judgment (QG4). F206 (a): a link whose first settlements of
            // this fork, neither holding the other, keep different versions
            // has answered "unknown": all its settlements count for
            // nothing, and the next link's turn has come, with no period to
            // wait (rule 34a) (mechanic, the build's: "first" read on the
            // link's own settlements by history, as F192 reads any two).
            let (links, judged) = self.arbitrated(&at, &below)?;
            let mut by_link: Vec<Vec<Settlement>> = links.iter().map(|_| vec![]).collect();
            for (i, act, kept, discarded) in judged {
                if !discarded.iter().all(|o| apart(o, &kept)) {
                    continue;
                }
                let mut seen: BTreeSet<Hash> = BTreeSet::from([act]);
                for y in std::iter::once(&kept).chain(&discarded) {
                    seen.extend(hist.get(y).into_iter().flatten().copied());
                }
                // S7e question 2, decided for the text: what a judge's
                // settlement cites, the request, with its own history (what
                // its `prev` and its `objects` name, followed back), each
                // version of the fork found there with that version's.
                if let Some(rq) = self.v.get(&act).and_then(|h| ForkSettlement::decode(&h.inside).ok()).map(|s| s.request) {
                    seen.insert(rq);
                    for y in self.act_history(&rq) {
                        seen.insert(y);
                        seen.extend(hist.get(&y).into_iter().flatten().copied());
                    }
                }
                if !names_all(&seen, &[kept], &discarded) {
                    continue;
                }
                by_link[i].push(Settlement { act, into: kept, link: Some(i), seen });
            }
            let mut unknown: Vec<bool> = vec![false; links.len()];
            for (i, own) in by_link.into_iter().enumerate() {
                // QG4 under F246 (decided 10 October 2026, superseding
                // F236): the chain runs on the fork, never per request; this
                // link is active only once every link before it let its
                // stage on the fork pass, or answered "unknown" (F206 a); a
                // settlement out of turn counts for nothing, and is no
                // contradiction either.
                let active = (0..i).all(|k| unknown[k] || self.judges_lapsed.contains(&(at, links[k])));
                let own: Vec<Settlement> = if active { own } else { vec![] };
                let first: Vec<&Settlement> = own.iter().filter(|c| !own.iter().any(|o| o.act != c.act && c.seen.contains(&o.act))).collect();
                if first.iter().any(|c| c.into != first[0].into) {
                    unknown[i] = true;
                    let mut acts: Vec<Hash> = own.iter().map(|c| c.act).collect();
                    acts.sort();
                    contradicted.push((links[i], acts));
                    continue;
                }
                cands.extend(own);
            }
            // F192: one settlement is after another when its history holds
            // it. Of those that are after none, one counts; where they keep
            // different lines, neither holds the other: the parties' own
            // tangle (DQ3), set aside for a later settlement holding them
            // all; the parties' against a judge's, the parties' (F206 b).
            let mut live: Vec<&Settlement> = cands.iter().collect();
            let mut set_aside: Vec<&Settlement> = vec![];
            let mut settled: Option<Hash> = None;
            while !live.is_empty() {
                let first: Vec<&Settlement> = live
                    .iter()
                    .filter(|c| !live.iter().any(|o| o.act != c.act && c.seen.contains(&o.act)))
                    .copied()
                    .collect();
                if first.is_empty() {
                    break;
                }
                if first.iter().all(|o| o.into == first[0].into) {
                    settled = Some(first[0].into);
                    break;
                }
                // F206 (b): a settlement every party signed and a judge's,
                // neither holding the other, keeping different versions:
                // the parties' holds, the judge's counts for nothing (rule
                // 45b: the judge is a fallback a request activates).
                if first.iter().any(|c| c.link.is_none()) && first.iter().any(|c| c.link.is_some()) {
                    let judges: Vec<Hash> = first.iter().filter(|c| c.link.is_some()).map(|c| c.act).collect();
                    live.retain(|c| !judges.contains(&c.act));
                    continue;
                }
                // F246 (superseding F236): only the active link's
                // settlements reach here, so two links' never meet; within
                // one link, F206 (a) was read above.
                set_aside.extend(first.iter().copied());
                live.retain(|c| set_aside.iter().all(|o| c.seen.contains(&o.act)) && !set_aside.iter().any(|o| o.act == c.act));
            }
            if let Some(into) = settled {
                at = into;
                continue;
            }
            if !set_aside.is_empty() {
                return tangled("two settlements of one fork, neither holding the other (DQ3)", contradicted);
            }
            if kids.len() > 2 {
                return tangled("three or more complete versions of one version, not settled by one naming every tip (DQ2, QF3)", contradicted);
            }
            let parents: Vec<&Hash> = below.values().filter(|p| **p != at).collect();
            if parents.iter().enumerate().any(|(i, p)| parents[i + 1..].contains(p)) {
                return tangled("a branch that splits again (DQ1)", contradicted);
            }
            let lines = branches
                .iter()
                .map(|b| {
                    let mut b = b.clone();
                    b.sort_by_key(|x| up(x).len());
                    b
                })
                .collect();
            return Ok((DealState::Forked { reference: at, branches: lines }, contradicted));
        }
    }

    /// What each complete version of a fork shows it was made after (QF1,
    /// F190): itself, its parent's history, and each act it names in field
    /// 26 or cites, with that act's history where it is a version of the
    /// fork, or, for a judge's settlement (type 23), the histories of the
    /// tips it names.
    fn fork_histories(&self, below: &BTreeMap<Hash, Hash>) -> R<BTreeMap<Hash, BTreeSet<Hash>>> {
        let mut out: BTreeMap<Hash, BTreeSet<Hash>> = BTreeMap::new();
        let mut order: Vec<Hash> = below.keys().copied().collect();
        // Parents and cited versions first: by depth below the fork, then
        // again until nothing changes (citations may cross branches).
        let depth = |x: &Hash| {
            let mut n = 0usize;
            let mut y = *x;
            while let Some(p) = below.get(&y) {
                n += 1;
                y = *p;
            }
            n
        };
        order.sort_by_key(depth);
        let mut direct: BTreeMap<Hash, Vec<Hash>> = BTreeMap::new();
        for x in &order {
            let h = self.held(x)?;
            let t = self.terms(x)?;
            let mut d: Vec<Hash> = below.get(x).copied().into_iter().collect();
            d.extend(t.settles.iter().flatten().copied());
            d.extend(deal_citations(&h.inside, &t));
            // A judge's settlement cited: what it named, too.
            for c in d.clone() {
                if let Some(a) = self.v.get(&c) {
                    if self.is_agreements(a, types::FORK_SETTLEMENT) {
                        if let Ok(s) = ForkSettlement::decode(&a.inside) {
                            d.push(s.kept);
                            d.extend(s.discarded);
                        }
                    }
                }
            }
            direct.insert(*x, d);
        }
        for x in &order {
            out.insert(*x, BTreeSet::from([*x]));
        }
        loop {
            let mut changed = false;
            for x in &order {
                let mut add: BTreeSet<Hash> = BTreeSet::new();
                for c in &direct[x] {
                    add.insert(*c);
                    if let Some(hc) = out.get(c) {
                        add.extend(hc.iter().copied());
                    }
                }
                let e = out.get_mut(x).expect("each version has an entry");
                let n = e.len();
                e.extend(add);
                changed |= e.len() != n;
            }
            if !changed {
                break;
            }
        }
        Ok(out)
    }

    /// The judge's settlements of the fork at `at` (F188, DQ8), each signed
    /// by the judge of forks the reference names (field 27, one of field
    /// 13: QF2, decided 9 October 2026), or by the link of its chain of
    /// judgment (field 21) that took over (QG4, decided 9 October 2026;
    /// F246, decided 10 October 2026: once every link before it let its
    /// stage on the fork pass, as the caller states in
    /// [`Self::judges_lapsed`], the question being the fork's reference
    /// `at`; a link listed there counts for nothing on that question, and
    /// a settlement listed in [`Self::settled_out_of_turn`] counts for
    /// nothing at all), naming a request by a party who signed the
    /// reference, which names `at`; the version it keeps and every tip it
    /// drops (QF3), all versions of the fork. As (the link's place, the
    /// act, the version kept, the tips dropped). Where the reference names
    /// no judge of forks, none settles, and the deal waits on its
    /// reference (QF2).
    fn arbitrated(&self, at: &Hash, below: &BTreeMap<Hash, Hash>) -> R<(Vec<Hash>, Vec<(usize, Hash, Hash, Vec<Hash>)>)> {
        let t = self.terms(at)?;
        let Some(judge) = t.fork_judge.filter(|j| t.arbitrators.iter().flatten().any(|a| a == j)) else {
            return Ok((vec![], vec![]));
        };
        let links = t.chain_of(&Judge::Identity(judge)).unwrap_or_else(|| vec![judge]);
        let mut out = vec![];
        for (i, link) in links.iter().enumerate() {
            for h in self.v.signed_by(link) {
                if !self.is_agreements(h, types::FORK_SETTLEMENT) || !self.valid(&h.id) {
                    continue;
                }
                let Ok(s) = ForkSettlement::decode(&h.inside) else { continue };
                let Some(rq) = self.v.get(&s.request) else { continue };
                if !self.is_agreements(rq, types::SETTLEMENT_REQUEST) || !self.valid(&rq.id) {
                    continue;
                }
                let Ok(r) = SettlementRequest::decode(&rq.inside) else { continue };
                let Some(asker) = rq.act.outside.signer else { continue };
                if r.reference != *at || !t.parties.contains(&asker) || self.signers(at, &[asker]).is_empty() {
                    continue;
                }
                // Fable's formats review 2.6, taken under the delegation
                // (F189 (8) by analogy): a request counts, and a judge's
                // period runs, only where the request is public or sealed to
                // that judge; every link it passes through must have been
                // reached (mechanic, the build's).
                let reaches = |j: &Hash| rq.act.outside.content_key.is_some() || rq.act.outside.to.iter().flatten().any(|q| q == j);
                if !links[..=i].iter().all(reaches) {
                    continue;
                }
                // QG4 under F246: its own stage on the fork has not passed,
                // and the settlement was not signed before that stage opened
                // (whether its stage has come is read in `deal_walk`, where
                // a link before it may have answered "unknown", F206 a).
                if self.judges_lapsed.contains(&(*at, *link)) || self.settled_out_of_turn.contains(&h.id) {
                    continue;
                }
                if below.contains_key(&s.kept) && s.discarded.iter().all(|d| below.contains_key(d)) {
                    out.push((i, h.id, s.kept, s.discarded));
                }
            }
        }
        Ok((links, out))
    }

    /// Where a deal stands forked (rule 45b, F186): the reference, the
    /// version before the split, and each branch's versions from the split
    /// to its latest. `None` where it is not forked, or is a collective's.
    pub fn deal_fork(&self, agreement: &Hash) -> R<Option<DealFork>> {
        let t = self.terms(agreement)?;
        if t.is_collective() {
            return Ok(None);
        }
        let root = self.lineage(agreement)?.pop().expect("a lineage has a root").0;
        Ok(match self.deal_state(&root)? {
            DealState::InForce(_) => None,
            DealState::Forked { reference, branches } => Some(DealFork { reference, branches, tangled: None }),
            DealState::Tangled { reference, why, branches } => Some(DealFork { reference, branches, tangled: Some(why) }),
        })
    }

    /// Client conformance (rule 45b, F186, decided 9 October 2026): a
    /// seller's client, and a split service, MUST raise the alarm when a
    /// payment names a version of the deal that does not descend from the
    /// version they hold. Given the payment (a receipt or claim naming the
    /// claim it pays under, field 9) and the version `held`: `None` where
    /// the version it names descends from `held` (or is `held`), or names
    /// no version of the same agreement; otherwise both lines from the last
    /// version they share, to show both branches and point to settling the
    /// fork.
    pub fn fork_alarm(&self, payment: &Hash, held: &Hash) -> R<Option<ForkAlarm>> {
        use crate::money::Payload as Fin;
        let x = self.held(payment)?;
        if x.inside.spec != self.mirs.money {
            return Ok(None);
        }
        let named = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Receipt(r)) => r.purchase.map(|p| (p.agreement, p.line)),
            Ok(Fin::Claim(c)) => c.purchase.map(|p| (p.agreement, p.line)),
            _ => None,
        };
        let Some((agreement, named)) = named else { return Ok(None) };
        let lh: Vec<Hash> = self.lineage(held)?.into_iter().map(|(i, _)| i).collect();
        // F189 (3): a version this verifier does not hold, or whose line it
        // cannot follow back, of the same deal: the hidden fork the alarm
        // exists for.
        let ln = match self.v.get(&named) {
            Some(l) if !self.is_agreements(l, types::TERMS) => return Ok(None),
            Some(_) => self.lineage(&named).ok().map(|l| l.into_iter().map(|(i, _)| i).collect::<Vec<Hash>>()),
            None => None,
        };
        let Some(ln) = ln else {
            let same_deal = self.lineage(&agreement).is_ok_and(|la| la.last().map(|r| r.0) == lh.last().copied());
            return Ok(same_deal.then(|| ForkAlarm {
                named,
                held: *held,
                shared: *held,
                kind: AlarmKind::Unheld,
                held_line: vec![],
                named_line: vec![named],
            }));
        };
        if ln.contains(held) {
            return Ok(None);
        }
        let Some(shared) = lh.iter().find(|h| ln.contains(h)).copied() else {
            return Ok(None);
        };
        let line = |l: &[Hash]| -> Vec<Hash> {
            let k = l.iter().position(|h| *h == shared).unwrap_or(0);
            l[..k].iter().rev().copied().collect()
        };
        Ok(Some(ForkAlarm {
            named,
            held: *held,
            shared,
            kind: if shared != named { AlarmKind::Fork } else { AlarmKind::Older },
            held_line: line(&lh),
            named_line: line(&ln),
        }))
    }


    /// A payment for a work, judged (F126): a purchase names the claim it
    /// pays under (receipt or claim field 9). A payment for a claimed work,
    /// or for a standing offer, that names none, or names a line that is
    /// none of that agreement's claims, is no purchase: money received for
    /// nothing, owed back to the payer as a refund (Money rule 10a). W4
    /// (F128): on a request rail, the claim named is the one the seller's
    /// request committed to; on a push rail, each holder's own chain
    /// settles it. `None` where the payment is not for a work.
    pub fn purchase(&self, id: &Hash) -> R<Option<PurchaseEval>> {
        self.judged_r(|| self.purchase_unjudged(id))
    }

    /// Judged as [`Self::judged`] says: unknown ([`AgreementsError::PaymentUnstated`])
    /// only where it depends on whether two records whose payment is not
    /// stated are one payment (Money rule 12).
    ///
    /// Read fail-closed ([`Self::answered`]): the receipt or claim `id`, and
    /// every receipt it is judged with, counts only with the rail's answer,
    /// valid; where the answer rests on one pending or not held, unknown
    /// ([`PurchaseVerdict::Unknown`]; Money rules 8 and 10).
    pub(super) fn purchase_unjudged(&self, id: &Hash) -> R<Option<PurchaseEval>> {
        match self.answered(|| self.purchase_read(id)) {
            (closed, None) => closed,
            (closed, Some(open)) => {
                let (closed, open) = (closed?, open?);
                if closed == open {
                    return Ok(closed);
                }
                Ok(closed.or(open).map(|e| PurchaseEval { verdict: PurchaseVerdict::Unknown, ..e }))
            }
        }
    }




    /// Whether `n` is a notice of `collective` (Agreements type 24; F197, decided
    /// 10 October 2026) naming one of the acts `of` a payment owed back to
    /// `payer`, valid, public or sealed to that payer and to every member
    /// (done, rule 35a), whose deadline the caller states lapsed with no
    /// address given ([`Self::notices_lapsed`]).
    fn notice_lapsed(&self, n: &Hash, collective: &Hash, payer: Option<&Hash>, of: &[Hash]) -> bool {
        let Some(h) = self.v.get(n) else { return false };
        self.is_agreements(h, types::NOTICE)
            && self.author(h).as_ref() == Some(collective)
            && self.valid(n)
            // To an identity: public or sealed to it; to a one-time key
            // (F208): public.
            && (h.act.outside.content_key.is_some() || payer.is_some_and(|p| h.act.outside.to.iter().flatten().any(|q| q == p)))
            // Rule 35a: an act in the collective's name is done once sealed
            // to every member, or public.
            && self.current(collective).ok().flatten().and_then(|c| self.terms(&c.agreement).ok()).is_some_and(|t| self.sealed_to_all(h, &t))
            && Notice::decode(&h.inside).is_ok_and(|x| of.contains(&x.payment))
            && self.notices_lapsed.contains(n)
    }

    /// The payments a collective owes back, made under a publication it
    /// signed in a broken stretch, the sale not signed anew after the
    /// rollback (rule 93): a visible open obligation, one entry per payment
    /// (its first receipt or claim held). The network records and shows the
    /// debt; it cannot force a payment back.
    ///
    /// An entry that depends on whether two records whose payment is not
    /// stated are one payment is given back marked `unknown`; the others
    /// stand ([`Self::judged_list`]).
    pub fn owed_back(&self, collective: &Hash) -> R<Vec<OwedBack>> {
        let mark = |o| OwedBack { unknown: true, ..o };
        self.judged_list(|| self.answered_list(|| self.owed_back_unjudged(collective), mark), mark)
    }

    fn owed_back_unjudged(&self, collective: &Hash) -> R<Vec<OwedBack>> {
        use crate::money::Payload as Fin;
        let col = self.col(collective);
        let still_broken = self.broken(collective)?.is_some();
        let mut out = vec![];
        let mut seen: Vec<(Hash, Payment)> = vec![];
        // Records with the rail's answer, valid, first: a payment is named by
        // one of them where it has one, whichever reading (`answered`).
        let mut held: Vec<&Held> = self.v.held_acts().filter(|h| h.inside.spec == self.mirs.money).collect();
        held.sort_by_key(|h| !self.rail_valid.contains_key(&h.id));
        for h in held {
            let (payee, amount, key) = match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Receipt(r)) => (r.payee, r.amount, (r.rail, self.record_payment(&h.id, &r.proof))),
                Ok(Fin::Claim(r)) => (r.payee, r.amount, (r.rail, self.record_payment(&h.id, &r.proof))),
                _ => continue,
            };
            let _ = payee;
            if seen.iter().any(|k| self.same_on_rail(k, &key)) || !self.stretch_sale(&col, h)? {
                continue;
            }
            let Some(e) = self.purchase(&h.id)? else { continue };
            if let PurchaseVerdict::NoPurchase { .. } = &e.verdict {
                {
                    seen.push(key);
                    // QF5 (decided 9 October 2026, F190): repaid like any
                    // debt, by a payment naming what it repays.
                    let mut names = vec![h.id];
                    names.extend(self.same_payment(&h.id).into_iter().map(|(x, _)| x));
                    // F219: past the terms the buyer accepted by paying, the
                    // refund is ended, and owed no more.
                    if self.refund_ended(&names, e.purchase.as_ref()) {
                        continue;
                    }
                    let back = self.repaid(&names, &e.refund_to, &amount.unit);
                    if back < amount.value {
                        out.push(OwedBack { payment: h.id, to: e.refund_to.clone(), amount, still_broken, unknown: false });
                    }
                }
            }
        }
        Ok(out)
    }

    /// Whether a payment is made under a publication the collective signed
    /// in a broken stretch (rule 93): it pays a tag under a publication the
    /// collective is a party of, which does not count, the collective's own
    /// signature on it (its drafting, or its signature act) of the stretch.
    fn stretch_sale(&self, col: &Col, h: &Held) -> R<bool> {
        use crate::money::Payload as Fin;
        let fulfils = match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) => r.fulfils,
            Ok(Fin::Claim(c)) => c.fulfils,
            _ => return Ok(false),
        };
        let Some((tag, t)) = self.tag_of(&fulfils) else { return Ok(false) };
        let crate::money::Priced::Publication(first) = t.priced else { return Ok(false) };
        let pe = self.publication(&self.pub_version_for(&first, &tag.id))?;
        if pe.counts || !pe.parties.contains(&col.id) {
            return Ok(false);
        }
        let signing: Vec<&Held> = if pe.drafter == col.id {
            self.v.get(&pe.id).into_iter().collect()
        } else {
            self.col_acts(col).into_iter().filter(|a| self.is_agreements(a, types::SIGNATURE) && decode_signature(&a.inside).ok() == Some(pe.id)).collect()
        };
        for a in signing {
            if matches!(self.consent(&a.id)?, Consent::Broken { .. }) || self.in_a_stretch(col, a)?.is_some() {
                return Ok(true);
            }
        }
        Ok(false)
    }

    /// What has been paid back toward a refund owed on a payment
    /// (`payment`, any receipt or claim of it) to `to`, in `unit`: repaid
    /// like any debt, by a payment naming what it repays, proven by either
    /// side's record with the rail's proof (QF5, QG1, QG2; Money rules 10a
    /// and 14). For a refund owed outside this view's own judgments, such
    /// as a pooled anchoring service's under its standing offer's terms
    /// (F225, decided 10 October 2026: Agreements say what is owed, Money
    /// carries its payment): the caller judges what is owed; this says what
    /// Money shows repaid.
    /// `None` (unknown) only where it depends on whether two records whose
    /// payment is not stated are one payment (Money rule 12; [`Self::judged`]).
    pub fn refund_repaid(&self, payment: &Hash, to: &crate::money::RefundTo, unit: &Hash) -> Option<u64> {
        self.judged(|| {
            let mut names = vec![*payment];
            names.extend(self.same_payment(payment).into_iter().map(|(x, _)| x));
            self.repaid(&names, to, unit)
        })
    }

    /// Whether a refund owed on a payment (`names`, its receipts and
    /// claims) is ended (F219, decided 10 October 2026): the terms the
    /// buyer accepted by paying carry refund terms (the version of the
    /// claim the payment names, field 17; or a lone seller's offer it
    /// follows, field 7, F215), and the caller states the payment past
    /// their point on the time reference ([`Self::refunds_past_terms`]).
    /// Without refund terms nothing lapses (rule 32: the core sets none).
    fn refund_ended(&self, names: &[Hash], purchase: Option<&crate::money::Purchase>) -> bool {
        use crate::money::Payload as Fin;
        if !names.iter().any(|n| self.refunds_past_terms.contains(n)) {
            return false;
        }
        let from_claim = purchase.is_some_and(|p| {
            let v = if self.v.get(&p.line).is_some_and(|l| self.is_agreements(l, types::TERMS)) { p.line } else { p.agreement };
            self.terms(&v).is_ok_and(|t| t.refund.is_some())
        });
        let from_offer = names.iter().filter_map(|n| self.v.get(n)).any(|h| {
            let fulfils = match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Receipt(r)) => r.fulfils,
                Ok(Fin::Claim(c)) => c.fulfils,
                _ => return false,
            };
            // The publication whose tag the payment follows carries refund
            // terms (its field 8).
            match self.tag_of(&fulfils).map(|(_, t)| t.priced) {
                Some(crate::money::Priced::Publication(p)) => self.publication(&self.pub_version_for(&p, &h.id)).is_ok_and(|e| e.publication.refund.is_some()),
                _ => false,
            }
        });
        from_claim || from_offer
    }

    /// What has been paid back toward a payment owed back, `owed` being the
    /// acts of that payment (QF5, decided 9 October 2026, F190): repaid
    /// like any debt, by a payment naming what it repays (the receipt's
    /// field 5, or the claim's field 4: one of `owed`), in `unit`, proven by
    /// either side's record (double entry), whose rail's proof the caller
    /// checked (`rail_valid`). As for a debt, receipts are summed, and a
    /// claim adds what no receipt for its proof covers.
    ///
    /// - **To an identity** (QG2, decided 9 October 2026, "Agreed"): its
    ///   own receipt counts wherever the money went; a claim counts where
    ///   the rail shows the money reached the refund rail the payer's own
    ///   claim on the payment names (key 7, its `paid-to` naming that
    ///   claim; reading, to confirm), where one names it; otherwise the
    ///   pointer Money rule 14 selects from the payer's own acts on the
    ///   payment, or its pointer in force where they hold none, judged as
    ///   for any payment ([`Self::payment_counts`], rules 12 to 15); or
    ///   the payer's vault, always. A refund to the refund rail counts
    ///   only within the payer's vault limit for its unit (Agreements
    ///   draft 11, rule 11, F255); above it, only at the vault.
    /// - **To a bare key** (QG1, decided 9 October 2026): a claim counts
    ///   where the rail shows the money reached the refund rail a claim
    ///   carrying that key's signature names (Money rule 10a, key 7).
    /// - **To nobody**: nothing repays it (rule 10a).
    fn repaid(&self, owed: &[Hash], to: &crate::money::RefundTo, unit: &Hash) -> u64 {
        use crate::money::{PaidAt, Payer, Payload as Fin, RefundTo};
        let who: Option<Hash> = match to {
            RefundTo::Identity(h) => Some(*h),
            RefundTo::Key(_) => None,
            RefundTo::Nobody => return 0,
        };
        let payer_is = |p: &Payer| match (p, to) {
            (Payer::Identity(a), RefundTo::Identity(b)) => a == b,
            (Payer::Key(a), RefundTo::Key(b)) => a == b,
            _ => false,
        };
        // The payer's own claims on the payment naming a refund rail.
        let refund_rails: Vec<Hash> = owed
            .iter()
            .filter_map(|h| self.v.get(h))
            .filter(|h| self.payers_claim(h))
            .filter(|h| match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Claim(c)) => c.refund.is_some() && h.act.outside.signer.is_some_and(|s| payer_is(&c.payer(&s))),
                _ => false,
            })
            .map(|h| h.id)
            .collect();
        // Agreements draft 11, rule 11 (new in draft 11, F255): a refund
        // paid to that refund rail counts only up to the payer's vault
        // limit for its unit, as Money rule 3 judges a payment to the
        // flow; above it, only once it reaches the payer's vault. A payer
        // with no vault has no vault rule (rule 3), and a bare key has
        // none (Money rule 17). Money rule 4: the other conditions apply
        // to it as to any payment, so the vault is read as the payer's
        // chain stood for it, a lowered limit a lock change (rule 29;
        // [`Self::follows_at`]).
        let counts = |id: &Hash, at: &PaidAt, amount: &crate::money::Amount, proof: &[u8]| match (at, who) {
            (PaidAt::VaultEntry(..), Some(w)) => self.payment_counts_rec(&w, at, amount, (Some(id), proof), &owed[0]),
            (PaidAt::Flow(c), Some(w)) if !refund_rails.is_empty() => refund_rails.contains(c) && self.payment_counts_rec(&w, at, amount, (Some(id), proof), &owed[0]),
            (PaidAt::Flow(c), None) if !refund_rails.is_empty() => refund_rails.contains(c) && self.rail_named_at(id, at),
            (PaidAt::Flow(_), Some(w)) => self.payment_counts_rec(&w, at, amount, (Some(id), proof), &owed[0]),
            _ => false,
        };
        let mut receipts: Vec<((Hash, Payment), u64)> = vec![];
        let mut claims: Vec<((Hash, Payment), u64)> = vec![];
        for r in self.v.held_acts() {
            if r.inside.spec != self.mirs.money || !self.rail_valid.contains_key(&r.id) {
                continue;
            }
            match Fin::decode(r.inside.type_, &r.inside.payload) {
                Ok(Fin::Receipt(rc))
                    if owed.contains(&rc.fulfils)
                        && who.is_some_and(|w| rc.payee == w && self.author(r) == Some(w))
                        && &rc.amount.unit == unit
                        && self.money_counts(r)
                        && !self.receipt_overruled(&rc) =>
                {
                    receipts.push(((rc.rail, self.record_payment(&r.id, &rc.proof)), rc.amount.value));
                }
                Ok(Fin::Claim(c))
                    if owed.contains(&c.fulfils)
                        && who.is_none_or(|w| c.payee == w)
                        && &c.amount.unit == unit
                        && self.payers_claim(r)
                        && self.rail_valid.get(&r.id).is_some_and(|at| counts(&r.id, at, &c.amount, &c.proof))
                        && !self.claim_overruled(&c) =>
                {
                    claims.push(((c.rail, self.record_payment(&r.id, &c.proof)), c.amount.value));
                }
                _ => {}
            }
        }
        self.one_count(&receipts, &claims)
    }

    /// The other receipts and claims of the same rail payment as `id` (one
    /// rail proof, one payment), valid and not shown wrong by their rail,
    /// with the claim each names (F131, IT3).
    fn same_payment(&self, id: &Hash) -> Vec<(Hash, Option<crate::money::Purchase>)> {
        use crate::money::Payload as Fin;
        let of = |h: &Held| match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) if h.inside.spec == self.mirs.money => Some(((r.rail, self.record_payment(&h.id, &r.proof)), r.purchase)),
            Ok(Fin::Claim(r)) if h.inside.spec == self.mirs.money => Some(((r.rail, self.record_payment(&h.id, &r.proof)), r.purchase)),
            _ => None,
        };
        let Some(Some((mine, _))) = self.v.get(id).map(of) else { return vec![] };
        if mine.1 == Payment::None {
            return vec![];
        }
        let mut out = vec![];
        for h in self.v.held_acts() {
            if h.id == *id || self.rail_invalid.contains(&h.id) || !self.valid(&h.id) {
                continue;
            }
            if let Some((k, q)) = of(h) {
                if self.same_on_rail(&k, &mine) {
                    out.push((h.id, q));
                }
            }
        }
        out
    }


    /// The receipts `holder` signed for the same rail payment as `id` (the
    /// payment itself, where `holder` signed it, or a receipt carrying the
    /// same rail proof), that stand: a push rail's one payment to several
    /// holders (W4, F128).
    fn holder_receipts(&self, id: &Hash, holder: &Hash) -> Vec<&'a Held> {
        use crate::money::Payload as Fin;
        let proof = |h: &Held| match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::Receipt(r)) if h.inside.spec == self.mirs.money => Some((r.rail, self.record_payment(&h.id, &r.proof))),
            Ok(Fin::Claim(r)) if h.inside.spec == self.mirs.money => Some((r.rail, self.record_payment(&h.id, &r.proof))),
            _ => None,
        };
        let Some(x) = self.v.get(id) else { return vec![] };
        let mine = proof(x);
        self.v
            .signed_by(holder)
            .filter(|h| {
                h.inside.spec == self.mirs.money
                    && h.inside.type_ == crate::money::types::RECEIPT
                    && self.valid(&h.id)
                    && self.rail_counts(&h.id)
                    && (h.id == *id || mine.as_ref().is_some_and(|m| proof(h).is_some_and(|x| self.same_on_rail(m, &x))))
            })
            .collect()
    }


    /// Whether `holder`'s receipt `r` was recorded after its own signature
    /// on one of the acts `over` (W4, F128): that signature (the act itself,
    /// or its signature act naming it) lies before `r` on `r`'s own
    /// sequence. A signature on another of the holder's sequences is not
    /// before it: each holder's clock is its own, and it answers for it.
    fn after_own_signature(&self, r: &Held, holder: &Hash, over: &[Hash]) -> bool {
        let mut signed: BTreeSet<Hash> = BTreeSet::new();
        for a in over {
            if self.v.get(a).is_some_and(|h| self.author(h).as_ref() == Some(holder)) {
                signed.insert(*a);
            }
            for (_, s) in self.valid_sigs(a, &[*holder]) {
                signed.insert(s);
            }
        }
        let mut cur = r.inside.prev.as_deref().and_then(|p| p.first()).copied();
        for _ in 0..1_000_000 {
            let Some(y) = cur else { return false };
            if signed.contains(&y) {
                return true;
            }
            cur = self
                .v
                .get(&y)
                .filter(|h| self.author(h).as_ref() == Some(holder))
                .and_then(|h| h.inside.prev.as_deref().and_then(|p| p.first()).copied());
        }
        false
    }




    // ------------------------------------------------------------ the pointer

    /// The payee pointer in force of an identity, as Agreements judge it
    /// (Money draft 10, rule 7, F358): for a collective, a pointer signed
    /// with its own key or with the member keys of the area reaching Money
    /// type 0 (F353), counting where that area's holders and threshold are
    /// met; the error says why none counts. A Money-only client shows a
    /// pointer signed with a member key as unknown.
    pub fn payee_pointer(&self, who: &Hash) -> R<Result<(Hash, crate::money::PayeePointer), String>> {
        self.pointer_in_force(who)
    }

    /// The latest valid payee pointer of an identity that counts: for a
    /// collective, one its Money lane's consent carries.
    fn pointer_in_force(&self, who: &Hash) -> R<Result<(Hash, crate::money::PayeePointer), String>> {
        use crate::money as fin;
        let held = self.pointers_held(who)?;
        let l = fin::latest_pointer(&held);
        if l.contested {
            return Ok(Err("a payee pointer chain is contested".into()));
        }
        match l.act.and_then(|a| held.into_iter().find(|(i, _)| *i == a)) {
            Some(x) => Ok(Ok(x)),
            None => Ok(Err("no payee pointer in force is held".into())),
        }
    }

    /// Every valid payee pointer of an identity held: for a collective,
    /// those its Money lane's consent carries.
    fn pointers_held(&self, who: &Hash) -> R<Vec<(Hash, crate::money::PayeePointer)>> {
        use crate::money::{self as fin, Payload as Fin};
        let mut held = vec![];
        for h in self.payees_acts(who) {
            if h.inside.spec != self.mirs.money || h.inside.type_ != fin::types::PAYEE_POINTER {
                continue;
            }
            let Ok(Fin::PayeePointer(p)) = Fin::decode(h.inside.type_, &h.inside.payload) else {
                continue;
            };
            if &p.payee == who && self.valid(&h.id) && self.consent(&h.id)?.counts() {
                held.push((h.id, p));
            }
        }
        Ok(held)
    }

    /// The vault an identity's chain declares in force (Money rule 14a):
    /// its entries, none where it declares no vault.
    fn vault_in_force(&self, who: &Hash) -> Vec<crate::money::VaultEntry> {
        self.vault_at(who, usize::MAX)
    }

    /// The vault an identity's chain declares in force at its link `k`
    /// (Money rules 14a and 15: the chain as published there).
    fn vault_at(&self, who: &Hash, k: usize) -> Vec<crate::money::VaultEntry> {
        let res = self.v.resolve(who);
        let mut out = vec![];
        // F153: not past a link counting only through own attempts.
        for (l, st) in res.links.iter().zip(&res.states).take(k.saturating_add(1)) {
            if self.refuses(&l.act) {
                break;
            }
            match crate::money::vault_in(&self.mirs.money, &st.declarations) {
                Ok(Some(Some(e))) => out = e,
                Ok(Some(None)) => out = vec![],
                _ => {}
            }
        }
        out
    }

    /// The pointer check (rule 16): where a collective names a split
    /// agreement, its payee pointer counts, for Agreements, only if every
    /// address in it also appears in the split service's own signed pointer
    /// in force, and every entry of its vault in force in that service's own
    /// vault, or both in those of a backup the split agreement names.
    /// `agreement` is the collective's ownership agreement (any version).
    pub fn pointer_check(&self, owners: &Hash, agreement: &Hash) -> R<PointerCheck> {
        let Some(sa) = self.split_agreement_of(agreement)? else { return Ok(PointerCheck::NoSplitService) };
        let undetermined = |w: String| Ok(PointerCheck::Undetermined { reason: w });
        let (pid, mine) = match self.pointer_in_force(owners)? {
            Ok(x) => x,
            Err(w) => return undetermined(format!("the owners' pointer: {w}")),
        };
        let my_vault = self.vault_in_force(owners);
        let mut first_missing = None;
        for service in sa.publication.services() {
            let theirs = match self.pointer_in_force(&service)? {
                Ok((_, p)) => p,
                Err(_) => continue,
            };
            let their_vault = self.vault_in_force(&service);
            let missing: Vec<_> = mine.rails.iter().filter(|r| !theirs.rails.contains(r)).cloned().collect();
            let vault_missing: Vec<_> = my_vault.iter().filter(|e| !their_vault.contains(e)).cloned().collect();
            if missing.is_empty() && vault_missing.is_empty() {
                return Ok(PointerCheck::Ordinary { pointer: pid, service });
            }
            first_missing.get_or_insert((missing, vault_missing));
        }
        match first_missing {
            Some((missing, vault_missing)) => Ok(PointerCheck::Bypasses { pointer: pid, missing, vault_missing }),
            None => undetermined("no split service's own pointer in force is held".into()),
        }
    }

    /// Whether the split agreement a fork's successor's founding `succ`
    /// names first pays the kept holders' stake less than the original's
    /// split agreement in force at the fork `fork`'s line (rules 48, 95,
    /// item 4): what each takes off the top, the fees each bears, and the
    /// split cMIP and its parameters. An original naming none pays its
    /// stake through no split: a successor's that takes anything off the
    /// top pays it less. A successor naming none changes nothing here.
    fn successor_split_pays_less(&self, original: &Hash, fork: &Hash, succ: &Hash) -> R<bool> {
        let first_of = |root: &Hash| -> Option<Hash> {
            self.v.held_acts().find_map(|h| {
                let (_, a) = self.pub_act(&h.id)?;
                (a.follows.is_none() && a.publication.is_split_agreement() && a.publication.owners.as_ref() == Some(root) && self.valid(&h.id)).then_some(h.id)
            })
        };
        let Some(sf) = first_of(succ) else { return Ok(false) };
        let Some((_, sa)) = self.pub_act(&sf) else { return Ok(false) };
        let orig = self.line_of(original).and_then(|r| first_of(&r)).map(|of| self.pub_version_for(&of, fork));
        Ok(match orig.and_then(|v| self.pub_act(&v)) {
            Some((_, oa)) => !super::owners_line_lowered(&oa.publication, &sa.publication).is_empty(),
            None => !sa.publication.partners.is_empty() || !sa.publication.plan.fees.is_empty() || !sa.publication.plan.shares.is_empty(),
        })
    }

    /// A collective's split agreement in force (rule 15): the latest counting
    /// version of a split agreement naming the collective's ownership
    /// agreement `agreement` (by its line), where one is held.
    pub(super) fn split_agreement_of(&self, agreement: &Hash) -> R<Option<PublicationEval>> {
        let Some(root) = self.line_of(agreement) else { return Ok(None) };
        let mut best: Option<PublicationEval> = None;
        for h in self.v.held_acts() {
            let Some((_, a)) = self.pub_act(&h.id) else { continue };
            if a.follows.is_some() || !a.publication.is_split_agreement() || a.publication.owners != Some(root) {
                continue;
            }
            for tip in self.pub_tips(&h.id) {
                let e = self.publication(&tip)?;
                if e.counts {
                    best = Some(e);
                    break;
                }
            }
            if best.is_none() {
                let e = self.publication(&h.id)?;
                if e.counts {
                    best = Some(e);
                }
            }
        }
        Ok(best)
    }

    // ------------------------------------------------------------ splits

    /// A split, judged against the publication it follows (rules 16 to 29):
    /// conservation, each fee and its receiver, delivery to every holder
    /// and partner it pays, each partner paid its share exactly, and the
    /// owners' line divided by the stake read by reference, within one
    /// smallest unit of rounding per payout.
    pub fn split(&self, id: &Hash) -> R<SplitEval> {
        self.judged_r(|| self.split_unjudged(id))
    }

    /// Whether a split's payouts sum exactly to the amount its receipt or
    /// claim shows (rule 21), summed wide. `None` where the receipt is not
    /// held.
    fn split_sums(&self, s: &Split) -> Option<bool> {
        use crate::money::Payload as Fin;
        let total: u128 = s.payouts.iter().map(|p| p.amount as u128).sum();
        self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => Some(x.amount.value as u128 == total),
            Ok(Fin::Claim(x)) => Some(x.amount.value as u128 == total),
            _ => None,
        })
    }

    /// The version of a split's publication the payment it names is judged
    /// under: the version a tag the payment follows was read under, or, for
    /// a payment following no tag, the version the receipt's history holds.
    fn split_pub_version(&self, s: &Split) -> Hash {
        use crate::money::Payload as Fin;
        let fulfils = self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => Some(x.fulfils),
            Ok(Fin::Claim(x)) => Some(x.fulfils),
            _ => None,
        });
        match fulfils.filter(|f| self.tag_of(f).is_some()) {
            Some(tag) => self.pub_version_for(&s.publication, &tag),
            None => self.pub_version_for(&s.publication, &s.receipt),
        }
    }

    /// The ownership agreement's version whose stake pays a split's owners'
    /// line (rule 12): read by reference from the receipt's field 9 where it
    /// names one, the version in force otherwise.
    fn split_owners_version(&self, s: &Split, owners: &Hash) -> R<Hash> {
        use crate::money::Payload as Fin;
        let named = self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => x.purchase,
            Ok(Fin::Claim(x)) => x.purchase,
            _ => None,
        });
        match named {
            Some(p) if &p.agreement == owners => match self.version_by_reference(&s.receipt, owners, &p.line)? {
                Ok(v) => Ok(v),
                Err(_) => self.version_in_force(owners),
            },
            _ => self.version_in_force(owners),
        }
    }

    fn split_unjudged(&self, id: &Hash) -> R<SplitEval> {
        use crate::money::Payload as Fin;
        let h = self.held(id)?;
        if !self.is_agreements(h, types::SPLIT) {
            return Err(AgreementsError::Check("not a split"));
        }
        let s = Split::decode(&h.inside.payload)?;
        let sums = self.split_sums(&s);
        let fees = s.payouts.iter().filter_map(|p| p.fee_module.map(|m| (m, p.receiver, p.amount))).collect();
        let public = h.act.outside.content_key.is_some();
        let to = h.act.outside.to.clone().unwrap_or_default();
        let mut undelivered = vec![];
        for p in &s.payouts {
            if (p.stake.is_some() || p.partner.is_some()) && !public && !to.contains(&p.receiver) && !undelivered.contains(&p.receiver) {
                undelivered.push(p.receiver);
            }
        }
        let mut problems: Vec<String> = vec![];
        let mut e = SplitEval {
            id: *id,
            split: s.clone(),
            sums,
            fees,
            undelivered,
            collective: None,
            mismatched: vec![],
            problems: vec![],
            in_force: s.publication,
            unevidenced: vec![],
            unplanned: vec![],
            turns_unknown: vec![],
            breaks: vec![],
            count_unknown: vec![],
            numbering: None,
            cites: crate::money::Citations::of(&h.inside).acts(),
            unequal_roles: vec![],
            fees_skipped: vec![],
            metric_problems: vec![],
            own_not_to_vault: vec![],
            partners_mismatched: vec![],
            publication: s.publication,
        };
        match self.pub_act(&s.publication) {
            Some((_, a)) if a.follows.is_none() => {}
            Some(_) => problems.push("it names a publication by a later version, not its first (\"Split (type 8)\")".into()),
            None => {
                problems.push("the publication it names is not held".into());
                e.problems = problems;
                return Ok(e);
            }
        }
        let version = self.split_pub_version(&s);
        e.publication = version;
        let pe = self.publication(&version)?;
        if !pe.counts {
            problems.push(format!("the publication it follows does not count: {}", pe.problems.join("; ")));
        }
        let p = &pe.publication;
        if !self.valid(id) {
            problems.push("it is not valid under Identity".into());
        }
        if self.key_grant(h).is_some() {
            problems.push("it is signed with a grant key, not the service's own key (rule 20)".into());
        }
        if self.named_collective(h).is_some() {
            problems.push("it is signed for a collective it names (rule 58), not in the service's own name (rule 20)".into());
        }
        let services = p.services();
        match h.act.outside.signer {
            Some(signer) if services.contains(&signer) => {
                // A backup splits a payment only where every attempt before
                // it failed for that payment (rule 17).
                let mut acts = vec![s.receipt];
                acts.extend(self.same_payment(&s.receipt).into_iter().map(|(x, _)| x));
                let before: Vec<Hash> = services.iter().take_while(|x| **x != signer).copied().collect();
                if before.iter().any(|b| !acts.iter().any(|a| self.attempts_failed.contains(&(*a, *b)))) {
                    problems.push("a backup splits a payment only once every attempt before it failed for that payment (rule 17)".into());
                }
            }
            _ => problems.push("its signer is none of the split services the publication names (rule 20)".into()),
        }
        let payee = self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => Some(x.payee),
            Ok(Fin::Claim(x)) => Some(x.payee),
            _ => None,
        });
        let total: u128 = s.payouts.iter().map(|x| x.amount as u128).sum();
        let collective = match &p.owners {
            Some(o) => self.collective_of(o)?,
            None => None,
        };
        e.collective = collective;
        // What a payout may pay: a partner of the publication, a role, a fee
        // or a metric share of its plan, or the owners' line.
        let mut unplanned: Vec<Hash> = vec![];
        let mut unevidenced: Vec<Hash> = vec![];
        let lone_owner = p.owners.is_none().then(|| pe.parties[0]);
        for x in &s.payouts {
            let planned = if let Some(i) = x.partner {
                p.partners.get(i as usize).is_some_and(|q| q.identity == x.receiver)
            } else if let Some(r) = &x.role {
                p.plan.roles().contains(&r.as_str())
            } else if let Some(m) = &x.fee_module {
                p.plan.fees.iter().any(|f| &f.module == m)
            } else if let Some(i) = x.metric {
                matches!(p.plan.shares.get(i as usize), Some(super::open_formats::ShareRule::Metric { .. }))
            } else if x.stake.is_some() {
                true
            } else {
                lone_owner == Some(x.receiver)
            };
            if !planned && !unplanned.contains(&x.receiver) {
                unplanned.push(x.receiver);
            }
            if x.role.is_some() {
                let holds = match (x.evidence, payee, h.act.outside.signer) {
                    (Some(ev), Some(payee), Some(service)) => {
                        let role = match self.v.get(&ev).map(|y| (y.inside.spec == self.mirs.money, Fin::decode(y.inside.type_, &y.inside.payload))) {
                            Some((true, Ok(Fin::Receipt(y)))) => Role::RailModule(y.rail),
                            Some((true, Ok(Fin::Claim(y)))) => Role::RailModule(y.rail),
                            _ => Role::Other,
                        };
                        self.v.get(&ev).is_some() && self.role_evidence(&ev, &role, &service, &payee)? && (role != Role::Other || self.payer_acknowledged(&ev, &s.receipt))
                    }
                    _ => false,
                };
                if !holds && !unevidenced.contains(&x.receiver) {
                    unevidenced.push(x.receiver);
                }
            }
        }
        e.unplanned = unplanned;
        e.unevidenced = unevidenced;
        // Several fillers of one role, paid equally within one unit.
        let mut roles: Vec<&String> = s.payouts.iter().filter_map(|x| x.role.as_ref()).collect();
        roles.sort();
        roles.dedup();
        for r in roles {
            let mut by: BTreeMap<Hash, u128> = BTreeMap::new();
            for x in s.payouts.iter().filter(|x| x.role.as_ref() == Some(r)) {
                *by.entry(x.receiver).or_default() += x.amount as u128;
            }
            let (lo, hi) = (by.values().min().copied().unwrap_or(0), by.values().max().copied().unwrap_or(0));
            if hi > lo + 1 {
                e.unequal_roles.push(r.clone());
            }
        }
        // Each partner its share of the payment exactly, within one unit.
        for (i, q) in p.partners.iter().enumerate() {
            let paid: u128 = s.payouts.iter().filter(|x| x.partner == Some(i as u64)).map(|x| x.amount as u128).sum();
            let exact = total * q.share as u128;
            let m = MILLION as u128;
            if paid * m + m <= exact || paid * m >= exact + m {
                e.partners_mismatched.push(Mismatch { stake: i as u64, holder: q.identity, paid: paid as u64, due: (exact / m) as u64 });
            }
        }
        // Fees each entry makes owed on this payment.
        let rail_of = self.v.get(&s.receipt).and_then(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
            Ok(Fin::Receipt(x)) => Some(x.rail),
            Ok(Fin::Claim(x)) => Some(x.rail),
            _ => None,
        });
        for f in &p.plan.fees {
            let owed = match &f.scope {
                super::open_formats::FeeScope::Every => true,
                super::open_formats::FeeScope::Rail(r) => rail_of.as_ref() == Some(r),
                super::open_formats::FeeScope::Bake(b) => p.sold.iter().flatten().any(|x| x == &super::open_formats::Sold::Bake(*b)),
            };
            if owed && !s.payouts.iter().any(|x| x.fee_module == Some(f.module)) && !e.fees_skipped.contains(&f.module) {
                e.fees_skipped.push(f.module);
            }
        }
        if !e.fees_skipped.is_empty() {
            problems.push("it leaves out a fee the publication's plan makes owed on this payment: a wrong split, the fee the service's open obligation (rule 28)".into());
        }
        // The owners' line, divided by the stake read by reference.
        let mut owners_holders: Vec<Hash> = vec![];
        if let Some(o) = &p.owners {
            let line: Vec<&Payout> = s.payouts.iter().filter(|x| x.stake.is_some()).collect();
            for x in &line {
                if x.owners.as_ref() != Some(o) && !self.nested_owner(o, x.owners.as_ref(), 0) {
                    e.mismatched.push(Mismatch { stake: 0, holder: x.receiver, paid: x.amount, due: 0 });
                }
            }
            let version = self.split_owners_version(&s, o)?;
            e.in_force = version;
            self.check_owners_line(h, &s, o, &version, &line, &mut e, &mut owners_holders, 0)?;
        }
        // Metric shares: their measurer, their records, paying only those the
        // plan already pays.
        let metric_payouts: Vec<&Payout> = s.payouts.iter().filter(|x| x.metric.is_some()).collect();
        if !metric_payouts.is_empty() {
            let mut already: Vec<Hash> = p.partners.iter().map(|q| q.identity).collect();
            already.extend(owners_holders.iter().copied());
            for x in &metric_payouts {
                let i = x.metric.unwrap_or_default() as usize;
                let Some(super::open_formats::ShareRule::Metric { metric, .. }) = p.plan.shares.get(i) else {
                    e.metric_problems.push("a metric payout names no metric share of the plan".into());
                    continue;
                };
                let Some(mm) = p.plan.metrics.get(*metric as usize) else { continue };
                if Some(mm.measurer) == h.act.outside.signer {
                    e.metric_problems.push("the metric's measurer is the split service (rule 29)".into());
                }
                if metric_payouts.iter().any(|q| q.metric == x.metric && q.receiver == mm.measurer) {
                    e.metric_problems.push("the metric's measurer is paid by its own metric (rule 29)".into());
                }
                if !already.contains(&x.receiver) {
                    e.metric_problems.push("a metric pays only identities the plan already pays (rule 29)".into());
                }
                let recorded = s.metric_records.iter().any(|r| self.v.get(r).is_some_and(|y| y.inside.spec == mm.module && y.act.outside.signer == Some(mm.measurer) && self.valid(r)));
                if !recorded {
                    e.metric_problems.push("no record of the metric's Module signed by its measurer is named (rule 29)".into());
                }
            }
            e.metric_problems.sort();
            e.metric_problems.dedup();
        }
        // One numbering across every split the service makes under the
        // publication; a split with none, or a number another carries,
        // breaks the plan.
        if let Some(service) = h.act.outside.signer {
            e.numbering = match s.number {
                None => Some(NumberBreak::Unnumbered),
                Some(n) => {
                    let with: Vec<Hash> = self.split_numbers(&service, &s.publication)?.numbers.into_iter().filter(|(m, x)| *m == n && x != id).map(|(_, x)| x).collect();
                    (!with.is_empty()).then_some(NumberBreak::Repeated { number: n, with })
                }
            };
        }
        // The collective's own part, a partner naming the collective in its
        // split agreement, is paid to its vault (rule 22).
        if let (Some(c), true) = (collective, p.is_split_agreement()) {
            let idx: Vec<u64> = p.partners.iter().enumerate().filter(|(_, q)| q.identity == c).map(|(i, _)| i as u64).collect();
            if !idx.is_empty() && s.payouts.iter().any(|x| x.partner.is_some_and(|i| idx.contains(&i))) {
                for r in self.v.held_acts() {
                    if r.inside.spec != self.mirs.money || !self.valid(&r.id) {
                        continue;
                    }
                    let Ok(Fin::Receipt(x)) = Fin::decode(r.inside.type_, &r.inside.payload) else { continue };
                    let names = x.fulfils == *id || r.inside.objects.iter().flatten().any(|o| o.chain == *id || o.predecessor == *id);
                    if names && x.payee == c && self.rail_valid.get(&r.id).is_some_and(|at| !matches!(at, crate::money::PaidAt::VaultEntry(v, _) if *v == c)) {
                        e.own_not_to_vault.push(r.id);
                    }
                }
                if self.vault_in_force(&c).is_empty() {
                    problems.push("a collective keeps its own part only where it declares a vault (rule 22)".into());
                }
            }
        }
        e.problems = problems;
        Ok(e)
    }

    /// Whether `named` is an ownership agreement reached from `owners` as a
    /// holder of its stake, at most eight layers down (rule 15).
    fn nested_owner(&self, owners: &Hash, named: Option<&Hash>, depth: usize) -> bool {
        let Some(named) = named else { return false };
        if depth >= NESTING_BOUND {
            return false;
        }
        let Ok(v) = self.version_in_force(owners) else { return false };
        let Ok(t) = self.terms(&v) else { return false };
        t.stakes.iter().flatten().flat_map(|st| st.holders.iter()).filter_map(|(w, _)| w.id()).any(|x| x == named || (self.names_a_line(x) && self.nested_owner(x, Some(named), depth + 1)))
    }

    /// The owners' line of a split under the ownership agreement `owners`,
    /// read at `version` (rules 9, 12, 15): every holder its share of what
    /// is paid on the line, leftovers by largest remainder with ties by
    /// turns along the service's splits, a holder that is itself an
    /// ownership agreement paid through it (its part divided among its own
    /// holders, each payout naming it), at most eight layers.
    #[allow(clippy::too_many_arguments)]
    fn check_owners_line(&self, h: &Held, s: &Split, owners: &Hash, version: &Hash, line: &[&Payout], e: &mut SplitEval, holders_out: &mut Vec<Hash>, depth: usize) -> R<()> {
        if depth >= NESTING_BOUND {
            return Ok(());
        }
        let t = self.terms(version)?;
        let Some(stake) = t.stakes.iter().flatten().next() else {
            for x in line {
                e.mismatched.push(Mismatch { stake: 0, holder: x.receiver, paid: x.amount, due: 0 });
            }
            return Ok(());
        };
        let as_held: Vec<(Option<Hash>, u64)> = self.holders_as_held(version, 0, stake, stake.holders.iter().map(|(w, n)| (w.id().copied(), *n)).collect());
        // A holder that is an ownership agreement is paid through it: its
        // part is the payouts naming it, and those reaching its own holders.
        let mapped: Vec<Payout> = line
            .iter()
            .map(|x| {
                let mut q = (*x).clone();
                if x.owners.as_ref() != Some(owners) {
                    if let Some(a) = as_held.iter().filter_map(|(w, _)| *w).find(|a| x.owners.as_ref() == Some(a) || self.nested_owner(a, x.owners.as_ref(), 0)) {
                        q.receiver = a;
                    }
                }
                q
            })
            .collect();
        let paid_on: Vec<&Payout> = mapped.iter().collect();
        let pot: u128 = paid_on.iter().map(|x| x.amount as u128).sum();
        let ids: Option<Vec<(Hash, u64)>> = as_held.iter().map(|(w, n)| w.map(|w| (w, *n))).collect();
        holders_out.extend(as_held.iter().filter_map(|(w, _)| *w));
        let Some(ids) = ids else { return Ok(()) };
        let pot64 = u64::try_from(pot).unwrap_or(u64::MAX);
        let rounded = round_stake(pot64, &ids);
        let by_receipt = self.v.get(&s.receipt).is_some_and(|r| r.inside.spec == self.mirs.money && r.inside.type_ == crate::money::types::RECEIPT);
        let before = match (depth, h.act.outside.signer) {
            (0, Some(service)) => self.tally_check(h, s, &service, owners, &ids, pot64, &paid_on, &mut e.breaks, &mut e.count_unknown)?,
            _ => None,
        };
        let turns = if rounded.units == 0 || !by_receipt || depth > 0 {
            None
        } else {
            before.map(|b| ids.iter().map(|(w, _)| b.iter().filter(|(x, _)| x == w).map(|(_, n)| *n).sum()).collect::<Vec<u64>>())
        };
        if rounded.units > 0 && by_receipt && turns.is_none() && depth == 0 && !e.turns_unknown.contains(&0) {
            e.turns_unknown.push(0);
        }
        let parts = match &turns {
            Some(counts) => divide_stake(pot64, &ids, Ties::Turns(counts)).unwrap_or(rounded.parts.clone()),
            None => rounded.parts.clone(),
        };
        let free = turns.is_none();
        for (i, (who, _)) in ids.iter().enumerate() {
            let (lo, hi) = (parts[i], parts[i] + u64::from(free && rounded.tied.contains(&i)));
            let got: u128 = paid_on.iter().filter(|x| x.receiver == *who).map(|x| x.amount as u128).sum();
            if got < lo as u128 || got > hi as u128 {
                e.mismatched.push(Mismatch { stake: 0, holder: *who, paid: got as u64, due: lo });
            }
        }
        for x in &paid_on {
            if !ids.iter().any(|(w, _)| *w == x.receiver) {
                e.mismatched.push(Mismatch { stake: 0, holder: x.receiver, paid: x.amount, due: 0 });
            }
        }
        // Each holder that is an ownership agreement: its part divided among
        // its own holders, by the payouts naming it.
        for (a, _) in &ids {
            if !self.names_a_line(a) || !self.terms(a).is_ok_and(|x| x.target.is_some()) {
                continue;
            }
            let inner: Vec<&Payout> = line.iter().filter(|x| x.owners.as_ref() == Some(a) || self.nested_owner(a, x.owners.as_ref(), 0)).copied().collect();
            if inner.is_empty() {
                continue;
            }
            let v = self.version_in_force(a)?;
            let mut sub = SplitEval { mismatched: vec![], breaks: vec![], count_unknown: vec![], turns_unknown: vec![], ..e.clone() };
            self.check_owners_line(h, s, a, &v, &inner, &mut sub, holders_out, depth + 1)?;
            e.mismatched.extend(sub.mismatched.into_iter().filter(|m| m.holder != *a));
        }
        Ok(())
    }

    /// Rule 9's turns: the leftover units each of `holders` has received so
    /// far from `service`'s splits on the owners' line of `owners` (its
    /// founding version), as the split act `previous` carries them in its
    /// running count; with no `previous`, every count is zero; `None` where
    /// `previous` is not held, not one of the service's splits on that line,
    /// or carries no count.
    pub fn turns(&self, service: &Hash, owners: &Hash, holders: &[(Hash, u64)], previous: Option<&Hash>) -> R<Option<Vec<u64>>> {
        let Some(p) = previous else { return Ok(Some(vec![0; holders.len()])) };
        let Some(ph) = self.v.get(p) else { return Ok(None) };
        let Some(split) = self.tally_member(ph, service, owners)? else { return Ok(None) };
        let Some(count) = split.tally_of(0) else { return Ok(None) };
        Ok(Some(holders.iter().map(|(w, _)| count.iter().filter(|(x, _)| x == w).map(|(_, n)| *n).sum()).collect()))
    }

    /// The split `h` as a link of `service`'s tally chain on the owners'
    /// line of `owners` (rule 9): one of the service's splits, valid and
    /// signed with its own key, under a publication naming `owners`, paying
    /// the owners' line. The count runs along the service's splits across
    /// every version of the ownership agreement, and every publication
    /// naming it.
    fn tally_member(&self, h: &Held, service: &Hash, owners: &Hash) -> R<Option<Split>> {
        if h.act.outside.signer.as_ref() != Some(service) || !self.is_agreements(h, types::SPLIT) || !self.valid(&h.id) || self.key_grant(h).is_some() {
            return Ok(None);
        }
        let Ok(x) = Split::decode(&h.inside.payload) else { return Ok(None) };
        let Some((_, a)) = self.pub_act(&x.publication) else { return Ok(None) };
        if a.publication.owners.as_ref() != Some(owners) || !x.payouts.iter().any(|p| p.stake.is_some()) {
            return Ok(None);
        }
        Ok(Some(x))
    }

    /// Where `h` sits in `service`'s tally chain on `owners`' line: the
    /// previous split its envelope cites.
    fn prior(&self, h: &Held, service: &Hash, owners: &Hash) -> R<Prior> {
        let mut found = vec![];
        for c in crate::money::Citations::of(&h.inside).acts() {
            let Some(x) = self.v.get(&c) else { return Ok(Prior::Unknown) };
            if self.tally_member(x, service, owners)?.is_some() && !found.contains(&c) {
                found.push(c);
            }
        }
        Ok(match found.as_slice() {
            [] => Prior::First,
            [p] => Prior::After(*p),
            _ => Prior::Unknown,
        })
    }

    /// Rule 9's tally chain for the split `h` (decoded `s`) of `service` on
    /// `owners`' line: finds the previous split it cites; pushes to `breaks`
    /// a reset or a fork the acts held show, a running count that is not the
    /// previous one plus this split's leftover units, or a count missing;
    /// pushes to `count_unknown` where the previous count cannot be read.
    /// Returns the count before this split; `None` where unknown.
    #[allow(clippy::too_many_arguments)]
    fn tally_check(
        &self,
        h: &Held,
        s: &Split,
        service: &Hash,
        owners: &Hash,
        ids: &[(Hash, u64)],
        pot: u64,
        paid_on: &[&Payout],
        breaks: &mut Vec<ChainBreak>,
        count_unknown: &mut Vec<u64>,
    ) -> R<Option<Vec<(Hash, u64)>>> {
        if self.tally_member(h, service, owners)?.is_none() {
            return Ok(None);
        }
        let prior = self.prior(h, service, owners)?;
        let mut first_too = vec![];
        let mut same_previous = vec![];
        for y in self.v.signed_by(service) {
            if y.id == h.id || self.tally_member(y, service, owners)?.is_none() {
                continue;
            }
            match &prior {
                Prior::First => {
                    if self.prior(y, service, owners)? == Prior::First {
                        first_too.push(y.id);
                    }
                }
                Prior::After(p) => {
                    if crate::money::Citations::of(&y.inside).acts().contains(p) {
                        same_previous.push(y.id);
                    }
                }
                Prior::Unknown => {}
            }
        }
        first_too.sort();
        same_previous.sort();
        if !first_too.is_empty() {
            breaks.push(ChainBreak::Reset { stake: 0, with: first_too });
        }
        if let Prior::After(p) = &prior {
            if !same_previous.is_empty() {
                breaks.push(ChainBreak::Fork { stake: 0, previous: *p, with: same_previous });
            }
        }
        let before: Option<Vec<(Hash, u64)>> = match &prior {
            Prior::First => Some(vec![]),
            Prior::After(p) => match self.v.get(p) {
                Some(x) => self.tally_member(x, service, owners)?.and_then(|x| x.tally_of(0).map(|c| c.to_vec())),
                None => None,
            },
            Prior::Unknown => None,
        };
        let carried = s.tally_of(0);
        if carried.is_none() {
            breaks.push(ChainBreak::NoCount { stake: 0 });
        }
        match (&before, carried) {
            (None, _) => {
                if !count_unknown.contains(&0) {
                    count_unknown.push(0);
                }
            }
            (Some(b), Some(c)) => {
                let paid: Vec<(Hash, u64)> = paid_on.iter().map(|p| (p.receiver, p.amount)).collect();
                let expected = running_count(b, &leftovers(pot, ids, &paid));
                if !same_count(c, &expected) {
                    breaks.push(ChainBreak::Count { stake: 0, carried: c.to_vec(), expected });
                }
            }
            (Some(_), None) => {}
        }
        Ok(before)
    }

    /// The splits a service signed with its own key (rule 20), valid under
    /// Identity, each decoded.
    fn splits_of(&self, service: &Hash) -> Vec<(&'a Held, Split)> {
        self.v
            .signed_by(service)
            .filter(|h| self.is_agreements(h, types::SPLIT) && self.key_grant(h).is_none() && self.valid(&h.id))
            .filter_map(|h| Split::decode(&h.inside.payload).ok().map(|s| (h, s)))
            .collect()
    }

    /// The publications a service is the split service or a backup of: the
    /// first versions held whose line, at any counting version, names it.
    fn served_by(&self, service: &Hash) -> Vec<Hash> {
        let mut out = vec![];
        for h in self.v.held_acts() {
            let Some((_, a)) = self.pub_act(&h.id) else { continue };
            let first = a.follows.map(|(f, _)| f).unwrap_or(h.id);
            if a.publication.services().contains(service) && !out.contains(&first) {
                out.push(first);
            }
        }
        out
    }

    /// Where the receipt `y`, signed by `service`, receipts a collective's
    /// share paid by another's split (rule 15): a split of another service
    /// paying a collective whose split agreement names `service`; that
    /// split agreement's first version. `None` otherwise.
    fn layer_share(&self, y: &Held, service: &Hash) -> Option<Hash> {
        use crate::money::Payload as Fin;
        if y.inside.spec != self.mirs.money {
            return None;
        }
        let Ok(Fin::Receipt(r)) = Fin::decode(y.inside.type_, &y.inside.payload) else { return None };
        let named = std::iter::once(r.fulfils).chain(y.inside.objects.iter().flatten().flat_map(|o| [o.chain, o.predecessor]));
        for x in named {
            let Some(sh) = self.v.get(&x).filter(|h| self.is_agreements(h, types::SPLIT)) else { continue };
            if sh.act.outside.signer.as_ref() == Some(service) {
                continue;
            }
            let Ok(s) = Split::decode(&sh.inside.payload) else { continue };
            for p in &s.payouts {
                let Ok(Some(f)) = self.founding_ag_of(&p.receiver) else { continue };
                if let Ok(Some(sa)) = self.split_agreement_of(&f) {
                    if sa.publication.services().contains(service) {
                        return Some(sa.first);
                    }
                }
            }
        }
        None
    }

    /// A collective's founding agreement, where `who` is a collective held.
    fn founding_ag_of(&self, who: &Hash) -> R<Option<Hash>> {
        Ok(self.founding_of(who))
    }

    /// What a split service owes (rule 29; audit, October 2026, gap 3).
    /// Unsplit: every receipt the service signed with a grant key, backed,
    /// binding, or unknown under a limited grant (money coming in for its
    /// grantor, rules 19 and 20), and every
    /// payer's claim with the rail's answer ([`Self::rail_valid`]) to a
    /// grantor of the service for which the grantor holds no receipt, that
    /// no split of the service's own key names; the old service owes on
    /// everything it received before (rule 30). Unpaid: every payout of
    /// such a split that no receipt of its receiver naming the split
    /// discharges in full (rules 23, 24, 24a); a receiver that is a
    /// collective signs by its own rules. Each names one receiver and one
    /// agreement (rule 55).
    pub fn service_account(&self, service: &Hash) -> R<ServiceAccount> {
        self.judged_r(|| self.service_account_unjudged(service))
    }

    fn service_account_unjudged(&self, service: &Hash) -> R<ServiceAccount> {
        use crate::money::Payload as Fin;
        let splits = self.splits_of(service);
        let split_names = |payment: &Hash| splits.iter().any(|(_, s)| &s.receipt == payment && self.split_sums(s) != Some(false));
        let served = self.served_by(service);
        // What a payment to the service is under: a price tag of a
        // publication it serves, or that publication itself (a tip); a
        // collective's share another split paid it (its split agreement).
        let under = |fulfils: &Hash| -> Option<Hash> {
            if let Some((_, t)) = self.tag_of(fulfils) {
                if let crate::money::Priced::Publication(p) = t.priced {
                    return served.contains(&p).then_some(p);
                }
                return None;
            }
            if let Some((_, a)) = self.pub_act(fulfils) {
                let first = a.follows.map(|(f, _)| f).unwrap_or(*fulfils);
                return served.contains(&first).then_some(first);
            }
            None
        };
        let mut unsplit = vec![];
        for h in self.v.signed_by(service) {
            if h.inside.spec != self.mirs.money || self.key_grant(h).is_some() || !self.valid(&h.id) {
                continue;
            }
            let Ok(Fin::Receipt(r)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if &r.payee != service {
                continue;
            }
            let Some(agreement) = under(&r.fulfils).or_else(|| self.layer_share(h, service)) else { continue };
            if !split_names(&h.id) {
                unsplit.push(Unsplit { payment: h.id, claim: false, receiver: r.payee, agreement, amount: r.amount });
            }
        }
        // Payers' claims showing money arrived at the service without its
        // receipt.
        for h in self.v.held_acts() {
            if h.inside.spec != self.mirs.money || !self.rail_valid.contains_key(&h.id) || !self.payers_claim(h) {
                continue;
            }
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { continue };
            if &c.payee != service {
                continue;
            }
            let Some(agreement) = under(&c.fulfils) else { continue };
            if self.receipts_for_proof(&c.proof).iter().any(|(_, r)| &r.payee == service) {
                continue;
            }
            if !split_names(&h.id) {
                unsplit.push(Unsplit { payment: h.id, claim: true, receiver: c.payee, agreement, amount: c.amount });
            }
        }
        // Each payout, discharged by its receiver's own receipts naming the
        // split; a collective's, by its split service's receipt naming it.
        let mut unpaid = vec![];
        let mut owed_to_buyers: Vec<(Hash, usize, Hash, u64)> = vec![];
        for (sh, s) in &splits {
            for (i, p) in s.payouts.iter().enumerate() {
                let mut received: u64 = 0;
                let mut payers: Vec<Hash> = vec![p.receiver];
                if let Ok(Some(f)) = self.founding_ag_of(&p.receiver) {
                    if let Ok(Some(sa)) = self.split_agreement_of(&f) {
                        payers.extend(sa.publication.services());
                    }
                }
                for who in &payers {
                    for r in self.payees_acts(who) {
                        if r.inside.spec != self.mirs.money || self.key_grant(r).is_some() || !self.valid(&r.id) {
                            continue;
                        }
                        let Ok(Fin::Receipt(x)) = Fin::decode(r.inside.type_, &r.inside.payload) else { continue };
                        // A payout's receipt names the split in its field 5, what it fulfils
                        // (rule 23; Money, "What a payment fulfils"; F412).
                        let names = x.fulfils == sh.id;
                        if &x.payee != who || !names || !self.consent(&r.id)?.counts() {
                            continue;
                        }
                        if let Some((_, buyer, split, idx, owed)) = self.wrong_payout_receipt(r) {
                            if split == sh.id && idx == i && !owed_to_buyers.contains(&(split, idx, buyer, owed)) {
                                owed_to_buyers.push((split, idx, buyer, owed));
                            }
                            continue;
                        }
                        received = received.saturating_add(x.amount.value);
                    }
                }
                if received < p.amount {
                    unpaid.push(Unpaid { split: sh.id, payout: i, receiver: p.receiver, agreement: s.publication, amount: p.amount, received });
                }
            }
        }
        for (split, idx, buyer, owed) in self.owed_from_citing_splits(&splits) {
            if !owed_to_buyers.iter().any(|(s, i, b, _)| *s == split && *i == idx && *b == buyer) {
                owed_to_buyers.push((split, idx, buyer, owed));
            }
        }
        let mut fees_skipped = vec![];
        for (sh, _) in &splits {
            for m in self.split(&sh.id)?.fees_skipped {
                fees_skipped.push((sh.id, m));
            }
        }
        Ok(ServiceAccount { service: *service, unsplit, unpaid, fees_skipped, owed_to_buyers })
    }

    // ------------------------------------------------------------ each participant's check

    /// Each participant's check (F250): once the agreement's condition is
    /// triggered by a purchase (`payment`, its receipt or claim), is `me`'s
    /// cut at its flow address, or its vault where needed? The core keeps
    /// the signed agreement, the receipts, and the guarantee that money
    /// goes only to addresses the owners signed; the rest is the split
    /// cMIP's. The trail runs layer by layer (F235), at most eight deep:
    ///
    /// - where `me` is the payment's payee (payer-side splitting, rule 18,
    ///   or a lone owner, F244), the payment is its cut;
    /// - otherwise each split that names the payment (rule 20), signed by a
    ///   split service the publication names, field 3's or a backup's,
    ///   assigns it its payouts to `me`; a payout to another receiver that
    ///   receipts it in its own name, naming the split, is the next layer's
    ///   payment (F235), followed in turn.
    ///
    /// What arrived is what `me`'s own receipts show, as for a payout's
    /// discharge ([`Self::service_account`]), each with the rail's answer
    /// placing it at `me`'s flow address or vault ([`Self::at_mine`]). *Readings, the build's:* the payer's claim alone does not count
    /// here, as for a discharge; a split that breaks its plan is followed
    /// all the same, and named in `stops`.
    pub fn cut_check(&self, payment: &Hash, me: &Hash) -> R<CutCheck> {
        let mut out = CutCheck::default();
        let mut seen = BTreeSet::new();
        self.cut_walk(payment, me, 0, &mut seen, &mut out)?;
        Ok(out)
    }

    fn cut_walk(&self, payment: &Hash, me: &Hash, depth: usize, seen: &mut BTreeSet<Hash>, out: &mut CutCheck) -> R<()> {
        use crate::money::Payload as Fin;
        if depth >= NESTING_BOUND || !seen.insert(*payment) {
            return Ok(());
        }
        let Some(ph) = self.v.get(payment).filter(|h| h.inside.spec == self.mirs.money) else {
            out.stops.push("the payment is not held, or is not a Money receipt or claim".into());
            return Ok(());
        };
        let (payee, amount) = match Fin::decode(ph.inside.type_, &ph.inside.payload) {
            Ok(Fin::Receipt(r)) => (r.payee, r.amount.value),
            Ok(Fin::Claim(c)) => (c.payee, c.amount.value),
            _ => {
                out.stops.push("the payment is not a Money receipt or claim".into());
                return Ok(());
            }
        };
        // The acts of the same rail payment: a split names the one that
        // brought the money to the service (rule 20), the payer's claim or
        // the service's receipt.
        let mut acts = vec![*payment];
        acts.extend(self.same_payment(payment).into_iter().map(|(h, _)| h));
        let splits: Vec<&Held> = self
            .v
            .held_acts()
            .filter(|h| self.is_agreements(h, types::SPLIT) && Split::decode(&h.inside.payload).is_ok_and(|s| acts.contains(&s.receipt)))
            .collect();
        // Paid to me directly (a lone seller its own split service, or a
        // tip): the payment is my cut. Not where I received it as the split
        // service of a publication with other parties (its owners, its
        // partners): that money is mine to split (rule 20).
        let fulfils = match Fin::decode(ph.inside.type_, &ph.inside.payload) {
            Ok(Fin::Receipt(r)) => r.fulfils,
            Ok(Fin::Claim(c)) => c.fulfils,
            _ => *payment,
        };
        let first = match self.tag_of(&fulfils) {
            Some((_, t)) => match t.priced {
                crate::money::Priced::Publication(f) => Some(f),
                crate::money::Priced::Bake(_) => None,
            },
            None => self.pub_act(&fulfils).map(|(_, a)| a.follows.map(|(f, _)| f).unwrap_or(fulfils)),
        };
        let by_service = match first {
            Some(f) => {
                let pe = self.publication(&self.pub_version_for(&f, payment))?;
                pe.publication.services().contains(me) && (pe.publication.owners.is_some() || !pe.publication.partners.is_empty() || &pe.drafter != me)
            }
            None => false,
        };
        if splits.is_empty() && &payee == me && !by_service {
            out.due = out.due.saturating_add(amount);
            let proof = self.proof_of(payment);
            let before = out.received;
            self.cut_arrived(me, amount, |r, x| r.id == *payment || x.proof == proof, out);
            if out.received.saturating_sub(before) < amount {
                out.stops.push("no receipt of yours at your flow address or vault for the payment yet (Money rules 12, 14a)".into());
            }
            return Ok(());
        }
        if splits.is_empty() {
            if depth == 0 {
                out.stops.push("no split names the payment yet: the service's open obligation (rule 29)".into());
            }
            return Ok(());
        }
        for sh in splits {
            let e = self.split(&sh.id)?;
            let mine: u64 = e.split.payouts.iter().filter(|p| &p.receiver == me).map(|p| p.amount).fold(0, u64::saturating_add);
            let wrong = !e.problems.is_empty() || !e.mismatched.is_empty() || e.sums == Some(false) || !e.breaks.is_empty() || e.numbering.is_some();
            if wrong && (mine > 0 || depth == 0) {
                out.stops.push(format!("the split {} breaks its plan (rules 20, 21, 26)", hex_of(&sh.id)));
            }
            if mine > 0 {
                out.due = out.due.saturating_add(mine);
                let before = out.received;
                self.cut_arrived(me, mine, |_, x| x.fulfils == sh.id, out);
                if out.received.saturating_sub(before) < mine {
                    out.stops.push(format!("a payout of the split {} has no receipt of yours at your flow address or vault yet (rules 23, 29)", hex_of(&sh.id)));
                }
            }
            // The next layer: a receiver that receipts its payout in its own
            // name, naming the split (F235).
            for p in e.split.payouts.iter().filter(|p| &p.receiver != me) {
                let next: Vec<Hash> = self
                    .v
                    .signed_by(&p.receiver)
                    .filter(|r| r.inside.spec == self.mirs.money && self.key_grant(r).is_none() && self.valid(&r.id))
                    .filter(|r| match Fin::decode(r.inside.type_, &r.inside.payload) {
                        Ok(Fin::Receipt(x)) => x.payee == p.receiver && x.fulfils == sh.id,
                        _ => false,
                    })
                    .map(|r| r.id)
                    .collect();
                for n in next {
                    self.cut_walk(&n, me, depth + 1, seen, out)?;
                }
            }
        }
        Ok(())
    }

    /// Whether the rail's answer places a payment at `me`'s flow address or
    /// vault (F250's "my flow address (or vault if needed)"): a payee
    /// pointer of `me`'s own on the chain of its pointers that counts (Money
    /// rule 12, [`crate::money::pointer_counts`]), the amount within what
    /// the vault in force leaves to the flow (rule 14a); or an entry of a
    /// vault `me`'s chain declared that its vault in force still carries.
    /// *Reading, the build's:* which version a debt counts toward (rule 14)
    /// is the payer's question, not the participant's: any version of its
    /// chain that counts is its flow address.
    fn at_mine(&self, me: &Hash, at: &crate::money::PaidAt, amount: &crate::money::Amount) -> bool {
        use crate::money::{self as fin, PaidAt};
        let vault = self.vault_in_force(me);
        match at {
            PaidAt::Flow(p) => {
                let chain = self.pointers_at(me, usize::MAX);
                chain.iter().any(|(i, _)| i == p) && fin::pointer_counts(&chain, p) && fin::flow_followed_vault((!vault.is_empty()).then_some(vault.as_slice()), amount)
            }
            PaidAt::VaultEntry(d, i) => {
                let res = self.v.resolve(me);
                let Some(k) = res.position_of(d) else { return false };
                let Ok(Some(Some(declared))) = fin::vault_in(&self.mirs.money, &res.states[k].declarations) else { return false };
                declared.get(*i as usize).is_some_and(|e| vault.iter().any(|x| x.unit == e.unit && x.rail_module == e.rail_module && x.source == e.source))
            }
        }
    }

    /// The rail proof a receipt or claim carries, empty otherwise.
    fn proof_of(&self, id: &Hash) -> Vec<u8> {
        use crate::money::Payload as Fin;
        match self.v.get(id).map(|h| Fin::decode(h.inside.type_, &h.inside.payload)) {
            Some(Ok(Fin::Receipt(r))) => r.proof,
            Some(Ok(Fin::Claim(c))) => c.proof,
            _ => vec![],
        }
    }

    /// `me`'s own receipts that `names` picks, up to `due`: each valid,
    /// signed with its own key, counting by its consent, with the rail's
    /// answer placing the payment where its pointer or vault leads.
    fn cut_arrived(&self, me: &Hash, due: u64, names: impl Fn(&Held, &crate::money::Receipt) -> bool, out: &mut CutCheck) {
        use crate::money::Payload as Fin;
        let mut got: u64 = 0;
        for r in self.payees_acts(me) {
            if r.inside.spec != self.mirs.money || self.key_grant(r).is_some() || !self.valid(&r.id) || out.receipts.contains(&r.id) || out.elsewhere.contains(&r.id) {
                continue;
            }
            let Ok(Fin::Receipt(x)) = Fin::decode(r.inside.type_, &r.inside.payload) else { continue };
            if &x.payee != me || !names(r, &x) || !self.consent(&r.id).is_ok_and(|c| c.counts()) {
                continue;
            }
            let placed = self.rail_valid.get(&r.id).is_some_and(|at| self.at_mine(me, at, &x.amount));
            if placed && got < due {
                got = got.saturating_add(x.amount.value);
                out.receipts.push(r.id);
            } else if !placed {
                out.elsewhere.push(r.id);
            }
        }
        out.received = out.received.saturating_add(got.min(due));
    }

    // ------------------------------------------------------------ the release

    /// A public domain release, judged (rule 17, F121 shape D): every direct
    /// owner of the work signs (N7), unless the release rule says otherwise;
    /// a collective owner signs by its own rules, meeting the lanes of every
    /// layer a release touches (Envelopes, Money, Agreements). A timed release
    /// names a point on each agreement's time reference (N11).
    pub fn release(&self, id: &Hash) -> R<ReleaseEval> {
        let h = self.held(id)?;
        if !self.is_agreements(h, types::RELEASE) {
            return Err(AgreementsError::Check("not a release"));
        }
        let r = Release::decode(&h.inside)?;
        let mut e = ReleaseEval {
            id: *id,
            release: r.clone(),
            complete: false,
            why: None,
            holders: vec![],
            signed: vec![],
        };
        let fail = |mut e: ReleaseEval, w: &str| {
            e.why = Some(w.into());
            Ok(e)
        };
        if !self.valid(id) {
            return fail(e, "the release is not valid under Identity");
        }
        if h.act.outside.content_key.is_none() {
            return fail(e, "a release is public, so that its content keys are published");
        }
        let mut met = true;
        for (ag, i) in &r.stakes {
            let lineage = self.lineage(ag)?;
            let named = &lineage[0].1;
            let Some(_stake) = named.stakes.iter().flatten().nth(*i as usize) else {
                return fail(e, "a release names a stake its agreement does not define");
            };
            if self.target_work(named).as_ref() != Some(&r.work) {
                return fail(e, "a release names a stake in another work");
            }
            // The release rule, the holders and the time reference are those
            // of the agreement in force (rule 17, "the release rule of each
            // such agreement in force"): its latest version, which the
            // version the release names must be, or one it descends from
            // (audit, October 2026, gap 7: naming an older, looser version
            // ends nothing).
            let current = self.version_for(ag)?;
            let in_force = self.lineage(&current)?;
            if !in_force.iter().any(|(x, _)| x == ag) {
                return fail(e, "a release names a version of the claiming agreement that is neither in force nor one the version in force descends from (rule 17)");
            }
            let t = &in_force[0].1;
            let Some(stake) = t.stakes.iter().flatten().next().filter(|_| self.target_work(t).as_ref() == Some(&r.work)) else {
                return fail(e, "the claiming agreement in force holds no stake in the work (rule 17)");
            };
            if r.timed.is_some() && t.time.is_none() && t.cmip(TIME_REFERENCE_TASK).is_none() {
                return fail(e, "a timed release names a point on the time reference of each agreement whose stake it ends (N11)");
            }
            let this = if t.is_collective() { self.collective_of(ag)? } else { None };
            let mut holders = vec![];
            let mut shares = vec![];
            for (w, n) in &stake.holders {
                match w.resolve(this.as_ref()) {
                    Some(x) => {
                        holders.push(x);
                        shares.push((x, *n));
                    }
                    None => return fail(e, "a holder written null, and the collective is not held"),
                }
            }
            let mut signed = vec![];
            for x in &holders {
                // A collective holder's release of its stake in a work is an
                // owners' matter of its own stake in itself (rule 95; new in
                // draft 14, F310): it signs only once its owners consented.
                if self.signed_act(h, x)? && self.owners_consent(x, id)?.is_ok() {
                    signed.push(*x);
                }
            }
            // The release rule in force: set at founding, changed only by a
            // clone every owner signs (N8).
            // Counted by share, never by head (F308).
            met &= match t.release_rule.clone().unwrap_or(ReleaseRule::Holders(HoldersRule::Every)) {
                ReleaseRule::Holders(HoldersRule::Every) => holders.iter().all(|x| signed.contains(x)),
                ReleaseRule::Holders(HoldersRule::Share(need)) => {
                    shares.iter().filter(|(x, _)| signed.contains(x)).map(|(_, n)| *n).sum::<u64>() >= need
                }
                ReleaseRule::Named(n) => n.iter().all(|x| signed.contains(x)),
            };
            for x in holders {
                if !e.holders.contains(&x) {
                    e.holders.push(x);
                }
            }
            for x in signed {
                if !e.signed.contains(&x) {
                    e.signed.push(x);
                }
            }
        }
        let order = e.holders.clone();
        e.signed.sort_by_key(|x| order.iter().position(|h| h == x));
        if !met {
            return fail(e, "the release rule is not met: by default, every direct owner of the work signs (N7)");
        }
        e.complete = true;
        Ok(e)
    }

    /// The complete release of a work, if one is held.
    pub fn released(&self, work: &Hash) -> R<Option<ReleaseEval>> {
        for x in self.v.held_acts() {
            if !self.is_agreements(x, types::RELEASE) {
                continue;
            }
            if !Release::decode(&x.inside).is_ok_and(|r| &r.work == work) {
                continue;
            }
            let e = self.release(&x.id)?;
            if e.complete {
                return Ok(Some(e));
            }
        }
        Ok(None)
    }

    /// A claim on a released work that the release does not name in its
    /// history: shown beside the release, openly contested (rule 15, N12),
    /// which the release cannot end. The release, if so.
    pub fn claim_after_release(&self, claim: &Hash, work: &Hash) -> R<Option<Hash>> {
        let Some(e) = self.released(work)? else { return Ok(None) };
        Ok((!e.release.claims.contains(claim) && claim != &e.id).then_some(e.id))
    }
}

/// `total` divided among a fork's sides (Agreements, "Fork (type 19)", Ownership;
/// F150, F162): by largest remainder as rule 15a, each side named by its
/// successor, ties ordered by tagged_hash("MOR/law/leftover", [ fork act,
/// successor ]), the fork act standing for rule 15a's receipt (decided by
/// Nobody, allegedly, 6 October 2026). The order the sides are listed in
/// decides nothing.
fn divide_fork(fork: &Hash, total: u64, by: &[(Hash, u64)]) -> Vec<u64> {
    divide_stake(total, by, Ties::Hash(fork)).expect("with a tie hash, every division is determined")
}

/// `total` divided by `weights`, in whole parts, leftovers to the first: a
/// fork's members counted alike, for the share each leaving member keeps,
/// which the successors' founding terms name before the fork exists (left
/// open, see [`divide_fork`]'s caller).
fn divide_first(total: u64, weights: &[u64]) -> Vec<u64> {
    let sum: u128 = weights.iter().map(|w| *w as u128).sum();
    if sum == 0 {
        return vec![0; weights.len()];
    }
    let mut out: Vec<u64> = weights.iter().map(|w| ((total as u128) * (*w as u128) / sum) as u64).collect();
    let left = total - out.iter().sum::<u64>();
    if let Some(f) = out.first_mut() {
        *f += left;
    }
    out
}

/// A hash written in hexadecimal, for words shown to a person.
fn hex_of(h: &Hash) -> String {
    h.iter().map(|b| format!("{b:02x}")).collect()
}


