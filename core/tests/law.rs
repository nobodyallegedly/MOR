//! Law draft 6 (roadmap step 5a): the formats of terms, signatures, clones
//! and key grammars, the key grammar's way to rotate (rule 36, F96), and a
//! collective whose publications need visible member signatures, judged
//! under the agreement its own chain declares at each act's binding (F100).

mod common;

use common::{own_home, Person, Rot, World};
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::hash::{sha256, Hash};
use mor_core::law::{
    self, outcomes, Abandonment, Authority, Consent, Holding, KeyGrammar, LawError, LawView,
    Listed, Recovery, Rule, SuccessionPlan, Terms,
};

fn law_spec() -> Hash {
    sha256(b"LAW, test value until the freeze")
}

fn envelope_spec() -> Hash {
    sha256(b"ENVELOPE, test value until the freeze")
}

fn manifest_spec() -> Hash {
    sha256(b"a release manifest cMIP")
}

fn h(n: u8) -> Hash {
    [n; 32]
}

/// A founding agreement for three members: the signing key with the first,
/// the safety key as shares, any two of three; publications need any two
/// members' visible signatures.
fn founding(parties: &[Hash]) -> Terms {
    Terms {
        parties: parties.to_vec(),
        text: "The test collective publishes releases of the MOR code.".into(),
        cmips: vec![],
        keepers: None,
        signing: Rule::All,
        clone: Rule::Threshold(2),
        time: None,
        abandonment: Some(Abandonment {
            authority: Authority::Others(2),
            outcomes: vec![outcomes::VOICE_REMOVED],
            period: None,
        }),
        parent: None,
        grammar: Some(KeyGrammar {
            signing: Holding::One(parties[0]),
            safety: Holding::Shares {
                threshold: 2,
                members: parties.to_vec(),
            },
            listed: Some(vec![Listed {
                spec: envelope_spec(),
                type_: 0,
                rule: Rule::Threshold(2),
            }]),
            recovery: None,
        }),
        arbitrators: None,
        split_grant: None,
        extensions: Some(vec![manifest_spec()]),
        succession: None,
    }
}

fn roundtrip(t: &Terms) -> Terms {
    let bytes = mor_core::cbor::encode(&Value::Map(t.to_map()));
    let Value::Map(m) = mor_core::cbor::decode(&bytes).unwrap() else {
        panic!()
    };
    Terms::decode(&m).unwrap()
}

// ---------------------------------------------------------------- formats

#[test]
fn terms_round_trip_and_decode_strictly() {
    let t = founding(&[h(1), h(2), h(3)]);
    assert_eq!(roundtrip(&t), t);
    t.check().unwrap();

    let mut m = t.to_map();
    m.push((Value::Uint(18), Value::Uint(0)));
    assert!(matches!(Terms::decode(&m), Err(LawError::Shape(_))));

    for (k, what) in [
        (7, "stakes"),
        (8, "split plan"),
        (10, "fork rule"),
        (17, "refund"),
    ] {
        let mut m = t.to_map();
        m.push((Value::Uint(k), Value::Array(vec![])));
        let e = Terms::decode(&m).unwrap_err();
        assert!(
            matches!(e, LawError::Unsupported(w) if w.contains(what)),
            "{e}"
        );
    }

    let mut m = t.to_map();
    m.retain(|(k, _)| *k != Value::Uint(5));
    assert!(
        matches!(Terms::decode(&m), Err(LawError::Shape(_))),
        "the clone rule is required"
    );
}

#[test]
fn rules_fit_the_parties() {
    let p = [h(1), h(2), h(3)];
    let mut t = founding(&p);
    t.clone = Rule::Threshold(4);
    assert!(t.check().is_err());
    t.clone = Rule::Threshold(0);
    assert!(t.check().is_err());
    t.clone = Rule::Named(vec![h(1), h(9)]);
    assert!(t.check().is_err(), "a named party must be a party");
    t.clone = Rule::Named(vec![h(1), h(3)]);
    t.check().unwrap();

    let mut t = founding(&p);
    t.parties = vec![h(1), h(2), h(1)];
    assert!(t.check().is_err(), "a party twice");

    let mut t = founding(&p);
    t.cmips = vec![(8, h(8)), (8, h(9))];
    assert!(t.check().is_err(), "one cMIP per task");
    t.cmips = vec![(14, h(8))];
    assert!(t.check().is_err(), "no task 14");
    t.cmips = vec![(8, h(8)), (10, h(9))];
    t.check().unwrap();

    assert!(Rule::Threshold(2).met(&p, &[h(3), h(1)]));
    assert!(
        !Rule::Threshold(2).met(&p, &[h(3), h(9)]),
        "a non-party never counts"
    );
    assert!(!Rule::All.met(&p, &[h(1), h(2)]));
    assert!(Rule::Named(vec![h(2)]).met(&p, &[h(2)]));
}

#[test]
fn a_grammar_leaves_a_way_to_rotate_that_survives_any_one_loss() {
    let p = [h(1), h(2), h(3)];
    let with = |safety: Holding, recovery: Option<Recovery>| {
        let mut t = founding(&p);
        let g = t.grammar.as_mut().unwrap();
        g.safety = safety;
        g.recovery = recovery;
        t
    };

    // Two of three: any one lost, two remain.
    with(
        Holding::Shares {
            threshold: 2,
            members: p.to_vec(),
        },
        None,
    )
    .check()
    .unwrap();

    // Every member needed and no recovery path: invalid (rule 36).
    let e = with(
        Holding::Shares {
            threshold: 3,
            members: p.to_vec(),
        },
        None,
    )
    .check()
    .unwrap_err();
    assert!(e.to_string().contains("recovery"), "{e}");

    // Every member, with an escrowed share released by the named authority (scenario 3).
    let mut t = with(
        Holding::Shares {
            threshold: 3,
            members: p.to_vec(),
        },
        Some(Recovery::Escrow { authority: h(7) }),
    );
    assert!(t.check().is_err(), "the clause must name that authority");
    t.abandonment = Some(Abandonment {
        authority: Authority::Named(h(7)),
        outcomes: vec![outcomes::VOICE_REMOVED],
        period: None,
    });
    t.check().unwrap();

    // F96, freeze test suite v15 scenario 3: one holder, no successor: rejected.
    let e = with(Holding::One(h(1)), None).check().unwrap_err();
    assert!(e.to_string().contains("F96"), "{e}");
    let mut t = with(
        Holding::One(h(1)),
        Some(Recovery::Escrow { authority: h(7) }),
    );
    t.abandonment = Some(Abandonment {
        authority: Authority::Named(h(7)),
        outcomes: vec![outcomes::VOICE_REMOVED],
        period: None,
    });
    let e = t.check().unwrap_err();
    assert!(e.to_string().contains("successor"), "{e}");
    // …with a seat successor and the escrowed share: valid.
    t.succession = Some(vec![SuccessionPlan {
        party: h(1),
        stakes: None,
        seats: Some(vec![(h(2), 1)]),
        entry: Some(0),
    }]);
    t.check().unwrap();

    // A single custodian has the same flaw.
    let c = Holding::Custodian {
        custodian: h(5),
        grant: h(6),
    };
    assert!(with(c.clone(), None).check().is_err());
    assert!(with(
        c.clone(),
        Some(Recovery::Custodian {
            custodian: h(5),
            grant: h(6)
        })
    )
    .check()
    .is_err());
    with(
        c,
        Some(Recovery::Custodian {
            custodian: h(8),
            grant: h(9),
        }),
    )
    .check()
    .unwrap();
}

#[test]
fn abandonment_clause_and_succession_are_checked() {
    let p = [h(1), h(2), h(3)];
    let mut t = founding(&p);
    t.abandonment.as_mut().unwrap().authority = Authority::Others(3);
    assert!(t.check().is_err(), "at most the other parties");
    let mut t = founding(&p);
    t.abandonment.as_mut().unwrap().outcomes = vec![4, 0];
    assert!(t.check().is_err(), "outcomes ascending");
    let mut t = founding(&p);
    t.abandonment.as_mut().unwrap().period = Some(1000);
    assert!(t.check().is_err(), "a period needs a time reference");
    t.time = Some((h(10), Value::Uint(0)));
    t.check().unwrap();

    let mut t = founding(&p);
    t.succession = Some(vec![SuccessionPlan {
        party: h(2),
        stakes: Some(vec![(h(8), 500_000), (h(9), 499_999)]),
        seats: None,
        entry: None,
    }]);
    assert!(t.check().is_err(), "stake shares sum exactly");
    t.succession.as_mut().unwrap()[0].stakes = Some(vec![(h(8), 500_000), (h(9), 500_000)]);
    t.check().unwrap();
    let back = roundtrip(&t);
    assert_eq!(back, t);
}

// ---------------------------------------------------------------- a collective

struct Collective {
    w: World,
    members: Vec<Person>,
    c: Person,
    founding: Hash,
}

fn self_hosted(w: &mut World, name: &str) -> Person {
    w.genesis(name, vec![own_home()], None, None)
}

fn law_act(
    w: &mut World,
    p: &mut Person,
    type_: u64,
    payload: Vec<(Value, Value)>,
    objects: Option<Vec<Object>>,
) -> Hash {
    let a = w.everyday_act(p, law_spec(), type_, payload, objects, None);
    w.add(&a)
}

fn propose(w: &mut World, p: &mut Person, t: &Terms) -> Hash {
    let objects = t.parent.map(|parent| {
        vec![Object {
            chain: parent,
            predecessor: parent,
        }]
    });
    law_act(w, p, law::types::TERMS, t.to_map(), objects)
}

fn sign(w: &mut World, p: &mut Person, act: &Hash) -> Hash {
    law_act(
        w,
        p,
        law::types::SIGNATURE,
        law::signature_payload(act),
        Some(vec![Object {
            chain: *act,
            predecessor: *act,
        }]),
    )
}

/// A publication by the collective (the act a release manifest is).
fn publish(w: &mut World, c: &mut Person, what: &str) -> Hash {
    let a = w.everyday_act(
        c,
        envelope_spec(),
        0,
        vec![(Value::Uint(0), Value::Text(what.into()))],
        None,
        None,
    );
    w.add(&a)
}

fn setup(sign_all: bool) -> Collective {
    let mut w = World::new();
    let mut members: Vec<Person> = ["m1", "m2", "m3"]
        .iter()
        .map(|n| self_hosted(&mut w, n))
        .collect();
    let ids: Vec<Hash> = members.iter().map(|m| m.id).collect();
    let founding = propose(&mut w, &mut members[0], &founding(&ids));
    let signing = if sign_all { 3 } else { 2 };
    for m in members.iter_mut().take(signing) {
        sign(&mut w, m, &founding);
    }
    let c = w.genesis_with(
        "collective",
        vec![own_home()],
        None,
        None,
        Some(vec![law::founding_declaration(&law_spec(), &founding)]),
        3,
    );
    Collective {
        w,
        members,
        c,
        founding,
    }
}

fn consent(k: &Collective, act: &Hash) -> Result<Consent, LawError> {
    LawView::new(&k.w.v, law_spec()).consent(act)
}

fn signers(c: &Consent) -> (Vec<Hash>, bool) {
    match c {
        Consent::Listed { signers, met, .. } => (signers.clone(), *met),
        other => panic!("not listed: {other:?}"),
    }
}

#[test]
fn a_founding_agreement_exists_once_every_party_signed() {
    let k = setup(false);
    let view = LawView::new(&k.w.v, law_spec());
    let a = view.agreement(&k.founding).unwrap();
    assert!(!a.exists, "two of three signed; the signing rule is all");
    assert_eq!(a.signed.len(), 2);
    assert_eq!(view.declared(&k.c.id, &k.c.id), Some(k.founding));

    let mut k = setup(true);
    let view = LawView::new(&k.w.v, law_spec());
    assert!(view.agreement(&k.founding).unwrap().exists);
    let mut c = k.c.clone();
    let r = publish(&mut k.w, &mut c, "release 1");
    k.c = c;
    assert_eq!(k.w.v.status(&r), Status::Valid);
}

#[test]
fn an_incomplete_founding_agreement_backs_nothing() {
    let mut k = setup(false);
    let mut c = k.c.clone();
    let r = publish(&mut k.w, &mut c, "release 1");
    let (m0, m1) = (k.members[0].clone(), k.members[1].clone());
    let (mut m0, mut m1) = (m0, m1);
    sign(&mut k.w, &mut m0, &r);
    sign(&mut k.w, &mut m1, &r);
    let e = consent(&k, &r).unwrap_err();
    assert!(e.to_string().contains("not complete"), "{e}");
}

#[test]
fn a_publication_of_the_collective_needs_two_member_signatures() {
    let mut k = setup(true);
    let mut c = k.c.clone();
    let r = publish(&mut k.w, &mut c, "release 1");
    k.c = c;
    assert_eq!(signers(&consent(&k, &r).unwrap()), (vec![], false));

    let mut m1 = k.members[0].clone();
    sign(&mut k.w, &mut m1, &r);
    assert_eq!(
        signers(&consent(&k, &r).unwrap()),
        (vec![m1.id], false),
        "one of three"
    );

    // Someone outside the collective signs: never counted.
    let mut outsider = self_hosted(&mut k.w, "outsider");
    sign(&mut k.w, &mut outsider, &r);
    assert!(!signers(&consent(&k, &r).unwrap()).1);

    // A signature act whose objects do not name the act it signs is not one.
    let mut m3 = k.members[2].clone();
    law_act(
        &mut k.w,
        &mut m3,
        law::types::SIGNATURE,
        law::signature_payload(&r),
        Some(vec![Object {
            chain: k.founding,
            predecessor: k.founding,
        }]),
    );
    assert!(!signers(&consent(&k, &r).unwrap()).1);

    let mut m2 = k.members[1].clone();
    sign(&mut k.w, &mut m2, &r);
    assert_eq!(
        signers(&consent(&k, &r).unwrap()),
        (vec![m1.id, m2.id], true)
    );

    // An act type the grammar does not list needs nothing more.
    let mut c = k.c.clone();
    let a = k.w.everyday_act(
        &mut c,
        law_spec(),
        law::types::SIGNATURE,
        law::signature_payload(&r),
        Some(vec![Object {
            chain: r,
            predecessor: r,
        }]),
        None,
    );
    let a = k.w.add(&a);
    assert_eq!(
        consent(&k, &a).unwrap(),
        Consent::NotListed {
            agreement: k.founding
        }
    );

    // An identity that declares no founding agreement is not a collective.
    let mut solo = self_hosted(&mut k.w, "solo");
    let p = publish(&mut k.w, &mut solo, "a release by one person");
    assert_eq!(consent(&k, &p).unwrap(), Consent::NotCollective);
}

/// A member leaves and another joins: a clone of the founding agreement,
/// then the collective's rotation declaring it (rule 37). The old rules
/// are fenced off by the rotation (F100).
#[test]
fn members_change_by_clone_and_rotation() {
    let mut k = setup(true);
    let mut c = k.c.clone();
    let before = publish(&mut k.w, &mut c, "release 1");
    let (mut m1, mut m2, mut m3) = (
        k.members[0].clone(),
        k.members[1].clone(),
        k.members[2].clone(),
    );
    sign(&mut k.w, &mut m1, &before);
    sign(&mut k.w, &mut m2, &before);

    // m3 leaves, m4 joins.
    let mut m4 = self_hosted(&mut k.w, "m4");
    let mut t = founding(&[m1.id, m2.id, m4.id]);
    t.parent = Some(k.founding);
    let clone = propose(&mut k.w, &mut m1, &t);
    let view = LawView::new(&k.w.v, law_spec());
    assert!(
        !view.agreement(&clone).unwrap().exists,
        "a draft until the parent's clone rule is met"
    );
    sign(&mut k.w, &mut m1, &clone);
    sign(&mut k.w, &mut m2, &clone);
    sign(&mut k.w, &mut m4, &clone);
    let view = LawView::new(&k.w.v, law_spec());
    let a = view.agreement(&clone).unwrap();
    assert!(a.exists, "two of the parent's three parties signed");
    assert_eq!(a.signed, vec![m1.id, m2.id, m4.id]);

    let (_, mut c2) = k.w.rotate(
        &c,
        Rot {
            declarations: Some(vec![law::founding_declaration(&law_spec(), &clone)]),
            ..Default::default()
        },
    );

    // The release made before the change stands, under the founding agreement.
    assert_eq!(k.w.v.status(&before), Status::Valid);
    let got = consent(&k, &before).unwrap();
    assert!(
        matches!(&got, Consent::Listed { agreement, met: true, .. } if *agreement == k.founding)
    );

    // The next release is judged under the clone: m3's signature no longer counts.
    let after = publish(&mut k.w, &mut c2, "release 2");
    sign(&mut k.w, &mut m1, &after);
    sign(&mut k.w, &mut m3, &after);
    let got = consent(&k, &after).unwrap();
    assert!(matches!(&got, Consent::Listed { agreement, .. } if *agreement == clone));
    assert_eq!(signers(&got), (vec![m1.id], false));
    sign(&mut k.w, &mut m4, &after);
    assert_eq!(
        signers(&consent(&k, &after).unwrap()),
        (vec![m1.id, m4.id], true)
    );

    // The old key signs after the rotation: void, whatever members sign (F100).
    let late = publish(&mut k.w, &mut c, "a release under the old rules");
    sign(&mut k.w, &mut m1, &late);
    sign(&mut k.w, &mut m3, &late);
    assert_eq!(k.w.v.status(&late), Status::Void);
}

#[test]
fn a_declared_agreement_must_be_a_complete_clone_of_the_one_before() {
    // An incomplete clone.
    let mut k = setup(true);
    let (mut m1, mut m4) = (k.members[0].clone(), self_hosted(&mut k.w, "m4"));
    let mut t = founding(&[k.members[0].id, k.members[1].id, m4.id]);
    t.parent = Some(k.founding);
    let clone = propose(&mut k.w, &mut m1, &t);
    sign(&mut k.w, &mut m1, &clone);
    sign(&mut k.w, &mut m4, &clone);
    let (_, mut c2) = k.w.rotate(
        &k.c,
        Rot {
            declarations: Some(vec![law::founding_declaration(&law_spec(), &clone)]),
            ..Default::default()
        },
    );
    let r = publish(&mut k.w, &mut c2, "release");
    let e = consent(&k, &r).unwrap_err();
    assert!(e.to_string().contains("not complete"), "{e}");

    // Fresh terms that do not descend from the founding agreement.
    let mut k = setup(true);
    let (mut m1, mut m2, mut m3) = (
        k.members[0].clone(),
        k.members[1].clone(),
        k.members[2].clone(),
    );
    let ids = [m1.id, m2.id, m3.id];
    let other = propose(&mut k.w, &mut m1, &founding(&ids));
    for m in [&mut m1, &mut m2, &mut m3] {
        sign(&mut k.w, m, &other);
    }
    let (_, mut c2) = k.w.rotate(
        &k.c,
        Rot {
            declarations: Some(vec![law::founding_declaration(&law_spec(), &other)]),
            ..Default::default()
        },
    );
    let r = publish(&mut k.w, &mut c2, "release");
    let e = consent(&k, &r).unwrap_err();
    assert!(e.to_string().contains("not a clone"), "{e}");
}
