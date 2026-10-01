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
}

fn declarations_of(d: &Option<Vec<DeclIn>>) -> R<Option<Vec<identity::Declaration>>> {
    d.as_ref()
        .map(|v| {
            v.iter()
                .map(|x| {
                    Ok(identity::Declaration {
                        spec: unhex(&x.spec)?,
                        kind: x.kind,
                        value: match (&x.value, &x.signatures) {
                            (None, _) => None,
                            (Some(h), None) => Some(Value::Bytes(unhex(h)?.to_vec())),
                            (Some(h), Some(sigs)) => Some(Value::Array(vec![
                                Value::Bytes(unhex(h)?.to_vec()),
                                Value::Array(
                                    sigs.iter()
                                        .map(|x| Ok(Value::Bytes(unhex(x)?.to_vec())))
                                        .collect::<R<_>>()?,
                                ),
                            ])),
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
    /// until the freeze).
    #[wasm_bindgen(constructor)]
    pub fn new(identity_spec: &str) -> R<Verifier> {
        Ok(Verifier {
            inner: chain::Verifier::new(unhex(identity_spec)?),
            held: vec![],
        })
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
    /// "invalid" or "unknown".
    pub fn status(&self, act: &str) -> R<String> {
        Ok(match self.inner.status(&unhex(act)?) {
            Status::Valid => "valid",
            Status::Disputed => "disputed",
            Status::Void => "void",
            Status::Pending => "pending",
            Status::Invalid => "invalid",
            Status::Unknown => "unknown",
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
    period: Option<u64>,
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
    /// "constitutional", "clone", "area" or "plan".
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
    extensions: Option<Vec<String>>,
    succession: Option<Vec<SuccessionOut>>,
    /// Why the terms fail the checks that need no other act, or null.
    problem: Option<ProblemOut>,
}

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
                period: a.period,
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
/// `[agreement, agreement]`.
#[wasm_bindgen(js_name = resignationPayload)]
pub fn resignation_payload(agreement: &str, area: Option<u32>) -> R<Vec<u8>> {
    Ok(cbor::encode(&Value::Map(
        law::Resignation {
            agreement: unhex(agreement)?,
            area: area.map(u64::from),
        }
        .to_map(),
    )))
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

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CurrentOut {
    agreement: String,
    departed: Vec<String>,
    stepped_down: Vec<(u64, String)>,
    frozen: Vec<u64>,
    records: Vec<RecordOut>,
    fork: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BackingOut {
    /// "not-under-grant", "backed", "not-backed", "binds" or "undetermined".
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
            law::Consent::Broken { reason } => {
                o.kind = "broken".into();
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
            law::Consent::Invalid { agreement, reason } => {
                o.kind = "invalid".into();
                o.agreement = Some(hx(&agreement));
                o.reason = Some(reason);
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
            law::Backing::Undetermined { grant } => ("undetermined", Some(grant), None),
        };
        to_js(&BackingOut {
            kind: kind.into(),
            grant: grant.as_ref().map(hx),
            reason,
        })
    }
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
