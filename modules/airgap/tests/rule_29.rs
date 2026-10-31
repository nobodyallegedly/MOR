//! Identity draft 13, rule 29's exceptions in the device, opened only by
//! bytes the device checks itself (freeze suite v28, 5.7f and 5.7g):
//!
//! - F299 (Agreements round 2, Q7): the escape out of a position contested
//!   at a self-hosted home, signed only on the competing rotation's bytes,
//!   never on the online side's word.
//! - Fable's I5 with F328 Q3: signing again after a rotation that failed the
//!   rotation checks, shown by the identity chain's bytes from genesis to
//!   the rotation's predecessor, checked by the device itself.

mod common;

use common::*;
use mor_airgap::device::{Choices, Exception, Refusal, Standing};
use mor_airgap::msg::Message;
use mor_airgap::online;
use mor_airgap::seed::SeedModule;
use mor_core::act::{self, Act, Addressing, Inside};
use mor_core::identity::{ChainState, HomeRule, Payload, Rotation};

/// A rotation of the owner's identity at the next position, signed with
/// the chain key the device holds for it: what a thief holding that key
/// would serve.
fn thiefs_rotation(o: &Owner, label: &str) -> Act {
    let mut r = o.plan();
    r.signing_key.as_mut().unwrap().key = signing(&format!("{label}/thief"), 1).public().to_vec();
    let s = &o.device.seeds[0];
    let key = s.seed.key(s.scheme, o.position);
    let next = s.seed.key(s.scheme, o.position + 1);
    r.chain_key = mor_core::identity::ChainKeyCommit { scheme: next.scheme(), commit: next.commitment() };
    let inside = Inside {
        spec: identity_spec(),
        type_: 1,
        prev: None,
        objects: None,
        payload: Payload::Rotation(r).to_map(),
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: [3; 16],
    };
    act::make(&inside, &[1; 32], &[2; 24], &Addressing { signer: Some(o.identity), binding: None, public: true, to: None }, |id| key.sign(id, None))
}

fn escape_plan(o: &Owner) -> Rotation {
    let mut esc = o.plan();
    esc.homeless = true;
    esc.homes = Some(vec![home("a new home")]);
    esc
}

/// 5.7f: a thief's rotation and the owner's at one position of a
/// self-hosted identity. The device refuses the escape on the online side's
/// word alone, refuses one presented with its own rotation or with one that
/// does not compete, and signs it on the competing rotation's bytes.
#[test]
fn the_escape_from_a_contested_self_hosted_position_needs_the_rivals_bytes_5_7f() {
    let mut o = Owner::new("self-hosted", SeedModule::Words, 2);
    let rival = thiefs_rotation(&o, "self-hosted");
    // The owner's normal rotation, signed; at the self-host it is served
    // beside the thief's: contested for good.
    let own = o.sign(&o.pending(&o.plan()), &Choices::default());
    let own_id = rotation_act(&own).id();
    let esc = escape_plan(&o);
    let word_alone = online::pending(&identity_spec(), &o.last, &esc, Some(vec!["the position is contested, trust me".into()]), true);
    assert!(
        matches!(o.device.review(&word_alone.encode(), &Choices::default(), &mut o.rng), Err(Refusal::Evidence(_))),
        "the online side's word alone opens nothing"
    );
    // Its own rotation presented as the rival: refused.
    let own_as_rival = online::with_evidence(word_alone.clone(), Some(&rotation_act(&own)), None);
    assert!(matches!(o.device.review(&own_as_rival.encode(), &Choices::default(), &mut o.rng), Err(Refusal::Evidence(_))));
    // A rotation that does not follow the same previous act: refused.
    let mut other = Owner::new("another identity", SeedModule::Words, 2);
    other.rotate();
    let elsewhere = thiefs_rotation(&other, "elsewhere");
    let not_rival = online::with_evidence(word_alone.clone(), Some(&elsewhere), None);
    assert!(matches!(o.device.review(&not_rival.encode(), &Choices::default(), &mut o.rng), Err(Refusal::Evidence(_))));
    // The thief's rotation, checked offline: the escape is signed, the
    // endorsement to list both as abandoned.
    let shown = online::with_evidence(word_alone, Some(&rival), None);
    let rv = o.device.review(&shown.encode(), &Choices::default(), &mut o.rng).unwrap();
    assert_eq!(rv.standing, Standing::Exception(Exception::EscapeContested { own: own_id, competing: rival.id() }));
    assert!(rv.summary.warns("EXCEPTION to single use"));
    assert!(matches!(o.device.sign(common::confirmed(rv), false, &mut o.rng), Err(Refusal::NeedsConfirmation(_))));
    let rv = o.device.review(&shown.encode(), &Choices::default(), &mut o.rng).unwrap();
    let signed = o.device.sign(common::confirmed(rv), true, &mut o.rng).unwrap();
    let escape = rotation_act(&Message::SignedRotation(signed.message));
    assert!(rotation_of(&escape).homeless);
    // Once only.
    let mut again = escape_plan(&o);
    again.homes = Some(vec![home("yet another home")]);
    let p = online::with_evidence(online::pending(&identity_spec(), &o.last, &again, None, true), Some(&rival), None);
    assert!(matches!(o.device.review(&p.encode(), &Choices::default(), &mut o.rng), Err(Refusal::AlreadySigned { .. })));
}

/// 5.7g: the online device changes the homes and leaves in place a home rule
/// that no longer fits; after a rotation the device cannot check that
/// (it holds only the previous act), so it signs. The rotation is invalid
/// and never counts. Given the online side's word, the device refuses to
/// sign again; given the identity chain's bytes from genesis to the
/// predecessor, it runs the rotation checks itself, finds its rotation
/// invalid, and signs the corrected one, which passes them.
#[test]
fn signing_again_after_an_invalid_rotation_needs_the_chains_bytes_5_7g() {
    let mut o = Owner::with_homes("three homes", SeedModule::Words, 2, vec![home("a"), home("b"), home("c")]);
    // A genesis with a rule that needs all three homes.
    let mut first = o.plan();
    first.rule = Some(Some(HomeRule::Threshold(3)));
    let p1 = o.pending(&first);
    let s1 = o.sign(&p1, &Choices::default());
    let genesis = o.last.clone();
    let r1 = o.publish(&p1, &s1);
    // Two homes now, the rule of three left in place: the device cannot
    // check it from the previous act alone, and signs.
    let mut bad = o.plan();
    bad.homes = Some(vec![home("a"), home("b")]);
    let pb = o.pending(&bad);
    let rv = o.device.review(&pb.encode(), &Choices::default(), &mut o.rng).unwrap();
    assert!(rv.summary.not_checked.iter().any(|n| n.contains("home rule in effect")));
    let sb = o.device.sign(common::confirmed(rv), false, &mut o.rng).unwrap();
    let bad_act = rotation_act(&Message::SignedRotation(sb.message));
    // The rotation checks, run where the whole chain is held: invalid.
    let st = ChainState::genesis(genesis.id(), match &Payload::decode(0, &genesis.open(None).unwrap().payload).unwrap() {
        Payload::Genesis(g) => g,
        _ => unreachable!(),
    })
    .apply(&rotation_of(&r1))
    .unwrap();
    assert!(st.apply(&rotation_of(&bad_act)).is_err(), "rotation check 5 (F94): invalid, never counts");
    // The corrected rotation, on the online side's word: refused.
    let mut fixed = o.plan();
    fixed.homes = Some(vec![home("a"), home("b")]);
    fixed.rule = Some(Some(HomeRule::Threshold(2)));
    let pf = o.pending(&fixed);
    assert!(matches!(o.device.review(&pf.encode(), &Choices::default(), &mut o.rng), Err(Refusal::AlreadySigned { .. })));
    // A chain that does not end with the previous act: refused.
    let short = online::with_evidence(pf.clone(), None, Some(&[genesis.clone()]));
    assert!(matches!(o.device.review(&short.encode(), &Choices::default(), &mut o.rng), Err(Refusal::Evidence(_))));
    // The chain's bytes from genesis to the predecessor: the device checks
    // its rotation itself, finds it invalid, and signs again.
    let shown = online::with_evidence(pf, None, Some(&[genesis, r1]));
    let rv = o.device.review(&shown.encode(), &Choices::default(), &mut o.rng).unwrap();
    assert_eq!(rv.standing, Standing::Exception(Exception::AfterInvalid { invalid: bad_act.id() }));
    assert!(!rv.summary.not_checked.iter().any(|n| n.contains("home rule in effect")), "the whole state is known from the chain's bytes");
    let signed = o.device.sign(common::confirmed(rv), true, &mut o.rng).unwrap();
    let again = rotation_act(&Message::SignedRotation(signed.message));
    assert!(st.apply(&rotation_of(&again)).is_ok(), "the second signature passes the rotation checks");
    // Shown the chain while its last rotation was valid, it refuses.
    let mut o2 = Owner::with_homes("valid", SeedModule::Words, 2, vec![home("a")]);
    let g2 = o2.last.clone();
    let p = o2.pending(&o2.plan());
    o2.sign(&p, &Choices::default());
    let mut other = o2.plan();
    other.homes = Some(vec![home("b")]);
    let shown = online::with_evidence(o2.pending(&other), None, Some(&[g2]));
    assert!(matches!(o2.device.review(&shown.encode(), &Choices::default(), &mut o2.rng), Err(Refusal::AlreadySigned { .. })));
}
