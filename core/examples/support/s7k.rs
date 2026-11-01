//! S7k: the escape out of a position one home's conflict holds contested
//! (Identity rule 29, second exception; section 11), Fable's four cases,
//! written with the core's own acts.

use super::*;
use mor_core::identity::HomeRule;

fn chain_q(id: &Hash) -> J {
    json!({ "question": "chain", "identity": hx(id) })
}

pub fn identity(out: &mut Out) {
    let mut w = World::new();
    let mut a = w.operator("an honest home, a standing contest");
    let mut b = w.operator("a home receipting both rotations");
    let mut n = w.operator("a new home, the escape");
    let p = w.genesis("an identity held contested by one home's conflict", vec![home_of(&a), home_of(&b)], Some(HomeRule::Threshold(2)), None);
    let pid = p.id;
    // The owner's rotation, and a thief's rival with the same chain key.
    let (r, _) = w.rotate(&p, Rot::default());
    let (r2, _) = w.rotate(&p, Rot { signing_key: Some(schnorr("a thief's signing key, a standing contest", 0)), ..Default::default() });
    w.receipt(&mut a, &pid, &r, 1);
    w.receipt(&mut b, &pid, &r, 1);
    w.receipt(&mut b, &pid, &r2, 1);
    let contested = w.log.clone();
    let rule = "Identity rule 44; \"Which rotation counts\", step 2";
    out.case(&mut fresh_of(&contested), "two homes and a rule of two, one home receipting both the owner's rotation and a rival under the same chain key: contested at that position", rule,
        "The home that receipts both has its receipts left out; the other home's one receipt does not meet a rule of two: no rotation counts at position 1.",
        Facts::default(), chain_q(&pid), json!({ "counting": [hx(&pid)], "next": "contested", "dishonest": [] }), None);

    // The escape: a homeless rotation at the same position, its
    // endorsement abandoning both, receipted by the new home.
    let (e, _) = w.rotate(&p, Rot { homeless: true, homes: Some(vec![home_of(&n)]), rule: Some(None), ..Default::default() });
    w.receipt(&mut n, &pid, &e, 1);
    let with_e = w.log.clone();
    let mut owner = p.clone();
    let mut w2 = fresh_of(&with_e);
    w2.endorse(&mut owner, &e, Some(vec![r, r2]));
    let rule2 = "Identity rule 29, second exception; section 11, the escape out of a contested position";
    out.case(&mut w2, "the same, the owner's endorsed homeless rotation at that position abandoning both rotations, receipted by its new home: the escape counts", rule2,
        "Two rotations revealing one chain key contest the position; the owner signs one endorsed homeless rotation with that chain key, its endorsement listing both as abandoned. Steps 3 and 4 do not apply; the new home's receipt meets the rule it declares; no rotation counts there under the old rule, and both abandoned ones never can.",
        Facts::default(), chain_q(&pid), json!({ "counting": [hx(&pid), hx(&e)], "next": "end", "dishonest": [] }), None);

    // No endorsement, the honest old home objecting: void.
    let mut w3 = fresh_of(&with_e);
    w3.object(&mut a, &pid, &e);
    out.case(&mut w3, "the same homeless rotation with no endorsement, the honest old home objecting: void", "Identity rule 49; rule 29: the escape is the endorsed rotation",
        "Without the endorsement it is an ordinary homeless rotation; a live old home's valid objection voids it.",
        Facts::default(), json!({ "question": "status", "act": hx(&e) }), json!("void"), None);

    // A verifier holding both rotations and the escape, not its endorsement.
    out.case(&mut fresh_of(&with_e), "a verifier holding both rotations and the homeless rotation but not its endorsement: still contested", "Identity section 11: the exit is in the endorsement's bytes",
        "Without the endorsement, the homeless rotation is an ordinary one; this verifier reached both old homes and holds no absence statement, so neither is gone (step 4): nothing counts at position 1 for it.",
        Facts::default(), chain_q(&pid), json!({ "counting": [hx(&pid)], "next": "contested", "dishonest": [] }), None);
}

fn fresh_of(log: &[(mor_core::act::Act, Option<[u8; 32]>)]) -> World {
    let mut w = World::new();
    for (a, _) in log {
        w.add(a);
    }
    w
}
