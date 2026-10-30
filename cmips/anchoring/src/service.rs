//! The pooled anchoring service (anchoring cMIP draft 6, "The pooled
//! service"; roadmap step 14a, its second pass, and the redesign of round
//! 8, F407): hashes paid for one by one, anchored in batches, with omission
//! and late anchoring provable from what the service itself signed.
//!
//! In plain words: the service sells under a **publication** (Agreements
//! type 6), a lone seller's: it names no ownership agreement and no
//! partner, and the service is its own split service. What it sells is
//! this cMIP's terms (`[2, [anchoring cMIP, terms]]`): one line per urgency
//! tier (a price per hash, or a price scheme tied to an on-chain measure,
//! F228; and how many blocks the service may take). Its price is a **price
//! tag** (Money type 5) naming the publication, signed by the service and
//! paid to it: the most one hash costs under the terms. A payer pays for one
//! hash by paying that tag at its tier's price, over a rail (Lightning, in
//! the tests), and gets a **ticket** the service signs under the
//! publication: "your leaf goes into batch n, anchored by block D". For
//! every batch the service signs a **batch notice** (this cMIP's type 3,
//! which drafts 2 to 5 called its "publication"): the batch's leaves, and
//! the transaction whose output commits to their root. Then:
//!
//! - a batch notice of batch n without the ticket's leaf is a **provable
//!   omission**, from two acts the service signed;
//! - no anchor of the leaf at or before D, once D is buried at the clock's
//!   depth, is a **default**: non-delivery by a deadline on a named
//!   reference (review section 9, item 2); an anchor after D is **late**,
//!   which is a default too;
//! - each is a refund owed **under the publication's terms** (F225): the
//!   price paid, to the payer the payment committed to, claimable until the
//!   publication's refund point if it sets one (F219). Money carries the
//!   repayment, and shows it repaid ([`standing`]).
//!
//! The publication and the tag are core acts (`mor_core::agreements::
//! Publication`, `mor_core::money::PriceTag`), and the core judges whether
//! the publication counts, whether the tag counts under it, and whether a
//! payment of the tag is a purchase (`AgreementsView::publication`,
//! `tag_under`, `purchase`); it does not check the amount, which this cMIP
//! does ([`acceptable`], [`judge`]). The ticket and the batch notice are
//! this cMIP's acts (types 2 and 3) the service's identity signs, naming
//! the publication by its first version. The caller checks them as acts,
//! and this module reads their payloads. *Draft 2's own offer, type 1 of
//! this cMIP, stays retired.*
//!
//! *Mechanics, the build's (each respecting a decided rule): the act types
//! and payloads; the terms carried as what the publication sells,
//! `[2, [anchoring cMIP, terms]]`; the tag's price read as the most one hash
//! costs under the terms; the price scheme's shape and its one measure, the
//! fee rate, quoted in the ticket; the ticket naming its batch, so that a
//! batch notice without the leaf contradicts it; the leaves listed in the
//! batch notice; the deadline as an absolute point the ticket names; the
//! default, and the refund point's passing, read once buried at the
//! clock's depth on the chain the verifier follows; one block of slack in
//! the payer's check.*

use mor_core::cbor::{self, Value};
use mor_core::envelopes::anchoring::Reference;
use mor_core::money::{Amount, Payer, PriceTag, Priced, RefundTo};
use mor_core::hash::Hash;
use mor_core::agreements::{self, RefundTerms, Sold, SplitPlan, Unfilled};
use mor_payment::{Answer, Commitment, PaidTo};

/// The act types of this cMIP. *Mechanic, the build's: the numbers.*
pub const TICKET: u64 = 2;
/// The batch notice (draft 6's word; drafts 2 to 5 called it this cMIP's
/// "publication", which the Agreements publication is not): the type
/// number, unchanged.
pub const BATCH_NOTICE: u64 = 3;
/// The batch notice's type under its former name, kept for callers.
pub const PUBLICATION: u64 = BATCH_NOTICE;
/// Draft 2's own offer act, retired by F225 (the offer was an Agreements
/// standing offer, and is now an Agreements publication), never reused.
pub const RETIRED_OFFER: u64 = 1;

/// The anchoring task (Development's task table, task 11, F173): the task
/// a service's publication names this cMIP for, in its field 9.
pub const ANCHORING_TASK: u64 = 11;

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

/// The anchoring cMIP's terms, what the service's publication sells
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

    /// The publication (Agreements type 6) the service signs selling these
    /// terms (draft 6, item 9): a lone seller's (no field 1, no partner),
    /// `service` its own split service (field 3), under a split plan with
    /// no share off the top naming the split cMIP `split_cmip`; selling
    /// exactly `[2, [anchoring cMIP, terms]]`; its time reference (field 6)
    /// the terms' reference; its refund terms (field 8) where the service
    /// sets a refund point on it; naming this cMIP for the anchoring task
    /// (field 9).
    pub fn publication(&self, service: Hash, split_cmip: Hash, words: Option<String>, refund_until: Option<u64>) -> agreements::Publication {
        agreements::Publication {
            sold: Some(vec![Sold::Access(crate::spec(), cbor::encode(&self.to_value()))]),
            owners: None,
            partners: vec![],
            service,
            plan: lone_plan(split_cmip),
            words,
            time: Some((self.reference.cmip, self.reference.params.clone())),
            until: None,
            refund: refund_until.map(|u| RefundTerms { until: Value::Uint(u) }),
            cmips: vec![(ANCHORING_TASK, crate::spec())],
            designated: None,
            backups: vec![],
            failed: None,
        }
    }

    /// The first version of the price tag (Money type 5) the service signs
    /// under its publication `first` (its first version): its price the
    /// most one hash costs under these terms, in `unit`, paid to `service`.
    pub fn price_tag(&self, first: Hash, unit: Hash, service: Hash) -> PriceTag {
        PriceTag { priced: Priced::Publication(first), version: 1, previous: None, price: Some(Amount { unit, value: self.most() }), payee: service }
    }
}

/// A lone seller's split plan: no share off the top, everything to the
/// owners' line, which is the seller's own, under the split cMIP named.
pub fn lone_plan(split_cmip: Hash) -> SplitPlan {
    SplitPlan {
        shares: vec![],
        cmip: split_cmip,
        unfilled: Unfilled::Stakes,
        top: vec![],
        service_bears_rail_fees: false,
        max_rail_fee: None,
        params: None,
        metrics: vec![],
        fees: vec![],
    }
}

/// The service's offer, as this cMIP reads it (draft 6, item 9): its
/// publication and the price tag version a payer pays.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Offer {
    /// The publication's first version: what tickets and batch notices
    /// name, and what a refund is owed under.
    pub id: Hash,
    /// The price tag's version read: what a payment buying an anchor
    /// fulfils (Money rule 18).
    pub tag: Hash,
    /// Who is paid: the tag's payee, the service.
    pub payee: Hash,
    /// The tag's price: the most one hash costs under the terms.
    pub price: Amount,
    pub terms: Terms,
    /// The publication's refund terms (field 8): the point on the reference
    /// until which a refund owed under it is claimable (F219).
    pub refund_until: Option<u64>,
}

impl Offer {
    /// Read a service's publication and its price tag as this cMIP's offer
    /// (draft 6, item 9). `first` is the publication's first version, `p`
    /// the version in force (the caller finds the latest, Agreements rule
    /// 11), `drafter` its drafter; `tag` the tag version a payer would pay,
    /// act `tag_id`, signed by `tag_signer`. The publication: a lone
    /// seller's (no field 1, no partner), its drafter its own split service,
    /// selling exactly this cMIP's terms, not ended; on its own time
    /// reference, the terms' own; naming this cMIP for the anchoring task.
    /// The tag: naming `first`, signed by the service (or the party the
    /// publication designates), paid to the service, not withdrawn, its
    /// price the most one hash costs under the terms. Whether the
    /// publication counts and the tag counts under it is Agreements'
    /// (`AgreementsView::publication`, `tag_under`), checked beside.
    pub fn from_publication(first: Hash, drafter: Hash, p: &agreements::Publication, tag_id: Hash, tag_signer: Hash, tag: &PriceTag) -> Result<Offer, String> {
        if p.owners.is_some() || !p.partners.is_empty() {
            return Err("an anchoring publication is a lone seller's: no ownership agreement (field 1), no partner".into());
        }
        if p.service != drafter {
            return Err("the service is its own split service (field 3): the publication's drafter".into());
        }
        let sold = match &p.sold {
            None => return Err("a split agreement sells nothing".into()),
            Some(s) if s.is_empty() => return Err("this version sells nothing: the publication has ended".into()),
            Some(s) => s,
        };
        let [Sold::Access(cmip, params)] = sold.as_slice() else {
            return Err("an anchoring publication sells exactly one thing: this cMIP's terms".into());
        };
        if cmip != &crate::spec() {
            return Err("it sells another cMIP's access".into());
        }
        let terms = cbor::decode(params).ok().as_ref().and_then(Terms::decode).ok_or("its terms are not in this cMIP's format")?;
        if p.time.as_ref().map(|(c, x)| (c, x)) != Some((&terms.reference.cmip, &terms.reference.params)) {
            return Err("its time reference (field 6) is the clock its deadlines are points on, the terms' reference".into());
        }
        if p.cmip(ANCHORING_TASK) != Some(&crate::spec()) {
            return Err("it names this cMIP for the anchoring task (field 9)".into());
        }
        let refund_until = match &p.refund {
            None => None,
            Some(RefundTerms { until: Value::Uint(u) }) => Some(*u),
            Some(_) => return Err("its refund point is a point on the reference".into()),
        };
        if tag.priced != Priced::Publication(first) {
            return Err("the price tag names another publication, or a bake".into());
        }
        if tag_signer != p.service && p.designated != Some(tag_signer) {
            return Err("the price tag is signed neither by the service nor by the party the publication designates: nobody's offer (Money rule 18)".into());
        }
        if tag.payee != p.service {
            return Err("the price tag is paid to the service, its own split service".into());
        }
        let Some(price) = tag.price else {
            return Err("this version of the price tag carries no price: withdrawn (Money rule 18)".into());
        };
        if price.value != terms.most() {
            return Err("the tag's price is the most one hash costs under the terms (mechanic, the build's)".into());
        }
        Ok(Offer { id: first, tag: tag_id, payee: tag.payee, price, terms, refund_until })
    }

    /// Read an Agreements standing offer as drafts 3 to 5 did. **Kept only
    /// for the WebAssembly binding until the MOR lead moves it** to
    /// [`Offer::from_publication`]: the core no longer reads standing
    /// offers, and nothing else in this cMIP makes one. The offer is its
    /// own price here: `tag` is `id`.
    #[doc(hidden)]
    pub fn read(id: Hash, signer: Hash, o: &agreements::Offer) -> Result<Offer, String> {
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
        Ok(Offer { id, tag: id, payee, price: o.price, terms, refund_until })
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
    /// The publication it sells under, by its first version (drafts 3 to
    /// 5: the standing offer; the wire key 0 is unchanged).
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

/// The batch notice the service signs for each batch it anchors (this
/// cMIP's type 3; drafts 2 to 5 called it a "publication", which the
/// Agreements publication it sells under is not).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Publication {
    /// The Agreements publication it is signed under, by its first version
    /// (the wire key 0 is unchanged).
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
    /// `{ 0: publication, 1: leaf, 2: commitment, 3: tier, 4: batch, 5: deadline, ? 6: quote }`
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

/// The batch notice under its draft 6 name.
pub type BatchNotice = Publication;

impl Publication {
    /// `{ 0: publication, 1: batch, 2: [ leaf, ... ], 3: tx, 4: output }`
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

/// A refund owed under the publication's terms (F225; Agreements, "A
/// service sold under a cMIP's terms"): the price paid, owed to the payer
/// the payment committed to (Money rule 19: an identity, a bare key, or
/// nobody), claimable until the publication's refund point (field 8) where
/// it sets one (F219).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Refund {
    pub amount: Amount,
    pub to: RefundTo,
    pub until: Option<u64>,
}

/// Where a refund stands, given what Money shows repaid toward it
/// (`mor_core::agreements::AgreementsView::refund_repaid`).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Standing {
    /// Owed, `left` still to pay.
    Owed { left: u64 },
    /// Repaid in full: the service's claim, with the rail's proof that the
    /// money went back, naming the payment refunded.
    Repaid,
    /// Past the publication's refund point, unpaid: ended, the service keeps
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
    /// This verifier cannot judge: it does not follow the publication's clock.
    Unknown(String),
}

/// The slack, in points, a payer's client allows between its own view of
/// the clock and the service's when it checks a ticket's deadline.
/// *Mechanic, the build's.*
pub const SLACK: u64 = 1;

/// Whether the payment committed to as `c` buys `ticket` under `offer`
/// (F225; draft 6, item 10): the ticket names the publication and the
/// commitment; the payment pays the publication's price tag (its `fulfils`
/// the tag's version; not the service's pointer, as a tip does: reading 3
/// of step 14a reversed), to the tag's payee, to a flow (which pointer
/// counts is Money's, rule 17), naming no ownership agreement (a lone
/// seller's publication: its receipt carries no field 9), for exactly the
/// tier's price (or, under a scheme, the price the ticket's quote gives,
/// F228). The core does not check the amount: this does. The refund it
/// would be owed.
pub(crate) fn bought(offer: &Offer, ticket: &Ticket, c: &Commitment) -> Result<Refund, String> {
    if ticket.offer != offer.id {
        return Err("the ticket names another publication".into());
    }
    let Some(price) = offer.price(ticket.tier, ticket.quote) else {
        return Err("the offer has no such tier, or the ticket's quote does not fit its price".into());
    };
    if c.hash() != ticket.commitment {
        return Err("the payment's commitment is not the one the ticket names".into());
    }
    if c.fulfils != offer.tag {
        return Err("the payment does not pay the publication's price tag (F225: a tip to the service's pointer buys no anchor)".into());
    }
    if c.payee != offer.payee || !matches!(c.paid_to, PaidTo::Flow { .. }) {
        return Err("the payment is not to the tag's payee's flow".into());
    }
    if c.purchase.is_some() {
        return Err("a purchase under a lone seller's publication names no ownership agreement (Agreements rule 11)".into());
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

/// Judge a ticket (anchoring cMIP draft 6, "Omission and default"), under
/// the service's publication and price tag (`offer`), from what the
/// service signed (`ticket`, its batch notices `publications`), the
/// payment, an anchor shown (the clock Module's proof, for the ticket's
/// leaf), and the clock as this verifier follows it. In order:
///
/// 1. **Not paid:** the payment is not valid, or does not buy this ticket
///    (another commitment or payee, not paying the tag, or not the tier's
///    price): nothing is owed.
/// 2. **Omitted:** a batch notice of the ticket's batch, under its publication,
///    without its leaf (or whose leaves make no batch): a provable
///    omission, whatever else happened; the price is owed back.
/// 3. **Anchored or late:** an anchor of the leaf at the clock's depth: at
///    or before the deadline, delivered; after it, late, the price owed
///    back.
/// 4. **Default:** the clock stands at the deadline plus its depth less
///    one (a point at the deadline would now count), and no anchor at or
///    before it is shown: non-delivery by the deadline on the publication's
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
        return Judgment::Unknown("this verifier's clock is not the publication's reference".into());
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

/// The anchoring cMIP's checker for the core (Agreements draft 11, rule
/// 11, new in draft 11, F261): the pooled anchoring service is a proven
/// delivery (a publication selling this cMIP's access), and this checker is the first the core asks for a proof's
/// verdict. It is [`judge`], unchanged: the hash is in the batch or it is
/// not. What it reads beside the proof is what `judge` reads: the service's
/// offers (each a publication with a tag version) and batch notices, the payments as the caller verified them with
/// the payment cMIP, and the clock as this verifier follows it.
///
/// The proof, in this cMIP's encoding (mechanic, the build's): `[ ticket,
/// anchor / null ]`, the ticket's map and the clock Module's proof for its
/// leaf. Anchored at or before the deadline: proven. Omitted, late or a
/// default: not proven, the refund owed under the publication's terms.
/// Pending, a clock this verifier does not follow, or a publication or
/// payment it does not hold: unknown. The core passes the publication; the
/// offer read is the one under that publication whose tag version the
/// payment pays.
pub struct Checker<'c> {
    pub offers: Vec<Offer>,
    pub publications: Vec<Publication>,
    pub payments: Vec<Payment>,
    pub clock: &'c dyn BatchClock,
}

impl agreements::ProofChecker for Checker<'_> {
    /// This cMIP's specification declares that it checks proofs of
    /// delivery (F268; draft 4, the note under item 10a).
    fn checks_delivery(&self) -> bool {
        true
    }

    fn check(&self, offer: &Hash, _params: &[u8], proof: &[u8]) -> agreements::ProofVerdict {
        use agreements::ProofVerdict as V;
        if !self.offers.iter().any(|o| &o.id == offer) {
            return V::Unknown("this checker does not hold the publication as an anchoring offer".into());
        }
        let (ticket, anchor) = match cbor::decode(proof) {
            Ok(Value::Array(x)) if x.len() == 2 => {
                let Value::Map(m) = &x[0] else { return V::NotProven("not an anchoring proof: [ticket, anchor / null]".into()) };
                let Some(t) = Ticket::from_map(m) else { return V::NotProven("the ticket is not in this cMIP's format".into()) };
                let anchor = match &x[1] {
                    Value::Bytes(a) => Some(a.clone()),
                    Value::Null => None,
                    _ => return V::NotProven("the anchor is a clock Module's proof, or null".into()),
                };
                (t, anchor)
            }
            _ => return V::NotProven("not an anchoring proof: [ticket, anchor / null]".into()),
        };
        let Some(payment) = self.payments.iter().find(|p| p.commitment.hash() == ticket.commitment) else {
            return V::Unknown("the payment buying the ticket is not held".into());
        };
        // The tag version the payment pays, under this publication; where
        // it pays none of them, any, and the judgment says not paid.
        let mut under = self.offers.iter().filter(|o| &o.id == offer);
        let o = self.offers.iter().find(|o| &o.id == offer && o.tag == payment.commitment.fulfils).or_else(|| under.next()).expect("held");
        match judge(o, &ticket, payment, &self.publications, anchor.as_deref(), self.clock) {
            Judgment::Anchored { .. } => V::Proven,
            Judgment::Pending => V::Unknown("pending: not anchored yet, the deadline not yet buried".into()),
            Judgment::Unknown(w) => V::Unknown(w),
            Judgment::NotPaid(w) => V::NotProven(format!("not paid: {w}")),
            Judgment::Omitted { .. } => V::NotProven("a provable omission: the price is owed back".into()),
            Judgment::Late { .. } => V::NotProven("anchored after the deadline: the price is owed back".into()),
            Judgment::Default { .. } => V::NotProven("not anchored by the deadline: the price is owed back".into()),
        }
    }
}

/// The proof [`Checker`] reads: `[ ticket, anchor / null ]`, encoded.
pub fn delivery_proof(ticket: &Ticket, anchor: Option<&[u8]>) -> Vec<u8> {
    cbor::encode(&Value::Array(vec![Value::Map(ticket.to_map()), anchor.map(b).unwrap_or(Value::Null)]))
}

/// Where a refund stands (F225, F219): repaid in full where Money shows
/// `repaid` (what the service's claims, with the rail's proof, show paid
/// back toward it) reach its amount; otherwise ended once the clock stands
/// past the publication's refund point at its depth (a point after it would now
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
/// paying, against the publication and price tag it chose (the latest
/// versions of each, Agreements rule 11, Money rule 18) and its own clock's
/// point `now`: the tier exists, the ticket names the publication and the
/// payer's commitment, the commitment pays the tag to its payee for the
/// tier's price, and the
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
