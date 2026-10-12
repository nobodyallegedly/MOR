//! The pool as visible custody (roadmap step 14a: "pooled funds as visible
//! custody, and the conversion to on-chain with receipts per hop";
//! anchoring cMIP draft 4, "The pool as visible custody").
//!
//! In plain words: the service holds its buyers' money between their
//! payments and the transaction that anchors their batch. It keeps that
//! money **visible** by publishing what it already signs: its tickets (each
//! naming a payment and a batch), a Money receipt for each payment in, its
//! batch publications, a Money receipt for each coin its anchoring
//! transactions spend and for the change they pay back to it, and its
//! refund claims. From those alone, anyone can follow one batch's money:
//!
//! - **in**: the payments its tickets name, each shown by a receipt;
//! - **paid back**: the refunds Money shows repaid on them;
//! - **the fee**: what the anchoring transaction spends, each coin shown by
//!   a receipt of a payment to the service, less everything it pays, its
//!   change shown by a receipt too: the rest went to the miners;
//! - **the output**: the batch's own output, left at the service's key
//!   tweaked by the root (dust, 330 satoshis on Bitcoin);
//! - **kept**: in, less paid back, the fee and the output. Below zero, the
//!   batch cost more than it brought in: **the service's loss** (draft 3,
//!   item 13a; F228), shown, not hidden.
//!
//! Nothing here is a new format: tickets and publications are this cMIP's,
//! receipts and claims Money's, the transaction the clock Module's. Linking
//! is by data already there: a ticket names its payment's commitment and
//! its batch; a publication names its transaction; a receipt's rail proof
//! names the output it is (F200), and the transaction names the outputs it
//! spends. What cannot be shown, is shown as not shown.
//!
//! *Mechanics, the build's: the account's lines and their order; the
//! service's own coins moving as payments to its own pointer; the batch's
//! output counted as spent on the batch; an input not shown leaving the
//! batch's fee unknown rather than guessed.*

use crate::service::{self, Offer, Payment, Publication, Ticket};
use mor_core::hash::Hash;
use mor_payment::Answer;

/// One paid ticket, as the custody reads it: the ticket the service
/// signed, the payment buying it as the caller verified it (payment cMIP),
/// the act showing that payment (the service's receipt, or the payer's
/// claim: Money rule 10's double entry), and what Money shows repaid on it
/// (`AgreementsView::refund_repaid`).
#[derive(Clone, Debug)]
pub struct Paid {
    pub ticket: Ticket,
    pub payment: Payment,
    pub shown_by: Hash,
    pub repaid: u64,
}

/// One coin of the pool on the clock's chain: a payment to the service
/// itself, shown by a receipt the caller verified valid (Money rules 2 to
/// 4), and the payment it is, as its rail Module names it (F200: on
/// Bitcoin, the output the transaction created).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Coin {
    pub shown_by: Hash,
    pub payment: Vec<u8>,
    pub amount: u64,
}

/// A transaction, as a clock Module that carries batches reads it: its id
/// (as a publication names it), the payments whose outputs it spends, and
/// what it pays, by output: the payment each output would be, and its
/// value.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Spending {
    pub id: Hash,
    pub spends: Vec<Vec<u8>>,
    pub pays: Vec<(Vec<u8>, u64)>,
}

/// What a clock Module gives the custody: its reading of a transaction.
/// The Bitcoin clock Module implements it.
pub trait PoolChain {
    /// `tx`, as the clock carries it (on Bitcoin, without its witness);
    /// `None` where it is not one transaction.
    fn spending(&self, tx: &[u8]) -> Option<Spending>;
}

/// The chain side of one batch.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Anchoring {
    /// No publication of the batch under the offer.
    NotPublished,
    /// Published, but its money on the chain cannot be followed: why.
    NotShown(String),
    /// Followed: the coins it spent and the change it paid back, each with
    /// the receipt showing it; the batch's output; what it paid that no
    /// receipt shows (by output index); and the fee, the rest.
    Shown { tx: Hash, spent: Vec<(Hash, u64)>, output: u64, change: Vec<(Hash, u64)>, elsewhere: Vec<(u64, u64)>, fee: u64 },
}

/// One batch's money, followed.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Line {
    pub batch: u64,
    /// Each payment in for a ticket naming this batch: the act showing it,
    /// and its amount.
    pub paid_in: Vec<(Hash, u64)>,
    pub paid_back: u64,
    pub anchoring: Anchoring,
}

impl Line {
    pub fn paid_in(&self) -> u64 {
        self.paid_in.iter().map(|(_, a)| a).sum()
    }

    /// What the batch cost on the chain: the fee and its output; nothing
    /// for a batch never published; unknown where not shown.
    pub fn cost(&self) -> Option<u64> {
        match &self.anchoring {
            Anchoring::NotPublished => Some(0),
            Anchoring::NotShown(_) => None,
            Anchoring::Shown { output, fee, .. } => Some(fee + output),
        }
    }

    /// What the service kept of the batch's money: in, less paid back, less
    /// its cost. Below zero, a loss, the service's (F228).
    pub fn kept(&self) -> Option<i128> {
        Some(self.paid_in() as i128 - self.paid_back as i128 - self.cost()? as i128)
    }

    /// Paid out of the pool to outputs no receipt shows, where any.
    pub fn elsewhere(&self) -> u64 {
        match &self.anchoring {
            Anchoring::Shown { elsewhere, .. } => elsewhere.iter().map(|(_, v)| v).sum(),
            _ => 0,
        }
    }
}

/// The pool, batch by batch, under one standing offer.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Custody {
    pub lines: Vec<Line>,
    /// The pool's coins no anchoring transaction shown here spends: what
    /// it holds on the chain, as far as shown.
    pub unspent: Vec<Coin>,
}

impl Custody {
    pub fn paid_in(&self) -> u64 {
        self.lines.iter().map(Line::paid_in).sum()
    }
    pub fn paid_back(&self) -> u64 {
        self.lines.iter().map(|l| l.paid_back).sum()
    }
    /// What the service kept over every batch; unknown where a batch's
    /// chain side is not shown.
    pub fn kept(&self) -> Option<i128> {
        self.lines.iter().map(Line::kept).sum()
    }
    pub fn unspent(&self) -> u64 {
        self.unspent.iter().map(|c| c.amount).sum()
    }
}

/// Follow the pool under `offer` (anchoring cMIP draft 4, "The pool as
/// visible custody"), from what the service signed and published:
///
/// - `paid`: its tickets with the payments buying them; a ticket counts
///   only where its payment is valid and buys it ([`service::judge`]'s own
///   test: the offer, the commitment, following the offer, to its payee,
///   the tier's price);
/// - `publications`: its batches;
/// - `txs`: the anchoring transactions, as the clock carries them (from a
///   change receipt's proof, or any batch anchor), each matched to its
///   publication by id;
/// - `coins`: its receipts of payments to itself on the clock's chain, the
///   coins its anchoring transactions spend and the change they pay back.
///
/// Batches are numbered as tickets and publications number them; each
/// line is in batch order.
pub fn follow(offer: &Offer, paid: &[Paid], publications: &[Publication], txs: &[Vec<u8>], coins: &[Coin], chain: &dyn PoolChain) -> Custody {
    let paid: Vec<&Paid> = paid.iter().filter(|p| p.payment.answer == Answer::Valid && service::bought(offer, &p.ticket, &p.payment.commitment).is_ok()).collect();
    let publications: Vec<&Publication> = publications.iter().filter(|p| p.offer == offer.id).collect();
    let mut batches: Vec<u64> = paid.iter().map(|p| p.ticket.batch).chain(publications.iter().map(|p| p.batch)).collect();
    batches.sort_unstable();
    batches.dedup();
    let read: Vec<Spending> = txs.iter().filter_map(|t| chain.spending(t)).collect();
    let coin = |payment: &[u8]| coins.iter().find(|c| c.payment == payment);
    let mut spent_coins: Vec<Vec<u8>> = vec![];
    let lines = batches
        .into_iter()
        .map(|batch| {
            let mine: Vec<&&Paid> = paid.iter().filter(|p| p.ticket.batch == batch).collect();
            let anchoring = match publications.iter().filter(|p| p.batch == batch).collect::<Vec<_>>().as_slice() {
                [] => Anchoring::NotPublished,
                [p, rest @ ..] if rest.iter().any(|q| (q.tx, q.output) != (p.tx, p.output)) => Anchoring::NotShown("its publications name different transactions".into()),
                [p, ..] => match read.iter().find(|s| s.id == p.tx) {
                    None => Anchoring::NotShown("its transaction is not held".into()),
                    Some(s) => onchain(s, p.output, &coin, &mut spent_coins),
                },
            };
            Line { batch, paid_in: mine.iter().map(|p| (p.shown_by, p.payment.commitment.amount.value)).collect(), paid_back: mine.iter().map(|p| p.repaid.min(p.payment.commitment.amount.value)).sum(), anchoring }
        })
        .collect();
    let unspent = coins.iter().filter(|c| !spent_coins.contains(&c.payment)).cloned().collect();
    Custody { lines, unspent }
}

/// The chain side of a batch whose transaction is `s` and output `output`.
fn onchain<'c>(s: &Spending, output: u64, coin: &dyn Fn(&[u8]) -> Option<&'c Coin>, spent_coins: &mut Vec<Vec<u8>>) -> Anchoring {
    let Some((_, value)) = usize::try_from(output).ok().and_then(|i| s.pays.get(i)) else {
        return Anchoring::NotShown("its transaction has no such output".into());
    };
    let mut spent = vec![];
    for x in &s.spends {
        match coin(x) {
            Some(c) => spent.push((c.shown_by, c.amount)),
            None => return Anchoring::NotShown("it spends a coin no receipt shows: what it paid in is unknown, and so its fee".into()),
        }
    }
    let mut change = vec![];
    let mut elsewhere = vec![];
    for (i, (payment, v)) in s.pays.iter().enumerate() {
        if i as u64 == output {
            continue;
        }
        match coin(payment) {
            Some(c) if c.amount == *v => change.push((c.shown_by, *v)),
            _ => elsewhere.push((i as u64, *v)),
        }
    }
    let inputs: u64 = spent.iter().map(|(_, a)| a).sum();
    let outputs: u64 = s.pays.iter().map(|(_, v)| v).sum();
    let Some(fee) = inputs.checked_sub(outputs) else {
        return Anchoring::NotShown("it pays more than the coins shown bring: they are not all its inputs".into());
    };
    spent_coins.extend(s.spends.iter().cloned());
    Anchoring::Shown { tx: s.id, spent, output: *value, change, elsewhere, fee }
}
