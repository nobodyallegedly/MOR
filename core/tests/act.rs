//! Acts: decoding the whole act, and an everyday act's place in its sequence
//! (Envelopes rules 1 and 4).

use mor_core::act::{
    self, Act, ActError, Addressing, Inside, Scheme, Sequence, SequenceError, Signature,
};
use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash, ZERO_HASH};
use mor_core::mmr;

fn inside(prev: Option<Vec<Hash>>, position: Option<u64>, summary: Option<Hash>) -> Inside {
    Inside {
        spec: sha256(b"spec"),
        type_: 0,
        prev,
        objects: None,
        payload: vec![(Value::Uint(0), Value::Text("hi".into()))],
        position,
        summary,
        acks: None,
        refs: None,
        hint: None,
        salt: [1; 16],
    }
}

fn sealed(i: &Inside) -> Act {
    let (outside, locked) = act::seal(
        i,
        &[2; 32],
        &[3; 24],
        &Addressing {
            public: true,
            ..Default::default()
        },
    );
    Act {
        outside,
        locked,
        signature: Signature {
            scheme: Scheme::Founding(1),
            key: vec![0; 32],
            sig: vec![0; 64],
        },
    }
}

#[test]
fn a_sequence_of_three_then_every_way_to_break_the_fourth() {
    let mut seq = Sequence::new();
    let a1 = inside(Some(vec![]), Some(1), Some(ZERO_HASH));
    let id1 = sealed(&a1).id();
    seq.append(&id1, &a1).unwrap();
    let a2 = inside(Some(vec![id1]), Some(2), Some(mmr::summary(&[id1])));
    let id2 = sealed(&a2).id();
    seq.append(&id2, &a2).unwrap();
    let a3 = inside(Some(vec![id2]), Some(3), Some(mmr::summary(&[id1, id2])));
    let id3 = sealed(&a3).id();
    seq.append(&id3, &a3).unwrap();

    let good = || {
        inside(
            Some(vec![id3]),
            Some(4),
            Some(mmr::summary(&[id1, id2, id3])),
        )
    };
    assert_eq!(seq.check_next(&good()), Ok(()));

    let cases = [
        (
            Inside {
                prev: None,
                ..good()
            },
            SequenceError::MissingPrev,
        ),
        (
            Inside {
                prev: Some(vec![]),
                ..good()
            },
            SequenceError::WrongPrev,
        ),
        (
            Inside {
                prev: Some(vec![id2]),
                ..good()
            },
            SequenceError::WrongPrev,
        ),
        (
            Inside {
                prev: Some(vec![id3, id2]),
                ..good()
            },
            SequenceError::SeveralPrev,
        ),
        (
            Inside {
                position: None,
                ..good()
            },
            SequenceError::MissingPosition,
        ),
        (
            Inside {
                position: Some(5),
                ..good()
            },
            SequenceError::WrongPosition,
        ),
        (
            Inside {
                position: Some(3),
                ..good()
            },
            SequenceError::WrongPosition,
        ),
        (
            Inside {
                summary: None,
                ..good()
            },
            SequenceError::MissingSummary,
        ),
        (
            Inside {
                summary: Some(mmr::summary(&[id1, id2])),
                ..good()
            },
            SequenceError::WrongSummary,
        ),
        (
            Inside {
                summary: Some(ZERO_HASH),
                ..good()
            },
            SequenceError::WrongSummary,
        ),
    ];
    for (i, want) in cases {
        assert_eq!(seq.check_next(&i), Err(want));
    }
}

#[test]
fn the_first_act_carries_an_empty_prev_and_the_empty_summary() {
    let seq = Sequence::new();
    assert_eq!(
        seq.check_next(&inside(Some(vec![]), Some(1), Some(ZERO_HASH))),
        Ok(())
    );
    assert_eq!(
        seq.check_next(&inside(Some(vec![]), Some(0), Some(ZERO_HASH))),
        Err(SequenceError::WrongPosition)
    );
    assert_eq!(
        seq.check_next(&inside(Some(vec![]), Some(1), Some([1; 32]))),
        Err(SequenceError::WrongSummary)
    );
    assert_eq!(
        seq.check_next(&inside(Some(vec![[9; 32]]), Some(1), Some(ZERO_HASH))),
        Err(SequenceError::WrongPrev)
    );
}

#[test]
fn a_whole_act_round_trips_and_opens() {
    let a = sealed(&inside(Some(vec![]), Some(1), Some(ZERO_HASH)));
    let bytes = a.encode();
    let back = Act::decode(&bytes).unwrap();
    assert_eq!(back, a);
    assert_eq!(back.encode(), bytes);
    back.check_locked_hash().unwrap();
    assert_eq!(
        back.open(None).unwrap(),
        inside(Some(vec![]), Some(1), Some(ZERO_HASH))
    );
}

#[test]
fn a_private_act_opens_only_with_its_key() {
    let i = inside(Some(vec![]), Some(1), Some(ZERO_HASH));
    let (outside, locked) = act::seal(
        &i,
        &[2; 32],
        &[3; 24],
        &Addressing {
            to: Some(vec![[7; 32]]),
            ..Default::default()
        },
    );
    assert!(!outside.is_public());
    assert_eq!(act::open(&outside, &locked, None), Err(ActError::NoKey));
    assert_eq!(
        act::open(&outside, &locked, Some(&[4; 32])),
        Err(ActError::Unlock)
    );
    assert_eq!(act::open(&outside, &locked, Some(&[2; 32])).unwrap(), i);
}

fn with_outside_entry(a: &Act, k: u64, v: Value) -> Vec<u8> {
    let Value::Array(mut parts) = a.to_value() else {
        unreachable!()
    };
    if let Value::Map(m) = &mut parts[0] {
        m.retain(|(key, _)| *key != Value::Uint(k));
        m.push((Value::Uint(k), v));
    }
    cbor::encode(&Value::Array(parts))
}

#[test]
fn the_shape_is_exact() {
    let a = sealed(&inside(Some(vec![]), Some(1), Some(ZERO_HASH)));
    // An unknown outside key makes the act invalid.
    assert!(matches!(
        Act::decode(&with_outside_entry(&a, 7, Value::Uint(0))),
        Err(ActError::Shape(_))
    ));
    // A hash of the wrong size.
    assert!(matches!(
        Act::decode(&with_outside_entry(&a, 0, Value::Bytes(vec![0; 31]))),
        Err(ActError::Shape(_))
    ));
    // A nonce of the wrong size.
    assert!(matches!(
        Act::decode(&with_outside_entry(&a, 4, Value::Bytes(vec![0; 12]))),
        Err(ActError::Shape(_))
    ));
    // An empty `to` ([+ hash] needs one or more).
    assert!(matches!(
        Act::decode(&with_outside_entry(&a, 6, Value::Array(vec![]))),
        Err(ActError::Shape(_))
    ));
    // A scheme that is neither 1, 2, 3 nor a 32-byte hash.
    let Value::Array(mut parts) = a.to_value() else {
        unreachable!()
    };
    parts[2] = Value::Array(vec![
        Value::Uint(4),
        Value::Bytes(vec![]),
        Value::Bytes(vec![]),
    ]);
    assert!(matches!(
        Act::decode(&cbor::encode(&Value::Array(parts))),
        Err(ActError::Shape(_))
    ));
    // A scheme named by specification hash is accepted.
    let Value::Array(mut parts) = a.to_value() else {
        unreachable!()
    };
    parts[2] = Value::Array(vec![
        Value::Bytes(vec![5; 32]),
        Value::Bytes(vec![]),
        Value::Bytes(vec![]),
    ]);
    assert_eq!(
        Act::decode(&cbor::encode(&Value::Array(parts)))
            .unwrap()
            .signature
            .scheme,
        Scheme::Spec([5; 32])
    );
    // Trailing bytes after the act.
    let mut bytes = a.encode();
    bytes.push(0);
    assert!(matches!(Act::decode(&bytes), Err(ActError::Cbor(_))));
}

#[test]
fn every_text_in_the_inside_is_canonical() {
    let mut i = inside(Some(vec![]), Some(1), Some(ZERO_HASH));
    i.hint = Some("2026-09-28 ".into());
    let a = sealed(&i);
    assert!(matches!(a.open(None), Err(ActError::Text(_))));
    let mut i = inside(Some(vec![]), Some(1), Some(ZERO_HASH));
    i.payload = vec![(Value::Text("cafe\u{301}".into()), Value::Uint(1))];
    assert!(matches!(sealed(&i).open(None), Err(ActError::Text(_))));
    let mut i = inside(Some(vec![]), Some(1), Some(ZERO_HASH));
    i.refs = Some(vec![act::Ref::Web {
        address: "https://example.org/\t".into(),
        hash: None,
    }]);
    assert!(matches!(sealed(&i).open(None), Err(ActError::Text(_))));
}
