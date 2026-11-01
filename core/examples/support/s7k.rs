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

// ------------------------------------------------- a one-time key's standing

/// A claim of a payer who committed only a one-time key, signed by
/// `signer` (any identity), carrying the key's signature over the claim and
/// its citations (key 8).
#[allow(clippy::too_many_arguments)]
fn key_claim(w: &mut World, signer: &mut Person, key: &mor_core::sig::SchnorrKey, rail: Hash, proof: &[u8], payee: Hash, amount: Amount, fulfils: Hash, acks: Option<Vec<Hash>>, refs: Option<Vec<mor_core::act::Ref>>) -> Hash {
    let bare = signing_key(key);
    let mut c = Claim { rail, proof: proof.to_vec(), payee, amount, fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None };
    let cited = money::Citations { objects: None, acks: acks.clone(), refs: refs.clone() };
    c.anonymous = Some(money::Anonymous { key: bare, sig: key.sign(&c.anonymous_message(&cited), &[0; 32]).sig });
    let a = w.everyday_act_refs(signer, mirs().money, 3, Fin::Claim(c).to_map(), None, acks, refs);
    w.add(&a)
}

fn request_rail(text: &str) -> (Vec<u8>, Hash) {
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let content = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, Value::Bytes(spec("a rail's creator").to_vec())), (5, Value::Bytes(spec("a payment cMIP, by its hash").to_vec())), (9, Value::Text(text.into())), (11, Value::Uint(0)), (13, Value::Array(vec![Value::Uint(0), Value::Uint(1)]))]);
    let h = Spec::hash_of(&content);
    (content, h)
}

/// A payer who committed only a one-time key has standing to contest a
/// purchase and to confirm a vow's sale, by a claim carrying that key's
/// signature (key 8), as for a refund; directly or as a route's first payer
/// (Agreements rule 13, rule 22, "A contest of a purchase"; Money rule 24).
pub fn money(out: &mut Out) {
    let unit = spec("a test unit (regtest satoshi)");
    let amt = |v: u64| Amount { unit, value: v };
    let (content, rail) = request_rail("A request rail, a one-time key's standing.");
    let key = schnorr("a buyer's one-time key, standing", 0);
    let bare = signing_key(&key);
    let rule = "Agreements, \"A contest of a purchase\" and rule 13: a one-time key's standing, by a claim carrying its signature (key 8)";

    // (a) A direct purchase, the payer a one-time key.
    let mut w = World::new();
    let mut shop = w.genesis("a shop paid by a one-time key", vec![own_home()], None, None);
    let mut anon = w.genesis("a one-time identity signing for a key", vec![own_home()], None, None);
    let mut other = w.genesis("someone else, no standing", vec![own_home()], None, None);
    let ptr = pointer_act(&mut w, &mut shop, b"the shop's address, one-time keys");
    let tag = lone_offer(&mut w, &mut shop, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a print".into())))], amt(300), "A print, paid with a one-time key.");
    let proof = b"a payment committing a one-time key".to_vec();
    let rec = { let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Key(bare.clone())), payee: shop.id, amount: amt(300), fulfils: tag, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut shop, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let kc = key_claim(&mut w, &mut anon, &key, rail, &proof, shop.id, amt(300), tag, None, None);
    let base = w.log.clone();
    let facts = |extra: &[(Hash, Hash)]| {
        let mut v = vec![(rec, ptr), (kc, ptr)];
        v.extend_from_slice(extra);
        Facts { rail_valid: v, rail_payments: vec![(proof.clone(), b"the one-time key's payment".to_vec())], rail_specifications: vec![content.clone()], ..Default::default() }
    };
    let mut w1 = World::new();
    for (a, _) in &base { w1.add(a); }
    let ct = ag_act(&mut w1, &mut anon, agreements::types::CONTEST, agreements::Contest::of_purchase(kc, Some("Not the print described.".into())).to_map(), obj(kc));
    out.case(&mut w1, "a purchase whose payer committed only a one-time key: the contest of the identity that signed the key's claim (key 8), naming it, is shown", rule,
        "The payment committed a one-time key as its payer; the claim carrying that key's signature is the buyer's claim, and its signer contests by naming it, as the key's holder claims a refund.",
        facts(&[]), json!({ "question": "purchase contests", "purchase": hx(&kc) }), json!([hx(&ct)]), None);
    let mut w2 = World::new();
    for (a, _) in &base { w2.add(a); }
    ag_act(&mut w2, &mut other, agreements::types::CONTEST, agreements::Contest::of_purchase(kc, None).to_map(), obj(kc));
    out.case(&mut w2, "the same purchase, a contest naming the key's claim signed by someone else: shows nothing", rule,
        "Only the signer of a claim carrying the key's signature stands for the key.",
        facts(&[]), json!({ "question": "purchase contests", "purchase": hx(&kc) }), json!([]), None);

    // (b) A vow's sale confirmed by a later claim carrying the key's signature.
    let mut w = World::new();
    let mut club = w.genesis("a club selling seats to one-time keys", vec![own_home()], None, None);
    let mut anon = w.genesis("a one-time identity for a seat", vec![own_home()], None, None);
    let mut anon2 = w.genesis("a second one-time identity for the same key", vec![own_home()], None, None);
    let cptr = pointer_act(&mut w, &mut club, b"the club's address, one-time keys");
    let name = { let v = mor_core::envelopes::vow::Vow { words: "A concert in the hall, 24 December".into(), cmip: None };
        let a = w.everyday_act(&mut club, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None); w.add(&a) };
    let vtag = lone_offer(&mut w, &mut club, vec![agreements::Sold::Vow(name)], amt(300), "One seat, a one-time key.");
    let vproof = b"a seat paid by a one-time key".to_vec();
    let vrec = { let r = Fin::Receipt(Receipt { rail, proof: vproof.clone(), payer: Some(Payer::Key(bare.clone())), payee: club.id, amount: amt(300), fulfils: vtag, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut club, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let k1 = key_claim(&mut w, &mut anon, &key, rail, &vproof, club.id, amt(300), vtag, None, None);
    let mut door = w.genesis("the hall's door, one-time keys", vec![own_home()], None, None);
    let scanned = { let a = w.everyday_act_refs(&mut door, spec("a ticketing Module"), 0, vec![(Value::Uint(0), Value::Text("seat 9, scanned".into()))], None, None, Some(vec![mor_core::act::Ref::Act(name)])); w.add(&a) };
    let k2 = key_claim(&mut w, &mut anon2, &key, rail, &vproof, club.id, amt(300), vtag, Some(vec![scanned]), None);
    out.case(&mut w, "a vow's seat paid by a one-time key, a later claim carrying the key's signature acknowledging the door's record: confirmed", "Agreements rule 13: a sale confirmed by the buyer's claim, a one-time key's by a claim carrying its signature (key 8)",
        "The buyer is the key; every claim of the payment carrying its signature is the buyer's. One of them, signed by another one-time identity, acknowledges an act about the vow: the sale is confirmed. (The vectors list the sale under its claim with the smallest act id, and that claim's signer as the buyer: a listing mechanic, open question 1.)",
        Facts { rail_valid: vec![(vrec, cptr), (k1, cptr), (k2, cptr)], rail_payments: vec![(vproof.clone(), b"the seat's payment".to_vec())], rail_specifications: vec![content.clone()], ..Default::default() },
        json!({ "question": "vow", "vow": hx(&name) }), json!({ "sales": [{ "act": hx(&k1.min(k2)), "buyer": hx(if k1 < k2 { &anon.id } else { &anon2.id }), "state": "confirmed" }], "unsigned": [], "unknown": [] }), None);

    // (c) A route's first payer who committed only a one-time key.
    let mut w = World::new();
    let mut seller = w.genesis("a seller paid through a swap by a one-time key", vec![own_home()], None, None);
    let mut anon = w.genesis("a one-time identity paying through a swap", vec![own_home()], None, None);
    let mut sw = w.genesis("a swap carrying a one-time key's money", vec![own_home()], None, None);
    let sw_ptr = pointer_act(&mut w, &mut sw, b"the swap's node, one-time keys");
    let stag = lone_offer(&mut w, &mut seller, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a song".into())))], amt(900), "A song, through a swap.");
    let swpub = spec("the swap's publication, one-time keys");
    let swtag = spec("the swap's own offer, one-time keys");
    let (q1, q3) = (b"a one-time key pays the swap".to_vec(), b"the swap pays the seller, a one-time key's route".to_vec());
    let a1 = { let r = Fin::Receipt(Receipt { rail, proof: q1.clone(), payer: Some(Payer::Key(bare.clone())), payee: sw.id, amount: amt(950), fulfils: swtag, previous: None, forward: Some(money::Forward { next_payee: seller.id, amount: amt(900), agreement: swpub }), batch: None, purchase: None });
        let a = w.everyday_act(&mut sw, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let a2 = { let r = Fin::Receipt(Receipt { rail, proof: q3.clone(), payer: Some(Payer::Identity(sw.id)), payee: seller.id, amount: amt(900), fulfils: stag, previous: Some(a1), forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut seller, mirs().money, 2, r.to_map(), Some(vec![Object { chain: a1, predecessor: a1 }]), None); w.add(&a) };
    let kr = key_claim(&mut w, &mut anon, &key, rail, &q1, sw.id, amt(950), swtag, None, Some(vec![mor_core::act::Ref::Act(stag)]));
    out.case(&mut w, "a route's first payer who committed only a one-time key, its claim of the first hop carrying the key's signature and citing the seller's tag: the first payer is the buyer", "Money rule 24: the first payer, a one-time key by a claim carrying its signature (key 8)",
        "The first hop's receipt names a one-time key as payer; the claim of that hop carrying the key's signature cites the tag the last hop names: its signer stands for the key as the buyer.",
        Facts { rail_valid: vec![(a1, sw_ptr), (a2, stag), (kr, sw_ptr)], rail_payments: vec![(q1.clone(), b"the key's first hop".to_vec()), (q3.clone(), b"the last hop".to_vec())], rail_specifications: vec![content.clone()], ..Default::default() },
        json!({ "question": "route buyer", "act": hx(&a2) }), json!({ "buyer": "the first payer", "payer": hx(&anon.id), "claim": hx(&kr) }), None);
}

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
    let rec = { let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(fresh.id)), payee: shop.id, amount: amt(300), fulfils: ptr, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut shop, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let fc = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: shop.id, amount: amt(300), fulfils: ptr, disagrees: None, referral: None, refund: Some(money::Rail { module: rail, address: b"the fresh identity's refund address".to_vec() }), anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(&mut fresh, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    let back = b"the shop pays the money back".to_vec();
    let refund_by = |w: &mut World, shop: &mut Person| {
        let c = Fin::Claim(Claim { rail, proof: back.clone(), payee: fresh.id, amount: amt(300), fulfils: rec, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
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
    let nc = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: shop.id, amount: amt(300), fulfils: ptr, disagrees: None, referral: None, refund: Some(money::Rail { module: rail, address: b"the routing node's address".to_vec() }), anonymous: None, purchase: None, previous: None });
        let a = w2.everyday_act(&mut node, mirs().money, 3, c.to_map(), None, None); w2.add(&a) };
    let mut s2 = shop.clone();
    let r2 = refund_by(&mut w2, &mut s2);
    out.case(&mut w2, "the same payment, a routing node holding its proof claiming it and naming its own refund rail, the money sent there: nothing repaid to the fresh identity", rule,
        "The payment committed the fresh identity as its payer; the node's claim is not the payer's, and its rail refuses it (the commitment recomputed from it names another payer). Money sent to the node's rail repays nothing owed to the fresh identity.",
        Facts { rail_valid: vec![(rec, ptr), (fc, ptr), (r2, nc)], rail_invalid: vec![nc], rail_payments: vec![(proof.clone(), b"the payment".to_vec()), (back.clone(), b"the refund".to_vec())], ..Default::default() }, ask_back, json!(0), None);
}
