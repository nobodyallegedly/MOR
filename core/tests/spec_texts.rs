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
        // Development rule 26: a file may end with exactly one line break,
        // not part of its text; the texts are committed without one for now.
        if let Err(e) = mor_core::development::Spec::file_content(4, &s) {
            bad.push(format!("{}: {e}", f.display()));
        }
        if s.ends_with('\n') {
            bad.push(format!("{}: committed with a final line break (kept without one until the freeze)", f.display()));
        }
    }
    assert!(bad.is_empty(), "not canonical text (Development draft 10, rule 26; F324):\n{}", bad.join("\n"));
}

/// Development rule 26: the text a file holds is its content with at most
/// one final line break removed, and nothing else; a MIR's spec hash is
/// computed from that text. Dropping a draft's status line is a tool's
/// option, never on the hash's path.
#[test]
fn a_mir_hash_reads_the_file_as_rule_26_says() {
    use mor_core::development::Spec;
    let file = "# MIR: Test\n\n*Draft 1, for review.*\n\n## Part one\n\nText.";
    let frozen = "# MIR: Test\n\n## Part one\n\nText.";
    assert_eq!(Spec::frozen_text(file), file, "every line of the file is part of the text");
    assert_eq!(Spec::frozen_text(&format!("{file}\n")), file);
    assert_eq!(Spec::frozen_text(frozen), frozen);
    let h = Spec::mir_file_hash(frozen).unwrap();
    assert_ne!(Spec::mir_file_hash(file).unwrap(), h, "a status line is hashed with the rest");
    assert_eq!(Spec::mir_file_hash(&format!("{frozen}\n")).unwrap(), h);
    assert_eq!(h, Spec::hash_of(&Spec::mir_content(frozen)));
    assert!(Spec::mir_file_hash(&format!("{frozen}\n\n")).is_err(), "two final line breaks");
    assert!(Spec::mir_file_hash("# MIR: Test\n\nText. ").is_err(), "a trailing space");
    // An italic paragraph after the title (the MICS's and the suite's
    // reading notes, once their status lines are gone) is part of the text.
    let italic = "# T\n\n*an italic line*\n\nbody\n";
    assert_eq!(Spec::frozen_text(italic), "# T\n\n*an italic line*\n\nbody");
    // The tool: a draft's status line dropped, said so, and nothing else.
    assert_eq!(Spec::draft_without_status_line(file), frozen);
    assert_eq!(Spec::draft_without_status_line(italic), "# T\n\n*an italic line*\n\nbody");
    assert_eq!(Spec::draft_without_status_line("# MIR: T\n\n**Bold.**\n\nText."), "# MIR: T\n\n**Bold.**\n\nText.");
}
