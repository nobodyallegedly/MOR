//! Real relays on local ports, test identities, and the core library's
//! verifier to judge what the relays hand back.

#![allow(dead_code)]

use mor_core::act::{self, Act, Addressing, Inside, Object};
use mor_core::cbor::Value;
use mor_core::chain::Verifier;
use mor_core::hash::{sha256, Hash, ZERO_HASH};
pub use mor_core::identity::Home;
use mor_core::identity::{Audit, Genesis, HomeRule, Payload, Rotation, ChainKeyCommit, SigningKey};
use mor_core::mmr::Mmr;
use mor_core::sig::{self, SchnorrKey, SlhKey};
use mor_relay::client::Client;
use mor_relay::http::{self, Net, Shared};
use mor_relay::node::OperatorSetup;
use mor_relay::operator::random;
use mor_relay::wire::Limits;
use mor_relay::{Config, Node, Policy, Role, Specs};
use std::path::PathBuf;
use tokio::sync::oneshot;
use tokio::task::JoinHandle;

pub fn specs() -> Specs {
    Specs::test()
}

// ---------------------------------------------------------------- running relays

pub struct Running {
    pub base: String,
    pub addr: std::net::SocketAddr,
    pub dir: PathBuf,
    pub client: Client,
    pub operator: Option<Hash>,
    shared: Option<std::sync::Arc<Shared>>,
    stop: Option<oneshot::Sender<()>>,
    task: Option<JoinHandle<()>>,
}

fn temp_dir() -> PathBuf {
    let d = std::env::temp_dir()
        .join("mor-relay-tests")
        .join(mor_relay::wire::hex(&random::<32>()));
    std::fs::create_dir_all(&d).unwrap();
    d
}

impl Running {
    /// A new relay or home on a free local port.
    pub async fn start(role: Role, policy: Policy) -> Self {
        Self::start_with(role, policy, Limits::default()).await
    }

    pub async fn start_with(role: Role, policy: Policy, limits: Limits) -> Self {
        Self::start_as(role, policy, limits, OperatorSetup::NewTest).await
    }

    /// A home under a given operator.
    pub async fn start_as(
        role: Role,
        policy: Policy,
        limits: Limits,
        operator: OperatorSetup,
    ) -> Self {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        let base = format!("http://{addr}");
        let dir = temp_dir();
        let cfg = Config {
            role,
            bases: vec![base.clone()],
            policy,
            limits,
        };
        let operator = Node::init(&dir, cfg, specs(), operator).unwrap();
        let mut r = Running {
            client: Client::new(&base),
            base,
            addr,
            dir,
            operator,
            shared: None,
            stop: None,
            task: None,
        };
        r.serve(listener);
        r
    }

    fn serve(&mut self, listener: tokio::net::TcpListener) {
        let node = Node::open(&self.dir, specs()).unwrap();
        let shared = Shared::new(node, Net::new(None, true));
        self.shared = Some(shared.clone());
        let (tx, rx) = oneshot::channel();
        self.stop = Some(tx);
        self.task = Some(tokio::spawn(async move {
            axum::serve(listener, http::router(shared))
                .with_graceful_shutdown(async {
                    let _ = rx.await;
                })
                .await
                .unwrap();
        }));
    }

    /// Switch the relay off: it stops answering altogether.
    pub async fn stop(&mut self) {
        if let Some(s) = self.stop.take() {
            let _ = s.send(());
        }
        if let Some(t) = self.task.take() {
            let _ = t.await;
        }
    }

    /// Switch it on again, on the same port, from the same data directory.
    pub async fn restart(&mut self) {
        self.stop().await;
        let listener = tokio::net::TcpListener::bind(self.addr).await.unwrap();
        self.serve(listener);
    }

    pub fn op(&self) -> Hash {
        self.operator.expect("a home has an operator")
    }

    /// This home's entry in a home list.
    pub fn home(&self) -> Home {
        Home {
            operator: Some(self.op()),
            hint: self.base.clone(),
        }
    }

    /// Act on the running relay's node, as its operator would.
    pub fn with_node<T>(&self, f: impl FnOnce(&mut Node) -> T) -> T {
        let shared = self.shared.as_ref().expect("the relay is running");
        f(&mut shared.node())
    }

    /// Open this relay's data directory directly (while it is stopped).
    pub fn node(&self) -> Node {
        Node::open(&self.dir, specs()).unwrap()
    }
}

// ---------------------------------------------------------------- test identities

/// One identity as its owner (or a thief holding its keys) sees it.
#[derive(Clone)]
pub struct Person {
    pub name: String,
    pub id: Hash,
    pub gen: u32,
    pub sign: SchnorrKey,
    pub chain_key: SlhKey,
    pub binding: Hash,
    pub position: u64,
    pub seq: Vec<Hash>,
}

pub fn schnorr(name: &str, gen: u32) -> SchnorrKey {
    SchnorrKey::from_secret(&sha256(format!("{name}/sign/{gen}").as_bytes())).unwrap()
}

pub fn slh(name: &str, gen: u32) -> SlhKey {
    let h = sha256(format!("{name}/safety/{gen}").as_bytes());
    let g = sha256(&h);
    SlhKey::from_seeds(
        3,
        h[..16].try_into().unwrap(),
        h[16..].try_into().unwrap(),
        g[..16].try_into().unwrap(),
    )
}

fn signing_key(k: &SchnorrKey) -> SigningKey {
    SigningKey {
        scheme: sig::SCHNORR,
        key: k.public().to_vec(),
    }
}

fn commit(k: &SlhKey) -> ChainKeyCommit {
    ChainKeyCommit {
        scheme: k.scheme(),
        commit: k.commitment(),
    }
}

fn inside(spec: Hash, type_: u64, payload: Vec<(Value, Value)>) -> Inside {
    Inside {
        spec,
        type_,
        prev: None,
        objects: None,
        payload,
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: random::<16>(),
    }
}

fn seal(
    i: &Inside,
    signer: Option<Hash>,
    binding: Option<Hash>,
    public: bool,
    to: Option<Vec<Hash>>,
    key: &[u8; 32],
    sign: impl FnOnce(&Hash) -> act::Signature,
) -> Act {
    act::make(
        i,
        key,
        &random::<24>(),
        &Addressing {
            signer,
            binding,
            public,
            to,
        },
        sign,
    )
}

pub fn genesis(
    name: &str,
    homes: Vec<Home>,
    rule: Option<HomeRule>,
    audit: Option<Audit>,
) -> (Act, Person) {
    let sign = schnorr(name, 0);
    let chain_key = slh(name, 0);
    let g = Payload::Genesis(Genesis {
        signing_key: signing_key(&sign),
        chain_key: commit(&chain_key),
        homes,
        rule,
        declarations: None,
        audit,
    });
    let i = inside(specs().identity, 0, g.to_map());
    let a = seal(&i, None, None, true, None, &random::<32>(), |id| {
        sign.sign(id, &[0; 32])
    });
    let id = a.id();
    (
        a,
        Person {
            name: name.into(),
            id,
            gen: 0,
            sign,
            chain_key,
            binding: id,
            position: 0,
            seq: vec![],
        },
    )
}

/// What a rotation changes, besides the keys.
#[derive(Clone, Default)]
pub struct Rot {
    pub homes: Option<Vec<Home>>,
    pub rule: Option<Option<HomeRule>>,
    pub homeless: bool,
    /// A different next signing key (a thief's rival rotation).
    pub signing_key: Option<SchnorrKey>,
}

/// A rotation of `p`, signed with the chain key its chain act committed.
pub fn rotation(p: &Person, r: Rot) -> (Act, Person) {
    let gen = p.gen + 1;
    let next_sign = r
        .signing_key
        .clone()
        .unwrap_or_else(|| schnorr(&p.name, gen));
    let next_chain_key = slh(&p.name, gen);
    let kept = p
        .seq
        .last()
        .map(|t| {
            vec![mor_core::identity::KeptTip {
                act: *t,
                position: p.seq.len() as u64,
                summary: Mmr::from_ids(&p.seq).root(),
            }]
        })
        .unwrap_or_default();
    let payload = Payload::Rotation(Rotation {
        prev: p.binding,
        position: p.position + 1,
        signing_key: signing_key(&next_sign),
        chain_key: commit(&next_chain_key),
        kept,
        disowned: None,
        homes: r.homes,
        rule: r.rule,
        declarations: None,
        successor: None,
        audit: None,
        homeless: r.homeless,
        closure: false,
    });
    let i = inside(specs().identity, 1, payload.to_map());
    let chain_key = p.chain_key.clone();
    let a = seal(&i, Some(p.id), None, true, None, &random::<32>(), |id| {
        chain_key.sign(id, None)
    });
    let mut q = p.clone();
    q.gen = gen;
    q.sign = next_sign;
    q.chain_key = next_chain_key;
    q.binding = a.id();
    q.position += 1;
    (a, q)
}

/// An everyday act of `p`, next in its sequence.
pub fn everyday(
    p: &mut Person,
    spec: Hash,
    type_: u64,
    payload: Vec<(Value, Value)>,
    objects: Option<Vec<Object>>,
    to: Option<Vec<Hash>>,
    public: bool,
) -> Act {
    let mut i = inside(spec, type_, payload);
    i.prev = Some(p.seq.last().map(|x| vec![*x]).unwrap_or_default());
    i.objects = objects;
    i.position = Some(p.seq.len() as u64 + 1);
    i.summary = Some(if p.seq.is_empty() {
        ZERO_HASH
    } else {
        Mmr::from_ids(&p.seq).root()
    });
    let sign = p.sign.clone();
    let a = seal(
        &i,
        Some(p.id),
        Some(p.binding),
        public,
        to,
        &random::<32>(),
        |id| sign.sign(id, &random::<32>()),
    );
    p.seq.push(a.id());
    a
}

/// A text specification, as far as relays care: some spec hash.
pub fn text_spec() -> Hash {
    sha256(b"a text specification")
}

pub fn post(p: &mut Person, text: &str) -> Act {
    everyday(
        p,
        text_spec(),
        0,
        vec![(Value::Uint(0), Value::Text(text.into()))],
        None,
        None,
        true,
    )
}

/// A routes act, first version, with an inbox route for everything.
pub fn routes(p: &mut Person, inbox: &str) -> Act {
    let payload = vec![
        (Value::Uint(0), Value::Uint(1)),
        (
            Value::Uint(2),
            Value::Array(vec![Value::Array(vec![
                Value::Null,
                Value::Array(vec![Value::Text(inbox.into())]),
                Value::Uint(1),
            ])]),
        ),
    ];
    everyday(p, specs().identity, 3, payload, None, None, true)
}

// ---------------------------------------------------------------- judging

/// A verifier holding every act of `p`'s identity record at each home, and
/// of each home's operator.
pub async fn verifier_from(homes: &[&Running], identity: &Hash) -> Verifier {
    let mut v = Verifier::new(specs().identity);
    for h in homes {
        let Ok(rec) = h.client.identity(identity, None).await else {
            continue;
        };
        for a in rec.all_acts() {
            v.add(Act::decode(&a).unwrap()).unwrap();
        }
        let op = h.client.identity(&h.op(), None).await.unwrap();
        for a in op.all_acts() {
            v.add(Act::decode(&a).unwrap()).unwrap();
        }
        // The operator's whole sequence, to prove its receipts were kept
        // by any rotation of the operator.
        for a in h.client.acts_by(&h.op()).await.unwrap() {
            v.add(Act::decode(&a).unwrap()).unwrap();
        }
    }
    v
}

pub fn decode(bytes: &[u8]) -> Act {
    Act::decode(bytes).unwrap()
}

/// The payload of a public Identity act.
pub fn payload(bytes: &[u8]) -> Payload {
    let a = decode(bytes);
    let i = a.open(None).unwrap();
    Payload::decode(i.type_, &i.payload).unwrap()
}
