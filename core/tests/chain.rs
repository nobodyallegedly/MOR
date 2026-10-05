//! Hand-made identity chains, and the answers the Identity MIP requires
//! (draft 11, "Verification procedures" and "Validity rules"). Freeze
//! scenario numbers are given where a test follows one.

mod common;

use common::*;
use mor_core::act::Scheme;
use mor_core::cbor::Value;
use mor_core::chain::{Basis, How, Status, Stop};
use mor_core::hash::sha256;
use mor_core::identity::{Audit, Declaration, HomeRule, Operator, SigningKey, Successor};

fn chain(w: &World, p: &Person) -> Vec<mor_core::hash::Hash> {
    w.v.resolve(&p.id).links.iter().map(|l| l.act).collect()
}

fn how_last(w: &World, p: &Person) -> How {
    w.v.resolve(&p.id).links.last().unwrap().how
}

// ---------------------------------------------------------------- genesis

#[test]
fn genesis_checks() {
    let mut w = World::new();
    let h1 = w.operator("home-1");
    let h2 = w.operator("home-2");
    let a = w.genesis("alice", vec![home(&h1)], None, None);
    let r = w.v.resolve(&a.id);
    assert_eq!(r.links.len(), 1);
    assert_eq!(r.links[0].how, How::Genesis);
    assert_eq!(r.stop, Stop::End);
    assert_eq!(w.v.status(&a.id), Status::Valid);

    // A rule needs at least two distinct operators; two homes of one operator are one.
    let b = w.genesis(
        "bob",
        vec![home(&h1), home(&h1)],
        Some(HomeRule::Threshold(1)),
        None,
    );
    assert_eq!(w.v.status(&b.id), Status::Invalid);
    assert_eq!(w.v.resolve(&b.id).stop, Stop::Invalid);
    // A threshold must be more than half the operators, and no more than all.
    let c = w.genesis(
        "carol",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Threshold(1)),
        None,
    );
    assert_eq!(w.v.status(&c.id), Status::Invalid);
    let c = w.genesis(
        "carol2",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Threshold(2)),
        None,
    );
    assert_eq!(w.v.status(&c.id), Status::Valid);
    let c = w.genesis(
        "carol3",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Threshold(3)),
        None,
    );
    assert_eq!(w.v.status(&c.id), Status::Invalid);
    // An authoritative index must name a home.
    let d = w.genesis(
        "dave",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Authoritative(2)),
        None,
    );
    assert_eq!(w.v.status(&d.id), Status::Invalid);
    let d = w.genesis(
        "dave2",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Authoritative(1)),
        None,
    );
    assert_eq!(w.v.status(&d.id), Status::Valid);
    // An audit requirement needs a threshold between one and the auditors.
    let e = w.genesis(
        "erin",
        vec![home(&h1)],
        None,
        Some(Audit {
            threshold: 2,
            auditors: vec![h2.id],
        }),
    );
    assert_eq!(w.v.status(&e.id), Status::Invalid);
    let e = w.genesis(
        "erin2",
        vec![home(&h1)],
        None,
        Some(Audit {
            threshold: 0,
            auditors: vec![h2.id],
        }),
    );
    assert_eq!(w.v.status(&e.id), Status::Invalid);
}

#[test]
fn genesis_signed_by_another_key_is_invalid() {
    let mut w = World::new();
    let h = w.operator("home");
    let a = w.genesis("alice", vec![home(&h)], None, None);
    // Re-sign alice's genesis with another key: the key in the signature
    // no longer equals the one the payload declares.
    let held = w.v.get(&a.id).unwrap().act.clone();
    let other = schnorr("mallory", 0);
    let mut forged = held.clone();
    forged.signature = other.sign(&held.id(), &[0; 32]);
    let mut w2 = World::new();
    let id = w2.add(&forged);
    assert_eq!(w2.v.status(&id), Status::Invalid);
    // And a genesis whose signature does not verify.
    let mut broken = held;
    broken.signature.sig[5] ^= 1;
    let mut w3 = World::new();
    let id = w3.add(&broken);
    assert_eq!(w3.v.status(&id), Status::Invalid);
}

// ---------------------------------------------------------------- rotation, one home

#[test]
fn a_rotation_is_pending_until_its_home_receipts_it() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut a = w.genesis("alice", vec![home(&h)], None, None);
    let before = w.post(&mut a, "before");
    let (r1, mut a1) = w.rotate(&a, Rot::default());
    // Pending: no receipt yet. Acts under the new key are pending too (rule 7).
    assert_eq!(w.v.resolve(&a.id).stop, Stop::Pending(vec![r1]));
    assert_eq!(w.v.status(&r1), Status::Pending);
    let after = w.post(&mut a1, "after");
    assert_eq!(w.v.status(&after), Status::Pending);
    assert_eq!(w.v.status(&before), Status::Valid);

    w.receipt(&mut h, &a.id, &r1, 1);
    assert_eq!(chain(&w, &a), vec![a.id, r1]);
    assert_eq!(how_last(&w, &a), How::Homes);
    assert_eq!(w.v.status(&after), Status::Valid);
    // The kept tip: "before" stays valid (rule 15).
    assert_eq!(w.v.status(&before), Status::Valid);
    // An act still signed with the replaced key, after the rotation, lies
    // outside the kept ancestry: void (rule 16).
    let mut stale = a.clone();
    let late = w.post(&mut stale, "signed with the old key after rotating");
    assert_eq!(w.v.status(&late), Status::Void);
}

#[test]
fn a_rotation_must_reveal_the_committed_safety_key_and_name_its_predecessor() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let a = w.genesis("alice", vec![home(&h)], None, None);
    // Signed with a safety key that was never committed.
    let mut wrong = a.clone();
    wrong.safety = slh("someone else", 0, 3);
    let (bad, _) = w.rotate(&wrong, Rot::default());
    w.receipt(&mut h, &a.id, &bad, 1);
    assert_eq!(chain(&w, &a), vec![a.id]);
    assert_eq!(w.v.status(&bad), Status::Invalid);
    // Naming a predecessor that is not the act counting before it.
    let mut astray = a.clone();
    astray.tip = sha256(b"not alice's genesis");
    let (bad2, _) = w.rotate(&astray, Rot::default());
    w.receipt(&mut h, &a.id, &bad2, 1);
    assert_eq!(chain(&w, &a), vec![a.id]);
    // The genuine one counts.
    let (good, _) = w.rotate(&a, Rot::default());
    w.receipt(&mut h, &a.id, &good, 1);
    assert_eq!(chain(&w, &a), vec![a.id, good]);
}

#[test]
fn both_safety_schemes_rotate() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let a = w.genesis_with("alice", vec![home(&h)], None, None, None, 2);
    let (r1, a1) = w.rotate(&a, Rot::default());
    w.receipt(&mut h, &a.id, &r1, 1);
    let (r2, _) = w.rotate(&a1, Rot::default());
    w.receipt(&mut h, &a.id, &r2, 2);
    assert_eq!(chain(&w, &a), vec![a.id, r1, r2]);
    assert_eq!(w.v.get(&r1).unwrap().act.signature.sig.len(), 7856);
}

/// A chain signature (type 16, F132): signed with the revealed safety key,
/// it takes the next position as a rotation does, pending until the homes
/// receipt it, and commits the next safety key. It sets no key and judges
/// nothing: acts under the key in effect stay valid, before and after it,
/// and a later rotation names it as its predecessor. A binding naming it
/// is invalid; a second act revealing the same safety key competes for the
/// position.
#[test]
fn a_chain_signature_takes_a_position_and_changes_no_key() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut a = w.genesis("alice", vec![home(&h)], None, None);
    let before = w.post(&mut a, "before");
    let signed = sha256(b"a fork Alice signs");
    let (cs, mut a1) = w.chain_sign(&a, signed);
    assert_eq!(w.v.status(&cs), Status::Pending);
    w.receipt(&mut h, &a.id, &cs, 1);
    assert_eq!(chain(&w, &a), vec![a.id, cs]);
    assert_eq!(w.v.status(&cs), Status::Valid);
    // The same everyday key, the same binding: nothing judged.
    let after = w.post(&mut a1, "after");
    assert_eq!(w.v.status(&before), Status::Valid);
    assert_eq!(w.v.status(&after), Status::Valid);
    // A binding naming the chain signature binds no key.
    let mut odd = a1.clone();
    odd.binding = cs;
    let bad = w.post(&mut odd, "bound to a chain signature");
    assert_eq!(w.v.status(&bad), Status::Invalid);
    // A second chain signature, then a rotation, each after the last.
    let (cs2, a2) = w.chain_sign(&a1, sha256(b"a closing"));
    w.receipt(&mut h, &a.id, &cs2, 2);
    let (r, _) = w.rotate(&a2, Rot::default());
    w.receipt(&mut h, &a.id, &r, 3);
    assert_eq!(chain(&w, &a), vec![a.id, cs, cs2, r]);
    // The rotation judges the key it replaces, set at genesis: "after" was
    // not kept (the default keeps the person's own sequence, which holds it).
    assert_eq!(w.v.status(&after), Status::Valid);
    // Revealing a spent safety key again: never counts.
    let (late, _) = w.chain_sign(&a, sha256(b"another fork"));
    assert_eq!(w.v.status(&late), Status::Invalid);
    // Two acts revealing the same safety key compete for one position.
    let mut w2 = World::new();
    let s = w2.genesis("self", vec![own_home()], None, None);
    let (c1, _) = w2.chain_sign(&s, sha256(b"one"));
    assert_eq!(chain(&w2, &s), vec![s.id, c1]);
    let (r1, _) = w2.rotate(&s, Rot::default());
    assert!(matches!(w2.v.resolve(&s.id).stop, Stop::Contested(ref c) if c.contains(&r1)));
}

// ---------------------------------------------------------------- several homes (5.6)

#[test]
fn majority_of_three_operators() {
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let h3 = w.operator("home-3");
    let homes = vec![home(&h1), home(&h2), home(&h3)];
    // The journalist declares the rule; a fourth identity declares none.
    let j = w.genesis(
        "journalist",
        homes.clone(),
        Some(HomeRule::Threshold(2)),
        None,
    );
    let f = w.genesis("fourth", homes, None, None);
    for p in [&j, &f] {
        let (r, _) = w.rotate(p, Rot::default());
        w.receipt(&mut h1, &p.id, &r, 1);
        assert_eq!(chain(&w, p), vec![p.id], "one of three is not a majority");
        // Home 3 does not store it; homes 1 and 2 do: it counts.
        w.receipt(&mut h2, &p.id, &r, 1);
        assert_eq!(chain(&w, p), vec![p.id, r]);
    }
}

/// A reader fetches the same chain from every home, so it holds the same
/// act more than once. The same act is one act: never a rival to itself
/// (found while building the relays, roadmap step 4).
#[test]
fn the_same_act_from_several_homes_is_one_act() {
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let h3 = w.operator("home-3");
    let p = w.genesis("alice", vec![home(&h1), home(&h2), home(&h3)], None, None);
    let (a, _) = w.rotation(&p, Rot::default());
    // A copy with a broken signature arrives first; the good copy replaces it.
    let mut broken = a.clone();
    broken.signature.sig[0] ^= 1;
    w.v.add(broken).unwrap();
    let r = w.add(&a);
    let r1 = w.receipt(&mut h1, &p.id, &r, 1);
    let r2 = w.receipt(&mut h2, &p.id, &r, 1);
    // Everything again, as served by the other homes.
    for id in [p.id, r, r1, r2, h1.id, h2.id] {
        let again = w.v.get(&id).unwrap().act.clone();
        w.add(&again);
    }
    let broken_again = {
        let mut b = a.clone();
        b.signature.sig[0] ^= 1;
        b
    };
    w.v.add(broken_again).unwrap();
    assert_eq!(chain(&w, &p), vec![p.id, r]);
    assert_eq!(w.v.resolve(&p.id).stop, Stop::End);
    assert_eq!(w.v.status(&r), Status::Valid);
}

#[test]
fn homes_count_per_operator() {
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let h2 = w.operator("home-2");
    let h3 = w.operator("home-3");
    // Two relays of home-1's operator, and two others: three operators.
    let mut second = home(&h1);
    second.hint = "https://home-1-backup.example".into();
    let a = w.genesis(
        "alice",
        vec![home(&h1), second, home(&h2), home(&h3)],
        None,
        None,
    );
    let (r, _) = w.rotate(&a, Rot::default());
    w.receipt(&mut h1, &a.id, &r, 1);
    w.receipt(&mut h1, &a.id, &r, 1);
    assert_eq!(
        chain(&w, &a),
        vec![a.id],
        "one operator's two receipts are one"
    );
}

#[test]
fn an_authoritative_home_decides_alone() {
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let a = w.genesis(
        "alice",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Authoritative(1)),
        None,
    );
    let (r, _) = w.rotate(&a, Rot::default());
    w.receipt(&mut h1, &a.id, &r, 1);
    assert_eq!(chain(&w, &a), vec![a.id], "home 1 is a backup");
    w.receipt(&mut h2, &a.id, &r, 1);
    assert_eq!(chain(&w, &a), vec![a.id, r]);
}

#[test]
fn self_hosted_rotates_on_its_own_signatures() {
    let mut w = World::new();
    let h1 = w.operator("home-1");
    // Self-hosted, with a backup home: the self-host is authoritative by default.
    let s = w.genesis("self", vec![own_home(), home(&h1)], None, None);
    let (r, s1) = w.rotate(&s, Rot::default());
    assert_eq!(chain(&w, &s), vec![s.id, r], "no receipt needed (rule 22a)");
    // The stated cost: a thief holding the next safety key wins at once...
    let mut w2 = World::new();
    let s = w2.genesis("self", vec![own_home()], None, None);
    let (thief, _) = w2.rotate(
        &s,
        Rot {
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    assert_eq!(chain(&w2, &s), vec![s.id, thief]);
    // ...unless the owner's rotation is held too: two rotations served at one
    // position are a conflict, and the identity is contested there.
    let (own, _) = w2.rotate(&s, Rot::default());
    assert!(matches!(w2.v.resolve(&s.id).stop, Stop::Contested(ref c) if c.contains(&own)));
    let _ = s1;
}

// ---------------------------------------------------------------- what a rotation keeps (5.5)

#[test]
fn a_routine_rotation_keeps_years_of_unacknowledged_posts() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let spec = sha256(b"a payee-pointer spec");
    let decl = Declaration {
        spec,
        kind: 1,
        value: Some(Value::Text("vault".into())),
    };
    let mut j = w.genesis_with(
        "journalist",
        vec![home(&h)],
        None,
        None,
        Some(vec![decl.clone()]),
        3,
    );
    let posts: Vec<_> = (0..40)
        .map(|i| w.post(&mut j, &format!("post {i}")))
        .collect();
    // The last act kept is a private reply to a source: the verifier holds
    // only its id, never its inside.
    let mut reply_side = j.clone();
    let reply = w.everyday_act(
        &mut reply_side,
        sha256(b"a text specification"),
        0,
        vec![],
        None,
        None,
    );
    j.seq.push(reply.id());
    // The rotation keeps it, and removes the declaration by a null entry.
    let (r, _) = w.rotate(
        &j,
        Rot {
            declarations: Some(vec![Declaration {
                value: None,
                ..decl
            }]),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(chain(&w, &j), vec![j.id, r]);
    for p in &posts {
        assert_eq!(
            w.v.status(p),
            Status::Valid,
            "every reader can prove it from the rotation alone"
        );
    }
    let res = w.v.resolve(&j.id);
    assert!(res.states[0].declarations.len() == 1 && res.states[1].declarations.is_empty());
}

#[test]
fn excluded_and_disowned_acts_are_void_unless_relied_on() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut j = w.genesis("journalist", vec![home(&h)], None, None);
    let mut reader = w.operator("reader");
    let a1 = w.post(&mut j, "genuine 1");
    // A thief holding the signing key slips an act into the line...
    let thief_act = w.post(&mut j, "the thief's act");
    // ...which the owner keeps writing after, not yet aware.
    let a3 = w.post(&mut j, "genuine 3");
    // And a second line on another device, never named by the rotation.
    let mut other_line = j.clone();
    other_line.seq.clear();
    let forgotten = w.post(&mut other_line, "a line the rotation omits");
    let relied = w.post(&mut other_line, "an act someone relied on");
    w.ack(&mut reader, relied);
    let recorded = w.post(&mut other_line, "an act a keeper recorded");
    w.v.keeper_recorded(recorded);

    let (r, _) = w.rotate(
        &j,
        Rot {
            disowned: Some(vec![thief_act]),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(w.v.status(&a1), Status::Valid);
    assert_eq!(
        w.v.status(&thief_act),
        Status::Void,
        "disowned, relied on by nobody"
    );
    assert_eq!(
        w.v.status(&a3),
        Status::Valid,
        "later genuine acts stay valid (F57)"
    );
    assert_eq!(
        w.v.status(&forgotten),
        Status::Void,
        "outside the kept ancestry (rule 17)"
    );
    assert_eq!(
        w.v.status(&relied),
        Status::Disputed,
        "acknowledged by another identity"
    );
    assert_eq!(
        w.v.status(&recorded),
        Status::Disputed,
        "recorded by a keeper"
    );
}

#[test]
fn an_acknowledgement_by_the_owner_itself_does_not_count() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut j = w.genesis("journalist", vec![home(&h)], None, None);
    let mut side = j.clone();
    side.seq.clear();
    let x = w.post(&mut side, "outside");
    w.ack(&mut side, x);
    let (r, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(w.v.status(&x), Status::Void);
    let _ = &mut j;
}

/// F110 (freeze suite v21, scenario 5 step 5b, scenario 2 step 5c): only Identity, Finance and
/// Law act types carry acknowledgements. A text act or a cMIP's reaction
/// carrying `acks` is invalid and rescues nothing; a witness act keeps a
/// disowned post visible as disputed; a buyer's claim (Finance) does the
/// same for a publication.
#[test]
fn only_identity_finance_and_law_acts_acknowledge_f110() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut j = w.genesis("journalist", vec![home(&h)], None, None);
    let mut fan = w.operator("fan");
    let mut buyer = w.operator("buyer");
    let mut side = j.clone();
    side.seq.clear();
    let liked = w.post(&mut side, "a post a fan liked");
    let witnessed = w.post(&mut side, "a post a reader relies on");
    let sold = w.post(&mut side, "a publication a buyer paid for");
    // A like as a text act, and as a reaction cMIP's act: invalid.
    let text_like = w.like(&mut fan, sha256(b"TEXT, test value until the freeze"), liked);
    let cmip_like = w.like(&mut fan, sha256(b"a reaction cMIP"), liked);
    assert_eq!(w.v.status(&text_like), Status::Invalid);
    assert_eq!(w.v.status(&cmip_like), Status::Invalid);
    // A witness act, deliberately.
    let wit = w.ack(&mut fan, witnessed);
    assert_eq!(w.v.status(&wit), Status::Valid);
    // A buyer's claim acknowledging the publication it paid for.
    let claim = w.everyday_act(
        &mut buyer,
        finance_spec(),
        3,
        vec![(Value::Uint(0), Value::Text("a claim".into()))],
        None,
        Some(vec![sold]),
    );
    w.add(&claim);
    // The journalist's rotation leaves the side line out.
    let (r, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(w.v.status(&liked), Status::Void, "likes keep nothing alive");
    assert_eq!(w.v.status(&witnessed), Status::Disputed, "a witness act");
    assert_eq!(w.v.status(&sold), Status::Disputed, "a buyer's claim");
    let _ = &mut j;
}

/// A witness act's shape (Identity rule 18b): it acknowledges at least one
/// act and belongs to no chain; a verifier that cannot tell an act's MIP
/// shows a non-Identity act carrying `acks` as unknown, never valid.
#[test]
fn a_witness_act_names_what_it_witnesses() {
    let mut w = World::new();
    let mut r = w.operator("reader");
    let x = sha256(b"some act");
    let empty = w.everyday_act(&mut r, identity_spec(), 15, vec![], None, None);
    let empty = w.add(&empty);
    assert_eq!(w.v.status(&empty), Status::Invalid, "witnesses nothing");
    let chained = w.everyday_act(
        &mut r,
        identity_spec(),
        15,
        vec![],
        Some(vec![mor_core::act::Object { chain: x, predecessor: x }]),
        Some(vec![x]),
    );
    let chained = w.add(&chained);
    assert_eq!(w.v.status(&chained), Status::Invalid, "carries objects");
    let said = w.everyday_act(
        &mut r,
        identity_spec(),
        15,
        vec![(Value::Uint(0), Value::Text("I like it".into()))],
        None,
        Some(vec![x]),
    );
    let said = w.add(&said);
    assert_eq!(w.v.status(&said), Status::Invalid, "its payload is empty");
    // A verifier told only the Identity MIP's hash.
    let mut blind = mor_core::chain::Verifier::new(identity_spec());
    let law_act = w.everyday_act(&mut r, law_spec(), 17, vec![], None, Some(vec![x]));
    let genesis = w.v.resolve(&r.id).links[0].act;
    blind.add(w.v.get(&genesis).unwrap().act.clone()).unwrap();
    let id = blind.add(law_act.clone()).unwrap();
    assert_eq!(blind.status(&id), Status::Unknown);
    let id = w.add(&law_act);
    assert_eq!(w.v.status(&id), Status::Valid);
}

// ---------------------------------------------------------------- competing rotations (5.7)

#[test]
fn a_thiefs_rotation_held_only_by_the_lax_home_loses() {
    let mut w = World::new();
    let mut strict1 = w.operator("strict-1");
    let mut strict2 = w.operator("strict-2");
    let mut lax = w.operator("lax");
    let j = w.genesis(
        "journalist",
        vec![home(&strict1), home(&strict2), home(&lax)],
        None,
        None,
    );
    let (thief, mut t1) = w.rotate(
        &j,
        Rot {
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut lax, &j.id, &thief, 1);
    // The strict homes refuse it (device policy) and hold the journalist's.
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut strict1, &j.id, &own, 1);
    w.receipt(&mut strict2, &j.id, &own, 1);
    assert_eq!(chain(&w, &j), vec![j.id, own]);
    let thief_post = w.post(&mut t1, "posted under the thief's rotation");
    assert_eq!(
        w.v.status(&thief_post),
        Status::Invalid,
        "its binding never counts"
    );
    assert_eq!(w.v.status(&thief), Status::Invalid);
}

// ---------------------------------------------------------------- stolen operator keys (5.7b, 5.7d)

#[test]
fn a_forged_receipt_naming_a_made_up_act_changes_nothing() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let (r, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &r, 1);
    // The thief holds the operator's everyday key only.
    let mut thief = h.clone();
    w.receipt(&mut thief, &j.id, &sha256(b"a made-up rotation"), 1);
    let res = w.v.resolve(&j.id);
    assert_eq!(chain(&w, &j), vec![j.id, r]);
    assert!(
        res.contested.is_empty(),
        "never contested by a forged receipt"
    );
    // Two log summaries of which neither extends the other change no receipt's standing.
    let mut h_a = h.clone();
    w.log_summary(&mut h_a);
    let mut h_b = h.clone();
    h_b.log.reverse();
    w.log_summary(&mut h_b);
    assert_eq!(chain(&w, &j), vec![j.id, r]);
}

#[test]
fn a_genuine_rival_rotation_receipted_by_a_stolen_home_key_is_contested_until_the_operator_rotates()
{
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    // The thief holds the journalist's safety key and the home's everyday key.
    let (rival, _) = w.rotate(
        &j,
        Rot {
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    let mut stolen = h.clone();
    let forged = w.receipt(&mut stolen, &j.id, &rival, 1);
    let res = w.v.resolve(&j.id);
    assert!(
        matches!(res.stop, Stop::Contested(_)),
        "contested, not frozen"
    );
    assert_eq!(res.contested, vec![1]);
    assert_eq!(chain(&w, &j), vec![j.id]);
    // The operator rotates, keeping its genuine line: the forged receipt lies
    // outside the kept ancestry and is void.
    let (hr, _) = w.rotate(&h, Rot::default());
    assert_eq!(chain(&w, &h).last(), Some(&hr));
    assert_eq!(w.v.status(&forged), Status::Void);
    assert_eq!(chain(&w, &j), vec![j.id, own]);
    assert!(w.v.resolve(&j.id).dishonest.is_empty());
}

#[test]
fn an_acknowledged_voided_receipt_is_never_support() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut accomplice = w.operator("accomplice");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    let (rival, _) = w.rotate(
        &j,
        Rot {
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    let mut stolen = h.clone();
    let forged = w.receipt(&mut stolen, &j.id, &rival, 1);
    w.ack(&mut accomplice, forged);
    w.rotate(&h, Rot::default());
    assert_eq!(w.v.status(&forged), Status::Disputed);
    // Receipt check 6: never support; the position is shown contested.
    assert_eq!(chain(&w, &j), vec![j.id, own]);
    assert_eq!(w.v.resolve(&j.id).contested, vec![1]);
}

#[test]
fn with_audit_the_cosigned_receipt_settles_the_conflict() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut aud = w.operator("auditor");
    let audit = Audit {
        threshold: 1,
        auditors: vec![aud.id],
    };
    let j = w.genesis("journalist", vec![home(&h)], None, Some(audit));
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    // Without a cosigned summary, no receipt counts (receipt check 4).
    assert_eq!(chain(&w, &j), vec![j.id]);
    let s = w.log_summary(&mut h);
    w.cosign(&mut aud, &s, &h.id);
    assert_eq!(chain(&w, &j), vec![j.id, own]);
    // A rival receipted by the stolen key, never under a cosigned summary.
    let (rival, _) = w.rotate(
        &j,
        Rot {
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    let mut stolen = h.clone();
    w.receipt(&mut stolen, &j.id, &rival, 1);
    w.log_summary(&mut stolen);
    assert_eq!(
        chain(&w, &j),
        vec![j.id, own],
        "the audit settles which receipt is real"
    );
    // And the journalist's receipt under the cosigned summary survives the
    // operator's rotation even when it is not kept.
    w.rotate(
        &h,
        Rot {
            kept: Some(vec![]),
            ..Default::default()
        },
    );
    assert_eq!(chain(&w, &j), vec![j.id, own]);
}

#[test]
fn a_home_is_proven_dishonest_only_at_the_position_and_never_backwards() {
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let mut h3 = w.operator("home-3");
    let mut aud = w.operator("auditor");
    let audit = Audit {
        threshold: 1,
        auditors: vec![aud.id],
    };
    let j = w.genesis(
        "journalist",
        vec![home(&h1), home(&h2), home(&h3)],
        None,
        Some(audit),
    );
    // Position 1: counts on homes 1 and 2.
    let (r1, j1) = w.rotate(&j, Rot::default());
    w.receipt(&mut h1, &j.id, &r1, 1);
    w.receipt(&mut h2, &j.id, &r1, 1);
    // Position 2: home 1 receipts both the journalist's rotation and a
    // thief's genuine rival, and puts both in its audited log.
    let (r2, j2) = w.rotate(&j1, Rot::default());
    let (rival, _) = w.rotate(
        &j1,
        Rot {
            signing_key: Some(schnorr("thief", 2)),
            ..Default::default()
        },
    );
    w.receipt(&mut h1, &j.id, &r2, 2);
    w.receipt(&mut h1, &j.id, &rival, 2);
    w.receipt(&mut h2, &j.id, &r2, 2);
    w.receipt(&mut h3, &j.id, &r2, 2);
    // Position 3: home 1 and home 2 receipt it; home 3 does not.
    let (r3, _) = w.rotate(&j2, Rot::default());
    w.receipt(&mut h1, &j.id, &r3, 3);
    w.receipt(&mut h2, &j.id, &r3, 3);
    for h in [&mut h1, &mut h2, &mut h3] {
        let s = w.log_summary(h);
        let hid = h.id;
        w.cosign(&mut aud, &s, &hid);
    }
    let res = w.v.resolve(&j.id);
    assert_eq!(res.dishonest, vec![(Operator::Id(h1.id), 2)]);
    // Position 1 keeps counting on home 1's receipt; position 2 counts on
    // homes 2 and 3; position 3 does not: home 1 counts for nothing there.
    assert_eq!(chain(&w, &j), vec![j.id, r1, r2]);
    assert!(matches!(res.stop, Stop::Pending(_)));
    w.receipt(&mut h3, &j.id, &r3, 3);
    let s = w.log_summary(&mut h3);
    w.cosign(&mut aud, &s, &h3.id);
    assert_eq!(chain(&w, &j), vec![j.id, r1, r2, r3]);
}

// ---------------------------------------------------------------- audit dropped (F60)

#[test]
fn the_rotation_dropping_the_audit_requirement_is_judged_without_it() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let aud = w.operator("auditor");
    let j = w.genesis(
        "journalist",
        vec![home(&h)],
        None,
        Some(Audit {
            threshold: 1,
            auditors: vec![aud.id],
        }),
    );
    // The auditor has closed; no summary is ever cosigned again.
    let (r, _) = w.rotate(
        &j,
        Rot {
            audit: Some(None),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(
        chain(&w, &j),
        vec![j.id, r],
        "counts on the home's receipt alone"
    );
    assert_eq!(w.v.resolve(&j.id).states[1].audit, None);
}

// ---------------------------------------------------------------- closure (F56)

#[test]
fn homeless_after_closure_then_final_after_the_next_rotation() {
    let mut w = World::new();
    let old = w.operator("old-home");
    let mut new = w.operator("new-home");
    let j = w.genesis("journalist", vec![home(&old)], None, None);
    // The operator closes its home by a rotation.
    let (closure, _) = w.rotate(
        &old,
        Rot {
            closure: true,
            ..Default::default()
        },
    );
    assert_eq!(chain(&w, &old).last(), Some(&closure));
    let (hr, j1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            ..Default::default()
        },
    );
    assert_eq!(
        chain(&w, &j),
        vec![j.id],
        "no receipt from the new home yet"
    );
    w.receipt(&mut new, &j.id, &hr, 1);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
    assert_eq!(
        how_last(&w, &j),
        How::Homeless {
            basis: Basis::Gone,
            final_: false
        }
    );
    // The next rotation counts under the new home: final.
    let (r2, _) = w.rotate(&j1, Rot::default());
    w.receipt(&mut new, &j.id, &r2, 2);
    assert_eq!(chain(&w, &j), vec![j.id, hr, r2]);
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::Gone,
            final_: true
        }
    );
}

#[test]
fn a_stolen_operator_everyday_key_cannot_close_a_home() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut new = w.operator("thief-home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    // Closure is a rotation field; the everyday key signs only everyday acts.
    // A "rotation" signed with the operator's everyday key is no rotation.
    let mut fake = h.clone();
    fake.safety = slh("not the committed key", 0, 3);
    w.rotate(
        &fake,
        Rot {
            closure: true,
            ..Default::default()
        },
    );
    let (hr, _) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            ..Default::default()
        },
    );
    w.receipt(&mut new, &j.id, &hr, 1);
    assert_eq!(chain(&w, &j), vec![j.id], "the home is not gone");
    // And the live home objects all the same.
    w.object(&mut h, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id]);
}

// ---------------------------------------------------------------- homeless by auditors (5.7c)

#[test]
fn auditors_absence_statements_then_a_late_objection_changes_nothing() {
    let mut w = World::new();
    let mut old = w.operator("vanished-home");
    let mut new = w.operator("new-home");
    let mut a1 = w.operator("auditor-1");
    let mut a2 = w.operator("auditor-2");
    let audit = Audit {
        threshold: 2,
        auditors: vec![a1.id, a2.id],
    };
    let j = w.genesis("journalist", vec![home(&old)], None, Some(audit));
    let (hr, j1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            audit: Some(None),
            ..Default::default()
        },
    );
    w.receipt(&mut new, &j.id, &hr, 1);
    w.absent(&mut a1, &old.id, &j.id, &hr);
    assert_eq!(
        chain(&w, &j),
        vec![j.id],
        "two absence statements are required"
    );
    w.absent(&mut a2, &old.id, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
    assert_eq!(
        how_last(&w, &j),
        How::Homeless {
            basis: Basis::Gone,
            final_: false
        }
    );
    // The old home turns out to be alive, and objects. Provisional: while
    // the next rotation does not count, the objection voids it.
    let (r2, _) = w.rotate(&j1, Rot::default());
    let obj = w.object(&mut old, &j.id, &hr);
    assert_eq!(
        chain(&w, &j),
        vec![j.id],
        "provisional: the objection voids it"
    );
    // ...once the next rotation counts under the new home, it is final and
    // the objection is late by construction.
    w.receipt(&mut new, &j.id, &r2, 2);
    assert_eq!(chain(&w, &j), vec![j.id, hr, r2]);
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::Gone,
            final_: true
        }
    );
    assert_eq!(w.v.status(&obj), Status::Valid);
}

#[test]
fn a_thiefs_homeless_rotation_for_a_live_home_is_voided_by_its_objection() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut th = w.operator("thief-home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let (hr, _) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&th)]),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut th, &j.id, &hr, 1);
    // The home is alive: the verifier reaches it, it objects.
    assert_eq!(chain(&w, &j), vec![j.id], "the old home is not gone");
    w.object(&mut h, &j.id, &hr);
    w.v.failed_to_reach(h.id);
    assert_eq!(
        chain(&w, &j),
        vec![j.id],
        "one objection from a live home voids it (rule 32)"
    );
}

// ---------------------------------------------------------------- escape with both keys (5.7c)

#[test]
fn escape_past_a_hostile_home_after_a_refused_rotation() {
    let mut w = World::new();
    let mut hostile = w.operator("hostile-home");
    let mut new = w.operator("new-home");
    let mut j = w.genesis("journalist", vec![home(&hostile)], None, None);
    // The home refuses the journalist's normal rotation (no receipt).
    let (refused, _) = w.rotate(&j, Rot::default());
    assert_eq!(chain(&w, &j), vec![j.id]);
    // The journalist leaves with both keys: a homeless rotation with the
    // same safety key (rule 8a's exception), endorsed with the signing key,
    // listing the refused rotation as abandoned.
    let (hr, j1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            ..Default::default()
        },
    );
    let e = w.endorse(&mut j, &hr, Some(vec![refused]));
    w.receipt(&mut new, &j.id, &hr, 1);
    // The hostile home objects; the objection does not void an escape.
    w.object(&mut hostile, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
    assert_eq!(
        how_last(&w, &j),
        How::Homeless {
            basis: Basis::Escape,
            final_: false
        }
    );
    // F88: the endorsement is not judged by the rotation it endorses.
    assert_eq!(w.v.status(&e), Status::Valid);
    // The hostile home receipting the abandoned rotation later changes nothing.
    w.receipt(&mut hostile, &j.id, &refused, 1);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
    // The next rotation makes the escape final.
    let (r2, _) = w.rotate(&j1, Rot::default());
    w.receipt(&mut new, &j.id, &r2, 2);
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::Escape,
            final_: true
        }
    );
}

#[test]
fn a_rotation_counting_under_the_old_rule_beats_a_provisional_escape() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut new = w.operator("new-home");
    let mut j = w.genesis("journalist", vec![home(&h)], None, None);
    // A thief holding both keys escapes...
    let (hr, _) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.endorse(&mut j, &hr, None);
    w.receipt(&mut new, &j.id, &hr, 1);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
    // ...but a rotation that counts under the old home rule beats it (step 2).
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    assert_eq!(chain(&w, &j), vec![j.id, own]);
}

#[test]
fn a_lost_phone_at_a_strict_home_with_a_backed_up_signing_seed() {
    // 5.7: the strict home refuses every rotation without the lost device;
    // the backed-up seed restores the signing key, and both keys leave.
    let mut w = World::new();
    let mut strict = w.operator("strict-home");
    let mut new = w.operator("new-home");
    let j = w.genesis("journalist", vec![home(&strict)], None, None);
    let mut restored = j.clone();
    restored.sign = schnorr("journalist", 0);
    let (hr, _) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            ..Default::default()
        },
    );
    w.object(&mut strict, &j.id, &hr);
    w.receipt(&mut new, &j.id, &hr, 1);
    assert_eq!(chain(&w, &j), vec![j.id]);
    w.endorse(&mut restored, &hr, None);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
}

// ---------------------------------------------------------------- a censored reader (F87, 5.7c)

#[test]
fn a_censored_reader_sees_re_homed_without_audit_never_final_and_the_late_objection_undoes_both() {
    let mut w = World::new();
    let mut home_abroad = w.operator("home-abroad");
    let mut thief_home = w.operator("thief-home");
    let mut j = w.genesis("journalist", vec![home(&home_abroad)], None, None);
    let before_theft = w.post(&mut j, "the last genuine post");
    let (hr, t1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&thief_home)]),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut thief_home, &j.id, &hr, 1);
    // The censor blocks the real home: every address, every probe fails.
    w.v.failed_to_reach(home_abroad.id);
    assert_eq!(chain(&w, &j), vec![j.id, hr]);
    assert_eq!(
        how_last(&w, &j),
        How::Homeless {
            basis: Basis::OwnAttempt,
            final_: false
        }
    );
    // The thief rotates again at once under the homes it chose.
    let (t2, _) = w.rotate(&t1, Rot::default());
    w.receipt(&mut thief_home, &j.id, &t2, 2);
    assert_eq!(chain(&w, &j), vec![j.id, hr, t2]);
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::OwnAttempt,
            final_: false
        },
        "never made final by the next rotation"
    );
    // The home's objection reaches the reader in a bundle: both are void.
    w.object(&mut home_abroad, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id]);
    assert_eq!(w.v.status(&before_theft), Status::Valid);
    assert_eq!(w.v.status(&t2), Status::Invalid);
}

#[test]
fn an_unaudited_homeless_rotation_counts_through_closure_once_the_home_closes() {
    let mut w = World::new();
    let mut old = w.operator("old-home");
    let mut new = w.operator("new-home");
    let j = w.genesis("journalist", vec![home(&old)], None, None);
    let (hr, j1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            ..Default::default()
        },
    );
    w.receipt(&mut new, &j.id, &hr, 1);
    w.v.failed_to_reach(old.id);
    let (r2, _) = w.rotate(&j1, Rot::default());
    w.receipt(&mut new, &j.id, &r2, 2);
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::OwnAttempt,
            final_: false
        }
    );
    // Draft 8's reading of F87: a later closure of the old home makes it final.
    w.rotate(
        &old,
        Rot {
            closure: true,
            ..Default::default()
        },
    );
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::Gone,
            final_: true
        }
    );
    // A closed home's objection does not count.
    w.object(&mut old, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id, hr, r2]);
}

// ---------------------------------------------------------------- operators

#[test]
fn operators_hosting_each_other_resolve_on_their_own_signatures() {
    // A starts self-hosted; B is homed at A's relay. A then moves its home to
    // B's relay: each is now homed at the other, and resolving either leads
    // back to it ("Resolving an operator").
    let mut w = World::new();
    let pa = w.genesis("op-a", vec![own_home()], None, None);
    let mut pb = w.genesis("op-b", vec![home(&pa)], None, None);
    let (ra, mut pa1) = w.rotate(
        &pa,
        Rot {
            homes: Some(vec![home(&pb)]),
            ..Default::default()
        },
    );
    assert_eq!(
        chain(&w, &pa),
        vec![pa.id, ra],
        "self-hosted: no receipt needed"
    );
    w.receipt(&mut pb, &pa.id, &ra, 1);
    // B rotates, A receipts it; A rotates, B (under its new key) receipts it.
    let (rb, mut pb1) = w.rotate(&pb, Rot::default());
    w.receipt(&mut pa1, &pb.id, &rb, 1);
    let (ra2, _) = w.rotate(&pa1, Rot::default());
    w.receipt(&mut pb1, &pa.id, &ra2, 2);
    assert_eq!(chain(&w, &pa), vec![pa.id, ra, ra2]);
    assert_eq!(chain(&w, &pb), vec![pb.id, rb]);
    // B's receipt signed with its replaced key after rotating is void, and
    // is not what counted.
    let late = w.receipt(&mut pb, &pa.id, &ra2, 2);
    assert_eq!(w.v.status(&late), Status::Void);
}

// ---------------------------------------------------------------- schemes (8.4)

#[test]
fn a_rotation_to_an_everyday_key_of_an_unknown_scheme() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let spec = sha256(b"a post-quantum everyday scheme specification");
    let pq = SigningKey {
        scheme: Scheme::Spec(spec),
        key: vec![9; 40],
    };
    let (r, mut j1) = w.rotate(
        &j,
        Rot {
            raw_signing_key: Some(pq.clone()),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(
        chain(&w, &j),
        vec![j.id, r],
        "the rotation itself is valid to every client"
    );
    // An act signed under the new scheme: unknown to this client, never valid.
    let mut a = w.everyday_act(
        &mut j1,
        sha256(b"a text specification"),
        0,
        vec![],
        None,
        None,
    );
    a.signature = mor_core::act::Signature {
        scheme: Scheme::Spec(spec),
        key: pq.key.clone(),
        sig: vec![1; 50],
    };
    let id = w.add(&a);
    assert_eq!(w.v.status(&id), Status::Unknown);
}

// ---------------------------------------------------------------- succession and declarations

#[test]
fn succession_rides_on_rotation() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let next = Successor {
        protocol: "mor".into(),
        identifier: sha256(b"successor").to_vec(),
    };
    let (r1, j1) = w.rotate(
        &j,
        Rot {
            successor: Some(Some(next.clone())),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &r1, 1);
    let (r2, j2) = w.rotate(&j1, Rot::default());
    w.receipt(&mut h, &j.id, &r2, 2);
    let res = w.v.resolve(&j.id);
    assert_eq!(
        res.latest().unwrap().1.successor,
        Some(next),
        "a rotation without the field leaves it"
    );
    let (r3, _) = w.rotate(
        &j2,
        Rot {
            successor: Some(None),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &r3, 3);
    assert_eq!(w.v.resolve(&j.id).latest().unwrap().1.successor, None);
}

#[test]
fn a_new_home_set_must_still_fit_the_rule_in_effect() {
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let j = w.genesis(
        "journalist",
        vec![home(&h1), home(&h2)],
        Some(HomeRule::Threshold(2)),
        None,
    );
    // Down to one home, keeping a two-operator threshold: invalid.
    let (bad, _) = w.rotate(
        &j,
        Rot {
            homes: Some(vec![home(&h1)]),
            ..Default::default()
        },
    );
    w.receipt(&mut h1, &j.id, &bad, 1);
    w.receipt(&mut h2, &j.id, &bad, 1);
    assert_eq!(chain(&w, &j), vec![j.id]);
    // Returning to the default with the new home set: valid.
    let (good, _) = w.rotate(
        &j,
        Rot {
            homes: Some(vec![home(&h1)]),
            rule: Some(None),
            ..Default::default()
        },
    );
    w.receipt(&mut h1, &j.id, &good, 1);
    w.receipt(&mut h2, &j.id, &good, 1);
    assert_eq!(chain(&w, &j), vec![j.id, good]);
}

// ---------------------------------------------------------------- F92: an old-rule rotation always wins

#[test]
fn a_stolen_used_safety_key_cannot_rewrite_history_after_a_closure() {
    let mut w = World::new();
    let mut h0 = w.operator("home-0");
    let mut t = w.operator("thief-home");
    let j = w.genesis("journalist", vec![home(&h0)], None, None);
    // Years of genuine rotations, all receipted by the home.
    let (r1, j1) = w.rotate(&j, Rot::default());
    w.receipt(&mut h0, &j.id, &r1, 1);
    let (r2, j2) = w.rotate(&j1, Rot::default());
    w.receipt(&mut h0, &j.id, &r2, 2);
    let (r3, _) = w.rotate(&j2, Rot::default());
    w.receipt(&mut h0, &j.id, &r3, 3);
    // The home closes by its operator's rotation, keeping its receipts.
    w.rotate(
        &h0,
        Rot {
            closure: true,
            ..Default::default()
        },
    );
    // A thief finds the first safety key, used in r1, on an old backup,
    // makes a homeless rotation at position 1, and rotates again at once.
    let (h1, t1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&t)]),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut t, &j.id, &h1, 1);
    let (t2, _) = w.rotate(&t1, Rot::default());
    w.receipt(&mut t, &j.id, &t2, 2);
    // Rule 31 stays "always" (F92): r1 counts under the old home rule.
    assert_eq!(chain(&w, &j), vec![j.id, r1, r2, r3]);
}

#[test]
fn a_closed_home_signs_no_more_receipts() {
    let mut w = World::new();
    let h0 = w.operator("home-0");
    let j = w.genesis("journalist", vec![home(&h0)], None, None);
    let (_, mut closed) = w.rotate(
        &h0,
        Rot {
            closure: true,
            ..Default::default()
        },
    );
    // The operator, under the key its closing rotation set, receipts a rotation.
    let (r1, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut closed, &j.id, &r1, 1);
    assert_eq!(
        chain(&w, &j),
        vec![j.id],
        "closure ends the role for good (rule 8c)"
    );
}

#[test]
fn a_final_escape_still_loses_to_a_rotation_counting_under_the_old_rule() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut new = w.operator("new-home");
    let mut j = w.genesis("journalist", vec![home(&h)], None, None);
    let (hr, j1) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&new)]),
            ..Default::default()
        },
    );
    w.endorse(&mut j, &hr, None);
    w.receipt(&mut new, &j.id, &hr, 1);
    let (r2, _) = w.rotate(&j1, Rot::default());
    w.receipt(&mut new, &j.id, &r2, 2);
    assert_eq!(
        w.v.resolve(&j.id).links[1].how,
        How::Homeless {
            basis: Basis::Escape,
            final_: true
        }
    );
    // The home genuinely held another rotation at position 1: first held wins.
    let (other, _) = w.rotate(
        &j,
        Rot {
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut h, &j.id, &other, 1);
    assert_eq!(chain(&w, &j), vec![j.id, other]);
}

#[test]
fn absence_statements_are_judged_by_the_auditors_in_force_before_the_homeless_rotation() {
    let mut w = World::new();
    let h = w.operator("home");
    let mut th = w.operator("thief-home");
    let aud = w.operator("auditor");
    let mut friend = w.operator("friendly-auditor");
    let j = w.genesis(
        "journalist",
        vec![home(&h)],
        None,
        Some(Audit {
            threshold: 1,
            auditors: vec![aud.id],
        }),
    );
    // A thief holding the safety key drops auditing in the homeless rotation...
    let (hr, _) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&th)]),
            audit: Some(None),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut th, &j.id, &hr, 1);
    // ...but the identity required audit while the old home served: a
    // reader's own failed attempt is not enough.
    w.v.failed_to_reach(h.id);
    assert_eq!(chain(&w, &j), vec![j.id]);
    // A thief naming its own auditor gets nowhere either.
    let (hr2, _) = w.rotate(
        &j,
        Rot {
            homeless: true,
            homes: Some(vec![home(&th)]),
            audit: Some(Some(Audit {
                threshold: 1,
                auditors: vec![friend.id],
            })),
            signing_key: Some(schnorr("thief", 1)),
            ..Default::default()
        },
    );
    w.receipt(&mut th, &j.id, &hr2, 1);
    let s = w.log_summary(&mut th);
    w.cosign(&mut friend, &s, &th.id);
    w.absent(&mut friend, &h.id, &j.id, &hr2);
    assert_eq!(chain(&w, &j), vec![j.id]);
}
