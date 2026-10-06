//! Nothing binding rests on a reader's own attempts (Identity, the sentence
//! after rule 17; rule 32a; F137, F153).
//!
//! A homeless rotation that counts only through the verifier's own failed
//! attempt to reach the old home is "re-homed without audit". Reading and
//! following the identity may rest on it, the escape from a censor; for
//! everything binding, an answer resting on it is unknown, never valid or
//! invalid, until it no longer rests on it.

mod common;

use common::{home, own_home, Rot, World};
use mor_core::chain::{Basis, How, Status};

#[test]
fn an_answer_resting_on_own_attempts_is_unknown_for_binding_and_followed_for_reading() {
    let mut w = World::new();
    let old = w.operator("old-home");
    let mut new = w.operator("new-home");
    let mut p = w.genesis("printer", vec![home(&old)], None, None);
    let before = w.post(&mut p, "a post made before the move");
    let (hr, mut p1) = w.rotate(&p, Rot { homeless: true, homes: Some(vec![home(&new)]), ..Default::default() });
    w.receipt(&mut new, &p.id, &hr, 1);
    let after = w.post(&mut p1, "a post made after the move");
    // Without the reader's own attempt the rotation does not count yet.
    assert_eq!(w.v.status(&after), Status::Pending);
    assert!(!w.v.rests_on_own_attempt(&after));
    w.v.failed_to_reach(old.id);
    // Reading follows it: the chain moves, the new act is valid.
    let res = w.v.resolve(&p.id);
    assert_eq!(res.links.last().unwrap().how, How::Homeless { basis: Basis::OwnAttempt, final_: false });
    assert_eq!(w.v.status(&after), Status::Valid);
    // For anything binding, an answer resting on it is unknown.
    assert!(w.v.rests_on_own_attempt(&after));
    assert!(w.v.rests_on_own_attempt(&hr));
    assert_eq!(w.v.binding_status(&after), Status::Unknown);
    assert_eq!(w.v.binding_status(&hr), Status::Unknown);
    // An act that stands the same either way does not rest on it: kept by
    // the rotation, valid without it too.
    assert!(!w.v.rests_on_own_attempt(&before));
    assert_eq!(w.v.binding_status(&before), Status::Valid);
    // A stranger's act, nothing to do with the move: unchanged.
    let mut s = w.genesis("stranger", vec![own_home()], None, None);
    let x = w.post(&mut s, "elsewhere");
    assert_eq!(w.v.binding_status(&x), Status::Valid);
    // The old home's operator closes it: the rotation no longer rests on
    // the reader's attempt, and the answers bind.
    w.rotate(&old, Rot { closure: true, ..Default::default() });
    assert!(!w.v.rests_on_own_attempt(&after));
    assert_eq!(w.v.binding_status(&after), Status::Valid);
}
