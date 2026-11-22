//! Exploratory stand-ins for cMIPs the verifier does not hold. **None of
//! these is the verifier's answer.** Each is this session's reading of a
//! cMIP's text, written so that one can see what verifier 2 answers once a
//! missing cMIP is supplied; every answer got with one is reported apart, and
//! marked exploratory.

use mor_core::agreements_new::grammar::held::Held;
use mor_core::agreements_new::grammar::sockets::{Ask, Cmip, Out};
use mor_core::agreements_new::{Party, Who};
use mor_core::cbor::Value;

/// "Every party named as a signer": yes where an assent is counted in the
/// name of every party the Terms name as a signer. This is the grammar's own
/// default (G4.1) restated as a cMIP; it is used as a stand-in for an
/// `in_force` cMIP whose text asks the same of the named signers.
pub struct EveryNamedSigner;

impl Cmip for EveryNamedSigner {
    fn name(&self) -> &str {
        "stand-in (exploratory, this session's reading): every party named as a signer"
    }

    fn ask(&self, _params: &Value, ask: &Ask, held: &Held) -> Out {
        let Ask::InForce { terms, counted } = ask else { return Out::CannotAnswer("this stand-in answers only K2".into()) };
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
            Out::YesNo { yes: true, ground: "an assent is counted in the name of every party named as a signer".into() }
        } else {
            Out::YesNo { yes: false, ground: format!("no assent is counted for {}", missing.join(", ")) }
        }
    }
}

/// "The grammar's own defaults": what the grammar rules do where a socket is
/// empty, offered in the place of a cMIP the verifier lacks. As K2: an assent
/// counted in the name of every party named as a signer (G4.1). As K4: valid
/// where an assent to the update is counted in the name of everyone who
/// signed the original (G4.8(c), G4.11(e)). It reads no parameters and none
/// of the lacking cMIP's own text: it shows what the grammar alone would
/// answer, and nothing about what the cMIP would.
pub struct GrammarDefaults;

impl Cmip for GrammarDefaults {
    fn name(&self) -> &str {
        "stand-in (exploratory): the grammar's own defaults in place of a cMIP not held"
    }

    fn ask(&self, params: &Value, ask: &Ask, held: &Held) -> Out {
        match ask {
            Ask::InForce { .. } => EveryNamedSigner.ask(params, ask, held),
            Ask::Update { counted, signed_original, .. } => {
                let missing = signed_original.iter().filter(|w| !counted.iter().any(|c| c.name == **w)).count();
                if missing == 0 {
                    Out::Update { valid: true, ground: "an assent to the update is counted for everyone who signed the original (the default)".into() }
                } else {
                    Out::Update { valid: false, ground: format!("no assent to the update is counted for {missing} of those who signed the original (the default)") }
                }
            }
            _ => Out::CannotAnswer("this stand-in answers only K2 and K4".into()),
        }
    }
}

pub fn by_name(name: &str) -> Result<Box<dyn Cmip>, String> {
    match name {
        "every-named-signer" => Ok(Box::new(EveryNamedSigner)),
        "grammar-defaults" => Ok(Box::new(GrammarDefaults)),
        _ => Err(format!("no stand-in named {name}")),
    }
}
