//! Writes verifier 3's vectors, `core/vectors/agreements-26/`: acts of
//! Agreements draft 26 in the bytes of encoding 3, and the checker's
//! expected answers, taken from the texts. Run:
//! `cargo run -q -p mor-core --example gen_vectors_26 --locked`.
//!
//! Every input is fixed (keys, nonces, salts and content keys are derived
//! from labels), so running this again gives the same files. Test data only.
//! It first checks that `SPEC_DRAFT_26` is still the hash of draft-26.md,
//! and stops, saying so, where the file has changed.

#[path = "support/agreements_26.rs"]
mod agreements_26;
#[path = "support/agreements_26_grammar.rs"]
mod agreements_26_grammar;

fn main() {
    // An optional first argument writes the files under another directory
    // (for a check), instead of `core/vectors/`.
    let dir = match std::env::args().nth(1) {
        Some(d) => std::path::PathBuf::from(d),
        None => std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("vectors"),
    };
    agreements_26::write(&dir);
    println!("wrote {}", dir.join("agreements-26").display());
}
