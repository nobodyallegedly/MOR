//! The Money layer for the TypeScript clients (Damgar, F338): the Money
//! MIR's act formats, the payment cMIP's commitment and proof, the Lightning
//! and on-chain rail Modules' addresses and proofs, and the verification of
//! a receipt or claim from the acts a verifier holds, by the rail Modules a
//! person accepts, and no other.
//!
//! As everywhere in these bindings, the core library and the Modules' own
//! reference implementations decide; the client only fetches, stores and
//! shows. Hashes are hex strings; bytes are `Uint8Array`s.

use super::{arr, err, from_js, hx, to_js, unhex, Verifier, R};
use mor_core::cbor::{self, Value};
use mor_core::chain::Status;
use mor_core::hash::Hash;
use mor_core::identity::Payload as Id;
use mor_core::money::{self, Amount, Citations, Claim, Obligation, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry};
use mor_lightning::bolt11::{self, Network as LnNetwork};
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::chain::HeaderChain;
use mor_onchain::{Block, Network, Onchain, OnchainAddress, OnchainProof, Paid};
use mor_payment::{Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use wasm_bindgen::prelude::*;

// ---------------------------------------------------------------- the specifications

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SpecOut {
    hash: String,
    #[serde(with = "serde_bytes")]
    content: Option<Vec<u8>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SpecsOut {
    payment: String,
    lightning: SpecOut,
    onchain: SpecOut,
    /// The four units of `modules/units-bitcoin-draft-1.md`, by network.
    units: UnitsOut,
    split: String,
    conversion: String,
    anchoring: String,
    bitcoin_clock: String,
}

#[derive(Serialize)]
struct UnitsOut {
    bitcoin: String,
    testnet: String,
    signet: String,
    regtest: String,
}

/// The spec hashes of the Money layer's cMIPs and Modules as the reference
/// implementations name them (test values until step 17), with the two rail
/// Modules' published content (Development draft 10, Part three), from
/// which their kind and binding are read (F301).
#[wasm_bindgen(js_name = moneySpecs)]
pub fn money_specs() -> R<JsValue> {
    to_js(&SpecsOut {
        payment: hx(&mor_payment::spec()),
        lightning: SpecOut { hash: hx(&mor_lightning::spec()), content: Some(mor_lightning::specification()) },
        onchain: SpecOut { hash: hx(&mor_onchain::spec()), content: Some(mor_onchain::specification()) },
        units: UnitsOut {
            bitcoin: hx(&mor_onchain::unit(Network::Mainnet)),
            testnet: hx(&mor_onchain::unit(Network::Testnet)),
            signet: hx(&mor_onchain::unit(Network::Signet)),
            regtest: hx(&mor_onchain::unit(Network::Regtest)),
        },
        split: hx(&mor_split::spec()),
        conversion: hx(&mor_conversion::spec()),
        anchoring: hx(&mor_anchoring::spec()),
        bitcoin_clock: hx(&mor_onchain::clock::spec()),
    })
}

// ---------------------------------------------------------------- the Money MIR's acts

#[derive(Deserialize, Serialize, Clone)]
struct AmountIn {
    unit: String,
    value: u64,
}

impl AmountIn {
    fn core(&self) -> R<Amount> {
        Ok(Amount { unit: unhex(&self.unit)?, value: self.value })
    }
    fn of(a: &Amount) -> Self {
        AmountIn { unit: hx(&a.unit), value: a.value }
    }
}

#[derive(Deserialize, Serialize)]
struct RailIn {
    module: String,
    address: ByteBuf,
}

impl RailIn {
    fn core(&self) -> R<Rail> {
        Ok(Rail { module: unhex(&self.module)?, address: self.address.to_vec() })
    }
    fn of(r: &Rail) -> Self {
        RailIn { module: hx(&r.module), address: ByteBuf::from(r.address.clone()) }
    }
}

/// A Money act's payload, as the page and the client name its fields.
#[derive(Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum MoneyIn {
    #[serde(rename_all = "camelCase")]
    Pointer { payee: String, version: u64, previous: Option<String>, rails: Vec<RailIn> },
    #[serde(rename_all = "camelCase")]
    Obligation { debtor: String, creditor: String, amount: AmountIn, pointer: String, agreement: Option<String> },
    /// `payer` an identity's hex hash; a bare key payer is not made here.
    #[serde(rename_all = "camelCase")]
    Receipt { rail: String, proof: ByteBuf, payer: Option<String>, payee: String, amount: AmountIn, fulfils: String },
    #[serde(rename_all = "camelCase")]
    Claim { rail: String, proof: ByteBuf, payee: String, amount: AmountIn, fulfils: String, disagrees: Option<String>, refund: Option<RailIn> },
    #[serde(rename_all = "camelCase")]
    Release { obligation: String },
}

fn opt(h: &Option<String>) -> R<Option<Hash>> {
    h.as_deref().map(unhex).transpose()
}

impl MoneyIn {
    fn core(&self) -> R<Payload> {
        Ok(match self {
            MoneyIn::Pointer { payee, version, previous, rails } => Payload::PayeePointer(PayeePointer {
                payee: unhex(payee)?,
                version: *version,
                previous: opt(previous)?,
                rails: rails.iter().map(RailIn::core).collect::<R<_>>()?,
            }),
            MoneyIn::Obligation { debtor, creditor, amount, pointer, agreement } => Payload::Obligation(Obligation {
                debtor: unhex(debtor)?,
                creditor: unhex(creditor)?,
                amount: amount.core()?,
                pointer: unhex(pointer)?,
                agreement: opt(agreement)?,
            }),
            MoneyIn::Receipt { rail, proof, payer, payee, amount, fulfils } => Payload::Receipt(Receipt {
                rail: unhex(rail)?,
                proof: proof.to_vec(),
                payer: opt(payer)?.map(Payer::Identity),
                payee: unhex(payee)?,
                amount: amount.core()?,
                fulfils: unhex(fulfils)?,
                previous: None,
                forward: None,
                batch: None,
                purchase: None,
            }),
            MoneyIn::Claim { rail, proof, payee, amount, fulfils, disagrees, refund } => Payload::Claim(Claim {
                rail: unhex(rail)?,
                proof: proof.to_vec(),
                payee: unhex(payee)?,
                amount: amount.core()?,
                fulfils: unhex(fulfils)?,
                disagrees: opt(disagrees)?,
                referral: None,
                refund: refund.as_ref().map(RailIn::core).transpose()?,
                anonymous: None,
                purchase: None,
                previous: None,
            }),
            MoneyIn::Release { obligation } => Payload::Release(money::Release { obligation: unhex(obligation)?, against: vec![] }),
        })
    }

    /// What a client is shown of a payload; a field this binding does not
    /// show (a forward, a batch, a purchase, a referral, an anonymous key)
    /// is named in `more`, so nothing is shown as absent that is there.
    fn of(p: &Payload) -> (Self, Vec<&'static str>) {
        let mut more = vec![];
        let v = match p {
            Payload::PayeePointer(p) => MoneyIn::Pointer {
                payee: hx(&p.payee),
                version: p.version,
                previous: p.previous.as_ref().map(hx),
                rails: p.rails.iter().map(RailIn::of).collect(),
            },
            Payload::Obligation(o) => MoneyIn::Obligation {
                debtor: hx(&o.debtor),
                creditor: hx(&o.creditor),
                amount: AmountIn::of(&o.amount),
                pointer: hx(&o.pointer),
                agreement: o.agreement.as_ref().map(hx),
            },
            Payload::Receipt(r) => {
                if r.previous.is_some() {
                    more.push("a previous hop");
                }
                if r.forward.is_some() {
                    more.push("a forward");
                }
                if r.batch.is_some() {
                    more.push("a batch");
                }
                if r.purchase.is_some() {
                    more.push("a purchase (an Agreements claim)");
                }
                let payer = match &r.payer {
                    Some(Payer::Identity(h)) => Some(hx(h)),
                    Some(Payer::Key(_)) => {
                        more.push("an anonymous payer's key");
                        None
                    }
                    None => None,
                };
                MoneyIn::Receipt {
                    rail: hx(&r.rail),
                    proof: ByteBuf::from(r.proof.clone()),
                    payer,
                    payee: hx(&r.payee),
                    amount: AmountIn::of(&r.amount),
                    fulfils: hx(&r.fulfils),
                }
            }
            Payload::Claim(c) => {
                if c.referral.is_some() {
                    more.push("a referral");
                }
                if c.anonymous.is_some() {
                    more.push("an anonymous payer's key");
                }
                if c.purchase.is_some() {
                    more.push("a purchase (an Agreements claim)");
                }
                if c.previous.is_some() {
                    more.push("a previous hop");
                }
                MoneyIn::Claim {
                    rail: hx(&c.rail),
                    proof: ByteBuf::from(c.proof.clone()),
                    payee: hx(&c.payee),
                    amount: AmountIn::of(&c.amount),
                    fulfils: hx(&c.fulfils),
                    disagrees: c.disagrees.as_ref().map(hx),
                    refund: c.refund.as_ref().map(RailIn::of),
                }
            }
            Payload::Release(r) => {
                if !r.against.is_empty() {
                    more.push("what the creditor took instead");
                }
                MoneyIn::Release { obligation: hx(&r.obligation) }
            }
        };
        (v, more)
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MadeOut {
    #[serde(rename = "type")]
    type_: u64,
    #[serde(with = "serde_bytes")]
    payload: Vec<u8>,
}

/// A Money act's payload, encoded by the core and decoded back strictly
/// (Money, "Act formats"): `{ type, payload }`, to sign under the Money
/// MIR's spec hash. Throws where the core refuses it.
#[wasm_bindgen(js_name = moneyPayload)]
pub fn money_payload(input: JsValue) -> R<JsValue> {
    let p = from_js::<MoneyIn>(input)?.core()?;
    let bytes = cbor::encode(&Value::Map(p.to_map()));
    let back = super::payload_of(&bytes)?;
    Payload::decode(p.type_(), &back).map_err(err)?;
    to_js(&MadeOut { type_: p.type_(), payload: bytes })
}

#[derive(Serialize)]
struct ReadOut {
    act: MoneyIn,
    more: Vec<&'static str>,
}

/// A Money act's payload read strictly by its type: `{ act, more }`, `more`
/// naming fields present that `act` does not show. Throws where it is no
/// Money act of that type.
#[wasm_bindgen(js_name = moneyRead)]
pub fn money_read(type_: u32, payload: &[u8]) -> R<JsValue> {
    let p = Payload::decode(type_ as u64, &super::payload_of(payload)?).map_err(err)?;
    let (act, more) = MoneyIn::of(&p);
    to_js(&ReadOut { act, more })
}

/// A vault entry, as a person is shown it.
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VaultOut {
    unit: String,
    rail_module: String,
    source: ByteBuf,
    limit: u64,
}

/// The vault a genesis or rotation's declarations slot sets: `undefined`
/// where it says nothing of the vault, `null` where it removes it, else
/// its entries (Money, "The vault").
#[wasm_bindgen(js_name = vaultOf)]
pub fn vault_of(money_spec: &str, act: &[u8]) -> R<JsValue> {
    let a = mor_core::act::Act::decode(act).map_err(err)?;
    let Ok(inside) = a.open(None) else { return Ok(JsValue::UNDEFINED) };
    let decls = match Id::decode(inside.type_, &inside.payload) {
        Ok(Id::Genesis(g)) => g.declarations,
        Ok(Id::Rotation(r)) => r.declarations,
        _ => None,
    };
    match money::vault_in(&unhex(money_spec)?, &decls.unwrap_or_default()).map_err(err)? {
        None => Ok(JsValue::UNDEFINED),
        Some(None) => Ok(JsValue::NULL),
        Some(Some(v)) => to_js(&v.iter().map(|e| VaultOut { unit: hx(&e.unit), rail_module: hx(&e.rail_module), source: ByteBuf::from(e.source.clone()), limit: e.limit }).collect::<Vec<_>>()),
    }
}

/// A vault declaration for a genesis or rotation's declarations slot, as
/// the genesis client passes declarations: `{ spec, kind, cbor }`; with no
/// entries (null), `{ spec, kind }`, which removes the vault (Money, "The
/// vault": a null value for kind 0 removes it).
#[wasm_bindgen(js_name = vaultDeclaration)]
pub fn vault_declaration(money_spec: &str, entries: JsValue) -> R<JsValue> {
    #[derive(Serialize)]
    struct Out {
        spec: String,
        kind: u64,
        #[serde(with = "serde_bytes", skip_serializing_if = "Option::is_none")]
        cbor: Option<Vec<u8>>,
    }
    let es: Option<Vec<VaultOut>> = from_js(entries)?;
    let value = match es {
        None => None,
        Some(es) => {
            let core = es
                .iter()
                .map(|e| Ok(VaultEntry { unit: unhex(&e.unit)?, rail_module: unhex(&e.rail_module)?, source: e.source.to_vec(), limit: e.limit }))
                .collect::<R<Vec<_>>>()?;
            if core.is_empty() {
                return Err(err("a vault has at least one entry; to remove it, give none (null)"));
            }
            Some(cbor::encode(&Value::Array(core.iter().map(VaultEntry::to_value).collect())))
        }
    };
    to_js(&Out { spec: money_spec.to_string(), kind: money::VAULT_KIND, cbor: value })
}

/// Money rule 3 (was 14a) on a vault in force: where a single payment of
/// this amount may go. `{ to: "flow" | "vault" | "nowhere", why }`.
#[wasm_bindgen(js_name = moneyDestination)]
pub fn money_destination(vault: JsValue, amount: JsValue) -> R<JsValue> {
    #[derive(Serialize)]
    struct Out {
        to: &'static str,
        why: String,
    }
    let es: Option<Vec<VaultOut>> = from_js(vault)?;
    let a = from_js::<AmountIn>(amount)?.core()?;
    let core = es
        .map(|es| es.iter().map(|e| Ok(VaultEntry { unit: unhex(&e.unit)?, rail_module: unhex(&e.rail_module)?, source: e.source.to_vec(), limit: e.limit })).collect::<R<Vec<_>>>())
        .transpose()?;
    to_js(&match money::destination(core.as_deref(), &a) {
        money::Destination::Flow => Out { to: "flow", why: "no larger than the vault's limit for its unit, or no vault declared: it goes to the flow (Money rule 3)".into() },
        money::Destination::Vault(_) => Out { to: "vault", why: "above the vault's limit for its unit: it must be paid to the vault (Money rule 3)".into() },
        money::Destination::Undeliverable(u) => Out { to: "nowhere", why: u.to_string() },
    })
}

// ---------------------------------------------------------------- the payment cMIP

#[derive(Deserialize, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
enum PaidToIn {
    #[serde(rename_all = "camelCase")]
    Flow { pointer: String, rail: u64 },
    #[serde(rename_all = "camelCase")]
    Vault { declared_by: String, entry: u64 },
    #[serde(rename_all = "camelCase")]
    Refund { claim: String },
}

impl PaidToIn {
    fn core(&self) -> R<PaidTo> {
        Ok(match self {
            PaidToIn::Flow { pointer, rail } => PaidTo::Flow { pointer: unhex(pointer)?, rail: *rail },
            PaidToIn::Vault { declared_by, entry } => PaidTo::Vault { declared_by: unhex(declared_by)?, entry: *entry },
            PaidToIn::Refund { claim } => PaidTo::Refund { claim: unhex(claim)? },
        })
    }
    fn of(p: &PaidTo) -> Self {
        match p {
            PaidTo::Flow { pointer, rail } => PaidToIn::Flow { pointer: hx(pointer), rail: *rail },
            PaidTo::Vault { declared_by, entry } => PaidToIn::Vault { declared_by: hx(declared_by), entry: *entry },
            PaidTo::Refund { claim } => PaidToIn::Refund { claim: hx(claim) },
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CommitmentIn {
    rail: String,
    payee: String,
    amount: AmountIn,
    fulfils: String,
    /// The payer's identity, or none (an anonymous payment that committed no key).
    payer: Option<String>,
    paid_to: PaidToIn,
    salt: ByteBuf,
}

/// The payment commitment's hash (payment cMIP, "The payment commitment"):
/// what the payee's side commits to on the rail, and what a verifier
/// recomputes from a receipt or claim. The salt is 16 bytes the payer's
/// client draws at random for this payment (client conformance).
#[wasm_bindgen(js_name = paymentCommitment)]
pub fn payment_commitment(input: JsValue) -> R<String> {
    Ok(hx(&from_js::<CommitmentIn>(input)?.core()?.hash()))
}

impl CommitmentIn {
    fn core(&self) -> R<Commitment> {
        Ok(Commitment {
            rail: unhex(&self.rail)?,
            payee: unhex(&self.payee)?,
            amount: self.amount.core()?,
            fulfils: unhex(&self.fulfils)?,
            payer: opt(&self.payer)?.map(Payer::Identity),
            paid_to: self.paid_to.core()?,
            salt: arr::<16>(&self.salt, "the salt")?,
            purchase: None,
        })
    }
}

/// The commitment itself, encoded in deterministic CBOR (the array the
/// money messages cMIP's invoice request carries).
#[wasm_bindgen(js_name = commitmentCbor)]
pub fn commitment_cbor(input: JsValue) -> R<Vec<u8>> {
    Ok(cbor::encode(&from_js::<CommitmentIn>(input)?.core()?.to_value()))
}

/// A commitment read back from its CBOR: its fields and its hash. A
/// commitment naming a bare key as payer, or a purchase, is refused here:
/// Damgar's round 1 makes neither.
#[wasm_bindgen(js_name = readCommitment)]
pub fn read_commitment(bytes: &[u8]) -> R<JsValue> {
    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    struct Out {
        rail: String,
        payee: String,
        amount: AmountIn,
        fulfils: String,
        payer: Option<String>,
        paid_to: PaidToIn,
        salt: ByteBuf,
        hash: String,
    }
    let v = cbor::decode(bytes).map_err(err)?;
    let Value::Array(a) = &v else { return Err(err("a commitment is an array")) };
    if a.len() != 7 {
        return Err(err("a commitment of seven elements (no purchase) is read here"));
    }
    let h = |x: &Value| match x {
        Value::Bytes(b) => <[u8; 32]>::try_from(b.as_slice()).map_err(|_| err("a hash is 32 bytes")),
        _ => Err(err("a hash")),
    };
    let payer = match &a[4] {
        Value::Null => None,
        Value::Bytes(_) => Some(h(&a[4])?),
        _ => return Err(err("a payer named by a bare key is not read here")),
    };
    let salt = match &a[6] {
        Value::Bytes(b) if b.len() == 16 => b.clone(),
        _ => return Err(err("the salt is 16 bytes")),
    };
    let c = Commitment {
        rail: h(&a[0])?,
        payee: h(&a[1])?,
        amount: Amount::decode(&a[2]).map_err(err)?,
        fulfils: h(&a[3])?,
        payer: payer.map(Payer::Identity),
        paid_to: PaidTo::decode(&a[5]).ok_or_else(|| err("paid-to"))?,
        salt: salt.clone().try_into().unwrap(),
        purchase: None,
    };
    if cbor::encode(&c.to_value()) != bytes {
        return Err(err("the commitment is not in deterministic CBOR"));
    }
    to_js(&Out { rail: hx(&c.rail), payee: hx(&c.payee), amount: AmountIn::of(&c.amount), fulfils: hx(&c.fulfils), payer: payer.as_ref().map(hx), paid_to: PaidToIn::of(&c.paid_to), salt: ByteBuf::from(salt), hash: hx(&c.hash()) })
}

/// Run a rail Module's rule on a commitment before paying (payment cMIP,
/// step 2): what a payer's money app does with an answer's invoice or
/// request, without the completing part of the proof. `module` the rail
/// Module's spec hash; `address` the payee's rail address or vault source;
/// `railProof` the rail proof so far; `chain` the headers the client
/// follows, or null. The answer, as `moneyJudge` gives it.
#[wasm_bindgen(js_name = railCheck)]
pub fn rail_check(module: &str, commitment: &str, amount: JsValue, address: &[u8], rail_proof: &[u8], chain: JsValue) -> R<JsValue> {
    let m = unhex(module)?;
    let a = from_js::<AmountIn>(amount)?.core()?;
    let chain = header_chain(from_js::<Option<ChainIn>>(chain)?.as_ref())?;
    let input = mor_payment::RailInput { commitment: unhex(commitment)?, amount: &a, address, rail_proof };
    let ans = if m == mor_lightning::spec() {
        Lightning::rule(&input)
    } else if m == mor_onchain::spec() {
        Onchain::rule(&input, chain.as_ref())
    } else {
        Answer::Unknown("a rail Module this client does not implement".into())
    };
    to_js(&Verdict::of(&ans))
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProofIn {
    paid_to: PaidToIn,
    salt: ByteBuf,
    rail: ByteBuf,
}

/// The proof a receipt or claim carries in its field 1: `[ paid-to, salt, rail-proof ]`.
#[wasm_bindgen(js_name = paymentProof)]
pub fn payment_proof(input: JsValue) -> R<Vec<u8>> {
    let p: ProofIn = from_js(input)?;
    Ok(Proof { paid_to: p.paid_to.core()?, salt: arr::<16>(&p.salt, "the salt")?, rail: p.rail.to_vec() }.encode())
}

/// A receipt's or claim's field 1 read: `{ paidTo, salt, rail }`.
#[wasm_bindgen(js_name = readPaymentProof)]
pub fn read_payment_proof(bytes: &[u8]) -> R<JsValue> {
    let p = Proof::decode(bytes).ok_or_else(|| err("the proof is not in the payment cMIP's shape"))?;
    to_js(&ProofIn { paid_to: PaidToIn::of(&p.paid_to), salt: ByteBuf::from(p.salt.to_vec()), rail: ByteBuf::from(p.rail) })
}

// ---------------------------------------------------------------- the Lightning rail Module

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct LnAddressIn {
    /// 0 Bitcoin, 1 testnet, 2 signet, 3 regtest.
    network: u64,
    /// The node key, 33 bytes as hex.
    node: String,
    endpoint: Option<String>,
}

/// A Lightning rail address (or vault source), encoded: `[ network, node, ? endpoint ]`.
#[wasm_bindgen(js_name = lightningAddress)]
pub fn lightning_address(input: JsValue) -> R<Vec<u8>> {
    let a: LnAddressIn = from_js(input)?;
    let node: [u8; 33] = hex::decode(&a.node).ok().and_then(|v| v.try_into().ok()).ok_or_else(|| err("a node key is 33 bytes, as 66 hex characters"))?;
    let enc = LnAddress { network: LnNetwork::from_number(a.network).ok_or_else(|| err("networks are 0 to 3"))?, node, endpoint: a.endpoint }.encode();
    LnAddress::decode(&enc).ok_or_else(|| err("not a compressed node key"))?;
    Ok(enc)
}

/// A Lightning rail address read, or `null` where it is none.
#[wasm_bindgen(js_name = readLightningAddress)]
pub fn read_lightning_address(bytes: &[u8]) -> R<JsValue> {
    match LnAddress::decode(bytes) {
        None => Ok(JsValue::NULL),
        Some(a) => to_js(&LnAddressIn { network: a.network.number(), node: hex::encode(a.node), endpoint: a.endpoint }),
    }
}

/// A Lightning rail proof: `[ invoice, ? preimage ]`.
#[wasm_bindgen(js_name = lightningProof)]
pub fn lightning_proof(invoice: &str, preimage: Option<Vec<u8>>) -> R<Vec<u8>> {
    let preimage = preimage.map(|p| arr::<32>(&p, "the preimage")).transpose()?;
    Ok(LnProof { invoice: invoice.trim().to_lowercase(), preimage }.encode())
}

/// A Lightning rail proof read: `{ invoice, preimage }`, or `null`.
#[wasm_bindgen(js_name = readLightningProof)]
pub fn read_lightning_proof(bytes: &[u8]) -> R<JsValue> {
    #[derive(Serialize)]
    struct Out {
        invoice: String,
        #[serde(with = "serde_bytes")]
        preimage: Option<Vec<u8>>,
    }
    match LnProof::decode(bytes) {
        None => Ok(JsValue::NULL),
        Some(p) => to_js(&Out { invoice: p.invoice, preimage: p.preimage.map(|x| x.to_vec()) }),
    }
}

/// A BOLT 11 invoice read by the Module's own decoder (its signature
/// checked, its node key recovered): `{ network, node, amountMsat,
/// paymentHash, descriptionHash, hasDescription }`. Throws where it is no
/// valid invoice.
#[wasm_bindgen(js_name = lightningInvoice)]
pub fn lightning_invoice(invoice: &str) -> R<JsValue> {
    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    struct Out {
        network: u64,
        node: String,
        amount_msat: Option<u64>,
        payment_hash: String,
        description_hash: Option<String>,
        has_description: bool,
        timestamp: u64,
    }
    let i = bolt11::decode(&invoice.trim().to_lowercase()).map_err(|e| err(match e {
        bolt11::Bolt11Error::Malformed(w) => format!("not a valid BOLT 11 invoice: {w}"),
        bolt11::Bolt11Error::Signature => "the invoice's signature does not hold".into(),
    }))?;
    to_js(&Out {
        network: i.network.number(),
        node: hex::encode(i.node),
        amount_msat: i.amount_msat,
        payment_hash: hex::encode(i.payment_hash),
        description_hash: i.description_hash.map(hex::encode),
        has_description: i.has_description,
        timestamp: i.timestamp,
    })
}

// ---------------------------------------------------------------- the on-chain rail Module

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct OnchainAddressIn {
    network: u64,
    /// The x-only Taproot internal key the money goes to, as hex.
    key: String,
    /// The x-only request key, as hex.
    request: String,
    endpoint: Option<String>,
}

fn x32(h: &str, what: &str) -> R<[u8; 32]> {
    hex::decode(h).ok().and_then(|v| v.try_into().ok()).ok_or_else(|| err(format!("{what} is 32 bytes, as 64 hex characters")))
}

/// An on-chain rail address (or vault source), encoded: `[ network, key, request, ? endpoint ]`.
#[wasm_bindgen(js_name = onchainAddress)]
pub fn onchain_address(input: JsValue) -> R<Vec<u8>> {
    let a: OnchainAddressIn = from_js(input)?;
    let o = OnchainAddress {
        network: Network::from_number(a.network).ok_or_else(|| err("networks are 0 to 3"))?,
        key: x32(&a.key, "the Bitcoin key")?,
        request: x32(&a.request, "the request key")?,
        tree: None,
        endpoint: a.endpoint,
    };
    if o.output_key(&[0u8; 32]).is_none() {
        return Err(err("the Bitcoin key is not an x-only key on the curve"));
    }
    Ok(o.encode())
}

/// An on-chain rail address read, or `null`.
#[wasm_bindgen(js_name = readOnchainAddress)]
pub fn read_onchain_address(bytes: &[u8]) -> R<JsValue> {
    match OnchainAddress::decode(bytes) {
        None => Ok(JsValue::NULL),
        Some(a) => to_js(&OnchainAddressIn { network: a.network.number(), key: hex::encode(a.key), request: hex::encode(a.request), endpoint: a.endpoint }),
    }
}

/// Where a payment committing to `commitment` goes on this address (the
/// Module's pay-to-contract): `{ outputKey, script, address }`, `address`
/// the Taproot address as wallets write it (BIP 350's bech32m).
#[wasm_bindgen(js_name = onchainPayTo)]
pub fn onchain_pay_to(address: &[u8], commitment: &str) -> R<JsValue> {
    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    struct Out {
        output_key: String,
        script: String,
        address: String,
    }
    let a = OnchainAddress::decode(address).ok_or_else(|| err("not an on-chain rail address"))?;
    let c = unhex(commitment)?;
    let q = a.output_key(&c).ok_or_else(|| err("the tweak fails for this key"))?;
    let hrp = match a.network {
        Network::Mainnet => "bc",
        Network::Testnet | Network::Signet => "tb",
        Network::Regtest => "bcrt",
    };
    to_js(&Out { output_key: hex::encode(q), script: hex::encode(a.script(&c).unwrap()), address: bech32m_segwit(hrp, 1, &q) })
}

/// The x-only public key of a secp256k1 secret (BIP 340): what an
/// on-chain rail address names as its request key.
#[wasm_bindgen(js_name = onchainKey)]
pub fn onchain_key(secret: &[u8]) -> R<String> {
    let k = k256::schnorr::SigningKey::from_bytes(&arr::<32>(secret, "a secret")?).map_err(|_| err("not a valid secret"))?;
    Ok(hex::encode(k.verifying_key().to_bytes()))
}

/// The payee's side's request for a commitment (the on-chain rail Module,
/// "The request"): a BIP 340 signature by the request key over the request
/// message, at the Module's six confirmations or the more `confirmations`
/// names. Returns the 64-byte signature.
#[wasm_bindgen(js_name = onchainRequest)]
pub fn onchain_request(secret: &[u8], commitment: &str, confirmations: Option<u32>) -> R<Vec<u8>> {
    let k = k256::schnorr::SigningKey::from_bytes(&arr::<32>(secret, "a secret")?).map_err(|_| err("not a valid secret"))?;
    let m = mor_onchain::p2c::request_message_for(&unhex(commitment)?, confirmations.map(u64::from));
    // BIP 340 over the 32-byte message itself, as the Module verifies it (`verify_raw`), with fresh auxiliary randomness.
    let s = k.sign_raw(&m, &super::random::<32>()).map_err(err)?;
    Ok(s.to_bytes().to_vec())
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct OnchainProofIn {
    request: ByteBuf,
    confirmations: Option<u64>,
    paid: Option<PaidIn>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct PaidIn {
    tx: ByteBuf,
    output: u64,
    block: Option<BlockIn>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct BlockIn {
    index: u64,
    branch: Vec<ByteBuf>,
    headers: Vec<ByteBuf>,
}

/// An on-chain rail proof: `[ request, ? [ tx, output, ? [ index, branch, headers ] ] ]`.
#[wasm_bindgen(js_name = onchainProof)]
pub fn onchain_proof(input: JsValue) -> R<Vec<u8>> {
    let p: OnchainProofIn = from_js(input)?;
    let paid = p
        .paid
        .map(|q| {
            Ok::<_, JsError>(Paid {
                tx: q.tx.to_vec(),
                output: q.output,
                block: q
                    .block
                    .map(|b| {
                        Ok::<_, JsError>(Block {
                            index: b.index,
                            branch: b.branch.iter().map(|h| arr::<32>(h, "a branch hash")).collect::<R<_>>()?,
                            headers: b.headers.iter().map(|h| arr::<80>(h, "a header")).collect::<R<_>>()?,
                        })
                    })
                    .transpose()?,
            })
        })
        .transpose()?;
    Ok(OnchainProof { request: arr::<64>(&p.request, "the request's signature")?, confirmations: p.confirmations, paid }.encode())
}

/// An on-chain rail proof read, or `null`.
#[wasm_bindgen(js_name = readOnchainProof)]
pub fn read_onchain_proof(bytes: &[u8]) -> R<JsValue> {
    match OnchainProof::decode(bytes) {
        None => Ok(JsValue::NULL),
        Some(p) => to_js(&OnchainProofIn {
            request: ByteBuf::from(p.request.to_vec()),
            confirmations: p.confirmations,
            paid: p.paid.map(|q| PaidIn {
                tx: ByteBuf::from(q.tx),
                output: q.output,
                block: q.block.map(|b| BlockIn {
                    index: b.index,
                    branch: b.branch.iter().map(|h| ByteBuf::from(h.to_vec())).collect(),
                    headers: b.headers.iter().map(|h| ByteBuf::from(h.to_vec())).collect(),
                }),
            }),
        }),
    }
}

/// A transaction's Merkle branch in its block, from the block's txids in
/// Bitcoin's own byte order: the siblings from the leaf up.
#[wasm_bindgen(js_name = merkleBranch)]
pub fn merkle_branch(txids: Vec<js_sys::Uint8Array>, index: u32) -> R<Vec<js_sys::Uint8Array>> {
    let ids = txids.iter().map(|t| arr::<32>(&t.to_vec(), "a txid")).collect::<R<Vec<_>>>()?;
    let b = mor_onchain::block::merkle_branch(&ids, index as usize).ok_or_else(|| err("no such transaction in the block"))?;
    Ok(b.iter().map(|h| js_sys::Uint8Array::from(h.as_slice())).collect())
}

/// A transaction's txid (Bitcoin's byte order), from its bytes without witness.
#[wasm_bindgen(js_name = txid)]
pub fn txid(tx: &[u8]) -> String {
    hex::encode(mor_onchain::tx::dsha256(tx))
}

/// BIP 173 / BIP 350 segwit address: bech32m for witness version 1.
fn bech32m_segwit(hrp: &str, version: u8, program: &[u8]) -> String {
    const CHARSET: &[u8] = b"qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    fn polymod(values: &[u8]) -> u32 {
        const G: [u32; 5] = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
        let mut chk: u32 = 1;
        for v in values {
            let b = chk >> 25;
            chk = ((chk & 0x1ffffff) << 5) ^ (*v as u32);
            for (i, g) in G.iter().enumerate() {
                if (b >> i) & 1 == 1 {
                    chk ^= g;
                }
            }
        }
        chk
    }
    let mut data = vec![version];
    let (mut acc, mut bits) = (0u32, 0u32);
    for b in program {
        acc = (acc << 8) | *b as u32;
        bits += 8;
        while bits >= 5 {
            bits -= 5;
            data.push(((acc >> bits) & 31) as u8);
        }
    }
    if bits > 0 {
        data.push(((acc << (5 - bits)) & 31) as u8);
    }
    let mut v: Vec<u8> = hrp.bytes().map(|c| c >> 5).collect();
    v.push(0);
    v.extend(hrp.bytes().map(|c| c & 31));
    v.extend(&data);
    v.extend([0u8; 6]);
    let m = polymod(&v) ^ if version == 0 { 1 } else { 0x2bc830a3 };
    let mut out = format!("{hrp}1");
    for d in data {
        out.push(CHARSET[d as usize] as char);
    }
    for i in 0..6 {
        out.push(CHARSET[((m >> (5 * (5 - i))) & 31) as usize] as char);
    }
    out
}

// ---------------------------------------------------------------- judging a receipt or claim

/// What a verifier holds, read for the payment cMIP as a Money-only client
/// reads it (Money, "Dependencies"; F32, F338): acts counting on their
/// signers' chains for binding use (F153); which acts are the payee's own
/// on an agreement or offer, and Money rule 29's lock changes, are
/// Agreements' to read, so they are not judged here, and what rests on them
/// is unknown.
struct View<'a> {
    v: &'a mor_core::chain::Verifier,
    money: Hash,
}

impl View<'_> {
    fn money_act(&self, id: &Hash) -> Option<(Payload, Hash)> {
        let h = self.v.get(id)?;
        if self.v.binding_status(id) != Status::Valid || h.inside.spec != self.money {
            return None;
        }
        let p = Payload::decode(h.inside.type_, &h.inside.payload).ok()?;
        let signer = *h.act.outside.signer.as_ref()?;
        money::check_signer(&p, &signer, &Citations::of(&h.inside)).ok()?;
        Some((p, signer))
    }
}

impl Held for View<'_> {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        match self.money_act(id)? {
            (Payload::PayeePointer(p), _) => Some(p),
            _ => None,
        }
    }

    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        let h = self.v.get(id)?;
        if self.v.binding_status(id) != Status::Valid {
            return None;
        }
        let (who, decls) = match h.identity.as_ref()?.as_ref().ok()? {
            Id::Genesis(g) => (*id, g.declarations.clone()?),
            Id::Rotation(r) => (*h.act.outside.signer.as_ref()?, r.declarations.clone()?),
            _ => return None,
        };
        let v = money::vault_in(&self.money, &decls).ok()??;
        Some((who, v?))
    }

    fn obligation(&self, id: &Hash) -> Option<Obligation> {
        match self.money_act(id)? {
            (Payload::Obligation(o), _) => Some(o),
            _ => None,
        }
    }

    fn holding(&self, _: &Hash, _: &Hash) -> Option<money::Holding> {
        None
    }

    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        self.v
            .signed_by(payee)
            .filter(|h| h.inside.spec == self.money && h.inside.type_ == money::types::PAYEE_POINTER)
            .filter_map(|h| Some((h.id, self.pointer(&h.id)?)))
            .filter(|(_, p)| &p.payee == payee)
            .collect()
    }

    fn voided_pointer(&self, id: &Hash) -> Option<(PayeePointer, Hash)> {
        let h = self.v.get(id)?;
        if !matches!(self.v.status(id), Status::Void | Status::Disputed) || h.inside.spec != self.money {
            return None;
        }
        match Payload::decode(h.inside.type_, &h.inside.payload).ok()? {
            Payload::PayeePointer(p) if h.act.outside.signer == Some(p.payee) => Some((p, self.v.judged_by(id)?)),
            _ => None,
        }
    }

    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>> {
        let res = self.v.resolve(payee);
        let mut out = None;
        for st in &res.states {
            if let Ok(Some(v)) = money::vault_in(&self.money, &st.declarations) {
                out = v;
            }
        }
        out
    }

    fn payment_counts(&self, _: &Hash, _: &money::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }

    fn claim(&self, id: &Hash) -> Option<(Claim, Hash, money::Citations)> {
        let (p, signer) = self.money_act(id)?;
        let Payload::Claim(c) = p else { return None };
        Some((c, signer, Citations::of(&self.v.get(id)?.inside)))
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct JudgeIn {
    money: String,
    /// The spec hashes the person accepts (F338): the payment cMIP, the rail
    /// Modules, the units. Anything else is unknown, never signed.
    accepted: Vec<String>,
    /// The headers of the chain the client follows, for the on-chain rail
    /// (F204): its network, the height of the first, and the headers.
    chain: Option<ChainIn>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChainIn {
    network: u64,
    start: u64,
    headers: Vec<ByteBuf>,
}

fn header_chain(c: Option<&ChainIn>) -> R<Option<HeaderChain>> {
    c.map(|c| {
        HeaderChain::new(
            Network::from_number(c.network).ok_or_else(|| err("networks are 0 to 3"))?,
            c.start,
            c.headers.iter().map(|h| arr::<80>(h, "a header")).collect::<R<_>>()?,
        )
        .map_err(err)
    })
    .transpose()
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Verdict {
    /// "valid", "invalid", "pending" or "unknown".
    answer: &'static str,
    why: String,
}

impl Verdict {
    fn of(a: &Answer) -> Self {
        match a {
            Answer::Valid => Verdict { answer: "valid", why: String::new() },
            Answer::Invalid(w) => Verdict { answer: "invalid", why: w.clone() },
            Answer::Pending(w) => Verdict { answer: "pending", why: w.clone() },
            Answer::Unknown(w) => Verdict { answer: "unknown", why: w.clone() },
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct JudgedOut {
    /// "receipt" or "claim".
    kind: &'static str,
    /// The act's standing on its signer's chain, for binding use.
    standing: String,
    signer: Option<String>,
    /// The rail's answer (Money rules 8 to 10): what the rail Module's rule
    /// says of the rail's proof, with the commitment recomputed.
    rail: Verdict,
    /// Judged beside it (payment cMIP, "What verification does not
    /// decide"): whether it was paid to a pointer in force for what it
    /// fulfils, and as the vault allows. Unknown here for what Agreements
    /// read (an obligation, an agreement or an offer: F145, M5).
    beside: Verdict,
    /// The rail Module that computed the answer.
    module: String,
    /// The payment it is, as its rail Module says (F200), hex; none where
    /// it shows no payment yet.
    payment: Option<String>,
    /// The confirmations an on-chain proof carries, and needs.
    confirmations: Option<(u64, u64)>,
}

#[wasm_bindgen]
impl Verifier {
    /// Judge a receipt or claim this verifier holds, as a Money-only client
    /// with the person's accepted cMIPs and Modules (F338): the act's
    /// standing; the rail's answer, by the rail Module its field 0 names,
    /// adopted only if accepted (a Module, unit or payment cMIP not accepted
    /// is unknown: Development rule 9); and what is judged beside it.
    #[wasm_bindgen(js_name = moneyJudge)]
    pub fn money_judge(&self, act: &str, opts: JsValue) -> R<JsValue> {
        let o: JudgeIn = from_js(opts)?;
        let money_spec = unhex(&o.money)?;
        let accepted = o.accepted.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>()?;
        let id = unhex(act)?;
        let h = self.inner.get(&id).ok_or_else(|| err("that act is not held"))?;
        if h.inside.spec != money_spec {
            return Err(err("not a Money act"));
        }
        let p = Payload::decode(h.inside.type_, &h.inside.payload).map_err(err)?;
        let signer = h.act.outside.signer;
        let cited = Citations::of(&h.inside);
        let standing = match self.inner.binding_status(&id) {
            Status::Valid => "valid",
            Status::Disputed => "disputed",
            Status::Void => "void",
            Status::Pending => "pending",
            Status::Invalid => "invalid",
            Status::Unknown => "unknown",
            Status::Scoped => "scoped",
        };
        let signer_ok = signer.is_some_and(|s| money::check_signer(&p, &s, &cited).is_ok());
        let (kind, rail, proof, amount) = match &p {
            Payload::Receipt(r) => ("receipt", r.rail, r.proof.clone(), r.amount),
            Payload::Claim(c) => ("claim", c.rail, c.proof.clone(), c.amount),
            _ => return Err(err("not a receipt or a claim")),
        };
        let chain = header_chain(o.chain.as_ref())?;
        let ln = Lightning;
        let oc = match &chain {
            Some(c) => Onchain::on(c),
            None => Onchain::offline(),
        };
        let mut modules = Modules::new();
        if accepted.contains(&mor_lightning::spec()) {
            modules = modules.adopt(&ln);
        }
        if accepted.contains(&mor_onchain::spec()) {
            modules = modules.adopt(&oc);
        }
        let view = View { v: &self.inner, money: money_spec };
        let record = match &p {
            Payload::Receipt(r) => Record::Receipt(r),
            Payload::Claim(c) => Record::Claim(c, signer.unwrap_or([0; 32]), &cited),
            _ => unreachable!(),
        };
        let unknown = |w: &str| Verdict { answer: "unknown", why: w.into() };
        let (rail_v, beside_v) = if !accepted.contains(&mor_payment::spec()) {
            (unknown("under a payment cMIP not accepted here: not judged, and nothing is signed for it"), unknown("not judged"))
        } else if !accepted.contains(&amount.unit) {
            (unknown("in a unit not accepted here: not judged, and nothing is signed for it"), unknown("not judged"))
        } else if modules.get(&rail).is_none() {
            (unknown("on a rail Module not accepted here: not judged, and nothing is signed for it"), unknown("not judged"))
        } else if !signer_ok {
            (Verdict { answer: "invalid", why: "not signed by the party Money rule 7 names (a receipt by its payee, a claim by its payer)".into() }, unknown("not judged"))
        } else {
            let v = mor_payment::verify(record.clone(), &view, &modules);
            (Verdict::of(&v.answer), Verdict::of(&mor_payment::beside(record.clone(), &view)))
        };
        let payment = mor_payment::payment(&record, &modules).map(hex::encode);
        let confirmations = if rail == mor_onchain::spec() {
            Proof::decode(&proof).and_then(|q| OnchainProof::decode(&q.rail)).map(|q| (q.paid.as_ref().and_then(|x| x.block.as_ref()).map_or(0, |b| b.headers.len() as u64), q.needs()))
        } else {
            None
        };
        to_js(&JudgedOut { kind, standing: standing.into(), signer: signer.as_ref().map(hx), rail: rail_v, beside: beside_v, module: hx(&rail), payment, confirmations })
    }

    /// Where a payer pays this payee this amount (the payment cMIP,
    /// "Choosing where to pay"; Money rules 1, 3 and 5): the pointer that
    /// counts and the vault in force, as this verifier holds the payee's
    /// acts, and the first rail, in the payee's order, on a rail Module the
    /// person accepts that carries the unit. `{ to: "flow", pointer, rail,
    /// module, address }`, `{ to: "vault", declaredBy, entry, module,
    /// address }` or `{ to: "nowhere", why }`.
    #[wasm_bindgen(js_name = moneyChoose)]
    pub fn money_choose(&self, money_spec: &str, payee: &str, amount: JsValue, accepted: Vec<String>) -> R<JsValue> {
        #[derive(Serialize)]
        #[serde(rename_all = "camelCase")]
        struct Out {
            to: &'static str,
            pointer: Option<String>,
            rail: Option<u64>,
            declared_by: Option<String>,
            entry: Option<u64>,
            module: Option<String>,
            #[serde(with = "serde_bytes")]
            address: Option<Vec<u8>>,
            why: String,
        }
        let money = unhex(money_spec)?;
        let payee = unhex(payee)?;
        let amount = from_js::<AmountIn>(amount)?.core()?;
        let accepted = accepted.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>()?;
        let view = View { v: &self.inner, money };
        let chain = view.pointers_of(&payee);
        let latest = money::latest_pointer(&chain);
        let flow = latest.act.and_then(|a| chain.iter().find(|(i, _)| *i == a)).map(|(i, p)| (*i, p.clone()));
        let vault: Option<(Hash, Vec<VaultEntry>)> = {
            let res = self.inner.resolve(&payee);
            let mut out = None;
            for link in &res.links {
                let Some(h) = self.inner.get(&link.act) else { continue };
                let decls = match h.identity.as_ref().and_then(|x| x.as_ref().ok()) {
                    Some(Id::Genesis(g)) => g.declarations.clone(),
                    Some(Id::Rotation(r)) => r.declarations.clone(),
                    _ => None,
                };
                match money::vault_in(&money, &decls.unwrap_or_default()) {
                    Ok(Some(Some(v))) => out = Some((link.act, v)),
                    Ok(Some(None)) => out = None,
                    _ => {}
                }
            }
            out
        };
        let ok_unit = accepted.contains(&amount.unit) && accepted.contains(&mor_payment::spec());
        let can = |m: &Hash, a: &[u8], u: &Hash| {
            ok_unit
                && accepted.contains(m)
                && ((*m == mor_lightning::spec() && LnAddress::decode(a).map(|x| mor_lightning::unit(x.network)) == Some(*u))
                    || (*m == mor_onchain::spec() && OnchainAddress::decode(a).map(|x| mor_onchain::unit(x.network)) == Some(*u)))
        };
        let none = |why: String| Out { to: "nowhere", pointer: None, rail: None, declared_by: None, entry: None, module: None, address: None, why };
        let out = match money::choose(flow.as_ref().map(|(_, p)| p), vault.as_ref().map(|(_, v)| v.as_slice()), &amount, can) {
            money::Choice::Flow(i) => {
                let (pid, p) = flow.as_ref().unwrap();
                let r = &p.rails[i];
                Out { to: "flow", pointer: Some(hx(pid)), rail: Some(i as u64), declared_by: None, entry: None, module: Some(hx(&r.module)), address: Some(r.address.clone()), why: if latest.contested { "the payee's pointer chain is forked: the last pointer before the fork is used (Money rule 1); the payee is warned".into() } else { String::new() } }
            }
            money::Choice::Vault(i) => {
                let (by, v) = vault.as_ref().unwrap();
                Out { to: "vault", pointer: None, rail: None, declared_by: Some(hx(by)), entry: Some(i as u64), module: Some(hx(&v[i].rail_module)), address: Some(v[i].source.clone()), why: "above the vault's limit for its unit: it goes to the vault (Money rule 3)".into() }
            }
            money::Choice::Undeliverable(u) => none(if ok_unit { u.to_string() } else { "the unit, or the payment cMIP, is not one accepted here".into() }),
        };
        to_js(&out)
    }

    /// The payee pointer that counts for an identity (Money rule 1), from
    /// the valid pointers this verifier holds: `{ act, version, forked }`,
    /// `act` null where it holds none; `forked` where two name one
    /// predecessor, the pointer that counts the last before the fork.
    #[wasm_bindgen(js_name = moneyPointer)]
    pub fn money_pointer(&self, money_spec: &str, payee: &str) -> R<JsValue> {
        #[derive(Serialize)]
        struct Out {
            act: Option<String>,
            version: u64,
            forked: bool,
        }
        let view = View { v: &self.inner, money: unhex(money_spec)? };
        let chain = view.pointers_of(&unhex(payee)?);
        let l = money::latest_pointer(&chain);
        let version = l.act.and_then(|a| chain.iter().find(|(i, _)| *i == a)).map_or(0, |(_, p)| p.version);
        to_js(&Out { act: l.act.as_ref().map(hx), version, forked: l.contested })
    }

    /// The vault an identity's chain declares in force (Money rule 3), as
    /// this verifier holds the chain: `{ declaredBy, entries }`, or null
    /// where it declares none.
    #[wasm_bindgen(js_name = moneyVault)]
    pub fn money_vault(&self, money_spec: &str, identity: &str) -> R<JsValue> {
        #[derive(Serialize)]
        #[serde(rename_all = "camelCase")]
        struct Out {
            declared_by: String,
            entries: Vec<VaultOut>,
        }
        let money = unhex(money_spec)?;
        let res = self.inner.resolve(&unhex(identity)?);
        let mut out = None;
        for link in &res.links {
            let Some(h) = self.inner.get(&link.act) else { continue };
            let decls = match h.identity.as_ref().and_then(|x| x.as_ref().ok()) {
                Some(Id::Genesis(g)) => g.declarations.clone(),
                Some(Id::Rotation(r)) => r.declarations.clone(),
                _ => None,
            };
            match money::vault_in(&money, &decls.unwrap_or_default()) {
                Ok(Some(Some(v))) => out = Some((link.act, v)),
                Ok(Some(None)) => out = None,
                _ => {}
            }
        }
        match out {
            None => Ok(JsValue::NULL),
            Some((by, v)) => to_js(&Out {
                declared_by: hx(&by),
                entries: v.iter().map(|e| VaultOut { unit: hx(&e.unit), rail_module: hx(&e.rail_module), source: ByteBuf::from(e.source.clone()), limit: e.limit }).collect(),
            }),
        }
    }
}

// ---------------------------------------------------------------- the anchoring cMIP, for a payment buying an anchor

use mor_anchoring::service::{self as anchor_svc, Price, Terms, Tier};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct TierIn {
    price: u64,
    blocks: u64,
}

/// A pooled anchoring service's standing offer (the anchoring cMIP, item 9;
/// an Agreements standing offer, type 6, a lone seller's, F225): its tiers,
/// fixed prices in the unit of `network`, on the Bitcoin clock of that
/// network. `{ type, payload }`, to sign under the Agreements MIR's spec.
#[wasm_bindgen(js_name = anchoringOffer)]
pub fn anchoring_offer(network: u32, tiers: JsValue, words: Option<String>) -> R<JsValue> {
    let n = Network::from_number(network as u64).ok_or_else(|| err("networks are 0 to 3"))?;
    let ts: Vec<TierIn> = from_js(tiers)?;
    if ts.is_empty() {
        return Err(err("an offer has at least one tier"));
    }
    let terms = Terms { reference: mor_onchain::clock::reference(n), tiers: ts.iter().map(|t| Tier { price: Price::Fixed(t.price), blocks: t.blocks }).collect() };
    let o = terms.standing_offer(mor_onchain::unit(n), words, None);
    to_js(&MadeOut { type_: mor_core::agreements::types::STANDING_OFFER, payload: cbor::encode(&Value::Map(o.to_map())) })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OfferOut {
    id: String,
    payee: String,
    unit: String,
    network: Option<u64>,
    tiers: Vec<TierIn>,
    words: Option<String>,
}

/// A standing offer act read as this cMIP's (the anchoring cMIP, item 9;
/// `service::Offer::read`): its payee, unit, the Bitcoin clock's network
/// and its tiers. Throws where it is no anchoring offer, saying why.
#[wasm_bindgen(js_name = anchoringReadOffer)]
pub fn anchoring_read_offer(act: &[u8]) -> R<JsValue> {
    let a = mor_core::act::Act::decode(act).map_err(err)?;
    let inside = a.open(None).map_err(|_| err("an offer is public"))?;
    let signer = a.outside.signer.ok_or_else(|| err("an offer names its signer"))?;
    if inside.type_ != mor_core::agreements::types::STANDING_OFFER {
        return Err(err("not a standing offer"));
    }
    let oa = mor_core::agreements::Offer::decode(&inside).map_err(err)?;
    let o = anchor_svc::Offer::read(a.id(), signer, &oa.offer).map_err(err)?;
    let network = if o.terms.reference.cmip == mor_onchain::clock::spec() {
        match &o.terms.reference.params {
            Value::Uint(n) => Some(*n),
            _ => None,
        }
    } else {
        None
    };
    to_js(&OfferOut {
        id: hx(&o.id),
        payee: hx(&o.payee),
        unit: hx(&o.price.unit),
        network,
        tiers: o.terms.tiers.iter().map(|t| TierIn { price: t.price.most(), blocks: t.blocks }).collect(),
        words: oa.offer.words.clone(),
    })
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct TicketIn {
    offer: String,
    leaf: String,
    commitment: String,
    tier: u64,
    batch: u64,
    deadline: u64,
}

/// A ticket's payload (the anchoring cMIP, item 9, type 2).
#[wasm_bindgen(js_name = anchoringTicket)]
pub fn anchoring_ticket(input: JsValue) -> R<Vec<u8>> {
    let t: TicketIn = from_js(input)?;
    let k = anchor_svc::Ticket { offer: unhex(&t.offer)?, leaf: unhex(&t.leaf)?, commitment: unhex(&t.commitment)?, tier: t.tier, batch: t.batch, deadline: t.deadline, quote: None };
    Ok(cbor::encode(&Value::Map(k.to_map())))
}

/// A ticket's payload read, or `null`.
#[wasm_bindgen(js_name = anchoringReadTicket)]
pub fn anchoring_read_ticket(payload: &[u8]) -> R<JsValue> {
    let m = super::payload_of(payload)?;
    match anchor_svc::Ticket::from_map(&m) {
        None => Ok(JsValue::NULL),
        Some(t) => to_js(&TicketIn { offer: hx(&t.offer), leaf: hx(&t.leaf), commitment: hx(&t.commitment), tier: t.tier, batch: t.batch, deadline: t.deadline }),
    }
}

/// The payer's check of a ticket before paying (the anchoring cMIP, client
/// conformance: "Check the ticket before paying"): it names the offer, the
/// leaf sent and the payer's commitment; the commitment follows the offer
/// and pays exactly the tier's price to its payee; the deadline is after
/// `now` (the payer's own point on the clock) and within the tier's blocks
/// and one block of slack. Null where acceptable, else why not.
#[wasm_bindgen(js_name = anchoringCheckTicket)]
pub fn anchoring_check_ticket(offer_act: &[u8], ticket: &[u8], commitment: &[u8], leaf: &str, now: u64) -> R<Option<String>> {
    let a = mor_core::act::Act::decode(offer_act).map_err(err)?;
    let inside = a.open(None).map_err(|_| err("an offer is public"))?;
    let oa = mor_core::agreements::Offer::decode(&inside).map_err(err)?;
    let o = anchor_svc::Offer::read(a.id(), a.outside.signer.ok_or_else(|| err("an offer names its signer"))?, &oa.offer).map_err(err)?;
    let t = anchor_svc::Ticket::from_map(&super::payload_of(ticket)?).ok_or_else(|| err("not a ticket"))?;
    if t.leaf != unhex(leaf)? {
        return Ok(Some("the ticket names another leaf than the one sent".into()));
    }
    let Value::Array(c) = cbor::decode(commitment).map_err(err)? else { return Err(err("a commitment is an array")) };
    if c.len() != 7 {
        return Ok(Some("a commitment naming a purchase is not one an anchor is bought with".into()));
    }
    let h = |x: &Value| -> R<Hash> {
        match x {
            Value::Bytes(b) => b.as_slice().try_into().map_err(|_| err("a hash")),
            _ => Err(err("a hash")),
        }
    };
    let cm = Commitment {
        rail: h(&c[0])?,
        payee: h(&c[1])?,
        amount: Amount::decode(&c[2]).map_err(err)?,
        fulfils: h(&c[3])?,
        payer: match &c[4] {
            Value::Null => None,
            v => Some(Payer::decode(v).map_err(err)?),
        },
        paid_to: PaidTo::decode(&c[5]).ok_or_else(|| err("paid-to"))?,
        salt: match &c[6] {
            Value::Bytes(b) => b.as_slice().try_into().map_err(|_| err("the salt"))?,
            _ => return Err(err("the salt")),
        },
        purchase: None,
    };
    Ok(anchor_svc::acceptable(&o, &t, &cm, now, None).err())
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct PublicationIn {
    offer: String,
    batch: u64,
    leaves: Vec<String>,
    /// The txid, in Bitcoin's byte order (as the core's hashes are), hex.
    tx: String,
    output: u64,
    /// The x-only key the batch's output is tweaked from, and the script tree's root, where one is: fields 5 and 6, the anchoring cMIP draft 6 (this build's).
    key: Option<String>,
    tree: Option<String>,
}

/// A publication's payload (the anchoring cMIP, item 9, type 3), with the
/// key its output is tweaked from (draft 6, fields 5 and 6).
#[wasm_bindgen(js_name = anchoringPublication)]
pub fn anchoring_publication(input: JsValue) -> R<Vec<u8>> {
    let p: PublicationIn = from_js(input)?;
    let pb = anchor_svc::Publication { offer: unhex(&p.offer)?, batch: p.batch, leaves: p.leaves.iter().map(|l| unhex(l)).collect::<R<_>>()?, tx: unhex(&p.tx)?, output: p.output };
    let mut m = pb.to_map();
    if let Some(k) = &p.key {
        m.push((Value::Uint(5), Value::Bytes(x32(k, "the key")?.to_vec())));
    }
    if let Some(t) = &p.tree {
        m.push((Value::Uint(6), Value::Bytes(x32(t, "the tree")?.to_vec())));
    }
    Ok(cbor::encode(&Value::Map(m)))
}

/// A publication's payload read, or `null`.
#[wasm_bindgen(js_name = anchoringReadPublication)]
pub fn anchoring_read_publication(payload: &[u8]) -> R<JsValue> {
    let m = super::payload_of(payload)?;
    let Some(p) = anchor_svc::Publication::from_map(&m) else { return Ok(JsValue::NULL) };
    let get = |k: u64| m.iter().find(|(x, _)| x == &Value::Uint(k)).and_then(|(_, v)| match v {
        Value::Bytes(b) if b.len() == 32 => Some(hex::encode(b)),
        _ => None,
    });
    to_js(&PublicationIn { offer: hx(&p.offer), batch: p.batch, leaves: p.leaves.iter().map(hx).collect(), tx: hx(&p.tx), output: p.output, key: get(5), tree: get(6) })
}

/// A leaf of the anchoring cMIP's batch: `H_leaf(act || blind)`.
#[wasm_bindgen(js_name = anchoringLeaf)]
pub fn anchoring_leaf(act: &str, blind: &[u8]) -> R<String> {
    Ok(hx(&mor_anchoring::tree::leaf(&unhex(act)?, &arr::<32>(blind, "the blind")?)))
}

/// A batch of leaves: its root, and each leaf's branch.
#[wasm_bindgen(js_name = anchoringBatch)]
pub fn anchoring_batch(leaves: Vec<String>) -> R<JsValue> {
    #[derive(Serialize)]
    struct Out {
        root: String,
        count: u64,
        branches: Vec<Vec<String>>,
    }
    let ls = leaves.iter().map(|l| unhex(l)).collect::<R<Vec<_>>>()?;
    let b = mor_anchoring::tree::Batch::new(ls).ok_or_else(|| err("a batch is at least one leaf, each once"))?;
    to_js(&Out { root: hx(&b.root()), count: b.count(), branches: (0..b.count()).map(|i| b.branch(i).unwrap().iter().map(hx).collect()).collect() })
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BatchAnchorIn {
    blind: ByteBuf,
    index: u64,
    count: u64,
    branch: Vec<String>,
    key: String,
    tree: Option<String>,
    tx: ByteBuf,
    output: u64,
    block: Option<BlockIn>,
}

/// A batch anchor (the Bitcoin clock Module, "A batch anchor"), encoded.
#[wasm_bindgen(js_name = batchAnchor)]
pub fn batch_anchor(input: JsValue) -> R<Vec<u8>> {
    let a: BatchAnchorIn = from_js(input)?;
    Ok(mor_onchain::clock::BatchAnchor {
        blind: arr::<32>(&a.blind, "the blind")?,
        index: a.index,
        count: a.count,
        branch: a.branch.iter().map(|h| unhex(h)).collect::<R<_>>()?,
        key: x32(&a.key, "the key")?,
        tree: a.tree.as_deref().map(|t| x32(t, "the tree")).transpose()?,
        tx: a.tx.to_vec(),
        output: a.output,
        block: a
            .block
            .map(|b| {
                Ok::<_, JsError>(Block {
                    index: b.index,
                    branch: b.branch.iter().map(|h| arr::<32>(h, "a branch hash")).collect::<R<_>>()?,
                    headers: b.headers.iter().map(|h| arr::<80>(h, "a header")).collect::<R<_>>()?,
                })
            })
            .transpose()?,
    }
    .encode())
}

/// Check a batch anchor of an act on the Bitcoin clock, against the chain
/// the client follows (the Bitcoin clock Module's rule): `{ answer, why,
/// point }`, the point the block's height where valid.
#[wasm_bindgen(js_name = batchAnchorCheck)]
pub fn batch_anchor_check(act: &str, proof: &[u8], chain: JsValue) -> R<JsValue> {
    #[derive(Serialize)]
    struct Out {
        answer: &'static str,
        why: String,
        point: Option<u64>,
    }
    let Some(chain) = header_chain(from_js::<Option<ChainIn>>(chain)?.as_ref())? else {
        return to_js(&Out { answer: "unknown", why: "no chain followed: an anchor cannot be checked here".into(), point: None });
    };
    let clock = mor_onchain::clock::BitcoinClock { chain: &chain };
    match clock.batch_anchor(&unhex(act)?, proof) {
        Ok(a) => to_js(&Out { answer: "valid", why: String::new(), point: Some(a.point) }),
        Err(a) => {
            let v = Verdict::of(&a);
            to_js(&Out { answer: v.answer, why: v.why, point: None })
        }
    }
}
