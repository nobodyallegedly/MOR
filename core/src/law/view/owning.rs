//! The owning side of step 12b, read from what a verifier holds: who made
//! a work and who owns it as recorded (the work claim, F218), and a stake
//! transfer judged on the seller's own line (F217).

use super::*;
use crate::law::open_formats::{StakeTransfer, WorkClaim};

/// What MOR can record about a work's claims, read (rule 15; F218).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WorkOwners {
    pub work: Hash,
    /// The work claims that count (public or addressed to every creator
    /// they name, OF16 a), bound by every creator's signature, ascending.
    pub claims: Vec<Hash>,
    /// Two or more bound claims on the work: openly contested (rule 15),
    /// shown as recorded, never as legitimacy.
    pub contested: bool,
    /// The agreements, as in force, whose stakes write shares in the work:
    /// their holders are the owners as recorded (rules 15b, N12).
    pub agreements: Vec<Hash>,
    /// Where no agreement writes shares in the work and one claim binds
    /// it: the creator who opened that claim, the default holder (F218).
    pub default_holder: Option<Hash>,
}

/// A stake transfer, judged (rule 14; F217).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TransferEval {
    pub id: Hash,
    pub transfer: StakeTransfer,
    pub seller: Hash,
    /// Whether it takes effect: valid; the seller holds at least the share
    /// sold in the version named; the seller signed it by a chain
    /// signature, which fixes its place on the seller's own line (F132,
    /// F217); and the buyer completed it by a signature act (rule 14).
    pub effective: bool,
    pub problems: Vec<String>,
    /// The position of the seller's chain signature on the seller's
    /// identity chain: the transfer's place on the seller's own line.
    pub place: Option<u64>,
    /// The seller's payout receipts for that stake whose binding lies at
    /// or after that place: wrong receipts, counting for nothing (F217);
    /// each payout is owed to the buyer as the split service's open
    /// obligation (rule 29), in the share sold.
    pub wrong_receipts: Vec<Hash>,
    /// Splits paying the seller on that stake after the transfer, by any
    /// receipt or none: shown beside the transfer to a co-owner's and the
    /// buyer's client (F217, client conformance). The window before the
    /// service's first split citing it is a stated cost, legible.
    pub splits_paying_seller: Vec<Hash>,
    /// What the seller still held of the stake at the transfer's place on
    /// its own line (F224): its share in the version the transfer names,
    /// less every transfer of the same stake that conferred before it on
    /// that line. Unplaced, what it holds after every placed one.
    pub held_before: Option<u64>,
    /// Placed on the seller's line, it sells more than the seller still
    /// held there: an over-sale, conferring nothing (F224).
    pub over_sale: bool,
    /// Where it is an over-sale, the payments for it (a receipt or claim
    /// fulfilling it, or one its field 4 names): money received for
    /// nothing, owed back by the seller (F224; Money rule 10c).
    pub owed_back: Vec<Hash>,
}

impl<'a> LawView<'a> {
    /// Who made a work and who owns it as recorded (rule 15; F218).
    pub fn work_owners(&self, work: &Hash) -> R<WorkOwners> {
        let mut claims: Vec<Hash> = vec![];
        for h in self.v.held_acts() {
            if !self.is_law(h, types::WORK_CLAIM) || !self.valid(&h.id) {
                continue;
            }
            let Ok(c) = WorkClaim::decode(&h.inside, h.act.outside.signer.as_ref()) else { continue };
            if &c.work != work {
                continue;
            }
            let reaches = h.act.outside.content_key.is_some() || c.creators.iter().all(|x| h.act.outside.to.iter().flatten().any(|q| q == x));
            let opener = h.act.outside.signer.unwrap_or_default();
            let others: Vec<Hash> = c.creators.iter().filter(|x| **x != opener).copied().collect();
            if reaches && self.signers(&h.id, &others).len() == others.len() {
                claims.push(h.id);
            }
        }
        claims.sort();
        let mut agreements: Vec<Hash> = vec![];
        for h in self.v.held_acts() {
            if !self.is_law(h, types::TERMS) {
                continue;
            }
            let Ok(t) = self.terms(&h.id) else { continue };
            if t.stake_on(&Who::Id(*work)).is_none() || self.agreement(&h.id)?.exists != Some(true) {
                continue;
            }
            let v = self.version_in_force(&h.id)?;
            if !agreements.contains(&v) && self.terms(&v).is_ok_and(|t| t.stake_on(&Who::Id(*work)).is_some()) {
                agreements.push(v);
            }
        }
        agreements.sort();
        let default_holder = match (agreements.is_empty(), claims.as_slice()) {
            (true, [one]) => self.v.get(one).and_then(|h| h.act.outside.signer),
            _ => None,
        };
        Ok(WorkOwners { work: *work, contested: claims.len() > 1, claims, agreements, default_holder })
    }
}

impl<'a> LawView<'a> {
    /// A stake transfer, judged (rule 14; F217).
    pub fn transfer(&self, id: &Hash) -> R<TransferEval> {
        let h = self.held(id)?;
        if !self.is_law(h, crate::law::open_formats::new_types::STAKE_TRANSFER) {
            return Err(LawError::Check("not a stake transfer"));
        }
        let transfer = StakeTransfer::decode(&h.inside)?;
        let seller = h.act.outside.signer.ok_or(LawError::Check("a transfer has a signer"))?;
        let mut problems: Vec<String> = vec![];
        if !self.valid(id) {
            problems.push("it is not valid under Identity".into());
        }
        let place = self.transfer_place(id, &seller);
        let held_before = self.held_before(id, &transfer, &seller, place);
        let mut over_sale = false;
        match held_before {
            Some(h) if h >= transfer.share => {}
            Some(h) => {
                over_sale = place.is_some();
                problems.push(format!(
                    "an over-sale: the seller still held {h} millionths of the stake at its place on its own line, and it sells {}; it confers nothing (F224)",
                    transfer.share
                ));
            }
            None => problems.push("the version it names defines no such stake (rule 14)".into()),
        }
        if place.is_none() {
            problems.push("the seller has not signed it by a chain signature, which fixes its place on the seller's own line (F217; F132)".into());
        }
        if self.signers(id, &[transfer.to]).is_empty() {
            problems.push("the buyer has not completed it by a signature act (rule 14)".into());
        }
        let effective = problems.is_empty();
        let mut wrong_receipts = vec![];
        let mut splits_paying_seller = vec![];
        if effective {
            for (s, _) in self.splits_paying_on(&transfer, &seller) {
                if !splits_paying_seller.contains(&s) {
                    splits_paying_seller.push(s);
                }
            }
            for r in self.v.signed_by(&seller) {
                if self.wrong_payout_receipt(r).is_some_and(|(t, ..)| &t == id) {
                    wrong_receipts.push(r.id);
                }
            }
        }
        splits_paying_seller.sort();
        wrong_receipts.sort();
        let owed_back = if over_sale { self.transfer_payments(id, &transfer) } else { vec![] };
        Ok(TransferEval { id: *id, transfer, seller, effective, problems, place, wrong_receipts, splits_paying_seller, held_before, over_sale, owed_back })
    }

    /// Client conformance (F224): a buyer's client pays only once the
    /// seller's transfer is on the seller's own line, its chain signature
    /// counted there (receipted by the seller's homes where it has operated
    /// homes: the line counts it by their receipts), and checked against
    /// what the seller still holds. `Ok` with what the seller keeps after
    /// it; `Err` with why not to pay yet. The buyer's own signature may come
    /// before or after paying (mechanic, the build's).
    pub fn transfer_payable(&self, id: &Hash) -> R<Result<u64, String>> {
        let e = self.transfer(id)?;
        if e.place.is_none() {
            return Ok(Err("not yet on the seller's own line: its chain signature is not counted there (receipted by the seller's homes); do not pay yet (F224)".into()));
        }
        let blocking: Vec<&String> = e.problems.iter().filter(|p| !p.contains("buyer has not completed")).collect();
        if !blocking.is_empty() {
            return Ok(Err(blocking.iter().map(|p| p.as_str()).collect::<Vec<_>>().join("; ")));
        }
        Ok(Ok(e.held_before.unwrap_or(0) - e.transfer.share))
    }

    /// The stake a transfer sells, by its object (FR7), with the seller's
    /// share in the version it names.
    fn sold_stake(&self, t: &StakeTransfer, seller: &Hash) -> Option<(Who, u64)> {
        let st = self.terms(&t.agreement).ok()?.stakes?.get(t.stake as usize).cloned()?;
        Some((st.object, st.share_of(&Who::Id(*seller))))
    }

    /// The seller's transfers of the same stake (its object, across the
    /// agreement's lineage, FR7), valid and placed on its own line, in
    /// the order of their places: each `(place, id, share)`.
    fn sales_on_line(&self, t: &StakeTransfer, seller: &Hash) -> Vec<(u64, Hash, u64)> {
        let Some((object, _)) = self.sold_stake(t, seller) else { return vec![] };
        let root = |a: &Hash| self.lineage(a).ok().and_then(|l| l.last().map(|x| x.0));
        let mut out = vec![];
        for h in self.v.signed_by(seller) {
            if !self.is_law(h, crate::law::open_formats::new_types::STAKE_TRANSFER) || !self.valid(&h.id) {
                continue;
            }
            let Ok(o) = StakeTransfer::decode(&h.inside) else { continue };
            if root(&o.agreement).is_none() || root(&o.agreement) != root(&t.agreement) {
                continue;
            }
            if self.sold_stake(&o, seller).map(|x| x.0) != Some(object) {
                continue;
            }
            if let Some(p) = self.transfer_place(&h.id, seller) {
                out.push((p, h.id, o.share));
            }
        }
        out.sort();
        out
    }

    /// What the seller still held of the stake a transfer sells, at its
    /// place on the seller's own line (F224): its share in the version the
    /// transfer names, less each transfer of the same stake placed before
    /// it that fitted what was left, whether its buyer has completed it
    /// yet or not (mechanic, the build's: the seller's chain signature is
    /// the sale's place, so a later buyer's client sees it before paying).
    /// Transfers follow the stake across versions (FR7), so one naming
    /// another version of the lineage counts too (mechanic, the build's;
    /// see question QK2 in `docs/deals-owning-build.md`). Unplaced, after
    /// every placed one.
    fn held_before(&self, id: &Hash, t: &StakeTransfer, seller: &Hash, place: Option<u64>) -> Option<u64> {
        let (_, base) = self.sold_stake(t, seller)?;
        let mut left = base;
        for (p, x, share) in self.sales_on_line(t, seller) {
            if &x == id || place.is_some_and(|q| p >= q) {
                break;
            }
            // An earlier over-sale consumes nothing.
            if share <= left {
                left -= share;
            }
        }
        Some(left)
    }

    /// The payments for a transfer (F224): Money receipts and claims
    /// fulfilling it, and those its field 4 names.
    fn transfer_payments(&self, id: &Hash, t: &StakeTransfer) -> Vec<Hash> {
        use crate::finance::Payload as Fin;
        let mut out: Vec<Hash> = vec![];
        for h in self.v.held_acts() {
            if h.inside.spec != self.mips.finance {
                continue;
            }
            let fulfils = match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Receipt(r)) => r.fulfils,
                Ok(Fin::Claim(c)) => c.fulfils,
                _ => continue,
            };
            if &fulfils == id || t.record.contains(&h.id) {
                out.push(h.id);
            }
        }
        out.sort();
        out
    }

    /// The stake transfer a payment pays for (F224): the one it fulfils, or
    /// one whose field 4 names it.
    pub(super) fn transfer_paid_by(&self, payment: &Hash, fulfils: &Hash) -> Option<Hash> {
        let is_transfer = |h: &Held| self.is_law(h, crate::law::open_formats::new_types::STAKE_TRANSFER);
        if self.v.get(fulfils).is_some_and(is_transfer) {
            return Some(*fulfils);
        }
        self.v
            .held_acts()
            .filter(|h| is_transfer(h))
            .find(|h| StakeTransfer::decode(&h.inside).is_ok_and(|t| t.record.contains(payment)))
            .map(|h| h.id)
    }

    /// F223 (decided by Nobody, allegedly, 10 October 2026): from a split
    /// service's first split citing a transfer (split key 8), every payout
    /// to the seller for that stake is the service's debt to the buyer,
    /// receipted or not. "From" is read on the service's split numbers
    /// under the deal (DQ6): the citing split itself, and every split of
    /// the service under the same lineage numbered above the lowest citing
    /// one (mechanic, the build's). Each `(split, payout index, buyer,
    /// owed)`: what the payout gives the seller above its due once the
    /// transfer and those before it on the seller's line are followed,
    /// capped at the share sold of the stake's pot (mechanic, the build's).
    pub(super) fn owed_from_citing_splits(&self, splits: &[(&'a Held, Split)]) -> Vec<(Hash, usize, Hash, u64)> {
        let mut out = vec![];
        let root = |a: &Hash| self.lineage(a).ok().and_then(|l| l.last().map(|x| x.0));
        let mut cited: Vec<Hash> = splits.iter().flat_map(|(_, s)| s.transfers.iter().map(|(_, t)| *t)).collect();
        cited.sort();
        cited.dedup();
        for tid in cited {
            let Ok(e) = self.transfer(&tid) else { continue };
            if !e.effective {
                continue;
            }
            let Some((object, _)) = self.sold_stake(&e.transfer, &e.seller) else { continue };
            let lineage = root(&e.transfer.agreement);
            let from = splits
                .iter()
                .filter(|(_, s)| root(&s.agreement) == lineage && s.transfers.iter().any(|(_, t)| *t == tid))
                .filter_map(|(_, s)| s.number)
                .min();
            let held = e.held_before.unwrap_or(0);
            let keeps = held.saturating_sub(e.transfer.share);
            for (h, s) in splits {
                if root(&s.agreement) != lineage {
                    continue;
                }
                let cites = s.transfers.iter().any(|(_, t)| *t == tid);
                if !cites && !(from.is_some() && s.number.is_some_and(|n| Some(n) > from)) {
                    continue;
                }
                let Ok(st) = self.terms(&s.agreement) else { continue };
                let on_stake = |p: &Payout| p.stake.and_then(|k| st.stakes.as_ref()?.get(k as usize).map(|x| x.object)) == Some(object);
                let pot: u128 = s.payouts.iter().filter(|p| on_stake(p)).map(|p| p.amount as u128).sum();
                for (i, p) in s.payouts.iter().enumerate() {
                    if p.receiver != e.seller || !on_stake(p) {
                        continue;
                    }
                    let due = (pot * keeps as u128 / super::super::formats::MILLION as u128) as u64;
                    let cap = (pot * e.transfer.share as u128 / super::super::formats::MILLION as u128) as u64;
                    let owed = p.amount.saturating_sub(due).min(cap);
                    if owed > 0 {
                        out.push((h.id, i, e.transfer.to, owed));
                    }
                }
            }
        }
        out
    }

    /// The position on the seller's identity chain of the chain signature
    /// naming the transfer (the earliest that counts), F132.
    fn transfer_place(&self, id: &Hash, seller: &Hash) -> Option<u64> {
        let res = self.v.resolve(seller);
        self.v
            .signed_by(seller)
            .filter(|x| x.inside.spec == self.mips.identity && x.inside.type_ == crate::identity::types::CHAIN_SIGNATURE)
            .filter(|x| matches!(&x.identity, Some(Ok(Payload::ChainSignature(c))) if &c.signs == id))
            .filter(|x| !self.refuses(&x.id))
            .filter_map(|x| res.position_of(&x.id).map(|p| p as u64))
            .min()
    }

    /// The splits (by any service) paying `seller` on the stake a transfer
    /// sells, followed by its object across versions (FR7): each with the
    /// payout's index.
    fn splits_paying_on(&self, t: &StakeTransfer, seller: &Hash) -> Vec<(Hash, usize)> {
        let Some(object) = self.terms(&t.agreement).ok().and_then(|x| x.stakes.clone()).and_then(|s| s.get(t.stake as usize).map(|s| s.object)) else {
            return vec![];
        };
        let root = |a: &Hash| self.lineage(a).ok().and_then(|l| l.last().map(|x| x.0));
        let mut out = vec![];
        for h in self.v.held_acts() {
            if !self.is_law(h, types::SPLIT) {
                continue;
            }
            let Ok(s) = Split::decode(&h.inside.payload) else { continue };
            if root(&s.agreement).is_none() || root(&s.agreement) != root(&t.agreement) {
                continue;
            }
            let Ok(st) = self.terms(&s.agreement) else { continue };
            for (i, p) in s.payouts.iter().enumerate() {
                let same = p.stake.and_then(|k| st.stakes.as_ref()?.get(k as usize).map(|x| x.object)) == Some(object);
                if &p.receiver == seller && same {
                    out.push((h.id, i));
                }
            }
        }
        out
    }

    /// Whether `r` is a wrong payout receipt (F217): a receipt the seller
    /// signed, with its own key, for a split's payout to it on a stake it
    /// has transferred, bound at or after the transfer's place on its own
    /// line. With the transfer, the buyer, and the payout's index and the
    /// split, and the part of it owed to the buyer (the share sold, of the
    /// seller's holding in the version the transfer names).
    pub(super) fn wrong_payout_receipt(&self, r: &Held) -> Option<(Hash, Hash, Hash, usize, u64)> {
        use crate::finance::Payload as Fin;
        if r.inside.spec != self.mips.finance || self.key_grant(r).is_some() || !self.valid(&r.id) {
            return None;
        }
        let Ok(Fin::Receipt(x)) = Fin::decode(r.inside.type_, &r.inside.payload) else { return None };
        let seller = r.act.outside.signer?;
        if x.payee != seller {
            return None;
        }
        let pos = self.v.resolve(&seller).position_of(&r.act.outside.binding?)? as u64;
        for h in self.v.signed_by(&seller) {
            if !self.is_law(h, crate::law::open_formats::new_types::STAKE_TRANSFER) {
                continue;
            }
            let Ok(t) = StakeTransfer::decode(&h.inside) else { continue };
            let Some(place) = self.transfer_place(&h.id, &seller) else { continue };
            if pos < place || self.signers(&h.id, &[t.to]).is_empty() || !self.valid(&h.id) {
                continue;
            }
            for (split, i) in self.splits_paying_on(&t, &seller) {
                let names = x.fulfils == split || r.inside.objects.iter().flatten().any(|o| o.chain == split || o.predecessor == split);
                if !names {
                    continue;
                }
                let held = self.terms(&t.agreement).ok()?.stakes?.get(t.stake as usize)?.share_of(&Who::Id(seller)).max(1);
                let amount = Split::decode(&self.v.get(&split)?.inside.payload).ok()?.payouts.get(i)?.amount;
                let owed = (amount as u128 * t.share.min(held) as u128 / held as u128) as u64;
                return Some((h.id, t.to, split, i, owed));
            }
        }
        None
    }
}

impl<'a> LawView<'a> {
    /// A request to a judge (type 25; Fable's reading of OF24 a, with
    /// review 2.6): the links of the judge's chain of judgment it reaches,
    /// public or sealed to each (the judge first; a link it does not reach
    /// stops it there), or why it counts for nothing. Standing (rule 57a)
    /// is read here as a party who signed the version (mechanic, the
    /// build's; a stake's holder, keeper or arbitrator not yet).
    pub fn judge_request(&self, id: &Hash) -> R<Result<Vec<Hash>, String>> {
        let h = self.held(id)?;
        if !self.is_law(h, crate::law::open_formats::new_types::JUDGE_REQUEST) {
            return Err(LawError::Check("not a request to a judge"));
        }
        let r = crate::law::open_formats::JudgeRequest::decode(&h.inside)?;
        if !self.valid(id) {
            return Ok(Err("it is not valid under Identity".into()));
        }
        let t = self.terms(&r.agreement)?;
        let asker = h.act.outside.signer.unwrap_or_default();
        if !t.parties.contains(&asker) || self.signers(&r.agreement, &[asker]).is_empty() {
            return Ok(Err("asked by someone without standing: a party who signed the version (rule 57a)".into()));
        }
        let Some(chain) = t.chain_of(&r.judge) else {
            return Ok(Err("the terms name no such judge (rule 34a)".into()));
        };
        let named = match &r.judge {
            Judge::Identity(j) => t.arbitrators.iter().flatten().any(|a| a == j) || t.keepers.iter().any(|k| k.operators.contains(j)) || t.fork_judge.as_ref() == Some(j),
            _ => true,
        };
        if !named {
            return Ok(Err("the terms name no such judge (rule 34a)".into()));
        }
        let reaches = |j: &Hash| h.act.outside.content_key.is_some() || h.act.outside.to.iter().flatten().any(|q| q == j);
        let reached: Vec<Hash> = chain.into_iter().take_while(|j| reaches(j)).collect();
        if reached.is_empty() {
            return Ok(Err("neither public nor sealed to the judge it names: no judge was asked, and no period runs (review 2.6)".into()));
        }
        Ok(Ok(reached))
    }

    /// Whether a liveness act (type 12, rule 50) shows presence: valid, and
    /// public or addressed to every other party of the agreement it names
    /// (Fable's reading of OF23 a). In a collective it counts only where
    /// the collective placed it (FR10), which its chain shows.
    pub fn liveness(&self, id: &Hash) -> R<bool> {
        let h = self.held(id)?;
        let l = crate::law::open_formats::Liveness::decode(&h.inside)?;
        let t = self.terms(&l.agreement)?;
        let signer = h.act.outside.signer.unwrap_or_default();
        let reaches = h.act.outside.content_key.is_some()
            || t.parties.iter().filter(|p| **p != signer).all(|p| h.act.outside.to.iter().flatten().any(|q| q == p));
        Ok(self.valid(id) && t.parties.contains(&signer) && reaches)
    }
}
