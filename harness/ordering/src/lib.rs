//! # mor-ordering-sim
//!
//! A model of a collective's members, their devices and sequences, and the events done in
//! the collective's name, to test one ordering rule proposed for Law draft 7's flaws E to L:
//! for anything done in a collective's name, "before" and "after" are judged only on the
//! collective's own sequence, never on members' personal sequences.
//!
//! See `docs/law-ordering-rule-test.md` for the rule, the replay of each flaw, the attacks,
//! and what this simulation covered.

pub mod check;
pub mod gen;
pub mod model;
pub mod rule;
