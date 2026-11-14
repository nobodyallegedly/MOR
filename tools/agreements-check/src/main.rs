//! `agreements-check`: read the bytes of acts of the new Agreements encoding
//! (`docs/agreements-from-scratch/encoding-1.md`) and say, in plain words,
//! whether each one's shape, fields and signature pass, and if not, which
//! rule it fails.
//!
//! ```text
//! cargo run -p agreements-check -- [--hex] [--json] [--key HEX] FILE...
//! ```
//!
//! Each FILE holds one act's bytes (with `--hex`, the bytes written in
//! hexadecimal; `-` reads standard input). With several files, the acts are
//! read as the acts a verifier holds together, and `previous` is also checked
//! among them (G6.1). `--key HEX` is the content key of a private act, given
//! once for each private file, in order. The exit status is 0 when every act
//! passes, 1 when one does not, 2 on a usage error.

use mor_core::agreements_new::check::{Answer, Decoded};
use mor_core::agreements_new::{check, check_held, Verdict};
use std::io::Read;

fn usage() -> ! {
    eprintln!("usage: agreements-check [--hex] [--json] [--key HEX]... FILE...");
    eprintln!("  Reads acts of the new Agreements encoding and says whether their shape,");
    eprintln!("  fields and signature pass, naming the rule of encoding-1.md or draft 24");
    eprintln!("  each one fails. Several files are read as acts held together (G6.1).");
    std::process::exit(2)
}

fn read(path: &str, hex_in: bool) -> Vec<u8> {
    let mut raw = Vec::new();
    let r = if path == "-" { std::io::stdin().read_to_end(&mut raw).map(|_| ()) } else { std::fs::read(path).map(|b| raw = b) };
    if let Err(e) = r {
        eprintln!("{path}: {e}");
        std::process::exit(2);
    }
    if hex_in {
        let s: String = String::from_utf8_lossy(&raw).chars().filter(|c| !c.is_whitespace()).collect();
        match hex::decode(&s) {
            Ok(b) => b,
            Err(e) => {
                eprintln!("{path}: not hexadecimal: {e}");
                std::process::exit(2);
            }
        }
    } else {
        raw
    }
}

fn plain(path: &str, a: &Answer) -> String {
    let mut out = String::new();
    let what = a.act.as_ref().map(Decoded::word).unwrap_or("act");
    let head = match a.verdict {
        Verdict::Pass => format!("PASS: a {what} act of this encoding."),
        Verdict::Rejected => "REJECTED: this is no Agreements act; it never reaches the grammar rules.".into(),
        Verdict::Invalid => format!("INVALID: a {what} act whose bytes show it cannot count."),
        Verdict::Unknown => "UNKNOWN: signed with a scheme this checker does not implement.".into(),
        Verdict::Unopened => "CANNOT OPEN: a private act, and no key was given.".into(),
        Verdict::NotThisEncoding => "NOT THIS ENCODING: an act of another specification.".into(),
    };
    out.push_str(&format!("{path}\n  {head}\n"));
    if let Some(id) = a.id {
        out.push_str(&format!("  act id: {}\n", hex::encode(id)));
    }
    if let Some(r) = &a.rule {
        out.push_str(&format!("  rule: {r}\n"));
    }
    out.push_str(&format!("  {}\n", a.says));
    for f in a.invalid.iter().skip(1) {
        out.push_str(&format!("  also invalid, {}: {}\n", f.rule, f.says));
    }
    for n in &a.notes {
        out.push_str(&format!("  note, {}: {}\n", n.rule, n.says));
    }
    out
}

fn json(path: &str, a: &Answer) -> String {
    let f = |v: &[mor_core::agreements_new::Finding]| v.iter().map(|x| serde_json::json!({ "rule": x.rule, "says": x.says })).collect::<Vec<_>>();
    serde_json::json!({
        "file": path,
        "verdict": a.verdict.word(),
        "act": a.act.as_ref().map(Decoded::word),
        "id": a.id.map(hex::encode),
        "signer": a.signer.map(hex::encode),
        "rule": a.rule,
        "says": a.says,
        "invalid": f(&a.invalid),
        "notes": f(&a.notes),
    })
    .to_string()
}

fn main() {
    let mut hex_in = false;
    let mut as_json = false;
    let mut keys: Vec<[u8; 32]> = Vec::new();
    let mut files: Vec<String> = Vec::new();
    let mut args = std::env::args().skip(1);
    while let Some(a) = args.next() {
        match a.as_str() {
            "--hex" => hex_in = true,
            "--json" => as_json = true,
            "--key" => {
                let k = args.next().unwrap_or_else(|| usage());
                match hex::decode(&k).ok().and_then(|b| <[u8; 32]>::try_from(b).ok()) {
                    Some(k) => keys.push(k),
                    None => {
                        eprintln!("--key takes a 32-byte content key in hexadecimal");
                        std::process::exit(2);
                    }
                }
            }
            "-h" | "--help" => usage(),
            _ => files.push(a),
        }
    }
    if files.is_empty() {
        usage();
    }
    let bytes: Vec<Vec<u8>> = files.iter().map(|f| read(f, hex_in)).collect();
    // Keys go to the files that need one, in order.
    let mut keys = keys.into_iter();
    let mut with_keys: Vec<(&[u8], Option<[u8; 32]>)> = Vec::new();
    for b in &bytes {
        let needs = check(b, None).verdict == Verdict::Unopened;
        with_keys.push((b.as_slice(), if needs { keys.next() } else { None }));
    }
    let input: Vec<(&[u8], Option<&[u8; 32]>)> = with_keys.iter().map(|(b, k)| (*b, k.as_ref())).collect();
    let answers = if input.len() == 1 { vec![check(input[0].0, input[0].1)] } else { check_held(&input) };
    let mut all_pass = true;
    for (path, a) in files.iter().zip(&answers) {
        all_pass &= a.verdict == Verdict::Pass;
        if as_json {
            println!("{}", json(path, a));
        } else {
            print!("{}", plain(path, a));
        }
    }
    std::process::exit(if all_pass { 0 } else { 1 });
}
