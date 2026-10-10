//! The pooled anchoring service (the anchoring cMIP draft 2, "The pooled
//! service"; roadmap step 14a), on the Bitcoin clock: hashes paid for one by
//! one over Lightning (real BOLT 11 invoices signed by a test node key, each
//! committing to its payment commitment, checked by the Lightning rail
//! Module through the payment cMIP), anchored in batches on a regtest chain
//! built with rust-bitcoin. Omission made provable (review section 9, item
//! 2); selective delay bounded by priced urgency tiers (item 3).

mod support;

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_anchoring::service::{self, Judgment, Offer, Payment, Publication, Ticket, Tier};
use mor_anchoring::tree::{self, Batch};
use mor_core::envelope::anchoring::Anchors;
use mor_core::finance::{Amount, Citations, Claim, PayeePointer, Payer, Rail, VaultEntry};
use mor_core::hash::{sha256, Hash};
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::chain::HeaderChain;
use mor_onchain::clock::{self, BatchAnchor, BitcoinClock};
use mor_onchain::{block, tx, Block, Network};
use mor_payment::{verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::time::Duration;
use support::*;

// ---------------------------------------------------------------- the service and its offer

struct World {
    service: Hash,
    pointer_id: Hash,
    pointer: PayeePointer,
    node: SecretKey,
    offer_id: Hash,
    offer: Offer,
    /// The x-only key its batch outputs are tweaked from.
    key: [u8; 32],
}

impl Held for World {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        (id == &self.pointer_id).then(|| self.pointer.clone())
    }
    fn vault(&self, _: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        None
    }
    fn obligation(&self, _: &Hash) -> Option<mor_core::finance::Obligation> {
        None
    }
    fn holding(&self, _: &Hash, _: &Hash) -> Option<mor_core::finance::Holding> {
        None
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        if payee == &self.service {
            vec![(self.pointer_id, self.pointer.clone())]
        } else {
            vec![]
        }
    }
    fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
        None
    }
    fn payment_counts(&self, _: &Hash, _: &mor_core::finance::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }
}

fn sat(n: u64) -> Amount {
    Amount { unit: mor_onchain::unit(Network::Regtest), value: n }
}

/// Three tiers, most urgent first: two blocks for 50, six for 20, a day
/// (144) for 5. The prices are the service's to state.
fn tiers() -> Vec<Tier> {
    vec![Tier { price: 50, blocks: 2 }, Tier { price: 20, blocks: 6 }, Tier { price: 5, blocks: 144 }]
}

fn world() -> World {
    let node = secret("the anchoring service's Lightning node");
    let service = h("the anchoring service");
    let pointer = PayeePointer {
        payee: service,
        version: 1,
        previous: None,
        rails: vec![Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node: PublicKey::from_secret_key(&Secp256k1::new(), &node).serialize(), endpoint: None }.encode() }],
    };
    let pointer_id = h("the service's pointer act");
    let offer = Offer { reference: clock::reference(Network::Regtest), pointer: pointer_id, unit: mor_onchain::unit(Network::Regtest), tiers: tiers() };
    World { service, pointer_id, pointer, node, offer_id: h("the service's offer act"), offer, key: xonly(&secret("the anchoring service's key")) }
}

// ---------------------------------------------------------------- a payer buys one hash

struct Bought {
    act: Hash,
    blind: [u8; 32],
    commitment: Commitment,
    claim: Claim,
    ticket: Ticket,
}

/// A real BOLT 11 invoice signed by the service's node, for `msat`,
/// committing to `dh`, with the payment hash of `preimage`.
fn invoice(sk: &SecretKey, msat: u64, dh: &Hash, preimage: &Hash) -> String {
    InvoiceBuilder::new(Currency::Regtest)
        .description_hash(bh::Hash::from_byte_array(*dh))
        .payment_hash(bh::Hash::from_byte_array(sha256(preimage)))
        .payment_secret(PaymentSecret([7; 32]))
        .amount_milli_satoshis(msat)
        .duration_since_epoch(Duration::from_secs(1_790_000_000))
        .min_final_cltv_expiry_delta(80)
        .basic_mpp()
        .build_signed(|m: &Message| Secp256k1::new().sign_ecdsa_recoverable(m, sk))
        .unwrap()
        .to_string()
}

/// A payer buys an anchor for `act` at `tier`, paying `paid` (the tier's
/// price, unless a test says otherwise), shown complete where `settled`;
/// the service's ticket names batch `batch`, by a deadline `blocks` after
/// `now`.
fn buy(w: &World, who: &str, tier: u64, paid: u64, settled: bool, batch: u64, now: u64) -> Bought {
    let act = h(&format!("{who}'s act"));
    let blind = h(&format!("{who}'s blind, 32 random bytes"));
    let paid_to = PaidTo::Flow { pointer: w.pointer_id, rail: 0 };
    let salt = [tier as u8 + 1; 16];
    let commitment = Commitment { rail: mor_lightning::spec(), payee: w.service, amount: sat(paid), fulfils: w.pointer_id, payer: Some(Payer::Identity(h(who))), paid_to, salt, purchase: None };
    let preimage = h(&format!("{who}'s preimage"));
    let ln = LnProof { invoice: invoice(&w.node, paid * 1000, &commitment.hash(), &preimage), preimage: settled.then_some(preimage) };
    let claim = Claim { rail: mor_lightning::spec(), proof: Proof { paid_to, salt, rail: ln.encode() }.encode(), payee: w.service, amount: sat(paid), fulfils: w.pointer_id, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
    let deadline = now + w.offer.tiers[tier as usize].blocks;
    let ticket = Ticket { offer: w.offer_id, leaf: tree::leaf(&act, &blind), commitment: commitment.hash(), tier, batch, deadline };
    Bought { act, blind, commitment, claim, ticket }
}

/// The payment as the payment cMIP verifies the payer's claim, with the
/// Lightning rail Module.
fn payment(w: &World, b: &Bought, payer: &str) -> Payment {
    let ln = Lightning;
    let answer = verify(Record::Claim(&b.claim, h(payer), &Citations::default()), w, &Modules::new().adopt(&ln)).answer;
    Payment { commitment: b.commitment.clone(), answer }
}

// ---------------------------------------------------------------- the batch on the chain

fn regtest_chain() -> HeaderChain {
    chain(&[mine(h("the chain so far"), &[h("genesis of this test")], REGTEST_BITS, 1)])
}

/// The service anchors `leaves` in one transaction mined in the next block
/// on `chain`, with `n` headers: its publication of batch `number`, and the
/// anchor of each leaf.
fn anchor(w: &World, chain: &mut HeaderChain, number: u64, leaves: &[Hash], n: usize) -> (Publication, Vec<BatchAnchor>) {
    let batch = Batch::new(leaves.to_vec()).unwrap();
    let out = tx::taproot_script(&mor_onchain::p2c::pay_to_contract(&w.key, None, &batch.root()).unwrap());
    let t = bytes(&support::tx(&format!("the pool's coins, batch {number}"), &[(out, 330), (vec![0x51, 0x20].into_iter().chain([3u8; 32]).collect(), 90_000)]));
    let txids = [h(&format!("a coinbase {number}")), txid(&t)];
    let headers = mine_on(chain, &txids, n);
    let blk = Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers };
    let anchors = (0..batch.count())
        .map(|i| BatchAnchor { blind: [0; 32], index: i, count: batch.count(), branch: batch.branch(i).unwrap(), key: w.key, tree: None, tx: t.clone(), output: 0, block: Some(blk.clone()) })
        .collect();
    (Publication { offer: w.offer_id, batch: number, leaves: leaves.to_vec(), tx: txid(&t), output: 0 }, anchors)
}

fn judge(w: &World, b: &Bought, pay: &Payment, pubs: &[Publication], anchor: Option<&BatchAnchor>, chain: &HeaderChain) -> Judgment {
    let enc = anchor.map(|a| a.encode());
    service::judge(&w.offer_id, &w.offer, &w.service, &b.ticket, pay, pubs, enc.as_deref(), &BitcoinClock { chain })
}

// ---------------------------------------------------------------- the tests

/// Test identities pay for hashes over Lightning; the service anchors them
/// in one batch, by pay-to-contract; anyone verifies inclusion from the
/// chain followed. Each ticket is delivered: anchored at the batch's block,
/// before its deadline. The payer, who holds the act and the blind, has an
/// anchor of the act on the Bitcoin clock; the service never learnt the act.
#[test]
fn hashes_paid_for_over_lightning_are_anchored_in_one_batch() {
    let w = world();
    let mut c = regtest_chain();
    let now = c.tip();
    let bought: Vec<Bought> = ["ana", "ben", "cal"].iter().enumerate().map(|(i, who)| buy(&w, who, i as u64, tiers()[i].price, true, 0, now)).collect();
    for (b, who) in bought.iter().zip(["ana", "ben", "cal"]) {
        assert_eq!(payment(&w, b, who).answer, Answer::Valid, "paid over Lightning, verified by the Lightning rail Module");
        assert_eq!(service::acceptable(&w.offer_id, &w.offer, &b.ticket, &b.commitment, &w.service, now), Ok(()));
    }
    let leaves: Vec<Hash> = bought.iter().map(|b| b.ticket.leaf).collect();
    let (publication, anchors) = anchor(&w, &mut c, 0, &leaves, N);
    assert_eq!(Publication::from_map(&publication.to_map()), Some(publication.clone()));
    assert_eq!(Ticket::from_map(&bought[0].ticket.to_map()), Some(bought[0].ticket.clone()));
    assert_eq!(Offer::from_map(&w.offer.to_map()), Some(w.offer.clone()));
    for (i, b) in bought.iter().enumerate() {
        let pay = payment(&w, b, ["ana", "ben", "cal"][i]);
        assert_eq!(judge(&w, b, &pay, &[publication.clone()], Some(&anchors[i]), &c), Judgment::Anchored { point: START + 1 });
        // The payer's own anchor of the act, with its blind.
        let mine = BatchAnchor { blind: b.blind, ..anchors[i].clone() };
        let mut held = Anchors::new();
        assert!(held.add_proof(&BitcoinClock { chain: &c }, &clock::reference(Network::Regtest), &b.act, &mine.encode()));
        assert_eq!(held.earliest(&b.act, &clock::reference(Network::Regtest)), Some(START + 1));
    }
    assert_eq!(publication.root(), Some(Batch::new(leaves).unwrap().root()));
}

/// Omission made provable (review section 9, item 2): the service publishes
/// batch 0 without a paid leaf. Its ticket and its publication, both signed
/// by it, contradict each other: an omission anyone can check, before the
/// deadline and without the chain. The price is owed back. A leaf the
/// publication does hold is not omitted.
#[test]
fn a_batch_published_without_a_paid_leaf_is_a_provable_omission() {
    let w = world();
    let mut c = regtest_chain();
    let now = c.tip();
    let ana = buy(&w, "ana", 1, 20, true, 0, now);
    let ben = buy(&w, "ben", 1, 20, true, 0, now);
    let (publication, anchors) = anchor(&w, &mut c, 0, &[ana.ticket.leaf, h("someone else's leaf")], 1);
    assert_eq!(judge(&w, &ben, &payment(&w, &ben, "ben"), &[publication.clone()], None, &c), Judgment::Omitted { refund: sat(20) });
    // Ana's leaf is there; her anchor is still short of the depth: pending.
    assert_eq!(judge(&w, &ana, &payment(&w, &ana, "ana"), &[publication.clone()], Some(&anchors[0]), &c), Judgment::Pending);
    // A publication of another batch says nothing about batch 0.
    let other = Publication { batch: 1, ..publication.clone() };
    assert_eq!(judge(&w, &ben, &payment(&w, &ben, "ben"), &[other], None, &c), Judgment::Pending);
    // Moved to a later batch, even one mined in time, it is still an
    // omission from the batch the ticket named: the ticket is broken.
    grow(&mut c, 1);
    let (later, later_anchors) = anchor(&w, &mut c, 1, &[ben.ticket.leaf], N);
    assert_eq!(judge(&w, &ben, &payment(&w, &ben, "ben"), &[publication, later], Some(&later_anchors[0]), &c), Judgment::Omitted { refund: sat(20) });
}

/// The default (review section 9, item 2): no anchor shown, and the
/// deadline buried at the clock's depth on the chain followed: non-delivery
/// by a deadline on a named reference. Before that, pending. The price is
/// owed back. An unpublished batch is a default the same way.
#[test]
fn no_anchor_by_the_deadline_is_a_default_and_a_refund() {
    let w = world();
    let mut c = regtest_chain();
    let now = c.tip();
    let ana = buy(&w, "ana", 0, 50, true, 0, now);
    let pay = payment(&w, &ana, "ana");
    assert_eq!(judge(&w, &ana, &pay, &[], None, &c), Judgment::Pending);
    // The deadline's block, and five more on it: a block at the deadline
    // would now have six confirmations.
    grow(&mut c, (ana.ticket.deadline - now) as usize + N - 2);
    assert_eq!(c.tip(), ana.ticket.deadline + N as u64 - 2);
    assert_eq!(judge(&w, &ana, &pay, &[], None, &c), Judgment::Pending, "one block short");
    grow(&mut c, 1);
    assert_eq!(judge(&w, &ana, &pay, &[], None, &c), Judgment::Default { refund: sat(50) });
    // An anchor that does not hold (another leaf's) changes nothing.
    let (_, anchors) = anchor(&w, &mut c, 0, &[h("another leaf")], N);
    assert_eq!(judge(&w, &ana, &pay, &[], Some(&anchors[0]), &c), Judgment::Default { refund: sat(50) });
}

/// Selective delay (review section 9, item 3): the service may hold a hash
/// up to its tier's deadline, unseen; that is the stated cost, bounded by the
/// tier (two blocks at the urgent tier). One block more is late: a default,
/// the price owed back, though the anchor still counts as an anchor at its
/// point.
#[test]
fn a_service_may_delay_up_to_the_tiers_deadline_and_no_further() {
    let w = world();
    // Anchored exactly at the deadline: delivered.
    let mut c = regtest_chain();
    let now = c.tip();
    let ana = buy(&w, "ana", 0, 50, true, 0, now);
    grow(&mut c, (ana.ticket.deadline - now - 1) as usize);
    let (p, a) = anchor(&w, &mut c, 0, &[ana.ticket.leaf], N);
    assert_eq!(judge(&w, &ana, &payment(&w, &ana, "ana"), &[p], Some(&a[0]), &c), Judgment::Anchored { point: ana.ticket.deadline });
    // One block later: late.
    let mut c = regtest_chain();
    grow(&mut c, (ana.ticket.deadline - now) as usize);
    let (p, a) = anchor(&w, &mut c, 0, &[ana.ticket.leaf], N);
    assert_eq!(judge(&w, &ana, &payment(&w, &ana, "ana"), &[p], Some(&a[0]), &c), Judgment::Late { point: ana.ticket.deadline + 1, refund: sat(50) });
    // The cheapest tier gives the service a day.
    let cal = buy(&w, "cal", 2, 5, true, 0, now);
    assert_eq!(cal.ticket.deadline - now, 144);
}

/// A ticket whose payment is not shown made owes nothing: no preimage (the
/// payment not shown complete), less than the tier's price, or a payment
/// whose commitment is not the ticket's.
#[test]
fn an_unpaid_ticket_owes_nothing() {
    let w = world();
    let mut c = regtest_chain();
    let now = c.tip();
    let ana = buy(&w, "ana", 0, 50, false, 0, now);
    let pay = payment(&w, &ana, "ana");
    assert!(matches!(pay.answer, Answer::Pending(_)));
    grow(&mut c, 20);
    assert!(matches!(judge(&w, &ana, &pay, &[], None, &c), Judgment::NotPaid(_)));
    let cheap = buy(&w, "ben", 0, 20, true, 0, now);
    let pay = payment(&w, &cheap, "ben");
    assert_eq!(pay.answer, Answer::Valid, "a valid payment of 20...");
    assert!(matches!(judge(&w, &cheap, &pay, &[], None, &c), Judgment::NotPaid(_)), "...is not the urgent tier's 50");
    let cal = buy(&w, "cal", 0, 50, true, 0, now);
    let other = buy(&w, "dan", 0, 50, true, 0, now);
    assert!(matches!(judge(&w, &cal, &payment(&w, &other, "dan"), &[], None, &c), Judgment::NotPaid(_)), "another payment's commitment");
}

/// Client conformance: before paying, the payer's client checks the ticket
/// against the offer and its own view of the clock: the offer it chose, the
/// leaf it sent, the tier's price paid to the service's pointer, and a
/// deadline no later than its own tip plus the tier's blocks, with one block
/// of slack for the service's view of the tip.
#[test]
fn the_payers_client_checks_the_ticket_against_the_offer_before_paying() {
    let w = world();
    let now = 500;
    let ana = buy(&w, "ana", 1, 20, true, 0, now);
    assert_eq!(service::acceptable(&w.offer_id, &w.offer, &ana.ticket, &ana.commitment, &w.service, now), Ok(()));
    assert_eq!(service::acceptable(&w.offer_id, &w.offer, &ana.ticket, &ana.commitment, &w.service, now - 1), Ok(()), "one block of slack");
    let far = Ticket { deadline: now + 6 + 2, ..ana.ticket.clone() };
    assert!(service::acceptable(&w.offer_id, &w.offer, &far, &ana.commitment, &w.service, now).is_err(), "a deadline beyond the tier");
    let no_tier = Ticket { tier: 9, ..ana.ticket.clone() };
    assert!(service::acceptable(&w.offer_id, &w.offer, &no_tier, &ana.commitment, &w.service, now).is_err());
    let other_offer = Ticket { offer: h("another offer"), ..ana.ticket.clone() };
    assert!(service::acceptable(&w.offer_id, &w.offer, &other_offer, &ana.commitment, &w.service, now).is_err());
    let cheap = buy(&w, "ben", 1, 5, true, 0, now);
    assert!(service::acceptable(&w.offer_id, &w.offer, &cheap.ticket, &cheap.commitment, &w.service, now).is_err(), "not the tier's price");
    let elsewhere = Commitment { fulfils: h("another pointer"), ..ana.commitment.clone() };
    let t = Ticket { commitment: elsewhere.hash(), ..ana.ticket.clone() };
    assert!(service::acceptable(&w.offer_id, &w.offer, &t, &elsewhere, &w.service, now).is_err(), "not following the offer's pointer");
    assert!(service::acceptable(&w.offer_id, &w.offer, &ana.ticket, &cheap.commitment, &w.service, now).is_err(), "the ticket names another commitment");
}
