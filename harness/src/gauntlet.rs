//! The identity gauntlet: freeze test suite, scenario 5, steps 6 to 7d,
//! against real homes (roadmap step 7).
//!
//! Two test identities live on the three homes named as real: **A**, homed
//! at all three under the majority rule, and **B**, self-hosted with two
//! public homes as backups. In a live run those are the deployed homes (the
//! third one on the author's machine, at its onion address); in a local run
//! they are three homes on this machine, the third with the allowlist
//! policy, like the author's.
//!
//! Everything no one may do to a deployed home (steal its operator's key,
//! rotate or close its operator, switch it off at will, approve rotations
//! as its operator) runs on throwaway homes the harness starts on this
//! machine, from the same program. The report says where each check ran.
//!
//! Every verdict comes from a fresh [`Reader`] holding only what homes and
//! relays served, judged by the core library's verifier.

use crate::auditor::{summary_size, Auditor};
use crate::net::{Http, Site};
use crate::person::{Person, Rot};
use crate::reader::{Reached, Reader};
use crate::report::{Ran, Report};
use mor_core::act::Act;
use mor_core::chain::{Basis, How, Status, Stop};
use mor_core::envelopes::{self, DecKey, EncryptionKey, Recipient, Routes, SealRandom};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::{Audit, Home, LogSummary, Payload};
use mor_core::merkle;
use mor_relay::client::ClientError;
use mor_relay::node::OperatorSetup;
use mor_relay::operator::{random, Keys};
use mor_relay::wire::{code, hex, Bundle, PutResult};
use mor_relay::{Node, Policy, Role, Specs};
use std::path::PathBuf;

mod steps;

type Put = Result<PutResult, ClientError>;

fn code_of(r: &Put) -> Option<u64> {
    match r {
        Err(ClientError::Wire(e)) => Some(e.code),
        _ => None,
    }
}

/// How the third real home (the author's machine) is handled.
pub enum Machine {
    /// A home this process started: switched off and on, and its allowlist
    /// filled, directly.
    Local,
    /// The deployed home on the author's machine. The harness fills its
    /// allowlist through its data directory, if given, and asks the person
    /// running it to switch it off and on.
    Deployed { dir: Option<PathBuf> },
}

pub struct Gauntlet {
    pub report: Report,
    run: String,
    seed: [u8; 32],
    http: Http,
    /// The three real homes; the third is the author's machine.
    real: Vec<Site>,
    machine: Machine,
    /// Two throwaway open relays: probes, evidence, inboxes.
    relays: Vec<Site>,
    /// A throwaway home for auditors' own identities.
    audit_home: Site,
    slh_checked: u64,
    slh_disagreements: u64,
}

impl Gauntlet {
    /// A local run: every home on this machine.
    pub async fn local(verbose: bool) -> Self {
        let run = hex(&random::<32>())[..16].to_string();
        let http = Http::new(None);
        let mut real = vec![];
        for (i, policy) in [Policy::Open, Policy::Open, Policy::Allowlist]
            .into_iter()
            .enumerate()
        {
            real.push(
                Site::start(&run, &format!("home{}", i + 1), Role::Home, policy, &http).await,
            );
        }
        Self::with(run, http, real, Machine::Local, Report::new(verbose, false)).await
    }

    /// A live run: the three deployed homes by address, the third on this
    /// machine; a Tor proxy for the onion address.
    pub async fn live(
        bases: &[String; 3],
        tor_proxy: Option<&str>,
        machine_dir: Option<PathBuf>,
        verbose: bool,
    ) -> Result<Self, String> {
        let run = hex(&random::<32>())[..16].to_string();
        let http = Http::new(tor_proxy);
        let mut real = vec![];
        for (i, b) in bases.iter().enumerate() {
            let s = Site::remote(&format!("home{}", i + 1), b, &http).await?;
            if s.op.is_none() {
                return Err(format!("{b} is not a home: its info names no operator"));
            }
            real.push(s);
        }
        Ok(Self::with(
            run,
            http,
            real,
            Machine::Deployed { dir: machine_dir },
            Report::new(verbose, true),
        )
        .await)
    }

    async fn with(
        run: String,
        http: Http,
        real: Vec<Site>,
        machine: Machine,
        report: Report,
    ) -> Self {
        let mut relays = vec![];
        for n in ["relay1", "relay2"] {
            relays.push(Site::start(&run, n, Role::Relay, Policy::Open, &http).await);
        }
        let audit_home = Site::start(&run, "audit-home", Role::Home, Policy::Open, &http).await;
        Gauntlet {
            report,
            seed: random::<32>(),
            run,
            http,
            real,
            machine,
            relays,
            audit_home,
            slh_checked: 0,
            slh_disagreements: 0,
        }
    }

    /// Run every step. The report says whether the gauntlet passes.
    pub async fn run(mut self) -> Report {
        self.step6_majority().await;
        self.step6_self_hosted().await;
        self.step7_strict_homes().await;
        self.step7_lost_phone().await;
        self.step7b_stolen_operator_key().await;
        self.step7c_closure().await;
        self.step7c_auditors_absence().await;
        self.step7c_objection().await;
        self.step7c_hostile_home().await;
        self.step7c_audit_dropped().await;
        self.step7c_used_key_after_closure().await;
        self.step7c_thief_drops_auditing().await;
        self.step7c_censored_reader().await;
        self.step7c_redirected_inbox().await;
        self.step7d_contested_until_the_operator_rotates().await;
        self.step7d_settled_by_audit().await;
        self.slh_summary();
        self.report
    }

    // ------------------------------------------------------------ helpers

    fn reader(&self) -> Reader {
        Reader::new(self.http.clone())
    }

    fn relay_bases(&self) -> Vec<String> {
        self.relays.iter().map(|r| r.base.clone()).collect()
    }

    async fn thiefs(&self, name: &str) -> Site {
        Site::start_thiefs(&self.run, name, &self.http).await
    }

    async fn throwaway(&self, name: &str) -> Site {
        Site::start(&self.run, name, Role::Home, Policy::Open, &self.http).await
    }

    fn check(&mut self, step: &str, ran: Ran, what: &str, ok: bool, detail: impl Into<String>) {
        self.report.check(step, ran, what, ok, detail);
    }

    /// What a failed put answered, for a check's detail.
    fn answers(puts: &[Put]) -> String {
        puts.iter()
            .map(|p| match p {
                Ok(r) if r.receipt.is_some() => "receipt".to_string(),
                Ok(r) if r.objection.is_some() => "objection".to_string(),
                Ok(_) => "held".to_string(),
                Err(e) => e.to_string(),
            })
            .collect::<Vec<_>>()
            .join("; ")
    }

    async fn put(site: &Site, act: &Act) -> Put {
        site.client.put_act(&act.encode()).await
    }

    async fn put_all(sites: &[&Site], act: &Act) -> Vec<Put> {
        let mut out = vec![];
        for s in sites {
            out.push(Self::put(s, act).await);
        }
        out
    }

    /// Publish an act to every throwaway relay (evidence anyone may carry).
    async fn to_relays(&self, act: &Act) {
        for r in &self.relays {
            let _ = Self::put(r, act).await;
        }
    }

    /// Give a newly named home the chain, oldest first.
    async fn give(site: &Site, chain: &[&Act]) -> Vec<Put> {
        let mut out = vec![];
        for a in chain {
            out.push(Self::put(site, a).await);
        }
        out
    }

    /// A new test identity, named in this run, and its genesis act.
    fn born(&self, name: &str, homes: Vec<Home>, audit: Option<Audit>) -> (Act, Person) {
        Person::genesis(&self.seed, name, homes, None, audit)
    }

    /// A new auditor: an identity homed at the audit home.
    async fn auditor(&self, name: &str) -> Auditor {
        let (g, p) = self.born(name, vec![self.audit_home.home()], None);
        let _ = Self::put(&self.audit_home, &g).await;
        Auditor::new(p)
    }

    /// A reader that follows an identity from the given addresses, the
    /// auditors' chains first, and whatever the throwaway relays hold
    /// signed by the given identities.
    async fn read(
        &self,
        id: &Hash,
        start: &[&Site],
        auditors: &[&Auditor],
        signers: &[Hash],
    ) -> Reader {
        let mut rd = self.reader();
        for r in self.relay_bases() {
            rd.fetch_signed(&r, signers).await;
        }
        for a in auditors {
            rd.follow(&a.me.id, std::slice::from_ref(&self.audit_home.base))
                .await;
        }
        let bases: Vec<String> = start.iter().map(|s| s.base.clone()).collect();
        rd.follow(id, &bases).await;
        rd
    }

    async fn allow_on_machine(&self, id: &Hash) -> Result<(), String> {
        match &self.machine {
            Machine::Local => self.real[2]
                .with_node(|n| n.allow(id))
                .map_err(|e| e.to_string()),
            Machine::Deployed { dir: Some(d) } => Node::open(d, Specs::test())
                .and_then(|n| n.allow(id))
                .map_err(|e| format!("{}: {e}", d.display())),
            Machine::Deployed { dir: None } => {
                ask(&format!(
                    "List this test identity at the home on this machine, then press Enter:\n  mor-relay allow --dir ~/mor-home {}",
                    hex(id)
                ))
                .await;
                Ok(())
            }
        }
    }

    async fn switch_machine(&mut self, on: bool) {
        match self.machine {
            Machine::Local => {
                if on {
                    self.real[2].restart().await
                } else {
                    self.real[2].stop().await
                }
            }
            Machine::Deployed { .. } => {
                ask(if on {
                    "Switch the home on this machine back ON, wait until it answers through Tor, then press Enter."
                } else {
                    "Switch the home on this machine OFF (stop mor-relay), then press Enter."
                })
                .await
            }
        }
    }

    /// Every SLH-DSA signature the readers met, checked by both
    /// implementations (the condition on which `fips205` was adopted).
    fn slh_summary(&mut self) {
        let (n, d) = (self.slh_checked, self.slh_disagreements);
        self.check(
            "slh",
            Ran::Throwaway,
            "every chain-key signature met is checked by both SLH-DSA implementations, and they agree",
            n > 0 && d == 0,
            format!("{n} signatures checked, {d} disagreements"),
        );
    }

    /// Count a reader's SLH-DSA checks before it is dropped.
    fn done(&mut self, rd: &Reader) {
        self.slh_checked += rd.slh_checked;
        self.slh_disagreements += rd.disagreements;
    }
}

/// Ask the person running a live gauntlet to do something by hand.
async fn ask(text: &str) {
    let t = text.to_string();
    let _ = tokio::task::spawn_blocking(move || {
        println!("\n>>> {t}");
        let mut s = String::new();
        let _ = std::io::stdin().read_line(&mut s);
    })
    .await;
}
