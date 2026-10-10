//! The pooled anchoring service (anchoring cMIP draft 3, "The pooled
//! service"; roadmap step 14a and its second pass): hashes paid for one by
//! one, anchored in batches, with omission and late anchoring provable from
//! what the service itself signed.
//!
//! In plain words: the service publishes a **standing offer**, an
//! Agreements offer of a lone seller (F215, F225: "Paying for anchoring is
//! an agreement"), whose terms are this cMIP's: one line per urgency tier
//! (a price per hash, or a price scheme tied to an on-chain measure, F228;
//! and how many blocks the service may take). A payer pays for one hash by
//! following that offer, over a rail (Lightning, in the tests), and gets a
//! **ticket** the service signs under it: "your leaf goes into batch n,
//! anchored by block D". For every batch the service publishes a signed
//! **publication** under it: the batch's leaves, and the transaction whose
//! output commits to their root. Then:
//!
//! - a publication of batch n without the ticket's leaf is a **provable
//!   omission**, from two acts the service signed;
//! - no anchor of the leaf at or before D, once D is buried at the clock's
//!   depth, is a **default**: non-delivery by a deadline on a named
//!   reference (review section 9, item 2); an anchor after D is **late**,
//!   which is a default too;
//! - each is a refund owed **under the offer's terms** (F225): the price
//!   paid, to the payer the payment committed to, claimable until the
//!   offer's refund point if it sets one (F219). Money carries the
//!   repayment, and shows it repaid ([`standing`]).
//!
//! The offer is an Agreements act (type 6) the core reads
//! (`mor_core::law::Offer`); the ticket and the publication are this
//! cMIP's acts (types 2 and 3) the service's identity signs, naming the
//! offer. The caller checks them as acts, and this module reads their
//! payloads. *Draft 2's own offer, type 1 of this cMIP, is retired: reading
//! 3 of step 14a, a payment following the service's pointer as a tip does,
//! is reversed by F225.*
//!
//! *Mechanics, the build's (each respecting a decided rule): the act types
//! and payloads; the terms carried as what the offer sells,
//! `[2, [anchoring cMIP, terms]]`; the offer's one amount (field 2) read as
//! the most one hash costs under it; the price scheme's shape and its one
//! measure, the fee rate, quoted in the ticket; the ticket naming its batch,
//! so that a publication without the leaf contradicts it; the leaves listed
//! in the publication; the deadline as an absolute point the ticket names;
//! the default, and the refund point's passing, read once buried at the
//! clock's depth on the chain the verifier follows; one block of slack in
//! the payer's check.*

use mor_core::cbor::{self, Value};
use mor_core::envelope::anchoring::Reference;
use mor_core::finance::{Amount, Payer, RefundTo};
use mor_core::hash::Hash;
use mor_core::law::{self, RefundTerms, Sold};
use mor_payment::{Answer, Commitment, PaidTo};

/// The act types of this cMIP. *Mechanic, the build's: the numbers.*
pub const TICKET: u64 = 2;
pub const PUBLICATION: u64 = 3;
/// Draft 2's own offer act, retired by F225 (the offer is an Agreements
/// standing offer), never reused.
pub const RETIRED_OFFER: u64 = 1;

/// The one on-chain measure a price scheme names so far (F228): the fee
/// rate, in satoshis per virtual byte, as the service reads it at the
/// ticket's point and quotes it in the ticket. *Mechanic, the build's.*
pub const FEE_RATE: u64 = 0;

/// A price scheme tied to an on-chain measure (F228): `base + per ×
/// measure`, never above `cap`, in the offer's unit.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Scheme {
    pub measure: u64,
    pub base: u64,
    pub per: u64,
    pub cap: u64,
}

impl Scheme {
    /// The price for a quoted measure.
    pub fn price(&self, quote: u64) -> u64 {
        self.base.saturating_add(self.per.saturating_mul(quote)).min(self.cap)
    }
}

/// What one hash costs at a tier: a fixed price, or a scheme (F228).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Price {
    Fixed(u64),
    Scheme(Scheme),
}

impl Price {
    /// The most it can come to.
    pub fn most(&self) -> u64 {
        match self {
            Price::Fixed(p) => *p,
            Price::Scheme(s) => s.cap,
        }
    }
}

/// One urgency tier: the price of one hash, in the offer's unit, and the
/// most blocks (points on the reference) the service may take between the
/// ticket and the anchor.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Tier {
    pub price: Price,
    pub blocks: u64,
}

/// The anchoring cMIP's terms, what the service's standing offer sells
/// (`[2, [anchoring cMIP, terms]]`): the time reference its anchors and
/// deadlines are on, and its tiers, most urgent first.
///
/// ```cddl
/// terms = { 0 => reference, 1 => [+ tier] }
/// tier  = [ price: uint / scheme, blocks: uint ]
/// scheme = [ measure: uint, base: uint, per: uint, cap: uint ]   ; measure 0: the fee rate, sat/vB
/// ```
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Terms {
    pub reference: Reference,
    pub tiers: Vec<Tier>,
}

impl Terms {
    pub fn to_value(&self) -> Value {
        let tier = |t: &Tier| {
            let p = match t.price {
                Price::Fixed(p) => Value::Uint(p),
                Price::Scheme(s) => Value::Array(vec![Value::Uint(s.measure), Value::Uint(s.base), Value::Uint(s.per), Value::Uint(s.cap)]),
            };
            Value::Array(vec![p, Value::Uint(t.blocks)])
        };
        Value::Map(vec![(Value::Uint(0), self.reference.to_value()), (Value::Uint(1), Value::Array(self.tiers.iter().map(tier).collect()))])
    }

    pub fn decode(v: &Value) -> Option<Terms> {
        let Value::Map(m) = v else { return None };
        if m.len() != 2 {
            return None;
        }
        let Value::Array(ts) = get(m, 1)? else { return None };
        let tiers = ts
            .iter()
            .map(|t| match t {
                Value::Array(x) => match x.as_slice() {
                    [Value::Uint(p), Value::Uint(n)] => Some(Tier { price: Price::Fixed(*p), blocks: *n }),
                    [Value::Array(s), Value::Uint(n)] => match s.as_slice() {
                        [Value::Uint(measure), Value::Uint(base), Value::Uint(per), Value::Uint(cap)] if *measure == FEE_RATE => {
                            Some(Tier { price: Price::Scheme(Scheme { measure: *measure, base: *base, per: *per, cap: *cap }), blocks: *n })
                        }
                        _ => None,
                    },
                    _ => None,
                },
                _ => None,
            })
            .collect::<Option<Vec<_>>>()?;
        if tiers.is_empty() {
            return None;
        }
        Some(Terms { reference: Reference::decode(get(m, 0)?)?, tiers })
    }

    /// The most one hash costs under these terms.
    pub fn most(&self) -> u64 {
        self.tiers.iter().map(|t| t.price.most()).max().unwrap_or(0)
    }

    /// The Agreements standing offer (type 6) the service signs selling
    /// these terms: a lone seller's (no field 0, F215), paid to its signer,
    /// its price (field 2) the most one hash costs, its own time reference
    /// (field 6) the terms' reference, its own refund terms (field 7) where
    /// it sets a refund point on it.
    pub fn standing_offer(&self, unit: Hash, words: Option<String>, refund_until: Option<u64>) -> law::Offer {
        law::Offer {
            under: None,
            sold: vec![Sold::Access(crate::spec(), cbor::encode(&self.to_value()))],
            price: Amount { unit, value: self.most() },
            paid: None,
            words,
            until: None,
            time: Some((self.reference.cmip, self.reference.params.clone())),
            refund: refund_until.map(|u| RefundTerms { until: Value::Uint(u) }),
        }
    }
}

/// The service's standing offer, as this cMIP reads the Agreements offer
/// it signed (F225).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Offer {
    /// The offer act's id: what a payment buying under it follows.
    pub id: Hash,
    /// Who is paid (its field 3, or the signer, the service).
    pub payee: Hash,
    /// Its field 2: the most one hash costs under it.
    pub price: Amount,
    pub terms: Terms,
    /// Its own refund terms (field 7): the point on the reference until
    /// which a refund owed under it is claimable (F219).
    pub refund_until: Option<u64>,
}

impl Offer {
    /// Read an Agreements standing offer, `id`, signed by `signer`, as this
    /// cMIP's: a lone seller's (F215), selling exactly these terms, on its
    /// own time reference the terms' own, its field 2 the most one hash
    /// costs, in a unit, not withdrawn. Whether it counts as an offer
    /// (public, valid) is Agreements' (`LawView::offer`), checked beside.
    pub fn read(id: Hash, signer: Hash, o: &law::Offer) -> Result<Offer, String> {
        if o.under.is_some() {
            return Err("an anchoring offer is a lone seller's (F215, F225): no co-owners' agreement behind it".into());
        }
        let [Sold::Access(cmip, params)] = o.sold.as_slice() else {
            return Err("an anchoring offer sells exactly one thing: this cMIP's terms (a version selling nothing withdraws it)".into());
        };
        if cmip != &crate::spec() {
            return Err("it sells another cMIP's access".into());
        }
        let terms = cbor::decode(params).ok().as_ref().and_then(Terms::decode).ok_or("its terms are not in this cMIP's format")?;
        if o.time.as_ref().map(|(c, p)| (c, p)) != Some((&terms.reference.cmip, &terms.reference.params)) {
            return Err("its own time reference (field 6) is the clock its deadlines are points on, the terms' reference".into());
        }
        if o.price.value != terms.most() {
            return Err("its price (field 2) is the most one hash costs under its terms (mechanic, the build's)".into());
        }
        let refund_until = match &o.refund {
            None => None,
            Some(RefundTerms { until: Value::Uint(u) }) => Some(*u),
            Some(_) => return Err("its refund point is a point on the reference".into()),
        };
        let payee = o.payee(&signer).ok_or("a lone seller's offer is paid to a payee")?;
        Ok(Offer { id, payee, price: o.price, terms, refund_until })
    }

    /// The price of one hash at `tier`, given the ticket's `quote` of the
    /// measure where the tier states a scheme (F228).
    pub fn price(&self, tier: u64, quote: Option<u64>) -> Option<Amount> {
        let t = self.terms.tiers.get(usize::try_from(tier).ok()?)?;
        let value = match (t.price, quote) {
            (Price::Fixed(p), None) => p,
            (Price::Scheme(s), Some(q)) => s.price(q),
            _ => return None,
        };
        Some(Amount { unit: self.price.unit, value })
    }
}

/// The ticket the service signs for one paid hash.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Ticket {
    /// The standing offer it sells under.
    pub offer: Hash,
    /// The leaf (the anchoring cMIP's tree: the act and the payer's blind);
    /// the service never learns the act.
    pub leaf: Hash,
    /// The payment commitment of the payment that buys it (payment cMIP).
    pub commitment: Hash,
    pub tier: u64,
    /// The batch it goes into, by number on the service's line of batches.
    pub batch: u64,
    /// The point on the offer's reference by which it is anchored.
    pub deadline: u64,
    /// Where the tier states a price scheme, the measure the service read
    /// at the ticket's point (F228): the price follows from it.
    pub quote: Option<u64>,
}

/// What the service publishes for each batch it anchors.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Publication {
    pub offer: Hash,
    pub batch: u64,
    /// The batch's leaves, in the tree's order.
    pub leaves: Vec<Hash>,
    /// The transaction whose output commits to the batch's root, and the
    /// output: on Bitcoin, the txid in Bitcoin's byte order.
    pub tx: Hash,
    pub output: u64,
}

fn b(h: &[u8]) -> Value {
    Value::Bytes(h.to_vec())
}

fn key(k: u64) -> Value {
    Value::Uint(k)
}

fn get(map: &[(Value, Value)], k: u64) -> Option<&Value> {
    map.iter().find(|(x, _)| x == &Value::Uint(k)).map(|(_, v)| v)
}

fn hash(v: Option<&Value>) -> Option<Hash> {
    match v? {
        Value::Bytes(x) => x.as_slice().try_into().ok(),
        _ => None,
    }
}

fn uint(v: Option<&Value>) -> Option<u64> {
    match v? {
        Value::Uint(n) => Some(*n),
        _ => None,
    }
}

impl Ticket {
    /// `{ 0: offer, 1: leaf, 2: commitment, 3: tier, 4: batch, 5: deadline, ? 6: quote }`
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (key(0), b(&self.offer)),
            (key(1), b(&self.leaf)),
            (key(2), b(&self.commitment)),
            (key(3), Value::Uint(self.tier)),
            (key(4), Value::Uint(self.batch)),
            (key(5), Value::Uint(self.deadline)),
        ];
        if let Some(q) = self.quote {
            m.push((key(6), Value::Uint(q)));
        }
        m
    }

    pub fn from_map(m: &[(Value, Value)]) -> Option<Ticket> {
        Some(Ticket {
            offer: hash(get(m, 0))?,
            leaf: hash(get(m, 1))?,
            commitment: hash(get(m, 2))?,
            tier: uint(get(m, 3))?,
            batch: uint(get(m, 4))?,
            deadline: uint(get(m, 5))?,
            quote: match get(m, 6) {
                None => None,
                v => Some(uint(v)?),
            },
        })
    }
}

impl Publication {
    /// `{ 0: offer, 1: batch, 2: [ leaf, ... ], 3: tx, 4: output }`
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![
            (key(0), b(&self.offer)),
            (key(1), Value::Uint(self.batch)),
            (key(2), Value::Array(self.leaves.iter().map(|l| b(l)).collect())),
            (key(3), b(&self.tx)),
            (key(4), Value::Uint(self.output)),
        ]
    }

    pub fn from_map(m: &[(Value, Value)]) -> Option<Publication> {
        let Value::Array(ls) = get(m, 2)? else { return None };
        Some(Publication {
            offer: hash(get(m, 0))?,
            batch: uint(get(m, 1))?,
            leaves: ls.iter().map(|l| hash(Some(l))).collect::<Option<Vec<_>>>()?,
            tx: hash(get(m, 3))?,
            output: uint(get(m, 4))?,
        })
    }

    /// The root its leaves give, if they make a batch.
    pub fn root(&self) -> Option<Hash> {
        Some(crate::tree::Batch::new(self.leaves.clone())?.root())
    }
}

/// A clock Module that carries batch anchors, as the judgment reads it:
/// where a leaf is anchored, and where the clock stands for the verifier.
/// The Bitcoin clock Module implements it.
pub trait BatchClock {
    /// Its time reference.
    fn reference(&self) -> Reference;
    /// The point at which `proof` anchors the leaf `leaf`, at the clock's
    /// depth; otherwise the answer (pending, invalid, unknown).
    fn leaf_point(&self, leaf: &Hash, proof: &[u8]) -> Result<u64, Answer>;
    /// The point the verifier's clock stands at (on Bitcoin, its tip).
    fn now(&self) -> Option<u64>;
    /// The depth at which a point counts (on Bitcoin, six blocks).
    fn depth(&self) -> u64;
}

/// The payment that buys a ticket, as the caller verified it with the
/// payment cMIP: the commitment, recomputed from the payer's claim or the
/// service's receipt, and the answer the rail gave.
#[derive(Clone, Debug)]
pub struct Payment {
    pub commitment: Commitment,
    pub answer: Answer,
}

/// A refund owed under the offer's terms (F225): the price paid, owed to
/// the payer the payment committed to (Money rule 10a: an identity, a bare
/// key, or nobody), claimable until the offer's refund point where it sets
/// one (F219).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Refund {
    pub amount: Amount,
    pub to: RefundTo,
    pub until: Option<u64>,
}

/// Where a refund stands, given what Money shows repaid toward it
/// (`mor_core::law::LawView::refund_repaid`).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Standing {
    /// Owed, `left` still to pay.
    Owed { left: u64 },
    /// Repaid in full: the service's claim, with the rail's proof that the
    /// money went back, naming the payment refunded.
    Repaid,
    /// Past the offer's refund point, unpaid: ended, the service keeps
    /// `left` (F219; bad-faith terms stay public).
    Ended { left: u64 },
}

/// What the ticket comes to.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Judgment {
    /// The ticket's payment is not shown made: nothing is owed.
    NotPaid(String),
    /// Paid; the deadline is not yet buried at the clock's depth, and no
    /// anchor is shown: wait.
    Pending,
    /// Anchored at or before the deadline: the service delivered.
    Anchored { point: u64 },
    /// A publication of the ticket's batch without its leaf: a provable
    /// omission, the price owed back.
    Omitted { refund: Refund },
    /// Anchored, but after the deadline: a default, the price owed back
    /// (the anchor still counts as an anchor, at its point).
    Late { point: u64, refund: Refund },
    /// The deadline is buried at the clock's depth and no anchor at or
    /// before it is shown: non-delivery, a default, the price owed back.
    Default { refund: Refund },
    /// This verifier cannot judge: it does not follow the offer's clock.
    Unknown(String),
}

/// The slack, in points, a payer's client allows between its own view of
/// the clock and the service's when it checks a ticket's deadline.
/// *Mechanic, the build's.*
pub const SLACK: u64 = 1;

/// Whether the payment committed to as `c` buys `ticket` under `offer`
/// (F225): the ticket names the offer and the commitment; the payment
/// follows the standing offer (not the service's pointer, as a tip does:
/// reading 3 of step 14a reversed), to its payee, to a flow (which pointer
/// counts is Money's, rules 14 and 15), naming no claim (a lone seller's
/// offer, F215), for exactly the tier's price (or, under a scheme, the
/// price the ticket's quote gives, F228). The refund it would be owed.
fn bought(offer: &Offer, ticket: &Ticket, c: &Commitment) -> Result<Refund, String> {
    if ticket.offer != offer.id {
        return Err("the ticket names another offer".into());
    }
    let Some(price) = offer.price(ticket.tier, ticket.quote) else {
        return Err("the offer has no such tier, or the ticket's quote does not fit its price".into());
    };
    if c.hash() != ticket.commitment {
        return Err("the payment's commitment is not the one the ticket names".into());
    }
    if c.fulfils != offer.id {
        return Err("the payment does not follow the service's standing offer (F225: a tip to its pointer buys no anchor)".into());
    }
    if c.payee != offer.payee || !matches!(c.paid_to, PaidTo::Flow { .. }) {
        return Err("the payment is not to the offer's payee's flow".into());
    }
    if c.purchase.is_some() {
        return Err("a payment following a lone seller's offer names no claim (F215)".into());
    }
    if c.amount != price {
        return Err("the payment is not the tier's price".into());
    }
    let to = match &c.payer {
        Some(Payer::Identity(h)) => RefundTo::Identity(*h),
        Some(Payer::Key(k)) => RefundTo::Key(k.clone()),
        None => RefundTo::Nobody,
    };
    Ok(Refund { amount: price, to, until: offer.refund_until })
}

/// Judge a ticket (anchoring cMIP draft 3, "Omission and default"), under
/// the service's standing offer (F225), from what the service signed
/// (`offer`, `ticket`, `publications`), the
/// payment, an anchor shown (the clock Module's proof, for the ticket's
/// leaf), and the clock as this verifier follows it. In order:
///
/// 1. **Not paid:** the payment is not valid, or does not buy this ticket
///    (another commitment or payee, not following the offer, or not the
///    tier's price): nothing is owed.
/// 2. **Omitted:** a publication of the ticket's batch, under its offer,
///    without its leaf (or whose leaves make no batch): a provable
///    omission, whatever else happened; the price is owed back.
/// 3. **Anchored or late:** an anchor of the leaf at the clock's depth: at
///    or before the deadline, delivered; after it, late, the price owed
///    back.
/// 4. **Default:** the clock stands at the deadline plus its depth less
///    one (a point at the deadline would now count), and no anchor at or
///    before it is shown: non-delivery by the deadline on the offer's
///    reference; the price is owed back.
/// 5. Otherwise pending.
pub fn judge(offer: &Offer, ticket: &Ticket, payment: &Payment, publications: &[Publication], anchor: Option<&[u8]>, clock: &dyn BatchClock) -> Judgment {
    let refund = match bought(offer, ticket, &payment.commitment) {
        Ok(r) => r,
        Err(w) => return Judgment::NotPaid(w),
    };
    if payment.answer != Answer::Valid {
        return Judgment::NotPaid(format!("the payment is not shown made: {}", payment.answer));
    }
    if clock.reference() != offer.terms.reference {
        return Judgment::Unknown("this verifier's clock is not the offer's reference".into());
    }
    let omitted = publications
        .iter()
        .filter(|p| p.offer == ticket.offer && p.batch == ticket.batch)
        .any(|p| p.root().is_none() || !p.leaves.contains(&ticket.leaf));
    if omitted {
        return Judgment::Omitted { refund };
    }
    if let Some(Ok(point)) = anchor.map(|a| clock.leaf_point(&ticket.leaf, a)) {
        return if point <= ticket.deadline { Judgment::Anchored { point } } else { Judgment::Late { point, refund } };
    }
    let Some(now) = clock.now() else {
        return Judgment::Unknown("this verifier's clock gives no point now".into());
    };
    if now >= ticket.deadline.saturating_add(clock.depth().saturating_sub(1)) {
        return Judgment::Default { refund };
    }
    Judgment::Pending
}

/// Where a refund stands (F225, F219): repaid in full where Money shows
/// `repaid` (what the service's claims, with the rail's proof, show paid
/// back toward it) reach its amount; otherwise ended once the clock stands
/// past the offer's refund point at its depth (a point after it would now
/// count); otherwise owed.
pub fn standing(refund: &Refund, repaid: u64, clock: &dyn BatchClock) -> Standing {
    if repaid >= refund.amount.value {
        return Standing::Repaid;
    }
    let left = refund.amount.value - repaid;
    match (refund.until, clock.now()) {
        (Some(u), Some(now)) if now >= u.saturating_add(clock.depth()) => Standing::Ended { left },
        _ => Standing::Owed { left },
    }
}

/// Client conformance: whether a payer's client accepts a ticket before
/// paying, against the standing offer it chose and its own clock's point
/// `now`: the tier exists, the ticket names the payer's commitment, the
/// commitment follows the offer to its payee for the tier's price, and the
/// deadline is after `now` and no later than `now` plus the tier's blocks
/// and [`SLACK`]. Under a price scheme (F228), the client reads the
/// measure itself (`measure`) and refuses a quote above its own reading.
pub fn acceptable(offer: &Offer, ticket: &Ticket, commitment: &Commitment, now: u64, measure: Option<u64>) -> Result<(), String> {
    bought(offer, ticket, commitment)?;
    let tier = offer.terms.tiers[ticket.tier as usize];
    if let Price::Scheme(_) = tier.price {
        match (ticket.quote, measure) {
            (Some(q), Some(m)) if q <= m => {}
            (Some(q), Some(m)) => return Err(format!("the ticket quotes {q} for the measure, above this client's own reading of {m}")),
            _ => return Err("a price scheme's quote this client cannot check against its own reading".into()),
        }
    }
    let blocks = tier.blocks;
    if ticket.deadline <= now || ticket.deadline > now + blocks + SLACK {
        return Err(format!("the deadline {} is not within the tier's {blocks} blocks of this client's point {now}", ticket.deadline));
    }
    Ok(())
}
