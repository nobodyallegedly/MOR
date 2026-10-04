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

use common::{own_home, Person, Rot, World};
use mor_core::act::{Object, Ref};
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
    /// Acts no relay holds, as this verifier found them (F126): every other
    /// act held is found on the label's relay.
    hidden: std::collections::BTreeSet<Hash>,
}

/// The relay the label's terms name (field 25, F126).
fn label_relay() -> law::Relay {
    law::Relay { operator: None, hint: "https://relay.label.test".into() }
}

/// The verifier states it found `x` on the label's relay (F126, D2).
fn found(v: &mut LawView, x: Hash) {
    v.published.entry(x).or_default().push(label_relay());
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
            period: None,
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
        relays: Some(vec![label_relay()]),
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
        let c = vec![c0.clone(), c0.clone(), c0];
        Lab {
            w,
            m,
            c,
            founding,
            authority,
            keeper,
            keeper_logs: vec![],
            hidden: Default::default(),
        }
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
        for x in self.w.v.held_acts() {
            if !self.hidden.contains(&x.id) {
                found(&mut v, x.id);
            }
        }
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

    /// The label acknowledges an act, on device `d`.
    fn ack(&mut self, d: usize, x: Hash) -> Hash {
        self.w.ack(&mut self.c[d], x)
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
        let a = self.w.everyday_act(
            &mut self.c[d],
            mips().law,
            law::types::RECORD,
            r.to_map(),
            obj(named),
            acks,
        );
        self.w.add(&a)
    }

    /// A member's resignation, from a given device (a Person).
    fn resign_from(&mut self, dev: &mut Person, agreement: Hash, area: Option<u64>) -> Hash {
        let r = Resignation { agreement, area };
        law_act(&mut self.w, dev, law::types::RESIGNATION, r.to_map(), obj(agreement))
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
            *d = next.clone();
            d.seq = seq;
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
    // After it: under the clone, with the treasurer's signature.
    for x in [after, later_b, third] {
        assert_eq!(lab.in_force(&x), k);
        assert!(lab.counts(&x));
    }
    // A sequence the record does not name counts as after it, whatever a
    // payer's acknowledgement says (Flaw G).
    let mut payer = lab.w.genesis("payer", vec![own_home()], None, None);
    lab.w.ack(&mut payer, third);
    assert_eq!(lab.in_force(&third), k);

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
    lab.ack(0, sb2);

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
    assert_eq!(puts(&lab, &r2), Some(k2));
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
                lab.ack(0, sa);
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

/// 3.7c, 3.7m, Q13, Q17, Q22, Flaws H and N, A6, C8 (ordering story
/// `flaws_h_i_and_q30_grant_through_a_freeze`).
#[test]
fn an_area_freezes_and_its_grants_wait_for_the_refit() {
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
        limits: None,
        limits_cmip: None,
        area: Some(1),
        kinds: Some(vec![pubs.clone()]),
        reinstates: None,
        by_this: false,
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

    let under = |lab: &mut Lab, who: &mut Person, grant: Hash, spec: Hash| -> Hash {
        let a = lab.w.everyday_act_refs(who, spec, 0, vec![], None, None, Some(vec![Ref::Act(grant)]));
        lab.w.add(&a)
    };
    let p1 = under(&mut lab, &mut publisher, g1, env);
    assert_eq!(lab.view().backing(&p1).unwrap(), Backing::Backed { grant: g1 });
    // An act beyond the grant's reach is not backed.
    let off = under(&mut lab, &mut publisher, g1, pay());
    assert!(matches!(lab.view().backing(&off).unwrap(), Backing::NotBacked { .. }));
    // The agent's deals A, B, C; the label pays on B.
    let da = under(&mut lab, &mut agent, g2, env);
    let db = under(&mut lab, &mut agent, g2, env);
    let dc = under(&mut lab, &mut agent, g2, env);
    lab.ack(0, db);

    // Ana steps down at once; the label registers it: the area freezes.
    let mut ana = lab.m[ANA].clone();
    let res = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    let line = lab.record(0, None, &[], vec![res], f);
    let _ = line;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, true, false, vec![])]);
    let dd = under(&mut lab, &mut agent, g2, env);
    let p2 = under(&mut lab, &mut publisher, g1, env);
    let v = lab.view();
    assert_eq!(v.backing(&db).unwrap(), Backing::Binds { grant: g2 });
    for d in [da, dc, dd] {
        assert_eq!(v.backing(&d).unwrap(), Backing::Undetermined { grant: g2 });
    }
    assert_eq!(v.backing(&p1).unwrap(), Backing::Undetermined { grant: g1 }, "C8, stated cost");
    assert_eq!(v.backing(&p2).unwrap(), Backing::Undetermined { grant: g1 });
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
    assert_eq!(lab.view().backing(&p2).unwrap(), Backing::Undetermined { grant: g1 });
    // A reinstatement whose fields differ is invalid.
    let mut wrong = g(agent.id);
    wrong.reinstates = Some(g1);
    let rw = lab.grant(&wrong);
    lab.sign(CY, &rw);
    assert!(matches!(lab.consent(&rw), Consent::Invalid { .. }));
    // The reinstatement, after the refit, completed by the new holder.
    let mut again = g(publisher.id);
    again.reinstates = Some(g1);
    let re = lab.grant(&again);
    assert!(!lab.counts(&re));
    lab.sign(CY, &re);
    assert!(lab.counts(&re));
    for x in [p1, p2] {
        assert_eq!(lab.view().backing(&x).unwrap(), Backing::Backed { grant: re });
    }
    // The agent's grant, not reinstated: B binds, A, C and D wait.
    assert_eq!(lab.view().backing(&db).unwrap(), Backing::Binds { grant: g2 });
    assert_eq!(lab.view().backing(&dd).unwrap(), Backing::Undetermined { grant: g2 });
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
    assert!(!lab.counts(&x), "the replaced keeper places nothing");
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
    // A revocation (type 10): its format is open.
    let mut lab = Lab::new(&|_| {});
    let a = lab
        .w
        .everyday_act(&mut lab.c[0], mips().law, law::types::REVOCATION, vec![], None, None);
    let x = lab.w.add(&a);
    assert!(matches!(lab.view().consent(&x), Err(LawError::Unsupported(_))));
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
    ] {
        let mut lab = Lab::new(&|t| {
            t.abandonment = Some(Abandonment {
                authority: Authority::Others(2),
                outcomes: vec![outcomes::VOICE_REMOVED],
                period: None,
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
                    lab.ack(0, sb);
                }
                _ => {}
            }
            let r = lab.record_acking(0, None, &[], regs.clone(), f, acks.clone());
            if case == "acknowledged after" {
                lab.ack(0, sb);
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
                period: None,
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
            lab.ack(0, sc);
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
            period: None,
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
        relays: None,
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
                period: None,
            }),
            parent: None,
            grammar: None,
            arbitrators: None,
            split_grant: None,
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
            relays: None,
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
        abandonment: Some(Abandonment { authority, outcomes: vec![outcomes::VOICE_REMOVED], period: None }),
        parent: None,
        grammar: None,
        arbitrators: None,
        split_grant: None,
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
        relays: None,
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
    lab.w.add(&a)
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
    lab.w.add(&a)
}

/// A receipt paying `value` toward an obligation, signed by its payee.
fn receipt(w: &mut World, payee: &mut Person, payer: Hash, obligation: Hash, value: u64) -> Hash {
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

fn plain_grant(grantee: Hash, by_this: bool) -> Grant {
    Grant { grantee, scope: 2, agreements: None, limits: None, limits_cmip: None, area: None, kinds: None, reinstates: None, by_this }
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
    let f = lab.founding;
    let ids = lab.ids();
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
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
    // Rounding: 901 leaves 801 to divide; the leftover unit to the first.
    let r2 = receipt(&mut lab, &mut svc, 901);
    let x = lab.w.private_act(&mut svc, mips().law, law::types::SPLIT, split(r2, 321, 240, 240).to_map(), None, everyone.clone());
    assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
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
        t.chain = Some(vec![law::ChainLink { judge: law::Judge::SplitService, next: vec![(g2, 30)] }]);
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
        relays: None,
    };
    let d = law_act(&mut lab.w, &mut lab.m[ANA], law::types::TERMS, deal.to_map(), None);
    let got = lab.view().payer_split(&d, &Who::Id(work), 1000).unwrap().unwrap();
    assert_eq!(got, vec![(ids[ANA], 300), (ids[BEN], 150), (ids[CY], 150), (guest.id, 400)]);
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
    let p = lab.w.genesis_with(name, vec![own_home()], None, None, Some(vec![law::founding_declaration(&mips().law, &x)]), 3);
    (p, x)
}

/// Freeze suite v21, 3.9 (F121 shape B, F124 N1 to N4, N13, N14): the fork
/// of a collective. Each side founds its successor first; the fork act names
/// them; every member signs under the constitutional rule (every party
/// here); the original is closed in Law; its ownership passes to the
/// successors by the members' stakes; the departed holder keeps their share
/// in each; every obligation is assigned, each successor signing for its
/// debts; grants end; open offers are withdrawn, a stray payment to the old
/// service being its open debt to the successors. 3.9g (F125, D1): a hidden
/// debt surfacing after the fork is owed by every successor, the fork
/// standing; a successor cannot close while it owes it (D5).
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
    let g = lab.grant(&Grant { scope: 0, ..plain_grant(agent.id, false) });
    let deal = {
        let a = lab.w.everyday_act_refs(&mut agent, spec("a deal cMIP"), 0, vec![(Value::Uint(0), Value::Text("a deal".into()))], None, None, Some(vec![Ref::Act(g)]));
        lab.w.add(&a)
    };
    let d1 = obligation(&mut lab, "a supplier", 900);
    let d2 = obligation(&mut lab, "another supplier", 300);
    let mut hidden = lab.w.genesis("a creditor kept out of sight", vec![own_home()], None, None);
    let d3 = obligation_to(&mut lab, hidden.id, 50);
    lab.hidden.insert(d3);
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
    // Every debt assigned: d1 to side B, d2 to both jointly.
    let x = fork(&lab, vec![(d1, vec![1]), (d2, vec![0, 1])]);
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), obj(k));
    lab.sign(BEN, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "Cy has not signed");
    lab.sign(CY, &fa);
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
    assert_eq!(e.shares, vec![333_334, 666_666]);
    assert_eq!(e.kept, vec![(dee, 250_000)]);
    assert!(!e.by_count);
    assert!(e.unassigned.is_empty());
    let idx = v.terms(&k).unwrap().stake_on(&Who::Id(work)).unwrap().0 as u64;
    assert_eq!(v.fork_transfer(&fa, &k, idx).unwrap(), Some(vec![333_334, 666_666]));
    // d3, never published, binds nothing and blocked nothing.
    assert_eq!(v.obligation_binds(&d3).unwrap(), Some(false));
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
    assert_eq!(lab.view().backing(&deal).unwrap(), Backing::Undetermined { grant: g });
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
    // A payment naming the claim as it stood before the fork: superseded by
    // the fork, and whether it was paid before or after cannot be told
    // (flaw W2): undetermined, never a purchase nor a refund by default.
    let stale = pay(&mut lab, &mut svc, Some(mor_core::finance::Purchase { agreement: f, line: k }));
    let got = lab.view().purchase(&stale).unwrap().unwrap();
    assert_eq!(got.verdict, law::PurchaseVerdict::Superseded { by: fa });
    // Naming the fork, at which the claim now stands: a purchase.
    let current = pay(&mut lab, &mut svc, Some(mor_core::finance::Purchase { agreement: f, line: fa }));
    assert_eq!(lab.view().purchase(&current).unwrap().unwrap().verdict, law::PurchaseVerdict::Purchase);
    // Naming a line that is none of the agreement's claims: no purchase.
    let wrong = pay(&mut lab, &mut svc, Some(mor_core::finance::Purchase { agreement: f, line: d1 }));
    assert!(matches!(lab.view().purchase(&wrong).unwrap().unwrap().verdict, law::PurchaseVerdict::NoPurchase { .. }));
    // 3.9g (F125, D1): the hidden debt surfaces, published by its creditor
    // after the fork. A complete fork is never undone over a debt: it
    // stands, and every successor owes the debt jointly.
    let mut v = lab.view();
    found(&mut v, d3);
    let e = v.fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.unassigned, vec![d3]);
    assert_eq!(v.current(&label).unwrap().unwrap().closed, Some(fa));
    assert_eq!(v.debtors(&d3).unwrap(), Some(vec![sa.id, sb.id]));
    assert_eq!(sorted(v.owes(&sa.id).unwrap()), sorted(vec![d2, d3]));
    assert_eq!(sorted(v.owes(&sb.id).unwrap()), sorted(vec![d1, d2, d3]));
    drop(v);
    // D5: side A's successor, holding nothing here, cannot close while it
    // owes d2 (jointly) and d3 (every successor).
    let sa_terms = ta;
    let closing = law::Closing { agreement: sa_terms, collective: sa.id, chain_act: sa.binding, tips: vec![tip(&sa)] };
    let cl = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, closing.to_map(), obj(sa_terms));
    let mut v = lab.view();
    found(&mut v, d3);
    let e = v.closing(&cl).unwrap();
    assert!(!e.complete);
    assert_eq!(sorted(e.open_debts.clone()), sorted(vec![d2, d3]), "{:?}", e.why);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("D5")), "{:?}", e.why);
    drop(v);
    // Side B pays d2 in full; d3's creditor releases it, taking nothing.
    let mut supplier = lab.w.genesis("another supplier's till", vec![own_home()], None, None);
    receipt(&mut lab.w, &mut supplier, sb.id, d2, 300);
    debt_release(&mut lab.w, &mut hidden, d3, vec![]);
    let mut v = lab.view();
    found(&mut v, d3);
    assert_eq!(v.owes(&sa.id).unwrap(), Vec::<Hash>::new());
    assert_eq!(v.owes(&sb.id).unwrap(), vec![d1]);
    let e = v.closing(&cl).unwrap();
    assert!(e.complete, "{:?}", e.why);
}

/// Freeze suite v21, 3.9g (F125, D1): a fork that leaves a published debt
/// unassigned still takes effect; every successor owes that debt jointly.
/// Assigning every known debt is each member's client's duty, never a
/// condition of the fork.
#[test]
fn a_fork_leaving_a_debt_unassigned_stands() {
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
    let (mut sa, _) = found_successor(&mut lab, "side A", &[ANA], &[], label);
    let (sb, _) = found_successor(&mut lab, "side B", &[BEN, CY], &[], label);
    let x = law::Fork {
        agreement: f,
        collective: label,
        chain_act: lab.c[0].binding,
        tips: vec![tip(&lab.c[0])],
        sides: vec![law::Side { successor: sa.id, members: vec![ids[ANA]] }, law::Side { successor: sb.id, members: vec![ids[BEN], ids[CY]] }],
        shares: vec![],
        debts: vec![(d1, vec![0])],
    };
    let fk = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), obj(f));
    lab.sign(BEN, &fk);
    lab.sign(CY, &fk);
    sign(&mut lab.w, &mut sa, &fk);
    let v = lab.view();
    let e = v.fork(&fk).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.unassigned, vec![d2]);
    assert_eq!(v.current(&label).unwrap().unwrap().closed, Some(fk));
    assert_eq!(v.debtors(&d1).unwrap(), Some(vec![sa.id]));
    assert_eq!(v.debtors(&d2).unwrap(), Some(vec![sa.id, sb.id]));
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
    let bad = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x(sbad.id).to_map(), obj(f));
    lab.sign(BEN, &bad);
    let e = lab.view().fork(&bad).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("N4")), "{:?}", e.why);
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x(sb.id).to_map(), obj(f));
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "Ben has not signed: Ana alone does not meet two of three");
    lab.sign(BEN, &fa);
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
        let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), obj(ag));
        for i in [BEN, CY] {
            lab.sign(i, &fa);
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
    let fa = law_act(&mut lab.w, &mut lab.m[ANA], law::types::FORK, x.to_map(), obj(f));
    lab.sign(BEN, &fa);
    lab.sign(CY, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(e.by_count);
    assert_eq!(e.shares, vec![666_667, 333_333]);
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    // A second complete fork, signed concurrently: the status quo stands.
    let z = law::Fork { sides: vec![side(&sb, vec![ids[CY]]), side(&sa, vec![ids[ANA], ids[BEN]])], ..x };
    let fb = law_act(&mut lab.w, &mut lab.m[CY], law::types::FORK, z.to_map(), obj(f));
    lab.sign(ANA, &fb);
    lab.sign(BEN, &fb);
    assert!(lab.view().fork(&fb).unwrap().complete);
    assert_eq!(lab.view().endings(&label).unwrap().len(), 2);
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, None);
    assert!(lab.counts(&p));
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
        relays: None,
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
            relays: None,
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
    let closing = |lab: &Lab| law::Closing { agreement: f, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])] };
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let x = closing(&lab);
    let early = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, x.to_map(), obj(f));
    lab.sign(BEN, &early);
    lab.sign(CY, &early);
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
    let c1 = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, x.to_map(), obj(f));
    lab.sign(BEN, &c1);
    lab.sign(CY, &c1);
    let v = lab.view();
    let e = v.closing(&c1).unwrap();
    assert!(e.holds.is_empty());
    assert_eq!(sorted(e.open_debts.clone()), sorted(vec![d, d2]));
    assert!(!e.complete);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("cannot close while it owes anything")), "{:?}", e.why);
    drop(v);
    // The supplier is paid in full; the printer is paid 30 of 80.
    receipt(&mut lab.w, &mut supplier, label, d, 100);
    let part = receipt(&mut lab.w, &mut printer, label, d2, 30);
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
    fn view2(lab: &Lab, d: Hash) -> LawView<'_> {
        let mut v = lab.view();
        found(&mut v, d);
        v
    }
    let owes = |lab: &Lab| -> Vec<Hash> { view2(lab, d).owes(&lab.c[0].id).unwrap() };
    assert_eq!(owes(&lab), vec![d]);
    // It pays what it can: 300 of 1,000. The debt stays open, visible.
    let part = receipt(&mut lab.w, &mut lender, label, d, 300);
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
    let x = law::Closing { agreement: k, collective: label, chain_act: lab.c[0].binding, tips: vec![tip(&lab.c[0])] };
    let c = law_act(&mut lab.w, &mut lab.m[ANA], law::types::CLOSING, x.to_map(), obj(k));
    lab.sign(BEN, &c);
    lab.sign(CY, &c);
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

/// Freeze suite v21, 3.9i (F126, item 1): an act in a collective's name is
/// done, and binds it, only once sealed to every member and its outside is
/// found on one of the relays its terms name; before that, even signed, it
/// binds no one. A public act is readable by every member. One named relay
/// is enough. A grantee's act is held to the same.
#[test]
fn an_act_in_the_collectives_name_is_done_only_once_sealed_and_on_its_relays() {
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
        lab.w.private_act(&mut lab.c[0], mips().finance, 1, o.to_map(), None, to)
    };
    // Sealed to the creditor alone, found on the label's relay: not done.
    let secret = debt(&mut lab, vec![creditor.id]);
    let v = lab.view();
    assert_eq!(v.obligation_binds(&secret).unwrap(), Some(false));
    assert!(v.done(&secret).unwrap().unwrap().unwrap_err().contains("sealed to every member"));
    assert!(matches!(v.consent(&secret).unwrap(), Consent::NotDone { .. }));
    drop(v);
    // Sealed to the creditor and every member, but found on no relay the
    // terms name: still planning, binding no one.
    let mut all = vec![creditor.id];
    all.extend(ids.iter().copied());
    let open = debt(&mut lab, all);
    lab.hidden.insert(open);
    let mut v = lab.view();
    assert_eq!(v.obligation_binds(&open).unwrap(), Some(false));
    v.published.entry(open).or_default().push(law::Relay { operator: None, hint: "https://elsewhere.test".into() });
    assert_eq!(v.obligation_binds(&open).unwrap(), Some(false), "a relay the terms do not name");
    assert!(v.done(&open).unwrap().unwrap().unwrap_err().contains("relay"));
    // Found on the label's relay: done, and it binds.
    found(&mut v, open);
    assert_eq!(v.done(&open).unwrap(), Some(Ok(())));
    assert_eq!(v.obligation_binds(&open).unwrap(), Some(true));
    drop(v);
    // A public act is readable by every member: on the relay, done; a
    // publication not found on it counts for nothing yet.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p));
    lab.hidden.insert(p);
    assert!(matches!(lab.consent(&p), Consent::NotDone { .. }));
    lab.hidden.remove(&p);
    // A grantee's act in the label's name: the same condition.
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let g = lab.grant(&plain_grant(agent.id, false));
    let deal = {
        let a = lab.w.everyday_act_refs(&mut agent, spec("a deal cMIP"), 0, vec![(Value::Uint(0), Value::Text("a deal".into()))], None, None, Some(vec![Ref::Act(g)]));
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&deal).unwrap(), Backing::Backed { grant: g });
    lab.hidden.insert(deal);
    assert!(matches!(lab.view().backing(&deal).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("F126")));
    // Not a collective's act: the condition does not apply.
    assert_eq!(lab.view().done(&creditor.id).ok().flatten(), None);
}

/// F126: the relays are an operational term (field 25), changed by the
/// clone rule like any other; an act found only on the new relay is done
/// once the clone is in force. A collective's terms name relays; a deal's
/// never.
#[test]
fn a_collectives_relays_change_like_any_term() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let new = law::Relay { operator: Some(spec("a relay operator")), hint: "https://new.test".into() };
    let n2 = new.clone();
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.relays = Some(vec![n2.clone()]));
    assert_eq!(lab.view().powers_needed(&t).unwrap(), vec![Power::Clone]);
    let k = lab.propose(ANA, &t);
    let s = vec![lab.sign(ANA, &k), lab.sign(BEN, &k)];
    lab.record(0, Some((k, s)), &[], vec![], k);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    lab.hidden.insert(p);
    let mut v = lab.view();
    assert!(matches!(v.consent(&p).unwrap(), Consent::NotDone { .. }));
    // Found on the old relay: no longer named.
    found(&mut v, p);
    assert!(matches!(v.consent(&p).unwrap(), Consent::NotDone { .. }));
    // Found on a relay of the same operator, at another address: the
    // operator is what counts.
    v.published.entry(p).or_default().push(law::Relay { operator: Some(spec("a relay operator")), hint: "https://moved.test".into() });
    assert!(v.consent(&p).unwrap().counts());
    drop(v);
    // Terms: a collective without relays, or a deal with them, are invalid.
    let ids = lab.ids();
    let mut no_relays = label_terms(&ids, lab.authority.id, lab.keeper.id, &|_| {});
    no_relays.relays = None;
    assert!(no_relays.check(&mips()).is_err());
    let mut deal = no_relays.clone();
    deal.grammar = None;
    deal.areas = None;
    deal.area_words = None;
    deal.clone = Rule::All;
    deal.abandonment = None;
    deal.relays = Some(vec![new]);
    assert!(deal.check(&mips()).unwrap_err().to_string().contains("F126"));
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
