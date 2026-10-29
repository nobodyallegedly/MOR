//! A buyer's contest of a purchase (F386; Agreements rule 54, "Contest
//! (type 14)"): the buyer of a purchase may contest it, in the contest
//! act's format: field 0 the purchase (the buyer's payer's claim of the
//! payment, or, for an offer at no price, the buyer's signature act on it),
//! field 1 absent or the promise not kept in words, the inside naming the
//! purchase as chain and predecessor. Shown beside the purchase; it voids
//! nothing and moves nothing. Signed by anyone else, it shows nothing.
//!
//! Test identities only; the specification hashes are test values until
//! the freeze, as in the other Agreements tests.

mod common;

use common::{own_home, Person, World};
use mor_core::act::Object;
use mor_core::agreements::{self, AgreementsView, Mirs, PurchaseVerdict, SaleState};
use mor_core::cbor::Value;
use mor_core::envelopes::vow::Vow;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{Amount, Claim, PaidAt, Payer, Payload as Fin, Receipt};

fn mirs() -> Mirs {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mirs {
        identity: common::identity_spec(),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: t("FINANCE"),
        agreements: t("LAW"),
        development: t("PRODUCTION"),
    }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

/// The view, with the rail's answer, valid, for every payer's claim in
/// `claims` (the caller states it: the core reads no rail).
fn view_with<'a>(w: &'a World, claims: &[Hash]) -> AgreementsView<'a> {
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    for c in claims {
        v.rail_valid.insert(*c, PaidAt::Flow(spec("the payee's pointer")));
    }
    v
}

fn agreements_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mirs().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object { chain: x, predecessor: x }])
}

/// A lone seller's publication selling `sold`, with its words, and its
/// price tag at `price` (none where `price` is zero): the tag, or, with no
/// price, the publication.
fn offer(w: &mut World, p: &mut Person, sold: agreements::Sold, price: u64, words: &str) -> Hash {
    let pubn = common::lone_publication(w, p, &mirs(), vec![sold], Some(words));
    if price == 0 {
        return pubn;
    }
    let id = p.id;
    common::price_tag(w, p, mirs().money, mor_core::money::Priced::Publication(pubn), price, spec("a unit"), id)
}

/// A proven offer: access to the recording, under an access cMIP's terms.
fn recording() -> agreements::Sold {
    agreements::Sold::Access(spec("an access cMIP"), mor_core::cbor::encode(&Value::Text("the concert's recording".into())))
}

/// One payment: the seller's receipt and the buyer's own payer's claim.
fn pay(w: &mut World, seller: &mut Person, buyer: &mut Person, fulfils: Hash, proof: &[u8]) -> Hash {
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payer: Some(Payer::Identity(buyer.id)),
        payee: seller.id,
        amount: Amount { unit: spec("a unit"), value: 300 },
        fulfils,
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    });
    let a = w.everyday_act(seller, mirs().money, 2, r.to_map(), None, None);
    w.add(&a);
    let c = Fin::Claim(Claim {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payee: seller.id,
        amount: Amount { unit: spec("a unit"), value: 300 },
        fulfils,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: None,
        previous: None,
    });
    let a = w.everyday_act(buyer, mirs().money, 3, c.to_map(), None, None);
    w.add(&a)
}

/// A contest of the purchase `purchase`, signed by `p`.
fn contest(w: &mut World, p: &mut Person, purchase: Hash, words: Option<&str>) -> Hash {
    let c = agreements::Contest::of_purchase(purchase, words.map(String::from));
    agreements_act(w, p, agreements::types::CONTEST, c.to_map(), obj(purchase))
}

/// A recording of the concert, sold by the club; a fan paid.
fn bought() -> (World, Person, Person, Hash, Hash) {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let o = offer(&mut w, &mut club, recording(), 300, "The full concert, filmed in the hall.");
    let claim = pay(&mut w, &mut club, &mut fan, o, b"the fan pays for the recording");
    (w, club, fan, o, claim)
}

/// The buyer contests their purchase: shown beside it, with the promise in
/// words; the payment stays a purchase, and nothing else moves.
#[test]
fn the_buyer_contests_the_purchase() {
    let (mut w, _club, mut fan, _o, claim) = bought();
    let before = view_with(&w, &[claim]).purchase(&claim).unwrap().unwrap();
    assert_eq!(before.verdict, PurchaseVerdict::Purchase);
    let k = contest(&mut w, &mut fan, claim, Some("A slideshow, not the concert."));
    let v = view_with(&w, &[claim]);
    assert_eq!(v.purchase_contests(&claim).unwrap(), vec![k]);
    assert_eq!(v.purchase(&claim).unwrap().unwrap(), before, "a contest moves no verdict");
    let c = agreements::Contest::decode(&w.v.get(&k).unwrap().inside).unwrap();
    assert_eq!((c.act, c.vow, c.promise), (claim, None, Some(agreements::Promise::Words("A slideshow, not the concert.".into()))));
    // Field 1 is optional: a buyer may know only that something went wrong.
    let k2 = contest(&mut w, &mut fan, claim, None);
    let mut both = vec![k, k2];
    both.sort();
    assert_eq!(view_with(&w, &[claim]).purchase_contests(&claim).unwrap(), both);
}

/// Signed by anyone else, the same contest shows nothing: the seller, or a
/// stranger.
#[test]
fn signed_by_anyone_else_it_shows_nothing() {
    let (mut w, mut club, _fan, _o, claim) = bought();
    let mut other = w.genesis("another identity", vec![own_home()], None, None);
    contest(&mut w, &mut other, claim, Some("A slideshow, not the concert."));
    contest(&mut w, &mut club, claim, None);
    assert!(view_with(&w, &[claim]).purchase_contests(&claim).unwrap().is_empty());
}

/// A free purchase: the buyer's signature act on a publication with no
/// price tag is the purchase, and the buyer contests it. The seller's own
/// signature on its publication is no purchase.
#[test]
fn a_free_purchase_is_contested_by_its_signature_act() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let o = offer(&mut w, &mut club, recording(), 0, "The full concert, free.");
    let s = agreements_act(&mut w, &mut fan, agreements::types::SIGNATURE, agreements::signature_payload(&o), obj(o));
    let k = contest(&mut w, &mut fan, s, Some("Ten minutes, not the full concert."));
    assert_eq!(view_with(&w, &[]).purchase_contests(&s).unwrap(), vec![k]);
    let own = agreements_act(&mut w, &mut club, agreements::types::SIGNATURE, agreements::signature_payload(&o), obj(o));
    contest(&mut w, &mut club, own, None);
    assert!(view_with(&w, &[]).purchase_contests(&own).unwrap().is_empty());
}

/// A payment that is no purchase gives no standing: a tip to the club's
/// genesis is contested by its payer, and nothing shows.
#[test]
fn no_purchase_no_contest() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let g = club.id;
    let claim = pay(&mut w, &mut club, &mut fan, g, b"a tip");
    contest(&mut w, &mut fan, claim, None);
    assert!(view_with(&w, &[claim]).purchase_contests(&claim).unwrap().is_empty());
}

/// A vow's sale is a purchase too: contested in the purchase's form, the
/// contest is shown beside the purchase and moves no sale's state; the
/// vow's form marks the sale contested, and is not shown here.
#[test]
fn a_vows_sale_keeps_its_own_form() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let v = Vow { words: "A concert in the hall, 12 December".into(), cmip: None };
    let a = w.everyday_act(&mut club, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None);
    let name = w.add(&a);
    let o = offer(&mut w, &mut club, agreements::Sold::Vow(name), 300, "One seat.");
    let claim = pay(&mut w, &mut club, &mut fan, o, b"the fan pays for a seat");
    let k = contest(&mut w, &mut fan, claim, Some("No seat at the door."));
    let state = |w: &World| view_with(w, &[claim]).vow(&name).unwrap().sales[0].state.clone();
    assert_eq!(view_with(&w, &[claim]).purchase_contests(&claim).unwrap(), vec![k]);
    assert_eq!(state(&w), SaleState::Pending);
    let c = agreements::Contest::of_sale(name, claim, None);
    let kv = agreements_act(&mut w, &mut fan, agreements::types::CONTEST, c.to_map(), obj(name));
    assert_eq!(state(&w), SaleState::Contested { by: vec![kv] });
    assert_eq!(view_with(&w, &[claim]).purchase_contests(&claim).unwrap(), vec![k]);
}
