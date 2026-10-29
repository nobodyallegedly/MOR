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
use mor_core::identity::{Audit, Home, KeptTip, Successor};
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
        Status::NotCounting => "not counting",
        Status::Scoped => "scoped",
    }
}

/// A vow as a verifier reads it: each sale's buyer and state, the payments
/// signed by nobody, and those whose place is unknown.
pub fn vow_json(e: Result<agreements::VowEval, agreements::AgreementsError>) -> J {
    use agreements::SaleState as S;
    match e {
        Err(_) => json!("unknown"),
        Ok(e) => json!({
            "sales": e.sales.iter().map(|x| json!({ "act": hx(&x.act), "buyer": hx(&x.buyer), "state": match &x.state {
                S::Pending => "pending", S::Confirmed { .. } => "confirmed", S::Contested { .. } => "contested", S::Unknown => "unknown" } })).collect::<Vec<_>>(),
            "unsigned": e.unsigned.iter().map(|x| hx(x)).collect::<Vec<_>>(),
            "unknown": e.unknown.iter().map(|x| hx(x)).collect::<Vec<_>>(),
        }),
    }
}

/// A succession as a verifier sees it (Identity, "Succession").
pub fn succession_json(s: mor_core::chain::SuccessionSeen) -> J {
    use mor_core::chain::SuccessionSeen as S;
    match s {
        S::None => json!({ "seen": "none" }),
        S::Declared { successor, .. } => json!({ "seen": "declared", "successor": hx(&successor) }),
        S::Confirmed { successor, confirmation, .. } => json!({ "seen": "confirmed, followed", "successor": hx(&successor), "confirmation": hx(&confirmation) }),
        S::Unknown { successor, .. } => json!({ "seen": "unknown", "successor": hx(&successor) }),
        S::Elsewhere { .. } => json!({ "seen": "another protocol's" }),
    }
}

/// A purchase's verdict as the vectors write it (Agreements rule 12).
pub fn purchase_name(p: Result<Option<agreements::PurchaseEval>, agreements::AgreementsError>) -> &'static str {
    use agreements::PurchaseVerdict as P;
    match p {
        Err(_) => "unknown",
        Ok(None) => "not a payment for a work",
        Ok(Some(e)) => match e.verdict {
            P::Purchase => "purchase",
            P::NoPurchase { .. } => "no purchase",
            P::Unrecorded => "unrecorded",
            P::WrongReceipt { .. } => "wrong receipt",
            P::Unknown => "unknown",
        },
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
            kinds: Some(vec![Kind::Type { spec: m.envelopes, type_: 0 }, Kind::Layer(agreements::layers::TEXT), Kind::Layer(agreements::layers::ENVELOPES)]),
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
    /// Inclusion proofs a home served: the log summary, the receipt it
    /// proves (Identity, "Audit": a proof names the summary, the receipt,
    /// its index and the path), its index and the path.
    pub proofs: Vec<(Hash, Hash, u64, Vec<Hash>)>,
    pub failed_to_reach: Vec<Hash>,
    pub anchors: Vec<(Hash, Reference, u64)>,
    pub rail_valid: Vec<(Hash, Hash)>,
    /// The rail Module's answer of which payment a proof is (Money rule 12).
    pub rail_payments: Vec<(Vec<u8>, Vec<u8>)>,
    /// Private acts this verifier found in their sealed form at a home, with
    /// the home's operator (Identity, "Private links").
    pub found_at_home: Vec<(Hash, Hash)>,
    /// (question, judge): the judge's period on that question passed with no
    /// answer, as the agreement's time reference says (rule 35).
    pub judges_lapsed: Vec<(Hash, Hash)>,
    /// Settlements the time reference places before their link's stage opened.
    pub settled_out_of_turn: Vec<Hash>,
    /// Rail Modules' specifications this verifier holds and adopted, as
    /// content: each rail's kind and binding is read from them, fields 11
    /// and 13, under its spec hash (Development, "A rail Module's kind and
    /// binding").
    pub rail_specifications: Vec<Vec<u8>>,
}

impl Facts {
    fn to_json(&self) -> J {
        let mut m = serde_json::Map::new();
        if !self.proofs.is_empty() {
            m.insert(
                "inclusion_proofs".into(),
                self.proofs.iter().map(|(s, r, i, p)| json!({ "summary": hx(s), "receipt": hx(r), "index": i, "path": p.iter().map(|x| hx(x)).collect::<Vec<_>>() })).collect(),
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
        if !self.judges_lapsed.is_empty() {
            m.insert("judges_lapsed".into(), self.judges_lapsed.iter().map(|(q, j)| json!({ "question": hx(q), "judge": hx(j) })).collect());
        }
        if !self.settled_out_of_turn.is_empty() {
            m.insert("settled_out_of_turn".into(), self.settled_out_of_turn.iter().map(|x| hx(x)).collect());
        }
        if !self.found_at_home.is_empty() {
            m.insert("found_at_home".into(), self.found_at_home.iter().map(|(a, o)| json!({ "act": hx(a), "operator": hx(o) })).collect());
        }
        if !self.rail_payments.is_empty() {
            m.insert("rail_payments".into(), self.rail_payments.iter().map(|(p, x)| json!({ "proof": hx(p), "payment": hx(x) })).collect());
        }
        if !self.rail_specifications.is_empty() {
            m.insert("rail_specifications".into(), self.rail_specifications.iter().map(|c| json!(hx(c))).collect());
        }
        J::Object(m)
    }

    fn apply(&self, w: &mut World) {
        for (s, _, i, p) in &self.proofs {
            w.v.add_inclusion_proof(*s, *i, p.clone());
        }
        for o in &self.failed_to_reach {
            w.v.failed_to_reach(*o);
        }
        for (a, o) in &self.found_at_home {
            w.v.found_at_home(*a, *o);
        }
    }

    fn apply_view(&self, v: &mut AgreementsView) {
        for (a, r, p) in &self.anchors {
            v.anchored.add(&Anchor { act: *a, reference: r.clone(), point: *p });
        }
        for (a, to) in &self.rail_valid {
            v.rail_valid.insert(*a, money::PaidAt::Flow(*to));
        }
        for (p, x) in &self.rail_payments {
            v.payments.insert(p.clone(), x.clone());
        }
        for (q, j) in &self.judges_lapsed {
            v.judges_lapsed.insert((*q, *j));
        }
        for x in &self.settled_out_of_turn {
            v.settled_out_of_turn.insert(*x);
        }
        for c in &self.rail_specifications {
            if let Ok(Spec { rail: Some(r), .. }) = Spec::decode(c, &mor_core::development::Known::default()) {
                v.rails.insert(Spec::hash_of(c), r);
            }
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
        // So for the verifier implementing the MIRs only, as `tests/vectors.rs` answers it.
        "status" | "verdict, implementing the MIRs only" if w.v.get(&h("act")).is_none() && w.log.iter().any(|(a, _)| a.id() == h("act")) => json!("invalid"),
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
                Stop::GenesisUnknown => "genesis unknown",
                Stop::GenesisInvalid => "genesis invalid",
                Stop::End => "end",
                Stop::Pending(_) => "pending",
                Stop::Contested(_) => "contested",
                Stop::CannotTell(_) => "cannot tell",
            };
            json!({ "counting": r.links.iter().map(|l| hx(&l.act)).collect::<Vec<_>>(), "next": stop,
                    "dishonest": r.dishonest.iter().map(|(o, p)| json!({ "operator": match o { mor_core::identity::Operator::Id(x) => hx(x), mor_core::identity::Operator::Own => "own".into() }, "from_position": p })).collect::<Vec<_>>() })
        }
        "succession" => succession_json(w.v.succession(&h("identity"))),
        "version in force" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            v.version_in_force(&h("act")).map_or(json!("unknown"), |x| json!(hx(&x)))
        }
        "fork" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            match v.fork(&h("act")) {
                Ok(e) => json!({ "complete": e.complete }),
                Err(_) => json!("unknown"),
            }
        }
        "closing" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            match v.closing(&h("act")) {
                Ok(e) => json!({ "complete": e.complete }),
                Err(_) => json!("unknown"),
            }
        }
        "vow" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            vow_json(v.vow(&h("vow")))
        }
        "purchase contests" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            v.purchase_contests(&h("purchase")).map_or(json!("unknown"), |x| json!(x.iter().map(|c| hx(c)).collect::<Vec<_>>()))
        }
        "refund repaid" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            let to = money::RefundTo::Identity(h("to"));
            v.refund_repaid(&h("payment"), &to, &h("unit")).map_or(json!("unknown"), |x| json!(x))
        }
        "status after keepers" => {
            let (rescued, unknown) = { let v = view(w); (v.keeper_disputed_acts(), v.keeper_unknown_acts()) };
            for a in rescued {
                w.v.keeper_recorded(a);
            }
            for a in unknown {
                w.v.keepers_cannot_tell(a);
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
        // Whether a liveness act shows presence (rule 50; "Liveness (type 12)").
        "liveness" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(v.liveness(&h("act")).map_or("unknown", |x| if x { "shows presence" } else { "shows nothing" }))
        }
        // Whether terms are invalid against their parent and lineage (a false mark...).
        "agreement invalid" => json!(match view(w).agreement(&h("act")).map(|a| a.invalid.is_some()) {
            Ok(true) => "invalid",
            Ok(false) => "not invalid",
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
            // The keepers' rule as the format writes it: [0] every keeper, [1, k] at least k.
            let rule = match ask["rule"].as_array().map(|r| r.iter().map(|x| x.as_u64().unwrap()).collect::<Vec<_>>()).as_deref() {
                Some([0]) => Rule::All,
                Some([1, k]) => Rule::Threshold(*k),
                r => panic!("a keepers' rule the vectors do not write: {r:?}"),
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
        "payment counts" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(match v.record_counts(&h("act")) {
                Some(true) => "counts",
                Some(false) => "does not count",
                None => "unknown",
            })
        }
        "purchase" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            json!(purchase_name(v.purchase(&h("act"))))
        }
        "paid toward" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            v.paid_toward(&h("act")).map_or(json!("unknown"), |x| json!(x))
        }
        "specification claim" => json!(match w.v.specification_claim(&h("act"), &h("creator")) {
            mor_core::chain::SpecClaim::Claimed => "claimed",
            mor_core::chain::SpecClaim::Unclaimed { disputed: false } => "unclaimed",
            mor_core::chain::SpecClaim::Unclaimed { disputed: true } => "unclaimed, shown as disputed",
            mor_core::chain::SpecClaim::Unknown => "unknown",
        }),
        "disagreements" => {
            let mut v = view(w);
            facts.apply_view(&mut v);
            v.disagreements(&h("receiver")).map_or(json!("unknown"), |x| json!(x.len()))
        }
        "price tag" => json!(match w.v.price_tag(&h("act")).map(|(_, c)| c) {
            Some(mor_core::chain::TagCount::Counts) => "counts",
            Some(mor_core::chain::TagCount::Nobodys(_)) => "nobody's offer",
            Some(mor_core::chain::TagCount::Unknown(_)) | None => "unknown",
        }),
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
        let mut keys = serde_json::Map::new();
        for (a, key) in &w.log {
            let id = hx(&a.id());
            self.pool.insert(id.clone(), hx(&a.encode()));
            if let Some(k) = key {
                // A private act: the verifier holds its content key, as a recipient does.
                keys.insert(id.clone(), json!(hx(k)));
            }
            acts.push(id);
        }
        let got = answer(w, &facts, &ask);
        assert_eq!(got, expect, "{name}");
        let mut fj = facts.to_json();
        if !keys.is_empty() {
            fj["content_keys"] = J::Object(keys);
        }
        let mut c = json!({ "name": name, "rule": rule, "why": why, "acts": acts, "facts": fj, "ask": ask, "verdict": got });
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
    let log = w.log.clone();
    out.case(&mut w, "a rotation declaring a successor: it counts, the succession declared", "Identity, \"Succession\"", "The rotation counts; the successor is shown as declared until it confirms.", Facts::default(), ask_status(&r), json!("valid"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "the succession, unconfirmed: declared, not followed", "Identity, \"Succession\"", "The successor has not confirmed it.",
        Facts::default(), json!({ "question": "succession", "identity": hx(&s.id) }), json!({ "seen": "declared", "successor": hx(&heir.id) }), None);
    let mut w3 = World::new();
    for (a, _) in &log {
        w3.add(a);
    }
    let mut heir = heir;
    let conf = { let a = w3.everyday_act(&mut heir, mirs().identity, mor_core::identity::types::LINK_CONFIRMATION, vec![], Some(vec![Object { chain: s.id, predecessor: r }]), None); w3.add(&a) };
    out.case(&mut w3, "the succession confirmed by the successor's link confirmation naming the rotation: followed", "Identity, \"Succession\"", "A succession to a MOR identity is followed once that identity confirms it.",
        Facts::default(), json!({ "question": "succession", "identity": hx(&s.id) }), json!({ "seen": "confirmed, followed", "successor": hx(&heir.id), "confirmation": hx(&conf) }), None);

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
            facts.proofs.push((s, log[i], i as u64, mor_core::merkle::inclusion_proof(&log, i)));
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

    // A rotation that passes the checks and loses at its position: not counting.
    let mut w = World::new();
    let mut h1 = w.operator("home-1");
    let mut h2 = w.operator("home-2");
    let mut h3 = w.operator("home-3");
    let j = w.genesis("hal", vec![home_of(&h1), home_of(&h2), home_of(&h3)], None, None);
    let (r, _) = w.rotate(&j, Rot::default());
    let (rival, mut jr) = w.rotate(&j, Rot { signing_key: Some(schnorr("a thief", 3)), ..Default::default() });
    w.receipt(&mut h1, &j.id, &r, 1);
    w.receipt(&mut h2, &j.id, &r, 1);
    w.receipt(&mut h3, &j.id, &rival, 1);
    let bound = w.post(&mut jr, "bound to the rotation that does not count");
    let log = w.log.clone();
    out.case(&mut w, "two rotations at one position, both passing the checks, the home rule deciding for the other: not counting", "Identity, \"Which rotation counts\", a rotation that does not count; rules 40 and 41",
        "Two of three homes receipted the other; this one passes the rotation checks and loses: neither invalid nor void.", Facts::default(), ask_status(&rival), json!("not counting"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "an act bound to the rotation that does not count: invalid", "Identity, \"Which rotation counts\", a rotation that does not count; everyday check 2",
        "Its binding names no act that counts.", Facts::default(), ask_status(&bound), json!("invalid"), None);

    // An act bound to a contested rotation: pending.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let j = w.genesis("ivy", vec![home_of(&home)], None, None);
    let (r, mut j1) = w.rotate(&j, Rot::default());
    let (rival, _) = w.rotate(&j, Rot { signing_key: Some(schnorr("a thief", 4)), ..Default::default() });
    w.receipt(&mut home, &j.id, &r, 1);
    w.receipt(&mut home, &j.id, &rival, 1);
    let post = w.post(&mut j1, "bound to a contested rotation");
    out.case(&mut w, "an act bound to a contested rotation: pending", "Identity rule 42; rule 44; everyday check 2",
        "One home receipted two rotations at position 1: the position is contested, and an act bound to either waits until the contest ends.", Facts::default(), ask_status(&post), json!("pending"), None);

    // A kept tip whose summary does not fit its line (rotation check 7).
    let tips = |w: &mut World, j: &Person| {
        let mut jj = j.clone();
        let p1 = w.post(&mut jj, "one");
        let p2 = w.post(&mut jj, "two");
        let mut other = jj.clone();
        other.seq = vec![];
        let o1 = w.post(&mut other, "from another device");
        let wrong = KeptTip { act: p2, position: 2, summary: sha256(b"a summary that does not fit the line") };
        let fits = KeptTip { act: o1, position: 1, summary: mor_core::mmr::summary(&[o1]) };
        (jj, p1, p2, o1, wrong, fits)
    };
    let mut w = World::new();
    let mut home = w.operator("a home");
    let j = w.genesis("kai", vec![home_of(&home)], None, None);
    let (jj, p1, p2, o1, wrong, fits) = tips(&mut w, &j);
    let (r, _) = w.rotate(&jj, Rot { kept: Some(vec![wrong, fits]), ..Default::default() });
    w.receipt(&mut home, &j.id, &r, 1);
    let log = w.log.clone();
    for (name, act, v) in [
        ("a kept tip whose summary does not fit its line, the line held: the tip keeps nothing, itself void", p2, "void"),
        ("an act below that tip: void", p1, "void"),
        ("an act on the rotation's other tip, which fits: valid", o1, "valid"),
    ] {
        let mut w2 = World::new();
        for (a, _) in &log {
            w2.add(a);
        }
        out.case(&mut w2, name, "Identity, rotation check 7; rules 33 and 34", "The rotation names two tips; one's summary is not the summary of its line up to it, which the verifier holds.", Facts::default(), ask_status(&act), json!(v), None);
    }
    let mut w = World::new();
    let mut home = w.operator("a home");
    let j = w.genesis("kai", vec![home_of(&home)], None, None);
    let (jj, _, p2, _, wrong, _) = tips(&mut w, &j);
    let (r, _) = w.rotate(&jj, Rot { kept: Some(vec![wrong]), ..Default::default() });
    w.receipt(&mut home, &j.id, &r, 1);
    let log = w.log.clone();
    out.case(&mut w, "a rotation whose one kept tip does not fit its line, the line held: it stands, valid", "Identity, rotation check 7",
        "A tip that does not fit never makes the rotation invalid: its validity is fixed by its bytes.", Facts::default(), ask_status(&r), json!("valid"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "its tip, which does not fit: void, kept by nothing", "Identity, rotation check 7; rule 34", "The tip keeps nothing, itself included.", Facts::default(), ask_status(&p2), json!("void"), None);

    // An acknowledgement under a scoped key rescues nothing.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let mut friend = w.genesis("a friend", vec![own_home()], None, None);
    let mut app = w.genesis("the friend's app", vec![own_home()], None, None);
    let (_, mut lane) = grant_key_person(&mut w, &mut friend, &mut app, vec![Kind::Type { spec: mirs().agreements, type_: agreements::types::NEGOTIATION }]);
    let mut j = w.genesis("lea", vec![home_of(&home)], None, None);
    let relied = w.post(&mut j, "a post the friend's app relied on");
    let ack = {
        let a = w.everyday_act(&mut lane, mirs().agreements, agreements::types::NEGOTIATION, vec![(Value::Uint(0), Value::Text("Noted.".into()))], None, Some(vec![relied]));
        w.add(&a)
    };
    assert_eq!(w.v.status(&ack), Status::Scoped);
    let (r, _) = w.rotate(&j, Rot { disowned: Some(vec![relied]), ..Default::default() });
    w.receipt(&mut home, &j.id, &r, 1);
    out.case(&mut w, "a disowned act acknowledged only by an act signed with another identity's scoped key: void", "Identity rule 34",
        "An acknowledgement counts only under the acknowledging identity's signing key, never a scoped key: reliance is the identity's, not a grantee's.", Facts::default(), ask_status(&relied), json!("void"), None);

    // A private link: unknown until found at its signer's home.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let bea = w.genesis("bea", vec![own_home()], None, None);
    let claim = w.private_act(&mut ana, mirs().identity, mor_core::identity::types::LINK_CLAIM, vec![(Value::Uint(0), Value::Array(vec![Value::Text("mor".into()), Value::Bytes(bea.id.to_vec())]))], None, vec![bea.id]);
    let log = w.log.clone();
    out.case(&mut w, "a private link claim, its key held, found at no home of its signer: unknown", "Identity, \"Private links\" (rule 17)",
        "A private link counts only once found at a home its signer's chain names; found nowhere, unknown, never invalid.", Facts::default(), ask_status(&claim), json!("unknown"), None);
    let mut w2 = World::new();
    for (a, k) in &log {
        w2.log.push((a.clone(), k.clone()));
        w2.v.add_with_key(a.clone(), k.as_ref()).unwrap();
    }
    out.case(&mut w2, "the same found at its signer's own home: valid", "Identity, \"Private links\" (rule 17)", "Ana's genesis names herself as her home; the claim was found there.",
        Facts { found_at_home: vec![(claim, ana.id)], ..Default::default() }, ask_status(&claim), json!("valid"), None);

    // A private link after a move of homes: found at the homes its signer's chain names at its binding.
    let mut w = World::new();
    let mut h1 = w.operator("the home at the binding");
    let h2 = w.operator("the home after the move");
    let mut ana = w.genesis("ana, who moves homes", vec![home_of(&h1)], None, None);
    let bea = w.genesis("bea, whom she links to", vec![own_home()], None, None);
    let claim = w.private_act(&mut ana, mirs().identity, mor_core::identity::types::LINK_CLAIM, vec![(Value::Uint(0), Value::Array(vec![Value::Text("mor".into()), Value::Bytes(bea.id.to_vec())]))], None, vec![bea.id]);
    let (r, _) = w.rotate(&ana, Rot { homes: Some(vec![home_of(&h2)]), ..Default::default() });
    w.receipt(&mut h1, &ana.id, &r, 1);
    let log = w.log.clone();
    out.case(&mut w, "a private link claim found at the home its signer's chain named at its binding, the signer having moved homes since: valid", "Identity, \"Private links\" (rule 17)",
        "The claim is bound to Ana's genesis, which names the first home; a later rotation keeping it moves her to another home. A later move of homes does not void a link found where the chain named its homes at the binding.",
        Facts { found_at_home: vec![(claim, h1.id)], ..Default::default() }, ask_status(&claim), json!("valid"), None);
    let mut w2 = World::new();
    for (a, k) in &log {
        w2.log.push((a.clone(), k.clone()));
        w2.v.add_with_key(a.clone(), k.as_ref()).unwrap();
    }
    out.case(&mut w2, "the same found only at the home the signer moved to: unknown", "Identity, \"Private links\" (rule 17)",
        "The homes that count are those the chain names at the link act's binding, not the latest: found only at the new home, the claim is not yet found where it counts, so unknown, never invalid.",
        Facts { found_at_home: vec![(claim, h2.id)], ..Default::default() }, ask_status(&claim), json!("unknown"), None);

    // Two final homeless rotations at one position, and an objection whose status cannot be told there.
    let mut w = World::new();
    let mut old = w.operator("a hostile home");
    let mut n1 = w.operator("a first new home");
    let mut n2 = w.operator("a second new home");
    let mut e = w.genesis("eve", vec![home_of(&old)], None, None);
    let (r1, e1) = w.rotate(&e, Rot { homes: Some(vec![home_of(&n1)]), homeless: true, ..Default::default() });
    w.endorse(&mut e, &r1, None);
    w.receipt(&mut n1, &e.id, &r1, 1);
    let (r2, e2) = w.rotate(&e, Rot { homes: Some(vec![home_of(&n2)]), homeless: true, signing_key: Some(schnorr("eve, the other line", 1)), ..Default::default() });
    w.endorse(&mut e, &r2, None);
    w.receipt(&mut n2, &e.id, &r2, 1);
    let (s1, _) = w.rotate(&e1, Rot::default());
    w.receipt(&mut n1, &e.id, &s1, 2);
    let (s2, _) = w.rotate(&e2, Rot::default());
    w.receipt(&mut n2, &e.id, &s2, 2);
    // The old home objects, its objection bound to a rotation of its own this verifier does not hold.
    let (_, mut old2) = w.rotation(&old, Rot::default());
    w.object(&mut old2, &e.id, &r1);
    let _ = &mut old;
    out.case(&mut w, "two homeless rotations at one position, each final, with an objection whose status cannot be told there: contested", "Identity, \"What stops a chain\", the order of the reasons; \"Final\"; the homeless procedure",
        "Each homeless rotation is an escape receipted by its new home, and each is followed by a rotation counting under the rule it declared: both are final. A contest among final rotations comes before cannot tell, since no objection can undo it; the old home's objection, bound to a rotation not held, cannot be told.",
        Facts::default(), json!({ "question": "chain", "identity": hx(&e.id) }), json!({ "counting": [hx(&e.id)], "next": "contested", "dishonest": [] }), None);

    // The way out, rotation by rotation: the old homes' own rotation beats an escape at the same position.
    let mut w = World::new();
    let mut old = w.operator("a slow home");
    let mut new = w.operator("an escape's new home");
    let mut e = w.genesis("eda", vec![home_of(&old)], None, None);
    let (r, e1) = w.rotate(&e, Rot { homes: Some(vec![home_of(&new)]), homeless: true, ..Default::default() });
    w.endorse(&mut e, &r, None);
    w.receipt(&mut new, &e.id, &r, 1);
    let (s2, _) = w.rotate(&e1, Rot::default());
    w.receipt(&mut new, &e.id, &s2, 2);
    let (o, _) = w.rotate(&e, Rot { signing_key: Some(schnorr("eda, the ordinary line", 1)), ..Default::default() });
    w.receipt(&mut old, &e.id, &o, 1);
    let log = w.log.clone();
    out.case(&mut w, "an escape, final, and an ordinary rotation its old home receipts at the same position: the ordinary rotation counts", "Identity, \"The homeless procedure\": a rotation counting under the home rule always beats a homeless one",
        "Eda escaped to a new home and rotated again there; her old home, still alive, receipts an ordinary rotation at position 1. The rotation counting under the rule in force wins; the escape and what follows it count for nothing.",
        Facts::default(), json!({ "question": "chain", "identity": hx(&e.id) }), json!({ "counting": [hx(&e.id), hx(&o)], "next": "end", "dishonest": [] }), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "the escape in that case: not counting", "Identity, \"The homeless procedure\"; \"Which rotation counts\", a rotation that does not count",
        "It passes its checks and loses at its position.", Facts::default(), ask_status(&r), json!("not counting"), None);
    // An escape against its old home's objection: the escape stands.
    let mut w = World::new();
    let mut old = w.operator("an objecting home");
    let mut new = w.operator("the escape's new home");
    let mut e = w.genesis("ezra", vec![home_of(&old)], None, None);
    let (r, _) = w.rotate(&e, Rot { homes: Some(vec![home_of(&new)]), homeless: true, ..Default::default() });
    w.endorse(&mut e, &r, None);
    w.receipt(&mut new, &e.id, &r, 1);
    w.object(&mut old, &e.id, &r);
    out.case(&mut w, "an escape, endorsed with the signing key, against its old home's valid objection: it counts", "Identity, \"The homeless procedure\", the escape: both keys need no old home",
        "The old home objects to the homeless rotation; an escape signed by both keys and receipted by its new home needs no old home's word, and an objection does not undo it.",
        Facts::default(), ask_status(&r), json!("valid"), None);
    // A self-hosted identity: its own rotation counts with no receipt; two at one position, contested.
    let mut w = World::new();
    let sh = w.genesis("sol", vec![own_home()], None, None);
    let (r1, _) = w.rotate(&sh, Rot::default());
    let log = w.log.clone();
    out.case(&mut w, "a self-hosted identity's rotation: it counts, no receipt needed", "Identity, homes: a self-hosted identity is its own home",
        "Sol's genesis names itself as its home; the rotation it signs is served by itself.", Facts::default(), ask_status(&r1), json!("valid"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    w2.rotate(&sh, Rot { signing_key: Some(schnorr("sol, a second line", 1)), ..Default::default() });
    out.case(&mut w2, "a self-hosted identity serving two rotations at one position: contested", "Identity rule 44; \"What stops a chain\"",
        "Two rotations at position 1, both served by the identity itself.", Facts::default(), json!({ "question": "chain", "identity": hx(&sh.id) }), json!({ "counting": [hx(&sh.id)], "next": "contested", "dishonest": [] }), None);

    // A rotation built on a pending rotation, and an act bound to it:
    // pending, never invalid (everyday check 2; rule 28).
    let mut w = World::new();
    let mut home = w.operator("a slow home");
    let j = w.genesis("pia", vec![home_of(&home)], None, None);
    let (r1, j1) = w.rotate(&j, Rot::default());
    let (r2, mut j2) = w.rotate(&j1, Rot::default());
    let post = w.post(&mut j2, "bound to a rotation built on a pending rotation");
    let log = w.log.clone();
    out.case(&mut w, "a rotation built on a rotation not yet receipted: pending", "Identity rule 28; everyday check 2",
        "The first rotation waits on its home's receipt; the second, on the first, does not count yet either, and may once the receipts arrive: never invalid.", Facts::default(), ask_status(&r2), json!("pending"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "an act bound to that second rotation: pending", "Identity rule 28; everyday check 2",
        "Signed with the key the second rotation installs; its binding does not count yet.", Facts::default(), ask_status(&post), json!("pending"), None);
    let mut w3 = World::new();
    for (a, _) in &log {
        w3.add(a);
    }
    w3.receipt(&mut home, &j.id, &r1, 1);
    w3.receipt(&mut home, &j.id, &r2, 2);
    out.case(&mut w3, "the same once the home has receipted both rotations: the act valid", "Identity, \"Which rotation counts\"; everyday check 2",
        "Both rotations now count; the act bound to the second is valid.", Facts::default(), ask_status(&post), json!("valid"), None);
    // The case that stays: a rotation built on one that lost its position.
    let mut w = World::new();
    let mut h1 = w.operator("home-a");
    let mut h2 = w.operator("home-b");
    let mut h3 = w.operator("home-c");
    let j = w.genesis("quin", vec![home_of(&h1), home_of(&h2), home_of(&h3)], None, None);
    let (r, _) = w.rotate(&j, Rot::default());
    let (rival, jr) = w.rotate(&j, Rot { signing_key: Some(schnorr("quin's thief", 3)), ..Default::default() });
    w.receipt(&mut h1, &j.id, &r, 1);
    w.receipt(&mut h2, &j.id, &r, 1);
    w.receipt(&mut h3, &j.id, &rival, 1);
    let (on_rival, _) = w.rotate(&jr, Rot::default());
    out.case(&mut w, "a rotation built on a rotation that does not count: invalid", "Identity, \"Which rotation counts\", a rotation that does not count; everyday check 2",
        "The rotation it builds on lost its position for good; nothing it waits on can make it count.", Facts::default(), ask_status(&on_rival), json!("invalid"), None);
    s7g_identity(out);
    s7g_development_identity(out);
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
    s7g_text(out);
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
    s7g_envelopes(out);
}

/// The same inside, sealed again and signed by `p`'s signing key.
fn reseal(w: &mut World, p: &Person, inside: &mor_core::act::Inside) -> mor_core::act::Act {
    let _ = w;
    let (key, nonce) = content_key_for(inside, Some(p.id), Some(p.binding));
    mor_core::act::make(inside, &key, &nonce, &mor_core::act::Addressing { signer: Some(p.id), binding: Some(p.binding), public: true, to: None }, |id| p.sign.sign(id, &[0; 32]))
}

pub fn money(out: &mut Out) {
    // Rule 18: the price tag (type 5), on a bare bake and under a publication.
    {
        use mor_core::money::{PriceTag, Priced};
        let mut w = World::new();
        let mut up = w.genesis("an uploader", vec![own_home()], None, None);
        let mut fan = w.genesis("a fan who re-tags", vec![own_home()], None, None);
        let mut svc = w.genesis("a split service", vec![own_home()], None, None);
        let unit = spec("the sat unit, test value");
        let tag = |priced: Priced, version: u64, previous: Option<Hash>, price: Option<u64>, payee: Hash| {
            Fin::PriceTag(PriceTag { priced, version, previous, price: price.map(|v| money::Amount { unit, value: v }), payee }).to_map()
        };
        let bake = w.everyday_act(&mut up, mirs().envelopes, mor_core::envelopes::types::BAKE, publication(vec![]), None, None);
        let bake_id = bake.id();
        let (up_id, fan_id, svc_id) = (up.id, fan.id, svc.id);
        let own = { let a = w.everyday_act(&mut up, mirs().money, money::types::PRICE_TAG, tag(Priced::Bake(bake_id), 1, None, Some(100), up_id), None, None); w.add(&a) };
        out.case(&mut w, "a price tag on a bare bake this verifier does not hold: unknown", "Money rule 18", "Only the bake's uploader's tag counts on a bare bake: who uploaded it is read from the bake.", Facts::default(), ask("price tag", &own), json!("unknown"), None);
        w.add(&bake);
        let other = { let a = w.everyday_act(&mut fan, mirs().money, money::types::PRICE_TAG, tag(Priced::Bake(bake_id), 1, None, Some(50), fan_id), None, None); w.add(&a) };
        let under = { let a = w.everyday_act(&mut svc, mirs().money, money::types::PRICE_TAG, tag(Priced::Publication(spec("a publication's founding version, test value")), 1, None, Some(100), svc_id), None, None); w.add(&a) };
        let v1 = own;
        let v2 = { let a = w.everyday_act(&mut up, mirs().money, money::types::PRICE_TAG, tag(Priced::Bake(bake_id), 2, Some(v1), None, up_id), Some(vec![Object { chain: v1, predecessor: v1 }]), None); w.add(&a) };
        let stranger_v2 = { let a = w.everyday_act(&mut fan, mirs().money, money::types::PRICE_TAG, tag(Priced::Bake(bake_id), 2, Some(v1), Some(1), fan_id), Some(vec![Object { chain: v1, predecessor: v1 }]), None); w.add(&a) };
        let both = {
            let mut m = tag(Priced::Bake(bake_id), 1, None, Some(1), up_id);
            m.push((Value::Uint(1), Value::Bytes(bake_id.to_vec())));
            m.sort_by(|a, c| mor_core::cbor::encode(&a.0).cmp(&mor_core::cbor::encode(&c.0)));
            let a = w.everyday_act(&mut up, mirs().money, money::types::PRICE_TAG, m, None, None);
            w.add(&a)
        };
        let log = w.log.clone();
        let fresh = |log: &Vec<(mor_core::act::Act, Option<[u8; 32]>)>| {
            let mut w = World::new();
            for (a, _) in log {
                w.add(a);
            }
            w
        };
        out.case(&mut w, "the uploader's price tag on its bare bake: counts", "Money rule 18", "On a bare bake, the uploader's tag is the offer: a payment naming it is a payment of the uploader's price.", Facts::default(), ask("price tag", &own), json!("counts"), None);
        out.case(&mut fresh(&log), "another identity's price tag on someone's bare bake: nobody's offer", "Money rule 18", "Only the uploader's tag counts on a bare bake.", Facts::default(), ask("price tag", &other), json!("nobody's offer"), None);
        out.case(&mut fresh(&log), "a price tag under a publication, to a verifier reading Money: unknown", "Money rule 18; Agreements rule 12", "Who may sign it, the publication's split service or the party it designates, is Agreements' to judge.", Facts::default(), ask("price tag", &under), json!("unknown"), None);
        out.case(&mut fresh(&log), "the uploader's second version with no price, naming [first, previous]: valid, withdrawing the tag", "Money rule 18; \"Price tag (type 5)\"", "A version with no price withdraws the tag, by its signer alone.", Facts::default(), ask_status(&v2), json!("valid"), None);
        out.case(&mut fresh(&log), "a second version by another signer: invalid", "Money, \"Price tag (type 5)\"", "A later version is signed by the same signer.", Facts::default(), ask_status(&stranger_v2), json!("invalid"), None);
        out.case(&mut fresh(&log), "a price tag naming a bake and a publication: invalid", "Money, \"Price tag (type 5)\"", "Exactly one of fields 0 and 1.", Facts::default(), ask_status(&both), json!("invalid"), None);
    }
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
        let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: payee.id, amount: Amount { unit, value: 100 }, fulfils: pointer, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let cid = { let a = w.everyday_act(&mut payer, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
        let facts = Facts { rail_valid: vec![(rid, pointer), (cid, pointer)], rail_payments: vec![(proof.clone(), b"payment 1".to_vec())], ..Default::default() };
        out.case(&mut w, name, "Money rule 11", "The rail's answers are stated as facts (the core reads no rail): both valid, paid to the payee's flow, the proof one payment. Where they disagree in amount, the greater counts and the question is shown on the receiver.",
            facts, json!({ "question": "disagreements", "receiver": hx(&payee.id) }), json!(if agree { 0 } else { 1 }), None);
    }
    // "The same payment" is the rail Module's answer, handed as a fact;
    // without it, unknown, whether the proofs' bytes match or not.
    let mut w = World::new();
    let mut payee = w.genesis("a creditor", vec![own_home()], None, None);
    let mut debtor = w.genesis("a debtor", vec![own_home()], None, None);
    let pointer = pointer_act(&mut w, &mut payee, b"an address");
    let ob = Fin::Obligation(money::Obligation { debtor: debtor.id, creditor: payee.id, amount: Amount { unit, value: 100 }, pointer, agreement: None });
    let oid = { let a = w.everyday_act(&mut debtor, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
    // The creditor acknowledges the debt by a witness act of its own, whose history holds its pointer (Money rule 14).
    w.ack(&mut payee, oid);
    let receipt = |w: &mut World, payee: &mut Person, proof: &[u8]| {
        let r = Fin::Receipt(Receipt { rail, proof: proof.to_vec(), payer: Some(Payer::Identity(debtor.id)), payee: payee.id, amount: Amount { unit, value: 60 }, fulfils: oid, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(payee, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let (p1, p2) = (b"a proof of the payment, as one witness wrote it".to_vec(), b"a proof of the payment, as another witness wrote it".to_vec());
    let r1 = receipt(&mut w, &mut payee, &p1);
    let r2 = receipt(&mut w, &mut payee, &p2);
    let r3 = receipt(&mut w, &mut payee, &p1);
    let log = w.log.clone();
    let both = |a: Hash, b: Hash| vec![(a, pointer), (b, pointer)];
    let cases: Vec<(&str, &str, Vec<Hash>, Facts, J)> = vec![
        ("two receipts whose proofs differ in bytes, the rail saying one payment: counted once", "Two proofs of one payment are one payment, counted once; the second receipt is a duplicate, never a second payment.",
            vec![r1, r2], Facts { rail_valid: both(r1, r2), rail_payments: vec![(p1.clone(), b"payment A".to_vec()), (p2.clone(), b"payment A".to_vec())], ..Default::default() }, json!(60)),
        ("the same two receipts, the rail saying two payments: both count", "What is one payment, the rail Module says; here it names two.",
            vec![r1, r2], Facts { rail_valid: both(r1, r2), rail_payments: vec![(p1.clone(), b"payment A".to_vec()), (p2.clone(), b"payment B".to_vec())], ..Default::default() }, json!(120)),
        ("the same two receipts, no rail answer saying which payment each is: unknown", "Never through the proofs' bytes: without the rail's answer, whether they are one payment is unknown.",
            vec![r1, r2], Facts { rail_valid: both(r1, r2), ..Default::default() }, json!("unknown")),
        ("two receipts carrying byte-identical proofs, no rail answer saying which payment: unknown", "Identical bytes do not make one payment either; only the rail's answer does.",
            vec![r1, r3], Facts { rail_valid: both(r1, r3), ..Default::default() }, json!("unknown")),
        ("the same, the rail saying the proof is one payment: counted once", "The rail's answer for the proof: one payment.",
            vec![r1, r3], Facts { rail_valid: both(r1, r3), rail_payments: vec![(p1.clone(), b"payment A".to_vec())], ..Default::default() }, json!(60)),
    ];
    for (name, why, keep, facts, v) in cases {
        let mut w = World::new();
        for (x, _) in &log {
            let id = x.id();
            if [r1, r2, r3].contains(&id) && !keep.contains(&id) {
                continue;
            }
            w.add(x);
        }
        out.case(&mut w, name, "Money rule 12; rules 10 and 11", why, facts, ask("paid toward", &oid), v, None);
    }
    // An answer that depends on whether two unstated records are one payment is unknown; one that does not, stands.
    // A vow sold by a lone seller's offer: the club's receipt and the fan's claim of one payment.
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let name = { let v = mor_core::envelopes::vow::Vow { words: "A concert in the hall, 12 December".into(), cmip: None };
        let a = w.everyday_act(&mut club, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None); w.add(&a) };
    let o = agreements::Offer { under: None, sold: vec![agreements::Sold::Vow(name)], price: Amount { unit, value: 300 }, paid: None, words: Some("One seat.".into()), until: None, time: None, refund: None };
    let offer = ag_act(&mut w, &mut club, agreements::types::STANDING_OFFER, o.to_map(), None);
    let seat = b"the fan pays for a seat".to_vec();
    let rec = { let r = Fin::Receipt(Receipt { rail, proof: seat.clone(), payer: Some(Payer::Identity(fan.id)), payee: club.id, amount: Amount { unit, value: 300 }, fulfils: offer, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut club, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let claim = |w: &mut World, fan: &mut Person, acks: Option<Vec<Hash>>| {
        let c = Fin::Claim(Claim { rail, proof: seat.clone(), payee: club.id, amount: Amount { unit, value: 300 }, fulfils: offer, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(fan, mirs().money, 3, c.to_map(), None, acks); w.add(&a)
    };
    let c1 = claim(&mut w, &mut fan, None);
    let base = w.log.clone();
    let ask_vow = json!({ "question": "vow", "vow": hx(&name) });
    let stated = vec![(seat.clone(), b"one seat's payment".to_vec())];
    out.case(&mut w, "a vow's sale, the rail's answer stated: one sale, pending", "Money rule 12; Envelopes, \"Vows\"; Agreements rule 13",
        "The club's receipt and the fan's claim are one payment, as the rail says: one sale, by the fan's claim.",
        Facts { rail_valid: vec![(c1, offer)], rail_payments: stated.clone(), ..Default::default() }, ask_vow.clone(),
        json!({ "sales": [{ "act": hx(&c1), "buyer": hx(&fan.id), "state": "pending" }], "unsigned": [], "unknown": [] }), None);
    let mut w2 = World::new();
    for (a, _) in &base {
        w2.add(a);
    }
    out.case(&mut w2, "the same without the rail's answer: the sale stands, the receipt's place unknown", "Money rule 12; Envelopes, \"Vows\"",
        "The fan's sale does not depend on whether the receipt and the claim are one payment; whether the receipt is another payment signed by nobody does: unknown.",
        Facts { rail_valid: vec![(c1, offer)], ..Default::default() }, ask_vow.clone(),
        json!({ "sales": [{ "act": hx(&c1), "buyer": hx(&fan.id), "state": "pending" }], "unsigned": [], "unknown": [hx(&rec)] }), None);
    // The fan confirms by a later claim of the payment acknowledging the door's record of the vow.
    let mut w3 = World::new();
    for (a, _) in &base {
        w3.add(a);
    }
    let mut door = w3.genesis("the door", vec![own_home()], None, None);
    let scanned = { let a = w3.everyday_act_refs(&mut door, spec("a ticketing Module"), 0, vec![(Value::Uint(0), Value::Text("seat 14, scanned at the door".into()))], None, None, Some(vec![mor_core::act::Ref::Act(name)])); w3.add(&a) };
    let mut fan2 = fan.clone();
    let c2 = claim(&mut w3, &mut fan2, Some(vec![scanned]));
    let log3 = w3.log.clone();
    out.case(&mut w3, "a sale confirmed by the buyer's later claim acknowledging the door's record, the rail's answer stated: confirmed", "Money rule 12; Envelopes, \"Vows\"",
        "The later claim is of the same payment, as the rail says, and acknowledges an act about the vow.",
        Facts { rail_valid: vec![(c1, offer), (c2, offer)], rail_payments: stated.clone(), ..Default::default() }, ask_vow.clone(),
        json!({ "sales": [{ "act": hx(&c1.min(c2)), "buyer": hx(&fan.id), "state": "confirmed" }], "unsigned": [], "unknown": [] }), None);
    let mut w4 = World::new();
    for (a, _) in &log3 {
        w4.add(a);
    }
    out.case(&mut w4, "the same without the rail's answer: three records whose payment is not stated, so three pairs the vow depends on: unknown", "Money rule 12; Envelopes, \"Vows\"",
        "With one pair whose payment is not stated, an answer is judged both ways; the receipt and the two claims make three pairs, each of which the vow's sales depend on: with two or more, the answer is unknown.",
        Facts { rail_valid: vec![(c1, offer), (c2, offer)], ..Default::default() }, ask_vow,
        json!("unknown"), None);
    // A vow's sale whose payer's claim has no verification answer: unknown, never pending.
    let mut w7 = World::new();
    for (a, _) in &base {
        w7.add(a);
    }
    out.case(&mut w7, "a vow's sale whose buyer's claim has no verification answer: unknown, not pending", "Money rules 8 and 10; Agreements rule 13; Envelopes, \"Vows\"",
        "A receipt or claim whose verification answer is not valid is no purchase and no sale; where the answer is pending or not held, whether the payment is a sale is unknown. No rail answer is stated for the club's receipt or the fan's claim, though the rail says they are one payment.",
        Facts { rail_payments: stated.clone(), ..Default::default() }, json!({ "question": "vow", "vow": hx(&name) }),
        json!({ "sales": [{ "act": hx(&c1), "buyer": hx(&fan.id), "state": "unknown" }], "unsigned": [], "unknown": [] }), None);
    // A refund repaid: the fan's own receipt of money back, naming the fan's claim of the payment.
    let mut w5 = World::new();
    for (a, _) in &base {
        w5.add(a);
    }
    let back = b"the club pays the fan back".to_vec();
    let rr = { let r = Fin::Receipt(Receipt { rail, proof: back.clone(), payer: Some(Payer::Identity(club.id)), payee: fan.id, amount: Amount { unit, value: 300 }, fulfils: c1, previous: None, forward: None, batch: None, purchase: None });
        let a = w5.everyday_act(&mut fan, mirs().money, 2, r.to_map(), None, None); w5.add(&a) };
    let log5 = w5.log.clone();
    let ask_back = json!({ "question": "refund repaid", "payment": hx(&rec), "to": hx(&fan.id), "unit": hx(&unit) });
    out.case(&mut w5, "a refund owed on a payment, repaid by the payer's receipt naming its claim of that payment, the rail's answer stated: repaid", "Money rules 12 and 17; Agreements rule 93",
        "The receipt asked about and the claim the repayment names are one payment, as the rail says: the payer's own receipt of the money back repays it.",
        Facts { rail_valid: vec![(rr, fan.id)], rail_payments: stated.clone(), ..Default::default() }, ask_back.clone(), json!(300), None);
    let mut w6 = World::new();
    for (a, _) in &log5 {
        w6.add(a);
    }
    out.case(&mut w6, "the same without the rail's answer: unknown", "Money rules 12 and 17",
        "Whether the repayment names the same payment rests on the rail's answer: what is repaid depends on it.",
        Facts { rail_valid: vec![(rr, fan.id)], ..Default::default() }, ask_back, json!("unknown"), None);

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
    // A payment to oneself naming one's genesis: fulfils nothing in Money's sense.
    let mut w = World::new();
    let mut payee = w.genesis("a payee paying itself", vec![own_home()], None, None);
    let mut debtor = w.genesis("a debtor", vec![own_home()], None, None);
    let pointer = pointer_act(&mut w, &mut payee, b"an address");
    let ob = Fin::Obligation(money::Obligation { debtor: debtor.id, creditor: payee.id, amount: Amount { unit, value: 50 }, pointer, agreement: None });
    let oid = { let a = w.everyday_act(&mut debtor, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
    let r = Fin::Receipt(Receipt { rail, proof: b"a payment to myself".to_vec(), payer: Some(Payer::Identity(payee.id)), payee: payee.id, amount: Amount { unit, value: 50 }, fulfils: payee.id, previous: None, forward: None, batch: None, purchase: None });
    let rid = { let a = w.everyday_act(&mut payee, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let facts = Facts { rail_valid: vec![(rid, pointer)], ..Default::default() };
    assert_eq!(w.v.status(&rid), Status::Valid);
    out.case(&mut w, "a payment to oneself naming one's own genesis: valid, and it pays no obligation", "Money, \"What a payment fulfils\"", "Field 5 names the identity's genesis, an act to which no rule of Money or Agreements gives a payment following it a meaning, so the payment fulfils nothing in Money's sense; the debtor's obligation of the same amount stays unpaid.",
        facts, ask("paid toward", &oid), json!(0), None);

    // A deal's payments go where the payee's own grant in the deal sends them (Money rule 4; Agreements rules 15 and 17).
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut svc = w.genesis("the deal's split service", vec![own_home()], None, None);
    let mut backup = w.genesis("the deal's backup service", vec![own_home()], None, None);
    let mut buyer = w.genesis("a buyer", vec![own_home()], None, None);
    let to_service = |w: &mut World, grantor: &mut Person, service: &mut Person| {
        let k = schnorr(&format!("{} for {}", service.name, grantor.name), 0);
        let g = Grant { grantee: service.id, scope: 1, agreements: None, this_agreement: true, limits: None, limits_cmip: None, area: None, kinds: None, reinstates: None, by_this: false, key: signing_key(&k) };
        let id = ag_act(w, grantor, agreements::types::GRANT, g.to_map(), None);
        sign(w, service, &id);
        id
    };
    let ga = to_service(&mut w, &mut ana, &mut svc);
    let gb = to_service(&mut w, &mut ben, &mut svc);
    let ga2 = to_service(&mut w, &mut ana, &mut backup);
    let gb2 = to_service(&mut w, &mut ben, &mut backup);
    let svc_pointer = pointer_act(&mut w, &mut svc, b"the split service's address");
    let backup_pointer = pointer_act(&mut w, &mut backup, b"the backup service's address");
    let base = w.log.clone();
    let deal_with = |w: &mut World, ana: &mut Person, ben: &mut Person, grants: Vec<Hash>, backups: Option<Vec<Hash>>| {
        let mut t = deal(&[ana.id, ben.id], None);
        t.payee_grants = Some(grants);
        t.cmips.push((8, spec("a split cMIP")));
        t.backups = backups.map(|b| agreements::Backups { services: vec![agreements::ServiceGrants::PerPayee(b)], failure: None });
        let d = ag_act(w, ana, agreements::types::TERMS, t.to_map(), None);
        sign(w, ana, &d);
        sign(w, ben, &d);
        d
    };
    let pay = |w: &mut World, buyer: &mut Person, payee: Hash, fulfils: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim { rail, proof: proof.to_vec(), payee, amount: Amount { unit, value: 200 }, fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(buyer, mirs().money, 3, c.to_map(), None, None);
        w.add(&a)
    };
    let world = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)]| {
        let mut w = World::new();
        for (a, _) in log {
            w.add(a);
        }
        w
    };
    let (mut a2, mut b2, mut buyer2) = (ana.clone(), ben.clone(), buyer.clone());
    let (ana_d, ben_d, buyer_d) = (ana.clone(), ben.clone(), buyer.clone());
    let mut w1 = world(&base);
    let d = deal_with(&mut w1, &mut ana, &mut ben, vec![ga, gb], Some(vec![ga2, gb2]));
    let paid = pay(&mut w1, &mut buyer, ana.id, d, b"the buyer pays ana's share of the deal at its split service");
    let log1 = w1.log.clone();
    out.case(&mut w1, "a buyer's payment under a deal to its split service's pointer, the payee's grant listed in field 14: counts", "Money rule 4; Agreements rules 15 and 17",
        "Ana's own grant to the split service is listed in the deal's field 14, which she signed: the service's pointer is the deal's designated pointer, and a payment to it counts for Ana.",
        Facts { rail_valid: vec![(paid, svc_pointer)], ..Default::default() }, ask("payment counts", &paid), json!("counts"), None);
    let mut w3 = world(&log1);
    let after = pay(&mut w3, &mut buyer, ana.id, d, b"the buyer pays the backup after the split service's attempt failed");
    out.case(&mut w3, "a payment under the same deal to its backup's pointer (field 29): counts", "Money rule 4; Agreements rules 15 and 17",
        "Ana's own grant to the backup service is listed in field 29: its pointer is a pointer Money rule 4 counts for Ana. Whether the attempt before it failed is the split cMIP's answer, which this case does not state and Money rule 4 does not ask.",
        Facts { rail_valid: vec![(after, backup_pointer)], ..Default::default() }, ask("payment counts", &after), json!("counts"), None);
    let mut w2 = world(&base);
    let d2 = deal_with(&mut w2, &mut a2, &mut b2, vec![gb], None);
    let stray = pay(&mut w2, &mut buyer2, a2.id, d2, b"the buyer pays ana at a service her grant does not send the deal's money to");
    out.case(&mut w2, "the same payment under a deal listing no grant of the payee's: counts for nothing", "Money rule 4",
        "The deal lists only Ben's grant to the service; the service's pointer is not Ana's own, and no grant of hers in the deal sends her money there.",
        Facts { rail_valid: vec![(stray, svc_pointer)], ..Default::default() }, ask("payment counts", &stray), json!("does not count"), None);

    // A deal whose payees' grants name different services designates no pointer (Agreements rule 15).
    let mut w4 = world(&base);
    let (mut a4, mut b4, mut buyer4) = (ana_d.clone(), ben_d.clone(), buyer_d.clone());
    let d4 = deal_with(&mut w4, &mut a4, &mut b4, vec![ga, gb2], None);
    let split = pay(&mut w4, &mut buyer4, a4.id, d4, b"the buyer pays ana where the deal's grants disagree");
    out.case(&mut w4, "a payment under a deal whose payees' grants name different services: counts for nothing at either service", "Agreements rule 15: every grant field 14 lists names the same service, or the deal carries none of them; Money rule 4",
        "Ana's grant names the split service, Ben's the backup: the deal carries neither, designates no pointer, and Ana's payment to the split service's pointer is not paid to her.",
        Facts { rail_valid: vec![(split, svc_pointer)], ..Default::default() }, ask("payment counts", &split), json!("does not count"), None);

    // Which pointer a debt is paid to: the version the payee's own act holds (Money rule 17), never what the debtor drafts.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut bo = w.genesis("bo", vec![own_home()], None, None);
    let p1 = pointer_act(&mut w, &mut ana, b"ana's first wallet");
    let d = { let t = deal(&[ana.id, bo.id], None); ag_act(&mut w, &mut bo, agreements::types::TERMS, t.to_map(), None) };
    sign(&mut w, &mut bo, &d);
    sign(&mut w, &mut ana, &d);
    let p2 = { let x = Fin::PayeePointer(money::PayeePointer { payee: ana.id, version: 2, previous: Some(p1), rails: vec![money::Rail { module: rail, address: b"ana's second wallet".to_vec() }] });
        let a = w.everyday_act(&mut ana, mirs().money, 0, x.to_map(), None, None); w.add(&a) };
    let oid = { let o = Fin::Obligation(money::Obligation { debtor: bo.id, creditor: ana.id, amount: Amount { unit, value: 60 }, pointer: p2, agreement: Some(d) });
        let a = w.everyday_act(&mut bo, mirs().money, 1, o.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    let people = (ana.clone(), bo.clone());
    let pay = |w: &mut World, bo: &mut Person, proof: &[u8]| {
        let c = Fin::Claim(Claim { rail, proof: proof.to_vec(), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils: oid, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(bo, mirs().money, 3, c.to_map(), None, None);
        w.add(&a)
    };
    let world = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)]| { let mut w = World::new(); for (a, _) in log { w.add(a); } w };
    let mut w1 = world(&base);
    let c1 = pay(&mut w1, &mut bo, b"bo pays the debt to ana's second wallet");
    out.case(&mut w1, "a debt under a deal paid to a newer pointer than the payee's own act holds: it counts for nothing", "Money rule 17: the pointer is judged by the payee's own act, never by the payer's",
        "Ana's signature on the deal holds her first pointer only; the obligation Bo signed names her second, which is informative only. Paid to the second, the debt is not paid.",
        Facts { rail_valid: vec![(c1, p2)], rail_payments: vec![(b"bo pays the debt to ana's second wallet".to_vec(), b"payment one".to_vec())], ..Default::default() }, ask("paid toward", &oid), json!(0), None);
    let mut w2 = world(&base);
    let c2 = pay(&mut w2, &mut bo, b"bo pays the debt to ana's first wallet");
    out.case(&mut w2, "the same debt paid to the pointer the payee's own act holds: it counts", "Money rule 17",
        "Paid to the first pointer, the version Ana's own signature act holds.",
        Facts { rail_valid: vec![(c2, p1)], rail_payments: vec![(b"bo pays the debt to ana's first wallet".to_vec(), b"payment two".to_vec())], ..Default::default() }, ask("paid toward", &oid), json!(60), None);
    let (mut ana, mut bo) = people;
    let mut w3 = world(&base);
    sign(&mut w3, &mut ana, &d);
    let c3 = pay(&mut w3, &mut bo, b"bo pays the debt to ana's second wallet, after her later act");
    out.case(&mut w3, "the newer pointer, once a later act of the payee's on the deal holds it: it counts", "Money rule 17",
        "Ana signs again on the deal after publishing her second pointer, so her own act now holds it.",
        Facts { rail_valid: vec![(c3, p2)], rail_payments: vec![(b"bo pays the debt to ana's second wallet, after her later act".to_vec(), b"payment three".to_vec())], ..Default::default() }, ask("paid toward", &oid), json!(60), None);

    // Who signs Money's acts (Money rule 7; "Payee pointer"; "Obligation").
    let mut w = World::new();
    let ana = w.genesis("ana", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let forged = { let x = Fin::PayeePointer(money::PayeePointer { payee: ana.id, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: b"cy's wallet".to_vec() }] });
        let a = w.everyday_act(&mut cy, mirs().money, 0, x.to_map(), None, None); w.add(&a) };
    let receipt = { let r = Fin::Receipt(Receipt { rail, proof: b"cy writes ana's receipt".to_vec(), payer: Some(Payer::Identity(cy.id)), payee: ana.id, amount: Amount { unit, value: 5 }, fulfils: ana.id, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut cy, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let owed = { let o = Fin::Obligation(money::Obligation { debtor: ana.id, creditor: cy.id, amount: Amount { unit, value: 5 }, pointer: cy.id, agreement: None });
        let a = w.everyday_act(&mut cy, mirs().money, 1, o.to_map(), None, None); w.add(&a) };
    let log = w.log.clone();
    out.case(&mut w, "a payee pointer for one identity signed by another: invalid", "Money, \"Payee pointer\": valid only if signed by the identity it is for",
        "Cy signs a pointer naming Ana as its payee.", Facts::default(), ask_status(&forged), json!("invalid"), None);
    let mut w2 = World::new();
    for (a, _) in &log { w2.add(a); }
    out.case(&mut w2, "a receipt signed by someone who is not its payee: invalid", "Money rule 7: a receipt is signed by the receiver of the hop",
        "Cy signs a receipt naming Ana as payee, with no grant of Ana's.", Facts::default(), ask_status(&receipt), json!("invalid"), None);
    let mut w3 = World::new();
    for (a, _) in &log { w3.add(a); }
    out.case(&mut w3, "an obligation signed by its creditor: invalid", "Money, \"Obligation\": signed by the debtor",
        "Cy writes a debt Ana would owe him.", Facts::default(), ask_status(&owed), json!("invalid"), None);

    // One payment's records naming different debts, no batch: neither
    // counts until the receiver resolves them (Money rule 12).
    let mut w = World::new();
    let mut ana = w.genesis("ana, a creditor twice", vec![own_home()], None, None);
    let mut bo = w.genesis("bo, a debtor twice", vec![own_home()], None, None);
    // A rail whose specification binds the payee only, so that the
    // receiver's receipt, not the rail's commitment, resolves the purpose.
    let rail_content = cbor::encode(&Value::Map(vec![
        (Value::Uint(0), Value::Uint(mor_core::development::kinds::MODULE)),
        (Value::Uint(1), Value::Bytes(spec("a rail's creator").to_vec())),
        (Value::Uint(5), Value::Bytes(spec("a payment cMIP, by its hash").to_vec())),
        (Value::Uint(9), Value::Text("A push rail whose proof binds the payee only.".into())),
        (Value::Uint(11), Value::Uint(1)),
        (Value::Uint(13), Value::Array(vec![Value::Uint(0)])),
    ]));
    let rail = mor_core::development::Spec::hash_of(&rail_content);
    let pointer = { let x = Fin::PayeePointer(money::PayeePointer { payee: ana.id, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: b"ana's wallet".to_vec() }] });
        let a = w.everyday_act(&mut ana, mirs().money, 0, x.to_map(), None, None); w.add(&a) };
    let debt = |w: &mut World, bo: &mut Person, ana: &mut Person| {
        let o = Fin::Obligation(money::Obligation { debtor: bo.id, creditor: ana.id, amount: Amount { unit, value: 60 }, pointer, agreement: None });
        let id = { let a = w.everyday_act(bo, mirs().money, 1, o.to_map(), None, None); w.add(&a) };
        w.ack(ana, id);
        id
    };
    let (d1, d2) = (debt(&mut w, &mut bo, &mut ana), debt(&mut w, &mut bo, &mut ana));
    let proof = b"one payment of 60, claimed twice".to_vec();
    let claim = |w: &mut World, bo: &mut Person, fulfils: Hash| {
        let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(bo, mirs().money, 3, c.to_map(), None, None);
        w.add(&a)
    };
    let c1 = claim(&mut w, &mut bo, d1);
    let one = w.log.clone();
    let c2 = claim(&mut w, &mut bo, d2);
    let two = w.log.clone();
    let facts = |ids: &[Hash]| Facts { rail_valid: ids.iter().map(|i| (*i, pointer)).collect(), rail_payments: vec![(proof.clone(), b"the one payment".to_vec())], rail_specifications: vec![rail_content.clone()], ..Default::default() };
    let world = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)]| { let mut w = World::new(); for (a, _) in log { w.add(a); } w };
    out.case(&mut w, "one payment claimed toward two debts, no batch: it counts toward neither", "Money rule 12: records of one payment naming different purposes share it only under one batch",
        "Bo's two claims carry one rail proof, the rail saying one payment, each naming a different debt of 60 to Ana; neither names a batch (a claim carries none), and Ana has signed no receipt resolving them.",
        facts(&[c1, c2]), ask("paid toward", &d1), json!(0), None);
    let mut w2 = world(&one);
    out.case(&mut w2, "the same payment claimed toward one debt only: it counts", "Money rule 12; rule 10",
        "Only the claim naming the first debt is held: one payment, one purpose.", facts(&[c1]), ask("paid toward", &d1), json!(60), None);
    let mut w3 = world(&two);
    let rc = { let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(bo.id)), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils: d1, previous: None, forward: None, batch: None, purchase: None });
        let a = w3.everyday_act(&mut ana, mirs().money, 2, r.to_map(), None, None); w3.add(&a) };
    out.case(&mut w3, "both claims, and the receiver's receipt of the payment naming the first debt: it counts toward the first", "Money rule 12: until the receiver signs a receipt that resolves them; rule 11",
        "Ana's receipt of the one payment names the first debt: on a rail binding no purpose, the receiver has resolved the two claims.", facts(&[c1, c2, rc]), ask("paid toward", &d1), json!(60), None);
    let mut w4 = world(&w3.log.clone());
    out.case(&mut w4, "the same: nothing toward the second debt", "Money rule 12; rule 11",
        "The receiver's receipt names the first debt; the claim naming the second counts for nothing.", facts(&[c1, c2, rc]), ask("paid toward", &d2), json!(0), None);
    s7g_money(out);
    s7g_development_rails(out);
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
    // "Belongs to" at depth two: a receipt, through the obligation it fulfils, to the deal the obligation arises from.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut keeper = w.genesis("the deal's keeper", vec![own_home()], None, None);
    let mut ana = w.genesis("ana", vec![home_of(&home)], None, None);
    let t0 = deal(&[ana.id, ben.id], Some(Keepers { operators: vec![keeper.id], rule: Rule::All }));
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let unit = spec("a test unit (regtest satoshi)");
    let ob = Fin::Obligation(money::Obligation { debtor: ben.id, creditor: ana.id, amount: Amount { unit, value: 10 }, pointer: spec("a pointer"), agreement: Some(d) });
    let oid = { let a = w.everyday_act(&mut ben, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
    let rc = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: b"a payment of the debt".to_vec(), payer: Some(Payer::Identity(ben.id)), payee: ana.id, amount: Amount { unit, value: 10 }, fulfils: oid, previous: None, forward: None, batch: None, purchase: None });
    let rid = { let a = w.everyday_act(&mut ana, mirs().money, 2, rc.to_map(), None, None); w.add(&a) };
    keep(&mut w, &mut keeper, rid, ana.id);
    let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![rid]), ..Default::default() });
    w.receipt(&mut home, &ana.id, &r, 1);
    keep(&mut w, &mut keeper, r, ana.id);
    let log = w.log.clone();
    out.case(&mut w, "a keeper's record of an act belonging to its deal at depth two, before the rotation: disputed", "Agreements, \"Belongs to\" (no fixed depth); rules 41 and 42; Identity rule 34",
        "The receipt fulfils an obligation, and the obligation arises from the deal (its field 4): the receipt belongs to the deal, whose keeper recorded it before recording the rotation.", Facts::default(), ask("status after keepers", &rid), json!("disputed"), None);
    let mut w2 = World::new();
    for (x, _) in &log {
        if x.id() != oid {
            w2.add(x);
        }
    }
    out.case(&mut w2, "the same at a verifier not holding the obligation: unknown", "Agreements, \"Belongs to\": unknown beyond an act not held; Identity, \"A verifier that cannot tell answers unknown\"",
        "Whether the receipt belongs to an agreement whose keepers recorded it lies beyond the obligation, which is not held: void cannot be told.", Facts::default(), ask("status after keepers", &rid), json!("unknown"), None);

    // "Belongs to" through any act named in objects: a party's contest naming an obligation of the deal.
    let mut w = World::new();
    let mut home = w.operator("a home");
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut keeper = w.genesis("the deal's keeper", vec![own_home()], None, None);
    let mut ana = w.genesis("ana", vec![home_of(&home)], None, None);
    let t0 = deal(&[ana.id, ben.id], Some(Keepers { operators: vec![keeper.id], rule: Rule::All }));
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let unit = spec("a test unit (regtest satoshi)");
    let ob = Fin::Obligation(money::Obligation { debtor: ben.id, creditor: ana.id, amount: Amount { unit, value: 10 }, pointer: spec("a pointer"), agreement: Some(d) });
    let oid = { let a = w.everyday_act(&mut ben, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
    let k = ag_act(&mut w, &mut ana, agreements::types::CONTEST, agreements::Contest { act: oid, vow: None, promise: None }.to_map(), obj(oid));
    keep(&mut w, &mut keeper, k, ana.id);
    let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![k]), ..Default::default() });
    w.receipt(&mut home, &ana.id, &r, 1);
    keep(&mut w, &mut keeper, r, ana.id);
    out.case(&mut w, "a party's contest naming an obligation of the deal in objects, recorded by the deal's keeper before the rotation: disputed", "Agreements, \"Belongs to\" (each objects entry one step, whatever the act named is); rules 41, 42 and 54; Identity rule 34",
        "The contest names the obligation as chain and predecessor; the obligation arises from the deal (its field 4). Each objects entry is one step, whatever the act it names, so the contest belongs to the deal, and the keeper the deal names recorded it before recording the rotation.", Facts::default(), ask("status after keepers", &k), json!("disputed"), None);

    // The keepers of the version in force for an act.
    for (by_clone, name, v) in [
        (true, "an act naming the founding, its history holding a clone in force: the clone's keeper recorded it before the rotation: disputed", "disputed"),
        (false, "the same recorded only by the founding's keeper, whom the clone replaced: void", "void"),
    ] {
        let mut w = World::new();
        let mut home = w.operator("a home");
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let mut k1 = w.genesis("the founding's keeper", vec![own_home()], None, None);
        let mut k2 = w.genesis("the clone's keeper", vec![own_home()], None, None);
        let mut ana = w.genesis("ana", vec![home_of(&home)], None, None);
        let t0 = deal(&[ana.id, ben.id], Some(Keepers { operators: vec![k1.id], rule: Rule::All }));
        let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        let mut t1 = t0.clone();
        t1.parent = Some(d);
        t1.keepers = Some(Keepers { operators: vec![k2.id], rule: Rule::All });
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        t1.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let c = ag_act(&mut w, &mut ana, agreements::types::TERMS, t1.to_map(), obj(d));
        sign(&mut w, &mut ben, &c);
        sign(&mut w, &mut ana, &c);
        let x = ag_act(&mut w, &mut ana, agreements::new_types::LIVENESS, agreements::Liveness { agreement: d }.to_map(), obj(d));
        let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x]), ..Default::default() });
        w.receipt(&mut home, &ana.id, &r, 1);
        let k = if by_clone { &mut k2 } else { &mut k1 };
        keep(&mut w, k, x, ana.id);
        keep(&mut w, k, r, ana.id);
        out.case(&mut w, name, "Agreements, \"Belongs to\": its keepers are those of the version in force for the act; rules 41 and 42",
            "The act names the founding; its history (its prev, Ana's signature of the clone) holds the clone, complete: the version in force for it is the clone, whose keepers alone speak for it.", Facts::default(), ask("status after keepers", &x), json!(v), None);
    }

    // A record putting an operational clone in force at once.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let f = col.founding;
    let second = spec("a second payment cMIP");
    let mut t1 = view(&w).terms(&f).unwrap();
    t1.parent = Some(f);
    t1.cmips = vec![(6, second)];
    t1.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Area(2), signers: vec![col.m[1].id] }]);
    let clone = ag_act(&mut w, &mut col.m[1], agreements::types::TERMS, t1.to_map(), obj(f));
    let s1 = sign(&mut w, &mut col.m[1], &clone);
    let before = { let a = w.everyday_act(&mut col.c, second, 0, vec![(Value::Uint(0), Value::Uint(0))], None, None); w.add(&a) };
    sign(&mut w, &mut col.m[1], &before);
    let rec = {
        let saved = col.c.cite.take();
        let a = w.everyday_act(&mut col.c, mirs().agreements, agreements::types::RECORD, agreements::Record { clone: Some(clone), signatures: Some(vec![s1]), kept: vec![], registers: None }.to_map(), obj(clone), None);
        col.c.cite = saved;
        w.add(&a)
    };
    { let e = view(&w).record(&col.c.id, &rec).unwrap(); assert_eq!(e.puts, Some(clone), "the record puts the clone in force: {:?}", e); }
    let x = { let a = w.everyday_act(&mut col.c, second, 0, vec![(Value::Uint(0), Value::Uint(1))], None, None); w.add(&a) };
    sign(&mut w, &mut col.m[1], &x);
    out.case(&mut w, "a collective's act of the payment cMIP an operational clone names, after the record putting that clone in force: counts", "Agreements, record (type 17): an operational clone recorded is in force at once; rules 60 and 65",
        "The founding names one payment cMIP for task 6; the clone, marked by the Money area's power, names another; the collective records it, and its next act, of that cMIP, falls in the Money area and has its holder's signature.", Facts::default(), ask("consent counts", &x), json!(true), None);
    let log = w.log.clone();
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "the same kind of act signed before the record: does not count", "Agreements, record (type 17); rule 60",
        "Before the record the founding is in force, which names that cMIP for no task: the act falls in no area, and the collective has areas.", Facts::default(), ask("consent counts", &before), json!(false), None);

    // A record whose named signatures fall short of the clone's mark; a record naming a clone whose parent is not in force.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1, 2], 2);
    let f = col.founding;
    let second = spec("a second payment cMIP");
    let mut t1 = view(&w).terms(&f).unwrap();
    t1.parent = Some(f);
    t1.cmips = vec![(6, second)];
    let mut holders = vec![col.m[1].id, col.m[2].id];
    holders.sort();
    t1.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Area(2), signers: holders }]);
    let clone = ag_act(&mut w, &mut col.m[1], agreements::types::TERMS, t1.to_map(), obj(f));
    let s1 = sign(&mut w, &mut col.m[1], &clone);
    let s2 = sign(&mut w, &mut col.m[2], &clone);
    let base = w.log.clone();
    let record = |w: &mut World, col: &mut Col, clone: Hash, sigs: Vec<Hash>| {
        let saved = col.c.cite.take();
        let a = w.everyday_act(&mut col.c, mirs().agreements, agreements::types::RECORD, agreements::Record { clone: Some(clone), signatures: Some(sigs), kept: vec![], registers: None }.to_map(), obj(clone), None);
        col.c.cite = saved;
        w.add(&a)
    };
    let act_of = |w: &mut World, col: &mut Col, cmip: Hash| {
        let x = { let a = w.everyday_act(&mut col.c, cmip, 0, vec![(Value::Uint(0), Value::Uint(1))], None, None); w.add(&a) };
        sign(w, &mut col.m[1], &x);
        sign(w, &mut col.m[2], &x);
        x
    };
    let (c_saved, m_saved) = (col.c.clone(), col.m.clone());
    let mut w1 = World::new();
    for (a, _) in &base {
        w1.add(a);
    }
    record(&mut w1, &mut col, clone, vec![s1, s2]);
    let x = act_of(&mut w1, &mut col, second);
    out.case(&mut w1, "a record naming the signatures that meet its clone's mark: the clone in force, a collective's act of the cMIP it names counts", "Agreements, record (type 17); rule 65",
        "The Money area has two holders at threshold two; the clone is marked by that area's power; the record names both holders' signatures, so the clone is complete at the record and in force from it.", Facts::default(), ask("consent counts", &x), json!(true), None);
    col.c = c_saved.clone();
    col.m = m_saved.clone();
    let mut w2 = World::new();
    for (a, _) in &base {
        w2.add(a);
    }
    record(&mut w2, &mut col, clone, vec![s1]);
    let x = act_of(&mut w2, &mut col, second);
    out.case(&mut w2, "a record naming valid signatures short of its clone's mark: the clone not in force", "Agreements, record (type 17): the clone complete at the record only if the signatures it names meet its mark; rule 65",
        "The record names one of the two holders' signatures, though both signed: counted at the record, they fall short of the mark, so the clone is not put in force; the act of the cMIP it names falls in no area of the founding.", Facts::default(), ask("consent counts", &x), json!(false), None);
    col.c = c_saved.clone();
    col.m = m_saved.clone();
    let mut w3 = World::new();
    for (a, _) in &base {
        w3.add(a);
    }
    record(&mut w3, &mut col, clone, vec![s1, s2]);
    // A second clone of the founding, while the first is in force: its parent is not the agreement in force for its record.
    let third = spec("a third payment cMIP");
    let mut t2 = t1.clone();
    t2.cmips = vec![(6, third)];
    t2.text = "A second clone of the founding.".into();
    let clone2 = ag_act(&mut w3, &mut col.m[1], agreements::types::TERMS, t2.to_map(), obj(f));
    let u1 = sign(&mut w3, &mut col.m[1], &clone2);
    let u2 = sign(&mut w3, &mut col.m[2], &clone2);
    record(&mut w3, &mut col, clone2, vec![u1, u2]);
    let x = act_of(&mut w3, &mut col, third);
    out.case(&mut w3, "a record naming a clone whose parent is not the agreement in force for it: the clone not in force", "Agreements, record (type 17): the clone's parent is the agreement in force for the record",
        "A first record put a clone of the founding in force; a second record names another clone of the founding, complete, but its parent is no longer the agreement in force, so it is not put in force; the act of the cMIP it names falls in no area of the clone in force.", Facts::default(), ask("consent counts", &x), json!(false), None);

    // The heavy rules, on one collective whose members sign with their chain keys (SLH-DSA-SHA2-128f):
    // every case below holds acts of this one family, so its chain signatures are paid once.
    // A collective's closing (rule 91): the closing, signed by every member with a chain signature.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let (f, cid) = (col.founding, col.c.id);
    let before = text_act(&mut w, &mut col.c, "The collective's last notice before it closes.", None);
    sign(&mut w, &mut col.m[0], &before);
    let tip = KeptTip { act: *col.c.seq.last().unwrap(), position: col.c.seq.len() as u64, summary: mor_core::mmr::summary(&col.c.seq) };
    let closing = agreements::Closing { agreement: f, collective: cid, chain_act: col.c.binding, tips: vec![tip], open: vec![] };
    let k = ag_act(&mut w, &mut col.m[0], agreements::types::CLOSING, closing.to_map(), obj(f));
    let mut ends = vec![];
    for i in 0..3 {
        let (e, q) = w.chain_sign(&col.m[i], k);
        col.m[i] = q;
        ends.push(e);
    }
    let after = text_act(&mut w, &mut col.c, "A notice signed with the collective's key after it closed.", None);
    sign(&mut w, &mut col.m[0], &after);
    let family = w.log.clone();
    let hold = |leave: &[Hash]| {
        let mut w = World::new();
        for (a, _) in &family {
            if !leave.contains(&a.id()) {
                w.add(a);
            }
        }
        w
    };
    out.case(&mut hold(&[]), "a collective's closing signed by every member with a chain signature: complete", "Agreements rule 91; Identity, chain signatures",
        "Every voice of the agreement in force signed it with its chain key; the collective owes nothing and holds no stake.", Facts::default(), ask("closing", &k), json!({ "complete": true }), None);
    out.case(&mut hold(&[ends[2]]), "the same, one member's chain signature not held: not complete", "Agreements rule 91",
        "A closing needs every voice: the third member's chain signature is not among the acts held.", Facts::default(), ask("closing", &k), json!({ "complete": false }), None);
    out.case(&mut hold(&[]), "an act of the collective after its closing: it does not count", "Agreements rules 60 and 91",
        "Closed: what the collective's keys sign afterwards counts for nothing, its area's holder signing or not.", Facts::default(), ask("consent counts", &after), json!(false), None);
    out.case(&mut hold(&[]), "an act of the collective before its closing: it still counts", "Agreements rules 60 and 91",
        "What it signed before the closing, with its area's holder, stands.", Facts::default(), ask("consent counts", &before), json!(true), None);

    // A closing signed by every remaining member after one member's registered resignation.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let (f, cid) = (col.founding, col.c.id);
    let res = ag_act(&mut w, &mut col.m[2], agreements::types::RESIGNATION, agreements::Resignation { agreement: f, area: None, drafts: vec![] }.to_map(), obj(f));
    {
        let saved = col.c.cite.take();
        let a = w.everyday_act(&mut col.c, mirs().agreements, agreements::types::RECORD, agreements::Record { clone: None, signatures: None, kept: vec![], registers: Some(vec![res]) }.to_map(), obj(f), None);
        col.c.cite = saved;
        w.add(&a);
    }
    let tip = KeptTip { act: *col.c.seq.last().unwrap(), position: col.c.seq.len() as u64, summary: mor_core::mmr::summary(&col.c.seq) };
    let closing = agreements::Closing { agreement: f, collective: cid, chain_act: col.c.binding, tips: vec![tip], open: vec![] };
    let k = ag_act(&mut w, &mut col.m[0], agreements::types::CLOSING, closing.to_map(), obj(f));
    for i in 0..2 {
        let (_, q) = w.chain_sign(&col.m[i], k);
        col.m[i] = q;
    }
    out.case(&mut w, "a collective's closing signed by every remaining member after a registered resignation: complete", "Agreements rule 91; \"Closing\"; Resignation, registered by a record",
        "Cy resigned, and the collective's record registered it, so Cy's voice is removed before the closing; Ana and Ben, every remaining voice, signed the closing with their chain keys.", Facts::default(), ask("closing", &k), json!({ "complete": true }), None);

    // A closing under a constitutional rule counted by shares of a stake.
    let mut w = World::new();
    let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis("an abandonment authority", vec![own_home()], None, None);
    let keeper = w.genesis("the collective's keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut t = collective_terms(&ids, authority.id, keeper.id, vec![ids[1]], 1);
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(spec("the collective's work")), holders: vec![(agreements::Who::Id(ids[0]), 600_000), (agreements::Who::Id(ids[1]), 200_000), (agreements::Who::Id(ids[2]), 200_000)] }]);
    t.constitutional = Some(Rule::ByShare { stake: 0, share: 500_000 });
    let f = ag_act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &f);
    }
    let mut c = w.genesis_with("a collective", vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &f)]), 3);
    c.cite = Some((c.id, vec![c.id]));
    let tip = KeptTip { act: c.id, position: 0, summary: mor_core::mmr::summary(&[]) };
    let _ = tip;
    let closing = agreements::Closing { agreement: f, collective: c.id, chain_act: c.binding, tips: vec![], open: vec![] };
    let k = ag_act(&mut w, &mut m[0], agreements::types::CLOSING, closing.to_map(), obj(f));
    let (_, q) = w.chain_sign(&m[0], k);
    m[0] = q;
    out.case(&mut w, "a collective's closing under a constitutional rule counted by shares, signed by a member holding more than the share: complete", "Agreements rules 65 and 91; \"Closing\"",
        "The constitutional rule is half of the stake's shares; Ana holds six tenths and signed the closing with her chain key: decided, whatever the others do.", Facts::default(), ask("closing", &k), json!({ "complete": true }), None);

    // A collective's fork (rule 91): each side founds its successor first; the fork names them; every member signs it with a chain signature.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let (f, cid) = (col.founding, col.c.id);
    let ids: Vec<Hash> = col.m.iter().map(|p| p.id).collect();
    let before = text_act(&mut w, &mut col.c, "The collective's last notice before it forks.", None);
    sign(&mut w, &mut col.m[0], &before);
    let successor = |w: &mut World, col: &mut Col, name: &str, side: &[usize]| {
        let members: Vec<Hash> = side.iter().map(|i| ids[*i]).collect();
        let mut t = view(w).terms(&f).unwrap();
        t.parties = members.clone();
        t.clone = Rule::Threshold(members.len().min(2) as u64);
        if let Some(areas) = t.areas.as_mut() {
            areas[0].holders = vec![members[0]];
            areas[1].holders = vec![*members.last().unwrap()];
            areas[1].threshold = 1;
        }
        if let Some(g) = t.grammar.as_mut() {
            g.signing = Holding::Shares { threshold: 1, members: members.clone() };
            g.chain_key = Holding::Shares { threshold: members.len() as u64, members: members.clone() };
        }
        t.forked_from = Some(cid);
        let x = ag_act(w, &mut col.m[side[0]], agreements::types::TERMS, t.to_map(), None);
        for i in side {
            sign(w, &mut col.m[*i], &x);
        }
        w.genesis_with(name, vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &x)]), 3).id
    };
    let sa = successor(&mut w, &mut col, "side A", &[0]);
    let sb = successor(&mut w, &mut col, "side B", &[1, 2]);
    let tip = KeptTip { act: *col.c.seq.last().unwrap(), position: col.c.seq.len() as u64, summary: mor_core::mmr::summary(&col.c.seq) };
    let fork = agreements::Fork {
        agreement: f,
        collective: cid,
        chain_act: col.c.binding,
        tips: vec![tip],
        sides: vec![agreements::Side { successor: sa, members: vec![ids[0]] }, agreements::Side { successor: sb, members: vec![ids[1], ids[2]] }],
        shares: vec![],
        debts: vec![],
    };
    let k = ag_act(&mut w, &mut col.m[0], agreements::types::FORK, fork.to_map(), obj(f));
    let mut ends = vec![];
    for i in 0..3 {
        let (e, q) = w.chain_sign(&col.m[i], k);
        col.m[i] = q;
        ends.push(e);
    }
    let after = text_act(&mut w, &mut col.c, "A notice signed with the original's key after the fork.", None);
    sign(&mut w, &mut col.m[0], &after);
    let family = w.log.clone();
    let hold = |leave: &[Hash]| {
        let mut w = World::new();
        for (a, _) in &family {
            if !leave.contains(&a.id()) {
                w.add(a);
            }
        }
        w
    };
    out.case(&mut hold(&[]), "a collective's fork into two sides, each successor founded first, signed by every member with a chain signature: complete", "Agreements rule 91; Identity, chain signatures",
        "Every member on its sides signed it with its chain key, meeting the constitutional rule; each successor's founding names the original and fits its side; there is no debt to hand out.", Facts::default(), ask("fork", &k), json!({ "complete": true }), None);
    out.case(&mut hold(&[ends[1]]), "the same, one member's chain signature not held: not complete", "Agreements rule 91",
        "The constitutional rule is every party: the second member's chain signature is not among the acts held.", Facts::default(), ask("fork", &k), json!({ "complete": false }), None);
    out.case(&mut hold(&[]), "an act of the original after its fork: it does not count", "Agreements rules 60 and 91",
        "The original is closed in Agreements by its fork: what its keys sign afterwards counts for nothing.", Facts::default(), ask("consent counts", &after), json!(false), None);
    out.case(&mut hold(&[]), "an act of the original before its fork: it still counts", "Agreements rules 60 and 91",
        "What it signed before the fork, with its area's holder, stands.", Facts::default(), ask("consent counts", &before), json!(true), None);

    // An agreement as a party of another (Agreements, "an agreement is named as a party by its line"; rule 1):
    // its parties sign for it.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let t0 = deal(&[ana.id, ben.id], None);
    let inner = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut ana, &inner);
    sign(&mut w, &mut ben, &inner);
    let mut t = deal(&[inner, cy.id], None);
    t.text = "A deal one of whose parties is an agreement.".into();
    let outer = ag_act(&mut w, &mut cy, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut cy, &outer);
    let ben_signs = sign(&mut w, &mut ben, &outer);
    sign(&mut w, &mut ana, &outer);
    let family = w.log.clone();
    let hold = |leave: &[Hash]| {
        let mut w = World::new();
        for (a, _) in &family {
            if !leave.contains(&a.id()) {
                w.add(a);
            }
        }
        w
    };
    out.case(&mut hold(&[]), "a deal one of whose parties is an agreement, signed by the other party and by every party of that agreement: exists", "Agreements rule 1; an agreement as a party, named by its line",
        "The inner agreement signs through its own parties, Ana and Ben; Cy signs for itself.", Facts::default(), ask("agreement exists", &outer), json!("exists"), None);
    out.case(&mut hold(&[ben_signs]), "the same without one party of the inner agreement signing it: does not exist", "Agreements rule 1",
        "Ben, a party of the agreement that is a party, has not signed: the inner agreement has not signed.", Facts::default(), ask("agreement exists", &outer), json!("does not exist"), None);

    // An agreement as a party, forked and unsettled: its reference's parties sign for it.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let t0 = deal(&[ana.id, ben.id], None);
    let inner = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
    sign(&mut w, &mut ana, &inner);
    sign(&mut w, &mut ben, &inner);
    for text in ["Version A of the inner deal.", "Version B of the inner deal."] {
        let mut c = t0.clone();
        c.parent = Some(inner);
        c.text = text.into();
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        c.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let v = ag_act(&mut w, &mut ana, agreements::types::TERMS, c.to_map(), obj(inner));
        sign(&mut w, &mut ana, &v);
        sign(&mut w, &mut ben, &v);
    }
    let mut t = deal(&[inner, cy.id], None);
    t.text = "A deal one of whose parties is a forked agreement.".into();
    let outer = ag_act(&mut w, &mut cy, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut cy, &outer);
    sign(&mut w, &mut ben, &outer);
    sign(&mut w, &mut ana, &outer);
    out.case(&mut w, "a deal one of whose parties is an agreement standing forked, unsettled, signed by the other party and by every party of the inner agreement's reference: exists", "Agreements rules 1, 46 and 47; an agreement as a party, its version in force signing",
        "The inner deal has two complete versions of its founding, neither settled: by rule 47 the reference, the founding, stays in force, and its parties, Ana and Ben, sign for it.", Facts::default(), ask("agreement exists", &outer), json!("exists"), None);

    // A chain of judgment (rule 35): a deal's fork, its judge, the judge's period, the next link taking over.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut j0 = w.genesis("the first judge", vec![own_home()], None, None);
    let mut j1 = w.genesis("the next judge", vec![own_home()], None, None);
    let mut t = deal(&[ana.id, ben.id], None);
    t.arbitrators = Some(vec![j0.id, j1.id]);
    t.fork_judge = Some(j0.id);
    t.time = Some((spec("a block height reference"), Value::Uint(0)));
    t.chain = Some(vec![agreements::ChainLink { judge: agreements::Judge::Identity(j0.id), next: vec![(j1.id, 30)] }]);
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let mut branch = |w: &mut World, text: &str| {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        c.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let v = ag_act(w, &mut ana, agreements::types::TERMS, c.to_map(), obj(d));
        sign(w, &mut ana, &v);
        sign(w, &mut ben, &v);
        v
    };
    let a1 = branch(&mut w, "Version A.");
    let b1 = branch(&mut w, "Version B.");
    let request = ag_act(&mut w, &mut ben, agreements::types::SETTLEMENT_REQUEST, agreements::SettlementRequest { reference: d }.to_map(), obj(d));
    let settle = |w: &mut World, judge: &mut Person, kept: Hash, dropped: Hash| {
        let s = agreements::ForkSettlement { request, kept, discarded: vec![dropped] };
        ag_act(w, judge, agreements::types::FORK_SETTLEMENT, s.to_map(), Some(vec![Object { chain: request, predecessor: request }]))
    };
    let base = w.log.clone();
    let world = |extra: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)]| {
        let mut w = World::new();
        for (a, _) in base.iter().chain(extra) {
            w.add(a);
        }
        w
    };
    let ask_v = ask("version in force", &d);
    // The judge settles, keeping A.
    let mut w1 = world(&[]);
    settle(&mut w1, &mut j0, a1, b1);
    out.case(&mut w1, "a deal's fork settled by the judge its terms name, within its period: the version kept is in force", "Agreements rules 35 and 47",
        "The judge of forks answers the settlement request, keeping A.", Facts::default(), ask_v.clone(), json!(hx(&a1)), None);
    // The next link answers while the judge's period still runs: nothing.
    let mut w2 = world(&[]);
    let early = settle(&mut w2, &mut j1, b1, a1);
    let early_log = w2.log.clone();
    out.case(&mut w2, "the next link of the chain settling while the first judge's period runs: the deal stays on its reference", "Agreements rule 35",
        "Only the judge whose stage is open settles; the first judge's period has not passed.", Facts::default(), ask_v.clone(), json!(hx(&d)), None);
    // The first judge's period passed: the next link, within its stage, settles; what it signed before counts for nothing.
    let mut w3 = World::new();
    for (a, _) in &early_log {
        w3.add(a);
    }
    let within = settle(&mut w3, &mut j1, b1, a1);
    let _ = within;
    let lapsed = Facts { judges_lapsed: vec![(d, j0.id)], settled_out_of_turn: vec![early], ..Default::default() };
    let log3 = w3.log.clone();
    out.case(&mut w3, "the first judge's period passed with no answer: the next link settles, keeping B", "Agreements rule 35",
        "The time reference says the first judge's period passed; the next link's settlement within its stage counts, its earlier one, signed before its stage opened, does not.",
        Facts { judges_lapsed: lapsed.judges_lapsed.clone(), settled_out_of_turn: lapsed.settled_out_of_turn.clone(), ..Default::default() }, ask_v.clone(), json!(hx(&b1)), None);
    // The first judge answers after its period: nothing.
    let mut w4 = World::new();
    for (a, _) in &log3 {
        w4.add(a);
    }
    settle(&mut w4, &mut j0, a1, b1);
    out.case(&mut w4, "the first judge answering after its period: counts for nothing, the next link's settlement stands", "Agreements rule 35",
        "A judge speaking after its period has passed has no say.", lapsed, ask_v, json!(hx(&b1)), None);

    // A judge contradicting itself: its two first settlements keep different versions; the next link is active at once.
    let mut w5 = world(&[]);
    settle(&mut w5, &mut j0, a1, b1);
    settle(&mut w5, &mut j0, b1, a1);
    settle(&mut w5, &mut j1, b1, a1);
    out.case(&mut w5, "a judge's two first settlements keeping different versions: the next link active, its settlement in force", "Agreements rule 35; the chain of judgment",
        "A judge that contradicts itself has answered unknown: the next link is active with no period to wait, and its settlement, keeping B, counts.", Facts::default(), ask("version in force", &d), json!(hx(&b1)), None);

    // A settlement that omits a tip its history holds counts for nothing.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut j0 = w.genesis("the judge", vec![own_home()], None, None);
    let mut t = deal(&[ana.id, ben.id], None);
    t.arbitrators = Some(vec![j0.id]);
    t.fork_judge = Some(j0.id);
    t.time = Some((spec("a block height reference"), Value::Uint(0)));
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    // Version A cites version C after its parent, so A's history holds C (a branch it cites and does not name).
    let mut version = |w: &mut World, text: &str, cites: Option<Hash>| {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        c.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let mut o = obj(d).unwrap();
        o.extend(cites.map(|x| Object { chain: x, predecessor: x }));
        let v = ag_act(w, &mut ana, agreements::types::TERMS, c.to_map(), Some(o));
        sign(w, &mut ana, &v);
        sign(w, &mut ben, &v);
        v
    };
    let vc = version(&mut w, "Version C.", None);
    let va = version(&mut w, "Version A.", Some(vc));
    let vb = version(&mut w, "Version B.", None);
    let request = ag_act(&mut w, &mut ben, agreements::types::SETTLEMENT_REQUEST, agreements::SettlementRequest { reference: d }.to_map(), obj(d));
    let base = w.log.clone();
    let settle = |w: &mut World, judge: &mut Person, kept: Hash, dropped: Vec<Hash>| {
        let s = agreements::ForkSettlement { request, kept, discarded: dropped };
        ag_act(w, judge, agreements::types::FORK_SETTLEMENT, s.to_map(), Some(vec![Object { chain: request, predecessor: request }]))
    };
    let mut j0b = j0.clone();
    let mut dropped = vec![vb, vc];
    dropped.sort();
    settle(&mut w, &mut j0, va, dropped);
    out.case(&mut w, "a judge's settlement naming every tip it saw: the version kept is in force", "Agreements rule 47, \"What a settlement could see\"; \"The judge of forks\"",
        "The deal has three complete versions of its founding; the judge keeps A and names B and C as the tips it drops.", Facts::default(), ask("version in force", &d), json!(hx(&va)), None);
    let mut w2 = World::new();
    for (a, _) in &base {
        w2.add(a);
    }
    settle(&mut w2, &mut j0b, va, vec![vb]);
    out.case(&mut w2, "a judge's settlement omitting a tip it saw: it counts for nothing", "Agreements rule 47, \"What a settlement could see\": it counts only where it names every tip it saw",
        "The version kept, A, cites version C, so A's history holds C and the judge's settlement saw C through the history of the version it keeps; it neither keeps nor names C: it settles nothing, and the deal stays on its reference.", Facts::default(), ask("version in force", &d), json!(hx(&d)), None);

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
    let dl = |act: &Hash| json!({ "question": "deadline", "act": hx(act), "keepers": ops, "rule": [0], "clock": clock_hex, "point": 100 });
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

    // A buyer's contest of a purchase: shown beside it when the buyer signs it; signed by another identity, nothing.
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let mut other = w.genesis("another identity", vec![own_home()], None, None);
    let sold = agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("the concert's recording".into())));
    let o = agreements::Offer { under: None, sold: vec![sold], price: Amount { unit, value: 300 }, paid: None, words: Some("The full concert, filmed in the hall.".into()), until: None, time: None, refund: None };
    let offer = ag_act(&mut w, &mut club, agreements::types::STANDING_OFFER, o.to_map(), None);
    let proof = b"the fan pays for the recording".to_vec();
    { let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(fan.id)), payee: club.id, amount: Amount { unit, value: 300 }, fulfils: offer, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut club, mirs().money, 2, r.to_map(), None, None); w.add(&a); }
    let claim = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: club.id, amount: Amount { unit, value: 300 }, fulfils: offer, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(&mut fan, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    let words = agreements::Contest::of_purchase(claim, Some("A slideshow, not the concert.".into()));
    let facts = || Facts { rail_valid: vec![(claim, offer)], rail_payments: vec![(proof.clone(), b"the recording's payment".to_vec())], ..Default::default() };
    let ask_c = json!({ "question": "purchase contests", "purchase": hx(&claim) });
    let k = ag_act(&mut w, &mut fan, agreements::types::CONTEST, words.to_map(), obj(claim));
    out.case(&mut w, "a buyer's contest of their purchase: shown beside it", "Agreements rule 54; \"Contest (type 14)\"",
        "The fan's own payer's claim is the purchase; the fan signs a contest naming it, the promise not kept in words. It is shown beside the purchase and voids nothing.",
        facts(), ask_c.clone(), json!([hx(&k)]), None);
    let mut w2 = World::new();
    for (a, _) in &base {
        w2.add(a);
    }
    ag_act(&mut w2, &mut other, agreements::types::CONTEST, words.to_map(), obj(claim));
    out.case(&mut w2, "the same contest signed by another identity: shows nothing", "Agreements rule 54; \"Contest (type 14)\"",
        "Only the buyer of a purchase has standing to contest it; signed by anyone else, the contest shows nothing.",
        facts(), ask_c, json!([]), None);

    // A judge's settlement saw its request's history: the requester signed a third version before asking.
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut j0 = w.genesis("the judge", vec![own_home()], None, None);
    let mut t = deal(&[ana.id, ben.id], None);
    t.arbitrators = Some(vec![j0.id]);
    t.fork_judge = Some(j0.id);
    t.time = Some((spec("a block height reference"), Value::Uint(0)));
    t.text = "A deal whose judge of forks reads the request.".into();
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let mut version = |w: &mut World, text: &str| {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        c.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let v = ag_act(w, &mut ana, agreements::types::TERMS, c.to_map(), obj(d));
        sign(w, &mut ana, &v);
        sign(w, &mut ben, &v);
        v
    };
    let va = version(&mut w, "Version A.");
    let vb = version(&mut w, "Version B.");
    let vc = version(&mut w, "Version C.");
    // Ben's request follows his signature of C in his own sequence: its history holds C.
    let request = ag_act(&mut w, &mut ben, agreements::types::SETTLEMENT_REQUEST, agreements::SettlementRequest { reference: d }.to_map(), obj(d));
    let base = w.log.clone();
    let mut j0b = j0.clone();
    let settle = |w: &mut World, judge: &mut Person, kept: Hash, mut dropped: Vec<Hash>| {
        dropped.sort();
        let s = agreements::ForkSettlement { request, kept, discarded: dropped };
        ag_act(w, judge, agreements::types::FORK_SETTLEMENT, s.to_map(), Some(vec![Object { chain: request, predecessor: request }]))
    };
    settle(&mut w, &mut j0, va, vec![vb]);
    out.case(&mut w, "a judge's settlement keeping A and dropping B, its request's history holding a third version C: it counts for nothing", "Agreements rule 47, \"What a settlement could see\": what it cites, each with its own history",
        "The judge's settlement cites the request; the requester signed C before asking, so the request's history, and with it the settlement's, holds C. It neither keeps nor names C: it settles nothing, and the deal stays on its reference.",
        Facts::default(), ask("version in force", &d), json!(hx(&d)), None);
    let mut w2 = World::new();
    for (a, _) in &base {
        w2.add(a);
    }
    settle(&mut w2, &mut j0b, va, vec![vb, vc]);
    out.case(&mut w2, "the same settlement naming C among the tips it drops: the version kept is in force", "Agreements rule 47, \"What a settlement could see\"",
        "Every version of the fork the settlement saw, through the request's history and the versions' own, is on the line it keeps or a tip it names.",
        Facts::default(), ask("version in force", &d), json!(hx(&va)), None);

    // A collective's sale under its offer: its own stake is a stake in every work it sells (the glossary, "Stake").
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");
    let mut w = World::new();
    let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let authority = w.genesis("an abandonment authority", vec![own_home()], None, None);
    let keeper = w.genesis("the collective's keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut svc = w.genesis("the collective's split service", vec![own_home()], None, None);
    let g = Grant { grantee: svc.id, scope: 2, agreements: None, this_agreement: false, limits: None, limits_cmip: None, area: None, kinds: None, reinstates: None, by_this: true, key: signing_key(&schnorr("the collective's split service/grant key", 0)) };
    let g = ag_act(&mut w, &mut m[0], agreements::types::GRANT, g.to_map(), None);
    sign(&mut w, &mut svc, &g);
    let mut t = collective_terms(&ids, authority.id, keeper.id, vec![ids[1]], 1);
    t.text = "A test collective selling its works under its own stake.".into();
    t.split_grant = Some(g);
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::This, holders: vec![(agreements::Who::Id(ids[0]), 500_000), (agreements::Who::Id(ids[1]), 250_000), (agreements::Who::Id(ids[2]), 250_000)] }]);
    let founding = ag_act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &founding);
    }
    let mut c = w.genesis_with("a collective that sells", vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &founding)]), 3);
    c.cite = Some((c.id, vec![c.id]));
    // The collective's own pointer, naming the rail, signed by Ben, who holds the area reaching Money.
    let ptr = pointer_act(&mut w, &mut c, b"the collective's address at its split service");
    sign(&mut w, &mut m[1], &ptr);
    let mut fan = w.genesis("a fan of the collective", vec![own_home()], None, None);
    let work_hash = spec("the collective's album");
    let publ = { let a = w.everyday_act(&mut c, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work_hash.to_vec()))]), None, None); w.add(&a) };
    let o = agreements::Offer { under: Some(founding), sold: vec![agreements::Sold::Publication(publ)], price: Amount { unit, value: 500 }, paid: Some(agreements::Paid::Payee(c.id)), words: Some("The album.".into()), until: None, time: None, refund: None };
    let offer = { let a = w.everyday_act(&mut c, mirs().agreements, agreements::types::STANDING_OFFER, o.to_map(), obj(founding), None); w.add(&a) };
    let proof = b"the fan pays for the collective's album".to_vec();
    let purchase = Some(money::Purchase { agreement: founding, line: founding });
    let claim = { let x = Fin::Claim(Claim { rail, proof: proof.clone(), payee: c.id, amount: Amount { unit, value: 500 }, fulfils: offer, disagrees: None, referral: None, refund: None, anonymous: None, purchase: purchase.clone(), previous: None });
        let a = w.everyday_act(&mut fan, mirs().money, 3, x.to_map(), None, None); w.add(&a) };
    let receipt = { let x = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(fan.id)), payee: c.id, amount: Amount { unit, value: 500 }, fulfils: offer, previous: None, forward: None, batch: None, purchase });
        let a = w.everyday_act(&mut c, mirs().money, 2, x.to_map(), None, None); w.add(&a) };
    // Ben holds the area reaching Money: his signature act gives the collective's receipt its consent.
    sign(&mut w, &mut m[1], &receipt);
    let facts = || Facts { rail_valid: vec![(claim, offer), (receipt, offer)], rail_payments: vec![(proof.clone(), b"the album's payment".to_vec())], ..Default::default() };
    let mut w2 = World::new();
    for (a, _) in &w.log {
        w2.add(a);
    }
    out.case(&mut w, "a sale of a collective's work under its offer, the collective's agreement staking only the collective itself: a purchase", "Agreements rule 12; the glossary, \"Stake\": a stake in the collective itself is a share of all its income",
        "The offer is the collective's, under its agreement, selling its publication; the fan's claim names the agreement, and the collective's own receipt records the payment. The collective's stake in itself is a stake in every work it sells.",
        facts(), json!({ "question": "purchase", "act": hx(&claim) }), json!("purchase"), None);
    let k = ag_act(&mut w2, &mut fan, agreements::types::CONTEST, agreements::Contest::of_purchase(claim, Some("Two tracks are missing.".into())).to_map(), obj(claim));
    out.case(&mut w2, "the fan's contest of that purchase: shown beside it", "Agreements rule 54; \"Contest (type 14)\"",
        "The sale is a purchase, so the buyer's own contest naming the claim is shown beside it.",
        facts(), json!({ "question": "purchase contests", "purchase": hx(&claim) }), json!([hx(&k)]), None);

    // A deal's fork settled by the parties' own version (rule 47, "The settling version"; "Two settlements of one fork").
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut j0 = w.genesis("the judge", vec![own_home()], None, None);
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "A deal its parties settle themselves.".into();
    t.arbitrators = Some(vec![j0.id]);
    t.fork_judge = Some(j0.id);
    t.time = Some((spec("a block height reference"), Value::Uint(0)));
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    // A complete version cloning `parent`, naming in field 26 the tips it drops, cited after its parent.
    let version = |w: &mut World, ana: &mut Person, ben: &mut Person, parent: Hash, text: &str, mut settles: Vec<Hash>| {
        let mut c = t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        settles.sort();
        c.settles = (!settles.is_empty()).then(|| settles.clone());
        let mut signers = vec![ana.id, ben.id];
        signers.sort();
        c.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers }]);
        let mut o = vec![Object { chain: parent, predecessor: parent }];
        o.extend(settles.iter().map(|x| Object { chain: *x, predecessor: *x }));
        let v = ag_act(w, ana, agreements::types::TERMS, c.to_map(), Some(o));
        sign(w, ana, &v);
        sign(w, ben, &v);
        v
    };
    let va = version(&mut w, &mut ana, &mut ben, d, "Version A.", vec![]);
    let vb = version(&mut w, &mut ana, &mut ben, d, "Version B.", vec![]);
    let base = w.log.clone();
    let people = (ana.clone(), ben.clone(), j0.clone());
    let world = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)], skip: Option<Hash>| {
        let mut w = World::new();
        for (a, _) in log {
            if Some(a.id()) != skip {
                w.add(a);
            }
        }
        w
    };
    let mut w1 = world(&base, None);
    let s = version(&mut w1, &mut ana, &mut ben, va, "Settled: A, having seen B.", vec![vb]);
    out.case(&mut w1, "a deal's fork settled by its parties: a complete version on one branch naming the other's tip, the version in force", "Agreements rule 47, \"The settling version\"",
        "A clone of A, naming B in field 26 and citing it after its parent, signed by both parties: from it on, its line is in force.", Facts::default(), ask("version in force", &d), json!(hx(&s)), None);
    let (mut ana, mut ben, mut j0) = people.clone();
    let mut w2 = world(&base, None);
    version(&mut w2, &mut ana, &mut ben, va, "Settled: A, having seen B.", vec![vb]);
    version(&mut w2, &mut ana, &mut ben, vb, "Settled: B, having seen A.", vec![va]);
    out.case(&mut w2, "two settlements of the parties, neither holding the other, keeping different lines: tangled, on the reference", "Agreements rule 47, \"Two settlements of one fork, neither holding the other\"",
        "Every party signed both settlements, each naming the other branch's tip; neither's history holds the other.", Facts::default(), ask("deal fork", &d),
        json!({ "reference": hx(&d), "branches": 2, "tangled": true }), None);
    let mut w3 = world(&base, None);
    let request = ag_act(&mut w3, &mut ben, agreements::types::SETTLEMENT_REQUEST, agreements::SettlementRequest { reference: d }.to_map(), obj(d));
    let js = agreements::ForkSettlement { request, kept: va, discarded: vec![vb] };
    ag_act(&mut w3, &mut j0, agreements::types::FORK_SETTLEMENT, js.to_map(), Some(vec![Object { chain: request, predecessor: request }]));
    let sb = version(&mut w3, &mut ana, &mut ben, vb, "Settled by us: B, having seen A.", vec![va]);
    out.case(&mut w3, "the parties' settlement against the judge's, neither holding the other: the parties' holds", "Agreements rule 47, \"Two settlements of one fork, neither holding the other\"",
        "The judge keeps A; the parties, not citing the judge's settlement, settle on B. A version every party signed is the deal changing by its own rule; the judge's counts for nothing.",
        Facts::default(), ask("version in force", &d), json!(hx(&sb)), None);
    let (mut ana, mut ben, _) = people;
    let mut w4 = world(&base, None);
    let vb2 = version(&mut w4, &mut ana, &mut ben, vb, "Version B grows.", vec![]);
    let s4 = version(&mut w4, &mut ana, &mut ben, va, "Settled: A, having seen B grown.", vec![vb2]);
    let log4 = w4.log.clone();
    let mut w5 = world(&log4, Some(vb2));
    out.case(&mut w5, "a settling version naming a tip this verifier does not hold: a plain version, the deal on its reference", "Agreements rule 47, \"A settling version naming a version this verifier does not hold\"",
        "The verifier holds everything but B's newer version, which the settlement names: it reads the settlement as a plain version on A's branch until it holds it.",
        Facts::default(), ask("version in force", &d), json!(hx(&d)), None);
    out.case(&mut w4, "the same once the verifier holds the tip it names: the settlement counts", "Agreements rule 47, \"A settling version naming a version this verifier does not hold\"",
        "From then on it counts as a settlement.", Facts::default(), ask("version in force", &d), json!(hx(&s4)), None);

    // Several keepers: the deal's rule counts their records (rules 41 and 42).
    for (rule, name, v) in [(Rule::All, "a deal with two keepers under the rule \"every keeper\", only one recording the act before the rotation: void", "void"),
                            (Rule::Threshold(1), "the same under the rule \"at least one keeper\": disputed", "disputed")] {
        let mut w = World::new();
        let mut home = w.operator("a home");
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let mut k1 = w.genesis("the deal's first keeper", vec![own_home()], None, None);
        let mut k2 = w.genesis("the deal's second keeper", vec![own_home()], None, None);
        let mut ana = w.genesis("ana", vec![home_of(&home)], None, None);
        let t0 = deal(&[ana.id, ben.id], Some(Keepers { operators: vec![k1.id, k2.id], rule }));
        let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t0.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        let x = ag_act(&mut w, &mut ana, agreements::new_types::LIVENESS, agreements::Liveness { agreement: d }.to_map(), obj(d));
        let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x]), ..Default::default() });
        w.receipt(&mut home, &ana.id, &r, 1);
        keep(&mut w, &mut k1, x, ana.id);
        keep(&mut w, &mut k1, r, ana.id);
        keep(&mut w, &mut k2, r, ana.id);
        keep(&mut w, &mut k2, x, ana.id);
        out.case(&mut w, name, "Agreements rules 41 and 42; Identity rule 34", "The first keeper recorded the act before the rotation, the second only after it; the keepers' rule decides whether that is enough.", Facts::default(), ask("status after keepers", &x), json!(v), None);
    }

    // Purchases (rule 12): a payment for a claimed work naming no claim; the same naming it; a lone seller's offer.
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let cy = w.genesis("cy", vec![own_home()], None, None);
    let film = spec("ana and ben's film");
    let mut t = deal(&[ana.id, ben.id], None);
    t.text = "A deal over a film.".into();
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(film), holders: vec![(agreements::Who::Id(ana.id), 600_000), (agreements::Who::Id(ben.id), 400_000)] }]);
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let publ = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(film.to_vec()))]), None, None); w.add(&a) };
    let base = w.log.clone();
    let mut ana2 = ana.clone();
    let rc = |w: &mut World, ana: &mut Person, purchase: Option<money::Purchase>, proof: &[u8]| {
        let r = Fin::Receipt(Receipt { rail, proof: proof.to_vec(), payer: Some(Payer::Identity(cy.id)), payee: ana.id, amount: Amount { unit, value: 400 }, fulfils: publ, previous: None, forward: None, batch: None, purchase });
        let a = w.everyday_act(ana, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let r1 = rc(&mut w, &mut ana, None, b"cy pays for the film, naming no claim");
    out.case(&mut w, "a payment for a claimed work naming no claim: no purchase, owed back", "Agreements rule 12: a payment naming no claim is no purchase",
        "The film's stake is written in Ana and Ben's deal; Ana's receipt of Cy's payment names no claim (field 9).",
        Facts { rail_valid: vec![(r1, publ)], rail_payments: vec![(b"cy pays for the film, naming no claim".to_vec(), b"a payment".to_vec())], ..Default::default() }, json!({ "question": "purchase", "act": hx(&r1) }), json!("no purchase"), None);
    let mut w2 = World::new();
    for (a, _) in &base { w2.add(a); }
    let r2 = rc(&mut w2, &mut ana2, Some(money::Purchase { agreement: d, line: d }), b"cy pays for the film under the deal");
    out.case(&mut w2, "the same payment naming the deal as the claim it pays under: a purchase", "Agreements rule 12; Money rule 18",
        "Field 9 names the claiming agreement and the version at which Cy's client read it current.",
        Facts { rail_valid: vec![(r2, publ)], rail_payments: vec![(b"cy pays for the film under the deal".to_vec(), b"another payment".to_vec())], ..Default::default() }, json!({ "question": "purchase", "act": hx(&r2) }), json!("purchase"), None);
    let mut w = World::new();
    let mut sel = w.genesis("a lone seller", vec![own_home()], None, None);
    let buyer = w.genesis("a buyer of the lone seller", vec![own_home()], None, None);
    let o = agreements::Offer { under: None, sold: vec![agreements::Sold::Access(spec("an access cMIP"), cbor::encode(&Value::Text("a talk".into())))], price: Amount { unit, value: 90 }, paid: None, words: Some("A recorded talk.".into()), until: None, time: None, refund: None };
    let offer = ag_act(&mut w, &mut sel, agreements::types::STANDING_OFFER, o.to_map(), None);
    let r = { let x = Fin::Receipt(Receipt { rail, proof: b"the buyer pays the lone seller".to_vec(), payer: Some(Payer::Identity(buyer.id)), payee: sel.id, amount: Amount { unit, value: 90 }, fulfils: offer, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut sel, mirs().money, 2, x.to_map(), None, None); w.add(&a) };
    out.case(&mut w, "a payment following a lone seller's offer, naming no claim: a purchase", "Agreements rule 12: the offer itself is the agreement it pays under (rule 11; Money rule 18)",
        "The offer names no agreement (field 0); a payment following it names no claim and is a purchase under the offer's terms.",
        Facts { rail_valid: vec![(r, offer)], rail_payments: vec![(b"the buyer pays the lone seller".to_vec(), b"the talk's payment".to_vec())], ..Default::default() }, json!({ "question": "purchase", "act": hx(&r) }), json!("purchase"), None);

    // Only an agreement that exists claims a work (rule 12 with rule 1):
    // terms nobody signed, or one party alone, claim nothing.
    let mut w = World::new();
    let mut eve = w.genesis("eve, a filmmaker", vec![own_home()], None, None);
    let mut mal = w.genesis("mal, who drafts over her film", vec![own_home()], None, None);
    let fan = w.genesis("a fan of eve's film", vec![own_home()], None, None);
    let film = spec("eve's own film");
    let mut t = deal(&[mal.id, eve.id], None);
    t.text = "Terms Mal drafts staking Eve's film.".into();
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(film), holders: vec![(agreements::Who::Id(mal.id), 1_000_000)] }]);
    let drafted = ag_act(&mut w, &mut mal, agreements::types::TERMS, t.to_map(), None);
    let publ = { let a = w.everyday_act(&mut eve, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(film.to_vec()))]), None, None); w.add(&a) };
    let proof = b"the fan pays eve for her film".to_vec();
    let r = { let x = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(fan.id)), payee: eve.id, amount: Amount { unit, value: 400 }, fulfils: publ, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut eve, mirs().money, 2, x.to_map(), None, None); w.add(&a) };
    let facts = || Facts { rail_valid: vec![(r, publ)], rail_payments: vec![(proof.clone(), b"the fan's payment".to_vec())], ..Default::default() };
    let log = w.log.clone();
    out.case(&mut w, "a Money-only payment for a work only terms nobody signed stake: not a payment for a claimed work", "Agreements rule 12 (\"a work some agreement claims\") with rule 1",
        "Mal publishes terms staking Eve's film, signed by nobody: no agreement exists, so nothing claims the film, and Eve's receipt needs no claim.",
        facts(), json!({ "question": "purchase", "act": hx(&r) }), json!("not a payment for a work"), None);
    let mut w2 = World::new();
    for (a, _) in &log { w2.add(a); }
    sign(&mut w2, &mut mal, &drafted);
    out.case(&mut w2, "the same terms signed by their drafter alone: still nothing claims the work", "Agreements rule 12 with rule 1: an agreement exists once every party signed",
        "Mal signs his own draft; Eve, its other party, never does.", facts(), json!({ "question": "purchase", "act": hx(&r) }), json!("not a payment for a work"), None);
    let mut w3 = World::new();
    for (a, _) in &w2.log.clone() { w3.add(a); }
    sign(&mut w3, &mut eve, &drafted);
    out.case(&mut w3, "the same terms once every party signed: the work is claimed, and the payment naming no claim is no purchase", "Agreements rule 12 with rule 1",
        "Eve signs too: the agreement exists and claims the film; a payment for it naming no claim is no purchase, owed back.", facts(), json!({ "question": "purchase", "act": hx(&r) }), json!("no purchase"), None);
    s7g_agreements_a(out);
    s7g_agreements_b(out);
    s7g_agreements_c(out);
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
    s7g_development(out);
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

// ------------------------------------------------ S7g: the suspected differences run

/// S7g: Identity's suspected differences (`docs/untested-sentences.md`), each run as a case.
fn s7g_identity(out: &mut Out) {
    use mor_core::act::Scheme;
    use mor_core::identity::{HomeRule, SigningKey};
    let replay = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)], skip: &[Hash]| {
        let mut w = World::new();
        for (a, _) in log {
            if !skip.contains(&a.id()) {
                w.add(a);
            }
        }
        w
    };
    let chain_of = |id: &Hash| json!({ "question": "chain", "identity": hx(id) });

    // Row 4 (Identity, "Finality"): a homeless rotation is final once the
    // next rotation counts under the home rule it declared, not once an
    // escape counts through other homes.
    let mut w = World::new();
    let mut a = w.operator("oda's first home, alive");
    let b = w.operator("oda's second home");
    let c = w.operator("oda's third home");
    let mut n1 = w.operator("oda's new home");
    let mut n2 = w.operator("oda's escape home");
    let oda = w.genesis("oda", vec![home_of(&a), home_of(&b), home_of(&c)], Some(HomeRule::Threshold(2)), None);
    w.rotate(&b, Rot { closure: true, ..Default::default() });
    w.rotate(&c, Rot { closure: true, ..Default::default() });
    let (h1, mut o1) = w.rotate(&oda, Rot { homes: Some(vec![home_of(&n1)]), rule: Some(None), homeless: true, ..Default::default() });
    w.receipt(&mut n1, &oda.id, &h1, 1);
    let base = w.log.clone();
    let (h2, _) = w.rotate(&o1, Rot { homes: Some(vec![home_of(&n2)]), homeless: true, ..Default::default() });
    w.endorse(&mut o1, &h2, None);
    w.receipt(&mut n2, &oda.id, &h2, 2);
    w.object(&mut a, &oda.id, &h1);
    out.case(&mut w, "a homeless rotation, its old homes gone by closure but one, followed by an escape through other homes: the living old home's objection still voids it", "Identity, \"Finality\": final once a rotation at n plus one counts under the home rule the homeless rotation declared",
        "Two of Oda's three homes closed, so her homeless rotation to a new home counts, provisionally. The next rotation is an escape that counts through a home of its own, not through the new home's receipt: it does not make the first final, and the third home's objection voids it, and the escape built on it.",
        Facts::default(), chain_of(&oda.id), json!({ "counting": [hx(&oda.id)], "next": "pending", "dishonest": [] }), None);
    let mut w = replay(&base, &[]);
    let (s2, _) = w.rotate(&o1, Rot::default());
    w.receipt(&mut n1, &oda.id, &s2, 2);
    w.object(&mut a, &oda.id, &h1);
    out.case(&mut w, "the same, followed by a rotation its new home receipts: final, the late objection voids nothing", "Identity, \"Finality\"",
        "The next rotation counts under the home rule the homeless rotation declared: the homeless rotation is final, and the objection that surfaces after it changes nothing.",
        Facts::default(), chain_of(&oda.id), json!({ "counting": [hx(&oda.id), hx(&h1), hx(&s2)], "next": "end", "dishonest": [] }), None);

    // Row 5 is a question (whether a self-hosted home serves a homeless
    // rotation); the escape from a contested self-hosted position counts
    // with its new home's receipt, whichever way it is answered.
    let mut w = World::new();
    let mut nh = w.operator("sol's escape home");
    let mut sol = w.genesis("sol, contested", vec![own_home()], None, None);
    let (own, _) = w.rotate(&sol, Rot::default());
    let (thief, _) = w.rotate(&sol, Rot { signing_key: Some(schnorr("sol's thief", 1)), ..Default::default() });
    let (e, _) = w.rotate(&sol, Rot { homes: Some(vec![home_of(&nh)]), homeless: true, signing_key: Some(schnorr("sol, escaped", 1)), ..Default::default() });
    w.endorse(&mut sol, &e, Some(vec![own, thief]));
    let log = w.log.clone();
    let mut w = replay(&log, &[]);
    w.receipt(&mut nh, &sol.id, &e, 1);
    out.case(&mut w, "the same escape, its new home's receipt held: it counts", "Identity, \"Escape with both keys\"; rule 4",
        "Both keys, and the new home's receipt: the way out of a position contested at a self-hosted home.",
        Facts::default(), ask_status(&e), json!("valid"), None);

    // Row 7 (section 6, "A verifier that cannot tell answers unknown"): an
    // acknowledgement whose status cannot be told leaves the act unknown.
    let mut w = World::new();
    let mut home = w.operator("lia's home");
    let mut reader = w.genesis("a reader whose genesis is withheld", vec![own_home()], None, None);
    let mut lia = w.genesis("lia", vec![home_of(&home)], None, None);
    let relied = w.post(&mut lia, "a post the reader relied on");
    w.ack(&mut reader, relied);
    let (r, _) = w.rotate(&lia, Rot { disowned: Some(vec![relied]), ..Default::default() });
    w.receipt(&mut home, &lia.id, &r, 1);
    let log = w.log.clone();
    let mut w = replay(&log, &[reader.id]);
    out.case(&mut w, "a disowned act whose only acknowledgement is by an identity whose genesis is not held: unknown", "Identity, section 6: a verifier that cannot tell answers unknown, never valid, void or invalid; disputed waits on void as well",
        "Whether the acknowledgement counts cannot be told, so neither can whether the act is relied on: unknown, not void.",
        Facts::default(), ask_status(&relied), json!("unknown"), None);
    let mut w = replay(&log, &[]);
    out.case(&mut w, "the same with the acknowledger's genesis held: disputed", "Identity rule 34",
        "The acknowledgement is valid: the act is relied on.", Facts::default(), ask_status(&relied), json!("disputed"), None);

    // Row 6 ("Encoding and conventions", signature schemes): a key of a
    // founding scheme of the wrong length makes the act invalid.
    let mut w = World::new();
    let mut home = w.operator("kai's home");
    let kai = w.genesis("kai", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&kai, Rot { raw_signing_key: Some(SigningKey { scheme: Scheme::Founding(1), key: vec![7; 31] }), ..Default::default() });
    w.receipt(&mut home, &kai.id, &r, 1);
    out.case(&mut w, "a rotation installing a Schnorr signing key of 31 bytes: invalid", "Identity, \"Encoding and conventions\": a key of a founding scheme whose length is not the one in the table makes the act invalid",
        "Scheme 1 keys are 32 bytes; its home's receipt changes nothing.", Facts::default(), ask_status(&r), json!("invalid"), None);
    let mut w = World::new();
    let mut home = w.operator("kit's home");
    let kit = w.genesis("kit", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&kit, Rot { raw_signing_key: Some(SigningKey { scheme: Scheme::Spec(spec("a signature scheme, test value")), key: vec![7; 31] }), ..Default::default() });
    w.receipt(&mut home, &kit.id, &r, 1);
    out.case(&mut w, "a rotation installing a 31-byte key of a scheme named by hash: valid", "Identity, \"Encoding and conventions\": a scheme named by hash, whatever the lengths",
        "Lengths are checked only for founding schemes; a rotation's validity never depends on the kind of signing key it installs.", Facts::default(), ask_status(&r), json!("valid"), None);

    // Row 9 (receipt check 6): a voided, acknowledged receipt is shown as
    // contesting the position, and blocks nothing: the position is pending.
    let mut w = World::new();
    let mut hm = w.operator("uma's home, rotating");
    let mut wit = w.genesis("a witness of uma's home", vec![own_home()], None, None);
    let uma = w.genesis("uma", vec![home_of(&hm)], None, None);
    let (t, _) = w.rotate(&uma, Rot::default());
    let rc = w.receipt(&mut hm, &uma.id, &t, 1);
    w.ack(&mut wit, rc);
    w.rotate(&hm, Rot { kept: Some(vec![]), ..Default::default() });
    out.case(&mut w, "a rotation whose only receipt its home's rotation voided, the receipt acknowledged: pending, not contested", "Identity, receipt check 6: it blocks nothing; \"Definitions\": a contested position comes from rules 40, 44 and 4",
        "The voided receipt is a visible dispute and never support; no conflict under rules 40, 44 or 4 stands: the rotation waits on a receipt.",
        Facts::default(), chain_of(&uma.id), json!({ "counting": [hx(&uma.id)], "next": "pending", "dishonest": [] }), None);

    // Row 10 (rule 40): homes split, none meeting the rule: contested.
    let mut w = World::new();
    let mut h1 = w.operator("vic's first home");
    let mut h2 = w.operator("vic's second home");
    let h3 = w.operator("vic's third home, silent");
    let vic = w.genesis("vic", vec![home_of(&h1), home_of(&h2), home_of(&h3)], Some(HomeRule::Threshold(2)), None);
    let (r, _) = w.rotate(&vic, Rot::default());
    let (r2, _) = w.rotate(&vic, Rot { signing_key: Some(schnorr("vic's thief", 1)), ..Default::default() });
    w.receipt(&mut h1, &vic.id, &r, 1);
    let log = w.log.clone();
    w.receipt(&mut h2, &vic.id, &r2, 1);
    out.case(&mut w, "two rotations at one position, each receipted by one of three homes under a threshold of two: contested", "Identity rule 40: if none meets the rule, the identity is contested until one does",
        "The homes disagree and neither rotation meets the rule.", Facts::default(), chain_of(&vic.id), json!({ "counting": [hx(&vic.id)], "next": "contested", "dishonest": [] }), None);
    let mut w = replay(&log, &[]);
    out.case(&mut w, "the same with only one home's receipt held: pending", "Identity, \"What stops a chain\": pending",
        "No home disagrees: the rotation waits on a second home's receipt.", Facts::default(), chain_of(&vic.id), json!({ "counting": [hx(&vic.id)], "next": "pending", "dishonest": [] }), None);

    // Row 11 (the `successor` format): a "mor" identifier of another length
    // names no MOR identity, and no client follows it.
    let mut w = World::new();
    let mut home = w.operator("zed's home");
    let zed = w.genesis("zed", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&zed, Rot { successor: Some(Some(Successor { protocol: "mor".into(), identifier: vec![9; 31] })), ..Default::default() });
    w.receipt(&mut home, &zed.id, &r, 1);
    out.case(&mut w, "a succession to a \"mor\" identifier of 31 bytes: no succession", "Identity, Part three, `successor`: a \"mor\" identifier of another length names no MOR identity, and no client follows it",
        "Not another protocol's succession, which a cMIP could follow: it names nothing.", Facts::default(), json!({ "question": "succession", "identity": hx(&zed.id) }), json!({ "seen": "none" }), None);
    let mut w = World::new();
    let mut home = w.operator("zoe's home");
    let zoe = w.genesis("zoe", vec![home_of(&home)], None, None);
    let (r, _) = w.rotate(&zoe, Rot { successor: Some(Some(Successor { protocol: "another protocol, test value".into(), identifier: vec![9; 31] })), ..Default::default() });
    w.receipt(&mut home, &zoe.id, &r, 1);
    out.case(&mut w, "a succession to another protocol: that protocol's", "Identity, \"Succession\": confirmed as that protocol's link cMIP says",
        "Another protocol's identifier, whatever its length.", Facts::default(), json!({ "question": "succession", "identity": hx(&zoe.id) }), json!({ "seen": "another protocol's" }), None);

    // Row 15 ("The escape endorsement"): bound to the act just before the
    // homeless rotation, not to an older rotation that set the same key.
    let mut w = World::new();
    let mut home = w.operator("ivo's home");
    let mut nh = w.operator("ivo's escape home");
    let ivo = w.genesis("ivo", vec![home_of(&home)], None, None);
    let (r1, p1) = w.rotate(&ivo, Rot::default());
    w.receipt(&mut home, &ivo.id, &r1, 1);
    let (r2, p2) = w.rotate(&p1, Rot { signing_key: Some(schnorr("ivo", 1)), ..Default::default() });
    w.receipt(&mut home, &ivo.id, &r2, 2);
    let (h, _) = w.rotate(&p2, Rot { homes: Some(vec![home_of(&nh)]), homeless: true, ..Default::default() });
    w.receipt(&mut nh, &ivo.id, &h, 3);
    let log = w.log.clone();
    let mut old = p1.clone();
    w.endorse(&mut old, &h, None);
    out.case(&mut w, "an escape endorsement bound to an older rotation that set the same key: no escape", "Identity, \"The escape endorsement\": its binding names the act just before the homeless rotation",
        "The second rotation re-installed the first's key; the endorsement names the first. It is no escape endorsement, and the old home is not gone: the homeless rotation does not count.",
        Facts::default(), ask_status(&h), json!("pending"), None);
    let mut w = replay(&log, &[]);
    let mut cur = p2.clone();
    w.endorse(&mut cur, &h, None);
    out.case(&mut w, "the same endorsement bound to the act just before: an escape, it counts", "Identity, \"The escape endorsement\"",
        "Bound to the rotation just before the homeless one.", Facts::default(), ask_status(&h), json!("valid"), None);
}

/// S7g: Text, read for sentences no case exercised.
fn s7g_text(out: &mut Out) {
    let m = mirs();
    let tt = Some("text act format and rule 14 at a Text-only verifier");
    // A Text act of `p`, held where it opens; one that does not open is kept
    // in the log, as the verifier received it.
    let tx = |w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, acks: Option<Vec<Hash>>| -> Hash {
        let a = w.everyday_act(p, mirs().text, type_, payload, None, acks);
        let _ = w.v.add(a.clone());
        w.log.push((a.clone(), None));
        a.id()
    };
    let t0 = |s: &str| (Value::Uint(0), Value::Text(s.into()));

    // Rule 14: acks.
    let mut w = World::new();
    let mut p = w.genesis("ida", vec![own_home()], None, None);
    let x = w.post(&mut p, "A post Ida answers.");
    let a = tx(&mut w, &mut p, 0, vec![t0("Seen.")], Some(vec![x]));
    out.case(&mut w, "a text act carrying acks: invalid", "Text rule 14", "A text act carrying `acks` is invalid: no light act carries the weight of an acknowledgement.", Facts::default(), ask_status(&a), json!("invalid"), tt);

    // Part three and rule 4: the payload, decoded strictly; a format nobody here implements.
    let fmt = (Value::Uint(1), Value::Bytes(spec("a text format cMIP nobody here implements").to_vec()));
    let shapes: Vec<(&str, &str, u64, Vec<(Value, Value)>, &str)> = vec![
        ("a text act naming a format this verifier does not implement: valid", "Text rule 4; part three", 0, vec![t0("*Bold*, or plain."), fmt.clone()],
            "Field 1 a 32-byte hash: the format is the one case where an unknown cMIP does not make an act unknown."),
        ("a text act with no field 0: invalid", "Text, part three", 0, vec![fmt.clone()], "Field 0, the text, is required."),
        ("a text act whose field 0 is a byte string: invalid", "Text, part three", 0, vec![(Value::Uint(0), Value::Bytes(b"words".to_vec()))], "Field 0 is a text string."),
        ("a text act carrying a field 2: invalid", "Text, part three", 0, vec![t0("More."), (Value::Uint(2), Value::Uint(1))], "A closed map: no field but 0 and 1."),
        ("a text act whose format is 31 bytes: invalid", "Text, part three", 0, vec![t0("Short format."), (Value::Uint(1), Value::Bytes(vec![7; 31]))], "Field 1, if present, is a 32-byte hash."),
        ("a text act whose format is a text string: invalid", "Text, part three", 0, vec![t0("Named format."), (Value::Uint(1), Value::Text("markdown".into()))], "Field 1, if present, is a 32-byte hash."),
        ("a Text act of type 7: invalid", "Text, part three; Envelopes rule 30", 7, vec![t0("Type seven.")], "Text defines type 0 only."),
    ];
    for (name, rule, type_, payload, why) in shapes {
        let mut w = World::new();
        let mut p = w.genesis("ida", vec![own_home()], None, None);
        let a = tx(&mut w, &mut p, type_, payload, None);
        out.case(&mut w, name, rule, why, Facts::default(), ask_status(&a), json!(if type_ == 0 && name.ends_with(": valid") { "valid" } else { "invalid" }), tt);
    }

    // Rule 1: an act of a cMIP this verifier does not implement, its text not canonical.
    let mut w = World::new();
    let mut p = w.genesis("ida", vec![own_home()], None, None);
    let a = w.everyday_act(&mut p, spec("a cMIP nobody here implements"), 0, vec![(Value::Uint(0), Value::Text("A trailing space ".into()))], None, None);
    assert!(w.v.add(a.clone()).is_err(), "it does not open");
    w.log.push((a.clone(), None));
    out.case(&mut w, "an act of a cMIP the verifier does not implement, carrying a text that is not canonical: invalid, not unknown", "Text rule 1; Envelopes rule 30",
        "Every text field of every act is canonical, whatever specification defines it; a line ending with a space breaks rule 10.", Facts::default(), ask("verdict, implementing the MIRs only", &a.id()), json!("invalid"), Some("invalid beats unknown"));

    // Rule 1: a private act is checked by those who hold its key.
    {
        let mut w = World::new();
        let mut p = w.genesis("ida", vec![own_home()], None, None);
        let r = w.genesis("rui", vec![own_home()], None, None);
        let inside = mor_core::act::Inside {
            spec: m.text,
            type_: 0,
            prev: Some(vec![]),
            objects: None,
            payload: vec![(Value::Uint(0), Value::Text("Cafe\u{301}, privately.".into()))],
            position: Some(1),
            summary: Some(mor_core::hash::ZERO_HASH),
            acks: None,
            refs: None,
            hint: None,
            salt: sha256(b"s7g text: a private act's salt")[..16].try_into().unwrap(),
        };
        let (key, nonce) = content_key_for(&inside, Some(p.id), Some(p.binding));
        let sk = p.sign.clone();
        let a = mor_core::act::make(&inside, &key, &nonce, &mor_core::act::Addressing { signer: Some(p.id), binding: Some(p.binding), public: false, to: Some(vec![r.id]) }, |id| sk.sign(id, &[0; 32]));
        p.seq.push(a.id());
        assert!(w.v.add_with_key(a.clone(), Some(&key)).is_err(), "it does not open");
        w.log.push((a.clone(), Some(key)));
        out.case(&mut w, "a private text act whose text is not in NFC, its key held: invalid", "Text rule 1", "Those who hold its key check its text, and it is not canonical.", Facts::default(), ask_status(&a.id()), json!("invalid"), None);
    }

    // Rule 14, the first case: a collective's decisions, records included.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let (fd, cid) = (col.founding, col.c.id);
    let res = ag_act(&mut w, &mut col.m[2], agreements::types::RESIGNATION, agreements::Resignation { agreement: fd, area: None, drafts: vec![] }.to_map(), obj(fd));
    let rec = {
        let saved = col.c.cite.take();
        let a = w.everyday_act(&mut col.c, m.agreements, agreements::types::RECORD, agreements::Record { clone: None, signatures: None, kept: vec![], registers: Some(vec![res]) }.to_map(), obj(fd), None);
        col.c.cite = saved;
        w.add(&a)
    };
    let on_rec = text_act(&mut w, &mut col.c, "The collective's notice, after its record.", Some(vec![Object { chain: cid, predecessor: rec }]));
    let on_gen = text_act(&mut w, &mut col.c, "The collective's notice, naming its genesis after a record.", Some(vec![Object { chain: cid, predecessor: cid }]));
    let on_text = text_act(&mut w, &mut col.c, "The collective's notice, naming its own text.", Some(vec![Object { chain: cid, predecessor: on_rec }]));
    let on_res = text_act(&mut w, &mut col.c, "The collective's notice, naming a member's resignation.", Some(vec![Object { chain: cid, predecessor: res }]));
    let log = w.log.clone();
    out.case(&mut w, "a collective's text naming a record of its own: valid", "Text rule 14, first case; Agreements rule 58", "A record of the collective is one of its decisions.", Facts::default(), ask_status(&on_rec), json!("valid"), Some("at a Text-only verifier: unknown"));
    out.case(&mut w, "a collective's text naming its genesis though a later record is held: valid", "Text rule 14, first case",
        "Client conformance names the latest decision; a verifier accepts any of the collective's own records or links of its identity chain.", Facts::default(), ask_status(&on_gen), json!("valid"), Some("at a Text-only verifier: unknown"));
    out.case(&mut w, "a collective's text naming its own text act: invalid", "Text rule 14", "A predecessor that is no decision of its own: neither case.", Facts::default(), ask_status(&on_text), json!("invalid"), Some("at a Text-only verifier: unknown"));
    out.case(&mut w, "a collective's text naming a member's act: invalid", "Text rule 14", "The predecessor is not the collective's own: no decision of its own.", Facts::default(), ask_status(&on_res), json!("invalid"), Some("at a Text-only verifier: unknown"));
    let mut w2 = World::new();
    for (a, _) in &log {
        if a.id() != rec {
            w2.add(a);
        }
    }
    out.case(&mut w2, "a collective's text naming a record this verifier does not hold: unknown", "Text rule 14", "A verifier that does not yet hold the decision named answers unknown.", Facts::default(), ask_status(&on_rec), json!("unknown"), Some("at a Text-only verifier: unknown"));

    // Rule 14: a "record" claiming the collective, signed with another key.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let (fd, cid) = (col.founding, col.c.id);
    // Ben's resignation, so the forged act differs from any genuine record
    // another case holds (an act's id leaves its signature out).
    let res = ag_act(&mut w, &mut col.m[1], agreements::types::RESIGNATION, agreements::Resignation { agreement: fd, area: None, drafts: vec![] }.to_map(), obj(fd));
    let mut forger = col.c.clone();
    forger.cite = None;
    forger.sign = schnorr("a forger of the collective's records", 0);
    let a = w.everyday_act(&mut forger, m.agreements, agreements::types::RECORD, agreements::Record { clone: None, signatures: None, kept: vec![], registers: Some(vec![res]) }.to_map(), obj(fd), None);
    let forged = w.add(&a);
    let t = text_act(&mut w, &mut col.c, "The collective's notice, naming a forged record.", Some(vec![Object { chain: cid, predecessor: forged }]));
    out.case(&mut w, "a collective's text naming a record that claims the collective but another key signed: invalid", "Text rule 14; Agreements rule 58",
        "The act named is invalid, so no decision of the collective's own: neither case.", Facts::default(), ask_status(&t), json!("invalid"), Some("at a Text-only verifier: unknown"));

    // Rule 14, the second case: a person's grant key.
    let mut w = World::new();
    let mut gus = w.genesis("gus", vec![own_home()], None, None);
    let mut app = w.genesis("gus's app", vec![own_home()], None, None);
    let gid = gus.id;
    let (g, mut s) = grant_key_person(&mut w, &mut gus, &mut app, vec![Kind::Type { spec: m.text, type_: 0 }]);
    let ok = text_act(&mut w, &mut s, "Posted by Gus's app.", Some(vec![Object { chain: gid, predecessor: g }]));
    let on_gen = text_act(&mut w, &mut s, "Posted by Gus's app, naming his genesis.", Some(vec![Object { chain: gid, predecessor: gid }]));
    let log = w.log.clone();
    out.case(&mut w, "a grant key's text naming its grant: valid under Text, and backed", "Text rule 14, second case; Agreements rules 73 and 80",
        "Exactly one object, [grantor, the grant its binding names]; Agreements judge the backing: the grant reaches texts and its grantee accepted it.", Facts::default(), ask("backing", &ok), json!("backed"), None);
    out.case(&mut w, "a grant key's text naming another act of the grantor: invalid", "Text rule 14", "The one object must name the grant its binding names.", Facts::default(), ask_status(&on_gen), json!("invalid"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        if a.id() != g {
            w2.add(a);
        }
    }
    out.case(&mut w2, "a grant key's text whose grant this verifier does not hold: unknown", "Text rule 14", "A verifier that does not yet hold the grant its binding names answers unknown.", Facts::default(), ask_status(&ok), json!("unknown"), None);

    // Rule 14: a collective's grant key, the second case decides.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let cid = col.c.id;
    let mut agent = w.genesis("the collective's agent", vec![own_home()], None, None);
    let (g, mut s) = grant_key_person(&mut w, &mut col.c, &mut agent, vec![Kind::Type { spec: m.text, type_: 0 }]);
    let ok = text_act(&mut w, &mut s, "The agent's notice, naming its grant.", Some(vec![Object { chain: cid, predecessor: g }]));
    let on_gen = text_act(&mut w, &mut s, "The agent's notice, naming the collective's genesis.", Some(vec![Object { chain: cid, predecessor: cid }]));
    out.case(&mut w, "a collective's grant key's text naming its grant: scoped", "Text rule 14, second case", "Valid under Text; Agreements judge its backing.", Facts::default(), ask_status(&ok), json!("scoped"), None);
    out.case(&mut w, "a collective's grant key's text naming a decision of the collective: invalid", "Text rule 14",
        "Signed with a grant key, the second case decides, whoever the signer is: the one object names its grant; the first case is for the collective's own key.", Facts::default(), ask_status(&on_gen), json!("invalid"), None);

    // Rule 14: a holder's member key, its signature act not held.
    let mut w = World::new();
    let mut col = collective(&mut w, &[1], 1);
    let (cid, fd) = (col.c.id, col.founding);
    let mut ana = member_key(&mut w, &mut col, 0, "ana");
    let sig = ana.binding;
    let good = text_act(&mut w, &mut ana, "A text of the collective, by Ana's member key.", Some(vec![Object { chain: cid, predecessor: fd }]));
    let log = w.log.clone();
    out.case(&mut w, "a member key's text naming the version that named the key: scoped", "Text rule 14; Agreements rule 73", "Valid under Text, judged by Agreements.", Facts::default(), ask_status(&good), json!("scoped"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        if a.id() != sig {
            w2.add(a);
        }
    }
    out.case(&mut w2, "the same, the signature act that named the key not held: unknown", "Text rule 14",
        "A verifier that does not yet hold, for a member key, the signature act its binding names answers unknown.", Facts::default(), ask_status(&good), json!("unknown"), None);

    // Rule 14 and the freeze scenarios: a text act naming a deal is no fork of it.
    let mut w = World::new();
    let mut ada = w.genesis("ada", vec![own_home()], None, None);
    let mut bram = w.genesis("bram", vec![own_home()], None, None);
    let terms = deal(&[ada.id, bram.id], None);
    let d = ag_act(&mut w, &mut ada, agreements::types::TERMS, terms.to_map(), None);
    sign(&mut w, &mut ada, &d);
    sign(&mut w, &mut bram, &d);
    let on_deal = text_act(&mut w, &mut ada, "A party's note on the deal.", Some(vec![Object { chain: d, predecessor: d }]));
    out.case(&mut w, "a party's text naming its deal's head: invalid", "Text rule 14", "Another chain than its signer's: invalid at every verifier.", Facts::default(), ask_status(&on_deal), json!("invalid"), tt);
    out.case(&mut w, "the deal that text names: no fork, one version in force", "Text rule 14; Envelopes rule 15", "An invalid text act is never a fork of another MIR's chain.", Facts::default(), ask("deal fork", &d), json!("one version in force"), None);
}

/// S7g: Envelopes, read for sentences no case exercised.
/// (`docs/untested-sentences.md`, "Envelopes": what makes every act invalid
/// or unknown first, then withdrawals, key deliveries and encryption keys.)
fn s7g_envelopes(out: &mut Out) {
    use mor_core::act::{Ref, Scheme, Signature};
    use mor_core::envelopes::{types as et, EncKey, EncryptionKey, KeyDelivery, Version};
    let env = mirs().envelopes;
    let say = |t: &str| vec![(Value::Uint(0), Value::Text(t.into()))];
    // A signature under a scheme named by the hash of a specification this
    // verifier does not implement (Envelopes rule 4).
    let lacking = || Signature { scheme: Scheme::Spec(spec("a signature scheme this verifier lacks, test value")), key: vec![7; 40], sig: vec![9; 80] };
    // The inside of `a`, changed, sealed again and signed by `p` (or under `sig`).
    fn redo(p: &Person, a: &mor_core::act::Act, change: impl FnOnce(&mut mor_core::act::Inside), sig: Option<mor_core::act::Signature>) -> mor_core::act::Act {
        let mut inside = a.open(None).unwrap();
        change(&mut inside);
        let (key, nonce) = content_key_for(&inside, Some(p.id), Some(p.binding));
        let sign = p.sign.clone();
        mor_core::act::make(&inside, &key, &nonce, &mor_core::act::Addressing { signer: Some(p.id), binding: Some(p.binding), public: true, to: None }, |id| sig.unwrap_or_else(|| sign.sign(id, &[0; 32])))
    }

    // Rule 4, and "Invalid beats unknown" (rule 30): a scheme the verifier
    // lacks makes the act unknown, only where no rule it can apply fails.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let first = w.post(&mut p, "first");
    let a = w.everyday_act(&mut p, mirs().text, 0, say("Signed under a scheme this verifier lacks."), None, None);
    let lacked = { let x = redo(&p, &a, |_| {}, Some(lacking())); w.add(&x) };
    let b = w.everyday_act(&mut p, mirs().text, 0, say("The same, carrying acks."), None, None);
    let lacked_acks = { let x = redo(&p, &b, |i| i.acks = Some(vec![first]), Some(lacking())); w.add(&x) };
    let log = w.log.clone();
    out.case(&mut w, "an act signed under a signature scheme the verifier does not implement: unknown", "Envelopes rule 4; rule 30, \"Invalid beats unknown\"", "Every rule the verifier can apply passes (shape, text, prev); only the signature cannot be checked: unknown, never valid.", Facts::default(), ask_status(&lacked), json!("unknown"), None);
    let mut w2 = World::new();
    for (a, _) in &log {
        w2.add(a);
    }
    out.case(&mut w2, "a text act signed under a scheme the verifier lacks, carrying acks: invalid, not unknown", "Envelopes rule 30, \"Invalid beats unknown\"; rules 18 and 19", "The text's own example: a rule the verifier can apply (a text act carries no acks) fails, whatever it cannot read.", Facts::default(), ask_status(&lacked_acks), json!("invalid"), None);

    // Rule 5 and rule 30: canonical text at any depth, map keys included,
    // whatever specification the act names; invalid beats unknown.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let nested = |k: &str| vec![(Value::Uint(0), Value::Array(vec![Value::Map(vec![(Value::Text(k.into()), Value::Uint(1))])]))];
    let ok = w.everyday_act(&mut p, spec("a cMIP nobody here implements"), 0, nested("Cafe"), None, None);
    let ok = w.add(&ok);
    let bad = {
        let a = w.everyday_act(&mut p, spec("a cMIP nobody here implements"), 0, nested("Cafe\u{301}"), None, None);
        assert!(w.v.add(a.clone()).is_err(), "it does not open");
        w.log.push((a.clone(), None));
        a.id()
    };
    let log = w.log.clone();
    out.case(&mut w, "an act of a specification the verifier does not implement, a map key two levels deep in its payload canonical: unknown", "Envelopes rule 30", "Every rule the verifier can apply passes; its specification is one the verifier does not implement.", Facts::default(), ask("verdict, implementing the MIRs only", &ok), json!("unknown"), None);
    let mut w2 = World::new();
    for (a, k) in &log {
        if w2.v.add(a.clone()).is_ok() {
            w2.log.push((a.clone(), *k));
        } else {
            w2.log.push((a.clone(), None));
        }
    }
    out.case(&mut w2, "the same with that map key not in NFC: invalid, which beats unknown", "Envelopes rule 5; rule 30, \"Invalid beats unknown\"", "Every CBOR text string in the inside, map keys included, at any depth, whatever specification the act names, is canonical text: e followed by a combining acute is not NFC.", Facts::default(), ask("verdict, implementing the MIRs only", &bad), json!("invalid"), None);

    // Rules 18 and 19: only Identity, Money and Agreements acts carry acks.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let mut q = w.genesis("jun", vec![own_home()], None, None);
    let post = w.post(&mut p, "a post");
    let a = w.everyday_act(&mut q, mirs().text, 0, say("Received."), None, Some(vec![post]));
    let text_ack = w.add(&a);
    let like = w.like(&mut q, spec("a reaction cMIP, test value"), post);
    let a = w.everyday_act(&mut q, env, et::BAKE, publication(vec![]), None, Some(vec![post]));
    let pub_ack = w.add(&a);
    let witness = w.ack(&mut q, post);
    let log = w.log.clone();
    let fresh = |log: &Vec<(mor_core::act::Act, Option<[u8; 32]>)>| {
        let mut w = World::new();
        for (a, _) in log {
            w.add(a);
        }
        w
    };
    out.case(&mut w, "a text act carrying acks: invalid", "Envelopes rules 18 and 19", "A text act MUST NOT carry acks; one that does is invalid.", Facts::default(), ask_status(&text_ack), json!("invalid"), None);
    out.case(&mut fresh(&log), "a reaction under a cMIP carrying acks: invalid", "Envelopes rules 18 and 19; \"A like is never an acknowledgement\"", "An act whose type is not defined by Identity, Money or Agreements carrying acks is invalid, at a verifier knowing the six MIR hashes, though it implements no cMIP.", Facts::default(), ask("verdict, implementing the MIRs only", &like), json!("invalid"), None);
    out.case(&mut fresh(&log), "a publication carrying acks: invalid", "Envelopes rule 18: any other act of this MIR MUST NOT carry acks", "An Envelopes act carries no acks.", Facts::default(), ask_status(&pub_ack), json!("invalid"), None);
    out.case(&mut fresh(&log), "a witness act acknowledging the same post: valid", "Envelopes rule 18; Identity, witness act (type 15)", "An Identity act may carry acks: the deliberate way to rely on a post.", Facts::default(), ask_status(&witness), json!("valid"), None);

    // Rule 13: position and summary are not checked act by act, nor their absence.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    w.post(&mut p, "first");
    let a = w.everyday_act(&mut p, mirs().text, 0, say("No position, no summary."), None, None);
    let bare = { let x = redo(&p, &a, |i| { i.position = None; i.summary = None; }, None); w.add(&x) };
    let a = w.everyday_act(&mut p, mirs().text, 0, say("Position forty, the summary wrong."), None, None);
    let off = { let x = redo(&p, &a, |i| { i.position = Some(40); i.summary = Some(spec("not the summary of the line")); }, None); w.add(&x) };
    let log = w.log.clone();
    out.case(&mut w, "an everyday act carrying neither position nor summary: valid act by act", "Envelopes rule 13: position and summary are not checked act by act, nor is their absence", "Judged as an act whose position or summary does not fit, which only a rebuilt line judges; prev is present, with one entry.", Facts::default(), ask_status(&bare), json!("valid"), None);
    out.case(&mut fresh(&log), "an everyday act whose position and summary do not fit its predecessor: valid act by act", "Envelopes rule 13; freeze scenarios, \"Sequences\"", "Not invalid act by act; it cannot be proven kept when its line is rebuilt.", Facts::default(), ask_status(&off), json!("valid"), None);

    // Rule 20: a reference's signer is never a validity rule.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let mut q = w.genesis("jun", vec![own_home()], None, None);
    let stranger = w.genesis("kai", vec![own_home()], None, None);
    let post = w.post(&mut p, "a post");
    let a = w.everyday_act_refs(&mut q, mirs().text, 0, say("A reply naming the wrong signer."), None, None, Some(vec![Ref::Signed { act: post, signer: stranger.id }]));
    let reply = w.add(&a);
    out.case(&mut w, "a reply whose reference names a wrong signer: valid", "Envelopes rule 20: an act whose reference names a wrong signer stays valid", "The signer beside an act id is a hint of where to look; a wrong one shows only when the reference is followed.", Facts::default(), ask_status(&reply), json!("valid"), None);

    // Rule 8: Identity acts are public, save a private link.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let routes = |v: u64, prev: Option<Hash>| mor_core::envelopes::Routes { version: Version { version: v, previous: prev }, routes: vec![mor_core::envelopes::Route { scope: None, hints: vec!["a relay, test value".into()], kind: 0 }] }.to_map();
    let pid = p.id;
    let private_routes = w.private_act(&mut p, identity_spec(), mor_core::identity::types::ROUTES, routes(1, None), None, vec![pid]);
    out.case(&mut w, "a private routes act: invalid", "Envelopes rule 8; Identity, \"Every act defined by this MIR is public, except a private link\"", "Its content key is held, as its recipient holds it; an Identity act other than a link's is public.", Facts::default(), ask_status(&private_routes), json!("invalid"), None);

    // Rule 24 retired: a bake is never withdrawn; type 3 is retired, and a
    // bake carrying field 7 or 8 (reserved) is invalid ("Bake (type 0)").
    let mut w = World::new();
    let mut publisher = w.genesis("lea", vec![own_home()], None, None);
    let mut creator = w.genesis("mio", vec![own_home()], None, None);
    let mut stranger = w.genesis("ned", vec![own_home()], None, None);
    let pubn = w.everyday_act(&mut publisher, env, et::BAKE, publication(vec![(Value::Uint(8), Value::Bytes(creator.id.to_vec()))]), None, None);
    let pid = pubn.id();
    let naming = || Some(vec![Object { chain: pid, predecessor: pid }]);
    let by_stranger = { let a = w.everyday_act(&mut stranger, env, et::RETIRED_WITHDRAWAL, vec![], naming(), None); w.add(&a) };
    out.case(&mut w, "an act of the retired type 3 naming a bake this verifier does not hold: invalid", "Envelopes rule 24 (retired) and rule 30; \"Withdrawal (retired type 3)\"", "Type 3 is retired, never reused: an act of it is invalid, whatever it names.", Facts::default(), ask_status(&by_stranger), json!("invalid"), None);
    w.add(&pubn);
    let by_creator = { let a = w.everyday_act(&mut creator, env, et::RETIRED_WITHDRAWAL, vec![], naming(), None); w.add(&a) };
    let by_publisher = { let a = w.everyday_act(&mut publisher, env, et::RETIRED_WITHDRAWAL, vec![], naming(), None); w.add(&a) };
    let text = { let a = w.everyday_act(&mut publisher, mirs().text, 0, say("Not a publication."), None, None); w.add(&a) };
    let not_pub = { let a = w.everyday_act(&mut publisher, env, et::RETIRED_WITHDRAWAL, vec![], obj(text), None); w.add(&a) };
    let no_entry = { let a = w.everyday_act(&mut publisher, env, et::RETIRED_WITHDRAWAL, vec![], Some(vec![Object { chain: pid, predecessor: text }]), None); w.add(&a) };
    let priced = { let a = w.everyday_act(&mut publisher, env, et::BAKE, publication(vec![(Value::Uint(7), Value::Uint(100))]), None, None); w.add(&a) };
    let plain = { let a = w.everyday_act(&mut creator, env, et::BAKE, publication(vec![]), None, None); w.add(&a) };
    let log = w.log.clone();
    out.case(&mut w, "an act of the retired type 3 signed by a stranger: invalid", "Envelopes rule 24 (retired) and rule 30", "Type 3 is retired: no authority withdraws a bake.", Facts::default(), ask_status(&by_stranger), json!("invalid"), None);
    out.case(&mut fresh(&log), "an act of the retired type 3 signed by the identity a bake's field 8 names: invalid", "Envelopes rule 24 (retired) and rule 30", "A bake is never withdrawn; what stops is a price tag or a publication.", Facts::default(), ask_status(&by_creator), json!("invalid"), None);
    out.case(&mut fresh(&log), "an act of the retired type 3 signed by the bake's uploader: invalid", "Envelopes rule 24 (retired) and rule 30", "A bake is never withdrawn, by its uploader either: the uploader withdraws a price tag instead (Money rule 18).", Facts::default(), ask_status(&by_publisher), json!("invalid"), None);
    out.case(&mut fresh(&log), "an act of the retired type 3 naming a text act: invalid", "Envelopes rule 30", "Type 3 is retired.", Facts::default(), ask_status(&not_pub), json!("invalid"), None);
    out.case(&mut fresh(&log), "an act of the retired type 3 without the entry [bake, bake]: invalid", "Envelopes rule 30", "Type 3 is retired.", Facts::default(), ask_status(&no_entry), json!("invalid"), None);
    out.case(&mut fresh(&log), "a bake carrying field 8, reserved: invalid", "Envelopes, \"Bake (type 0)\"; rule 30", "Fields 7 and 8 are reserved, never reused: a bake names nobody it is made for.", Facts::default(), ask_status(&pid), json!("invalid"), None);
    out.case(&mut fresh(&log), "a bake carrying field 7, reserved: invalid", "Envelopes, \"Bake (type 0)\"; rule 30", "A bake carries no price: its price is a price tag (Money type 5).", Facts::default(), ask_status(&priced), json!("invalid"), None);
    out.case(&mut fresh(&log), "a bake with fields 0 to 4 and nothing reserved: valid", "Envelopes, \"Bake (type 0)\"", "A bake says only who uploaded it.", Facts::default(), ask_status(&plain), json!("valid"), None);

    // Rule 30: an act of a type this MIR does not define, or outside its format.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let retired = { let a = w.everyday_act(&mut p, env, et::RETIRED_COMMITMENT, vec![(Value::Uint(0), Value::Uint(3))], None, None); w.add(&a) };
    let mut no_nonce = publication(vec![]);
    no_nonce.retain(|(k, _)| *k != Value::Uint(4));
    let no_nonce = { let a = w.everyday_act(&mut p, env, et::BAKE, no_nonce, None, None); w.add(&a) };
    let log = w.log.clone();
    out.case(&mut w, "an Envelopes act of type 2, retired: invalid", "Envelopes rule 30; \"Types defined by this MIR\": type 2 retired, never reused", "An act of a type this MIR does not define is invalid.", Facts::default(), ask_status(&retired), json!("invalid"), None);
    out.case(&mut fresh(&log), "a bake without its nonce (field 4): invalid", "Envelopes rule 30; \"Bake (type 0)\"", "A payload outside its type's format is invalid.", Facts::default(), ask_status(&no_nonce), json!("invalid"), None);

    // Rule 11: a key delivery is valid as an act by its shape.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let q = w.genesis("jun", vec![own_home()], None, None);
    let secret = w.private_act(&mut p, mirs().text, 0, say("A private reply."), None, vec![q.id]);
    let wrong = KeyDelivery { target: secret, key: spec("not the key, test value"), media: false };
    let kd = { let a = w.everyday_act(&mut p, env, et::KEY_DELIVERY, wrong.to_map(), None, None); w.add(&a) };
    assert!(wrong.opens(&w.v.get(&secret).unwrap().act).is_err(), "its key opens nothing");
    let no_key = { let a = w.everyday_act(&mut p, env, et::KEY_DELIVERY, vec![(Value::Uint(0), Value::Bytes(secret.to_vec()))], None, None); w.add(&a) };
    let log = w.log.clone();
    out.case(&mut w, "a key delivery whose key does not open the act it names: valid as an act", "Envelopes rule 11: valid as an act by its shape; its key used only if it opens what it names", "Its key is ignored and shown so; the act itself stands.", Facts::default(), ask_status(&kd), json!("valid"), None);
    let mut w2 = World::new();
    for (a, k) in &log {
        w2.log.push((a.clone(), *k));
        w2.v.add_with_key(a.clone(), k.as_ref()).unwrap();
    }
    out.case(&mut w2, "a key delivery carrying no key: invalid", "Envelopes rule 11; \"Key delivery (type 1)\"; rule 30", "Field 1, the key, is required.", Facts::default(), ask_status(&no_key), json!("invalid"), None);

    // "Encryption key (type 4)": X-Wing, 1216 bytes; 1 to 3 are never encryption keys.
    let mut w = World::new();
    let mut p = w.genesis("ivo", vec![own_home()], None, None);
    let ek = |len: usize| EncryptionKey { version: Version { version: 1, previous: None }, key: EncKey::xwing(vec![5; len]) }.to_map();
    let good = { let a = w.everyday_act(&mut p, env, et::ENCRYPTION_KEY, ek(1216), None, None); w.add(&a) };
    let short = { let a = w.everyday_act(&mut p, env, et::ENCRYPTION_KEY, ek(1215), None, None); w.add(&a) };
    let schnorr = vec![(Value::Uint(0), Value::Uint(1)), (Value::Uint(2), Value::Array(vec![Value::Uint(1), Value::Bytes(vec![5; 32])]))];
    let schnorr = { let a = w.everyday_act(&mut p, env, et::ENCRYPTION_KEY, schnorr, None, None); w.add(&a) };
    let log = w.log.clone();
    out.case(&mut w, "an X-Wing encryption key of 1216 bytes, version 1: valid", "Envelopes, \"Encryption key (type 4)\"", "Scheme 4, a 1216-byte key, version 1 naming nothing it replaces.", Facts::default(), ask_status(&good), json!("valid"), None);
    out.case(&mut fresh(&log), "an X-Wing encryption key of 1215 bytes: invalid", "Envelopes, \"Encryption key (type 4)\"; rule 30", "An X-Wing key of another length than 1216 bytes makes the act invalid.", Facts::default(), ask_status(&short), json!("invalid"), None);
    out.case(&mut fresh(&log), "an encryption key under scheme 1, a signature scheme: invalid", "Envelopes, \"Encryption key (type 4)\": numbers 1 to 3 are signature schemes and are never encryption keys", "enc-key's scheme is 4 or a specification hash.", Facts::default(), ask_status(&schnorr), json!("invalid"), None);
}

/// S7g: Money's suspected differences (`docs/untested-sentences.md`, Money).
fn s7g_money(out: &mut Out) {
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");
    let other_rail = spec("another rail Module, which the payee's pointer does not name");
    let case = |out: &mut Out, w: &mut World, name: &str, rule: &str, why: &str, facts: Facts, q: J, v: J| out.case(w, name, rule, why, facts, q, v, None);

    // Row 1 (Money rule 4): a receipt or claim counts only if the rail
    // Module its field 0 names is the one the pointer it was paid to names.
    let mut w = World::new();
    let mut ana = w.genesis("ana, paid on one rail", vec![own_home()], None, None);
    let mut bo = w.genesis("bo, who pays on another", vec![own_home()], None, None);
    let pointer = pointer_act(&mut w, &mut ana, b"ana's wallet on the one rail");
    let oid = { let o = Fin::Obligation(money::Obligation { debtor: bo.id, creditor: ana.id, amount: Amount { unit, value: 60 }, pointer, agreement: None });
        let a = w.everyday_act(&mut bo, mirs().money, 1, o.to_map(), None, None); w.add(&a) };
    w.ack(&mut ana, oid);
    let base = w.log.clone();
    let world = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)]| { let mut w = World::new(); for (a, _) in log { w.add(a); } w };
    for (on, name, v) in [
        (other_rail, "a debt claimed paid on a rail Module the pointer it was paid to does not name: it counts for nothing", json!(0)),
        (rail, "the same debt claimed paid on the rail Module that pointer names: it counts", json!(60)),
    ] {
        let mut w = world(&base);
        let mut bo = bo.clone();
        let proof = format!("bo pays ana's debt, on {}", if on == rail { "her rail" } else { "another rail" }).into_bytes();
        let c = { let c = Fin::Claim(Claim { rail: on, proof: proof.clone(), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils: oid, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
            let a = w.everyday_act(&mut bo, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
        case(out, &mut w, name, "Money rule 4: the rail Module its field 0 names is the one named by the rail of the payee's pointer that the payment was paid to; a receipt or claim naming any other counts for nothing",
            "Ana's only pointer names one rail Module; Bo's claim of the payment names the rail Module in field 0, and the rail's answer says it was paid to that pointer.",
            Facts { rail_valid: vec![(c, pointer)], rail_payments: vec![(proof, b"the payment".to_vec())], ..Default::default() }, ask("paid toward", &oid), v);
    }
    for (on, name, v) in [
        (other_rail, "the payee's own receipt naming a rail Module its pointer does not name: it does not count", json!("does not count")),
        (rail, "the payee's own receipt naming the rail Module its pointer names: it counts", json!("counts")),
    ] {
        let mut w = world(&base);
        let mut ana = ana.clone();
        let proof = format!("ana's receipt of bo's payment, on {}", if on == rail { "her rail" } else { "another rail" }).into_bytes();
        let r = { let r = Fin::Receipt(Receipt { rail: on, proof: proof.clone(), payer: Some(Payer::Identity(bo.id)), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils: oid, previous: None, forward: None, batch: None, purchase: None });
            let a = w.everyday_act(&mut ana, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
        case(out, &mut w, name, "Money rule 4",
            "Ana signs the receipt herself; its field 0 names a rail Module, and the rail's answer says the payment was paid to her one pointer.",
            Facts { rail_valid: vec![(r, pointer)], rail_payments: vec![(proof, b"the payment".to_vec())], ..Default::default() }, ask("payment counts", &r), v);
    }

    // Row 37 (Money rule 7; Agreements rules 76 and 80): a receipt under a
    // revoked grant signs no receipt, in a refund as in a debt.
    let mut w = World::new();
    let mut club = w.genesis("a club that pays back", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan paid back", vec![own_home()], None, None);
    let mut app = w.genesis("the fan's wallet app", vec![own_home()], None, None);
    let club_ptr = pointer_act(&mut w, &mut club, b"the club's wallet");
    let (g, lane) = grant_key_person(&mut w, &mut fan, &mut app, vec![Kind::Type { spec: mirs().money, type_: 2 }]);
    let paid = b"the fan pays the club".to_vec();
    let c1 = { let c = Fin::Claim(Claim { rail, proof: paid.clone(), payee: club.id, amount: Amount { unit, value: 300 }, fulfils: club_ptr, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(&mut fan, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
    let back = b"the club pays the fan back".to_vec();
    let mut lane2 = lane.clone();
    let rr = { let r = Fin::Receipt(Receipt { rail, proof: back.clone(), payer: Some(Payer::Identity(club.id)), payee: fan.id, amount: Amount { unit, value: 300 }, fulfils: c1, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(&mut lane2, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    let facts = || Facts { rail_valid: vec![(rr, fan.id)], rail_payments: vec![(paid.clone(), b"the fan's payment".to_vec()), (back.clone(), b"the refund".to_vec())], ..Default::default() };
    let ask_back = json!({ "question": "refund repaid", "payment": hx(&c1), "to": hx(&fan.id), "unit": hx(&unit) });
    let mut w1 = world(&base);
    case(out, &mut w1, "money paid back, shown by the payer's receipt signed with its grant key reaching receipts: repaid", "Money rules 7 and 17; Agreements rule 80",
        "The fan's grant to its wallet app reaches receipts; the app signs the fan's receipt of the club's money back, naming the fan's claim of the payment.",
        facts(), ask_back.clone(), json!(300));
    let mut w2 = world(&base);
    let mut fan2 = fan.clone();
    ag_act(&mut w2, &mut fan2, agreements::types::REVOCATION, agreements::Revocation { grant: g }.to_map(), Some(vec![Object { chain: fan.id, predecessor: g }]));
    case(out, &mut w2, "the same receipt, the grant revoked and the revocation's history not holding it: void", "Agreements rules 76 and 80",
        "The fan revokes the grant; the revocation's history does not hold the app's receipt, and nobody acknowledges it.",
        facts(), ask("backing", &rr), json!("not backed (void)"));
    let mut w3 = world(&w2.log.clone());
    case(out, &mut w3, "the same: the money back is not shown repaid by that receipt", "Money rule 7: a receipt under a grant that the grant's revocation does not hold counts for nothing (Agreements rule 80); rule 17",
        "The only record of the money back is the app's receipt, which the revocation leaves void: it shows nothing repaid.",
        facts(), ask_back, json!(0));

    // Row 6 (Money rule 4, last paragraph; rules 3, 17 and 29): a refund to
    // the refund rail the payer's claim names, bounded by the payer's vault.
    let vault = |limit: u64| money::vault_declaration(&mirs().money, &[money::VaultEntry { unit, rail_module: rail, source: b"the payer's cold wallet".to_vec(), limit }]);
    for (limit, lowered, name, v) in [
        (1000, false, "a refund to the refund rail the payer's claim names, within the payer's vault limit: repaid", json!(300)),
        (100, false, "the same refund above the payer's vault limit: not repaid at the refund rail", json!(0)),
        (1000, true, "the same refund within the limit as the payer's chain stood, the limit lowered by a later rotation not anchored (no clock declared): repaid", json!(300)),
    ] {
        let mut w = World::new();
        let mut shop = w.genesis("a shop that refunds", vec![own_home()], None, None);
        let mut buyer = w.genesis_with("a buyer with a vault", vec![own_home()], None, None, Some(vec![vault(limit)]), 3);
        let shop_ptr = pointer_act(&mut w, &mut shop, b"the shop's wallet");
        let bought = b"the buyer pays the shop".to_vec();
        let c1 = { let c = Fin::Claim(Claim { rail, proof: bought.clone(), payee: shop.id, amount: Amount { unit, value: 300 }, fulfils: shop_ptr, disagrees: None, referral: None,
                refund: Some(money::Rail { module: rail, address: b"the buyer's refund wallet".to_vec() }), anonymous: None, purchase: None, previous: None });
            let a = w.everyday_act(&mut buyer, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
        let back = b"the shop pays the buyer back at the refund rail".to_vec();
        let cr = { let c = Fin::Claim(Claim { rail, proof: back.clone(), payee: buyer.id, amount: Amount { unit, value: 300 }, fulfils: c1, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
            let a = w.everyday_act(&mut shop, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
        if lowered {
            w.rotate(&buyer, Rot { declarations: Some(vec![vault(100)]), ..Default::default() });
        }
        case(out, &mut w, name, "Money rule 4: a refund to the refund rail meets the first two conditions, the others apply as to any payment; rules 3, 17 and 29",
            "The buyer's claim names a refund rail (key 7); the shop's claim of the money back says, as the rail answers, that it was paid there. The buyer's chain declares a vault for the unit.",
            Facts { rail_valid: vec![(cr, c1)], rail_payments: vec![(bought.clone(), b"the purchase".to_vec()), (back.clone(), b"the refund".to_vec())], ..Default::default() },
            json!({ "question": "refund repaid", "payment": hx(&c1), "to": hx(&buyer.id), "unit": hx(&unit) }), v);
    }

    // Row 29 (Money rule 11): a receipt and a claim of one payment that
    // disagree only in the previous hop's receipt they name: an open
    // question on the receiver.
    let mut w = World::new();
    let mut gus = w.genesis("gus, a conversion service paying on", vec![own_home()], None, None);
    let mut hal = w.genesis("hal, the next payee", vec![own_home()], None, None);
    let hal_ptr = pointer_act(&mut w, &mut hal, b"hal's wallet");
    let (hop_a, hop_b) = (spec("the previous hop's receipt gus names"), spec("the previous hop's receipt hal names"));
    let proof = b"gus pays hal on, one hop".to_vec();
    let c = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: hal.id, amount: Amount { unit, value: 70 }, fulfils: hal_ptr, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: Some(hop_a) });
        let a = w.everyday_act(&mut gus, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    for (prev, name, v) in [
        (hop_b, "a receipt and a claim of one payment naming different previous hops: a question on the receiver", json!(1)),
        (hop_a, "the same receipt naming the previous hop the claim names: no question", json!(0)),
    ] {
        let mut w = world(&base);
        let mut hal = hal.clone();
        let r = { let r = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(gus.id)), payee: hal.id, amount: Amount { unit, value: 70 }, fulfils: hal_ptr, previous: Some(prev), forward: None, batch: None, purchase: None });
            let a = w.everyday_act(&mut hal, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
        case(out, &mut w, name, "Money rule 11: a claim and a receipt of the same payment that disagree in amount, payee, what the payment fulfils, or, on a route, the previous hop's receipt it passes on: an open question on the receiver",
            "Gus's claim and Hal's receipt carry one rail proof, the rail saying one payment, with the same amount, payee and purpose; the claim names one previous hop's receipt (key 10), the receipt (field 6) one or another.",
            Facts { rail_valid: vec![(c, hal_ptr), (r, hal_ptr)], rail_payments: vec![(proof.clone(), b"the hop's payment".to_vec())], ..Default::default() }, json!({ "question": "disagreements", "receiver": hx(&hal.id) }), v);
    }

    // Row 45 (Money rule 18): a tip, or a payment toward an obligation, is
    // no purchase and names nothing.
    let mut w = World::new();
    let mut dee = w.genesis("dee, who co-owns a song", vec![own_home()], None, None);
    let mut eli = w.genesis("eli, who co-owns it with her", vec![own_home()], None, None);
    let mut fay = w.genesis("fay, who tips dee", vec![own_home()], None, None);
    let song = spec("dee and eli's song");
    let mut t = deal(&[dee.id, eli.id], None);
    t.text = "A deal over a song.".into();
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(song), holders: vec![(agreements::Who::Id(dee.id), 500_000), (agreements::Who::Id(eli.id), 500_000)] }]);
    let d = ag_act(&mut w, &mut dee, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut dee, &d);
    sign(&mut w, &mut eli, &d);
    let dee_ptr = pointer_act(&mut w, &mut dee, b"dee's wallet");
    let owed = { let o = Fin::Obligation(money::Obligation { debtor: fay.id, creditor: dee.id, amount: Amount { unit, value: 40 }, pointer: dee_ptr, agreement: None });
        let a = w.everyday_act(&mut fay, mirs().money, 1, o.to_map(), None, None); w.add(&a) };
    let base = w.log.clone();
    for (fulfils, what) in [(dee_ptr, "a tip to dee's own pointer"), (owed, "a payment toward fay's debt to dee")] {
        let mut w = world(&base);
        let mut fay = fay.clone();
        let proof = format!("fay pays dee: {what}").into_bytes();
        let c = { let c = Fin::Claim(Claim { rail, proof: proof.clone(), payee: dee.id, amount: Amount { unit, value: 40 }, fulfils, disagrees: None, referral: None, refund: None, anonymous: None,
                purchase: Some(money::Purchase { agreement: d, line: d }), previous: None });
            let a = w.everyday_act(&mut fay, mirs().money, 3, c.to_map(), None, None); w.add(&a) };
        case(out, &mut w, &format!("{what} naming a claim in field 9: no purchase, and no payment for a work"), "Money rule 18: a payment to an identity's own pointer (a tip) or toward an obligation is no purchase and names nothing",
            "Fay's claim names Dee and Eli's deal, which claims their song, as the claim it pays under, though it pays a tip or a debt: it is no payment for a work, so neither a purchase nor money owed back as Agreements rule 12's \"no purchase\" is.",
            Facts { rail_valid: vec![(c, dee_ptr)], rail_payments: vec![(proof, b"fay's payment".to_vec())], ..Default::default() }, json!({ "question": "purchase", "act": hx(&c) }), json!("not a payment for a work"));
    }
}

/// S7g: Agreements' suspected differences, lines 1 to 1125: purchases, splits, the pointer check.
fn s7g_agreements_a(out: &mut Out) {
    // Row 4 (rule 12, "a line that carries none of that agreement's claims"):
    // a purchase naming the claiming agreement, its line a release of
    // another work under another agreement.
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");
    let mut w = World::new();
    let mut ana = w.genesis("ana of the duet", vec![own_home()], None, None);
    let mut bo = w.genesis("bo of the duet", vec![own_home()], None, None);
    let mut cy = w.genesis("cy, who sings alone", vec![own_home()], None, None);
    let mut dee = w.genesis("dee, cy's partner", vec![own_home()], None, None);
    let mut buyer = w.genesis("a buyer of the duet's song", vec![own_home()], None, None);
    let song = spec("the duet's song, S7g");
    let mut t = deal(&[ana.id, bo.id], None);
    t.text = "A deal staking the duet's song.".into();
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(song), holders: vec![(agreements::Who::Id(ana.id), 600_000), (agreements::Who::Id(bo.id), 400_000)] }]);
    let d = ag_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut bo, &d);
    let publ = { let a = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(song.to_vec()))]), None, None); w.add(&a) };
    // Another deal, staking another work, and that work's release.
    let other = spec("cy's own ballad, S7g");
    let mut e = deal(&[cy.id, dee.id], None);
    e.text = "Another deal, staking another work.".into();
    e.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(other), holders: vec![(agreements::Who::Id(cy.id), 1_000_000)] }]);
    let e = ag_act(&mut w, &mut cy, agreements::types::TERMS, e.to_map(), None);
    sign(&mut w, &mut cy, &e);
    sign(&mut w, &mut dee, &e);
    let ballad_claim = ag_act(&mut w, &mut cy, agreements::types::CLAIM, vec![(Value::Uint(0), Value::Bytes(other.to_vec()))], None);
    let release = agreements::Release { work: other, stakes: vec![(e, 0)], claims: vec![ballad_claim], keys: vec![(spec("a publication carrying the ballad"), vec![7; 32])], timed: None };
    let unrelated = ag_act(&mut w, &mut cy, agreements::types::RELEASE, release.to_map(), obj(e));
    let base = w.log.clone();
    let pay = |w: &mut World, buyer: &mut Person, line: Hash, proof: &[u8]| {
        let x = Fin::Claim(Claim { rail, proof: proof.to_vec(), payee: ana.id, amount: Amount { unit, value: 300 }, fulfils: publ, disagrees: None, referral: None, refund: None, anonymous: None, purchase: Some(money::Purchase { agreement: d, line }), previous: None });
        let a = w.everyday_act(buyer, mirs().money, 3, x.to_map(), None, None);
        w.add(&a)
    };
    let mut b2 = buyer.clone();
    let c = pay(&mut w, &mut buyer, unrelated, b"the buyer pays for the duet's song");
    out.case(&mut w, "a purchase naming the claiming agreement, its line a release of another work under another agreement: no purchase", "Agreements rule 12: \"a line that carries none of that agreement's claims, is no purchase\"",
        "The buyer's claim names the deal staking the song, and as its line a release of another work that only another agreement stakes. That release never changed who is paid for the song, so the line carries none of the deal's claims: money received for nothing, owed back.",
        Facts { rail_valid: vec![(c, publ)], ..Default::default() }, json!({ "question": "purchase", "act": hx(&c) }), json!("no purchase"), None);
    let mut w2 = World::new();
    for (a, _) in &base {
        w2.add(a);
    }
    let c2 = pay(&mut w2, &mut b2, d, b"the buyer pays for the duet's song");
    out.case(&mut w2, "the same purchase, its line the claiming agreement itself: a purchase", "Agreements rule 12: the line is \"a version of that agreement\"",
        "The twin of the case before: the line is the deal staking the song, on a request rail with no collective seller.",
        Facts { rail_valid: vec![(c2, publ)], ..Default::default() }, json!({ "question": "purchase", "act": hx(&c2) }), json!("purchase"), None);
}

/// S7g: Agreements' suspected differences, offers, parties, standing, and lines 1126 to 2129.
fn s7g_agreements_b(out: &mut Out) {
    use agreements::types::{FORK_SETTLEMENT, SETTLEMENT_REQUEST, STANDING_OFFER, TERMS};
    let replay = |log: &[(mor_core::act::Act, Option<mor_core::lock::ContentKey>)], skip: &[Hash]| {
        let mut w = World::new();
        for (a, _) in log {
            if !skip.contains(&a.id()) {
                w.add(a);
            }
        }
        w
    };
    let mark_all = |ids: &[Hash]| {
        let mut s = ids.to_vec();
        s.sort();
        Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Clone, signers: s }])
    };
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");

    // ---- Agreements 1175 (rule 47, "What others relied on stands").
    let mut w = World::new();
    let home = w.operator("ada's home");
    let mut bram = w.genesis("bram", vec![own_home()], None, None);
    let mut ada = w.genesis("ada", vec![home_of(&home)], None, None);
    let mut t = deal(&[ada.id, bram.id], None);
    t.text = "Ada and Bram's deal, whose version may be relied on.".into();
    let d = ag_act(&mut w, &mut ada, TERMS, t.to_map(), None);
    sign(&mut w, &mut ada, &d);
    sign(&mut w, &mut bram, &d);
    let mut c = t.clone();
    c.parent = Some(d);
    c.text = "Ada and Bram's deal, version one.".into();
    c.field4 = mark_all(&[ada.id, bram.id]);
    let v1 = ag_act(&mut w, &mut ada, TERMS, c.to_map(), obj(d));
    let sa = sign(&mut w, &mut ada, &v1);
    sign(&mut w, &mut bram, &v1);
    let base = w.log.clone();
    let people = (ada.clone(), bram.clone(), home.clone());
    let both = [ada.id, bram.id];
    let rotate = |w: &mut World, ada: &Person, home: &mut Person| {
        let (r, _) = w.rotate(ada, Rot { disowned: Some(vec![sa]), ..Default::default() });
        w.receipt(home, &ada.id, &r, 1);
    };
    let clone_of = |w: &mut World, by: &mut Person, parent: Hash, text: &str, ids: &[Hash]| {
        let mut c2 = c.clone();
        c2.parent = Some(parent);
        c2.text = text.into();
        c2.field4 = mark_all(ids);
        ag_act(w, by, TERMS, c2.to_map(), obj(parent))
    };
    // Nothing relies on version one: Ada's disowned signature uncompletes it.
    let (ada0, _, mut home0) = people.clone();
    let mut w0 = replay(&base, &[]);
    rotate(&mut w0, &ada0, &mut home0);
    out.case(&mut w0, "a deal's complete version nothing relies on, a signer's rotation disowning its signature: the version before it in force", "Agreements rule 47, \"What others relied on stands\": a version nothing relies on yet is judged by its signatures as Identity judges them",
        "Ada and Bram signed version one; Ada's rotation disowns her signature act on it, and no act names version one: it is judged by its signatures, Ada's void, so it is not complete and the founding stays in force.",
        Facts::default(), ask("version in force", &d), json!(hx(&d)), None);
    // A later complete version cloning it, signed by both before the rotation: version one keeps its completeness.
    let (mut ada1, mut bram1, mut home1) = people.clone();
    let mut w1 = replay(&base, &[]);
    let v2 = clone_of(&mut w1, &mut ada1, v1, "Ada and Bram's deal, version two.", &both);
    sign(&mut w1, &mut ada1, &v2);
    sign(&mut w1, &mut bram1, &v2);
    rotate(&mut w1, &ada1, &mut home1);
    out.case(&mut w1, "a later complete version cloning a deal's version, then a signer's rotation disowning its signature on that version: the later version in force", "Agreements rule 47, \"What others relied on stands\": a later version cloning it (rule 45)",
        "Both parties signed version two, a clone of version one; Ada then rotates, disowning her signature act on version one. Version two relies on it, so version one keeps its completeness for everyone, the disowned signature shown as a dispute, and version two, complete on a complete parent, is in force.",
        Facts::default(), ask("version in force", &d), json!(hx(&v2)), None);

    // ---- Agreements 1036 with 1271 and 3611 (rule 35; settlement request, type 22): standing to start a judge's period.
    let mut w = World::new();
    let mut fenna = w.genesis("fenna", vec![own_home()], None, None);
    let mut gus = w.genesis("gus", vec![own_home()], None, None);
    let mut ivo = w.genesis("ivo, who holds part of the stake and is no party", vec![own_home()], None, None);
    let mut judge = w.genesis("the judge of fenna and gus's forks", vec![own_home()], None, None);
    let song = spec("fenna and gus's song");
    let mut t = deal(&[fenna.id, gus.id], None);
    t.text = "A deal over a song, an investor holding part of its stake.".into();
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(song), holders: vec![(agreements::Who::Id(fenna.id), 400_000), (agreements::Who::Id(gus.id), 400_000), (agreements::Who::Id(ivo.id), 200_000)] }]);
    t.arbitrators = Some(vec![judge.id]);
    t.fork_judge = Some(judge.id);
    t.time = Some((spec("a block height reference"), Value::Uint(0)));
    let d = ag_act(&mut w, &mut fenna, TERMS, t.to_map(), None);
    sign(&mut w, &mut fenna, &d);
    sign(&mut w, &mut gus, &d);
    sign(&mut w, &mut ivo, &d);
    let mut versions = vec![];
    for text in ["The song's deal, version A.", "The song's deal, version B."] {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        c.field4 = mark_all(&[fenna.id, gus.id]);
        let v = ag_act(&mut w, &mut fenna, TERMS, c.to_map(), obj(d));
        sign(&mut w, &mut fenna, &v);
        sign(&mut w, &mut gus, &v);
        versions.push(v);
    }
    let (va, vb) = (versions[0], versions[1]);
    let base = w.log.clone();
    let settle_on = |w: &mut World, asker: &mut Person, judge: &mut Person| {
        let request = ag_act(w, asker, SETTLEMENT_REQUEST, agreements::SettlementRequest { reference: d }.to_map(), obj(d));
        let s = agreements::ForkSettlement { request, kept: va, discarded: vec![vb] };
        ag_act(w, judge, FORK_SETTLEMENT, s.to_map(), Some(vec![Object { chain: request, predecessor: request }]));
    };
    let (mut ivo1, mut judge1) = (ivo.clone(), judge.clone());
    let mut w1 = replay(&base, &[]);
    settle_on(&mut w1, &mut ivo1, &mut judge1);
    out.case(&mut w1, "a deal's fork settled by its judge on the request of a stake holder who is no party: it counts for nothing, the deal on its reference", "Agreements rule 47 (\"The judge of forks acts only once activated by one of the signing parties\"); settlement request (type 22): signed by a party who signed the reference; rule 35",
        "Ivo holds a fifth of the song's stake and signed the founding, but is no party: his settlement request activates no judge, so the judge's settlement keeping A settles nothing.",
        Facts::default(), ask("version in force", &d), json!(hx(&d)), None);
    let mut w2 = replay(&base, &[]);
    settle_on(&mut w2, &mut gus, &mut judge);
    out.case(&mut w2, "the same settlement on the request of a party who signed the reference: the version kept is in force", "Agreements rule 47; settlement request (type 22); rule 35",
        "Gus, a party who signed the reference, asks; the judge of forks the reference names keeps A within its period.",
        Facts::default(), ask("version in force", &d), json!(hx(&va)), None);

    // ---- Agreements 420 (rule 11) with 599 and 611 (rule 14): co-owners' offer and every party's signature.
    let mut w = World::new();
    let mut hana = w.genesis("hana", vec![own_home()], None, None);
    let mut ito = w.genesis("ito", vec![own_home()], None, None);
    let mut buyer = w.genesis("a buyer of hana and ito's film", vec![own_home()], None, None);
    let film = spec("hana and ito's film");
    let mut t = deal(&[hana.id, ito.id], None);
    t.text = "A deal over a film its two owners sell by an offer.".into();
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(film), holders: vec![(agreements::Who::Id(hana.id), 500_000), (agreements::Who::Id(ito.id), 500_000)] }]);
    let d = ag_act(&mut w, &mut hana, TERMS, t.to_map(), None);
    sign(&mut w, &mut hana, &d);
    sign(&mut w, &mut ito, &d);
    let publ = { let a = w.everyday_act(&mut hana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(film.to_vec()))]), None, None); w.add(&a) };
    let o = agreements::Offer { under: Some(d), sold: vec![agreements::Sold::Publication(publ)], price: Amount { unit, value: 500 }, paid: Some(agreements::Paid::ByStakes), words: Some("The film.".into()), until: None, time: None, refund: None };
    let offer = ag_act(&mut w, &mut hana, STANDING_OFFER, o.to_map(), obj(d));
    let proof = b"the buyer pays for hana and ito's film".to_vec();
    let claim = { let x = Fin::Claim(Claim { rail, proof: proof.clone(), payee: hana.id, amount: Amount { unit, value: 500 }, fulfils: offer, disagrees: None, referral: None, refund: None, anonymous: None, purchase: Some(money::Purchase { agreement: d, line: d }), previous: None });
        let a = w.everyday_act(&mut buyer, mirs().money, 3, x.to_map(), None, None); w.add(&a) };
    let facts = || Facts { rail_valid: vec![(claim, offer)], rail_payments: vec![(proof.clone(), b"the film's payment".to_vec())], ..Default::default() };
    let base = w.log.clone();
    let mut w2 = replay(&base, &[]);
    sign(&mut w2, &mut ito, &offer);
    out.case(&mut w2, "a payment under co-owners' offer every party of their deal signed, naming the deal: a purchase", "Agreements rule 11 (co-owners' offer: names their agreement, signed under its rule, in a deal every party); rule 12",
        "Hana makes the offer under the deal, Ito signs it too, and the buyer's claim names the deal as the claim it pays under.",
        facts(), json!({ "question": "purchase", "act": hx(&claim) }), json!("purchase"), None);

    // ---- Agreements 684 (rule 15): an inner deal signs by its version in force.
    let mut w = World::new();
    let mut jo = w.genesis("jo", vec![own_home()], None, None);
    let mut kai = w.genesis("kai", vec![own_home()], None, None);
    let mut lu = w.genesis("lu", vec![own_home()], None, None);
    let mut mo = w.genesis("mo", vec![own_home()], None, None);
    let t0 = deal(&[jo.id, kai.id], None);
    let mut t0 = t0;
    t0.text = "Jo and Kai's inner deal.".into();
    let inner = ag_act(&mut w, &mut jo, TERMS, t0.to_map(), None);
    sign(&mut w, &mut jo, &inner);
    sign(&mut w, &mut kai, &inner);
    let mut c = t0.clone();
    c.parent = Some(inner);
    c.parties = vec![jo.id, lu.id];
    c.text = "The inner deal, Lu in Kai's place.".into();
    c.field4 = mark_all(&[jo.id, kai.id]);
    let v2 = ag_act(&mut w, &mut jo, TERMS, c.to_map(), obj(inner));
    sign(&mut w, &mut jo, &v2);
    sign(&mut w, &mut kai, &v2);
    sign(&mut w, &mut lu, &v2);
    let mut t = deal(&[inner, mo.id], None);
    t.text = "An outer deal one of whose parties is Jo and Kai's deal.".into();
    let outer = ag_act(&mut w, &mut mo, TERMS, t.to_map(), None);
    sign(&mut w, &mut mo, &outer);
    let base = w.log.clone();
    let mut w1 = replay(&base, &[]);
    sign(&mut w1, &mut jo.clone(), &outer);
    sign(&mut w1, &mut lu, &outer);
    out.case(&mut w1, "a deal one of whose parties is a deal, signed by every party of that deal's version in force: exists", "Agreements rule 15: a deal that is a party of another deal signs it where every party of its version in force signs it",
        "The inner deal's version in force is its clone naming Jo and Lu; both sign the outer deal, and Mo signs for himself.",
        Facts::default(), ask("agreement exists", &outer), json!("exists"), None);

    // ---- Agreements 691 (rule 15): a verifier that cannot follow every layer answers unknown.
    let mut w = World::new();
    let mut nia = w.genesis("nia", vec![own_home()], None, None);
    let mut oz = w.genesis("oz", vec![own_home()], None, None);
    let mut pem = w.genesis("pem", vec![own_home()], None, None);
    let mut t0 = deal(&[nia.id, oz.id], None);
    t0.text = "Nia and Oz's inner deal, which one verifier does not hold.".into();
    let inner = ag_act(&mut w, &mut nia, TERMS, t0.to_map(), None);
    sign(&mut w, &mut nia, &inner);
    sign(&mut w, &mut oz, &inner);
    let mut t = deal(&[inner, pem.id], None);
    t.text = "An outer deal naming Nia and Oz's deal as a party.".into();
    let outer = ag_act(&mut w, &mut pem, TERMS, t.to_map(), None);
    sign(&mut w, &mut pem, &outer);
    sign(&mut w, &mut nia, &outer);
    sign(&mut w, &mut oz, &outer);
    let log = w.log.clone();
    let mut w1 = replay(&log, &[inner]);
    out.case(&mut w1, "a deal one of whose parties is an agreement this verifier does not hold, every other signature held: unknown", "Agreements rule 15: a verifier that cannot follow every layer of it answers unknown",
        "The outer deal names Nia and Oz's deal as a party; this verifier does not hold that deal's terms, so it cannot tell whose signatures sign for it, nor whether it makes a loop: not \"does not exist\".",
        Facts::default(), ask("agreement exists", &outer), json!("unknown"), None);
    let mut w2 = replay(&log, &[]);
    out.case(&mut w2, "the same at a verifier holding the inner deal: exists", "Agreements rule 15",
        "Holding the inner deal, it follows the layer: Nia and Oz, its parties, signed the outer deal, and Pem signed for himself.",
        Facts::default(), ask("agreement exists", &outer), json!("exists"), None);

    // ---- Agreements 565 and 578 (rule 13): a free sale's confirmation.
    let mut w = World::new();
    let mut hall = w.genesis("the s7g hall", vec![own_home()], None, None);
    let mut rafa = w.genesis("rafa", vec![own_home()], None, None);
    let mut door = w.genesis("the s7g hall's door", vec![own_home()], None, None);
    let name = { let v = mor_core::envelopes::vow::Vow { words: "A free open rehearsal in the hall".into(), cmip: None };
        let a = w.everyday_act(&mut hall, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None); w.add(&a) };
    let o = agreements::Offer { under: None, sold: vec![agreements::Sold::Vow(name)], price: Amount { unit, value: 0 }, paid: None, words: Some("A free seat.".into()), until: None, time: None, refund: None };
    let offer = ag_act(&mut w, &mut hall, STANDING_OFFER, o.to_map(), None);
    let sale = sign(&mut w, &mut rafa, &offer);
    let scanned = { let a = w.everyday_act_refs(&mut door, spec("a ticketing Module"), 0, vec![(Value::Uint(0), Value::Text("a free seat, scanned at the door".into()))], None, None, Some(vec![mor_core::act::Ref::Act(name)])); w.add(&a) };
    let base = w.log.clone();
    let ack_act = |w: &mut World, p: &mut Person, acks: Vec<Hash>| {
        // A witness act (Identity type 15): the one way to acknowledge acts.
        let a = w.everyday_act(p, identity_spec(), mor_core::identity::types::WITNESS, vec![], None, Some(acks));
        w.add(&a)
    };
    let ask_vow = json!({ "question": "vow", "vow": hx(&name) });
    let mut w1 = replay(&base, &[]);
    ack_act(&mut w1, &mut rafa.clone(), vec![scanned, sale]);
    out.case(&mut w1, "a free sale confirmed by the buyer's act acknowledging both the door's record of the vow and the buyer's own sign-on: confirmed", "Agreements rule 13: for a free sale, the buyer's act acknowledges both the act about the vow and its own signature act on the offer",
        "Rafa signed the hall's free offer (the sale), then acknowledges the door's record naming the vow and that signature act.",
        Facts::default(), ask_vow.clone(), json!({ "sales": [{ "act": hx(&sale), "buyer": hx(&rafa.id), "state": "confirmed" }], "unsigned": [], "unknown": [] }), None);
}

/// S7g: Agreements' suspected differences, lines 2130 to 4343.
fn s7g_agreements_c(out: &mut Out) {
    let unit = spec("a test unit (regtest satoshi)");
    let rail = spec("a rail Module");

    // Row 5 (text 2150): a member key after its holder's rotation disowns the
    // signature that named it. Placed by an act of the collective
    // acknowledging it, it stays valid for the collective ("Made before,
    // made after", 2 and 4); never placed, Identity alone judges it.
    for (placed, name, v) in [
        (true, "a member key whose naming signature the collective acknowledged, after the holder's rotation disowns that signature: its receipt still counts", true),
        (false, "the same, the naming signature never placed by an act of the collective: its receipt does not count", false),
    ] {
        let mut w = World::new();
        let mut col = collective(&mut w, &[1], 1);
        let cid = col.c.id;
        let mut ben = member_key(&mut w, &mut col, 1, "ben");
        let named = ben.binding;
        let acks = placed.then(|| vec![named]);
        let ptr = {
            let x = Fin::PayeePointer(money::PayeePointer { payee: cid, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: b"the collective's address".to_vec() }] });
            let a = w.everyday_act(&mut col.c, mirs().money, 0, x.to_map(), None, acks);
            w.add(&a)
        };
        sign(&mut w, &mut col.m[1], &ptr);
        let r = Fin::Receipt(Receipt { rail, proof: b"a payment the member key receipts".to_vec(), payer: None, payee: cid, amount: Amount { unit, value: 7 }, fulfils: ptr, previous: None, forward: None, batch: None, purchase: None });
        let rec = { let a = w.everyday_act(&mut ben, mirs().money, 2, r.to_map(), None, None); w.add(&a) };
        let (_, b2) = w.rotate(&col.m[1], Rot { disowned: Some(vec![named]), ..Default::default() });
        col.m[1] = b2;
        out.case(&mut w, name, "Agreements rule 73 (\"The holder's own change of keys leaves it as it is\"); \"Made before, made after\", 2 and 4",
            "Ben's signature of the founding names his member key; his rotation disowns that signature, and no line of the collective registers the rotation. The collective's payee pointer acknowledges the signature (placed) or does not (never placed).",
            Facts::default(), ask("consent counts", &rec), json!(v), None);
    }

    // Row 102 (text 3434): a collective's grant after its grantee's rotation
    // disowns the acceptance. Acknowledged by an act of the collective, the
    // acceptance keeps its effect for the collective; acknowledged by none,
    // Identity alone judges it.
    for (acked, name, v) in [
        (true, "a collective's grant whose acceptance an act of the collective acknowledged, after the grantee's rotation disowns it: the grant key's act is backed", "backed"),
        (false, "the same, the acceptance acknowledged by no act of the collective: not backed", "not backed (void)"),
    ] {
        let mut w = World::new();
        let mut col = collective(&mut w, &[1], 1);
        let cid = col.c.id;
        let mut app = w.genesis("the collective's publishing app", vec![own_home()], None, None);
        let k = schnorr("the collective's publishing app/grant key", 0);
        let g = Grant { grantee: app.id, scope: 2, agreements: None, this_agreement: false, limits: None, limits_cmip: None, area: Some(1), kinds: Some(vec![Kind::Layer(agreements::layers::TEXT), Kind::Layer(agreements::layers::ENVELOPES)]), reinstates: None, by_this: false, key: signing_key(&k) };
        let gid = ag_act(&mut w, &mut col.c, agreements::types::GRANT, g.to_map(), None);
        sign(&mut w, &mut col.m[0], &gid);
        let acc = sign(&mut w, &mut app, &gid);
        if acked {
            // A Money act may carry `acks` (Envelopes rule 18): the collective's payee pointer.
            let p = Fin::PayeePointer(money::PayeePointer { payee: cid, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: b"the collective's address".to_vec() }] });
            let a = w.everyday_act(&mut col.c, mirs().money, 0, p.to_map(), None, Some(vec![acc]));
            w.add(&a);
        }
        let mut lane = col.c.clone();
        lane.binding = gid;
        lane.sign = k;
        lane.seq = vec![];
        lane.cite = Some((cid, vec![gid]));
        let x = text_act(&mut w, &mut lane, "A note the app publishes for the collective.", None);
        w.rotate(&app, Rot { disowned: Some(vec![acc]), ..Default::default() });
        out.case(&mut w, name, "Agreements, \"Grant (type 9)\": \"the grantee's acceptance is placed as a member's signature is\"; \"Made before, made after\", 2 and 4",
            "Ana, who holds the area the grant issues from, signs the collective's grant; the app accepts it and publishes with its grant key; the app's rotation then disowns its acceptance. The collective's payee pointer, an act of its own key, acknowledges the acceptance, or no act does.",
            Facts::default(), ask("backing", &x), json!(v), None);
    }

    // Row 28 (text 2321): a clone marked with Ben's automatic succession plan
    // alone, placing his seat successor elsewhere than in his own place
    // among the parties: a false mark, invalid. Its twin, the successor in
    // Ben's place, is not.
    for (in_place, name, v) in [
        (false, "a clone marked with a succession plan alone that places the seat successor after the other parties, not in the party's place: invalid", "invalid"),
        (true, "the same clone with the seat successor in the party's own place among the parties: not invalid", "not invalid"),
    ] {
        let mut w = World::new();
        let mut m: Vec<Person> = ["ana", "ben", "cy"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
        let authority = w.genesis("an abandonment authority", vec![own_home()], None, None);
        let keeper = w.genesis("the collective's keeper", vec![own_home()], None, None);
        let dee = w.genesis("dee, ben's seat successor", vec![own_home()], None, None);
        let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
        let mut t = collective_terms(&ids, authority.id, keeper.id, vec![ids[0]], 1);
        t.text = "A test collective whose member ben names a seat successor.".into();
        t.succession = Some(vec![agreements::SuccessionPlan { party: ids[1], stakes: None, seats: Some(vec![dee.id]), entry: Some(0) }]);
        let founding = ag_act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
        for p in m.iter_mut() {
            sign(&mut w, p, &founding);
        }
        let place = vec![ids[0], dee.id, ids[2]];
        let mut t1 = t.clone();
        t1.parent = Some(founding);
        t1.parties = if in_place { place.clone() } else { vec![ids[0], ids[2], dee.id] };
        t1.succession = None;
        let g = t1.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: place.clone() };
        g.chain_key = Holding::Shares { threshold: 3, members: place.clone() };
        t1.field4 = Field4::Mark(vec![agreements::MarkEntry { power: agreements::Power::Plan(ids[1]), signers: vec![dee.id] }]);
        let k = ag_act(&mut w, &mut m[0], agreements::types::TERMS, t1.to_map(), obj(founding));
        out.case(&mut w, name, "Agreements rule 83 (\"A clone marked with the plan alone that changes anything more is invalid\"); rule 46",
            "The founding carries Ben's plan, every member signing it, his seat passing automatically to Dee. The clone takes Ben out, Dee in his place in every holding of the key grammar, and drops the plan; among the parties Dee stands last, or in Ben's place.",
            Facts::default(), json!({ "question": "agreement invalid", "act": hx(&k) }), json!(v), None);
    }

    // Row 19 (text 2235): the collective adopts a grant key's act by paying
    // on it. Its own key's claim paying the obligation the grant key signed
    // makes it bind, the revocation racing it notwithstanding; with no
    // payment, the revocation that does not hold it voids it.
    for (pays, name, v) in [
        (true, "a grant key's obligation that the collective's own key pays on, its grant revoked by a revocation not holding it: binds", "binds"),
        (false, "the same obligation the collective never paid on, acknowledged, nor cited: void", "not backed (void)"),
    ] {
        let mut w = World::new();
        let mut col = collective(&mut w, &[1], 1);
        let cid = col.c.id;
        let mut supplier = w.genesis("a supplier of the collective", vec![own_home()], None, None);
        let sptr = pointer_act(&mut w, &mut supplier, b"the supplier's address");
        let mut app = w.genesis("the collective's buying app", vec![own_home()], None, None);
        let k = schnorr("the collective's buying app/grant key", 0);
        let g = Grant { grantee: app.id, scope: 2, agreements: None, this_agreement: false, limits: None, limits_cmip: None, area: Some(2), kinds: Some(vec![Kind::Layer(agreements::layers::MONEY)]), reinstates: None, by_this: false, key: signing_key(&k) };
        let gid = ag_act(&mut w, &mut col.c, agreements::types::GRANT, g.to_map(), None);
        sign(&mut w, &mut col.m[1], &gid);
        sign(&mut w, &mut app, &gid);
        let mut lane = col.c.clone();
        lane.binding = gid;
        lane.sign = k;
        lane.seq = vec![];
        lane.cite = Some((cid, vec![gid]));
        let ob = Fin::Obligation(money::Obligation { debtor: cid, creditor: supplier.id, amount: Amount { unit, value: 30 }, pointer: sptr, agreement: None });
        let y = { let a = w.everyday_act(&mut lane, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
        let rv = ag_act(&mut w, &mut col.c, agreements::types::REVOCATION, agreements::Revocation { grant: gid }.to_map(), None);
        sign(&mut w, &mut col.m[1], &rv);
        if pays {
            let x = Fin::Claim(Claim { rail, proof: b"the collective pays its supplier".to_vec(), payee: supplier.id, amount: Amount { unit, value: 30 }, fulfils: y, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
            let a = w.everyday_act(&mut col.c, mirs().money, 3, x.to_map(), None, None);
            let c = w.add(&a);
            sign(&mut w, &mut col.m[1], &c);
        }
        out.case(&mut w, name, "Agreements rule 76 (\"The grantor may adopt a void or disputed act of a grant key as its own\": \"pays on it\"); \"Made before, made after\", 7",
            "Ben, who holds the Money area, signs a grant reaching Money; the app signs an obligation of the collective to a supplier with its grant key; the collective revokes the grant, the revocation's history not holding the obligation. The collective's own claim, signed by Ben, pays the obligation (its field fulfils names it), or nothing does.",
            Facts::default(), ask("backing", &y), json!(v), None);
    }

    // Row 109 (text 3502): a member's liveness on the collective's
    // agreement counts only where the collective placed it: an act of the
    // collective acknowledging it.
    for (placed, name, v) in [
        (true, "a member's public liveness on the collective's agreement, acknowledged by an act of the collective: shows presence", "shows presence"),
        (false, "the same liveness no act of the collective placed: shows nothing", "shows nothing"),
    ] {
        let mut w = World::new();
        let mut col = collective(&mut w, &[1], 1);
        let cid = col.c.id;
        let f = col.founding;
        let l = ag_act(&mut w, &mut col.m[0], agreements::new_types::LIVENESS, agreements::Liveness { agreement: f }.to_map(), obj(f));
        if placed {
            let p = Fin::PayeePointer(money::PayeePointer { payee: cid, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: b"the collective's address".to_vec() }] });
            let a = w.everyday_act(&mut col.c, mirs().money, 0, p.to_map(), None, Some(vec![l]));
            w.add(&a);
        }
        out.case(&mut w, name, "Agreements, \"Liveness (type 12)\": \"In a collective, it counts only where the collective placed it\"; \"Made before, made after\", 2",
            "Ana publishes a liveness naming the collective's founding. The collective's payee pointer, an act of its own key on its chain, acknowledges it, or no act does.",
            Facts::default(), json!({ "question": "liveness", "act": hx(&l) }), json!(v), None);
    }
}

/// S7g: Development, read for sentences no case exercised: the decoding
/// of a specification's content, step by step (Part three).
fn s7g_development(out: &mut Vec<J>) {
    let money = mirs().money;
    let agreements_mir = mirs().agreements;
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let b = |x: Hash| Value::Bytes(x.to_vec());
    let t = |s: &str| Value::Text(s.into());
    let u = Value::Uint;
    let arr = Value::Array;
    let creator = b(spec("a creator"));
    let payment = enc(vec![(0, u(kinds::CMIP)), (1, creator.clone()), (2, arr(vec![arr(vec![b(money), u(6)])])), (9, t("A payment cMIP."))]);
    let payment_hash = Spec::hash_of(&payment);
    let split = enc(vec![(0, u(kinds::CMIP)), (1, creator.clone()), (2, arr(vec![arr(vec![b(agreements_mir), u(8)])])), (9, t("A split cMIP."))]);
    let split_hash = Spec::hash_of(&split);
    let a_mir = Spec::file_content(kinds::MIR, "# MIR: Test\n\nA rule.").unwrap();
    let a_mir_hash = Spec::hash_of(&a_mir);
    // Content naming task 6 like a payment cMIP, but no specification: a cMIP naming no creator.
    let lookalike = enc(vec![(0, u(kinds::CMIP)), (2, arr(vec![arr(vec![b(money), u(6)])])), (9, t("A payment cMIP naming no creator."))]);
    let lookalike_hash = Spec::hash_of(&lookalike);
    let held_all: Vec<(Hash, Vec<u8>)> = vec![(payment_hash, payment.clone()), (split_hash, split.clone()), (a_mir_hash, a_mir.clone()), (lookalike_hash, lookalike.clone())];
    let module = |five: Hash, text: &str, rail: Option<(u64, Vec<u64>)>| {
        let mut f = vec![(0, u(kinds::MODULE)), (1, creator.clone()), (5, b(five)), (9, t(text))];
        if let Some((k, bs)) = rail {
            f.push((11, u(k)));
            f.push((13, arr(bs.into_iter().map(u).collect())));
        }
        enc(f)
    };
    let cmip = |extra: Vec<(u64, Value)>, text: &str| {
        let mut f = vec![(0, u(kinds::CMIP)), (1, creator.clone()), (9, t(text))];
        f.extend(extra);
        enc(f)
    };
    let judge = |c: &[u8], held: &[(Hash, Vec<u8>)]| match Spec::decode_judged(c, &money, &|x| held.iter().find(|(k, _)| k == x).map(|(_, v)| v.clone())) {
        Judged::Spec(_) => json!("a specification"),
        Judged::NoSpecification(_) => json!("no specification"),
        Judged::Unknown(x) => json!(format!("unknown: the cMIP {} is not held", hx(&x))),
    };
    let mut push = |name: &str, rule: &str, why: &str, c: &[u8], held: &[Hash], expect: J| {
        let held: Vec<(Hash, Vec<u8>)> = held_all.iter().filter(|(k, _)| held.contains(k)).cloned().collect();
        let got = judge(c, &held);
        assert_eq!(got, expect, "{name}");
        let held_j: serde_json::Map<String, J> = held.iter().map(|(k, v)| (hx(k), json!(hx(v)))).collect();
        out.push(json!({ "name": name, "rule": rule, "why": why, "content": hx(c), "spec_hash": hx(&Spec::hash_of(c)), "money": hx(&money), "held_specifications": held_j, "verdict": got, "python": "specification decoding" }));
    };
    let spec_ = json!("a specification");
    let none = json!("no specification");
    let fmt = "Development, \"How the content is decoded\"";
    let rail = "Development, \"A rail Module's kind and binding\"";
    let kinds_ = "Development, \"How the content is decoded\", 6, and \"What each kind must carry\"";

    // Rail Modules: kind and binding (fields 11 and 13), what money reads.
    push("a push rail under a payment cMIP binding nothing (field 13 empty): a specification", rail,
        "Field 11 is 1; field 13 may be empty: the proof binds none of payee, purpose and previous hop.", &module(payment_hash, "A push rail binding nothing.", Some((1, vec![]))), &[payment_hash], spec_.clone());
    push("a rail Module with fields 11 and 13 at a verifier not holding the cMIP it names: a specification", rail,
        "Only a Module lacking fields 11 and 13 needs the cMIP's bytes to be told.", &module(payment_hash, "A push rail binding payee and purpose.", Some((1, vec![0, 1]))), &[], spec_.clone());
    push("a Module under a split cMIP carrying fields 11 and 13: a specification", "Development, \"How the content is decoded\", 6",
        "Fields 11 and 13 are present together, and only on a Module: a Module under any cMIP may carry them.", &module(split_hash, "A split Module declaring a rail.", Some((1, vec![]))), &[split_hash], spec_.clone());
    push("a push rail binding payee and previous hop: a specification", rail,
        "Field 13 holds part of the set, ascending: Money rule 11 applies element by element.", &module(payment_hash, "A push rail binding payee and previous hop.", Some((1, vec![0, 2]))), &[payment_hash], spec_.clone());
    push("a request rail whose field 13 lacks the payee: no specification", rail,
        "Field 11 is 0: field 13 holds 0 and 1.", &module(payment_hash, "A request rail binding only the purpose.", Some((0, vec![1, 2]))), &[], none.clone());
    push("a rail Module whose field 13 is out of order: no specification", rail,
        "Field 13 is ascending, without repeats.", &module(payment_hash, "A push rail, field 13 out of order.", Some((1, vec![1, 0]))), &[], none.clone());
    push("a rail Module whose field 13 names 3: no specification", rail,
        "Field 13 holds only 0 the payee, 1 the purpose, 2 the previous hop.", &module(payment_hash, "A push rail, field 13 naming 3.", Some((1, vec![0, 3]))), &[], none.clone());
    push("a rail Module whose field 11 is 2: no specification", rail,
        "Field 11 is 0 or 1.", &module(payment_hash, "A rail of kind 2.", Some((2, vec![0, 1]))), &[], none.clone());
    push("a Module carrying field 11 without field 13: no specification", rail,
        "Fields 11 and 13 go together.", &enc(vec![(0, u(kinds::MODULE)), (1, creator.clone()), (5, b(payment_hash)), (9, t("A rail with a kind and no binding.")), (11, u(1))]), &[], none.clone());
    push("a cMIP carrying fields 11 and 13: no specification", rail,
        "Fields 11 and 13 are a rail Module's.", &cmip(vec![(11, u(1)), (13, arr(vec![]))], "A cMIP declaring a rail's kind."), &[], none.clone());
    push("a Module under a split cMIP, without fields 11 and 13: a specification", rail,
        "Its field 5 names a cMIP whose field 2 lists Agreements' task 8, not Money's task 6: no rail fields are required.", &module(split_hash, "A split Module.", None), &[split_hash], spec_.clone());
    push("a Module naming a held MIR in field 5, without fields 11 and 13: a specification", "Development, \"What each kind must carry\": a Module working under a MIR names that MIR",
        "A MIR is kind 4, no payment cMIP.", &module(a_mir_hash, "A seed Module under a MIR.", None), &[a_mir_hash], spec_.clone());
    push("a Module naming the Money MIR in field 5, without fields 11 and 13: a specification", "Development, \"What each kind must carry\"; rule 26",
        "Every verifier holds the MIRs whose hashes it accepts; the Money MIR is no payment cMIP.", &module(money, "A Module working under Money with no cMIP.", None), &[], spec_.clone());
    push("a Module naming held content that lists Money's task 6 but is no specification: a specification", rail,
        "A payment cMIP is a cMIP: the content field 5 names names no creator, so it is no specification and no payment cMIP.", &module(lookalike_hash, "A Module under a malformed cMIP.", None), &[lookalike_hash], spec_.clone());

    // Layers an extension acts on (field 10), and the checker's field 12.
    push("field 10 out of order: no specification", "Development, \"Layers an extension acts on\"; freeze scenario, Part one",
        "Field 10 is ascending, without repeats.", &cmip(vec![(10, arr(vec![u(2), u(0)]))], "An extension acting on Money and Identity."), &[], none.clone());
    push("field 10 naming layer 4, Agreements: a specification", "Development, \"Layers an extension acts on\"; MICS, \"Structure\"",
        "The layers are 0 Identity, 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development: 4 is Agreements.", &cmip(vec![(10, arr(vec![u(4)]))], "An extension acting on a fifth layer."), &[], spec_.clone());
    push("field 10 naming layer 5, Development itself: no specification", "Development, \"Layers an extension acts on\"",
        "Field 10 names layers 0 to 4: an extension's own acts are Development's.", &cmip(vec![(10, arr(vec![u(5)]))], "An extension acting on Development."), &[], none.clone());
    push("field 10 empty: no specification", fmt, "`[+ uint]` holds at least one item.", &cmip(vec![(10, arr(vec![]))], "An extension declaring an empty list."), &[], none.clone());
    push("field 10 ascending on a cMIP: a specification", "Development, \"Layers an extension acts on\"",
        "Envelopes and Money (layers 2 and 3), ascending.", &cmip(vec![(10, arr(vec![u(2), u(3)]))], "An extension acting on Money and Agreements."), &[], spec_.clone());
    push("field 12 on a cMIP: a specification", "Development, \"A proof-of-delivery checker\"",
        "A cMIP declaring itself a checker.", &cmip(vec![(12, Value::Bool(true))], "A proof checker."), &[], spec_.clone());
    push("field 12 false: no specification", fmt, "Field 12 is the value true alone.", &cmip(vec![(12, Value::Bool(false))], "A cMIP writing false."), &[], none.clone());
    push("field 12 on a Module: no specification", kinds_, "Field 12 is present only on a cMIP.",
        &enc(vec![(0, u(kinds::MODULE)), (1, creator.clone()), (5, b(split_hash)), (9, t("A Module declaring a checker.")), (12, Value::Bool(true))]), &[split_hash], none.clone());

    // By kind.
    push("a MIR: kind 4 and its text, no creator: a specification", "Development rule 26; \"What each kind must carry\"", "The map `{ 0 => 4, 9 => text }`.", &a_mir, &[], spec_.clone());
    push("a MIR naming a creator: no specification", kinds_, "Field 1 is absent on kinds 4, 6 and 7.",
        &enc(vec![(0, u(kinds::MIR)), (1, creator.clone()), (9, t("A MIR with a creator."))]), &[], none.clone());
    push("the MICS document, kind 6, no creator: a specification", kinds_, "Published like the MIRs.", &enc(vec![(0, u(kinds::MICS)), (9, t("The MICS."))]), &[], spec_.clone());
    push("a test suite naming a creator: no specification", kinds_, "Field 1 is absent on a test suite.",
        &enc(vec![(0, u(kinds::TEST_SUITE)), (1, creator.clone()), (9, t("A test suite."))]), &[], none.clone());
    push("a MIP with a creator and the MIR it forks: a specification", kinds_, "Kind 8 carries fields 1 and 8.",
        &enc(vec![(0, u(kinds::MIP)), (1, creator.clone()), (8, b(a_mir_hash)), (9, t("A MIP."))]), &[], spec_.clone());
    push("a MIP naming nothing it forks: no specification", kinds_, "Field 8 is present on a MIP.", &enc(vec![(0, u(kinds::MIP)), (1, creator.clone()), (9, t("A MIP forking nothing."))]), &[], none.clone());
    push("a Module without field 5: no specification", kinds_, "Field 5 is present on a Module.", &enc(vec![(0, u(kinds::MODULE)), (1, creator.clone()), (9, t("A Module naming nothing."))]), &[], none.clone());
    push("a cMIP carrying field 5: no specification", kinds_, "Field 5 is absent on every kind but a Module.", &cmip(vec![(5, b(split_hash))], "A cMIP naming what it implements."), &[], none.clone());
    push("a unit naming its creator: a specification", "Development, \"A unit (kind 2)\"", "Fields 0, 1 and 9.", &enc(vec![(0, u(kinds::UNIT)), (1, creator.clone()), (9, t("One smallest part: one test satoshi."))]), &[], spec_.clone());
    push("a signature scheme naming no creator: no specification", kinds_, "Field 1 is present on kind 5.", &enc(vec![(0, u(kinds::SIGNATURE_SCHEME)), (9, t("A scheme."))]), &[], none.clone());
    push("a kind of 9: no specification", fmt, "5: field 0 is a kind from 0 to 8.", &enc(vec![(0, u(9)), (1, creator.clone()), (9, t("A kind the format does not define."))]), &[], none.clone());
    push("no field 9: no specification", fmt, "5: field 9 is present.", &enc(vec![(0, u(kinds::CMIP)), (1, creator.clone())]), &[], none.clone());
    push("no field 0: no specification", fmt, "Every specification carries field 0.", &enc(vec![(1, creator.clone()), (9, t("A text naming no kind."))]), &[], none.clone());

    // Fields any kind may carry (7), and none forbidden refuses the content.
    push("a cMIP with no field 2: a specification", "Development, \"How the content is decoded\": a missing field 2 is never no specification",
        "No decoder can tell that a text fills a task.", &cmip(vec![], "A cMIP filling a task, no field 2 written."), &[], spec_.clone());
    push("a unit naming a predecessor: a specification", "Development, \"How the content is decoded\", 7", "Field 8 may sit on any kind.",
        &enc(vec![(0, u(kinds::UNIT)), (1, creator.clone()), (8, b(split_hash)), (9, t("A unit replacing another."))]), &[], spec_.clone());
    push("a signature scheme with a verification rule: a specification", "Development, \"A signature scheme (kind 5)\"", "Kind 5 MAY carry field 6; a rule-ref is four items.",
        &enc(vec![(0, u(kinds::SIGNATURE_SCHEME)), (1, creator.clone()), (6, arr(vec![arr(vec![b(spec("a rule's binary")), u(1000), u(1_000_000), b(spec("a machine profile"))])])), (9, t("A scheme with its rule."))]), &[], spec_.clone());

    // Each field's type (step 4).
    push("a creator of 31 bytes: no specification", fmt, "4: a hash is exactly 32 bytes.", &enc(vec![(0, u(kinds::CMIP)), (1, Value::Bytes(vec![7; 31])), (9, t("A short creator."))]), &[], none.clone());
    push("field 2 empty: no specification", fmt, "4: `[+ x]` holds at least one item.", &cmip(vec![(2, arr(vec![]))], "A cMIP filling no task, written."), &[], none.clone());
    push("a task-ref of three items: no specification", fmt, "4: a task-ref is exactly two items.", &cmip(vec![(2, arr(vec![arr(vec![b(money), u(6), u(0)])]))], "A cMIP, a long task-ref."), &[], none.clone());
    push("a type-def of two items: no specification", fmt, "4: a type-def is exactly three items.", &cmip(vec![(3, arr(vec![arr(vec![u(0), t("a type")])]))], "A cMIP, a short type-def."), &[], none.clone());
    push("a rule-ref of three items: no specification", fmt, "4: a rule-ref is exactly four items.", &cmip(vec![(6, arr(vec![arr(vec![b(spec("a rule's binary")), u(1000), u(1_000_000)])]))], "A cMIP, a rule naming no profile."), &[], none.clone());
    push("a fee of a part in millionths: a specification", fmt, "4: a rate `[0, part]`, part an unsigned integer.", &cmip(vec![(7, arr(vec![arr(vec![u(0), u(2_000)])]))], "A cMIP charging 0.2%."), &[], spec_.clone());
    push("a fee whose part is a text: no specification", fmt, "4: `part` is an unsigned integer counted in millionths.", &cmip(vec![(7, arr(vec![arr(vec![u(0), t("two per mille")])]))], "A cMIP, a fee in words."), &[], none.clone());
    push("a fee of rate kind 2: no specification", fmt, "4: a rate is `[0, part]` or `[1, amount]`.", &cmip(vec![(7, arr(vec![arr(vec![u(2), u(5)])]))], "A cMIP, a third kind of rate."), &[], none.clone());
    push("a fee naming who is paid by 31 bytes: no specification", fmt, "4: `paid` is a hash.", &cmip(vec![(7, arr(vec![arr(vec![u(0), u(5)]), Value::Bytes(vec![7; 31])]))], "A cMIP, a short payee."), &[], none.clone());
    push("a field 9 that is not canonical text: no specification", fmt, "3: every text string is canonical text; a trailing space is not.", &cmip(vec![], "A cMIP. "), &[], none.clone());
    push("a type-def's name that is not canonical text: no specification", fmt, "3: every text string, every type-def included.", &cmip(vec![(3, arr(vec![arr(vec![u(0), t("a type "), t("{ 0 => uint }")])]))], "A cMIP defining a type."), &[], none.clone());
    push("a field 4 holding a text: no specification", fmt, "4: field 4 is a list of hashes.", &cmip(vec![(4, arr(vec![t("Money")]))], "A cMIP naming a dependency by name."), &[], none.clone());

    // The encoding (steps 1 and 2).
    let mir_text = |s: &str| { let mut v = vec![0x60 + s.len() as u8]; v.extend(s.as_bytes()); v };
    let mut dup = vec![0xa3, 0x00, 0x04, 0x00, 0x04, 0x09];
    dup.extend(mir_text("A MIR."));
    push("a map key twice: no specification", fmt, "1: a map key twice.", &dup, &[], none.clone());
    let mut unsorted = vec![0xa2, 0x09];
    unsorted.extend(mir_text("A MIR."));
    unsorted.extend([0x00, 0x04]);
    push("map keys out of deterministic order: no specification", fmt, "1: bytes that are not deterministic CBOR.", &unsorted, &[], none.clone());
    let mut trailing = a_mir.clone();
    trailing.push(0x00);
    push("a byte after the map: no specification", fmt, "1: the content holds one map, with nothing after it.", &trailing, &[], none.clone());
    push("an array, not a map: no specification", fmt, "1: the content holds one map.", &cbor::encode(&arr(vec![u(4), t("A MIR.")])), &[], none.clone());
    push("a text key: no specification", fmt, "2: every key is an unsigned integer from 0 to 13.",
        &cbor::encode(&Value::Map(vec![(u(0), u(4)), (u(9), t("A MIR.")), (t("note"), t("a note"))])), &[], none.clone());
}

/// S7g: Development read at the identity layer: rule 3, a specification
/// claimed by its creator only by a publication the creator signed and its
/// rotation did not disown; and a signature scheme named by hash, kind 5.
fn s7g_development_identity(out: &mut Out) {
    let mut w = World::new();
    let mut home = w.operator("dev home");
    let mut reader = w.genesis("dev reader", vec![own_home()], None, None);
    let mut ida = w.genesis("ida, a creator", vec![home_of(&home)], None, None);
    let mut kit = w.genesis("kit, not the creator", vec![own_home()], None, None);
    let content = cbor::encode(&Value::Map(vec![(Value::Uint(0), Value::Uint(kinds::CMIP)), (Value::Uint(1), Value::Bytes(ida.id.to_vec())), (Value::Uint(9), Value::Text("A cMIP by Ida.".into()))]));
    let media = |c: &[u8]| publication(vec![(Value::Uint(0), Value::Bytes(mirs().development.to_vec())), (Value::Uint(1), Value::Bytes(mor_core::hash::work_hash(c).to_vec()))]);
    let by_ida = { let a = w.everyday_act(&mut ida, mirs().envelopes, 0, media(&content), None, None); w.add(&a) };
    let by_kit = { let a = w.everyday_act(&mut kit, mirs().envelopes, 0, media(&content), None, None); w.add(&a) };
    let ida_id = ida.id;
    let ask_claim = |p: &Hash| json!({ "question": "specification claim", "act": hx(p), "creator": hx(&ida_id) });
    let rule = "Development rule 3";
    let before = w.log.clone();
    out.case(&mut w, "a specification published by the creator it names: claimed", rule, "Ida's publication carries content naming Ida as creator.", Facts::default(), ask_claim(&by_ida), json!("claimed"), None);
    let mut w2 = World::new();
    for (a, _) in &before { w2.add(a); }
    out.case(&mut w2, "the same specification published by another identity: unclaimed by the creator it names", rule,
        "Kit publishes Ida's content; only a publication signed by the creator named inside claims it.", Facts::default(), ask_claim(&by_kit), json!("unclaimed"), None);
    // A thief publishes with Ida's stolen key; Ida's rotation disowns it.
    let mut w3 = World::new();
    for (a, _) in &before { w3.add(a); }
    let stolen = { let a = w3.everyday_act(&mut ida, mirs().envelopes, 0, media(b"another cMIP by Ida, published by a thief"), None, None); w3.add(&a) };
    let relied = { let a = w3.everyday_act(&mut ida, mirs().envelopes, 0, media(b"a third, published by the thief and relied on"), None, None); w3.add(&a) };
    w3.ack(&mut reader, relied);
    let (r, _) = w3.rotate(&ida, Rot { disowned: Some(vec![stolen, relied]), ..Default::default() });
    w3.receipt(&mut home, &ida.id, &r, 1);
    let after = w3.log.clone();
    out.case(&mut w3, "a publication the creator's rotation disowned: unclaimed", "Development rule 3; Identity rule 34",
        "Signed with Ida's stolen key; Ida's rotation disowns it and nobody relied on it.", Facts::default(), ask_claim(&stolen), json!("unclaimed"), None);
    let mut w4 = World::new();
    for (a, _) in &after { w4.add(a); }
    out.case(&mut w4, "a disowned publication another identity relied on: unclaimed, shown as disputed", "Development rule 3: a special case beside Identity rule 34",
        "A reader acknowledged it before the rotation: shown as disputed, and it claims nothing for the creator.", Facts::default(), ask_claim(&relied), json!("unclaimed, shown as disputed"), None);

    // A signature scheme named by its specification's hash, not adopted here.
    let mut w = World::new();
    let mut home = w.operator("dev scheme home");
    let lev = w.genesis("lev", vec![home_of(&home)], None, None);
    let scheme = spec("a post-quantum signing-key scheme specification (kind 5)");
    let pq = mor_core::identity::SigningKey { scheme: mor_core::act::Scheme::Spec(scheme), key: vec![9; 40] };
    let (r, mut lev1) = w.rotate(&lev, Rot { raw_signing_key: Some(pq.clone()), ..Default::default() });
    w.receipt(&mut home, &lev.id, &r, 1);
    let mut a = w.everyday_act(&mut lev1, mirs().text, 0, vec![(Value::Uint(0), Value::Text("A post under the new scheme.".into()))], None, None);
    a.signature = mor_core::act::Signature { scheme: mor_core::act::Scheme::Spec(scheme), key: pq.key.clone(), sig: vec![1; 50] };
    let post = w.add(&a);
    let log = w.log.clone();
    out.case(&mut w, "a rotation to a signing key of a scheme named by hash, which this client has not adopted: valid", "Development, \"A signature scheme (kind 5)\"; freeze scenario, Part two",
        "The rotation is signed under the old key; it installs a key of a scheme the client does not implement.", Facts::default(), ask_status(&r), json!("valid"), None);
    let mut w2 = World::new();
    for (x, _) in &log { w2.add(x); }
    out.case(&mut w2, "a later act signed under that scheme: unknown, never valid or invalid", "Development, \"A signature scheme (kind 5)\"; rule 10",
        "A client that has not adopted the scheme answers unknown for every act signed under it, whatever the lengths.", Facts::default(), ask_status(&post), json!("unknown"), None);
}

/// S7g: a rail Module's binding (field 13) read from its specification
/// by the money layer (Development, "A rail Module's kind and binding";
/// Money rule 11, element by element).
fn s7g_development_rails(out: &mut Out) {
    let unit = spec("a test unit (regtest satoshi)");
    let enc = |fields: Vec<(u64, Value)>| cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()));
    let payment_cmip = spec("a payment cMIP, by its hash");
    let rail_spec = |kind: u64, binds: Vec<u64>, text: &str| {
        enc(vec![(0, Value::Uint(kinds::MODULE)), (1, Value::Bytes(spec("a rail's creator").to_vec())), (5, Value::Bytes(payment_cmip.to_vec())), (9, Value::Text(text.into())), (11, Value::Uint(kind)), (13, Value::Array(binds.into_iter().map(Value::Uint).collect()))])
    };
    let payee_only = rail_spec(1, vec![0], "A push rail whose proof binds the payee only.");
    let both = rail_spec(1, vec![0, 1], "A push rail whose proof binds payee and purpose.");
    // (content, the records the rail answers valid, names, paid toward each debt)
    for (content, both_valid, name_d1, name_d2, paid) in [
        (&payee_only, true, "a payer's claim and the receiver's receipt of one payment naming different debts, on a rail whose specification binds the payee only, both answered valid: the claim decides", "the same: nothing toward the debt the receipt names, shown as a dispute", (60, 0)),
        (&both, false, "the same records on a rail whose specification binds payee and purpose, the rail answering valid for the receipt only: the receipt's debt", "the same: nothing toward the debt the refused claim names", (0, 60)),
    ] {
        let rail = Spec::hash_of(content);
        let mut w = World::new();
        let mut ana = w.genesis("dev ana, a creditor", vec![own_home()], None, None);
        let mut bo = w.genesis("dev bo, a debtor", vec![own_home()], None, None);
        let pointer = { let x = Fin::PayeePointer(money::PayeePointer { payee: ana.id, version: 1, previous: None, rails: vec![money::Rail { module: rail, address: b"dev ana's wallet".to_vec() }] });
            let a = w.everyday_act(&mut ana, mirs().money, 0, x.to_map(), None, None); w.add(&a) };
        let debt = |w: &mut World, bo: &mut Person, ana: &mut Person| {
            let o = Fin::Obligation(money::Obligation { debtor: bo.id, creditor: ana.id, amount: Amount { unit, value: 60 }, pointer, agreement: None });
            let id = { let a = w.everyday_act(bo, mirs().money, 1, o.to_map(), None, None); w.add(&a) };
            w.ack(ana, id);
            id
        };
        let (d1, d2) = (debt(&mut w, &mut bo, &mut ana), debt(&mut w, &mut bo, &mut ana));
        let proof = b"one payment of 60 on a push rail".to_vec();
        let c = { let x = Fin::Claim(Claim { rail, proof: proof.clone(), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils: d1, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
            let a = w.everyday_act(&mut bo, mirs().money, 3, x.to_map(), None, None); w.add(&a) };
        let r = { let x = Fin::Receipt(Receipt { rail, proof: proof.clone(), payer: Some(Payer::Identity(bo.id)), payee: ana.id, amount: Amount { unit, value: 60 }, fulfils: d2, previous: None, forward: None, batch: None, purchase: None });
            let a = w.everyday_act(&mut ana, mirs().money, 2, x.to_map(), None, None); w.add(&a) };
        let valid: Vec<(Hash, Hash)> = if both_valid { vec![(c, pointer), (r, pointer)] } else { vec![(r, pointer)] };
        let facts = || Facts { rail_valid: valid.clone(), rail_payments: vec![(proof.clone(), b"the one push payment".to_vec())], rail_specifications: vec![content.clone()], ..Default::default() };
        let log = w.log.clone();
        let why = if both_valid {
            "Bo's claim names the first debt, Ana's receipt the second; the rail's specification (held, decoded) binds the payee only, so the rail answers valid for both and the payer's claim decides what the payment fulfils."
        } else {
            "Bo's claim names the first debt, Ana's receipt the second; the rail's specification binds the purpose, so the proof's commitment decides: the rail refuses the claim, whose commitment is not the one the proof carries."
        };
        out.case(&mut w, name_d1, "Money rule 11, element by element; Development, \"A rail Module's kind and binding\"", why, facts(), ask("paid toward", &d1), json!(paid.0), None);
        let mut w2 = World::new();
        for (a, _) in &log { w2.add(a); }
        out.case(&mut w2, name_d2, "Money rule 11; Development, \"A rail Module's kind and binding\"", why, facts(), ask("paid toward", &d2), json!(paid.1), None);
    }
}
