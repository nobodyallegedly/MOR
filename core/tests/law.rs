//! Law draft 7: formats, the checks that need no other act, and the powers
//! a clone needs (rules 44a to 44c). Each test names the freeze suite v18
//! step it follows. The flows on a collective's own sequence are in
//! `law_collective.rs`.

use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};
use mor_core::law::{
    self, outcomes, powers_needed, Abandonment, Area, Authority, Field4, FieldRef, Holding,
    KeyGrammar, Kind, LawError, MarkEntry, Mips, Power, Recovery, Rule, SuccessionPlan, Terms,
};

pub fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: t("IDENTITY"),
        envelope: t("ENVELOPE"),
        text: t("TEXT"),
        finance: t("FINANCE"),
        law: t("LAW"),
        production: t("PRODUCTION"),
    }
}

fn h(n: u8) -> Hash {
    [n; 32]
}

const PAY: u8 = 60;
const PAY2: u8 = 61;
const ANCHOR: u8 = 62;
const CLOCK: u8 = 63;
const EXT: u8 = 70;
const EXT_FIN: u8 = 71;
const AUTHORITY: u8 = 90;
const ARBITRATOR: u8 = 91;

/// The label of scenario 3.1: three members; the release manager (1)
/// holds publications and the Production lane (area 1); the treasurer (2)
/// holds the Finance lane (area 2). The safety key needs all three, with an
/// escrowed share released by a third-party authority.
fn label() -> Terms {
    let m = mips();
    Terms {
        parties: vec![h(1), h(2), h(3)],
        text: "The label publishes its members' records.".into(),
        cmips: vec![(6, h(PAY)), (11, h(ANCHOR))],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::Threshold(2),
        time: None,
        abandonment: Some(Abandonment {
            authority: Authority::Named(h(AUTHORITY)),
            outcomes: vec![outcomes::VOICE_REMOVED],
            period: None,
        }),
        parent: None,
        grammar: Some(KeyGrammar {
            signing: Holding::Shares {
                threshold: 2,
                members: vec![h(1), h(2), h(3)],
            },
            safety: Holding::Shares {
                threshold: 3,
                members: vec![h(1), h(2), h(3)],
            },
            recovery: Some(Recovery::Escrow {
                authority: h(AUTHORITY),
            }),
        }),
        arbitrators: Some(vec![h(ARBITRATOR)]),
        split_grant: None,
        extensions: Some(vec![h(EXT)]),
        succession: None,
        constitutional: None,
        areas: Some(vec![
            Area {
                name: "Releases".into(),
                holders: vec![h(1)],
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
                holders: vec![h(2)],
                threshold: 1,
                kinds: Some(vec![Kind::Layer(law::layers::FINANCE)]),
                fields: None,
                id: 2,
            },
        ]),
        area_words: Some(vec![
            (1, "Releases go out on Fridays.".into()),
            (2, "Receipts are signed within a week.".into()),
        ]),
    }
}

fn clone_of(parent: &Terms, mark: Vec<(Power, Vec<Hash>)>) -> Terms {
    let mut t = parent.clone();
    t.parent = Some(sha256(b"the parent's id"));
    t.field4 = Field4::Mark(
        mark.into_iter()
            .map(|(power, signers)| MarkEntry { power, signers })
            .collect(),
    );
    t
}

fn ext_layers(e: &Hash) -> Result<Vec<u64>, LawError> {
    match e[0] {
        EXT => Ok(vec![]),
        EXT_FIN => Ok(vec![law::layers::FINANCE]),
        _ => Err(LawError::Missing(*e)),
    }
}

fn needs(parent: &Terms, clone: &Terms) -> Vec<Power> {
    powers_needed(parent, clone, &mips(), &ext_layers).unwrap()
}

fn roundtrip(t: &Terms) -> Terms {
    let bytes = cbor::encode(&Value::Map(t.to_map()));
    let Value::Map(m) = cbor::decode(&bytes).unwrap() else {
        panic!()
    };
    Terms::decode(&m).unwrap()
}

fn check(t: &Terms) -> Result<(), LawError> {
    t.check(&mips())
}

// ---------------------------------------------------------------- formats

#[test]
fn terms_round_trip_and_decode_strictly() {
    let t = label();
    assert_eq!(roundtrip(&t), t);
    check(&t).unwrap();
    let c = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    assert_eq!(roundtrip(&c), c, "a mark round-trips");

    for (k, what) in [
        (7, "stakes"),
        (8, "split plan"),
        (10, "fork rule"),
        (17, "refund"),
    ] {
        let mut m = t.to_map();
        m.push((Value::Uint(k), Value::Array(vec![])));
        let e = Terms::decode(&m).unwrap_err();
        assert!(matches!(e, LawError::Unsupported(w) if w.contains(what)), "{e}");
    }

    let mut m = t.to_map();
    m.push((Value::Uint(21), Value::Uint(0)));
    assert!(matches!(Terms::decode(&m), Err(LawError::Shape(_))));

    // Draft 6's listed act types (key grammar key 2) are retired.
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(12) {
            if let Value::Map(g) = v {
                g.push((Value::Uint(2), Value::Array(vec![])));
            }
        }
    }
    assert!(matches!(Terms::decode(&m), Err(LawError::Shape(w)) if w.contains("retired")));
}

#[test]
fn field_4_is_a_rule_in_founding_terms_and_a_mark_in_a_clone() {
    // F107, Q11: founding terms' field 4 is every party (3.2).
    let mut t = label();
    t.field4 = Field4::Rule(Rule::Threshold(2));
    assert!(check(&t).is_err(), "founded on two of three: invalid");
    t.field4 = Field4::Mark(vec![MarkEntry {
        power: Power::Clone,
        signers: vec![h(1)],
    }]);
    assert!(check(&t).is_err(), "founding terms carry no mark");

    let mut c = clone_of(&label(), vec![(Power::Clone, vec![h(1), h(2)])]);
    check(&c).unwrap();
    c.field4 = Field4::Rule(Rule::All);
    assert!(check(&c).is_err(), "a clone carries a mark");

    // A mark lists its powers ascending, never twice (F104).
    let c = clone_of(
        &label(),
        vec![(Power::Area(1), vec![h(1)]), (Power::Clone, vec![h(1), h(2)])],
    );
    assert!(check(&c).is_err(), "not ascending");
    let c = clone_of(
        &label(),
        vec![(Power::Clone, vec![h(1), h(2)]), (Power::Area(1), vec![h(1)])],
    );
    check(&c).unwrap();
    let c = clone_of(&label(), vec![(Power::Clone, vec![h(1), h(1)])]);
    assert!(check(&c).is_err(), "a signer twice");
}

#[test]
fn a_deal_has_everyone_as_its_rules() {
    // F107: a deal is terms without a key grammar.
    let mut d = label();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    assert!(check(&d).is_err(), "a deal's clone rule of two of three is invalid");
    d.clone = Rule::All;
    check(&d).unwrap();
    d.constitutional = Some(Rule::All);
    assert!(check(&d).is_err(), "no field 18 in a deal");
    d.constitutional = None;
    d.areas = label().areas;
    assert!(check(&d).is_err(), "no areas in a deal");
}

#[test]
fn a_judge_never_handles_what_it_judges() {
    // 3.7n, Q20: one specification for anchoring and payments.
    let mut t = label();
    t.cmips = vec![(6, h(ANCHOR)), (11, h(ANCHOR))];
    assert!(check(&t).is_err());
    // For time reference and anchoring.
    t.cmips = vec![(6, h(PAY)), (10, h(CLOCK)), (11, h(CLOCK))];
    assert!(check(&t).is_err());
    // Q25: a judge named as an extension.
    let mut t = label();
    t.extensions = Some(vec![h(ANCHOR)]);
    assert!(check(&t).is_err());
    // Field 6 also named for payments, or as an extension.
    let mut t = label();
    t.time = Some((h(CLOCK), Value::Uint(0)));
    check(&t).unwrap();
    t.cmips = vec![(6, h(CLOCK)), (11, h(ANCHOR))];
    assert!(check(&t).is_err());
    let mut t = label();
    t.time = Some((h(CLOCK), Value::Uint(0)));
    t.extensions = Some(vec![h(CLOCK)]);
    assert!(check(&t).is_err());
    // Q31: field 6 and task 10 name one specification.
    let mut t = label();
    t.time = Some((h(CLOCK), Value::Uint(0)));
    t.cmips = vec![(6, h(PAY)), (10, h(ANCHOR + 10)), (11, h(ANCHOR))];
    assert!(check(&t).is_err(), "two time references");
    t.cmips = vec![(6, h(PAY)), (10, h(CLOCK)), (11, h(ANCHOR))];
    check(&t).unwrap();
    // Q24 and scenario 1.7: in a deal too.
    let mut d = label();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.clone = Rule::All;
    d.cmips = vec![(6, h(ANCHOR)), (11, h(ANCHOR))];
    assert!(check(&d).is_err());
    d.cmips = vec![(6, h(PAY)), (11, h(ANCHOR))];
    d.time = Some((h(CLOCK), Value::Uint(0)));
    check(&d).unwrap();
    d.extensions = Some(vec![h(CLOCK)]);
    assert!(check(&d).is_err(), "1.7: the block-height cMIP as an extension");
}

#[test]
fn areas_are_checked() {
    let m = mips();
    // Q21: founding terms never list an area without holders.
    let mut t = label();
    t.areas.as_mut().unwrap()[1].holders = vec![];
    assert!(check(&t).is_err());
    // A clone may.
    let mut c = clone_of(&label(), vec![(Power::Constitutional, vec![h(1), h(2), h(3)])]);
    c.areas.as_mut().unwrap()[1].holders = vec![];
    check(&c).unwrap();
    // Holders are parties.
    let mut t = label();
    t.areas.as_mut().unwrap()[1].holders = vec![h(9)];
    assert!(check(&t).is_err());
    // Q5: no two areas reach the same acts: a Finance lane and the
    // payment cMIP's receipts.
    let mut t = label();
    t.areas.as_mut().unwrap()[0].kinds.as_mut().unwrap().push(Kind::Type {
        spec: h(PAY),
        type_: 0,
    });
    assert!(check(&t).is_err());
    // A lane and a field reference to a task of its layer.
    let mut t = label();
    t.areas.as_mut().unwrap()[0].fields = Some(vec![FieldRef::Task(6)]);
    assert!(check(&t).is_err());
    // A field reference to a judicial task.
    let mut t = label();
    t.areas.as_mut().unwrap()[0].fields = Some(vec![FieldRef::Task(11)]);
    assert!(check(&t).is_err());
    // Q32: ids are distinct.
    let mut t = label();
    t.areas.as_mut().unwrap()[1].id = 1;
    assert!(check(&t).is_err());
    // Area words only for an area that exists.
    let mut t = label();
    t.area_words = Some(vec![(3, "none".into())]);
    assert!(check(&t).is_err());
    // Genesis, rotations and records are never in an area's reach.
    let mut t = label();
    t.areas.as_mut().unwrap()[0].kinds.as_mut().unwrap().push(Kind::Type {
        spec: m.identity,
        type_: 1,
    });
    assert!(check(&t).is_err());
    // R4: one specification for a Finance and a Law task, two lanes: valid.
    let mut t = label();
    t.cmips = vec![(6, h(PAY)), (7, h(PAY2)), (8, h(PAY2)), (11, h(ANCHOR))];
    t.areas.as_mut().unwrap().push(Area {
        name: "Law".into(),
        holders: vec![h(3)],
        threshold: 1,
        kinds: Some(vec![Kind::Layer(law::layers::LAW)]),
        fields: None,
        id: 3,
    });
    check(&t).unwrap();
}

#[test]
fn every_constitutional_voice_is_covered() {
    // F105, 3.7h.
    let mut t = label();
    t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::STAKE_REDISTRIBUTED];
    assert!(check(&t).is_err(), "no outcome 0");
    let mut t = label();
    t.abandonment.as_mut().unwrap().authority = Authority::Named(h(1));
    t.grammar.as_mut().unwrap().recovery = Some(Recovery::Escrow { authority: h(1) });
    assert!(check(&t).is_err(), "a member as the only authority covers everyone but themselves");
    // Under a constitutional rule naming parties 2 and 3 only, the
    // authority may be member 1.
    t.constitutional = Some(Rule::Named(vec![h(2), h(3)]));
    check(&t).unwrap();
    // A deal needs no clause (rule 49).
    let mut d = label();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.clone = Rule::All;
    d.abandonment = None;
    check(&d).unwrap();
}

#[test]
fn a_grammar_leaves_a_way_to_rotate() {
    // 3.7a, F96: a single holder of the safety key, no successor, no escrow.
    let mut t = label();
    t.grammar.as_mut().unwrap().safety = Holding::One(h(1));
    t.grammar.as_mut().unwrap().recovery = None;
    assert!(check(&t).is_err());
    t.grammar.as_mut().unwrap().recovery = Some(Recovery::Escrow {
        authority: h(AUTHORITY),
    });
    assert!(check(&t).is_err(), "still no successor");
    t.succession = Some(vec![SuccessionPlan {
        party: h(1),
        stakes: None,
        seats: Some(vec![(h(3), 1)]),
        entry: Some(1),
    }]);
    check(&t).unwrap();
    // Every member to rotate, and no recovery path.
    let mut t = label();
    t.grammar.as_mut().unwrap().recovery = None;
    assert!(check(&t).is_err());
}

// ---------------------------------------------------------------- powers

#[test]
fn the_powers_a_clone_needs_are_read_from_its_changes() {
    let p = label();
    let c = |f: &dyn Fn(&mut Terms)| {
        let mut t = clone_of(&p, vec![(Power::Clone, vec![h(1)])]);
        f(&mut t);
        t
    };
    // Nothing changed: the clone rule.
    assert_eq!(needs(&p, &c(&|_| {})), vec![Power::Clone]);
    // 3.7b: rewriting the clone rule is constitutional.
    assert_eq!(
        needs(&p, &c(&|t| t.clone = Rule::Named(vec![h(1), h(2)]))),
        vec![Power::Constitutional]
    );
    // Membership, the key grammar, areas: constitutional.
    assert_eq!(
        needs(&p, &c(&|t| t.areas.as_mut().unwrap()[0].name = "Records".into())),
        vec![Power::Constitutional]
    );
    // 3.7d: keepers are judicial: the clone rule.
    assert_eq!(
        needs(&p, &c(&|t| t.keepers = Some(law::Keepers {
            operators: vec![h(80)],
            rule: Rule::All
        }))),
        vec![Power::Clone]
    );
    // 3.7c: an area's words are its holders'.
    assert_eq!(
        needs(&p, &c(&|t| t.area_words.as_mut().unwrap()[0].1 = "Releases on Mondays.".into())),
        vec![Power::Area(1)]
    );
    // 3.7e: two areas' words: both powers.
    assert_eq!(
        needs(&p, &c(&|t| {
            t.area_words = Some(vec![(1, "a".into()), (2, "b".into())]);
        })),
        vec![Power::Area(1), Power::Area(2)]
    );
    // 3.7l, Q12: an area and a judicial clause: both.
    assert_eq!(
        needs(&p, &c(&|t| {
            t.area_words.as_mut().unwrap()[0].1 = "a".into();
            t.arbitrators = Some(vec![h(92)]);
        })),
        vec![Power::Clone, Power::Area(1)]
    );
    // 3.7g: the payment cMIP is the Finance lane's.
    assert_eq!(
        needs(&p, &c(&|t| t.cmips = vec![(6, h(PAY2)), (11, h(ANCHOR))])),
        vec![Power::Area(2)]
    );
    // 3.7n, Q15: the anchoring cMIP stays judicial.
    assert_eq!(
        needs(&p, &c(&|t| t.cmips = vec![(6, h(PAY)), (11, h(ANCHOR + 5))])),
        vec![Power::Clone]
    );
    // A task no area holds: the clone rule (third pass reading).
    assert_eq!(
        needs(&p, &c(&|t| t.cmips = vec![(5, h(50)), (6, h(PAY)), (11, h(ANCHOR))])),
        vec![Power::Clone]
    );
    // 3.7j: dropping an extension declaring only Production: the release
    // manager alone.
    assert_eq!(needs(&p, &c(&|t| t.extensions = None)), vec![Power::Area(1)]);
}

#[test]
fn extensions_need_every_lane_they_declare() {
    let p = label();
    let mut t = clone_of(&p, vec![(Power::Area(1), vec![h(1)])]);
    // An extension whose specification is not held: asked for, never guessed.
    t.extensions = Some(vec![h(EXT), h(99)]);
    assert!(matches!(
        powers_needed(&p, &t, &mips(), &ext_layers),
        Err(LawError::Missing(_))
    ));
    // 3.7j: one declaring Finance needs the treasurer too.
    t.extensions = Some(vec![h(EXT), h(EXT_FIN)]);
    assert_eq!(needs(&p, &t), vec![Power::Area(1), Power::Area(2)]);
    // Q18: dropping it needs the same.
    let mut with = p.clone();
    with.extensions = Some(vec![h(EXT), h(EXT_FIN)]);
    let mut drop = clone_of(&with, vec![(Power::Area(1), vec![h(1)])]);
    drop.extensions = Some(vec![h(EXT)]);
    assert_eq!(needs(&with, &drop), vec![Power::Area(1), Power::Area(2)]);
}

#[test]
fn r4_a_specification_serving_two_layers_answers_to_both_lanes() {
    // 3.7n: the Finance lane to member 2, the Law lane to member 3.
    let mut p = label();
    p.cmips = vec![(6, h(PAY)), (7, h(PAY2)), (8, h(PAY2)), (11, h(ANCHOR))];
    p.areas.as_mut().unwrap().push(Area {
        name: "Law".into(),
        holders: vec![h(3)],
        threshold: 1,
        kinds: Some(vec![Kind::Layer(law::layers::LAW)]),
        fields: None,
        id: 3,
    });
    check(&p).unwrap();
    // Naming that specification for another Finance task needs both lanes.
    let mut t = clone_of(&p, vec![(Power::Area(2), vec![h(2)])]);
    t.cmips = vec![(6, h(PAY2)), (7, h(PAY2)), (8, h(PAY2)), (11, h(ANCHOR))];
    assert_eq!(needs(&p, &t), vec![Power::Area(2), Power::Area(3)]);
    // The Law lane alone adopts a grant-limits cMIP (task 12).
    let mut t = clone_of(&p, vec![(Power::Area(3), vec![h(3)])]);
    t.cmips.push((12, h(55)));
    t.cmips.sort();
    assert_eq!(needs(&p, &t), vec![Power::Area(3)]);
}

#[test]
fn a_deals_clone_needs_every_party() {
    let mut d = label();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.clone = Rule::All;
    let mut c = clone_of(&d, vec![(Power::Clone, vec![h(1), h(2), h(3)])]);
    c.cmips = vec![(6, h(PAY2)), (11, h(ANCHOR))];
    assert_eq!(needs(&d, &c), vec![Power::Clone]);
    check(&c).unwrap();
}
