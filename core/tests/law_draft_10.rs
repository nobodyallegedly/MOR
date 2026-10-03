//! Law draft 10: the negotiation record of negotiation messages (F118, rule
//! 56; freeze suite v21, step 5.3), a rail Module's role-share evidence
//! (F119, rules 19 and 22; step 2.4e), and who claims an anonymous refund
//! (F113, rule 32; steps 2.6 and 2.6b). Test identities only.

mod common;

use common::{own_home, Person, World};
use mor_core::act::{Object, Scheme};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::finance::{self as fin, Amount, Anonymous, Claim, Payer, Rail, Receipt, RefundTo, VaultEntry};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::SigningKey;
use mor_core::law::{types, LawView, Mips, NegotiationMessage, Role};
use mor_core::sig::SchnorrKey;

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

fn message(text: &str) -> Vec<(Value, Value)> {
    NegotiationMessage {
        text: text.into(),
        format: None,
        follows: None,
        acks: None,
    }
    .to_map()
}

/// A negotiation message by `p`: the first of its thread when `follows` is
/// `None`, otherwise `[[thread, previous]]`; acknowledging `acks`. Held.
fn say(w: &mut World, p: &mut Person, text: &str, follows: Option<(Hash, Hash)>, acks: Option<Hash>) -> Hash {
    let objects = follows.map(|(chain, predecessor)| vec![Object { chain, predecessor }]);
    let a = w.everyday_act(p, mips().law, types::NEGOTIATION, message(text), objects, acks.map(|x| vec![x]));
    w.add(&a)
}

#[test]
fn step_5_3_a_negotiation_record_is_proven_complete_by_law_messages() {
    let mut w = World::new();
    let mut journalist = w.genesis("journalist", vec![own_home()], None, None);
    let mut buyer = w.genesis("buyer", vec![own_home()], None, None);
    let mut stranger = w.genesis("stranger", vec![own_home()], None, None);

    let m1 = say(&mut w, &mut buyer, "I would like the photographs.", None, None);
    let m2 = say(&mut w, &mut journalist, "Fifty for the set.", Some((m1, m1)), Some(m1));
    let m3 = say(&mut w, &mut buyer, "Forty.", Some((m1, m2)), Some(m2));
    let m4 = say(&mut w, &mut journalist, "Forty-five.", Some((m1, m3)), Some(m3));
    for m in [m1, m2, m3, m4] {
        assert_eq!(w.v.status(&m), Status::Valid);
    }
    let v = LawView::new(&w.v, mips());
    let r = v.negotiation(&m1).unwrap();
    assert_eq!(r.sides, vec![buyer.id, journalist.id]);
    assert_eq!(r.messages.len(), 4);
    // The journalist's m4 acknowledges m3: complete up to m3. m4 itself is
    // not yet acknowledged by the buyer.
    assert_eq!(r.complete_up_to, Some(m3));
    assert!(!r.forked);

    // The buyer slips a text reply into the thread, carrying acks: invalid
    // (F110). Without acks it is valid but no part of the record.
    let text_spec = mips().text;
    let bad = w.everyday_act(&mut buyer, text_spec, 0, vec![(Value::Uint(0), Value::Text("ok".into()))],
        Some(vec![Object { chain: m1, predecessor: m4 }]), Some(vec![m4]));
    let bad = w.add(&bad);
    assert_eq!(w.v.status(&bad), Status::Invalid);
    let reply = w.everyday_act(&mut buyer, text_spec, 0, vec![(Value::Uint(0), Value::Text("ok".into()))],
        Some(vec![Object { chain: m1, predecessor: m4 }]), None);
    let reply = w.add(&reply);
    assert_eq!(w.v.status(&reply), Status::Valid);
    // A negotiation message naming the text reply as its previous proves
    // nothing beyond it: it is no part of the record.
    let m6 = say(&mut w, &mut journalist, "Agreed, then?", Some((m1, reply)), Some(m4));
    // A third identity's message in the thread is no part of it either.
    let m7 = say(&mut w, &mut stranger, "Thirty!", Some((m1, m4)), Some(m4));
    let v = LawView::new(&w.v, mips());
    let r = v.negotiation(&m1).unwrap();
    assert!(!r.messages.contains(&reply) && !r.messages.contains(&m6) && !r.messages.contains(&m7));
    assert_eq!(r.complete_up_to, Some(m3));

    // The buyer acknowledges m4: complete up to it.
    let m5 = say(&mut w, &mut buyer, "Forty-five it is.", Some((m1, m4)), Some(m4));
    let v = LawView::new(&w.v, mips());
    let r = v.negotiation(&m1).unwrap();
    assert!(r.messages.contains(&m5));
    assert_eq!(r.complete_up_to, Some(m4));
    // m7 named m4 too, but it is no part of the record, so no fork shows.
    assert!(!r.forked);
    // The journalist answers m4 twice, from two devices: a visible fork.
    let _ = say(&mut w, &mut journalist, "Or fifty with prints.", Some((m1, m4)), Some(m3));
    let v = LawView::new(&w.v, mips());
    assert!(v.negotiation(&m1).unwrap().forked);
}

#[test]
fn negotiation_message_shapes() {
    let m = NegotiationMessage { text: "a\r\nb".into(), format: None, follows: None, acks: None };
    let mut w = World::new();
    let mut p = w.genesis("someone", vec![own_home()], None, None);
    let a = w.everyday_act(&mut p, mips().law, types::NEGOTIATION, m.to_map(), None, None);
    // Non-canonical text never even opens (Envelope, Text MIP).
    assert!(a.open(None).is_err());
    let two = w.everyday_act(&mut p, mips().law, types::NEGOTIATION, message("hi"), None, Some(vec![h("x"), h("y")]));
    assert!(NegotiationMessage::decode(&two.open(None).unwrap()).is_err(), "acks name one message");
    // The thread's first message must name no chain.
    let later = say(&mut w, &mut p, "later", Some((h("t"), h("t"))), None);
    assert!(LawView::new(&w.v, mips()).negotiation(&later).is_err());
}

fn sat(n: u64) -> Amount {
    Amount { unit: h("sat"), value: n }
}

/// The owners' payee pointer, naming these rail Modules. Held.
fn pointer(w: &mut World, p: &mut Person, rails: &[Hash]) -> Hash {
    let ptr = fin::Payload::PayeePointer(fin::PayeePointer {
        payee: p.id,
        version: 1,
        previous: None,
        rails: rails.iter().map(|m| Rail { module: *m, address: b"an address".to_vec() }).collect(),
    });
    let a = w.everyday_act(p, mips().finance, fin::types::PAYEE_POINTER, ptr.to_map(), None, None);
    w.add(&a)
}

/// A receipt the split service signs as the hop's receiver, for a payment
/// to the owners' pointer, on the rail Module `rail`. Held.
fn service_receipt(w: &mut World, service: &mut Person, rail: Hash, fulfils: Hash) -> Hash {
    let r = fin::Payload::Receipt(Receipt {
        rail,
        proof: vec![1],
        payer: Some(Payer::Identity(h("a fan"))),
        payee: service.id,
        amount: sat(100),
        fulfils,
        previous: None,
        forward: None,
        batch: None,
    });
    let a = w.everyday_act(service, mips().finance, fin::types::RECEIPT, r.to_map(), None, None);
    w.add(&a)
}

#[test]
fn step_2_4e_a_split_services_receipt_evidences_a_rail_module_the_owners_published() {
    let mut w = World::new();
    let ln = h("a Lightning rail Module");
    let ln2 = h("a second Lightning rail Module");
    let onchain = h("an on-chain rail Module");
    let vault = fin::vault_declaration(
        &mips().finance,
        &[VaultEntry { unit: h("sat"), rail_module: onchain, source: b"xpub".to_vec(), limit: 1000 }],
    );
    let mut owners = w.genesis_with("owners", vec![own_home()], None, None, Some(vec![vault]), 3);
    let mut service = w.genesis("split service", vec![own_home()], None, None);
    let mut fan = w.genesis("fan", vec![own_home()], None, None);
    let ptr = pointer(&mut w, &mut owners, &[ln]);
    let on_ln = service_receipt(&mut w, &mut service, ln, ptr);
    let on_ln2 = service_receipt(&mut w, &mut service, ln2, ptr);
    let on_chain = service_receipt(&mut w, &mut service, onchain, ptr);

    let v = LawView::new(&w.v, mips());
    let (s, o) = (service.id, owners.id);
    // The service's own receipt evidences the rail Module the owners'
    // pointer names, though the service signed it (F119).
    assert!(v.role_evidence(&on_ln, &Role::RailModule(ln), &s, &o).unwrap());
    // And one the owners' vault names.
    assert!(v.role_evidence(&on_chain, &Role::RailModule(onchain), &s, &o).unwrap());
    // A Module the owners never published: evidence of nothing.
    assert!(!v.role_evidence(&on_ln2, &Role::RailModule(ln2), &s, &o).unwrap());
    // A receipt naming another Module than the role's: nothing.
    assert!(!v.role_evidence(&on_ln, &Role::RailModule(onchain), &s, &o).unwrap());
    // For any other role, the service's own act is never evidence (F75).
    assert!(!v.role_evidence(&on_ln, &Role::Other, &s, &o).unwrap());
    let referral = w.post(&mut fan, "I sent them here");
    let v = LawView::new(&w.v, mips());
    assert!(v.role_evidence(&referral, &Role::Other, &s, &o).unwrap());

    // The owners name both Modules for the one rail: either now earns, the
    // invoice's issuer choosing (cost stated).
    let _ = pointer(&mut w, &mut owners, &[ln, ln2]);
    let v = LawView::new(&w.v, mips());
    assert!(v.role_evidence(&on_ln2, &Role::RailModule(ln2), &s, &o).unwrap());
}

#[test]
fn rule_32_an_anonymous_refund_goes_to_the_committed_key() {
    let key = SchnorrKey::from_secret(&h("the buyer's one-time key")).unwrap();
    let bare = SigningKey { scheme: Scheme::Founding(1), key: key.public().to_vec() };
    let receipt = Receipt {
        rail: h("ln"),
        proof: vec![9],
        payer: Some(Payer::Key(bare.clone())),
        payee: h("publisher"),
        amount: sat(50),
        fulfils: h("offer"),
        previous: None,
        forward: None,
        batch: None,
    };
    assert_eq!(fin::refund_owed_to(&receipt), RefundTo::Key(bare.clone()));
    let mut claim = Claim {
        rail: receipt.rail,
        proof: receipt.proof.clone(),
        payee: receipt.payee,
        amount: receipt.amount,
        fulfils: receipt.fulfils,
        disagrees: None,
        referral: None,
        refund: Some(Rail { module: h("ln"), address: b"buyer".to_vec() }),
        anonymous: None,
    };
    let signed = |c: &Claim, k: &SchnorrKey| Anonymous { key: bare.clone(), sig: k.sign(&c.anonymous_message(), &[0; 32]).sig };
    // Presenting the rail proof alone, as a routing node or the payee could:
    // no refund.
    assert!(!fin::claims_refund(&receipt, &claim, &h("a routing node")));
    let mut forged = claim.clone();
    forged.anonymous = Some(signed(&claim, &SchnorrKey::from_secret(&h("a routing node")).unwrap()));
    assert!(!fin::claims_refund(&receipt, &forged, &h("a routing node")));
    // Signed with the committed key, by any identity: the refund is theirs.
    claim.anonymous = Some(signed(&claim, &key));
    assert!(fin::claims_refund(&receipt, &claim, &h("a one-time identity")));
    // A payment that committed no key: nobody.
    let none = Receipt { payer: None, ..receipt.clone() };
    assert_eq!(fin::refund_owed_to(&none), RefundTo::Nobody);
    assert!(!fin::claims_refund(&none, &claim, &h("anyone")));
    // A named payer: only that identity.
    let named = Receipt { payer: Some(Payer::Identity(h("alice"))), ..receipt };
    let plain = Claim { anonymous: None, ..claim };
    assert!(fin::claims_refund(&named, &plain, &h("alice")));
    assert!(!fin::claims_refund(&named, &plain, &h("mallory")));
}
