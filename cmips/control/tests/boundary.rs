//! The boundary (Agreements rule 99): a control model's answer naming the
//! constitutional change rule, the judicial tier's rule or a succession
//! plan is overreaching, and refused; an operational power stands.

use mor_core::agreements::control::checked;
use mor_core::agreements::Power;

#[test]
fn an_answer_reaching_the_constitution_or_the_judicial_tier_is_refused() {
    assert!(checked(vec![Power::Constitutional]).is_err());
    assert!(checked(vec![Power::Judicial]).is_err());
    assert!(checked(vec![Power::Area(1), Power::Plan([7; 32])]).is_err());
    assert_eq!(checked(vec![Power::Area(1), Power::Layer(3)]).unwrap(), vec![Power::Area(1), Power::Layer(3)]);
}

#[test]
fn the_default_model_reads_back_what_it_packs() {
    use mor_core::agreements::control::ControlModel;
    let v = mor_core::cbor::Value::Map(vec![]);
    let a = mor_control::Default.read(&v).unwrap();
    assert!(a.areas.is_none() && a.holders_rules.is_none());
    assert!(mor_control::Default.read(&mor_core::cbor::Value::Uint(1)).is_err(), "parameters outside the format: refused");
}
