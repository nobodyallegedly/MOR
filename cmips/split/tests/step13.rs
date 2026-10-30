//! Roadmap step 13, the split Module (F249, F250), as the publication
//! carries it (Agreements draft 17, rules 11, 12, 16 to 18, F260): a
//! payment divided among test identities, exactly, each share paid and
//! receipted, and every participant's check ("agreement condition triggered
//! (purchase) where is my cut at my flow address (or vault if needed)")
//! answered by the core.
//!
//! Ana and Ben own a song (their ownership agreement: Ana 60%, Ben 40%).
//! Their publication names a label as a partner (15%, off the top), its
//! split service S, a backup T (field 11) and this cMIP's failure condition
//! (field 12). S signs the price tag. A fan's attempt at S gets no payment
//! request within the wait: the fan pays T, naming the tag; T receipts it
//! in its own name, naming the ownership agreement's version whose shares it
//! pays, splits it by this cMIP, and the label, Ana and Ben each receipt
//! their cut at their own flow address. The next payment starts again from
//! S.
//!
//! Ported to the publication (the Dubsar Suite's round 8): draft 2's run
//! had two layers, a publication's agreement (the work's agreement 85%, the
//! label 15%) paid by P, and the work's agreement paid by S or its backup
//! T, P being the payer trying S then T. That layer's agreement no longer
//! exists: the label is a partner of the one publication, off the top, and
//! the payer trying the services in order is the fan (rule 17: every payer
//! tries the services in order, a direct buyer too).

#[path = "../../../core/tests/common/mod.rs"]
mod common;

use common::{own_home, price_tag, Person, World};
use mor_core::act::Object;
use mor_core::agreements::{self, AgreementsView, Mirs, Partner, Publication, Sold, Split, SplitPlan, Unfilled};
use mor_core::cbor::Value;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{Amount, PaidAt, Payer, Payload as Fin, PayeePointer, Priced, Purchase, Rail, Receipt};
use mor_split::{route, Attempt, Facts, Failure, Owners, Route};

fn mirs() -> Mirs {
    Mirs {
        identity: common::identity_spec(),
        envelopes: common::envelopes_spec(),
        text: common::text_spec(),
        money: common::money_spec(),
        agreements: common::agreements_spec(),
        development: sha256(b"PRODUCTION, test value until the freeze"),
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

/// A receipt signed by `by`, its payee.
#[allow(clippy::too_many_arguments)]
fn receipt(w: &mut World, by: &mut Person, payer: Hash, value: u64, fulfils: Hash, purchase: Option<Purchase>, proof: &str) -> Hash {
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: proof.as_bytes().to_vec(),
        payer: Some(Payer::Identity(payer)),
        payee: by.id,
        amount: Amount { unit: spec("a unit"), value },
        fulfils,
        previous: None,
        forward: None,
        batch: None,
        purchase,
    });
    let a = w.everyday_act(by, mirs().money, 2, r.to_map(), None, None);
    w.add(&a)
}

fn plan() -> SplitPlan {
    SplitPlan {
        shares: vec![],
        cmip: mor_split::spec(),
        unfilled: Unfilled::Stakes,
        top: vec![],
        service_bears_rail_fees: false,
        max_rail_fee: None,
        params: None,
        metrics: vec![],
        fees: vec![],
    }
}

/// The service's split of `incoming` under the publication `pb`, as this
/// cMIP divides it, the owners' line read from the ownership agreement's
/// version in force; private, delivered to every receiver (rule 20).
fn split(w: &mut World, svc: &mut Person, incoming: Hash, amount: u64, pb: Hash, owners: Hash) -> Hash {
    let v = AgreementsView::new(&w.v, mirs());
    let p = v.publication(&pb).unwrap().publication;
    let t = v.terms(&v.version_in_force(&owners).unwrap()).unwrap();
    let holders: Vec<(Hash, u64)> = t.stakes.unwrap()[0].holders.iter().map(|(w, n)| (*w.id().unwrap(), *n)).collect();
    let d = mor_split::divide(amount, &p, Owners::Line { agreement: owners, holders: &holders, before: &[] }, &Facts::default()).unwrap();
    assert_eq!(d.payouts.iter().map(|p| p.amount).sum::<u64>(), amount, "the split balances to the unit");
    let mut to: Vec<Hash> = d.payouts.iter().map(|p| p.receiver).collect();
    to.sort();
    to.dedup();
    let s = Split { receipt: incoming, payouts: d.payouts, cmip: mor_split::spec(), publication: pb, tally: Some(d.tally), number: Some(1), ..Default::default() };
    w.private_act(svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, to)
}

#[test]
fn a_payment_is_split_exactly_each_cut_reaching_its_flow_address_through_a_backup() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut svc_s = w.genesis("the publication's split service S", vec![own_home()], None, None);
    let mut svc_t = w.genesis("its backup T", vec![own_home()], None, None);
    let fan = spec("a fan");
    let (aid, bid, lid, sid, tid) = (ana.id, ben.id, label.id, svc_s.id, svc_t.id);
    let pa = pointer(&mut w, &mut ana);
    let pb_ = pointer(&mut w, &mut ben);
    let pl = pointer(&mut w, &mut label);

    // The song's ownership agreement: Ana 60%, Ben 40%, on Ana's claim.
    let claim = common::claim_alone(&mut w, &mut ana, &mirs(), spec("a song, step 13"));
    let ot = common::ownership_terms(claim, &[(aid, 600_000), (bid, 400_000)], "Ana and Ben's song.");
    let owners = agreements_act(&mut w, &mut ana, agreements::types::TERMS, ot.to_map(), None);
    sign(&mut w, &mut ana, &owners);
    sign(&mut w, &mut ben, &owners);

    // Its publication: the label a partner for 15%; S its split service, T
    // its backup (field 11), with this cMIP's failure condition (field 12),
    // signed by every party.
    let failure = Failure { wait: 60 };
    let mut publication = Publication {
        sold: Some(vec![Sold::Access(spec("a stream cMIP"), mor_core::cbor::encode(&Value::Null))]),
        owners: Some(owners),
        partners: vec![Partner { identity: lid, share: 150_000, label: Some("label".into()) }],
        service: sid,
        plan: plan(),
        words: None,
        time: None,
        until: None,
        refund: None,
        cmips: vec![(8, mor_split::spec())],
        designated: None,
        backups: vec![tid],
        failed: Some(failure.to_value()),
    };
    publication.partners.sort_by_key(|p| p.identity);
    let pb = agreements_act(&mut w, &mut ana, agreements::types::PUBLICATION, publication.to_map(), obj(owners));
    for p in [&mut ben, &mut label, &mut svc_s, &mut svc_t] {
        sign(&mut w, p, &pb);
    }
    {
        let v = AgreementsView::new(&w.v, mirs());
        assert_eq!(v.agreement(&owners).unwrap().exists, Some(true));
        let e = v.publication(&pb).unwrap();
        assert!(e.counts, "{:?}", e.problems);
        // The services the parties signed, in order: S, then T.
        assert_eq!(e.publication.services(), vec![sid, tid]);
    }
    // S signs the price tag, payable to itself.
    let tag = price_tag(&mut w, &mut svc_s, mirs().money, Priced::Publication(pb), 1000, spec("a unit"), sid);

    // The fan's attempt at S: no payment request within the wait. The cMIP
    // says the attempt failed; T is next.
    let p = AgreementsView::new(&w.v, mirs()).publication(&pb).unwrap().publication;
    assert_eq!(route(&p, &[Attempt::Silent { waited: 30 }]).unwrap(), Route::Try { at: 0, service: sid }, "before the wait has passed, S is still tried");
    let attempts = vec![Attempt::Silent { waited: 90 }, Attempt::Requested];
    assert_eq!(route(&p, &attempts).unwrap(), Route::Try { at: 1, service: tid });
    let failed = mor_split::failed(&p, &attempts).unwrap();
    assert_eq!(failed, vec![sid]);

    // The fan pays T, naming the tag; T receipts it in its own name, naming
    // the ownership agreement's version whose shares it pays (rule 12).
    let incoming = receipt(&mut w, &mut svc_t, fan, 1000, tag, Some(Purchase { agreement: owners, line: owners }), "the fan pays T, 1");
    let c = AgreementsView::new(&w.v, mirs()).cut_check(&incoming, &aid).unwrap();
    assert!(!c.arrived() && c.stops.iter().any(|s| s.contains("no split")), "before any split, the cut is the service's open obligation: {c:?}");

    // T divides the payment by this cMIP: the label 150 off the top, then
    // the owners' line, Ana 510, Ben 340.
    let ts = split(&mut w, &mut svc_t, incoming, 1000, pb, owners);
    {
        let mut v = AgreementsView::new(&w.v, mirs());
        let e = v.split(&ts).unwrap();
        assert!(e.problems.iter().any(|p| p.contains("rule 17")), "without the cMIP's answer, a backup's split breaks the plan: {:?}", e.problems);
        v.attempts_failed = failed.iter().map(|s| (incoming, *s)).collect();
        let e = v.split(&ts).unwrap();
        assert!(
            e.problems.is_empty() && e.mismatched.is_empty() && e.partners_mismatched.is_empty() && e.unplanned.is_empty() && e.breaks.is_empty() && e.numbering.is_none() && e.undelivered.is_empty(),
            "{e:?}"
        );
        assert_eq!(e.sums, Some(true));
        assert_eq!(e.in_force, owners, "the owners' line read by reference, the version the receipt names");
        let amounts: Vec<(Hash, u64)> = e.split.payouts.iter().map(|p| (p.receiver, p.amount)).collect();
        assert!(amounts.contains(&(lid, 150)) && amounts.contains(&(aid, 510)) && amounts.contains(&(bid, 340)), "{amounts:?}");
    }

    // Each share paid and receipted, at each one's own flow address.
    let ra = receipt(&mut w, &mut ana, tid, 510, ts, None, "T pays Ana, 1");
    let rb = receipt(&mut w, &mut ben, tid, 340, ts, None, "T pays Ben, 1");
    let rl = receipt(&mut w, &mut label, tid, 150, ts, None, "T pays the label, 1");
    // The stand-in rails answer that each proof is its own payment (Money rule 12).
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    v.attempts_failed = failed.iter().map(|s| (incoming, *s)).collect();
    v.rail_valid.insert(ra, PaidAt::Flow(pa));
    v.rail_valid.insert(rb, PaidAt::Flow(pb_));
    v.rail_valid.insert(rl, PaidAt::Flow(pl));

    // Each participant's check (rule 18): my cut at my flow address.
    let mut total = 0;
    for (who, cut) in [(aid, 510), (bid, 340), (lid, 150)] {
        let c = v.cut_check(&incoming, &who).unwrap();
        assert!(c.arrived(), "{c:?}");
        assert_eq!((c.due, c.received), (cut, cut));
        total += c.received;
    }
    assert_eq!(total, 1000, "the payment balances to the unit");
    assert!(v.service_account(&tid).unwrap().unpaid.is_empty());

    // A cut paid elsewhere than the participant's flow address: shown so.
    v.rail_valid.insert(rb, PaidAt::Flow(pa));
    let c = v.cut_check(&incoming, &bid).unwrap();
    assert!(!c.arrived() && c.elsewhere == vec![rb], "{c:?}");

    // The next payment starts again from S: attempts are per payment, not
    // stages (F249).
    assert_eq!(route(&p, &[]).unwrap(), Route::Try { at: 0, service: sid });
    assert_eq!(route(&p, &[Attempt::Paid]).unwrap(), Route::Paid { at: 0, service: sid });
    assert_eq!(route(&p, &[Attempt::Refused, Attempt::Unpayable]).unwrap(), Route::Exhausted);
}
