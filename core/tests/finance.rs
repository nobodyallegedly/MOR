//! The Finance MIP's formats, the pointer that counts (rule 12), where a
//! payment may go under the vault (rules 14a and 16, F114), and an
//! anonymous payer's key (rules 1 and 10a, F113), and which flow pointer
//! version a payment to the flow can count for (rule 14).

use mor_core::act::Scheme;
use mor_core::cbor::{self, Value};
use mor_core::finance::*;
use mor_core::hash::{sha256, Hash};
use mor_core::identity::SigningKey;
use mor_core::sig::SchnorrKey;

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
        purchase: Some(Purchase { agreement: h("claiming agreement"), line: h("its version") }),
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
        anonymous: None,
        purchase: Some(Purchase { agreement: h("claiming agreement"), line: h("its version") }),
    }));
    // F126: the creditor's release, a Finance act (type 4).
    roundtrip(Payload::Release(Release { obligation: h("a debt"), against: vec![h("a receipt"), h("a deal")] }));
    roundtrip(Payload::Release(Release { obligation: h("a debt"), against: vec![] }));
    // F113: a receipt naming an anonymous payer's bare key; a claim carrying it.
    let key = SchnorrKey::from_secret(&h("a one-time key")).unwrap();
    let bare = SigningKey {
        scheme: Scheme::Founding(1),
        key: key.public().to_vec(),
    };
    roundtrip(Payload::Receipt(Receipt {
        rail: h("ln"),
        proof: vec![1],
        payer: Some(Payer::Key(bare.clone())),
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("pointer 1"),
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    }));
    roundtrip(Payload::Claim(Claim {
        rail: h("ln"),
        proof: vec![4],
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("pointer 1"),
        disagrees: None,
        referral: None,
        refund: Some(rail("ln")),
        anonymous: Some(Anonymous {
            key: bare,
            sig: vec![7; 64],
        }),
        purchase: None,
    }));
}

/// F113: an anonymous claim's key 8 must be signed by the key it names,
/// over this claim: lifted onto another claim, or forged, it is invalid.
#[test]
fn an_anonymous_claim_is_signed_by_its_committed_key() {
    let key = SchnorrKey::from_secret(&h("a one-time key")).unwrap();
    let bare = SigningKey {
        scheme: Scheme::Founding(1),
        key: key.public().to_vec(),
    };
    let mut c = Claim {
        rail: h("ln"),
        proof: vec![4],
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("pointer 1"),
        disagrees: None,
        referral: None,
        refund: Some(rail("ln")),
        anonymous: None,
        purchase: None,
    };
    let signed = |c: &Claim, k: &SchnorrKey| Anonymous {
        key: bare.clone(),
        sig: k.sign(&c.anonymous_message(), &[0; 32]).sig,
    };
    c.anonymous = Some(signed(&c, &key));
    // Signed by any identity: the payer is the key.
    assert!(check_signer(&Payload::Claim(c.clone()), &h("a one-time identity")).is_ok());
    assert_eq!(c.payer(&h("a one-time identity")), Payer::Key(bare.clone()));
    // The refund redirected after signing: the signature no longer holds.
    let mut moved = c.clone();
    moved.refund = Some(rail("someone else's rail"));
    assert!(check_signer(&Payload::Claim(moved), &h("x")).is_err());
    // Another key signing in the committed key's name.
    let thief = SchnorrKey::from_secret(&h("a routing node")).unwrap();
    let mut forged = c.clone();
    forged.anonymous = Some(signed(&c, &thief));
    assert!(check_signer(&Payload::Claim(forged), &h("x")).is_err());
    // Without key 8, the claim's signer is its payer.
    let named = Claim { anonymous: None, ..c };
    assert_eq!(named.payer(&h("alice")), Payer::Identity(h("alice")));
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
    assert_eq!(Payload::decode(5, &[]), Err(FinError::UnknownType(5)));
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
        payer: Some(Payer::Identity(h("alice"))),
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("p"),
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
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
    // F114: two entries for one unit with different limits: the smallest
    // applies, so between them the payment goes to the vault.
    let two = vec![entry("sat", "ln", 10_000), entry("sat", "chain", 100_000)];
    assert_eq!(destination(Some(&two), &sat(5_000)), Destination::Flow);
    assert_eq!(destination(Some(&two), &sat(10_000)), Destination::Flow);
    assert_eq!(
        destination(Some(&two), &sat(50_000)),
        Destination::Vault(vec![0, 1])
    );
    assert_eq!(
        destination(Some(&two), &sat(200_000)),
        Destination::Vault(vec![0, 1])
    );
    // A limit of zero on any entry turns the flow off for the unit.
    let off = vec![entry("sat", "ln", 10_000), entry("sat", "chain", 0)];
    assert_eq!(destination(Some(&off), &sat(1)), Destination::Vault(vec![0, 1]));
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

/// Rule 14: a payment to the flow counts only for what names that flow
/// pointer's version or a later one; to the vault, for anything. The story
/// of freeze scenario 1, step 5c, over a rail, is in
/// `modules/lightning/tests/flow_theft.rs`.
#[test]
fn rule_14_older_obligations_and_the_flow() {
    assert!(counts_toward(1, PaidInto::Flow(1)));
    assert!(counts_toward(2, PaidInto::Flow(1)));
    assert!(!counts_toward(1, PaidInto::Flow(2)));
    assert!(!counts_toward(1, PaidInto::Flow(u64::MAX)));
    assert!(counts_toward(1, PaidInto::Vault));
    assert!(counts_toward(u64::MAX, PaidInto::Vault));
}
