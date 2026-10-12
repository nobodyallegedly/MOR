//! The vow grammar (F237, F240; "announcement" in the texts until the
//! redraft, F241): each sale of a vow pending, confirmed or contested; only
//! someone who signed onto the vow, at any price including none, may
//! confirm or contest it; a vow nobody signed onto carries no state.
//! Built in `docs/vow-grammar-build.md`; the readings each test relies on
//! are listed there (V-R1 to V-R14).
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
        previous: None,
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
        previous: None,
    });
    let a = w.everyday_act(payer, mips().money, 3, c.to_map(), None, Some(acks));
    w.add(&a)
}

/// A contest (Agreements type 14) of the sale `sale` of the vow `name`,
/// signed by `p` (Agreements draft 11, rule 13, F253): field 0 the sale,
/// the vow in `objects`.
fn contest(w: &mut World, p: &mut Person, name: Hash, sale: Hash) -> Hash {
    contest_with(w, p, name, sale, None)
}

/// As [`contest`], naming the promise not kept (field 1, optional,
/// reading (Q3)).
fn contest_with(w: &mut World, p: &mut Person, name: Hash, sale: Hash, promise: Option<agreements::Promise>) -> Hash {
    let c = agreements::Contest::of_sale(name, sale, promise);
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
/// and prevails over a confirmation (V-R9).
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
    let sale = c.claims[0];
    contest(&mut c.w, &mut stranger, name, sale);
    assert_eq!(c.state(), vec![(fid, SaleState::Pending)], "a stranger who never signed on has no standing: its contest shows nothing");
    let ack = acknowledging_claim(&mut c.w, &mut c.fan, club, offer, PROOF, vec![delivered]);
    c.claims.push(ack);
    assert_eq!(c.state(), vec![(fid, SaleState::Confirmed { by: vec![ack] })]);
    let k = contest(&mut c.w, &mut c.fan, name, sale);
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
    assert_eq!(view(&w).vow(&name).unwrap().sales[0].state, SaleState::Pending, "draft 11, rule 13: a confirmation names the sale, and this one names only the act about the vow");
    let seen = w.everyday_act(&mut citizen, common::identity_spec(), mor_core::identity::types::WITNESS, vec![], None, Some(vec![built, s]));
    let seen = w.add(&seen);
    assert_eq!(view(&w).vow(&name).unwrap().sales[0].state, SaleState::Confirmed { by: vec![seen] }, "the citizen acknowledged it, naming the sale");
    let k = contest(&mut w, &mut citizen, name, s);
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

// ---------------------------------------------------------------- Agreements draft 11

/// A season vow, two matches bought by one fan: two payments, two sales.
fn season() -> (World, Person, Person, Hash, Hash, Vec<Hash>) {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let name = vow(&mut w, &mut club, "The season: a seat at each home match");
    let offer = lone_offer(&mut w, &mut club, name, "One match.");
    let fid = fan.id;
    let mut claims = vec![];
    for proof in [b"match one".as_slice(), b"match two".as_slice()] {
        receipt(&mut w, &mut club, fid, offer, None, proof);
        claims.push(payers_claim(&mut w, &mut fan, club.id, offer, None, proof));
    }
    (w, club, fan, name, offer, claims)
}

fn states(w: &World, name: &Hash, claims: &[Hash]) -> Vec<(Hash, SaleState)> {
    view_with(w, claims).vow(name).unwrap().sales.into_iter().map(|s| (s.act, s.state)).collect()
}

/// Agreements draft 11, rule 13 (F253, replacing draft 10's V-R9): a vow
/// holds promises, bundled as the seller chooses (a season); a contest
/// names the sale it contests, never the whole vow. One failed match
/// marks one sale contested: the fan's other sale of the same vow stays
/// as it was. A contest naming the vow in field 0, draft 10's form, names
/// no sale and marks nothing.
#[test]
fn draft_11_f253_a_contest_names_the_sale_not_the_vow() {
    let (mut w, _club, mut fan, name, _offer, claims) = season();
    let mut sorted = claims.clone();
    sorted.sort();
    assert_eq!(states(&w, &name, &claims), sorted.iter().map(|c| (*c, SaleState::Pending)).collect::<Vec<_>>());
    // Draft 10's form: field 0 the vow's name.
    let old = agreements::Contest { act: name, vow: None, promise: None };
    agreements_act(&mut w, &mut fan, agreements::types::CONTEST, old.to_map(), Some(vec![Object { chain: name, predecessor: name }]));
    assert!(states(&w, &name, &claims).iter().all(|(_, s)| *s == SaleState::Pending), "a contest naming the vow names no sale (F253)");
    // The second match failed: the fan contests that sale.
    let k = contest(&mut w, &mut fan, name, claims[1]);
    let got = states(&w, &name, &claims);
    for (act, st) in got {
        if act == claims[1] {
            assert_eq!(st, SaleState::Contested { by: vec![k] });
        } else {
            assert_eq!(st, SaleState::Pending, "the other match's sale is not contested");
        }
    }
}

/// Reading (Q3): naming the promise not kept is optional (field 1), in
/// words as canonical text or in a cMIP's terms; a contest names the same
/// sale either way. Field 1 belongs to a vow's contest only.
#[test]
fn draft_11_q3_the_promise_not_kept_is_optional() {
    let (mut w, _club, mut fan, name, _offer, claims) = season();
    let k = contest_with(&mut w, &mut fan, name, claims[0], Some(agreements::Promise::Words("The match was not played.".into())));
    let x = w.v.get(&k).unwrap();
    let c = agreements::Contest::decode(&x.inside).unwrap();
    assert_eq!((c.act, c.vow, c.promise.clone()), (claims[0], Some(name), Some(agreements::Promise::Words("The match was not played.".into()))));
    let st: Vec<SaleState> = states(&w, &name, &claims).into_iter().filter(|(a, _)| *a == claims[0]).map(|(_, s)| s).collect();
    assert_eq!(st, vec![SaleState::Contested { by: vec![k] }]);
    let terms = agreements::Promise::Terms(spec("a ticketing cMIP"), Value::Uint(2));
    let k2 = contest_with(&mut w, &mut fan, name, claims[1], Some(terms.clone()));
    assert_eq!(agreements::Contest::decode(&w.v.get(&k2).unwrap().inside).unwrap().promise, Some(terms));
    // A declaration's contest carries no promise.
    let d = spec("a declaration of absence");
    let bad = agreements::Contest { act: d, vow: None, promise: Some(agreements::Promise::Words("x".into())) };
    let a = agreements_act(&mut w, &mut fan, agreements::types::CONTEST, bad.to_map(), Some(vec![Object { chain: d, predecessor: d }]));
    assert!(agreements::Contest::decode(&w.v.get(&a).unwrap().inside).is_err(), "field 1 is for a vow's contest only");
    // Words that are not canonical text never make an act at all (core: every
    // text in an act is canonical), so the contest's own check is a second line.
}

/// Draft 11, rule 13: a confirmation likewise names the sale. For a
/// payment, the buyer's claim is the sale; a claim of the second payment
/// acknowledging the door's record confirms the second sale only.
#[test]
fn draft_11_f253_a_confirmation_names_the_sale() {
    let (mut w, club, mut fan, name, offer, mut claims) = season();
    let mut door = w.genesis("the door", vec![own_home()], None, None);
    let scanned = about(&mut w, &mut door, name, "match two, seat 14, scanned");
    let ack = acknowledging_claim(&mut w, &mut fan, club.id, offer, b"match two", vec![scanned]);
    claims.push(ack);
    let got = states(&w, &name, &claims);
    assert_eq!(got.len(), 2);
    for (act, st) in got {
        if act == claims[1] {
            assert_eq!(st, SaleState::Confirmed { by: vec![ack] });
        } else {
            assert_eq!(st, SaleState::Pending);
        }
    }
}

/// Reading (Q2): a vow naming another vow in its `refs` is not an act
/// about it, and moves none of its sales' states: a fan who acknowledges
/// Dario's stream vow, which names the club's seat vow, confirms no seat.
/// Any other act naming the seat vow in `refs` (the door's record) still
/// is about it.
#[test]
fn draft_11_q2_a_vows_reference_to_another_vow_confirms_nothing() {
    let mut c = Concert::new();
    let (fid, club, name, offer) = (c.fan.id, c.club.id, c.name, c.offer);
    let mut dario = c.w.genesis("dario", vec![own_home()], None, None);
    let stream = Vow { words: "My stream of the concert".into(), cmip: None };
    let a = c.w.everyday_act_refs(&mut dario, mips().envelopes, mor_core::envelopes::types::VOW, stream.to_map(), None, None, Some(vec![mor_core::act::Ref::Act(name)]));
    let stream = c.w.add(&a);
    let ack = acknowledging_claim(&mut c.w, &mut c.fan, club, offer, PROOF, vec![stream]);
    c.claims.push(ack);
    assert_eq!(c.state(), vec![(fid, SaleState::Pending)], "a vow's reference to another vow is not an act about it (Q2)");
    let mut door = c.w.genesis("the door", vec![own_home()], None, None);
    let scanned = about(&mut c.w, &mut door, name, "seat 14, scanned");
    let ack2 = acknowledging_claim(&mut c.w, &mut c.fan, club, offer, PROOF, vec![scanned]);
    c.claims.push(ack2);
    assert_eq!(c.state(), vec![(fid, SaleState::Confirmed { by: vec![ack2] })]);
    // The vow's own later version stays about it.
    let v2 = Vow { words: "A concert in the hall, 13 December".into(), cmip: None };
    let a = c.w.everyday_act(&mut c.club, mips().envelopes, mor_core::envelopes::types::VOW, v2.to_map(), Some(vec![Object { chain: name, predecessor: name }]), None);
    let later = c.w.add(&a);
    assert!(view(&c.w).vow(&name).unwrap().versions.contains(&later));
}

/// A checker for a test cMIP: a proof is the bytes `b"delivered"`.
struct TestChecker;

impl agreements::ProofChecker for TestChecker {
    fn check(&self, _offer: &Hash, _params: &[u8], proof: &[u8]) -> agreements::ProofVerdict {
        if proof == b"delivered" {
            agreements::ProofVerdict::Proven
        } else {
            agreements::ProofVerdict::NotProven("not the delivered bytes".into())
        }
    }
    fn checks_delivery(&self) -> bool {
        true
    }
}

/// The same checking, under a cMIP whose specification does not declare
/// that it checks proofs of delivery (F268).
struct Undeclared;

impl agreements::ProofChecker for Undeclared {
    fn check(&self, offer: &Hash, params: &[u8], proof: &[u8]) -> agreements::ProofVerdict {
        TestChecker.check(offer, params, proof)
    }
    fn checks_delivery(&self) -> bool {
        false
    }
}

/// Agreements draft 11, rule 11 (new in draft 11, F261): offers are of two
/// classes. The core tells them apart by what the offer sells: the access
/// form, `[2, [cMIP, params]]`, is a proven offer; `[3, vow]` a promised
/// one. For a proven offer the core asks the checker this verifier holds
/// for the named cMIP; with none, the delivery is not proven here. An offer
/// naming a vow is no proven offer.
#[test]
fn draft_11_f261_a_proven_offer_is_judged_by_its_cmips_checker() {
    let mut w = World::new();
    let mut seller = w.genesis("a seller", vec![own_home()], None, None);
    let cmip = spec("a test cMIP whose deliveries prove themselves");
    let params = mor_core::cbor::encode(&Value::Uint(7));
    let o = agreements::Offer {
        under: None,
        sold: vec![agreements::Sold::Access(cmip, params.clone())],
        price: Amount { unit: spec("a unit"), value: 10 },
        paid: None,
        words: None,
        until: None,
        time: None,
        refund: None,
    };
    assert_eq!(o.sold[0].class(), agreements::OfferClass::Proven { cmip, params });
    let proven = agreements_act(&mut w, &mut seller, agreements::types::STANDING_OFFER, o.to_map(), None);
    let name = vow(&mut w, &mut seller, "A table, made to order");
    let promised = lone_offer(&mut w, &mut seller, name, "One table.");
    assert_eq!(agreements::Sold::Vow(name).class(), agreements::OfferClass::Promised(name));
    let v = view(&w);
    assert!(matches!(v.proven_delivery(&proven, b"delivered", &[]).unwrap(), agreements::ProofVerdict::Unknown(_)), "no checker held: not proven here");
    let held: [(Hash, &dyn agreements::ProofChecker); 1] = [(cmip, &TestChecker)];
    assert!(v.proven_delivery(&promised, b"delivered", &held).is_err(), "a promised offer is no proven offer");
    assert_eq!(v.proven_delivery(&proven, b"delivered", &held).unwrap(), agreements::ProofVerdict::Proven);
    assert!(matches!(v.proven_delivery(&proven, b"something else", &held).unwrap(), agreements::ProofVerdict::NotProven(_)));
    let other: [(Hash, &dyn agreements::ProofChecker); 1] = [(spec("another cMIP"), &TestChecker)];
    assert!(matches!(v.proven_delivery(&proven, b"delivered", &other).unwrap(), agreements::ProofVerdict::Unknown(_)), "only the named cMIP's checker judges");
}

/// F268 (Development draft 7, Q1, decided by Nobody, allegedly, 12 October
/// 2026): a proof checker is not a task; a cMIP that checks proofs of
/// delivery declares so in its specification by one field. The core lists
/// and asks only a checker whose cMIP declares it: one that does not is
/// never asked, and the delivery is not proven by it.
#[test]
fn f268_only_a_cmip_declaring_it_checks_proofs_of_delivery() {
    let mut w = World::new();
    let mut seller = w.genesis("a seller", vec![own_home()], None, None);
    let (declared, silent) = (spec("a cMIP declaring it checks deliveries"), spec("a cMIP declaring nothing"));
    let offer = |cmip: Hash| agreements::Offer {
        under: None,
        sold: vec![agreements::Sold::Access(cmip, mor_core::cbor::encode(&Value::Uint(7)))],
        price: Amount { unit: spec("a unit"), value: 10 },
        paid: None,
        words: None,
        until: None,
        time: None,
        refund: None,
    };
    let a = agreements_act(&mut w, &mut seller, agreements::types::STANDING_OFFER, offer(declared).to_map(), None);
    let b = agreements_act(&mut w, &mut seller, agreements::types::STANDING_OFFER, offer(silent).to_map(), None);
    let held: [(Hash, &dyn agreements::ProofChecker); 2] = [(declared, &TestChecker), (silent, &Undeclared)];
    assert_eq!(agreements::delivery_checkers(&held), vec![declared], "listed: only the declared checker");
    let v = view(&w);
    assert_eq!(v.proven_delivery(&a, b"delivered", &held).unwrap(), agreements::ProofVerdict::Proven);
    match v.proven_delivery(&b, b"delivered", &held).unwrap() {
        agreements::ProofVerdict::Unknown(why) => assert!(why.contains("F268"), "{why}"),
        other => panic!("a checker its cMIP does not declare was asked: {other:?}"),
    }
}

/// F268: the specification format's field marking a proof-of-delivery
/// checker, as the library reads it from a specification's content. Field
/// 12, `true`, on a cMIP (mechanic, the build's: the number and the value);
/// absent, nothing declared; anything else, or on another kind, invalid.
#[test]
fn f268_the_specification_field_marks_a_proof_checker() {
    use mor_core::development::checks_delivery;
    let spec_of = |kind: u64, field_12: Option<Value>| {
        let mut m = vec![(Value::Uint(0), Value::Uint(kind)), (Value::Uint(1), Value::Bytes(spec("its creator").to_vec())), (Value::Uint(9), Value::Text("The specification.".into()))];
        if let Some(v) = field_12 {
            m.push((Value::Uint(12), v));
        }
        Value::Map(m)
    };
    assert_eq!(checks_delivery(&spec_of(0, Some(Value::Bool(true)))), Ok(true), "a cMIP declaring it");
    assert_eq!(checks_delivery(&spec_of(0, None)), Ok(false), "a cMIP declaring nothing");
    assert!(checks_delivery(&spec_of(1, Some(Value::Bool(true)))).is_err(), "a Module: only a cMIP declares it");
    assert!(checks_delivery(&spec_of(0, Some(Value::Bool(false)))).is_err(), "false is not written: absent says it");
    assert!(checks_delivery(&spec_of(0, Some(Value::Uint(1)))).is_err());
    assert!(checks_delivery(&Value::Map(vec![(Value::Uint(12), Value::Bool(true))])).is_err(), "no kind");
}

/// Agreements draft 11, rules 11 and 13 (new in draft 11, F264, with
/// F261's evidence clause): a stream promised under a vow. The key the
/// seller delivers in keeping it names the sale: it is held as evidence
/// beside the sale, and the sale stays pending. The stream is cut short:
/// the buyer contests, and the evidence stays shown beside the contest.
/// The key worked; the promise did not.
#[test]
fn draft_11_f264_a_key_delivered_under_a_vow_is_evidence_not_a_state() {
    let mut c = Concert::new();
    let (fid, name) = (c.fan.id, c.name);
    let sale = c.claims[0];
    let key = {
        let a = c.w.everyday_act_refs(&mut c.club, spec("a live media cMIP"), 1, vec![(Value::Uint(0), Value::Bytes(b"the stream's key, sealed to the fan".to_vec()))], None, None, Some(vec![mor_core::act::Ref::Act(sale)]));
        c.w.add(&a)
    };
    let e = view_with(&c.w, &c.claims).vow(&name).unwrap();
    assert_eq!((e.sales[0].buyer, e.sales[0].state.clone(), e.sales[0].evidence.clone()), (fid, SaleState::Pending, vec![key]), "evidence, shown; the state is the buyer's");
    let k = contest_with(&mut c.w, &mut c.fan, name, sale, Some(agreements::Promise::Words("The stream stopped at half time.".into())));
    let e = view_with(&c.w, &c.claims).vow(&name).unwrap();
    assert_eq!(e.sales[0].state, SaleState::Contested { by: vec![k] });
    assert_eq!(e.sales[0].evidence, vec![key], "the key worked; the promise did not");
}
