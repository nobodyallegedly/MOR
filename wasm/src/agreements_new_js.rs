//! The new Agreements acts for the clients (`docs/agreements-from-scratch/encoding-1.md`):
//! the spec hashes and types, a payload for each act, and the checker.
//!
//! A test identity writes an act in two calls: one of the payload builders
//! below gives the payload's CBOR, and `makeEveryday` seals and signs it,
//! with `spec` and `type` from `agreementsNewSpecs`:
//!
//! ```js
//! const s = agreementsNewSpecs();
//! const payload = agreementsNewTermsPayload({ parties: [{ signer: me }], authors: [0],
//!   body: { words, cmip, params }, previous: null });
//! const made = makeEveryday({ ...me, spec: s.terms.spec, type: s.terms.type, payload, sequence, public: true });
//! agreementsNewCheck(made.act); // { verdict: "pass", ... }
//! ```
//!
//! Hashes are lowercase hex; a socket's parameters, and a Statement's
//! content, are CBOR bytes (`cborEncode`), absent meaning `null`. Every
//! builder refuses a payload the checker would reject, naming the rule.

use super::{err, hx, to_js, unhex, R};
use mor_core::agreements_new::{
    self as an, check::Decoded, Amount, Body, Call, CallFrom, CallRef, Finding, Kind, Line, Named, Party, Power, PowerKind, Receiver, Report,
    Role, RoleKind, Socket, Statement, Terms, Who,
};
use mor_core::cbor::{self, Value};
use mor_core::hash::Hash;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

fn opt_hash(s: &Option<String>) -> R<Option<Hash>> {
    s.as_deref().map(unhex).transpose()
}

fn hashes(v: &Option<Vec<String>>) -> R<Option<Vec<Hash>>> {
    v.as_ref().map(|v| v.iter().map(|s| unhex(s)).collect::<R<Vec<_>>>()).transpose()
}

fn cbor_value(b: &Option<Vec<u8>>) -> R<Value> {
    match b {
        None => Ok(Value::Null),
        Some(b) => cbor::decode(b).map_err(err),
    }
}

fn reject(r: an::Rejected) -> JsError {
    err(format!("{}: {}", r.rule, r.says))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SocketIn {
    cmip: String,
    #[serde(default, with = "serde_bytes")]
    params: Option<Vec<u8>>,
}

impl SocketIn {
    fn get(&self) -> R<Socket> {
        Ok(Socket { cmip: Named::Fp(unhex(&self.cmip)?), params: cbor_value(&self.params)? })
    }
}

fn sock(s: &Option<SocketIn>) -> R<Option<Socket>> {
    s.as_ref().map(SocketIn::get).transpose()
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RoleIn {
    /// "done", "received", "holding", "fits" or "future".
    kind: String,
    what: Option<String>,
    spot: SocketIn,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) enum PartyIn {
    Signer(String),
    Role(RoleIn),
    Agreement(String),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct BodyIn {
    words: String,
    cmip: String,
    #[serde(default, with = "serde_bytes")]
    params: Option<Vec<u8>>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PowerIn {
    /// "assent", "counter_signature", "contest", "resolves", "replaces", or a K7 cMIP's spec hash.
    kind: String,
    rule: SocketIn,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub(crate) enum ReceiverIn {
    /// A party's index in `parties`.
    Party(u64),
    /// Another agreement's root.
    Agreement(String),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CallIn {
    /// 1 to 8: the task K1 to K8.
    task: u8,
    /// "doer", "receiving side" or "both".
    from: String,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub(crate) struct TermsIn {
    replaces: Option<String>,
    agreement: Option<String>,
    parties: Option<Vec<PartyIn>>,
    authors: Option<Vec<u64>>,
    body: Option<BodyIn>,
    relies_on: Option<Vec<String>>,
    in_force: Option<SocketIn>,
    powers: Option<Vec<PowerIn>>,
    place: Option<String>,
    clock: Option<String>,
    receiver: Option<ReceiverIn>,
    envelope: Option<String>,
    envelope_at: Option<String>,
    condition: Option<SocketIn>,
    control: Option<SocketIn>,
    calls: Option<Vec<CallIn>>,
    data: Option<SocketIn>,
    resolves: Option<Vec<String>>,
    continues: Option<String>,
    previous: Option<String>,
}

fn role_kind(s: &str) -> R<RoleKind> {
    Ok(match s {
        "done" => RoleKind::Done,
        "received" => RoleKind::Received,
        "holding" => RoleKind::Holding,
        "fits" => RoleKind::Fits,
        "future" => RoleKind::Future,
        _ => return Err(err("a role's kind is done, received, holding, fits or future")),
    })
}

fn power_kind(s: &str) -> R<PowerKind> {
    Ok(match s {
        "assent" => PowerKind::Assent,
        "counter_signature" => PowerKind::CounterSignature,
        "contest" => PowerKind::Contest,
        "resolves" => PowerKind::Resolves,
        "replaces" => PowerKind::Replaces,
        h => PowerKind::Defined(unhex(h)?),
    })
}

pub(crate) fn terms_of(t: &TermsIn) -> R<Terms> {
    Ok(Terms {
        replaces: opt_hash(&t.replaces)?,
        agreement: opt_hash(&t.agreement)?,
        parties: t
            .parties
            .as_ref()
            .map(|ps| {
                ps.iter()
                    .map(|p| {
                        Ok(match p {
                            PartyIn::Signer(h) => Party::Signer(unhex(h)?),
                            PartyIn::Agreement(h) => Party::Agreement(unhex(h)?),
                            PartyIn::Role(r) => Party::Role(Role::new(role_kind(&r.kind)?, opt_hash(&r.what)?, r.spot.get()?)),
                        })
                    })
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?,
        authors: t.authors.clone(),
        body: t
            .body
            .as_ref()
            .map(|b| Ok::<_, JsError>(Body::new(unhex(&b.words)?, Socket::new(unhex(&b.cmip)?, cbor_value(&b.params)?))))
            .transpose()?,
        relies_on: hashes(&t.relies_on)?.map(|v| v.into_iter().map(Named::Fp).collect()),
        in_force: sock(&t.in_force)?,
        powers: t
            .powers
            .as_ref()
            .map(|ps| ps.iter().map(|p| Ok(Power { kind: power_kind(&p.kind)?, rule: p.rule.get()? })).collect::<R<Vec<_>>>())
            .transpose()?,
        place: opt_hash(&t.place)?,
        clock: opt_hash(&t.clock)?,
        receiver: t
            .receiver
            .as_ref()
            .map(|r| {
                Ok::<_, JsError>(match r {
                    ReceiverIn::Party(i) => Receiver::Party(*i),
                    ReceiverIn::Agreement(h) => Receiver::Agreement(unhex(h)?),
                })
            })
            .transpose()?,
        envelope: opt_hash(&t.envelope)?,
        envelope_at: opt_hash(&t.envelope_at)?,
        condition: sock(&t.condition)?,
        control: sock(&t.control)?,
        calls: t
            .calls
            .as_ref()
            .map(|cs| {
                cs.iter()
                    .map(|c| {
                        let from = match c.from.as_str() {
                            "doer" => CallFrom::Doer,
                            "receiving side" => CallFrom::ReceivingSide,
                            "both" => CallFrom::Both,
                            _ => return Err(err("a call is from the doer, the receiving side or both")),
                        };
                        Ok(Call { task: c.task, from })
                    })
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?,
        data: sock(&t.data)?,
        resolves: hashes(&t.resolves)?,
        continues: opt_hash(&t.continues)?,
        previous: opt_hash(&t.previous)?,
    })
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) enum WhoIn {
    Signer(String),
    Agreement(String),
}

fn who(w: &WhoIn) -> R<Who> {
    Ok(match w {
        WhoIn::Signer(h) => Who::Signer(unhex(h)?),
        WhoIn::Agreement(h) => Who::Agreement(unhex(h)?),
    })
}

#[derive(Deserialize)]
#[serde(untagged)]
pub(crate) enum KindIn {
    /// "assent", "counter_signature" or "contest".
    Word(String),
    /// A kind a cMIP defines (K7).
    Defined(SocketIn),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StatementIn {
    agreement: String,
    terms: String,
    kind: KindIn,
    #[serde(default, with = "serde_bytes")]
    content: Option<Vec<u8>>,
    #[serde(rename = "for")]
    for_: Option<WhoIn>,
    under: Option<String>,
    previous: Option<String>,
    answers: Option<Vec<String>>,
    relies_on: Option<Vec<String>>,
    settlement: Option<String>,
    resolves: Option<Vec<String>>,
    continues: Option<String>,
}

pub(crate) fn statement_of(s: &StatementIn) -> R<Statement> {
    let kind = match &s.kind {
        KindIn::Word(w) => match w.as_str() {
            "assent" => Kind::Assent,
            "counter_signature" => Kind::CounterSignature,
            "contest" => Kind::Contest,
            _ => return Err(err("a Statement's kind is assent, counter_signature, contest, or a K7 socket { cmip, params }")),
        },
        KindIn::Defined(k) => Kind::Defined { cmip: unhex(&k.cmip)?, params: cbor_value(&k.params)? },
    };
    Ok(Statement {
        agreement: unhex(&s.agreement)?,
        terms: unhex(&s.terms)?,
        kind,
        content: s.content.as_ref().map(|c| cbor::decode(c).map_err(err)).transpose()?,
        for_: s.for_.as_ref().map(who).transpose()?,
        under: opt_hash(&s.under)?,
        previous: opt_hash(&s.previous)?,
        answers: hashes(&s.answers)?,
        relies_on: hashes(&s.relies_on)?.map(|v| v.into_iter().map(Named::Fp).collect()),
        settlement: opt_hash(&s.settlement)?,
        resolves: hashes(&s.resolves)?,
        continues: opt_hash(&s.continues)?,
    })
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CallRefIn {
    act: String,
    task: Option<u8>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AmountIn {
    unit: String,
    value: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct LineIn {
    /// "received", "passed on", "own part", "kept" or "still owed".
    line: String,
    amount: AmountIn,
    by: Option<String>,
    to: Option<WhoIn>,
    /// `[report, line]`: the still-owed line a passed-on line pays.
    closes: Option<(String, u64)>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ReportIn {
    call: CallRefIn,
    relies_on: Option<Vec<String>>,
    lines: Option<Vec<LineIn>>,
}

pub(crate) fn report_of(r: &ReportIn) -> R<Report> {
    let lines = r
        .lines
        .as_ref()
        .map(|ls| {
            ls.iter()
                .map(|l| {
                    let amount = Amount { unit: unhex(&l.amount.unit)?, value: l.amount.value };
                    let by = || l.by.as_deref().ok_or_else(|| err("this line names the act it came or went by: by")).and_then(unhex);
                    let to = || l.to.as_ref().ok_or_else(|| err("this line names to whom: to")).and_then(who);
                    Ok(match l.line.as_str() {
                        "received" => Line::Received { amount, by: by()? },
                        "passed on" => Line::PassedOn {
                            amount,
                            to: to()?,
                            by: by()?,
                            closes: l.closes.as_ref().map(|(r, i)| Ok::<_, JsError>((unhex(r)?, *i))).transpose()?,
                        },
                        "own part" => Line::OwnPart { amount },
                        "kept" => Line::Kept { amount },
                        "still owed" => Line::StillOwed { amount, to: to()? },
                        _ => return Err(err("a line is received, passed on, own part, kept or still owed")),
                    })
                })
                .collect::<R<Vec<_>>>()
        })
        .transpose()?;
    Ok(Report { call: CallRef { act: unhex(&r.call.act)?, task: r.call.task }, relies_on: hashes(&r.relies_on)?, lines })
}

fn payload_bytes(p: Vec<(Value, Value)>) -> Vec<u8> {
    cbor::encode(&Value::Map(p))
}

#[derive(Serialize)]
struct SpecType {
    spec: String,
    #[serde(rename = "type")]
    type_: u64,
}

#[derive(Serialize)]
struct Specs {
    terms: SpecType,
    statement: SpecType,
    report: SpecType,
}

/// The spec hash and type number of each new act (encoding-1, E2): Terms
/// and Statement under draft 24's spec hash; the report, a proposal, under
/// the report block's third proposal's.
#[wasm_bindgen(js_name = agreementsNewSpecs)]
pub fn agreements_new_specs() -> R<JsValue> {
    let st = |s: &Hash, t| SpecType { spec: hx(s), type_: t };
    to_js(&Specs {
        terms: st(&an::SPEC_DRAFT_24, an::types::TERMS),
        statement: st(&an::SPEC_DRAFT_24, an::types::STATEMENT),
        report: st(&an::SPEC_REPORT_BLOCK_3, an::types::REPORT),
    })
}

/// A Terms act's payload, as CBOR, for `makeEveryday` (encoding-1, "Terms").
#[wasm_bindgen(js_name = agreementsNewTermsPayload)]
pub fn agreements_new_terms_payload(input: JsValue) -> R<Vec<u8>> {
    let t: TermsIn = super::from_js(input)?;
    Ok(payload_bytes(terms_of(&t)?.to_payload().map_err(reject)?))
}

/// A Statement's payload, as CBOR (encoding-1, "Statement").
#[wasm_bindgen(js_name = agreementsNewStatementPayload)]
pub fn agreements_new_statement_payload(input: JsValue) -> R<Vec<u8>> {
    let s: StatementIn = super::from_js(input)?;
    Ok(payload_bytes(statement_of(&s)?.to_payload().map_err(reject)?))
}

/// A report's payload, as CBOR (encoding-1, "The report": a proposal).
#[wasm_bindgen(js_name = agreementsNewReportPayload)]
pub fn agreements_new_report_payload(input: JsValue) -> R<Vec<u8>> {
    let r: ReportIn = super::from_js(input)?;
    Ok(payload_bytes(report_of(&r)?.to_payload().map_err(reject)?))
}

#[derive(Serialize)]
struct FindingOut {
    rule: &'static str,
    says: String,
}

#[derive(Serialize)]
struct AnswerOut {
    verdict: &'static str,
    act: Option<&'static str>,
    id: Option<String>,
    signer: Option<String>,
    rule: Option<String>,
    says: String,
    invalid: Vec<FindingOut>,
    notes: Vec<FindingOut>,
}

fn answer_out(a: &an::Answer) -> AnswerOut {
    let f = |v: &[Finding]| v.iter().map(|x| FindingOut { rule: x.rule, says: x.says.clone() }).collect();
    AnswerOut {
        verdict: a.verdict.word(),
        act: a.act.as_ref().map(Decoded::word),
        id: a.id.map(|h| hx(&h)),
        signer: a.signer.map(|h| hx(&h)),
        rule: a.rule.clone(),
        says: a.says.clone(),
        invalid: f(&a.invalid),
        notes: f(&a.notes),
    }
}

fn key32(k: Option<Vec<u8>>) -> R<Option<[u8; 32]>> {
    k.map(|k| k.try_into().map_err(|_| err("a content key is 32 bytes"))).transpose()
}

/// The checker, for one act's bytes (and its content key if private):
/// `{ verdict, act, id, signer, rule, says, invalid, notes }`, the verdict
/// one of "pass", "rejected", "invalid", "unknown", "cannot open", "not this
/// encoding" (encoding-1, "What the checker answers").
#[wasm_bindgen(js_name = agreementsNewCheck)]
pub fn agreements_new_check(act: &[u8], key: Option<Vec<u8>>) -> R<JsValue> {
    let k = key32(key)?;
    to_js(&answer_out(&an::check(act, k.as_ref())))
}

#[derive(Deserialize)]
struct HeldIn {
    #[serde(with = "serde_bytes")]
    act: Vec<u8>,
    #[serde(default, with = "serde_bytes")]
    key: Option<Vec<u8>>,
}

/// The checker, for the acts a verifier holds together (`[{ act, key? }]`):
/// each answer, with G6.1 read among them.
#[wasm_bindgen(js_name = agreementsNewCheckHeld)]
pub fn agreements_new_check_held(acts: JsValue) -> R<JsValue> {
    let held: Vec<HeldIn> = super::from_js(acts)?;
    let keys = held.iter().map(|h| key32(h.key.clone())).collect::<R<Vec<_>>>()?;
    let input: Vec<(&[u8], Option<&[u8; 32]>)> = held.iter().zip(&keys).map(|(h, k)| (h.act.as_slice(), k.as_ref())).collect();
    to_js(&an::check_held(&input).iter().map(answer_out).collect::<Vec<_>>())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn h(n: u8) -> String {
        hex::encode([n; 32])
    }

    fn s(n: u8) -> SocketIn {
        SocketIn { cmip: h(n), params: None }
    }

    #[test]
    fn builders_give_what_the_checker_takes() {
        let t = TermsIn {
            parties: Some(vec![PartyIn::Signer(h(1)), PartyIn::Role(RoleIn { kind: "future".into(), what: None, spot: s(2) })]),
            authors: Some(vec![0, 1]),
            body: Some(BodyIn { words: h(3), cmip: h(4), params: Some(vec![0xf6]) }),
            in_force: Some(s(5)),
            powers: Some(vec![PowerIn { kind: "assent".into(), rule: s(6) }, PowerIn { kind: h(7), rule: s(8) }]),
            receiver: Some(ReceiverIn::Party(0)),
            calls: Some(vec![CallIn { task: 6, from: "both".into() }]),
            ..Default::default()
        };
        let terms = terms_of(&t).unwrap();
        let p = terms.to_payload().unwrap();
        assert_eq!(Terms::from_payload(&p).unwrap().grammar().0, vec![]);
        let st = StatementIn {
            agreement: h(9),
            terms: h(9),
            kind: KindIn::Word("contest".into()),
            content: Some(cbor::encode(&Value::Text("not delivered".into()))),
            for_: None,
            under: None,
            previous: None,
            answers: None,
            relies_on: None,
            settlement: Some(h(10)),
            resolves: None,
            continues: None,
        };
        assert!(statement_of(&st).unwrap().to_payload().is_ok());
        let r = ReportIn {
            call: CallRefIn { act: h(11), task: None },
            relies_on: None,
            lines: Some(vec![LineIn { line: "received".into(), amount: AmountIn { unit: h(12), value: 5 }, by: Some(h(13)), to: None, closes: None }]),
        };
        assert!(report_of(&r).unwrap().to_payload().is_ok());
        // A builder refuses what would be rejected, naming the rule.
        let bad = TermsIn { replaces: Some(h(1)), ..Default::default() };
        assert_eq!(terms_of(&bad).unwrap().to_payload().unwrap_err().rule, "E19");
    }
}
