//! Private links (Identity, "The envelope", rules 13, 23 and 24; F134,
//! F152, F159).
//!
//! A link's claim, confirmation and termination may be private; every other
//! Identity act is public. A private link act counts only if its sealed form
//! is published at the homes its signer's chain names at the act's binding;
//! a later move of homes does not void it. Found nowhere there, it is
//! unknown, never invalid. What a verifier found at those homes is its own
//! input: nothing binding rests on it alone (F159). Its content stays
//! private, its existence is public, so an owner whose stolen key confirmed
//! a link sees an act they did not write. A link's ending applies to every
//! act that holds the termination in its history.

mod common;

use common::{money_spec, home, identity_spec, agreements_spec, own_home, Rot, World};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::{LinkSeen, Status, Verifier};
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
/// are published, it does not count for the bank: unknown, never invalid
/// (F159). Found at the homes, it counts, and Ana's client can see an act
/// it did not write. All three are self-hosted: each one's home is operated
/// by the identity itself.
#[test]
fn a_private_link_counts_only_once_published_at_its_signers_homes() {
    let mut w = World::new();
    let mut thief = w.genesis("thief", vec![own_home()], None, None);
    let ana = w.genesis("ana", vec![own_home()], None, None);
    let bank = w.genesis("bank", vec![own_home()], None, None);
    let mut with_anas_key = ana.clone();
    let claim = w.private_act(&mut thief, identity_spec(), types::LINK_CLAIM, claim_payload(&ana.id), None, vec![bank.id]);
    let confirmation = w.private_act(&mut with_anas_key, identity_spec(), types::LINK_CONFIRMATION, vec![], naming(claim), vec![bank.id]);
    // Shown to the bank alone: unknown, so the link is unknown.
    assert_eq!(w.v.status(&claim), Status::Unknown);
    assert_eq!(w.v.status(&confirmation), Status::Unknown);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Unknown);
    // Found at the bank's own home, a stranger's to both: still unknown.
    w.v.found_at_home(claim, bank.id);
    w.v.found_at_home(confirmation, bank.id);
    assert_eq!(w.v.status(&claim), Status::Unknown);
    assert_eq!(w.v.status(&confirmation), Status::Unknown);
    // The claim found at the thief's home, the confirmation not at Ana's:
    // the confirmation cannot be told, so neither can the link.
    w.v.found_at_home(claim, thief.id);
    assert_eq!(w.v.status(&claim), Status::Valid);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Unknown);
    // Found where Ana's acts are published: it counts, and Ana's client,
    // reading her home, sees an act signed with her key.
    w.v.found_at_home(confirmation, ana.id);
    assert_eq!(w.v.status(&confirmation), Status::Valid);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Linked { confirmation });
}

/// F159: the homes that count are those the signer's chain names at the
/// link act's binding. Ana, at the home "old", makes a private claim, then
/// moves to the home "new" by a rotation the old home receipts. The claim,
/// bound to her genesis, counts when found at the old home, even after the
/// move; found only at the new home, or at a stranger's relay, it is
/// unknown. A claim she makes after the move, bound to the rotation, counts
/// at the new home and not at the old one.
#[test]
fn a_private_link_counts_at_the_homes_named_at_its_binding_and_survives_a_move() {
    let mut w = World::new();
    let mut old = w.operator("old-home");
    let new = w.operator("new-home");
    let stranger = w.operator("a stranger's relay");
    let mut ana = w.genesis("ana", vec![home(&old)], None, None);
    let ben = w.genesis("ben", vec![own_home()], None, None);
    let before = w.private_act(&mut ana, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, vec![ben.id]);
    let (r, mut ana1) = w.rotate(&ana, Rot { homes: Some(vec![home(&new)]), ..Default::default() });
    w.receipt(&mut old, &ana.id, &r, 1);
    assert_eq!(w.v.status(&r), Status::Valid, "the move counts");
    let after = w.private_act(&mut ana1, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, vec![ben.id]);
    // Found at the home the chain names later, or at a stranger's: unknown.
    w.v.found_at_home(before, new.id);
    w.v.found_at_home(before, stranger.id);
    assert_eq!(w.v.status(&before), Status::Unknown);
    // Found at the home named at its binding: it counts, after the move.
    w.v.found_at_home(before, old.id);
    assert_eq!(w.v.status(&before), Status::Valid);
    // The claim made after the move: the old home no longer counts for it.
    w.v.found_at_home(after, old.id);
    assert_eq!(w.v.status(&after), Status::Unknown);
    w.v.found_at_home(after, new.id);
    assert_eq!(w.v.status(&after), Status::Valid);
}

/// F159: a link act nobody fetched from its signer's homes is unknown,
/// never invalid, and so is the link it would make; a termination nobody
/// fetched that an act holds leaves the link unknown for that act, never
/// linked.
#[test]
fn a_private_link_nobody_fetched_is_unknown_never_invalid() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let c = w.everyday_act(&mut ana, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, None);
    let claim = w.add(&c);
    let confirmation = w.private_act(&mut ben, identity_spec(), types::LINK_CONFIRMATION, vec![], naming(claim), vec![ana.id]);
    assert_eq!(w.v.status(&confirmation), Status::Unknown);
    assert_eq!(w.v.binding_status(&confirmation), Status::Unknown);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Unknown);
    w.v.found_at_home(confirmation, ben.id);
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Linked { confirmation });
    // Ben ends it privately; the termination is not fetched. Ben's later
    // post holds it in its history: for it, the link cannot be told.
    let termination = w.private_act(&mut ben, identity_spec(), types::LINK_TERMINATION, vec![], naming(claim), vec![ana.id]);
    let later = w.post(&mut ben, "after the ending");
    assert_eq!(w.v.status(&termination), Status::Unknown);
    assert_eq!(w.v.link(&claim, &later), LinkSeen::Unknown);
    // An act that does not hold it still sees the link.
    assert_eq!(w.v.link(&claim, &claim), LinkSeen::Linked { confirmation });
    w.v.found_at_home(termination, ben.id);
    assert_eq!(w.v.link(&claim, &later), LinkSeen::Ended { confirmation, termination });
}

/// F159 with F153: what a verifier found at the homes is its own input. A
/// private link it found there is valid to it, but for anything binding the
/// answer rests on its fetch alone: unknown. Without the fetch, it and
/// another verifier holding the same acts agree. A public act of the same
/// signer does not rest on the fetch.
#[test]
fn a_found_private_link_binds_nothing_on_the_fetch_alone() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let ben = w.genesis("ben", vec![own_home()], None, None);
    let claim = w.private_act(&mut ana, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, vec![ben.id]);
    let post = w.post(&mut ana, "a public post");
    // Another verifier holding the same acts and content keys, no fetch.
    let mut other = Verifier::with_mips(identity_spec(), money_spec(), agreements_spec());
    for (a, k) in &w.log {
        other.add_with_key(a.clone(), k.as_ref()).unwrap();
    }
    assert_eq!(other.status(&claim), Status::Unknown);
    assert_eq!(w.v.status(&claim), other.status(&claim));
    // This verifier finds it at Ana's home: valid to it, unknown for
    // anything binding, since the answer rests on its fetch.
    w.v.found_at_home(claim, ana.id);
    assert_eq!(w.v.status(&claim), Status::Valid);
    assert!(w.v.rests_on_own_attempt(&claim));
    assert_eq!(w.v.binding_status(&claim), Status::Unknown);
    // Without the fetch, both verifiers agree.
    let without = w.v.without_own_attempts();
    assert_eq!(without.status(&claim), other.status(&claim));
    assert_eq!(without.binding_status(&claim), other.binding_status(&claim));
    assert_eq!(w.v.binding_status(&claim), other.binding_status(&claim));
    // A public act does not rest on the fetch.
    assert!(!w.v.rests_on_own_attempt(&post));
    assert_eq!(w.v.binding_status(&post), Status::Valid);
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
    w.v.found_at_home(name, ana.id);
    assert_eq!(w.v.status(&name), Status::Invalid);
    let witness = w.private_act(&mut ana, identity_spec(), types::WITNESS, vec![], None, vec![bob.id]);
    w.v.found_at_home(witness, ana.id);
    assert_eq!(w.v.status(&witness), Status::Invalid);
    // A private act of another specification is no Identity act: untouched.
    let mut carol = w.genesis("carol", vec![own_home()], None, None);
    let msg = w.private_act(&mut carol, common::money_spec(), 99, vec![], None, vec![bob.id]);
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
    // Ben ends it, privately, published at his home.
    let termination = w.private_act(&mut ben, identity_spec(), types::LINK_TERMINATION, vec![], naming(claim), vec![reader.id]);
    w.v.found_at_home(termination, ben.id);
    // An act that refers to the termination holds it: for it, ended.
    let a = w.everyday_act_refs(
        &mut reader,
        common::money_spec(),
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
    let a = w.everyday_act_refs(&mut eve, common::money_spec(), 99, vec![], None, None, Some(vec![Ref::Act([9; 32])]));
    let blind = w.add(&a);
    assert_eq!(w.v.link(&claim, &blind), LinkSeen::Unknown);
    // A termination by a third party ends nothing.
    let mut stranger = w.genesis("stranger", vec![own_home()], None, None);
    let t = w.everyday_act(&mut stranger, identity_spec(), types::LINK_TERMINATION, vec![], naming(claim), None);
    let fake = w.add(&t);
    assert_eq!(w.v.status(&fake), Status::Valid);
    assert_eq!(w.v.link(&claim, &fake), LinkSeen::Linked { confirmation });
}

/// F168 (B4): a scoped key never signs an Identity act (rule 1a), so a
/// private link act signed by one, a key whose binding is an act of a
/// higher MIP such as a grant, is invalid. Before, it showed as "scoped",
/// with no home requirement at all.
#[test]
fn a_private_link_signed_by_a_scoped_key_is_invalid() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let ben = w.genesis("ben", vec![own_home()], None, None);
    // An act of a higher MIP, standing for the grant that installs a key.
    let g = w.everyday_act(&mut ana, agreements_spec(), 9, vec![], None, None);
    let grant = w.add(&g);
    let mut scoped = ana.clone();
    scoped.binding = grant;
    scoped.seq.clear();
    let public = w.everyday_act(&mut scoped, money_spec(), 2, vec![], None, None);
    let public = w.add(&public);
    assert_eq!(w.v.status(&public), Status::Scoped, "a scoped key signs a higher MIP's act");
    let claim = w.private_act(&mut scoped, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, vec![ben.id]);
    w.v.found_at_home(claim, ana.id);
    assert_eq!(w.v.status(&claim), Status::Invalid);
}

/// F168 (B5): a private link act a rotation voids is void whether or not
/// it was fetched: the rotation is judged first. Before, a voided link
/// nobody fetched showed as unknown, the home check running first.
#[test]
fn a_private_link_a_rotation_voids_is_void_whether_or_not_fetched() {
    let mut w = World::new();
    let ana = w.genesis("ana", vec![own_home()], None, None);
    let ben = w.genesis("ben", vec![own_home()], None, None);
    let mut thief = ana.clone();
    let claim = w.private_act(&mut thief, identity_spec(), types::LINK_CLAIM, claim_payload(&ben.id), None, vec![ben.id]);
    assert_eq!(w.v.status(&claim), Status::Unknown, "nobody fetched it");
    let (_, _) = w.rotate(&ana, Rot { disowned: Some(vec![claim]), ..Default::default() });
    assert_eq!(w.v.status(&claim), Status::Void, "the rotation is judged first");
    w.v.found_at_home(claim, ana.id);
    assert_eq!(w.v.status(&claim), Status::Void);
}
