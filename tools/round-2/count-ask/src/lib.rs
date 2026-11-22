//! count-ask: ask verifier 2 directly.
//!
//! In plain words: this loads act files (`.mor`, each one act's bytes), builds
//! the verifier exactly as the WebAssembly binding does for `agreementsNewAsk`
//! (`Held::from_bytes`, the stub cMIPs, `Verifier::new`, `ask_named`), asks
//! the questions it is given, and prints each answer with the grammar rule
//! the verifier applied. It holds no data: every path is given at run time.
//!
//! Precisely, beyond the binding: a place may be given as the list of acts it
//! shows, in order (one hex id a line), and cut at a position (`upto`), so
//! that "what the place showed at a head" can be asked; feed pages and the
//! place's own record pages can be read in place.

use mor_core::act::Act;
use mor_core::agreements_new::check::Decoded;
use mor_core::agreements_new::grammar::layers::{Layers, TablePlace};
use mor_core::agreements_new::grammar::questions::who;
use mor_core::agreements_new::grammar::{stubs, Answer, Cmips, Held, Reader, Verifier};
use mor_core::agreements_new::{check_held, Kind, Named, Party, Receiver, Who};
use mor_core::cbor::{self, Value};
use mor_core::hash::Hash;
use serde_json::{json, Value as J};

pub mod standin;

pub fn h(s: &str) -> Result<Hash, String> {
    hex::decode(s.trim()).map_err(|e| format!("not hex: {e}"))?.try_into().map_err(|_| format!("not 32 bytes: {s}"))
}

/// A place as given: its identifier, and each act it shows with its position.
#[derive(Clone, Debug, Default)]
pub struct PlaceIn {
    pub id: Hash,
    pub positions: Vec<(Hash, u64)>,
    pub contradicted: Vec<Hash>,
}

impl PlaceIn {
    /// The acts in order, positions from 1 (as `TablePlace::in_order`).
    pub fn in_order(id: Hash, acts: &[Hash]) -> PlaceIn {
        PlaceIn { id, positions: acts.iter().enumerate().map(|(i, a)| (*a, i as u64 + 1)).collect(), contradicted: vec![] }
    }

    /// Only what the place showed at or before a position.
    pub fn upto(mut self, n: u64) -> PlaceIn {
        self.positions.retain(|(_, p)| *p <= n);
        self
    }
}

/// Everything one run is given.
#[derive(Default)]
pub struct Input {
    pub acts: Vec<Vec<u8>>,
    pub places: Vec<PlaceIn>,
    pub on_behalf_of: Option<String>,
    pub anchoring: Option<Hash>,
    /// Exploratory, never the verifier's own: cMIP stand-ins held beside the
    /// stubs, each as (fingerprint, name of the stand-in). See `standin`.
    pub standins: Vec<(Hash, String)>,
    /// Hold, as pieces that are no acts (`Held::hold_piece`), the acts given
    /// that are acts of another specification (a work, a post): held, and
    /// known to be no Terms act, Statement or report. The binding has no way
    /// to say this; count-ask offers it so the difference can be seen.
    pub others_are_pieces: bool,
    /// Further pieces, by fingerprint.
    pub pieces: Vec<Hash>,
}

/// The verifier's inputs, built once and asked many questions.
pub struct Built {
    pub held: Held,
    pub cmips: Cmips,
    pub layers: Layers,
    pub reader: Reader,
}

pub fn build(input: &Input) -> Result<Built, String> {
    let acts: Vec<(&[u8], Option<&[u8; 32]>)> = input.acts.iter().map(|a| (a.as_slice(), None)).collect();
    let mut held = Held::from_bytes(&acts);
    if input.others_are_pieces {
        for b in &input.acts {
            if let Ok(a) = Act::decode(b) {
                if held.get(&a.id()).is_none() && !held.is_unreadable(&a.id()) {
                    held.hold_piece(a.id());
                }
            }
        }
    }
    for p in &input.pieces {
        held.hold_piece(*p);
    }
    let mut cmips = stubs::all();
    for (fp, name) in &input.standins {
        cmips.hold(*fp, standin::by_name(name)?);
    }
    let mut layers = Layers::default();
    for p in &input.places {
        let mut t = TablePlace::default();
        for (a, n) in &p.positions {
            t.positions.insert(*a, *n);
        }
        for c in &p.contradicted {
            t.contradicted.insert(*c);
        }
        layers.places.insert(p.id, Box::new(t));
    }
    let reader = Reader { on_behalf_of: input.on_behalf_of.as_deref().map(who).transpose()?, anchoring: input.anchoring };
    Ok(Built { held, cmips, layers, reader })
}

impl Built {
    pub fn verifier(&self) -> Verifier<'_> {
        Verifier::new(&self.held, &self.cmips, &self.layers).with_reader(self.reader.clone())
    }
}

/// Ask one question by name; the answers, as the verifier gives them.
pub fn ask(v: &Verifier, name: &str, args: &[&str]) -> Result<Vec<Answer>, String> {
    v.ask_named(name, args)
}

/// An answer as JSON (the verifier's own form).
pub fn answer_json(a: &Answer) -> J {
    serde_json::from_str(&a.to_json().text()).expect("the verifier's JSON")
}

// ---------------------------------------------------------------- reading in place

/// The acts of a home's feed page: a map whose key 0 is a list of rows, each
/// row ending with one act's bytes.
pub fn acts_of_page(bytes: &[u8]) -> Result<Vec<Vec<u8>>, String> {
    let v = cbor::decode(bytes).map_err(|e| format!("not a page: {e:?}"))?;
    let rows = match &v {
        Value::Map(m) => m.iter().find(|(k, _)| *k == Value::Uint(0)).map(|(_, v)| v.clone()).ok_or("a page with no rows")?,
        other => other.clone(),
    };
    let Value::Array(rows) = rows else { return Err("a page whose rows are no list".into()) };
    let mut out = vec![];
    for r in rows {
        match r {
            Value::Bytes(b) => out.push(b),
            Value::Array(a) => {
                if let Some(Value::Bytes(b)) = a.last() {
                    out.push(b.clone());
                }
            }
            _ => {}
        }
    }
    Ok(out)
}

/// The acts a place's record pages name, each with its record's number: each
/// record is an act of the place whose payload names the act lodged at key 0;
/// its number is its own position in the place's sequence. A record repeated
/// at a page boundary is read once; an act lodged twice keeps its first number.
pub fn place_order(pages: &[Vec<u8>]) -> Result<Vec<(Hash, u64)>, String> {
    let mut out: Vec<(Hash, u64)> = vec![];
    let mut seen = std::collections::HashSet::new();
    let mut shown = std::collections::HashSet::new();
    for p in pages {
        let v = cbor::decode(p).map_err(|e| format!("not a record page: {e:?}"))?;
        let Value::Array(rows) = v else { return Err("a record page that is no list".into()) };
        for r in rows {
            let Value::Bytes(b) = r else { return Err("a record that is no act".into()) };
            let act = Act::decode(&b).map_err(|e| format!("a record that is no act: {e:?}"))?;
            if !seen.insert(act.id()) {
                continue;
            }
            let inside = act.open(None).map_err(|e| format!("a record that does not open: {e:?}"))?;
            let named = inside.payload.iter().find(|(k, _)| *k == Value::Uint(0)).and_then(|(_, v)| if let Value::Bytes(b) = v { <Hash>::try_from(b.as_slice()).ok() } else { None });
            let named = named.ok_or("a record that names no act at key 0")?;
            let n = inside.position.ok_or("a record with no position in the place's sequence")?;
            if shown.insert(named) {
                out.push((named, n));
            }
        }
    }
    Ok(out)
}

// ---------------------------------------------------------------- the index

fn hx(h: &Hash) -> J {
    J::String(hex::encode(h))
}

fn opt(h: &Option<Hash>) -> J {
    h.as_ref().map(hx).unwrap_or(J::Null)
}

fn named(n: &Named) -> J {
    match n.fp() {
        Some(h) => hx(&h),
        None => J::String("(not a fingerprint)".into()),
    }
}

fn who_j(w: &Who) -> J {
    match w {
        Who::Signer(h) => json!({ "signer": hex::encode(h) }),
        Who::Agreement(h) => json!({ "agreement": hex::encode(h) }),
    }
}

/// What each act names, as the checker decodes it, with the checker's verdict
/// among the acts given (G6.1): one JSON object an act. No words, no
/// parameters' contents: fingerprints and field names only.
pub fn index(acts: &[Vec<u8>]) -> Vec<J> {
    let input: Vec<(&[u8], Option<&[u8; 32]>)> = acts.iter().map(|a| (a.as_slice(), None)).collect();
    let mut out = vec![];
    for a in check_held(&input) {
        let mut o = json!({
            "id": a.id.as_ref().map(hx),
            "signer": a.signer.as_ref().map(hx),
            "verdict": a.verdict.word(),
            "rule": a.rule,
            "invalid": a.invalid.iter().map(|f| f.rule).collect::<Vec<_>>(),
            "notes": a.notes.iter().map(|f| f.rule).collect::<Vec<_>>(),
        });
        let m = o.as_object_mut().unwrap();
        match &a.act {
            Some(Decoded::Terms(t)) => {
                m.insert("act".into(), "terms".into());
                m.insert("replaces".into(), opt(&t.replaces));
                m.insert("agreement".into(), opt(&t.agreement));
                m.insert("root".into(), hx(&t.agreement.unwrap_or(a.id.unwrap())));
                m.insert("previous".into(), opt(&t.previous));
                m.insert("resolves".into(), t.resolves.as_ref().map(|v| J::Array(v.iter().map(hx).collect())).unwrap_or(J::Null));
                m.insert("continues".into(), opt(&t.continues));
                m.insert("place".into(), opt(&t.place));
                m.insert("clock".into(), opt(&t.clock));
                m.insert(
                    "parties".into(),
                    J::Array(
                        t.parties
                            .iter()
                            .flatten()
                            .map(|p| match p {
                                Party::Signer(h) => json!({ "signer": hex::encode(h) }),
                                Party::Role(_) => json!({ "role": true }),
                                Party::Agreement(h) => json!({ "agreement": hex::encode(h) }),
                            })
                            .collect(),
                    ),
                );
                m.insert("authors".into(), json!(t.authors));
                m.insert("in_force".into(), t.in_force.as_ref().map(|s| named(&s.cmip)).unwrap_or(J::Null));
                m.insert("condition".into(), t.condition.as_ref().map(|s| named(&s.cmip)).unwrap_or(J::Null));
                m.insert("control".into(), t.control.as_ref().map(|s| named(&s.cmip)).unwrap_or(J::Null));
                m.insert("data".into(), t.data.as_ref().map(|s| named(&s.cmip)).unwrap_or(J::Null));
                m.insert("body".into(), t.body.as_ref().map(|b| json!({ "words": named(&b.words), "cmip": named(&b.socket.cmip) })).unwrap_or(J::Null));
                m.insert("relies_on".into(), J::Array(t.relies_on.iter().flatten().map(named).collect()));
                m.insert("powers".into(), json!(t.powers.as_ref().map(|p| p.len())));
                m.insert(
                    "receiver".into(),
                    match &t.receiver {
                        Some(Receiver::Party(n)) => json!({ "party": n }),
                        Some(Receiver::Agreement(h)) => json!({ "agreement": hex::encode(h) }),
                        None => J::Null,
                    },
                );
                m.insert("envelope".into(), opt(&t.envelope));
            }
            Some(Decoded::Statement(s)) => {
                m.insert("act".into(), "statement".into());
                m.insert(
                    "kind".into(),
                    match &s.kind {
                        Kind::Assent => "assent".into(),
                        Kind::CounterSignature => "counter_signature".into(),
                        Kind::Contest => "contest".into(),
                        Kind::Resolve => "resolve".into(),
                        Kind::Defined { cmip, .. } => json!({ "defined": hex::encode(cmip) }),
                    },
                );
                m.insert("agreement".into(), hx(&s.agreement));
                m.insert("root".into(), hx(&s.agreement));
                m.insert("terms".into(), hx(&s.terms));
                m.insert("previous".into(), opt(&s.previous));
                m.insert("for".into(), s.for_.as_ref().map(who_j).unwrap_or(J::Null));
                m.insert("under".into(), opt(&s.under));
                m.insert("answers".into(), s.answers.as_ref().map(|v| J::Array(v.iter().map(hx).collect())).unwrap_or(J::Null));
                m.insert("relies_on".into(), J::Array(s.relies_on.iter().flatten().map(named).collect()));
                m.insert("settlement".into(), opt(&s.settlement));
                m.insert("resolves".into(), s.resolves.as_ref().map(|v| J::Array(v.iter().map(hx).collect())).unwrap_or(J::Null));
                m.insert("continues".into(), opt(&s.continues));
            }
            Some(Decoded::Report(_)) => {
                m.insert("act".into(), "report".into());
            }
            None => {}
        }
        out.push(o);
    }
    out
}
