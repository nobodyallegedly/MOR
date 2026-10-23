//! The library against its published test vectors (`core/vectors/`).
//! Nothing here recomputes a vector from the generator: each file is read as
//! published and every value in it is checked.

use mor_core::act::{self, ActError, Inside, Outside, Sequence};
use mor_core::cbor;
use mor_core::hash::{sha256, tagged_hash, Hash};
use mor_core::{lock, mmr, text};
use serde_json::Value as J;

fn load(name: &str) -> J {
    let path = format!("{}/vectors/{name}", env!("CARGO_MANIFEST_DIR"));
    serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap()
}

fn b(v: &J) -> Vec<u8> {
    hex::decode(v.as_str().unwrap()).unwrap()
}

fn h(v: &J) -> Hash {
    b(v).try_into().unwrap()
}

#[test]
fn tagged_hash_vectors() {
    for v in load("tagged-hash.json")["vectors"].as_array().unwrap() {
        assert_eq!(
            tagged_hash(v["tag"].as_str().unwrap(), &b(&v["data"])),
            h(&v["hash"])
        );
    }
}

#[test]
fn cbor_vectors() {
    let f = load("cbor.json");
    for v in f["valid"].as_array().unwrap() {
        let bytes = b(&v["hex"]);
        let val = cbor::decode(&bytes).unwrap_or_else(|e| panic!("{}: {e}", v["hex"]));
        assert_eq!(cbor::encode(&val), bytes);
    }
    for v in f["invalid"].as_array().unwrap() {
        assert!(
            cbor::decode(&b(&v["hex"])).is_err(),
            "accepted {}",
            v["hex"]
        );
    }
}

#[test]
fn canonical_text_vectors() {
    let f = load("canonical-text.json");
    assert_eq!(f["unicode_version"], "17.0.0");
    for v in f["vectors"].as_array().unwrap() {
        let s: String = v["codepoints"]
            .as_array()
            .unwrap()
            .iter()
            .map(|c| {
                char::from_u32(u32::from_str_radix(&c.as_str().unwrap()[2..], 16).unwrap()).unwrap()
            })
            .collect();
        assert_eq!(s.as_bytes(), b(&v["utf8"]).as_slice());
        let r = text::check(&s);
        assert_eq!(
            r.is_ok(),
            v["canonical"].as_bool().unwrap(),
            "{}",
            v["note"]
        );
        assert_eq!(
            r.err().map(|e| e.rule() as u64),
            v["rule"].as_u64(),
            "{}",
            v["note"]
        );
    }
}

#[test]
fn lock_vectors() {
    for v in load("lock.json")["vectors"].as_array().unwrap() {
        let key: [u8; 32] = b(&v["key"]).try_into().unwrap();
        let nonce: [u8; 24] = b(&v["nonce"]).try_into().unwrap();
        let locked = lock::lock(&b(&v["plaintext"]), &key, &nonce);
        assert_eq!(locked, b(&v["locked"]));
        assert_eq!(sha256(&locked), h(&v["locked_hash"]));
        assert_eq!(
            lock::unlock(&locked, &key, &nonce).unwrap(),
            b(&v["plaintext"])
        );
    }
}

#[test]
fn running_summary_vectors() {
    let f = load("running-summary.json");
    let ids: Vec<Hash> = f["act_ids"].as_array().unwrap().iter().map(h).collect();
    for s in f["summaries"].as_array().unwrap() {
        let n = s["acts"].as_u64().unwrap() as usize;
        assert_eq!(mmr::summary(&ids[..n]), h(&s["summary"]), "{n} acts");
    }
}

#[test]
fn three_act_sequence() {
    let f = load("sequence-three-acts.json");
    let mut seq = Sequence::new();
    let mut ids = Vec::new();
    for a in f["acts"].as_array().unwrap() {
        // The outside decodes strictly, re-encodes to the same bytes, and names the signer.
        let outside_bytes = b(&a["outside"]);
        let outside = Outside::from_value(&cbor::decode(&outside_bytes).unwrap()).unwrap();
        assert_eq!(outside.encode(), outside_bytes);
        assert_eq!(outside.signer, Some(h(&f["signer"])));
        assert_eq!(outside.binding, Some(h(&f["binding"])));
        assert_eq!(outside.act_id(), h(&a["act_id"]));
        assert_eq!(outside.locked_hash, h(&a["locked_hash"]));
        assert_eq!(outside.inside_commitment, h(&a["inside_commitment"]));
        assert_eq!(outside.content_key.unwrap().to_vec(), b(&a["content_key"]));

        // Opening gives the published inside, which is a text act with the published text.
        let inside = act::open(&outside, &b(&a["locked"]), None).unwrap();
        assert_eq!(inside.encode(), b(&a["inside"]));
        assert_eq!(inside, Inside::decode(&b(&a["inside"])).unwrap());
        assert_eq!(inside.spec, h(&f["spec"]));
        assert_eq!(
            inside.payload,
            vec![(
                cbor::Value::Uint(0),
                cbor::Value::Text(a["text"].as_str().unwrap().into())
            )]
        );
        assert_eq!(inside.position, a["position"].as_u64());
        assert_eq!(inside.summary, Some(h(&a["summary"])));

        // Sealing the published inside with the published key and nonce gives the same act.
        let key: [u8; 32] = b(&a["content_key"]).try_into().unwrap();
        let nonce: [u8; 24] = b(&a["nonce"]).try_into().unwrap();
        let addr = act::Addressing {
            signer: outside.signer,
            binding: outside.binding,
            public: true,
            to: None,
        };
        let (o2, l2) = act::seal(&inside, &key, &nonce, &addr);
        assert_eq!(o2, outside);
        assert_eq!(l2, b(&a["locked"]));

        // The act fits its place in the sequence.
        assert_eq!(seq.summary(), h(&a["summary"]));
        seq.append(&outside.act_id(), &inside).unwrap();
        ids.push(outside.act_id());
    }
    assert_eq!(seq.summary(), h(&f["summary_including_last"]));
    assert_eq!(mmr::summary(&ids), h(&f["summary_including_last"]));
}

#[test]
fn open_act_vectors() {
    for v in load("open-act.json")["vectors"].as_array().unwrap() {
        // An outside not in its shape (an unknown key) is refused before anything is opened.
        let outside = match Outside::from_value(&cbor::decode(&b(&v["outside"])).unwrap()) {
            Ok(o) => o,
            Err(e) => {
                assert!(matches!(e, ActError::Shape(_)), "{}", v["why"]);
                assert_eq!(v["result"], "shape", "{}", v["why"]);
                continue;
            }
        };
        let got = match act::open(&outside, &b(&v["locked"]), None) {
            Ok(_) => "ok",
            Err(ActError::LockedHash) => "locked_hash",
            Err(ActError::Unlock) => "unlock",
            Err(ActError::InsideCommitment) => "inside_commitment",
            Err(ActError::Text(_)) => "text",
            Err(ActError::Shape(_)) => "shape",
            Err(ActError::Cbor(_)) => "cbor",
            Err(ActError::NoKey) => "no_key",
        };
        assert_eq!(got, v["result"].as_str().unwrap(), "{}", v["why"]);
    }
}

/// `sealed.json`: a sealed container in Envelopes draft 10's format (F293),
/// `[to, locked-act]`: rebuilt from its fixed inputs to the same bytes, two
/// parts on the outside, and opened by its recipient to the inner act.
#[test]
fn sealed_container_vector() {
    use mor_core::envelopes::{self, DecKey, Recipient, SealRandom, Sealed};
    let f = load("sealed.json");
    let secret: [u8; 32] = b(&f["recipient_xwing_secret"]).try_into().unwrap();
    let dk = DecKey::from_secret(secret);
    assert_eq!(dk.public.key, b(&f["recipient_xwing_public"]));
    let recipient = h(&f["recipient"]);
    let inner = mor_core::Act::decode(&b(&f["inner_act"])).unwrap();
    assert_eq!(inner.id(), h(&f["inner_act_id"]));
    let rnd = SealRandom {
        container_key: h(&f["container_key"]),
        nonce: b(&f["nonce"]).try_into().unwrap(),
        eseeds: vec![b(&f["eseed"]).try_into().unwrap()],
    };
    let key = h(&f["content_key"]);
    let sealed = envelopes::seal(&inner, Some(&key), &[Recipient::Identity { id: recipient, key: dk.public.clone() }], &rnd).unwrap();
    assert_eq!(sealed.encode(), b(&f["sealed"]));
    let cbor::Value::Array(parts) = mor_core::cbor::decode(&b(&f["sealed"])).unwrap() else { panic!() };
    assert_eq!(parts.len(), 2, "[to, locked-act]: no one-time key, no signature");
    let opened = envelopes::open(&Sealed::decode(&b(&f["sealed"])).unwrap(), Some(&recipient), &dk).unwrap();
    assert_eq!(opened.act, inner);
    assert_eq!(opened.key, Some(key));
    // Envelopes rule 12: each invalid container is refused, for the reason given.
    for v in f["invalid"].as_array().unwrap() {
        let got = match envelopes::open(&Sealed::decode(&b(&v["sealed"])).unwrap(), Some(&recipient), &dk) {
            Ok(_) => "ok",
            Err(envelopes::EnvError::Addressing(_)) => "addressing",
            Err(envelopes::EnvError::Shape(_)) => "shape",
            Err(_) => "other",
        };
        assert_eq!(got, v["result"].as_str().unwrap(), "{}", v["why"]);
    }
}

/// Part 2: signatures (`signatures.json`): keys from their secrets and
/// seeds, every valid signature valid, every failing one invalid.
#[test]
fn signature_vectors() {
    use mor_core::act::{Scheme, Signature};
    use mor_core::sig::{self, SchnorrKey, SlhKey, Verdict};
    let f = load("signatures.json");
    let msg = h(&f["msg"]);
    let verdict = |scheme: u8, key: &J, s: &J, m: &Hash| sig::verify(&Signature { scheme: Scheme::Founding(scheme), key: b(key), sig: b(s) }, m);
    let s = &f["schnorr"];
    let k = SchnorrKey::from_secret(&h(&s["secret"])).unwrap();
    assert_eq!(k.public().to_vec(), b(&s["public_key"]));
    assert_eq!(k.sign(&msg, &h(&s["aux"])).sig, b(&s["sig"]), "BIP-340 signing is deterministic given aux");
    assert_eq!(k.sign(&msg, &[0; 32]).sig, b(&s["sig_zero_aux"]));
    assert_eq!(sig::chain_key_commitment(&sig::SCHNORR, &k.public()), h(&s["commitment_if_scheme_1"]));
    for v in s["invalid"].as_array().unwrap() {
        assert_eq!(verdict(1, &v["key"], &v["sig"], &h(&v["msg"])), Verdict::Invalid, "{}", v["why"]);
    }
    for x in f["slh_dsa"].as_array().unwrap() {
        let scheme = x["scheme"].as_u64().unwrap() as u8;
        let seed = |k: &str| -> [u8; 16] { b(&x[k]).try_into().unwrap() };
        let key = SlhKey::from_seeds(scheme, &seed("sk_seed"), &seed("sk_prf"), &seed("pk_seed"));
        assert_eq!(key.public(), b(&x["public_key"]));
        assert_eq!(key.commitment(), h(&x["commitment"]));
        assert_eq!(key.sign(&msg, None).sig, b(&x["deterministic"]), "{}", x["name"]);
        assert_eq!(key.sign(&msg, Some(&seed("opt_rand"))).sig, b(&x["hedged"]));
        for v in x["invalid"].as_array().unwrap() {
            assert_eq!(verdict(scheme, &v["key"], &v["sig"], &h(&v["msg"])), Verdict::Invalid, "{}: {}", x["name"], v["why"]);
        }
    }
}

// ---------------------------------------------------------------- verdict vectors

/// Every verdict vector (`verdicts.json`): each case's acts decoded from
/// the published bytes into a fresh verifier, its facts stated, its
/// question asked, and the answer compared with the published verdict.
#[test]
fn verdict_vectors() {
    use mor_core::act::Act;
    use mor_core::agreements::{AgreementsView, Backing, Deadline, Keepers, Mirs, Rule};
    use mor_core::chain::{Status, Stop, Verifier};
    use mor_core::envelopes::anchoring::Reference;
    use serde_json::json;
    let f = load("verdicts.json");
    let m = &f["mirs"];
    let mirs = Mirs {
        identity: h(&m["identity"]),
        envelopes: h(&m["envelopes"]),
        text: h(&m["text"]),
        money: h(&m["money"]),
        agreements: h(&m["agreements"]),
        development: h(&m["development"]),
    };
    let name = |s: Status| match s {
        Status::Valid => "valid",
        Status::Disputed => "disputed",
        Status::Void => "void",
        Status::Pending => "pending",
        Status::Invalid => "invalid",
        Status::Unknown => "unknown",
        Status::NotCounting => "not counting",
        Status::Scoped => "scoped",
    };
    let mut n = 0;
    for layer in ["identity", "text", "envelopes", "money", "agreements"] {
        for c in f["cases"][layer].as_array().unwrap() {
            let what = c["name"].as_str().unwrap();
            let mut v = Verifier::with_mirs(mirs.identity, mirs.money, mirs.agreements).knowing_envelopes_and_text(mirs.envelopes, mirs.text);
            let mut refused = vec![];
            let facts = &c["facts"];
            for id in c["acts"].as_array().unwrap() {
                let act = Act::decode(&b(&f["pool"][id.as_str().unwrap()])).unwrap();
                assert_eq!(hex::encode(act.id()), id.as_str().unwrap(), "{what}: the act's id");
                // A private act's content key, held as a recipient holds it.
                let key: Option<[u8; 32]> = facts["content_keys"].get(id.as_str().unwrap()).map(|k| b(k).try_into().unwrap());
                if v.add_with_key(act, key.as_ref()).is_err() {
                    refused.push(h(id));
                }
            }
            for x in facts["found_at_home"].as_array().into_iter().flatten() {
                v.found_at_home(h(&x["act"]), h(&x["operator"]));
            }
            for p in facts["inclusion_proofs"].as_array().into_iter().flatten() {
                // The proof names the receipt it proves (Identity, "Audit"):
                // the receipt is held, and is the one the verifier proves.
                assert!(c["acts"].as_array().unwrap().iter().any(|a| a == &p["receipt"]), "{what}: the receipt a proof names is held");
                v.add_inclusion_proof(h(&p["summary"]), p["index"].as_u64().unwrap(), p["path"].as_array().unwrap().iter().map(h).collect());
            }
            for o in facts["failed_to_reach"].as_array().into_iter().flatten() {
                v.failed_to_reach(h(o));
            }
            let ask = &c["ask"];
            let got = match ask["question"].as_str().unwrap() {
                "status" | "verdict, implementing the MIRs only" if refused.contains(&h(&ask["act"])) => json!("invalid"),
                "status" => json!(name(v.status(&h(&ask["act"])))),
                "verdict, implementing the MIRs only" => {
                    let id = h(&ask["act"]);
                    let mir = [mirs.identity, mirs.envelopes, mirs.text, mirs.money, mirs.agreements, mirs.development].contains(&v.get(&id).unwrap().inside.spec);
                    json!(match v.status(&id) {
                        Status::Valid | Status::Scoped if !mir => "unknown",
                        s => name(s),
                    })
                }
                "chain" => {
                    let r = v.resolve(&h(&ask["identity"]));
                    let stop = match r.stop {
                        Stop::NoGenesis => "no genesis",
                        Stop::GenesisUnknown => "genesis unknown",
                        Stop::GenesisInvalid => "genesis invalid",
                        Stop::End => "end",
                        Stop::Pending(_) => "pending",
                        Stop::Contested(_) => "contested",
                        Stop::CannotTell(_) => "cannot tell",
                    };
                    let dishonest: Vec<J> = r
                        .dishonest
                        .iter()
                        .map(|(o, p)| json!({ "operator": match o { mor_core::identity::Operator::Id(x) => hex::encode(x), mor_core::identity::Operator::Own => "own".into() }, "from_position": p }))
                        .collect();
                    json!({ "counting": r.links.iter().map(|l| hex::encode(l.act)).collect::<Vec<_>>(), "next": stop, "dishonest": dishonest })
                }
                "vow" => {
                    use mor_core::agreements::SaleState as S;
                    match with_facts(&v, &mirs, facts).vow(&h(&ask["vow"])) {
                        Err(_) => json!("unknown"),
                        Ok(e) => json!({
                            "sales": e.sales.iter().map(|x| json!({ "act": hex::encode(x.act), "buyer": hex::encode(x.buyer), "state": match &x.state {
                                S::Pending => "pending", S::Confirmed { .. } => "confirmed", S::Contested { .. } => "contested", S::Unknown => "unknown" } })).collect::<Vec<_>>(),
                            "unsigned": e.unsigned.iter().map(hex::encode).collect::<Vec<_>>(),
                            "unknown": e.unknown.iter().map(hex::encode).collect::<Vec<_>>(),
                        }),
                    }
                }
                "purchase contests" => with_facts(&v, &mirs, facts)
                    .purchase_contests(&h(&ask["purchase"]))
                    .map_or(json!("unknown"), |x| json!(x.iter().map(hex::encode).collect::<Vec<_>>())),
                "refund repaid" => with_facts(&v, &mirs, facts)
                    .refund_repaid(&h(&ask["payment"]), &mor_core::money::RefundTo::Identity(h(&ask["to"])), &h(&ask["unit"]))
                    .map_or(json!("unknown"), |x| json!(x)),
                "version in force" => with_facts(&v, &mirs, facts).version_in_force(&h(&ask["act"])).map_or(json!("unknown"), |x| json!(hex::encode(x))),
                "fork" => match with_facts(&v, &mirs, facts).fork(&h(&ask["act"])) {
                    Ok(e) => json!({ "complete": e.complete }),
                    Err(_) => json!("unknown"),
                },
                "closing" => match with_facts(&v, &mirs, facts).closing(&h(&ask["act"])) {
                    Ok(e) => json!({ "complete": e.complete }),
                    Err(_) => json!("unknown"),
                },
                "succession" => {
                    use mor_core::chain::SuccessionSeen as S;
                    match v.succession(&h(&ask["identity"])) {
                        S::None => json!({ "seen": "none" }),
                        S::Declared { successor, .. } => json!({ "seen": "declared", "successor": hex::encode(successor) }),
                        S::Confirmed { successor, confirmation, .. } => json!({ "seen": "confirmed, followed", "successor": hex::encode(successor), "confirmation": hex::encode(confirmation) }),
                        S::Unknown { successor, .. } => json!({ "seen": "unknown", "successor": hex::encode(successor) }),
                        S::Elsewhere { .. } => json!({ "seen": "another protocol's" }),
                    }
                }
                "status after keepers" => {
                    let (rescued, unknown) = {
                        let av = AgreementsView::new(&v, mirs.clone());
                        (av.keeper_disputed_acts(), av.keeper_unknown_acts())
                    };
                    for a in rescued {
                        v.keeper_recorded(a);
                    }
                    for a in unknown {
                        v.keepers_cannot_tell(a);
                    }
                    json!(name(v.status(&h(&ask["act"]))))
                }
                "backing" => json!(match with_facts(&v, &mirs, facts).backing(&h(&ask["act"])).unwrap() {
                    Backing::NotUnderGrant => "not under a grant",
                    Backing::Backed { .. } => "backed",
                    Backing::NotBacked { .. } => "not backed (void)",
                    Backing::Binds { .. } => "binds",
                    Backing::Unknown { .. } => "unknown",
                    Backing::Disputed { .. } => "disputed",
                }),
                "consent counts" => json!(with_facts(&v, &mirs, facts).consent(&h(&ask["act"])).map(|c| c.counts()).unwrap_or(false)),
                "agreement exists" => json!(match with_facts(&v, &mirs, facts).agreement(&h(&ask["act"])).map(|a| a.exists) {
                    Ok(Some(true)) => "exists",
                    Ok(Some(false)) => "does not exist",
                    Ok(None) => "a clone put in force by a record",
                    Err(_) => "unknown",
                }),
                "deal fork" => match with_facts(&v, &mirs, facts).deal_fork(&h(&ask["act"])).unwrap() {
                    None => json!("one version in force"),
                    Some(d) => json!({ "reference": hex::encode(d.reference), "branches": d.branches.len(), "tangled": d.tangled.is_some() }),
                },
                "deadline" => {
                    let k = Keepers {
                        operators: ask["keepers"].as_array().unwrap().iter().map(h).collect(),
                        rule: match ask["rule"].as_array().unwrap().iter().map(|x| x.as_u64().unwrap()).collect::<Vec<_>>().as_slice() {
                            [0] => Rule::All,
                            [1, k] => Rule::Threshold(*k),
                            r => panic!("{what}: a keepers' rule the format does not write: {r:?}"),
                        },
                    };
                    let clock = Reference::decode(&cbor::decode(&b(&ask["clock"])).unwrap()).unwrap();
                    json!(match with_facts(&v, &mirs, facts).deadline(&h(&ask["act"]), Some(&k), &clock, ask["point"].as_u64().unwrap()) {
                        Deadline::Met { by_anchor: true } => "met, by an anchor of the act",
                        Deadline::Met { by_anchor: false } => "met, by the keepers' anchored records",
                        Deadline::Missed { .. } => "missed",
                        Deadline::Undetermined => "undetermined",
                    })
                }
                "paid toward" => with_facts(&v, &mirs, facts).paid_toward(&h(&ask["act"])).map_or(json!("unknown"), |x| json!(x)),
                "payment counts" => json!(match with_facts(&v, &mirs, facts).record_counts(&h(&ask["act"])) {
                    Some(true) => "counts",
                    Some(false) => "does not count",
                    None => "unknown",
                }),
                "purchase" => {
                    use mor_core::agreements::PurchaseVerdict as P;
                    json!(match with_facts(&v, &mirs, facts).purchase(&h(&ask["act"])) {
                        Err(_) => "unknown",
                        Ok(None) => "not a payment for a work",
                        Ok(Some(e)) => match e.verdict {
                            P::Purchase => "purchase",
                            P::NoPurchase { .. } => "no purchase",
                            P::Unrecorded => "unrecorded",
                            P::WrongReceipt { .. } => "wrong receipt",
                            P::Unknown => "unknown",
                        },
                    })
                }
                "disagreements" => with_facts(&v, &mirs, facts).disagreements(&h(&ask["receiver"])).map_or(json!("unknown"), |x| json!(x.len())),
                "specification claim" => json!(match v.specification_claim(&h(&ask["act"]), &h(&ask["creator"])) {
                    mor_core::chain::SpecClaim::Claimed => "claimed",
                    mor_core::chain::SpecClaim::Unclaimed { disputed: false } => "unclaimed",
                    mor_core::chain::SpecClaim::Unclaimed { disputed: true } => "unclaimed, shown as disputed",
                    mor_core::chain::SpecClaim::Unknown => "unknown",
                }),
                q => panic!("{what}: a question this check does not know: {q}"),
            };
            assert_eq!(got, c["verdict"], "{layer}: {what}");
            n += 1;
        }
    }
    // Development: specifications decoded, the payment cMIP told from bytes.
    use mor_core::development::{Judged, Spec};
    for c in f["cases"]["development"].as_array().unwrap() {
        let held: Vec<(Hash, Vec<u8>)> = c["held_specifications"].as_object().unwrap().iter().map(|(k, x)| (hex::decode(k).unwrap().try_into().unwrap(), b(x))).collect();
        let content = b(&c["content"]);
        assert_eq!(Spec::hash_of(&content), h(&c["spec_hash"]));
        let got = match Spec::decode_judged(&content, &h(&c["money"]), &|x| held.iter().find(|(k, _)| k == x).map(|(_, v)| v.clone())) {
            Judged::Spec(_) => json!("a specification"),
            Judged::NoSpecification(_) => json!("no specification"),
            Judged::Unknown(x) => json!(format!("unknown: the cMIP {} is not held", hex::encode(x))),
        };
        assert_eq!(got, c["verdict"], "{}", c["name"]);
        n += 1;
    }
    for c in f["cases"]["mir_hashes"].as_array().unwrap() {
        let got = Spec::mir_file_hash(c["file"].as_str().unwrap()).ok().map(hex::encode);
        assert_eq!(got.as_deref(), c["spec_hash"].as_str(), "{}", c["name"]);
        n += 1;
    }
    assert_eq!(n, 294);
}

/// An Agreements view over `v`, with the facts a verdict vector states.
fn with_facts<'a>(v: &'a mor_core::chain::Verifier, mirs: &mor_core::agreements::Mirs, facts: &J) -> mor_core::agreements::AgreementsView<'a> {
    use mor_core::envelopes::anchoring::{Anchor, Reference};
    let mut av = mor_core::agreements::AgreementsView::new(v, mirs.clone());
    for a in facts["anchors"].as_array().into_iter().flatten() {
        let r = Reference::decode(&cbor::decode(&b(&a["clock"])).unwrap()).unwrap();
        av.anchored.add(&Anchor { act: h(&a["act"]), reference: r, point: a["point"].as_u64().unwrap() });
    }
    for r in facts["rail_valid"].as_array().into_iter().flatten() {
        av.rail_valid.insert(h(&r["act"]), mor_core::money::PaidAt::Flow(h(&r["paid_to_flow"])));
    }
    for r in facts["rail_payments"].as_array().into_iter().flatten() {
        av.payments.insert(b(&r["proof"]), b(&r["payment"]));
    }
    for x in facts["judges_lapsed"].as_array().into_iter().flatten() {
        av.judges_lapsed.insert((h(&x["question"]), h(&x["judge"])));
    }
    for x in facts["settled_out_of_turn"].as_array().into_iter().flatten() {
        av.settled_out_of_turn.insert(h(x));
    }
    // A rail Module's kind and binding, read from its specification (fields
    // 11 and 13), under the specification's hash.
    for x in facts["rail_specifications"].as_array().into_iter().flatten() {
        use mor_core::development::{Known, Spec};
        if let Ok(Spec { rail: Some(r), .. }) = Spec::decode(&b(x), &Known::default()) {
            av.rails.insert(Spec::hash_of(&b(x)), r);
        }
    }
    av
}
