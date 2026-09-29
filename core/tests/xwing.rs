//! X-Wing (F98): the draft's own test vectors, and every key exchange
//! checked against a second, independent implementation (libcrux).

mod xwing2;

use mor_core::hash::sha256;
use mor_core::xwing::{self, XWingError};
use xwing2::{checked_decapsulate, checked_encapsulate, checked_public_key};

fn h(s: &str) -> Vec<u8> {
    hex::decode(s).unwrap()
}

/// draft-connolly-cfrg-xwing-kem-11, `spec/test-vectors.json`.
#[test]
fn the_drafts_test_vectors() {
    let v: serde_json::Value =
        serde_json::from_str(include_str!("data/xwing-draft-11.json")).unwrap();
    let v = v.as_array().unwrap();
    assert_eq!(v.len(), 3);
    for t in v {
        let s = |k: &str| h(t[k].as_str().unwrap());
        let sk: [u8; 32] = s("sk").try_into().unwrap();
        assert_eq!(s("seed"), sk.to_vec());
        let eseed: [u8; 64] = s("eseed").try_into().unwrap();
        let pk = checked_public_key(&sk);
        assert_eq!(pk, s("pk"));
        let (ss, ct) = checked_encapsulate(&pk, &eseed).unwrap();
        assert_eq!(ct, s("ct"));
        assert_eq!(ss.to_vec(), s("ss"));
        assert_eq!(checked_decapsulate(&sk, &ct).unwrap(), ss);
    }
}

fn key(n: u32) -> [u8; 32] {
    sha256(format!("xwing key {n}").as_bytes())
}

fn eseed(n: u32) -> [u8; 64] {
    let a = sha256(format!("xwing eseed {n}/a").as_bytes());
    let b = sha256(format!("xwing eseed {n}/b").as_bytes());
    [a, b].concat().try_into().unwrap()
}

/// Many keys and exchanges, both implementations agreeing on each.
#[test]
fn both_implementations_agree_on_many_exchanges() {
    for n in 0..40 {
        let sk = key(n);
        let pk = checked_public_key(&sk);
        assert_eq!(pk.len(), xwing::PUBLIC_LEN);
        let (ss, ct) = checked_encapsulate(&pk, &eseed(n)).unwrap();
        assert_eq!(ct.len(), xwing::CIPHERTEXT_LEN);
        assert_eq!(checked_decapsulate(&sk, &ct), Some(ss));
    }
}

/// A key delivered to one key opens only with that key: another private
/// key recovers a different secret (ML-KEM's implicit rejection), in both
/// implementations alike.
#[test]
fn only_the_right_key_recovers_the_secret() {
    let pk = checked_public_key(&key(1));
    let (ss, ct) = checked_encapsulate(&pk, &eseed(1)).unwrap();
    for other in 2..6 {
        let wrong = checked_decapsulate(&key(other), &ct).unwrap();
        assert_ne!(wrong, ss);
    }
    // Each half matters: a ciphertext with either half altered gives another secret.
    for i in [0usize, 500, 1087, 1088, 1119] {
        let mut bad = ct.clone();
        bad[i] ^= 1;
        let got = checked_decapsulate(&key(1), &bad).unwrap();
        assert_ne!(got, ss, "flipping byte {i}");
    }
}

#[test]
fn wrong_lengths_and_bad_public_keys_are_refused() {
    let pk = checked_public_key(&key(3));
    assert_eq!(
        xwing::encapsulate(&pk[..1215], &eseed(3)),
        Err(XWingError::Length)
    );
    assert_eq!(
        xwing::decapsulate(&key(3), &[0u8; 1119]),
        Err(XWingError::Length)
    );
    // An ML-KEM half whose coefficients are not reduced fails FIPS 203's check,
    // in both implementations.
    let mut bad = pk.clone();
    bad[0] = 0xff;
    bad[1] = 0xff;
    assert_eq!(checked_encapsulate(&bad, &eseed(3)), None);
    assert_eq!(
        xwing::encapsulate(&bad, &eseed(3)),
        Err(XWingError::PublicKey)
    );
}

#[test]
fn the_label_is_the_drafts() {
    assert_eq!(hex::encode(xwing::LABEL), "5c2e2f2f5e5c");
}
