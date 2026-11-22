//! `count-ask`: ask verifier 2 about acts given as files.
//!
//! ```text
//! count-ask [OPTIONS] ASK [ARG ...] --acts FILE ...
//! count-ask [OPTIONS] --asks FILE|- --acts FILE ...
//! count-ask --index --acts FILE ...
//! ```
//!
//! Options:
//!   --acts FILE ...            act files (.mor), each one act's bytes
//!   --acts-from FILE           a text file of act file paths, one a line
//!   --page FILE ...            a home's feed pages, read in place
//!   --only-agreements          keep only Terms, Statements and reports
//!   --place ID=FILE            a place: the acts it shows, in order, one hex id a line
//!   --place-records ID=PAGE[,PAGE...]   a place, from its own record pages
//!   --upto N                   cut every place given at position N
//!   --anchoring ID             the anchoring the reader accepts (a place given)
//!   --on-behalf-of WHO         signer:<hex> or agreement:<hex>
//!   --asks FILE|-              questions, one a line: ASK ARG ...
//!   --stand-in FP=NAME         exploratory: hold a stand-in cMIP (see standin.rs)
//!   --others-are-pieces        hold the acts given that are of another specification as pieces that are no acts
//!   --piece ID                 hold a fingerprint as a piece that is no act
//!   --index                    print what each act names, and the checker's verdict
//!
//! Output: one JSON object a line. For a question: the question, then each
//! answer with its word, the grammar rule applied, its qualifier and words.

use count_ask::{acts_of_page, answer_json, ask, build, h, index, place_order, Input, PlaceIn};
use mor_core::agreements_new::{check, Verdict};
use serde_json::json;
use std::io::Read;

fn fail(m: &str) -> ! {
    eprintln!("count-ask: {m}");
    std::process::exit(2)
}

fn main() {
    let argv: Vec<String> = std::env::args().skip(1).collect();
    let mut input = Input::default();
    let mut question: Vec<String> = vec![];
    let mut asks_file: Option<String> = None;
    let mut upto: Option<u64> = None;
    let mut do_index = false;
    let mut only_agreements = false;
    let mut mode = "";
    let mut i = 0;
    let next = |i: &mut usize| -> String {
        *i += 1;
        argv.get(*i).cloned().unwrap_or_else(|| fail("an option lacks its value"))
    };
    while i < argv.len() {
        let a = argv[i].as_str();
        match a {
            "--acts" => mode = "acts",
            "--page" => mode = "page",
            "--acts-from" => {
                let f = next(&mut i);
                let text = std::fs::read_to_string(&f).unwrap_or_else(|e| fail(&format!("{f}: {e}")));
                for l in text.lines().filter(|l| !l.trim().is_empty()) {
                    input.acts.push(std::fs::read(l.trim()).unwrap_or_else(|e| fail(&format!("{l}: {e}"))));
                }
                mode = "";
            }
            "--only-agreements" => only_agreements = true,
            "--others-are-pieces" => input.others_are_pieces = true,
            "--piece" => input.pieces.push(h(&next(&mut i)).unwrap_or_else(|e| fail(&e))),
            "--index" => do_index = true,
            "--upto" => upto = Some(next(&mut i).parse().unwrap_or_else(|_| fail("--upto takes a position"))),
            "--anchoring" => input.anchoring = Some(h(&next(&mut i)).unwrap_or_else(|e| fail(&e))),
            "--on-behalf-of" => input.on_behalf_of = Some(next(&mut i)),
            "--asks" => asks_file = Some(next(&mut i)),
            "--stand-in" => {
                let v = next(&mut i);
                let (fp, name) = v.split_once('=').unwrap_or_else(|| fail("--stand-in takes FP=NAME"));
                input.standins.push((h(fp).unwrap_or_else(|e| fail(&e)), name.to_string()));
            }
            "--place" => {
                let v = next(&mut i);
                let (id, f) = v.split_once('=').unwrap_or_else(|| fail("--place takes ID=FILE"));
                let text = std::fs::read_to_string(f).unwrap_or_else(|e| fail(&format!("{f}: {e}")));
                let acts: Vec<_> = text.lines().filter(|l| !l.trim().is_empty()).map(|l| h(l).unwrap_or_else(|e| fail(&e))).collect();
                input.places.push(PlaceIn::in_order(h(id).unwrap_or_else(|e| fail(&e)), &acts));
                mode = "";
            }
            "--place-records" => {
                let v = next(&mut i);
                let (id, fs) = v.split_once('=').unwrap_or_else(|| fail("--place-records takes ID=PAGE[,PAGE...]"));
                let pages: Vec<Vec<u8>> = fs.split(',').map(|f| std::fs::read(f).unwrap_or_else(|e| fail(&format!("{f}: {e}")))).collect();
                let positions = place_order(&pages).unwrap_or_else(|e| fail(&e));
                input.places.push(PlaceIn { id: h(id).unwrap_or_else(|e| fail(&e)), positions, contradicted: vec![] });
                mode = "";
            }
            _ if a.starts_with("--") => fail(&format!("no option {a}")),
            _ => match mode {
                "acts" => input.acts.push(std::fs::read(a).unwrap_or_else(|e| fail(&format!("{a}: {e}")))),
                "page" => {
                    let b = std::fs::read(a).unwrap_or_else(|e| fail(&format!("{a}: {e}")));
                    input.acts.extend(acts_of_page(&b).unwrap_or_else(|e| fail(&format!("{a}: {e}"))));
                }
                _ => question.push(a.to_string()),
            },
        }
        i += 1;
    }
    if let Some(n) = upto {
        input.places = input.places.into_iter().map(|p| p.upto(n)).collect();
    }
    // One copy of each act; optionally only the acts of this encoding.
    let mut seen = std::collections::HashSet::new();
    input.acts.retain(|b| seen.insert(b.clone()));
    if only_agreements {
        input.acts.retain(|b| !matches!(check(b, None).verdict, Verdict::NotThisEncoding | Verdict::Rejected));
    }
    if do_index {
        for o in index(&input.acts) {
            println!("{o}");
        }
        return;
    }
    let mut questions: Vec<Vec<String>> = vec![];
    if !question.is_empty() {
        questions.push(question);
    }
    if let Some(f) = asks_file {
        let mut text = String::new();
        if f == "-" {
            std::io::stdin().read_to_string(&mut text).unwrap_or_else(|e| fail(&e.to_string()));
        } else {
            text = std::fs::read_to_string(&f).unwrap_or_else(|e| fail(&format!("{f}: {e}")));
        }
        for l in text.lines().filter(|l| !l.trim().is_empty() && !l.starts_with('#')) {
            questions.push(l.split_whitespace().map(String::from).collect());
        }
    }
    if questions.is_empty() {
        fail("no question: give ASK [ARG ...], or --asks FILE, or --index");
    }
    let built = build(&input).unwrap_or_else(|e| fail(&e));
    let v = built.verifier();
    for q in &questions {
        let args: Vec<&str> = q[1..].iter().map(|s| s.as_str()).collect();
        match ask(&v, &q[0], &args) {
            Ok(answers) => println!("{}", json!({ "ask": q[0], "args": args, "answers": answers.iter().map(answer_json).collect::<Vec<_>>() })),
            Err(e) => println!("{}", json!({ "ask": q[0], "args": args, "error": e })),
        }
    }
}
