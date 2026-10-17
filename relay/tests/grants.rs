//! Acts signed under a grant (relay transport cMIP draft 5, F346): where an
//! act's binding names a grant, a relay holding the grant checks the
//! signature against the key the grant bound and stores the act as scoped;
//! the grantor's homes accept it on the same terms. Whether the grant backs
//! the act is never judged here: Agreements', at every verifier.

mod common;

use common::*;
use mor_core::act::{Act, Object};
use mor_core::agreements::Grant;
use mor_core::hash::{sha256, Hash};
use mor_core::identity::SigningKey;
use mor_core::sig;
use mor_relay::client::ClientError;
use mor_relay::wire::code;
use mor_relay::{Policy, Role};

fn wire_err<T: std::fmt::Debug>(r: Result<T, ClientError>) -> mor_relay::wire::WireError {
    match r {
        Err(ClientError::Wire(e)) => e,
        other => panic!("expected an error of the cMIP, got {other:?}"),
    }
}

/// A grant of `grantor` to `grantee`, its key `key` (field 9); `by_this`: a
/// collective's founding grant (field 8), signed by a founder.
fn grant(grantor: &mut Person, grantee: Hash, key: &mor_core::sig::SchnorrKey, by_this: bool) -> Act {
    let g = Grant {
        grantee,
        scope: 2,
        agreements: None,
        this_agreement: false,
        limits: None,
        limits_cmip: None,
        area: None,
        kinds: None,
        reinstates: None,
        by_this,
        key: SigningKey { scheme: sig::SCHNORR, key: key.public().to_vec() },
    };
    everyday(grantor, specs().agreements, 9, g.to_map(), None, None, true)
}

/// The grantee's strand: acts in the grantor's name, bound to the grant,
/// signed with `key`, citing `[grantor, grant]` (Text rule 14, F343).
fn strand(grantor: &Person, grant: Hash, key: mor_core::sig::SchnorrKey) -> Person {
    let mut p = grantor.clone();
    p.binding = grant;
    p.sign = key;
    p.seq = vec![];
    p
}

fn under(p: &mut Person, grantor: Hash, grant: Hash, text: &str) -> Act {
    everyday(
        p,
        text_spec(),
        0,
        vec![(mor_core::cbor::Value::Uint(0), mor_core::cbor::Value::Text(text.into()))],
        Some(vec![Object { chain: grantor, predecessor: grant }]),
        None,
        true,
    )
}

/// An agent's act under its owner's grant: stored by a relay holding the
/// grant, and by the owner's home; signed with another key, refused.
#[tokio::test(flavor = "multi_thread")]
async fn an_agents_act_under_a_persons_grant_is_stored_by_relays_and_the_grantors_homes() {
    let home = Running::start(Role::Home, Policy::Open).await;
    let relay = Running::start(Role::Relay, Policy::Open).await;
    let (og, mut owner) = genesis("owner", vec![home.home()], None, None);
    let (ag, agent) = genesis("agent", vec![home.home()], None, None);
    for r in [&home, &relay] {
        r.client.put_act(&og.encode()).await.unwrap();
        r.client.put_act(&ag.encode()).await.unwrap();
    }
    let key = schnorr("agent's grant key", 0);
    let g = grant(&mut owner, agent.id, &key, false);
    for r in [&home, &relay] {
        r.client.put_act(&g.encode()).await.unwrap();
    }
    let mut s = strand(&owner, g.id(), key);
    let post = under(&mut s, owner.id, g.id(), "Posted for my owner, under the grant.");
    relay.client.put_act(&post.encode()).await.expect("a relay holding the grant stores it");
    home.client.put_act(&post.encode()).await.expect("the grantor's home accepts it");
    assert!(relay.client.get_act(&post.id()).await.is_ok());
    assert!(home.client.get_act(&post.id()).await.is_ok());
    // Bound to the grant, signed with another key (the owner's own): refused.
    let mut forged = strand(&owner, g.id(), schnorr("owner", 0));
    let bad = under(&mut forged, owner.id, g.id(), "Not the grant's key.");
    for r in [&home, &relay] {
        let e = wire_err(r.client.put_act(&bad.encode()).await);
        assert_eq!(e.code, code::INVALID);
        assert!(e.reason.as_deref().unwrap_or("").contains("not the key its grant bound"), "{:?}", e.reason);
    }
    // A grant of someone else, named by an act in the owner's name: refused.
    let (sg, mut stranger) = genesis("stranger", vec![home.home()], None, None);
    relay.client.put_act(&sg.encode()).await.unwrap();
    let k2 = schnorr("stranger's grant key", 0);
    let g2 = grant(&mut stranger, agent.id, &k2, false);
    relay.client.put_act(&g2.encode()).await.unwrap();
    let mut s2 = strand(&owner, g2.id(), k2);
    let other = under(&mut s2, owner.id, g2.id(), "Under a grant the owner never made.");
    let e = wire_err(relay.client.put_act(&other.encode()).await);
    assert!(e.reason.as_deref().unwrap_or("").contains("not the signer's"), "{:?}", e.reason);
}

/// A split service's act under a collective's grant, and under a grant its
/// founding terms carry (field 8, signed by a founder): both stored by a
/// relay and by the collective's home.
#[tokio::test(flavor = "multi_thread")]
async fn a_split_services_act_under_a_collectives_grant_is_stored() {
    let home = Running::start(Role::Home, Policy::Open).await;
    let relay = Running::start(Role::Relay, Policy::Open).await;
    let (cg, mut collective) = genesis("collective", vec![home.home()], None, None);
    let (fg, mut founder) = genesis("founder", vec![home.home()], None, None);
    let (sg, service) = genesis("split service", vec![home.home()], None, None);
    for r in [&home, &relay] {
        for a in [&cg, &fg, &sg] {
            r.client.put_act(&a.encode()).await.unwrap();
        }
    }
    let key = schnorr("service's grant key", 0);
    let g = grant(&mut collective, service.id, &key, false);
    let kf = schnorr("service's founding grant key", 0);
    let founding = grant(&mut founder, service.id, &kf, true);
    for r in [&home, &relay] {
        r.client.put_act(&g.encode()).await.unwrap();
        r.client.put_act(&founding.encode()).await.unwrap();
    }
    let mut s = strand(&collective, g.id(), key);
    let receipt = under(&mut s, collective.id, g.id(), "A receipt, as far as relays care.");
    let mut sf = strand(&collective, founding.id(), kf);
    let early = under(&mut sf, collective.id, founding.id(), "Under the founding grant.");
    for r in [&relay, &home] {
        r.client.put_act(&receipt.encode()).await.expect("stored under the collective's grant");
        r.client.put_act(&early.encode()).await.expect("stored under the founding grant, its key checked");
    }
}

/// The grantor's home that does not hold the grant asks for it first, as
/// for missing chain acts; once sent, the act is stored.
#[tokio::test(flavor = "multi_thread")]
async fn a_home_asks_for_the_grant_first() {
    let home = Running::start(Role::Home, Policy::Open).await;
    let (og, mut owner) = genesis("owner", vec![home.home()], None, None);
    home.client.put_act(&og.encode()).await.unwrap();
    let key = schnorr("a grant key", 0);
    let g = grant(&mut owner, sha256(b"an agent"), &key, false);
    let mut s = strand(&owner, g.id(), key);
    let post = under(&mut s, owner.id, g.id(), "Before the grant arrived.");
    let e = wire_err(home.client.put_act(&post.encode()).await);
    assert_eq!(e.code, code::MISSING_PREDECESSOR);
    assert!(e.reason.as_deref().unwrap_or("").contains("or the grant"), "{:?}", e.reason);
    home.client.put_act(&g.encode()).await.unwrap();
    home.client.put_act(&post.encode()).await.expect("stored once the grant is held");
}
