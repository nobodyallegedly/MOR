//! A client for the relay transport cMIP: what a relay uses to probe a home
//! and forward homeless rotations, and what the tests and the freeze-suite
//! harness use to talk to relays.
//!
//! It checks what it can without trusting the relay: every act, sealed
//! container and media object fetched is recomputed against the id it was
//! asked for, and discarded if it does not match (cMIP, "Fetching"). What
//! the acts themselves mean is for the core library's verifier to decide.

use crate::store::Filter;
use crate::wire::{self, IdentityRecord, Info, PutResult, PutSealed, WireError};
use mor_core::act::Act;
use mor_core::hash::{sha256, Hash};
use std::fmt;
use std::time::Duration;

#[derive(Debug)]
pub enum ClientError {
    /// The relay answered with an error of the cMIP.
    Wire(WireError),
    /// The relay could not be reached, or answered outside HTTP.
    Transport(String),
    /// The relay answered something that is not a message of the cMIP, or
    /// an item that does not match what was asked for.
    Malformed(String),
}

impl fmt::Display for ClientError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ClientError::Wire(e) => e.fmt(f),
            ClientError::Transport(e) => write!(f, "unreachable: {e}"),
            ClientError::Malformed(e) => write!(f, "malformed answer: {e}"),
        }
    }
}

impl std::error::Error for ClientError {}

impl From<wire::Malformed> for ClientError {
    fn from(m: wire::Malformed) -> Self {
        ClientError::Malformed(m.0)
    }
}

impl ClientError {
    /// Whether the relay answered at all with a message of the cMIP: life,
    /// in the sense of "When a home counts as unreachable".
    pub fn answered(&self) -> bool {
        matches!(self, ClientError::Wire(_))
    }
}

type R<T> = Result<T, ClientError>;

/// How an address may be reached under the cMIP ("Addresses").
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Reach {
    /// `https`: directly.
    Direct,
    /// An onion address: only through Tor.
    Onion,
    /// Plain `http` to anything else: for local testing only.
    TestOnly,
    /// Not a base address under this cMIP.
    No,
}

pub fn reach(addr: &str) -> Reach {
    let Ok(u) = reqwest::Url::parse(addr) else {
        return Reach::No;
    };
    if u.query().is_some()
        || u.fragment().is_some()
        || !u.username().is_empty()
        || u.password().is_some()
    {
        return Reach::No;
    }
    let onion = u.host_str().is_some_and(|h| h.ends_with(".onion"));
    match u.scheme() {
        "https" | "http" if onion => Reach::Onion,
        "https" => Reach::Direct,
        "http" => Reach::TestOnly,
        _ => Reach::No,
    }
}

/// A client for one relay, by its base address.
#[derive(Clone)]
pub struct Client {
    http: reqwest::Client,
    base: String,
}

/// The feed's query.
#[derive(Clone, Debug, Default)]
pub struct FeedQuery {
    pub filter: Filter,
    pub after: Option<u64>,
    pub limit: Option<u64>,
    pub wait: Option<u64>,
}

pub fn http_client(tor_proxy: Option<&str>) -> reqwest::Client {
    let mut b = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(20))
        .timeout(Duration::from_secs(120));
    if let Some(p) = tor_proxy {
        b = b.proxy(reqwest::Proxy::all(p).expect("a proxy address"));
    }
    b.build().expect("an HTTP client")
}

impl Client {
    pub fn new(base: &str) -> Self {
        Self::with_http(http_client(None), base)
    }

    pub fn with_http(http: reqwest::Client, base: &str) -> Self {
        Client {
            http,
            base: base.trim_end_matches('/').to_string(),
        }
    }

    pub fn base(&self) -> &str {
        &self.base
    }

    async fn answer(resp: reqwest::Result<reqwest::Response>) -> R<Vec<u8>> {
        let resp = resp.map_err(|e| ClientError::Transport(e.to_string()))?;
        let status = resp.status();
        let body = resp
            .bytes()
            .await
            .map_err(|e| ClientError::Transport(e.to_string()))?
            .to_vec();
        if status.is_success() {
            Ok(body)
        } else {
            match WireError::decode(&body) {
                Ok(e) => Err(ClientError::Wire(e)),
                Err(_) => Err(ClientError::Malformed(format!(
                    "HTTP {status} without an error message"
                ))),
            }
        }
    }

    async fn get(&self, path: &str) -> R<Vec<u8>> {
        Self::answer(self.http.get(format!("{}{path}", self.base)).send().await).await
    }

    async fn post(&self, path: &str, body: Vec<u8>, ctype: &str) -> R<Vec<u8>> {
        Self::answer(
            self.http
                .post(format!("{}{path}", self.base))
                .header("content-type", ctype)
                .body(body)
                .send()
                .await,
        )
        .await
    }

    pub async fn info(&self) -> R<Info> {
        Ok(Info::decode(&self.get("/info").await?)?)
    }

    /// `POST /acts`.
    pub async fn put_act(&self, act: &[u8]) -> R<PutResult> {
        Ok(PutResult::decode(
            &self.post("/acts", act.to_vec(), "application/cbor").await?,
        )?)
    }

    /// `POST /sealed`.
    pub async fn put_sealed(&self, sealed: &[u8], pickup: &[Hash]) -> R<PutResult> {
        let body = PutSealed {
            sealed: sealed.to_vec(),
            pickup: pickup.to_vec(),
        }
        .encode();
        Ok(PutResult::decode(
            &self.post("/sealed", body, "application/cbor").await?,
        )?)
    }

    /// `POST /media`. Checks the answer against the bytes sent.
    pub async fn put_media(&self, bytes: &[u8]) -> R<Hash> {
        let (h, size) = wire::decode_media_result(
            &self
                .post("/media", bytes.to_vec(), "application/octet-stream")
                .await?,
        )?;
        if h != sha256(bytes) || size != bytes.len() as u64 {
            return Err(ClientError::Malformed(
                "the relay's locked hash or size does not match the bytes".into(),
            ));
        }
        Ok(h)
    }

    /// `GET /acts/{id}`, checked against the id.
    pub async fn get_act(&self, id: &Hash) -> R<Vec<u8>> {
        let b = self.get(&format!("/acts/{}", wire::hex(id))).await?;
        check_act(&b, id)?;
        Ok(b)
    }

    /// `POST /acts/get`, each answer checked against its id.
    pub async fn get_acts(&self, ids: &[Hash]) -> R<Vec<Option<Vec<u8>>>> {
        let got = wire::decode_maybe_items(
            &self
                .post("/acts/get", wire::encode_ids(ids), "application/cbor")
                .await?,
        )?;
        if got.len() != ids.len() {
            return Err(ClientError::Malformed("one answer per id expected".into()));
        }
        Ok(got
            .into_iter()
            .zip(ids)
            .map(|(b, id)| b.filter(|b| check_act(b, id).is_ok()))
            .collect())
    }

    /// `GET /sealed/{id}`, checked against the id.
    pub async fn get_sealed(&self, id: &Hash) -> R<Vec<u8>> {
        let b = self.get(&format!("/sealed/{}", wire::hex(id))).await?;
        if wire::sealed_id(&b) != *id {
            return Err(ClientError::Malformed(
                "the sealed container does not match its id".into(),
            ));
        }
        Ok(b)
    }

    /// `GET /media/{hash}`, whole, checked against the locked hash.
    pub async fn get_media(&self, h: &Hash) -> R<Vec<u8>> {
        let b = self.get(&format!("/media/{}", wire::hex(h))).await?;
        if sha256(&b) != *h {
            return Err(ClientError::Malformed(
                "the media bytes do not match their locked hash".into(),
            ));
        }
        Ok(b)
    }

    /// `GET /media/{hash}` with a range, `first..=last`. A part cannot be
    /// checked alone; the caller checks the whole once assembled.
    pub async fn get_media_range(&self, h: &Hash, first: u64, last: u64) -> R<Vec<u8>> {
        Self::answer(
            self.http
                .get(format!("{}/media/{}", self.base, wire::hex(h)))
                .header("range", format!("bytes={first}-{last}"))
                .send()
                .await,
        )
        .await
    }

    /// `GET /feed`.
    pub async fn feed(&self, q: &FeedQuery) -> R<wire::FeedPage> {
        let mut p: Vec<String> = vec![];
        let f = &q.filter;
        if let Some(s) = &f.signer {
            p.push(format!("signer={}", wire::hex(s)));
        }
        if let Some(s) = &f.to {
            p.push(format!("to={}", wire::hex(s)));
        }
        if let Some(s) = &f.pickup {
            p.push(format!("pickup={}", wire::hex(s)));
        }
        if f.unaddressed {
            p.push("unaddressed=1".into());
        }
        if let Some(s) = &f.spec {
            p.push(format!("spec={}", wire::hex(s)));
        }
        if let Some(t) = f.type_ {
            p.push(format!("type={t}"));
        }
        for (k, v) in [("after", q.after), ("limit", q.limit), ("wait", q.wait)] {
            if let Some(v) = v {
                p.push(format!("{k}={v}"));
            }
        }
        let path = if p.is_empty() {
            "/feed".to_string()
        } else {
            format!("/feed?{}", p.join("&"))
        };
        Ok(wire::FeedPage::decode(&self.get(&path).await?)?)
    }

    /// `POST /proofs` (F101): carried inclusion proofs. How many were kept.
    pub async fn put_proofs(&self, proofs: &[wire::Inclusion]) -> R<u64> {
        let b = self
            .post(
                "/proofs",
                wire::Inclusion::encode_list(proofs),
                "application/cbor",
            )
            .await?;
        match wire::decode(&b)? {
            mor_core::cbor::Value::Uint(n) => Ok(n),
            _ => Err(ClientError::Malformed("expected a count".into())),
        }
    }

    /// Every act this relay holds signed by `signer`, page by page, in
    /// arrival order. A reader uses it to rebuild a home operator's whole
    /// sequence, which proving that a receipt lies in the kept ancestry of
    /// the operator's rotation needs (cMIP, open parameter on kept-ancestry
    /// proofs).
    pub async fn acts_by(&self, signer: &Hash) -> R<Vec<Vec<u8>>> {
        let mut out = vec![];
        let mut after = 0;
        loop {
            let page = self
                .feed(&FeedQuery {
                    filter: Filter {
                        signer: Some(*signer),
                        ..Default::default()
                    },
                    after: Some(after),
                    ..Default::default()
                })
                .await?;
            if page.items.is_empty() {
                return Ok(out);
            }
            after = page.next;
            out.extend(
                page.items
                    .into_iter()
                    .filter(|i| i.kind == 0)
                    .map(|i| i.item),
            );
        }
    }

    /// `GET /identity/{id}`, all parts or some.
    pub async fn identity(&self, id: &Hash, parts: Option<&[u64]>) -> R<IdentityRecord> {
        let mut path = format!("/identity/{}", wire::hex(id));
        if let Some(ps) = parts {
            path.push_str(&format!(
                "?parts={}",
                ps.iter()
                    .map(|p| p.to_string())
                    .collect::<Vec<_>>()
                    .join(",")
            ));
        }
        let rec = IdentityRecord::decode(&self.get(&path).await?)?;
        if rec.identity != *id {
            return Err(ClientError::Malformed(
                "an identity record for another identity".into(),
            ));
        }
        Ok(rec)
    }

    /// `GET /log/summary`: the summary, and its cosignatures.
    pub async fn log_summary(&self, size: Option<u64>) -> R<(Vec<u8>, Vec<Vec<u8>>)> {
        let path = match size {
            Some(n) => format!("/log/summary?size={n}"),
            None => "/log/summary".into(),
        };
        Ok(wire::decode_summary(&self.get(&path).await?)?)
    }

    pub async fn log_receipt(&self, position: u64) -> R<Vec<u8>> {
        self.get(&format!("/log/receipt?position={position}")).await
    }

    pub async fn log_inclusion(&self, position: u64, size: u64) -> R<Vec<Hash>> {
        Ok(wire::decode_proof(
            &self
                .get(&format!("/log/inclusion?position={position}&size={size}"))
                .await?,
        )?)
    }

    pub async fn log_consistency(&self, from: u64, to: u64) -> R<Vec<Hash>> {
        Ok(wire::decode_proof(
            &self
                .get(&format!("/log/consistency?from={from}&to={to}"))
                .await?,
        )?)
    }

    /// `POST /probe`: every signed act the relay got back from the home.
    pub async fn probe(&self, rotation: &[u8], addresses: &[String]) -> R<Vec<Vec<u8>>> {
        let body = wire::Probe {
            rotation: rotation.to_vec(),
            addresses: addresses.to_vec(),
        }
        .encode();
        Ok(wire::decode_items(
            &self.post("/probe", body, "application/cbor").await?,
        )?)
    }

    /// `GET /commitment`.
    pub async fn commitment(&self) -> R<Vec<u8>> {
        self.get("/commitment").await
    }
}

fn check_act(b: &[u8], id: &Hash) -> R<()> {
    match Act::decode(b) {
        Ok(a) if a.id() == *id => Ok(()),
        _ => Err(ClientError::Malformed(
            "the act does not match its id".into(),
        )),
    }
}
