//! Roadmap step 13, the split Module (F249, F250): a payment divided among
//! test identities, exactly, each share paid and receipted, and every
//! participant's check ("agreement condition triggered (purchase) where is
//! my cut at my flow address (or vault if needed)") answered by the core.
//!
//! A fan buys a publication. The publication's agreement (the label and
//! the work's agreement) has its split service P; the work's agreement
//! (Ana and Ben) designates its split service S (field 14) and names a
//! backup T (field 29), with this cMIP's failure condition. P's attempt to
//! pay S gets no payment request within the wait: T receives the work's
//! share, splits it, and Ana and Ben each receipt their cut at their own
//! flow address. The next payment starts again from S.

#[path = "../../../core/tests/common/mod.rs"]
mod common;

use common::{own_home, publication, schnorr, signing_key, Person, World};
use mor_core::act::Object;
use mor_core::agreements::{
    self, AgreementsView, Backups, Field4, Grant, Mirs, Rule, ServiceGrants, ShareRule, Split, SplitPlan, Stake, Terms,
    Unfilled, Who,
};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{Amount, PaidAt, Payer, Payload as Fin, PayeePointer, Purchase, Rail, Receipt};
use mor_split::{route, Attempt, Failure, Route};

fn mirs() -> Mirs {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mirs {
        identity: common::identity_spec(),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: t("FINANCE"),
        agreements: t("LAW"),
        development: t("PRODUCTION"),
    }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object { chain: x, predecessor: x }])
}

fn agreements_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mirs().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    agreements_act(w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), obj(*x))
}

/// `by`'s grant to the split service `svc`, naming "this agreement" (F129,
/// H4), accepted by the service; with the strand `by`'s grant key signs on.
fn grant(w: &mut World, by: &mut Person, svc: &mut Person, tag: &str) -> (Hash, Person) {
    let sid = svc.id;
    let k = schnorr(&format!("{sid:?} for {tag}, step 13/grant"), 0);
    let g = Grant {
        grantee: sid,
        scope: 1,
        agreements: None,
        this_agreement: true,
        limits: None,
        limits_cmip: None,
        area: None,
        kinds: None,
        reinstates: None,
        by_this: false,
        key: signing_key(&k),
    };
    let gh = agreements_act(w, by, agreements::types::GRANT, g.to_map(), None);
    sign(w, svc, &gh);
    let mut s = by.clone();
    s.binding = gh;
    s.sign = k;
    s.seq = vec![];
    s.cite = Some((by.id, vec![gh]));
    (gh, s)
}

/// `who`'s payee pointer, one address on one rail Module: its flow address.
fn pointer(w: &mut World, who: &mut Person) -> Hash {
    let p = Fin::PayeePointer(PayeePointer {
        payee: who.id,
        version: 1,
        previous: None,
        rails: vec![Rail { module: spec("a rail Module"), address: format!("{}'s node", who.name).into_bytes() }],
    });
    let a = w.everyday_act(who, mirs().money, 0, p.to_map(), None, None);
    w.add(&a)
}

/// A receipt signed by `by` (a person, or a grant key's strand).
#[allow(clippy::too_many_arguments)]
fn receipt(w: &mut World, by: &mut Person, payee: Hash, payer: Hash, value: u64, fulfils: Hash, purchase: Option<Hash>, proof: &str) -> Hash {
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: proof.as_bytes().to_vec(),
        payer: Some(Payer::Identity(payer)),
        payee,
        amount: Amount { unit: spec("a unit"), value },
        fulfils,
        previous: None,
        forward: None,
        batch: None,
        purchase: purchase.map(|a| Purchase { agreement: a, line: a }),
    });
    let a = w.everyday_act(by, mirs().money, 2, r.to_map(), None, None);
    w.add(&a)
}

fn plan() -> SplitPlan {
    SplitPlan {
        shares: vec![ShareRule::Stake { stake: 0, part: 1_000_000 }],
        cmip: mor_split::spec(),
        unfilled: Unfilled::Stakes,
        top: vec![],
        service_bears_rail_fees: false,
        max_rail_fee: None,
        params: None,
        metrics: vec![],
    }
}

/// A deal's terms: every party signs it and every clone of it (F107).
fn deal(parties: Vec<Hash>, words: &str) -> Terms {
    Terms {
        parties,
        text: words.into(),
        cmips: vec![(6, spec("a payment cMIP")), (8, mor_split::spec())],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: None,
        parent: None,
        grammar: None,
        arbitrators: None,
        split_grant: None,
        payee_grants: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: None,
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: Some(plan()),
        refund: None,
        fees: None,
        backups: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    }
}

/// The service's split of `incoming` under `agreement`, as this cMIP
/// divides it, a holder that is an agreement paid at `receiver`; private,
/// delivered to every receiver (Q9).
fn split(w: &mut World, svc: &mut Person, incoming: Hash, amount: u64, agreement: Hash, receiver: &dyn Fn(&Hash) -> Hash) -> Hash {
    let t = AgreementsView::new(&w.v, mirs()).terms(&agreement).unwrap();
    let d = mor_split::divide(amount, &t, None, &|_| vec![]).unwrap();
    let payouts: Vec<agreements::Payout> = d.payouts.into_iter().map(|p| agreements::Payout { receiver: receiver(&p.receiver), ..p }).collect();
    assert_eq!(payouts.iter().map(|p| p.amount).sum::<u64>(), amount, "the split balances to the unit");
    let mut to: Vec<Hash> = payouts.iter().map(|p| p.receiver).collect();
    to.sort();
    to.dedup();
    let s = Split {
        receipt: incoming,
        payouts,
        cmip: mor_split::spec(),
        agreement,
        tally: Some(d.tally),
        number: Some(1),
        modules: vec![],
        metric_records: vec![],
        transfers: vec![],
    };
    w.private_act(svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, to)
}

#[test]
fn a_payment_is_split_exactly_each_cut_reaching_its_flow_address_through_a_backup() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut svc_p = w.genesis("the publication's split service P", vec![own_home()], None, None);
    let mut svc_s = w.genesis("the work's split service S", vec![own_home()], None, None);
    let mut svc_t = w.genesis("the work's backup T", vec![own_home()], None, None);
    let fan = spec("a fan");
    let (aid, bid, lid, sid, tid) = (ana.id, ben.id, label.id, svc_s.id, svc_t.id);
    let pa = pointer(&mut w, &mut ana);
    let pb = pointer(&mut w, &mut ben);
    let pl = pointer(&mut w, &mut label);

    // The work's agreement: Ana 60%, Ben 40%; S designated (field 14), T
    // its backup (field 29), with this cMIP's failure condition, all
    // signed with the terms (F250; H6's grants per payee).
    let (gas, _) = grant(&mut w, &mut ana, &mut svc_s, "ana to S");
    let (gbs, _) = grant(&mut w, &mut ben, &mut svc_s, "ben to S");
    let (gat, _) = grant(&mut w, &mut ana, &mut svc_t, "ana to T");
    let (gbt, _) = grant(&mut w, &mut ben, &mut svc_t, "ben to T");
    let work = spec("a song, step 13");
    let mut wt = deal(vec![aid, bid], "Ana and Ben's song.");
    wt.payee_grants = Some(vec![gas, gbs]);
    wt.backups = Some(Backups { services: vec![ServiceGrants::PerPayee(vec![gat, gbt])], failure: Some(Failure { wait: 60 }.to_value()) });
    wt.stakes = Some(vec![Stake { object: Who::Id(work), holders: vec![(Who::Id(aid), 600_000), (Who::Id(bid), 400_000)] }]);
    assert_eq!(wt.check(&mirs()), Ok(()));
    let we = agreements_act(&mut w, &mut ana, agreements::types::TERMS, wt.to_map(), None);
    sign(&mut w, &mut ana, &we);
    sign(&mut w, &mut ben, &we);

    // The publication's agreement: the work's agreement 85%, the label 15%,
    // split by P.
    let publication = {
        let x = w.everyday_act(&mut label, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec())), (Value::Uint(2), Value::Bytes(spec("locked, step 13").to_vec()))]), None, None);
        w.add(&x)
    };
    let (gl, mut sl) = grant(&mut w, &mut label, &mut svc_p, "the label to P");
    let mut pt = deal(vec![we, lid], "The label publishes the song.");
    pt.payee_grants = Some(vec![gl]);
    pt.stakes = Some(vec![Stake { object: Who::Id(publication), holders: vec![(Who::Id(we), 850_000), (Who::Id(lid), 150_000)] }]);
    assert_eq!(pt.check(&mirs()), Ok(()));
    let pe = agreements_act(&mut w, &mut label, agreements::types::TERMS, pt.to_map(), None);
    sign(&mut w, &mut label, &pe);
    sign(&mut w, &mut ana, &pe);
    sign(&mut w, &mut ben, &pe);
    {
        let v = AgreementsView::new(&w.v, mirs());
        assert_eq!(v.agreement(&we).unwrap().exists, Some(true));
        assert_eq!(v.agreement(&pe).unwrap().exists, Some(true));
        // The addresses the owners signed, in order: S, the designated
        // pointer (F248), then T.
        assert_eq!(v.signed_receivers(&we), vec![sid, tid]);
    }

    // The condition triggered: a fan buys the publication; P receipts it
    // in the label's name, by the label's grant key (F129, H4).
    let incoming = receipt(&mut w, &mut sl, lid, fan, 1000, publication, Some(pe), "the fan pays, 1");
    let c = AgreementsView::new(&w.v, mirs()).cut_check(&incoming, &aid).unwrap();
    assert!(!c.arrived() && c.stops.iter().any(|s| s.contains("no split")), "before any split, the cut is the service's open obligation: {c:?}");

    // P's attempt at S: no payment request within the wait. The cMIP says
    // the attempt failed; T is next.
    let services = AgreementsView::new(&w.v, mirs()).signed_receivers(&we);
    let failure = Failure::decode(wt.backups.as_ref().unwrap().failure.as_ref()).unwrap();
    let attempts = vec![Attempt::Silent { waited: 30 }];
    assert_eq!(route(&services, &attempts, &failure), Route::Try { at: 0, service: sid }, "before the wait has passed, S is still tried");
    let attempts = vec![Attempt::Silent { waited: 90 }, Attempt::Requested];
    assert_eq!(route(&services, &attempts, &failure), Route::Try { at: 1, service: tid });
    let failed = mor_split::failed(&services, &attempts, &failure);
    assert_eq!(failed, vec![sid]);

    // P divides the payment and pays the work's share to T, the label its own.
    let ps = split(&mut w, &mut svc_p, incoming, 1000, pe, &|h| if *h == we { tid } else { *h });
    {
        let mut v = AgreementsView::new(&w.v, mirs());
        let e = v.split(&ps).unwrap();
        assert!(!e.mismatched.is_empty(), "without the cMIP's answer, a payout to the backup is a mismatch");
        v.attempts_failed = failed.iter().map(|s| (ps, *s)).collect();
        let e = v.split(&ps).unwrap();
        assert!(e.problems.is_empty() && e.mismatched.is_empty() && e.breaks.is_empty() && e.numbering.is_none() && e.undelivered.is_empty(), "{e:?}");
        assert_eq!(e.sums, Some(true));
    }

    // T receipts the work's share in its own name (F235) and splits it
    // under the work's agreement: Ana 510, Ben 340.
    let shared = receipt(&mut w, &mut svc_t, tid, svc_p.id, 850, ps, None, "P pays T, 1");
    let ts = split(&mut w, &mut svc_t, shared, 850, we, &|h| *h);
    let e = AgreementsView::new(&w.v, mirs()).split(&ts).unwrap();
    assert!(e.problems.is_empty() && e.mismatched.is_empty() && e.breaks.is_empty() && e.numbering.is_none() && e.undelivered.is_empty(), "{e:?}");
    let amounts: Vec<(Hash, u64)> = e.split.payouts.iter().map(|p| (p.receiver, p.amount)).collect();
    assert!(amounts.contains(&(aid, 510)) && amounts.contains(&(bid, 340)), "{amounts:?}");

    // Each share paid and receipted, at each one's own flow address.
    let ra = receipt(&mut w, &mut ana, aid, tid, 510, ts, None, "T pays Ana, 1");
    let rb = receipt(&mut w, &mut ben, bid, tid, 340, ts, None, "T pays Ben, 1");
    let rl = receipt(&mut w, &mut label, lid, svc_p.id, 150, ps, None, "P pays the label, 1");
    let mut v = AgreementsView::new(&w.v, mirs());
    v.attempts_failed = failed.iter().map(|s| (ps, *s)).collect();
    v.rail_valid.insert(ra, PaidAt::Flow(pa));
    v.rail_valid.insert(rb, PaidAt::Flow(pb));
    v.rail_valid.insert(rl, PaidAt::Flow(pl));

    // Each participant's check (F250): my cut at my flow address.
    let mut total = 0;
    for (who, cut) in [(aid, 510), (bid, 340), (lid, 150)] {
        let c = v.cut_check(&incoming, &who).unwrap();
        assert!(c.arrived(), "{c:?}");
        assert_eq!((c.due, c.received), (cut, cut));
        total += c.received;
    }
    assert_eq!(total, 1000, "the payment balances to the unit");
    assert!(v.service_account(&tid).unwrap().unpaid.is_empty());
    assert!(v.service_account(&svc_p.id).unwrap().unpaid.is_empty());

    // A cut paid elsewhere than the participant's flow address: shown so.
    v.rail_valid.insert(rb, PaidAt::Flow(pa));
    let c = v.cut_check(&incoming, &bid).unwrap();
    assert!(!c.arrived() && c.elsewhere == vec![rb], "{c:?}");

    // The next payment starts again from S: attempts are per payment, not
    // stages (F249).
    assert_eq!(route(&services, &[], &failure), Route::Try { at: 0, service: sid });
    assert_eq!(route(&services, &[Attempt::Paid], &failure), Route::Paid { at: 0, service: sid });
    assert_eq!(route(&services, &[Attempt::Refused, Attempt::Unpayable], &failure), Route::Exhausted);
}
