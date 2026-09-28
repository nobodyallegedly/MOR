//! The library against its published test vectors (`core/vectors/`).
//! Nothing here recomputes a vector from the generator: each file is read as
//! published and every value in it is checked.

use mor_core::act::{self, ActError, Inside, Outside, Sequence};
use mor_core::cbor;
use mor_core::hash::{sha256, tagged_hash, Hash};
use mor_core::{lock, mmr, text};
use serde_json::Value as J;

fn load(name: &str) -> J {
    let path = format!("{}/vectors/{name}", env!("CARGO_MANIFEST_DIR"));
    serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap()
}

fn b(v: &J) -> Vec<u8> {
    hex::decode(v.as_str().unwrap()).unwrap()
}

fn h(v: &J) -> Hash {
    b(v).try_into().unwrap()
}

#[test]
fn tagged_hash_vectors() {
    for v in load("tagged-hash.json")["vectors"].as_array().unwrap() {
        assert_eq!(
            tagged_hash(v["tag"].as_str().unwrap(), &b(&v["data"])),
            h(&v["hash"])
        );
    }
}

#[test]
fn cbor_vectors() {
    let f = load("cbor.json");
    for v in f["valid"].as_array().unwrap() {
        let bytes = b(&v["hex"]);
        let val = cbor::decode(&bytes).unwrap_or_else(|e| panic!("{}: {e}", v["hex"]));
        assert_eq!(cbor::encode(&val), bytes);
    }
    for v in f["invalid"].as_array().unwrap() {
        assert!(
            cbor::decode(&b(&v["hex"])).is_err(),
            "accepted {}",
            v["hex"]
        );
    }
}

#[test]
fn canonical_text_vectors() {
    let f = load("canonical-text.json");
    assert_eq!(f["unicode_version"], "17.0.0");
    for v in f["vectors"].as_array().unwrap() {
        let s: String = v["codepoints"]
            .as_array()
            .unwrap()
            .iter()
            .map(|c| {
                char::from_u32(u32::from_str_radix(&c.as_str().unwrap()[2..], 16).unwrap()).unwrap()
            })
            .collect();
        assert_eq!(s.as_bytes(), b(&v["utf8"]).as_slice());
        let r = text::check(&s);
        assert_eq!(
            r.is_ok(),
            v["canonical"].as_bool().unwrap(),
            "{}",
            v["note"]
        );
        assert_eq!(
            r.err().map(|e| e.rule() as u64),
            v["rule"].as_u64(),
            "{}",
            v["note"]
        );
    }
}

#[test]
fn lock_vectors() {
    for v in load("lock.json")["vectors"].as_array().unwrap() {
        let key: [u8; 32] = b(&v["key"]).try_into().unwrap();
        let nonce: [u8; 24] = b(&v["nonce"]).try_into().unwrap();
        let locked = lock::lock(&b(&v["plaintext"]), &key, &nonce);
        assert_eq!(locked, b(&v["locked"]));
        assert_eq!(sha256(&locked), h(&v["locked_hash"]));
        assert_eq!(
            lock::unlock(&locked, &key, &nonce).unwrap(),
            b(&v["plaintext"])
        );
    }
}

#[test]
fn running_summary_vectors() {
    let f = load("running-summary.json");
    let ids: Vec<Hash> = f["act_ids"].as_array().unwrap().iter().map(h).collect();
    for s in f["summaries"].as_array().unwrap() {
        let n = s["acts"].as_u64().unwrap() as usize;
        assert_eq!(mmr::summary(&ids[..n]), h(&s["summary"]), "{n} acts");
    }
}

#[test]
fn three_act_sequence() {
    let f = load("sequence-three-acts.json");
    let mut seq = Sequence::new();
    let mut ids = Vec::new();
    for a in f["acts"].as_array().unwrap() {
        // The outside decodes strictly, re-encodes to the same bytes, and names the signer.
        let outside_bytes = b(&a["outside"]);
        let outside = Outside::from_value(&cbor::decode(&outside_bytes).unwrap()).unwrap();
        assert_eq!(outside.encode(), outside_bytes);
        assert_eq!(outside.signer, Some(h(&f["signer"])));
        assert_eq!(outside.binding, Some(h(&f["binding"])));
        assert_eq!(outside.act_id(), h(&a["act_id"]));
        assert_eq!(outside.locked_hash, h(&a["locked_hash"]));
        assert_eq!(outside.inside_commitment, h(&a["inside_commitment"]));
        assert_eq!(outside.content_key.unwrap().to_vec(), b(&a["content_key"]));

        // Opening gives the published inside, which is a text act with the published text.
        let inside = act::open(&outside, &b(&a["locked"]), None).unwrap();
        assert_eq!(inside.encode(), b(&a["inside"]));
        assert_eq!(inside, Inside::decode(&b(&a["inside"])).unwrap());
        assert_eq!(inside.spec, h(&f["spec"]));
        assert_eq!(
            inside.payload,
            vec![(
                cbor::Value::Uint(0),
                cbor::Value::Text(a["text"].as_str().unwrap().into())
            )]
        );
        assert_eq!(inside.position, a["position"].as_u64());
        assert_eq!(inside.summary, Some(h(&a["summary"])));

        // Sealing the published inside with the published key and nonce gives the same act.
        let key: [u8; 32] = b(&a["content_key"]).try_into().unwrap();
        let nonce: [u8; 24] = b(&a["nonce"]).try_into().unwrap();
        let addr = act::Addressing {
            signer: outside.signer,
            binding: outside.binding,
            public: true,
            to: None,
        };
        let (o2, l2) = act::seal(&inside, &key, &nonce, &addr);
        assert_eq!(o2, outside);
        assert_eq!(l2, b(&a["locked"]));

        // The act fits its place in the sequence.
        assert_eq!(seq.summary(), h(&a["summary"]));
        seq.append(&outside.act_id(), &inside).unwrap();
        ids.push(outside.act_id());
    }
    assert_eq!(seq.summary(), h(&f["summary_including_last"]));
    assert_eq!(mmr::summary(&ids), h(&f["summary_including_last"]));
}

#[test]
fn open_act_vectors() {
    for v in load("open-act.json")["vectors"].as_array().unwrap() {
        let outside = Outside::from_value(&cbor::decode(&b(&v["outside"])).unwrap()).unwrap();
        let got = match act::open(&outside, &b(&v["locked"]), None) {
            Ok(_) => "ok",
            Err(ActError::LockedHash) => "locked_hash",
            Err(ActError::Unlock) => "unlock",
            Err(ActError::InsideCommitment) => "inside_commitment",
            Err(ActError::Text(_)) => "text",
            Err(ActError::Shape(_)) => "shape",
            Err(ActError::Cbor(_)) => "cbor",
            Err(ActError::NoKey) => "no_key",
        };
        assert_eq!(got, v["result"].as_str().unwrap(), "{}", v["why"]);
    }
}
