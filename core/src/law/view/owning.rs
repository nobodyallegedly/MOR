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
        match self.terms(&transfer.agreement).ok().and_then(|t| t.stakes.clone()).and_then(|s| s.get(transfer.stake as usize).cloned()) {
            Some(st) if st.share_of(&Who::Id(seller)) >= transfer.share => {}
            Some(_) => problems.push("the seller holds less of the stake than it sells (rule 14)".into()),
            None => problems.push("the version it names defines no such stake (rule 14)".into()),
        }
        let place = self.transfer_place(id, &seller);
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
        Ok(TransferEval { id: *id, transfer, seller, effective, problems, place, wrong_receipts, splits_paying_seller })
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
