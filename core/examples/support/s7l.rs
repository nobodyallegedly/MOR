//! S7l: a collective's claim may list any co-creators, members or not,
//! persons or collectives, a collective counting as one.

use super::s7i::fresh;
use super::*;

/// A second collective, its members and chain named apart from
/// [`collective`]'s, so that two live in one world.
fn collective_of(w: &mut World, names: &[&str], chain_name: &str) -> Col {
    let mut m: Vec<Person> = names.iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis(&format!("{chain_name}'s abandonment authority"), vec![own_home()], None, None);
    let keeper = w.genesis(&format!("{chain_name}'s keeper"), vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let t = collective_terms(&ids, authority.id, keeper.id, vec![ids[1]], 1);
    let founding = ag_act(w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(w, p, &founding);
    }
    let chain = w.genesis_with(chain_name, vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
    let id = chain.id;
    let c = m[2].acting_for(id, vec![id]);
    Col { m, id, chain, c, founding }
}

/// Co-productions: a collective's claim listing a person who is no member,
/// and another collective, beside it; each binds the claim by its own
/// signature act, the other collective's by a member's act for it; the
/// default holder, with no ownership agreement, is the claim's opener.
pub fn agreements(out: &mut Out) {
    let mut w = World::new();
    let col = collective(&mut w, &[1], 1);
    let other = collective_of(&mut w, &["dee", "eli", "fay"], "a studio, a collective");
    let mut gus = w.genesis("gus, a producer who is no member", vec![own_home()], None, None);
    let stranger = w.genesis("a stranger to the studio", vec![own_home()], None, None);
    let (cid, oid) = (col.id, other.id);
    let song = spec("a co-produced song, its work hash");
    let base = w.log.clone();
    let ask_owners = json!({ "question": "work owners", "work": hx(&song) });
    let rule = "Agreements, \"Claim (type 3)\": a claim made for a collective may list any co-creators, members or not, persons or collectives, a collective counting as one; rules 15, 58 and 60";

    // 1. A person who is no member, beside the collective.
    let mut w1 = fresh(&base);
    let c1 = claim_act(&mut w1, &mut member_for(&col, 1), &[cid, gus.id], song);
    let before = w1.log.clone();
    out.case(&mut w1, "a collective's claim listing beside it a person who is no member, their signature act not yet given: not bound", rule,
        "Ben signs it for the band, naming Gus, a producer outside the band, as a co-creator. Gus is another creator, who binds it by his own signature act: until then nothing binds.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [], "default_holder": null }), None);
    let mut w1b = fresh(&before);
    sign(&mut w1b, &mut gus, &c1);
    out.case(&mut w1b, "the same, the non-member's own signature act naming it: bound, the collective the default holder", rule,
        "Gus signs it; the claim binds. With no ownership agreement, the default holder is its opener, the band.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [hx(&c1)], "default_holder": hx(&cid) }), None);

    // 2. Another collective beside it, counting as one.
    let mut w2 = fresh(&base);
    let c2 = claim_act(&mut w2, &mut member_for(&col, 1), &[cid, oid], song);
    let before = w2.log.clone();
    out.case(&mut w2, "a collective's claim listing another collective beside it, that collective's signature act not yet given: not bound", rule,
        "The band opens it and names the studio, a collective, as a co-creator: the studio binds it by one signature act, a member's act for it counting under its rule for Agreements.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [], "default_holder": null }), None);
    let mut w2b = fresh(&before);
    sign(&mut w2b, &mut other.m[1].acting_for(oid, vec![oid]), &c2);
    out.case(&mut w2b, "the same, a member's signature act for the other collective naming it: bound, the opening collective the default holder", rule,
        "Eli signs for the studio; the studio, one creator, has signed. The claim binds; the default holder is its opener, the band.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [hx(&c2)], "default_holder": hx(&cid) }), None);
    let mut w2c = fresh(&before);
    sign(&mut w2c, &mut stranger.acting_for(oid, vec![oid]), &c2);
    out.case(&mut w2c, "the same, a stranger's signature act naming the other collective: not bound", rule,
        "A stranger's act naming the studio is nobody's (rule 58): the studio has not signed, and nothing binds.",
        Facts::default(), ask_owners.clone(), json!({ "claims": [], "default_holder": null }), None);
}
