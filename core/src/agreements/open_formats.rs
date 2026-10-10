//! The open formats, as one set (roadmap step 12b, 10 October 2026):
//! `docs/formats-proposal-2026-10-10.md` as Fable's review sorted it and
//! Nobody, allegedly, decided it (findings F207 to F219), built in
//! `docs/formats-build-12b.md`.
//!
//! In plain words: the standing offer (what is sold, at what price, paid to
//! whom, under which agreement if any); refund terms (a fixed point after
//! which a refund owed is ended); the split plan (stakes, roles by their
//! name, named receivers, metrics; what happens to a role nobody fills);
//! fees, a field of their own; the work claim; the stake transfer; the
//! request to a judge.
//!
//! Every choice a decision did not make, and that this build made under the
//! delegation of mechanics, is marked "(mechanic, the build's)".

use super::formats::{
    b, check_objects_self, distinct, hash, hashes, hashes_value, judge, nonempty, tuple, uint, Judge, AgreementsError, R,
};
use crate::act::Inside;
use crate::cbor::{self, Value};
use crate::money::Amount;
use crate::hash::Hash;

/// Agreements act types this set adds (numbers are technical choices, as field
/// 26's was, F188).
pub mod new_types {
    /// A request to a judge (rule 34a; Fable's reading of OF24, option a):
    /// the next free number (mechanic, the build's).
    pub const JUDGE_REQUEST: u64 = 25;
    /// A stake transfer (rule 14): its number was always 4.
    pub const STAKE_TRANSFER: u64 = 4;
    /// Liveness (rule 50; Fable's reading of OF23, option a).
    pub const LIVENESS: u64 = 12;
}

/// Agreements act types retired by this set, never reused: 7, the delivery
/// confirmation (Fable's reading of OF6, option b: the payee's receipt
/// naming the offer is the confirmation); 11, the import (OF22, option b:
/// adoption is by acknowledging, citing or paying on, H3, IT2a); 15, Module
/// fee terms (F211: a Module states its fee in its own specification); and
/// 21, the creditor's release (F126, already retired). An act of a retired
/// type is invalid in Agreements.
pub const RETIRED_TYPES: [u64; 4] = [7, 11, 15, 21];

/// Terms fields this set withdraws, never reused: 10, the concurrency rule
/// (Fable's reading of OF20, option c: rule 47's default stands for every
/// collective, Q38 and B11); 25, the relays (F128, already withdrawn).
pub const WITHDRAWN_FIELDS: [u64; 2] = [10, 25];

/// The terms field fees take (F213, decided 10 October 2026: fees are an
/// Agreements matter a constitution can place on their own). The next free
/// number (mechanic, the build's).
pub const FEES_FIELD: u64 = 28;

fn text(v: &Value, w: &'static str) -> R<String> {
    match v {
        Value::Text(t) => Ok(t.clone()),
        _ => Err(AgreementsError::Shape(w)),
    }
}

fn fields(p: &[(Value, Value)], max: u64, w: &'static str) -> R<Vec<(u64, Value)>> {
    let mut out: Vec<(u64, Value)> = vec![];
    for (k, v) in p {
        match k {
            Value::Uint(n) if *n <= max && !out.iter().any(|(m, _)| m == n) => out.push((*n, v.clone())),
            _ => return Err(AgreementsError::Shape(w)),
        }
    }
    Ok(out)
}

fn get(f: &[(u64, Value)], k: u64) -> Option<&Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| v)
}

fn amount(v: &Value, w: &'static str) -> R<Amount> {
    Amount::decode(v).map_err(|_| AgreementsError::Shape(w))
}

// ---------------------------------------------------------------- refund terms

/// Refund terms (terms field 17; an offer's field 7 for a lone seller,
/// F215): `{ 0 => [ 0, point: any ] }`, claimable until this point on the
/// agreement's time reference (or, for a lone seller's offer, the offer's
/// own). F219 (decided 10 October 2026): past it, a refund owed is ended:
/// the obligation closes, the owners keep the money, and it does not block
/// a closing. A fixed point (OF7 a: mechanic, the build's, delegated with
/// F219). Bad-faith terms are not refused: they stay public.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RefundTerms {
    /// The point on the time reference until which a refund is claimable.
    pub until: Value,
}

impl RefundTerms {
    pub fn to_value(&self) -> Value {
        Value::Map(vec![(Value::Uint(0), Value::Array(vec![Value::Uint(0), self.until.clone()]))])
    }

    pub fn decode(v: &Value) -> R<RefundTerms> {
        let Value::Map(m) = v else { return Err(AgreementsError::Shape("refund terms")) };
        let f = fields(m, 0, "refund terms: unknown field")?;
        let lapse = get(&f, 0).ok_or(AgreementsError::Shape("refund terms: the lapse"))?;
        let a = tuple(lapse, 2, "refund terms: the lapse is [0, point] (F219)")?;
        if uint(&a[0], "refund terms: the lapse's form")? != 0 {
            return Err(AgreementsError::Shape("refund terms: the lapse is a fixed point, [0, point] (F219)"));
        }
        Ok(RefundTerms { until: a[1].clone() })
    }
}

// ---------------------------------------------------------------- the standing offer

/// What a standing offer sells (OF1, Fable's reading: `[0]` and `[2]`, given
/// by rule 32 and the freeze suite). `[1, work]`, any publication carrying a
/// work, is not built: it is put to Nobody, allegedly, with F216 (a work-wide
/// offer under the work's agreement would sell around a publication's
/// agreement), and refused meanwhile, fail closed.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Sold {
    /// `[ 0, publication ]`: a publication (Envelopes type 0), by its act id.
    Publication(Hash),
    /// `[ 2, [ cmip, params ] ]`: something with no work hash yet (a live
    /// stream): a cMIP and its parameters.
    Access(Hash, Vec<u8>),
}

impl Sold {
    pub fn to_value(&self) -> Value {
        match self {
            Sold::Publication(p) => Value::Array(vec![Value::Uint(0), b(p)]),
            Sold::Access(c, params) => Value::Array(vec![
                Value::Uint(2),
                Value::Array(vec![b(c), cbor::decode(params).unwrap_or(Value::Null)]),
            ]),
        }
    }

    fn decode(v: &Value) -> R<Sold> {
        let a = nonempty(v, "offer: what it sells")?;
        match (uint(&a[0], "offer: what it sells, its form")?, a.len()) {
            (0, 2) => Ok(Sold::Publication(hash(&a[1], "offer: a publication")?)),
            (1, 2) => Err(AgreementsError::Unsupported(
                "offer: a work, any publication carrying it (OF1 [1]): put to Nobody, allegedly, with F216",
            )),
            (2, 2) => {
                let x = tuple(&a[1], 2, "offer: access, a cMIP and its parameters")?;
                Ok(Sold::Access(hash(&x[0], "offer: access, its cMIP")?, cbor::encode(&x[1])))
            }
            _ => Err(AgreementsError::Shape("offer: what it sells")),
        }
    }
}

/// Who an offer's payments go to (field 3; Fable's review 2.1 to 2.3, taken
/// under the delegation).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Paid {
    /// `hash`: the identity paid, whose payee pointer the payment goes to.
    /// Under an agreement naming a split service, one of its payees: in a
    /// deal, a payee whose grant field 14 lists; in a collective, the
    /// collective (review 2.2).
    Payee(Hash),
    /// `0`: paid by the stakes (rule 18's payer-side splitting, F124 P2,
    /// F125 D3): the payer's wallet pays each holder's own pointer by the
    /// stakes of the agreement in field 0, one flow. Only under an
    /// agreement naming no split service (review 2.1). The encoding is the
    /// build's mechanic.
    ByStakes,
}

/// A standing offer (Agreements type 6, rule 32).
///
/// ```cddl
/// offer-payload = {
///   ? 0 => hash,          ; under: the co-owners' agreement (version) it is made under; present only
///                         ;   where co-owners stand behind it (F215); absent: a lone seller's offer,
///                         ;   itself the agreement between seller and buyer
///   1 => [* sold],        ; what it sells, ascending by deterministic encoding, none twice; empty in a
///                         ;   version that withdraws the offer (OF4 a, mechanic, the build's)
///   2 => amount,          ; the price (OF5 a: one amount)
///   ? 3 => hash / 0,      ; paid: the payee, or 0 for payer-side splitting by the stakes; required
///                         ;   with field 0; absent with no field 0: the signer
///   ? 4 => tstr,          ; the offer's words, canonical text
///   ? 5 => any,           ; until: a point on the time reference after which it takes no payment
///   ? 6 => [hash, any],   ; a lone seller's own time reference (F215, F219; mechanic, the build's)
///   ? 7 => refund-terms   ; a lone seller's own refund terms (F215; mechanic, the build's)
/// }
/// ```
///
/// Its `objects`: the first version names, where field 0 is present, the
/// agreement as `[agreement, agreement]`; a later version names the offer
/// chain `[first, previous]` first (OF4 a, Fable's reading; as a
/// negotiation thread does), then the agreement as above.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Offer {
    pub under: Option<Hash>,
    pub sold: Vec<Sold>,
    pub price: Amount,
    pub paid: Option<Paid>,
    pub words: Option<String>,
    pub until: Option<Value>,
    pub time: Option<(Hash, Value)>,
    pub refund: Option<RefundTerms>,
}

/// An offer as an act names it: the offer, and where it is a later
/// version, the first offer and the previous version (OF4 a).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OfferAct {
    pub offer: Offer,
    /// `(first, previous)` for a later version.
    pub follows: Option<(Hash, Hash)>,
}

impl Offer {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![];
        if let Some(u) = &self.under {
            m.push((Value::Uint(0), b(u)));
        }
        m.push((Value::Uint(1), Value::Array(self.sold.iter().map(Sold::to_value).collect())));
        m.push((Value::Uint(2), self.price.to_value()));
        match &self.paid {
            Some(Paid::Payee(h)) => m.push((Value::Uint(3), b(h))),
            Some(Paid::ByStakes) => m.push((Value::Uint(3), Value::Uint(0))),
            None => {}
        }
        if let Some(w) = &self.words {
            m.push((Value::Uint(4), Value::Text(w.clone())));
        }
        if let Some(u) = &self.until {
            m.push((Value::Uint(5), u.clone()));
        }
        if let Some((h, p)) = &self.time {
            m.push((Value::Uint(6), Value::Array(vec![b(h), p.clone()])));
        }
        if let Some(r) = &self.refund {
            m.push((Value::Uint(7), r.to_value()));
        }
        m
    }

    /// Whether this version withdraws the offer (an empty field 1).
    pub fn withdraws(&self) -> bool {
        self.sold.is_empty()
    }

    /// The identity paid where one is (field 3, or the signer for a lone
    /// seller); `None` where paid by the stakes.
    pub fn payee(&self, signer: &Hash) -> Option<Hash> {
        match &self.paid {
            Some(Paid::Payee(h)) => Some(*h),
            Some(Paid::ByStakes) => None,
            None => Some(*signer),
        }
    }

    /// The checks that need no other act.
    pub fn decode(inside: &Inside) -> R<OfferAct> {
        let f = fields(&inside.payload, 7, "offer: unknown field")?;
        let under = get(&f, 0).map(|v| hash(v, "offer: the agreement it is made under")).transpose()?;
        let Value::Array(sv) = get(&f, 1).ok_or(AgreementsError::Shape("offer: what it sells"))? else {
            return Err(AgreementsError::Shape("offer: what it sells"));
        };
        let sold = sv.iter().map(Sold::decode).collect::<R<Vec<_>>>()?;
        let enc: Vec<Vec<u8>> = sold.iter().map(|s| cbor::encode(&s.to_value())).collect();
        if !enc.windows(2).all(|w| w[0] < w[1]) {
            return Err(AgreementsError::Check("offer: what it sells is ascending by deterministic encoding, none twice"));
        }
        let price = amount(get(&f, 2).ok_or(AgreementsError::Shape("offer: the price"))?, "offer: the price")?;
        let paid = match get(&f, 3) {
            None => None,
            Some(Value::Uint(0)) => Some(Paid::ByStakes),
            Some(v) => Some(Paid::Payee(hash(v, "offer: who is paid")?)),
        };
        let words = get(&f, 4).map(|v| text(v, "offer: its words")).transpose()?;
        let until = get(&f, 5).cloned();
        let time = get(&f, 6)
            .map(|v| {
                let a = tuple(v, 2, "offer: its time reference")?;
                Ok((hash(&a[0], "offer: its time reference's cMIP")?, a[1].clone()))
            })
            .transpose()?;
        let refund = get(&f, 7).map(RefundTerms::decode).transpose()?;
        // F215: co-owners' offers carry field 0, and their agreement's time
        // reference and refund terms; a lone seller's offer carries its own.
        if under.is_some() && (time.is_some() || refund.is_some()) {
            return Err(AgreementsError::Check(
                "offer: an offer under co-owners' agreement takes its time reference and refund terms from that agreement (F215, FR1)",
            ));
        }
        if under.is_some() && paid.is_none() {
            return Err(AgreementsError::Check(
                "offer: under an agreement, field 3 says who is paid: a payee, or the stakes (review 2.1; mechanic, the build's)",
            ));
        }
        if under.is_none() && paid == Some(Paid::ByStakes) {
            return Err(AgreementsError::Check("offer: a lone seller's offer has no stakes to be paid by (F215)"));
        }
        if under.is_none() && (until.is_some() || refund.is_some()) && time.is_none() {
            return Err(AgreementsError::Check(
                "offer: a lone seller's deadline or refund terms are points on its own time reference, field 6 (rule 33; F219)",
            ));
        }
        // Objects: the chain, then the agreement.
        let objects = inside.objects.as_deref().unwrap_or(&[]);
        let mut rest = objects;
        let follows = match objects.first() {
            Some(o) if Some(o.chain) != under || o.chain != o.predecessor => {
                rest = &objects[1..];
                Some((o.chain, o.predecessor))
            }
            _ => None,
        };
        if let Some(u) = &under {
            match rest.first() {
                Some(o) if o.chain == *u && o.predecessor == *u => rest = &rest[1..],
                _ => return Err(AgreementsError::Shape("offer: objects name the agreement it is made under, [agreement, agreement]")),
            }
        }
        // A collective's offer cites its chain after these (F127).
        let _ = rest;
        if sold.is_empty() && follows.is_none() {
            return Err(AgreementsError::Check("offer: only a later version withdraws an offer, by selling nothing (OF4 a)"));
        }
        Ok(OfferAct {
            offer: Offer { under, sold, price, paid, words, until, time, refund },
            follows,
        })
    }
}

// ---------------------------------------------------------------- fees (terms field 28)

/// When a fee applies (F214, decided 10 October 2026: "the agreement states,
/// this will use module x and % will go to its dev. A service not
/// respecting this is liable"): in terms a verifier can check. The
/// encoding is the build's mechanic.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FeeScope {
    /// Absent: every payment.
    Every,
    /// `[ 0, publication ]`: payments for this publication (the receipt's
    /// field 5 naming it, or an offer selling it).
    Publication(Hash),
    /// `[ 1, rail ]`: payments by this rail Module (the receipt's field 0).
    Rail(Hash),
}

/// A fee entry (terms field 28; F213): `[ module: hash, part: uint, ? scope ]`.
/// The bearers are every stake (fees come off the top, rule 26), and they
/// consent by the power the fees field falls under (F213: an area reaching
/// it, or the clone rule; in a deal, every party): no `bearer` field
/// (review 2.4; mechanic, the build's). `part` is computed by the split
/// cMIP (OF8 b, Fable's reading). The Module's own rate, in its
/// specification (F211), is informative: a client shows a plan paying less.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Fee {
    pub module: Hash,
    pub part: u64,
    pub scope: FeeScope,
}

impl Fee {
    pub fn to_value(&self) -> Value {
        let mut v = vec![b(&self.module), Value::Uint(self.part)];
        match &self.scope {
            FeeScope::Every => {}
            FeeScope::Publication(p) => v.push(Value::Array(vec![Value::Uint(0), b(p)])),
            FeeScope::Rail(r) => v.push(Value::Array(vec![Value::Uint(1), b(r)])),
        }
        Value::Array(v)
    }

    fn decode(v: &Value) -> R<Fee> {
        let a = nonempty(v, "fee")?;
        if a.len() != 2 && a.len() != 3 {
            return Err(AgreementsError::Shape("fee: [module, part, ? scope]"));
        }
        let scope = match a.get(2) {
            None => FeeScope::Every,
            Some(s) => {
                let x = tuple(s, 2, "fee: its scope")?;
                match uint(&x[0], "fee: its scope's form")? {
                    0 => FeeScope::Publication(hash(&x[1], "fee: a publication")?),
                    1 => FeeScope::Rail(hash(&x[1], "fee: a rail Module")?),
                    _ => return Err(AgreementsError::Shape("fee: its scope")),
                }
            }
        };
        Ok(Fee { module: hash(&a[0], "fee: the module")?, part: uint(&a[1], "fee: its part")?, scope })
    }

    /// Decode terms field 28: one or more fees, none naming a module twice
    /// with the same scope.
    pub fn decode_field(v: &Value) -> R<Vec<Fee>> {
        let out = nonempty(v, "fees")?.iter().map(Fee::decode).collect::<R<Vec<_>>>()?;
        for (i, x) in out.iter().enumerate() {
            if out[..i].iter().any(|y| y.module == x.module && y.scope == x.scope) {
                return Err(AgreementsError::Check("fees: one module twice for the same payments"));
            }
        }
        Ok(out)
    }

    pub fn field_value(fees: &[Fee]) -> Value {
        Value::Array(fees.iter().map(Fee::to_value).collect())
    }
}

// ---------------------------------------------------------------- the split plan (terms field 8)

/// A share of the plan (Agreements, "Split plan and split").
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ShareRule {
    /// `[ 0, stake, part ]`: a stake, by its index in field 7 of the same
    /// terms; paid to its current holders.
    Stake { stake: u64, part: u64 },
    /// `[ 1, role: tstr, part ]`: a role filled at payment time, named by
    /// its role (Fable's review 7.2, taken under the delegation: never a
    /// transport cMIP's hash). Its evidence is any act the payer the
    /// payment commits to acknowledges (or names as its referral), whatever
    /// cMIP defines it (QG3, F184, F193, F194); or, for a rail Module, the
    /// receipt or claim naming it (F119). Several fillers divide it equally
    /// (OF11 a, Fable's reading).
    Role { role: String, part: u64 },
    /// `[ 2, receiver: hash, part ]`: a named receiver holding no stake (a
    /// service, a position), chosen in advance: no evidence (F194).
    Receiver { receiver: Hash, part: u64 },
    /// `[ 3, metric: uint, part ]`: a metric share, by its index in field 8
    /// (rule 28).
    Metric { metric: u64, part: u64 },
}

impl ShareRule {
    fn kind(&self) -> u64 {
        match self {
            ShareRule::Stake { .. } => 0,
            ShareRule::Role { .. } => 1,
            ShareRule::Receiver { .. } => 2,
            ShareRule::Metric { .. } => 3,
        }
    }

    pub fn to_value(&self) -> Value {
        match self {
            ShareRule::Stake { stake, part } => Value::Array(vec![Value::Uint(0), Value::Uint(*stake), Value::Uint(*part)]),
            ShareRule::Role { role, part } => Value::Array(vec![Value::Uint(1), Value::Text(role.clone()), Value::Uint(*part)]),
            ShareRule::Receiver { receiver, part } => Value::Array(vec![Value::Uint(2), b(receiver), Value::Uint(*part)]),
            ShareRule::Metric { metric, part } => Value::Array(vec![Value::Uint(3), Value::Uint(*metric), Value::Uint(*part)]),
        }
    }

    fn decode(v: &Value) -> R<ShareRule> {
        let a = tuple(v, 3, "split plan: a share is [kind, what, part]")?;
        let part = uint(&a[2], "split plan: a share's part")?;
        match uint(&a[0], "split plan: a share's kind")? {
            0 => Ok(ShareRule::Stake { stake: uint(&a[1], "split plan: a stake")?, part }),
            1 => Ok(ShareRule::Role { role: text(&a[1], "split plan: a role, by its name (review 7.2)")?, part }),
            2 => Ok(ShareRule::Receiver { receiver: hash(&a[1], "split plan: a named receiver")?, part }),
            3 => Ok(ShareRule::Metric { metric: uint(&a[1], "split plan: a metric")?, part }),
            _ => Err(AgreementsError::Shape("split plan: a share's kind")),
        }
    }
}

/// What happens to a role share nobody fills (rule 22; F218, decided 10
/// October 2026: absent a choice, to the stakes in proportion to their
/// parts).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Unfilled {
    /// `[ 0 ]`: to the stakes, in proportion to their parts (the default).
    Stakes,
    /// `[ 1 ]`: held open as an obligation.
    HeldOpen,
    /// `[ 2, receiver ]`: to a named identity.
    To(Hash),
}

/// A metric the plan divides by (rule 28): `[ module, measurer, ? params ]`.
/// The measurer is named in advance by the owners; it is none of the
/// identities the metric divides among, nor the split service (Fable's
/// review 2.7, taken under the delegation; F194). Its record's format is
/// the metric Module's (OF13 d, Fable's reading); the core checks its
/// signer and specification.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Metric {
    pub module: Hash,
    pub measurer: Hash,
    pub params: Option<Value>,
}

/// The split plan (terms field 8).
///
/// ```cddl
/// split-plan = {
///   0 => [+ share-rule],   ; stakes, roles, named receivers, metric shares, in this order of kinds
///   1 => hash,             ; the split cMIP, which computes the amounts (OF8 b)
///   ? 3 => unfilled,       ; absent: [ 0 ], to the stakes (F218)
///   ? 4 => [+ uint],       ; shares taken off the top, by index in field 0, ascending, none twice
///   ? 5 => uint,           ; who bears payout rail fees: 0 each receiver (default), 1 the service
///   ? 6 => amount / uint,  ; the largest rail fee a payout may lose: absolute, or millionths
///   ? 7 => any,            ; the split cMIP's parameters
///   ? 8 => [+ metric]      ; the metrics (rule 28)
/// }
/// ```
///
/// Key 2 is not used: fees are terms field 28 since F213 (mechanic, the
/// build's: the key stays unused, never reused).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SplitPlan {
    pub shares: Vec<ShareRule>,
    pub cmip: Hash,
    pub unfilled: Unfilled,
    pub top: Vec<u64>,
    pub service_bears_rail_fees: bool,
    pub max_rail_fee: Option<Value>,
    pub params: Option<Value>,
    pub metrics: Vec<Metric>,
}

impl SplitPlan {
    pub fn to_value(&self) -> Value {
        let mut m = vec![
            (Value::Uint(0), Value::Array(self.shares.iter().map(ShareRule::to_value).collect())),
            (Value::Uint(1), b(&self.cmip)),
        ];
        match &self.unfilled {
            Unfilled::Stakes => {}
            Unfilled::HeldOpen => m.push((Value::Uint(3), Value::Array(vec![Value::Uint(1)]))),
            Unfilled::To(h) => m.push((Value::Uint(3), Value::Array(vec![Value::Uint(2), b(h)]))),
        }
        if !self.top.is_empty() {
            m.push((Value::Uint(4), Value::Array(self.top.iter().map(|i| Value::Uint(*i)).collect())));
        }
        if self.service_bears_rail_fees {
            m.push((Value::Uint(5), Value::Uint(1)));
        }
        if let Some(x) = &self.max_rail_fee {
            m.push((Value::Uint(6), x.clone()));
        }
        if let Some(x) = &self.params {
            m.push((Value::Uint(7), x.clone()));
        }
        if !self.metrics.is_empty() {
            m.push((
                Value::Uint(8),
                Value::Array(
                    self.metrics
                        .iter()
                        .map(|x| {
                            let mut v = vec![b(&x.module), b(&x.measurer)];
                            if let Some(p) = &x.params {
                                v.push(p.clone());
                            }
                            Value::Array(v)
                        })
                        .collect(),
                ),
            ));
        }
        Value::Map(m)
    }

    pub fn decode(v: &Value) -> R<SplitPlan> {
        let Value::Map(m) = v else { return Err(AgreementsError::Shape("split plan")) };
        if m.iter().any(|(k, _)| k == &Value::Uint(2)) {
            return Err(AgreementsError::Check("split plan: fees are terms field 28, their own field, since F213"));
        }
        let f = fields(m, 8, "split plan: unknown field")?;
        let shares = nonempty(get(&f, 0).ok_or(AgreementsError::Shape("split plan: its shares"))?, "split plan: its shares")?
            .iter()
            .map(ShareRule::decode)
            .collect::<R<Vec<_>>>()?;
        if !shares.windows(2).all(|w| w[0].kind() <= w[1].kind()) {
            return Err(AgreementsError::Check("split plan: stakes, then roles, then named receivers, then metric shares"));
        }
        let unfilled = match get(&f, 3) {
            None => Unfilled::Stakes,
            Some(v) => {
                let a = nonempty(v, "split plan: an unfilled role")?;
                match (uint(&a[0], "split plan: an unfilled role")?, a.len()) {
                    (0, 1) => Unfilled::Stakes,
                    (1, 1) => Unfilled::HeldOpen,
                    (2, 2) => Unfilled::To(hash(&a[1], "split plan: an unfilled role's receiver")?),
                    _ => return Err(AgreementsError::Shape("split plan: an unfilled role")),
                }
            }
        };
        let top: Vec<u64> = match get(&f, 4) {
            None => vec![],
            Some(v) => nonempty(v, "split plan: shares off the top")?.iter().map(|x| uint(x, "split plan: a share off the top")).collect::<R<_>>()?,
        };
        if !top.windows(2).all(|w| w[0] < w[1]) || top.iter().any(|i| *i as usize >= shares.len()) {
            return Err(AgreementsError::Check("split plan: shares off the top name shares of field 0, ascending, none twice"));
        }
        let service_bears_rail_fees = match get(&f, 5) {
            None => false,
            Some(Value::Uint(0)) => false,
            Some(Value::Uint(1)) => true,
            Some(_) => return Err(AgreementsError::Check("split plan: field 5 is 0 or 1")),
        };
        let max_rail_fee = get(&f, 6).cloned();
        match &max_rail_fee {
            None => {}
            Some(Value::Uint(n)) if *n <= super::formats::MILLION => {}
            Some(Value::Uint(_)) => return Err(AgreementsError::Check("split plan: a maximum in millionths is at most 1,000,000")),
            Some(v) => {
                amount(v, "split plan: the largest rail fee")?;
            }
        }
        let metrics: Vec<Metric> = match get(&f, 8) {
            None => vec![],
            Some(v) => nonempty(v, "split plan: metrics")?
                .iter()
                .map(|x| {
                    let a = nonempty(x, "split plan: a metric")?;
                    if a.len() != 2 && a.len() != 3 {
                        return Err(AgreementsError::Shape("split plan: a metric is [module, measurer, ? params]"));
                    }
                    Ok(Metric { module: hash(&a[0], "a metric's module")?, measurer: hash(&a[1], "a metric's measurer")?, params: a.get(2).cloned() })
                })
                .collect::<R<_>>()?,
        };
        for s in &shares {
            if let ShareRule::Metric { metric, .. } = s {
                if *metric as usize >= metrics.len() {
                    return Err(AgreementsError::Check("split plan: a metric share names a metric of field 8"));
                }
            }
        }
        Ok(SplitPlan {
            shares,
            cmip: hash(get(&f, 1).ok_or(AgreementsError::Shape("split plan: the split cMIP"))?, "split plan: the split cMIP")?,
            unfilled,
            top,
            service_bears_rail_fees,
            max_rail_fee,
            params: get(&f, 7).cloned(),
            metrics,
        })
    }

    /// The roles the plan names.
    pub fn roles(&self) -> Vec<&str> {
        self.shares
            .iter()
            .filter_map(|s| match s {
                ShareRule::Role { role, .. } => Some(role.as_str()),
                _ => None,
            })
            .collect()
    }

    /// The named receivers.
    pub fn receivers(&self) -> Vec<Hash> {
        self.shares
            .iter()
            .filter_map(|s| match s {
                ShareRule::Receiver { receiver, .. } => Some(*receiver),
                _ => None,
            })
            .collect()
    }
}

// ---------------------------------------------------------------- the work claim

/// A work claim (Agreements type 3, rule 15): who made a work, authorship, not
/// ownership. Signed by one creator, the one who opens it; bound when
/// every other creator listed has a signature act naming it.
///
/// ```cddl
/// work-claim-payload = {
///   0 => hash,           ; the work hash
///   1 => [+ hash],       ; the creators, ascending, none twice, the signer among them
///   ? 2 => [hash, any]   ; a work-claim cMIP and what it produces (a pre-publication commitment)
/// }
/// ```
///
/// No roles (OF17 a, Fable's reading). It counts only where public or
/// addressed to every creator it names (OF16 a, Fable's reading, in F189
/// (8)'s form).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WorkClaim {
    pub work: Hash,
    pub creators: Vec<Hash>,
    pub commitment: Option<(Hash, Value)>,
}

impl WorkClaim {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![(Value::Uint(0), b(&self.work)), (Value::Uint(1), hashes_value(&self.creators))];
        if let Some((h, v)) = &self.commitment {
            m.push((Value::Uint(2), Value::Array(vec![b(h), v.clone()])));
        }
        m
    }

    pub fn decode(inside: &Inside, signer: Option<&Hash>) -> R<WorkClaim> {
        let f = fields(&inside.payload, 2, "work claim: unknown field")?;
        let work = hash(get(&f, 0).ok_or(AgreementsError::Shape("work claim: the work"))?, "work claim: the work")?;
        let creators = hashes(get(&f, 1).ok_or(AgreementsError::Shape("work claim: the creators"))?, "work claim: the creators")?;
        if creators.is_empty() || !creators.windows(2).all(|w| w[0] < w[1]) {
            return Err(AgreementsError::Check("work claim: the creators, ascending, none twice"));
        }
        if signer.is_some_and(|s| !creators.contains(s)) {
            return Err(AgreementsError::Check("work claim: signed by one of its creators (rule 15)"));
        }
        let commitment = get(&f, 2)
            .map(|v| {
                let a = tuple(v, 2, "work claim: its cMIP's commitment")?;
                Ok((hash(&a[0], "work claim: its cMIP")?, a[1].clone()))
            })
            .transpose()?;
        Ok(WorkClaim { work, creators, commitment })
    }
}

// ---------------------------------------------------------------- the stake transfer

/// A stake transfer (Agreements type 4, rule 14): signed by the seller, completed
/// by the buyer's signature act; it takes effect on the seller's own line
/// (F217, decided 10 October 2026): the seller signs it by a chain
/// signature (F132), so no device blurs its place.
///
/// ```cddl
/// transfer-payload = {
///   0 => hash,        ; the version of the agreement defining the stake
///   1 => uint,        ; the stake, by its index there
///   2 => hash,        ; to: the new holder
///   3 => uint,        ; how much, in millionths of the stake: above zero
///   ? 4 => [+ hash]   ; what the seller took for it, for the record; never checked
/// }
/// ```
///
/// Its `objects` name the agreement version as `[agreement, agreement]`
/// (never a fork). Which earlier transfer it follows, and a stake sold
/// twice, are parked with the forked-deal exploration (review 2.8; OF18).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StakeTransfer {
    pub agreement: Hash,
    pub stake: u64,
    pub to: Hash,
    pub share: u64,
    pub record: Vec<Hash>,
}

impl StakeTransfer {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.agreement)),
            (Value::Uint(1), Value::Uint(self.stake)),
            (Value::Uint(2), b(&self.to)),
            (Value::Uint(3), Value::Uint(self.share)),
        ];
        if !self.record.is_empty() {
            m.push((Value::Uint(4), hashes_value(&self.record)));
        }
        m
    }

    pub fn decode(inside: &Inside) -> R<StakeTransfer> {
        let f = fields(&inside.payload, 4, "transfer: unknown field")?;
        let req = |k, w| get(&f, k).ok_or(AgreementsError::Shape(w));
        let t = StakeTransfer {
            agreement: hash(req(0, "transfer: the agreement")?, "transfer: the agreement")?,
            stake: uint(req(1, "transfer: the stake")?, "transfer: the stake")?,
            to: hash(req(2, "transfer: the new holder")?, "transfer: the new holder")?,
            share: uint(req(3, "transfer: how much")?, "transfer: how much")?,
            record: get(&f, 4).map(|v| hashes(v, "transfer: what the seller took")).transpose()?.unwrap_or_default(),
        };
        if t.share == 0 || t.share > super::formats::MILLION {
            return Err(AgreementsError::Check("transfer: above zero, at most the whole stake"));
        }
        if !distinct(&t.record) {
            return Err(AgreementsError::Check("transfer: what the seller took, none twice"));
        }
        let objects = inside.objects.as_deref().unwrap_or(&[]);
        match objects.first() {
            Some(o) if o.chain == t.agreement && o.predecessor == t.agreement => {}
            _ => return Err(AgreementsError::Shape("transfer: objects name the agreement, [agreement, agreement]")),
        }
        Ok(t)
    }
}

// ---------------------------------------------------------------- the request to a judge

/// A request to a judge (Agreements type 25, rule 34a; Fable's reading of OF24,
/// option a, with review 2.6): someone with standing asks a judge the terms
/// name to decide a question; the judge's period runs from it. It counts,
/// and the period runs, only where it is public or sealed to the judge it
/// reaches (review 2.6, taken under the delegation; F189 (8)'s form). An
/// arbitrator's answer is an act of the condition cMIP the agreement names
/// (task 9), left to it.
///
/// ```cddl
/// judge-request-payload = {
///   0 => hash,     ; the version of the agreement whose terms name the judge
///   1 => judge,    ; the judge asked, in the terms' `judge` form
///   2 => hash      ; the question: the act it is about
/// }
/// ```
///
/// Its `objects` name the version as `[agreement, agreement]`, never a fork.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct JudgeRequest {
    pub agreement: Hash,
    pub judge: Judge,
    pub question: Hash,
}

impl JudgeRequest {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.agreement)), (Value::Uint(1), self.judge.to_value()), (Value::Uint(2), b(&self.question))]
    }

    pub fn decode(inside: &Inside) -> R<JudgeRequest> {
        let f = fields(&inside.payload, 2, "request to a judge: unknown field")?;
        let req = |k, w| get(&f, k).ok_or(AgreementsError::Shape(w));
        let r = JudgeRequest {
            agreement: hash(req(0, "request to a judge: the agreement")?, "request to a judge: the agreement")?,
            judge: judge(req(1, "request to a judge: the judge")?)?,
            question: hash(req(2, "request to a judge: the question")?, "request to a judge: the question")?,
        };
        check_objects_self(inside, &r.agreement, "request to a judge: objects name the agreement")?;
        Ok(r)
    }
}

// ---------------------------------------------------------------- liveness

/// Liveness (Agreements type 12, rule 50): a party shows presence on an agreement,
/// `{ 0 => hash }`, naming any version of it as chain and predecessor. It
/// counts only where public or addressed to the agreement's other parties
/// (OF23 a, Fable's reading, F189 (8)'s form); in a collective, only where
/// the collective placed it (FR10).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Liveness {
    pub agreement: Hash,
}

impl Liveness {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        vec![(Value::Uint(0), b(&self.agreement))]
    }

    pub fn decode(inside: &Inside) -> R<Liveness> {
        let f = fields(&inside.payload, 0, "liveness: unknown field")?;
        let agreement = hash(get(&f, 0).ok_or(AgreementsError::Shape("liveness: the agreement"))?, "liveness: the agreement")?;
        check_objects_self(inside, &agreement, "liveness: objects name the agreement")?;
        Ok(Liveness { agreement })
    }
}
