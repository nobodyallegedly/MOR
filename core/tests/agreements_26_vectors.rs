//! Verifier 3's vectors (`core/vectors/agreements-26/`): the spec hash they
//! carry is draft 26's, and the files on disk are what the builder writes.
//! No answer is checked here: no checker of encoding 3 exists yet, and the
//! answers are the texts', not code's.

#[path = "../examples/support/agreements_26.rs"]
mod agreements_26;

use agreements_26 as v;

#[test]
fn spec_draft_26_is_the_file() {
    // Encoding 3, E2: `SPEC_DRAFT_26` is `Spec::mir_file_hash` of draft-26.md.
    assert_eq!(v::file_hash(v::DRAFT_26_FILE), v::SPEC_DRAFT_26);
}

#[test]
fn text_drafts_hash_apart() {
    let mut hs: Vec<_> = v::TEXT_FILES.iter().map(|(_, f)| v::file_hash(f)).collect();
    hs.sort();
    hs.dedup();
    assert_eq!(hs.len(), v::TEXT_FILES.len());
}

#[test]
fn sets_follow_the_recipe() {
    let x = v::fixed("x");
    let y = v::fixed("y");
    assert_eq!(v::set_value(&[x, y]), v::set_value(&[y, x]));
    assert_eq!(v::set_value(&[x, x]), v::set_value(&[x]));
    assert_ne!(v::set_value(&[x]), x);
    assert_eq!(v::set_value(&[]), mor_core::hash::tagged_hash(v::SET_LABEL, &[]));
}

#[test]
fn the_files_are_the_builders() {
    let tmp = std::env::temp_dir().join(format!("agreements-26-{}", std::process::id()));
    v::write(&tmp);
    let ours = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("vectors/agreements-26");
    for f in ["valid.json", "invalid.json", "sets.json", "reference-payloads.json", "retired/retired.json"] {
        let a = std::fs::read(tmp.join("agreements-26").join(f)).unwrap();
        let b = std::fs::read(ours.join(f)).unwrap_or_default();
        assert!(a == b, "{f} differs from what the builder writes: run `cargo run -q -p mor-core --example gen_vectors_26 --locked`");
    }
    let _ = std::fs::remove_dir_all(&tmp);
}
