//! Fable's hostile review of F229 (`docs/reviews/live-work-review.md`): a
//! live work named by its opening segment, a class of its own; its
//! recording a separate work naming it. Nothing of F229 is built. These
//! tests pin what the core does today where the review's questions touch
//! it, so that the build, when it comes, changes it on purpose:
//!
//! 1. the work claim checks no form of its hash: any 32 bytes bind, so a
//!    "live work" can be claimed today under the name of any act, before
//!    any content exists, and the claim is contested by a second one;
//! 2. an offer selling access names no work: a work claim on the stream's
//!    name reaches none of its sales, and a purchase following a lone
//!    seller's access offer is judged with no work in sight;
//! 3. "claimed", for a purchase, means an agreement with a stake in the
//!    hash, never a bare work claim: a lone creator's claim on the live
//!    name leaves a stranger's publication of that name a plain payment;
//! 4. a publication whose field 1 is any hash puts that hash under the
//!    purchase rules once an agreement writes a stake in it: the Agreements
//!    machinery is indifferent to what the hash fingerprints;
//! 5. the recording's hash and the live name are two works with no tie
//!    the core reads: a claim on one shows nothing on the other.
//!
//! Test identities only; the specification hashes are test values until
//! the freeze, as in the other Agreements tests.

mod common;

use common::{own_home, Person, World};
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
use mor_core::hash::{sha256, Hash};
use mor_core::agreements::{self, Field4, AgreementsView, Mips, PurchaseVerdict, Rule, Stake, Terms, Who};

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
fn lone_offer(w: &mut World, p: &mut Person, sold: agreements::Sold) -> Hash {
    let o = agreements::Offer {
        under: None,
        sold: vec![sold],
        price: Amount { unit: spec("a unit"), value: 300 },
        paid: None,
        words: None,
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
    // Dario's opening segment: an act of a live media cMIP, its id the name.
    let opening = {
        let a = w.everyday_act(&mut dario, spec("a live media cMIP"), 0, vec![(Value::Uint(0), Value::Bytes(vec![1, 2, 3]))], None, None);
        w.add(&a)
    };
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
/// while it runs): a standing offer selling access (`[2, [cmip, params]]`)
/// names no work, and its parameters are bytes the core never reads. A
/// stranger's access offer counts, and a fan's payment following it is a
/// purchase under the stranger's own terms (F215), whatever Dario has
/// claimed under the stream's name: today a work claim on a live work
/// reaches no sale of access to it.
#[test]
fn today_an_access_offer_names_no_work_so_a_claim_on_the_stream_reaches_none_of_its_sales() {
    let mut w = World::new();
    let mut dario = w.genesis("dario", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let opening = spec("the opening segment of Dario's stream");
    claim_alone(&mut w, &mut dario, opening);
    // The stranger sells access to "Dario's stream": the parameters say so,
    // in the live media cMIP's own form; the core reads none of it.
    let params = mor_core::cbor::encode(&Value::Array(vec![Value::Text("Dario's match, live".into()), Value::Bytes(opening.to_vec())]));
    let offer = lone_offer(&mut w, &mut stranger, agreements::Sold::Access(spec("a live media cMIP"), params));
    let e = view(&w).offer(&offer).unwrap();
    assert!(e.counts, "a lone seller's access offer counts: {:?}", e.problems);
    let r = receipt(&mut w, &mut stranger, fan.id, offer, None, b"the fan paid the stranger");
    let p = view(&w).purchase(&r).unwrap().expect("a payment following an offer is judged");
    assert_eq!(p.verdict, PurchaseVerdict::Purchase, "a purchase under the stranger's own terms (F215); Dario's claim is nowhere in it");
    // Dario's claim on the name is a record; it is not contested by the sale
    // and the sale is not outside it: the two never meet.
    let o = view(&w).work_owners(&opening).unwrap();
    assert!(!o.contested && o.default_holder == Some(dario.id));
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
