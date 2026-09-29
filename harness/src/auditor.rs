//! An auditor: an identity that checks a home's log summaries and cosigns
//! them, and signs absence statements for a home it cannot find (Identity,
//! "Log summaries and audits", homeless procedure step 4).
//!
//! It follows the MIP's MUSTs: before cosigning a home's new summary it
//! checks a consistency proof from the last summary of that home it
//! cosigned, and it never cosigns two summaries of one home of which
//! neither extends the other; once it sees such a pair it stops cosigning
//! that home.

use crate::net::{Http, Site};
use crate::person::Person;
use mor_core::act::Act;
use mor_core::hash::Hash;
use mor_core::identity::Payload;
use mor_core::merkle;
use mor_core::sig::{self, Verdict};
use std::collections::{BTreeMap, BTreeSet};

pub struct Auditor {
    pub me: Person,
    /// The last summary cosigned per home operator: size and root.
    last: BTreeMap<Hash, (u64, Hash)>,
    /// Home operators this auditor stopped cosigning.
    pub stopped: BTreeSet<Hash>,
}

impl Auditor {
    pub fn new(me: Person) -> Self {
        Auditor {
            me,
            last: BTreeMap::new(),
            stopped: BTreeSet::new(),
        }
    }

    /// Check a summary against the last one of its home cosigned, with a
    /// consistency proof, and cosign it. The cosignature is not delivered.
    pub fn check_and_cosign(&mut self, summary: &[u8], proof: &[Hash]) -> Result<Act, String> {
        let a = Act::decode(summary).map_err(|e| e.to_string())?;
        if sig::verify(&a.signature, &a.id()) != Verdict::Valid {
            return Err("the summary's signature is not valid".into());
        }
        let op = a.outside.signer.ok_or("a summary has a signer")?;
        let i = a.open(None).map_err(|e| e.to_string())?;
        let Ok(Payload::LogSummary(s)) = Payload::decode(i.type_, &i.payload) else {
            return Err("not a log summary".into());
        };
        if self.stopped.contains(&op) {
            return Err("stopped cosigning this home: it signed two summaries of which neither extends the other".into());
        }
        if let Some((size, root)) = self.last.get(&op).copied() {
            let extends =
                s.size >= size && merkle::verify_consistency(size, &root, s.size, &s.root, proof);
            if !extends {
                self.stopped.insert(op);
                return Err(format!(
                    "the summary of size {} does not extend the one of size {size} cosigned before: stopped cosigning this home",
                    s.size
                ));
            }
            if s.size == size {
                return Err("already cosigned".into());
            }
        }
        self.last.insert(op, (s.size, s.root));
        Ok(self.me.cosign(&op, &a.id()))
    }

    /// Fetch a home's latest summary and the consistency proof from the
    /// last one cosigned, check, cosign, and deliver the cosignature to the
    /// home. Returns the cosignature.
    pub async fn cosign_latest(&mut self, home: &Site) -> Result<Act, String> {
        let (summary, _) = home
            .client
            .log_summary(None)
            .await
            .map_err(|e| e.to_string())?;
        let size = summary_size(&summary).ok_or("not a log summary")?;
        let proof = match self.last.get(&home.op()) {
            Some((from, _)) if *from < size => home
                .client
                .log_consistency(*from, size)
                .await
                .map_err(|e| e.to_string())?,
            _ => vec![],
        };
        let c = self.check_and_cosign(&summary, &proof)?;
        home.client
            .put_act(&c.encode())
            .await
            .map_err(|e| e.to_string())?;
        Ok(c)
    }

    /// An absence statement for a home, after trying every address twice;
    /// none if the home answered at all.
    pub async fn absence(
        &mut self,
        op: &Hash,
        identity: &Hash,
        rotation: &Hash,
        addrs: &[String],
        http: &Http,
    ) -> Option<Act> {
        for _ in 0..2 {
            for a in addrs {
                let c = http.client(a);
                match c.info().await {
                    Ok(_) => return None,
                    Err(e) if e.answered() => return None,
                    Err(_) => {}
                }
            }
        }
        Some(self.me.absent(op, identity, rotation))
    }
}

/// The size of a log summary act.
pub fn summary_size(bytes: &[u8]) -> Option<u64> {
    let a = Act::decode(bytes).ok()?;
    let i = a.open(None).ok()?;
    match Payload::decode(i.type_, &i.payload).ok()? {
        Payload::LogSummary(s) => Some(s.size),
        _ => None,
    }
}
