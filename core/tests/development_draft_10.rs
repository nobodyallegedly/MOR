//! Development draft 10, the specification format decoded whole (F322,
//! F323, F325, F301; F328 Q4 to Q10), with Money draft 8's rule 11 read
//! element by element, and rule 3's unclaimed publication (F328, Q9).
//! Freeze suite v28: 8.3, 8.8 to 8.11, the F328 Q9 scenario, 2.4i.

mod common;

use common::*;
use mor_core::cbor::{self, Value};
use mor_core::chain::SpecClaim;
use mor_core::development::{kinds, Bound, Known, RailKind, Spec};
use mor_core::hash::{sha256, Hash};

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn content(fields: Vec<(u64, Value)>) -> Vec<u8> {
    cbor::encode(&Value::Map(fields.into_iter().map(|(k, v)| (Value::Uint(k), v)).collect()))
}

fn b(x: Hash) -> Value {
    Value::Bytes(x.to_vec())
}

fn t(s: &str) -> Value {
    Value::Text(s.into())
}

fn arr(v: Vec<u64>) -> Value {
    Value::Array(v.into_iter().map(Value::Uint).collect())
}

fn payment() -> Known {
    Known { payment_cmip: Some(h("the payment cMIP")) }
}

fn rail_module(kind: u64, binds: Vec<u64>) -> Vec<u8> {
    content(vec![
        (0, Value::Uint(kinds::MODULE)),
        (1, b(h("a creator"))),
        (5, b(h("the payment cMIP"))),
        (9, t("A rail Module.")),
        (11, Value::Uint(kind)),
        (13, arr(binds)),
    ])
}

/// What each kind must carry (F322, F325, F328 Q6, Q10).
#[test]
fn each_kind_carries_its_required_fields_8_8_8_10() {
    let k = Known::default();
    let ok = |c: Vec<(u64, Value)>| Spec::decode(&content(c), &k);
    assert!(ok(vec![(0, Value::Uint(kinds::CMIP)), (1, b(h("a creator"))), (9, t("A cMIP."))]).is_ok());
    assert!(ok(vec![(0, Value::Uint(kinds::CMIP)), (9, t("A cMIP."))]).is_err(), "a cMIP names its creator");
    // A Module names what it implements, a cMIP or a MIR (F328 Q6).
    assert!(ok(vec![(0, Value::Uint(kinds::MODULE)), (1, b(h("a creator"))), (9, t("A Module."))]).is_err());
    assert!(ok(vec![(0, Value::Uint(kinds::MODULE)), (1, b(h("a creator"))), (5, b(h("the Identity MIR"))), (9, t("A seed Module."))]).is_ok());
    // A MIR, the MICS document and a test suite name no creator (F291).
    for kind in [kinds::MIR, kinds::MICS, kinds::TEST_SUITE] {
        assert!(ok(vec![(0, Value::Uint(kind)), (9, t("A text."))]).is_ok(), "kind {kind}");
        assert!(ok(vec![(0, Value::Uint(kind)), (1, b(h("a creator"))), (9, t("A text."))]).is_err(), "kind {kind} with a creator");
    }
    // A MIP names its creator and what it forks, or the MICS document for a
    // new layer (F325, F328 Q10).
    assert!(ok(vec![(0, Value::Uint(kinds::MIP)), (1, b(h("a proposer"))), (9, t("A proposal."))]).is_err(), "a MIP names what it forks");
    assert!(ok(vec![(0, Value::Uint(kinds::MIP)), (9, t("A proposal.")), (8, b(h("the Money MIR")))]).is_err(), "a MIP names its creator");
    let mip = ok(vec![(0, Value::Uint(kinds::MIP)), (1, b(h("a proposer"))), (8, b(h("the MICS document"))), (9, t("A new layer."))]).unwrap();
    assert_eq!(mip.predecessor, Some(h("the MICS document")));
    assert!(ok(vec![(0, Value::Uint(9)), (1, b(h("a creator"))), (9, t("?"))]).is_err(), "no kind 9");
    // Fields 3 and 4 are discovery only: absent, nothing is missing.
    let full = ok(vec![
        (0, Value::Uint(kinds::CMIP)),
        (1, b(h("a creator"))),
        (2, Value::Array(vec![Value::Array(vec![b(h("Agreements")), Value::Uint(4)])])),
        (3, Value::Array(vec![Value::Array(vec![Value::Uint(0), t("an act"), t("{ 0 => tstr }")])])),
        (4, Value::Array(vec![b(h("the Text MIR"))])),
        (9, t("A cMIP with every discovery field.")),
    ])
    .unwrap();
    assert_eq!(full.tasks, Some(vec![(h("Agreements"), 4)]));
}

/// F323: content not in the format is no specification (8.3): field 10 out
/// of order, a field the format does not define, a text that is not
/// canonical, a rule reference without its profile (F328 Q7).
#[test]
fn content_not_in_the_format_is_no_specification_8_3() {
    let k = Known::default();
    let base = |extra: Vec<(u64, Value)>| {
        let mut f = vec![(0, Value::Uint(kinds::CMIP)), (1, b(h("a creator"))), (9, t("An extension."))];
        f.extend(extra);
        Spec::decode(&content(f), &k)
    };
    assert!(base(vec![(10, arr(vec![0, 3]))]).is_ok());
    assert!(base(vec![(10, arr(vec![3, 0]))]).is_err(), "not ascending");
    assert!(base(vec![(10, arr(vec![5]))]).is_err(), "not a layer");
    assert!(base(vec![(10, arr(vec![1, 2, 4]))]).is_ok(), "Text, Envelopes and Agreements are layers 1, 2 and 4");
    assert!(base(vec![(14, Value::Uint(1))]).is_err(), "a field the format does not define");
    assert!(base(vec![(12, Value::Bool(true))]).is_ok());
    assert!(base(vec![(12, Value::Bool(false))]).is_err());
    assert!(base(vec![(6, Value::Array(vec![Value::Array(vec![b(h("bytes")), Value::Uint(10), Value::Uint(1000), b(h("a profile"))])]))]).is_ok());
    assert!(base(vec![(6, Value::Array(vec![Value::Array(vec![b(h("bytes")), Value::Uint(10), Value::Uint(1000)])]))]).is_err(), "rule-ref names its profile (F328, Q7)");
    let not_canonical = content(vec![(0, Value::Uint(kinds::CMIP)), (1, b(h("a creator"))), (9, t("A text \n"))]);
    assert!(Spec::decode(&not_canonical, &k).is_err());
}

/// F301 with F328 Q5 (8.9): a rail Module under the payment cMIP carries
/// fields 11 and 13; a request rail binds payee and purpose.
#[test]
fn a_rail_modules_kind_and_binding_are_fields_of_its_specification_8_9() {
    let k = payment();
    let r = Spec::decode(&rail_module(0, vec![0, 1]), &k).unwrap().rail.unwrap();
    assert_eq!(r.kind, RailKind::Request);
    assert!(r.binds(Bound::Payee) && r.binds(Bound::Purpose) && !r.binds(Bound::PreviousHop));
    let push = Spec::decode(&rail_module(1, vec![]), &k).unwrap().rail.unwrap();
    assert_eq!(push.kind, RailKind::Push);
    assert!(push.binds.is_empty(), "a push rail may bind nothing");
    assert!(Spec::decode(&rail_module(1, vec![0, 2]), &k).is_ok());
    assert!(Spec::decode(&rail_module(0, vec![0]), &k).is_err(), "a request rail binds payee and purpose (F328, Q5)");
    assert!(Spec::decode(&rail_module(0, vec![1, 0]), &k).is_err(), "field 13 ascending");
    assert!(Spec::decode(&rail_module(0, vec![0, 1, 1]), &k).is_err(), "without repeats");
    assert!(Spec::decode(&rail_module(2, vec![0, 1]), &k).is_err(), "no rail kind 2");
    // Without fields 11 and 13, a Module naming the payment cMIP is no
    // specification.
    let bare = content(vec![(0, Value::Uint(kinds::MODULE)), (1, b(h("a creator"))), (5, b(h("the payment cMIP"))), (9, t("A rail Module."))]);
    assert!(Spec::decode(&bare, &k).is_err());
    // Fields 11 and 13 are a Module's, and go together.
    let on_cmip = content(vec![(0, Value::Uint(kinds::CMIP)), (1, b(h("a creator"))), (9, t("x")), (11, Value::Uint(0)), (13, arr(vec![0, 1]))]);
    assert!(Spec::decode(&on_cmip, &k).is_err());
    let half = content(vec![(0, Value::Uint(kinds::MODULE)), (1, b(h("a creator"))), (5, b(h("the payment cMIP"))), (9, t("x")), (11, Value::Uint(1))]);
    assert!(Spec::decode(&half, &k).is_err());
}

/// The spec hash covers the content: two publications of one text that
/// differ in an optional field are two specifications (8.8, F322).
#[test]
fn two_publications_of_one_text_differing_in_optional_fields_are_two_specifications_8_8() {
    let a = content(vec![(0, Value::Uint(kinds::CMIP)), (1, b(h("a creator"))), (9, t("The split cMIP."))]);
    let with_task = content(vec![
        (0, Value::Uint(kinds::CMIP)),
        (1, b(h("a creator"))),
        (2, Value::Array(vec![Value::Array(vec![b(h("Agreements")), Value::Uint(4)])])),
        (9, t("The split cMIP.")),
    ]);
    let (x, y) = (Spec::decode(&a, &Known::default()).unwrap(), Spec::decode(&with_task, &Known::default()).unwrap());
    assert_eq!(x.text, y.text, "one text");
    assert_ne!(Spec::hash_of(&a), Spec::hash_of(&with_task), "two specifications");
}

/// F328, Q9 (Development rule 3): a publication its creator's rotation
/// disowned leaves the specification unclaimed, whether another identity
/// relied on it or not; one relied on is shown as disputed. A publication by
/// another identity claims nothing for the named creator.
#[test]
fn a_disowned_publication_leaves_the_specification_unclaimed_whether_relied_on_or_not_q9() {
    let mut w = World::new();
    let mut h_ = w.operator("home");
    let creator = w.genesis("a creator", vec![home(&h_)], None, None);
    let mut c = creator.clone();
    let mut stranger = w.operator("a stranger");
    let mut fan = w.operator("an adopter");
    let pubn = |w: &mut World, p: &mut Person, label: &str| {
        let a = w.everyday_act(p, envelopes_spec(), 0, publication(vec![(Value::Uint(1), Value::Bytes(h(label).to_vec()))]), None, None);
        w.add(&a)
    };
    let honest = pubn(&mut w, &mut c, "the honest publication");
    let relied = pubn(&mut w, &mut c, "a thief's publication someone relied on");
    let alone = pubn(&mut w, &mut c, "a thief's publication nobody relied on");
    let by_stranger = pubn(&mut w, &mut stranger, "a stranger's copy");
    w.ack(&mut fan, relied);
    assert_eq!(w.v.specification_claim(&honest, &creator.id), SpecClaim::Claimed);
    assert_eq!(w.v.specification_claim(&by_stranger, &creator.id), SpecClaim::Unclaimed { disputed: false });
    // The creator's rotation keeps the honest publication and disowns the two.
    let kept = mor_core::identity::KeptTip { act: honest, position: 1, summary: mor_core::mmr::Mmr::from_ids(&[honest]).root() };
    let (r, _) = w.rotate(&c, Rot { kept: Some(vec![kept]), disowned: Some(vec![relied, alone]), ..Default::default() });
    w.receipt(&mut h_, &creator.id, &r, 1);
    assert_eq!(w.v.specification_claim(&honest, &creator.id), SpecClaim::Claimed);
    assert_eq!(w.v.specification_claim(&relied, &creator.id), SpecClaim::Unclaimed { disputed: true }, "relied on: unclaimed all the same, shown disputed");
    assert_eq!(w.v.specification_claim(&alone, &creator.id), SpecClaim::Unclaimed { disputed: false });
    assert_eq!(w.v.specification_claim(&h("not held"), &creator.id), SpecClaim::Unknown);
}

/// F324 (8.1): the root is the six texts; a client recomputes the six MIR
/// hashes from the texts it ships, `tagged_hash("MOR/spec", {0: 4, 9: text})`.
#[test]
fn the_six_mir_hashes_follow_from_their_texts_8_1() {
    let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../spec");
    for f in ["MIR-identity-draft-13.md", "MIR-text-draft-9.md", "MIR-envelopes-draft-10.md", "MIR-money-draft-8.md", "MIR-agreements-draft-14.md", "MIR-development-draft-10.md"] {
        let text = std::fs::read_to_string(root.join(f)).unwrap();
        mor_core::text::check(&text).unwrap_or_else(|e| panic!("{f} is not canonical text: {e}"));
        let c = Spec::mir_content(&text);
        let s = Spec::decode(&c, &Known::default()).unwrap();
        assert_eq!(s.kind, kinds::MIR);
        assert_eq!(Spec::hash_of(&c), mor_core::hash::spec_hash(&c));
    }
}

/// Development 11, "A rail Module's kind and binding": a payment cMIP is one
/// whose own field 2 lists Money's task 6, decided from bytes. A Module
/// naming one without fields 11 and 13 is no specification; naming a cMIP
/// of another task, it is a specification; naming one the verifier does
/// not hold, unknown. A Module carrying fields 11 and 13 is judged without
/// the cMIP.
#[test]
fn a_payment_cmip_is_told_by_its_own_field_2() {
    use mor_core::development::Judged;
    let money = h("the Money MIR");
    let cmip = |tasks: Vec<(Hash, u64)>| {
        content(vec![
            (0, Value::Uint(kinds::CMIP)),
            (1, b(h("a creator"))),
            (2, Value::Array(tasks.into_iter().map(|(m, t)| Value::Array(vec![b(m), Value::Uint(t)])).collect())),
            (9, t("A cMIP.")),
        ])
    };
    let payment = cmip(vec![(money, 6)]);
    let split = cmip(vec![(h("the Agreements MIR"), 8)]);
    let held = |x: &Hash| -> Option<Vec<u8>> {
        if *x == h("a payment cMIP") {
            Some(payment.clone())
        } else if *x == h("a split cMIP") {
            Some(split.clone())
        } else {
            None
        }
    };
    let module = |under: &str| content(vec![(0, Value::Uint(kinds::MODULE)), (1, b(h("a creator"))), (5, b(h(under))), (9, t("A Module."))]);
    assert!(Spec::decode(&payment, &Known::default()).unwrap().is_payment_cmip(&money));
    assert!(!Spec::decode(&split, &Known::default()).unwrap().is_payment_cmip(&money));
    assert!(matches!(Spec::decode_judged(&module("a payment cMIP"), &money, &held), Judged::NoSpecification(_)));
    assert!(matches!(Spec::decode_judged(&module("a split cMIP"), &money, &held), Judged::Spec(_)));
    assert_eq!(Spec::decode_judged(&module("a cMIP not held"), &money, &held), Judged::Unknown(h("a cMIP not held")));
    let mut rail = rail_module(0, vec![0, 1]);
    assert!(matches!(Spec::decode_judged(&rail, &money, &|_| None), Judged::Spec(_)), "fields 11 and 13 carried: no cMIP needed");
    rail.push(0);
    assert!(matches!(Spec::decode_judged(&rail, &money, &held), Judged::NoSpecification(_)), "not deterministic CBOR");
}
