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
