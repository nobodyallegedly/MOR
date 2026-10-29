//! The price tag (Money type 5, rule 18): a price and a payee, on a bare
//! bake or under a publication, versioned on its own chain; a version with
//! no price withdraws it. On a bare bake only its uploader's tag counts;
//! under a publication, who may sign it is Agreements' to judge.

mod common;

use common::*;
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::chain::{Status, TagCount};
use mor_core::hash::{sha256, Hash};
use mor_core::money::{self, Amount, Payload, PriceTag, Priced};

fn sat(n: u64) -> Amount {
    Amount { unit: sha256(b"mor test data: the sat unit"), value: n }
}

fn tag(priced: Priced, version: u64, previous: Option<Hash>, price: Option<u64>, payee: Hash) -> Vec<(Value, Value)> {
    Payload::PriceTag(PriceTag { priced, version, previous, price: price.map(sat), payee }).to_map()
}

#[test]
fn a_tag_on_a_bare_bake_counts_only_signed_by_its_uploader() {
    let mut w = World::new();
    let mut up = w.operator("the uploader");
    let up_id = up.id;
    let mut fan = w.operator("a fan");
    let fan_id = fan.id;
    let bake = w.everyday_act(&mut up, envelopes_spec(), mor_core::envelopes::types::BAKE, publication(vec![]), None, None);
    let bake_id = bake.id();
    let own = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(bake_id), 1, None, Some(100), up_id), None, None);
    let own = w.add(&own);
    let other = w.everyday_act(&mut fan, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(bake_id), 1, None, Some(50), fan_id), None, None);
    let other = w.add(&other);
    assert_eq!(w.v.status(&own), Status::Valid);
    assert!(matches!(w.v.price_tag(&own), Some((_, TagCount::Unknown(_)))), "the bake not held");
    w.add(&bake);
    assert_eq!(w.v.price_tag(&own).unwrap().1, TagCount::Counts);
    assert!(matches!(w.v.price_tag(&other), Some((_, TagCount::Nobodys(_)))), "a stranger's tag is nobody's offer");
}

#[test]
fn a_tag_under_a_publication_is_agreements_to_judge() {
    let mut w = World::new();
    let mut svc = w.operator("a split service");
    let svc_id = svc.id;
    let publication = sha256(b"mor test data: a publication's founding version");
    let t = w.everyday_act(&mut svc, money_spec(), money::types::PRICE_TAG, tag(Priced::Publication(publication), 1, None, Some(100), svc_id), None, None);
    let t = w.add(&t);
    assert_eq!(w.v.status(&t), Status::Valid);
    assert!(matches!(w.v.price_tag(&t), Some((_, TagCount::Unknown(_)))));
}

#[test]
fn the_format_exactly_one_target_versions_and_public() {
    let mut w = World::new();
    let mut up = w.operator("the uploader");
    let up_id = up.id;
    let b = sha256(b"mor test data: a bake");
    let both = {
        let mut m = tag(Priced::Bake(b), 1, None, Some(1), up_id);
        m.push((Value::Uint(1), Value::Bytes(b.to_vec())));
        m.sort_by(|a, c| mor_core::cbor::encode(&a.0).cmp(&mor_core::cbor::encode(&c.0)));
        m
    };
    let both = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, both, None, None);
    let both = w.add(&both);
    assert_eq!(w.v.status(&both), Status::Invalid, "fields 0 and 1 both");
    let neither: Vec<(Value, Value)> = tag(Priced::Bake(b), 1, None, Some(1), up_id).into_iter().filter(|(k, _)| *k != Value::Uint(0)).collect();
    let neither = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, neither, None, None);
    let neither = w.add(&neither);
    assert_eq!(w.v.status(&neither), Status::Invalid, "neither field 0 nor field 1");
    let v2_alone = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 2, None, Some(1), up_id), None, None);
    let v2_alone = w.add(&v2_alone);
    assert_eq!(w.v.status(&v2_alone), Status::Invalid, "a version above 1 names the one it replaces");
    let sealed = w.private_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 1, None, Some(1), up_id), None, vec![up_id]);
    assert_eq!(w.v.status(&sealed), Status::Invalid, "a price tag is public");
}

#[test]
fn a_later_version_by_the_same_signer_continues_it_and_no_price_withdraws_it() {
    let mut w = World::new();
    let mut up = w.operator("the uploader");
    let up_id = up.id;
    let mut other = w.operator("another");
    let other_id = other.id;
    let b = sha256(b"mor test data: a bake");
    let v1 = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 1, None, Some(100), up_id), None, None);
    let v1_id = v1.id();
    let chain = |first: Hash, prev: Hash| Some(vec![Object { chain: first, predecessor: prev }]);
    let v2 = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 2, Some(v1_id), Some(80), up_id), chain(v1_id, v1_id), None);
    let v2 = w.add(&v2);
    assert_eq!(w.v.status(&v2), Status::Unknown, "the version it replaces is not held");
    w.add(&v1);
    assert_eq!(w.v.status(&v2), Status::Valid);
    let v3 = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 3, Some(v2), None, up_id), chain(v1_id, v2), None);
    let v3 = w.add(&v3);
    assert_eq!(w.v.status(&v3), Status::Valid);
    let (t, _) = w.v.price_tag(&v3).unwrap();
    assert!(t.withdrawn(), "a version with no price withdraws the tag");
    let by_other = w.everyday_act(&mut other, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 2, Some(v1_id), Some(1), other_id), chain(v1_id, v1_id), None);
    let by_other = w.add(&by_other);
    assert_eq!(w.v.status(&by_other), Status::Invalid, "a later version is signed by the same signer");
    let other_bake = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(sha256(b"another bake")), 2, Some(v1_id), Some(1), up_id), chain(v1_id, v1_id), None);
    let other_bake = w.add(&other_bake);
    assert_eq!(w.v.status(&other_bake), Status::Invalid, "a later version prices the same bake");
    let skip = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 4, Some(v1_id), Some(1), up_id), chain(v1_id, v1_id), None);
    let skip = w.add(&skip);
    assert_eq!(w.v.status(&skip), Status::Invalid, "its version is the previous plus one");
    let wrong_chain = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(b), 3, Some(v2), Some(1), up_id), chain(v2, v2), None);
    let wrong_chain = w.add(&wrong_chain);
    assert_eq!(w.v.status(&wrong_chain), Status::Invalid, "its chain is the first version");
}


/// Money, "Only identities have payee pointers": a Money-only wallet reads
/// a bare bake's signer as its uploader and tips that identity; a bake that
/// names another chain in `objects` (a member's bake naming the collective,
/// Agreements rule 58) has an uploader only Agreements can tell, so a
/// Money-only wallet refuses to tip it, and its tag is unknown here.
#[test]
fn a_money_only_wallet_refuses_to_tip_a_bake_naming_a_collective() {
    use mor_core::chain::Uploader;
    let mut w = World::new();
    let mut up = w.operator("a member who uploads");
    let up_id = up.id;
    let band = w.operator("the band, a chain the member names");
    let own = w.everyday_act(&mut up, envelopes_spec(), mor_core::envelopes::types::BAKE, publication(vec![]), None, None);
    let own = w.add(&own);
    assert_eq!(w.v.bake_uploader(&own), Some(Uploader::Signer(up_id)));
    let named = w.everyday_act(&mut up, envelopes_spec(), mor_core::envelopes::types::BAKE, publication(vec![]), Some(vec![Object { chain: band.id, predecessor: band.id }]), None);
    let named = w.add(&named);
    assert!(matches!(w.v.bake_uploader(&named), Some(Uploader::Unknown(_))), "whose bake it is, Agreements judges");
    let t = w.everyday_act(&mut up, money_spec(), money::types::PRICE_TAG, tag(Priced::Bake(named), 1, None, Some(100), up_id), None, None);
    let t = w.add(&t);
    assert!(matches!(w.v.price_tag(&t), Some((_, TagCount::Unknown(_)))), "its tag is unknown to a Money-only verifier");
    // A later version of the member's own bake names only its own line.
    let next = w.everyday_act(&mut up, envelopes_spec(), mor_core::envelopes::types::BAKE, publication(vec![]), Some(vec![Object { chain: own, predecessor: own }]), None);
    let next = w.add(&next);
    assert_eq!(w.v.bake_uploader(&next), Some(Uploader::Signer(up_id)));
}
