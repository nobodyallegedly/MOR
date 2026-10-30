//! The publication read from what a verifier holds (Agreements rules 11 to
//! 17): a publication judged (who signed it, which version is the latest,
//! whether it ends), the price tags it counts, a purchase by its tag, and
//! the owners' shares read by reference from the version a receipt names.

use super::*;
use crate::agreements::open_formats::Sold;
use crate::agreements::publication::{Publication, PublicationAct};
use crate::money::{self as fin, Payload as Fin, Priced};

/// What a client pays against ([`AgreementsView::publication_tip`]): the
/// publication's latest versions (two or more: the parties' fork, shown),
/// the latest version of each price tag line that counts under it, and the
/// ownership agreement it names with its latest version.
#[derive(Clone, Debug)]
pub struct PublicationTip {
    pub latest: Vec<Hash>,
    pub tags: Vec<Hash>,
    pub owners: Option<(Hash, Hash)>,
}

/// A publication, judged (Agreements type 6, rule 11).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PublicationEval {
    pub id: Hash,
    pub publication: Publication,
    /// `(first, previous)` for a later version.
    pub follows: Option<(Hash, Hash)>,
    /// Its line: its first version.
    pub first: Hash,
    /// Its drafter, who signs by drafting it.
    pub drafter: Hash,
    /// Its parties: the owners' side (the ownership agreement's line, the
    /// collective whose agreement it is, or the drafter), each partner, the
    /// split service and each backup.
    pub parties: Vec<Hash>,
    /// The parties that have not signed it.
    pub unsigned: Vec<Hash>,
    /// Whether it counts: no entry in `problems`.
    pub counts: bool,
    pub problems: Vec<String>,
    /// The tips of its line held (the latest versions); two or more is a
    /// fork of its parties', shown.
    pub latest: Vec<Hash>,
    /// Whether this version ends the publication (sells nothing).
    pub ends: bool,
    /// The ownership agreements claiming what it sells under whose line it
    /// is not made (rule 14): it visibly contradicts them, and stays valid.
    pub outside_claims: Vec<Hash>,
}

/// Whether a price tag counts under its publication (Money rule 18;
/// Agreements rule 12), as Agreements read it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum TagUnder {
    /// It counts: signed by the publication's split service or its
    /// designated party; `withdrawn` where this version carries no price.
    Counts { publication: Hash, withdrawn: bool },
    /// Nobody's offer under the publication.
    Nobodys(String),
    /// Not known to this verifier.
    Unknown(String),
}

impl<'a> AgreementsView<'a> {
    /// A held publication with its decoded payload.
    pub(super) fn pub_act(&self, id: &Hash) -> Option<(&'a Held, PublicationAct)> {
        let h = self.v.get(id)?;
        if !self.is_agreements(h, types::PUBLICATION) {
            return None;
        }
        Publication::decode(&h.inside).ok().map(|p| (h, p))
    }

    /// The ownership agreement a split's publication names (its founding
    /// version), where held.
    pub(super) fn split_owners(&self, s: &Split) -> Option<Hash> {
        self.pub_act(&s.publication).and_then(|(_, a)| a.publication.owners)
    }

    /// The owners' side of a publication as a party: the collective whose
    /// own agreement the publication names (it signs by its identity), the
    /// line of a work's ownership agreement (it signs as rule 15 says), or,
    /// naming none, its drafter. *Open (question to Nobody, allegedly):
    /// rule 14 has a vow's signer sign as the owners' side of a publication
    /// selling the vow that no ownership agreement claims, and also counts
    /// a publication naming a vow whether or not it pays the vow's signer;
    /// the core keeps the drafter until that is settled.*
    pub(super) fn owners_party(&self, p: &Publication, drafter: &Hash) -> R<Hash> {
        let Some(o) = &p.owners else { return Ok(*drafter) };
        let t = self.terms(o)?;
        if t.is_collective() {
            if let Some(c) = self.collective_of(o)? {
                return Ok(c);
            }
        }
        Ok(*o)
    }

    /// Whether `party` signed publication `id` drafted by `drafter`: its
    /// drafter by drafting it, any other party by a signature act naming it,
    /// an agreement as rule 15 says (every party of a version of its line
    /// signing, the drafter by drafting).
    fn pub_signed(&self, id: &Hash, drafter: &Hash, party: &Hash) -> bool {
        // A collective drafts by a member's act for it, counting under its
        // rule for Agreements (rule 60).
        if party == drafter {
            return self.founding_of(party).is_none() || self.consent(id).is_ok_and(|c| c.counts());
        }
        if !self.signers(id, &[*party]).is_empty() {
            return true;
        }
        // An agreement's line whose drafter is one of its parties: the
        // drafter's drafting is its signature there too.
        if !self.names_a_line(party) {
            return false;
        }
        // An agreement consents only once it exists (rule 1): terms not
        // every party signed sign nothing.
        if !self.agreement(party).is_ok_and(|a| a.exists == Some(true)) {
            return false;
        }
        let Ok(v) = self.version_in_force(party) else { return false };
        let Ok(versions) = self.lineage(&v) else { return false };
        versions.iter().any(|(_, t)| {
            !t.is_collective() && !t.parties.is_empty() && t.parties.iter().all(|q| q == drafter || !self.signers(id, &[*q]).is_empty())
        })
    }

    /// A publication, judged (rule 11; "Publication (type 6)"): valid under
    /// Identity; public; every party signed it; the partners' shares and
    /// the plan's fixed parts within 1,000,000; a deadline on a time
    /// reference; a later version naming its first and previous, of the
    /// same kind (selling or a split agreement), signed by the same
    /// parties' consent; what it sells in its format.
    pub fn publication(&self, id: &Hash) -> R<PublicationEval> {
        let h = self.held(id)?;
        if !self.is_agreements(h, types::PUBLICATION) {
            return Err(AgreementsError::Check("not a publication"));
        }
        let PublicationAct { publication, follows } = Publication::decode(&h.inside)?;
        let drafter = self.author(h).ok_or(AgreementsError::Check("a publication has a signer"))?;
        let mut problems: Vec<String> = vec![];
        if !self.valid(id) {
            problems.push("it is not valid under Identity".into());
        }
        if h.act.outside.content_key.is_none() {
            problems.push("a publication is always public: this one is sealed".into());
        }
        let first = follows.map(|(f, _)| f).unwrap_or(*id);
        if let Some((f, prev)) = follows {
            match (self.pub_act(&f), self.pub_act(&prev)) {
                (Some((_, fa)), Some((_, pa))) if fa.follows.is_none() && (prev == f || pa.follows.is_some_and(|(pf, _)| pf == f)) => {
                    if fa.publication.owners != publication.owners {
                        problems.push("a later version names the ownership agreement its first version names".into());
                    }
                    if fa.publication.is_split_agreement() != publication.is_split_agreement() {
                        problems.push("a later version is of its first version's kind: a publication that sells, or a split agreement".into());
                    }
                }
                (None, _) | (_, None) if self.v.get(&f).is_none() || self.v.get(&prev).is_none() => {
                    problems.push("its first version or the version it follows is not held".into());
                }
                _ => problems.push("a later version names its first version and the version it follows, both publications of one line".into()),
            }
        }
        let owners_side = match self.owners_party(&publication, &drafter) {
            Ok(x) => x,
            Err(_) => {
                problems.push("the ownership agreement it names is not held".into());
                publication.owners.unwrap_or(drafter)
            }
        };
        if let Some(o) = &publication.owners {
            if self.v.get(o).is_some() && !self.names_a_line(o) {
                problems.push("it names an ownership agreement by a later version, not its founding version (rule 12)".into());
            }
            if let Ok(t) = self.terms(o) {
                if t.target.is_none() {
                    problems.push("the agreement it names is no ownership agreement (no target, field 33)".into());
                }
                if publication.is_split_agreement() && t.target != Some(Target::Collective) {
                    problems.push("a split agreement names a collective's ownership agreement (rule 15)".into());
                }
            }
        } else if publication.is_split_agreement() {
            problems.push("a split agreement names a collective's ownership agreement (rule 15)".into());
        }
        let mut parties = vec![owners_side];
        for x in publication.other_parties() {
            if !parties.contains(&x) {
                parties.push(x);
            }
        }
        let unsigned: Vec<Hash> = parties.iter().filter(|p| !self.pub_signed(id, &drafter, p)).copied().collect();
        if !unsigned.is_empty() {
            problems.push("not every party has signed it: the owners' side, each partner, the split service and each backup".into());
        }
        if publication.partners_total() + publication.plan.fixed_parts() > MILLION as u128 {
            problems.push("the partners' shares and the plan's fixed parts exceed 1,000,000".into());
        }
        if publication.until.is_some() && publication.time.is_none() && publication.cmip(TIME_REFERENCE_TASK).is_none() {
            problems.push("its deadline (field 7) is a point on its time reference, which it names nowhere (rule 33)".into());
        }
        if publication.refund.is_some() && publication.time.is_none() && publication.cmip(TIME_REFERENCE_TASK).is_none() {
            problems.push("its refund terms (field 8) are a point on its time reference, which it names nowhere (rule 33)".into());
        }
        if let Some(d) = &publication.designated {
            if !parties.contains(d) {
                problems.push("the party it designates to sign its price tags (field 10) is one of its parties".into());
            }
        }
        for s in publication.sold.iter().flatten() {
            match s {
                Sold::Vow(v) => {
                    if let Some(p) = self.vow_name_problem(v) {
                        problems.push(p);
                    }
                }
                Sold::Bake(b) => {
                    if let Some(x) = self.v.get(b) {
                        if x.inside.spec != self.mirs.envelopes || x.inside.type_ != crate::envelopes::types::BAKE {
                            problems.push("what it sells as a bake is no bake".into());
                        }
                    }
                }
                Sold::Access(..) => {}
            }
        }
        // A version of a collective's split agreement that is an owners'
        // matter (it pays the stake less, rule 95) counts once the stake's
        // holders consent as their holders' rule asks, each by a signature
        // act naming the version (rule 94); under every holder, each holder
        // who is no member signs (rule 48).
        if let (true, Some((_, prev)), Some(o)) = (publication.is_split_agreement(), follows, &publication.owners) {
            if let Some((_, pa)) = self.pub_act(&prev) {
                if !super::super::owners_line_lowered(&pa.publication, &publication).is_empty() {
                    if let Some(w) = self.owners_consent_problem(id, o)? {
                        problems.push(w);
                    }
                }
            }
        }
        let outside_claims = self.outside_claims_of(&publication)?;
        let latest = self.pub_tips(&first);
        let counts = problems.is_empty();
        let ends = publication.ends();
        Ok(PublicationEval { id: *id, publication, follows, first, drafter, parties, unsigned, counts, problems, latest, ends, outside_claims })
    }

    /// Why the holders of the collective's stake in itself have not
    /// consented to the owners' matter `id`, a version of the collective's
    /// split agreement paying the stake less (rules 15, 48, 94, 95), or
    /// `None`. The stake is read on the collective's agreement in force for
    /// the version; who holds what, on the roster at the version, the
    /// transfers its history places applied (rule 94). Each holder consents
    /// by a signature act naming the version, held and valid; a holder who
    /// is no member may vote by its proxy, placed in the version's history,
    /// where it has not signed itself (rule 97). Under every holder, each
    /// holder who is no member signs (rule 48); under a rule by share, the
    /// holders consenting hold together at least that share, and each holder
    /// who is no member and whom the rule does not bind (it neither signed a
    /// version carrying the rule nor bought under it) signs for itself.
    fn owners_consent_problem(&self, id: &Hash, owners: &Hash) -> R<Option<String>> {
        let h = self.held(id)?;
        let Some(c) = self.collective_of(owners)? else { return Ok(None) };
        let col = self.col(&c);
        let at = Line::Record(h);
        let ag = match self.in_force(id) {
            Ok(Some(a)) => a,
            _ => self.version_in_force(owners)?,
        };
        let t = self.terms(&ag)?;
        let Some((i, st)) = t.own_stake() else { return Ok(None) };
        let i = i as u64;
        let roster = self.roster_at(&col, at, &ag, i)?;
        // Each holder's signature act naming the version (rule 15: "each by
        // a signature act naming the version").
        let mut by: BTreeMap<Hash, Hash> = BTreeMap::new();
        for x in self.v.held_acts() {
            if self.is_agreements(x, types::SIGNATURE) && decode_signature(&x.inside).ok() == Some(*id) && self.valid(&x.id) {
                if let Some(s) = x.act.outside.signer {
                    by.entry(s).or_insert(x.id);
                }
            }
        }
        let member = |x: &Hash| t.parties.contains(x);
        let (rule, _) = t.holders_rule(i);
        match rule {
            crate::agreements::HoldersRule::Every => {
                let missing = roster.iter().any(|(x, n)| *n > 0 && !member(x) && !by.contains_key(x));
                Ok(missing.then(|| "it pays the collective's stake less, and a holder who is no member has not signed it (rules 48, 94)".into()))
            }
            crate::agreements::HoldersRule::Share(need) => {
                let lineage = self.lineage(&ag)?;
                let bound = |x: &Hash| {
                    let bought = !st.identified().iter().any(|(y, _)| y == x);
                    bought || lineage.iter().any(|(v, vt)| vt.holders_rule(i).0 == rule && vt.holders_rules.is_some() && !self.valid_sigs(v, &[*x]).is_empty())
                };
                let mut got = 0u64;
                for (x, n) in &roster {
                    if *n == 0 {
                        continue;
                    }
                    let own = by.contains_key(x);
                    if !own && !member(x) && !bound(x) {
                        return Ok(Some("it pays the collective's stake less, and a holder the stake's holders' rule does not bind has not signed it (rules 48, 94)".into()));
                    }
                    if own || (!member(x) && self.proxy_votes(&col, at, &ag, id, i, x, &by)?) {
                        got += n;
                    }
                }
                Ok((got < need).then(|| "it pays the collective's stake less, and its holders signing it do not meet the stake's holders' rule (rule 94)".into()))
            }
        }
    }

    /// The versions of a publication's line held, valid, each with the
    /// version it follows: the first version, then each later version naming
    /// it as its first.
    pub(super) fn pub_versions(&self, first: &Hash) -> Vec<(Hash, Option<Hash>)> {
        let mut out: Vec<(Hash, Option<Hash>)> = vec![];
        if self.pub_act(first).is_some_and(|(_, a)| a.follows.is_none()) {
            out.push((*first, None));
        }
        for h in self.v.held_acts() {
            if let Some((_, a)) = self.pub_act(&h.id) {
                if let Some((f, p)) = a.follows {
                    if &f == first && self.valid(&h.id) {
                        out.push((h.id, Some(p)));
                    }
                }
            }
        }
        out
    }

    /// What a client pays against (F409: "Clients need to provide the
    /// tip"): a publication's latest versions, its price tags' latest
    /// versions that count under it, and the latest version of the
    /// ownership agreement it names (rule 12), each found by following its
    /// line. `first` is the publication's first version.
    pub fn publication_tip(&self, first: &Hash) -> R<PublicationTip> {
        let latest = self.pub_tips(first);
        let mut tags: Vec<Hash> = vec![];
        let under: Vec<(&Held, fin::PriceTag)> = self
            .v
            .held_acts()
            .filter_map(|h| self.tag_of(&h.id))
            .filter(|(_, t)| t.priced == fin::Priced::Publication(*first))
            .collect();
        for (h, t) in &under {
            let followed = under.iter().any(|(g, u)| u.previous.as_ref() == Some(&h.id) && g.act.outside.signer == h.act.outside.signer && self.valid(&g.id));
            let _ = t;
            if !followed && self.valid(&h.id) && matches!(self.tag_under(&h.id)?, TagUnder::Counts { .. }) {
                tags.push(h.id);
            }
        }
        tags.sort();
        let owners = match self.publication(first).ok().and_then(|e| e.publication.owners) {
            Some(o) => Some((o, self.version_in_force(&o)?)),
            None => None,
        };
        Ok(PublicationTip { latest, tags, owners })
    }

    /// The tips of a publication's line: versions no other version follows.
    pub(super) fn pub_tips(&self, first: &Hash) -> Vec<Hash> {
        let all = self.pub_versions(first);
        let mut tips: Vec<Hash> = all.iter().map(|(x, _)| *x).filter(|x| !all.iter().any(|(_, p)| p.as_ref() == Some(x))).collect();
        tips.sort();
        tips
    }

    /// The version of a publication's line an act is judged under: the
    /// deepest counting version on the line the act's history holds, or the
    /// first version where it holds none.
    pub(super) fn pub_version_for(&self, first: &Hash, act: &Hash) -> Hash {
        let history = self.act_history(act);
        let versions = self.pub_versions(first);
        let parent = |x: &Hash| versions.iter().find(|(v, _)| v == x).and_then(|(_, p)| *p);
        let mut best = *first;
        let mut depth = 0usize;
        for (v, _) in &versions {
            if !history.contains(v) || !self.publication(v).is_ok_and(|e| e.counts) {
                continue;
            }
            let mut d = 0usize;
            let mut cur = *v;
            while let Some(p) = parent(&cur) {
                d += 1;
                cur = p;
            }
            if d >= depth {
                depth = d;
                best = *v;
            }
        }
        best
    }

    /// The counting versions of a publication's line that end it.
    pub(super) fn pub_endings(&self, first: &Hash) -> Vec<Hash> {
        self.pub_versions(first)
            .into_iter()
            .map(|(v, _)| v)
            .filter(|v| self.publication(v).is_ok_and(|e| e.counts && e.ends))
            .collect()
    }

    /// Rule 14: what the publication sells that a claim can own (a bake's
    /// work; a vow, by its name): each ownership agreement claiming it,
    /// whose line is not the one the publication names. Ascending.
    fn outside_claims_of(&self, p: &Publication) -> R<Vec<Hash>> {
        let mut out: Vec<Hash> = vec![];
        for s in p.sold.iter().flatten() {
            let named = match s {
                Sold::Bake(b) => self.bake_field(b, 1),
                Sold::Vow(v) => Some(*v),
                Sold::Access(..) => None,
            };
            let Some(named) = named else { continue };
            for a in self.work_owners(&named)?.agreements {
                let root = self.line_of(&a);
                if (p.owners.is_none() || root != p.owners) && !out.contains(&a) {
                    out.push(a);
                }
            }
        }
        out.sort();
        Ok(out)
    }

    /// A bake's field `k` (1, its work hash; 2, its locked media), where `b`
    /// is a held bake (Envelopes type 0).
    pub(super) fn bake_field(&self, b: &Hash, k: u64) -> Option<Hash> {
        let x = self.v.get(b)?;
        if x.inside.spec != self.mirs.envelopes || x.inside.type_ != crate::envelopes::types::BAKE {
            return None;
        }
        x.inside.payload.iter().find_map(|(kk, v)| match (kk, v) {
            (crate::cbor::Value::Uint(n), crate::cbor::Value::Bytes(bb)) if *n == k => bb.as_slice().try_into().ok(),
            _ => None,
        })
    }

    /// The locked media a publication sells: each bake's (field 2), for a
    /// relay's delivery record (rule 22): the object a purchase under it
    /// paid for is any of them.
    pub(super) fn pub_media(&self, publication: &Hash) -> Vec<Hash> {
        let Some((_, a)) = self.pub_act(publication) else { return vec![] };
        a.publication
            .sold
            .iter()
            .flatten()
            .filter_map(|s| match s {
                Sold::Bake(b) => self.bake_field(b, 2),
                _ => None,
            })
            .collect()
    }

    /// The verdict on a proof of delivery under a publication selling a
    /// proven delivery (rule 11): the checker this verifier holds for the
    /// cMIP an access item names judges `proof`; with none held, unknown.
    pub fn proven_delivery(&self, publication: &Hash, proof: &[u8], checkers: &[(Hash, &dyn crate::agreements::ProofChecker)]) -> R<crate::agreements::ProofVerdict> {
        use crate::agreements::ProofVerdict;
        let (_, a) = self.pub_act(publication).ok_or(AgreementsError::Check("not a publication held"))?;
        let items: Vec<(Hash, Vec<u8>)> = a
            .publication
            .sold
            .iter()
            .flatten()
            .filter_map(|x| match x {
                Sold::Access(c, p) => Some((*c, p.clone())),
                _ => None,
            })
            .collect();
        if items.is_empty() {
            return Err(AgreementsError::Check("it sells no proven delivery: nothing in the access form (rule 11)"));
        }
        let mut last = None;
        for (cmip, params) in &items {
            let verdict = match checkers.iter().find(|(c, _)| c == cmip) {
                Some((_, c)) => c.check(publication, params, proof),
                None => ProofVerdict::Unknown("this verifier holds no checker for the publication's cMIP: not proven here (rule 11)".into()),
            };
            if verdict == ProofVerdict::Proven {
                return Ok(verdict);
            }
            last = Some(verdict);
        }
        Ok(last.expect("at least one item"))
    }

    // ------------------------------------------------------------ price tags

    /// A held price tag and its signer.
    pub(super) fn tag_of(&self, id: &Hash) -> Option<(&'a Held, fin::PriceTag)> {
        let h = self.v.get(id)?;
        if h.inside.spec != self.mirs.money {
            return None;
        }
        match Fin::decode(h.inside.type_, &h.inside.payload) {
            Ok(Fin::PriceTag(t)) => Some((h, t)),
            _ => None,
        }
    }

    /// The later versions of `tag`'s line that withdraw it (no price),
    /// valid, by the same signer, pricing the same thing (Money rule 18).
    fn tag_withdrawals(&self, tag_h: &Held, tag: &fin::PriceTag) -> Vec<Hash> {
        let first_of = |h: &Held, t: &fin::PriceTag| -> Hash {
            if t.previous.is_none() {
                h.id
            } else {
                t.follows(&crate::money::Citations::of(&h.inside)).map(|(f, _)| f).unwrap_or(h.id)
            }
        };
        let first = first_of(tag_h, tag);
        let signer = tag_h.act.outside.signer;
        self.v
            .held_acts()
            .filter(|h| h.act.outside.signer == signer && self.valid(&h.id))
            .filter_map(|h| self.tag_of(&h.id).map(|(h, t)| (h, t)))
            .filter(|(h, t)| t.withdrawn() && t.priced == tag.priced && t.version > tag.version && first_of(h, t) == first)
            .map(|(h, _)| h.id)
            .collect()
    }

    /// Whether a price tag under a publication counts (Money rule 18;
    /// Agreements rule 12): valid; the publication it names is a first
    /// version held; its signer is the split service of the publication's
    /// version in force for the tag, or the party that version designates.
    pub fn tag_under(&self, tag: &Hash) -> R<TagUnder> {
        let Some((h, t)) = self.tag_of(tag) else { return Ok(TagUnder::Unknown("no price tag held".into())) };
        let Priced::Publication(first) = t.priced else {
            return Ok(TagUnder::Nobodys("a tag on a bare bake is the uploader's (Money rule 18), under no publication".into()));
        };
        match self.v.status(tag) {
            Status::Valid => {}
            Status::Invalid => return Ok(TagUnder::Nobodys("the tag is invalid".into())),
            _ => return Ok(TagUnder::Unknown("the tag's standing is not known".into())),
        }
        let Some((_, fa)) = self.pub_act(&first) else {
            return Ok(match self.v.get(&first) {
                None => TagUnder::Unknown("the publication it names is not held".into()),
                Some(_) => TagUnder::Nobodys("it names no publication".into()),
            });
        };
        if fa.follows.is_some() {
            return Ok(TagUnder::Nobodys("a tag names a publication by its first version".into()));
        }
        let v = self.pub_version_for(&first, tag);
        let e = self.publication(&v)?;
        let signer = self.author(h).unwrap_or_default();
        if signer != e.publication.service && e.publication.designated != Some(signer) {
            return Ok(TagUnder::Nobodys("signed neither by the publication's split service nor by the party it designates: nobody's offer under it (rule 12)".into()));
        }
        if e.publication.is_split_agreement() {
            return Ok(TagUnder::Nobodys("a split agreement sells nothing, and takes no price tag".into()));
        }
        Ok(TagUnder::Counts { publication: first, withdrawn: t.withdrawn() })
    }

    // ------------------------------------------------------------ shares by reference

    /// The version of the ownership agreement `owners` (its founding
    /// version) whose stake pays the owners' line of the payment `receipt`
    /// names as `named` (rule 12): `Err` where the receipt is a wrong one (a
    /// version on no line of the agreement, or a version of a fork of it
    /// other than its reference); otherwise the latest complete version on
    /// that line the receipt's history holds, or the version it names, the
    /// reference while the agreement stands forked.
    pub(super) fn version_by_reference(&self, receipt: &Hash, owners: &Hash, named: &Hash) -> R<Result<Hash, String>> {
        let Ok(lineage) = self.lineage(named) else {
            return Ok(Err("the version it names is not held terms".into()));
        };
        if lineage.last().map(|r| r.0) != Some(*owners) {
            return Ok(Err("it names a version on no line of the ownership agreement the publication names: a wrong receipt (rule 12)".into()));
        }
        let t = self.terms(named)?;
        if t.is_collective() {
            return Ok(Ok(self.history_version(receipt, named)));
        }
        match self.deal_state(owners)? {
            DealState::Forked { reference, branches } | DealState::Tangled { reference, branches, .. } => {
                if branches.iter().flatten().any(|x| x == named) {
                    return Ok(Err("it names a version of a fork of the ownership agreement other than its reference: a wrong receipt; the owners' line is paid by the reference (rule 12, rule 47)".into()));
                }
                Ok(Ok(reference))
            }
            DealState::InForce(_) => Ok(Ok(self.keepers_version(receipt, named).unwrap_or(*named))),
        }
    }

    // ------------------------------------------------------------ purchases

    pub(super) fn purchase_read(&self, id: &Hash) -> R<Option<PurchaseEval>> {
        let x = self.held(id)?;
        if x.inside.spec != self.mirs.money {
            return Ok(None);
        }
        let signer = x.act.outside.signer.unwrap_or_default();
        let (purchase, fulfils, refund_to, rail, payee, is_receipt) = match Fin::decode(x.inside.type_, &x.inside.payload) {
            Ok(Fin::Receipt(r)) => (r.purchase.clone(), r.fulfils, fin::refund_owed_to(&r), r.rail, r.payee, true),
            Ok(Fin::Claim(c)) => {
                let to = match c.payer(&signer) {
                    fin::Payer::Identity(h) => fin::RefundTo::Identity(h),
                    fin::Payer::Key(k) => fin::RefundTo::Key(k),
                };
                (c.purchase.clone(), c.fulfils, to, c.rail, c.payee, false)
            }
            _ => return Ok(None),
        };
        let unanswered = !self.rail_counts(id) && !self.rail_invalid.contains(id);
        let mut e = PurchaseEval { id: *id, purchase: purchase.clone(), verdict: PurchaseVerdict::Purchase, refund_to, bypassing: None };
        // A payment for a stake transfer (rule 10): a purchase of the share,
        // unless the transfer is an over-sale.
        if let Some(t) = self.transfer_paid_by(id, &fulfils) {
            if unanswered {
                e.verdict = PurchaseVerdict::Unknown;
                return Ok(Some(e));
            }
            if self.transfer(&t)?.over_sale {
                e.verdict = PurchaseVerdict::NoPurchase {
                    why: "it pays for a stake transfer that is an over-sale on the seller's own line: owed back by the seller, paid as a refund (rule 10)".into(),
                };
            }
            return Ok(Some(e));
        }
        let no = |mut e: PurchaseEval, w: &str| {
            e.verdict = PurchaseVerdict::NoPurchase { why: w.into() };
            Ok(Some(e))
        };
        // Only a payment naming a price tag is a purchase; a tip to a bake or
        // through a publication, a debt or a pointer, is none.
        let Some((tag_h, tag)) = self.tag_of(&fulfils) else { return Ok(None) };
        if unanswered {
            e.verdict = PurchaseVerdict::Unknown;
            return Ok(Some(e));
        }
        if self.rail_invalid.contains(id) {
            e.verdict = PurchaseVerdict::WrongReceipt {
                why: "its rail proof does not carry the commitment recomputed from it: the payment committed to another tag or version; a wrong receipt counts for nothing (rule 12)".into(),
            };
            return Ok(Some(e));
        }
        if tag.withdrawn() {
            return no(e, "it names a version of the price tag carrying no price: the tag is withdrawn, no purchase, owed back (Money rule 18)");
        }
        // A backup the publication lists (field 11) is paid with the payment
        // still naming the tag, and receipts in its own name (rule 17).
        let backup = match tag.priced {
            Priced::Publication(first) if tag.payee != payee => {
                let v = self.pub_version_for(&first, &tag_h.id);
                self.publication(&v).is_ok_and(|pe| pe.publication.backups.contains(&payee))
            }
            _ => false,
        };
        if tag.payee != payee && !backup {
            return no(e, "paid to another identity than the tag's payee, nor to a backup the publication lists: no purchase of it (Money rule 18; Agreements rule 17)");
        }
        match tag.priced {
            Priced::Bake(b) => {
                // A bare bake's tag: a sale by its uploader, which gives
                // standing as a purchase does (rule 54).
                match self.v.price_tag(&tag_h.id).map(|(_, c)| c) {
                    Some(crate::chain::TagCount::Counts) => Ok(Some(e)),
                    Some(crate::chain::TagCount::Nobodys(w)) => no(e, &format!("the tag is nobody's offer: {w}")),
                    _ => {
                        let _ = b;
                        e.verdict = PurchaseVerdict::Unknown;
                        Ok(Some(e))
                    }
                }
            }
            Priced::Publication(first) => {
                match self.tag_under(&tag_h.id)? {
                    TagUnder::Counts { .. } => {}
                    TagUnder::Nobodys(w) => return no(e, &format!("the tag is nobody's offer under the publication: {w}")),
                    TagUnder::Unknown(_) => {
                        e.verdict = PurchaseVerdict::Unknown;
                        return Ok(Some(e));
                    }
                }
                let version = self.pub_version_for(&first, &tag_h.id);
                let pe = self.publication(&version)?;
                if !pe.counts {
                    // A publication a collective signed in a broken stretch
                    // never counted; a sale under it is signed anew after the
                    // rollback by a receipt of the collective for the same
                    // payment (rule 93).
                    let anew = pe.parties.iter().filter(|p| self.founding_of(p).is_some()).any(|c| {
                        let mut acts = vec![*id];
                        acts.extend(self.same_payment(id).into_iter().map(|(h, _)| h));
                        acts.iter().filter_map(|a| self.v.get(a)).any(|r| {
                            r.inside.type_ == crate::money::types::RECEIPT && self.author(r).as_ref() == Some(c) && self.consent(&r.id).is_ok_and(|k| k.counts())
                        })
                    });
                    if !anew {
                        return no(e, &format!("the publication does not count: {}", pe.problems.join("; ")));
                    }
                }
                if self.paid_past_until.contains(id) {
                    return no(e, "paid past the publication's deadline, as its time reference answers: owed back (rule 11)");
                }
                // A tag whose payee is not the split service bypasses it:
                // still a purchase; what the other shares would have been is
                // the receiver's open obligation (rule 16).
                if tag.payee != pe.publication.service {
                    e.bypassing = Some(tag.payee);
                }
                // Owners that ended: a publication whose ownership agreement
                // is a closed collective's own, or closed, sells nothing
                // from the closing's line (rule 12).
                if let Some(o) = &pe.publication.owners {
                    if let Some(c) = self.collective_of(o)? {
                        if let Some(cl) = self.closed_by(&c)? {
                            if !self.act_history(&cl.by).contains(id) {
                                return no(e, "the publication's ownership agreement is a closed collective's: it sells nothing from the closing's line, the payment owed back (rule 12)");
                            }
                        }
                    }
                }
                // Shares by reference: the service's receipt names, in field
                // 9, the ownership agreement and a version on its line.
                if let (Some(o), Some(p)) = (&pe.publication.owners, &purchase) {
                    if &p.agreement != o {
                        e.verdict = PurchaseVerdict::WrongReceipt { why: "it names another ownership agreement than the publication's (rule 12)".into() };
                        return Ok(Some(e));
                    }
                    if let Err(w) = self.version_by_reference(id, o, &p.line)? {
                        e.verdict = PurchaseVerdict::WrongReceipt { why: w };
                        return Ok(Some(e));
                    }
                }
                if self.same_payment(id).iter().any(|(x, q)| q != &purchase && self.rail_counts(x)) {
                    e.verdict = PurchaseVerdict::Unrecorded;
                    return Ok(Some(e));
                }
                // Which version a payment buys is settled where it takes
                // place: on a request rail, the version the seller's request
                // committed to, whatever came after; on a push rail, the
                // split service's own receipt, before or after its signature
                // on the ending.
                if !self.is_push_rail(&rail) {
                    return Ok(Some(e));
                }
                // The service that receipts it: the split service, or the
                // backup it was paid to, which receipts in its own name.
                let service = if backup { payee } else { pe.publication.service };
                let endings = self.pub_endings(&first);
                let receipts: Vec<&Held> = if is_receipt && signer == service {
                    vec![x]
                } else {
                    self.holder_receipts(id, &service)
                };
                if receipts.is_empty() {
                    e.verdict = PurchaseVerdict::Unrecorded;
                    return Ok(Some(e));
                }
                if !endings.is_empty() && receipts.iter().all(|r| self.after_own_signature(r, &service, &endings)) {
                    return no(e, "on a push rail, the split service recorded its receipt after its own signature on the version ending the publication: a payment racing the ending, owed back by the service, then by each party (rule 11)");
                }
                // A sale before a price tag's withdrawal, settled as a push
                // rail settles an ending (rule 12): a receipt the split
                // service records whose history holds the version with no
                // price is no sale.
                let withdrawals = self.tag_withdrawals(tag_h, &tag);
                if !withdrawals.is_empty()
                    && receipts.iter().all(|r| self.after_own_signature(r, &service, &withdrawals) || withdrawals.iter().any(|w| self.act_history(&r.id).contains(w)))
                {
                    return no(e, "on a push rail, the split service recorded its receipt after the tag's withdrawal was in its history: no sale, owed back as a payment naming a tag the publication does not count (rule 12)");
                }
                Ok(Some(e))
            }
        }
    }

    /// What is owed back on a payment racing a publication's ending (rule
    /// 11): by the split service from what it holds, and past that by each
    /// party in the share it received: the split service, and each
    /// receiver of a payout of a split of the payment, with what it got.
    pub fn owed_back_by(&self, payment: &Hash) -> R<Vec<(Hash, u64)>> {
        let Some(pe) = self.purchase(payment)? else { return Ok(vec![]) };
        if !matches!(pe.verdict, PurchaseVerdict::NoPurchase { .. }) {
            return Ok(vec![]);
        }
        let amount = match self.v.get(payment).map(|h| Fin::decode(h.inside.type_, &h.inside.payload)) {
            Some(Ok(Fin::Receipt(r))) => r.amount.value,
            Some(Ok(Fin::Claim(c))) => c.amount.value,
            _ => 0,
        };
        let mut out: Vec<(Hash, u64)> = vec![];
        let mut paid_out: u64 = 0;
        let mut acts = vec![*payment];
        acts.extend(self.same_payment(payment).into_iter().map(|(h, _)| h));
        for h in self.v.held_acts() {
            if !self.is_agreements(h, types::SPLIT) {
                continue;
            }
            let Ok(s) = Split::decode(&h.inside.payload) else { continue };
            if !acts.contains(&s.receipt) {
                continue;
            }
            for p in &s.payouts {
                paid_out = paid_out.saturating_add(p.amount);
                match out.iter_mut().find(|(x, _)| *x == p.receiver) {
                    Some(e) => e.1 = e.1.saturating_add(p.amount),
                    None => out.push((p.receiver, p.amount)),
                }
            }
        }
        let held = amount.saturating_sub(paid_out);
        if let Some(Fin::Receipt(r)) = self.v.get(payment).and_then(|h| Fin::decode(h.inside.type_, &h.inside.payload).ok()) {
            if held > 0 {
                out.insert(0, (r.payee, held));
            }
        }
        Ok(out)
    }
}
