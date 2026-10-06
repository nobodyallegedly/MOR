//! Finance rule 14 over the Lightning rail Module, as freeze test suite
//! scenario 1, step 5c tells it: a thief with a contributor's stolen
//! signing key changes the contributor's flow pointer. Royalties owed under
//! the earlier pointer cannot be collected through the thief's flow, only
//! through the vault; an obligation the thief re-issues with the stolen key
//! is no obligation; one the debtor re-signs to name the thief's pointer,
//! which its agreement act never cited, does not count toward the thief's
//! flow (F133); a fan's tip that followed the published pointer counts.
//!
//! Without a node: invoices are made and signed by `lightning-invoice`, as
//! in `rule.rs`. Test identities and regtest units only.

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_core::finance::{
    self, Amount, Claim, Obligation, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry,
};
use mor_core::hash::{sha256, Hash};
use mor_lightning::bolt11::Network;
use mor_lightning::{unit, Lightning, LnAddress, LnProof};
use mor_payment::{
    pointer_in_force, verify, Answer, Commitment, Held, HeldObligation, Modules, PaidTo, Proof, Record,
};
use std::collections::BTreeMap;
use std::time::Duration;

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn secret(label: &str) -> SecretKey {
    SecretKey::from_slice(&h(label)).unwrap()
}

fn address(node: &SecretKey) -> Vec<u8> {
    LnAddress {
        network: Network::Regtest,
        node: PublicKey::from_secret_key(&Secp256k1::new(), node).serialize(),
        endpoint: None,
    }
    .encode()
}

fn sat(n: u64) -> Amount {
    Amount {
        unit: unit(Network::Regtest),
        value: n,
    }
}

const SALT: [u8; 16] = [5; 16];

/// An obligation as a verifier holds it, its agreement act citing the
/// pointer it names (F133), or not, or not known.
fn held(obligation: Obligation, pointer_cited: Option<bool>) -> HeldObligation {
    HeldObligation {
        obligation,
        pointer_cited,
    }
}

/// What a verifier holds of the contributor: two flow pointers (its own,
/// then the thief's), its vault, and the obligations owed to it.
struct Contributor {
    id: Hash,
    pointers: BTreeMap<Hash, PayeePointer>,
    obligations: BTreeMap<Hash, HeldObligation>,
    genesis: Hash,
    vault: Vec<VaultEntry>,
}

impl Held for Contributor {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        self.pointers.get(id).cloned()
    }
    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        (id == &self.genesis).then(|| (self.id, self.vault.clone()))
    }
    fn obligation(&self, id: &Hash) -> Option<HeldObligation> {
        self.obligations.get(id).cloned()
    }
}

struct Story {
    c: Contributor,
    /// The film's split service, which owes the contributor its royalties.
    service: Hash,
    fan: Hash,
    own_pointer: Hash,
    thief_pointer: Hash,
    royalties: Hash,
    own_node: SecretKey,
    thief_node: SecretKey,
    vault_node: SecretKey,
}

fn story() -> Story {
    let (own_node, thief_node, vault_node) = (secret("own flow node"), secret("thief's node"), secret("vault node"));
    let id = h("contributor");
    let (own_pointer, thief_pointer) = (h("pointer, version 1"), h("pointer, version 2"));
    let ln = |node: &SecretKey| Rail {
        module: mor_lightning::spec(),
        address: address(node),
    };
    let pointers = BTreeMap::from([
        (
            own_pointer,
            PayeePointer {
                payee: id,
                version: 1,
                previous: None,
                rails: vec![ln(&own_node)],
            },
        ),
        // Signed with the stolen signing key: valid until the rotation.
        (
            thief_pointer,
            PayeePointer {
                payee: id,
                version: 2,
                previous: Some(own_pointer),
                rails: vec![ln(&thief_node)],
            },
        ),
    ]);
    let service = h("the film's split service");
    let royalties = h("royalties owed");
    let obligations = BTreeMap::from([(
        royalties,
        held(Obligation {
            debtor: service,
            creditor: id,
            amount: sat(40_000),
            pointer: own_pointer,
            agreement: Some(h("the film's deal")),
        }, Some(true)),
    )]);
    Story {
        c: Contributor {
            id,
            pointers,
            obligations,
            genesis: h("the contributor's genesis"),
            vault: vec![VaultEntry {
                unit: unit(Network::Regtest),
                rail_module: mor_lightning::spec(),
                source: address(&vault_node),
                limit: 100_000,
            }],
        },
        service,
        fan: h("a fan"),
        own_pointer,
        thief_pointer,
        royalties,
        own_node,
        thief_node,
        vault_node,
    }
}

/// A payment as both sides record it, its invoice signed by `node`.
fn paid(s: &Story, payer: Hash, fulfils: Hash, paid_to: PaidTo, node: &SecretKey, amount: Amount) -> (Receipt, Claim) {
    let c = Commitment {
        rail: mor_lightning::spec(),
        payee: s.c.id,
        amount,
        fulfils,
        payer: Some(Payer::Identity(payer)),
        paid_to,
        salt: SALT,
        purchase: None,
    };
    let preimage = h(&format!("preimage {fulfils:?} {paid_to:?}"));
    let invoice = InvoiceBuilder::new(Currency::Regtest)
        .description_hash(bh::Hash::from_byte_array(c.hash()))
        .payment_hash(bh::Hash::from_byte_array(sha256(&preimage)))
        .payment_secret(PaymentSecret([7; 32]))
        .amount_milli_satoshis(amount.value * 1000)
        .duration_since_epoch(Duration::from_secs(1_790_000_000))
        .min_final_cltv_expiry_delta(80)
        .build_signed(|m: &Message| Secp256k1::new().sign_ecdsa_recoverable(m, node))
        .unwrap()
        .to_string();
    let proof = Proof {
        paid_to,
        salt: SALT,
        rail: LnProof {
            invoice,
            preimage: Some(preimage),
        }
        .encode(),
    }
    .encode();
    (
        Receipt {
            rail: mor_lightning::spec(),
            proof: proof.clone(),
            payer: Some(Payer::Identity(payer)),
            payee: s.c.id,
            amount,
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        },
        Claim {
            rail: mor_lightning::spec(),
            proof,
            payee: s.c.id,
            amount,
            fulfils,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: None,
        },
    )
}

fn to_flow(pointer: Hash) -> PaidTo {
    PaidTo::Flow { pointer, rail: 0 }
}

fn to_vault(s: &Story) -> PaidTo {
    PaidTo::Vault {
        declared_by: s.c.genesis,
        entry: 0,
    }
}

/// The rail's answer and rule 14's, for the receipt and for the claim.
fn judged(s: &Story, r: &Receipt, c: &Claim, payer: Hash) -> [(Answer, Answer); 2] {
    let ln = Lightning;
    let m = Modules::new().adopt(&ln);
    [
        (
            verify(Record::Receipt(r), &s.c, &m).answer,
            pointer_in_force(Record::Receipt(r), &s.c),
        ),
        (
            verify(Record::Claim(c, payer), &s.c, &m).answer,
            pointer_in_force(Record::Claim(c, payer), &s.c),
        ),
    ]
}

/// 1.5c: royalties whose obligation names the contributor's own pointer
/// (version 1), paid to the thief's new flow (version 2): the rail's proof
/// is good, but the payment does not count. Paid to the vault, it counts.
#[test]
fn the_thief_cannot_collect_older_royalties_through_the_new_flow() {
    let s = story();
    let (r, c) = paid(&s, s.service, s.royalties, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!(rail, Answer::Valid, "the rail itself shows a payment");
        assert!(
            matches!(&rule_14, Answer::Invalid(w) if w.contains("rule 14")),
            "paid to the thief's flow, it must not count: {rule_14}"
        );
    }
    let (r, c) = paid(&s, s.service, s.royalties, to_vault(&s), &s.vault_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid), "paid to the vault, it counts");
    }
    // Paid to the flow pointer it names, the contributor's own, it counts
    // too: rule 14 refuses only a flow later than the one named.
    let (r, c) = paid(&s, s.service, s.royalties, to_flow(s.own_pointer), &s.own_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid));
    }
}

/// 1.5c: the thief, holding the contributor's (the creditor's) signing
/// key, re-issues the royalty obligation naming the new pointer. An
/// obligation is signed by its debtor (F66), so it is invalid as an
/// obligation; a verifier does not hold it as one, and a payment naming it
/// to the thief's flow counts for nothing under rule 14.
#[test]
fn an_obligation_the_thief_reissues_is_no_obligation() {
    let s = story();
    let reissued = Obligation {
        debtor: s.service,
        creditor: s.c.id,
        amount: sat(40_000),
        pointer: s.thief_pointer,
        agreement: Some(h("the film's deal")),
    };
    // Signed by the creditor's identity, with the stolen key.
    assert!(
        finance::check_signer(&Payload::Obligation(reissued.clone()), &s.c.id).is_err(),
        "an obligation signed by its creditor is invalid (F66)"
    );
    // A verifier holds only valid obligations, so it does not hold this one:
    // a payment naming it, to the thief's flow, is not one rule 14 lets count.
    let fake = h("the re-issued obligation");
    assert!(s.c.obligation(&fake).is_none());
    let (r, c) = paid(&s, s.service, fake, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    for (_, rule_14) in judged(&s, &r, &c, s.service) {
        assert_ne!(rule_14, Answer::Valid, "a payment naming no obligation held does not count for one");
    }
    // And the original obligation is unchanged: still payable to the vault.
    assert_eq!(s.c.obligation(&s.royalties).unwrap().obligation.pointer, s.own_pointer);
}

/// 1.5c: a fan tips in good faith, following the published pointer, the
/// thief's, before the rotation: the payment counts as made (rule 15).
/// Rule 14 does not refuse it: the tip names the version it was paid to.
#[test]
fn a_tip_that_followed_the_published_pointer_counts() {
    let s = story();
    let (r, c) = paid(&s, s.fan, s.thief_pointer, to_flow(s.thief_pointer), &s.thief_node, sat(2_100));
    assert!(finance::flow_followed_vault(Some(&s.c.vault), &r.amount));
    for (rail, rule_14) in judged(&s, &r, &c, s.fan) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid));
    }
    // A tip that names the earlier pointer but went to the thief's flow does
    // not follow the pointer it names, and does not count.
    let (r, c) = paid(&s, s.fan, s.own_pointer, to_flow(s.thief_pointer), &s.thief_node, sat(2_100));
    for (_, rule_14) in judged(&s, &r, &c, s.fan) {
        assert!(matches!(rule_14, Answer::Invalid(_)));
    }
}

/// An obligation that arose under the thief's pointer (a deal made after
/// the theft, before the rotation) names version 2: paid to that flow, it
/// counts. This is the stream between theft and rotation, a stated cost
/// that no clockless rule closes (Finance, "Reasoning").
#[test]
fn an_obligation_naming_the_later_pointer_counts_on_that_flow() {
    let mut s = story();
    let later = h("an obligation naming version 2");
    s.c.obligations.insert(
        later,
        held(Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(3_000),
            pointer: s.thief_pointer,
            agreement: Some(h("a later deal")),
        }, Some(true)),
    );
    let (r, c) = paid(&s, s.service, later, to_flow(s.thief_pointer), &s.thief_node, sat(3_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid));
    }
}

/// What rule 14 cannot read: an obligation naming a pointer this verifier
/// does not hold, or an agreement that names no pointer, answers unknown,
/// never valid; an obligation naming another identity's pointer, invalid.
#[test]
fn what_rule_14_cannot_read_is_never_valid() {
    let mut s = story();
    let (r, _) = paid(&s, s.service, h("an agreement"), to_flow(s.thief_pointer), &s.thief_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Unknown(_)));
    let unheld = h("names an unheld pointer");
    s.c.obligations.insert(
        unheld,
        held(Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(10),
            pointer: h("a pointer nobody holds"),
            agreement: None,
        }, Some(true)),
    );
    let (r, _) = paid(&s, s.service, unheld, to_flow(s.own_pointer), &s.own_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Unknown(_)));
    let other = h("someone else's pointer");
    s.c.pointers.insert(
        other,
        PayeePointer {
            payee: h("someone else"),
            version: 9,
            previous: Some(h("x")),
            rails: vec![Rail {
                module: mor_lightning::spec(),
                address: address(&s.thief_node),
            }],
        },
    );
    let wrong = h("names someone else's pointer");
    s.c.obligations.insert(
        wrong,
        held(Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(10),
            pointer: other,
            agreement: None,
        }, Some(true)),
    );
    let (r, _) = paid(&s, s.service, wrong, to_flow(s.thief_pointer), &s.thief_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Invalid(_)));
}

/// Rule 14 with F133: the debtor itself re-signs the royalty debt, naming
/// the thief's newer pointer, under the film's deal, whose act never cited
/// that pointer. The version it names does not count for it: paid to the
/// thief's flow, it counts for nothing; paid to the vault, it counts.
/// (Whether the agreement act cites the pointer is computed by the core
/// library, `finance::pointer_cited`, over real acts:
/// `core/tests/finance_f133.rs`.)
#[test]
fn a_debt_resigned_to_the_thiefs_pointer_its_agreement_never_cited_does_not_count() {
    let mut s = story();
    let resigned = h("the royalty debt, re-signed by the debtor to version 2");
    s.c.obligations.insert(
        resigned,
        held(
            Obligation {
                debtor: s.service,
                creditor: s.c.id,
                amount: sat(40_000),
                pointer: s.thief_pointer,
                agreement: Some(h("the film's deal")),
            },
            Some(false),
        ),
    );
    let (r, c) = paid(&s, s.service, resigned, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!(rail, Answer::Valid, "the rail itself shows a payment");
        assert!(
            matches!(&rule_14, Answer::Invalid(w) if w.contains("F133")),
            "its agreement never cited the thief's pointer: {rule_14}"
        );
    }
    let (r, c) = paid(&s, s.service, resigned, to_vault(&s), &s.vault_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid), "paid to the vault, it counts");
    }
    // Where the verifier cannot tell what the agreement act cites, the
    // payment to the flow is unknown, never counted.
    s.c.obligations.get_mut(&resigned).unwrap().pointer_cited = None;
    let (r, _) = paid(&s, s.service, resigned, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Unknown(_)));
}
