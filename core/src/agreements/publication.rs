//! The publication (Agreements type 6): the offer. What is sold, on which
//! terms, with which partners, which split service pays everyone and how
//! each payment is divided, the owners' line read from the ownership
//! agreement it names (Agreements rules 11 to 17; "Publication (type 6)").
//! Its price is a price tag (Money type 5) naming it. A first version that
//! sells nothing is a split agreement.
//!
//! ```cddl
//! publication-payload = {
//!   ? 0 => [* sold],          ; absent in every version of a split agreement; empty only in a
//!                             ; later version, which ends the publication
//!   ? 1 => hash,              ; the owners: the ownership agreement, by its founding version
//!   2 => [* partner],         ; ascending by identity, none twice
//!   3 => hash,                ; the split service
//!   4 => split-plan,
//!   ? 5 => tstr,              ; its words; required where it sells a vow
//!   ? 6 => [ hash, any ],     ; its time reference
//!   ? 7 => any,               ; until
//!   ? 8 => refund-terms,
//!   9 => { * uint => hash },  ; cMIPs, at most one per task
//!   ? 10 => hash,             ; the party it designates to sign its price tags
//!   ? 11 => [+ hash],         ; the split service's backups, in order
//!   ? 12 => any               ; what counts as a failed attempt (only with 11)
//! }
//! partner = { 0 => hash, 1 => uint, ? 2 => tstr }
//! ```

use super::formats::{b, distinct, hash, hashes, hashes_value, nonempty, tuple, uint, AgreementsError, R, MILLION, SPLIT_TASK};
use super::open_formats::{RefundTerms, Sold, SplitPlan};
use crate::act::Inside;
use crate::cbor::{self, Value};
use crate::hash::Hash;

/// A partner of a publication: an identity, its share of each payment off
/// the top, in millionths, and a label nothing reads.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Partner {
    pub identity: Hash,
    pub share: u64,
    pub label: Option<String>,
}

impl Partner {
    pub fn to_value(&self) -> Value {
        let mut m = vec![(Value::Uint(0), b(&self.identity)), (Value::Uint(1), Value::Uint(self.share))];
        if let Some(l) = &self.label {
            m.push((Value::Uint(2), Value::Text(l.clone())));
        }
        Value::Map(m)
    }

    fn decode(v: &Value) -> R<Partner> {
        let Value::Map(m) = v else { return Err(AgreementsError::Shape("publication: a partner is a map")) };
        let mut identity = None;
        let mut share = None;
        let mut label = None;
        for (k, x) in m {
            match k {
                Value::Uint(0) if identity.is_none() => identity = Some(hash(x, "publication: a partner's identity")?),
                Value::Uint(1) if share.is_none() => share = Some(uint(x, "publication: a partner's share")?),
                Value::Uint(2) if label.is_none() => match x {
                    Value::Text(t) => label = Some(t.clone()),
                    _ => return Err(AgreementsError::Shape("publication: a partner's label is text")),
                },
                _ => return Err(AgreementsError::Shape("publication: a partner's field its format does not define")),
            }
        }
        Ok(Partner {
            identity: identity.ok_or(AgreementsError::Shape("publication: a partner names its identity"))?,
            share: share.ok_or(AgreementsError::Shape("publication: a partner names its share"))?,
            label,
        })
    }
}

/// A publication (Agreements type 6).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Publication {
    /// 0: what it sells; `None` in a split agreement; empty in a version
    /// that ends the publication.
    pub sold: Option<Vec<Sold>>,
    /// 1: the ownership agreement whose holders take the owners' line, by
    /// its founding version; `None`, a lone seller's: its drafter's.
    pub owners: Option<Hash>,
    /// 2: the partners, ascending by identity.
    pub partners: Vec<Partner>,
    /// 3: the split service.
    pub service: Hash,
    /// 4: the split plan.
    pub plan: SplitPlan,
    /// 5: its words, canonical text.
    pub words: Option<String>,
    /// 6: its time reference.
    pub time: Option<(Hash, Value)>,
    /// 7: until: a point on the time reference after which it takes no payment.
    pub until: Option<Value>,
    /// 8: its refund terms.
    pub refund: Option<RefundTerms>,
    /// 9: cMIPs, at most one per task, ascending.
    pub cmips: Vec<(u64, Hash)>,
    /// 10: the party it designates to sign its price tags beside the service.
    pub designated: Option<Hash>,
    /// 11: the split service's backups, in order.
    pub backups: Vec<Hash>,
    /// 12: what counts as a failed attempt (only with 11).
    pub failed: Option<Value>,
}

/// A publication as an act names it: the publication, and where it is a
/// later version, its first version and the version it follows.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PublicationAct {
    pub publication: Publication,
    /// `(first, previous)` for a later version.
    pub follows: Option<(Hash, Hash)>,
}

impl Publication {
    /// Whether this version ends the publication: a later version selling
    /// nothing (field 0 empty).
    pub fn ends(&self) -> bool {
        self.sold.as_ref().is_some_and(|s| s.is_empty())
    }

    /// Whether it is a split agreement's version (field 0 absent).
    pub fn is_split_agreement(&self) -> bool {
        self.sold.is_none()
    }

    /// The cMIP named for a task.
    pub fn cmip(&self, task: u64) -> Option<&Hash> {
        self.cmips.iter().find(|(t, _)| *t == task).map(|(_, h)| h)
    }

    /// The split services in order: its own, then its backups.
    pub fn services(&self) -> Vec<Hash> {
        std::iter::once(self.service).chain(self.backups.iter().copied()).collect()
    }

    /// The parties other than the owners' side: each partner, the split
    /// service and each backup, none twice, in that order.
    pub fn other_parties(&self) -> Vec<Hash> {
        let mut out: Vec<Hash> = vec![];
        for x in self.partners.iter().map(|p| p.identity).chain(self.services()) {
            if !out.contains(&x) {
                out.push(x);
            }
        }
        out
    }

    /// The partners' shares together, summed wide.
    pub fn partners_total(&self) -> u128 {
        self.partners.iter().map(|p| p.share as u128).sum()
    }

    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![];
        if let Some(s) = &self.sold {
            m.push((Value::Uint(0), Value::Array(s.iter().map(Sold::to_value).collect())));
        }
        if let Some(o) = &self.owners {
            m.push((Value::Uint(1), b(o)));
        }
        m.push((Value::Uint(2), Value::Array(self.partners.iter().map(Partner::to_value).collect())));
        m.push((Value::Uint(3), b(&self.service)));
        m.push((Value::Uint(4), self.plan.to_value()));
        if let Some(w) = &self.words {
            m.push((Value::Uint(5), Value::Text(w.clone())));
        }
        if let Some((h, p)) = &self.time {
            m.push((Value::Uint(6), Value::Array(vec![b(h), p.clone()])));
        }
        if let Some(u) = &self.until {
            m.push((Value::Uint(7), u.clone()));
        }
        if let Some(r) = &self.refund {
            m.push((Value::Uint(8), r.to_value()));
        }
        m.push((Value::Uint(9), Value::Map(self.cmips.iter().map(|(t, h)| (Value::Uint(*t), b(h))).collect())));
        if let Some(d) = &self.designated {
            m.push((Value::Uint(10), b(d)));
        }
        if !self.backups.is_empty() {
            m.push((Value::Uint(11), hashes_value(&self.backups)));
        }
        if let Some(x) = &self.failed {
            m.push((Value::Uint(12), x.clone()));
        }
        m
    }

    /// The checks that need no other act ("Publication (type 6)").
    pub fn decode(inside: &Inside) -> R<PublicationAct> {
        let mut f: Vec<(u64, &Value)> = vec![];
        for (k, v) in &inside.payload {
            match k {
                Value::Uint(n) if *n <= 12 && !f.iter().any(|(m, _)| m == n) => f.push((*n, v)),
                _ => return Err(AgreementsError::Shape("publication: a field its format does not define")),
            }
        }
        let get = |k: u64| f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v);
        let req = |k: u64, w: &'static str| get(k).ok_or(AgreementsError::Shape(w));
        let sold = match get(0) {
            None => None,
            Some(Value::Array(sv)) => {
                let s = sv.iter().map(Sold::decode).collect::<R<Vec<_>>>()?;
                let enc: Vec<Vec<u8>> = s.iter().map(|x| cbor::encode(&x.to_value())).collect();
                if !enc.windows(2).all(|w| w[0] < w[1]) {
                    return Err(AgreementsError::Check("publication: what it sells is ascending by deterministic encoding, none twice"));
                }
                Some(s)
            }
            Some(_) => return Err(AgreementsError::Shape("publication 0: what it sells")),
        };
        let owners = get(1).map(|v| hash(v, "publication 1: the ownership agreement")).transpose()?;
        let Value::Array(pv) = req(2, "publication 2: the partners")? else {
            return Err(AgreementsError::Shape("publication 2: the partners"));
        };
        let partners = pv.iter().map(Partner::decode).collect::<R<Vec<_>>>()?;
        if !partners.windows(2).all(|w| w[0].identity < w[1].identity) {
            return Err(AgreementsError::Check("publication: the partners ascending by identity, none twice"));
        }
        if partners.iter().any(|p| p.share == 0 || p.share > MILLION) {
            return Err(AgreementsError::Check("publication: a partner's share is above zero, in millionths"));
        }
        let service = hash(req(3, "publication 3: the split service")?, "publication 3")?;
        let plan = SplitPlan::decode(req(4, "publication 4: the split plan")?)?;
        let words = match get(5) {
            None => None,
            Some(Value::Text(t)) => Some(t.clone()),
            Some(_) => return Err(AgreementsError::Shape("publication 5: its words")),
        };
        let time = get(6)
            .map(|v| {
                let a = tuple(v, 2, "publication 6: its time reference")?;
                Ok((hash(&a[0], "publication 6: its time reference's cMIP")?, a[1].clone()))
            })
            .transpose()?;
        let until = get(7).cloned();
        let refund = get(8).map(RefundTerms::decode).transpose()?;
        let Value::Map(cm) = req(9, "publication 9: its cMIPs")? else {
            return Err(AgreementsError::Shape("publication 9: its cMIPs"));
        };
        let cmips = cm
            .iter()
            .map(|(k, v)| Ok((uint(k, "publication 9: a task")?, hash(v, "publication 9: a cMIP")?)))
            .collect::<R<Vec<_>>>()?;
        if !cmips.windows(2).all(|w| w[0].0 < w[1].0) || cmips.iter().any(|(t, _)| *t == 0 || *t > super::formats::LAST_TASK) {
            return Err(AgreementsError::Check("publication 9: at most one cMIP per task, for tasks that exist"));
        }
        if cmips.iter().find(|(t, _)| *t == SPLIT_TASK).is_some_and(|(_, h)| *h != plan.cmip) {
            return Err(AgreementsError::Check("publication: its split cMIP (task 8) is the plan's (key 1)"));
        }
        let designated = get(10).map(|v| hash(v, "publication 10: the designated party")).transpose()?;
        let backups = match get(11) {
            None => vec![],
            Some(v) => {
                let x = hashes(nonempty(v, "publication 11: the backups").map(|_| v)?, "publication 11: the backups")?;
                if !distinct(&x) || x.contains(&service) {
                    return Err(AgreementsError::Check("publication 11: the backups, none twice, none the split service"));
                }
                x
            }
        };
        let failed = get(12).cloned();
        if failed.is_some() && backups.is_empty() {
            return Err(AgreementsError::Check("publication 12: what counts as a failed attempt goes with backups (field 11)"));
        }
        if words.is_none() && sold.iter().flatten().any(|s| matches!(s, Sold::Vow(_))) {
            return Err(AgreementsError::Check("publication: one selling a vow carries its words (field 5)"));
        }
        // Objects: a later version names `[first, previous]` first; where
        // field 1 is present, the ownership agreement as
        // `[agreement, agreement]`; then a collective's chain citations.
        let objects = inside.objects.as_deref().unwrap_or(&[]);
        let mut rest = objects;
        let follows = match objects.first() {
            Some(o) if !(Some(o.chain) == owners && o.chain == o.predecessor) => {
                rest = &objects[1..];
                Some((o.chain, o.predecessor))
            }
            _ => None,
        };
        if let Some(a) = &owners {
            match rest.first() {
                Some(o) if o.chain == *a && o.predecessor == *a => {}
                _ => return Err(AgreementsError::Shape("publication: objects name its ownership agreement, [agreement, agreement]")),
            }
        }
        if sold.as_ref().is_some_and(|s| s.is_empty()) && follows.is_none() {
            return Err(AgreementsError::Check("publication: only a later version sells nothing, ending it; a first version selling nothing omits field 0, a split agreement"));
        }
        Ok(PublicationAct {
            publication: Publication { sold, owners, partners, service, plan, words, time, until, refund, cmips, designated, backups, failed },
            follows,
        })
    }
}
