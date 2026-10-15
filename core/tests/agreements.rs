//! Agreements draft 7: formats, the checks that need no other act, and the powers
//! a clone needs (rules 44a to 44c). Each test names the freeze suite v18
//! step it follows. The flows on a collective's own sequence are in
//! `agreements_collective.rs`.

use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};
use mor_core::agreements::{
    self, judged, outcomes, powers_needed, Abandonment, Area, Authority, ChainLink, Who,
    Field4, FieldRef, Holding, Judge, KeyGrammar, Kind, AgreementsError, MarkEntry, Mirs, Power, Recovery,
    Rule, ReleaseRule, HoldersRule, SuccessionPlan, Terms, chain_answer, ChainAnswer, Step, Stake,
};

pub fn mirs() -> Mirs {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mirs {
        identity: t("IDENTITY"),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: t("FINANCE"),
        agreements: t("LAW"),
        development: t("PRODUCTION"),
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
/// holds publications and the Development lane (area 1); the treasurer (2)
/// holds the Money lane (area 2). The chain key needs all three, with an
/// escrowed share released by a third-party authority.
fn label() -> Terms {
    let m = mirs();
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
            proof: None,
        }),
        parent: None,
        grammar: Some(KeyGrammar {
            signing: Holding::Shares {
                threshold: 2,
                members: vec![h(1), h(2), h(3)],
            },
            chain_key: Holding::Shares {
                threshold: 3,
                members: vec![h(1), h(2), h(3)],
            },
            recovery: Some(Recovery::Escrow {
                authority: h(AUTHORITY),
            }),
        }),
        arbitrators: Some(vec![h(ARBITRATOR)]),
        split_grant: None,
        payee_grants: None,
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
                        spec: m.envelopes,
                        type_: 0,
                    },
                    Kind::Layer(agreements::layers::DEVELOPMENT),
                ]),
                fields: None,
                id: 1,
            },
            Area {
                name: "Money".into(),
                holders: vec![h(2)],
                threshold: 1,
                kinds: Some(vec![Kind::Layer(agreements::layers::MONEY)]),
                fields: None,
                id: 2,
            },
        ]),
        area_words: Some(vec![
            (1, "Releases go out on Fridays.".into()),
            (2, "Receipts are signed within a week.".into()),
        ]),
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

fn clone_of(parent: &Terms, mark: Vec<(Power, Vec<Hash>)>) -> Terms {
    let mut t = parent.clone();
    t.parent = Some(sha256(b"the parent's id"));
    t.field4 = Field4::Mark(
        mark.into_iter()
            .map(|(power, mut signers)| {
                // Ascending by hash (B8).
                signers.sort();
                MarkEntry { power, signers }
            })
            .collect(),
    );
    t
}

fn ext_layers(e: &Hash) -> Result<Vec<u64>, AgreementsError> {
    match e[0] {
        EXT => Ok(vec![]),
        EXT_FIN => Ok(vec![agreements::layers::MONEY]),
        _ => Err(AgreementsError::Missing(*e)),
    }
}

fn needs(parent: &Terms, clone: &Terms) -> Vec<Power> {
    powers_needed(parent, clone, &mirs(), &ext_layers).unwrap()
}

fn roundtrip(t: &Terms) -> Terms {
    let bytes = cbor::encode(&Value::Map(t.to_map()));
    let Value::Map(m) = cbor::decode(&bytes).unwrap() else {
        panic!()
    };
    Terms::decode(&m).unwrap()
}

fn check(t: &Terms) -> Result<(), AgreementsError> {
    t.check(&mirs())
}

// ---------------------------------------------------------------- formats

#[test]
fn terms_round_trip_and_decode_strictly() {
    let t = label();
    assert_eq!(roundtrip(&t), t);
    check(&t).unwrap();
    let c = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    assert_eq!(roundtrip(&c), c, "a mark round-trips");

    // Step 12b: fields 8 and 17 have their formats, refused only when
    // malformed; field 10, the concurrency rule, is withdrawn.
    for k in [8, 17] {
        let mut m = t.to_map();
        m.push((Value::Uint(k), Value::Array(vec![])));
        assert!(matches!(Terms::decode(&m), Err(AgreementsError::Shape(_))), "field {k}: not in its format");
    }
    let mut m = t.to_map();
    m.push((Value::Uint(10), Value::Array(vec![])));
    assert!(matches!(Terms::decode(&m), Err(AgreementsError::Check(w)) if w.contains("withdrawn")));

    let mut m = t.to_map();
    m.push((Value::Uint(21), Value::Uint(0)));
    assert!(matches!(Terms::decode(&m), Err(AgreementsError::Shape(_))));

    // Draft 6's listed act types (key grammar key 2) are retired.
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(12) {
            if let Value::Map(g) = v {
                g.push((Value::Uint(2), Value::Array(vec![])));
            }
        }
    }
    assert!(matches!(Terms::decode(&m), Err(AgreementsError::Shape(w)) if w.contains("retired")));
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

    // B8: a mark's signers are ascending by hash, none twice.
    let mut c = clone_of(&label(), vec![(Power::Clone, vec![h(1), h(2)])]);
    if let Field4::Mark(m) = &mut c.field4 {
        m[0].signers.reverse();
    }
    assert!(check(&c).is_err(), "descending signers");
    if let Field4::Mark(m) = &mut c.field4 {
        m[0].signers = vec![h(1), h(1)];
    }
    assert!(check(&c).is_err(), "a signer twice");
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
    let m = mirs();
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
    // Q5: no two areas reach the same acts: a Money lane and the
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
    // R4: one specification for a Money and an Agreements task, two lanes: valid.
    let mut t = label();
    t.cmips = vec![(6, h(PAY)), (7, h(PAY2)), (8, h(PAY2)), (11, h(ANCHOR))];
    t.areas.as_mut().unwrap().push(Area {
        name: "Agreements".into(),
        holders: vec![h(3)],
        threshold: 1,
        kinds: Some(vec![Kind::Layer(agreements::layers::AGREEMENTS)]),
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
    // 3.7a, F96: a single holder of the chain key, no successor, no escrow.
    let mut t = label();
    t.grammar.as_mut().unwrap().chain_key = Holding::One(h(1));
    t.grammar.as_mut().unwrap().recovery = None;
    assert!(check(&t).is_err());
    t.grammar.as_mut().unwrap().recovery = Some(Recovery::Escrow {
        authority: h(AUTHORITY),
    });
    assert!(check(&t).is_err(), "still no successor");
    t.succession = Some(vec![SuccessionPlan {
        party: h(1),
        stakes: None,
        seats: Some(vec![h(3)]),
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
    // 3.7d: keepers are judicial: every member (F121).
    assert_eq!(
        needs(&p, &c(&|t| t.keepers = Some(agreements::Keepers {
            operators: vec![h(80)],
            rule: Rule::All
        }))),
        vec![Power::Judicial]
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
        vec![Power::Judicial, Power::Area(1)]
    );
    // 3.7g: the payment cMIP is the Money lane's.
    assert_eq!(
        needs(&p, &c(&|t| t.cmips = vec![(6, h(PAY2)), (11, h(ANCHOR))])),
        vec![Power::Area(2)]
    );
    // 3.7n, Q15: the anchoring cMIP stays judicial: every member (F121).
    assert_eq!(
        needs(&p, &c(&|t| t.cmips = vec![(6, h(PAY)), (11, h(ANCHOR + 5))])),
        vec![Power::Judicial]
    );
    // A task no area holds: the clone rule (third pass reading).
    assert_eq!(
        needs(&p, &c(&|t| t.cmips = vec![(5, h(50)), (6, h(PAY)), (11, h(ANCHOR))])),
        vec![Power::Clone]
    );
    // 3.7j: dropping an extension declaring only Development: the release
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
        powers_needed(&p, &t, &mirs(), &ext_layers),
        Err(AgreementsError::Missing(_))
    ));
    // 3.7j: one declaring Money needs the treasurer too.
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
    // 3.7n: the Money lane to member 2, the Agreements lane to member 3.
    let mut p = label();
    p.cmips = vec![(6, h(PAY)), (7, h(PAY2)), (8, h(PAY2)), (11, h(ANCHOR))];
    p.areas.as_mut().unwrap().push(Area {
        name: "Agreements".into(),
        holders: vec![h(3)],
        threshold: 1,
        kinds: Some(vec![Kind::Layer(agreements::layers::AGREEMENTS)]),
        fields: None,
        id: 3,
    });
    check(&p).unwrap();
    // Naming that specification for another Money task needs both lanes.
    let mut t = clone_of(&p, vec![(Power::Area(2), vec![h(2)])]);
    t.cmips = vec![(6, h(PAY2)), (7, h(PAY2)), (8, h(PAY2)), (11, h(ANCHOR))];
    assert_eq!(needs(&p, &t), vec![Power::Area(2), Power::Area(3)]);
    // The Agreements lane alone adopts a grant-limits cMIP (task 12).
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

// ---------------------------------------------------------------- F120, F121

/// A change to terms, named by why it is wrong.
type Change = Box<dyn Fn(&mut Terms)>;

const CONDITION: u8 = 64;
const CONDITION2: u8 = 65;
const CONDITION3: u8 = 66;
const ARBITRATOR2: u8 = 93;

/// The label with a condition cMIP (task 9) and an arbitrator, each
/// followed by a chain of judgment (F121).
fn label_with_chain() -> Terms {
    let mut t = label();
    t.cmips = vec![(6, h(PAY)), (9, h(CONDITION)), (11, h(ANCHOR))];
    t.arbitrators = Some(vec![h(ARBITRATOR)]);
    // An arbitrator can stay silent: its period is measured on a time
    // reference, compulsory there (Q7).
    t.time = Some((h(CLOCK), Value::Uint(0)));
    t.chain = Some(vec![
        ChainLink { judge: Judge::Task(9), next: vec![(h(CONDITION2).into(), 30), (h(CONDITION3).into(), 30)] },
        ChainLink { judge: Judge::Identity(h(ARBITRATOR)), next: vec![(h(ARBITRATOR2).into(), 30)] },
    ]);
    t
}

/// Freeze suite v21, 3.7p (F121): a chain of judgment. The condition cMIP
/// answers "unknown"; the next in the chain decides, with no new signature.
#[test]
fn a_chain_of_judgment_passes_unknown_to_the_next() {
    let t = label_with_chain();
    assert_eq!(check(&t), Ok(()));
    assert_eq!(roundtrip(&t), t);
    assert_eq!(
        t.chain_of(&Judge::Task(9)),
        Some(vec![h(CONDITION), h(CONDITION2), h(CONDITION3)])
    );
    assert_eq!(t.chain_of(&Judge::Identity(h(ARBITRATOR))), Some(vec![h(ARBITRATOR), h(ARBITRATOR2)]));
    // A judge with no chain is followed by nobody; a judge not named, by
    // no chain at all.
    assert_eq!(t.chain_of(&Judge::Task(11)), Some(vec![h(ANCHOR)]));
    assert_eq!(t.chain_of(&Judge::Task(10)), Some(vec![h(CLOCK)]));
    // The first answers unknown, the second decides; the third is never asked.
    assert_eq!(judged(&[None, Some(true), Some(false)]), Some((1, true)));
    assert_eq!(judged(&[Some(false), Some(true)]), Some((0, false)));
    assert_eq!(judged::<bool>(&[None, None, None]), None);
    assert_eq!(
        chain_answer(&[Step::Unknown, Step::Answer(true), Step::Answer(false)]),
        ChainAnswer::Decided { by: 1, answer: true }
    );
    // Changing the chain is judicial: every member (F121).
    let mut c = clone_of(&t, vec![(Power::Judicial, vec![h(1), h(2), h(3)])]);
    c.chain.as_mut().unwrap()[0].next = vec![(h(CONDITION3).into(), 30)];
    assert_eq!(needs(&t, &c), vec![Power::Judicial]);
    // So is naming one where there was none.
    let mut c = clone_of(&label(), vec![(Power::Judicial, vec![h(1), h(2), h(3)])]);
    c.chain = Some(vec![ChainLink { judge: Judge::Task(11), next: vec![(h(CONDITION3).into(), 30)] }]);
    assert_eq!(needs(&label(), &c), vec![Power::Judicial]);
}

/// F121 with Q20: what a chain of judgment may name.
#[test]
fn a_chain_follows_named_judges_and_its_specifications_judge_only() {
    let bad: Vec<(&str, Change)> = vec![
        ("a task with no judge named", Box::new(|t| {
            t.chain.as_mut().unwrap().push(ChainLink { judge: Judge::Task(10), next: vec![(h(CLOCK).into(), 30)] })
        })),
        ("an operational task", Box::new(|t| {
            t.chain.as_mut().unwrap().insert(0, ChainLink { judge: Judge::Task(6), next: vec![(h(PAY2).into(), 30)] })
        })),
        ("the judge takes over from itself", Box::new(|t| {
            t.chain.as_mut().unwrap()[0].next = vec![(h(CONDITION).into(), 30)]
        })),
        ("a fallback named for a payment task", Box::new(|t| {
            t.chain.as_mut().unwrap()[0].next = vec![(h(PAY).into(), 30)]
        })),
        ("a fallback that is an extension", Box::new(|t| {
            t.chain.as_mut().unwrap()[0].next = vec![(h(EXT).into(), 30)]
        })),
        ("a fallback that is the anchoring cMIP", Box::new(|t| {
            t.chain.as_mut().unwrap()[0].next = vec![(h(ANCHOR).into(), 30)]
        })),
        ("a fallback twice", Box::new(|t| {
            t.chain.as_mut().unwrap()[0].next = vec![(h(CONDITION2).into(), 30), (h(CONDITION2).into(), 30)]
        })),
        ("one fallback for two judges", Box::new(|t| {
            t.chain.as_mut().unwrap().insert(1, ChainLink { judge: Judge::Task(11), next: vec![(h(CONDITION2).into(), 30)] })
        })),
        ("an identity the terms name as no judge", Box::new(|t| {
            t.chain.as_mut().unwrap()[1].judge = Judge::Identity(h(ARBITRATOR2))
        })),
        ("links out of order", Box::new(|t| t.chain.as_mut().unwrap().reverse())),
    ];
    for (why, f) in bad {
        let mut t = label_with_chain();
        f(&mut t);
        assert!(check(&t).is_err(), "{why}");
    }
    // F249, F250: the split service left the chain of judgment. A link
    // following it (`[ 2 ]`) no longer decodes: its backups are the split
    // cMIP's fields, terms field 29.
    let mut t = label_with_chain();
    t.split_grant = Some(h(94));
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(21) {
            if let Value::Array(links) = v {
                let next = Value::Array(vec![Value::Array(vec![Value::Bytes(h(95).to_vec()), Value::Uint(30)])]);
                links.insert(0, Value::Array(vec![Value::Array(vec![Value::Uint(2)]), next]));
            }
        }
    }
    assert!(matches!(Terms::decode(&m), Err(AgreementsError::Check(w)) if w.contains("F250")));
    // The abandonment authority, named as an identity, may be followed.
    let mut t = label();
    t.time = Some((h(CLOCK), Value::Uint(0)));
    t.chain = Some(vec![ChainLink { judge: Judge::Identity(h(AUTHORITY)), next: vec![(h(96).into(), 30)] }]);
    assert_eq!(check(&t), Ok(()));
}

/// Freeze suite v21, 3.7p (Q7): each link of the chain names a period, on
/// the time reference, after which the next may act; the time reference is
/// compulsory wherever a judge can stay silent.
#[test]
fn a_chain_of_judgment_has_periods_on_a_compulsory_time_reference() {
    let t = label_with_chain();
    let l = &t.chain.as_ref().unwrap()[1];
    assert_eq!(l.next, vec![(h(ARBITRATOR2).into(), 30)]);
    assert!(l.can_stay_silent());
    // No time reference where an arbitrator can stay silent: invalid.
    let mut x = t.clone();
    x.time = None;
    assert!(check(&x).is_err());
    // A chain following only specifications needs none: they always answer.
    x.chain.as_mut().unwrap().truncate(1);
    assert_eq!(check(&x), Ok(()));
    // A period of zero is no period.
    let mut x = t.clone();
    x.chain.as_mut().unwrap()[1].next[0].1 = 0;
    assert!(check(&x).is_err());
    // A link without its period does not decode.
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(21) {
            *v = Value::Array(vec![Value::Array(vec![
                Judge::Task(9).to_value(),
                Value::Array(vec![Value::Bytes(h(CONDITION2).to_vec())]),
            ])]);
        }
    }
    assert!(Terms::decode(&m).is_err());
    // The arbitrator is asked and says nothing: before its 30 days pass the
    // chain waits; after, the second arbitrator rules; where the time
    // reference cannot tell, the answer is undetermined.
    let silent = |p| Step::<&str>::Silent { period_passed: p };
    assert_eq!(chain_answer(&[silent(Some(false)), Step::Answer("for")]), ChainAnswer::Waiting { on: 0 });
    assert_eq!(
        chain_answer(&[silent(Some(true)), Step::Answer("for")]),
        ChainAnswer::Decided { by: 1, answer: "for" }
    );
    assert_eq!(chain_answer(&[silent(None), Step::Answer("for")]), ChainAnswer::Undetermined { on: 0 });
    assert_eq!(chain_answer(&[silent(Some(true)), Step::Unknown]), ChainAnswer::Unknown);
}

/// Q8 and S1: stakes (field 7), the collective's own among them, written
/// null: "this collective".
#[test]
fn stakes_are_written_in_millionths() {
    let id = |n: u8| Who::Id(h(n));
    let mut t = label();
    t.stakes = Some(vec![
        Stake { object: Who::This, holders: vec![(id(1), 500_000), (id(2), 250_000), (id(4), 250_000)] },
        Stake { object: id(70), holders: vec![(Who::This, 1_000_000)] },
    ]);
    assert_eq!(check(&t), Ok(()));
    assert_eq!(roundtrip(&t), t);
    assert_eq!(t.own_stake().map(|(i, s)| (i, s.share_of(&id(4)))), Some((0, 250_000)));
    assert_eq!(t.stake_on(&id(70)).map(|(i, _)| i), Some(1));
    let bad: Vec<(&str, Change)> = vec![
        ("short of the whole", Box::new(|t| t.stakes.as_mut().unwrap()[0].holders[0].1 = 499_999)),
        ("a zero share", Box::new(|t| t.stakes.as_mut().unwrap()[0].holders.push((Who::Id(h(5)), 0)))),
        ("a holder twice", Box::new(|t| t.stakes.as_mut().unwrap()[0].holders[2].0 = Who::Id(h(1)))),
        ("one object twice", Box::new(|t| {
            let s = t.stakes.as_ref().unwrap()[0].clone();
            t.stakes.as_mut().unwrap().push(s)
        })),
        ("the collective holding itself", Box::new(|t| t.stakes.as_mut().unwrap()[0].holders[0].0 = Who::This)),
    ];
    for (why, f) in bad {
        let mut x = t.clone();
        f(&mut x);
        assert!(check(&x).is_err(), "{why}");
    }
    // Stakes are operational: a clone changing them needs the clone rule.
    let mut c = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    c.stakes.as_mut().unwrap()[0].holders = vec![(id(1), 400_000), (id(2), 350_000), (id(4), 250_000)];
    assert_eq!(needs(&t, &c), vec![Power::Clone]);
    // The release rule (field 24): a clone changing it needs the clone rule
    // (and every owner's signature, judged with the acts, N8).
    let mut x = t.clone();
    x.release_rule = Some(ReleaseRule::Holders(HoldersRule::Share(500_000)));
    assert_eq!(check(&x), Ok(()));
    assert_eq!(roundtrip(&x), x);
    let mut c = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    c.release_rule = Some(ReleaseRule::Holders(HoldersRule::Share(500_000)));
    assert_eq!(needs(&t, &c), vec![Power::Clone]);
    // Forked from (field 23): a back-link in founding terms of a collective.
    x.forked_from = Some(h(80));
    assert_eq!(check(&x), Ok(()));
    assert_eq!(roundtrip(&x), x);
    let mut c = clone_of(&x, vec![(Power::Clone, vec![h(1), h(2)])]);
    c.text = "Other words.".into();
    assert!(check(&c).is_err(), "a clone names no original it forked from");
}

/// F121, F124 N5: the departed members entry records only who left, in a
/// collective; their stake is in field 7; it is constitutional.
#[test]
fn the_departed_members_entry_records_who_left() {
    let mut t = label();
    t.stakes = Some(vec![Stake {
        object: Who::This,
        holders: vec![(Who::Id(h(1)), 500_000), (Who::Id(h(2)), 250_000), (Who::Id(h(4)), 250_000)],
    }]);
    t.departed = Some(vec![h(4)]);
    assert_eq!(check(&t), Ok(()));
    assert_eq!(roundtrip(&t), t);
    let bad: Vec<(&str, Change)> = vec![
        ("a party", Box::new(|t| t.departed.as_mut().unwrap()[0] = h(1))),
        ("one holder twice", Box::new(|t| t.departed.as_mut().unwrap().push(h(4)))),
        ("no share of the collective", Box::new(|t| t.departed.as_mut().unwrap().push(h(5)))),
        ("in a deal", Box::new(|t| {
            t.grammar = None;
            t.areas = None;
            t.area_words = None;
            t.clone = Rule::All;
        })),
    ];
    for (why, f) in bad {
        let mut x = t.clone();
        f(&mut x);
        assert!(check(&x).is_err(), "{why}");
    }
    let mut c = clone_of(&t, vec![(Power::Constitutional, vec![h(1), h(2), h(3)])]);
    c.departed = None;
    assert_eq!(needs(&t, &c), vec![Power::Constitutional]);
}

/// F122 (flaw K1, revising F120): a version changing the constitution and
/// a judge needs the constitutional change rule and every member for the
/// judge, its mark naming both.
#[test]
fn a_constitutional_version_changing_a_judge_needs_both_rules() {
    let p = label();
    let mut c = clone_of(&p, vec![(Power::Constitutional, vec![h(1), h(2), h(3)])]);
    c.text = "New words.".into();
    c.cmips = vec![(6, h(PAY)), (11, h(ANCHOR + 7))];
    assert_eq!(needs(&p, &c), vec![Power::Constitutional, Power::Judicial]);
    let mut p2 = label();
    p2.constitutional = Some(Rule::Threshold(2));
    let mut c2 = c.clone();
    c2.constitutional = Some(Rule::Threshold(2));
    assert_eq!(
        powers_needed(&p2, &c2, &mirs(), &ext_layers),
        Ok(vec![Power::Constitutional, Power::Judicial])
    );
    // A constitutional version that changes no judge needs that rule alone.
    c2.cmips = p2.cmips.clone();
    assert_eq!(needs(&p2, &c2), vec![Power::Constitutional]);
}

// ---------------------------------------------------------------- step 12b, the open formats

/// F249, F250 (step 13): the split service's backups, in order, and what
/// counts as a failed attempt, are fields of the split cMIP the plan names,
/// carried in terms field 29 and signed with the terms; judicial, as field
/// 14 (rule 44a), so no area holder changes where money may go.
#[test]
fn backups_are_the_split_cmips_fields_signed_with_the_terms() {
    use agreements::{changes, Backups, Change, ServiceGrants, Tier};
    let failure = Value::Map(vec![(Value::Uint(0), Value::Uint(60))]);
    let mut t = label();
    t.split_grant = Some(h(94));
    t.stakes = Some(vec![Stake { object: Who::This, holders: vec![(Who::Id(h(1)), 1_000_000)] }]);
    t.plan = Some(plan_with(vec![agreements::ShareRule::Stake { stake: 0, part: 1_000_000 }]));
    t.backups = Some(Backups { services: vec![h(95).into(), h(96).into()], failure: Some(failure.clone()) });
    check(&t).unwrap();
    assert_eq!(roundtrip(&t), t);
    assert_eq!(t.backups.as_ref().unwrap().grants(), vec![h(95), h(96)]);
    assert_eq!(t.split_cmip(), Some(h(80)));
    // The split cMIP named in field 2 (task 8) serves as well.
    let mut x = t.clone();
    x.plan = None;
    x.cmips.insert(1, (8, h(80)));
    check(&x).unwrap();
    // Judicial, as field 14: compared by a clone, and changed only by the
    // judicial tier.
    let mut c = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    c.backups = Some(Backups { services: vec![h(95).into()], failure: Some(failure.clone()) });
    let ch = changes(&t, &c);
    assert!(ch.contains(&Change::Field(29)), "{ch:?}");
    assert_eq!(Change::Field(29).tier(), Tier::Judicial);
    assert_eq!(Change::Field(14).tier(), Tier::Judicial);

    let bad: Vec<(&str, Box<dyn Fn(&mut Terms)>)> = vec![
        ("no split service in field 14", Box::new(|t| t.split_grant = None)),
        ("no split cMIP named", Box::new(|t| t.plan = None)),
        ("two split cMIPs", Box::new(|t| t.cmips.push((8, h(81))))),
        ("a group of grants in a collective", Box::new(|t| t.backups.as_mut().unwrap().services[0] = ServiceGrants::PerPayee(vec![h(97), h(98)]))),
        ("field 14's grant again", Box::new(|t| t.backups.as_mut().unwrap().services[0] = h(94).into())),
        ("one backup twice", Box::new(|t| t.backups.as_mut().unwrap().services[1] = h(95).into())),
    ];
    for (why, f) in bad {
        let mut x = t.clone();
        f(&mut x);
        assert!(check(&x).is_err(), "{why}");
    }
    // Malformed: no services.
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(29) {
            *v = Value::Map(vec![(Value::Uint(1), failure.clone())]);
        }
    }
    assert!(matches!(Terms::decode(&m), Err(AgreementsError::Shape(_))));

    // In a deal: one grant per payee for each backup, as many as field 14
    // lists (H6's grants per payee stay).
    let mut d = label();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.abandonment = None;
    d.clone = Rule::All;
    d.parties = vec![h(1), h(2)];
    d.payee_grants = Some(vec![h(94), h(93)]);
    d.stakes = Some(vec![Stake { object: Who::Id(h(77)), holders: vec![(Who::Id(h(1)), 500_000), (Who::Id(h(2)), 500_000)] }]);
    d.plan = Some(plan_with(vec![agreements::ShareRule::Stake { stake: 0, part: 1_000_000 }]));
    d.backups = Some(Backups { services: vec![ServiceGrants::PerPayee(vec![h(95), h(96)])], failure: None });
    check(&d).unwrap();
    assert_eq!(roundtrip(&d), d);
    let mut x = d.clone();
    x.backups = Some(Backups { services: vec![ServiceGrants::PerPayee(vec![h(95)])], failure: None });
    assert!(check(&x).is_err(), "a group short of a payee");
    x.backups = Some(Backups { services: vec![h(95).into()], failure: None });
    assert!(check(&x).is_err(), "one grant for a deal's backup");
}

fn plan_with(shares: Vec<agreements::ShareRule>) -> agreements::SplitPlan {
    agreements::SplitPlan {
        shares,
        cmip: h(80),
        unfilled: agreements::Unfilled::Stakes,
        top: vec![],
        service_bears_rail_fees: false,
        max_rail_fee: None,
        params: None,
        metrics: vec![],
    }
}

fn label_with_stake() -> Terms {
    let mut t = label();
    t.stakes = Some(vec![Stake { object: Who::Id(h(40)), holders: vec![(Who::Id(h(1)), 600_000), (Who::Id(h(2)), 400_000)] }]);
    t
}

/// Step 12b: the split plan (terms field 8) has its format. A role share is
/// named by its role, never a transport cMIP's hash (review 7.2); a plan
/// writing no choice for an unfilled role sends it to the stakes (F218).
#[test]
fn f12b_the_split_plan_round_trips_roles_by_name_unfilled_to_the_stakes() {
    let mut t = label_with_stake();
    t.plan = Some(plan_with(vec![
        agreements::ShareRule::Stake { stake: 0, part: 880_000 },
        agreements::ShareRule::Role { role: "relay".into(), part: 50_000 },
        agreements::ShareRule::Receiver { receiver: h(81), part: 70_000 },
    ]));
    // F280: the role and the named receiver are overhead, off the top.
    t.plan.as_mut().unwrap().top = vec![1, 2];
    assert_eq!(roundtrip(&t), t);
    check(&t).unwrap();
    // Absent field 3 reads as [0], to the stakes (F218).
    let Value::Map(pm) = t.plan.as_ref().unwrap().to_value() else { panic!() };
    assert!(!pm.iter().any(|(k, _)| *k == Value::Uint(3)), "the default is not written");
    assert_eq!(roundtrip(&t).plan.unwrap().unfilled, agreements::Unfilled::Stakes);
    // A role carrying a cMIP's hash and type, as the proposal drafted it,
    // is not a role share (review 7.2).
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(8) {
            *v = Value::Map(vec![
                (Value::Uint(0), Value::Array(vec![Value::Array(vec![Value::Uint(1), Value::Text("relay".into()), Value::Array(vec![Value::Uint(1), Value::Bytes(h(82).to_vec()), Value::Uint(0)]), Value::Uint(5)])])),
                (Value::Uint(1), Value::Bytes(h(80).to_vec())),
            ]);
        }
    }
    assert!(Terms::decode(&m).is_err());
    // A stake index outside field 7 is refused.
    let mut bad = t.clone();
    bad.plan = Some(plan_with(vec![agreements::ShareRule::Stake { stake: 3, part: 1 }]));
    assert!(matches!(check(&bad), Err(AgreementsError::Check(_))));
    // Fees are not the plan's: key 2 is refused (F213).
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(8) {
            if let Value::Map(pm) = v {
                pm.push((Value::Uint(2), Value::Array(vec![])));
            }
        }
    }
    assert!(matches!(Terms::decode(&m), Err(AgreementsError::Check(w)) if w.contains("F213")));
}

/// F213, decided by Nobody, allegedly, 10 October 2026: fees are their own
/// field (28), so a constitution places them on their own: an area may
/// reach fees without the plan, and the plan without fees. A clone adding a
/// fee changes field 28, not field 8, so the plan's holder alone cannot add
/// one. F214: each fee carries its scope.
#[test]
fn f213_fees_are_their_own_field_placed_by_areas() {
    let mut t = label_with_stake();
    t.plan = Some(plan_with(vec![agreements::ShareRule::Stake { stake: 0, part: 1 }]));
    t.fees = Some(vec![
        agreements::Fee { module: h(83), part: 20_000, scope: agreements::FeeScope::Every },
        agreements::Fee { module: h(84), part: 10_000, scope: agreements::FeeScope::Rail(h(PAY)) },
    ]);
    // The treasurer's area reaches the plan; the release manager's, fees.
    t.areas.as_mut().unwrap()[1].fields = Some(vec![FieldRef::Field(8)]);
    t.areas.as_mut().unwrap()[0].fields = Some(vec![FieldRef::Field(agreements::FEES_FIELD)]);
    assert_eq!(roundtrip(&t), t);
    check(&t).unwrap();
    let mut c = t.clone();
    c.fees.as_mut().unwrap().push(agreements::Fee { module: h(85), part: 50_000, scope: agreements::FeeScope::Publication(h(86)) });
    assert_eq!(agreements::changes(&t, &c), vec![agreements::Change::Field(agreements::FEES_FIELD)], "a new fee changes field 28 only");
    let need = needs(&t, &c);
    assert_eq!(need, vec![Power::Area(1)], "the area holding fees, not the plan's holder");
    // Unplaced, fees fall to the clone rule, never to the plan's holder.
    let mut u = t.clone();
    u.areas.as_mut().unwrap()[0].fields = None;
    let mut uc = u.clone();
    uc.fees = None;
    assert_eq!(needs(&u, &uc), vec![Power::Clone]);
}

/// F219 (OF7 a, the mechanic delegated with it): refund terms are a fixed
/// point on the agreement's time reference, so terms carrying field 17
/// name one (rule 33).
#[test]
fn f219_refund_terms_are_a_point_on_the_time_reference() {
    let mut t = label();
    t.refund = Some(agreements::RefundTerms { until: Value::Uint(900_000) });
    assert!(matches!(check(&t), Err(AgreementsError::Check(w)) if w.contains("time reference")));
    t.time = Some((h(CLOCK), Value::Null));
    check(&t).unwrap();
    assert_eq!(roundtrip(&t), t);
    // A period is not a form (F219: a fixed point).
    let mut m = t.to_map();
    for (k, v) in m.iter_mut() {
        if *k == Value::Uint(17) {
            *v = Value::Map(vec![(Value::Uint(0), Value::Array(vec![Value::Uint(1), Value::Uint(100)]))]);
        }
    }
    assert!(Terms::decode(&m).is_err());
}

/// Agreements draft 12 (F280, decided by Nobody, allegedly: "Shared
/// ownership means shared fruits"): a share paying anyone but a stake (a
/// named receiver, a role, a metric share) is paid off the top only, as
/// overhead; what is left goes to the stakes alone. A plan putting a
/// non-owner in the rest is refused by the terms' check (it still decodes,
/// so a client can explain the refusal);
/// the same share off the top is accepted. Freeze suite v24, the split
/// plan's line.
#[test]
fn f280_a_non_owner_is_paid_off_the_top_only() {
    let metric = agreements::Metric { module: h(85), measurer: h(86), params: None };
    let cases: Vec<(&str, agreements::ShareRule)> = vec![
        ("a named receiver", agreements::ShareRule::Receiver { receiver: h(81), part: 100_000 }),
        ("a role", agreements::ShareRule::Role { role: "relay".into(), part: 100_000 }),
        ("a metric share", agreements::ShareRule::Metric { metric: 0, part: 100_000 }),
    ];
    for (name, share) in cases {
        let mut t = label_with_stake();
        let mut plan = plan_with(vec![agreements::ShareRule::Stake { stake: 0, part: 900_000 }, share]);
        plan.metrics = vec![metric.clone()];
        t.plan = Some(plan);
        // Read, so a client can explain it; refused by the check.
        assert_eq!(roundtrip(&t), t, "{name} in the rest is still read");
        assert!(matches!(check(&t), Err(AgreementsError::Check(w)) if w.contains("F280")), "{name} in the rest is refused");
        t.plan.as_mut().unwrap().top = vec![1];
        assert_eq!(roundtrip(&t), t, "{name} off the top");
        check(&t).unwrap();
    }
    // Stakes may be weighted against one another in the rest, or one taken
    // off the top: weights between stakes are a business choice (F280).
    let mut t = label_with_stake();
    t.stakes.as_mut().unwrap().push(Stake { object: Who::Id(h(41)), holders: vec![(Who::Id(h(1)), 1_000_000)] });
    t.plan = Some(plan_with(vec![agreements::ShareRule::Stake { stake: 0, part: 3 }, agreements::ShareRule::Stake { stake: 1, part: 1 }]));
    check(&t).unwrap();
    t.plan.as_mut().unwrap().top = vec![1];
    check(&t).unwrap();
}

// ---------------------------------------------------------------- Agreements draft 14's formats

/// The label with a stake in itself (Q8), Ana 60%, Ben 40%, and a departed
/// holder (h 9) at 10% taken from both.
fn label_owned() -> Terms {
    let mut t = label();
    t.stakes = Some(vec![Stake {
        object: Who::This,
        holders: vec![(Who::Id(h(1)), 500_000), (Who::Id(h(2)), 400_000), (Who::Id(h(9)), 100_000)],
    }]);
    t
}

fn decode_raw(t: &Terms, f: &dyn Fn(&mut Vec<(Value, Value)>)) -> Result<Terms, AgreementsError> {
    let mut m = t.to_map();
    f(&mut m);
    let bytes = cbor::encode(&Value::Map(m));
    let Value::Map(m) = cbor::decode(&bytes).unwrap() else { panic!() };
    Terms::decode(&m)
}

fn set(m: &mut Vec<(Value, Value)>, k: u64, v: Value) {
    m.retain(|(x, _)| x != &Value::Uint(k));
    m.push((Value::Uint(k), v));
}

/// Freeze suite v28, 3.8d (F328, Q15): a succession plan whose key 2 writes
/// a voting weight beside a seat successor (draft 13's `[successor,
/// weight]`) is out of format, whatever the weight; key 2 listing the seat
/// successors alone is valid.
#[test]
fn a_seat_weight_is_out_of_format_3_8d() {
    let mut t = label();
    t.succession = Some(vec![SuccessionPlan { party: h(1), stakes: None, seats: Some(vec![h(3)]), entry: Some(1) }]);
    assert_eq!(roundtrip(&t), t, "seat successors alone");
    for w in [1u64, 2] {
        let got = decode_raw(&t, &|m| {
            let plan = Value::Map(vec![
                (Value::Uint(0), Value::Bytes(h(1).to_vec())),
                (Value::Uint(2), Value::Array(vec![Value::Array(vec![Value::Bytes(h(3).to_vec()), Value::Uint(w)])])),
                (Value::Uint(3), Value::Uint(1)),
            ]);
            set(m, 16, Value::Array(vec![plan]));
        });
        assert!(matches!(&got, Err(AgreementsError::Check(e)) if e.contains("no voting weight")), "weight {w}: {got:?}");
    }
}

/// Freeze suite v28, 3.7ah (F308, F311), the formats: a change rule by share
/// and "all of" for fields 5 and 18; a rule among a stake's holders for
/// field 18 only; "all of" lists two rules or more, none nested; a rule by
/// share for keepers, or as a deal's clone rule, is invalid; the release
/// rule counted by share, its head count `[1, k]` invalid (F328's reading
/// on field 24).
#[test]
fn rules_by_share_have_their_fields_3_7ah() {
    let by_share = Rule::ByShare { stake: 0, share: 600_000 };
    let mut t = label_owned();
    t.clone = by_share.clone();
    check(&t).unwrap();
    assert_eq!(roundtrip(&t), t);
    t.constitutional = Some(Rule::AllOf(vec![Rule::Threshold(2), Rule::Holders { stake: 0, share: 600_000 }]));
    t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
    check(&t).unwrap();
    assert_eq!(roundtrip(&t), t);
    // "All of" with one rule, or nested.
    let mut x = t.clone();
    x.constitutional = Some(Rule::AllOf(vec![Rule::Threshold(2)]));
    assert!(check(&x).is_err());
    x.constitutional = Some(Rule::AllOf(vec![Rule::Threshold(2), Rule::AllOf(vec![Rule::All, by_share.clone()])]));
    assert!(check(&x).is_err(), "none nested");
    // Among a stake's holders: field 18 only.
    let mut x = t.clone();
    x.clone = Rule::Holders { stake: 0, share: 600_000 };
    assert!(check(&x).is_err(), "the clone rule counts among the parties");
    // A stake that field 7 does not define; a share of nothing or more than a whole.
    let mut x = t.clone();
    x.clone = Rule::ByShare { stake: 1, share: 600_000 };
    assert!(check(&x).is_err());
    x.clone = Rule::ByShare { stake: 0, share: 0 };
    assert!(check(&x).is_err());
    x.clone = Rule::ByShare { stake: 0, share: 1_000_001 };
    assert!(check(&x).is_err());
    // Keepers count keepers, never shares.
    let mut k = label_owned();
    k.keepers = Some(agreements::Keepers { operators: vec![h(80)], rule: Rule::All });
    let got = decode_raw(&k, &|m| {
        set(m, 3, Value::Array(vec![Value::Array(vec![Value::Bytes(h(80).to_vec())]), by_share.to_value()]));
    });
    assert!(got.is_err(), "{got:?}");
    // A deal's clone rule is every party.
    let mut d = label_owned();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.stakes = Some(vec![Stake { object: Who::Id(h(40)), holders: vec![(Who::Id(h(1)), 600_000), (Who::Id(h(2)), 400_000)] }]);
    d.clone = by_share.clone();
    assert!(check(&d).is_err());
    // The release rule, by share; a number of heads is invalid.
    let mut r = label_owned();
    r.release_rule = Some(ReleaseRule::Holders(HoldersRule::Share(500_000)));
    check(&r).unwrap();
    assert_eq!(roundtrip(&r), r);
    let got = decode_raw(&r, &|m| set(m, 24, Rule::Threshold(2).to_value()));
    assert!(matches!(&got, Err(AgreementsError::Check(e)) if e.contains("never by head")), "{got:?}");
}

/// Freeze suite v28, 1.9g and 3.7aj (F307, F314, F328 Q14), the formats: a
/// holders' rule per stake (field 30), ascending, a collective's only; terms
/// of a deal carrying it are invalid; a standing waiver of pre-emption
/// written `true`; an issuance naming no offer (`[0]`, field 32) only under
/// a standing waiver, and only in a collective's clone; field 31 a deal's
/// clone's.
#[test]
fn a_holders_rule_is_a_collectives_only_1_9g_3_7aj() {
    let mut t = label_owned();
    t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(600_000), waived: false }]);
    check(&t).unwrap();
    assert_eq!(roundtrip(&t), t);
    t.holders_rules.as_mut().unwrap()[0].waived = true;
    assert_eq!(roundtrip(&t), t);
    let got = decode_raw(&t, &|m| {
        set(m, 30, Value::Array(vec![Value::Array(vec![Value::Uint(0), Value::Array(vec![Value::Uint(3), Value::Uint(600_000)]), Value::Bool(false)])]))
    });
    assert!(got.is_err(), "a waiver is written true");
    let mut x = t.clone();
    x.holders_rules = Some(vec![agreements::HoldersEntry { stake: 1, rule: HoldersRule::Every, waived: false }]);
    assert!(check(&x).is_err(), "a stake of field 7");
    // A deal: invalid.
    let mut d = label_owned();
    d.grammar = None;
    d.areas = None;
    d.area_words = None;
    d.clone = Rule::All;
    d.stakes = Some(vec![Stake { object: Who::Id(h(40)), holders: vec![(Who::Id(h(1)), 600_000), (Who::Id(h(2)), 400_000)] }]);
    check(&d).unwrap();
    d.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(600_000), waived: false }]);
    assert!(matches!(check(&d), Err(AgreementsError::Check(e)) if e.contains("a deal carries no holders' rule")));
    // Field 32: a collective's clone only; `[0]` only under a standing waiver.
    let mut c = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    c.issues_under = Some(agreements::IssuesUnder::Waived);
    assert_eq!(roundtrip(&c), c);
    check(&c).unwrap();
    c.holders_rules.as_mut().unwrap()[0].waived = false;
    assert!(check(&c).is_err(), "no standing waiver");
    let mut f = t.clone();
    f.issues_under = Some(agreements::IssuesUnder::Offer(h(50)));
    assert!(check(&f).is_err(), "founding terms are no issuance");
    // Field 31: a deal's clone's.
    let mut x = clone_of(&t, vec![(Power::Clone, vec![h(1), h(2)])]);
    x.transfers_counted = Some(vec![h(51)]);
    assert!(check(&x).is_err(), "a collective counts the transfers its line placed");
    let mut dc = d.clone();
    dc.holders_rules = None;
    let mut dc = clone_of(&dc, vec![(Power::Clone, vec![h(1), h(2)])]);
    dc.transfers_counted = Some(vec![h(51), h(52)]);
    assert_eq!(roundtrip(&dc), dc);
    check(&dc).unwrap();
    dc.transfers_counted = Some(vec![h(52), h(51)]);
    assert!(check(&dc).is_err(), "ascending");
}

/// Freeze suite v28, 3.7an (F328, Q11): a constitution counting membership
/// among a stake's holders needs an abandonment clause allowing outcome 1
/// or 2, whose authority can declare each holder who is no party; otherwise
/// the terms are invalid.
#[test]
fn owners_who_vote_on_membership_can_be_declared_absent_3_7an() {
    let mut t = label_owned();
    t.constitutional = Some(Rule::Holders { stake: 0, share: 600_000 });
    t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::VOICE_REMOVED];
    assert!(matches!(check(&t), Err(AgreementsError::Check(e)) if e.contains("F328")));
    t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_TRANSFERRED];
    check(&t).unwrap();
    // An authority that is itself a holder who is no party cannot declare itself.
    t.abandonment.as_mut().unwrap().authority = Authority::Named(h(9));
    assert!(check(&t).is_err());
}
