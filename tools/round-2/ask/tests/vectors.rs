//! The ask program against the grammar vectors only
//! (v2/core/vectors/agreements-new/grammar.json): every case that needs no
//! stand-in layer, reader or limit (the cases the kit's binding can be asked)
//! must give exactly the answers the file records.

use round_2_ask::{ask, ActIn};
use serde_json::Value;

fn vectors() -> Value {
    let p = concat!(env!("CARGO_MANIFEST_DIR"), "/../../../v2/core/vectors/agreements-new/grammar.json");
    serde_json::from_str(&std::fs::read_to_string(p).expect("grammar.json in v2")).unwrap()
}

fn plain(c: &Value) -> bool {
    let l = &c["layers"];
    let empty = |v: &Value| v.is_null() || v.as_array().map_or(false, |a| a.is_empty());
    empty(&l["places"]) && empty(&l["clocks"]) && l["envelope_chain"].is_null() && l["money"].is_null()
        && c["limits"].is_null() && c["reader"]["on_behalf_of"].is_null() && c["reader"]["anchoring"].is_null()
}

#[test]
fn every_plain_case_gives_its_recorded_answers() {
    let v = vectors();
    let mut n = 0;
    for c in v["cases"].as_array().unwrap() {
        if !plain(c) {
            continue;
        }
        let acts: Vec<ActIn> = c["acts"].as_array().unwrap().iter().map(|a| ActIn { bytes: hex::decode(a["bytes"].as_str().unwrap()).unwrap(), key: None }).collect();
        let args: Vec<&str> = c["question"]["args"].as_array().unwrap().iter().map(|x| x.as_str().unwrap()).collect();
        let got: Value = serde_json::from_str(&ask(&acts, c["question"]["ask"].as_str().unwrap(), &args).unwrap()).unwrap();
        assert_eq!(got, c["answers"], "{}", c["name"]);
        let pick = &got[c["answer"]["pick"].as_u64().unwrap() as usize];
        for k in ["word", "rule", "qualifier", "disputed"] {
            assert_eq!(pick[k], c["answer"][k], "{}: {k}", c["name"]);
        }
        n += 1;
    }
    assert!(n >= 80, "only {n} plain cases");
}

#[test]
fn an_unknown_question_is_refused() {
    assert!(ask(&[], "no_such_question", &[]).is_err());
}

#[test]
fn every_question_is_listed() {
    assert!(round_2_ask::questions().iter().any(|(n, _)| *n == "in_force"));
}

#[test]
fn a_feed_page_gives_its_acts_and_skips_sealed_items() {
    use mor_core::cbor::{encode, Value};
    let v = vectors();
    let a = hex::decode(v["cases"][0]["acts"][0]["bytes"].as_str().unwrap()).unwrap();
    let page = encode(&Value::Map(vec![
        (Value::Uint(0), Value::Array(vec![
            Value::Array(vec![Value::Uint(1), Value::Uint(0), Value::Bytes(a.clone())]),
            Value::Array(vec![Value::Uint(2), Value::Uint(1), Value::Bytes(vec![1, 2, 3])]),
        ])),
        (Value::Uint(1), Value::Uint(2)),
    ]));
    assert_eq!(round_2_ask::feed_acts(&page).unwrap(), vec![a]);
}

#[test]
fn the_experiment_changes_nothing_where_no_act_names_its_fingerprint() {
    let v = vectors();
    let fp = [0x5a_u8; 32]; // named by no act in the vectors
    let mut n = 0;
    for c in v["cases"].as_array().unwrap() {
        if !plain(c) || c["question"]["ask"] != "in_force" {
            continue;
        }
        let acts: Vec<ActIn> = c["acts"].as_array().unwrap().iter().map(|a| ActIn { bytes: hex::decode(a["bytes"].as_str().unwrap()).unwrap(), key: None }).collect();
        let args: Vec<&str> = c["question"]["args"].as_array().unwrap().iter().map(|x| x.as_str().unwrap()).collect();
        assert_eq!(round_2_ask::ask_holding(&acts, "in_force", &args, &[fp]).unwrap(), ask(&acts, "in_force", &args).unwrap(), "{}", c["name"]);
        n += 1;
    }
    assert!(n > 5, "only {n} in_force cases");
}
