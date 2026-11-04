//! What an operational clone needs, under the default control cMIP (its
//! rules 63 and 64, moved from the core's `tiers.rs` unchanged in what they
//! decide): each operational change lies under the parent's layer rule for
//! its task, or in the parent's area naming that task or field; a change no
//! layer rule or area holds, and a clone changing nothing, needs the clone
//! rule (field 5). The constitution and the judicial tier are the core's
//! (Agreements rules 67 and 98): they never reach here.

use mor_core::agreements::{layers, task_layer, AgreementsError, Change, FieldRef, Power, Terms};
use mor_core::hash::Hash;

type R<T> = Result<T, AgreementsError>;

/// The powers the operational changes `ops` need (this cMIP's rule 64.2).
pub fn clone_powers(parent: &Terms, clone: &Terms, ops: &[Change], ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>) -> R<Vec<Power>> {
    let mut areas: Vec<Power> = vec![];
    let mut clone_rule = ops.is_empty();
    for c in ops {
        let (a, nowhere) = lies_in(parent, clone, c, ext_layers)?;
        areas.extend(a);
        clone_rule |= nowhere;
    }
    let mut out = vec![];
    if clone_rule {
        out.push(Power::Clone);
    }
    out.extend(areas);
    out.sort_by_key(|p| p.encoding());
    out.dedup();
    Ok(out)
}

/// Where an operational change lies (rule 63): the parent's layer rules
/// and areas it lies under, as the powers they are, and whether some part
/// of it lies under neither.
fn lies_in(
    parent: &Terms,
    clone: &Terms,
    change: &Change,
    ext_layers: &dyn Fn(&Hash) -> R<Vec<u64>>,
) -> R<(Vec<Power>, bool)> {
    let mut powers = vec![];
    let mut nowhere = false;
    // A layer's rule (field 19), for layers 1 to 5; Identity's tasks lie
    // under none, a collective's Identity acts being its chain acts (rule
    // 60): the clone rule (reading).
    let mut layer_rule = |l: u64, powers: &mut Vec<Power>| {
        if (layers::TEXT..=layers::DEVELOPMENT).contains(&l) {
            powers.push(Power::Layer(l));
        } else {
            nowhere = true;
        }
    };
    match change {
        Change::Task(t) => {
            let layer = task_layer(*t).expect("tasks are checked");
            // An area naming the task by a field reference, or else the
            // task's layer rule.
            let by_ref = parent.areas().iter().find(|a| a.fields.iter().flatten().any(|f| *f == FieldRef::Task(*t)));
            match by_ref {
                Some(a) => powers.push(Power::Area(a.id)),
                None => layer_rule(layer, &mut powers),
            }
            // A specification the clone also names for a task of another
            // layer answers to that layer's rule too.
            if let Some(spec) = clone.cmip(*t) {
                for (t2, h) in &clone.cmips {
                    if h == spec {
                        let l2 = task_layer(*t2).expect("tasks are checked");
                        if l2 != layer {
                            layer_rule(l2, &mut powers);
                        }
                    }
                }
            }
        }
        Change::Extension(e) => {
            layer_rule(layers::DEVELOPMENT, &mut powers);
            for l in ext_layers(e)? {
                layer_rule(l, &mut powers);
            }
        }
        Change::Words(id) => match parent.area(*id) {
            Some(a) => powers.push(Power::Area(a.id)),
            None => layer_rule(0, &mut powers),
        },
        Change::Field(f) => match parent
            .areas()
            .iter()
            .find(|a| a.fields.iter().flatten().any(|x| *x == FieldRef::Field(*f)))
        {
            Some(a) => powers.push(Power::Area(a.id)),
            None => layer_rule(0, &mut powers),
        },
    }
    powers.sort_by_key(|p| p.encoding());
    powers.dedup();
    Ok((powers, nowhere))
}
