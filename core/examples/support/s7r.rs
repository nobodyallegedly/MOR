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

// ---------------------------------------------------------------- S7r-2: termination (F436.7, F436.8)

/// A test termination-terms cMIP (task 15), for the vectors only: never
/// shipped, never a default. Its parameters ([`test_termination_params`]):
/// a minimum term (key 0), a point on the publication's time reference
/// before which no terminating act counts; and the parties that may
/// terminate their own place (key 1). For a terminating act at or after
/// the point it answers met where the owners' side signed it, or where it
/// only drops the places of parties key 1 lists, each of them signing it;
/// otherwise, and before the point, not yet met. The vectors state its
/// answers as facts (`termination_answers`), as a verifier holding it
/// would compute them from the act's place on the time reference.
fn test_termination_cmip() -> Hash {
    spec("a test termination-terms cMIP, for the vectors only (S7r-2), never a default")
}

fn test_termination_params(min: u64, own: &[Hash]) -> Value {
    Value::Map(vec![
        (Value::Uint(0), Value::Uint(min)),
        (Value::Uint(1), Value::Array(own.iter().map(|h| Value::Bytes(h.to_vec())).collect())),
    ])
}

/// The test cMIP's answer: `point` is the act's place on the time
/// reference; `owners` whether the owners' side signed it; `own` whether
/// it only drops places of parties key 1 lists, each signing it.
fn test_termination_answer(min: u64, point: u64, owners: bool, own: bool) -> bool {
    point >= min && (owners || own)
}

/// A publication act carrying field 13, the termination terms.
fn publication_with_terms(w: &mut World, by: &mut Person, p: &Publication, terms: Option<(Hash, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let mut m = p.to_map();
    if let Some((h, params)) = terms {
        m.push((Value::Uint(13), Value::Array(vec![Value::Bytes(h.to_vec()), params])));
    }
    ag_act(w, by, agreements::types::PUBLICATION, m, objects)
}

/// 7.7b to 7.7d: a publication whose termination terms set a minimum term
/// and let its partner, a label, terminate its own place; a reader without
/// their cMIP; and, under 7.7's default, a partner alone.
pub fn termination(out: &mut Out) {
    const MIN: u64 = 100;
    let cmip = test_termination_cmip();
    let mut w = World::new();
    let mut ana = w.genesis("ana, of the third group", vec![own_home()], None, None);
    let mut ben = w.genesis("ben, of the third group", vec![own_home()], None, None);
    let mut label = w.genesis("a label, partner for visibility", vec![own_home()], None, None);
    let mut s = w.genesis("the third group's split service", vec![own_home()], None, None);
    let work = spec("a song, step 7.7b");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The third group's song: Ana and Ben, half each.".into();
    owning(&mut t, c, &[(ana.id, 500_000), (ben.id, 500_000)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &own);
    sign(&mut w, &mut ben, &own);
    let bake = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec()))]), None, None); w.add(&a) };
    let mut v1 = publication_of(own, s.id, vec![Partner { identity: label.id, share: 150_000, label: Some("label".into()) }], vec![agreements::Sold::Bake(bake)], test_plan());
    v1.time = Some((spec("a block-height time reference"), Value::Null));
    let terms = Some((cmip, test_termination_params(MIN, &[label.id])));
    let p1 = publication_with_terms(&mut w, &mut ana, &v1, terms.clone(), obj(own));
    sign(&mut w, &mut ben, &p1);
    sign(&mut w, &mut label, &p1);
    sign(&mut w, &mut s, &p1);
    let base = w.log.clone();
    let later = |w: &mut World, by: &mut Person, p: &Publication| publication_with_terms(w, by, p, terms.clone(), Some(vec![Object { chain: p1, predecessor: p1 }, Object { chain: own, predecessor: own }]));
    let stated = |x: Hash, met: bool| Facts { termination_answers: vec![(x, cmip, met)], ..Default::default() };
    let mut ending = v1.clone();
    ending.sold = Some(vec![]);

    // 7.7b: before the point, the owners' side alone ends it: not yet met.
    let mut w1 = replay(&base);
    let early = later(&mut w1, &mut ana.clone(), &ending);
    sign(&mut w1, &mut ben.clone(), &early);
    let met = test_termination_answer(MIN, 60, true, false);
    out.case(&mut w1, "7.7b the owners' side alone ends a publication before its termination terms' minimum term: not yet met, the version does not count", "Agreements, \"Termination\"; task 15",
        "The act sits at point 60 on the time reference, before the minimum term at 100: the termination terms answer not yet met, so the terminating act does not count.",
        stated(early, met), ask("publication", &early), json!({ "counts": false, "ends": true }), None);
    out.case(&mut w1, "7.7b the same act read as a termination: the publication and every place in it stay active", "Agreements, \"Termination\"",
        "A terminating act that does not count terminates nothing.",
        stated(early, met), ask("termination", &early),
        json!({ "counts": false, "publication": "active", "places": places(&[label.id, s.id], "active") }), None);
    out.case(&mut w1, "7.7b the version before it still counts: sales under it stand", "Agreements rule 11; \"Termination\": what stands",
        "A purchase under any version counts; the version the act would have ended still sells.",
        stated(early, met), ask("publication", &p1), json!({ "counts": true, "ends": false }), None);
    // After the point: met, it counts, the publication terminated.
    let mut w2 = replay(&base);
    let end = later(&mut w2, &mut ana.clone(), &ending);
    sign(&mut w2, &mut ben.clone(), &end);
    let met = test_termination_answer(MIN, 140, true, false);
    out.case(&mut w2, "7.7b after the minimum term the owners' side alone ends it: met, it counts, the publication terminated", "Agreements, \"Termination\"; rule 11",
        "At point 140, past the minimum term, the termination terms answer met for the owners' side's terminating act.",
        stated(end, met), ask("termination", &end),
        json!({ "counts": true, "publication": "terminated", "places": places(&[label.id, s.id], "terminated") }), None);
    // 7.7c: a reader without the cMIP: unknown from the act on.
    out.case(&mut w2, "7.7c a reader without the termination terms' cMIP reads the terminating act: unknown", "Agreements, \"Termination\"; rule 35",
        "It holds no answer of the cMIP: whether the act counts is unknown, never active by default.",
        Facts::default(), ask("publication", &end), json!("unknown"), None);
    out.case(&mut w2, "7.7c the same reader: the publication's state unknown from that act on, never active, never terminated", "Agreements, \"Termination\"",
        "Unknown from the terminating act on; the version before it still counts.",
        Facts::default(), ask("termination", &end),
        json!({ "counts": "unknown", "publication": "unknown", "places": places(&[label.id, s.id], "unknown") }), None);
    out.case(&mut w2, "7.7c the same reader: the version before the act still counts", "Agreements rule 11",
        "Only what the terminating act would end is unknown.",
        Facts::default(), ask("publication", &p1), json!({ "counts": true, "ends": false }), None);
    // 7.7b, a place: the owners' side alone drops the label, before and
    // after the minimum term.
    let mut dropped = v1.clone();
    dropped.partners = vec![];
    let mut w5 = replay(&base);
    let drop_early = later(&mut w5, &mut ana.clone(), &dropped);
    sign(&mut w5, &mut ben.clone(), &drop_early);
    let met = test_termination_answer(MIN, 60, true, false);
    out.case(&mut w5, "7.7b the owners' side alone drops the label before the minimum term: not yet met, the label's place stays active", "Agreements, \"Termination\"; rule 11",
        "The minimum term protects the label's place as it protects the publication.",
        stated(drop_early, met), ask("termination", &drop_early),
        json!({ "counts": false, "publication": "active", "places": places(&[label.id], "active") }), None);
    let mut w6 = replay(&base);
    let drop_late = later(&mut w6, &mut ana.clone(), &dropped);
    sign(&mut w6, &mut ben.clone(), &drop_late);
    let met = test_termination_answer(MIN, 140, true, false);
    out.case(&mut w6, "7.7b the owners' side alone drops the label after the minimum term: met, the label's place terminated, the publication active", "Agreements, \"Termination\"; rule 11",
        "Past the point the default stands: the owners' side terminates the label's place; its part falls to the owners' line.",
        stated(drop_late, met), ask("termination", &drop_late),
        json!({ "counts": true, "publication": "active", "places": places(&[label.id], "terminated") }), None);
    out.case(&mut w6, "7.7c a reader without the cMIP reads the owners' side dropping the label: unknown for the label's place, the publication active", "Agreements, \"Termination\"; rule 35",
        "The act terminates a place, never the publication: only that place's state is unknown from it on.",
        Facts::default(), ask("termination", &drop_late),
        json!({ "counts": "unknown", "publication": "active", "places": places(&[label.id], "unknown") }), None);

    // 7.7d: the label terminates its own place, as the terms let it.
    let mut alone = v1.clone();
    alone.partners = vec![];
    let mut w3 = replay(&base);
    let leave = later(&mut w3, &mut label.clone(), &alone);
    let met = test_termination_answer(MIN, 150, false, true);
    out.case(&mut w3, "7.7d after the minimum term the label alone drops itself from field 2: met, its place terminated, the publication active", "Agreements, \"Termination\": termination terms may widen who terminates",
        "The terms let the label terminate its own place; its part falls to the owners' line from the next payment.",
        stated(leave, met), ask("termination", &leave),
        json!({ "counts": true, "publication": "active", "places": places(&[label.id], "terminated") }), None);
    let mut w4 = replay(&base);
    let leave_early = later(&mut w4, &mut label.clone(), &alone);
    let met = test_termination_answer(MIN, 70, false, true);
    out.case(&mut w4, "7.7d the same version by the label before the minimum term: not yet met, it does not count", "Agreements, \"Termination\"",
        "Before the point the terms let no termination count.",
        stated(leave_early, met), ask("termination", &leave_early),
        json!({ "counts": false, "publication": "active", "places": places(&[label.id], "active") }), None);

    // 7.7d, the default: no termination terms, a partner alone.
    let mut w = World::new();
    let mut ana = w.genesis("ana, of the second group", vec![own_home()], None, None);
    let mut ben = w.genesis("ben, of the second group", vec![own_home()], None, None);
    let mut label = w.genesis("a partner without terms", vec![own_home()], None, None);
    let mut s = w.genesis("the second group's split service", vec![own_home()], None, None);
    let work = spec("a song, step 7.7d");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The second group's song: Ana and Ben, half each.".into();
    owning(&mut t, c, &[(ana.id, 500_000), (ben.id, 500_000)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &own);
    sign(&mut w, &mut ben, &own);
    let bake = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec()))]), None, None); w.add(&a) };
    let v1 = publication_of(own, s.id, vec![Partner { identity: label.id, share: 100_000, label: None }], vec![agreements::Sold::Bake(bake)], test_plan());
    let p1 = ag_act(&mut w, &mut ana, agreements::types::PUBLICATION, v1.to_map(), obj(own));
    sign(&mut w, &mut ben, &p1);
    sign(&mut w, &mut label, &p1);
    sign(&mut w, &mut s, &p1);
    let mut alone = v1.clone();
    alone.partners = vec![];
    let objs = Some(vec![Object { chain: p1, predecessor: p1 }, Object { chain: own, predecessor: own }]);
    let mut wd = replay(&w.log.clone());
    let by_partner = ag_act(&mut wd, &mut label.clone(), agreements::types::PUBLICATION, alone.to_map(), objs.clone());
    out.case(&mut wd, "7.7d with no termination terms, a partner alone drops itself: it does not count, the default being the owners' side's", "Agreements, \"Termination\": the defaults, by kind; rule 11",
        "Without termination terms, only the owners' side terminates another party's place, or its own.",
        Facts::default(), ask("termination", &by_partner),
        json!({ "counts": false, "publication": "active", "places": places(&[label.id], "active") }), None);
    let by_owners = ag_act(&mut w, &mut ana, agreements::types::PUBLICATION, alone.to_map(), objs);
    sign(&mut w, &mut ben, &by_owners);
    out.case(&mut w, "7.7d with no termination terms, the owners' side alone drops the partner: it counts, the partner's place terminated", "Agreements, \"Termination\"; rule 11",
        "The owners' side terminates alone any other party's place; the partner's part falls to the owners' line.",
        Facts::default(), ask("termination", &by_owners),
        json!({ "counts": true, "publication": "active", "places": places(&[label.id], "terminated") }), None);

    // Field 36: a deal's termination terms; a collective names none; field
    // 2's task 15, where present, names the same cMIP.
    let invalid = |x: &Hash| json!({ "question": "agreement invalid", "act": hx(x) });
    let mut w = World::new();
    let mut ana = w.genesis("ana, with notice terms", vec![own_home()], None, None);
    let ben = w.genesis("ben, with notice terms", vec![own_home()], None, None);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "A deal naming termination terms: a notice.".into();
    t.termination = Some((cmip, test_termination_params(30, &[])));
    let ok = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    out.case(&mut w, "a deal naming termination terms (field 36): not invalid", "Agreements, \"Termination\"; \"Terms (type 0)\"",
        "A deal may name termination terms, a cMIP and its parameters, as field 6 names a time reference.", Facts::default(), invalid(&ok), json!("not invalid"), None);
    let mut t2 = t.clone();
    t2.cmips.push((agreements::TERMINATION_TERMS_TASK, spec("another termination-terms cMIP")));
    let bad = ag_act(&mut w, &mut ana, agreements::types::TERMS, t2.to_map(), None);
    out.case(&mut w, "a deal whose field 36 and field 2's task 15 name different cMIPs: invalid", "Agreements, \"Terms (type 0)\"",
        "Where both name the termination terms' cMIP, they name the same specification.", Facts::default(), invalid(&bad), json!("invalid"), None);
    let ids = [ana.id, ben.id, spec("a third member")];
    let mut c = collective_terms(&ids, spec("an authority"), spec("a keeper"), vec![ids[1]], 1);
    c.termination = Some((cmip, test_termination_params(30, &[])));
    let col = ag_act(&mut w, &mut ana, agreements::types::TERMS, c.to_map(), None);
    out.case(&mut w, "a collective's terms naming termination terms: invalid", "Agreements, \"Termination\": a collective names no termination terms",
        "A collective's agreement ends as rule 91 says, a member's place as rule 70 says; no termination terms reach either.", Facts::default(), invalid(&col), json!("invalid"), None);
}

/// 1.9i: a deal with a notice term (F436.9). The deal's termination terms
/// (field 36) are the test cMIP of 7.7b, its key 0 here the point on the
/// deal's time reference where the notice's period ends; its answers are
/// stated as facts, as a verifier holding it would compute them from the
/// block the marked clone names. A clone terminates only where it carries
/// the termination mark (field 37); the terms are asked about no other.
pub fn deal_termination(out: &mut Out) {
    use agreements::Terminates;
    const NOTICE_ENDS: u64 = 120;
    let cmip = test_termination_cmip();
    let mut w = World::new();
    let mut ana = w.genesis("ana, of the second film", vec![own_home()], None, None);
    let mut ben = w.genesis("ben, of the second film", vec![own_home()], None, None);
    let work = spec("a second film, step 1.9i");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The second film: Ana and Ben, half each; either may end it on notice.".into();
    owning(&mut t, c, &[(ana.id, 500_000), (ben.id, 500_000)]);
    t.time = Some((spec("a block-height time reference"), Value::Null));
    t.termination = Some((cmip, test_termination_params(NOTICE_ENDS, &[])));
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let base = w.log.clone();
    let clone = |text: &str, mark: Option<Terminates>| {
        let mut x = t.clone();
        x.parent = Some(d);
        x.text = text.into();
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        x.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        x.terminates = mark;
        x
    };
    let both = |w: &mut World, x: &Terms| {
        let k = ag_act(w, &mut ana.clone(), agreements::types::TERMS, x.to_map(), obj(d));
        sign(w, &mut ana.clone(), &k);
        sign(w, &mut ben.clone(), &k);
        k
    };
    let stated = |x: Hash, met: bool| Facts { termination_answers: vec![(x, cmip, met)], ..Default::default() };
    let ending = clone("The second film's deal ends: each keeps its half; nothing more is owed.", Some(Terminates::Deal));
    let mut everyone = vec![ana.id, ben.id];
    everyone.sort();

    // Before the notice's period has run: not yet met.
    let mut w1 = replay(&base);
    let early = both(&mut w1, &ending);
    let met = test_termination_answer(NOTICE_ENDS, 80, true, false);
    out.case(&mut w1, "1.9i a deal's marked clone, every party signing, before its notice has run: not yet met, it does not count, the deal active", "Agreements rule 47, \"Termination\"; terms field 37",
        "The clone carries the termination mark naming the deal; it names a block at point 80, before the notice ends at 120: the termination terms answer not yet met.",
        stated(early, met), ask("termination", &early),
        json!({ "counts": false, "deal": "active", "places": places(&everyone, "active") }), None);
    // After it: met, the deal terminated.
    let mut w2 = replay(&base);
    let late = both(&mut w2, &ending);
    let met = test_termination_answer(NOTICE_ENDS, 150, true, false);
    out.case(&mut w2, "1.9i the same marked clone after the notice has run: met, it counts, the deal terminated", "Agreements rule 47, \"Termination\"; terms field 37",
        "At point 150, past the notice's end, the termination terms answer met: the deal and every party's place are terminated, everything owed before still owed.",
        stated(late, met), ask("termination", &late),
        json!({ "counts": true, "deal": "terminated", "places": places(&everyone, "terminated") }), None);
    out.case(&mut w2, "1.9i a reader without the termination terms' cMIP reads the marked clone: unknown from it on", "Agreements, \"Termination\"; rule 35",
        "It holds no answer of the cMIP: whether the clone counts is unknown, never active by default.",
        Facts::default(), ask("termination", &late),
        json!({ "counts": "unknown", "deal": "unknown", "places": places(&everyone, "unknown") }), None);
    out.case(&mut w2, "1.9i the same reader asks whether the marked clone exists: unknown", "Agreements rule 47; \"Termination\"",
        "A marked clone of a deal naming termination terms counts only when they answer met; without their answer, unknown.",
        Facts::default(), json!({ "question": "agreement exists", "act": hx(&late) }), json!("unknown"), None);

    // A clone without the mark, stating that nothing more is owed.
    let mut w3 = replay(&base);
    let plain = both(&mut w3, &clone("The second film: no further obligations between Ana and Ben.", None));
    out.case(&mut w3, "1.9i a clone without the termination mark stating no further obligations: no terminating act, the deal active", "Agreements rule 47, \"Termination\": a clone without the mark terminates nothing",
        "Termination is what the parties say, never inferred from a clone's content: the termination terms are not asked.",
        Facts::default(), ask("termination", &plain),
        json!({ "counts": false, "deal": "active", "places": {} }), None);
    out.case(&mut w3, "1.9i the unmarked clone is a version of the deal like any other: it exists once complete", "Agreements rule 47",
        "Every party signed it; no termination terms are asked of an unmarked clone.",
        Facts::default(), json!({ "question": "agreement exists", "act": hx(&plain) }), json!("exists"), None);

    // A place: the mark names Ben's place, Ben no longer listed.
    let mut w4 = replay(&base);
    let mut leaving = clone("Ben leaves the second film's deal, keeping his half.", Some(Terminates::Places(vec![ben.id])));
    leaving.parties = vec![ana.id];
    let ben_out = both(&mut w4, &leaving);
    let met = test_termination_answer(NOTICE_ENDS, 150, true, false);
    out.case(&mut w4, "1.9i a marked clone naming one party's place, after the notice: that place terminated, the deal active", "Agreements, \"Termination\"; terms field 37",
        "The mark names Ben's place; the clone no longer lists him. Ben keeps what he holds (rule 98.2).",
        stated(ben_out, met), ask("termination", &ben_out),
        json!({ "counts": true, "deal": "active", "places": places(&[ben.id], "terminated") }), None);

    // The mark's format.
    let invalid = |x: &Hash| json!({ "question": "agreement invalid", "act": hx(x) });
    // F436.10: the clone of the one-place case above (Ben's place marked,
    // counting as the mark says), here without the mark: invalid.
    let mut w8 = replay(&base);
    let mut dropped = clone("Ben leaves the second film's deal, keeping his half.", None);
    dropped.parties = vec![ana.id];
    let ben_dropped = both(&mut w8, &dropped);
    out.case(&mut w8, "1.9i a clone leaving out a party of the parent without the termination mark: invalid", "Agreements rule 47; \"Terms (type 0)\": the termination mark (F436.10)",
        "The clone no longer lists Ben and carries no mark naming his place: nothing is removed silently.",
        Facts::default(), invalid(&ben_dropped), json!("invalid"), None);
    let mut w5 = replay(&base);
    let still = both(&mut w5, &clone("Ben's place ended, yet Ben still listed.", Some(Terminates::Places(vec![ben.id]))));
    out.case(&mut w5, "a mark naming a party the clone still lists: invalid", "Agreements, \"Terms (type 0)\": the termination mark",
        "Each place the mark names is a party of the parent and none of the clone.", Facts::default(), invalid(&still), json!("invalid"), None);
    let stranger = spec("someone who is no party");
    let mut w6 = replay(&base);
    let odd = both(&mut w6, &clone("A place that was never in the deal.", Some(Terminates::Places(vec![stranger]))));
    out.case(&mut w6, "a mark naming someone who is no party of the parent: invalid", "Agreements, \"Terms (type 0)\": the termination mark",
        "Only a party of the parent has a place to terminate.", Facts::default(), invalid(&odd), json!("invalid"), None);
    let mut w7 = replay(&base);
    let mut f = t.clone();
    f.text = "Founding terms carrying the termination mark.".into();
    f.terminates = Some(Terminates::Deal);
    let founding = ag_act(&mut w7, &mut ana.clone(), agreements::types::TERMS, f.to_map(), None);
    out.case(&mut w7, "founding terms carrying the termination mark: invalid", "Agreements, \"Terms (type 0)\": the termination mark",
        "The mark appears only in a deal's clone.", Facts::default(), invalid(&founding), json!("invalid"), None);
    let ok = ag_act(&mut w7, &mut ana.clone(), agreements::types::TERMS, ending.to_map(), obj(d));
    out.case(&mut w7, "a deal's clone carrying the termination mark naming the deal, drafted: not invalid", "Agreements, \"Terms (type 0)\": the termination mark",
        "`[0]`, the deal, in a deal's clone; one party has drafted it, the other not yet signed.", Facts::default(), invalid(&ok), json!("not invalid"), None);
    let mut wc = World::new();
    let mut x = wc.genesis("x, of a collective", vec![own_home()], None, None);
    let ids = [x.id, spec("a second member"), spec("a third member")];
    let mut ct = collective_terms(&ids, spec("an authority"), spec("a keeper"), vec![ids[1]], 1);
    ct.parent = Some(spec("a collective's agreement before"));
    ct.terminates = Some(Terminates::Deal);
    let col = ag_act(&mut wc, &mut x, agreements::types::TERMS, ct.to_map(), None);
    out.case(&mut wc, "a collective's terms carrying the termination mark: invalid", "Agreements, \"Terms (type 0)\": the termination mark; \"Termination\"",
        "A collective's agreement ends as rule 91 says, a member's place as rule 70 says; the mark is a deal's.", Facts::default(), invalid(&col), json!("invalid"), None);
}

/// Places, each with `state`, as [`termination_json`] writes them.
fn places(xs: &[Hash], state: &str) -> J {
    let m: serde_json::Map<String, J> = xs.iter().map(|x| (hx(x), json!(state))).collect();
    J::Object(m)
}

/// 3.7bb and 3.7bc: holders who are no party, declared absent only under
/// the clause that bound them: a buyer, by the version in force where the
/// line placed its transfer (F436.6 D); a stake successor, by the clause
/// that bound the holder it succeeded (F437.1, decided in F436.8).
pub fn outside_holders(out: &mut Out) {
    use agreements::{AbsenceDeclaration, Record, Resignation, SuccessionPlan};
    let both = |t: &mut Terms| {
        if let Some(a) = t.abandonment.as_mut() {
            a.outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
        }
    };
    let record = |w: &mut World, by: &mut Person, f: Hash, r: Record| {
        let a = w.everyday_act(by, mirs().agreements, agreements::types::RECORD, r.to_map(), obj(f), None);
        w.add(&a)
    };
    let declare = |w: &mut World, by: &mut Person, f: Hash, agreement: Hash, clause: Hash, party: Hash, outs: Vec<u64>| {
        ag_act(w, by, agreements::types::DECLARATION, AbsenceDeclaration { agreement, clause, party, outcomes: outs }.to_map(), { let _ = f; obj(agreement) })
    };

    // 3.7bb: a buyer of a tenth of the label's stake in itself.
    let mut w = World::new();
    let (mut col, mut authority) = super::scenario9::band(&mut w, "a label with an outside buyer", &|t, _| both(t));
    let (f, cid) = (col.founding, col.id);
    let mut buyer = w.genesis("a buyer of a tenth of the label", vec![own_home()], None, None);
    let mut friend = w.genesis("a judge friendlier to the members", vec![own_home()], None, None);
    let friend_id = friend.id;
    let tr = StakeTransfer { agreement: f, stake: 0, to: buyer.id, share: 100_000, record: vec![] };
    let x = ag_act(&mut w, &mut col.m[0], agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(f));
    sign(&mut w, &mut buyer, &x);
    w.chain_sign(&col.m[0], x);
    let placed = record(&mut w, &mut col.m[1].acting_for(cid, vec![cid]), f, Record { clone: None, signatures: None, registers: Some(vec![x]) });
    let (ana_id, buyer_id) = (col.m[0].id, buyer.id);
    let (k, sigs) = super::scenario9::clone_of(&mut w, &mut col, f, vec![(agreements::Power::Constitutional, vec![0, 1, 2]), (agreements::Power::Judicial, vec![0, 1, 2])], &[0, 1, 2], vec![placed], &|t| {
        if let Some(a) = t.abandonment.as_mut() {
            a.authority = Authority::Named(friend_id);
        }
        t.grammar.as_mut().unwrap().recovery = Some(Recovery::Escrow { authority: friend_id });
        let st = &mut t.stakes.as_mut().unwrap()[0];
        for (h, n) in st.holders.iter_mut() {
            if *h == agreements::Who::Id(ana_id) {
                *n -= 100_000;
            }
        }
        st.holders.push((agreements::Who::Id(buyer_id), 100_000));
    });
    w.rotate(&col.chain, Rot { declarations: Some(vec![agreements::clone_declaration(&mirs().agreements, &k, &sigs)]), ..Default::default() });
    let by_member = declare(&mut w, &mut friend, f, k, k, buyer_id, vec![outcomes::STAKE_REDISTRIBUTED]);
    out.case(&mut w, "3.7bb the judge the new clause names declares the buyer absent, field 1 the latest version: counts for nothing", "Agreements rules 85 and 87 (draft 24)",
        "A holder that bought in is judged under the clause of the version in force where the line placed its transfer, the founding here; field 1 must name it.",
        Facts::default(), ask("declaration", &by_member), json!("counts for nothing"), None);
    let by_keeper = declare(&mut w, &mut authority, f, k, f, buyer_id, vec![outcomes::STAKE_REDISTRIBUTED]);
    out.case(&mut w, "3.7bb the authority of the clause the buyer accepted declares it, field 1 that version: counts", "Agreements rules 85 and 87",
        "The clause the buyer accepted applies: its authority, its outcomes.",
        Facts::default(), ask("declaration", &by_keeper), json!("counts"), None);

    // 3.7bc: Cy resigns, its plan naming a stake successor; the clause
    // changes after; its stake passes; the successor is judged under the
    // clause that bound Cy.
    let mut w = World::new();
    let heir = w.genesis("cy's stake successor", vec![own_home()], None, None);
    let heir_id = heir.id;
    let mut friend = w.genesis("a judge the remaining members prefer", vec![own_home()], None, None);
    let friend_id = friend.id;
    let (mut col, mut authority) = super::scenario9::band(&mut w, "a label whose founder resigns", &|t, ids| {
        both(t);
        t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: ids.to_vec() };
        t.succession = Some(vec![SuccessionPlan { party: ids[2], stakes: Some(vec![(heir_id, 1_000_000)]), seats: None, entry: None }]);
    });
    let (f, cid) = (col.founding, col.id);
    let (ana_id, ben_id, cy_id) = (col.m[0].id, col.m[1].id, col.m[2].id);
    let res = ag_act(&mut w, &mut col.m[2], agreements::types::RESIGNATION, Resignation { agreement: f, area: None, drafts: vec![] }.to_map(), obj(f));
    let line = record(&mut w, &mut col.m[1].acting_for(cid, vec![cid]), f, Record { clone: None, signatures: None, registers: Some(vec![res]) });
    let keep = vec![ana_id, ben_id];
    let (k1, sigs) = super::scenario9::clone_of(&mut w, &mut col, f, vec![(agreements::Power::Constitutional, vec![0, 1]), (agreements::Power::Judicial, vec![0, 1])], &[0, 1], vec![line], &|t| {
        t.parties = keep.clone();
        t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
        t.departed = Some(vec![cy_id]);
        if let Some(a) = t.abandonment.as_mut() {
            a.authority = Authority::Named(friend_id);
        }
        t.grammar.as_mut().unwrap().recovery = Some(Recovery::Escrow { authority: friend_id });
    });
    let (rot, chain2) = w.rotate(&col.chain, Rot { declarations: Some(vec![agreements::clone_declaration(&mirs().agreements, &k1, &sigs)]), ..Default::default() });
    col.chain = chain2;
    let on_cy = declare(&mut w, &mut authority, f, k1, f, cy_id, vec![]);
    out.case(&mut w, "3.7bc Cy, departed, declared absent by the authority of the clause it last signed: counts, its stake passing by succession", "Agreements rules 85, 87 and 89",
        "A departed holder is judged by the clause of the version it last signed as a party, the founding; its plan names a stake successor, so no outcome is stated.",
        Facts::default(), ask("declaration", &on_cy), json!("counts"), None);
    let (k2, sigs2) = super::scenario9::clone_of(&mut w, &mut col, k1, vec![(agreements::Power::Constitutional, vec![0, 1])], &[0, 1], vec![rot], &|t| {
        let st = &mut t.stakes.as_mut().unwrap()[0];
        for (h, _) in st.holders.iter_mut() {
            if *h == agreements::Who::Id(cy_id) {
                *h = agreements::Who::Id(heir_id);
            }
        }
        t.departed = None;
        t.succession = None;
    });
    let (passes, _) = w.rotate(&col.chain, Rot { declarations: Some(vec![agreements::clone_declaration(&mirs().agreements, &k2, &sigs2)]), ..Default::default() });
    out.case(&mut w, "3.7bc the rotation declaring the clone, put in force under that declaration, that passes Cy's stake to its successor: valid", "Agreements rules 69, 83 and 89",
        "The stake passes by succession, as Cy's plan says; Cy's signature is not needed.", Facts::default(), ask_status(&passes), json!("valid"), None);
    let by_member = declare(&mut w, &mut friend, f, k2, k2, heir_id, vec![outcomes::STAKE_REDISTRIBUTED]);
    out.case(&mut w, "3.7bc the judge the clause names since Cy's resignation declares the successor absent, field 1 the latest version: counts for nothing", "Agreements rule 85: a stake passes with the clause that bound its holder",
        "The successor is judged under the clause that bound Cy, carried through the succession: the founding's, not one changed after Cy left.",
        Facts::default(), ask("declaration", &by_member), json!("counts for nothing"), None);
    let by_keeper = declare(&mut w, &mut authority, f, k2, f, heir_id, vec![outcomes::STAKE_REDISTRIBUTED]);
    out.case(&mut w, "3.7bc the authority of the clause that bound Cy declares the successor absent, field 1 that version: counts", "Agreements rules 85 and 87",
        "Whatever the holder held is what passed: the clause included.",
        Facts::default(), ask("declaration", &by_keeper), json!("counts"), None);
}
