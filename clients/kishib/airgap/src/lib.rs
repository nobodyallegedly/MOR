//! Kišib's half of the air-gapped chain-key signer Module (draft 6), for
//! "Change keys with Nakišib" and "Make an identity with Nakišib": the
//! Module's own `online` code, through WebAssembly. Kišib rewrites no rule
//! of it: the request is made by `online::pending`, the answer checked by
//! `online::accept` (rule 3.9), a commitment read by the Module's strict
//! decoding (rule 3.6).
//!
//! Kišib builds the change of keys as it always does (every line read back,
//! the cards, the vault), as an ordinary rotation act signed with a
//! throwaway chain key: a template. From it, `pending` takes the rotation's
//! fields and nothing else, as the Module's `online_side` example does for
//! the step 17 rehearsal. The next chain-key commitment in the template is
//! ignored: Nakišib supplies it.

use mor_airgap::msg::{kind, Message};
use mor_airgap::online;
use mor_airgap::summary::fingerprint;
use mor_core::act::{Act, Scheme};
use mor_core::identity::Payload;
use mor_core::sig;
use wasm_bindgen::prelude::*;

fn err(e: impl std::fmt::Display) -> JsError {
    JsError::new(&e.to_string())
}

fn hexs(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

/// The pending rotation (message 2.2) for the rotation `template` asks,
/// after the identity-chain act `previous`; `context` is shown on Nakišib
/// apart, as unchecked.
#[wasm_bindgen(js_name = pendingFor)]
pub fn pending_for(previous: &[u8], template: &[u8], context: Vec<String>) -> Result<Vec<u8>, JsError> {
    let prev = Act::decode(previous).map_err(|e| err(format!("the previous act: {e:?}")))?;
    let t = Act::decode(template).map_err(|e| err(format!("the template: {e:?}")))?;
    let inside = t.open(None).map_err(|e| err(format!("the template: {e:?}")))?;
    let Ok(Payload::Rotation(r)) = Payload::decode(inside.type_, &inside.payload) else {
        return Err(err("the template is not a rotation"));
    };
    if r.prev != prev.id() {
        return Err(err("the template does not follow the previous act"));
    }
    let context = (!context.is_empty()).then_some(context);
    Ok(online::pending(&inside.spec, &prev, &r, context, false).encode())
}

/// Rule 3.9: the signed rotation (message 2.3) checked against the pending
/// rotation it answers, before anything is published: the complete act's
/// bytes, or an error saying why not.
#[wasm_bindgen(js_name = acceptAnswer)]
pub fn accept_answer(identity_spec: &[u8], pending: &[u8], signed: &[u8]) -> Result<Vec<u8>, JsError> {
    let spec: [u8; 32] = identity_spec.try_into().map_err(|_| err("a spec hash is 32 bytes"))?;
    let a = online::accept(&spec, pending, signed).map_err(err)?;
    if a.signing_key.is_some() {
        // Clean-device mode is not offered by Nakišib's first version; Kišib made the signing key.
        return Err(err("it carries a new signing key made offline, which this change did not ask for"));
    }
    Ok(a.act.encode())
}

/// A commitment export (message 2.1), strictly decoded: `{"scheme":n,"commit":hex,"index":n}`.
#[wasm_bindgen(js_name = readCommitment)]
pub fn read_commitment(export: &[u8]) -> Result<String, JsError> {
    let Message::CommitmentExport(c) = Message::decode_kind(export, kind::COMMITMENT_EXPORT).map_err(err)? else {
        unreachable!()
    };
    let scheme = match c.chain_key.scheme {
        Scheme::Founding(n @ (2 | 3)) => n,
        _ => return Err(err("a chain-key scheme Kišib does not implement")),
    };
    Ok(format!(r#"{{"scheme":{scheme},"commit":"{}","index":{}}}"#, hexs(&c.chain_key.commit), c.index))
}

/// The fingerprint both screens show for a new signing key (Module 3.1, section 4).
#[wasm_bindgen(js_name = signingFingerprint)]
pub fn signing_fingerprint(public: &[u8]) -> String {
    fingerprint(&sig::SCHNORR, public)
}
