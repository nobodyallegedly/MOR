//! F295 (step 15 review, Money, M1): an act of the Money MIR whose payload
//! is not in Money's format for its type, of a type Money does not define,
//! or signed by someone other than Money names (a payee pointer not by its
//! payee, F46; an obligation not by its debtor, F66; a receipt not by the
//! payee of the hop) is invalid to a verifier that knows which
//! specification Money is, as it already was to Money's own decoder and to
//! the Agreements view. Before the fix the core verifier showed every such
//! act as valid, and only a client reading Agreements refused it.

mod common;

use common::{identity_spec, money_spec, own_home, World};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::hash::sha256;
use mor_core::money::{types, Amount, Obligation, PayeePointer, Payload, Rail};

fn rail() -> Rail {
    Rail {
        module: sha256(b"a rail Module"),
        address: b"an address".to_vec(),
    }
}

#[test]
fn a_money_act_outside_its_format_or_by_the_wrong_signer_is_invalid() {
    let mut w = World::new();
    let mut alice = w.genesis("alice", vec![own_home()], None, None);
    let mut bob = w.genesis("bob", vec![own_home()], None, None);

    // A payee pointer for Alice: valid signed by Alice, invalid signed by Bob (F46).
    let pointer = Payload::PayeePointer(PayeePointer {
        payee: alice.id,
        version: 1,
        previous: None,
        rails: vec![rail()],
    });
    let own = w.everyday_act(&mut alice, money_spec(), types::PAYEE_POINTER, pointer.to_map(), None, None);
    let own = w.add(&own);
    assert_eq!(w.v.status(&own), Status::Valid, "a pointer signed by the identity it is for");
    let forged = w.everyday_act(&mut bob, money_spec(), types::PAYEE_POINTER, pointer.to_map(), None, None);
    let forged = w.add(&forged);
    assert_eq!(w.v.status(&forged), Status::Invalid, "a pointer signed by someone else (F46)");

    // An obligation: valid signed by its debtor, invalid signed by its creditor (F66).
    let debt = Payload::Obligation(Obligation {
        debtor: bob.id,
        creditor: alice.id,
        amount: Amount {
            unit: sha256(b"sat"),
            value: 1_000,
        },
        pointer: own,
        agreement: None,
    });
    let signed = w.everyday_act(&mut bob, money_spec(), types::OBLIGATION, debt.to_map(), None, None);
    let signed = w.add(&signed);
    assert_eq!(w.v.status(&signed), Status::Valid, "an obligation signed by its debtor");
    let claimed = w.everyday_act(&mut alice, money_spec(), types::OBLIGATION, debt.to_map(), None, None);
    let claimed = w.add(&claimed);
    assert_eq!(w.v.status(&claimed), Status::Invalid, "a creditor's statement is no obligation (F66)");

    // A payload outside the format: an obligation with a key Money does not define.
    let mut extra = debt.to_map();
    extra.push((Value::Uint(9), Value::Text("a note".into())));
    let outside = w.everyday_act(&mut bob, money_spec(), types::OBLIGATION, extra, None, None);
    let outside = w.add(&outside);
    assert_eq!(w.v.status(&outside), Status::Invalid, "a key outside the format (F295)");

    // A type Money does not define.
    let undefined = w.everyday_act(&mut bob, money_spec(), 9, vec![], None, None);
    let undefined = w.add(&undefined);
    assert_eq!(w.v.status(&undefined), Status::Invalid, "a type Money does not define (F295)");

    // A verifier told only the Identity hash cannot place the act: unknown-ish
    // as before, never invalid on Money's account (it does not know Money).
    let mut blind = mor_core::chain::Verifier::new(identity_spec());
    let genesis = w.v.resolve(&bob.id).links[0].act;
    blind.add(w.v.get(&genesis).unwrap().act.clone()).unwrap();
    let again = w.v.get(&undefined).unwrap().act.clone();
    let id = blind.add(again).unwrap();
    assert_ne!(blind.status(&id), Status::Invalid, "a verifier that does not know Money judges nothing of Money's");
}
