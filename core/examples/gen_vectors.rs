//! Writes the published test vectors of the core library, part 1, to
//! `core/vectors/`. Run: `cargo run -p mor-core --example gen_vectors`.
//!
//! Every input is fixed (keys, nonces and salts are derived from labels
//! below), so running this again gives the same files. `tests/vectors.rs`
//! checks the library against the files; `vectors/check.py` checks them
//! with an independent implementation.

use mor_core::act::{self, Addressing, Inside, Ref, Sequence};
use mor_core::cbor::{self, Value};
use mor_core::hash::{self, sha256, tagged_hash, Hash};
use mor_core::{lock, mmr, text};
use serde_json::{json, Value as J};
use std::path::Path;

fn hx(b: &[u8]) -> String {
    hex::encode(b)
}

/// A fixed stand-in value, derived from a label by plain SHA-256.
fn fixed(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn fixed_n<const N: usize>(label: &str) -> [u8; N] {
    fixed(label)[..N].try_into().unwrap()
}

fn write(dir: &Path, name: &str, v: &J) {
    let s = serde_json::to_string_pretty(v).unwrap() + "\n";
    std::fs::write(dir.join(name), s).unwrap();
    println!("wrote {name}");
}

fn tagged_hashes() -> J {
    let cases: &[(&str, &[u8])] = &[
        ("MOR/act", b""),
        ("MOR/inside", b"abc"),
        ("MOR/mmr-leaf", &[0u8; 32]),
        ("MOR/mmr-node", &[0u8; 64]),
        ("MOR/work", "Thank you".as_bytes()),
        ("MOR/spec", &[0xa0]),
        ("MOR/safety", &[0x02; 33]),
    ];
    let v: Vec<J> = cases
        .iter()
        .map(|(t, d)| json!({ "tag": t, "data": hx(d), "hash": hx(&tagged_hash(t, d)) }))
        .collect();
    json!({
        "description": "tagged_hash(tag, x) = SHA-256(SHA-256(tag) || SHA-256(tag) || x), tag as UTF-8 bytes (Identity, Hashes).",
        "vectors": v,
    })
}

fn cbor_vectors() -> J {
    // Deterministic encodings that must be accepted, and must re-encode to the same bytes.
    let valid: &[(&str, &str)] = &[
        ("00", "0"),
        ("17", "23"),
        ("1818", "24"),
        ("1903e8", "1000"),
        ("1a000f4240", "1000000"),
        ("1bffffffffffffffff", "18446744073709551615"),
        ("3863", "-100"),
        ("40", "h''"),
        ("5820" , "h'00..00' (32 bytes), below with 32 zero bytes"),
        ("60", "\"\""),
        ("6449455446", "\"IETF\""),
        ("80", "[]"),
        ("a0", "{}"),
        ("a201020304", "{1: 2, 3: 4}"),
        ("a50a001864002000617a0062616100", "{10: 0, 100: 0, -1: 0, \"z\": 0, \"aa\": 0}: keys in bytewise order of their encodings"),
        ("f4", "false"),
        ("f6", "null"),
        ("f93c00", "1.0 as a half"),
        ("f97e00", "NaN as a half"),
        ("fa47c35000", "100000.0 as a single"),
        ("fb3ff199999999999a", "1.1 as a double"),
        ("c11a514b67b0", "1(1363896240): a tag"),
        ("f8ff", "simple(255)"),
    ];
    let mut valid_j = Vec::new();
    for (h, d) in valid {
        let mut bytes = hex::decode(h).unwrap();
        if *h == "5820" {
            bytes.extend_from_slice(&[0u8; 32]);
        }
        let v = cbor::decode(&bytes).unwrap_or_else(|e| panic!("{h}: {e}"));
        assert_eq!(cbor::encode(&v), bytes);
        valid_j.push(json!({ "hex": hx(&bytes), "diagnostic": d }));
    }
    let invalid: &[(&str, &str)] = &[
        ("1817", "integer 23 not in shortest form"),
        ("190017", "integer 23 in two bytes"),
        (
            "1b00000000ffffffff",
            "integer in eight bytes that fits in four",
        ),
        ("5801ff", "byte string length not in shortest form"),
        ("5f41ffff", "indefinite-length byte string"),
        ("9f01ff", "indefinite-length array"),
        ("bf0102ff", "indefinite-length map"),
        ("a203040102", "map keys out of order"),
        ("a201020103", "duplicate map key"),
        (
            "a2616101182a02",
            "map keys out of order: \"a\" (0x6161) before 24 (0x1818)",
        ),
        ("fa3f800000", "1.0 as a single, fits in a half"),
        ("fb3ff0000000000000", "1.0 as a double"),
        ("fb7ff8000000000000", "NaN as a double"),
        ("62c328", "text string not valid UTF-8"),
        ("63eda080", "text string holding an encoded surrogate"),
        ("f818", "two-byte simple value below 32"),
        ("1c", "reserved additional information"),
        ("ff", "break outside an indefinite item"),
        ("0000", "trailing bytes"),
        ("830102", "array ends early"),
        ("", "empty input"),
    ];
    let invalid_j: Vec<J> = invalid
        .iter()
        .map(|(h, why)| {
            let e = cbor::decode(&hex::decode(h).unwrap()).expect_err(h);
            json!({ "hex": h, "why": why, "error": format!("{e:?}") })
        })
        .collect();
    json!({
        "description": "Deterministic CBOR (RFC 8949, 4.2.1). Valid: accepted, and re-encoding gives the same bytes. Invalid: rejected. The `error` field is this library's error name, for information.",
        "valid": valid_j,
        "invalid": invalid_j,
    })
}

fn cps(s: &str) -> Vec<String> {
    s.chars().map(|c| format!("U+{:04X}", c as u32)).collect()
}

fn text_vectors() -> J {
    let cases: &[(&str, &str)] = &[
        ("", "the empty string is canonical"),
        ("Hello, world.", "plain ASCII"),
        ("First line\n\nThird line", "LF line breaks and an empty line"),
        ("\nStarts with a line break", "a leading LF is allowed"),
        ("Caf\u{e9}", "precomposed e acute (NFC)"),
        ("Cafe\u{301}", "e plus combining acute: not NFC"),
        ("\u{212B}", "ANGSTROM SIGN: a singleton, not NFC (NFC is U+00C5)"),
        ("\u{1100}\u{1161}", "Hangul L+V jamo: not NFC (composes to U+AC00)"),
        ("\u{AC00}", "Hangul syllable GA: NFC"),
        ("a\u{1ADD}\u{1AD0}", "two marks new in Unicode 17.0, in canonical order (220 before 230): NFC"),
        ("a\u{1AD0}\u{1ADD}", "the same two marks out of canonical order: not NFC under the pinned Unicode 17.0 tables; a verifier using 16.0 tables would wrongly accept it"),
        ("a\u{10FFFD}", "a private use character: canonical"),
        ("a\u{E0001}", "U+E0001 LANGUAGE TAG, a deprecated format character: canonical (clients may warn)"),
        ("a\u{FEFF}b", "rule 1: U+FEFF inside the text"),
        ("\u{FEFF}Hello", "rule 1: a byte order mark at the start"),
        ("a\r\nb", "rule 2: CR"),
        ("a\u{2028}b", "rule 2: LINE SEPARATOR"),
        ("a\u{2029}b", "rule 2: PARAGRAPH SEPARATOR"),
        ("a\tb", "rule 3: TAB"),
        ("a\u{0}b", "rule 3: NUL"),
        ("a\u{7F}b", "rule 3: DELETE"),
        ("a\u{85}b", "rule 3: NEXT LINE (C1 control)"),
        ("a\u{9F}b", "rule 3: last C1 control"),
        ("a \nb", "rule 4: a line ending with a space"),
        ("a\u{A0}", "rule 4: ending with NO-BREAK SPACE"),
        ("a\u{3000}\nb", "rule 4: a line ending with IDEOGRAPHIC SPACE"),
        ("a\u{200B}", "U+200B ZERO WIDTH SPACE is not on the space list: canonical (clients may warn)"),
        ("a\u{2800}", "U+2800 BRAILLE PATTERN BLANK is not on the space list: canonical"),
        ("a\n", "rule 4: a final line break"),
        ("\n", "rule 4: only a line break"),
        (" ", "rule 4: only a space"),
        ("a\u{FDD0}", "rule 5: noncharacter U+FDD0"),
        ("a\u{FFFE}", "rule 5: noncharacter U+FFFE"),
        ("a\u{10FFFF}", "rule 5: noncharacter U+10FFFF"),
        ("a\u{202E}b\u{202C}", "bidirectional controls are canonical (shown visibly before signing terms)"),
        ("\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}", "an emoji sequence with ZERO WIDTH JOINER: canonical"),
    ];
    let v: Vec<J> = cases
        .iter()
        .map(|(s, note)| {
            let r = text::check(s);
            json!({
                "codepoints": cps(s),
                "utf8": hx(s.as_bytes()),
                "canonical": r.is_ok(),
                "rule": r.err().map(|e| e.rule()),
                "note": note,
            })
        })
        .collect();
    json!({
        "description": "Canonical text (Text MIP). `rule` is the first rule broken, checking rules 1 to 5 in text order and rule 6 (NFC, Unicode 17.0 tables) last; null if canonical.",
        "unicode_version": "17.0.0",
        "vectors": v,
    })
}

fn lock_vectors() -> J {
    let mut v = Vec::new();
    for (i, pt) in [&b""[..], b"MOR", &[0xa0], &[0x42; 100]].iter().enumerate() {
        let key: [u8; 32] = fixed(&format!("mor-core vector: lock key {i}"));
        let nonce: [u8; 24] = fixed_n(&format!("mor-core vector: lock nonce {i}"));
        let locked = lock::lock(pt, &key, &nonce);
        v.push(json!({
            "key": hx(&key), "nonce": hx(&nonce), "plaintext": hx(pt),
            "locked": hx(&locked), "locked_hash": hx(&sha256(&locked)),
        }));
    }
    json!({
        "description": "XChaCha20-Poly1305 with no associated data; locked = ciphertext || 16-byte tag; locked_hash = SHA-256(locked) (Envelope).",
        "vectors": v,
    })
}

fn summary_vectors() -> J {
    let ids: Vec<Hash> = (1..=11u8).map(|i| sha256(&[i])).collect();
    let summaries: Vec<J> = (0..=ids.len())
        .map(|n| json!({ "acts": n, "summary": hx(&mmr::summary(&ids[..n])) }))
        .collect();
    json!({
        "description": "Running summary (Envelope, Sequences): root of a Merkle mountain range over act ids. leaf = tagged_hash(\"MOR/mmr-leaf\", id); node = tagged_hash(\"MOR/mmr-node\", left || right); peaks bagged right to left as node(peak, bagged so far); one peak is its own root; no acts gives 32 zero bytes. The act ids here are stand-ins: SHA-256 of the single byte 1, 2, 3 ...",
        "act_ids": ids.iter().map(|h| hx(h)).collect::<Vec<_>>(),
        "summaries": summaries,
    })
}

fn text_payload(s: &str) -> Vec<(Value, Value)> {
    vec![(Value::Uint(0), Value::Text(s.into()))]
}

/// The three-act sequence of F78: three public text acts by one signer.
fn three_acts() -> J {
    let spec = fixed("mor-core vector: stand-in for the TEXT spec hash, fixed at freeze");
    let signer = fixed("mor-core vector: stand-in signer identity");
    let binding = fixed("mor-core vector: stand-in binding act");
    let texts = [
        "First act of a test sequence.",
        "Second act. It refers to the first.",
        "Third act.\nCaf\u{e9}, na\u{ef}ve, \u{65E5}\u{672C}\u{8A9E}.",
    ];
    let mut seq = Sequence::new();
    let mut acts = Vec::new();
    let mut ids: Vec<Hash> = Vec::new();
    for (i, t) in texts.iter().enumerate() {
        let n = i + 1;
        let inside = Inside {
            spec,
            type_: 0,
            prev: Some(ids.last().copied().into_iter().collect()),
            objects: None,
            payload: text_payload(t),
            position: Some(n as u64),
            summary: Some(seq.summary()),
            acks: None,
            refs: if n == 2 {
                Some(vec![Ref::Act(ids[0])])
            } else {
                None
            },
            hint: if n == 3 {
                Some("2026-09-28".into())
            } else {
                None
            },
            salt: fixed_n(&format!("mor-core vector: salt {n}")),
        };
        let key: [u8; 32] = fixed(&format!("mor-core vector: content key {n}"));
        let nonce: [u8; 24] = fixed_n(&format!("mor-core vector: nonce {n}"));
        let addr = Addressing {
            signer: Some(signer),
            binding: Some(binding),
            public: true,
            to: None,
        };
        let (outside, locked) = act::seal(&inside, &key, &nonce, &addr);
        let id = outside.act_id();
        assert_eq!(act::open(&outside, &locked, None).unwrap(), inside);
        seq.append(&id, &inside).unwrap();
        acts.push(json!({
            "position": n,
            "text": t,
            "prev": inside.prev.as_ref().unwrap().iter().map(|h| hx(h)).collect::<Vec<_>>(),
            "summary": hx(&inside.summary.unwrap()),
            "salt": hx(&inside.salt),
            "content_key": hx(&key),
            "nonce": hx(&nonce),
            "inside": hx(&inside.encode()),
            "inside_commitment": hx(&inside.commitment()),
            "locked": hx(&locked),
            "locked_hash": hx(&outside.locked_hash),
            "outside": hx(&outside.encode()),
            "act_id": hx(&id),
        }));
        ids.push(id);
    }
    json!({
        "description": "The three-act running-summary vector (Envelope, Sequences; F78). Three public text acts (Text MIP type 0) in one sequence of one signer. Each act carries prev, its position and the running summary up to and including the previous act; act 1 carries the empty summary. `summary_including_last` is the summary over all three, as a rotation's kept tip carries it. `spec`, `signer` and `binding` are stand-ins (SHA-256 of a label): MIP hashes are fixed only at freeze, and signatures are part 2 of the core library, so no signature is given. The act id does not depend on the signature.",
        "spec": hx(&spec),
        "signer": hx(&signer),
        "binding": hx(&binding),
        "acts": acts,
        "summary_including_last": hx(&seq.summary()),
    })
}

/// Sealed acts that opening must reject, each for one reason.
fn invalid_acts() -> J {
    let spec = fixed("mor-core vector: stand-in for the TEXT spec hash, fixed at freeze");
    let key: [u8; 32] = fixed("mor-core vector: invalid content key");
    let nonce: [u8; 24] = fixed_n("mor-core vector: invalid nonce");
    let addr = Addressing {
        public: true,
        ..Default::default()
    };
    let good = Inside {
        spec,
        type_: 0,
        prev: Some(vec![]),
        objects: None,
        payload: text_payload("A valid inside."),
        position: Some(1),
        summary: Some(hash::ZERO_HASH),
        acks: None,
        refs: None,
        hint: None,
        salt: fixed_n("mor-core vector: invalid salt"),
    };
    let mut cases: Vec<(String, act::Outside, Vec<u8>, &str)> = Vec::new();

    let (o, l) = act::seal(&good, &key, &nonce, &addr);
    cases.push(("valid: for comparison".into(), o.clone(), l.clone(), "ok"));

    let mut l2 = l.clone();
    l2[0] ^= 1;
    cases.push((
        "locked bytes changed after sealing".into(),
        o.clone(),
        l2,
        "locked_hash",
    ));

    let mut o2 = o.clone();
    o2.content_key = Some(fixed("mor-core vector: a wrong key"));
    cases.push((
        "the outside's content key does not open the inside".into(),
        o2,
        l.clone(),
        "unlock",
    ));

    let other = Inside {
        payload: text_payload("Another inside."),
        ..good.clone()
    };
    let mut o3 = o.clone();
    o3.inside_commitment = other.commitment();
    cases.push((
        "the inside commitment names another inside".into(),
        o3,
        l.clone(),
        "inside_commitment",
    ));

    let bad_text = Inside {
        payload: text_payload("Trailing space. "),
        ..good.clone()
    };
    let (o4, l4) = act::seal(&bad_text, &key, &nonce, &addr);
    cases.push((
        "a text field that is not canonical (trailing space)".into(),
        o4,
        l4,
        "text",
    ));

    let mut bad_key = good.to_value();
    if let Value::Map(m) = &mut bad_key {
        m.push((Value::Uint(11), Value::Uint(0)));
    }
    let (o5, l5) = act::seal_encoded(&cbor::encode(&bad_key), &key, &nonce, &addr);
    cases.push(("an unknown inside key (11)".into(), o5, l5, "shape"));

    let no_salt = {
        let mut v = good.to_value();
        if let Value::Map(m) = &mut v {
            m.retain(|(k, _)| *k != Value::Uint(10));
        }
        v
    };
    let (o6, l6) = act::seal_encoded(&cbor::encode(&no_salt), &key, &nonce, &addr);
    cases.push(("no salt".into(), o6, l6, "shape"));

    // Keys 0 and 1 swapped: well-formed CBOR, not deterministic.
    let enc = good.encode();
    let mut swapped = vec![enc[0]];
    let spec_entry = &enc[1..1 + 1 + 2 + 32]; // key 0, then 0x5820 and 32 bytes
    let type_entry = &enc[1 + 35..1 + 35 + 2]; // key 1, then 0x00
    swapped.extend_from_slice(type_entry);
    swapped.extend_from_slice(spec_entry);
    swapped.extend_from_slice(&enc[1 + 35 + 2..]);
    assert!(cbor::decode(&swapped).is_err());
    let (o7, l7) = act::seal_encoded(&swapped, &key, &nonce, &addr);
    cases.push((
        "an inside that is not deterministic CBOR (map keys out of order)".into(),
        o7,
        l7,
        "cbor",
    ));

    let mut o8 = o.clone();
    o8.content_key = None;
    cases.push((
        "a private act, opened with no key".into(),
        o8,
        l.clone(),
        "no_key",
    ));

    let v: Vec<J> = cases
        .into_iter()
        .map(|(why, o, l, want)| {
            let got = act::open(&o, &l, None);
            let got_s = match &got {
                Ok(_) => "ok",
                Err(act::ActError::LockedHash) => "locked_hash",
                Err(act::ActError::Unlock) => "unlock",
                Err(act::ActError::InsideCommitment) => "inside_commitment",
                Err(act::ActError::Text(_)) => "text",
                Err(act::ActError::Shape(_)) => "shape",
                Err(act::ActError::Cbor(_)) => "cbor",
                Err(act::ActError::NoKey) => "no_key",
            };
            assert_eq!(got_s, want, "{why}: {got:?}");
            json!({ "why": why, "outside": hx(&o.encode()), "locked": hx(&l), "result": want })
        })
        .collect();
    json!({
        "description": "Opening an act (Envelope rules 1, 2, 3, 5): check the locked hash, unlock with the outside's content key (XChaCha20-Poly1305, no associated data), check the inside commitment over the unlocked bytes, then decode the inside as deterministic CBOR in the Envelope's shape with canonical text. Each case gives the first check that fails, in that order, or ok.",
        "vectors": v,
    })
}

fn main() {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("vectors");
    std::fs::create_dir_all(&dir).unwrap();
    write(&dir, "tagged-hash.json", &tagged_hashes());
    write(&dir, "cbor.json", &cbor_vectors());
    write(&dir, "canonical-text.json", &text_vectors());
    write(&dir, "lock.json", &lock_vectors());
    write(&dir, "running-summary.json", &summary_vectors());
    write(&dir, "sequence-three-acts.json", &three_acts());
    write(&dir, "open-act.json", &invalid_acts());
}
