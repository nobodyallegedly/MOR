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

/// A rule 40 contest: competing rotations, each missing the home rule; the
/// escape opens there too (Identity rule 29, second exception).
pub fn identity_rule_40(out: &mut Out) {
    let mut w = World::new();
    let mut a = w.operator("a home receipting the owner's rotation, rule 40");
    let mut b = w.operator("a home receipting the rival, rule 40");
    let mut n = w.operator("a new home, the escape, rule 40");
    let p = w.genesis("an identity contested by two rotations each missing the rule", vec![home_of(&a), home_of(&b)], Some(HomeRule::Threshold(2)), None);
    let pid = p.id;
    let (r, _) = w.rotate(&p, Rot::default());
    let (r2, _) = w.rotate(&p, Rot { signing_key: Some(schnorr("a thief's signing key, rule 40", 0)), ..Default::default() });
    w.receipt(&mut a, &pid, &r, 1);
    w.receipt(&mut b, &pid, &r2, 1);
    let (e, _) = w.rotate(&p, Rot { homeless: true, homes: Some(vec![home_of(&n)]), rule: Some(None), ..Default::default() });
    w.receipt(&mut n, &pid, &e, 1);
    let mut owner = p.clone();
    w.endorse(&mut owner, &e, Some(vec![r, r2]));
    out.case(&mut w, "two homes and a rule of two, each home receipting one of two rotations under the same chain key, the owner's endorsed escape abandoning both: the escape counts", "Identity rule 40; rule 29, second exception: a rule 40 contest opens the escape too",
        "Neither rotation meets a rule of two: the position is contested (rule 40). The owner's homeless rotation with that chain key, endorsed and abandoning both, receipted by its new home, counts.",
        Facts::default(), chain_q(&pid), json!({ "counting": [hx(&pid), hx(&e)], "next": "end", "dishonest": [] }), None);
}

fn fresh_of(log: &[(mor_core::act::Act, Option<[u8; 32]>)]) -> World {
    let mut w = World::new();
    for (a, _) in log {
        w.add(a);
    }
    w
}

// ------------------------------------------------- the fresh identity's refund

/// Anonymity on MOR is a fresh identity, not a missing one (Money rule 17;
/// rule 11): a self-hosted fresh identity, committed by the payment as its
/// payer, names a refund rail in its claim (key 7) and is refunded there;
/// a routing node holding the rail's proof cannot take it.
pub fn fresh_identity_refund(out: &mut Out) {
    let unit = spec("a test unit (regtest satoshi)");
    let amt = |v: u64| Amount { unit, value: v };
    let rail = spec("a rail Module, a fresh identity's refund");
    let mut w = World::new();
    let mut shop = w.genesis("a shop refunding a fresh identity", vec![own_home()], None, None);
    let mut fresh = w.genesis("a fresh identity hosted by its own wallet, paying once", vec![own_home()], None, None);
    let mut node = w.genesis("a routing node that saw the payment's proof", vec![own_home()], None, None);
    let ptr = pointer_act(&mut w, &mut shop, b"the shop's address, a fresh identity");
    let proof = b"a fresh identity pays the shop".to_vec();
    let rec = { let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(fresh.id), payee: shop.id, amount: amt(300), fulfils: ptr, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut shop, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let fc = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: shop.id, amount: amt(300), fulfils: ptr, disagrees: None, referral: None, refund: Some(money::Rail { module: rail, address: b"the fresh identity's refund address".to_vec() }), purchase: None, previous: None });
        let a = w.everyday_act(&mut fresh, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    let back = b"the shop pays the money back".to_vec();
    let refund_by = |w: &mut World, shop: &mut Person| {
        let c = Fin::Claim(Claim { rail, proof: back.clone(), payee: fresh.id, amount: amt(300), fulfils: rec, disagrees: None, referral: None, refund: None, purchase: None, previous: None });
        let a = w.everyday_act(shop, mirs().money, 3, c.to_map(), None, None);
        w.add(&a)
    };
    let ask_back = json!({ "question": "refund repaid", "payment": hx(&rec), "to": hx(&fresh.id), "unit": hx(&unit) });
    let rule = "Money rule 17: a refund owed to an identity is paid to its payee pointer, or where the payer's claim names a refund rail (key 7), there";
    let mut w1 = World::new();
    for (a, _) in &base { w1.add(a); }
    let mut s1 = shop.clone();
    let r1 = refund_by(&mut w1, &mut s1);
    out.case(&mut w1, "a refund to a fresh identity the payment committed to, hosted by its own wallet, paid to the refund rail its claim names: repaid", rule,
        "The payer stays unknown by paying as a fresh identity of its own (Identity rule 4), committed by the payment; its claim names where money owed back goes (key 7). The shop's claim of the money back, the rail's answer saying it reached that rail, repays it.",
        Facts { rail_valid: vec![(rec, ptr), (fc, ptr), (r1, fc)], rail_payments: vec![(proof.clone(), b"the payment".to_vec()), (back.clone(), b"the refund".to_vec())], ..Default::default() }, ask_back.clone(), json!(300), None);
    // A routing node holding the proof claims the payment, naming its own rail.
    let mut w2 = World::new();
    for (a, _) in &base { w2.add(a); }
    let nc = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: shop.id, amount: amt(300), fulfils: ptr, disagrees: None, referral: None, refund: Some(money::Rail { module: rail, address: b"the routing node's address".to_vec() }), purchase: None, previous: None });
        let a = w2.everyday_act(&mut node, mirs().money, 3, c.to_map(), None, None); w2.add(&a) };
    let mut s2 = shop.clone();
    let r2 = refund_by(&mut w2, &mut s2);
    out.case(&mut w2, "the same payment, a routing node holding its proof claiming it and naming its own refund rail, the money sent there: nothing repaid to the fresh identity", rule,
        "The payment committed the fresh identity as its payer; the node's claim is not the payer's, and its rail refuses it (the commitment recomputed from it names another payer). Money sent to the node's rail repays nothing owed to the fresh identity.",
        Facts { rail_valid: vec![(rec, ptr), (fc, ptr), (r2, nc)], rail_invalid: vec![nc], rail_payments: vec![(proof.clone(), b"the payment".to_vec()), (back.clone(), b"the refund".to_vec())], ..Default::default() }, ask_back, json!(0), None);
}
