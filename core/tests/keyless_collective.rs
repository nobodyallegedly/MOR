//! The keyless collective (Identity rule 1; Agreements rules 56 to 60, 69,
//! 72 to 74; F404's decisions): a collective has no signing key; its
//! genesis declares its founding agreement and is signed by a chain key;
//! its members act for it with their own keys, each act naming the
//! collective in `objects`, counted under the rule of the act's layer
//! (terms field 19) or of a finer area (field 34); a stranger's act naming
//! it is nobody's; any member draws its records; a record puts a
//! membership clone in force, a rotation only where the key grammar
//! changes or a holder of the chain key leaves (Q4); its grants carry no
//! grant key, its grantee acting with its own; its homeless rotation is
//! its own escape endorsement (Q14).

mod common;

use common::*;
use mor_core::act::Object;
use mor_core::agreements::{
    self, outcomes, Abandonment, Authority, Consent, Field4, Grant, Holding, KeyGrammar, Kind, MarkEntry, Mirs, Power, Record, Recovery, Rule, Stake, Target,
    Terms, Who,
};
use mor_core::agreements::AgreementsView;
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::hash::{sha256, Hash};

fn mirs() -> Mirs {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mirs { identity: identity_spec(), envelopes: t("ENVELOPE"), text: t("TEXT"), money: t("FINANCE"), agreements: t("LAW"), development: t("PRODUCTION") }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn view(w: &World) -> AgreementsView<'_> {
    AgreementsView::new(&w.v, mirs())
}

fn act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mirs().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    act(w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), Some(vec![Object { chain: *x, predecessor: *x }]))
}

/// Ana, Ben and Cy's band: Money is Ben's alone (`[2, [ben]]`), every
/// other layer any one member (`[1, 1]`); the chain key any three of three
/// shares, an escrowed share for the way out.
struct Band {
    w: World,
    m: Vec<Person>,
    col: Person,
    founding: Hash,
}

fn terms(ids: &[Hash], authority: Hash) -> Terms {
    let mut t = deal_terms(ids, "The band's constitution.");
    t.clone = Rule::Threshold(2);
    t.abandonment = Some(Abandonment { authority: Authority::Named(authority), outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED], proof: None });
    t.grammar = Some(KeyGrammar { chain_key: Holding::Shares { threshold: ids.len() as u64, members: ids.to_vec() }, recovery: Some(Recovery::Escrow { authority }) });
    let mut layers = layers_all(Rule::Threshold(1));
    layers[2].1 = Rule::Named(vec![ids[1.min(ids.len() - 1)]]);
    t.layers = Some(layers);
    t.target = Some(Target::Collective);
    let n = ids.len() as u64;
    let mut shares: Vec<u64> = vec![1_000_000 / n; ids.len()];
    shares[0] += 1_000_000 - shares.iter().sum::<u64>();
    t.stakes = Some(vec![Stake { object: Who::This, holders: ids.iter().copied().zip(shares).map(|(h, s)| (Who::Id(h), s)).collect() }]);
    t
}

fn band() -> Band {
    let mut w = World::new();
    let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis("the band's authority", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let t = terms(&ids, authority.id);
    assert_eq!(t.check(&mirs()), Ok(()));
    let founding = act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &founding);
    }
    let col = w.genesis_with("the band", vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
    Band { w, m, col, founding }
}

fn pointer(payee: Hash) -> Vec<(Value, Value)> {
    mor_core::money::Payload::PayeePointer(mor_core::money::PayeePointer {
        payee,
        version: 1,
        previous: None,
        rails: vec![mor_core::money::Rail { module: spec("a rail Module"), address: b"the band's address".to_vec() }],
    })
    .to_map()
}

#[test]
fn a_collectives_genesis_declares_no_signing_key_and_it_signs_no_everyday_act() {
    let mut b = band();
    assert!(b.col.keyless);
    assert_eq!(b.w.v.status(&b.col.id), Status::Valid);
    let res = b.w.v.resolve(&b.col.id);
    assert_eq!(res.links.len(), 1);
    assert!(res.states[0].signing_key.is_none(), "Identity rule 1: none for good");
    // An everyday act signed by the collective's identity: invalid
    // (everyday check 4).
    let c = b.col.id;
    let x = b.w.everyday_act(&mut b.col, mirs().money, 0, pointer(c), None, None);
    let x = b.w.add(&x);
    assert_eq!(b.w.v.status(&x), Status::Invalid, "a collective signs no everyday act");
}

#[test]
fn a_members_act_naming_the_collective_counts_under_its_layers_rule() {
    let mut b = band();
    let c = b.col.id;
    // Ben, who alone acts for the band in Money, draws its payee pointer.
    let mut ben = b.m[1].acting_for(c, vec![c]);
    let p = b.w.everyday_act(&mut ben, mirs().money, 0, pointer(c), None, None);
    let p = b.w.add(&p);
    assert_eq!(b.w.v.status(&p), Status::Valid, "the member's own act, under Identity");
    assert!(view(&b.w).consent(&p).unwrap().counts(), "{:?}", view(&b.w).consent(&p));
    // Ana's pointer for the band: the rule for Money is Ben's; she alone
    // does not meet it; Ben's signature act naming it does.
    let mut ana = b.m[0].acting_for(c, vec![c]);
    let q = b.w.everyday_act(&mut ana, mirs().money, 0, pointer(c), None, None);
    let q = b.w.add(&q);
    assert!(!view(&b.w).consent(&q).unwrap().counts(), "Ana is not counted for Money");
    sign(&mut b.w, &mut b.m[1], &q);
    assert!(view(&b.w).consent(&q).unwrap().counts(), "Ben's signature meets the rule for Money");
    // A bake for the band, any one member: Cy alone.
    let mut cy = b.m[2].acting_for(c, vec![c]);
    let k = b.w.everyday_act(&mut cy, mirs().envelopes, 0, publication(vec![]), None, None);
    let k = b.w.add(&k);
    assert!(view(&b.w).consent(&k).unwrap().counts(), "the rule for Envelopes, any one member");
}

#[test]
fn a_strangers_act_naming_the_collective_is_nobodys() {
    let mut b = band();
    let c = b.col.id;
    let stranger = b.w.genesis("a stranger", vec![own_home()], None, None);
    let mut s = stranger.acting_for(c, vec![c]);
    let x = b.w.everyday_act(&mut s, mirs().envelopes, 0, publication(vec![]), None, None);
    let x = b.w.add(&x);
    assert_eq!(b.w.v.status(&x), Status::Valid, "the stranger's own act under Identity");
    assert!(!view(&b.w).consent(&x).unwrap().counts(), "nobody's for the collective");
    // An act citing no decision of the collective is on none of its chains.
    let mut cy = b.m[2].clone();
    cy.cite = Some((c, vec![spec("no act of the band")]));
    let y = b.w.everyday_act(&mut cy, mirs().envelopes, 0, publication(vec![]), None, None);
    let y = b.w.add(&y);
    assert!(matches!(view(&b.w).consent(&y), Err(_) | Ok(Consent::Uncited { .. })), "{:?}", view(&b.w).consent(&y));
}

/// A clone of the band's agreement changing `f`, marked with `mark`,
/// signed by `signers`; its id and the signature acts.
fn clone(b: &mut Band, parent: Hash, mark: Vec<(Power, Vec<usize>)>, signers: &[usize], f: &dyn Fn(&mut Terms)) -> (Hash, Vec<Hash>) {
    let mut t = view(&b.w).terms(&parent).unwrap();
    t.parent = Some(parent);
    t.field4 = Field4::Mark(
        mark.into_iter()
            .map(|(power, who)| {
                let mut s: Vec<Hash> = who.iter().map(|i| b.m[*i].id).collect();
                s.sort();
                MarkEntry { power, signers: s }
            })
            .collect(),
    );
    f(&mut t);
    let k = act(&mut b.w, &mut b.m[0], agreements::types::TERMS, t.to_map(), Some(vec![Object { chain: parent, predecessor: parent }]));
    let sigs = signers.iter().map(|i| sign(&mut b.w, &mut b.m[*i], &k)).collect();
    (k, sigs)
}

#[test]
fn any_member_draws_the_record_and_a_membership_clone_comes_into_force_by_record() {
    let mut b = band();
    let c = b.col.id;
    let ids: Vec<Hash> = b.m.iter().map(|p| p.id).collect();
    // An operational clone: a cMIP for an Agreements task, under the rule
    // for Agreements, any one member, `[6, 4]`.
    let founding = b.founding;
    let ag = Power::Layer(agreements::layers::AGREEMENTS);
    let (k, sigs) = clone(&mut b, founding, vec![(ag.clone(), vec![0])], &[0], &|t| t.cmips.push((13, spec("a claims cMIP"))));
    // Cy, a member holding nothing in particular, draws the record.
    let mut cy = b.m[2].acting_for(c, vec![c]);
    let r = Record { clone: Some(k), signatures: Some(sigs), registers: None };
    let rec = b.w.everyday_act(&mut cy, mirs().agreements, agreements::types::RECORD, r.to_map(), Some(vec![Object { chain: k, predecessor: k }]), None);
    let rec = b.w.add(&rec);
    let e = view(&b.w).record(&c, &rec).unwrap();
    assert!(e.line && e.puts == Some(k), "{e:?}");
    assert_eq!(view(&b.w).current(&c).unwrap().unwrap().agreement, k);
    // A stranger's record names the band and puts nothing in force.
    let stranger = b.w.genesis("a stranger", vec![own_home()], None, None);
    let mut s = stranger.acting_for(c, vec![rec]);
    let (k2, sigs2) = clone(&mut b, k, vec![(ag.clone(), vec![0])], &[0], &|t| t.cmips.push((12, spec("a grant limits cMIP"))));
    let r2 = Record { clone: Some(k2), signatures: Some(sigs2), registers: None };
    let rec2 = b.w.everyday_act(&mut s, mirs().agreements, agreements::types::RECORD, r2.to_map(), Some(vec![Object { chain: k2, predecessor: k2 }]), None);
    let rec2 = b.w.add(&rec2);
    let e2 = view(&b.w).record(&c, &rec2).unwrap();
    assert!(!e2.line && e2.puts.is_none(), "{e2:?}");
    // Q4: adding a member is a constitutional clone; with the key grammar
    // unchanged and no key holder leaving, a record puts it in force.
    let dee = b.w.genesis("dee", vec![own_home()], None, None);
    b.m.push(dee);
    let mut new_ids = ids.clone();
    new_ids.push(b.m[3].id);
    let (k3, sigs3) = clone(&mut b, k, vec![(Power::Constitutional, vec![0, 1, 2])], &[0, 1, 2, 3], &|t| {
        t.parties = new_ids.clone();
        let mut st = t.stakes.clone().unwrap();
        st[0].holders = vec![(Who::Id(new_ids[0]), 250_000), (Who::Id(new_ids[1]), 250_000), (Who::Id(new_ids[2]), 250_000), (Who::Id(new_ids[3]), 250_000)];
        t.stakes = Some(st);
    });
    let mut ana = b.m[0].acting_for(c, vec![rec]);
    let r3 = Record { clone: Some(k3), signatures: Some(sigs3), registers: None };
    let rec3 = b.w.everyday_act(&mut ana, mirs().agreements, agreements::types::RECORD, r3.to_map(), Some(vec![Object { chain: k3, predecessor: k3 }]), None);
    let rec3 = b.w.add(&rec3);
    let e3 = view(&b.w).record(&c, &rec3).unwrap();
    assert!(e3.line && e3.puts == Some(k3), "a record puts a membership clone in force (rule 69): {e3:?}");
    // A clone changing the key grammar puts nothing in force by record:
    // only a rotation declares it.
    let (k4, sigs4) = clone(&mut b, k3, vec![(Power::Constitutional, vec![0, 1, 2, 3])], &[0, 1, 2, 3], &|t| {
        t.grammar = Some(KeyGrammar { chain_key: Holding::Shares { threshold: 3, members: new_ids.clone() }, recovery: t.grammar.clone().unwrap().recovery });
    });
    let mut ben = b.m[1].acting_for(c, vec![rec3]);
    let r4 = Record { clone: Some(k4), signatures: Some(sigs4.clone()), registers: None };
    let rec4 = b.w.everyday_act(&mut ben, mirs().agreements, agreements::types::RECORD, r4.to_map(), Some(vec![Object { chain: k4, predecessor: k4 }]), None);
    let rec4 = b.w.add(&rec4);
    let e4 = view(&b.w).record(&c, &rec4).unwrap();
    assert!(e4.line && e4.puts.is_none(), "{e4:?}");
    // The rotation declaring it: its history is that of the signature
    // acts it names.
    let (rot, _col2) = b.w.rotate(&b.col, Rot { declarations: Some(vec![agreements::clone_declaration(&mirs().agreements, &k4, &sigs4)]), ..Default::default() });
    assert_eq!(b.w.v.status(&rot), Status::Valid);
    assert_eq!(b.w.v.resolve(&c).links.len(), 2);
}

#[test]
fn a_collectives_grant_carries_no_key_and_its_grantee_acts_with_its_own() {
    let mut b = band();
    let c = b.col.id;
    let mut agent = b.w.genesis("a booking agent", vec![own_home()], None, None);
    // A grant for the band in Envelopes, drawn by Ana, under the rule for
    // Agreements (any one member), naming the grantee.
    let g = Grant { grantee: agent.id, scope: 2, agreements: None, limits: None, limits_cmip: None, area: None, kinds: Some(vec![Kind::Layer(agreements::layers::ENVELOPES)]), reinstates: None, key: None };
    let mut ana = b.m[0].acting_for(c, vec![c]);
    let gid = b.w.everyday_act(&mut ana, mirs().agreements, agreements::types::GRANT, g.to_map(), None, None);
    let gid = b.w.add(&gid);
    assert!(view(&b.w).consent(&gid).unwrap().counts(), "{:?}", view(&b.w).consent(&gid));
    sign(&mut b.w, &mut agent, &gid);
    // The grantee acts with its own key, naming the band and the grant.
    let mut a = agent.acting_for(c, vec![gid]);
    let x = b.w.everyday_act(&mut a, mirs().envelopes, 0, publication(vec![]), None, None);
    let x = b.w.add(&x);
    assert!(view(&b.w).consent(&x).unwrap().counts(), "{:?}", view(&b.w).consent(&x));
    // Beyond its reach: a Money act.
    let y = b.w.everyday_act(&mut a, mirs().money, 0, pointer(c), None, None);
    let y = b.w.add(&y);
    assert!(!view(&b.w).consent(&y).unwrap().counts(), "beyond the grant's reach");
    // A collective's grant carrying a key is invalid.
    let keyed = Grant { key: Some(signing_key(&schnorr("a key", 0))), ..g };
    let kid = b.w.everyday_act(&mut ana, mirs().agreements, agreements::types::GRANT, keyed.to_map(), None, None);
    let kid = b.w.add(&kid);
    assert!(matches!(view(&b.w).consent(&kid).unwrap(), Consent::Invalid { .. }));
}

#[test]
fn a_collectives_homeless_rotation_is_its_own_escape_endorsement() {
    // Q14 (Identity section 11): steps 1, 2 and 5 apply, not 3 and 4: an
    // old home's objection never voids it.
    let mut w = World::new();
    let mut home = w.operator("an old home");
    let new_home = w.operator("a new home");
    let mut a = w.genesis("ana", vec![own_home()], None, None);
    let mut t = terms(&[a.id], a.id);
    t.parties = vec![a.id];
    t.grammar = Some(KeyGrammar { chain_key: Holding::One(a.id), recovery: Some(Recovery::Escrow { authority: spec("an authority") }) });
    t.abandonment = Some(Abandonment { authority: Authority::Named(spec("an authority")), outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED], proof: None });
    t.layers = Some(layers_all(Rule::All));
    t.stakes = Some(vec![Stake { object: Who::This, holders: vec![(Who::Id(a.id), 1_000_000)] }]);
    t.succession = Some(vec![agreements::SuccessionPlan { party: a.id, stakes: None, seats: Some(vec![spec("a successor")]), entry: None }]);
    let f = act(&mut w, &mut a, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut a, &f);
    let col = w.genesis_with("a band of one", vec![common::home(&home)], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &f)]), 3);
    // A homeless rotation to a new home, the old home alive and objecting.
    let (rot, _) = w.rotate(&col, Rot { homes: Some(vec![common::home(&new_home)]), homeless: true, ..Default::default() });
    let mut nh = new_home.clone();
    w.receipt(&mut nh, &col.id, &rot, 1);
    w.object(&mut home, &col.id, &rot);
    let res = w.v.resolve(&col.id);
    assert_eq!(res.links.len(), 2, "it counts: the objection never voids a collective's homeless rotation");
}

/// Rules 58, 60 and 74: a grant within an area counts once the area's
/// rule is met, its drafter's own act counting as their signature. Drawn
/// by a holder of an area whose number is one, it counts with no other
/// signature, and its grantee's act within it counts; drawn by a member
/// holding no part of the area, no holder signing, it counts for nothing,
/// and neither does its grantee's act.
#[test]
fn a_grant_in_an_area_counts_once_the_areas_rule_is_met_its_drafter_signing_by_drafting() {
    for (drafter, counts) in [(0usize, true), (2usize, false)] {
        let mut w = World::new();
        let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
        let authority = w.genesis("the band's authority", vec![own_home()], None, None);
        let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
        let mut t = terms(&ids, authority.id);
        let money: Vec<Kind> = [0, 1, 2].into_iter().map(|ty| Kind::Type { spec: mirs().money, type_: ty }).collect();
        t.areas = Some(vec![agreements::Area { name: "Money".into(), holders: vec![ids[0], ids[1]], threshold: 1, kinds: Some(money.clone()), fields: None, id: 2, limits: None }]);
        assert_eq!(t.check(&mirs()), Ok(()));
        let founding = act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
        for p in m.iter_mut() {
            sign(&mut w, p, &founding);
        }
        let col = w.genesis_with("the band", vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
        let c = col.id;
        let mut agent = w.genesis("the band's money agent", vec![own_home()], None, None);
        let g = Grant { grantee: agent.id, scope: 2, agreements: None, limits: None, limits_cmip: None, area: Some(2), kinds: Some(money), reinstates: None, key: None };
        let mut d = m[drafter].acting_for(c, vec![c]);
        let gid = w.everyday_act(&mut d, mirs().agreements, agreements::types::GRANT, g.to_map(), None, None);
        let gid = w.add(&gid);
        sign(&mut w, &mut agent, &gid);
        assert_eq!(view(&w).consent(&gid).unwrap().counts(), counts, "the grant, drawn by member {drafter}: {:?}", view(&w).consent(&gid));
        let mut a = agent.acting_for(c, vec![gid]);
        let x = w.everyday_act(&mut a, mirs().money, 0, pointer(c), None, None);
        let x = w.add(&x);
        assert_eq!(view(&w).consent(&x).unwrap().counts(), counts, "the grantee's act, the grant drawn by member {drafter}: {:?}", view(&w).consent(&x));
    }
}
