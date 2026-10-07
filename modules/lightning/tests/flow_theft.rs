//! Finance rules 12, 14 and 15 over the Lightning rail Module, as freeze
//! test suite scenario 1, step 5c tells it: a thief with a contributor's
//! stolen signing key changes the contributor's flow pointer. Royalties
//! owed under the earlier pointer cannot be collected through the thief's
//! flow, only through the vault; an obligation the thief re-issues with the
//! stolen key is no obligation; one the debtor re-signs to name the thief's
//! pointer counts for nothing there, since the pointer is judged by the
//! contributor's own act (F145, F155); a fan's tip that followed the
//! published pointer counts, and still counts after the rotation that
//! invalidates it, where the fan's claims meet rule 15's proviso (F139,
//! F146, F147, F154).
//!
//! Without a node: invoices are made and signed by `lightning-invoice`, as
//! in `rule.rs`. What the verifier holds is stated by hand ([`Contributor`]);
//! what an act holds is computed over real acts by the core library
//! (`core/tests/finance_f145.rs`). Test identities and regtest units only.

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_core::finance::{
    self, Amount, Citations, Claim, Holding, Obligation, PayeePointer, Payer, PayersClaim, Evidence, Payload, Rail, Receipt,
    VaultEntry,
};
use mor_core::hash::{sha256, Hash};
use mor_lightning::bolt11::Network;
use mor_lightning::{unit, Lightning, LnAddress, LnProof};
use mor_payment::{beside, pointer_in_force, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::collections::{BTreeMap, BTreeSet};
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

/// The contributor's pointers its own act holds (F145): complete.
fn holds(pointers: &[Hash]) -> Holding {
    Holding {
        pointers: pointers.to_vec(),
        complete: true,
    }
}

/// What a verifier holds of the contributor: two flow pointers (its own,
/// then the thief's), its vault, the obligations owed to it, what its own
/// acts hold for each, and, once it rotates, the pointers that rotation
/// invalidated and the payers' claims rule 15 reads.
struct Contributor {
    id: Hash,
    /// Valid now.
    pointers: BTreeMap<Hash, PayeePointer>,
    /// Pointers published after the rotation, among `pointers`.
    after_rotation: BTreeSet<Hash>,
    /// Invalidated by the rotation, with it.
    voided: BTreeMap<Hash, (PayeePointer, Hash)>,
    obligations: BTreeMap<Hash, Obligation>,
    /// For each obligation, agreement or offer: what the contributor's own
    /// act holds (F145).
    holdings: BTreeMap<Hash, Holding>,
    /// What rule 15 reads for each rail proof (F164): the payee's receipt,
    /// whether the rotation is anchored, the payers' claims.
    evidence: BTreeMap<Vec<u8>, Evidence>,
    genesis: Hash,
    /// The latest link of its chain, and the vault it declares there: the
    /// vault in force.
    link: Hash,
    vault: Vec<VaultEntry>,
    /// The links before it, each with the vault in force there (F164).
    earlier: Vec<(Hash, Option<Vec<VaultEntry>>)>,
}

impl Held for Contributor {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        self.pointers.get(id).cloned()
    }
    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        if id == &self.link {
            return Some((self.id, self.vault.clone()));
        }
        self.earlier.iter().find(|(l, _)| l == id).and_then(|(_, v)| v.clone()).map(|v| (self.id, v))
    }
    fn obligation(&self, id: &Hash) -> Option<Obligation> {
        self.obligations.get(id).cloned()
    }
    fn holding(&self, fulfils: &Hash, payee: &Hash) -> Option<Holding> {
        (payee == &self.id).then(|| self.holdings.get(fulfils).cloned()).flatten()
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        self.pointers
            .iter()
            .filter(|(_, p)| &p.payee == payee)
            .map(|(i, p)| (*i, p.clone()))
            .collect()
    }
    fn voided_pointer(&self, id: &Hash) -> Option<(PayeePointer, Hash)> {
        self.voided.get(id).cloned()
    }
    fn pointers_before(&self, payee: &Hash, rotation: &Hash) -> Vec<(Hash, PayeePointer)> {
        let mut out: Vec<_> = self
            .pointers_of(payee)
            .into_iter()
            .filter(|(i, _)| !self.after_rotation.contains(i))
            .collect();
        out.extend(
            self.voided
                .iter()
                .filter(|(_, (p, r))| &p.payee == payee && r == rotation)
                .map(|(i, (p, _))| (*i, p.clone())),
        );
        out
    }
    fn evidence(&self, proof: &[u8], _: &Hash, _: &Hash) -> Evidence {
        self.evidence.get(proof).cloned().unwrap_or_default()
    }
    fn vaults_of(&self, payee: &Hash) -> Vec<(Hash, Option<Vec<VaultEntry>>)> {
        if payee != &self.id {
            return vec![];
        }
        let mut out = self.earlier.clone();
        out.push((self.link, Some(self.vault.clone())));
        out
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
    let deal = h("the film's deal");
    let obligations = BTreeMap::from([(
        royalties,
        Obligation {
            debtor: service,
            creditor: id,
            amount: sat(40_000),
            pointer: own_pointer,
            agreement: Some(deal),
        },
    )]);
    // The contributor's signature act on the film's deal holds its own
    // pointer, version 1, and never the thief's.
    let holdings = BTreeMap::from([(royalties, holds(&[own_pointer])), (deal, holds(&[own_pointer]))]);
    Story {
        c: Contributor {
            id,
            pointers,
            after_rotation: BTreeSet::new(),
            voided: BTreeMap::new(),
            obligations,
            holdings,
            evidence: BTreeMap::new(),
            genesis: h("the contributor's genesis"),
            link: h("the contributor's genesis"),
            earlier: vec![],
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
    let none = Citations::default();
    [
        (
            verify(Record::Receipt(r), &s.c, &m).answer,
            pointer_in_force(Record::Receipt(r), &s.c),
        ),
        (
            verify(Record::Claim(c, payer, &none), &s.c, &m).answer,
            pointer_in_force(Record::Claim(c, payer, &none), &s.c),
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
    // Paid to the flow pointer the contributor's own act holds, it counts
    // too: rule 14 refuses only a flow later than that one.
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
        finance::check_signer(&Payload::Obligation(reissued.clone()), &s.c.id, &Citations::default()).is_err(),
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
    assert_eq!(s.c.obligation(&s.royalties).unwrap().pointer, s.own_pointer);
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

/// An obligation under a deal made after the theft, before the rotation,
/// that the thief signed as the contributor with the stolen key: that
/// signature act, the contributor's own until the rotation, holds the
/// thief's version 2, so paid to that flow it counts. This is the stream
/// between theft and rotation, a stated cost that no clockless rule closes
/// (Finance, "Reasoning").
#[test]
fn an_obligation_whose_payees_act_holds_the_later_pointer_counts_on_that_flow() {
    let mut s = story();
    let later = h("an obligation under a later deal");
    s.c.obligations.insert(
        later,
        Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(3_000),
            pointer: s.thief_pointer,
            agreement: Some(h("a later deal")),
        },
    );
    s.c.holdings.insert(later, holds(&[s.own_pointer, s.thief_pointer]));
    let (r, c) = paid(&s, s.service, later, to_flow(s.thief_pointer), &s.thief_node, sat(3_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid));
    }
}

/// What rule 14 cannot read: what a payment fulfils that is no obligation,
/// agreement or offer this verifier can read the payee's own acts on (a
/// Finance-only verifier reads none), or one whose payee's act holds what
/// the verifier cannot tell, answers unknown, never valid. One whose
/// payee's acts hold no pointer at all answers invalid: only the vault.
/// The version an obligation names, held or not, the payee's or not, is
/// informative only (F155), and decides nothing.
#[test]
fn what_rule_14_cannot_read_is_never_valid() {
    let mut s = story();
    let (r, _) = paid(&s, s.service, h("an agreement"), to_flow(s.thief_pointer), &s.thief_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Unknown(_)));
    let unheld = h("names an unheld pointer");
    s.c.obligations.insert(
        unheld,
        Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(10),
            pointer: h("a pointer nobody holds"),
            agreement: Some(h("a deal not held")),
        },
    );
    s.c.holdings.insert(unheld, Holding { pointers: vec![], complete: false });
    let (r, _) = paid(&s, s.service, unheld, to_flow(s.own_pointer), &s.own_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Unknown(_)));
    let wrong = h("names someone else's pointer, under a deal the contributor never signed");
    s.c.obligations.insert(
        wrong,
        Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(10),
            pointer: h("someone else's pointer"),
            agreement: Some(h("a deal drafted by the service alone")),
        },
    );
    s.c.holdings.insert(wrong, holds(&[]));
    let (r, _) = paid(&s, s.service, wrong, to_flow(s.own_pointer), &s.own_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Invalid(w) if w.contains("F145")));
    // A deal the contributor signed, whose signature holds version 1: a
    // direct payment under it (no obligation between, rule 15, F145) is
    // judged by that act too.
    let deal = h("the film's deal");
    let (r, _) = paid(&s, s.service, deal, to_flow(s.own_pointer), &s.own_node, sat(10));
    assert_eq!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Valid);
    let (r, _) = paid(&s, s.service, deal, to_flow(s.thief_pointer), &s.thief_node, sat(10));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Invalid(_)));
}

/// Rule 14 with F145 (review finding 1): the debtor itself re-signs the
/// royalty debt, naming the thief's newer pointer, under the film's deal.
/// The version that counts is the one the contributor's own signature act
/// holds, version 1: paid to the thief's flow, it counts for nothing; paid
/// to the vault, it counts. Where the verifier cannot tell what that act
/// holds, and has found nothing late enough, it is unknown.
#[test]
fn a_debt_resigned_to_the_thiefs_pointer_counts_for_nothing_there() {
    let mut s = story();
    let resigned = h("the royalty debt, re-signed by the debtor to version 2");
    s.c.obligations.insert(
        resigned,
        Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(40_000),
            pointer: s.thief_pointer,
            agreement: Some(h("the film's deal")),
        },
    );
    s.c.holdings.insert(resigned, holds(&[s.own_pointer]));
    let (r, c) = paid(&s, s.service, resigned, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!(rail, Answer::Valid, "the rail itself shows a payment");
        assert!(
            matches!(&rule_14, Answer::Invalid(w) if w.contains("F145")),
            "the contributor's own act never held the thief's pointer: {rule_14}"
        );
    }
    let (r, c) = paid(&s, s.service, resigned, to_vault(&s), &s.vault_node, sat(40_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid), "paid to the vault, it counts");
    }
    s.c.holdings.get_mut(&resigned).unwrap().complete = false;
    let (r, _) = paid(&s, s.service, resigned, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    assert!(matches!(pointer_in_force(Record::Receipt(&r), &s.c), Answer::Unknown(_)));
}

/// F145: an IOU, an obligation naming no agreement act, counts only if paid
/// to the vault, whatever it cites, until the contributor acknowledges it
/// with an act of its own that holds a pointer; then that pointer, or an
/// older one, counts (F155), never the thief's newer one.
#[test]
fn an_iou_counts_on_the_flow_only_once_the_payee_acknowledges_it() {
    let mut s = story();
    let friend = h("a friend who owes");
    let iou = h("an IOU");
    s.c.obligations.insert(
        iou,
        Obligation {
            debtor: friend,
            creditor: s.c.id,
            amount: sat(5_000),
            pointer: s.own_pointer,
            agreement: None,
        },
    );
    s.c.holdings.insert(iou, holds(&[]));
    let (r, c) = paid(&s, friend, iou, to_flow(s.own_pointer), &s.own_node, sat(5_000));
    for (rail, rule_14) in judged(&s, &r, &c, friend) {
        assert_eq!(rail, Answer::Valid, "the rail itself shows a payment");
        assert!(matches!(&rule_14, Answer::Invalid(w) if w.contains("F145")), "not acknowledged: {rule_14}");
    }
    let (r, c) = paid(&s, friend, iou, to_vault(&s), &s.vault_node, sat(5_000));
    for (rail, rule_14) in judged(&s, &r, &c, friend) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid), "paid to the vault, it counts");
    }
    // The contributor acknowledges it with an act holding version 1.
    s.c.holdings.insert(iou, holds(&[s.own_pointer]));
    let (r, c) = paid(&s, friend, iou, to_flow(s.own_pointer), &s.own_node, sat(5_000));
    for (rail, rule_14) in judged(&s, &r, &c, friend) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid), "acknowledged: counts on that flow");
    }
    let (r, c) = paid(&s, friend, iou, to_flow(s.thief_pointer), &s.thief_node, sat(5_000));
    for (_, rule_14) in judged(&s, &r, &c, friend) {
        assert!(matches!(&rule_14, Answer::Invalid(_)), "never a newer wallet: {rule_14}");
    }
}

/// Finance rule 12 (audit, October 2026, gap 1): the thief does not extend
/// the chain but forks it. The owner's current pointer is version 2; with
/// the stolen signing key the thief signs a second version 2 naming the
/// same predecessor. The owner's act holds both of its own pointers, but a
/// forked chain counts only up to the fork (rules 12 and 14, F155): the
/// version that counts is 1. Paid to the thief's fork, the debt counts for
/// nothing; paid to the last pointer before the fork, or to the vault, it
/// counts. *Stated cost: until a rotation settles the fork, the owner's
/// own version 2 does not count either.*
#[test]
fn a_thiefs_same_version_pointer_cannot_collect_debts_naming_the_owners() {
    let mut s = story();
    let (owner_v2, owner_node) = (h("the owner's own pointer, version 2"), secret("the owner's second node"));
    s.c.pointers.insert(
        owner_v2,
        PayeePointer {
            payee: s.c.id,
            version: 2,
            previous: Some(s.own_pointer),
            rails: vec![Rail {
                module: mor_lightning::spec(),
                address: address(&owner_node),
            }],
        },
    );
    // `thief_pointer` is also version 2 naming `own_pointer`: a fork.
    assert!(finance::latest_pointer(&s.c.pointers_of(&s.c.id)).contested);
    let debt = h("a debt naming the owner's version 2");
    s.c.obligations.insert(
        debt,
        Obligation {
            debtor: s.service,
            creditor: s.c.id,
            amount: sat(40_000),
            pointer: owner_v2,
            agreement: Some(h("a deal the owner signed after its version 2")),
        },
    );
    s.c.holdings.insert(debt, holds(&[s.own_pointer, owner_v2]));
    let (r, c) = paid(&s, s.service, debt, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    for (rail, rule_12) in judged(&s, &r, &c, s.service) {
        assert_eq!(rail, Answer::Valid, "the rail itself shows a payment");
        assert!(
            matches!(&rule_12, Answer::Invalid(w) if w.contains("rule 12")),
            "paid to the thief's fork, it must not count: {rule_12}"
        );
    }
    let (r, c) = paid(&s, s.service, debt, to_flow(owner_v2), &owner_node, sat(40_000));
    for (_, rule_12) in judged(&s, &r, &c, s.service) {
        assert!(matches!(&rule_12, Answer::Invalid(w) if w.contains("rule 12")), "the owner's branch is past the fork too: {rule_12}");
    }
    let (r, c) = paid(&s, s.service, debt, to_flow(s.own_pointer), &s.own_node, sat(40_000));
    for (rail, rule_12) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_12), (Answer::Valid, Answer::Valid), "the last pointer before the fork counts");
    }
    let (r, c) = paid(&s, s.service, debt, to_vault(&s), &s.vault_node, sat(40_000));
    for (rail, rule_12) in judged(&s, &r, &c, s.service) {
        assert_eq!((rail, rule_12), (Answer::Valid, Answer::Valid), "paid to the vault, it counts");
    }
}

/// Finance rules 14a and 15 applied to a payment received (audit, October
/// 2026, gap 6): a payment to the flow above the vault's limit, or in a
/// unit the vault does not cover, verifies on the rail and passes rule 14,
/// but did not follow the published vault: judged beside, it does not
/// count. Below the limit it does.
#[test]
fn the_vault_rules_judge_a_payment_received_on_the_flow() {
    let mut s = story();
    let both = |s: &Story, r: &Receipt, c: &Claim| {
        [
            mor_payment::beside(Record::Receipt(r), &s.c),
            mor_payment::beside(Record::Claim(c, s.fan, &Citations::default()), &s.c),
        ]
    };
    // A tip following the thief's published pointer, under the limit: counts.
    let (r, c) = paid(&s, s.fan, s.thief_pointer, to_flow(s.thief_pointer), &s.thief_node, sat(2_100));
    assert_eq!(both(&s, &r, &c), [Answer::Valid, Answer::Valid]);
    // Above the vault's limit of 100,000: paid to the flow, it does not count.
    let (r, c) = paid(&s, s.fan, s.thief_pointer, to_flow(s.thief_pointer), &s.thief_node, sat(150_000));
    for (rail, rule_14) in judged(&s, &r, &c, s.fan) {
        assert_eq!((rail, rule_14), (Answer::Valid, Answer::Valid), "the rail and rule 14 alone let it through");
    }
    for a in both(&s, &r, &c) {
        assert!(matches!(&a, Answer::Invalid(w) if w.contains("14a")), "above the limit: {a}");
    }
    // Paid to the vault instead, it counts.
    let (r, c) = paid(&s, s.fan, s.thief_pointer, to_vault(&s), &s.vault_node, sat(150_000));
    assert_eq!(both(&s, &r, &c), [Answer::Valid, Answer::Valid]);
    // A vault covering only another unit: no payment in sats counts on the
    // flow, however small (fail closed).
    s.c.vault[0].unit = h("another unit");
    let (r, c) = paid(&s, s.fan, s.thief_pointer, to_flow(s.thief_pointer), &s.thief_node, sat(10));
    for a in both(&s, &r, &c) {
        assert!(matches!(&a, Answer::Invalid(w) if w.contains("14a")), "a unit the vault does not cover: {a}");
    }
}

// ---------------------------------------------------------------- rule 15: after the rotation

/// The contributor rotates: the thief's version 2 is void, and the
/// contributor publishes its own version 2, naming version 1 as the
/// thief's did. Returns the rotation.
fn rotate(s: &mut Story) -> Hash {
    let rotation = h("the contributor's rotation");
    let thiefs = s.c.pointers.remove(&s.thief_pointer).unwrap();
    s.c.voided.insert(s.thief_pointer, (thiefs, rotation));
    let new_v2 = h("the contributor's new version 2");
    s.c.pointers.insert(
        new_v2,
        PayeePointer {
            payee: s.c.id,
            version: 2,
            previous: Some(s.own_pointer),
            rails: vec![Rail {
                module: mor_lightning::spec(),
                address: address(&secret("the contributor's new node")),
            }],
        },
    );
    s.c.after_rotation.insert(new_v2);
    rotation
}

/// Rule 15 (F139, F147, F154, F164): the fan's tip to the thief's
/// pointer, made before the rotation, is judged after it. (a) A receipt of
/// the contributor's own shows it: made. (b) Otherwise on the payer's word
/// while the rotation is not anchored: with no payer's claim held, made
/// (F154); with a claim not holding the rotation, too (F139); with only a
/// claim holding it, not; the honest payer whose client wrote a second
/// claim later, citing the rotation, still counts (read together, F147);
/// where a claim's history cannot be told, unknown. Once the contributor
/// anchors the rotation, only a claim anchored before it counts, whatever
/// the claims cite (F164, replacing F146, whose anchor order bit only where
/// the payer chose to anchor). The rail's own answer stays valid.
#[test]
fn a_tip_paid_before_the_rotation_is_judged_by_the_receipt_or_the_payers_word() {
    let mut s = story();
    let (r, c) = paid(&s, s.fan, s.thief_pointer, to_flow(s.thief_pointer), &s.thief_node, sat(2_100));
    rotate(&mut s);
    let claim = |holds_rotation, anchored_before| PayersClaim { holds_rotation, anchored_before };
    let answers = |s: &Story| judged(s, &r, &c, s.fan);
    // No payer's claim held (a silent wallet): made.
    for (rail, rule_15) in answers(&s) {
        assert_eq!((rail, rule_15), (Answer::Valid, Answer::Valid), "F154");
    }
    let mut set = |e: Evidence| {
        s.c.evidence.insert(r.proof.clone(), e);
        answers(&s).map(|(rail, a)| {
            assert_eq!(rail, Answer::Valid);
            a
        })
    };
    let word = |claims| Evidence { receipt: false, rotation_anchored: false, claims };
    let anchored = |claims| Evidence { receipt: false, rotation_anchored: true, claims };
    assert_eq!(set(word(vec![claim(Some(false), None)])), [Answer::Valid, Answer::Valid], "F139");
    for a in set(word(vec![claim(Some(true), None)])) {
        assert!(matches!(&a, Answer::Invalid(w) if w.contains("rule 15")), "{a}");
    }
    assert_eq!(set(word(vec![claim(Some(false), None), claim(Some(true), None)])), [Answer::Valid, Answer::Valid], "F147");
    for a in set(word(vec![claim(None, None)])) {
        assert!(matches!(&a, Answer::Unknown(_)), "{a}");
    }
    // The contributor anchors the rotation: the payer's word no longer
    // counts, a bare claim citing nothing included; a claim anchored
    // before it does.
    for a in set(anchored(vec![])) {
        assert!(matches!(&a, Answer::Invalid(w) if w.contains("anchored")), "no claim, rotation anchored: {a}");
    }
    for a in set(anchored(vec![claim(Some(false), None), claim(Some(false), Some(false))])) {
        assert!(matches!(&a, Answer::Invalid(_)), "a bare claim, or one anchored after: {a}");
    }
    assert_eq!(set(anchored(vec![claim(Some(true), Some(true))])), [Answer::Valid, Answer::Valid], "anchored before (F164)");
    // (a) The contributor's own receipt shows it, anchored or not.
    assert_eq!(set(Evidence { receipt: true, rotation_anchored: true, claims: vec![] }), [Answer::Valid, Answer::Valid], "the payee's receipt (F164)");
}

/// Rule 15 judges the payment as the chain stood before the rotation: the
/// contributor's own new version 2, published after it, makes no fork of
/// the thief's version 2 for a payment made before. But rule 14 still
/// applies to it: royalties whose contributor's act holds only version 1,
/// paid to the voided version 2, count for nothing.
#[test]
fn good_faith_does_not_lift_rule_14() {
    let mut s = story();
    let (r, c) = paid(&s, s.service, s.royalties, to_flow(s.thief_pointer), &s.thief_node, sat(40_000));
    rotate(&mut s);
    for (rail, a) in judged(&s, &r, &c, s.service) {
        assert_eq!(rail, Answer::Valid);
        assert!(matches!(&a, Answer::Invalid(w) if w.contains("rule 14")), "{a}");
    }
}

/// F164 (Finance rules 14a and 15, withdrawing F160), the stolen phone
/// with the flow off, through the payment cMIP on Lightning. The
/// contributor's vault limit is 100,000 sat; it signed the film's deal.
/// Its phone, holding the signing key and the hot wallet behind its own
/// flow pointer, is stolen; it rotates with the safety key and turns the
/// flow off (limit 0). Royalties of 40,000 paid to that flow are judged by
/// the vault its chain declares now: under F160 they counted at once,
/// judged by the 100,000 the signature showed, and the thief kept them.
/// Now they count only as rule 15 says: the payee's own receipt; or the
/// payer's word until the contributor anchors the rotation; after that,
/// only a claim anchored before it. Paid to the vault, they count.
#[test]
fn the_stolen_phone_with_the_flow_off() {
    let mut s = story();
    let before = s.c.vault.clone();
    let rotation = h("the rotation turning the flow off");
    s.c.earlier.push((s.c.link, Some(before)));
    s.c.link = rotation;
    s.c.vault[0].limit = 0;
    let (r, c) = paid(&s, s.service, s.royalties, to_flow(s.own_pointer), &s.own_node, sat(40_000));
    let none = Citations::default();
    let both = |s: &Story| [beside(Record::Receipt(&r), &s.c), beside(Record::Claim(&c, s.service, &none), &s.c)];
    // The payer's word, the rotation not anchored: a stated cost (F164).
    assert_eq!(both(&s), [Answer::Valid, Answer::Valid], "on the payer's word until the owner anchors");
    // The contributor anchors the rotation: the window shuts.
    s.c.evidence.insert(r.proof.clone(), Evidence { receipt: false, rotation_anchored: true, claims: vec![PayersClaim { holds_rotation: Some(false), anchored_before: None }] });
    for a in both(&s) {
        assert!(matches!(&a, Answer::Invalid(w) if w.contains("limits") && w.contains("anchored")), "{a}");
    }
    // The service's client had anchored its claim before the rotation.
    s.c.evidence.insert(r.proof.clone(), Evidence { receipt: false, rotation_anchored: true, claims: vec![PayersClaim { holds_rotation: Some(false), anchored_before: Some(true) }] });
    assert_eq!(both(&s), [Answer::Valid, Answer::Valid], "a claim anchored before the rotation");
    // Or the contributor's own receipt, on a line the rotation kept.
    s.c.evidence.insert(r.proof.clone(), Evidence { receipt: true, rotation_anchored: true, claims: vec![] });
    assert_eq!(both(&s), [Answer::Valid, Answer::Valid], "the payee's own receipt");
    // A payment above every limit the chain ever declared is not protected.
    s.c.evidence.clear();
    let (r, c) = paid(&s, s.service, s.royalties, to_flow(s.own_pointer), &s.own_node, sat(400_000));
    assert!(matches!(beside(Record::Receipt(&r), &s.c), Answer::Invalid(w) if w.contains("vault")));
    assert!(matches!(beside(Record::Claim(&c, s.service, &none), &s.c), Answer::Invalid(w) if w.contains("vault")));
}
