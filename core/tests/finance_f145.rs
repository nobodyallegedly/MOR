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
//! - Rule 15 (F139, F146, F147, F154): a payment to a pointer a later
//!   rotation invalidated counts as made where a payer's claim for it does
//!   not hold the rotation, or is anchored before it.
//! - Rule 10 (F151): where the rail binds no payee or purpose, the payer's
//!   claim decides what the payment fulfils.
//!
//! Test identities only.

mod common;

use common::{own_home, Person, Rot, World};
use mor_core::act::{Object, Ref};
use mor_core::chain::Status;
use mor_core::finance::{self as fin, Amount, Anonymous, Claim, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::SigningKey;
use mor_core::law::{self, Disagreement, LawView, Mips};
use mor_core::sig::SchnorrKey;
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
    anchored_before: BTreeMap<(Hash, Hash), bool>,
    unbound: BTreeSet<Hash>,
}

impl Lab {
    fn new() -> Self {
        Lab { w: World::new(), rail_valid: BTreeMap::new(), anchored_before: BTreeMap::new(), unbound: BTreeSet::new() }
    }

    fn view(&self) -> LawView<'_> {
        let mut v = LawView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.anchored_before = self.anchored_before.clone();
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
    l.claim(&mut debtor, oid, d2, 40, "d2 to the vault", PaidAt::Vault(oid), vec![]);
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

/// FLAW, open for Nobody, allegedly (found building F145): "holds" is
/// transitive through every citation (F155), and a signature act must cite
/// the terms it signs (Law, type 1: `objects` `[[signed, signed]]`). So the
/// owner's signature act on terms its debtor drafted to cite the thief's
/// version 3 holds version 3, through the terms, and a debt under them
/// counts on the thief's flow: review finding 1's first story, as the text
/// now reads. Likewise an act of the owner's acknowledging an IOU holds
/// everything the IOU's debtor ever cited, through the IOU's `prev`. Built
/// as the text says; this test pins that reading so a decision changes it
/// visibly.
#[test]
fn flaw_the_payees_signature_holds_what_the_drafters_terms_cite() {
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
    assert!(holding.pointers.contains(&v3), "held through the terms the signature cites");
    let d = l.debt(&mut debtor, oid, 900, v3, Some(drafted), vec![]);
    l.claim(&mut debtor, oid, d, 900, "to the thief", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&d), 900, "the flaw: the thief collects through the drafter's citation");
    // The same through an IOU: the owner acknowledges a debtor's IOU; the
    // acknowledgement holds the IOU, and through its `prev` the debtor's
    // whole history, which cites version 3.
    let iou = l.debt(&mut debtor, oid, 30, v1, None, vec![]);
    l.act(&mut owner, mips().law, law::types::NEGOTIATION, vec![], None, Some(vec![iou]), None);
    assert!(l.view().pointer_holding(&iou, &oid).unwrap().pointers.contains(&v3));
    l.claim(&mut debtor, oid, iou, 30, "iou to the thief", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&iou), 30, "the flaw, through an acknowledgement");
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
    l.claim(&mut debtor, cid, old, 50, "old to the vault", PaidAt::Vault(cid), vec![]);
    assert_eq!(l.paid(&old), 50);

    // The creditor acknowledges an IOU of a second debtor, whose own
    // history cites nothing of the creditor's, with an act of its own,
    // which holds its versions 1 and 2: version 2 counts, and the older 1.
    // (Acknowledging an act of the first debtor, whose earlier IOU cites
    // version 3, would hold version 3 too: see the flaw test below.)
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

// ---------------------------------------------------------------- rule 15: good faith after a rotation

/// The good-faith story: the owner's device synced the thief's version 3
/// and built on it, so the owner's signature act on a deal holds it; the
/// owner then rotates, keeping its own acts and disowning version 3. The
/// debtor paid version 3, the published pointer, before the rotation.
struct Rotated {
    l: Lab,
    debtor: Person,
    oid: Hash,
    deal: Hash,
    v3: Hash,
    rotation: Hash,
}

fn rotated() -> Rotated {
    let mut l = Lab::new();
    let mut owner = l.person("owner");
    let mut debtor = l.person("debtor");
    let oid = owner.id;
    let v1 = l.pointer(&mut owner, oid, 1, None, "the owner's first node");
    let v2 = l.pointer(&mut owner, oid, 2, Some(v1), "the owner's second node");
    let mut thief = owner.clone();
    let v3 = l.pointer(&mut thief, oid, 3, Some(v2), "the thief's node");
    // The owner's device syncs version 3 and builds on it.
    owner.seq.push(v3);
    let deal = l.terms(&mut debtor, vec![]);
    l.sign(&mut debtor, deal);
    l.sign(&mut owner, deal);
    let (rotation, owner) = l.w.rotate(&owner, Rot { disowned: Some(vec![v3]), ..Default::default() });
    assert_eq!(l.w.v.status(&v3), Status::Void);
    assert_eq!(l.w.v.judged_by(&v3), Some(rotation));
    // After it, the owner publishes its own version 3: the chain the payer
    // saw had no fork.
    let mut owner = owner;
    l.pointer(&mut owner, oid, 3, Some(v2), "the owner's new node");
    Rotated { l, debtor, oid, deal, v3, rotation }
}

/// Rule 15 (F139, F147; review finding 1, second story): a payment to the
/// pointer a later rotation invalidated counts as made where the payer's
/// claim does not hold that rotation. The honest payer's client wrote a
/// second claim later, citing the rotation: read together, the payment
/// still counts. A payment whose only claim cites the rotation does not.
/// Before F139 was built, nothing paid to a voided pointer counted.
#[test]
fn good_faith_after_a_rotation_reads_the_payers_claims_together() {
    let Rotated { mut l, mut debtor, oid, deal, v3, rotation } = rotated();
    let d = l.debt(&mut debtor, oid, 70, v3, Some(deal), vec![]);
    l.claim(&mut debtor, oid, d, 70, "paid before the rotation", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&d), 70, "the claim does not hold the rotation");
    // The second claim, written a week later, holds the rotation.
    l.claim(&mut debtor, oid, d, 70, "paid before the rotation", PaidAt::Flow(v3), vec![rotation]);
    assert_eq!(l.view().payers_claims(b"paid before the rotation", &rotation).len(), 2);
    assert_eq!(l.paid(&d), 70, "any claim meeting the proviso is enough (F147)");
    // Another payment, its only claim holding the rotation: not made.
    let d2 = l.debt(&mut debtor, oid, 70, v3, Some(deal), vec![]);
    l.claim(&mut debtor, oid, d2, 70, "paid after seeing the rotation", PaidAt::Flow(v3), vec![rotation]);
    assert_eq!(l.paid(&d2), 0);
}

/// Rule 15 (F146): where both the claim and the rotation are anchored,
/// the anchor order decides instead of what the claim holds.
#[test]
fn where_both_are_anchored_the_anchor_order_decides() {
    let Rotated { mut l, mut debtor, oid, deal, v3, rotation } = rotated();
    let d = l.debt(&mut debtor, oid, 70, v3, Some(deal), vec![]);
    let c = l.claim(&mut debtor, oid, d, 70, "p1", PaidAt::Flow(v3), vec![]);
    assert_eq!(l.paid(&d), 70);
    l.anchored_before.insert((c, rotation), false);
    assert_eq!(l.paid(&d), 0, "anchored after the rotation: not in good faith");
    let d2 = l.debt(&mut debtor, oid, 70, v3, Some(deal), vec![]);
    let c2 = l.claim(&mut debtor, oid, d2, 70, "p2", PaidAt::Flow(v3), vec![rotation]);
    assert_eq!(l.paid(&d2), 0);
    l.anchored_before.insert((c2, rotation), true);
    assert_eq!(l.paid(&d2), 70, "anchored before the rotation: it counts, whatever it cites");
}

/// The anonymous payer's claim (F113) carried by `carrier`, signed by
/// `key` over its own citations `refs`.
fn anonymous_claim(l: &mut Lab, carrier: &mut Person, key: &SchnorrKey, payee: Hash, fulfils: Hash, proof: &str, refs: Vec<Hash>, sign_refs: Vec<Hash>) -> Hash {
    let mut c = claim_payload(payee, fulfils, 70, proof);
    let signed = fin::Citations { objects: None, acks: None, refs: (!sign_refs.is_empty()).then(|| sign_refs.into_iter().map(Ref::Act).collect()) };
    c.anonymous = Some(Anonymous {
        key: SigningKey { scheme: mor_core::act::Scheme::Founding(1), key: key.public().to_vec() },
        sig: key.sign(&c.anonymous_message(&signed), &[0; 32]).sig,
    });
    let refs = (!refs.is_empty()).then(|| refs.into_iter().map(Ref::Act).collect());
    let id = l.act(carrier, mips().finance, fin::types::CLAIM, Payload::Claim(c).to_map(), None, None, refs);
    l.rail_valid.insert(id, PaidAt::Flow(h("unused")));
    id
}

/// F147 (review finding 2): an anonymous payer's claim is judged by the
/// citations its key signed, never by the `prev` of whoever carried it;
/// and nobody can re-wrap it with other citations to turn its good faith
/// on or off: a re-wrapped claim's key 8 fails, and it is no claim.
#[test]
fn an_anonymous_claims_history_is_only_what_its_key_signed() {
    let Rotated { mut l, mut debtor, oid, deal, v3, rotation } = rotated();
    let key = SchnorrKey::from_secret(&h("the payer's one-time key")).unwrap();
    // The one-time identity carrying the claim saw the rotation before
    // (its previous act cites it): that is the carrier's, not the payer's.
    let mut carrier = l.person("a one-time identity");
    l.act(&mut carrier, mips().law, law::types::NEGOTIATION, vec![], None, None, Some(vec![Ref::Act(rotation)]));
    let d = l.debt(&mut debtor, oid, 70, v3, Some(deal), vec![]);
    let c = anonymous_claim(&mut l, &mut carrier, &key, oid, d, "anonymous, before", vec![], vec![]);
    l.rail_valid.insert(c, PaidAt::Flow(v3));
    assert_eq!(l.paid(&d), 70, "its covered citations do not hold the rotation");
    // The owner, who would rather not owe, re-wraps the payload and key 8
    // in an act citing the rotation: no claim at all.
    let mut owner2 = l.person("a sock puppet");
    let x = l.w.v.get(&c).unwrap().inside.payload.clone();
    let wrapped = l.act(&mut owner2, mips().finance, fin::types::CLAIM, x, None, None, Some(vec![Ref::Act(rotation)]));
    l.rail_valid.insert(wrapped, PaidAt::Flow(v3));
    assert_eq!(l.view().payers_claims(b"anonymous, before", &rotation).len(), 1, "the re-wrapped act is no claim");
    assert_eq!(l.paid(&d), 70);

    // The reverse: a payer whose only claim cites the rotation (signed
    // over it); a thief strips the citation by re-wrapping: still no claim.
    let d2 = l.debt(&mut debtor, oid, 70, v3, Some(deal), vec![]);
    let mut carrier2 = l.person("another one-time identity");
    let c2 = anonymous_claim(&mut l, &mut carrier2, &key, oid, d2, "anonymous, after", vec![rotation], vec![rotation]);
    l.rail_valid.insert(c2, PaidAt::Flow(v3));
    assert_eq!(l.paid(&d2), 0, "its signed citations hold the rotation");
    let x = l.w.v.get(&c2).unwrap().inside.payload.clone();
    let mut thief = l.person("the thief's one-time identity");
    let stripped = l.act(&mut thief, mips().finance, fin::types::CLAIM, x, None, None, None);
    l.rail_valid.insert(stripped, PaidAt::Flow(v3));
    assert_eq!(l.paid(&d2), 0, "stripped of its citations, key 8 fails: it counts for nothing");
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
    let at = PaidAt::Vault(cid);
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
