//! Verdict vectors: complete acts, what the verifier holds beside them, and
//! the verdict each must get, with the rule that decides it. Every layer.
//!
//! Each case is built in a world of test identities (`tests/common`): keys
//! from names, every act signed and held. The generator asserts each
//! verdict against the one written here from the texts, so a vector is
//! published only when the library gives it; `tests/vectors.rs` then reads
//! the published bytes back into a fresh verifier and asks again.

use super::common::*;
use mor_core::act::Object;
use mor_core::agreements::{
    self, outcomes, Abandonment, Area, Authority, AgreementsView, Backing, Field4, Grant, Holding, KeyGrammar, Keepers, Kind, Mirs, Recovery, Rule,
    Terms,
};
use mor_core::cbor::{self, Value};
use mor_core::chain::{Status, Stop};
use mor_core::development::{kinds, Judged, Spec};
use mor_core::envelopes::anchoring::{Anchor, Reference};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::{Audit, Home, Successor};
use mor_core::money::{self, Amount, Claim, Payload as Fin, Payer, Receipt};
use serde_json::{json, Value as J};
use std::collections::BTreeMap;

fn hx(b: &[u8]) -> String {
    hex::encode(b)
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

pub fn mirs() -> Mirs {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mirs {
        identity: identity_spec(),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: t("FINANCE"),
        agreements: t("LAW"),
        development: t("PRODUCTION"),
    }
}

fn home_of(p: &Person) -> Home {
    home(p)
}

/// A payee pointer of `p`, held.
fn pointer_act(w: &mut World, p: &mut Person, address: &[u8]) -> Hash {
    let rail = spec("a rail Module");
    let x = Fin::PayeePointer(money::PayeePointer { payee: p.id, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: address.to_vec() }] });
    let a = w.everyday_act(p, mirs().money, 0, x.to_map(), None, None);
    w.add(&a)
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object { chain: x, predecessor: x }])
}

fn ag_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mirs().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    ag_act(w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), obj(*x))
}

fn view(w: &World) -> AgreementsView<'_> {
    AgreementsView::new(&w.v, mirs())
}

fn status_name(s: Status) -> &'static str {
    match s {
        Status::Valid => "valid",
        Status::Disputed => "disputed",
        Status::Void => "void",
        Status::Pending => "pending",
        Status::Invalid => "invalid",
        Status::Unknown => "unknown",
        Status::Scoped => "scoped",
    }
}

pub fn backing_name(b: &Backing) -> &'static str {
    match b {
        Backing::NotUnderGrant => "not under a grant",
        Backing::Backed { .. } => "backed",
        Backing::NotBacked { .. } => "not backed (void)",
        Backing::Binds { .. } => "binds",
        Backing::Unknown { .. } => "unknown",
        Backing::Disputed { .. } => "disputed",
    }
}

/// The deal terms the cases use: two or more parties, every party signing
/// every clone, no areas, no grammar.
fn deal(parties: &[Hash], keepers: Option<Keepers>) -> Terms {
    Terms {
        parties: parties.to_vec(),
        text: "A deal between test identities.".into(),
        cmips: vec![(6, spec("a payment cMIP"))],
        keepers,
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
        plan: None,
        refund: None,
        fees: None,
        backups: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    }
}

/// A collective's founding terms: three members; Ana holds the area
/// reaching publications and texts (1), Ben the area reaching Money (2,
/// threshold `money`).
fn collective_terms(ids: &[Hash], authority: Hash, keeper: Hash, money_holders: Vec<Hash>, money: u64) -> Terms {
    let m = mirs();
    let mut t = deal(ids, Some(Keepers { operators: vec![keeper], rule: Rule::All }));
    t.text = "A test collective of three members.".into();
    t.clone = Rule::Threshold(2);
    t.abandonment = Some(Abandonment { authority: Authority::Named(authority), outcomes: vec![outcomes::VOICE_REMOVED], proof: None });
    t.grammar = Some(KeyGrammar {
        signing: Holding::Shares { threshold: 2, members: ids.to_vec() },
        chain_key: Holding::Shares { threshold: ids.len() as u64, members: ids.to_vec() },
        recovery: Some(Recovery::Escrow { authority }),
    });
    t.areas = Some(vec![
        Area {
            name: "Releases".into(),
            holders: vec![ids[0]],
            threshold: 1,
            kinds: Some(vec![Kind::Type { spec: m.envelopes, type_: 0 }, Kind::Layer(agreements::layers::ENVELOPES_AND_TEXT)]),
            fields: None,
            id: 1,
            limits: None,
        },
        Area { name: "Money".into(), holders: money_holders, threshold: money, kinds: Some(vec![Kind::Layer(agreements::layers::MONEY)]), fields: None, id: 2, limits: None },
    ]);
    t
}

/// A collective: its members, its devices (one), the founding signed by all.
struct Col {
    m: Vec<Person>,
    c: Person,
    founding: Hash,
}

fn collective(w: &mut World, money_holders: &[usize], money: u64) -> Col {
    let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis("an abandonment authority", vec![own_home()], None, None);
    let keeper = w.genesis("the collective's keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let t = collective_terms(&ids, authority.id, keeper.id, money_holders.iter().map(|i| ids[*i]).collect(), money);
    let founding = ag_act(w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(w, p, &founding);
    }
    let mut c = w.genesis_with("a collective", vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
    c.cite = Some((c.id, vec![c.id]));
    Col { m, c, founding }
}

/// A member's key, named by their signature of the founding.
fn member_key(w: &mut World, col: &mut Col, by: usize, name: &str) -> Person {
    let k = schnorr(&format!("{name}/member key"), 0);
    let f = col.founding;
    let s = ag_act(w, &mut col.m[by], agreements::types::SIGNATURE, agreements::signature_payload_with_key(&f, &signing_key(&k)), obj(f));
    let mut p = col.c.clone();
    p.binding = s;
    p.sign = k;
    p.seq = vec![];
    p
}

/// A grant key of a person: their grant naming the grantee and its key.
fn grant_key_person(w: &mut World, grantor: &mut Person, grantee: &mut Person, kinds: Vec<Kind>) -> (Hash, Person) {
    let k = schnorr(&format!("{}/grant key", grantee.name), 0);
    let grant = Grant { grantee: grantee.id, scope: 2, agreements: None, this_agreement: false, limits: None, limits_cmip: None, area: None, kinds: Some(kinds), reinstates: None, by_this: false, key: signing_key(&k) };
    let g = ag_act(w, grantor, agreements::types::GRANT, grant.to_map(), None);
    sign(w, grantee, &g);
    let mut s = grantor.clone();
    s.binding = g;
    s.sign = k;
    s.seq = vec![];
    s.cite = Some((grantor.id, vec![g]));
    (g, s)
}

fn keep(w: &mut World, keeper: &mut Person, act: Hash, signer: Hash) -> Hash {
    ag_act(w, keeper, agreements::types::KEEPER_RECORD, agreements::KeeperRecord { act, signer }.to_map(), None)
}

fn text_act(w: &mut World, p: &mut Person, text: &str, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mirs().text, 0, vec![(Value::Uint(0), Value::Text(text.into()))], objects, None);
    w.add(&a)
}

// ---------------------------------------------------------------- facts and questions

/// What a verifier holds beside the acts, for one case.
#[derive(Default)]
pub struct Facts {
    pub proofs: Vec<(Hash, u64, Vec<Hash>)>,
    pub failed_to_reach: Vec<Hash>,
    pub anchors: Vec<(Hash, Reference, u64)>,
    pub rail_valid: Vec<(Hash, Hash)>,
}

impl Facts {
    fn to_json(&self) -> J {
        let mut m = serde_json::Map::new();
        if !self.proofs.is_empty() {
            m.insert(
                "inclusion_proofs".into(),
                self.proofs.iter().map(|(s, i, p)| json!({ "summary": hx(s), "index": i, "path": p.iter().map(|x| hx(x)).collect::<Vec<_>>() })).collect(),
            );
        }
        if !self.failed_to_reach.is_empty() {
            m.insert("failed_to_reach".into(), self.failed_to_reach.iter().map(|x| hx(x)).collect());
        }
        if !self.anchors.is_empty() {
            m.insert(
                "anchors".into(),
                self.anchors.iter().map(|(a, r, p)| json!({ "act": hx(a), "clock": hx(&cbor::encode(&r.to_value())), "point": p })).collect(),
            );
        }
        if !self.rail_valid.is_empty() {
            m.insert("rail_valid".into(), self.rail_valid.iter().map(|(a, to)| json!({ "act": hx(a), "paid_to_flow": hx(to) })).collect());
        }
        J::Object(m)
    }

    fn apply(&self, w: &mut World) {
        for (s, i, p) in &self.proofs {
            w.v.add_inclusion_proof(*s, *i, p.clone());
        }
        for o in &self.failed_to_reach {
            w.v.failed_to_reach(*o);
        }
    }

    fn apply_view(&self, v: &mut AgreementsView) {
        for (a, r, p) in &self.anchors {
            v.anchored.add(&Anchor { act: *a, reference: r.clone(), point: *p });
        }
        for (a, to) in &self.rail_valid {
            v.rail_valid.insert(*a, money::PaidAt::Flow(*to));
        }
    }
}

/// Answer a question from what `w` holds: the same procedure
/// `tests/vectors.rs` runs on the published bytes.
pub fn answer(w: &mut World, facts: &Facts, ask: &J) -> J {
    facts.apply(w);
    let h = |k: &str| -> Hash { hex::decode(ask[k].as_str().unwrap()).unwrap().try_into().unwrap() };
    match ask["question"].as_str().unwrap() {
        // An act that does not open (Envelopes rules 1 to 5; a text field
        // not canonical among them) is invalid: the verifier cannot hold it.
        "status" if w.v.get(&h("act")).is_none() && w.log.iter().any(|(a, _)| a.id() == h("act")) => json!("invalid"),
        "status" => json!(status_name(w.v.status(&h("act")))),
        // The verdict of a verifier implementing the six MIRs and nothing
        // else (Envelopes rule 30): Identity's standing, save that an act
        // under any other specification that no rule shows invalid is
        // unknown to it.
        "verdict, implementing the MIRs only" => {
            let id = h("act");
            let st = w.v.status(&id);
            let m = mirs();
            let mir = w.v.get(&id).is_some_and(|x| [m.identity, m.envelopes, m.text, m.money, m.agreements, m.development].contains(&x.inside.spec));
            json!(match st {
                Status::Valid | Status::Scoped if !mir => "unknown",
                s => status_name(s),
            })
        }
        "chain" => {
            let r = w.v.resolve(&h("identity"));
            let stop = match r.stop {
                Stop::NoGenesis => "no genesis",
                Stop::Unknown => "unknown",
                Stop::Invalid => "invalid genesis",
                Stop::End => "end",
                Stop::Pending(_) => "pending",
                Stop::Contested(_) => "contested",
                Stop::CannotTell(_) => "cannot tell",
            };
            json!({ "counting": r.links.iter().map(|l| hx(&l.act)).collect::<Vec<_>>(), "next": stop,
                    "dishonest": r.dishonest.iter().map(|(o, p)| json!({ "operator": match o { mor_core::identity::Operator::Id(x) => hx(x), mor_core::identity::Operator::Own => "own".into() }, "from_position": p })).collect::<Vec<_>>() })
        }
        "status after keepers" => {
            let rescued = view(w).keeper_disputed_acts();
            for a in rescued {
                w.v.keeper_recorded(a);
            }
            json!(status_name(w.v.status(&h("act"))))
        }
        "backing" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(v.backing(&h("act")).map(|b| backing_name(&b)).unwrap_or("error"))
        }
        "consent counts" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(v.consent(&h("act")).map(|c| c.counts()).unwrap_or(false))
        }
        "agreement exists" => json!(match view(w).agreement(&h("act")).map(|a| a.exists) {
            Ok(Some(true)) => "exists",
            Ok(Some(false)) => "does not exist",
            Ok(None) => "a clone put in force by a record",
            Err(_) => "unknown",
        }),
        "deal fork" => json!(match view(w).deal_fork(&h("act")) {
            Ok(None) => json!("one version in force"),
            Ok(Some(f)) => json!({ "reference": hx(&f.reference), "branches": f.branches.len(), "tangled": f.tangled.is_some() }),
            Err(_) => json!("unknown"),
        }),
        "deadline" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            let ops: Vec<Hash> = ask["keepers"].as_array().unwrap().iter().map(|x| hex::decode(x.as_str().unwrap()).unwrap().try_into().unwrap()).collect();
            let rule = match ask["rule"].as_u64() {
                Some(0) | None => Rule::All,
                Some(k) => Rule::Threshold(k),
            };
            let k = Keepers { operators: ops, rule };
            let clock = Reference::decode(&cbor::decode(&hex::decode(ask["clock"].as_str().unwrap()).unwrap()).unwrap()).unwrap();
            json!(match v.deadline(&h("act"), Some(&k), &clock, ask["point"].as_u64().unwrap()) {
                agreements::Deadline::Met { by_anchor: true } => "met, by an anchor of the act",
                agreements::Deadline::Met { by_anchor: false } => "met, by the keepers' anchored records",
                agreements::Deadline::Missed { .. } => "missed",
                agreements::Deadline::Undetermined => "undetermined",
            })
        }
        "paid toward" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(v.paid_toward(&h("act")))
        }
        "disagreements" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(v.disagreements(&h("receiver")).len())
        }
        q => panic!("no such question: {q}"),
    }
}

// ---------------------------------------------------------------- the cases

pub struct Out {
    pub pool: BTreeMap<String, String>,
    pub cases: Vec<J>,
}

impl Out {
    #[allow(clippy::too_many_arguments)]
    fn case(&mut self, w: &mut World, name: &str, rule: &str, why: &str, facts: Facts, ask: J, expect: J, python: Option<&str>) {
        let mut acts = vec![];
        for (a, key) in &w.log {
            assert!(key.is_none(), "{name}: the vectors hold public acts only");
            let id = hx(&a.id());
            self.pool.insert(id.clone(), hx(&a.encode()));
            acts.push(id);
        }
        let got = answer(w, &facts, &ask);
        assert_eq!(got, expect, "{name}");
        let mut c = json!({ "name": name, "rule": rule, "why": why, "acts": acts, "facts": facts.to_json(), "ask": ask, "verdict": got });
        if let Some(p) = python {
            c["python"] = json!(p);
        }
        self.cases.push(c);
    }
}

fn ask_status(act: &Hash) -> J {
    json!({ "question": "status", "act": hx(act) })
}

fn ask(q: &str, act: &Hash) -> J {
    json!({ "question": q, "act": hx(act) })
}

pub fn identity(out: &mut Out) {
    // A genesis, valid.
    let mut w = World::new();
    let ana = w.genesis("ana", vec![own_home()], None, None);
    out.case(&mut w, "a genesis, valid", "Identity, genesis checks 1 to 5", "Signed by the signing key it declares, with a home.", Facts::default(), ask_status(&ana.id), json!("valid"), Some("genesis checks"));

    // A genesis signed by another key than it declares.
    let mut w = World::new();
    let p = w.genesis("bea", vec![own_home()], None, None);
    let a = w.log.last().unwrap().0.clone();
    let mut forged = a.clone();
    forged.signature = schnorr("someone else", 0).sign(&a.id(), &[0; 32]);
    let mut w2 = World::new();
    w2.add(&forged);
    out.case(&mut w2, "a genesis signed by a key it does not declare", "Identity rule 1; genesis check 2", "A genesis MUST be signed by the signing key it declares.", Facts::default(), ask_status(&p.id), json!("invalid"), Some("genesis checks"));

    // A rotation that counts, and one pending.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let j = w.genesis("jo", vec![home_of(&home)], None, None);
    let (r1, j1) = w.rotate(&j, Rot::default());
    w.receipt(&mut home, &j.id, &r1, 1);
    let (r2, mut j2) = w.rotate(&j1, Rot::default());
    let post = w.post(&mut j2, "bound to the pending rotation");
    out.case(&mut w, "a rotation counting on its home's receipt", "Identity, \"Which rotation counts\"; receipt checks 1 to 6", "The home the rule names receipted it.", Facts::default(), ask_status(&r1), json!("valid"), None);
    let mut w2 = World::new();
    for (a, _) in &w.log {
        w2.add(a);
    }
    out.case(&mut w2, "a rotation not yet receipted: pending", "Identity rule 28", "No receipt of its home yet.", Facts::default(), ask_status(&r2), json!("pending"), None);
    let mut w3 = World::new();
    for (a, _) in &w.log {
        w3.add(a);
    }
    out.case(&mut w3, "an act bound to a pending rotation: pending", "Identity rule 28; everyday check 2", "Its binding is a rotation that does not count yet.", Facts::default(), ask_status(&post), json!("pending"), None);

    // Contested: one home receipts two genuine rotations at one position.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let j = w.genesis("kim", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&j, Rot::default());
    let (rival, _) = w.rotate(&j, Rot { signing_key: Some(schnorr("a thief", 1)), ..Default::default() });
    w.receipt(&mut home, &j.id, &r, 1);
    w.receipt(&mut home, &j.id, &rival, 1);
    out.case(&mut w, "two genuine rotations receipted by one home: contested", "Identity rule 44; \"Conflicting receipts\" 1", "Neither receipt counts; the identity is contested at position 1, not frozen.",
        Facts::default(), json!({ "question": "chain", "identity": hx(&j.id) }), json!({ "counting": [hx(&j.id)], "next": "contested", "dishonest": [] }), None);

    // A disowned act: void; acknowledged by another: disputed.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let mut reader = w.genesis("a reader", vec![own_home()], None, None);
    let mut j = w.genesis("lou", vec![home_of(&home)], None, None);
    let thief = w.post(&mut j, "the thief's post");
    let relied = w.post(&mut j, "a post someone relied on");
    w.ack(&mut reader, relied);
    let (r, _) = w.rotate(&j, Rot { disowned: Some(vec![thief, relied]), ..Default::default() });
    w.receipt(&mut home, &j.id, &r, 1);
    let log = w.log.clone();
    out.case(&mut w, "an act a rotation disowns: void", "Identity rule 34", "Disowned, relied on by nobody.", Facts::default(), ask_status(&thief), json!("void"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "a disowned act another identity acknowledged: disputed", "Identity rule 34", "Another identity acknowledged it by a witness act (Identity type 15).", Facts::default(), ask_status(&relied), json!("disputed"), None);

    // A disowned act a deal's keeper recorded before the rotation: disputed; one an unnamed keeper recorded: void.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut keeper = w.genesis("the deal's keeper", vec![own_home()], None, None);
    let mut other = w.genesis("a keeper nobody named", vec![own_home()], None, None);
    let mut ana = w.genesis("ana", vec![home_of(&home)], None, None);
    let t0 = deal(&[ana.id, ben.id], Some(Keepers { operators: vec![keeper.id], rule: Rule::All }));
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let live = |w: &mut World, p: &mut Person| ag_act(w, p, agreements::new_types::LIVENESS, agreements::Liveness { agreement: d }.to_map(), obj(d));
    let x = live(&mut w, &mut ana);
    let y = live(&mut w, &mut ana);
    keep(&mut w, &mut keeper, x, ana.id);
    keep(&mut w, &mut other, y, ana.id);
    let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x, y]), ..Default::default() });
    w.receipt(&mut home, &ana.id, &r, 1);
    keep(&mut w, &mut keeper, r, ana.id);
    keep(&mut w, &mut other, r, ana.id);
    let log = w.log.clone();
    out.case(&mut w, "a disowned act its deal's keeper recorded before the rotation: disputed", "Identity rule 34; Agreements rules 41 and 42, \"Belongs to\", \"Keeper record (type 2)\"",
        "The act names the deal in objects, so belongs to it; the keeper the deal names recorded it before recording the rotation. The keeper records are type 2 acts the verifier reads; Agreements tells Identity which acts its keepers rescue.",
        Facts::default(), ask("status after keepers", &x), json!("disputed"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "the same recorded by a keeper the deal does not name: void", "Agreements rule 42; Identity rule 34", "A record counts only from a keeper named by an agreement the act belongs to.", Facts::default(), ask("status after keepers", &y), json!("void"), None);

    // An escape: a homeless rotation with both keys past a hostile home.
    let mut w = World::new();
    let old = w.operator("a hostile home");
    let mut new = w.operator("a new home");
    let mut e = w.genesis("eve", vec![home_of(&old)], None, None);
    let (r, _) = w.rotate(&e, Rot { homes: Some(vec![home_of(&new)]), homeless: true, ..Default::default() });
    w.endorse(&mut e, &r, None);
    w.receipt(&mut new, &e.id, &r, 1);
    out.case(&mut w, "an escape: a homeless rotation endorsed by the signing key", "Identity, \"The homeless procedure\", the escape", "Both keys, its new home's receipt; no old home's receipt is needed.", Facts::default(), ask_status(&r), json!("valid"), None);

    // A succession declared in a rotation.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let heir = w.genesis("an heir", vec![own_home()], None, None);
    let s = w.genesis("sam", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&s, Rot { successor: Some(Some(Successor { protocol: "mor".into(), identifier: heir.id.to_vec() })), ..Default::default() });
    w.receipt(&mut home, &s.id, &r, 1);
    let res = w.v.resolve(&s.id);
    assert_eq!(res.states[1].successor, Some(Successor { protocol: "mor".into(), identifier: heir.id.to_vec() }));
    out.case(&mut w, "a rotation declaring a successor: it counts, the succession declared", "Identity, \"Succession\"", "The rotation counts; the successor is shown as declared until it confirms.", Facts::default(), ask_status(&r), json!("valid"), None);

    // A forged receipt changes nothing.
    let mut w = World::new();
    let home = w.operator("the home");
    let mut stranger = w.operator("not a home of this identity");
    let j = w.genesis("fay", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut stranger, &j.id, &r, 1);
    out.case(&mut w, "a receipt from an operator that is no home of the identity changes nothing", "Identity, receipt check 3", "Only the homes the rule names count.", Facts::default(), ask_status(&r), json!("pending"), None);

    // A dishonest home, proven at a position, audited.
    let mut w = World::new();
    let mut facts = Facts::default();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let mut h3 = w.operator("home-3");
    let mut aud = w.operator("an auditor");
    let j = w.genesis("gil", vec![home_of(&h1), home_of(&h2), home_of(&h3)], None, Some(Audit { threshold: 1, auditors: vec![aud.id] }));
    let (r1, j1) = w.rotate(&j, Rot::default());
    w.receipt(&mut h1, &j.id, &r1, 1);
    w.receipt(&mut h2, &j.id, &r1, 1);
    let (r2, _) = w.rotate(&j1, Rot::default());
    let (rival, _) = w.rotate(&j1, Rot { signing_key: Some(schnorr("a thief", 2)), ..Default::default() });
    w.receipt(&mut h1, &j.id, &r2, 2);
    w.receipt(&mut h1, &j.id, &rival, 2);
    w.receipt(&mut h2, &j.id, &r2, 2);
    w.receipt(&mut h3, &j.id, &r2, 2);
    for h in [&mut h1, &mut h2, &mut h3] {
        let log = h.log.clone();
        let s = w.log_summary(h);
        for i in 0..log.len() {
            facts.proofs.push((s, i as u64, mor_core::merkle::inclusion_proof(&log, i)));
        }
        let hid = h.id;
        w.cosign(&mut aud, &s, &hid);
    }
    let mut w2 = World::new();
    for (a, _) in &w.log {
        w2.add(a);
    }
    out.case(&mut w2, "a home receipting two genuine rotations at one position, both under cosigned summaries: proven dishonest there", "Identity rule 45; \"Conflicting receipts\" 3",
        "The identity requires audit; both receipts sit under cosigned log summaries, and a cosigned receipt survives the home's rotation. Position 2 counts on homes 2 and 3; home 1 counts for nothing for this identity after position 2.",
        facts, json!({ "question": "chain", "identity": hx(&j.id) }), json!({ "counting": [hx(&j.id), hx(&r1), hx(&r2)], "next": "end", "dishonest": [{ "operator": hx(&h1.id), "from_position": 2 }] }), None);
}

pub fn text(out: &mut Out) {
    let mut w = World::new();
    let mut p = w.genesis("tom", vec![own_home()], None, None);
    let ok = text_act(&mut w, &mut p, "Plain, canonical text.", None);
    out.case(&mut w, "a text act, canonical", "Text rules 1 and 7 to 12; \"Text act (type 0)\"", "Field 0 canonical text, no other field.", Facts::default(), ask_status(&ok), json!("valid"), Some("text act format and rule 14 at a Text-only verifier"));
    let mut w = World::new();
    let mut p = w.genesis("tom", vec![own_home()], None, None);
    let bad = {
        let a = w.everyday_act(&mut p, mirs().text, 0, vec![(Value::Uint(0), Value::Text("Cafe\u{301} is not NFC.".into()))], None, None);
        assert!(w.v.add(a.clone()).is_err(), "it does not open");
        w.log.push((a.clone(), None));
        a.id()
    };
    out.case(&mut w, "a text act whose text is not in NFC: invalid", "Text rule 12", "Every text field is canonical; e followed by a combining acute is not NFC.", Facts::default(), ask_status(&bad), json!("invalid"), Some("text act format and rule 14 at a Text-only verifier"));
    let mut w = World::new();
    let mut p = w.genesis("tom", vec![own_home()], None, None);
    let x = w.post(&mut p, "a post");
    let pid = p.id;
    let two = text_act(&mut w, &mut p, "Two objects.", Some(vec![Object { chain: pid, predecessor: x }, Object { chain: pid, predecessor: pid }]));
    out.case(&mut w, "a text act carrying two objects: invalid", "Text rule 14", "Any objects outside rule 14's two cases, two objects included, is invalid at every verifier.", Facts::default(), ask_status(&two), json!("invalid"), Some("text act format and rule 14 at a Text-only verifier"));
    let mut w = World::new();
    let mut p = w.genesis("tom", vec![own_home()], None, None);
    let other = w.genesis("another identity", vec![own_home()], None, None);
    let elsewhere = text_act(&mut w, &mut p, "Naming another's chain.", Some(vec![Object { chain: other.id, predecessor: other.id }]));
    out.case(&mut w, "a text act naming another identity's chain: invalid", "Text rule 14", "Its one object must name its own signer as chain.", Facts::default(), ask_status(&elsewhere), json!("invalid"), Some("text act format and rule 14 at a Text-only verifier"));
    let mut w = World::new();
    let mut p = w.genesis("tom", vec![own_home()], None, None);
    let pid = p.id;
    let own = text_act(&mut w, &mut p, "An individual naming its own chain.", Some(vec![Object { chain: pid, predecessor: pid }]));
    out.case(&mut w, "an individual's text naming its own chain: invalid where Agreements is read", "Text rule 14", "Its signer is no collective and its key no grant key: neither case. A Text-only verifier answers unknown instead (it cannot tell a collective).", Facts::default(), ask_status(&own), json!("invalid"), Some("at a Text-only verifier: unknown"));
    // A collective's text, its one pointer to its own decision.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let cid = col.c.id;
    let t = text_act(&mut w, &mut col.c, "The collective's notice.", Some(vec![Object { chain: cid, predecessor: cid }]));
    out.case(&mut w, "a collective's text naming its own latest decision: valid", "Text rule 14, first case; Agreements rule 58", "Exactly one object, [collective, decision]: its genesis, a link of its own chain.", Facts::default(), ask_status(&t), json!("valid"), Some("at a Text-only verifier: unknown"));
    // A member key's text, naming its version.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let cid = col.c.id;
    let f = col.founding;
    let mut a = member_key(&mut w, &mut col, 0, "ana");
    let sig = a.binding;
    let good = text_act(&mut w, &mut a, "A text of the collective, by Ana's key.", Some(vec![Object { chain: cid, predecessor: f }]));
    let bad = text_act(&mut w, &mut a, "Naming the signature act.", Some(vec![Object { chain: cid, predecessor: sig }]));
    let log = w.log.clone();
    out.case(&mut w, "a member key's text naming the version that named the key: scoped, and it counts", "Text rule 14; Agreements rules 58 and 73", "The one object is [collective, the founding its binding's signature names]; Ana's area reaches texts.", Facts::default(), ask("consent counts", &good), json!(true), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "a member key's text naming the signature act itself: invalid", "Text rule 14", "For a member key the object names the version, never the signature act.", Facts::default(), ask_status(&bad), json!("invalid"), None);
}

pub fn envelopes(out: &mut Out) {
    let mut w = World::new();
    let mut p = w.genesis("uma", vec![own_home()], None, None);
    let x = w.post(&mut p, "first");
    let y = w.post(&mut p, "second");
    out.case(&mut w, "a sequence of two acts, prev, position and summary fitting: valid", "Envelopes rule 13, \"The running summary\"", "Act 2 names act 1 in prev, at position 2, carrying the summary over act 1.", Facts::default(), ask_status(&y), json!("valid"), Some("sequence"));
    let _ = x;
    // An act of a specification this verifier does not implement: unknown; the same badly signed: invalid.
    let mut w = World::new();
    let mut p = w.genesis("uma", vec![own_home()], None, None);
    let a = w.everyday_act(&mut p, spec("a cMIP nobody here implements"), 0, vec![(Value::Uint(0), Value::Uint(1))], None, None);
    let good = w.add(&a);
    let mut broken = w.everyday_act(&mut p, spec("a cMIP nobody here implements"), 0, vec![(Value::Uint(0), Value::Uint(2))], None, None);
    broken.signature.sig[0] ^= 1;
    let bad = w.add(&broken);
    let log = w.log.clone();
    out.case(&mut w, "an act under a specification the verifier does not implement: unknown", "Envelopes rule 30", "Its shape and signature check, and its signer's chain binds the key: Identity's standing is valid; its type is a cMIP's this verifier does not implement.", Facts::default(), ask("verdict, implementing the MIRs only", &good), json!("unknown"), Some("invalid beats unknown"));
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "the same with a broken signature: invalid, which beats unknown", "Envelopes rule 30; Identity, \"Every act\"", "Every rule the verifier can apply is applied first.", Facts::default(), ask("verdict, implementing the MIRs only", &bad), json!("invalid"), Some("invalid beats unknown"));
    // An everyday act with no prev: invalid; with two entries: invalid.
    let mut w = World::new();
    let mut p = w.genesis("uma", vec![own_home()], None, None);
    let a = w.everyday_act(&mut p, mirs().text, 0, vec![(Value::Uint(0), Value::Text("no prev".into()))], None, None);
    let mut inside = a.open(None).unwrap();
    inside.prev = None;
    let resealed = reseal(&mut w, &p, &inside);
    let nprev = w.add(&resealed);
    out.case(&mut w, "an everyday act with no prev: invalid", "Envelopes rule 13; Identity, everyday check 1", "Every everyday act carries key 2, with at most one entry.", Facts::default(), ask_status(&nprev), json!("invalid"), Some("sequence"));
    let mut w = World::new();
    let mut p = w.genesis("uma", vec![own_home()], None, None);
    let x = w.post(&mut p, "one");
    let a = w.everyday_act(&mut p, mirs().text, 0, vec![(Value::Uint(0), Value::Text("two prevs".into()))], None, None);
    let mut inside = a.open(None).unwrap();
    inside.prev = Some(vec![x, p.id]);
    let resealed = reseal(&mut w, &p, &inside);
    let two = w.add(&resealed);
    out.case(&mut w, "an everyday act with two prev entries: invalid", "Envelopes rule 13", "At most one entry: a sequence never branches inside one act.", Facts::default(), ask_status(&two), json!("invalid"), Some("sequence"));
}

/// The same inside, sealed again and signed by `p`'s signing key.
fn reseal(w: &mut World, p: &Person, inside: &mor_core::act::Inside) -> mor_core::act::Act {
    let _ = w;
    let key = sha256(format!("reseal/{}", inside.encode().len()).as_bytes());
    let nonce: [u8; 24] = sha256(b"reseal nonce")[..24].try_into().unwrap();
    mor_core::act::make(inside, &key, &nonce, &mor_core::act::Addressing { signer: Some(p.id), binding: Some(p.binding), public: true, to: None }, |id| p.sign.sign(id, &[0; 32]))
}

pub fn money(out: &mut Out) {
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");
    // Receipt and claim of one payment, agreeing; and disagreeing.
    for (agree, name) in [(true, "a receipt and a claim of one payment agreeing: no question on the receiver"), (false, "a receipt for less than the claim: a question on the receiver")] {
        let mut w = World::new();
        let mut payee = w.genesis("a payee", vec![own_home()], None, None);
        let mut payer = w.genesis("a payer", vec![own_home()], None, None);
        let pointer = pointer_act(&mut w, &mut payee, b"an address");
        let proof = b"one payment's proof".to_vec();
        let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(payer.id)), payee: payee.id, amount: Amount { unit, value: if agree { 100 } else { 60 } }, fulfils: pointer, previous: None, forward: None, batch: None, purchase: None });
        let rid = { let a = w.everyday_act(&mut payee, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
        let c = Fin::Claim(Claim { rail, proof, payee: payee.id, amount: Amount { unit, value: 100 }, fulfils: pointer, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let cid = { let a = w.everyday_act(&mut payer, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
        let facts = Facts { rail_valid: vec![(rid, pointer), (cid, pointer)], ..Default::default() };
        out.case(&mut w, name, "Money rule 11", "The rail's answer is stated as a fact (the core reads no rail): both valid, paid to the payee's flow. Where they disagree in amount, the greater counts and the question is shown on the receiver.",
            facts, json!({ "question": "disagreements", "receiver": hx(&payee.id) }), json!(if agree { 0 } else { 1 }), None);
    }
    // A receipt signed with a person's grant key reaching receipts: backed.
    let mut w = World::new();
    let mut payee = w.genesis("a payee", vec![own_home()], None, None);
    let mut app = w.genesis("the payee's app", vec![own_home()], None, None);
    let (_, mut lane) = grant_key_person(&mut w, &mut payee, &mut app, vec![Kind::Type { spec: mirs().money, type_: 2 }]);
    let pointer = spec("a pointer");
    let r = Fin::Receipt(Receipt { rail, proof: b"p".to_vec(), payer: None, payee: payee.id, amount: Amount { unit, value: 5 }, fulfils: pointer, previous: None, forward: None, batch: None, purchase: None });
    let rid = { let a = w.everyday_act(&mut lane, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    out.case(&mut w, "a payee's receipt signed with its grant key: backed", "Money rule 7; Agreements rules 73 and 80", "A person's grant whose kinds reach receipts; the grantee accepted it.", Facts::default(), ask("backing", &rid), json!("backed"), None);
    // A member key's receipt for the collective.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let cid = col.c.id;
    let ptr = pointer_act(&mut w, &mut col.c, b"the collective's address");
    sign(&mut w, &mut col.m[1], &ptr);
    let mut ben = member_key(&mut w, &mut col, 1, "ben");
    let mut cy = member_key(&mut w, &mut col, 2, "cy");
    let rec = |w: &mut World, k: &mut Person| {
        let r = Fin::Receipt(Receipt { rail, proof: b"q".to_vec(), payer: None, payee: cid, amount: Amount { unit, value: 7 }, fulfils: ptr, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(k, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let by_ben = rec(&mut w, &mut ben);
    let by_cy = rec(&mut w, &mut cy);
    let log = w.log.clone();
    out.case(&mut w, "a collective's receipt signed with the member key of its Money area's holder: counts", "Money rule 7; Agreements rules 60 and 73", "Ben holds the area reaching Money, at one signature.", Facts::default(), ask("consent counts", &by_ben), json!(true), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "the same signed with the member key of a member holding no Money area: does not count", "Money rule 7; Agreements rule 73", "Cy's key reaches no area that reaches Money.", Facts::default(), ask("consent counts", &by_cy), json!(false), None);
    // A transfer to one's vault: fulfils nothing in Money's sense.
    let mut w = World::new();
    let mut payee = w.genesis("a vault's owner", vec![own_home()], None, None);
    let mut debtor = w.genesis("a debtor", vec![own_home()], None, None);
    let pointer = pointer_act(&mut w, &mut payee, b"an address");
    let ob = Fin::Obligation(money::Obligation { debtor: debtor.id, creditor: payee.id, amount: Amount { unit, value: 50 }, pointer, agreement: None });
    let oid = { let a = w.everyday_act(&mut debtor, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
    let r = Fin::Receipt(Receipt { rail, proof: b"to my vault".to_vec(), payer: Some(Payer::Identity(payee.id)), payee: payee.id, amount: Amount { unit, value: 50 }, fulfils: payee.id, previous: None, forward: None, batch: None, purchase: None });
    let rid = { let a = w.everyday_act(&mut payee, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let facts = Facts { rail_valid: vec![(rid, pointer)], ..Default::default() };
    assert_eq!(w.v.status(&rid), Status::Valid);
    out.case(&mut w, "a transfer to one's vault naming the vault's declaration: valid, and it pays no obligation", "Money, \"What a payment fulfils\"", "Field 5 names the identity's genesis, which declares its vault: an act Money reads for another purpose, so the payment fulfils nothing in Money's sense; the debtor's obligation of the same amount stays unpaid.",
        facts, ask("paid toward", &oid), json!(0), None);
}

pub fn agreements(out: &mut Out) {
    // A deal, signed by every party: exists; one party missing: not.
    let mut w = World::new();
    let mut a = w.genesis("ana", vec![own_home()], None, None);
    let mut b = w.genesis("ben", vec![own_home()], None, None);
    let t0 = deal(&[a.id, b.id], None);
    let d = ag_act(&mut w, &mut a, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut a, &d);
    let log = w.log.clone();
    out.case(&mut w, "a deal one party has not signed: does not exist", "Agreements rule 1", "A deal exists once every party has signed it.", Facts::default(), ask("agreement exists", &d), json!("does not exist"), None);
    let mut w2 = World::new();
    for (x, _) in &log {
        w2.add(x);
    }
    sign(&mut w2, &mut b, &d);
    out.case(&mut w2, "a deal every party signed: exists", "Agreements rule 1", "Terms plus every party's signature act.", Facts::default(), ask("agreement exists", &d), json!("exists"), None);
    // A fork of a deal: two complete versions of one version; its reference.
    let mut w = World::new();
    let mut a = w.genesis("ana", vec![own_home()], None, None);
    let mut b = w.genesis("ben", vec![own_home()], None, None);
    let t = deal(&[a.id, b.id], None);
    let d = ag_act(&mut w, &mut a, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut a, &d);
    sign(&mut w, &mut b, &d);
    let mut versions = vec![];
    for text in ["Version A.", "Version B."] {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        let mut signers = vec![a.id, b.id];
        signers.sort();
        c.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let v = ag_act(&mut w, &mut a, agreements::types::TERMS, c.to_map(), obj(d));
        sign(&mut w, &mut a, &v);
        sign(&mut w, &mut b, &v);
        versions.push(v);
    }
    out.case(&mut w, "two complete versions of one version: a fork, the version before it the reference", "Agreements rule 47", "Every party signed both; neither is in force; the reference stays.", Facts::default(), ask("deal fork", &d),
        json!({ "reference": hx(&d), "branches": 2, "tangled": false }), None);
    // A collective's act under its threshold: one signature of two.
    let mut w = World::new();
    let mut col = collective(&mut w, &[0, 1], 2);
    let ptr = pointer_act(&mut w, &mut col.c, b"x");
    sign(&mut w, &mut col.m[0], &ptr);
    let log = w.log.clone();
    out.case(&mut w, "a collective's act its area needs two holders for, signed by one: does not count", "Agreements rules 60 and 65", "The area reaching Money has two holders and threshold 2.", Facts::default(), ask("consent counts", &ptr), json!(false), None);
    let mut w2 = World::new();
    for (x, _) in &log {
        w2.add(x);
    }
    sign(&mut w2, &mut col.m[1], &ptr);
    out.case(&mut w2, "the same signed by both holders: counts", "Agreements rules 60 and 65", "Both holders' signature acts name it.", Facts::default(), ask("consent counts", &ptr), json!(true), None);
    // Grants and a revocation (rule 76).
    let mut w = World::new();
    let mut singer = w.genesis("a singer", vec![own_home()], None, None);
    let mut agent = w.genesis("her agent", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let mut keeper = w.genesis("a keeper", vec![own_home()], None, None);
    let t0 = deal(&[singer.id, fan.id], Some(Keepers { operators: vec![keeper.id], rule: Rule::All }));
    let d = ag_act(&mut w, &mut singer, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut singer, &d);
    sign(&mut w, &mut fan, &d);
    let env = mirs().envelopes;
    let (g, s1) = grant_key_person(&mut w, &mut singer, &mut agent, vec![Kind::Type { spec: env, type_: 0 }]);
    let mut strands: Vec<Person> = (0..5).map(|_| s1.clone()).collect();
    let sid = singer.id;
    let mut post = |w: &mut World, i: usize, extra: Option<Object>| {
        let mut ob = vec![Object { chain: sid, predecessor: g }];
        ob.extend(extra);
        let a = w.everyday_act(&mut strands[i], env, 0, publication(vec![]), Some(ob), None);
        w.add(&a)
    };
    let backed = post(&mut w, 0, None);
    let cited = post(&mut w, 1, None);
    let missed = post(&mut w, 2, None);
    let acked = post(&mut w, 3, None);
    let by_grantee = post(&mut w, 4, None);
    w.ack(&mut agent, by_grantee);
    let mut more = s1.clone();
    let in_deal = {
        let a = w.everyday_act(&mut more, env, 0, publication(vec![]), Some(vec![Object { chain: sid, predecessor: g }, Object { chain: d, predecessor: d }]), None);
        w.add(&a)
    };
    keep(&mut w, &mut keeper, in_deal, singer.id);
    let before = w.log.clone();
    out.case(&mut w, "an act of a grant key within its reach, the grant accepted: backed", "Agreements rules 73 and 80", "A person's grant reaching publications.", Facts::default(), ask("backing", &backed), json!("backed"), None);
    let mut w = World::new();
    for (x, _) in &before {
        w.add(x);
    }
    let rev = ag_act(&mut w, &mut singer, agreements::types::REVOCATION, agreements::Revocation { grant: g }.to_map(), Some(vec![Object { chain: sid, predecessor: cited }]));
    keep(&mut w, &mut keeper, rev, singer.id);
    w.ack(&mut fan, acked);
    let after = w.log.clone();
    let mut cases: Vec<(&str, &str, Hash, &str)> = vec![
        ("an act the revocation's history holds: binds", "It is in the revocation's history (the revocation cites it).", cited, "binds"),
        ("an act the revocation misses, nobody else acknowledging it: void", "Racing the revocation, relied on by nobody.", missed, "not backed (void)"),
        ("an act the revocation misses, another identity acknowledging it: disputed", "A fan acknowledged it by a witness act: valid, shown disputed, conferring nothing unless the grantor adopts it.", acked, "disputed"),
        ("an act the revocation misses, only its grantee acknowledging it: void", "The grantee's own acknowledgement does not count.", by_grantee, "not backed (void)"),
        ("an act the revocation misses, recorded by a keeper of a deal it belongs to before the revocation: disputed", "It names the deal in objects; the deal's keeper recorded it, then the revocation.", in_deal, "disputed"),
    ];
    for (name, why, act, v) in cases.drain(..) {
        let mut w = World::new();
        for (x, _) in &after {
            w.add(x);
        }
        out.case(&mut w, name, "Agreements rule 76", why, Facts::default(), ask("backing", &act), json!(v), None);
    }
    // A keeper's record before and after the rotation it is judged against.
    for (before, name, v) in [(true, "a deal's keeper recorded the act before the rotation: disputed", "disputed"), (false, "the deal's keeper recorded the act only after the rotation: void", "void")] {
        let mut w = World::new();
        let mut home = w.operator("a home");
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let mut keeper = w.genesis("the deal's keeper", vec![own_home()], None, None);
        let mut ana = w.genesis("ana", vec![home_of(&home)], None, None);
        let t0 = deal(&[ana.id, ben.id], Some(Keepers { operators: vec![keeper.id], rule: Rule::All }));
        let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        let x = ag_act(&mut w, &mut ana, agreements::new_types::LIVENESS, agreements::Liveness { agreement: d }.to_map(), obj(d));
        let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x]), ..Default::default() });
        w.receipt(&mut home, &ana.id, &r, 1);
        if before {
            keep(&mut w, &mut keeper, x, ana.id);
            keep(&mut w, &mut keeper, r, ana.id);
        } else {
            keep(&mut w, &mut keeper, r, ana.id);
            keep(&mut w, &mut keeper, x, ana.id);
        }
        out.case(&mut w, name, "Agreements rule 41; Identity rule 34", "Only a record before the keeper's own record of the rotation, in its sequence, counts against it.", Facts::default(), ask("status after keepers", &x), json!(v), None);
    }
    // Deadlines.
    let clock = Reference { cmip: spec("a test clock cMIP"), params: Value::Uint(0) };
    let clock_hex = hx(&cbor::encode(&clock.to_value()));
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut k1 = w.genesis("keeper one", vec![own_home()], None, None);
    let mut k2 = w.genesis("keeper two", vec![own_home()], None, None);
    let delivery = w.post(&mut ana, "the delivery");
    let late = w.post(&mut ana, "a delivery after the deadline");
    let r1 = keep(&mut w, &mut k1, delivery, ana.id);
    let r2 = keep(&mut w, &mut k2, delivery, ana.id);
    let s1 = keep(&mut w, &mut k1, ana.id, ana.id);
    let s2 = keep(&mut w, &mut k2, ana.id, ana.id);
    let log = w.log.clone();
    let ops = json!([hx(&k1.id), hx(&k2.id)]);
    let dl = |act: &Hash| json!({ "question": "deadline", "act": hx(act), "keepers": ops, "rule": 0, "clock": clock_hex, "point": 100 });
    let cases: Vec<(&str, &str, Facts, J, &str)> = vec![
        ("a deadline met by an anchor of the act", "An anchor of the act at or before the point shows it made in time.", Facts { anchors: vec![(delivery, clock.clone(), 90)], ..Default::default() }, dl(&delivery), "met, by an anchor of the act"),
        ("a deadline met by both keepers' records lying before their records anchored by the point", "Each keeper's record of the act lies before a record of its anchored at or before the point; the rule is all.", Facts { anchors: vec![(r1, clock.clone(), 95), (r2, clock.clone(), 99)], ..Default::default() }, dl(&delivery), "met, by the keepers' anchored records"),
        ("a deadline missed: both keepers' sequences anchored past the point hold no record of the act", "Their records anchored at 150 have no record of the act before them.", Facts { anchors: vec![(s1, clock.clone(), 150), (s2, clock.clone(), 150)], ..Default::default() }, dl(&late), "missed"),
        ("a deadline with no anchor: undetermined", "A keeper's sequence orders; only anchors place anything on the clock.", Facts::default(), dl(&late), "undetermined"),
        ("an anchor of the act wins over the keepers' silence", "The act is anchored at the point; the keepers' anchored sequences lack it.", Facts { anchors: vec![(s1, clock.clone(), 150), (s2, clock.clone(), 150), (late, clock.clone(), 100)], ..Default::default() }, dl(&late), "met, by an anchor of the act"),
    ];
    for (name, why, facts, q, v) in cases {
        let mut w = World::new();
        for (x, _) in &log {
            w.add(x);
        }
        out.case(&mut w, name, "Agreements rule 33", why, facts, q, json!(v), None);
    }
}

pub fn development(out: &mut Vec<J>) {
    let money = mirs().money;
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let b = |x: Hash| Value::Bytes(x.to_vec());
    let t = |s: &str| Value::Text(s.into());
    let payment = enc(vec![(0, Value::Uint(kinds::CMIP)), (1, b(spec("a creator"))), (2, Value::Array(vec![Value::Array(vec![b(money), Value::Uint(6)])])), (9, t("A payment cMIP."))]);
    let payment_hash = Spec::hash_of(&payment);
    let module_without = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, b(spec("a creator"))), (5, b(payment_hash)), (9, t("A rail Module without fields 11 and 13."))]);
    let module_with = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, b(spec("a creator"))), (5, b(payment_hash)), (9, t("A request rail.")), (11, Value::Uint(0)), (13, Value::Array(vec![Value::Uint(0), Value::Uint(1)]))]);
    let bad_request = enc(vec![(0, Value::Uint(kinds::MODULE)), (1, b(spec("a creator"))), (5, b(payment_hash)), (9, t("A request rail binding only the payee.")), (11, Value::Uint(0)), (13, Value::Array(vec![Value::Uint(0)]))]);
    let no_creator = enc(vec![(0, Value::Uint(kinds::CMIP)), (9, t("A cMIP naming no creator."))]);
    let key14 = enc(vec![(0, Value::Uint(kinds::CMIP)), (1, b(spec("a creator"))), (9, t("A cMIP.")), (14, Value::Uint(0))]);
    let held = |x: &Hash| (*x == payment_hash).then(|| payment.clone());
    let none = |_: &Hash| None;
    let judge = |c: &[u8], h: &dyn Fn(&Hash) -> Option<Vec<u8>>| match Spec::decode_judged(c, &money, h) {
        Judged::Spec(_) => json!("a specification"),
        Judged::NoSpecification(_) => json!("no specification"),
        Judged::Unknown(x) => json!(format!("unknown: the cMIP {} is not held", hx(&x))),
    };
    let mut push = |name: &str, rule: &str, why: &str, c: &[u8], with_cmip: bool, expect: J| {
        let got = if with_cmip { judge(c, &held) } else { judge(c, &none) };
        assert_eq!(got, expect, "{name}");
        let mut held_j = serde_json::Map::new();
        if with_cmip {
            held_j.insert(hx(&payment_hash), json!(hx(&payment)));
        }
        out.push(json!({ "name": name, "rule": rule, "why": why, "content": hx(c), "spec_hash": hx(&Spec::hash_of(c)), "money": hx(&money), "held_specifications": held_j, "verdict": got, "python": "specification decoding" }));
    };
    push("a payment cMIP: field 2 lists Money's task 6", "Development, \"How the content is decoded\"", "Kind 0, a creator, field 2 naming [MONEY, 6], its text.", &payment, false, json!("a specification"));
    push("a rail Module under a payment cMIP, with fields 11 and 13", "Development, \"A rail Module's kind and binding\"", "A request rail binding payee and purpose.", &module_with, true, json!("a specification"));
    push("a rail Module under a payment cMIP without fields 11 and 13: no specification", "Development, \"A rail Module's kind and binding\"", "Its field 5 names a cMIP whose field 2 lists Money's task 6.", &module_without, true, json!("no specification"));
    push("the same at a verifier not holding the cMIP it names: unknown", "Development, \"A rail Module's kind and binding\"", "Whether it is a specification rests on the cMIP's own field 2.", &module_without, false, json!(format!("unknown: the cMIP {} is not held", hx(&payment_hash))));
    push("a request rail whose field 13 lacks the purpose: no specification", "Development, \"A rail Module's kind and binding\"", "Field 11 is 0: field 13 holds 0 and 1.", &bad_request, false, json!("no specification"));
    push("a cMIP naming no creator: no specification", "Development, \"What each kind must carry\"", "A cMIP carries field 1.", &no_creator, false, json!("no specification"));
    push("a key the format does not define (14): no specification", "Development, \"How the content is decoded\", 2", "Keys are 0 to 13.", &key14, false, json!("no specification"));
}

pub fn mir_hashes() -> Vec<J> {
    let files = [
        ("a frozen text, no final line break", "# MIR: Test\n\n## Part one\n\nA rule."),
        ("the same with one final line break, not part of the text", "# MIR: Test\n\n## Part one\n\nA rule.\n"),
        ("the same as a draft: its status line is part of the text, like every line of the file", "# MIR: Test\n\n*Draft 1, for review.*\n\n## Part one\n\nA rule."),
        ("an italic line after the title, then one final line break: the italic line is part of the text", "# T\n\n*an italic line*\n\nbody\n"),
    ];
    let mut out = vec![];
    for (name, f) in files {
        let h = Spec::mir_file_hash(f).unwrap();
        out.push(json!({ "name": name, "rule": "Development rule 26", "file": f, "text": Spec::frozen_text(f), "spec_hash": hx(&h), "python": "MIR hash" }));
    }
    for (name, f) in [("two final line breaks: refused", "# MIR: Test\n\nA rule.\n\n"), ("a trailing space: refused", "# MIR: Test\n\nA rule. ")] {
        assert!(Spec::mir_file_hash(f).is_err());
        out.push(json!({ "name": name, "rule": "Development rule 26", "file": f, "spec_hash": null, "python": "MIR hash" }));
    }
    out
}
