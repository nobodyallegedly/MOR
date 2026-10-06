//! Private links (Identity, "The envelope", rules 23 and 24; F134, F152).
//!
//! A link's claim, confirmation and termination may be private; every other
//! Identity act is public. A private link act counts only if its sealed form
//! is published where its signer's acts are published: its homes. Its
//! content stays private, its existence is public, so an owner whose stolen
//! key confirmed a link sees an act they did not write. A link's ending
//! applies to every act that holds the termination in its history.

mod common;

use common::{identity_spec, own_home, World};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::{LinkSeen, Status};
use mor_core::hash::Hash;
use mor_core::identity::types;

/// A link claim's payload naming the MOR identity `other` (protocol "mor").
fn claim_payload(other: &Hash) -> Vec<(Value, Value)> {
    vec![(
        Value::Uint(0),
        Value::Array(vec![Value::Text("mor".into()), Value::Bytes(other.to_vec())]),
    )]
}

fn naming(claim: Hash) -> Option<Vec<Object>> {
    Some(vec![Object { chain: claim, predecessor: claim }])
}

/// The review's story (finding 8): a thief holding Ana's signing key claims
/// a link from its own identity to Ana and confirms it with Ana's key, both
/// privately, and shows the pair to a bank only. Found nowhere Ana's acts
/// are published, it is invalid to the bank. Published at the homes, it
/// counts, and Ana's client can see an act it did not write.
#[test]
fn a_private_link_counts_only_once_published_at_its_signers_homes() {
    let mut w = World::new();
    let mut thief = w.genesis("thief", vec![own_home()], None, None);
    let ana = w.genesis("ana", vec![own_home()], None, None);
    let bank = w.genesis("bank", vec![own_home()], None, None);
    let mut with_anas_key = ana.clone();
    let claim = w.private_act(&mut thief, identity_spec(), types::LINK_CLAIM, claim_payload(&ana.id), None, vec![bank.id]);
    let confirmation = w.private_act(&mut with_anas_key, identity_spec(), types::LINK_CONFIRMATION, vec![], naming(claim), vec![bank.id]);
    // Shown to the bank alone: invalid, so no link.
    assert_eq!(w.v.status(&claim), Status::Invalid);
    assert_eq!(w.v.status(&confirmation), Status::Invalid);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::NotLinked);
    // The claim published at the thief's homes, the confirmation not at
    // Ana's: still no link.
    w.v.published_at_home(claim);
    assert_eq!(w.v.status(&claim), Status::Valid);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::NotLinked);
    // Published where Ana's acts are published: it counts, and Ana's
    // client, reading her homes, sees an act signed with her key.
    w.v.published_at_home(confirmation);
    assert_eq!(w.v.status(&confirmation), Status::Valid);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Linked { confirmation });
}

/// Only key holders can tell a private act's type: a verifier that opens a
/// private Identity act of any other type than 6 to 8 refuses it, published
/// or not (F134, F152).
#[test]
fn a_private_identity_act_other_than_a_link_is_refused() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let bob = w.genesis("bob", vec![own_home()], None, None);
    let post = w.post(&mut ana, "a post");
    let name = w.private_act(
        &mut ana,
        identity_spec(),
        types::NAME,
        vec![(Value::Uint(0), Value::Text("ana".into())), (Value::Uint(1), Value::Bytes(vec![7; 32]))],
        None,
        vec![bob.id],
    );
    w.v.published_at_home(name);
    assert_eq!(w.v.status(&name), Status::Invalid);
    let witness = w.private_act(&mut ana, identity_spec(), types::WITNESS, vec![], None, vec![bob.id]);
    w.v.published_at_home(witness);
    assert_eq!(w.v.status(&witness), Status::Invalid);
    // A private act of another specification is no Identity act: untouched.
    let mut carol = w.genesis("carol", vec![own_home()], None, None);
    let msg = w.private_act(&mut carol, common::finance_spec(), 99, vec![], None, vec![bob.id]);
    assert_ne!(w.v.status(&msg), Status::Invalid);
    assert_eq!(w.v.status(&post), Status::Valid);
}

/// Rule 24 (F152): either side ends a link alone, and the ending applies to
/// every act that holds the termination in its history; an act that does
/// not hold it still sees the link; one whose history this verifier cannot
/// follow sees neither for sure.
#[test]
fn a_links_ending_applies_to_every_act_holding_the_termination() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut reader = w.genesis("a reader", vec![own_home()], None, None);
    let c = w.everyday_act(&mut ana, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, None);
    let claim = w.add(&c);
    // A claim without a confirmation is no link (rule 23).
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::NotLinked);
    let k = w.everyday_act(&mut ben, identity_spec(), types::LINK_CONFIRMATION, vec![], naming(claim), None);
    let confirmation = w.add(&k);
    let before = w.post(&mut reader, "Ana and Ben are one");
    // Ben ends it, privately, published at his homes.
    let termination = w.private_act(&mut ben, identity_spec(), types::LINK_TERMINATION, vec![], naming(claim), vec![reader.id]);
    w.v.published_at_home(termination);
    // An act that refers to the termination holds it: for it, ended.
    let a = w.everyday_act_refs(
        &mut reader,
        common::finance_spec(),
        99,
        vec![],
        None,
        None,
        Some(vec![Ref::Act(termination)]),
    );
    let after = w.add(&a);
    // So does one that only follows it in the reader's sequence (prev).
    let later = w.post(&mut reader, "a later post");
    assert_eq!(w.v.link(&claim, &after), LinkSeen::Ended { confirmation, termination });
    assert_eq!(w.v.link(&claim, &later), LinkSeen::Ended { confirmation, termination });
    assert_eq!(w.v.link(&claim, &termination), LinkSeen::Ended { confirmation, termination });
    // An act that does not hold it: the link stands for it.
    let mut dan = w.genesis("dan", vec![own_home()], None, None);
    let elsewhere = w.post(&mut dan, "unaware");
    assert_eq!(w.v.link(&claim, &elsewhere), LinkSeen::Linked { confirmation });
    assert_eq!(w.v.link(&claim, &before), LinkSeen::Linked { confirmation });
    // An act citing one this verifier does not hold: cannot be told.
    let mut eve = w.genesis("eve", vec![own_home()], None, None);
    let a = w.everyday_act_refs(&mut eve, common::finance_spec(), 99, vec![], None, None, Some(vec![Ref::Act([9; 32])]));
    let blind = w.add(&a);
    assert_eq!(w.v.link(&claim, &blind), LinkSeen::Unknown);
    // A termination by a third party ends nothing.
    let mut stranger = w.genesis("stranger", vec![own_home()], None, None);
    let t = w.everyday_act(&mut stranger, identity_spec(), types::LINK_TERMINATION, vec![], naming(claim), None);
    let fake = w.add(&t);
    assert_eq!(w.v.status(&fake), Status::Valid);
    assert_eq!(w.v.link(&claim, &fake), LinkSeen::Linked { confirmation });
}
