//! Rule 6 of canonical text against Unicode's own conformance file for the
//! pinned version, NormalizationTest-17.0.0.txt (tests/data).
//!
//! For each line `c1;c2;c3;c4;c5`, NFC(c1) = NFC(c2) = NFC(c3) = c2 and
//! NFC(c4) = NFC(c5) = c4. So a string among them is in NFC exactly when it
//! equals c2 (for c1 to c3) or c4 (for c4, c5). Every code point not listed
//! in part 1 of the file is its own NFC.

use mor_core::text::is_nfc;
use std::collections::HashSet;

fn parse(field: &str) -> String {
    field
        .split(' ')
        .map(|h| char::from_u32(u32::from_str_radix(h, 16).unwrap()).unwrap())
        .collect()
}

#[test]
fn normalization_test_17_0_0() {
    let data = include_str!("data/NormalizationTest-17.0.0.txt");
    assert!(data.starts_with("# NormalizationTest-17.0.0.txt"));
    let mut part = String::new();
    let mut part1 = HashSet::new();
    let mut lines = 0;
    for line in data.lines() {
        let line = line.split('#').next().unwrap().trim();
        if line.is_empty() {
            continue;
        }
        if line.starts_with('@') {
            part = line.to_owned();
            continue;
        }
        let f: Vec<String> = line.split(';').take(5).map(parse).collect();
        for (i, x) in f.iter().enumerate() {
            let want = if i < 3 { &f[1] } else { &f[3] };
            assert_eq!(is_nfc(x), x == want, "{part}: column {} of {line}", i + 1);
        }
        if part == "@Part1" {
            part1.insert(f[0].chars().next().unwrap());
        }
        lines += 1;
    }
    assert!(lines > 19_000, "only {lines} test lines");
    for c in (0..=0x10FFFFu32).filter_map(char::from_u32) {
        if !part1.contains(&c) {
            assert!(
                is_nfc(&c.to_string()),
                "U+{:04X} should be its own NFC",
                c as u32
            );
        }
    }
}
