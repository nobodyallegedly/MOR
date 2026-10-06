//! # mor-payment
//!
//! The payment cMIP, draft 2 (`cmips/cmip-payment-draft-2.md`), filling
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
use mor_core::finance::{self as fin, Amount, Claim, Obligation, PaidInto, PayeePointer, Payer, Receipt, VaultEntry};
use mor_core::hash::{sha256, tagged_hash, Hash};
use std::collections::BTreeMap;
use std::fmt;

/// The tag of the payment commitment.
pub const COMMITMENT_TAG: &str = "MOR/cmip/payment/commitment";

/// This cMIP's spec hash: a test value until its creator is named at step
/// 17. A rail Module implementing it names it in its field 5.
pub fn spec() -> Hash {
    sha256(b"payment cMIP, draft 2, test value until publication")
}

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
    /// The payer: an identity, an anonymous payer's bare key (F113), or
    /// `None` for an anonymous payment that committed no key.
    pub payer: Option<Payer>,
    pub paid_to: PaidTo,
    /// Chosen by the payer, so the commitment cannot be guessed.
    pub salt: [u8; 16],
    /// For a purchase, the claim it pays under (Finance receipt and claim
    /// field 9, F126); absent otherwise, and then not encoded, so a payment
    /// that is no purchase commits to exactly what it did before.
    pub purchase: Option<mor_core::finance::Purchase>,
}

impl Commitment {
    /// `commitment = [ rail, payee, amount, fulfils, payer / null, paid-to, salt, ? purchase ]`
    pub fn to_value(&self) -> Value {
        let mut v = vec![
            Value::Bytes(self.rail.to_vec()),
            Value::Bytes(self.payee.to_vec()),
            self.amount.to_value(),
            Value::Bytes(self.fulfils.to_vec()),
            self.payer
                .as_ref()
                .map(Payer::to_value)
                .unwrap_or(Value::Null),
            self.paid_to.to_value(),
            Value::Bytes(self.salt.to_vec()),
        ];
        if let Some(p) = &self.purchase {
            v.push(p.to_value());
        }
        Value::Array(v)
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
    /// The cMIP its specification's field 5 names ("implements",
    /// Production). Checked where an agreement names a payment cMIP (F115).
    fn implements(&self) -> Hash;
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
    /// An obligation act by id, valid and signed by its debtor (Finance
    /// F66), for rule 14 ([`pointer_in_force`]), with whether its agreement
    /// act cites the pointer it names (F133; the core library's
    /// [`fin::pointer_cited`] over the verifier's acts).
    fn obligation(&self, id: &Hash) -> Option<HeldObligation>;
    /// Every valid payee-pointer act held for this identity, as (act id,
    /// pointer): its chain and any fork of it (Finance rule 12).
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)>;
    /// The vault this identity's chain declares in force: its entries, or
    /// `None` where it declares none (Finance rule 14a).
    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>>;
}

/// An obligation as [`Held`] gives it for rule 14.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct HeldObligation {
    pub obligation: Obligation,
    /// F133: whether its agreement act (or, naming none, the obligation
    /// act itself) holds the pointer it names in its history; `None` where
    /// the verifier cannot tell.
    pub pointer_cited: Option<bool>,
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
#[derive(Clone)]
pub enum Record<'a> {
    Receipt(&'a Receipt),
    /// A claim and its signer: the payer, unless the claim carries an
    /// anonymous payer's key (field 8, F113).
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
///
/// The receipt or claim must be one the payee accepts (Finance rule 12a,
/// F115): the pointer rail or vault entry it was paid to, the payee's own,
/// names its rail Module. Where the payment falls under an agreement, pass
/// the payment cMIP it names as `under`: a rail Module implementing another
/// counts for nothing there.
pub fn verify_under(
    record: Record,
    held: &dyn Held,
    modules: &Modules,
    under: Option<&Hash>,
) -> Verification {
    let rail = match &record {
        Record::Receipt(r) => r.rail,
        Record::Claim(c, _) => c.rail,
    };
    if let (Some(cmip), Some(m)) = (under, modules.get(&rail)) {
        if &m.implements() != cmip {
            return Verification {
                answer: Answer::Invalid(
                    "the rail Module implements another payment cMIP than the agreement names (Finance rule 12a, F115)"
                        .into(),
                ),
                module: rail,
                trusted: None,
            };
        }
    }
    verify(record, held, modules)
}

/// Verify a receipt or claim outside any agreement (a tip following a payee
/// pointer): [`verify_under`] with no payment cMIP named.
pub fn verify(record: Record, held: &dyn Held, modules: &Modules) -> Verification {
    let (rail, proof, payee, amount, fulfils, payer, purchase) = match &record {
        Record::Receipt(r) => (&r.rail, &r.proof, &r.payee, &r.amount, &r.fulfils, r.payer.clone(), r.purchase.clone()),
        Record::Claim(c, signer) => (
            &c.rail,
            &c.proof,
            &c.payee,
            &c.amount,
            &c.fulfils,
            Some(c.payer(signer)),
            c.purchase.clone(),
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
    let commitment = Commitment {
        rail: *rail,
        payee: *payee,
        amount: *amount,
        fulfils: *fulfils,
        payer,
        paid_to: p.paid_to,
        salt: p.salt,
        purchase,
    };
    // A claim's anonymous key must have signed it (Finance rule 1, F113);
    // a claim signed by anyone else as payer recomputes another commitment,
    // which the rail's rule refuses: a node that learnt the proof on the
    // route cannot claim the payment, nor its refund.
    if let Record::Claim(c, signer) = &record {
        if mor_core::finance::check_signer(&mor_core::finance::Payload::Claim((*c).clone()), signer).is_err() {
            return out(Answer::Invalid(
                "the anonymous payer's key did not sign this claim (Finance rule 1, F113)".into(),
            ));
        }
    }
    m.check(&RailInput {
        commitment: commitment.hash(),
        amount,
        address: &addr,
        rail_proof: &p.rail,
    })
}

/// Where a receipt or claim was paid, as its proof shows it; `None` where
/// the proof is not in this cMIP's shape.
pub fn paid_at(record: &Record) -> Option<fin::PaidAt> {
    let proof = match record {
        Record::Receipt(r) => &r.proof,
        Record::Claim(c, _) => &c.proof,
    };
    Some(match Proof::decode(proof)?.paid_to {
        PaidTo::Flow { pointer, .. } => fin::PaidAt::Flow(pointer),
        PaidTo::Vault { declared_by, .. } => fin::PaidAt::Vault(declared_by),
    })
}

/// Everything judged beside the verification answer ("What verification
/// does not decide"): whether the pointer it was paid to was in force for
/// it (Finance rules 12 and 14, [`pointer_in_force`]), and whether it
/// followed the vault (rules 14a and 15, [`followed_vault`]). Valid only
/// where both are; otherwise the first answer that is not.
pub fn beside(record: Record, held: &dyn Held) -> Answer {
    match pointer_in_force(record.clone(), held) {
        Answer::Valid => followed_vault(record, held),
        a => a,
    }
}

/// Finance rules 14a and 15, judged beside the verification answer for a
/// payment received: a payment to the flow counts as paid to the flow only
/// where the payee's vault in force lets it go there (an entry for its
/// unit, and no more than that unit's smallest limit, F114); a payment
/// that did not follow the published vault is not protected (rule 15). A
/// payment to the vault, or to an identity that declares no vault, is
/// valid here. *A thief who redirects the flow pointer cannot take a large
/// payment through it, nor one in a unit the vault does not cover.*
pub fn followed_vault(record: Record, held: &dyn Held) -> Answer {
    let (proof, payee, amount) = match &record {
        Record::Receipt(r) => (&r.proof, &r.payee, &r.amount),
        Record::Claim(c, _) => (&c.proof, &c.payee, &c.amount),
    };
    let Some(p) = Proof::decode(proof) else {
        return Answer::Invalid("the proof is not in the payment cMIP's shape".into());
    };
    if matches!(p.paid_to, PaidTo::Vault { .. }) {
        return Answer::Valid;
    }
    if fin::flow_followed_vault(held.vault_in_force(payee).as_deref(), amount) {
        Answer::Valid
    } else {
        Answer::Invalid(
            "paid to the flow, but the payee's vault sends this payment to the vault: above the unit's limit, or in a unit the vault does not cover (Finance rules 14a and 15)"
                .into(),
        )
    }
}

/// Finance rules 12 and 14, judged beside the verification answer ("What
/// verification does not decide"): whether the flow pointer a payment was
/// paid to was in force for what it fulfils. A payment to the vault always
/// is. A flow pointer counts only on the payee's unbroken, unforked chain
/// (rule 12): one forked by a second act naming the same predecessor counts
/// only up to the fork, so a thief's pointer of the same version as the
/// owner's cannot collect what names the owner's. A payment to the flow is only where what it fulfils names that flow
/// pointer's version or a later one: an obligation (Finance type 1) by its
/// field 3, a version its agreement act cites (F133), a tip by the payee
/// pointer it follows. *A thief who changes the
/// flow pointer cannot collect, through the new flow, an obligation that
/// names an earlier version: paid there, the payment is refused here; paid
/// to the vault, it counts.*
///
/// Valid where rule 14 lets the payment count; invalid where it does not;
/// unknown where the acts it needs are not held, or what the payment
/// fulfils (an agreement or an offer) names no flow pointer this verifier
/// can read. An obligation owed to someone other than this hop's payee is
/// not this hop's to judge, and answers valid. The rail's own answer is
/// [`verify`]'s.
pub fn pointer_in_force(record: Record, held: &dyn Held) -> Answer {
    let (proof, payee, fulfils) = match &record {
        Record::Receipt(r) => (&r.proof, &r.payee, &r.fulfils),
        Record::Claim(c, _) => (&c.proof, &c.payee, &c.fulfils),
    };
    let Some(p) = Proof::decode(proof) else {
        return Answer::Invalid("the proof is not in the payment cMIP's shape".into());
    };
    let into = match p.paid_to {
        PaidTo::Vault { .. } => PaidInto::Vault,
        PaidTo::Flow { pointer, .. } => match held.pointer(&pointer) {
            Some(q) if &q.payee == payee => {
                if !fin::pointer_counts(&held.pointers_of(payee), &pointer) {
                    return Answer::Invalid(
                        "the flow pointer it was paid to is not on the payee's unbroken, unforked chain: a forked chain counts only up to the fork (Finance rule 12)"
                            .into(),
                    );
                }
                PaidInto::Flow(q.version)
            }
            Some(_) => return Answer::Invalid("paid to another identity's pointer".into()),
            None => return Answer::Unknown("the payee pointer it was paid to is not held".into()),
        },
    };
    if into == PaidInto::Vault {
        return Answer::Valid;
    }
    // The flow pointer what the payment fulfils names.
    let named = match held.obligation(fulfils) {
        Some(o) if &o.obligation.creditor != payee => return Answer::Valid,
        // F133: a version its agreement act never saw does not count for it.
        Some(HeldObligation { pointer_cited: Some(false), .. }) => {
            return Answer::Invalid(
                "the obligation names a flow pointer its agreement act (or, with none, the obligation itself) does not cite: it counts only if paid to the vault (Finance rule 14, F133)"
                    .into(),
            )
        }
        Some(HeldObligation { pointer_cited: None, .. }) => {
            return Answer::Unknown(
                "whether the obligation's agreement act (or, with none, the obligation itself) cites the pointer it names is not known from the acts held (Finance rule 14, F133)"
                    .into(),
            )
        }
        Some(o) => o.obligation.pointer,
        None => match held.pointer(fulfils) {
            Some(_) => *fulfils,
            None => {
                return Answer::Unknown(
                    "what it fulfils names no flow pointer this verifier holds (Finance rule 14)".into(),
                )
            }
        },
    };
    let version = match held.pointer(&named) {
        Some(q) if &q.payee == payee => q.version,
        Some(_) => {
            return Answer::Invalid(
                "the obligation names another identity's payee pointer, not its creditor's".into(),
            )
        }
        None => {
            return Answer::Unknown("the flow pointer the obligation names is not held".into())
        }
    };
    if fin::counts_toward(version, into) {
        Answer::Valid
    } else {
        Answer::Invalid(
            "it arose under an earlier flow pointer than the one it was paid to: it counts only if paid to the vault (Finance rule 14)"
                .into(),
        )
    }
}
