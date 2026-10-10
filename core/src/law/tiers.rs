//! Tiers (Law draft 7, rules 44a to 44c): what a clone changes, the tier of
//! each change, the area it lies in, and so which powers its mark must name.
//!
//! In plain words: compare the clone with its parent field by field (and
//! fields 2, 15 and 20 entry by entry). Any constitutional change needs the
//! constitutional change rule alone (F120). Otherwise each area in which a
//! change lies needs its holders' power; an operational change no area
//! holds needs the clone rule; and a judicial change needs every member
//! whose voice remains, one version for everyone (F121). A clone that
//! changes nothing needs the clone rule. Which power is
//! needed is read from the bytes, never from what the clone says of itself.

use super::formats::{
    layers, task_layer, FieldRef, LawError, Mips, Power, Terms, JUDICIAL_TASKS, R,
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
            Change::Field(f) => match f {
                // 25, the relays, is withdrawn (F128) and never reused.
                0 | 1 | 5 | 12 | 18 | 19 | 22 => Tier::Constitutional,
                3 | 6 | 9 | 10 | 13 | 14 | 16 | 21 => Tier::Judicial,
                // 7, 8, 17; 24, the release rule, in no area: the clone
                // rule, with every owner's signature besides (N8).
                _ => Tier::Operational,
            },
            Change::Task(t) if JUDICIAL_TASKS.contains(t) => Tier::Judicial,
            Change::Task(_) | Change::Extension(_) | Change::Words(_) => Tier::Operational,
        }
    }
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
    // 28, fees (F213), is an operational field like 8.
    for n in (0..=24u64).filter(|n| *n != 23).chain([super::open_formats::FEES_FIELD]) {
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

/// Where an operational change lies: the parent's areas it lies in, and
/// whether some part of it lies in no area.
fn lies_in(
    parent: &Terms,
    clone: &Terms,
    change: &Change,
    ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>,
) -> R<(Vec<u64>, bool)> {
    let mut areas = vec![];
    let mut nowhere = false;
    let lane = |layer: u64, areas: &mut Vec<u64>, nowhere: &mut bool| match parent.lane(layer)
    {
        Some(a) => areas.push(a.id),
        None => *nowhere = true,
    };
    match change {
        Change::Task(t) => {
            let layer = task_layer(*t).expect("tasks are checked");
            // The task's lane, or an area naming the task by a field
            // reference (reading B4, listed in the report).
            let by_ref = parent.areas().iter().find(|a| {
                a.fields
                    .iter()
                    .flatten()
                    .any(|f| *f == FieldRef::Task(*t))
            });
            match (parent.lane(layer), by_ref) {
                (Some(a), _) | (None, Some(a)) => areas.push(a.id),
                (None, None) => nowhere = true,
            }
            // R4: a specification the clone also names for a task of another
            // layer answers to that layer's lane too.
            if let Some(spec) = clone.cmip(*t) {
                for (t2, h) in &clone.cmips {
                    if h == spec {
                        let l2 = task_layer(*t2).expect("tasks are checked");
                        if l2 != layer {
                            lane(l2, &mut areas, &mut nowhere);
                        }
                    }
                }
            }
        }
        Change::Extension(e) => {
            lane(layers::PRODUCTION, &mut areas, &mut nowhere);
            for l in ext_layers(e)? {
                lane(l, &mut areas, &mut nowhere);
            }
        }
        Change::Words(id) => match parent.area(*id) {
            Some(a) => areas.push(a.id),
            None => nowhere = true,
        },
        Change::Field(f) => match parent
            .areas()
            .iter()
            .find(|a| a.fields.iter().flatten().any(|x| *x == FieldRef::Field(*f)))
        {
            Some(a) => areas.push(a.id),
            None => nowhere = true,
        },
    }
    areas.sort();
    areas.dedup();
    Ok((areas, nowhere))
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

/// The powers a clone of a collective's agreement needs, from its changes
/// alone (rule 44c, 1 and 2), ascending as a mark lists them. A deal's
/// clone needs the clone rule, every party (rule 45b). `ext_layers` gives
/// the layers an extension declares in its specification (Production,
/// field 10); an extension whose specification the caller does not hold is
/// an error, never a guess.
pub fn powers_needed(
    parent: &Terms,
    clone: &Terms,
    mips: &Mips,
    ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>,
) -> R<Vec<Power>> {
    let _ = mips;
    if !parent.is_collective() {
        return Ok(vec![Power::Clone]);
    }
    let ch = changes(parent, clone);
    if ch.iter().any(|c| c.tier() == Tier::Constitutional) {
        // F122 (flaw K1, revising F120): the constitutional change rule,
        // and, where the same version also changes the judicial tier, every
        // member for it: the mark names both, and the version stays a draft
        // until both are met.
        let mut out = vec![Power::Constitutional];
        if ch.iter().any(|c| c.tier() == Tier::Judicial) {
            out.push(Power::Judicial);
        }
        out.sort_by_key(|p| p.encoding());
        return Ok(out);
    }
    let mut areas: Vec<u64> = vec![];
    let mut clone_rule = ch.is_empty();
    let mut judicial = false;
    for c in &ch {
        match c.tier() {
            Tier::Judicial => judicial = true,
            Tier::Operational => {
                let (a, nowhere) = lies_in(parent, clone, c, ext_layers)?;
                areas.extend(a);
                clone_rule |= nowhere;
            }
            Tier::Constitutional => unreachable!(),
        }
    }
    areas.sort();
    areas.dedup();
    let mut out: Vec<Power> = vec![];
    if clone_rule {
        out.push(Power::Clone);
    }
    out.extend(areas.into_iter().map(Power::Area));
    if judicial {
        out.push(Power::Judicial);
    }
    out.sort_by_key(|p| p.encoding());
    Ok(out)
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
pub fn unknown_extension(e: &Hash) -> LawError {
    LawError::Missing(*e)
}
