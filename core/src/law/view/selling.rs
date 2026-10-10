//! The selling side of step 12b, read from what a verifier holds: a
//! standing offer judged (who signed it, who it pays, which version of its
//! chain is the latest), the object a purchase under it paid for, and a
//! receipt a split service's grant key may sign under it (H5's reading 4,
//! lifted).

use super::*;
use crate::law::open_formats::{Offer, OfferAct, Paid, Sold};

/// A standing offer, judged (Law type 6, rule 32; step 12b).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OfferEval {
    pub id: Hash,
    pub offer: Offer,
    /// `(first, previous)` for a later version of an offer (OF4 a).
    pub follows: Option<(Hash, Hash)>,
    pub signer: Hash,
    /// Whether it counts as an offer of the agreement it names, or, for a
    /// lone seller, as the agreement between seller and buyer (F215): no
    /// entry in `problems`.
    pub counts: bool,
    /// What keeps it from counting.
    pub problems: Vec<String>,
    /// In a deal, the parties whose signature (the offer's own, or a
    /// signature act naming it) is missing (OF3 a): while any is, the offer
    /// is outside the claiming agreement (rule 15b), shown so.
    pub unsigned: Vec<Hash>,
    /// The tips of its chain (OF4 a): the latest versions held. One in the
    /// ordinary case; two or more is a fork of the seller's, its alarm, and
    /// a purchase under any version counts (F186's reading, Fable's).
    pub latest: Vec<Hash>,
    /// Whether this version withdraws the offer (sells nothing).
    pub withdraws: bool,
}

impl<'a> LawView<'a> {
    /// A held standing offer with its decoded payload.
    pub(super) fn offer_act(&self, id: &Hash) -> Option<(&'a Held, OfferAct)> {
        let h = self.v.get(id)?;
        if !self.is_law(h, types::STANDING_OFFER) {
            return None;
        }
        Offer::decode(&h.inside).ok().map(|o| (h, o))
    }

    /// The payees of an agreement naming a split service (rule 18): in a
    /// deal, the grantors of field 14's grants (F129, H4); in a collective,
    /// the collective. `None` where it names none (payer-side splitting).
    fn payees_of(&self, agreement: &Hash, t: &Terms) -> R<Option<Vec<Hash>>> {
        if t.split_grant.is_some() {
            return Ok(Some(self.collective_of(agreement)?.into_iter().collect()));
        }
        let Some(gs) = &t.payee_grants else { return Ok(None) };
        Ok(Some(gs.iter().filter_map(|g| self.v.get(g)).filter(|g| self.is_law(g, types::GRANT)).filter_map(|g| g.act.outside.signer).collect()))
    }

    /// A standing offer, judged (rule 32; step 12b). Checks, each from a
    /// decision: valid under Identity; public (F215: an offer is always
    /// public); under co-owners' agreement (field 0), in a deal signed by
    /// every party, by the offer itself and signature acts naming it (OF3 a,
    /// F107), in a collective an act of the collective that counts (rule
    /// 35a); who is paid (field 3) fits the agreement: a payee its field 14
    /// lists where it names a split service, the stakes where it names none
    /// (review 2.1 to 2.3); for a lone seller, the payee is the signer, or
    /// one who signed a signature act accepting the offer (Finance rule 14,
    /// F168 item 13); a deadline needs the agreement's time reference (rule
    /// 33).
    pub fn offer(&self, id: &Hash) -> R<OfferEval> {
        let h = self.held(id)?;
        if !self.is_law(h, types::STANDING_OFFER) {
            return Err(LawError::Check("not a standing offer"));
        }
        let OfferAct { offer, follows } = Offer::decode(&h.inside)?;
        let signer = h.act.outside.signer.ok_or(LawError::Check("an offer has a signer"))?;
        let mut problems: Vec<String> = vec![];
        let mut unsigned: Vec<Hash> = vec![];
        if !self.valid(id) {
            problems.push("it is not valid under Identity".into());
        }
        if h.act.outside.content_key.is_none() {
            problems.push("an offer is always public (F215): this one is sealed".into());
        }
        if let Some((first, prev)) = follows {
            match (self.offer_act(&first), self.offer_act(&prev)) {
                (Some((fh, fo)), Some((ph, _))) if fo.follows.is_none() && fh.act.outside.signer == Some(signer) && ph.act.outside.signer == Some(signer) => {
                    if fo.offer.under != offer.under {
                        problems.push("a later version of an offer stays under the agreement its first version names (mechanic, the build's)".into());
                    }
                }
                _ => problems.push("a later version names its first offer and the previous version, both its signer's (OF4 a)".into()),
            }
        }
        match &offer.under {
            Some(ag) => {
                let t = match self.terms(ag) {
                    Ok(t) => t,
                    Err(_) => {
                        problems.push("the agreement it is made under is not held".into());
                        return Ok(OfferEval { id: *id, offer, follows, signer, counts: false, problems, unsigned, latest: vec![], withdraws: false });
                    }
                };
                if t.is_collective() {
                    // Whether the collective's offer is its own act is its
                    // consent's (rule 35a), shown beside; a purchase under it
                    // is settled by the collective's chain recording the
                    // sale (W2).
                    if self.collective_of(ag)? != Some(signer) {
                        problems.push("a collective's offer is the collective's own act (rule 35a)".into());
                    }
                } else {
                    // OF3 (a), taken under the delegation (F107): every party.
                    let signed = self.signers(id, &t.parties);
                    unsigned = t.parties.iter().filter(|p| **p != signer && !signed.contains(p)).copied().collect();
                    if !t.parties.contains(&signer) {
                        problems.push("an offer under a deal is signed by its parties (OF3 a)".into());
                    }
                    if !unsigned.is_empty() {
                        problems.push("not every party of the deal has signed it: outside the claiming agreement (OF3 a; rule 15b)".into());
                    }
                }
                match (self.payees_of(ag, &t)?, &offer.paid) {
                    (Some(payees), Some(Paid::Payee(p))) if payees.contains(p) => {}
                    (Some(_), _) => problems.push(
                        "the agreement names a split service: the offer pays one of its payees, a payee its field 14 lists, or the collective (review 2.2; rule 18)".into(),
                    ),
                    (None, Some(Paid::ByStakes)) => {}
                    (None, _) => problems.push(
                        "the agreement names no split service: the offer is paid by the stakes, each holder's own pointer (review 2.1; rule 18, F124 P2)".into(),
                    ),
                }
                if offer.until.is_some() && t.time.is_none() && t.cmip(TIME_REFERENCE_TASK).is_none() {
                    problems.push("its deadline is a point on the agreement's time reference, which names none (rule 33)".into());
                }
            }
            None => {
                // F215: a lone seller's offer is the agreement with the
                // buyer. Its payee is the signer, or one who accepted it by a
                // signature act (Finance rule 14, F168 item 13; review 2.3).
                if let Some(Paid::Payee(p)) = &offer.paid {
                    if *p != signer && self.signers(id, &[*p]).is_empty() {
                        problems.push("the identity it pays has not accepted it by a signature act: an offer another identity signed is not the payee's act (Finance rule 14; review 2.3)".into());
                    }
                }
            }
        }
        let first = follows.map(|(f, _)| f).unwrap_or(*id);
        let latest = self.offer_tips(&first, &signer);
        let counts = problems.is_empty();
        let withdraws = offer.withdraws();
        Ok(OfferEval { id: *id, offer, follows, signer, counts, problems, unsigned, latest, withdraws })
    }

    /// The tips of an offer chain (OF4 a): the versions by `signer` naming
    /// `first` as their chain that no other such version names as its
    /// previous; `first` itself where none follows it.
    fn offer_tips(&self, first: &Hash, signer: &Hash) -> Vec<Hash> {
        let mut versions: Vec<(Hash, Hash)> = vec![];
        for h in self.v.signed_by(signer) {
            if let Some((_, o)) = self.offer_act(&h.id) {
                if let Some((f, p)) = o.follows {
                    if &f == first && self.valid(&h.id) {
                        versions.push((h.id, p));
                    }
                }
            }
        }
        let mut all: Vec<Hash> = vec![*first];
        all.extend(versions.iter().map(|(x, _)| *x));
        let mut tips: Vec<Hash> = all.into_iter().filter(|x| !versions.iter().any(|(_, p)| p == x)).collect();
        tips.sort();
        tips
    }

    /// The locked media an offer sells: each publication's (Envelope,
    /// publication field 2), for a relay's delivery record (rule 22, F184;
    /// Fable's 4b): the object a purchase under the offer paid for is any
    /// of them (mechanic, the build's). Access sells no object the core can
    /// read.
    pub(super) fn offer_media(&self, offer: &Hash) -> Vec<Hash> {
        let Some((_, o)) = self.offer_act(offer) else { return vec![] };
        o.offer
            .sold
            .iter()
            .filter_map(|s| match s {
                Sold::Publication(p) => self.publication_field(p, 2),
                Sold::Access(..) => None,
            })
            .collect()
    }

    /// A publication's field `k` (1, its work hash; 2, its locked media),
    /// where `p` is a held publication (Envelope type 0).
    pub(super) fn publication_field(&self, p: &Hash, k: u64) -> Option<Hash> {
        let x = self.v.get(p)?;
        if x.inside.spec != self.mips.envelope || x.inside.type_ != 0 {
            return None;
        }
        x.inside.payload.iter().find_map(|(kk, v)| match (kk, v) {
            (crate::cbor::Value::Uint(n), crate::cbor::Value::Bytes(b)) if *n == k => b.as_slice().try_into().ok(),
            _ => None,
        })
    }

    /// The work a payment following an offer is for: the work hash of a
    /// publication it sells (the first held).
    pub(super) fn offer_work(&self, offer: &Hash) -> Option<Hash> {
        let (_, o) = self.offer_act(offer)?;
        o.offer.sold.iter().find_map(|s| match s {
            Sold::Publication(p) => self.publication_field(p, 1),
            Sold::Access(..) => None,
        })
    }

    /// What keeps a receipt a split service's grant key signs following an
    /// offer from being backed (H5's reading 4, lifted by step 12b): the
    /// offer's payee is the grantor, and its field 0 is one of the
    /// grantor's own claims (`own`: in a deal, a version of the deal).
    pub(super) fn offer_receipt_problem(&self, fulfils: &Hash, grantor: &Hash, own: &[Hash]) -> Option<Option<String>> {
        let (h, o) = self.offer_act(fulfils)?;
        let signer = h.act.outside.signer?;
        let ok = o.offer.under.is_some_and(|u| own.contains(&u)) && o.offer.payee(&signer).as_ref() == Some(grantor);
        Some((!ok).then(|| {
            "a split service's grant key signs a receipt following an offer only where the offer pays its grantor, under the grantor's own claim (H5; step 12b)".to_string()
        }))
    }
}
