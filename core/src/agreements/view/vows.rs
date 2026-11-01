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
use crate::agreements::open_formats::{Sold};
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
    /// Whether this is a sale, or what state it is in, rests on whether two
    /// records whose payment is not stated are one payment (Money rule 12):
    /// unknown until the rail's answer is given.
    Unknown,
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
    /// Payments whose place among the sales or the unsigned rests on
    /// whether two records whose payment is not stated are one payment
    /// (Money rule 12): unknown until the rail's answer is given.
    pub unknown: Vec<Hash>,
}

impl<'a> AgreementsView<'a> {
    /// A held vow act of this verifier's Envelopes MIR, in its format,
    /// valid under Identity or not, with its decoded payload.
    fn vow_held(&self, id: &Hash) -> Option<(&'a Held, VowAct)> {
        let h = self.v.get(id)?;
        if h.inside.spec != self.mirs.envelopes || h.inside.type_ != crate::envelopes::types::VOW {
            return None;
        }
        // A collective's vow cites its chain, named by its identity: the
        // collective the act names (rule 58), else its signer.
        Vow::decode(&h.inside, self.author(h).as_ref()).ok().map(|v| (h, v))
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
        // A collective's vow is drawn by a member naming it (rule 58).
        let Some(signer) = self.author(g) else { return Ok(None) };
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
            // An ownership agreement on a claim of a vow's name gives the
            // vow's signer the whole stake at its founding (rule 14).
            let Some(name) = self.target_work(t) else { continue };
            if parent.is_some() {
                continue;
            }
            let Some(owner) = self.vow_owner(&name, id, t)? else { continue };
            if s.holders != [(owner, crate::agreements::formats::MILLION)] {
                return Ok(Some(
                    "a stake in a vow is held by the vow's signer, wholly, in the version that first writes it: a deal made on a vow has an owner, and what is left after the overhead is the owner's (Agreements draft 13, rule 14; F284)".into(),
                ));
            }
        }
        Ok(None)
    }

    /// A vow, read (F237, F240): its chain, the offers naming it, and each
    /// sale with its state. Where the vow depends on whether one pair of
    /// records whose payment is not stated are one payment, a sale that
    /// depends on it is marked [`SaleState::Unknown`], and such an unsigned
    /// payment is listed in `unknown`; every other sale and payment stands.
    /// Where it depends on two or more such pairs, the vow is unknown
    /// ([`AgreementsError::PaymentUnstated`]; Money rule 12; F381, F383).
    ///
    /// Read fail-closed ([`Self::answered`]): a receipt or claim counts
    /// toward a sale only with the rail's answer, valid; a sale or payment
    /// that rests on one whose answer is pending or not held is marked so
    /// in the same way (Money rules 8 and 10).
    pub fn vow(&self, name: &Hash) -> R<VowEval> {
        match self.two_ways(|| self.vow_answered(name)) {
            Ways::One(a) => a,
            Ways::Both(Ok(a), Ok(b)) => Ok(Self::vow_both(a, b)),
            Ways::Both(Err(e), Err(f)) if e == f => Err(e),
            _ => Err(AgreementsError::PaymentUnstated),
        }
    }

    fn vow_answered(&self, name: &Hash) -> R<VowEval> {
        match self.answered(|| self.vow_unjudged(name)) {
            Answered::One(a) => a,
            Answered::Both(Ok(a), Ok(b)) => Ok(Self::vow_both(a, b)),
            Answered::Both(Err(e), Err(f)) if e == f => Err(e),
            // Fable's bound (Money rule 8): a vow's sales are one list, and
            // two or more records not yet verified leave it unknown.
            _ => Err(AgreementsError::RailUnanswered),
        }
    }

    /// A vow read two ways: each sale found alike both ways stands, any
    /// other is marked [`SaleState::Unknown`]; a payment signed by nobody
    /// both ways stands, one found so only one way is unknown.
    fn vow_both(mut a: VowEval, b: VowEval) -> VowEval {
        let mut sales: Vec<VowSale> = vec![];
        for x in a.sales.iter().chain(b.sales.iter()) {
            if sales.iter().any(|y| y.act == x.act) {
                continue;
            }
            let both = a.sales.contains(x) && b.sales.contains(x);
            sales.push(if both { x.clone() } else { VowSale { state: SaleState::Unknown, ..x.clone() } });
        }
        sales.sort_by(|p, q| p.act.cmp(&q.act));
        let unsigned: Vec<Hash> = a.unsigned.iter().filter(|x| b.unsigned.contains(x)).copied().collect();
        let mut unknown: Vec<Hash> =
            a.unsigned.iter().chain(b.unsigned.iter()).filter(|x| !unsigned.contains(x)).chain(a.unknown.iter()).chain(b.unknown.iter()).copied().collect();
        unknown.sort();
        unknown.dedup();
        a.sales = sales;
        a.unsigned = unsigned;
        a.unknown = unknown;
        a
    }

    fn vow_unjudged(&self, name: &Hash) -> R<VowEval> {
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
            .filter(|h| self.pub_act(&h.id).is_some_and(|(_, a)| a.publication.sold.iter().flatten().any(|x| x == &Sold::Vow(*name))))
            .map(|h| h.id)
            .collect();
        let mut sales: Vec<VowSale> = vec![];
        let mut unsigned: Vec<Hash> = vec![];
        let mut seen_payments: Vec<(Hash, Payment)> = vec![];
        for o in &offers {
            let Ok(oe) = self.publication(o) else { continue };
            if !oe.counts || oe.ends {
                continue;
            }
            // Paid: each payment of a tag under the publication that is a
            // purchase.
            let tagged = |f: &Hash| self.tag_of(f).is_some_and(|(_, t)| t.priced == crate::money::Priced::Publication(oe.first));
            for x in self.v.held_acts().filter(|x| x.inside.spec == self.mirs.money) {
                let (fulfils, proof) = match crate::money::Payload::decode(x.inside.type_, &x.inside.payload) {
                    Ok(crate::money::Payload::Receipt(r)) => (r.fulfils, r.proof),
                    Ok(crate::money::Payload::Claim(c)) => (c.fulfils, c.proof),
                    _ => continue,
                };
                if !tagged(&fulfils) {
                    continue;
                }
                let payment = (x.id, self.record_payment(&x.id, &proof));
                if seen_payments.iter().any(|(_, p)| self.same_payment_as(p, &payment.1)) {
                    continue;
                }
                // Whether it is a purchase may rest on a payment or a rail
                // answer not stated: the vow's answer rests on it too.
                match self.purchase(&x.id) {
                    Ok(Some(PurchaseEval { verdict: PurchaseVerdict::Purchase, .. })) => {}
                    Err(e @ (AgreementsError::PaymentUnstated | AgreementsError::RailUnanswered)) => return Err(e),
                    _ => continue,
                }
                seen_payments.push(payment);
                // A purchase paid through a route: the sale is the first
                // payer's, by their claim of the first hop citing the tag
                // (Money rule 24; rule 13); a later claim of theirs of that
                // hop confirms it.
                match self.route_buyer(&x.id) {
                    super::RouteBuyer::FirstPayer { payer, claim } => {
                        let first_proof = self.hop_record(&claim).map(|r| r.proof).unwrap_or_default();
                        let state = self.sale_state(name, &payer, &claim, Some((&claim, &first_proof)));
                        let evidence = self.evidence_of(&claim);
                        sales.push(VowSale { act: claim, offer: *o, buyer: payer, state, evidence });
                        continue;
                    }
                    super::RouteBuyer::Unknown => return Err(AgreementsError::RailUnanswered),
                    _ => {}
                }
                match self.committed_buyer(&x.id, &proof) {
                    Some((claim, buyer)) => {
                        let state = self.sale_state(name, &buyer, &claim, Some((&x.id, &proof)));
                        let evidence = self.evidence_of(&claim);
                        sales.push(VowSale { act: claim, offer: *o, buyer, state, evidence });
                    }
                    None => unsigned.push(x.id),
                }
            }
            // Free: a publication with no price tag is signed onto by a
            // signature act naming it, by anyone other than its own side.
            if !self.priced(&oe.first) {
                let own = self.offer_side(&oe);
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
        Ok(VowEval { name: *name, signer, void, versions, latest, words, offers, sales, unsigned, unknown: vec![] })
    }

    /// The offer's own side, who cannot sign onto it (rule 13): its signer,
    /// its payee, the parties of the agreement it names and the collective
    /// that agreement founds (mechanic, the build's).
    fn offer_side(&self, oe: &PublicationEval) -> Vec<Hash> {
        let mut own: Vec<Hash> = vec![oe.drafter];
        own.extend(oe.parties.iter().copied());
        if let Some(u) = &oe.publication.owners {
            if let Ok(v) = self.version_in_force(u) {
                if let Ok(t) = self.terms(&v) {
                    own.extend(t.parties.iter().copied());
                }
            }
            if let Ok(Some(c)) = self.collective_of(u) {
                own.push(c);
            }
        }
        own
    }

    /// Whether a publication's line has a counting price tag with a price
    /// (rule 13: a publication with no price tag is signed onto for free).
    fn priced(&self, first: &Hash) -> bool {
        self.v.held_acts().any(|h| {
            self.tag_of(&h.id).is_some_and(|(_, t)| t.priced == crate::money::Priced::Publication(*first) && !t.withdrawn())
                && matches!(self.tag_under(&h.id), Ok(TagUnder::Counts { withdrawn: false, .. }))
        })
    }

    /// The buyer of the purchase `act` names, where `act` is one (F386,
    /// Agreements, "Contest (type 14)"): a payer's claim of a payment that
    /// is a purchase (rule 12), held, valid, with the rail's answer, on a
    /// rail binding the payer, its payer an identity (as F193 reads a sale's
    /// buyer), the buyer being that payer; or a valid signature act naming
    /// an offer at no price that counts and sells something, by anyone
    /// other than the offer's own side, the buyer being its signer (rule
    /// 13's sign-on). `None` for anything else.
    fn purchase_buyer(&self, act: &Hash) -> R<Option<Hash>> {
        use crate::money::{Payer, Payload as Fin};
        let Some(h) = self.v.get(act) else { return Ok(None) };
        let Some(signer) = h.act.outside.signer else { return Ok(None) };
        if !self.valid(act) {
            return Ok(None);
        }
        if h.inside.spec == self.mirs.money {
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return Ok(None) };
            // A purchase paid through a route: its buyer is the route's
            // first payer, by their claim of the first hop naming the tag
            // the purchase names (Money rule 24; "A contest of a purchase").
            if let Some(b) = self.route_claim_buyer(act)? {
                return Ok(b);
            }
            if !self.rail_counts(act) || !self.rail_binds(&c.rail, crate::development::Bound::Purpose) {
                return Ok(None);
            }
            // A payer who committed only a one-time key has standing by a
            // claim carrying that key's signature (key 8): the buyer is that
            // claim's signer (rule 13; "A contest of a purchase").
            let buyer = match c.payer(&signer) {
                Payer::Identity(b) => b,
                Payer::Key(_) => signer,
            };
            return Ok(match self.purchase_unjudged(act)? {
                Some(PurchaseEval { verdict: PurchaseVerdict::Purchase, .. }) => Some(buyer),
                _ => None,
            });
        }
        if !self.is_agreements(h, types::SIGNATURE) {
            return Ok(None);
        }
        let Ok(o) = decode_signature(&h.inside) else { return Ok(None) };
        let Ok(oe) = self.publication(&o) else { return Ok(None) };
        if !oe.counts || oe.ends || oe.publication.sold.as_ref().is_none_or(|s| s.is_empty()) || self.priced(&oe.first) || self.offer_side(&oe).contains(&signer) {
            return Ok(None);
        }
        Ok(Some(signer))
    }

    /// The contests shown beside the purchase `purchase` names (F386,
    /// Agreements rule 54, "Contest (type 14)"): valid contests (type 14)
    /// naming it in field 0 and as chain and predecessor, `[[purchase,
    /// purchase]]`, whatever promise their field 1 names in words, signed by
    /// the purchase's buyer, ascending. A contest voids nothing and moves
    /// nothing: no payment, refund, delivery or verdict. Signed by anyone
    /// else, it shows nothing; for an act that is no purchase, none shows.
    /// Unknown ([`AgreementsError::PaymentUnstated`]) only where whether it
    /// is a purchase depends on two or more pairs of records whose payment
    /// is not stated (Money rule 12).
    pub fn purchase_contests(&self, purchase: &Hash) -> R<Vec<Hash>> {
        let buyer = match self.two_ways(|| match self.answered(|| self.purchase_buyer(purchase)) {
            Answered::One(b) => b,
            Answered::Both(Ok(a), Ok(b)) if a == b => Ok(a),
            Answered::Both(Err(e), Err(f)) if e == f => Err(e),
            _ => Err(AgreementsError::RailUnanswered),
        }) {
            Ways::One(b) => b?,
            Ways::Both(Ok(a), Ok(b)) if a == b => a,
            Ways::Both(Err(e), Err(f)) if e == f => return Err(e),
            _ => return Err(AgreementsError::PaymentUnstated),
        };
        let Some(buyer) = buyer else { return Ok(vec![]) };
        let mut out: Vec<Hash> = self
            .v
            .signed_by(&buyer)
            .filter(|h| {
                self.is_agreements(h, types::CONTEST)
                    && self.valid(&h.id)
                    && Contest::decode(&h.inside).is_ok_and(|c| c.vow.is_none() && &c.act == purchase)
            })
            .map(|h| h.id)
            .collect();
        out.sort();
        Ok(out)
    }

    /// The payer a payment's own commitment names, as F193 reads it: the
    /// signer of a payer's claim of that payment with the rail's answer,
    /// valid, on a rail binding the payer, its payer an identity; with that
    /// claim. `None` where no such claim is held, or the payer committed
    /// only a bare key.
    fn committed_buyer(&self, record: &Hash, proof: &[u8]) -> Option<(Hash, Hash)> {
        use crate::money::{Payer, Payload as Fin};
        let mut claims = self.claims_of_payment((Some(record), proof), |id| self.rail_counts(id));
        // A claim with the rail's answer, valid, names the sale first, so
        // that a claim whose answer is not held moves only the sale's state.
        claims.sort_by_key(|id| (!self.rail_valid.contains_key(id), *id));
        claims.into_iter().find_map(|id| {
            let h = self.v.get(&id)?;
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return None };
            if !self.rail_binds(&c.rail, crate::development::Bound::Purpose) {
                return None;
            }
            let signer = h.act.outside.signer?;
            match c.payer(&signer) {
                Payer::Identity(b) => Some((id, b)),
                // A one-time key's claim carrying its signature (key 8):
                // the buyer is the claim's signer, standing for the key.
                Payer::Key(_) => Some((id, signer)),
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
    fn sale_acts(&self, buyer: &Hash, sale: &Hash, proof: Option<(&Hash, &[u8])>) -> Vec<Hash> {
        use crate::money::{Payer, Payload as Fin};
        // The payer the sale is of: an identity, or the one-time key its
        // claim carries (key 8), whose every claim of the payment is theirs.
        let payer_of = |h: &Held| -> Option<Payer> {
            let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return None };
            Some(c.payer(&h.act.outside.signer?))
        };
        let want = self.v.get(sale).and_then(payer_of).unwrap_or(Payer::Identity(*buyer));
        match proof {
            Some((record, proof)) => self
                .claims_of_payment((Some(record), proof), |id| self.rail_counts(id))
                .into_iter()
                .filter(|id| {
                    let Some(h) = self.v.get(id) else { return false };
                    let Ok(Fin::Claim(c)) = Fin::decode(h.inside.type_, &h.inside.payload) else { return false };
                    self.rail_binds(&c.rail, crate::development::Bound::Purpose) && h.act.outside.signer.is_some_and(|s| c.payer(&s) == want)
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
    fn sale_state(&self, name: &Hash, buyer: &Hash, sale: &Hash, proof: Option<(&Hash, &[u8])>) -> SaleState {
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
