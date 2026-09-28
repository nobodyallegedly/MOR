//! `mor-relay`: run a MOR relay or home.
//!
//! ```text
//! mor-relay init  --dir DIR --role home --base https://home.example.org [--allowlist]
//! mor-relay run   --dir DIR --listen 127.0.0.1:8080 [--tor-proxy socks5h://127.0.0.1:9050]
//! mor-relay allow --dir DIR IDENTITY      (and disallow, list)
//! mor-relay show  --dir DIR
//! ```

use clap::{Parser, Subcommand, ValueEnum};
use mor_relay::http::{self, Net, Shared};
use mor_relay::node::OperatorSetup;
use mor_relay::operator::Keys;
use mor_relay::wire::{self, Limits};
use mor_relay::{Config, Node, Policy, Role, Specs};
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(
    name = "mor-relay",
    about = "A MOR relay or home (relay transport cMIP, draft 1). Test acts only."
)]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Clone, Copy, ValueEnum)]
enum RoleArg {
    Relay,
    Home,
}

#[derive(Subcommand)]
enum Cmd {
    /// Set up a new data directory. A home runs under an operator identity
    /// made elsewhere (--operator-key and --operator-chain), or, until the
    /// genesis client exists, a new test identity (--new-test-operator).
    Init {
        #[arg(long)]
        dir: PathBuf,
        #[arg(long, value_enum)]
        role: RoleArg,
        /// A base address under which this relay answers (https, or an
        /// onion address). Give it once per address; the first is the
        /// operator's home.
        #[arg(long = "base", required = true)]
        bases: Vec<String>,
        /// Keep acts only of the identities listed with `allow`.
        #[arg(long)]
        allowlist: bool,
        /// Allow a plain http base address, which the operator's genesis
        /// then names: for a relay on this machine only, never published.
        #[arg(long)]
        local_test: bool,
        /// Home: the operator's key file (its everyday signing key and the
        /// act that bound it). The safety key never goes on the server.
        #[arg(long, requires = "operator_chain")]
        operator_key: Option<PathBuf>,
        /// Home: the operator's identity-chain acts, oldest first, as a
        /// bundle (.mor), up to the act that bound the signing key.
        #[arg(long, requires = "operator_key")]
        operator_chain: Option<PathBuf>,
        /// Home, stopgap until the genesis client exists: create a new test
        /// operator identity, self-hosted here, its safety key in software.
        #[arg(long, conflicts_with = "operator_key")]
        new_test_operator: bool,
        /// Largest act or sealed container accepted, in bytes.
        #[arg(long)]
        max_act: Option<u64>,
        /// Largest media object accepted, in bytes.
        #[arg(long)]
        max_media: Option<u64>,
    },
    /// Run the relay.
    Run {
        #[arg(long)]
        dir: PathBuf,
        /// Where to listen, for example 127.0.0.1:8080.
        #[arg(long)]
        listen: String,
        /// A Tor SOCKS proxy, to reach onion addresses (probes, forwarding).
        #[arg(long)]
        tor_proxy: Option<String>,
        /// Also reach plain http addresses: for local testing only.
        #[arg(long)]
        allow_http: bool,
    },
    /// List an identity this relay keeps acts of (allowlist policy).
    Allow {
        #[arg(long)]
        dir: PathBuf,
        identity: String,
    },
    /// Remove an identity from the list.
    Disallow {
        #[arg(long)]
        dir: PathBuf,
        identity: String,
    },
    /// Show the list.
    List {
        #[arg(long)]
        dir: PathBuf,
    },
    /// Show this relay's settings and operator.
    Show {
        #[arg(long)]
        dir: PathBuf,
    },
}

fn die(msg: impl std::fmt::Display) -> ! {
    eprintln!("mor-relay: {msg}");
    std::process::exit(1)
}

fn open(dir: &Path) -> Node {
    Node::open(dir, Specs::test()).unwrap_or_else(|e| die(e))
}

fn identity(s: &str) -> [u8; 32] {
    wire::parse_hex(s).unwrap_or_else(|| die("an identity is 64 lowercase hexadecimal characters"))
}

#[tokio::main]
async fn main() {
    match Cli::parse().cmd {
        Cmd::Init {
            dir,
            role,
            bases,
            allowlist,
            local_test,
            operator_key,
            operator_chain,
            new_test_operator,
            max_act,
            max_media,
        } => {
            use mor_relay::client::{reach, Reach};
            for b in &bases {
                match reach(b) {
                    Reach::Direct | Reach::Onion => {}
                    Reach::TestOnly if local_test => {}
                    Reach::TestOnly => die(format!(
                        "{b}: plain http is for local tests only (--local-test)"
                    )),
                    Reach::No => die(format!(
                        "{b} is not a base address (https, or an onion address)"
                    )),
                }
                if mor_core::text::check(b).is_err() {
                    die(format!("{b} is not canonical text"));
                }
            }
            let mut limits = Limits::default();
            limits.act = max_act.unwrap_or(limits.act);
            limits.media = max_media.unwrap_or(limits.media);
            let cfg = Config {
                role: match role {
                    RoleArg::Relay => Role::Relay,
                    RoleArg::Home => Role::Home,
                },
                bases,
                policy: if allowlist {
                    Policy::Allowlist
                } else {
                    Policy::Open
                },
                limits,
            };
            let operator = match (operator_key, operator_chain) {
                (Some(k), Some(c)) => {
                    let keys = Keys::load(&k).unwrap_or_else(|e| die(format!("{}: {e}", k.display())));
                    let bytes = std::fs::read(&c).unwrap_or_else(|e| die(format!("{}: {e}", c.display())));
                    let chain = wire::Bundle::decode(&bytes)
                        .unwrap_or_else(|e| die(format!("{}: not a bundle: {e}", c.display())))
                        .acts;
                    OperatorSetup::Existing { keys, chain }
                }
                _ if new_test_operator => OperatorSetup::NewTest,
                _ if matches!(role, RoleArg::Home) => die(
                    "a home needs an operator: --operator-key and --operator-chain, or --new-test-operator",
                ),
                _ => OperatorSetup::NewTest,
            };
            let test = matches!(operator, OperatorSetup::NewTest);
            match Node::init(&dir, cfg, Specs::test(), operator) {
                Ok(Some(op)) => {
                    println!("Home set up in {}.", dir.display());
                    if test {
                        println!(
                            "Operator (a new TEST identity, safety key in software): {}",
                            wire::hex(&op)
                        );
                    } else {
                        println!("Operator: {}", wire::hex(&op));
                    }
                    println!(
                        "Keep {} secret and backed up.",
                        dir.join("operator.key").display()
                    );
                }
                Ok(None) => println!("Relay set up in {}.", dir.display()),
                Err(e) => die(e),
            }
        }
        Cmd::Run {
            dir,
            listen,
            tor_proxy,
            allow_http,
        } => {
            let node = open(&dir);
            let info = node.info();
            let listener = tokio::net::TcpListener::bind(&listen)
                .await
                .unwrap_or_else(|e| die(e));
            println!(
                "Listening on {listen}, answering as {}.",
                info.bases.join(", ")
            );
            if let Some(op) = info.operator {
                println!("Operator: {}", wire::hex(&op));
            }
            let shared = Shared::new(node, Net::new(tor_proxy.as_deref(), allow_http));
            if let Err(e) = http::serve(listener, shared).await {
                die(e)
            }
        }
        Cmd::Allow { dir, identity: i } => {
            open(&dir).allow(&identity(&i)).unwrap_or_else(|e| die(e))
        }
        Cmd::Disallow { dir, identity: i } => open(&dir)
            .disallow(&identity(&i))
            .unwrap_or_else(|e| die(e)),
        Cmd::List { dir } => {
            for i in open(&dir).allow_list().unwrap_or_else(|e| die(e)) {
                println!("{}", wire::hex(&i));
            }
        }
        Cmd::Show { dir } => {
            let n = open(&dir);
            let c = n.config();
            println!("role: {:?}", c.role);
            println!("bases: {}", c.bases.join(", "));
            println!("policy: {:?}", c.policy);
            println!(
                "limits: act {} B, media {} B, feed {} items, wait {} s",
                c.limits.act, c.limits.media, c.limits.feed, c.limits.wait
            );
            if let Some(op) = n.operator() {
                println!("operator: {} (TEST identity)", wire::hex(&op));
            }
        }
    }
}
