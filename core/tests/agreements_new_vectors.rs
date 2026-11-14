//! The vectors of the new Agreements acts (`core/vectors/agreements-new/`),
//! read back from the files: every case's answer is the library's, and every
//! act that passes is in its one byte form (decoding and encoding again give
//! the same payload bytes: strict both ways).

use mor_core::act::Act;
use mor_core::agreements_new::check::Decoded;
use mor_core::agreements_new::{check, check_held, Verdict};
use mor_core::cbor::{self, Value};
use serde_json::Value as J;

fn load(name: &str) -> J {
    let p = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("vectors/agreements-new").join(name);
    serde_json::from_str(&std::fs::read_to_string(p).unwrap()).unwrap()
}

fn h(s: &str) -> Vec<u8> {
    hex::decode(s).unwrap()
}

fn run(file: &str) -> usize {
    let f = load(file);
    let cases = f["cases"].as_array().unwrap();
    for c in cases {
        let acts: Vec<(Vec<u8>, Option<[u8; 32]>)> = c["acts"]
            .as_array()
            .unwrap()
            .iter()
            .map(|a| (h(a["bytes"].as_str().unwrap()), a["key"].as_str().map(|k| h(k).try_into().unwrap())))
            .collect();
        let input: Vec<(&[u8], Option<&[u8; 32]>)> = acts.iter().map(|(b, k)| (b.as_slice(), k.as_ref())).collect();
        let got = if input.len() == 1 { check(input[0].0, input[0].1) } else { check_held(&input).pop().unwrap() };
        let want = &c["answer"];
        let name = c["name"].as_str().unwrap();
        assert_eq!(got.verdict.word(), want["verdict"].as_str().unwrap(), "{name}");
        assert_eq!(got.rule.as_deref(), want["rule"].as_str(), "{name}");
        let notes: Vec<&str> = got.notes.iter().map(|n| n.rule).collect();
        let want_notes: Vec<&str> = want["notes"].as_array().unwrap().iter().map(|n| n.as_str().unwrap()).collect();
        assert_eq!(notes, want_notes, "{name}");
        if got.verdict == Verdict::Pass {
            // Strict both ways: the payload decoded and encoded again is the same bytes.
            let (bytes, key) = acts.last().unwrap();
            let inside = Act::decode(bytes).unwrap().open(key.as_ref()).unwrap();
            let again = match got.act.as_ref().unwrap() {
                Decoded::Terms(t) => t.to_payload().unwrap(),
                Decoded::Statement(s) => s.to_payload().unwrap(),
                Decoded::Report(r) => r.to_payload().unwrap(),
            };
            assert_eq!(cbor::encode(&Value::Map(again)), cbor::encode(&Value::Map(inside.payload)), "{name}");
        }
    }
    cases.len()
}

#[test]
fn valid_vectors() {
    assert!(run("valid.json") >= 30);
}

#[test]
fn invalid_vectors() {
    assert!(run("invalid.json") >= 90);
}

#[test]
fn every_rule_is_tested() {
    // Every rule of encoding-1 that the checker can fail, and every case of
    // invalid draft 24 says an act shows, has at least one case.
    let f = load("invalid.json");
    let rules: std::collections::BTreeSet<String> = f["cases"].as_array().unwrap().iter().map(|c| c["answer"]["rule"].as_str().unwrap().to_string()).collect();
    for r in [
        "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22",
        "G2.1", "G3.1", "G4.2", "G6.1", "G10.1", "Envelopes rule 1", "Envelopes rule 3", "Envelopes rule 5", "Envelopes rule 10", "Envelopes rule 13",
    ] {
        assert!(rules.contains(r), "no case tests {r}");
    }
}
