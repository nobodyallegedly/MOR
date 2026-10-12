//! The pool as visible custody (roadmap step 14a: "pooled funds as visible
//! custody, and the conversion to on-chain with receipts per hop"; the
//! anchoring cMIP draft 4), on the Bitcoin clock, offline: a regtest chain
//! built with rust-bitcoin, the pool's coins shown by Money receipts the
//! on-chain rail Module verifies, the batches' transactions read by the
//! Bitcoin clock Module.
//!
//! What a reader follows, batch by batch, from acts the service already
//! signs: the payments in for the tickets naming the batch; the refunds
//! paid back on them; the coins the batch's transaction spends and the
//! change it pays back, each a payment of the service to its own pointer,
//! shown by its receipt; the batch's output; the fee, the rest; and what
//! the service kept, a loss where the batch cost more than it brought in
//! (draft 3, item 13a; F228).
//!
//! The payments in are Lightning payments whose verification the tests of
//! `tests/service.rs` and `tests/agreement.rs` already run for real; here
//! their answer is given, valid unless said. The coins' receipts are
//! verified here, by the on-chain rail's rule on the chain built. Test
//! identities and regtest units only.

mod support;

use bitcoin::hashes::Hash as _;
use bitcoin::secp256k1::{PublicKey, Secp256k1};
use bitcoin::{absolute, transaction, OutPoint, ScriptBuf, Sequence, Transaction, TxIn, TxOut, Txid, Witness};
use mor_anchoring::custody::{self, Anchoring, Coin, Paid};
use mor_anchoring::service::{Offer, Payment, Price, Publication, Terms, Ticket, Tier};
use mor_anchoring::tree::Batch;
use mor_core::hash::Hash;
use mor_core::money::{Amount, PayeePointer, Payer, Rail, Receipt, VaultEntry};
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::LnAddress;
use mor_onchain::chain::HeaderChain;
use mor_onchain::clock::{self, BitcoinClock};
use mor_onchain::{block, tx, Block, Network, Onchain, OnchainProof, Paid as OnchainPaid};
use mor_payment::{verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use support::*;

fn sat(n: u64) -> Amount {
    Amount { unit: mor_onchain::unit(Network::Regtest), value: n }
}

// ---------------------------------------------------------------- the service

/// The service: its pointer, with a Lightning rail (0) where buyers pay and
/// an on-chain rail (1) where its own coins sit; its standing offer; the
/// key its batch outputs are tweaked from.
struct Service {
    id: Hash,
    pointer_id: Hash,
    pointer: PayeePointer,
    pool: Keys,
    offer: Offer,
    key: [u8; 32],
}

impl Held for Service {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        (id == &self.pointer_id).then(|| self.pointer.clone())
    }
    fn vault(&self, _: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        None
    }
    fn obligation(&self, _: &Hash) -> Option<mor_core::money::Obligation> {
        None
    }
    fn holding(&self, _: &Hash, _: &Hash) -> Option<mor_core::money::Holding> {
        None
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        if payee == &self.id {
            vec![(self.pointer_id, self.pointer.clone())]
        } else {
            vec![]
        }
    }
    fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
        None
    }
    fn payment_counts(&self, _: &Hash, _: &mor_core::money::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }
}

/// A service whose tiers are these `(price, blocks)`.
fn service(tiers: &[(u64, u64)]) -> Service {
    let id = h("the anchoring service");
    let pool = Keys::new("the anchoring pool's on-chain coins");
    let node = PublicKey::from_secret_key(&Secp256k1::new(), &secret("the service's Lightning node")).serialize();
    let pointer = PayeePointer {
        payee: id,
        version: 1,
        previous: None,
        rails: vec![
            Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node, endpoint: None }.encode() },
            Rail { module: mor_onchain::spec(), address: pool.address(Network::Regtest).encode() },
        ],
    };
    let terms = Terms { reference: clock::reference(Network::Regtest), tiers: tiers.iter().map(|&(p, b)| Tier { price: Price::Fixed(p), blocks: b }).collect() };
    let offer = Offer::read(h("the service's offer act"), id, &terms.standing_offer(mor_onchain::unit(Network::Regtest), None, None)).unwrap();
    Service { id, pointer_id: h("the service's pointer act"), pointer, pool, offer, key: xonly(&secret("the anchoring service's batch key")) }
}

impl Service {
    /// A ticket for `who`'s hash in `batch` at `tier`, and the Lightning
    /// payment buying it, following the offer: its answer `answer`.
    fn paid(&self, who: &str, tier: u64, batch: u64, answer: Answer, repaid: u64) -> Paid {
        let price = self.offer.price(tier, None).unwrap();
        let commitment = Commitment { rail: mor_lightning::spec(), payee: self.id, amount: price, fulfils: self.offer.id, payer: Some(Payer::Identity(h(who))), paid_to: PaidTo::Flow { pointer: self.pointer_id, rail: 0 }, salt: [batch as u8; 16], purchase: None };
        let ticket = Ticket { offer: self.offer.id, leaf: h(&format!("{who}'s leaf")), commitment: commitment.hash(), tier, batch, deadline: 200, quote: None };
        Paid { ticket, payment: Payment { commitment, answer }, shown_by: h(&format!("the service's receipt of {who}'s payment")), repaid }
    }

    /// A payment of the service to its own pointer's on-chain rail: the
    /// commitment, and the script it pays.
    fn to_itself(&self, amount: u64, salt: u8) -> (Commitment, Vec<u8>) {
        let c = Commitment { rail: mor_onchain::spec(), payee: self.id, amount: sat(amount), fulfils: self.pointer_id, payer: Some(Payer::Identity(self.id)), paid_to: PaidTo::Flow { pointer: self.pointer_id, rail: 1 }, salt: [salt; 16], purchase: None };
        let script = self.pool.address(Network::Regtest).script(&c.hash()).unwrap();
        (c, script)
    }

    /// The service's receipt of a payment to itself, output `output` of
    /// `t`, mined in `at`.
    fn receipt(&self, c: &Commitment, t: &[u8], output: u64, at: Block) -> Receipt {
        let rail = OnchainProof { request: request(&self.pool.request, &c.hash()), confirmations: None, paid: Some(OnchainPaid { tx: t.to_vec(), output, block: Some(at) }) };
        Receipt { rail: c.rail, proof: Proof { paid_to: c.paid_to, salt: c.salt, rail: rail.encode() }.encode(), payer: c.payer.clone(), payee: c.payee, amount: c.amount, fulfils: c.fulfils, previous: None, forward: None, batch: None, purchase: None }
    }

    /// The script of a batch's output: the service's key tweaked by the
    /// batch's root, no OP_RETURN.
    fn batch_script(&self, leaves: &[&str]) -> Vec<u8> {
        let b = Batch::new(leaves.iter().map(|w| h(&format!("{w}'s leaf"))).collect()).unwrap();
        tx::taproot_script(&mor_onchain::p2c::pay_to_contract(&self.key, None, &b.root()).unwrap())
    }
}

// ---------------------------------------------------------------- the chain and the coins

/// A transaction spending `spends`, paying `outputs`.
fn spending(spends: &[([u8; 32], u32)], outputs: &[(Vec<u8>, u64)]) -> Vec<u8> {
    bytes(&Transaction {
        version: transaction::Version::TWO,
        lock_time: absolute::LockTime::ZERO,
        input: spends.iter().map(|(t, v)| TxIn { previous_output: OutPoint { txid: Txid::from_byte_array(*t), vout: *v }, script_sig: ScriptBuf::new(), sequence: Sequence::MAX, witness: Witness::new() }).collect(),
        output: outputs.iter().map(|(s, v)| TxOut { value: bitcoin::Amount::from_sat(*v), script_pubkey: ScriptBuf::from_bytes(s.clone()) }).collect(),
    })
}

/// A regtest chain, and `t` mined on its tip, buried at the rail's depth:
/// the proof's block.
fn mined(chain: &mut HeaderChain, t: &[u8]) -> Block {
    let txids = [h(&format!("a coinbase under {:?}", chain.tip())), txid(t)];
    let headers = mine_on(chain, &txids, N);
    Block { index: 1, branch: block::merkle_branch(&txids, 1).unwrap(), headers }
}

fn genesis() -> HeaderChain {
    chain(&[mine(h("before the tests"), &[h("the first coinbase")], REGTEST_BITS, 1_789_999_000)])
}

/// The coin a receipt shows, once the on-chain rail's rule says valid on
/// the chain held: what the receipt names, and the payment it is (F200).
fn coin(s: &Service, r: &Receipt, receipt_id: &str, chain: &HeaderChain) -> Coin {
    let onchain = Onchain::on(chain);
    assert_eq!(verify(Record::Receipt(r), s, &Modules::new().adopt(&onchain)).answer, Answer::Valid, "{receipt_id}: valid on the chain followed");
    let p = OnchainProof::decode(&Proof::decode(&r.proof).unwrap().rail).unwrap();
    Coin { shown_by: h(receipt_id), payment: p.payment().unwrap(), amount: r.amount.value }
}

/// One batch anchored: the service puts `deposit` of its own coins into
/// the pool (a payment to itself, receipted), then anchors `leaves` in one
/// transaction paying the batch's 330-satoshi output, `change` back to
/// itself (receipted) and `extra` outputs elsewhere; the fee is the rest.
struct Anchored {
    chain: HeaderChain,
    coins: Vec<Coin>,
    tx: Vec<u8>,
    publication: Publication,
}

fn anchored(s: &Service, leaves: &[&str], deposit: u64, change: u64, extra: &[(Vec<u8>, u64)]) -> Anchored {
    let mut chain = genesis();
    let (c0, script0) = s.to_itself(deposit, 0);
    let t0 = tx_paying(&[(script0, deposit)]);
    let at0 = mined(&mut chain, &t0);
    let (c1, script1) = s.to_itself(change, 1);
    let mut outs = vec![(s.batch_script(leaves), 330), (script1, change)];
    outs.extend(extra.iter().cloned());
    let t1 = spending(&[(txid(&t0), 0)], &outs);
    let at1 = mined(&mut chain, &t1);
    let r0 = s.receipt(&c0, &t0, 0, at0);
    let r1 = s.receipt(&c1, &t1, 1, at1);
    let coins = vec![coin(s, &r0, "the receipt of the deposit", &chain), coin(s, &r1, "the receipt of batch 0's change", &chain)];
    let publication = Publication { offer: s.offer.id, batch: 0, leaves: leaves.iter().map(|w| h(&format!("{w}'s leaf"))).collect(), tx: tx::dsha256(&t1), output: 0 };
    Anchored { chain, coins, tx: t1, publication }
}

/// The service's own coins, put into the pool: a transaction paying it.
fn tx_paying(outputs: &[(Vec<u8>, u64)]) -> Vec<u8> {
    bytes(&tx("the service's own coins, outside the pool", outputs))
}

// ---------------------------------------------------------------- the tests

#[test]
fn custody_follows_a_batchs_money_from_the_payers_payments_to_its_transaction() {
    // Prices the service chose high enough to carry a batch.
    let s = service(&[(2_000, 2), (500, 6)]);
    let paid = [s.paid("ana", 0, 0, Answer::Valid, 0), s.paid("ben", 1, 0, Answer::Valid, 0)];
    let a = anchored(&s, &["ana", "ben"], 10_000, 8_670, &[]);
    let bitcoin = BitcoinClock { chain: &a.chain };
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &a.coins, &bitcoin);
    assert_eq!(c.lines.len(), 1);
    let l = &c.lines[0];
    // In: each payment, shown by the act that shows it.
    assert_eq!(l.paid_in, vec![(paid[0].shown_by, 2_000), (paid[1].shown_by, 500)]);
    // On the chain: the coin spent, its receipt; the batch's output; the
    // change back, its receipt; the fee, the rest.
    assert_eq!(
        l.anchoring,
        Anchoring::Shown { tx: a.publication.tx, spent: vec![(h("the receipt of the deposit"), 10_000)], output: 330, change: vec![(h("the receipt of batch 0's change"), 8_670)], elsewhere: vec![], fee: 1_000 }
    );
    // What the service kept of the batch's money: 2,500 in, 1,330 spent.
    assert_eq!(l.cost(), Some(1_330));
    assert_eq!(l.kept(), Some(1_170));
    // What the pool still holds on the chain: the change.
    assert_eq!(c.unspent(), 8_670);
    assert_eq!(c.unspent[0].shown_by, h("the receipt of batch 0's change"));
}

#[test]
fn a_batch_costing_more_than_it_brought_in_is_the_services_loss_shown() {
    // The tests' usual prices: 50 and 20 a hash; a batch costs 1,330.
    let s = service(&[(50, 2), (20, 6)]);
    let paid = [s.paid("ana", 0, 0, Answer::Valid, 0), s.paid("ben", 1, 0, Answer::Valid, 0)];
    let a = anchored(&s, &["ana", "ben"], 10_000, 8_670, &[]);
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &a.coins, &BitcoinClock { chain: &a.chain });
    assert_eq!(c.lines[0].paid_in(), 70);
    assert_eq!(c.lines[0].cost(), Some(1_330));
    assert_eq!(c.lines[0].kept(), Some(-1_260), "a loss, the service's (F228), shown");
    assert_eq!(c.kept(), Some(-1_260));
    // The deadline did not move: the batch was anchored all the same.
    assert!(matches!(c.lines[0].anchoring, Anchoring::Shown { .. }));
}

#[test]
fn refunds_paid_back_and_a_batch_never_published_are_in_the_account() {
    let s = service(&[(50, 2), (20, 6)]);
    // Cal's ticket said batch 0, which left him out: 20 paid back. Dan's
    // batch 1 never came: 50 paid back.
    let paid = [s.paid("ana", 0, 0, Answer::Valid, 0), s.paid("cal", 1, 0, Answer::Valid, 20), s.paid("dan", 0, 1, Answer::Valid, 50)];
    let a = anchored(&s, &["ana"], 10_000, 8_670, &[]);
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &a.coins, &BitcoinClock { chain: &a.chain });
    assert_eq!(c.lines.iter().map(|l| l.batch).collect::<Vec<_>>(), vec![0, 1]);
    assert_eq!((c.lines[0].paid_in(), c.lines[0].paid_back, c.lines[0].kept()), (70, 20, Some(50 - 1_330)));
    assert_eq!(c.lines[1].anchoring, Anchoring::NotPublished);
    assert_eq!((c.lines[1].paid_in(), c.lines[1].paid_back, c.lines[1].kept()), (50, 50, Some(0)));
    assert_eq!((c.paid_in(), c.paid_back()), (120, 70));
    // Owed but not yet paid back stays in the pool: kept, and owed (the
    // judgment says it, `service::standing`).
    let unpaid = [s.paid("dan", 0, 1, Answer::Valid, 0)];
    let c = custody::follow(&s.offer, &unpaid, &[], &[], &[], &BitcoinClock { chain: &a.chain });
    assert_eq!(c.lines[0].kept(), Some(50));
}

#[test]
fn a_coin_no_receipt_shows_leaves_the_batchs_fee_unknown() {
    let s = service(&[(50, 2), (20, 6)]);
    let paid = [s.paid("ana", 0, 0, Answer::Valid, 0)];
    let a = anchored(&s, &["ana"], 10_000, 8_670, &[]);
    // Without the deposit's receipt, what the transaction spent is unknown.
    let without: Vec<Coin> = a.coins.iter().filter(|c| c.shown_by != h("the receipt of the deposit")).cloned().collect();
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &without, &BitcoinClock { chain: &a.chain });
    assert!(matches!(&c.lines[0].anchoring, Anchoring::NotShown(w) if w.contains("no receipt shows")), "{:?}", c.lines[0].anchoring);
    assert_eq!(c.lines[0].kept(), None);
    assert_eq!(c.kept(), None, "the pool is not visible while one batch is not");
    // Without the transaction, nothing on the chain is followed either.
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[], &a.coins, &BitcoinClock { chain: &a.chain });
    assert!(matches!(&c.lines[0].anchoring, Anchoring::NotShown(w) if w.contains("not held")));
    // A transaction that is not the one published is not read as it.
    let other = spending(&[(txid(&a.tx), 1)], &[(s.batch_script(&["ana"]), 330)]);
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[other], &a.coins, &BitcoinClock { chain: &a.chain });
    assert!(matches!(&c.lines[0].anchoring, Anchoring::NotShown(w) if w.contains("not held")));
}

#[test]
fn money_paid_out_where_no_receipt_shows_is_shown_as_such() {
    let s = service(&[(50, 2), (20, 6)]);
    let paid = [s.paid("ana", 0, 0, Answer::Valid, 0)];
    let somewhere = (tx::taproot_script(&xonly(&secret("a key no receipt names"))), 3_000);
    let a = anchored(&s, &["ana"], 10_000, 5_670, std::slice::from_ref(&somewhere));
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &a.coins, &BitcoinClock { chain: &a.chain });
    let Anchoring::Shown { elsewhere, fee, .. } = &c.lines[0].anchoring else { panic!("{:?}", c.lines[0].anchoring) };
    assert_eq!(elsewhere, &vec![(2, 3_000)], "output 2, 3,000, where no receipt shows");
    assert_eq!(*fee, 1_000);
    assert_eq!(c.lines[0].elsewhere(), 3_000);
    // A change output whose receipt names another amount is no change.
    let mut wrong = a.coins.clone();
    wrong[1].amount = 5_000;
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &wrong, &BitcoinClock { chain: &a.chain });
    let Anchoring::Shown { change, elsewhere, .. } = &c.lines[0].anchoring else { panic!() };
    assert!(change.is_empty());
    assert_eq!(elsewhere.len(), 2);
}

#[test]
fn two_batches_chained_by_their_change() {
    let s = service(&[(50, 2), (20, 6)]);
    let a = anchored(&s, &["ana", "ben"], 10_000, 8_670, &[]);
    let mut chain = a.chain.clone();
    // Batch 1 spends batch 0's change, and pays its own change back.
    let (c2, script2) = s.to_itself(7_140, 2);
    let t2 = spending(&[(txid(&a.tx), 1)], &[(s.batch_script(&["cal"]), 330), (script2, 7_140)]);
    let at2 = mined(&mut chain, &t2);
    let mut coins = a.coins.clone();
    coins.push(coin(&s, &s.receipt(&c2, &t2, 1, at2), "the receipt of batch 1's change", &chain));
    let p1 = Publication { offer: s.offer.id, batch: 1, leaves: vec![h("cal's leaf")], tx: tx::dsha256(&t2), output: 0 };
    let paid = [s.paid("ana", 0, 0, Answer::Valid, 0), s.paid("ben", 1, 0, Answer::Valid, 0), s.paid("cal", 1, 1, Answer::Valid, 0)];
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone(), p1], &[t2, a.tx.clone()], &coins, &BitcoinClock { chain: &chain });
    let fees: Vec<_> = c.lines.iter().map(|l| match &l.anchoring {
        Anchoring::Shown { fee, spent, .. } => (*fee, spent[0].0),
        x => panic!("{x:?}"),
    }).collect();
    assert_eq!(fees, vec![(1_000, h("the receipt of the deposit")), (1_200, h("the receipt of batch 0's change"))]);
    // The pool now holds only batch 1's change.
    assert_eq!(c.unspent.iter().map(|c| c.shown_by).collect::<Vec<_>>(), vec![h("the receipt of batch 1's change")]);
    assert_eq!(c.kept(), Some(70 - 1_330 + 20 - 1_530));
}

#[test]
fn a_payment_that_does_not_buy_its_ticket_brings_nothing_in() {
    let s = service(&[(50, 2), (20, 6)]);
    let a = anchored(&s, &["ana", "ben"], 10_000, 8_670, &[]);
    let mut tip = s.paid("ben", 1, 0, Answer::Valid, 0);
    // A tip to the service's pointer buys no ticket (F225).
    tip.payment.commitment.fulfils = s.pointer_id;
    tip.ticket.commitment = tip.payment.commitment.hash();
    let paid = [s.paid("ana", 0, 0, Answer::Pending("unsettled".into()), 0), tip, s.paid("eve", 1, 0, Answer::Valid, 0)];
    let c = custody::follow(&s.offer, &paid, &[a.publication.clone()], &[a.tx.clone()], &a.coins, &BitcoinClock { chain: &a.chain });
    assert_eq!(c.lines[0].paid_in, vec![(h("the service's receipt of eve's payment"), 20)]);
    // Another offer's publications are not this pool's.
    let mut stranger = a.publication.clone();
    stranger.offer = h("another offer");
    let c = custody::follow(&s.offer, &[], &[stranger], &[a.tx.clone()], &a.coins, &BitcoinClock { chain: &a.chain });
    assert!(c.lines.is_empty());
}
