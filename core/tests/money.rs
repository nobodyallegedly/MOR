//! The Money MIP's formats, the pointer that counts (rule 12), where a
//! payment may go under the vault (rules 14a and 16, F114), and an
//! anonymous payer's key (rules 1 and 10a, F113), and which flow pointer
//! version a payment to the flow can count for (rule 14).

use mor_core::act::Scheme;
use mor_core::cbor::{self, Value};
use mor_core::money::*;
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
    // F126: the creditor's release, a Money act (type 4).
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

/// F113, F135, F147: an anonymous claim's key 8 must be signed by the key
/// it names, over this claim and its act's own citations: lifted onto
/// another claim, changed in any field it covers, re-wrapped with other
/// `objects`, `acks` or `refs`, or forged, it is invalid.
#[test]
fn an_anonymous_claim_is_signed_by_its_committed_key() {
    use mor_core::act::{Object, Ref};
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
    // The claim act cites the publication it pays for and acknowledges it
    // (freeze suite 2.5c).
    let cited = Citations {
        objects: Some(vec![Object { chain: h("the work"), predecessor: h("its publication") }]),
        acks: Some(vec![h("its publication")]),
        refs: None,
    };
    let signed = |c: &Claim, k: &SchnorrKey, cited: &Citations| Anonymous {
        key: bare.clone(),
        sig: k.sign(&c.anonymous_message(cited), &[0; 32]).sig,
    };
    c.anonymous = Some(signed(&c, &key, &cited));
    // Signed by any identity: the payer is the key.
    assert!(check_signer(&Payload::Claim(c.clone()), &h("a one-time identity"), &cited).is_ok());
    assert_eq!(c.payer(&h("a one-time identity")), Payer::Key(bare.clone()));
    // The refund redirected after signing: the signature no longer holds.
    let mut moved = c.clone();
    moved.refund = Some(rail("someone else's rail"));
    assert!(check_signer(&Payload::Claim(moved), &h("x"), &cited).is_err());
    // F135: every other field it covers, changed after signing.
    let mut x = c.clone();
    x.disagrees = Some(h("a receipt"));
    assert!(check_signer(&Payload::Claim(x), &h("x"), &cited).is_err(), "field 5");
    let mut x = c.clone();
    x.referral = Some(Referral { identity: h("a referrer"), evidence: h("a repost") });
    assert!(check_signer(&Payload::Claim(x), &h("x"), &cited).is_err(), "field 6");
    let mut x = c.clone();
    x.purchase = Some(Purchase { agreement: h("a claim"), line: h("a line") });
    assert!(check_signer(&Payload::Claim(x), &h("x"), &cited).is_err(), "field 9");
    // F147: the same payload and key 8, re-wrapped in an act with other
    // citations: one citing the owner's rotation, one stripped of the
    // acknowledgement, one adding a reference, one with none at all.
    let rewraps = [
        Citations {
            objects: Some(vec![
                Object { chain: h("the work"), predecessor: h("its publication") },
                Object { chain: h("the owner"), predecessor: h("the owner's rotation") },
            ]),
            ..cited.clone()
        },
        Citations { acks: None, ..cited.clone() },
        Citations { refs: Some(vec![Ref::Act(h("the owner's rotation"))]), ..cited.clone() },
        Citations::default(),
    ];
    for other in &rewraps {
        assert!(check_signer(&Payload::Claim(c.clone()), &h("x"), other).is_err(), "re-wrapped: {other:?}");
    }
    // Another key signing in the committed key's name.
    let thief = SchnorrKey::from_secret(&h("a routing node")).unwrap();
    let mut forged = c.clone();
    forged.anonymous = Some(signed(&c, &thief, &cited));
    assert!(check_signer(&Payload::Claim(forged), &h("x"), &cited).is_err());
    // Without key 8, the claim's signer is its payer.
    let named = Claim { anonymous: None, ..c };
    assert_eq!(named.payer(&h("alice")), Payer::Identity(h("alice")));
}

/// F147: the bytes an anonymous payer's key signs, exactly as the claim
/// format shows them: fields 0 to 4, fields 5, 6, 7 and 9 or null, then
/// the act's inside keys 3, 7 and 8 or null, each encoded as the act
/// encodes it.
#[test]
fn the_anonymous_message_is_the_array_the_format_shows() {
    use mor_core::act::{Inside, Object, Ref};
    use mor_core::hash::tagged_hash;
    let c = Claim {
        rail: h("ln"),
        proof: vec![4, 5],
        payee: h("bob"),
        amount: sat(5),
        fulfils: h("an offer"),
        disagrees: None,
        referral: Some(Referral { identity: h("a referrer"), evidence: h("a repost") }),
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: h("a claim"), line: h("a line") }),
    };
    let inside = Inside {
        spec: h("FINANCE"),
        type_: types::CLAIM,
        prev: Some(vec![h("the signer's previous act")]),
        objects: Some(vec![Object { chain: h("the work"), predecessor: h("its publication") }]),
        payload: Payload::Claim(c.clone()).to_map(),
        position: Some(2),
        summary: None,
        acks: None,
        refs: Some(vec![Ref::Act(h("an act")), Ref::Web { address: "https://example.org/a".into(), hash: Some(h("a page")) }]),
        hint: None,
        salt: [0; 16],
    };
    let Value::Map(m) = inside.to_value() else { panic!() };
    let key = |k: u64| m.iter().find(|(x, _)| x == &Value::Uint(k)).map(|(_, v)| v.clone()).unwrap_or(Value::Null);
    let b = |x: Hash| Value::Bytes(x.to_vec());
    let expected = Value::Array(vec![
        b(c.rail),
        Value::Bytes(c.proof.clone()),
        b(c.payee),
        c.amount.to_value(),
        b(c.fulfils),
        Value::Null,
        Value::Array(vec![b(h("a referrer")), b(h("a repost"))]),
        Value::Null,
        Value::Array(vec![b(h("a claim")), b(h("a line"))]),
        key(3),
        key(7),
        key(8),
    ]);
    assert_eq!(key(7), Value::Null, "no acks: null");
    assert_eq!(
        c.anonymous_message(&Citations::of(&inside)),
        tagged_hash(ANONYMOUS_CLAIM_TAG, &cbor::encode(&expected))
    );
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
    // A type Money does not define.
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
    assert!(check_signer(&o, &h("bob"), &Citations::default()).is_err());
    assert!(check_signer(&o, &h("alice"), &Citations::default()).is_ok());
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
    assert!(check_signer(&r, &h("alice"), &Citations::default()).is_err());
    assert!(check_signer(&r, &h("bob"), &Citations::default()).is_ok());
    let p = Payload::PayeePointer(PayeePointer {
        payee: h("bob"),
        version: 1,
        previous: None,
        rails: vec![rail("ln")],
    });
    assert!(check_signer(&p, &h("thief"), &Citations::default()).is_err());
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
