//! The publication (Agreements type 6) for the TypeScript clients: its
//! payload made from the fields a client names and decoded back strictly,
//! a publication judged, and whether a price tag counts under one. As
//! everywhere in these bindings, the core library decides.

use super::{err, from_js, hx, lerr, plan_out, specs_of, to_js, unhex, PlanOut, Verifier, R};
use mor_core::agreements::{self, Partner, Publication, RefundTerms, ShareRule, Sold, SplitPlan, Unfilled};
use mor_core::cbor::{self, Value};
use mor_core::hash::Hash;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct PartnerIn {
    identity: String,
    share: u64,
    #[serde(default)]
    label: Option<String>,
}

/// What a publication sells: `{ bake }`, `{ vow }`, or `{ cmip, params }`
/// (a proven delivery, its parameters as deterministic CBOR bytes).
#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct SoldIn {
    #[serde(default)]
    bake: Option<String>,
    #[serde(default)]
    vow: Option<String>,
    #[serde(default)]
    cmip: Option<String>,
    #[serde(default)]
    params: Option<serde_bytes::ByteBuf>,
}

/// A share of the plan: `{ role, part }` or `{ metric, part }`.
#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ShareIn {
    #[serde(default)]
    role: Option<String>,
    #[serde(default)]
    metric: Option<u64>,
    part: u64,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct PlanIn {
    #[serde(default)]
    shares: Vec<ShareIn>,
    cmip: String,
    #[serde(default)]
    service_bears_rail_fees: bool,
    /// A maximum rail fee per payout in millionths, if any.
    #[serde(default)]
    max_rail_fee_millionths: Option<u64>,
}

/// A publication's fields as a client names them. `sold` absent: a split
/// agreement; empty: a later version ending the publication.
#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct PublicationIn {
    #[serde(default)]
    sold: Option<Vec<SoldIn>>,
    #[serde(default)]
    owners: Option<String>,
    #[serde(default)]
    partners: Vec<PartnerIn>,
    service: String,
    plan: PlanIn,
    #[serde(default)]
    words: Option<String>,
    /// The cMIPs, at most one per task: `[task, hash]`.
    #[serde(default)]
    cmips: Vec<(u64, String)>,
    #[serde(default)]
    designated: Option<String>,
    #[serde(default)]
    backups: Vec<String>,
    /// A refund point on its time reference, with the time reference's
    /// cMIP (`time`), where it has one.
    #[serde(default)]
    time: Option<String>,
    #[serde(default)]
    refund_until: Option<u64>,
    #[serde(default)]
    until: Option<u64>,
}

fn opt(h: &Option<String>) -> R<Option<Hash>> {
    h.as_deref().map(unhex).transpose()
}

impl PublicationIn {
    fn core(&self) -> R<Publication> {
        let sold = self
            .sold
            .as_ref()
            .map(|v| {
                v.iter()
                    .map(|x| match (&x.bake, &x.vow, &x.cmip) {
                        (Some(b), None, None) => Ok(Sold::Bake(unhex(b)?)),
                        (None, Some(v), None) => Ok(Sold::Vow(unhex(v)?)),
                        (None, None, Some(c)) => Ok(Sold::Access(unhex(c)?, x.params.as_ref().map(|p| p.to_vec()).unwrap_or_else(|| cbor::encode(&Value::Null)))),
                        _ => Err(err("what a publication sells is one of a bake, a vow, or a cMIP and its parameters")),
                    })
                    .collect::<R<Vec<_>>>()
            })
            .transpose()?;
        let shares = self
            .plan
            .shares
            .iter()
            .map(|s| match (&s.role, s.metric) {
                (Some(r), None) => Ok(ShareRule::Role { role: r.clone(), part: s.part }),
                (None, Some(m)) => Ok(ShareRule::Metric { metric: m, part: s.part }),
                _ => Err(err("a share of the plan is a role or a metric share")),
            })
            .collect::<R<Vec<_>>>()?;
        let plan = SplitPlan {
            shares,
            cmip: unhex(&self.plan.cmip)?,
            unfilled: Unfilled::Stakes,
            top: vec![],
            service_bears_rail_fees: self.plan.service_bears_rail_fees,
            max_rail_fee: self.plan.max_rail_fee_millionths.map(Value::Uint),
            params: None,
            metrics: vec![],
            fees: vec![],
        };
        let mut partners = self.partners.iter().map(|p| Ok(Partner { identity: unhex(&p.identity)?, share: p.share, label: p.label.clone() })).collect::<R<Vec<_>>>()?;
        partners.sort_by(|a, b| a.identity.cmp(&b.identity));
        let mut cmips = self.cmips.iter().map(|(t, h)| Ok((*t, unhex(h)?))).collect::<R<Vec<_>>>()?;
        cmips.sort();
        Ok(Publication {
            sold,
            owners: opt(&self.owners)?,
            partners,
            service: unhex(&self.service)?,
            plan,
            words: self.words.clone(),
            time: self.time.as_deref().map(|t| Ok::<_, JsError>((unhex(t)?, Value::Null))).transpose()?,
            until: self.until.map(Value::Uint),
            refund: self.refund_until.map(|u| RefundTerms { until: Value::Uint(u) }),
            cmips,
            designated: opt(&self.designated)?,
            backups: self.backups.iter().map(|h| unhex(h)).collect::<R<Vec<_>>>()?,
            failed: None,
        })
    }
}

#[derive(Serialize)]
struct MadeOut {
    #[serde(rename = "type")]
    type_: u64,
    #[serde(with = "serde_bytes")]
    payload: Vec<u8>,
}

/// A publication's payload (Agreements type 6), encoded by the core and
/// decoded back strictly, its format's own checks applied: `{ type,
/// payload }`, to sign under the Agreements MIR's spec. Its `objects` are
/// the caller's to write: a later version names `[first, previous]` first;
/// one naming an ownership agreement names it as `[agreement, agreement]`.
#[wasm_bindgen(js_name = publicationPayload)]
pub fn publication_payload(input: JsValue) -> R<JsValue> {
    let p = from_js::<PublicationIn>(input)?.core()?;
    let bytes = cbor::encode(&Value::Map(p.to_map()));
    to_js(&MadeOut { type_: agreements::types::PUBLICATION, payload: bytes })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PublicationOut {
    id: String,
    first: String,
    drafter: String,
    parties: Vec<String>,
    unsigned: Vec<String>,
    counts: bool,
    problems: Vec<String>,
    latest: Vec<String>,
    ends: bool,
    split_agreement: bool,
    outside_claims: Vec<String>,
    owners: Option<String>,
    sold: Vec<SoldIn>,
    partners: Vec<PartnerIn>,
    service: String,
    backups: Vec<String>,
    designated: Option<String>,
    words: Option<String>,
    plan: PlanOut,
}

#[wasm_bindgen]
impl Verifier {
    /// A publication, judged (Agreements rule 11): its parties and who has
    /// not signed, whether it counts and why not, the latest versions of its
    /// line, whether this version ends it, and the ownership agreements
    /// claiming what it sells that it stands outside of (rule 14).
    #[wasm_bindgen(js_name = agreementsPublication)]
    pub fn agreements_publication(&self, specs: JsValue, id: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let e = view.publication(&unhex(id)?).map_err(lerr)?;
        let p = &e.publication;
        to_js(&PublicationOut {
            id: hx(&e.id),
            first: hx(&e.first),
            drafter: hx(&e.drafter),
            parties: e.parties.iter().map(hx).collect(),
            unsigned: e.unsigned.iter().map(hx).collect(),
            counts: e.counts,
            problems: e.problems.clone(),
            latest: e.latest.iter().map(hx).collect(),
            ends: e.ends,
            split_agreement: p.is_split_agreement(),
            outside_claims: e.outside_claims.iter().map(hx).collect(),
            owners: p.owners.as_ref().map(hx),
            sold: p
                .sold
                .iter()
                .flatten()
                .map(|x| match x {
                    Sold::Bake(b) => SoldIn { bake: Some(hx(b)), vow: None, cmip: None, params: None },
                    Sold::Vow(v) => SoldIn { bake: None, vow: Some(hx(v)), cmip: None, params: None },
                    Sold::Access(c, params) => SoldIn { bake: None, vow: None, cmip: Some(hx(c)), params: Some(serde_bytes::ByteBuf::from(params.clone())) },
                })
                .collect(),
            partners: p.partners.iter().map(|q| PartnerIn { identity: hx(&q.identity), share: q.share, label: q.label.clone() }).collect(),
            service: hx(&p.service),
            backups: p.backups.iter().map(hx).collect(),
            designated: p.designated.as_ref().map(hx),
            words: p.words.clone(),
            plan: plan_out(&p.plan),
        })
    }

    /// Whether a price tag counts under its publication (Money rule 18;
    /// Agreements rule 12): "counts" (with the publication, and whether this
    /// version withdraws the tag), "nobody's offer" or "unknown", with why.
    #[wasm_bindgen(js_name = agreementsTagUnder)]
    pub fn agreements_tag_under(&self, specs: JsValue, tag: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        #[derive(Serialize)]
        struct Out {
            verdict: &'static str,
            publication: Option<String>,
            withdrawn: bool,
            why: Option<String>,
        }
        to_js(&match view.tag_under(&unhex(tag)?).map_err(lerr)? {
            agreements::TagUnder::Counts { publication, withdrawn } => Out { verdict: "counts", publication: Some(hx(&publication)), withdrawn, why: None },
            agreements::TagUnder::Nobodys(w) => Out { verdict: "nobody's offer", publication: None, withdrawn: false, why: Some(w) },
            agreements::TagUnder::Unknown(w) => Out { verdict: "unknown", publication: None, withdrawn: false, why: Some(w) },
        })
    }
}
