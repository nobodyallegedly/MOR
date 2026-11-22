//! count-ask against the repository's own vectors, and nothing else:
//! `v2/core/vectors/agreements-new/` (or the directory COUNT_ASK_VECTORS
//! names). Every grammar case count-ask can express (acts, places, the
//! reader) must get, through count-ask's own loading, every answer the file
//! records; the cases it cannot express (a clock, the envelope's chain,
//! Money, limits) are counted and named, never passed over silently.

use count_ask::{answer_json, ask, build, h, index, Input, PlaceIn};
use serde_json::Value as J;
use std::path::PathBuf;

fn vectors() -> PathBuf {
    match std::env::var("COUNT_ASK_VECTORS") {
        Ok(p) => PathBuf::from(p),
        Err(_) => PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../v2/core/vectors/agreements-new"),
    }
}

fn read(name: &str) -> J {
    serde_json::from_str(&std::fs::read_to_string(vectors().join(name)).unwrap()).unwrap()
}

#[test]
fn the_grammar_cases_count_ask_can_express_get_the_recorded_answers() {
    let f = read("grammar.json");
    let (mut asked, mut skipped) = (0, 0);
    for c in f["cases"].as_array().unwrap() {
        let name = c["name"].as_str().unwrap();
        let l = &c["layers"];
        if !l["clocks"].as_array().unwrap().is_empty() || !l["envelope_chain"].is_null() || !l["money"].is_null() || !c["limits"].is_null() {
            skipped += 1;
            continue;
        }
        let mut input = Input::default();
        input.acts = c["acts"].as_array().unwrap().iter().map(|a| hex::decode(a["bytes"].as_str().unwrap()).unwrap()).collect();
        for p in l["places"].as_array().unwrap() {
            input.places.push(PlaceIn {
                id: h(p["id"].as_str().unwrap()).unwrap(),
                positions: p["positions"].as_array().unwrap().iter().map(|x| (h(x[0].as_str().unwrap()).unwrap(), x[1].as_u64().unwrap())).collect(),
                contradicted: p["contradicted"].as_array().unwrap().iter().map(|x| h(x.as_str().unwrap()).unwrap()).collect(),
            });
        }
        input.anchoring = c["reader"]["anchoring"].as_str().map(|s| h(s).unwrap());
        input.on_behalf_of = match &c["reader"]["on_behalf_of"] {
            J::Null => None,
            v => Some(match (v.get("signer"), v.get("agreement")) {
                (Some(s), _) => format!("signer:{}", s.as_str().unwrap()),
                (_, Some(a)) => format!("agreement:{}", a.as_str().unwrap()),
                _ => panic!("{name}: a reader that is neither"),
            }),
        };
        let built = build(&input).unwrap();
        let v = built.verifier();
        let args: Vec<&str> = c["question"]["args"].as_array().unwrap().iter().map(|x| x.as_str().unwrap()).collect();
        let got = ask(&v, c["question"]["ask"].as_str().unwrap(), &args).unwrap();
        let got: Vec<J> = got.iter().map(answer_json).collect();
        assert_eq!(&J::Array(got.clone()), &c["answers"], "{name}");
        let w = &c["answer"];
        let pick = &got[w["pick"].as_u64().unwrap() as usize];
        assert_eq!(pick["word"], w["word"], "{name}");
        assert_eq!(pick["rule"], w["rule"], "{name}");
        asked += 1;
    }
    eprintln!("grammar.json: {asked} cases asked and matched, {skipped} not expressible by count-ask (a clock, the envelope's chain, Money, limits)");
    assert!(asked >= 80, "asked {asked}");
    assert_eq!(asked + skipped, f["cases"].as_array().unwrap().len());
}

#[test]
fn the_index_gives_the_checkers_verdicts_on_valid_and_invalid() {
    for file in ["valid.json", "invalid.json"] {
        let f = read(file);
        let mut n = 0;
        for c in f["cases"].as_array().unwrap() {
            let acts: Vec<Vec<u8>> = c["acts"].as_array().unwrap().iter().map(|a| hex::decode(a["bytes"].as_str().unwrap()).unwrap()).collect();
            if c["acts"].as_array().unwrap().iter().any(|a| a.get("key").is_some_and(|k| !k.is_null())) {
                continue; // count-ask is given no content keys
            }
            // count-ask keeps one copy of each act, as its main does; the
            // vectors never repeat one within a case.
            let got = index(&acts);
            let last = got.last().unwrap();
            assert_eq!(last["verdict"], c["answer"]["verdict"], "{file}: {}", c["name"]);
            if !c["answer"]["rule"].is_null() {
                assert_eq!(last["rule"], c["answer"]["rule"], "{file}: {}", c["name"]);
            }
            n += 1;
        }
        eprintln!("{file}: {n} cases, the checker's verdict and rule as recorded");
        assert!(n > 10);
    }
}

#[test]
fn a_place_cut_at_a_position_shows_nothing_after_it() {
    let a = [[1u8; 32], [2u8; 32], [3u8; 32]];
    let p = PlaceIn::in_order([9u8; 32], &a).upto(2);
    assert_eq!(p.positions, vec![([1u8; 32], 1), ([2u8; 32], 2)]);
}
