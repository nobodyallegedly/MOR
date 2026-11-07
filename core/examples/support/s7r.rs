//! S7r: the first freeze rehearsal's decisions (F436), written with the
//! core's own acts: an escape after a placed sale and the acts bound to an
//! abandoned rotation (suite 3.9ak); a closing rotation that keeps no
//! receipt (5.7c); a contested position with the audit dropped (5.7d); a
//! succession confirmed by a chain signature (5.8b); the owners' side
//! leaving a split service that does not sign (7.7); a rail Module the
//! payee never listed (Money rule 4); role shares, records and metrics
//! (Agreements rules 22 and 29).

use super::*;
use mor_core::agreements::{Metric, Partner, Payout, Publication, ShareRule, Split, StakeTransfer};
use mor_core::identity::Successor;
use mor_core::money::Purchase;

const UNIT: &str = "a test unit (regtest satoshi)";

fn chain_of(id: &Hash) -> J {
    json!({ "question": "chain", "identity": hx(id) })
}

fn replay(log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)]) -> World {
    let mut w = World::new();
    for (a, k) in log {
        match k {
            Some(k) => {
                let _ = w.v.add_with_key(a.clone(), Some(k));
                w.log.push((a.clone(), Some(*k)));
            }
            None => {
                w.add(a);
            }
        }
    }
    w
}

pub fn identity(out: &mut Out) {
    // 3.9ak's Identity half: a thief's rival rotation, receipted by the
    // owner's home, which the owner's escape abandons. The thief's posts
    // bound to it are judged as rule 34 judges an act outside a kept
    // ancestry: void, or, acknowledged, disputed; never invalid.
    let mut w = World::new();
    let mut h = w.operator("kai's home");
    let mut nh = w.operator("kai's escape home");
    let mut wit = w.genesis("a witness", vec![own_home()], None, None);
    let mut kai = w.genesis("kai", vec![home_of(&h)], None, None);
    let (x, mut thief) = w.rotate(&kai, Rot { signing_key: Some(schnorr("kai's thief", 1)), ..Default::default() });
    w.receipt(&mut h, &kai.id, &x, 1);
    let q = w.post(&mut thief, "a post the thief signs, which a witness relies on");
    let q2 = w.post(&mut thief, "a post the thief signs, which nobody relies on");
    w.ack(&mut wit, q);
    let before = w.log.clone();
    let (e, _) = w.rotate(&kai, Rot { homes: Some(vec![home_of(&nh)]), homeless: true, signing_key: Some(schnorr("kai, escaped", 1)), ..Default::default() });
    w.endorse(&mut kai, &e, Some(vec![x]));
    w.receipt(&mut nh, &kai.id, &e, 1);
    let after = w.log.clone();
    let mut w0 = replay(&before);
    out.case(&mut w0, "3.9ak a thief's rotation its home receipted, before any escape: a post bound to it is valid", "Identity, everyday check 2",
        "The thief's rotation counts: the home receipted it.", Facts::default(), ask_status(&q), json!("valid"), None);
    let mut w1 = replay(&after);
    out.case(&mut w1, "3.9ak the owner's escape abandons that rotation: it counts, the thief's rotation never counts again", "Identity, \"Escape with both keys\"; \"The escape endorsement\"",
        "Both keys, the endorsement listing the thief's rotation as abandoned, the new home's receipt.", Facts::default(), chain_of(&kai.id), json!({ "counting": [hx(&kai.id), hx(&e)], "next": "end", "dishonest": [] }), None);
    out.case(&mut w1, "3.9ak a post bound to the abandoned rotation that a witness acknowledged: disputed, never invalid", "Identity, everyday check 2 (draft 16): judged as rule 34 judges an act outside a kept ancestry",
        "Another identity relied on it before the escape: valid, and shown as disputed.", Facts::default(), ask_status(&q), json!("disputed"), None);
    out.case(&mut w1, "3.9ak a post bound to the abandoned rotation that nobody acknowledged: void, never invalid", "Identity, everyday check 2 (draft 16); rule 34",
        "Nobody relied on it: void, as an act outside a rotation's kept ancestry is.", Facts::default(), ask_status(&q2), json!("void"), None);

    // 5.7c: the closing rotation keeps nothing. The home's receipt made the
    // owner's rotation count; the operator's later rotation, closing the
    // home and naming no tip of its receipt line, cannot unmake that.
    let mut w = World::new();
    let mut hm = w.operator("lin's home, closing");
    let lin = w.genesis("lin", vec![home_of(&hm)], None, None);
    let (t, _) = w.rotate(&lin, Rot::default());
    w.receipt(&mut hm, &lin.id, &t, 1);
    w.rotate(&hm, Rot { kept: Some(vec![]), closure: true, ..Default::default() });
    out.case(&mut w, "5.7c the home's operator closes it by a rotation keeping no receipt: the receipt that counted keeps counting", "Identity, receipt check 5 (draft 16)",
        "A receipt that counted toward the home rule at a position keeps counting there whatever its operator's later rotation keeps, shown as disputed: the owner's rotation still counts.",
        Facts::default(), chain_of(&lin.id), json!({ "counting": [hx(&lin.id), hx(&t)], "next": "end", "dishonest": [] }), None);

    // 5.7d: a contested position with the audit dropped. An audited
    // identity with one home; a thief holding the chain key and the home's
    // signing key signs a rival rotation declaring no audit, which the
    // home receipts; the owner's rotation is receipted too, under no
    // cosigned summary yet.
    let mut w = World::new();
    let mut hd = w.operator("noa's home");
    let aud = w.genesis("noa's auditor", vec![own_home()], None, None);
    let audit = Audit { threshold: 1, auditors: vec![aud.id] };
    let noa = w.genesis("noa, audited", vec![home_of(&hd)], None, Some(audit));
    let (r, _) = w.rotate(&noa, Rot::default());
    let solo = w.log.clone();
    let (thief, _) = w.rotate(&noa, Rot { audit: Some(None), signing_key: Some(schnorr("noa's thief", 1)), ..Default::default() });
    w.receipt(&mut hd, &noa.id, &thief, 1);
    w.receipt(&mut hd, &noa.id, &r, 1);
    out.case(&mut w, "5.7d a thief's rival rotation dropping the audit, both receipted by the home, neither cosigned: contested, never the thief's outright", "Identity, receipt check 4 (draft 16)",
        "At a position contested by two rotations revealing the same chain key, each is judged under the audit requirement in effect before it: neither receipt counts uncosigned.",
        Facts::default(), chain_of(&noa.id), json!({ "counting": [hx(&noa.id)], "next": "contested", "dishonest": [] }), None);
    let mut w2 = replay(&solo);
    let (alone, _) = {
        let p = w2.genesis("noa's twin, audited", vec![home_of(&hd)], None, Some(Audit { threshold: 1, auditors: vec![aud.id] }));
        let (d, q) = w2.rotate(&p, Rot { audit: Some(None), ..Default::default() });
        w2.receipt(&mut hd, &p.id, &d, 1);
        ((p, d), q)
    };
    out.case(&mut w2, "5.7d a rotation alone at its position dropping the audit: judged under the requirement it declares, it counts on the home's receipt", "Identity, receipt check 4; rule 56",
        "An owner can always drop auditors who have gone.", Facts::default(), chain_of(&alone.0.id), json!({ "counting": [hx(&alone.0.id), hx(&alone.1)], "next": "end", "dishonest": [] }), None);

    // 5.8b: a succession confirmed by a chain signature of the successor
    // naming the rotation.
    let mut w = World::new();
    let ole = w.genesis("ole", vec![own_home()], None, None);
    let heir = w.genesis("ole's successor", vec![own_home()], None, None);
    let (r, _) = w.rotate(&ole, Rot { successor: Some(Some(Successor { protocol: "mor".into(), identifier: heir.id.to_vec() })), ..Default::default() });
    let (cs, _) = w.chain_sign(&heir, r);
    out.case(&mut w, "5.8b a succession confirmed by the successor's chain signature naming the rotation: confirmed, followed", "Identity, section 8 (draft 16)",
        "A successor confirms by a link confirmation, a witness act, or a chain signature naming the rotation; a collective, which signs no everyday act, so.",
        Facts::default(), json!({ "question": "succession", "identity": hx(&ole.id) }), json!({ "seen": "confirmed, followed", "successor": hx(&heir.id), "confirmation": hx(&cs) }), None);
}

/// A publication of `owners` with `plan`.
fn publication_of(owners: Hash, service: Hash, partners: Vec<Partner>, sold: Vec<agreements::Sold>, plan: agreements::SplitPlan) -> Publication {
    Publication { sold: Some(sold), owners: Some(owners), partners, service, plan, words: None, time: None, until: None, refund: None, cmips: vec![], designated: None, backups: vec![], failed: None }
}

pub fn agreements(out: &mut Out) {
    escape_after_sale(out);
    owners_exit(out);
    never_listed(out);
    roles_and_metrics(out);
}

/// 3.9ak: an escape after a placed sale. Ben chain-signs a transfer of a
/// fifth of the song's stake to Carla, his home receipting it; Carla
/// completes it. Ben then escapes at that position, abandoning his chain
/// signature: the transfer, complete, stands.
fn escape_after_sale(out: &mut Out) {
    let mut w = World::new();
    let mut h = w.operator("ben's home");
    let mut nh = w.operator("ben's escape home");
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![home_of(&h)], None, None);
    let mut carla = w.genesis("carla, who buys", vec![own_home()], None, None);
    let work = spec("a song, step 3.9ak");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The song's ownership agreement: Ana 600,000, Ben 400,000.".into();
    owning(&mut t, c, &[(ana.id, 600_000), (ben.id, 400_000)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &own);
    sign(&mut w, &mut ben, &own);
    let tr = StakeTransfer { agreement: own, stake: 0, to: carla.id, share: 200_000, record: vec![] };
    let x = ag_act(&mut w, &mut ben, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(own));
    sign(&mut w, &mut carla, &x);
    let (cs, _) = w.chain_sign(&ben, x);
    w.receipt(&mut h, &ben.id, &cs, 1);
    let placed = w.log.clone();
    let (e, _) = w.rotate(&ben, Rot { homes: Some(vec![home_of(&nh)]), homeless: true, signing_key: Some(schnorr("ben, escaped", 1)), ..Default::default() });
    w.endorse(&mut ben, &e, Some(vec![cs]));
    w.receipt(&mut nh, &ben.id, &e, 1);
    let mut w0 = replay(&placed);
    out.case(&mut w0, "3.9ak Ben's transfer to Carla, chain-signed and receipted, Carla's signature placed: it takes effect", "Agreements rule 10",
        "Both signatures placed.", Facts::default(), ask("transfer", &x), json!({ "effective": true, "wrong_receipts": [] }), None);
    out.case(&mut w, "3.9ak Ben then escapes at that position, abandoning his chain signature: the escape counts", "Identity, \"Escape with both keys\"",
        "The endorsement lists the chain signature as abandoned: it never counts again.", Facts::default(), chain_of(&ben.id), json!({ "counting": [hx(&ben.id), hx(&e)], "next": "end", "dishonest": [] }), None);
    out.case(&mut w, "3.9ak the complete transfer stands after the escape, the escape shown as a dispute on it", "Agreements rule 10 (draft 24): a chain signature's placing stands once the act is complete; Identity rule 29",
        "Carla bought in good faith; what Ben's chain signature placed stands whatever his escape later abandons.", Facts::default(), ask("transfer", &x), json!({ "effective": true, "wrong_receipts": [] }), None);
}

/// 7.7: the owners' side replacing a split service that does not sign.
fn owners_exit(out: &mut Out) {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut label = w.genesis("a label, partner", vec![own_home()], None, None);
    let mut s = w.genesis("service S, which will not sign", vec![own_home()], None, None);
    let mut t2 = w.genesis("service T", vec![own_home()], None, None);
    let work = spec("a song, step 7.7");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The song's ownership agreement: Ana and Ben, half each.".into();
    owning(&mut t, c, &[(ana.id, 500_000), (ben.id, 500_000)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &own);
    sign(&mut w, &mut ben, &own);
    let bake = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec()))]), None, None); w.add(&a) };
    let partners = vec![Partner { identity: label.id, share: 100_000, label: None }];
    let v1 = publication_of(own, s.id, partners.clone(), vec![agreements::Sold::Bake(bake)], test_plan());
    let p1 = ag_act(&mut w, &mut ana, agreements::types::PUBLICATION, v1.to_map(), obj(own));
    sign(&mut w, &mut ben, &p1);
    sign(&mut w, &mut label, &p1);
    sign(&mut w, &mut s, &p1);
    let base = w.log.clone();
    let later = |w: &mut World, ana: &mut Person, p: &Publication| {
        ag_act(w, ana, agreements::types::PUBLICATION, p.to_map(), Some(vec![Object { chain: p1, predecessor: p1 }, Object { chain: own, predecessor: own }]))
    };
    // Version 2: only field 3 changes; the owners' side and T sign.
    let mut v2 = v1.clone();
    v2.service = t2.id;
    let p2 = later(&mut w, &mut ana, &v2);
    sign(&mut w, &mut ben, &p2);
    sign(&mut w, &mut t2, &p2);
    out.case(&mut w, "7.7 the owners' side alone replaces a split service that does not sign, the new service accepting: it counts", "Agreements rule 11 (draft 24): the owners' side's exit; rule 31",
        "A version changing only its split service and backups needs the owners' side and each service it newly names; the old service and the partner need not sign.",
        Facts::default(), ask("publication", &p2), json!({ "counts": true, "ends": false }), None);
    // The same, also raising the partner's share: no exit, every party.
    let mut w2 = replay(&base);
    let mut v3 = v2.clone();
    v3.partners[0].share = 120_000;
    let mut ana2 = ana.clone();
    let p3 = later(&mut w2, &mut ana2, &v3);
    sign(&mut w2, &mut ben.clone(), &p3);
    sign(&mut w2, &mut t2.clone(), &p3);
    out.case(&mut w2, "7.7 the same version also raising the partner's share, the partner not signing: it does not count", "Agreements rule 11: every other version needs every party",
        "Raising a partner's share is no exit: every party of the version signs, and the partner has not.",
        Facts::default(), ask("publication", &p3), json!({ "counts": false, "ends": false }), None);
    // Ending it alone: a version selling nothing, the owners' side alone.
    let mut w3 = replay(&base);
    let mut v4 = v1.clone();
    v4.sold = Some(vec![]);
    let mut ana3 = ana.clone();
    let p4 = later(&mut w3, &mut ana3, &v4);
    sign(&mut w3, &mut ben.clone(), &p4);
    out.case(&mut w3, "7.7 the owners' side alone ends the publication by a version selling nothing: it counts, and ends it", "Agreements rule 11 (draft 24)",
        "No partner and no service ends a publication alone; its owners' side may.",
        Facts::default(), ask("publication", &p4), json!({ "counts": true, "ends": true }), None);
}

/// Money rule 4, read before any proof (F436's R39): claims naming a rail
/// Module the payee never listed count for nothing, never as unanswered.
fn never_listed(out: &mut Out) {
    let unit = spec(UNIT);
    let rail = spec("a rail Module");
    let other = spec("a rail Module the club never listed");
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let mut x1 = w.genesis("a stranger", vec![own_home()], None, None);
    let mut x2 = w.genesis("another stranger", vec![own_home()], None, None);
    pointer_act(&mut w, &mut club, b"the club's address");
    let name = { let v = mor_core::envelopes::vow::Vow { words: "A concert in the hall, 13 December".into(), cmip: None };
        let a = w.everyday_act(&mut club, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None); w.add(&a) };
    let offer = lone_offer(&mut w, &mut club, vec![agreements::Sold::Vow(name)], Amount { unit, value: 300 }, "One seat.");
    let claim = |w: &mut World, p: &mut Person, r: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim { rail: r, proof: proof.to_vec(), payee: club.id, amount: Amount { unit, value: 300 }, fulfils: offer, disagrees: None, referral: None, refund: None, purchase: None, previous: None });
        let a = w.everyday_act(p, mirs().money, 3, c.to_map(), None, None); w.add(&a)
    };
    let c1 = claim(&mut w, &mut fan, rail, b"the fan's seat");
    claim(&mut w, &mut x1, other, b"a stranger's claim");
    claim(&mut w, &mut x2, other, b"another stranger's claim");
    out.case(&mut w, "two claims naming a rail Module the payee never listed, unanswered: they count for nothing, and the vow's sales stand", "Money rule 4: a receipt or claim naming any other rail Module counts for nothing, whatever its rail's proof shows",
        "No proof need be read to see that a Module is nowhere in the payee's pointers: the two claims are set aside, never left unanswered.",
        Facts { rail_valid: vec![(c1, offer)], rail_payments: vec![(b"the fan's seat".to_vec(), b"one seat".to_vec())], ..Default::default() },
        json!({ "question": "vow", "vow": hx(&name) }), json!({ "sales": [{ "act": hx(&c1), "buyer": hx(&fan.id), "state": "pending" }], "unsigned": [], "unknown": [] }), None);
}

/// Role shares, records and metrics (Agreements rules 22 and 29; F436's
/// R17, R18): a publication of a song selling one bake, its plan a relay's
/// role share and a metric share; a fan's purchase; splits judged.
fn roles_and_metrics(out: &mut Out) {
    let unit = spec(UNIT);
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let playmod = spec("a play-count Module");
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let dee = w.genesis("dee, holding one millionth", vec![own_home()], None, None);
    let mut svc = w.genesis("the song's split service", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let relay = w.genesis("a relay's operator", vec![own_home()], None, None);
    let meter = w.genesis("a play counter", vec![own_home()], None, None);
    let work = spec("a song, rules 22 and 29");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The song's ownership agreement: Ana, Ben, and Dee one millionth.".into();
    owning(&mut t, c, &[(ana.id, 499_999), (ben.id, 500_000), (dee.id, 1)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &own);
    sign(&mut w, &mut ben, &own);
    let locked = spec("the song's locked bytes");
    let bake = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))]), None, None); w.add(&a) };
    let plan_with = |measurer: Hash| {
        let mut p = test_plan();
        p.shares = vec![ShareRule::Role { role: "relay".into(), part: 100_000 }, ShareRule::Metric { metric: 0, part: 100_000 }];
        p.metrics = vec![Metric { module: playmod, measurer, params: None }];
        p
    };
    let pointer = pointer_act(&mut w, &mut svc, b"the service's address");
    let base = w.log.clone();
    let proof = b"the fan's payment".to_vec();
    #[derive(Clone, Copy, PartialEq)]
    enum Ev { UseRecord, Delivery, WrongObject }
    // One world per case: the publication, the fan's purchase, the
    // evidence, the payer's claim acknowledging it or not, the split.
    let build = |measurer_is_service: bool, ev: Ev, acked: bool, metric_to: Option<Hash>| -> (World, Hash, Facts) {
        let mut w = replay(&base);
        let (mut ana, mut ben, mut svc, mut fan, mut relay, mut meter) = (ana.clone(), ben.clone(), svc.clone(), fan.clone(), relay.clone(), meter.clone());
        let plan = plan_with(if measurer_is_service { svc.id } else { meter.id });
        let p = publication_of(own, svc.id, vec![], vec![agreements::Sold::Bake(bake)], plan);
        let pubx = ag_act(&mut w, &mut ana, agreements::types::PUBLICATION, p.to_map(), obj(own));
        sign(&mut w, &mut ben, &pubx);
        sign(&mut w, &mut svc, &pubx);
        let sid = svc.id;
        let tag = price_tag(&mut w, &mut svc, mirs().money, money::Priced::Publication(pubx), 1000, unit, sid);
        let r = { let x = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(fan.id), payee: svc.id, amount: Amount { unit, value: 1000 }, fulfils: tag, previous: None, forward: None, batch: None, purchase: Some(Purchase { agreement: own, line: own }) });
            let a = w.everyday_act(&mut svc, mirs().money, 2, x.to_map(), None, None); w.add(&a) };
        let evidence = match ev {
            Ev::UseRecord => { let a = w.everyday_act(&mut relay, spec("a service's use record format"), 0, vec![(Value::Uint(0), Value::Text("served the fan".into()))], None, None); w.add(&a) }
            Ev::Delivery | Ev::WrongObject => {
                let object = if ev == Ev::Delivery { locked } else { spec("another object") };
                let a = w.everyday_act(&mut relay, transport, 0, vec![(Value::Uint(0), Value::Bytes(object.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![1; 32]))], None, None);
                w.add(&a)
            }
        };
        let mut valid = vec![(r, pointer)];
        if acked {
            let x = Fin::Claim(Claim { rail, proof: proof.clone(), payee: svc.id, amount: Amount { unit, value: 1000 }, fulfils: tag, disagrees: None, referral: None, refund: None, purchase: Some(Purchase { agreement: own, line: own }), previous: None });
            let a = w.everyday_act(&mut fan, mirs().money, 3, x.to_map(), None, Some(vec![evidence]));
            valid.push((w.add(&a), pointer));
        }
        let rec = { let a = w.everyday_act(&mut meter, playmod, 0, vec![(Value::Uint(0), Value::Uint(7))], None, None); w.add(&a) };
        let mut payouts = vec![Payout { receiver: relay.id, amount: 100, role: Some("relay".into()), evidence: Some(evidence), ..Default::default() }];
        let (a_amt, b_amt) = match metric_to {
            Some(m) => {
                payouts.push(Payout { receiver: m, amount: 100, metric: Some(1), ..Default::default() });
                (400, 400)
            }
            None => (450, 450),
        };
        payouts.push(Payout { receiver: ana.id, amount: a_amt, stake: Some(0), owners: Some(own), ..Default::default() });
        payouts.push(Payout { receiver: ben.id, amount: b_amt, stake: Some(0), owners: Some(own), ..Default::default() });
        let s = Split { receipt: r, payouts, cmip: test_plan().cmip, publication: pubx, tally: None, number: Some(1), modules: vec![], metric_records: vec![rec], transfers: vec![] };
        let mut to = vec![ana.id, ben.id, dee.id, relay.id];
        if let Some(m) = metric_to {
            to.push(m);
        }
        to.sort();
        to.dedup();
        let sx = w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, to);
        let facts = Facts { rail_valid: valid, rail_payments: vec![(proof.clone(), b"the fan's payment".to_vec())], delivery_specs: vec![transport], ..Default::default() };
        (w, sx, facts)
    };
    let judged = |m: &[Hash], u: &[Hash], problems: &[&str]| {
        let mut m: Vec<String> = m.iter().map(|x| hx(x)).collect();
        m.sort();
        let mut u: Vec<String> = u.iter().map(|x| hx(x)).collect();
        u.sort();
        json!({ "mismatched": m, "unevidenced": u, "metric_problems": problems })
    };
    let ask_j = |s: &Hash| json!({ "question": "split judged", "act": hx(s) });
    let cases: Vec<(&str, &str, &str, bool, Ev, bool, Option<Hash>, J)> = vec![
        ("a relay's role share, its use record acknowledged in the payer's claim: evidenced", "Agreements rule 22", "The payer the payment commits to acknowledges the helper's record in its claim: the role share is filled.",
            false, Ev::UseRecord, true, None, judged(&[], &[], &[])),
        ("the same role share, its record acknowledged by no claim: evidence of nothing", "Agreements rule 22", "A helper's own record alone earns nothing: the payer's signature says it helped.",
            false, Ev::UseRecord, false, None, judged(&[], &[relay.id], &[])),
        ("a relay's delivery record naming the media the payment was for, acknowledged: evidenced", "Agreements rule 22; \"Publication (type 6)\": a delivery record counts where its object is the media of a bake the publication sells",
            "The relay transport cMIP's record names the bake's locked bytes, which the purchase paid for.", false, Ev::Delivery, true, None, judged(&[], &[], &[])),
        ("a relay's delivery record naming another object, acknowledged: evidence of nothing", "Agreements rule 22: the object it names is the one the payment was for",
            "The record names bytes the publication does not sell: it fills no role.", false, Ev::WrongObject, true, None, judged(&[], &[relay.id], &[])),
        ("a metric payout to a holder the owners' line pays nothing: one the plan already pays", "Agreements rule 30 (draft 24): \"already pays\", paid or not",
            "Dee holds one millionth of the stake: the owners' line pays her nothing on 800, yet a metric may pay her.", false, Ev::UseRecord, true, Some(dee.id), judged(&[], &[], &[])),
        ("a metric payout whose measurer is the split service: wrong", "Agreements rule 29: the measurer is never the split service",
            "The service measuring the metric it divides is what rule 29 forbids.", true, Ev::UseRecord, true, Some(dee.id), judged(&[], &[], &["no record of the metric's Module signed by its measurer is named (rule 29)", "the metric's measurer is the split service (rule 29)"])),
    ];
    for (name, rule, why, by_service, ev, acked, metric_to, v) in cases {
        let (mut w, sx, facts) = build(by_service, ev, acked, metric_to);
        out.case(&mut w, name, rule, why, facts, ask_j(&sx), v, None);
    }
}
