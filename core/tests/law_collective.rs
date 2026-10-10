//! Law draft 9 on a collective's own sequences (F109): freeze suite v21,
//! scenario 3 (the label), its step 7o (the ordering stories, each named
//! after its test in `harness/ordering/tests/stories.rs`), steps 7k, 8 and
//! 8b with the abandonment declaration (B12), Flaw B1 and B11, Flaws B17
//! and B18, and scenario 1 (the film, a deal, with Flaw B19).
//!
//! The label: Ana holds the releases area (publications and the Production
//! lane, id 1); Ben, the treasurer, holds the Finance lane (id 2); Cy holds
//! none. The label signs from up to three devices; members from a phone, a
//! laptop and a tablet. Acts and signatures are real: signed, held, judged
//! by the core library.

mod common;

use common::{law_spec, own_home, schnorr, signing_key, Person, Rot, World};
use mor_core::sig::SchnorrKey;
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::hash::{sha256, Hash};
use mor_core::identity::KeptTip;
use mor_core::law::{
    self, outcomes, Abandonment, AbsenceDeclaration, Area, Authority, Backing, CloneState, Consent, Field4, Grant, Who,
    Holding, KeyGrammar, Keepers, Kind, LawError, LawView, MarkEntry, Mips, Power, Record,
    Recovery, Resignation, Rule, SuccessionPlan, Terms,
};
use mor_core::mmr::Mmr;

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: common::identity_spec(),
        envelope: t("ENVELOPE"),
        text: t("TEXT"),
        finance: t("FINANCE"),
        law: t("LAW"),
        production: t("PRODUCTION"),
    }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn pay() -> Hash {
    spec("a payment cMIP")
}
fn pay2() -> Hash {
    spec("a second payment cMIP")
}
fn pay3() -> Hash {
    spec("a third payment cMIP")
}
fn anchor() -> Hash {
    spec("an anchoring cMIP")
}
fn ext() -> Hash {
    spec("an extension declaring only Production")
}

const ANA: usize = 0;
const BEN: usize = 1;
const CY: usize = 2;

struct Lab {
    w: World,
    /// Ana, Ben, Cy: each one's phone.
    m: Vec<Person>,
    /// The label's devices: 0, 1, 2.
    c: Vec<Person>,
    founding: Hash,
    authority: Person,
    keeper: Person,
    keeper_logs: Vec<(Hash, Vec<Hash>)>,
    /// The rail's answer for the receipts paying debts (Finance rule 4), as
    /// a verifier states it after the payment cMIP: valid, and where paid.
    rail_valid: Vec<(Hash, mor_core::finance::PaidAt)>,
    /// The absence-proof cMIP's answer (rule 51, F172), as a verifier
    /// states it: each `(declaration, act using it)` it accepted.
    accepted: Vec<(Hash, Hash)>,
}

/// A grant key (F128): made by the grantee, who keeps its secret part; the
/// grant names its public part (field 9).
fn grant_key(name: &str) -> (SchnorrKey, mor_core::identity::SigningKey) {
    let k = schnorr(&format!("{name}/grant"), 0);
    let p = signing_key(&k);
    (k, p)
}

/// The label's founding terms (scenario 3.1), with a change applied.
fn label_terms(ids: &[Hash], authority: Hash, keeper: Hash, f: &dyn Fn(&mut Terms)) -> Terms {
    let m = mips();
    let mut t = Terms {
        parties: ids.to_vec(),
        text: "The label publishes its members' records.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: Some(Keepers {
            operators: vec![keeper],
            rule: Rule::All,
        }),
        field4: Field4::Rule(Rule::All),
        clone: Rule::Threshold(2),
        time: None,
        abandonment: Some(Abandonment {
            authority: Authority::Named(authority),
            outcomes: vec![outcomes::VOICE_REMOVED],
            proof: None,
        }),
        parent: None,
        grammar: Some(KeyGrammar {
            signing: Holding::Shares {
                threshold: 2,
                members: ids.to_vec(),
            },
            safety: Holding::Shares {
                threshold: ids.len() as u64,
                members: ids.to_vec(),
            },
            recovery: Some(Recovery::Escrow { authority }),
        }),
        arbitrators: Some(vec![spec("an arbitrator")]),
        split_grant: None,
        payee_grants: None,
        extensions: Some(vec![ext()]),
        succession: None,
        constitutional: None,
        areas: Some(vec![
            Area {
                name: "Releases".into(),
                holders: vec![ids[ANA]],
                threshold: 1,
                kinds: Some(vec![
                    Kind::Type {
                        spec: m.envelope,
                        type_: 0,
                    },
                    Kind::Layer(law::layers::PRODUCTION),
                ]),
                fields: None,
                id: 1,
            },
            Area {
                name: "Finance".into(),
                holders: vec![ids[BEN]],
                threshold: 1,
                kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]),
                fields: None,
                id: 2,
            },
        ]),
        area_words: Some(vec![(1, "Releases go out on Fridays.".into())]),
        chain: None,
        departed: None,
        stakes: None,
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
    };
    f(&mut t);
    t
}

fn tip(dev: &Person) -> KeptTip {
    KeptTip {
        act: *dev.seq.last().expect("a device with acts"),
        position: dev.seq.len() as u64,
        summary: Mmr::from_ids(&dev.seq).root(),
    }
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object {
        chain: x,
        predecessor: x,
    }])
}

impl Lab {
    fn new(f: &dyn Fn(&mut Terms)) -> Lab {
        Lab::with(f, true)
    }

    fn with(f: &dyn Fn(&mut Terms), all_sign: bool) -> Lab {
        let mut w = World::new();
        let mut m: Vec<Person> = ["ana", "ben", "cy"]
            .iter()
            .map(|n| w.genesis(n, vec![own_home()], None, None))
            .collect();
        let authority = w.genesis("authority", vec![own_home()], None, None);
        let keeper = w.genesis("keeper", vec![own_home()], None, None);
        let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
        let t = label_terms(&ids, authority.id, keeper.id, f);
        let founding = law_act(&mut w, &mut m[ANA], law::types::TERMS, t.to_map(), None);
        let n = if all_sign { 3 } else { 2 };
        for p in m.iter_mut().take(n) {
            sign(&mut w, p, &founding);
        }
        let c0 = w.genesis_with(
            "label",
            vec![own_home()],
            None,
            None,
            Some(vec![law::founding_declaration(&mips().law, &founding)]),
            3,
        );
        let mut c0 = c0;
        c0.cite = Some((c0.id, vec![c0.id]));
        let c = vec![c0.clone(), c0.clone(), c0];
        Lab {
            w,
            m,
            c,
            founding,
            authority,
            keeper,
            keeper_logs: vec![],
            rail_valid: vec![],
            accepted: vec![],
        }
    }

    /// What an act on the label's chain cites (F127): the decisions its
    /// devices know, and these previous acts.
    fn chain(&self, previous: &[Hash]) -> Vec<Object> {
        let (c, ds) = self.c[0].cite.clone().expect("the label's devices cite its chain");
        ds.iter().chain(previous).map(|d| Object { chain: c, predecessor: *d }).collect()
    }

    fn ids(&self) -> Vec<Hash> {
        self.m.iter().map(|p| p.id).collect()
    }

    fn view(&self) -> LawView<'_> {
        let mut v = LawView::new(&self.w.v, mips());
        v.ext_layers.insert(ext(), vec![]);
        v.ext_layers
            .insert(spec("an extension declaring Finance"), vec![law::layers::FINANCE]);
        for (op, log) in &self.keeper_logs {
            v.keeper_logs.insert(*op, log.clone());
        }
        v.rail_valid.extend(self.rail_valid.iter().copied());
        v.absence_accepted.extend(self.accepted.iter().copied());
        v
    }

    fn consent(&self, x: &Hash) -> Consent {
        self.view().consent(x).unwrap()
    }

    fn counts(&self, x: &Hash) -> bool {
        self.consent(x).counts()
    }

    fn in_force(&self, x: &Hash) -> Hash {
        self.view().in_force(x).unwrap().unwrap()
    }

    /// The terms of the agreement in force, changed: a clone proposal.
    fn clone_terms(&self, parent: &Hash, mark: Vec<(Power, Vec<usize>)>, f: &dyn Fn(&mut Terms)) -> Terms {
        let mut t = self.view().terms(parent).unwrap();
        t.parent = Some(*parent);
        let ids = self.ids();
        t.field4 = Field4::Mark(
            mark.into_iter()
                .map(|(power, who)| MarkEntry {
                    power,
                    signers: sorted(who.iter().map(|i| ids[*i]).collect()),
                })
                .collect(),
        );
        f(&mut t);
        t
    }

    /// A member proposes terms.
    fn propose(&mut self, by: usize, t: &Terms) -> Hash {
        let objects = t.parent.and_then(obj);
        law_act(&mut self.w, &mut self.m[by], law::types::TERMS, t.to_map(), objects)
    }

    fn sign(&mut self, by: usize, x: &Hash) -> Hash {
        sign(&mut self.w, &mut self.m[by], x)
    }

    /// A member's signature on a fork or closing: a chain signature, with
    /// their safety key, on their identity chain (F132).
    fn end(&mut self, by: usize, x: &Hash) -> Hash {
        let (id, q) = self.w.chain_sign(&self.m[by], *x);
        self.m[by] = q;
        id
    }

    /// An act of the label, on device `d`, of a cMIP's own type 0: an act in
    /// the lane of the task the terms name that cMIP for (F106). Since F112
    /// a payment cMIP defines no act of its own (receipts are Finance's,
    /// below); these acts stand for any act of a cMIP adopted for a task.
    fn cmip_act(&mut self, d: usize, cmip: Hash) -> Hash {
        let a = self.w.everyday_act(
            &mut self.c[d],
            cmip,
            0,
            vec![(Value::Uint(0), Value::Text("a receipt".into()))],
            None,
            None,
        );
        self.w.add(&a)
    }

    /// The label's payee pointer (Finance type 0), on device `d`, naming
    /// these rail Modules: the rails it accepts (F115).
    fn pointer(&mut self, d: usize, version: u64, previous: Option<Hash>, rails: &[Hash]) -> Hash {
        let p = mor_core::finance::Payload::PayeePointer(mor_core::finance::PayeePointer {
            payee: self.c[d].id,
            version,
            previous,
            rails: rails
                .iter()
                .map(|m| mor_core::finance::Rail {
                    module: *m,
                    address: b"an address".to_vec(),
                })
                .collect(),
        });
        let a = self.w.everyday_act(&mut self.c[d], mips().finance, 0, p.to_map(), None, None);
        self.w.add(&a)
    }

    /// A settlement receipt the label signs as payee (Finance type 2), on
    /// device `d`, for a payment on the rail Module `rail`.
    fn finance_receipt(&mut self, d: usize, rail: Hash) -> Hash {
        let r = mor_core::finance::Payload::Receipt(mor_core::finance::Receipt {
            rail,
            proof: vec![],
            payer: Some(mor_core::finance::Payer::Identity(spec("a fan"))),
            payee: self.c[d].id,
            amount: mor_core::finance::Amount {
                unit: spec("a unit"),
                value: 10,
            },
            fulfils: spec("an offer"),
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = self.w.everyday_act(&mut self.c[d], mips().finance, 2, r.to_map(), None, None);
        self.w.add(&a)
    }

    /// A publication of the label (Envelope type 0), on device `d`.
    fn publish(&mut self, d: usize) -> Hash {
        let a = self.w.everyday_act(
            &mut self.c[d],
            mips().envelope,
            0,
            vec![(Value::Uint(0), Value::Text("a publication".into()))],
            None,
            None,
        );
        self.w.add(&a)
    }

    /// The label acknowledges an act by a witness act (Identity type 15),
    /// on device `d`: on neither chain, it adopts nothing (F142) and places
    /// nothing (F156).
    fn ack(&mut self, d: usize, x: Hash) -> Hash {
        self.w.ack(&mut self.c[d], x)
    }

    /// The label acknowledges an act by an action of its own key on device
    /// `d`, on its chain (a Law act, type 12, which may carry `acks`, F110):
    /// how it places a member's signature act before its next line
    /// ("Made before, made after", 2; C2, F156).
    fn acknowledge(&mut self, d: usize, x: Hash) -> Hash {
        let a = self.w.everyday_act(&mut self.c[d], law_spec(), 12, vec![], None, Some(vec![x]));
        self.w.add(&a)
    }

    /// The same act citing nothing on the label's chain: an action on no
    /// chain of the label, which places nothing (rule 35b, F156).
    fn acknowledge_uncited(&mut self, d: usize, x: Hash) -> Hash {
        let cite = self.c[d].cite.take();
        let a = self.w.everyday_act(&mut self.c[d], law_spec(), 12, vec![], None, Some(vec![x]));
        self.c[d].cite = cite;
        self.w.add(&a)
    }

    /// The label adopts an act (rule 40, F142): an action of its own key on
    /// device `d`, on its chain, whose history holds the act (F131, IT2a).
    fn adopt(&mut self, d: usize, x: Hash) -> Hash {
        let o = self.chain(&[x]);
        let a = self.w.everyday_act(&mut self.c[d], ext(), 0, vec![], Some(o), None);
        let a = self.w.add(&a);
        // The Releases area reaches it: its holder signs, so it counts.
        self.sign(ANA, &a);
        a
    }

    /// A record on device `d`: a clone with the signature acts it names,
    /// the tips of the other devices given, and registrations.
    fn record(&mut self, d: usize, clone: Option<(Hash, Vec<Hash>)>, tips_of: &[usize], registers: Vec<Hash>, named: Hash) -> Hash {
        self.record_acking(d, clone, tips_of, registers, named, None)
    }

    /// A record that also acknowledges acts (Envelope, `acks`).
    fn record_acking(
        &mut self,
        d: usize,
        clone: Option<(Hash, Vec<Hash>)>,
        tips_of: &[usize],
        registers: Vec<Hash>,
        named: Hash,
        acks: Option<Vec<Hash>>,
    ) -> Hash {
        let kept = tips_of.iter().map(|i| tip(&self.c[*i])).collect();
        let r = Record {
            clone: clone.as_ref().map(|c| c.0),
            signatures: clone.as_ref().map(|c| c.1.clone()),
            kept,
            registers: (!registers.is_empty()).then_some(registers),
        };
        let named = clone.map(|c| c.0).unwrap_or(named);
        // A record is a decision: it cites the action heads it saw by its
        // kept tips, not by `objects` (F127).
        let saved = self.c[d].cite.take();
        let a = self.w.everyday_act(
            &mut self.c[d],
            mips().law,
            law::types::RECORD,
            r.to_map(),
            obj(named),
            acks,
        );
        self.c[d].cite = saved;
        let id = self.w.add(&a);
        // Every device's next action cites the decisions made so far under
        // the current key, as a device that heard of them (F127).
        for dev in self.c.iter_mut() {
            if let Some((_, ds)) = dev.cite.as_mut() {
                ds.push(id);
            }
        }
        id
    }

    /// A member's resignation, from a given device (a Person).
    fn resign_from(&mut self, dev: &mut Person, agreement: Hash, area: Option<u64>) -> Hash {
        let r = Resignation { agreement, area };
        law_act(&mut self.w, dev, law::types::RESIGNATION, r.to_map(), obj(agreement))
    }

    /// The grantee's strand of the label's actions chain (F128): acts signed
    /// with the grant key `k`, bound to the grant, citing it.
    fn strand(&self, grant: Hash, k: &SchnorrKey) -> Person {
        let mut p = self.c[0].clone();
        p.binding = grant;
        p.sign = k.clone();
        p.seq = vec![];
        p.cite = Some((self.c[0].id, vec![grant]));
        p
    }

    /// The label grants, on device 0.
    fn grant(&mut self, g: &Grant) -> Hash {
        let a = self.w.everyday_act(
            &mut self.c[0],
            mips().law,
            law::types::GRANT,
            g.to_map(),
            None,
            None,
        );
        self.w.add(&a)
    }

    /// The label rotates (on device 0's key), declaring a clone with the
    /// signature acts named, keeping the tips of the devices given. Every
    /// device then signs with the new key.
    fn rotate(&mut self, decl: Option<(Hash, Vec<Hash>)>, tips_of: &[usize]) -> Hash {
        let ds = decl.map(|(k, s)| vec![law::clone_declaration(&mips().law, &k, &s)]);
        self.rotate_with(ds, tips_of)
    }

    /// C7's recovery rotation (B16): it declares the clone taking the
    /// declared party out, with its signature acts, and names the signature
    /// acts on the declaration that it places (Flaw B18).
    fn recover(&mut self, k: Hash, sigs: Vec<Hash>, absence: Vec<Hash>, tips_of: &[usize]) -> Hash {
        let ds = vec![law::recovery_declaration(&mips().law, &k, &sigs, &absence)];
        self.rotate_with(Some(ds), tips_of)
    }

    fn rotate_with(&mut self, declarations: Option<Vec<mor_core::identity::Declaration>>, tips_of: &[usize]) -> Hash {
        let kept: Vec<KeptTip> = tips_of
            .iter()
            .filter(|i| !self.c[**i].seq.is_empty())
            .map(|i| tip(&self.c[*i]))
            .collect();
        let (id, next) = self.w.rotate(
            &self.c[0],
            Rot {
                kept: Some(kept),
                declarations,
                ..Default::default()
            },
        );
        for d in self.c.iter_mut() {
            let seq = std::mem::take(&mut d.seq);
            let chain = d.cite.as_ref().map(|c| c.0);
            *d = next.clone();
            d.seq = seq;
            d.cite = chain.map(|c| (c, vec![id]));
        }
        id
    }
}

fn law_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mips().law, type_, payload, objects, None);
    w.add(&a)
}

fn view(w: &World) -> LawView<'_> {
    LawView::new(&w.v, mips())
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    law_act(w, p, law::types::SIGNATURE, law::signature_payload(x), obj(*x))
}

/// A mark's signers are ascending by hash (B8).
fn sorted(mut v: Vec<Hash>) -> Vec<Hash> {
    v.sort();
    v
}

/// An ending's `objects`: the agreement, and every earlier fork or
/// closing of the collective held, as a member's client names them (F131
/// IT1, client conformance; F132 U4b: a drafter names every ending they
/// signed).
fn ending_obj(lab: &Lab, ag: Hash, collective: Hash) -> Option<Vec<Object>> {
    let mut o = obj(ag).unwrap();
    o.extend(lab.view().ending_acts(&collective).into_iter().map(|e| Object { chain: ag, predecessor: e }));
    Some(o)
}

fn device(p: &Person) -> Person {
    let mut d = p.clone();
    d.seq = vec![];
    d
}

fn areas(c: &Consent) -> Vec<(u64, bool, bool, Vec<Hash>)> {
    match c {
        Consent::Areas { areas, .. } => areas
            .iter()
            .map(|a| (a.area, a.frozen, a.met, a.signers.clone()))
            .collect(),
        other => panic!("no area reaches it: {other:?}"),
    }
}

fn puts(lab: &Lab, r: &Hash) -> Option<Hash> {
    lab.view().record(&lab.c[0].id, r).unwrap().puts
}

fn clone_state(lab: &Lab, r: &Hash) -> CloneState {
    lab.view().record(&lab.c[0].id, r).unwrap().clone.unwrap().1
}

fn words(t: &mut Terms, area: u64, w: &str) {
    let mut v = t.area_words.clone().unwrap_or_default();
    v.retain(|(i, _)| *i != area);
    v.push((area, w.into()));
    v.sort_by_key(|(i, _)| *i);
    t.area_words = Some(v);
}

// ---------------------------------------------------------------- founding, areas, lanes

/// 3.2, Q11: founding terms a founder has not signed found nothing.
#[test]
fn a_collective_exists_only_when_every_founder_signed() {
    let mut lab = Lab::with(&|_| {}, false);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(matches!(lab.consent(&p), Consent::Broken { .. }));
    assert_eq!(lab.view().agreement(&lab.founding).unwrap().exists, Some(false));
    let f = lab.founding;
    lab.sign(CY, &f);
    assert!(lab.counts(&p), "once the third founder signs");
}

/// 3.7c, 3.7g, Q16, F106: acts fall in the lanes the label's own terms give.
#[test]
fn acts_fall_in_the_lanes_the_terms_give() {
    let mut lab = Lab::new(&|_| {});
    let (ana, ben) = (lab.m[ANA].id, lab.m[BEN].id);
    // A publication: the release manager's.
    let p = lab.publish(0);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, false, false, vec![])]);
    lab.sign(BEN, &p);
    lab.sign(CY, &p);
    assert!(!lab.counts(&p), "signed by the two others, not the manager");
    lab.sign(ANA, &p);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, false, true, vec![ana])]);
    // A receipt of the payment cMIP named for task 6: the treasurer's.
    let r = lab.cmip_act(0, pay());
    assert!(!lab.counts(&r));
    lab.sign(BEN, &r);
    assert_eq!(areas(&lab.consent(&r)), vec![(2, false, true, vec![ben])]);
    // A cMIP the terms name nowhere: counts for nothing (Q16).
    let x = lab.cmip_act(0, pay2());
    lab.sign(BEN, &x);
    assert!(matches!(lab.consent(&x), Consent::Unadopted { .. }));
    // An act of the adopted extension: the Production lane's (F106).
    let e = lab.cmip_act(0, ext());
    lab.sign(ANA, &e);
    assert_eq!(areas(&lab.consent(&e)), vec![(1, false, true, vec![ana])]);
    // In a collective with no area, the same receipt counts on the
    // collective's own signature.
    let mut plain = Lab::new(&|t| {
        t.areas = None;
        t.area_words = None;
    });
    let x = plain.cmip_act(0, pay2());
    assert!(matches!(plain.consent(&x), Consent::NoArea { .. }));
    // An identity declaring no agreement is not a collective.
    let mut solo = plain.w.genesis("solo", vec![own_home()], None, None);
    let post = plain.w.post(&mut solo, "hello");
    assert_eq!(plain.view().consent(&post).unwrap(), Consent::NotCollective);
}

/// 3.7g, F115 (suite v21): the label's receipts are Finance acts, in the
/// treasurer's lane. A receipt on a rail the label's pointer names counts
/// with the treasurer's signature; one on a rail it never named counts for
/// nothing, signed or not; a pointer the treasurer never signed accepts
/// nothing.
#[test]
fn receipts_count_only_on_rails_the_collective_named() {
    let mut lab = Lab::new(&|_| {});
    let ben = lab.m[BEN].id;
    let (ln, chain) = (spec("a Lightning rail Module"), spec("an on-chain rail Module"));
    // A receipt before any pointer: the label accepted no rail.
    let early = lab.finance_receipt(0, ln);
    lab.sign(BEN, &early);
    assert!(matches!(lab.consent(&early), Consent::RailNotAccepted { rail, .. } if rail == ln));
    // The label's pointer naming Lightning, not yet signed by the treasurer:
    // it does not count, so it accepts nothing.
    let p1 = lab.pointer(0, 1, None, &[ln]);
    assert!(!lab.counts(&p1));
    assert!(matches!(lab.consent(&early), Consent::RailNotAccepted { .. }));
    // The treasurer signs it: the Lightning receipt counts with him.
    lab.sign(BEN, &p1);
    assert!(lab.counts(&p1));
    assert_eq!(areas(&lab.consent(&early)), vec![(2, false, true, vec![ben])]);
    let r = lab.finance_receipt(0, ln);
    assert!(!lab.counts(&r), "the treasurer has not signed it");
    lab.sign(BEN, &r);
    assert!(lab.counts(&r));
    // A receipt on a rail the label never named: nothing, signed or not.
    let x = lab.finance_receipt(0, chain);
    lab.sign(BEN, &x);
    assert!(matches!(lab.consent(&x), Consent::RailNotAccepted { rail, .. } if rail == chain));
    assert!(!lab.counts(&x));
    // A new pointer (the treasurer's signature alone, no clone) adds the
    // on-chain rail: now it counts.
    let p2 = lab.pointer(0, 2, Some(p1), &[ln, chain]);
    lab.sign(BEN, &p2);
    assert!(lab.counts(&x));
}

/// 3.7g, rule 37c, A2, F109: the treasurer adopts a payment cMIP alone;
/// the label records it at once; the record's place decides.
#[test]
fn the_treasurer_adopts_a_cmip_and_the_record_places_it() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let before = lab.cmip_act(0, pay2());
    let in_tip = lab.cmip_act(1, pay2());
    let third = lab.cmip_act(2, pay2());
    let k = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay2()), (11, anchor())];
    });
    let k = lab.propose(BEN, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert_eq!(a.needs, Some(vec![Power::Area(2)]));
    assert!(!a.ready);
    let sk = lab.sign(BEN, &k);
    assert!(lab.view().agreement(&k).unwrap().ready);
    for x in [before, in_tip] {
        lab.sign(BEN, &x);
    }
    let rec = lab.record(0, Some((k, vec![sk])), &[1], vec![], k);
    assert_eq!(puts(&lab, &rec), Some(k), "no clone rule, no rotation");
    let after = lab.cmip_act(0, pay2());
    lab.sign(BEN, &after);
    let later_b = lab.cmip_act(1, pay2());
    lab.sign(BEN, &later_b);
    lab.sign(BEN, &third);
    // Before the record, in its own sequence or a tip's ancestry: under the
    // founding agreement, where the cMIP is unadopted.
    assert!(matches!(lab.consent(&before), Consent::Unadopted { .. }));
    assert!(matches!(lab.consent(&in_tip), Consent::Unadopted { .. }));
    // After it, citing it: under the clone, with the treasurer's signature.
    for x in [after, later_b] {
        assert_eq!(lab.in_force(&x), k);
        assert!(lab.counts(&x));
    }
    // F127: an act signed on a device that had not heard of the record is
    // judged under the decision it cites, the founding agreement, where the
    // cMIP was unadopted: it was not within its signer's powers, and a
    // record it never cited does not rescue it (B2's "a concurrent record
    // counts" now holds for records alone). A payer's acknowledgement
    // changes nothing (Flaw G).
    let mut payer = lab.w.genesis("payer", vec![own_home()], None, None);
    lab.w.ack(&mut payer, third);
    assert_eq!(lab.in_force(&third), f);
    assert!(matches!(lab.consent(&third), Consent::Unadopted { .. }));

    // A2: a record names its signatures. Ben's next clone is recorded with
    // Cy's signature only: a draft there; Ben's signature arriving later
    // completes nothing at that record.
    let k2 = lab.clone_terms(&k, vec![(Power::Area(2), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay3()), (11, anchor())];
    });
    let k2 = lab.propose(BEN, &k2);
    let sc = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sc])), &[1, 2], vec![], k2);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Draft(_)));
    let sb = lab.sign(BEN, &k2);
    assert_eq!(puts(&lab, &r2), None);
    let r3 = lab.record(0, Some((k2, vec![sb])), &[1, 2], vec![], k2);
    assert_eq!(puts(&lab, &r3), Some(k2));
    // A record of a clone whose parent is no longer in force: nothing.
    let r4 = lab.record(0, Some((k, vec![sk])), &[1, 2], vec![], k);
    assert_eq!(puts(&lab, &r4), None);
    let x = lab.cmip_act(0, pay3());
    lab.sign(BEN, &x);
    assert_eq!(lab.in_force(&x), k2);
    // A record naming an act that is no signature on the clone: invalid.
    let k3 = lab.clone_terms(&k2, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k3 = lab.propose(BEN, &k3);
    lab.sign(BEN, &k3);
    let r5 = lab.record(0, Some((k3, vec![sb])), &[1, 2], vec![], k3);
    assert!(matches!(clone_state(&lab, &r5), CloneState::Invalid(_)));
}

/// 3.7b, 3.7d, 3.7e, 3.7f, 3.7l: marks are checked; powers are exclusive.
#[test]
fn false_marks_sink_clones_and_areas_are_exclusive() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    // 3.7b: the clone rule rewritten by two, marked as a clone-rule change.
    let ids = lab.ids();
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        t.clone = Rule::Named(vec![ids[ANA], ids[BEN]]);
    });
    let k = lab.propose(ANA, &t);
    lab.sign(ANA, &k);
    lab.sign(BEN, &k);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some());
    // Marked as constitutional, naming all three: a draft without Cy.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.clone = Rule::Named(vec![ids[ANA], ids[BEN]]);
    });
    let k = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k);
    let s2 = lab.sign(BEN, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert!(a.invalid.is_none() && !a.ready);
    // A record never puts a constitutional clone in force.
    let r = lab.record(0, Some((k, vec![s1, s2])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), None);

    // 3.7d: keepers changed under the manager's area power: invalid.
    let kp = lab.keeper.id;
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| {
        t.keepers = Some(Keepers {
            operators: vec![kp, ids[CY]],
            rule: Rule::Threshold(1),
        });
    });
    let k = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some());
    // The manager's area changed under the clone rule by the two others.
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![BEN, CY])], &|t| words(t, 1, "Mondays."));
    let k = lab.propose(BEN, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "the area is hers alone (Q5)");

    // 3.7e: two areas at once: each holder.
    let t = lab.clone_terms(
        &f,
        vec![(Power::Area(1), vec![ANA]), (Power::Area(2), vec![BEN])],
        &|t| {
            words(t, 1, "Mondays.");
            words(t, 2, "Weekly.");
        },
    );
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let r = lab.record(0, Some((k, vec![sa])), &[], vec![], k);
    assert!(matches!(clone_state(&lab, &r), CloneState::Draft(_)));
    let sb = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![sa, sb])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k), "in force at once, no rotation (Q7, Q8)");

    // 3.7f (F121): two of three change the arbitrator: the judicial tier
    // needs every member, so two never meet it; the clone rule is not the
    // power for it either.
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k2).unwrap().invalid.is_some());
    let t = lab.clone_terms(&k, vec![(Power::Judicial, vec![ANA, BEN])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), None, "two of three never change a judge");
    let t = lab.clone_terms(&k, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert!(matches!(clone_state(&lab, &r), CloneState::Draft(_)), "a draft until Cy signs");
    let s3 = lab.sign(CY, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2, s3])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), Some(k2), "one version, for everyone");

    // 3.7l, Q12: the manager's words and the keepers: both powers.
    let t = lab.clone_terms(&k2, vec![(Power::Area(1), vec![ANA])], &|t| {
        words(t, 1, "Tuesdays.");
        t.keepers = None;
    });
    let k3 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k3).unwrap().invalid.is_some());
    let t = lab.clone_terms(
        &k2,
        vec![(Power::Judicial, vec![ANA, BEN, CY]), (Power::Area(1), vec![ANA])],
        &|t| {
            words(t, 1, "Tuesdays.");
            t.keepers = None;
        },
    );
    let k3 = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k3)).collect();
    let r = lab.record(0, Some((k3, s)), &[], vec![], k3);
    assert_eq!(puts(&lab, &r), Some(k3));
}

// ---------------------------------------------------------------- departures and lines

/// 3.7 and 7o, Flaws E, F and G, C1, C2, Q23 (ordering stories
/// `flaw_e_and_f_forgotten_devices`, `flaw_f_completed_clone_stays_complete`,
/// `flaw_g_friend_ack_places_nothing`, `choice_late_completion`,
/// `q23_signature_placed_before_leaving`).
#[test]
fn a_departure_takes_effect_at_the_labels_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ben_phone = lab.m[BEN].clone();
    let mut ben_laptop = device(&ben_phone);
    let mut ben_tablet = device(&ben_phone);

    let x1 = lab.cmip_act(0, pay());
    lab.sign(BEN, &x1); // phone
    let x2 = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut ben_tablet, &x2); // tablet, never mentioned

    // A clone signed from the tablet, recorded before the line (Flaw F).
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = sign(&mut lab.w, &mut ben_tablet, &k);
    let r0 = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r0), Some(k));

    // Q23 and C2: a judicial clone, every member (F121); Ben signs and the
    // label acknowledges it as it arrives.
    let t = lab.clone_terms(&k, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator two")]);
    });
    let k2 = lab.propose(CY, &t);
    let sb2 = sign(&mut lab.w, &mut ben_tablet, &k2);
    lab.acknowledge(0, sb2);

    // Ben resigns, from the laptop.
    let res = lab.resign_from(&mut ben_laptop, k, None);
    // Between the resignation and the line, his signature still counts.
    let x3 = lab.cmip_act(0, pay());
    lab.sign(BEN, &x3);
    let pending = lab.cmip_act(0, pay());
    // The label's line.
    let line = lab.record(0, None, &[], vec![res], k);
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(e.line && e.registers.len() == 1);

    let x4 = lab.cmip_act(0, pay());
    let s4 = sign(&mut lab.w, &mut ben_tablet, &x4);
    for x in [x1, x2, x3] {
        assert!(lab.counts(&x), "before the line, from any device");
    }
    let c4 = lab.consent(&x4);
    assert_eq!(areas(&c4), vec![(2, true, false, vec![])], "after: the lane is frozen");
    // C1: Ben completes, after the line, a receipt the label signed before it.
    assert!(!lab.counts(&pending));
    lab.sign(BEN, &pending);
    assert!(lab.counts(&pending), "the act was drafted with him in it");
    // Flaw G: a friend's acknowledgement places nothing.
    let mut friend = lab.w.genesis("friend", vec![own_home()], None, None);
    lab.w.ack(&mut friend, s4);
    assert!(!lab.counts(&x4));
    // The completed clone stays complete.
    assert_eq!(lab.in_force(&x4), k);

    // C2: Ana and Cy sign after the line; a record names all three: Ben
    // counts as a voice for it, the label having acknowledged his
    // signature first.
    let sa2 = lab.sign(ANA, &k2);
    let sc2 = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sa2, sb2, sc2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r2), Some(k2), "{:?} {:?}", clone_state(&lab, &r2), lab.view().record(&lab.c[0].id, &r2).unwrap());
    // A third clone Ben signed but the label never acknowledged, recorded
    // after the line: his signature counts toward nothing.
    let t = lab.clone_terms(&k2, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator three")]);
    });
    let k3 = lab.propose(CY, &t);
    let sa3 = lab.sign(ANA, &k3);
    let sb3 = sign(&mut lab.w, &mut ben_tablet, &k3);
    let sc3 = lab.sign(CY, &k3);
    let r3 = lab.record(0, Some((k3, vec![sa3, sb3, sc3])), &[], vec![], k3);
    assert!(matches!(clone_state(&lab, &r3), CloneState::Invalid(_)));
    // ... and the clone needs the voices that remain: Ana and Cy.
    let t = lab.clone_terms(&k2, vec![(Power::Judicial, vec![ANA, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator three")]);
    });
    let k3 = lab.propose(CY, &t);
    let sa = lab.sign(ANA, &k3);
    let sc = lab.sign(CY, &k3);
    let r3 = lab.record(0, Some((k3, vec![sa, sc])), &[], vec![], k3);
    assert_eq!(puts(&lab, &r3), Some(k3));
}

/// Q36: a record whose clone is not complete still registers the departure.
#[test]
fn a_records_registrations_stand_without_its_clone() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| words(t, 1, "Mondays."));
    let k = lab.propose(ANA, &t);
    let sc = lab.sign(CY, &k);
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    let line = lab.record(0, Some((k, vec![sc])), &[], vec![res], k);
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(e.line && e.puts.is_none());
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    assert!(!lab.counts(&x));
}

/// 3.7, Flaw M, F100: the remaining members rotate and declare a clone
/// without the departed member, naming the signature acts that complete it.
#[test]
fn a_rotation_declares_the_membership_clone_with_its_signatures() {
    for name_all in [false, true] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let mut ben = lab.m[BEN].clone();
        let res = lab.resign_from(&mut ben, f, None);
        lab.record(0, None, &[], vec![res], f);
        let before = lab.publish(0);
        lab.sign(ANA, &before);
        let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
        let ids = lab.ids();
        let new = vec![ids[ANA], ids[CY], dee.id];
        let auth = lab.authority.id;
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &|t| {
            t.parties = new.clone();
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares {
                threshold: 2,
                members: new.clone(),
            };
            g.safety = Holding::Shares {
                threshold: 3,
                members: new.clone(),
            };
            g.recovery = Some(Recovery::Escrow { authority: auth });
            t.areas.as_mut().unwrap()[1].holders = vec![new[2]];
        });
        let k = lab.propose(ANA, &t);
        let sa = lab.sign(ANA, &k);
        let sc = lab.sign(CY, &k);
        let sd = sign(&mut lab.w, &mut dee, &k);
        let named = if name_all { vec![sa, sc, sd] } else { vec![sa, sc] };
        let old = lab.c[0].clone();
        lab.rotate(Some((k, named)), &[0]);
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        if !name_all {
            // Dee's signature was not named: nothing is in force, and the
            // later arrival of nothing new changes that.
            assert!(matches!(lab.consent(&p), Consent::Broken { .. }));
            continue;
        }
        assert_eq!(lab.in_force(&p), k);
        assert!(lab.counts(&p));
        // The release before the rotation still counts, under the founding.
        assert!(lab.counts(&before));
        // A receipt is now Dee's.
        let r = lab.cmip_act(0, pay());
        lab.sign(BEN, &r);
        assert!(!lab.counts(&r));
        sign(&mut lab.w, &mut dee, &r);
        assert!(lab.counts(&r));
        // The old key signs after the rotation: void (F100).
        let mut old = old;
        old.seq = lab.c[0].seq.clone();
        let late = lab.w.everyday_act(&mut old, mips().envelope, 0, vec![], None, None);
        let late = lab.w.add(&late);
        assert_eq!(lab.w.v.status(&late), Status::Void);
    }
}

/// 3.7k, flaw C, Q23 under three of three (ordering story
/// `q23_signature_placed_before_leaving`), with a resignation; the
/// declaration itself is in `a_declaration_removes_a_voice_at_the_labels_line`.
#[test]
fn a_number_never_asks_for_more_voices_than_remain() {
    for acked in [true, false] {
        for mark in [vec![ANA, BEN, CY], vec![BEN, CY]] {
            let mut lab = Lab::new(&|t| t.constitutional = Some(Rule::Threshold(3)));
            let f = lab.founding;
            let t = lab.clone_terms(&f, vec![(Power::Constitutional, mark.clone())], &|t| {
                t.text = "The label publishes records and books.".into();
            });
            let k = lab.propose(BEN, &t);
            let sa = lab.sign(ANA, &k);
            if acked {
                lab.acknowledge(0, sa);
            }
            let mut ana = lab.m[ANA].clone();
            let res = lab.resign_from(&mut ana, f, None);
            lab.record(0, None, &[], vec![res], f);
            let sb = lab.sign(BEN, &k);
            let sc = lab.sign(CY, &k);
            let named = if mark.len() == 3 { vec![sa, sb, sc] } else { vec![sb, sc] };
            lab.rotate(Some((k, named)), &[0]);
            let x = lab.cmip_act(0, pay());
            lab.sign(BEN, &x);
            let ok = !matches!(lab.consent(&x), Consent::Broken { .. });
            // Acknowledged: three voices, all three named meet it; two do not.
            // Not acknowledged: two voices remain, and both meet it.
            let expect = if acked { mark.len() == 3 } else { mark.len() == 2 };
            assert_eq!(ok, expect, "acked {acked}, mark {mark:?}");
        }
    }
}

/// 3.7i, Q6: a constitution of two of three removes a member who does not
/// sign.
#[test]
fn a_member_removed_where_the_constitution_allows_it() {
    let mut lab = Lab::new(&|t| t.constitutional = Some(Rule::Threshold(2)));
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|t| {
        t.parties = keep.clone();
        t.constitutional = Some(Rule::Threshold(2));
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares {
            threshold: 1,
            members: keep.clone(),
        };
        g.safety = Holding::Shares {
            threshold: 2,
            members: keep.clone(),
        };
    });
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    lab.rotate(Some((k, vec![sa, sb])), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k);
    assert!(lab.counts(&p));
}

/// F121 (freeze suite v21, 3.7q): a member removed keeps their stake as a
/// departed holder: the entry records who left and their stake, nothing
/// else. The departed holder has no voice; the stake never shrinks without
/// the holder's signature (rule 46).
#[test]
fn a_departed_holders_stake_never_shrinks_without_them() {
    let mut lab = Lab::new(&|t| t.constitutional = Some(Rule::Threshold(2)));
    let f = lab.founding;
    let ids = lab.ids();
    let cy = ids[CY];
    let keep = vec![ids[ANA], ids[BEN]];
    // The label's stake in itself (null, S1): Ana, Ben, and Cy at `share`.
    let (ana, ben) = (ids[ANA], ids[BEN]);
    let own = move |share: u64| law::Stake {
        object: Who::This,
        holders: vec![(Who::Id(ana), 1_000_000 - share - 375_000), (Who::Id(ben), 375_000), (Who::Id(cy), share)],
    };
    let out = |share: u64| -> Box<dyn Fn(&mut Terms)> {
        let keep = keep.clone();
        Box::new(move |t: &mut Terms| {
            t.parties = keep.clone();
            t.constitutional = Some(Rule::Threshold(2));
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares { threshold: 1, members: keep.clone() };
            g.safety = Holding::Shares { threshold: 2, members: keep.clone() };
            t.stakes = Some(vec![own(share)]);
            t.departed = Some(vec![cy]);
        })
    };
    // Cy removed, keeping a quarter of the label's income.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &*out(250_000));
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    lab.rotate(Some((k, vec![sa, sb])), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k);
    // No voice: a mark naming the departed holder is invalid.
    let t = lab.clone_terms(&k, vec![(Power::Constitutional, vec![ANA, CY])], &|t| t.text = "Other words.".into());
    let x = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&x).unwrap().invalid.is_some());
    // The two members lower Cy's stake (field 7, N5): without Cy's
    // signature, a draft (rule 46). Stakes are operational: the clone rule.
    let lower = move |share: u64| -> Box<dyn Fn(&mut Terms)> { Box::new(move |t: &mut Terms| t.stakes = Some(vec![own(share)])) };
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &*lower(100_000));
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    assert!(!lab.view().agreement(&k2).unwrap().ready, "Cy has not signed");
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), None, "nothing in force without Cy");
    // Raising it needs no signature of Cy's (Ana's share is lowered: hers).
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &*lower(300_000));
    let k3 = lab.propose(ANA, &t);
    lab.sign(ANA, &k3);
    lab.sign(BEN, &k3);
    assert!(lab.view().agreement(&k3).unwrap().ready);
    // Lowered with Cy's signature named too: in force.
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &*lower(100_000));
    let k4 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k4);
    let s2 = lab.sign(BEN, &k4);
    let s3 = lab.sign(CY, &k4);
    assert!(lab.view().agreement(&k4).unwrap().ready);
    let r = lab.record(0, Some((k4, vec![s1, s2, s3])), &[], vec![], k4);
    assert_eq!(puts(&lab, &r), Some(k4));
}

// ---------------------------------------------------------------- areas, freezes, grants

/// 3.7c, 3.7m, Q13, Q17, Q22, Flaw N, A6; F128 (grant keys, G2, replacing
/// C8): a grant hands its grantee a grant key, accepted by the grantee's
/// signature; the grantee's acts are a strand of the label's actions chain,
/// citing their grant. A departure that empties the area ends every grant
/// in it, a decision ending powers: an act the line's history holds
/// binds; one racing it, or after it, is void, the ending winning; one the
/// label acknowledged binds (A6). Reinstating is cloning the ended grant,
/// which takes nothing on.
#[test]
fn an_emptied_area_ends_its_grants() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let env = mips().envelope;
    let mut publisher = lab.w.genesis("publisher", vec![own_home()], None, None);
    let mut agent = lab.w.genesis("agent", vec![own_home()], None, None);
    let pubs = Kind::Type { spec: env, type_: 0 };
    let g = |who: Hash| Grant {
        grantee: who,
        scope: 2,
        agreements: None,
        this_agreement: false,
        limits: None,
        limits_cmip: None,
        area: Some(1),
        kinds: Some(vec![pubs.clone()]),
        reinstates: None,
        by_this: false,
        key: grant_key(&format!("{who:?}")).1,
    };
    let g1 = lab.grant(&g(publisher.id));
    lab.sign(ANA, &g1);
    let g2 = lab.grant(&g(agent.id));
    lab.sign(ANA, &g2);
    // A grant reaching Finance acts, outside the area: invalid (3.7c).
    let mut bad = g(publisher.id);
    bad.kinds = Some(vec![Kind::Layer(law::layers::FINANCE)]);
    let g3 = lab.grant(&bad);
    lab.sign(ANA, &g3);
    assert!(matches!(lab.consent(&g3), Consent::Invalid { .. }));

    let mut pubs_strand = lab.strand(g1, &key_of(publisher.id));
    let mut agent_strand = lab.strand(g2, &key_of(agent.id));
    let under = |lab: &mut Lab, st: &mut Person, spec: Hash| -> Hash {
        let a = lab.w.everyday_act(st, spec, 0, vec![], None, None);
        lab.w.add(&a)
    };
    // Not yet accepted by its grantee: the key backs nothing (F128).
    let early = under(&mut lab, &mut pubs_strand, env);
    assert!(matches!(lab.view().backing(&early).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("accept")));
    sign(&mut lab.w, &mut publisher, &g1);
    sign(&mut lab.w, &mut agent, &g2);
    let p1 = under(&mut lab, &mut pubs_strand, env);
    assert_eq!(lab.view().backing(&p1).unwrap(), Backing::Backed { grant: g1 });
    assert!(matches!(lab.consent(&p1), Consent::Granted { .. }));
    // Not citing its grant: on no chain of the label, not backed.
    let loose = {
        let mut st = lab.strand(g1, &key_of(publisher.id));
        st.cite = None;
        let a = lab.w.everyday_act(&mut st, env, 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.view().backing(&loose).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("F128")));
    // Signed with another key than the grant's: not the label's act.
    let forged = {
        let mut st = lab.strand(g1, &key_of(agent.id));
        let a = lab.w.everyday_act(&mut st, env, 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&forged).unwrap(), Backing::NotUnderGrant);
    assert_eq!(lab.w.v.status(&forged), Status::Scoped);
    // Another publication, which the label's next act cites as the head it
    // joins (F127).
    let joined = under(&mut lab, &mut pubs_strand, env);
    let o = lab.chain(&[joined]);
    let a = lab.w.everyday_act(&mut lab.c[0], pay(), 0, vec![], Some(o), None);
    lab.w.add(&a);
    // An act beyond the grant's reach is not backed.
    let off = {
        let mut st = lab.strand(g1, &key_of(publisher.id));
        let a = lab.w.everyday_act(&mut st, pay(), 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.view().backing(&off).unwrap(), Backing::NotBacked { .. }));
    // The agent's deals A, B, C, on the agent's strand; the label
    // acknowledges B.
    let mut agent2 = agent_strand.clone();
    let da = under(&mut lab, &mut agent_strand, env);
    let db = under(&mut lab, &mut agent2, env);
    let mut agent3 = lab.strand(g2, &key_of(agent.id));
    let dc = under(&mut lab, &mut agent3, env);
    lab.adopt(0, db);

    // Ana steps down at once; the label registers it: the area is empty,
    // and every grant in it ends (G2).
    let mut ana = lab.m[ANA].clone();
    let res = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    lab.record(0, None, &[], vec![res], f);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, true, false, vec![])]);
    let dd = under(&mut lab, &mut agent_strand, env);
    let p2 = under(&mut lab, &mut pubs_strand, env);
    let v = lab.view();
    assert_eq!(v.backing(&db).unwrap(), Backing::Binds { grant: g2 }, "A6");
    for d in [da, dc, dd] {
        assert!(matches!(v.backing(&d).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G2")), "{d:?}");
    }
    // Done within the grant's powers, and held by the history of the line
    // that emptied the area: it binds. So does what comes before it on the
    // same strand.
    assert_eq!(v.backing(&joined).unwrap(), Backing::Binds { grant: g1 });
    assert_eq!(v.backing(&p1).unwrap(), Backing::Binds { grant: g1 });
    assert!(matches!(v.backing(&p2).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G2")));
    // Ana keeps the rest of her voice.
    let r = lab.cmip_act(0, pay());
    lab.sign(BEN, &r);
    assert!(lab.counts(&r));

    // A reinstatement made before the refit counts for nothing.
    let mut early = g(publisher.id);
    early.reinstates = Some(g1);
    let re0 = lab.grant(&early);
    lab.sign(CY, &re0);
    assert!(!lab.counts(&re0));

    // The refit: a constitutional clone gives the area to Cy, who signs it.
    let ids = lab.ids();
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].holders = vec![ids[CY]];
    });
    let k = lab.propose(BEN, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.rotate(Some((k, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(CY, &p);
    assert!(lab.counts(&p), "the publications count again, with the new holder");
    // A signature on the ended grant itself reinstates nothing (C1).
    lab.sign(CY, &g1);
    assert!(matches!(lab.view().backing(&p2).unwrap(), Backing::NotBacked { .. }));
    // A reinstatement whose fields differ is invalid.
    let mut wrong = g(agent.id);
    wrong.reinstates = Some(g1);
    let rw = lab.grant(&wrong);
    lab.sign(CY, &rw);
    assert!(matches!(lab.consent(&rw), Consent::Invalid { .. }));
    // The reinstatement, after the refit, completed by the new holder: a
    // clone of the ended grant with a key of its own, which the grantee
    // accepts. It takes nothing on (G2).
    let (k2, pk2) = grant_key("publisher, again");
    let mut again = g(publisher.id);
    again.reinstates = Some(g1);
    again.key = pk2;
    let re = lab.grant(&again);
    assert!(!lab.counts(&re));
    lab.sign(CY, &re);
    assert!(lab.counts(&re));
    sign(&mut lab.w, &mut publisher, &re);
    let mut st = lab.strand(re, &k2);
    let p3 = under(&mut lab, &mut st, env);
    assert_eq!(lab.view().backing(&p3).unwrap(), Backing::Backed { grant: re });
    assert!(matches!(lab.view().backing(&p2).unwrap(), Backing::NotBacked { .. }), "taken on by nothing");
    // The agent's grant, not reinstated: B binds, D stays void.
    assert_eq!(lab.view().backing(&db).unwrap(), Backing::Binds { grant: g2 });
    assert!(matches!(lab.view().backing(&dd).unwrap(), Backing::NotBacked { .. }));
}

/// F128, G1: a revocation is a decision ending powers; it removes the grant
/// key. A grantee's act its history holds binds; one racing it (neither
/// citing the other) or after it is void, the ending winning, unless the
/// collective itself acknowledges it (A6). A revocation of a grant within
/// an area counts only with that area's holders (Q29).
#[test]
fn a_revocation_ends_the_grant_key() {
    let mut lab = Lab::new(&|_| {});
    let env = mips().envelope;
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let grant = Grant {
        area: Some(1),
        kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
        ..plain_grant(agent.id, false)
    };
    let g = lab.grant(&grant);
    lab.sign(ANA, &g);
    sign(&mut lab.w, &mut agent, &g);
    let mut s1 = lab.strand(g, &key_of(agent.id));
    let mut s2 = s1.clone();
    let act = |lab: &mut Lab, st: &mut Person| -> Hash {
        let a = lab.w.everyday_act(st, env, 0, vec![], None, None);
        lab.w.add(&a)
    };
    let cited = act(&mut lab, &mut s1);
    let racing = act(&mut lab, &mut s2);
    // The revocation, on device 0, citing the head it saw (the cited act).
    let rev = |lab: &mut Lab| -> Hash {
        let o = lab.chain(&[cited]);
        let a = lab.w.everyday_act(&mut lab.c[0], mips().law, law::types::REVOCATION, law::Revocation { grant: g }.to_map(), Some(o), None);
        lab.w.add(&a)
    };
    let r = rev(&mut lab);
    // Not yet completed by the area's holder: it counts for nothing (Q29).
    assert!(!lab.counts(&r));
    assert_eq!(lab.view().backing(&racing).unwrap(), Backing::Backed { grant: g });
    lab.sign(ANA, &r);
    assert!(lab.counts(&r));
    let v = lab.view();
    assert_eq!(v.backing(&cited).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(v.backing(&racing).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G1")));
    drop(v);
    // After it, citing it: void.
    s1.cite.as_mut().unwrap().1.push(r);
    let after = act(&mut lab, &mut s1);
    assert!(matches!(lab.view().backing(&after).unwrap(), Backing::NotBacked { .. }));
    // A witness act of the label acknowledging the racing act adopts
    // nothing: on neither chain (F142, rule 42). An action of the label's
    // own key on its chain, citing it, adopts it (A6; F131, IT2a).
    lab.ack(0, racing);
    assert!(matches!(lab.view().backing(&racing).unwrap(), Backing::NotBacked { .. }), "a witness act adopts nothing (F142)");
    lab.adopt(0, racing);
    assert_eq!(lab.view().backing(&racing).unwrap(), Backing::Binds { grant: g });
    // H3 (F129): no handover. Another grantee manages the adopted act
    // under its own grant (scope 1, naming it), with its own grant key;
    // the revoked key signs nothing more.
    let mut sofia = lab.w.genesis("sofia", vec![own_home()], None, None);
    let (ks, ps) = grant_key("sofia");
    let gs = lab.grant(&Grant { grantee: sofia.id, scope: 1, agreements: Some(vec![racing]), key: ps, ..grant.clone() });
    lab.sign(ANA, &gs);
    sign(&mut lab.w, &mut sofia, &gs);
    let mut s3 = lab.strand(gs, &ks);
    // Managing it: her act names it (rule 38, scope 1; audit, October
    // 2026, gap 9). One naming nothing of it is beyond her scope.
    let managed = {
        let a = lab.w.everyday_act(&mut s3, env, 0, vec![], obj(racing), None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&managed).unwrap(), Backing::Backed { grant: gs });
    let unrelated = act(&mut lab, &mut s3);
    assert!(matches!(lab.view().backing(&unrelated).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("scope 1")));
    let marco_again = act(&mut lab, &mut s1);
    assert!(matches!(lab.view().backing(&marco_again).unwrap(), Backing::NotBacked { .. }));
}

/// Law rule 38 and grant fields 1 to 4 (audit, October 2026, gaps 9 and
/// 10). A grant's scope limits what its key signs within its kinds: scope 1
/// manages the agreements it names (field 2), in any version, and backs
/// nothing else; scope 0 signs new deals, and backs no receipt; scope 2
/// acts for the grantor, and signs no agreement. A grant carrying limits
/// (fields 3 and 4) under a cMIP this verifier does not implement backs
/// nothing for certain: the answer is unknown, never "backed" (rule 18d);
/// the collective's own adoption still binds (rule 40).
#[test]
fn a_grant_reaches_only_its_scope_and_its_limits_answer_unknown() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    let env = mips().envelope;
    let mut friend = lab.w.genesis("a friend", vec![own_home()], None, None);
    let fid = friend.id;
    // Two deals the label is party to, held: one the manager is hired for.
    let mut d1 = deal_terms(fid, label);
    d1.text = "The first deal.".into();
    let deal1 = law_act(&mut lab.w, &mut friend, law::types::TERMS, d1.to_map(), None);
    let mut d2 = deal_terms(fid, label);
    d2.text = "The second deal.".into();
    let deal2 = law_act(&mut lab.w, &mut friend, law::types::TERMS, d2.to_map(), None);
    let mut manager = lab.w.genesis("a manager", vec![own_home()], None, None);
    let (km, pm) = grant_key("the manager's key");
    let gm = lab.grant(&Grant {
        scope: 1,
        agreements: Some(vec![deal1]),
        area: Some(2),
        kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]),
        key: pm,
        ..plain_grant(manager.id, false)
    });
    lab.sign(BEN, &gm);
    sign(&mut lab.w, &mut manager, &gm);
    let mut sm = lab.strand(gm, &km);
    let rc = |fulfils: Hash| {
        Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 40 },
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: fulfils, line: fulfils }),
        })
        .to_map()
    };
    let add = |lab: &mut Lab, st: &mut Person, p: Vec<(Value, Value)>| {
        let a = lab.w.everyday_act(st, mips().finance, 2, p, None, None);
        lab.w.add(&a)
    };
    let reason = |lab: &Lab, x: &Hash| match lab.view().backing(x).unwrap() {
        Backing::NotBacked { reason, .. } => Some(reason),
        _ => None,
    };
    // Money under the deal the grant names: backed. Under the other deal:
    // beyond the grant's scope, within its kinds (gap 9).
    let under1 = add(&mut lab, &mut sm, rc(deal1));
    assert_eq!(reason(&lab, &under1), None, "{:?}", lab.view().backing(&under1));
    let under2 = add(&mut lab, &mut sm, rc(deal2));
    assert!(reason(&lab, &under2).is_some_and(|r| r.contains("scope 1")), "{:?}", lab.view().backing(&under2));
    // A later version of the named deal is the same deal.
    let mut c1 = d1.clone();
    c1.parent = Some(deal1);
    c1.text = "The first deal, amended.".into();
    c1.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![fid, label]) }]);
    let deal1b = law_act(&mut lab.w, &mut friend, law::types::TERMS, c1.to_map(), obj(deal1));
    let under1b = add(&mut lab, &mut sm, rc(deal1b));
    assert_eq!(reason(&lab, &under1b), None, "{:?}", lab.view().backing(&under1b));
    // Scope 0, signing new deals: the terms of a new deal, backed; a
    // receipt, not.
    let mut signer = lab.w.genesis("a deal signer", vec![own_home()], None, None);
    let (ks, ps) = grant_key("the deal signer's key");
    let gs = lab.grant(&Grant { scope: 0, key: ps, ..plain_grant(signer.id, false) });
    sign(&mut lab.w, &mut signer, &gs);
    let mut ss = lab.strand(gs, &ks);
    let new_deal = {
        let mut d = deal_terms(label, fid);
        d.text = "A new deal the signer drafts.".into();
        let a = lab.w.everyday_act(&mut ss, mips().law, law::types::TERMS, d.to_map(), None, None);
        lab.w.add(&a)
    };
    assert_eq!(reason(&lab, &new_deal), None, "{:?}", lab.view().backing(&new_deal));
    let spent = {
        let a = lab.w.everyday_act(&mut ss, spec("a deal cMIP"), 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert!(reason(&lab, &spent).is_some_and(|r| r.contains("scope 0")));
    // Scope 2, acting for the grantor: no agreement.
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let g2 = lab.grant(&plain_grant(agent.id, false));
    sign(&mut lab.w, &mut agent, &g2);
    let mut sa = lab.strand(g2, &key_of(agent.id));
    let drafted = {
        let a = lab.w.everyday_act(&mut sa, mips().law, law::types::TERMS, deal_terms(label, fid).to_map(), None, None);
        lab.w.add(&a)
    };
    assert!(reason(&lab, &drafted).is_some_and(|r| r.contains("scope 2")));
    let posted = {
        let a = lab.w.everyday_act(&mut sa, spec("a deal cMIP"), 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert_eq!(reason(&lab, &posted), None);
    // Limits (gap 10): a grant carrying them answers unknown, and its acts
    // count for nothing until a verifier can read them.
    let mut capped = lab.w.genesis("a capped agent", vec![own_home()], None, None);
    let (kc, pc) = grant_key("the capped agent's key");
    let gc = lab.grant(&Grant {
        area: Some(1),
        kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
        limits: Some(Value::Uint(1000)),
        limits_cmip: Some(spec("a limits cMIP")),
        key: pc,
        ..plain_grant(capped.id, false)
    });
    lab.sign(ANA, &gc);
    sign(&mut lab.w, &mut capped, &gc);
    let mut sc = lab.strand(gc, &kc);
    let within = {
        let a = lab.w.everyday_act(&mut sc, env, 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.view().backing(&within).unwrap(), Backing::Unknown { grant, ref reason } if grant == gc && reason.contains("18d")), "{:?}", lab.view().backing(&within));
    assert!(matches!(lab.consent(&within), Consent::Unknown { .. }));
    assert!(!lab.counts(&within));
    // The label adopts it by an action citing it: it binds (rule 40).
    lab.adopt(0, within);
    assert_eq!(lab.view().backing(&within).unwrap(), Backing::Binds { grant: gc });
}

/// F128, W6: a collective's negotiation message is talk: it binds nothing,
/// sits on neither chain, and need not be sealed to every member.
#[test]
fn a_collectives_negotiation_is_talk() {
    let mut lab = Lab::new(&|_| {});
    let other = lab.w.genesis("a buyer", vec![own_home()], None, None);
    let saved = lab.c[0].cite.take();
    let m = lab.w.private_act(
        &mut lab.c[0],
        mips().law,
        law::types::NEGOTIATION,
        law::NegotiationMessage { text: "Shall we?".into(), format: None, follows: None, acks: None }.to_map(),
        None,
        vec![other.id],
    );
    lab.c[0].cite = saved;
    assert_eq!(lab.consent(&m), Consent::Talk);
}

/// 3.7m, Q17: one of two holders steps down; the other carries on, and the
/// area's grants with it.
#[test]
fn co_holders_carry_on() {
    let ben_cy = |t: &mut Terms| {
        let p = t.parties.clone();
        t.areas.as_mut().unwrap()[1].holders = vec![p[BEN], p[CY]];
        t.areas.as_mut().unwrap()[1].threshold = 2;
    };
    let mut lab = Lab::new(&ben_cy);
    let f = lab.founding;
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, Some(2));
    let x = lab.cmip_act(0, pay());
    lab.record(0, None, &[], vec![res], f);
    let y = lab.cmip_act(0, pay());
    lab.sign(CY, &y);
    assert!(lab.counts(&y), "two deciding together, one left: the other alone (flaw C)");
    lab.sign(BEN, &x);
    assert!(!lab.counts(&x), "before the line: both needed");
    lab.sign(CY, &x);
    assert!(lab.counts(&x));
}

/// Q26, Q32: an area's number and id through clones.
#[test]
fn an_area_keeps_its_number_and_its_id() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.areas.as_mut().unwrap()[1].holders = vec![p[BEN], p[CY]];
        t.areas.as_mut().unwrap()[1].threshold = 2;
    });
    let f = lab.founding;
    let ids = lab.ids();
    // Taking a holder off and keeping the number above the one left: valid.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[1].holders = vec![ids[CY]];
    });
    let k = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_none());
    // Raising a number above the holders: invalid.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].threshold = 2;
    });
    let k = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some());
    // Dropping area 1, then giving its id to a new area: invalid.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap().remove(0);
        t.area_words = None;
    });
    let k1 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k1).unwrap().invalid.is_none());
    let env = mips().envelope;
    let t = lab.clone_terms(&k1, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap().push(Area {
            name: "Books".into(),
            holders: vec![ids[ANA]],
            threshold: 1,
            kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
            fields: None,
            id: 1,
        });
    });
    let k2 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k2).unwrap().invalid.is_some(), "a retired id");
}

// ---------------------------------------------------------------- 7o: the ordering stories

/// `attack_concurrent_lines` and `agreement_fork_status_quo` (A4, Q38).
#[test]
fn concurrent_lines() {
    // One departure registered twice, on two devices neither naming the other.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let x_named = lab.cmip_act(0, pay());
    let x_unnamed = lab.cmip_act(0, pay());
    lab.sign(BEN, &x_named);
    lab.sign(BEN, &x_unnamed);
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    // Device 1 names device 0's tip only as far as `x_named`.
    let mut early = lab.c[0].clone();
    early.seq.truncate(early.seq.len() - 1);
    let kept = vec![tip(&early)];
    let r = Record {
        clone: None,
        signatures: None,
        kept,
        registers: Some(vec![res]),
    };
    let a = lab.w.everyday_act(&mut lab.c[1], mips().law, law::types::RECORD, r.to_map(), obj(f), None);
    lab.w.add(&a);
    lab.record(0, None, &[], vec![res], f);
    assert!(lab.counts(&x_named), "before both lines");
    assert!(!lab.counts(&x_unnamed), "after one of them: after the departure");

    // Two sibling clones recorded on two devices: the parent stays.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut ks = vec![];
    for (d, w) in [(0, "Weekly."), (1, "Daily.")] {
        let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
        let k = lab.propose(BEN, &t);
        let s = lab.sign(BEN, &k);
        let r = lab.record(d, Some((k, vec![s])), &[], vec![], k);
        assert_eq!(puts(&lab, &r), Some(k));
        ks.push(k);
    }
    let x = lab.cmip_act(2, pay());
    assert_eq!(lab.in_force(&x), f, "two concurrent records: a fork, the parent stays");
    assert!(lab.view().current(&lab.c[0].id).unwrap().unwrap().fork);
    // Recorded one after the other instead: the second puts nothing.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut rs = vec![];
    for w in ["Weekly.", "Daily."] {
        let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
        let k = lab.propose(BEN, &t);
        let s = lab.sign(BEN, &k);
        rs.push((lab.record(0, Some((k, vec![s])), &[], vec![], k), k));
    }
    assert_eq!(puts(&lab, &rs[0].0), Some(rs[0].1));
    assert_eq!(puts(&lab, &rs[1].0), None, "its parent is no longer in force");
    let _ = ks;
}

/// `attack_omitted_fork_and_the_keeper`, `attack_backdated_fork` (C4, Q34).
#[test]
fn an_omitted_fork_a_keeper_and_a_backdated_fork() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    // A receipt on device 1, which the line leaves out.
    let x = lab.cmip_act(1, pay());
    lab.sign(BEN, &x);
    let fork_point = lab.c[0].clone();
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    let line = lab.record(0, None, &[], vec![res], f);
    assert!(!lab.counts(&x), "left out: counts as made after the line");
    // The label's keeper recorded the receipt before the line.
    let kp = lab.keeper.id;
    lab.keeper_logs = vec![(kp, vec![x, line])];
    assert!(lab.counts(&x), "placed by the keeper (C4)");
    // A keeper never places a member's signature: tested in
    // `a_departure_takes_effect_at_the_labels_line` (the signature placed
    // only by the collective's acts).
    lab.keeper_logs = vec![(kp, vec![line, x])];
    assert!(!lab.counts(&x), "recorded after the line: nothing");

    // Backdated: after the line, a fork from an act before it.
    lab.keeper_logs = vec![];
    let mut fork = fork_point;
    let a = lab.w.everyday_act(&mut fork, pay(), 0, vec![], None, None);
    let y = lab.w.add(&a);
    lab.sign(BEN, &y);
    assert!(!lab.counts(&y));
}

/// Q34: the keepers that place the label's acts are those of the agreement
/// in force for the line.
#[test]
fn the_keepers_of_the_agreement_in_force_place() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let x = lab.cmip_act(1, pay());
    lab.sign(BEN, &x);
    let k2 = lab.w.genesis("keeper two", vec![own_home()], None, None);
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.keepers = Some(Keepers {
            operators: vec![k2.id],
            rule: Rule::All,
        });
    });
    let k = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.record(0, Some((k, s)), &[], vec![], k);
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, k, None);
    let line = lab.record(0, None, &[], vec![res], k);
    let old = lab.keeper.id;
    lab.keeper_logs = vec![(old, vec![x, line])];
    assert!(!lab.counts(&x), "the replaced keeper places nothing {:?}", lab.consent(&x));
    lab.keeper_logs = vec![(k2.id, vec![x, line])];
    assert!(lab.counts(&x));
}

/// `c5_member_rotation_registered_on_the_line` and Q33.
#[test]
fn a_members_own_rotation_is_registered_on_the_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut tablet = device(&lab.m[BEN]);
    lab.cmip_act(0, pay()); // the phone signs something first, to keep a tip
    let p0 = lab.m[BEN].clone();
    let x = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut tablet, &x);
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(ANA, &t);
    let sk = sign(&mut lab.w, &mut tablet, &k);
    let r = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // A clone the tablet signs that no act of the label places before the line.
    let t2 = lab.clone_terms(&k, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Daily."));
    let k2 = lab.propose(ANA, &t2);
    let sk2 = sign(&mut lab.w, &mut tablet, &k2);
    // Ben rotates his own key and forgets the tablet.
    let _ = p0;
    let (rot, ben2) = lab.w.rotate(&lab.m[BEN], Rot::default());
    lab.m[BEN] = ben2;
    assert_eq!(lab.w.v.status(&sk), Status::Void);
    assert!(!lab.counts(&x), "Identity takes the tablet's signature back");
    // The label registers the rotation on its line.
    lab.record(0, None, &[], vec![rot], k);
    assert!(lab.counts(&x), "placed before the line: kept for the label (C5)");
    assert_eq!(puts(&lab, &r), Some(k), "the clone stays in force (Q33)");
    let r2 = lab.record(0, Some((k2, vec![sk2])), &[], vec![], k2);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Invalid(_)), "judged by Identity alone");
    // An old-key signature on a receipt after the line does not count.
    let y = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut tablet, &y);
    assert!(!lab.counts(&y));
    lab.sign(BEN, &y);
    assert!(lab.counts(&y), "the new key does");
}

// ---------------------------------------------------------------- open formats

#[test]
fn open_formats_are_refused_not_guessed() {
    // An import (type 11): its format is open. A revocation's is exact
    // since F128: one naming no grant is invalid.
    let mut lab = Lab::new(&|_| {});
    let a = lab
        .w
        .everyday_act(&mut lab.c[0], mips().law, law::types::IMPORT, vec![], None, None);
    let x = lab.w.add(&a);
    assert!(matches!(lab.view().consent(&x), Err(LawError::Unsupported(_))));
    let a = lab
        .w
        .everyday_act(&mut lab.c[0], mips().law, law::types::REVOCATION, vec![], None, None);
    let x = lab.w.add(&a);
    assert!(matches!(lab.view().consent(&x), Ok(Consent::Invalid { .. })));
    // A record registering a declaration not in the format is no line.
    let f = lab.founding;
    let mut auth = lab.authority.clone();
    let d = law_act(&mut lab.w, &mut auth, law::types::DECLARATION, vec![], obj(f));
    let r = lab.record(0, None, &[], vec![d], f);
    assert!(!lab.view().record(&lab.c[0].id, &r).unwrap().line);
}

// ---------------------------------------------------------------- Law draft 8: B1, B11

/// Flaw B1: a rotation that declares nothing carries forward the agreement
/// in force, recorded clones included; it changes keys, not rules.
#[test]
fn a_rotation_declaring_nothing_carries_the_agreement_forward() {
    // B5: a rotation declares only a constitutional clone.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let s = lab.sign(BEN, &k);
    lab.rotate(Some((k, vec![s])), &[0]);
    let x = lab.publish(0);
    assert!(matches!(lab.consent(&x), Consent::Broken { reason } if reason.contains("B5")));

    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    // The treasurer adopts a second payment cMIP alone; the label records it.
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay2()), (11, anchor())];
    });
    let k = lab.propose(BEN, &t);
    let s = lab.sign(BEN, &k);
    lab.record(0, Some((k, vec![s])), &[], vec![], k);
    // The label rotates its keys, declaring nothing.
    lab.rotate(None, &[0]);
    let x = lab.cmip_act(0, pay2());
    assert_eq!(lab.in_force(&x), k, "the recorded clone is still in force");
    assert!(!lab.counts(&x), "a receipt of the adopted rail needs the treasurer");
    lab.sign(BEN, &x);
    assert!(lab.counts(&x), "and counts with the treasurer, under the new key");
    // A further record under the new key follows the agreement chain from k.
    let t2 = lab.clone_terms(&k, vec![(Power::Area(2), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay3()), (11, anchor())];
    });
    let k2 = lab.propose(BEN, &t2);
    let s2 = lab.sign(BEN, &k2);
    let r2 = lab.record(0, Some((k2, vec![s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r2), Some(k2));
    // A rotation declaring a constitutional clone must descend from k2,
    // the agreement in force carried forward: one of the founding terms
    // breaks the label (rule 37).
    let t3 = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.text = "The label publishes records and books.".into();
    });
    let k3 = lab.propose(ANA, &t3);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k3)).collect();
    lab.rotate(Some((k3, sigs)), &[0]);
    let y = lab.publish(0);
    assert!(matches!(lab.consent(&y), Consent::Broken { .. }));
}

/// Rule 47, B11: two sibling clones recorded on concurrent lines are a
/// fork, the parent in force; a clone of either branch, recorded after
/// both lines, resolves it. One recorded after only one line does not.
#[test]
fn a_clone_of_one_branch_recorded_after_both_lines_resolves_the_fork() {
    for after_both in [true, false] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let mut ks = vec![];
        for (d, w) in [(0, "Weekly."), (1, "Daily.")] {
            let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
            let k = lab.propose(BEN, &t);
            let s = lab.sign(BEN, &k);
            lab.record(d, Some((k, vec![s])), &[], vec![], k);
            ks.push(k);
        }
        let x = lab.cmip_act(2, pay());
        assert_eq!(lab.in_force(&x), f, "a fork: the parent stays");
        // A clone of the weekly branch.
        let t = lab.clone_terms(&ks[0], vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly, on Mondays."));
        let k3 = lab.propose(BEN, &t);
        let s3 = lab.sign(BEN, &k3);
        // After both lines: on device 0, naming device 1's tip. After one
        // only: on device 0, naming nothing else.
        let tips: &[usize] = if after_both { &[1] } else { &[] };
        let r3 = lab.record(0, Some((k3, vec![s3])), tips, vec![], k3);
        assert_eq!(puts(&lab, &r3), Some(k3), "it puts its clone in force at its own line");
        let e = lab.view().record(&lab.c[0].id, &r3).unwrap();
        assert_eq!(e.resolves, after_both);
        // Seen from an act after all three lines.
        let y = lab.cmip_act(2, pay());
        let all = lab.record(2, None, &[0, 1], vec![], f);
        let _ = all;
        let z = lab.cmip_act(2, pay());
        let want = if after_both { k3 } else { f };
        assert_eq!(lab.in_force(&z), want, "after both {after_both}");
        let _ = y;
    }
}

/// B11, read with rule 37c (one clone at a time): where a branch moved on
/// before the resolving record, only a clone of its latest clone resolves
/// the fork; a clone of the branch's first clone puts nothing in force.
/// (Found by the ordering simulation's sweep of fork worlds.)
#[test]
fn a_fork_is_resolved_from_the_latest_clone_of_a_branch() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let area = |lab: &Lab, parent: &Hash, w: &str| lab.clone_terms(parent, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
    let t1 = area(&lab, &f, "Weekly.");
    let k1 = lab.propose(BEN, &t1);
    let s1 = lab.sign(BEN, &k1);
    lab.record(0, Some((k1, vec![s1])), &[], vec![], k1);
    let t2 = area(&lab, &f, "Daily.");
    let k2 = lab.propose(BEN, &t2);
    let s2 = lab.sign(BEN, &k2);
    lab.record(1, Some((k2, vec![s2])), &[], vec![], k2);
    // The weekly branch moves on, on device 0, which has not heard of device 1.
    let t4 = area(&lab, &k1, "Weekly, on Mondays.");
    let k4 = lab.propose(BEN, &t4);
    let s4 = lab.sign(BEN, &k4);
    let r4 = lab.record(0, Some((k4, vec![s4])), &[], vec![], k4);
    assert_eq!(puts(&lab, &r4), Some(k4));
    // After both lines, a clone of the branch's first clone resolves nothing.
    let t3 = area(&lab, &k1, "Weekly, on Fridays.");
    let k3 = lab.propose(BEN, &t3);
    let s3 = lab.sign(BEN, &k3);
    let r3 = lab.record(0, Some((k3, vec![s3])), &[1], vec![], k3);
    assert_eq!(puts(&lab, &r3), None, "k4 is that branch's latest clone");
    // A clone of the latest clone does.
    let t5 = area(&lab, &k4, "Weekly, on Mondays, at noon.");
    let k5 = lab.propose(BEN, &t5);
    let s5 = lab.sign(BEN, &k5);
    let r5 = lab.record(0, Some((k5, vec![s5])), &[1], vec![], k5);
    assert_eq!(puts(&lab, &r5), Some(k5));
    assert!(lab.view().record(&lab.c[0].id, &r5).unwrap().resolves);
    let x = lab.cmip_act(0, pay());
    assert_eq!(lab.in_force(&x), k5);
}

// ---------------------------------------------------------------- Law draft 8: declared absence (B12)

impl Lab {
    /// An abandonment declaration (type 13, B12), by the named authority
    /// (`None`) or by a member.
    fn declare(&mut self, by: Option<usize>, agreement: Hash, clause: Hash, party: usize, outs: Vec<u64>) -> Hash {
        let d = AbsenceDeclaration {
            agreement,
            clause,
            party: self.m[party].id,
            outcomes: outs,
        };
        match by {
            None => {
                let mut a = self.authority.clone();
                let x = law_act(&mut self.w, &mut a, law::types::DECLARATION, d.to_map(), obj(agreement));
                self.authority = a;
                x
            }
            Some(i) => law_act(&mut self.w, &mut self.m[i], law::types::DECLARATION, d.to_map(), obj(agreement)),
        }
    }

    /// A clone adding a succession plan, signed by `who`, recorded at once.
    fn add_plan(&mut self, parent: &Hash, who: &[usize], plan: SuccessionPlan) -> Hash {
        let t = self.clone_terms(parent, vec![(Power::Judicial, who.to_vec())], &|t| {
            t.succession = Some(vec![plan.clone()]);
        });
        let k = self.propose(who[0], &t);
        let sigs: Vec<Hash> = who.iter().map(|i| self.sign(*i, &k)).collect();
        let r = self.record(0, Some((k, sigs)), &[], vec![], k);
        assert_eq!(puts(self, &r), Some(k));
        k
    }
}

/// 3.7k (F105, flaw C, Q28, C2, C7 and Flaw L): a declaration of absence
/// with outcome 0 takes effect at the label's line registering it.
#[test]
fn a_declaration_removes_a_voice_at_the_labels_line() {
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(3));
        // The Finance lane held by Ana and Ben, deciding together.
        let ids = t.parties.clone();
        let fin = &mut t.areas.as_mut().unwrap()[1];
        fin.holders = vec![ids[ANA], ids[BEN]];
        fin.threshold = 2;
    });
    let f = lab.founding;
    // Before the line: every member signs a judicial clone (F121),
    // recorded at once.
    let t1 = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("another arbitrator")]);
    });
    let k1 = lab.propose(ANA, &t1);
    let sa = lab.sign(ANA, &k1);
    let sb = lab.sign(BEN, &k1);
    let sc = lab.sign(CY, &k1);
    let r1 = lab.record(0, Some((k1, vec![sa, sb, sc])), &[], vec![], k1);
    // A year of receipts, both treasurers signing.
    let early = lab.cmip_act(0, pay());
    lab.sign(ANA, &early);
    lab.sign(BEN, &early);
    assert!(lab.counts(&early));
    // Ana also signs a second clone, which the label never acknowledges.
    let t2 = lab.clone_terms(&k1, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("a third arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t2);
    let sa2 = lab.sign(ANA, &k2);
    let sb2 = lab.sign(BEN, &k2);

    // Declarations that fail make no line: the wrong clause version, an
    // outcome the clause does not allow, the wrong signer.
    let bad = lab.declare(None, k1, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let rb = lab.record(0, None, &[], vec![bad], k1);
    assert!(!lab.view().record(&lab.c[0].id, &rb).unwrap().line, "Ana signed k1 last: its clause applies");
    let bad = lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED]);
    let rb = lab.record(0, None, &[], vec![bad], k1);
    assert!(!lab.view().record(&lab.c[0].id, &rb).unwrap().line, "outcome 1 is not allowed");
    let bad = lab.declare(Some(CY), f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let rb = lab.record(0, None, &[], vec![bad], k1);
    assert!(!lab.view().record(&lab.c[0].id, &rb).unwrap().line, "Cy is not the authority");
    // The authority declares Ana absent, naming the version before k1
    // (Q28); the label registers it at once: its line.
    let d = lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], k1);
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(e.line, "{:?}", e.not_a_line);
    assert_eq!(e.registers.len(), 1);
    // k1 stays in force, Ana counted as a voice for it (Q28).
    assert_eq!(clone_state(&lab, &r1), CloneState::Complete);
    let x = lab.cmip_act(0, pay());
    assert_eq!(lab.in_force(&x), k1);
    // The year of receipts keeps Ana's signature (Flaw L).
    assert!(lab.counts(&early));
    assert_eq!(areas(&lab.consent(&early))[0].3.len(), 2);
    // After the line, Ben alone meets the Finance lane (flaw C), and Ana's
    // signature counts for nothing.
    lab.sign(ANA, &x);
    assert!(!lab.counts(&x));
    lab.sign(BEN, &x);
    assert!(lab.counts(&x));
    assert_eq!(areas(&lab.consent(&x))[0].3, vec![lab.m[BEN].id]);
    // Ana's unacknowledged signature on k2, recorded after the line, counts
    // toward nothing: a mark naming her is invalid; Ben and Cy, every voice
    // that remains, meet it.
    let sc2 = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sa2, sb2, sc2])), &[], vec![], k2);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Invalid(_)));
    let t2b = lab.clone_terms(&k1, vec![(Power::Judicial, vec![BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("a third arbitrator")]);
    });
    let k2b = lab.propose(BEN, &t2b);
    let s1 = lab.sign(BEN, &k2b);
    let s2 = lab.sign(CY, &k2b);
    let r2b = lab.record(0, Some((k2b, vec![s1, s2])), &[], vec![], k2b);
    assert_eq!(puts(&lab, &r2b), Some(k2b));
    // Ana held the Releases area alone: it stands frozen from the line.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(areas(&lab.consent(&p))[0].1, "frozen");
    // Three of three, one voice removed: Ben and Cy change the constitution.
    let ids = lab.ids();
    let keep = vec![ids[BEN], ids[CY]];
    let auth = lab.authority.id;
    let t3 = lab.clone_terms(&k2b, vec![(Power::Constitutional, vec![BEN, CY])], &|t| {
        t.parties = keep.clone();
        t.constitutional = None;
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 1, members: keep.clone() };
        g.safety = Holding::Shares { threshold: 2, members: keep.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        let a = t.areas.as_mut().unwrap();
        a[0].holders = vec![keep[1]];
        a[1].holders = vec![keep[0]];
    });
    let k3 = lab.propose(BEN, &t3);
    let s1 = lab.sign(BEN, &k3);
    let s2 = lab.sign(CY, &k3);
    lab.rotate(Some((k3, vec![s1, s2])), &[0]);
    let y = lab.publish(0);
    lab.sign(CY, &y);
    assert_eq!(lab.in_force(&y), k3);
    assert!(lab.counts(&y));
    assert_eq!(
        lab.view().current(&lab.c[0].id).unwrap().unwrap().agreement,
        k3
    );
}

/// Law rules 50 to 52 (F172): with no absence-proof cMIP in the clause, a
/// declaration is the authority's judgment, checked for signer, outcome
/// and version only: the core reads no time. The label names a time
/// reference and nobody anchors anything; the declaration still counts and
/// the record registers it. Cy's liveness act on the agreement, made
/// before it, does not stop it: presence is shown, never proven by time in
/// the core (rule 50); a contest shows a wrongful declaration (rule 52).
#[test]
fn a_declaration_is_the_authoritys_judgment_with_no_anchors() {
    let mut lab = Lab::new(&|t| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
    });
    let f = lab.founding;
    let mut cy = lab.m[CY].clone();
    law_act(&mut lab.w, &mut cy, 12, vec![], obj(f));
    lab.m[CY] = cy;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    assert!(lab.view().declaration(&d).unwrap().is_ok(), "{:?}", lab.view().declaration(&d).unwrap().err());
    let line = lab.record(0, None, &[], vec![d], f);
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(e.line, "{:?}", e.not_a_line);
    assert_eq!(e.registers.len(), 1, "the record registers it, no anchor stated");
    // Cy's signature counts for nothing after the line.
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    lab.sign(CY, &x);
    assert_eq!(areas(&lab.consent(&x))[0].3, vec![lab.m[BEN].id]);
}

/// The reference absence-proof module, a period on the time reference
/// (F172): the clause names it in key 3. The core takes its answer from
/// the caller and reads no anchor itself: accepted for the record, the
/// declaration counts with no anchor stated to the core at all.
#[test]
fn under_a_period_module_the_core_reads_no_anchor() {
    use law::view::reference_absence_proof as reference;
    let mut lab = Lab::new(&|t| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.abandonment.as_mut().unwrap().proof = Some((reference::spec(), reference::params(30)));
    });
    let f = lab.founding;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    assert!(lab.view().declaration(&d).unwrap().is_ok(), "{:?}", lab.view().declaration(&d).unwrap().err());
    let line = lab.record(0, None, &[], vec![d], f);
    lab.accepted.push((d, line));
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert_eq!(e.registers.len(), 1, "{:?}", e.not_a_line);
}

/// Law draft 10, the abandonment format (F172): key 2, the period of
/// absence (F140), is retired and never reused: terms carrying it are
/// invalid, signed by every party or not. Key 3 is an absence-proof cMIP
/// and its parameters, `[hash, any]`, the parameters the cMIP's own.
#[test]
fn abandonment_key_2_is_retired_and_key_3_names_a_cmip() {
    let lab = Lab::new(&|_| {});
    let t = lab.view().terms(&lab.founding).unwrap();
    let with = |extra: (Value, Value)| -> Vec<(Value, Value)> {
        let mut m = t.to_map();
        for (k, v) in m.iter_mut() {
            if *k == Value::Uint(9) {
                let Value::Map(a) = v else { panic!("a map") };
                a.push(extra.clone());
            }
        }
        m
    };
    // Key 2: invalid.
    let got = Terms::decode(&(with((Value::Uint(2), Value::Uint(30)))));
    assert!(matches!(&got, Err(LawError::Shape(w)) if w.contains("key 2") && w.contains("F172")), "{got:?}");
    // Key 3: a cMIP and any parameters, carried as they are.
    let params = Value::Map(vec![(Value::Text("period".into()), Value::Uint(30))]);
    let pair = Value::Array(vec![Value::Bytes(spec("an absence-proof cMIP").to_vec()), params.clone()]);
    let got = Terms::decode(&(with((Value::Uint(3), pair)))).unwrap();
    assert_eq!(got.abandonment.as_ref().unwrap().proof, Some((spec("an absence-proof cMIP"), params)));
    assert_eq!(got.check(&mips()), Ok(()));
    // Not a pair, or no hash: invalid.
    for bad in [Value::Uint(30), Value::Array(vec![Value::Uint(1), Value::Uint(2)])] {
        assert!(Terms::decode(&(with((Value::Uint(3), bad.clone())))).is_err(), "{bad:?}");
    }
    // Signed by every member, terms carrying key 2 are still no agreement.
    let mut w = World::new();
    let mut m: Vec<Person> = ["a", "b"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let map = with((Value::Uint(2), Value::Uint(30)));
    let x = law_act(&mut w, &mut m[0], law::types::TERMS, map, None);
    for p in m.iter_mut() {
        sign(&mut w, p, &x);
    }
    assert!(view(&w).agreement(&x).is_err(), "key 2 makes the terms invalid");
}

/// F172, F178 (14): absence proof is a judicial task. The cMIP the clause
/// names for it serves no other task and is no extension.
#[test]
fn the_absence_proof_cmip_is_a_judge() {
    for (case, cmip) in [("the anchoring cMIP", anchor()), ("the payment cMIP", pay()), ("an extension", ext())] {
        let lab = Lab::new(&|_| {});
        let mut t = lab.view().terms(&lab.founding).unwrap();
        t.abandonment.as_mut().unwrap().proof = Some((cmip, Value::Null));
        let got = t.check(&mips());
        assert!(matches!(&got, Err(LawError::Check(w)) if w.contains("absence-proof")), "{case}: {got:?}");
    }
}

/// F182 item 14: absence proof is task 14, and a chain of judgment names
/// its cMIP as any judge: `[ 0, 14 ]` follows the cMIP the clause names in
/// key 3, and the specification taking over from it is a judge too, named
/// nowhere else. Field 2 does not name it: the clause does (a reading, in
/// the build's report). *Removal check: with task 14 not a judicial task a
/// chain can follow, the first assertion fails ("names no judge").*
#[test]
fn absence_proof_is_task_14_in_the_chain_of_judgment() {
    use mor_core::law::{ChainLink, Judge, ABSENCE_PROOF_TASK};
    assert_eq!(ABSENCE_PROOF_TASK, 14);
    let proof = spec("an absence-proof cMIP");
    let next = spec("an absence-proof cMIP taking over");
    let lab = Lab::new(&|_| {});
    let mut t = lab.view().terms(&lab.founding).unwrap();
    t.abandonment.as_mut().unwrap().proof = Some((proof, Value::Null));
    t.chain = Some(vec![ChainLink { judge: Judge::Task(14), next: vec![(next.into(), 30)] }]);
    assert_eq!(t.check(&mips()), Ok(()));
    assert_eq!(t.chain_of(&Judge::Task(14)), Some(vec![proof, next]));
    let back = Terms::decode(&t.to_map()).unwrap();
    assert_eq!(back.chain_of(&Judge::Task(14)), Some(vec![proof, next]), "read back from its bytes");
    // The one taking over is named nowhere else.
    let mut u = t.clone();
    u.cmips.push((9, next));
    u.cmips.sort();
    assert!(matches!(u.check(&mips()), Err(LawError::Check(w)) if w.contains("named nowhere else")));
    // No absence-proof cMIP in the clause: the chain follows no judge.
    let mut u = t.clone();
    u.abandonment.as_mut().unwrap().proof = None;
    assert!(matches!(u.check(&mips()), Err(LawError::Check(w)) if w.contains("no judge")));
    // Field 2 does not name it.
    let mut u = t.clone();
    u.cmips.push((14, proof));
    u.cmips.sort();
    assert!(matches!(u.check(&mips()), Err(LawError::Check(w)) if w.contains("key 3")), "{:?}", u.check(&mips()));
}

/// Law rule 51 (F172; F178 item 12): where the clause names an
/// absence-proof cMIP (key 3), the declaration counts only where that cMIP
/// accepted it, for the act using it. The core reads no cMIP: the
/// caller states its answer. Not accepted, or accepted for another act,
/// the record registers nothing; accepted for this record, it does. In a
/// deal, the same for the clone put in force under it.
#[test]
fn under_an_absence_proof_cmip_a_declaration_counts_only_where_accepted() {
    let proof = spec("an absence-proof cMIP");
    let mut lab = Lab::new(&|t| {
        t.abandonment.as_mut().unwrap().proof = Some((proof, Value::Text("its own parameters".into())));
    });
    let f = lab.founding;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    // Its own checks pass: signer, outcome, version.
    assert!(lab.view().declaration(&d).unwrap().is_ok());
    let r1 = lab.record(0, None, &[], vec![d], f);
    let e = lab.view().record(&lab.c[0].id, &r1).unwrap();
    assert!(e.registers.is_empty() && !e.line, "not accepted: it does not count");
    assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("absence-proof")), "{:?}", e.not_a_line);
    // Accepted for another act only: still nothing here.
    lab.accepted.push((d, spec("another record")));
    assert!(lab.view().record(&lab.c[0].id, &r1).unwrap().registers.is_empty());
    // Accepted for this record: it registers it.
    lab.accepted.push((d, r1));
    let e = lab.view().record(&lab.c[0].id, &r1).unwrap();
    assert_eq!(e.registers.len(), 1, "{:?}", e.not_a_line);

    // A deal: the clone without p3 completes only where the cMIP accepted
    // the declaration for that clone.
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let mut keeper = w.genesis("keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut deal = deal_terms(ids[0], ids[1]);
    deal.parties = ids.clone();
    deal.keepers = Some(Keepers { operators: vec![keeper.id], rule: Rule::All });
    deal.abandonment = Some(Abandonment {
        authority: Authority::Named(keeper.id),
        outcomes: vec![outcomes::VOICE_REMOVED],
        proof: Some((proof, Value::Null)),
    });
    assert_eq!(deal.check(&mips()), Ok(()));
    let x = law_act(&mut w, &mut m[0], law::types::TERMS, deal.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &x);
    }
    let mut c = deal.clone();
    c.parent = Some(x);
    c.text = "Two of us carry on.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ids[0], ids[1]]) }]);
    let two = law_act(&mut w, &mut m[0], law::types::TERMS, c.to_map(), obj(x));
    sign(&mut w, &mut m[0], &two);
    sign(&mut w, &mut m[1], &two);
    let decl = AbsenceDeclaration { agreement: x, clause: x, party: ids[2], outcomes: vec![outcomes::VOICE_REMOVED] };
    let dx = law_act(&mut w, &mut keeper, law::types::DECLARATION, decl.to_map(), obj(x));
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![dx]);
    assert!(v.agreement(&two).unwrap().invalid.is_some(), "not accepted: p3 still counts");
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![dx]);
    v.absence_accepted.insert((dx, two));
    let a = v.agreement(&two).unwrap();
    assert_eq!(a.exists, Some(true), "{:?}", a.invalid);
}

/// Law rule 51 (F172): a declaration moves nothing by itself; what is put
/// in force under it is judged where that act uses it, and no later act of
/// the party undoes it. Ana last signed the founding terms (the treasurer
/// alone signed the area clone recorded since); the authority declares her
/// absent and the label's record registers it. Ana then comes back: a
/// liveness act, a contest, and her signature on the area clone she had
/// never signed, all after the line, which no act of the label places
/// before it. The record still registers the declaration, and her voice
/// stays gone.
#[test]
fn a_later_act_of_the_party_never_undoes_the_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = lab.sign(BEN, &k);
    let r0 = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r0), Some(k));
    let d = lab.declare(None, k, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], k);
    let registered = |lab: &Lab| lab.view().record(&lab.c[0].id, &line).unwrap().registers.len();
    assert_eq!(registered(&lab), 1);
    // Ana comes back.
    law_act(&mut lab.w, &mut lab.m[ANA].clone(), 12, vec![], obj(k));
    let contest = law_act(&mut lab.w, &mut lab.m[ANA].clone(), 14, vec![], obj(d));
    assert!(lab.w.v.get(&contest).is_some(), "the contest is held, shown beside the declaration");
    lab.sign(ANA, &k);
    assert_eq!(registered(&lab), 1, "a later act of the party never undoes the line (rule 51, F172)");
    let x = lab.cmip_act(0, pay());
    lab.sign(ANA, &x);
    assert!(!lab.counts(&x), "her voice stays gone");
    // A signature of hers on that clone that the label placed before the
    // line would have made the founding terms no longer the last version
    // she signed: the declaration then names the wrong version there.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = lab.sign(BEN, &k);
    lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    let sa = lab.sign(ANA, &k);
    lab.acknowledge(0, sa);
    let d = lab.declare(None, k, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], k);
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(e.registers.is_empty(), "placed before the line, her signature on the clone counts");
}

/// Q37, flaw C, B15: a threshold authority of two of the other parties.
/// One of them resigned and registered before the declaration's line: the
/// one who remains declares alone. Where both still count, one signs the
/// declaration and the other adds a signature act naming it; it counts
/// once both have signed, the second signature placed by the label at or
/// before the line: acknowledged by an earlier act, or by the record
/// registering the declaration. A signature the label places only after
/// that record completes nothing there; a later record registers it.
#[test]
fn a_threshold_authority_is_counted_at_the_line() {
    for case in [
        "registered before",
        "in the same record",
        "not co-signed",
        "acknowledged by the record",
        "acknowledged before",
        "acknowledged after",
        "witnessed before",
        "acknowledged off the chain",
    ] {
        let mut lab = Lab::new(&|t| {
            t.abandonment = Some(Abandonment {
                authority: Authority::Others(2),
                outcomes: vec![outcomes::VOICE_REMOVED],
                proof: None,
            });
            let ids = t.parties.clone();
            let g = t.grammar.as_mut().unwrap();
            g.safety = Holding::Shares { threshold: 2, members: ids };
            g.recovery = None;
        });
        let f = lab.founding;
        let mut ben = lab.m[BEN].clone();
        let res = lab.resign_from(&mut ben, f, None);
        let resigned = matches!(case, "registered before" | "in the same record");
        if case == "registered before" {
            lab.record(0, None, &[], vec![res], f);
        }
        let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
        let regs = if case == "in the same record" { vec![res, d] } else { vec![d] };
        let mut acks = None;
        if !resigned && case != "not co-signed" {
            let sb = lab.sign(BEN, &d);
            match case {
                "acknowledged by the record" => acks = Some(vec![sb]),
                "acknowledged before" => {
                    lab.acknowledge(0, sb);
                }
                // F156: a witness act of the label is on neither chain and
                // places nothing; nor does an action on no chain (rule 35b).
                "witnessed before" => {
                    let w = lab.ack(0, sb);
                    assert_eq!(lab.consent(&w), Consent::Identity, "a witness act counts for nothing in Law (F156)");
                    assert!(!lab.counts(&w));
                }
                "acknowledged off the chain" => {
                    let a = lab.acknowledge_uncited(0, sb);
                    assert!(matches!(lab.consent(&a), Consent::Uncited { .. }));
                }
                _ => {}
            }
            let r = lab.record_acking(0, None, &[], regs.clone(), f, acks.clone());
            if matches!(case, "witnessed before" | "acknowledged off the chain") {
                let e = lab.view().record(&lab.c[0].id, &r).unwrap();
                assert!(!e.line, "{case}: the signature is not placed before the record (F156)");
                assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("1 of the 2")), "{:?}", e.not_a_line);
                continue;
            }
            if case == "acknowledged after" {
                lab.acknowledge(0, sb);
                let e = lab.view().record(&lab.c[0].id, &r).unwrap();
                assert!(!e.line, "a signature placed after the record completes nothing there");
                assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("1 of the 2")), "{:?}", e.not_a_line);
                let r2 = lab.record(0, None, &[], regs.clone(), f);
                assert!(lab.view().record(&lab.c[0].id, &r2).unwrap().line);
            } else {
                assert!(lab.view().record(&lab.c[0].id, &r).unwrap().line, "{case}");
            }
        } else {
            let r = lab.record(0, None, &[], regs, f);
            let e = lab.view().record(&lab.c[0].id, &r).unwrap();
            if case == "not co-signed" {
                assert!(!e.line, "Ana alone is one of the two its number needs");
                continue;
            }
            assert!(e.line, "{case}: {:?}", e.not_a_line);
        }
        let cur = lab.view().current(&lab.c[0].id).unwrap().unwrap();
        assert!(cur.departed.contains(&lab.m[CY].id), "{case}");
    }
}

/// C7: where the declared member is the only holder of the label's
/// signing key, the declaration takes effect at the rotation the recovery
/// path makes; the authority's declaration draws no line by itself.
#[test]
fn a_declaration_against_the_key_holder_takes_effect_at_the_recovery_rotation() {
    for (sole, declared) in [(true, true), (true, false), (false, true)] {
        let mut lab = Lab::new(&|t| {
            if sole {
                let ids = t.parties.clone();
                t.grammar.as_mut().unwrap().signing = Holding::One(ids[ANA]);
            }
        });
        let f = lab.founding;
        if declared {
            lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED]);
        }
        // No line yet: Ana's voice still counts on the label's acts.
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        assert!(lab.counts(&p));
        // The recovery rotation declares the clone without Ana, signed by
        // Ben and Cy only.
        let ids = lab.ids();
        let keep = vec![ids[BEN], ids[CY]];
        let auth = lab.authority.id;
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![BEN, CY])], &|t| {
            t.parties = keep.clone();
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::One(keep[0]);
            g.safety = Holding::Shares { threshold: 2, members: keep.clone() };
            g.recovery = Some(Recovery::Escrow { authority: auth });
            t.areas.as_mut().unwrap()[0].holders = vec![keep[1]];
        });
        let k = lab.propose(BEN, &t);
        let s1 = lab.sign(BEN, &k);
        let s2 = lab.sign(CY, &k);
        lab.rotate(Some((k, vec![s1, s2])), &[0]);
        let y = lab.publish(0);
        lab.sign(CY, &y);
        match lab.consent(&y) {
            Consent::Broken { reason } => {
                assert!(!(sole && declared), "{reason}");
                assert!(reason.contains("too few signers"), "Ana still counts: {reason}");
            }
            _ => assert!(sole && declared, "sole holder {sole}, declared {declared}"),
        }
        assert!(lab.counts(&p), "what Ana signed before the rotation stands");
    }
}

/// B15 at C7's recovery rotation (B16): the rotation removing the declared
/// key holder is the declaration's line. A co-signature the label placed
/// before it counts; one it could not place counts where the recovery
/// rotation names it beside its clone's (Flaw B18). Named nowhere, it
/// completes nothing there, Ana stays counted and the clone she did not
/// sign is not complete; a rotation naming another act there puts nothing
/// in force (freeze suite v20, step 7k).
#[test]
fn a_threshold_declaration_at_the_recovery_rotation() {
    for case in ["placed before", "named by the rotation", "nowhere", "another act named"] {
        let mut lab = Lab::new(&|t| {
            let ids = t.parties.clone();
            t.abandonment = Some(Abandonment {
                authority: Authority::Others(2),
                outcomes: vec![outcomes::VOICE_REMOVED],
                proof: None,
            });
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::One(ids[ANA]);
            g.safety = Holding::Shares { threshold: 2, members: ids };
            g.recovery = None;
        });
        let f = lab.founding;
        let d = lab.declare(Some(BEN), f, f, ANA, vec![outcomes::VOICE_REMOVED]);
        let sc = lab.sign(CY, &d);
        if case == "placed before" {
            lab.acknowledge(0, sc);
        }
        let ids = lab.ids();
        let keep = vec![ids[BEN], ids[CY]];
        // F122: the authority changes too, a judge: every member for it.
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![BEN, CY]), (Power::Judicial, vec![BEN, CY])], &|t| {
            t.parties = keep.clone();
            t.abandonment.as_mut().unwrap().authority = Authority::Others(1);
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::One(keep[0]);
            g.safety = Holding::Shares { threshold: 1, members: keep.clone() };
            t.areas.as_mut().unwrap()[0].holders = vec![keep[1]];
        });
        let k = lab.propose(BEN, &t);
        let s1 = lab.sign(BEN, &k);
        let s2 = lab.sign(CY, &k);
        match case {
            "named by the rotation" => lab.recover(k, vec![s1, s2], vec![sc], &[0]),
            "another act named" => lab.recover(k, vec![s1, s2], vec![s1], &[0]),
            _ => lab.rotate(Some((k, vec![s1, s2])), &[0]),
        };
        let y = lab.publish(0);
        lab.sign(CY, &y);
        let got = lab.view().consent(&y);
        match case {
            "placed before" | "named by the rotation" => {
                assert!(matches!(&got, Ok(c) if c.counts()), "{case}: {got:?}");
                assert_eq!(lab.in_force(&y), k, "{case}");
            }
            "nowhere" => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("not complete")),
                "{case}: Ana is still counted at the rotation: {got:?}"
            ),
            _ => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("B18")),
                "{case}: {got:?}"
            ),
        }
    }
}

/// Flaw B18's third element belongs to the recovery rotation alone: a
/// rotation naming a signature on a declaration against a party it does
/// not take out as C7 says puts nothing in force.
#[test]
fn only_the_recovery_rotation_names_a_declarations_signatures() {
    let mut lab = Lab::new(&|t| {
        let ids = t.parties.clone();
        t.abandonment = Some(Abandonment {
            authority: Authority::Others(2),
            outcomes: vec![outcomes::VOICE_REMOVED],
            proof: None,
        });
        let g = t.grammar.as_mut().unwrap();
        g.safety = Holding::Shares { threshold: 2, members: ids };
        g.recovery = None;
    });
    let f = lab.founding;
    // Signing key 2 of 3: the label can draw its line without Cy.
    let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let sb = lab.sign(BEN, &d);
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|t| {
        t.parties = keep.clone();
        t.abandonment.as_mut().unwrap().authority = Authority::Others(1);
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: keep.clone() };
        g.safety = Holding::Shares { threshold: 1, members: keep.clone() };
    });
    let k = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k);
    let s2 = lab.sign(BEN, &k);
    lab.recover(k, vec![s1, s2], vec![sb], &[0]);
    let y = lab.publish(0);
    lab.sign(ANA, &y);
    let got = lab.view().consent(&y);
    assert!(matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("B18")), "{got:?}");
}

/// 3.8 (F105, Q19, Q21, rule 37b): a dead member's seat passes by
/// nomination; the Finance lane they held stands frozen until the
/// constitutional clone refits it.
#[test]
fn a_seat_passes_by_nomination_after_a_declaration() {
    let mut lab = Lab::new(&|_| {});
    let dee = lab.w.genesis("dee", vec![own_home()], None, None);
    let ids = lab.ids();
    let plan = SuccessionPlan {
        party: ids[BEN],
        stakes: Some(vec![(spec("child one"), 500_000), (spec("child two"), 500_000)]),
        seats: Some(vec![(dee.id, 1)]),
        entry: Some(1),
    };
    let f = lab.founding;
    let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan);
    let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], k0);
    // The Finance lane has nobody left: a receipt counts for nothing.
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    assert!(areas(&lab.consent(&x))[0].1, "frozen");
    assert!(!lab.counts(&x));
    // The plan is a nomination: a clone marked with it is invalid.
    let new = vec![ids[ANA], ids[CY], dee.id];
    let auth = lab.authority.id;
    let shape = |t: &mut Terms| {
        t.parties = new.clone();
        t.succession = None;
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: new.clone() };
        g.safety = Holding::Shares { threshold: 3, members: new.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        t.areas.as_mut().unwrap()[1].holders = vec![new[2]];
    };
    let mut tp = lab.clone_terms(&k0, vec![], &shape);
    tp.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
    let kp = lab.propose(ANA, &tp);
    assert!(lab.view().agreement(&kp).unwrap().invalid.is_some());
    // The nomination: a constitutional clone signed by the voices that
    // remain and by Dee, refitting the Finance lane with Dee.
    // F122: the executed plan is dropped too, a judicial change: every
    // member whose voice remains for it, the same two.
    let t = lab.clone_terms(&k0, vec![(Power::Constitutional, vec![ANA, CY]), (Power::Judicial, vec![ANA, CY])], &shape);
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sc = lab.sign(CY, &k);
    let mut dee = dee;
    let sd = sign(&mut lab.w, &mut dee, &k);
    lab.rotate(Some((k, vec![sa, sc, sd])), &[0]);
    let y = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut dee, &y);
    assert_eq!(lab.in_force(&y), k);
    assert!(lab.counts(&y));
}

/// 3.8b (rules 44c, 48b, 48c; Q14, Q21, Q26; Flaw B14): a clone marked
/// with an automatic succession plan. The successor takes the departed
/// member's place in the parties and in every holding of the key grammar,
/// every threshold unchanged, the executed plan dropped; the rotation
/// declaring it re-deals the keys to include the successor.
#[test]
fn a_seat_passes_by_automatic_succession() {
    // (declared, a stranger's plan cloned by two of three, Ben holds Finance alone)
    for (declared, stranger, alone) in [
        (true, false, false),
        (false, false, false),
        (true, true, false),
        (true, false, true),
    ] {
        let mut lab = Lab::new(&|t| {
            if !alone {
                // Finance held by Ana and Ben, deciding together (the fifth case).
                let ids = t.parties.clone();
                let fin = &mut t.areas.as_mut().unwrap()[1];
                fin.holders = vec![ids[ANA], ids[BEN]];
                fin.threshold = 2;
            }
        });
        let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
        let ids = lab.ids();
        let plan = SuccessionPlan {
            party: ids[BEN],
            stakes: Some(vec![(spec("child one"), 500_000), (spec("child two"), 500_000)]),
            seats: Some(vec![(dee.id, 1)]),
            entry: Some(0),
        };
        let f = lab.founding;
        if stranger {
            // F121: a plan is judicial, and two of three never change it,
            // so the stranger's plan never comes into force.
            let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN])], &|t| {
                t.succession = Some(vec![plan.clone()]);
            });
            let k = lab.propose(ANA, &t);
            let sigs: Vec<Hash> = [ANA, BEN].iter().map(|i| lab.sign(*i, &k)).collect();
            let r = lab.record(0, Some((k, sigs)), &[], vec![], k);
            assert_eq!(puts(&lab, &r), None, "two of three never change a plan (F121)");
            continue;
        }
        let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan.clone());
        if declared {
            let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
            lab.record(0, None, &[], vec![d], k0);
        }
        // Dee in Ben's place, in the parties and in every holding.
        let new = vec![ids[ANA], dee.id, ids[CY]];
        let shape = |t: &mut Terms| {
            t.parties = new.clone();
            t.succession = None;
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares { threshold: 2, members: new.clone() };
            g.safety = Holding::Shares { threshold: 3, members: new.clone() };
            // Ben off the Finance lane; its number kept (Q26).
            let fin = &mut t.areas.as_mut().unwrap()[1];
            fin.holders.retain(|h| *h != ids[BEN]);
        };
        let planned = |lab: &Lab, extra: &dyn Fn(&mut Terms)| {
            let mut t = lab.clone_terms(&k0, vec![], &shape);
            extra(&mut t);
            t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
            t
        };
        if declared && !stranger && !alone {
            // What a plan cannot do (rule 44c, Q26, B14).
            let other = SuccessionPlan { party: ids[ANA], stakes: None, seats: Some(vec![(dee.id, 1)]), entry: Some(1) };
            for (why, extra) in [
                ("it lowers the area's number", &(|t: &mut Terms| t.areas.as_mut().unwrap()[1].threshold = 1) as &dyn Fn(&mut Terms)),
                ("it names a new holder", &|t: &mut Terms| t.areas.as_mut().unwrap()[0].holders.push(t.parties[1])),
                ("it changes the words", &|t: &mut Terms| t.text = "Other words.".into()),
                ("it lowers a threshold of the keys", &|t: &mut Terms| {
                    let m = t.parties.clone();
                    t.grammar.as_mut().unwrap().safety = Holding::Shares { threshold: 2, members: m };
                }),
                ("it leaves Dee out of the signing key", &|t: &mut Terms| {
                    let m = vec![t.parties[0], t.parties[2]];
                    t.grammar.as_mut().unwrap().signing = Holding::Shares { threshold: 2, members: m };
                }),
                ("it keeps the executed plan", &|t: &mut Terms| {
                    let mut p = plan.clone();
                    p.party = t.parties[1];
                    t.succession = Some(vec![p]);
                }),
                ("it adds another plan", &|t: &mut Terms| t.succession = Some(vec![other.clone()])),
                ("it reorders the others", &|t: &mut Terms| t.parties = vec![t.parties[2], t.parties[1], t.parties[0]]),
            ] {
                let t = planned(&lab, extra);
                let k = lab.propose(ANA, &t);
                assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "{why}");
            }
            let mut t = planned(&lab, &|_| {});
            t.field4 = Field4::Mark(vec![
                MarkEntry { power: Power::Clone, signers: vec![ids[ANA]] },
                MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] },
            ]);
            let k = lab.propose(ANA, &t);
            assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "the plan names nothing else");
        }
        let t = planned(&lab, &|_| {});
        let k = lab.propose(ANA, &t);
        assert_eq!(lab.view().agreement(&k).unwrap().invalid, None);
        let sd = sign(&mut lab.w, &mut dee, &k);
        lab.rotate(Some((k, vec![sd])), &[0]);
        let y = lab.publish(0);
        lab.sign(ANA, &y);
        let got = lab.view().consent(&y);
        match (declared, stranger) {
            (true, false) => {
                assert!(matches!(&got, Ok(c) if c.counts()), "{got:?}");
                assert_eq!(lab.in_force(&y), k);
                let cur = lab.view().current(&lab.c[0].id).unwrap().unwrap();
                assert_eq!(cur.agreement, k);
                let x = lab.cmip_act(0, pay());
                if alone {
                    // Q21, Q22: Ben held Finance alone; it stands frozen.
                    assert!(cur.frozen.contains(&2));
                    sign(&mut lab.w, &mut dee, &x);
                    lab.sign(ANA, &x);
                    assert!(!lab.counts(&x));
                } else {
                    // Q26, flaw C: Ana alone meets Finance's two.
                    assert!(cur.frozen.is_empty());
                    lab.sign(ANA, &x);
                    assert!(lab.counts(&x));
                }
                // Dee now has the seat: a constitutional clone needs Dee.
                let t2 = lab.clone_terms(&k, vec![(Power::Constitutional, vec![ANA, CY])], &|t| {
                    t.text = "New words.".into();
                });
                let k2 = lab.propose(ANA, &t2);
                let s1 = lab.sign(ANA, &k2);
                let s2 = lab.sign(CY, &k2);
                lab.rotate(Some((k2, vec![s1, s2])), &[0]);
                let z = lab.publish(0);
                lab.sign(ANA, &z);
                assert!(!lab.counts(&z), "Dee's voice counts: two of three do not meet everyone");
            }
            // No trigger: a draft.
            (false, _) => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("trigger")),
                "{got:?}"
            ),
            // The stranger: Cy never signed that plan.
            (true, true) => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("never signed a version carrying this plan")),
                "{got:?}"
            ),
        }
    }
}

/// Flaw B14's remaining points, refused rather than guessed: where the
/// successor goes among the parties when not in the party's place, and a
/// seat's voting weight other than one.
#[test]
fn what_b14_leaves_open_is_refused() {
    for case in ["placed last", "weight two"] {
        let mut lab = Lab::new(&|_| {});
        let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
        let ids = lab.ids();
        let w = if case == "weight two" { 2 } else { 1 };
        let plan = SuccessionPlan { party: ids[BEN], stakes: None, seats: Some(vec![(dee.id, w)]), entry: Some(0) };
        let f = lab.founding;
        let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan);
        let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
        lab.record(0, None, &[], vec![d], k0);
        let order = if case == "placed last" { vec![ids[ANA], ids[CY], dee.id] } else { vec![ids[ANA], dee.id, ids[CY]] };
        let place = vec![ids[ANA], dee.id, ids[CY]];
        let mut t = lab.clone_terms(&k0, vec![], &|t| {
            t.parties = order.clone();
            t.succession = None;
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares { threshold: 2, members: place.clone() };
            g.safety = Holding::Shares { threshold: 3, members: place.clone() };
            t.areas.as_mut().unwrap()[1].holders = vec![];
        });
        t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
        let k = lab.propose(ANA, &t);
        assert_eq!(lab.view().agreement(&k).unwrap().invalid, None, "{case}");
        let sd = sign(&mut lab.w, &mut dee, &k);
        lab.rotate(Some((k, vec![sd])), &[0]);
        let y = lab.publish(0);
        let got = lab.view().consent(&y);
        assert!(matches!(&got, Err(LawError::Unsettled(w)) if w.contains("B14")), "{case}: {got:?}");
    }
}

/// Flaw B17 (freeze suite v20, step 8b, the sixth collective): where Ben
/// holds the safety key alone, the succession clone that passes his seat to
/// Dee also carries Dee's own plan, naming her successor, in the executed
/// plan's place, signed by Dee in that clone; it comes into force, and Dee
/// holds the key with a successor named (rule 36, F96). Without that plan,
/// or with it for someone else, out of place, or where the party did not
/// hold the safety key alone, the clone is invalid.
#[test]
fn a_sole_safety_holders_successor_names_their_own_successor() {
    // Founded with a first successor named for Ben (rule 36); the members
    // then name Dee instead, all three signing, so Ben's seat passes
    // automatically (Q14).
    let mut lab = Lab::new(&|t| {
        let ids = t.parties.clone();
        t.grammar.as_mut().unwrap().safety = Holding::One(ids[BEN]);
        t.succession = Some(vec![SuccessionPlan {
            party: ids[BEN],
            stakes: None,
            seats: Some(vec![(spec("a first successor"), 1)]),
            entry: Some(1),
        }]);
    });
    let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
    let ids = lab.ids();
    let deesucc = spec("Dee's successor");
    let ben_plan = SuccessionPlan {
        party: ids[BEN],
        stakes: None,
        seats: Some(vec![(dee.id, 1)]),
        entry: Some(0),
    };
    let ana_plan = SuccessionPlan { party: ids[ANA], stakes: None, seats: Some(vec![(spec("Ana's heir"), 1)]), entry: Some(1) };
    let dee_plan = SuccessionPlan { party: dee.id, stakes: None, seats: Some(vec![(deesucc, 1)]), entry: Some(1) };
    let f = lab.founding;
    let t0 = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.succession = Some(vec![ben_plan.clone(), ana_plan.clone()]);
    });
    let k0 = lab.propose(ANA, &t0);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k0)).collect();
    lab.record(0, Some((k0, sigs)), &[], vec![], k0);
    let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], k0);
    let new = vec![ids[ANA], dee.id, ids[CY]];
    let planned = |lab: &Lab, plans: Vec<SuccessionPlan>| {
        let mut t = lab.clone_terms(&k0, vec![], &|t| {
            t.parties = new.clone();
            t.succession = Some(plans.clone());
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares { threshold: 2, members: new.clone() };
            g.safety = Holding::One(dee.id);
            t.areas.as_mut().unwrap()[1].holders = vec![];
        });
        t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
        t
    };
    let mut for_cy = dee_plan.clone();
    for_cy.party = ids[CY];
    for (why, plans) in [
        ("no plan for Dee: the key has no successor named", vec![ana_plan.clone()]),
        ("the plan is not Dee's", vec![for_cy, ana_plan.clone()]),
        ("Dee's plan out of the executed plan's place", vec![ana_plan.clone(), dee_plan.clone()]),
        ("Dee's plan names no successor", vec![SuccessionPlan { seats: None, ..dee_plan.clone() }, ana_plan.clone()]),
    ] {
        let t = planned(&lab, plans);
        let k = lab.propose(ANA, &t);
        // Invalid by rule 36 on its own terms, or against its parent (rule 44c).
        let bad = match lab.view().agreement(&k) {
            Err(LawError::Check(_)) => true,
            Ok(a) => a.invalid.is_some(),
            Err(e) => panic!("{why}: {e:?}"),
        };
        assert!(bad, "{why}");
    }
    let t = planned(&lab, vec![dee_plan.clone(), ana_plan.clone()]);
    let k = lab.propose(ANA, &t);
    assert_eq!(lab.view().agreement(&k).unwrap().invalid, None);
    let sd = sign(&mut lab.w, &mut dee, &k);
    lab.rotate(Some((k, vec![sd])), &[0]);
    let y = lab.publish(0);
    lab.sign(ANA, &y);
    let got = lab.view().consent(&y);
    assert!(matches!(&got, Ok(c) if c.counts()), "{got:?}");
    assert_eq!(lab.in_force(&y), k);
    let cur = lab.view().terms(&k).unwrap();
    assert_eq!(cur.grammar.unwrap().safety, Holding::One(dee.id));
    assert!(cur.succession.unwrap().iter().any(|p| p.party == dee.id && p.seats.as_ref().is_some_and(|s| s[0].0 == deesucc)));
}

/// Flaw B17 adds a plan only where the party held the safety key alone: in
/// the label, whose safety key all three hold, a succession clone adding
/// one for the successor changes more than the plan gives.
#[test]
fn a_succession_clone_adds_no_plan_where_the_key_is_shared() {
    let mut lab = Lab::new(&|_| {});
    let dee = lab.w.genesis("dee", vec![own_home()], None, None);
    let ids = lab.ids();
    let plan = SuccessionPlan { party: ids[BEN], stakes: None, seats: Some(vec![(dee.id, 1)]), entry: Some(0) };
    let f = lab.founding;
    let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan);
    let new = vec![ids[ANA], dee.id, ids[CY]];
    let mut t = lab.clone_terms(&k0, vec![], &|t| {
        t.parties = new.clone();
        t.succession = Some(vec![SuccessionPlan { party: dee.id, stakes: None, seats: Some(vec![(spec("Dee's successor"), 1)]), entry: Some(1) }]);
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: new.clone() };
        g.safety = Holding::Shares { threshold: 3, members: new.clone() };
        t.areas.as_mut().unwrap()[1].holders = vec![];
    });
    t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
    let k = lab.propose(ANA, &t);
    let got = lab.view().agreement(&k).unwrap().invalid;
    assert!(got.as_deref().is_some_and(|w| w.contains("B14")), "{got:?}");
}

// ---------------------------------------------------------------- scenario 1: a deal

/// Scenario 1, steps 6, 7 and 9b (F107): a deal changes only with every
/// party's signature.
#[test]
fn a_deal_changes_only_with_everyone() {
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let deal = Terms {
        parties: ids.clone(),
        text: "The film's contributors share its revenue.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
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
    };
    let d = law_act(&mut w, &mut m[0], law::types::TERMS, deal.to_map(), None);
    sign(&mut w, &mut m[0], &d);
    sign(&mut w, &mut m[1], &d);
    assert_eq!(view(&w).agreement(&d).unwrap().exists, Some(false));
    sign(&mut w, &mut m[2], &d);
    assert_eq!(view(&w).agreement(&d).unwrap().exists, Some(true));

    let mut c = deal.clone();
    c.parent = Some(d);
    c.field4 = Field4::Mark(vec![MarkEntry {
        power: Power::Clone,
        signers: sorted(ids.clone()),
    }]);
    c.cmips = vec![(6, pay2()), (11, anchor())];
    let k = law_act(&mut w, &mut m[0], law::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut m[0], &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(false), "1.6: one signs");
    sign(&mut w, &mut m[1], &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(false), "1.9b: two of three");
    sign(&mut w, &mut m[2], &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(true), "1.7: everyone");

    // A deal's clone whose mark names two parties: invalid.
    let mut c2 = c.clone();
    c2.field4 = Field4::Mark(vec![MarkEntry {
        power: Power::Clone,
        signers: sorted(ids[..2].to_vec()),
    }]);
    let k2 = law_act(&mut w, &mut m[0], law::types::TERMS, c2.to_map(), obj(d));
    assert!(view(&w).agreement(&k2).unwrap().invalid.is_some());
}

/// Q28 in a deal (the reading confirmed in the seventh pass): a
/// declaration draws its own line; a party's signature on a clone counts
/// only where the deal's keeper recorded it before recording the
/// declaration; the others need the declared party no more.
#[test]
fn in_a_deal_a_declaration_draws_its_own_line() {
    for case in ["unsigned", "recorded before", "recorded after"] {
        let mut w = World::new();
        let mut m: Vec<Person> = ["p1", "p2", "p3"]
            .iter()
            .map(|n| w.genesis(n, vec![own_home()], None, None))
            .collect();
        let mut authority = w.genesis("authority", vec![own_home()], None, None);
        let keeper = w.genesis("keeper", vec![own_home()], None, None);
        let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
        let deal = Terms {
            parties: ids.clone(),
            text: "The film's contributors share its revenue.".into(),
            cmips: vec![(6, pay()), (11, anchor())],
            keepers: Some(Keepers { operators: vec![keeper.id], rule: Rule::All }),
            field4: Field4::Rule(Rule::All),
            clone: Rule::All,
            time: None,
            abandonment: Some(Abandonment {
                authority: Authority::Named(authority.id),
                outcomes: vec![outcomes::VOICE_REMOVED],
                proof: None,
            }),
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
        };
        let d = law_act(&mut w, &mut m[0], law::types::TERMS, deal.to_map(), None);
        for p in m.iter_mut() {
            sign(&mut w, p, &d);
        }
        let mark = |who: &[usize]| {
            let mut c = deal.clone();
            c.parent = Some(d);
            c.cmips = vec![(6, pay2()), (11, anchor())];
            c.field4 = Field4::Mark(vec![MarkEntry {
                power: Power::Clone,
                signers: sorted(who.iter().map(|i| ids[*i]).collect()),
            }]);
            c
        };
        let two = law_act(&mut w, &mut m[0], law::types::TERMS, mark(&[0, 1]).to_map(), obj(d));
        let three = law_act(&mut w, &mut m[0], law::types::TERMS, mark(&[0, 1, 2]).to_map(), obj(d));
        for k in [two, three] {
            sign(&mut w, &mut m[0], &k);
            sign(&mut w, &mut m[1], &k);
        }
        let s3 = (case != "unsigned").then(|| sign(&mut w, &mut m[2], &three));
        let decl = AbsenceDeclaration {
            agreement: d,
            clause: d,
            party: ids[2],
            outcomes: vec![outcomes::VOICE_REMOVED],
        };
        // Before the declaration: two of three is no deal clone.
        assert!(view(&w).agreement(&two).unwrap().invalid.is_some());
        let x = law_act(&mut w, &mut authority, law::types::DECLARATION, decl.to_map(), obj(d));
        let mut v = view(&w);
        let log = match (case, s3) {
            ("recorded before", Some(s)) => vec![s, x],
            ("recorded after", Some(s)) => vec![x, s],
            _ => vec![x],
        };
        v.keeper_logs.insert(keeper.id, log);
        let a2 = v.agreement(&two).unwrap();
        let a3 = v.agreement(&three).unwrap();
        // Either way, p3's voice is gone for the clone p3 never signed.
        assert_eq!(a2.exists, Some(true), "{case}: {:?}", a2.invalid);
        if case == "recorded before" {
            // p3's signature on `three` was placed before the declaration:
            // p3 counts as a voice for it (Q23, Q28), named in its mark.
            assert_eq!(a3.exists, Some(true), "{case}: {:?}", a3.invalid);
        } else {
            assert_eq!(a2.exists, Some(true), "{case}: {:?}", a2.invalid);
            assert!(a3.invalid.is_some(), "{case}");
        }
    }
}

/// Flaw B19 (freeze suite v20, scenario 1, step 9c): in a deal the
/// absence authority is one identity. Terms naming a threshold of the other
/// parties, whatever its number, are invalid; terms naming a collective the
/// contributors formed are valid, and its declaration, signed with its own
/// key, removes a voice from its own place, as the deal's keepers record it.
#[test]
fn in_a_deal_the_absence_authority_is_one_identity() {
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let keeper = w.genesis("keeper", vec![own_home()], None, None);
    // The collective the contributors formed, as the authority.
    let mut board = w.genesis("the contributors' collective", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let deal = |authority: Authority| Terms {
        parties: ids.clone(),
        text: "The second film's contributors share its revenue.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: Some(Keepers { operators: vec![keeper.id], rule: Rule::All }),
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: Some(Abandonment { authority, outcomes: vec![outcomes::VOICE_REMOVED], proof: None }),
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
    };
    for k in [1, 2] {
        let got = deal(Authority::Others(k)).check(&mips());
        assert!(matches!(&got, Err(LawError::Check(w)) if w.contains("B19")), "{k}: {got:?}");
        // Signed by every party, still no deal.
        let d = law_act(&mut w, &mut m[0], law::types::TERMS, deal(Authority::Others(k)).to_map(), None);
        for p in m.iter_mut() {
            sign(&mut w, p, &d);
        }
        assert!(view(&w).agreement(&d).is_err(), "{k}");
    }
    let t = deal(Authority::Named(board.id));
    assert_eq!(t.check(&mips()), Ok(()));
    let d = law_act(&mut w, &mut m[0], law::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &d);
    }
    let mut c = t.clone();
    c.parent = Some(d);
    c.cmips = vec![(6, pay2()), (11, anchor())];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ids[0], ids[1]]) }]);
    let two = law_act(&mut w, &mut m[0], law::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut m[0], &two);
    sign(&mut w, &mut m[1], &two);
    assert!(view(&w).agreement(&two).unwrap().invalid.is_some(), "p3 still counts");
    let decl = AbsenceDeclaration { agreement: d, clause: d, party: ids[2], outcomes: vec![outcomes::VOICE_REMOVED] };
    let x = law_act(&mut w, &mut board, law::types::DECLARATION, decl.to_map(), obj(d));
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![x]);
    let a2 = v.agreement(&two).unwrap();
    assert_eq!(a2.exists, Some(true), "{:?}", a2.invalid);
}

/// Freeze scenario 1, step 9, and its pass condition (F172): the deal's
/// clause names the keeper's operator as the authority on absence, with
/// no absence-proof cMIP, so the declaration is that identity's judgment
/// (one identity, Flaw B19), checked for signer, outcome and version, no
/// anchor read. p1, with nothing to sign for months, posts a liveness act:
/// shown beside any declaration. p2 goes silent on the deal while active
/// elsewhere; the operator declares p2 absent, removing the voice and
/// redistributing the stake. The declaration moves nothing until a clone
/// puts its outcome in force: the deal's terms stay as they were, and the
/// clone without p2, no clone before, completes. p2 then contests it
/// and comes back on the deal: nothing undoes the clone (rule 51). A
/// declaration by anyone else is none.
#[test]
fn scenario_1_step_9_absence_is_the_authoritys_judgment() {
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let mut keeper = w.genesis("keeper", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut terms = deal_terms(ids[0], ids[1]);
    terms.parties = ids.clone();
    terms.text = "The film's contributors share its revenue.".into();
    terms.keepers = Some(Keepers { operators: vec![keeper.id], rule: Rule::All });
    terms.time = Some((spec("a block height reference"), Value::Uint(0)));
    terms.abandonment = Some(Abandonment {
        authority: Authority::Named(keeper.id),
        outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED],
        proof: None,
    });
    assert_eq!(terms.check(&mips()), Ok(()));
    let d = law_act(&mut w, &mut m[0], law::types::TERMS, terms.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &d);
    }
    // p1's liveness act on the deal.
    let live = law_act(&mut w, &mut m[0], 12, vec![], obj(d));
    // p2, busy elsewhere.
    let elsewhere = law_act(&mut w, &mut m[1], law::types::TERMS, Terms { parties: vec![ids[1]], ..terms.clone() }.to_map(), None);
    law_act(&mut w, &mut m[1], 12, vec![], obj(elsewhere));
    // p1 and p3 sign a clone without p2, redistributing the stake.
    let mut c = terms.clone();
    c.parent = Some(d);
    c.parties = vec![ids[0], ids[2]];
    c.text = "The film's contributors share its revenue; p2's share is redistributed.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ids[0], ids[2]]) }]);
    let k = law_act(&mut w, &mut m[0], law::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut m[0], &k);
    sign(&mut w, &mut m[2], &k);
    assert!(view(&w).agreement(&k).unwrap().invalid.is_some(), "no declaration yet: p2 still counts");
    // A stranger's declaration is none.
    let decl = AbsenceDeclaration {
        agreement: d,
        clause: d,
        party: ids[1],
        outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED],
    };
    let odd = law_act(&mut w, &mut stranger, law::types::DECLARATION, decl.to_map(), obj(d));
    assert!(view(&w).declaration(&odd).unwrap().is_err());
    // The operator's, with no anchor anywhere, counts.
    let x = law_act(&mut w, &mut keeper, law::types::DECLARATION, decl.to_map(), obj(d));
    assert!(view(&w).declaration(&x).unwrap().is_ok(), "{:?}", view(&w).declaration(&x).unwrap().err());
    let judged = |w: &World, log: Vec<Hash>| {
        let mut v = view(w);
        v.keeper_logs.insert(keeper.id, log);
        v.agreement(&k).unwrap()
    };
    // The declaration moves nothing by itself: the deal's own terms still
    // name p2; what changes is the clone it lets complete, from the
    // declaration on (rule 53, Q28).
    assert!(view(&w).terms(&d).unwrap().parties.contains(&ids[1]));
    assert_eq!(judged(&w, vec![odd, x]).exists, Some(true), "{:?}", judged(&w, vec![odd, x]).invalid);
    // p2 contests and comes back: the clone stands.
    let contest = law_act(&mut w, &mut m[1], 14, vec![], obj(x));
    law_act(&mut w, &mut m[1], 12, vec![], obj(d));
    sign(&mut w, &mut m[1], &k);
    assert!(w.v.get(&contest).is_some() && w.v.get(&live).is_some(), "both held, shown beside the declaration");
    let after = judged(&w, vec![odd, x]);
    assert_eq!(after.exists, Some(true), "no later act undoes it (F172): {:?}", after.invalid);
}

/// The reference absence-proof module (experimental, outside the core
/// path; F172), on what was freeze scenario 1, step 9 under F136 and F148:
/// a deal whose clause names the module in key 3, with a two-week period
/// on its block height (here 30 blocks), the keeper's operator the
/// authority on absence. The caller states the anchors (formats open) to
/// the module, never to the core. A liveness act on the deal protects its
/// party once anchored, whoever anchored it; one nobody anchored does not.
/// Activity elsewhere protects no one. A declaration anchored during a gap
/// and kept is accepted only if another party or the keeper acknowledged
/// it, anchored within one further period, with no act of the party on
/// the deal anchored between.
#[test]
fn the_reference_absence_proof_module_judges_by_anchors() {
    use law::view::reference_absence_proof as reference;
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let mut keeper = w.genesis("keeper", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let terms = Terms {
        parties: ids.clone(),
        text: "The film's contributors share its revenue.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: Some(Keepers { operators: vec![keeper.id], rule: Rule::All }),
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: Some((spec("a block height reference"), Value::Uint(0))),
        abandonment: Some(Abandonment {
            authority: Authority::Named(keeper.id),
            outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED],
            proof: Some((reference::spec(), reference::params(30))),
        }),
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
    };
    assert_eq!(terms.check(&mips()), Ok(()));
    let d = law_act(&mut w, &mut m[0], law::types::TERMS, terms.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &d);
    }
    // Another agreement p2 is busy on.
    let elsewhere = law_act(&mut w, &mut m[1], law::types::TERMS, Terms { parties: vec![ids[1]], ..terms.clone() }.to_map(), None);
    let mut declare = |w: &mut World, party: usize| {
        let x = AbsenceDeclaration { agreement: d, clause: d, party: ids[party], outcomes: vec![outcomes::STAKE_REDISTRIBUTED] };
        law_act(w, &mut keeper, law::types::DECLARATION, x.to_map(), obj(d))
    };
    let judged = |w: &World, anchors: &[(Hash, u64)], x: &Hash| -> Result<(), String> {
        let anchors: std::collections::BTreeMap<Hash, u64> = anchors.iter().copied().collect();
        view(w).reference_absence_proof(x, &anchors).unwrap()
    };

    // p1, with nothing to sign for months, posts a liveness act on the deal
    // (type 12, its format open: here it names the deal), anchored at 95 by
    // a friend: it keeps their vote.
    let live = law_act(&mut w, &mut m[0], 12, vec![], obj(d));
    let d1 = declare(&mut w, 0);
    let ack1 = w.ack(&mut m[1], d1);
    let base = vec![(d1, 100), (ack1, 110)];
    let got = judged(&w, &[base.clone(), vec![(live, 95)]].concat(), &d1);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
    // The same liveness act, anchored by nobody, protects no one.
    assert_eq!(judged(&w, &base, &d1), Ok(()));
    // Anchored before the period, it no longer protects either.
    assert_eq!(judged(&w, &[base.clone(), vec![(live, 60)]].concat(), &d1), Ok(()));

    // p2 goes silent on the deal while active elsewhere: acts anchored
    // within the period, but not on the deal, protect nothing.
    let busy = law_act(&mut w, &mut m[1], 12, vec![], obj(elsewhere));
    let post = w.post(&mut m[1], "a post far from the film");
    let d2 = declare(&mut w, 1);
    let ack2 = w.ack(&mut m[0], d2);
    let got = judged(&w, &[(busy, 95), (post, 96), (d2, 100), (ack2, 105)], &d2);
    assert_eq!(got, Ok(()), "activity elsewhere is no presence (rule 50)");

    // p3 is away in January. The operator anchors a declaration at 100,
    // during the gap, and keeps it to themselves. p3 comes back and works
    // on the deal every week (anchored at 140, 170, 200...). Published in
    // October, the declaration is acknowledged then, at 400: too late.
    let d3 = declare(&mut w, 2);
    let mut back = vec![];
    for at in [140, 170, 200, 230] {
        let x = law_act(&mut w, &mut m[2], 12, vec![], obj(d));
        back.push((x, at));
    }
    let late = w.ack(&mut m[0], d3);
    let got = judged(&w, &[back.clone(), vec![(d3, 100), (late, 400)]].concat(), &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("one further period") && e.contains("F148")), "{got:?}");
    // Acknowledged in time, at 125, but p3's act on the deal at 110 lies
    // between the two: it does not count either.
    let early = w.ack(&mut m[1], d3);
    let mut returned = back.clone();
    returned.push((law_act(&mut w, &mut m[2], 12, vec![], obj(d)), 110));
    let got = judged(&w, &[returned, vec![(d3, 100), (late, 400), (early, 125)]].concat(), &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("between")), "{got:?}");
    // With nothing of p3's between, the acknowledgement at 125 makes it
    // count: p3's later acts cannot undo it (rule 52's contest shows it).
    assert_eq!(judged(&w, &[back.clone(), vec![(d3, 100), (early, 125)]].concat(), &d3), Ok(()));
    // An acknowledgement by the declared party, or by a stranger, is none.
    let own = w.ack(&mut m[2], d3);
    let odd = w.ack(&mut stranger, d3);
    let got = judged(&w, &[(d3, 100), (own, 105), (odd, 106)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("acknowledgement")), "{got:?}");
    // F158: the keeper's operator is the authority here and signed the
    // declaration: its own acknowledgement is none, or it could anchor both
    // in January, keep them, and publish them in October.
    let kept = w.ack(&mut keeper, d3);
    let got = judged(&w, &[(d3, 100), (kept, 105)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("F158")), "{got:?}");
    // Another party's acknowledgement, anchored as early, counts.
    let other = w.ack(&mut m[0], d3);
    assert_eq!(judged(&w, &[(d3, 100), (kept, 105), (other, 106)], &d3), Ok(()));
    // F162 (3): bounds are inclusive: p3's act on the deal anchored at the
    // declaration's own point protects p3.
    let same = law_act(&mut w, &mut m[2], 12, vec![], obj(d));
    let got = judged(&w, &[(d3, 100), (other, 106), (same, 100)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
    // F162 (5): an act on a later version of the deal, a clone of it, is
    // presence on the deal.
    let mut c = terms.clone();
    c.parent = Some(d);
    c.text = "The film's contributors share its revenue, version two.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(ids.clone()) }]);
    let later = law_act(&mut w, &mut m[0], law::types::TERMS, c.to_map(), obj(d));
    let on_later = law_act(&mut w, &mut m[2], 12, vec![], obj(later));
    let got = judged(&w, &[(d3, 100), (other, 106), (on_later, 90)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
    // Not anchored at all: it does not count (F136).
    let got = judged(&w, &[(early, 125)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("not anchored")), "{got:?}");
}

/// The reference absence-proof module (F172), F158 and F162 (5), in a
/// collective whose clause names it with a period, its
/// authority two of the other members: Ben declares Ana absent and Cy
/// signs the declaration too. Cy, one of its signers, cannot acknowledge
/// it (F158); the keeper can. Ana's act on the label's chain, anchored
/// within the period, is presence on the agreement (F162, 5).
#[test]
fn a_threshold_declarations_signers_do_not_acknowledge_it() {
    use law::view::reference_absence_proof as reference;
    let mut lab = Lab::new(&|t| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.abandonment = Some(Abandonment {
            authority: Authority::Others(2),
            outcomes: vec![outcomes::VOICE_REMOVED],
            proof: Some((reference::spec(), reference::params(30))),
        });
        let ids = t.parties.clone();
        let g = t.grammar.as_mut().unwrap();
        g.safety = Holding::Shares { threshold: 2, members: ids };
        g.recovery = None;
    });
    let f = lab.founding;
    let d = lab.declare(Some(BEN), f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    lab.sign(CY, &d);
    let by_cy = lab.w.ack(&mut lab.m[CY], d);
    let by_keeper = lab.w.ack(&mut lab.keeper, d);
    let judged = |lab: &Lab, anchors: &[(Hash, u64)]| -> Result<(), String> {
        let anchors: std::collections::BTreeMap<Hash, u64> = anchors.iter().copied().collect();
        lab.view().reference_absence_proof(&d, &anchors).unwrap()
    };
    let got = judged(&lab, &[(d, 100), (by_cy, 105)]);
    assert!(got.as_ref().is_err_and(|e| e.contains("F158")), "a signer's acknowledgement is none: {got:?}");
    assert_eq!(judged(&lab, &[(d, 100), (by_cy, 105), (by_keeper, 106)]), Ok(()));
    // Ana works on the label's chain: an act of hers naming it in
    // `objects`, anchored at 95.
    let label = lab.c[0].id;
    let on_chain = law_act(&mut lab.w, &mut lab.m[ANA], 12, vec![], Some(vec![Object { chain: label, predecessor: label }]));
    let got = judged(&lab, &[(d, 100), (by_keeper, 106), (on_chain, 95)]);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
}

/// F162 (13), rule 36a: an area over the Identity layer governs the
/// collective's rotations and key events. Law shows whether a rotation has
/// that area's consent, its holders' signature acts meeting its number;
/// what follows from a rotation lacking it is open (Nobody, allegedly, 6
/// October 2026), and under Identity it counts all the same. The
/// collective's everyday Identity acts still count for nothing in Law.
#[test]
fn an_identity_area_shows_its_consent_on_a_rotation() {
    let mut lab = Lab::new(&|t| {
        let ids = t.parties.clone();
        t.areas.as_mut().unwrap().push(Area {
            name: "Keys".into(),
            holders: vec![ids[BEN], ids[CY]],
            threshold: 2,
            kinds: Some(vec![Kind::Layer(law::layers::IDENTITY)]),
            fields: None,
            id: 3,
        });
    });
    lab.publish(0);
    let r = lab.rotate(None, &[0]);
    let got = lab.view().rotation_consent(&r).unwrap();
    let Consent::Areas { met, areas, .. } = &got else { panic!("{got:?}") };
    assert!(!met, "no holder has signed it yet");
    assert_eq!((areas.len(), areas[0].area), (1, 3), "only the Identity area reaches it");
    lab.sign(BEN, &r);
    assert!(!lab.view().rotation_consent(&r).unwrap().counts(), "one of the two");
    lab.sign(CY, &r);
    let got = lab.view().rotation_consent(&r).unwrap();
    assert!(matches!(&got, Consent::Areas { met: true, .. }), "{got:?}");
    // The rotation counts under Identity either way.
    assert_eq!(lab.w.v.status(&r), Status::Valid);
    // An everyday Identity act of the collective, a witness act, counts
    // for nothing in Law (F156), whatever the Identity area.
    let x = lab.publish(0);
    let w = lab.ack(0, x);
    assert_eq!(lab.consent(&w), Consent::Identity);
}

/// 3.7n, R4: one cMIP for conversion (Finance) and splitting (Law), the
/// lanes held by two members: its acts need both.
#[test]
fn a_specification_serving_two_layers_needs_both_lanes() {
    let conv = spec("a conversion and split cMIP");
    let mut lab = Lab::new(&|t| {
        t.cmips = vec![(6, pay()), (7, conv), (8, conv), (11, anchor())];
        let p = t.parties.clone();
        t.areas.as_mut().unwrap().push(Area {
            name: "Law".into(),
            holders: vec![p[CY]],
            threshold: 1,
            kinds: Some(vec![Kind::Layer(law::layers::LAW)]),
            fields: None,
            id: 3,
        });
    });
    let x = lab.cmip_act(0, conv);
    lab.sign(BEN, &x);
    assert!(!lab.counts(&x));
    lab.sign(CY, &x);
    let a = areas(&lab.consent(&x));
    assert_eq!(a.len(), 2);
    assert!(lab.counts(&x));
}

/// 3.7j, F106, Q18: the release manager adopts an extension alone, and
/// one declaring Finance needs the treasurer too.
#[test]
fn the_production_lane_adopts_extensions() {
    let fin = spec("an extension declaring Finance");
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| {
        t.extensions = Some(vec![ext(), fin]);
    });
    let k = lab.propose(ANA, &t);
    // The specification's field 10 is read by the caller (`Lab::view`).
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "marked by the manager alone");
    let t = lab.clone_terms(
        &f,
        vec![(Power::Area(1), vec![ANA]), (Power::Area(2), vec![BEN])],
        &|t| t.extensions = Some(vec![ext(), fin]),
    );
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert!(a.invalid.is_none() && !a.ready, "waiting for the treasurer");
    let sb = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![sa, sb])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // An act of the new extension: the Production lane's.
    let e = lab.cmip_act(0, fin);
    lab.sign(ANA, &e);
    assert!(lab.counts(&e));
}

// ---------------------------------------------------------------- F121 to F124: endings, money, the pointer

fn obligation(lab: &mut Lab, creditor: &str, value: u64) -> Hash {
    let o = mor_core::finance::Payload::Obligation(mor_core::finance::Obligation {
        debtor: lab.c[0].id,
        creditor: spec(creditor),
        amount: mor_core::finance::Amount { unit: spec("a unit"), value },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 1, o.to_map(), None, None);
    let x = lab.w.add(&a);
    // A debt is a Finance act: the Finance lane's holder signs it, or it is
    // not the label's (rule 36a; `docs/law-invariants.md`, IC1).
    lab.sign(BEN, &x);
    x
}

/// A debt of the label to a creditor that is an identity, so that it can
/// sign a release (F125).
fn obligation_to(lab: &mut Lab, creditor: Hash, value: u64) -> Hash {
    let o = mor_core::finance::Payload::Obligation(mor_core::finance::Obligation {
        debtor: lab.c[0].id,
        creditor,
        amount: mor_core::finance::Amount { unit: spec("a unit"), value },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 1, o.to_map(), None, None);
    let x = lab.w.add(&a);
    lab.sign(BEN, &x);
    x
}

/// A receipt paying `value` toward an obligation, signed by its payee,
/// with the rail's answer stated as valid: paid to the payee's vault
/// (Finance rules 4 and 14).
fn receipt(lab: &mut Lab, payee: &mut Person, payer: Hash, obligation: Hash, value: u64) -> Hash {
    let r = receipt_unanswered(&mut lab.w, payee, payer, obligation, value);
    lab.rail_valid.push((r, mor_core::finance::PaidAt::VaultEntry(payee.id, 0)));
    r
}

/// A receipt paying `value` toward an obligation, signed by its payee; no
/// rail answer stated.
fn receipt_unanswered(w: &mut World, payee: &mut Person, payer: Hash, obligation: Hash, value: u64) -> Hash {
    let rc = mor_core::finance::Payload::Receipt(mor_core::finance::Receipt {
        rail: spec("a rail Module"),
        proof: vec![],
        payer: Some(mor_core::finance::Payer::Identity(payer)),
        payee: payee.id,
        amount: mor_core::finance::Amount { unit: spec("a unit"), value },
        fulfils: obligation,
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    });
    let a = w.everyday_act(payee, mips().finance, 2, rc.to_map(), None, None);
    w.add(&a)
}

/// A creditor's release (Finance type 4, F126; Law type 21 under F125),
/// signed by `by`.
fn debt_release(w: &mut World, by: &mut Person, obligation: Hash, against: Vec<Hash>) -> Hash {
    let r = mor_core::finance::Payload::Release(mor_core::finance::Release { obligation, against });
    let a = w.everyday_act(by, mips().finance, mor_core::finance::types::RELEASE, r.to_map(), None, None);
    w.add(&a)
}

/// The label's stake in itself (null, S1), and the label holding a work.
fn own(holders: Vec<(Hash, u64)>) -> law::Stake {
    law::Stake { object: Who::This, holders: holders.into_iter().map(|(h, n)| (Who::Id(h), n)).collect() }
}

fn owns(work: Hash) -> law::Stake {
    law::Stake { object: Who::Id(work), holders: vec![(Who::This, 1_000_000)] }
}

fn stakes(mut v: Vec<law::Stake>) -> Option<Vec<law::Stake>> {
    v.sort_by_key(|s| s.object.encoding());
    Some(v)
}

/// A payee pointer of `who`, naming these addresses on one rail Module.
fn pointer_of(w: &mut World, who: &mut Person, version: u64, previous: Option<Hash>, addresses: &[&[u8]]) -> Hash {
    let p = mor_core::finance::Payload::PayeePointer(mor_core::finance::PayeePointer {
        payee: who.id,
        version,
        previous,
        rails: addresses
            .iter()
            .map(|a| mor_core::finance::Rail { module: spec("a rail Module"), address: a.to_vec() })
            .collect(),
    });
    let a = w.everyday_act(who, mips().finance, 0, p.to_map(), None, None);
    w.add(&a)
}

fn vault_entry(source: &[u8]) -> mor_core::finance::VaultEntry {
    mor_core::finance::VaultEntry { unit: spec("a unit"), rail_module: spec("a rail Module"), source: source.to_vec(), limit: 1000 }
}

/// The grant key a grantee made for `plain_grant` (F128).
fn key_of(grantee: Hash) -> SchnorrKey {
    grant_key(&format!("{grantee:?}")).0
}

fn plain_grant(grantee: Hash, by_this: bool) -> Grant {
    let key = grant_key(&format!("{grantee:?}")).1;
    Grant { grantee, scope: 2, agreements: None, this_agreement: false, limits: None, limits_cmip: None, area: None, kinds: None, reinstates: None, by_this, key }
}

/// Freeze suite v21, 3.7v (F124, S1): founding terms carry stakes in the
/// collective itself and its own grant, written null; a deal cannot use
/// null; a clone writing the collective's own identity instead is invalid.
#[test]
fn founding_terms_carry_stakes_in_the_collective_itself() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let svc = w.genesis("a split service", vec![own_home()], None, None);
    // The split service's grant, by "this collective" (field 8), which
    // the founding terms will name: signed by a founder.
    let g = law_act(&mut w, &mut ana, law::types::GRANT, plain_grant(svc.id, true).to_map(), None);
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)]), owns(spec("a work"))]);
    });
    let f = lab.founding;
    let t = lab.view().terms(&f).unwrap();
    assert_eq!(t.own_stake().unwrap().1.share_of(&Who::Id(lab.ids()[ANA])), 400_000);
    let a = lab.view().agreement(&f).unwrap();
    assert_eq!(a.exists, Some(true));
    assert_eq!(lab.view().collective_of(&f).unwrap(), Some(lab.c[0].id));
    // Its own grant in its founding terms, by null.
    let mut t2 = t.clone();
    t2.split_grant = Some(g);
    assert_eq!(t2.check(&mips()), Ok(()));
    assert!(law::Grant::decode(&plain_grant(svc.id, true).to_map()).unwrap().by_this);
    let mut bad = plain_grant(svc.id, true);
    bad.area = Some(1);
    bad.kinds = Some(vec![Kind::Layer(law::layers::FINANCE)]);
    assert!(law::Grant::decode(&bad.to_map()).is_err(), "a founding grant names no area");
    // A deal cannot write null: only a collective's terms name themselves.
    let mut deal = t.clone();
    deal.grammar = None;
    deal.constitutional = None;
    deal.areas = None;
    deal.area_words = None;
    deal.clone = Rule::All;
    deal.abandonment = None;
    assert!(matches!(deal.check(&mips()), Err(LawError::Check(w)) if w.contains("S1")));
    // A collective holds no stake in itself.
    let mut selfish = t.clone();
    selfish.stakes = stakes(vec![law::Stake { object: Who::This, holders: vec![(Who::This, 1_000_000)] }]);
    assert!(selfish.check(&mips()).is_err());
    // One meaning, one encoding: a clone writing the label's identity.
    let label = lab.c[0].id;
    let c = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        t.stakes.as_mut().unwrap()[1].holders = vec![(Who::Id(label), 1_000_000)];
    });
    let k = lab.propose(ANA, &c);
    let inv = lab.view().agreement(&k).unwrap().invalid;
    assert!(inv.as_deref().is_some_and(|w| w.contains("S1")), "{inv:?}");
}

/// Freeze suite v21, shape A (F121): a group splits off with the powers to
/// do so. An ordinary membership change: the label keeps its identity, Cy
/// leaves and becomes a departed holder, their stake in field 7 (N5).
#[test]
fn a_group_splits_off_and_its_members_become_departed_holders() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let cy = ids[CY];
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.parties = keep.clone();
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 1, members: keep.clone() };
        g.safety = Holding::Shares { threshold: 2, members: keep.clone() };
        t.departed = Some(vec![cy]);
    });
    let k2 = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k2)).collect();
    lab.rotate(Some((k2, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k2);
    assert!(lab.counts(&p));
    let t = lab.view().terms(&k2).unwrap();
    assert_eq!(t.own_stake().unwrap().1.share_of(&Who::Id(cy)), 300_000);
    // The departed entry records only that Cy is departed; one without a
    // share in the label is invalid (N5).
    let mut bad = t.clone();
    bad.departed = Some(vec![spec("someone with no stake")]);
    assert!(bad.check(&mips()).is_err());
    let t2 = lab.clone_terms(&k2, vec![(Power::Constitutional, vec![ANA, CY])], &|t| t.text = "Other words.".into());
    let x = lab.propose(ANA, &t2);
    assert!(lab.view().agreement(&x).unwrap().invalid.is_some(), "a departed holder has no voice");
    assert_eq!(lab.view().current(&lab.c[0].id).unwrap().unwrap().closed, None);
}

/// Freeze suite v21, 3.7w (F124, M1): under a constitutional change rule of
/// two of three, Ana and Ben remove Cy, whose plan names a stake heir and a
/// seat heir. Only the seat part of the plan goes with the removal; the
/// stake part stays with the stake. The removal completes with two
/// signatures. Dropping the stake part too is a judicial change: every
/// member, Cy included.
#[test]
fn a_removal_under_a_lower_rule_completes() {
    let plan = |t: &Terms| SuccessionPlan {
        party: t.parties[CY],
        stakes: Some(vec![(spec("an heir"), 1_000_000)]),
        seats: Some(vec![(spec("a seat heir"), 1)]),
        entry: Some(1),
    };
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(2));
        t.succession = Some(vec![plan(t)]);
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let cy = ids[CY];
    let removal = |keep_stake_plan: bool| {
        let keep = keep.clone();
        move |t: &mut Terms| {
            t.parties = keep.clone();
            t.succession = keep_stake_plan.then(|| {
                vec![SuccessionPlan { party: cy, stakes: Some(vec![(spec("an heir"), 1_000_000)]), seats: None, entry: None }]
            });
            t.departed = Some(vec![cy]);
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares { threshold: 1, members: keep.clone() };
            g.safety = Holding::Shares { threshold: 2, members: keep.clone() };
        }
    };
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &removal(true));
    assert_eq!(lab.view().powers_needed(&t).unwrap(), vec![Power::Constitutional]);
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert!(a.invalid.is_none() && a.ready, "{:?}", a.invalid);
    lab.rotate(Some((k, vec![sa, sb])), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k, "Cy is removed without their signature");
    // The plan for Cy's stake stays, as a departed holder's.
    let tk = lab.view().terms(&k).unwrap();
    assert_eq!(tk.succession.as_ref().unwrap()[0].stakes, Some(vec![(spec("an heir"), 1_000_000)]));
    // Dropping the stake part too: judicial, every member.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &removal(false));
    assert_eq!(lab.view().powers_needed(&t).unwrap(), vec![Power::Constitutional, Power::Judicial]);
}

/// Freeze suite v21, 3.7t (F121 Q9, F124 N10): every payout matches its
/// stake exactly, within one smallest unit of rounding per payout, every
/// fee alike for every stake; a split is delivered to every holder it pays,
/// naming each fee and who received it.
#[test]
fn every_payout_matches_its_stake() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    // The label names the service by a clone (rule 18), so that the splits
    // below are the named service's, under the version in force (rule 20).
    let g = lab.grant(&plain_grant(svc.id, false));
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let f = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &f)).collect();
    lab.record(0, Some((f, sigs)), &[], vec![], f);
    let fee_module = spec("a split service's fee Module");
    let receipt = |lab: &mut Lab, svc: &mut Person, value: u64| {
        let r = mor_core::finance::Payload::Receipt(mor_core::finance::Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(mor_core::finance::Payer::Identity(spec("a fan"))),
            payee: svc.id,
            amount: mor_core::finance::Amount { unit: spec("a unit"), value },
            fulfils: spec("an offer"),
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = lab.w.everyday_act(svc, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let stake = lab.view().terms(&f).unwrap().own_stake().unwrap().0 as u64;
    let svc_id = svc.id;
    let split = |receipt: Hash, ana: u64, ben: u64, cy: u64| law::Split {
        receipt,
        payouts: vec![
            law::Payout { receiver: svc_id, amount: 100, stake: None, role: None, evidence: None, fee_module: Some(fee_module), rail_fee: None },
            law::Payout { receiver: ids[ANA], amount: ana, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: ids[BEN], amount: ben, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: ids[CY], amount: cy, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        ],
        cmip: spec("a split cMIP"),
        agreement: f,
        tally: None,
        number: None,
    };
    let everyone = ids.clone();
    let r1 = receipt(&mut lab, &mut svc, 1000);
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r1, 360, 270, 270).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.sums, Some(true));
    assert_eq!(e.fees, vec![(fee_module, svc.id, 100)]);
    assert!(e.undelivered.is_empty());
    assert_eq!(e.collective, Some(lab.c[0].id));
    assert!(e.mismatched.is_empty(), "{:?}", e.mismatched);
    assert!(e.problems.is_empty(), "{:?}", e.problems);
    assert_eq!(e.in_force, f);
    assert!(e.unevidenced.is_empty());
    assert_eq!(e.unplanned, vec![svc.id], "the fee: only the plan, whose format is open, could justify it");
    // Rounding: 901 leaves 801 to divide; the leftover unit to the largest
    // remainder, Ana's 320.4 (rule 15a, F150).
    let r2 = receipt(&mut lab, &mut svc, 901);
    let own: Vec<(Hash, u64)> = lab.view().terms(&f).unwrap().own_stake().unwrap().1.holders.iter().map(|(w, n)| (w.resolve(None).unwrap(), *n)).collect();
    assert_eq!(law::divide_stake(801, &own, law::Ties::Open).unwrap(), vec![321, 240, 240], "no tie: the remainders decide");
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r2, 321, 240, 240).to_map(), None, everyone.clone());
    assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
    // F162 (11): over the exact share by a whole unit or more breaks the
    // plan, though no other holder is short by one: of 803, Ana's exact
    // share is 321.2; 323 is 1.8 over. The old tolerance, as many units as
    // the stake has holders, let it through.
    let r3 = receipt(&mut lab, &mut svc, 903);
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r3, 323, 240, 240).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.sums, Some(true));
    // Since F165 every unit is rule 15a's: Ben and Cy, owed 241 each, are
    // short too.
    assert_eq!(e.mismatched.iter().map(|m| m.holder).collect::<Vec<_>>(), vec![ids[ANA], ids[BEN], ids[CY]]);
    // F165: rule 15a decides every unit. Of 803, Ben and Cy (240.9 each)
    // take the two leftover units, by largest remainder: 321, 241, 241.
    // Giving one of them to Ana instead leaves every holder within one
    // unit of its exact share, and is a deviation all the same.
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r3, 321, 241, 241).to_map(), None, everyone.clone());
    assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r3, 322, 241, 240).to_map(), None, everyone.clone());
    let who: Vec<Hash> = lab.view().split(&x).unwrap().mismatched.iter().map(|m| m.holder).collect();
    assert_eq!(std::collections::BTreeSet::from_iter(who), std::collections::BTreeSet::from([ids[ANA], ids[CY]]), "a leftover unit steered to Ana");
    // Any deviation, either way, breaks the plan (N10): Cy paid less, Ana
    // more. Not delivered to Cy, whom it pays.
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r1, 430, 270, 200).to_map(), None, vec![ids[ANA], ids[BEN]]);
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.sums, Some(true));
    let who: Vec<Hash> = e.mismatched.iter().map(|m| m.holder).collect();
    assert_eq!(who, vec![ids[ANA], ids[CY]]);
    assert_eq!(e.undelivered, vec![ids[CY]]);
    // Members paying a departed holder more is a deviation too: no
    // one-direction check remains.
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r1, 300, 270, 330).to_map(), None, everyone.clone());
    assert_eq!(lab.view().split(&x).unwrap().mismatched.len(), 2);
    // A split that does not sum exactly is shown so (rule 21).
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r1, 300, 270, 270).to_map(), None, everyone);
    assert_eq!(lab.view().split(&x).unwrap().sums, Some(false));
}

/// A duo's work at 500,000 / 500,000, named to a split service the member
/// owns (F165, F171): every one-unit payment is a tie. The lab, the
/// service, the agreement in force, the stake, and the members' identity
/// hashes, smaller first.
fn duo() -> (Lab, Person, Hash, u64, Hash, Hash) {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 500_000)])]);
    });
    let ids = lab.ids();
    let svc = lab.w.genesis("a split service the member owns", vec![own_home()], None, None);
    let g = lab.grant(&plain_grant(svc.id, false));
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let f = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &f)).collect();
    lab.record(0, Some((f, sigs)), &[], vec![], f);
    let stake = lab.view().terms(&f).unwrap().own_stake().unwrap().0 as u64;
    let (low, high) = if ids[ANA] < ids[BEN] { (ids[ANA], ids[BEN]) } else { (ids[BEN], ids[ANA]) };
    (lab, svc, f, stake, low, high)
}

/// A one-unit receipt of the duo's service, with its own salt.
fn unit_receipt(lab: &mut Lab, svc: &mut Person) -> Hash {
    let r = mor_core::finance::Payload::Receipt(mor_core::finance::Receipt {
        rail: spec("a rail Module"),
        proof: vec![],
        payer: Some(mor_core::finance::Payer::Identity(spec("a listener"))),
        payee: svc.id,
        amount: mor_core::finance::Amount { unit: spec("a unit"), value: 1 },
        fulfils: spec("a stream"),
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    });
    let a = lab.w.everyday_act(svc, mips().finance, 2, r.to_map(), None, None);
    lab.w.add(&a)
}

/// The service's split of a one-unit `receipt`, paying the unit to `to`
/// on `stake`, citing `previous` in `refs`, carrying `count` as the stake's
/// running count (field 4, PROPOSED format), delivered to both members
/// (F171: every holder, paid or not).
#[allow(clippy::too_many_arguments)]
fn unit_split(lab: &mut Lab, svc: &mut Person, f: Hash, stake: u64, receipt: Hash, to: Hash, previous: Option<Hash>, count: Option<Vec<(Hash, u64)>>) -> Hash {
    use mor_core::act::Ref;
    let s = law::Split {
        receipt,
        payouts: vec![law::Payout { receiver: to, amount: 1, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None }],
        cmip: spec("a split cMIP"),
        agreement: f,
        tally: count.map(|c| vec![(stake, c)]),
        number: None,
    };
    let everyone = lab.ids()[..2].to_vec();
    lab.w.private_act_refs(svc, mips().law, law::types::SPLIT, s.to_map(), None, everyone, previous.map(|p| vec![Ref::Act(p)]))
}

/// F165 (review of F145 to F162, finding 4), as F171 builds it: leftover
/// ties take turns, counted in the running count each split act carries
/// (field 4, PROPOSED format) and checked from two acts: the split and the
/// previous one it cites for the stake. A duo's work at 500,000 / 500,000
/// earns one-unit payments, so every unit is a tie. Under F150 the
/// receipt's hash decided it, and the service, which signs the receipt and
/// picks its salt, could sign one receipt after another until the hash
/// fell its way. Now:
///
/// - re-signing the receipt with twenty different salts changes nothing:
///   with no earlier split, the unit goes to the smaller identity hash,
///   and a split giving it to the other member is shown as a deviation;
/// - each split citing the previous one for the stake, the units
///   alternate: the member with fewer leftover units so far takes the next;
/// - a verifier holding only the previous split checks the tie, and the
///   running count;
/// - a running count that is not the previous one plus this split's
///   leftover units breaks the plan;
/// - a split citing an act the verifier does not hold leaves the tied unit
///   and the count unknown, never the rest of the payment.
///
/// Before F165 was built, the split check allowed each holder one unit
/// either way, so a tied unit could be given to either member.
#[test]
fn a_split_service_cannot_steer_ties_by_grinding_salts() {
    let (mut lab, mut svc, f, stake, low, high) = duo();
    // Grinding: twenty receipts for the first payment, each with its own
    // salt, each split as the first. Every one sends the unit to the
    // smaller identity hash. (Twenty first splits reset the count each
    // time: the next test shows that.)
    for _ in 0..20 {
        let r = unit_receipt(&mut lab, &mut svc);
        let steered = unit_split(&mut lab, &mut svc, f, stake, r, high, None, Some(vec![(high, 1)]));
        let e = lab.view().split(&steered).unwrap();
        assert!(!e.mismatched.is_empty(), "a tied unit steered by the receipt's salt is a deviation");
        assert!(e.turns_unknown.is_empty());
        let x = unit_split(&mut lab, &mut svc, f, stake, r, low, None, Some(vec![(low, 1)]));
        assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
    }

    // Turns, on a service that has split nothing yet: each split cites the
    // previous one for the stake and carries the running count.
    let (mut lab, mut svc, f, stake, low, high) = duo();
    let r1 = unit_receipt(&mut lab, &mut svc);
    let s1 = unit_split(&mut lab, &mut svc, f, stake, r1, low, None, Some(vec![(low, 1), (high, 0)]));
    let e = lab.view().split(&s1).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty() && e.count_unknown.is_empty(), "{e:?}");
    let r2 = unit_receipt(&mut lab, &mut svc);
    let s2 = unit_split(&mut lab, &mut svc, f, stake, r2, high, Some(s1), Some(vec![(low, 1), (high, 1)]));
    let e = lab.view().split(&s2).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "the member with fewer leftover units takes the next: {e:?}");
    assert_eq!(lab.view().turns(&svc.id, &f, stake, &[(low, 500_000), (high, 500_000)], Some(&s2)).unwrap(), Some(vec![1, 1]), "one leftover unit each so far");
    let r3 = unit_receipt(&mut lab, &mut svc);
    let s3 = unit_split(&mut lab, &mut svc, f, stake, r3, low, Some(s2), Some(vec![(low, 2), (high, 1)]));
    let e = lab.view().split(&s3).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "equal counts: the smaller identity hash again: {e:?}");
    let r4 = unit_receipt(&mut lab, &mut svc);
    // The fourth carries a count that lies: the unit goes to the member
    // with fewer, as it should, but the count says nobody had any before.
    let s4 = unit_split(&mut lab, &mut svc, f, stake, r4, high, Some(s3), Some(vec![(low, 0), (high, 1)]));
    let e = lab.view().split(&s4).unwrap();
    assert!(e.mismatched.is_empty());
    assert_eq!(
        e.breaks,
        vec![law::ChainBreak::Count { stake, carried: vec![(low, 0), (high, 1)], expected: std::collections::BTreeMap::from([(low, 2), (high, 2)]).into_iter().collect() }],
        "the running count is checked from two acts"
    );

    // From two acts: a verifier holding s3 but neither s1 nor s2 still
    // checks s4's count, and a tie after s3.
    let mut v = mor_core::chain::Verifier::with_mips(common::identity_spec(), common::finance_spec(), law_spec());
    for (a, key) in &lab.w.log {
        if a.id() != s1 && a.id() != s2 {
            v.add_with_key(a.clone(), key.as_ref()).unwrap();
        }
    }
    let mut lv = LawView::new(&v, mips());
    lv.ext_layers.insert(ext(), vec![]);
    let e = lv.split(&s4).unwrap();
    assert!(matches!(e.breaks.as_slice(), [law::ChainBreak::Count { .. }]), "{:?}", e.breaks);
    assert_eq!(lv.turns(&svc.id, &f, stake, &[(low, 500_000), (high, 500_000)], Some(&s3)).unwrap(), Some(vec![2, 1]));
    let e = lv.split(&s3).unwrap();
    assert_eq!(e.count_unknown, vec![stake], "s3's own previous, s2, is not held: its count is unknown, never a deviation");
    assert_eq!(e.turns_unknown, vec![stake]);
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "{e:?}");

    // A split citing an act not held: the tied unit and the count are
    // unknown, and either member's payout is within one unit; the rest
    // still checked.
    let r5 = unit_receipt(&mut lab, &mut svc);
    let x = unit_split(&mut lab, &mut svc, f, stake, r5, high, Some(spec("a split this verifier does not hold")), Some(vec![(high, 9)]));
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.turns_unknown, vec![stake]);
    assert_eq!(e.count_unknown, vec![stake]);
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "{e:?}");
}

/// F171 (review of F163 to F168, finding 7): a split citing no previous
/// split for the stake, when the service has split on it before, resets
/// the count, and breaks the plan (rule 15a, rule 46b). F165 left it open:
/// a service that wanted every tied unit to go to the smaller identity hash
/// signed each split as if it were the first, every count then zero, each
/// split passing (the test this one replaces,
/// `flaw_a_service_citing_no_previous_receipt_restarts_the_turns`).
///
/// A verifier holding two first splits cannot tell from the acts which
/// came later, so each is shown, naming the other; the holder's client,
/// keeping the chain as the splits arrive, names the second.
#[test]
fn a_split_service_citing_no_previous_split_resets_the_count_a_deviation() {
    let (mut lab, mut svc, f, stake, low, _high) = duo();
    let mut firsts: Vec<Hash> = vec![];
    for i in 0..5 {
        let r = unit_receipt(&mut lab, &mut svc);
        let x = unit_split(&mut lab, &mut svc, f, stake, r, low, None, Some(vec![(low, 1)]));
        let e = lab.view().split(&x).unwrap();
        assert!(e.mismatched.is_empty(), "each split, judged alone, pays the tie as a first split would");
        if i == 0 {
            assert!(e.breaks.is_empty(), "the first split for the stake cites none: {:?}", e.breaks);
        } else {
            let mut with = firsts.clone();
            with.sort();
            assert_eq!(e.breaks, vec![law::ChainBreak::Reset { stake, with }], "a reset: the plan is broken");
        }
        firsts.push(x);
    }
    // The first, judged now, shares its start with the resets.
    let e = lab.view().split(&firsts[0]).unwrap();
    assert!(matches!(e.breaks.as_slice(), [law::ChainBreak::Reset { with, .. }] if with.len() == 4), "{:?}", e.breaks);
}

/// F171: two splits citing the same previous split for the stake fork the
/// chain, and break the plan (rule 15a, rule 46b), even where each is
/// consistent with the previous one: two consecutive acts show
/// consistency, not truth. A split that cites an earlier split than the
/// latest is seen this way: it shares its previous with the split after it.
#[test]
fn two_splits_citing_the_same_previous_fork_the_chain_a_deviation() {
    let (mut lab, mut svc, f, stake, low, high) = duo();
    let r1 = unit_receipt(&mut lab, &mut svc);
    let s1 = unit_split(&mut lab, &mut svc, f, stake, r1, low, None, Some(vec![(low, 1), (high, 0)]));
    let r2 = unit_receipt(&mut lab, &mut svc);
    let s2 = unit_split(&mut lab, &mut svc, f, stake, r2, high, Some(s1), Some(vec![(low, 1), (high, 1)]));
    assert!(lab.view().split(&s2).unwrap().breaks.is_empty());
    let r3 = unit_receipt(&mut lab, &mut svc);
    let s3 = unit_split(&mut lab, &mut svc, f, stake, r3, low, Some(s2), Some(vec![(low, 2), (high, 1)]));
    // The fork: a second split citing s2, paying the unit to the low
    // member as s3 did, and carrying the count s3 carries. Judged against
    // s2 alone it is right; the low member has now had two units of three
    // from s2's position, which the chain would have shown.
    let r4 = unit_receipt(&mut lab, &mut svc);
    let s3b = unit_split(&mut lab, &mut svc, f, stake, r4, low, Some(s2), Some(vec![(low, 2), (high, 1)]));
    let e = lab.view().split(&s3b).unwrap();
    assert!(e.mismatched.is_empty(), "consistent with the previous split: {e:?}");
    assert_eq!(e.breaks, vec![law::ChainBreak::Fork { stake, previous: s2, with: vec![s3] }], "a fork: the plan is broken");
    let e = lab.view().split(&s3).unwrap();
    assert_eq!(e.breaks, vec![law::ChainBreak::Fork { stake, previous: s2, with: vec![s3b] }], "shown on both: the acts carry no order to trust");
    // A split citing the latest, s3, continues the chain.
    let r5 = unit_receipt(&mut lab, &mut svc);
    let s4 = unit_split(&mut lab, &mut svc, f, stake, r5, high, Some(s3), Some(vec![(low, 2), (high, 2)]));
    let e = lab.view().split(&s4).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "{e:?}");
    // A split carrying no count for the stake breaks the plan too (rule
    // 15a: each split carries it); the next one's count is then unknown.
    let r6 = unit_receipt(&mut lab, &mut svc);
    let s5 = unit_split(&mut lab, &mut svc, f, stake, r6, low, Some(s4), None);
    assert_eq!(lab.view().split(&s5).unwrap().breaks, vec![law::ChainBreak::NoCount { stake }]);
    let r7 = unit_receipt(&mut lab, &mut svc);
    let s6 = unit_split(&mut lab, &mut svc, f, stake, r7, high, Some(s5), Some(vec![(low, 3), (high, 3)]));
    let e = lab.view().split(&s6).unwrap();
    assert_eq!((e.count_unknown, e.turns_unknown, e.breaks), (vec![stake], vec![stake], vec![]));
}

/// The split, as rule 20, 22 and 26 bind it (audit, October 2026, gap 8).
/// A split is the named service's own act, under the agreement in force:
/// a stranger's split, one signed with the grant key, or one naming a
/// version the owners have left is shown broken, and its payouts are
/// judged against the stakes as currently held. A role payout earns only
/// with evidence that holds (rule 22, F119); a fee or a named receiver is
/// what only the plan, its format open, could justify: shown, never passed.
#[test]
fn a_split_is_the_named_services_act_under_the_version_in_force() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let label = lab.c[0].id;
    let rail = spec("a rail Module");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut stranger = lab.w.genesis("a stranger", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let k1 = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k1)).collect();
    let rec = lab.record(0, Some((k1, sigs)), &[], vec![], k1);
    // The label's pointer names the rail (F115), signed by its Finance holder.
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    // Money coming in: the service's receipt with its grant key.
    let mut st = lab.strand(g, &key_of(svc.id));
    st.cite = Some((label, vec![g, rec]));
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: b"a fan's payment".to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: k1,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut st, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.view().backing(&incoming).unwrap(), Backing::Backed { .. }));
    let stake = lab.view().terms(&k1).unwrap().own_stake().unwrap().0 as u64;
    let pay = |who: Hash, amount: u64| law::Payout { receiver: who, amount, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None };
    let split = |agreement: Hash, payouts: Vec<law::Payout>| law::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), agreement, tally: None, number: None };
    let by_stakes = vec![pay(ids[ANA], 400), pay(ids[BEN], 300), pay(ids[CY], 300)];
    let everyone = ids.clone();
    // The service's own split, naming the version in force: no problem.
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(k1, by_stakes.clone()).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.is_empty(), "{:?}", e.problems);
    assert_eq!(e.in_force, k1);
    assert!(e.mismatched.is_empty() && e.unevidenced.is_empty() && e.unplanned.is_empty());
    // A stranger's split of the same receipt: not the service's (rule 20).
    let x = lab.w.private_act(&mut stranger, mips().law, law::types::SPLIT, split(k1, by_stakes.clone()).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.iter().any(|p| p.contains("signer")), "{:?}", e.problems);
    // One signed with the grant key, the label's own act: not the
    // service's own key.
    let x = {
        let a = lab.w.everyday_act(&mut st, mips().law, law::types::SPLIT, split(k1, by_stakes.clone()).to_map(), None, None);
        lab.w.add(&a)
    };
    assert!(lab.view().split(&x).unwrap().problems.iter().any(|p| p.contains("grant key")));
    // Cy sells his share to Ana: a clone every holder signs. A split naming
    // the older version, paying Cy, is judged against the stakes as
    // currently held (rule 26): shown broken, Cy and Ana mismatched.
    let t2 = lab.clone_terms(&k1, vec![(Power::Clone, vec![ANA, BEN, CY])], &|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 700_000), (p[BEN], 300_000)])]);
    });
    let k2 = lab.propose(ANA, &t2);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k2)).collect();
    let rec2 = lab.record(0, Some((k2, sigs)), &[], vec![], k2);
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(k1, by_stakes.clone()).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.in_force, k2, "{:?}", clone_state(&lab, &rec2));
    assert!(e.problems.iter().any(|p| p.contains("not in force")), "{:?}", e.problems);
    let who: Vec<Hash> = e.mismatched.iter().map(|m| m.holder).collect();
    assert!(who.contains(&ids[ANA]) && who.contains(&ids[CY]), "{who:?}");
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(k2, vec![pay(ids[ANA], 700), pay(ids[BEN], 300)]).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.is_empty() && e.mismatched.is_empty(), "{:?} {:?}", e.problems, e.mismatched);
    // Role shares (rule 22): a referral with no evidence, or evidenced by
    // the service's own act, earns nothing; a fan's act is evidence once
    // the payer the payment commits to names it in its claim (rule 22, "the
    // payer's client for a referral"; F193, F194: never on the role
    // filler's own word); a rail Module's share is evidenced by the receipt
    // naming it (F119).
    let mut fan = lab.w.genesis("a fan", vec![own_home()], None, None);
    let post = lab.w.post(&mut fan, "I sent them here");
    let own_word = lab.w.post(&mut svc, "I say the fan sent them");
    let role = |who: Hash, amount: u64, evidence: Option<Hash>| law::Payout { receiver: who, amount, stake: None, role: Some("referral".into()), evidence, fee_module: None, rail_fee: None };
    let rest = vec![pay(ids[ANA], 630), pay(ids[BEN], 270)];
    let with = |lab: &mut Lab, svc: &mut Person, extra: law::Payout| {
        let mut ps = rest.clone();
        ps.push(extra);
        let x = lab.w.private_act(svc, mips().law, law::types::SPLIT, split(k2, ps).to_map(), None, everyone.clone());
        lab.view().split(&x).unwrap()
    };
    assert_eq!(with(&mut lab, &mut svc, role(fan.id, 100, None)).unevidenced, vec![fan.id]);
    assert_eq!(with(&mut lab, &mut svc, role(fan.id, 100, Some(own_word))).unevidenced, vec![fan.id]);
    assert_eq!(with(&mut lab, &mut svc, role(fan.id, 100, Some(post))).unevidenced, vec![fan.id], "the referrer's own post alone is its own word");
    let mut buyer = lab.w.genesis("the buyer", vec![own_home()], None, None);
    let claim = Fin::Claim(mor_core::finance::Claim {
        rail,
        proof: b"a fan's payment".to_vec(),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: k1,
        disagrees: None,
        referral: Some(mor_core::finance::Referral { identity: fan.id, evidence: post }),
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
    });
    let c = lab.w.everyday_act(&mut buyer, mips().finance, 3, claim.to_map(), None, None);
    let c = lab.w.add(&c);
    lab.rail_valid.push((c, mor_core::finance::PaidAt::Flow(ptr)));
    assert!(with(&mut lab, &mut svc, role(fan.id, 100, Some(post))).unevidenced.is_empty(), "the buyer's claim names the referral");
    let module_share = law::Payout { role: Some("rail".into()), ..role(spec("the Module's maintainer"), 100, Some(incoming)) };
    assert!(with(&mut lab, &mut svc, module_share).unevidenced.is_empty(), "the receipt names the rail the label's pointer names");
    // A fee, or a named receiver: only the plan could justify them.
    let fee = law::Payout { receiver: svc.id, amount: 100, stake: None, role: None, evidence: None, fee_module: Some(spec("a fee Module")), rail_fee: None };
    assert_eq!(with(&mut lab, &mut svc, fee).unplanned, vec![svc.id]);
    let named = law::Payout { receiver: spec("a position"), amount: 100, stake: None, role: None, evidence: None, fee_module: None, rail_fee: None };
    assert_eq!(with(&mut lab, &mut svc, named).unplanned, vec![spec("a position")]);
}

/// Law rules 20, 23 to 25, 29, 30 and 55 (audit, October 2026, gap 3): a
/// split service is held to account. Every receipt its grant key signed
/// for money coming in, and every payer's claim showing money arrived for
/// its grantor, with no split of the service's own, and every payout no
/// receipt of its receiver discharges, is an open obligation of the
/// service, naming its receiver and agreement. A stranger's split hides
/// nothing; a revoked service still owes on what it received (rule 30).
/// What makes theft provable (rule 31).
#[test]
fn a_split_service_is_held_to_account() {
    use mor_core::finance::{Amount, PaidAt, Payer, Payload as Fin, Purchase, Receipt};
    use mor_core::law::{Unpaid, Unsplit};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 300_000), (p[CY], 200_000)])]);
    });
    let ids = lab.ids();
    let label = lab.c[0].id;
    let unit = spec("a unit");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut stranger = lab.w.genesis("a stranger", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let k = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    let rec = lab.record(0, Some((k, sigs)), &[], vec![], k);
    let mut st = lab.strand(g, &key_of(svc.id));
    st.cite = Some((label, vec![g, rec]));
    let incoming = |lab: &mut Lab, st: &mut Person, value: u64, proof: &[u8]| {
        let r = Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: label,
            amount: Amount { unit, value },
            fulfils: k,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k, line: k }),
        });
        let a = lab.w.everyday_act(st, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let r1 = incoming(&mut lab, &mut st, 1000, b"the first sale");
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit, vec![Unsplit { payment: r1, claim: false, receiver: label, agreement: k, amount: Amount { unit, value: 1000 } }]);
    assert!(account.unpaid.is_empty());
    let stake = lab.view().terms(&k).unwrap().own_stake().unwrap().0 as u64;
    let pay = |who: Hash, amount: u64| law::Payout { receiver: who, amount, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None };
    let split = |receipt: Hash| law::Split { receipt, payouts: vec![pay(ids[ANA], 500), pay(ids[BEN], 300), pay(ids[CY], 200)], cmip: spec("a split cMIP"), agreement: k, tally: None, number: None };
    // A stranger's split names it: the service still owes a split.
    let _ = lab.w.private_act(&mut stranger, mips().law, law::types::SPLIT, split(r1).to_map(), None, ids.clone());
    assert_eq!(lab.view().service_account(&svc.id).unwrap().unsplit.len(), 1);
    // The service's own split: nothing unsplit; three payouts unpaid.
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r1).to_map(), None, ids.clone());
    let account = lab.view().service_account(&svc.id).unwrap();
    assert!(account.unsplit.is_empty());
    let unpaid = |i: usize, who: Hash, amount: u64, received: u64| Unpaid { split: x, payout: i, receiver: who, agreement: k, amount, received };
    assert_eq!(account.unpaid, vec![unpaid(0, ids[ANA], 500, 0), unpaid(1, ids[BEN], 300, 0), unpaid(2, ids[CY], 200, 0)]);
    // Each payout is discharged by its receiver's own receipt naming the
    // split (rule 23): Ana's in full, Ben's for less (open for the rest,
    // rule 24a), Cy's a receipt the stranger signs in his name, which is
    // nobody's receipt of his.
    let paid = |lab: &mut Lab, who: &mut Person, value: u64, naming: Hash| {
        let r = Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(svc.id)),
            payee: who.id,
            amount: Amount { unit, value },
            fulfils: naming,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = lab.w.everyday_act(who, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let mut ana = lab.m[ANA].clone();
    paid(&mut lab, &mut ana, 500, x);
    lab.m[ANA] = ana;
    let mut ben = lab.m[BEN].clone();
    paid(&mut lab, &mut ben, 250, x);
    lab.m[BEN] = ben;
    let mut forger = stranger.clone();
    forger.id = ids[CY];
    let _ = {
        let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: vec![], payer: Some(Payer::Identity(svc.id)), payee: ids[CY], amount: Amount { unit, value: 200 }, fulfils: x, previous: None, forward: None, batch: None, purchase: None });
        let a = lab.w.everyday_act(&mut stranger, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unpaid, vec![unpaid(1, ids[BEN], 300, 250), unpaid(2, ids[CY], 200, 0)]);
    // A receipt naming another split pays nothing on this one.
    let mut cy = lab.m[CY].clone();
    paid(&mut lab, &mut cy, 200, spec("another split"));
    lab.m[CY] = cy;
    assert_eq!(lab.view().service_account(&svc.id).unwrap().unpaid.len(), 2);
    // A payer's claim with the rail's answer, to the label, which holds no
    // receipt for it: money arrived, to be split (rule 20).
    let mut payer = lab.w.genesis("a paying fan", vec![own_home()], None, None);
    let c = payment(&mut lab, &mut payer, true, label, k, unit, 70, b"a claimed sale");
    assert!(lab.view().service_account(&svc.id).unwrap().unsplit.is_empty(), "no rail answer yet");
    lab.rail_valid.push((c, PaidAt::Flow(spec("the label's pointer"))));
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit, vec![Unsplit { payment: c, claim: true, receiver: label, agreement: k, amount: Amount { unit, value: 70 } }]);
    // The service signs its receipt for it: the receipt is what it splits.
    let r2 = incoming(&mut lab, &mut st, 70, b"a claimed sale");
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit.iter().map(|u| u.payment).collect::<Vec<_>>(), vec![r2]);
    // The label revokes the grant: the old service still owes on
    // everything it received before (rule 30).
    let o = lab.chain(&[r2]);
    let rv = lab.w.everyday_act(&mut lab.c[0], mips().law, law::types::REVOCATION, law::Revocation { grant: g }.to_map(), Some(o), None);
    let rv = lab.w.add(&rv);
    lab.sign(BEN, &rv);
    assert!(lab.counts(&rv));
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit.len(), 1);
    assert_eq!(account.unpaid.len(), 2);
}

/// Freeze suite v21, 3.7r (F121, F123, F124 P2): the pointer check, now
/// reaching the vault. The label's pointer counts for Law only if every
/// address in it is in the split service's own signed pointer in force, and
/// every entry of its vault in the service's own vault, or both in those of
/// a service its chain of judgment names to take over (reading 4).
#[test]
fn the_pointer_check() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut svc = lab.w.genesis_with(
        "a split service",
        vec![own_home()],
        None,
        None,
        Some(vec![mor_core::finance::vault_declaration(&mips().finance, &[vault_entry(b"the service's vault")])]),
        3,
    );
    let mut svc2 = lab.w.genesis("a second split service", vec![own_home()], None, None);
    let g1 = lab.grant(&plain_grant(svc.id, false));
    let g2 = lab.grant(&plain_grant(svc2.id, false));
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.split_grant = Some(g1);
        t.time = Some((spec("a clock"), Value::Uint(0)));
        t.chain = Some(vec![law::ChainLink { judge: law::Judge::SplitService, next: vec![(g2.into(), 30)] }]);
    });
    let k = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.record(0, Some((k, s)), &[], vec![], k);
    let label = lab.c[0].id;
    pointer_of(&mut lab.w, &mut svc, 1, None, &[b"the service's node"]);
    pointer_of(&mut lab.w, &mut svc2, 1, None, &[b"the second service's node"]);
    let p1 = pointer_of(&mut lab.w, &mut lab.c[0], 1, None, &[b"the service's node"]);
    lab.sign(BEN, &p1);
    assert_eq!(lab.view().pointer_check(&label, &k).unwrap(), law::PointerCheck::Ordinary { pointer: p1, service: svc.id });
    let p2 = pointer_of(&mut lab.w, &mut lab.c[0], 2, Some(p1), &[b"the service's node", b"the treasurer's own node"]);
    lab.sign(BEN, &p2);
    match lab.view().pointer_check(&label, &k).unwrap() {
        law::PointerCheck::Bypasses { pointer, missing, vault_missing } => {
            assert_eq!(pointer, p2);
            assert_eq!(missing.len(), 1);
            assert_eq!(missing[0].address, b"the treasurer's own node".to_vec());
            assert!(vault_missing.is_empty());
        }
        other => panic!("{other:?}"),
    }
    let p3 = pointer_of(&mut lab.w, &mut lab.c[0], 3, Some(p2), &[b"the service's node"]);
    lab.sign(BEN, &p3);
    assert_eq!(lab.view().pointer_check(&label, &k).unwrap(), law::PointerCheck::Ordinary { pointer: p3, service: svc.id });
    // P2: the label's vault takes payments above its limit to an address
    // of the treasurer's own: the vault bypasses the service, shown so.
    lab.rotate_with(
        Some(vec![mor_core::finance::vault_declaration(&mips().finance, &[vault_entry(b"the treasurer's own vault")])]),
        &[0],
    );
    match lab.view().pointer_check(&label, &k).unwrap() {
        law::PointerCheck::Bypasses { missing, vault_missing, .. } => {
            assert!(missing.is_empty());
            assert_eq!(vault_missing, vec![vault_entry(b"the treasurer's own vault")]);
        }
        other => panic!("{other:?}"),
    }
    // The vault the service's own vault carries: ordinary again.
    lab.rotate_with(
        Some(vec![mor_core::finance::vault_declaration(&mips().finance, &[vault_entry(b"the service's vault")])]),
        &[0],
    );
    assert_eq!(lab.view().pointer_check(&label, &k).unwrap(), law::PointerCheck::Ordinary { pointer: p3, service: svc.id });
    assert_eq!(lab.view().pointer_check(&label, &f).unwrap(), law::PointerCheck::NoSplitService);
}

/// F124 P2: payer-side splitting. Where the owners' agreement names no
/// split service, a wallet reading Law pays each holder's own pointer by
/// the stake's shares; a holder that is a collective splitting payer-side
/// too is followed to the holders of its stake in itself.
#[test]
fn payer_side_splitting_follows_the_claim() {
    let work = spec("a work");
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 250_000), (p[CY], 250_000)]), owns(work)]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let got = lab.view().payer_split(&f, &Who::Id(work), 1001).unwrap().unwrap();
    assert_eq!(got, vec![(ids[ANA], 501), (ids[BEN], 250), (ids[CY], 250)]);
    // F168 (10): Ben and Cy tie for 1002's leftover unit. The payer
    // decides, at most one unit per tie, a stated cost; no receipt exists
    // yet, so no hash can (F162's undetermined answer withdrawn). This
    // wallet gives it to the smaller identity hash, a choice, not a rule.
    let got = lab.view().payer_split(&f, &Who::Id(work), 1002).unwrap().unwrap();
    let first = if ids[BEN] < ids[CY] { BEN } else { CY };
    let want: Vec<(Hash, u64)> = [(ANA, 501), (BEN, 250), (CY, 250)].iter().map(|(i, n)| (ids[*i], n + u64::from(*i == first))).collect();
    assert_eq!(got, want);
    // A deal in which the label holds 60% and a guest 40%.
    let guest = lab.w.genesis("a guest", vec![own_home()], None, None);
    let label = lab.c[0].id;
    let deal = Terms {
        parties: vec![ids[ANA], guest.id],
        text: "A work shared with a guest.".into(),
        cmips: vec![],
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
        stakes: Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(label), 600_000), (Who::Id(guest.id), 400_000)] }]),
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
    };
    let d = law_act(&mut lab.w, &mut lab.m[ANA], law::types::TERMS, deal.to_map(), None);
    let got = lab.view().payer_split(&d, &Who::Id(work), 1000).unwrap().unwrap();
    assert_eq!(got, vec![(ids[ANA], 300), (ids[BEN], 150), (ids[CY], 150), (guest.id, 400)]);
}

/// Rule 15a (F150; the hostile review of F133 to F144, finding 6): one
/// unit among holders at 333,333, 333,333 and 333,334 goes to the largest
/// remainder, the third, however the holders are listed: a clone that only
/// reorders them moves nothing. F140 gave it to the first listed.
#[test]
fn leftovers_go_by_largest_remainder_whatever_the_order() {
    let work = spec("a work");
    let mut lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let deal = |holders: Vec<(Hash, u64)>| Terms {
        parties: ids.clone(),
        text: "A work shared three ways.".into(),
        cmips: vec![],
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
        stakes: Some(vec![law::Stake { object: Who::Id(work), holders: holders.into_iter().map(|(h, n)| (Who::Id(h), n)).collect() }]),
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
    };
    let listed = [vec![(ids[ANA], 333_333), (ids[BEN], 333_333), (ids[CY], 333_334)], vec![(ids[CY], 333_334), (ids[ANA], 333_333), (ids[BEN], 333_333)]];
    for holders in listed.iter() {
        assert_eq!(law::divide_stake(1, holders, law::Ties::Open).unwrap().iter().zip(holders).find(|(n, _)| **n == 1).map(|(_, h)| h.0), Some(ids[CY]));
        let d = law_act(&mut lab.w, &mut lab.m[ANA], law::types::TERMS, deal(holders.clone()).to_map(), None);
        let mut got = lab.view().payer_split(&d, &Who::Id(work), 1).unwrap().unwrap();
        got.sort();
        let mut want = vec![(ids[ANA], 0), (ids[BEN], 0), (ids[CY], 1)];
        want.sort();
        assert_eq!(got, want, "the third holder, wherever listed");
    }
    // Two units: the third's remainder first, then Ana and Ben tie; they
    // take turns (F165), equal counts to the smaller identity hash, the
    // listing never deciding.
    for holders in listed.iter() {
        let parts = law::divide_stake(2, holders, law::Ties::Turns(&[0, 0, 0])).unwrap();
        let of = |h: Hash| parts[holders.iter().position(|x| x.0 == h).unwrap()];
        let ana_first = ids[ANA] < ids[BEN];
        assert_eq!((of(ids[ANA]), of(ids[BEN]), of(ids[CY])), if ana_first { (1, 0, 1) } else { (0, 1, 1) });
    }
}

/// The successor of one side, founded first (N4): founding terms whose
/// parties are the side's members, keeping each departed holder at their
/// share of all its income, recorded departed; the members divide the
/// rest. Its genesis declares them. Returns (identity, terms).
fn found_successor(lab: &mut Lab, name: &str, members: &[usize], kept: &[(Hash, u64)], original: Hash) -> (Person, Hash) {
    let ids = lab.ids();
    let m: Vec<Hash> = members.iter().map(|i| ids[*i]).collect();
    let rest = 1_000_000 - kept.iter().map(|(_, n)| n).sum::<u64>();
    let t = label_terms(&ids, lab.authority.id, lab.keeper.id, &|t| {
        t.parties = m.clone();
        t.clone = Rule::Threshold(m.len().min(2) as u64);
        t.areas.as_mut().unwrap()[0].holders = vec![m[0]];
        t.areas.as_mut().unwrap()[1].holders = vec![*m.last().unwrap()];
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 1, members: m.clone() };
        g.safety = Holding::Shares { threshold: m.len() as u64, members: m.clone() };
        let mut holders: Vec<(Hash, u64)> = kept.to_vec();
        let each = rest / m.len() as u64;
        for (i, x) in m.iter().enumerate() {
            holders.push((*x, if i == 0 { rest - each * (m.len() as u64 - 1) } else { each }));
        }
        t.stakes = stakes(vec![own(holders)]);
        if !kept.is_empty() {
            t.departed = Some(kept.iter().map(|(h, _)| *h).collect());
        }
        t.forked_from = Some(original);
    });
    let x = law_act(&mut lab.w, &mut lab.m[members[0]], law::types::TERMS, t.to_map(), None);
    for i in members {
        lab.sign(*i, &x);
    }
    let mut p = lab.w.genesis_with(name, vec![own_home()], None, None, Some(vec![law::founding_declaration(&mips().law, &x)]), 3);
    p.cite = Some((p.id, vec![p.id]));
    (p, x)
}

/// Freeze suite v21, 3.9 (F121 shape B, F124 N1 to N4, N13, N14): the fork
/// of a collective. Each side founds its successor first; the fork act names
/// them; every member signs under the constitutional rule (every party
/// here); the original is closed in Law; its ownership passes to the
/// successors by the members' stakes; the departed holder keeps their share
/// in each; the fork hands out every obligation in the history it cites,
/// published or not, each successor signing for its debts (F127); grants
/// end, a grantee's deal the history cites binding, any other void (the
/// tie rule); open offers are withdrawn; a payment the original's chain
/// never recorded is no purchase (W2). 3.9g (F127, replacing F125 D1): a
/// debt still unpublished at the fork must be handed out all the same, so
/// publishing it later changes nothing; a successor cannot close while it
/// owes it (D5).
#[test]
fn a_collective_forks() {
    let dee = spec("dee");
    let work = spec("a work made before the fork");
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 250_000), (p[BEN], 250_000), (p[CY], 250_000), (dee, 250_000)]), owns(work)]);
        t.departed = Some(vec![dee]);
    });
    let mut svc = lab.w.genesis("the old split service", vec![own_home()], None, None);
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.c[0].id;
    // The old split service, named by the label.
    let g_svc = lab.grant(&plain_grant(svc.id, false));
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g_svc));
    let k = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.record(0, Some((k, s)), &[], vec![], k);
    // Before the fork: a publication, an open offer, a grant and a deal
    // under it, and three debts, two of them public.
    let before = lab.publish(0);
    lab.sign(ANA, &before);
    let offer = {
        let a = lab.w.everyday_act(&mut lab.c[0], mips().law, law::types::STANDING_OFFER, vec![(Value::Uint(0), Value::Text("an offer".into()))], None, None);
        lab.w.add(&a)
    };
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    // Acting for the label (scope 2): its "deals" here are acts of a test
    // cMIP, not Law terms, which scope 0 is for (rule 38).
    let g = lab.grant(&plain_grant(agent.id, false));
    sign(&mut lab.w, &mut agent, &g);
    // F128: the agent signs with its grant key, on its strand of the
    // label's actions chain.
    // Two of the agent's devices, each a strand under the same grant key.
    let mut s1 = lab.strand(g, &key_of(agent.id));
    let mut s2 = s1.clone();
    let deal_on_chain = |lab: &mut Lab, st: &mut Person| {
        let a = lab.w.everyday_act(st, spec("a deal cMIP"), 0, vec![(Value::Uint(0), Value::Text("a deal".into()))], None, None);
        lab.w.add(&a)
    };
    // One deal the label's chain never cites; another its next act joins.
    let deal = deal_on_chain(&mut lab, &mut s1);
    let cited_deal = deal_on_chain(&mut lab, &mut s2);
    let o = lab.chain(&[cited_deal]);
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a deal cMIP"), 1, vec![], Some(o), None);
    lab.w.add(&a);
    let d1 = obligation(&mut lab, "a supplier", 900);
    // The creditor of d2 is an identity, so that its own receipt can
    // discharge it (Finance rule 7; `docs/law-invariants.md`, IC2).
    let mut supplier = lab.w.genesis("another supplier's till", vec![own_home()], None, None);
    let d2 = obligation_to(&mut lab, supplier.id, 300);
    let mut hidden = lab.w.genesis("a creditor kept out of sight", vec![own_home()], None, None);
    let d3 = obligation_to(&mut lab, hidden.id, 50);
    // Each side founds its successor first (N4); the departed holder keeps
    // their quarter in each.
    let kept = vec![(dee, 250_000)];
    let (mut sa, ta) = found_successor(&mut lab, "side A", &[ANA], &kept, label);
    let (mut sb, tb) = found_successor(&mut lab, "side B", &[BEN, CY], &kept, label);
    let (sa_id, sb_id) = (sa.id, sb.id);
    let fork = |lab: &Lab, debts: Vec<(Hash, Vec<u64>)>| law::Fork {
        agreement: k,
        collective: label,
        chain_act: lab.c[0].binding,
        tips: vec![tip(&lab.c[0])],
        sides: vec![law::Side { successor: sa_id, members: vec![ids[ANA]] }, law::Side { successor: sb_id, members: vec![ids[BEN], ids[CY]] }],
        shares: vec![],
        debts,
    };
    // F127: the fork cites its history (its line), and must hand out
    // everything in it, d3 included, unpublished as it is: otherwise the
    // fork does not take effect.
    let x = fork(&lab, vec![(d1, vec![1]), (d2, vec![0, 1])]);
    let eo = ending_obj(&lab, k, x.collective);
    let short = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
    lab.end(ANA, &short);
    for i in [BEN, CY] {
        lab.end(i, &short);
    }
    sign(&mut lab.w, &mut sb, &short);
    sign(&mut lab.w, &mut sa, &short);
    let e = lab.view().fork(&short).unwrap();
    assert!(!e.complete);
    assert_eq!(e.unassigned, vec![d3]);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("F127")), "{:?}", e.why);
    // Every debt handed out: d1 to side B, d2 to both jointly, d3 to A.
    let x = fork(&lab, vec![(d1, vec![1]), (d2, vec![0, 1]), (d3, vec![0])]);
    let eo = ending_obj(&lab, k, x.collective);
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fa);
    lab.end(BEN, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "Cy has not signed");
    lab.end(CY, &fa);
    sign(&mut lab.w, &mut sb, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "side A's successor has not signed for its debt");
    assert!(e.why.as_deref().is_some_and(|w| w.contains("N13")), "{:?}", e.why);
    sign(&mut lab.w, &mut sa, &fa);
    let v = lab.view();
    let e = v.fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.voices, vec![ids[ANA], ids[BEN], ids[CY]]);
    assert_eq!(e.successors[1], Some(tb));
    assert_eq!(e.shares, vec![333_333, 666_667], "the leftover to the largest remainder (F150, F162)");
    assert_eq!(e.kept, vec![(dee, 250_000)]);
    assert!(!e.by_count);
    assert!(e.unassigned.is_empty());
    let idx = v.terms(&k).unwrap().stake_on(&Who::Id(work)).unwrap().0 as u64;
    assert_eq!(v.fork_transfer(&fa, &k, idx).unwrap(), Some(vec![333_333, 666_667]));
    // d3, unpublished, is done all the same (sealed to every member, on
    // the chain): it binds, and it is handed out. Where an act is held is
    // never a condition (F128).
    assert_eq!(v.obligation_binds(&d3).unwrap(), Some(true));
    assert_eq!(v.debtors(&d1).unwrap(), Some(vec![sb.id]));
    assert_eq!(v.debtors(&d2).unwrap(), Some(vec![sa.id, sb.id]));
    drop(v);
    // Closed in Law: what the label's keys sign afterwards counts for
    // nothing; what it signed before stands.
    let after = lab.publish(0);
    lab.sign(ANA, &after);
    assert_eq!(lab.view().consent(&after).unwrap(), Consent::Closed { by: fa });
    assert!(lab.view().consent(&before).unwrap().counts());
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    assert_eq!(lab.view().offer_withdrawn(&offer).unwrap(), Some(fa));
    // The grantee's deals: the one the fork's history cites binds; the
    // other is missing from the ending's history, and void (the tie rule).
    assert_eq!(lab.view().backing(&cited_deal).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(lab.view().backing(&deal).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("tie rule")));
    // A debt the label's device signed after the fork's line: void, owed
    // by nobody (the tie rule; D1's joint liability withdrawn).
    let late = obligation(&mut lab, "a late supplier", 40);
    assert_eq!(lab.view().obligation_binds(&late).unwrap(), Some(false));
    assert_eq!(lab.view().debtors(&late).unwrap(), Some(vec![]));
    // F126 (replacing N14's stray payment and reading 9): a wallet that
    // does not read Law pays the withdrawn offer, naming no claim; the old
    // split service receives it. No purchase: money received for nothing,
    // owed back to the payer.
    let pay = |lab: &mut Lab, svc: &mut Person, purchase: Option<mor_core::finance::Purchase>| {
        let r = mor_core::finance::Payload::Receipt(mor_core::finance::Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(mor_core::finance::Payer::Identity(spec("a fan"))),
            payee: svc.id,
            amount: mor_core::finance::Amount { unit: spec("a unit"), value: 300 },
            fulfils: offer,
            previous: None,
            forward: None,
            batch: None,
            purchase,
        });
        let a = lab.w.everyday_act(svc, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let stray = pay(&mut lab, &mut svc, None);
    let got = lab.view().purchase(&stray).unwrap().unwrap();
    assert!(matches!(got.verdict, law::PurchaseVerdict::NoPurchase { .. }), "{got:?}");
    assert_eq!(got.refund_to, mor_core::finance::RefundTo::Identity(spec("a fan")));
    // W2 (F127): a payment naming the claim as it stood before the fork,
    // which the original's actions chain never recorded before the fork:
    // no purchase, refunded (3.9k shows a sale it recorded).
    let stale = pay(&mut lab, &mut svc, Some(mor_core::finance::Purchase { agreement: f, line: k }));
    let got = lab.view().purchase(&stale).unwrap().unwrap();
    assert!(matches!(got.verdict, law::PurchaseVerdict::NoPurchase { ref why } if why.contains("W2")), "{got:?}");
    // Naming the fork, at which the claim now stands: a sale once a
    // successor's actions chain records it; until then, unrecorded.
    let current = pay(&mut lab, &mut svc, Some(mor_core::finance::Purchase { agreement: f, line: fa }));
    assert_eq!(lab.view().purchase(&current).unwrap().unwrap().verdict, law::PurchaseVerdict::Unrecorded);
    // Naming a line that is none of the agreement's claims: no purchase.
    let wrong = pay(&mut lab, &mut svc, Some(mor_core::finance::Purchase { agreement: f, line: d1 }));
    assert!(matches!(lab.view().purchase(&wrong).unwrap().unwrap().verdict, law::PurchaseVerdict::NoPurchase { .. }));
    // 3.9g (F127): d3 surfaces, published by its creditor after the fork.
    // It was handed out, so the fork stands as it was, and side A owes it.
    let v = lab.view();
    let e = v.fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(e.unassigned.is_empty());
    assert_eq!(v.current(&label).unwrap().unwrap().closed, Some(fa));
    assert_eq!(v.debtors(&d3).unwrap(), Some(vec![sa.id]));
    assert_eq!(sorted(v.owes(&sa.id).unwrap()), sorted(vec![d2, d3]));
    assert_eq!(sorted(v.owes(&sb.id).unwrap()), sorted(vec![d1, d2]));
    drop(v);
    // D5: side A's successor, holding nothing here, cannot close while it
    // owes d2 (jointly) and d3 (handed to it).
    let sa_terms = ta;
    let closing = law::Closing { agreement: sa_terms, collective: sa.id, chain_act: sa.binding, tips: vec![tip(&sa)], open: vec![] };
    let eo = ending_obj(&lab, sa_terms, closing.collective);
    let cl = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, closing.to_map(), eo);
    lab.end(ANA, &cl);
    let v = lab.view();
    let e = v.closing(&cl).unwrap();
    assert!(!e.complete);
    assert_eq!(sorted(e.open_debts.clone()), sorted(vec![d2, d3]), "{:?}", e.why);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("D5")), "{:?}", e.why);
    drop(v);
    // Side B pays d2 in full; d3's creditor releases it, taking nothing.
    receipt(&mut lab, &mut supplier, sb.id, d2, 300);
    debt_release(&mut lab.w, &mut hidden, d3, vec![]);
    let v = lab.view();
    assert_eq!(v.owes(&sa.id).unwrap(), Vec::<Hash>::new());
    assert_eq!(v.owes(&sb.id).unwrap(), vec![d1]);
    let e = v.closing(&cl).unwrap();
    assert!(e.complete, "{:?}", e.why);
}

/// Freeze suite v21, 3.9g (F127, replacing F125 D1): a fork cites its
/// history (its line) and hands out every obligation in it, or does not
/// take effect: one a device signed and the label's chain joined counts as
/// in it; one on a device the line leaves out is void (the tie rule), owed
/// by nobody; while an act the history names is not held, what it must hand
/// out cannot be told. A later fork of a successor hands out what it
/// inherited too (F125 reading 4, as adjusted in F126).
#[test]
fn a_fork_hands_out_its_whole_history() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.c[0].id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let d1 = obligation(&mut lab, "a supplier", 100);
    let d2 = obligation(&mut lab, "a printer", 60);
    // Two debts on device 1: d4 no act of device 0 ever cites; d5 device
    // 0's next act joins, as the head it saw.
    let debt_on = |lab: &mut Lab, d: usize, creditor: &str| {
        let o = mor_core::finance::Payload::Obligation(mor_core::finance::Obligation {
            debtor: label,
            creditor: spec(creditor),
            amount: mor_core::finance::Amount { unit: spec("a unit"), value: 10 },
            pointer: spec("its pointer"),
            agreement: None,
        });
        let a = lab.w.everyday_act(&mut lab.c[d], mips().finance, 1, o.to_map(), None, None);
        let x = lab.w.add(&a);
        lab.sign(BEN, &x);
        x
    };
    let d5 = debt_on(&mut lab, 1, "a creditor whose debt was joined");
    let o = lab.chain(&[d5]);
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a note cMIP"), 0, vec![], Some(o), None);
    lab.w.add(&a);
    let d4 = debt_on(&mut lab, 1, "a creditor on a device left out");
    let (mut sa, _) = found_successor(&mut lab, "side A", &[ANA], &[], label);
    let (mut sb, tb) = found_successor(&mut lab, "side B", &[BEN, CY], &[], label);
    let fork = |lab: &mut Lab, debts: Vec<(Hash, Vec<u64>)>, sa: &mut Person, sb: &mut Person| {
        let x = law::Fork {
            agreement: f,
            collective: label,
            chain_act: lab.c[0].binding,
            tips: vec![tip(&lab.c[0])],
            sides: vec![law::Side { successor: sa.id, members: vec![ids[ANA]] }, law::Side { successor: sb.id, members: vec![ids[BEN], ids[CY]] }],
            shares: vec![],
            debts,
        };
        let eo = ending_obj(&lab, f, x.collective);
        let fk = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
        lab.end(ANA, &fk);
        lab.end(BEN, &fk);
        lab.end(CY, &fk);
        sign(&mut lab.w, sa, &fk);
        sign(&mut lab.w, sb, &fk);
        fk
    };
    // d2 and d5 left out: no fork.
    let short = fork(&mut lab, vec![(d1, vec![0])], &mut sa, &mut sb);
    let e = lab.view().fork(&short).unwrap();
    assert!(!e.complete);
    assert_eq!(sorted(e.unassigned.clone()), sorted(vec![d2, d5]));
    // Everything in the history handed out: the fork takes effect.
    let fk = fork(&mut lab, vec![(d1, vec![0]), (d2, vec![1]), (d5, vec![0, 1])], &mut sa, &mut sb);
    let v = lab.view();
    let e = v.fork(&fk).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(e.unassigned.is_empty());
    assert_eq!(v.debtors(&d1).unwrap(), Some(vec![sa.id]));
    assert_eq!(v.debtors(&d5).unwrap(), Some(vec![sa.id, sb.id]));
    // d4: public and on the relay, but missing from the history the fork
    // cites: made with powers that were ending, void, owed by nobody.
    assert_eq!(v.obligation_binds(&d4).unwrap(), Some(false));
    assert_eq!(v.debtors(&d4).unwrap(), Some(vec![]));
    drop(v);
    // Side B forks in turn: it must hand out d2, which it took on by its
    // own signature on the first fork, in its history.
    let (mut b1, _) = found_successor(&mut lab, "side B1", &[BEN], &[], sb.id);
    let (mut b2, _) = found_successor(&mut lab, "side B2", &[CY], &[], sb.id);
    let (b1_id, b2_id) = (b1.id, b2.id);
    let fork_b = |lab: &mut Lab, debts: Vec<(Hash, Vec<u64>)>, sb: &Person| {
        let x = law::Fork {
            agreement: tb,
            collective: sb.id,
            chain_act: sb.binding,
            tips: vec![tip(sb)],
            sides: vec![law::Side { successor: b1_id, members: vec![ids[BEN]] }, law::Side { successor: b2_id, members: vec![ids[CY]] }],
            shares: vec![],
            debts,
        };
        let eo = ending_obj(&lab, tb, x.collective);
        let x = law_act(&mut lab.w, &mut lab.m[BEN], law::types::FORK, x.to_map(), eo);
        lab.end(BEN, &x);
        lab.end(CY, &x);
        x
    };
    let fb = fork_b(&mut lab, vec![], &sb);
    let e = lab.view().fork(&fb).unwrap();
    assert!(!e.complete);
    assert!(e.unassigned.contains(&d2), "{:?}", e.why);
    sign(&mut lab.w, &mut b1, &fb);
    sign(&mut lab.w, &mut b2, &fb);
    assert!(e.unassigned.contains(&d5), "inherited jointly");
    let fb = fork_b(&mut lab, vec![(d2, vec![0]), (d5, vec![1])], &sb);
    sign(&mut lab.w, &mut b1, &fb);
    sign(&mut lab.w, &mut b2, &fb);
    let e = lab.view().fork(&fb).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(lab.view().debtors(&d2).unwrap(), Some(vec![b1.id]));
    assert_eq!(lab.view().debtors(&d5).unwrap(), Some(vec![sa.id, b2.id]));

    // While an act the history cites is not held, what the fork must hand
    // out cannot be told: no fork, for this verifier.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let mut o = lab.chain(&[]);
    o.push(Object { chain: label, predecessor: spec("an act this verifier does not hold") });
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a note cMIP"), 0, vec![], Some(o), None);
    lab.w.add(&a);
    let (mut sa, _) = found_successor(&mut lab, "side A", &[ANA], &[], label);
    let (mut sb, _) = found_successor(&mut lab, "side B", &[BEN, CY], &[], label);
    let x = law::Fork {
        agreement: f,
        collective: label,
        chain_act: lab.c[0].binding,
        tips: vec![tip(&lab.c[0])],
        sides: vec![law::Side { successor: sa.id, members: vec![ids[ANA]] }, law::Side { successor: sb.id, members: vec![ids[BEN], ids[CY]] }],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fk = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fk);
    lab.end(BEN, &fk);
    lab.end(CY, &fk);
    sign(&mut lab.w, &mut sa, &fk);
    sign(&mut lab.w, &mut sb, &fk);
    let e = lab.view().fork(&fk).unwrap();
    assert!(!e.complete);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("not held")), "{:?}", e.why);
}

/// Freeze suite v21, 3.9d (F124 N1): under a constitutional rule of two of
/// three, Ana and Ben fork without Cy, who signs no side: no seat in any
/// successor, and a departed holder of each at their percentage. Without
/// the rule met, no fork.
#[test]
fn a_member_who_signs_no_side() {
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(2));
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 250_000), (p[CY], 250_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.c[0].id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let kept = vec![(ids[CY], 250_000)];
    let (sa, ta) = found_successor(&mut lab, "side A", &[ANA], &kept, label);
    let (sb, _) = found_successor(&mut lab, "side B", &[BEN], &kept, label);
    // A successor that drops Cy is no successor.
    let (sbad, _) = found_successor(&mut lab, "side B without Cy", &[BEN], &[], label);
    let (binding, t0) = (lab.c[0].binding, tip(&lab.c[0]));
    let x = |succ: Hash| law::Fork {
        agreement: f,
        collective: label,
        chain_act: binding,
        tips: vec![t0],
        sides: vec![law::Side { successor: sa.id, members: vec![ids[ANA]] }, law::Side { successor: succ, members: vec![ids[BEN]] }],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x(sbad.id).collective);
    let bad = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x(sbad.id).to_map(), eo);
    lab.end(ANA, &bad);
    lab.end(BEN, &bad);
    let e = lab.view().fork(&bad).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("N4")), "{:?}", e.why);
    let eo = ending_obj(&lab, f, x(sb.id).collective);
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x(sb.id).to_map(), eo);
    lab.end(ANA, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "Ben has not signed: Ana alone does not meet two of three");
    lab.end(BEN, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.leaving, vec![ids[CY]]);
    assert_eq!(e.kept, vec![(ids[CY], 250_000)]);
    assert_eq!(e.successors[0], Some(ta));
    // By the joining members' stakes: Ana's half against Ben's quarter.
    assert_eq!(e.shares, vec![666_667, 333_333]);
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    let after = lab.publish(0);
    lab.sign(ANA, &after);
    assert!(!lab.counts(&after));
}

/// 3.9 (F121, B; F124 N4): what is not a fork. A member whose voice remains
/// left off a fork under every-party, a stranger on a side, a fork naming
/// an agreement not in force, closes nothing; with no stakes written, each
/// member counts alike (N3); two complete forks are concurrent acts on the
/// agreement chain, and the status quo stands.
#[test]
fn what_is_not_a_fork() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let label = lab.c[0].id;
    let (sa, _) = found_successor(&mut lab, "side A", &[ANA, BEN], &[], label);
    let (sb, _) = found_successor(&mut lab, "side B", &[CY], &[], label);
    let side = |s: &Person, m: Vec<Hash>| law::Side { successor: s.id, members: m };
    let cases: Vec<(&str, Vec<law::Side>, Hash)> = vec![
        ("a member on no side", vec![side(&sa, vec![ids[ANA]]), side(&sb, vec![ids[BEN]])], f),
        ("a stranger on a side", vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY], spec("a stranger")])], f),
        ("an agreement not in force", vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY]])], spec("another agreement")),
    ];
    for (why, sides, ag) in cases {
        let x = law::Fork { agreement: ag, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], sides, shares: vec![], debts: vec![] };
        let eo = ending_obj(&lab, ag, x.collective);
        let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
        lab.end(ANA, &fa);
        for i in [BEN, CY] {
            lab.end(i, &fa);
        }
        let e = lab.view().fork(&fa).unwrap();
        assert!(!e.complete && e.why.is_some(), "{why}");
    }
    assert!(lab.counts(&p));
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, None);
    let x = law::Fork {
        agreement: f,
        collective: label,
        chain_act: lab.c[0].binding,
        tips: vec![tip(&lab.c[0])],
        sides: vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY]])],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fa);
    lab.end(BEN, &fa);
    lab.end(CY, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(e.by_count);
    assert_eq!(e.shares, vec![666_667, 333_333]);
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    // A second complete fork, not naming the first in its objects: its
    // signers signed the first earlier in their own identity chains, so it
    // names the first through their chains, and counts for nothing (F131
    // IT1, F132 U1). Before F132 the two were concurrent and neither
    // counted.
    let z = law::Fork { sides: vec![side(&sb, vec![ids[CY]]), side(&sa, vec![ids[ANA], ids[BEN]])], ..x };
    let eo = ending_obj(&lab, f, z.collective);
    let fb = law_act(&mut lab.w, &mut lab.m[CY], law::types::FORK, z.to_map(), eo);
    lab.end(CY, &fb);
    lab.end(ANA, &fb);
    lab.end(BEN, &fb);
    assert!(lab.view().fork(&fb).unwrap().complete);
    assert_eq!(lab.view().endings(&label).unwrap().len(), 2);
    assert!(lab.view().ending_knows(&label, &fb).contains(&fa));
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    assert!(lab.counts(&p));
}

/// F153 (Identity, the sentence after rule 17): a fork that counts a
/// member's chain signature only through a rotation "re-homed without
/// audit", which only this reader's own failed attempt to reach the old
/// home lets count, is unknown: neither complete nor incomplete, and it
/// closes nothing, until the rotation no longer rests on that attempt.
/// Reading still follows the member's identity.
#[test]
fn a_fork_resting_on_a_readers_own_attempt_is_unknown() {
    use common::home;
    use mor_core::chain::{Basis, How};
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let label = lab.c[0].id;
    let (sa, _) = found_successor(&mut lab, "side A", &[ANA, BEN], &[], label);
    let (sb, _) = found_successor(&mut lab, "side B", &[CY], &[], label);
    // Cy moves to a home, then leaves it by a homeless rotation that only
    // this reader's failed attempt to reach it lets count.
    let old = lab.w.operator("cy's old home");
    let mut new = lab.w.operator("cy's new home");
    let (_, cy1) = lab.w.rotate(&lab.m[CY], Rot { homes: Some(vec![home(&old)]), ..Default::default() });
    let (hr, cy2) = lab.w.rotate(&cy1, Rot { homeless: true, homes: Some(vec![home(&new)]), ..Default::default() });
    lab.w.receipt(&mut new, &ids[CY], &hr, 2);
    lab.w.v.failed_to_reach(old.id);
    lab.m[CY] = cy2;
    let side = |s: &Person, m: Vec<Hash>| law::Side { successor: s.id, members: m };
    let x = law::Fork {
        agreement: f,
        collective: label,
        chain_act: lab.c[0].binding,
        tips: vec![tip(&lab.c[0])],
        sides: vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY]])],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fa);
    lab.end(BEN, &fa);
    let cs = lab.end(CY, &fa);
    lab.w.receipt(&mut new, &ids[CY], &cs, 3);
    // Reading follows Cy to the new home, and counts the signature there.
    let res = lab.w.v.resolve(&ids[CY]);
    assert_eq!(res.links[2].how, How::Homeless { basis: Basis::OwnAttempt, final_: false });
    assert_eq!(res.position_of(&cs), Some(3));
    // The fork counts it only through that rotation: unknown.
    assert_eq!(lab.view().fork(&fa), Err(LawError::OwnAttempt));
    assert_eq!(lab.view().closed_by(&label), Err(LawError::OwnAttempt));
    // The old home's operator closes it: the rotation no longer rests on
    // the reader's attempt, and the fork is complete and closes the label.
    lab.w.rotate(&old, Rot { closure: true, ..Default::default() });
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(lab.view().closed_by(&label).unwrap().map(|c| c.by), Some(fa));
}

/// Freeze suite v21, 3.9c (F121 shape D, F124 N7, N8, N12): a release to
/// the public domain ends the claim, names the work's history and publishes
/// its content key; it needs every direct owner's signature, unless the
/// release rule says otherwise; a clone every owner signs changes that
/// rule; a claim it does not name is shown beside it.
#[test]
fn a_work_is_released_to_the_public_domain() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let work = spec("a work");
    let terms = |ana: &Person, ben: &Person, cy: &Person, rule: Option<Rule>| Terms {
        parties: vec![ana.id, ben.id],
        text: "Ana and Ben share a work with Cy.".into(),
        cmips: vec![],
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
        stakes: Some(vec![law::Stake {
            object: Who::Id(work),
            holders: vec![(Who::Id(ana.id), 500_000), (Who::Id(ben.id), 400_000), (Who::Id(cy.id), 100_000)],
        }]),
        forked_from: None,
        release_rule: rule,
        settles: None,
        fork_judge: None,
    };
    let t = terms(&ana, &ben, &cy, None);
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let claim = law_act(&mut w, &mut ana, law::types::WORK_CLAIM, vec![(Value::Uint(0), Value::Bytes(work.to_vec()))], None);
    let release = law::Release { work, stakes: vec![(d, 0)], claims: vec![claim], keys: vec![(spec("a publication carrying it"), vec![7; 32])], timed: None };
    let r = law_act(&mut w, &mut ana, law::types::RELEASE, release.to_map(), obj(d));
    sign(&mut w, &mut ben, &r);
    let e = view(&w).release(&r).unwrap();
    assert!(!e.complete, "Cy, an owner of a tenth, has not signed");
    sign(&mut w, &mut cy, &r);
    let e = view(&w).release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.signed, vec![ana.id, ben.id, cy.id]);
    assert_eq!(e.ended(None), Some(true));
    // N12: the claim it names is history; a claim it does not name is
    // shown beside it, openly contested.
    assert_eq!(view(&w).claim_after_release(&claim, &work).unwrap(), None);
    let other = law_act(&mut w, &mut ben, law::types::WORK_CLAIM, vec![(Value::Uint(0), Value::Bytes(work.to_vec()))], None);
    assert_eq!(view(&w).claim_after_release(&other, &work).unwrap(), Some(r));
    // N8: a clone changing the release rule needs every owner, Cy too.
    let mut c = terms(&ana, &ben, &cy, Some(Rule::Threshold(2)));
    c.parent = Some(d);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
    let k = law_act(&mut w, &mut ana, law::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut ana, &k);
    sign(&mut w, &mut ben, &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(false), "Cy has not signed");
    sign(&mut w, &mut cy, &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(true));
    // Under the clone's rule, two owners release.
    let release2 = law::Release { stakes: vec![(k, 0)], ..release.clone() };
    let r2 = law_act(&mut w, &mut ana, law::types::RELEASE, release2.to_map(), obj(k));
    sign(&mut w, &mut ben, &r2);
    assert!(view(&w).release(&r2).unwrap().complete);
    // A release that keeps its key private publishes nothing: incomplete.
    let p = w.private_act(&mut ana, mips().law, law::types::RELEASE, release2.to_map(), obj(k), vec![ben.id]);
    assert!(!view(&w).release(&p).unwrap().complete);
    let bad = law::Release { work: spec("another work"), ..release2.clone() };
    let r3 = law_act(&mut w, &mut ana, law::types::RELEASE, bad.to_map(), obj(k));
    assert!(!view(&w).release(&r3).unwrap().complete);
    let r4 = law_act(&mut w, &mut ana, law::types::RELEASE, release2.to_map(), None);
    assert!(view(&w).release(&r4).is_err());
}

/// Law rule 17 and "Release" (audit, October 2026, gap 7): a release is
/// judged by the release rule, holders and time reference of the claiming
/// agreement in force, never by the version it names. The owners tighten
/// the rule from "any one holder" to "every holder" by a clone every owner
/// signs (N8); one owner's release naming the older version ends nothing.
#[test]
fn a_release_is_judged_by_the_agreement_in_force() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let work = spec("a work");
    let mut t = deal_terms(ana.id, ben.id);
    t.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(ana.id), 500_000), (Who::Id(ben.id), 500_000)] }]);
    t.release_rule = Some(Rule::Threshold(1));
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    // Every owner signs the clone that needs every holder to release.
    let mut c = t.clone();
    c.parent = Some(d);
    c.release_rule = Some(Rule::All);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
    let k = law_act(&mut w, &mut ana, law::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut ana, &k);
    sign(&mut w, &mut ben, &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(true));
    // Ana alone, naming the older version: not complete.
    let release = law::Release { work, stakes: vec![(d, 0)], claims: vec![], keys: vec![(spec("a publication carrying it"), vec![7; 32])], timed: None };
    let r = law_act(&mut w, &mut ana, law::types::RELEASE, release.to_map(), obj(d));
    let e = view(&w).release(&r).unwrap();
    assert!(!e.complete, "the rule in force needs every holder");
    assert_eq!(e.holders, vec![ana.id, ben.id]);
    assert_eq!(e.signed, vec![ana.id]);
    assert_eq!(view(&w).released(&work).unwrap(), None);
    // Naming the version in force, Ana alone: not complete; with Ben: complete.
    let r2 = law_act(&mut w, &mut ana, law::types::RELEASE, law::Release { stakes: vec![(k, 0)], ..release.clone() }.to_map(), obj(k));
    assert!(!view(&w).release(&r2).unwrap().complete);
    sign(&mut w, &mut ben, &r2);
    assert!(view(&w).release(&r2).unwrap().complete);
    // Naming the older version with every holder's signature: the rule in
    // force is met all the same.
    sign(&mut w, &mut ben, &r);
    assert!(view(&w).release(&r).unwrap().complete);
    // A version on no line to the one in force ends nothing.
    let mut other = t.clone();
    other.text = "Another agreement on the same work.".into();
    let o = law_act(&mut w, &mut ana, law::types::TERMS, other.to_map(), None);
    let r3 = law_act(&mut w, &mut ana, law::types::RELEASE, law::Release { stakes: vec![(o, 0)], ..release.clone() }.to_map(), obj(o));
    sign(&mut w, &mut ben, &r3);
    let e = view(&w).release(&r3).unwrap();
    assert!(e.complete, "a separate agreement is judged on its own lineage");
}

/// Law rule 45b, F186 (decided 9 October 2026), freeze suite v21, step
/// 1.7a: two complete clones of one version of a deal are a fork. While it
/// stands, the version before the split is the reference, and a new act
/// may follow either branch and counts, judged against that branch's latest
/// version: the buyer is protected. A branch that grows settles nothing
/// (this replaces "the longer branch wins", decided 8 October). A split is
/// settled only by a complete version naming both branches: beside its one
/// parent, the other branch's tip it settles (field 26); settlement is
/// final, and the other branch never comes back. (Audit R5b had the parent
/// in force for good.)
#[test]
fn two_complete_versions_of_a_deal() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let work = spec("a work");
    let mut t = deal_terms(ana.id, ben.id);
    t.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(ana.id), 500_000), (Who::Id(ben.id), 500_000)] }]);
    t.release_rule = Some(Rule::Threshold(1));
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let clone = |w: &mut World, ana: &mut Person, ben: &mut Person, parent: Hash, text: &str, settles: Option<Hash>| {
        let mut c = t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        c.release_rule = Some(Rule::All);
        c.settles = settles.map(|x| vec![x]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let k = law_act(w, ana, law::types::TERMS, c.to_map(), obj(parent));
        sign(w, ana, &k);
        sign(w, ben, &k);
        k
    };
    let k1 = clone(&mut w, &mut ana, &mut ben, d, "One amendment.", None);
    assert_eq!(view(&w).version_in_force(&d).unwrap(), k1);
    let release = law::Release { work, stakes: vec![(d, 0)], claims: vec![], keys: vec![(spec("a publication carrying it"), vec![7; 32])], timed: None };
    let r = law_act(&mut w, &mut ana, law::types::RELEASE, release.to_map(), obj(d));
    assert!(!view(&w).release(&r).unwrap().complete, "one existing clone: its rule, every holder, is in force");
    // A rival clone of the same parent: a fork. The version before the
    // split is the reference, and the reading names both branches.
    let k2 = clone(&mut w, &mut ana, &mut ben, d, "Another amendment.", None);
    assert_eq!(view(&w).version_in_force(&d).unwrap(), d);
    let fk = view(&w).deal_fork(&d).unwrap().expect("forked");
    assert_eq!(fk.reference, d);
    assert_eq!(sorted(fk.branches.iter().map(|b| b[0]).collect()), sorted(vec![k1, k2]));
    assert!(view(&w).release(&r).unwrap().complete, "naming the reference, judged by it: any one holder");
    // A release may follow either branch, and counts, judged by that branch.
    let rk1 = law_act(&mut w, &mut ana, law::types::RELEASE, law::Release { stakes: vec![(k1, 0)], ..release.clone() }.to_map(), obj(k1));
    assert!(!view(&w).release(&rk1).unwrap().complete, "k1's rule: every holder");
    sign(&mut w, &mut ben, &rk1);
    assert!(view(&w).release(&rk1).unwrap().complete, "{:?}", view(&w).release(&rk1).unwrap().why);
    // One branch grows: still forked, the reference unchanged; an act
    // naming k1 is judged by its branch's latest version.
    let k3 = clone(&mut w, &mut ana, &mut ben, k1, "A third amendment, on the first branch.", None);
    assert_eq!(view(&w).version_in_force(&d).unwrap(), d, "a longer branch settles nothing");
    let fk = view(&w).deal_fork(&d).unwrap().expect("still forked");
    assert!(fk.branches.contains(&vec![k1, k3]));
    // A version naming as settled something not on the other branch settles nothing.
    let stray = {
        let mut c = t.clone();
        c.parent = Some(k3);
        c.text = "Settling nothing.".into();
        c.release_rule = Some(Rule::All);
        c.settles = Some(vec![d]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let o = vec![Object { chain: k3, predecessor: k3 }, Object { chain: d, predecessor: d }];
        let k = law_act(&mut w, &mut ana, law::types::TERMS, c.to_map(), Some(o));
        sign(&mut w, &mut ana, &k);
        sign(&mut w, &mut ben, &k);
        k
    };
    assert_eq!(view(&w).version_in_force(&d).unwrap(), d);
    assert!(view(&w).deal_fork(&d).unwrap().expect("still forked").branches.contains(&vec![k1, k3, stray]));
    // Field 26 is a deal's: founding terms, or a version naming its own parent, are invalid.
    let mut bad = t.clone();
    bad.settles = Some(vec![d]);
    assert!(law::Terms::decode(&bad.to_map()).and_then(|x| x.check(&mips())).is_err());
}

/// F186 (decided 9 October 2026): settled only by a version naming both
/// branches, complete; from then on the settling version's line is in
/// force. (What grows on the discarded branch, and the tangled shapes:
/// `f189_4_…`, `f189_5_…`, `f188_dq1_to_dq4_…`.)
#[test]
fn a_deals_fork_is_settled_by_a_version_naming_both_branches() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let a2 = l.version(a1, "Branch A grows.", None);
    assert_eq!(l.in_force().unwrap(), d);
    // A settling version that is a draft settles nothing.
    let half = l.propose(a2, "Settled, half signed.", Some(b1));
    sign(&mut l.w, &mut l.ana, &half);
    assert_eq!(l.in_force().unwrap(), d);
    // Settled: a complete version on branch A naming branch B's tip.
    let s = l.version(a2, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    assert_eq!(view(&l.w).deal_fork(&d).unwrap(), None);
    assert_eq!(view(&l.w).version_in_force(&b1).unwrap(), s, "an act naming B is judged by the version in force");
    let s2 = l.version(s, "Life goes on.", None);
    assert_eq!(l.in_force().unwrap(), s2);
}

/// F186, client conformance (decided 9 October 2026): a seller's client
/// and a split service raise the alarm when a payment names a version of
/// the deal that does not descend from the version they hold. The reading
/// gives both lines from the last version they share.
#[test]
fn a_payment_naming_another_branch_raises_the_alarm() {
    use mor_core::finance::{Amount, Claim, Payload as Fin, Purchase};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let t = deal_terms(ana.id, ben.id);
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let clone = |w: &mut World, ana: &mut Person, ben: &mut Person, text: &str| {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let k = law_act(w, ana, law::types::TERMS, c.to_map(), obj(d));
        sign(w, ana, &k);
        sign(w, ben, &k);
        k
    };
    let a = clone(&mut w, &mut ana, &mut ben, "3A: the price is 100.");
    let b = clone(&mut w, &mut ana, &mut ben, "3B: the price is 120.");
    let pay = |w: &mut World, fan: &mut Person, line: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee: ana.id,
            amount: Amount { unit: spec("a unit"), value: 120 },
            fulfils: spec("a publication"),
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: d, line }),
        });
        let x = w.everyday_act(fan, mips().finance, 3, c.to_map(), None, None);
        w.add(&x)
    };
    let under_b = pay(&mut w, &mut fan, b, b"b");
    let v = view(&w);
    let alarm = v.fork_alarm(&under_b, &a).unwrap().expect("Ana's client holds 3A: the alarm");
    assert_eq!((alarm.named, alarm.held, alarm.shared, alarm.kind), (b, a, d, law::AlarmKind::Fork));
    assert_eq!((alarm.held_line.clone(), alarm.named_line.clone()), (vec![a], vec![b]));
    assert_eq!(v.fork_alarm(&under_b, &b).unwrap(), None, "Ben's client holds 3B: it descends");
    assert_eq!(v.fork_alarm(&under_b, &d).unwrap(), None, "a client holding the version before the split: 3B descends from it");
    drop(v);
    let under_d = pay(&mut w, &mut fan, d, b"d");
    let alarm = view(&w).fork_alarm(&under_d, &a).unwrap().expect("an older version does not descend from 3A");
    assert_eq!(alarm.kind, law::AlarmKind::Older, "a plain notice (DQ7)");
}

/// Freeze suite v21, 3.9e (F124 N11): a timed release names a future point
/// on the agreement's time reference and the identity that delivers the
/// content key then; the claim ends there, checkably. Without a time
/// reference, no timed release.
#[test]
fn a_timed_release() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let keeper = w.genesis("a key keeper", vec![own_home()], None, None);
    let work = spec("a work");
    let deal = |w: &mut World, ana: &mut Person, time: bool| {
        let t = Terms {
            parties: vec![ana.id],
            text: "Ana's work.".into(),
            cmips: vec![],
            keepers: None,
            field4: Field4::Rule(Rule::All),
            clone: Rule::All,
            time: time.then(|| (spec("a block height reference"), Value::Uint(0))),
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
            stakes: Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(ana.id), 1_000_000)] }]),
            forked_from: None,
            release_rule: None,
            settles: None,
            fork_judge: None,
        };
        let x = law_act(w, ana, law::types::TERMS, t.to_map(), None);
        sign(w, ana, &x);
        x
    };
    let d = deal(&mut w, &mut ana, true);
    let rel = law::Release { work, stakes: vec![(d, 0)], claims: vec![], keys: vec![], timed: Some((Value::Uint(900_000), keeper.id)) };
    let r = law_act(&mut w, &mut ana, law::types::RELEASE, rel.to_map(), obj(d));
    let e = view(&w).release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.ended(Some(false)), Some(false), "before its point, the claim stands");
    assert_eq!(e.ended(Some(true)), Some(true));
    assert_eq!(e.ended(None), None, "undetermined as the time reference is");
    let d2 = deal(&mut w, &mut ana, false);
    let rel2 = law::Release { stakes: vec![(d2, 0)], ..rel };
    let r2 = law_act(&mut w, &mut ana, law::types::RELEASE, rel2.to_map(), obj(d2));
    let e = view(&w).release(&r2).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("N11")));
    // An immediate release still carries its keys.
    let mut bare = law::Release { timed: None, ..rel2 }.to_map();
    bare.retain(|(k, _)| *k != Value::Uint(3));
    let x = law_act(&mut w, &mut ana, law::types::RELEASE, bare, obj(d2));
    assert!(view(&w).release(&x).is_err());
}

/// Freeze suite v21, 3.9f (F124 N7, N9): a collective that owns a work
/// releases it by its own rules, across the lanes a release touches (here
/// the Finance lane's holder); then, holding nothing, it closes by a
/// closing act signed under the constitutional rule; its keys count for
/// nothing in Law after the line. A closing while it still holds the work,
/// or owes anything, does not take effect (F125, D5): one debt is paid by
/// a receipt, the other ended by its creditor's release, after a partial
/// payment; a release signed by anyone else ends nothing.
#[test]
fn a_collective_releases_its_work_and_closes() {
    let work = spec("the label's work");
    let mut lab = Lab::new(&|t| t.stakes = stakes(vec![owns(work)]));
    let f = lab.founding;
    let label = lab.c[0].id;
    let closing = |lab: &Lab| law::Closing { agreement: f, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let x = closing(&lab);
    let eo = ending_obj(&lab, f, x.collective);
    let early = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &early);
    lab.end(BEN, &early);
    lab.end(CY, &early);
    let e = lab.view().closing(&early).unwrap();
    assert!(!e.complete);
    assert_eq!(e.holds, vec![(f, 0)]);
    // The release: the label signs it; it needs its Finance lane too (N7).
    let rel = law::Release { work, stakes: vec![(f, 0)], claims: vec![], keys: vec![(spec("its publication"), vec![9; 32])], timed: None };
    let r = {
        let a = lab.w.everyday_act(&mut lab.c[0], mips().law, law::types::RELEASE, rel.to_map(), obj(f), None);
        lab.w.add(&a)
    };
    assert!(!lab.view().release(&r).unwrap().complete, "the Finance lane's holder has not signed");
    lab.sign(BEN, &r);
    let e = lab.view().release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.holders, vec![label]);
    // Two debts open: no closing (F125, D5).
    let mut supplier = lab.w.genesis("the supplier", vec![own_home()], None, None);
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let d = obligation_to(&mut lab, supplier.id, 100);
    let d2 = obligation_to(&mut lab, printer.id, 80);
    let x = closing(&lab);
    let eo = ending_obj(&lab, f, x.collective);
    let c1 = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &c1);
    lab.end(BEN, &c1);
    lab.end(CY, &c1);
    let v = lab.view();
    let e = v.closing(&c1).unwrap();
    assert!(e.holds.is_empty());
    assert_eq!(sorted(e.open_debts.clone()), sorted(vec![d, d2]));
    assert!(!e.complete);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("cannot close while it owes anything")), "{:?}", e.why);
    drop(v);
    // The supplier is paid in full; the printer is paid 30 of 80.
    receipt(&mut lab, &mut supplier, label, d, 100);
    let part = receipt(&mut lab, &mut printer, label, d2, 30);
    let v = lab.view();
    assert_eq!(v.closing(&c1).unwrap().open_debts, vec![d2]);
    assert_eq!(v.paid_toward(&d2), 30);
    drop(v);
    // A release of the printer's debt signed by a member ends nothing:
    // only the creditor signs it.
    let wrong = debt_release(&mut lab.w, &mut lab.m[ANA], d2, vec![part]);
    let v = lab.view();
    let e = v.debt_release(&wrong).unwrap();
    assert!(!e.counts);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("only the creditor")), "{:?}", e.why);
    assert!(!v.closing(&c1).unwrap().complete);
    drop(v);
    // The printer releases the rest, against the partial payment: the
    // closing takes effect; the label's later acts count for nothing; what
    // it did before stands.
    let rel = debt_release(&mut lab.w, &mut printer, d2, vec![part]);
    let v = lab.view();
    assert!(v.debt_release(&rel).unwrap().counts);
    assert_eq!(v.debt_released(&d2).unwrap(), Some(rel));
    let e = v.closing(&c1).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(v.current(&label).unwrap().unwrap().closed, Some(c1));
    drop(v);
    let after = lab.publish(0);
    lab.sign(ANA, &after);
    let v = lab.view();
    assert_eq!(v.consent(&after).unwrap(), Consent::Closed { by: c1 });
    assert!(v.consent(&p).unwrap().counts());
}

/// Freeze suite v21, 3.9h (F125, bankruptcy): a collective that cannot pay
/// keeps its debt open and visible; it settles with its creditor by stakes
/// and a release: it pays what it can, gives the creditor a share of its
/// work by a clone of its agreement (debt turned into ownership), and the
/// creditor, alone, releases the rest. Its members are never made personal
/// debtors; it now owes nothing, and, still holding its share of the work,
/// stays open.
#[test]
fn a_bankrupt_collective_settles_by_stakes_and_a_release() {
    let work = spec("the label's only work");
    let mut lab = Lab::new(&|t| t.stakes = stakes(vec![owns(work)]));
    let f = lab.founding;
    let label = lab.c[0].id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let mut lender = lab.w.genesis("the lender", vec![own_home()], None, None);
    let d = obligation_to(&mut lab, lender.id, 1_000);
    fn view2(lab: &Lab, _d: Hash) -> LawView<'_> {
        lab.view()
    }
    let owes = |lab: &Lab| -> Vec<Hash> { view2(lab, d).owes(&lab.c[0].id).unwrap() };
    assert_eq!(owes(&lab), vec![d]);
    // It pays what it can: 300 of 1,000. The debt stays open, visible.
    let part = receipt(&mut lab, &mut lender, label, d, 300);
    assert_eq!(owes(&lab), vec![d]);
    // A clone of its agreement gives the lender 40% of the work.
    let lid = lender.id;
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN, CY])], &|t| {
        t.stakes = stakes(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::This, 600_000), (Who::Id(lid), 400_000)] }]);
    });
    assert_eq!(view2(&lab, d).powers_needed(&t).unwrap(), vec![Power::Clone]);
    let k = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.record(0, Some((k, s)), &[], vec![], k);
    assert_eq!(view2(&lab, d).current(&label).unwrap().unwrap().agreement, k);
    // Still owed until the lender signs a release: the clone ends nothing.
    assert_eq!(owes(&lab), vec![d]);
    // A release naming the receipt instead of the obligation ends nothing.
    let odd = debt_release(&mut lab.w, &mut lender, part, vec![]);
    assert!(!view2(&lab, d).debt_release(&odd).unwrap().counts);
    // The lender releases the rest, against the payment and the stake.
    let rel = debt_release(&mut lab.w, &mut lender, d, vec![part, k]);
    let v = view2(&lab, d);
    let e = v.debt_release(&rel).unwrap();
    assert!(e.counts, "{:?}", e.why);
    assert_eq!(e.release.against, vec![part, k]);
    assert_eq!(v.owes(&label).unwrap(), Vec::<Hash>::new());
    assert_eq!(v.paid_toward(&d), 300);
    drop(v);
    // It owes nothing, but holds 60% of the work: a closing still does not
    // take effect; it stays open, paying the lender as a holder.
    let x = law::Closing { agreement: k, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let eo = ending_obj(&lab, k, x.collective);
    let c = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &c);
    lab.end(BEN, &c);
    lab.end(CY, &c);
    let e = view2(&lab, d).closing(&c).unwrap();
    assert!(e.open_debts.is_empty());
    assert_eq!(e.holds, vec![(k, 0)]);
    assert!(!e.complete);
}

/// Reading 7, corrected (F121): for a party whose voice was removed before
/// a judicial change, the abandonment clause in force applies, not the
/// older one it signed; field 1 still names the last version it signed.
#[test]
fn the_clause_in_force_judges_a_party_removed_before_a_judicial_change() {
    let mut lab = Lab::new(&|t| {
        t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
        t.grammar.as_mut().unwrap().recovery = None;
        t.grammar.as_mut().unwrap().safety = Holding::Shares { threshold: 2, members: t.parties.clone() };
    });
    let f = lab.founding;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], f);
    // Ana and Ben, every voice that remains, change the authority.
    let mut second = lab.w.genesis("a second authority", vec![own_home()], None, None);
    let sid = second.id;
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN])], &|t| {
        t.abandonment.as_mut().unwrap().authority = Authority::Named(sid);
    });
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![sa, sb])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // A second declaration against Cy, redistributing their stake: field 1
    // names the founding terms, the last Cy signed; the clause in force
    // (the second authority) judges it.
    let x = AbsenceDeclaration { agreement: k, clause: f, party: lab.m[CY].id, outcomes: vec![outcomes::STAKE_REDISTRIBUTED] };
    let by_new = law_act(&mut lab.w, &mut second, law::types::DECLARATION, x.to_map(), obj(k));
    assert!(lab.view().declaration(&by_new).unwrap().is_ok(), "the clause in force applies");
    let by_old = lab.declare(None, k, f, CY, vec![outcomes::STAKE_REDISTRIBUTED]);
    assert!(lab.view().declaration(&by_old).unwrap().is_err(), "the older clause's authority no longer judges");
}

/// The creditor's release's format (Finance type 4, F126; Law type 21
/// under F125): the obligation it ends, and, for the record only, what it
/// was released against. Law type 21 is retired.
#[test]
fn a_creditors_release_has_one_format() {
    use mor_core::finance::{self as fin, Payload as Fin};
    let o = spec("an obligation");
    let r = fin::Release { obligation: o, against: vec![spec("a receipt"), spec("a clone")] };
    let mut w = World::new();
    let mut lender = w.genesis("a lender", vec![own_home()], None, None);
    let x = debt_release(&mut w, &mut lender, o, r.against.clone());
    let decode = |w: &World, x: &Hash| {
        let i = &w.v.get(x).unwrap().inside;
        Fin::decode(i.type_, &i.payload)
    };
    assert_eq!(decode(&w, &x).unwrap(), Fin::Release(r.clone()));
    // Nothing more: an unknown field, or an act named twice, is not in the format.
    let mut extra = Fin::Release(r.clone()).to_map();
    extra.push((Value::Uint(2), Value::Uint(0)));
    let a = w.everyday_act(&mut lender, mips().finance, fin::types::RELEASE, extra, None, None);
    let y = w.add(&a);
    assert!(decode(&w, &y).is_err());
    let z = debt_release(&mut w, &mut lender, o, vec![spec("a receipt"), spec("a receipt")]);
    assert!(decode(&w, &z).is_err());
    // A Law act of type 21 is no release: the type is retired.
    let old = law_act(&mut w, &mut lender, 21, vec![(Value::Uint(0), Value::Bytes(o.to_vec()))], None);
    assert!(view(&w).debt_release(&old).is_err());
    // The obligation it names is not held: it ends nothing.
    let e = view(&w).debt_release(&x).unwrap();
    assert!(!e.counts);
}

/// Freeze suite v21, 3.9i (F126, F128): an act in a collective's name is
/// done, and binds it, once sealed to every member (or public) and on the
/// collective's chain; before that, even signed, it binds no one. Where a
/// verifier found it is never a condition (F128: named relays withdrawn
/// from validity). A grantee's act, signed with its grant key, is held to
/// the same.
#[test]
fn an_act_in_the_collectives_name_is_done_once_sealed_wherever_held() {
    use mor_core::finance::{Amount, Obligation, Payload as Fin};
    let mut lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let label = lab.c[0].id;
    let creditor = lab.w.genesis("a printer", vec![own_home()], None, None);
    let debt = |lab: &mut Lab, to: Vec<Hash>| {
        let o = Fin::Obligation(Obligation {
            debtor: label,
            creditor: creditor.id,
            amount: Amount { unit: spec("a unit"), value: 70 },
            pointer: spec("its pointer"),
            agreement: None,
        });
        let x = lab.w.private_act(&mut lab.c[0], mips().finance, 1, o.to_map(), None, to);
        lab.sign(BEN, &x);
        x
    };
    // Sealed to the creditor alone: not done.
    let secret = debt(&mut lab, vec![creditor.id]);
    let v = lab.view();
    assert_eq!(v.obligation_binds(&secret).unwrap(), Some(false));
    assert!(v.done(&secret).unwrap().unwrap().unwrap_err().contains("sealed to every member"));
    assert!(matches!(v.consent(&secret).unwrap(), Consent::NotDone { .. }));
    drop(v);
    // Sealed to the creditor and every member: done, and it binds, found
    // on no relay at all (F128).
    let mut all = vec![creditor.id];
    all.extend(ids.iter().copied());
    let open = debt(&mut lab, all);
    let v = lab.view();
    assert_eq!(v.done(&open).unwrap(), Some(Ok(())));
    assert_eq!(v.obligation_binds(&open).unwrap(), Some(true));
    drop(v);
    // A public act is readable by every member: done.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p));
    // A grantee's act in the label's name, signed with its grant key: the
    // same condition.
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let g = lab.grant(&plain_grant(agent.id, false));
    sign(&mut lab.w, &mut agent, &g);
    let mut st = lab.strand(g, &key_of(agent.id));
    let deal = {
        let a = lab.w.everyday_act(&mut st, spec("a deal cMIP"), 0, vec![(Value::Uint(0), Value::Text("a deal".into()))], None, None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&deal).unwrap(), Backing::Backed { grant: g });
    assert!(matches!(lab.consent(&deal), Consent::Granted { grant, .. } if grant == g));
    let quiet = lab.w.private_act(&mut st, spec("a deal cMIP"), 0, vec![], None, vec![creditor.id]);
    assert!(matches!(lab.view().backing(&quiet).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("F126")));
    // Not a collective's act: the condition does not apply.
    assert_eq!(lab.view().done(&creditor.id).ok().flatten(), None);
}

/// F128: terms field 25 (the relays, F126, constitutional under F127) is
/// withdrawn: relays are transport, where a collective's clients publish
/// and look first (client conformance, the relay transport cMIP), never a
/// condition of validity. Terms carrying it are refused, the number never
/// reused; no area reaches it.
#[test]
fn terms_field_25_is_withdrawn() {
    let lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let t = label_terms(&ids, lab.authority.id, lab.keeper.id, &|_| {});
    assert!(t.check(&mips()).is_ok(), "a collective's terms name no relays");
    let mut m = t.to_map();
    m.push((Value::Uint(25), Value::Array(vec![Value::Array(vec![Value::Null, Value::Text("https://relay.test".into())])])));
    assert!(Terms::decode(&m).unwrap_err().to_string().contains("F128"));
    let mut reach = t.clone();
    reach.areas.as_mut().unwrap()[0].fields = Some(vec![law::FieldRef::Field(25)]);
    assert!(reach.check(&mips()).is_err());
}

/// F126 (E2): a collective forgives a debt owed to it by its Finance lane
/// alone: the release is a Finance act (type 4), so the lane reaching
/// Finance decides; nobody else's signature is needed.
#[test]
fn a_collective_releases_a_debt_by_its_finance_lane() {
    use mor_core::finance::{Amount, Obligation, Payload as Fin};
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    let mut debtor = lab.w.genesis("a debtor", vec![own_home()], None, None);
    let o = Fin::Obligation(Obligation {
        debtor: debtor.id,
        creditor: label,
        amount: Amount { unit: spec("a unit"), value: 500 },
        pointer: spec("the label's pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut debtor, mips().finance, 1, o.to_map(), None, None);
    let d = lab.w.add(&a);
    let rel = {
        let r = Fin::Release(mor_core::finance::Release { obligation: d, against: vec![] });
        let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, mor_core::finance::types::RELEASE, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let e = lab.view().debt_release(&rel).unwrap();
    assert!(!e.counts, "the Finance lane's holder has not signed");
    assert!(e.why.as_deref().is_some_and(|w| w.contains("Finance lane")), "{:?}", e.why);
    // Ana, who holds no Finance lane, signing changes nothing.
    lab.sign(ANA, &rel);
    assert!(!lab.view().debt_release(&rel).unwrap().counts);
    lab.sign(BEN, &rel);
    assert!(lab.view().debt_release(&rel).unwrap().counts);
    assert_eq!(lab.view().debt_released(&d).unwrap(), Some(rel));
}

/// Freeze suite v21, 3.9m (F127): a collective keeps two chains. Its
/// actions cite, in `objects`, the decision they act under and the heads
/// they join; an act citing nothing on the chain counts for nothing; a
/// citation of a decision under a later key, or of an act off the chain,
/// likewise. Identity's own everyday acts carry no objects and cite
/// nothing (reading). A Law act of the collective carries the citations
/// after the entries its type defines.
#[test]
fn a_collective_keeps_two_chains() {
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    // Cited: counts on the label's own signature (no area reaches it).
    let x = lab.cmip_act(0, spec("a note cMIP"));
    assert!(matches!(lab.consent(&x), Consent::Unadopted { .. }));
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p));
    // The same act citing nothing on the chain: on no chain, nothing.
    let saved = lab.c[0].cite.take();
    let loose = lab.publish(0);
    lab.sign(ANA, &loose);
    assert!(matches!(lab.consent(&loose), Consent::Uncited { .. }));
    // Citing only an act that is not on the chain: still uncited.
    let mut friend = lab.w.genesis("a friend", vec![own_home()], None, None);
    let post = lab.w.post(&mut friend, "hello");
    let a = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![], Some(vec![Object { chain: label, predecessor: post }]), None);
    let odd = lab.w.add(&a);
    lab.sign(ANA, &odd);
    assert!(matches!(lab.consent(&odd), Consent::Uncited { reason } if reason.contains("not on it")));
    lab.c[0].cite = saved;
    // Joining a head of another device: the join is the chain's, and a
    // line drawn on the joining device places the joined act before it.
    let other = lab.publish(1);
    lab.sign(ANA, &other);
    let o = lab.chain(&[other]);
    let a = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![], Some(o), None);
    let join = lab.w.add(&a);
    lab.sign(ANA, &join);
    assert!(lab.counts(&join));
    let line = lab.record(0, None, &[], vec![], lab.founding);
    assert!(lab.view().counts_before(&other, &line).unwrap(), "joined: before the line");
    let left = lab.publish(1);
    assert!(!lab.view().counts_before(&left, &line).unwrap(), "never joined: after it");
    // A decision under a later key than the act's own: uncited.
    let old = lab.c[1].clone();
    lab.rotate(None, &[0, 1, 2]);
    let rot = lab.c[0].binding;
    let mut stale = old;
    stale.cite = Some((label, vec![rot]));
    let a = lab.w.everyday_act(&mut stale, mips().envelope, 0, vec![], None, None);
    let y = lab.w.add(&a);
    assert!(matches!(lab.view().consent(&y), Ok(Consent::Uncited { .. }) | Err(_)));
    // A Law act of the label (its signature on terms of a deal, as a
    // party) carries its citations after the entry its type defines.
    let fid = friend.id;
    let deal = law_act(&mut lab.w, &mut friend, law::types::TERMS, deal_terms(fid, label).to_map(), None);
    let s = sign(&mut lab.w, &mut lab.c[0], &deal);
    let h = lab.w.v.get(&s).unwrap();
    assert_eq!(law::decode_signature(&h.inside).unwrap(), deal);
    assert_eq!(h.inside.objects.as_ref().unwrap()[1].chain, label);
}

/// Terms of a plain deal between two identities.
fn deal_terms(a: Hash, b: Hash) -> Terms {
    let mut d = label_terms(&[a, b], spec("an authority"), spec("a keeper"), &|_| {});
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.clone = Rule::All;
    d.abandonment = None;
    d.stakes = None;
    d
}

/// Freeze suite v21, 3.9l (F127, W3): a record is an act in the
/// collective's name like any other: not done (not sealed to every member,
/// nor public), it is no line: it puts nothing in force and registers
/// nothing. Where it is held decides nothing (F128).
#[test]
fn a_record_not_done_is_no_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let s = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![s])), &[], vec![], k);
    // Public: the line, and the clone in force.
    assert_eq!(puts(&lab, &r), Some(k));
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    assert_eq!(lab.in_force(&x), k);
    // A resignation registered by a record sealed to Ben alone: no line,
    // and Ben's voice remains.
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, k, None);
    let rec = Record { clone: None, signatures: None, kept: vec![], registers: Some(vec![res]) };
    let saved = lab.c[0].cite.take();
    let line = lab.w.private_act(&mut lab.c[0], mips().law, law::types::RECORD, rec.to_map(), obj(k), vec![lab.m[BEN].id]);
    lab.c[0].cite = saved;
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(!e.line && e.registers.is_empty());
    assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("sealed to every member")), "{:?}", e.not_a_line);
    let y = lab.cmip_act(0, pay());
    lab.sign(BEN, &y);
    assert!(lab.counts(&y), "Ben's voice remains");
}

/// Freeze suite v21, 3.9n (F127, the tie rule): a closing ends powers; a
/// debt a device signed that the closing's history does not cite was made
/// with powers that were ending: void, owed by nobody, and it does not keep
/// the collective from closing.
#[test]
fn the_ending_wins() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    // A public debt on device 1, which no act of device 0 cites.
    let o = mor_core::finance::Payload::Obligation(mor_core::finance::Obligation {
        debtor: label,
        creditor: spec("a printer"),
        amount: mor_core::finance::Amount { unit: spec("a unit"), value: 300 },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[1], mips().finance, 1, o.to_map(), None, None);
    let d = lab.w.add(&a);
    lab.sign(BEN, &d);
    assert_eq!(lab.view().obligation_binds(&d).unwrap(), Some(true), "done: it binds, for now");
    let closing = law::Closing { agreement: f, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let eo = ending_obj(&lab, f, closing.collective);
    let cl = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, closing.to_map(), eo);
    lab.end(ANA, &cl);
    lab.end(BEN, &cl);
    lab.end(CY, &cl);
    let v = lab.view();
    let e = v.closing(&cl).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(v.obligation_binds(&d).unwrap(), Some(false), "the ending wins: void");
    drop(v);
    // Had the closing cited device 1's tip, the debt would be in its
    // history, and the label could not close while owing it (D5).
    let mut lab2 = Lab::new(&|_| {});
    let f2 = lab2.founding;
    let label2 = lab2.c[0].id;
    let o = mor_core::finance::Payload::Obligation(mor_core::finance::Obligation {
        debtor: label2,
        creditor: spec("a printer"),
        amount: mor_core::finance::Amount { unit: spec("a unit"), value: 300 },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab2.w.everyday_act(&mut lab2.c[1], mips().finance, 1, o.to_map(), None, None);
    let d2 = lab2.w.add(&a);
    lab2.sign(BEN, &d2);
    let closing = law::Closing { agreement: f2, collective: label2, chain_act: lab2.c[1].binding, tips: vec![tip(&lab2.c[1])], open: vec![] };
    let eo = ending_obj(&lab2, f2, closing.collective);
    let cl = law_act(&mut lab2.w, &mut lab2.m[ANA], law::types::CLOSING, closing.to_map(), eo);
    lab2.end(ANA, &cl);
    lab2.end(BEN, &cl);
    lab2.end(CY, &cl);
    let e = lab2.view().closing(&cl).unwrap();
    assert!(!e.complete);
    assert_eq!(e.open_debts, vec![d2]);
}

/// Freeze suite v21, 3.9k (F127, W2): a payment becomes a sale once the
/// collective's actions chain records it, where the claim it names was
/// current: here the label's own receipt for it. Recorded before the fork,
/// in its history: a purchase. A payment naming the same claim that the
/// original's chain never recorded before the fork: no purchase, refunded.
/// One the chain recorded only off the fork's history: void with it (the
/// tie rule), so no purchase either.
#[test]
fn a_sale_is_recorded_on_the_actions_chain() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let work = spec("a song");
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)]), owns(work)]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.c[0].id;
    let rail = spec("a rail Module");
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let publication = {
        let a = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(work.to_vec()))], None, None);
        lab.w.add(&a)
    };
    lab.sign(ANA, &publication);
    let receipt = |lab: &mut Lab, d: usize, fan: &str, proof: &[u8]| {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(spec(fan))),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 10 },
            fulfils: publication,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: f, line: f }),
        });
        let a = lab.w.everyday_act(&mut lab.c[d], mips().finance, 2, r.to_map(), None, None);
        let x = lab.w.add(&a);
        lab.sign(BEN, &x);
        x
    };
    // Ana's payment, recorded by the label's receipt before the fork.
    let ana = receipt(&mut lab, 0, "Ana the fan", b"ana");
    let v = lab.view();
    assert_eq!(v.purchase(&ana).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
    drop(v);
    // F128 (reading 6): the label's split service records a sale with its
    // grant key, a grant within the Finance area, which Ben holds.
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let mut st = lab.strand(g, &key_of(svc.id));
    let by_svc = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: b"cy".to_vec(),
            payer: Some(Payer::Identity(spec("Cy the fan"))),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 10 },
            fulfils: publication,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: f, line: f }),
        });
        let a = lab.w.everyday_act(&mut st, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.consent(&by_svc), Consent::Granted { .. }), "{:?}", lab.consent(&by_svc));
    assert_eq!(lab.view().purchase(&by_svc).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
    // A receipt on device 1, which no act the fork cites ever joins.
    let off = receipt(&mut lab, 1, "a fan on a device left out", b"off");
    let (mut sa, _) = found_successor(&mut lab, "side A", &[ANA], &[], label);
    let (mut sb, _) = found_successor(&mut lab, "side B", &[BEN, CY], &[], label);
    let x = law::Fork {
        agreement: f,
        collective: label,
        chain_act: lab.c[0].binding,
        tips: vec![tip(&lab.c[0])],
        sides: vec![law::Side { successor: sa.id, members: vec![ids[ANA]] }, law::Side { successor: sb.id, members: vec![ids[BEN], ids[CY]] }],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fk = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fk);
    lab.end(BEN, &fk);
    lab.end(CY, &fk);
    sign(&mut lab.w, &mut sa, &fk);
    sign(&mut lab.w, &mut sb, &fk);
    assert!(lab.view().fork(&fk).unwrap().complete);
    let v = lab.view();
    // Ana's sale is in the fork's history: still a purchase.
    assert_eq!(v.purchase(&ana).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
    // The receipt off the fork's history is void with it: no sale.
    assert!(matches!(v.purchase(&off).unwrap().unwrap().verdict, law::PurchaseVerdict::NoPurchase { .. }));
    drop(v);
    // Ben's stale wallet pays after the fork naming the same claim; the
    // label's key, closed in Law, records it: that counts for nothing.
    let ben = receipt(&mut lab, 0, "Ben the fan", b"ben");
    let got = lab.view().purchase(&ben).unwrap().unwrap();
    assert!(matches!(got.verdict, law::PurchaseVerdict::NoPurchase { ref why } if why.contains("W2")), "{got:?}");
    assert_eq!(got.refund_to, mor_core::finance::RefundTo::Identity(spec("Ben the fan")));
}

/// Freeze suite v21, 3.9o (F128, W4): two musicians, no collective, clone
/// their deal to change their shares in a song. On a request rail, the
/// claim a purchase names is the one the seller's request committed to: a
/// purchase, whatever came after. On a push rail, each holder settles on its
/// own chain: a receipt recorded before that holder's signature on the new
/// version is a sale; the payment is a purchase only if every holder's
/// receipt is; otherwise every holder refunds; until every holder has
/// signed its receipt, it is unrecorded.
#[test]
fn a_superseded_claim_settles_on_each_holders_chain() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana the singer", vec![own_home()], None, None);
    let mut ben = w.genesis("ben the drummer", vec![own_home()], None, None);
    let work = spec("their song");
    let both = sorted(vec![ana.id, ben.id]);
    let mut d = deal_terms(both[0], both[1]);
    d.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), 500_000), (Who::Id(both[1]), 500_000)] }]);
    let deal = law_act(&mut w, &mut ana, law::types::TERMS, d.to_map(), None);
    sign(&mut w, &mut ana, &deal);
    sign(&mut w, &mut ben, &deal);
    let publication = {
        let a = w.everyday_act(&mut ana, mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(work.to_vec()))], None, None);
        w.add(&a)
    };
    let (request, push) = (spec("an invoice rail"), spec("a push rail"));
    let receipt = |w: &mut World, who: &mut Person, rail: Hash, proof: &[u8]| {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: who.id,
            amount: Amount { unit: spec("a unit"), value: 5 },
            fulfils: publication,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: deal, line: deal }),
        });
        let a = w.everyday_act(who, mips().finance, 2, r.to_map(), None, None);
        w.add(&a)
    };
    fn pview(w: &World, push: Hash) -> LawView<'_> {
        let mut v = LawView::new(&w.v, mips());
        v.push_rails.insert(push);
        v
    }
    // On the push rail, before the change: each holder's receipt.
    let early_a = receipt(&mut w, &mut ana, push, b"tx1");
    assert_eq!(pview(&w, push).purchase(&early_a).unwrap().unwrap().verdict, law::PurchaseVerdict::Unrecorded, "Ben has not signed his receipt");
    let early_b = receipt(&mut w, &mut ben, push, b"tx1");
    // The clone: 60/40.
    let mut k = d.clone();
    k.parent = Some(deal);
    k.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: both.clone() }]);
    k.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), 600_000), (Who::Id(both[1]), 400_000)] }]);
    let clone = law_act(&mut w, &mut ana, law::types::TERMS, k.to_map(), obj(deal));
    sign(&mut w, &mut ana, &clone);
    sign(&mut w, &mut ben, &clone);
    let v = pview(&w, push);
    assert_eq!(v.purchase(&early_a).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase, "both receipts before their signatures");
    assert_eq!(v.purchase(&early_b).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
    drop(v);
    // A stale wallet pays the old version on the push rail, after both
    // signed the new one: Ana's receipt comes after her signature.
    let late_a = receipt(&mut w, &mut ana, push, b"tx2");
    receipt(&mut w, &mut ben, push, b"tx2");
    let got = pview(&w, push).purchase(&late_a).unwrap().unwrap();
    assert!(matches!(got.verdict, law::PurchaseVerdict::NoPurchase { ref why } if why.contains("W4")), "{got:?}");
    // On a request rail, the seller's request committed to the old claim:
    // a purchase under it.
    let invoiced = receipt(&mut w, &mut ana, request, b"invoice");
    assert_eq!(pview(&w, push).purchase(&invoiced).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
}

/// F143 ("Judged on its own history"): a fork or closing is complete or not
/// on its own line and history, as if it were the ending that counts,
/// never with another ending already in force. A closing is complete and
/// counts; the label then signs a debt; a later closing, naming the first,
/// whose line holds the debt, owes it on its own history: incomplete, and
/// counting for nothing, whenever a verifier asks.
#[test]
fn an_ending_is_judged_on_its_own_history() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let close = |lab: &mut Lab| {
        let c = law::Closing { agreement: f, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
        let eo = ending_obj(lab, f, label);
        let x = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
        for i in [ANA, BEN, CY] {
            lab.end(i, &x);
        }
        x
    };
    let c1 = close(&mut lab);
    let e = lab.view().closing(&c1).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.counts, Some(true));
    assert_eq!(lab.view().closed_by(&label).unwrap().map(|c| c.by), Some(c1));
    // A debt after the first closing's line, sealed to everyone and on the
    // chain: void under the ending that counts (the tie rule), but in the
    // second closing's own history, where it binds.
    let d = obligation(&mut lab, "a supplier", 40);
    assert_eq!(lab.view().obligation_binds(&d).unwrap(), Some(false), "void after the closing that counts");
    let c2 = close(&mut lab);
    let v = lab.view();
    let e = v.closing(&c2).unwrap();
    assert!(!e.complete, "on its own history the second closing owes the debt (F143): {:?} {:?} binds {:?}", e.why, e.open_debts, v.obligation_binds(&d));
    assert_eq!(e.open_debts, vec![d]);
    assert_eq!(e.counts, Some(false));
    assert_eq!(v.closed_by(&label).unwrap().map(|c| c.by), Some(c1), "the first closing stays final (IT1)");
    // The same answer asked again, after the choice.
    let e = v.closing(&c2).unwrap();
    assert!(!e.complete);
    assert_eq!(v.closing(&c1).unwrap().counts, Some(true));
}

/// Freeze suite v21, 3.9p (F128, W5): a fork or a closing counts only once
/// done: sealed to every member, or public. A closing sealed to one member
/// takes no effect.
#[test]
fn a_closing_must_be_done() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let c = law::Closing { agreement: f, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let ben = lab.m[BEN].id;
    let eo = ending_obj(&lab, f, c.collective);
    let quiet = lab.w.private_act(&mut lab.m[ANA], mips().law, law::types::CLOSING, c.to_map(), eo, vec![ben]);
    lab.end(ANA, &quiet);
    lab.end(BEN, &quiet);
    lab.end(CY, &quiet);
    let e = lab.view().closing(&quiet).unwrap();
    assert!(!e.complete);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("W5")), "{:?}", e.why);
    let eo = ending_obj(&lab, f, c.collective);
    let open = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &open);
    lab.end(BEN, &open);
    lab.end(CY, &open);
    let e = lab.view().closing(&open).unwrap();
    assert!(e.complete, "{:?}", e.why);
}

/// F128, extended to every identity (Nobody, allegedly, 4 October 2026):
/// a person grants a key too. The grant and its revocation are everyday
/// acts signed with the person's own signing key, public: no rotation, no
/// safety key. A rotation still fences off a grant it does not keep, so a
/// thief who stole the everyday key and granted itself a key loses it at
/// the owner's next rotation.
#[test]
fn a_persons_grant_key_is_added_and_revoked_by_everyday_acts() {
    let mut w = World::new();
    let mut singer = w.genesis("a singer", vec![own_home()], None, None);
    let mut agent = w.genesis("her agent", vec![own_home()], None, None);
    let env = mips().envelope;
    let grant = Grant { kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]), ..plain_grant(agent.id, false) };
    let g = law_act(&mut w, &mut singer, law::types::GRANT, grant.to_map(), None);
    assert!(w.v.get(&g).unwrap().act.outside.is_public());
    assert_eq!(w.v.status(&g), Status::Valid, "an everyday act: no safety key");
    sign(&mut w, &mut agent, &g);
    // The agent's strand: acts in the singer's name, citing the grant.
    let mut s1 = singer.clone();
    s1.binding = g;
    s1.sign = key_of(agent.id);
    s1.seq = vec![];
    s1.cite = Some((singer.id, vec![g]));
    let mut s2 = s1.clone();
    let post = |w: &mut World, st: &mut Person| {
        let a = w.everyday_act(st, env, 0, vec![], None, None);
        w.add(&a)
    };
    let cited = post(&mut w, &mut s1);
    let racing = post(&mut w, &mut s2);
    fn view(w: &World) -> LawView<'_> {
        LawView::new(&w.v, mips())
    }
    assert_eq!(view(&w).backing(&cited).unwrap(), Backing::Backed { grant: g });
    assert!(matches!(view(&w).consent(&cited).unwrap(), Consent::Granted { .. }));
    // Beyond its reach: a Finance act.
    let off = {
        let a = w.everyday_act(&mut s1, mips().finance, 0, vec![], None, None);
        w.add(&a)
    };
    assert!(matches!(view(&w).backing(&off).unwrap(), Backing::NotBacked { .. }));
    // The revocation: an everyday act of the singer, public, citing the
    // head it saw on her chain.
    let sid = singer.id;
    let r = law_act(
        &mut w,
        &mut singer,
        law::types::REVOCATION,
        law::Revocation { grant: g }.to_map(),
        Some(vec![Object { chain: sid, predecessor: cited }]),
    );
    assert_eq!(w.v.status(&r), Status::Valid, "an everyday act: no safety key");
    assert_eq!(view(&w).backing(&cited).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(view(&w).backing(&racing).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G1")));
    // A thief holding the singer's everyday key grants itself a key.
    let mut thief = w.genesis("a thief", vec![own_home()], None, None);
    let mut stolen = singer.clone();
    let tg = law_act(&mut w, &mut stolen, law::types::GRANT, plain_grant(thief.id, false).to_map(), None);
    sign(&mut w, &mut thief, &tg);
    let mut ts = singer.clone();
    ts.binding = tg;
    ts.sign = key_of(thief.id);
    ts.seq = vec![];
    ts.cite = Some((singer.id, vec![tg]));
    let forged = post(&mut w, &mut ts);
    assert_eq!(view(&w).backing(&forged).unwrap(), Backing::Backed { grant: tg }, "until the owner rotates");
    // The singer rotates, keeping her own line's tip, not the thief's act:
    // the thief's grant is void under Identity, and its key with it.
    let (_, next) = w.rotate(&singer, Rot::default());
    singer = next;
    assert_eq!(w.v.status(&tg), Status::Void);
    assert!(matches!(view(&w).backing(&forged).unwrap(), Backing::NotBacked { .. }));
    // A private grant of a person is not visible to those who check the
    // grantee's acts, and backs nothing (reading).
    let mut quiet = w.genesis("a quiet agent", vec![own_home()], None, None);
    let qid = quiet.id;
    let qg = w.private_act(&mut singer, mips().law, law::types::GRANT, plain_grant(qid, false).to_map(), None, vec![qid]);
    sign(&mut w, &mut quiet, &qg);
    let mut qs = singer.clone();
    qs.binding = qg;
    qs.sign = key_of(qid);
    qs.seq = vec![];
    qs.cite = Some((singer.id, vec![qg]));
    let q = post(&mut w, &mut qs);
    assert!(matches!(view(&w).backing(&q).unwrap(), Backing::NotBacked { .. }));
}

/// Freeze suite v21, 3.9t (F129, H4 and H5): a deal's payees grant its
/// split service in the deal's terms. Each payee's grant is its own act,
/// naming "this agreement" by null (grant field 2); the deal lists them in
/// field 14, one per payee; signing the deal signs them, and the service
/// signs to accept each. A payee's grant key signs only receipts for money
/// coming into the deal, never one whose payer is the service, nor a
/// split's payout; each payee revokes its own grant.
#[test]
fn a_deals_payees_grant_its_split_service_in_its_terms() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut svc = w.genesis("a split service", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let (aid, bid, sid, fid) = (ana.id, ben.id, svc.id, fan.id);
    // Each payee's grant: scope 1, this agreement by null, a key the
    // service made for it.
    let deal_grant = |who: &str| {
        let (k, p) = grant_key(&format!("{sid:?} for {who}"));
        (k, Grant { grantee: sid, scope: 1, agreements: None, this_agreement: true, key: p, ..plain_grant(sid, false) })
    };
    let (ka, gra) = deal_grant("ana");
    let (kb, grb) = deal_grant("ben");
    // The format: field 2 written null, read back as this agreement.
    assert_eq!(Grant::decode(&gra.to_map()).unwrap(), gra);
    let bad = Grant { scope: 2, ..gra.clone() };
    assert!(Grant::decode(&bad.to_map()).is_err(), "this agreement only with scope 1");
    let ga = law_act(&mut w, &mut ana, law::types::GRANT, gra.to_map(), None);
    let gb = law_act(&mut w, &mut ben, law::types::GRANT, grb.to_map(), None);
    assert!(w.v.get(&ga).unwrap().act.outside.is_public(), "a person's grant is public");
    sign(&mut w, &mut svc, &ga);
    sign(&mut w, &mut svc, &gb);
    // The deal lists both grants in field 14.
    let mut t = deal_terms(aid, bid);
    t.payee_grants = Some(vec![ga, gb]);
    assert_eq!(Terms::decode(&t.to_map()).unwrap(), t);
    assert_eq!(t.check(&mips()), Ok(()));
    let deal = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &deal);
    // The service's strand in each payee's name.
    let strand = |p: &Person, g: Hash, k: &SchnorrKey| {
        let mut s = p.clone();
        s.binding = g;
        s.sign = k.clone();
        s.seq = vec![];
        s.cite = Some((p.id, vec![g]));
        s
    };
    let mut sa = strand(&ana, ga, &ka);
    let mut sb = strand(&ben, gb, &kb);
    let rc = |payee: Hash, payer: Hash, fulfils: Hash, purchase: Option<Hash>, batch: Option<Hash>| {
        Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(payer)),
            payee,
            amount: Amount { unit: spec("a unit"), value: 100 },
            fulfils,
            previous: None,
            forward: None,
            batch,
            purchase: purchase.map(|a| Purchase { agreement: a, line: a }),
        })
        .to_map()
    };
    let add = |w: &mut World, s: &mut Person, p: Vec<(Value, Value)>| {
        let a = w.everyday_act(s, mips().finance, 2, p, None, None);
        w.add(&a)
    };
    let backed = |w: &World, x: &Hash| matches!(view(w).backing(x).unwrap(), Backing::Backed { .. } | Backing::Binds { .. });
    let reason = |w: &World, x: &Hash| match view(w).backing(x).unwrap() {
        Backing::NotBacked { reason, .. } => reason,
        other => panic!("backed: {other:?}"),
    };
    // Before Ben signs, the deal does not exist, and carries no grant.
    let early = add(&mut w, &mut sa, rc(aid, fid, deal, Some(deal), None));
    assert!(reason(&w, &early).contains("H4"));
    sign(&mut w, &mut ben, &deal);
    // A fan's purchase under the deal's claim: Ana's own receipt, signed
    // by the service with Ana's grant key.
    let sale = add(&mut w, &mut sa, rc(aid, fid, deal, Some(deal), None));
    assert!(backed(&w, &sale));
    assert!(matches!(view(&w).consent(&sale).unwrap(), Consent::Granted { .. }));
    let ben_sale = add(&mut w, &mut sb, rc(bid, fid, deal, Some(deal), None));
    assert!(backed(&w, &ben_sale));
    // H5: never a receipt whose payer is the service itself.
    let payout = add(&mut w, &mut sb, rc(bid, sid, deal, None, None));
    assert!(reason(&w, &payout).contains("payer is the split service"));
    // Nor a split's payout, whoever is named as payer.
    let split = law::Split {
        receipt: sale,
        payouts: vec![law::Payout { receiver: bid, amount: 100, stake: None, role: None, evidence: None, fee_module: None, rail_fee: None }],
        cmip: spec("a split cMIP"),
        agreement: deal,
        tally: None,
        number: None,
    };
    let sp = law_act(&mut w, &mut svc, law::types::SPLIT, split.to_map(), None);
    let named = add(&mut w, &mut sb, rc(bid, fid, sp, None, None));
    assert!(reason(&w, &named).contains("payout"));
    let batched = add(&mut w, &mut sb, rc(bid, fid, deal, Some(deal), Some(spec("a batch"))));
    assert!(reason(&w, &batched).contains("payout"));
    // Nor money for anything but the deal, nor a receipt someone else
    // received, nor any act but a receipt.
    let other = add(&mut w, &mut sa, rc(aid, fid, spec("another deal"), Some(spec("another deal")), None));
    assert!(reason(&w, &other).contains("coming into the deal"));
    let not_hers = add(&mut w, &mut sa, rc(bid, fid, deal, Some(deal), None));
    assert!(reason(&w, &not_hers).contains("received"));
    let post = {
        let a = w.everyday_act(&mut sa, mips().envelope, 0, vec![], None, None);
        w.add(&a)
    };
    assert!(reason(&w, &post).contains("only receipts"));
    // Ana revokes her own grant, citing the sale; Ben's stands.
    let r = law_act(
        &mut w,
        &mut ana,
        law::types::REVOCATION,
        law::Revocation { grant: ga }.to_map(),
        Some(vec![Object { chain: aid, predecessor: sale }]),
    );
    assert_eq!(w.v.status(&r), Status::Valid);
    assert_eq!(view(&w).backing(&sale).unwrap(), Backing::Binds { grant: ga });
    let late = add(&mut w, &mut sa, rc(aid, fid, deal, Some(deal), None));
    assert!(reason(&w, &late).contains("G1"));
    let ben_late = add(&mut w, &mut sb, rc(bid, fid, deal, Some(deal), None));
    assert!(backed(&w, &ben_late), "each payee revokes only its own grant");
}

/// Freeze suite v21, 3.9t (F129, H4): field 14's two forms. A collective
/// names its split service by one grant; a deal lists one grant per payee.
/// A deal's chain of judgment following its split service is
/// `a_deals_chain_of_judgment_follows_its_split_service` (F130, H6).
#[test]
fn field_14_is_one_grant_in_a_collective_and_a_list_in_a_deal() {
    let (a, b) = (spec("ana"), spec("ben"));
    let mut d = deal_terms(a, b);
    d.payee_grants = Some(vec![spec("ana's grant"), spec("ben's grant")]);
    assert_eq!(d.check(&mips()), Ok(()));
    let mut x = d.clone();
    x.payee_grants = Some(vec![spec("ana's grant"), spec("ana's grant")]);
    assert!(x.check(&mips()).is_err(), "each grant once");
    let mut x = d.clone();
    x.payee_grants = None;
    x.split_grant = Some(spec("one grant"));
    assert!(x.check(&mips()).is_err(), "a deal lists its payees' grants");
    let mut c = label_terms(&[a, b, spec("cy")], spec("an authority"), spec("a keeper"), &|_| {});
    c.payee_grants = Some(vec![spec("a grant")]);
    assert!(c.check(&mips()).is_err(), "a collective names one grant");
    c.payee_grants = None;
    c.split_grant = Some(spec("a grant"));
    assert_eq!(c.check(&mips()), Ok(()));
}

/// F129, H4 (reading): one split service per deal, one grant per payee. A
/// deal listing grants to two services, or two grants of one payee,
/// carries none of them.
#[test]
fn a_deal_names_one_split_service_one_grant_per_payee() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut s1 = w.genesis("one service", vec![own_home()], None, None);
    let mut s2 = w.genesis("another service", vec![own_home()], None, None);
    let (aid, bid) = (ana.id, ben.id);
    let mk = |svc: Hash, tag: &str| {
        let (k, p) = grant_key(&format!("{svc:?} {tag}"));
        (k, Grant { grantee: svc, scope: 1, this_agreement: true, key: p, ..plain_grant(svc, false) })
    };
    let (ka, ga) = mk(s1.id, "a");
    let (_, gb) = mk(s2.id, "b");
    let ga = law_act(&mut w, &mut ana, law::types::GRANT, ga.to_map(), None);
    let gb = law_act(&mut w, &mut ben, law::types::GRANT, gb.to_map(), None);
    sign(&mut w, &mut s1, &ga);
    sign(&mut w, &mut s2, &gb);
    let mut t = deal_terms(aid, bid);
    t.payee_grants = Some(vec![ga, gb]);
    let deal = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &deal);
    sign(&mut w, &mut ben, &deal);
    let mut sa = ana.clone();
    sa.binding = ga;
    sa.sign = ka;
    sa.seq = vec![];
    sa.cite = Some((aid, vec![ga]));
    let rc = mor_core::finance::Payload::Receipt(mor_core::finance::Receipt {
        rail: spec("a rail Module"),
        proof: vec![],
        payer: Some(mor_core::finance::Payer::Identity(spec("a fan"))),
        payee: aid,
        amount: mor_core::finance::Amount { unit: spec("a unit"), value: 10 },
        fulfils: deal,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(mor_core::finance::Purchase { agreement: deal, line: deal }),
    });
    let a = w.everyday_act(&mut sa, mips().finance, 2, rc.to_map(), None, None);
    let x = w.add(&a);
    assert!(matches!(view(&w).backing(&x).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("one split service")));
}

/// Freeze suite v21, 3.9u (F130, H6): a deal's chain of judgment follows its
/// split service. Each service taking over is a group of grants, one per
/// payee, as many as field 14 lists, each listed once, signed with the
/// terms. A collective's service taking over stays one grant; a group takes
/// over from nothing else.
#[test]
fn a_deals_chain_of_judgment_follows_its_split_service() {
    use law::{ChainLink, Judge, Taker};
    let (a, b) = (spec("ana"), spec("ben"));
    let mut d = deal_terms(a, b);
    d.payee_grants = Some(vec![spec("ana to S"), spec("ben to S")]);
    d.time = Some((spec("a clock"), Value::Uint(0)));
    let group = |x: &[&str]| Taker::Grants(x.iter().map(|n| spec(n)).collect());
    d.chain = Some(vec![ChainLink {
        judge: Judge::SplitService,
        next: vec![(group(&["ana to T", "ben to T"]), 30), (group(&["ana to U", "ben to U"]), 60)],
    }]);
    assert_eq!(d.check(&mips()), Ok(()));
    assert_eq!(Terms::decode(&d.to_map()).unwrap(), d, "a group is written as a list");
    let with = |n: Vec<(Taker, u64)>| {
        let mut x = d.clone();
        x.chain = Some(vec![ChainLink { judge: Judge::SplitService, next: n }]);
        x.check(&mips())
    };
    // One grant per payee: as many as field 14 lists.
    assert!(matches!(with(vec![(group(&["ana to T"]), 30)]), Err(law::LawError::Check(w)) if w.contains("H6")));
    // A deal's service taking over is never one hash.
    assert!(matches!(with(vec![(spec("ana to T").into(), 30)]), Err(law::LawError::Check(w)) if w.contains("H6")));
    // Each grant once, across field 14 and every group.
    assert!(matches!(with(vec![(group(&["ana to S", "ben to T"]), 30)]), Err(law::LawError::Check(w)) if w.contains("H6")));
    assert!(matches!(
        with(vec![(group(&["ana to T", "ben to T"]), 30), (group(&["ana to T", "ben to U"]), 30)]),
        Err(law::LawError::Check(w)) if w.contains("H6")
    ));
    // The time reference stays compulsory: a service can stay silent.
    let mut x = d.clone();
    x.time = None;
    assert!(x.check(&mips()).is_err());
    // A group takes over from nothing but a deal's split service.
    let mut x = d.clone();
    x.arbitrators = Some(vec![spec("an arbitrator")]);
    x.chain = Some(vec![ChainLink { judge: Judge::Identity(spec("an arbitrator")), next: vec![(group(&["one", "two"]), 30)] }]);
    assert!(matches!(x.check(&mips()), Err(law::LawError::Check(w)) if w.contains("H6")));
    let mut c = label_terms(&[a, b, spec("cy")], spec("an authority"), spec("a keeper"), &|_| {});
    c.split_grant = Some(spec("a grant"));
    c.time = Some((spec("a clock"), Value::Uint(0)));
    c.chain = Some(vec![ChainLink { judge: Judge::SplitService, next: vec![(spec("another grant").into(), 30)] }]);
    assert_eq!(c.check(&mips()), Ok(()));
    c.chain = Some(vec![ChainLink { judge: Judge::SplitService, next: vec![(group(&["one", "two", "three"]), 30)] }]);
    assert!(matches!(c.check(&mips()), Err(law::LawError::Check(w)) if w.contains("H6")), "a collective's is one grant");
}

/// Freeze suite v21, 3.9u (F130, H6, readings 1 to 3): a deal's backup
/// service. Ana and Ben grant S (field 14) and, should S fail, T (the chain
/// of judgment), each with its own grant naming this agreement, signed with
/// the terms. T's grant keys count once the deal exists, as S's do, under
/// the same limit (H7); the pointer check accepts T's own pointer. A group
/// signed by other payees than field 14's, or naming S again, leaves the
/// deal carrying none of its grants (fail closed).
#[test]
fn a_deals_backup_service_holds_one_grant_per_payee() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut s = w.genesis("service S", vec![own_home()], None, None);
    let mut t = w.genesis("service T", vec![own_home()], None, None);
    let (aid, bid, sid, tid) = (ana.id, ben.id, s.id, t.id);
    let mk = |w: &mut World, payee: &mut Person, svc: &mut Person, tag: &str| {
        let (k, p) = grant_key(&format!("{:?} {tag}", svc.id));
        let g = Grant { grantee: svc.id, scope: 1, this_agreement: true, key: p, ..plain_grant(svc.id, false) };
        let g = law_act(w, payee, law::types::GRANT, g.to_map(), None);
        sign(w, svc, &g);
        (g, k)
    };
    let (as_, _) = mk(&mut w, &mut ana, &mut s, "ana");
    let (bs, _) = mk(&mut w, &mut ben, &mut s, "ben");
    let (at, kat) = mk(&mut w, &mut ana, &mut t, "ana");
    let (bt, _) = mk(&mut w, &mut ben, &mut t, "ben");
    let deal_of = |w: &mut World, ana: &mut Person, ben: &mut Person, group: Vec<Hash>, words: &str| {
        let mut d = deal_terms(aid, bid);
        d.text = words.into();
        d.payee_grants = Some(vec![as_, bs]);
        d.time = Some((spec("a clock"), Value::Uint(0)));
        d.chain = Some(vec![law::ChainLink { judge: law::Judge::SplitService, next: vec![(law::Taker::Grants(group), 30)] }]);
        assert_eq!(d.check(&mips()), Ok(()));
        let x = law_act(w, ana, law::types::TERMS, d.to_map(), None);
        sign(w, ana, &x);
        sign(w, ben, &x);
        x
    };
    let deal = deal_of(&mut w, &mut ana, &mut ben, vec![at, bt], "a song");
    let mut st = ana.clone();
    st.binding = at;
    st.sign = kat;
    st.seq = vec![];
    st.cite = Some((aid, vec![at]));
    let rc = |payer: Hash, fulfils: Hash| {
        Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(payer)),
            payee: aid,
            amount: Amount { unit: spec("a unit"), value: 10 },
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: fulfils, line: fulfils }),
        })
        .to_map()
    };
    let add = |w: &mut World, st: &mut Person, p: Vec<(Value, Value)>| {
        let a = w.everyday_act(st, mips().finance, 2, p, None, None);
        w.add(&a)
    };
    let reason = |w: &World, x: &Hash| match view(w).backing(x).unwrap() {
        Backing::NotBacked { reason, .. } => Some(reason),
        _ => None,
    };
    // T, with Ana's grant key, receipts a fan's purchase under the deal.
    let sale = add(&mut w, &mut st, rc(spec("a fan"), deal));
    assert_eq!(reason(&w, &sale), None);
    // H7: never a receipt whose payer is a split service the deal names,
    // the one it takes over from included.
    let from_s = add(&mut w, &mut st, rc(sid, deal));
    assert!(reason(&w, &from_s).is_some_and(|r| r.contains("payer is the split service")));
    let from_t = add(&mut w, &mut st, rc(tid, deal));
    assert!(reason(&w, &from_t).is_some_and(|r| r.contains("payer is the split service")));
    // The pointer check: Ana's pointer leading to T's own pointer counts.
    pointer_of(&mut w, &mut t, 1, None, &[b"T's node"]);
    pointer_of(&mut w, &mut s, 1, None, &[b"S's node"]);
    let p = pointer_of(&mut w, &mut ana, 1, None, &[b"T's node"]);
    assert_eq!(view(&w).pointer_check(&aid, &deal).unwrap(), law::PointerCheck::Ordinary { pointer: p, service: tid });
    // A group signed by Ana twice, not by Ben: the deal carries none.
    let (at2, _) = mk(&mut w, &mut ana, &mut t, "ana again");
    let odd = deal_of(&mut w, &mut ana, &mut ben, vec![at2, at], "an odd song");
    let mut so = ana.clone();
    so.binding = at2;
    so.sign = grant_key(&format!("{:?} ana again", tid)).0;
    so.seq = vec![];
    so.cite = Some((aid, vec![at2]));
    let x = add(&mut w, &mut so, rc(spec("a fan"), odd));
    assert!(reason(&w, &x).is_some_and(|r| r.contains("H6")), "{:?}", reason(&w, &x));
    // A group naming S again, as its own successor: none either.
    let (as2, ks2) = mk(&mut w, &mut ana, &mut s, "ana twice");
    let (bs2, _) = mk(&mut w, &mut ben, &mut s, "ben twice");
    let same = deal_of(&mut w, &mut ana, &mut ben, vec![as2, bs2], "the same service");
    let mut ss = ana.clone();
    ss.binding = as2;
    ss.sign = ks2;
    ss.seq = vec![];
    ss.cite = Some((aid, vec![as2]));
    let x = add(&mut w, &mut ss, rc(spec("a fan"), same));
    assert!(reason(&w, &x).is_some_and(|r| r.contains("H6")));
}

/// Freeze suite v21, 3.9v (F130, H7): one rule for every split service. The
/// label names its split service by a grant in field 14. With its grant
/// key, the service receipts money coming in under the label's own claims;
/// never a receipt whose payer is the service, nor a payout the label is
/// owed as an owner of someone else's work (the film's service paying it
/// 40), nor money under another agreement's claim. Another grant to the
/// same identity, named by no field 14, reaches what its kinds name
/// (reading).
#[test]
fn a_collectives_split_service_signs_only_incoming_receipts() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let k = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    let rec = lab.record(0, Some((k, sigs)), &[], vec![], k);
    let mut st = lab.strand(g, &key_of(svc.id));
    st.cite = Some((label, vec![g, rec]));
    let sid = svc.id;
    let rc = |payer: Hash, fulfils: Hash, purchase: Option<Hash>, batch: Option<Hash>| {
        Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(payer)),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 40 },
            fulfils,
            previous: None,
            forward: None,
            batch,
            purchase: purchase.map(|a| Purchase { agreement: a, line: a }),
        })
        .to_map()
    };
    let add = |lab: &mut Lab, st: &mut Person, p: Vec<(Value, Value)>| {
        let a = lab.w.everyday_act(st, mips().finance, 2, p, None, None);
        lab.w.add(&a)
    };
    let reason = |lab: &Lab, x: &Hash| match lab.view().backing(x).unwrap() {
        Backing::NotBacked { reason, .. } => Some(reason),
        _ => None,
    };
    // A fan's purchase under the label's own claim (its founding terms, or
    // the version naming the service): backed.
    let sale = add(&mut lab, &mut st, rc(spec("a fan"), k, Some(f), None));
    assert_eq!(reason(&lab, &sale), None);
    let on_offer = add(&mut lab, &mut st, rc(spec("a fan"), k, None, None));
    assert_eq!(reason(&lab, &on_offer), None, "a payment following the label's own terms");
    // Never one whose payer is the service itself.
    let own = add(&mut lab, &mut st, rc(sid, k, Some(k), None));
    assert!(reason(&lab, &own).is_some_and(|r| r.contains("payer is the split service") && r.contains("H7")));
    // The film's service owes the label 40: a payout, never signed for it.
    let film = spec("the film's deal");
    let payout = add(&mut lab, &mut st, rc(spec("the film's service"), film, None, Some(spec("a batch"))));
    assert!(reason(&lab, &payout).is_some_and(|r| r.contains("payout")));
    // Nor money under another agreement's claim.
    let other = add(&mut lab, &mut st, rc(spec("a fan"), film, Some(film), None));
    assert!(reason(&lab, &other).is_some_and(|r| r.contains("own claims")));
    // Citing only its grant, an older head, changes nothing: the version
    // naming the service is in the collective's history.
    let mut old = lab.strand(g, &key_of(svc.id));
    old.cite = Some((label, vec![g]));
    let dodge = add(&mut lab, &mut old, rc(sid, k, Some(k), None));
    assert!(reason(&lab, &dodge).is_some(), "{:?}", lab.view().backing(&dodge));
    // A grant to the same identity that no field 14 names: an ordinary
    // grant, reaching what its kinds name (reading).
    let g2 = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g2);
    sign(&mut lab.w, &mut svc, &g2);
    let mut s2 = lab.strand(g2, &key_of(svc.id));
    s2.cite = Some((label, vec![g2, rec]));
    let plain = add(&mut lab, &mut s2, rc(spec("the film's service"), film, Some(film), None));
    assert_eq!(reason(&lab, &plain), None);
}

// ---------------------------------------------------------------- what pays a debt (audit, October 2026)

/// A payment toward a debt as its receiver (a receipt, type 2) or its payer
/// (a claim, type 3) signs it, with its own rail proof.
#[allow(clippy::too_many_arguments)]
fn payment(
    lab: &mut Lab,
    signer: &mut Person,
    claim: bool,
    payee: Hash,
    obligation: Hash,
    unit: Hash,
    value: u64,
    proof: &[u8],
) -> Hash {
    use mor_core::finance::{Amount, Claim, Payer, Payload, Receipt};
    let amount = Amount { unit, value };
    let (t, p) = if claim {
        (3, Payload::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee,
            amount,
            fulfils: obligation,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: None,
        }))
    } else {
        (2, Payload::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(lab.c[0].id)),
            payee,
            amount,
            fulfils: obligation,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        }))
    };
    let a = lab.w.everyday_act(signer, mips().finance, t, p.to_map(), None, None);
    lab.w.add(&a)
}

/// Finance rules 4 and 7 (audit, October 2026, gap 2): a receipt its
/// creditor signs pays a debt only with the rail's answer, valid, and only
/// in the debt's unit. A creditor-signed receipt with an empty proof and no
/// rail answer, or one for 100 of another unit, settles nothing: the
/// collective still owes, and cannot close.
#[test]
fn a_receipt_pays_a_debt_only_with_the_rails_answer_and_in_its_unit() {
    use mor_core::finance::PaidAt;
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let pid = printer.id;
    let d = obligation_to(&mut lab, pid, 100);
    // Signed by the creditor, naming the debt, the right amount: no proof,
    // no rail answer. Nothing paid.
    receipt_unanswered(&mut lab.w, &mut printer, label, d, 100);
    assert_eq!(lab.view().paid_toward(&d), 0);
    assert_eq!(lab.view().owes(&label).unwrap(), vec![d]);
    // A valid rail answer, but 100 of another unit: nothing paid.
    let other = payment(&mut lab, &mut printer, false, pid, d, spec("another unit"), 100, b"proof: another unit");
    lab.rail_valid.push((other, PaidAt::VaultEntry(pid, 0)));
    assert_eq!(lab.view().paid_toward(&d), 0);
    assert_eq!(lab.view().owes(&label).unwrap(), vec![d]);
    // In the debt's unit, with the rail's answer: paid.
    let good = payment(&mut lab, &mut printer, false, pid, d, spec("a unit"), 100, b"proof: paid");
    lab.rail_valid.push((good, PaidAt::VaultEntry(pid, 0)));
    assert_eq!(lab.view().paid_toward(&d), 100);
    assert_eq!(lab.view().owes(&label).unwrap(), Vec::<Hash>::new());
}

/// Finance rules 12, 12a, 14 and 14a in Law's discharge (audit, October
/// 2026, gaps 2 and 6): where the creditor's rules say a payment counts.
/// The printer has a vault (limit 50 in the debt's unit) and a flow pointer
/// chain. The label's debts to it are IOUs (no agreement act): each counts
/// on the printer's flow only once the printer acknowledges it with an act
/// of its own, and then for the latest version that act holds, or an older
/// one, whatever the IOU names (rule 14, F145, F155); only within the
/// vault's limit (rule 14a); and only up to a fork of the chain (rule 12):
/// once a thief, with the stolen signing key, signs a second version 2
/// naming the same predecessor, a payment to either version 2 pays
/// nothing. *Changed by F145: under F133 an IOU citing the pointer it
/// named counted on that flow without any act of the printer's.*
#[test]
fn a_debt_is_paid_only_where_the_creditors_rules_let_it_count() {
    use mor_core::finance::{vault_declaration, Amount, Obligation, PaidAt, PayeePointer, Payload, Rail, VaultEntry};
    let mut lab = Lab::new(&|_| {});
    let fin = mips().finance;
    let vault = VaultEntry { unit: spec("a unit"), rail_module: spec("a rail Module"), source: b"the printer's vault".to_vec(), limit: 50 };
    let mut printer = lab.w.genesis_with("the printer", vec![own_home()], None, None, Some(vec![vault_declaration(&fin, &[vault])]), 3);
    let pid = printer.id;
    let pointer = |lab: &mut Lab, p: &mut Person, version: u64, previous: Option<Hash>, node: &str| {
        let x = Payload::PayeePointer(PayeePointer {
            payee: pid,
            version,
            previous,
            rails: vec![Rail { module: spec("a rail Module"), address: node.as_bytes().to_vec() }],
        });
        let a = lab.w.everyday_act(p, fin, 0, x.to_map(), None, None);
        lab.w.add(&a)
    };
    let v1 = pointer(&mut lab, &mut printer, 1, None, "the printer's first node");
    // IOUs the label signs, naming a pointer (informative only, F155).
    let iou = |lab: &mut Lab, named: Hash, value: u64| {
        let o = Payload::Obligation(Obligation {
            debtor: lab.c[0].id,
            creditor: pid,
            amount: Amount { unit: spec("a unit"), value },
            pointer: named,
            agreement: None,
        });
        let a = lab.w.everyday_act(&mut lab.c[0], fin, 1, o.to_map(), None, None);
        let x = lab.w.add(&a);
        lab.sign(BEN, &x);
        x
    };
    // The printer acknowledges a debt with an act of its own (F145).
    let ack = |lab: &mut Lab, printer: &mut Person, d: Hash| {
        let a = lab.w.everyday_act(printer, mips().law, law::types::NEGOTIATION, vec![], None, Some(vec![d]));
        lab.w.add(&a)
    };
    let paid = |lab: &mut Lab, printer: &mut Person, d: Hash, value: u64, at: PaidAt, proof: &str| {
        let r = payment(lab, printer, false, pid, d, spec("a unit"), value, proof.as_bytes());
        lab.rail_valid.push((r, at));
        lab.view().paid_toward(&d)
    };
    // Rule 14: a debt the printer acknowledged while its pointer was
    // version 1, paid to version 2's flow, pays nothing; paid to the vault,
    // it pays.
    let old = iou(&mut lab, v1, 40);
    ack(&mut lab, &mut printer, old);
    let v2 = pointer(&mut lab, &mut printer, 2, Some(v1), "the printer's second node");
    assert_eq!(paid(&mut lab, &mut printer, old, 40, PaidAt::Flow(v2), "old, to v2"), 0);
    assert_eq!(paid(&mut lab, &mut printer, old, 40, PaidAt::VaultEntry(pid, 0), "old, to the vault"), 40);
    // F145: a debt the printer has not acknowledged counts on no flow.
    let bare = iou(&mut lab, v2, 30);
    assert_eq!(paid(&mut lab, &mut printer, bare, 30, PaidAt::Flow(v2), "bare, to v2"), 0);
    ack(&mut lab, &mut printer, bare);
    assert_eq!(lab.view().paid_toward(&bare), 30, "acknowledged by an act holding version 2");
    // Rule 14a: above the vault's limit of 50, paid to the flow, nothing.
    let big = iou(&mut lab, v2, 80);
    ack(&mut lab, &mut printer, big);
    assert_eq!(paid(&mut lab, &mut printer, big, 80, PaidAt::Flow(v2), "big, to the flow"), 0);
    assert_eq!(paid(&mut lab, &mut printer, big, 80, PaidAt::VaultEntry(pid, 0), "big, to the vault"), 80);
    // Within the limit, acknowledged by an act holding version 2, paid to
    // it: it counts...
    let d = iou(&mut lab, v2, 30);
    ack(&mut lab, &mut printer, d);
    assert_eq!(paid(&mut lab, &mut printer, d, 30, PaidAt::Flow(v2), "d, to v2"), 30);
    // ...until the thief forks the chain (rule 12). Paid to the thief's
    // version 2, or to the owner's, past the fork, nothing counts; paid to
    // version 1, the last pointer before the fork, it counts.
    let mut thief = printer.clone();
    let forked = pointer(&mut lab, &mut thief, 2, Some(v1), "the thief's node");
    assert_eq!(lab.view().paid_toward(&d), 0, "the owner's version 2 is past the fork");
    let d2 = iou(&mut lab, v2, 30);
    ack(&mut lab, &mut printer, d2);
    assert_eq!(paid(&mut lab, &mut thief, d2, 30, PaidAt::Flow(forked), "d2, to the thief"), 0);
    assert_eq!(paid(&mut lab, &mut printer, d2, 30, PaidAt::Flow(v1), "d2, to v1"), 30);
}

/// F153 (Identity, the sentence after rule 17): a debt paid to a pointer
/// its creditor published after a homeless rotation that only this
/// reader's own failed attempt to reach the old home lets count is
/// unknown: neither paid nor unpaid, and nothing binding relies on the
/// payment. Reading follows the creditor; once the old home's operator
/// closes it, the payment counts.
#[test]
fn a_debt_paid_through_a_readers_own_attempt_is_unknown() {
    use common::home;
    use mor_core::finance::{Amount, Obligation, PaidAt, PayeePointer, Payload, Rail};
    let mut lab = Lab::new(&|_| {});
    let fin = mips().finance;
    let old = lab.w.operator("the printer's old home");
    let mut new = lab.w.operator("the printer's new home");
    let printer = lab.w.genesis("the printer", vec![home(&old)], None, None);
    let pid = printer.id;
    let (hr, mut p1) = lab.w.rotate(&printer, Rot { homeless: true, homes: Some(vec![home(&new)]), ..Default::default() });
    lab.w.receipt(&mut new, &pid, &hr, 1);
    lab.w.v.failed_to_reach(old.id);
    let x = Payload::PayeePointer(PayeePointer {
        payee: pid,
        version: 1,
        previous: None,
        rails: vec![Rail { module: spec("a rail Module"), address: b"the printer's new node".to_vec() }],
    });
    let a = lab.w.everyday_act(&mut p1, fin, 0, x.to_map(), None, None);
    let v1 = lab.w.add(&a);
    // The label's IOU, citing the pointer it names (F133), and its payment.
    let o = Payload::Obligation(Obligation {
        debtor: lab.c[0].id,
        creditor: pid,
        amount: Amount { unit: spec("a unit"), value: 100 },
        pointer: v1,
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[0], fin, 1, o.to_map(), Some(vec![Object { chain: pid, predecessor: v1 }]), None);
    let d = lab.w.add(&a);
    lab.sign(BEN, &d);
    // The printer acknowledges the IOU with an act of its own, which holds
    // its pointer through its sequence (F145): only then can it count on
    // the flow.
    let a = lab.w.everyday_act(&mut p1, mips().law, law::types::NEGOTIATION, vec![], None, Some(vec![d]));
    lab.w.add(&a);
    let mut payer = lab.c[0].clone();
    let c = payment(&mut lab, &mut payer, true, pid, d, spec("a unit"), 100, b"paid to the new node");
    lab.rail_valid.push((c, PaidAt::Flow(v1)));
    // Reading follows the printer to its new home: the pointer is valid.
    assert_eq!(lab.w.v.status(&v1), Status::Valid);
    // Discharging the debt rests on the attempt: unknown, never paid.
    let v = lab.view();
    assert_eq!(v.paid(&d), Err(LawError::OwnAttempt));
    assert_eq!(v.paid_toward(&d), 0, "nothing binding relies on it");
    // The old home closes: the payment counts.
    lab.w.rotate(&old, Rot { closure: true, ..Default::default() });
    assert_eq!(lab.view().paid(&d), Ok(100));
    assert_eq!(lab.view().paid_toward(&d), 100);
}

/// Finance rule 10, double entry (audit, October 2026, gap 5): a payer's
/// valid claim is evidence on equal footing with a receipt. A receiver
/// that signs no receipt cannot keep the debt open: the claim alone shows
/// the money arrived. One that signs a receipt for less is outweighed: the
/// greater amount counts. Both are shown as open questions on the receiver.
/// A claim without the rail's answer counts for nothing and is not shown.
#[test]
fn a_payers_claim_counts_and_shows_what_the_receiver_hides() {
    use mor_core::finance::{Amount, PaidAt};
    use mor_core::law::Disagreement;
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let pid = printer.id;
    let unit = spec("a unit");
    let d = obligation_to(&mut lab, pid, 100);
    let at = PaidAt::VaultEntry(pid, 0);
    // The label, paying, signs a claim without the rail's answer: nothing.
    let mut payer = lab.c[0].clone();
    let bare = payment(&mut lab, &mut payer, true, pid, d, unit, 100, b"no answer");
    assert_eq!(lab.view().paid_toward(&d), 0);
    assert!(lab.view().disagreements(&pid).is_empty());
    // A claim with the rail's answer for 60: the printer signs no receipt.
    let c1 = payment(&mut lab, &mut payer, true, pid, d, unit, 60, b"payment one");
    lab.rail_valid.push((c1, at));
    assert_eq!(lab.view().paid_toward(&d), 60, "the claim alone shows the money arrived");
    assert_eq!(lab.view().disagreements(&pid), vec![Disagreement::NoReceipt { claim: c1 }]);
    // A second payment of 40, claimed; the printer signs a receipt for 10.
    let c2 = payment(&mut lab, &mut payer, true, pid, d, unit, 40, b"payment two");
    lab.rail_valid.push((c2, at));
    let r2 = payment(&mut lab, &mut printer, false, pid, d, unit, 10, b"payment two");
    lab.rail_valid.push((r2, at));
    let v = lab.view();
    assert_eq!(v.paid_toward(&d), 100, "the greater amount counts");
    assert_eq!(v.owes(&label).unwrap(), Vec::<Hash>::new());
    let shown = v.disagreements(&pid);
    assert!(shown.contains(&Disagreement::NoReceipt { claim: c1 }));
    assert!(shown.contains(&Disagreement::Differs {
        claim: c2,
        receipt: r2,
        claimed: Amount { unit, value: 40 },
        receipted: Amount { unit, value: 10 },
        payee: false,
        fulfils: false,
    }));
    assert_eq!(shown.len(), 2);
    drop(v);
    // The printer signs a receipt matching the first payment: that question
    // closes, and the payment is not counted twice.
    let r1 = payment(&mut lab, &mut printer, false, pid, d, unit, 60, b"payment one");
    lab.rail_valid.push((r1, at));
    let v = lab.view();
    assert_eq!(v.paid_toward(&d), 100);
    assert!(!v.disagreements(&pid).iter().any(|x| matches!(x, Disagreement::NoReceipt { .. })));
    let _ = bare;
}

/// Step 11b, human test of 8 October 2026: a client composing a clone's
/// mark asks Law who counts at the collective's next line (rule 44d,
/// `next_voices`), and Law says why it reads a collective as broken
/// (`broken`). A removal whose record never reached Law: Law still counts
/// the member's voice, so a mark naming only those who stay is false
/// (rule 45a), and the rotation declaring it leaves the collective broken.
#[test]
fn the_next_line_counts_the_voices_a_mark_names() {
    for drawn in [true, false] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let col = lab.c[0].id;
        let ids = lab.ids();
        let all = sorted(vec![ids[ANA], ids[BEN], ids[CY]]);
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
        assert_eq!(n.agreement, f);
        assert_eq!(sorted(n.voices.clone()), all);
        assert_eq!(n.needed, Some(3), "every party whose voice remains");
        // Those whose resignations a record of the change will register first are left out.
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[ids[BEN]]).unwrap().unwrap();
        assert_eq!((sorted(n.voices), n.needed), (sorted(vec![ids[ANA], ids[CY]]), Some(2)));

        let mut ben = lab.m[BEN].clone();
        let res = lab.resign_from(&mut ben, f, None);
        if drawn {
            lab.record(0, None, &[], vec![res], f);
        }
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
        assert_eq!(n.voices.contains(&ids[BEN]), !drawn, "a resignation counts at the record registering it, not before");

        // The clone removing Ben, marked with Ana and Cy only.
        let stay = vec![ids[ANA], ids[CY]];
        let auth = lab.authority.id;
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &|t| {
            t.parties = stay.clone();
            let g = t.grammar.as_mut().unwrap();
            g.signing = Holding::Shares { threshold: 2, members: stay.clone() };
            g.safety = Holding::Shares { threshold: 2, members: stay.clone() };
            g.recovery = Some(Recovery::Escrow { authority: auth });
            for a in t.areas.as_mut().unwrap() {
                a.holders.retain(|h| stay.contains(h));
            }
        });
        let k = lab.propose(ANA, &t);
        let sa = lab.sign(ANA, &k);
        let sc = lab.sign(CY, &k);
        lab.rotate(Some((k, vec![sa, sc])), &[0]);
        let broken = lab.view().broken(&col).unwrap();
        if drawn {
            assert_eq!(broken, None);
            let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
            assert_eq!((n.agreement, sorted(n.voices)), (k, sorted(stay)));
        } else {
            let w = broken.expect("the rotation's clone names too few signers");
            assert!(w.contains("the mark names too few signers to meet the power (rule 45a)"), "{w}");
            assert_eq!(lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap_err(), w);
        }
    }
}

/// Law draft 10, revised in place for F185 (rule 37d), freeze suite v21,
/// step 3.7w: a broken collective, and its way back. Ben resigns, but the
/// record registering it never reaches the verifier; the rotation removing
/// him declares a clone whose mark names only Ana and Cy, too few for
/// "every party whose voice remains": the broken act. Every act of the
/// broken stretch counts for nothing, for good; a rollback naming the
/// broken act, a clone of the founding agreement, registering Ben's
/// resignation, signed by Ana and Cy, brings the collective back.
#[test]
fn a_broken_collective_rolls_back() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let law = mips().law;
    let auth = lab.authority.id;
    let stay = vec![ids[ANA], ids[CY]];
    let without_ben = move |t: &mut Terms| {
        t.parties = stay.clone();
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: stay.clone() };
        g.safety = Holding::Shares { threshold: 2, members: stay.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        for a in t.areas.as_mut().unwrap() {
            a.holders.retain(|h| stay.contains(h));
        }
    };

    // Ben resigns from the founding agreement; the record is lost.
    let mut ben = lab.m[BEN].clone();
    let res_b = lab.resign_from(&mut ben, f, None);
    let broken_clone = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &without_ben);
    let k1 = lab.propose(ANA, &broken_clone);
    let (sa, sc) = (lab.sign(ANA, &k1), lab.sign(CY, &k1));
    let rot1 = lab.rotate(Some((k1, vec![sa, sc])), &[0]);
    let b = lab.view().broken_act(&col).unwrap().expect("broken, with a way back");
    assert_eq!((b.act, b.before), (rot1, f));
    assert!(b.reason.contains("too few signers"), "{}", b.reason);

    // The broken stretch: a publication counts for nothing; a record is no line.
    let pub1 = lab.publish(0);
    lab.sign(ANA, &pub1);
    assert!(matches!(lab.consent(&pub1), Consent::Broken { .. }));
    let rec = lab.record(0, None, &[], vec![res_b], k1);
    assert!(!lab.view().record(&col, &rec).unwrap().line, "a record of the broken stretch is no line");

    // Who counts for the rollback: the founding agreement's constitutional
    // change rule, every voice that remains; Ben's resignation, once the
    // rollback registers it, takes him out.
    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, n.voices.len(), n.needed), (f, 3, Some(3)));
    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &[ids[BEN]]).unwrap().unwrap();
    assert_eq!((sorted(n.voices), n.needed), (sorted(vec![ids[ANA], ids[CY]]), Some(2)));

    let rb = |lab: &mut Lab, k: Hash, sigs: Vec<Hash>, broken: Hash, regs: Vec<Hash>| {
        lab.rotate_with(Some(vec![law::rollback_declaration(&law, &k, &sigs, &broken, &regs)]), &[0])
    };
    let still_broken = |lab: &Lab| lab.view().broken_act(&col).unwrap().map(|b| b.act);

    // Rollbacks that put nothing in force, each part of the broken stretch.
    let r = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &without_ben);
    let r = lab.propose(ANA, &r);
    let (ra, rc) = (lab.sign(ANA, &r), lab.sign(CY, &r));
    rb(&mut lab, r, vec![ra, rc], pub1, vec![res_b]); // names another act as broken
    assert_eq!(still_broken(&lab), Some(rot1));
    rb(&mut lab, r, vec![ra, rc], rot1, vec![]); // Ben's voice still counted: too few
    assert_eq!(still_broken(&lab), Some(rot1));
    rb(&mut lab, r, vec![ra, rc], rot1, vec![pub1]); // registers what is no resignation
    assert_eq!(still_broken(&lab), Some(rot1));
    // (A declaration of absence made during the stretch may be registered
    // by the rollback: RB3, `rb3_a_rollback_registers_a_declaration_of_absence`.)
    let of_broken = lab.clone_terms(&k1, vec![(Power::Constitutional, vec![ANA, CY])], &|_| {});
    let of_broken = lab.propose(ANA, &of_broken);
    let (oa, oc) = (lab.sign(ANA, &of_broken), lab.sign(CY, &of_broken));
    rb(&mut lab, of_broken, vec![oa, oc], rot1, vec![res_b]); // a clone of the broken clone
    assert_eq!(still_broken(&lab), Some(rot1));
    let by_clone_rule = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, CY])], &|_| {});
    let by_clone_rule = lab.propose(ANA, &by_clone_rule);
    let (ca, cc) = (lab.sign(ANA, &by_clone_rule), lab.sign(CY, &by_clone_rule));
    rb(&mut lab, by_clone_rule, vec![ca, cc], rot1, vec![res_b]); // marked with the clone rule
    assert_eq!(still_broken(&lab), Some(rot1));
    // A normal clone declaration in the stretch is part of it too.
    lab.rotate(Some((r, vec![ra, rc])), &[0]);
    assert_eq!(still_broken(&lab), Some(rot1));

    // The rollback: the founding agreement without Ben, naming the broken
    // act, registering his resignation, signed by Ana and Cy.
    let back = rb(&mut lab, r, vec![ra, rc], rot1, vec![res_b]);
    let v = lab.view();
    assert_eq!(v.broken(&col).unwrap(), None);
    assert_eq!(v.broken_act(&col).unwrap(), None);
    assert_eq!(v.current(&col).unwrap().unwrap().agreement, r);
    let n = v.next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, sorted(n.voices)), (r, sorted(vec![ids[ANA], ids[CY]])));
    // The identity chain carried on: the broken act is still there, shown.
    let res = lab.w.v.resolve(&col);
    assert!(res.position_of(&rot1).unwrap() < res.position_of(&back).unwrap());
    drop(v);
    // The broken stretch counts for nothing, for good; a publication after the rollback counts.
    assert!(matches!(lab.consent(&pub1), Consent::Broken { .. }));
    let pub2 = lab.publish(0);
    lab.sign(ANA, &pub2);
    assert!(lab.counts(&pub2), "{:?}", lab.consent(&pub2));
}

/// Rule 37d: a rollback may change nothing; its mark names the
/// constitutional change rule all the same, never the clone rule rule 44c.2
/// would give such a clone. It needs every voice that remains: a draft with
/// two signatures of three. The resignations it registers take effect at
/// its line and stay in effect after it.
#[test]
fn a_rollback_may_change_nothing_and_needs_every_voice_that_remains() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let law = mips().law;
    // A rotation declaring a clone marked with the clone rule: broken (rule 37, B5).
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let (s1, s2) = (lab.sign(ANA, &k1), lab.sign(BEN, &k1));
    let rot1 = lab.rotate(Some((k1, vec![s1, s2])), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some());

    // The founding agreement again, changing nothing, marked with the constitutional change rule.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let v = lab.view();
    assert!(v.agreement(&r).unwrap().invalid.is_some(), "as an ordinary clone its mark is false");
    assert_eq!(v.rollback_agreement(&r).unwrap().invalid, None, "as a rollback's it is not");
    drop(v);
    let (a, b) = (lab.sign(ANA, &r), lab.sign(BEN, &r));
    lab.rotate_with(Some(vec![law::rollback_declaration(&law, &r, &[a, b], &rot1, &[])]), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some(), "a draft: Cy has not signed");
    let c = lab.sign(CY, &r);
    lab.rotate_with(Some(vec![law::rollback_declaration(&law, &r, &[a, b, c], &rot1, &[])]), &[0]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, r);

    // Broken again, and rolled back registering Cy's resignation: the clone
    // keeps Cy among the parties, but from that line his voice is gone.
    let k2 = lab.clone_terms(&r, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Other words.".into());
    let k2 = lab.propose(ANA, &k2);
    let (t1, t2) = (lab.sign(ANA, &k2), lab.sign(BEN, &k2));
    let rot2 = lab.rotate(Some((k2, vec![t1, t2])), &[0]);
    let b = lab.view().broken_act(&col).unwrap().unwrap();
    assert_eq!((b.act, b.before), (rot2, r), "the next rollback names the new broken act, before it the first rollback's clone");
    let mut cy = lab.m[CY].clone();
    let res_c = lab.resign_from(&mut cy, r, None);
    let same2 = lab.clone_terms(&r, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r2 = lab.propose(ANA, &same2);
    let (u1, u2) = (lab.sign(ANA, &r2), lab.sign(BEN, &r2));
    lab.rotate_with(Some(vec![law::rollback_declaration(&law, &r2, &[u1, u2], &rot2, &[res_c])]), &[0]);
    let v = lab.view();
    assert_eq!(v.broken(&col).unwrap(), None);
    let n = v.next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, sorted(n.voices)), (r2, sorted(vec![ids[ANA], ids[BEN]])));
    assert_eq!(v.current(&col).unwrap().unwrap().departed, vec![ids[CY]]);
    drop(v);

    // F185: a rollback voids only an act Law reads as broken. An attempt on
    // the working collective, naming an act already repaired, puts nothing
    // in force and is itself a broken act, repaired by a rollback to just
    // before it.
    let attempt = lab.rotate_with(Some(vec![law::rollback_declaration(&law, &r2, &[u1, u2], &rot1, &[])]), &[0]);
    let b = lab.view().broken_act(&col).unwrap().expect("the attempt breaks the collective");
    assert_eq!((b.act, b.before), (attempt, r2));
    assert!(b.reason.contains("not broken"), "{}", b.reason);
}

/// Rule 37d with rule 44d: a resignation in the broken stretch cannot make
/// the rule impossible while a voice remains; once every voice has
/// resigned, nothing meets it and no rollback is possible (the last voice,
/// rule 37a). A resignation naming the broken clone names an agreement
/// never in force: no rollback registers it.
#[test]
fn no_rollback_once_every_voice_has_resigned() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let law = mips().law;
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let (s1, s2) = (lab.sign(ANA, &k1), lab.sign(BEN, &k1));
    let rot1 = lab.rotate(Some((k1, vec![s1, s2])), &[0]);

    let mut cy = lab.m[CY].clone();
    let wrong = lab.resign_from(&mut cy, k1, None);
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r = lab.propose(ANA, &same);
    let (a, b) = (lab.sign(ANA, &r), lab.sign(BEN, &r));
    lab.rotate_with(Some(vec![law::rollback_declaration(&law, &r, &[a, b], &rot1, &[wrong])]), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some(), "a resignation from the broken clone registers nothing");

    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &ids).unwrap().unwrap();
    assert_eq!((n.voices.len(), n.needed), (0, None), "every voice leaving: nothing meets the rule");
    let mut regs = vec![];
    for who in [ANA, BEN, CY] {
        let mut p = lab.m[who].clone();
        regs.push(lab.resign_from(&mut p, f, None));
    }
    lab.rotate_with(Some(vec![law::rollback_declaration(&law, &r, &[a, b], &rot1, &regs)]), &[0]);
    // Every voice registered as gone: no rollback can complete; the
    // collective stays broken, its reason still the broken act's.
    assert_eq!(lab.view().broken_act(&col).unwrap().map(|b| b.act), Some(rot1));
}

// ---------------------------------------------------------------- F187, RB1 to RB6 (9 October 2026)

/// The broken act of `a_broken_collective_rolls_back`: Ben resigns, the
/// record is lost, the rotation removing him names too few signers. The
/// clone it declared (`k1`, marked with Ana and Cy), its signature acts,
/// Ben's resignation and the broken act.
fn break_by_lost_record(lab: &mut Lab) -> (Hash, Vec<Hash>, Hash, Hash) {
    let f = lab.founding;
    let ids = lab.ids();
    let auth = lab.authority.id;
    let stay = vec![ids[ANA], ids[CY]];
    let mut ben = lab.m[BEN].clone();
    let res_b = lab.resign_from(&mut ben, f, None);
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &move |t| {
        t.parties = stay.clone();
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: stay.clone() };
        g.safety = Holding::Shares { threshold: 2, members: stay.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        for a in t.areas.as_mut().unwrap() {
            a.holders.retain(|h| stay.contains(h));
        }
    });
    let k1 = lab.propose(ANA, &t);
    let sigs = vec![lab.sign(ANA, &k1), lab.sign(CY, &k1)];
    let rot1 = lab.rotate(Some((k1, sigs.clone())), &[0]);
    (k1, sigs, res_b, rot1)
}

/// Absence judged by two of the other members; the safety key two of
/// three, so that no escrowed share is needed.
fn others_judge_absence(t: &mut Terms) {
    let ids = t.parties.clone();
    t.abandonment.as_mut().unwrap().authority = Authority::Others(2);
    let g = t.grammar.as_mut().unwrap();
    g.safety = Holding::Shares { threshold: 2, members: ids };
    g.recovery = None;
}

/// A rotation declaring a rollback.
fn roll_back(lab: &mut Lab, k: Hash, sigs: &[Hash], broken: Hash, regs: &[Hash]) -> Hash {
    let law = mips().law;
    lab.rotate_with(Some(vec![law::rollback_declaration(&law, &k, sigs, &broken, regs)]), &[0])
}

/// F187 (5), rule 37d: "the broken clone stays on its own branch, never in
/// force". The clone the broken act declared is refused as a rollback's
/// clone, even where its mark happens to equal a rollback's.
#[test]
fn f187_5_the_broken_clone_is_never_the_rollbacks_clone() {
    let mut lab = Lab::new(&|_| {});
    let col = lab.c[0].id;
    let (k1, sigs, res_b, rot1) = break_by_lost_record(&mut lab);
    roll_back(&mut lab, k1, &sigs, rot1, &[res_b]);
    assert_eq!(
        lab.view().broken_act(&col).unwrap().map(|b| b.act),
        Some(rot1),
        "the broken clone itself puts nothing in force"
    );
    // A new clone of the same agreement, the same rules, signed afresh: the way back.
    let f = lab.founding;
    let r = lab.view().terms(&k1).unwrap();
    let r = lab.propose(ANA, &r);
    let rs = vec![lab.sign(ANA, &r), lab.sign(CY, &r)];
    assert_eq!(lab.view().terms(&r).unwrap().parent, Some(f));
    roll_back(&mut lab, r, &rs, rot1, &[res_b]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, r);
}

/// F187 (6), rule 37d and C2: a departing member's signature that the
/// collective placed before the rollback counts there as at every other
/// line. A constitutional clone of the founding agreement, signed by all
/// three and acknowledged by the label before the broken act, is declared
/// as the rollback's clone while the rollback registers Cy's resignation:
/// Cy still counts for it, so a mark naming Ana and Ben alone is too few,
/// and one naming all three completes it. (The text said "counts for
/// nothing there"; it now says what the core does. No code changed.)
#[test]
fn f187_6_a_departing_members_placed_signature_counts_at_the_rollback() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let drafted = |lab: &mut Lab, mark: Vec<usize>| -> (Hash, Vec<Hash>) {
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, mark)], &|t| t.text = "Drafted before the break.".into());
        let k = lab.propose(ANA, &t);
        let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &k)).collect();
        for x in &s {
            lab.acknowledge(0, *x);
        }
        (k, s)
    };
    let (two, s2) = drafted(&mut lab, vec![ANA, BEN]);
    let (three, s3) = drafted(&mut lab, vec![ANA, BEN, CY]);
    // Broken by a clone marked with the clone rule (rule 37, B5).
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let mut cy = lab.m[CY].clone();
    let res_c = lab.resign_from(&mut cy, f, None);
    roll_back(&mut lab, two, &s2[..2], rot1, &[res_c]);
    let b = lab.view().broken_act(&col).unwrap();
    assert_eq!(b.map(|b| b.act), Some(rot1), "Cy's placed signature counts: two is too few");
    roll_back(&mut lab, three, &s3, rot1, &[res_c]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, three);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().departed, vec![lab.m[CY].id]);
}

/// F187 (7), rule 37d: an act of the broken stretch places no signature
/// at all, a declaration of absence's included. Ben's signature act on
/// Ana's declaration of Cy's absence, acknowledged by the label during the
/// broken stretch, does not count at a record after the rollback; the
/// same acknowledgement made after the rollback does.
#[test]
fn f187_7_a_stretch_acknowledgement_places_no_signature_on_a_declaration() {
    let mut lab = Lab::new(&others_judge_absence);
    let f = lab.founding;
    let col = lab.c[0].id;
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let sb = lab.sign(BEN, &d);
    lab.acknowledge(0, sb);
    // The rollback restores the founding agreement, every voice signing.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    let rec = lab.record(0, None, &[], vec![d], r);
    let e = lab.view().record(&col, &rec).unwrap();
    assert!(!e.line, "Ben's signature, acknowledged only during the broken stretch, is not placed");
    assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("1 of the 2")), "{:?}", e.not_a_line);
    lab.acknowledge(0, sb);
    let rec = lab.record(0, None, &[], vec![d], r);
    let e = lab.view().record(&col, &rec).unwrap();
    assert!(e.line, "{:?}", e.not_a_line);
}

/// RB4 (decided 9 October 2026, "broken is broken"): a rotation whose
/// Law declaration is missing (the kind removed) or unreadable is a broken
/// act, a technical one, with the same way back: a rollback to the
/// agreement in force just before it.
#[test]
fn rb4_a_missing_or_unreadable_declaration_is_a_break_with_a_rollback() {
    for case in ["removed", "unreadable"] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let col = lab.c[0].id;
        let law = mips().law;
        let value = match case {
            "removed" => None,
            _ => Some(Value::Uint(7)),
        };
        let rot1 = lab.rotate_with(Some(vec![mor_core::identity::Declaration { spec: law, kind: 0, value }]), &[0]);
        let b = lab.view().broken_act(&col).unwrap().unwrap_or_else(|| panic!("{case}: a broken act, with a way back"));
        assert_eq!((b.act, b.before), (rot1, f), "{case}");
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        assert!(matches!(lab.consent(&p), Consent::Broken { .. }), "{case}");
        let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
        let r = lab.propose(ANA, &same);
        let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
        roll_back(&mut lab, r, &rs, rot1, &[]);
        assert_eq!(lab.view().broken(&col).unwrap(), None, "{case}");
        assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, r, "{case}");
    }
}

/// RB3 (decided 9 October 2026, third round): the rollback may register a
/// declaration of absence made during the broken stretch under the clause
/// of the agreement in force just before the broken act, exactly as a
/// record does outside it: the vanished member then no longer blocks the
/// way back. Where the clause asks for several of the other members, the
/// rollback names their signature acts beside the declaration and places
/// them; an acknowledgement made during the stretch places nothing.
#[test]
fn rb3_a_rollback_registers_a_declaration_of_absence() {
    // A named authority.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &[ids[CY]]).unwrap().unwrap();
    assert_eq!((sorted(n.voices), n.needed), (sorted(vec![ids[ANA], ids[BEN]]), Some(2)));
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs = vec![lab.sign(ANA, &r), lab.sign(BEN, &r)];
    roll_back(&mut lab, r, &rs, rot1, &[d]);
    let v = lab.view();
    assert_eq!(v.broken(&col).unwrap(), None);
    let cur = v.current(&col).unwrap().unwrap();
    assert_eq!((cur.agreement, cur.departed), (r, vec![ids[CY]]));
    drop(v);

    // Two of the other members judge absence.
    let mut lab = Lab::new(&others_judge_absence);
    let f = lab.founding;
    let col = lab.c[0].id;
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let sb = lab.sign(BEN, &d);
    lab.acknowledge(0, sb);
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs = vec![lab.sign(ANA, &r), lab.sign(BEN, &r)];
    roll_back(&mut lab, r, &rs, rot1, &[d]);
    assert_eq!(lab.view().broken_act(&col).unwrap().map(|b| b.act), Some(rot1), "Ben's signature, acknowledged in the stretch, is not placed");
    // A signature act on something else is no registration.
    roll_back(&mut lab, r, &rs, rot1, &[d, rs[0]]);
    assert_eq!(lab.view().broken_act(&col).unwrap().map(|b| b.act), Some(rot1));
    roll_back(&mut lab, r, &rs, rot1, &[d, sb]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().departed, vec![lab.m[CY].id]);
}

/// RB1 (decided 8 and 9 October 2026): a broken collective is quarantined.
/// A grantee's act during the broken stretch counts for nothing, like the
/// collective's own; the grant works again after the rollback, which
/// restores every condition as at the act before the break. An act the
/// broken act's history holds was made before it, and stands; one racing
/// it, or after it, is of the stretch, placed only by citing the rollback
/// or a later decision. What was signed in the stretch is signed anew,
/// never adopted (RB2). A grant made during the stretch backs nothing.
#[test]
fn rb1_a_grant_is_quarantined_during_the_broken_stretch() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let env = mips().envelope;
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let grant = Grant {
        area: Some(1),
        kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
        ..plain_grant(agent.id, false)
    };
    let g = lab.grant(&grant);
    lab.sign(ANA, &g);
    sign(&mut lab.w, &mut agent, &g);
    let mut st = lab.strand(g, &key_of(agent.id));
    let act = |lab: &mut Lab, st: &mut Person| -> Hash {
        let a = lab.w.everyday_act(st, env, 0, vec![], None, None);
        lab.w.add(&a)
    };
    // Made before the break, and held by its history: the label's next act cites it.
    let early = act(&mut lab, &mut st);
    let seen = {
        let o = lab.chain(&[early]);
        let a = lab.w.everyday_act(&mut lab.c[0], env, 0, vec![], Some(o), None);
        lab.w.add(&a)
    };
    lab.sign(ANA, &seen);
    assert_eq!(lab.view().backing(&early).unwrap(), Backing::Backed { grant: g });
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some());
    // During the stretch: the grantee, citing only its grant, counts for nothing.
    let during = act(&mut lab, &mut st);
    assert!(matches!(lab.view().backing(&during).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("RB1")), "{:?}", lab.view().backing(&during).unwrap());
    assert!(!lab.counts(&during));
    assert_eq!(lab.view().backing(&early).unwrap(), Backing::Backed { grant: g }, "made before the break, it stands");
    // A grant made in the stretch counts for nothing, then and after.
    let mut other = lab.w.genesis("another agent", vec![own_home()], None, None);
    let (k2, p2) = grant_key("another agent");
    let g2 = lab.grant(&Grant { key: p2, ..plain_grant(other.id, false) });
    lab.sign(ANA, &g2);
    sign(&mut lab.w, &mut other, &g2);
    let mut st2 = lab.strand(g2, &k2);
    // The rollback restores the founding agreement.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    let back = roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    // After it, the grant works again for an act citing the rollback.
    st.cite.as_mut().unwrap().1.push(back);
    let after = act(&mut lab, &mut st);
    assert_eq!(lab.view().backing(&after).unwrap(), Backing::Backed { grant: g });
    st2.cite.as_mut().unwrap().1.push(back);
    let under_g2 = act(&mut lab, &mut st2);
    assert!(matches!(lab.view().backing(&under_g2).unwrap(), Backing::NotBacked { .. }));
    // The stretch's act stays void, even acknowledged after the rollback: signed anew, never adopted.
    lab.adopt(0, during);
    assert!(matches!(lab.view().backing(&during).unwrap(), Backing::NotBacked { .. }));
}

/// RB2's follow-up, narrowed by BQ2 and BQ3 (decided 9 October 2026): a
/// broken collective keeps exactly what its rules before the break
/// allowed, judged by the offer a payment names, never by when it was paid.
/// A sale under an offer made before the break is kept, even received in
/// the stretch; one under an offer of the stretch is no purchase and is
/// owed back, a payer's claim alone included (BQ3), unless the sale is
/// signed anew after the rollback: a receipt of the collective for the same
/// payment, never an acknowledgement adopting the stretch's.
#[test]
fn rb2_bq2_bq3_what_a_broken_collective_keeps_is_judged_by_the_offer_named() {
    use mor_core::finance::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt, RefundTo};
    let work = spec("a song");
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)]), owns(work)]);
    });
    let f = lab.founding;
    let label = lab.c[0].id;
    let rail = spec("a rail Module");
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let publication = {
        let a = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(work.to_vec()))], None, None);
        lab.w.add(&a)
    };
    lab.sign(ANA, &publication);
    let receipt = |lab: &mut Lab, fan: &str, proof: &[u8], line: Hash| {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(spec(fan))),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 10 },
            fulfils: publication,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: f, line }),
        });
        let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 2, r.to_map(), None, None);
        let x = lab.w.add(&a);
        lab.sign(BEN, &x);
        x
    };
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    // Under the offer made before the break, received in the stretch: kept.
    let kept = receipt(&mut lab, "Dee the fan", b"dee", f);
    let got = lab.view().purchase(&kept).unwrap().unwrap();
    assert!(!matches!(got.verdict, law::PurchaseVerdict::NoPurchase { .. }), "{got:?}");
    // Under the clone of the stretch: owed back.
    let paid = receipt(&mut lab, "Eve the fan", b"eve", k1);
    let got = lab.view().purchase(&paid).unwrap().unwrap();
    assert!(matches!(got.verdict, law::PurchaseVerdict::NoPurchase { ref why } if why.contains("RB2")), "{got:?}");
    assert_eq!(got.refund_to, RefundTo::Identity(spec("Eve the fan")));
    // BQ3: shown only by the payer's own claim, judged by the offer it names.
    let mut fan = lab.w.genesis("Fay the fan", vec![own_home()], None, None);
    let claim = |w: &mut World, fan: &mut Person, line: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim {
            rail,
            proof: proof.to_vec(),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 4 },
            fulfils: publication,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: f, line }),
        });
        let x = w.everyday_act(fan, mips().finance, 3, c.to_map(), None, None);
        w.add(&x)
    };
    let by_claim = claim(&mut lab.w, &mut fan, k1, b"fay");
    let before_claim = claim(&mut lab.w, &mut fan, f, b"fay2");
    let v = lab.view();
    assert!(matches!(v.purchase(&by_claim).unwrap().unwrap().verdict, law::PurchaseVerdict::NoPurchase { ref why } if why.contains("RB2")));
    assert!(!matches!(v.purchase(&before_claim).unwrap().unwrap().verdict, law::PurchaseVerdict::NoPurchase { .. }));
    let owed: Vec<Hash> = v.owed_back(&label).unwrap().iter().map(|o| o.payment).collect();
    assert_eq!(sorted(owed), sorted(vec![paid, by_claim]));
    drop(v);
    // The rollback; Eve's payment is still owed back.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&label).unwrap(), None);
    // Adopting the stretch's receipt by an acknowledgement does not sign the sale anew.
    lab.adopt(0, paid);
    assert!(lab.view().owed_back(&label).unwrap().iter().any(|o| o.payment == paid));
    // A receipt for the same payment, signed after the rollback: the sale, signed anew.
    receipt(&mut lab, "Eve the fan", b"eve", k1);
    assert!(lab.view().owed_back(&label).unwrap().iter().all(|o| o.payment != paid));
}

/// RB6 (decided 8 and 9 October 2026): a broken collective cannot fork or
/// close before it is fixed. A closing signed by every member during the
/// broken stretch, naming the agreement in force just before the broken
/// act, counts for nothing, then and after the rollback.
#[test]
fn rb6_a_broken_collective_cannot_close_before_the_rollback() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let (_, _, res_b, rot1) = break_by_lost_record(&mut lab);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let c = law::Closing { agreement: f, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let eo = ending_obj(&lab, f, c.collective);
    let x = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.complete, "a closing of a broken collective counts for nothing");
    assert_eq!(lab.view().closed_by(&label).unwrap(), None);
    // Rolled back: the stretch's closing still counts for nothing.
    let ids = lab.ids();
    let stay = vec![ids[ANA], ids[CY]];
    let auth = lab.authority.id;
    let r = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &move |t| {
        t.parties = stay.clone();
        let g = t.grammar.as_mut().unwrap();
        g.signing = Holding::Shares { threshold: 2, members: stay.clone() };
        g.safety = Holding::Shares { threshold: 2, members: stay.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        for a in t.areas.as_mut().unwrap() {
            a.holders.retain(|h| stay.contains(h));
        }
    });
    let k = lab.propose(ANA, &r);
    let ks = vec![lab.sign(ANA, &k), lab.sign(CY, &k)];
    roll_back(&mut lab, k, &ks, rot1, &[res_b]);
    assert_eq!(lab.view().broken(&label).unwrap(), None);
    assert!(!lab.view().closing(&x).unwrap().complete);
    assert_eq!(lab.view().closed_by(&label).unwrap(), None);
}

/// F186 (decided 9 October 2026): "the buyer should be protected from the
/// human errors". While a deal stands forked, a purchase following either
/// branch counts: on a push rail, both holders' receipts for a payment
/// naming branch B, signed after both signed branch A too, make a purchase
/// under B (before F186 the purchase was refunded as superseded).
#[test]
fn a_purchase_following_either_branch_counts() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana the singer", vec![own_home()], None, None);
    let mut ben = w.genesis("ben the drummer", vec![own_home()], None, None);
    let work = spec("their song");
    let both = sorted(vec![ana.id, ben.id]);
    let mut d = deal_terms(both[0], both[1]);
    d.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), 500_000), (Who::Id(both[1]), 500_000)] }]);
    let deal = law_act(&mut w, &mut ana, law::types::TERMS, d.to_map(), None);
    sign(&mut w, &mut ana, &deal);
    sign(&mut w, &mut ben, &deal);
    let publication = {
        let a = w.everyday_act(&mut ana, mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(work.to_vec()))], None, None);
        w.add(&a)
    };
    let mut branch = |w: &mut World, ana: &mut Person, ben: &mut Person, a: u64| {
        let mut k = d.clone();
        k.parent = Some(deal);
        k.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: both.clone() }]);
        k.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), a), (Who::Id(both[1]), 1_000_000 - a)] }]);
        let x = law_act(w, ana, law::types::TERMS, k.to_map(), obj(deal));
        sign(w, ana, &x);
        sign(w, ben, &x);
        x
    };
    let _a = branch(&mut w, &mut ana, &mut ben, 600_000);
    let b = branch(&mut w, &mut ana, &mut ben, 700_000);
    let push = spec("a push rail");
    let receipt = |w: &mut World, who: &mut Person| {
        let r = Fin::Receipt(Receipt {
            rail: push,
            proof: b"tx".to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: who.id,
            amount: Amount { unit: spec("a unit"), value: 5 },
            fulfils: publication,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: deal, line: b }),
        });
        let a = w.everyday_act(who, mips().finance, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let ra = receipt(&mut w, &mut ana);
    receipt(&mut w, &mut ben);
    let mut v = LawView::new(&w.v, mips());
    v.push_rails.insert(push);
    assert_eq!(v.version_in_force(&deal).unwrap(), deal, "forked: the reference");
    assert_eq!(v.purchase(&ra).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
}

/// F187 (3) and RB3, readings for clients: the resignations the parties
/// published, registered or not (during a broken stretch, from the
/// agreement in force just before the broken act), and the declarations
/// naming a party, which its client shows it.
#[test]
fn published_resignations_and_declarations_naming_a_party() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let (_, _, res_b, _) = break_by_lost_record(&mut lab);
    let mut cy = lab.m[CY].clone();
    let res_c = lab.resign_from(&mut cy, f, None);
    let v = lab.view();
    let got: Vec<(Hash, Hash)> = v.published_resignations(&col).unwrap().iter().map(|d| (d.act, d.party)).collect();
    assert_eq!(sorted(got.iter().map(|x| x.0).collect()), sorted(vec![res_b, res_c]));
    assert!(got.contains(&(res_c, ids[CY])));
    assert!(v.declarations_naming(&ids[ANA]).is_empty());
    drop(v);
    let d = lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let v = lab.view();
    let named = v.declarations_naming(&ids[ANA]);
    assert_eq!(named.len(), 1);
    assert_eq!((named[0].0, named[0].1, named[0].2.party), (d, lab.authority.id, ids[ANA]));
}

/// RB2 with BQ2: a payment naming an offer of the broken stretch, paid to
/// the collective itself, with no stake making it a seller, is owed back
/// too.
#[test]
fn rb2_a_payment_to_the_collective_itself_during_the_stretch_is_owed_back() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    let (k1, _, _, _) = break_by_lost_record(&mut lab);
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"gift".to_vec(),
        payer: Some(Payer::Identity(spec("a patron"))),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: f,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: k1 }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 2, r.to_map(), None, None);
    let x = lab.w.add(&a);
    let got = lab.view().purchase(&x).unwrap().unwrap();
    assert!(matches!(got.verdict, law::PurchaseVerdict::NoPurchase { ref why } if why.contains("RB2")), "{got:?}");
    let owed = lab.view().owed_back(&label).unwrap();
    assert_eq!((owed.len(), owed[0].still_broken, owed[0].amount.value), (1, true, 7));
}

// ---------------------------------------------------------------- F189 and F188 (9 October 2026)

/// Ben resigns, a record registers it, and a year later Ben comes back: a
/// constitutional clone naming Ben again, signed by all three, declared by
/// a rotation (B10). Returns (Ben's old resignation, the clone of the return).
fn ben_leaves_and_returns(lab: &mut Lab) -> (Hash, Hash) {
    let f = lab.founding;
    let mut ben = lab.m[BEN].clone();
    let res_b = lab.resign_from(&mut ben, f, None);
    lab.record(0, None, &[], vec![res_b], f);
    let back = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &|t| t.text = "Ben is back.".into());
    let back = lab.propose(ANA, &back);
    let sigs = vec![lab.sign(ANA, &back), lab.sign(BEN, &back), lab.sign(CY, &back)];
    lab.rotate(Some((back, sigs)), &[0]);
    (res_b, back)
}

/// F189 (1), decided 9 October 2026 (Fable's review, finding 1): a
/// resignation is spent once its signer comes back by signing a version
/// that names them (B10). A line registers only a resignation naming the
/// version of the member's latest return, or one descending from it: an
/// old resignation registered again, by a record or by a rollback, takes
/// nothing from a returned member.
#[test]
fn f189_1_an_old_resignation_cannot_take_a_returned_members_voice() {
    // By a record, drawn by the everyday key's holder alone.
    let mut lab = Lab::new(&|_| {});
    let col = lab.c[0].id;
    let ids = lab.ids();
    let all = sorted(ids.clone());
    let (res_b, back) = ben_leaves_and_returns(&mut lab);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, sorted(n.voices)), (back, all.clone()), "Ben counts again (B10)");
    lab.record(0, None, &[], vec![res_b], back);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!(sorted(n.voices), all, "the old resignation, registered again, takes nothing");
    assert!(
        lab.view().published_resignations(&col).unwrap().iter().all(|d| d.act != res_b),
        "a spent resignation is not shown as a resignation to come"
    );
    // A resignation Ben signs after the return counts.
    let mut ben = lab.m[BEN].clone();
    let again = lab.resign_from(&mut ben, back, None);
    lab.record(0, None, &[], vec![again], back);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!(sorted(n.voices), sorted(vec![ids[ANA], ids[CY]]));

    // By a rollback: Ana and Cy break the collective on purpose, then roll
    // back registering Ben's old resignation, signed by the two of them.
    let mut lab = Lab::new(&|_| {});
    let col = lab.c[0].id;
    let (res_b, back) = ben_leaves_and_returns(&mut lab);
    let k1 = lab.clone_terms(&back, vec![(Power::Clone, vec![ANA, CY])], &|t| t.text = "Broken on purpose.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(CY, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some());
    assert!(
        lab.view().rollback_registers(&col, &[res_b]).unwrap().is_err(),
        "the client is told before anything is signed"
    );
    let same = lab.clone_terms(&back, vec![(Power::Constitutional, vec![ANA, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs = vec![lab.sign(ANA, &r), lab.sign(CY, &r)];
    roll_back(&mut lab, r, &rs, rot1, &[res_b]);
    assert_eq!(
        lab.view().broken_act(&col).unwrap().map(|b| b.act),
        Some(rot1),
        "Ben's voice remains: the rollback needs Ben too"
    );
}

/// A deal between Ana and Ben, signed by both, for the F186 and F188 tests.
struct DealLab {
    w: World,
    ana: Person,
    ben: Person,
    t: Terms,
    d: Hash,
}

impl DealLab {
    fn new() -> DealLab {
        let mut w = World::new();
        let mut ana = w.genesis("ana", vec![own_home()], None, None);
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let t = deal_terms(ana.id, ben.id);
        let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        DealLab { w, ana, ben, t, d }
    }

    /// A version cloning `parent`, proposed by Ana; settling, it cites the
    /// version it settles beside its parent (F189, 6).
    fn propose(&mut self, parent: Hash, text: &str, settles: Option<Hash>) -> Hash {
        let mut c = self.t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        c.settles = settles.map(|x| vec![x]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![self.ana.id, self.ben.id]) }]);
        let mut o = vec![Object { chain: parent, predecessor: parent }];
        if let Some(s) = settles {
            o.push(Object { chain: s, predecessor: s });
        }
        law_act(&mut self.w, &mut self.ana, law::types::TERMS, c.to_map(), Some(o))
    }

    /// A version cloning `parent`, proposed by Ana, naming in field 26 the
    /// tips it settles (QF3), cited in `objects` in that order, then citing
    /// the acts in `cites` (QF1).
    fn propose_full(&mut self, parent: Hash, text: &str, settles: Vec<Hash>, cites: Vec<Hash>) -> Hash {
        let mut c = self.t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        let settles = sorted(settles);
        c.settles = (!settles.is_empty()).then(|| settles.clone());
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![self.ana.id, self.ben.id]) }]);
        let mut o = vec![Object { chain: parent, predecessor: parent }];
        o.extend(settles.iter().chain(&cites).map(|s| Object { chain: *s, predecessor: *s }));
        law_act(&mut self.w, &mut self.ana, law::types::TERMS, c.to_map(), Some(o))
    }

    /// A complete version of [`Self::propose_full`].
    fn version_full(&mut self, parent: Hash, text: &str, settles: Vec<Hash>, cites: Vec<Hash>) -> Hash {
        let k = self.propose_full(parent, text, settles, cites);
        sign(&mut self.w, &mut self.ana, &k);
        sign(&mut self.w, &mut self.ben, &k);
        k
    }

    fn tangled(&self) -> bool {
        self.in_force() == Ok(self.d) && view(&self.w).deal_fork(&self.d).unwrap().is_some_and(|f| f.tangled.is_some())
    }

    /// A complete version: proposed, signed by both.
    fn version(&mut self, parent: Hash, text: &str, settles: Option<Hash>) -> Hash {
        let k = self.propose(parent, text, settles);
        sign(&mut self.w, &mut self.ana, &k);
        sign(&mut self.w, &mut self.ben, &k);
        k
    }

    fn in_force(&self) -> Result<Hash, LawError> {
        view(&self.w).version_in_force(&self.d)
    }
}

/// F189 (2), decided 9 October 2026 (Fable's review, finding 2): a version
/// is checked to be complete and to belong to the deal before it is read
/// as settling a fork, so no draft or stranger's act makes a forked deal
/// unreadable.
#[test]
fn f189_2_no_draft_or_strangers_act_makes_a_forked_deal_unreadable() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let _b1 = l.version(d, "Branch B.", None);
    assert_eq!(l.in_force().unwrap(), d);
    // Ana alone signs a version of A naming in field 26 a hash nobody holds.
    let half = l.propose(a1, "Settles nothing anybody holds.", Some(spec("nothing held")));
    sign(&mut l.w, &mut l.ana, &half);
    assert_eq!(l.in_force().unwrap(), d, "a draft is nobody's version");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_some());
    // A stranger's terms, whose parent nobody holds, carrying field 26.
    let mut eve = l.w.genesis("eve", vec![own_home()], None, None);
    let mut e = deal_terms(eve.id, spec("someone"));
    e.parent = Some(spec("an unheld parent"));
    e.settles = Some(vec![spec("another unheld version")]);
    e.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![eve.id] }]);
    let o = vec![
        Object { chain: spec("an unheld parent"), predecessor: spec("an unheld parent") },
        Object { chain: spec("another unheld version"), predecessor: spec("another unheld version") },
    ];
    law_act(&mut l.w, &mut eve, law::types::TERMS, e.to_map(), Some(o));
    assert_eq!(l.in_force().unwrap(), d, "a stranger's act belongs to no version of this deal");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_some());
}

/// F189 (4), with F188's settling version naming the tip: settlement is
/// final. A settling version made after the settlement, which names the
/// settling version itself, is growth on the discarded branch and changes
/// nothing. A plain version on the discarded branch past the tip the
/// settling version named, citing nothing, reopens nothing either (F192,
/// decided 10 October 2026, replacing QF1, under which it tangled the deal).
#[test]
fn f189_4_what_grows_on_the_discarded_branch() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    // Settled again from the discarded branch, naming the settlement: after it.
    let late = l.version(b1, "Settled the other way, too late.", Some(s));
    assert_eq!(l.in_force().unwrap(), s, "made after the settlement, it settles nothing");
    let s2 = l.version(s, "Life goes on.", None);
    assert_eq!(l.in_force().unwrap(), s2);
    let _ = late;
    // A plain version on the discarded branch past the tip named, citing
    // nothing: the settlement could not see it, and it reopens nothing
    // (F192; `f192_…`).
    l.version(b1, "B grows, when?", None);
    assert_eq!(l.in_force().unwrap(), s2);
}

/// F189 (5), F188 (decided 9 October 2026, "Tips are what matter on the
/// forks"): a settling version names the tip of the branch it discards;
/// one naming an older version settles nothing. Under F192 (10 October
/// 2026) "older" is what the settlement can be shown to have seen: where
/// it holds the newer version in its history, it settles nothing; where it
/// does not, the newer version is a late version, and loses (the stated
/// cost: whoever signed it, and the settlement's signers could not see it).
#[test]
fn f189_5_a_settling_version_names_the_discarded_tip() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let b2 = l.version(b1, "B, a new price and a new payee.", None);
    let s = l.version_full(a1, "Settles B1, says Ana, citing B2.", vec![b1], vec![b2]);
    let got = l.in_force();
    assert!(got != Ok(s), "holding the newer version, naming an older one, it is never reported settled: {got:?}");
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    l.version(b1, "B, a new price and a new payee.", None);
    let s = l.version(a1, "Settles B1, as Ana and Ben saw B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s, "the newer version, not seen, loses (F192)");
}

/// F189 (6), decided 9 October 2026 (Fable's review, finding 7): a settling
/// version also cites the version it settles in `objects`, beside its
/// parent, so that verifiers fetching by citation find it. One that does
/// not is invalid.
#[test]
fn f189_6_a_settling_version_cites_the_version_it_settles() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let mut c = l.t.clone();
    c.parent = Some(a1);
    c.text = "Settled, citing only its parent.".into();
    c.settles = Some(vec![b1]);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    let k = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(a1));
    sign(&mut l.w, &mut l.ana, &k);
    sign(&mut l.w, &mut l.ben, &k);
    assert!(view(&l.w).terms(&k).is_err(), "it does not cite the version it settles");
    assert_eq!(l.in_force().unwrap(), d);
    let s = l.version(a1, "Settled, citing both.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
}

/// F188, DQ1 to DQ4 (decided 9 October 2026, "Yes"): when a deal's fork
/// turns tangled (three complete versions of one version, a branch that
/// splits again, two competing settling versions, a settling version that
/// splits its own branch again), the deal stays on its last agreed
/// version, the reference, until one clean settlement; the parties lose
/// the changes the tangled versions made.
#[test]
fn f188_dq1_to_dq4_a_tangled_fork_stays_on_the_reference() {
    let tangled = |l: &DealLab| {
        assert_eq!(l.in_force().unwrap(), l.d, "the reference");
        let f = view(&l.w).deal_fork(&l.d).unwrap().expect("shown forked");
        assert!(f.tangled.is_some(), "and tangled");
    };
    // DQ2: three complete versions of one version.
    let mut l = DealLab::new();
    let d = l.d;
    for x in ["One.", "Two.", "Three."] {
        l.version(d, x, None);
    }
    tangled(&l);
    // DQ1: a branch that splits again before the settlement.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    l.version(d, "B.", None);
    l.version(a1, "A, one way.", None);
    l.version(a1, "A, the other way.", None);
    tangled(&l);
    // DQ3: two settling versions, one on each branch, each naming the other's tip.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    l.version(a1, "Settled for A.", Some(b1));
    l.version(b1, "Settled for B.", Some(a1));
    tangled(&l);
    // DQ4: a settling version made from below its branch's latest
    // version, which it holds (F192: what it could see): it settles
    // nothing, and its branch splits again.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let a2 = l.version(a1, "A grows.", None);
    l.version_full(a1, "Settled from below, having seen A grow.", vec![b1], vec![a2]);
    tangled(&l);
    // Not holding it, it could not see it: A's later version loses (F192).
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    l.version(a1, "A grows.", None);
    let s = l.version(a1, "Settled from below.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
}

/// F188, DQ1 to DQ4: any buyer who paid under a version every party signed
/// stays protected, as for a simple fork (A4).
#[test]
fn f188_a_buyer_under_a_tangled_version_stays_protected() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut l = DealLab::new();
    let work = spec("their song");
    let (a, b) = (l.ana.id, l.ben.id);
    let both = sorted(vec![a, b]);
    l.t.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), 500_000), (Who::Id(both[1]), 500_000)] }]);
    let mut t = l.t.clone();
    let d = law_act(&mut l.w, &mut l.ana, law::types::TERMS, t.to_map(), None);
    sign(&mut l.w, &mut l.ana, &d);
    sign(&mut l.w, &mut l.ben, &d);
    l.d = d;
    let publication = {
        let x = l.w.everyday_act(&mut l.ana, mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(work.to_vec()))], None, None);
        l.w.add(&x)
    };
    let mut tangled = vec![];
    for (x, share) in [("One.", 600_000), ("Two.", 700_000), ("Three.", 800_000)] {
        t.stakes = Some(vec![law::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), share), (Who::Id(both[1]), 1_000_000 - share)] }]);
        l.t = t.clone();
        tangled.push(l.version(d, x, None));
    }
    let push = spec("a push rail");
    let mut receipt = |l: &mut DealLab, who: usize| {
        let p = if who == 0 { &mut l.ana } else { &mut l.ben };
        let r = Fin::Receipt(Receipt {
            rail: push,
            proof: b"tx".to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: p.id,
            amount: Amount { unit: spec("a unit"), value: 5 },
            fulfils: publication,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: d, line: tangled[1] }),
        });
        let x = l.w.everyday_act(p, mips().finance, 2, r.to_map(), None, None);
        l.w.add(&x)
    };
    let ra = receipt(&mut l, 0);
    receipt(&mut l, 1);
    let mut v = LawView::new(&l.w.v, mips());
    v.push_rails.insert(push);
    assert_eq!(v.version_in_force(&d).unwrap(), d, "tangled: the reference");
    assert_eq!(v.purchase(&ra).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
}

/// F188, DQ5 (decided 9 October 2026, "Yes, Carla needs to sign either
/// way"): a version that settles a deal's fork must be signed by the
/// parties of both branches, so no one on the discarded side is dropped
/// without consent.
#[test]
fn f188_dq5_the_parties_of_both_branches_sign_the_settlement() {
    let mut l = DealLab::new();
    let d = l.d;
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let a1 = l.version(d, "A.", None);
    // Branch B adds Carla, who signs it.
    let mut c = l.t.clone();
    c.parent = Some(d);
    c.text = "B, with Carla.".into();
    c.parties = vec![l.ana.id, l.ben.id, carla.id];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    let b1 = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(d));
    sign(&mut l.w, &mut l.ana, &b1);
    sign(&mut l.w, &mut l.ben, &b1);
    sign(&mut l.w, &mut carla, &b1);
    assert_eq!(l.in_force().unwrap(), d, "forked");
    let s = l.version(a1, "Settled for A, without Carla.", Some(b1));
    assert_eq!(l.in_force().unwrap(), d, "Carla has not signed the version that drops her branch");
    sign(&mut l.w, &mut carla, &s);
    assert_eq!(l.in_force().unwrap(), s);
}

/// F189 (3), decided 9 October 2026 (Fable's review, finding 3): a payment
/// naming a version the seller does not hold raises the alarm: an unknown
/// version is the hidden fork the alarm exists for. And F188, DQ7: a
/// payment naming an older version of the same line, with no fork, raises
/// a plain notice; the alarm is kept for forks.
#[test]
fn f189_3_a_payment_naming_a_version_the_seller_does_not_hold_raises_the_alarm() {
    use mor_core::finance::{Amount, Claim, Payload as Fin, Purchase};
    let mut l = DealLab::new();
    let d = l.d;
    let mut fan = l.w.genesis("a fan", vec![own_home()], None, None);
    let a = l.version(d, "3A: the price is 100.", None);
    let ana = l.ana.id;
    let pay = |w: &mut World, fan: &mut Person, line: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee: ana,
            amount: Amount { unit: spec("a unit"), value: 120 },
            fulfils: spec("a publication"),
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: d, line }),
        });
        let x = w.everyday_act(fan, mips().finance, 3, c.to_map(), None, None);
        w.add(&x)
    };
    // 3B, signed by both from Ben's device, never reached Ana's relays.
    let hidden = spec("3B, held nowhere Ana looks");
    let under_hidden = pay(&mut l.w, &mut fan, hidden, b"b");
    let alarm = view(&l.w).fork_alarm(&under_hidden, &a).unwrap().expect("an unknown version: the alarm");
    assert_eq!((alarm.named, alarm.held, alarm.kind), (hidden, a, law::AlarmKind::Unheld));
    let under_d = pay(&mut l.w, &mut fan, d, b"d");
    let notice = view(&l.w).fork_alarm(&under_d, &a).unwrap().expect("an older version: a notice");
    assert_eq!(notice.kind, law::AlarmKind::Older);
    assert!(!notice.kind.is_alarm(), "the alarm is kept for forks");
    let b = l.version(d, "3B: the price is 120.", None);
    let under_b = pay(&mut l.w, &mut fan, b, b"bb");
    let alarm = view(&l.w).fork_alarm(&under_b, &a).unwrap().unwrap();
    assert_eq!(alarm.kind, law::AlarmKind::Fork);
    assert!(alarm.kind.is_alarm());
}

/// F189 (7), decided 9 October 2026 ("It's an emergency situation with
/// emergency rules"): while a collective is broken, no fork or closing
/// counts, whatever line it names, the last good link before the broken
/// act included (Fable's review, finding 5).
#[test]
fn f189_7_no_closing_counts_while_broken_whatever_its_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.c[0].id;
    // The last good link, and the collective's tips there.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let (good, tips) = (lab.c[0].binding, vec![tip(&lab.c[0])]);
    break_by_lost_record(&mut lab);
    assert!(lab.view().broken(&label).unwrap().is_some());
    let c = law::Closing { agreement: f, collective: label, chain_act: good, tips, open: vec![] };
    let eo = ending_obj(&lab, f, label);
    let x = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let v = lab.view();
    let e = v.closing(&x).unwrap();
    assert!(!e.complete, "a closing on the line before the broken act counts for nothing while broken: {:?}", e.why);
    assert_eq!(v.closed_by(&label).unwrap(), None);
}

/// F189 (7): money owed back from the broken stretch counts as a debt for
/// a closing's "owes nothing", so a collective cannot close until those
/// payers are settled.
#[test]
fn f189_7_money_owed_back_from_the_stretch_is_a_debt_before_closing() {
    use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    let (k1, _, _, rot1) = break_by_lost_record(&mut lab);
    let f = lab.founding;
    // A patron pays under the clone of the broken stretch: owed back (BQ2).
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"gift".to_vec(),
        payer: Some(Payer::Identity(spec("a patron"))),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: k1 }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 2, r.to_map(), None, None);
    lab.w.add(&a);
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1);
    // The rollback; then every member closes.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&label).unwrap(), None);
    let c = law::Closing { agreement: r, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let eo = ending_obj(&lab, r, label);
    let x = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.complete, "the patron is still owed: {:?}", e.why);
    assert!(e.why.iter().any(|w| w.contains("owed back")), "{:?}", e.why);
}

/// F189 (8), decided 9 October 2026, in essence: a declaration of absence
/// counts only if it is public, or addressed (sealed) to the member it
/// names, among others if wished; one that is neither counts for nothing,
/// so no line or rollback can register it.
#[test]
fn f189_8_a_declaration_counts_only_if_public_or_addressed_to_the_member() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let d = AbsenceDeclaration { agreement: f, clause: f, party: ids[CY], outcomes: vec![outcomes::VOICE_REMOVED] };
    // Sealed to Ana and Ben only.
    let mut a = lab.authority.clone();
    let hidden = lab.w.private_act(&mut a, mips().law, law::types::DECLARATION, d.to_map(), obj(f), vec![ids[ANA], ids[BEN]]);
    lab.authority = a;
    assert!(lab.view().declaration(&hidden).unwrap().is_err(), "kept from the member it names, it counts for nothing");
    lab.record(0, None, &[], vec![hidden], f);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(n.voices.contains(&ids[CY]), "no line registers it");
    // Sealed to Cy too: it counts.
    let mut a = lab.authority.clone();
    let shown = lab.w.private_act(&mut a, mips().law, law::types::DECLARATION, d.to_map(), obj(f), vec![ids[ANA], ids[CY]]);
    lab.authority = a;
    assert!(lab.view().declaration(&shown).unwrap().is_ok());
    lab.record(0, None, &[], vec![shown], f);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&ids[CY]));
}

/// F188, BQ1 (decided 9 October 2026, "Yes, everyone have to acknowledge
/// the rollback. Safer."): after a rollback, a grantee's act counts only
/// once it cites the rollback or a later decision of the collective; one
/// citing nothing newer than the time before the break, including one made
/// just before the break that no act of the collective took in, counts for
/// nothing and is signed again.
#[test]
fn bq1_after_a_rollback_a_grantees_act_counts_once_it_cites_the_rollback() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let env = mips().envelope;
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let grant = Grant { area: Some(1), kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]), ..plain_grant(agent.id, false) };
    let g = lab.grant(&grant);
    lab.sign(ANA, &g);
    sign(&mut lab.w, &mut agent, &g);
    let mut st = lab.strand(g, &key_of(agent.id));
    let act = |lab: &mut Lab, st: &mut Person| -> Hash {
        let a = lab.w.everyday_act(st, env, 0, vec![], None, None);
        lab.w.add(&a)
    };
    // Made just before the break; no act of the collective takes it in.
    let unseen = act(&mut lab, &mut st);
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    let back = roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert!(matches!(lab.view().backing(&unseen).unwrap(), Backing::NotBacked { .. }), "made just before the break, taken in by nothing");
    // After the rollback, citing nothing newer: nothing.
    let stale = act(&mut lab, &mut st);
    assert!(matches!(lab.view().backing(&stale).unwrap(), Backing::NotBacked { .. }));
    // Citing the rollback: it counts.
    st.cite.as_mut().unwrap().1.push(back);
    let fresh = act(&mut lab, &mut st);
    assert_eq!(lab.view().backing(&fresh).unwrap(), Backing::Backed { grant: g });
}

/// F188, BQ4 (decided 9 October 2026): the contest act's format (Law type
/// 14). It names the declaration it answers and is signed by the party
/// declared absent, which shows presence; it shows the dispute and voids
/// nothing (rule 52).
#[test]
fn bq4_a_contest_names_the_declaration_and_is_signed_by_the_party_named() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let ids = lab.ids();
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], f);
    let c = law::Contest { declaration: d };
    let mut cy = lab.m[CY].clone();
    let x = law_act(&mut lab.w, &mut cy, law::types::CONTEST, c.to_map(), obj(d));
    // Someone else's "contest" of it shows nothing.
    let mut ben = lab.m[BEN].clone();
    let y = law_act(&mut lab.w, &mut ben, law::types::CONTEST, c.to_map(), obj(d));
    let v = lab.view();
    assert_eq!(v.contests(&d).unwrap(), vec![x]);
    let _ = y;
    // It voids nothing: Cy's voice stays removed.
    let n = v.next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&ids[CY]));
    // Its objects name the declaration, as chain and predecessor.
    let mut cy2 = lab.m[CY].clone();
    drop(v);
    let bad = law_act(&mut lab.w, &mut cy2, law::types::CONTEST, c.to_map(), obj(f));
    assert!(!lab.view().contests(&d).unwrap().contains(&bad));
}

/// F188, DQ8 (decided 9 October 2026): where the parties cannot agree, the
/// arbitrator the deal's reference version names may settle the fork,
/// only once activated by one of the signing parties, by a signed request
/// naming the fork, which its settlement names: never on its own
/// initiative. With no arbitrator named, the deal stays on its reference.
#[test]
fn f188_dq8_the_arbitrator_settles_a_fork_only_on_a_partys_request() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut arb = w.genesis("an arbitrator", vec![own_home()], None, None);
    let mut eve = w.genesis("eve", vec![own_home()], None, None);
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(vec![arb.id]);
    t.fork_judge = Some(arb.id);
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let mut l = DealLab { w, ana, ben, t, d };
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let settle = |w: &mut World, arb: &mut Person, request: Hash| {
        let s = law::ForkSettlement { request, kept: a1, discarded: vec![b1] };
        law_act(w, arb, law::types::FORK_SETTLEMENT, s.to_map(), obj(request))
    };
    let ask = |w: &mut World, who: &mut Person| {
        let r = law::SettlementRequest { reference: d };
        law_act(w, who, law::types::SETTLEMENT_REQUEST, r.to_map(), obj(d))
    };
    // Never on its own initiative: a settlement naming a request nobody made.
    settle(&mut l.w, &mut arb, spec("no request"));
    assert_eq!(l.in_force().unwrap(), d);
    // A request by someone who signed nothing activates nothing.
    let by_eve = ask(&mut l.w, &mut eve);
    settle(&mut l.w, &mut arb, by_eve);
    assert_eq!(l.in_force().unwrap(), d);
    // Ben asks; the arbitrator keeps A.
    let by_ben = ask(&mut l.w, &mut l.ben);
    let s = settle(&mut l.w, &mut arb, by_ben);
    assert_eq!(l.in_force().unwrap(), a1, "settled by the arbitrator, on Ben's request");
    // Only the arbitrator the reference names settles.
    let mut l2 = DealLab::new();
    let d2 = l2.d;
    l2.version(d2, "A.", None);
    l2.version(d2, "B.", None);
    let _ = s;
    let req = {
        let r = law::SettlementRequest { reference: d2 };
        law_act(&mut l2.w, &mut l2.ana, law::types::SETTLEMENT_REQUEST, r.to_map(), obj(d2))
    };
    let mut other = l2.w.genesis("not the arbitrator", vec![own_home()], None, None);
    let kids = view(&l2.w).deal_fork(&d2).unwrap().unwrap().branches;
    let s2 = law::ForkSettlement { request: req, kept: kids[0][0], discarded: vec![kids[1][0]] };
    law_act(&mut l2.w, &mut other, law::types::FORK_SETTLEMENT, s2.to_map(), obj(req));
    assert_eq!(l2.in_force().unwrap(), d2);
}

/// F188, DQ6 (decided 9 October 2026, "Yes"): while a deal is forked, the
/// turns for leftover units stay per branch, and a single numbering runs
/// across every split the service makes, on any branch, each split showing
/// its number; a holder's client raises the alarm where the numbers on the
/// splits it receives skip: splits are then being made where it is not
/// shown.
#[test]
fn f188_dq6_one_numbering_across_a_deals_splits_shows_a_hidden_branch() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let mut svc = l.w.genesis("a split service", vec![own_home()], None, None);
    let svc_id = svc.id;
    let ana = l.ana.id;
    let mut split = |l: &mut DealLab, agreement: Hash, number: Option<u64>| {
        let s = law::Split {
            receipt: spec(&format!("a receipt {number:?} {agreement:?}")),
            payouts: vec![law::Payout { receiver: ana, amount: 1, stake: Some(0), role: None, evidence: None, fee_module: None, rail_fee: None }],
            cmip: spec("a split cMIP"),
            agreement,
            tally: None,
            number,
        };
        law_act(&mut l.w, &mut svc, law::types::SPLIT, s.to_map(), None)
    };
    split(&mut l, a1, Some(1));
    split(&mut l, a1, Some(2));
    // Number 3, under branch B, never reaches the holder who sees A only.
    split(&mut l, a1, Some(4));
    let n = view(&l.w).split_numbers(&svc_id, &a1).unwrap();
    assert_eq!(n.gaps, vec![3], "the alarm: a split numbered 3 was made where this holder is not shown");
    // Delivered after all, under B: one numbering across both branches.
    split(&mut l, b1, Some(3));
    let n = view(&l.w).split_numbers(&svc_id, &d).unwrap();
    assert!(n.gaps.is_empty());
    assert_eq!(n.numbers.iter().map(|x| x.0).collect::<Vec<_>>(), vec![1, 2, 3, 4]);
    split(&mut l, a1, Some(4));
    split(&mut l, b1, None);
    let n = view(&l.w).split_numbers(&svc_id, &d).unwrap();
    assert_eq!((n.repeated, n.unnumbered.len()), (vec![4], 1));
    // A number counts from 1.
    let mut s = law::Split { receipt: spec("r"), payouts: vec![], cmip: spec("c"), agreement: d, tally: None, number: Some(0) };
    s.payouts.push(law::Payout { receiver: ana, amount: 1, stake: Some(0), role: None, evidence: None, fee_module: None, rail_fee: None });
    assert!(law::Split::decode(&s.to_map()).is_err());
}

/// QF1 (F190), replaced by F192 (decided 10 October 2026, "Yes agreed"): a
/// complete version on a discarded branch, beyond the tip the settlement
/// named and not citing the settlement, reopens nothing (under QF1 it made
/// the deal tangled). A version that cites the settlement is plainly after
/// it and changes nothing, and so is every version after that one.
#[test]
fn f192_replaces_qf1_a_version_beyond_the_settled_tip() {
    // Not citing the settlement: the settlement could not see it.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    l.version(b1, "B grows, when?", None);
    assert_eq!(l.in_force().unwrap(), s, "beyond the tip named, citing nothing: it reopens nothing (F192)");

    // Citing the settlement: plainly after it, nothing changes.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    let b2 = l.version_full(b1, "B grows, after the settlement.", vec![], vec![s]);
    assert_eq!(l.in_force().unwrap(), s, "a version citing the settlement changes nothing");
    l.version(b2, "B grows again, after that one.", None);
    assert_eq!(l.in_force().unwrap(), s, "nor does a version after one citing it");
    // A settling version naming the settlement cites it, as F189 (6) asks.
    l.version(b1, "Settled the other way, too late.", Some(s));
    assert_eq!(l.in_force().unwrap(), s, "settlement is final (A3)");
    let s2 = l.version(s, "Life goes on.", None);
    assert_eq!(l.in_force().unwrap(), s2);
}

/// QF3, decided by Nobody, allegedly, 9 October 2026 ("Yes, expand to
/// multiple tips as needed"; F190): a settling version names every tip it
/// discards (field 26, a list), and is signed by the parties of all the
/// branches involved, so a tangled deal settles cleanly: everyone sees
/// every option, everyone signs the choice.
#[test]
fn f190_qf3_a_tangled_deal_settles_cleanly() {
    // DQ2: three complete versions of one version.
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    assert!(l.tangled());
    // F192: a settlement naming one of the two other tips, not holding the
    // third, settles what it saw; Three, which it could not see, loses.
    let partial = l.version_full(x, "Settles Two only.", vec![y], vec![]);
    assert_eq!(l.in_force().unwrap(), partial);
    let s = l.version_full(partial, "One, having seen Two and Three.", vec![z], vec![]);
    assert_eq!(l.in_force().unwrap(), s, "a version on the line in force");
    // Holding the third and not naming it, it settles nothing.
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    l.version_full(x, "Settles Two only, citing Three.", vec![y], vec![z]);
    assert!(l.tangled(), "it saw Three and dropped it unnamed");
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    let s = l.version_full(x, "One, having seen Two and Three.", vec![y, z], vec![]);
    assert_eq!(l.in_force().unwrap(), s, "every tip named: settled");

    // DQ1: a branch that splits again.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let a2 = l.version(a1, "A, one way.", None);
    let a3 = l.version(a1, "A, the other way.", None);
    assert!(l.tangled());
    let s = l.version_full(a2, "A one way, having seen the rest.", vec![a3, b1], vec![]);
    assert_eq!(l.in_force().unwrap(), s);

    // DQ3: two settlements, each naming the other's tip; a third names them.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s1 = l.version(a1, "Settled for A.", Some(b1));
    let s2 = l.version(b1, "Settled for B.", Some(a1));
    assert!(l.tangled());
    let s3 = l.version_full(s1, "For A, having seen both settlements.", vec![s2], vec![]);
    assert_eq!(l.in_force().unwrap(), s3);

    // DQ4: a settling version made from below its branch's latest
    // version, holding it: it settles nothing, and A splits again (DQ1); a
    // settlement naming every tip settles it.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let a2 = l.version(a1, "A grows.", None);
    let s0 = l.version_full(a1, "Settled from below, having seen A grow.", vec![b1], vec![a2]);
    assert!(l.tangled());
    let s = l.version_full(a2, "A grown, having seen it all.", vec![b1, s0], vec![]);
    assert_eq!(l.in_force().unwrap(), s);

    // What QF1 tangled no longer tangles (F192): B grows unaware, and
    // nothing reopens; a later version on the line in force may name it.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A.", Some(b1));
    let b2 = l.version(b1, "B grows, unaware.", None);
    assert_eq!(l.in_force().unwrap(), s);
    let s4 = l.version_full(s, "Still A, having seen B grow.", vec![b2], vec![]);
    assert_eq!(l.in_force().unwrap(), s4);

    // Field 26 is ascending, none twice.
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    let mut both = sorted(vec![y, z]);
    both.reverse();
    let mut c = l.t.clone();
    c.parent = Some(x);
    c.settles = Some(both.clone());
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    assert!(c.check(&mips()).is_err(), "descending tips are refused");
    c.settles = Some(vec![y, y]);
    assert!(c.check(&mips()).is_err(), "a tip twice is refused");
}

/// QF3 with DQ5: the parties of every tip discarded sign the settlement.
#[test]
fn f190_qf3_the_parties_of_every_branch_sign() {
    let mut l = DealLab::new();
    let d = l.d;
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let mut c = l.t.clone();
    c.parent = Some(d);
    c.text = "Three, with Carla.".into();
    c.parties = vec![l.ana.id, l.ben.id, carla.id];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    let z = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(d));
    sign(&mut l.w, &mut l.ana, &z);
    sign(&mut l.w, &mut l.ben, &z);
    sign(&mut l.w, &mut carla, &z);
    assert!(l.tangled());
    let s = l.version_full(x, "One, without Carla's word.", vec![y, z], vec![]);
    assert!(l.tangled(), "Carla has not signed the version that drops her branch");
    sign(&mut l.w, &mut carla, &s);
    assert_eq!(l.in_force().unwrap(), s);
}

/// QF2, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): the
/// deal's reference version names which of its judges settles forks (terms
/// field 27, one identity of field 13); where that is unclear, none does,
/// and the deal waits on its reference. With QF3, the judge's settlement
/// names every tip it discards.
#[test]
fn f190_qf2_the_reference_names_the_judge_of_forks() {
    let lab = |judge: bool, arbitrators: usize| {
        let mut w = World::new();
        let mut ana = w.genesis("ana", vec![own_home()], None, None);
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let arbs: Vec<Person> = (0..arbitrators).map(|i| w.genesis(&format!("arbitrator {i}"), vec![own_home()], None, None)).collect();
        let mut t = deal_terms(ana.id, ben.id);
        t.arbitrators = Some(arbs.iter().map(|a| a.id).collect());
        if judge {
            t.fork_judge = arbs.last().map(|a| a.id);
        }
        let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        (DealLab { w, ana, ben, t, d }, arbs)
    };
    let ask = |l: &mut DealLab| {
        let r = law::SettlementRequest { reference: l.d };
        law_act(&mut l.w, &mut l.ben, law::types::SETTLEMENT_REQUEST, r.to_map(), obj(l.d))
    };
    let settle = |l: &mut DealLab, arb: &mut Person, request: Hash, kept: Hash, discarded: Vec<Hash>| {
        let s = law::ForkSettlement { request, kept, discarded: sorted(discarded) };
        law_act(&mut l.w, arb, law::types::FORK_SETTLEMENT, s.to_map(), obj(request))
    };
    // One arbitrator, but the reference does not say it judges forks: none does.
    let (mut l, mut arbs) = lab(false, 1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, a1, vec![b1]);
    assert_eq!(l.in_force().unwrap(), d, "unclear which judge settles forks: none does (QF2)");
    // Two arbitrators; the reference names the second as the judge of forks.
    let (mut l, mut arbs) = lab(true, 2);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, a1, vec![b1]);
    assert_eq!(l.in_force().unwrap(), d, "the other arbitrator settles nothing");
    let (first, second) = arbs.split_at_mut(1);
    let _ = first;
    settle(&mut l, &mut second[0], r, a1, vec![b1]);
    assert_eq!(l.in_force().unwrap(), a1, "the judge of forks the reference names settles");
    // A tangled deal: the judge names every tip it discards (QF3).
    let (mut l, mut arbs) = lab(true, 1);
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, x, vec![y, z]);
    assert_eq!(l.in_force().unwrap(), x, "every tip named");
    // F192: a judge's settlement naming one of two other tips settles what
    // it saw; the third, which it did not see, loses.
    let (mut l, mut arbs) = lab(true, 1);
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    l.version(d, "Three.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, x, vec![y]);
    assert_eq!(l.in_force().unwrap(), x, "Three, not seen, reopens nothing (F192)");
    // Field 27 names one of field 13, in a deal only.
    let mut t = deal_terms(spec("p"), spec("q"));
    t.arbitrators = Some(vec![spec("an arbitrator")]);
    t.fork_judge = Some(spec("someone else"));
    assert!(t.check(&mips()).is_err(), "the judge of forks is one of the deal's arbitrators or verifiers");
    t.fork_judge = Some(spec("an arbitrator"));
    assert!(t.check(&mips()).is_ok());
    let c = label_terms(&[spec("p"), spec("q"), spec("r")], spec("an authority"), spec("a keeper"), &|t| {
        t.arbitrators = Some(vec![spec("an arbitrator")]);
        t.fork_judge = Some(spec("an arbitrator"));
    });
    assert!(c.check(&mips()).is_err(), "a collective's forks are settled by its records");
}

/// QF4, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): a
/// deal's split with no number, or with a number another split of the
/// same service under the deal carries, is a deviation that breaks the
/// plan, as a reset of the tally chain does (F171). A gap is the holder's
/// alarm, not a deviation: the missing split may simply not have reached
/// this holder. A collective's splits are not numbered (DQ6 is a deal's).
#[test]
fn f190_qf4_a_missing_or_repeated_number_breaks_the_plan() {
    let mut l = DealLab::new();
    let d = l.d;
    let mut svc = l.w.genesis("a split service", vec![own_home()], None, None);
    let ana = l.ana.id;
    let mut split = |l: &mut DealLab, number: Option<u64>, tag: &str| {
        let s = law::Split {
            receipt: spec(&format!("a receipt {tag}")),
            payouts: vec![law::Payout { receiver: ana, amount: 1, stake: Some(0), role: None, evidence: None, fee_module: None, rail_fee: None }],
            cmip: spec("a split cMIP"),
            agreement: d,
            tally: None,
            number,
        };
        law_act(&mut l.w, &mut svc, law::types::SPLIT, s.to_map(), None)
    };
    let one = split(&mut l, Some(1), "one");
    let three = split(&mut l, Some(3), "three");
    let v = view(&l.w);
    assert_eq!(v.split(&one).unwrap().numbering, None);
    assert_eq!(v.split(&three).unwrap().numbering, None, "a gap is the alarm, not a deviation");
    let none = split(&mut l, None, "none");
    let again = split(&mut l, Some(3), "three again");
    let v = view(&l.w);
    assert_eq!(v.split(&none).unwrap().numbering, Some(law::NumberBreak::Unnumbered));
    assert_eq!(v.split(&again).unwrap().numbering, Some(law::NumberBreak::Repeated { number: 3, with: vec![three] }));
    assert_eq!(
        v.split(&three).unwrap().numbering,
        Some(law::NumberBreak::Repeated { number: 3, with: vec![again] }),
        "shown on every split involved"
    );
}

/// QF5, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): money
/// owed back is repaid like any debt, by a payment naming what it repays,
/// proven by either side's record (double entry): the payer's receipt, or
/// the collective's claim. No new act. Repaid in full, it no longer blocks
/// a closing (F189, 7).
#[test]
fn f190_qf5_money_owed_back_is_repaid_by_a_payment_naming_it() {
    use mor_core::finance::{Amount, PaidAt, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.c[0].id;
    let mut patron = lab.w.genesis("a patron", vec![own_home()], None, None);
    let (k1, _, _, rot1) = break_by_lost_record(&mut lab);
    let f = lab.founding;
    let unit = spec("a unit");
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"gift".to_vec(),
        payer: Some(Payer::Identity(patron.id)),
        payee: label,
        amount: Amount { unit, value: 7 },
        fulfils: k1,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: k1 }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 2, r.to_map(), None, None);
    let owed = lab.w.add(&a);
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1);
    let node = pointer_of(&mut lab.w, &mut patron, 1, None, &[b"the patron's node"]);
    let pid = patron.id;
    // Paid back to the patron, but the rail's proof was never checked: nothing.
    let mut payer = lab.c[0].clone();
    payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"unchecked");
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "a payment its rail does not show repays nothing");
    // Three of seven, by the patron's own receipt naming the payment owed back.
    let part = payment(&mut lab, &mut patron, false, pid, owed, unit, 3, b"refund, part one");
    lab.rail_valid.push((part, PaidAt::Flow(node)));
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "three of seven: still owed");
    // The rest, by the collective's own claim, paid to the patron's pointer.
    let rest = payment(&mut lab, &mut payer, true, pid, owed, unit, 4, b"refund, part two");
    lab.rail_valid.push((rest, PaidAt::Flow(node)));
    lab.c[0] = payer;
    assert!(lab.view().owed_back(&label).unwrap().is_empty(), "repaid in full, by either side's record");
    // The rollback; then every member closes: nothing is owed back.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    let c = law::Closing { agreement: r, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open: vec![] };
    let eo = ending_obj(&lab, r, label);
    let x = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.why.iter().any(|w| w.contains("owed back")), "{:?}", e.why);
}

/// QF6, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): an old
/// stepping down is spent once the member holds the area again, as a
/// resignation is once its signer comes back (F189, 1). Registered again,
/// by a record, it takes nothing; a stepping down signed after the return
/// counts.
#[test]
fn f190_qf6_an_old_stepping_down_is_spent_once_the_member_holds_the_area_again() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    // Ana steps down from Releases (area 1); the label registers it.
    let mut ana = lab.m[ANA].clone();
    let old = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    lab.record(0, None, &[], vec![old], f);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(!lab.counts(&p), "Releases is frozen");
    // A constitutional clone gives Releases back to Ana, who signs it.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].holders = vec![ids[ANA]];
        t.text = "Ana runs the releases again.".into();
    });
    let back = lab.propose(BEN, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &back)).collect();
    lab.rotate(Some((back, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "Ana holds Releases again");
    // Her old stepping down, registered again: spent, it takes nothing.
    lab.record(0, None, &[], vec![old], back);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "the old stepping down is spent (QF6): {:?}", lab.consent(&p));
    // One she signs after the return counts.
    let mut ana = lab.m[ANA].clone();
    let again = lab.resign_from(&mut ana, back, Some(1));
    lab.m[ANA] = ana;
    lab.record(0, None, &[], vec![again], back);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(!lab.counts(&p), "a stepping down after the return counts");
}

/// F184, decided by Nobody, allegedly, 9 October 2026 ("Yes"): a relay's
/// delivery record (the relay transport cMIP, draft 3, type 0) counts as
/// evidence for a relay's role share only when the payer's claim for the
/// payment acknowledges it, and the object it names is the one the payment
/// was for (Law rules 19 and 22, the role share). The relay's word alone is
/// evidence of nothing: paying for usage invites faking usage.
#[test]
fn f184_a_delivery_record_counts_only_when_the_payers_claim_acknowledges_it() {
    use mor_core::finance::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let label = lab.c[0].id;
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut fan = lab.w.genesis("a fan", vec![own_home()], None, None);
    let mut relay = lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let k1 = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k1)).collect();
    let rec = lab.record(0, Some((k1, sigs)), &[], vec![], k1);
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    // The song's publication, its media locked under one locked hash.
    let locked = spec("the song's locked bytes");
    let song = {
        let x = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))], None, None);
        lab.w.add(&x)
    };
    let proof = b"the fan's payment".to_vec();
    let mut st = lab.strand(g, &key_of(svc.id));
    st.cite = Some((label, vec![g, rec]));
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.clone(),
            payer: Some(Payer::Identity(fan.id)),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: song,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut st, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let record = |lab: &mut Lab, relay: &mut Person, object: Hash, nonce: u8| {
        let p = vec![(Value::Uint(0), Value::Bytes(object.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![nonce; 32]))];
        let a = lab.w.everyday_act(relay, transport, 0, p, None, None);
        lab.w.add(&a)
    };
    let served = record(&mut lab, &mut relay, locked, 1);
    let other = record(&mut lab, &mut relay, spec("another object"), 2);
    let mut relay2 = lab.w.genesis("a second relay's operator", vec![own_home()], None, None);
    let served2 = record(&mut lab, &mut relay2, locked, 3);
    let stake = lab.view().terms(&k1).unwrap().own_stake().unwrap().0 as u64;
    let everyone = ids.clone();
    let relay_id = relay.id;
    let read = |lab: &mut Lab, svc: &mut Person, evidence: Hash| {
        let payouts = vec![
            law::Payout { receiver: ids[ANA], amount: 360, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: ids[BEN], amount: 270, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: ids[CY], amount: 270, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: relay_id, amount: 100, stake: None, role: Some("relay".into()), evidence: Some(evidence), fee_module: None, rail_fee: None },
        ];
        let s = law::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), agreement: k1, tally: None, number: None };
        let x = lab.w.private_act(svc, mips().law, law::types::SPLIT, s.to_map(), None, everyone.clone());
        let mut v = lab.view();
        v.delivery_records.insert(transport);
        v.split(&x).unwrap().unevidenced
    };
    assert_eq!(read(&mut lab, &mut svc, served), vec![relay_id], "the relay's word alone is evidence of nothing");
    // The relay signs a claim for the payment itself, acknowledging its record:
    // not the payer's claim.
    let claim = Fin::Claim(Claim {
        rail,
        proof: proof.clone(),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: song,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
    })
    .to_map();
    let a = lab.w.everyday_act(&mut relay, mips().finance, 3, claim.clone(), None, Some(vec![served]));
    lab.w.add(&a);
    assert_eq!(read(&mut lab, &mut svc, served), vec![relay_id], "only the payer's claim acknowledges a delivery");
    // The fan's claim, acknowledging the record of the object it paid for;
    // the rail answers that it carries the payment's commitment, the fan
    // as payer (F193).
    let a = lab.w.everyday_act(&mut fan, mips().finance, 3, claim, None, Some(sorted(vec![served, other, served2])));
    let a = lab.w.add(&a);
    lab.rail_valid.push((a, mor_core::finance::PaidAt::Flow(ptr)));
    assert!(read(&mut lab, &mut svc, served).is_empty(), "acknowledged by the payer's claim: it counts");
    assert!(read(&mut lab, &mut svc, served2).is_empty(), "one claim acknowledges several relays' records");
    assert_eq!(read(&mut lab, &mut svc, other), vec![relay_id], "a record of another object than the one paid for counts for nothing");
}

// ---------------------------------------------------------------------------
// Hostile review of the F190 and F184 build (9 October 2026, night):
// `docs/reviews/f190-review-2026-10-09.md`. Each test reproduces a finding
// as the code stands. A test that shows an attack working passes, and says
// so in its name; nothing here changes the protocol or the code.
// ---------------------------------------------------------------------------

/// Review finding 1 (BREAKS as built, rule 45b, QF1): where a party left
/// the deal on the branch later discarded, those who remain there grew it
/// alone, citing nothing, and the settled deal fell back to its reference.
/// Closed by F192 (decided 10 October 2026): a version a lone party grows
/// on a dropped branch reopens nothing; only a version on the line in
/// force changes the deal.
#[test]
fn review_f190_1_a_party_left_alone_on_a_dropped_branch_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    // Branch A: both carry on.
    let a1 = l.version(d, "A: Ana and Ben carry on, Ben's share raised.", None);
    // Branch B: Ben leaves the deal; a clone dropping him needs his signature too.
    let b1 = {
        let mut c = l.t.clone();
        c.parent = Some(d);
        c.text = "B: Ben leaves, Ana alone.".into();
        c.parties = vec![l.ana.id];
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
        let k = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(d));
        sign(&mut l.w, &mut l.ana, &k);
        sign(&mut l.w, &mut l.ben, &k);
        k
    };
    assert_eq!(l.in_force().unwrap(), d, "forked: the reference");
    // Settled for A, naming B's tip, signed by both: in force.
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s, "settled, by everyone");
    // Ana alone, the only party of B's tip, grows B past the tip named,
    // citing nothing: a complete version by every party whose voice remains there.
    let b2 = {
        let mut c = l.t.clone();
        c.parent = Some(b1);
        c.text = "B grows: Ana alone, citing nothing.".into();
        c.parties = vec![l.ana.id];
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![l.ana.id] }]);
        let k = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(b1));
        sign(&mut l.w, &mut l.ana, &k);
        k
    };
    assert_eq!(view(&l.w).agreement(&b2).unwrap().exists, Some(true), "Ana's version is complete: she is every party of that branch");
    assert_eq!(l.in_force().unwrap(), s, "Ana alone reopens nothing: Ben's raise stands (F192)");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none());
}

/// Review finding 2 (BREAKS as built, rule 45b, "the first clean
/// settlement holds"): the judge of forks unsettled its own settlement by
/// a second one, and the next plain version then decided which held.
/// Closed by F192 (decided 10 October 2026): any judge speaks once per
/// fork, a second settlement counting for nothing, and no plain version
/// decides anything. A verifier tells the second from the first by
/// history: here the second drops a version citing the first. Where
/// neither holds the other (the judge's first settlement uncited), which
/// came first cannot be told: the verifier refuses, and question QH1 is
/// open ("Open in this draft").
#[test]
fn review_f190_2_the_judge_speaks_once_and_no_plain_version_decides() {
    let lab = |cite: bool| {
        let (mut l, mut judges) = judged_deal(0);
        let d = l.d;
        let a1 = l.version(d, "A.", None);
        let b1 = l.version(d, "B.", None);
        let request = ask_judge(&mut l);
        let j1 = judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]);
        assert_eq!(l.in_force().unwrap(), a1, "the judge keeps A on Ben's request");
        // Life goes on under A; a conforming client cites the settlement.
        let a2 = l.version_full(a1, "A grows, after the judge spoke.", vec![], if cite { vec![j1] } else { vec![] });
        assert_eq!(l.in_force().unwrap(), a2);
        // The judge, alone, on the same request, later keeps B instead.
        judge_settles(&mut l, &mut judges[0], request, b1, vec![a2], vec![]);
        (l, a2, b1)
    };
    let (mut l, a2, b1) = lab(true);
    assert_eq!(l.in_force().unwrap(), a2, "the second settlement counts for nothing");
    l.version(b1, "A harmless change on B.", None);
    assert_eq!(l.in_force().unwrap(), a2, "a plain version on B decides nothing");
    let a3 = l.version(a2, "A harmless change on A.", None);
    assert_eq!(l.in_force().unwrap(), a3, "a version on the line in force changes the deal, as any version does");
    // The first settlement uncited: neither holds the other.
    let (l, _, _) = lab(false);
    assert!(matches!(l.in_force(), Err(LawError::Unsettled(w)) if w.contains("QH1")), "{:?}", l.in_force());
}

/// Review finding 5 (BREAKS as built, rules 19 and 22, F184): the
/// receipt's payer is written by the split service that signs the receipt.
/// Where the real payer published no claim and committed to nobody, the
/// service named a payer of its own choosing, whose claim for the same
/// rail proof then acknowledged the record of a relay the service runs.
/// Closed by F193 (decided 10 October 2026): only the payer the payment's
/// own commitment names acknowledges; the puppet's claim does not carry
/// the commitment (the rail refuses it), and acknowledges nothing.
#[test]
fn review_f190_5_the_payer_the_service_names_acknowledges_nothing() {
    use mor_core::finance::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let label = lab.c[0].id;
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut puppet = lab.w.genesis("the service's puppet, named as payer", vec![own_home()], None, None);
    let mut relay = lab.w.genesis("the service's own relay", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let k1 = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k1)).collect();
    let rec = lab.record(0, Some((k1, sigs)), &[], vec![], k1);
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let locked = spec("the song's locked bytes");
    let song = {
        let x = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))], None, None);
        lab.w.add(&x)
    };
    // A real, anonymous buyer paid on the rail and published nothing. The
    // service receipts the payment naming its puppet as the payer.
    let proof = b"an anonymous buyer's payment".to_vec();
    let mut st = lab.strand(g, &key_of(svc.id));
    st.cite = Some((label, vec![g, rec]));
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.clone(),
            payer: Some(Payer::Identity(puppet.id)),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: song,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut st, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    // The service's relay signs a record of the song; nobody fetched it.
    let served = {
        let p = vec![(Value::Uint(0), Value::Bytes(locked.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![7; 32]))];
        let a = lab.w.everyday_act(&mut relay, transport, 0, p, None, None);
        lab.w.add(&a)
    };
    // The puppet's claim for the same rail proof acknowledges it.
    let claim = Fin::Claim(Claim {
        rail,
        proof,
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: song,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
    });
    let a = lab.w.everyday_act(&mut puppet, mips().finance, 3, claim.to_map(), None, Some(vec![served]));
    lab.w.add(&a);
    let stake = lab.view().terms(&k1).unwrap().own_stake().unwrap().0 as u64;
    let payouts = vec![
        law::Payout { receiver: ids[ANA], amount: 360, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        law::Payout { receiver: ids[BEN], amount: 270, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        law::Payout { receiver: ids[CY], amount: 270, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        law::Payout { receiver: relay.id, amount: 100, stake: None, role: Some("relay".into()), evidence: Some(served), fee_module: None, rail_fee: None },
    ];
    let s = law::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), agreement: k1, tally: None, number: None };
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, s.to_map(), None, ids.clone());
    let mut v = lab.view();
    v.delivery_records.insert(transport);
    assert_eq!(v.split(&x).unwrap().unevidenced, vec![relay.id], "the puppet's claim carries no commitment of the payment: the relay's share is unevidenced");
    // Were the rail to answer it valid, the puppet would be the committed
    // payer, and its acknowledgement would count: the commitment decides.
    let mut v = lab.view();
    v.delivery_records.insert(transport);
    let puppet_claim = lab.w.v.signed_by(&puppet.id).find(|h| h.inside.spec == mips().finance).unwrap().id;
    v.rail_valid.insert(puppet_claim, mor_core::finance::PaidAt::Flow(ptr));
    assert!(v.split(&x).unwrap().unevidenced.is_empty());
}

/// Review finding 6 (BREAKS as built, the resignation format, QF6 and
/// F189 1): a stepping down was spent only after a line registered it and
/// the member came back; one never registered stayed a standing weapon.
/// Closed by F195 (decided 10 October 2026, "Good"): a resignation or a
/// stepping down is spent by any later version its signer signed that
/// names them again, registered or not; once spent, no line registers it.
#[test]
fn review_f190_6_an_old_stepping_down_never_registered_is_spent() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    // Ana signs a stepping down from Releases (area 1) and hands it in; the
    // label never registers it: everyone agreed she would stay.
    let mut ana = lab.m[ANA].clone();
    let old = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    // Later, a constitutional clone that every member signs names Ana the
    // holder of Releases.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].holders = vec![ids[ANA]];
        t.text = "Ana runs the releases.".into();
    });
    let back = lab.propose(BEN, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &back)).collect();
    lab.rotate(Some((back, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "Ana holds Releases");
    // Whoever holds the signing key registers the old stepping down now.
    lab.record(0, None, &[], vec![old], back);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "the old stepping down, spent by Ana's later signature as holder, takes nothing (F195)");
}

/// Review, smaller reading (UNCLEAR as built, rule 45b): where every
/// party signed a version naming in field 26 a hash that exists nowhere,
/// every reading of the deal erred, for good. Closed by F196 (decided 10
/// October 2026): such a version is read as a plain version until the
/// version it names is held; the deal stays readable, and the parties may
/// sign a correct settlement.
#[test]
fn review_f190_7_a_complete_version_naming_a_tip_nobody_holds_is_a_plain_version() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let bad = l.version(a1, "Settles a hash that exists nowhere.", Some(spec("nothing, anywhere")));
    assert_eq!(l.in_force().unwrap(), d, "readable: forked, on the reference");
    let next = l.version(bad, "Life tries to go on.", None);
    assert_eq!(l.in_force().unwrap(), d);
    assert!(view(&l.w).deal_fork(&d).unwrap().is_some());
    let s = l.version_full(next, "Settled correctly.", vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), s);
}

/// Review finding 5b (BREAKS, rule 22, F184): "the object the payment was
/// for" is read from the publication the payment names in `fulfils`. A
/// purchase that names the standing offer instead (Finance, receipt field
/// 5: "the obligation, agreement, offer or payee-pointer act this hop
/// follows") is a purchase to the core, but names no publication the
/// reading can follow: no delivery record ever counts for it, however
/// plainly the buyer's claim acknowledges it.
#[test]
fn review_f190_5b_no_delivery_record_counts_on_a_purchase_naming_the_offer() {
    use mor_core::finance::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let label = lab.c[0].id;
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut fan = lab.w.genesis("a fan", vec![own_home()], None, None);
    let mut relay = lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
    lab.sign(BEN, &g);
    sign(&mut lab.w, &mut svc, &g);
    let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
    let k1 = lab.propose(ANA, &t);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k1)).collect();
    let rec = lab.record(0, Some((k1, sigs)), &[], vec![], k1);
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let locked = spec("the song's locked bytes");
    let _song = {
        let x = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))], None, None);
        lab.w.add(&x)
    };
    // The collective's standing offer for the song (its format is open).
    let offer = {
        let x = lab.w.everyday_act(&mut lab.c[0], mips().law, law::types::STANDING_OFFER, vec![], None, None);
        lab.w.add(&x)
    };
    let proof = b"the fan's payment under the offer".to_vec();
    let mut st = lab.strand(g, &key_of(svc.id));
    st.cite = Some((label, vec![g, rec]));
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.clone(),
            payer: Some(Payer::Identity(fan.id)),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: offer,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut st, mips().finance, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let served = {
        let p = vec![(Value::Uint(0), Value::Bytes(locked.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![9; 32]))];
        let a = lab.w.everyday_act(&mut relay, transport, 0, p, None, None);
        lab.w.add(&a)
    };
    // The fan's own claim for the payment acknowledges the record of the
    // song it fetched.
    let claim = Fin::Claim(Claim {
        rail,
        proof,
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: offer,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
    });
    let a = lab.w.everyday_act(&mut fan, mips().finance, 3, claim.to_map(), None, Some(vec![served]));
    let a = lab.w.add(&a);
    // The fan is the payer the payment committed to (F193).
    lab.rail_valid.push((a, mor_core::finance::PaidAt::Flow(ptr)));
    let stake = lab.view().terms(&k1).unwrap().own_stake().unwrap().0 as u64;
    let payouts = vec![
        law::Payout { receiver: ids[ANA], amount: 360, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        law::Payout { receiver: ids[BEN], amount: 270, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        law::Payout { receiver: ids[CY], amount: 270, stake: Some(stake), role: None, evidence: None, fee_module: None, rail_fee: None },
        law::Payout { receiver: relay.id, amount: 100, stake: None, role: Some("relay".into()), evidence: Some(served), fee_module: None, rail_fee: None },
    ];
    let s = law::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), agreement: k1, tally: None, number: None };
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, s.to_map(), None, ids.clone());
    let mut v = lab.view();
    v.delivery_records.insert(transport);
    assert_eq!(v.split(&x).unwrap().unevidenced, vec![relay.id], "acknowledged by the payer, for the song served, and still evidence of nothing: the payment names the offer, not the publication");
}

/// Review, what held: the judge's settlement made after the parties'
/// clean settlement changes nothing: it names the settling version, so it
/// is after it, and the first clean settlement holds.
#[test]
fn review_f190_held_the_judge_cannot_overturn_the_parties_clean_settlement() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut judge = w.genesis("the judge of forks", vec![own_home()], None, None);
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(vec![judge.id]);
    t.fork_judge = Some(judge.id);
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let mut l = DealLab { w, ana, ben, t, d };
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A by everyone.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    let request = {
        let r = law::SettlementRequest { reference: d };
        law_act(&mut l.w, &mut l.ana, law::types::SETTLEMENT_REQUEST, r.to_map(), obj(d))
    };
    // The judge, asked afterwards by Ana, keeps B and discards the
    // settlement: made after it, it changes nothing.
    let j = law::ForkSettlement { request, kept: b1, discarded: vec![s] };
    law_act(&mut l.w, &mut judge, law::types::FORK_SETTLEMENT, j.to_map(), obj(request));
    assert_eq!(l.in_force().unwrap(), s, "the judge cannot overturn a clean settlement of the parties");
}

// ---------------------------------------------------------------------------
// The F191 to F199 build (10 October 2026): `docs/f191-f199-build-2026-10-10.md`.
// Each test was written first and seen to fail for the reason the decision
// gives.
// ---------------------------------------------------------------------------

/// A deal naming a judge of forks, with a chain of judgment for it (QG4):
/// those who take over, in order, each after a period on the deal's time
/// reference.
fn judged_deal(takers: usize) -> (DealLab, Vec<Person>) {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let judges: Vec<Person> = (0..=takers).map(|i| w.genesis(&format!("judge {i}"), vec![own_home()], None, None)).collect();
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(judges.iter().map(|j| j.id).collect());
    t.fork_judge = Some(judges[0].id);
    if takers > 0 {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.chain = Some(vec![law::ChainLink {
            judge: law::Judge::Identity(judges[0].id),
            next: judges[1..].iter().map(|j| (law::Taker::One(j.id), 30)).collect(),
        }]);
    }
    let d = law_act(&mut w, &mut ana, law::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    (DealLab { w, ana, ben, t, d }, judges)
}

fn ask_judge(l: &mut DealLab) -> Hash {
    let r = law::SettlementRequest { reference: l.d };
    law_act(&mut l.w, &mut l.ben, law::types::SETTLEMENT_REQUEST, r.to_map(), obj(l.d))
}

fn judge_settles(l: &mut DealLab, judge: &mut Person, request: Hash, kept: Hash, discarded: Vec<Hash>, cites: Vec<Hash>) -> Hash {
    let s = law::ForkSettlement { request, kept, discarded: sorted(discarded) };
    let mut o = vec![Object { chain: request, predecessor: request }];
    o.extend(cites.iter().map(|c| Object { chain: *c, predecessor: *c }));
    law_act(&mut l.w, judge, law::types::FORK_SETTLEMENT, s.to_map(), Some(o))
}

/// F192, decided by Nobody, allegedly, 10 October 2026 ("Yes agreed"),
/// replacing QF1: a settlement is final for everything its signers could
/// see. A version on a dropped branch that the settlement did not hold in
/// its history (made late, or kept back) reopens nothing; only a new
/// version on the line in force, signed as rule 45b asks, changes the deal.
#[test]
fn f192_a_late_version_on_a_dropped_branch_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    let b2 = l.version(b1, "B grows, when? Nobody can tell.", None);
    assert_eq!(l.in_force().unwrap(), s, "a version the settlement could not see reopens nothing");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none(), "the deal is settled, not forked");
    l.version(b2, "B grows again.", None);
    assert_eq!(l.in_force().unwrap(), s);
    let s2 = l.version(s, "Life goes on, on the line in force.", None);
    assert_eq!(l.in_force().unwrap(), s2, "only a version on the line in force changes the deal");
    // A whole branch the settlement never saw: dropped too (F192: "anything
    // else is not seen").
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A, naming B.", Some(b1));
    l.version(d, "C, a third version of the reference, never seen.", None);
    assert_eq!(l.in_force().unwrap(), s);
}

/// A verifier holding everything `w` holds but the acts in `skip` and
/// their signature acts: a verifier that has not been given them yet.
fn held_without(w: &World, skip: &[Hash]) -> mor_core::chain::Verifier {
    let mut v = mor_core::chain::Verifier::with_mips(common::identity_spec(), common::finance_spec(), law_spec());
    for (a, key) in &w.log {
        let id = a.id();
        let cites = w.v.get(&id).is_some_and(|h| {
            h.inside.spec == law_spec() && h.inside.type_ == law::types::SIGNATURE && h.inside.objects.iter().flatten().any(|o| skip.contains(&o.chain))
        });
        if !skip.contains(&id) && !cites {
            v.add_with_key(a.clone(), key.as_ref()).unwrap();
        }
    }
    v
}

/// F192, Fable's finding 3 (a complete version held back): a version
/// signed by everyone while the fork stood, published after the
/// settlement, reopens nothing. Its signer loses it: the stated cost.
#[test]
fn f192_a_version_held_back_and_published_late_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    // Ben signs a small change on B; Ana keeps it to herself.
    let b2 = l.version(b1, "B: a small change, signed by both, kept back.", None);
    let s = l.version(a1, "Settled for A, naming B's tip as everyone could see it.", Some(b1));
    let before = held_without(&l.w, &[b2]);
    assert_eq!(LawView::new(&before, mips()).version_in_force(&d).unwrap(), s, "before Ana publishes it: settled");
    assert_eq!(view(&l.w).agreement(&b2).unwrap().exists, Some(true));
    assert_eq!(l.in_force().unwrap(), s, "published late, it reopens nothing");
}

/// F188's "one naming an older version of that branch settles nothing",
/// under F192: it holds where the settlement holds the newer version in its
/// history, and only there; a newer version it does not hold is a late
/// version, and loses.
#[test]
fn f192_a_settlement_that_saw_a_newer_tip_and_named_an_older_settles_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let b2 = l.version(b1, "B grows.", None);
    let s = l.version_full(a1, "Names B1, but cites B2: it saw B2.", vec![b1], vec![b2]);
    assert_ne!(l.in_force().unwrap(), s, "it saw the newer tip and named an older one: it settles nothing");
    assert!(l.tangled() || view(&l.w).deal_fork(&d).unwrap().is_some(), "a plain version: still forked");
    let s2 = l.version_full(a1, "Names B2.", vec![b2], vec![]);
    assert_eq!(l.in_force().unwrap(), s2, "naming the tip it saw, it settles; the plain version it did not see loses");
    let _ = s;
    // Not citing B2, it could not see it: it counts, and B2 loses.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    l.version(b1, "B grows.", None);
    let s = l.version(a1, "Names B1, as it saw B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s, "B2, not seen, reopens nothing (F192)");
}

/// F192 against Fable's finding 2: a party left alone on a dropped branch
/// grows it, citing nothing: nothing reopens. "Only a new version signed
/// by every party whose voice remains in the version the settlement put in
/// force changes the deal."
#[test]
fn f192_a_party_alone_on_a_dropped_branch_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A: Ana and Ben carry on.", None);
    let b1 = {
        let mut c = l.t.clone();
        c.parent = Some(d);
        c.text = "B: Ben leaves, Ana alone.".into();
        c.parties = vec![l.ana.id];
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
        let k = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(d));
        sign(&mut l.w, &mut l.ana, &k);
        sign(&mut l.w, &mut l.ben, &k);
        k
    };
    let s = l.version(a1, "Settled: A.", Some(b1));
    let mut c = l.t.clone();
    c.parent = Some(b1);
    c.text = "B grows: Ana alone.".into();
    c.parties = vec![l.ana.id];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![l.ana.id] }]);
    let b2 = law_act(&mut l.w, &mut l.ana, law::types::TERMS, c.to_map(), obj(b1));
    sign(&mut l.w, &mut l.ana, &b2);
    assert_eq!(l.in_force().unwrap(), s, "Ana alone reopens nothing");
}

/// F192, Fable's finding 1: the judge of forks speaks once per fork. A
/// second settlement that holds the first in its history (it drops a
/// version made after the first, citing it) counts for nothing, and no
/// plain version then decides anything.
#[test]
fn f192_the_judge_speaks_once() {
    let (mut l, mut judges) = judged_deal(0);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask_judge(&mut l);
    let j1 = judge_settles(&mut l, &mut judges[0], r, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), a1);
    // Life goes on under A; a conforming client cites the settlement.
    let a2 = l.version_full(a1, "A grows, after the judge spoke.", vec![], vec![j1]);
    assert_eq!(l.in_force().unwrap(), a2);
    judge_settles(&mut l, &mut judges[0], r, b1, vec![a2], vec![]);
    assert_eq!(l.in_force().unwrap(), a2, "a second settlement, made after the first, counts for nothing");
    let b2 = l.version(b1, "A harmless change on B.", None);
    assert_eq!(l.in_force().unwrap(), a2, "and a plain version on B decides nothing");
    let _ = b2;
}

/// F192 with DQ3: two settling versions of the parties, neither holding the
/// other, stay a tangle (every party signed both); a later one holding both
/// and naming every tip settles it, as QF3 allows.
#[test]
fn f192_rival_settling_versions_of_the_parties_and_a_third() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s1 = l.version(a1, "Settled for A.", Some(b1));
    let s2 = l.version(b1, "Settled for B.", Some(a1));
    assert!(l.tangled());
    // A version on one of them that saw only that one changes nothing.
    l.version(s1, "On A's settlement, not seeing B's.", None);
    assert!(l.tangled());
    let s3 = l.version_full(s1, "For A, having seen both settlements.", vec![s2], vec![]);
    assert_eq!(l.in_force().unwrap(), s3, "settled by the version that saw both; the version on s1 it did not see loses (F192)");
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s1 = l.version(a1, "Settled for A.", Some(b1));
    let s2 = l.version(b1, "Settled for B.", Some(a1));
    let s3 = l.version_full(s1, "For A, having seen both settlements.", vec![s2], vec![]);
    assert_eq!(l.in_force().unwrap(), s3, "settled by the version that saw both");
}

/// F196, decided by Nobody, allegedly, 10 October 2026 ("Approved"): a
/// settling version naming a version the verifier does not hold is read as
/// a plain version until it is held; the deal stays readable.
#[test]
fn f196_a_settlement_naming_a_version_nobody_holds_is_a_plain_version() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let bad = l.version(a1, "Settles a hash that exists nowhere.", Some(spec("nothing, anywhere")));
    assert_eq!(l.in_force().unwrap(), d, "readable: forked, on its reference");
    let f = view(&l.w).deal_fork(&d).unwrap().expect("forked");
    assert!(f.branches.iter().any(|b| b.contains(&bad)), "read as a plain version of branch A");
    let s = l.version_full(bad, "A correct settlement.", vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), s, "the parties may sign a correct settlement");
}

/// F196: once the named version is held, the settlement counts from then.
#[test]
fn f196_once_held_the_settlement_counts() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b0 = l.version(d, "B.", None);
    let b1 = l.version(b0, "B grows.", None);
    let s = l.version(a1, "Settled: A, naming B's tip.", Some(b1));
    let partial = held_without(&l.w, &[b1]);
    let v = LawView::new(&partial, mips());
    assert_eq!(v.version_in_force(&d).unwrap(), d, "B's tip not held: the settlement is a plain version, the deal forked");
    assert!(v.deal_fork(&d).unwrap().is_some_and(|f| f.branches.iter().any(|b| b.contains(&s))));
    assert_eq!(l.in_force().unwrap(), s, "held: the settlement counts");
}

/// QG4, decided by Nobody, allegedly, 9 October 2026: the judge of forks
/// follows the chain of judgment (field 21) like any judge the terms name.
/// Where it does not act within its period, the next link takes over, and
/// an answer it gives after that counts for nothing (rule 34a, F124).
#[test]
fn qg4_the_judge_of_forks_follows_the_chain_of_judgment() {
    let (mut l, mut judges) = judged_deal(1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask_judge(&mut l);
    let (first, next) = judges.split_at_mut(1);
    // The next link may not act while the judge's period runs.
    judge_settles(&mut l, &mut next[0], r, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), d, "the next link waits on the judge's period");
    // Its period passed, as the deal's time reference says: the next takes over.
    let mut v = view(&l.w);
    v.judges_lapsed.insert((r, first[0].id));
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "the next link settles");
    // The judge, speaking after its period, counts for nothing.
    judge_settles(&mut l, &mut first[0], r, b1, vec![a1], vec![]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((r, first[0].id));
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "the judge's late answer counts for nothing");
}

/// A label selling its song through a split service, a relay share in its
/// plan, for the role-share decisions of 10 October 2026 (F193, F194, QG3):
/// the lab, the service, the payment's receipt as the service signs it
/// (naming `payer`), the label's pointer act (where the rail shows the
/// money paid), and the split's reading for one piece of evidence.
struct RoleLab {
    lab: Lab,
    svc: Person,
    /// The buyer.
    fan: Person,
    incoming: Hash,
    k1: Hash,
    song: Hash,
    ptr: Hash,
    rail: Hash,
    proof: Vec<u8>,
    stake: u64,
}

impl RoleLab {
    /// `names_fan`: the receipt the service signs names the fan as payer.
    fn new(names_fan: bool) -> RoleLab {
        use mor_core::finance::{Amount, Payload as Fin, Purchase, Receipt};
        let mut lab = Lab::new(&|t| {
            let p = t.parties.clone();
            t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
        });
        let label = lab.c[0].id;
        let rail = spec("a rail Module");
        let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
        let fan = lab.w.genesis("a fan", vec![own_home()], None, None);
        let payer = names_fan.then_some(mor_core::finance::Payer::Identity(fan.id));
        let g = lab.grant(&Grant { area: Some(2), kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]), ..plain_grant(svc.id, false) });
        lab.sign(BEN, &g);
        sign(&mut lab.w, &mut svc, &g);
        let t = lab.clone_terms(&lab.founding.clone(), vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| t.split_grant = Some(g));
        let k1 = lab.propose(ANA, &t);
        let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k1)).collect();
        let rec = lab.record(0, Some((k1, sigs)), &[], vec![], k1);
        let ptr = lab.pointer(0, 1, None, &[rail]);
        lab.sign(BEN, &ptr);
        let song = {
            let x = lab.w.everyday_act(&mut lab.c[0], mips().envelope, 0, vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(spec("the song's locked bytes").to_vec()))], None, None);
            lab.w.add(&x)
        };
        let proof = b"a payment for the song".to_vec();
        let mut st = lab.strand(g, &key_of(svc.id));
        st.cite = Some((label, vec![g, rec]));
        let incoming = {
            let r = Fin::Receipt(Receipt {
                rail,
                proof: proof.clone(),
                payer,
                payee: label,
                amount: Amount { unit: spec("a unit"), value: 1000 },
                fulfils: song,
                previous: None,
                forward: None,
                batch: None,
                purchase: Some(Purchase { agreement: k1, line: k1 }),
            });
            let a = lab.w.everyday_act(&mut st, mips().finance, 2, r.to_map(), None, None);
            lab.w.add(&a)
        };
        // The service's receipt carries the rail's valid answer.
        lab.rail_valid.push((incoming, mor_core::finance::PaidAt::Flow(ptr)));
        let stake = lab.view().terms(&k1).unwrap().own_stake().unwrap().0 as u64;
        RoleLab { lab, svc, fan, incoming, k1, song, ptr, rail, proof, stake }
    }

    /// A claim for the same payment by `who`, acknowledging `acks`; `valid`:
    /// the rail answered valid for it (the commitment recomputed from it,
    /// its signer as payer, matches), as the caller states it; otherwise
    /// the rail refused it, or was not asked.
    fn claim(&mut self, who: Option<&mut Person>, acks: Vec<Hash>, valid: bool) -> Hash {
        use mor_core::finance::{Amount, Claim, Payload as Fin, Purchase};
        let c = Fin::Claim(Claim {
            rail: self.rail,
            proof: self.proof.clone(),
            payee: self.lab.c[0].id,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: self.song,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: self.k1, line: self.k1 }),
        });
        let who = match who {
            Some(p) => p,
            None => &mut self.fan,
        };
        let a = self.lab.w.everyday_act(who, mips().finance, 3, c.to_map(), None, Some(sorted(acks)));
        let id = self.lab.w.add(&a);
        if valid {
            self.lab.rail_valid.push((id, mor_core::finance::PaidAt::Flow(self.ptr)));
        }
        id
    }

    /// The receivers whose role share the split leaves unevidenced, for a
    /// role payout to `to` with `evidence`; `told`: the verifier read
    /// `transport` as the relay transport cMIP.
    fn unevidenced(&mut self, to: Hash, evidence: Hash, told: Option<Hash>) -> Vec<Hash> {
        let ids = self.lab.ids();
        let payouts = vec![
            law::Payout { receiver: ids[ANA], amount: 360, stake: Some(self.stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: ids[BEN], amount: 270, stake: Some(self.stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: ids[CY], amount: 270, stake: Some(self.stake), role: None, evidence: None, fee_module: None, rail_fee: None },
            law::Payout { receiver: to, amount: 100, stake: None, role: Some("a helper".into()), evidence: Some(evidence), fee_module: None, rail_fee: None },
        ];
        let s = law::Split { receipt: self.incoming, payouts, cmip: spec("a split cMIP"), agreement: self.k1, tally: None, number: None };
        let x = self.lab.w.private_act(&mut self.svc, mips().law, law::types::SPLIT, s.to_map(), None, ids);
        let mut v = self.lab.view();
        v.delivery_records.extend(told);
        v.split(&x).unwrap().unevidenced
    }

    /// A record of `object` signed by `who` under `spec_`, type 0.
    fn record(&mut self, who: &mut Person, spec_: Hash, object: Hash) -> Hash {
        let p = vec![(Value::Uint(0), Value::Bytes(object.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![1; 32]))];
        let a = self.lab.w.everyday_act(who, spec_, 0, p, None, None);
        self.lab.w.add(&a)
    }
}

/// F193, decided by Nobody, allegedly, 10 October 2026 ("Yes, the loss is
/// minimal"): only the payer the payment's own commitment names (an
/// identity, a bare key, or nobody) acknowledges a delivery record: a claim
/// whose rail proof carries the commitment recomputed from it, its signer
/// as payer. Never the payer a receipt names: the split service writes it.
#[test]
fn f193_only_the_payer_the_payment_commits_to_acknowledges_a_delivery() {
    let transport = spec("the relay transport cMIP, draft 3");
    let locked = spec("the song's locked bytes");
    // The fan committed to their identity, and acknowledges: it counts.
    let mut l = RoleLab::new(false);
    let mut relay = l.lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let served = l.record(&mut relay, transport, locked);
    l.claim(None, vec![served], true);
    assert!(l.unevidenced(relay.id, served, Some(transport)).is_empty(), "the committed payer's claim acknowledges: it counts");
    // The receipt, which the service writes, names the fan as payer; the
    // payment committed to nobody (the buyer stayed anonymous), so the
    // rail refuses the fan's claim: it acknowledges nothing.
    let mut l = RoleLab::new(true);
    let mut relay = l.lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let served = l.record(&mut relay, transport, locked);
    l.claim(None, vec![served], false);
    assert_eq!(l.unevidenced(relay.id, served, Some(transport)), vec![relay.id], "a claim the payment did not commit to acknowledges nothing, whoever the receipt names");
}

/// QG3, decided by Nobody, allegedly, 9 October 2026 ("Agreed"): any act
/// offered as a relay's evidence for its role share counts only when the
/// committed payer's claim acknowledges it, whatever cMIP defines it: a
/// verifier not told which specification is the relay transport cMIP
/// gives the same answer.
#[test]
fn qg3_any_act_offered_as_evidence_needs_the_payers_acknowledgement() {
    let transport = spec("the relay transport cMIP, draft 3");
    let mut l = RoleLab::new(false);
    let mut relay = l.lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let served = l.record(&mut relay, transport, spec("the song's locked bytes"));
    assert_eq!(l.unevidenced(relay.id, served, None), vec![relay.id], "not told: the relay's own word is still nothing");
    assert_eq!(l.unevidenced(relay.id, served, Some(transport)), vec![relay.id]);
    l.claim(None, vec![served], true);
    assert!(l.unevidenced(relay.id, served, None).is_empty(), "acknowledged: every verifier counts it");
    assert!(l.unevidenced(relay.id, served, Some(transport)).is_empty());
}

/// F194, decided by Nobody, allegedly, 10 October 2026 ("Yes, then it is a
/// question of good practice from clients devs"): no service is paid on its
/// own use record alone. A service the payer chose is paid by a role share
/// only when the committed payer acknowledges its record (the relay's
/// rule); one evidenced only by its own record is not paid.
#[test]
fn f194_no_service_is_paid_on_its_own_record_alone() {
    let mut l = RoleLab::new(false);
    let mut carla = l.lab.w.genesis("Carla, who runs a transcoding service", vec![own_home()], None, None);
    let used = l.record(&mut carla, spec("a transcoding service's use record"), spec("the song's locked bytes"));
    assert_eq!(l.unevidenced(carla.id, used, None), vec![carla.id], "her own record alone pays her nothing");
    l.claim(None, vec![used], true);
    assert!(l.unevidenced(carla.id, used, None).is_empty(), "the payer who chose it acknowledges: paid");
}

/// F195, decided by Nobody, allegedly, 10 October 2026 ("Good"): a
/// resignation is spent by any later version its signer signed that names
/// them again, whether or not it was ever registered; once spent, no line
/// registers it, and no rollback either.
#[test]
fn f195_a_resignation_never_registered_is_spent_by_coming_back() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.c[0].id;
    let all = sorted(lab.ids());
    // Ben resigns, naming the founding agreement; it is never registered.
    let mut ben = lab.m[BEN].clone();
    let old = lab.resign_from(&mut ben, f, None);
    lab.m[BEN] = ben;
    // Later, a constitutional clone every member signs, Ben among them.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| t.text = "A new constitution.".into());
    let later = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &later)).collect();
    lab.rotate(Some((later, s)), &[0]);
    // Whoever holds the signing key registers the old resignation now.
    lab.record(0, None, &[], vec![old], later);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!(sorted(n.voices), all, "spent: Ben's voice remains");
    assert!(lab.view().published_resignations(&col).unwrap().iter().all(|d| d.act != old), "not shown as a resignation to come");
    // A resignation Ben signs after the later version counts.
    let mut ben = lab.m[BEN].clone();
    let again = lab.resign_from(&mut ben, later, None);
    lab.m[BEN] = ben;
    lab.record(0, None, &[], vec![again], later);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&lab.ids()[BEN]));
}

/// A broken collective that took a payment under an offer of its broken
/// stretch, from `payer` (as the receipt names it): owed back (rule 37d).
/// Returns the lab, the collective, the receipt, the stretch's clone and
/// the broken act.
fn owed_back_lab(payer: Option<mor_core::finance::Payer>, proof: &[u8]) -> (Lab, Hash, Hash, Hash, Hash) {
    let (lab, label, owed, k1, rot1, _) = owed_back_lab_with(|_| (payer, None), proof);
    (lab, label, owed, k1, rot1)
}

/// [`owed_back_lab`], the payer made in the lab first: `make` gives the
/// payer the receipt names, and the person, where there is one.
fn owed_back_lab_with(make: impl FnOnce(&mut Lab) -> (Option<mor_core::finance::Payer>, Option<Person>), proof: &[u8]) -> (Lab, Hash, Hash, Hash, Hash, Option<Person>) {
    use mor_core::finance::{Amount, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let (payer, person) = make(&mut lab);
    let label = lab.c[0].id;
    let (k1, _, _, rot1) = break_by_lost_record(&mut lab);
    let f = lab.founding;
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payer,
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: k1 }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mips().finance, 2, r.to_map(), None, None);
    let owed = lab.w.add(&a);
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1);
    (lab, label, owed, k1, rot1, person)
}

/// A payer with an identity, made in the lab.
fn patron_pays(lab: &mut Lab) -> (Option<mor_core::finance::Payer>, Option<Person>) {
    let p = lab.w.genesis("a patron", vec![own_home()], None, None);
    (Some(mor_core::finance::Payer::Identity(p.id)), Some(p))
}

/// The payer's own claim on the payment owed back (Finance type 3), naming
/// a refund rail (key 7) where given, citing `cites`.
fn payers_claim_on(lab: &mut Lab, payer: &mut Person, label: Hash, owed_proof: &[u8], k1: Hash, refund: Option<&[u8]>, cites: Option<Vec<Object>>) -> Hash {
    use mor_core::finance::{Amount, Claim, Payload as Fin, Purchase, Rail};
    let c = Fin::Claim(Claim {
        rail: spec("a rail Module"),
        proof: owed_proof.to_vec(),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        disagrees: None,
        referral: None,
        refund: refund.map(|a| Rail { module: spec("a rail Module"), address: a.to_vec() }),
        anonymous: None,
        purchase: Some(Purchase { agreement: lab.founding, line: k1 }),
    });
    let a = lab.w.everyday_act(payer, mips().finance, 3, c.to_map(), cites, None);
    lab.w.add(&a)
}

/// QG2, decided by Nobody, allegedly, 9 October 2026 ("Agreed"): money
/// owed back follows the debt rule exactly: to the refund rail the payer's
/// own claim on the payment names (key 7), where it names one; otherwise to
/// the pointer Finance rule 14 selects from the payer's own acts on that
/// payment, or the payer's pointer in force where there is none; the
/// payer's own receipt counts wherever the money went.
#[test]
fn qg2_money_owed_back_follows_the_debt_rule() {
    use mor_core::finance::PaidAt;
    let unit = spec("a unit");
    // The payer's claim names a refund rail: only a repayment there counts.
    let (mut lab, label, owed, k1, _, patron) = owed_back_lab_with(patron_pays, b"gift");
    let mut patron = patron.unwrap();
    let pid = patron.id;
    let node = pointer_of(&mut lab.w, &mut patron, 1, None, &[b"the patron's node"]);
    let own = payers_claim_on(&mut lab, &mut patron, label, b"gift", k1, Some(b"the patron's refund address"), None);
    let mut payer = lab.c[0].clone();
    let to_node = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"back to the pointer");
    lab.rail_valid.push((to_node, PaidAt::Flow(node)));
    lab.c[0] = payer.clone();
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "the payer's claim names a refund rail: a repayment elsewhere repays nothing");
    let to_rail = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"back to the refund rail");
    lab.rail_valid.push((to_rail, PaidAt::Flow(own)));
    lab.c[0] = payer;
    assert!(lab.view().owed_back(&label).unwrap().is_empty(), "repaid where the payer's own claim said");
}

/// QG2, the second branch: the payer's own act on the payment holds an
/// earlier pointer; a repayment to a newer one counts for nothing, as for
/// a debt (Finance rule 14: the selected wallet or an older one, never a
/// newer one); with no act of theirs on it, the pointer in force.
#[test]
fn qg2_the_pointer_the_payers_own_acts_hold() {
    use mor_core::finance::PaidAt;
    let unit = spec("a unit");
    let (mut lab, label, owed, k1, _, patron) = owed_back_lab_with(patron_pays, b"gift");
    let mut patron = patron.unwrap();
    let pid = patron.id;
    let v1 = pointer_of(&mut lab.w, &mut patron, 1, None, &[b"the old node"]);
    payers_claim_on(&mut lab, &mut patron, label, b"gift", k1, None, Some(vec![Object { chain: v1, predecessor: v1 }]));
    let v2 = pointer_of(&mut lab.w, &mut patron, 2, Some(v1), &[b"a newer node"]);
    let mut payer = lab.c[0].clone();
    let x = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"to the newer");
    lab.rail_valid.push((x, PaidAt::Flow(v2)));
    lab.c[0] = payer.clone();
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "a newer pointer than the payer's own act holds: nothing");
    let y = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"to the one held");
    lab.rail_valid.push((y, PaidAt::Flow(v1)));
    lab.c[0] = payer;
    assert!(lab.view().owed_back(&label).unwrap().is_empty());
}

/// QG1, decided by Nobody, allegedly, 9 October 2026: a refund owed to a
/// bare key (Finance rule 10a) is repaid once the collective's claim
/// carries the rail's proof that the money reached where the claim signed
/// with that key said (key 7).
#[test]
fn qg1_a_refund_to_a_bare_key_is_repaid_by_the_collectives_claim() {
    use mor_core::finance::{Amount, Anonymous, Citations, Claim, PaidAt, Payer, Payload as Fin, Purchase, Rail};
    let key = SchnorrKey::from_secret(&spec("a one-time key")).unwrap();
    let bare = mor_core::identity::SigningKey { scheme: mor_core::act::Scheme::Founding(1), key: key.public().to_vec() };
    let (mut lab, label, owed, k1, _) = owed_back_lab(Some(Payer::Key(bare.clone())), b"anonymous gift");
    // The payer's claim, signed by a one-time identity, carrying the key's
    // signature and the refund rail.
    let mut once = lab.w.genesis("a one-time identity", vec![own_home()], None, None);
    let mut c = Claim {
        rail: spec("a rail Module"),
        proof: b"anonymous gift".to_vec(),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        disagrees: None,
        referral: None,
        refund: Some(Rail { module: spec("a rail Module"), address: b"the key's refund address".to_vec() }),
        anonymous: None,
        purchase: Some(Purchase { agreement: lab.founding, line: k1 }),
    };
    c.anonymous = Some(Anonymous { key: bare, sig: key.sign(&c.anonymous_message(&Citations::default()), &[0; 32]).sig });
    let a = lab.w.everyday_act(&mut once, mips().finance, 3, Fin::Claim(c).to_map(), None, None);
    let kc = lab.w.add(&a);
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1);
    // The collective's claim, naming the payment owed back, the rail's
    // proof showing it reached the refund address the key's claim gave.
    let mut payer = lab.c[0].clone();
    let back = payment(&mut lab, &mut payer, true, once.id, owed, spec("a unit"), 7, b"back to the key");
    lab.c[0] = payer;
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "no rail answer: nothing");
    lab.rail_valid.push((back, PaidAt::Flow(kc)));
    assert!(lab.view().owed_back(&label).unwrap().is_empty(), "repaid where the key's claim said");
}

/// The rollback of an `owed_back_lab` collective, then a closing every
/// member signs, leaving `open` open; the closing's reading, with
/// `lapsed` notices stated lapsed.
fn close_with(lab: &mut Lab, label: Hash, rot1: Hash, open: Vec<law::OpenOwed>, lapsed: &[Hash]) -> law::ClosingEval {
    let f = lab.founding;
    if lab.view().broken(&label).unwrap().is_some() {
        let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
        let r = lab.propose(ANA, &same);
        let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
        roll_back(lab, r, &rs, rot1, &[]);
    }
    let r = lab.view().current(&label).unwrap().unwrap().agreement;
    let c = law::Closing { agreement: r, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])], open };
    let eo = ending_obj(lab, r, label);
    let x = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let mut v = lab.view();
    v.notices_lapsed.extend(lapsed.iter().copied());
    v.closing(&x).unwrap()
}

/// QG1, decided by Nobody, allegedly, 9 October 2026: money owed back to
/// nobody (a payment that committed no key: unclaimable, Finance rule 10a)
/// stays open and visible, but does not block a closing: the closing act
/// names every such obligation it leaves open (field 4).
#[test]
fn qg1_money_owed_to_nobody_does_not_block_a_closing_that_names_it() {
    let owed_why = |e: &law::ClosingEval| e.why.iter().any(|w| w.contains("owed back"));
    let (mut lab, label, owed, _, rot1) = owed_back_lab(None, b"an anonymous tip");
    let e = close_with(&mut lab, label, rot1, vec![], &[]);
    assert!(owed_why(&e), "not named in the closing: it blocks ({:?})", e.why);
    let (mut lab, label, owed2, _, rot1) = owed_back_lab(None, b"an anonymous tip");
    let _ = owed;
    let e = close_with(&mut lab, label, rot1, vec![law::OpenOwed { payment: owed2, notice: None, holder: None }], &[]);
    assert!(!owed_why(&e), "named, owed to nobody: it does not block ({:?})", e.why);
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "and it stays visible");
}

/// F197, decided by Nobody, allegedly, 10 October 2026 ("Yes, exactly"):
/// before closing, a collective owing money back to a payer who gave no
/// address sends that payer a notice sealed to their identity, with a
/// deadline on a time reference; once it lapses with no address given, the
/// collective may close, the debt named in the closing act, visible and
/// unpaid. A holder outliving the closing may be named (a cMIP's role):
/// shown, not required.
#[test]
fn f197_a_notice_with_a_deadline_then_the_collective_may_close() {
    use mor_core::finance::Payer;
    let owed_why = |e: &law::ClosingEval| e.why.iter().any(|w| w.contains("owed back"));
    let carla = spec("Carla, a payer with no address");
    // Sealed to the payer and to every member (rule 35a), or public.
    let notice = |lab: &mut Lab, owed: Hash, to: Vec<Hash>| {
        let to: Vec<Hash> = to.into_iter().chain(lab.ids()).collect();
        let n = law::Notice { payment: owed, deadline: (spec("a block height reference"), Value::Uint(900_000)) };
        let mut dev = lab.c[0].clone();
        let x = lab.w.private_act(&mut dev, mips().law, law::types::NOTICE, n.to_map(), obj(owed), to);
        lab.c[0] = dev;
        x
    };
    // Named with no notice: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let e = close_with(&mut lab, label, rot1, vec![law::OpenOwed { payment: owed, notice: None, holder: None }], &[]);
    assert!(owed_why(&e), "{:?}", e.why);
    // A notice sealed to Carla, its deadline not passed: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let n = notice(&mut lab, owed, vec![carla]);
    let open = vec![law::OpenOwed { payment: owed, notice: Some(n), holder: None }];
    let e = close_with(&mut lab, label, rot1, open.clone(), &[]);
    assert!(owed_why(&e), "the deadline has not passed: {:?}", e.why);
    // Lapsed, as the time reference says: the collective may close.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let n = notice(&mut lab, owed, vec![carla]);
    let holder = spec("a holder that outlives the closing");
    let open = vec![law::OpenOwed { payment: owed, notice: Some(n), holder: Some(holder) }];
    let e = close_with(&mut lab, label, rot1, open, &[n]);
    assert!(!owed_why(&e), "{:?}", e.why);
    assert_eq!(e.closing.open[0].holder, Some(holder), "the holder chosen is shown");
    assert_eq!(lab.view().owed_back(&label).unwrap().len(), 1, "the debt stays visible, unpaid");
    // A notice sealed to someone else only reached nobody: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let n = notice(&mut lab, owed, vec![spec("someone else")]);
    let e = close_with(&mut lab, label, rot1, vec![law::OpenOwed { payment: owed, notice: Some(n), holder: None }], &[n]);
    assert!(owed_why(&e), "not sealed to the payer: {:?}", e.why);
}

// ---------------------------------------------------------------------------
// Fable's review of "EXPLORED, NOT DECIDED: a forked deal is broken, like a
// collective" (`docs/reviews/forked-deal-broken-review.md`, 10 October
// 2026). The shape is not built; these tests pin what the core answers
// today under F192, at the four places where the explored shape would
// answer differently. Each passes as the code stands. If the shape is ever
// built, the ones its text says must flip are named in the review.
// ---------------------------------------------------------------------------

/// Review question 2 (the stated cost). Today: a whole branch made at the
/// split by every party, hidden, and revealed after the settlement reopens
/// nothing (F192: "a whole branch the settlement never saw"). The explored
/// shape says the same branch "breaks the deal again": the deal would fall
/// back to its reference, and everything written into the repair would
/// need signing again. The verifier has no clock: nothing in `w` says when
/// C was made, which is the point.
#[test]
fn review_fdb_1_today_a_hidden_sibling_revealed_after_a_settlement_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A: Ben's share raised.", None);
    let b1 = l.version(d, "B: a retry Ben's client signed again.", None);
    // C: a third complete version of the reference, in Ana's drawer.
    let c1 = l.version(d, "C: another retry, kept back.", None);
    let s = l.version(a1, "Repaired for A, naming B, the only other branch anyone could see.", Some(b1));
    let s2 = l.version(s, "Life goes on under the repair: Ben delivers.", None);
    let before = held_without(&l.w, &[c1]);
    assert_eq!(LawView::new(&before, mips()).version_in_force(&d).unwrap(), s2, "before C surfaces: the repaired line is in force");
    // Ana publishes C.
    assert_eq!(l.in_force().unwrap(), s2, "today, under F192: C reopens nothing, Ben's raise stands");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none(), "today: not forked, not broken");
    // Under the explored shape the two lines above would read: in force =
    // d (the reference), deal broken, and Ana may refuse every repair.
}

/// Review question 1 (the new hole: the asymmetry). Today a version the
/// settlement's signers could not see loses whatever its parent is: a
/// child grown on the dropped branch (B2) and a sibling at the reference
/// (C1) are treated alike. The explored shape treats them differently:
/// B2 "grown on a closed tip counts for nothing", C1 "breaks the deal
/// again". Whoever hides a version therefore makes it a sibling, never a
/// child, and the shape's own protection against growth is sidestepped.
#[test]
fn review_fdb_2_today_a_hidden_child_and_a_hidden_sibling_lose_alike() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let b2 = l.version(b1, "B grows: hidden child of the dropped tip.", None);
    let c1 = l.version(d, "C: hidden sibling at the reference.", None);
    let s = l.version(a1, "Repaired for A, naming B1.", Some(b1));
    let before = held_without(&l.w, &[b2, c1]);
    assert_eq!(LawView::new(&before, mips()).version_in_force(&d).unwrap(), s);
    // Both surface.
    assert_eq!(l.in_force().unwrap(), s, "today: the hidden child and the hidden sibling lose alike (F192)");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none());
    // Under the explored shape: B2 counts for nothing (closed tip), and C1
    // re-breaks the deal to d. Same signatures, same ignorance of the
    // settlers, opposite outcomes, chosen by whoever hid the version.
}

/// Review question 8 (what the common case carries) and the pre-repair
/// escape hatch, which exists today and is DQ5's stated cost: a deal that
/// never visibly forked runs A1, A2, A3; a sibling of A1 surfaces; the
/// reference is in force and a party who refuses to settle keeps it there.
/// Today this ends with one settlement naming the sibling, and acts under
/// A3 kept counting meanwhile (A4). The explored shape keeps the first
/// half, voids A2 and A3 as versions, and never gives the second half the
/// finality F192 gives it (test 1).
#[test]
fn review_fdb_3_before_any_settlement_a_hidden_sibling_already_sends_the_deal_to_its_reference() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A1.", None);
    let a2 = l.version(a1, "A2.", None);
    let a3 = l.version(a2, "A3: Ben's share raised for more work.", None);
    let c1 = l.version(d, "C1: a sibling of A1, from a device out of step at the time.", None);
    let before = held_without(&l.w, &[c1]);
    assert_eq!(LawView::new(&before, mips()).version_in_force(&d).unwrap(), a3, "a deal that never visibly forked: A3 in force");
    // C1 surfaces, however late.
    assert_eq!(l.in_force().unwrap(), d, "today: forked at d, the reference in force (A1 beside A4)");
    let f = view(&l.w).deal_fork(&d).unwrap().expect("forked");
    assert!(f.tangled.is_none(), "a simple fork, not tangled");
    assert_eq!(f.branches.len(), 2);
    // A new version on A3 changes nothing while the fork stands; Ana can
    // hold the deal here by refusing to settle (DQ5's stated cost).
    let a4 = l.version(a3, "A4, signed by both without naming C1.", None);
    assert_eq!(l.in_force().unwrap(), d, "a version that does not name the other tip settles nothing");
    // One settlement naming C1 ends it, for good (F192), under today's rule.
    let s = l.version(a4, "Settled for A, naming C1.", Some(c1));
    assert_eq!(l.in_force().unwrap(), s);
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none());
}

/// Review question 1 (a repair of a repair) and question 3. Today a second
/// settling version made from the reference, naming the settled line's tip
/// as dropped, holds the first settlement in its history, is after it, and
/// changes nothing: a settlement is final (A3, F192). In the explored
/// shape a repair is a complete version whose parent is the reference and
/// which closes tips; a second such version closing the first repair's
/// tip is, by the shape's own test ("two complete versions naming the same
/// parent"), either a new break or an undo of a valid repair. The texts
/// have the first answer for a collective (F185: a rollback naming an act
/// Law does not read as broken is itself a broken act) and nothing yet for
/// a deal, where no single act is the broken one.
#[test]
fn review_fdb_4_today_a_second_settlement_from_the_reference_naming_the_first_changes_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Repaired for A, naming B.", Some(b1));
    let s2 = l.version(s, "Carla's work written in under the repair.", None);
    assert_eq!(l.in_force().unwrap(), s2);
    // A "repair of the repair": from the reference, closing the repaired
    // line's tip and B's, signed by both parties of the reference.
    let r2 = l.version_full(d, "From the reference again, closing S2 and B1 as mistakes.", vec![s2, b1], vec![]);
    assert_eq!(view(&l.w).agreement(&r2).unwrap().exists, Some(true), "complete: every party of the reference signed it");
    assert_eq!(l.in_force().unwrap(), s2, "today: it holds the first settlement in its history, is after it, and changes nothing");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none(), "today: the deal is neither forked nor broken by it");
    // Under the explored shape, r2 is a third complete child of d beside a1
    // and b1 (closed) and s's line: the deal reads as broken again or r2
    // undoes s. Neither is what A3 decided.
}
