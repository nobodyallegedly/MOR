//! Fable's hostile review of F230 to F234 (`docs/reviews/announcements-review.md`),
//! as the vow grammar build answers it (F237, F240; the texts say
//! "announcement" until the redraft, F241, the code "vow").
//!
//! The review's four tests pinned what the core did before anything of F230
//! to F234 was built, each named `today_…`, so that the build would change
//! it on purpose or leave it alone on purpose. F237 moved everything about
//! substance (closings, what a vow became, quantities, streams) to cMIPs and
//! kept only the grammar: a vow, its own chain, named by its genesis; offers
//! naming it, with their words; each sale pending, confirmed or contested.
//! Each test below says what it asserted before, and what changed and why
//! (`docs/vow-grammar-build.md`, "The tests that pinned the old behaviour"):
//!
//! 1. over-selling: the offer now names the vow (`[3, vow]`) instead of the
//!    access form; still no count anywhere (quantities are the cMIPs',
//!    F237), and now each sale carries its own state, pending;
//! 2. voiding the opening act: the vow is voided by its signer's rotation;
//!    the name others wrote down stands (F237's correction to F230's cost):
//!    the offer counts, the purchase stands, the sale stands, the vow is
//!    shown void;
//! 3. closings: the core reads no closing at all (F237: what a vow became is
//!    the cMIPs'), and a claim reaches a work only by its own work claim
//!    (rule 15, works only); what the core does read is the vow's own chain
//!    (versions, a fork of its signer's);
//! 4. a second agreement's offer on the same vow: still not shown outside
//!    the first; whether rule 15b's visibility reaches an offer naming a vow
//!    is put to Nobody, allegedly (question QV1 in the build's report).
//!
//! Test identities only; the specification hashes are test values until
//! the freeze, as in the other Agreements tests.

mod common;

use common::{own_home, Person, Rot, World};
use mor_core::act::Object;
use mor_core::agreements::{self, AgreementsView, Field4, Mips, PurchaseVerdict, Rule, SaleState, Stake, Terms, Who};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::envelopes::vow::Vow;
use mor_core::hash::{sha256, Hash};
use mor_core::identity::KeptTip;
use mor_core::mmr::Mmr;
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

/// A later version of a vow, naming its genesis and the version it
/// follows.
fn vow_version(w: &mut World, p: &mut Person, genesis: Hash, previous: Hash, words: &str) -> Hash {
    let v = Vow { words: words.into(), cmip: None };
    let a = w.everyday_act(p, mips().envelopes, mor_core::envelopes::types::VOW, v.to_map(), Some(vec![Object { chain: genesis, predecessor: previous }]), None);
    w.add(&a)
}

/// A closing act as F234 described it, now a cMIP's act the core never
/// reads (F237): it names the vow as its chain and, in `refs`, what it
/// became.
fn cmip_closing(w: &mut World, p: &mut Person, name: Hash, became: Hash) -> Hash {
    let a = w.everyday_act_refs(
        p,
        spec("a vow cMIP"),
        1,
        vec![(Value::Uint(0), Value::Bytes(became.to_vec()))],
        Some(vec![Object { chain: name, predecessor: name }]),
        None,
        Some(vec![mor_core::act::Ref::Act(became)]),
    );
    w.add(&a)
}

/// A work claim by `p` alone on `work`, public; it binds at once (rule 15).
fn claim_alone(w: &mut World, p: &mut Person, work: Hash) -> Hash {
    let c = agreements::WorkClaim { work, creators: vec![p.id], commitment: None };
    agreements_act(w, p, agreements::types::WORK_CLAIM, c.to_map(), None)
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

/// The smallest deal between two parties, writing one stake in `object`.
fn deal_on(parties: [Hash; 2], object: Hash) -> Terms {
    Terms {
        parties: parties.to_vec(),
        text: "Two owners of one vow.".into(),
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

/// The kept tip of a sequence at position `k` (1-based).
fn tip_at(seq: &[Hash], k: usize) -> KeptTip {
    KeptTip {
        act: seq[k - 1],
        position: k as u64,
        summary: Mmr::from_ids(&seq[..k]).root(),
    }
}

/// Review attack 3 (over-selling a limited vow). The club vows a concert in
/// a hall of 500 seats and sells it by an offer naming the vow, whose words
/// say "500 seats". Three fans stand for the first 500 and the one too
/// many. **Before:** the offer used the access form, each payment was a
/// purchase, and nothing counted. **Now:** the offer names the vow
/// (`[3, vow]`) and carries its words (F237); each payment is still a
/// purchase and nothing counts (quantities and seats are the cMIPs', F237;
/// the review's option B); what changed is that each fan, signed onto the
/// vow by their own claim, holds a sale with its own state, pending.
#[test]
fn a_vow_is_sold_without_count_each_sale_with_its_own_state() {
    let mut w = World::new();
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let concert = vow(&mut w, &mut club, "A concert in the hall, 12 December, 500 seats");
    let offer = lone_offer(&mut w, &mut club, concert, "One seat. 500 seats in all.");
    assert!(view(&w).offer(&offer).unwrap().counts);
    let mut claims = vec![];
    for i in 0..3 {
        let mut f = w.genesis(&format!("fan {i}"), vec![own_home()], None, None);
        let proof = format!("seat payment {i}");
        let r = receipt(&mut w, &mut club, f.id, offer, None, proof.as_bytes());
        claims.push(payers_claim(&mut w, &mut f, club.id, offer, None, proof.as_bytes()));
        let p = view(&w).purchase(&r).unwrap().expect("a payment following an offer is judged");
        assert_eq!(p.verdict, PurchaseVerdict::Purchase, "fan {i}: a purchase under the club's own terms (F215), whatever the words say about seats");
    }
    let e = view_with(&w, &claims).vow(&concert).unwrap();
    assert_eq!(e.sales.len(), 3, "three sales, the one too many among them: the core counts nothing");
    assert!(e.sales.iter().all(|s| s.state == SaleState::Pending), "each pending: nobody confirmed or contested");
    assert!(view(&w).work_owners(&concert).unwrap().claims.is_empty(), "no claim, no stake: nothing to count a seat against");
}

/// Review attack 1 and finding 8 (F230's stated cost). A thief with Dario's
/// signing key signs a vow in his name; the club sells it; a fan pays and
/// signs on; Dario rotates to the tip before the thief's vow. **Before:**
/// the opening was a cMIP act; the name went on working, which the review
/// said the cost should say. **Now (F237's correction):** a rotation voids
/// the signer's own acts after the kept tip, the vow and the thief's claim
/// among them, never a name others wrote down: the club's offer still
/// counts, the fan's purchase and sale stand, and the vow is shown void.
/// Rule 15 unchanged: a claim on the void name binds like any other.
#[test]
fn voiding_a_vow_voids_its_signers_acts_never_the_name_others_wrote_down() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let before = vow(&mut w, &mut dario, "Saturday's match, from the stands");
    let opening = vow(&mut w, &mut dario, "Sunday's match, from the stands");
    let thiefs_claim = claim_alone(&mut w, &mut dario, opening);
    assert_eq!(view(&w).work_owners(&opening).unwrap().claims, vec![thiefs_claim]);
    let offer = lone_offer(&mut w, &mut club, opening, "Live access to Sunday's match.");
    let r = receipt(&mut w, &mut club, fan.id, offer, None, b"the fan paid the club");
    let c = payers_claim(&mut w, &mut fan, club.id, offer, None, b"the fan paid the club");
    assert_eq!(view(&w).purchase(&r).unwrap().unwrap().verdict, PurchaseVerdict::Purchase);
    let (rotation, _dario2) = w.rotate(&dario, Rot { kept: Some(vec![tip_at(&dario.seq, 1)]), ..Default::default() });
    assert_eq!(w.v.status(&rotation), Status::Valid);
    assert_eq!(w.v.status(&before), Status::Valid, "the kept act stands");
    assert_eq!(w.v.status(&opening), Status::Void, "the vow is the signer's own act: voided by the rotation (Identity rules 16, 17)");
    assert_eq!(w.v.status(&thiefs_claim), Status::Void, "and so is the claim made after it on the same line");
    let e = view(&w).offer(&offer).unwrap();
    assert!(e.counts, "the club's offer naming the void vow still counts: {:?}", e.problems);
    assert_eq!(view(&w).purchase(&r).unwrap().unwrap().verdict, PurchaseVerdict::Purchase, "the fan's purchase under it is still a purchase");
    let v = view_with(&w, &[c]).vow(&opening).unwrap();
    assert!(v.void, "the vow is shown void: the name points at a void act");
    assert_eq!(v.sales.iter().map(|s| (s.buyer, s.state.clone())).collect::<Vec<_>>(), vec![(fan.id, SaleState::Pending)], "the fan's sale stands");
    assert!(view(&w).work_owners(&opening).unwrap().claims.is_empty(), "the void claim is gone from the name's record");
    let clubs = claim_alone(&mut w, &mut club, opening);
    let o = view(&w).work_owners(&opening).unwrap();
    assert_eq!((o.claims, o.default_holder, o.contested), (vec![clubs], Some(club.id), false), "rule 15 unchanged: a claim on a void act's id binds like any other");
}

/// Review attacks 1, 2 and 6 (a claim covering what a vow became; closed
/// naming someone else's work; closed twice). **Before:** closings were
/// cMIP acts read by nobody; Dario's claim on the announcement reached no
/// recording; a stranger held recording A uncontested. **Now:** unchanged
/// on purpose: F237 moves what a vow became to the cMIPs, and claims reach
/// a work only by an ordinary work claim (rule 15, works only), so nothing
/// is backdated (finding 1) and no closing binds the creators (finding 2).
/// What the core now reads is the vow's own chain: a later version names
/// the genesis and is its signer's; two versions of one previous are its
/// signer's fork, shown; a stranger's act on the chain is no version; and
/// an offer must name the genesis, never a later version.
#[test]
fn what_a_vow_became_is_the_cmips_and_the_core_reads_only_its_chain() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let album = vow(&mut w, &mut dario, "An album, ten songs, next spring");
    let c = claim_alone(&mut w, &mut dario, album);
    let a = mor_core::hash::work_hash(b"recording A: ten songs, as mixed");
    let b = mor_core::hash::work_hash(b"recording B: the same ten songs, remastered");
    let first = cmip_closing(&mut w, &mut dario, album, a);
    let second = cmip_closing(&mut w, &mut dario, album, b);
    assert_eq!((w.v.status(&first), w.v.status(&second)), (Status::Valid, Status::Valid), "a cMIP's acts; the core reads neither");
    assert!(view(&w).work_owners(&a).unwrap().claims.is_empty(), "Dario's claim on the vow reaches no recording a closing names");
    assert!(view(&w).work_owners(&b).unwrap().claims.is_empty());
    let s = claim_alone(&mut w, &mut stranger, a);
    let o = view(&w).work_owners(&a).unwrap();
    assert_eq!((o.claims, o.default_holder, o.contested), (vec![s], Some(stranger.id), false), "the stranger owns A as recorded, by its own work claim");
    let o = view(&w).work_owners(&album).unwrap();
    assert_eq!((o.claims, o.default_holder), (vec![c], Some(dario.id)), "and Dario's claim is on the vow's name alone");
    // The vow's own chain.
    let e = view(&w).vow(&album).unwrap();
    assert_eq!((e.versions.clone(), e.latest.clone(), e.words.clone()), (vec![album], vec![album], vec!["An album, ten songs, next spring".to_string()]));
    assert!(e.sales.is_empty(), "nobody signed onto it: no state (F240)");
    let v2 = vow_version(&mut w, &mut dario, album, album, "An album, twelve songs, next summer");
    let e = view(&w).vow(&album).unwrap();
    assert_eq!((e.versions.clone(), e.latest.clone()), (vec![album, v2], vec![v2]), "a later version, signed again on its chain");
    let theirs = vow_version(&mut w, &mut stranger, album, v2, "An album, never");
    assert_eq!(view(&w).vow(&album).unwrap().latest, vec![v2], "a stranger's act on the chain is no version of it");
    let _ = theirs;
    let v3 = vow_version(&mut w, &mut dario, album, v2, "An album, autumn");
    let v3b = vow_version(&mut w, &mut dario, album, v2, "An album, winter");
    let mut fork = vec![v3, v3b];
    fork.sort();
    assert_eq!(view(&w).vow(&album).unwrap().latest, fork, "two versions of one previous: the signer's fork, shown");
    assert!(view(&w).vow(&v2).is_err(), "a later version is not a vow's name");
    let o = lone_offer(&mut w, &mut dario, v2, "The album, preordered.");
    let e = view(&w).offer(&o).unwrap();
    assert!(!e.counts && e.problems.iter().any(|p| p.contains("genesis")), "an offer names the vow by its genesis, for good: {:?}", e.problems);
}

/// Review attack 2 and finding 10 (a second agreement's offer on the same
/// vow). Dario and the club write a stake in the vow in one deal; Dario and
/// a sponsor in another; the sponsor's deal sells it. **Before:** the
/// access form; nothing marked the offer outside the club's deal; the
/// purchase named the sponsor's deal. **Now:** the offer names the vow;
/// otherwise unchanged: whether rule 15b's visibility reaches an offer
/// naming a vow that an agreement claims is put to Nobody, allegedly
/// (question QV1), and is not built.
#[test]
fn an_offer_naming_a_vow_under_a_second_agreement_is_not_shown_outside_the_first() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut sponsor = w.genesis("a sponsor", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let stream = vow(&mut w, &mut dario, "The cup final, from the stands");
    let t1 = deal_on([dario.id, club.id], stream).to_map();
    let with_club = agreements_act(&mut w, &mut dario, agreements::types::TERMS, t1, None);
    sign(&mut w, &mut dario, &with_club);
    sign(&mut w, &mut club, &with_club);
    let t2 = deal_on([dario.id, sponsor.id], stream).to_map();
    let with_sponsor = agreements_act(&mut w, &mut dario, agreements::types::TERMS, t2, None);
    sign(&mut w, &mut dario, &with_sponsor);
    sign(&mut w, &mut sponsor, &with_sponsor);
    let mut both = vec![with_club, with_sponsor];
    both.sort();
    assert_eq!(view(&w).work_owners(&stream).unwrap().agreements, both, "two agreements claim the vow");
    let o = agreements::Offer {
        under: Some(with_sponsor),
        sold: vec![agreements::Sold::Vow(stream)],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: Some(agreements::Paid::ByStakes),
        words: Some("Live access to the cup final.".into()),
        until: None,
        time: None,
        refund: None,
    };
    let offer = agreements_act(&mut w, &mut dario, agreements::types::STANDING_OFFER, o.to_map(), Some(vec![Object { chain: with_sponsor, predecessor: with_sponsor }]));
    sign(&mut w, &mut sponsor, &offer);
    let e = view(&w).offer(&offer).unwrap();
    assert!(e.counts && e.unsigned.is_empty(), "{:?}", e.problems);
    assert!(!e.problems.iter().any(|p| p.contains("outside")), "nothing marks it as outside the club's deal: {:?}", e.problems);
    let r = receipt(&mut w, &mut dario, fan.id, offer, Some(with_sponsor), b"the fan paid under the sponsor's deal");
    let c = payers_claim(&mut w, &mut fan, dario.id, offer, Some(with_sponsor), b"the fan paid under the sponsor's deal");
    let p = view(&w).purchase(&r).unwrap().expect("judged");
    assert_eq!(p.verdict, PurchaseVerdict::Purchase, "a purchase under the sponsor's deal; the club's deal is not in it");
    let v = view_with(&w, &[c]).vow(&stream).unwrap();
    assert_eq!(v.sales.len(), 1, "one sale, under whichever agreement the offer named");
}
