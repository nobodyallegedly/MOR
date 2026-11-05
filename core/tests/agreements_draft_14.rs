//! Agreements draft 14, judged by the core library: Fable's A6 (F295 for
//! Agreements acts, at the verifier) and the owners' acts (types 26 to 28,
//! the default control cMIP's own since Agreements draft 19). The flows of the owners' matters are in `agreements_owners.rs`.

mod common;

use common::{agreements_spec, own_home, World};
use mor_core::act::Object;
use mor_core::agreements;
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::hash::{sha256, Hash};
use mor_core::money::Amount;

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn descending(mut v: Vec<(Hash, u64)>) -> Vec<(Hash, u64)> {
    v.sort_by(|a, b| b.0.cmp(&a.0));
    v
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object { chain: x, predecessor: x }])
}

/// Fable's A6 (Agreements Q5, taken): an Agreements act outside its type's
/// format, or of a retired or undefined type, is invalid for a verifier
/// that knows the Agreements MIR's hash, a keeper record (type 2) included;
/// an act in its format is valid.
#[test]
fn an_agreements_act_outside_its_format_is_invalid_a6() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let x = h("an agreement");
    let mut act = |w: &mut World, t: u64, p: Vec<(Value, Value)>, o: Option<Vec<Object>>| {
        let a = w.everyday_act(&mut ana, agreements_spec(), t, p, o, None);
        w.add(&a)
    };
    let live = act(&mut w, agreements::new_types::LIVENESS, agreements::Liveness { agreement: x }.to_map(), obj(x));
    assert_eq!(w.v.status(&live), Status::Valid, "in its format");
    let cases: Vec<(&str, u64, Vec<(Value, Value)>, Option<Vec<Object>>)> = vec![
        ("a liveness with no agreement", agreements::new_types::LIVENESS, vec![], obj(x)),
        ("a liveness with a field it does not define", agreements::new_types::LIVENESS, vec![(Value::Uint(0), Value::Bytes(x.to_vec())), (Value::Uint(5), Value::Uint(1))], obj(x)),
        ("terms with no text", agreements::types::TERMS, vec![(Value::Uint(0), Value::Array(vec![Value::Bytes(x.to_vec())]))], None),
        ("a signature naming nothing", agreements::types::SIGNATURE, vec![], obj(x)),
        ("the retired import", 11, vec![], obj(x)),
        ("the retired delivery confirmation", 7, vec![], obj(x)),
        ("a type Agreements does not define", 40, vec![], obj(x)),
    ];
    for (what, t, p, o) in cases {
        let a = act(&mut w, t, p, o);
        assert_eq!(w.v.status(&a), Status::Invalid, "{what}");
    }
    // The keeper record (type 2): `{ 0 => [act, signer] }`, naming no chain
    // in `objects` (Agreements 17, "Keeper record (type 2)").
    let rec = agreements::KeeperRecord { act: x, signer: h("its signer") };
    let keeper = act(&mut w, agreements::types::KEEPER_RECORD, rec.to_map(), None);
    assert_eq!(w.v.status(&keeper), Status::Valid, "a keeper record in its format");
    for (what, p, o) in [
        ("field 0 not an array", vec![(Value::Uint(0), Value::Uint(1))], None),
        ("one hash only", vec![(Value::Uint(0), Value::Array(vec![Value::Bytes(x.to_vec())]))], None),
        ("a field it does not define", [rec.to_map(), vec![(Value::Uint(1), Value::Uint(0))]].concat(), None),
        ("naming a chain in objects", rec.to_map(), obj(x)),
    ] {
        let a = act(&mut w, agreements::types::KEEPER_RECORD, p, o);
        assert_eq!(w.v.status(&a), Status::Invalid, "{what}");
    }
}

/// Agreements draft 14, "Issuance offer (type 26)" and "Proxy (type 27) and
/// revocation of a proxy (type 28)": each decoded strictly, its inside
/// naming the agreement (or the proxy) as chain and predecessor.
#[test]
fn the_owners_acts_have_their_formats() {
    // Agreements draft 19 (F426, 1): the issuance offer, the proxy and its
    // revocation are the default control cMIP's own acts, of its
    // specification; their formats are its own (`mor_control::acts`), the
    // same as when they were Agreements types 26 to 28. Under the
    // Agreements MIR's hash, an act of these types is invalid.
    use mor_control::acts::{self, types, IssuanceOffer, Proxy};
    let spec = mor_control::cmip();
    let mut w = World::new();
    let mut col = w.genesis("a collective", vec![own_home()], None, None);
    let mut dana = w.genesis("dana", vec![own_home()], None, None);
    let ag = h("the collective's agreement");
    let offer = IssuanceOffer {
        version: ag,
        stake: 0,
        size: 200_000,
        new_holders: vec![(h("an investor"), 1_000_000)],
        period: Value::Uint(1_000),
        price: Some(Amount { unit: h("a unit"), value: 10_000 }),
        words: Some("New shares, for the studio.".into()),
        more: None,
    };
    let inside = |w: &World, x: &Hash| w.v.get(x).unwrap().inside.clone();
    let a = w.everyday_act(&mut col, spec, types::ISSUANCE_OFFER, offer.to_map(), obj(ag), None);
    let o = w.add(&a);
    assert_eq!(w.v.status(&o), Status::Valid);
    assert!(acts::in_format(&inside(&w, &o)).is_ok());
    let got = IssuanceOffer::decode(&inside(&w, &o)).unwrap();
    assert_eq!(got, offer);
    let a = w.everyday_act(&mut col, agreements_spec(), types::ISSUANCE_OFFER, offer.to_map(), obj(ag), None);
    let old = w.add(&a);
    assert_eq!(w.v.status(&old), Status::Invalid, "type 26 is no Agreements type since draft 19");
    for bad in [
        IssuanceOffer { size: 0, ..offer.clone() },
        IssuanceOffer { size: 1_000_000, ..offer.clone() },
        IssuanceOffer { new_holders: vec![(h("an investor"), 600_000)], ..offer.clone() },
        IssuanceOffer { new_holders: descending(vec![(h("b"), 500_000), (h("a"), 500_000)]), ..offer.clone() },
    ] {
        let a = w.everyday_act(&mut col, spec, types::ISSUANCE_OFFER, bad.to_map(), obj(ag), None);
        let x = w.add(&a);
        assert!(acts::in_format(&inside(&w, &x)).is_err(), "{bad:?}");
    }
    let p = Proxy { version: ag, stake: 0, proxy: h("a friend"), scoped: None };
    let a = w.everyday_act(&mut dana, spec, types::PROXY, p.to_map(), obj(ag), None);
    let px = w.add(&a);
    assert!(acts::in_format(&inside(&w, &px)).is_ok());
    assert_eq!(Proxy::decode(&inside(&w, &px)).unwrap(), p);
    let a = w.everyday_act(&mut dana, agreements_spec(), types::PROXY, p.to_map(), obj(ag), None);
    let old = w.add(&a);
    assert_eq!(w.v.status(&old), Status::Invalid, "type 27 is no Agreements type since draft 19");
    let a = w.everyday_act(&mut dana, spec, types::PROXY, p.to_map(), None, None);
    let unanchored = w.add(&a);
    assert!(acts::in_format(&inside(&w, &unanchored)).is_err(), "names the agreement as chain and predecessor");
    let a = w.everyday_act(&mut dana, spec, types::PROXY_REVOCATION, acts::proxy_revocation_payload(&px), obj(px), None);
    let r = w.add(&a);
    assert!(acts::in_format(&inside(&w, &r)).is_ok());
    let a = w.everyday_act(&mut dana, spec, types::PROXY_REVOCATION, acts::proxy_revocation_payload(&px), obj(ag), None);
    let r2 = w.add(&a);
    assert!(acts::in_format(&inside(&w, &r2)).is_err(), "names the proxy as chain and predecessor");
    let a = w.everyday_act(&mut dana, spec, 29, vec![], obj(ag), None);
    let undeclared = w.add(&a);
    assert!(acts::in_format(&inside(&w, &undeclared)).is_err(), "a type the cMIP does not declare");
}
