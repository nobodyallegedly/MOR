//! **Stub cMIPs, for tests and vectors only.** None of them is a cMIP anyone
//! should name in real Terms: each answers its socket's question from its own
//! parameters, as a table, so that a test can make a socket say yes or no.
//! Each is named by the fingerprint of a label that says it is a stub.
//!
//! In plain words: the verifier never computes a task's answer itself. To
//! test it, something must plug into each socket. These stand-ins do, one
//! per task (K1 to K8), and say in their names that they are stubs.

use super::held::Held;
use super::sockets::{Ask, BodyReading, Cmip, Cmips, Delegation, Ending, Filling, Out, SpotReading};
use crate::agreements_new::Who;
use crate::cbor::Value;
use crate::hash::{sha256, Hash};

/// The fingerprint of a stub: the SHA-256 of a label that says it is one.
pub fn fp(name: &str) -> Hash {
    sha256(format!("agreements-new/stub cMIP (for tests only): {name}").as_bytes())
}

/// The stubs' fingerprints.
pub mod name {
    pub const BODY: &str = "K1 body: parts and a delegation, from its parameters";
    pub const IN_FORCE: &str = "K2 in force: the names its parameters list, or a count of names";
    pub const POWER: &str = "K3 power: yes for the signers its parameters list";
    pub const CONDITION: &str = "K4 update condition: k of the original's signers, never, or always";
    pub const SPOT: &str = "K5 spot: the fillings its parameters list";
    pub const CONTROL: &str = "K6 control: always yes";
    pub const KIND: &str = "K7 kind: a meaning from its parameters";
    pub const DATA: &str = "K8 data: yes for the readers its parameters list";
}

/// Every stub, held under its fingerprint.
pub fn all() -> Cmips {
    let mut c = Cmips::new();
    c.hold(fp(name::BODY), Box::new(StubBody));
    c.hold(fp(name::IN_FORCE), Box::new(StubInForce));
    c.hold(fp(name::POWER), Box::new(StubPower));
    c.hold(fp(name::CONDITION), Box::new(StubCondition));
    c.hold(fp(name::SPOT), Box::new(StubSpot));
    c.hold(fp(name::CONTROL), Box::new(StubControl));
    c.hold(fp(name::KIND), Box::new(StubKind));
    c.hold(fp(name::DATA), Box::new(StubData));
    c
}

fn uints(v: &Value) -> Vec<u64> {
    match v {
        Value::Array(a) => a.iter().filter_map(|x| if let Value::Uint(n) = x { Some(*n) } else { None }).collect(),
        _ => vec![],
    }
}

fn hashes(v: &Value) -> Vec<Hash> {
    match v {
        Value::Array(a) => a.iter().filter_map(|x| if let Value::Bytes(b) = x { b.as_slice().try_into().ok() } else { None }).collect(),
        _ => vec![],
    }
}

fn whos(v: &Value) -> Vec<Who> {
    match v {
        Value::Array(a) => a.iter().filter_map(|x| Who::from_value(x, "who").ok()).collect(),
        _ => vec![],
    }
}

fn get(m: &Value, k: u64) -> Option<&Value> {
    match m {
        Value::Map(e) => e.iter().find(|(kk, _)| *kk == Value::Uint(k)).map(|(_, v)| v),
        _ => None,
    }
}

/// K1 stub. Parameters: `{0: [positions given a part], 1: [delegator,
/// agent, ending]}`, ending 0 by the delegator, 1 by the agent alone, 2 a
/// stated condition it cannot apply. **Stub, for tests only.**
pub struct StubBody;
impl Cmip for StubBody {
    fn name(&self) -> &str {
        "stub K1"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::Body { .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        let parts = get(params, 0).map(uints).unwrap_or_default();
        let delegation = get(params, 1).map(uints).and_then(|d| {
            (d.len() == 3).then(|| Delegation {
                delegator: d[0],
                agent: d[1],
                ending: match d[2] {
                    0 => Ending::ByDelegator,
                    1 => Ending::ByAgentAlone,
                    _ => Ending::Stated("a notice of thirty days (stub)".into()),
                },
            })
        });
        Out::Body(BodyReading { parts, delegation })
    }
}

/// K2 stub. Parameters: a number n (in force when assents in n different
/// names are counted), or a list of names (`[0, id]` / `[2, root]`), all of
/// which must be counted. **Stub, for tests only.**
pub struct StubInForce;
impl Cmip for StubInForce {
    fn name(&self) -> &str {
        "stub K2"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::InForce { counted, .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        let mut names: Vec<Who> = counted.iter().map(|c| c.name).collect();
        names.sort_by_key(|w| format!("{w:?}"));
        names.dedup();
        match params {
            Value::Uint(n) => Out::YesNo { yes: names.len() as u64 >= *n, ground: format!("{} of {n} names counted (stub)", names.len()) },
            _ => {
                let need = whos(params);
                let yes = need.iter().all(|w| names.contains(w));
                Out::YesNo { yes, ground: "every name its parameters list (stub)".into() }
            }
        }
    }
}

/// K3 stub. Parameters: the signers (identity hashes) who may. **Stub, for
/// tests only.**
pub struct StubPower;
impl Cmip for StubPower {
    fn name(&self) -> &str {
        "stub K3"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::Power { signer, .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        Out::YesNo { yes: hashes(params).contains(signer), ground: "the signer is one its parameters list (stub)".into() }
    }
}

/// K4 stub. Parameters: `[0, k]`: valid when at least k of everyone who
/// signed the original have assented to the update; `[1]`: never valid;
/// `[2]`: always valid. Asked about a filling's rights, valid only for `[2]`.
/// **Stub, for tests only.**
pub struct StubCondition;
impl Cmip for StubCondition {
    fn name(&self) -> &str {
        "stub K4"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let p = uints(params);
        match (ask, p.as_slice()) {
            (Ask::Update { counted, signed_original, .. }, [0, k]) => {
                let n = signed_original.iter().filter(|w| counted.iter().any(|c| c.name == **w)).count() as u64;
                Out::Update { valid: n >= *k, ground: format!("{n} of the original's signers assented; {k} needed (stub)") }
            }
            (Ask::Update { .. }, [1]) => Out::Update { valid: false, ground: "this condition answers not valid to every update (stub)".into() },
            (Ask::Update { .. }, [2]) => Out::Update { valid: true, ground: "this condition answers valid to every update (stub)".into() },
            (Ask::FillingRights { .. }, [2]) => Out::Update { valid: true, ground: "valid for a filling's rights (stub)".into() },
            (Ask::FillingRights { .. }, _) => Out::Update { valid: false, ground: "not valid for a filling's rights (stub)".into() },
            _ => Out::CannotAnswer("parameters not understood".into()),
        }
    }
}

/// K5 stub. Parameters: `[fillings, many, takes_new]`, each filling
/// `[signer, [proof acts], version, confirmed_by?]`. **Stub, for tests
/// only.**
pub struct StubSpot;
impl Cmip for StubSpot {
    fn name(&self) -> &str {
        "stub K5"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::Spot { .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        let Value::Array(p) = params else { return Out::Spot(SpotReading { takes_new: true, why: "no fillings listed (stub)".into(), ..Default::default() }) };
        let fillings = match p.first() {
            Some(Value::Array(fs)) => fs
                .iter()
                .filter_map(|f| {
                    let Value::Array(f) = f else { return None };
                    let signer: Hash = if let Some(Value::Bytes(b)) = f.first() { b.as_slice().try_into().ok()? } else { return None };
                    let proof = f.get(1).map(hashes).unwrap_or_default();
                    let version: Hash = if let Some(Value::Bytes(b)) = f.get(2) { b.as_slice().try_into().ok()? } else { return None };
                    let confirmed_by = f.get(3).and_then(|w| Who::from_value(w, "who").ok());
                    Some(Filling { signer, proof, version, confirmed_by })
                })
                .collect(),
            _ => vec![],
        };
        let many = matches!(p.get(1), Some(Value::Bool(true)));
        let takes_new = !matches!(p.get(2), Some(Value::Bool(false)));
        Out::Spot(SpotReading { fillings, many, takes_new, why: if takes_new { "open, as its parameters say (stub)".into() } else { "closed, as its parameters say (stub)".into() } })
    }
}

/// K6 stub: always yes. **Stub, for tests only.**
pub struct StubControl;
impl Cmip for StubControl {
    fn name(&self) -> &str {
        "stub K6"
    }
    fn ask(&self, _: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::Control { .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        Out::YesNo { yes: true, ground: "passed on as the Terms say (stub)".into() }
    }
}

/// K7 stub: the meaning is its parameters' text. **Stub, for tests only.**
pub struct StubKind;
impl Cmip for StubKind {
    fn name(&self) -> &str {
        "stub K7"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::Kind { .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        Out::Kind { meaning: if let Value::Text(t) = params { t.clone() } else { "a kind (stub)".into() } }
    }
}

/// K8 stub. Parameters: the readers (`[0, id]` / `[2, root]`) who may read
/// beyond the leg. **Stub, for tests only.**
pub struct StubData;
impl Cmip for StubData {
    fn name(&self) -> &str {
        "stub K8"
    }
    fn ask(&self, params: &Value, ask: &Ask, _: &Held) -> Out {
        let Ask::Data { reader, .. } = ask else { return Out::CannotAnswer("asked another task".into()) };
        Out::YesNo { yes: whos(params).contains(reader), ground: "the reader is one its parameters list (stub)".into() }
    }
}
