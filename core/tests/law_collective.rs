//! Law draft 7 on a collective's own sequences (F109): freeze suite v18,
//! scenario 3 (the label), its step 7o (the ordering stories, each named
//! after its test in `harness/ordering/tests/stories.rs`), and scenario 1
//! (the film, a deal).
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
    self, outcomes, Abandonment, Area, Authority, Backing, CloneState, Consent, Field4, Grant,
    Holding, KeyGrammar, Keepers, Kind, LawError, LawView, MarkEntry, Mips, Power, Record,
    Recovery, Resignation, Rule, Terms,
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
                    signers: who.iter().map(|i| ids[*i]).collect(),
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

    /// A receipt of the label, on device `d`, of a payment cMIP.
    fn receipt(&mut self, d: usize, cmip: Hash) -> Hash {
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
            None,
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
        let kept: Vec<KeptTip> = tips_of
            .iter()
            .filter(|i| !self.c[**i].seq.is_empty())
            .map(|i| tip(&self.c[*i]))
            .collect();
        let (id, next) = self.w.rotate(
            &self.c[0],
            Rot {
                kept: Some(kept),
                declarations: decl
                    .map(|(k, s)| vec![law::clone_declaration(&mips().law, &k, &s)]),
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
    let r = lab.receipt(0, pay());
    assert!(!lab.counts(&r));
    lab.sign(BEN, &r);
    assert_eq!(areas(&lab.consent(&r)), vec![(2, false, true, vec![ben])]);
    // A cMIP the terms name nowhere: counts for nothing (Q16).
    let x = lab.receipt(0, pay2());
    lab.sign(BEN, &x);
    assert!(matches!(lab.consent(&x), Consent::Unadopted { .. }));
    // An act of the adopted extension: the Production lane's (F106).
    let e = lab.receipt(0, ext());
    lab.sign(ANA, &e);
    assert_eq!(areas(&lab.consent(&e)), vec![(1, false, true, vec![ana])]);
    // In a collective with no area, the same receipt counts on the
    // collective's own signature.
    let mut plain = Lab::new(&|t| {
        t.areas = None;
        t.area_words = None;
    });
    let x = plain.receipt(0, pay2());
    assert!(matches!(plain.consent(&x), Consent::NoArea { .. }));
    // An identity declaring no agreement is not a collective.
    let mut solo = plain.w.genesis("solo", vec![own_home()], None, None);
    let post = plain.w.post(&mut solo, "hello");
    assert_eq!(plain.view().consent(&post).unwrap(), Consent::NotCollective);
}

/// 3.7g, rule 37c, A2, F109: the treasurer adopts a payment cMIP alone;
/// the label records it at once; the record's place decides.
#[test]
fn the_treasurer_adopts_a_cmip_and_the_record_places_it() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let before = lab.receipt(0, pay2());
    let in_tip = lab.receipt(1, pay2());
    let third = lab.receipt(2, pay2());
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
    let after = lab.receipt(0, pay2());
    lab.sign(BEN, &after);
    let later_b = lab.receipt(1, pay2());
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
    let x = lab.receipt(0, pay3());
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

    // 3.7f: two of three change the arbitrator under the clone rule.
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), Some(k2));

    // 3.7l, Q12: the manager's words and the keepers: both powers.
    let t = lab.clone_terms(&k2, vec![(Power::Area(1), vec![ANA])], &|t| {
        words(t, 1, "Tuesdays.");
        t.keepers = None;
    });
    let k3 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k3).unwrap().invalid.is_some());
    let t = lab.clone_terms(
        &k2,
        vec![(Power::Clone, vec![BEN, CY]), (Power::Area(1), vec![ANA])],
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

    let x1 = lab.receipt(0, pay());
    lab.sign(BEN, &x1); // phone
    let x2 = lab.receipt(0, pay());
    sign(&mut lab.w, &mut ben_tablet, &x2); // tablet, never mentioned

    // A clone signed from the tablet, recorded before the line (Flaw F).
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = sign(&mut lab.w, &mut ben_tablet, &k);
    let r0 = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r0), Some(k));

    // Q23 and C2: a clone under the clone rule, two of three; Ben signs and
    // the label acknowledges it as it arrives.
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator two")]);
    });
    let k2 = lab.propose(CY, &t);
    let sb2 = sign(&mut lab.w, &mut ben_tablet, &k2);
    lab.ack(0, sb2);

    // Ben resigns, from the laptop.
    let res = lab.resign_from(&mut ben_laptop, k, None);
    // Between the resignation and the line, his signature still counts.
    let x3 = lab.receipt(0, pay());
    lab.sign(BEN, &x3);
    let pending = lab.receipt(0, pay());
    // The label's line.
    let line = lab.record(0, None, &[], vec![res], k);
    let e = lab.view().record(&lab.c[0].id, &line).unwrap();
    assert!(e.line && e.registers.len() == 1);

    let x4 = lab.receipt(0, pay());
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

    // C2: Cy signs after the line; a record names both: Ben counts as a
    // voice for it, the label having acknowledged his signature first.
    let sc2 = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sb2, sc2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r2), Some(k2));
    // A third clone Ben signed but the label never acknowledged, recorded
    // after the line: his signature counts toward nothing.
    let t = lab.clone_terms(&k2, vec![(Power::Clone, vec![BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator three")]);
    });
    let k3 = lab.propose(CY, &t);
    let sb3 = sign(&mut lab.w, &mut ben_tablet, &k3);
    let sc3 = lab.sign(CY, &k3);
    let r3 = lab.record(0, Some((k3, vec![sb3, sc3])), &[], vec![], k3);
    assert!(matches!(clone_state(&lab, &r3), CloneState::Invalid(_)));
    // ... and the clone needs the voices that remain: Ana and Cy.
    let t = lab.clone_terms(&k2, vec![(Power::Clone, vec![ANA, CY])], &|t| {
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
    let x = lab.receipt(0, pay());
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
        let r = lab.receipt(0, pay());
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
/// `q23_signature_placed_before_leaving`): a resignation stands in for the
/// declaration of absence, whose format is open.
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
            let x = lab.receipt(0, pay());
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
    let r = lab.receipt(0, pay());
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
    let x = lab.receipt(0, pay());
    lab.record(0, None, &[], vec![res], f);
    let y = lab.receipt(0, pay());
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
    let x_named = lab.receipt(0, pay());
    let x_unnamed = lab.receipt(0, pay());
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
    let x = lab.receipt(2, pay());
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
    let x = lab.receipt(1, pay());
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
    let x = lab.receipt(1, pay());
    lab.sign(BEN, &x);
    let k2 = lab.w.genesis("keeper two", vec![own_home()], None, None);
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN, CY])], &|t| {
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
    lab.receipt(0, pay()); // the phone signs something first, to keep a tip
    let p0 = lab.m[BEN].clone();
    let x = lab.receipt(0, pay());
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
    let y = lab.receipt(0, pay());
    sign(&mut lab.w, &mut tablet, &y);
    assert!(!lab.counts(&y));
    lab.sign(BEN, &y);
    assert!(lab.counts(&y), "the new key does");
}

// ---------------------------------------------------------------- open formats

#[test]
fn open_formats_are_refused_not_guessed() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    // A record registering an abandonment declaration (type 13).
    let mut auth = lab.authority.clone();
    let d = law_act(&mut lab.w, &mut auth, law::types::DECLARATION, vec![], obj(f));
    let _ = d;
    let mut cy = lab.m[CY].clone();
    let decl = law_act(&mut lab.w, &mut cy, law::types::DECLARATION, vec![], obj(f));
    let r = lab.record(0, None, &[], vec![decl], f);
    assert!(matches!(
        lab.view().record(&lab.c[0].id, &r),
        Err(LawError::Unsupported(_))
    ));
    // A mark naming a succession plan.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    let mut t = lab.clone_terms(&f, vec![], &|_| {});
    t.field4 = Field4::Mark(vec![MarkEntry {
        power: Power::Plan(ids[CY]),
        signers: vec![ids[ANA]],
    }]);
    let k = lab.propose(ANA, &t);
    assert!(matches!(lab.view().agreement(&k), Err(LawError::Unsupported(_))));
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
        signers: ids.clone(),
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
        signers: ids[..2].to_vec(),
    }]);
    let k2 = law_act(&mut w, &mut m[0], law::types::TERMS, c2.to_map(), obj(d));
    assert!(view(&w).agreement(&k2).unwrap().invalid.is_some());
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
    let x = lab.receipt(0, conv);
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
    let e = lab.receipt(0, fin);
    lab.sign(ANA, &e);
    assert!(lab.counts(&e));
}
