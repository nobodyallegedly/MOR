//! A publication's payload read strictly before it is signed (Agreements,
//! "Publication (type 6)"): the core decodes its fields, and the checks
//! that read the payload alone, as it does for a signed act; what its
//! `objects` must name is read with the act.

use mor_core::act::{Inside, Object};
use mor_core::agreements::{Publication, Sold, SplitPlan, Unfilled};
use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn publication(owners: Option<Hash>) -> Publication {
    Publication {
        sold: Some(vec![Sold::Bake(h("a bake"))]),
        owners,
        partners: vec![],
        service: h("a split service"),
        plan: SplitPlan { shares: vec![], cmip: h("a split cMIP"), unfilled: Unfilled::Stakes, top: vec![], service_bears_rail_fees: false, max_rail_fee: None, params: None, metrics: vec![], fees: vec![] },
        words: Some("A song.".into()),
        time: None,
        until: None,
        refund: None,
        cmips: vec![],
        designated: None,
        backups: vec![],
        failed: None,
    }
}

fn inside(payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Inside {
    Inside { spec: h("the Agreements MIR"), type_: 6, prev: None, objects, payload, position: None, summary: None, acks: None, refs: None, hint: None, salt: [0; 16] }
}

#[test]
fn a_payload_read_before_signing_is_the_publication_the_signed_act_carries() {
    let owners = h("an ownership agreement");
    let p = publication(Some(owners));
    let m = p.to_map();
    assert_eq!(Publication::decode_payload(&m).unwrap(), p);
    let signed = Publication::decode(&inside(m.clone(), Some(vec![Object { chain: owners, predecessor: owners }]))).unwrap();
    assert_eq!(signed.publication, p);
    // The objects are the act's: a payload naming an ownership agreement
    // reads, and the act whose objects do not name it is refused.
    assert!(Publication::decode(&inside(m, None)).is_err());
}

#[test]
fn a_payload_outside_the_format_is_refused_before_signing() {
    let mut m = publication(None).to_map();
    m.push((Value::Uint(13), Value::Uint(1)));
    assert!(Publication::decode_payload(&m).is_err(), "a field its format does not define");
    let mut p = publication(None);
    p.backups = vec![p.service];
    assert!(Publication::decode_payload(&p.to_map()).is_err(), "a backup that is the split service");
    let mut p = publication(None);
    p.sold = Some(vec![Sold::Vow(h("a vow"))]);
    p.words = None;
    assert!(Publication::decode_payload(&p.to_map()).is_err(), "a vow sold without words");
    let _ = cbor::encode(&Value::Null);
}
