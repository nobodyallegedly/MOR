//! Money's routes across rails (Money draft 7, rules 24 to 28; were 5, 6,
//! 8, 9 and 11), read over receipts the caller holds and checked.
//!
//! In plain words: one payment carried in several hops, each with its own
//! receipt, reads as **one chain**: each receipt names the one before it,
//! and each hop received exactly what the hop before declared it would pass
//! on (its forward). Where a hop declared a forward and no valid receipt of
//! the next payee names it, the route **stops there**, and the receipts
//! name that hop and the agreement its forward was under: the forward stays
//! that hop's open obligation.
//!
//! *The core library reads no route; this cMIP reads Money's rules here,
//! since its checker needs them and the core is unchanged by this step.*
//! Rule 25's rate ("at the rate its agreement defines") is the agreement's
//! to check: for a conversion offer under this cMIP, [`crate::judge`].
//! Rule 26 (disclosure along the route) is what the caller is shown.

use crate::{Hop, Owed};
use mor_core::hash::Hash;

/// A route, as the receipts held show it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Route {
    /// Rule 24: every receipt valid, each naming the previous hop's, each
    /// hop's received amount the previous hop's forward; it ends at a hop
    /// declaring no forward. The receipts, first to last.
    Complete { hops: Vec<Hash> },
    /// Rule 27: a receipt declares a forward, and no valid receipt of the
    /// next payee names it. The route stops at that hop (`hops`' last); the
    /// forward is its open obligation, under the agreement the forward
    /// names (rule 28: the hop and the agreement named). `near`: receipts
    /// naming that hop that are not its forward, and why.
    Stopped { hops: Vec<Hash>, owed: Owed, near: Vec<(Hash, String)> },
    /// Rule 28: the route breaks at the receipt `at`: why.
    Broken { hops: Vec<Hash>, at: Hash, why: String },
}

/// Whether `next` is the hop after `prev` on a route (rules 24 and 25):
/// `next` valid, naming `prev` (field 6 and `objects`); `prev` declares a
/// forward; `next`'s payee is the forward's next payee, its payer `prev`'s
/// payee (a conversion service "is the payer of the next hop"), its amount
/// exactly the forward's.
pub fn link(prev: &Hop, next: &Hop) -> Result<(), String> {
    if !next.answer.is_valid() {
        return Err(format!("not a valid receipt: {}", next.answer));
    }
    if !next.names(&prev.id) {
        return Err("it does not name the previous hop's receipt in its field 6 and its `objects`".into());
    }
    let Some(f) = &prev.receipt.forward else {
        return Err("the previous hop declares no forward: only conversion hops forward (rule 25)".into());
    };
    if next.receipt.payee != f.next_payee {
        return Err("its payee is not the forward's next payee".into());
    }
    if !crate::is(&next.receipt.payer, &prev.receipt.payee) {
        return Err("its payer is not the previous hop's payee, the conversion service that pays on".into());
    }
    if next.receipt.amount != f.amount {
        return Err(format!("it received {} where the previous hop's forward is {} (rule 24)", next.receipt.amount.value, f.amount.value));
    }
    Ok(())
}

/// The route starting at the receipt `first`, followed forward through the
/// receipts held: complete, stopped where a forward was not paid on, or
/// broken. Where several valid receipts each carry the forward on, the
/// one with the smallest act id is followed (mechanic, the build's).
pub fn from(first: &Hash, held: &[Hop]) -> Route {
    let find = |id: &Hash| held.iter().find(|h| &h.id == id);
    let Some(mut cur) = find(first) else {
        return Route::Broken { hops: vec![], at: *first, why: "the receipt is not held".into() };
    };
    if !cur.answer.is_valid() {
        return Route::Broken { hops: vec![], at: cur.id, why: format!("not a valid receipt: {}", cur.answer) };
    }
    let mut hops = vec![cur.id];
    loop {
        let Some(f) = &cur.receipt.forward else {
            return Route::Complete { hops };
        };
        let mut next: Vec<&Hop> = vec![];
        let mut near = vec![];
        for h in held.iter().filter(|h| h.receipt.previous == Some(cur.id) && !hops.contains(&h.id)) {
            match link(cur, h) {
                Ok(()) => next.push(h),
                Err(why) => near.push((h.id, why)),
            }
        }
        match next.into_iter().min_by_key(|h| h.id) {
            Some(n) => {
                hops.push(n.id);
                cur = n;
            }
            None => {
                near.sort();
                let owed = Owed { debtor: cur.receipt.payee, forward: f.clone(), declared_by: cur.id };
                return Route::Stopped { hops, owed, near };
            }
        }
    }
}

/// The route ending at the receipt `last`, as its final creditor reads it
/// (rule 26: each hop's receipt disclosed to it): its receipts back to the
/// first, through each one's field 6, then checked hop by hop (rule 24).
/// Complete only where it starts at a receipt naming no previous one and
/// `last` declares no forward.
pub fn ending_at(last: &Hash, held: &[Hop]) -> Route {
    let find = |id: &Hash| held.iter().find(|h| &h.id == id);
    let mut back: Vec<&Hop> = vec![];
    let mut at = *last;
    loop {
        let Some(h) = find(&at) else {
            return Route::Broken { hops: back.iter().rev().map(|h| h.id).collect(), at, why: "a receipt on the route is not held: each hop's receipt is disclosed to the final creditor (rule 26)".into() };
        };
        if back.iter().any(|x| x.id == h.id) {
            return Route::Broken { hops: vec![], at, why: "the receipts name each other in a circle".into() };
        }
        back.push(h);
        match h.receipt.previous {
            Some(p) => at = p,
            None => break,
        }
    }
    back.reverse();
    let hops: Vec<Hash> = back.iter().map(|h| h.id).collect();
    if !back[0].answer.is_valid() {
        return Route::Broken { hops, at: back[0].id, why: format!("not a valid receipt: {}", back[0].answer) };
    }
    for w in back.windows(2) {
        if let Err(why) = link(w[0], w[1]) {
            return Route::Broken { hops, at: w[1].id, why };
        }
    }
    if back.last().is_some_and(|h| h.receipt.forward.is_some()) {
        return Route::Broken { hops, at: *last, why: "it declares a forward: the route goes on past it".into() };
    }
    Route::Complete { hops }
}
