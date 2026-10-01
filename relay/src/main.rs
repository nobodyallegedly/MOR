//! `mor-relay`: run a MOR relay or home.
//!
//! ```text
//! mor-relay init  --dir DIR --role home --base https://home.example.org [--allowlist]
//! mor-relay run   --dir DIR --listen 127.0.0.1:8080 [--tor-proxy socks5h://127.0.0.1:9050]
//! mor-relay allow --dir DIR IDENTITY      (and disallow, list)
//! mor-relay show  --dir DIR
//! mor-relay strict  --dir DIR IDENTITY    (approve --dir DIR ROTATION)
//! mor-relay rotate  --dir DIR [--closure]
//! mor-relay rotated --dir DIR --operator-key FILE --rotation FILE.mor
//! mor-relay pair    --dir DIR             (managers, unpair --dir DIR KEY)
//! mor-relay limit   --dir DIR [N]         (new identities per 24 hours)
//! mor-relay address --dir DIR [--add URL] (an onion address, say; stop it first)
//! ```
//!
//! Day to day, the operator runs it from the management page instead, at
//! `/manage/` on the relay's own address, after pairing a browser once with
//! the code `init` or `pair` prints.

use clap::{Parser, Subcommand, ValueEnum};
use mor_relay::http::{self, Net, Shared};
use mor_relay::node::OperatorSetup;
use mor_relay::operator::Keys;
use mor_relay::wire::{self, Limits};
use mor_relay::{AddedBase, Config, Node, Policy, Role, Specs};
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
    /// Accept rotations of this identity only once approved with `approve`
    /// (the owner's choice of a device policy; the device check itself is
    /// simulated by the operator's approval).
    Strict {
        #[arg(long)]
        dir: PathBuf,
        identity: String,
    },
    /// Approve one rotation of a strict identity, by its act id.
    Approve {
        #[arg(long)]
        dir: PathBuf,
        rotation: String,
    },
    /// Rotate this home's test operator, whose safety key is in the key
    /// file: new keys, the home's own acts kept. Stop the home first.
    Rotate {
        #[arg(long)]
        dir: PathBuf,
        /// Close the home for good (Identity rule 8c): it holds no new
        /// identity-chain acts and signs nothing more.
        #[arg(long)]
        closure: bool,
    },
    /// Print a one-time code that pairs a browser with this relay's
    /// management page (/manage/), valid for an hour.
    Pair {
        #[arg(long)]
        dir: PathBuf,
    },
    /// List the browsers paired with the management page.
    Managers {
        #[arg(long)]
        dir: PathBuf,
    },
    /// Unpair a browser, by its management key.
    Unpair {
        #[arg(long)]
        dir: PathBuf,
        key: String,
    },
    /// Home: take at most N new identities in any 24 hours; without N, no
    /// limit.
    Limit {
        #[arg(long)]
        dir: PathBuf,
        per_day: Option<u64>,
    },
    /// List the base addresses this relay answers under; with --add, add
    /// one after setup, such as an onion address. Stop the relay first. A
    /// home whose test operator is held here also publishes the operator's
    /// next routes, naming the new address, so that clients find it.
    Address {
        #[arg(long)]
        dir: PathBuf,
        /// The address to add (https, or an onion address).
        #[arg(long)]
        add: Option<String>,
        /// Allow a plain http address: for a relay on this machine only.
        #[arg(long)]
        local_test: bool,
    },
    /// The operator rotated where its safety key is kept: hold the rotation
    /// (a bundle holding that one act) and take the new key file. Stop the
    /// home first.
    Rotated {
        #[arg(long)]
        dir: PathBuf,
        #[arg(long)]
        operator_key: PathBuf,
        #[arg(long)]
        rotation: PathBuf,
    },
}

fn die(msg: impl std::fmt::Display) -> ! {
    eprintln!("mor-relay: {msg}");
    std::process::exit(1)
}

fn open(dir: &Path) -> Node {
    Node::open(dir, Specs::test()).unwrap_or_else(|e| die(e))
}

fn print_code(node: &Node) {
    let code = mor_relay::manage::new_code(node).unwrap_or_else(|e| die(e));
    println!("Pairing code for the management page (/manage/), valid for an hour, once: {code}");
}

/// A base address as the cMIP takes it: https, or an onion address; plain
/// http only for a local test. Exits with the reason otherwise.
fn check_base(b: &str, local_test: bool) {
    use mor_relay::client::{reach, Reach};
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
            for b in &bases {
                check_base(b, local_test);
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
            let made = Node::init(&dir, cfg, Specs::test(), operator);
            if made.is_ok() {
                print_code(&open(&dir));
            }
            match made {
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
        Cmd::Strict { dir, identity: i } => open(&dir)
            .set_strict(&identity(&i))
            .unwrap_or_else(|e| die(e)),
        Cmd::Approve { dir, rotation } => open(&dir)
            .approve(&identity(&rotation))
            .unwrap_or_else(|e| die(e)),
        Cmd::Rotate { dir, closure } => {
            let id = open(&dir)
                .rotate_operator(closure)
                .unwrap_or_else(|e| die(e));
            println!("Operator rotated: {}", wire::hex(&id));
            if closure {
                println!("The home is closed for good.");
            }
        }
        Cmd::Rotated {
            dir,
            operator_key,
            rotation,
        } => {
            let keys = Keys::load(&operator_key)
                .unwrap_or_else(|e| die(format!("{}: {e}", operator_key.display())));
            let bytes = std::fs::read(&rotation)
                .unwrap_or_else(|e| die(format!("{}: {e}", rotation.display())));
            let acts = wire::Bundle::decode(&bytes)
                .unwrap_or_else(|e| die(format!("{}: not a bundle: {e}", rotation.display())))
                .acts;
            let [act] = acts.as_slice() else {
                die("the bundle must hold the rotation alone")
            };
            let id = open(&dir)
                .operator_rotated(act, keys)
                .unwrap_or_else(|e| die(e));
            println!("Operator rotation held: {}", wire::hex(&id));
        }
        Cmd::Pair { dir } => print_code(&open(&dir)),
        Cmd::Managers { dir } => {
            for m in open(&dir).managers().unwrap_or_else(|e| die(e)) {
                println!("{}  {}", wire::hex(&m.key), m.label);
            }
        }
        Cmd::Unpair { dir, key } => {
            if !open(&dir)
                .unpair(&identity(&key))
                .unwrap_or_else(|e| die(e))
            {
                die("that key is not paired");
            }
        }
        Cmd::Address {
            dir,
            add,
            local_test,
        } => {
            let mut n = open(&dir);
            if let Some(b) = add {
                check_base(&b, local_test);
                match n.add_base(&b).unwrap_or_else(|e| die(e)) {
                    AddedBase::Relay => println!("Added {b}."),
                    AddedBase::Routes(id) => println!(
                        "Added {b}. The operator's routes now name it (act {}).",
                        wire::hex(&id)
                    ),
                    AddedBase::OperatorElsewhere(op) => println!(
                        "Added {b} to this home's settings. Its operator ({}) is kept elsewhere: from there, publish the operator's next routes, naming every address of this home in the outbox route for IDENTITY, so that clients find it.",
                        wire::hex(&op)
                    ),
                }
                println!("Start the relay again to answer under it.");
            }
            for b in &n.config().bases {
                println!("{b}");
            }
        }
        Cmd::Limit { dir, per_day } => open(&dir)
            .set_newcomer_limit(per_day)
            .unwrap_or_else(|e| die(e)),
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
            match n.newcomer_limit().unwrap_or(None) {
                Some(l) => println!("new identities: at most {l} in 24 hours"),
                None if c.role == Role::Home => println!("new identities: no limit"),
                None => {}
            }
            if n.closed().unwrap_or(false) {
                println!("closed: yes, by its operator's rotation");
            }
        }
    }
}
