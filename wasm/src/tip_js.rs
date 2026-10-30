//! What a client pays against: a publication's latest versions, its price
//! tags' latest versions that count under it, and the latest version of
//! the ownership agreement it names. Every app that pays follows each line
//! to its tip first, with this (Agreements rule 12; Money rule 18).

use super::{hx, lerr, specs_of, to_js, unhex, Verifier, R};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TipOut {
    latest: Vec<String>,
    tags: Vec<String>,
    owners: Option<String>,
    owners_latest: Option<String>,
}

#[wasm_bindgen]
impl Verifier {
    /// The tips a payment names (F409), for a publication by its first
    /// version: `latest`, its latest versions (two or more, the parties'
    /// fork); `tags`, the latest version of each price tag line that counts
    /// under it, one per price; `owners` and `ownersLatest`, the ownership
    /// agreement it names and that agreement's latest version, which a
    /// purchase names in field 9.
    #[wasm_bindgen(js_name = agreementsPublicationTip)]
    pub fn agreements_publication_tip(&self, specs: JsValue, first: &str) -> R<JsValue> {
        let s = specs_of(specs)?;
        let view = s.view(&self.inner)?;
        let t = view.publication_tip(&unhex(first)?).map_err(lerr)?;
        to_js(&TipOut {
            latest: t.latest.iter().map(hx).collect(),
            tags: t.tags.iter().map(hx).collect(),
            owners: t.owners.as_ref().map(|(o, _)| hx(o)),
            owners_latest: t.owners.as_ref().map(|(_, l)| hx(l)),
        })
    }
}
