// verifier2's exporter (docs/verifier2-report.md). Included, as a child
// module, at the end of core/tests/law_invariants.rs, so that it can use the
// generator of random collective histories as it is, without copying it. It
// writes, for each story, the abstract story verifier2 reads (its acts: ids,
// signers, kinds, what each cites) and the library's verdicts on it. It is
// ignored unless asked for:
//
//   VERIFIER2_OUT=dir VERIFIER2_SEED=1 VERIFIER2_CASES=1000 \
//     cargo test -p mor-core --release --test law_invariants -- --ignored --exact verifier2_export::verifier2_export
//
// With VERIFIER2_REQUEST=file, each line "<case> <name> <op indices, comma
// separated>" exports instead the story of that case (drawn with the same
// seed) with only those steps applied: how verifier2 shrinks a disagreement.
//
// Nothing here changes the generator or the library.

use super::*;
use serde_json::{json, Map, Value as J};
use mor_core::chain::Held;
use mor_core::law::Consent;
use proptest::strategy::ValueTree;

fn hx(h: &Hash) -> String {
    h.iter().map(|b| format!("{b:02x}")).collect()
}

fn hxs(hs: &[Hash]) -> Vec<String> {
    hs.iter().map(hx).collect()
}

/// The founding agreement a collective's genesis declares (Law kind 0).
fn founding_of(v: &Verifier, collective: &Hash) -> Option<Hash> {
    let h = v.get(collective)?;
    let Some(Ok(mor_core::identity::Payload::Genesis(g))) = &h.identity else { return None };
    for d in g.declarations.iter().flatten() {
        if d.spec == mips().law && d.kind == law::kinds::FOUNDING_AGREEMENT {
            if let Some(Value::Bytes(b)) = &d.value {
                if b.len() == 32 {
                    let mut out = [0u8; 32];
                    out.copy_from_slice(b);
                    return Some(out);
                }
            }
        }
    }
    None
}

/// The story as verifier2 reads it: one JSON object per collective.
fn story_json(cw: &ColWorld) -> J {
    let v = &cw.w.v;
    let col = cw.col;
    let ids = cw.ids();
    let members: BTreeSet<Hash> = ids.iter().copied().collect();
    let mut names = Map::new();
    for (i, d) in cw.m.iter().enumerate() {
        names.insert(hx(&d[0].id), json!(["ana", "ben", "cy", "dee", "eli"][i]));
    }
    names.insert(hx(&col), json!("C"));
    for (i, a) in cw.agents.iter().enumerate() {
        names.insert(hx(&a.id), json!(if cw.grants.iter().any(|g| g.service && g.agent == i) { "service".to_string() } else { format!("agent{i}") }));
    }
    for (i, c) in cw.creditors.iter().enumerate() {
        names.insert(hx(&c.id), json!(format!("creditor{i}")));
    }
    names.insert(hx(&cw.stranger.id), json!("stranger"));
    for (i, s) in cw.successors.iter().enumerate() {
        names.insert(hx(s), json!(format!("S{i}")));
    }
    for (i, g) in cw.grants.iter().enumerate() {
        names.insert(hx(&g.id), json!(format!("G{i}")));
    }
    // Which grant an act was signed under: the generator's note, else its binding.
    let grant_ids: BTreeSet<Hash> = cw.grants.iter().map(|g| g.id).collect();
    let grant_of = |h: &Held| -> Option<Hash> {
        if let Some(f) = cw.info.get(&h.id) {
            if let Some(gi) = f.grant {
                return Some(cw.grants[gi].id);
            }
        }
        h.act.outside.binding.filter(|b| grant_ids.contains(b))
    };
    // Signature acts (Law type 1): the act named -> its signers.
    let mut sigs_on: BTreeMap<Hash, Vec<Hash>> = BTreeMap::new();
    for h in v.held_acts() {
        if h.inside.spec == mips().law && h.inside.type_ == law::types::SIGNATURE && v.status(&h.id) == Status::Valid {
            if let (Ok(x), Some(s)) = (law::decode_signature(&h.inside), h.act.outside.signer) {
                sigs_on.entry(x).or_default().push(s);
            }
        }
    }
    let endings: BTreeSet<Hash> = cw.endings.iter().map(|e| e.id).collect();
    let order: BTreeMap<Hash, usize> = cw.w.log.iter().enumerate().map(|(i, (a, _))| (a.id(), i)).collect();
    let mut acts: Vec<J> = vec![];
    let mut skipped: Vec<J> = vec![];
    let mut devices: BTreeMap<Hash, usize> = BTreeMap::new();
    for (i, d) in cw.c.iter().enumerate() {
        for x in &d.seq {
            devices.insert(*x, i);
        }
    }
    for h in v.held_acts() {
        let id = h.id;
        let signer = h.act.outside.signer;
        let valid = matches!(v.status(&id), Status::Valid | Status::Scoped);
        let public = h.act.outside.content_key.is_some();
        let to: Vec<Hash> = h.act.outside.to.clone().unwrap_or_default();
        let sealed_to_all = ids.iter().all(|m| to.contains(m));
        let prev: Option<String> = h.inside.prev.iter().flatten().next().map(hx);
        let cites: Vec<String> = h.inside.objects.iter().flatten().filter(|o| o.chain == col).map(|o| hx(&o.predecessor)).collect();
        let acks: Vec<String> = h.inside.acks.iter().flatten().map(hx).collect();
        let sigs: Vec<String> = sigs_on.get(&id).map(|s| hxs(s)).unwrap_or_default();
        let base = |type_: &str, signer_name: String| -> Map<String, J> {
            let mut m = Map::new();
            m.insert("id".into(), json!(hx(&id)));
            m.insert("order".into(), json!(order.get(&id).copied().unwrap_or(0)));
            m.insert("type".into(), json!(type_));
            m.insert("signer".into(), json!(signer_name));
            m.insert("valid".into(), json!(valid));
            m.insert("public".into(), json!(public));
            m.insert("sealed_to_all".into(), json!(sealed_to_all));
            if let Some(p) = &prev {
                m.insert("prev".into(), json!(p));
            }
            m.insert("cites".into(), json!(cites));
            if !acks.is_empty() {
                m.insert("acks".into(), json!(acks));
            }
            if !sigs.is_empty() {
                m.insert("sigs".into(), json!(sigs));
            }
            m
        };
        // The collective's genesis.
        if signer.is_none() {
            if id == col {
                let mut m = base("genesis", "C".into());
                m.remove("prev");
                m.insert("cites".into(), json!([]));
                acts.push(J::Object(m));
            }
            continue;
        }
        let signer = signer.unwrap();
        // Members' chain signatures on endings.
        if signer != col && members.contains(&signer) && h.inside.spec == mips().identity && h.inside.type_ == mor_core::identity::types::CHAIN_SIGNATURE {
            if let Some(Ok(mor_core::identity::Payload::ChainSignature(c))) = &h.identity {
                if endings.contains(&c.signs) {
                    let counts = v.resolve(&signer).position_of(&id).is_some();
                    acts.push(json!({"id": hx(&id), "order": order.get(&id).copied().unwrap_or(0), "type": "chain_sig", "signer": hx(&signer), "ending": hx(&c.signs), "position": c.position, "counts": counts, "valid": valid}));
                }
            }
            continue;
        }
        // Endings, signed by a member.
        if signer != col && members.contains(&signer) && h.inside.spec == mips().law && (h.inside.type_ == law::types::FORK || h.inside.type_ == law::types::CLOSING) {
            let objects: Vec<String> = h.inside.objects.iter().flatten().map(|o| o.predecessor).filter(|p| endings.contains(p) && *p != id).map(|p| hx(&p)).collect();
            if h.inside.type_ == law::types::FORK {
                let Ok(f) = law::Fork::decode(&h.inside) else { continue };
                let mut m = base("fork", hx(&signer));
                m.remove("prev");
                m.insert("cites".into(), json!([]));
                m.insert("tips".into(), json!(f.tips.iter().map(|t| hx(&t.act)).collect::<Vec<_>>()));
                // Each side's successor: its founding terms' parties and departed
                // holders (N4), read from the terms its genesis declares.
                let lv = cw.view();
                m.insert("sides".into(), json!(f.sides.iter().map(|s| {
                    let terms = founding_of(v, &s.successor).and_then(|ag| lv.terms(&ag).ok());
                    json!({"successor": hx(&s.successor), "members": hxs(&s.members),
                           "parties": terms.as_ref().map(|t| hxs(&t.parties)),
                           "keeps": terms.as_ref().map(|t| t.departed.as_ref().map(|d| hxs(d)).unwrap_or_default())})
                }).collect::<Vec<_>>()));
                m.insert("assigned".into(), json!(f.debts.iter().map(|(d, s)| json!({"obligation": hx(d), "sides": s})).collect::<Vec<_>>()));
                m.insert("objects".into(), json!(objects));
                let mut ss = Map::new();
                for s in &f.sides {
                    ss.insert(hx(&s.successor), json!(sigs_on.get(&id).is_some_and(|v| v.contains(&s.successor))));
                }
                m.insert("successor_signed".into(), J::Object(ss));
                m.insert("agreement".into(), json!(hx(&f.agreement)));
                acts.push(J::Object(m));
            } else {
                let Ok(c) = law::Closing::decode(&h.inside) else { continue };
                let mut m = base("closing", hx(&signer));
                m.remove("prev");
                m.insert("cites".into(), json!([]));
                m.insert("tips".into(), json!(c.tips.iter().map(|t| hx(&t.act)).collect::<Vec<_>>()));
                m.insert("objects".into(), json!(objects));
                m.insert("agreement".into(), json!(hx(&c.agreement)));
                // Out of verifier2's scope: whether the collective holds a stake (N9).
                // The generator's collective holds its work where it owns one, and
                // nothing in the stories releases it.
                m.insert("holds_nothing".into(), json!(!cw.shape.owns_work));
                acts.push(J::Object(m));
            }
            continue;
        }
        // Creditors' receipts and releases.
        if signer != col && h.inside.spec == mips().finance {
            match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Receipt(r)) if cw.debts.contains(&r.fulfils) => {
                    acts.push(json!({"id": hx(&id), "order": order.get(&id).copied().unwrap_or(0), "type": "payment", "signer": hx(&signer), "payee": hx(&r.payee), "obligation": hx(&r.fulfils), "amount": r.amount.value, "valid": valid}));
                }
                Ok(Fin::Release(r)) => {
                    acts.push(json!({"id": hx(&id), "order": order.get(&id).copied().unwrap_or(0), "type": "release", "signer": hx(&signer), "obligation": hx(&r.obligation), "valid": valid}));
                }
                _ => {}
            }
            continue;
        }
        if signer != col {
            continue;
        }
        // Acts in the collective's name: its own key's and its grant keys'.
        let grant = grant_of(h);
        let strand = match grant {
            Some(g) => format!("{}/key", hx(&g)),
            None => format!("C/d{}", devices.get(&id).copied().unwrap_or(9)),
        };
        let info = cw.info.get(&id);
        let lane = cw.shape.lane.is_some();
        let (type_, extra): (&str, Map<String, J>) = if h.inside.spec == mips().identity {
            if h.inside.type_ != mor_core::identity::types::WITNESS {
                skipped.push(json!({"id": hx(&id), "why": format!("identity type {}", h.inside.type_), "grant": grant.map(|g| hx(&g))}));
                continue;
            }
            ("publication", Map::new())
        } else if h.inside.spec == mips().law {
            match h.inside.type_ {
                law::types::RECORD => {
                    // A record that does not decode (the generator's record signed with
                    // a grant key names a departure that is no act): still an act on
                    // its strand, with no tips and no clone.
                    let r = law::Record::decode(&h.inside).unwrap_or(law::Record { clone: None, signatures: None, kept: vec![], registers: None });
                    let mut e = Map::new();
                    e.insert("tips".into(), json!(r.kept.iter().map(|t| hx(&t.act)).collect::<Vec<_>>()));
                    if let Some(c) = r.clone {
                        e.insert("clone".into(), json!(hx(&c)));
                    }
                    // The agreement a record names as chain: the clone it writes, else the agreement in force for it.
                    if let Some(o) = h.inside.objects.iter().flatten().next() {
                        e.insert("agreement".into(), json!(hx(&o.chain)));
                    }
                    let regs: Vec<J> = cw.departures.iter().filter(|(rec, _, _)| *rec == id).map(|(_, p, area)| {
                        if *area { json!({"member": hx(p), "what": "stepdown", "area": "finance"}) } else { json!({"member": hx(p), "what": "resign"}) }
                    }).collect();
                    e.insert("registers".into(), json!(regs));
                    ("record", e)
                }
                law::types::GRANT => {
                    let Ok(g) = law::Grant::decode(&h.inside.payload) else { continue };
                    let mut e = Map::new();
                    e.insert("grantee".into(), json!(hx(&g.grantee)));
                    if let Some(gi) = cw.grants.iter().find(|x| x.id == id) {
                        e.insert("accepted".into(), json!(gi.accepted));
                        if gi.in_area {
                            e.insert("area".into(), json!("finance"));
                        }
                    } else {
                        e.insert("accepted".into(), json!(false));
                    }
                    ("grant", e)
                }
                law::types::REVOCATION => {
                    let Ok(r) = law::Revocation::decode(&h.inside.payload) else { continue };
                    let mut e = Map::new();
                    e.insert("revokes".into(), json!(hx(&r.grant)));
                    if cw.grants.iter().any(|x| x.id == r.grant && x.in_area) {
                        e.insert("area".into(), json!("finance"));
                    }
                    ("revocation", e)
                }
                other => {
                    skipped.push(json!({"id": hx(&id), "why": format!("law type {other}"), "grant": grant.map(|g| hx(&g))}));
                    continue;
                }
            }
        } else if h.inside.spec == mips().finance {
            match Fin::decode(h.inside.type_, &h.inside.payload) {
                Ok(Fin::Obligation(o)) => {
                    let mut e = Map::new();
                    e.insert("creditor".into(), json!(hx(&o.creditor)));
                    e.insert("amount".into(), json!(o.amount.value));
                    if lane {
                        e.insert("area".into(), json!("finance"));
                    }
                    ("obligation", e)
                }
                Ok(_) => {
                    let mut e = Map::new();
                    if lane {
                        e.insert("area".into(), json!("finance"));
                    }
                    e.insert("kind".into(), json!(format!("finance type {}", h.inside.type_)));
                    ("publication", e)
                }
                Err(_) => {
                    skipped.push(json!({"id": hx(&id), "why": format!("finance type {} does not decode", h.inside.type_), "grant": grant.map(|g| hx(&g))}));
                    continue;
                }
            }
        } else if h.inside.spec == mips().envelope {
            ("publication", Map::new())
        } else {
            skipped.push(json!({"id": hx(&id), "why": format!("spec {} type {}", hx(&h.inside.spec)[..8].to_string(), h.inside.type_), "grant": grant.map(|g| hx(&g))}));
            continue;
        };
        let mut m = base(type_, strand);
        for (k, val) in extra {
            m.insert(k, val);
        }
        if let Some(g) = grant {
            m.insert("grant".into(), json!(hx(&g)));
            let decision = matches!(type_, "record" | "grant" | "revocation");
            m.insert("within_reach".into(), json!(decision || info.is_some_and(|_| cw.in_reach(&id))));
        }
        if let Some(f) = info {
            m.insert("kind".into(), json!(format!("{:?}", f.kind).split(' ').next().unwrap_or("").trim_end_matches('{').to_string()));
            m.insert("seal".into(), json!(format!("{:?}", f.seal)));
        }
        acts.push(J::Object(m));
    }
    let mut areas = Map::new();
    if let Some((_, k)) = cw.shape.lane {
        areas.insert("finance".into(), json!({"holders": hxs(&cw.lane_holders), "threshold": k}));
    }
    json!({
        "collective": hx(&col),
        "founding": hx(&cw.founding),
        "members": hxs(&ids),
        "skipped": skipped,
        "rule": match cw.shape.constitutional { None => json!({"kind": "every"}), Some(k) => json!({"kind": "threshold", "n": k}) },
        "areas": areas,
        "names": names,
        "acts": acts,
    })
}

/// The library's verdicts, in verifier2's terms.
fn ref_json(cw: &ColWorld, story: &J) -> J {
    let lv = cw.view();
    let v = &cw.w.v;
    let col = cw.col;
    let closed = lv.closed_by(&col).ok().flatten();
    let es = lv.ending_sigs(&col);
    let mut endings = Map::new();
    for e in &cw.endings {
        let (complete, why) = if e.fork {
            lv.fork(&e.id).map(|f| (f.complete, f.why)).unwrap_or((false, Some("error".into())))
        } else {
            lv.closing(&e.id).map(|c| (c.complete, c.why)).unwrap_or((false, Some("error".into())))
        };
        let status = if es.no_ending.contains_key(&e.id) { "no-ending" } else if complete { "complete" } else { "incomplete" };
        let mut sigs = Map::new();
        for m in cw.ids() {
            if es.counting.contains_key(&(e.id, m)) {
                sigs.insert(hx(&m), json!("counts"));
            } else if es.void.contains_key(&(e.id, m)) {
                sigs.insert(hx(&m), json!("void"));
            }
        }
        let names: Vec<String> = es.names.get(&e.id).map(|s| s.iter().map(hx).collect()).unwrap_or_default();
        endings.insert(hx(&e.id), json!({
            "status": status,
            "counts": closed.as_ref().is_some_and(|c| c.by == e.id),
            "signatures": sigs,
            "names": names,
            "why": why.map(|w| vec![w]).unwrap_or_default(),
        }));
    }
    let mut acts = Map::new();
    let mut debtors = Map::new();
    for a in story["acts"].as_array().unwrap() {
        let t = a["type"].as_str().unwrap();
        if !matches!(t, "record" | "grant" | "revocation" | "publication" | "obligation") {
            continue;
        }
        let id: Hash = {
            let s = a["id"].as_str().unwrap();
            let mut h = [0u8; 32];
            for i in 0..32 {
                h[i] = u8::from_str_radix(&s[2 * i..2 * i + 2], 16).unwrap();
            }
            h
        };
        let consent = lv.consent(&id);
        let backing = lv.backing(&id);
        let done = lv.done(&id).ok().flatten() == Some(Ok(()));
        let valid = matches!(v.status(&id), Status::Valid | Status::Scoped);
        let c = consent.as_ref().map(|c| c.counts()).unwrap_or(false);
        let after = lv.after_closing(&id).ok().flatten();
        let counts = match t {
            "genesis" => true,
            "obligation" => lv.obligation_binds(&id).ok().flatten() == Some(true),
            "record" => lv.record(&col, &id).map(|r| r.line).unwrap_or(false) && after.is_none() && a.get("grant").is_none(),
            _ if a.get("grant").is_some() => valid && c && backing.as_ref().map(|b| binds(b)).unwrap_or(false),
            _ => valid && c && after.is_none(),
        };
        let mut m = Map::new();
        m.insert("done".into(), json!(done));
        m.insert("counts".into(), json!(counts));
        m.insert("consent".into(), json!(format!("{consent:?}")));
        // Verdicts resting on rules outside verifier2's scope (Finance's rails, the
        // split service's limits, adoption of specifications): marked, so the
        // comparison can leave them out.
        let out_of_scope = match &consent {
            Ok(Consent::RailNotAccepted { .. }) | Ok(Consent::Unadopted { .. }) => true,
            Ok(Consent::Ungranted { reason, .. }) => reason.contains("split service"),
            _ => false,
        } || matches!(&backing, Ok(Backing::NotBacked { reason, .. }) if reason.contains("split service"));
        if out_of_scope {
            m.insert("out_of_scope".into(), json!(true));
        }
        if a.get("grant").is_some() {
            m.insert("backing".into(), json!(format!("{backing:?}")));
        }
        if t == "record" {
            m.insert("record".into(), json!(format!("{:?}", lv.record(&col, &id).map(|r| (r.line, r.not_a_line, r.registers.len())))));
        }
        if t == "obligation" {
            m.insert("binds".into(), json!(format!("{:?}", lv.obligation_binds(&id))));
            if let Ok(Some(ds)) = lv.debtors(&id) {
                if !ds.is_empty() {
                    debtors.insert(hx(&id), json!(hxs(&ds)));
                }
            }
        }
        if let Some(e) = after {
            m.insert("after_ending".into(), json!(hx(&e)));
        }
        acts.insert(hx(&id), J::Object(m));
    }
    json!({
        "closed_by": closed.map(|c| hx(&c.by)),
        "endings": endings,
        "acts": acts,
        "debtors": debtors,
    })
}

fn export_one(out: &str, name: &str, shape: &Shape, ops: &[Op], seed: u64, picked: Option<&[usize]>) {
    let chosen: Vec<Op> = match picked {
        Some(ix) => ix.iter().filter_map(|i| ops.get(*i).cloned()).collect(),
        None => ops.to_vec(),
    };
    let cw = run_col(shape, &chosen, seed);
    let story = story_json(&cw);
    let r = ref_json(&cw, &story);
    let ops_text: Vec<String> = chosen.iter().enumerate().map(|(i, o)| format!("{}: {o:?}", picked.map_or(i, |p| p[i]))).collect();
    let meta = json!({"name": name, "shape": format!("{shape:?}"), "seed": seed, "ops": ops_text, "picked": picked});
    let mut s = story.as_object().unwrap().clone();
    s.insert("meta".into(), meta);
    std::fs::write(format!("{out}/{name}.story.json"), serde_json::to_string_pretty(&J::Object(s)).unwrap()).unwrap();
    std::fs::write(format!("{out}/{name}.ref.json"), serde_json::to_string_pretty(&r).unwrap()).unwrap();
}

fn draw(run_seed: u64, upto: usize) -> Vec<(Shape, Vec<Op>, u64)> {
    let rng = TestRng::from_seed(RngAlgorithm::ChaCha, &sha256(&run_seed.to_le_bytes()));
    let mut runner = TestRunner::new_with_rng(config(upto as u32), rng);
    (0..upto).map(|_| story().new_tree(&mut runner).unwrap().current()).collect()
}

#[test]
#[ignore]
fn verifier2_export() {
    let out = std::env::var("VERIFIER2_OUT").expect("VERIFIER2_OUT: where to write");
    std::fs::create_dir_all(&out).unwrap();
    let run_seed: u64 = std::env::var("VERIFIER2_SEED").ok().and_then(|s| s.parse().ok()).unwrap_or(1);
    if let Ok(req) = std::env::var("VERIFIER2_REQUEST") {
        let text = std::fs::read_to_string(req).unwrap();
        let mut wanted: Vec<(usize, String, Vec<usize>, Vec<String>)> = vec![];
        for line in text.lines() {
            let mut parts = line.split_whitespace();
            let (Some(c), Some(n)) = (parts.next(), parts.next()) else { continue };
            let ix: Vec<usize> = parts.next().unwrap_or("").split(',').filter(|s| !s.is_empty()).map(|s| s.parse().unwrap()).collect();
            let overrides: Vec<String> = parts.map(|s| s.to_string()).collect();
            wanted.push((c.parse().unwrap(), n.to_string(), ix, overrides));
        }
        let upto = wanted.iter().map(|w| w.0 + 1).max().unwrap_or(0);
        let stories = draw(run_seed, upto);
        for (c, name, ix, overrides) in wanted {
            let (shape, ops, seed) = &stories[c];
            // Shape overrides, for shrinking: members=2 devices=1 member_devices=1
            // constitutional=none|k lane=none|mask,k owns_work=0|1.
            let mut shape = shape.clone();
            for o in overrides {
                let (k, val) = o.split_once('=').unwrap_or((&o, ""));
                match k {
                    "members" => shape.members = val.parse().unwrap(),
                    "devices" => shape.devices = val.parse().unwrap(),
                    "member_devices" => shape.member_devices = val.parse().unwrap(),
                    "constitutional" => shape.constitutional = if val == "none" { None } else { Some(val.parse().unwrap()) },
                    "lane" => shape.lane = if val == "none" { None } else { let (m, k) = val.split_once(',').unwrap(); Some((m.parse().unwrap(), k.parse().unwrap())) },
                    "owns_work" => shape.owns_work = val == "1",
                    _ => panic!("unknown override {o}"),
                }
            }
            if let Some(k) = shape.constitutional { shape.constitutional = Some(k.min(shape.members as u8)); }
            if let Some((mask, k)) = shape.lane {
                let mask = mask & ((1u8 << shape.members) - 1);
                let mask = if mask == 0 { 1 } else { mask };
                shape.lane = Some((mask, k.min(mask.count_ones() as u8)));
            }
            export_one(&out, &name, &shape, ops, *seed, Some(&ix));
        }
        return;
    }
    let n: usize = std::env::var("VERIFIER2_CASES").ok().and_then(|s| s.parse().ok()).unwrap_or(100);
    let first: usize = std::env::var("VERIFIER2_FIRST").ok().and_then(|s| s.parse().ok()).unwrap_or(0);
    let stories = draw(run_seed, n);
    for (i, (shape, ops, seed)) in stories.iter().enumerate().skip(first) {
        export_one(&out, &format!("case{i:05}"), shape, ops, *seed, None);
    }
    eprintln!("[verifier2_export] seed {run_seed}, {n} cases written to {out}");
}
