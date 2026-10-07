//! Finance rules 10, 14 and 15 in Law's debt discharge, over real signed
//! acts (F145, F146, F147, F151, F154, F155; the hostile review of F133 to
//! F144, findings 1, 2, 7, 10, 16 and 17). Replaces F133's tests: the
//! pointer is no longer judged by the agreement act or the obligation
//! itself, but by the payee's own act.
//!
//! - Rule 14 (F145, F155): the flow pointer version that counts for a debt
//!   is the latest of the creditor's chain that the creditor's own act
//!   holds through its citations: its signature act on the agreement, or
//!   its offer; for an IOU, an act of its own acknowledging it. The
//!   version the debt names is informative only.
//! - Rule 15 is in `finance_rule_15.rs` (F169, F176 to F181: theft,
//!   anchor or bear the loss), which replaces the tests of F139, F146,
//!   F147's reading together and F160 that were here.
//! - Rule 10 (F151): where the rail binds no payee or purpose, the payer's
//!   claim decides what the payment fulfils.
//!
//! Test identities only.

mod common;

use common::{own_home, Person, World};
use mor_core::act::{Object, Ref};
use mor_core::chain::Status;
use mor_core::finance::{self as fin, Amount, Claim, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt};
use mor_core::hash::{sha256, Hash};
use mor_core::law::{self, Disagreement, LawView, Mips};
use std::collections::{BTreeMap, BTreeSet};

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: common::identity_spec(),
        envelope: t("ENVELOPE"),
        text: t("TEXT"),
        finance: common::finance_spec(),
        law: common::law_spec(),
        production: t("PRODUCTION"),
    }
}

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn unit() -> Hash {
    h("a unit")
}

fn rail() -> Hash {
    h("a rail Module")
}

fn amount(value: u64) -> Amount {
    Amount { unit: unit(), value }
}

/// A world, and what its verifier's caller states: the rail's answers,
/// anchors, and the rails binding no payee or purpose.
struct Lab {
    w: World,
    rail_valid: BTreeMap<Hash, PaidAt>,
    unbound: BTreeSet<Hash>,
}

impl Lab {
    fn new() -> Self {
        Lab { w: World::new(), rail_valid: BTreeMap::new(), unbound: BTreeSet::new() }
    }

    fn view(&self) -> LawView<'_> {
        let mut v = LawView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.unbound_rails = self.unbound.clone();
        v
    }

    fn person(&mut self, name: &str) -> Person {
        self.w.genesis(name, vec![own_home()], None, None)
    }

    fn act(&mut self, p: &mut Person, spec: Hash, t: u64, payload: Vec<(mor_core::cbor::Value, mor_core::cbor::Value)>, objects: Option<Vec<Object>>, acks: Option<Vec<Hash>>, refs: Option<Vec<Ref>>) -> Hash {
        let a = self.w.everyday_act_refs(p, spec, t, payload, objects, acks, refs);
        self.w.add(&a)
    }

    /// A flow pointer of `p`'s identity, signed with its signing key (by
    /// the owner, or by a thief holding a copy of it).
    fn pointer(&mut self, p: &mut Person, payee: Hash, version: u64, previous: Option<Hash>, node: &str) -> Hash {
        let x = Payload::PayeePointer(PayeePointer {
            payee,
            version,
            previous,
            rails: vec![Rail { module: rail(), address: node.as_bytes().to_vec() }],
        });
        self.act(p, mips().finance, fin::types::PAYEE_POINTER, x.to_map(), None, None, None)
    }

    /// Terms (Law type 0) drafted by `by`, citing `refs`: only what they
    /// cite matters here.
    fn terms(&mut self, by: &mut Person, refs: Vec<Hash>) -> Hash {
        let refs = (!refs.is_empty()).then(|| refs.into_iter().map(Ref::Act).collect());
        self.act(by, mips().law, law::types::TERMS, vec![], None, None, refs)
    }

    /// `p`'s signature act (Law type 1) on `terms`.
    fn sign(&mut self, p: &mut Person, terms: Hash) -> Hash {
        let o = Some(vec![Object { chain: terms, predecessor: terms }]);
        self.act(p, mips().law, law::types::SIGNATURE, law::signature_payload(&terms), o, None, None)
    }

    /// `p`'s signature act (Law type 1) on `terms`, citing `refs` in
    /// `refs`, as a conforming client cites the payee's latest pointer
    /// (F163).
    fn sign_citing(&mut self, p: &mut Person, terms: Hash, refs: Vec<Hash>) -> Hash {
        let o = Some(vec![Object { chain: terms, predecessor: terms }]);
        let refs = Some(refs.into_iter().map(Ref::Act).collect());
        self.act(p, mips().law, law::types::SIGNATURE, law::signature_payload(&terms), o, None, refs)
    }

    /// An obligation signed by its debtor, naming `named` in field 3.
    fn debt(&mut self, debtor: &mut Person, creditor: Hash, value: u64, named: Hash, agreement: Option<Hash>, refs: Vec<Hash>) -> Hash {
        let o = Payload::Obligation(Obligation { debtor: debtor.id, creditor, amount: amount(value), pointer: named, agreement });
        let refs = (!refs.is_empty()).then(|| refs.into_iter().map(Ref::Act).collect());
        self.act(debtor, mips().finance, fin::types::OBLIGATION, o.to_map(), None, None, refs)
    }

    /// The payer's claim (type 3) toward `fulfils`, its rail answer stated
    /// valid, paid at `at`; citing `refs`.
    #[allow(clippy::too_many_arguments)]
    fn claim(&mut self, payer: &mut Person, payee: Hash, fulfils: Hash, value: u64, proof: &str, at: PaidAt, refs: Vec<Hash>) -> Hash {
        let c = claim_payload(payee, fulfils, value, proof);
        let refs = (!refs.is_empty()).then(|| refs.into_iter().map(Ref::Act).collect());
        let id = self.act(payer, mips().finance, fin::types::CLAIM, Payload::Claim(c).to_map(), None, None, refs);
        self.rail_valid.insert(id, at);
        id
    }

    /// The payee's receipt (type 2) toward `fulfils`, its rail answer
    /// stated valid where `at` is given.
    fn receipt(&mut self, payee: &mut Person, payer: Hash, fulfils: Hash, value: u64, proof: &str, at: Option<PaidAt>) -> Hash {
        let r = Payload::Receipt(Receipt {
            rail: rail(),
            proof: proof.as_bytes().to_vec(),
            payer: Some(Payer::Identity(payer)),
            payee: payee.id,
            amount: amount(value),
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let id = self.act(payee, mips().finance, fin::types::RECEIPT, r.to_map(), None, None, None);
        if let Some(at) = at {
            self.rail_valid.insert(id, at);
        }
        id
    }

    fn paid(&self, debt: &Hash) -> u64 {
        self.view().paid_toward(debt)
    }
}

fn claim_payload(payee: Hash, fulfils: Hash, value: u64, proof: &str) -> Claim {
    Claim {
        rail: rail(),
        proof: proof.as_bytes().to_vec(),
        payee,
        amount: amount(value),
        fulfils,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: None,
    }
}

// ---------------------------------------------------------------- rule 14: the payee's own act (F145, F155)

/// F145 and F155 (review findings 1, 16, 17): an owner's flow pointers
/// version 1 and 2; a thief, with the stolen signing key, adds version 3,
/// its own wallet. The owner signs a deal its debtor drafted, the owner's
/// signature act holding versions 1 and 2. The version that counts for
/// every debt under the deal is 2, whatever the debt names:
///
/// - a debt naming version 1 (F155: informative), paid to version 2's
///   flow, counts, and paid to version 1, an older wallet, counts too
///   (`named >= paid`); F133 refused the first;
/// - a debt the debtor signs naming the thief's version 3 counts on
///   version 3's flow for nothing, only through the vault;
/// - terms the debtor drafts citing the thief's version 3, which the
///   owner never signs, give nothing: no act of the owner's holds a
///   pointer. F133 counted it, its agreement act citing version 3.
#[test]
fn the_pointer_is_judged_by_the_payees_own_signature_act() {
    let mut l = Lab::new();
    let mut owner = l.person("owner");
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's first node");
    let v2 = l.pointer(&mut owner, oid, 2, Some(v1), "the owner's second node");
    // The theft: version 3 names the owner's version 2.
    let mut thief = owner.clone();
    let v3 = l.pointer(&mut thief, oid, 3, Some(v2), "the thief's node");
    assert_eq!(l.w.v.status(&v3), Status::Valid, "the theft window: no rotation yet");

    // The deal the debtor drafted, citing nothing of the owner's; the
    // owner's signature act holds versions 1 and 2, never version 3.
    let deal = l.terms(&mut debtor, vec![]);
    l.sign(&mut debtor, deal);
    l.sign(&mut owner, deal);
    let holding = l.view().pointer_holding(&deal, &oid).unwrap();
    assert!(holding.complete);
    assert_eq!(BTreeSet::from_iter(holding.pointers), BTreeSet::from([v1, v2]));

    // A debt naming version 1: read as naming version 2 (F155).
    let d1 = l.debt(&mut debtor, oid, 40, v1, Some(deal), vec![]);
    l.claim(&mut debtor, oid, d1, 40, "d1 to v2", PaidAt::Flow(v2), vec![]);
    assert_eq!(l.paid(&d1), 40, "the selected version, 2, counts whatever the debt names");
    let d1b = l.debt(&mut debtor, oid, 40, v1, Some(deal), vec![]);
    l.claim(&mut debtor, oid, d1b, 40, "d1b to v1", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&d1b), 40, "an older wallet of the payee's still counts (F155)");

    // The debtor re-signs the debt to name the thief's version 3.
    let d2 = l.debt(&mut debtor, oid, 40, v3, Some(deal), vec![v3]);
    l.claim(&mut debtor, oid, d2, 40, "d2 to v3", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&d2), 0, "the owner's own act never held version 3");
    l.claim(&mut debtor, oid, d2, 40, "d2 to the vault", PaidAt::VaultEntry(oid, 0), vec![]);
    assert_eq!(l.paid(&d2), 40, "paid to the vault, it counts");

    // Terms the debtor drafts citing version 3, which the owner never
    // signs: the debt under them counts only through the vault.
    let drafted = l.terms(&mut debtor, vec![v3]);
    l.sign(&mut debtor, drafted);
    let holding = l.view().pointer_holding(&drafted, &oid).unwrap();
    assert!(holding.pointers.is_empty());
    let d3 = l.debt(&mut debtor, oid, 40, v3, Some(drafted), vec![]);
    l.claim(&mut debtor, oid, d3, 40, "d3 to v3", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&d3), 0, "the drafter's citations choose nothing");
}

/// F157 (flaw 1 of the build of F145 to F156, decided by Nobody,
/// allegedly): for selecting the payee's pointer, the walk passes only
/// through the payee's own acts, never through an act another identity
/// signed. A signature act must cite the terms it signs (Law, type 1), so
/// before F157 the owner's signature on terms its debtor drafted to cite
/// the thief's version 3 held version 3 through the terms, and a debt
/// under them counted on the thief's flow; an act of the owner's
/// acknowledging an IOU held everything the IOU's debtor ever cited. Now
/// neither reaches it: review finding 1's first story is closed.
#[test]
fn the_payees_pointer_is_found_through_its_own_acts_only() {
    let mut l = Lab::new();
    let mut owner = l.person("owner");
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's first node");
    let v2 = l.pointer(&mut owner, oid, 2, Some(v1), "the owner's second node");
    let mut thief = owner.clone();
    let v3 = l.pointer(&mut thief, oid, 3, Some(v2), "the thief's node");
    let drafted = l.terms(&mut debtor, vec![v3]);
    l.sign(&mut debtor, drafted);
    l.sign(&mut owner, drafted);
    let holding = l.view().pointer_holding(&drafted, &oid).unwrap();
    assert!(holding.complete);
    assert_eq!(BTreeSet::from_iter(holding.pointers), BTreeSet::from([v1, v2]), "never through the drafter's terms");
    let d = l.debt(&mut debtor, oid, 900, v3, Some(drafted), vec![]);
    l.claim(&mut debtor, oid, d, 900, "to the thief", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&d), 0, "the thief collects nothing through the drafter's citation");
    l.claim(&mut debtor, oid, d, 900, "to the owner", PaidAt::Flow(v2), vec![]);
    assert_eq!(l.paid(&d), 900, "the owner's own latest pointer counts");
    // The same through an IOU: the owner acknowledges a debtor's IOU; the
    // IOU's `prev` leads to the debtor's terms citing version 3, which the
    // walk no longer enters.
    let iou = l.debt(&mut debtor, oid, 30, v1, None, vec![]);
    l.act(&mut owner, mips().law, law::types::NEGOTIATION, vec![], None, Some(vec![iou]), None);
    let holding = l.view().pointer_holding(&iou, &oid).unwrap();
    assert!(!holding.pointers.contains(&v3), "never through the debtor's history");
    l.claim(&mut debtor, oid, iou, 30, "iou to the thief", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&iou), 0);
}

/// F145 (review finding 1, the IOU story): an obligation naming no
/// agreement act (field 4 absent), such as an IOU or a refund its debtor
/// signs alone, counts only if paid to the vault, until the creditor
/// acknowledges it with an act of its own that holds a pointer; whatever
/// pointer the IOU itself cites or names. F133 counted an IOU citing the
/// pointer it names.
#[test]
fn an_iou_counts_only_to_the_vault_until_the_creditor_acknowledges_it() {
    let mut l = Lab::new();
    let mut creditor = l.person("a payer owed a refund");
    let mut debtor = l.person("a payee who owes it");
    let cid = creditor.id;
    let v1 = l.pointer(&mut creditor, cid, 1, None, "the creditor's first node");
    let v2 = l.pointer(&mut creditor, cid, 2, Some(v1), "the creditor's second node");
    let mut thief = creditor.clone();
    let v3 = l.pointer(&mut thief, cid, 3, Some(v2), "the thief's node");

    // The refund IOU cites and names the thief's version 3, and is paid
    // there: nothing.
    let iou = l.debt(&mut debtor, cid, 50, v3, None, vec![v3]);
    assert_eq!(l.view().pointer_holding(&iou, &cid).unwrap(), fin::Holding { pointers: vec![], complete: true });
    l.claim(&mut debtor, cid, iou, 50, "iou to v3", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&iou), 0, "no act of the creditor's: only the vault");

    // An honest IOU citing the creditor's version 1: still only the vault.
    let old = l.debt(&mut debtor, cid, 50, v1, None, vec![v1]);
    l.claim(&mut debtor, cid, old, 50, "old to v1", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&old), 0, "an IOU's own citations choose nothing");
    l.claim(&mut debtor, cid, old, 50, "old to the vault", PaidAt::VaultEntry(cid, 0), vec![]);
    assert_eq!(l.paid(&old), 50);

    // The creditor acknowledges an IOU of a second debtor, whose own
    // history cites nothing of the creditor's, with an act of its own,
    // which holds its versions 1 and 2: version 2 counts, and the older 1.
    // (Acknowledging an act of the first debtor, whose earlier IOU cites
    // version 3, holds no more: the walk passes only through the
    // creditor's own acts, F157.)
    let mut friend = l.person("a second debtor");
    let acked = l.debt(&mut friend, cid, 30, v1, None, vec![]);
    let ack = l.act(&mut creditor, mips().law, law::types::NEGOTIATION, vec![], None, Some(vec![acked]), None);
    assert_eq!(l.w.v.status(&ack), Status::Valid);
    let holding = l.view().pointer_holding(&acked, &cid).unwrap();
    assert_eq!(BTreeSet::from_iter(holding.pointers), BTreeSet::from([v1, v2]));
    l.claim(&mut friend, cid, acked, 10, "acked to v2", PaidAt::Flow(v2), vec![]);
    l.claim(&mut friend, cid, acked, 20, "acked to v1", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&acked), 30);
    // Never the thief's version 3, newer than any the creditor's act holds.
    let acked3 = l.debt(&mut friend, cid, 30, v3, None, vec![]);
    l.act(&mut creditor, mips().law, law::types::NEGOTIATION, vec![], None, Some(vec![acked3]), None);
    l.claim(&mut friend, cid, acked3, 30, "acked3 to v3", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&acked3), 0);
}

/// F145, an offer: the offer the creditor signed is its own act; one
/// signed by another is not, and gives nothing.
#[test]
fn an_offer_is_the_payees_own_act_only_when_the_payee_signed_it() {
    let mut l = Lab::new();
    let mut seller = l.person("a seller");
    let mut buyer = l.person("a buyer");
    let sid = seller.id;
    let v1 = l.pointer(&mut seller, sid, 1, None, "the seller's node");
    let offer = l.act(&mut seller, mips().law, law::types::STANDING_OFFER, vec![], None, None, None);
    let d = l.debt(&mut buyer, sid, 5, v1, Some(offer), vec![]);
    l.claim(&mut buyer, sid, d, 5, "to v1", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&d), 5);
    let not_hers = l.act(&mut buyer, mips().law, law::types::STANDING_OFFER, vec![], None, None, Some(vec![Ref::Act(v1)]));
    assert_eq!(l.view().pointer_holding(&not_hers, &sid).unwrap().pointers, Vec::<Hash>::new());
    let d2 = l.debt(&mut buyer, sid, 5, v1, Some(not_hers), vec![]);
    l.claim(&mut buyer, sid, d2, 5, "d2 to v1", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&d2), 0);
}

// ---------------------------------------------------------------- rule 14: two devices (F163), offers (F168, 13)

/// F163 (review of F145 to F162, finding 2, a common case): an identity
/// keeps one sequence per device. Ana publishes her wallet from her laptop
/// and signs a film deal from her phone. The walk through her own acts
/// follows the phone's line only, so a signature citing nothing holds no
/// pointer, and the royalties can go only to the vault. Her client, signing
/// what can pay her, cites in `refs` the latest of her pointers it finds
/// where they are published, whichever device published it (client
/// conformance): then the laptop's wallet counts. Verifiers are unchanged.
#[test]
fn a_deal_signed_on_the_phone_finds_the_wallet_published_on_the_laptop() {
    let mut l = Lab::new();
    let mut laptop = l.person("Ana");
    let mut phone = laptop.clone();
    phone.seq.clear();
    let mut label = l.person("a label");
    let aid = laptop.id;
    let v1 = l.pointer(&mut laptop, aid, 1, None, "Ana's wallet, set up on the laptop");
    assert_eq!(l.w.v.status(&v1), Status::Valid);

    // Without the citation: the phone's line holds no pointer.
    let deal = l.terms(&mut label, vec![]);
    l.sign(&mut label, deal);
    let bare = l.sign(&mut phone, deal);
    assert_eq!(l.w.v.status(&bare), Status::Valid, "a second device's sequence");
    assert_eq!(l.view().pointer_holding(&deal, &aid).unwrap().pointers, Vec::<Hash>::new());
    let d = l.debt(&mut label, aid, 300, v1, Some(deal), vec![]);
    l.claim(&mut label, aid, d, 300, "royalty, uncited", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&d), 0, "nothing of Ana's on the phone holds the laptop's wallet: only the vault");

    // A conforming client cites the latest pointer when signing.
    let film = l.terms(&mut label, vec![]);
    l.sign(&mut label, film);
    l.sign_citing(&mut phone, film, vec![v1]);
    assert_eq!(l.view().pointer_holding(&film, &aid).unwrap().pointers, vec![v1]);
    let d = l.debt(&mut label, aid, 300, v1, Some(film), vec![]);
    l.claim(&mut label, aid, d, 300, "royalty, cited", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&d), 300, "the laptop's wallet counts for the deal signed on the phone");
}

/// F168 (13): an offer is the payee's own act only if the payee signed
/// it. A buyer's bounty ("I pay 100 for a remix") is the buyer's act; the
/// payee's act is its signature accepting it, and the pointer that
/// signature holds counts. Before F168, an offer another identity signed
/// gave the payee no act at all, and payment under it went to the vault.
#[test]
fn a_payee_accepting_anothers_offer_is_paid_by_what_its_acceptance_holds() {
    let mut l = Lab::new();
    let mut remixer = l.person("a remixer");
    let mut buyer = l.person("a buyer posting a bounty");
    let rid = remixer.id;
    let v1 = l.pointer(&mut remixer, rid, 1, None, "the remixer's node");
    let bounty = l.act(&mut buyer, mips().law, law::types::STANDING_OFFER, vec![], None, None, Some(vec![Ref::Act(v1)]));
    assert!(l.view().pointer_holding(&bounty, &rid).unwrap().pointers.is_empty(), "the buyer's citation chooses nothing");
    l.sign_citing(&mut remixer, bounty, vec![v1]);
    assert_eq!(l.view().pointer_holding(&bounty, &rid).unwrap().pointers, vec![v1]);
    let d = l.debt(&mut buyer, rid, 100, v1, Some(bounty), vec![]);
    l.claim(&mut buyer, rid, d, 100, "the bounty", PaidAt::Flow(v1), vec![]);
    assert_eq!(l.paid(&d), 100);
}

// ---------------------------------------------------------------- rule 10: who decides the purpose (F151)

/// F151 (review finding 7): on a rail binding no payee or purpose, the
/// debtor pays 500 toward a debt and claims it; the creditor signs a
/// receipt for the same proof calling it a tip. The payer's claim decides:
/// the debt is paid, and the receipt stays shown as a dispute on the
/// receiver. Under F141 neither counted, and the creditor held a veto. On
/// a rail binding both, the commitment decides: the act carrying the
/// rail's valid answer counts.
#[test]
fn the_payers_claim_decides_the_purpose_where_the_rail_binds_none() {
    let mut l = Lab::new();
    let mut creditor = l.person("a creditor");
    let mut debtor = l.person("a debtor");
    let cid = creditor.id;
    let tip_pointer = l.pointer(&mut creditor, cid, 1, None, "the creditor's node");
    let d = l.debt(&mut debtor, cid, 500, tip_pointer, None, vec![]);
    let at = PaidAt::VaultEntry(cid, 0);
    l.unbound.insert(rail());
    let c = l.claim(&mut debtor, cid, d, 500, "500", at, vec![]);
    let r = l.receipt(&mut creditor, debtor.id, tip_pointer, 500, "500", Some(at));
    assert_eq!(l.paid(&d), 500, "the payer's claim decides");
    assert!(l.view().disagreements(&cid).contains(&Disagreement::Differs {
        claim: c,
        receipt: r,
        claimed: amount(500),
        receipted: amount(500),
        payee: false,
        fulfils: true,
    }));
    // The receiver's receipt naming another debt counts nothing toward it.
    let other = l.debt(&mut debtor, cid, 300, tip_pointer, None, vec![]);
    l.claim(&mut debtor, cid, d, 300, "300", at, vec![]);
    l.receipt(&mut creditor, debtor.id, other, 300, "300", Some(at));
    assert_eq!(l.paid(&other), 0, "renamed by the receiver: nothing");
    assert_eq!(l.paid(&d), 800);

    // On a rail binding both (the payment cMIP draft 2), the commitment
    // decides: the claim carries the rail's valid answer, the receiver's
    // contrary receipt does not, and the debt is paid.
    l.unbound.clear();
    let d3 = l.debt(&mut debtor, cid, 100, tip_pointer, None, vec![]);
    l.claim(&mut debtor, cid, d3, 100, "100", at, vec![]);
    l.receipt(&mut creditor, debtor.id, tip_pointer, 100, "100", None);
    assert_eq!(l.paid(&d3), 100, "the commitment decides (F141)");
    // Both answered valid, which a binding rail cannot give: neither.
    let d4 = l.debt(&mut debtor, cid, 100, tip_pointer, None, vec![]);
    l.claim(&mut debtor, cid, d4, 100, "100 again", at, vec![]);
    l.receipt(&mut creditor, debtor.id, tip_pointer, 100, "100 again", Some(at));
    assert_eq!(l.paid(&d4), 0);
}
