//! In force, assents, counter signatures, powers and being bound (draft 25,
//! G1.2, G4.1 to G4.4, G4.10, G5.1 to G5.5).
//!
//! In plain words: Terms come into force when the assents their `in_force`
//! cMIP asks for are present, or, with none named, an assent in the name of
//! every party named as a signer (G4.1). An assent counts in someone's name
//! when they signed it themselves, or someone signed it for them under a
//! power their own Terms give (G5.1), or an agreement signed it by its own
//! signature (G1.2). A counter signature cancels an assent made before the
//! Terms came into force, and changes nothing after (G4.10).

use super::answer::short;
use super::sockets::{Ask, Counted, Ending, Out};
use super::{Scope, Tri, Verifier};
use crate::agreements_new::check::Decoded;
use crate::agreements_new::statement::ONE_SIGNING;
use crate::agreements_new::{Kind, Party, PowerKind, Statement, Who};
use crate::hash::Hash;
use std::collections::HashSet;

/// The assents counted toward one Terms act: those that surely count, those
/// whose count is not shown (a counter signature's order), and those that
/// cannot be checked (a power's cMIP not held).
#[derive(Clone, Debug, Default)]
pub(crate) struct Counting {
    pub sure: Vec<Counted>,
    pub maybe: Vec<(Counted, String)>,
    pub doubt: Vec<(Counted, String)>,
    /// Assents left aside, with why (for the answers' plain words).
    pub aside: Vec<(Hash, String)>,
}

impl Counting {
    pub(crate) fn names(&self) -> HashSet<Who> {
        self.sure.iter().map(|c| c.name).collect()
    }
}

/// In whose name an act counts (G5.1, G1.2).
#[derive(Clone, Debug)]
pub(crate) enum Name {
    In(Who),
    Not(String),
    Unchecked(String),
}

impl<'a> Verifier<'a> {
    // ------------------------------------------------------------ in whose name

    /// In whose name a Statement counts: its signer's own (G5.3), or the
    /// person or agreement its `for` names, where its `under` gives the power
    /// (G5.1(b), G1.2).
    pub(crate) fn name_of(&self, id: &Hash, kind: PowerKind) -> Name {
        let Some(a) = self.held.get(id) else { return Name::Unchecked("the act is not held".into()) };
        let Decoded::Statement(s) = &a.act else { return Name::In(Who::Signer(a.signer)) };
        let (Some(for_), Some(under)) = (s.for_, s.under) else { return Name::In(Who::Signer(a.signer)) };
        match self.power(id, s, &under, for_, kind) {
            Tri::Yes => Name::In(for_),
            Tri::No(w) | Tri::NotShown(w) => Name::Not(w),
            Tri::Unchecked(w) => Name::Unchecked(w),
        }
    }

    /// G5.1(b) and G1.2: whether an act made `for` someone under Terms
    /// `under` binds them: those Terms bind them and are in force (or the act
    /// was made before they were replaced, G5.4), give a power for acts of
    /// this kind, and that power's rule says yes; for an agreement with no
    /// such power, every one of its signers signs the same act (one signing).
    pub(crate) fn power(&self, id: &Hash, s: &Statement, under: &Hash, for_: Who, kind: PowerKind) -> Tri {
        let Some(u) = self.held.terms(under) else {
            return Tri::Unchecked(format!("the Terms its `under` names ({}) are not held (G9)", short(under)));
        };
        if self.held.is_invalid(under) {
            return Tri::No("the Terms its `under` names are invalid, and count for nothing".into());
        }
        let u_root = u.agreement.unwrap_or(*under);
        if let Who::Agreement(x) = for_ {
            if u_root != x {
                return Tri::No("its `for` names an agreement and its `under` names Terms of another agreement: not that agreement's signature (G1.2)".into());
            }
        }
        // The Terms giving the power are in force, or the act was made before
        // they were replaced (G5.4).
        match self.in_force_for_power(id, under) {
            Tri::Yes => {}
            other => return other,
        }
        // Those Terms bind the one the act is made for (G5.1(b)).
        if let Who::Signer(p) = for_ {
            let (signed, _) = self.signed_by(under, &Scope::default());
            if !signed.contains(&Who::Signer(p)) {
                return Tri::No("the Terms its `under` names do not bind the one its `for` names: no assent in their name to them is counted (G5.1(b))".into());
            }
        }
        let powers: Vec<_> = u.powers.iter().flatten().filter(|p| kind_matches(p.kind, kind, s)).collect();
        if powers.is_empty() {
            if let Who::Agreement(x) = for_ {
                return self.one_signing(id, s, under, x);
            }
            return Tri::No(format!("the Terms its `under` names give no power of kind {} (G5.1(b))", kind_word(kind)));
        }
        let a = self.held.get(id).unwrap();
        let mut unchecked = None;
        for p in powers {
            match self.ask(&p.rule, Ask::Power { terms: *under, kind, act: *id, signer: a.signer }) {
                Ok((Out::YesNo { yes: true, .. }, _)) => return Tri::Yes,
                Ok(_) => {}
                Err(w) => unchecked = Some(w),
            }
        }
        match unchecked {
            Some(w) => Tri::Unchecked(w),
            None => Tri::No("the power's rule says no (K3)".into()),
        }
    }

    /// An agreement that signs by every one of its signers, with no power for
    /// it (G1.2, "Which acts are one signing"; encoding-1, E24).
    fn one_signing(&self, id: &Hash, s: &Statement, under: &Hash, x: Hash) -> Tri {
        let u = self.held.terms(under).unwrap();
        let signers: Vec<Hash> = u.parties.iter().flatten().filter_map(|p| if let Party::Signer(h) = p { Some(*h) } else { None }).collect();
        if signers.is_empty() {
            return Tri::No("the agreement's Terms give no power for it, and name no signer to sign by (G1.2)".into());
        }
        let key = |s: &Statement| -> Vec<Vec<u8>> {
            let p = s.payload_unchecked();
            ONE_SIGNING
                .iter()
                .map(|k| p.iter().find(|(kk, _)| *kk == crate::cbor::Value::Uint(*k)).map(|(_, v)| crate::cbor::encode(v)).unwrap_or_default())
                .collect()
        };
        let mine = key(s);
        let mut missing = vec![];
        for g in &signers {
            let found = self.held.acts().iter().any(|o| {
                o.signer == *g && o.invalid.is_empty() && matches!(&o.act, Decoded::Statement(os) if os.for_ == Some(Who::Agreement(x)) && key(os) == mine)
            });
            if !found {
                missing.push(*g);
            }
        }
        let _ = id;
        if missing.is_empty() {
            Tri::Yes
        } else {
            Tri::NotShown(format!(
                "the agreement's Terms give no power for this kind, so it signs by every one of its signers; the same act is not held from {} of them (G1.2)",
                missing.len()
            ))
        }
    }

    /// Whether the Terms that give a power are in force for an act made under
    /// them: in force now; or replaced, and the act made before the
    /// replacing Terms came into force (G5.4).
    fn in_force_for_power(&self, act: &Hash, under: &Hash) -> Tri {
        let root = self.held.agreement_of(under).unwrap_or(*under);
        if self.walking(&root) {
            return Tri::Unchecked("the power is given by Terms of an agreement whose reading leans on this act (G9.2)".into());
        }
        let c = self.chain(&root);
        if c.last() == Some(*under) {
            return Tri::Yes;
        }
        if let Some(next) = c.next_after(under) {
            // G5.4: before or after the replacing Terms came into force.
            return match self.before_in_force(act, &next, under) {
                Tri::Yes => Tri::Yes,
                Tri::No(_) => Tri::No("the act was made after the Terms that gave the power were replaced (G5.4)".into()),
                other => other,
            };
        }
        if let Some(why) = c.why_not(under) {
            return why;
        }
        Tri::No("the Terms its `under` names are not in force (G4.6)".into())
    }

    /// G5.4 and G13.3: whether `act` came before the replacing Terms `next`
    /// came into force. Per place where `original` names one: by positions;
    /// otherwise by citing alone; not shown where citing gives no order.
    pub(crate) fn before_in_force(&self, act: &Hash, next: &Hash, original: &Hash) -> Tri {
        let (scope, _) = match self.scope_of(original) {
            Ok(x) => x,
            Err(w) => return Tri::Unchecked(w),
        };
        if let Some(p) = scope.place {
            let place = self.layers.places.get(&p).unwrap();
            let Some(pos) = (match place.position(act) {
                super::PlaceSays::At(n) => Some(n),
                _ => None,
            }) else {
                return Tri::NotShown("the place does not show the act".into());
            };
            return match self.first_position(next, original, &scope) {
                Ok(Some(f)) if pos < f => Tri::Yes,
                Ok(Some(_)) => Tri::No("after, per place".into()),
                Ok(None) => Tri::Yes,
                Err(w) => Tri::Unchecked(w),
            };
        }
        // By citing alone (G13.3).
        let named = self.closure(act);
        if self.is_update(next, original, &scope.only(named)).yes() {
            return Tri::No("the act names, directly or through acts that name them, enough acts for the replacing Terms to be valid and in force: it came after (G13.3)".into());
        }
        let naming = self.naming_it(act);
        if !self.is_update(next, original, &scope.without(naming)).yes() {
            return Tri::Yes;
        }
        Tri::NotShown("citing gives no order between the act and the replacing Terms coming into force (G5.4, G13.3)".into())
    }

    // ------------------------------------------------------------ assents

    /// The assents counted toward Terms `t` in a scope (G4.1, G4.3, G4.10,
    /// G6, G12.2).
    pub(crate) fn counted(&self, t: &Hash, scope: &Scope) -> Counting {
        let mut c = Counting::default();
        let root = self.held.agreement_of(t).unwrap_or(*t);
        for a in self.held.acts() {
            let Decoded::Statement(s) = &a.act else { continue };
            if s.kind != Kind::Assent || s.terms != *t {
                continue;
            }
            let id = a.id;
            match self.counts(scope, &id) {
                Ok(true) => {}
                Ok(false) => continue,
                Err(w) => {
                    c.doubt.push((Counted { assent: id, name: Who::Signer(a.signer) }, w));
                    continue;
                }
            }
            if s.agreement != root {
                c.aside.push((id, "its `agreement` is not the root of the agreement of the Terms it names: not shown as made within them (section 3.2)".into()));
                continue;
            }
            if !a.invalid.is_empty() {
                c.aside.push((id, format!("invalid ({})", a.invalid[0].rule)));
                continue;
            }
            if let Some(why) = self.stopped(&id, Some(t)) {
                c.aside.push((id, why));
                continue;
            }
            let name = match self.name_of(&id, PowerKind::Assent) {
                Name::In(w) => w,
                Name::Not(w) => {
                    c.aside.push((id, w));
                    continue;
                }
                Name::Unchecked(w) => {
                    c.doubt.push((Counted { assent: id, name: s.for_.unwrap_or(Who::Signer(a.signer)) }, w));
                    continue;
                }
            };
            let k = Counted { assent: id, name };
            match self.cancelled(&id, name, t, scope) {
                Tri::Yes => c.aside.push((id, "cancelled by a counter signature (G4.10)".into())),
                Tri::No(_) => c.sure.push(k),
                Tri::NotShown(w) => c.maybe.push((k, w)),
                Tri::Unchecked(w) => c.doubt.push((k, w)),
            }
        }
        c
    }

    /// G4.1 given the names counted: the `in_force` cMIP's answer, or the
    /// default (every party named as a signer; none named: in force at once).
    pub(crate) fn in_force_given(&self, t: &Hash, counted: &[Counted]) -> Tri {
        let Some(terms) = self.held.terms(t) else { return Tri::Unchecked("the Terms are not held".into()) };
        if let Some(s) = &terms.in_force {
            return match self.ask(s, Ask::InForce { terms: *t, counted }) {
                Ok((Out::YesNo { yes: true, .. }, _)) => Tri::Yes,
                Ok((Out::YesNo { yes: false, ground }, _)) => Tri::No(format!("the `in_force` cMIP says the assents it requires are not present: {ground} (K2)")),
                Ok(_) => Tri::Unchecked("the `in_force` cMIP gave no yes or no (K2)".into()),
                Err(w) => Tri::Unchecked(w),
            };
        }
        let names: HashSet<Who> = counted.iter().map(|c| c.name).collect();
        let missing: Vec<Hash> = terms
            .parties
            .iter()
            .flatten()
            .filter_map(|p| if let Party::Signer(h) = p { Some(*h) } else { None })
            .filter(|h| !names.contains(&Who::Signer(*h)))
            .collect();
        if missing.is_empty() {
            Tri::Yes
        } else {
            Tri::No(format!(
                "by the default of G4.1, an assent in the name of every party named as a signer; none is counted for {}",
                missing.iter().map(short).collect::<Vec<_>>().join(", ")
            ))
        }
    }

    /// G4.1 in a scope, from the assents counted: yes where the sure ones are
    /// enough; no where even every one held would not be; otherwise not shown
    /// (a counter signature's order) or unchecked.
    pub(crate) fn in_force_raw(&self, t: &Hash, scope: &Scope) -> Tri {
        if self.held.is_invalid(t) {
            return Tri::No("the Terms are invalid, and count for nothing".into());
        }
        let c = self.counted(t, scope);
        let sure = self.in_force_given(t, &c.sure);
        if sure.yes() {
            return Tri::Yes;
        }
        if let Tri::Unchecked(w) = sure {
            return Tri::Unchecked(w);
        }
        if c.maybe.is_empty() && c.doubt.is_empty() {
            return sure;
        }
        let mut all = c.sure.clone();
        all.extend(c.maybe.iter().map(|(k, _)| *k));
        all.extend(c.doubt.iter().map(|(k, _)| *k));
        match self.in_force_given(t, &all) {
            Tri::Yes => {
                if let Some((_, w)) = c.doubt.first() {
                    Tri::Unchecked(w.clone())
                } else {
                    Tri::NotShown(format!("whether the Terms are in force is not shown: {}", c.maybe[0].1))
                }
            }
            other => other,
        }
    }

    // ------------------------------------------------------------ counter signatures

    /// G4.10: whether a counter signature cancels the assent `a`, counted in
    /// `name`, toward Terms `t`.
    pub(crate) fn cancelled(&self, a: &Hash, name: Who, t: &Hash, scope: &Scope) -> Tri {
        if scope.uncancel == Some(*a) {
            return Tri::No("read as not yet cancelled".into());
        }
        let Some(cs) = self.first_counter_signature(a, name, t, scope) else { return Tri::No("no counter signature follows it".into()) };
        self.counter_cancels(&cs, a, t, scope)
    }

    /// The counter signatures in the same name as the assent that follow it:
    /// in its signer's own line, or naming it directly or through acts that
    /// name it; the first of them (G4.10, "Which assent").
    pub(crate) fn first_counter_signature(&self, a: &Hash, name: Who, t: &Hash, scope: &Scope) -> Option<Hash> {
        let a_signer = self.held.get(a)?.signer;
        let mut found: Vec<Hash> = vec![];
        for x in self.held.acts() {
            let Decoded::Statement(s) = &x.act else { continue };
            if s.kind != Kind::CounterSignature || s.terms != *t || !x.invalid.is_empty() {
                continue;
            }
            if !matches!(self.counts(scope, &x.id), Ok(true)) {
                continue;
            }
            if self.stopped(&x.id, None).is_some() {
                continue;
            }
            let in_name = match s.for_ {
                None => Who::Signer(x.signer) == name,
                Some(f) => f == name && matches!(self.name_of(&x.id, PowerKind::CounterSignature), Name::In(_)),
            };
            if !in_name {
                continue;
            }
            let follows = (x.signer == a_signer && self.in_line_before(&x.id, a)) || self.closure(&x.id).contains(a);
            if follows {
                found.push(x.id);
            }
        }
        // The first: one that follows no other of them.
        found.sort();
        let first = found.iter().find(|c| !found.iter().any(|o| o != *c && (self.in_line_before(c, o) || self.closure(c).contains(o))));
        first.copied()
    }

    /// Whether `earlier` is before `act` in `act`'s signer's line, by
    /// `previous`.
    pub(crate) fn in_line_before(&self, act: &Hash, earlier: &Hash) -> bool {
        let mut cur = *act;
        let mut steps = 0;
        while let Some(Some(p)) = self.held.previous_of(&cur) {
            if p == *earlier {
                return true;
            }
            cur = p;
            steps += 1;
            if steps > 10_000 {
                return false;
            }
        }
        false
    }

    /// G4.10's order: does the counter signature `c` cancel `a`? It changes
    /// nothing where it came after the Terms came into force; it cancels where
    /// it came before; otherwise not shown.
    pub(crate) fn counter_cancels(&self, c: &Hash, a: &Hash, t: &Hash, scope: &Scope) -> Tri {
        if scope.depth >= self.limits.counter_signatures {
            return Tri::Unchecked(format!(
                "counter signatures lean on one another, and the verifier stopped after {} readings (G9.2)",
                self.limits.counter_signatures
            ));
        }
        let inner = Scope { uncancel: Some(*a), ..scope.deeper() };
        // Nothing had completed them: it cancels.
        match self.in_force_raw(t, &inner) {
            Tri::No(_) => return Tri::Yes,
            Tri::Unchecked(w) => return Tri::Unchecked(w),
            _ => {}
        }
        if let Some(p) = scope.place {
            let place = self.layers.places.get(&p).unwrap();
            let pos = match place.position(c) {
                super::PlaceSays::At(n) => n,
                _ => return Tri::Unchecked("the place does not show the counter signature".into()),
            };
            let first = self.first_position_in_force(t, &inner);
            return match first {
                Ok(Some(f)) if pos < f => Tri::Yes,
                Ok(Some(_)) => Tri::No("it came after the Terms came into force, per place, and changes nothing (G4.10)".into()),
                Ok(None) => Tri::Yes,
                Err(w) => Tri::Unchecked(w),
            };
        }
        // By citing alone (G13.3).
        let named = self.closure(c);
        if self.in_force_raw(t, &inner.only(named)).yes() {
            return Tri::No("the assents it names are enough for the Terms to be in force: it came after, and changes nothing (G4.10)".into());
        }
        let naming = self.naming_it(c);
        if let Tri::No(_) = self.in_force_raw(t, &inner.without(naming)) {
            return Tri::Yes;
        }
        Tri::NotShown("citing gives no order between the counter signature and the Terms coming into force (G4.10)".into())
    }

    /// The first position of a place at which, counting only the acts it
    /// shows at or before it, Terms are in force (G13.3, G4.10).
    pub(crate) fn first_position_in_force(&self, t: &Hash, scope: &Scope) -> Result<Option<u64>, String> {
        let Some(p) = scope.place else { return Ok(None) };
        let place = self.layers.places.get(&p).ok_or("no answer from the place")?;
        let mut positions: Vec<u64> = self
            .held
            .acts()
            .iter()
            .filter_map(|a| match place.position(&a.id) {
                super::PlaceSays::At(n) => Some(n),
                _ => None,
            })
            .collect();
        positions.sort();
        positions.dedup();
        for n in positions {
            match self.in_force_raw(t, &Scope { upto: Some(n), ..scope.clone() }) {
                Tri::Yes => return Ok(Some(n)),
                Tri::Unchecked(w) => return Err(w),
                _ => {}
            }
        }
        Ok(None)
    }

    // ------------------------------------------------------------ everyone who signed

    /// G4.8(a): everyone who signed `o`: each party in whose name an assent
    /// to it counts, and each party bound by it through the version before,
    /// where it still names them. With the reason it is unchecked, where a
    /// role's cMIP is lacking and an assent by someone not named might fill
    /// it.
    pub(crate) fn signed_by(&self, o: &Hash, scope: &Scope) -> (HashSet<Who>, Option<String>) {
        let Some(terms) = self.held.terms(o) else { return (HashSet::new(), Some("the original is not held".into())) };
        let c = self.counted(o, scope);
        let named_signers: HashSet<Hash> = terms.parties.iter().flatten().filter_map(|p| if let Party::Signer(h) = p { Some(*h) } else { None }).collect();
        let named_agreements: HashSet<Hash> = terms.parties.iter().flatten().filter_map(|p| if let Party::Agreement(h) = p { Some(*h) } else { None }).collect();
        let fillers = self.role_fillers(o);
        let mut unchecked = None;
        let mut out = HashSet::new();
        for k in &c.sure {
            match k.name {
                Who::Signer(h) if named_signers.contains(&h) => {
                    out.insert(k.name);
                }
                Who::Signer(h) => match &fillers {
                    Ok(f) if f.contains(&h) => {
                        out.insert(k.name);
                    }
                    Ok(_) => {}
                    Err(w) => unchecked = Some(format!("{w}; an assent by someone the original does not name as a signer is held, who might fill that role (G4.8(a))")),
                },
                Who::Agreement(x) if named_agreements.contains(&x) => {
                    out.insert(k.name);
                }
                Who::Agreement(_) => {}
            }
        }
        if !c.doubt.is_empty() && unchecked.is_none() {
            unchecked = Some(c.doubt[0].1.clone());
        }
        // Bound through the version before, still named here (G4.8(a), G5.1(c)).
        if let (Some(prev), true) = (terms.replaces, terms.parties.is_some()) {
            if self.held.terms(&prev).is_some() && scope.depth < 16 {
                let (before, u) = self.signed_by(&prev, &scope.plain().deeper());
                for w in before {
                    let still = match w {
                        Who::Signer(h) => named_signers.contains(&h),
                        Who::Agreement(x) => named_agreements.contains(&x),
                    };
                    if still {
                        out.insert(w);
                    }
                }
                if unchecked.is_none() {
                    unchecked = u;
                }
            }
        }
        (out, unchecked)
    }

    /// The signers who fill a role of `t`, by its K5 cMIPs; `Err` where one is
    /// lacking.
    pub(crate) fn role_fillers(&self, t: &Hash) -> Result<HashSet<Hash>, String> {
        let Some(terms) = self.held.terms(t) else { return Err("not held".into()) };
        let mut out = HashSet::new();
        for (i, p) in terms.parties.iter().flatten().enumerate() {
            let Party::Role(r) = p else { continue };
            let Some(spot) = &r.spot else { continue };
            match self.ask(spot, Ask::Spot { terms: *t, party: i as u64 }) {
                Ok((Out::Spot(s), _)) => out.extend(s.fillings.iter().map(|f| f.signer)),
                Ok(_) => {}
                Err(w) => return Err(format!("this verifier lacks the cMIP of a role of the original (K5): {w}")),
            }
        }
        Ok(out)
    }

    // ------------------------------------------------------------ the update condition

    /// G4.8 and G4.11 for one proposed update `l` of the original `o`, in a
    /// scope: the condition's answer (or the default's), and whether `l` is
    /// then in force (G4.1; for a delegation ended by its delegator alone,
    /// G5.5). Returns the update's answer word as a [`Tri`] (Yes: valid and
    /// in force), and the plain words with the cMIP named.
    pub(crate) fn update_raw(&self, l: &Hash, o: &Hash, scope: &Scope) -> (Tri, Option<super::CmipNamed>) {
        let Some(orig) = self.held.terms(o) else { return (Tri::Unchecked("the original is not held".into()), None) };
        let Some(_lt) = self.held.terms(l) else { return (Tri::Unchecked("the proposed update is not held".into()), None) };
        if self.held.is_invalid(l) {
            return (Tri::No(format!("invalid ({})", self.held.get(l).unwrap().invalid[0].rule)), None);
        }
        let counted = self.counted(l, scope);
        let (signed, unchecked) = self.signed_by(o, scope);
        if let Some(cond) = &orig.condition {
            let signed_v: Vec<Who> = signed.iter().copied().collect();
            return match self.ask(cond, Ask::Update { original: *o, proposed: *l, counted: &counted.sure, signed_original: &signed_v }) {
                Ok((Out::Update { valid: true, ground }, fp)) => {
                    let named = super::CmipNamed::Cmip { task: "K4", fingerprint: fp, ground };
                    (self.then_in_force(l, scope, false), Some(named))
                }
                Ok((Out::Update { valid: false, ground }, fp)) => {
                    (Tri::No(format!("not valid: the update condition answers so: {ground} (G4.11(c))")), Some(super::CmipNamed::Cmip { task: "K4", fingerprint: fp, ground }))
                }
                Ok(_) => (Tri::Unchecked("the update condition gave no answer (K4)".into()), None),
                Err(w) => (Tri::Unchecked(w), None),
            };
        }
        let by_default = Some(super::CmipNamed::ByDefault { task: "K4" });
        if let Some(w) = unchecked {
            return (Tri::Unchecked(w), by_default);
        }
        let have = counted.names();
        let missing: Vec<Who> = signed.iter().filter(|w| !have.contains(w)).copied().collect();
        if missing.is_empty() {
            return (self.then_in_force(l, scope, false), by_default);
        }
        // G5.5: a delegation the delegator ends alone.
        if orig.powers.is_some() {
            match self.delegation_end(l, o, &have) {
                Some(Tri::Yes) => return (self.then_in_force(l, scope, true), by_default),
                Some(other) => return (other, by_default),
                None => {}
            }
        }
        let maybe: HashSet<Who> = counted.maybe.iter().chain(counted.doubt.iter()).map(|(k, _)| k.name).collect();
        if missing.iter().all(|w| maybe.contains(w)) && !counted.doubt.is_empty() {
            return (Tri::Unchecked(counted.doubt[0].1.clone()), by_default);
        }
        (
            Tri::NotShown(format!(
                "by default, everyone who signed the original signs an update; no assent to it is held in the name of {} (G4.8(c), G4.11(e))",
                missing.iter().map(|w| match w { Who::Signer(h) | Who::Agreement(h) => short(h) }).collect::<Vec<_>>().join(", ")
            )),
            by_default,
        )
    }

    /// After the condition answers valid: the update is then one if it is in
    /// force by its own `in_force` (G4.8, G4.1), or, for a delegation ended by
    /// the delegator's part alone, at once (G5.5).
    fn then_in_force(&self, l: &Hash, scope: &Scope, delegation: bool) -> Tri {
        if delegation {
            return Tri::Yes;
        }
        match self.in_force_raw(l, scope) {
            Tri::Yes => Tri::Yes,
            Tri::No(w) => Tri::NotShown(format!("valid, and not in force by its own `in_force`: {w} (G4.8, G4.1)")),
            other => other,
        }
    }

    /// G5.5, (iii): the body is read; a delegation whose version removes or
    /// narrows the power, carrying the delegator's part alone (or the
    /// agent's, under a condition that leaves ending to the agent).
    fn delegation_end(&self, l: &Hash, o: &Hash, have: &HashSet<Who>) -> Option<Tri> {
        let orig = self.held.terms(o)?;
        let lt = self.held.terms(l)?;
        let body = orig.body.as_ref()?;
        let reading = match self.ask(&body.socket, Ask::Body { terms: *o }) {
            Ok((Out::Body(r), _)) => r,
            Ok(_) => return None,
            Err(w) => return Some(Tri::Unchecked(format!("the Terms carry powers, and the verifier cannot read their body to tell whether they are a delegation: {w} (G5.5)"))),
        };
        let d = reading.delegation?;
        let old: Vec<Vec<u8>> = orig.powers.iter().flatten().map(power_bytes).collect();
        let new: Vec<Vec<u8>> = lt.powers.iter().flatten().map(power_bytes).collect();
        let narrower = new.len() < old.len() && new.iter().all(|p| old.contains(p));
        if !narrower {
            return None;
        }
        let party = |i: u64| -> Option<Who> {
            match orig.parties.as_ref()?.get(i as usize)? {
                Party::Signer(h) => Some(Who::Signer(*h)),
                Party::Agreement(x) => Some(Who::Agreement(*x)),
                Party::Role(_) => None,
            }
        };
        let (who, by) = match d.ending {
            Ending::ByDelegator => (party(d.delegator), "the delegator's part alone"),
            Ending::ByAgentAlone => (party(d.agent), "the agent's part alone, under a condition that leaves ending to the agent"),
            Ending::Stated(s) => return Some(Tri::Unchecked(format!("the delegation states a condition on ending it that this verifier cannot apply in the form the body's cMIP gives it: {s} (G5.5)"))),
        };
        match who {
            Some(w) if have.contains(&w) => {
                let _ = by;
                Some(Tri::Yes)
            }
            _ => None,
        }
    }
}

fn power_bytes(p: &crate::agreements_new::Power) -> Vec<u8> {
    let k = match p.kind {
        PowerKind::Assent => vec![0],
        PowerKind::CounterSignature => vec![1],
        PowerKind::Contest => vec![2],
        PowerKind::Resolves => vec![3],
        PowerKind::Replaces => vec![4],
        PowerKind::Defined(h) => h.to_vec(),
    };
    let mut v = k;
    v.extend(crate::cbor::encode(&p.rule.to_value()));
    v
}

/// Whether a power's kind is the kind of an act (encoding-1, E15: a K7 kind
/// matches where its hash is the Statement's kind's cMIP). A power of kind
/// `replaces` gives no power (G5.2).
fn kind_matches(power: PowerKind, asked: PowerKind, s: &Statement) -> bool {
    match (power, asked) {
        (PowerKind::Replaces, _) => false,
        (PowerKind::Defined(h), PowerKind::Defined(_)) => s.kind.defined() == Some(h),
        (a, b) => a == b,
    }
}

pub(crate) fn kind_word(k: PowerKind) -> &'static str {
    match k {
        PowerKind::Assent => "assent",
        PowerKind::CounterSignature => "counter_signature",
        PowerKind::Contest => "contest",
        PowerKind::Resolves => "resolves",
        PowerKind::Replaces => "replaces",
        PowerKind::Defined(_) => "a kind defined by a cMIP",
    }
}

/// The power kind of a Statement's own kind.
pub(crate) fn power_kind_of(k: &Kind) -> PowerKind {
    match k {
        Kind::Assent => PowerKind::Assent,
        Kind::CounterSignature => PowerKind::CounterSignature,
        Kind::Contest => PowerKind::Contest,
        Kind::Resolve => PowerKind::Resolves,
        Kind::Defined { cmip, .. } => PowerKind::Defined(*cmip),
    }
}
