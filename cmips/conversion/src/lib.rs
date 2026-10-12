//! # mor-conversion
//!
//! The conversion cMIP, draft 1 (`cmips/cmip-conversion-draft-1.md`):
//! Money's conversion task ("a cMIP defining how a conversion is offered
//! and evidenced"). **Experimental**: an instrument for testing the core,
//! never for real money.
//!
//! In plain words: a **conversion service** is an identity that receives on
//! one rail (or unit) and pays on another, at the rate of its own offer
//! (Money, "Conversion service"). It sells a **rail swap**, which is a
//! **proven offer** (Agreements draft 11, rule 11, F261): its delivery
//! leaves a proof anyone checks from data, the onward payment's receipt.
//!
//! - The service publishes a **standing offer** (Agreements type 6, a lone
//!   seller's, F215) selling this cMIP's **terms** in the access form,
//!   `[2, [conversion cMIP, terms]]`: the rail and unit it pays out on, a
//!   **rate** (fixed, or quoted per order no worse than a floor), a **fee**,
//!   and the most points on the offer's time reference it may take.
//! - Before each payment it signs an **order** under the offer: the first
//!   hop's payment commitment, the **forward** it will pay (Money's
//!   `forward`: the next payee, the amount, the offer), what the onward hop
//!   follows, and a **deadline**. *Mechanic, the build's: the order binds
//!   the forward before the money moves, as the anchoring ticket binds a
//!   batch; Money's forward is otherwise written only in the service's own
//!   receipt, after it is paid.*
//! - It signs its **receipt** of the first hop with that forward (Money
//!   receipt field 7), and pays the next hop; the next payee's **receipt**
//!   names the first hop's (field 6, and `objects`).
//! - **Delivered** where that onward receipt is valid, names the first
//!   hop's receipt, is for the forward's amount to the forward's next
//!   payee, and its payment is placed by the deadline on the offer's clock
//!   ([`judge`]; [`Checker`], the core's `ProofChecker`). **Forwarded
//!   nothing** by the deadline: the forward stays an open obligation of the
//!   service, under the offer (Money rule 27, was 9).
//! - [`route`]: Money's route rules (24 to 28, were 5, 6, 8, 9 and 11) read
//!   over receipts: one chain, or where it stops and who owes what.

pub mod route;

use mor_core::agreements::{self, Sold};
use mor_core::cbor::{self, Value};
use mor_core::envelopes::anchoring::Reference;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{Amount, Forward, Payer, Receipt};
use mor_payment::{Answer, Commitment, Held, PaidTo, Proof};

/// This cMIP's spec hash. A test value until its creator is named at step
/// 17.
pub fn spec() -> Hash {
    sha256(b"conversion cMIP, draft 1, test value until publication")
}

/// The act type of an order under this cMIP. *Mechanic, the build's: the
/// number.*
pub const ORDER: u64 = 1;

/// The slack, in points, a payer's client allows between its own view of
/// the clock and the service's when it checks an order's deadline.
/// *Mechanic, the build's, as the anchoring cMIP's.*
pub const SLACK: u64 = 1;

// ---------------------------------------------------------------- terms

/// The rate the terms state: what one unit in is worth out, as a fraction.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Rate {
    /// `[0, num, den]`: every order converts at `num / den`.
    Fixed { num: u64, den: u64 },
    /// `[1, num, den]`: each order quotes its own rate, no worse than
    /// `num / den` (the rate source is the service's quote, signed in the
    /// order before payment; the payer's client compares it with its own).
    Quoted { num: u64, den: u64 },
}

/// The conversion cMIP's terms, what the service's standing offer sells
/// (`[2, [conversion cMIP, terms]]`).
///
/// ```cddl
/// terms = { 0 => [ rail: hash, unit: hash ], 1 => rate, 2 => fee: uint, 3 => blocks: uint }
/// rate  = [ 0, num: uint, den: uint ]   ; fixed
///       / [ 1, num: uint, den: uint ]   ; quoted per order, no worse than this
/// ```
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Terms {
    /// The rail Module the service pays out on (the onward hop's).
    pub out_rail: Hash,
    /// The unit it pays out in (the forward's).
    pub out_unit: Hash,
    pub rate: Rate,
    /// Taken off each conversion, in the out unit.
    pub fee: u64,
    /// The most points on the offer's time reference between an order and
    /// its deadline.
    pub blocks: u64,
}

fn key(k: u64) -> Value {
    Value::Uint(k)
}

fn b(h: &[u8]) -> Value {
    Value::Bytes(h.to_vec())
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

fn fraction(v: &Value) -> Option<(u64, u64)> {
    match v {
        Value::Array(a) => match a.as_slice() {
            [Value::Uint(n), Value::Uint(d)] if *n > 0 && *d > 0 => Some((*n, *d)),
            _ => None,
        },
        _ => None,
    }
}

impl Terms {
    pub fn to_value(&self) -> Value {
        let rate = match self.rate {
            Rate::Fixed { num, den } => [0, num, den],
            Rate::Quoted { num, den } => [1, num, den],
        };
        Value::Map(vec![
            (key(0), Value::Array(vec![b(&self.out_rail), b(&self.out_unit)])),
            (key(1), Value::Array(rate.iter().map(|n| Value::Uint(*n)).collect())),
            (key(2), Value::Uint(self.fee)),
            (key(3), Value::Uint(self.blocks)),
        ])
    }

    pub fn decode(v: &Value) -> Option<Terms> {
        let Value::Map(m) = v else { return None };
        if m.len() != 4 {
            return None;
        }
        let Value::Array(out) = get(m, 0)? else { return None };
        let [Value::Bytes(rail), Value::Bytes(unit)] = out.as_slice() else { return None };
        let Value::Array(r) = get(m, 1)? else { return None };
        let rate = match r.as_slice() {
            [Value::Uint(0), Value::Uint(num), Value::Uint(den)] if *num > 0 && *den > 0 => Rate::Fixed { num: *num, den: *den },
            [Value::Uint(1), Value::Uint(num), Value::Uint(den)] if *num > 0 && *den > 0 => Rate::Quoted { num: *num, den: *den },
            _ => return None,
        };
        Some(Terms {
            out_rail: rail.as_slice().try_into().ok()?,
            out_unit: unit.as_slice().try_into().ok()?,
            rate,
            fee: uint(get(m, 2))?,
            blocks: uint(get(m, 3))?,
        })
    }

    /// The Agreements standing offer (type 6) the service signs selling
    /// these terms: a lone seller's (no field 0, F215), paid to its signer,
    /// its price (field 2) **the most one conversion takes in** (mechanic,
    /// the build's), its own time reference (field 6) the clock its
    /// deadlines are points on.
    pub fn standing_offer(&self, most_in: Amount, reference: &Reference, words: Option<String>) -> agreements::Offer {
        agreements::Offer {
            under: None,
            sold: vec![Sold::Access(spec(), cbor::encode(&self.to_value()))],
            price: most_in,
            paid: None,
            words,
            until: None,
            time: Some((reference.cmip, reference.params.clone())),
            refund: None,
        }
    }
}

// ---------------------------------------------------------------- the offer

/// The service's standing offer, as this cMIP reads the Agreements offer
/// it signed.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Offer {
    /// The offer act's id: what the first hop follows, and what each
    /// forward names as its agreement.
    pub id: Hash,
    /// The service: the offer's signer, its payee, the receiver of the
    /// first hop and the payer of the onward one.
    pub service: Hash,
    /// Its field 2: the most one conversion takes in, in the in unit.
    pub most_in: Amount,
    pub terms: Terms,
    /// Its own time reference (field 6): deadlines are points on it.
    pub reference: Reference,
}

impl Offer {
    /// Read an Agreements standing offer, `id`, signed by `signer`, as this
    /// cMIP's: a lone seller's (F215), selling exactly these terms, on its
    /// own time reference, paid to its signer (the service converts: it
    /// receives and pays on; mechanic, the build's). Whether it counts as an
    /// offer (public, valid) is Agreements' (`AgreementsView::offer`),
    /// checked beside.
    pub fn read(id: Hash, signer: Hash, o: &agreements::Offer) -> Result<Offer, String> {
        if o.under.is_some() {
            return Err("a conversion offer is a lone seller's (F215): no co-owners' agreement behind it".into());
        }
        let [Sold::Access(cmip, params)] = o.sold.as_slice() else {
            return Err("a conversion offer sells exactly one thing: this cMIP's terms (a version selling nothing withdraws it)".into());
        };
        if cmip != &spec() {
            return Err("it sells another cMIP's terms".into());
        }
        let terms = cbor::decode(params).ok().as_ref().and_then(Terms::decode).ok_or("its terms are not in this cMIP's format")?;
        let Some((cmip, params)) = &o.time else {
            return Err("its deadlines need its own time reference (field 6)".into());
        };
        if o.payee(&signer) != Some(signer) {
            return Err("a conversion offer is paid to its signer, the service that pays on (mechanic, the build's)".into());
        }
        if o.price.value == 0 {
            return Err("its price (field 2), the most one conversion takes in, is more than nothing".into());
        }
        Ok(Offer { id, service: signer, most_in: o.price, terms, reference: Reference { cmip: *cmip, params: params.clone() } })
    }

    /// What `paid_in` comes to out, at the offer's rate (or, where its rate
    /// is quoted, at `quote`, no worse than the floor), less the fee: the
    /// forward's amount. Money rule 25 (was 6): a conversion hop forwards
    /// in the next unit at the rate its agreement defines. Rounded down.
    pub fn out(&self, paid_in: &Amount, quote: Option<(u64, u64)>) -> Result<Amount, String> {
        if paid_in.unit != self.most_in.unit {
            return Err("the payment is not in the unit the offer takes".into());
        }
        if paid_in.value == 0 || paid_in.value > self.most_in.value {
            return Err(format!("the offer converts more than nothing and at most {} (its field 2)", self.most_in.value));
        }
        let (num, den) = match (self.terms.rate, quote) {
            (Rate::Fixed { num, den }, None) => (num, den),
            (Rate::Fixed { .. }, Some(_)) => return Err("the offer's rate is fixed: an order quotes none".into()),
            (Rate::Quoted { .. }, None) => return Err("the offer's rate is quoted per order: the order names its quote".into()),
            (Rate::Quoted { num: fn_, den: fd }, Some((qn, qd))) => {
                if qn == 0 || qd == 0 {
                    return Err("a quote is a fraction of two numbers above zero".into());
                }
                if (qn as u128) * (fd as u128) < (fn_ as u128) * (qd as u128) {
                    return Err(format!("the quote {qn}/{qd} is worse than the offer's floor {fn_}/{fd}"));
                }
                (qn, qd)
            }
        };
        let gross = (paid_in.value as u128) * (num as u128) / (den as u128);
        let out = gross.checked_sub(self.terms.fee as u128).filter(|o| *o > 0).ok_or("the fee takes all of it: nothing to forward")?;
        Ok(Amount { unit: self.terms.out_unit, value: u64::try_from(out).map_err(|_| "too large to forward")? })
    }
}

// ---------------------------------------------------------------- the order

/// The order the service signs under its offer for one conversion, before
/// it is paid (an act of this cMIP, type [`ORDER`], naming the offer in its
/// payload and in its `objects` as `[offer, offer]`; mechanic, the build's).
///
/// ```cddl
/// order = { 0 => offer: hash, 1 => commitment: hash, 2 => forward, 3 => onward: hash, 4 => deadline: uint, ? 5 => quote }
/// forward = [ next-payee: hash, amount, agreement: hash ]   ; Money's, the agreement this offer
/// quote   = [ num: uint, den: uint ]
/// ```
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Order {
    pub offer: Hash,
    /// The payment commitment of the first hop (payment cMIP): the payment
    /// to the service that buys this conversion.
    pub commitment: Hash,
    /// What the service will pay on: Money's forward.
    pub forward: Forward,
    /// What the onward hop follows (its receipt's field 5): the payer's
    /// purpose at the next payee (an obligation, an offer, its pointer).
    pub onward: Hash,
    /// The point on the offer's time reference by which the onward payment
    /// is made.
    pub deadline: u64,
    /// The rate quoted, where the offer's rate is quoted.
    pub quote: Option<(u64, u64)>,
}

impl Order {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let f = &self.forward;
        let mut m = vec![
            (key(0), b(&self.offer)),
            (key(1), b(&self.commitment)),
            (key(2), Value::Array(vec![b(&f.next_payee), f.amount.to_value(), b(&f.agreement)])),
            (key(3), b(&self.onward)),
            (key(4), Value::Uint(self.deadline)),
        ];
        if let Some((n, d)) = self.quote {
            m.push((key(5), Value::Array(vec![Value::Uint(n), Value::Uint(d)])));
        }
        m
    }

    pub fn from_map(m: &[(Value, Value)]) -> Option<Order> {
        if m.iter().any(|(k, _)| !matches!(k, Value::Uint(0..=5))) {
            return None;
        }
        let Value::Array(f) = get(m, 2)? else { return None };
        let [next, amount, agreement] = f.as_slice() else { return None };
        Some(Order {
            offer: hash(get(m, 0))?,
            commitment: hash(get(m, 1))?,
            forward: Forward { next_payee: hash(Some(next))?, amount: Amount::decode(amount).ok()?, agreement: hash(Some(agreement))? },
            onward: hash(get(m, 3))?,
            deadline: uint(get(m, 4))?,
            quote: match get(m, 5) {
                None => None,
                Some(q) => Some(fraction(q)?),
            },
        })
    }
}

/// Whether the payment committed to as `c` buys the conversion `order`
/// under `offer`: the order names the offer and the commitment; the
/// payment follows the offer, to the service, to its flow or vault (which
/// pointer counts is Money's, rules 17 and 29), naming no claim (a lone
/// seller's offer, F215), in the offer's unit, at most its field 2; and the
/// order's forward is what the terms make of it, to be paid under the offer.
pub fn ordered(offer: &Offer, order: &Order, c: &Commitment) -> Result<(), String> {
    if order.offer != offer.id {
        return Err("the order names another offer".into());
    }
    if c.hash() != order.commitment {
        return Err("the payment's commitment is not the one the order names".into());
    }
    if c.fulfils != offer.id {
        return Err("the payment does not follow the conversion offer (a tip to the service's pointer buys no conversion)".into());
    }
    if c.payee != offer.service || matches!(c.paid_to, PaidTo::Refund { .. }) {
        return Err("the payment is not to the service's own flow or vault".into());
    }
    if c.purchase.is_some() {
        return Err("a payment following a lone seller's offer names no claim (F215)".into());
    }
    let out = offer.out(&c.amount, order.quote)?;
    if order.forward.amount != out {
        return Err(format!("the order forwards {} where the offer's terms make {} of the payment", order.forward.amount.value, out.value));
    }
    if order.forward.agreement != offer.id {
        return Err("the order's forward names another agreement than the offer (Money rule 27: the forward is owed under the agreement it names)".into());
    }
    Ok(())
}

/// Client conformance: whether a payer's client accepts an order before
/// paying, at its own clock's point `now`: [`ordered`], and the deadline
/// after `now` and no later than `now` plus the terms' blocks and
/// [`SLACK`]. The client also checks that the forward's next payee and the
/// onward purpose are the ones it asked for, and, under a quoted rate, the
/// quote against its own source.
pub fn acceptable(offer: &Offer, order: &Order, c: &Commitment, now: u64) -> Result<(), String> {
    ordered(offer, order, c)?;
    if order.deadline <= now || order.deadline > now + offer.terms.blocks + SLACK {
        return Err(format!("the deadline {} is not within the terms' {} blocks of this client's point {now}", order.deadline, offer.terms.blocks));
    }
    Ok(())
}

// ---------------------------------------------------------------- receipts, as held

/// A receipt the caller holds and checked as an act (signed by its payee,
/// Money rule 7), with what its `objects` name and the rail's answer the
/// caller got for it with the payment cMIP.
#[derive(Clone, Debug)]
pub struct Hop {
    /// The receipt act's id.
    pub id: Hash,
    pub receipt: Receipt,
    /// The acts its `objects` name (each entry's chain and predecessor).
    pub objects: Vec<Hash>,
    pub answer: Answer,
}

impl Hop {
    /// Whether this receipt names `previous` as the previous hop's: in its
    /// field 6, and in its `objects` (Money, "Settlement receipt": "The
    /// previous hop's receipt is also named in `objects`").
    pub fn names(&self, previous: &Hash) -> bool {
        self.receipt.previous.as_ref() == Some(previous) && self.objects.contains(previous)
    }
}

/// The payment commitment a receipt recomputes (payment cMIP, "The
/// proof"); `None` where its proof is not in the payment cMIP's shape.
pub fn commitment_of(r: &Receipt) -> Option<Commitment> {
    let p = Proof::decode(&r.proof)?;
    Some(Commitment { rail: r.rail, payee: r.payee, amount: r.amount, fulfils: r.fulfils, payer: r.payer.clone(), paid_to: p.paid_to, salt: p.salt, purchase: r.purchase.clone() })
}

/// The first hop's payment, as the caller verified it with the payment
/// cMIP from whichever act shows it (the service's receipt, or the payer's
/// claim: Money rule 11, double entry).
#[derive(Clone, Debug)]
pub struct Payment {
    pub commitment: Commitment,
    pub answer: Answer,
}

// ---------------------------------------------------------------- the clock

/// The offer's clock, as the judgment reads it: where an onward payment is
/// placed, and where the clock stands. The Bitcoin clock Module implements
/// it: an on-chain payment's proof is its anchor, the point its block
/// (F201), at the rail's depth (F205).
pub trait DeliveryClock {
    /// Its time reference.
    fn reference(&self) -> Reference;
    /// The point at which the payment the receipt `hop` records is placed
    /// on this clock, where its proof places it at the clock's depth;
    /// `None` otherwise (a rail this clock cannot read, not yet deep).
    fn point(&self, hop: &Hop, held: &dyn Held) -> Option<u64>;
    /// The point the verifier's clock stands at (on Bitcoin, its tip).
    fn now(&self) -> Option<u64>;
    /// The depth at which a point counts.
    fn depth(&self) -> u64;
}

// ---------------------------------------------------------------- the judgment

/// A forward owed and not paid: Money rule 27 (was 9), "the forward stays
/// an open obligation of that hop, under the agreement named in the
/// forward".
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Owed {
    /// The hop that owes it: the conversion service.
    pub debtor: Hash,
    /// To whom (its next payee), how much, under which agreement (the
    /// offer).
    pub forward: Forward,
    /// The act that declared it: the service's receipt of the first hop,
    /// or, where it signed none, its order.
    pub declared_by: Hash,
}

/// What a conversion comes to.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Judgment {
    /// The first hop is not shown made, or does not buy this order: nothing
    /// is owed under it.
    NotPaid(String),
    /// Paid; no onward payment shown, and the deadline not yet buried at
    /// the clock's depth: wait.
    Pending,
    /// The onward receipt `onward` shows the forward paid, placed at
    /// `point`, by the deadline: delivered, proven.
    Delivered { point: u64, onward: Hash },
    /// The forward paid, but after the deadline: not delivered as the order
    /// promised; nothing stays owed (the money reached its payee).
    Late { point: u64, onward: Hash },
    /// The deadline is buried at the clock's depth and no receipt shows the
    /// forward paid: the service forwarded nothing; the forward is owed.
    Default { owed: Owed },
    /// The service's own receipt of the first hop declares another forward
    /// than its order: two acts it signed disagree, and the order's forward
    /// is what is owed.
    Contradicted { owed: Owed },
    /// This verifier cannot judge: why.
    Unknown(String),
}

/// Judge a conversion (draft 1, "Delivery and default") under `offer`,
/// from the order `order` (act `order_id`) the service signed, the first
/// hop's `paid` payment, the service's receipt of it where held
/// (`first`), the receipts held that may be the onward hop (`hops`), and
/// the offer's clock as this verifier follows it. In order:
///
/// 1. **Not paid:** the payment does not buy this order ([`ordered`]), or
///    its rail answer is not valid.
/// 2. **Unknown:** this verifier's clock is not the offer's reference.
/// 3. **Contradicted:** the service's valid receipt of the first hop
///    declares another forward than the order's.
/// 4. **Delivered or late:** a valid receipt naming the first hop's
///    (field 6 and `objects`), signed by the forward's next payee, paid by
///    the service, for exactly the forward's amount, on the terms' out
///    rail, following the order's onward purpose: placed at or before the
///    deadline, delivered; after it, late. Placed nowhere this clock can
///    read: unknown.
/// 5. **Default:** the clock stands at the deadline plus its depth less
///    one (a point at the deadline would now count), and none is shown.
/// 6. Otherwise pending.
#[allow(clippy::too_many_arguments)]
pub fn judge(offer: &Offer, order_id: &Hash, order: &Order, paid: &Payment, first: Option<&Hop>, hops: &[Hop], clock: &dyn DeliveryClock, held: &dyn Held) -> Judgment {
    if let Err(w) = ordered(offer, order, &paid.commitment) {
        return Judgment::NotPaid(w);
    }
    if !paid.answer.is_valid() {
        return Judgment::NotPaid(format!("the payment is not shown made: {}", paid.answer));
    }
    if clock.reference() != offer.reference {
        return Judgment::Unknown("this verifier's clock is not the offer's reference".into());
    }
    // The service's receipt of this very payment, valid, where it is held.
    let first = first.filter(|r| r.answer.is_valid() && r.receipt.payee == offer.service && commitment_of(&r.receipt).as_ref() == Some(&paid.commitment));
    let owed = |declared_by: Hash| Owed { debtor: offer.service, forward: order.forward.clone(), declared_by };
    if let Some(r) = first {
        if r.receipt.forward.as_ref() != Some(&order.forward) {
            return Judgment::Contradicted { owed: owed(*order_id) };
        }
        let onward: Vec<&Hop> = hops.iter().filter(|h| route::link(r, h).is_ok() && h.receipt.fulfils == order.onward && h.receipt.rail == offer.terms.out_rail).collect();
        let points: Vec<(Option<u64>, Hash)> = onward.iter().map(|h| (clock.point(h, held), h.id)).collect();
        if let Some((point, id)) = points.iter().filter_map(|(p, id)| p.map(|p| (p, *id))).min() {
            return if point <= order.deadline { Judgment::Delivered { point, onward: id } } else { Judgment::Late { point, onward: id } };
        }
        if !points.is_empty() {
            return Judgment::Unknown("the onward payment is shown, but the offer's clock cannot place it: whether it came by the deadline cannot be read".into());
        }
    }
    let Some(now) = clock.now() else {
        return Judgment::Unknown("this verifier's clock gives no point now".into());
    };
    if now >= order.deadline.saturating_add(clock.depth().saturating_sub(1)) {
        return Judgment::Default { owed: owed(first.map(|r| r.id).unwrap_or(*order_id)) };
    }
    Judgment::Pending
}

// ---------------------------------------------------------------- the checker for the core

/// The conversion cMIP's checker for the core (Agreements draft 11, rule
/// 11, F261: "a rail swap, the payment's proof"): [`judge`], read as a
/// verdict. Delivered: proven. Not paid, late, a default or contradicted:
/// not proven. Pending, or what this verifier cannot read: unknown.
///
/// The proof, in this cMIP's encoding (mechanic, the build's): `[ order,
/// onward / null ]`, the order act's id and the onward receipt's. What it
/// reads beside it: the offers, orders, first payments and receipts the
/// caller holds and checked, the clock, and the pointers the payment cMIP
/// asks for.
pub struct Checker<'c> {
    pub offers: Vec<Offer>,
    /// Order acts the caller holds, by id, each signed by its offer's
    /// service (checked as acts by the caller).
    pub orders: Vec<(Hash, Order)>,
    pub payments: Vec<Payment>,
    pub hops: Vec<Hop>,
    pub clock: &'c dyn DeliveryClock,
    pub held: &'c dyn Held,
}

/// The proof [`Checker`] reads: `[ order, onward / null ]`, encoded.
pub fn delivery_proof(order: &Hash, onward: Option<&Hash>) -> Vec<u8> {
    cbor::encode(&Value::Array(vec![b(order), onward.map(|h| b(h)).unwrap_or(Value::Null)]))
}

impl agreements::ProofChecker for Checker<'_> {
    fn check(&self, offer: &Hash, _params: &[u8], proof: &[u8]) -> agreements::ProofVerdict {
        use agreements::ProofVerdict as V;
        let Some(o) = self.offers.iter().find(|o| &o.id == offer) else {
            return V::Unknown("this checker does not hold the offer as a conversion offer".into());
        };
        let (order_id, onward) = match cbor::decode(proof) {
            Ok(Value::Array(x)) if x.len() == 2 => {
                let Some(order) = hash(Some(&x[0])) else { return V::NotProven("not a conversion proof: [order, onward / null]".into()) };
                let onward = match &x[1] {
                    Value::Null => None,
                    v => match hash(Some(v)) {
                        Some(h) => Some(h),
                        None => return V::NotProven("the onward receipt is named by its act id, or null".into()),
                    },
                };
                (order, onward)
            }
            _ => return V::NotProven("not a conversion proof: [order, onward / null]".into()),
        };
        let Some((_, order)) = self.orders.iter().find(|(id, x)| id == &order_id && &x.offer == offer) else {
            return V::Unknown("the order is not held under this offer".into());
        };
        let Some(paid) = self.payments.iter().find(|p| p.commitment.hash() == order.commitment) else {
            return V::Unknown("the payment buying the order is not held".into());
        };
        let first = self.hops.iter().find(|h| h.receipt.payee == o.service && commitment_of(&h.receipt).is_some_and(|c| c.hash() == order.commitment));
        let named: Vec<Hop> = self.hops.iter().filter(|h| Some(h.id) == onward).cloned().collect();
        match judge(o, &order_id, order, paid, first, &named, self.clock, self.held) {
            Judgment::Delivered { .. } => V::Proven,
            Judgment::Pending => V::Unknown("pending: no onward payment shown, the deadline not yet buried".into()),
            Judgment::Unknown(w) => V::Unknown(w),
            Judgment::NotPaid(w) => V::NotProven(format!("not paid: {w}")),
            Judgment::Late { .. } => V::NotProven("the forward was paid after the deadline".into()),
            Judgment::Default { .. } => V::NotProven("nothing forwarded by the deadline: the forward is owed under the offer (Money rule 27)".into()),
            Judgment::Contradicted { .. } => V::NotProven("the service's receipt declares another forward than its order: the order's is owed".into()),
        }
    }
}

/// Whether `payer` names the identity `who`.
pub(crate) fn is(payer: &Option<Payer>, who: &Hash) -> bool {
    matches!(payer, Some(Payer::Identity(h)) if h == who)
}
