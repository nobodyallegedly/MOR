//! Homes: receipts, the identity record, log summaries and proofs,
//! conflicts, homeless rotations and objections (relay transport cMIP,
//! "Homes", "When a home counts as unreachable"; Identity rules 9 to 13).
//!
//! Every answer that matters is judged by the core library's verifier, from
//! what the homes hand back: the relays are never trusted.

mod common;

use common::*;
use mor_core::chain::{How, Status, Stop, Verifier};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::{types, HomeRule, Payload};
use mor_core::merkle;
use mor_relay::client::ClientError;
use mor_relay::wire::{code, part};
use mor_relay::{Policy, Role};

fn wire_err<T: std::fmt::Debug>(r: Result<T, ClientError>) -> mor_relay::wire::WireError {
    match r {
        Err(ClientError::Wire(e)) => e,
        other => panic!("expected an error of the cMIP, got {other:?}"),
    }
}

async fn homes(n: usize) -> Vec<Running> {
    let mut v = vec![];
    for _ in 0..n {
        v.push(Running::start(Role::Home, Policy::Open).await);
    }
    v
}

fn receipt_of(bytes: &[u8]) -> mor_core::identity::Receipt {
    match payload(bytes) {
        Payload::Receipt(r) => r,
        p => panic!("not a receipt: {p:?}"),
    }
}

/// Roadmap step 4, done when: acts go in and come back verified; homes sign
/// receipts and summaries. Three homes under three operators, the majority
/// rule by default, and a rotation that counts with one home switched off.
#[tokio::test(flavor = "multi_thread")]
async fn three_homes_majority_with_one_switched_off() {
    let mut hs = homes(3).await;
    let list: Vec<_> = hs.iter().map(|h| h.home()).collect();
    let (g, mut alice) = genesis("alice", list, None, None);

    for h in &hs {
        let put = h.client.put_act(&g.encode()).await.unwrap();
        let r = receipt_of(put.receipt.as_ref().expect("a receipt for the genesis"));
        assert_eq!((r.identity, r.act, r.position), (alice.id, alice.id, 0));
        assert_eq!(
            decode(put.receipt.as_ref().unwrap()).outside.signer,
            Some(h.op())
        );
    }
    let routes = routes(&mut alice, &hs[0].base);
    let p = post(&mut alice, "before the rotation");
    for h in &hs {
        h.client.put_act(&routes.encode()).await.unwrap();
        h.client.put_act(&p.encode()).await.unwrap();
    }

    // The home on the author's machine is switched off.
    hs[2].stop().await;
    let (rot, alice2) = rotation(&alice, Rot::default());
    for h in &hs[..2] {
        let put = h.client.put_act(&rot.encode()).await.unwrap();
        let r = receipt_of(put.receipt.as_ref().unwrap());
        assert_eq!((r.act, r.position), (rot.id(), 1));
    }
    let mut alice2 = alice2;
    let after = post(&mut alice2, "after the rotation");
    for h in &hs[..2] {
        h.client.put_act(&after.encode()).await.unwrap();
    }

    // A reader holding only what the two live homes serve.
    let v = verifier_from(&[&hs[0], &hs[1], &hs[2]], &alice.id).await;
    let res = v.resolve(&alice.id);
    assert_eq!(
        res.links.len(),
        2,
        "genesis and the rotation count: {:?}",
        res.stop
    );
    assert_eq!(res.links[1].act, rot.id());
    assert_eq!(res.links[1].how, How::Homes);
    let mut v = v;
    for a in [&p, &after] {
        v.add(a.clone()).unwrap();
    }
    assert_eq!(v.status(&p.id()), Status::Valid, "kept by the rotation");
    assert_eq!(v.status(&after.id()), Status::Valid, "under the new key");

    // The home comes back and catches up; its receipt is the third.
    hs[2].restart().await;
    hs[2].client.put_act(&rot.encode()).await.unwrap();
    let rec = hs[2].client.identity(&alice.id, None).await.unwrap();
    assert_eq!(rec.chain, vec![g.encode(), rot.encode()]);
    assert_eq!(rec.receipts.len(), 2);
    assert_eq!(rec.routes, vec![routes.encode()]);
}

/// With one home of three, the majority cannot be met: pending.
#[tokio::test(flavor = "multi_thread")]
async fn one_home_of_three_is_not_a_majority() {
    let hs = homes(3).await;
    let (g, alice) = genesis("alice", hs.iter().map(|h| h.home()).collect(), None, None);
    for h in &hs {
        h.client.put_act(&g.encode()).await.unwrap();
    }
    let (rot, _) = rotation(&alice, Rot::default());
    hs[0].client.put_act(&rot.encode()).await.unwrap();
    let v = verifier_from(&[&hs[0], &hs[1], &hs[2]], &alice.id).await;
    let res = v.resolve(&alice.id);
    assert_eq!(res.links.len(), 1);
    assert_eq!(res.stop, Stop::Pending(vec![rot.id()]));
}

/// Scenario 5.7: first held wins at a home; the thief arriving second is
/// answered with the rotation held and its receipt.
#[tokio::test(flavor = "multi_thread")]
async fn first_held_wins_and_the_second_learns_it() {
    let hs = homes(1).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    let (owner, _) = rotation(&alice, Rot::default());
    let (thief, _) = rotation(
        &alice,
        Rot {
            signing_key: Some(schnorr("mallory", 1)),
            ..Default::default()
        },
    );
    let held = hs[0].client.put_act(&owner.encode()).await.unwrap();
    let e = wire_err(hs[0].client.put_act(&thief.encode()).await);
    assert_eq!(e.code, code::CONFLICT);
    assert_eq!(e.acts[0], owner.encode());
    assert_eq!(e.acts[1], held.receipt.unwrap());
    // The thief's rotation was not kept.
    assert_eq!(
        wire_err(hs[0].client.get_act(&thief.id()).await).code,
        code::NOT_HELD
    );
}

/// A home that lacks the predecessor asks for it (error 3); a home newly
/// named in a rotation receives the chain it will serve that way.
#[tokio::test(flavor = "multi_thread")]
async fn a_newly_named_home_receives_the_chain() {
    let hs = homes(2).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    // Move to both homes, rule: majority of two operators needs both.
    let (rot, alice2) = rotation(
        &alice,
        Rot {
            homes: Some(vec![hs[0].home(), hs[1].home()]),
            rule: Some(Some(HomeRule::Threshold(2))),
            ..Default::default()
        },
    );
    hs[0].client.put_act(&rot.encode()).await.unwrap();
    let e = wire_err(hs[1].client.put_act(&rot.encode()).await);
    assert_eq!(e.code, code::MISSING_PREDECESSOR);
    // Oldest first: the genesis, which does not name this home, is held as
    // the chain's start without a receipt; the rotation naming it is receipted.
    let pg = hs[1].client.put_act(&g.encode()).await.unwrap();
    assert!(pg.receipt.is_none());
    assert_eq!(
        wire_err(hs[1].client.identity(&alice.id, None).await).code,
        code::NOT_SERVED
    );
    let pr = hs[1].client.put_act(&rot.encode()).await.unwrap();
    assert!(pr.receipt.is_some());
    let rec = hs[1].client.identity(&alice.id, None).await.unwrap();
    assert_eq!(rec.chain.len(), 2);
    assert_eq!(rec.receipts.len(), 1);

    // The next rotation needs both homes.
    let (rot2, _) = rotation(&alice2, Rot::default());
    hs[0].client.put_act(&rot2.encode()).await.unwrap();
    let v = verifier_from(&[&hs[0], &hs[1]], &alice.id).await;
    assert_eq!(
        v.resolve(&alice.id).links.len(),
        2,
        "one home of two: pending"
    );
    hs[1].client.put_act(&rot2.encode()).await.unwrap();
    let v = verifier_from(&[&hs[0], &hs[1]], &alice.id).await;
    let res = v.resolve(&alice.id);
    assert_eq!(res.links.len(), 3);
    assert_eq!(res.links[2].act, rot2.id());
}

/// Rule 9: a home checks a rotation before storing it.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_refuses_an_invalid_rotation() {
    let hs = homes(1).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    // Signed with a safety key other than the one committed.
    let mut wrong = alice.clone();
    wrong.safety = slh("mallory", 0);
    let (bad, _) = rotation(&wrong, Rot::default());
    assert_eq!(
        wire_err(hs[0].client.put_act(&bad.encode()).await).code,
        code::INVALID
    );
    // A home rule that does not fit the homes (F94).
    let (bad, _) = rotation(
        &alice,
        Rot {
            rule: Some(Some(HomeRule::Threshold(1))),
            ..Default::default()
        },
    );
    assert_eq!(
        wire_err(hs[0].client.put_act(&bad.encode()).await).code,
        code::INVALID
    );
    // Everyday acts of an identity it serves: binding checked (the cMIP's MUST).
    let mut thief = alice.clone();
    thief.sign = schnorr("mallory", 0);
    let forged = post(&mut thief, "I am alice");
    assert_eq!(
        wire_err(hs[0].client.put_act(&forged.encode()).await).code,
        code::INVALID
    );
    let mut ahead = alice.clone();
    ahead.binding = [7; 32];
    let unbound = post(&mut ahead, "bound to nothing held");
    assert_eq!(
        wire_err(hs[0].client.put_act(&unbound.encode()).await).code,
        code::MISSING_PREDECESSOR
    );
}

/// The log: a summary after every receipt, inclusion and consistency proofs
/// that check against the signed summaries (scenario 5.7d's tools).
#[tokio::test(flavor = "multi_thread")]
async fn log_summaries_and_proofs() {
    let hs = homes(1).await;
    let h = &hs[0];
    let mut receipts = vec![];
    let mut people = vec![];
    for name in ["alice", "bob", "carol"] {
        let (g, p) = genesis(name, vec![h.home()], None, None);
        receipts.push(
            h.client
                .put_act(&g.encode())
                .await
                .unwrap()
                .receipt
                .unwrap(),
        );
        people.push(p);
    }
    let (rot, _) = rotation(&people[0], Rot::default());
    receipts.push(
        h.client
            .put_act(&rot.encode())
            .await
            .unwrap()
            .receipt
            .unwrap(),
    );
    let ids: Vec<Hash> = receipts.iter().map(|r| decode(r).id()).collect();
    for (i, r) in receipts.iter().enumerate() {
        assert_eq!(
            receipt_of(r).log_position,
            i as u64,
            "log positions count every identity"
        );
        assert_eq!(h.client.log_receipt(i as u64).await.unwrap(), *r);
    }
    let (latest, cos) = h.client.log_summary(None).await.unwrap();
    assert!(cos.is_empty());
    let Payload::LogSummary(s) = payload(&latest) else {
        panic!()
    };
    assert_eq!(s.size, 4);
    assert_eq!(s.root, merkle::root(&ids));
    for (i, id) in ids.iter().enumerate() {
        let proof = h.client.log_inclusion(i as u64, 4).await.unwrap();
        assert!(merkle::verify_inclusion(id, i as u64, 4, &s.root, &proof));
    }
    let (two, _) = h.client.log_summary(Some(2)).await.unwrap();
    let Payload::LogSummary(s2) = payload(&two) else {
        panic!()
    };
    assert_eq!(s2.size, 2);
    let proof = h.client.log_consistency(2, 4).await.unwrap();
    assert!(merkle::verify_consistency(2, &s2.root, 4, &s.root, &proof));
    // Summaries chain: each names the one before.
    let (three, _) = h.client.log_summary(Some(3)).await.unwrap();
    assert_eq!(s.prev, Some(decode(&three).id()));
    // Out of range.
    assert_eq!(
        wire_err(h.client.log_inclusion(1, 9).await).code,
        code::NOT_HELD
    );
    assert_eq!(
        wire_err(h.client.log_consistency(0, 2).await).code,
        code::MALFORMED
    );
    // The summary and receipts are everyday acts of the operator, valid for a
    // verifier holding the operator's chain.
    let mut v = Verifier::new(specs().identity);
    for a in h.client.identity(&h.op(), None).await.unwrap().all_acts() {
        v.add(decode(&a)).unwrap();
    }
    for a in receipts.iter().chain([&latest, &two, &three]) {
        let id = v.add(decode(a)).unwrap();
        assert_eq!(v.status(&id), Status::Valid);
    }
}

/// Rule 11a and scenario 5.7c: a homeless rotation at a home of the old
/// set is not held; the home objects, keeps it as evidence, serves both,
/// and a relay forwarding or probing carries the objection.
#[tokio::test(flavor = "multi_thread")]
async fn a_live_home_objects_to_a_homeless_rotation() {
    let hs = homes(2).await;
    let relay = Running::start(Role::Relay, Policy::Open).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    // A thief holding the safety key claims the home is gone, and moves to
    // a home of its own choosing.
    let (homeless, _) = rotation(
        &alice,
        Rot {
            homes: Some(vec![hs[1].home()]),
            homeless: true,
            ..Default::default()
        },
    );
    let put = hs[0].client.put_act(&homeless.encode()).await.unwrap();
    assert!(put.receipt.is_none());
    let objection = put.objection.expect("the old home objects");
    let Payload::Objection(o) = payload(&objection) else {
        panic!()
    };
    assert_eq!(o.identity, alice.id);
    let oact = decode(&objection);
    assert_eq!(oact.outside.signer, Some(hs[0].op()));
    // Idempotent: the same objection again.
    assert_eq!(
        hs[0]
            .client
            .put_act(&homeless.encode())
            .await
            .unwrap()
            .objection
            .unwrap(),
        objection
    );
    // The chain is untouched; the rotation and objection are evidence.
    let rec = hs[0].client.identity(&alice.id, None).await.unwrap();
    assert_eq!(rec.chain, vec![g.encode()]);
    assert!(rec.evidence.contains(&objection));
    assert!(rec.evidence.contains(&homeless.encode()));

    // The new home holds it and receipts it (homeless procedure, step 5).
    hs[1].client.put_act(&g.encode()).await.unwrap();
    assert!(hs[1]
        .client
        .put_act(&homeless.encode())
        .await
        .unwrap()
        .receipt
        .is_some());

    // A reader who could not reach the old home would accept it; the
    // objection, from wherever it comes, voids it.
    let mut v = Verifier::new(specs().identity);
    for h in [&hs[1]] {
        for a in h.client.identity(&alice.id, None).await.unwrap().all_acts() {
            v.add(decode(&a)).unwrap();
        }
        for a in h.client.identity(&h.op(), None).await.unwrap().all_acts() {
            v.add(decode(&a)).unwrap();
        }
    }
    v.failed_to_reach(hs[0].op());
    assert_eq!(
        v.resolve(&alice.id).links.len(),
        2,
        "re-homed without audit, on the reader's own attempt"
    );
    // The objection is found through a relay's probe.
    let got = relay
        .client
        .probe(&homeless.encode(), &[hs[0].base.clone()])
        .await
        .unwrap();
    assert!(got.contains(&objection));
    for a in hs[0]
        .client
        .identity(&hs[0].op(), None)
        .await
        .unwrap()
        .all_acts()
    {
        v.add(decode(&a)).unwrap();
    }
    v.add(decode(&objection)).unwrap();
    assert_eq!(
        v.resolve(&alice.id).links.len(),
        1,
        "voided by the objection"
    );
    // The relay kept it, so it travels further.
    assert_eq!(relay.client.get_act(&oact.id()).await.unwrap(), objection);

    // A probe that reaches nothing says so, as a hint.
    let e = wire_err(
        relay
            .client
            .probe(&homeless.encode(), &["http://127.0.0.1:9".into()])
            .await,
    );
    assert_eq!(e.code, code::NOT_HELD);
}

/// A relay given a homeless rotation submits it to the old homes it knows
/// of, and keeps the objection that comes back.
#[tokio::test(flavor = "multi_thread")]
async fn a_relay_forwards_a_homeless_rotation_to_the_old_home() {
    let hs = homes(1).await;
    let relay = Running::start(Role::Relay, Policy::Open).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    relay.client.put_act(&g.encode()).await.unwrap();
    let (homeless, _) = rotation(
        &alice,
        Rot {
            homes: Some(vec![Home {
                operator: None,
                hint: "https://thief.example".into(),
            }]),
            homeless: true,
            ..Default::default()
        },
    );
    relay.client.put_act(&homeless.encode()).await.unwrap();
    let mut found = None;
    for _ in 0..50 {
        let page = relay
            .client
            .feed(&mor_relay::client::FeedQuery {
                filter: mor_relay::store::Filter {
                    signer: Some(hs[0].op()),
                    ..Default::default()
                },
                wait: Some(1),
                ..Default::default()
            })
            .await
            .unwrap();
        if let Some(i) = page.items.first() {
            found = Some(i.item.clone());
            break;
        }
    }
    let objection = found.expect("the objection travelled back to the relay");
    assert!(matches!(payload(&objection), Payload::Objection(_)));
}

/// The home on the author's machine accepts only listed identities.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_for_listed_identities_only() {
    let h = Running::start(Role::Home, Policy::Allowlist).await;
    let (g, mut alice) = genesis("alice", vec![h.home()], None, None);
    let (gm, mut mallory) = genesis("mallory", vec![h.home()], None, None);
    assert_eq!(
        wire_err(h.client.put_act(&g.encode()).await).code,
        code::REFUSED
    );
    h.node().allow(&alice.id).unwrap();
    assert!(h
        .client
        .put_act(&g.encode())
        .await
        .unwrap()
        .receipt
        .is_some());
    assert_eq!(
        wire_err(h.client.put_act(&gm.encode()).await).code,
        code::REFUSED
    );
    h.client
        .put_act(&post(&mut alice, "mine").encode())
        .await
        .unwrap();
    assert_eq!(
        wire_err(
            h.client
                .put_act(&post(&mut mallory, "let me in").encode())
                .await
        )
        .code,
        code::NOT_ACCEPTED
    );
    assert_eq!(
        wire_err(h.client.put_media(b"a picture").await).code,
        code::NOT_ACCEPTED
    );
}

/// A home keeps everything across a restart: its chains, its log, and its
/// operator's sequence, which continues where it stopped.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_survives_a_restart() {
    let mut hs = homes(1).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    let first = hs[0].client.put_act(&g.encode()).await.unwrap();
    hs[0].restart().await;
    assert_eq!(
        hs[0].client.put_act(&g.encode()).await.unwrap(),
        first,
        "the same receipt again"
    );
    let (rot, _) = rotation(&alice, Rot::default());
    hs[0].client.put_act(&rot.encode()).await.unwrap();
    let v = verifier_from(&[&hs[0]], &alice.id).await;
    assert_eq!(v.resolve(&alice.id).links.len(), 2);
    // Every act the operator signed is valid, in one unbroken sequence.
    let mut v = Verifier::new(specs().identity);
    let page = hs[0]
        .client
        .feed(&mor_relay::client::FeedQuery {
            filter: mor_relay::store::Filter {
                signer: Some(hs[0].op()),
                ..Default::default()
            },
            ..Default::default()
        })
        .await
        .unwrap();
    for a in hs[0]
        .client
        .identity(&hs[0].op(), Some(&[part::CHAIN]))
        .await
        .unwrap()
        .chain
    {
        v.add(decode(&a)).unwrap();
    }
    let mut seq = mor_core::act::Sequence::new();
    for i in &page.items {
        let a = decode(&i.item);
        let inside = a.open(None).unwrap();
        seq.append(&a.id(), &inside)
            .expect("the operator's sequence is unbroken");
        let id = v.add(a).unwrap();
        assert_eq!(v.status(&id), Status::Valid);
    }
    // routes, receipt, summary, receipt, summary
    assert_eq!(page.items.len(), 5);
    let _ = types::ROUTES;
}

/// Scenario 5.3's first step: anyone finds an identity's inbox through its
/// home, and delivers there.
#[tokio::test(flavor = "multi_thread")]
async fn finding_an_inbox_through_the_home() {
    let hs = homes(1).await;
    let inbox = Running::start(Role::Relay, Policy::Open).await;
    let (g, mut bob) = genesis("bob", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    let r = routes(&mut bob, &inbox.base);
    hs[0].client.put_act(&r.encode()).await.unwrap();
    let rec = hs[0]
        .client
        .identity(&bob.id, Some(&[part::CHAIN, part::ROUTES]))
        .await
        .unwrap();
    assert_eq!(rec.chain, vec![g.encode()]);
    assert_eq!(rec.routes, vec![r.encode()]);
    assert!(rec.receipts.is_empty(), "only the parts asked for");
}

/// F152: a private link act counts only if its sealed form is published
/// where its signer's acts are. A home stores an identity's private acts and
/// serves them in the identity record's links part, opaque, by their
/// signer: so a verifier can find them there, and the owner can see one it
/// did not write. Another identity's private act is not served with it.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_serves_an_identitys_private_acts_with_its_links() {
    let hs = homes(1).await;
    let (g, mut ana) = genesis("ana", vec![hs[0].home()], None, None);
    let (gm, mut thief) = genesis("thief", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    hs[0].client.put_act(&gm.encode()).await.unwrap();
    let bank = sha256(b"a bank");
    let ids = specs().identity;
    // A confirmation made with Ana's key, sealed, addressed to a bank only.
    let claim = everyday(&mut thief, ids, types::LINK_CLAIM, vec![], None, Some(vec![bank]), false);
    let objects = Some(vec![mor_core::act::Object { chain: claim.id(), predecessor: claim.id() }]);
    let confirmation = everyday(&mut ana, ids, types::LINK_CONFIRMATION, vec![], objects, Some(vec![bank]), false);
    hs[0].client.put_act(&claim.encode()).await.unwrap();
    hs[0].client.put_act(&confirmation.encode()).await.unwrap();
    let mine = post(&mut ana, "a public post");
    hs[0].client.put_act(&mine.encode()).await.unwrap();
    let rec = hs[0].client.identity(&ana.id, Some(&[part::LINKS])).await.unwrap();
    assert_eq!(rec.links, vec![confirmation.encode()]);
    let rec = hs[0].client.identity(&thief.id, Some(&[part::LINKS])).await.unwrap();
    assert_eq!(rec.links, vec![claim.encode()]);
}

/// A home runs under an operator identity made elsewhere, like anyone's,
/// holding only its everyday signing key: no class of operator identities,
/// and no safety key on the server.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_runs_under_an_identity_made_elsewhere() {
    use mor_relay::node::OperatorSetup;
    use mor_relay::operator::Keys;
    use mor_relay::wire::Limits;
    // An ordinary identity, made elsewhere and self-hosted there, that has
    // rotated once (a self-hosted rotation counts on its own signature).
    let (g, op) = genesis(
        "operator-main",
        vec![Home {
            operator: None,
            hint: "https://elsewhere.example".into(),
        }],
        None,
        None,
    );
    let (rot, op1) = rotation(&op, Rot::default());
    let keys = Keys {
        identity: op.id,
        binding: rot.id(),
        signing_secret: sha256(b"operator-main/sign/1"),
        safety: None,
    };
    assert_eq!(keys.signing_key().key, op1.sign.public().to_vec());
    // A key file that does not match the act it names is refused.
    let wrong = Keys {
        binding: op.id,
        ..keys.clone()
    };
    let cfg = mor_relay::Config {
        role: Role::Home,
        bases: vec!["http://127.0.0.1:1".into()],
        policy: Policy::Open,
        limits: Limits::default(),
    };
    let dir = std::env::temp_dir()
        .join("mor-relay-tests")
        .join(mor_relay::wire::hex(&mor_relay::operator::random::<32>()));
    let chain = vec![g.encode(), rot.encode()];
    assert!(mor_relay::Node::init(
        &dir,
        cfg,
        specs(),
        OperatorSetup::Existing {
            keys: wrong,
            chain: chain.clone()
        }
    )
    .is_err());

    let h = Running::start_as(
        Role::Home,
        Policy::Open,
        Limits::default(),
        OperatorSetup::Existing {
            keys: keys.clone(),
            chain,
        },
    )
    .await;
    assert_eq!(h.op(), op.id);
    assert!(
        Keys::load(&h.dir.join("operator.key"))
            .unwrap()
            .safety
            .is_none(),
        "no safety key on the server"
    );
    // It serves its operator's chain, so readers find it beside the receipts.
    let rec = h.client.identity(&op.id, None).await.unwrap();
    assert_eq!(rec.chain, vec![g.encode(), rot.encode()]);

    // An identity homed there: its receipts are signed under the rotated key,
    // and a reader accepts them.
    let (ga, alice) = genesis("alice", vec![h.home()], None, None);
    let put = h.client.put_act(&ga.encode()).await.unwrap();
    let receipt = decode(put.receipt.as_ref().unwrap());
    assert_eq!(receipt.outside.signer, Some(op.id));
    assert_eq!(receipt.outside.binding, Some(rot.id()));
    let (ra, _) = rotation(&alice, Rot::default());
    h.client.put_act(&ra.encode()).await.unwrap();
    let v = verifier_from(&[&h], &alice.id).await;
    let res = v.resolve(&alice.id);
    assert_eq!(res.links.len(), 2, "{:?}", res.stop);

    // An address added later (roadmap step 10a): the operator's routes are
    // signed where its identity is kept, so this home signs none, which
    // could fork them; it only answers under the new address.
    let mut h = h;
    let before = h.client.acts_by(&op.id).await.unwrap().len();
    h.stop().await;
    let onion = "http://mor2y3bd5wfm4uqzxl3kmsv6b6j7x5c2qmojbqrl3ddcrm6m6hrf7gad.onion";
    assert_eq!(
        h.node().add_base(onion).unwrap(),
        mor_relay::AddedBase::OperatorElsewhere(op.id)
    );
    h.restart().await;
    assert_eq!(h.client.acts_by(&op.id).await.unwrap().len(), before);
    let info = h.client.info().await.unwrap();
    assert_eq!(info.bases.last().map(String::as_str), Some(onion));
    assert!(h
        .client
        .identity(&op.id, None)
        .await
        .unwrap()
        .routes
        .is_empty());
}

/// Identity rule 12: a home's own acceptance condition. For an identity
/// whose owner chose it, the home accepts a rotation only once its operator
/// has approved it (a registered-device check, simulated); the refusal is
/// error 5, unsigned.
#[tokio::test(flavor = "multi_thread")]
async fn a_strict_home_accepts_a_rotation_only_once_approved() {
    let hs = homes(1).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    hs[0].with_node(|n| n.set_strict(&alice.id)).unwrap();
    let (rot, _) = rotation(&alice, Rot::default());
    let e = wire_err(hs[0].client.put_act(&rot.encode()).await);
    assert_eq!(e.code, code::REFUSED);
    hs[0].with_node(|n| n.approve(&rot.id())).unwrap();
    let put = hs[0].client.put_act(&rot.encode()).await.unwrap();
    assert!(put.receipt.is_some());
}

/// A home's operator rotates: the home keeps its own acts, signs on under
/// the new key, and every receipt it signed before still counts.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_signs_on_after_its_operator_rotates() {
    let hs = homes(1).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    let (r1, alice1) = rotation(&alice, Rot::default());
    hs[0].client.put_act(&r1.encode()).await.unwrap();
    let op_rot = hs[0].with_node(|n| n.rotate_operator(false)).unwrap();
    let (r2, _) = rotation(&alice1, Rot::default());
    let put = hs[0].client.put_act(&r2.encode()).await.unwrap();
    let rc = decode(put.receipt.as_ref().unwrap());
    assert_eq!(rc.outside.binding, Some(op_rot), "signed under the new key");
    let v = verifier_from(&[&hs[0]], &alice.id).await;
    assert_eq!(v.resolve(&hs[0].op()).links.len(), 2);
    let res = v.resolve(&alice.id);
    let chain: Vec<Hash> = res.links.iter().map(|l| l.act).collect();
    assert_eq!(chain, vec![alice.id, r1.id(), r2.id()], "{:?}", res.stop);
}

/// Closure by rotation (Identity rule 8c, scenario 5.7c): the closed home
/// holds nothing new and signs nothing more, but still serves what it held,
/// so a reader finds the closure; a homeless rotation then counts on the
/// new home's receipt.
#[tokio::test(flavor = "multi_thread")]
async fn a_closed_home_is_gone_and_the_owner_leaves_homeless() {
    let hs = homes(2).await;
    let (g, alice) = genesis("alice", vec![hs[0].home()], None, None);
    hs[0].client.put_act(&g.encode()).await.unwrap();
    hs[0].with_node(|n| n.rotate_operator(true)).unwrap();
    assert!(hs[0].with_node(|n| n.closed()).unwrap());
    let (g2, _) = genesis("bob", vec![hs[0].home()], None, None);
    assert_eq!(
        wire_err(hs[0].client.put_act(&g2.encode()).await).code,
        code::REFUSED
    );
    let (hr, _) = rotation(
        &alice,
        Rot {
            homeless: true,
            homes: Some(vec![hs[1].home()]),
            ..Default::default()
        },
    );
    assert_eq!(
        wire_err(hs[0].client.put_act(&hr.encode()).await).code,
        code::REFUSED,
        "a closed home signs no objection"
    );
    hs[1].client.put_act(&g.encode()).await.unwrap();
    hs[1].client.put_act(&hr.encode()).await.unwrap();
    let v = verifier_from(&[&hs[0], &hs[1]], &alice.id).await;
    let res = v.resolve(&alice.id);
    assert_eq!(res.links.len(), 2, "{:?}", res.stop);
    assert!(matches!(res.links[1].how, How::Homeless { .. }));
}

/// F101: inclusion proofs travel. A home keeps a carried proof for an
/// identity it serves only if it leads from the receipt to the signed
/// summary's root, and serves it with the acts it rests on.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_keeps_and_serves_carried_proofs() {
    let hs = homes(2).await;
    let (g, alice) = genesis("alice", vec![hs[0].home(), hs[1].home()], None, None);
    let put = hs[0].client.put_act(&g.encode()).await.unwrap();
    hs[1].client.put_act(&g.encode()).await.unwrap();
    let receipt = decode(put.receipt.as_ref().unwrap());
    let (summary, _) = hs[0].client.log_summary(None).await.unwrap();
    let s = decode(&summary);
    let path = hs[0].client.log_inclusion(0, 1).await.unwrap();
    // The acts the proof rests on: the old home's operator, its summary, its receipt.
    let op = hs[0]
        .client
        .identity(&hs[0].op(), Some(&[1]))
        .await
        .unwrap();
    for a in op
        .chain
        .iter()
        .chain([&summary, put.receipt.as_ref().unwrap()])
    {
        hs[1].client.put_act(a).await.unwrap();
    }
    let good = mor_relay::wire::Inclusion {
        summary: s.id(),
        receipt: receipt.id(),
        index: 0,
        path,
    };
    let mut bad = good.clone();
    bad.index = 1;
    assert_eq!(hs[1].client.put_proofs(&[bad]).await.unwrap(), 0);
    assert_eq!(
        hs[1]
            .client
            .put_proofs(std::slice::from_ref(&good))
            .await
            .unwrap(),
        1
    );
    let rec = hs[1].client.identity(&alice.id, None).await.unwrap();
    assert_eq!(rec.proofs, vec![good]);
    assert!(rec.carried.contains(&summary));
    assert!(rec.carried.contains(&op.chain[0]));
}
