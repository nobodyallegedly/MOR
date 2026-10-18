//! The textual forms (Identity draft 14, part three, "Written for people";
//! F349): the published vectors (`core/vectors/textual-forms.json`), and the
//! core's own bech32m checked against a second implementation, the `bech32`
//! crate, on every kind and on random data.

use mor_core::textual::{self as tf, Kind, Refusal};
use serde_json::Value as J;

fn load() -> J {
    let path = format!("{}/vectors/textual-forms.json", env!("CARGO_MANIFEST_DIR"));
    serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap()
}

fn kind(l: &str) -> Kind {
    Kind::of_label(l).unwrap()
}

#[test]
fn the_published_vectors() {
    let v = load();
    for f in v["forms"].as_array().unwrap() {
        let k = kind(f["kind"].as_str().unwrap());
        let data = hex::decode(f["data"].as_str().unwrap()).unwrap();
        assert_eq!(tf::encode(k, &data), f["form"].as_str().unwrap());
        let r = tf::read(f["form"].as_str().unwrap(), k).unwrap();
        assert_eq!(r.data, data);
        assert!(!r.bare);
    }
    for k in ["upper", "lives", "bare"] {
        let f = &v[k];
        let r = tf::read(f["form"].as_str().unwrap(), kind(f["want"].as_str().unwrap())).unwrap();
        assert_eq!(hex::encode(&r.data), f["data"].as_str().unwrap(), "{k}");
        if k == "lives" {
            let hints: Vec<String> = f["hints"].as_array().unwrap().iter().map(|h| h.as_str().unwrap().into()).collect();
            assert_eq!(r.hints, hints);
        }
        assert_eq!(r.bare, k == "bare");
    }
    for f in v["refused"].as_array().unwrap() {
        let e = tf::read(f["form"].as_str().unwrap(), kind(f["want"].as_str().unwrap())).unwrap_err();
        let why = match &e {
            Refusal::Checksum => "checksum".to_string(),
            Refusal::MixedCase => "mixed case".into(),
            Refusal::UnknownLabel(_) => "unknown label".into(),
            Refusal::WrongKind { got, wanted } => format!("wrong kind: {} where {} is wanted", got.label(), wanted.label()),
            other => format!("{other:?}"),
        };
        assert_eq!(why, f["why"].as_str().unwrap());
        assert!(!e.to_string().is_empty(), "said in words");
    }
}

#[test]
fn an_act_where_an_identity_is_wanted_is_refused_naming_both() {
    let act = tf::encode(Kind::Act, &[7; 32]);
    let e = tf::read(&act, Kind::Identity).unwrap_err();
    assert_eq!(e.to_string(), "this is an act (mact), not an identity (mid)");
}

#[test]
fn the_same_as_a_second_bech32m() {
    use bech32::{Bech32m, Hrp};
    let mut seed = 0x5eed_u64;
    let mut next = || {
        seed ^= seed << 13;
        seed ^= seed >> 7;
        seed ^= seed << 17;
        (seed & 0xff) as u8
    };
    for k in Kind::ALL {
        for _ in 0..50 {
            let data: Vec<u8> = (0..32).map(|_| next()).collect();
            let ours = tf::encode(k, &data);
            let theirs = bech32::encode::<Bech32m>(Hrp::parse(k.label()).unwrap(), &data).unwrap();
            assert_eq!(ours, theirs);
            let (hrp, back) = bech32::decode(&ours).unwrap();
            assert_eq!(hrp.as_str(), k.label());
            assert_eq!(back, data);
        }
    }
    // A key's data, [scheme, key] in deterministic CBOR, at its own length.
    use mor_core::cbor::{encode, Value};
    let key = encode(&Value::Array(vec![Value::Uint(1), Value::Bytes(vec![9; 32])]));
    assert_eq!(tf::encode(Kind::Key, &key), bech32::encode::<Bech32m>(Hrp::parse("mkey").unwrap(), &key).unwrap());
    assert_eq!(tf::read(&tf::encode(Kind::Key, &key), Kind::Key).unwrap().data, key);
}

#[test]
fn every_single_character_mistyped_is_refused() {
    let s = tf::encode(Kind::Identity, &[42; 32]);
    let b = s.as_bytes();
    for i in 0..b.len() {
        for c in b"qpzry9x8gf2tvdw0s3jn54khce6mua7l" {
            if b[i] == *c {
                continue;
            }
            let mut t = b.to_vec();
            t[i] = *c;
            let t = String::from_utf8(t).unwrap();
            assert!(tf::read(&t, Kind::Identity).is_err(), "{t}");
        }
    }
    // And every cut.
    for n in 1..s.len() {
        assert!(tf::read(&s[..s.len() - n], Kind::Identity).is_err());
    }
}
