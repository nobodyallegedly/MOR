//! The vow grammar (F237, F240; "announcement" in the texts until the
//! redraft, F241): each sale of a vow pending, confirmed or contested; only
//! someone who signed onto the vow, at any price including none, may
//! confirm or contest it; a vow nobody signed onto carries no state.
//! Built in `docs/vow-grammar-build.md`; the readings each test relies on
//! are listed there (V-R1 to V-R12).
//!
//! Test identities only; the specification hashes are test values until
//! the freeze, as in the other Agreements tests.

mod common;

use common::{own_home, Person, World};
use mor_core::act::Object;
use mor_core::agreements::{self, AgreementsView, Mips, SaleState};
use mor_core::cbor::Value;
use mor_core::envelopes::vow::Vow;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{Amount, Claim, PaidAt, Payer, Payload as Fin, Purchase, Receipt};

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
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
    let mut v = AgreementsView::new(&w.v, mips());
    for c in claims {
        v.rail_valid.insert(*c, PaidAt::Flow(spec("the payee's pointer")));
    }
    v
}

fn view(w: &World) -> AgreementsView<'_> {
    view_with(w, &[])
}

fn agreements_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mips().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    agreements_act(w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), Some(vec![Object { chain: *x, predecessor: *x }]))
}

/// A vow (Envelopes type 5, F237): an act of its signer naming in words
/// what is to come. Its genesis id is its name.
fn vow(w: &mut World, p: &mut Person, words: &str) -> Hash {
    let v = Vow { words: words.into(), cmip: None };
    let a = w.everyday_act(p, mips().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None);
    w.add(&a)
}




/// A lone seller's standing offer (F215) naming `name`, with its words.
fn lone_offer(w: &mut World, p: &mut Person, name: Hash, words: &str) -> Hash {
    let o = agreements::Offer {
        under: None,
        sold: vec![agreements::Sold::Vow(name)],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: None,
        words: Some(words.into()),
        until: None,
        time: None,
        refund: None,
    };
    agreements_act(w, p, agreements::types::STANDING_OFFER, o.to_map(), None)
}

/// A receipt in `payee`'s name for `payer`'s payment following `fulfils`,
/// naming the claim `purchase` where one is.
fn receipt(w: &mut World, payee: &mut Person, payer: Hash, fulfils: Hash, purchase: Option<Hash>, proof: &[u8]) -> Hash {
    let pid = payee.id;
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payer: Some(Payer::Identity(payer)),
        payee: pid,
        amount: Amount { unit: spec("a unit"), value: 300 },
        fulfils,
        previous: None,
        forward: None,
        batch: None,
        purchase: purchase.map(|a| Purchase { agreement: a, line: a }),
    });
    let a = w.everyday_act(payee, mips().money, 2, r.to_map(), None, None);
    w.add(&a)
}

/// The payer's own claim of the same payment: what signs the buyer onto
/// the vow (F240), the buyer being the payer the commitment names (F193).
fn payers_claim(w: &mut World, payer: &mut Person, payee: Hash, fulfils: Hash, purchase: Option<Hash>, proof: &[u8]) -> Hash {
    let c = Fin::Claim(Claim {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payee,
        amount: Amount { unit: spec("a unit"), value: 300 },
        fulfils,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: purchase.map(|a| Purchase { agreement: a, line: a }),
    });
    let a = w.everyday_act(payer, mips().money, 3, c.to_map(), None, None);
    w.add(&a)
}


/// A cMIP's act about the vow (a door scanner's attendance record, a
/// delivery note): it names the vow by its name in `refs`. The core never
/// reads what it says.
fn about(w: &mut World, p: &mut Person, name: Hash, what: &str) -> Hash {
    let a = w.everyday_act_refs(p, spec("a ticketing Module"), 0, vec![(Value::Uint(0), Value::Text(what.into()))], None, None, Some(vec![mor_core::act::Ref::Act(name)]));
    w.add(&a)
}

/// The buyer's later claim of the same payment, acknowledging `acks`
/// (F193's shape: only the payer the payment commits to).
fn acknowledging_claim(w: &mut World, payer: &mut Person, payee: Hash, fulfils: Hash, proof: &[u8], acks: Vec<Hash>) -> Hash {
    let c = Fin::Claim(Claim {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payee,
        amount: Amount { unit: spec("a unit"), value: 300 },
        fulfils,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: None,
    });
    let a = w.everyday_act(payer, mips().money, 3, c.to_map(), None, Some(acks));
    w.add(&a)
}

/// A contest (Agreements type 14) naming the vow, signed by `p`.
fn contest(w: &mut World, p: &mut Person, name: Hash) -> Hash {
    let c = agreements::Contest { act: name };
    agreements_act(w, p, agreements::types::CONTEST, c.to_map(), Some(vec![Object { chain: name, predecessor: name }]))
}

/// A concert vowed by the club and sold by its offer; a fan paid and signed
/// on by their own claim.
struct Concert {
    w: World,
    club: Person,
    fan: Person,
    name: Hash,
    offer: Hash,
    claims: Vec<Hash>,
}

const PROOF: &[u8] = b"the fan pays for a seat";

impl Concert {
    fn new() -> Concert {
        let mut w = World::new();
        let mut club = w.genesis("the club", vec![own_home()], None, None);
        let mut fan = w.genesis("a fan", vec![own_home()], None, None);
        let name = vow(&mut w, &mut club, "A concert in the hall, 12 December");
        let offer = lone_offer(&mut w, &mut club, name, "One seat.");
        let fid = fan.id;
        receipt(&mut w, &mut club, fid, offer, None, PROOF);
        let c = payers_claim(&mut w, &mut fan, club.id, offer, None, PROOF);
        Concert { w, club, fan, name, offer, claims: vec![c] }
    }

    fn state(&self) -> Vec<(Hash, SaleState)> {
        view_with(&self.w, &self.claims).vow(&self.name).unwrap().sales.into_iter().map(|s| (s.buyer, s.state)).collect()
    }
}

/// F237: a sale is pending until confirmed or contested; confirmed by an
/// act about the vow the buyer acknowledges, in the buyer's own claim for
/// the payment (F193's shape); an acknowledgement of an act not about the
/// vow confirms nothing.
#[test]
fn a_sale_is_pending_then_confirmed_by_what_the_buyer_acknowledges() {
    let mut c = Concert::new();
    let (fid, club, name, offer) = (c.fan.id, c.club.id, c.name, c.offer);
    assert_eq!(c.state(), vec![(fid, SaleState::Pending)]);
    let mut door = c.w.genesis("the door", vec![own_home()], None, None);
    let elsewhere = c.w.post(&mut door, "a post about something else");
    let unrelated = acknowledging_claim(&mut c.w, &mut c.fan, club, offer, PROOF, vec![elsewhere]);
    c.claims.push(unrelated);
    assert_eq!(c.state(), vec![(fid, SaleState::Pending)], "an acknowledgement of an act not about the vow confirms nothing");
    let scanned = about(&mut c.w, &mut door, name, "seat 14, scanned at the door");
    let ack = acknowledging_claim(&mut c.w, &mut c.fan, club, offer, PROOF, vec![scanned]);
    c.claims.push(ack);
    assert_eq!(c.state(), vec![(fid, SaleState::Confirmed { by: vec![ack] })], "the buyer acknowledged the door's record");
    // The acknowledging claim needs the rail's answer: without it, the
    // payer the payment commits to is not shown (F193).
    let e = view_with(&c.w, &c.claims[..1]).vow(&name).unwrap();
    assert_eq!(e.sales[0].state, SaleState::Pending, "a claim without the rail's answer acknowledges nothing");
}

/// F240: only someone who signed onto the vow may confirm or contest it.
/// The seller acknowledging its own delivery confirms nothing; a stranger's
/// contest shows nothing; the buyer's contest marks the sale contested,
/// and prevails over a confirmation (V-R8).
#[test]
fn only_the_buyer_confirms_or_contests_and_a_contest_prevails() {
    let mut c = Concert::new();
    let (fid, club, name, offer) = (c.fan.id, c.club.id, c.name, c.offer);
    let delivered = about(&mut c.w, &mut c.club, name, "the concert took place");
    // The seller's own claim of the payment acknowledging it: the rail's
    // commitment carries the fan, so the rail answers no claim the club
    // signs (F193); it is not the payer's.
    let mut club_p = c.club.clone();
    acknowledging_claim(&mut c.w, &mut club_p, club, offer, PROOF, vec![delivered]);
    c.club = club_p;
    let witnessed = c.w.ack(&mut c.club, delivered);
    let _ = witnessed;
    assert_eq!(c.state(), vec![(fid, SaleState::Pending)], "the seller cannot confirm its own sale");
    let mut stranger = c.w.genesis("a stranger", vec![own_home()], None, None);
    contest(&mut c.w, &mut stranger, name);
    assert_eq!(c.state(), vec![(fid, SaleState::Pending)], "a stranger who never signed on has no standing: its contest shows nothing");
    let ack = acknowledging_claim(&mut c.w, &mut c.fan, club, offer, PROOF, vec![delivered]);
    c.claims.push(ack);
    assert_eq!(c.state(), vec![(fid, SaleState::Confirmed { by: vec![ack] })]);
    let k = contest(&mut c.w, &mut c.fan, name);
    assert_eq!(c.state(), vec![(fid, SaleState::Contested { by: vec![k] })], "the buyer's contest marks the sale contested, and voids nothing");
    assert!(view(&c.w).offer(&offer).unwrap().counts, "the offer stands");
}

/// F240: "at any price, including none". An offer at no price is signed
/// onto by a signature act naming it; the buyer then confirms by any act
/// of theirs acknowledging an act about the vow, or contests. The
/// seller's own signature is not a sign-on.
#[test]
fn a_free_offer_is_signed_onto_by_a_signature_act() {
    let mut w = World::new();
    let mut town = w.genesis("the town", vec![own_home()], None, None);
    let mut citizen = w.genesis("a citizen", vec![own_home()], None, None);
    let name = vow(&mut w, &mut town, "A bench in the square, by spring");
    let o = agreements::Offer {
        under: None,
        sold: vec![agreements::Sold::Vow(name)],
        price: Amount { unit: spec("a unit"), value: 0 },
        paid: None,
        words: Some("Sign on to follow the bench.".into()),
        until: None,
        time: None,
        refund: None,
    };
    let offer = agreements_act(&mut w, &mut town, agreements::types::STANDING_OFFER, o.to_map(), None);
    assert!(view(&w).offer(&offer).unwrap().counts);
    assert!(view(&w).vow(&name).unwrap().sales.is_empty(), "nobody signed on: no state (F240)");
    sign(&mut w, &mut town, &offer);
    assert!(view(&w).vow(&name).unwrap().sales.is_empty(), "the seller's own signature is no sign-on");
    let s = sign(&mut w, &mut citizen, &offer);
    let e = view(&w).vow(&name).unwrap();
    assert_eq!(e.sales.iter().map(|x| (x.act, x.buyer, x.state.clone())).collect::<Vec<_>>(), vec![(s, citizen.id, SaleState::Pending)]);
    let built = about(&mut w, &mut town, name, "the bench is in");
    let seen = w.ack(&mut citizen, built);
    assert_eq!(view(&w).vow(&name).unwrap().sales[0].state, SaleState::Confirmed { by: vec![seen] }, "the citizen acknowledged it");
    let k = contest(&mut w, &mut citizen, name);
    assert_eq!(view(&w).vow(&name).unwrap().sales[0].state, SaleState::Contested { by: vec![k] });
}

/// F240 and F193's stated cost: a payment whose buyer signed nothing the
/// verifier holds (only the seller's receipt naming a payer) is a purchase,
/// but nobody signed on: listed apart, no state.
#[test]
fn a_payment_nobody_signed_onto_carries_no_state() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let name = vow(&mut w, &mut club, "A concert");
    let offer = lone_offer(&mut w, &mut club, name, "One seat.");
    let r = receipt(&mut w, &mut club, fan.id, offer, None, b"paid, no claim");
    let e = view(&w).vow(&name).unwrap();
    assert!(e.sales.is_empty(), "the payer a receipt names is the seller's word, never the buyer (F193)");
    assert_eq!(e.unsigned, vec![r]);
    assert_eq!(e.offers, vec![offer]);
}

/// F237: an offer naming a vow sells it with its words; one naming an act
/// that is not a vow does not count.
#[test]
fn an_offer_naming_a_vow_carries_its_words_and_names_a_vow() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let name = vow(&mut w, &mut club, "A concert");
    let o = agreements::Offer {
        under: None,
        sold: vec![agreements::Sold::Vow(name)],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: None,
        words: None,
        until: None,
        time: None,
        refund: None,
    };
    let x = agreements_act(&mut w, &mut club, agreements::types::STANDING_OFFER, o.to_map(), None);
    assert!(view(&w).offer(&x).is_err(), "no words: not in the offer's format (F237)");
    let post = w.post(&mut club, "not a vow");
    let y = lone_offer(&mut w, &mut club, post, "A seat at a post.");
    let e = view(&w).offer(&y).unwrap();
    assert!(!e.counts && e.problems.iter().any(|p| p.contains("not one")), "{:?}", e.problems);
    let z = lone_offer(&mut w, &mut club, spec("a vow this verifier does not hold"), "A seat.");
    assert!(view(&w).offer(&z).unwrap().counts, "a vow not held is not judged, as a publication is not");
    // The vow's format is closed.
    let bad = w.everyday_act(&mut club, mips().envelopes, mor_core::envelopes::types::VOW, vec![(Value::Uint(0), Value::Text("x".into())), (Value::Uint(9), Value::Null)], None, None);
    let bad = w.add(&bad);
    assert!(view(&w).vow(&bad).is_err(), "a field outside the format: no vow");
}
