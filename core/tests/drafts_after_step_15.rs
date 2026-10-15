//! The step 15 decisions for Envelopes, Text and Identity (the drafts after
//! step 15: Envelopes draft 10, Text draft 8, Identity draft 13; the freeze
//! suite v28, components under "Envelopes and Text" and scenario 5).
//!
//! - F295, F296: an Envelopes or Text act outside its type's format, or of a
//!   type its MIR does not define, is invalid; a text act carries no `acks`
//!   and no `objects`; Envelopes type 2 is retired (F294).
//! - Envelopes rule 13: `prev` absent, or with two entries, is invalid act
//!   by act (Fable's E1; F328, Q1); position and summary are judged only
//!   when a line is rebuilt (F292).
//! - Invalid beats unknown (Fable's T3).
//! - F297: evidence counts only while its signer's chain keeps it.
//! - F298: a verifier that does not hold what a rule needs answers unknown.
//! - F300: a succession is declared by the rotation and confirmed by the
//!   successor.

mod common;

use common::*;
use mor_core::act::{self, Act, Addressing, Inside, Object, Scheme, Signature};
use mor_core::cbor::Value;
use mor_core::chain::{Status, Stop, SuccessionSeen};
use mor_core::hash::{sha256, Hash, ZERO_HASH};
use mor_core::identity::{Audit, KeptTip, Successor};
use mor_core::mmr::Mmr;

fn chain(w: &World, p: &Person) -> Vec<Hash> {
    w.v.resolve(&p.id).links.iter().map(|l| l.act).collect()
}

/// An everyday act of `p` with its `prev`, position and summary as given,
/// signed with `p`'s signing key (or with `sig`, if given), not held.
#[allow(clippy::too_many_arguments)]
fn raw(
    p: &Person,
    spec: Hash,
    type_: u64,
    payload: Vec<(Value, Value)>,
    prev: Option<Vec<Hash>>,
    position: Option<u64>,
    summary: Option<Hash>,
    objects: Option<Vec<Object>>,
    acks: Option<Vec<Hash>>,
    label: &str,
    sig: Option<Signature>,
) -> Act {
    let inside = Inside {
        spec,
        type_,
        prev,
        objects,
        payload,
        position,
        summary,
        acks,
        refs: None,
        hint: None,
        salt: sha256(label.as_bytes())[..16].try_into().unwrap(),
    };
    let key = sha256(format!("{label}/key").as_bytes());
    let nonce: [u8; 24] = sha256(format!("{label}/nonce").as_bytes())[..24].try_into().unwrap();
    let sign = p.sign.clone();
    act::make(
        &inside,
        &key,
        &nonce,
        &Addressing {
            signer: Some(p.id),
            binding: Some(p.binding),
            public: true,
            to: None,
        },
        |id| sig.unwrap_or_else(|| sign.sign(id, &[0; 32])),
    )
}

/// The next act of `p`'s sequence, in its place, with this payload.
fn next(p: &mut Person, spec: Hash, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>, acks: Option<Vec<Hash>>, label: &str) -> Act {
    let prev = Some(p.seq.last().map(|x| vec![*x]).unwrap_or_default());
    let position = Some(p.seq.len() as u64 + 1);
    let summary = Some(if p.seq.is_empty() { ZERO_HASH } else { Mmr::from_ids(&p.seq).root() });
    let a = raw(p, spec, type_, payload, prev, position, summary, objects, acks, label, None);
    p.seq.push(a.id());
    a
}

fn text(t: &str) -> Vec<(Value, Value)> {
    vec![(Value::Uint(0), Value::Text(t.into()))]
}

/// A signature under a scheme named by the hash of a specification this
/// client does not implement: unknown to it, never invalid.
fn unknown_scheme_signature() -> Signature {
    Signature {
        scheme: Scheme::Spec(sha256(b"a signature scheme this client lacks")),
        key: vec![7; 40],
        sig: vec![9; 80],
    }
}

// ---------------------------------------------------------------- Text (F295, F296)

/// Freeze suite v28, "Envelopes and Text": a text act with no text, with a
/// field 0 that is not a text string, with a field 2, or of a type Text does
/// not define, is invalid in every client; one carrying `objects`, or
/// `acks`, is invalid too (F296, F110); the text act in its format is valid.
#[test]
fn a_text_act_outside_its_format_is_invalid_f295_f296() {
    let mut w = World::new();
    let mut p = w.operator("writer");
    let good = next(&mut p, text_spec(), 0, text("hello"), None, None, "good");
    let good = w.add(&good);
    assert_eq!(w.v.status(&good), Status::Valid);
    let with_format = next(
        &mut p,
        text_spec(),
        0,
        vec![(Value::Uint(0), Value::Text("# hello".into())), (Value::Uint(1), Value::Bytes(sha256(b"a format").to_vec()))],
        None,
        None,
        "with a format",
    );
    let with_format = w.add(&with_format);
    assert_eq!(w.v.status(&with_format), Status::Valid, "field 1, a format's hash");
    let cases: Vec<(&str, u64, Vec<(Value, Value)>, Option<Vec<Object>>, Option<Vec<Hash>>)> = vec![
        ("no text", 0, vec![], None, None),
        ("field 0 not a text string", 0, vec![(Value::Uint(0), Value::Bytes(b"hello".to_vec()))], None, None),
        ("a field 2", 0, vec![(Value::Uint(0), Value::Text("hello".into())), (Value::Uint(2), Value::Uint(1))], None, None),
        ("field 1 not a hash", 0, vec![(Value::Uint(0), Value::Text("hello".into())), (Value::Uint(1), Value::Text("md".into()))], None, None),
        ("a type Text does not define", 7, text("hello"), None, None),
        ("objects", 0, text("hello"), Some(vec![Object { chain: good, predecessor: good }]), None),
        ("acks", 0, text("hello"), None, Some(vec![good])),
    ];
    for (label, type_, payload, objects, acks) in cases {
        let a = next(&mut p, text_spec(), type_, payload, objects, acks, label);
        let id = w.add(&a);
        assert_eq!(w.v.status(&id), Status::Invalid, "{label}");
    }
    // A text act naming an agreement's head in `objects` is no fork of that
    // agreement: it is not a valid act at all (F296).
    let head = sha256(b"an agreement's head");
    let fork_like = next(&mut p, text_spec(), 0, text("a reply"), Some(vec![Object { chain: head, predecessor: head }]), None, "fork-like");
    let fork_like = w.add(&fork_like);
    assert_eq!(w.v.status(&fork_like), Status::Invalid);
}

/// A verifier that does not know which specification is Text's cannot apply
/// Text's format: for it the act is of a specification it does not
/// implement, and shown as the WebAssembly verifier is told (Envelopes
/// draft 10, rule 30). Every client knows Text's hash (E5's client half).
#[test]
fn text_strictness_needs_the_text_hash() {
    let mut w = World::new();
    let mut p = w.operator("writer");
    let bad = next(&mut p, text_spec(), 0, vec![], None, None, "no text");
    let bad = w.add(&bad);
    assert_eq!(w.v.status(&bad), Status::Invalid);
    let mut blind = mor_core::chain::Verifier::with_mirs(identity_spec(), money_spec(), agreements_spec());
    for (a, _) in &w.log {
        blind.add(a.clone()).unwrap();
    }
    assert_eq!(blind.status(&bad), Status::Valid, "the format cannot be applied without Text's hash");
}

// ---------------------------------------------------------------- Envelopes (F294, F295, E7)

fn publication_payload() -> Vec<(Value, Value)> {
    publication(vec![])
}

#[test]
fn an_envelopes_act_outside_its_format_is_invalid_f294_f295() {
    let mut w = World::new();
    let mut p = w.operator("publisher");
    let env = envelopes_spec();
    let pubn = next(&mut p, env, 0, publication_payload(), None, None, "publication");
    let pubn = w.add(&pubn);
    assert_eq!(w.v.status(&pubn), Status::Valid);
    // A withdrawal in its format: `{}` with the entry [publication, publication].
    let wd = next(&mut p, env, 3, vec![], Some(vec![Object { chain: pubn, predecessor: pubn }]), None, "withdrawal");
    let wd = w.add(&wd);
    assert_eq!(w.v.status(&wd), Status::Valid);
    let mut extra = publication_payload();
    extra.push((Value::Uint(9), Value::Uint(1)));
    let mut no_nonce = publication_payload();
    no_nonce.retain(|(k, _)| *k != Value::Uint(4));
    let cases: Vec<(&str, u64, Vec<(Value, Value)>, Option<Vec<Object>>)> = vec![
        ("type 2, retired (F294)", 2, vec![(Value::Uint(0), Value::Uint(3)), (Value::Uint(1), Value::Bytes(vec![0; 32]))], None),
        ("type 6, undefined", 6, vec![], None),
        ("a publication with a field 9", 0, extra, None),
        ("a publication without its nonce", 0, no_nonce, None),
        ("a withdrawal with a payload", 3, vec![(Value::Uint(0), Value::Uint(1))], Some(vec![Object { chain: pubn, predecessor: pubn }])),
        ("a withdrawal naming no publication", 3, vec![], None),
        ("a key delivery with no key", 1, vec![(Value::Uint(0), Value::Bytes(pubn.to_vec()))], None),
    ];
    for (label, type_, payload, objects) in cases {
        let a = next(&mut p, env, type_, payload, objects, None, label);
        let id = w.add(&a);
        assert_eq!(w.v.status(&id), Status::Invalid, "{label}");
    }
}

/// Fable's E7: a key delivery is valid as an act by its shape; its key is
/// used only if it opens what it names, and one that does not is ignored.
#[test]
fn a_key_delivery_with_a_wrong_key_is_valid_and_its_key_ignored_e7() {
    let mut w = World::new();
    let mut p = w.operator("seller");
    let secret = w.private_act(&mut p, text_spec(), 0, text("a private text"), None, vec![sha256(b"a buyer")]);
    let wrong = mor_core::envelopes::KeyDelivery { target: secret, key: sha256(b"not the key"), media: false };
    let kd = next(&mut p, envelopes_spec(), 1, wrong.to_map(), None, None, "a wrong key");
    let kd = w.add(&kd);
    assert_eq!(w.v.status(&kd), Status::Valid, "valid by its shape");
    let held = w.v.get(&secret).unwrap().act.clone();
    assert!(wrong.opens(&held).is_err(), "its key opens nothing: ignored, and shown so");
}

// ---------------------------------------------------------------- Envelopes rule 13 (E1, F328 Q1, F292)

/// Freeze suite v28, 5.5d: two entries in `prev` are invalid act by act,
/// as an absent `prev` is, in whatever order a verifier meets the acts.
#[test]
fn prev_absent_or_with_two_entries_is_invalid_act_by_act_5_5d() {
    let mut w = World::new();
    let mut p = w.operator("journalist");
    let a1 = next(&mut p, text_spec(), 0, text("one"), None, None, "a1");
    let a2 = next(&mut p, text_spec(), 0, text("two"), None, None, "a2");
    let (i1, i2) = (a1.id(), a2.id());
    let two = raw(&p, text_spec(), 0, text("two prev"), Some(vec![i1, i2]), Some(3), Some(Mmr::from_ids(&[i1, i2]).root()), None, None, "two", None);
    let none = raw(&p, text_spec(), 0, text("no prev"), None, Some(3), Some(Mmr::from_ids(&[i1, i2]).root()), None, None, "none", None);
    let one = raw(&p, text_spec(), 0, text("one prev"), Some(vec![i2]), Some(3), Some(Mmr::from_ids(&[i1, i2]).root()), None, None, "one", None);
    // In both orders: the shape needs nothing but the act.
    for order in [vec![&two, &none, &one, &a1, &a2], vec![&a1, &a2, &one, &none, &two]] {
        let mut v = mor_core::chain::Verifier::with_mirs(identity_spec(), money_spec(), agreements_spec()).knowing_envelopes_and_text(envelopes_spec(), text_spec());
        v.add(w.v.get(&p.id).unwrap().act.clone()).unwrap();
        for a in order {
            v.add(a.clone()).unwrap();
        }
        assert_eq!(v.status(&two.id()), Status::Invalid, "two entries in prev");
        assert_eq!(v.status(&none.id()), Status::Invalid, "no prev");
        assert_eq!(v.status(&one.id()), Status::Valid);
    }
    let _ = &mut w;
}

/// F292: position and summary are not checked act by act; an act whose
/// position does not fit cannot be proven kept when its line is rebuilt.
#[test]
fn a_bad_position_is_judged_only_when_the_line_is_rebuilt_f292() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let mut jj = j.clone();
    let a1 = next(&mut jj, text_spec(), 0, text("one"), None, None, "p1");
    let i1 = w.add(&a1);
    // A buggy client: position 40 on a predecessor at 1, the summary wrong too.
    let bad = raw(&jj, text_spec(), 0, text("forty"), Some(vec![i1]), Some(40), Some(sha256(b"no summary")), None, None, "bad", None);
    let ib = w.add(&bad);
    let a3 = raw(&jj, text_spec(), 0, text("forty-one"), Some(vec![ib]), Some(41), Some(sha256(b"no summary either")), None, None, "p3", None);
    let i3 = w.add(&a3);
    for x in [i1, ib, i3] {
        assert_eq!(w.v.status(&x), Status::Valid, "not judged act by act");
    }
    // The rotation keeps the tip as the client saw it: the line rebuilt from
    // the acts held does not fit, so the earlier acts cannot be proven kept.
    let (r, _) = w.rotate(&jj, Rot { kept: Some(vec![KeptTip { act: i3, position: 41, summary: sha256(b"no summary either") }]), ..Default::default() });
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(chain(&w, &j), vec![j.id, r]);
    assert_eq!(w.v.status(&i1), Status::Void);
    assert_eq!(w.v.status(&ib), Status::Void);
    assert_eq!(w.v.status(&i3), Status::Valid, "the tip itself, named by the rotation");
}

/// Fable's T3: a verifier that can show an act invalid by any rule it can
/// apply does so, whatever else it cannot read.
#[test]
fn invalid_beats_unknown_t3() {
    let mut w = World::new();
    let mut p = w.operator("someone");
    let base = next(&mut p, text_spec(), 0, text("base"), None, None, "base");
    let ib = w.add(&base);
    // Signed under a scheme this client lacks: unknown, if nothing else fails.
    let sum = Mmr::from_ids(&[ib]).root();
    let ok = raw(&p, text_spec(), 0, text("fine"), Some(vec![ib]), Some(2), Some(sum), None, None, "ok", Some(unknown_scheme_signature()));
    let ok = w.add(&ok);
    assert_eq!(w.v.status(&ok), Status::Unknown);
    // The same, with two entries in prev, or a text act outside its format,
    // or a text act carrying acks: invalid, though the signature is unknown.
    let two = raw(&p, text_spec(), 0, text("two"), Some(vec![ib, ib]), Some(2), Some(sum), None, None, "two", Some(unknown_scheme_signature()));
    let notext = raw(&p, text_spec(), 0, vec![], Some(vec![ib]), Some(2), Some(sum), None, None, "notext", Some(unknown_scheme_signature()));
    let acked = raw(&p, text_spec(), 0, text("acks"), Some(vec![ib]), Some(2), Some(sum), None, Some(vec![ib]), "acked", Some(unknown_scheme_signature()));
    for a in [two, notext, acked] {
        let id = w.add(&a);
        assert_eq!(w.v.status(&id), Status::Invalid);
    }
    // An act of a specification this verifier does not implement, carrying
    // acks, where it does not know Money's and Agreements' hashes: unknown.
    let mut blind = mor_core::chain::Verifier::new(identity_spec());
    blind.add(w.v.get(&p.id).unwrap().act.clone()).unwrap();
    blind.add(base.clone()).unwrap();
    let cmip = raw(&p, sha256(b"a cMIP"), 0, vec![], Some(vec![ib]), Some(2), Some(sum), None, Some(vec![ib]), "cmip", None);
    let id = blind.add(cmip).unwrap();
    assert_eq!(blind.status(&id), Status::Unknown);
}

// ---------------------------------------------------------------- F297

/// Freeze suite v28, 5.7e: an objection signed with a stolen operator key
/// and witnessed by an accomplice, its signer's rotation disowning it: shown
/// as a dispute, it voids nothing, and the exit counts. Before the operator
/// rotates, it voids the homeless rotation (the stated cost, F328 Q2).
#[test]
fn an_objection_its_signer_disowned_voids_nothing_even_witnessed_5_7e() {
    let mut w = World::new();
    let mut old = w.operator("old-home");
    let mut new = w.operator("new-home");
    let mut a1 = w.operator("auditor");
    let mut accomplice = w.operator("accomplice");
    let audit = Audit { threshold: 1, auditors: vec![a1.id] };
    let j = w.genesis("journalist", vec![home(&old)], None, Some(audit));
    let (hr, _) = w.rotate(&j, Rot { homeless: true, homes: Some(vec![home(&new)]), audit: Some(None), ..Default::default() });
    w.receipt(&mut new, &j.id, &hr, 1);
    w.absent(&mut a1, &old.id, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id, hr], "the old home is gone by the auditor's statement");
    // A thief holding the old operator's signing key objects.
    let obj = w.object(&mut old, &j.id, &hr);
    assert_eq!(chain(&w, &j), vec![j.id], "before the operator rotates, the objection voids it: the stated cost");
    w.ack(&mut accomplice, obj);
    // The operator rotates and disowns it.
    w.rotate(&old, Rot { disowned: Some(vec![obj]), ..Default::default() });
    assert_eq!(w.v.status(&obj), Status::Disputed, "shown, as a dispute");
    assert_eq!(chain(&w, &j), vec![j.id, hr], "it voids nothing: the exit counts");
}

/// 5.7e: a cosignature of a forged log summary that the auditor's rotation
/// disowns protects no receipt.
#[test]
fn a_cosignature_its_signer_disowned_protects_no_receipt_5_7e() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let mut aud = w.operator("auditor");
    let mut friend = w.operator("friend");
    let audit = Audit { threshold: 1, auditors: vec![aud.id] };
    let j = w.genesis("journalist", vec![home(&h)], None, Some(audit));
    let (own, _) = w.rotate(&j, Rot::default());
    w.receipt(&mut h, &j.id, &own, 1);
    let s = w.log_summary(&mut h);
    let c = w.cosign(&mut aud, &s, &h.id);
    assert_eq!(chain(&w, &j), vec![j.id, own]);
    w.ack(&mut friend, c);
    w.rotate(&aud, Rot { disowned: Some(vec![c]), ..Default::default() });
    assert_eq!(w.v.status(&c), Status::Disputed);
    assert_eq!(chain(&w, &j), vec![j.id], "a disowned cosignature protects no receipt, acknowledged or not");
}

/// 5.7e: a witness act its signer's rotation disowned keeps no post
/// disputed: the post it named is void.
#[test]
fn a_witness_act_its_signer_disowned_keeps_nothing_disputed_5_7e() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let mut reader = w.operator("reader");
    let mut side = j.clone();
    side.seq.clear();
    let post = w.post(&mut side, "a thief's post under the journalist's stolen key");
    let wit = w.ack(&mut reader, post);
    let (r, _) = w.rotate(&j, Rot { kept: Some(vec![]), ..Default::default() });
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(w.v.status(&post), Status::Disputed, "relied on by a witness act");
    // The reader's key was stolen too: the reader's rotation disowns it.
    w.rotate(&reader, Rot { disowned: Some(vec![wit]), ..Default::default() });
    assert_eq!(w.v.status(&wit), Status::Void);
    assert_eq!(w.v.status(&post), Status::Void, "a disowned acknowledgement keeps nothing alive");
}

// ---------------------------------------------------------------- F298

/// Freeze suite v28, 5.5c: a reader holding the rotation and its kept tip
/// but not every act of the line: the first post is unknown, never void,
/// until the line arrives; then valid.
#[test]
fn a_kept_act_whose_line_is_not_held_is_unknown_5_5c() {
    let mut w = World::new();
    let mut h = w.operator("home");
    let j = w.genesis("journalist", vec![home(&h)], None, None);
    let mut jj = j.clone();
    let first = w.post(&mut jj, "the first post");
    let second = w.post(&mut jj, "the second");
    let third = w.post(&mut jj, "the third");
    // A second line the rotation does not name (rule 35).
    let mut other = j.clone();
    other.seq.clear();
    let stray = w.post(&mut other, "a line the rotation does not name");
    let (r, _) = w.rotate(&jj, Rot::default());
    w.receipt(&mut h, &j.id, &r, 1);
    assert_eq!(w.v.status(&first), Status::Valid);
    assert_eq!(w.v.status(&stray), Status::Void, "on no kept line, every line rebuilt");
    // A reader holding everything but the second post.
    let mut reader = mor_core::chain::Verifier::with_mirs(identity_spec(), money_spec(), agreements_spec());
    for (a, _) in &w.log {
        if a.id() != second {
            reader.add(a.clone()).unwrap();
        }
    }
    assert_eq!(reader.status(&first), Status::Unknown, "unknown, never void");
    assert_eq!(reader.status(&stray), Status::Unknown, "void needs the kept line rebuilt");
    assert_eq!(reader.status(&third), Status::Valid, "the tip, named by the rotation");
    reader.add(w.v.get(&second).unwrap().act.clone()).unwrap();
    assert_eq!(reader.status(&first), Status::Valid);
    assert_eq!(reader.status(&stray), Status::Void);
}

/// 5.5c: a scoped act whose installing act the reader has not held is
/// unknown, never invalid, and scoped once it arrives.
#[test]
fn a_scoped_act_whose_binding_is_not_held_is_unknown_5_5c() {
    let mut w = World::new();
    let mut col = w.operator("a collective");
    let grant = next(&mut col, agreements_spec(), 9, vec![], None, None, "a grant");
    let key = schnorr("the grantee's scoped key", 0);
    let mut scoped = col.clone();
    scoped.sign = key;
    scoped.binding = grant.id();
    let a = raw(&scoped, sha256(b"a cMIP"), 0, vec![], Some(vec![]), Some(1), Some(ZERO_HASH), None, None, "scoped", None);
    let id = w.add(&a);
    assert_eq!(w.v.status(&id), Status::Unknown, "its grant is not held");
    w.add(&grant);
    assert_eq!(w.v.status(&id), Status::Scoped);
}

/// Freeze suite v28, 8.4: an identity born under a signing scheme a client
/// lacks: its rotation the client can verify, and every act under it,
/// unknown, never invalid.
#[test]
fn an_identity_born_under_a_scheme_the_client_lacks_is_unknown_8_4() {
    let mut w = World::new();
    let template = w.operator("template");
    let sig = unknown_scheme_signature();
    let chain_key = slh("newcomer", 0, 3);
    let g = mor_core::identity::Payload::Genesis(mor_core::identity::Genesis {
        signing_key: mor_core::identity::SigningKey { scheme: sig.scheme.clone(), key: sig.key.clone() },
        chain_key: commit(&chain_key),
        homes: vec![own_home()],
        rule: None,
        declarations: None,
        audit: None,
    });
    let inside = Inside {
        spec: identity_spec(),
        type_: 0,
        prev: None,
        objects: None,
        payload: g.to_map(),
        position: None,
        summary: None,
        acks: None,
        refs: None,
        hint: None,
        salt: [5; 16],
    };
    let ga = act::make(&inside, &[1; 32], &[2; 24], &Addressing { signer: None, binding: None, public: true, to: None }, |_| sig.clone());
    let gid = w.add(&ga);
    assert_eq!(w.v.resolve(&gid).stop, Stop::Unknown);
    let p = Person { name: "newcomer".into(), id: gid, gen: 0, sign: template.sign.clone(), chain_key, binding: gid, position: 0, tip: gid, scheme: 3, seq: vec![], log: vec![], last_summary: None, cite: None };
    let (r, mut q) = w.rotate(&p, Rot::default());
    assert_eq!(w.v.status(&r), Status::Unknown, "a rotation the client can verify, of a chain it cannot resolve");
    let post = w.post(&mut q, "under the new key");
    assert_eq!(w.v.status(&post), Status::Unknown);
}

/// F298, "a chain it cannot resolve": an act bound to a rotation this
/// verifier holds, beyond a rotation it does not hold, is unknown; once the
/// missing rotation arrives, valid.
#[test]
fn an_act_bound_beyond_a_rotation_not_held_is_unknown() {
    let mut w = World::new();
    let p = w.operator("someone");
    let (r1a, q1) = w.rotation(&p, Rot::default());
    let (r2, mut q2) = w.rotate(&q1, Rot::default());
    let post = w.post(&mut q2, "after two rotations");
    assert_eq!(w.v.status(&r2), Status::Unknown, "built on a rotation not held");
    assert_eq!(w.v.status(&post), Status::Unknown);
    w.add(&r1a);
    assert_eq!(w.v.status(&r2), Status::Valid);
    assert_eq!(w.v.status(&post), Status::Valid);
}

// ---------------------------------------------------------------- F300

/// Freeze suite v28, 5.8b: a succession is followed only once the successor
/// confirms it, by a link confirmation or a witness act naming the rotation;
/// a stranger's rotation naming the journalist is shown as declared.
#[test]
fn a_succession_is_followed_only_once_confirmed_5_8b() {
    let mut w = World::new();
    let mut journalist = w.operator("journalist");
    let stranger = w.operator("stranger");
    let mor = |id: &Hash| Successor { protocol: "mor".into(), identifier: id.to_vec() };
    // A stranger declares the journalist its successor: never followed.
    let (sr, _) = w.rotate(&stranger, Rot { successor: Some(Some(mor(&journalist.id))), ..Default::default() });
    assert_eq!(w.v.succession(&stranger.id), SuccessionSeen::Declared { rotation: sr, successor: journalist.id });
    // The journalist declares an heir, who confirms by a link confirmation.
    let mut heir = w.operator("heir");
    let (jr, _) = w.rotate(&journalist, Rot { successor: Some(Some(mor(&heir.id))), ..Default::default() });
    assert_eq!(w.v.succession(&journalist.id), SuccessionSeen::Declared { rotation: jr, successor: heir.id });
    let conf = w.everyday_act(&mut heir, identity_spec(), mor_core::identity::types::LINK_CONFIRMATION, vec![], Some(vec![Object { chain: journalist.id, predecessor: jr }]), None);
    let conf = w.add(&conf);
    assert_eq!(w.v.status(&conf), Status::Valid);
    assert_eq!(w.v.succession(&journalist.id), SuccessionSeen::Confirmed { rotation: jr, successor: heir.id, confirmation: conf });
    // In a variant, by a witness act naming the rotation.
    let mut other = w.operator("another");
    let mut heir2 = w.operator("heir-2");
    let (or, _) = w.rotate(&other, Rot { successor: Some(Some(mor(&heir2.id))), ..Default::default() });
    let wit = w.ack(&mut heir2, or);
    assert_eq!(w.v.succession(&other.id), SuccessionSeen::Confirmed { rotation: or, successor: heir2.id, confirmation: wit });
    // A confirmation by someone else confirms nothing.
    let mut third = w.operator("third");
    let (tr, _) = w.rotate(&third.clone(), Rot { successor: Some(Some(mor(&heir.id))), ..Default::default() });
    w.ack(&mut other, tr);
    assert_eq!(w.v.succession(&third.id), SuccessionSeen::Declared { rotation: tr, successor: heir.id });
    let _ = (&mut journalist, &mut third);
}
