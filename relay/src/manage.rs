//! The management page (roadmap step 11): an operator runs a relay or home
//! from a browser, without a terminal.
//!
//! Outside the protocol. The relay transport cMIP says how clients talk to
//! a relay; how its operator runs it is this program's own business, so
//! nothing here is an act and nothing here is signed by the operator's
//! identity.
//!
//! **Who may manage (decided by Nobody, allegedly, 30 September 2026).** The
//! relay serves its own page at `/manage/`. The operator's browser makes a
//! management key there (Ed25519, kept by the browser so that the page's own
//! code cannot copy it out) and pairs it once with a one-time code the relay
//! prints (`mor-relay pair`, or at `init`). From then on every request is
//! signed with that key, and the relay answers only keys it has paired. The
//! operator's identity keys are never used for this.
//!
//! A request is `POST /manage/api`, its body a JSON object
//! `{"relay", "time", "nonce", "op", "args"}`, with the headers `mor-key`
//! (the public key, hex) and `mor-signature` (hex), an Ed25519 signature of
//! [`DOMAIN`] followed by the body's exact bytes. `relay` is this relay's
//! management id (from `GET /manage/hello`), so a request made for one relay
//! cannot be replayed at another; `time` must be within five minutes of the
//! relay's clock, and each `nonce` is accepted once.

use crate::http::Shared;
use crate::node::{now, Fail, Node};
use crate::operator::{random, Keys};
use crate::wire::{self, Bundle};
use crate::{Policy, Role};
use axum::body::Bytes;
use axum::extract::{DefaultBodyLimit, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Redirect, Response};
use axum::routing::{get, post};
use axum::Router;
use ed25519_dalek::{Signature, VerifyingKey};
use mor_core::act::Act;
use mor_core::hash::{sha256, Hash};
use mor_core::identity::Payload;
use serde_json::{json, Map, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// What a management key signs, before the request body.
pub const DOMAIN: &[u8] = b"MOR relay management, version 1\n";

/// How far a request's time may be from the relay's clock, in seconds.
const SKEW: i64 = 300;

/// How long a pairing code lasts, in seconds.
pub const CODE_LIFE: i64 = 60 * 60;

/// Failed pairings accepted per minute, all browsers together, before the
/// relay asks everyone to slow down. A code has 100 random bits, so this
/// guards the relay's time, not the codes.
const PAIR_FAILURES_PER_MINUTE: u32 = 10;

/// The largest body a management request may have: enough for an operator
/// rotation and its key file, sent as hex.
const MAX_BODY: usize = 1 << 20;

/// Items listed per page of recent arrivals.
const RECENT: u64 = 50;

const MANAGE_ID: &str = "manage-id";

/// The built page (`clients/manage`, TypeScript), served by the relay itself
/// so that there is nothing else to deploy. `npm test` there checks that
/// these files are the build of the source beside them.
const INDEX: &str = include_str!("../manage/index.html");
const SCRIPT: &str = include_str!("../manage/manage.js");
const STYLE: &str = include_str!("../manage/manage.css");

/// The page may run its own script, talk to this relay only, and never be
/// framed.
pub const CONTENT_SECURITY_POLICY: &str = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

// ---------------------------------------------------------------- memory

/// What the running relay remembers between management requests: nonces
/// seen within the time window, and failed pairings this minute.
#[derive(Default)]
pub struct Guard {
    nonces: Mutex<HashMap<[u8; 16], i64>>,
    failures: Mutex<(i64, u32)>,
}

impl Guard {
    /// Accept a nonce once; forget those older than the window.
    fn fresh(&self, nonce: [u8; 16], time: i64, now: i64) -> bool {
        let mut n = self.nonces.lock().unwrap_or_else(|e| e.into_inner());
        n.retain(|_, t| (now - *t).abs() <= 2 * SKEW);
        n.insert(nonce, time).is_none()
    }

    fn may_try_pairing(&self, now: i64) -> bool {
        let f = self.failures.lock().unwrap_or_else(|e| e.into_inner());
        f.0 != now / 60 || f.1 < PAIR_FAILURES_PER_MINUTE
    }

    fn pairing_failed(&self, now: i64) {
        let mut f = self.failures.lock().unwrap_or_else(|e| e.into_inner());
        if f.0 != now / 60 {
            *f = (now / 60, 0);
        }
        f.1 += 1;
    }
}

// ---------------------------------------------------------------- pairing codes

/// Crockford's base 32: no I, L, O or U, so a code read aloud or typed
/// cannot be misread.
const ALPHABET: &[u8; 32] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/// A new one-time pairing code, kept (by its hash) for [`CODE_LIFE`]
/// seconds: four groups of five characters, 100 random bits.
pub fn new_code(node: &Node) -> Result<String, Fail> {
    let bytes = random::<13>();
    let mut bits: u128 = 0;
    for b in bytes {
        bits = (bits << 8) | b as u128;
    }
    let chars: String = (0..20)
        .map(|i| ALPHABET[((bits >> (i * 5)) & 31) as usize] as char)
        .collect();
    let code = format!(
        "{}-{}-{}-{}",
        &chars[..5],
        &chars[5..10],
        &chars[10..15],
        &chars[15..]
    );
    let h = code_hash(&code).expect("a code just made reads back");
    node.store().pairing_insert(&h, now() + CODE_LIFE)?;
    Ok(code)
}

/// A code as typed, read leniently (case, dashes and spaces, I and L for 1,
/// O for 0), and hashed.
fn code_hash(typed: &str) -> Option<Hash> {
    let mut s = String::new();
    for c in typed.chars() {
        let c = match c.to_ascii_uppercase() {
            '-' | ' ' => continue,
            'I' | 'L' => '1',
            'O' => '0',
            c => c,
        };
        if !ALPHABET.contains(&(c as u8)) || !c.is_ascii() {
            return None;
        }
        s.push(c);
    }
    (s.len() == 20).then(|| {
        let mut m = b"MOR relay pairing code\n".to_vec();
        m.extend_from_slice(s.as_bytes());
        sha256(&m)
    })
}

/// This relay's management id: random, made once, named in every request.
pub fn relay_id(node: &Node) -> Result<String, Fail> {
    let s = node.store();
    let id = match s.setting(MANAGE_ID)? {
        Some(b) => b,
        None => {
            let b = random::<16>().to_vec();
            s.set_setting(MANAGE_ID, &b)?;
            b
        }
    };
    Ok(id.iter().map(|b| format!("{b:02x}")).collect())
}

// ---------------------------------------------------------------- answers

struct Refusal(StatusCode, String);

type Answer = Result<Value, Refusal>;

fn refuse(status: StatusCode, msg: impl Into<String>) -> Refusal {
    Refusal(status, msg.into())
}

fn bad(msg: impl Into<String>) -> Refusal {
    refuse(StatusCode::BAD_REQUEST, msg)
}

impl From<Fail> for Refusal {
    fn from(f: Fail) -> Self {
        match f {
            Fail::Wire(e) => refuse(
                StatusCode::CONFLICT,
                e.reason
                    .unwrap_or_else(|| format!("refused (code {})", e.code)),
            ),
            Fail::Internal(m) => refuse(StatusCode::INTERNAL_SERVER_ERROR, m),
        }
    }
}

impl From<crate::store::DbError> for Refusal {
    fn from(e: crate::store::DbError) -> Self {
        Fail::from(e).into()
    }
}

fn json_response(status: StatusCode, v: Value) -> Response {
    (
        status,
        [
            (header::CONTENT_TYPE, "application/json"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        v.to_string(),
    )
        .into_response()
}

fn page(content_type: &'static str, body: &'static str) -> Response {
    (
        [
            (header::CONTENT_TYPE, content_type),
            (header::CONTENT_SECURITY_POLICY, CONTENT_SECURITY_POLICY),
            (header::X_CONTENT_TYPE_OPTIONS, "nosniff"),
            (header::REFERRER_POLICY, "no-referrer"),
            (header::CACHE_CONTROL, "no-cache"),
        ],
        body,
    )
        .into_response()
}

// ---------------------------------------------------------------- routes

/// The management routes. They carry no CORS headers: only the page this
/// relay serves may call them from a browser.
pub fn routes() -> Router<Arc<Shared>> {
    Router::new()
        .route("/manage", get(|| async { Redirect::permanent("/manage/") }))
        .route(
            "/manage/",
            get(|| async { page("text/html; charset=utf-8", INDEX) }),
        )
        .route(
            "/manage/manage.js",
            get(|| async { page("text/javascript; charset=utf-8", SCRIPT) }),
        )
        .route(
            "/manage/manage.css",
            get(|| async { page("text/css; charset=utf-8", STYLE) }),
        )
        .route("/manage/hello", get(hello))
        .route("/manage/api", post(api))
        .layer(DefaultBodyLimit::max(MAX_BODY))
}

/// `GET /manage/hello`: what a browser needs before it signs anything.
async fn hello(State(s): State<Arc<Shared>>) -> Response {
    let node = s.node();
    match relay_id(&node) {
        Ok(id) => json_response(
            StatusCode::OK,
            json!({ "relay": id, "time": now(), "role": role_name(&node) }),
        ),
        Err(f) => {
            let Refusal(status, msg) = f.into();
            json_response(status, json!({ "error": msg }))
        }
    }
}

async fn api(State(s): State<Arc<Shared>>, headers: HeaderMap, body: Bytes) -> Response {
    match handle(&s, &headers, &body) {
        Ok(v) => json_response(StatusCode::OK, json!({ "ok": v })),
        Err(Refusal(status, msg)) => json_response(status, json!({ "error": msg })),
    }
}

fn header_hex<const N: usize>(headers: &HeaderMap, name: &str) -> Option<[u8; N]> {
    let v = headers.get(name)?.to_str().ok()?;
    hex_bytes(v)?.try_into().ok()
}

fn hex_bytes(s: &str) -> Option<Vec<u8>> {
    if !s.len().is_multiple_of(2) {
        return None;
    }
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(s.get(i..i + 2)?, 16).ok())
        .collect()
}

/// Check a signed request, then do what it asks.
fn handle(s: &Shared, headers: &HeaderMap, body: &[u8]) -> Answer {
    let unauthorized = |m: &str| refuse(StatusCode::UNAUTHORIZED, m);
    let key: [u8; 32] =
        header_hex(headers, "mor-key").ok_or_else(|| unauthorized("no management key"))?;
    let sig: [u8; 64] =
        header_hex(headers, "mor-signature").ok_or_else(|| unauthorized("no signature"))?;
    let vk = VerifyingKey::from_bytes(&key).map_err(|_| unauthorized("not an Ed25519 key"))?;
    let mut msg = DOMAIN.to_vec();
    msg.extend_from_slice(body);
    vk.verify_strict(&msg, &Signature::from_bytes(&sig))
        .map_err(|_| unauthorized("the signature does not match the request"))?;

    let req: Value = serde_json::from_slice(body).map_err(|_| bad("the request is not JSON"))?;
    let field = |k: &str| req.get(k);
    let now = now();
    let time = field("time")
        .and_then(Value::as_i64)
        .ok_or_else(|| bad("no time"))?;
    if (time - now).abs() > SKEW {
        return Err(unauthorized(
            "the request's time is more than five minutes from this relay's clock",
        ));
    }
    let nonce: [u8; 16] = field("nonce")
        .and_then(Value::as_str)
        .and_then(hex_bytes)
        .and_then(|b| b.try_into().ok())
        .ok_or_else(|| bad("no nonce"))?;
    let op = field("op")
        .and_then(Value::as_str)
        .ok_or_else(|| bad("no op"))?
        .to_string();
    let empty = Value::Object(Map::new());
    let args = field("args").unwrap_or(&empty);

    let mut node = s.node();
    if field("relay").and_then(Value::as_str) != Some(relay_id(&node)?.as_str()) {
        return Err(unauthorized("the request was made for another relay"));
    }
    if !s.manage.fresh(nonce, time, now) {
        return Err(unauthorized("the request was already answered"));
    }
    if op == "pair" {
        return pair(s, &node, &key, args, now);
    }
    if !node.store().is_manager(&key)? {
        return Err(unauthorized(
            "this browser is not paired with this relay: pair it with a code from `mor-relay pair`",
        ));
    }
    run(&mut node, &key, &op, args)
}

fn pair(s: &Shared, node: &Node, key: &[u8; 32], args: &Value, now: i64) -> Answer {
    if !s.manage.may_try_pairing(now) {
        return Err(refuse(
            StatusCode::TOO_MANY_REQUESTS,
            "too many wrong codes: try again in a minute",
        ));
    }
    let code = args.get("code").and_then(Value::as_str).unwrap_or("");
    let label = label(args)?;
    let taken = match code_hash(code) {
        Some(h) => node.store().pairing_take(&h, now)?,
        None => false,
    };
    if !taken {
        s.manage.pairing_failed(now);
        return Err(refuse(
            StatusCode::UNAUTHORIZED,
            "that code is not one this relay gave, or it was used or has expired: make a new one with `mor-relay pair`",
        ));
    }
    node.store().manager_insert(key, &label, now)?;
    Ok(json!({ "paired": true }))
}

/// A label for a paired browser: up to 64 characters, no control characters.
fn label(args: &Value) -> Result<String, Refusal> {
    let l = args
        .get("label")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();
    if l.is_empty() {
        return Err(bad(
            "give this browser a name, so you can tell it apart later",
        ));
    }
    if l.chars().count() > 64 || l.chars().any(char::is_control) {
        return Err(bad(
            "a name is up to 64 characters, with no control characters",
        ));
    }
    Ok(l)
}

/// The operator's rotations report what they found wrong with what they
/// were given as the relay's own faults; on the page they are refusals.
fn checked(f: Fail) -> Refusal {
    match f {
        Fail::Internal(m) => refuse(StatusCode::CONFLICT, m),
        w => w.into(),
    }
}

fn role_name(node: &Node) -> &'static str {
    match node.config().role {
        Role::Home => "home",
        Role::Relay => "relay",
    }
}

fn hash_arg(args: &Value, name: &str) -> Result<Hash, Refusal> {
    args.get(name)
        .and_then(Value::as_str)
        .and_then(|s| wire::parse_hex(s.trim()))
        .ok_or_else(|| bad(format!("{name}: 64 lowercase hexadecimal characters")))
}

fn hex_arg(args: &Value, name: &str) -> Result<Vec<u8>, Refusal> {
    args.get(name)
        .and_then(Value::as_str)
        .and_then(hex_bytes)
        .ok_or_else(|| bad(format!("{name}: a file, sent as hexadecimal")))
}

fn home_only(node: &Node) -> Result<(), Refusal> {
    match node.config().role {
        Role::Home => Ok(()),
        Role::Relay => Err(bad("only a home does that")),
    }
}

/// What each management request does.
fn run(node: &mut Node, key: &[u8; 32], op: &str, args: &Value) -> Answer {
    let h = |x: &Hash| Value::String(wire::hex(x));
    let oh = |x: &Option<Hash>| x.as_ref().map(h).unwrap_or(Value::Null);
    match op {
        "status" => {
            let c = node.config().clone();
            let counts = node.counts()?;
            let home = c.role == Role::Home;
            let pending = if home {
                node.pending()?.iter().filter(|p| !p.approved).count()
            } else {
                0
            };
            Ok(json!({
                "role": role_name(node),
                "bases": c.bases,
                "policy": match c.policy { Policy::Open => "open", Policy::Allowlist => "allowlist" },
                "policyText": node.info().policy,
                "limits": { "act": c.limits.act, "media": c.limits.media, "feed": c.limits.feed, "wait": c.limits.wait },
                "operator": oh(&node.operator()),
                "holdsSafetyKey": node.holds_safety_key(),
                "closed": node.closed()?,
                "counts": { "acts": counts.acts, "sealed": counts.sealed, "media": counts.media, "bytes": counts.bytes },
                "arrivals": node.max_arrival()?,
                "served": if home { node.served()?.len() } else { 0 },
                "log": if home { node.log_len()? } else { 0 },
                "pending": pending,
                "allowlist": node.allow_list()?.len(),
                "newIdentityLimit": node.newcomer_limit()?,
                "newIdentitiesToday": if home { node.newcomers_today()? } else { 0 },
                "version": env!("CARGO_PKG_VERSION"),
            }))
        }
        "recent" => {
            let before = args.get("before").and_then(Value::as_u64);
            let specs = node.specs();
            let items: Vec<Value> = node
                .recent(before, RECENT)?
                .iter()
                .map(|it| {
                    let spec = it.spec.map(|s| {
                        if s == specs.identity {
                            "identity".to_string()
                        } else if s == specs.envelopes {
                            "envelope".to_string()
                        } else {
                            wire::hex(&s)
                        }
                    });
                    json!({
                        "arrival": it.arrival,
                        "kind": match it.kind { 0 => "act", 1 => "sealed", _ => "media" },
                        "id": h(&it.id),
                        "size": it.size,
                        "signer": oh(&it.signer),
                        "spec": spec,
                        "type": it.type_,
                    })
                })
                .collect();
            Ok(Value::Array(items))
        }
        "identities" => {
            home_only(node)?;
            let strict = node.strict_list()?;
            let allowed = node.allow_list()?;
            let op = node.operator();
            let list: Vec<Value> = node
                .served()?
                .iter()
                .map(|(i, chain)| {
                    json!({
                        "identity": h(i),
                        "operator": Some(*i) == op,
                        "chain": chain.iter().map(|(p, a, r)| json!({
                            "position": p, "act": h(a), "receipted": r.is_some()
                        })).collect::<Vec<_>>(),
                        "strict": strict.contains(i),
                        "allowed": allowed.contains(i),
                    })
                })
                .collect();
            Ok(Value::Array(list))
        }
        "allowlist" => Ok(Value::Array(node.allow_list()?.iter().map(h).collect())),
        "allow" => {
            node.allow(&hash_arg(args, "identity")?)?;
            Ok(Value::Null)
        }
        "disallow" => {
            node.disallow(&hash_arg(args, "identity")?)?;
            Ok(Value::Null)
        }
        "strict" => {
            home_only(node)?;
            let i = hash_arg(args, "identity")?;
            match args.get("on").and_then(Value::as_bool) {
                Some(true) => node.set_strict(&i)?,
                Some(false) => node.unset_strict(&i)?,
                None => return Err(bad("on: true or false")),
            }
            Ok(Value::Null)
        }
        "pending" => {
            home_only(node)?;
            let specs = node.specs();
            let list: Vec<Value> = node
                .pending()?
                .iter()
                .map(|p| {
                    let rotation = Act::decode(&p.bytes)
                        .ok()
                        .and_then(|a| a.open(None).ok())
                        .filter(|i| i.spec == specs.identity)
                        .and_then(|i| Payload::decode(i.type_, &i.payload).ok());
                    let (homeless, closure, homes) = match rotation {
                        Some(Payload::Rotation(r)) => (
                            r.homeless,
                            r.closure,
                            r.homes
                                .map(|hs| {
                                    hs.iter()
                                        .map(|x| json!({ "operator": oh(&x.operator), "hint": x.hint }))
                                        .collect::<Vec<_>>()
                                })
                                .map(Value::Array)
                                .unwrap_or(Value::Null),
                        ),
                        _ => (false, false, Value::Null),
                    };
                    json!({
                        "rotation": h(&p.rotation),
                        "identity": h(&p.identity),
                        "position": p.position,
                        "at": p.at,
                        "approved": p.approved,
                        "homeless": homeless,
                        "closure": closure,
                        "homes": homes,
                    })
                })
                .collect();
            Ok(Value::Array(list))
        }
        "approve" => {
            home_only(node)?;
            node.approve(&hash_arg(args, "rotation")?)?;
            Ok(Value::Null)
        }
        "limit" => {
            home_only(node)?;
            let limit = match args.get("perDay") {
                None | Some(Value::Null) => None,
                Some(v) => Some(
                    v.as_u64()
                        .ok_or_else(|| bad("perDay: a whole number, or null for no limit"))?,
                ),
            };
            node.set_newcomer_limit(limit)?;
            Ok(Value::Null)
        }
        "rotate" => {
            home_only(node)?;
            let closure = args
                .get("closure")
                .and_then(Value::as_bool)
                .unwrap_or(false);
            let expected = if closure { "close" } else { "rotate" };
            if args.get("confirm").and_then(Value::as_str) != Some(expected) {
                return Err(bad(format!("to confirm, type \"{expected}\"")));
            }
            if !node.holds_safety_key() {
                return Err(refuse(
                    StatusCode::CONFLICT,
                    "the operator's safety key is not on this server: rotate where it is kept, then hand the rotation and the new key file to this home",
                ));
            }
            let id = node.rotate_operator(closure).map_err(checked)?;
            Ok(json!({ "rotation": h(&id), "operator": oh(&node.operator()) }))
        }
        "rotated" => {
            home_only(node)?;
            let keys = Keys::decode(&hex_arg(args, "key")?)
                .ok_or_else(|| bad("key: not a MOR key file"))?;
            let bundle = Bundle::decode(&hex_arg(args, "rotation")?)
                .map_err(|e| bad(format!("rotation: not a bundle: {e}")))?;
            let [act] = bundle.acts.as_slice() else {
                return Err(bad("rotation: the bundle must hold the rotation alone"));
            };
            let id = node.operator_rotated(act, keys).map_err(checked)?;
            Ok(json!({ "rotation": h(&id) }))
        }
        "managers" => {
            let list: Vec<Value> = node
                .store()
                .managers()?
                .iter()
                .map(|m| {
                    json!({
                        "key": wire::hex(&m.key),
                        "label": m.label,
                        "added": m.added,
                        "you": &m.key == key,
                    })
                })
                .collect();
            Ok(Value::Array(list))
        }
        "unpair" => {
            let k: [u8; 32] = args
                .get("key")
                .and_then(Value::as_str)
                .and_then(hex_bytes)
                .and_then(|b| b.try_into().ok())
                .ok_or_else(|| bad("key: 64 hexadecimal characters"))?;
            if !node.store().manager_remove(&k)? {
                return Err(bad("that key is not paired"));
            }
            Ok(Value::Null)
        }
        "code" => {
            let code = new_code(node)?;
            Ok(json!({ "code": code, "expires": now() + CODE_LIFE }))
        }
        _ => Err(bad(format!("{op}: not a management request"))),
    }
}
