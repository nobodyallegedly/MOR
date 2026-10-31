//! One price tag per tier (anchoring cMIP draft 7, F409: "one price tag per
//! price"): the service signs a tag at each tier's own price; a reader
//! matches each tag to the tier it prices, and refuses a tag pricing none.

use mor_anchoring::service::{Offer, Price, Terms, Tier};
use mor_core::cbor::Value;
use mor_core::envelopes::anchoring::Reference;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{Amount, PriceTag, Priced};

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn terms() -> Terms {
    Terms { reference: Reference { cmip: h("a clock"), params: Value::Uint(3) }, tiers: vec![Tier { price: Price::Fixed(50), blocks: 2 }, Tier { price: Price::Fixed(20), blocks: 6 }, Tier { price: Price::Fixed(5), blocks: 144 }] }
}

/// The service's tags: one per tier, each at exactly that tier's price, in
/// the tiers' order; read back, each prices its own tier, and a payment's
/// tier is read from the tag it fulfils.
#[test]
fn one_tag_per_tier_each_at_its_price() {
    let (svc, first, unit) = (h("the service"), h("its publication"), h("regtest satoshis"));
    let t = terms();
    let p = t.publication(svc, h("a split cMIP"), None, None);
    let tags = t.price_tags(first, unit, svc);
    assert_eq!(tags.iter().map(|(i, x)| (*i, x.price.unwrap().value)).collect::<Vec<_>>(), vec![(0, 50), (1, 20), (2, 5)]);
    let given: Vec<(Hash, Hash, PriceTag)> = tags.iter().map(|(i, x)| (h(&format!("tag {i}")), svc, x.clone())).collect();
    let (o, tiers) = Offer::from_publication_tags(first, svc, &p, &given).expect("an offer with a tag per tier");
    assert_eq!(tiers, vec![(0, h("tag 0")), (1, h("tag 1")), (2, h("tag 2"))]);
    assert_eq!(o.id, first);
    for (i, x) in &tags {
        let one = Offer::from_publication(first, svc, &p, h(&format!("tag {i}")), svc, x).expect("each tag read alone");
        assert_eq!(one.tier_of(&one.price), Some(*i), "the tag prices tier {i}");
    }
    // Draft 6's single tag at the most a hash costs is the most urgent tier's.
    assert_eq!(t.price_tag(first, unit, svc).price, Some(Amount { unit, value: 50 }));
}

/// A tag at no tier's price is not this cMIP's offer; two tags pricing one
/// tier are refused; a tier with no tag is simply not on sale.
#[test]
fn a_tag_at_no_tiers_price_is_refused_and_a_tier_without_one_is_not_on_sale() {
    let (svc, first, unit) = (h("the service"), h("its publication"), h("regtest satoshis"));
    let t = terms();
    let p = t.publication(svc, h("a split cMIP"), None, None);
    let at = |v: u64| PriceTag { priced: Priced::Publication(first), version: 1, previous: None, price: Some(Amount { unit, value: v }), payee: svc };
    assert!(Offer::from_publication(first, svc, &p, h("odd"), svc, &at(30)).unwrap_err().contains("no tier's price"));
    assert!(Offer::from_publication_tags(first, svc, &p, &[(h("a"), svc, at(20)), (h("b"), svc, at(20))]).unwrap_err().contains("two price tags price tier 1"));
    let (_, tiers) = Offer::from_publication_tags(first, svc, &p, &[(h("only"), svc, at(5))]).unwrap();
    assert_eq!(tiers, vec![(2, h("only"))], "tiers 0 and 1 are not on sale");
    assert!(Offer::from_publication_tags(first, svc, &p, &[]).unwrap_err().contains("nothing is on sale"));
}
