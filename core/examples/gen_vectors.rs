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

#[path = "../tests/common/mod.rs"]
mod common;
#[path = "support/verdicts.rs"]
mod verdicts;

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
        ("fa7fc00001", "a NaN whose payload needs single width, as a single: the shortest width that keeps its payload"),
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
    // The nesting limit (Envelope rule 1a, F91): 128 levels below the outermost item.
    let nested = |levels: usize| {
        let mut b = vec![0x81u8; levels];
        b.push(0x00);
        b
    };
    assert!(cbor::decode(&nested(128)).is_ok());
    valid_j.push(json!({
        "hex": hx(&nested(128)),
        "diagnostic": "[[[...[0]...]]]: 128 nested arrays; the 0 is 128 levels below the outermost item, the most allowed",
    }));
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
        ("fb7ff8000020000000", "the same single-width NaN as a double: longer than the shortest width keeping its payload"),
        ("62c328", "text string not valid UTF-8"),
        ("63eda080", "text string holding an encoded surrogate"),
        ("f818", "two-byte simple value below 32"),
        ("1c", "reserved additional information"),
        ("ff", "break outside an indefinite item"),
        ("0000", "trailing bytes"),
        ("830102", "array ends early"),
        ("", "empty input"),
    ];
    let mut invalid_j: Vec<J> = invalid
        .iter()
        .map(|(h, why)| {
            let e = cbor::decode(&hex::decode(h).unwrap()).expect_err(h);
            json!({ "hex": h, "why": why, "error": format!("{e:?}") })
        })
        .collect();
    let e = cbor::decode(&nested(129)).expect_err("129 levels");
    invalid_j.push(json!({
        "hex": hx(&nested(129)),
        "why": "129 nested arrays: the 0 is 129 levels below the outermost item (Envelope rule 1a)",
        "error": format!("{e:?}"),
    }));
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
        ("a\u{FEFF}b", "rule 7: U+FEFF inside the text"),
        ("\u{FEFF}Hello", "rule 7: a byte order mark at the start"),
        ("a\r\nb", "rule 8: CR"),
        ("a\u{2028}b", "rule 8: LINE SEPARATOR"),
        ("a\u{2029}b", "rule 8: PARAGRAPH SEPARATOR"),
        ("a\tb", "rule 9: TAB"),
        ("a\u{0}b", "rule 9: NUL"),
        ("a\u{7F}b", "rule 9: DELETE"),
        ("a\u{85}b", "rule 9: NEXT LINE (C1 control)"),
        ("a\u{9F}b", "rule 9: last C1 control"),
        ("a \nb", "rule 10: a line ending with a space"),
        ("a\u{A0}", "rule 10: ending with NO-BREAK SPACE"),
        ("a\u{3000}\nb", "rule 10: a line ending with IDEOGRAPHIC SPACE"),
        ("a\u{200B}", "U+200B ZERO WIDTH SPACE is not on the space list: canonical (clients may warn)"),
        ("a\u{2800}", "U+2800 BRAILLE PATTERN BLANK is not on the space list: canonical"),
        ("a\n", "rule 10: a final line break"),
        ("\n", "rule 10: only a line break"),
        (" ", "rule 10: only a space"),
        ("a\u{FDD0}", "rule 11: noncharacter U+FDD0"),
        ("a\u{FFFE}", "rule 11: noncharacter U+FFFE"),
        ("a\u{10FFFF}", "rule 11: noncharacter U+10FFFF"),
        ("a\u{85}b\u{FEFF}", "rules 9 and 7 both broken, the control character first: the rule named is 7, the first in the order numbered (rule 13)"),
        ("a \nb\u{FDD0}\r", "rules 10, 11 and 8 broken, in that order along the string: the rule named is 8"),
        ("a\u{202E}b\u{202C}", "bidirectional controls are canonical (shown visibly before signing terms)"),
        ("\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}", "an emoji sequence with ZERO WIDTH JOINER: canonical"),
        ("a\u{1F}b", "rule 9: the last C0 control, U+001F"),
        ("a\u{1680}", "rule 10: ending with OGHAM SPACE MARK, on the fixed list"),
        ("a\u{2000}\nb", "rule 10: a line ending with EN QUAD, the first of U+2000 to U+200A"),
        ("a\u{200A}", "rule 10: ending with HAIR SPACE, the last of U+2000 to U+200A"),
        ("a\u{202F}", "rule 10: ending with NARROW NO-BREAK SPACE"),
        ("a\u{205F}", "rule 10: ending with MEDIUM MATHEMATICAL SPACE"),
        ("a\u{FDEF}", "rule 11: noncharacter U+FDEF, the last of U+FDD0 to U+FDEF"),
        ("a\u{FDCF}", "U+FDCF, just below the noncharacter block, assigned: canonical"),
        ("a\u{1FFFE}", "rule 11: noncharacter U+1FFFE, plane 1"),
        ("a\u{378}", "U+0378, not assigned in Unicode 17.0: left as it is, canonical (rule 12)"),
        ("a\u{2066}b\u{2069}", "bidirectional isolates are canonical (rule 6 protects in display)"),
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
        "description": "Canonical text (Text rules 7 to 13). `rule` is the rule broken, numbered as Text numbers it: where several are broken, the first of rules 7 to 12 in the order numbered, each checked over the whole string before the next, rule 12 (NFC, Unicode 17.0 tables) last; null if canonical.",
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
        "description": "Running summary (Envelopes, \"Sequences\"): root of a Merkle mountain range over act ids. leaf = tagged_hash(\"MOR/mmr-leaf\", id); node = tagged_hash(\"MOR/mmr-node\", left || right); peaks bagged right to left as node(peak, bagged so far); one peak is its own root; no acts gives 32 zero bytes. The act ids here are stand-ins: SHA-256 of the single byte 1, 2, 3 ...",
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
        "description": "The three-act running-summary vector (Envelopes, \"Sequences\"). Three public text acts (Text, type 0) in one sequence of one signer. Each act carries prev, its position and the running summary up to and including the previous act; act 1 carries the empty summary. `summary_including_last` is the summary over all three, as a rotation's kept tip carries it. `spec`, `signer` and `binding` are stand-ins (SHA-256 of a label): MIR hashes are fixed only at the freeze, and signatures are part 2 of the core library, so no signature is given. The act id does not depend on the signature.",
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
    // A new content key and nonce for every object sealed (Envelopes rule 9).
    let key_of = |case: &str| -> ([u8; 32], [u8; 24]) { (fixed(&format!("mor-core vector: content key, {case}")), fixed_n(&format!("mor-core vector: nonce, {case}"))) };
    let (key, nonce) = key_of("the valid inside");
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
    let (k, n) = key_of("a text not canonical");
    let (o4, l4) = act::seal(&bad_text, &k, &n, &addr);
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
    let (k, n) = key_of("an unknown inside key");
    let (o5, l5) = act::seal_encoded(&cbor::encode(&bad_key), &k, &n, &addr);
    cases.push(("an unknown inside key (11)".into(), o5, l5, "shape"));

    let no_salt = {
        let mut v = good.to_value();
        if let Value::Map(m) = &mut v {
            m.retain(|(k, _)| *k != Value::Uint(10));
        }
        v
    };
    let (k, n) = key_of("no salt");
    let (o6, l6) = act::seal_encoded(&cbor::encode(&no_salt), &k, &n, &addr);
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
    let (k, n) = key_of("map keys out of order");
    let (o7, l7) = act::seal_encoded(&swapped, &k, &n, &addr);
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
    // Envelopes rule 1: an unknown key on the outside makes the act invalid,
    // before anything is opened (S7g, Envelopes).
    let mut v = v;
    let (o, l) = act::seal(&good, &key, &nonce, &addr);
    let mut extra = o.to_value();
    if let Value::Map(m) = &mut extra {
        m.push((Value::Uint(7), Value::Uint(0)));
    }
    let extra = cbor::encode(&extra);
    assert!(matches!(act::Outside::from_value(&cbor::decode(&extra).unwrap()), Err(act::ActError::Shape(_))));
    v.push(json!({ "why": "an unknown outside key (7)", "outside": hx(&extra), "locked": hx(&l), "result": "shape" }));
    json!({
        "description": "Opening an act (Envelope rules 1, 2, 3, 5): decode the outside in its shape (an unknown key is refused), check the locked hash, unlock with the outside's content key (XChaCha20-Poly1305, no associated data), check the inside commitment over the unlocked bytes, then decode the inside as deterministic CBOR in the Envelope's shape with canonical text. Each case gives the first check that fails, in that order, or ok.",
        "vectors": v,
    })
}

/// A sealed container in the Envelopes MIR's format: `[to,
/// locked-act]`, no one-time key and no signature. Every input fixed: the
/// recipient's X-Wing secret, the inner act (private, addressed to the
/// recipient, signed with a fixed Schnorr key), the container key, the
/// nonce and the X-Wing `eseed`.
fn sealed_container() -> J {
    use mor_core::envelopes::{self, DecKey, Recipient, SealRandom};
    let spec = fixed("mor-core vector: stand-in for the TEXT spec hash, fixed at freeze");
    let recipient = fixed("mor-core vector: stand-in recipient identity");
    let dk = DecKey::from_secret(fixed("mor-core vector: recipient X-Wing secret"));
    let signer_key = mor_core::sig::SchnorrKey::from_secret(&fixed("mor-core vector: stand-in signing secret")).unwrap();
    let inside = Inside {
        spec,
        type_: 0,
        prev: Some(vec![]),
        objects: None,
        payload: vec![(Value::Uint(0), Value::Text("A private reply.".into()))],
        position: Some(1),
        summary: Some([0; 32]),
        acks: None,
        refs: None,
        hint: None,
        salt: fixed_n("mor-core vector: sealed salt"),
    };
    let content_key: [u8; 32] = fixed("mor-core vector: sealed content key");
    let inner = act::make(
        &inside,
        &content_key,
        &fixed_n("mor-core vector: sealed inner nonce"),
        &Addressing {
            signer: Some(fixed("mor-core vector: stand-in signer identity")),
            binding: Some(fixed("mor-core vector: stand-in binding")),
            public: false,
            to: Some(vec![recipient]),
        },
        |id| signer_key.sign(id, &[0; 32]),
    );
    let rnd = SealRandom {
        container_key: fixed("mor-core vector: container key"),
        nonce: fixed_n("mor-core vector: container nonce"),
        eseeds: vec![[fixed("mor-core vector: eseed, first half"), fixed("mor-core vector: eseed, second half")].concat().try_into().unwrap()],
    };
    let sealed = envelopes::seal(&inner, Some(&content_key), &[Recipient::Identity { id: recipient, key: dk.public.clone() }], &rnd).unwrap();
    let opened = envelopes::open(&sealed, Some(&recipient), &dk).unwrap();
    assert_eq!(opened.act, inner);
    // Envelopes rule 12: a container that fails "Opening" (step 4) or whose
    // inner act fails "Addressing" (step 5) is invalid and delivers nothing
    // (S7g, Envelopes). Each sealed to the same recipient, fresh randomness each.
    let rnd_for = |case: &str| SealRandom {
        container_key: fixed(&format!("mor-core vector: container key, {case}")),
        nonce: fixed_n(&format!("mor-core vector: container nonce, {case}")),
        eseeds: vec![[fixed(&format!("mor-core vector: eseed, first half, {case}")), fixed(&format!("mor-core vector: eseed, second half, {case}"))].concat().try_into().unwrap()],
    };
    let inner_as = |case: &str, public: bool, to: Hash| {
        act::make(
            &Inside { salt: fixed_n(&format!("mor-core vector: sealed salt, {case}")), ..inside.clone() },
            &fixed(&format!("mor-core vector: sealed content key, {case}")),
            &fixed_n(&format!("mor-core vector: sealed inner nonce, {case}")),
            &Addressing {
                signer: Some(fixed("mor-core vector: stand-in signer identity")),
                binding: Some(fixed("mor-core vector: stand-in binding")),
                public,
                to: Some(vec![to]),
            },
            |id| signer_key.sign(id, &[0; 32]),
        )
    };
    let me = [Recipient::Identity { id: recipient, key: dk.public.clone() }];
    let mut invalid = vec![];
    let c = "addressed to another";
    let other = inner_as(c, false, fixed("mor-core vector: stand-in other identity"));
    let s1 = envelopes::seal(&other, Some(&fixed(&format!("mor-core vector: sealed content key, {c}"))), &me, &rnd_for(c)).unwrap();
    assert!(matches!(envelopes::open(&s1, Some(&recipient), &dk), Err(envelopes::EnvError::Addressing(_))));
    invalid.push(json!({ "why": "the inner act's own to names another identity than the recipient (step 5)", "sealed": hx(&s1.encode()), "result": "addressing" }));
    let c = "a key for a public act";
    let public = inner_as(c, true, recipient);
    let s2 = envelopes::seal(&public, Some(&fixed(&format!("mor-core vector: sealed content key, {c}"))), &me, &rnd_for(c)).unwrap();
    assert!(matches!(envelopes::open(&s2, Some(&recipient), &dk), Err(envelopes::EnvError::Shape(_))));
    invalid.push(json!({ "why": "contents carry a key for a public inner act (step 4)", "sealed": hx(&s2.encode()), "result": "shape" }));
    let mut parts = cbor::decode(&sealed.locked_act).unwrap();
    if let Value::Array(a) = &mut parts {
        if let Value::Array(caps) = &mut a[0] {
            let first = caps[0].clone();
            caps.push(first);
        }
    }
    let s3 = envelopes::Sealed { to: sealed.to.clone(), locked_act: cbor::encode(&parts) };
    assert!(matches!(envelopes::open(&s3, Some(&recipient), &dk), Err(envelopes::EnvError::Shape(_))));
    invalid.push(json!({ "why": "two capsules for one recipient in to (step 1)", "sealed": hx(&s3.encode()), "result": "shape" }));
    json!({
        "description": "A sealed container in the Envelopes MIR's format: sealed = [to, locked-act], no one-time key and no signature, its outside unauthenticated by design. locked-act = [capsules, nonce, locked], one capsule [ct, wrapped] per recipient: ct the X-Wing ciphertext of encapsulating to the recipient's key with eseed, wrapped the container key locked under tagged_hash(\"MOR/sealed/wrap\", shared secret) with a zero nonce; locked opens with the container key and nonce to contents = [act, key], the inner act and its content key. The recipient's public key is X-Wing's from the secret given. Every input is fixed; the spec, signer and binding are stand-ins.",
        "recipient": hx(&recipient),
        "recipient_xwing_secret": hx(&fixed("mor-core vector: recipient X-Wing secret")),
        "recipient_xwing_public": hx(&dk.public.key),
        "inner_act": hx(&inner.encode()),
        "inner_act_id": hx(&inner.id()),
        "content_key": hx(&content_key),
        "container_key": hx(&rnd.container_key),
        "nonce": hx(&rnd.nonce),
        "eseed": hx(&rnd.eseeds[0]),
        "sealed": hx(&sealed.encode()),
        "invalid": invalid,
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
    write(&dir, "sealed.json", &sealed_container());
    write(&dir, "textual-forms.json", &textual_forms());
    write(&dir, "signatures.json", &signatures());
    write(&dir, "verdicts.json", &verdict_vectors());
}

/// The verdict vectors (`support/verdicts.rs`): complete acts, in one pool
/// by act id, and each case naming the acts it holds.
fn verdict_vectors() -> J {
    let mut out = verdicts::Out { pool: Default::default(), cases: vec![] };
    let mut layers = serde_json::Map::new();
    for (layer, f) in [
        ("identity", verdicts::identity as fn(&mut verdicts::Out)),
        ("text", verdicts::text),
        ("envelopes", verdicts::envelopes),
        ("money", verdicts::money),
        ("agreements", verdicts::agreements),
    ] {
        out.cases.clear();
        f(&mut out);
        layers.insert(layer.into(), J::Array(out.cases.clone()));
    }
    let mut dev = vec![];
    verdicts::development(&mut dev);
    layers.insert("development".into(), J::Array(dev));
    layers.insert("mir_hashes".into(), J::Array(verdicts::mir_hashes()));
    let m = verdicts::mirs();
    json!({
        "about": "Verdict vectors: for each case, the acts a verifier holds (by id, from the pool: each act's complete bytes, outside, locked inside and signature, as Envelopes encodes an act; every act public, its content key on its outside), the facts it holds beside them that are not acts (inclusion proofs a home served, each naming the receipt it proves; homes it failed to reach; anchors it checked; rail answers it was given: that a receipt or claim is valid, paid to a flow, and which payment a proof is; the specifications of rail Modules it adopted, whose fields 11 and 13 give each rail's kind and what its proof binds; a private act's content key, as its recipient holds it; private acts found at a home, with the home's operator; a judge's period passed on a question, and settlements signed before their link's stage opened, as the time reference says), the question asked and the verdict the texts give, with the rule that decides it. Questions: status (Identity's standing of an act: valid, pending, void, disputed, invalid, unknown, scoped, not counting); chain (the acts counting at each position of an identity chain, what stops it, and homes proven dishonest from a position on); succession (Identity, \"Succession\": none, declared, confirmed and followed, unknown, or another protocol's, with the successor and its confirmation); status after keepers (Identity's standing once Agreements has read the keeper records held and named the acts their keepers recorded before the rotation voiding them); backing (Agreements rule 80 for an act of a grant key); consent counts (whether an act for a collective has the consent its layer's rule, or the finer area reaching it, needs); agreement exists; deal fork; deadline (rule 33, under the keepers and rule given, on the clock given, at the point given); closing and fork (whether a collective's closing or fork is complete); version in force (a deal's, as its chain of judgment settles it); vow (each sale's state, the payments signed by nobody, and those whose place is unknown); purchase contests (the contests shown beside a purchase, by the act that is it: the buyer's payer's claim of the payment, or the buyer's signature act on an offer at no price; or unknown); refund repaid (what Money shows paid back toward a refund, or unknown); paid toward (what counts toward an obligation, or unknown where it rests on a payment the rail's answer does not name); payment counts (whether a receipt or claim the rail answered paid counts for its payee, Money rules 4 and 12 to 15: counts, does not count, or unknown); purchase (Agreements rule 12's verdict on a receipt or claim: purchase, no purchase, unrecorded, wrong receipt, unknown, or not a payment for a work); disagreements (how many open questions a receiver shows, Money rule 11, or unknown likewise); specification claim (Development rule 3: whether a publication claims a specification for the creator given: claimed, unclaimed, unclaimed shown as disputed, or unknown); agreement invalid (whether an agreement's terms are invalid, a false mark included, or refused outside their format: invalid, not invalid, or unknown); liveness (whether a party's liveness act shows presence: shows presence, shows nothing, or unknown); price tag (Money rule 18, as a verifier reading Money and Envelopes tells it: counts, nobody's offer, or unknown, a tag under a publication being Agreements' to judge); transfer (Agreements rule 10: whether a stake transfer takes effect, and the seller's payout receipts after its place on the seller's own line, wrong receipts); split (rules 15 and 30: the holders and partners a split pays other than its plan says, any breaking the plan); record (rule 69: whether a record of the collective given is a line, and the clone it puts in force, or null); owed back by (rule 11: who owes a payment racing an ending back, and how much: the split service from what it holds, then each party in the share it received). The MIR hashes are stand-ins, SHA-256 of a label, until the freeze: identity, envelopes, text, money, agreements, development below. Every key is test data derived from a name.",
        "mirs": { "identity": hx(&m.identity), "envelopes": hx(&m.envelopes), "text": hx(&m.text), "money": hx(&m.money), "agreements": hx(&m.agreements), "development": hx(&m.development) },
        "pool": out.pool,
        "cases": layers,
    })
}

/// A source of randomness that must never be drawn from: SLH-DSA signing
/// with `hedged = false` draws nothing.
struct NoRandom;
impl rand_core::RngCore for NoRandom {
    fn next_u32(&mut self) -> u32 {
        unreachable!()
    }
    fn next_u64(&mut self) -> u64 {
        unreachable!()
    }
    fn fill_bytes(&mut self, _: &mut [u8]) {
        unreachable!()
    }
    fn try_fill_bytes(&mut self, _: &mut [u8]) -> Result<(), rand_core::Error> {
        unreachable!()
    }
}
impl rand_core::CryptoRng for NoRandom {}

/// The verdict the library gives a signature over an act id.
fn verdict(scheme: &act::Scheme, key: &[u8], sig: &[u8], msg: &Hash) -> &'static str {
    match mor_core::sig::verify(&act::Signature { scheme: scheme.clone(), key: key.to_vec(), sig: sig.to_vec() }, msg) {
        mor_core::sig::Verdict::Valid => "valid",
        mor_core::sig::Verdict::Invalid => "invalid",
        mor_core::sig::Verdict::Unknown => "unknown",
    }
}

/// Part 2: signatures (Identity, "Signature schemes"). Schnorr over
/// secp256k1 (BIP-340) for signing keys, scheme 1; SLH-DSA-SHA2-128s and
/// -128f (FIPS 205, pure, context `MOR`) for chain keys, schemes 2 and 3.
/// Keys from fixed seeds (test data), the bytes signed (a 32-byte act id),
/// the signatures, and signatures that must fail, one reason each.
fn signatures() -> J {
    use act::Scheme;
    use mor_core::sig::{self, SchnorrKey, SlhKey};
    let msg = fixed("mor-core vector: the act id signed");
    let other_msg = fixed("mor-core vector: another act id");
    let flip = |b: &[u8], at: usize| {
        let mut v = b.to_vec();
        v[at] ^= 0x01;
        v
    };
    // Schnorr.
    let secret = fixed("mor-core vector: schnorr secret (test data)");
    let aux = fixed("mor-core vector: schnorr aux (test data)");
    let k = SchnorrKey::from_secret(&secret).unwrap();
    let other = SchnorrKey::from_secret(&fixed("mor-core vector: another schnorr secret (test data)")).unwrap();
    let s = k.sign(&msg, &aux);
    let s0 = k.sign(&msg, &[0; 32]);
    let pk = k.public().to_vec();
    assert_eq!(verdict(&sig::SCHNORR, &pk, &s.sig, &msg), "valid");
    assert_eq!(verdict(&sig::SCHNORR, &pk, &s0.sig, &msg), "valid");
    // A 32-byte x with no point on the curve: x = 5 has none (5^3 + 7 is not a square mod p).
    let mut not_on_curve = vec![0u8; 32];
    not_on_curve[31] = 5;
    // r = p, the field size, which no x-coordinate equals.
    let p_bytes = hex::decode("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f").unwrap();
    let n_bytes = hex::decode("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141").unwrap();
    let r_is_p = [p_bytes.clone(), s.sig[32..].to_vec()].concat();
    let s_is_n = [s.sig[..32].to_vec(), n_bytes.clone()].concat();
    let sch_fail: Vec<(&str, Vec<u8>, Vec<u8>, Hash)> = vec![
        ("one bit of s changed", pk.clone(), flip(&s.sig, 63), msg),
        ("one bit of r changed", pk.clone(), flip(&s.sig, 0), msg),
        ("a valid signature over another act id", pk.clone(), k.sign(&other_msg, &aux).sig, msg),
        ("signed by another key", pk.clone(), other.sign(&msg, &aux).sig, msg),
        ("a public key that is no point of the curve", not_on_curve, s.sig.clone(), msg),
        ("r is not below the field size p", pk.clone(), r_is_p, msg),
        ("s is not below the group order n", pk.clone(), s_is_n, msg),
        ("a signature of 63 bytes", pk.clone(), s.sig[..63].to_vec(), msg),
        ("a public key of 33 bytes (compressed SEC1, not x-only)", [vec![0x02], pk.clone()].concat(), s.sig.clone(), msg),
    ];
    let sch_fail: Vec<J> = sch_fail
        .into_iter()
        .map(|(why, key, sg, m)| {
            assert_eq!(verdict(&sig::SCHNORR, &key, &sg, &m), "invalid", "{why}");
            json!({ "why": why, "key": hx(&key), "msg": hx(&m), "sig": hx(&sg), "verdict": "invalid" })
        })
        .collect();
    // SLH-DSA.
    let mut slh = vec![];
    for (scheme, name) in [(2u8, "SLH-DSA-SHA2-128s"), (3u8, "SLH-DSA-SHA2-128f")] {
        let seed = |w: &str| -> [u8; 16] { fixed_n(&format!("mor-core vector: {name} {w} (test data)")) };
        let (sk_seed, sk_prf, pk_seed) = (seed("sk_seed"), seed("sk_prf"), seed("pk_seed"));
        let key = SlhKey::from_seeds(scheme, &sk_seed, &sk_prf, &pk_seed);
        let other = SlhKey::from_seeds(scheme, &seed("another sk_seed"), &sk_prf, &pk_seed);
        let pk = key.public();
        let sc = Scheme::Founding(scheme);
        let det = key.sign(&msg, None);
        let opt_rand = seed("opt_rand");
        let hedged = key.sign(&msg, Some(&opt_rand));
        assert_eq!(verdict(&sc, &pk, &det.sig, &msg), "valid");
        assert_eq!(verdict(&sc, &pk, &hedged.sig, &msg), "valid");
        let no_context = match &key {
            SlhKey::S(k) => {
                use fips205::traits::Signer;
                k.try_sign_with_rng(&mut NoRandom, &msg, b"", false).unwrap().to_vec()
            }
            SlhKey::F(k) => {
                use fips205::traits::Signer;
                k.try_sign_with_rng(&mut NoRandom, &msg, b"", false).unwrap().to_vec()
            }
        };
        let fails: Vec<(&str, Vec<u8>, Vec<u8>)> = vec![
            ("one byte of R, the randomizer, changed", pk.clone(), flip(&det.sig, 0)),
            ("one byte in the FORS part changed", pk.clone(), flip(&det.sig, 100)),
            ("the last byte, in the hypertree part, changed", pk.clone(), flip(&det.sig, det.sig.len() - 1)),
            ("a valid signature over another act id", pk.clone(), key.sign(&other_msg, None).sig),
            ("signed by another key with the same public seed", pk.clone(), other.sign(&msg, None).sig),
            ("signed with the empty context, not MOR", pk.clone(), no_context),
            ("a signature one byte short", pk.clone(), det.sig[..det.sig.len() - 1].to_vec()),
            ("a public key whose root is changed", flip(&pk, 31), det.sig.clone()),
        ];
        let fails: Vec<J> = fails
            .into_iter()
            .map(|(why, k2, sg)| {
                assert_eq!(verdict(&sc, &k2, &sg, &msg), "invalid", "{name}: {why}");
                json!({ "why": why, "key": hx(&k2), "msg": hx(&msg), "sig": hx(&sg), "verdict": "invalid" })
            })
            .collect();
        slh.push(json!({
            "scheme": scheme,
            "name": name,
            "sk_seed": hx(&sk_seed),
            "sk_prf": hx(&sk_prf),
            "pk_seed": hx(&pk_seed),
            "public_key": hx(&pk),
            "commitment": hx(&key.commitment()),
            "msg": hx(&msg),
            "deterministic": hx(&det.sig),
            "opt_rand": hx(&opt_rand),
            "hedged": hx(&hedged.sig),
            "invalid": fails,
        }));
    }
    let sch_commit = sig::chain_key_commitment(&sig::SCHNORR, &pk);
    json!({
        "about": "Identity, \"Signature schemes\": every signature signs the 32-byte act id. Scheme 1: Schnorr over secp256k1, BIP-340, public key 32 bytes (x-only), signature 64 bytes; signing with the given aux (BIP-340's auxiliary randomness). Schemes 2 and 3: SLH-DSA-SHA2-128s and SLH-DSA-SHA2-128f, FIPS 205, pure signing with the context string MOR (the message signed is 0x00 || 0x03 || \"MOR\" || act id), public key 32 bytes (PK.seed || PK.root), signatures 7856 and 17088 bytes; keys from the three 16-byte seeds (slh_keygen_internal); deterministic signing takes opt_rand = PK.seed, hedged signing the opt_rand given. A key or signature of the wrong length is invalid. A chain-key commitment is tagged_hash(\"MOR/safety\", scheme byte || public key). Every secret and seed here is test data, derived from a label, and must never be used for anything else.",
        "msg": hx(&msg),
        "schnorr": {
            "secret": hx(&secret),
            "public_key": hx(&pk),
            "aux": hx(&aux),
            "sig": hx(&s.sig),
            "sig_zero_aux": hx(&s0.sig),
            "commitment_if_scheme_1": hx(&sch_commit),
            "invalid": sch_fail,
        },
        "slh_dsa": slh,
    })
}

/// The textual forms (Identity draft 14, "Written for people"; F349): each
/// label's short form; the where-it-lives form; bare hex; and the strings
/// refused, each with why: a character mistyped, the string cut, a wrong
/// label (an act where an identity is wanted), mixed case, a label the core
/// does not define.
fn textual_forms() -> J {
    use mor_core::textual::{self as tf, Kind};
    let key = cbor::encode(&Value::Array(vec![Value::Uint(1), Value::Bytes(fixed("a signing key").to_vec())]));
    let cases: Vec<(Kind, Vec<u8>)> = vec![
        (Kind::Identity, fixed("an identity").to_vec()),
        (Kind::Act, fixed("an act").to_vec()),
        (Kind::Key, key.clone()),
        (Kind::Spec, fixed("a specification").to_vec()),
        (Kind::Work, fixed("a work").to_vec()),
    ];
    let forms: Vec<J> = cases.iter().map(|(k, d)| json!({ "kind": k.label(), "data": hx(d), "form": tf::encode(*k, d) })).collect();
    let id = tf::encode(Kind::Identity, &fixed("an identity"));
    let act = tf::encode(Kind::Act, &fixed("an act"));
    // One character changed, in the data part.
    let mut typo = id.clone().into_bytes();
    let at = 10;
    typo[at] = if typo[at] == b'q' { b'p' } else { b'q' };
    let typo = String::from_utf8(typo).unwrap();
    let cut = id[..id.len() - 1].to_string();
    let mixed = format!("{}{}", &id[..5].to_ascii_uppercase(), &id[5..]);
    // A valid bech32m string under a label no core kind has (a cMIP's, say).
    let unknown = tf::encode_label("mvow", &fixed("an identity"));
    let refuse = |s: &str, want: Kind| -> String {
        match tf::read(s, want) {
            Ok(_) => "accepted".into(),
            Err(e) => match e {
                tf::Refusal::Checksum => "checksum".into(),
                tf::Refusal::MixedCase => "mixed case".into(),
                tf::Refusal::UnknownLabel(_) => "unknown label".into(),
                tf::Refusal::WrongKind { got, wanted } => format!("wrong kind: {} where {} is wanted", got.label(), wanted.label()),
                tf::Refusal::NotAForm(_) => "not a form".into(),
                tf::Refusal::Shape(_) => "shape".into(),
            },
        }
    };
    let hints = ["https://home1.example.org", "https://relay.example.org/mor"];
    json!({
        "about": "Identity, part three, \"Written for people\": bech32m (BIP-350), lowercase; labels mid, mact, mkey, mspec, mwork; a key's data is Identity's [scheme, key] in deterministic CBOR; the where-it-lives form is the short form, then ?r= hints, percent-encoded, outside the checksum; bare hex (64 characters) accepted for a 32-byte hash.",
        "forms": forms,
        "upper": { "form": id.to_ascii_uppercase(), "want": "mid", "data": hx(&fixed("an identity")) },
        "lives": { "form": tf::with_hints(Kind::Identity, &fixed("an identity"), &hints), "want": "mid", "data": hx(&fixed("an identity")), "hints": hints },
        "bare": { "form": hx(&fixed("an act")), "want": "mact", "data": hx(&fixed("an act")) },
        "refused": [
            { "form": typo, "want": "mid", "why": refuse(&typo, Kind::Identity) },
            { "form": cut, "want": "mid", "why": refuse(&cut, Kind::Identity) },
            { "form": act, "want": "mid", "why": refuse(&act, Kind::Identity) },
            { "form": mixed, "want": "mid", "why": refuse(&mixed, Kind::Identity) },
            { "form": unknown, "want": "mid", "why": refuse(&unknown, Kind::Identity) },
        ],
    })
}
