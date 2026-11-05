//! The default control cMIP's format check of its areas and their words
//! ("Areas", this cMIP's section 2; Q5, Q21, Q32), moved from the core's
//! terms check unchanged in what it refuses: the model refuses parameters
//! outside its format (Agreements rule 99).

use mor_core::agreements::{task_layer, AgreementsError, FieldRef, Kind, Mirs, Terms, JUDICIAL_TASKS, LAST_TASK};

type R<T> = Result<T, AgreementsError>;

/// "Areas": a collective's areas and their words, checked against its terms.
pub fn check_areas(t: &Terms, mirs: &Mirs) -> R<()> {
    let areas = t.areas();
    let ids: Vec<u64> = areas.iter().map(|a| a.id).collect();
    if ids.iter().enumerate().any(|(i, x)| ids[..i].contains(x)) {
        return Err(AgreementsError::Check("two areas carry the same id (Q32)"));
    }
    for a in areas {
        if !distinct(&a.holders) || !a.holders.iter().all(|h| t.parties.contains(h)) {
            return Err(AgreementsError::Check("an area's holders are distinct parties"));
        }
        if a.holders.is_empty() && t.parent.is_none() {
            return Err(AgreementsError::Check(
                "founding terms never list an area without holders (Q21)",
            ));
        }
        if a.threshold == 0 {
            return Err(AgreementsError::Check("an area's number is at least 1"));
        }
        if a.kinds.is_none() && a.fields.is_none() {
            return Err(AgreementsError::Check("an area reaches at least one act kind or one field"));
        }
        for k in a.kinds.iter().flatten() {
            match k {
                Kind::Layer(_) => {
                    return Err(AgreementsError::Check("an area reaches act types, [1, spec, type]: a whole layer is field 19's (rule 60)"))
                }
                Kind::Type { spec, type_ }
                    if (spec == &mirs.identity && (*type_ == 0 || *type_ == 1))
                        || (spec == &mirs.agreements && *type_ == mor_core::agreements::types::RECORD) =>
                {
                    // Genesis, rotations and records are never in an
                    // area's reach ("Areas").
                    return Err(AgreementsError::Check(
                        "genesis, rotations and records are never in an area's reach",
                    ));
                }
                _ => {}
            }
        }
        for f in a.fields.iter().flatten() {
            let ok = match f {
                // 28, fees, placed on their own (F213).
                // F421 to F423: field 17 is the constitution's and
                // field 7 changes only by its four placed acts: no
                // operational field remains for an area.
                FieldRef::Field(_) => false,
                FieldRef::Task(t) => (1..=LAST_TASK).contains(t) && !JUDICIAL_TASKS.contains(t),
            };
            if !ok {
                return Err(AgreementsError::Check(
                    "an area's field references name only operational fields and tasks",
                ));
            }
        }
    }
    // No two areas reach the same act or the same field (Q5).
    for (i, a) in areas.iter().enumerate() {
        for b2 in &areas[i + 1..] {
            for x in a.kinds.iter().flatten() {
                for y in b2.kinds.iter().flatten() {
                    if t.kinds_overlap(mirs, x, y) {
                        return Err(AgreementsError::Check("two areas reach the same acts (Q5)"));
                    }
                }
            }
            for x in a.fields.iter().flatten() {
                if b2.fields.iter().flatten().any(|y| y == x) {
                    return Err(AgreementsError::Check("two areas reach the same field (Q5)"));
                }
            }
            // A lane overlaps a field reference to a task of its layer.
            for (p, q) in [(a, b2), (b2, a)] {
                for f in q.fields.iter().flatten() {
                    if let FieldRef::Task(t) = f {
                        if task_layer(*t).is_some_and(|l| p.is_lane(l)) {
                            return Err(AgreementsError::Check(
                                "a lane and another area both reach a task of its layer (Q5)",
                            ));
                        }
                    }
                }
            }
        }
    }
    if t.area_words.is_some() && t.areas.is_none() {
        return Err(AgreementsError::Check("area words (field 20) only with areas (field 34)"));
    }
    if let Some(w) = &t.area_words {
        let mut last = None;
        for (id, _) in w {
            if !ids.contains(id) {
                return Err(AgreementsError::Check("area words for an area that does not exist"));
            }
            if last.is_some_and(|l| l >= *id) {
                return Err(AgreementsError::Shape("area words, ascending by id"));
            }
            last = Some(*id);
        }
    }
    Ok(())
}

fn distinct<T: PartialEq>(v: &[T]) -> bool {
    v.iter().enumerate().all(|(i, x)| !v[..i].contains(x))
}
