//! The grammar verifier of the new Agreements, for clients: read-only. A
//! client hands it the acts it holds (bytes, with content keys where private),
//! the stand-in layers' tables where it has them, the reader, and a question
//! by name (`agreementsNewQuestions` lists them); it gets back the answers as
//! JSON text, each with its word, the grammar rule, its qualifier, whether
//! disputed, who, the cMIP named, whose word it rests on, and plain words.
//!
//! The sockets are answered by the **stub cMIPs, for tests only**: a client
//! that names any other cMIP gets **unchecked** for every answer resting on
//! it (G9), as draft 24 asks. The layers (a place, the envelope's chain,
//! Money) are the test stand-ins: none of those layers exists yet.

use super::{err, R};
use mor_core::agreements_new::grammar::layers::{Layers, Payment, TableChain, TableEnvelope, TableMoney, TablePlace};
use mor_core::agreements_new::grammar::questions::{who, QUESTIONS};
use mor_core::agreements_new::grammar::{stubs, Held, Reader, Verifier};
use mor_core::agreements_new::Amount;
use mor_core::hash::Hash;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Default)]
pub(crate) struct ActIn {
    #[serde(with = "serde_bytes")]
    pub bytes: Vec<u8>,
    #[serde(default, with = "serde_bytes")]
    pub key: Option<Vec<u8>>,
}

#[derive(Deserialize, Default)]
pub(crate) struct PlaceIn {
    pub id: String,
    /// The acts the place shows, in order.
    pub order: Vec<String>,
}

#[derive(Deserialize, Default)]
pub(crate) struct TransferIn {
    pub id: String,
    pub follows: String,
    pub to: String,
}

#[derive(Deserialize, Default)]
pub(crate) struct EnvelopeIn {
    pub bake: String,
    pub baker: String,
    pub work: String,
    #[serde(default)]
    pub transfers: Vec<TransferIn>,
}

#[derive(Deserialize, Default)]
pub(crate) struct PaymentIn {
    pub id: String,
    pub payer: String,
    pub version: String,
    pub settlement: String,
    pub unit: String,
    pub value: u64,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AskIn {
    pub acts: Vec<ActIn>,
    pub ask: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub on_behalf_of: Option<String>,
    #[serde(default)]
    pub anchoring: Option<String>,
    #[serde(default)]
    pub places: Vec<PlaceIn>,
    #[serde(default)]
    pub envelopes: Vec<EnvelopeIn>,
    #[serde(default)]
    pub payments: Vec<PaymentIn>,
}

fn h(s: &str) -> Result<Hash, String> {
    hex::decode(s).map_err(|e| e.to_string())?.try_into().map_err(|_| format!("not 32 bytes: {s}"))
}

/// Ask the verifier; the answers as JSON text (an array).
pub(crate) fn ask(input: &AskIn) -> Result<String, String> {
    let keys: Vec<Option<[u8; 32]>> = input
        .acts
        .iter()
        .map(|a| a.key.as_ref().map(|k| k.as_slice().try_into().map_err(|_| "a content key is 32 bytes".to_string())).transpose())
        .collect::<Result<_, _>>()?;
    let acts: Vec<(&[u8], Option<&[u8; 32]>)> = input.acts.iter().zip(&keys).map(|(a, k)| (a.bytes.as_slice(), k.as_ref())).collect();
    let held = Held::from_bytes(&acts);
    let cmips = stubs::all();
    let mut layers = Layers::default();
    for p in &input.places {
        let order: Vec<Hash> = p.order.iter().map(|x| h(x)).collect::<Result<_, _>>()?;
        layers.places.insert(h(&p.id)?, Box::new(TablePlace::in_order(&order)));
    }
    if !input.envelopes.is_empty() {
        let mut c = TableChain::default();
        for e in &input.envelopes {
            let transfers = e.transfers.iter().map(|t| Ok((h(&t.id)?, h(&t.follows)?, h(&t.to)?))).collect::<Result<_, String>>()?;
            c.envelopes.insert(h(&e.bake)?, TableEnvelope { baker: h(&e.baker)?, work: h(&e.work)?, transfers, lacking: Default::default(), holder_in_fork: false });
        }
        layers.chain = Some(Box::new(c));
    }
    if !input.payments.is_empty() {
        let mut m = TableMoney::default();
        for p in &input.payments {
            m.settlements.insert(h(&p.settlement)?);
            m.payments.push(Payment { id: h(&p.id)?, payer: h(&p.payer)?, version: h(&p.version)?, settlement: h(&p.settlement)?, amount: Amount { unit: h(&p.unit)?, value: p.value } });
        }
        layers.money = Some(Box::new(m));
    }
    let reader = Reader { on_behalf_of: input.on_behalf_of.as_deref().map(who).transpose()?, anchoring: input.anchoring.as_deref().map(h).transpose()? };
    let v = Verifier::new(&held, &cmips, &layers).with_reader(reader);
    let args: Vec<&str> = input.args.iter().map(|s| s.as_str()).collect();
    let answers = v.ask_named(&input.ask, &args)?;
    Ok(format!("[{}]", answers.iter().map(|a| a.to_json().text()).collect::<Vec<_>>().join(",")))
}

/// The questions the verifier answers, by name, with their arguments.
#[wasm_bindgen(js_name = agreementsNewQuestions)]
pub fn agreements_new_questions() -> String {
    format!("[{}]", QUESTIONS.iter().map(|(n, a)| format!("{{\"ask\":\"{n}\",\"args\":\"{a}\"}}")).collect::<Vec<_>>().join(","))
}

/// Ask the grammar verifier a question of a set of acts: read-only. Input:
/// `{ acts: [{ bytes, key? }], ask, args, onBehalfOf?, anchoring?, places?,
/// envelopes?, payments? }`. Output: JSON text, an array of answers.
#[wasm_bindgen(js_name = agreementsNewAsk)]
pub fn agreements_new_ask(input: JsValue) -> R<String> {
    let i: AskIn = serde_wasm_bindgen::from_value(input).map_err(err)?;
    ask(&i).map_err(err)
}

#[cfg(test)]
mod tests {
    use super::*;
    use mor_core::agreements_new::grammar::cases;

    #[test]
    fn the_binding_gives_the_cases_answers() {
        let mut n = 0;
        for c in cases::all() {
            if !c.book.places.is_empty() || c.book.chain.is_some() || c.book.money.is_some() || c.reader.on_behalf_of.is_some() || c.reader.anchoring.is_some() || c.limits.is_some() {
                continue;
            }
            let (name, args) = c.question.describe();
            let input = AskIn { acts: c.book.acts.iter().map(|a| ActIn { bytes: a.bytes.clone(), key: None }).collect(), ask: name.into(), args, ..Default::default() };
            let text = ask(&input).unwrap();
            let (want, _) = c.run();
            let want = format!("[{}]", want.iter().map(|a| a.to_json().text()).collect::<Vec<_>>().join(","));
            assert_eq!(text, want, "{}", c.name);
            n += 1;
        }
        assert!(n > 40);
        assert!(agreements_new_questions().contains("\"in_force\""));
    }
}
