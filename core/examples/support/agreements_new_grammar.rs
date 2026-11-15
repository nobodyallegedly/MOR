//! The vectors of the grammar verifier of the new Agreements
//! (`core/vectors/agreements-new/grammar.json`).
//!
//! Every case is defined once, in the library
//! (`mor_core::agreements_new::grammar::cases`), with its acts (written with
//! the encoding's builders, signed by test identities), the stand-in layers'
//! tables, the question, the expected answer and the sentence of draft 24 it
//! tests. The generator writes a case only once the verifier gives that
//! answer, so the file never holds an answer the code does not give. Every
//! input is fixed, so the file comes out the same, byte for byte.

use mor_core::agreements_new::grammar::cases::{self, qualifier_kind};
use mor_core::agreements_new::grammar::stubs;
use mor_core::agreements_new::{self as an, Who};
use serde_json::{json, Value as J};
use std::path::Path;

fn hx(b: &[u8]) -> String {
    hex::encode(b)
}

fn who(w: &Option<Who>) -> J {
    match w {
        None => J::Null,
        Some(Who::Signer(h)) => json!({ "signer": hx(h) }),
        Some(Who::Agreement(h)) => json!({ "agreement": hx(h) }),
    }
}

pub fn write(dir: &Path) {
    let dir = dir.join("agreements-new");
    let mut out = vec![];
    for c in cases::all() {
        if let Err(e) = c.check() {
            panic!("case {}: {e}", c.name);
        }
        let (answers, asked) = c.run();
        let (ask, args) = c.question.describe();
        let b = &c.book;
        let mut places: Vec<J> = b
            .places
            .iter()
            .map(|(id, p)| {
                let mut pos: Vec<(String, u64)> = p.positions.iter().map(|(h, n)| (hx(h), *n)).collect();
                pos.sort_by_key(|x| x.1);
                let mut contra: Vec<String> = p.contradicted.iter().map(|h| hx(h)).collect();
                contra.sort();
                json!({ "id": hx(id), "positions": pos.iter().map(|(h, n)| json!([h, n])).collect::<Vec<_>>(), "contradicted": contra })
            })
            .collect();
        places.sort_by_key(|p| p["id"].as_str().unwrap().to_string());
        let mut clocks: Vec<J> = b
            .clocks
            .iter()
            .map(|(id, k)| {
                let mut t: Vec<(String, u64)> = k.times.iter().map(|(h, n)| (hx(h), *n)).collect();
                t.sort();
                json!({ "id": hx(id), "times": t.iter().map(|(h, n)| json!([h, n])).collect::<Vec<_>>() })
            })
            .collect();
        clocks.sort_by_key(|p| p["id"].as_str().unwrap().to_string());
        let chain = b.chain.as_ref().map(|ch| {
            let mut e: Vec<J> = ch
                .envelopes
                .iter()
                .map(|(id, e)| {
                    json!({
                        "bake": hx(id), "baker": hx(&e.baker), "work": hx(&e.work),
                        "transfers": e.transfers.iter().map(|(t, f, to)| json!({ "id": hx(t), "follows": hx(f), "to": hx(to) })).collect::<Vec<_>>(),
                        "holder_in_fork": e.holder_in_fork,
                    })
                })
                .collect();
            e.sort_by_key(|x| x["bake"].as_str().unwrap().to_string());
            json!({ "envelopes": e })
        });
        let money = b.money.as_ref().map(|m| {
            let mut st: Vec<String> = m.settlements.iter().map(|h| hx(h)).collect();
            st.sort();
            json!({
                "payments": m.payments.iter().map(|p| json!({ "id": hx(&p.id), "payer": hx(&p.payer), "version": hx(&p.version), "settlement": hx(&p.settlement), "amount": [hx(&p.amount.unit), p.amount.value] })).collect::<Vec<_>>(),
                "settlements": st,
                "same_payment": m.same.iter().map(|(a, b)| json!([hx(a), hx(b)])).collect::<Vec<_>>(),
            })
        });
        let w = &c.want;
        let parsed: Vec<J> = answers.iter().map(|a| serde_json::from_str(&a.to_json().text()).unwrap()).collect();
        out.push(json!({
            "name": c.name,
            "tests": c.rule,
            "sentence": c.sentence,
            "acts": b.acts.iter().map(|a| json!({ "id": hx(&a.id), "label": a.label, "bytes": hx(&a.bytes) })).collect::<Vec<_>>(),
            "layers": { "places": places, "clocks": clocks, "envelope_chain": chain, "money": money },
            "reader": { "on_behalf_of": who(&c.reader.on_behalf_of), "anchoring": c.reader.anchoring.map(|h| hx(&h)) },
            "limits": c.limits.map(|l| json!({ "receivers": l.receivers })),
            "question": { "ask": ask, "args": args },
            "stubs_asked": asked.iter().map(|x| json!({ "cmip": hx(&x.cmip), "stub": x.name, "task": x.task, "about": x.about.iter().map(|h| hx(h)).collect::<Vec<_>>(), "answer": x.answer })).collect::<Vec<_>>(),
            "answer": { "pick": w.pick, "word": w.word.word(), "rule": w.rule, "qualifier": qualifier_kind(&answers[w.pick].qualifier), "disputed": w.disputed, "who": who(&w.who) },
            "answers": parsed,
        }));
    }
    let names = [
        stubs::name::BODY,
        stubs::name::IN_FORCE,
        stubs::name::POWER,
        stubs::name::CONDITION,
        stubs::name::SPOT,
        stubs::name::CONTROL,
        stubs::name::KIND,
        stubs::name::DATA,
    ];
    let doc = json!({
        "about": "The grammar verifier's answers (docs/agreements-from-scratch/draft-24.md, section 4), each case built from real encoded acts (encoding-1, signed by test identities). Each case lists the acts held (id, label, complete bytes in hex), the stand-in layers' tables (a place, a clock, the envelope's chain, Money: stand-ins, for tests only), the reader, the question asked, what the stub cMIPs were asked and answered, the expected answer (the answer at position `pick`: its word, the grammar rule named, the kind of its qualifier, whether disputed, and who where it names someone), the sentence of draft 24 it tests, and every answer the verifier gave (its plain words are informative: two builders need not match them). Every identity is a test identity.",
        "spec": { "draft_24": hx(&an::SPEC_DRAFT_24), "report_block_3": hx(&an::SPEC_REPORT_BLOCK_3) },
        "stubs": names.iter().map(|n| json!({ "cmip": hx(&stubs::fp(n)), "stub": n, "for": "tests only: answers from its own parameters, as a table" })).collect::<Vec<_>>(),
        "cases": out,
    });
    let s = serde_json::to_string_pretty(&doc).unwrap() + "\n";
    std::fs::write(dir.join("grammar.json"), s).unwrap();
    println!("wrote agreements-new/grammar.json");
}
