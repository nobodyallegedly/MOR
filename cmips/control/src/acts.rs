//! This cMIP's own acts (its section 7; Agreements draft 19, rule 99): the
//! issuance offer (type 26; rule 96), the proxy (type 27) and the
//! revocation of a proxy (type 28; rule 97), of this cMIP's specification,
//! its `spec` field this cMIP's hash. Moved from the core's
//! `agreements/owners.rs`, where they were Agreements types: the formats are
//! unchanged; the core no longer decodes them.
//!
//! In plain words: a collective offers each owner of a stake its own
//! proportion of new shares, on the same terms, for a period; an owner
//! hands its vote on the owners' matters of one stake to another identity,
//! for one version or until revoked, and takes it back.

use mor_core::act::Inside;
use mor_core::agreements::control::{ActKind, OfferRead, ProxyRead};
use mor_core::agreements::{check_objects_self, hash, nonempty, tuple, uint, AgreementsError, MILLION};
use mor_core::cbor::Value;
use mor_core::hash::Hash;
use mor_core::money::Amount;

type R<T> = Result<T, AgreementsError>;

/// The act types this cMIP's specification declares, numbered within it.
pub mod types {
    /// An issuance offer (rule 96).
    pub const ISSUANCE_OFFER: u64 = 26;
    /// A proxy (rule 97).
    pub const PROXY: u64 = 27;
    /// The revocation of a proxy (rule 97).
    pub const PROXY_REVOCATION: u64 = 28;
}

/// What each declared type is to the core (Agreements rule 99, the line as
/// data); `None` for a type this specification does not declare.
pub fn kind(type_: u64) -> Option<ActKind> {
    match type_ {
        types::ISSUANCE_OFFER => Some(ActKind::Offer),
        types::PROXY => Some(ActKind::Proxy),
        types::PROXY_REVOCATION => Some(ActKind::Revocation),
        _ => None,
    }
}

/// Whether an act of this specification is in its type's format.
pub fn in_format(inside: &Inside) -> R<()> {
    match inside.type_ {
        types::ISSUANCE_OFFER => IssuanceOffer::decode(inside).map(|_| ()),
        types::PROXY => Proxy::decode(inside).map(|_| ()),
        types::PROXY_REVOCATION => decode_proxy_revocation(inside).map(|_| ()),
        _ => Err(AgreementsError::Shape("a type the default control cMIP does not declare")),
    }
}

fn b(h: &Hash) -> Value {
    Value::Bytes(h.to_vec())
}

fn fields<'a>(inside: &'a Inside, n: u64, w: &'static str) -> R<Vec<(u64, &'a Value)>> {
    let mut out: Vec<(u64, &Value)> = Vec::new();
    for (k, v) in &inside.payload {
        match k {
            Value::Uint(k) if *k < n && !out.iter().any(|(x, _)| x == k) => out.push((*k, v)),
            _ => return Err(AgreementsError::Shape(w)),
        }
    }
    Ok(out)
}

fn get<'a>(f: &[(u64, &'a Value)], k: u64) -> Option<&'a Value> {
    f.iter().find(|(n, _)| *n == k).map(|(_, v)| *v)
}

/// An issuance offer (type 26): the version defining the stake, the stake,
/// the issuance's size (the new shares' part of the stake after it, in
/// millionths), the new holders and their parts, the period, and its
/// price, words and a cMIP offering more.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct IssuanceOffer {
    /// 0: the version of the collective's agreement defining the stake, in
    /// force where the offer is made.
    pub version: Hash,
    /// 1: the stake, by its index there.
    pub stake: u64,
    /// 2: the new shares' part of the stake after the issuance, in
    /// millionths, above zero and below one whole.
    pub size: u64,
    /// 3: the new holders, ascending, none twice, their parts summing to one
    /// whole.
    pub new_holders: Vec<(Hash, u64)>,
    /// 4: the period: a point on the agreement's time reference.
    pub period: Value,
    /// 5: the price of the whole issuance, each holder taking up paying its
    /// proportion; absent, none.
    pub price: Option<Amount>,
    /// 6: the offer's words, canonical text.
    pub words: Option<String>,
    /// 7: a cMIP and its parameters offering more (F315).
    pub more: Option<(Hash, Value)>,
}

impl IssuanceOffer {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.version)),
            (Value::Uint(1), Value::Uint(self.stake)),
            (Value::Uint(2), Value::Uint(self.size)),
            (
                Value::Uint(3),
                Value::Array(self.new_holders.iter().map(|(h, n)| Value::Array(vec![b(h), Value::Uint(*n)])).collect()),
            ),
            (Value::Uint(4), self.period.clone()),
        ];
        if let Some(p) = &self.price {
            m.push((Value::Uint(5), p.to_value()));
        }
        if let Some(w) = &self.words {
            m.push((Value::Uint(6), Value::Text(w.clone())));
        }
        if let Some((h, p)) = &self.more {
            m.push((Value::Uint(7), Value::Array(vec![b(h), p.clone()])));
        }
        m
    }

    /// Decode, and check the inside names the agreement as chain and
    /// predecessor, followed by its chain citations (rule 58).
    pub fn decode(inside: &Inside) -> R<IssuanceOffer> {
        let f = fields(inside, 8, "issuance offer: unknown field")?;
        let req = |k, w| get(&f, k).ok_or(AgreementsError::Shape(w));
        let version = hash(req(0, "issuance offer: the version")?, "issuance offer: the version")?;
        let size = uint(req(2, "issuance offer: the size")?, "issuance offer: the size")?;
        if size == 0 || size >= MILLION {
            return Err(AgreementsError::Check("issuance offer: the size is above zero and below one whole, in millionths (F309)"));
        }
        let new_holders = nonempty(req(3, "issuance offer: the new holders")?, "issuance offer: the new holders")?
            .iter()
            .map(|x| {
                let a = tuple(x, 2, "issuance offer: a new holder is [holder, share]")?;
                Ok((hash(&a[0], "issuance offer: a new holder")?, uint(&a[1], "issuance offer: a new holder's share")?))
            })
            .collect::<R<Vec<_>>>()?;
        if new_holders.windows(2).any(|w| w[0].0 >= w[1].0)
            || new_holders.iter().any(|(_, n)| *n == 0)
            || new_holders.iter().map(|(_, n)| *n).sum::<u64>() != MILLION
        {
            return Err(AgreementsError::Check(
                "issuance offer: the new holders ascending, none twice, each above zero, their parts summing to one whole (F309)",
            ));
        }
        let o = IssuanceOffer {
            version,
            stake: uint(req(1, "issuance offer: the stake")?, "issuance offer: the stake")?,
            size,
            new_holders,
            period: req(4, "issuance offer: the period")?.clone(),
            price: get(&f, 5)
                .map(|v| Amount::decode(v).map_err(|_| AgreementsError::Shape("issuance offer: the price")))
                .transpose()?,
            words: get(&f, 6)
                .map(|v| match v {
                    Value::Text(t) => Ok(t.clone()),
                    _ => Err(AgreementsError::Shape("issuance offer: the words")),
                })
                .transpose()?,
            more: get(&f, 7)
                .map(|v| {
                    let a = tuple(v, 2, "issuance offer: a cMIP and its parameters")?;
                    Ok((hash(&a[0], "issuance offer: the cMIP")?, a[1].clone()))
                })
                .transpose()?,
        };
        let agreement = Self::agreement(inside).ok_or(AgreementsError::Shape("issuance offer: objects name the agreement first"))?;
        names_first(inside, &agreement, "issuance offer: objects name the agreement as chain and predecessor, then its chain citations")?;
        Ok(o)
    }

    /// The agreement it names as chain and predecessor.
    pub fn agreement(inside: &Inside) -> Option<Hash> {
        inside.objects.as_ref()?.first().filter(|o| o.chain == o.predecessor).map(|o| o.chain)
    }
}

/// The inside of an act naming `x` as chain and predecessor, first.
pub fn names_first(inside: &Inside, x: &Hash, w: &'static str) -> R<()> {
    check_objects_self(inside, x, w)
}

/// A proxy (type 27): a holder of a stake hands its vote on the owners'
/// matters of that stake to another identity, scoped to one version or
/// standing (rule 97, F327).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Proxy {
    /// 0: the version of the collective's agreement defining the stake.
    pub version: Hash,
    /// 1: the stake, by its index there.
    pub stake: u64,
    /// 2: the proxy: the identity whose signature act on a version counts
    /// as the holder's vote.
    pub proxy: Hash,
    /// 3: the version it votes on; absent, standing.
    pub scoped: Option<Hash>,
}

impl Proxy {
    pub fn to_map(&self) -> Vec<(Value, Value)> {
        let mut m = vec![
            (Value::Uint(0), b(&self.version)),
            (Value::Uint(1), Value::Uint(self.stake)),
            (Value::Uint(2), b(&self.proxy)),
        ];
        if let Some(s) = &self.scoped {
            m.push((Value::Uint(3), b(s)));
        }
        m
    }

    /// The agreement its inside names as chain and predecessor, as a
    /// resignation's does: `[[agreement, agreement]]`, never a fork.
    pub fn agreement(inside: &Inside) -> R<Hash> {
        let o = inside.objects.as_deref().unwrap_or(&[]);
        match o {
            [x] if x.chain == x.predecessor => Ok(x.chain),
            _ => Err(AgreementsError::Shape("proxy: objects name the agreement as chain and predecessor, alone")),
        }
    }

    /// Decode, with its inside's shape.
    pub fn decode(inside: &Inside) -> R<Proxy> {
        Self::agreement(inside)?;
        let f = fields(inside, 4, "proxy: unknown field")?;
        let req = |k, w| get(&f, k).ok_or(AgreementsError::Shape(w));
        Ok(Proxy {
            version: hash(req(0, "proxy: the version")?, "proxy: the version")?,
            stake: uint(req(1, "proxy: the stake")?, "proxy: the stake")?,
            proxy: hash(req(2, "proxy: the proxy")?, "proxy: the proxy")?,
            scoped: get(&f, 3).map(|v| hash(v, "proxy: the version it votes on")).transpose()?,
        })
    }
}

/// The revocation of a proxy (type 28): `{ 0 => proxy }`, its inside naming
/// the proxy as chain and predecessor.
pub fn decode_proxy_revocation(inside: &Inside) -> R<Hash> {
    let f = fields(inside, 1, "revocation of a proxy: unknown field")?;
    let p = hash(get(&f, 0).ok_or(AgreementsError::Shape("revocation of a proxy: the proxy"))?, "revocation of a proxy: the proxy")?;
    names_first(inside, &p, "revocation of a proxy: objects name the proxy as chain and predecessor")?;
    Ok(p)
}

/// The payload of a revocation of a proxy.
pub fn proxy_revocation_payload(proxy: &Hash) -> Vec<(Value, Value)> {
    vec![(Value::Uint(0), b(proxy))]
}


impl From<&IssuanceOffer> for OfferRead {
    fn from(o: &IssuanceOffer) -> OfferRead {
        OfferRead { version: o.version, stake: o.stake, size: o.size, new_holders: o.new_holders.clone(), period: o.period.clone(), price: o.price.clone() }
    }
}

impl From<&Proxy> for ProxyRead {
    fn from(p: &Proxy) -> ProxyRead {
        ProxyRead { version: p.version, stake: p.stake, proxy: p.proxy, scoped: p.scoped }
    }
}
