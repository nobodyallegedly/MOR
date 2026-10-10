//! The relays and homes a run talks to: deployed ones, reached by their
//! address, and throwaway ones the harness starts on this machine.
//!
//! A throwaway home runs the same program as a deployed one (`mor-relay`),
//! in this process, on a local port, from a fresh data directory. The
//! harness can switch it off and on, act as its operator (approve a
//! rotation, rotate, close), or play a thief who stole its operator's
//! signing key, which it can never do to a deployed home.

use mor_core::hash::Hash;
use mor_core::identity::Home;
use mor_relay::client::{http_client, reach, Client, Reach};
use mor_relay::http::{self, Net, Shared};
use mor_relay::node::OperatorSetup;
use mor_relay::operator::{random, Keys};
use mor_relay::store::Store;
use mor_relay::wire::{hex, Limits};
use mor_relay::{Config, Node, Policy, Role, Specs};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::oneshot;
use tokio::task::JoinHandle;

/// HTTP clients: directly, and through Tor for onion addresses.
#[derive(Clone)]
pub struct Http {
    direct: reqwest::Client,
    tor: Option<reqwest::Client>,
    pub tor_proxy: Option<String>,
}

impl Http {
    pub fn new(tor_proxy: Option<&str>) -> Self {
        Http {
            direct: http_client(None),
            tor: tor_proxy.map(|p| http_client(Some(p))),
            tor_proxy: tor_proxy.map(str::to_string),
        }
    }

    /// The client for an address: Tor for an onion address, when given.
    pub fn for_addr(&self, addr: &str) -> reqwest::Client {
        match (reach(addr), &self.tor) {
            (Reach::Onion, Some(t)) => t.clone(),
            _ => self.direct.clone(),
        }
    }

    pub fn client(&self, addr: &str) -> Client {
        Client::with_http(self.for_addr(addr), addr)
    }
}

struct Local {
    addr: std::net::SocketAddr,
    dir: PathBuf,
    shared: Option<Arc<Shared>>,
    stop: Option<oneshot::Sender<()>>,
    task: Option<JoinHandle<()>>,
}

/// A relay or home.
pub struct Site {
    pub name: String,
    pub base: String,
    pub client: Client,
    /// A home's operator; none for a basic relay.
    pub op: Option<Hash>,
    local: Option<Local>,
    tor_proxy: Option<String>,
    /// Whether it reaches other relays (probes, forwarding). A thief's
    /// home carries no evidence against the thief.
    reaches_out: bool,
}

/// Where throwaway homes keep their data, for this run.
fn temp_dir(run: &str) -> PathBuf {
    let d = std::env::temp_dir()
        .join("mor-gauntlet")
        .join(run)
        .join(&hex(&random::<32>())[..16]);
    std::fs::create_dir_all(&d).expect("a temporary directory");
    d
}

impl Site {
    /// A deployed relay or home, by its base address. Its operator is read
    /// from its `info` answer, a hint that its receipts must then bear out.
    pub async fn remote(name: &str, base: &str, http: &Http) -> Result<Site, String> {
        let client = http.client(base);
        let info = client
            .info()
            .await
            .map_err(|e| format!("{name} at {base}: {e}"))?;
        Ok(Site {
            name: name.into(),
            base: client.base().to_string(),
            client,
            op: info.operator,
            local: None,
            tor_proxy: None,
            reaches_out: true,
        })
    }

    /// A throwaway relay or home on a free local port, under a new test
    /// operator.
    pub async fn start(run: &str, name: &str, role: Role, policy: Policy, http: &Http) -> Site {
        Self::start_as(run, name, role, policy, http, |_| OperatorSetup::NewTest).await
    }

    /// A throwaway home run under an identity made elsewhere: `setup` is
    /// given the home's address (for a self-hosted identity, whose genesis
    /// names it) and returns the operator's key file and chain.
    pub async fn start_as(
        run: &str,
        name: &str,
        role: Role,
        policy: Policy,
        http: &Http,
        setup: impl FnOnce(&str) -> OperatorSetup,
    ) -> Site {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
            .await
            .expect("a local port");
        let addr = listener.local_addr().unwrap();
        let base = format!("http://{addr}");
        let dir = temp_dir(run);
        let cfg = Config {
            role,
            bases: vec![base.clone()],
            policy,
            limits: Limits::default(),
        };
        let op = Node::init(&dir, cfg, Specs::test(), setup(&base)).expect("a new relay directory");
        let mut s = Site {
            name: name.into(),
            client: Client::with_http(http_client(None), &base),
            base,
            op,
            local: Some(Local {
                addr,
                dir,
                shared: None,
                stop: None,
                task: None,
            }),
            tor_proxy: http.tor_proxy.clone(),
            reaches_out: true,
        };
        s.serve(listener);
        s
    }

    fn serve(&mut self, listener: tokio::net::TcpListener) {
        let net = if self.reaches_out {
            Net::new(self.tor_proxy.as_deref(), true)
        } else {
            Net::new(None, false)
        };
        let l = self.local.as_mut().expect("a throwaway site");
        let node = Node::open(&l.dir, Specs::test()).expect("the relay directory");
        let shared = Shared::new(node, net);
        l.shared = Some(shared.clone());
        let (tx, rx) = oneshot::channel();
        l.stop = Some(tx);
        l.task = Some(tokio::spawn(async move {
            let _ = axum::serve(listener, http::router(shared))
                .with_graceful_shutdown(async {
                    let _ = rx.await;
                })
                .await;
        }));
    }

    /// A throwaway home run by a thief: it forwards nothing and probes
    /// nothing, so it never carries an objection to the thief's rotation.
    pub async fn start_thiefs(run: &str, name: &str, http: &Http) -> Site {
        let mut s = Self::start(run, name, Role::Home, Policy::Open, http).await;
        s.reaches_out = false;
        s.restart().await;
        s
    }

    pub fn is_local(&self) -> bool {
        self.local.is_some()
    }

    pub fn op(&self) -> Hash {
        self.op.expect("a home has an operator")
    }

    /// This home's entry in a home list.
    pub fn home(&self) -> Home {
        Home {
            operator: Some(self.op()),
            hint: self.base.clone(),
        }
    }

    /// Switch a throwaway site off: it stops answering altogether.
    pub async fn stop(&mut self) {
        let l = self.local.as_mut().expect("a throwaway site");
        if let Some(s) = l.stop.take() {
            let _ = s.send(());
        }
        if let Some(t) = l.task.take() {
            let _ = t.await;
        }
        l.shared = None;
    }

    /// Switch it on again, on the same port, from the same directory.
    pub async fn restart(&mut self) {
        self.stop().await;
        let addr = self.local.as_ref().unwrap().addr;
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .expect("the same local port");
        self.serve(listener);
    }

    /// Act as the operator of a running throwaway home.
    pub fn with_node<T>(&self, f: impl FnOnce(&mut Node) -> T) -> T {
        let l = self.local.as_ref().expect("a throwaway site");
        let shared = l.shared.as_ref().expect("the site is running");
        f(&mut shared.node())
    }

    /// The operator's key file, as a thief who broke into the server reads
    /// it; and the operator's sequence so far, which is public.
    pub fn stolen_keys(&self) -> (Keys, Vec<Hash>) {
        let l = self.local.as_ref().expect("a throwaway site");
        let keys = Keys::load(&l.dir.join("operator.key")).expect("the key file");
        let own = Store::open(&l.dir.join("relay.db"))
            .and_then(|s| s.own())
            .expect("the relay database");
        (keys, own)
    }
}
