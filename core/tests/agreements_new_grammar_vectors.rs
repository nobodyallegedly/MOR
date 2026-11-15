//! The grammar verifier's vectors (`core/vectors/agreements-new/grammar.json`)
//! read back from the file alone: each case's acts from their bytes, its
//! stand-in layers from its tables, its question from its arguments; the
//! verifier, given only that, must give every answer the file records. So the
//! file is self-contained: a second builder needs nothing but it.

use mor_core::agreements_new::grammar::layers::{Layers, Payment, TableChain, TableClock, TableEnvelope, TableMoney, TablePlace};
use mor_core::agreements_new::grammar::{cases, stubs, Answer, Held, Limits, Reader, Verifier};
use mor_core::agreements_new::{Amount, Who};
use mor_core::hash::Hash;
use serde_json::Value as J;

fn h(s: &str) -> Hash {
    hex::decode(s).unwrap().try_into().unwrap()
}

fn who(v: &J) -> Option<Who> {
    if let Some(s) = v.get("signer") {
        return Some(Who::Signer(h(s.as_str().unwrap())));
    }
    v.get("agreement").map(|s| Who::Agreement(h(s.as_str().unwrap())))
}

fn layers(l: &J) -> Layers {
    let mut out = Layers::default();
    for p in l["places"].as_array().unwrap() {
        let mut t = TablePlace::default();
        for x in p["positions"].as_array().unwrap() {
            t.positions.insert(h(x[0].as_str().unwrap()), x[1].as_u64().unwrap());
        }
        for x in p["contradicted"].as_array().unwrap() {
            t.contradicted.insert(h(x.as_str().unwrap()));
        }
        out.places.insert(h(p["id"].as_str().unwrap()), Box::new(t));
    }
    for c in l["clocks"].as_array().unwrap() {
        let mut t = TableClock::default();
        for x in c["times"].as_array().unwrap() {
            t.times.insert(h(x[0].as_str().unwrap()), x[1].as_u64().unwrap());
        }
        out.clocks.insert(h(c["id"].as_str().unwrap()), Box::new(t));
    }
    if let Some(ch) = l["envelope_chain"].as_object() {
        let mut t = TableChain::default();
        for e in ch["envelopes"].as_array().unwrap() {
            t.envelopes.insert(
                h(e["bake"].as_str().unwrap()),
                TableEnvelope {
                    baker: h(e["baker"].as_str().unwrap()),
                    work: h(e["work"].as_str().unwrap()),
                    transfers: e["transfers"].as_array().unwrap().iter().map(|x| (h(x["id"].as_str().unwrap()), h(x["follows"].as_str().unwrap()), h(x["to"].as_str().unwrap()))).collect(),
                    lacking: Default::default(),
                    holder_in_fork: e["holder_in_fork"].as_bool().unwrap(),
                },
            );
        }
        out.chain = Some(Box::new(t));
    }
    if let Some(m) = l["money"].as_object() {
        let mut t = TableMoney::default();
        for p in m["payments"].as_array().unwrap() {
            t.payments.push(Payment {
                id: h(p["id"].as_str().unwrap()),
                payer: h(p["payer"].as_str().unwrap()),
                version: h(p["version"].as_str().unwrap()),
                settlement: h(p["settlement"].as_str().unwrap()),
                amount: Amount { unit: h(p["amount"][0].as_str().unwrap()), value: p["amount"][1].as_u64().unwrap() },
            });
        }
        for s in m["settlements"].as_array().unwrap() {
            t.settlements.insert(h(s.as_str().unwrap()));
        }
        for s in m["same_payment"].as_array().unwrap() {
            t.same.push((h(s[0].as_str().unwrap()), h(s[1].as_str().unwrap())));
        }
        out.money = Some(Box::new(t));
    }
    out
}

fn ask(v: &Verifier, q: &J) -> Vec<Answer> {
    let args: Vec<&str> = q["args"].as_array().unwrap().iter().map(|x| x.as_str().unwrap()).collect();
    v.ask_named(q["ask"].as_str().unwrap(), &args).unwrap()
}

#[test]
fn every_answer_is_the_verifiers_from_the_file_alone() {
    let p = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("vectors/agreements-new/grammar.json");
    let f: J = serde_json::from_str(&std::fs::read_to_string(p).unwrap()).unwrap();
    let cs = f["cases"].as_array().unwrap();
    assert_eq!(cs.len(), cases::all().len(), "the file holds every case the library defines");
    for c in cs {
        let name = c["name"].as_str().unwrap();
        let bytes: Vec<Vec<u8>> = c["acts"].as_array().unwrap().iter().map(|a| hex::decode(a["bytes"].as_str().unwrap()).unwrap()).collect();
        let input: Vec<(&[u8], Option<&[u8; 32]>)> = bytes.iter().map(|b| (b.as_slice(), None)).collect();
        let held = Held::from_bytes(&input);
        let cmips = stubs::all();
        let ls = layers(&c["layers"]);
        let r = &c["reader"];
        let reader = Reader { on_behalf_of: who(&r["on_behalf_of"]), anchoring: r["anchoring"].as_str().map(h) };
        let mut v = Verifier::new(&held, &cmips, &ls).with_reader(reader);
        if let Some(n) = c["limits"].get("receivers").and_then(|x| x.as_u64()) {
            v = v.with_limits(Limits { receivers: n as usize, ..Limits::default() });
        }
        let got = ask(&v, &c["question"]);
        let got: Vec<J> = got.iter().map(|a| serde_json::from_str(&a.to_json().text()).unwrap()).collect();
        assert_eq!(&J::Array(got.clone()), &c["answers"], "{name}");
        let w = &c["answer"];
        let pick = &got[w["pick"].as_u64().unwrap() as usize];
        assert_eq!(pick["word"], w["word"], "{name}");
        assert_eq!(pick["rule"], w["rule"], "{name}");
        assert_eq!(pick["disputed"], w["disputed"], "{name}");
        assert!(c["sentence"].as_str().unwrap().len() > 10, "{name}: the sentence of draft 24 it tests");
    }
}

#[test]
fn the_stubs_are_marked_as_stubs() {
    let p = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("vectors/agreements-new/grammar.json");
    let f: J = serde_json::from_str(&std::fs::read_to_string(p).unwrap()).unwrap();
    for s in f["stubs"].as_array().unwrap() {
        assert_eq!(s["for"].as_str().unwrap(), "tests only: answers from its own parameters, as a table");
    }
}
