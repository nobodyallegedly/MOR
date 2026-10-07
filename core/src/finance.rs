//! The Finance MIP's act formats, the vault, and where a payment may go
//! (Finance draft 6: "Act formats", "The vault", rules 12 to 14b and 16).
//!
//! Each payload decodes strictly, as Identity's do: its CDDL map is closed,
//! so an unknown key, a missing required key or a value of the wrong kind
//! makes the act invalid. Every payload also encodes, so clients and tests
//! can build acts.
//!
//! What a rail's proof shows is not here: the payment cMIP and its rail
//! Modules check it (Finance rule 2, F112). This module answers only what
//! the Finance MIP itself decides: the formats, which pointer counts, and,
//! from the vault the payee declared, where a payment of a given amount may
//! be paid (rule 14a), or why it cannot be paid at all (rule 16); which
//! flow pointer version counts for a payment or a debt, the latest the
//! payee's own act holds through its citations (rule 14, F145, F155), and
//! whether a payment to the flow can count for it; the clock the owner
//! declares, and whether a payment a lock change affects counts as made:
//! anchor or bear the loss (rule 15, F169, F176 to F181). Which acts are
//! the payee's own, and which lock changes affect a payment, is Law's to
//! read (the Law view).

use crate::act::{Inside, Object, Ref, Signature};
use crate::cbor::{self, Value};
use crate::hash::{tagged_hash, Hash};
use crate::identity::{self, Declaration, SigningKey};
use crate::sig::{self, Verdict};
use crate::chain::Quorum;
use crate::envelope::anchoring::{Anchors, Reference};
use std::fmt;

/// The types this MIP defines (Finance, "Act formats").
pub mod types {
    pub const PAYEE_POINTER: u64 = 0;
    pub const OBLIGATION: u64 = 1;
    pub const RECEIPT: u64 = 2;
    pub const CLAIM: u64 = 3;
    /// The creditor's release (F126, from Law type 21): the creditor an
    /// obligation names ends it without full payment.
    pub const RELEASE: u64 = 4;
}

/// The vault's kind in the Identity declarations slot (Finance, "The vault").
pub const VAULT_KIND: u64 = 0;

/// Why a Finance act is invalid on its own.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum FinError {
    /// The payload is not in the type's shape. Names the field.
    Shape(&'static str),
    /// A type number this MIP does not define.
    UnknownType(u64),
    /// A rule of the Finance MIP fails. Names it.
    Check(&'static str),
}

impl fmt::Display for FinError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            FinError::Shape(w) => write!(f, "payload not in the Finance format: {w}"),
            FinError::UnknownType(t) => write!(f, "type {t} is not defined by the Finance MIP"),
            FinError::Check(w) => write!(f, "{w}"),
        }
    }
}

impl std::error::Error for FinError {}

type R<T> = Result<T, FinError>;

// ---------------------------------------------------------------- shared pieces

/// `amount = [ unit: hash, value: uint ]`
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Amount {
    /// The unit's specification.
    pub unit: Hash,
    /// In the unit's smallest part.
    pub value: u64,
}

/// `rail = [ module: hash, address: bstr ]`: a rail Module and the
/// rail-specific address data, which only that Module reads.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Rail {
    pub module: Hash,
    pub address: Vec<u8>,
}

/// `vault-entry = [ unit: hash, rail-module: hash, source: bstr, limit: uint ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VaultEntry {
    pub unit: Hash,
    pub rail_module: Hash,
    /// What the rail Module needs to obtain a fresh receiving address; only
    /// that Module reads it.
    pub source: Vec<u8>,
    /// The largest single payment in this unit that may go to the flow; 0
    /// means flow off for this unit.
    pub limit: u64,
}

/// `forward = [ next-payee: hash, amount, agreement: hash ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Forward {
    pub next_payee: Hash,
    pub amount: Amount,
    pub agreement: Hash,
}

/// `payer = hash / signing-key`: an identity, or an anonymous payer's bare
/// signing key, used for one payment only (F113).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Payer {
    Identity(Hash),
    Key(SigningKey),
}

impl Payer {
    pub fn decode(v: &Value) -> R<Self> {
        match v {
            Value::Bytes(_) => Ok(Payer::Identity(hash(v, "payer")?)),
            Value::Array(_) => Ok(Payer::Key(
                identity::signing_key(v).map_err(|_| FinError::Shape("payer: signing-key"))?,
            )),
            _ => Err(FinError::Shape("payer")),
        }
    }
    pub fn to_value(&self) -> Value {
        match self {
            Payer::Identity(h) => b(h),
            Payer::Key(k) => k.to_value(),
        }
    }
}

/// The tag an anonymous payer's key signs a claim under (F113).
pub const ANONYMOUS_CLAIM_TAG: &str = "MOR/finance/anonymous-claim";

/// `anonymous = [ key: signing-key, sig: bstr ]`: the key an anonymous
/// payment committed to as its payer, and its signature binding it to one
/// claim (claim key 8, F113).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Anonymous {
    pub key: SigningKey,
    pub sig: Vec<u8>,
}

impl Anonymous {
    fn decode(v: &Value) -> R<Self> {
        let a = tuple(v, 2, "anonymous")?;
        Ok(Anonymous {
            key: identity::signing_key(&a[0]).map_err(|_| FinError::Shape("anonymous key"))?,
            sig: bytes(&a[1], "anonymous sig")?,
        })
    }
    fn to_value(&self) -> Value {
        Value::Array(vec![self.key.to_value(), Value::Bytes(self.sig.clone())])
    }
}

/// `referral = [ identity: hash, evidence: hash ]`
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Referral {
    pub identity: Hash,
    pub evidence: Hash,
}

// ---------------------------------------------------------------- payloads

/// Payee pointer (type 0).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PayeePointer {
    /// The identity this pointer is for, which is also its only signer.
    pub payee: Hash,
    pub version: u64,
    /// The previous pointer (absent for version 1).
    pub previous: Option<Hash>,
    /// Rails in order of preference.
    pub rails: Vec<Rail>,
}

/// Obligation (type 1), signed by the debtor.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Obligation {
    pub debtor: Hash,
    pub creditor: Hash,
    pub amount: Amount,
    /// The creditor's payee-pointer act in force when the obligation arose.
    pub pointer: Hash,
    /// The agreement or offer it arises from (Law).
    pub agreement: Option<Hash>,
}

/// Settlement receipt (type 2), signed by the payee of the hop.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Receipt {
    /// The rail Module that carried this hop.
    pub rail: Hash,
    /// The rail's proof, as the payment cMIP and that Module define it.
    pub proof: Vec<u8>,
    /// Absent if the payer stays anonymous and committed no key; an
    /// anonymous payer's bare key where it committed one (F113).
    pub payer: Option<Payer>,
    pub payee: Hash,
    pub amount: Amount,
    /// The obligation, agreement, offer or payee-pointer act this hop follows.
    pub fulfils: Hash,
    pub previous: Option<Hash>,
    pub forward: Option<Forward>,
    pub batch: Option<Hash>,
    /// 9: for a purchase, the claim it pays under (F126).
    pub purchase: Option<Purchase>,
}

/// Payment claim (type 3), signed by the payer.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Claim {
    pub rail: Hash,
    pub proof: Vec<u8>,
    pub payee: Hash,
    pub amount: Amount,
    pub fulfils: Hash,
    /// The receipt this claim disagrees with, if any.
    pub disagrees: Option<Hash>,
    pub referral: Option<Referral>,
    /// Where a refund owed on this payment is to be paid (F80).
    pub refund: Option<Rail>,
    /// An anonymous payer's key and signature (F113): the claim's payer is
    /// then this key, not the act's signer.
    pub anonymous: Option<Anonymous>,
    /// 9: for a purchase, the claim it pays under (F126).
    pub purchase: Option<Purchase>,
}

/// An act's own citations other than `prev`: its inside keys 3
/// (`objects`), 7 (`acks`) and 8 (`refs`), as the act carries them. An
/// anonymous payer's key signs them with its claim (F147), and they are
/// all of that claim's history (rules 14 and 15).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Citations {
    pub objects: Option<Vec<Object>>,
    pub acks: Option<Vec<Hash>>,
    pub refs: Option<Vec<Ref>>,
}

impl Citations {
    /// The citations an act's inside carries.
    pub fn of(inside: &Inside) -> Self {
        Citations {
            objects: inside.objects.clone(),
            acks: inside.acks.clone(),
            refs: inside.refs.clone(),
        }
    }

    /// The acts they name: each `objects` entry's chain and predecessor,
    /// each acknowledged act, each act referred to (a web resource is no
    /// act).
    pub fn acts(&self) -> Vec<Hash> {
        let mut out = vec![];
        for o in self.objects.iter().flatten() {
            out.push(o.chain);
            out.push(o.predecessor);
        }
        out.extend(self.acks.iter().flatten().copied());
        out.extend(self.refs.iter().flatten().filter_map(|r| match r {
            Ref::Act(h) => Some(*h),
            Ref::Web { .. } => None,
        }));
        out
    }
}

impl Claim {
    /// What an anonymous payer's key signs (F135, F147):
    /// `tagged_hash(ANONYMOUS_CLAIM_TAG, [ field 0, field 1, field 2, field
    /// 3, field 4, field 5 or null, field 6 or null, field 7 or null, field
    /// 9 or null, inside key 3 or null, inside key 7 or null, inside key 8
    /// or null ])`, the inside keys being the claim act's own `objects`,
    /// `acks` and `refs`, encoded exactly as the act encodes them. *So
    /// nobody can lift the signature onto another claim, nor re-wrap this
    /// claim with other citations or acknowledgements.*
    pub fn anonymous_message(&self, cited: &Citations) -> Hash {
        let or_null = |v: Option<Value>| v.unwrap_or(Value::Null);
        let v = Value::Array(vec![
            b(&self.rail),
            Value::Bytes(self.proof.clone()),
            b(&self.payee),
            self.amount.to_value(),
            b(&self.fulfils),
            or_null(self.disagrees.as_ref().map(b)),
            or_null(self.referral.as_ref().map(Referral::to_value)),
            or_null(self.refund.as_ref().map(Rail::to_value)),
            or_null(self.purchase.as_ref().map(Purchase::to_value)),
            or_null(cited.objects.as_deref().map(crate::act::objects_value)),
            or_null(cited.acks.as_deref().map(crate::act::acks_value)),
            or_null(cited.refs.as_deref().map(crate::act::refs_value)),
        ]);
        tagged_hash(ANONYMOUS_CLAIM_TAG, &cbor::encode(&v))
    }

    /// The signature an anonymous payer's key makes over this claim.
    pub fn anonymous_signature(&self) -> Option<Signature> {
        self.anonymous.as_ref().map(|a| Signature {
            scheme: a.key.scheme,
            key: a.key.key.clone(),
            sig: a.sig.clone(),
        })
    }

    /// Who paid, as the payment committed to it: the key in field 8 where
    /// present, otherwise the claim's signer.
    pub fn payer(&self, signer: &Hash) -> Payer {
        match &self.anonymous {
            Some(a) => Payer::Key(a.key.clone()),
            None => Payer::Identity(*signer),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Payload {
    PayeePointer(PayeePointer),
    Obligation(Obligation),
    Receipt(Receipt),
    Claim(Claim),
    Release(Release),
}

/// The claim a purchase pays under (receipt and claim field 9, F126): the
/// work's claiming agreement, and the line at which the payer's client
/// read it current. *A Law reference: a Finance-only client shows it as
/// unknown, and cannot make one.*
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Purchase {
    pub agreement: Hash,
    pub line: Hash,
}

impl Purchase {
    pub fn to_value(&self) -> Value {
        Value::Array(vec![b(&self.agreement), b(&self.line)])
    }

    pub fn decode(v: &Value) -> R<Self> {
        match v {
            Value::Array(a) if a.len() == 2 => Ok(Purchase {
                agreement: hash(&a[0], "purchase: agreement")?,
                line: hash(&a[1], "purchase: line")?,
            }),
            _ => Err(FinError::Shape("purchase")),
        }
    }
}

/// The creditor's release (type 4, F126; Law type 21 under F125): the
/// creditor the obligation names ends it, wholly, without full payment.
/// Signed by the creditor alone; a collective creditor by its Finance lane.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Release {
    /// 0: the obligation it ends.
    pub obligation: Hash,
    /// 1: what the creditor took instead, for the record (receipts, a Law
    /// agreement it was traded for, stake transfers); never checked.
    pub against: Vec<Hash>,
}

// ---------------------------------------------------------------- decoding

fn hash(v: &Value, w: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(b) => b.as_slice().try_into().map_err(|_| FinError::Shape(w)),
        _ => Err(FinError::Shape(w)),
    }
}

fn uint(v: &Value, w: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(FinError::Shape(w)),
    }
}

fn bytes(v: &Value, w: &'static str) -> R<Vec<u8>> {
    match v {
        Value::Bytes(b) => Ok(b.clone()),
        _ => Err(FinError::Shape(w)),
    }
}

fn tuple<'a>(v: &'a Value, n: usize, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if a.len() == n => Ok(a),
        _ => Err(FinError::Shape(w)),
    }
}

fn nonempty<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if !a.is_empty() => Ok(a),
        _ => Err(FinError::Shape(w)),
    }
}

fn fields<'a>(p: &'a [(Value, Value)], n: u64, w: &'static str) -> R<Vec<(u64, &'a Value)>> {
    p.iter()
        .map(|(k, v)| match k {
            Value::Uint(k) if *k < n => Ok((*k, v)),
            _ => Err(FinError::Shape(w)),
        })
        .collect()
}

fn get<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

fn req<'a>(f: &[(u64, &'a Value)], k: u64, w: &'static str) -> R<&'a Value> {
    get(f, k).ok_or(FinError::Shape(w))
}

impl Amount {
    pub fn decode(v: &Value) -> R<Self> {
        let a = tuple(v, 2, "amount")?;
        Ok(Amount {
            unit: hash(&a[0], "amount unit")?,
            value: uint(&a[1], "amount value")?,
        })
    }
    pub fn to_value(&self) -> Value {
        Value::Array(vec![b(&self.unit), Value::Uint(self.value)])
    }
}

impl Rail {
    pub fn decode(v: &Value) -> R<Self> {
        let a = tuple(v, 2, "rail")?;
        Ok(Rail {
            module: hash(&a[0], "rail module")?,
            address: bytes(&a[1], "rail address")?,
        })
    }
    pub fn to_value(&self) -> Value {
        Value::Array(vec![b(&self.module), Value::Bytes(self.address.clone())])
    }
}

impl VaultEntry {
    pub fn decode(v: &Value) -> R<Self> {
        let a = tuple(v, 4, "vault-entry")?;
        Ok(VaultEntry {
            unit: hash(&a[0], "vault-entry unit")?,
            rail_module: hash(&a[1], "vault-entry rail module")?,
            source: bytes(&a[2], "vault-entry source")?,
            limit: uint(&a[3], "vault-entry limit")?,
        })
    }
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            b(&self.unit),
            b(&self.rail_module),
            Value::Bytes(self.source.clone()),
            Value::Uint(self.limit),
        ])
    }
}

/// The value of a vault declaration: `[+ vault-entry]`.
pub fn vault_entries(v: &Value) -> R<Vec<VaultEntry>> {
    nonempty(v, "vault")?
        .iter()
        .map(VaultEntry::decode)
        .collect()
}

/// A vault declaration for an identity's genesis or rotation.
pub fn vault_declaration(finance: &Hash, entries: &[VaultEntry]) -> Declaration {
    Declaration {
        spec: *finance,
        kind: VAULT_KIND,
        value: Some(Value::Array(entries.iter().map(|e| e.to_value()).collect())),
    }
}

/// What a genesis or rotation says about the vault: `None` if nothing,
/// `Some(None)` if it removes the vault, `Some(Some(entries))` if it sets it.
pub fn vault_in(
    finance: &Hash,
    declarations: &[Declaration],
) -> R<Option<Option<Vec<VaultEntry>>>> {
    match declarations
        .iter()
        .find(|d| &d.spec == finance && d.kind == VAULT_KIND)
    {
        None => Ok(None),
        Some(Declaration { value: None, .. }) => Ok(Some(None)),
        Some(Declaration { value: Some(v), .. }) => Ok(Some(Some(vault_entries(v)?))),
    }
}

impl Forward {
    fn decode(v: &Value) -> R<Self> {
        let a = tuple(v, 3, "forward")?;
        Ok(Forward {
            next_payee: hash(&a[0], "forward next payee")?,
            amount: Amount::decode(&a[1])?,
            agreement: hash(&a[2], "forward agreement")?,
        })
    }
    fn to_value(&self) -> Value {
        Value::Array(vec![
            b(&self.next_payee),
            self.amount.to_value(),
            b(&self.agreement),
        ])
    }
}

impl Referral {
    fn decode(v: &Value) -> R<Self> {
        let a = tuple(v, 2, "referral")?;
        Ok(Referral {
            identity: hash(&a[0], "referral identity")?,
            evidence: hash(&a[1], "referral evidence")?,
        })
    }
    fn to_value(&self) -> Value {
        Value::Array(vec![b(&self.identity), b(&self.evidence)])
    }
}

impl Payload {
    /// Decode a Finance act's payload by its type.
    pub fn decode(type_: u64, p: &[(Value, Value)]) -> R<Payload> {
        use types::*;
        Ok(match type_ {
            PAYEE_POINTER => {
                let f = fields(p, 4, "payee pointer: unknown key")?;
                let version = uint(req(&f, 1, "payee pointer 1: version")?, "payee pointer 1")?;
                let previous = get(&f, 2)
                    .map(|v| hash(v, "payee pointer 2: previous"))
                    .transpose()?;
                // Version 1 names no predecessor; every later one does.
                if version == 0 || (version == 1) != previous.is_none() {
                    return Err(FinError::Check(
                        "a payee pointer's version is 1 without a predecessor, or more with one",
                    ));
                }
                Payload::PayeePointer(PayeePointer {
                    payee: hash(req(&f, 0, "payee pointer 0: payee")?, "payee pointer 0")?,
                    version,
                    previous,
                    rails: nonempty(req(&f, 3, "payee pointer 3: rails")?, "payee pointer 3")?
                        .iter()
                        .map(Rail::decode)
                        .collect::<R<_>>()?,
                })
            }
            OBLIGATION => {
                let f = fields(p, 5, "obligation: unknown key")?;
                Payload::Obligation(Obligation {
                    debtor: hash(req(&f, 0, "obligation 0: debtor")?, "obligation 0")?,
                    creditor: hash(req(&f, 1, "obligation 1: creditor")?, "obligation 1")?,
                    amount: Amount::decode(req(&f, 2, "obligation 2: amount")?)?,
                    pointer: hash(req(&f, 3, "obligation 3: pointer")?, "obligation 3")?,
                    agreement: get(&f, 4).map(|v| hash(v, "obligation 4")).transpose()?,
                })
            }
            RECEIPT => {
                let f = fields(p, 10, "receipt: unknown key")?;
                Payload::Receipt(Receipt {
                    rail: hash(req(&f, 0, "receipt 0: rail")?, "receipt 0")?,
                    proof: bytes(req(&f, 1, "receipt 1: proof")?, "receipt 1")?,
                    payer: get(&f, 2).map(Payer::decode).transpose()?,
                    payee: hash(req(&f, 3, "receipt 3: payee")?, "receipt 3")?,
                    amount: Amount::decode(req(&f, 4, "receipt 4: amount")?)?,
                    fulfils: hash(req(&f, 5, "receipt 5: fulfils")?, "receipt 5")?,
                    previous: get(&f, 6).map(|v| hash(v, "receipt 6")).transpose()?,
                    forward: get(&f, 7).map(Forward::decode).transpose()?,
                    batch: get(&f, 8).map(|v| hash(v, "receipt 8")).transpose()?,
                    purchase: get(&f, 9).map(Purchase::decode).transpose()?,
                })
            }
            CLAIM => {
                let f = fields(p, 10, "claim: unknown key")?;
                Payload::Claim(Claim {
                    rail: hash(req(&f, 0, "claim 0: rail")?, "claim 0")?,
                    proof: bytes(req(&f, 1, "claim 1: proof")?, "claim 1")?,
                    payee: hash(req(&f, 2, "claim 2: payee")?, "claim 2")?,
                    amount: Amount::decode(req(&f, 3, "claim 3: amount")?)?,
                    fulfils: hash(req(&f, 4, "claim 4: fulfils")?, "claim 4")?,
                    disagrees: get(&f, 5).map(|v| hash(v, "claim 5")).transpose()?,
                    referral: get(&f, 6).map(Referral::decode).transpose()?,
                    refund: get(&f, 7).map(Rail::decode).transpose()?,
                    anonymous: get(&f, 8).map(Anonymous::decode).transpose()?,
                    purchase: get(&f, 9).map(Purchase::decode).transpose()?,
                })
            }
            RELEASE => {
                let f = fields(p, 2, "release: unknown key")?;
                let against = match get(&f, 1) {
                    None => vec![],
                    Some(v) => {
                        let a = nonempty(v, "release 1")?
                            .iter()
                            .map(|x| hash(x, "release 1"))
                            .collect::<R<Vec<_>>>()?;
                        if a.iter().enumerate().any(|(i, x)| a[..i].contains(x)) {
                            return Err(FinError::Shape("release 1: an act named twice"));
                        }
                        a
                    }
                };
                Payload::Release(Release {
                    obligation: hash(req(&f, 0, "release 0: obligation")?, "release 0")?,
                    against,
                })
            }
            t => return Err(FinError::UnknownType(t)),
        })
    }

    pub fn type_(&self) -> u64 {
        match self {
            Payload::PayeePointer(_) => types::PAYEE_POINTER,
            Payload::Obligation(_) => types::OBLIGATION,
            Payload::Receipt(_) => types::RECEIPT,
            Payload::Claim(_) => types::CLAIM,
            Payload::Release(_) => types::RELEASE,
        }
    }

    /// The payload as an inside's payload map.
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = Vec::new();
        match self {
            Payload::PayeePointer(p) => {
                put(&mut m, 0, b(&p.payee));
                put(&mut m, 1, Value::Uint(p.version));
                if let Some(x) = &p.previous {
                    put(&mut m, 2, b(x));
                }
                put(
                    &mut m,
                    3,
                    Value::Array(p.rails.iter().map(Rail::to_value).collect()),
                );
            }
            Payload::Obligation(o) => {
                put(&mut m, 0, b(&o.debtor));
                put(&mut m, 1, b(&o.creditor));
                put(&mut m, 2, o.amount.to_value());
                put(&mut m, 3, b(&o.pointer));
                if let Some(x) = &o.agreement {
                    put(&mut m, 4, b(x));
                }
            }
            Payload::Receipt(r) => {
                put(&mut m, 0, b(&r.rail));
                put(&mut m, 1, Value::Bytes(r.proof.clone()));
                if let Some(x) = &r.payer {
                    put(&mut m, 2, x.to_value());
                }
                put(&mut m, 3, b(&r.payee));
                put(&mut m, 4, r.amount.to_value());
                put(&mut m, 5, b(&r.fulfils));
                if let Some(x) = &r.previous {
                    put(&mut m, 6, b(x));
                }
                if let Some(x) = &r.forward {
                    put(&mut m, 7, x.to_value());
                }
                if let Some(x) = &r.batch {
                    put(&mut m, 8, b(x));
                }
                if let Some(x) = &r.purchase {
                    put(&mut m, 9, x.to_value());
                }
            }
            Payload::Claim(c) => {
                put(&mut m, 0, b(&c.rail));
                put(&mut m, 1, Value::Bytes(c.proof.clone()));
                put(&mut m, 2, b(&c.payee));
                put(&mut m, 3, c.amount.to_value());
                put(&mut m, 4, b(&c.fulfils));
                if let Some(x) = &c.disagrees {
                    put(&mut m, 5, b(x));
                }
                if let Some(x) = &c.referral {
                    put(&mut m, 6, x.to_value());
                }
                if let Some(x) = &c.refund {
                    put(&mut m, 7, x.to_value());
                }
                if let Some(x) = &c.anonymous {
                    put(&mut m, 8, x.to_value());
                }
                if let Some(x) = &c.purchase {
                    put(&mut m, 9, x.to_value());
                }
            }
            Payload::Release(r) => {
                put(&mut m, 0, b(&r.obligation));
                if !r.against.is_empty() {
                    put(&mut m, 1, Value::Array(r.against.iter().map(b).collect()));
                }
            }
        }
        m
    }
}

fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn put(m: &mut Vec<(Value, Value)>, k: u64, v: Value) {
    m.push((Value::Uint(k), v));
}

// ---------------------------------------------------------------- signers

/// Who must sign a Finance act (Finance: a pointer by its payee, F46; an
/// obligation by its debtor, F66; a receipt by the payee of the hop; a
/// claim by its payer, who is the claim's signer by definition, or, for an
/// anonymous payer, the key in its field 8, whose signature must verify:
/// Finance rule 1, F113).
///
/// `cited` is the act's own `objects`, `acks` and `refs`
/// ([`Citations::of`] its inside): an anonymous payer's key signs them
/// with the claim (F147). Other acts ignore it.
pub fn check_signer(payload: &Payload, signer: &Hash, cited: &Citations) -> R<()> {
    if let Payload::Claim(c) = payload {
        if let Some(s) = c.anonymous_signature() {
            if sig::verify(&s, &c.anonymous_message(cited)) != Verdict::Valid {
                return Err(FinError::Check(
                    "an anonymous claim's key 8 must verify under the key it names (Finance rule 1, F113)",
                ));
            }
        }
        return Ok(());
    }
    let ok = match payload {
        Payload::PayeePointer(p) => &p.payee == signer,
        Payload::Obligation(o) => &o.debtor == signer,
        Payload::Receipt(r) => &r.payee == signer,
        Payload::Claim(_) => true,
        // Its signer must be the obligation's creditor: checked where the
        // obligation is held (Law's view, `debt_release`).
        Payload::Release(_) => true,
    };
    if ok {
        Ok(())
    } else {
        Err(FinError::Check(match payload {
            Payload::PayeePointer(_) => "a payee pointer is signed by the identity it is for (F46)",
            Payload::Obligation(_) => "an obligation is signed by the debtor (F66)",
            _ => "a receipt is signed by the payee of the hop",
        }))
    }
}

// ---------------------------------------------------------------- rule 10a: who a refund is owed to

/// Who a refund owed on a payment is owed to (rule 10a, F80, F113; Law
/// rule 32).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum RefundTo {
    /// The payer the receipt names.
    Identity(Hash),
    /// Whoever signs with the key the payment committed to as its payer.
    Key(SigningKey),
    /// The payment committed to no key: nobody can claim it.
    Nobody,
}

/// Who a refund owed on the payment this receipt records is owed to. Never
/// whoever presents the rail proof: others on the route may hold it.
pub fn refund_owed_to(receipt: &Receipt) -> RefundTo {
    match &receipt.payer {
        Some(Payer::Identity(h)) => RefundTo::Identity(*h),
        Some(Payer::Key(k)) => RefundTo::Key(k.clone()),
        None => RefundTo::Nobody,
    }
}

/// Whether a claim, signed by `signer`, claims the refund owed on the
/// payment this receipt records (rule 10a, F113; Law rule 32): it names the
/// same rail, proof, payee and amount, says where to be paid (key 7), and
/// is made by the payer the payment committed to: the named payer, or a
/// claim carrying a valid signature of the committed key (key 8), whoever
/// signs the act, over the claim act's own citations, `cited` (F147). A
/// claim on a payment that committed no key never does.
pub fn claims_refund(receipt: &Receipt, claim: &Claim, signer: &Hash, cited: &Citations) -> bool {
    if claim.rail != receipt.rail
        || claim.proof != receipt.proof
        || claim.payee != receipt.payee
        || claim.amount != receipt.amount
        || claim.refund.is_none()
    {
        return false;
    }
    match refund_owed_to(receipt) {
        RefundTo::Identity(h) => claim.anonymous.is_none() && &h == signer,
        RefundTo::Key(k) => match (&claim.anonymous, claim.anonymous_signature()) {
            (Some(a), Some(s)) => a.key == k && sig::verify(&s, &claim.anonymous_message(cited)) == Verdict::Valid,
            _ => false,
        },
        RefundTo::Nobody => false,
    }
}

// ---------------------------------------------------------------- rule 12: the pointer that counts

/// Which payee pointer counts (rule 12): the latest of an unbroken,
/// unforked chain; at a fork, the last pointer before it, contested.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LatestPointer {
    pub act: Option<Hash>,
    /// Two pointers name the same predecessor: the owner is warned.
    pub contested: bool,
}

/// From the valid pointers held for one payee, as (act id, pointer).
pub fn latest_pointer(held: &[(Hash, PayeePointer)]) -> LatestPointer {
    let mut at = held
        .iter()
        .find(|(_, p)| p.version == 1 && p.previous.is_none());
    if held.iter().filter(|(_, p)| p.version == 1).count() > 1 {
        return LatestPointer {
            act: None,
            contested: true,
        };
    }
    let mut contested = false;
    while let Some((id, p)) = at {
        let next: Vec<_> = held
            .iter()
            .filter(|(_, q)| q.previous.as_ref() == Some(id) && q.version == p.version + 1)
            .collect();
        match next.len() {
            0 => break,
            1 => at = Some(next[0]),
            _ => {
                contested = true;
                break;
            }
        }
    }
    LatestPointer {
        act: at.map(|(id, _)| *id),
        contested,
    }
}

/// Rule 12 applied to a payment: whether the payee pointer `paid` counts,
/// from the valid pointers held for its payee. It counts only on the
/// unbroken, unforked chain: the pointer [`latest_pointer`] gives, or one
/// before it on that chain. *A pointer forked by a second act naming the
/// same predecessor counts only up to the fork: neither branch counts,
/// the owner's nor a thief's, until a rotation settles it.* Which pointer
/// on the chain a debt can be paid to is rule 14's ([`counts_toward`]).
pub fn pointer_counts(held: &[(Hash, PayeePointer)], paid: &Hash) -> bool {
    let mut at = latest_pointer(held).act;
    while let Some(id) = at {
        if &id == paid {
            return true;
        }
        at = held.iter().find(|(i, _)| *i == id).and_then(|(_, p)| p.previous);
    }
    false
}

/// Where a payment was paid, as its rail proof shows it (the payment
/// cMIP's `paid-to`): the payee-pointer act whose rail it was paid to, or
/// the genesis or rotation declaring the vault entry it was paid to.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PaidAt {
    Flow(Hash),
    /// The vault entry at this index of the vault the act declared (the
    /// payment cMIP's `paid-to` says which, F169: replacing an entry or its
    /// source is a lock change for a payment to it).
    VaultEntry(Hash, u64),
}

// ---------------------------------------------------------------- rule 14a: where a payment may go

/// Where a payment of an amount may be paid, from the payee's vault in
/// force (rule 14a), before any rail is chosen.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Destination {
    /// To the flow pointer.
    Flow,
    /// To the vault, under any of these entries (indexes into the vault).
    Vault(Vec<usize>),
    /// Nowhere: an open obligation until the owner can be paid (rule 16).
    Undeliverable(Undeliverable),
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Undeliverable {
    /// The declared vault has no entry for this unit (rule 14a, fail closed).
    UnitNotCovered,
    /// The payee's vault, or its flow pointer, offers no rail the payer
    /// shares (rule 16).
    NoSharedRail,
    /// The payee has no payee pointer (rule 16).
    NoPointer,
}

impl fmt::Display for Undeliverable {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Undeliverable::UnitNotCovered => {
                "the payee's vault has no entry for this unit, so it cannot be paid to the flow (Finance rule 14a)"
            }
            Undeliverable::NoSharedRail => {
                "the payee offers no rail this wallet can pay on for this payment (Finance rule 16)"
            }
            Undeliverable::NoPointer => "the payee has no payee pointer (Finance rule 16)",
        })
    }
}

/// Rule 14a, with F114: where several entries cover the unit, the smallest
/// of their limits applies. `vault` is the payee's vault in force: `None` if it declared
/// none. The answer does not yet look at rails; see [`choose`].
pub fn destination(vault: Option<&[VaultEntry]>, amount: &Amount) -> Destination {
    let Some(vault) = vault else {
        return Destination::Flow;
    };
    let of_unit: Vec<usize> = (0..vault.len())
        .filter(|&i| vault[i].unit == amount.unit)
        .collect();
    if of_unit.is_empty() {
        return Destination::Undeliverable(Undeliverable::UnitNotCovered);
    }
    // Several entries for one unit: the smallest limit is the unit's (F114).
    let limit = of_unit.iter().map(|&i| vault[i].limit).min().unwrap();
    if limit > 0 && amount.value <= limit {
        Destination::Flow
    } else {
        Destination::Vault(of_unit)
    }
}

/// Where a payer actually pays: rule 14a, then a rail the payer can use.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Choice {
    /// The flow pointer's rail at this index.
    Flow(usize),
    /// The vault entry at this index.
    Vault(usize),
    Undeliverable(Undeliverable),
}

/// Choose where to pay. `flow` is the payee's pointer in force, if any;
/// `can_pay(module, address or source, unit)` says whether the payer has
/// that rail Module and the rail carries the unit.
pub fn choose(
    flow: Option<&PayeePointer>,
    vault: Option<&[VaultEntry]>,
    amount: &Amount,
    can_pay: impl Fn(&Hash, &[u8], &Hash) -> bool,
) -> Choice {
    match destination(vault, amount) {
        Destination::Undeliverable(u) => Choice::Undeliverable(u),
        Destination::Flow => {
            let Some(p) = flow else {
                return Choice::Undeliverable(Undeliverable::NoPointer);
            };
            match p
                .rails
                .iter()
                .position(|r| can_pay(&r.module, &r.address, &amount.unit))
            {
                Some(i) => Choice::Flow(i),
                None => Choice::Undeliverable(Undeliverable::NoSharedRail),
            }
        }
        Destination::Vault(entries) => {
            let v = vault.expect("a vault destination has a vault");
            match entries
                .into_iter()
                .find(|&i| can_pay(&v[i].rail_module, &v[i].source, &amount.unit))
            {
                Some(i) => Choice::Vault(i),
                None => Choice::Undeliverable(Undeliverable::NoSharedRail),
            }
        }
    }
}

/// Whether a payment that reached the flow followed the published vault
/// (rules 14a and 15): only such a payment is protected by good faith.
pub fn flow_followed_vault(vault: Option<&[VaultEntry]>, amount: &Amount) -> bool {
    destination(vault, amount) == Destination::Flow
}

// ---------------------------------------------------------------- rule 14: what arose under an earlier flow pointer

/// Where a payment was paid, as rule 14 reads it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PaidInto {
    /// The payee's flow pointer of this version.
    Flow(u64),
    /// The payee's vault.
    Vault,
}

/// Rule 14: whether a payment paid into `into` can count for an obligation
/// or act that names the payee's flow pointer of version `named`. A payment
/// to the flow counts only for what names that flow pointer's version or a
/// later one; anything that arose under an earlier flow pointer counts only
/// if paid to the vault. *So a thief who changes the flow pointer cannot
/// collect the backlog through it: every older obligation names an earlier
/// version, and only the debtor signs one (F34, F66).*
///
/// A necessary condition, not a sufficient one: the rail's proof (rule 2),
/// the rails the payee accepts (rule 12a) and the vault's limits (rule 14a)
/// are judged on their own.
pub fn counts_toward(named: u64, into: PaidInto) -> bool {
    match into {
        PaidInto::Vault => true,
        PaidInto::Flow(paid) => named >= paid,
    }
}


// ---------------------------------------------------------------- rules 14 and 15: what an act holds

/// What an act holds (rules 14 and 15, F155): every act reachable through
/// its citations, `prev`, `objects`, `acks` and `refs`, directly or
/// through what they cite; never a hash merely written in a payload.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Holds {
    pub acts: std::collections::BTreeSet<Hash>,
    /// The walk met no act this verifier does not hold: what is not in
    /// `acts` is not held. Where it did, an act missing from `acts` may
    /// still be held, behind the gap.
    pub complete: bool,
}

/// The acts an inside cites: its `prev`, then its other citations
/// ([`Citations::acts`]).
pub fn cites(inside: &Inside) -> Vec<Hash> {
    let mut out: Vec<Hash> = inside.prev.iter().flatten().copied().collect();
    out.extend(Citations::of(inside).acts());
    out
}

/// What the acts `from` and everything they cite hold, `from` included:
/// the walk follows each act's citations ([`cites`]) through the acts this
/// verifier holds.
pub fn holds(v: &crate::chain::Verifier, from: Vec<Hash>) -> Holds {
    let mut out = Holds {
        acts: Default::default(),
        complete: true,
    };
    let mut todo = from;
    while let Some(x) = todo.pop() {
        if !out.acts.insert(x) {
            continue;
        }
        match v.get(&x) {
            Some(h) => todo.extend(cites(&h.inside)),
            None => out.complete = false,
        }
    }
    out
}

/// What the acts `from` hold for selecting `own`'s pointer and vault
/// (rules 12a, 14 and 15, F157): as [`holds`], but the walk passes
/// only through acts `own` signed, never through an act another identity
/// signed, so what a drafter's terms or a debtor's IOU cite never reaches
/// it. An act of another's met on the way is left out, and not followed.
/// An act not held may be `own`'s, so meeting one makes the walk
/// incomplete. *The payee's pointers are acts in its own sequence, so the
/// walk finds the latest the payee had published when it signed.*
pub fn holds_own(v: &crate::chain::Verifier, from: Vec<Hash>, own: &Hash) -> Holds {
    let mut out = Holds {
        acts: Default::default(),
        complete: true,
    };
    let mut todo = from;
    let mut seen = std::collections::BTreeSet::new();
    while let Some(x) = todo.pop() {
        if !seen.insert(x) {
            continue;
        }
        match v.get(&x) {
            Some(h) if h.act.outside.signer.as_ref() == Some(own) => {
                out.acts.insert(x);
                todo.extend(cites(&h.inside));
            }
            Some(_) => {}
            None => out.complete = false,
        }
    }
    out
}

/// The history of an act, as rules 14 and 15 read it: what its citations
/// hold, the act itself left out. For an anonymous payer's claim (claim
/// key 8, `anonymous`), only what its `objects`, `acks` and `refs` hold,
/// the citations its key signed: its `prev` belongs to whoever signed the
/// act, not to the payer, and does not count (F147).
pub fn history(v: &crate::chain::Verifier, inside: &Inside, anonymous: bool) -> Holds {
    let from = if anonymous {
        Citations::of(inside).acts()
    } else {
        cites(inside)
    };
    holds(v, from)
}

/// The payee's pointer acts that the payee's own act, or acts, hold, for
/// a payment or an obligation (rules 14 and 15, F145): the payee's
/// signature act on the agreement, or the offer the agreement accepts; for
/// an obligation with neither, the payee's own acts acknowledging it.
/// Which acts those are is Law's to say (a Law client checks it, F66).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Holding {
    /// The payee's payee-pointer acts they hold, whatever their standing
    /// now: which of them count is rule 12's ([`select_pointer`]).
    pub pointers: Vec<Hash>,
    /// Every walk was complete ([`Holds::complete`]).
    pub complete: bool,
}

/// Rules 12 and 14 with F145 and F155: the version that counts, the latest
/// of the payee's pointer chain that the payee's own act holds. `held` are
/// the payee's pointer acts it holds ([`Holding`]); `chain` the payee's
/// pointers as this verifier counts them. A forked chain counts only up to
/// the fork (rule 12): a held pointer past the fork is not on the chain
/// that counts, and is passed over. `None` where it holds none that
/// counts.
pub fn select_pointer(held: &[Hash], chain: &[(Hash, PayeePointer)]) -> Option<(Hash, u64)> {
    held.iter()
        .filter(|p| pointer_counts(chain, p))
        .filter_map(|p| chain.iter().find(|(i, _)| i == p).map(|(i, q)| (*i, q.version)))
        .max_by_key(|(_, v)| *v)
}

/// Rule 14's answer for a payment to the flow pointer of version `paid`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Rule14 {
    /// The version selected is `paid` or a later one.
    Counts,
    /// It counts only if paid to the vault; says why.
    Vault(&'static str),
    /// What the payee's acts hold cannot be told from the acts held.
    Unknown(&'static str),
}

/// Rule 14 with F145 and F155: a payment to the payee's flow pointer of
/// version `paid` counts only where the version selected ([`select_pointer`]
/// over `holding` and `chain`) is that one or a later one (`named >= paid`:
/// the selected wallet or an older one, never a newer one). Where the
/// payee's own acts hold no pointer, it counts only if paid to the vault.
/// The version an obligation names (field 3) is informative only, and not
/// read here. What the payee's act holds is found through the payee's own
/// acts only ([`holds_own`], F157). *The pointer is judged by the act of
/// the one it pays, never by the act of the one who pays or drafts.*
pub fn rule_14(holding: &Holding, chain: &[(Hash, PayeePointer)], paid: u64) -> Rule14 {
    match select_pointer(&holding.pointers, chain) {
        Some((_, named)) if counts_toward(named, PaidInto::Flow(paid)) => Rule14::Counts,
        _ if !holding.complete => Rule14::Unknown(
            "what the payee's own act holds is not known from the acts held: a later pointer may lie behind an act not held (Finance rule 14, F145)",
        ),
        None => Rule14::Vault(
            "no act of the payee's own (its signature act on the agreement, the offer, or an act acknowledging the obligation) holds a pointer of its that counts: it counts only if paid to the vault (Finance rule 14, F145)",
        ),
        Some(_) => Rule14::Vault(
            "the payee's own act holds only an earlier flow pointer than the one it was paid to: it counts only if paid to the vault (Finance rule 14, F145, F155)",
        ),
    }
}

// ---------------------------------------------------------------- rule 15: theft, anchor or bear the loss

/// The clock's kind in the Identity declarations slot (Finance, "The
/// clock", F176).
pub const CLOCK_KIND: u64 = 1;

/// `clock = [ FINANCE, 1, [ main: [ hash, any ], ? backup: [ hash, any ] ] ]`:
/// the main anchoring reference and, optionally, a backup, each an
/// anchoring cMIP and its parameters naming one time reference (F176,
/// F179, F181). Declared with the safety key, as the vault is.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Clock {
    pub main: Reference,
    pub backup: Option<Reference>,
}

impl Clock {
    pub fn decode(v: &Value) -> R<Self> {
        let bad = || FinError::Shape("the clock");
        let Value::Array(a) = v else { return Err(bad()) };
        let r = |x: &Value| Reference::decode(x).ok_or_else(bad);
        match a.as_slice() {
            [m] => Ok(Clock { main: r(m)?, backup: None }),
            [m, b] => Ok(Clock { main: r(m)?, backup: Some(r(b)?) }),
            _ => Err(bad()),
        }
    }

    pub fn to_value(&self) -> Value {
        let mut a = vec![self.main.to_value()];
        a.extend(self.backup.iter().map(Reference::to_value));
        Value::Array(a)
    }
}

/// A clock declaration for an identity's genesis or rotation.
pub fn clock_declaration(finance: &Hash, clock: &Clock) -> Declaration {
    Declaration {
        spec: *finance,
        kind: CLOCK_KIND,
        value: Some(clock.to_value()),
    }
}

/// What a genesis or rotation says about the clock: `None` if nothing,
/// `Some(None)` if it removes the clock, `Some(Some(clock))` if it sets it.
pub fn clock_in(finance: &Hash, declarations: &[Declaration]) -> R<Option<Option<Clock>>> {
    match declarations.iter().find(|d| &d.spec == finance && d.kind == CLOCK_KIND) {
        None => Ok(None),
        Some(Declaration { value: None, .. }) => Ok(Some(None)),
        Some(Declaration { value: Some(v), .. }) => Ok(Some(Some(Clock::decode(v)?))),
    }
}

/// The point at which a rotation's home quorum is met and anchored on one
/// reference (rule 15, F177, F180): the earliest point by which the
/// receipts the home rule requires are all anchored there, each judged by
/// its earliest anchor (F178). With homes of `need` distinct operators
/// required, each operator's earliest anchored receipt, and the `need`-th
/// earliest of those. For an identity that counts on its own signatures,
/// the rotation's own anchor (a stated cost of that trust model). `None`
/// where the quorum is not anchored there: a rotation kept back, or held by
/// fewer homes than the rule requires, has no point yet. A homeless
/// rotation's quorum is read from the new homes it declares, under the new
/// home rule (F182).
pub fn quorum_point(q: &Quorum, rotation: &Hash, anchors: &Anchors, on: &Reference) -> Option<u64> {
    match q {
        Quorum::Own => anchors.earliest(rotation, on),
        Quorum::Homes { need, supports } | Quorum::Homeless { need, supports } => {
            let mut firsts: Vec<u64> = supports
                .iter()
                .filter_map(|rs| rs.iter().filter_map(|r| anchors.earliest(r, on)).min())
                .collect();
            firsts.sort_unstable();
            let need = (*need).max(1) as usize;
            firsts.get(need - 1).copied()
        }
    }
}

/// Where a lock change is anchored, on the clock the payee declared before
/// it (rule 15, F176, F179).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum LockPoint {
    /// Not anchored on a reference that clock names, or no clock was
    /// declared: the owner bears the theft window.
    NotAnchored,
    /// Its quorum is anchored on the main reference, at this point.
    Main(u64),
    /// Not on the main reference, but on the backup, at this point.
    Backup(u64),
}

/// A lock change's point (rule 15): on the main reference where its quorum
/// is anchored there; otherwise on the backup.
pub fn lock_point(clock: Option<&Clock>, q: &Quorum, rotation: &Hash, anchors: &Anchors) -> LockPoint {
    let Some(c) = clock else { return LockPoint::NotAnchored };
    if let Some(p) = quorum_point(q, rotation, anchors, &c.main) {
        return LockPoint::Main(p);
    }
    match c.backup.as_ref().and_then(|b| quorum_point(q, rotation, anchors, b)) {
        Some(p) => LockPoint::Backup(p),
        None => LockPoint::NotAnchored,
    }
}

/// Rule 15 (b): whether a payer's claim is anchored in time against a lock
/// change at `at`, on `clock`, the one declared before it: before or at its
/// point on the main reference, by the claim's earliest anchor there; where
/// the lock change is anchored only on the backup, before or at its point
/// there, or anchored on the main reference at all, whatever its point,
/// since the two references cannot be compared (F179, F182). A claim
/// anchored on neither is not protected.
pub fn claim_in_time(at: LockPoint, clock: &Clock, claim: &Hash, anchors: &Anchors) -> bool {
    match at {
        LockPoint::NotAnchored => true,
        LockPoint::Main(p) => anchors.earliest(claim, &clock.main).is_some_and(|x| x <= p),
        LockPoint::Backup(p) => {
            anchors.earliest(claim, &clock.main).is_some()
                || clock.backup.as_ref().and_then(|b| anchors.earliest(claim, b)).is_some_and(|x| x <= p)
        }
    }
}

/// One lock change affecting a payment, as rule 15 reads it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LockChange {
    /// The rotation.
    pub rotation: Hash,
    /// The clock the payee's chain declared before it, if any.
    pub clock: Option<Clock>,
    /// Its home quorum ([`crate::chain::Verifier::quorum`]).
    pub quorum: Quorum,
}

/// Rule 15, theft: anchor or bear the loss (F169, F176 to F181). A payment
/// that followed the payee's chain as published before the lock changes
/// listed (each one after which it no longer follows it) counts as made
/// where every one of them that is anchored is answered: by the payee's own
/// receipt for it (`receipt`: on a line the rotation kept, signed with a
/// key bound after it, or by its split service with a grant key whose grant
/// still stands), or by a payer's claim anchored before or at its point
/// (`claims`, by act id). An unanchored lock change leaves the payment
/// counting: the owner bears the window. *Where several anchored lock
/// changes affect a payment, it counts only if the claim is anchored before
/// the first of them (F175): requiring every one is the same.*
pub fn rule_15(changes: &[LockChange], receipt: bool, claims: &[Hash], anchors: &Anchors) -> bool {
    changes.iter().all(|c| {
        let at = lock_point(c.clock.as_ref(), &c.quorum, &c.rotation, anchors);
        at == LockPoint::NotAnchored
            || receipt
            || c.clock.as_ref().is_some_and(|k| claims.iter().any(|x| claim_in_time(at, k, x, anchors)))
    })
}
