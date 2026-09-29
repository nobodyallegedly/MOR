//! A relay, and a home: what happens to each request, independent of HTTP.
//!
//! One program plays both roles, since a home is a relay with a few more
//! requests (cMIP, "Homes"). A basic relay stores and serves acts, sealed
//! containers and media, checking what it can on arrival. A home also holds
//! identity chains, signs receipts and log summaries, and objects to
//! homeless rotations of identities it serves, all as everyday acts of its
//! operator.

use crate::operator::{self, Keys, Operator};
use crate::store::{kind, DbError, Filter, NewItem, Store};
use crate::wire::{
    self, code, part, role, IdentityRecord, Info, Limits, PutResult, PutSealed, Sealed, WireError,
};
use mor_core::act::{Act, Inside, Object};
use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::{
    check_everyday_shape, check_genesis, check_rotation_shape, types, ChainState, Home, LogSummary,
    Objection, Payload, Receipt, Rotation,
};
use mor_core::merkle;
use mor_core::sig::{self, Verdict};
use std::collections::BTreeSet;
use std::fmt;
use std::path::{Path, PathBuf};

// ---------------------------------------------------------------- specs

/// The spec hashes this relay reads. The real ones are fixed at the freeze
/// (roadmap step 16); until then every test relay and client uses the test
/// values, the same ones as the core library's tests.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Specs {
    /// `IDENTITY`: receipts, routes, log summaries, objections...
    pub identity: Hash,
    /// `ENVELOPE`: publications, encryption keys.
    pub envelope: Hash,
}

impl Specs {
    pub fn test() -> Self {
        Specs {
            identity: sha256(b"IDENTITY, test value until the freeze"),
            envelope: sha256(b"ENVELOPE, test value until the freeze"),
        }
    }
}

/// Envelope types a relay reads.
pub mod envelope_types {
    pub const PUBLICATION: u64 = 0;
    pub const ENCRYPTION_KEY: u64 = 4;
}

// ---------------------------------------------------------------- configuration

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Role {
    Relay,
    Home,
}

/// Whose acts this relay keeps (Envelope, relays rule 5: the relay's policy).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Policy {
    /// Anyone's.
    Open,
    /// Only the identities its operator lists, and evidence about them.
    Allowlist,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Config {
    pub role: Role,
    /// The base addresses under which this relay answers (a hint).
    pub bases: Vec<String>,
    pub policy: Policy,
    pub limits: Limits,
}

impl Config {
    fn encode(&self) -> Vec<u8> {
        let l = self.limits;
        cbor::encode(&Value::Map(vec![
            (
                Value::Uint(0),
                Value::Uint(matches!(self.role, Role::Home) as u64),
            ),
            (
                Value::Uint(1),
                Value::Array(self.bases.iter().cloned().map(Value::Text).collect()),
            ),
            (
                Value::Uint(2),
                Value::Uint(matches!(self.policy, Policy::Allowlist) as u64),
            ),
            (
                Value::Uint(3),
                Value::Array(
                    vec![l.act, l.media, l.feed, l.wait]
                        .into_iter()
                        .map(Value::Uint)
                        .collect(),
                ),
            ),
        ]))
    }

    fn decode(b: &[u8]) -> Option<Self> {
        let v = cbor::decode(b).ok()?;
        let n = |k| match v.map_get(k) {
            Some(Value::Uint(n)) => Some(*n),
            _ => None,
        };
        let bases = match v.map_get(1)? {
            Value::Array(a) => a
                .iter()
                .map(|x| match x {
                    Value::Text(t) => Some(t.clone()),
                    _ => None,
                })
                .collect::<Option<Vec<_>>>()?,
            _ => return None,
        };
        let l = match v.map_get(3)? {
            Value::Array(a) if a.len() == 4 => a
                .iter()
                .map(|x| match x {
                    Value::Uint(n) => Some(*n),
                    _ => None,
                })
                .collect::<Option<Vec<_>>>()?,
            _ => return None,
        };
        Some(Config {
            role: if n(0)? == 1 { Role::Home } else { Role::Relay },
            bases,
            policy: if n(2)? == 1 {
                Policy::Allowlist
            } else {
                Policy::Open
            },
            limits: Limits {
                act: l[0],
                media: l[1],
                feed: l[2],
                wait: l[3],
            },
        })
    }
}

// ---------------------------------------------------------------- failures

/// Why a request failed: an answer under the cMIP, or a fault of this relay.
#[derive(Debug)]
pub enum Fail {
    Wire(WireError),
    Internal(String),
}

impl fmt::Display for Fail {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Fail::Wire(e) => e.fmt(f),
            Fail::Internal(e) => write!(f, "internal error: {e}"),
        }
    }
}

impl std::error::Error for Fail {}

impl From<WireError> for Fail {
    fn from(e: WireError) -> Self {
        Fail::Wire(e)
    }
}

impl From<DbError> for Fail {
    fn from(e: DbError) -> Self {
        Fail::Internal(e.to_string())
    }
}

impl From<std::io::Error> for Fail {
    fn from(e: std::io::Error) -> Self {
        Fail::Internal(e.to_string())
    }
}

type R<T> = Result<T, Fail>;

fn wire<T>(code: u64, reason: impl Into<String>) -> R<T> {
    Err(Fail::Wire(WireError::new(code, reason)))
}

// ---------------------------------------------------------------- the node

/// What publishing an act led to.
#[derive(Clone, Debug)]
pub struct Put {
    pub result: PutResult,
    /// A homeless rotation to submit to the old homes it names, so their
    /// objections can travel (cMIP, "Proof of life travels", 2): the
    /// rotation's bytes and the old homes' addresses.
    pub forward: Option<(Vec<u8>, Vec<String>)>,
}

/// What a home decided about an identity-chain act, before storing it.
enum Plan {
    /// Hold it at this position of the identity's chain; receipt it if the
    /// home serves the identity.
    Hold {
        identity: Hash,
        position: u64,
        serve: bool,
    },
    /// A homeless rotation of an identity whose old home set names this
    /// home: never held as the identity's rotation; objected to, and kept as
    /// evidence (Identity rule 11a).
    Object { identity: Hash },
}

/// Who runs a home.
pub enum OperatorSetup {
    /// An identity made elsewhere, like anyone's: its key file (the everyday
    /// signing key and the act that bound it), and its identity-chain acts
    /// up to that act, oldest first.
    Existing { keys: Keys, chain: Vec<Vec<u8>> },
    /// The stopgap until the genesis client exists (roadmap step 5): a new
    /// test identity, self-hosted at this home, its safety key in software.
    NewTest,
}

/// That the key file belongs to the chain given: the chain starts at the
/// identity's genesis, and the act the key file names as its binding is in
/// it and set exactly this signing key.
fn check_operator(keys: &Keys, chain: &[Vec<u8>], specs: &Specs) -> R<()> {
    let bad = |why: &str| {
        Err(Fail::Internal(format!(
            "operator key file and chain: {why}"
        )))
    };
    let mut acts = vec![];
    for b in chain {
        let Ok(a) = Act::decode(b) else {
            return bad("an act in the chain does not decode");
        };
        let Ok(i) = a.open(None) else {
            return bad("an act in the chain does not open");
        };
        if i.spec != specs.identity {
            return bad("the chain holds an act that is not an Identity act");
        }
        let Ok(p) = Payload::decode(i.type_, &i.payload) else {
            return bad("an act in the chain does not decode as an Identity act");
        };
        acts.push((a, p));
    }
    if acts.first().map(|(a, _)| a.id()) != Some(keys.identity) {
        return bad("the chain does not start at the identity's genesis");
    }
    let Some((a, p)) = acts.iter().find(|(a, _)| a.id() == keys.binding) else {
        return bad("the chain does not hold the act that bound the signing key");
    };
    let set = match p {
        Payload::Genesis(g) => &g.signing_key,
        Payload::Rotation(r) if a.outside.signer == Some(keys.identity) => &r.signing_key,
        _ => return bad("the binding is not a genesis or rotation of the identity"),
    };
    if *set != keys.signing_key() {
        return bad("the signing key is not the one its binding set");
    }
    Ok(())
}

/// A relay or home, over its data directory.
pub struct Node {
    store: Store,
    cfg: Config,
    specs: Specs,
    op: Option<Operator>,
    keys: Option<Keys>,
    dir: PathBuf,
}

const DB: &str = "relay.db";
const KEYS: &str = "operator.key";
const MEDIA: &str = "media";

impl Node {
    /// Set up a new data directory. A home runs under `operator`; a basic
    /// relay has none. Returns the operator's identity hash, for a home.
    pub fn init(dir: &Path, cfg: Config, specs: Specs, operator: OperatorSetup) -> R<Option<Hash>> {
        if dir.join(DB).exists() {
            return Err(Fail::Internal(format!(
                "{} already holds a relay",
                dir.display()
            )));
        }
        if cfg.role == Role::Home {
            if let OperatorSetup::Existing { keys, chain } = &operator {
                check_operator(keys, chain, &specs)?;
            }
        }
        std::fs::create_dir_all(dir.join(MEDIA))?;
        let store = Store::open(&dir.join(DB))?;
        store.set_setting("config", &cfg.encode())?;
        drop(store);
        if cfg.role == Role::Relay {
            return Ok(None);
        }
        match operator {
            OperatorSetup::Existing { keys, chain } => {
                keys.save(&dir.join(KEYS))?;
                let mut node = Node::open(dir, specs)?;
                // The operator's chain, oldest first, taken like any chain
                // acts; this home also serves it, so readers checking its
                // receipts find the operator's chain where they found them.
                for a in &chain {
                    node.put_act(a).map_err(|e| {
                        Fail::Internal(format!("the operator's chain was refused: {e}"))
                    })?;
                }
                node.store.serve(&keys.identity)?;
                Ok(Some(keys.identity))
            }
            OperatorSetup::NewTest => {
                let (keys, genesis) = operator::create(&specs.identity, &cfg.bases[0]);
                keys.save(&dir.join(KEYS))?;
                let mut node = Node::open(dir, specs)?;
                let op = keys.identity;
                node.store.begin()?;
                let bytes = genesis.encode();
                let inside = genesis
                    .open(None)
                    .map_err(|e| Fail::Internal(e.to_string()))?;
                node.store_act(&bytes, &genesis, Some(&inside))?;
                node.store.chain_insert(&op, 0, &op)?;
                node.store.serve(&op)?;
                let routes = operator::routes_payload(&specs.identity, &cfg.bases);
                node.sign_and_store(specs.identity, types::ROUTES, routes, None)?;
                node.store.commit()?;
                Ok(Some(op))
            }
        }
    }

    /// Open an existing data directory.
    pub fn open(dir: &Path, specs: Specs) -> R<Self> {
        let store = Store::open(&dir.join(DB))?;
        let cfg = store
            .setting("config")?
            .and_then(|b| Config::decode(&b))
            .ok_or_else(|| Fail::Internal("no relay configuration: run init first".into()))?;
        let keys = match cfg.role {
            Role::Home => Some(Keys::load(&dir.join(KEYS))?),
            Role::Relay => None,
        };
        let op = keys.as_ref().map(|k| Operator::new(k, vec![]));
        let mut node = Node {
            store,
            cfg,
            specs,
            op,
            keys,
            dir: dir.to_path_buf(),
        };
        node.reload_operator()?;
        Ok(node)
    }

    fn reload_operator(&mut self) -> R<()> {
        if let Some(k) = &self.keys {
            self.op = Some(Operator::new(k, self.store.own()?));
        }
        Ok(())
    }

    pub fn config(&self) -> &Config {
        &self.cfg
    }

    pub fn specs(&self) -> Specs {
        self.specs
    }

    pub fn operator(&self) -> Option<Hash> {
        self.op.as_ref().map(|o| o.id)
    }

    fn is_home(&self) -> bool {
        self.cfg.role == Role::Home
    }

    pub fn info(&self) -> Info {
        let policy = match (self.cfg.role, self.cfg.policy) {
            (Role::Home, Policy::Open) => "Test home, open to anyone. Test acts only: everything here will be wiped before the first real acts.",
            (Role::Home, Policy::Allowlist) => "Test home for its operator's own identities only. Test acts only: everything here will be wiped before the first real acts.",
            (Role::Relay, Policy::Open) => "Test relay, open to anyone. Test acts only: everything here will be wiped before the first real acts.",
            (Role::Relay, Policy::Allowlist) => "Test relay for listed identities only. Test acts only: everything here will be wiped before the first real acts.",
        };
        Info {
            operator: self.operator(),
            bases: self.cfg.bases.clone(),
            roles: match self.cfg.role {
                Role::Relay => vec![role::RELAY, role::INBOX],
                Role::Home => vec![role::RELAY, role::HOME, role::INBOX],
            },
            limits: self.cfg.limits,
            policy: Some(policy.into()),
        }
    }

    // ------------------------------------------------------------ policy lists

    pub fn allow(&self, identity: &Hash) -> R<()> {
        Ok(self.store.allow(identity)?)
    }

    pub fn disallow(&self, identity: &Hash) -> R<()> {
        Ok(self.store.disallow(identity)?)
    }

    pub fn allow_list(&self) -> R<Vec<Hash>> {
        Ok(self.store.allow_list()?)
    }

    fn allowed(&self, identity: &Hash) -> R<bool> {
        Ok(self.operator().as_ref() == Some(identity) || self.store.allowed(identity)?)
    }

    // ------------------------------------------------------------ publishing an act

    /// `POST /acts`.
    pub fn put_act(&mut self, bytes: &[u8]) -> R<Put> {
        if bytes.len() as u64 > self.cfg.limits.act {
            return wire(
                code::TOO_LARGE,
                format!("acts up to {} bytes", self.cfg.limits.act),
            );
        }
        let act =
            Act::decode(bytes).map_err(|e| WireError::malformed(format!("not an act: {e}")))?;
        act.check_locked_hash()
            .map_err(|e| WireError::invalid(e.to_string()))?;
        let id = act.id();
        if let Some((arrival, k)) = self.store.arrival_of(&id)? {
            if k != kind::ACT {
                return wire(code::MALFORMED, "that id names an item that is not an act");
            }
            // Publishing is idempotent: the same answer again.
            return Ok(Put {
                result: self.result_for(id, arrival)?,
                forward: None,
            });
        }
        let verdict = sig::verify(&act.signature, &id);
        if verdict == Verdict::Invalid {
            return wire(
                code::INVALID,
                "the signature is not valid for the act id under the key it carries",
            );
        }
        let inside = if act.outside.is_public() {
            Some(
                act.open(None)
                    .map_err(|e| WireError::invalid(e.to_string()))?,
            )
        } else {
            None
        };
        let payload = match &inside {
            Some(i) if i.spec == self.specs.identity => Some(self.identity_payload(&act, i)?),
            _ => None,
        };
        // Identity rule 2: an act signed with a safety key must be a rotation.
        if sig::is_slh(&act.signature.scheme) && !matches!(payload, Some(Payload::Rotation(_))) {
            return wire(
                code::INVALID,
                "an act signed with a safety key must be a rotation",
            );
        }
        self.check_binding(&act)?;
        self.check_policy(&act, id, inside.as_ref(), payload.as_ref())?;
        let plan = match (&payload, self.is_home()) {
            (Some(Payload::Genesis(g)), true) => Some(Plan::Hold {
                identity: id,
                position: 0,
                serve: self.names_us(&g.homes),
            }),
            (Some(Payload::Rotation(r)), true) => Some(self.plan_rotation(&act, r, verdict)?),
            _ => None,
        };
        let forward = match &payload {
            Some(Payload::Rotation(r)) if r.homeless => {
                let hints = self.old_home_hints(&act.outside.signer.unwrap(), r)?;
                (!hints.is_empty()).then(|| (bytes.to_vec(), hints))
            }
            _ => None,
        };
        self.store.begin()?;
        match self.put_act_tx(bytes, &act, id, inside.as_ref(), plan) {
            Ok(result) => {
                self.store.commit()?;
                Ok(Put { result, forward })
            }
            Err(e) => {
                self.store.rollback();
                self.reload_operator()?;
                Err(e)
            }
        }
    }

    fn put_act_tx(
        &mut self,
        bytes: &[u8],
        act: &Act,
        id: Hash,
        inside: Option<&Inside>,
        plan: Option<Plan>,
    ) -> R<PutResult> {
        let arrival = self.store_act(bytes, act, inside)?;
        let mut result = PutResult {
            id,
            arrival,
            receipt: None,
            objection: None,
        };
        match plan {
            None => {}
            Some(Plan::Hold {
                identity,
                position,
                serve,
            }) => {
                self.store.chain_insert(&identity, position, &id)?;
                if serve {
                    self.store.serve(&identity)?;
                    if Some(identity) != self.operator() {
                        let r = self.sign_receipt(&identity, &id, position)?;
                        result.receipt = Some(self.item_bytes(&r)?);
                    }
                }
            }
            Some(Plan::Object { identity }) => {
                let o = Payload::Objection(Objection { identity });
                let objects = vec![Object {
                    chain: identity,
                    predecessor: id,
                }];
                let spec = self.specs.identity;
                let oid = self.sign_and_store(spec, types::OBJECTION, o.to_map(), Some(objects))?;
                self.store.objection_insert(&id, &oid)?;
                result.objection = Some(self.item_bytes(&oid)?);
            }
        }
        Ok(result)
    }

    /// The answer to publishing an act already held.
    fn result_for(&self, id: Hash, arrival: u64) -> R<PutResult> {
        let receipt = match self.store.receipt_for(&id)? {
            Some(r) => Some(self.item_bytes(&r)?),
            None => None,
        };
        let objection = match self.store.objection_for(&id)? {
            Some(o) => Some(self.item_bytes(&o)?),
            None => None,
        };
        Ok(PutResult {
            id,
            arrival,
            receipt,
            objection,
        })
    }

    fn item_bytes(&self, id: &Hash) -> R<Vec<u8>> {
        self.store
            .item(id, kind::ACT)?
            .ok_or_else(|| Fail::Internal("an act this relay signed is missing".into()))
    }

    /// An Identity act's payload, with the checks that need no other act.
    fn identity_payload(&self, act: &Act, inside: &Inside) -> R<Payload> {
        let p = Payload::decode(inside.type_, &inside.payload)
            .map_err(|e| WireError::invalid(e.to_string()))?;
        let checked = match &p {
            Payload::Genesis(g) => check_genesis(act, inside, g),
            Payload::Rotation(r) => check_rotation_shape(act, inside, r),
            _ => check_everyday_shape(act, inside),
        };
        checked.map_err(|e| WireError::invalid(e.to_string()))?;
        Ok(p)
    }

    fn names_us(&self, homes: &[Home]) -> bool {
        match self.operator() {
            Some(op) => homes.iter().any(|h| h.operator == Some(op)),
            None => false,
        }
    }

    /// Identity rules 9, 11 and 11a, and the cMIP's "Asking for a receipt".
    fn plan_rotation(&self, act: &Act, r: &Rotation, verdict: Verdict) -> R<Plan> {
        let identity = act.outside.signer.expect("checked by the rotation's shape");
        let states = self.chain_states(&identity)?;
        let p = r.position as usize;
        if states.len() < p {
            return wire(
                code::MISSING_PREDECESSOR,
                match states.len() {
                    0 => "this home holds no genesis for that identity: send the earlier identity-chain acts first, oldest first".to_string(),
                    n => format!("this home holds that identity's chain up to position {}: send the earlier identity-chain acts first, oldest first", n - 1),
                },
            );
        }
        let (pred, before) = &states[p - 1];
        if r.prev != *pred {
            return wire(
                code::INVALID,
                "the rotation names a predecessor other than the identity-chain act this home holds at the position before",
            );
        }
        if verdict == Verdict::Unknown {
            return wire(
                code::NOT_SUPPORTED,
                "the rotation is signed under a scheme this home does not implement",
            );
        }
        let s = &act.signature;
        if s.scheme != before.safety.scheme
            || sig::safety_commitment(&s.scheme, &s.key) != before.safety.commit
        {
            return wire(
                code::INVALID,
                "the revealed safety key does not match the commitment of the act before",
            );
        }
        let after = before
            .apply(r)
            .map_err(|e| WireError::invalid(e.to_string()))?;
        let old_names_us = self.names_us(&before.homes);
        if r.homeless && old_names_us {
            return Ok(Plan::Object { identity });
        }
        if let Some((held, _)) = states.get(p) {
            // First held wins at this home (rule 11); the error carries the
            // rotation held and its receipt, so the owner learns at once.
            let mut e = WireError::new(
                code::CONFLICT,
                "this home already holds another rotation at that position",
            );
            e.acts.push(self.item_bytes(held)?);
            if let Some(rc) = self.store.receipt_for(held)? {
                e.acts.push(self.item_bytes(&rc)?);
            }
            return Err(Fail::Wire(e));
        }
        let serve = self.store.is_served(&identity)? || old_names_us || self.names_us(&after.homes);
        Ok(Plan::Hold {
            identity,
            position: r.position,
            serve,
        })
    }

    /// The state each identity-chain act this home holds leaves, by position.
    fn chain_states(&self, identity: &Hash) -> R<Vec<(Hash, ChainState)>> {
        let mut out: Vec<(Hash, ChainState)> = vec![];
        for (pos, act_id, _) in self.store.chain(identity)? {
            let payload = self.held_identity_payload(&act_id)?;
            let state = match (pos, payload, out.last()) {
                (0, Payload::Genesis(g), None) => ChainState::genesis(act_id, &g),
                (_, Payload::Rotation(r), Some((_, before))) => before
                    .apply(&r)
                    .map_err(|e| Fail::Internal(e.to_string()))?,
                _ => {
                    return Err(Fail::Internal(
                        "a held identity chain is out of order".into(),
                    ))
                }
            };
            out.push((act_id, state));
        }
        Ok(out)
    }

    /// The Identity payload of a held public act, and its outside signer.
    fn held_identity_payload(&self, id: &Hash) -> R<Payload> {
        self.held_opened(id)?
            .and_then(|(_, inside)| {
                (inside.spec == self.specs.identity)
                    .then(|| Payload::decode(inside.type_, &inside.payload).ok())
                    .flatten()
            })
            .ok_or_else(|| Fail::Internal("a held identity-chain act does not decode".into()))
    }

    /// A held act, opened if it is public.
    fn held_opened(&self, id: &Hash) -> R<Option<(Act, Inside)>> {
        let Some(bytes) = self.store.item(id, kind::ACT)? else {
            return Ok(None);
        };
        let Ok(act) = Act::decode(&bytes) else {
            return Ok(None);
        };
        let Ok(inside) = act.open(None) else {
            return Ok(None);
        };
        Ok(Some((act, inside)))
    }

    /// The old homes' addresses for a homeless rotation, where this relay
    /// holds enough of the chain to know them; this relay's own excepted.
    fn old_home_hints(&self, identity: &Hash, r: &Rotation) -> R<Vec<String>> {
        let before = if self.is_home() && !self.store.chain(identity)?.is_empty() {
            let states = self.chain_states(identity)?;
            states.get(r.position as usize - 1).map(|(_, s)| s.clone())
        } else {
            self.state_from_items(r)?
        };
        let Some(before) = before else {
            return Ok(vec![]);
        };
        Ok(before
            .homes
            .iter()
            .filter(|h| h.operator.is_some() && h.operator != self.operator())
            .map(|h| h.hint.clone())
            .filter(|hint| !self.cfg.bases.contains(hint))
            .collect())
    }

    /// The chain state before a rotation, rebuilt from the acts this relay
    /// holds by following each rotation's predecessor back to genesis.
    fn state_from_items(&self, r: &Rotation) -> R<Option<ChainState>> {
        let mut path: Vec<(Hash, Payload)> = vec![];
        let mut cur = r.prev;
        for _ in 0..=r.position {
            let Some((_, inside)) = self.held_opened(&cur)? else {
                return Ok(None);
            };
            if inside.spec != self.specs.identity {
                return Ok(None);
            }
            match Payload::decode(inside.type_, &inside.payload) {
                Ok(Payload::Genesis(g)) => {
                    path.push((cur, Payload::Genesis(g)));
                    break;
                }
                Ok(Payload::Rotation(r2)) => {
                    let prev = r2.prev;
                    path.push((cur, Payload::Rotation(r2)));
                    cur = prev;
                }
                _ => return Ok(None),
            }
        }
        let mut state: Option<ChainState> = None;
        for (id, p) in path.into_iter().rev() {
            state = match (state, p) {
                (None, Payload::Genesis(g)) => Some(ChainState::genesis(id, &g)),
                (Some(s), Payload::Rotation(r2)) => match s.apply(&r2) {
                    Ok(s) => Some(s),
                    Err(_) => return Ok(None),
                },
                _ => return Ok(None),
            };
        }
        Ok(state)
    }

    /// The binding check (cMIP, "Publishing an act", 1): a home MUST check it
    /// for the identities it serves; any relay checks it where it holds the
    /// act the binding names.
    fn check_binding(&self, act: &Act) -> R<()> {
        let (Some(signer), Some(binding)) = (act.outside.signer, act.outside.binding) else {
            return Ok(());
        };
        if self.is_home() && self.store.is_served(&signer)? {
            let states = self.chain_states(&signer)?;
            let Some((_, s)) = states.iter().find(|(h, _)| *h == binding) else {
                return wire(
                    code::MISSING_PREDECESSOR,
                    "the binding names no identity-chain act this home holds for the signer: send the chain acts first",
                );
            };
            if !s.signing_key.made(&act.signature) {
                return wire(
                    code::INVALID,
                    "the signature's key is not the signing key its binding set",
                );
            }
            return Ok(());
        }
        let Some((bact, inside)) = self.held_opened(&binding)? else {
            return Ok(());
        };
        let key = match (inside.spec == self.specs.identity)
            .then(|| Payload::decode(inside.type_, &inside.payload).ok())
            .flatten()
        {
            Some(Payload::Genesis(g)) if binding == signer => g.signing_key,
            Some(Payload::Rotation(r)) if bact.outside.signer == Some(signer) => r.signing_key,
            _ => {
                return wire(
                    code::INVALID,
                    "the binding does not name an identity-chain act of the signer",
                )
            }
        };
        if !key.made(&act.signature) {
            return wire(
                code::INVALID,
                "the signature's key is not the signing key its binding set",
            );
        }
        Ok(())
    }

    /// The relay's own policy (Envelope, relays rule 5; Identity rule 12).
    fn check_policy(
        &self,
        act: &Act,
        id: Hash,
        inside: Option<&Inside>,
        payload: Option<&Payload>,
    ) -> R<()> {
        if self.cfg.policy == Policy::Open {
            return Ok(());
        }
        match payload {
            Some(Payload::Genesis(_)) => {
                if self.allowed(&id)? {
                    return Ok(());
                }
                return wire(
                    code::REFUSED,
                    "this home serves only the identities its operator lists",
                );
            }
            Some(Payload::Rotation(_)) => {
                if self.allowed(&act.outside.signer.unwrap())? {
                    return Ok(());
                }
                return wire(
                    code::REFUSED,
                    "this home serves only the identities its operator lists",
                );
            }
            _ => {}
        }
        if let Some(s) = &act.outside.signer {
            if self.allowed(s)? {
                return Ok(());
            }
        }
        // Evidence about a listed identity, whoever signed it: other homes'
        // receipts, objections, absence statements, cosignatures, links.
        if let (Some(i), Some(p)) = (inside, payload) {
            let evidence = matches!(
                p.type_(),
                types::RECEIPT
                    | types::LINK_CONFIRMATION
                    | types::LINK_TERMINATION
                    | types::COSIGNATURE
                    | types::OBJECTION
                    | types::ABSENCE
                    | types::ESCAPE_ENDORSEMENT
            );
            if evidence {
                for t in self.about(i) {
                    if self.allowed(&t)? {
                        return Ok(());
                    }
                }
            }
        }
        wire(
            code::NOT_ACCEPTED,
            "this relay keeps acts of the identities its operator lists only",
        )
    }

    /// What a public act concerns, for the identity record: its `objects`,
    /// and the fields of Identity and Envelope payloads that name an
    /// identity, an act or media.
    fn about(&self, inside: &Inside) -> Vec<Hash> {
        let mut out = vec![];
        for o in inside.objects.iter().flatten() {
            out.push(o.chain);
            out.push(o.predecessor);
        }
        let field = |k: u64| {
            inside
                .payload
                .iter()
                .find(|(key, _)| *key == Value::Uint(k))
                .map(|(_, v)| v)
        };
        let as_hash = |v: Option<&Value>| match v {
            Some(Value::Bytes(b)) if b.len() == 32 => Some(<Hash>::try_from(b.as_slice()).unwrap()),
            _ => None,
        };
        if inside.spec == self.specs.identity {
            match inside.type_ {
                types::RECEIPT => {
                    out.extend(as_hash(field(0)).into_iter().chain(as_hash(field(1))))
                }
                types::OBJECTION | types::ABSENCE => out.extend(as_hash(field(0))),
                types::LINK_CLAIM => {
                    if let Some(Value::Array(a)) = field(0) {
                        if a.len() == 2 && a[0] == Value::Text("mor".into()) {
                            out.extend(as_hash(a.get(1)));
                        }
                    }
                }
                _ => {}
            }
        }
        if inside.spec == self.specs.envelope && inside.type_ == envelope_types::PUBLICATION {
            out.extend(as_hash(field(2)));
        }
        out.sort();
        out.dedup();
        out
    }

    /// Store an act, indexed by what this relay can read.
    fn store_act(&self, bytes: &[u8], act: &Act, inside: Option<&Inside>) -> R<u64> {
        let o = &act.outside;
        Ok(self.store.insert_item(&NewItem {
            kind: kind::ACT,
            id: act.id(),
            bytes: Some(bytes.to_vec()),
            size: bytes.len() as u64,
            signer: o.signer,
            spec: inside.map(|i| i.spec),
            type_: inside.map(|i| i.type_),
            unaddressed: false,
            to: o.to.clone().unwrap_or_default(),
            pickup: vec![],
            about: inside.map(|i| self.about(i)).unwrap_or_default(),
        })?)
    }

    /// Sign the operator's next everyday act and store it.
    fn sign_and_store(
        &mut self,
        spec: Hash,
        type_: u64,
        payload: Vec<(Value, Value)>,
        objects: Option<Vec<Object>>,
    ) -> R<Hash> {
        let op = self
            .op
            .as_ref()
            .ok_or_else(|| Fail::Internal("a relay without an operator signs nothing".into()))?;
        let act = op.sign(&spec, type_, payload, objects);
        let position = op.next_position();
        let inside = act.open(None).map_err(|e| Fail::Internal(e.to_string()))?;
        let id = act.id();
        self.store_act(&act.encode(), &act, Some(&inside))?;
        self.store.own_push(position, &id)?;
        self.op.as_mut().unwrap().push(id);
        Ok(id)
    }

    /// Sign a receipt (Identity rule 10a) at the next log position, and a
    /// log summary over the whole log with it.
    fn sign_receipt(&mut self, identity: &Hash, act: &Hash, position: u64) -> R<Hash> {
        let log_position = self.store.log_len()?;
        let spec = self.specs.identity;
        let r = Payload::Receipt(Receipt {
            identity: *identity,
            act: *act,
            position,
            log_position,
        });
        let rid = self.sign_and_store(spec, types::RECEIPT, r.to_map(), None)?;
        self.store.log_push(log_position, &rid)?;
        self.store.chain_set_receipt(identity, position, &rid)?;
        let log = self.store.log()?;
        let s = Payload::LogSummary(LogSummary {
            size: log.len() as u64,
            root: merkle::root(&log),
            prev: self.store.summary(None)?,
        });
        let sid = self.sign_and_store(spec, types::LOG_SUMMARY, s.to_map(), None)?;
        self.store.summary_insert(log.len() as u64, &sid)?;
        Ok(rid)
    }

    // ------------------------------------------------------------ sealed containers and media

    /// `POST /sealed`.
    pub fn put_sealed(&mut self, body: &[u8]) -> R<PutResult> {
        if body.len() as u64 > self.cfg.limits.act + 1024 {
            return wire(
                code::TOO_LARGE,
                format!("sealed containers up to {} bytes", self.cfg.limits.act),
            );
        }
        let ps = PutSealed::decode(body).map_err(WireError::from)?;
        if ps.sealed.len() as u64 > self.cfg.limits.act {
            return wire(
                code::TOO_LARGE,
                format!("sealed containers up to {} bytes", self.cfg.limits.act),
            );
        }
        let s = Sealed::decode(&ps.sealed)
            .map_err(|m| WireError::malformed(format!("not a sealed container: {}", m.0)))?;
        let id = wire::sealed_id(&ps.sealed);
        if let Some((arrival, _)) = self.store.arrival_of(&id)? {
            return Ok(PutResult {
                id,
                arrival,
                receipt: None,
                objection: None,
            });
        }
        if self.cfg.policy == Policy::Allowlist {
            let mut ok = false;
            for t in &s.to {
                ok |= self.allowed(t)?;
            }
            if !ok {
                return wire(
                    code::NOT_ACCEPTED,
                    "this relay keeps deliveries to the identities its operator lists only",
                );
            }
        }
        let arrival = self.store.insert_item(&NewItem {
            kind: kind::SEALED,
            id,
            bytes: Some(ps.sealed.clone()),
            size: ps.sealed.len() as u64,
            unaddressed: s.to.is_empty(),
            to: s.to,
            pickup: ps.pickup,
            ..Default::default()
        })?;
        Ok(PutResult {
            id,
            arrival,
            receipt: None,
            objection: None,
        })
    }

    /// `POST /media`: returns the locked hash, the size, and the arrival number.
    pub fn put_media(&mut self, bytes: &[u8]) -> R<(Hash, u64, u64)> {
        if bytes.len() as u64 > self.cfg.limits.media {
            return wire(
                code::TOO_LARGE,
                format!("media up to {} bytes", self.cfg.limits.media),
            );
        }
        let h = sha256(bytes);
        if let Some((arrival, _)) = self.store.arrival_of(&h)? {
            return Ok((h, bytes.len() as u64, arrival));
        }
        if self.cfg.policy == Policy::Allowlist
            && !self
                .store
                .any_about(&h, &self.specs.envelope, envelope_types::PUBLICATION)?
        {
            return wire(
                code::NOT_ACCEPTED,
                "this relay keeps media only for publications it holds",
            );
        }
        let path = self.media_file(&h);
        let tmp = path.with_extension("part");
        std::fs::write(&tmp, bytes)?;
        std::fs::rename(&tmp, &path)?;
        let arrival = self.store.insert_item(&NewItem {
            kind: kind::MEDIA,
            id: h,
            size: bytes.len() as u64,
            ..Default::default()
        })?;
        Ok((h, bytes.len() as u64, arrival))
    }

    fn media_file(&self, h: &Hash) -> PathBuf {
        self.dir.join(MEDIA).join(wire::hex(h))
    }

    // ------------------------------------------------------------ fetching

    pub fn get_act(&self, id: &Hash) -> R<Vec<u8>> {
        self.store
            .item(id, kind::ACT)?
            .ok_or_else(|| Fail::Wire(WireError::not_held()))
    }

    pub fn get_sealed(&self, id: &Hash) -> R<Vec<u8>> {
        self.store
            .item(id, kind::SEALED)?
            .ok_or_else(|| Fail::Wire(WireError::not_held()))
    }

    /// Where a media object's bytes are, and its size.
    pub fn media(&self, h: &Hash) -> R<(PathBuf, u64)> {
        match self.store.media_size(h)? {
            Some(n) => Ok((self.media_file(h), n)),
            None => Err(Fail::Wire(WireError::not_held())),
        }
    }

    /// `POST /acts/get`.
    pub fn get_acts(&self, ids: &[Hash]) -> R<Vec<Option<Vec<u8>>>> {
        if ids.len() as u64 > self.cfg.limits.feed {
            return wire(
                code::TOO_LARGE,
                format!("at most {} ids", self.cfg.limits.feed),
            );
        }
        ids.iter()
            .map(|id| Ok(self.store.item(id, kind::ACT)?))
            .collect()
    }

    /// `GET /feed`, one page, without waiting.
    pub fn feed(&self, f: &Filter, after: u64, limit: Option<u64>) -> R<wire::FeedPage> {
        let limit = limit
            .unwrap_or(self.cfg.limits.feed)
            .min(self.cfg.limits.feed)
            .max(1);
        let (rows, next) = self.store.feed(f, after, limit)?;
        Ok(wire::FeedPage {
            items: rows
                .into_iter()
                .map(|(arrival, k, item)| wire::FeedItem {
                    arrival,
                    kind: k as u64,
                    item,
                })
                .collect(),
            next,
        })
    }

    pub fn max_arrival(&self) -> R<u64> {
        Ok(self.store.max_arrival()?)
    }

    // ------------------------------------------------------------ homes: the identity record

    fn home_only(&self) -> R<()> {
        if !self.is_home() {
            return wire(code::NOT_SUPPORTED, "this relay is not a home");
        }
        Ok(())
    }

    fn signer_of(bytes: &[u8]) -> Option<Hash> {
        Act::decode(bytes).ok().and_then(|a| a.outside.signer)
    }

    /// `GET /identity/{id}`.
    pub fn identity_record(&self, identity: &Hash, parts: &[u64]) -> R<IdentityRecord> {
        self.home_only()?;
        if !self.store.is_served(identity)? {
            return wire(code::NOT_SERVED, "this home does not serve that identity");
        }
        let want = |p: u64| parts.contains(&p);
        let ids = self.specs.identity;
        let bytes_of = |v: Vec<(Hash, Vec<u8>)>| v.into_iter().map(|(_, b)| b).collect::<Vec<_>>();
        let mut rec = IdentityRecord {
            identity: *identity,
            ..Default::default()
        };
        let chain = self.store.chain(identity)?;
        let chain_ids: BTreeSet<Hash> = chain.iter().map(|(_, a, _)| *a).collect();
        if want(part::CHAIN) {
            for (_, a, _) in &chain {
                rec.chain.push(self.item_bytes(a)?);
            }
        }
        if want(part::RECEIPTS) {
            for (_, _, r) in &chain {
                if let Some(r) = r {
                    rec.receipts.push(self.item_bytes(r)?);
                }
            }
        }
        if want(part::ROUTES) {
            rec.routes = bytes_of(self.store.acts_by(identity, &ids, &[types::ROUTES])?);
        }
        if want(part::ENCRYPTION_KEY) {
            rec.encryption_keys = bytes_of(self.store.acts_by(
                identity,
                &self.specs.envelope,
                &[envelope_types::ENCRYPTION_KEY],
            )?);
        }
        if want(part::NAMES) {
            rec.names = bytes_of(self.store.acts_by(
                identity,
                &ids,
                &[types::NAME, types::NAME_WITHDRAWAL],
            )?);
        }
        let link_types = [
            types::LINK_CLAIM,
            types::LINK_CONFIRMATION,
            types::LINK_TERMINATION,
        ];
        if want(part::LINKS) {
            let mut seen = BTreeSet::new();
            let mut add = |v: Vec<(Hash, Vec<u8>)>, rec: &mut IdentityRecord| {
                for (h, b) in v {
                    if seen.insert(h) {
                        rec.links.push(b);
                    }
                }
            };
            let own = self.store.acts_by(identity, &ids, &link_types)?;
            let claims: Vec<Hash> = own.iter().map(|(h, _)| *h).collect();
            add(own, &mut rec);
            add(
                self.store.acts_about(identity, &ids, &link_types)?,
                &mut rec,
            );
            for c in claims {
                add(
                    self.store.acts_about(
                        &c,
                        &ids,
                        &[types::LINK_CONFIRMATION, types::LINK_TERMINATION],
                    )?,
                    &mut rec,
                );
            }
        }
        if want(part::EVIDENCE) {
            let mut ev = bytes_of(self.store.acts_about(
                identity,
                &ids,
                &[types::OBJECTION, types::ABSENCE],
            )?);
            // Homeless rotations this home refused to hold, kept as evidence.
            for (h, b) in self.store.acts_by(identity, &ids, &[types::ROTATION])? {
                if !chain_ids.contains(&h) {
                    ev.push(b);
                }
            }
            ev.extend(bytes_of(self.store.acts_by(
                identity,
                &ids,
                &[types::ESCAPE_ENDORSEMENT],
            )?));
            // Cosignatures of this home's log summaries by the identity's
            // declared auditors, which receipt check 4 needs.
            let auditors: BTreeSet<Hash> = self
                .chain_states(identity)?
                .into_iter()
                .filter_map(|(_, s)| s.audit)
                .flat_map(|a| a.auditors)
                .collect();
            if !auditors.is_empty() {
                let ours: BTreeSet<Hash> = self.store.summaries()?.into_iter().collect();
                for a in &auditors {
                    for (h, b) in self.store.acts_by(a, &ids, &[types::COSIGNATURE])? {
                        let names_ours = self
                            .held_opened(&h)?
                            .map(|(_, i)| {
                                i.objects
                                    .iter()
                                    .flatten()
                                    .any(|o| ours.contains(&o.predecessor))
                            })
                            .unwrap_or(false);
                        if names_ours {
                            ev.push(b);
                        }
                    }
                }
            }
            rec.evidence = ev;
        }
        if want(part::OTHER_RECEIPTS) {
            let op = self.operator();
            rec.other_receipts = self
                .store
                .acts_about(identity, &ids, &[types::RECEIPT])?
                .into_iter()
                .map(|(_, b)| b)
                .filter(|b| {
                    let s = Self::signer_of(b);
                    s.is_some() && s != op
                })
                .collect();
        }
        Ok(rec)
    }

    // ------------------------------------------------------------ homes: the log

    /// `GET /log/summary`: the summary, and every cosignature of it held.
    pub fn log_summary(&self, size: Option<u64>) -> R<(Vec<u8>, Vec<Vec<u8>>)> {
        self.home_only()?;
        let s = self
            .store
            .summary(size)?
            .ok_or_else(|| Fail::Wire(WireError::not_held()))?;
        let cos = self
            .store
            .acts_about(&s, &self.specs.identity, &[types::COSIGNATURE])?
            .into_iter()
            .map(|(_, b)| b)
            .collect();
        Ok((self.item_bytes(&s)?, cos))
    }

    /// `GET /log/receipt?position=n`.
    pub fn log_receipt(&self, position: u64) -> R<Vec<u8>> {
        self.home_only()?;
        let r = self
            .store
            .log_at(position)?
            .ok_or_else(|| Fail::Wire(WireError::not_held()))?;
        self.item_bytes(&r)
    }

    /// `GET /log/inclusion?position=n&size=m`.
    pub fn log_inclusion(&self, position: u64, size: u64) -> R<Vec<Hash>> {
        self.home_only()?;
        let log = self.store.log()?;
        if position >= size {
            return wire(code::MALFORMED, "the position must lie inside the tree");
        }
        if size > log.len() as u64 {
            return Err(Fail::Wire(WireError::not_held()));
        }
        Ok(merkle::inclusion_proof(
            &log[..size as usize],
            position as usize,
        ))
    }

    /// `GET /log/consistency?from=m&to=k`.
    pub fn log_consistency(&self, from: u64, to: u64) -> R<Vec<Hash>> {
        self.home_only()?;
        let log = self.store.log()?;
        if from == 0 || from > to {
            return wire(
                code::MALFORMED,
                "a consistency proof runs from a smaller, non-empty tree to a larger one",
            );
        }
        if to > log.len() as u64 {
            return Err(Fail::Wire(WireError::not_held()));
        }
        Ok(merkle::consistency_proof(
            &log[..to as usize],
            from as usize,
        ))
    }
}

/// Whether an act is a homeless rotation, and whose, by opening it.
pub fn homeless_rotation(bytes: &[u8], specs: &Specs) -> Option<(Hash, Rotation)> {
    let act = Act::decode(bytes).ok()?;
    let inside = act.open(None).ok()?;
    if inside.spec != specs.identity {
        return None;
    }
    match Payload::decode(inside.type_, &inside.payload).ok()? {
        Payload::Rotation(r) if r.homeless => Some((act.outside.signer?, r)),
        _ => None,
    }
}
