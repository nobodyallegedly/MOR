//! # mor-wasm
//!
//! The core library for the TypeScript clients, through WebAssembly
//! (build brief, component 3: "TypeScript, with the core via WebAssembly").
//! Everything that makes or judges an act is the core library's own code:
//! the clients never re-implement CBOR, hashes, signatures, the identity
//! checks or X-Wing. They only fetch, store and show.
//!
//! Conventions across the boundary: hashes (act ids, identity hashes, spec
//! hashes) are lowercase hex strings, as in the relay transport's URLs;
//! everything larger (acts, keys, containers) is a `Uint8Array`. Errors are
//! thrown as plain-text strings.
//!
//! Unlike the core library, these bindings draw fresh randomness (keys,
//! salts, nonces, content keys) from the platform (`crypto.getRandomValues`),
//! except where the caller passes it, which the tests do so that a second
//! X-Wing implementation can re-make every key exchange.

use mor_core::act::{self, Act, Addressing, Inside, Object, Ref, Scheme};
use mor_core::cbor::{self, Value};
use mor_core::chain::{self, How, Status, Stop};
use mor_core::envelope::{
    self, DecKey, EncKey, EncryptionKey, KeyDelivery, Recipient, Route, Routes, SealRandom, Sealed,
    Version,
};
use mor_core::hash::Hash;
use mor_core::identity::{
    self, Genesis, Home, HomeRule, KeptTip, Payload, Rotation, SafetyCommit, SigningKey,
};
use mor_core::finance;
use mor_core::law;
use mor_core::mmr;
use mor_core::sig::{self, SchnorrKey, SlhKey};
use mor_core::xwing;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

type R<T> = Result<T, JsError>;

fn err(s: impl std::fmt::Display) -> JsError {
    JsError::new(&s.to_string())
}

// ---------------------------------------------------------------- helpers

fn random<const N: usize>() -> [u8; N] {
    let mut b = [0u8; N];
    getrandom::getrandom(&mut b).expect("crypto.getRandomValues");
    b
}

fn hx(h: &Hash) -> String {
    hex::encode(h)
}

fn unhex(s: &str) -> R<Hash> {
    let v = hex::decode(s).map_err(|_| err(format!("not a hex hash: {s}")))?;
    v.try_into()
        .map_err(|_| err(format!("a hash is 32 bytes: {s}")))
}

fn arr<const N: usize>(b: &[u8], what: &str) -> R<[u8; N]> {
    b.try_into()
        .map_err(|_| err(format!("{what} must be {N} bytes")))
}

fn from_js<T: for<'de> Deserialize<'de>>(v: JsValue) -> R<T> {
    serde_wasm_bindgen::from_value(v).map_err(err)
}

fn to_js<T: Serialize>(v: &T) -> R<JsValue> {
    v.serialize(&serde_wasm_bindgen::Serializer::new().serialize_maps_as_objects(true))
        .map_err(err)
}

/// A valid Schnorr secret, fresh.
fn schnorr_secret() -> [u8; 32] {
    loop {
        let s = random::<32>();
        if SchnorrKey::from_secret(&s).is_some() {
            return s;
        }
    }
}

fn schnorr(secret: &[u8]) -> R<SchnorrKey> {
    SchnorrKey::from_secret(&arr::<32>(secret, "a signing secret")?)
        .ok_or_else(|| err("not a valid signing secret"))
}

fn slh(scheme: u8, seeds: &[u8]) -> R<SlhKey> {
    if !(2..=3).contains(&scheme) {
        return Err(err("safety schemes are 2 (SLH-DSA-SHA2-128s) and 3 (128f)"));
    }
    let s = arr::<48>(seeds, "safety seeds")?;
    Ok(SlhKey::from_seeds(
        scheme,
        s[..16].try_into().unwrap(),
        s[16..32].try_into().unwrap(),
        s[32..].try_into().unwrap(),
    ))
}

fn salt() -> [u8; 16] {
    random::<16>()
}

fn payload_of(bytes: &[u8]) -> R<Vec<(Value, Value)>> {
    match cbor::decode(bytes).map_err(err)? {
        Value::Map(m) => Ok(m),
        _ => Err(err("a payload is a map")),
    }
}

// ---------------------------------------------------------------- CBOR <-> JS

/// Decode deterministic CBOR into JavaScript values: maps become `Map`s
/// (keys kept as numbers), byte strings `Uint8Array`s, integers numbers (or
/// `BigInt` beyond 2^53), text strings, arrays, booleans and null. Used for
/// the relay transport's messages.
#[wasm_bindgen(js_name = cborDecode)]
pub fn cbor_decode(bytes: &[u8]) -> R<JsValue> {
    let v = cbor::decode(bytes).map_err(err)?;
    value_to_js(&v)
}

fn value_to_js(v: &Value) -> R<JsValue> {
    Ok(match v {
        Value::Uint(n) if *n <= (1u64 << 53) => JsValue::from_f64(*n as f64),
        Value::Uint(n) => js_sys::BigInt::from(*n).into(),
        Value::Nint(n) => {
            // -1 - n
            let x = -1i128 - *n as i128;
            if x >= -(1i128 << 53) {
                JsValue::from_f64(x as f64)
            } else {
                js_sys::BigInt::from(x as i64).into()
            }
        }
        Value::Bytes(b) => js_sys::Uint8Array::from(b.as_slice()).into(),
        Value::Text(t) => JsValue::from_str(t),
        Value::Array(a) => {
            let out = js_sys::Array::new();
            for x in a {
                out.push(&value_to_js(x)?);
            }
            out.into()
        }
        Value::Map(m) => {
            let out = js_sys::Map::new();
            for (k, x) in m {
                out.set(&value_to_js(k)?, &value_to_js(x)?);
            }
            out.into()
        }
        Value::Bool(b) => JsValue::from_bool(*b),
        Value::Null => JsValue::NULL,
        other => return Err(err(format!("not carried to JavaScript: {other:?}"))),
    })
}

/// Encode JavaScript values as deterministic CBOR: the inverse of
/// [`cbor_decode`], for non-negative integers, `Uint8Array`, strings,
/// arrays, `Map`s, booleans and null.
#[wasm_bindgen(js_name = cborEncode)]
pub fn cbor_encode(v: JsValue) -> R<Vec<u8>> {
    Ok(cbor::encode(&js_to_value(&v)?))
}

fn js_to_value(v: &JsValue) -> R<Value> {
    if v.is_null() {
        return Ok(Value::Null);
    }
    if let Some(b) = v.as_bool() {
        return Ok(Value::Bool(b));
    }
    if let Some(n) = v.as_f64() {
        if n >= 0.0 && n.fract() == 0.0 && n <= (1u64 << 53) as f64 {
            return Ok(Value::Uint(n as u64));
        }
        return Err(err("only non-negative integers are encoded"));
    }
    if v.is_bigint() {
        let n = u64::try_from(js_sys::BigInt::from(v.clone()))
            .map_err(|_| err("a BigInt out of range"))?;
        return Ok(Value::Uint(n));
    }
    if let Some(s) = v.as_string() {
        return Ok(Value::Text(s));
    }
    if v.is_instance_of::<js_sys::Uint8Array>() {
        return Ok(Value::Bytes(js_sys::Uint8Array::from(v.clone()).to_vec()));
    }
    if js_sys::Array::is_array(v) {
        return js_sys::Array::from(v)
            .iter()
            .map(|x| js_to_value(&x))
            .collect::<R<Vec<_>>>()
            .map(Value::Array);
    }
    if v.is_instance_of::<js_sys::Map>() {
        let m = js_sys::Map::from(v.clone());
        let mut out = Vec::new();
        for e in m.entries() {
            let e = js_sys::Array::from(&e.map_err(|_| err("a map entry"))?);
            out.push((js_to_value(&e.get(0))?, js_to_value(&e.get(1))?));
        }
        return Ok(Value::Map(out));
    }
    Err(err("a JavaScript value CBOR cannot carry"))
}

// ---------------------------------------------------------------- keys

#[wasm_bindgen(js_name = randomBytes)]
pub fn random_bytes(n: usize) -> Vec<u8> {
    let mut b = vec![0u8; n];
    getrandom::getrandom(&mut b).expect("crypto.getRandomValues");
    b
}

/// A fresh everyday signing secret (Schnorr, scheme 1).
#[wasm_bindgen(js_name = newSigningSecret)]
pub fn new_signing_secret() -> Vec<u8> {
    schnorr_secret().to_vec()
}

#[wasm_bindgen(js_name = signingPublic)]
pub fn signing_public(secret: &[u8]) -> R<Vec<u8>> {
    Ok(schnorr(secret)?.public().to_vec())
}

#[derive(Serialize)]
struct SafetyOut {
    scheme: u8,
    #[serde(with = "serde_bytes")]
    seeds: Vec<u8>,
    #[serde(with = "serde_bytes")]
    public: Vec<u8>,
    commit: String,
}

/// A fresh safety key held in software: its FIPS 205 seeds (48 bytes), its
/// public key and its commitment. **For test identities only** (build
/// brief: the real identity's safety key is made by the air-gapped Module).
#[wasm_bindgen(js_name = newTestSafetyKey)]
pub fn new_test_safety_key(scheme: u8) -> R<JsValue> {
    safety_from_seeds(scheme, &random::<48>())
}

#[wasm_bindgen(js_name = safetyFromSeeds)]
pub fn safety_from_seeds(scheme: u8, seeds: &[u8]) -> R<JsValue> {
    let k = slh(scheme, seeds)?;
    to_js(&SafetyOut {
        scheme,
        seeds: seeds.to_vec(),
        public: k.public(),
        commit: hx(&k.commitment()),
    })
}

/// A fresh X-Wing private key (32 bytes).
#[wasm_bindgen(js_name = newEncryptionSecret)]
pub fn new_encryption_secret() -> Vec<u8> {
    random::<32>().to_vec()
}

#[wasm_bindgen(js_name = xwingPublic)]
pub fn xwing_public(secret: &[u8]) -> R<Vec<u8>> {
    Ok(xwing::public_key(&arr::<32>(secret, "an X-Wing secret")?))
}

#[derive(Serialize)]
struct Encapsulated {
    #[serde(with = "serde_bytes")]
    ss: Vec<u8>,
    #[serde(with = "serde_bytes")]
    ct: Vec<u8>,
}

#[wasm_bindgen(js_name = xwingEncapsulate)]
pub fn xwing_encapsulate(public: &[u8], eseed: &[u8]) -> R<JsValue> {
    let (ss, ct) = xwing::encapsulate(public, &arr::<64>(eseed, "an eseed")?).map_err(err)?;
    to_js(&Encapsulated {
        ss: ss.to_vec(),
        ct,
    })
}

#[wasm_bindgen(js_name = xwingDecapsulate)]
pub fn xwing_decapsulate(secret: &[u8], ct: &[u8]) -> R<Vec<u8>> {
    Ok(
        xwing::decapsulate(&arr::<32>(secret, "an X-Wing secret")?, ct)
            .map_err(err)?
            .to_vec(),
    )
}

/// The pickup tag of an X-Wing public key used as a bare key.
#[wasm_bindgen(js_name = pickupTag)]
pub fn pickup_tag(public: &[u8]) -> String {
    hx(&EncKey::xwing(public.to_vec()).pickup_tag())
}

// ---------------------------------------------------------------- reading acts

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Described {
    id: String,
    signer: Option<String>,
    binding: Option<String>,
    public: bool,
    to: Option<Vec<String>>,
    /// Present when the inside could be opened (a public act).
    spec: Option<String>,
    #[serde(rename = "type")]
    type_: Option<u64>,
    position: Option<u64>,
    /// `[chain, predecessor]` pairs, when opened.
    objects: Option<Vec<(String, String)>>,
    /// Acts it refers to, by id, when opened.
    refs: Option<Vec<String>>,
    /// Web resources it refers to, `[address, hash or null]`, when opened.
    web_refs: Option<Vec<(String, Option<String>)>>,
    /// Acts by other identities it acknowledges (Envelope, "Acknowledgements"), when opened.
    acks: Option<Vec<String>>,
    #[serde(with = "serde_bytes")]
    payload: Option<Vec<u8>>,
}

fn describe_act(a: &Act, key: Option<&[u8; 32]>) -> Described {
    let inside = a.open(key).ok();
    Described {
        id: hx(&a.id()),
        signer: a.outside.signer.as_ref().map(hx),
        binding: a.outside.binding.as_ref().map(hx),
        public: a.outside.is_public(),
        to: a.outside.to.as_ref().map(|t| t.iter().map(hx).collect()),
        spec: inside.as_ref().map(|i| hx(&i.spec)),
        type_: inside.as_ref().map(|i| i.type_),
        position: inside.as_ref().and_then(|i| i.position),
        objects: inside.as_ref().map(|i| {
            i.objects
                .iter()
                .flatten()
                .map(|o| (hx(&o.chain), hx(&o.predecessor)))
                .collect()
        }),
        refs: inside.as_ref().map(|i| {
            i.refs
                .iter()
                .flatten()
                .filter_map(|r| match r {
                    Ref::Act(h) => Some(hx(h)),
                    Ref::Web { .. } => None,
                })
                .collect()
        }),
        web_refs: inside.as_ref().map(|i| {
            i.refs
                .iter()
                .flatten()
                .filter_map(|r| match r {
                    Ref::Web { address, hash } => Some((address.clone(), hash.as_ref().map(hx))),
                    Ref::Act(_) => None,
                })
                .collect()
        }),
        acks: inside
            .as_ref()
            .map(|i| i.acks.iter().flatten().map(hx).collect()),
        payload: inside.map(|i| cbor::encode(&Value::Map(i.payload))),
    }
}

/// Decode an act (strictly) and describe it. A public act is opened and
/// checked against its outside; its payload is returned as CBOR.
#[wasm_bindgen(js_name = describeAct)]
pub fn describe(bytes: &[u8]) -> R<JsValue> {
    let a = Act::decode(bytes).map_err(err)?;
    to_js(&describe_act(&a, None))
}

/// Check that a string is canonical text (Text MIP), with the pinned Unicode
/// tables; throws naming the rule broken.
#[wasm_bindgen(js_name = checkText)]
pub fn check_text(s: &str) -> R<()> {
    mor_core::text::check(s).map_err(|e| err(format!("not canonical text: {e}")))
}

#[wasm_bindgen(js_name = actId)]
pub fn act_id(bytes: &[u8]) -> R<String> {
    Ok(hx(&Act::decode(bytes).map_err(err)?.id()))
}

#[derive(Deserialize)]
struct DivideIn {
    total: u64,
    holders: Vec<(String, u64)>,
    /// Each holder's leftover units from this stake so far, as the split
    /// service's previous split act for the stake carries them, in the
    /// holders' order (F165, F171): from `Verifier.lawSplitTurns`. Absent:
    /// a tie is reported, not settled.
    #[serde(default)]
    turns: Option<Vec<u64>>,
}

/// Law rule 15a (F150, F165): `{ total, holders: [[hex, share]], turns }`
/// divided among the holders by their shares, each holder its exact share
/// rounded down, leftover units one each to the largest fractional
/// remainders; holders with equal remainders take turns: the fewest
/// leftover units so far (`turns`) first, then the smallest identity hash.
/// The parts, in the holders' order; an error where a tie decides a unit
/// and no turns are given.
#[wasm_bindgen(js_name = lawDivideStake)]
pub fn law_divide_stake(input: JsValue) -> R<Vec<f64>> {
    let i: DivideIn = from_js(input)?;
    let holders = i.holders.iter().map(|(h, n)| Ok((unhex(h)?, *n))).collect::<R<Vec<_>>>()?;
    let ties = match &i.turns {
        Some(t) => law::Ties::Turns(t),
        None => law::Ties::Open,
    };
    let parts = law::divide_stake(i.total, &holders, ties).map_err(|w| JsError::new(&w))?;
    Ok(parts.into_iter().map(|n| n as f64).collect())
}

#[derive(Deserialize)]
struct TallyIn {
    /// What the split pays the stake.
    pot: u64,
    /// The stake's holders, each `[hex, share]`.
    holders: Vec<(String, u64)>,
    /// What the split pays each receiver on the stake, `[hex, amount]`.
    paid: Vec<(String, u64)>,
    /// The running count the previous split for the stake carries, `[hex,
    /// count]`; empty for the first.
    #[serde(default)]
    before: Vec<(String, u64)>,
}

/// Law rule 15a (F165, F171): the running count a split act carries for a
/// stake (field 4, PROPOSED format, to confirm with Nobody, allegedly):
/// `{ pot, holders, paid, before }` gives `before` plus each holder's
/// leftover units in `paid` (what it was paid above its exact share of
/// `pot` rounded down), every holder named, as `[hex, count]` sorted by
/// identity hash.
#[wasm_bindgen(js_name = lawSplitTally)]
pub fn law_split_tally(input: JsValue) -> R<JsValue> {
    let i: TallyIn = from_js(input)?;
    let pairs = |v: &[(String, u64)]| v.iter().map(|(h, n)| Ok((unhex(h)?, *n))).collect::<R<Vec<_>>>();
    let holders = pairs(&i.holders)?;
    let mut before = pairs(&i.before)?;
    before.extend(holders.iter().map(|(h, _)| (*h, 0)));
    let c = law::running_count(&before, &law::leftovers(i.pot, &holders, &pairs(&i.paid)?));
    to_js(&c.iter().map(|(h, n)| (hx(h), *n)).collect::<Vec<_>>())
}

/// The running summary of a sequence of act ids (Envelope, "Sequences").
#[wasm_bindgen(js_name = runningSummary)]
pub fn running_summary(ids: Vec<String>) -> R<String> {
    let ids = ids.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>()?;
    Ok(hx(&mmr::summary(ids.iter())))
}

// ---------------------------------------------------------------- making acts

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct HomeIn {
    operator: Option<String>,
    hint: String,
}

fn homes_of(h: &[HomeIn]) -> R<Vec<Home>> {
    h.iter()
        .map(|h| {
            Ok(Home {
                operator: h.operator.as_deref().map(unhex).transpose()?,
                hint: h.hint.clone(),
            })
        })
        .collect()
}

fn rule_of(r: &[u64]) -> R<HomeRule> {
    match r {
        [0, i] => Ok(HomeRule::Authoritative(*i)),
        [1, k] => Ok(HomeRule::Threshold(*k)),
        _ => Err(err("a home rule is [0, index] or [1, threshold]")),
    }
}

fn identity_inside(spec: Hash, type_: u64, payload: Vec<(Value, Value)>) -> Inside {
    Inside {
        spec,
        type_,
        prev: None,
        objects: None,
        payload,
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: salt(),
    }
}

fn public_addr(signer: Option<Hash>) -> Addressing {
    Addressing {
        signer,
        binding: None,
        public: true,
        to: None,
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct GenesisIn {
    identity_spec: String,
    #[serde(with = "serde_bytes")]
    signing_secret: Vec<u8>,
    safety_scheme: u8,
    safety_commit: String,
    homes: Vec<HomeIn>,
    rule: Option<Vec<u64>>,
    /// High-risk settings of higher MIPs (Identity, declarations slot).
    declarations: Option<Vec<DeclIn>>,
}

/// `declaration = [ spec, kind, value ]`, with a hash as its value (a
/// collective's founding agreement, Law), or null to remove the kind.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct DeclIn {
    spec: String,
    kind: u64,
    value: Option<String>,
    /// For a rotation's Law declaration of a clone: the signature acts that
    /// complete it (Law draft 7, Flaw M): the value is `[clone, [+ hash]]`.
    signatures: Option<Vec<String>>,
    /// For a recovery rotation (C7): the signature acts on the declaration
    /// taking effect there, which it places (Law draft 9, Flaw B18): the
    /// value is `[clone, [+ hash], [+ hash]]`.
    absence: Option<Vec<String>>,
    /// For a rollback (Law rule 37d, F185): the broken act it names, a
    /// rotation of the collective, by its id; the value is then
    /// `[clone, [+ hash], broken, [* hash]]`, with `registers`.
    broken: Option<String>,
    /// For a rollback: the resignations and steppings down it registers,
    /// possibly none.
    registers: Option<Vec<String>>,
    /// Any other value, as its deterministic CBOR (Finance's clock, F176):
    /// given instead of `value`.
    #[serde(default)]
    cbor: Option<serde_bytes::ByteBuf>,
}

fn declarations_of(d: &Option<Vec<DeclIn>>) -> R<Option<Vec<identity::Declaration>>> {
    d.as_ref()
        .map(|v| {
            v.iter()
                .map(|x| {
                    if let Some(c) = &x.cbor {
                        if x.value.is_some() || x.signatures.is_some() || x.absence.is_some() || x.broken.is_some() {
                            return Err(JsError::new("a declaration's value is given once: as a hash or as CBOR"));
                        }
                        return Ok(identity::Declaration {
                            spec: unhex(&x.spec)?,
                            kind: x.kind,
                            value: Some(cbor::decode(c).map_err(|e| JsError::new(&format!("the declaration's CBOR: {e}")))?),
                        });
                    }
                    if x.registers.is_some() && x.broken.is_none() {
                        return Err(JsError::new("a rollback's registrations go with the broken act it names (rule 37d)"));
                    }
                    if let Some(broken) = &x.broken {
                        let (Some(h), Some(sigs), None) = (&x.value, &x.signatures, &x.absence) else {
                            return Err(JsError::new(
                                "a rollback names its clone, the signature acts that complete it, and the broken act (rule 37d)",
                            ));
                        };
                        let list = |v: &[String]| -> R<Value> {
                            Ok(Value::Array(
                                v.iter()
                                    .map(|x| Ok(Value::Bytes(unhex(x)?.to_vec())))
                                    .collect::<R<_>>()?,
                            ))
                        };
                        return Ok(identity::Declaration {
                            spec: unhex(&x.spec)?,
                            kind: x.kind,
                            value: Some(Value::Array(vec![
                                Value::Bytes(unhex(h)?.to_vec()),
                                list(sigs)?,
                                Value::Bytes(unhex(broken)?.to_vec()),
                                list(x.registers.as_deref().unwrap_or(&[]))?,
                            ])),
                        });
                    }
                    Ok(identity::Declaration {
                        spec: unhex(&x.spec)?,
                        kind: x.kind,
                        value: match (&x.value, &x.signatures, &x.absence) {
                            (None, _, _) => None,
                            (Some(h), None, None) => Some(Value::Bytes(unhex(h)?.to_vec())),
                            (Some(_), None, Some(_)) => {
                                return Err(JsError::new(
                                    "a declaration's signatures are named only beside a clone's (Flaw B18)",
                                ))
                            }
                            (Some(h), Some(sigs), absence) => {
                                let list = |v: &[String]| -> R<Value> {
                                    Ok(Value::Array(
                                        v.iter()
                                            .map(|x| Ok(Value::Bytes(unhex(x)?.to_vec())))
                                            .collect::<R<_>>()?,
                                    ))
                                };
                                let mut a = vec![Value::Bytes(unhex(h)?.to_vec()), list(sigs)?];
                                if let Some(ab) = absence {
                                    a.push(list(ab)?);
                                }
                                Some(Value::Array(a))
                            }
                        },
                    })
                })
                .collect()
        })
        .transpose()
}

/// A genesis (Identity type 0), signed by its first signing key, and checked
/// with the core's genesis checks before it is returned.
#[wasm_bindgen(js_name = makeGenesis)]
pub fn make_genesis(input: JsValue) -> R<Vec<u8>> {
    let g: GenesisIn = from_js(input)?;
    let key = schnorr(&g.signing_secret)?;
    let payload = Genesis {
        signing_key: SigningKey {
            scheme: sig::SCHNORR,
            key: key.public().to_vec(),
        },
        safety: SafetyCommit {
            scheme: Scheme::Founding(g.safety_scheme),
            commit: unhex(&g.safety_commit)?,
        },
        homes: homes_of(&g.homes)?,
        rule: g.rule.as_deref().map(rule_of).transpose()?,
        declarations: declarations_of(&g.declarations)?,
        audit: None,
    };
    let inside = identity_inside(
        unhex(&g.identity_spec)?,
        identity::types::GENESIS,
        Payload::Genesis(payload.clone()).to_map(),
    );
    let a = act::make(
        &inside,
        &random::<32>(),
        &random::<24>(),
        &public_addr(None),
        |id| key.sign(id, &random::<32>()),
    );
    identity::check_genesis(&a, &inside, &payload).map_err(err)?;
    Ok(a.encode())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TipIn {
    act: String,
    position: u64,
    summary: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RotationIn {
    identity_spec: String,
    identity: String,
    previous: String,
    position: u64,
    /// The safety key the previous act committed, revealed now.
    safety_scheme: u8,
    #[serde(with = "serde_bytes")]
    safety_seeds: Vec<u8>,
    #[serde(with = "serde_bytes")]
    new_signing_public: Vec<u8>,
    next_safety_scheme: u8,
    next_safety_commit: String,
    kept: Vec<TipIn>,
    homes: Option<Vec<HomeIn>>,
    /// Absent: left in place. `[]`: back to the default (null). Otherwise a rule.
    rule: Option<Vec<u64>>,
    /// New high-risk settings, replacing those of the same kind.
    declarations: Option<Vec<DeclIn>>,
}

/// A rotation (Identity type 1), signed by the revealed safety key.
///
/// The safety key here is held in software: **test identities only**. The
/// signature is hedged (fresh randomness), as the air-gapped Module signs;
/// the caller keeps the returned bytes and sends exactly them to every home
/// (Identity rule 8a).
#[wasm_bindgen(js_name = makeRotation)]
pub fn make_rotation(input: JsValue) -> R<Vec<u8>> {
    let r: RotationIn = from_js(input)?;
    let safety = slh(r.safety_scheme, &r.safety_seeds)?;
    let payload = Rotation {
        prev: unhex(&r.previous)?,
        position: r.position,
        signing_key: SigningKey {
            scheme: sig::SCHNORR,
            key: arr::<32>(&r.new_signing_public, "a signing public key")?.to_vec(),
        },
        safety: SafetyCommit {
            scheme: Scheme::Founding(r.next_safety_scheme),
            commit: unhex(&r.next_safety_commit)?,
        },
        kept: r
            .kept
            .iter()
            .map(|t| {
                Ok(KeptTip {
                    act: unhex(&t.act)?,
                    position: t.position,
                    summary: unhex(&t.summary)?,
                })
            })
            .collect::<R<Vec<_>>>()?,
        disowned: None,
        homes: r.homes.as_deref().map(homes_of).transpose()?,
        rule: match r.rule.as_deref() {
            None => None,
            Some([]) => Some(None),
            Some(x) => Some(Some(rule_of(x)?)),
        },
        declarations: declarations_of(&r.declarations)?,
        successor: None,
        audit: None,
        homeless: false,
        closure: false,
    };
    let inside = identity_inside(
        unhex(&r.identity_spec)?,
        identity::types::ROTATION,
        Payload::Rotation(payload.clone()).to_map(),
    );
    let a = act::make(
        &inside,
        &random::<32>(),
        &random::<24>(),
        &public_addr(Some(unhex(&r.identity)?)),
        |id| safety.sign(id, Some(&random::<16>())),
    );
    identity::check_rotation_shape(&a, &inside, &payload).map_err(err)?;
    Ok(a.encode())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChainSignatureIn {
    identity_spec: String,
    identity: String,
    previous: String,
    position: u64,
    /// The safety key the previous act committed, revealed now.
    safety_scheme: u8,
    #[serde(with = "serde_bytes")]
    safety_seeds: Vec<u8>,
    next_safety_scheme: u8,
    next_safety_commit: String,
    /// The act it signs.
    signs: String,
}

/// A chain signature (Identity type 16, F132): an act on the identity
/// chain, signed by the revealed safety key, naming the act it signs and
/// committing the next safety key; nothing else changes. Law's members sign
/// forks and closings with it.
///
/// The safety key here is held in software: **test identities only**. As
/// for a rotation, the caller keeps the returned bytes and sends exactly
/// them to every home (Identity rule 8a).
#[wasm_bindgen(js_name = makeChainSignature)]
pub fn make_chain_signature(input: JsValue) -> R<Vec<u8>> {
    let c: ChainSignatureIn = from_js(input)?;
    let safety = slh(c.safety_scheme, &c.safety_seeds)?;
    let payload = identity::ChainSignature {
        prev: unhex(&c.previous)?,
        position: c.position,
        safety: SafetyCommit {
            scheme: Scheme::Founding(c.next_safety_scheme),
            commit: unhex(&c.next_safety_commit)?,
        },
        signs: unhex(&c.signs)?,
    };
    let inside = identity_inside(
        unhex(&c.identity_spec)?,
        identity::types::CHAIN_SIGNATURE,
        Payload::ChainSignature(payload).to_map(),
    );
    let a = act::make(
        &inside,
        &random::<32>(),
        &random::<24>(),
        &public_addr(Some(unhex(&c.identity)?)),
        |id| safety.sign(id, Some(&random::<16>())),
    );
    identity::check_chain_signature_shape(&a, &inside, &payload).map_err(err)?;
    Ok(a.encode())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EverydayIn {
    #[serde(with = "serde_bytes")]
    signing_secret: Vec<u8>,
    signer: String,
    binding: String,
    spec: String,
    #[serde(rename = "type")]
    type_: u64,
    #[serde(with = "serde_bytes")]
    payload: Vec<u8>,
    /// The signer's sequence so far, as act ids, oldest first.
    sequence: Vec<String>,
    public: bool,
    to: Option<Vec<String>>,
    /// `[chain, predecessor]` pairs.
    objects: Option<Vec<(String, String)>>,
    /// Acts this one refers to, by id (Envelope, "References").
    refs: Option<Vec<String>>,
    /// Acts this one acknowledges, by id (Envelope, `acks`).
    #[serde(default)]
    acks: Option<Vec<String>>,
}

#[derive(Serialize)]
struct Made {
    #[serde(with = "serde_bytes")]
    act: Vec<u8>,
    id: String,
    /// The content key: kept by the signer of a private act, to deliver.
    #[serde(with = "serde_bytes")]
    key: Vec<u8>,
}

/// An everyday act, next in the signer's sequence: position and running
/// summary computed from the sequence given (Envelope rule 4).
#[wasm_bindgen(js_name = makeEveryday)]
pub fn make_everyday(input: JsValue) -> R<JsValue> {
    let e: EverydayIn = from_js(input)?;
    let key = schnorr(&e.signing_secret)?;
    let seq = e.sequence.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>()?;
    let inside = Inside {
        spec: unhex(&e.spec)?,
        type_: e.type_,
        prev: Some(seq.last().copied().into_iter().collect()),
        objects: e
            .objects
            .map(|o| {
                o.iter()
                    .map(|(c, p)| {
                        Ok(Object {
                            chain: unhex(c)?,
                            predecessor: unhex(p)?,
                        })
                    })
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?,
        payload: payload_of(&e.payload)?,
        position: Some(seq.len() as u64 + 1),
        summary: Some(mmr::summary(seq.iter())),
        acks: e
            .acks
            .map(|a| a.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>())
            .transpose()?,
        refs: e
            .refs
            .map(|r| {
                r.iter()
                    .map(|s| Ok(Ref::Act(unhex(s)?)))
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?,
        hint: None,
        salt: salt(),
    };
    let content_key = random::<32>();
    let addr = Addressing {
        signer: Some(unhex(&e.signer)?),
        binding: Some(unhex(&e.binding)?),
        public: e.public,
        to: e
            .to
            .map(|t| t.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>())
            .transpose()?,
    };
    let a = act::make(&inside, &content_key, &random::<24>(), &addr, |id| {
        key.sign(id, &random::<32>())
    });
    to_js(&Made {
        id: hx(&a.id()),
        act: a.encode(),
        key: content_key.to_vec(),
    })
}

// ---------------------------------------------------------------- payloads

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RouteIn {
    scope: Option<String>,
    hints: Vec<String>,
    #[serde(default)]
    kind: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RoutesIn {
    version: u64,
    previous: Option<String>,
    routes: Vec<RouteIn>,
}

/// A routes payload (Identity type 3), as CBOR.
#[wasm_bindgen(js_name = routesPayload)]
pub fn routes_payload(input: JsValue) -> R<Vec<u8>> {
    let r: RoutesIn = from_js(input)?;
    let routes = Routes {
        version: Version {
            version: r.version,
            previous: r.previous.as_deref().map(unhex).transpose()?,
        },
        routes: r
            .routes
            .iter()
            .map(|x| {
                Ok(Route {
                    scope: x.scope.as_deref().map(unhex).transpose()?,
                    hints: x.hints.clone(),
                    kind: x.kind,
                })
            })
            .collect::<R<Vec<_>>>()?,
    };
    let m = routes.to_map();
    Routes::decode(&m).map_err(err)?;
    Ok(cbor::encode(&Value::Map(m)))
}

/// An encryption-key payload (Envelope type 4), for an X-Wing public key, as CBOR.
#[wasm_bindgen(js_name = encryptionKeyPayload)]
pub fn encryption_key_payload(version: u32, previous: Option<String>, public: &[u8]) -> R<Vec<u8>> {
    let e = EncryptionKey {
        version: Version {
            version: version as u64,
            previous: previous.as_deref().map(unhex).transpose()?,
        },
        key: EncKey::xwing(public.to_vec()),
    };
    let m = e.to_map();
    EncryptionKey::decode(&m).map_err(err)?;
    Ok(cbor::encode(&Value::Map(m)))
}

/// A key-delivery payload (Envelope type 1), as CBOR.
#[wasm_bindgen(js_name = keyDeliveryPayload)]
pub fn key_delivery_payload(target: &str, key: &[u8], media: bool) -> R<Vec<u8>> {
    let d = KeyDelivery {
        target: unhex(target)?,
        key: arr::<32>(key, "a content key")?,
        media,
    };
    Ok(cbor::encode(&Value::Map(d.to_map())))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DeliveryOut {
    target: String,
    #[serde(with = "serde_bytes")]
    key: Vec<u8>,
    media: bool,
}

#[wasm_bindgen(js_name = readKeyDelivery)]
pub fn read_key_delivery(payload: &[u8]) -> R<JsValue> {
    let d = KeyDelivery::decode(&payload_of(payload)?).map_err(err)?;
    to_js(&DeliveryOut {
        target: hx(&d.target),
        key: d.key.to_vec(),
        media: d.media,
    })
}

/// Open a private act with a delivered key, and describe it.
#[wasm_bindgen(js_name = openWithKey)]
pub fn open_with_key(act: &[u8], key: &[u8]) -> R<JsValue> {
    let a = Act::decode(act).map_err(err)?;
    let k = arr::<32>(key, "a content key")?;
    a.open(Some(&k)).map_err(err)?;
    to_js(&describe_act(&a, Some(&k)))
}

// ---------------------------------------------------------------- sealed containers

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecipientIn {
    /// The recipient identity; absent for a bare key.
    id: Option<String>,
    #[serde(with = "serde_bytes")]
    key: Vec<u8>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RandomIn {
    #[serde(with = "serde_bytes")]
    container_key: Vec<u8>,
    #[serde(with = "serde_bytes")]
    nonce: Vec<u8>,
    eseeds: Vec<serde_bytes::ByteBuf>,
    #[serde(with = "serde_bytes")]
    one_time_secret: Vec<u8>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SealIn {
    #[serde(with = "serde_bytes")]
    act: Vec<u8>,
    #[serde(default, with = "serde_bytes")]
    key: Option<Vec<u8>>,
    recipients: Vec<RecipientIn>,
    random: Option<RandomIn>,
}

/// Seal an act, with its content key if private, for its recipients
/// (Envelope, "Sealed containers"). Randomness is drawn fresh unless given.
#[wasm_bindgen(js_name = seal)]
pub fn seal(input: JsValue) -> R<Vec<u8>> {
    let s: SealIn = from_js(input)?;
    let a = Act::decode(&s.act).map_err(err)?;
    let key = s
        .key
        .as_deref()
        .map(|k| arr::<32>(k, "a content key"))
        .transpose()?;
    let recipients = s
        .recipients
        .iter()
        .map(|r| {
            let key = EncKey::xwing(r.key.clone());
            Ok(match &r.id {
                Some(id) => Recipient::Identity {
                    id: unhex(id)?,
                    key,
                },
                None => Recipient::Bare(key),
            })
        })
        .collect::<R<Vec<_>>>()?;
    let rnd = match s.random {
        Some(r) => SealRandom {
            container_key: arr::<32>(&r.container_key, "a container key")?,
            nonce: arr::<24>(&r.nonce, "a nonce")?,
            eseeds: r
                .eseeds
                .iter()
                .map(|e| arr::<64>(e, "an eseed"))
                .collect::<R<Vec<_>>>()?,
            one_time_secret: arr::<32>(&r.one_time_secret, "a one-time secret")?,
            aux: random::<32>(),
        },
        None => SealRandom {
            container_key: random::<32>(),
            nonce: random::<24>(),
            eseeds: recipients.iter().map(|_| random::<64>()).collect(),
            one_time_secret: schnorr_secret(),
            aux: random::<32>(),
        },
    };
    Ok(envelope::seal(&a, key.as_ref(), &recipients, &rnd)
        .map_err(err)?
        .encode())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SealedParts {
    to: Vec<String>,
    capsules: Vec<serde_bytes::ByteBuf>,
}

/// What anyone can read of a sealed container: its recipients, and the
/// X-Wing ciphertext of each capsule.
#[wasm_bindgen(js_name = sealedParts)]
pub fn sealed_parts(bytes: &[u8]) -> R<JsValue> {
    let s = Sealed::decode(bytes).map_err(err)?;
    s.check_signature().map_err(err)?;
    let (capsules, _, _) = s.parts().map_err(err)?;
    to_js(&SealedParts {
        to: s.to.iter().map(hx).collect(),
        capsules: capsules
            .into_iter()
            .map(|c| serde_bytes::ByteBuf::from(c.ct))
            .collect(),
    })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenedOut {
    #[serde(with = "serde_bytes")]
    act: Vec<u8>,
    #[serde(with = "serde_bytes")]
    key: Option<Vec<u8>>,
    described: Described,
}

/// Open a sealed container with an X-Wing private key, as the identity `me`
/// (hex), or as a bare key when `me` is absent.
#[wasm_bindgen(js_name = openSealed)]
pub fn open_sealed(bytes: &[u8], me: Option<String>, secret: &[u8]) -> R<JsValue> {
    let s = Sealed::decode(bytes).map_err(err)?;
    let me = me.as_deref().map(unhex).transpose()?;
    let dk = DecKey::from_secret(arr::<32>(secret, "an X-Wing secret")?);
    let o = envelope::open(&s, me.as_ref(), &dk).map_err(err)?;
    let described = describe_act(&o.act, o.key.as_ref());
    to_js(&OpenedOut {
        act: o.act.encode(),
        key: o.key.map(|k| k.to_vec()),
        described,
    })
}

// ---------------------------------------------------------------- the verifier

/// The core library's verifier: holds the acts a client fetched, and judges
/// identity chains and acts from them alone (Identity, "Verification
/// procedures"). Nothing a relay says unsigned enters it.
#[wasm_bindgen]
pub struct Verifier {
    inner: chain::Verifier,
    held: Vec<Hash>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LinkOut {
    act: String,
    position: usize,
    how: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HomeOut {
    operator: Option<String>,
    hint: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ResolutionOut {
    identity: String,
    links: Vec<LinkOut>,
    /// Why the chain ends: "no-genesis", "unknown", "invalid", "end",
    /// "pending", "contested".
    stop: String,
    waiting: Vec<String>,
    contested: Vec<u64>,
    /// The state the latest counting act leaves.
    signing_key: Option<serde_bytes::ByteBuf>,
    safety_scheme: Option<u8>,
    safety_commit: Option<String>,
    homes: Vec<HomeOut>,
    rule: Option<Vec<u64>>,
    /// The effective rule, in words.
    effective: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LatestOut {
    act: Option<String>,
    contested: bool,
    #[serde(with = "serde_bytes")]
    payload: Option<Vec<u8>>,
}

fn how(h: &How) -> String {
    match h {
        How::Genesis => "genesis".into(),
        How::Homes => "homes".into(),
        How::OwnSignatures => "own signatures".into(),
        How::Homeless { basis, final_ } => format!(
            "homeless ({}{})",
            match basis {
                chain::Basis::Escape => "escape",
                chain::Basis::Gone => "old homes gone",
                chain::Basis::OwnAttempt => "re-homed without audit",
            },
            if *final_ { ", final" } else { "" }
        ),
    }
}

#[wasm_bindgen]
impl Verifier {
    /// A verifier for the given Identity spec hash (`IDENTITY`; a test value
    /// until the freeze). Given the Finance and Law spec hashes too, it can
    /// tell which acts may carry acknowledgements (F110); without them, an
    /// act of another specification carrying `acks` is unknown to it.
    #[wasm_bindgen(constructor)]
    pub fn new(identity_spec: &str, finance_spec: Option<String>, law_spec: Option<String>) -> R<Verifier> {
        let identity = unhex(identity_spec)?;
        let inner = match (finance_spec, law_spec) {
            (Some(f), Some(l)) => chain::Verifier::with_mips(identity, unhex(&f)?, unhex(&l)?),
            (None, None) => chain::Verifier::new(identity),
            _ => return Err(JsError::new("give both the Finance and the Law spec hashes, or neither")),
        };
        Ok(Verifier { inner, held: vec![] })
    }

    /// Hold an act. Returns its id. A malformed act is refused; a validly
    /// shaped act with a bad signature is held and judged invalid.
    pub fn add(&mut self, bytes: &[u8]) -> R<String> {
        let a = Act::decode(bytes).map_err(err)?;
        let id = self.inner.add(a).map_err(err)?;
        if !self.held.contains(&id) {
            self.held.push(id);
        }
        Ok(hx(&id))
    }

    /// Hold a private act, opened with its content key.
    #[wasm_bindgen(js_name = addWithKey)]
    pub fn add_with_key(&mut self, bytes: &[u8], key: &[u8]) -> R<String> {
        let a = Act::decode(bytes).map_err(err)?;
        let k = arr::<32>(key, "a content key")?;
        let id = self.inner.add_with_key(a, Some(&k)).map_err(err)?;
        if !self.held.contains(&id) {
            self.held.push(id);
        }
        Ok(hx(&id))
    }

    /// Record that this client itself tried and failed to reach an operator's home.
    #[wasm_bindgen(js_name = failedToReach)]
    pub fn failed_to_reach(&mut self, operator: &str) -> R<()> {
        self.inner.failed_to_reach(unhex(operator)?);
        Ok(())
    }

    /// The home quorum of a counting rotation (Finance rule 15, F180): the
    /// receipts the home rule in effect before it requires, each passing
    /// the receipt checks, per home operator, and how many operators are
    /// needed. `kind` is "own" (it counts on its own signatures: anchor the
    /// rotation itself), "homes", or "homeless" (the new homes' receipts,
    /// under the new home rule, F182); null where it is not a counting
    /// rotation. *The owner's client anchors these after a lock
    /// change (Finance rule 15, F181).*
    pub fn quorum(&self, identity: &str, rotation: &str) -> R<JsValue> {
        #[derive(Serialize)]
        struct Out {
            kind: &'static str,
            need: u64,
            supports: Vec<Vec<String>>,
        }
        let q = self.inner.quorum(&unhex(identity)?, &unhex(rotation)?);
        to_js(&q.map(|q| match q {
            chain::Quorum::Own => Out { kind: "own", need: 1, supports: vec![vec![rotation.to_string()]] },
            chain::Quorum::Homeless { need, supports } => Out { kind: "homeless", need, supports: supports.iter().map(|s| s.iter().map(hx).collect()).collect() },
            chain::Quorum::Homes { need, supports } => Out { kind: "homes", need, supports: supports.iter().map(|s| s.iter().map(hx).collect()).collect() },
        }))
    }

    /// Which act counts at each position of an identity chain.
    pub fn resolve(&self, identity: &str) -> R<JsValue> {
        let res = self.inner.resolve(&unhex(identity)?);
        let (stop, waiting) = match &res.stop {
            Stop::NoGenesis => ("no-genesis", vec![]),
            Stop::Unknown => ("unknown", vec![]),
            Stop::Invalid => ("invalid", vec![]),
            Stop::End => ("end", vec![]),
            Stop::Pending(w) => ("pending", w.clone()),
            Stop::Contested(w) => ("contested", w.clone()),
        };
        let latest = res.latest().map(|(_, s)| s.clone());
        to_js(&ResolutionOut {
            identity: hx(&res.identity),
            links: res
                .links
                .iter()
                .enumerate()
                .map(|(i, l)| LinkOut {
                    act: hx(&l.act),
                    position: i,
                    how: how(&l.how),
                })
                .collect(),
            stop: stop.into(),
            waiting: waiting.iter().map(hx).collect(),
            contested: res.contested.clone(),
            signing_key: latest
                .as_ref()
                .map(|s| serde_bytes::ByteBuf::from(s.signing_key.key.clone())),
            safety_scheme: latest.as_ref().map(|s| match s.safety.scheme {
                Scheme::Founding(n) => n,
                Scheme::Spec(_) => 0,
            }),
            safety_commit: latest.as_ref().map(|s| hx(&s.safety.commit)),
            homes: latest
                .as_ref()
                .map(|s| {
                    s.homes
                        .iter()
                        .map(|h| HomeOut {
                            operator: h.operator.as_ref().map(hx),
                            hint: h.hint.clone(),
                        })
                        .collect()
                })
                .unwrap_or_default(),
            rule: latest.as_ref().and_then(|s| {
                s.rule.map(|r| match r {
                    HomeRule::Authoritative(i) => vec![0, i],
                    HomeRule::Threshold(k) => vec![1, k],
                })
            }),
            effective: latest.as_ref().map(|s| format!("{:?}", s.effective())),
        })
    }

    /// The standing of an act held: "valid", "disputed", "void", "pending",
    /// "invalid", "unknown", or "scoped" (signed with a key a higher MIP's
    /// act installs, a grant key: Law judges it, F128).
    pub fn status(&self, act: &str) -> R<String> {
        Ok(match self.inner.status(&unhex(act)?) {
            Status::Valid => "valid",
            Status::Disputed => "disputed",
            Status::Void => "void",
            Status::Pending => "pending",
            Status::Invalid => "invalid",
            Status::Unknown => "unknown",
            Status::Scoped => "scoped",
        }
        .into())
    }

    /// The standing of an act for everything binding (keeper records,
    /// payments, discharge of debts, agreements, forks, closings): as
    /// `status`, except "unknown" where the answer rests on this client's
    /// own failed attempts to reach homes ("re-homed without audit") or on
    /// what it found at homes (`foundAtHome`), until it no longer does
    /// (Identity, the sentence after rule 17, F153, F159).
    /// Reading and following an identity use `status`.
    #[wasm_bindgen(js_name = bindingStatus)]
    pub fn binding_status(&self, act: &str) -> R<String> {
        Ok(match self.inner.binding_status(&unhex(act)?) {
            Status::Valid => "valid",
            Status::Disputed => "disputed",
            Status::Void => "void",
            Status::Pending => "pending",
            Status::Invalid => "invalid",
            Status::Unknown => "unknown",
            Status::Scoped => "scoped",
        }
        .into())
    }

    /// Record that this client found the act, in its sealed form, at the
    /// home operated by `home` (the operator's identity hash; for a
    /// self-hosted home, the identity itself). A private link act counts
    /// only if found at a home its signer's chain names at its binding;
    /// otherwise it is unknown, never invalid. What was found is this
    /// client's own input: `bindingStatus` shows an answer resting on it
    /// as unknown (Identity, "The envelope", F152, F159).
    #[wasm_bindgen(js_name = foundAtHome)]
    pub fn found_at_home(&mut self, act: &str, home: &str) -> R<()> {
        self.inner.found_at_home(unhex(act)?, unhex(home)?);
        Ok(())
    }

    /// A link between two MOR identities as the act `seenBy` sees it
    /// (Identity rules 23 and 24, F152): "not linked", "linked", "ended"
    /// (`seenBy` holds a termination in its history) or "unknown".
    pub fn link(&self, claim: &str, seen_by: &str) -> R<String> {
        Ok(match self.inner.link(&unhex(claim)?, &unhex(seen_by)?) {
            chain::LinkSeen::NotLinked => "not linked",
            chain::LinkSeen::Linked { .. } => "linked",
            chain::LinkSeen::Ended { .. } => "ended",
            chain::LinkSeen::Unknown => "unknown",
        }
        .into())
    }

    /// The routes act (Identity type 3) or encryption-key act (Envelope type
    /// 4) that counts for an identity: its valid acts of that spec and type,
    /// followed from version 1 (Identity, "Routes"; Envelope, "Encryption
    /// key"). Returns the act, whether the chain is contested past it, and
    /// its payload as CBOR.
    pub fn latest(&self, identity: &str, spec: &str, type_: u32) -> R<JsValue> {
        let id = unhex(identity)?;
        let spec = unhex(spec)?;
        let mut entries = vec![];
        for h in &self.held {
            let Some(held) = self.inner.get(h) else {
                continue;
            };
            if held.act.outside.signer != Some(id)
                || held.inside.spec != spec
                || held.inside.type_ != type_ as u64
            {
                continue;
            }
            if self.inner.status(h) != Status::Valid {
                continue;
            }
            let fields: Vec<(u64, &Value)> = held
                .inside
                .payload
                .iter()
                .filter_map(|(k, v)| match k {
                    Value::Uint(n) => Some((*n, v)),
                    _ => None,
                })
                .collect();
            let version = match (
                fields.iter().find(|f| f.0 == 0),
                fields.iter().find(|f| f.0 == 1),
            ) {
                (Some((_, Value::Uint(n))), prev) => Version {
                    version: *n,
                    previous: match prev {
                        Some((_, Value::Bytes(b))) => b.as_slice().try_into().ok(),
                        _ => None,
                    },
                },
                _ => continue,
            };
            // Only acts whose payload decodes in the type's shape take part.
            let ok = match type_ {
                3 => Routes::decode(&held.inside.payload).is_ok(),
                4 => EncryptionKey::decode(&held.inside.payload).is_ok(),
                _ => {
                    return Err(err(
                        "versioned chains are routes (3) and encryption keys (4)",
                    ))
                }
            };
            if ok {
                entries.push((*h, version));
            }
        }
        let l = envelope::latest(&entries);
        let payload = l
            .act
            .and_then(|a| self.inner.get(&a))
            .map(|h| cbor::encode(&Value::Map(h.inside.payload.clone())));
        to_js(&LatestOut {
            act: l.act.as_ref().map(hx),
            contested: l.contested,
            payload,
        })
    }

    /// Every act held, by id.
    pub fn held(&self) -> Vec<String> {
        self.held.iter().map(hx).collect()
    }
}

// ---------------------------------------------------------------- Law (Law draft 7)

/// A Law error, with a stable code before its words (`law/check: ...`), so
/// that clients read the code and never match the wording.
fn lerr(e: law::LawError) -> JsError {
    JsError::new(&format!("law/{}: {e}", e.code()))
}

/// The six MIPs' spec hashes, the layers each extension declares
/// (Production field 10, read by the caller from the specifications it
/// holds), and each keeper operator's records in order (Law type 2 is still
/// open, so a client states what it holds).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SpecsIn {
    identity: String,
    envelope: String,
    text: String,
    finance: String,
    law: String,
    production: String,
    #[serde(default)]
    ext_layers: std::collections::BTreeMap<String, Vec<u64>>,
    #[serde(default)]
    keeper_logs: std::collections::BTreeMap<String, Vec<String>>,
    /// The rail Modules the client read, in their specifications, as push
    /// rails (F128, W4): the payer pays an address, with no request from
    /// the payee's side committing to each payment. Every other rail is a
    /// request rail. (Where the client found an act is never a condition of
    /// validity, F128: it states it to its user as information only.)
    #[serde(default)]
    push_rails: Vec<String>,
    /// Receipts and claims whose rail proof the client checked under the
    /// payment cMIP and found not to carry the commitment recomputed from
    /// them (F131, IT3): wrong receipts, counting for nothing.
    #[serde(default)]
    rail_invalid: Vec<String>,
    /// Absence proof (Law rule 51, F172): pairs `[declaration, act]`, an
    /// abandonment declaration and the record or clone using it, that the
    /// absence-proof cMIP its clause names (key 3) accepted, as the client
    /// read that cMIP's answer. Under such a clause a declaration counts
    /// only where listed; with none, it is the authority's judgment.
    #[serde(default)]
    absence_accepted: Vec<(String, String)>,
    /// The specifications the client read as the relay transport cMIP,
    /// draft 3 or later, whose act type 0 is a relay's delivery record
    /// (F184): where listed, the object the record names is checked against
    /// the payment's. Any act offered as evidence for a role share counts
    /// only where the payer the payment commits to acknowledges it,
    /// whether listed or not (Law rules 19, 22; QG3, F193, F194).
    #[serde(default)]
    delivery_records: Vec<String>,
    /// The chain of judgment for a deal's judge of forks (Law rule 34a;
    /// QG4): pairs `[settlement request, judge]` whose period to act on
    /// that request has passed on the deal's time reference with no
    /// settlement of theirs, as the client read that time reference.
    #[serde(default)]
    judges_lapsed: Vec<(String, String)>,
    /// Notices to a payer owed money back (Law type 24; F197) whose
    /// deadline has passed on their time reference with no address given,
    /// as the client read that time reference.
    #[serde(default)]
    notices_lapsed: Vec<String>,
}

impl SpecsIn {
    fn mips(&self) -> R<law::Mips> {
        Ok(law::Mips {
            identity: unhex(&self.identity)?,
            envelope: unhex(&self.envelope)?,
            text: unhex(&self.text)?,
            finance: unhex(&self.finance)?,
            law: unhex(&self.law)?,
            production: unhex(&self.production)?,
        })
    }

    fn ext(&self) -> R<std::collections::BTreeMap<Hash, Vec<u64>>> {
        self.ext_layers
            .iter()
            .map(|(k, v)| Ok((unhex(k)?, v.clone())))
            .collect()
    }

    fn view<'a>(&self, v: &'a chain::Verifier) -> R<law::LawView<'a>> {
        let mut view = law::LawView::new(v, self.mips()?);
        view.ext_layers = self.ext()?;
        for (k, log) in &self.keeper_logs {
            view.keeper_logs
                .insert(unhex(k)?, log.iter().map(|x| unhex(x)).collect::<R<_>>()?);
        }
        for r in &self.push_rails {
            view.push_rails.insert(unhex(r)?);
        }
        for r in &self.rail_invalid {
            view.rail_invalid.insert(unhex(r)?);
        }
        for (d, by) in &self.absence_accepted {
            view.absence_accepted.insert((unhex(d)?, unhex(by)?));
        }
        for r in &self.delivery_records {
            view.delivery_records.insert(unhex(r)?);
        }
        for (r, j) in &self.judges_lapsed {
            view.judges_lapsed.insert((unhex(r)?, unhex(j)?));
        }
        for n in &self.notices_lapsed {
            view.notices_lapsed.insert(unhex(n)?);
        }
        Ok(view)
    }
}

fn specs_of(v: JsValue) -> R<SpecsIn> {
    from_js(v)
}

/// Check a terms payload (Law type 0), given as CBOR: its format and every
/// check that needs no other act (key grammar, areas, judges, F105 for
/// founding terms). Throws `law/<code>: <why>`.
#[wasm_bindgen(js_name = checkTerms)]
pub fn check_terms(payload: &[u8], specs: JsValue) -> R<()> {
    let s = specs_of(specs)?;
    let t = law::Terms::decode(&payload_of(payload)?).map_err(lerr)?;
    t.check(&s.mips()?).map_err(lerr)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HoldingOut {
    /// "one", "shares" or "custodian".
    form: String,
    holder: Option<String>,
    threshold: Option<u64>,
    members: Option<Vec<String>>,
    custodian: Option<String>,
    grant: Option<String>,
}

fn holding_out(h: &law::Holding) -> HoldingOut {
    let mut o = HoldingOut {
        form: String::new(),
        holder: None,
        threshold: None,
        members: None,
        custodian: None,
        grant: None,
    };
    match h {
        law::Holding::One(x) => {
            o.form = "one".into();
            o.holder = Some(hx(x));
        }
        law::Holding::Shares { threshold, members } => {
            o.form = "shares".into();
            o.threshold = Some(*threshold);
            o.members = Some(members.iter().map(hx).collect());
        }
        law::Holding::Custodian { custodian, grant } => {
            o.form = "custodian".into();
            o.custodian = Some(hx(custodian));
            o.grant = Some(hx(grant));
        }
    }
    o
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecoveryOut {
    /// "custodian" or "escrow".
    form: String,
    custodian: Option<String>,
    grant: Option<String>,
    authority: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GrammarOut {
    signing: HoldingOut,
    safety: HoldingOut,
    recovery: Option<RecoveryOut>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AbandonmentOut {
    /// "named" (an identity) or "others" (a threshold of the other parties).
    authority: String,
    identity: Option<String>,
    threshold: Option<u64>,
    outcomes: Vec<u64>,
    /// Key 3: the absence-proof cMIP standing between the authority's word
    /// and the party's stake, if the clause names one (F172).
    proof: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SuccessionOut {
    party: String,
    stakes: Option<Vec<(String, u64)>>,
    seats: Option<Vec<(String, u64)>>,
    entry: Option<u64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct KindOut {
    /// "layer" or "type".
    form: String,
    layer: Option<u64>,
    spec: Option<String>,
    #[serde(rename = "type")]
    type_: Option<u64>,
}

fn kind_out(k: &law::Kind) -> KindOut {
    match k {
        law::Kind::Layer(l) => KindOut {
            form: "layer".into(),
            layer: Some(*l),
            spec: None,
            type_: None,
        },
        law::Kind::Type { spec, type_ } => KindOut {
            form: "type".into(),
            layer: None,
            spec: Some(hx(spec)),
            type_: Some(*type_),
        },
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct FieldRefOut {
    /// "field" or "task".
    form: String,
    number: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AreaOut {
    id: u64,
    name: String,
    holders: Vec<String>,
    threshold: u64,
    kinds: Vec<KindOut>,
    fields: Vec<FieldRefOut>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PowerOut {
    /// "constitutional", "clone", "area", "plan" or "judicial".
    form: String,
    area: Option<u64>,
    party: Option<String>,
}

fn power_out(p: &law::Power) -> PowerOut {
    let (form, area, party) = match p {
        law::Power::Constitutional => ("constitutional", None, None),
        law::Power::Clone => ("clone", None, None),
        law::Power::Area(a) => ("area", Some(*a), None),
        law::Power::Plan(h) => ("plan", None, Some(hx(h))),
        law::Power::Judicial => ("judicial", None, None),
    };
    PowerOut {
        form: form.into(),
        area,
        party,
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MarkOut {
    power: PowerOut,
    signers: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProblemOut {
    /// "shape", "unsupported", "check", "missing" or "unsettled".
    code: String,
    text: String,
}

fn problem(e: &law::LawError) -> ProblemOut {
    ProblemOut {
        code: e.code().into(),
        text: e.to_string(),
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TermsOut {
    parties: Vec<String>,
    text: String,
    cmips: Vec<(u64, String)>,
    keepers: Option<(Vec<String>, RuleOut)>,
    /// Founding terms: the signing rule (field 4).
    signing: Option<RuleOut>,
    /// A clone: its mark (field 4), each power claimed and its signers.
    mark: Option<Vec<MarkOut>>,
    clone: RuleOut,
    /// The constitutional change rule (field 18); null: every party.
    constitutional: Option<RuleOut>,
    areas: Vec<AreaOut>,
    /// Each area's own words, by id.
    area_words: Vec<(u64, String)>,
    /// The time reference's cMIP; its parameters are that cMIP's to read.
    time: Option<String>,
    abandonment: Option<AbandonmentOut>,
    parent: Option<String>,
    grammar: Option<GrammarOut>,
    arbitrators: Option<Vec<String>>,
    split_grant: Option<String>,
    /// Field 14 in a deal: each payee's grant to the split service (F129, H4).
    payee_grants: Option<Vec<String>>,
    extensions: Option<Vec<String>>,
    succession: Option<Vec<SuccessionOut>>,
    /// Stakes (field 7): each object, and its holders' shares in millionths;
    /// null names this collective (S1).
    stakes: Vec<StakeOut>,
    /// The departed members entry (field 22): who left (N5).
    departed: Vec<String>,
    /// The chain of judgment (field 21): each judge ("task N", an identity,
    /// "split service"), and those that take over with their periods: each
    /// one hash, or, taking over from a deal's split service, the service's
    /// grants, one per payee (F130, H6).
    chain: Vec<(String, Vec<(Vec<String>, u64)>)>,
    /// Forked from (field 23): the original collective, a back-link (N4).
    forked_from: Option<String>,
    /// The release rule (field 24); null: every holder.
    release_rule: Option<RuleOut>,
    /// In a deal's clone settling a fork, every tip it discards (field 26,
    /// F186; a list since QF3, F190); null otherwise.
    settles: Option<Vec<String>>,
    /// In a deal, the judge that settles its forks, one of field 13 (field
    /// 27, QF2, F190); null: none does.
    fork_judge: Option<String>,
    /// Why the terms fail the checks that need no other act, or null.
    problem: Option<ProblemOut>,
}

/// A stake as `readTerms` shows it: its object and holders, null for this
/// collective (S1).
type StakeOut = (Option<String>, Vec<(Option<String>, u64)>);

/// Read a terms payload (Law type 0) as the core library decodes it, field
/// by field, so a client can say in plain words what signing it means from
/// the exact bytes that are signed (Law rule 4a). Throws if the payload is
/// not terms in Law's format, or uses a field whose format is still open;
/// `problem` says why terms in the format still fail Law's checks.
#[wasm_bindgen(js_name = readTerms)]
pub fn read_terms(payload: &[u8], specs: JsValue) -> R<JsValue> {
    let s = specs_of(specs)?;
    let t = law::Terms::decode(&payload_of(payload)?).map_err(lerr)?;
    let hs = |v: &Vec<Hash>| v.iter().map(hx).collect::<Vec<_>>();
    let pairs = |v: &Vec<(Hash, u64)>| v.iter().map(|(h, n)| (hx(h), *n)).collect::<Vec<_>>();
    to_js(&TermsOut {
        parties: hs(&t.parties),
        text: t.text.clone(),
        cmips: t.cmips.iter().map(|(n, h)| (*n, hx(h))).collect(),
        keepers: t
            .keepers
            .as_ref()
            .map(|k| (hs(&k.operators), rule_out(&k.rule))),
        signing: match &t.field4 {
            law::Field4::Rule(r) => Some(rule_out(r)),
            _ => None,
        },
        mark: t.field4.mark().map(|m| {
            m.iter()
                .map(|e| MarkOut {
                    power: power_out(&e.power),
                    signers: hs(&e.signers),
                })
                .collect()
        }),
        clone: rule_out(&t.clone),
        constitutional: t.constitutional.as_ref().map(rule_out),
        areas: t
            .areas()
            .iter()
            .map(|a| AreaOut {
                id: a.id,
                name: a.name.clone(),
                holders: hs(&a.holders),
                threshold: a.threshold,
                kinds: a.kinds.iter().flatten().map(kind_out).collect(),
                fields: a
                    .fields
                    .iter()
                    .flatten()
                    .map(|f| match f {
                        law::FieldRef::Field(n) => FieldRefOut {
                            form: "field".into(),
                            number: *n,
                        },
                        law::FieldRef::Task(n) => FieldRefOut {
                            form: "task".into(),
                            number: *n,
                        },
                    })
                    .collect(),
            })
            .collect(),
        area_words: t.area_words.clone().unwrap_or_default(),
        time: t.time.as_ref().map(|(h, _)| hx(h)),
        abandonment: t.abandonment.as_ref().map(|a| {
            let (authority, identity, threshold) = match &a.authority {
                law::Authority::Named(h) => ("named", Some(hx(h)), None),
                law::Authority::Others(k) => ("others", None, Some(*k)),
            };
            AbandonmentOut {
                authority: authority.into(),
                identity,
                threshold,
                outcomes: a.outcomes.clone(),
                proof: a.proof.as_ref().map(|(h, _)| hx(h)),
            }
        }),
        parent: t.parent.as_ref().map(hx),
        grammar: t.grammar.as_ref().map(|g| GrammarOut {
            signing: holding_out(&g.signing),
            safety: holding_out(&g.safety),
            recovery: g.recovery.as_ref().map(|r| match r {
                law::Recovery::Custodian { custodian, grant } => RecoveryOut {
                    form: "custodian".into(),
                    custodian: Some(hx(custodian)),
                    grant: Some(hx(grant)),
                    authority: None,
                },
                law::Recovery::Escrow { authority } => RecoveryOut {
                    form: "escrow".into(),
                    custodian: None,
                    grant: None,
                    authority: Some(hx(authority)),
                },
            }),
        }),
        arbitrators: t.arbitrators.as_ref().map(hs),
        split_grant: t.split_grant.as_ref().map(hx),
        payee_grants: t.payee_grants.as_ref().map(|g| g.iter().map(hx).collect()),
        extensions: t.extensions.as_ref().map(hs),
        succession: t.succession.as_ref().map(|s| {
            s.iter()
                .map(|p| SuccessionOut {
                    party: hx(&p.party),
                    stakes: p.stakes.as_ref().map(pairs),
                    seats: p.seats.as_ref().map(pairs),
                    entry: p.entry,
                })
                .collect()
        }),
        stakes: t
            .stakes
            .iter()
            .flatten()
            .map(|x| (x.object.id().map(hx), x.holders.iter().map(|(h, n)| (h.id().map(hx), *n)).collect()))
            .collect(),
        departed: t.departed.iter().flatten().map(hx).collect(),
        chain: t
            .chain
            .iter()
            .flatten()
            .map(|l| {
                let j = match &l.judge {
                    law::Judge::Task(n) => format!("task {n}"),
                    law::Judge::Identity(h) => hx(h),
                    law::Judge::SplitService => "split service".into(),
                };
                (j, l.next.iter().map(|(t, p)| (t.hashes().iter().map(hx).collect(), *p)).collect())
            })
            .collect(),
        forked_from: t.forked_from.as_ref().map(hx),
        release_rule: t.release_rule.as_ref().map(rule_out),
        settles: t.settles.as_ref().map(|x| x.iter().map(hx).collect()),
        fork_judge: t.fork_judge.as_ref().map(hx),
        problem: t.check(&s.mips()?).err().map(|e| problem(&e)),
    })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ChangeOut {
    /// "field", "task", "extension" or "words".
    form: String,
    field: Option<u64>,
    task: Option<u64>,
    extension: Option<String>,
    area: Option<u64>,
    /// "constitutional", "judicial" or "operational".
    tier: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ClonePlanOut {
    changes: Vec<ChangeOut>,
    /// The powers the clone's mark must name (rule 44c), ascending.
    needs: Vec<PowerOut>,
}

/// What a clone changes from its parent, each change's tier, and the powers
/// its mark must name (rules 44a to 44c), from the two terms payloads. For
/// a client preparing a clone's mark, and showing what it changes.
#[wasm_bindgen(js_name = lawClonePlan)]
pub fn law_clone_plan(parent: &[u8], clone: &[u8], specs: JsValue) -> R<JsValue> {
    let s = specs_of(specs)?;
    let p = law::Terms::decode(&payload_of(parent)?).map_err(lerr)?;
    let c = law::Terms::decode(&payload_of(clone)?).map_err(lerr)?;
    let ext = s.ext()?;
    let needs = law::powers_needed(&p, &c, &s.mips()?, &|e: &Hash| {
        ext.get(e).cloned().ok_or(law::LawError::Missing(*e))
    })
    .map_err(lerr)?;
    let tier = |t: law::Tier| match t {
        law::Tier::Constitutional => "constitutional",
        law::Tier::Judicial => "judicial",
        law::Tier::Operational => "operational",
    };
    to_js(&ClonePlanOut {
        changes: law::changes(&p, &c)
            .iter()
            .map(|ch| {
                let mut o = ChangeOut {
                    form: String::new(),
                    field: None,
                    task: None,
                    extension: None,
                    area: None,
                    tier: tier(ch.tier()).into(),
                };
                match ch {
                    law::Change::Field(f) => {
                        o.form = "field".into();
                        o.field = Some(*f);
                    }
                    law::Change::Task(t) => {
                        o.form = "task".into();
                        o.task = Some(*t);
                    }
                    law::Change::Extension(e) => {
                        o.form = "extension".into();
                        o.extension = Some(hx(e));
                    }
                    law::Change::Words(a) => {
                        o.form = "words".into();
                        o.area = Some(*a);
                    }
                }
                o
            })
            .collect(),
        needs: needs.iter().map(power_out).collect(),
    })
}

/// The powers a rollback's mark names (Law rule 37d, F185), from the terms
/// of the agreement in force just before the broken act and the rollback's
/// clone: the constitutional change rule, and the judicial tier's rule
/// where the clone changes a judge, whatever its other changes.
#[wasm_bindgen(js_name = lawRollbackPlan)]
pub fn law_rollback_plan(parent: &[u8], clone: &[u8]) -> R<JsValue> {
    let p = law::Terms::decode(&payload_of(parent)?).map_err(lerr)?;
    let c = law::Terms::decode(&payload_of(clone)?).map_err(lerr)?;
    #[derive(Serialize)]
    struct Out {
        needs: Vec<PowerOut>,
    }
    to_js(&Out {
        needs: law::rollback_powers(&p, &c).iter().map(power_out).collect(),
    })
}

/// A signature payload (Law type 1), as CBOR. The act carries, in
/// `objects`, `[signed, signed]`: a signature follows the act it signs.
#[wasm_bindgen(js_name = signaturePayload)]
pub fn signature_payload(signed: &str) -> R<Vec<u8>> {
    Ok(cbor::encode(&Value::Map(law::signature_payload(&unhex(
        signed,
    )?))))
}

/// A resignation payload (Law type 16): the whole voice, or, with `area`,
/// stepping down from that area (by id). The act carries, in `objects`,
/// `[agreement, agreement]`. With `drafts`, the versions its signer had
/// signed and leaves behind (F207): none of them ever brings them back.
#[wasm_bindgen(js_name = resignationPayload)]
pub fn resignation_payload(agreement: &str, area: Option<u32>, drafts: Option<Vec<String>>) -> R<Vec<u8>> {
    let mut drafts = drafts.unwrap_or_default().iter().map(|d| unhex(d)).collect::<R<Vec<Hash>>>()?;
    drafts.sort();
    drafts.dedup();
    Ok(cbor::encode(&Value::Map(
        law::Resignation {
            agreement: unhex(agreement)?,
            area: area.map(u64::from),
            drafts,
        }
        .to_map(),
    )))
}

/// A settlement request payload (Law type 22; DQ8, F188): the deal's
/// reference version, the version with two complete clones, whose
/// arbitrator a party who signed it asks to settle the fork. The act
/// carries, in `objects`, `[reference, reference]`.
#[wasm_bindgen(js_name = settlementRequestPayload)]
pub fn settlement_request_payload(reference: &str) -> R<Vec<u8>> {
    Ok(cbor::encode(&Value::Map(law::SettlementRequest { reference: unhex(reference)? }.to_map())))
}

/// A fork settlement payload (Law type 23; DQ8, F188): the settlement of
/// the judge of forks the reference names (terms field 27, QF2), or of the
/// link of its chain of judgment that took over (QG4), naming the request
/// that activated it, the version of the fork it keeps and every tip it
/// drops (QF3, F190), sorted here. A tip given twice is refused, as the
/// core refuses it. The act carries, in `objects`, `[request, request]`.
#[wasm_bindgen(js_name = forkSettlementPayload)]
pub fn fork_settlement_payload(request: &str, kept: &str, discarded: Vec<String>) -> R<Vec<u8>> {
    let mut d = discarded.iter().map(|x| unhex(x)).collect::<R<Vec<_>>>()?;
    d.sort();
    if d.windows(2).any(|w| w[0] == w[1]) {
        return Err(err("a tip dropped is named once (Law type 23, field 2; QF3)"));
    }
    let x = law::ForkSettlement { request: unhex(request)?, kept: unhex(kept)?, discarded: d };
    if x.discarded.contains(&x.kept) {
        return Err(err("the version kept is not among the tips dropped (Law type 23)"));
    }
    Ok(cbor::encode(&Value::Map(x.to_map())))
}

/// A notice payload (Law type 24; F197): before closing, the collective's
/// notice to a payer owed money back who gave no address, naming the
/// payment (one receipt or claim of it) and a deadline on a time reference
/// (its hash, and the point on it, as an unsigned integer). The act is
/// sealed to the payer's identity, and carries, in `objects`, `[payment,
/// payment]`.
#[wasm_bindgen(js_name = noticePayload)]
pub fn notice_payload(payment: &str, time_reference: &str, deadline: u64) -> R<Vec<u8>> {
    let n = law::Notice { payment: unhex(payment)?, deadline: (unhex(time_reference)?, Value::Uint(deadline)) };
    Ok(cbor::encode(&Value::Map(n.to_map())))
}

/// A contest payload (Law type 14; BQ4, F188): the declaration of absence
/// it answers. Signed by the party the declaration names; the act carries,
/// in `objects`, `[declaration, declaration]`. It voids nothing (rule 52).
#[wasm_bindgen(js_name = contestPayload)]
pub fn contest_payload(declaration: &str) -> R<Vec<u8>> {
    Ok(cbor::encode(&Value::Map(law::Contest { declaration: unhex(declaration)? }.to_map())))
}

/// An abandonment declaration payload (Law type 13, B12): the agreement,
/// the version whose clause it applies (the last the party signed), the
/// party, and the outcomes, ascending. The act carries, in `objects`,
/// `[agreement, agreement]`.
#[wasm_bindgen(js_name = declarationPayload)]
pub fn declaration_payload(agreement: &str, clause: &str, party: &str, outcomes: Vec<u32>) -> R<Vec<u8>> {
    let d = law::AbsenceDeclaration {
        agreement: unhex(agreement)?,
        clause: unhex(clause)?,
        party: unhex(party)?,
        outcomes: outcomes.into_iter().map(u64::from).collect(),
    };
    if d.outcomes.is_empty() || d.outcomes.iter().any(|o| *o > 4) || d.outcomes.windows(2).any(|w| w[0] >= w[1]) {
        return Err(err("a declaration's outcomes are known ones, ascending, none twice"));
    }
    let bytes = cbor::encode(&Value::Map(d.to_map()));
    Ok(bytes)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecordIn {
    clone: Option<String>,
    signatures: Option<Vec<String>>,
    kept: Vec<TipIn>,
    registers: Option<Vec<String>>,
}

/// A record payload (Law type 17): the collective's everyday line. Its act
/// carries, in `objects`, `[clone, clone]`, or, naming no clone, the
/// agreement in force. Checked by the core's decoder before it is returned.
#[wasm_bindgen(js_name = recordPayload)]
pub fn record_payload(input: JsValue) -> R<Vec<u8>> {
    let r: RecordIn = from_js(input)?;
    let hs = |v: &Option<Vec<String>>| {
        v.as_ref()
            .map(|v| v.iter().map(|x| unhex(x)).collect::<R<Vec<_>>>())
            .transpose()
    };
    let rec = law::Record {
        clone: r.clone.as_deref().map(unhex).transpose()?,
        signatures: hs(&r.signatures)?,
        kept: r
            .kept
            .iter()
            .map(|t| {
                Ok(KeptTip {
                    act: unhex(&t.act)?,
                    position: t.position,
                    summary: unhex(&t.summary)?,
                })
            })
            .collect::<R<_>>()?,
        registers: hs(&r.registers)?,
    };
    if rec.clone.is_some() != rec.signatures.is_some() {
        return Err(err("a record names its clone's signature acts exactly when it names a clone"));
    }
    if rec.clone.is_none() && rec.registers.is_none() {
        return Err(err("a record writes a clone or registers something"));
    }
    Ok(cbor::encode(&Value::Map(rec.to_map())))
}

#[derive(Serialize)]
struct RuleOut {
    form: String,
    threshold: Option<u64>,
    named: Option<Vec<String>>,
}

fn rule_out(r: &law::Rule) -> RuleOut {
    match r {
        law::Rule::All => RuleOut {
            form: "all".into(),
            threshold: None,
            named: None,
        },
        law::Rule::Threshold(k) => RuleOut {
            form: "threshold".into(),
            threshold: Some(*k),
            named: None,
        },
        law::Rule::Named(n) => RuleOut {
            form: "named".into(),
            threshold: None,
            named: Some(n.iter().map(hx).collect()),
        },
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AgreementOut {
    id: String,
    parties: Vec<String>,
    signed: Vec<String>,
    /// Founding terms and deals: whether it exists. A collective's clone:
    /// null, put in force only by a record or rotation.
    exists: Option<bool>,
    /// A collective's clone: everyone its mark names, and everyone it adds,
    /// has signed it.
    ready: bool,
    needs: Option<Vec<PowerOut>>,
    invalid: Option<String>,
    parent: Option<String>,
    text: String,
    collective: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AreaCountOut {
    area: u64,
    name: String,
    frozen: bool,
    voices: Vec<String>,
    needed: usize,
    signers: Vec<String>,
    met: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ConsentOut {
    /// "not-collective", "broken", "line", "no-area", "unadopted",
    /// "invalid" or "areas".
    kind: String,
    agreement: Option<String>,
    reason: Option<String>,
    areas: Vec<AreaCountOut>,
    /// Whether the act counts, as far as Law goes.
    met: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DepartureOut {
    act: String,
    party: String,
    /// "resigned", "stepped-down", "rotated" or "declared" (an abandonment
    /// declaration removing the voice).
    kind: String,
    agreement: Option<String>,
    area: Option<u64>,
}

fn departure_out(d: &law::Departure) -> DepartureOut {
    let (kind, agreement, area) = match &d.kind {
        law::DepartureKind::Resigned { agreement } => ("resigned", Some(hx(agreement)), None),
        law::DepartureKind::SteppedDown { agreement, area } => {
            ("stepped-down", Some(hx(agreement)), Some(*area))
        }
        law::DepartureKind::Rotated { .. } => ("rotated", None, None),
        law::DepartureKind::Declared { agreement } => ("declared", Some(hx(agreement)), None),
    };
    DepartureOut {
        act: hx(&d.act),
        party: hx(&d.party),
        kind: kind.into(),
        agreement,
        area,
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecordOut {
    id: String,
    line: bool,
    not_a_line: Option<String>,
    in_force_at: Option<String>,
    clone: Option<String>,
    /// "complete", "draft" or "invalid", with why.
    clone_state: Option<String>,
    clone_why: Option<String>,
    puts: Option<String>,
    /// Whether its clone, of one branch of a fork, resolves the fork (B11).
    resolves: bool,
    registers: Vec<DepartureOut>,
}

fn record_out(e: &law::RecordEval) -> RecordOut {
    let (state, why) = match e.clone.as_ref().map(|c| &c.1) {
        Some(law::CloneState::Complete) => (Some("complete"), None),
        Some(law::CloneState::Draft(w)) => (Some("draft"), Some(w.clone())),
        Some(law::CloneState::Invalid(w)) => (Some("invalid"), Some(w.clone())),
        None => (None, None),
    };
    RecordOut {
        id: hx(&e.id),
        line: e.line,
        not_a_line: e.not_a_line.clone(),
        in_force_at: e.in_force_at.as_ref().map(hx),
        clone: e.clone.as_ref().map(|c| hx(&c.0)),
        clone_state: state.map(String::from),
        clone_why: why,
        puts: e.puts.as_ref().map(hx),
        resolves: e.resolves,
        registers: e.registers.iter().map(departure_out).collect(),
    }
}

#[derive(Deserialize)]
struct PowerIn {
    form: String,
    area: Option<u64>,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
struct NextVoicesOut {
    error: Option<String>,
    agreement: Option<String>,
    among: Vec<String>,
    voices: Vec<String>,
    needed: Option<usize>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CurrentOut {
    agreement: String,
    departed: Vec<String>,
    stepped_down: Vec<(u64, String)>,
    frozen: Vec<u64>,
    records: Vec<RecordOut>,
    fork: bool,
    /// The fork of the collective that closed it (rule 47a), if any.
    closed: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BackingOut {
    /// "not-under-grant", "backed", "not-backed", "binds" or "unknown" (rule
    /// 18d: a grant carrying limits under a cMIP the core does not implement).
    kind: String,
    grant: Option<String>,
    reason: Option<String>,
}

#[wasm_bindgen]
impl Verifier {
    /// An agreement as held: its parties, who signed, whether it exists (a
    /// deal, founding terms) or is ready to be recorded (a collective's
    /// clone), and the powers its mark must name. `specs`: the six MIP
    /// hashes, and the layers of extensions it adds or drops.
    #[wasm_bindgen(js_name = lawAgreement)]
    pub fn law_agreement(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let a = view.agreement(&unhex(id)?).map_err(lerr)?;
        to_js(&AgreementOut {
            id: hx(&a.id),
            parties: a.terms.parties.iter().map(hx).collect(),
            signed: a.signed.iter().map(hx).collect(),
            exists: a.exists,
            ready: a.ready,
            needs: a.needs.as_ref().map(|n| n.iter().map(power_out).collect()),
            invalid: a.invalid.clone(),
            parent: a.terms.parent.as_ref().map(hx),
            text: a.terms.text.clone(),
            collective: a.terms.is_collective(),
        })
    }

    /// A clone read as a rollback's (Law rule 37d, F185): as `lawAgreement`,
    /// its mark checked against the powers a rollback names.
    #[wasm_bindgen(js_name = lawRollbackAgreement)]
    pub fn law_rollback_agreement(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let a = view.rollback_agreement(&unhex(id)?).map_err(lerr)?;
        to_js(&AgreementOut {
            id: hx(&a.id),
            parties: a.terms.parties.iter().map(hx).collect(),
            signed: a.signed.iter().map(hx).collect(),
            exists: a.exists,
            ready: a.ready,
            needs: a.needs.as_ref().map(|n| n.iter().map(power_out).collect()),
            invalid: a.invalid.clone(),
            parent: a.terms.parent.as_ref().map(hx),
            text: a.terms.text.clone(),
            collective: a.terms.is_collective(),
        })
    }

    /// The agreement an identity's chain declares at the chain act
    /// `binding`, if any (for a rotation: the clone it declares).
    #[wasm_bindgen(js_name = lawDeclared)]
    pub fn law_declared(&self, specs: JsValue, identity: &str, binding: &str) -> R<Option<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view
            .declared(&unhex(identity)?, &unhex(binding)?)
            .map(|h| hx(&h)))
    }

    /// The agreement in force for an act of a collective (rule 37c, F109),
    /// or null if its signer is not a collective.
    #[wasm_bindgen(js_name = lawInForce)]
    pub fn law_in_force(&self, specs: JsValue, act: &str) -> R<Option<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view.in_force(&unhex(act)?).map_err(lerr)?.map(|h| hx(&h)))
    }

    /// Law's answer for an act of a collective: which areas reach it, and
    /// whether their holders' signature acts meet each (rule 36a, 44d).
    #[wasm_bindgen(js_name = lawConsent)]
    pub fn law_consent(&self, specs: JsValue, act: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let c = view.consent(&unhex(act)?).map_err(lerr)?;
        let met = c.counts();
        let mut o = ConsentOut {
            kind: String::new(),
            agreement: None,
            reason: None,
            areas: vec![],
            met,
        };
        match c {
            law::Consent::NotCollective => o.kind = "not-collective".into(),
            law::Consent::Closed { by } => {
                o.kind = "closed".into();
                o.reason = Some(format!(
                    "the collective was ended by its fork or closing {}: what its keys sign after it counts for nothing in Law (rule 47a)",
                    hx(&by)
                ));
            }
            law::Consent::Broken { reason } => {
                o.kind = "broken".into();
                o.reason = Some(reason);
            }
            law::Consent::NotDone { agreement, reason } => {
                o.kind = "not-done".into();
                o.agreement = Some(hx(&agreement));
                o.reason = Some(reason);
            }
            law::Consent::Uncited { reason } => {
                o.kind = "uncited".into();
                o.reason = Some(reason);
            }
            law::Consent::Line { agreement } => {
                o.kind = "line".into();
                o.agreement = Some(hx(&agreement));
            }
            law::Consent::NoArea { agreement } => {
                o.kind = "no-area".into();
                o.agreement = Some(hx(&agreement));
            }
            law::Consent::Unadopted { agreement } => {
                o.kind = "unadopted".into();
                o.agreement = Some(hx(&agreement));
            }
            law::Consent::RailNotAccepted { agreement, rail } => {
                o.kind = "rail-not-accepted".into();
                o.agreement = Some(hx(&agreement));
                o.reason = Some(format!(
                    "a receipt or claim on rail Module {}, which the collective's payee pointers and vault never named: it counts for nothing (Finance rule 12a)",
                    hx(&rail)
                ));
            }
            law::Consent::Invalid { agreement, reason } => {
                o.kind = "invalid".into();
                o.agreement = Some(hx(&agreement));
                o.reason = Some(reason);
            }
            law::Consent::Granted { agreement, grant } => {
                o.kind = "granted".into();
                o.agreement = Some(hx(&agreement));
                o.reason = Some(format!("signed with the grant key of grant {}, which backs it (F128)", hx(&grant)));
            }
            law::Consent::Ungranted { grant, reason } => {
                o.kind = "ungranted".into();
                o.reason = Some(format!("signed with the grant key of grant {}, which does not back it: {reason}", hx(&grant)));
            }
            law::Consent::Unknown { grant, reason } => {
                o.kind = "unknown".into();
                o.reason = Some(format!("signed with the grant key of grant {}: whether it backs it is unknown (rule 18d): {reason}", hx(&grant)));
            }
            law::Consent::Talk => {
                o.kind = "talk".into();
                o.reason = Some("a negotiation message: talk, binding nothing, on neither of the collective's chains (F128, W6)".into());
            }
            law::Consent::Identity => {
                o.kind = "identity".into();
                o.reason = Some("one of Identity's own everyday acts of the collective (a witness act, routes, an encryption key): on neither of its chains, it counts for nothing in Law and places nothing; Identity governs it (rule 35b, F156)".into());
            }
            law::Consent::Areas { agreement, areas, .. } => {
                o.kind = "areas".into();
                o.agreement = Some(hx(&agreement));
                o.areas = areas
                    .iter()
                    .map(|a| AreaCountOut {
                        area: a.area,
                        name: a.name.clone(),
                        frozen: a.frozen,
                        voices: a.voices.iter().map(hx).collect(),
                        needed: a.needed,
                        signers: a.signers.iter().map(hx).collect(),
                        met: a.met,
                    })
                    .collect();
            }
        }
        to_js(&o)
    }

    /// A record act of a collective, judged: whether it is a line, the
    /// clone it names and whether it puts it in force, and what it registers.
    #[wasm_bindgen(js_name = lawRecord)]
    pub fn law_record(&self, specs: JsValue, collective: &str, record: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view
            .record(&unhex(collective)?, &unhex(record)?)
            .map_err(lerr)?;
        to_js(&record_out(&e))
    }

    /// The collective's state after everything held under its latest key:
    /// the agreement in force, who left, who stepped down from which area,
    /// which areas are frozen, its records. Null if it is not a collective.
    #[wasm_bindgen(js_name = lawCurrent)]
    pub fn law_current(&self, specs: JsValue, collective: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let c = view.current(&unhex(collective)?).map_err(lerr)?;
        match c {
            None => Ok(JsValue::NULL),
            Some(c) => to_js(&CurrentOut {
                agreement: hx(&c.agreement),
                departed: c.departed.iter().map(hx).collect(),
                stepped_down: c.stepped_down.iter().map(|(a, p)| (*a, hx(p))).collect(),
                frozen: c.frozen.clone(),
                records: c.records.iter().map(record_out).collect(),
                fork: c.fork,
                closed: c.closed.as_ref().map(hx),
            }),
        }
    }

    /// Why Law reads a collective as broken (the agreement its latest key
    /// lives under cannot be found: a rotation's declared clone incomplete,
    /// a false mark, rules 37 and 45a), or null where it reads it as working.
    #[wasm_bindgen(js_name = lawBroken)]
    pub fn law_broken(&self, specs: JsValue, collective: &str) -> R<Option<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        view.broken(&unhex(collective)?).map_err(lerr)
    }

    /// Who counts for a power (`{ form, area }`, as `lawClonePlan` gives
    /// it) of the collective's agreement in force, at its next line, after
    /// every act held (rule 44d), `leaving` taken out: the agreement, the
    /// parties counted among, the voices that remain, and how many meet it
    /// (null where none remains); or `{ error }`, why there is no such count.
    #[wasm_bindgen(js_name = lawNextVoices)]
    pub fn law_next_voices(&self, specs: JsValue, collective: &str, power: JsValue, leaving: Vec<String>) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let p: PowerIn = from_js(power)?;
        let power = match (p.form.as_str(), p.area) {
            ("constitutional", _) => law::Power::Constitutional,
            ("clone", _) => law::Power::Clone,
            ("judicial", _) => law::Power::Judicial,
            ("area", Some(a)) => law::Power::Area(a),
            _ => return Err(JsError::new("a power is constitutional, clone, judicial, or an area with its id")),
        };
        let leaving = leaving.iter().map(|x| unhex(x)).collect::<R<Vec<_>>>()?;
        match view.next_voices(&unhex(collective)?, &power, &leaving).map_err(lerr)? {
            Err(error) => to_js(&NextVoicesOut { error: Some(error), ..Default::default() }),
            Ok(n) => to_js(&NextVoicesOut {
                error: None,
                agreement: Some(hx(&n.agreement)),
                among: n.among.iter().map(hx).collect(),
                voices: n.voices.iter().map(hx).collect(),
                needed: n.needed,
            }),
        }
    }

    /// Where Law reads a collective as broken and a rollback can bring it
    /// back (Law rule 37d, F185): `{ act, before, reason }`, the broken act
    /// (a rotation of the collective), the agreement in force just before
    /// it, a rollback's parent, and Law's reason; null otherwise.
    #[wasm_bindgen(js_name = lawBrokenAct)]
    pub fn law_broken_act(&self, specs: JsValue, collective: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        #[derive(Serialize)]
        struct Out {
            act: String,
            before: String,
            reason: String,
        }
        match view.broken_act(&unhex(collective)?).map_err(lerr)? {
            None => Ok(JsValue::NULL),
            Some(b) => to_js(&Out {
                act: hx(&b.act),
                before: hx(&b.before),
                reason: b.reason,
            }),
        }
    }

    /// Who counts for a power (`{ form, area }`) of the agreement in force
    /// just before a broken collective's broken act, at a rollback made
    /// next (Law rules 37d, 44d), `leaving` taken out (the parties whose
    /// resignations the rollback registers): as `lawNextVoices`; or
    /// `{ error }`, why there is no such count.
    #[wasm_bindgen(js_name = lawRollbackVoices)]
    pub fn law_rollback_voices(&self, specs: JsValue, collective: &str, power: JsValue, leaving: Vec<String>) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let p: PowerIn = from_js(power)?;
        let power = match (p.form.as_str(), p.area) {
            ("constitutional", _) => law::Power::Constitutional,
            ("clone", _) => law::Power::Clone,
            ("judicial", _) => law::Power::Judicial,
            ("area", Some(a)) => law::Power::Area(a),
            _ => return Err(JsError::new("a power is constitutional, clone, judicial, or an area with its id")),
        };
        let leaving = leaving.iter().map(|x| unhex(x)).collect::<R<Vec<_>>>()?;
        match view.rollback_voices(&unhex(collective)?, &power, &leaving).map_err(lerr)? {
            Err(error) => to_js(&NextVoicesOut { error: Some(error), ..Default::default() }),
            Ok(n) => to_js(&NextVoicesOut {
                error: None,
                agreement: Some(hx(&n.agreement)),
                among: n.among.iter().map(hx).collect(),
                voices: n.voices.iter().map(hx).collect(),
                needed: n.needed,
            }),
        }
    }

    /// What a rollback made next would register (rule 37d, RB3; F187 2),
    /// checked from what this verifier holds: `{ error, departures }`, each
    /// departure `{ act, party, kind }` ("resigned", "stepped-down",
    /// "declared"). A client asks it from a fresh reading of the relays
    /// before it sends the rollback's rotation.
    #[wasm_bindgen(js_name = lawRollbackRegisters)]
    pub fn law_rollback_registers(&self, specs: JsValue, collective: &str, registers: Vec<String>) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let registers = registers.iter().map(|x| unhex(x)).collect::<R<Vec<_>>>()?;
        Ok(match view.rollback_registers(&unhex(collective)?, &registers).map_err(lerr)? {
            Err(error) => to_js(&RollbackRegistersOut { error: Some(error), departures: vec![] })?,
            Ok(ds) => to_js(&RollbackRegistersOut {
                error: None,
                departures: ds.iter().map(departure_out).collect(),
            })?,
        })
    }

    /// The resignations the parties of a collective's agreement published,
    /// registered or not (rule 37a; F187, 3): departures `{ act, party,
    /// kind, agreement }`. What a client reads beside Law's count of the
    /// voices that remain, to warn the last voice.
    #[wasm_bindgen(js_name = lawPublishedResignations)]
    pub fn law_published_resignations(&self, specs: JsValue, collective: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let ds = view.published_resignations(&unhex(collective)?).map_err(lerr)?;
        to_js(&ds.iter().map(departure_out).collect::<Vec<_>>())
    }

    /// The declarations of absence naming `party` this verifier holds (RB3,
    /// client conformance): `{ act, signer, agreement, clause, outcomes,
    /// contests }`, `contests` the party's contests of it (BQ4).
    /// The numbers on the splits a service made under a deal (DQ6, F188):
    /// `{ numbers: [number, split][], gaps, repeated, unnumbered }`. Client
    /// conformance: a holder's client MUST raise the alarm where the
    /// numbers it receives skip (`gaps`).
    #[wasm_bindgen(js_name = lawSplitNumbers)]
    pub fn law_split_numbers(&self, specs: JsValue, service: &str, agreement: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let n = view.split_numbers(&unhex(service)?, &unhex(agreement)?).map_err(lerr)?;
        to_js(&SplitNumbersOut {
            numbers: n.numbers.iter().map(|(k, h)| (*k, hx(h))).collect(),
            gaps: n.gaps,
            repeated: n.repeated,
            unnumbered: n.unnumbered.iter().map(hx).collect(),
        })
    }

    #[wasm_bindgen(js_name = lawDeclarationsNaming)]
    pub fn law_declarations_naming(&self, specs: JsValue, party: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let out: Vec<DeclarationNamingOut> = view
            .declarations_naming(&unhex(party)?)
            .iter()
            .map(|(act, signer, d)| {
                Ok(DeclarationNamingOut {
                    act: hx(act),
                    signer: hx(signer),
                    agreement: hx(&d.agreement),
                    clause: hx(&d.clause),
                    outcomes: d.outcomes.clone(),
                    contests: view.contests(act).map_err(lerr)?.iter().map(hx).collect(),
                })
            })
            .collect::<R<_>>()?;
        to_js(&out)
    }

    /// The payments a collective received during a broken stretch and owes
    /// back, the sale not signed anew after the rollback (rule 37d, RB2):
    /// open obligations, each `{ payment, to, unit, value, stillBroken }`.
    #[wasm_bindgen(js_name = lawOwedBack)]
    pub fn law_owed_back(&self, specs: JsValue, collective: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let out: Vec<OwedBackOut> = view
            .owed_back(&unhex(collective)?)
            .map_err(lerr)?
            .iter()
            .map(|o| OwedBackOut {
                payment: hx(&o.payment),
                to: match &o.to {
                    finance::RefundTo::Identity(h) => Some(hx(h)),
                    finance::RefundTo::Key(_) => Some("the key the payment committed to".into()),
                    finance::RefundTo::Nobody => None,
                },
                to_kind: match &o.to {
                    finance::RefundTo::Identity(_) => "identity",
                    finance::RefundTo::Key(_) => "key",
                    finance::RefundTo::Nobody => "nobody",
                }
                .into(),
                unit: hx(&o.amount.unit),
                value: o.amount.value,
                still_broken: o.still_broken,
            })
            .collect();
        to_js(&out)
    }

    /// Where a deal stands forked (rule 45b, F186): `{ reference, branches,
    /// tangled }`, each branch its versions from the split to its latest,
    /// `tangled` the reason where the fork is tangled (F188, DQ1 to DQ4: the
    /// deal stays on its reference); null where it is not forked. Throws
    /// where the shape is not decided (QH1, refused rather than guessed).
    /// The version of an agreement in force, as rule 45b reads a deal's
    /// forks (F186, F188, F192): while forked or tangled, the reference.
    /// Throws where the shape is not decided (QH1: two settlements, a
    /// judge's among them, neither holding the other). What a buyer's
    /// client checks an offer against before paying (F188, a strong
    /// SHOULD).
    #[wasm_bindgen(js_name = lawVersionInForce)]
    pub fn law_version_in_force(&self, specs: JsValue, agreement: &str) -> R<String> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(hx(&view.version_in_force(&unhex(agreement)?).map_err(lerr)?))
    }

    #[wasm_bindgen(js_name = lawDealFork)]
    pub fn law_deal_fork(&self, specs: JsValue, agreement: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        match view.deal_fork(&unhex(agreement)?).map_err(lerr)? {
            None => Ok(JsValue::NULL),
            Some(f) => to_js(&DealForkOut {
                reference: hx(&f.reference),
                branches: f.branches.iter().map(|b| b.iter().map(hx).collect()).collect(),
                tangled: f.tangled,
            }),
        }
    }

    /// Client conformance (rule 45b, F186): the alarm a seller's client and
    /// a split service raise when a payment names a version of the deal that
    /// does not descend from the version they hold. Null where it does;
    /// else `{ named, held, shared, kind, heldLine, namedLine }`, `kind`
    /// "fork" (the alarm), "unheld" (a version this verifier does not hold:
    /// the alarm, F189 3) or "older" (a plain notice, F188 DQ7).
    #[wasm_bindgen(js_name = lawForkAlarm)]
    pub fn law_fork_alarm(&self, specs: JsValue, payment: &str, held: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        match view.fork_alarm(&unhex(payment)?, &unhex(held)?).map_err(lerr)? {
            None => Ok(JsValue::NULL),
            Some(a) => to_js(&ForkAlarmOut {
                named: hx(&a.named),
                held: hx(&a.held),
                shared: hx(&a.shared),
                kind: match a.kind {
                    mor_core::law::AlarmKind::Fork => "fork",
                    mor_core::law::AlarmKind::Unheld => "unheld",
                    mor_core::law::AlarmKind::Older => "older",
                },
                held_line: a.held_line.iter().map(hx).collect(),
                named_line: a.named_line.iter().map(hx).collect(),
            }),
        }
    }

    /// Whether the collective's act `x` counts as made before the line
    /// `line` (a record or a rotation of it), on its own sequences (F109).
    #[wasm_bindgen(js_name = lawBefore)]
    pub fn law_before(&self, specs: JsValue, x: &str, line: &str) -> R<bool> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        view.counts_before(&unhex(x)?, &unhex(line)?).map_err(lerr)
    }

    /// Whether an act under a grant binds the collective that issued it.
    #[wasm_bindgen(js_name = lawBacking)]
    pub fn law_backing(&self, specs: JsValue, act: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let b = view.backing(&unhex(act)?).map_err(lerr)?;
        let (kind, grant, reason) = match b {
            law::Backing::NotUnderGrant => ("not-under-grant", None, None),
            law::Backing::Backed { grant } => ("backed", Some(grant), None),
            law::Backing::NotBacked { grant, reason } => ("not-backed", Some(grant), Some(reason)),
            law::Backing::Binds { grant } => ("binds", Some(grant), None),
            law::Backing::Unknown { grant, reason } => ("unknown", Some(grant), Some(reason)),
        };
        to_js(&BackingOut {
            kind: kind.into(),
            grant: grant.as_ref().map(hx),
            reason,
        })
    }

    /// A fork of a collective, judged (rule 47a, F121 shape B, F124):
    /// whether it closes the original, the members whose voice remains,
    /// who signed and who leaves on no side, each side's default share, who
    /// every successor keeps as a departed holder, each side's successor's
    /// founding agreement where it fits, and the obligations in the history
    /// it cites that it does not hand out, which keep it from taking effect
    /// (F127, replacing F125 D1).
    #[wasm_bindgen(js_name = lawFork)]
    pub fn law_fork(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view.fork(&unhex(id)?).map_err(lerr)?;
        to_js(&ForkOut {
            complete: e.complete,
            counts: e.counts,
            why: e.why.clone(),
            agreement: hx(&e.fork.agreement),
            collective: hx(&e.fork.collective),
            sides: e.fork.sides.iter().map(|s| (hx(&s.successor), s.members.iter().map(hx).collect())).collect(),
            voices: e.voices.iter().map(hx).collect(),
            signed: e.signed.iter().map(hx).collect(),
            leaving: e.leaving.iter().map(hx).collect(),
            shares: e.shares.clone(),
            by_count: e.by_count,
            kept: e.kept.iter().map(|(h, n)| (hx(h), *n)).collect(),
            debts: e.fork.debts.iter().map(|(o, i)| (hx(o), i.clone())).collect(),
            unassigned: e.unassigned.iter().map(hx).collect(),
            named_shares: e
                .fork
                .shares
                .iter()
                .map(|x| (hx(&x.agreement), x.index, x.shares.clone()))
                .collect(),
            successors: e.successors.iter().map(|x| x.as_ref().map(hx)).collect(),
        })
    }

    /// What a fork of `collective` must hand out (F127), its line drawn at
    /// `chain_act` and `tips` (`[{ act, position, summary }]`) with
    /// `agreement` in force there: every obligation in the history it would
    /// cite, its own and those an earlier fork handed to it. Null where the
    /// line does not hold.
    #[wasm_bindgen(js_name = lawHandOut)]
    pub fn law_hand_out(&self, specs: JsValue, collective: &str, agreement: &str, chain_act: &str, tips: JsValue) -> R<Option<Vec<String>>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let tips: Vec<TipIn> = from_js(tips)?;
        let tips = tips
            .iter()
            .map(|t| Ok(KeptTip { act: unhex(&t.act)?, position: t.position, summary: unhex(&t.summary)? }))
            .collect::<R<Vec<_>>>()?;
        Ok(view
            .hand_out(&unhex(collective)?, &unhex(agreement)?, &unhex(chain_act)?, &tips)
            .map_err(lerr)?
            .map(|v| v.iter().map(hx).collect()))
    }

    /// The acts the history a line at `chain_act` and `tips` would cite
    /// that this verifier does not hold (F127): a member's client signs no
    /// fork or closing while any is missing (F131 IT2b, client conformance).
    #[wasm_bindgen(js_name = lawLineUnheld)]
    pub fn law_line_unheld(&self, specs: JsValue, collective: &str, chain_act: &str, tips: JsValue) -> R<Vec<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let tips: Vec<TipIn> = from_js(tips)?;
        let tips = tips
            .iter()
            .map(|t| Ok(KeptTip { act: unhex(&t.act)?, position: t.position, summary: unhex(&t.summary)? }))
            .collect::<R<Vec<_>>>()?;
        Ok(view.line_unheld(&unhex(collective)?, &unhex(chain_act)?, &tips).iter().map(hx).collect())
    }

    /// Every fork and closing of `collective` held, complete or not: what a
    /// new ending names in its `objects`, `[agreement, ending]` (F131 IT1,
    /// client conformance).
    #[wasm_bindgen(js_name = lawEndingActs)]
    pub fn law_ending_acts(&self, specs: JsValue, collective: &str) -> R<Vec<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view.ending_acts(&unhex(collective)?).iter().map(hx).collect())
    }

    /// A closing act, judged (rule 47a, F124 N9).
    #[wasm_bindgen(js_name = lawClosing)]
    pub fn law_closing(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view.closing(&unhex(id)?).map_err(lerr)?;
        to_js(&ClosingOut {
            complete: e.complete,
            counts: e.counts,
            why: e.why.clone(),
            collective: hx(&e.closing.collective),
            voices: e.voices.iter().map(hx).collect(),
            signed: e.signed.iter().map(hx).collect(),
            holds: e.holds.iter().map(|(a, i)| (hx(a), *i)).collect(),
            open_debts: e.open_debts.iter().map(hx).collect(),
            left_open: e.closing.open.iter().map(|o| (hx(&o.payment), o.notice.as_ref().map(hx), o.holder.as_ref().map(hx))).collect(),
        })
    }

    /// The collective whose genesis declares the root of `agreement`'s
    /// lineage, where held: what null names in its terms (S1).
    #[wasm_bindgen(js_name = lawCollectiveOf)]
    pub fn law_collective_of(&self, specs: JsValue, agreement: &str) -> R<Option<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view.collective_of(&unhex(agreement)?).map_err(lerr)?.map(|h| hx(&h)))
    }

    /// Payer-side splitting (F124 P2): what a paying wallet reading Law pays
    /// each holder for `amount` on the stake in `object` (hex, or null for
    /// the collective itself), or why it cannot. Leftovers by largest
    /// remainder; a tied unit is the payer's to decide, at most one per tie
    /// (Law rule 15a, F165, F168): this wallet gives it to the tied holder
    /// with the smallest identity hash, a choice, not a rule.
    #[wasm_bindgen(js_name = lawPayerSplit)]
    pub fn law_payer_split(&self, specs: JsValue, agreement: &str, object: Option<String>, amount: u64) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let o = match object {
            Some(x) => law::Who::Id(unhex(&x)?),
            None => law::Who::This,
        };
        let r = view.payer_split(&unhex(agreement)?, &o, amount).map_err(lerr)?;
        to_js(&match r {
            Ok(v) => PayerSplitOut { pays: v.iter().map(|(h, n)| (hx(h), *n)).collect(), why: None },
            Err(w) => PayerSplitOut { pays: vec![], why: Some(w) },
        })
    }

    /// Rule 15a's turns (F165, F171): for `stake` (its index) of
    /// `agreement`'s version in force, the leftover units each holder has
    /// received so far from `service`'s splits, as `previous` (the
    /// service's latest split act for the stake, which its next split
    /// cites) carries them in its running count; null `previous`: no split
    /// yet, every count zero. In the order of `holders` (hex). Null where
    /// `previous` is not held, not one of the service's splits for the
    /// stake, or carries no count.
    #[wasm_bindgen(js_name = lawSplitTurns)]
    pub fn law_split_turns(&self, specs: JsValue, service: &str, agreement: &str, stake: u64, holders: Vec<String>, previous: Option<String>) -> R<Option<Vec<f64>>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let in_force = view.version_in_force(&unhex(agreement)?).map_err(lerr)?;
        let holders = holders.iter().map(|h| Ok((unhex(h)?, 0))).collect::<R<Vec<_>>>()?;
        let previous = previous.map(|p| unhex(&p)).transpose()?;
        let t = view.turns(&unhex(service)?, &in_force, stake, &holders, previous.as_ref()).map_err(lerr)?;
        Ok(t.map(|v| v.into_iter().map(|n| n as f64).collect()))
    }

    /// Whether an obligation binds its debtor: for a collective, once done
    /// (F128, N13's public outside withdrawn); null if not one.
    #[wasm_bindgen(js_name = lawObligationBinds)]
    pub fn law_obligation_binds(&self, specs: JsValue, id: &str) -> R<Option<bool>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        view.obligation_binds(&unhex(id)?).map_err(lerr)
    }

    /// What is paid toward an obligation, as a binding answer: an error
    /// coded `law/own-attempt` where it rests on this client's own failed
    /// attempts to reach homes, shown as unknown (F153).
    #[wasm_bindgen(js_name = lawPaid)]
    pub fn law_paid(&self, specs: JsValue, id: &str) -> R<u64> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        view.paid(&unhex(id)?).map_err(lerr)
    }

    /// The payee's pointer acts its own acts hold, for what a payment
    /// follows (an obligation, an agreement or an offer; Finance rule 14,
    /// F145, F157, F163, F168): `{ pointers, complete }`, or null where
    /// `fulfils` is none of these.
    #[wasm_bindgen(js_name = lawPointerHolding)]
    pub fn law_pointer_holding(&self, specs: JsValue, fulfils: &str, payee: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        #[derive(Serialize)]
        struct Out {
            pointers: Vec<String>,
            complete: bool,
        }
        to_js(&view.pointer_holding(&unhex(fulfils)?, &unhex(payee)?).map(|h| Out { pointers: h.pointers.iter().map(hx).collect(), complete: h.complete }))
    }

    /// Who owes an obligation of a collective a fork closed (N13): the
    /// successors it assigns it to, every successor where it assigns it to
    /// none (F125, D1); null where its debtor is not closed by a fork.
    #[wasm_bindgen(js_name = lawDebtors)]
    pub fn law_debtors(&self, specs: JsValue, id: &str) -> R<Option<Vec<String>>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view.debtors(&unhex(id)?).map_err(lerr)?.map(|v| v.iter().map(hx).collect()))
    }

    /// A creditor's release, judged (Finance type 4, F126; rule 47b):
    /// whether it ends the obligation it names (signed by that obligation's
    /// creditor, a collective by its Finance lane).
    #[wasm_bindgen(js_name = lawDebtRelease)]
    pub fn law_debt_release(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view.debt_release(&unhex(id)?).map_err(lerr)?;
        to_js(&DebtReleaseOut {
            counts: e.counts,
            why: e.why.clone(),
            obligation: hx(&e.release.obligation),
            against: e.release.against.iter().map(hx).collect(),
        })
    }

    /// Whether an act in a collective's name is done (F126, F128): sealed to
    /// every member, or public; where it is held decides nothing. `{ done,
    /// why }`, or null where the act is not in a collective's name.
    #[wasm_bindgen(js_name = lawDone)]
    pub fn law_done(&self, specs: JsValue, act: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        match view.done(&unhex(act)?).map_err(lerr)? {
            None => Ok(JsValue::NULL),
            Some(r) => to_js(&DoneOut { done: r.is_ok(), why: r.err() }),
        }
    }

    /// A payment for a work, judged (F126, F127 W2, F128 W4): "purchase",
    /// "no-purchase" (a refund owed to the payer, with why), or "unrecorded"
    /// (on a request rail, a collective seller's actions chain has not
    /// recorded it yet; on a push rail (`specs.pushRails`), a holder has not
    /// signed its receipt yet, or receipts of one payment name different
    /// claims and the rail has not shown which the payment committed to),
    /// or "wrong-receipt" (F131 IT3: a receipt `specs.railInvalid` names,
    /// whose claim the payment did not commit to; it counts for nothing);
    /// null where the payment is not for a work.
    #[wasm_bindgen(js_name = lawPurchase)]
    pub fn law_purchase(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let Some(e) = view.purchase(&unhex(id)?).map_err(lerr)? else {
            return Ok(JsValue::NULL);
        };
        let (verdict, why) = match &e.verdict {
            law::PurchaseVerdict::Purchase => ("purchase", None),
            law::PurchaseVerdict::NoPurchase { why } => ("no-purchase", Some(why.clone())),
            law::PurchaseVerdict::Unrecorded => ("unrecorded", None),
            law::PurchaseVerdict::WrongReceipt { why } => ("wrong-receipt", Some(why.clone())),
        };
        let refund_to = match &e.refund_to {
            finance::RefundTo::Identity(h) => Some(hx(h)),
            finance::RefundTo::Key(_) => Some("the key the payment committed to".into()),
            finance::RefundTo::Nobody => None,
        };
        to_js(&PurchaseOut {
            verdict: verdict.into(),
            why,
            claim: e.purchase.as_ref().map(|p| (hx(&p.agreement), hx(&p.line))),
            refund_to,
        })
    }

    /// What a collective owes now (F125, D5): its obligations that bind,
    /// and those it owes as a fork's successor, neither paid in full by the
    /// receipts held nor ended by a creditor's release.
    #[wasm_bindgen(js_name = lawOwes)]
    pub fn law_owes(&self, specs: JsValue, collective: &str) -> R<Vec<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view.owes(&unhex(collective)?).map_err(lerr)?.iter().map(hx).collect())
    }

    /// The pointer check (rule 18, F123): whether the payee pointer of
    /// `owners` counts for Law under `agreement`: "no-split-service",
    /// "ordinary", "bypasses" (with the addresses no service's own pointer
    /// carries, as hex) or "undetermined".
    #[wasm_bindgen(js_name = lawPointerCheck)]
    pub fn law_pointer_check(&self, specs: JsValue, owners: &str, agreement: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let c = view
            .pointer_check(&unhex(owners)?, &unhex(agreement)?)
            .map_err(lerr)?;
        let o = match c {
            law::PointerCheck::NoSplitService => PointerOut { kind: "no-split-service".into(), ..Default::default() },
            law::PointerCheck::Ordinary { pointer, service } => PointerOut {
                kind: "ordinary".into(),
                pointer: Some(hx(&pointer)),
                service: Some(hx(&service)),
                ..Default::default()
            },
            law::PointerCheck::Bypasses { pointer, missing, vault_missing } => PointerOut {
                kind: "bypasses".into(),
                pointer: Some(hx(&pointer)),
                missing: missing
                    .iter()
                    .map(|r| (hx(&r.module), r.address.iter().map(|b| format!("{b:02x}")).collect()))
                    .collect(),
                vault_missing: vault_missing
                    .iter()
                    .map(|e| (hx(&e.rail_module), e.source.iter().map(|b| format!("{b:02x}")).collect()))
                    .collect(),
                ..Default::default()
            },
            law::PointerCheck::Undetermined { reason } => PointerOut {
                kind: "undetermined".into(),
                reason: Some(reason),
                ..Default::default()
            },
        };
        to_js(&o)
    }

    /// A split, judged (rules 20, 21, 26; F121 Q9, F124 N10): whether it
    /// sums to what arrived, each fee and who received it, the holders it
    /// pays and was not delivered to, and every payout that does not match
    /// its stake.
    #[wasm_bindgen(js_name = lawSplit)]
    pub fn law_split(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view.split(&unhex(id)?).map_err(lerr)?;
        to_js(&SplitOut {
            agreement: hx(&e.split.agreement),
            sums: e.sums,
            payouts: e
                .split
                .payouts
                .iter()
                .map(|p| (hx(&p.receiver), p.amount, p.stake, p.fee_module.as_ref().map(hx)))
                .collect(),
            fees: e.fees.iter().map(|(m, r, n)| (hx(m), hx(r), *n)).collect(),
            undelivered: e.undelivered.iter().map(hx).collect(),
            collective: e.collective.as_ref().map(hx),
            mismatched: e.mismatched.iter().map(|m| (m.stake, hx(&m.holder), m.paid, m.due)).collect(),
            problems: e.problems.clone(),
            in_force: hx(&e.in_force),
            unevidenced: e.unevidenced.iter().map(hx).collect(),
            unplanned: e.unplanned.iter().map(hx).collect(),
            turns_unknown: e.turns_unknown.clone(),
            breaks: e
                .breaks
                .iter()
                .map(|b| {
                    let pairs = |v: &[(mor_core::hash::Hash, u64)]| v.iter().map(|(h, n)| (hx(h), *n)).collect::<Vec<_>>();
                    match b {
                        law::ChainBreak::Reset { stake, with } => BreakOut { stake: *stake, kind: "reset".into(), with: with.iter().map(hx).collect(), ..Default::default() },
                        law::ChainBreak::Fork { stake, previous, with } => {
                            BreakOut { stake: *stake, kind: "fork".into(), previous: Some(hx(previous)), with: with.iter().map(hx).collect(), ..Default::default() }
                        }
                        law::ChainBreak::Count { stake, carried, expected } => BreakOut { stake: *stake, kind: "count".into(), carried: pairs(carried), expected: pairs(expected), ..Default::default() },
                        law::ChainBreak::NoCount { stake } => BreakOut { stake: *stake, kind: "no-count".into(), ..Default::default() },
                    }
                })
                .collect(),
            count_unknown: e.count_unknown.clone(),
            numbering: e.numbering.as_ref().map(|n| match n {
                law::NumberBreak::Unnumbered => NumberingOut { kind: "unnumbered".into(), number: None, with: vec![] },
                law::NumberBreak::Repeated { number, with } => NumberingOut { kind: "repeated".into(), number: Some(*number), with: with.iter().map(hx).collect() },
            }),
            cites: e.cites.iter().map(hx).collect(),
            tally: e.split.tally.iter().flatten().map(|(st, v)| (*st, v.iter().map(|(h, n)| (hx(h), *n)).collect())).collect(),
        })
    }

    /// What a split service owes (Law rule 29): every incoming receipt and
    /// payer's claim without its split, and every payout without the
    /// receiver's receipt, each naming one receiver and one agreement.
    #[wasm_bindgen(js_name = lawServiceAccount)]
    pub fn law_service_account(&self, specs: JsValue, service: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let a = view.service_account(&unhex(service)?).map_err(lerr)?;
        to_js(&ServiceAccountOut {
            service: hx(&a.service),
            unsplit: a.unsplit.iter().map(|u| (hx(&u.payment), u.claim, hx(&u.receiver), hx(&u.agreement), hx(&u.amount.unit), u.amount.value)).collect(),
            unpaid: a.unpaid.iter().map(|u| (hx(&u.split), u.payout, hx(&u.receiver), hx(&u.agreement), u.amount, u.received)).collect(),
        })
    }

    /// A public domain release, judged (rule 17, F121 shape D).
    #[wasm_bindgen(js_name = lawRelease)]
    pub fn law_release(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view.release(&unhex(id)?).map_err(lerr)?;
        to_js(&ReleaseOut {
            complete: e.complete,
            why: e.why.clone(),
            work: hx(&e.release.work),
            stakes: e.release.stakes.iter().map(|(a, i)| (hx(a), *i)).collect(),
            claims: e.release.claims.iter().map(hx).collect(),
            publications: e.release.keys.iter().map(|(p, _)| hx(p)).collect(),
            holders: e.holders.iter().map(hx).collect(),
            signed: e.signed.iter().map(hx).collect(),
            timed: e.release.timed.as_ref().map(|(_, k)| hx(k)),
        })
    }

    /// Whether a claim on a work is shown as made after its release: the
    /// release, if so (F121, D).
    #[wasm_bindgen(js_name = lawClaimAfterRelease)]
    pub fn law_claim_after_release(&self, specs: JsValue, claim: &str, work: &str) -> R<Option<String>> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        Ok(view
            .claim_after_release(&unhex(claim)?, &unhex(work)?)
            .map_err(lerr)?
            .map(|h| hx(&h)))
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ForkOut {
    complete: bool,
    /// Whether it is the ending that counts (F143); null while judged within that choice.
    counts: Option<bool>,
    why: Option<String>,
    agreement: String,
    collective: String,
    /// Each side: its successor, and its members.
    sides: Vec<(String, Vec<String>)>,
    voices: Vec<String>,
    signed: Vec<String>,
    leaving: Vec<String>,
    shares: Vec<u64>,
    by_count: bool,
    kept: Vec<(String, u64)>,
    debts: Vec<(String, Vec<u64>)>,
    unassigned: Vec<String>,
    named_shares: Vec<(String, u64, Vec<u64>)>,
    successors: Vec<Option<String>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ClosingOut {
    complete: bool,
    /// Whether it is the ending that counts (F143); null while judged within that choice.
    counts: Option<bool>,
    why: Option<String>,
    collective: String,
    voices: Vec<String>,
    signed: Vec<String>,
    holds: Vec<(String, u64)>,
    open_debts: Vec<String>,
    /// The money owed back it names as left open (field 4; QG1, F197):
    /// `[payment, notice or null, holder or null]`.
    left_open: Vec<(String, Option<String>, Option<String>)>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DoneOut {
    done: bool,
    why: Option<String>,
}

#[derive(Serialize)]
struct DeclarationNamingOut {
    act: String,
    signer: String,
    agreement: String,
    clause: String,
    outcomes: Vec<u64>,
    /// The contests of it the party signed (type 14; BQ4, F188): shown
    /// beside it; a contest voids nothing (rule 52).
    contests: Vec<String>,
}

#[derive(Serialize)]
struct RollbackRegistersOut {
    error: Option<String>,
    departures: Vec<DepartureOut>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OwedBackOut {
    payment: String,
    to: Option<String>,
    /// Who it is owed to: "identity", "key" (an anonymous payer's bare
    /// key, Finance rule 10a) or "nobody" (no key committed: it does not
    /// block a closing that names it, QG1).
    to_kind: String,
    unit: String,
    value: u64,
    still_broken: bool,
}

#[derive(Serialize)]
struct SplitNumbersOut {
    numbers: Vec<(u64, String)>,
    gaps: Vec<u64>,
    repeated: Vec<u64>,
    unnumbered: Vec<String>,
}

#[derive(Serialize)]
struct DealForkOut {
    reference: String,
    branches: Vec<Vec<String>>,
    /// Where the fork is tangled (F188, DQ1 to DQ4), why: the deal stays on
    /// its reference until one clean settlement.
    tangled: Option<&'static str>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ForkAlarmOut {
    named: String,
    held: String,
    shared: String,
    kind: &'static str,
    held_line: Vec<String>,
    named_line: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PurchaseOut {
    verdict: String,
    why: Option<String>,
    claim: Option<(String, String)>,
    refund_to: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DebtReleaseOut {
    counts: bool,
    why: Option<String>,
    obligation: String,
    against: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PayerSplitOut {
    pays: Vec<(String, u64)>,
    why: Option<String>,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
struct PointerOut {
    kind: String,
    pointer: Option<String>,
    service: Option<String>,
    missing: Vec<(String, String)>,
    vault_missing: Vec<(String, String)>,
    reason: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SplitOut {
    agreement: String,
    sums: Option<bool>,
    payouts: Vec<(String, u64, Option<u64>, Option<String>)>,
    fees: Vec<(String, String, u64)>,
    undelivered: Vec<String>,
    collective: Option<String>,
    /// (stake index, holder, paid, due) for each payout not matching (N10).
    mismatched: Vec<(u64, String, u64, u64)>,
    /// What makes it no split of the named service under the agreement in
    /// force (rules 20, 26): any entry breaks it.
    problems: Vec<String>,
    /// The version in force, against which the payouts are judged.
    in_force: String,
    /// Receivers of role payouts whose evidence does not hold (rule 22).
    unevidenced: Vec<String>,
    /// Receivers of fee and named-receiver payouts, which only the split
    /// plan (format open) could justify.
    unplanned: Vec<String>,
    /// Stakes whose tied leftover units cannot be checked: the turns cannot
    /// be read from the previous split act for the stake (F165, F171).
    turns_unknown: Vec<u64>,
    /// Breaks of the service's tally chain (rule 15a, rule 46b, F171): any
    /// breaks the plan.
    breaks: Vec<BreakOut>,
    /// Stakes whose running count cannot be checked from the acts held.
    count_unknown: Vec<u64>,
    /// A deal's split whose number breaks the plan (QF4, F190): null, or
    /// `{ kind: "unnumbered" }`, or `{ kind: "repeated", number, with }`.
    numbering: Option<NumberingOut>,
    /// The acts the split's envelope cites.
    cites: Vec<String>,
    /// The running count it carries, per stake: `[stake, [[hex, count]]]`
    /// (field 4, PROPOSED format).
    tally: Vec<(u64, Vec<(String, u64)>)>,
}

/// A deal's split whose number breaks the plan (QF4, F190).
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NumberingOut {
    kind: String,
    number: Option<u64>,
    with: Vec<String>,
}

/// A break of a split service's tally chain (F171): `kind` "reset" (it and
/// `with` cite no previous split), "fork" (it and `with` cite `previous`),
/// "count" (it carries `carried`, the text gives `expected`), "no-count".
#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
struct BreakOut {
    stake: u64,
    kind: String,
    with: Vec<String>,
    previous: Option<String>,
    carried: Vec<(String, u64)>,
    expected: Vec<(String, u64)>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ServiceAccountOut {
    service: String,
    /// (payment, is a payer's claim, receiver, agreement, unit, value).
    unsplit: Vec<(String, bool, String, String, String, u64)>,
    /// (split, payout index, receiver, agreement, amount, received).
    unpaid: Vec<(String, usize, String, String, u64, u64)>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ReleaseOut {
    complete: bool,
    why: Option<String>,
    work: String,
    stakes: Vec<(String, u64)>,
    claims: Vec<String>,
    publications: Vec<String>,
    holders: Vec<String>,
    signed: Vec<String>,
    /// A timed release (N11): the identity that delivers the keys.
    timed: Option<String>,
}

// ---------------------------------------------------------------- split safety keys

/// Randomness from the platform, for the share dealing's polynomials.
struct PlatformRng;

impl rand_core::RngCore for PlatformRng {
    fn next_u32(&mut self) -> u32 {
        u32::from_le_bytes(random::<4>())
    }
    fn next_u64(&mut self) -> u64 {
        u64::from_le_bytes(random::<8>())
    }
    fn fill_bytes(&mut self, dest: &mut [u8]) {
        getrandom::getrandom(dest).expect("crypto.getRandomValues");
    }
    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand_core::Error> {
        self.fill_bytes(dest);
        Ok(())
    }
}

impl rand_core::CryptoRng for PlatformRng {}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct HolderIn {
    /// 0 a member, 1 a custodian, 2 an escrow.
    role: u8,
    identity: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct DealIn {
    /// "words" or "hex": the seed Module that derives the key.
    seed_module: String,
    scheme: u8,
    index: u64,
    threshold: u64,
    holders: Vec<HolderIn>,
}

#[derive(Serialize)]
struct DealOut {
    /// One encoded share message (air-gapped Module 2.4) per holder, in order.
    shares: Vec<serde_bytes::ByteBuf>,
    scheme: u8,
    commit: String,
    fingerprint: String,
}

/// Deal a fresh safety key of a collective as shares, any `threshold` of
/// which rebuild it, with Pedersen commitments (air-gapped Module, section
/// 5; Law rule 36; F97). The key itself is never returned: only the
/// shares, its commitment and the dealing's fingerprint. **Test
/// collectives only**: here the dealing device is this program, in
/// software; a real collective deals on an offline device.
#[wasm_bindgen(js_name = dealSafety)]
pub fn deal_safety(input: JsValue) -> R<JsValue> {
    use mor_airgap::msg::{Holder, Message, Role};
    use mor_airgap::seed::SeedModule;
    use mor_airgap::shares;
    let d: DealIn = from_js(input)?;
    if !(2..=3).contains(&d.scheme) {
        return Err(err("safety schemes are 2 and 3"));
    }
    if d.threshold == 0 || d.threshold > d.holders.len() as u64 {
        return Err(err("1 ≤ threshold ≤ holders"));
    }
    let module =
        SeedModule::from_name(&d.seed_module).ok_or_else(|| err("seed Module: words or hex"))?;
    let holders = d
        .holders
        .iter()
        .map(|h| {
            Ok(Holder {
                role: match h.role {
                    0 => Role::Member,
                    1 => Role::Custodian,
                    2 => Role::Escrow,
                    _ => return Err(err("a holder's role is 0, 1 or 2")),
                },
                identity: h.identity.as_deref().map(unhex).transpose()?,
            })
        })
        .collect::<R<Vec<_>>>()?;
    let mut rng = PlatformRng;
    let seed = shares::fresh_dealable_seed(module, &mut rng);
    let dealt = shares::deal(&seed, d.scheme, d.index, d.threshold, holders, &mut rng);
    let dealing = dealt[0].dealing.clone();
    to_js(&DealOut {
        shares: dealt
            .into_iter()
            .map(|s| serde_bytes::ByteBuf::from(Message::Share(s).encode()))
            .collect(),
        scheme: d.scheme,
        commit: hx(&dealing.safety.commit),
        fingerprint: hx(&dealing.fingerprint()),
    })
}

fn share_of(bytes: &[u8]) -> R<mor_airgap::msg::Share> {
    use mor_airgap::msg::{kind, Message};
    match Message::decode_kind(bytes, kind::SHARE).map_err(err)? {
        Message::Share(s) => Ok(s),
        _ => Err(err("not a share")),
    }
}

#[derive(Serialize)]
struct ShareOut {
    x: u64,
    threshold: u64,
    holders: usize,
    index: u64,
    scheme: u8,
    commit: String,
    fingerprint: String,
}

/// A holder's own check of their share against the dealing's commitments
/// (Module 5.1). Throws if it does not lie on them. Returns what the holder
/// compares with every other holder: the dealing's fingerprint.
#[wasm_bindgen(js_name = verifyShare)]
pub fn verify_share(bytes: &[u8]) -> R<JsValue> {
    let s = share_of(bytes)?;
    mor_airgap::shares::verify_share(&s).map_err(err)?;
    let d = &s.dealing;
    to_js(&ShareOut {
        x: s.x,
        threshold: d.threshold,
        holders: d.holders.len(),
        index: d.index,
        scheme: match d.safety.scheme {
            Scheme::Founding(n) => n,
            _ => 0,
        },
        commit: hx(&d.safety.commit),
        fingerprint: hx(&d.fingerprint()),
    })
}

#[derive(Serialize)]
struct RebuiltOut {
    scheme: u8,
    #[serde(with = "serde_bytes")]
    seeds: Vec<u8>,
    commit: String,
}

/// Rebuild a collective's safety key from `threshold` shares, each checked,
/// and check it against the dealing's commitment (Module 5.1: the rebuild
/// check; at a rotation, the rotating device). Returns the FIPS 205 seeds to
/// sign one rotation with. **Test collectives only.**
#[wasm_bindgen(js_name = rebuildSafety)]
pub fn rebuild_safety(shares: Vec<js_sys::Uint8Array>) -> R<JsValue> {
    let shares = shares
        .iter()
        .map(|b| share_of(&b.to_vec()))
        .collect::<R<Vec<_>>>()?;
    let (seed, d) = mor_airgap::shares::rebuild(&shares).map_err(err)?;
    let scheme = match d.safety.scheme {
        Scheme::Founding(n @ (2 | 3)) => n,
        _ => return Err(err("the dealing's safety scheme")),
    };
    let key = seed.key(scheme, d.index);
    if key.commitment() != d.safety.commit {
        return Err(err(mor_airgap::shares::ShareError::WrongKey));
    }
    to_js(&RebuiltOut {
        scheme,
        seeds: seed.key_seeds(scheme, d.index).to_vec(),
        commit: hx(&d.safety.commit),
    })
}

// ---------------------------------------------------------------- media

/// The work hash of a plaintext, `tagged_hash("MOR/work", plaintext)` (Envelope, "Media").
#[wasm_bindgen(js_name = workHash)]
pub fn work_hash(plaintext: &[u8]) -> String {
    hx(&mor_core::hash::work_hash(plaintext))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LockedOut {
    #[serde(with = "serde_bytes")]
    locked: Vec<u8>,
    #[serde(with = "serde_bytes")]
    key: Vec<u8>,
    #[serde(with = "serde_bytes")]
    nonce: Vec<u8>,
    locked_hash: String,
    work_hash: String,
}

/// Lock a media object with a fresh content key and nonce (Envelope,
/// "Media": XChaCha20-Poly1305, no associated data).
#[wasm_bindgen(js_name = lockMedia)]
pub fn lock_media(plaintext: &[u8]) -> R<JsValue> {
    let key = random::<32>();
    let nonce = random::<24>();
    let locked = mor_core::lock::lock(plaintext, &key, &nonce);
    to_js(&LockedOut {
        locked_hash: hx(&mor_core::hash::sha256(&locked)),
        work_hash: work_hash(plaintext),
        locked,
        key: key.to_vec(),
        nonce: nonce.to_vec(),
    })
}

/// Open a locked media object. Throws if the key and nonce do not open it.
/// The caller checks the plaintext against the work hash (Envelope rule 14).
#[wasm_bindgen(js_name = openMedia)]
pub fn open_media(locked: &[u8], key: &[u8], nonce: &[u8]) -> R<Vec<u8>> {
    mor_core::lock::unlock(
        locked,
        &arr::<32>(key, "a content key")?,
        &arr::<24>(nonce, "a nonce")?,
    )
    .map_err(|_| err("the key does not open these bytes"))
}
