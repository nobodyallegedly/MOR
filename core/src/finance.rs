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
//! be paid (rule 14a), or why it cannot be paid at all (rule 16).

use crate::cbor::Value;
use crate::hash::Hash;
use crate::identity::Declaration;
use std::fmt;

/// The types this MIP defines (Finance, "Act formats").
pub mod types {
    pub const PAYEE_POINTER: u64 = 0;
    pub const OBLIGATION: u64 = 1;
    pub const RECEIPT: u64 = 2;
    pub const CLAIM: u64 = 3;
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
    /// Absent if the payer stays anonymous.
    pub payer: Option<Hash>,
    pub payee: Hash,
    pub amount: Amount,
    /// The obligation, agreement, offer or payee-pointer act this hop follows.
    pub fulfils: Hash,
    pub previous: Option<Hash>,
    pub forward: Option<Forward>,
    pub batch: Option<Hash>,
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
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Payload {
    PayeePointer(PayeePointer),
    Obligation(Obligation),
    Receipt(Receipt),
    Claim(Claim),
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
                let f = fields(p, 9, "receipt: unknown key")?;
                Payload::Receipt(Receipt {
                    rail: hash(req(&f, 0, "receipt 0: rail")?, "receipt 0")?,
                    proof: bytes(req(&f, 1, "receipt 1: proof")?, "receipt 1")?,
                    payer: get(&f, 2).map(|v| hash(v, "receipt 2")).transpose()?,
                    payee: hash(req(&f, 3, "receipt 3: payee")?, "receipt 3")?,
                    amount: Amount::decode(req(&f, 4, "receipt 4: amount")?)?,
                    fulfils: hash(req(&f, 5, "receipt 5: fulfils")?, "receipt 5")?,
                    previous: get(&f, 6).map(|v| hash(v, "receipt 6")).transpose()?,
                    forward: get(&f, 7).map(Forward::decode).transpose()?,
                    batch: get(&f, 8).map(|v| hash(v, "receipt 8")).transpose()?,
                })
            }
            CLAIM => {
                let f = fields(p, 8, "claim: unknown key")?;
                Payload::Claim(Claim {
                    rail: hash(req(&f, 0, "claim 0: rail")?, "claim 0")?,
                    proof: bytes(req(&f, 1, "claim 1: proof")?, "claim 1")?,
                    payee: hash(req(&f, 2, "claim 2: payee")?, "claim 2")?,
                    amount: Amount::decode(req(&f, 3, "claim 3: amount")?)?,
                    fulfils: hash(req(&f, 4, "claim 4: fulfils")?, "claim 4")?,
                    disagrees: get(&f, 5).map(|v| hash(v, "claim 5")).transpose()?,
                    referral: get(&f, 6).map(Referral::decode).transpose()?,
                    refund: get(&f, 7).map(Rail::decode).transpose()?,
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
                    put(&mut m, 2, b(x));
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
/// claim by its payer, who is the claim's signer by definition).
pub fn check_signer(payload: &Payload, signer: &Hash) -> R<()> {
    let ok = match payload {
        Payload::PayeePointer(p) => &p.payee == signer,
        Payload::Obligation(o) => &o.debtor == signer,
        Payload::Receipt(r) => &r.payee == signer,
        Payload::Claim(_) => true,
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
    /// Several entries for the unit carry different limits, and the amount
    /// lies between them: rule 14a does not say which limit applies. Refused
    /// rather than guessed (flaw L2 of roadmap step 12).
    Unsettled(&'static str),
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
            Undeliverable::Unsettled(w) => w,
        })
    }
}

/// Rule 14a. `vault` is the payee's vault in force: `None` if it declared
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
    let lo = of_unit.iter().map(|&i| vault[i].limit).min().unwrap();
    let hi = of_unit.iter().map(|&i| vault[i].limit).max().unwrap();
    if amount.value <= lo && lo > 0 {
        Destination::Flow
    } else if amount.value > hi || hi == 0 {
        Destination::Vault(of_unit)
    } else {
        Destination::Undeliverable(Undeliverable::Unsettled(
            "the vault's entries for this unit carry different limits and the amount lies between them; Finance rule 14a does not say which limit applies (flaw L2, refused rather than guessed)",
        ))
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
