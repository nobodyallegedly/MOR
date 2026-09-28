//! A basic relay: publishing, fetching, following, sealed containers, media
//! (relay transport cMIP, "Relays: publishing and fetching", "Delivering to
//! an inbox").

mod common;

use common::*;
use mor_core::cbor::{self, Value};
use mor_core::hash::sha256;
use mor_core::sig;
use mor_relay::client::{ClientError, FeedQuery};
use mor_relay::store::Filter;
use mor_relay::wire::{self, code, Limits, Sealed};
use mor_relay::{Policy, Role};
use std::time::Duration;

fn code_of<T: std::fmt::Debug>(r: Result<T, ClientError>) -> u64 {
    match r {
        Err(ClientError::Wire(e)) => e.code,
        other => panic!("expected an error of the cMIP, got {other:?}"),
    }
}

#[tokio::test(flavor = "multi_thread")]
async fn acts_go_in_and_come_back_byte_for_byte() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let (g, mut alice) = genesis(
        "alice",
        vec![Home {
            operator: None,
            hint: "https://alice.example".into(),
        }],
        None,
        None,
    );
    let post = post(&mut alice, "Thank you for the shower");
    for a in [&g, &post] {
        let bytes = a.encode();
        let put = r.client.put_act(&bytes).await.unwrap();
        assert_eq!(put.id, a.id());
        assert!(put.receipt.is_none(), "a basic relay signs no receipts");
        let back = r.client.get_act(&a.id()).await.unwrap();
        assert_eq!(back, bytes, "served byte for byte");
        // Publishing is idempotent: the same answer again.
        assert_eq!(r.client.put_act(&bytes).await.unwrap(), put);
    }
    // Batch fetch: one answer per id, null where not held.
    let missing = sha256(b"nothing");
    let got = r
        .client
        .get_acts(&[post.id(), missing, g.id()])
        .await
        .unwrap();
    assert_eq!(got, vec![Some(post.encode()), None, Some(g.encode())]);
    // Not held proves nothing, and says so.
    assert_eq!(code_of(r.client.get_act(&missing).await), code::NOT_HELD);
    // Discovery.
    let info = r.client.info().await.unwrap();
    assert_eq!(info.bases, vec![r.base.clone()]);
    assert_eq!(info.operator, None);
    assert_eq!(info.roles, vec![wire::role::RELAY, wire::role::INBOX]);
    // No commitment: its construction is still open in Envelope.
    assert_eq!(code_of(r.client.commitment().await), code::NOT_HELD);
    // A basic relay is not a home.
    assert_eq!(
        code_of(r.client.identity(&alice.id, None).await),
        code::NOT_SUPPORTED
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn what_a_relay_checks_on_arrival() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let (g, mut alice) = genesis(
        "alice",
        vec![Home {
            operator: None,
            hint: "https://a.example".into(),
        }],
        None,
        None,
    );
    r.client.put_act(&g.encode()).await.unwrap();
    let good = post(&mut alice, "hello");

    // Not CBOR, or not deterministic CBOR, or not an act: malformed.
    assert_eq!(code_of(r.client.put_act(b"hello").await), code::MALFORMED);
    let mut v = cbor::decode(&good.encode()).unwrap();
    if let Value::Array(a) = &mut v {
        a.push(Value::Uint(0));
    }
    assert_eq!(
        code_of(r.client.put_act(&cbor::encode(&v)).await),
        code::MALFORMED
    );
    // A non-shortest integer: same meaning, not the one correct form.
    let bytes = good.encode();
    let long = [&[0x98u8, 0x03][..], &bytes[1..]].concat();
    assert_eq!(bytes[0], 0x83);
    assert_eq!(code_of(r.client.put_act(&long).await), code::MALFORMED);

    // Locked bytes that do not match the locked hash: invalid.
    let mut broken = good.clone();
    broken.locked[0] ^= 1;
    assert_eq!(
        code_of(r.client.put_act(&broken.encode()).await),
        code::INVALID
    );
    // A signature that does not verify: invalid.
    let mut forged = good.clone();
    forged.signature.sig[0] ^= 1;
    assert_eq!(
        code_of(r.client.put_act(&forged.encode()).await),
        code::INVALID
    );
    // Signed by a key other than the one the binding set, where the relay
    // holds the binding: invalid.
    let mut thief = alice.clone();
    thief.sign = schnorr("mallory", 0);
    let wrong = post(&mut thief, "I am alice");
    assert_eq!(
        code_of(r.client.put_act(&wrong.encode()).await),
        code::INVALID
    );
    // An act signed with a safety key that is not a rotation: invalid.
    let mut s = alice.clone();
    let mut a = post(&mut s, "signed with the safety key");
    a.signature = alice.safety.sign(&a.id(), None);
    assert_eq!(code_of(r.client.put_act(&a.encode()).await), code::INVALID);

    // A private act: the relay cannot open it and need not.
    let private = everyday(&mut alice, text_spec(), 0, vec![], None, None, false);
    r.client.put_act(&private.encode()).await.unwrap();
    // An act of a specification this relay knows nothing of (scenario 2.5).
    let unknown = everyday(
        &mut alice,
        sha256(b"a specification from the future"),
        42,
        vec![],
        None,
        None,
        true,
    );
    r.client.put_act(&unknown.encode()).await.unwrap();
    // An everyday key under a scheme this relay does not implement (scenario
    // 8.4): carried where the relay cannot tell, since it does not hold the
    // act that bound the key...
    let unknown_scheme = mor_core::act::Signature {
        scheme: mor_core::act::Scheme::Spec(sha256(b"a post-quantum everyday scheme")),
        key: vec![1; 40],
        sig: vec![2; 90],
    };
    let (_, mut dora) = genesis(
        "dora",
        vec![Home {
            operator: None,
            hint: "https://d.example".into(),
        }],
        None,
        None,
    );
    let mut odd = post(&mut dora, "signed under a new scheme");
    odd.signature = unknown_scheme.clone();
    r.client.put_act(&odd.encode()).await.unwrap();
    // ...and refused where it holds the binding, which set another key.
    let mut odd = post(&mut alice, "signed under a new scheme");
    odd.signature = unknown_scheme;
    assert_eq!(
        code_of(r.client.put_act(&odd.encode()).await),
        code::INVALID
    );
    // The good act still goes in.
    r.client.put_act(&good.encode()).await.unwrap();
}

#[tokio::test(flavor = "multi_thread")]
async fn too_large() {
    let limits = Limits {
        act: 2000,
        media: 100,
        feed: 10,
        wait: 2,
    };
    let r = Running::start_with(Role::Relay, Policy::Open, limits).await;
    let (_, mut alice) = genesis(
        "alice",
        vec![Home {
            operator: None,
            hint: "https://a.example".into(),
        }],
        None,
        None,
    );
    let big = everyday(
        &mut alice,
        text_spec(),
        0,
        vec![(Value::Uint(0), Value::Bytes(vec![7; 3000]))],
        None,
        None,
        true,
    );
    assert_eq!(
        code_of(r.client.put_act(&big.encode()).await),
        code::TOO_LARGE
    );
    assert_eq!(
        code_of(r.client.put_media(&[1; 101]).await),
        code::TOO_LARGE
    );
    // Too large even to read: still an answer of the cMIP.
    assert_eq!(
        code_of(r.client.put_media(&vec![1; 200_000]).await),
        code::TOO_LARGE
    );
    assert_eq!(
        code_of(r.client.put_act(&vec![1; 200_000]).await),
        code::TOO_LARGE
    );
    assert_eq!(r.client.info().await.unwrap().limits, limits);
}

#[tokio::test(flavor = "multi_thread")]
async fn the_feed() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let (ga, mut alice) = genesis(
        "alice",
        vec![Home {
            operator: None,
            hint: "https://a.example".into(),
        }],
        None,
        None,
    );
    let (gb, mut bob) = genesis(
        "bob",
        vec![Home {
            operator: None,
            hint: "https://b.example".into(),
        }],
        None,
        None,
    );
    for g in [&ga, &gb] {
        r.client.put_act(&g.encode()).await.unwrap();
    }
    let mut alices = vec![];
    for i in 0..5 {
        let a = post(&mut alice, &format!("alice {i}"));
        r.client.put_act(&a.encode()).await.unwrap();
        alices.push(a.encode());
        let b = post(&mut bob, &format!("bob {i}"));
        r.client.put_act(&b.encode()).await.unwrap();
    }
    // To bob, private: shows its recipient, never its content.
    let dm = everyday(
        &mut alice,
        text_spec(),
        0,
        vec![],
        None,
        Some(vec![bob.id]),
        false,
    );
    r.client.put_act(&dm.encode()).await.unwrap();

    // By signer, in arrival order, paged.
    let q = |after, limit| FeedQuery {
        filter: Filter {
            signer: Some(alice.id),
            ..Default::default()
        },
        after,
        limit,
        wait: None,
    };
    let p1 = r.client.feed(&q(None, Some(3))).await.unwrap();
    assert_eq!(p1.items.len(), 3);
    let p2 = r.client.feed(&q(Some(p1.next), Some(100))).await.unwrap();
    let all: Vec<Vec<u8>> = p1
        .items
        .iter()
        .chain(&p2.items)
        .map(|i| i.item.clone())
        .collect();
    assert_eq!(all[..5], alices[..]);
    assert_eq!(all[5], dm.encode());
    assert!(p1.items.windows(2).all(|w| w[0].arrival < w[1].arrival));
    // Nothing new: an empty page, and `next` does not go backwards.
    let p3 = r.client.feed(&q(Some(p2.next), None)).await.unwrap();
    assert!(p3.items.is_empty());
    assert!(p3.next >= p2.next);

    // By recipient.
    let to_bob = r
        .client
        .feed(&FeedQuery {
            filter: Filter {
                to: Some(bob.id),
                ..Default::default()
            },
            ..Default::default()
        })
        .await
        .unwrap();
    assert_eq!(
        to_bob
            .items
            .iter()
            .map(|i| i.item.clone())
            .collect::<Vec<_>>(),
        vec![dm.encode()]
    );

    // By spec and type: public acts only.
    let genesis_only = r
        .client
        .feed(&FeedQuery {
            filter: Filter {
                spec: Some(specs().identity),
                type_: Some(0),
                ..Default::default()
            },
            ..Default::default()
        })
        .await
        .unwrap();
    assert_eq!(genesis_only.items.len(), 2);
    let texts = r
        .client
        .feed(&FeedQuery {
            filter: Filter {
                spec: Some(text_spec()),
                ..Default::default()
            },
            ..Default::default()
        })
        .await
        .unwrap();
    assert_eq!(
        texts.items.len(),
        10,
        "the private act is invisible to a spec filter"
    );

    // No filter: everything, the way a relay is mirrored.
    let everything = r.client.feed(&FeedQuery::default()).await.unwrap();
    assert_eq!(everything.items.len(), 13);
}

#[tokio::test(flavor = "multi_thread")]
async fn a_feed_request_waits_for_what_arrives() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let (g, mut alice) = genesis(
        "alice",
        vec![Home {
            operator: None,
            hint: "https://a.example".into(),
        }],
        None,
        None,
    );
    r.client.put_act(&g.encode()).await.unwrap();
    let start = r.client.feed(&FeedQuery::default()).await.unwrap().next;
    let follower = {
        let c = r.client.clone();
        let id = alice.id;
        tokio::spawn(async move {
            c.feed(&FeedQuery {
                filter: Filter {
                    signer: Some(id),
                    ..Default::default()
                },
                after: Some(start),
                limit: None,
                wait: Some(30),
            })
            .await
            .unwrap()
        })
    };
    tokio::time::sleep(Duration::from_millis(300)).await;
    assert!(!follower.is_finished(), "nothing yet: the request waits");
    let a = post(&mut alice, "new");
    r.client.put_act(&a.encode()).await.unwrap();
    let page = tokio::time::timeout(Duration::from_secs(10), follower)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(page.items.len(), 1);
    assert_eq!(page.items[0].item, a.encode());
    // A wait with nothing arriving ends empty, at the relay's patience.
    let t = std::time::Instant::now();
    let empty = r
        .client
        .feed(&FeedQuery {
            filter: Filter {
                signer: Some(alice.id),
                ..Default::default()
            },
            after: Some(page.next),
            limit: None,
            wait: Some(1),
        })
        .await
        .unwrap();
    assert!(empty.items.is_empty());
    assert!(t.elapsed() >= Duration::from_millis(900));
}

#[tokio::test(flavor = "multi_thread")]
async fn sealed_containers_and_pickup_tags() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let bob = sha256(b"bob's identity");
    let bare_key = [9u8; 32];
    let tag = wire::pickup_tag(&sig::SCHNORR, &bare_key);
    let to_bob = Sealed {
        to: vec![bob],
        one_time_key: vec![1; 32],
        locked_act: vec![2; 100],
        sig: vec![3; 64],
    }
    .encode();
    let to_key = Sealed {
        to: vec![],
        one_time_key: vec![4; 32],
        locked_act: vec![5; 100],
        sig: vec![6; 64],
    }
    .encode();
    let other = Sealed {
        to: vec![],
        one_time_key: vec![7; 32],
        locked_act: vec![8; 100],
        sig: vec![9; 64],
    }
    .encode();
    let p = r.client.put_sealed(&to_bob, &[]).await.unwrap();
    assert_eq!(p.id, wire::sealed_id(&to_bob));
    r.client.put_sealed(&to_key, &[tag]).await.unwrap();
    r.client.put_sealed(&other, &[]).await.unwrap();
    assert_eq!(r.client.get_sealed(&p.id).await.unwrap(), to_bob);
    // Not a sealed container: malformed.
    assert_eq!(
        code_of(r.client.put_sealed(b"\x80", &[]).await),
        code::MALFORMED
    );

    let items = |f: Filter| {
        let c = r.client.clone();
        async move {
            c.feed(&FeedQuery {
                filter: f,
                ..Default::default()
            })
            .await
            .unwrap()
            .items
            .into_iter()
            .map(|i| (i.kind, i.item))
            .collect::<Vec<_>>()
        }
    };
    assert_eq!(
        items(Filter {
            to: Some(bob),
            ..Default::default()
        })
        .await,
        vec![(1, to_bob.clone())]
    );
    // By pickup tag: one small request finds the one container.
    assert_eq!(
        items(Filter {
            pickup: Some(tag),
            ..Default::default()
        })
        .await,
        vec![(1, to_key.clone())]
    );
    // By scanning: every container with no recipient, whatever its tags.
    assert_eq!(
        items(Filter {
            unaddressed: true,
            ..Default::default()
        })
        .await,
        vec![(1, to_key), (1, other)]
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn media_and_ranges() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let bytes: Vec<u8> = (0..10_000u32).map(|i| (i * 7 % 251) as u8).collect();
    let h = r.client.put_media(&bytes).await.unwrap();
    assert_eq!(h, sha256(&bytes));
    assert_eq!(r.client.get_media(&h).await.unwrap(), bytes);
    // In parts, reassembled, then checked whole.
    let mut whole = vec![];
    for (a, b) in [(0u64, 3999u64), (4000, 7999), (8000, 9999)] {
        whole.extend(r.client.get_media_range(&h, a, b).await.unwrap());
    }
    assert_eq!(sha256(&whole), h);
    assert_eq!(
        code_of(r.client.get_media(&sha256(b"none")).await),
        code::NOT_HELD
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn any_browser_may_ask() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let http = reqwest::Client::new();
    let resp = http
        .get(format!("{}/info", r.base))
        .header("origin", "https://reader.example")
        .send()
        .await
        .unwrap();
    assert_eq!(
        resp.headers().get("access-control-allow-origin").unwrap(),
        "*"
    );
    // An error answer carries it too.
    let resp = http
        .get(format!("{}/acts/zz", r.base))
        .header("origin", "https://reader.example")
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), 400);
    assert_eq!(
        resp.headers().get("access-control-allow-origin").unwrap(),
        "*"
    );
    let e = wire::WireError::decode(&resp.bytes().await.unwrap()).unwrap();
    assert_eq!(e.code, code::MALFORMED);
    // A browser's preflight for a CBOR body.
    let resp = http
        .request(reqwest::Method::OPTIONS, format!("{}/acts", r.base))
        .header("origin", "https://reader.example")
        .header("access-control-request-method", "POST")
        .header("access-control-request-headers", "content-type")
        .send()
        .await
        .unwrap();
    assert!(resp.status().is_success());
    assert_eq!(
        resp.headers().get("access-control-allow-origin").unwrap(),
        "*"
    );
    // Unknown query parameters and uppercase hashes are malformed.
    let resp = http
        .get(format!("{}/feed?since=tuesday", r.base))
        .send()
        .await
        .unwrap();
    assert_eq!(
        wire::WireError::decode(&resp.bytes().await.unwrap())
            .unwrap()
            .code,
        code::MALFORMED
    );
    let upper = wire::hex(&[0xab; 32]).to_uppercase();
    let resp = http
        .get(format!("{}/acts/{upper}", r.base))
        .send()
        .await
        .unwrap();
    assert_eq!(
        wire::WireError::decode(&resp.bytes().await.unwrap())
            .unwrap()
            .code,
        code::MALFORMED
    );
}

#[tokio::test(flavor = "multi_thread")]
async fn bundles_carry_acts_across_any_border() {
    let (g, mut alice) = genesis(
        "alice",
        vec![Home {
            operator: None,
            hint: "https://a.example".into(),
        }],
        None,
        None,
    );
    let p = post(&mut alice, "smuggled");
    let b = wire::Bundle {
        acts: vec![g.encode(), p.encode()],
        sealed: vec![],
    };
    let file = b.encode();
    let back = wire::Bundle::decode(&file).unwrap();
    assert_eq!(back, b);
    // Imported exactly as if fetched from a relay: checked, never trusted.
    let r = Running::start(Role::Relay, Policy::Open).await;
    for a in &back.acts {
        r.client.put_act(a).await.unwrap();
    }
    let mut v = mor_core::chain::Verifier::new(specs().identity);
    for a in &back.acts {
        v.add(decode(a)).unwrap();
    }
    assert_eq!(v.status(&p.id()), mor_core::chain::Status::Valid);
}
