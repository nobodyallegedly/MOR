//! The relay transport cMIP over HTTP: every request of the cMIP, CBOR
//! bodies, `Access-Control-Allow-Origin: *` on every answer (cMIP,
//! "Clients", 4), and feed requests that wait for new items.

use crate::client::{self, Client, ClientError, Reach};
use crate::node::{self, Fail, Node, Put};
use crate::store::Filter;
use crate::wire::{self, code, part, WireError};
use axum::body::{Body, Bytes};
use axum::extract::rejection::BytesRejection;
use axum::extract::{DefaultBodyLimit, Path, RawQuery, State};
use axum::http::{header, HeaderMap, HeaderValue, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::Router;
use mor_core::hash::Hash;
use std::sync::{Arc, Mutex, MutexGuard};
use std::time::Duration;
use tokio::sync::watch;
use tower_http::cors::{Any, CorsLayer};

/// How this relay reaches other relays: for probes, and to forward
/// homeless rotations to the old homes.
#[derive(Clone)]
pub struct Net {
    direct: reqwest::Client,
    tor: Option<reqwest::Client>,
    /// Plain `http` to addresses that are not onion addresses: local tests only.
    allow_http: bool,
}

impl Net {
    pub fn new(tor_proxy: Option<&str>, allow_http: bool) -> Self {
        Net {
            direct: client::http_client(None),
            tor: tor_proxy.map(|p| client::http_client(Some(p))),
            allow_http,
        }
    }

    /// A client for a base address, if this relay may and can reach it.
    pub fn client(&self, addr: &str) -> Option<Client> {
        match client::reach(addr) {
            Reach::Direct => Some(Client::with_http(self.direct.clone(), addr)),
            Reach::Onion => self
                .tor
                .as_ref()
                .map(|t| Client::with_http(t.clone(), addr)),
            Reach::TestOnly if self.allow_http => {
                Some(Client::with_http(self.direct.clone(), addr))
            }
            _ => None,
        }
    }
}

/// Everything the handlers share.
pub struct Shared {
    node: Mutex<Node>,
    arrivals: watch::Sender<u64>,
    net: Net,
    pub(crate) manage: crate::manage::Guard,
}

impl Shared {
    pub fn new(node: Node, net: Net) -> Arc<Self> {
        let max = node.max_arrival().unwrap_or(0);
        Arc::new(Shared {
            node: Mutex::new(node),
            arrivals: watch::channel(max).0,
            net,
            manage: Default::default(),
        })
    }

    pub fn node(&self) -> MutexGuard<'_, Node> {
        self.node.lock().unwrap_or_else(|e| e.into_inner())
    }

    fn arrived(&self, arrival: u64) {
        self.arrivals.send_if_modified(|a| {
            let newer = arrival > *a;
            if newer {
                *a = arrival;
            }
            newer
        });
    }

    /// Store acts another relay handed back (objections, receipts, chain
    /// acts), exactly as if published here. Refusals are ignored.
    fn keep(&self, acts: &[Vec<u8>]) {
        for a in acts {
            let put = self.node().put_act(a);
            if let Ok(p) = put {
                self.arrived(p.result.arrival);
            }
        }
    }
}

// ---------------------------------------------------------------- answers

const CBOR: &str = "application/cbor";
const IMMUTABLE: &str = "public, max-age=31536000, immutable";

fn cbor(bytes: Vec<u8>) -> Response {
    ([(header::CONTENT_TYPE, CBOR)], bytes).into_response()
}

fn item(bytes: Vec<u8>) -> Response {
    (
        [
            (header::CONTENT_TYPE, CBOR),
            (header::CACHE_CONTROL, IMMUTABLE),
        ],
        bytes,
    )
        .into_response()
}

fn error(e: WireError) -> Response {
    let status = StatusCode::from_u16(e.http_status()).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
    (status, [(header::CONTENT_TYPE, CBOR)], e.encode()).into_response()
}

fn fail(f: Fail) -> Response {
    match f {
        Fail::Wire(e) => error(e),
        Fail::Internal(msg) => {
            eprintln!("internal error: {msg}");
            let e = WireError::new(
                code::SLOW_DOWN,
                "an internal error at this relay; try again later",
            );
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, CBOR)],
                e.encode(),
            )
                .into_response()
        }
    }
}

fn malformed(reason: &str) -> WireError {
    WireError::malformed(reason)
}

fn answer<T>(r: Result<T, Fail>, ok: impl FnOnce(T) -> Response) -> Response {
    match r {
        Ok(v) => ok(v),
        Err(f) => fail(f),
    }
}

/// A request body, or the cMIP's error for one too large to read.
fn body(b: Result<Bytes, BytesRejection>) -> Result<Bytes, WireError> {
    b.map_err(|r| match r.status() {
        StatusCode::PAYLOAD_TOO_LARGE => WireError::new(
            code::TOO_LARGE,
            "the body is larger than this relay accepts",
        ),
        _ => WireError::malformed("the body could not be read"),
    })
}

// ---------------------------------------------------------------- queries

/// A query string as distinct `name=value` pairs, only from `allowed`.
fn query(raw: Option<String>, allowed: &[&str]) -> Result<Vec<(String, String)>, WireError> {
    let mut out: Vec<(String, String)> = vec![];
    for pair in raw.unwrap_or_default().split('&').filter(|p| !p.is_empty()) {
        let (k, v) = pair
            .split_once('=')
            .ok_or_else(|| malformed("a query parameter without a value"))?;
        if !allowed.contains(&k) {
            return Err(malformed(&format!("unknown query parameter {k}")));
        }
        if out.iter().any(|(x, _)| x == k) {
            return Err(malformed(&format!("query parameter {k} given twice")));
        }
        out.push((k.to_string(), v.to_string()));
    }
    Ok(out)
}

fn param<'a>(q: &'a [(String, String)], k: &str) -> Option<&'a str> {
    q.iter().find(|(x, _)| x == k).map(|(_, v)| v.as_str())
}

fn num(q: &[(String, String)], k: &str) -> Result<Option<u64>, WireError> {
    match param(q, k) {
        None => Ok(None),
        Some(v)
            if !v.is_empty()
                && v.bytes().all(|c| c.is_ascii_digit())
                && (v == "0" || !v.starts_with('0')) =>
        {
            v.parse()
                .map(Some)
                .map_err(|_| malformed(&format!("{k} is not a number")))
        }
        Some(_) => Err(malformed(&format!("{k} is not a decimal number"))),
    }
}

fn need(q: &[(String, String)], k: &str) -> Result<u64, WireError> {
    num(q, k)?.ok_or_else(|| malformed(&format!("{k} is required")))
}

fn hash_param(q: &[(String, String)], k: &str) -> Result<Option<Hash>, WireError> {
    match param(q, k) {
        None => Ok(None),
        Some(v) => wire::parse_hex(v)
            .map(Some)
            .ok_or_else(|| malformed(&format!("{k} is not 64 lowercase hexadecimal characters"))),
    }
}

fn path_hash(s: &str) -> Result<Hash, WireError> {
    wire::parse_hex(s)
        .ok_or_else(|| malformed("a hash is written as 64 lowercase hexadecimal characters"))
}

// ---------------------------------------------------------------- handlers

async fn info(State(s): State<Arc<Shared>>) -> Response {
    cbor(s.node().info().encode())
}

async fn put_act(State(s): State<Arc<Shared>>, b: Result<Bytes, BytesRejection>) -> Response {
    let body = match body(b) {
        Ok(b) => b,
        Err(e) => return error(e),
    };
    let r = s.node().put_act(&body);
    match r {
        Ok(Put { result, forward }) => {
            s.arrived(result.arrival);
            if let Some((rotation, hints)) = forward {
                tokio::spawn(forward_homeless(s.clone(), rotation, hints));
            }
            cbor(result.encode())
        }
        Err(f) => fail(f),
    }
}

/// A relay given a homeless rotation submits it to the old homes it can
/// reach, and keeps any objection it gets back (cMIP, "Proof of life
/// travels", 2).
async fn forward_homeless(s: Arc<Shared>, rotation: Vec<u8>, hints: Vec<String>) {
    for h in hints.into_iter().take(PROBE_ADDRESSES) {
        let Some(c) = s.net.client(&h) else { continue };
        match c.put_act(&rotation).await {
            Ok(r) => s.keep(&r.objection.into_iter().collect::<Vec<_>>()),
            Err(ClientError::Wire(e)) => s.keep(&e.acts),
            Err(_) => {}
        }
    }
}

async fn get_act(State(s): State<Arc<Shared>>, Path(id): Path<String>) -> Response {
    let id = match path_hash(&id) {
        Ok(h) => h,
        Err(e) => return error(e),
    };
    let r = s.node().get_act(&id);
    answer(r, item)
}

async fn get_acts(State(s): State<Arc<Shared>>, b: Result<Bytes, BytesRejection>) -> Response {
    let body = match body(b) {
        Ok(b) => b,
        Err(e) => return error(e),
    };
    let ids = match wire::decode_ids(&body) {
        Ok(ids) => ids,
        Err(m) => return error(m.into()),
    };
    let r = s.node().get_acts(&ids);
    answer(r, |v| cbor(wire::encode_maybe_items(&v)))
}

async fn put_sealed(State(s): State<Arc<Shared>>, b: Result<Bytes, BytesRejection>) -> Response {
    let body = match body(b) {
        Ok(b) => b,
        Err(e) => return error(e),
    };
    let r = s.node().put_sealed(&body);
    answer(r, |p| {
        s.arrived(p.arrival);
        cbor(p.encode())
    })
}

async fn get_sealed(State(s): State<Arc<Shared>>, Path(id): Path<String>) -> Response {
    let id = match path_hash(&id) {
        Ok(h) => h,
        Err(e) => return error(e),
    };
    let r = s.node().get_sealed(&id);
    answer(r, item)
}

async fn put_media(State(s): State<Arc<Shared>>, b: Result<Bytes, BytesRejection>) -> Response {
    let body = match body(b) {
        Ok(b) => b,
        Err(e) => return error(e),
    };
    let r = s.node().put_media(&body);
    answer(r, |(h, size, arrival)| {
        s.arrived(arrival);
        cbor(wire::encode_media_result(&h, size))
    })
}

/// Media, whole or by one HTTP range (cMIP, "Fetching": a relay MUST
/// support range requests on media).
async fn get_media(
    State(s): State<Arc<Shared>>,
    Path(h): Path<String>,
    headers: HeaderMap,
) -> Response {
    let h = match path_hash(&h) {
        Ok(h) => h,
        Err(e) => return error(e),
    };
    let r = s.node().media(&h);
    let (path, size) = match r {
        Ok(v) => v,
        Err(f) => return fail(f),
    };
    let bytes = match tokio::fs::read(&path).await {
        Ok(b) => b,
        Err(e) => return fail(Fail::Internal(e.to_string())),
    };
    let base = [
        (header::CONTENT_TYPE, "application/octet-stream"),
        (header::CACHE_CONTROL, IMMUTABLE),
        (header::ACCEPT_RANGES, "bytes"),
    ];
    let Some(range) = headers.get(header::RANGE) else {
        return (base, bytes).into_response();
    };
    match parse_range(range.to_str().unwrap_or(""), size) {
        Some((first, last)) => {
            let part = bytes[first as usize..=last as usize].to_vec();
            let mut resp = (StatusCode::PARTIAL_CONTENT, base, part).into_response();
            resp.headers_mut().insert(
                header::CONTENT_RANGE,
                HeaderValue::from_str(&format!("bytes {first}-{last}/{size}")).unwrap(),
            );
            resp
        }
        None => {
            let mut resp = (StatusCode::RANGE_NOT_SATISFIABLE, Body::empty()).into_response();
            resp.headers_mut().insert(
                header::CONTENT_RANGE,
                HeaderValue::from_str(&format!("bytes */{size}")).unwrap(),
            );
            resp
        }
    }
}

/// One range, `bytes=a-b`, `bytes=a-` or `bytes=-n`, as `first..=last`.
fn parse_range(v: &str, size: u64) -> Option<(u64, u64)> {
    let spec = v.strip_prefix("bytes=")?;
    if spec.contains(',') || size == 0 {
        return None;
    }
    let (a, b) = spec.split_once('-')?;
    let (first, last) = match (a.is_empty(), b.is_empty()) {
        (false, false) => (a.parse().ok()?, b.parse::<u64>().ok()?.min(size - 1)),
        (false, true) => (a.parse().ok()?, size - 1),
        (true, false) => {
            let n: u64 = b.parse().ok()?;
            if n == 0 {
                return None;
            }
            (size.saturating_sub(n), size - 1)
        }
        (true, true) => return None,
    };
    (first <= last && first < size).then_some((first, last))
}

async fn feed(State(s): State<Arc<Shared>>, RawQuery(raw): RawQuery) -> Response {
    let q = match query(
        raw,
        &[
            "signer",
            "to",
            "pickup",
            "unaddressed",
            "spec",
            "type",
            "after",
            "limit",
            "wait",
        ],
    ) {
        Ok(q) => q,
        Err(e) => return error(e),
    };
    let parsed = (|| -> Result<(Filter, u64, Option<u64>, u64), WireError> {
        let unaddressed = match param(&q, "unaddressed") {
            None | Some("0") => false,
            Some("1") => true,
            Some(_) => return Err(malformed("unaddressed is 1 or 0")),
        };
        let f = Filter {
            signer: hash_param(&q, "signer")?,
            to: hash_param(&q, "to")?,
            pickup: hash_param(&q, "pickup")?,
            unaddressed,
            spec: hash_param(&q, "spec")?,
            type_: num(&q, "type")?,
        };
        if f.type_.is_some() && f.spec.is_none() {
            return Err(malformed("type is a type within a spec: give spec too"));
        }
        Ok((
            f,
            num(&q, "after")?.unwrap_or(0),
            num(&q, "limit")?,
            num(&q, "wait")?.unwrap_or(0),
        ))
    })();
    let (f, after, limit, wait) = match parsed {
        Ok(p) => p,
        Err(e) => return error(e),
    };
    let wait = Duration::from_secs(wait.min(s.node().config().limits.wait));
    let deadline = tokio::time::Instant::now() + wait;
    let mut rx = s.arrivals.subscribe();
    loop {
        let page = s.node().feed(&f, after, limit);
        match page {
            Ok(p) if p.items.is_empty() && tokio::time::Instant::now() < deadline => {
                if tokio::time::timeout_at(deadline, rx.changed())
                    .await
                    .is_err()
                {
                    let last = s.node().feed(&f, after, limit);
                    return answer(last, |p| cbor(p.encode()));
                }
            }
            other => return answer(other, |p| cbor(p.encode())),
        }
    }
}

async fn commitment() -> Response {
    error(WireError::new(
        code::NOT_HELD,
        "this relay publishes no commitment: the Merkle construction for commitments is still open in the Envelope MIP",
    ))
}

async fn identity(
    State(s): State<Arc<Shared>>,
    Path(id): Path<String>,
    RawQuery(raw): RawQuery,
) -> Response {
    let id = match path_hash(&id) {
        Ok(h) => h,
        Err(e) => return error(e),
    };
    let q = match query(raw, &["parts"]) {
        Ok(q) => q,
        Err(e) => return error(e),
    };
    let parts: Vec<u64> = match param(&q, "parts") {
        None => part::ALL.to_vec(),
        Some(list) => {
            let ps: Option<Vec<u64>> = list
                .split(',')
                .map(|p| p.parse().ok().filter(|n| (1..=8).contains(n)))
                .collect();
            match ps {
                Some(ps) => ps,
                None => {
                    return error(malformed(
                        "parts is a comma-separated list of part numbers, 1 to 8",
                    ))
                }
            }
        }
    };
    let r = s.node().identity_record(&id, &parts);
    answer(r, |rec| cbor(rec.encode()))
}

async fn log_summary(State(s): State<Arc<Shared>>, RawQuery(raw): RawQuery) -> Response {
    let size = match query(raw, &["size"]).and_then(|q| num(&q, "size")) {
        Ok(n) => n,
        Err(e) => return error(e),
    };
    let r = s.node().log_summary(size);
    answer(r, |(summary, cos)| {
        cbor(wire::encode_summary(&summary, &cos))
    })
}

async fn log_receipt(State(s): State<Arc<Shared>>, RawQuery(raw): RawQuery) -> Response {
    let position = match query(raw, &["position"]).and_then(|q| need(&q, "position")) {
        Ok(n) => n,
        Err(e) => return error(e),
    };
    let r = s.node().log_receipt(position);
    answer(r, item)
}

async fn log_inclusion(State(s): State<Arc<Shared>>, RawQuery(raw): RawQuery) -> Response {
    let (position, size) = match query(raw, &["position", "size"])
        .and_then(|q| Ok((need(&q, "position")?, need(&q, "size")?)))
    {
        Ok(v) => v,
        Err(e) => return error(e),
    };
    let r = s.node().log_inclusion(position, size);
    answer(r, |p| cbor(wire::encode_proof(&p)))
}

async fn log_consistency(State(s): State<Arc<Shared>>, RawQuery(raw): RawQuery) -> Response {
    let (from, to) =
        match query(raw, &["from", "to"]).and_then(|q| Ok((need(&q, "from")?, need(&q, "to")?))) {
            Ok(v) => v,
            Err(e) => return error(e),
        };
    let r = s.node().log_consistency(from, to);
    answer(r, |p| cbor(wire::encode_proof(&p)))
}

/// Most addresses one probe may name, and most old homes a homeless
/// rotation is forwarded to, so this relay cannot be made to flood servers.
const PROBE_ADDRESSES: usize = 8;

/// `POST /probe` (cMIP, "Probes"): submit the homeless rotation to each
/// address and ask each for the identity record; answer every signed act
/// that came back. Only base addresses under this cMIP's own paths are
/// contacted.
async fn probe(State(s): State<Arc<Shared>>, b: Result<Bytes, BytesRejection>) -> Response {
    let body = match body(b) {
        Ok(b) => b,
        Err(e) => return error(e),
    };
    let p = match wire::Probe::decode(&body) {
        Ok(p) => p,
        Err(m) => return error(m.into()),
    };
    if p.addresses.len() > PROBE_ADDRESSES {
        return error(WireError::new(
            code::TOO_LARGE,
            format!("at most {PROBE_ADDRESSES} addresses per probe"),
        ));
    }
    let specs = s.node().specs();
    let Some((identity, _)) = node::homeless_rotation(&p.rotation, &specs) else {
        return error(WireError::malformed("a probe carries a homeless rotation"));
    };
    let mut acts: Vec<Vec<u8>> = vec![];
    let mut answered = false;
    for addr in &p.addresses {
        let Some(c) = s.net.client(addr) else {
            continue;
        };
        match c.put_act(&p.rotation).await {
            Ok(r) => {
                answered = true;
                acts.extend(r.receipt);
                acts.extend(r.objection);
            }
            Err(e) => {
                answered |= e.answered();
                if let ClientError::Wire(w) = e {
                    acts.extend(w.acts);
                }
            }
        }
        match c.identity(&identity, None).await {
            Ok(rec) => {
                answered = true;
                acts.extend(rec.all_acts());
            }
            Err(e) => answered |= e.answered(),
        }
    }
    if !answered {
        return error(WireError::new(
            code::NOT_HELD,
            "no address answered (a hint, never proof)",
        ));
    }
    acts.sort();
    acts.dedup();
    // Keep what came back, so objections travel (cMIP, "Proof of life travels").
    s.keep(&acts);
    cbor(wire::encode_items(&acts))
}

/// `POST /proofs` (F101): carried inclusion proofs; answers how many were kept.
async fn put_proofs(State(s): State<Arc<Shared>>, b: Result<Bytes, BytesRejection>) -> Response {
    let body = match body(b) {
        Ok(b) => b,
        Err(e) => return error(e),
    };
    let r = s.node().put_proofs(&body);
    answer(r, |n| {
        cbor(mor_core::cbor::encode(&mor_core::cbor::Value::Uint(n)))
    })
}

// ---------------------------------------------------------------- the router

pub fn router(shared: Arc<Shared>) -> Router {
    let limits = shared.node().config().limits;
    let body_limit = (limits.act.max(limits.media) + 64 * 1024) as usize;
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .expose_headers(Any);
    Router::new()
        .route("/info", get(info))
        .route("/acts", post(put_act))
        .route("/acts/get", post(get_acts))
        .route("/acts/{id}", get(get_act))
        .route("/sealed", post(put_sealed))
        .route("/sealed/{id}", get(get_sealed))
        .route("/media", post(put_media))
        .route("/media/{hash}", get(get_media))
        .route("/feed", get(feed))
        .route("/commitment", get(commitment))
        .route("/identity/{id}", get(identity))
        .route("/log/summary", get(log_summary))
        .route("/log/receipt", get(log_receipt))
        .route("/log/inclusion", get(log_inclusion))
        .route("/log/consistency", get(log_consistency))
        .route("/probe", post(probe))
        .route("/proofs", post(put_proofs))
        .fallback(|| async {
            error(WireError::new(
                code::NOT_SUPPORTED,
                "not a request of the relay transport cMIP",
            ))
        })
        .layer(DefaultBodyLimit::max(body_limit))
        .layer(cors)
        // The management page, without CORS: only the page this relay
        // serves may call it from a browser.
        .merge(crate::manage::routes())
        .with_state(shared)
}

/// Serve on a bound listener until the task is dropped.
pub async fn serve(listener: tokio::net::TcpListener, shared: Arc<Shared>) -> std::io::Result<()> {
    axum::serve(listener, router(shared)).await
}

#[cfg(test)]
mod tests {
    use super::parse_range;

    #[test]
    fn ranges() {
        assert_eq!(parse_range("bytes=0-9", 100), Some((0, 9)));
        assert_eq!(parse_range("bytes=90-", 100), Some((90, 99)));
        assert_eq!(parse_range("bytes=-10", 100), Some((90, 99)));
        assert_eq!(parse_range("bytes=95-200", 100), Some((95, 99)));
        assert_eq!(parse_range("bytes=100-", 100), None);
        assert_eq!(parse_range("bytes=5-1", 100), None);
        assert_eq!(parse_range("bytes=0-1,4-5", 100), None);
    }
}
