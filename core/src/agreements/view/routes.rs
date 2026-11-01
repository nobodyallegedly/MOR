//! Money's routes across rails (Money rules 24 to 28, with rules 11, 12
//! and 15), read from the receipts and claims a verifier holds, and the
//! rail's answers it was given.
//!
//! In plain words: one payment carried in several hops, through conversion
//! services, reads as one chain. Each hop is shown by its receiver's
//! receipt, or, where the next payee signs none, by the paying hop's own
//! claim; each names the previous hop's receipt (receipt field 6, claim
//! key 10) and carries on exactly what that hop declared it would pass on,
//! its forward (receipt field 7). Where a hop declared a forward and no
//! valid receipt or claim of the next hop names it, the route stops there,
//! and the forward stays that hop's open obligation, under the agreement
//! the forward names (rule 27). Every failure names its hop and agreement
//! (rule 28). What follows (a refund, a penalty, a contest) is Agreements'
//! business, and how a conversion is priced is the conversion cMIP's: the
//! core checks no rate (rule 25's "at the rate its agreement defines").
//!
//! *As the texts now say* (Money rule 24): each hop is paid by the
//! previous hop's payee to the forward's next payee, its received amount
//! the forward's; a claim carries a forward on only as the paying hop's
//! own, signed by the previous hop's payee, and a receipt that names a
//! payer names that service. A forward may be carried in parts: the
//! records naming it add up to it, one payment counted once (rule 12), and
//! a stop shows only the shortfall (rule 27). Where more records carry a
//! forward than it needs, a receipt is taken before a claim, then the
//! smallest act id. The buyer of a purchase paid through a route is its
//! first payer, by their claim of the first hop naming the tag the
//! purchase names ([`AgreementsView::route_buyer`]); a refund owed on it
//! runs back hop by hop (rule 28, [`AgreementsView::refund_along`]).

use super::*;
use crate::money::{Amount, Claim, Forward, Payload as Fin, Payer, Receipt};

/// One hop's record, as a route reads it: a receipt signed by the hop's
/// receiver, or the paying hop's claim.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct HopRecord {
    pub id: Hash,
    pub claim: bool,
    /// Who signed it, read as rule 58 reads an act for a collective.
    pub signer: Option<Hash>,
    /// A receipt's payer (field 2), where it names an identity; a claim's
    /// payer is its signer.
    pub payer: Option<Hash>,
    pub payee: Hash,
    pub amount: Amount,
    pub fulfils: Hash,
    pub rail: Hash,
    pub proof: Vec<u8>,
    /// The previous hop's receipt it names (receipt field 6, claim key 10).
    pub previous: Option<Hash>,
    /// What it passes on (receipt field 7; a claim declares none).
    pub forward: Option<Forward>,
    pub batch: Option<Hash>,
}

/// A forward no valid record of the next hop carries on (Money rule 27):
/// an open obligation of the hop that declared it, under the agreement the
/// forward names.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ForwardOwed {
    /// The receipt declaring the forward.
    pub declared_by: Hash,
    /// Who owes it: that receipt's payee, the conversion service.
    pub debtor: Hash,
    /// To whom: the forward's next payee.
    pub creditor: Hash,
    pub amount: Amount,
    /// The agreement the forward names.
    pub agreement: Hash,
}

/// A route, as the records held show it (Money rules 24 to 28).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RouteVerdict {
    /// Rule 24: every record valid, each naming the previous hop's receipt,
    /// each hop's payee and amount the previous hop's forward, ending at a
    /// record that declares no forward. The records, first to last.
    Valid { hops: Vec<Hash> },
    /// Rule 27: the route stops at the receipt `at`, whose forward no valid
    /// record of the next hop carries on: its open obligation. `near`: the
    /// records naming it that do not carry it on, and why (rule 28).
    Stopped { hops: Vec<Hash>, at: Hash, owed: ForwardOwed, near: Vec<(Hash, String)> },
    /// Rule 28: the route breaks at the record `at`, under `agreement`
    /// (the forward it should have carried on, or what it fulfils): why.
    Broken { hops: Vec<Hash>, at: Hash, agreement: Option<Hash>, why: String },
    /// Whether it is valid cannot be told from what is held: a record on it
    /// whose rail answer is pending or not held, or a payment the rail's
    /// answer does not name (rule 12).
    Unknown { at: Hash, why: String },
}

impl RouteVerdict {
    pub fn is_valid(&self) -> bool {
        matches!(self, RouteVerdict::Valid { .. })
    }
}

/// Why a record does not carry the previous hop's forward on: a failure of
/// the route (rule 28), or what cannot be told yet.
enum Link {
    Carries,
    Fails(String),
    Unknown(String),
}

impl<'a> AgreementsView<'a> {
    /// A held receipt or claim, as a route reads it.
    pub(super) fn hop_record(&self, id: &Hash) -> Option<HopRecord> {
        let h = self.v.get(id)?;
        if h.inside.spec != self.mirs.money {
            return None;
        }
        let signer = self.author(h);
        Some(match Fin::decode(h.inside.type_, &h.inside.payload).ok()? {
            Fin::Receipt(Receipt { rail, proof, payer, payee, amount, fulfils, previous, forward, batch, .. }) => HopRecord {
                id: *id,
                claim: false,
                signer,
                payer: match payer {
                    Some(Payer::Identity(p)) => Some(p),
                    _ => None,
                },
                payee,
                amount,
                fulfils,
                rail,
                proof,
                previous,
                forward,
                batch,
            },
            Fin::Claim(Claim { rail, proof, payee, amount, fulfils, previous, .. }) => {
                HopRecord { id: *id, claim: true, signer, payer: signer, payee, amount, fulfils, rail, proof, previous, forward: None, batch: None }
            }
            _ => return None,
        })
    }

    /// Whether a record stands for a route: valid under Identity and, for
    /// a receipt, signed by the hop's receiver; for a claim, a payer's
    /// claim that stands (Money rule 7).
    fn hop_stands(&self, r: &HopRecord) -> bool {
        let Some(h) = self.v.get(&r.id) else { return false };
        if r.claim {
            self.payers_claim(h)
        } else {
            r.signer == Some(r.payee) && self.money_counts(h)
        }
    }

    /// Rule 24's "valid" for one record: it stands, and its rail's answer
    /// is valid (rules 8 and 10). `Err` with why not, and whether that is
    /// only not known yet (an answer pending or not held).
    fn hop_valid(&self, r: &HopRecord) -> Result<(), (bool, String)> {
        if !self.hop_stands(r) {
            return Err((false, if r.claim { "not a payer's claim that stands (Money rule 7)".into() } else { "not a valid receipt signed by the hop's receiver (Money rule 7)".into() }));
        }
        if self.rail_valid.contains_key(&r.id) {
            return Ok(());
        }
        if self.rail_invalid.contains(&r.id) {
            return Err((false, "its rail's answer is invalid (Money rule 8)".into()));
        }
        Err((true, "its rail's answer is pending or not held (Money rules 8 and 10)".into()))
    }

    /// The other standing records of `r`'s payment (Money rule 12, as the
    /// rail Module tells payments apart).
    fn same_payment_records(&self, r: &HopRecord) -> Vec<HopRecord> {
        self.v
            .held_acts()
            .filter(|h| h.inside.spec == self.mirs.money && h.id != r.id)
            .filter_map(|h| self.hop_record(&h.id))
            .filter(|x| x.rail == r.rail && self.hop_stands(x) && self.same_payment_of((Some(&x.id), &x.proof), (Some(&r.id), &r.proof)))
            .collect()
    }

    /// Money rules 11 and 12 for the previous hop a record names. Rule 11:
    /// a receipt and a claim of one payment naming different previous
    /// receipts: where the rail binds the previous hop (its specification's
    /// field 13 holds 2), the commitment decides, and two records the rail
    /// answered valid both contradict each other; otherwise the payer's
    /// claim decides, the receiver's contrary receipt counting for nothing,
    /// shown as a dispute on the receiver. Rule 12: records of one payment
    /// naming different previous receipts, under no batch they share,
    /// count for neither until the receiver signs receipts of it naming one
    /// alone.
    fn previous_contested(&self, r: &HopRecord) -> Option<String> {
        use crate::development::Bound;
        let others = self.same_payment_records(r);
        let binds = self.rail_binds(&r.rail, Bound::PreviousHop);
        // Rule 11, between a receipt and a claim.
        for x in others.iter().filter(|x| x.claim != r.claim && x.previous != r.previous && self.rail_valid.contains_key(&x.id)) {
            if binds {
                return Some(format!("rule 11: {} of the same payment names another previous hop, and the rail binds the previous hop: the two contradict each other", if x.claim { "the payer's claim" } else { "the receiver's receipt" }));
            }
            if !r.claim {
                return Some("rule 11: the payer's claim of the same payment names another previous hop, and the rail binds none: the claim decides, this receipt shown as a dispute on the receiver".into());
            }
        }
        // Rule 12, records of one kind: two claims, or two receipts under no
        // batch they share.
        let conflict = others.iter().any(|x| {
            x.claim == r.claim
                && x.previous != r.previous
                && !(r.batch.is_some() && r.batch == x.batch)
                && !(x.claim && !binds && others.iter().any(|y| !y.claim && y.previous == r.previous && self.rail_valid.contains_key(&y.id)))
        });
        if !conflict {
            return None;
        }
        // Resolved where the receiver signed receipts of the payment, every
        // one naming this record's previous hop.
        let receipts: Vec<&HopRecord> = others.iter().filter(|x| !x.claim).collect();
        let resolved = r.claim && !receipts.is_empty() && receipts.iter().all(|x| x.previous == r.previous);
        if resolved {
            return None;
        }
        Some("rule 12: another record of the same payment names another previous hop, under no batch they share: one payment, one count, so neither carries a forward on until the receiver resolves them".into())
    }

    /// Whether `next` carries on the forward the receipt `prev` declares
    /// (Money rules 24, 25, 11 and 12).
    fn link(&self, prev: &HopRecord, next: &HopRecord) -> Link {
        if next.previous != Some(prev.id) {
            return Link::Fails("it does not name the previous hop's receipt (receipt field 6, claim key 10)".into());
        }
        let Some(f) = &prev.forward else {
            return Link::Fails("the receipt it names declares no forward: only conversion hops forward (Money rule 25)".into());
        };
        match self.hop_valid(next) {
            Ok(()) => {}
            Err((true, why)) => return Link::Unknown(why),
            Err((false, why)) => return Link::Fails(why),
        }
        if next.payee != f.next_payee {
            return Link::Fails("its payee is not the forward's next payee (Money rule 24)".into());
        }
        if next.claim && next.signer != Some(prev.payee) {
            return Link::Fails("a claim carries a forward on only as the paying hop's own: signed by the previous hop's payee, the conversion service that pays on (Money rule 24)".into());
        }
        if !next.claim && next.payer.is_some_and(|p| p != prev.payee) {
            return Link::Fails("its payer is not the previous hop's payee, the conversion service that pays on".into());
        }
        if next.amount.unit != f.amount.unit {
            return Link::Fails("it received another unit than the previous hop's forward (Money rule 24)".into());
        }
        if next.amount.value > f.amount.value || next.amount.value == 0 {
            return Link::Fails(format!("it received {} where the previous hop's forward is {} (Money rule 24)", next.amount.value, f.amount.value));
        }
        if let Some(why) = self.previous_contested(next) {
            return Link::Fails(why);
        }
        Link::Carries
    }

    /// The records of the next hop carrying the forward the receipt `prev`
    /// declares (Money rules 24 and 12): the records naming it that carry
    /// it on, one per payment (a receipt before a claim of the same
    /// payment, then the smallest act id), taken in that order while they
    /// add up to no more than the forward; with the records naming it that
    /// do not carry it, and why (a part beyond what remains of the forward
    /// among them), and whether one cannot be told yet.
    fn carried_parts(&self, prev: &HopRecord) -> (Vec<HopRecord>, u64, Vec<(Hash, String)>, Option<(Hash, String)>) {
        let Some(f) = prev.forward.clone() else { return (vec![], 0, vec![], None) };
        let mut carriers: Vec<HopRecord> = vec![];
        let mut near: Vec<(Hash, String)> = vec![];
        let mut unknown: Option<(Hash, String)> = None;
        for h in self.v.held_acts().filter(|h| h.inside.spec == self.mirs.money && h.id != prev.id) {
            let Some(n) = self.hop_record(&h.id) else { continue };
            if n.previous != Some(prev.id) {
                continue;
            }
            match self.link(prev, &n) {
                Link::Carries => carriers.push(n),
                Link::Unknown(why) => {
                    if unknown.is_none() {
                        unknown = Some((n.id, why.clone()));
                    }
                    near.push((n.id, why));
                }
                Link::Fails(why) => near.push((n.id, why)),
            }
        }
        carriers.sort_by_key(|n| (n.claim, n.id));
        let mut parts: Vec<HopRecord> = vec![];
        let mut sum: u64 = 0;
        for n in carriers {
            // One payment, one count (rule 12): a record of a payment
            // already counted adds nothing.
            if parts.iter().any(|x| x.rail == n.rail && self.same_payment_of((Some(&x.id), &x.proof), (Some(&n.id), &n.proof))) {
                continue;
            }
            if sum + n.amount.value > f.amount.value {
                near.push((n.id, "the records naming the forward already carry what remains of it: one payment, one count (Money rules 12 and 24)".into()));
                continue;
            }
            sum += n.amount.value;
            parts.push(n);
        }
        near.sort();
        (parts, sum, near, unknown)
    }

    /// The route ending at the held receipt or claim `last`, as its final
    /// creditor reads it (Money rule 26: each hop's receipt, or the claim
    /// showing it, disclosed to the final creditor): followed back through
    /// the previous hop each record names, checked hop by hop (rule 24).
    /// Valid only where it starts at a receipt naming no previous one, and
    /// `last` declares no forward. A record naming no previous hop is a
    /// route of one hop.
    pub fn route_to(&self, last: &Hash) -> RouteVerdict {
        let Some(mut cur) = self.hop_record(last) else {
            return RouteVerdict::Broken { hops: vec![], at: *last, agreement: None, why: "not a receipt or claim held".into() };
        };
        let mut back: Vec<HopRecord> = vec![cur.clone()];
        while let Some(p) = cur.previous {
            if back.iter().any(|x| x.id == p) {
                return RouteVerdict::Broken { hops: vec![], at: p, agreement: None, why: "the records name each other in a circle".into() };
            }
            let prev = match self.hop_record(&p) {
                Some(x) if !x.claim => x,
                Some(_) => return RouteVerdict::Broken { hops: vec![], at: cur.id, agreement: None, why: "it names a claim as the previous hop's receipt: a hop names a receipt (Money rule 24)".into() },
                None => {
                    return RouteVerdict::Broken {
                        hops: vec![],
                        at: cur.id,
                        agreement: None,
                        why: "the previous hop's receipt it names is not held: each hop's receipt is disclosed to the final creditor (Money rule 26)".into(),
                    }
                }
            };
            back.push(prev.clone());
            cur = prev;
        }
        back.reverse();
        let hops: Vec<Hash> = back.iter().map(|x| x.id).collect();
        match self.hop_valid(&back[0]) {
            Ok(()) => {}
            Err((true, why)) => return RouteVerdict::Unknown { at: back[0].id, why },
            Err((false, why)) => return RouteVerdict::Broken { hops, at: back[0].id, agreement: Some(back[0].fulfils), why },
        }
        for w in back.windows(2) {
            match self.link(&w[0], &w[1]) {
                Link::Carries => {
                    let (parts, _, near, _) = self.carried_parts(&w[0]);
                    let counted = parts.iter().any(|x| x.id == w[1].id || (x.rail == w[1].rail && self.same_payment_of((Some(&x.id), &x.proof), (Some(&w[1].id), &w[1].proof))));
                    if !counted {
                        let why = near.into_iter().find(|(x, _)| x == &w[1].id).map(|(_, y)| y).unwrap_or_else(|| "it does not carry the previous hop's forward on (Money rule 24)".into());
                        let agreement = w[0].forward.as_ref().map(|f| f.agreement);
                        return RouteVerdict::Broken { hops, at: w[1].id, agreement, why };
                    }
                }
                Link::Unknown(why) => return RouteVerdict::Unknown { at: w[1].id, why },
                Link::Fails(why) => {
                    let agreement = w[0].forward.as_ref().map(|f| f.agreement).or(Some(w[1].fulfils));
                    return RouteVerdict::Broken { hops, at: w[1].id, agreement, why };
                }
            }
        }
        if let Some(f) = &back.last().and_then(|x| x.forward.clone()) {
            return RouteVerdict::Broken { hops, at: *last, agreement: Some(f.agreement), why: "it declares a forward: the route goes on past it".into() };
        }
        RouteVerdict::Valid { hops }
    }

    /// The route starting at the held receipt `first`, followed forward
    /// through the receipts and claims held (Money rules 24 and 27):
    /// valid, stopped where a forward is not carried on (that hop's open
    /// obligation, rule 27), or broken; unknown where whether a record
    /// carries a forward on rests on a rail's answer not held, and no
    /// other record carries it.
    pub fn route_from(&self, first: &Hash) -> RouteVerdict {
        let Some(cur) = self.hop_record(first) else {
            return RouteVerdict::Broken { hops: vec![], at: *first, agreement: None, why: "not a receipt or claim held".into() };
        };
        match self.hop_valid(&cur) {
            Ok(()) => {}
            Err((true, why)) => return RouteVerdict::Unknown { at: cur.id, why },
            Err((false, why)) => return RouteVerdict::Broken { hops: vec![], at: cur.id, agreement: Some(cur.fulfils), why },
        }
        let mut hops = vec![cur.id];
        let mut queue = std::collections::VecDeque::from([cur]);
        let mut stop: Option<(Hash, ForwardOwed, Vec<(Hash, String)>)> = None;
        while let Some(cur) = queue.pop_front() {
            let Some(f) = cur.forward.clone() else { continue };
            let (parts, sum, near, unknown) = self.carried_parts(&cur);
            if sum < f.amount.value {
                if let Some((at, why)) = unknown {
                    return RouteVerdict::Unknown { at, why };
                }
                if stop.is_none() {
                    let owed = ForwardOwed {
                        declared_by: cur.id,
                        debtor: cur.payee,
                        creditor: f.next_payee,
                        amount: Amount { unit: f.amount.unit, value: f.amount.value - sum },
                        agreement: f.agreement,
                    };
                    stop = Some((cur.id, owed, near));
                }
            }
            for n in parts {
                if hops.contains(&n.id) {
                    continue;
                }
                hops.push(n.id);
                queue.push_back(n);
            }
        }
        match stop {
            Some((at, owed, near)) => RouteVerdict::Stopped { hops, at, owed, near },
            None => RouteVerdict::Valid { hops },
        }
    }

    /// The forward a held receipt declares, where no valid record of the
    /// next hop carries it on (Money rule 27): that hop's open obligation,
    /// under the agreement the forward names. `None` where it declares no
    /// forward or one is carried on; `Err` where that cannot be told yet.
    pub fn forward_owed(&self, receipt: &Hash) -> R<Option<ForwardOwed>> {
        let Some(r) = self.hop_record(receipt).filter(|r| !r.claim && r.forward.is_some()) else {
            return Ok(None);
        };
        match self.hop_valid(&r) {
            Ok(()) => {}
            Err((true, _)) => return Err(AgreementsError::RailUnanswered),
            Err((false, _)) => return Ok(None),
        }
        let f = r.forward.clone().expect("a forward");
        let (_, sum, _, unknown) = self.carried_parts(&r);
        if sum >= f.amount.value {
            return Ok(None);
        }
        if unknown.is_some() {
            return Err(AgreementsError::RailUnanswered);
        }
        Ok(Some(ForwardOwed { declared_by: r.id, debtor: r.payee, creditor: f.next_payee, amount: Amount { unit: f.amount.unit, value: f.amount.value - sum }, agreement: f.agreement }))
    }
}

/// Who buys a purchase paid through a route (Money rule 24, its last
/// sentence; Agreements, "A contest of a purchase"): the route's first
/// payer, where the route is valid and the first payer's claim of the
/// first hop names, in key 4, the tag the purchase names in field 5.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RouteBuyer {
    /// The record names no previous hop: no route, the ordinary rule.
    NoRoute,
    /// The route's first payer, by their claim of the first hop naming the
    /// tag the purchase names; that claim is the buyer's claim for a
    /// contest (field 0).
    FirstPayer { payer: Hash, claim: Hash },
    /// The conversion service paying the last hop bought for its own
    /// account: no claim of the first payer's names the tag, or the first
    /// payer committed only a bare key. `astray`: the first payer's claims
    /// of the first hop naming another tag, the first payer's money gone
    /// where it did not name (rule 28).
    OwnAccount { service: Option<Hash>, astray: Vec<Hash> },
    /// The route ending at the record is stopped or broken: no purchase at
    /// the seller (rule 27 names the forward owed).
    Failed(RouteVerdict),
    /// The route, or the first payer's claim, cannot be told yet: the
    /// buyer is unknown, and a contest shows nothing yet.
    Unknown,
}

/// One hop's refund owed back along a route (Money rule 28): the hop's
/// payee owes its payer what the hop received, in that hop's unit, under
/// the agreement the hop's forward names (for the last hop, what it
/// fulfils); `repaid`, what the hop's payee has paid back toward it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RefundHop {
    pub record: Hash,
    pub debtor: Hash,
    pub creditor: Option<Hash>,
    pub amount: Amount,
    pub agreement: Hash,
    /// `None` where it cannot be told (Money rule 12).
    pub repaid: Option<u64>,
}

impl<'a> AgreementsView<'a> {
    /// The receipt of `claim`'s payment, signed by its payee, that declares
    /// a forward: `claim` is then a claim of a route's hop that forwards.
    fn forwarding_receipt_of(&self, claim: &HopRecord) -> Option<HopRecord> {
        self.same_payment_records(claim).into_iter().filter(|x| !x.claim && x.forward.is_some()).min_by_key(|x| x.id)
    }

    /// The buyer of the purchase the record `last` is, where `last` is the
    /// last hop of a route (Money rule 24's last sentence; Agreements, "A
    /// contest of a purchase"). The first payer is the first hop's payer:
    /// its receipt's field 2, an identity. Their claim of the first hop,
    /// standing and valid on its rail, naming in key 4 the tag `last`
    /// names in field 5 (key 4 for a claim), makes them the buyer; a claim
    /// of theirs whose rail's answer is pending or not held leaves it
    /// unknown yet.
    pub fn route_buyer(&self, last: &Hash) -> RouteBuyer {
        let Some(r) = self.hop_record(last) else { return RouteBuyer::NoRoute };
        if r.previous.is_none() {
            return RouteBuyer::NoRoute;
        }
        let hops = match self.route_to(last) {
            RouteVerdict::Valid { hops } => hops,
            RouteVerdict::Unknown { .. } => return RouteBuyer::Unknown,
            v => return RouteBuyer::Failed(v),
        };
        let service = r.payer;
        let Some(first) = hops.first().and_then(|f| self.hop_record(f)) else { return RouteBuyer::Unknown };
        let Some(payer) = first.payer else { return RouteBuyer::OwnAccount { service, astray: vec![] } };
        let mut claims: Vec<HopRecord> = self
            .same_payment_records(&first)
            .into_iter()
            .filter(|x| x.claim && x.signer == Some(payer) && x.payee == first.payee && x.previous.is_none())
            .collect();
        claims.sort_by_key(|x| x.id);
        let named = |x: &HopRecord| x.fulfils == r.fulfils;
        if let Some(c) = claims.iter().find(|x| named(x) && self.rail_valid.contains_key(&x.id)) {
            return RouteBuyer::FirstPayer { payer, claim: c.id };
        }
        if claims.iter().any(|x| named(x) && !self.rail_invalid.contains(&x.id)) {
            return RouteBuyer::Unknown;
        }
        let astray = claims.iter().filter(|x| !named(x) && self.rail_valid.contains_key(&x.id)).map(|x| x.id).collect();
        RouteBuyer::OwnAccount { service, astray }
    }

    /// For a payer's claim `claim` (Agreements, "A contest of a purchase"):
    /// `Some(Some(payer))` where it is the buyer's claim of a purchase paid
    /// through a route, `Some(None)` where it is a hop of a route that gives
    /// it no buyer (a carrier's claim, a route stopped or broken, the first
    /// payer naming another tag), `None` where it is no hop of a route (the
    /// ordinary rule). `Err` while the route cannot be told yet.
    pub(super) fn route_claim_buyer(&self, claim: &Hash) -> R<Option<Option<Hash>>> {
        let Some(c) = self.hop_record(claim).filter(|c| c.claim) else { return Ok(None) };
        if c.previous.is_some() {
            // A later hop's claim: the paying service's. Where the route's
            // first payer is the buyer, the service carries.
            return match self.route_buyer(claim) {
                RouteBuyer::NoRoute => Ok(None),
                RouteBuyer::OwnAccount { .. } => Ok(None),
                RouteBuyer::FirstPayer { .. } | RouteBuyer::Failed(_) => Ok(Some(None)),
                RouteBuyer::Unknown => Err(AgreementsError::RailUnanswered),
            };
        }
        let Some(first) = self.forwarding_receipt_of(&c) else { return Ok(None) };
        let last = match self.route_from(&first.id) {
            RouteVerdict::Valid { hops } => *hops.last().expect("a hop"),
            RouteVerdict::Unknown { .. } => return Err(AgreementsError::RailUnanswered),
            _ => return Ok(Some(None)),
        };
        match self.route_buyer(&last) {
            RouteBuyer::FirstPayer { payer, claim: k } if &k == claim => match self.purchase_unjudged(&last)? {
                Some(PurchaseEval { verdict: PurchaseVerdict::Purchase, .. }) => Ok(Some(Some(payer))),
                Some(PurchaseEval { verdict: PurchaseVerdict::Unknown, .. }) => Err(AgreementsError::RailUnanswered),
                _ => Ok(Some(None)),
            },
            RouteBuyer::Unknown => Err(AgreementsError::RailUnanswered),
            _ => Ok(Some(None)),
        }
    }

    /// A refund owed on a purchase paid through a route (Money rule 28):
    /// owed to the last hop's payer, who owes it on to the hop before, each
    /// under the agreement that hop's forward named, until it reaches the
    /// first payer; each hop's debt a refund as Agreements rule 11 gives
    /// one, in that hop's unit. `last` is the route's last record; empty
    /// where the route is not valid, or no refund is owed on the purchase
    /// (it is one, or not yet told). Last hop first.
    pub fn refund_along(&self, last: &Hash) -> R<Vec<RefundHop>> {
        let RouteVerdict::Valid { hops } = self.route_to(last) else { return Ok(vec![]) };
        match self.purchase(last)? {
            Some(PurchaseEval { verdict: PurchaseVerdict::NoPurchase { .. }, .. }) => {}
            _ => return Ok(vec![]),
        }
        let mut out = vec![];
        for (i, id) in hops.iter().enumerate().rev() {
            let Some(h) = self.hop_record(id) else { continue };
            let agreement = if i + 1 == hops.len() { h.fulfils } else { h.forward.as_ref().map(|f| f.agreement).unwrap_or(h.fulfils) };
            let creditor = h.payer;
            let repaid = match creditor {
                Some(p) => self.refund_repaid(id, &crate::money::RefundTo::Identity(p), &h.amount.unit),
                None => Some(0),
            };
            out.push(RefundHop { record: *id, debtor: h.payee, creditor, amount: h.amount.clone(), agreement, repaid });
        }
        Ok(out)
    }
}
