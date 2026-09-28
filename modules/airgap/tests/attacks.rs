//! The Module's attack tests (section 7), and the device rules they press on.

mod common;

use common::*;
use mor_airgap::device::{Choices, Exception, Refusal, Signer, Standing};
use mor_airgap::msg::{kind, Message, MsgError, PendingRotation};
use mor_airgap::online::{self, Rejection};
use mor_airgap::seed::SeedModule;
use mor_airgap::summary::fingerprint;
use mor_airgap::transport::{self, QrReceiver, QrSender};
use mor_core::cbor::{self, Value};
use mor_core::hash::sha256;
use mor_core::identity::{
    Audit, Declaration, HomeRule, Rotation, SafetyCommit, SigningKey, Successor,
};
use mor_core::sig;

fn review(o: &mut Owner, p: &Message) -> Result<mor_airgap::device::Review, Refusal> {
    o.device
        .review(&p.encode(), &Choices::default(), &mut o.rng)
}

fn review_r(o: &mut Owner, r: &Rotation) -> Result<mor_airgap::device::Review, Refusal> {
    let p = o.pending(r);
    review(o, &p)
}

fn review_esc(o: &mut Owner, r: &Rotation) -> Result<mor_airgap::device::Review, Refusal> {
    let p = online::pending(&identity_spec(), &o.last, r, None, true);
    review(o, &p)
}

// ---------------------------------------------------------------- rule 3.1

#[test]
fn every_consequential_field_changed_online_is_shown_prominently() {
    let mut o = Owner::new("fields", SeedModule::Words, 2);
    let unit = sha256(b"a unit");
    let rail = sha256(b"a rail");
    type Change = Box<dyn Fn(&mut Rotation)>;
    let cases: Vec<(&str, Change)> = vec![
        (
            "Homes change",
            Box::new(|r| r.homes = Some(vec![home("thief")])),
        ),
        (
            "Home rule",
            Box::new(|r| {
                r.homes = Some(vec![home("a"), home("b"), home("c")]);
                r.rule = Some(Some(HomeRule::Authoritative(2)));
            }),
        ),
        (
            "Audit requirement REMOVED",
            Box::new(|r| r.audit = Some(None)),
        ),
        (
            "Audit requirement: 1",
            Box::new(|r| {
                r.audit = Some(Some(Audit {
                    threshold: 1,
                    auditors: vec![sha256(b"auditor")],
                }))
            }),
        ),
        (
            "SUCCESSION declared",
            Box::new(|r| {
                r.successor = Some(Some(Successor {
                    protocol: "mor".into(),
                    identifier: sha256(b"heir").to_vec(),
                }))
            }),
        ),
        ("Succession ENDED", Box::new(|r| r.successor = Some(None))),
        ("CLOSURE", Box::new(|r| r.closure = true)),
        (
            "HOMELESS",
            Box::new(|r| {
                r.homeless = true;
                r.homes = Some(vec![home("new")]);
            }),
        ),
        (
            "DISOWNS 1",
            Box::new(|r| r.disowned = Some(vec![sha256(b"an act")])),
        ),
        ("KEEPS NO SEQUENCE", Box::new(|_| {})),
        (
            "flow off",
            Box::new(move |r| {
                r.declarations = Some(vec![Declaration {
                    spec: finance_spec(),
                    kind: 0,
                    value: Some(Value::Array(vec![Value::Array(vec![
                        Value::Bytes(unit.to_vec()),
                        Value::Bytes(rail.to_vec()),
                        Value::Bytes(vec![1, 2]),
                        Value::Uint(0),
                    ])])),
                }])
            }),
        ),
        (
            "VAULT REMOVED",
            Box::new(|r| {
                r.declarations = Some(vec![Declaration {
                    spec: finance_spec(),
                    kind: 0,
                    value: None,
                }])
            }),
        ),
        (
            "cannot read",
            Box::new(|r| {
                r.declarations = Some(vec![Declaration {
                    spec: sha256(b"law?"),
                    kind: 3,
                    value: Some(Value::Uint(7)),
                }])
            }),
        ),
    ];
    for (says, change) in cases {
        let mut r = o.plan();
        change(&mut r);
        let p = o.pending(&r);
        let rv = review(&mut o, &p).unwrap_or_else(|e| panic!("{says}: {e}"));
        assert!(
            rv.summary.warns(says),
            "{says} not shown prominently:\n{}",
            rv.summary
        );
    }
    // And a routine rotation shows no alarm beyond the new key.
    let p = o.pending(&o.plan());
    let rv = review(&mut o, &p).unwrap();
    let alarms: Vec<_> = rv.summary.lines.iter().filter(|l| l.prominent).collect();
    assert!(alarms
        .iter()
        .all(|l| l.text.starts_with("New signing key") || l.text.starts_with("KEEPS NO SEQUENCE")));
    assert!(
        !rv.summary.not_checked.is_empty(),
        "the summary says what was not checked (rule 3.2)"
    );
}

#[test]
fn a_unit_removed_from_the_vault_is_named() {
    let vault = |units: &[&str]| Declaration {
        spec: finance_spec(),
        kind: 0,
        value: Some(Value::Array(
            units
                .iter()
                .map(|u| {
                    Value::Array(vec![
                        Value::Bytes(sha256(u.as_bytes()).to_vec()),
                        Value::Bytes(sha256(b"rail").to_vec()),
                        Value::Bytes(vec![0]),
                        Value::Uint(100),
                    ])
                })
                .collect(),
        )),
    };
    let mut o = Owner::new("vault", SeedModule::Words, 2);
    let mut r = o.plan();
    r.declarations = Some(vec![vault(&["sats", "euro"])]);
    let p = o.pending(&r);
    let s = o.sign(&p, &Choices::default());
    o.publish(&p, &s);
    let mut r = o.plan();
    r.declarations = Some(vec![vault(&["sats"])]);
    let rv = review_r(&mut o, &r).unwrap();
    assert!(rv.summary.warns(&format!(
        "unit {} REMOVED",
        sha256(b"euro")
            .iter()
            .map(|x| format!("{x:02x}"))
            .collect::<String>()
    )));
}

#[test]
fn context_from_the_online_device_is_shown_apart_and_never_trusted() {
    let mut o = Owner::new("context", SeedModule::Words, 2);
    let mut r = o.plan();
    r.homes = Some(vec![home("thief")]);
    let p = online::pending(
        &identity_spec(),
        &o.last,
        &r,
        Some(vec!["Routine key refresh, nothing changes".into()]),
        false,
    );
    let rv = review(&mut o, &p).unwrap();
    assert_eq!(
        rv.summary.context,
        vec!["Routine key refresh, nothing changes".to_string()]
    );
    assert!(
        rv.summary.warns("Homes change"),
        "the device's own summary still shows the change"
    );
    assert!(rv
        .summary
        .to_string()
        .contains("NOT checked, never trusted"));
}

// ---------------------------------------------------------------- rule 3.3

#[test]
fn an_online_supplied_next_commitment_is_ignored_and_replaced() {
    let mut o = Owner::new("commitment", SeedModule::Words, 2);
    let attacker = sha256(b"the attacker's safety key");
    // A compromised online device slips its own next commitment in.
    let r = o.plan();
    let Message::PendingRotation(mut p) = o.pending(&r) else {
        unreachable!()
    };
    let Value::Map(mut inside) = cbor::decode(&p.inside).unwrap() else {
        unreachable!()
    };
    for (k, v) in inside.iter_mut() {
        if k == &Value::Uint(4) {
            let Value::Map(pl) = v else { unreachable!() };
            pl.push((
                Value::Uint(3),
                SafetyCommit {
                    scheme: sig::SLH_128S,
                    commit: attacker,
                }
                .to_value(),
            ));
        }
    }
    p.inside = cbor::encode(&Value::Map(inside));
    let p = Message::PendingRotation(p);
    let rv = review(&mut o, &p).unwrap();
    assert!(rv.summary.warns("IGNORED and replaced"));
    let s = Message::SignedRotation(o.device.sign(rv, false, &mut o.rng).unwrap().message);
    let a = rotation_act(&s);
    let got = rotation_of(&a).safety.commit;
    assert_ne!(got, attacker);
    assert_eq!(
        got,
        o.device.seeds[0].seed.key(2, 1).commitment(),
        "the device's own next key"
    );
}

// ---------------------------------------------------------------- rule 3.4

#[test]
fn a_second_different_rotation_with_the_same_key_is_refused() {
    let mut o = Owner::new("second rotation", SeedModule::Words, 2);
    let p1 = o.pending(&o.plan());
    let first = o.sign(&p1, &Choices::default());
    let mut r2 = o.plan();
    r2.homes = Some(vec![home("thief")]);
    let p2 = o.pending(&r2);
    match review(&mut o, &p2) {
        Err(Refusal::AlreadySigned { act }) => assert_eq!(act, rotation_act(&first).id()),
        Err(e) => panic!("{e}"),
        Ok(_) => panic!("signed a second rotation"),
    }
    // The escape exception needs a homeless rotation with an endorsement
    // announced; a homeless rotation without one is refused too.
    let mut r3 = o.plan();
    r3.homeless = true;
    r3.homes = Some(vec![home("thief")]);
    assert!(matches!(
        review_r(&mut o, &r3),
        Err(Refusal::AlreadySigned { .. })
    ));
}

#[test]
fn the_two_exceptions_are_allowed_once_each_and_only_when_confirmed() {
    // A normal rotation the homes refuse; then an escape, once.
    let mut o = Owner::new("escape", SeedModule::Words, 2);
    let refused = o.sign(&o.pending(&o.plan()), &Choices::default());
    let refused_id = rotation_act(&refused).id();
    let mut esc = o.plan();
    esc.homeless = true;
    esc.homes = Some(vec![home("new home")]);
    let pe = online::pending(&identity_spec(), &o.last, &esc, None, true);
    let rv = review(&mut o, &pe).unwrap();
    assert_eq!(
        rv.standing,
        Standing::Exception(Exception::Escape {
            abandoned: refused_id
        })
    );
    assert!(rv.summary.warns("EXCEPTION to single use"));
    assert!(rv.summary.warns("ESCAPE announced"));
    assert!(matches!(
        o.device.sign(rv, false, &mut o.rng),
        Err(Refusal::NeedsConfirmation(_))
    ));
    let rv = review(&mut o, &pe).unwrap();
    let escape = o.device.sign(rv, true, &mut o.rng).unwrap();
    rotation_act(&Message::SignedRotation(escape.message.clone()));
    // The same escape again is re-exported; another escape is refused.
    let rv = review(&mut o, &pe).unwrap();
    assert_eq!(rv.standing, Standing::Repeat);
    let mut esc2 = esc.clone();
    esc2.homes = Some(vec![home("another home")]);
    assert!(matches!(
        review_esc(&mut o, &esc2),
        Err(Refusal::AlreadySigned { .. })
    ));

    // A homeless rotation voided by an objection; then one normal rotation.
    let mut o = Owner::new("after void", SeedModule::Words, 2);
    let mut hl = o.plan();
    hl.homeless = true;
    hl.homes = Some(vec![home("new home")]);
    let voided = o.sign(&o.pending(&hl), &Choices::default());
    let rv = {
        let r = o.plan();
        review_r(&mut o, &r)
    }
    .unwrap();
    assert_eq!(
        rv.standing,
        Standing::Exception(Exception::AfterVoidedHomeless {
            voided: rotation_act(&voided).id()
        })
    );
    let normal = o.device.sign(rv, true, &mut o.rng).unwrap();
    let normal_id = rotation_act(&Message::SignedRotation(normal.message)).id();
    // Both exceptions each once: an escape after that normal rotation is
    // still allowed once, then nothing more.
    // The same homeless rotation, now to be endorsed as an escape, is the
    // same request: re-exported, no new signature.
    let pe = online::pending(&identity_spec(), &o.last, &hl, None, true);
    assert_eq!(review(&mut o, &pe).unwrap().standing, Standing::Repeat);
    let mut esc = o.plan();
    esc.homeless = true;
    esc.homes = Some(vec![home("a third home")]);
    let pe = online::pending(&identity_spec(), &o.last, &esc, None, true);
    let rv = review(&mut o, &pe).unwrap();
    assert_eq!(
        rv.standing,
        Standing::Exception(Exception::Escape {
            abandoned: normal_id
        })
    );
    rotation_act(&Message::SignedRotation(
        o.device.sign(rv, true, &mut o.rng).unwrap().message,
    ));
    let mut other = o.plan();
    other.homes = Some(vec![home("yet another")]);
    assert!(matches!(
        review_r(&mut o, &other),
        Err(Refusal::AlreadySigned { .. })
    ));
}

// ---------------------------------------------------------------- rule 3.2

#[test]
fn a_rotation_whose_previous_act_does_not_match_the_devices_commitment_is_refused() {
    let mut o = Owner::new("mine", SeedModule::Words, 2);
    let other = Owner::new("someone else", SeedModule::Words, 2);
    // Someone else's chain, handed to my device.
    let p = other.pending(&other.plan());
    assert!(matches!(review(&mut o, &p), Err(Refusal::NoMatchingKey)));
    // My chain, but the key index points at a key my seed never committed.
    let r = o.plan();
    let Message::PendingRotation(mut pr) = o.pending(&r) else {
        unreachable!()
    };
    pr.index = 5;
    assert!(review(&mut o, &Message::PendingRotation(pr)).is_err());
}

#[test]
fn a_previous_act_with_a_broken_signature_is_refused() {
    let mut o = Owner::new("broken", SeedModule::Words, 2);
    let mut prev = o.last.clone();
    prev.signature.sig[5] ^= 1;
    let r = o.plan();
    let Message::PendingRotation(mut p) = o.pending(&r) else {
        unreachable!()
    };
    p.prev = prev.encode();
    assert!(matches!(
        review(&mut o, &Message::PendingRotation(p)),
        Err(Refusal::Previous(_))
    ));
}

#[test]
fn a_rotation_that_does_not_follow_the_previous_act_is_refused() {
    let mut o = Owner::new("follow", SeedModule::Words, 2);
    let mut r = o.plan();
    r.position = 2;
    assert!(matches!(
        review_r(&mut o, &r),
        Err(Refusal::Rotation(_) | Refusal::NoMatchingKey)
    ));
    let mut r = o.plan();
    r.prev = sha256(b"another act");
    assert!(matches!(review_r(&mut o, &r), Err(Refusal::Rotation(_))));
}

// ---------------------------------------------------------------- rule 3.5

#[test]
fn the_safety_key_signs_only_rotations() {
    let mut o = Owner::new("only rotations", SeedModule::Words, 2);
    let r = o.plan();
    let Message::PendingRotation(p) = o.pending(&r) else {
        unreachable!()
    };
    let Value::Map(inside) = cbor::decode(&p.inside).unwrap() else {
        unreachable!()
    };
    let with = |k: u64, v: Value| {
        let mut m = inside.clone();
        m.retain(|(x, _)| x != &Value::Uint(k));
        m.push((Value::Uint(k), v));
        Message::PendingRotation(PendingRotation {
            inside: cbor::encode(&Value::Map(m)),
            ..p.clone()
        })
    };
    // Another type of the Identity MIP (a routes act), another specification.
    assert!(matches!(
        review(&mut o, &with(1, Value::Uint(3))),
        Err(Refusal::NotARotation(_))
    ));
    assert!(matches!(
        review(
            &mut o,
            &with(0, Value::Bytes(sha256(b"a text spec").to_vec()))
        ),
        Err(Refusal::NotARotation(_))
    ));
    // A field the device would sign without showing: refused.
    assert!(matches!(
        review(&mut o, &with(9, Value::Text("hint".into()))),
        Err(Refusal::Rotation(_))
    ));
    assert!(matches!(
        review(
            &mut o,
            &with(7, Value::Array(vec![Value::Bytes(vec![0; 32])]))
        ),
        Err(Refusal::Rotation(_))
    ));
}

// ---------------------------------------------------------------- rule 3.6 and the transports

#[test]
fn a_file_with_anything_but_the_expected_message_is_rejected_unrun() {
    let dir = std::env::temp_dir().join("mor-airgap-test-hostile-files");
    std::fs::create_dir_all(&dir).unwrap();
    let o = Owner::new("files", SeedModule::Words, 2);
    let pending = o.pending(&o.plan()).encode();
    let mut trailing = pending.clone();
    trailing.push(0);
    let mut big = vec![0x5a; mor_airgap::msg::MAX_MESSAGE + 10];
    big[0] = 0xa1;
    let hostile: Vec<(&str, Vec<u8>)> = vec![
        ("script", b"#!/bin/sh\nrm -rf ~\n".to_vec()),
        ("elf", b"\x7fELF\x02\x01\x01\0\0\0\0\0\0\0\0\0".to_vec()),
        ("empty", vec![]),
        ("wrong kind", o.device.export_commitment(0, 0).encode()),
        ("trailing bytes", trailing),
        ("too large", big),
        ("not deterministic", {
            // The same map with an overlong integer.
            let mut b = pending.clone();
            b.splice(1..2, [0x18, 0x00]);
            b
        }),
        ("unknown key", {
            let Value::Map(mut m) = cbor::decode(&pending).unwrap() else {
                unreachable!()
            };
            m.push((Value::Uint(9), Value::Uint(1)));
            cbor::encode(&Value::Map(m))
        }),
    ];
    for (name, bytes) in hostile {
        let path = dir.join(name);
        std::fs::write(&path, &bytes).unwrap();
        assert!(
            transport::read_file(&path, kind::PENDING_ROTATION).is_err(),
            "{name} accepted"
        );
        let dev = Signer::new(config());
        assert!(
            matches!(
                dev.review(&bytes, &Choices::default(), &mut TestRng::new(name)),
                Err(Refusal::Message(_))
            ),
            "{name} reviewed"
        );
    }
    assert!(matches!(
        Message::decode_kind(
            &o.device.export_commitment(0, 0).encode(),
            kind::PENDING_ROTATION
        ),
        Err(MsgError::Kind { .. })
    ));
}

#[test]
fn a_tampered_qr_sequence_is_rejected() {
    let mut o = Owner::new("tampered qr", SeedModule::Words, 2);
    let pending = o.pending(&o.plan());
    let signed = o.sign(&pending, &Choices::default());
    // One frame's byteword altered: the frame, or the whole message's
    // checksum, fails.
    let mut s = QrSender::new(&signed, transport::FRAGMENT);
    let n = s.fragments();
    let mut r = QrReceiver::new(kind::SIGNED_ROTATION);
    let mut rejected = false;
    for i in 0..3 * n {
        let mut f = s.next_frame();
        if i == 1 {
            let at = f.len() - 10;
            let c = if &f[at..at + 1] == "A" { "B" } else { "A" };
            f.replace_range(at..at + 1, c);
        }
        if r.receive(&f).is_err() {
            rejected = true;
        }
        if r.complete() {
            break;
        }
    }
    // Bytewords carry a CRC-32 per frame: the altered frame is refused, and
    // the genuine frames still complete the genuine message.
    assert!(rejected, "the tampered frame was accepted");
    assert_eq!(r.message().unwrap().unwrap(), signed);
    // Frames of another kind are refused at once.
    let mut r = QrReceiver::new(kind::SIGNED_ROTATION);
    let mut other = QrSender::new(&pending, transport::FRAGMENT);
    assert!(r.receive(&other.next_frame()).is_err());
}

#[test]
fn a_swapped_signed_rotation_is_rejected_by_the_online_device() {
    let mut a = Owner::new("swap a", SeedModule::Words, 2);
    let mut b = Owner::new("swap b", SeedModule::Words, 2);
    let pa = a.pending(&a.plan());
    let pb = b.pending(&b.plan());
    let sb = b.sign(&pb, &Choices::default());
    // Another identity's rotation, in place of mine.
    assert!(matches!(
        online::accept(&identity_spec(), &pa.encode(), &sb.encode()),
        Err(Rejection::NotAsked(_))
    ));
    // My own device's answer to a different request.
    let sa = a.sign(&pa, &Choices::default());
    let mut r = a.plan();
    r.homes = Some(vec![home("elsewhere")]);
    let pa2 = a.pending(&r);
    assert!(online::accept(&identity_spec(), &pa2.encode(), &sa.encode()).is_err());
    // A signed rotation with one byte changed.
    let Message::SignedRotation(mut x) = sa.clone() else {
        unreachable!()
    };
    let at = x.act.len() - 100;
    x.act[at] ^= 1;
    assert!(online::accept(
        &identity_spec(),
        &pa.encode(),
        &Message::SignedRotation(x).encode()
    )
    .is_err());
    // A clean-device secret that does not match the key in the rotation.
    let Message::SignedRotation(mut y) = sa else {
        unreachable!()
    };
    y.signing_secret = Some(sha256(b"some other key"));
    assert!(online::accept(
        &identity_spec(),
        &pa.encode(),
        &Message::SignedRotation(y).encode()
    )
    .is_err());
}

// ---------------------------------------------------------------- section 4

#[test]
fn an_attackers_signing_key_shows_a_different_fingerprint_on_the_offline_screen() {
    let mut o = Owner::new("fingerprint", SeedModule::Words, 2);
    let genuine = signing(&o.name, 1);
    let attacker = signing("attacker", 1);
    // What the owner's trusted second screen shows for the key they meant.
    let expected = online::signing_fingerprint(&genuine);
    // A compromised online device puts the attacker's key in.
    let mut r = o.plan();
    r.signing_key = SigningKey {
        scheme: sig::SCHNORR,
        key: attacker.public().to_vec(),
    };
    let rv = review_r(&mut o, &r).unwrap();
    let shown = fingerprint(&sig::SCHNORR, &attacker.public());
    assert!(rv.summary.warns(&shown));
    assert!(!rv.summary.says(&expected), "the mismatch is visible");
    assert_ne!(shown, expected);
    // With the genuine key the two screens agree.
    let rv = {
        let r = o.plan();
        review_r(&mut o, &r)
    }
    .unwrap();
    assert!(rv.summary.warns(&expected));
}

#[test]
fn a_home_rule_that_does_not_fit_the_new_homes_is_caught_before_the_key_is_spent() {
    // F94: after a genesis the device knows the whole state, so a rule left
    // in place that no longer fits is caught too.
    let mut o = Owner::with_homes(
        "fit",
        SeedModule::Words,
        2,
        vec![home("a"), home("b"), home("c")],
    );
    let mut r = o.plan();
    r.homes = Some(vec![home("a"), home("b")]);
    r.rule = Some(Some(HomeRule::Threshold(3)));
    assert!(matches!(review_r(&mut o, &r), Err(Refusal::Rotation(_))));
}
