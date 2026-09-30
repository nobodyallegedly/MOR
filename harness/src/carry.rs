//! What an owner's client keeps so its history stays provable after a home
//! vanishes (F101): the inclusion proofs of its own receipts under cosigned
//! log summaries, and the acts they rest on. It hands them to its new homes
//! when it re-homes.

use mor_core::act::Act;
use mor_core::hash::Hash;
use mor_core::identity::{types, Payload};
use mor_core::merkle;
use mor_relay::client::Client;
use mor_relay::wire::Inclusion;
use mor_relay::Specs;
use std::collections::BTreeSet;

#[derive(Clone, Debug, Default)]
pub struct Carried {
    /// The home operator's chain acts, its receipts for the identity, the
    /// cosigned summaries, and their cosignatures; oldest chain acts first.
    pub acts: Vec<Vec<u8>>,
    pub proofs: Vec<Inclusion>,
}

fn opened(b: &[u8]) -> Option<(Act, Payload)> {
    let a = Act::decode(b).ok()?;
    let i = a.open(None).ok()?;
    if i.spec != Specs::test().identity {
        return None;
    }
    let p = Payload::decode(i.type_, &i.payload).ok()?;
    Some((a, p))
}

/// Keep, from a home that still answers, everything that proves its
/// receipts for `identity`: every summary a cosignature in its record
/// names, and an inclusion proof, checked, for each receipt under it.
pub async fn keep(home: &Client, identity: &Hash) -> Carried {
    let mut out = Carried::default();
    let Ok(info) = home.info().await else {
        return out;
    };
    let Some(op) = info.operator else {
        return out;
    };
    let Ok(rec) = home.identity(identity, None).await else {
        return out;
    };
    if let Ok(orec) = home.identity(&op, Some(&[1])).await {
        out.acts.extend(orec.chain);
    }
    let receipts: Vec<(Hash, u64)> = rec
        .receipts
        .iter()
        .filter_map(|b| match opened(b)? {
            (a, Payload::Receipt(r)) => Some((a.id(), r.log_position)),
            _ => None,
        })
        .collect();
    out.acts.extend(rec.receipts.iter().cloned());
    let mut summaries = BTreeSet::new();
    for b in &rec.evidence {
        if let Some((a, _)) = opened(b) {
            let i = a.open(None).expect("opened above");
            if i.type_ == types::COSIGNATURE {
                for o in i.objects.iter().flatten() {
                    if o.chain == op {
                        summaries.insert(o.predecessor);
                    }
                }
                out.acts.push(b.clone());
            }
        }
    }
    for s in summaries {
        let Ok(b) = home.get_act(&s).await else {
            continue;
        };
        let Some((_, Payload::LogSummary(ls))) = opened(&b) else {
            continue;
        };
        out.acts.push(b);
        for (rid, pos) in &receipts {
            if *pos >= ls.size {
                continue;
            }
            if let Ok(path) = home.log_inclusion(*pos, ls.size).await {
                if merkle::verify_inclusion(rid, *pos, ls.size, &ls.root, &path) {
                    out.proofs.push(Inclusion {
                        summary: s,
                        receipt: *rid,
                        index: *pos,
                        path,
                    });
                }
            }
        }
    }
    out
}

/// Hand what was kept to a new home that serves the identity. How many
/// proofs it kept.
pub async fn deliver(to: &Client, c: &Carried) -> u64 {
    for a in &c.acts {
        let _ = to.put_act(a).await;
    }
    to.put_proofs(&c.proofs).await.unwrap_or(0)
}
