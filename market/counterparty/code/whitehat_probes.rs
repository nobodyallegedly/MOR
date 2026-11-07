//! Counterparty: probes behind core findings C4, C5 and the stale-view answer.
//! Read against MOR at af2ed6f8. Test identities only, from the core's own test
//! harness; no network. To run: copy this file into `core/tests/` beside
//! `common/`, then `cargo +stable test --test whitehat_probes`.
//! W1a, W1b: C4. W2, W2b: C5. W3: "the same verdict without the same evidence".
mod common;

use common::*;
use mor_core::chain::{Status, Stop};
use mor_core::identity::Audit;

fn chain(w: &World, p: &Person) -> Vec<mor_core::hash::Hash> {
    w.v.resolve(&p.id).links.iter().map(|l| l.act).collect()
}

/// W1a: an operator's routine rotation that keeps no tips voids every
/// unaudited receipt; the identity's rotation stops counting and the
/// thief's act under the stolen genesis key comes back.
#[test]
fn w1a_operator_rotation_dropping_receipt_line_reverts_identity() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("victim", vec![home(&h)], None, None);
    let mut thief = j.clone();
    let stolen_post = w.post(&mut thief, "thief's post with stolen genesis key");
    let (r1, _) = w.rotate(&j, Rot { kept: Some(vec![]), ..Default::default() });
    w.receipt(&mut h, &j.id, &r1, 1);
    assert_eq!(chain(&w, &j), vec![j.id, r1]);
    assert_eq!(w.v.status(&stolen_post), Status::Void);
    // Operator rotates, its client omitting the receipt line.
    w.rotate(&h, Rot { kept: Some(vec![]), ..Default::default() });
    println!("W1a chain after operator rotation: {:?}", chain(&w, &j).len());
    println!("W1a stop: {:?}", w.v.resolve(&j.id).stop);
    println!("W1a stolen post status: {:?}", w.v.status(&stolen_post));
}

/// W1b: closure rotation keeping nothing, then a used chain key from an
/// old backup (rule 54 scenario).
#[test]
fn w1b_closure_keeping_nothing_lets_used_chain_key_rewrite() {
    let mut w = World::new();
    let mut h0 = w.operator("home-0");
    let mut t = w.operator("thief-home");
    let j = w.genesis("victim", vec![home(&h0)], None, None);
    let (r1, j1) = w.rotate(&j, Rot::default());
    w.receipt(&mut h0, &j.id, &r1, 1);
    let (r2, _) = w.rotate(&j1, Rot::default());
    w.receipt(&mut h0, &j.id, &r2, 2);
    w.rotate(&h0, Rot { closure: true, kept: Some(vec![]), ..Default::default() });
    let (x1, t1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&t)]),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut t, &j.id, &x1, 1);
    let (x2, _) = w.rotate(&t1, Rot::default());
    w.receipt(&mut t, &j.id, &x2, 2);
    let c = chain(&w, &j);
    println!("W1b chain = owner? {} thief? {}", c.contains(&r1), c.contains(&x1));
}

/// W2: audited identity; thief with chain key + stolen operator signing key
/// makes a rival that drops audit. Does the audit still settle it?
#[test]
fn w2_rival_dropping_audit_evades_audit_settlement() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut aud = w.operator("auditor");
    let audit = Audit { threshold: 1, auditors: vec![aud.id] };
    let j = w.genesis("victim", vec![home(&h)], None, Some(audit));
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    let s = w.log_summary(&mut h);
    w.cosign(&mut aud, &s, &h.id);
    assert_eq!(chain(&w, &j), vec![j.id, own]);
    let (rival, _) = w.rotate(
        &j,
        Rot { signing_key: Some(schnorr("thief", 1)), audit: Some(None), ..Default::default() },
    );
    let mut stolen = h.clone();
    w.receipt(&mut stolen, &j.id, &rival, 1);
    let res = w.v.resolve(&j.id);
    println!("W2 chain len {} owner {} rival {} stop {:?} contested {:?}",
        chain(&w, &j).len(), chain(&w, &j).contains(&own), chain(&w, &j).contains(&rival), res.stop, res.contested);
    let _ = Stop::Contested;
}

/// W2b: same, but the owner's rotation is not cosigned yet (window between
/// receipt and audit): the rival with no audit wins outright?
#[test]
fn w2b_rival_dropping_audit_before_cosign() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let aud = w.operator("auditor");
    let audit = Audit { threshold: 1, auditors: vec![aud.id] };
    let j = w.genesis("victim", vec![home(&h)], None, Some(audit));
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    let (rival, _) = w.rotate(
        &j,
        Rot { signing_key: Some(schnorr("thief", 1)), audit: Some(None), ..Default::default() },
    );
    let mut stolen = h.clone();
    w.receipt(&mut stolen, &j.id, &rival, 1);
    println!("W2b owner {} rival {}", chain(&w, &j).contains(&own), chain(&w, &j).contains(&rival));
}

/// W3: stale view. Reader lacks r2 (home omits it): stolen-key act valid.
#[test]
fn w3_stale_view_accepts_stolen_key_act() {
    let mut fresh = World::new();
    let mut h = fresh.operator("home");
    let j = fresh.genesis("victim", vec![home(&h)], None, None);
    let mut thief = j.clone();
    let p = fresh.post(&mut thief, "thief");
    println!("W3 before rotation held: {:?} stop {:?}", fresh.v.status(&p), fresh.v.resolve(&j.id).stop);
    let (r1, _) = fresh.rotate(&j, Rot { kept: Some(vec![]), ..Default::default() });
    fresh.receipt(&mut h, &j.id, &r1, 1);
    println!("W3 after rotation held: {:?}", fresh.v.status(&p));
}
