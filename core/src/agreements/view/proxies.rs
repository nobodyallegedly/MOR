//! Proxies (Agreements draft 14, rule 97; F327): a holder's vote on the
//! owners' matters of one stake, handed to a proxy identity, within the
//! fence.

use super::*;
use crate::agreements::owners::{decode_proxy_revocation, owner_types, Proxy};

impl<'a> AgreementsView<'a> {
    /// Whether holder `h`'s vote under stake `stake`'s holders' rule on the
    /// version `k` (a clone of `ag`) is cast by its proxy, at line `at` (rule
    /// 97; new in draft 14, F327): the holder placed no signature act on `k`
    /// at or before `at` (its own vote beats the proxy's; G5); its latest
    /// proxy on the stake that the collective's line placed before `at`
    /// names `k` or is standing, and
    /// no revocation of it was placed before `at`; and the proxy's signature
    /// act on `k` is among those the line names (`by`). The proxy act counts
    /// only signed by a holder of the stake at its placement, naming
    /// another, public or sealed to the collective. Only the counting of a
    /// stake's holders' rule by share asks this (the fence): never what
    /// needs every holder, a holder's own signature, its money or its
    /// property.
    #[allow(clippy::too_many_arguments)]
    pub(super) fn proxy_votes(&self, col: &Col, at: Line<'a>, ag: &Hash, k: &Hash, stake: u64, h: &Hash, by: &BTreeMap<Hash, Hash>) -> R<bool> {
        // The holder's own vote beats the proxy's where the line reaches it:
        // placed at or before the line (new in draft 14, Fable's aggregated
        // review, G5); one named by the line is the holder's own vote.
        for s in self.v.signed_by(h) {
            if self.is_agreements(s, types::SIGNATURE) && decode_signature(&s.inside).ok() == Some(*k) && self.sig_before(col, s, at)? {
                return Ok(false);
            }
        }
        let lineage: Vec<Hash> = self.lineage(ag)?.into_iter().map(|(v, _)| v).collect();
        // Every proxy of `h` on the stake the line placed, with where.
        let mut placed: Vec<(&'a Held, Proxy, Vec<&'a Held>)> = vec![];
        for x in self.v.signed_by(h) {
            if !self.is_agreements(x, owner_types::PROXY) || !self.kept_at(col, x, at)? {
                continue;
            }
            let Ok(p) = Proxy::decode(&x.inside) else { continue };
            if p.stake != stake || !lineage.contains(&p.version) || p.proxy == *h {
                continue;
            }
            if !(x.act.outside.content_key.is_some() || x.act.outside.to.iter().flatten().any(|q| *q == col.id)) {
                continue;
            }
            let places = self.placing_acts(col, x, at)?;
            let Some(first) = places.first() else { continue };
            // A holder of the stake where the line placed it.
            if !self.roster_at(col, Line::Record(first), &p.version, stake)?.iter().any(|(x, n)| x == h && *n > 0) {
                continue;
            }
            placed.push((x, p, places));
        }
        // The latest so placed replaces the others (one proxy per owner per
        // stake at a time): placed after every other.
        let later = |a: &[&'a Held], b: &[&'a Held]| a.iter().any(|x| b.iter().all(|y| self.before_struct(col, y, Line::Record(x))));
        let Some((x, p, _)) = placed.iter().find(|(_, _, pa)| placed.iter().all(|(_, _, pb)| std::ptr::eq(pa, pb) || later(pa, pb))) else {
            return Ok(false);
        };
        if p.scoped.is_some_and(|v| v != *k) {
            return Ok(false);
        }
        // Revoked by a revocation of the holder's, placed before the line.
        for r in self.v.signed_by(h) {
            if self.is_agreements(r, owner_types::PROXY_REVOCATION)
                && decode_proxy_revocation(&r.inside).ok() == Some(x.id)
                && self.kept_at(col, r, at)?
                && self.placed_by_line(col, r, at)?
            {
                return Ok(false);
            }
        }
        Ok(by.contains_key(&p.proxy))
    }
}
