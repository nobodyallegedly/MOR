//! A reference naming its act's signer (Envelopes draft 9, rule 20 and
//! field 8; F272).
//!
//! `ref = hash / [ act: hash, signer: hash ] / [ address: tstr, ? hash ]`:
//! the two array forms are told apart by their first element's type. The
//! signer is where to look, never a validity rule: a missing signer never
//! makes an act invalid, and a wrong one shows only when the reference is
//! followed, since the act fetched shows its own signer. Every reference
//! written before, and every published vector, stays valid byte for byte.

mod common;

use common::{identity_spec, own_home, World};
use mor_core::act::{self, followed, Act, ActError, FollowError, Inside, Ref};
use mor_core::cbor::{self, Value};
use mor_core::chain::Status;
use mor_core::envelopes::{Route, Routes, Version};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::{types, Home};

fn text_spec() -> Hash {
    sha256(b"a text specification")
}

fn inside_with(refs: Vec<Ref>) -> Inside {
    Inside {
        spec: text_spec(),
        type_: 0,
        prev: Some(vec![]),
        objects: None,
        payload: vec![(Value::Uint(0), Value::Text("hi".into()))],
        position: Some(1),
        summary: Some([0; 32]),
        acks: None,
        refs: Some(refs),
        hint: None,
        salt: [7; 16],
    }
}

/// The inside's key 8 exactly as encoded, and decoded back.
fn round_trip(refs: Vec<Ref>) -> (Vec<u8>, Result<Inside, ActError>) {
    let i = inside_with(refs);
    let bytes = cbor::encode(&act::refs_value(i.refs.as_ref().unwrap()));
    let back = Inside::decode(&i.encode());
    (bytes, back)
}

#[test]
fn the_signed_form_is_an_array_of_two_hashes_and_round_trips() {
    let (a, s) = (sha256(b"post"), sha256(b"author"));
    let r = Ref::Signed { act: a, signer: s };
    let (bytes, back) = round_trip(vec![r.clone()]);
    // [ [ h'..', h'..' ] ]: an array of one array of two 32-byte strings.
    let mut want = vec![0x81, 0x82, 0x58, 0x20];
    want.extend_from_slice(&a);
    want.extend_from_slice(&[0x58, 0x20]);
    want.extend_from_slice(&s);
    assert_eq!(bytes, want);
    assert_eq!(back.unwrap().refs, Some(vec![r.clone()]));
    assert_eq!(r.act(), Some(a));
    assert_eq!(r.signer(), Some(s));
}

#[test]
fn the_three_forms_stand_side_by_side_and_old_forms_keep_their_bytes() {
    let a = sha256(b"a");
    let refs = vec![
        Ref::Act(a),
        Ref::Signed { act: sha256(b"b"), signer: sha256(b"c") },
        Ref::Web { address: "https://example.org/".into(), hash: None },
        Ref::Web { address: "https://example.org/x".into(), hash: Some(sha256(b"x")) },
    ];
    let (_, back) = round_trip(refs.clone());
    assert_eq!(back.unwrap().refs, Some(refs));
    // A bare act id and a web reference encode as they always did.
    assert_eq!(cbor::encode(&act::refs_value(&[Ref::Act(a)]))[..3], [0x81, 0x58, 0x20]);
    let web = cbor::encode(&act::refs_value(&[Ref::Web { address: "a".into(), hash: None }]));
    assert_eq!(web, vec![0x81, 0x81, 0x61, b'a']);
    assert_eq!(Ref::Web { address: "a".into(), hash: None }.act(), None);
}

/// Shapes that are neither form stay invalid, as before: the first element
/// decides, and nothing is guessed.
#[test]
fn shapes_that_are_neither_form_are_refused() {
    let h = || Value::Bytes(sha256(b"h").to_vec());
    let bad = [
        Value::Array(vec![h()]),                                         // one hash alone
        Value::Array(vec![h(), h(), h()]),                               // three hashes
        Value::Array(vec![h(), Value::Text("x".into())]),                // a signer that is no hash
        Value::Array(vec![Value::Bytes(vec![1; 31]), h()]),              // an act id of 31 bytes
        Value::Array(vec![h(), Value::Bytes(vec![1; 33])]),              // a signer of 33 bytes
        Value::Array(vec![Value::Text("https://x".into()), Value::Text("y".into())]), // a web hash that is no hash
    ];
    for b in bad {
        let mut m = match cbor::decode(&inside_with(vec![]).encode()).unwrap() {
            Value::Map(m) => m,
            _ => unreachable!(),
        };
        for (k, v) in m.iter_mut() {
            if *k == Value::Uint(8) {
                *v = Value::Array(vec![b.clone()]);
            }
        }
        let bytes = cbor::encode(&Value::Map(m));
        assert!(matches!(Inside::decode(&bytes), Err(ActError::Shape(_))), "{b:?}");
    }
}

/// The published three-act vector names an act in `refs` in the old form:
/// it decodes as before and encodes back to the same bytes.
#[test]
fn the_published_vector_with_a_reference_is_unchanged() {
    let v: serde_like::Json = serde_like::parse(include_str!("../vectors/sequence-three-acts.json"));
    let mut seen = 0;
    for act in v.acts() {
        let inside = Inside::decode(&act.inside).unwrap();
        assert_eq!(inside.encode(), act.inside, "the inside re-encodes byte for byte");
        if let Some(refs) = &inside.refs {
            seen += 1;
            assert!(refs.iter().all(|r| matches!(r, Ref::Act(_))));
        }
    }
    assert_eq!(seen, 1, "the vector's second act names the first");
}

/// F272: validity is untouched. A post by Ana; replies by Ben naming it with
/// no signer, with Ana as signer, and with Carla, a wrong signer: all three
/// replies are valid. Followed, the wrong one fails, since the act fetched
/// shows its own signer; the act and the reply both stand.
#[test]
fn a_named_signer_never_decides_validity_and_a_wrong_one_fails_when_followed() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let carla = w.genesis("carla", vec![own_home()], None, None);
    let post = w.everyday_act(&mut ana, text_spec(), 0, vec![(Value::Uint(0), Value::Text("a post".into()))], None, None);
    let post_id = w.add(&post);
    let reply = |w: &mut World, ben: &mut common::Person, r: Ref| {
        let a = w.everyday_act_refs(ben, text_spec(), 0, vec![(Value::Uint(0), Value::Text("a reply".into()))], None, None, Some(vec![r]));
        w.add(&a)
    };
    let bare = Ref::Act(post_id);
    let right = Ref::Signed { act: post_id, signer: ana.id };
    let wrong = Ref::Signed { act: post_id, signer: carla.id };
    for r in [&bare, &right, &wrong] {
        let id = reply(&mut w, &mut ben, r.clone());
        assert_eq!(w.v.status(&id), Status::Valid, "{r:?}");
    }
    assert_eq!(followed(&bare, &post), Ok(()));
    assert_eq!(followed(&right, &post), Ok(()));
    assert_eq!(followed(&wrong, &post), Err(FollowError::OtherSigner { named: carla.id, actual: ana.id }));
    assert_eq!(w.v.status(&post_id), Status::Valid);
    // Another act fetched under the id asked: refused before any signer.
    let other = w.everyday_act(&mut ana, text_spec(), 0, vec![(Value::Uint(0), Value::Text("other".into()))], None, None);
    assert_eq!(followed(&right, &other), Err(FollowError::OtherAct));
    assert_eq!(followed(&Ref::Web { address: "https://x".into(), hash: None }, &post), Err(FollowError::NotAnAct));
}

/// A genesis is signed by the identity it makes: its signer is its own id.
#[test]
fn a_reference_to_a_genesis_names_the_identity_itself() {
    let mut w = World::new();
    let ana = w.genesis("ana", vec![own_home()], None, None);
    let g: &Act = &w.log[0].0;
    assert_eq!(g.id(), ana.id);
    assert_eq!(followed(&Ref::Signed { act: ana.id, signer: ana.id }, g), Ok(()));
}

/// Where to look for the act a reference names, from its signer: the
/// outbox routes that count, general first, then scoped ones, then the
/// homes in force at the signer's latest position; inbox routes never.
#[test]
fn places_follow_the_signers_routes_then_its_homes() {
    let mut w = World::new();
    let homes = vec![
        Home { operator: None, hint: "https://home-a.example/".into() },
        Home { operator: None, hint: "https://home-b.example".into() },
    ];
    let mut ana = w.genesis("ana", homes, None, None);
    assert_eq!(w.v.places(&ana.id), vec!["https://home-a.example", "https://home-b.example"]);
    let routes = Routes {
        version: Version { version: 1, previous: None },
        routes: vec![
            Route { scope: Some(text_spec()), hints: vec!["https://texts.example".into()], kind: 0 },
            Route { scope: None, hints: vec!["https://inbox.example".into()], kind: 1 },
            Route { scope: None, hints: vec!["https://all.example".into(), "https://home-b.example".into()], kind: 0 },
        ],
    };
    let a = w.everyday_act(&mut ana, identity_spec(), types::ROUTES, routes.to_map(), None, None);
    w.add(&a);
    assert_eq!(
        w.v.places(&ana.id),
        vec!["https://all.example", "https://home-b.example", "https://texts.example", "https://home-a.example"]
    );
    // An identity this verifier has not looked up: nowhere to look.
    assert!(w.v.places(&sha256(b"stranger")).is_empty());
}

/// Just enough JSON for the vector file: each act's inside, as hex.
mod serde_like {
    pub struct Json(String);
    pub struct VAct {
        pub inside: Vec<u8>,
    }
    pub fn parse(s: &str) -> Json {
        Json(s.to_string())
    }
    impl Json {
        pub fn acts(&self) -> Vec<VAct> {
            let mut out = vec![];
            let mut rest = self.0.as_str();
            while let Some(i) = rest.find("\"inside\"") {
                rest = &rest[i + 8..];
                let q = rest.find('"').unwrap();
                let r = &rest[q + 1..];
                let e = r.find('"').unwrap();
                let hex = &r[..e];
                rest = &r[e..];
                if hex.len() % 2 == 0 && hex.chars().all(|c| c.is_ascii_hexdigit()) && !hex.is_empty() {
                    out.push(VAct { inside: (0..hex.len()).step_by(2).map(|k| u8::from_str_radix(&hex[k..k + 2], 16).unwrap()).collect() });
                }
            }
            out
        }
    }
}
