//! The repository check of Development draft 10, rule 26 (F324): the texts
//! of the core are committed as canonical text (Text: no final line break,
//! no trailing space, NFC with the pinned tables, no other controls), so
//! that the file, the publication and the hash are one. It covers the
//! newest text of each of the core's documents under `spec/`: the six MIRs,
//! the MICS document and the freeze test suite, the ones that freeze. Older
//! drafts are kept records, never published as specifications.

use std::collections::BTreeMap;
use std::path::Path;

/// The newest file of each document family under `spec/`: for
/// `MIR-<layer>-draft-<n>.md`, `02-MOR-MICS-v<n>.md` and
/// `03-MOR-freeze-test-suite-v<n>.md`, the greatest n.
fn newest() -> Vec<std::path::PathBuf> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../spec");
    let mut best: BTreeMap<String, (u64, std::path::PathBuf)> = BTreeMap::new();
    for e in std::fs::read_dir(&dir).unwrap() {
        let p = e.unwrap().path();
        let name = p.file_name().unwrap().to_string_lossy().to_string();
        let Some(stem) = name.strip_suffix(".md") else { continue };
        let (family, n) = if let Some(rest) = stem.strip_prefix("MIR-") {
            let Some((layer, n)) = rest.split_once("-draft-") else { continue };
            (format!("MIR-{layer}"), n)
        } else if let Some(n) = stem.strip_prefix("02-MOR-MICS-v") {
            ("MICS".to_string(), n)
        } else if let Some(n) = stem.strip_prefix("03-MOR-freeze-test-suite-v") {
            ("suite".to_string(), n)
        } else {
            continue;
        };
        let Ok(n) = n.parse::<u64>() else { continue };
        if best.get(&family).is_none_or(|(m, _)| n > *m) {
            best.insert(family, (n, p));
        }
    }
    best.into_values().map(|(_, p)| p).collect()
}

#[test]
fn the_core_texts_are_committed_as_canonical_text_f324() {
    let files = newest();
    assert_eq!(files.len(), 8, "six MIRs, the MICS document and the suite: {files:?}");
    let mut bad = vec![];
    for f in &files {
        let s = std::fs::read_to_string(f).unwrap();
        if let Err(e) = mor_core::text::check(&s) {
            bad.push(format!("{}: {e}", f.display()));
        }
    }
    assert!(bad.is_empty(), "not canonical text (Development draft 10, rule 26; F324):\n{}", bad.join("\n"));
}
