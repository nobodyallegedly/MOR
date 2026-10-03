//! A minimal client for an lnd node's REST interface: what the tests need
//! to issue invoices committing to a payment, pay them, and see them
//! settled, on regtest. Test networks only: nothing here is meant to hold
//! real money.

use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde_json::{json, Value};

pub struct Lnd {
    base: String,
    macaroon: String,
    http: reqwest::Client,
}

pub type R<T> = Result<T, String>;

impl Lnd {
    /// `base` is the REST address (`https://127.0.0.1:8080`); `tls_cert` the
    /// node's own certificate (PEM); `macaroon` its admin macaroon.
    pub fn new(base: &str, tls_cert: &[u8], macaroon: &[u8]) -> R<Self> {
        let der = pem_der(tls_cert).ok_or("not a PEM certificate")?;
        let provider = std::sync::Arc::new(rustls::crypto::aws_lc_rs::default_provider());
        let tls = rustls::ClientConfig::builder_with_provider(provider.clone())
            .with_safe_default_protocol_versions()
            .map_err(|e| e.to_string())?
            .dangerous()
            .with_custom_certificate_verifier(std::sync::Arc::new(Pinned { der, provider }))
            .with_no_client_auth();
        let http = reqwest::Client::builder()
            .tls_backend_preconfigured(tls)
            .no_proxy()
            .build()
            .map_err(|e| e.to_string())?;
        Ok(Lnd {
            base: base.trim_end_matches('/').into(),
            macaroon: macaroon.iter().map(|b| format!("{b:02x}")).collect(),
            http,
        })
    }

    /// From an lnd directory as `lnd --lnddir` lays it out, on regtest.
    pub fn from_dir(base: &str, lnddir: &std::path::Path) -> R<Self> {
        let read =
            |p: std::path::PathBuf| std::fs::read(&p).map_err(|e| format!("{}: {e}", p.display()));
        let cert = read(lnddir.join("tls.cert"))?;
        let mac = read(lnddir.join("data/chain/bitcoin/regtest/admin.macaroon"))?;
        Lnd::new(base, &cert, &mac)
    }

    async fn call(&self, method: reqwest::Method, path: &str, body: Option<Value>) -> R<Value> {
        let mut rq = self
            .http
            .request(method, format!("{}{path}", self.base))
            .header("Grpc-Metadata-macaroon", &self.macaroon);
        if let Some(b) = body {
            rq = rq.json(&b);
        }
        let rs = rq.send().await.map_err(|e| e.to_string())?;
        let status = rs.status();
        let v: Value = rs.json().await.map_err(|e| e.to_string())?;
        if !status.is_success() {
            return Err(format!("lnd {path}: {status} {v}"));
        }
        Ok(v)
    }

    /// The node's own key, compressed.
    pub async fn node_key(&self) -> R<[u8; 33]> {
        let v = self.call(reqwest::Method::GET, "/v1/getinfo", None).await?;
        let h = v["identity_pubkey"].as_str().ok_or("no identity_pubkey")?;
        hex33(h)
    }

    /// Issue an invoice for `sat`, committing to `description_hash`.
    /// Returns the invoice and its payment hash.
    pub async fn add_invoice(
        &self,
        sat: u64,
        description_hash: &[u8; 32],
    ) -> R<(String, [u8; 32])> {
        let v = self
            .call(
                reqwest::Method::POST,
                "/v1/invoices",
                Some(json!({
                    "value": sat.to_string(),
                    "description_hash": B64.encode(description_hash),
                })),
            )
            .await?;
        let pr = v["payment_request"]
            .as_str()
            .ok_or("no payment_request")?
            .to_string();
        let h = B64
            .decode(v["r_hash"].as_str().ok_or("no r_hash")?)
            .map_err(|e| e.to_string())?;
        Ok((pr, h.try_into().map_err(|_| "r_hash length")?))
    }

    /// Pay an invoice; the preimage on success.
    pub async fn pay(&self, invoice: &str) -> R<[u8; 32]> {
        let v = self
            .call(
                reqwest::Method::POST,
                "/v1/channels/transactions",
                Some(json!({ "payment_request": invoice })),
            )
            .await?;
        if let Some(e) = v["payment_error"].as_str().filter(|e| !e.is_empty()) {
            return Err(format!("payment failed: {e}"));
        }
        let p = B64
            .decode(v["payment_preimage"].as_str().ok_or("no preimage")?)
            .map_err(|e| e.to_string())?;
        p.try_into().map_err(|_| "preimage length".into())
    }

    /// Whether an invoice of this node is settled, and its preimage.
    pub async fn settled(&self, payment_hash: &[u8; 32]) -> R<Option<[u8; 32]>> {
        let hexh: String = payment_hash.iter().map(|b| format!("{b:02x}")).collect();
        let v = self
            .call(reqwest::Method::GET, &format!("/v1/invoice/{hexh}"), None)
            .await?;
        if v["state"].as_str() != Some("SETTLED") {
            return Ok(None);
        }
        let p = B64
            .decode(v["r_preimage"].as_str().ok_or("no r_preimage")?)
            .map_err(|e| e.to_string())?;
        Ok(Some(p.try_into().map_err(|_| "preimage length")?))
    }

    /// lnd's own reading of an invoice (`decodepayreq`), to check ours by.
    pub async fn decode(&self, invoice: &str) -> R<Value> {
        self.call(reqwest::Method::GET, &format!("/v1/payreq/{invoice}"), None)
            .await
    }
}

/// The node's certificate, pinned: the server must present exactly these
/// bytes, and sign the handshake with their key. Stricter than trusting it
/// as an authority, and the only way rustls accepts lnd's certificate.
#[derive(Debug)]
struct Pinned {
    der: Vec<u8>,
    provider: std::sync::Arc<rustls::crypto::CryptoProvider>,
}

use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
use rustls::{DigitallySignedStruct, SignatureScheme};

impl ServerCertVerifier for Pinned {
    fn verify_server_cert(
        &self,
        end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _name: &ServerName<'_>,
        _ocsp: &[u8],
        _now: UnixTime,
    ) -> Result<ServerCertVerified, rustls::Error> {
        if end_entity.as_ref() == self.der.as_slice() {
            Ok(ServerCertVerified::assertion())
        } else {
            Err(rustls::Error::General(
                "not the node's pinned certificate".into(),
            ))
        }
    }

    fn verify_tls12_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        rustls::crypto::verify_tls12_signature(
            message,
            cert,
            dss,
            &self.provider.signature_verification_algorithms,
        )
    }

    fn verify_tls13_signature(
        &self,
        message: &[u8],
        cert: &CertificateDer<'_>,
        dss: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        rustls::crypto::verify_tls13_signature(
            message,
            cert,
            dss,
            &self.provider.signature_verification_algorithms,
        )
    }

    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        self.provider
            .signature_verification_algorithms
            .supported_schemes()
    }
}

/// The DER bytes of the first certificate in a PEM file.
fn pem_der(pem: &[u8]) -> Option<Vec<u8>> {
    let s = std::str::from_utf8(pem).ok()?;
    let body = s
        .split("-----BEGIN CERTIFICATE-----")
        .nth(1)?
        .split("-----END CERTIFICATE-----")
        .next()?;
    let b: String = body.chars().filter(|c| !c.is_whitespace()).collect();
    B64.decode(b).ok()
}

pub fn hex33(h: &str) -> R<[u8; 33]> {
    if h.len() != 66 {
        return Err("not a 33-byte key".into());
    }
    let mut out = [0u8; 33];
    for (i, o) in out.iter_mut().enumerate() {
        *o = u8::from_str_radix(&h[2 * i..2 * i + 2], 16).map_err(|e| e.to_string())?;
    }
    Ok(out)
}
