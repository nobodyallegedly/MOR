//! The Finance MIP's formats, the pointer that counts (rule 12), and where a
//! payment may go under the vault (rules 14a and 16).

use mor_core::cbor::{self, Value};
use mor_core::finance::*;
use mor_core::hash::{sha256, Hash};

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn sat(n: u64) -> Amount {
    Amount {
        unit: h("sat"),
        value: n,
    }
}

fn rail(m: &str) -> Rail {
    Rail {
        module: h(m),
        address: m.as_bytes().to_vec(),
    }
}

fn roundtrip(p: Payload) {
    let map = p.to_map();
    // Through the encoder and back, as an inside carries it.
    let bytes = cbor::encode(&Value::Map(map));
    let Value::Map(m) = cbor::decode(&bytes).unwrap() else {
        panic!()
    };
    assert_eq!(Payload::decode(p.type_(), &m).unwrap(), p);
}

#[test]
fn every_payload_round_trips() {
    roundtrip(Payload::PayeePointer(PayeePointer {
        payee: h("bob"),
        version: 2,
        previous: Some(h("pointer 1")),
        rails: vec![rail("ln"), rail("chain")],
    }));
    roundtrip(Payload::Obligation(Obligation {
        debtor: h("alice"),
        creditor: h("bob"),
        amount: sat(5),
        pointer: h("pointer 1"),
        agreement: Some(h("deal")),
    }));
    roundtrip(Payload::Receipt(Receipt {
        rail: h("ln"),
        proof: vec![1, 2, 3],
        payer: None,
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("pointer 1"),
        previous: Some(h("hop 1")),
        forward: Some(Forward {
            next_payee: h("carol"),
            amount: sat(4),
            agreement: h("conversion offer"),
        }),
        batch: Some(h("batch")),
    }));
    roundtrip(Payload::Claim(Claim {
        rail: h("ln"),
        proof: vec![4],
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("pointer 1"),
        disagrees: Some(h("receipt")),
        referral: Some(Referral {
            identity: h("dana"),
            evidence: h("repost"),
        }),
        refund: Some(rail("ln")),
    }));
}

#[test]
fn shapes_are_strict() {
    let good = Payload::PayeePointer(PayeePointer {
        payee: h("bob"),
        version: 1,
        previous: None,
        rails: vec![rail("ln")],
    })
    .to_map();
    // An unknown key.
    let mut m = good.clone();
    m.push((Value::Uint(9), Value::Null));
    assert!(Payload::decode(types::PAYEE_POINTER, &m).is_err());
    // No rails.
    let mut m = good.clone();
    m.retain(|(k, _)| k != &Value::Uint(3));
    m.push((Value::Uint(3), Value::Array(vec![])));
    assert!(Payload::decode(types::PAYEE_POINTER, &m).is_err());
    // Version 2 without a predecessor; version 1 with one.
    let mut m = good.clone();
    m.retain(|(k, _)| k != &Value::Uint(1));
    m.push((Value::Uint(1), Value::Uint(2)));
    assert!(Payload::decode(types::PAYEE_POINTER, &m).is_err());
    let mut m = good;
    m.push((Value::Uint(2), Value::Bytes(h("x").to_vec())));
    assert!(Payload::decode(types::PAYEE_POINTER, &m).is_err());
    // A type Finance does not define.
    assert_eq!(Payload::decode(4, &[]), Err(FinError::UnknownType(4)));
}

#[test]
fn who_signs() {
    let o = Payload::Obligation(Obligation {
        debtor: h("alice"),
        creditor: h("bob"),
        amount: sat(5),
        pointer: h("p"),
        agreement: None,
    });
    // F66: the creditor's "you owe me" is never an obligation.
    assert!(check_signer(&o, &h("bob")).is_err());
    assert!(check_signer(&o, &h("alice")).is_ok());
    let r = Payload::Receipt(Receipt {
        rail: h("ln"),
        proof: vec![],
        payer: Some(h("alice")),
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("p"),
        previous: None,
        forward: None,
        batch: None,
    });
    assert!(check_signer(&r, &h("alice")).is_err());
    assert!(check_signer(&r, &h("bob")).is_ok());
    let p = Payload::PayeePointer(PayeePointer {
        payee: h("bob"),
        version: 1,
        previous: None,
        rails: vec![rail("ln")],
    });
    assert!(check_signer(&p, &h("thief")).is_err());
}

#[test]
fn the_pointer_that_counts() {
    let p = |v: u64, prev: Option<&str>| PayeePointer {
        payee: h("bob"),
        version: v,
        previous: prev.map(h),
        rails: vec![rail("ln")],
    };
    let chain = vec![
        (h("p1"), p(1, None)),
        (h("p2"), p(2, Some("p1"))),
        (h("p3"), p(3, Some("p2"))),
    ];
    assert_eq!(
        latest_pointer(&chain),
        LatestPointer {
            act: Some(h("p3")),
            contested: false
        }
    );
    // A fork at version 2: the last pointer before it, contested (rule 12).
    let mut fork = chain[..2].to_vec();
    fork.push((h("p2'"), p(2, Some("p1"))));
    assert_eq!(
        latest_pointer(&fork),
        LatestPointer {
            act: Some(h("p1")),
            contested: true
        }
    );
    // Jumping ahead counts for nothing.
    let jump = vec![(h("p1"), p(1, None)), (h("p5"), p(5, Some("p1")))];
    assert_eq!(latest_pointer(&jump).act, Some(h("p1")));
}

fn entry(unit: &str, module: &str, limit: u64) -> VaultEntry {
    VaultEntry {
        unit: h(unit),
        rail_module: h(module),
        source: module.as_bytes().to_vec(),
        limit,
    }
}

#[test]
fn rule_14a_where_a_payment_may_go() {
    // No vault: everything to the flow, the owner's choice.
    assert_eq!(destination(None, &sat(1_000_000)), Destination::Flow);
    let v = vec![entry("sat", "ln", 10_000), entry("dollar", "card", 0)];
    assert_eq!(destination(Some(&v), &sat(10_000)), Destination::Flow);
    assert_eq!(
        destination(Some(&v), &sat(10_001)),
        Destination::Vault(vec![0])
    );
    // Flow off: a limit of zero.
    let usd = Amount {
        unit: h("dollar"),
        value: 1,
    };
    assert_eq!(destination(Some(&v), &usd), Destination::Vault(vec![1]));
    // A unit the vault does not cover: fail closed.
    let eur = Amount {
        unit: h("euro"),
        value: 1,
    };
    assert_eq!(
        destination(Some(&v), &eur),
        Destination::Undeliverable(Undeliverable::UnitNotCovered)
    );
    // Two entries for one unit with different limits: between them, the
    // rule does not say which applies (flaw L2), so it is refused.
    let two = vec![entry("sat", "ln", 10_000), entry("sat", "chain", 100_000)];
    assert_eq!(destination(Some(&two), &sat(5_000)), Destination::Flow);
    assert_eq!(
        destination(Some(&two), &sat(200_000)),
        Destination::Vault(vec![0, 1])
    );
    assert!(matches!(
        destination(Some(&two), &sat(50_000)),
        Destination::Undeliverable(Undeliverable::Unsettled(_))
    ));
}

#[test]
fn rails_the_payer_shares() {
    let flow = PayeePointer {
        payee: h("bob"),
        version: 1,
        previous: None,
        rails: vec![rail("card"), rail("ln")],
    };
    let only_ln = |m: &Hash, _: &[u8], _: &Hash| m == &h("ln");
    let v = vec![entry("sat", "chain", 10_000), entry("sat", "ln", 10_000)];
    // To the flow, on the first rail the payer shares.
    assert_eq!(
        choose(Some(&flow), Some(&v), &sat(10), only_ln),
        Choice::Flow(1)
    );
    // To the vault: one vault rail is dead to this payer, the other carries it.
    assert_eq!(
        choose(Some(&flow), Some(&v), &sat(20_000), only_ln),
        Choice::Vault(1)
    );
    // A vault only on a rail the payer lacks: undeliverable (rule 16).
    let chain_only = vec![entry("sat", "chain", 10_000)];
    assert_eq!(
        choose(Some(&flow), Some(&chain_only), &sat(20_000), only_ln),
        Choice::Undeliverable(Undeliverable::NoSharedRail)
    );
    // No pointer at all.
    assert_eq!(
        choose(None, None, &sat(1), only_ln),
        Choice::Undeliverable(Undeliverable::NoPointer)
    );
    // Good faith: paid to the flow above the limit, not protected (rule 15).
    assert!(!flow_followed_vault(Some(&v), &sat(20_000)));
    assert!(flow_followed_vault(Some(&v), &sat(10_000)));
}

#[test]
fn the_vault_declaration() {
    let fin = h("FINANCE");
    let v = vec![entry("sat", "ln", 10_000)];
    let d = vault_declaration(&fin, &v);
    assert_eq!(vault_in(&fin, &[d.clone()]).unwrap(), Some(Some(v)));
    assert_eq!(vault_in(&h("other"), &[d]).unwrap(), None);
    let removal = mor_core::identity::Declaration {
        spec: fin,
        kind: VAULT_KIND,
        value: None,
    };
    assert_eq!(vault_in(&fin, &[removal]).unwrap(), Some(None));
}
