//! Fable's hostile review of F230 to F234 (`docs/reviews/announcements-review.md`):
//! announcements, an act naming something MOR cannot hash yet, sold by
//! offers naming it, ended by a closing act naming what it became; and
//! streams, the one kind the core spells out. Nothing of F230 to F234 is
//! built. These tests pin what the core does today where the review's
//! attacks touch it, so that the build, when it comes, changes it on
//! purpose or leaves it alone on purpose:
//!
//! 1. an offer selling access sells without count: a lone seller's access
//!    offer for "a hall with 500 seats" takes the 501st payment as a
//!    purchase like the first; F224's over-sale check reads stakes only;
//! 2. voiding the opening act voids nothing that names its id: the club's
//!    offer naming it still counts, a fan's purchase under it is still a
//!    purchase, and a second identity's claim on the void name binds; only
//!    the opener's own later acts on that line fall with it;
//! 3. a closing act naming what an announcement became is read by nobody:
//!    the opener's claim on the announcement reaches neither of two
//!    recordings two closing acts name, and a stranger's claim on one of
//!    them binds uncontested;
//! 4. an offer under a second agreement claiming the same announcement is
//!    never shown outside the first: for access, rule 15b has no work hash
//!    to read, and the purchase names whichever agreement the offer did.
//!
//! Test identities only; the specification hashes are test values until
//! the freeze, as in the other Law tests.

mod common;

use common::{own_home, Person, Rot, World};
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::finance::{Amount, Payer, Payload as Fin, Purchase, Receipt};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::KeptTip;
use mor_core::law::{self, Field4, LawView, Mips, PurchaseVerdict, Rule, Stake, Terms, Who};
use mor_core::mmr::Mmr;

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: common::identity_spec(),
        envelope: t("ENVELOPE"),
        text: t("TEXT"),
        finance: t("FINANCE"),
        law: t("LAW"),
        production: t("PRODUCTION"),
    }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn view(w: &World) -> LawView<'_> {
    LawView::new(&w.v, mips())
}

fn law_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mips().law, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    law_act(w, p, law::types::SIGNATURE, law::signature_payload(x), Some(vec![Object { chain: *x, predecessor: *x }]))
}

/// An announcement as F234 describes it: an act of its signer, of some
/// announcement cMIP, naming in words what is to come. Its id is the name.
fn announce(w: &mut World, p: &mut Person, words: &str) -> Hash {
    let a = w.everyday_act(p, spec("an announcement cMIP"), 0, vec![(Value::Uint(0), Value::Text(words.into()))], None, None);
    w.add(&a)
}

/// A closing act as F234 describes it: the signer's act ending the
/// announcement (named as the chain it closes) and naming, in `refs`, what
/// it became.
fn close(w: &mut World, p: &mut Person, announcement: Hash, became: Hash) -> Hash {
    let a = w.everyday_act_refs(
        p,
        spec("an announcement cMIP"),
        1,
        vec![(Value::Uint(0), Value::Bytes(became.to_vec()))],
        Some(vec![Object { chain: announcement, predecessor: announcement }]),
        None,
        Some(vec![mor_core::act::Ref::Act(became)]),
    );
    w.add(&a)
}

/// A work claim by `p` alone on `work`, public; it binds at once (rule 15).
fn claim_alone(w: &mut World, p: &mut Person, work: Hash) -> Hash {
    let c = law::WorkClaim { work, creators: vec![p.id], commitment: None };
    law_act(w, p, law::types::WORK_CLAIM, c.to_map(), None)
}

/// The access form of what an offer sells (`[2, [cmip, params]]`), its
/// parameters naming the announcement in the cMIP's own words, which the
/// core never reads.
fn access_to(announcement: Hash, words: &str) -> law::Sold {
    let params = mor_core::cbor::encode(&Value::Array(vec![Value::Text(words.into()), Value::Bytes(announcement.to_vec())]));
    law::Sold::Access(spec("an announcement cMIP"), params)
}

/// A lone seller's standing offer (F215): no agreement behind it, paid to
/// the signer, with its words.
fn lone_offer(w: &mut World, p: &mut Person, sold: law::Sold, words: &str) -> Hash {
    let o = law::Offer {
        under: None,
        sold: vec![sold],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: None,
        words: Some(words.into()),
        until: None,
        time: None,
        refund: None,
    };
    law_act(w, p, law::types::STANDING_OFFER, o.to_map(), None)
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
    let a = w.everyday_act(payee, mips().finance, 2, r.to_map(), None, None);
    w.add(&a)
}

/// The smallest deal between two parties, writing one stake in `object`.
fn deal_on(parties: [Hash; 2], object: Hash) -> Terms {
    Terms {
        parties: parties.to_vec(),
        text: "Two owners of one announced thing.".into(),
        cmips: vec![(6, spec("a payment cMIP"))],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: None,
        parent: None,
        grammar: None,
        arbitrators: None,
        split_grant: None,
        payee_grants: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: Some(vec![Stake {
            object: Who::Id(object),
            holders: vec![(Who::Id(parties[0]), 500_000), (Who::Id(parties[1]), 500_000)],
        }]),
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: None,
        refund: None,
        fees: None,
    }
}

/// The kept tip of a sequence at position `k` (1-based), as a rotation
/// names it: `k` below the sequence's length draws a line that leaves the
/// later acts out.
fn tip_at(seq: &[Hash], k: usize) -> KeptTip {
    KeptTip {
        act: seq[k - 1],
        position: k as u64,
        summary: Mmr::from_ids(&seq[..k]).root(),
    }
}

/// Review attack 3 (over-selling a limited announcement). The club
/// announces a concert in a hall of 500 seats and sells access under a
/// lone seller's offer whose words say "500 seats". The core reads the
/// words of nothing: the 501st payment is a purchase like the first, and
/// no count exists anywhere for a verifier to compare. F224 catches a
/// stake sold twice because a stake is a number in millionths on the
/// seller's own line; a seat is not a stake, and a ticket is not a
/// transfer. Only the offer's words, and whatever a ticketing Module
/// counts, say the hall is full.
#[test]
fn today_an_access_offer_sells_without_count_so_a_limited_announcement_is_sold_past_its_limit() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let concert = announce(&mut w, &mut club, "A concert in the hall, 12 December, 500 seats");
    let offer = lone_offer(&mut w, &mut club, access_to(concert, "one seat at the concert"), "One seat. 500 seats in all.");
    assert!(view(&w).offer(&offer).unwrap().counts);
    // Three fans stand for the first 500 and the one too many: the core
    // tells them apart in nothing.
    let fans: Vec<Person> = (0..3).map(|i| w.genesis(&format!("fan {i}"), vec![own_home()], None, None)).collect();
    for (i, f) in fans.iter().enumerate() {
        let r = receipt(&mut w, &mut club, f.id, offer, None, format!("seat payment {i}").as_bytes());
        let p = view(&w).purchase(&r).unwrap().expect("a payment following an offer is judged");
        assert_eq!(p.verdict, PurchaseVerdict::Purchase, "fan {i}: a purchase under the club's own terms (F215), whatever the words say about seats");
    }
    // The over-sale machinery exists for stakes only: the club holds no
    // stake in the concert that a sale could exhaust. Nothing is owed back
    // by any rule the core can compute; refunds are the offer's words.
    assert!(view(&w).work_owners(&concert).unwrap().claims.is_empty(), "no claim, no stake: nothing to count a seat against");
}

/// Review attack 1 (an announcement that is never closed, or whose opening
/// act is gone) and F230's stated cost ("a rotation that voids the opening
/// act voids the name"). A thief with Dario's everyday key opens a stream
/// in his name; the club, taking it for Dario's, publishes an offer for
/// access naming it; a fan pays the club; Dario rotates to the tip before
/// the thief's act. The opening act is void. The name is not: the club's
/// offer still counts, the fan's purchase is still a purchase, and the
/// club's own claim on the void name binds the club as its default holder.
/// What a rotation voids is the opener's own acts after the kept tip, the
/// opener's claim on the name among them; the 32 bytes everyone else wrote
/// down go on working. Stated as a cost, the sentence should say that.
#[test]
fn today_voiding_the_opening_act_voids_nothing_that_names_its_id() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    // Dario's own act first, so the rotation has a tip to keep.
    let before = announce(&mut w, &mut dario, "Saturday's match, from the stands");
    // The thief's opening, with Dario's key, next on his line; then the
    // thief's claim on it in Dario's name.
    let opening = announce(&mut w, &mut dario, "Sunday's match, from the stands");
    let thiefs_claim = claim_alone(&mut w, &mut dario, opening);
    assert_eq!(view(&w).work_owners(&opening).unwrap().claims, vec![thiefs_claim]);
    // The club sells access to it and a fan pays.
    let offer = lone_offer(&mut w, &mut club, access_to(opening, "Sunday's match, live"), "Live access to Sunday's match.");
    let r = receipt(&mut w, &mut club, fan.id, offer, None, b"the fan paid the club");
    assert_eq!(view(&w).purchase(&r).unwrap().unwrap().verdict, PurchaseVerdict::Purchase);
    // Dario rotates, keeping the tip before the thief's opening.
    let (rotation, _dario2) = w.rotate(&dario, Rot { kept: Some(vec![tip_at(&dario.seq, 1)]), ..Default::default() });
    assert_eq!(w.v.status(&rotation), Status::Valid);
    assert_eq!(w.v.status(&before), Status::Valid, "the kept act stands");
    assert_eq!(w.v.status(&opening), Status::Void, "the opening act is voided by the rotation (Identity rules 16, 17)");
    assert_eq!(w.v.status(&thiefs_claim), Status::Void, "and so is the claim made after it on the same line");
    // The name is not an act anyone else's act depends on: it is 32 bytes.
    let e = view(&w).offer(&offer).unwrap();
    assert!(e.counts, "the club's offer naming the void opening still counts: {:?}", e.problems);
    assert_eq!(view(&w).purchase(&r).unwrap().unwrap().verdict, PurchaseVerdict::Purchase, "the fan's purchase under it is still a purchase");
    let o = view(&w).work_owners(&opening).unwrap();
    assert!(o.claims.is_empty(), "the void claim is gone from the name's record");
    // Anyone may now claim the void name, and the claim binds.
    let clubs = claim_alone(&mut w, &mut club, opening);
    let o = view(&w).work_owners(&opening).unwrap();
    assert_eq!((o.claims, o.default_holder, o.contested), (vec![clubs], Some(club.id), false), "a claim on a void act's id binds like any other: the core checks no form of the hash");
}

/// Review attack 2 (a claim on an announcement covering what it became;
/// closed naming someone else's work; closed twice). Dario announces an
/// album and claims the announcement. He closes it naming recording A;
/// then closes it again naming recording B. A stranger claims A. Today
/// the closing acts are a cMIP's acts the core never reads: Dario's claim
/// on the announcement reaches neither A nor B, the stranger holds A
/// uncontested, and the second closing is as good as the first. Whatever
/// "a claim on the announcement covers what it became" is to mean, none
/// of it exists; and the pieces it needs (which closing counts, whose
/// work may be named) are not in F234.
#[test]
fn today_a_closing_act_naming_what_an_announcement_became_is_read_by_nobody() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let album = announce(&mut w, &mut dario, "An album, ten songs, next spring");
    let c = claim_alone(&mut w, &mut dario, album);
    let a = mor_core::hash::work_hash(b"recording A: ten songs, as mixed");
    let b = mor_core::hash::work_hash(b"recording B: the same ten songs, remastered");
    let first = close(&mut w, &mut dario, album, a);
    let second = close(&mut w, &mut dario, album, b);
    assert_eq!(w.v.status(&first), Status::Valid);
    assert_eq!(w.v.status(&second), Status::Valid, "two closings of one announcement: both valid, nothing reads them as a fork of anything");
    assert!(view(&w).work_owners(&a).unwrap().claims.is_empty(), "Dario's claim on the announcement reaches no recording the closing names");
    assert!(view(&w).work_owners(&b).unwrap().claims.is_empty());
    let s = claim_alone(&mut w, &mut stranger, a);
    let o = view(&w).work_owners(&a).unwrap();
    assert_eq!((o.claims, o.default_holder, o.contested), (vec![s], Some(stranger.id), false), "the stranger owns A as recorded; the announcement's claim is nowhere near it");
    let o = view(&w).work_owners(&album).unwrap();
    assert_eq!((o.claims, o.default_holder), (vec![c], Some(dario.id)), "and Dario's claim is on the announcement alone");
}

/// Review attack 2 (competing claims on the result) and attack 7 (what
/// announcements add to agreements). Dario and the club write a stake in
/// the announcement in one deal; Dario and a sponsor write a stake in the
/// same announcement in another. The sponsor's deal publishes an offer for
/// access, signed by both its parties: it counts, and nothing marks it as
/// outside the club's deal; a fan's purchase names the sponsor's deal and
/// is a purchase. Rule 15b shows a publication or offer "for a work with an
/// existing claim" outside the claiming agreement; for access the offer
/// names no work the core reads, so there is nothing to show. F234 says an
/// offer naming an announcement sells it "under whatever agreement claims
/// it": with two, "whatever" is both, and the one left out sees nothing.
#[test]
fn today_an_access_offer_under_a_second_agreement_on_the_same_announcement_is_never_shown_outside_the_first() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut sponsor = w.genesis("a sponsor", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let stream = announce(&mut w, &mut dario, "The cup final, from the stands");
    let t1 = deal_on([dario.id, club.id], stream).to_map();
    let with_club = law_act(&mut w, &mut dario, law::types::TERMS, t1, None);
    sign(&mut w, &mut dario, &with_club);
    sign(&mut w, &mut club, &with_club);
    let t2 = deal_on([dario.id, sponsor.id], stream).to_map();
    let with_sponsor = law_act(&mut w, &mut dario, law::types::TERMS, t2, None);
    sign(&mut w, &mut dario, &with_sponsor);
    sign(&mut w, &mut sponsor, &with_sponsor);
    let mut both = vec![with_club, with_sponsor];
    both.sort();
    assert_eq!(view(&w).work_owners(&stream).unwrap().agreements, both, "two agreements claim the announcement");
    // The sponsor's deal sells access, paid by its stakes, signed by both.
    let o = law::Offer {
        under: Some(with_sponsor),
        sold: vec![access_to(stream, "the cup final, live")],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: Some(law::Paid::ByStakes),
        words: Some("Live access to the cup final.".into()),
        until: None,
        time: None,
        refund: None,
    };
    let offer = law_act(&mut w, &mut dario, law::types::STANDING_OFFER, o.to_map(), Some(vec![Object { chain: with_sponsor, predecessor: with_sponsor }]));
    sign(&mut w, &mut sponsor, &offer);
    let e = view(&w).offer(&offer).unwrap();
    assert!(e.counts && e.unsigned.is_empty(), "{:?}", e.problems);
    assert!(!e.problems.iter().any(|p| p.contains("outside")), "nothing marks it as outside the club's deal: {:?}", e.problems);
    let r = receipt(&mut w, &mut dario, fan.id, offer, Some(with_sponsor), b"the fan paid under the sponsor's deal");
    let p = view(&w).purchase(&r).unwrap().expect("judged");
    assert_eq!(p.verdict, PurchaseVerdict::Purchase, "a purchase under the sponsor's deal; the club's deal is not in it");
}
