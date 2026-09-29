//! The report: every check the gauntlet makes, whether it passed, and where
//! it ran. The freeze report (roadmap step 16) marks each scenario run or
//! reasoned; this is its evidence for scenario 5, steps 6 to 7d.

use std::fmt::Write;

/// Where a check ran.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Ran {
    /// On the three homes named as real: the deployed homes in a live run,
    /// three homes on this machine in a local run.
    RealHomes,
    /// On throwaway homes the harness started on this machine, because the
    /// check needs what no one may do to a deployed home: stealing its
    /// operator's key, rotating or closing its operator, switching it off
    /// at will, or approving rotations as its operator.
    Throwaway,
    /// A client conformance rule: what the harness, as the owner's or the
    /// reader's client, shows. No verifier can check it.
    Conformance,
}

#[derive(Clone, Debug)]
pub struct Check {
    pub step: String,
    pub ran: Ran,
    pub what: String,
    pub ok: bool,
    pub detail: String,
}

#[derive(Default)]
pub struct Report {
    pub checks: Vec<Check>,
    /// Print each check as it is made.
    pub verbose: bool,
    /// Whether the real homes were the deployed ones.
    pub live: bool,
}

impl Report {
    pub fn new(verbose: bool, live: bool) -> Self {
        Report {
            checks: vec![],
            verbose,
            live,
        }
    }

    pub fn check(&mut self, step: &str, ran: Ran, what: &str, ok: bool, detail: impl Into<String>) {
        let c = Check {
            step: step.into(),
            ran,
            what: what.into(),
            ok,
            detail: detail.into(),
        };
        if self.verbose {
            println!("{}", line(&c, self.live));
        }
        self.checks.push(c);
    }

    /// Something the client shows its user (conformance), printed as is.
    pub fn say(&self, text: &str) {
        if self.verbose {
            println!("       client says: {text}");
        }
    }

    pub fn passed(&self) -> bool {
        !self.checks.is_empty() && self.checks.iter().all(|c| c.ok)
    }

    pub fn text(&self) -> String {
        let mut s = String::new();
        let _ = writeln!(
            s,
            "MOR identity gauntlet (freeze test suite, scenario 5, steps 6 to 7d): {} run",
            if self.live { "live" } else { "local" }
        );
        for c in &self.checks {
            let _ = writeln!(s, "{}", line(c, self.live));
        }
        let failed = self.checks.iter().filter(|c| !c.ok).count();
        let _ = writeln!(
            s,
            "{} checks, {} passed, {} failed: the gauntlet {}.",
            self.checks.len(),
            self.checks.len() - failed,
            failed,
            if self.passed() {
                "passes"
            } else {
                "does not pass"
            }
        );
        s
    }
}

fn line(c: &Check, live: bool) -> String {
    let where_ = match (c.ran, live) {
        (Ran::RealHomes, true) => "deployed homes",
        (Ran::RealHomes, false) => "three homes, local",
        (Ran::Throwaway, _) => "throwaway homes",
        (Ran::Conformance, _) => "conformance",
    };
    let mut l = format!(
        "{} {:<5} {} [{}]",
        if c.ok { "PASS" } else { "FAIL" },
        c.step,
        c.what,
        where_
    );
    if !c.ok || !c.detail.is_empty() {
        l.push_str(&format!("\n       {}", c.detail));
    }
    l
}
