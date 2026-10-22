//! The command-line signer, driven as a user would: a new seed, the
//! commitment for a genesis, a rotation signed by file, the same rotation
//! re-exported, a different one refused, and the share commands.

mod common;

use common::*;
use mor_airgap::msg::{kind, Message};
use mor_airgap::online::{self, GenesisPlan};
use mor_airgap::transport;
use std::io::{Read, Write};
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};

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

/// The signer driven as a person would at its prompts (on its error
/// output): WRITTEN once the backup is shown, the parts asked typed back from
/// what it showed (`wrong` types a wrong one first), and `last` at the final
/// prompt (SIGN, or anything else).
fn talk(dir: &Path, args: &[&str], last: &str, wrong: bool) -> (bool, String) {
    let mut c = Command::new(env!("CARGO_BIN_EXE_mor-signer"))
        .arg("--dir")
        .arg(dir)
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();
    let out = Arc::new(Mutex::new(String::new()));
    let mut so = c.stdout.take().unwrap();
    let o2 = out.clone();
    let reader = std::thread::spawn(move || {
        let mut b = [0u8; 1024];
        while let Ok(n) = so.read(&mut b) {
            if n == 0 {
                break;
            }
            o2.lock().unwrap().push_str(&String::from_utf8_lossy(&b[..n]));
        }
    });
    let mut err = c.stderr.take().unwrap();
    let mut input = c.stdin.take().unwrap();
    let mut said = String::new();
    let mut wrong = wrong;
    let mut byte = [0u8; 1];
    while err.read(&mut byte).unwrap_or(0) == 1 {
        said.push(byte[0] as char);
        if !said.ends_with(": ") {
            continue;
        }
        let prompt = said.rsplit('\n').next().unwrap().to_string();
        let answer = if prompt.contains("WRITTEN") {
            "WRITTEN".to_string()
        } else if let Some(n) = prompt.strip_prefix("Word ").and_then(|r| r.split(' ').next()).and_then(|n| n.parse::<usize>().ok()) {
            // The words shown, as "  N. word" lines, read from what the signer printed.
            let mut word = None;
            for _ in 0..200 {
                let shown = out.lock().unwrap().clone();
                let from = shown.rfind("CHAIN-KEY SEED BACKUP").unwrap_or(0);
                word = shown[from..].lines().find_map(|l| l.trim().strip_prefix(&format!("{n}. ")).map(str::to_string));
                if word.is_some() {
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(10));
            }
            if wrong {
                wrong = false;
                "zebra".into()
            } else {
                word.expect("the word asked was shown")
            }
        } else {
            last.to_string()
        };
        said.push_str(&answer);
        said.push('\n');
        if input.write_all(format!("{answer}\n").as_bytes()).is_err() {
            break;
        }
    }
    drop(input);
    let status = c.wait().unwrap();
    reader.join().unwrap();
    let text = out.lock().unwrap().clone() + &said;
    (status.success(), text)
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
    // Written, hidden, and three words typed back (rule 3.7, draft 6), a wrong one refused first.
    let (ok, out) = talk(&dir, &["new", "words"], "", true);
    assert!(ok, "{out}");
    assert!(out.contains("The backup is hidden now."), "{out}");
    assert!(out.contains("That is not what was shown"), "{out}");
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

    // Draft 5's choice of the current seed: refused, nothing signed.
    let (ok, out) = run(&dir, &["sign", &f("pending.mor"), &f("signed.mor"), "--current-seed"], "SIGN\n");
    assert!(!ok && out.contains("never derived from the current seed"), "{out}");
    // Its fresh seed's backup not written: nothing signed.
    let (ok, out) = run(&dir, &["sign", &f("pending.mor"), &f("signed.mor")], "no\nSIGN\n");
    assert!(!ok && out.contains("FRESH SEED"), "{out}");
    assert!(!dir.join("signed.mor").exists());
    // Refused unless the user types SIGN.
    let (ok, out) = talk(&dir, &["sign", &f("pending.mor"), &f("signed.mor")], "sure", false);
    assert!(!ok);
    assert!(
        out.contains("New signing key: fingerprint"),
        "the summary is shown first"
    );
    // Written, three words typed back, then SIGN.
    let (ok, out) = talk(&dir, &["sign", &f("pending.mor"), &f("signed.mor")], "SIGN", false);
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
