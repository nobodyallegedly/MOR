//! The pooled anchoring service (anchoring cMIP draft 2, "The pooled
//! service"; roadmap step 14a): hashes paid for one by one, anchored in
//! batches, with omission and late anchoring provable from what the service
//! itself signed.
//!
//! In plain words: the service publishes an **offer**, a standing price list
//! with one line per urgency tier (a price per hash, and how many blocks the
//! service may take). A payer pays for one hash over a rail (Lightning, in
//! the tests) and gets a **ticket** the service signs: "your leaf goes into
//! batch n, anchored by block D". For every batch the service publishes a
//! signed **publication**: the batch's leaves, and the transaction whose
//! output commits to their root. Then:
//!
//! - a publication of batch n without the ticket's leaf is a **provable
//!   omission**, from two acts the service signed;
//! - no anchor of the leaf at or before D, once D is buried at the clock's
//!   depth, is a **default**: non-delivery by a deadline on a named
//!   reference (review section 9, item 2); an anchor after D is **late**,
//!   which is a default too;
//! - each is a refund owed: the price the payer paid.
//!
//! The offer, the ticket and the publication are payloads of acts the
//! service's identity signs (types 1, 2 and 3 of this cMIP); the caller
//! checks them as acts, as the payment cMIP's `Held` gives only valid acts,
//! and this module reads their payloads.
//!
//! *Mechanics, the build's (each respecting a decided rule): the three act
//! types and their payloads; the ticket naming its batch, so that a
//! publication without the leaf contradicts it; the leaves listed in the
//! publication; the deadline as an absolute point the ticket names; the
//! default read once the deadline is buried at the clock's depth on the
//! chain the verifier follows; one block of slack in the payer's check.*

use mor_core::cbor::Value;
use mor_core::envelope::anchoring::Reference;
use mor_core::finance::Amount;
use mor_core::hash::Hash;
use mor_payment::{Answer, Commitment, PaidTo};

/// The act types of this cMIP. *Mechanic, the build's: the numbers.*
pub const OFFER: u64 = 1;
pub const TICKET: u64 = 2;
pub const PUBLICATION: u64 = 3;

/// One urgency tier: the price of one hash, in the offer's unit, and the
/// most blocks (points on the offer's reference) the service may take
/// between the ticket and the anchor.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Tier {
    pub price: u64,
    pub blocks: u64,
}

/// The service's standing offer.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Offer {
    /// The time reference its anchors are on: a clock Module and its
    /// parameters (Bitcoin, a network).
    pub reference: Reference,
    /// The service's payee pointer, which every payment for a hash follows
    /// (Finance: a payment following a pointer, as a tip does).
    pub pointer: Hash,
    /// The unit its prices are in.
    pub unit: Hash,
    /// Its tiers, most urgent first; a ticket names one by index.
    pub tiers: Vec<Tier>,
}

/// The ticket the service signs for one paid hash.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Ticket {
    /// The offer act it sells under.
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

impl Offer {
    /// `{ 0: reference, 1: pointer, 2: unit, 3: [ [price, blocks], ... ] }`
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![
            (key(0), self.reference.to_value()),
            (key(1), b(&self.pointer)),
            (key(2), b(&self.unit)),
            (key(3), Value::Array(self.tiers.iter().map(|t| Value::Array(vec![Value::Uint(t.price), Value::Uint(t.blocks)])).collect())),
        ]
    }

    pub fn from_map(m: &[(Value, Value)]) -> Option<Offer> {
        let Value::Array(ts) = get(m, 3)? else { return None };
        let tiers = ts
            .iter()
            .map(|t| match t {
                Value::Array(x) => match x.as_slice() {
                    [Value::Uint(p), Value::Uint(n)] => Some(Tier { price: *p, blocks: *n }),
                    _ => None,
                },
                _ => None,
            })
            .collect::<Option<Vec<_>>>()?;
        Some(Offer { reference: Reference::decode(get(m, 0)?)?, pointer: hash(get(m, 1))?, unit: hash(get(m, 2))?, tiers })
    }

    /// The price of a tier, as an amount.
    pub fn price(&self, tier: u64) -> Option<Amount> {
        let t = self.tiers.get(usize::try_from(tier).ok()?)?;
        Some(Amount { unit: self.unit, value: t.price })
    }
}

impl Ticket {
    /// `{ 0: offer, 1: leaf, 2: commitment, 3: tier, 4: batch, 5: deadline }`
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![
            (key(0), b(&self.offer)),
            (key(1), b(&self.leaf)),
            (key(2), b(&self.commitment)),
            (key(3), Value::Uint(self.tier)),
            (key(4), Value::Uint(self.batch)),
            (key(5), Value::Uint(self.deadline)),
        ]
    }

    pub fn from_map(m: &[(Value, Value)]) -> Option<Ticket> {
        Some(Ticket {
            offer: hash(get(m, 0))?,
            leaf: hash(get(m, 1))?,
            commitment: hash(get(m, 2))?,
            tier: uint(get(m, 3))?,
            batch: uint(get(m, 4))?,
            deadline: uint(get(m, 5))?,
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
    Omitted { refund: Amount },
    /// Anchored, but after the deadline: a default, the price owed back
    /// (the anchor still counts as an anchor, at its point).
    Late { point: u64, refund: Amount },
    /// The deadline is buried at the clock's depth and no anchor at or
    /// before it is shown: non-delivery, a default, the price owed back.
    Default { refund: Amount },
    /// This verifier cannot judge: it does not follow the offer's clock.
    Unknown(String),
}

/// The slack, in points, a payer's client allows between its own view of
/// the clock and the service's when it checks a ticket's deadline.
/// *Mechanic, the build's.*
pub const SLACK: u64 = 1;

/// Whether `payment` buys `ticket` under `offer`: the payment cMIP's answer
/// valid, for the ticket's commitment, to the service, following the
/// offer's pointer, for exactly the tier's price.
fn bought(offer_id: &Hash, offer: &Offer, service: &Hash, ticket: &Ticket, c: &Commitment) -> Result<Amount, String> {
    if &ticket.offer != offer_id {
        return Err("the ticket names another offer".into());
    }
    let Some(price) = offer.price(ticket.tier) else {
        return Err("the offer has no such tier".into());
    };
    if c.hash() != ticket.commitment {
        return Err("the payment's commitment is not the one the ticket names".into());
    }
    if &c.payee != service || c.fulfils != offer.pointer || !matches!(c.paid_to, PaidTo::Flow { pointer, .. } if pointer == offer.pointer) {
        return Err("the payment does not follow the offer's pointer to the service".into());
    }
    if c.amount != price {
        return Err("the payment is not the tier's price".into());
    }
    Ok(price)
}

/// Judge a ticket (anchoring cMIP draft 2, "Omission and default"), from
/// what the service signed (`offer`, `ticket`, `publications`), the
/// payment, an anchor shown (the clock Module's proof, for the ticket's
/// leaf), and the clock as this verifier follows it. In order:
///
/// 1. **Not paid:** the payment is not valid, or does not buy this ticket
///    (another commitment, payee, pointer, or not the tier's price):
///    nothing is owed.
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
#[allow(clippy::too_many_arguments)]
pub fn judge(offer_id: &Hash, offer: &Offer, service: &Hash, ticket: &Ticket, payment: &Payment, publications: &[Publication], anchor: Option<&[u8]>, clock: &dyn BatchClock) -> Judgment {
    let refund = match bought(offer_id, offer, service, ticket, &payment.commitment) {
        Ok(price) => price,
        Err(w) => return Judgment::NotPaid(w),
    };
    if payment.answer != Answer::Valid {
        return Judgment::NotPaid(format!("the payment is not shown made: {}", payment.answer));
    }
    if clock.reference() != offer.reference {
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

/// Client conformance: whether a payer's client accepts a ticket before
/// paying, against the offer it chose and its own clock's point `now`: the
/// offer and the tier exist, the ticket names the payer's commitment, the
/// commitment pays the tier's price to the service through the offer's
/// pointer, and the deadline is after `now` and no later than `now` plus
/// the tier's blocks and [`SLACK`].
pub fn acceptable(offer_id: &Hash, offer: &Offer, ticket: &Ticket, commitment: &Commitment, service: &Hash, now: u64) -> Result<(), String> {
    bought(offer_id, offer, service, ticket, commitment)?;
    let blocks = offer.tiers[ticket.tier as usize].blocks;
    if ticket.deadline <= now || ticket.deadline > now + blocks + SLACK {
        return Err(format!("the deadline {} is not within the tier's {blocks} blocks of this client's point {now}", ticket.deadline));
    }
    Ok(())
}
