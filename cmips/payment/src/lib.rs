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
use std::collections::{BTreeMap, BTreeSet};
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

/// Whether a rail Module is a request rail or a push rail (F128, W4; F140
/// item 1): a rail Module declares it, and a client reads it from the
/// Module, never sets it by hand. *Format open: the Production
/// specification format has no field for it yet; until it has, each
/// Module's code states what its text declares.*
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RailKind {
    /// The payee's side commits to each payment before it is made, and so
    /// to the claim a purchase names.
    Request,
    /// The payer pays an address with no request; each holder settles the
    /// claim on its own chain (Finance rule 10c).
    Push,
}

/// A rail Module, as the payment cMIP needs it.
pub trait RailModule {
    /// Its spec hash: what receipt and claim field 0, pointer rails and
    /// vault entries name.
    fn spec(&self) -> Hash;
    /// The cMIP its specification's field 5 names ("implements",
    /// Production). Checked where an agreement names a payment cMIP (F115).
    fn implements(&self) -> Hash;
    /// Whether it is a request rail or a push rail, as its specification
    /// declares.
    fn kind(&self) -> RailKind;
    /// The unit a rail address or vault source carries, if the address is
    /// one this Module reads.
    fn unit(&self, address: &[u8]) -> Option<Hash>;
    /// What "the same payment" is on this rail (F200): the payment a rail
    /// proof shows, the same bytes in every proof of that payment, whatever
    /// else differs between them (on Lightning the payment hash; on-chain
    /// the output the transaction created). `None` where the proof shows no
    /// payment yet (a request only). Finance's rules that tell payments
    /// apart (8a, 10, 15) read it through [`payment`], never through the
    /// proof's bytes.
    fn payment(&self, rail_proof: &[u8]) -> Option<Vec<u8>>;
    /// The Module's verification rule.
    fn check(&self, input: &RailInput) -> Verification;
}

/// What the verifier holds: valid acts, already checked as acts (signature,
/// signer, standing on the payee's identity chain). A payment binds, so
/// "valid" is the standing for binding use (the core library's
/// `Verifier::binding_status`): an act whose standing rests on the
/// verifier's own failed attempts to reach homes is not given, and the
/// answer that needs it is unknown (Identity, the sentence after rule 17,
/// F153).
pub trait Held {
    /// A payee-pointer act by id, valid now.
    fn pointer(&self, id: &Hash) -> Option<PayeePointer>;
    /// A genesis or rotation by id, that counts on its identity's chain and
    /// declared a vault: its identity and the entries.
    fn vault(&self, declared_by: &Hash) -> Option<(Hash, Vec<VaultEntry>)>;
    /// An obligation act by id, valid and signed by its debtor (Finance
    /// F66).
    fn obligation(&self, id: &Hash) -> Option<Obligation>;
    /// Finance rules 14 and 15 with F145 and F155: the payee's pointer acts
    /// that the payee's own act holds through its citations, for what a
    /// payment follows: an obligation owed to `payee` (the payee's
    /// signature act on its agreement, or its offer; with neither, the
    /// payee's acts acknowledging it), an agreement (the payee's signature
    /// act on it) or an offer (the payee's own). Which acts those are is
    /// Law's: a Law client gives the core library's answer
    /// (`mor_core::law::LawView::pointer_holding`). `None` where `fulfils`
    /// is none of these, or this verifier cannot read it (a Finance-only
    /// client): the payment to the flow is then unknown, never valid.
    fn holding(&self, fulfils: &Hash, payee: &Hash) -> Option<fin::Holding>;
    /// Every valid payee-pointer act held for this identity, as (act id,
    /// pointer): its chain and any fork of it (Finance rule 12).
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)>;
    /// Finance rule 15: a payee-pointer act that a rotation of its signer
    /// invalidated (voided, or voided and shown as disputed), and that
    /// rotation (`mor_core::chain::Verifier::judged_by`).
    fn voided_pointer(&self, id: &Hash) -> Option<(PayeePointer, Hash)>;
    /// The vault the payee's chain declares in force: its entries, or
    /// `None` where it declares none (Finance rule 14a: the vault applies
    /// as the chain declares it, F169; F160 withdrawn).
    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>>;
    /// Finance rules 12 to 15 over the payee's whole chain, for a payment
    /// that does not follow the chain as it stands now: whether it counts as
    /// made, because it followed the chain as published before and every
    /// anchored lock change since is answered by the payee's own receipt or
    /// a payer's claim anchored by its point (theft: anchor or bear the
    /// loss; F169, F176 to F181). A Law client gives the core library's
    /// answer (`mor_core::law::LawView::payment_counts`). `None` where this
    /// verifier cannot read it (a Finance-only client).
    fn payment_counts(&self, payee: &Hash, paid_at: &fin::PaidAt, amount: &Amount, proof: &[u8], fulfils: &Hash) -> Option<bool>;
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
    /// The adopted rail Modules that declare themselves push rails: what a
    /// Law client hands the core's Law view (`LawView::push_rails`), read
    /// from the Modules rather than set by hand (F140 item 1).
    pub fn push_rails(&self) -> BTreeSet<Hash> {
        self.by_spec.iter().filter(|(_, m)| m.kind() == RailKind::Push).map(|(h, _)| *h).collect()
    }
}

/// A receipt or a claim, as signed.
#[derive(Clone)]
pub enum Record<'a> {
    Receipt(&'a Receipt),
    /// A claim, its signer, and its act's own `objects`, `acks` and `refs`:
    /// the payer is the signer, unless the claim carries an anonymous
    /// payer's key (field 8, F113), which signs the claim with those
    /// citations (F147).
    Claim(&'a Claim, Hash, &'a fin::Citations),
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
            // A pointer a later rotation invalidated is still the address
            // the payee's key signed: what the payment counts as is rule
            // 15's, judged beside ([`pointer_in_force`]).
            let p = held
                .pointer(pointer)
                .or_else(|| held.voided_pointer(pointer).map(|(p, _)| p))
                .ok_or_else(|| {
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
        Record::Claim(c, ..) => c.rail,
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
        Record::Claim(c, signer, _) => (
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
    if let Record::Claim(c, signer, cited) = &record {
        if fin::check_signer(&fin::Payload::Claim((*c).clone()), signer, cited).is_err() {
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

/// The payment a receipt or claim is (F200), as its rail Module says:
/// `[rail, payment]` in deterministic CBOR, the rail Module's spec hash and
/// what the Module gives ([`RailModule::payment`]). What a Law client hands
/// the core's Law view (`LawView::payments`), keyed by the act's proof, so
/// that two proofs of one payment count once. `None` where the Module is
/// not adopted, the proof is not in this cMIP's shape, or it shows no
/// payment yet.
pub fn payment(record: &Record, modules: &Modules) -> Option<Vec<u8>> {
    let (rail, proof) = match record {
        Record::Receipt(r) => (&r.rail, &r.proof),
        Record::Claim(c, ..) => (&c.rail, &c.proof),
    };
    let id = modules.get(rail)?.payment(&Proof::decode(proof)?.rail)?;
    Some(cbor::encode(&Value::Array(vec![Value::Bytes(rail.to_vec()), Value::Bytes(id)])))
}

/// Where a receipt or claim was paid, as its proof shows it; `None` where
/// the proof is not in this cMIP's shape.
pub fn paid_at(record: &Record) -> Option<fin::PaidAt> {
    let proof = match record {
        Record::Receipt(r) => &r.proof,
        Record::Claim(c, ..) => &c.proof,
    };
    Some(match Proof::decode(proof)?.paid_to {
        PaidTo::Flow { pointer, .. } => fin::PaidAt::Flow(pointer),
        PaidTo::Vault { declared_by, entry } => fin::PaidAt::VaultEntry(declared_by, entry),
    })
}

/// Everything judged beside the verification answer ("What verification
/// does not decide"): whether the payment follows the payee's chain as it
/// stands now (Finance rules 12 and 14, [`pointer_in_force`]; rule 14a,
/// [`followed_vault`]), and, where it does not, rule 15: whether it counts
/// as made all the same, because it followed the chain as published before
/// and no anchored lock change since is left unanswered
/// ([`Held::payment_counts`]). Valid where it counts; otherwise the first
/// answer, for the chain now, that is not valid, or unknown where rule 15
/// cannot be read.
pub fn beside(record: Record, held: &dyn Held) -> Answer {
    let now = match pointer_in_force(record.clone(), held) {
        Answer::Valid => followed_vault(record.clone(), held),
        a => a,
    };
    if now == Answer::Valid {
        return now;
    }
    let (proof, payee, amount, fulfils) = match &record {
        Record::Receipt(r) => (&r.proof, &r.payee, &r.amount, &r.fulfils),
        Record::Claim(c, ..) => (&c.proof, &c.payee, &c.amount, &c.fulfils),
    };
    if held.obligation(fulfils).is_some_and(|o| &o.creditor != payee) {
        return Answer::Valid;
    }
    let Some(at) = paid_at(&record) else { return now };
    match held.payment_counts(payee, &at, amount, proof, fulfils) {
        Some(true) => Answer::Valid,
        Some(false) => match now {
            Answer::Invalid(w) => Answer::Invalid(format!(
                "{w}; nor does it count under Finance rule 15: it followed no earlier state of the payee's chain, or an anchored lock change affects it with no receipt of the payee's and no payer's claim anchored by its point (F169, F176 to F181)"
            )),
            a => a,
        },
        None => match now {
            Answer::Invalid(w) => Answer::Unknown(format!(
                "{w}, as the payee's chain stands now; whether it counts under Finance rule 15 (theft: anchor or bear the loss) is unknown to this verifier"
            )),
            a => a,
        },
    }
}

/// Finance rule 14a, judged beside the verification answer for a payment
/// received, on the payee's chain as it stands now: a payment to the flow
/// counts as paid to the flow only where the vault in force lets it go
/// there (an entry for its unit, and no more than that unit's smallest
/// limit, F114). The vault applies as the chain declares it, so a change
/// applies at once (F169; F160 withdrawn); a payment that followed an
/// earlier vault is rule 15's ([`beside`]). A payment to the vault, or to
/// an identity that declares no vault, is valid here. *A thief who
/// redirects the flow pointer cannot take a large payment through it, nor
/// one in a unit the vault does not cover.*
pub fn followed_vault(record: Record, held: &dyn Held) -> Answer {
    let (proof, payee, amount) = match &record {
        Record::Receipt(r) => (&r.proof, &r.payee, &r.amount),
        Record::Claim(c, ..) => (&c.proof, &c.payee, &c.amount),
    };
    let Some(p) = Proof::decode(proof) else {
        return Answer::Invalid("the proof is not in the payment cMIP's shape".into());
    };
    match p.paid_to {
        PaidTo::Vault { declared_by, entry } => {
            // The entry paid to must still be in the vault in force: one a
            // rotation replaced is rule 15's.
            let Some((_, declared)) = held.vault(&declared_by) else {
                return Answer::Unknown("the act declaring the vault it was paid to is not held".into());
            };
            let Some(e) = declared.get(entry as usize) else {
                return Answer::Invalid("the vault has no such entry".into());
            };
            let now = held.vault_in_force(payee).unwrap_or_default();
            if now.iter().any(|x| x.unit == e.unit && x.rail_module == e.rail_module && x.source == e.source) {
                Answer::Valid
            } else {
                Answer::Invalid("paid to a vault entry the payee's chain no longer declares: a rotation replaced it (Finance rules 14a and 15)".into())
            }
        }
        PaidTo::Flow { .. } => {
            if fin::flow_followed_vault(held.vault_in_force(payee).as_deref(), amount) {
                Answer::Valid
            } else {
                Answer::Invalid(
                    "paid to the flow, but the payee's vault sends this payment to the vault: above the unit's limit, or in a unit the vault does not cover (Finance rule 14a)"
                        .into(),
                )
            }
        }
    }
}

/// Finance rules 12 and 14, judged beside the verification answer
/// ("What verification does not decide"), on the payee's chain as it
/// stands now: whether the flow pointer a payment was paid to is in force
/// for what it fulfils. A payment to the vault always is.
///
/// - **Rule 12.** A flow pointer counts only on the payee's unbroken,
///   unforked chain: one forked by a second act naming the same
///   predecessor counts only up to the fork, so a thief's pointer of the
///   same version as the owner's cannot collect what the owner's would.
/// - **Rule 14, F145, F155.** A payment to the flow counts only where the
///   version that counts for what it fulfils is that version or a later
///   one: for a tip, the payee pointer it follows; for an obligation, an
///   agreement or an offer, the latest of the payee's chain that the
///   payee's own act holds ([`Held::holding`]; the version an obligation
///   names in field 3 is informative only). Where no act of the payee's
///   holds one, as for an IOU the payee has not acknowledged, it counts
///   only if paid to the vault. *A debt re-signed, or terms drafted, to
///   name a thief's newer pointer gain nothing: the pointer is judged by
///   the act of the one it pays.*
/// - **A pointer a rotation voided** is in force for nothing now: whether
///   a payment to it counts is rule 15's ([`beside`]).
///
/// Valid where these rules let the payment count; invalid where they do
/// not; unknown where the acts they need are not held, or what the payment
/// fulfils is nothing this verifier can read (a Finance-only client reads
/// no agreement). An obligation owed to someone other than this hop's
/// payee is not this hop's to judge, and answers valid. The rail's own
/// answer is [`verify`]'s; the vault's limits are [`followed_vault`]'s.
pub fn pointer_in_force(record: Record, held: &dyn Held) -> Answer {
    let (proof, payee, fulfils) = match &record {
        Record::Receipt(r) => (&r.proof, &r.payee, &r.fulfils),
        Record::Claim(c, ..) => (&c.proof, &c.payee, &c.fulfils),
    };
    let Some(p) = Proof::decode(proof) else {
        return Answer::Invalid("the proof is not in the payment cMIP's shape".into());
    };
    let PaidTo::Flow { pointer, .. } = p.paid_to else {
        return Answer::Valid;
    };
    let q = match held.pointer(&pointer) {
        Some(q) => q,
        None => match held.voided_pointer(&pointer) {
            Some(_) => {
                return Answer::Invalid(
                    "paid to a payee pointer a rotation of the payee voided: in force for nothing now (Finance rules 12 and 15)".into(),
                )
            }
            None => return Answer::Unknown("the payee pointer it was paid to is not held".into()),
        },
    };
    if &q.payee != payee {
        return Answer::Invalid("paid to another identity's pointer".into());
    }
    let chain = held.pointers_of(payee);
    if !fin::pointer_counts(&chain, &pointer) {
        return Answer::Invalid(
            "the flow pointer it was paid to is not on the payee's unbroken, unforked chain: a forked chain counts only up to the fork (Finance rule 12)"
                .into(),
        );
    }
    let tip = held
        .pointer(fulfils)
        .or_else(|| held.voided_pointer(fulfils).map(|(p, _)| p));
    let rule_14 = match (held.obligation(fulfils), tip) {
        (Some(o), _) if &o.creditor != payee => return Answer::Valid,
        // A tip: the payee pointer it follows, the payee's own act.
        (None, Some(t)) => {
            if &t.payee != payee {
                return Answer::Invalid("it follows another identity's payee pointer".into());
            }
            if fin::counts_toward(t.version, PaidInto::Flow(q.version)) {
                fin::Rule14::Counts
            } else {
                fin::Rule14::Vault(
                    "it follows an earlier flow pointer than the one it was paid to: it counts only if paid to the vault (Finance rule 14)",
                )
            }
        }
        // An obligation, an agreement or an offer: the payee's own act.
        _ => match held.holding(fulfils, payee) {
            Some(h) => fin::rule_14(&h, &chain, q.version),
            None => {
                return Answer::Unknown(
                    "what it fulfils is no obligation, agreement or offer this verifier can read the payee's own acts on (Finance rules 14 and 15, F145)"
                        .into(),
                )
            }
        },
    };
    match rule_14 {
        fin::Rule14::Counts => Answer::Valid,
        fin::Rule14::Vault(w) => Answer::Invalid(w.into()),
        fin::Rule14::Unknown(w) => Answer::Unknown(w.into()),
    }
}
