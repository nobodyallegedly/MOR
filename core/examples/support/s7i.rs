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

// ---------------------------------------------------------------- routes

/// A route as the vectors write it (Money rules 24 to 28): its verdict, its
/// records first to last, and where it stops or breaks; a stop's open
/// obligation (rule 27); the agreement a failure names (rule 28).
pub fn route_json(r: &agreements::RouteVerdict) -> J {
    use agreements::RouteVerdict as V;
    let hs = |v: &[Hash]| v.iter().map(|x| hx(x)).collect::<Vec<_>>();
    match r {
        V::Valid { hops } => json!({ "route": "valid", "hops": hs(hops) }),
        V::Stopped { hops, at, owed, near } => json!({
            "route": "stopped", "hops": hs(hops), "at": hx(at),
            "owed": { "debtor": hx(&owed.debtor), "creditor": hx(&owed.creditor), "amount": [hx(&owed.amount.unit), owed.amount.value], "agreement": hx(&owed.agreement) },
            "near": near.iter().map(|(x, _)| hx(x)).collect::<Vec<_>>(),
        }),
        V::Broken { hops, at, agreement, .. } => json!({ "route": "broken", "hops": hs(hops), "at": hx(at), "agreement": agreement.map(|a| hx(&a)) }),
        V::Unknown { at, .. } => json!({ "route": "unknown", "at": hx(at) }),
    }
}

const SAT: &str = "a test unit (regtest satoshi)";
const CENT: &str = "a test unit (a test stablecoin's cent)";

fn ln() -> Hash {
    spec("a Lightning rail Module (test)")
}
fn onchain() -> Hash {
    spec("an on-chain rail Module (test)")
}
fn stable() -> Hash {
    spec("a stablecoin rail Module (test)")
}
fn sat(v: u64) -> Amount {
    Amount { unit: spec(SAT), value: v }
}
fn cent(v: u64) -> Amount {
    Amount { unit: spec(CENT), value: v }
}

/// A payee pointer naming one rail per (Module, address).
fn pointer_on(w: &mut World, p: &mut Person, rails: &[(Hash, &[u8])]) -> Hash {
    let x = Fin::PayeePointer(money::PayeePointer { payee: p.id, version: 1, previous: None, rails: rails.iter().map(|(m, a)| money::Rail { module: *m, address: a.to_vec() }).collect() });
    let a = w.everyday_act(p, mirs().money, 0, x.to_map(), None, None);
    w.add(&a)
}

/// A conversion service's lone publication selling a rail swap, and its
/// price tag (Agreements rule 11; Money rule 18): what a forward's agreement
/// names, and what the first hop's payment fulfils. (publication, tag)
fn conversion_offer(w: &mut World, svc: &mut Person, words: &str, most_in: Amount) -> (Hash, Hash) {
    let sold = vec![agreements::Sold::Access(spec("a conversion cMIP (test)"), cbor::encode(&Value::Text(words.into())))];
    let p = lone_publication(w, svc, &mirs(), sold, Some(words));
    let id = svc.id;
    let t = price_tag(w, svc, mirs().money, money::Priced::Publication(p), most_in.value, most_in.unit, id);
    (p, t)
}

/// A hop's receipt, signed by its receiver `by`; where it names a previous
/// hop's receipt, that receipt is also named in `objects`.
#[allow(clippy::too_many_arguments)]
fn hop_receipt(w: &mut World, by: &mut Person, rail: Hash, proof: &[u8], payer: Hash, amount: Amount, fulfils: Hash, previous: Option<Hash>, forward: Option<money::Forward>, batch: Option<Hash>) -> Hash {
    let r = Fin::Receipt(Receipt { rail, proof: proof.to_vec(), payer: Some(Payer::Identity(payer)), payee: by.id, amount, fulfils, previous, forward, batch, purchase: None });
    let a = w.everyday_act(by, mirs().money, 2, r.to_map(), previous.map(|p| vec![Object { chain: p, predecessor: p }]), None);
    w.add(&a)
}

/// The paying hop's claim of its payment, signed by `by`.
fn hop_claim(w: &mut World, by: &mut Person, rail: Hash, proof: &[u8], payee: Hash, amount: Amount, fulfils: Hash, previous: Option<Hash>) -> Hash {
    let c = Fin::Claim(Claim { rail, proof: proof.to_vec(), payee, amount, fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous });
    let a = w.everyday_act(by, mirs().money, 3, c.to_map(), previous.map(|p| vec![Object { chain: p, predecessor: p }]), None);
    w.add(&a)
}

fn fwd(next: Hash, amount: Amount, agreement: Hash) -> Option<money::Forward> {
    Some(money::Forward { next_payee: next, amount, agreement })
}

fn ask_route(q: &str, act: &Hash) -> J {
    json!({ "question": q, "act": hx(act) })
}

pub fn money(out: &mut Out) {
    pool_route(out);
    route_failures(out);
    route_rules_11_12(out);
    buyer_routes(out);
}

/// The first scenario: money paid in on Lightning and paid out on-chain
/// through a conversion service, as a Money route, the shape an anchoring
/// pool's money takes. The pool (an anchoring service's) pays a swap
/// service on Lightning; the swap pays on-chain, to the pool's own on-chain
/// rail, or to a supplier the pool owes.
fn pool_route(out: &mut Out) {
    let rule = "Money rules 24 and 25: a valid route; a conversion hop's forward";
    let mut w = World::new();
    let mut pool = w.genesis("an anchoring pool, paid in on Lightning", vec![own_home()], None, None);
    let mut swap = w.genesis("a swap service, Lightning in, on-chain out", vec![own_home()], None, None);
    let mut supplier = w.genesis("an on-chain supplier the pool owes", vec![own_home()], None, None);
    let pool_ptr = pointer_on(&mut w, &mut pool, &[(ln(), b"the pool's Lightning node"), (onchain(), b"the pool's on-chain wallet")]);
    let swap_ptr = pointer_on(&mut w, &mut swap, &[(ln(), b"the swap's Lightning node")]);
    let sup_ptr = pointer_on(&mut w, &mut supplier, &[(onchain(), b"the supplier's on-chain wallet")]);
    let (swap_pub, swap_tag) = conversion_offer(&mut w, &mut swap, "Lightning in, on-chain out, 100 sat fee.", sat(100_000));
    let base = w.log.clone();
    let (p1, p2) = (b"the pool pays the swap 5100 sat on Lightning".to_vec(), b"the swap pays 5000 sat on-chain to the pool's wallet".to_vec());
    let pays = vec![(p1.clone(), b"lightning payment 1".to_vec()), (p2.clone(), b"on-chain output 1".to_vec())];

    // 1. The pool's own money across the route.
    let mut w1 = fresh(&base);
    let pid = pool.id;
    let r1 = hop_receipt(&mut w1, &mut swap, ln(), &p1, pid, sat(5100), swap_tag, None, fwd(pid, sat(5000), swap_pub), None);
    let after_r1 = w1.log.clone();
    let r2 = hop_receipt(&mut w1, &mut pool, onchain(), &p2, swap.id, sat(5000), pool_ptr, Some(r1), None, None);
    let facts = |ids: &[(Hash, Hash)]| Facts { rail_valid: ids.to_vec(), rail_payments: pays.clone(), ..Default::default() };
    let log1 = w1.log.clone();
    out.case(&mut w1, "the pool's Lightning paid on-chain through a swap service: the route checked hop by hop, valid", rule,
        "The swap receipts the pool's 5100 sat on Lightning, declaring a forward of 5000 sat to the pool under its publication; the pool receipts 5000 sat on-chain from the swap, naming the swap's receipt (field 6). Every record valid, each hop names the previous hop's receipt, the second hop received exactly the first's forward, and the last declares none.",
        facts(&[(r1, swap_ptr), (r2, pool_ptr)]), ask_route("route to", &r2), json!({ "route": "valid", "hops": [hx(&r1), hx(&r2)] }), None);
    out.case(&mut fresh(&log1), "the same route followed forward from the swap's receipt: valid", "Money rules 24 and 27",
        "The swap's forward is carried on by the pool's receipt of the on-chain hop.",
        facts(&[(r1, swap_ptr), (r2, pool_ptr)]), ask_route("route from", &r1), json!({ "route": "valid", "hops": [hx(&r1), hx(&r2)] }), None);

    // 2. The swap takes the Lightning and never pays on-chain.
    let mut w2 = fresh(&after_r1);
    out.case(&mut w2, "the swap takes the pool's Lightning and never pays on-chain: the route stops at its receipt, the forward its open obligation", "Money rules 27 and 28",
        "The swap's receipt declares a forward of 5000 sat to the pool, and no valid receipt or claim of the next hop names it: the route stops at the swap's hop, and the forward stays the swap's open obligation to the pool, under its publication, which the receipt names.",
        facts(&[(r1, swap_ptr)]), ask_route("route from", &r1),
        json!({ "route": "stopped", "hops": [hx(&r1)], "at": hx(&r1), "owed": { "debtor": hx(&swap.id), "creditor": hx(&pid), "amount": [hx(&spec(SAT)), 5000], "agreement": hx(&swap_pub) }, "near": [] }), None);

    // 3. The pool's wallet signs no receipt: the swap's own claim carries
    // the forward on.
    let mut w3 = fresh(&after_r1);
    let c2 = hop_claim(&mut w3, &mut swap, onchain(), &p2, pid, sat(5000), pool_ptr, Some(r1));
    out.case(&mut w3, "the same, the next payee signing no receipt: the swap's claim naming its receipt (key 10) carries the forward on", "Money rule 24: the paying hop's own claim (key 10); rule 11, double entry along a route",
        "The pool's on-chain wallet signs nothing; the swap's claim of its on-chain payment, valid on its rail, names its own receipt of the first hop: the forward is passed on.",
        facts(&[(r1, swap_ptr), (c2, pool_ptr)]), ask_route("route from", &r1), json!({ "route": "valid", "hops": [hx(&r1), hx(&c2)] }), None);

    // 4. A debt the pool owes a supplier on-chain, paid across the route.
    let mut w4 = fresh(&base);
    let ob = Fin::Obligation(money::Obligation { debtor: pid, creditor: supplier.id, amount: sat(5000), pointer: sup_ptr, agreement: None });
    let oid = { let a = w4.everyday_act(&mut pool, mirs().money, 1, ob.to_map(), None, None); w4.add(&a) };
    w4.ack(&mut supplier, oid);
    let q1 = hop_receipt(&mut w4, &mut swap, ln(), &p1, pid, sat(5100), swap_tag, None, fwd(supplier.id, sat(5000), swap_pub), None);
    let debt_base = w4.log.clone();
    let p3 = b"the swap pays the supplier 5000 sat on-chain".to_vec();
    let pays3 = vec![(p1.clone(), b"lightning payment 1".to_vec()), (p3.clone(), b"on-chain output 2".to_vec())];
    let dfacts = |ids: &[(Hash, Hash)]| Facts { rail_valid: ids.to_vec(), rail_payments: pays3.clone(), ..Default::default() };
    let sid = supplier.id;
    let q2 = hop_receipt(&mut w4, &mut supplier, onchain(), &p3, swap.id, sat(5000), oid, Some(q1), None, None);
    let log4 = w4.log.clone();
    out.case(&mut w4, "a debt of 5000 sat on-chain the pool owes, paid on Lightning through the swap: discharged by the valid route", "Money rule 15: valid routes ending at the creditor's payee pointer, each naming the obligation; rule 24",
        "The supplier's receipt of the on-chain hop names the debt and the swap's receipt; the route ending at it is valid, and it ends at the supplier's pointer.",
        dfacts(&[(q1, swap_ptr), (q2, sup_ptr)]), ask("paid toward", &oid), json!(5000), None);
    let mut w4b = fresh(&debt_base);
    out.case(&mut w4b, "the same debt, the swap never paying on-chain: nothing toward it, and the forward the swap's open obligation to the supplier", "Money rules 15 and 27",
        "Only the first hop is held: no route reaches the supplier's pointer. The debt stays open; the swap owes the supplier the forward, under its publication.",
        dfacts(&[(q1, swap_ptr)]), ask_route("route from", &q1),
        json!({ "route": "stopped", "hops": [hx(&q1)], "at": hx(&q1), "owed": { "debtor": hx(&swap.id), "creditor": hx(&sid), "amount": [hx(&spec(SAT)), 5000], "agreement": hx(&swap_pub) }, "near": [] }), None);
    out.case(&mut fresh(&debt_base), "the same: nothing toward the debt", "Money rule 15",
        "Nothing of the next hop is held.", dfacts(&[(q1, swap_ptr)]), ask("paid toward", &oid), json!(0), None);
    // The last hop alone, its first hop's receipt not disclosed to the creditor.
    let mut w4c = World::new();
    for (a, _) in &log4 {
        if a.id() != q1 {
            w4c.add(a);
        }
    }
    out.case(&mut w4c, "the supplier's receipt naming the swap's receipt, which this verifier does not hold: the route is not shown, nothing toward the debt", "Money rule 26: each hop's receipt disclosed to the final creditor; rules 15 and 24",
        "The route ending at the supplier's receipt cannot be checked hop by hop without the receipt it names: it is broken at the supplier's receipt, and it discharges nothing.",
        dfacts(&[(q1, swap_ptr), (q2, sup_ptr)]), ask_route("route to", &q2), json!({ "route": "broken", "hops": [], "at": hx(&q2), "agreement": null }), None);
    let mut w4d = World::new();
    for (a, _) in &log4 {
        if a.id() != q1 {
            w4d.add(a);
        }
    }
    out.case(&mut w4d, "the same: nothing toward the debt", "Money rules 15 and 26",
        "A route a verifier cannot check is no valid route for it.", dfacts(&[(q1, swap_ptr), (q2, sup_ptr)]), ask("paid toward", &oid), json!(0), None);
}

/// The failures rules 24 to 28 name, on the pool's route.
fn route_failures(out: &mut Out) {
    let mut w = World::new();
    let mut pool = w.genesis("a pool paid in on Lightning, its route failing", vec![own_home()], None, None);
    let mut swap = w.genesis("a swap service whose hops fail", vec![own_home()], None, None);
    let mut other = w.genesis("someone else paying on-chain", vec![own_home()], None, None);
    let pool_ptr = pointer_on(&mut w, &mut pool, &[(ln(), b"the pool's node"), (onchain(), b"the pool's wallet")]);
    let swap_ptr = pointer_on(&mut w, &mut swap, &[(ln(), b"the swap's node")]);
    let (swap_pub, swap_tag) = conversion_offer(&mut w, &mut swap, "Lightning in, on-chain out.", sat(100_000));
    let pid = pool.id;
    let (p1, p2) = (b"the pool pays the failing swap on Lightning".to_vec(), b"an on-chain payment to the pool".to_vec());
    let pays = vec![(p1.clone(), b"lightning payment f".to_vec()), (p2.clone(), b"on-chain output f".to_vec())];
    let facts = |valid: &[(Hash, Hash)], invalid: &[Hash]| Facts { rail_valid: valid.to_vec(), rail_payments: pays.clone(), rail_invalid: invalid.to_vec(), ..Default::default() };
    let r1 = hop_receipt(&mut w, &mut swap, ln(), &p1, pid, sat(5100), swap_tag, None, fwd(pid, sat(5000), swap_pub), None);
    let base = w.log.clone();
    let sid = swap.id;

    // Short.
    let mut w1 = fresh(&base);
    let r2 = hop_receipt(&mut w1, &mut pool, onchain(), &p2, sid, sat(4900), pool_ptr, Some(r1), None, None);
    let l1 = w1.log.clone();
    out.case(&mut w1, "the next hop receives less than the forward: the route broken at that hop, under the forward's agreement", "Money rules 24 and 28",
        "The swap's receipt forwards 5000 sat; the pool's receipt of the on-chain hop shows 4900. Each hop's received amount must equal the previous hop's forward.",
        facts(&[(r1, swap_ptr), (r2, pool_ptr)], &[]), ask_route("route to", &r2), json!({ "route": "broken", "hops": [hx(&r1), hx(&r2)], "at": hx(&r2), "agreement": hx(&swap_pub) }), None);
    out.case(&mut fresh(&l1), "the same, followed forward: the route stops at the swap's hop, the short receipt shown beside it, the whole forward still owed", "Money rules 24, 27 and 28",
        "No valid record of the next hop carries the forward on as rule 24 reads them: the forward stays the swap's open obligation.",
        facts(&[(r1, swap_ptr), (r2, pool_ptr)], &[]), ask_route("route from", &r1),
        json!({ "route": "stopped", "hops": [hx(&r1)], "at": hx(&r1), "owed": { "debtor": hx(&sid), "creditor": hx(&pid), "amount": [hx(&spec(SAT)), 5000], "agreement": hx(&swap_pub) }, "near": [hx(&r2)] }), None);

    // The next hop's rail answer not held.
    let mut w2 = fresh(&base);
    let r2 = hop_receipt(&mut w2, &mut pool, onchain(), &p2, sid, sat(5000), pool_ptr, Some(r1), None, None);
    let l2 = w2.log.clone();
    out.case(&mut w2, "the next hop's receipt without its rail's answer: whether the route is valid unknown", "Money rules 8, 10 and 24",
        "Every record on a valid route is valid; the on-chain hop's verification answer is pending or not held.",
        facts(&[(r1, swap_ptr)], &[]), ask_route("route to", &r2), json!({ "route": "unknown", "at": hx(&r2) }), None);
    out.case(&mut fresh(&l2), "the same, followed forward: unknown, never stopped", "Money rules 24 and 27",
        "Whether the forward was carried on rests on the rail's answer for the receipt naming it.",
        facts(&[(r1, swap_ptr)], &[]), ask_route("route from", &r1), json!({ "route": "unknown", "at": hx(&r2) }), None);

    // The first hop's rail answer invalid.
    let mut w3 = fresh(&l2);
    out.case(&mut w3, "the first hop's payment answered invalid by its rail: the route broken at the first hop", "Money rules 8, 24 and 28",
        "The pool's Lightning payment to the swap is invalid on its rail: the route fails at the first hop, under what it fulfils, the swap's tag.",
        facts(&[(r2, pool_ptr)], &[r1]), ask_route("route to", &r2), json!({ "route": "broken", "hops": [hx(&r1), hx(&r2)], "at": hx(&r1), "agreement": hx(&swap_tag) }), None);

    // A previous receipt declaring no forward.
    let mut w4 = World::new();
    for (a, _) in &base {
        if a.id() != r1 {
            w4.add(a);
        }
    }
    let r1p = hop_receipt(&mut w4, &mut swap, ln(), &p1, pid, sat(5100), swap_tag, None, None, None);
    let r2p = hop_receipt(&mut w4, &mut pool, onchain(), &p2, sid, sat(5000), pool_ptr, Some(r1p), None, None);
    out.case(&mut w4, "a receipt naming a previous receipt that declares no forward: broken, only conversion hops forward", "Money rule 25: only conversion hops forward; rule 28",
        "The swap's receipt of the first hop declares no forward, so nothing passes on from it.",
        facts(&[(r1p, swap_ptr), (r2p, pool_ptr)], &[]), ask_route("route to", &r2p), json!({ "route": "broken", "hops": [hx(&r1p), hx(&r2p)], "at": hx(&r2p), "agreement": hx(&pool_ptr) }), None);

    // Paid on by someone else.
    let mut w5 = fresh(&base);
    let oid = other.id;
    let r2o = hop_receipt(&mut w5, &mut pool, onchain(), &p2, oid, sat(5000), pool_ptr, Some(r1), None, None);
    out.case(&mut w5, "the next hop's receipt naming another payer than the swap: broken, the forward not carried on by the hop that owes it", "Money, \"Conversion service\": it is the payer of the next hop; rules 24 and 28",
        "The pool's receipt names the swap's receipt and the right amount, but its payer is someone else: not the swap's onward payment.",
        facts(&[(r1, swap_ptr), (r2o, pool_ptr)], &[]), ask_route("route to", &r2o), json!({ "route": "broken", "hops": [hx(&r1), hx(&r2o)], "at": hx(&r2o), "agreement": hx(&swap_pub) }), None);

    // A claim naming the swap's receipt signed by someone else.
    let mut w6 = fresh(&base);
    let c2 = hop_claim(&mut w6, &mut other, onchain(), &p2, pid, sat(5000), pool_ptr, Some(r1));
    out.case(&mut w6, "a claim naming the swap's receipt, signed by another than the swap: it carries nothing on", "Money rule 24: the paying hop's own claim (key 10)",
        "Only the hop that pays on, the swap, carries its forward on by its claim.",
        facts(&[(r1, swap_ptr), (c2, pool_ptr)], &[]), ask_route("route from", &r1),
        json!({ "route": "stopped", "hops": [hx(&r1)], "at": hx(&r1), "owed": { "debtor": hx(&sid), "creditor": hx(&pid), "amount": [hx(&spec(SAT)), 5000], "agreement": hx(&swap_pub) }, "near": [hx(&c2)] }), None);
}

/// Rules 11 and 12 on a route: a receipt and a claim of one hop naming
/// different previous receipts; two records of one payment naming two
/// forwards, with and without a batch.
fn route_rules_11_12(out: &mut Out) {
    let mut w = World::new();
    let mut pool = w.genesis("a pool paying two forwards through one swap", vec![own_home()], None, None);
    let mut swap = w.genesis("a swap carrying two forwards", vec![own_home()], None, None);
    let pool_ptr = pointer_on(&mut w, &mut pool, &[(ln(), b"node"), (onchain(), b"wallet")]);
    let swap_ptr = pointer_on(&mut w, &mut swap, &[(ln(), b"the swap's node, two forwards")]);
    let (swap_pub, swap_tag) = conversion_offer(&mut w, &mut swap, "Two forwards, one swap.", sat(100_000));
    let (pid, sid) = (pool.id, swap.id);
    let (pa, pb, po) = (b"the pool's first Lightning payment".to_vec(), b"the pool's second Lightning payment".to_vec(), b"one on-chain payment by the swap".to_vec());
    let pays = vec![(pa.clone(), b"ln a".to_vec()), (pb.clone(), b"ln b".to_vec()), (po.clone(), b"the one on-chain output".to_vec())];
    let ra = hop_receipt(&mut w, &mut swap, ln(), &pa, pid, sat(5100), swap_tag, None, fwd(pid, sat(5000), swap_pub), None);
    let rb = hop_receipt(&mut w, &mut swap, ln(), &pb, pid, sat(5100), swap_tag, None, fwd(pid, sat(5000), swap_pub), None);
    let base = w.log.clone();
    let facts = |valid: &[(Hash, Hash)], specs: Vec<Vec<u8>>| Facts { rail_valid: valid.to_vec(), rail_payments: pays.clone(), rail_specifications: specs, ..Default::default() };
    let stop = |at: &Hash, near: Vec<Hash>| json!({ "route": "stopped", "hops": [hx(at)], "at": hx(at), "owed": { "debtor": hx(&sid), "creditor": hx(&pid), "amount": [hx(&spec(SAT)), 5000], "agreement": hx(&swap_pub) }, "near": sorted_hex(&near) });

    // Two claims of one payment naming two forwards, no batch: neither.
    let mut w1 = fresh(&base);
    let ca = hop_claim(&mut w1, &mut swap, onchain(), &po, pid, sat(5000), pool_ptr, Some(ra));
    let cb = hop_claim(&mut w1, &mut swap, onchain(), &po, pid, sat(5000), pool_ptr, Some(rb));
    let l1 = w1.log.clone();
    out.case(&mut w1, "two claims of one on-chain payment, each naming another forward, no batch: the first forward not carried on", "Money rules 12 and 24: one payment, one count",
        "The swap claims one payment of 5000 sat for both forwards; a claim carries no batch, so neither claim carries a forward on until the receiver resolves them.",
        facts(&[(ra, swap_ptr), (rb, swap_ptr), (ca, pool_ptr), (cb, pool_ptr)], vec![]), ask_route("route from", &ra), stop(&ra, vec![ca]), None);
    out.case(&mut fresh(&l1), "the same: the second forward not carried on either", "Money rules 12 and 24",
        "One payment counts once.", facts(&[(ra, swap_ptr), (rb, swap_ptr), (ca, pool_ptr), (cb, pool_ptr)], vec![]), ask_route("route from", &rb), stop(&rb, vec![cb]), None);

    // Two receipts of one payment under one batch: both forwards, in parts.
    let po2 = b"one on-chain payment by the swap".to_vec();
    let batch = spec("the pool's batch of two forwards");
    for (b, name, va) in [
        (Some(batch), "two receipts of one on-chain payment of 10000 sat under one named batch, each naming one forward: both carried on, in parts", true),
        (None, "the same two receipts naming no batch: neither carries its forward on", false),
    ] {
        let mut w2 = fresh(&base);
        let xa = hop_receipt(&mut w2, &mut pool, onchain(), &po2, sid, sat(5000), pool_ptr, Some(ra), None, b);
        let xb = hop_receipt(&mut w2, &mut pool, onchain(), &po2, sid, sat(5000), pool_ptr, Some(rb), None, b);
        let v = if va { json!({ "route": "valid", "hops": [hx(&ra), hx(&xa)] }) } else { stop(&ra, vec![xa]) };
        out.case(&mut w2, name, "Money rule 12: receipts of one payment naming different forwards share it only under the same batch; rule 24",
            "The pool's wallet receipts one on-chain payment twice, 5000 sat for each of the swap's forwards.",
            facts(&[(ra, swap_ptr), (rb, swap_ptr), (xa, pool_ptr), (xb, pool_ptr)], vec![]), ask_route("route from", &ra), v, None);
    }

    // Rule 11: a receipt and a claim of one hop naming different previous
    // receipts. On a rail binding no previous hop, the payer's claim
    // decides; on one binding it, the commitment decides, and two records
    // the rail answered valid contradict each other.
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let rail_spec = |binds: Vec<u64>, text: &str| {
        enc(vec![(0, Value::Uint(kinds::MODULE)), (1, Value::Bytes(spec("a rail's creator").to_vec())), (5, Value::Bytes(spec("a payment cMIP, by its hash").to_vec())), (9, Value::Text(text.into())), (11, Value::Uint(1)), (13, Value::Array(binds.into_iter().map(Value::Uint).collect()))])
    };
    let unbound = rail_spec(vec![0, 1], "An on-chain push rail whose proof binds payee and purpose, not the previous hop.");
    let bound = rail_spec(vec![0, 1, 2], "An on-chain push rail whose proof binds payee, purpose and the previous hop.");
    for (content, name_c, vc, name_r) in [
        (&unbound, "a receipt and a claim of one on-chain hop naming different previous receipts, on a rail binding no previous hop: the swap's claim decides", true,
         "the same: the receipt naming the other forward carries nothing on, shown as a dispute on the receiver"),
        (&bound, "the same records on a rail binding the previous hop, both answered valid: they contradict each other, and the claim carries nothing on", false,
         "the same: nor does the receipt"),
    ] {
        let rail = Spec::hash_of(content);
        let mut w3 = World::new();
        let mut pool3 = w3.genesis("a pool whose hop is disputed", vec![own_home()], None, None);
        let mut swap3 = w3.genesis("a swap whose hop is disputed", vec![own_home()], None, None);
        let pp = pointer_on(&mut w3, &mut pool3, &[(ln(), b"node 3"), (rail, b"wallet 3")]);
        let sp = pointer_on(&mut w3, &mut swap3, &[(ln(), b"the swap's node 3")]);
        let (spub, stag) = conversion_offer(&mut w3, &mut swap3, "A disputed hop.", sat(100_000));
        let (p3, s3) = (pool3.id, swap3.id);
        let qa = hop_receipt(&mut w3, &mut swap3, ln(), &pa, p3, sat(5100), stag, None, fwd(p3, sat(5000), spub), None);
        let qb = hop_receipt(&mut w3, &mut swap3, ln(), &pb, p3, sat(5100), stag, None, fwd(p3, sat(5000), spub), None);
        let c = hop_claim(&mut w3, &mut swap3, rail, &po, p3, sat(5000), pp, Some(qa));
        let r = hop_receipt(&mut w3, &mut pool3, rail, &po, s3, sat(5000), pp, Some(qb), None, None);
        let log = w3.log.clone();
        let f = || Facts { rail_valid: vec![(qa, sp), (qb, sp), (c, pp), (r, pp)], rail_payments: pays.clone(), rail_specifications: vec![content.clone()], ..Default::default() };
        let stop3 = |at: &Hash, near: Vec<Hash>| json!({ "route": "stopped", "hops": [hx(at)], "at": hx(at), "owed": { "debtor": hx(&s3), "creditor": hx(&p3), "amount": [hx(&spec(SAT)), 5000], "agreement": hx(&spub) }, "near": sorted_hex(&near) });
        let vcj = if vc { json!({ "route": "valid", "hops": [hx(&qa), hx(&c)] }) } else { stop3(&qa, vec![c]) };
        out.case(&mut w3, name_c, "Money rules 11 and 24: where a receipt and a claim of one hop name different previous receipts, rule 11 decides",
            "The swap claims its on-chain payment as carrying its first forward on (key 10); the pool's receipt of the same payment names the second (field 6).",
            f(), ask_route("route from", &qa), vcj, None);
        out.case(&mut fresh(&log), name_r, "Money rules 11 and 24", "The receiver's receipt names the other forward.", f(), ask_route("route from", &qb), stop3(&qb, vec![r]), None);
    }
}

/// A buyer paying across rails: through one conversion service, then
/// through two, to a lone seller's price tag (Money rule 18), and the
/// failures each rule names.
fn buyer_routes(out: &mut Out) {
    let mut w = World::new();
    let mut seller = w.genesis("a seller paid on-chain", vec![own_home()], None, None);
    let buyer = w.genesis("a buyer paying on Lightning", vec![own_home()], None, None);
    let mut c1 = w.genesis("a first conversion service, Lightning to a stablecoin", vec![own_home()], None, None);
    let mut c2 = w.genesis("a second conversion service, the stablecoin to on-chain", vec![own_home()], None, None);
    let mut sw = w.genesis("a swap, Lightning to on-chain", vec![own_home()], None, None);
    let _sel_ptr = pointer_on(&mut w, &mut seller, &[(onchain(), b"the seller's wallet")]);
    let c1_ptr = pointer_on(&mut w, &mut c1, &[(ln(), b"the first service's node")]);
    let c2_ptr = pointer_on(&mut w, &mut c2, &[(stable(), b"the second service's stablecoin address")]);
    let sw_ptr = pointer_on(&mut w, &mut sw, &[(ln(), b"the swap's node, for the buyer")]);
    let tag = lone_offer(&mut w, &mut seller, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a recorded concert".into())))], sat(900), "A recorded concert.");
    let (pub1, tag1) = conversion_offer(&mut w, &mut c1, "Lightning to a stablecoin.", sat(100_000));
    let (pub2, tag2) = conversion_offer(&mut w, &mut c2, "A stablecoin to on-chain.", cent(100_000));
    let (pubs, tags) = conversion_offer(&mut w, &mut sw, "Lightning to on-chain, for buyers.", sat(100_000));
    let base = w.log.clone();
    let (sid, bid) = (seller.id, buyer.id);
    let (q1, q2, q3) = (b"the buyer pays on Lightning".to_vec(), b"the first service pays the stablecoin".to_vec(), b"an on-chain payment to the seller".to_vec());
    let pays = vec![(q1.clone(), b"buyer ln".to_vec()), (q2.clone(), b"stable transfer".to_vec()), (q3.clone(), b"seller output".to_vec())];

    // Through one swap.
    let mut w1 = fresh(&base);
    let a1 = hop_receipt(&mut w1, &mut sw, ln(), &q1, bid, sat(950), tags, None, fwd(sid, sat(900), pubs), None);
    let a2 = hop_receipt(&mut w1, &mut seller, onchain(), &q3, sw.id, sat(900), tag, Some(a1), None, None);
    let f1 = Facts { rail_valid: vec![(a1, sw_ptr), (a2, tag)], rail_payments: pays.clone(), ..Default::default() };
    let l1 = w1.log.clone();
    out.case(&mut w1, "a buyer pays a seller's tag across rails through one swap: the route valid", "Money rules 24 and 25; rule 18",
        "The swap receipts the buyer's 950 sat on Lightning, forwarding 900 sat to the seller; the seller receipts 900 sat on-chain, naming the swap's receipt and the tag.",
        f1, ask_route("route to", &a2), json!({ "route": "valid", "hops": [hx(&a1), hx(&a2)] }), None);
    out.case(&mut fresh(&l1), "the same: the last hop a purchase under the seller's publication", "Money rule 18; Agreements rule 12",
        "The seller's receipt names its tag and pays its price: a purchase, judged as any payment of a tag.",
        Facts { rail_valid: vec![(a1, sw_ptr), (a2, tag)], rail_payments: pays.clone(), ..Default::default() }, json!({ "question": "purchase", "act": hx(&a2) }), json!("purchase"), None);

    // Through two services, across three rails and two units.
    let mut w2 = fresh(&base);
    let (c1id, c2id) = (c1.id, c2.id);
    let b1 = hop_receipt(&mut w2, &mut c1, ln(), &q1, bid, sat(1000), tag1, None, fwd(c2id, cent(95), pub1), None);
    let after_b1 = w2.log.clone();
    let b2 = hop_receipt(&mut w2, &mut c2, stable(), &q2, c1id, cent(95), tag2, Some(b1), fwd(sid, sat(900), pub2), None);
    let after_b2 = w2.log.clone();
    let b3 = hop_receipt(&mut w2, &mut seller, onchain(), &q3, c2id, sat(900), tag, Some(b2), None, None);
    let f2 = |ids: &[(Hash, Hash)]| Facts { rail_valid: ids.to_vec(), rail_payments: pays.clone(), ..Default::default() };
    let all = [(b1, c1_ptr), (b2, c2_ptr), (b3, tag)];
    let l2 = w2.log.clone();
    out.case(&mut w2, "a buyer pays through two conversion services, Lightning to a stablecoin to on-chain: the route valid, three hops", "Money rules 24 and 25",
        "The first service forwards 95 cents to the second, which forwards 900 sat to the seller: each hop names the previous hop's receipt and received exactly its forward, in the next unit.",
        f2(&all), ask_route("route to", &b3), json!({ "route": "valid", "hops": [hx(&b1), hx(&b2), hx(&b3)] }), None);
    out.case(&mut fresh(&l2), "the same, followed forward from the buyer's hop: valid", "Money rules 24 and 27", "Every forward is carried on.",
        f2(&all), ask_route("route from", &b1), json!({ "route": "valid", "hops": [hx(&b1), hx(&b2), hx(&b3)] }), None);
    // The second service never pays the seller.
    let mut w3 = fresh(&after_b2);
    out.case(&mut w3, "the second service takes the stablecoin and never pays on-chain: the route stops at its hop, the forward its open obligation to the seller", "Money rules 27 and 28: the exact hop and agreement that failed",
        "The first forward is carried on; the second service's receipt declares a forward of 900 sat to the seller that no record of the next hop names.",
        f2(&all[..2]), ask_route("route from", &b1),
        json!({ "route": "stopped", "hops": [hx(&b1), hx(&b2)], "at": hx(&b2), "owed": { "debtor": hx(&c2id), "creditor": hx(&sid), "amount": [hx(&spec(SAT)), 900], "agreement": hx(&pub2) }, "near": [] }), None);
    // The first service forwards short.
    let mut w4 = fresh(&after_b1);
    let b2s = hop_receipt(&mut w4, &mut c2, stable(), &q2, c1id, cent(94), tag2, Some(b1), fwd(sid, sat(900), pub2), None);
    out.case(&mut w4, "the first service forwards 94 cents where it declared 95: the route stops at the first hop, the short receipt beside it", "Money rules 24, 27 and 28",
        "The second service's receipt names the first hop's but shows 94 cents: the first forward is not carried on as rule 24 reads it.",
        f2(&[(b1, c1_ptr), (b2s, c2_ptr)]), ask_route("route from", &b1),
        json!({ "route": "stopped", "hops": [hx(&b1)], "at": hx(&b1), "owed": { "debtor": hx(&c1id), "creditor": hx(&c2id), "amount": [hx(&spec(CENT)), 95], "agreement": hx(&pub1) }, "near": [hx(&b2s)] }), None);
    // A hop paid to another than the forward's next payee.
    let mut w5 = fresh(&after_b1);
    let b2x = hop_receipt(&mut w5, &mut sw, stable(), &q2, c1id, cent(95), tags, Some(b1), None, None);
    out.case(&mut w5, "a receipt naming the first hop's, signed by another than the forward's next payee: broken there", "Money rules 24 and 28",
        "The first service's forward names the second service as next payee; the swap's receipt of the onward payment names the first hop's receipt.",
        f2(&[(b1, c1_ptr), (b2x, sw_ptr)]), ask_route("route to", &b2x), json!({ "route": "broken", "hops": [hx(&b1), hx(&b2x)], "at": hx(&b2x), "agreement": hx(&pub1) }), None);
}

/// A self-hosted identity's homeless rotation (Identity rule 4; the
/// homeless procedure, steps 4 and 5; section 11): it re-homes by a
/// rotation counting on its own signatures; a homeless rotation there
/// counts only with an escape endorsement.
pub fn identity(out: &mut Out) {
    let mut w = World::new();
    let mut new = w.operator("a new home for a self-hosted identity");
    let mut p = w.genesis("a self-hosted identity", vec![own_home()], None, None);
    let (hr, mut p1) = w.rotate(&p, Rot { homeless: true, homes: Some(vec![home_of(&new)]), ..Default::default() });
    w.receipt(&mut new, &p.id, &hr, 1);
    let after = w.post(&mut p1, "posted after the homeless rotation");
    let base = w.log.clone();
    let rule = "Identity rule 4; the homeless procedure, step 4 (a self-hosted home is never gone); section 11";
    out.case(&mut w, "a self-hosted identity's homeless rotation, receipted by its new home, no escape endorsement: pending", rule,
        "Its old home is the identity itself, never gone: step 4 is never met, so the rotation does not count without an escape endorsement, and waits for one.",
        Facts::default(), ask_status(&hr), json!("pending"), None);
    out.case(&mut fresh(&base), "the same: an act bound to it, pending", rule,
        "Everyday check 2: bound to a rotation that does not count yet.", Facts::default(), ask_status(&after), json!("pending"), None);
    let mut w2 = fresh(&base);
    w2.endorse(&mut p, &hr, None);
    out.case(&mut w2, "the same rotation with the owner's escape endorsement: it counts, once the new home's receipt meets its rule", "Identity rule 4; section 11, \"The escape endorsement\"; step 5",
        "The owner's escape endorsement, signed with the key bound before it, skips steps 3 and 4; the new home's receipt meets the home rule the rotation declares.",
        Facts::default(), ask_status(&hr), json!("valid"), None);
}
