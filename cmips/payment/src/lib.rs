//! # mor-payment
//!
//! The payment cMIP, draft 1 (`cmips/cmip-payment-draft-1.md`), filling
//! the Finance MIP's task 6. It defines:
//!
//! - the **payment commitment**: one hash binding a payment on a rail to
//!   what the receipt and the claim say (payee, amount, what it fulfils,
//!   payer, where it was paid), which every rail Module carries on its rail;
//! - the **proof** a receipt or claim carries in its field 1: where the
//!   payment was paid, the commitment's salt, and the rail's own proof;
//! - how **rail Modules** plug in ([`RailModule`]);
//! - how a receipt or claim is **verified** ([`verify`]): the payee's own
//!   pointer or vault names the rail address, the commitment is recomputed
//!   from the act, and the rail Module's rule checks the rail's proof.
//!
//! Nothing here signs anything: receipts are signed by receivers, claims by
//! payers (F112).

use mor_core::cbor::{self, Value};
use mor_core::finance::{Amount, Claim, PayeePointer, Receipt, VaultEntry};
use mor_core::hash::{tagged_hash, Hash};
use std::collections::BTreeMap;
use std::fmt;

/// The tag of the payment commitment.
pub const COMMITMENT_TAG: &str = "MOR/cmip/payment/commitment";

/// Where a payment was paid: a rail of the payee's flow pointer, or an
/// entry of the vault the payee's identity chain declared.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PaidTo {
    /// `[0, pointer, rail]`: the payee-pointer act and the index of its rail.
    Flow { pointer: Hash, rail: u64 },
    /// `[1, declared-by, entry]`: the genesis or rotation that declared the
    /// vault in force, and the index of its entry.
    Vault { declared_by: Hash, entry: u64 },
}

impl PaidTo {
    pub fn to_value(&self) -> Value {
        match self {
            PaidTo::Flow { pointer, rail } => Value::Array(vec![
                Value::Uint(0),
                Value::Bytes(pointer.to_vec()),
                Value::Uint(*rail),
            ]),
            PaidTo::Vault { declared_by, entry } => Value::Array(vec![
                Value::Uint(1),
                Value::Bytes(declared_by.to_vec()),
                Value::Uint(*entry),
            ]),
        }
    }

    pub fn decode(v: &Value) -> Option<Self> {
        let Value::Array(a) = v else { return None };
        let [Value::Uint(kind), Value::Bytes(h), Value::Uint(i)] = a.as_slice() else {
            return None;
        };
        let h: Hash = h.as_slice().try_into().ok()?;
        match kind {
            0 => Some(PaidTo::Flow {
                pointer: h,
                rail: *i,
            }),
            1 => Some(PaidTo::Vault {
                declared_by: h,
                entry: *i,
            }),
            _ => None,
        }
    }
}

/// The payment commitment: what the payee's rail endpoint commits to before
/// it is paid, and what a verifier recomputes from a receipt or claim.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Commitment {
    /// The rail Module.
    pub rail: Hash,
    pub payee: Hash,
    pub amount: Amount,
    /// The obligation, agreement, offer or payee-pointer act it follows
    /// (Finance's open parameter: this is how a payment carries it).
    pub fulfils: Hash,
    /// The payer, or `None` for an anonymous payment.
    pub payer: Option<Hash>,
    pub paid_to: PaidTo,
    /// Chosen by the payer, so the commitment cannot be guessed.
    pub salt: [u8; 16],
}

impl Commitment {
    /// `commitment = [ rail, payee, amount, fulfils, payer / null, paid-to, salt ]`
    pub fn to_value(&self) -> Value {
        Value::Array(vec![
            Value::Bytes(self.rail.to_vec()),
            Value::Bytes(self.payee.to_vec()),
            self.amount.to_value(),
            Value::Bytes(self.fulfils.to_vec()),
            self.payer
                .map(|p| Value::Bytes(p.to_vec()))
                .unwrap_or(Value::Null),
            self.paid_to.to_value(),
            Value::Bytes(self.salt.to_vec()),
        ])
    }

    pub fn hash(&self) -> Hash {
        tagged_hash(COMMITMENT_TAG, &cbor::encode(&self.to_value()))
    }
}

/// What a receipt or claim carries in its field 1:
/// `proof = [ paid-to, salt: bstr .size 16, rail-proof: bstr ]`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Proof {
    pub paid_to: PaidTo,
    pub salt: [u8; 16],
    /// The rail's own proof, as its rail Module defines it.
    pub rail: Vec<u8>,
}

impl Proof {
    pub fn encode(&self) -> Vec<u8> {
        cbor::encode(&Value::Array(vec![
            self.paid_to.to_value(),
            Value::Bytes(self.salt.to_vec()),
            Value::Bytes(self.rail.clone()),
        ]))
    }

    pub fn decode(bytes: &[u8]) -> Option<Self> {
        let Ok(Value::Array(a)) = cbor::decode(bytes) else {
            return None;
        };
        let [p, Value::Bytes(salt), Value::Bytes(rail)] = a.as_slice() else {
            return None;
        };
        Some(Proof {
            paid_to: PaidTo::decode(p)?,
            salt: salt.as_slice().try_into().ok()?,
            rail: rail.clone(),
        })
    }
}

/// A verification answer (Finance, "Verification answer").
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Answer {
    Valid,
    Invalid(String),
    Pending(String),
    Unknown(String),
}

impl Answer {
    pub fn is_valid(&self) -> bool {
        matches!(self, Answer::Valid)
    }
}

impl fmt::Display for Answer {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Answer::Valid => write!(f, "valid"),
            Answer::Invalid(w) => write!(f, "invalid: {w}"),
            Answer::Pending(w) => write!(f, "pending: {w}"),
            Answer::Unknown(w) => write!(f, "unknown: {w}"),
        }
    }
}

/// The answer, with the hash of the rail Module that computed it and the
/// trusted party it relied on, if any (Finance rules 2 and 3).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Verification {
    pub answer: Answer,
    pub module: Hash,
    pub trusted: Option<Hash>,
}

/// What a rail Module's rule is given.
pub struct RailInput<'a> {
    /// The payment commitment, recomputed from the act.
    pub commitment: Hash,
    pub amount: &'a Amount,
    /// The rail address (from the pointer) or the source (from the vault),
    /// as the payee signed it.
    pub address: &'a [u8],
    pub rail_proof: &'a [u8],
}

/// A rail Module, as the payment cMIP needs it.
pub trait RailModule {
    /// Its spec hash: what receipt and claim field 0, pointer rails and
    /// vault entries name.
    fn spec(&self) -> Hash;
    /// The unit a rail address or vault source carries, if the address is
    /// one this Module reads.
    fn unit(&self, address: &[u8]) -> Option<Hash>;
    /// The Module's verification rule.
    fn check(&self, input: &RailInput) -> Verification;
}

/// What the verifier holds: valid acts, already checked as acts (signature,
/// signer, standing on the payee's identity chain).
pub trait Held {
    /// A payee-pointer act by id.
    fn pointer(&self, id: &Hash) -> Option<PayeePointer>;
    /// A genesis or rotation by id, that counts on its identity's chain and
    /// declared a vault: its identity and the entries.
    fn vault(&self, declared_by: &Hash) -> Option<(Hash, Vec<VaultEntry>)>;
}

/// The rail Modules a verifier has adopted, by spec hash.
#[derive(Default)]
pub struct Modules<'a> {
    by_spec: BTreeMap<Hash, &'a dyn RailModule>,
}

impl<'a> Modules<'a> {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn adopt(mut self, m: &'a dyn RailModule) -> Self {
        self.by_spec.insert(m.spec(), m);
        self
    }
    pub fn get(&self, spec: &Hash) -> Option<&'a dyn RailModule> {
        self.by_spec.get(spec).copied()
    }
}

/// A receipt or a claim, as signed.
pub enum Record<'a> {
    Receipt(&'a Receipt),
    /// A claim and its signer, who is the payer.
    Claim(&'a Claim, Hash),
}

/// Find the address the payee signed for this payment: its flow pointer's
/// rail, or its vault entry. Errors are the answer to give.
fn address(
    held: &dyn Held,
    m: &dyn RailModule,
    rail: &Hash,
    payee: &Hash,
    amount: &Amount,
    paid_to: &PaidTo,
) -> Result<Vec<u8>, Answer> {
    match paid_to {
        PaidTo::Flow { pointer, rail: i } => {
            let p = held.pointer(pointer).ok_or_else(|| {
                Answer::Unknown("the payee pointer it was paid to is not held".into())
            })?;
            if &p.payee != payee {
                return Err(Answer::Invalid("paid to another identity's pointer".into()));
            }
            let r = p
                .rails
                .get(*i as usize)
                .ok_or_else(|| Answer::Invalid("the pointer has no such rail".into()))?;
            if &r.module != rail {
                return Err(Answer::Invalid(
                    "the pointer's rail names another rail Module".into(),
                ));
            }
            if m.unit(&r.address) != Some(amount.unit) {
                return Err(Answer::Invalid(
                    "the rail does not carry the amount's unit".into(),
                ));
            }
            Ok(r.address.clone())
        }
        PaidTo::Vault { declared_by, entry } => {
            let (who, entries) = held.vault(declared_by).ok_or_else(|| {
                Answer::Unknown("the act declaring the vault it was paid to is not held".into())
            })?;
            if &who != payee {
                return Err(Answer::Invalid("paid to another identity's vault".into()));
            }
            let e = entries
                .get(*entry as usize)
                .ok_or_else(|| Answer::Invalid("the vault has no such entry".into()))?;
            if &e.rail_module != rail {
                return Err(Answer::Invalid(
                    "the vault entry names another rail Module".into(),
                ));
            }
            if e.unit != amount.unit || m.unit(&e.source) != Some(amount.unit) {
                return Err(Answer::Invalid(
                    "the vault entry is not for the amount's unit".into(),
                ));
            }
            Ok(e.source.clone())
        }
    }
}

/// Verify a receipt or claim (Finance rules 2 to 4; the payment cMIP,
/// "Verifying a receipt or claim").
///
/// The receipt's own signer is checked by the Finance MIP
/// ([`mor_core::finance::check_signer`]); a claim's payer is its signer.
pub fn verify(record: Record, held: &dyn Held, modules: &Modules) -> Verification {
    let (rail, proof, payee, amount, fulfils, payer) = match &record {
        Record::Receipt(r) => (&r.rail, &r.proof, &r.payee, &r.amount, &r.fulfils, r.payer),
        Record::Claim(c, signer) => (
            &c.rail,
            &c.proof,
            &c.payee,
            &c.amount,
            &c.fulfils,
            Some(*signer),
        ),
    };
    let out = |answer| Verification {
        answer,
        module: *rail,
        trusted: None,
    };
    let Some(m) = modules.get(rail) else {
        return out(Answer::Unknown(
            "a rail Module this verifier has not adopted".into(),
        ));
    };
    let Some(p) = Proof::decode(proof) else {
        return out(Answer::Invalid(
            "the proof is not in the payment cMIP's shape".into(),
        ));
    };
    let addr = match address(held, m, rail, payee, amount, &p.paid_to) {
        Ok(a) => a,
        Err(a) => return out(a),
    };
    let commitment = |payer| Commitment {
        rail: *rail,
        payee: *payee,
        amount: *amount,
        fulfils: *fulfils,
        payer,
        paid_to: p.paid_to,
        salt: p.salt,
    };
    let v = m.check(&RailInput {
        commitment: commitment(payer).hash(),
        amount,
        address: &addr,
        rail_proof: &p.rail,
    });
    // A claim on a payment its payer made anonymously: the rail proof shows
    // the money arrived, but not who paid. Who may claim it, and a refund
    // owed on it, is unsettled (flaw L1 of roadmap step 12): refused rather
    // than guessed.
    if let (Record::Claim(..), Answer::Invalid(_)) = (&record, &v.answer) {
        let anon = m.check(&RailInput {
            commitment: commitment(None).hash(),
            amount,
            address: &addr,
            rail_proof: &p.rail,
        });
        if anon.answer.is_valid() {
            return out(Answer::Unknown(
                "an anonymous payment claimed by an identity: on this rail the proof does not show who paid (flaw L1, unsettled)".into(),
            ));
        }
    }
    v
}
