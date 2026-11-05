//! A stand-in control model whose answers the verifier is told (test data):
//! for the published vectors, which cannot hold a model, a case states the
//! model's answer for each act of a type (Agreements draft 19, rule 99's
//! `answer`), as it states a rail's answers. It gives no area and names no
//! power for a clone; it answers acts only, as stated.

use mor_core::act::Inside;
use mor_core::agreements::control::{Answers, ControlModel, Held};
use mor_core::agreements::{AgreementsError, Terms};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use std::rc::Rc;

/// The stand-in hash of this model (test data).
pub fn cmip() -> Hash {
    sha256(b"cMIP: a control model whose answers the verifier states (stand-in)")
}

/// The model, with its answers by act type: `((spec, type), answer)`.
pub struct Stated(pub Vec<((Hash, u64), Value)>);

impl Stated {
    /// This model, as a verifier holds it.
    pub fn held(answers: Vec<((Hash, u64), Value)>) -> Held {
        vec![(cmip(), Rc::new(Stated(answers)) as Rc<dyn ControlModel>)]
    }
}

impl ControlModel for Stated {
    fn read(&self, params: &Value) -> Result<Answers, AgreementsError> {
        match params {
            Value::Map(m) if m.is_empty() => Ok(Answers::default()),
            _ => Err(AgreementsError::Shape("the stated model's parameters: an empty map")),
        }
    }

    fn powers_by_share(&self, _: &Terms) -> Vec<((Hash, u64), Value)> {
        // The stated answers that give a power by share, `[0, [2, counted]]`.
        self.0
            .iter()
            .filter_map(|(k, v)| match v {
                Value::Array(a) if a.len() == 2 && a[0] == Value::Uint(0) => match &a[1] {
                    Value::Array(b) if b.len() == 2 && b[0] == Value::Uint(2) => Some((*k, b[1].clone())),
                    _ => None,
                },
                _ => None,
            })
            .collect()
    }

    fn act_answer(&self, _: &Terms, inside: &Inside) -> Option<Value> {
        self.0.iter().find(|((s, t), _)| *s == inside.spec && *t == inside.type_).map(|(_, v)| v.clone())
    }
}
