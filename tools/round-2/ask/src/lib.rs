//! Verifier 2, asked as the kit's `agreementsNewAsk` asks it
//! (v2/wasm/src/agreements_new_grammar_js.rs, `ask`): the acts held from their
//! bytes (`Held::from_bytes`), the stub cMIPs only (`stubs::all()`), no
//! stand-in layers, no reader, then `Verifier::ask_named`. Any cMIP other
//! than the stubs is one the verifier lacks: answers resting on it are
//! "unchecked" (G9), exactly as in the kit.

use mor_core::agreements_new::grammar::layers::Layers;
use mor_core::agreements_new::grammar::sockets::{Ask, Cmip, Out};
use mor_core::agreements_new::grammar::{stubs, Held, Verifier};
use mor_core::agreements_new::{Party, Who};
use mor_core::cbor::Value;
use mor_core::hash::Hash;

/// One act held: its bytes, and its content key where it is private.
pub struct ActIn {
    pub bytes: Vec<u8>,
    pub key: Option<[u8; 32]>,
}

/// The answers as JSON text (an array), byte for byte as the binding gives them.
pub fn ask(acts: &[ActIn], ask: &str, args: &[&str]) -> Result<String, String> {
    ask_holding(acts, ask, args, &[])
}

/// **An experiment, not the kit's answer.** As [`ask`], but the verifier also
/// holds, under each fingerprint given, a K2 (`in_force`) cMIP that answers
/// by G4.1's default: yes when an assent is counted in the name of every
/// party the Terms name as a signer. It stands in for a cMIP whose text says
/// the same (such as a "named signers" rule); it is not that cMIP's code.
pub fn ask_holding(acts: &[ActIn], ask: &str, args: &[&str], as_default: &[Hash]) -> Result<String, String> {
    let list: Vec<(&[u8], Option<&[u8; 32]>)> = acts.iter().map(|a| (a.bytes.as_slice(), a.key.as_ref())).collect();
    let held = Held::from_bytes(&list);
    let mut cmips = stubs::all();
    for fp in as_default {
        cmips.hold(*fp, Box::new(DefaultInForce));
    }
    let layers = Layers::default();
    let v = Verifier::new(&held, &cmips, &layers);
    let answers = v.ask_named(ask, args)?;
    Ok(format!("[{}]", answers.iter().map(|a| a.to_json().text()).collect::<Vec<_>>().join(",")))
}

/// The questions by name, with their arguments.
pub fn questions() -> Vec<(&'static str, &'static str)> {
    mor_core::agreements_new::grammar::questions::QUESTIONS.to_vec()
}

/// The acts (kind 0 items) of one feed page as a relay serves it
/// (`{0: [[arrival, kind, bytes], ...], 1: next}`), or of a place's record
/// page (a list of acts' bytes). Sealed containers (kind 1) are skipped.
pub fn feed_acts(page: &[u8]) -> Result<Vec<Vec<u8>>, String> {
    use mor_core::cbor::{decode, Value};
    let v = decode(page).map_err(|e| format!("{e:?}"))?;
    let items = match v {
        Value::Map(m) => m.into_iter().find(|(k, _)| *k == Value::Uint(0)).map(|(_, x)| x).ok_or("no items")?,
        list @ Value::Array(_) => list,
        _ => return Err("not a feed or record page".into()),
    };
    let Value::Array(items) = items else { return Err("items are no list".into()) };
    let mut out = Vec::new();
    for it in items {
        match it {
            Value::Bytes(b) => out.push(b),
            Value::Array(t) if t.len() == 3 => {
                if let (Value::Uint(0), Value::Bytes(b)) = (&t[1], &t[2]) {
                    out.push(b.clone());
                }
            }
            _ => return Err("an item of an unknown shape".into()),
        }
    }
    Ok(out)
}

/// A K2 cMIP read as G4.1's default (every party named as a signer). For
/// the experiment of [`ask_holding`] only.
pub struct DefaultInForce;
impl Cmip for DefaultInForce {
    fn name(&self) -> &str {
        "K2 read as G4.1's default (experiment)"
    }
    fn ask(&self, _: &Value, ask: &Ask, held: &Held) -> Out {
        let Ask::InForce { terms, counted } = ask else { return Out::CannotAnswer("asked another task".into()) };
        let Some(t) = held.terms(terms) else { return Out::CannotAnswer("the Terms are not held".into()) };
        let missing: Vec<String> = t
            .parties
            .iter()
            .flatten()
            .filter_map(|p| if let Party::Signer(h) = p { Some(*h) } else { None })
            .filter(|h| !counted.iter().any(|c| c.name == Who::Signer(*h)))
            .map(|h| hex::encode(&h[..6]))
            .collect();
        if missing.is_empty() {
            Out::YesNo { yes: true, ground: "an assent counted in the name of every party named as a signer (experiment: G4.1's default)".into() }
        } else {
            Out::YesNo { yes: false, ground: format!("no assent counted for {} (experiment: G4.1's default)", missing.join(", ")) }
        }
    }
}
