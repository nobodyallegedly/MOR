//! S7j: four sentences of Identity, written with the core's own acts: a
//! pending acknowledgement (rule 34), what "cannot tell" covers ("What
//! stops a chain"), dishonesty when a home never rotates (rule 45), and
//! "exactly that entry" for the acts of the homeless path ("What an
//! Identity act names in `objects`").

use super::*;
use mor_core::identity::{Endorsement, Objection, Payload as IdPayload};

/// A world holding every act of `log` but those `without` names.
fn holding_but(log: &[(mor_core::act::Act, Option<[u8; 32]>)], without: &[Hash]) -> World {
    let mut w = World::new();
    for (a, _) in log {
        if !without.contains(&a.id()) {
            w.add(a);
        }
    }
    w
}

fn chain_of(id: &Hash) -> J {
    json!({ "question": "chain", "identity": hx(id) })
}

pub fn identity(out: &mut Out) {
    pending_acknowledgement(out);
    cannot_tell(out);
    never_rotating_home(out);
    exactly_that_entry(out);
}

/// Rule 34: where the only acknowledgement that would rescue a disowned act
/// is pending, the act is pending, neither void nor disputed, until that
/// rotation counts or can no longer count.
fn pending_acknowledgement(out: &mut Out) {
    let mut w = World::new();
    let mut hr = w.operator("a reader's home");
    let mut j = w.genesis("jo, who disowns a post", vec![own_home()], None, None);
    let x = w.post(&mut j, "a post jo later disowns");
    w.rotate(&j, Rot { disowned: Some(vec![x]), ..Default::default() });
    let reader = w.genesis("a reader with a home", vec![home_of(&hr)], None, None);
    let (rr, mut reader1) = w.rotate(&reader, Rot::default());
    let wit = w.ack(&mut reader1, x);
    let base = w.log.clone();
    let rule = "Identity rule 34: an acknowledgement that would rescue the act is pending";
    out.case(&mut holding_but(&base, &[]), "a disowned post whose only acknowledgement is bound to a rotation its signer's home has not receipted: pending, neither void nor disputed", rule,
        "Jo's rotation disowns the post; a reader witnessed it, signing with the key of a rotation no receipt has made count yet. That witness act is pending (everyday check 2), so the post is pending too, until the reader's rotation counts or can no longer count.",
        Facts::default(), ask_status(&x), json!("pending"), None);
    out.case(&mut holding_but(&base, &[]), "the same: the witness act itself, pending", "Identity, everyday check 2; rule 28",
        "Bound to a rotation that does not count yet.", Facts::default(), ask_status(&wit), json!("pending"), None);
    let mut w2 = holding_but(&base, &[]);
    w2.receipt(&mut hr, &reader.id, &rr, 1);
    out.case(&mut w2, "the same once the reader's home receipts its rotation: disputed", rule,
        "The reader's rotation counts; the witness act is valid and relies on the post, which is valid and shown as disputed.",
        Facts::default(), ask_status(&x), json!("disputed"), None);
    let mut w3 = holding_but(&base, &[]);
    let (rival, _) = w3.rotate(&reader, Rot { signing_key: Some(schnorr("the reader, the other line", 1)), ..Default::default() });
    w3.receipt(&mut hr, &reader.id, &rival, 1);
    out.case(&mut w3, "the same once the reader's home receipts a rival rotation instead: void", rule,
        "The rotation the witness act is bound to can no longer count; the witness act is invalid, nothing relies on the post, and it is void.",
        Facts::default(), ask_status(&x), json!("void"), None);
}

/// "What stops a chain": cannot tell covers evidence the verifier cannot
/// judge that would, taken as valid and taken as absent, change which
/// rotation counts there or whether one does; pending evidence that would
/// so change it makes the position pending.
fn cannot_tell(out: &mut Out) {
    let rule = "Identity, \"What stops a chain\": cannot tell";

    // 1. A receipt whose operator's chain the verifier cannot resolve.
    let mut w = World::new();
    let mut h = w.operator("a home whose genesis this verifier does not hold");
    let j = w.genesis("kai", vec![home_of(&h)], None, None);
    let (r1, mut j1) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &r1, 1);
    let post = w.post(&mut j1, "posted under kai's rotation");
    let log = w.log.clone();
    out.case(&mut holding_but(&log, &[h.id]), "a rotation whose one home's receipt is signed by an operator whose chain the verifier cannot resolve: cannot tell", rule,
        "Taken as valid, the receipt makes the rotation count; taken as absent, none counts. The readings differ, so whether one counts there cannot be told.",
        Facts::default(), chain_of(&j.id), json!({ "counting": [hx(&j.id)], "next": "cannot tell", "dishonest": [] }), None);
    out.case(&mut holding_but(&log, &[h.id]), "the same: the rotation, unknown", rule,
        "A rotation at a position that cannot be told.", Facts::default(), ask_status(&r1), json!("unknown"), None);
    out.case(&mut holding_but(&log, &[h.id]), "the same: an act bound to it, unknown", "Identity, \"A verifier that cannot tell answers unknown\"",
        "Bound to a rotation whether it counts cannot be told.", Facts::default(), ask_status(&post), json!("unknown"), None);
    out.case(&mut holding_but(&log, &[]), "the same, the operator's genesis held: the rotation counts", "Identity, \"Which rotation counts\"",
        "The receipt passes the receipt checks; the one home's receipt meets the rule.", Facts::default(), ask_status(&r1), json!("valid"), None);

    // 2. Evidence the verifier cannot judge that changes nothing.
    let mut w = World::new();
    let mut h1 = w.operator("home one");
    let mut h2 = w.operator("home two");
    let mut h3 = w.operator("home three, its genesis not held");
    let j = w.genesis("lee", vec![home_of(&h1), home_of(&h2), home_of(&h3)], None, None);
    let (r, _) = w.rotate(&j, Rot::default());
    let (rival, _) = w.rotate(&j, Rot { signing_key: Some(schnorr("lee's thief", 1)), ..Default::default() });
    w.receipt(&mut h1, &j.id, &r, 1);
    w.receipt(&mut h2, &j.id, &r, 1);
    w.receipt(&mut h3, &j.id, &rival, 1);
    let log = w.log.clone();
    out.case(&mut holding_but(&log, &[h3.id]), "two of three homes receipt a rotation, the third's receipt for a rival signed by an operator whose chain the verifier cannot resolve: the rotation counts", rule,
        "Taken as valid or as absent, the third receipt leaves the rotation two of three: it changes nothing, so the position is told.",
        Facts::default(), chain_of(&j.id), json!({ "counting": [hx(&j.id), hx(&r)], "next": "end", "dishonest": [] }), None);

    // 3. A pending receipt: the position pending, never cannot tell.
    let mut w = World::new();
    let mut g = w.operator("the home of kim's home");
    let h = w.genesis("kim's home, itself homed", vec![home_of(&g)], None, None);
    let (hr, mut h1) = w.rotate(&h, Rot::default());
    let j = w.genesis("kim", vec![home_of(&h)], None, None);
    let (r1, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h1, &j.id, &r1, 1);
    let log = w.log.clone();
    out.case(&mut holding_but(&log, &[]), "a rotation whose one home's receipt is bound to a rotation of that home its own home has not receipted: pending", rule,
        "The receipt is pending, not unknown: the verifier holds everything and waits for a receipt. Taken as valid it would make the rotation count; the position is pending.",
        Facts::default(), chain_of(&j.id), json!({ "counting": [hx(&j.id)], "next": "pending", "dishonest": [] }), None);
    let mut w2 = holding_but(&log, &[]);
    w2.receipt(&mut g, &h.id, &hr, 1);
    out.case(&mut w2, "the same once the home's own home receipts its rotation: the rotation counts", rule,
        "The receipt's operator's rotation counts; the receipt passes, and meets the rule.", Facts::default(), ask_status(&r1), json!("valid"), None);

    // 4. A pending objection to a homeless rotation.
    let mut w = World::new();
    let g = w.operator("the old home's own home");
    let o = w.genesis("an old home, itself homed", vec![home_of(&g)], None, None);
    let (_, mut o1) = w.rotate(&o, Rot::default());
    let mut new = w.operator("a new home");
    let j = w.genesis("lin", vec![home_of(&o)], None, None);
    let (hl, _) = w.rotate(&j, Rot { homes: Some(vec![home_of(&new)]), homeless: true, ..Default::default() });
    w.receipt(&mut new, &j.id, &hl, 1);
    let ob = w.object(&mut o1, &j.id, &hl);
    let log = w.log.clone();
    let facts = || Facts { failed_to_reach: vec![o.id], ..Default::default() };
    out.case(&mut holding_but(&log, &[]), "a homeless rotation whose old home's objection is bound to a rotation of that home not yet receipted: pending", rule,
        "The verifier failed to reach the old home, and the new home receipts the rotation. Taken as absent, the objection lets it count; taken as valid, it voids it. The objection is pending, so the position is pending, neither counting nor cannot tell.",
        facts(), chain_of(&j.id), json!({ "counting": [hx(&j.id)], "next": "pending", "dishonest": [] }), None);
    out.case(&mut holding_but(&log, &[]), "the same: the homeless rotation, pending", rule,
        "A rotation at a pending position.", facts(), ask_status(&hl), json!("pending"), None);
    out.case(&mut holding_but(&log, &[o.id]), "the same, the old home's genesis not held: cannot tell", rule,
        "The objection's signer's chain cannot be resolved: unknown evidence that, taken as valid and as absent, changes whether the rotation counts.",
        facts(), chain_of(&j.id), json!({ "counting": [hx(&j.id)], "next": "cannot tell", "dishonest": [] }), None);
    let _ = ob;
}

/// Rule 45: a conflict proves the home dishonest once a rotation of the
/// home that counts keeps both receipts, or both sit under cosigned
/// summaries; until then the position is contested and the home not yet
/// proven.
fn never_rotating_home(out: &mut Out) {
    let rule = "Identity rule 45; \"Conflicting receipts\" 3";
    let mut w = World::new();
    let mut h1 = w.operator("a home that receipts twice and never rotates");
    let mut h2 = w.operator("home two");
    let mut h3 = w.operator("home three");
    let j = w.genesis("max", vec![home_of(&h1), home_of(&h2), home_of(&h3)], None, None);
    let (r1, j1) = w.rotate(&j, Rot::default());
    let (rival, _) = w.rotate(&j, Rot { signing_key: Some(schnorr("max's thief", 1)), ..Default::default() });
    w.receipt(&mut h1, &j.id, &r1, 1);
    w.receipt(&mut h1, &j.id, &rival, 1);
    w.receipt(&mut h2, &j.id, &r1, 1);
    w.receipt(&mut h3, &j.id, &r1, 1);
    let (r2, _) = w.rotate(&j1, Rot::default());
    w.receipt(&mut h1, &j.id, &r2, 2);
    w.receipt(&mut h2, &j.id, &r2, 2);
    let log = w.log.clone();
    out.case(&mut holding_but(&log, &[]), "a home receipting two genuine rotations at one position that never rotates: not proven dishonest, its later receipts count", rule,
        "Position 1 counts on homes two and three; the conflict stands, home one counting for nothing there. No rotation of home one keeps both receipts, and the identity requires no audit, so home one is not yet proven dishonest: its receipt at position 2, with home two's, meets the rule.",
        Facts::default(), chain_of(&j.id), json!({ "counting": [hx(&j.id), hx(&r1), hx(&r2)], "next": "end", "dishonest": [] }), None);
    let mut w2 = holding_but(&log, &[]);
    w2.rotate(&h1, Rot::default());
    out.case(&mut w2, "the same once a rotation of that home counts and keeps both receipts: proven dishonest at position 1, its later receipts counting for nothing", rule,
        "Home one's rotation keeps every receipt it signed, both of the pair among them: the conflict survives it. Home one counts for nothing for this identity after position 1, so position 2 has home two's receipt only, and waits.",
        Facts::default(), chain_of(&j.id), json!({ "counting": [hx(&j.id), hx(&r1)], "next": "pending", "dishonest": [{ "operator": hx(&h1.id), "from_position": 1 }] }), None);
}

/// "What an Identity act names in `objects`": an objection's, absence
/// statement's and escape endorsement's entry is exactly that one entry and
/// no other; more is outside the format.
fn exactly_that_entry(out: &mut Out) {
    let rule = "Identity, \"What an Identity act names in `objects`\": exactly that one entry and no other";
    let mut w = World::new();
    let mut old = w.operator("an old home");
    let new = w.operator("a new home");
    let mut e = w.genesis("nia", vec![home_of(&old)], None, None);
    let (hl, _) = w.rotate(&e, Rot { homes: Some(vec![home_of(&new)]), homeless: true, ..Default::default() });
    let other = spec("another act an objection names beside the rotation");
    let two = |id: &Hash| {
        Some(vec![
            mor_core::act::Object { chain: *id, predecessor: hl },
            mor_core::act::Object { chain: *id, predecessor: other },
        ])
    };
    let ob = w.act(&mut old, IdPayload::Objection(Objection { identity: e.id }), two(&e.id));
    let eid = e.id;
    let en = w.act(&mut e, IdPayload::Endorsement(Endorsement { abandoned: None }), two(&eid));
    let single = w.object(&mut old, &e.id, &hl);
    let log = w.log.clone();
    out.case(&mut holding_but(&log, &[]), "an objection naming the homeless rotation and another entry beside it: invalid", rule,
        "More than that entry is outside the format.", Facts::default(), ask_status(&ob), json!("invalid"), None);
    out.case(&mut holding_but(&log, &[]), "an escape endorsement naming the homeless rotation and another entry beside it: invalid", rule,
        "More than that entry is outside the format.", Facts::default(), ask_status(&en), json!("invalid"), None);
    out.case(&mut holding_but(&log, &[]), "an objection naming exactly that entry: valid", rule,
        "The one entry `[ identity, homeless rotation ]`.", Facts::default(), ask_status(&single), json!("valid"), None);
}
