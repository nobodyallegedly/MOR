//! Scenario 9 of the freeze test suite, "The way out, walked": each exit
//! from a work, a collective or the protocol, written as the acts it
//! needs, with the verdict a verifier gives each step. And the keyless
//! collective's rules no other case exercises (Identity rule 1, rotation
//! check 4, rule 53's escape endorsement; Agreements rules 58 to 70).

use super::*;
use mor_core::agreements::{Partner, Payout, Publication, Split, StakeTransfer};
use mor_core::money::Purchase;

const UNIT: &str = "a test unit (regtest satoshi)";

fn sorted_hex(xs: &[Hash]) -> Vec<String> {
    let mut v: Vec<String> = xs.iter().map(|x| hx(x)).collect();
    v.sort();
    v
}

fn rail() -> Hash {
    spec("a rail Module")
}

/// A publication of `owners` (an ownership agreement, its founding
/// version) by `drafter`, selling `sold`, its split service `service`, its
/// partners `partners`; every party in `signers` signs it.
fn publish(w: &mut World, drafter: &mut Person, owners: Hash, service: Hash, partners: Vec<Partner>, sold: Vec<agreements::Sold>, signers: &mut [&mut Person]) -> Hash {
    let p = Publication {
        sold: Some(sold),
        owners: Some(owners),
        partners,
        service,
        plan: test_plan(),
        words: None,
        time: None,
        until: None,
        refund: None,
        cmips: vec![],
        designated: None,
        backups: vec![],
        failed: None,
    };
    let x = ag_act(w, drafter, agreements::types::PUBLICATION, p.to_map(), obj(owners));
    for s in signers.iter_mut() {
        sign(w, s, &x);
    }
    x
}

/// The split service's receipt of a buyer's payment of `value` following
/// the tag `tag`, naming the ownership agreement `owners` at `version`
/// (Money, field 9): a purchase under the publication.
fn sale(w: &mut World, svc: &mut Person, buyer: Hash, tag: Hash, owners: Hash, version: Hash, value: u64, proof: &[u8]) -> Hash {
    let r = Fin::Receipt(Receipt {
        rail: rail(),
        proof: proof.to_vec(),
        payer: Some(Payer::Identity(buyer)),
        payee: svc.id,
        amount: Amount { unit: spec(UNIT), value },
        fulfils: tag,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: owners, line: version }),
    });
    let a = w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
    w.add(&a)
}

/// A split of `receipt` under `publication`, numbered `number`, following
/// the transfers `transfers` (split key 8), sealed to `to`.
fn split(w: &mut World, svc: &mut Person, receipt: Hash, publication: Hash, number: u64, payouts: Vec<Payout>, transfers: Vec<(u64, Hash)>, mut to: Vec<Hash>) -> Hash {
    to.sort();
    to.dedup();
    let s = Split { receipt, payouts, cmip: test_plan().cmip, publication, tally: None, number: Some(number), modules: vec![], metric_records: vec![], transfers };
    w.private_act(svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, to)
}

fn on_line(receiver: Hash, amount: u64, owners: Hash) -> Payout {
    Payout { receiver, amount, stake: Some(0), owners: Some(owners), ..Default::default() }
}

fn to_partner(receiver: Hash, amount: u64, index: u64) -> Payout {
    Payout { receiver, amount, partner: Some(index), ..Default::default() }
}

/// A world holding `log`'s acts save those in `leave`.
fn replay(log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)], leave: &[Hash]) -> World {
    let mut w = World::new();
    for (a, k) in log {
        if !leave.contains(&a.id()) {
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
    }
    w
}

pub fn agreements(out: &mut Out) {
    walk_1(out);
    walk_2(out);
    walk_3(out);
    walk_4(out);
    walk_5(out);
}

/// A collective of Ana, Ben and Cy, its founding changed by `f` before
/// every member signs it; its identity keyless, declaring it.
fn band(w: &mut World, name: &str, f: &dyn Fn(&mut Terms, &[Hash])) -> (Col, Person) {
    let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis("an abandonment authority", vec![own_home()], None, None);
    let keeper = w.genesis("the collective's keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut t = collective_terms(&ids, authority.id, keeper.id, vec![ids[1]], 1);
    t.text = format!("{name}: a test collective of three members.");
    f(&mut t, &ids);
    let founding = ag_act(w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(w, p, &founding);
    }
    let chain = w.genesis_with(name, vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
    let id = chain.id;
    let c = m[2].acting_for(id, vec![id]);
    (Col { m, id, chain, c, founding }, authority)
}

/// A clone of `parent` changed by `f`, marked with `mark`, drafted by the
/// first signer and signed by `signers`, each act for the collective citing
/// `cite` on its chain: its id and the signature acts.
#[allow(clippy::too_many_arguments)]
fn clone_of(w: &mut World, col: &mut Col, parent: Hash, mark: Vec<(agreements::Power, Vec<usize>)>, signers: &[usize], cite: Vec<Hash>, f: &dyn Fn(&mut Terms)) -> (Hash, Vec<Hash>) {
    let mut t = view(w).terms(&parent).unwrap();
    t.parent = Some(parent);
    t.field4 = Field4::Mark(
        mark.into_iter()
            .map(|(power, who)| {
                let mut s: Vec<Hash> = who.iter().map(|i| col.m[*i].id).collect();
                s.sort();
                agreements::MarkEntry { power, signers: s }
            })
            .collect(),
    );
    f(&mut t);
    let id = col.id;
    let k = ag_act(w, &mut col.m[signers[0]].acting_for(id, cite.clone()), agreements::types::TERMS, t.to_map(), obj(parent));
    let sigs = signers.iter().map(|i| sign(w, &mut col.m[*i].acting_for(id, cite.clone()), &k)).collect();
    (k, sigs)
}

fn ask_record(col: &Hash, rec: &Hash) -> J {
    json!({ "question": "record", "collective": hx(col), "act": hx(rec) })
}

/// 9.2, a member leaving a collective: Cy resigns; a record is the line.
fn walk_2(out: &mut Out) {
    let mut w = World::new();
    let (mut col, _) = band(&mut w, "a band whose third member leaves", &|t, ids| {
        t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: ids.to_vec() };
        t.constitutional = Some(Rule::Threshold(2));
        t.layers = Some(vec![
            (agreements::layers::TEXT, Rule::Threshold(1)),
            (agreements::layers::ENVELOPES, Rule::Threshold(1)),
            (agreements::layers::MONEY, Rule::Threshold(2)),
            (agreements::layers::AGREEMENTS, Rule::Threshold(1)),
            (agreements::layers::DEVELOPMENT, Rule::Threshold(1)),
        ]);
    });
    let (f, cid) = (col.founding, col.id);
    let (ana_id, ben_id, cy_id) = (col.m[0].id, col.m[1].id, col.m[2].id);
    // Before the line: Cy's text for the band, and a pointer Ana drafts
    // for it that Cy signs.
    let before = text_act(&mut w, &mut col.c, "Cy's notice for the band, before he leaves.", None);
    let ptr = pointer_act(&mut w, &mut member_for(&col, 0), b"the band's address");
    sign(&mut w, &mut col.m[2], &ptr);
    // Cy resigns alone; Ben draws the record registering it, citing the
    // band's head: the line.
    let res = ag_act(&mut w, &mut col.m[2], agreements::types::RESIGNATION, agreements::Resignation { agreement: f, area: None, drafts: vec![] }.to_map(), obj(f));
    let rec = {
        let mut ben = col.m[1].acting_for(cid, vec![ptr, before]);
        let a = w.everyday_act(&mut ben, mirs().agreements, agreements::types::RECORD, agreements::Record { clone: None, signatures: None, registers: Some(vec![res]) }.to_map(), obj(f), None);
        w.add(&a)
    };
    out.case(&mut w, "9.2 a record registering Cy's resignation, drawn by Ben, naming the band and its previous decision: the line", "Agreements rules 69 and 70",
        "Cy resigned alone; any member draws the record; it names the band as chain and the acts before it.", Facts::default(), ask_record(&cid, &rec), json!({ "line": true, "puts": null }), None);
    // After the line: Cy's text for the band, citing the record; a pointer
    // Ana drafts that Cy signs, then Ben too.
    let mut cy_for = col.m[2].acting_for(cid, vec![rec]);
    let after = text_act(&mut w, &mut cy_for, "Cy's notice for the band, after he left.", None);
    let mut ana_for = col.m[0].acting_for(cid, vec![rec]);
    let ptr2 = pointer_act(&mut w, &mut ana_for, b"the band's second address");
    sign(&mut w, &mut col.m[2], &ptr2);
    let only_cy = w.log.clone();
    sign(&mut w, &mut col.m[1], &ptr2);
    // His own acts stay his own: a post of his, with his own key.
    let own_post = text_act(&mut w, &mut col.m[2], "Cy's own post, after he left the band.", None);
    // The two who stay sign a constitutional clone without Cy, Cy keeping
    // his share as a departed holder; a rotation of the band's chain key
    // declares it.
    let keep = vec![ana_id, ben_id];
    let (k, sigs) = clone_of(&mut w, &mut col, f, vec![(agreements::Power::Constitutional, vec![0, 1])], &[0, 1], vec![rec], &|t| {
        t.parties = keep.clone();
        t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
        t.departed = Some(vec![cy_id]);
    });
    let (rot, _) = w.rotate(&col.chain, Rot { declarations: Some(vec![agreements::clone_declaration(&mirs().agreements, &k, &sigs)]), ..Default::default() });
    out.case(&mut w, "9.2 the rotation of the band's chain key, rebuilt from Ana's and Ben's shares, declaring the clone without Cy: valid", "Agreements rule 69; Identity rule 7",
        "Its line's history is that of the signature acts its declaration names; Ana and Ben, any two of three, meet the constitutional rule.", Facts::default(), ask_status(&rot), json!("valid"), None);
    out.case(&mut w, "9.2 Cy's text for the band before the line: it counts", "Agreements rule 58; \"Made before, made after\", 3",
        "Any one member may act in Text; before the line Cy is one.", Facts::default(), ask("consent counts", &before), json!(true), None);
    out.case(&mut w, "9.2 a pointer of the band Cy signed before the line: his signature still counts for it", "Agreements rules 58 and 70; \"Made before, made after\", 3",
        "Money needs two members: Ana drafted it and Cy signed it, both members then.", Facts::default(), ask("consent counts", &ptr), json!(true), None);
    out.case(&mut w, "9.2 Cy's text naming the band after the line: it counts for nothing", "Agreements rules 58 and 70",
        "His power ends at the line that registers his departure: the act's history holds the record.", Facts::default(), ask("consent counts", &after), json!(false), None);
    let mut w1 = replay(&only_cy, &[]);
    out.case(&mut w1, "9.2 a pointer after the line, drafted by Ana and signed by Cy: it does not count", "Agreements rules 58 and 70",
        "Money needs two members; Cy's signature after the line is no member's.", Facts::default(), ask("consent counts", &ptr2), json!(false), None);
    out.case(&mut w, "9.2 the same pointer once Ben signs it too: it counts", "Agreements rules 58 and 60", "Ana and Ben, two members.", Facts::default(), ask("consent counts", &ptr2), json!(true), None);
    out.case(&mut w, "9.2 Cy's own post after he left: valid, untouched", "Agreements rule 70; \"Made before, made after\", 3",
        "His own key continues to sign his own acts: the post names no collective.", Facts::default(), ask_status(&own_post), json!("valid"), None);
}

pub fn identity(_out: &mut Out) {}

/// 9.1, an owner leaving a work: Ana sells her whole share to Cy.
fn walk_1(out: &mut Out) {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy, who buys ana's share", vec![own_home()], None, None);
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut svc = w.genesis("the song's split service", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let work = spec("a song, scenario 9.1");
    let creators = [ana.id, ben.id];
    let c = claim_act(&mut w, &mut ana, &creators, work);
    sign(&mut w, &mut ben, &c);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "The song's ownership agreement: Ana 400,000, Ben 600,000.".into();
    owning(&mut t, c, &[(ana.id, 400_000), (ben.id, 600_000)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &own);
    sign(&mut w, &mut ben, &own);
    let bake = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec()))]), None, None); w.add(&a) };
    let (sid, lid) = (svc.id, label.id);
    let through_label = publish(&mut w, &mut ana, own, sid, vec![Partner { identity: lid, share: 150_000, label: None }], vec![agreements::Sold::Bake(bake)], &mut [&mut ben, &mut label, &mut svc]);
    let own_pub = publish(&mut w, &mut ben, own, sid, vec![], vec![agreements::Sold::Bake(bake)], &mut [&mut ana, &mut svc]);
    let tag_l = price_tag(&mut w, &mut svc, mirs().money, money::Priced::Publication(through_label), 1000, spec(UNIT), sid);
    let tag_o = price_tag(&mut w, &mut svc, mirs().money, money::Priced::Publication(own_pub), 1000, spec(UNIT), sid);
    // Ana's transfer of her whole share to Cy, naming the ownership
    // agreement's chain; Cy completes it; Ana chain-signs it.
    let tr = StakeTransfer { agreement: own, stake: 0, to: cy.id, share: 400_000, record: vec![] };
    let x = ag_act(&mut w, &mut ana, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(own));
    let only_ana = w.log.clone();
    let cy_signs = sign(&mut w, &mut cy, &x);
    let (cs, ana_after) = w.chain_sign(&ana, x);
    let base = w.log.clone();
    let facts = |r: Hash, proof: &[u8]| Facts { rail_valid: vec![(r, sid)], rail_payments: vec![(proof.to_vec(), proof.to_vec())], ..Default::default() };
    let everyone = vec![ana.id, ben.id, cy.id, lid];

    out.case(&mut w, "9.1 Ana's transfer of her whole share to Cy, Cy's signature and Ana's chain signature placed: it takes effect", "Agreements rule 10; Identity, chain signatures",
        "The seller signs the transfer and chain-signs it, fixing its place on her own line; the buyer completes it by his signature act. Ben is notified, not asked.",
        Facts::default(), ask("transfer", &x), json!({ "effective": true, "wrong_receipts": [] }), None);
    let mut w0 = replay(&only_ana, &[]);
    out.case(&mut w0, "9.1 the same transfer, Ana's signature alone: it does not take effect yet", "Agreements rule 10",
        "Neither the buyer's signature act nor the seller's chain signature is placed.", Facts::default(), ask("transfer", &x), json!({ "effective": false, "wrong_receipts": [] }), None);

    // A purchase under the label's publication, the transfer complete: the
    // split pays the label its 150,000 off the top, and the owners' line by
    // the stake as the transfer leaves it, Cy 400,000 and Ben 600,000.
    let r1 = sale(&mut w, &mut svc, fan.id, tag_l, own, own, 1000, b"a sale through the label");
    let s1 = split(&mut w, &mut svc, r1, through_label, 1, vec![to_partner(lid, 150, 0), on_line(cy.id, 340, own), on_line(ben.id, 510, own)], vec![(0, x)], everyone.clone());
    out.case(&mut w, "9.1 a purchase under the label's publication after the transfer: a purchase, neither publication changed", "Agreements rules 12 and 15",
        "The publication reads the ownership agreement by reference: the transfer changes no publication, and the receipt names the agreement.",
        facts(r1, b"a sale through the label"), ask("purchase", &r1), json!("purchase"), None);
    out.case(&mut w, "9.1 its split, following the complete transfer, paying Cy 400,000 of every million left on the owners' line: the plan kept", "Agreements rules 10 and 15; split key 8",
        "The label takes 150 of 1,000 off the top; of the 850 left, Cy is paid 340 and Ben 510.", facts(r1, b"a sale through the label"), ask("split", &s1), json!({ "mismatched": [] }), None);
    let mut wa = replay(&base, &[]);
    let r2 = sale(&mut wa, &mut svc.clone(), fan.id, tag_o, own, own, 1000, b"a self-published sale");
    let s2 = split(&mut wa, &mut svc.clone(), r2, own_pub, 1, vec![on_line(ana.id, 400, own), on_line(ben.id, 600, own)], vec![], everyone.clone());
    out.case(&mut wa, "9.1 once the transfer is complete, a split under the self-published publication paying Ana for the share: it breaks the plan", "Agreements rules 10 and 30",
        "Both signatures are placed: the share is Cy's, so a payout of it to Ana does not match the stake.", facts(r2, b"a self-published sale"), ask("split", &s2), json!({ "mismatched": sorted_hex(&[ana.id, cy.id]) }), None);
    let mut wb = replay(&only_ana, &[]);
    let r3 = sale(&mut wb, &mut svc.clone(), fan.id, tag_o, own, own, 1000, b"a self-published sale");
    let s3 = split(&mut wb, &mut svc.clone(), r3, own_pub, 1, vec![on_line(ana.id, 400, own), on_line(ben.id, 600, own)], vec![], everyone.clone());
    out.case(&mut wb, "9.1 the same split, the transfer bearing only Ana's signature: it still pays Ana, the plan kept", "Agreements rule 10",
        "The transfer is not complete: the stake is as the ownership agreement writes it.", facts(r3, b"a self-published sale"), ask("split", &s3), json!({ "mismatched": [] }), None);

    // A payout receipt Ana signs for the share, bound to a rotation later
    // than her chain signature: a wrong receipt.
    let payout_receipt = |w: &mut World, p: &mut Person, s: Hash, proof: &[u8]| {
        let r = Fin::Receipt(Receipt { rail: rail(), proof: proof.to_vec(), payer: Some(Payer::Identity(sid)), payee: p.id, amount: Amount { unit: spec(UNIT), value: 340 }, fulfils: s, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(p, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let mut wc = replay(&base, &[]);
    let r4 = sale(&mut wc, &mut svc.clone(), fan.id, tag_l, own, own, 1000, b"a sale through the label");
    let s4 = split(&mut wc, &mut svc.clone(), r4, through_label, 1, vec![to_partner(lid, 150, 0), on_line(ana.id, 340, own), on_line(ben.id, 510, own)], vec![], everyone);
    let (_, mut ana_rotated) = wc.rotate(&ana_after, Rot::default());
    let wrong = payout_receipt(&mut wc, &mut ana_rotated, s4, b"ana's payout after the transfer");
    out.case(&mut wc, "9.1 a payout receipt Ana signs for the share, bound to a rotation after her transfer's chain signature: a wrong receipt", "Agreements rules 10 and 30; F217",
        "Her chain signature fixed the transfer's place on her own line; a receipt she signs after it, for the stake sold, counts for nothing, and that payout is owed to Cy.",
        Facts::default(), ask("transfer", &x), json!({ "effective": true, "wrong_receipts": [hx(&wrong)] }), None);
    let _ = (cy_signs, cs);
}

/// 9.3, succession: Ben dies; his plan passes his seat to Dee and his share
/// to two children.
fn walk_3(out: &mut Out) {
    let mut w = World::new();
    let mut dee = w.genesis("dee, ben's colleague", vec![own_home()], None, None);
    let dee_id = dee.id;
    let (c1, c2) = (spec("ben's first child"), spec("ben's second child"));
    let (mut col, mut authority) = band(&mut w, "a band whose member dies", &|t, ids| {
        t.layers = Some(layers_all(Rule::Threshold(1)));
        t.succession = Some(vec![agreements::SuccessionPlan { party: ids[1], stakes: Some(vec![(c1, 500_000), (c2, 500_000)]), seats: Some(vec![dee_id]), entry: Some(0) }]);
    });
    let (f, cid) = (col.founding, col.id);
    let (ana_id, ben_id, cy_id) = (col.m[0].id, col.m[1].id, col.m[2].id);
    let d = agreements::AbsenceDeclaration { agreement: f, clause: f, party: ben_id, outcomes: vec![outcomes::VOICE_REMOVED] };
    let d = ag_act(&mut w, &mut authority, agreements::types::DECLARATION, d.to_map(), obj(f));
    let rec = {
        let mut cy = col.m[2].acting_for(cid, vec![cid]);
        let a = w.everyday_act(&mut cy, mirs().agreements, agreements::types::RECORD, agreements::Record { clone: None, signatures: None, registers: Some(vec![d]) }.to_map(), obj(f), None);
        w.add(&a)
    };
    out.case(&mut w, "9.3 a record registering the abandonment authority's declaration of Ben: the line", "Agreements rules 69 and 83",
        "The authority's declaration triggers the plan; any member draws the record registering it, naming the band and its genesis.", Facts::default(), ask_record(&cid, &rec), json!({ "line": true, "puts": null }), None);
    // The seat passes as a constitutional clone marked with the plan, Dee
    // in Ben's place, every threshold unchanged, the plan dropped.
    let new = vec![ana_id, dee_id, cy_id];
    let mut t = view(&w).terms(&f).unwrap();
    t.parent = Some(f);
    t.parties = new.clone();
    t.succession = None;
    t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 3, members: new.clone() };
    t.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Plan(ben_id), signers: vec![dee_id] }]);
    // Ana drafts it for the band, citing the record: its history holds the
    // line, where the plan's trigger is in effect.
    let k = ag_act(&mut w, &mut col.m[0].acting_for(cid, vec![rec]), agreements::types::TERMS, t.to_map(), obj(f));
    // Dee's signature act cites the band's chain, as an action does: the
    // rotation's history is that of the signature acts it names.
    let sd = sign(&mut w, &mut dee.acting_for(cid, vec![rec]), &k);
    out.case(&mut w, "9.3 the clone marked with Ben's plan, Dee in his place, every threshold unchanged: not invalid", "Agreements rule 83",
        "Marked with the plan alone, signed by the seat successor, changing only what the plan gives; Ana drafts it for the band, citing the record.", Facts::default(), json!({ "question": "agreement invalid", "act": hx(&k) }), json!("not invalid"), None);
    let mut t2 = view(&w).terms(&k).unwrap();
    t2.text = "Other words, slipped into the succession.".into();
    t2.parent = Some(f);
    let bad = ag_act(&mut w, &mut col.m[0], agreements::types::TERMS, t2.to_map(), obj(f));
    out.case(&mut w, "9.3 the same clone changing the words too: invalid", "Agreements rule 83",
        "A clone marked with the plan alone that changes anything more is invalid.", Facts::default(), json!({ "question": "agreement invalid", "act": hx(&bad) }), json!("invalid"), None);
    let (rot, _) = w.rotate(&col.chain, Rot { declarations: Some(vec![agreements::clone_declaration(&mirs().agreements, &k, &[sd])]), ..Default::default() });
    out.case(&mut w, "9.3 the rotation declaring the succession clone: valid", "Agreements rules 69 and 83; Identity rule 7",
        "The band's chain key, rebuilt, declares the clone; the keys are re-dealt to Dee in Ben's place.", Facts::default(), ask_status(&rot), json!("valid"), None);
    let mut dee_for = dee.acting_for(cid, vec![rot]);
    let x = text_act(&mut w, &mut dee_for, "Dee's first notice for the band.", None);
    out.case(&mut w, "9.3 Dee's text for the band, citing the rotation: it counts", "Agreements rules 58 and 83",
        "Dee holds the seat in the agreement in force for the act.", Facts::default(), ask("consent counts", &x), json!(true), None);

    // Rule 59: a single chain-key holder has a named successor and an
    // escrowed share; a founding naming a single holder with neither is
    // refused.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let heir = spec("ana's successor for the key holding");
    let ana_id = ana.id;
    let single = move |plan: bool, escrow: bool| {
        let mut t = deal(&[ana_id], None);
        t.text = format!("A band of one, plan {plan}, escrow {escrow}.");
        t.grammar = Some(KeyGrammar { chain_key: Holding::One(ana_id), recovery: escrow.then_some(Recovery::Escrow { authority: spec("an authority") }) });
        t.abandonment = Some(Abandonment { authority: Authority::Named(spec("an authority")), outcomes: vec![outcomes::VOICE_REMOVED], proof: None });
        t.layers = Some(layers_all(Rule::All));
        t.target = Some(agreements::Target::Collective);
        t.stakes = Some(vec![agreements::Stake { object: agreements::Who::This, holders: vec![(agreements::Who::Id(ana_id), 1_000_000)] }]);
        if plan {
            t.succession = Some(vec![agreements::SuccessionPlan { party: ana_id, stakes: None, seats: Some(vec![heir]), entry: None }]);
        }
        t
    };
    let ok = { let t = single(true, true); ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None) };
    let none = { let t = single(false, false); ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None) };
    out.case(&mut w, "9.3 a founding naming a single chain-key holder with a successor and an escrowed share: not invalid", "Agreements rule 59",
        "A single holder still has a named successor and an escrowed share.", Facts::default(), json!({ "question": "agreement invalid", "act": hx(&ok) }), json!("not invalid"), None);
    out.case(&mut w, "9.3 a founding naming a single chain-key holder with neither: invalid", "Agreements rule 59",
        "No successor is named and no share escrowed: the key would die with its holder.", Facts::default(), json!({ "question": "agreement invalid", "act": hx(&none) }), json!("invalid"), None);
}

/// A successor of `col` for the side `side` (member indices), founded
/// first: terms forked from the original, its members signing; its keyless
/// identity. Its id.
fn successor(w: &mut World, col: &mut Col, name: &str, side: &[usize]) -> Hash {
    let f = col.founding;
    let members: Vec<Hash> = side.iter().map(|i| col.m[*i].id).collect();
    let mut t = view(w).terms(&f).unwrap();
    t.parties = members.clone();
    t.clone = Rule::Threshold(members.len().min(2) as u64);
    t.layers = Some(layers_all(Rule::Threshold(1)));
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::This, holders: members.iter().enumerate().map(|(i, h)| (agreements::Who::Id(*h), if i == 0 { 1_000_000 - (members.len() as u64 - 1) * (1_000_000 / members.len() as u64) } else { 1_000_000 / members.len() as u64 })).collect() }]);
    t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: members.len() as u64, members: members.clone() };
    t.forked_from = Some(col.id);
    let x = ag_act(w, &mut col.m[side[0]], agreements::types::TERMS, t.to_map(), None);
    for i in side {
        sign(w, &mut col.m[*i], &x);
    }
    w.genesis_with(name, vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &x)]), 3).id
}

/// 9.4, closing and fork.
fn walk_4(out: &mut Out) {
    // A band that cannot agree forks; its own publication sells nothing
    // from the fork's line.
    let mut w = World::new();
    let (mut col, _) = band(&mut w, "a band that forks", &|t, _| t.layers = Some(layers_all(Rule::Threshold(1))));
    let (f, cid) = (col.founding, col.id);
    let ids: Vec<Hash> = col.m.iter().map(|p| p.id).collect();
    let mut svc = w.genesis("the band's split service", vec![own_home()], None, None);
    let sid = svc.id;
    let mut fan = w.genesis("a fan of the band", vec![own_home()], None, None);
    let mut ana = member_for(&col, 0);
    let work = spec("the band's album, scenario 9.4");
    let bake = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec()))]), None, None); w.add(&a) };
    let pb = owners_publication(&mut w, &mut ana, f, sid, vec![agreements::Sold::Bake(bake)], "The album.");
    sign(&mut w, &mut svc, &pb);
    let tag = price_tag(&mut w, &mut svc, mirs().money, money::Priced::Publication(pb), 500, spec(UNIT), sid);
    let buy = |w: &mut World, svc: &mut Person, fan: &mut Person, proof: &[u8]| {
        let purchase = Some(Purchase { agreement: f, line: f });
        let c = Fin::Claim(Claim { rail: rail(), proof: proof.to_vec(), payee: sid, amount: Amount { unit: spec(UNIT), value: 500 }, fulfils: tag, disagrees: None, referral: None, refund: None, anonymous: None, purchase: purchase.clone(), previous: None });
        let a = w.everyday_act(fan, mirs().money, 3, c.to_map(), None, None);
        let claim = w.add(&a);
        let r = sale(w, svc, fan.id, tag, f, f, 500, proof);
        (claim, r)
    };
    let (c0, r0) = buy(&mut w, &mut svc, &mut fan, b"bought before the fork");
    let head = text_act(&mut w, &mut ana, "The band's last notice before it forks.", None);
    let sa = successor(&mut w, &mut col, "side A of the band", &[0]);
    let sb = successor(&mut w, &mut col, "side B of the band", &[1, 2]);
    let fork = agreements::Fork {
        agreement: f,
        collective: cid,
        sides: vec![agreements::Side { successor: sa, members: vec![ids[0]] }, agreements::Side { successor: sb, members: vec![ids[1], ids[2]] }],
        shares: vec![],
        debts: vec![],
    };
    let k = ag_act(&mut w, &mut col.m[0].acting_for(cid, vec![head]), agreements::types::FORK, fork.to_map(), obj(f));
    for i in 0..3 {
        let (_, q) = w.chain_sign(&col.m[i], k);
        col.m[i] = q;
    }
    let after = text_act(&mut w, &mut ana, "A notice for the band after its fork.", None);
    let (c1, r1) = buy(&mut w, &mut svc, &mut fan, b"bought after the fork");
    let facts = || Facts { rail_valid: vec![(c0, sid), (r0, sid), (c1, sid), (r1, sid)], rail_payments: vec![(b"bought before the fork".to_vec(), b"the first payment".to_vec()), (b"bought after the fork".to_vec(), b"the second payment".to_vec())], ..Default::default() };
    out.case(&mut w, "9.4 a fork drawn by a member, naming the band, its line and the successors, chain-signed by every member: complete", "Agreements rule 91",
        "Each side founded its successor first; the members on each side chain-sign the fork under the constitutional change rule; there is no debt to assign.", Facts::default(), ask("fork", &k), json!({ "complete": true }), None);
    out.case(&mut w, "9.4 a text for the band after its fork: it counts for nothing", "Agreements rule 91",
        "Once the fork is complete the original is closed: nothing done for it afterwards counts.", Facts::default(), ask("consent counts", &after), json!(false), None);
    out.case(&mut w, "9.4 a payment under the band's own publication made before the fork, which the fork's history does not hold: racing it, no purchase", "Agreements rule 12, \"Owners that ended\"; \"Made before, made after\", 7",
        "\"After it\" is read as the tie rule reads an ending: the fork cites the band's last notice, not the payment, so neither cites the other, and the ending wins.", facts(), ask("purchase", &c0), json!("no purchase"), None);
    out.case(&mut w, "9.4 a payment under the band's own publication after the fork: no purchase, owed back", "Agreements rules 12 and 91",
        "A publication whose ownership agreement names the closed collective as owner sells nothing from the fork's line.", facts(), ask("purchase", &c1), json!("no purchase"), None);

    // A second band, holding half of a work's stake, closes: "holds
    // nothing" is read from the ownership agreements of the works that list
    // it, applying the complete transfers its closing's history cites.
    let mut w = World::new();
    let (mut col, _) = band(&mut w, "a band that closes", &|t, _| t.layers = Some(layers_all(Rule::Threshold(1))));
    let (f, cid) = (col.founding, col.id);
    let mut dee = w.genesis("dee, the band's co-owner of a song", vec![own_home()], None, None);
    let dee_id = dee.id;
    let mut ana = member_for(&col, 0);
    let creators = [col.m[0].id];
    let claim = claim_act(&mut w, &mut col.m[0], &creators, spec("a song the band co-owns"));
    let mut t = deal(&[cid, dee_id], None);
    t.text = "The song's ownership agreement: the band and Dee, half each.".into();
    owning(&mut t, claim, &[(cid, 500_000), (dee_id, 500_000)]);
    let own = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut dee, &own);
    let base = w.log.clone();
    let close = |w: &mut World, col: &mut Col, cite: Hash| {
        let closing = agreements::Closing { agreement: f, collective: cid, open: vec![] };
        let k = ag_act(w, &mut col.m[1].acting_for(cid, vec![cite]), agreements::types::CLOSING, closing.to_map(), obj(f));
        for i in 0..3 {
            let (_, q) = w.chain_sign(&col.m[i], k);
            col.m[i] = q;
        }
        k
    };
    let mut w1 = replay(&base, &[]);
    let mut col1 = Col { m: col.m.clone(), id: cid, chain: col.chain.clone(), c: col.c.clone(), founding: f };
    let k1 = close(&mut w1, &mut col1, own);
    out.case(&mut w1, "9.4 a closing of a band that still holds half a song's stake: not complete", "Agreements rule 91",
        "A closing ends only a collective that holds nothing: the song's ownership agreement lists the band as an owner.", Facts::default(), ask("closing", &k1), json!({ "complete": false }), None);
    // The band sells its half to Dee: Ana draws the transfer for it; Dee
    // completes it; the band's chain key, rebuilt, chain-signs it.
    let tr = StakeTransfer { agreement: own, stake: 0, to: dee_id, share: 500_000, record: vec![] };
    let x = ag_act(&mut w, &mut ana, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(own));
    sign(&mut w, &mut dee, &x);
    w.chain_sign(&col.chain, x);
    out.case(&mut w, "9.4 the band's transfer of its whole half to Dee, drawn by a member, completed by Dee, chain-signed by the band: it takes effect", "Agreements rules 10 and 95",
        "The band is the seller: a member draws the act for it, under the rule for Agreements; its chain key fixes the transfer's place on the band's own line.", Facts::default(), ask("transfer", &x), json!({ "effective": true, "wrong_receipts": [] }), None);
    let k2 = close(&mut w, &mut col, x);
    out.case(&mut w, "9.4 the band's closing citing that transfer, chain-signed by every member: complete", "Agreements rule 91; \"Closing (type 20)\"",
        "\"Holds nothing\" applies the complete transfers the closing's history cites, as rule 10 counts them: the band's half is Dee's.", Facts::default(), ask("closing", &k2), json!({ "complete": true }), None);
}

/// 9.5, rotation and escape.
fn walk_5(out: &mut Out) {
    let mut w = World::new();
    let mut home = w.operator("the band's home, later hostile");
    let new_home = w.operator("the band's new home");
    let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis("an abandonment authority", vec![own_home()], None, None);
    let keeper = w.genesis("the band's keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut t = collective_terms(&ids, authority.id, keeper.id, vec![ids[1]], 1);
    t.text = "A band whose home turns hostile.".into();
    t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: ids.clone() };
    let founding = ag_act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &founding);
    }
    let band = w.genesis_with("a band that escapes", vec![home_of(&home)], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
    out.case(&mut w, "9.5 the band's genesis, declaring its founding and no signing key, signed by a chain key revealed in its signature: valid", "Identity rule 1",
        "A collective's genesis is signed by a chain key revealed in its signature, its commitment naming the next.", Facts::default(), ask_status(&band.id), json!("valid"), None);
    // A rotation of its chain key, rebuilt from the members' shares; its
    // home receipts it as any chain act.
    let (r1, band1) = w.rotate(&band, Rot::default());
    w.receipt(&mut home, &band.id, &r1, 1);
    out.case(&mut w, "9.5 the band's rotation, signed with its chain key, receipted by its home: valid", "Identity rule 7",
        "It reveals the chain key the genesis committed and commits the next; it installs no signing key and keeps no tip.", Facts::default(), ask_status(&r1), json!("valid"), None);
    // The home turns hostile: the band escapes by a homeless rotation to a
    // new home, the old home objecting.
    let (r2, _) = w.rotate(&band1, Rot { homes: Some(vec![home_of(&new_home)]), homeless: true, ..Default::default() });
    let mut nh = new_home.clone();
    w.receipt(&mut nh, &band.id, &r2, 2);
    w.object(&mut home, &band.id, &r2);
    out.case(&mut w, "9.5 the band's homeless rotation, its old home objecting: it counts, its own escape endorsement", "Identity rule 53, \"The escape endorsement\"",
        "Signed with its chain key, rebuilt from k of its members' shares, it is its own escape endorsement; the old home's objection voids nothing.", Facts::default(), json!({ "question": "chain", "identity": hx(&band.id) }), json!({ "counting": [hx(&band.id), hx(&r1), hx(&r2)], "next": "end", "dishonest": [] }), None);
    // A person's homeless rotation under the same objection, with no
    // endorsement: voided.
    let mut w = World::new();
    let mut home = w.operator("ivo's home, later hostile");
    let new_home = w.operator("ivo's new home");
    let ivo = w.genesis("ivo", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&ivo, Rot { homes: Some(vec![home_of(&new_home)]), homeless: true, ..Default::default() });
    let mut nh = new_home.clone();
    w.receipt(&mut nh, &ivo.id, &r, 1);
    w.object(&mut home, &ivo.id, &r);
    out.case(&mut w, "9.5 a person's homeless rotation under the same objection, with no escape endorsement: it does not count", "Identity rule 53; the homeless procedure, step 3",
        "A person's escape needs an endorsement with the signing key; without it, the old home's objection voids the homeless rotation.", Facts::default(), json!({ "question": "chain", "identity": hx(&ivo.id) }), json!({ "counting": [hx(&ivo.id)], "next": "end", "dishonest": [] }), None);
}
