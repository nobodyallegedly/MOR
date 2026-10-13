//! The vow grammar, read from what a verifier holds (F237, F240; the texts
//! still say "announcement" until the redraft, F241).
//!
//! In plain words: a vow is named by its first act; offers naming it sell
//! it, with their words; each sale of it is **pending**, **confirmed** or
//! **contested**. Confirmed: the buyer acknowledged an act about the vow,
//! in the buyer's own claim for the payment (F193's shape: only the payer
//! the payment commits to). Contested: the buyer signed a contest naming
//! that sale (Agreements draft 11, rule 13, F253; draft 10's V-R9 named the
//! vow and marked every sale of the buyer). Otherwise pending. Only someone who signed onto the vow, by a
//! payment of their own or by signing a free offer, may confirm or contest
//! it (F240); a vow nobody signed onto carries no state. What the vow
//! promises, how it is delivered and what it becomes are the cMIPs'.
//!
//! Every choice no decision made, taken under the delegation of mechanics,
//! is marked "(mechanic, the build's)" and listed in
//! `docs/vow-grammar-build.md`.

use super::*;
use crate::agreements::open_formats::{Offer, Sold};
use crate::envelopes::vow::{Vow, VowAct};

/// Where a sale of a vow stands (F237).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum SaleState {
    /// Neither confirmed nor contested.
    Pending,
    /// The buyer acknowledged an act about the vow: the acknowledging acts.
    Confirmed { by: Vec<Hash> },
    /// The buyer contested this sale: the contests (draft 11, rule 13,
    /// F253). A contest prevails over a confirmation, and voids nothing
    /// (mechanic, the build's).
    Contested { by: Vec<Hash> },
}

/// One sale of a vow: someone signed onto it (F240).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VowSale {
    /// The act that signed the buyer onto the vow: the buyer's own payer's
    /// claim for a payment that is a purchase under an offer naming it; or,
    /// for an offer at no price, the buyer's signature act naming the offer.
    pub act: Hash,
    /// The offer it follows (a version of an offer chain naming the vow).
    pub offer: Hash,
    /// The buyer: the payer the payment's commitment names (F193), or the
    /// signer of the signature act.
    pub buyer: Hash,
    pub state: SaleState,
    /// Evidence beside the state (Agreements draft 11, rule 13, F261, F264):
    /// valid acts naming the sale (its act, `act`) in their `refs`, such as
    /// the seller's delivery of a key in keeping the vow, ascending. Shown,
    /// and never moving the state: the sale's state is still the buyer's
    /// confirmation or contest alone. What a proof is, and how it is
    /// checked, is the cMIP's (F237). *Mechanic, the build's:* evidence
    /// names the sale in `refs`.
    pub evidence: Vec<Hash>,
}

/// A vow, read (F237).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VowEval {
    /// Its name: its genesis id, for good.
    pub name: Hash,
    pub signer: Hash,
    /// Whether its genesis is not valid under Identity (made void by its
    /// signer's rotation, say): the name stands, and what others signed
    /// naming it stands, pointing at a void act, shown so (F237, correcting
    /// F230's cost). Its offers and sales are read as for any vow.
    pub void: bool,
    /// Its versions held, the genesis first, each valid and its signer's.
    pub versions: Vec<Hash>,
    /// The tips of its chain: one in the ordinary case; two or more is the
    /// signer's fork, shown (as an offer's, OF4 a).
    pub latest: Vec<Hash>,
    /// The words of each tip, in the order of `latest`.
    pub words: Vec<String>,
    /// The offers naming it, every version held whose field 1 names it.
    pub offers: Vec<Hash>,
    /// Its sales, each with its state. Empty: nobody signed onto it, and the
    /// vow carries no state (F240).
    pub sales: Vec<VowSale>,
    /// Payments that are purchases under an offer naming it whose buyer
    /// signed nothing the verifier holds (no payer's claim of their own, or
    /// a payer committed only as a bare key): money moved, nobody signed
    /// on, no state (F240, F193's stated cost).
    pub unsigned: Vec<Hash>,
}

impl<'a> AgreementsView<'a> {
    /// A held vow act of this verifier's Envelopes MIR, in its format,
    /// valid under Identity or not, with its decoded payload.
    fn vow_held(&self, id: &Hash) -> Option<(&'a Held, VowAct)> {
        let h = self.v.get(id)?;
        if h.inside.spec != self.mirs.envelopes || h.inside.type_ != crate::envelopes::types::VOW {
            return None;
        }
        Vow::decode(&h.inside, h.act.outside.signer.as_ref()).ok().map(|v| (h, v))
    }

    /// A held vow act, valid under Identity.
    fn vow_act(&self, id: &Hash) -> Option<(&'a Held, VowAct)> {
        self.vow_held(id).filter(|(h, _)| self.valid(&h.id))
    }

    /// What keeps an offer's `[3, vow]` from naming a vow, where the
    /// verifier holds the act it names: it is not a vow, or it is a later
    /// version, not the vow's name (F237: the genesis id is its name for
    /// good). An act not held is not judged, as for a publication; nor is a
    /// vow made void by its signer's rotation: a rotation voids the signer's
    /// own acts, never a name others wrote down (F237, correcting F230's
    /// cost), and the offer naming it stands, pointing at a void act,
    /// shown so by [`Self::vow`].
    pub(super) fn vow_name_problem(&self, name: &Hash) -> Option<String> {
        self.v.get(name)?;
        match self.vow_held(name) {
            None => Some("it names as a vow an act that is not one (F237)".into()),
            Some((_, v)) if v.follows.is_some() => Some("it names a later version of a vow: a vow is named by its genesis, for good (F237)".into()),
            Some(_) => None,
        }
    }

    /// The owner of a vow, where the verifier holds it as a vow's name (its
    /// genesis): its signer (F284, decided by Nobody, allegedly, 13 October
    /// 2026: "Somebody owns the vow"). Written as a holder of the terms of
    /// agreement `agreement`: null where the signer is the collective those
    /// terms found (S1), its identity otherwise. `None` where the verifier
    /// holds no vow by that name: an object it cannot tell is a vow is not
    /// judged, as for an offer's `[3, vow]`.
    pub(super) fn vow_owner(&self, name: &Hash, agreement: &Hash, t: &Terms) -> R<Option<Who>> {
        let Some((g, v)) = self.vow_held(name) else { return Ok(None) };
        if v.follows.is_some() {
            return Ok(None);
        }
        let Some(signer) = g.act.outside.signer else { return Ok(None) };
        if t.is_collective() && self.collective_of(agreement)? == Some(signer) {
            return Ok(Some(Who::This));
        }
        Ok(Some(Who::Id(signer)))
    }

    /// Agreements draft 13, rule 14 (new in draft 13, F284): a stake whose
    /// object is a vow is held by the vow's signer, wholly, in the version
    /// that first writes it: the founding terms, or a clone whose parent
    /// writes no stake in that vow. After that the stake moves as any stake
    /// does, by its holder's transfer, by succession, or by a version its
    /// holder signs (rules 10, 48, 89). What keeps terms `t` (agreement
    /// `id`, whose parent's terms are `parent`) from that, where the
    /// verifier holds the vow.
    pub(super) fn vow_stake_problem(&self, id: &Hash, t: &Terms, parent: Option<&Terms>) -> R<Option<String>> {
        for s in t.stakes.iter().flatten() {
            let Who::Id(name) = &s.object else { continue };
            if parent.is_some_and(|p| p.stake_on(&s.object).is_some()) {
                continue;
            }
            let Some(owner) = self.vow_owner(name, id, t)? else { continue };
            if s.holders != [(owner, crate::agreements::formats::MILLION)] {
                return Ok(Some(
                    "a stake in a vow is held by the vow's signer, wholly, in the version that first writes it: a deal made on a vow has an owner, and what is left after the overhead is the owner's (Agreements draft 13, rule 14; F284)".into(),
                ));
            }
        }
        Ok(None)
    }

    /// A vow, read (F237, F240): its chain, the offers naming it, and each
    /// sale with its state.
    pub fn vow(&self, name: &Hash) -> R<VowEval> {
        let (g, ga) = self.vow_held(name).ok_or(AgreementsError::Check("not a vow held"))?;
        let void = !self.valid(name);
        if ga.follows.is_some() {
            return Err(AgreementsError::Check("a later version of a vow: a vow is named by its genesis (F237)"));
        }
        let signer = g.act.outside.signer.ok_or(AgreementsError::Check("a vow has a signer"))?;
        // Its versions: the signer's vow acts naming the genesis as their
        // chain, each following a version of the same chain (mechanic, the
        // build's, as OF4 a reads an offer's).
        let mut later: Vec<(Hash, Hash)> = self
            .v
            .signed_by(&signer)
            .filter_map(|h| self.vow_act(&h.id).and_then(|(_, v)| v.follows.filter(|(f, _)| f == name).map(|(_, p)| (h.id, p))))
            .collect();
        let mut versions: Vec<Hash> = vec![*name];
        let mut previous: Vec<Hash> = vec![];
        loop {
            let before = versions.len();
            later.retain(|(x, p)| {
                if versions.contains(p) && x != p {
                    versions.push(*x);
                    previous.push(*p);
                    false
                } else {
                    true
                }
            });
            if versions.len() == before {
                break;
            }
        }
        let mut latest: Vec<Hash> = versions.iter().filter(|x| !previous.contains(x)).copied().collect();
        latest.sort();
        let words = latest.iter().filter_map(|x| self.vow_held(x).map(|(_, v)| v.vow.words)).collect();
        // The offers naming it, and the sales under them.
        let offers: Vec<Hash> = self
            .v
            .held_acts()
            .filter(|h| self.is_agreements(h, types::STANDING_OFFER))
            .filter(|h| Offer::decode(&h.inside).is_ok_and(|o| o.offer.sold.contains(&Sold::Vow(*name))))
            .map(|h| h.id)
            .collect();
        let mut sales: Vec<VowSale> = vec![];
        let mut unsigned: Vec<Hash> = vec![];
        let mut seen_payments: Vec<Vec<u8>> = vec![];
        for o in &offers {
            let Ok(oe) = self.offer(o) else { continue };
            if !oe.counts {
                continue;
            }
            // Paid: each payment following the offer that is a purchase.
            for x in self.v.held_acts().filter(|x| x.inside.spec == self.mirs.money) {
                let (fulfils, proof) = match crate::money::Payload::decode(x.inside.type_, &x.inside.payload) {
                    Ok(crate::money::Payload::Receipt(r)) => (r.fulfils, r.proof),
                    Ok(crate::money::Payload::Claim(c)) => (c.fulfils, c.proof),
                    _ => continue,
                };
                if &fulfils != o {
                    continue;
                }
                let payment = self.payment_of(&proof);
                if seen_payments.contains(&payment) {
                    continue;
                }
                if !matches!(self.purchase(&x.id), Ok(Some(PurchaseEval { verdict: PurchaseVerdict::Purchase, .. }))) {
                    continue;
                }
                seen_payments.push(payment);
                match self.committed_buyer(&proof) {
                    Some((claim, buyer)) => {
                        let state = self.sale_state(name, &buyer, &claim, Some(&proof));
                        let evidence = self.evidence_of(&claim);
                        sales.push(VowSale { act: claim, offer: *o, buyer, state, evidence });
                    }
                    None => unsigned.push(x.id),
                }
            }
            // Free: an offer at no price is signed onto by a signature act
            // naming it, by anyone other than its own side (mechanic, the
            // build's).
            if oe.offer.price.value == 0 && !oe.withdraws {
                let mut own: Vec<Hash> = vec![oe.signer];
                if let Some(p) = oe.offer.payee(&oe.signer) {
                    own.push(p);
                }
                if let Some(u) = &oe.offer.under {
                    if let Ok(t) = self.terms(u) {
                        own.extend(t.parties.iter().copied());
                    }
                    if let Ok(Some(c)) = self.collective_of(u) {
                        own.push(c);
                    }
                }
                for s in self.v.held_acts().filter(|s| self.is_agreements(s, types::SIGNATURE) && self.valid(&s.id)) {
                    let Some(buyer) = s.act.outside.signer else { continue };
                    if own.contains(&buyer) || decode_signature(&s.inside).ok() != Some(*o) || sales.iter().any(|x| x.offer == *o && x.buyer == buyer) {
                        continue;
                    }
                    let state = self.sale_state(name, &buyer, &s.id, None);
                    let evidence = self.evidence_of(&s.id);
                    sales.push(VowSale { act: s.id, offer: *o, buyer, state, evidence });
                }
            }
        }
        sales.sort_by(|a, b| a.act.cmp(&b.act));
        unsigned.sort();
        Ok(VowEval { name: *name, signer, void, versions, latest, words, offers, sales, unsigned })
    }

    /// The payer a payment's own commitment names, as F193 reads it: the
    /// signer of a payer's claim of that payment with the rail's answer,
    /// valid, on a rail binding the payer, its payer an identity; with that
    /// claim. `None` where no such claim is held, or the payer committed
    /// only a bare key.
    fn committed_buyer(&self, proof: &[u8]) -> Option<(Hash, Hash)> {
        use crate::money::{Payer, Payload as Fin};
        let mut claims = self.payers_claims(proof);
        claims.sort();
        claims.into_iter().find_map(|id| {
            let h = self.v.get(&id)?;
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return None };
            if self.rail_invalid.contains(&id) || self.unbound_rails.contains(&c.rail) {
                return None;
            }
            match c.payer(&h.act.outside.signer?) {
                Payer::Identity(b) => Some((id, b)),
                Payer::Key(_) => None,
            }
        })
    }

    /// Whether `x` is about the vow `name`: one of its versions, or a valid
    /// act naming it by its name, in `objects` or `refs` (mechanic, the
    /// build's), **except another vow naming it in `refs`**: a vow's
    /// reference to another vow is not an act about it, and moves none of
    /// its sales' states (Agreements draft 11, rule 13, reading (Q2)).
    fn about_vow(&self, name: &Hash, x: &Hash) -> bool {
        if let Some((_, v)) = self.vow_act(x) {
            if x == name || v.follows.is_some_and(|(f, _)| &f == name) {
                return true;
            }
            // Reading (Q2): a vow is about another only as its version.
            let Some(h) = self.v.get(x) else { return false };
            return self.valid(x)
                && h.inside.objects.iter().flatten().any(|o| &o.chain == name || &o.predecessor == name)
                && !h.inside.refs.iter().flatten().any(|r| r.act().as_ref() == Some(name));
        }
        let Some(h) = self.v.get(x) else { return false };
        self.valid(x)
            && (h.inside.objects.iter().flatten().any(|o| &o.chain == name || &o.predecessor == name)
                || h.inside.refs.iter().flatten().any(|r| r.act().as_ref() == Some(name)))
    }

    /// The evidence held beside the sale `sale` (draft 11, rule 13, F261,
    /// F264): valid acts naming it in their `refs`, ascending.
    fn evidence_of(&self, sale: &Hash) -> Vec<Hash> {
        let mut out: Vec<Hash> = self
            .v
            .held_acts()
            .filter(|h| h.id != *sale && self.valid(&h.id) && h.inside.refs.iter().flatten().any(|r| r.act().as_ref() == Some(sale)))
            .map(|h| h.id)
            .collect();
        out.sort();
        out
    }

    /// The acts that are the sale `sale` (draft 11, rule 13, F253): for a
    /// payment, every payer's claim of it, with the rail's answer, valid,
    /// whose payer is the buyer (F193's shape), any of which a contest may
    /// name (mechanic, the build's: one payment, one sale, whichever of the
    /// buyer's own claims of it is named); for a free sale, the buyer's
    /// signature act on the offer.
    fn sale_acts(&self, buyer: &Hash, sale: &Hash, proof: Option<&[u8]>) -> Vec<Hash> {
        use crate::money::{Payer, Payload as Fin};
        match proof {
            Some(proof) => self
                .payers_claims(proof)
                .into_iter()
                .filter(|id| {
                    let Some(h) = self.v.get(id) else { return false };
                    let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return false };
                    !self.rail_invalid.contains(id) && !self.unbound_rails.contains(&c.rail) && h.act.outside.signer.is_some_and(|s| c.payer(&s) == Payer::Identity(*buyer))
                })
                .collect(),
            None => vec![*sale],
        }
    }

    /// A sale's state (F237, F240; draft 11, rule 13, F253). Contested: a
    /// valid contest (type 14) the buyer signed naming **this sale** (field
    /// 0) and the vow (`[[vow, vow]]`), whatever promise its field 1 names,
    /// if any (reading (Q3)). Confirmed: for a payment, a payer's claim of
    /// that payment, as F193 reads the payer, acknowledging an act about
    /// the vow (the claim is the sale, so it names it); for a free sale, a
    /// valid act of the buyer's acknowledging both an act about the vow and
    /// the buyer's own signature act on the offer, the sale (draft 11, rule
    /// 13: "a confirmation likewise names the sale"; its reading, to
    /// confirm). An acknowledgement counts only alongside the act it names
    /// (Envelopes rule 4).
    fn sale_state(&self, name: &Hash, buyer: &Hash, sale: &Hash, proof: Option<&[u8]>) -> SaleState {
        let acts = self.sale_acts(buyer, sale, proof);
        let mut contests: Vec<Hash> = self
            .v
            .signed_by(buyer)
            .filter(|h| {
                self.is_agreements(h, types::CONTEST)
                    && self.valid(&h.id)
                    && Contest::decode(&h.inside).is_ok_and(|c| c.vow.as_ref() == Some(name) && acts.contains(&c.act))
            })
            .map(|h| h.id)
            .collect();
        if !contests.is_empty() {
            contests.sort();
            return SaleState::Contested { by: contests };
        }
        let acks_vow = |h: &Held| h.inside.acks.iter().flatten().any(|a| self.about_vow(name, a));
        let mut by: Vec<Hash> = match proof {
            Some(_) => acts.into_iter().filter(|id| self.v.get(id).is_some_and(acks_vow)).collect(),
            None => self
                .v
                .signed_by(buyer)
                .filter(|h| self.valid(&h.id) && acks_vow(h) && h.inside.acks.iter().flatten().any(|a| a == sale))
                .map(|h| h.id)
                .collect(),
        };
        if by.is_empty() {
            return SaleState::Pending;
        }
        by.sort();
        SaleState::Confirmed { by }
    }
}
