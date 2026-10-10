//! Collectives' split chain keys (Module, section 5; Agreements rule 36, F97).

mod common;

use common::*;
use mor_airgap::device::{self, DealPlan, Refusal, Signer};
use mor_airgap::msg::{Holder, Message, Role, Share};
use mor_airgap::online::{self, GenesisPlan};
use mor_airgap::seed::{Seed, SeedModule};
use mor_airgap::shares::{self, ShareError};
use mor_core::act::Act;
use mor_core::chain::Verifier;
use mor_core::hash::sha256;

fn member(n: &str) -> Holder {
    Holder {
        role: Role::Member,
        identity: Some(sha256(n.as_bytes())),
    }
}

/// Three members and an escrowed share, any three of four.
fn plan() -> DealPlan {
    DealPlan {
        seed_module: SeedModule::Words,
        scheme: 2,
        threshold: 3,
        holders: vec![
            member("ana"),
            member("ben"),
            member("chloe"),
            Holder {
                role: Role::Escrow,
                identity: Some(sha256(b"the abandonment authority")),
            },
        ],
    }
}

/// A collective at genesis: its first key dealt, the shares checked by
/// every holder and by a rebuild on a second device, and its genesis.
fn collective(rng: &mut TestRng) -> (Act, Vec<Share>) {
    let (export, dealt) = device::deal_genesis(&plan(), rng);
    for s in &dealt {
        shares::verify_share(s).unwrap();
        assert_eq!(s.dealing.fingerprint(), dealt[0].dealing.fingerprint());
    }
    // The rebuild check, with shares of members other than the dealer's.
    let Message::CommitmentExport(e) = &export else {
        unreachable!()
    };
    assert_eq!(
        shares::rebuild_check(&dealt[1..4]).unwrap(),
        e.chain_key.commit
    );
    let g = online::genesis(
        identity_spec(),
        &export.encode(),
        &signing("the collective", 0),
        GenesisPlan {
            homes: vec![own_home()],
            ..Default::default()
        },
        rng,
    )
    .unwrap();
    (g, dealt)
}

#[test]
fn a_collective_rotation_from_k_shares_with_the_next_shares_verifiably_dealt() {
    let mut rng = TestRng::new("collective");
    let (g, dealt) = collective(&mut rng);
    let mut v = Verifier::new(identity_spec());
    let id = v.add(g.clone()).unwrap();

    // Ana, Ben and Chloe bring their shares to one offline device.
    let dev = Signer::new(config());
    let mut r = Owner::new("unused", SeedModule::Words, 2).plan();
    r.prev = id;
    r.signing_key.key = signing("the collective", 1).public().to_vec();
    let p = online::pending(&identity_spec(), &g, &r, None, false);
    let rv = dev
        .review_collective(&p.encode(), &dealt[..3], &plan(), &mut rng)
        .unwrap();
    assert!(rv.summary.says("Share 1 used: member"));
    assert!(!rv.summary.says("RECOVERY PATH"));
    assert!(rv.summary.warns("dealing fingerprint"));
    assert!(rv.summary.warns("rebuild check"));
    let next = rv.new_shares.clone();
    assert_eq!(next.len(), 4);
    let mut dev = dev;
    let s = Message::SignedRotation(dev.sign(rv, false, &mut rng).unwrap().message);
    let acc = online::accept(&identity_spec(), &p.encode(), &s.encode()).unwrap();
    let a = rotation_act(&s);
    v.add(a.clone()).unwrap();
    assert_eq!(v.resolve(&id).latest().unwrap().0.act, a.id());

    // Every holder checks the new share alone; all see the same dealing,
    // which commits to the key the rotation committed to.
    for sh in &next {
        shares::verify_share(sh).unwrap();
        assert_eq!(sh.dealing.fingerprint(), next[0].dealing.fingerprint());
        assert_eq!(sh.dealing.chain_key, acc.rotation.chain_key);
    }
    // The rebuild check, by other members on a second device.
    assert_eq!(
        shares::rebuild_check(&next[1..]).unwrap(),
        acc.rotation.chain_key.commit
    );

    // Chloe has died: the next rotation uses the escrowed share, and the
    // device shows it went through the recovery path (5.2).
    let mut r2 = r.clone();
    r2.prev = a.id();
    r2.position = 2;
    r2.signing_key.key = signing("the collective", 2).public().to_vec();
    let p2 = online::pending(&identity_spec(), &a, &r2, None, false);
    let used = vec![next[0].clone(), next[1].clone(), next[3].clone()];
    let rv = dev
        .review_collective(&p2.encode(), &used, &plan(), &mut rng)
        .unwrap();
    assert!(rv.summary.warns("RECOVERY PATH: an escrowed share"));
    let s2 = Message::SignedRotation(dev.sign(rv, false, &mut rng).unwrap().message);
    let a2 = rotation_act(&s2);
    v.add(a2.clone()).unwrap();
    assert_eq!(v.resolve(&id).latest().unwrap().0.act, a2.id());
}

#[test]
fn a_dealer_who_deals_shares_of_another_seed_is_caught_by_the_rebuild_check() {
    // The attack section 5.1 guards against: the device commits to a key it
    // keeps, and hands the members shares of some other seed, so that only
    // it could rotate. Each share checks on its own (the polynomials are
    // consistent); the rebuild check does not.
    let mut rng = TestRng::new("dishonest dealer");
    let kept = shares::fresh_dealable_seed(SeedModule::Words, &mut rng);
    let decoy = shares::fresh_dealable_seed(SeedModule::Words, &mut rng);
    let mut dealt = shares::deal(&decoy, 2, 0, 3, plan().holders, &mut rng);
    let committed = kept.key(2, 0);
    for s in dealt.iter_mut() {
        s.dealing.chain_key.commit = committed.commitment();
    }
    for s in &dealt {
        shares::verify_share(s).unwrap();
    }
    assert_eq!(
        shares::rebuild_check(&dealt[..3]),
        Err(ShareError::WrongKey)
    );
    assert_eq!(
        shares::rebuild_check(&dealt[1..]),
        Err(ShareError::WrongKey)
    );
}

#[test]
fn a_tampered_share_fails_its_holders_own_check_and_the_rebuild() {
    let mut rng = TestRng::new("tampered share");
    let seed = shares::fresh_dealable_seed(SeedModule::Hex, &mut rng);
    let dealt = shares::deal(
        &seed,
        2,
        0,
        2,
        vec![member("a"), member("b"), member("c")],
        &mut rng,
    );
    let mut bad = dealt[1].clone();
    bad.value[31] ^= 1;
    assert_eq!(
        shares::verify_share(&bad),
        Err(ShareError::NotOnPolynomial { x: 2 })
    );
    assert!(shares::rebuild(&[dealt[0].clone(), bad]).is_err());
    // A share under a swapped number fails too.
    let mut moved = dealt[2].clone();
    moved.x = 1;
    assert!(shares::verify_share(&moved).is_err());
    // Too few, duplicates, and shares of two dealings are refused.
    assert!(matches!(
        shares::rebuild(&dealt[..1]),
        Err(ShareError::TooFew { .. })
    ));
    assert!(matches!(
        shares::rebuild(&[dealt[0].clone(), dealt[0].clone()]),
        Err(ShareError::Duplicate { .. })
    ));
    let other = shares::deal(
        &seed,
        2,
        0,
        2,
        vec![member("a"), member("b"), member("c")],
        &mut rng,
    );
    assert_eq!(
        shares::rebuild(&[dealt[0].clone(), other[1].clone()]),
        Err(ShareError::MixedDealings)
    );
}

#[test]
fn members_handed_different_dealings_see_different_fingerprints() {
    // Pedersen checks hold only if every member checks against the same
    // commitments: a dealer who gives one member a different dealing is
    // caught when the members compare fingerprints.
    let mut rng = TestRng::new("two dealings");
    let seed = shares::fresh_dealable_seed(SeedModule::Words, &mut rng);
    let a = shares::deal(&seed, 2, 0, 2, vec![member("a"), member("b")], &mut rng);
    let b = shares::deal(&seed, 2, 0, 2, vec![member("a"), member("b")], &mut rng);
    shares::verify_share(&a[0]).unwrap();
    shares::verify_share(&b[1]).unwrap();
    assert_ne!(a[0].dealing.fingerprint(), b[1].dealing.fingerprint());
}

#[test]
fn any_k_shares_rebuild_the_same_seed_and_fewer_reveal_nothing_checkable() {
    let mut rng = TestRng::new("any k");
    let seed = shares::fresh_dealable_seed(SeedModule::Words, &mut rng);
    let dealt = shares::deal(&seed, 3, 7, 3, plan().holders, &mut rng);
    for pick in [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3], [3, 1, 0]] {
        let chosen: Vec<Share> = pick.iter().map(|&i| dealt[i].clone()).collect();
        let (s, d) = shares::rebuild(&chosen).unwrap();
        assert_eq!(s, seed);
        assert_eq!(d.index, 7);
        assert_eq!(s.key(3, 7).commitment(), d.chain_key.commit);
    }
    assert!(matches!(
        shares::rebuild(&dealt[..2]),
        Err(ShareError::TooFew { have: 2, need: 3 })
    ));
}

#[test]
fn shares_that_do_not_match_the_previous_act_are_refused() {
    let mut rng = TestRng::new("wrong collective");
    let (g, _dealt) = collective(&mut rng);
    let (_, other) = collective(&mut rng);
    let dev = Signer::new(config());
    let mut r = Owner::new("unused 2", SeedModule::Words, 2).plan();
    r.prev = g.id();
    let p = online::pending(&identity_spec(), &g, &r, None, false);
    assert!(matches!(
        dev.review_collective(&p.encode(), &other[..3], &plan(), &mut rng),
        Err(Refusal::NoMatchingKey)
    ));
}

#[test]
fn a_seed_of_a_collective_is_an_ordinary_seed_once_rebuilt() {
    // The rebuilt seed restores like any seed of its Module (the escrow can
    // hold the words written down, if the grammar says so).
    let mut rng = TestRng::new("words");
    let seed = shares::fresh_dealable_seed(SeedModule::Words, &mut rng);
    assert_eq!(
        Seed::restore(SeedModule::Words, &seed.backup()).unwrap(),
        seed
    );
}
