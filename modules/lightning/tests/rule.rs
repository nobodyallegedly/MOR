//! The Lightning rail Module's decoder and rule, and the payment cMIP's
//! verification over it, without a node: invoices are made and signed by a
//! second, independent implementation (`lightning-invoice`), which also
//! decodes every one we decode.

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use lightning_invoice::{Bolt11Invoice, Currency, InvoiceBuilder, PaymentSecret};
use mor_core::act::Scheme;
use mor_core::finance::{Amount, Anonymous, Claim, PayeePointer, Payer, Rail, Receipt, VaultEntry};
use mor_core::identity::SigningKey;
use mor_core::sig::SchnorrKey;
use mor_core::hash::{sha256, Hash};
use mor_lightning::bolt11::{self, Network};
use mor_lightning::{unit, Lightning, LnAddress, LnProof};
use mor_payment::{verify, verify_under, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::str::FromStr;
use std::time::Duration;

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn secret(label: &str) -> SecretKey {
    SecretKey::from_slice(&h(label)).unwrap()
}

fn node_of(sk: &SecretKey) -> [u8; 33] {
    PublicKey::from_secret_key(&Secp256k1::new(), sk).serialize()
}

fn currency(n: Network) -> Currency {
    match n {
        Network::Mainnet => Currency::Bitcoin,
        Network::Testnet => Currency::BitcoinTestnet,
        Network::Signet => Currency::Signet,
        Network::Regtest => Currency::Regtest,
    }
}

/// An invoice signed by `sk`, for `msat`, committing to `dh`, with the
/// payment hash of `preimage`.
fn invoice(
    sk: &SecretKey,
    n: Network,
    msat: u64,
    dh: &Hash,
    preimage: &Hash,
    with_n: bool,
) -> String {
    let mut b = InvoiceBuilder::new(currency(n))
        .description_hash(bh::Hash::from_byte_array(*dh))
        .payment_hash(bh::Hash::from_byte_array(sha256(preimage)))
        .payment_secret(PaymentSecret([7; 32]))
        .amount_milli_satoshis(msat)
        .duration_since_epoch(Duration::from_secs(1_790_000_000))
        .min_final_cltv_expiry_delta(80)
        .basic_mpp();
    if with_n {
        b = b.payee_pub_key(PublicKey::from_secret_key(&Secp256k1::new(), sk));
    }
    b.build_signed(|m: &Message| Secp256k1::new().sign_ecdsa_recoverable(m, sk))
        .unwrap()
        .to_string()
}

#[test]
fn decodes_like_lightning_invoice() {
    let nets = [
        Network::Mainnet,
        Network::Testnet,
        Network::Signet,
        Network::Regtest,
    ];
    for i in 0..200u64 {
        let n = nets[(i % 4) as usize];
        let sk = secret(&format!("node {i}"));
        // Amounts of every multiplier, whole satoshis and not.
        let msat = [
            1_000u64,
            1_234_000,
            50_000_000_000,
            7,
            120,
            99_999_999_999_000,
        ][(i % 6) as usize]
            + i * 1000;
        let (dh, pre) = (h(&format!("dh {i}")), h(&format!("pre {i}")));
        let s = invoice(&sk, n, msat, &dh, &pre, i % 3 == 0);
        let ours = bolt11::decode(&s).unwrap_or_else(|e| panic!("{s}: {e:?}"));
        let theirs = Bolt11Invoice::from_str(&s).unwrap();
        assert_eq!(ours.network, n);
        assert_eq!(currency(ours.network), theirs.currency());
        assert_eq!(ours.amount_msat, theirs.amount_milli_satoshis());
        assert_eq!(ours.payment_hash, theirs.payment_hash().to_byte_array());
        assert_eq!(ours.payment_hash, sha256(&pre));
        assert_eq!(ours.description_hash, Some(dh));
        assert!(!ours.has_description);
        assert_eq!(ours.node, theirs.recover_payee_pub_key().serialize());
        assert_eq!(ours.node, node_of(&sk));
        assert_eq!(ours.timestamp, theirs.duration_since_epoch().as_secs());
    }
}

#[test]
fn a_changed_character_is_refused() {
    let s = invoice(
        &secret("n"),
        Network::Regtest,
        5_000,
        &h("d"),
        &h("p"),
        false,
    );
    let charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    let start = s.rfind('1').unwrap() + 1;
    for i in (start..s.len()).step_by(7) {
        let c = s.as_bytes()[i] as char;
        let other = charset.chars().find(|x| *x != c).unwrap();
        let t = format!("{}{}{}", &s[..i], other, &s[i + 1..]);
        assert!(bolt11::decode(&t).is_err(), "changed at {i}");
    }
    // Upper case, and another prefix, are refused too.
    assert!(bolt11::decode(&s.to_uppercase()).is_err());
    assert!(bolt11::decode(&s.replacen("lnbcrt", "lnxyz", 1)).is_err());
}

// ---------------------------------------------------------------- the rule, through the payment cMIP

const SALT: [u8; 16] = [9; 16];

struct World {
    payee: Hash,
    payer: Hash,
    pointer_id: Hash,
    pointer: PayeePointer,
    vault_id: Hash,
    vault: Vec<VaultEntry>,
    flow_node: SecretKey,
    vault_node: SecretKey,
}

impl Held for World {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        (id == &self.pointer_id).then(|| self.pointer.clone())
    }
    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        (id == &self.vault_id).then(|| (self.payee, self.vault.clone()))
    }
    fn obligation(&self, _: &Hash) -> Option<mor_payment::HeldObligation> {
        None
    }
}

fn world() -> World {
    let (flow_node, vault_node) = (secret("flow node"), secret("vault node"));
    let addr = |sk: &SecretKey| {
        LnAddress {
            network: Network::Regtest,
            node: node_of(sk),
            endpoint: None,
        }
        .encode()
    };
    let payee = h("payee");
    World {
        payee,
        payer: h("payer"),
        pointer_id: h("pointer act"),
        pointer: PayeePointer {
            payee,
            version: 1,
            previous: None,
            rails: vec![Rail {
                module: mor_lightning::spec(),
                address: addr(&flow_node),
            }],
        },
        vault_id: h("genesis act"),
        vault: vec![VaultEntry {
            unit: unit(Network::Regtest),
            rail_module: mor_lightning::spec(),
            source: addr(&vault_node),
            limit: 10_000,
        }],
        flow_node,
        vault_node,
    }
}

fn sat(n: u64) -> Amount {
    Amount {
        unit: unit(Network::Regtest),
        value: n,
    }
}

/// A payment as both sides record it: (receipt, claim), its invoice signed
/// by `node`, committing to what `commit` says.
fn paid(
    w: &World,
    paid_to: PaidTo,
    node: &SecretKey,
    amount: Amount,
    payer_in_commitment: Option<Payer>,
    preimage: Option<Hash>,
) -> (Receipt, Claim) {
    let fulfils = w.pointer_id;
    let c = Commitment {
        rail: mor_lightning::spec(),
        payee: w.payee,
        amount,
        fulfils,
        payer: payer_in_commitment.clone(),
        paid_to,
        salt: SALT,
        purchase: None,
    };
    let inv = invoice(
        node,
        Network::Regtest,
        amount.value * 1000,
        &c.hash(),
        &h("preimage"),
        false,
    );
    let proof = Proof {
        paid_to,
        salt: SALT,
        rail: LnProof {
            invoice: inv,
            preimage,
        }
        .encode(),
    }
    .encode();
    (
        Receipt {
            rail: mor_lightning::spec(),
            proof: proof.clone(),
            payer: payer_in_commitment.clone(),
            payee: w.payee,
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
            payee: w.payee,
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

fn answers(w: &World, r: &Receipt, c: &Claim, claimant: Hash) -> (Answer, Answer) {
    let ln = Lightning;
    let m = Modules::new().adopt(&ln);
    (
        verify(Record::Receipt(r), w, &m).answer,
        verify(Record::Claim(c, claimant), w, &m).answer,
    )
}

fn flow(w: &World) -> PaidTo {
    PaidTo::Flow {
        pointer: w.pointer_id,
        rail: 0,
    }
}

#[test]
fn a_complete_payment_is_valid_on_both_sides() {
    let w = world();
    let (r, c) = paid(
        &w,
        flow(&w),
        &w.flow_node,
        sat(1234),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    assert_eq!(answers(&w, &r, &c, w.payer), (Answer::Valid, Answer::Valid));
    // To the vault, under its entry, signed by the vault's node.
    let v = PaidTo::Vault {
        declared_by: w.vault_id,
        entry: 0,
    };
    let (r, c) = paid(
        &w,
        v,
        &w.vault_node,
        sat(50_000),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    assert_eq!(answers(&w, &r, &c, w.payer), (Answer::Valid, Answer::Valid));
}

#[test]
fn without_the_preimage_it_is_pending() {
    let w = world();
    let (r, c) = paid(&w, flow(&w), &w.flow_node, sat(1234), Some(Payer::Identity(w.payer)), None);
    let (a, b) = answers(&w, &r, &c, w.payer);
    assert!(matches!(a, Answer::Pending(_)) && matches!(b, Answer::Pending(_)));
}

#[test]
fn neither_side_alone_can_fake_a_payment() {
    let w = world();
    // A wrong preimage.
    let (r, c) = paid(
        &w,
        flow(&w),
        &w.flow_node,
        sat(1234),
        Some(Payer::Identity(w.payer)),
        Some(h("guess")),
    );
    let (a, b) = answers(&w, &r, &c, w.payer);
    assert!(matches!(a, Answer::Invalid(_)) && matches!(b, Answer::Invalid(_)));
    // The payer signs an invoice with its own node and claims it paid the
    // payee: the payee never declared that node.
    let (_, c) = paid(
        &w,
        flow(&w),
        &secret("payer's node"),
        sat(1234),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    assert!(matches!(
        answers(&w, &c_receipt(&c, &w), &c, w.payer).1,
        Answer::Invalid(_)
    ));
    // The flow node's invoice presented as paid to the vault.
    let v = PaidTo::Vault {
        declared_by: w.vault_id,
        entry: 0,
    };
    let (_, c) = paid(
        &w,
        v,
        &w.flow_node,
        sat(50_000),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    assert!(matches!(
        answers(&w, &c_receipt(&c, &w), &c, w.payer).1,
        Answer::Invalid(_)
    ));
    // Someone else holding the preimage (a node on the route) claims it as
    // its own payment: the commitment names the payer.
    let (r, c) = paid(
        &w,
        flow(&w),
        &w.flow_node,
        sat(1234),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    assert!(matches!(
        answers(&w, &r, &c, h("a routing node")).1,
        Answer::Invalid(_)
    ));
    // A claim changing the amount, or what it fulfils, no longer matches
    // the commitment the payee's node signed.
    let mut c2 = c.clone();
    c2.amount.value = 2000;
    assert!(matches!(
        answers(&w, &r, &c2, w.payer).1,
        Answer::Invalid(_)
    ));
    let mut c3 = c.clone();
    c3.fulfils = h("another obligation");
    assert!(matches!(
        answers(&w, &r, &c3, w.payer).1,
        Answer::Invalid(_)
    ));
}

fn c_receipt(c: &Claim, w: &World) -> Receipt {
    Receipt {
        rail: c.rail,
        proof: c.proof.clone(),
        payer: Some(Payer::Identity(w.payer)),
        payee: c.payee,
        amount: c.amount,
        fulfils: c.fulfils,
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    }
}

#[test]
fn what_the_verifier_does_not_hold_is_unknown() {
    let mut w = world();
    let (r, c) = paid(
        &w,
        flow(&w),
        &w.flow_node,
        sat(1234),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    w.pointer_id = h("another act");
    let (a, b) = answers(&w, &r, &c, w.payer);
    assert!(matches!(a, Answer::Unknown(_)) && matches!(b, Answer::Unknown(_)));
    // A rail Module the verifier has not adopted.
    let w = world();
    let m = Modules::new();
    assert!(matches!(
        verify(Record::Receipt(&r), &w, &m).answer,
        Answer::Unknown(_)
    ));
}

#[test]
fn another_identitys_pointer_or_another_unit_is_invalid() {
    let mut w = world();
    let (r, c) = paid(
        &w,
        flow(&w),
        &w.flow_node,
        sat(1234),
        Some(Payer::Identity(w.payer)),
        Some(h("preimage")),
    );
    w.pointer.payee = h("someone else");
    let (a, _) = answers(&w, &r, &c, w.payer);
    assert!(matches!(a, Answer::Invalid(_)));
    // A signet amount on a regtest rail.
    let w = world();
    let mut r2 = r.clone();
    r2.amount.unit = unit(Network::Signet);
    assert!(matches!(
        answers(&w, &r2, &c, w.payer).0,
        Answer::Invalid(_)
    ));
}

/// F113 (freeze suite 2.6): an anonymous payer commits a bare key of its
/// own; its claim, signed with that key and carried by a one-time
/// identity, verifies; a routing node holding the preimage cannot claim the
/// payment, nor redirect its refund.
#[test]
fn an_anonymous_refund_goes_to_the_committed_key_f113() {
    let w = world();
    let key = SchnorrKey::from_secret(&h("the payer's one-time key")).unwrap();
    let bare = SigningKey {
        scheme: Scheme::Founding(1),
        key: key.public().to_vec(),
    };
    let (r, mut c) = paid(
        &w,
        flow(&w),
        &w.flow_node,
        sat(1234),
        Some(Payer::Key(bare.clone())),
        Some(h("preimage")),
    );
    c.refund = Some(Rail {
        module: mor_lightning::spec(),
        address: b"the payer's refund address".to_vec(),
    });
    let sign = |c: &Claim, k: &SchnorrKey| Anonymous {
        key: bare.clone(),
        sig: k.sign(&c.anonymous_message(), &[0; 32]).sig,
    };
    let mut payers = c.clone();
    payers.anonymous = Some(sign(&c, &key));
    // The receipt names the key; the claim, carried by a one-time identity,
    // is the payer's.
    assert_eq!(answers(&w, &r, &payers, h("a one-time identity")), (Answer::Valid, Answer::Valid));
    // A routing node knows the preimage, but not the key. Claiming in its
    // own name recomputes another commitment.
    let router = h("a routing node");
    assert!(matches!(answers(&w, &r, &c, router).1, Answer::Invalid(_)));
    // Naming the committed key without its signature, or redirecting the
    // payer's signed refund to itself: invalid.
    let mut forged = c.clone();
    forged.anonymous = Some(sign(&c, &SchnorrKey::from_secret(&h("router key")).unwrap()));
    assert!(matches!(answers(&w, &r, &forged, router).1, Answer::Invalid(_)));
    let mut redirected = payers.clone();
    redirected.refund = Some(Rail {
        module: mor_lightning::spec(),
        address: b"the router's address".to_vec(),
    });
    assert!(matches!(answers(&w, &r, &redirected, router).1, Answer::Invalid(_)));
    // A payment that committed no key: nobody can claim it.
    let (r0, c0) = paid(&w, flow(&w), &w.flow_node, sat(1234), None, Some(h("preimage")));
    let (a, b) = answers(&w, &r0, &c0, w.payer);
    assert_eq!(a, Answer::Valid, "the payee's receipt, naming no payer");
    assert!(matches!(b, Answer::Invalid(_)), "{b:?}");
    let mut c0k = c0.clone();
    c0k.anonymous = Some(sign(&c0, &key));
    assert!(matches!(answers(&w, &r0, &c0k, router).1, Answer::Invalid(_)));
}

/// F115 (freeze suite 3.7g): a receipt counts only on a rail Module the
/// payee's own pointer or vault names, and, under an agreement, one
/// implementing the payment cMIP it names.
#[test]
fn only_rails_the_payee_named_count_f115() {
    let w = world();
    let (r, c) = paid(&w, flow(&w), &w.flow_node, sat(1234), Some(Payer::Identity(w.payer)), Some(h("preimage")));
    let ln = Lightning;
    let m = Modules::new().adopt(&ln);
    let ours = mor_payment::spec();
    assert_eq!(verify_under(Record::Receipt(&r), &w, &m, Some(&ours)).answer, Answer::Valid);
    // Under an agreement naming another payment cMIP: counts for nothing.
    assert!(matches!(
        verify_under(Record::Receipt(&r), &w, &m, Some(&h("another payment cMIP"))).answer,
        Answer::Invalid(_)
    ));
    // The payee's pointer names another rail Module at that rail: the
    // Lightning receipt counts for nothing, whatever the proof shows.
    let mut w2 = world();
    w2.pointer.rails[0].module = h("an on-chain rail Module");
    assert!(matches!(answers(&w2, &r, &c, w.payer).0, Answer::Invalid(_)));
}
