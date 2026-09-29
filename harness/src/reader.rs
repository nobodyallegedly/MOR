//! A reader: fetches what homes and relays serve, and judges it with the
//! core library's verifier. It trusts no relay: every answer that matters
//! is a signed act it checks, or a proof it checks against a signed summary.
//!
//! What it does, in the cMIP's words: it follows an identity from one home
//! address to every home its chain names (and the operators' chains they
//! serve); it fetches each home operator's whole sequence, to prove its
//! receipts survived the operator's rotations; for every cosigned log
//! summary it fetches inclusion proofs and checks them; and before treating
//! a home as unreachable it tries every address twice and asks relays to
//! probe ("When a home counts as unreachable").

use crate::net::Http;
use crate::person::naming;
use mor_core::act::{Act, Scheme, Signature};
use mor_core::chain::{Resolution, Status, Verifier};
use mor_core::hash::Hash;
use mor_core::identity::{types, Payload};
use mor_core::merkle;
use mor_core::sig::{self, Verdict, SLH_CONTEXT};
use mor_relay::client::Client;
use mor_relay::wire::{Bundle, Inclusion};
use mor_relay::Specs;
use std::collections::{BTreeMap, BTreeSet};
use std::rc::Rc;

/// The second implementation's verdict on an SLH-DSA signature.
pub fn second_opinion(s: &Signature, msg: &[u8]) -> bool {
    fn check<P: slh_dsa::ParameterSet>(key: &[u8], sig: &[u8], msg: &[u8]) -> bool {
        let (Ok(vk), Ok(sg)) = (
            slh_dsa::VerifyingKey::<P>::try_from(key),
            slh_dsa::Signature::<P>::try_from(sig),
        ) else {
            return false;
        };
        vk.try_verify_with_context(msg, SLH_CONTEXT, &sg).is_ok()
    }
    match s.scheme {
        Scheme::Founding(2) => check::<slh_dsa::Sha2_128s>(&s.key, &s.sig, msg),
        Scheme::Founding(3) => check::<slh_dsa::Sha2_128f>(&s.key, &s.sig, msg),
        _ => false,
    }
}

/// How an attempt to reach a home ended.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Reached {
    /// The home answered, directly or through a probe: life.
    Yes,
    /// Every address failed twice and no probe got through; the reader
    /// treats the home as unreachable.
    No,
}

pub struct Reader {
    pub v: Verifier,
    http: Http,
    /// Addresses this reader cannot reach (a censor's block).
    blocked: BTreeSet<String>,
    held: BTreeSet<Hash>,
    /// SLH-DSA signatures on which the two implementations disagreed.
    pub disagreements: u64,
    /// SLH-DSA signatures checked by both.
    pub slh_checked: u64,
}

impl Reader {
    pub fn new(http: Http) -> Self {
        Reader {
            v: Verifier::new(Specs::test().identity),
            http,
            blocked: BTreeSet::new(),
            held: BTreeSet::new(),
            disagreements: 0,
            slh_checked: 0,
        }
    }

    /// A censor blocks this address from the reader's network.
    pub fn block(&mut self, addr: &str) {
        self.blocked.insert(addr.trim_end_matches('/').to_string());
    }

    pub fn unblock(&mut self, addr: &str) {
        self.blocked.remove(addr.trim_end_matches('/'));
    }

    fn client(&self, addr: &str) -> Option<Client> {
        let a = addr.trim_end_matches('/');
        (!self.blocked.contains(a)).then(|| self.http.client(a))
    }

    /// Hold an act, checking every SLH-DSA signature with both
    /// implementations. Anything that does not decode is dropped.
    pub fn add(&mut self, bytes: &[u8]) -> Option<Hash> {
        let a = Act::decode(bytes).ok()?;
        let id = a.id();
        if !self.held.insert(id) {
            return Some(id);
        }
        if sig::is_slh(&a.signature.scheme) {
            self.slh_checked += 1;
            let ours = sig::verify(&a.signature, &id) == Verdict::Valid;
            if ours != second_opinion(&a.signature, &id) {
                self.disagreements += 1;
            }
        }
        self.v.add(a).ok()
    }

    pub fn add_act(&mut self, a: &Act) -> Hash {
        self.add(&a.encode()).expect("an act decodes")
    }

    /// Import a bundle, exactly as if its acts were fetched from a relay.
    pub fn import(&mut self, bundle: &[u8]) -> usize {
        let Ok(b) = Bundle::decode(bundle) else {
            return 0;
        };
        let n = b.acts.iter().filter_map(|a| self.add(a)).count();
        self.take_proofs(&b.proofs);
        n
    }

    /// Carried inclusion proofs (F101), from anywhere: each is used only if
    /// the reader holds the summary it names and the proof leads from the
    /// receipt to that summary's root.
    pub fn take_proofs(&mut self, proofs: &[Inclusion]) {
        for p in proofs {
            let Some(h) = self.v.get(&p.summary) else {
                continue;
            };
            let Some(Ok(Payload::LogSummary(ls))) = &h.identity else {
                continue;
            };
            if merkle::verify_inclusion(&p.receipt, p.index, ls.size, &ls.root, &p.path) {
                self.v
                    .add_inclusion_proof(p.summary, p.index, p.path.clone());
            }
        }
    }

    pub fn resolve(&self, id: &Hash) -> Rc<Resolution> {
        self.v.resolve(id)
    }

    /// The acts counting in an identity's chain, genesis first.
    pub fn chain(&self, id: &Hash) -> Vec<Hash> {
        self.resolve(id).links.iter().map(|l| l.act).collect()
    }

    pub fn status(&self, act: &Hash) -> Status {
        self.v.status(act)
    }

    /// Follow an identity: fetch its record from `start` and from every home
    /// address its held chain acts name, with the chains of those homes'
    /// operators, until nothing new turns up. Returns the addresses that
    /// answered.
    pub async fn follow(&mut self, id: &Hash, start: &[String]) -> Vec<String> {
        let mut todo: Vec<String> = start.to_vec();
        let mut done: BTreeSet<String> = BTreeSet::new();
        let mut answered = vec![];
        while let Some(addr) = todo.pop() {
            let addr = addr.trim_end_matches('/').to_string();
            if !done.insert(addr.clone()) {
                continue;
            }
            if self.fetch_record(id, &addr).await {
                answered.push(addr.clone());
            }
            for hint in self.hints(id) {
                if !done.contains(&hint) {
                    todo.push(hint);
                }
            }
        }
        answered
    }

    /// Every home address named by an identity-chain act held for `id`.
    fn hints(&self, id: &Hash) -> Vec<String> {
        let mut out = vec![];
        let mut acts: Vec<&Hash> = vec![id];
        let signed: Vec<Hash> = self.v.signed_by(id).map(|h| h.id).collect();
        acts.extend(signed.iter());
        for a in acts {
            let Some(h) = self.v.get(a) else { continue };
            match &h.identity {
                Some(Ok(Payload::Genesis(g))) => out.extend(g.homes.iter().map(|h| h.hint.clone())),
                Some(Ok(Payload::Rotation(r))) => {
                    out.extend(r.homes.iter().flatten().map(|h| h.hint.clone()))
                }
                _ => {}
            }
        }
        out.iter()
            .map(|h| h.trim_end_matches('/').to_string())
            .collect()
    }

    /// Fetch one home's record of `id`, the chains and sequences of the
    /// operators whose receipts it holds, and the inclusion proofs for
    /// cosigned summaries. Whether the home answered at all.
    pub async fn fetch_record(&mut self, id: &Hash, addr: &str) -> bool {
        let Some(c) = self.client(addr) else {
            return false;
        };
        let rec = match c.identity(id, None).await {
            Ok(r) => r,
            Err(e) => return e.answered(),
        };
        for a in rec.all_acts() {
            self.add(&a);
        }
        self.take_proofs(&rec.proofs);
        // The operators whose receipts this home served.
        let mut ops = BTreeSet::new();
        for r in rec.receipts.iter().chain(&rec.other_receipts) {
            if let Some(s) = Act::decode(r).ok().and_then(|a| a.outside.signer) {
                ops.insert(s);
            }
        }
        if let Ok(info) = c.info().await {
            ops.extend(info.operator);
        }
        for op in &ops {
            if let Ok(orec) = c.identity(op, None).await {
                for a in orec.all_acts() {
                    self.add(&a);
                }
            }
            if let Ok(acts) = c.acts_by(op).await {
                for a in acts {
                    self.add(&a);
                }
            }
        }
        self.fetch_proofs(&c).await;
        true
    }

    /// Everything a relay holds signed by these identities: how a reader
    /// finds evidence that no home serves (a published pair of receipts).
    pub async fn fetch_signed(&mut self, addr: &str, signers: &[Hash]) {
        let Some(c) = self.client(addr) else { return };
        for s in signers {
            if let Ok(acts) = c.acts_by(s).await {
                for a in acts {
                    self.add(&a);
                }
            }
        }
    }

    /// Inclusion proofs for every receipt under every cosigned summary of
    /// the home at `c`, checked against the summary's root. For a summary
    /// the home itself does not hold at that size, the reader rebuilds the
    /// log from the receipts it can get and uses it only if the root
    /// matches.
    async fn fetch_proofs(&mut self, c: &Client) {
        let Ok(info) = c.info().await else { return };
        let Some(op) = info.operator else { return };
        let summaries = self.cosigned_summaries(&op);
        for (sid, size, root) in summaries {
            let receipts = self.receipts_by(&op);
            let mut proved = 0;
            for (rid, pos) in &receipts {
                if *pos >= size {
                    continue;
                }
                if let Ok(p) = c.log_inclusion(*pos, size).await {
                    if merkle::verify_inclusion(rid, *pos, size, &root, &p) {
                        self.v.add_inclusion_proof(sid, *pos, p);
                        proved += 1;
                    }
                }
            }
            if proved == 0 && size > 0 {
                self.rebuild(c, sid, size, root, &receipts).await;
            }
        }
    }

    /// Summaries of `op` that some held cosignature names: (id, size, root).
    fn cosigned_summaries(&self, op: &Hash) -> Vec<(Hash, u64, Hash)> {
        let mut named = BTreeSet::new();
        for h in self.all_of_type(types::COSIGNATURE) {
            for o in h.inside.objects.iter().flatten() {
                if o.chain == *op {
                    named.insert(o.predecessor);
                }
            }
        }
        named
            .into_iter()
            .filter_map(|s| {
                let h = self.v.get(&s)?;
                match &h.identity {
                    Some(Ok(Payload::LogSummary(l))) if h.act.outside.signer == Some(*op) => {
                        Some((s, l.size, l.root))
                    }
                    _ => None,
                }
            })
            .collect()
    }

    fn all_of_type(&self, type_: u64) -> Vec<&mor_core::chain::Held> {
        self.held
            .iter()
            .filter_map(|id| self.v.get(id))
            .filter(|h| h.inside.spec == Specs::test().identity && h.inside.type_ == type_)
            .collect()
    }

    /// Receipts held signed by `op`, with the log position each claims.
    fn receipts_by(&self, op: &Hash) -> Vec<(Hash, u64)> {
        self.v
            .signed_by(op)
            .filter_map(|h| match &h.identity {
                Some(Ok(Payload::Receipt(r))) => Some((h.id, r.log_position)),
                _ => None,
            })
            .collect()
    }

    async fn rebuild(
        &mut self,
        c: &Client,
        sid: Hash,
        size: u64,
        root: Hash,
        receipts: &[(Hash, u64)],
    ) {
        let mut cands: Vec<Vec<Hash>> = vec![];
        for pos in 0..size {
            let mut v = vec![];
            if let Ok(b) = c.log_receipt(pos).await {
                if let Some(id) = self.add(&b) {
                    v.push(id);
                }
            }
            for (rid, p) in receipts {
                if *p == pos && !v.contains(rid) {
                    v.push(*rid);
                }
            }
            if v.is_empty() {
                return;
            }
            cands.push(v);
        }
        let varying: Vec<usize> = (0..cands.len()).filter(|i| cands[*i].len() > 1).collect();
        if varying.len() > 3 {
            return;
        }
        let mut choice = vec![0usize; cands.len()];
        loop {
            let log: Vec<Hash> = cands.iter().zip(&choice).map(|(c, i)| c[*i]).collect();
            if merkle::root(&log) == root {
                for i in 0..log.len() {
                    self.v
                        .add_inclusion_proof(sid, i as u64, merkle::inclusion_proof(&log, i));
                }
                return;
            }
            // Next combination over the varying positions.
            let mut k = 0;
            loop {
                if k == varying.len() {
                    return;
                }
                let i = varying[k];
                choice[i] += 1;
                if choice[i] < cands[i].len() {
                    break;
                }
                choice[i] = 0;
                k += 1;
            }
        }
    }

    /// Try to reach a home before treating it as unreachable (cMIP, "Trying
    /// to reach the home"): every known address, twice, by submitting the
    /// homeless rotation and asking for the identity record; then probes
    /// through relays. Any signed act that comes back is held. If nothing
    /// answered, the verifier records its own failed attempt.
    pub async fn attempt(
        &mut self,
        op: &Hash,
        identity: &Hash,
        addrs: &[String],
        rotation: &[u8],
        probers: &[String],
    ) -> Reached {
        let mut life = false;
        for _ in 0..2 {
            for a in addrs {
                let Some(c) = self.client(a) else { continue };
                match c.put_act(rotation).await {
                    Ok(p) => {
                        life = true;
                        for x in p.objection.iter().chain(&p.receipt) {
                            self.add(x);
                        }
                    }
                    Err(e) => {
                        if e.answered() {
                            life = true;
                        }
                    }
                }
                match c.identity(identity, None).await {
                    Ok(rec) => {
                        life = true;
                        for x in rec.all_acts() {
                            self.add(&x);
                        }
                    }
                    Err(e) => life |= e.answered(),
                }
            }
            if life {
                return Reached::Yes;
            }
        }
        for p in probers {
            let Some(c) = self.client(p) else { continue };
            if let Ok(acts) = c.probe(rotation, addrs).await {
                for x in &acts {
                    self.add(x);
                }
                life = true;
            }
        }
        if life || self.objected(op, identity, rotation) {
            Reached::Yes
        } else {
            self.v.failed_to_reach(*op);
            Reached::No
        }
    }

    /// Whether the reader holds an objection by `op` naming the rotation.
    fn objected(&self, op: &Hash, identity: &Hash, rotation: &[u8]) -> bool {
        let Ok(r) = Act::decode(rotation) else {
            return false;
        };
        let want = naming(identity, &r.id());
        self.v.signed_by(op).any(|h| {
            matches!(&h.identity, Some(Ok(Payload::Objection(_)))) && h.inside.objects == want
        })
    }

    /// Everything held, by id, for building a bundle.
    pub fn bytes_of(&self, ids: &[Hash]) -> BTreeMap<Hash, Vec<u8>> {
        ids.iter()
            .filter_map(|i| self.v.get(i).map(|h| (*i, h.act.encode())))
            .collect()
    }
}
