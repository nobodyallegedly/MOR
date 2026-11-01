//! S7j: the buyer of a purchase paid through a route, and a refund owed
//! back along it (Money rules 24 and 28; Agreements, "A contest of a
//! purchase"), written with the core's own acts.

use super::s7i::{ask_route, conversion_offer, fresh, fwd, hop_claim, hop_receipt, ln, onchain, pointer_on, route_json, sat, stable, cent, SAT, CENT};
use super::*;

/// The buyer of a purchase paid through a route, as the vectors write it.
pub fn route_buyer_json(b: &agreements::RouteBuyer) -> J {
    use agreements::RouteBuyer as B;
    match b {
        B::NoRoute => json!("no route"),
        B::FirstPayer { payer, claim } => json!({ "buyer": "the first payer", "payer": hx(payer), "claim": hx(claim) }),
        B::OwnAccount { service, astray } => json!({ "buyer": "the service, for its own account", "service": service.map(|s| hx(&s[..])), "astray": astray.iter().map(|x| hx(x)).collect::<Vec<_>>() }),
        B::Failed(v) => json!({ "buyer": "none: no purchase at the seller", "route": route_json(v) }),
        B::Unknown => json!("unknown"),
    }
}

/// A refund owed back along a route, last hop first.
pub fn refund_along_json(r: Result<Vec<agreements::RefundHop>, agreements::AgreementsError>) -> J {
    match r {
        Ok(v) => J::Array(
            v.iter()
                .map(|x| {
                    json!({ "record": hx(&x.record), "debtor": hx(&x.debtor), "creditor": x.creditor.map(|c| hx(&c[..])), "amount": [hx(&x.amount.unit), x.amount.value], "agreement": hx(&x.agreement), "repaid": x.repaid })
                })
                .collect(),
        ),
        Err(_) => json!("unknown"),
    }
}

/// The first payer's claim of a route's first hop (Money rule 24): key 4
/// as the commitment names it (the service's tag), citing in `refs` the
/// tag the route pays for.
fn first_claim(w: &mut World, by: &mut Person, rail: Hash, proof: &[u8], payee: Hash, commitment: Hash, cites: Option<Hash>) -> Hash {
    let c = Fin::Claim(Claim { rail, proof: proof.to_vec(), payee, amount: sat(950), fulfils: commitment, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
    let a = w.everyday_act_refs(by, mirs().money, 3, c.to_map(), None, None, cites.map(|t| vec![mor_core::act::Ref::Act(t)]));
    w.add(&a)
}

pub fn money(out: &mut Out) {
    route_buyer(out);
    vow_through_route(out);
    route_refund(out);
}

/// Fable's three cases first: the first payer's claim of the first hop
/// naming the tag the purchase names; naming another; none. Then the
/// carrier's contest, a claim not yet answered, and a route that stops.
fn route_buyer(out: &mut Out) {
    // A Lightning rail Module whose specification the verifier holds: a
    // request rail (field 11 is 0), its proof binding payee and purpose
    // (field 13), so rule 11 and the commitment are the rail's own.
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let lnr_content = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, Value::Bytes(spec("a rail's creator").to_vec())), (5, Value::Bytes(spec("a payment cMIP, by its hash").to_vec())), (9, Value::Text("A Lightning request rail, routes, binding payee and purpose.".into())), (11, Value::Uint(0)), (13, Value::Array(vec![Value::Uint(0), Value::Uint(1)]))]);
    let lnr = Spec::hash_of(&lnr_content);
    let mut w = World::new();
    let mut seller = w.genesis("a seller paid on-chain, bought from through a swap", vec![own_home()], None, None);
    let mut other_seller = w.genesis("another seller", vec![own_home()], None, None);
    let mut buyer = w.genesis("a buyer paying on Lightning through a swap", vec![own_home()], None, None);
    let mut sw = w.genesis("a swap carrying a buyer's money", vec![own_home()], None, None);
    let _ = pointer_on(&mut w, &mut seller, &[(onchain(), b"the seller's wallet, routes")]);
    let sw_ptr = pointer_on(&mut w, &mut sw, &[(lnr, b"the swap's node, routes")]);
    let tag = lone_offer(&mut w, &mut seller, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a film".into())))], sat(900), "A film.");
    let other_tag = lone_offer(&mut w, &mut other_seller, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a book".into())))], sat(900), "A book.");
    let (pubs, tags) = conversion_offer(&mut w, &mut sw, "Lightning to on-chain, for buyers, routes.", sat(100_000));
    let (sid, bid, swid) = (seller.id, buyer.id, sw.id);
    let (q1, q3) = (b"the buyer pays the swap on Lightning, for the film".to_vec(), b"the swap pays the seller on-chain, for the film".to_vec());
    let pays = vec![(q1.clone(), b"buyer ln, film".to_vec()), (q3.clone(), b"seller output, film".to_vec())];
    let a1 = hop_receipt(&mut w, &mut sw, lnr, &q1, bid, sat(950), tags, None, fwd(sid, sat(900), pubs), None);
    let first_hop = w.log.clone();
    let a2 = hop_receipt(&mut w, &mut seller, onchain(), &q3, swid, sat(900), tag, Some(a1), None, None);
    let base = w.log.clone();
    let rule = "Money rule 24, its last sentence; Agreements, \"A contest of a purchase\"";
    let facts = |extra: &[(Hash, Hash)]| {
        let mut v = vec![(a1, sw_ptr), (a2, tag)];
        v.extend_from_slice(extra);
        Facts { rail_valid: v, rail_payments: pays.clone(), rail_specifications: vec![lnr_content.clone()], ..Default::default() }
    };
    let ask_buyer = ask_route("route buyer", &a2);
    let contests = |x: &Hash| json!({ "question": "purchase contests", "purchase": hx(x) });

    // 1. The first payer's claim of the first hop names the tag the purchase names.
    let mut w1 = fresh(&base);
    let k1 = first_claim(&mut w1, &mut buyer, lnr, &q1, swid, tags, Some(tag));
    let l1 = w1.log.clone();
    out.case(&mut w1, "a purchase paid through a swap, the first payer's claim of the first hop citing the seller's tag: the first payer is the buyer", rule,
        "The route ending at the seller's receipt is valid; its first hop's payer is the buyer (the swap's receipt, field 2), whose own claim of that hop, on a request rail whose specification the verifier holds, keeps key 4 as the commitment's (the swap's tag) and cites in `refs` the tag the seller's receipt names in field 5. Valid on its rail, its citation matched: that claim is the buyer's claim of the purchase.",
        facts(&[(k1, sw_ptr)]), ask_buyer.clone(), json!({ "buyer": "the first payer", "payer": hx(&bid), "claim": hx(&k1) }), None);
    let mut w1b = fresh(&l1);
    let words = agreements::Contest::of_purchase(k1, Some("Not the film the page described.".into()));
    let ct = ag_act(&mut w1b, &mut buyer, agreements::types::CONTEST, words.to_map(), obj(k1));
    out.case(&mut w1b, "the same: the first payer's contest naming their claim of the first hop, shown beside the purchase", "Agreements, \"A contest of a purchase\"; rule 54",
        "The buyer of a purchase paid through a route has standing to contest it; field 0 names their claim of the first hop.",
        facts(&[(k1, sw_ptr)]), contests(&k1), json!([hx(&ct)]), None);
    // The swap's own claim of the last hop: a carrier's, no buyer's.
    let mut w1c = fresh(&l1);
    let s2 = hop_claim(&mut w1c, &mut sw, onchain(), &q3, sid, sat(900), tag, Some(a1));
    let kc = ag_act(&mut w1c, &mut sw, agreements::types::CONTEST, agreements::Contest::of_purchase(s2, Some("The swap contests.".into())).to_map(), obj(s2));
    out.case(&mut w1c, "the same, the swap's contest naming its own claim of the last hop: shows nothing, the swap a carrier", "Agreements, \"A contest of a purchase\": a conversion service carries",
        "The first payer named the tag, so the swap is not the buyer of this purchase: its claim of the last hop is a carrier's, and its contest shows nothing.",
        facts(&[(k1, sw_ptr), (s2, tag)]), contests(&s2), json!([]), None);
    let _ = kc;

    // 1b. The claim naming the seller's tag in key 4, against the
    // commitment: the request rail refuses it (Money rule 18).
    let mut w1d = fresh(&base);
    let kx = hop_claim(&mut w1d, &mut buyer.clone(), lnr, &q1, swid, sat(950), tag, None);
    out.case(&mut w1d, "the first payer's claim naming the seller's tag in key 4, where the request rail's commitment names the swap's: refused by the rail, no buyer's claim", "Money rule 18: the payment decides; rule 24",
        "On a request rail binding purpose, a claim whose key 4 is not what the commitment names is refused by the rail Module's rule: answered invalid, it counts for nothing, and the swap bought for its own account. The first payer's claim keeps key 4 as the commitment's and cites the tag in `refs`.",
        Facts { rail_valid: vec![(a1, sw_ptr), (a2, tag)], rail_invalid: vec![kx], rail_payments: pays.clone(), rail_specifications: vec![lnr_content.clone()], ..Default::default() }, ask_buyer.clone(), json!({ "buyer": "the service, for its own account", "service": hx(&swid), "astray": [] }), None);

    // 2. The first payer's claim names another tag: the swap bought for its own account.
    let mut w2 = fresh(&base);
    let k2 = first_claim(&mut w2, &mut buyer, lnr, &q1, swid, tags, Some(other_tag));
    let l2 = w2.log.clone();
    out.case(&mut w2, "the same route, the first payer's claim citing another seller's tag: the swap bought for its own account, the first payer's money astray", rule,
        "The buyer's claim cites another seller's book; the route ends at this seller's film. Where the two do not match, the service bought for its own account, and the first payer's claim is shown as their money gone where they did not name (rule 28).",
        facts(&[(k2, sw_ptr)]), ask_buyer.clone(), json!({ "buyer": "the service, for its own account", "service": hx(&swid), "astray": [hx(&k2)] }), None);
    let mut w2b = fresh(&l2);
    let c2 = ag_act(&mut w2b, &mut buyer, agreements::types::CONTEST, agreements::Contest::of_purchase(k2, Some("Not the film.".into())).to_map(), obj(k2));
    out.case(&mut w2b, "the same: the first payer's contest naming that claim shows nothing", "Agreements, \"A contest of a purchase\"",
        "The first payer is the buyer only where their claim cites the tag the purchase names.",
        facts(&[(k2, sw_ptr)]), contests(&k2), json!([]), None);
    let _ = c2;

    // 3. No claim of the first payer's: the swap bought for its own account; the first payer has no standing.
    out.case(&mut fresh(&base), "the same route, the first payer signing no claim: the swap bought for its own account, the first payer without standing", rule,
        "Only the first payer's own claim says what their money was for. With none, the purchase is the service's own; a first payer who paid a converter with no MOR claim has no standing, as a bare-key payer has none (stated cost).",
        facts(&[]), ask_buyer.clone(), json!({ "buyer": "the service, for its own account", "service": hx(&swid), "astray": [] }), None);

    // 4. The first payer's claim without its rail's answer: unknown yet.
    let mut w4 = fresh(&base);
    let k4 = first_claim(&mut w4, &mut buyer, lnr, &q1, swid, tags, Some(tag));
    let l4 = w4.log.clone();
    out.case(&mut w4, "the first payer's claim citing the tag, its rail's answer not held: the buyer unknown yet", rule,
        "Whether the first payer's claim is valid on its rail is not known yet: the buyer is unknown until it is.",
        facts(&[]), ask_buyer.clone(), json!("unknown"), None);
    let mut w4b = fresh(&l4);
    ag_act(&mut w4b, &mut buyer, agreements::types::CONTEST, agreements::Contest::of_purchase(k4, None).to_map(), obj(k4));
    out.case(&mut w4b, "the same: the first payer's contest shows nothing yet", "Agreements, \"A contest of a purchase\": a contest shows nothing yet while the route is unknown",
        "Unknown, not nothing ever: once the rail answers, the contest shows.", facts(&[]), contests(&k4), json!("unknown"), None);

    // 5. The route unknown: its last hop's rail answer not held.
    let mut w5 = fresh(&base);
    let k5 = first_claim(&mut w5, &mut buyer, lnr, &q1, swid, tags, Some(tag));
    out.case(&mut w5, "the first payer's claim citing the tag, the last hop's rail answer not held: the buyer unknown yet", rule,
        "While the route ending at the purchase is unknown, the buyer is unknown.",
        Facts { rail_valid: vec![(a1, sw_ptr), (k5, sw_ptr)], rail_payments: pays.clone(), rail_specifications: vec![lnr_content.clone()], ..Default::default() }, ask_buyer.clone(), json!("unknown"), None);

    // 6. The swap never pays the seller: no purchase at the seller.
    let mut w6 = fresh(&first_hop);
    let k6 = first_claim(&mut w6, &mut buyer, lnr, &q1, swid, tags, Some(tag));
    ag_act(&mut w6, &mut buyer, agreements::types::CONTEST, agreements::Contest::of_purchase(k6, None).to_map(), obj(k6));
    out.case(&mut w6, "the swap never pays the seller: no purchase at the seller, the first payer's contest shows nothing", "Agreements, \"A contest of a purchase\"; Money rule 27",
        "The route stops at the swap's hop: there is no purchase at the seller to contest; the swap owes its forward (rule 27).",
        Facts { rail_valid: vec![(a1, sw_ptr), (k6, sw_ptr)], rail_payments: pays.clone(), rail_specifications: vec![lnr_content.clone()], ..Default::default() }, contests(&k6), json!([]), None);

    // 7. A purchase naming no previous hop: no route, the ordinary rule.
    out.case(&mut fresh(&first_hop), "a receipt naming no previous hop: no route, its buyer read by the ordinary rule", rule,
        "The swap's own receipt of the first hop names no previous hop.", facts(&[]), ask_route("route buyer", &a1), json!("no route"), None);
}

/// A refund owed back along a route (Money rule 28): through one and two
/// converters, and a hop failing to pass it back.
fn route_refund(out: &mut Out) {
    let mut w = World::new();
    let mut seller = w.genesis("a seller whose tag is withdrawn before a routed payment", vec![own_home()], None, None);
    let mut buyer = w.genesis("a buyer owed a refund along a route", vec![own_home()], None, None);
    let mut sw = w.genesis("a swap owing a refund on", vec![own_home()], None, None);
    let mut c1 = w.genesis("a first converter owing a refund on", vec![own_home()], None, None);
    let mut c2 = w.genesis("a second converter owing a refund on", vec![own_home()], None, None);
    let sw_ptr = pointer_on(&mut w, &mut sw, &[(ln(), b"the swap's node, refunds")]);
    let c1_ptr = pointer_on(&mut w, &mut c1, &[(ln(), b"the first converter's node, refunds")]);
    let c2_ptr = pointer_on(&mut w, &mut c2, &[(stable(), b"the second converter's address, refunds")]);
    let _ = pointer_on(&mut w, &mut seller, &[(onchain(), b"the seller's wallet, refunds")]);
    // The seller's tag, then a version with no price: a payment naming the
    // withdrawn version buys nothing, owed back (Money rule 18).
    let p = lone_publication(&mut w, &mut seller, &mirs(), vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a print".into())))], Some("A print."));
    let sid = seller.id;
    let t1 = price_tag(&mut w, &mut seller, mirs().money, money::Priced::Publication(p), 900, spec(SAT), sid);
    let (pubs, tags) = conversion_offer(&mut w, &mut sw, "Lightning to on-chain, refunds.", sat(100_000));
    let (pub1, tag1) = conversion_offer(&mut w, &mut c1, "Lightning to a stablecoin, refunds.", sat(100_000));
    let (pub2, tag2) = conversion_offer(&mut w, &mut c2, "A stablecoin to on-chain, refunds.", cent(100_000));
    let (bid, swid, c1id, c2id) = (buyer.id, sw.id, c1.id, c2.id);
    let priced = w.log.clone();
    let t2 = {
        let x = Fin::PriceTag(money::PriceTag { priced: money::Priced::Publication(p), version: 2, previous: Some(t1), price: None, payee: sid }).to_map();
        let a = w.everyday_act(&mut seller, mirs().money, money::types::PRICE_TAG, x, Some(vec![Object { chain: t1, predecessor: t1 }]), None);
        w.add(&a)
    };
    let base = w.log.clone();
    let rule = "Money rule 28: a refund owed on a purchase paid through a route runs back hop by hop";
    let (q1, q3) = (b"the buyer pays the swap, for the print".to_vec(), b"the swap pays the seller, for the print".to_vec());
    let (b1p, b2p, b3p) = (b"the buyer pays the first converter, for the print".to_vec(), b"the first converter pays the second, for the print".to_vec(), b"the second converter pays the seller, for the print".to_vec());
    let back = b"the seller pays the second converter back".to_vec();
    let pays = vec![
        (q1.clone(), b"r ln 1".to_vec()), (q3.clone(), b"r out 1".to_vec()),
        (b1p.clone(), b"r ln 2".to_vec()), (b2p.clone(), b"r stable 2".to_vec()), (b3p.clone(), b"r out 2".to_vec()), (back.clone(), b"r back 2".to_vec()),
    ];
    let unit = spec(SAT);
    let entry = |rec: &Hash, debtor: &Hash, creditor: &Hash, amount: (&str, u64), agreement: &Hash, repaid: u64| {
        json!({ "record": hx(rec), "debtor": hx(debtor), "creditor": hx(creditor), "amount": [hx(&spec(amount.0)), amount.1], "agreement": hx(agreement), "repaid": repaid })
    };

    // Through one swap.
    let mut w1 = fresh(&base);
    let a1 = hop_receipt(&mut w1, &mut sw, ln(), &q1, bid, sat(950), tags, None, fwd(sid, sat(900), pubs), None);
    let k1 = hop_claim(&mut w1, &mut buyer, ln(), &q1, swid, sat(950), t2, None);
    let a2 = hop_receipt(&mut w1, &mut seller, onchain(), &q3, swid, sat(900), t2, Some(a1), None, None);
    out.case(&mut w1, "a payment through a swap naming the seller's withdrawn tag: the refund owed back hop by hop, the seller to the swap, the swap to the buyer", rule,
        "The seller's receipt names a version of its tag carrying no price: no purchase, owed back (Money rule 18). The refund is owed to the last hop's payer, the swap, who owes it on to the buyer under the agreement its forward named, each in its own hop's unit.",
        Facts { rail_valid: vec![(a1, sw_ptr), (k1, sw_ptr), (a2, t2)], rail_payments: pays.clone(), ..Default::default() }, ask_route("refund along", &a2),
        json!([entry(&a2, &sid, &swid, (SAT, 900), &t2, 0), entry(&a1, &swid, &bid, (SAT, 950), &pubs, 0)]), None);
    let _ = unit;

    // Through two converters.
    let mut w2 = fresh(&base);
    let b1 = hop_receipt(&mut w2, &mut c1, ln(), &b1p, bid, sat(1000), tag1, None, fwd(c2id, cent(95), pub1), None);
    let b2 = hop_receipt(&mut w2, &mut c2, stable(), &b2p, c1id, cent(95), tag2, Some(b1), fwd(sid, sat(900), pub2), None);
    let b3 = hop_receipt(&mut w2, &mut seller, onchain(), &b3p, c2id, sat(900), t2, Some(b2), None, None);
    let l2 = w2.log.clone();
    let f2 = |extra: &[(Hash, Hash)]| {
        let mut v = vec![(b1, c1_ptr), (b2, c2_ptr), (b3, t2)];
        v.extend_from_slice(extra);
        Facts { rail_valid: v, rail_payments: pays.clone(), ..Default::default() }
    };
    out.case(&mut w2, "the same through two converters: owed back by the seller to the second, by the second to the first, by the first to the buyer, each in its hop's unit", rule,
        "Three hops, two units: each hop's payee owes its payer what that hop received, under the agreement the hop's forward named, until it reaches the first payer.",
        f2(&[]), ask_route("refund along", &b3),
        json!([entry(&b3, &sid, &c2id, (SAT, 900), &t2, 0), entry(&b2, &c2id, &c1id, (CENT, 95), &pub2, 0), entry(&b1, &c1id, &bid, (SAT, 1000), &pub1, 0)]), None);

    // The seller pays the second converter back; the second never pays the first.
    let mut w3 = fresh(&l2);
    let rb = hop_receipt(&mut w3, &mut c2, onchain(), &back, sid, sat(900), b3, None, None, None);
    out.case(&mut w3, "the same, the seller repaying the second converter, who passes nothing back: the refund stops there, the second converter owing the first", rule,
        "The second converter's receipt of the seller's repayment names the seller's receipt it repays: the seller's debt is paid. The second converter owes it on to the first, and has paid nothing back: that hop is where the refund stops, under its forward's agreement.",
        f2(&[(rb, c2_ptr)]), ask_route("refund along", &b3),
        json!([entry(&b3, &sid, &c2id, (SAT, 900), &t2, 900), entry(&b2, &c2id, &c1id, (CENT, 95), &pub2, 0), entry(&b1, &c1id, &bid, (SAT, 1000), &pub1, 0)]), None);

    // A purchase: nothing owed back.
    let mut w4 = fresh(&priced);
    let d1 = hop_receipt(&mut w4, &mut sw, ln(), &q1, bid, sat(950), tags, None, fwd(sid, sat(900), pubs), None);
    let d2 = hop_receipt(&mut w4, &mut seller, onchain(), &q3, swid, sat(900), t1, Some(d1), None, None);
    out.case(&mut w4, "a routed payment naming the seller's priced tag: a purchase, nothing owed back along the route", rule,
        "The seller's receipt names the tag's first version, carrying its price: a purchase, no refund owed.",
        Facts { rail_valid: vec![(d1, sw_ptr), (d2, t1)], rail_payments: pays.clone(), ..Default::default() }, ask_route("refund along", &d2), json!([]), None);
}

pub fn agreements(out: &mut Out) {
    price_change(out);
    spec_claims(out);
    inner_deal_consent(out);
    closing_refund_placed(out);
}

/// A price tag's price changed on a push rail, settled as a withdrawal is
/// (Agreements rule 12; Money rule 18: the latest version counts).
fn price_change(out: &mut Out) {
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let content = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, Value::Bytes(spec("a rail's creator").to_vec())), (5, Value::Bytes(spec("a payment cMIP, by its hash").to_vec())), (9, Value::Text("A push rail binding payee and purpose, for a price change.".into())), (11, Value::Uint(1)), (13, Value::Array(vec![Value::Uint(0), Value::Uint(1)]))]);
    let rail = Spec::hash_of(&content);
    let mut w = World::new();
    let mut seller = w.genesis("a seller who changes a price", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan paying the old price", vec![own_home()], None, None);
    let ptr = pointer_on(&mut w, &mut seller, &[(rail, b"the seller's push address")]);
    let p = lone_publication(&mut w, &mut seller, &mirs(), vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a song".into())))], Some("A song."));
    let sid = seller.id;
    let t1 = price_tag(&mut w, &mut seller, mirs().money, money::Priced::Publication(p), 900, spec(SAT), sid);
    let base = w.log.clone();
    let proof = b"the fan pays the old price on a push rail".to_vec();
    let pays = vec![(proof.clone(), b"the old price's payment".to_vec())];
    let fid = fan.id;
    let claim = |w: &mut World, fan: &mut Person| {
        let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: sid, amount: sat(900), fulfils: t1, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(fan, mirs().money, 3, c.to_map(), None, None);
        w.add(&a)
    };
    let receipt = |w: &mut World, seller: &mut Person| {
        let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(fid)), payee: sid, amount: sat(900), fulfils: t1, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(seller, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let new_price = |w: &mut World, seller: &mut Person| {
        let x = Fin::PriceTag(money::PriceTag { priced: money::Priced::Publication(p), version: 2, previous: Some(t1), price: Some(sat(1200)), payee: sid }).to_map();
        let a = w.everyday_act(seller, mirs().money, money::types::PRICE_TAG, x, Some(vec![Object { chain: t1, predecessor: t1 }]), None);
        w.add(&a)
    };
    let rule = "Agreements rule 12: a price change settled as a withdrawal is; Money rule 18";
    // The receipt recorded after the new price: no purchase.
    let mut w1 = fresh(&base);
    let mut s1 = seller.clone();
    new_price(&mut w1, &mut s1);
    let c1 = claim(&mut w1, &mut fan);
    let r1 = receipt(&mut w1, &mut s1);
    out.case(&mut w1, "a payment naming a tag's earlier price on a push rail, the seller's receipt recorded after a later version changing the price: no purchase, owed back", rule,
        "The seller's own history holds the version pricing the song at 1200 when it records the payment of 900 naming the earlier version: on a push rail, no purchase once the service's history holds the new version.",
        Facts { rail_valid: vec![(c1, ptr), (r1, ptr)], rail_payments: pays.clone(), rail_specifications: vec![content.clone()], ..Default::default() }, json!({ "question": "purchase", "act": hx(&c1) }), json!("no purchase"), None);
    // The receipt recorded before the new price: a purchase.
    let mut w2 = fresh(&base);
    let mut s2 = seller.clone();
    let c2 = claim(&mut w2, &mut fan);
    let r2 = receipt(&mut w2, &mut s2);
    new_price(&mut w2, &mut s2);
    out.case(&mut w2, "the same payment, the seller's receipt recorded before the later version: a purchase at the earlier price", rule,
        "The receipt's history does not hold the new version: a sale at 900, past sales standing.",
        Facts { rail_valid: vec![(c2, ptr), (r2, ptr)], rail_payments: pays.clone(), rail_specifications: vec![content.clone()], ..Default::default() }, json!({ "question": "purchase", "act": hx(&c2) }), json!("purchase"), None);
}

/// A specification published for a collective, or under a grant key
/// (Development rule 3, read with Agreements).
fn spec_claims(out: &mut Out) {
    let mut w = World::new();
    let col = collective(&mut w, &[1], 1);
    let cid = col.id;
    let mut ana = member_for(&col, 0);
    let mut stranger = w.genesis("a stranger publishing for a band", vec![own_home()], None, None);
    let content = |by: &Hash, words: &str| cbor::encode(&Value::Map(vec![(Value::Uint(0), Value::Uint(kinds::CMIP)), (Value::Uint(1), Value::Bytes(by.to_vec())), (Value::Uint(9), Value::Text(words.into()))]));
    let media = |c: &[u8]| publication(vec![(Value::Uint(0), Value::Bytes(mirs().development.to_vec())), (Value::Uint(1), Value::Bytes(mor_core::hash::work_hash(c).to_vec()))]);
    let base = w.log.clone();
    let ask = |p: &Hash, c: &Hash| json!({ "question": "specification claim, reading Agreements", "act": hx(p), "creator": hx(c) });
    let rule = "Development rule 3: an act for a collective that Agreements counts, or under a grant key Agreements backs, is the creator's";
    let mut w1 = fresh(&base);
    let by_ana = { let a = w1.everyday_act(&mut ana, mirs().envelopes, 0, media(&content(&cid, "A cMIP by the band.")), Some(vec![Object { chain: cid, predecessor: cid }]), None); w1.add(&a) };
    out.case(&mut w1, "a specification naming a collective its creator, published by a member for it: the collective's", rule,
        "Ana, whom the founding names for the band in Envelopes (a specification's publication is a bake), signs it naming the band in `objects`: an act for the collective that Agreements counts.",
        Facts::default(), ask(&by_ana, &cid), json!("claimed"), None);
    let mut w2 = fresh(&base);
    let mut s = stranger.acting_for(cid, vec![cid]);
    let by_s = { let a = w2.everyday_act(&mut s, mirs().envelopes, 0, media(&content(&cid, "A cMIP the band never wrote.")), Some(vec![Object { chain: cid, predecessor: cid }]), None); w2.add(&a) };
    let _ = &mut stranger;
    out.case(&mut w2, "the same naming the collective, published by a stranger: unclaimed", rule,
        "Anyone can name a collective in `objects`; a stranger's act for it counts for nothing (Agreements rule 58).",
        Facts::default(), ask(&by_s, &cid), json!("unclaimed"), None);
    // A person's grant key.
    let mut w3 = World::new();
    let mut ida = w3.genesis("ida, publishing through her application", vec![own_home()], None, None);
    let mut app = w3.genesis("ida's publishing application", vec![own_home()], None, None);
    let (_, mut gk) = grant_key_person(&mut w3, &mut ida, &mut app, vec![Kind::Type { spec: mirs().envelopes, type_: 0 }]);
    let iid = ida.id;
    let by_key = { let a = w3.everyday_act(&mut gk, mirs().envelopes, 0, media(&content(&iid, "A cMIP by Ida, published by her application.")), None, None); w3.add(&a) };
    out.case(&mut w3, "a specification naming a person its creator, published under her grant key that Agreements backs: hers", rule,
        "Ida's grant reaches her application's bakes; the publication is signed with the grant key and cites the grant: her own act for this rule.",
        Facts::default(), ask(&by_key, &iid), json!("claimed"), None);
}

/// A refund owed on a payment to a collective blocks its closing until it
/// is repaid or ended (Agreements, "Closing": "owes nothing", a refund owed
/// on a payment to it among its debts).
pub fn closing_refund(out: &mut Out, family: &[(mor_core::act::Act, Option<[u8; 32]>)], closing: Hash, cid: Hash) {
    let mut w = fresh(family);
    let mut fan = w.genesis("a fan who paid the band for another's song", vec![own_home()], None, None);
    let mut seller = w.genesis("a seller whose tag the fan named", vec![own_home()], None, None);
    let tag = lone_offer(&mut w, &mut seller, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a song".into())))], sat(300), "A song.");
    let rail = spec("a rail Module, closing refunds");
    let proof = b"the fan pays the band, naming another seller's tag".to_vec();
    let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: cid, amount: sat(300), fulfils: tag, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
    let paid = { let a = w.everyday_act(&mut fan, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
    let owing = w.log.clone();
    let pays = vec![(proof.clone(), b"the fan's payment to the band".to_vec())];
    let rule = "Agreements, \"Closing (type 20)\": the collective owes nothing, a refund owed on a payment to it among its debts";
    out.case(&mut w, "a refund owed on a payment to a collective that its closing's line does not place: it does not block the closing", rule,
        "The fan paid the band naming another seller's tag: no purchase, owed back to the fan. But the fan's claim was made after the closing's line, and no act of the band in the closing's history records or acknowledges it: as other debts are, the refund is placed by the closing's line, and this one lies outside it.",
        Facts { rail_valid: vec![(paid, tag)], rail_payments: pays.clone(), ..Default::default() }, json!({ "question": "closing", "act": hx(&closing) }), json!({ "complete": true }), None);
    let _ = owing;
}

/// An inner deal consents by its version in force (Agreements, "Any
/// agreement may be a party to another"): a consent an earlier version's
/// parties gave stands only where the version in force carries it.
pub fn inner_deal_consent(out: &mut Out) {
    let mark_all = |ids: &[Hash]| {
        let mut s = ids.to_vec();
        s.sort();
        Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers: s }])
    };
    let mut w = World::new();
    let mut jo = w.genesis("jo, of an inner deal re-versioned", vec![own_home()], None, None);
    let mut kai = w.genesis("kai, who leaves the inner deal", vec![own_home()], None, None);
    let lu = w.genesis("lu, who takes kai's place", vec![own_home()], None, None);
    let mut mo = w.genesis("mo, of the outer deal", vec![own_home()], None, None);
    let mut t0 = deal(&[jo.id, kai.id], None);
    t0.text = "Jo and Kai's inner deal, before Lu.".into();
    let inner = ag_act(&mut w, &mut jo, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut jo, &inner);
    sign(&mut w, &mut kai, &inner);
    let mut t = deal(&[inner, mo.id], None);
    t.text = "An outer deal naming Jo and Kai's deal, signed before the inner deal changes.".into();
    let outer = ag_act(&mut w, &mut mo, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut mo, &outer);
    let base0 = w.log.clone();
    let (jo0, kai0, lu0) = (jo.clone(), kai.clone(), lu.clone());
    sign(&mut w, &mut jo, &outer);
    sign(&mut w, &mut kai, &outer);
    let base = w.log.clone();
    let clone_inner = |w: &mut World, jo: &mut Person, kai: &mut Person, lu: &mut Person, acks: Option<Vec<Hash>>, text: &str| {
        let mut c = t0.clone();
        c.parent = Some(inner);
        c.parties = vec![jo.id, lu.id];
        c.text = text.into();
        c.field4 = mark_all(&[jo.id, kai.id]);
        let v2 = { let a = w.everyday_act(jo, mirs().agreements, agreements::types::TERMS, c.to_map(), obj(inner), acks); w.add(&a) };
        sign(w, jo, &v2);
        sign(w, kai, &v2);
        sign(w, lu, &v2);
        v2
    };
    let rule = "Agreements rule 15: an inner deal signs by its version in force at that consent, read from each signature act's history; a consent so given stands for every later version";
    out.case(&mut fresh(&base), "a deal one of whose parties is a deal, signed by every party of that deal's version in force at the time: exists", rule,
        "Jo and Kai, the inner deal's parties while its founding is in force, sign the outer deal.",
        Facts::default(), ask_route("agreement exists", &outer), json!("exists"), None);
    // The inner deal re-versioned first, Lu in Kai's place; Jo and Kai sign
    // the outer deal only after: a version no longer in force gives none.
    let mut w2 = fresh(&base0);
    let (mut j2, mut k2, mut l2) = (jo0.clone(), kai0.clone(), lu0.clone());
    clone_inner(&mut w2, &mut j2, &mut k2, &mut l2, None, "The inner deal, Lu in Kai's place, before any consent to the outer deal.");
    sign(&mut w2, &mut j2, &outer);
    sign(&mut w2, &mut k2, &outer);
    out.case(&mut w2, "an inner deal already re-versioned, Lu in Kai's place, the outer deal then signed by Jo and Kai: it does not exist", rule,
        "Their signature acts' histories hold the new version, naming Jo and Lu: that is the version in force at their consent, and Lu has not signed; the founding, no longer in force, gives none.",
        Facts::default(), ask_route("agreement exists", &outer), json!("does not exist"), None);
    // Signed under the founding, then re-versioned by parties who signed
    // after their consent: the version in force carries it.
    let mut w3 = fresh(&base);
    let (mut j3, mut k3, mut l3) = (jo.clone(), kai.clone(), lu.clone());
    clone_inner(&mut w3, &mut j3, &mut k3, &mut l3, None, "The inner deal, Lu in Kai's place, after its consent to the outer deal.");
    out.case(&mut w3, "the outer deal signed by Jo and Kai under the inner deal's founding, the inner deal then re-versioned: the consent stands, the outer deal exists", rule,
        "When Jo and Kai signed the outer deal, the latest version of the inner deal's line their signature acts' histories held was its founding, whose parties they are: a consent so given stands for every later version.",
        Facts::default(), ask_route("agreement exists", &outer), json!("exists"), None);
}


/// A refund owed on a payment to a collective, placed by its closing's line
/// (the collective's own receipt in the closing's history), blocks the
/// closing; one owed to nobody, named in field 4, is left open (Agreements,
/// "Closing (type 20)").
pub fn closing_refund_placed(out: &mut Out) {
    let rule = "Agreements, \"Closing (type 20)\": the collective owes nothing, a refund owed on a payment to it before its line among its debts, save what field 4 leaves open";
    for (payer_named, repaid, name, why) in [
        (true, false, "a closing of a collective owing a refund on a payment its own receipt records before the line: not complete",
         "The fan paid the band naming another seller's tag: no purchase, money received for nothing, owed back to the fan. The band's own receipt of it lies in the closing's history: a debt of the band's, not ended, so it cannot close."),
        (true, true, "the same, the fan's receipt of the refund acknowledged by an act of the band before the line: complete",
         "The fan receipts 300 back, naming the band's receipt; an act of the band in the closing's history acknowledges it, so the closing's line relies on it: the refund is repaid, and the band owes nothing."),
        (false, false, "a closing naming in field 4 a refund owed to nobody (a payment that committed no key), its own receipt before the line: complete",
         "The payer committed no key: nobody can claim the refund. Named in field 4 as left open, it does not block the closing, as for the broken stretch; it stays visible."),
    ] {
        let mut w = World::new();
        let mut col = collective(&mut w, &[1], 1);
        let (f, cid) = (col.founding, col.id);
        let mut fan = w.genesis("a fan paying a band that closes", vec![own_home()], None, None);
        let mut seller = w.genesis("a seller whose tag was named to the band", vec![own_home()], None, None);
        let tag = lone_offer(&mut w, &mut seller, vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a print".into())))], sat(300), "A print.");
        let rail = spec("a rail Module, a band's closing");
        let proof = b"a payment to the band naming another seller's tag".to_vec();
        let payer = if payer_named { Some(Payer::Identity(fan.id)) } else { None };
        let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer, payee: cid, amount: sat(300), fulfils: tag, previous: None, forward: None, batch: None, purchase: None });
        let mut ben = col.m[1].acting_for(cid, vec![cid]);
        let rec = { let a = w.everyday_act(&mut ben, mirs().money, 2, r.to_map(), Some(vec![Object { chain: cid, predecessor: cid }]), None); w.add(&a) };
        let mut cites = vec![rec];
        let mut valid = vec![(rec, tag)];
        let mut pays = vec![(proof.clone(), b"the band's payment".to_vec())];
        if repaid {
            let back = b"the band pays the fan back, a band's closing".to_vec();
            let rr = Fin::Receipt(Receipt { rail, proof: back.clone(), payer: Some(Payer::Identity(cid)), payee: fan.id, amount: sat(300), fulfils: rec, previous: None, forward: None, batch: None, purchase: None });
            let fr = { let a = w.everyday_act(&mut fan, mirs().money, 2, rr.to_map(), None, None); w.add(&a) };
            let mut ana = col.m[0].acting_for(cid, vec![rec]);
            let ack = { let a = w.everyday_act(&mut ana, mirs().agreements, agreements::new_types::LIVENESS, agreements::Liveness { agreement: f }.to_map(), obj(f), Some(vec![fr])); w.add(&a) };
            cites = vec![ack];
            valid.push((fr, tag));
            pays.push((back, b"the refund".to_vec()));
        }
        let _ = &mut fan;
        let open = if payer_named { vec![] } else { vec![agreements::OpenOwed { payment: rec, notice: None, holder: None }] };
        let closing = agreements::Closing { agreement: f, collective: cid, open };
        let k = ag_act(&mut w, &mut col.m[0].acting_for(cid, cites), agreements::types::CLOSING, closing.to_map(), obj(f));
        for i in 0..3 {
            let (_, q) = w.chain_sign(&col.m[i], k);
            col.m[i] = q;
        }
        out.case(&mut w, name, rule, why,
            Facts { rail_valid: valid, rail_payments: pays, ..Default::default() },
            json!({ "question": "closing", "act": hx(&k) }), json!({ "complete": !payer_named || repaid }), None);
    }
}


/// A vow's sale paid through a route (Agreements rule 13; Money rule 24):
/// the sale is the first payer's, by their claim of the first hop citing
/// the tag; a later claim of theirs of that hop acknowledging an act about
/// the vow confirms it.
fn vow_through_route(out: &mut Out) {
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let content = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, Value::Bytes(spec("a rail's creator").to_vec())), (5, Value::Bytes(spec("a payment cMIP, by its hash").to_vec())), (9, Value::Text("A Lightning request rail, a vow through a route.".into())), (11, Value::Uint(0)), (13, Value::Array(vec![Value::Uint(0), Value::Uint(1)]))]);
    let lnr = Spec::hash_of(&content);
    let mut w = World::new();
    let mut club = w.genesis("a club selling seats through a swap", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan paying a seat through a swap", vec![own_home()], None, None);
    let mut sw = w.genesis("a swap for seats", vec![own_home()], None, None);
    let sw_ptr = pointer_on(&mut w, &mut sw, &[(lnr, b"the swap's node, seats")]);
    let name = { let v = mor_core::envelopes::vow::Vow { words: "A concert in the hall, 20 December".into(), cmip: None };
        let a = w.everyday_act(&mut club, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None); w.add(&a) };
    let tag = lone_offer(&mut w, &mut club, vec![agreements::Sold::Vow(name)], sat(300), "One seat, through a route.");
    let (pubs, tags) = conversion_offer(&mut w, &mut sw, "Lightning to on-chain, seats.", sat(100_000));
    let (cid, fid, swid) = (club.id, fan.id, sw.id);
    let (q1, q3) = (b"the fan pays the swap for a seat".to_vec(), b"the swap pays the club for the seat".to_vec());
    let pays = vec![(q1.clone(), b"seat ln".to_vec()), (q3.clone(), b"seat out".to_vec())];
    let a1 = hop_receipt(&mut w, &mut sw, lnr, &q1, fid, sat(950), tags, None, fwd(cid, sat(300), pubs), None);
    let a2 = hop_receipt(&mut w, &mut club, onchain(), &q3, swid, sat(300), tag, Some(a1), None, None);
    let k1 = first_claim(&mut w, &mut fan, lnr, &q1, swid, tags, Some(tag));
    let base = w.log.clone();
    let rule = "Agreements rule 13: a vow's sale, its buyer through a route the first payer (Money rule 24)";
    let ask_vow = json!({ "question": "vow", "vow": hx(&name) });
    let facts = |extra: &[(Hash, Hash)]| {
        let mut v = vec![(a1, sw_ptr), (a2, tag), (k1, sw_ptr)];
        v.extend_from_slice(extra);
        Facts { rail_valid: v, rail_payments: pays.clone(), rail_specifications: vec![content.clone()], ..Default::default() }
    };
    out.case(&mut fresh(&base), "a vow's seat paid through a swap, the fan's claim of the first hop citing the club's tag: one sale, the fan's, pending", rule,
        "The route ending at the club's receipt is valid and the fan's claim of the first hop cites the tag: the fan signed onto the vow by that claim, the sale is pending.",
        facts(&[]), ask_vow.clone(), json!({ "sales": [{ "act": hx(&k1), "buyer": hx(&fid), "state": "pending" }], "unsigned": [], "unknown": [] }), None);
    let mut w2 = fresh(&base);
    let mut door = w2.genesis("the hall's door, a route", vec![own_home()], None, None);
    let scanned = { let a = w2.everyday_act_refs(&mut door, spec("a ticketing Module"), 0, vec![(Value::Uint(0), Value::Text("seat 3, scanned".into()))], None, None, Some(vec![mor_core::act::Ref::Act(name)])); w2.add(&a) };
    let _k2 = { let c = Fin::Claim(Claim { rail: lnr, proof: q1.clone(), payee: swid, amount: sat(950), fulfils: tags, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w2.everyday_act_refs(&mut fan.clone(), mirs().money, 3, c.to_map(), None, Some(vec![scanned]), Some(vec![mor_core::act::Ref::Act(tag)])); w2.add(&a) };
    out.case(&mut w2, "the same, a later claim of the fan's of the first hop acknowledging the door's record of the vow: confirmed", rule,
        "A claim of the first payer's of the first hop, the sale's own payment, acknowledges an act about the vow: the buyer confirms it, as a direct buyer does by their claim.",
        facts(&[(_k2, sw_ptr)]), ask_vow.clone(), json!({ "sales": [{ "act": hx(&k1), "buyer": hx(&fid), "state": "confirmed" }], "unsigned": [], "unknown": [] }), None);
}
