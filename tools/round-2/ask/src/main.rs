//! ask [--json] ASK [ARG ...] --acts FILE[:KEYHEX] ...
//! ask --questions
//!
//! After --acts, `--feed PAGE.cbor` holds every act of a feed or record page
//! (read in place), and `--list FILE` reads more FILE arguments, one per line.
//! An act given twice is held once.
//!
//! Each FILE holds one act's bytes (.mor). Prints each answer: its word, the
//! grammar rule applied, its qualifier, whether disputed, the cMIP it rests
//! on, and the verifier's plain words. Reads only the files named.

use round_2_ask::{ask_holding, questions, ActIn};
use std::process::exit;

fn usage() -> ! {
    eprintln!("usage: ask [--json] ASK [ARG ...] --acts [FILE[:KEYHEX] | --feed PAGE | --list FILE] ...   |   ask --questions");
    exit(2)
}

fn main() {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    if argv.iter().any(|a| a == "--questions") {
        for (n, a) in questions() {
            println!("{n}\t{a}");
        }
        return;
    }
    let json = argv.iter().any(|a| a == "--json");
    // --as-default FP: an experiment (see ask_holding), never the kit's answer.
    let mut as_default = Vec::new();
    let mut rest: Vec<&String> = Vec::new();
    let mut i = 0;
    while i < argv.len() {
        if argv[i] == "--as-default" {
            let fp = argv.get(i + 1).unwrap_or_else(|| usage());
            as_default.push(hex::decode(fp).ok().and_then(|b| <[u8; 32]>::try_from(b).ok()).unwrap_or_else(|| usage()));
            i += 2;
            continue;
        }
        if argv[i] != "--json" {
            rest.push(&argv[i]);
        }
        i += 1;
    }
    if !as_default.is_empty() {
        eprintln!("EXPERIMENT: {} cMIP(s) held as G4.1's default; these are not the kit's answers", as_default.len());
    }
    let Some(split) = rest.iter().position(|a| *a == "--acts") else { usage() };
    let (head, files) = (&rest[..split], &rest[split + 1..]);
    let Some((name, args)) = head.split_first() else { usage() };
    let mut acts = Vec::new();
    let mut seen = std::collections::HashSet::new();
    let mut paths: Vec<String> = Vec::new();
    let mut feeds: Vec<String> = Vec::new();
    let mut it = files.iter();
    while let Some(f) = it.next() {
        match f.as_str() {
            "--feed" => feeds.push(it.next().unwrap_or_else(|| usage()).to_string()),
            "--list" => {
                let l = it.next().unwrap_or_else(|| usage());
                paths.extend(std::fs::read_to_string(l).unwrap_or_else(|e| { eprintln!("{l}: {e}"); exit(2) }).lines().filter(|x| !x.is_empty()).map(String::from));
            }
            _ => paths.push(f.to_string()),
        }
    }
    for p in &feeds {
        let page = std::fs::read(p).unwrap_or_else(|e| { eprintln!("{p}: {e}"); exit(2) });
        for bytes in round_2_ask::feed_acts(&page).unwrap_or_else(|e| { eprintln!("{p}: {e}"); exit(2) }) {
            if seen.insert(bytes.clone()) {
                acts.push(ActIn { bytes, key: None });
            }
        }
    }
    for f in &paths {
        let (path, key) = match f.rsplit_once(':') {
            Some((p, k)) if k.len() == 64 && k.chars().all(|c| c.is_ascii_hexdigit()) => (p, Some(k)),
            _ => (f.as_str(), None),
        };
        let bytes = std::fs::read(path).unwrap_or_else(|e| {
            eprintln!("{path}: {e}");
            exit(2)
        });
        let key = key.map(|k| hex::decode(k).unwrap().try_into().unwrap());
        if seen.insert(bytes.clone()) {
            acts.push(ActIn { bytes, key });
        }
    }
    let args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    match ask_holding(&acts, name, &args, &as_default) {
        Err(e) => {
            eprintln!("refused: {e}");
            exit(1)
        }
        Ok(text) if json => println!("{text}"),
        Ok(text) => {
            let v: serde_json::Value = serde_json::from_str(&text).unwrap();
            for a in v.as_array().unwrap() {
                let cmip = match &a["cmip"] {
                    serde_json::Value::Null => String::new(),
                    c => format!("  cmip {}", c),
                };
                println!(
                    "{}  rule {}  qualifier {}{}{}\n    {}",
                    a["word"].as_str().unwrap_or(""),
                    a["rule"].as_str().unwrap_or(""),
                    a["qualifier"].as_str().unwrap_or(""),
                    if a["disputed"] == true { "  disputed" } else { "" },
                    cmip,
                    a["says"].as_str().unwrap_or("")
                );
            }
        }
    }
}
