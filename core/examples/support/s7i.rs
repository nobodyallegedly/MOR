//! A collective's claim (Agreements, "Claim (type 3)", rules 15 and 58),
//! and Money's routes across rails (Money rules 24 to 28): the cases each
//! rule names, written with the core's own acts.

use super::*;

fn sorted_hex(xs: &[Hash]) -> Vec<String> {
    let mut v: Vec<String> = xs.iter().map(|x| hx(x)).collect();
    v.sort();
    v
}

fn fresh(log: &[(mor_core::act::Act, Option<[u8; 32]>)]) -> World {
    let mut w = World::new();
    for (a, _) in log {
        w.add(a);
    }
    w
}

/// Who made a work and who owns it as recorded (rule 15): the claims that
/// count and bind, and the default holder where no ownership agreement
/// writes shares in it.
pub fn work_owners_json(e: Result<agreements::WorkOwners, agreements::AgreementsError>) -> J {
    match e {
        Ok(o) => json!({ "claims": sorted_hex(&o.claims), "default_holder": o.default_holder.map(|x| hx(&x)) }),
        Err(_) => json!("unknown"),
    }
}

/// A collective's claim: a claim a member signs for the collective is the
/// collective's, its opener and a creator; members may be listed beside it.
pub fn agreements(out: &mut Out) {
    let mut w = World::new();
    let col = collective(&mut w, &[1], 1);
    let cid = col.id;
    let mut ben = member_for(&col, 1);
    let mut stranger = w.genesis("a stranger to the band", vec![own_home()], None, None);
    let song = spec("the band's song, its work hash");
    let base = w.log.clone();
    let ask_owners = json!({ "question": "work owners", "work": hx(&song) });
    let rule = "Agreements, \"Claim (type 3)\": its opener among its creators; rules 15, 58 and 60";

    // 1. The collective alone, its claim signed by a member for it.
    let mut w1 = fresh(&base);
    let c1 = claim_act(&mut w1, &mut ben, &[cid], song);
    out.case(&mut w1, "a claim a member signs for the collective, naming the collective its one creator: the collective's claim, the collective the default holder", rule,
        "Ben signs it with his own key, naming the collective in `objects`; any one member acts for it in Agreements. Read as rule 58 reads every act for a collective, its opener is the collective, among its creators; no other creator to sign.",
        Facts::default(), ask_status(&c1), json!("valid"), None);
    let mut w1b = fresh(&w1.log.clone());
    out.case(&mut w1b, "the same: the collective the default holder of the work", rule,
        "One claim binds the work and no ownership agreement writes shares in it: the default holder is the claim's opener, the collective.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [hx(&c1)], "default_holder": hx(&cid) }), None);

    // 2. The collective and a member as co-creator.
    let mut w2 = fresh(&base);
    let mut ben2 = member_for(&col, 1);
    let c2 = claim_act(&mut w2, &mut ben2, &[cid, col.m[1].id], song);
    let before = w2.log.clone();
    out.case(&mut w2, "a member's claim for the collective listing that member beside it, the member's own signature act not yet given: not bound", rule,
        "The collective opens it; Ben, a co-creator listed beside it, is another creator, who binds it by his own signature act (\"Claim (type 3)\"): until then nothing binds.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [], "default_holder": null }), None);
    let mut w2b = fresh(&before);
    let mut ben_own = col.m[1].clone();
    sign(&mut w2b, &mut ben_own, &c2);
    out.case(&mut w2b, "the same, Ben's own signature act naming it: bound, the collective the default holder", rule,
        "Ben signs it as himself, a co-creator; the claim binds, and its opener, the collective, is the default holder.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [hx(&c2)], "default_holder": hx(&cid) }), None);

    // 3. A stranger's claim naming the collective: nobody's.
    let mut w3 = fresh(&base);
    let mut s = stranger.acting_for(cid, vec![cid]);
    let c3 = claim_act(&mut w3, &mut s, &[cid], song);
    let _ = &mut stranger;
    out.case(&mut w3, "a stranger's claim naming the collective its creator: nobody's claim", rule,
        "Anyone can write a collective's name in `objects`; a stranger's act naming it counts for nothing (rule 58), so no claim binds the work.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [], "default_holder": null }), None);
    let _ = c3;

    // 4. A member's act naming the collective, listing only the member: the
    // collective's act, its opener not among the creators.
    let mut w4 = fresh(&base);
    let mut ben4 = member_for(&col, 1);
    let c4 = claim_act(&mut w4, &mut ben4, &[col.m[1].id], song);
    out.case(&mut w4, "a member's claim naming the collective, the member its only creator: the collective's act, its opener not among its creators, counting for nothing", rule,
        "Its bytes name the collective, so it is the collective's (rule 58), and the collective is not among its creators: no claim. A member claiming for himself signs without naming the collective.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [], "default_holder": null }), None);
    let _ = c4;

    // 5. Neither its signer nor any chain it names among its creators: invalid.
    let mut w5 = fresh(&base);
    let mut ben5 = member_for(&col, 1);
    let c5 = claim_act(&mut w5, &mut ben5, &[col.m[0].id], song);
    out.case(&mut w5, "a claim naming neither its signer nor the collective it names among its creators: invalid", "Agreements, \"Claim (type 3)\": its opener among its creators",
        "Ben signs it for the collective and lists only Ana: neither its signer nor any chain its `objects` name is among its creators, outside its format.",
        Facts::default(), ask_status(&c5), json!("invalid"), None);
}
