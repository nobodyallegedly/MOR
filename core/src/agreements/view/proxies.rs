//! Proxies (Agreements draft 14, rule 97; F327): a holder's vote on the
//! owners' matters of one stake, handed to a proxy identity, within the
//! fence.

use super::*;
use crate::agreements::control::{ActKind, ProxyFacts, ProxyRead};

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
                return self.proxy_decides(ag, &ProxyFacts { own_vote: true, latest: None }, k, by);
            }
        }
        let lineage: Vec<Hash> = self.lineage(ag)?.into_iter().map(|(v, _)| v).collect();
        // The model's own acts, of its specification (rule 99).
        let Some(cmip) = self.terms(ag)?.control.map(|c| c.cmip) else { return Ok(false) };
        let Some((_, model)) = self.control.iter().find(|(h, _)| *h == cmip) else {
            return Err(AgreementsError::Missing(cmip));
        };
        // Every proxy of `h` on the stake the line placed, with where.
        let mut placed: Vec<(&'a Held, ProxyRead, Vec<&'a Held>)> = vec![];
        for x in self.v.signed_by(h) {
            if self.model_kind(Some(&cmip), x) != Some(ActKind::Proxy) || !self.kept_at(col, x, at)? {
                continue;
            }
            let Ok(p) = model.read_proxy(&x.inside) else { continue };
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
        let latest = match placed.iter().find(|(_, _, pa)| placed.iter().all(|(_, _, pb)| std::ptr::eq(pa, pb) || later(pa, pb))) {
            None => None,
            Some((x, p, _)) => {
                // Revoked by a revocation of the holder's, placed before the line.
                let mut revoked = false;
                for r in self.v.signed_by(h) {
                    if self.model_kind(Some(&cmip), r) == Some(ActKind::Revocation)
                        && model.read_revocation(&r.inside).ok() == Some(x.id)
                        && self.kept_at(col, r, at)?
                        && self.placed_by_line(col, r, at)?
                    {
                        revoked = true;
                        break;
                    }
                }
                Some((p.clone(), revoked))
            }
        };
        self.proxy_decides(ag, &ProxyFacts { own_vote: false, latest }, k, by)
    }

    /// The model's answer (its rule 97) on the line's facts.
    fn proxy_decides(&self, ag: &Hash, facts: &ProxyFacts, k: &Hash, by: &BTreeMap<Hash, Hash>) -> R<bool> {
        let Some(c) = self.terms(ag)?.control else { return Ok(false) };
        let Some((_, m)) = self.control.iter().find(|(h, _)| *h == c.cmip) else {
            return Err(AgreementsError::Missing(c.cmip));
        };
        Ok(m.proxy_votes(facts, k, &|p| by.contains_key(p)))
    }
}
