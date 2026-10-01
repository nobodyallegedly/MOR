//! An address added after setup (roadmap step 10a): the server's homes get
//! an onion address, a second address for the same homes. The relay answers
//! under it, and a home whose test operator it holds publishes the
//! operator's next routes naming it (relay transport cMIP, "Addresses"), so
//! that clients find it. Judged by the core library's verifier, from what
//! the home hands back.

mod common;

use common::*;
use mor_core::chain::Verifier;
use mor_core::envelope::{latest, Routes, Version};
use mor_core::hash::Hash;
use mor_relay::{AddedBase, Policy, Role};

const ONION: &str = "http://mor2y3bd5wfm4uqzxl3kmsv6b6j7x5c2qmojbqrl3ddcrm6m6hrf7gad.onion";

/// The operator's routes that count, as a reader finds them at the home.
async fn routes_at(h: &Running) -> (Hash, Routes, usize) {
    let op = h.op();
    let rec = h.client.identity(&op, None).await.unwrap();
    let mut v = Verifier::new(specs().identity);
    for a in rec.all_acts() {
        v.add(decode(&a)).unwrap();
    }
    for a in h.client.acts_by(&op).await.unwrap() {
        v.add(decode(&a)).unwrap();
    }
    let mut found = vec![];
    for a in &rec.routes {
        let act = decode(a);
        let id = act.id();
        assert_eq!(v.status(&id), mor_core::chain::Status::Valid);
        let r = Routes::decode(&act.open(None).unwrap().payload).unwrap();
        found.push((id, r));
    }
    let versions: Vec<(Hash, Version)> = found.iter().map(|(i, r)| (*i, r.version)).collect();
    let tip = latest(&versions);
    assert!(!tip.contested);
    let id = tip.act.expect("the operator has routes");
    let r = found.iter().find(|(i, _)| *i == id).unwrap().1.clone();
    (id, r, found.len())
}

fn identity_hints(r: &Routes) -> Vec<String> {
    r.routes
        .iter()
        .find(|x| x.kind == 0 && x.scope == Some(specs().identity))
        .expect("an outbox route for IDENTITY")
        .hints
        .clone()
}

#[tokio::test(flavor = "multi_thread")]
async fn a_home_adds_an_onion_address_and_its_routes_name_it() {
    let mut h = Running::start(Role::Home, Policy::Open).await;
    let (first, r1, n) = routes_at(&h).await;
    assert_eq!((n, r1.version.version), (1, 1));
    assert_eq!(identity_hints(&r1), vec![h.base.clone()]);

    // An identity homed there before the address is added keeps its receipts.
    let (g, _alice) = genesis("alice", vec![h.home()], None, None);
    h.client.put_act(&g.encode()).await.unwrap();

    h.stop().await;
    let mut node = h.node();
    let added = node.add_base(ONION).unwrap();
    let AddedBase::Routes(second) = added else {
        panic!("a home holding its test operator signs the routes: {added:?}")
    };
    // The same address twice is refused, and changes nothing.
    assert!(node.add_base(ONION).is_err());
    drop(node);
    h.restart().await;

    let info = h.client.info().await.unwrap();
    assert_eq!(info.bases, vec![h.base.clone(), ONION.to_string()]);
    let (tip, r2, n) = routes_at(&h).await;
    assert_eq!(tip, second);
    assert_eq!(n, 2, "the whole routes chain is served");
    assert_eq!(
        r2.version,
        Version {
            version: 2,
            previous: Some(first)
        }
    );
    assert_eq!(identity_hints(&r2), vec![h.base.clone(), ONION.to_string()]);

    // The home still receipts, and its earlier receipts still verify.
    let v = verifier_from(&[&h], &g.id()).await;
    assert_eq!(v.resolve(&g.id()).links.len(), 1);
    let (g2, _bob) = genesis("bob", vec![h.home()], None, None);
    let put = h.client.put_act(&g2.encode()).await.unwrap();
    assert!(put.receipt.is_some());
    let v = verifier_from(&[&h], &g2.id()).await;
    assert_eq!(v.resolve(&g2.id()).links.len(), 1);

    // A third address: version 3, naming the second.
    h.stop().await;
    let third = "https://home-b.example.org";
    let AddedBase::Routes(id3) = h.node().add_base(third).unwrap() else {
        panic!("routes expected")
    };
    h.restart().await;
    let (tip, r3, _) = routes_at(&h).await;
    assert_eq!(tip, id3);
    assert_eq!(
        r3.version,
        Version {
            version: 3,
            previous: Some(second)
        }
    );
    assert_eq!(
        identity_hints(&r3),
        vec![h.base.clone(), ONION.to_string(), third.to_string()]
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn a_basic_relay_adds_an_address() {
    let mut r = Running::start(Role::Relay, Policy::Open).await;
    r.stop().await;
    assert_eq!(r.node().add_base(ONION).unwrap(), AddedBase::Relay);
    r.restart().await;
    let info = r.client.info().await.unwrap();
    assert_eq!(info.bases, vec![r.base.clone(), ONION.to_string()]);
}
