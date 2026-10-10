//! Encryption keys, key deliveries and sealed containers (Envelopes draft 6;
//! F98, F99). Every X-Wing exchange a container makes or opens here is
//! checked against the second implementation (libcrux).

mod xwing2;

use mor_core::act::{self, Act, Addressing, Inside};
use mor_core::cbor::Value;
use mor_core::envelopes::{
    self, latest, open, seal, types, Contents, DecKey, EncKey, EncryptionKey, EnvError,
    KeyDelivery, Latest, Recipient, Route, Routes, SealRandom, Sealed, Version, XWING,
};
use mor_core::hash::{sha256, Hash};
use mor_core::sig::SchnorrKey;

fn envelopes_spec() -> Hash {
    sha256(b"ENVELOPE, test value until the freeze")
}

fn h(s: &str) -> [u8; 32] {
    sha256(s.as_bytes())
}

fn h64(s: &str) -> [u8; 64] {
    [h(&format!("{s}/a")), h(&format!("{s}/b"))]
        .concat()
        .try_into()
        .unwrap()
}

/// A recipient's X-Wing key, its public half checked by both implementations.
fn deckey(name: &str) -> DecKey {
    let secret = h(&format!("{name}/xwing"));
    let dk = DecKey::from_secret(secret);
    assert_eq!(dk.public.key, xwing2::checked_public_key(&secret));
    dk
}

struct Signer {
    id: Hash,
    binding: Hash,
    key: SchnorrKey,
}

fn signer(name: &str) -> Signer {
    Signer {
        id: h(&format!("{name}/id")),
        binding: h(&format!("{name}/binding")),
        key: SchnorrKey::from_secret(&h(&format!("{name}/sign"))).unwrap(),
    }
}

fn inside(type_: u64, payload: Vec<(Value, Value)>, salt: &str) -> Inside {
    Inside {
        spec: envelopes_spec(),
        type_,
        prev: Some(vec![]),
        objects: None,
        payload,
        position: Some(1),
        summary: Some([0; 32]),
        acks: None,
        refs: None,
        hint: None,
        salt: h(salt)[..16].try_into().unwrap(),
    }
}

/// An act by `s`, with content key `key`, public or private, addressed to `to`.
fn make(s: &Signer, i: &Inside, key: &[u8; 32], public: bool, to: Option<Vec<Hash>>) -> Act {
    act::make(
        i,
        key,
        &h("nonce")[..24].try_into().unwrap(),
        &Addressing {
            signer: Some(s.id),
            binding: Some(s.binding),
            public,
            to,
        },
        |id| s.key.sign(id, &[0; 32]),
    )
}

fn rnd(label: &str, n: usize) -> SealRandom {
    SealRandom {
        container_key: h(&format!("{label}/container")),
        nonce: h(&format!("{label}/nonce"))[..24].try_into().unwrap(),
        eseeds: (0..n).map(|i| h64(&format!("{label}/eseed/{i}"))).collect(),
        one_time_secret: h(&format!("{label}/otk")),
        aux: [0; 32],
    }
}

/// Every capsule of a container, re-made by the second implementation from
/// the same eseed: both must give the same ciphertext.
fn second_check_capsules(s: &Sealed, keys: &[&EncKey], r: &SealRandom) {
    let (capsules, _, _) = s.parts().unwrap();
    assert_eq!(capsules.len(), keys.len());
    for ((c, k), e) in capsules.iter().zip(keys).zip(&r.eseeds) {
        let (_, ct) = xwing2::checked_encapsulate(&k.key, e).unwrap();
        assert_eq!(c.ct, ct);
    }
}

/// Open as `me`, with the second implementation checking the decapsulation.
fn checked_open(s: &Sealed, me: Option<&Hash>, dk: &DecKey) -> Result<envelopes::Opened, EnvError> {
    let (capsules, _, _) = s.parts().unwrap();
    let i = match me {
        Some(id) => s.to.iter().position(|t| t == id),
        None => Some(0),
    };
    if let Some(i) = i {
        xwing2::checked_decapsulate(&dk.secret, &capsules[i].ct);
    }
    open(s, me, dk)
}

// ---------------------------------------------------------------- encryption keys

#[test]
fn an_encryption_key_payload_round_trips_strictly() {
    let dk = deckey("bob");
    let e = EncryptionKey {
        version: Version {
            version: 1,
            previous: None,
        },
        key: dk.public.clone(),
    };
    let m = e.to_map();
    assert_eq!(EncryptionKey::decode(&m).unwrap(), e);
    // Version 2 names its predecessor; version 1 names none.
    let e2 = EncryptionKey {
        version: Version {
            version: 2,
            previous: Some(h("v1")),
        },
        key: dk.public.clone(),
    };
    assert_eq!(EncryptionKey::decode(&e2.to_map()).unwrap(), e2);
    for bad in [(1, Some(h("x"))), (2, None), (0, None)] {
        let mut m = Vec::new();
        m.push((Value::Uint(0), Value::Uint(bad.0)));
        if let Some(p) = bad.1 {
            m.push((Value::Uint(1), Value::Bytes(p.to_vec())));
        }
        m.push((Value::Uint(2), dk.public.to_value()));
        assert!(EncryptionKey::decode(&m).is_err(), "{bad:?}");
    }
    // An unknown key in the map, a short X-Wing key, a signature scheme.
    let mut extra = m.clone();
    extra.push((Value::Uint(3), Value::Null));
    assert!(EncryptionKey::decode(&extra).is_err());
    let short = vec![
        (Value::Uint(0), Value::Uint(1)),
        (
            Value::Uint(2),
            Value::Array(vec![Value::Uint(4), Value::Bytes(vec![0; 1215])]),
        ),
    ];
    assert!(EncryptionKey::decode(&short).is_err());
    let schnorr = vec![
        (Value::Uint(0), Value::Uint(1)),
        (
            Value::Uint(2),
            Value::Array(vec![Value::Uint(1), Value::Bytes(vec![0; 32])]),
        ),
    ];
    assert!(EncryptionKey::decode(&schnorr).is_err());
    // A scheme named by specification hash decodes; this library cannot seal to it.
    let spec = EncKey::from_value(&Value::Array(vec![
        Value::Bytes(h("some kem spec").to_vec()),
        Value::Bytes(vec![1, 2, 3]),
    ]))
    .unwrap();
    assert_ne!(spec.scheme, XWING);
    let a = make(
        &signer("alice"),
        &inside(0, vec![], "s"),
        &h("k"),
        false,
        Some(vec![h("x")]),
    );
    assert!(matches!(
        seal(&a, Some(&h("k")), &[Recipient::Bare(spec)], &rnd("spec", 1)),
        Err(EnvError::UnknownScheme)
    ));
}

#[test]
fn routes_decode_and_find_the_inbox() {
    let scope = h("TEXT spec");
    let r = Routes {
        version: Version {
            version: 1,
            previous: None,
        },
        routes: vec![
            Route {
                scope: None,
                hints: vec!["https://out.example".into()],
                kind: 0,
            },
            Route {
                scope: None,
                hints: vec!["https://inbox.example".into()],
                kind: 1,
            },
            Route {
                scope: Some(scope),
                hints: vec!["https://text-inbox.example".into()],
                kind: 1,
            },
        ],
    };
    let back = Routes::decode(&r.to_map()).unwrap();
    assert_eq!(back, r);
    assert_eq!(
        back.inbox(&scope).unwrap().hints[0],
        "https://text-inbox.example"
    );
    assert_eq!(
        back.inbox(&h("other")).unwrap().hints[0],
        "https://inbox.example"
    );
    // The default kind is written as absent: an explicit 0 is refused.
    let explicit = vec![
        (Value::Uint(0), Value::Uint(1)),
        (
            Value::Uint(2),
            Value::Array(vec![Value::Array(vec![
                Value::Null,
                Value::Array(vec![Value::Text("https://x".into())]),
                Value::Uint(0),
            ])]),
        ),
    ];
    assert!(Routes::decode(&explicit).is_err());
}

#[test]
fn which_version_counts() {
    let v = |n, p: Option<&str>| Version {
        version: n,
        previous: p.map(h),
    };
    let chain = [
        (h("a"), v(1, None)),
        (h("b"), v(2, Some("a"))),
        (h("c"), v(3, Some("b"))),
    ];
    assert_eq!(
        latest(&chain),
        Latest {
            act: Some(h("c")),
            contested: false
        }
    );
    // A jump ahead does not count: version 5 naming b.
    let jump = [chain[0], chain[1], (h("x"), v(5, Some("b")))];
    assert_eq!(latest(&jump).act, Some(h("b")));
    // Two acts naming b: contested from there; b counts.
    let fork = [chain[0], chain[1], chain[2], (h("d"), v(3, Some("b")))];
    assert_eq!(
        latest(&fork),
        Latest {
            act: Some(h("b")),
            contested: true
        }
    );
    // No version 1: nothing counts.
    assert_eq!(latest(&chain[1..]).act, None);
    assert_eq!(latest(&[]).act, None);
}

// ---------------------------------------------------------------- sealed containers

#[test]
fn a_private_message_to_an_identity_opens_only_for_it() {
    let alice = signer("alice");
    let bob = h("bob/id");
    let bob_key = deckey("bob");
    let msg_key = h("message key");
    let msg = make(
        &alice,
        &inside(7, vec![(Value::Uint(0), Value::Text("hi".into()))], "m"),
        &msg_key,
        false,
        Some(vec![bob]),
    );
    let r = rnd("dm", 1);
    let s = seal(
        &msg,
        Some(&msg_key),
        &[Recipient::Identity {
            id: bob,
            key: bob_key.public.clone(),
        }],
        &r,
    )
    .unwrap();
    second_check_capsules(&s, &[&bob_key.public], &r);

    // What a relay sees: the recipient, and opaque bytes. Never the signer.
    let bytes = s.encode();
    let back = Sealed::decode(&bytes).unwrap();
    assert_eq!(back, s);
    assert_eq!(back.to, vec![bob]);
    let alice_id = alice.id;
    assert!(
        !bytes.windows(32).any(|w| w == alice_id),
        "the sender is hidden"
    );

    let o = checked_open(&back, Some(&bob), &bob_key).unwrap();
    assert_eq!(o.act, msg);
    assert_eq!(o.key, Some(msg_key));
    assert_eq!(
        o.inside.payload,
        vec![(Value::Uint(0), Value::Text("hi".into()))]
    );
    assert_eq!(o.act.outside.signer, Some(alice.id));

    // Anyone else's key recovers a different secret, and the container stays shut.
    let carol_key = deckey("carol");
    assert_eq!(
        checked_open(&back, Some(&bob), &carol_key).unwrap_err(),
        EnvError::NotForUs
    );
    // Bob's key under another name: not in `to`.
    assert_eq!(
        checked_open(&back, Some(&h("carol/id")), &bob_key).unwrap_err(),
        EnvError::NotForUs
    );
    // A bare-key reading of an addressed container.
    assert_eq!(open(&back, None, &bob_key).unwrap_err(), EnvError::NotForUs);
}

#[test]
fn a_tampered_container_is_refused() {
    let alice = signer("alice");
    let bob = h("bob/id");
    let bob_key = deckey("bob");
    let k = h("k");
    let msg = make(&alice, &inside(7, vec![], "t"), &k, false, Some(vec![bob]));
    let s = seal(
        &msg,
        Some(&k),
        &[Recipient::Identity {
            id: bob,
            key: bob_key.public.clone(),
        }],
        &rnd("t", 1),
    )
    .unwrap();
    // A relay re-addressing it breaks the one-time signature.
    let mut readdressed = s.clone();
    readdressed.to = vec![h("mallory")];
    assert_eq!(
        open(&readdressed, Some(&h("mallory")), &bob_key).unwrap_err(),
        EnvError::Signature
    );
    // A flipped byte in the locked part, likewise.
    let mut flipped = s.clone();
    let n = flipped.locked_act.len();
    flipped.locked_act[n - 5] ^= 1;
    assert_eq!(
        open(&flipped, Some(&bob), &bob_key).unwrap_err(),
        EnvError::Signature
    );
    // Re-signed by the tamperer with a fresh one-time key: the signature
    // holds, the contents do not open.
    let mut t = rnd("t", 1);
    t.one_time_secret = h("mallory otk");
    let mallory = SchnorrKey::from_secret(&t.one_time_secret).unwrap();
    let mut resigned = flipped.clone();
    resigned.one_time_key = mallory.public();
    let sh = {
        let v = Value::Array(vec![
            Value::Array(
                resigned
                    .to
                    .iter()
                    .map(|x| Value::Bytes(x.to_vec()))
                    .collect(),
            ),
            Value::Bytes(resigned.one_time_key.to_vec()),
            Value::Bytes(resigned.locked_act.clone()),
        ]);
        mor_core::hash::tagged_hash("MOR/sealed", &mor_core::cbor::encode(&v))
    };
    resigned.sig = mallory.sign(&sh, &[0; 32]).sig.try_into().unwrap();
    assert!(resigned.check_signature().is_ok());
    assert!(open(&resigned, Some(&bob), &bob_key).is_err());
}

#[test]
fn a_key_delivered_to_an_identity_opens_the_act_it_names() {
    let alice = signer("alice");
    let bob = h("bob/id");
    let bob_key = deckey("bob");

    // A private act Bob already holds but cannot open (say, a post he bought).
    let post_key = h("post key");
    let post = make(
        &alice,
        &inside(
            9,
            vec![(Value::Uint(0), Value::Text("the post".into()))],
            "p",
        ),
        &post_key,
        false,
        None,
    );
    assert!(post.open(None).is_err());

    // The key delivery: private, addressed to Bob, in a sealed container.
    let d = KeyDelivery {
        target: post.id(),
        key: post_key,
        media: false,
    };
    let dkey = h("delivery key");
    let delivery = make(
        &alice,
        &inside(types::KEY_DELIVERY, d.to_map(), "d"),
        &dkey,
        false,
        Some(vec![bob]),
    );
    let r = rnd("kd", 1);
    let s = seal(
        &delivery,
        Some(&dkey),
        &[Recipient::Identity {
            id: bob,
            key: bob_key.public.clone(),
        }],
        &r,
    )
    .unwrap();
    second_check_capsules(&s, &[&bob_key.public], &r);

    let o = checked_open(&s, Some(&bob), &bob_key).unwrap();
    assert_eq!(o.inside.type_, types::KEY_DELIVERY);
    let got = KeyDelivery::decode(&o.inside.payload).unwrap();
    assert_eq!(got, d);
    assert_eq!(got.target, post.id());
    let opened = got.opens(&post).unwrap();
    assert_eq!(
        opened.payload,
        vec![(Value::Uint(0), Value::Text("the post".into()))]
    );

    // A delivery naming the wrong key opens nothing.
    let wrong = KeyDelivery {
        key: h("wrong"),
        ..d
    };
    assert!(wrong.opens(&post).is_err());
    // Nobody else opens the delivery.
    assert!(checked_open(&s, Some(&bob), &deckey("eve")).is_err());
}

#[test]
fn a_key_delivered_to_a_bare_key_carries_no_recipient() {
    let seller = signer("journalist");
    let buyer = deckey("anonymous buyer, fresh key for this purchase");
    let media_key = h("media key");
    let publication = make(
        &seller,
        &inside(types::PUBLICATION, vec![], "pub"),
        &h("pub key"),
        true,
        None,
    );
    let d = KeyDelivery {
        target: publication.id(),
        key: media_key,
        media: true,
    };
    let dkey = h("bare delivery key");
    let delivery = make(
        &seller,
        &inside(types::KEY_DELIVERY, d.to_map(), "bd"),
        &dkey,
        false,
        None,
    );
    let r = rnd("bare", 1);
    let s = seal(
        &delivery,
        Some(&dkey),
        &[Recipient::Bare(buyer.public.clone())],
        &r,
    )
    .unwrap();
    second_check_capsules(&s, &[&buyer.public], &r);
    assert!(s.to.is_empty(), "a relay sees no recipient");
    // The pickup tag the seller gives the relay, and the buyer asks for.
    let tag = buyer.public.pickup_tag();
    let mut pre = vec![4u8];
    pre.extend_from_slice(&buyer.public.key);
    assert_eq!(
        tag,
        mor_core::hash::tagged_hash("MOR/transport/pickup", &pre)
    );

    let o = checked_open(&s, None, &buyer).unwrap();
    let got = KeyDelivery::decode(&o.inside.payload).unwrap();
    assert!(got.media);
    assert_eq!(got.key, media_key);
    // Only the buyer's bare key opens it.
    assert!(checked_open(&s, None, &deckey("someone else")).is_err());

    // An act addressed to an identity cannot go to a bare key (rule 10),
    // and a bare key is the only recipient of its container.
    let addressed = make(
        &seller,
        &inside(types::KEY_DELIVERY, d.to_map(), "bd2"),
        &dkey,
        false,
        Some(vec![h("x")]),
    );
    let s2 = seal(
        &addressed,
        Some(&dkey),
        &[Recipient::Bare(buyer.public.clone())],
        &rnd("bare2", 1),
    )
    .unwrap();
    assert!(matches!(
        open(&s2, None, &buyer),
        Err(EnvError::Addressing(_))
    ));
    assert!(seal(
        &delivery,
        Some(&dkey),
        &[
            Recipient::Bare(buyer.public.clone()),
            Recipient::Bare(buyer.public.clone())
        ],
        &rnd("bare3", 2)
    )
    .is_err());
}

#[test]
fn one_container_for_several_recipients() {
    let alice = signer("alice");
    let names = ["bob", "carol", "dave"];
    let keys: Vec<DecKey> = names.iter().map(|n| deckey(n)).collect();
    let ids: Vec<Hash> = names.iter().map(|n| h(&format!("{n}/id"))).collect();
    let k = h("group message key");
    let msg = make(
        &alice,
        &inside(7, vec![], "g"),
        &k,
        false,
        Some(ids.clone()),
    );
    let recipients: Vec<Recipient> = ids
        .iter()
        .zip(&keys)
        .map(|(id, dk)| Recipient::Identity {
            id: *id,
            key: dk.public.clone(),
        })
        .collect();
    let r = rnd("group", 3);
    let s = seal(&msg, Some(&k), &recipients, &r).unwrap();
    second_check_capsules(&s, &keys.iter().map(|d| &d.public).collect::<Vec<_>>(), &r);
    assert_eq!(s.to, ids);
    for (id, dk) in ids.iter().zip(&keys) {
        assert_eq!(checked_open(&s, Some(id), dk).unwrap().act, msg);
    }
    // Carol's key at Bob's place in `to` does not open.
    assert!(checked_open(&s, Some(&ids[0]), &keys[1]).is_err());
    // An inner act not addressed to one of them is refused for that one.
    let only_bob = make(
        &alice,
        &inside(7, vec![], "g2"),
        &k,
        false,
        Some(vec![ids[0]]),
    );
    let s2 = seal(&only_bob, Some(&k), &recipients, &rnd("group2", 3)).unwrap();
    assert!(checked_open(&s2, Some(&ids[0]), &keys[0]).is_ok());
    assert!(matches!(
        checked_open(&s2, Some(&ids[1]), &keys[1]),
        Err(EnvError::Addressing(_))
    ));
}

#[test]
fn going_public_later_is_one_public_key_delivery() {
    let alice = signer("alice");
    let secret_key = h("embargoed key");
    let embargoed = make(
        &alice,
        &inside(9, vec![(Value::Uint(0), Value::Text("news".into()))], "e"),
        &secret_key,
        false,
        None,
    );
    let d = KeyDelivery {
        target: embargoed.id(),
        key: secret_key,
        media: false,
    };
    // Public, addressed to no one, published like any act: no container.
    let release = make(
        &alice,
        &inside(types::KEY_DELIVERY, d.to_map(), "r"),
        &h("release key"),
        true,
        None,
    );
    let i = release.open(None).unwrap();
    let got = KeyDelivery::decode(&i.payload).unwrap();
    assert!(got.opens(&embargoed).is_ok());
}

#[test]
fn contents_and_key_delivery_formats_are_strict() {
    let c = Contents {
        act: vec![1, 2, 3],
        key: Some(h("k")),
    };
    assert_eq!(Contents::decode(&c.encode()).unwrap(), c);
    let d = KeyDelivery {
        target: h("t"),
        key: h("k"),
        media: false,
    };
    assert_eq!(KeyDelivery::decode(&d.to_map()).unwrap(), d);
    let mut m = d.to_map();
    m.push((Value::Uint(2), Value::Bool(false)));
    assert!(
        KeyDelivery::decode(&m).is_err(),
        "media is written only as true"
    );
    let mut short = d.to_map();
    short[1].1 = Value::Bytes(vec![0; 31]);
    assert!(KeyDelivery::decode(&short).is_err());
}

#[test]
fn every_key_exchange_here_was_checked_twice() {
    // Runs with the others in one process; a key exchange made by the
    // library in these tests is always re-made by the second implementation.
    a_key_delivered_to_an_identity_opens_the_act_it_names();
    assert!(xwing2::CHECKED.load(std::sync::atomic::Ordering::Relaxed) > 0);
}
