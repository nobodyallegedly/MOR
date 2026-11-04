//! The default control cMIP, draft 1 (`cmips/cmip-collective-control-draft-1.md`;
//! Agreements draft 18, rule 99).
//!
//! In plain words: a collective names this cMIP in its terms' field 35,
//! with its parameters: its areas finer than a layer (parameter 34), their
//! words (20), the holders' rule of each stake (30) and, in a clone that is
//! an issuance, the offer it follows (32). Each parameter keeps the number
//! and the encoding the terms field it replaces had. The core never reads
//! them: it asks this model, which answers its queries
//! ([`mor_core::agreements::control::ControlModel`]).
//!
//! Test data: the cMIP's hash here is a stand-in, SHA-256 of a label, until
//! its specification is published with its creator.

use mor_core::agreements::control::{Answers, ControlModel, Held};
use mor_core::agreements::{AgreementsError, Control, HoldersEntry, IssuesUnder, Terms};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use std::rc::Rc;

type R<T> = Result<T, AgreementsError>;

/// The stand-in hash of this cMIP's specification (test data).
pub fn cmip() -> Hash {
    sha256(b"cMIP: A collective's control, draft 1 (stand-in)")
}

/// This cMIP, as a verifier holds it.
pub struct Default;

/// The control models a client holds by default: this one (Agreements rule
/// 98's client conformance: "a client acting for or reading a collective
/// holds the default control cMIP").
pub fn held() -> Held {
    vec![(cmip(), Rc::new(Default) as Rc<dyn ControlModel>)]
}

/// Name this cMIP as `t`'s control model, its parameters packed from the
/// answers `t` holds, fresh at every encoding.
pub fn install(t: &mut Terms) {
    t.control = Some(Control { cmip: cmip(), params: params(t), pack: Some(params) });
}

/// The parameters for the answers `t` holds: a map keyed 20, 30, 32 and 34,
/// each as the terms field of that number was encoded.
pub fn params(t: &Terms) -> Value {
    let mut m: Vec<(Value, Value)> = vec![];
    if let Some(w) = &t.area_words {
        m.push((Value::Uint(20), Value::Map(w.iter().map(|(id, s)| (Value::Uint(*id), Value::Text(s.clone()))).collect())));
    }
    if let Some(x) = &t.holders_rules {
        m.push((
            Value::Uint(30),
            Value::Array(
                x.iter()
                    .map(|e| {
                        let mut a = vec![Value::Uint(e.stake), e.rule.to_value()];
                        if e.waived {
                            a.push(Value::Bool(true));
                        }
                        Value::Array(a)
                    })
                    .collect(),
            ),
        ));
    }
    match &t.issues_under {
        Some(IssuesUnder::Offer(h)) => m.push((Value::Uint(32), Value::Bytes(h.to_vec()))),
        Some(IssuesUnder::Waived) => m.push((Value::Uint(32), Value::Array(vec![Value::Uint(0)]))),
        None => {}
    }
    if let Some(a) = &t.areas {
        m.push((Value::Uint(34), Value::Array(a.iter().map(|x| x.to_value()).collect())));
    }
    Value::Map(m)
}

fn shape(w: &'static str) -> AgreementsError {
    AgreementsError::Shape(w)
}
fn uint(v: &Value, w: &'static str) -> R<u64> {
    match v {
        Value::Uint(n) => Ok(*n),
        _ => Err(shape(w)),
    }
}
fn nonempty<'a>(v: &'a Value, w: &'static str) -> R<&'a [Value]> {
    match v {
        Value::Array(a) if !a.is_empty() => Ok(a),
        _ => Err(shape(w)),
    }
}
fn hash32(v: &Value, w: &'static str) -> R<Hash> {
    match v {
        Value::Bytes(b) if b.len() == 32 => Ok(Hash::try_from(&b[..]).map_err(|_| shape(w))?),
        _ => Err(shape(w)),
    }
}

impl ControlModel for Default {
    fn read(&self, params: &Value) -> R<Answers> {
        let Value::Map(m) = params else { return Err(shape("the default control cMIP's parameters: a map")) };
        let mut out = Answers::default();
        let mut last = None;
        for (k, v) in m {
            let n = uint(k, "a parameter's key")?;
            if last.is_some_and(|l| l >= n) {
                return Err(shape("parameters, ascending by key"));
            }
            last = Some(n);
            match n {
                20 => {
                    let Value::Map(w) = v else { return Err(shape("parameter 20, area words")) };
                    if w.is_empty() {
                        return Err(shape("parameter 20, area words"));
                    }
                    out.area_words = Some(
                        w.iter()
                            .map(|(k, v)| match v {
                                Value::Text(t) => Ok((uint(k, "area words id")?, t.clone())),
                                _ => Err(shape("area words")),
                            })
                            .collect::<R<_>>()?,
                    );
                }
                30 => {
                    out.holders_rules = Some(
                        nonempty(v, "holders' rules")?
                            .iter()
                            .map(|e| {
                                let Value::Array(a) = e else { return Err(shape("holders' rules: an entry is [stake, holders-rule, ? waived: true]")) };
                                if a.len() < 2 || a.len() > 3 {
                                    return Err(shape("holders' rules: an entry is [stake, holders-rule, ? waived: true]"));
                                }
                                let waived = match a.get(2) {
                                    None => false,
                                    Some(Value::Bool(true)) => true,
                                    Some(_) => return Err(shape("holders' rules: a standing waiver is written true")),
                                };
                                Ok(HoldersEntry { stake: uint(&a[0], "holders' rules: the stake")?, rule: mor_core::agreements::holders_rule(&a[1])?, waived })
                            })
                            .collect::<R<_>>()?,
                    );
                }
                32 => {
                    out.issues_under = Some(match v {
                        Value::Array(a) if a.len() == 1 && a[0] == Value::Uint(0) => IssuesUnder::Waived,
                        _ => IssuesUnder::Offer(hash32(v, "issues under: the issuance offer, or [0]")?),
                    });
                }
                34 => {
                    out.areas = Some(nonempty(v, "parameter 34, areas")?.iter().map(mor_core::agreements::area).collect::<R<_>>()?);
                }
                _ => return Err(shape("the default control cMIP's parameters are 20, 30, 32 and 34")),
            }
        }
        Ok(out)
    }

    fn pack(&self) -> Option<fn(&Terms) -> Value> {
        Some(params)
    }
}

/// This cMIP as terms name it, its parameters packed fresh from the terms'
/// answers at every encoding (for terms built in memory).
pub fn control() -> Control {
    Control { cmip: cmip(), params: Value::Map(vec![]), pack: Some(params) }
}

/// Decode a terms payload and read its control model's answers through the
/// models a client holds by default ([`held`]): terms as a client reads them.
pub fn decode(p: &[(Value, Value)]) -> R<Terms> {
    let mut t = Terms::decode(p)?;
    if !mor_core::agreements::control::fill(&mut t, &held())? {
        return Err(AgreementsError::Missing(t.control.as_ref().expect("named").cmip));
    }
    Ok(t)
}
