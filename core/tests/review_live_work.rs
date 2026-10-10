//! Fable's hostile review of F229 (`docs/reviews/live-work-review.md`): a
//! live work named by its opening segment, a class of its own; its
//! recording a separate work naming it. These tests pinned what the core
//! did before anything of F229 was built, so that the build would change it
//! on purpose. The vow grammar build (F237) is that build for the core: a
//! stream's name is a vow (Envelopes type 5, "announcement" in the texts
//! until the redraft, F241), and everything else about streams (segments,
//! who signs them, closing, branches, the recording's computation) is the
//! live media cMIP's (`cmips/cmip-live-media-draft-1.md`). What changed and
//! why, test by test (`docs/vow-grammar-build.md`):
//!
//! 1. the work claim checks no form of its hash: unchanged (rule 15, works
//!    only, is unchanged); the opening is now a vow, not a cMIP act;
//! 2. an offer selling a stream now names its vow (`[3, vow]`, with its
//!    words) instead of the access form; a work claim on the name still
//!    reaches none of its sales; what changed is that the fan, signed on by
//!    their own claim, holds a sale with a state, and the claimant, who
//!    never signed on, cannot contest it (F240);
//! 3. "claimed", for a purchase, means an agreement with a stake in the
//!    hash: unchanged;
//! 4. a publication under any name is sold under the agreement claiming
//!    that name: unchanged;
//! 5. the recording's hash and the stream's name are two works with no tie
//!    the core reads: unchanged on purpose (F237: what a vow became is the
//!    cMIPs'; the live media cMIP computes the recording).
//!
//! Test identities only; the specification hashes are test values until
//! the freeze, as in the other Agreements tests.

mod common;

use common::{own_home, Person, World};
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::money::{Amount, Claim, PaidAt, Payer, Payload as Fin, Purchase, Receipt};
use mor_core::hash::{sha256, Hash};
use mor_core::agreements::{self, Field4, AgreementsView, Mips, PurchaseVerdict, Rule, SaleState, Stake, Terms, Who};
use mor_core::envelopes::vow::Vow;

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

fn view(w: &World) -> AgreementsView<'_> {
    AgreementsView::new(&w.v, mips())
}

fn agreements_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mips().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    agreements_act(w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), Some(vec![Object { chain: *x, predecessor: *x }]))
}

/// A vow (Envelopes type 5, F237): the stream's name, its genesis id, as
/// the live media cMIP draft 1 opens a stream.
fn vow(w: &mut World, p: &mut Person, words: &str) -> Hash {
    let v = Vow { words: words.into(), cmip: Some((spec("the live media cMIP"), Value::Null)) };
    let a = w.everyday_act(p, mips().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None);
    w.add(&a)
}

/// A work claim by `p` alone on `work`, public; it binds at once (rule 15:
/// a sole creator alone).
fn claim_alone(w: &mut World, p: &mut Person, work: Hash) -> Hash {
    let c = agreements::WorkClaim { work, creators: vec![p.id], commitment: None };
    agreements_act(w, p, agreements::types::WORK_CLAIM, c.to_map(), None)
}

/// A publication (Envelopes type 0) by `p` whose field 1 is `work` and field
/// 2 some locked bytes' hash; the core decodes nothing else of it.
fn publication(w: &mut World, p: &mut Person, work: Hash, locked: Hash) -> Hash {
    let x = w.everyday_act(
        p,
        mips().envelopes,
        0,
        vec![(Value::Uint(1), Value::Bytes(work.to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))],
        None,
        None,
    );
    w.add(&x)
}

/// A lone seller's standing offer (F215): no agreement behind it, paid to
/// the signer.
fn lone_offer(w: &mut World, p: &mut Person, sold: agreements::Sold, words: Option<&str>) -> Hash {
    let o = agreements::Offer {
        under: None,
        sold: vec![sold],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: None,
        words: words.map(String::from),
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

/// The smallest deal between two parties, writing one stake in `work`.
fn deal_on(parties: [Hash; 2], work: Hash) -> Terms {
    Terms {
        parties: parties.to_vec(),
        text: "Two owners of one work.".into(),
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
            object: Who::Id(work),
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

/// Review question 1 (a claim before the content exists), and question 9
/// (what the core would need): the work claim's field 0 is any 32 bytes.
/// Today Dario can claim, as a "work", the id of his first signed act (an
/// opening segment, say) before a second segment exists, and the core binds
/// it to him at once, with no check that the hash fingerprints anything. A
/// stranger claiming the same name makes it contested, as for any work:
/// the core records claims and their order, never legitimacy (rule 15).
#[test]
fn today_a_work_claim_binds_any_hash_before_any_content_exists() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    // Dario's stream, opened by a vow, its genesis id the name (F237; the
    // live media cMIP draft 1). Before this build: an act of a live media
    // cMIP. The assertions are unchanged: rule 15 is.
    let opening = vow(&mut w, &mut dario, "Saturday's match, live from the stands");
    let c = claim_alone(&mut w, &mut dario, opening);
    let o = view(&w).work_owners(&opening).unwrap();
    assert_eq!(o.claims, vec![c], "a sole creator's claim binds alone (rule 15)");
    assert_eq!(o.default_holder, Some(dario.id), "F218: the creator who opened the claim");
    assert!(!o.contested);
    // Nothing checked the hash: a claim on a name nobody has used yet binds
    // just the same.
    let unused = spec("a name for a stream that does not exist");
    let c2 = claim_alone(&mut w, &mut stranger, unused);
    let o = view(&w).work_owners(&unused).unwrap();
    assert_eq!((o.claims, o.default_holder), (vec![c2], Some(stranger.id)), "the core checks no form of a work's hash");
    // The stranger claims Dario's opening too: openly contested, shown as
    // recorded, neither claim legitimacy.
    let s = claim_alone(&mut w, &mut stranger, opening);
    let o = view(&w).work_owners(&opening).unwrap();
    assert!(o.contested);
    let mut both = vec![c, s];
    both.sort();
    assert_eq!(o.claims, both);
    assert_eq!(o.default_holder, None, "two claims: no default holder");
}

/// Review questions 1 and 4 (what a claim on a live work binds; selling
/// while it runs). **Before:** the stranger's offer used the access form
/// (`[2, [cmip, params]]`), naming no work, and a fan's payment was a
/// purchase under the stranger's terms with Dario's claim nowhere in it.
/// **Now (F237):** the offer names the stream's vow (`[3, vow]`) with its
/// words; the purchase and the claim are as before (rule 15, works only);
/// what is added: the fan, signed on by their own claim, holds a sale,
/// pending, and Dario, who never signed on, has no standing to contest it
/// (F240).
#[test]
fn an_offer_naming_a_streams_vow_is_judged_apart_from_any_claim_on_its_name() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let opening = vow(&mut w, &mut dario, "Dario's match, live");
    claim_alone(&mut w, &mut dario, opening);
    let offer = lone_offer(&mut w, &mut stranger, agreements::Sold::Vow(opening), Some("Dario's match, live"));
    let e = view(&w).offer(&offer).unwrap();
    assert!(e.counts, "a lone seller's offer naming a vow counts: {:?}", e.problems);
    let r = receipt(&mut w, &mut stranger, fan.id, offer, None, b"the fan paid the stranger");
    let p = view(&w).purchase(&r).unwrap().expect("a payment following an offer is judged");
    assert_eq!(p.verdict, PurchaseVerdict::Purchase, "a purchase under the stranger's own terms (F215); Dario's claim is nowhere in it");
    let o = view(&w).work_owners(&opening).unwrap();
    assert!(!o.contested && o.default_holder == Some(dario.id));
    // The fan signs on by their own claim; Dario's contest shows nothing.
    let c = {
        let x = Fin::Claim(Claim {
            rail: spec("a rail Module"),
            proof: b"the fan paid the stranger".to_vec(),
            payee: stranger.id,
            amount: Amount { unit: spec("a unit"), value: 300 },
            fulfils: offer,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: None,
        });
        let a = w.everyday_act(&mut fan, mips().money, 3, x.to_map(), None, None);
        w.add(&a)
    };
    let k = agreements::Contest { act: opening };
    agreements_act(&mut w, &mut dario, agreements::types::CONTEST, k.to_map(), Some(vec![Object { chain: opening, predecessor: opening }]));
    let mut v = view(&w);
    v.rail_valid.insert(c, PaidAt::Flow(spec("the stranger's pointer")));
    let sales: Vec<(Hash, SaleState)> = v.vow(&opening).unwrap().sales.into_iter().map(|s| (s.buyer, s.state)).collect();
    assert_eq!(sales, vec![(fan.id, SaleState::Pending)], "only someone who signed onto the vow may contest it (F240)");
}

/// Review question 3 (what is owned when nothing but a claim stands), and
/// question 8 (the common case): for a purchase, "claimed" means an
/// agreement with a stake in the hash (`claimed`, rule 32a: "a work some
/// agreement claims"), never a bare work claim. Dario, a lone creator with
/// no agreement, claims the stream's name; a stranger publishes a
/// publication under that very name and is paid for it: a plain payment,
/// not even "no purchase". With an agreement writing a stake in the name,
/// the same payment is no purchase, owed back (F126).
#[test]
fn today_a_bare_claim_does_not_make_a_name_claimed_for_purchases_an_agreement_does() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let opening = spec("the opening segment of Dario's stream");
    claim_alone(&mut w, &mut dario, opening);
    let theirs = publication(&mut w, &mut stranger, opening, spec("the stranger's copy, locked"));
    let r1 = receipt(&mut w, &mut stranger, fan.id, theirs, None, b"first payment");
    assert_eq!(view(&w).purchase(&r1).unwrap(), None, "no agreement claims the name: a plain payment, judged by nobody");
    // Dario and the club write a stake in the name: now the name is claimed
    // for purchases, and the stranger's next payment names no claim.
    let t = deal_on([dario.id, club.id], opening);
    let d = agreements_act(&mut w, &mut dario, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut dario, &d);
    sign(&mut w, &mut club, &d);
    assert_eq!(view(&w).work_owners(&opening).unwrap().agreements, vec![d]);
    let r2 = receipt(&mut w, &mut stranger, fan.id, theirs, None, b"second payment");
    let p = view(&w).purchase(&r2).unwrap().expect("a payment for a claimed work is judged");
    assert!(matches!(p.verdict, PurchaseVerdict::NoPurchase { .. }), "{:?}", p.verdict);
    // The first payment is unchanged by the later agreement: judged when
    // asked, against what the verifier holds; today it is "no purchase" too,
    // since nothing dates the payment against the agreement.
    let p1 = view(&w).purchase(&r1).unwrap().expect("judged now");
    assert!(matches!(p1.verdict, PurchaseVerdict::NoPurchase { .. }), "{:?}", p1.verdict);
}

/// Review question 9 (how much core is needed): the purchase rules read a
/// publication's field 1 as "the work" whatever it fingerprints. A
/// publication under the stream's name, sold by the owners' own offer, and
/// a payment naming their agreement, is a purchase today, with no notion of
/// a live work anywhere: the hook the claim and purchase rules need is the
/// name alone.
#[test]
fn today_a_publication_under_any_name_is_sold_under_the_agreement_claiming_that_name() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut club = w.genesis("the club", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let opening = spec("the opening segment of Dario's stream");
    let t = deal_on([dario.id, club.id], opening);
    let d = agreements_act(&mut w, &mut dario, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut dario, &d);
    sign(&mut w, &mut club, &d);
    let pub_ = publication(&mut w, &mut dario, opening, spec("the stream so far, locked"));
    // The owners' offer for their publication, under their deal, paid by the
    // stakes (no split service), signed by both.
    let o = agreements::Offer {
        under: Some(d),
        sold: vec![agreements::Sold::Publication(pub_)],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: Some(agreements::Paid::ByStakes),
        words: None,
        until: None,
        time: None,
        refund: None,
    };
    let offer = agreements_act(&mut w, &mut dario, agreements::types::STANDING_OFFER, o.to_map(), Some(vec![Object { chain: d, predecessor: d }]));
    sign(&mut w, &mut club, &offer);
    assert!(view(&w).offer(&offer).unwrap().counts);
    let r = receipt(&mut w, &mut dario, fan.id, offer, Some(d), b"the fan paid the owners");
    let p = view(&w).purchase(&r).unwrap().expect("judged");
    assert_eq!(p.verdict, PurchaseVerdict::Purchase, "a purchase under the claiming agreement, the name being any hash");
}

/// Review questions 5 and 6 (the recording's claim against the live
/// work's; clips' lineage): the core reads no tie between two work hashes.
/// A stranger claims the live name; Dario claims the recording's content
/// fingerprint, and his publication of it names the live work in `refs`
/// ("look at this"). Neither claim is contested by the other; the
/// reference is read by nobody in the core. Lineage, where it exists, is a
/// cMIP's (case studies 8 and 13), and today a recording "naming the live
/// work as its source" is a reference only.
#[test]
fn today_the_recording_and_the_live_name_are_two_works_with_no_tie_the_core_reads() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let opening = spec("the opening segment of Dario's stream");
    let recording = mor_core::hash::work_hash(b"the whole match, as recorded");
    let s = claim_alone(&mut w, &mut stranger, opening);
    let c = claim_alone(&mut w, &mut dario, recording);
    // Dario's publication of the recording, naming the live work in refs.
    let a = w.everyday_act_refs(
        &mut dario,
        mips().envelopes,
        0,
        vec![(Value::Uint(1), Value::Bytes(recording.to_vec())), (Value::Uint(2), Value::Bytes(spec("the recording, locked").to_vec()))],
        None,
        None,
        Some(vec![mor_core::act::Ref::Act(opening)]),
    );
    w.add(&a);
    let live = view(&w).work_owners(&opening).unwrap();
    let rec = view(&w).work_owners(&recording).unwrap();
    assert_eq!((live.claims, live.default_holder, live.contested), (vec![s], Some(stranger.id), false), "the stranger owns the live name, as recorded");
    assert_eq!((rec.claims, rec.default_holder, rec.contested), (vec![c], Some(dario.id), false), "Dario owns the recording; the reference to the live work changes nothing on either side");
}
