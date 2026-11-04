//! What a clone changes, and the core's floor (Agreements draft 18, rules
//! 67, 98 and 99; F421, F422).
//!
//! In plain words: compare the clone with its parent field by field (and
//! fields 2, 15 and the areas' words entry by entry). A change of the
//! constitution needs the constitutional change rule; a change of the
//! judicial tier, every member whose voice remains; both, both. The core
//! reads these itself and never asks a model. What an operational change
//! needs is the collective's control model's answer (its areas, its layer
//! rules, its clone rule: `cmips/control`), or, with no model, the last
//! resort. Which power is needed is read from the bytes, never from what the
//! clone says of itself.

use super::formats::{
    layers, task_layer, AgreementsError, Mirs, Power, Terms, JUDICIAL_TASKS, R,
};
use crate::cbor;
use crate::hash::Hash;

/// A tier (rule 44a).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Tier {
    Constitutional,
    Judicial,
    Operational,
}

/// One change a clone makes (rule 44b).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Change {
    /// A whole field (any but 2, 4, 11, 15 and 20).
    Field(u64),
    /// One entry of field 2, by task number: added, removed or replaced.
    Task(u64),
    /// One entry of field 15, by extension: added or dropped.
    Extension(Hash),
    /// One entry of field 20, by area id.
    Words(u64),
}

impl Change {
    /// The tier of the change (rule 44a's table).
    pub fn tier(&self) -> Tier {
        match self {
            // F422: the judicial tier, the core's, every member whatever
            // field 18 says (Agreements rule 67).
            Change::Field(f) if JUDICIAL_FIELDS.contains(f) => Tier::Judicial,
            Change::Task(t) if JUDICIAL_TASKS.contains(t) => Tier::Judicial,
            // F421: the rest of the constitution, the core's (rule 98): its
            // fields, and the control model with its parameters (34 the
            // areas, 30 the holders' rules, 20 the areas' words).
            Change::Field(f) if CONSTITUTION.contains(f) || [20, 30, 34].contains(f) => Tier::Constitutional,
            Change::Words(_) => Tier::Constitutional,
            Change::Field(_) | Change::Task(_) | Change::Extension(_) => Tier::Operational,
        }
    }
}

/// The collective's constitution (Agreements rule 98, F421): terms fields
/// changed only under the constitutional change rule.
pub const CONSTITUTION: [u64; 16] = [0, 1, 3, 5, 6, 9, 12, 13, 16, 17, 18, 19, 21, 22, 24, 35];
/// The judicial tier's fields (Agreements rule 67, F422), with field 2's
/// judicial tasks ([`JUDICIAL_TASKS`]): every member whose voice remains.
pub const JUDICIAL_FIELDS: [u64; 6] = [3, 6, 9, 13, 16, 21];

/// Whether a clone of a collective's agreement makes a constitutional
/// change, the judicial tier's included (rule 98: only the core reads it).
pub fn constitutional(parent: &Terms, clone: &Terms) -> bool {
    changes(parent, clone).iter().any(|c| c.tier() != Tier::Operational)
}

/// The changes a clone makes to its parent (rule 44b): a field differs when
/// its deterministic encoding differs, or it is present in one and absent
/// in the other; fields 2, 15 and 20 entry by entry; fields 4 and 11 never.
pub fn changes(parent: &Terms, clone: &Terms) -> Vec<Change> {
    let enc = |t: &Terms| -> Vec<(u64, Vec<u8>)> {
        t.field_values()
            .into_iter()
            .filter(|(n, _)| ![2, 4, 11, 15, 20].contains(n))
            .map(|(n, v)| (n, cbor::encode(&v)))
            .collect()
    };
    let (p, c) = (enc(parent), enc(clone));
    let mut out = vec![];
    // Field 23 is never compared: a clone never carries it. Field 24, the
    // release rule, may change by a clone every owner signs (F124, N8).
    // 28, fees (F213), is an operational field like 8; 29, the split
    // service's backups (F250), a judicial one like 14.
    // 30, the holders' rules, is operational in no area, as 24 (draft 14,
    // F307): the clone rule, and every holder of the stake whose entry
    // changes (rule 45). 31 and 32 each version states for itself, never
    // compared (F309, F316).
    for n in (0..=24u64).filter(|n| *n != 23).chain([30, 34]) {
        if n == 16 && removal_only(parent, clone) {
            // M1 (F124): the seat part of a removed member's plan goes with
            // the removal, as their areas do; the stake part stays.
            continue;
        }
        let a = p.iter().find(|(k, _)| *k == n).map(|(_, v)| v);
        let b = c.iter().find(|(k, _)| *k == n).map(|(_, v)| v);
        if a != b {
            out.push(Change::Field(n));
        }
    }
    // The control model's answers (Agreements rule 99): areas and holders'
    // rules are compared as the fields 34 and 30 they once were; a change of
    // the model itself (its cMIP) is a change of field 35.
    if parent.areas != clone.areas {
        out.push(Change::Field(34));
    }
    if parent.holders_rules != clone.holders_rules {
        out.push(Change::Field(30));
    }
    if parent.control.as_ref().map(|c| c.cmip) != clone.control.as_ref().map(|c| c.cmip) {
        out.push(Change::Field(35));
    }
    for t in 1..=super::formats::LAST_TASK {
        if parent.cmip(t) != clone.cmip(t) {
            out.push(Change::Task(t));
        }
    }
    for e in parent.extensions() {
        if !clone.extensions().contains(e) {
            out.push(Change::Extension(*e));
        }
    }
    for e in clone.extensions() {
        if !parent.extensions().contains(e) {
            out.push(Change::Extension(*e));
        }
    }
    let words = |t: &Terms, id: u64| {
        t.area_words
            .iter()
            .flatten()
            .find(|(i, _)| *i == id)
            .map(|(_, w)| w.clone())
    };
    let mut ids: Vec<u64> = parent
        .area_words
        .iter()
        .flatten()
        .chain(clone.area_words.iter().flatten())
        .map(|(i, _)| *i)
        .collect();
    ids.sort();
    ids.dedup();
    for id in ids {
        if words(parent, id) != words(clone, id) {
            out.push(Change::Words(id));
        }
    }
    out
}

/// Whether field 16 differs only as M1 allows (F124): each party the clone
/// takes out of the parties loses the seat part of its plan (keys 2 and 3),
/// the plan staying for its stake part, or going where it has none; every
/// other plan as it was, in its order.
fn removal_only(parent: &Terms, clone: &Terms) -> bool {
    let removed: Vec<_> = parent.parties.iter().filter(|p| !clone.parties.contains(p)).collect();
    if removed.is_empty() {
        return false;
    }
    let expected: Vec<_> = parent
        .succession
        .iter()
        .flatten()
        .filter_map(|plan| {
            if !removed.contains(&&plan.party) {
                return Some(plan.clone());
            }
            plan.stakes.as_ref().map(|_| super::formats::SuccessionPlan { seats: None, entry: None, ..plan.clone() })
        })
        .collect();
    let got = clone.succession.clone().unwrap_or_default();
    expected == got
}

/// The powers a rollback's mark names (rule 37d, F185): the constitutional
/// change rule of the agreement in force just before the broken act, its
/// parent, and, where the rollback also changes the judicial tier, the
/// judicial tier's rule too (rules 44c.1, 46a), whatever its other changes;
/// a rollback may change nothing.
pub fn rollback_powers(parent: &Terms, clone: &Terms) -> Vec<Power> {
    let mut out = vec![Power::Constitutional];
    if changes(parent, clone).iter().any(|c| c.tier() == Tier::Judicial) {
        out.push(Power::Judicial);
    }
    out.sort_by_key(|p| p.encoding());
    out
}

/// The powers a clone needs (Agreements rules 47, 67, 98, 99), ascending as
/// a mark lists them. A deal's clone: the clone rule, every party. A
/// collective's: the core reads the constitution and the judicial tier
/// itself (`[0]`, `[4]`) and never asks a model about them; what an
/// operational change needs is the control model's answer, asked of the
/// model the verifier holds (unknown, `Missing`, where it holds none), and,
/// for a collective naming no model, the last resort: a layer's rule for a
/// change of the cMIPs it adopts or its extensions, the constitutional
/// change rule for anything else. The owners' consent a change needs is the
/// core's guarantee (rule 98), beside whatever powers.
pub fn powers_needed(
    parent: &Terms,
    clone: &Terms,
    mirs: &Mirs,
    ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>,
    held: &super::control::Held,
) -> R<Vec<Power>> {
    let _ = mirs;
    if !parent.is_collective() {
        return Ok(vec![Power::Clone]);
    }
    let ch = changes(parent, clone);
    let judicial = ch.iter().any(|c| c.tier() == Tier::Judicial);
    let mut out: Vec<Power> = vec![];
    if ch.iter().any(|c| c.tier() == Tier::Constitutional) {
        out.push(Power::Constitutional);
    } else {
        let ops: Vec<Change> = ch.iter().filter(|c| c.tier() == Tier::Operational).cloned().collect();
        if !ops.is_empty() || ch.is_empty() {
            match &parent.control {
                Some(c) => match held.iter().find(|(h, _)| *h == c.cmip) {
                    Some((_, m)) => out.extend(super::control::checked(m.clone_powers(parent, clone, &ops, ext_layers)?)?),
                    None => return Err(AgreementsError::Missing(c.cmip)),
                },
                None => out.extend(last_resort(clone, &ops, ext_layers)?),
            }
        }
    }
    if judicial {
        out.push(Power::Judicial);
    }
    out.extend(owners_powers(parent, clone));
    out.sort_by_key(|p| p.encoding());
    out.dedup();
    Ok(out)
}

/// A collective naming no control model (rule 98): a change of the cMIP it
/// names for a layer's task needs that layer's rule (and the rule of each
/// other layer the same specification serves); an extension, the rule of
/// Development and of each layer it declares; anything else, and a clone
/// changing nothing, the constitutional change rule.
fn last_resort(clone: &Terms, ops: &[Change], ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>) -> R<Vec<Power>> {
    let mut out = vec![];
    if ops.is_empty() {
        return Ok(vec![Power::Constitutional]);
    }
    for c in ops {
        match c {
            Change::Task(t) => {
                let l = task_layer(*t).expect("tasks are checked");
                if !(layers::TEXT..=layers::DEVELOPMENT).contains(&l) {
                    return Ok(vec![Power::Constitutional]);
                }
                out.push(Power::Layer(l));
                if let Some(spec) = clone.cmip(*t) {
                    for (t2, h) in &clone.cmips {
                        let l2 = task_layer(*t2).expect("tasks are checked");
                        if h == spec && l2 != l && (layers::TEXT..=layers::DEVELOPMENT).contains(&l2) {
                            out.push(Power::Layer(l2));
                        }
                    }
                }
            }
            Change::Extension(e) => {
                out.push(Power::Layer(layers::DEVELOPMENT));
                for l in ext_layers(e)? {
                    if (layers::TEXT..=layers::DEVELOPMENT).contains(&l) {
                        out.push(Power::Layer(l));
                    }
                }
            }
            _ => return Ok(vec![Power::Constitutional]),
        }
    }
    Ok(out)
}

/// The stakes' holders' rules a clone needs beside the members' powers
/// (rule 64.4; new in draft 14, F307): where the change is an owners'
/// matter of a stake (rule 95: what it is paid, or an issuance in it) whose
/// holders' rule is by share, `[5, stake]`. Under every holder, default or
/// declared, each holder with no voice signs as rule 48 asks, outside the
/// mark, a collective among the holders counting once, by its own
/// constitution (field 30).
pub fn owners_powers(parent: &Terms, clone: &Terms) -> Vec<Power> {
    let mut out = vec![];
    let paid_less: Vec<super::formats::Who> = super::pay::stakes_paid_less(parent, clone).into_iter().map(|(o, _)| o).collect();
    for (i, st) in parent.stakes.iter().flatten().enumerate() {
        if !matches!(parent.holders_rule(i as u64).0, super::formats::HoldersRule::Share(_)) {
            continue;
        }
        let issued = clone.issues_under.is_some() && clone.stakes.as_ref().and_then(|s| s.get(i)) != Some(st);
        if paid_less.contains(&st.object) || issued {
            out.push(Power::Holders(i as u64));
        }
    }
    out
}

/// The judicial changes a clone makes, for showing which protected clauses
/// it changes (rule 46a).
pub fn judicial_changes(parent: &Terms, clone: &Terms) -> Vec<Change> {
    changes(parent, clone)
        .into_iter()
        .filter(|c| c.tier() == Tier::Judicial)
        .collect()
}

/// An error for an extension whose declared layers the caller cannot give.
pub fn unknown_extension(e: &Hash) -> AgreementsError {
    AgreementsError::Missing(*e)
}
