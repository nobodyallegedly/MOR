//! The command-line signer, driven as a user would: a new seed, the
//! commitment for a genesis, a rotation signed by file, the same rotation
//! re-exported, a different one refused, and the share commands.

mod common;

use common::*;
use mor_airgap::msg::{kind, Message};
use mor_airgap::online::{self, GenesisPlan};
use mor_airgap::transport;
use std::io::Write;
use std::path::Path;
use std::process::{Command, Stdio};

fn run(dir: &Path, args: &[&str], input: &str) -> (bool, String) {
    let mut c = Command::new(env!("CARGO_BIN_EXE_mor-signer"))
        .arg("--dir")
        .arg(dir)
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();
    // A signer that refuses before reading (a file it will not sign) may
    // exit before the input is written: its answer is in its status and
    // output, so a closed pipe here is no failure.
    if let Err(e) = c.stdin.take().unwrap().write_all(input.as_bytes()) {
        assert_eq!(e.kind(), std::io::ErrorKind::BrokenPipe, "{e}");
    }
    let out = c.wait_with_output().unwrap();
    let text =
        String::from_utf8_lossy(&out.stdout).to_string() + &String::from_utf8_lossy(&out.stderr);
    (out.status.success(), text)
}

#[test]
fn the_command_line_signer_end_to_end() {
    let dir = std::env::temp_dir().join(format!("mor-signer-cli-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let f = |n: &str| dir.join(n).to_string_lossy().to_string();

    // A seed whose backup is not confirmed is not kept.
    let (ok, _) = run(&dir, &["new", "words"], "no\n");
    assert!(!ok);
    let (ok, out) = run(&dir, &["new", "words"], "WRITTEN\n");
    assert!(ok, "{out}");
    assert!(out.contains("24. "), "the 24 words are shown");
    assert!(out.contains("signing seed"), "rule 3.7: both seeds");

    let (ok, out) = run(&dir, &["export", &f("commitment.mor")], "");
    assert!(ok, "{out}");

    // The online side: a genesis from the exported commitment, then a pending rotation.
    let mut rng = TestRng::new("cli online");
    let export =
        transport::read_file(Path::new(&f("commitment.mor")), kind::COMMITMENT_EXPORT).unwrap();
    let g = online::genesis(
        identity_spec(),
        &export.encode(),
        &signing("cli", 0),
        GenesisPlan {
            homes: vec![own_home()],
            ..Default::default()
        },
        &mut rng,
    )
    .unwrap();
    let mut r = Owner::new("cli plan", mor_airgap::seed::SeedModule::Words, 2).plan();
    r.prev = g.id();
    r.signing_key.key = signing("cli", 1).public().to_vec();
    let pending = online::pending(&identity_spec(), &g, &r, None, false);
    transport::write_file(Path::new(&f("pending.mor")), &pending).unwrap();

    // Refused unless the user types SIGN.
    let (ok, out) = run(
        &dir,
        &["sign", &f("pending.mor"), &f("signed.mor")],
        "sure\n",
    );
    assert!(!ok);
    assert!(
        out.contains("New signing key: fingerprint"),
        "the summary is shown first"
    );
    let (ok, out) = run(
        &dir,
        &["sign", &f("pending.mor"), &f("signed.mor")],
        "SIGN\n",
    );
    assert!(ok, "{out}");
    let signed = transport::read_file(Path::new(&f("signed.mor")), kind::SIGNED_ROTATION).unwrap();
    online::accept(&identity_spec(), &pending.encode(), &signed.encode()).unwrap();
    rotation_act(&signed);

    // Asked again: the same bytes. A different rotation: refused.
    let (ok, out) = run(
        &dir,
        &["sign", &f("pending.mor"), &f("again.mor")],
        "SIGN\n",
    );
    assert!(ok, "{out}");
    assert_eq!(
        std::fs::read(f("signed.mor")).unwrap(),
        std::fs::read(f("again.mor")).unwrap()
    );
    let mut r2 = r.clone();
    r2.homes = Some(vec![home("thief")]);
    transport::write_file(
        Path::new(&f("other.mor")),
        &online::pending(&identity_spec(), &g, &r2, None, false),
    )
    .unwrap();
    let (ok, out) = run(&dir, &["sign", &f("other.mor"), &f("x.mor")], "SIGN\n");
    assert!(!ok);
    assert!(out.contains("already signed a different rotation"), "{out}");

    // A script handed over as a pending rotation.
    std::fs::write(f("evil.mor"), b"#!/bin/sh\necho owned\n").unwrap();
    let (ok, out) = run(&dir, &["sign", &f("evil.mor"), &f("x.mor")], "SIGN\n");
    assert!(!ok && !out.contains("owned"));

    // QR frames typed in by a scanner, one per line.
    let mut s = transport::QrSender::new(&signed, 200);
    let frames: String = (0..s.fragments() * 2)
        .map(|_| s.next_frame() + "\n")
        .collect();
    let (ok, out) = run(&dir, &["scan", "signed", &f("scanned.mor")], &frames);
    assert!(ok, "{out}");
    assert_eq!(
        std::fs::read(f("scanned.mor")).unwrap(),
        std::fs::read(f("signed.mor")).unwrap()
    );

    // A collective's first key, the holders' checks, the rebuild check.
    let id = |n: &str| {
        mor_core::hash::sha256(n.as_bytes())
            .iter()
            .map(|x| format!("{x:02x}"))
            .collect::<String>()
    };
    let shares = dir.join("shares");
    let (ok, out) = run(
        &dir,
        &[
            "deal-genesis",
            "2",
            &shares.to_string_lossy(),
            &format!("member:{}", id("a")),
            &format!("member:{}", id("b")),
            "escrow",
        ],
        "",
    );
    assert!(ok, "{out}");
    let sh = |n: u8| {
        shares
            .join(format!("share-{n}.mor"))
            .to_string_lossy()
            .to_string()
    };
    let (ok, out) = run(&dir, &["check-share", &sh(3)], "");
    assert!(ok && out.contains("Escrow"), "{out}");
    let (ok, out) = run(&dir, &["rebuild-check", &sh(1), &sh(3)], "");
    assert!(ok && out.contains("rebuild the committed key"), "{out}");
    let _ = Message::decode(&std::fs::read(sh(2)).unwrap()).unwrap();

    std::fs::remove_dir_all(&dir).unwrap();
}
