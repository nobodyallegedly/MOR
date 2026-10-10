//! The management page's requests (roadmap step 11), over HTTP against real
//! relays and homes: pairing with a one-time code, signed requests and
//! everything they refuse, and each thing an operator does from the page.

mod common;

use common::*;
use ed25519_dalek::{Signer, SigningKey};
use mor_relay::client::ClientError;
use mor_relay::manage::{self, DOMAIN};
use mor_relay::operator::random;
use mor_relay::wire::{self, code, Bundle, Limits};
use mor_relay::{Policy, Role};
use serde_json::{json, Value};

/// A browser's management key, as the page holds it.
struct Browser {
    key: SigningKey,
    base: String,
    http: reqwest::Client,
}

struct Reply {
    status: u16,
    body: Value,
}

impl Reply {
    fn ok(self) -> Value {
        assert_eq!(self.status, 200, "{}", self.body);
        self.body["ok"].clone()
    }

    fn refused(&self, status: u16, words: &str) {
        assert_eq!(self.status, status, "{}", self.body);
        let e = self.body["error"].as_str().unwrap();
        assert!(e.contains(words), "{e}");
    }
}

impl Browser {
    fn new(r: &Running) -> Self {
        Browser {
            key: SigningKey::from_bytes(&random::<32>()),
            base: r.base.clone(),
            http: reqwest::Client::new(),
        }
    }

    async fn hello(&self) -> Value {
        let r = self
            .http
            .get(format!("{}/manage/hello", self.base))
            .send()
            .await
            .unwrap();
        serde_json::from_slice(&r.bytes().await.unwrap()).unwrap()
    }

    /// The exact bytes of a request for this relay, now.
    async fn body(&self, op: &str, args: Value) -> Vec<u8> {
        let hello = self.hello().await;
        json!({
            "relay": hello["relay"],
            "time": hello["time"],
            "nonce": wire::hex(&random::<32>())[..32],
            "op": op,
            "args": args,
        })
        .to_string()
        .into_bytes()
    }

    fn sign(&self, body: &[u8]) -> String {
        let mut m = DOMAIN.to_vec();
        m.extend_from_slice(body);
        hex(&self.key.sign(&m).to_bytes())
    }

    async fn send(&self, body: Vec<u8>, sig: String) -> Reply {
        let r = self
            .http
            .post(format!("{}/manage/api", self.base))
            .header("mor-key", hex(self.key.verifying_key().as_bytes()))
            .header("mor-signature", sig)
            .body(body)
            .send()
            .await
            .unwrap();
        let status = r.status().as_u16();
        Reply {
            status,
            body: serde_json::from_slice(&r.bytes().await.unwrap()).unwrap(),
        }
    }

    async fn ask(&self, op: &str, args: Value) -> Reply {
        let body = self.body(op, args).await;
        let sig = self.sign(&body);
        self.send(body, sig).await
    }

    async fn pair(&self, r: &Running) {
        let code = r.with_node(|n| manage::new_code(n)).unwrap();
        let reply = self
            .ask("pair", json!({ "code": code, "label": "the test browser" }))
            .await;
        assert_eq!(reply.ok(), json!({ "paired": true }));
    }
}

fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

/// The page is served by the relay itself, under a policy that lets it run
/// only its own script and talk only to this relay; the management routes
/// carry no CORS headers, unlike the protocol's.
#[tokio::test(flavor = "multi_thread")]
async fn the_page_is_served_by_the_relay_without_cors() {
    let r = Running::start(Role::Home, Policy::Open).await;
    let http = reqwest::Client::new();
    let page = http
        .get(format!("{}/manage/", r.base))
        .header("origin", "https://elsewhere.example")
        .send()
        .await
        .unwrap();
    assert_eq!(page.status(), 200);
    let h = page.headers();
    assert_eq!(
        h["content-security-policy"],
        manage::CONTENT_SECURITY_POLICY
    );
    assert!(h.get("access-control-allow-origin").is_none());
    for f in ["manage.js", "manage.css"] {
        let a = http
            .get(format!("{}/manage/{f}", r.base))
            .send()
            .await
            .unwrap();
        assert_eq!(a.status(), 200, "{f}");
    }
    let api = http
        .post(format!("{}/manage/api", r.base))
        .header("origin", "https://elsewhere.example")
        .body("{}")
        .send()
        .await
        .unwrap();
    assert_eq!(api.status(), 401);
    assert!(api.headers().get("access-control-allow-origin").is_none());
    let info = http
        .get(format!("{}/info", r.base))
        .header("origin", "https://elsewhere.example")
        .send()
        .await
        .unwrap();
    assert!(info.headers().get("access-control-allow-origin").is_some());
    // The bare path leads to the page.
    let bare = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .unwrap()
        .get(format!("{}/manage", r.base))
        .send()
        .await
        .unwrap();
    assert_eq!(bare.headers()["location"], "/manage/");
}

/// Pairing: only a code the relay gave, once, before it expires; a browser
/// not paired is refused everything else.
#[tokio::test(flavor = "multi_thread")]
async fn a_browser_pairs_once_with_a_code_the_relay_gave() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let b = Browser::new(&r);
    b.ask("status", json!({})).await.refused(401, "not paired");
    b.ask(
        "pair",
        json!({ "code": "00000-00000-00000-00000", "label": "x" }),
    )
    .await
    .refused(401, "not one this relay gave");
    let code = r.with_node(|n| manage::new_code(n)).unwrap();
    b.ask("pair", json!({ "code": code, "label": "" }))
        .await
        .refused(400, "give this browser a name");
    // Typed loosely: lower case, no dashes, O for 0 and I or L for 1.
    let loose: String = code
        .replace('-', "")
        .to_lowercase()
        .replace('0', "o")
        .replace('1', "l");
    b.ask("pair", json!({ "code": loose, "label": "Mac, Safari" }))
        .await
        .ok();
    let status = b.ask("status", json!({})).await.ok();
    assert_eq!(status["role"], "relay");
    // The code is spent.
    let other = Browser::new(&r);
    other
        .ask("pair", json!({ "code": code, "label": "a second browser" }))
        .await
        .refused(401, "used or has expired");
    // A paired browser can make a code for another device.
    let fresh = b.ask("code", json!({})).await.ok();
    other
        .ask("pair", json!({ "code": fresh["code"], "label": "phone" }))
        .await
        .ok();
    let managers = b.ask("managers", json!({})).await.ok();
    let labels: Vec<&str> = managers
        .as_array()
        .unwrap()
        .iter()
        .map(|m| m["label"].as_str().unwrap())
        .collect();
    assert_eq!(labels, vec!["Mac, Safari", "phone"]);
    assert_eq!(managers[0]["you"], true);
    // Unpairing the other browser shuts it out.
    b.ask("unpair", json!({ "key": managers[1]["key"] }))
        .await
        .ok();
    other
        .ask("status", json!({}))
        .await
        .refused(401, "not paired");
}

/// An expired code does not pair.
#[tokio::test(flavor = "multi_thread")]
async fn an_expired_code_does_not_pair() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let code = r.with_node(|n| manage::new_code(n)).unwrap();
    // Age the code by hand: the relay keeps it by its hash with an expiry.
    let db = rusqlite::Connection::open(r.dir.join("relay.db")).unwrap();
    db.execute("UPDATE pairing SET expires = 0", []).unwrap();
    Browser::new(&r)
        .ask("pair", json!({ "code": code, "label": "late" }))
        .await
        .refused(401, "expired");
}

/// Everything a signed request is checked for: the signature over the
/// exact body, the relay it was made for, the time, and a nonce used once.
#[tokio::test(flavor = "multi_thread")]
async fn a_request_is_signed_for_this_relay_now_and_once() {
    let r = Running::start(Role::Relay, Policy::Open).await;
    let other = Running::start(Role::Relay, Policy::Open).await;
    let b = Browser::new(&r);
    b.pair(&r).await;

    // Replayed: the same bytes again.
    let body = b.body("status", json!({})).await;
    let sig = b.sign(&body);
    b.send(body.clone(), sig.clone()).await.ok();
    b.send(body.clone(), sig.clone())
        .await
        .refused(401, "already answered");

    // Altered after signing.
    let mut altered = b.body("allow", json!({ "identity": hex(&[1; 32]) })).await;
    let sig = b.sign(&altered);
    let at = altered.iter().position(|&c| c == b'1').unwrap();
    altered[at] = b'2';
    b.send(altered, sig).await.refused(401, "signature");

    // Signed by another key than the one it names.
    let body = b.body("status", json!({})).await;
    let stranger = Browser::new(&r);
    let sig = stranger.sign(&body);
    b.send(body, sig).await.refused(401, "signature");

    // Made for another relay, then sent here.
    let there = Browser {
        key: b.key.clone(),
        base: other.base.clone(),
        http: reqwest::Client::new(),
    };
    let body = there.body("status", json!({})).await;
    let sig = b.sign(&body);
    b.send(body, sig).await.refused(401, "another relay");

    // Too old.
    let hello = b.hello().await;
    let body = json!({
        "relay": hello["relay"],
        "time": hello["time"].as_i64().unwrap() - 600,
        "nonce": "00112233445566778899aabbccddeeff",
        "op": "status",
        "args": {},
    })
    .to_string()
    .into_bytes();
    let sig = b.sign(&body);
    b.send(body, sig).await.refused(401, "five minutes");

    b.ask("launch", json!({}))
        .await
        .refused(400, "not a management request");
}

/// The allowlist, from the page: a home for listed identities only takes a
/// genesis once its operator lists the identity there.
#[tokio::test(flavor = "multi_thread")]
async fn the_operator_lists_an_identity_from_the_page() {
    let r = Running::start(Role::Home, Policy::Allowlist).await;
    let b = Browser::new(&r);
    b.pair(&r).await;
    let (g, alice) = genesis("alice", vec![r.home()], None, None);
    let e = match r.client.put_act(&g.encode()).await {
        Err(ClientError::Wire(e)) => e,
        other => panic!("{other:?}"),
    };
    assert_eq!(e.code, code::REFUSED);
    b.ask("allow", json!({ "identity": wire::hex(&alice.id) }))
        .await
        .ok();
    assert_eq!(
        b.ask("allowlist", json!({})).await.ok(),
        json!([wire::hex(&alice.id)])
    );
    assert!(r
        .client
        .put_act(&g.encode())
        .await
        .unwrap()
        .receipt
        .is_some());
    let ids = b.ask("identities", json!({})).await.ok();
    let alice_row = ids
        .as_array()
        .unwrap()
        .iter()
        .find(|i| i["identity"] == wire::hex(&alice.id))
        .unwrap();
    assert_eq!(alice_row["allowed"], true);
    assert_eq!(alice_row["chain"][0]["receipted"], true);
    b.ask("disallow", json!({ "identity": wire::hex(&alice.id) }))
        .await
        .ok();
    assert_eq!(b.ask("allowlist", json!({})).await.ok(), json!([]));
    let status = b.ask("status", json!({})).await.ok();
    assert_eq!(status["policy"], "allowlist");
    assert_eq!(status["served"], 2, "the operator and alice");
    assert_eq!(status["log"], 1);
    // The latest arrivals, newest first: alice's genesis, its receipt and
    // the summary after it, among them.
    let recent = b.ask("recent", json!({})).await.ok();
    let ids: Vec<&str> = recent
        .as_array()
        .unwrap()
        .iter()
        .map(|i| i["id"].as_str().unwrap())
        .collect();
    assert!(ids.contains(&wire::hex(&alice.id).as_str()));
    assert!(recent[0]["arrival"].as_u64() > recent[1]["arrival"].as_u64());
    assert_eq!(recent[0]["spec"], "identity");
}

/// Rotations awaiting approval (a strict identity, the registered-device
/// check simulated): the page lists what was refused, the operator approves
/// the owner's, and the owner's client sends it again. A rival rotation
/// sent by a thief is listed too, and is settled once the owner's is held.
#[tokio::test(flavor = "multi_thread")]
async fn the_operator_approves_a_waiting_rotation_from_the_page() {
    let r = Running::start(Role::Home, Policy::Open).await;
    let b = Browser::new(&r);
    b.pair(&r).await;
    let (g, alice) = genesis("alice", vec![r.home()], None, None);
    r.client.put_act(&g.encode()).await.unwrap();
    b.ask(
        "strict",
        json!({ "identity": wire::hex(&alice.id), "on": true }),
    )
    .await
    .ok();

    let (rot, _) = rotation(&alice, Rot::default());
    let (thief, _) = rotation(
        &alice,
        Rot {
            signing_key: Some(schnorr("thief", 0)),
            homes: Some(vec![Home {
                operator: None,
                hint: "https://thief.example".into(),
            }]),
            ..Default::default()
        },
    );
    for a in [&thief, &rot] {
        match r.client.put_act(&a.encode()).await {
            Err(ClientError::Wire(e)) => assert_eq!(e.code, code::REFUSED),
            other => panic!("{other:?}"),
        }
    }
    let status = b.ask("status", json!({})).await.ok();
    assert_eq!(status["pending"], 2);
    let pending = b.ask("pending", json!({})).await.ok();
    let list = pending.as_array().unwrap();
    assert_eq!(list.len(), 2);
    let thief_row = list
        .iter()
        .find(|p| p["rotation"] == wire::hex(&thief.id()))
        .unwrap();
    assert_eq!(thief_row["identity"], wire::hex(&alice.id));
    assert_eq!(thief_row["position"], 1);
    assert_eq!(thief_row["homes"][0]["hint"], "https://thief.example");

    b.ask("approve", json!({ "rotation": wire::hex(&rot.id()) }))
        .await
        .ok();
    let pending = b.ask("pending", json!({})).await.ok();
    let approved: Vec<bool> = pending
        .as_array()
        .unwrap()
        .iter()
        .map(|p| p["approved"].as_bool().unwrap())
        .collect();
    assert_eq!(approved.iter().filter(|a| **a).count(), 1);
    assert!(r
        .client
        .put_act(&rot.encode())
        .await
        .unwrap()
        .receipt
        .is_some());
    assert_eq!(b.ask("pending", json!({})).await.ok(), json!([]));

    // Strict off again: the next rotation needs no approval.
    b.ask(
        "strict",
        json!({ "identity": wire::hex(&alice.id), "on": false }),
    )
    .await
    .ok();
    let ids = b.ask("identities", json!({})).await.ok();
    let row = ids
        .as_array()
        .unwrap()
        .iter()
        .find(|i| i["identity"] == wire::hex(&alice.id))
        .unwrap();
    assert_eq!(row["strict"], false);
    assert_eq!(row["chain"].as_array().unwrap().len(), 2);
}

/// A limit on new identities (for the public homes, which every message
/// from the reader's page leaves a new identity at): past it, a genesis is
/// refused with "try later", while identities already served go on.
#[tokio::test(flavor = "multi_thread")]
async fn the_operator_limits_new_identities_from_the_page() {
    let r = Running::start(Role::Home, Policy::Open).await;
    let b = Browser::new(&r);
    b.pair(&r).await;
    b.ask("limit", json!({ "perDay": 2 })).await.ok();
    let mut people = vec![];
    for name in ["alice", "bob"] {
        let (g, p) = genesis(name, vec![r.home()], None, None);
        assert!(r
            .client
            .put_act(&g.encode())
            .await
            .unwrap()
            .receipt
            .is_some());
        people.push(p);
    }
    let (g, _) = genesis("carol", vec![r.home()], None, None);
    match r.client.put_act(&g.encode()).await {
        Err(ClientError::Wire(e)) => {
            assert_eq!(e.code, code::SLOW_DOWN);
            assert!(e.reason.unwrap().contains("at most 2 new identities"));
        }
        other => panic!("{other:?}"),
    }
    // Identities already served go on.
    let (rot, _) = rotation(&people[0], Rot::default());
    assert!(r
        .client
        .put_act(&rot.encode())
        .await
        .unwrap()
        .receipt
        .is_some());
    let status = b.ask("status", json!({})).await.ok();
    assert_eq!(status["newIdentityLimit"], 2);
    assert_eq!(status["newIdentitiesToday"], 2);
    b.ask("limit", json!({ "perDay": null })).await.ok();
    assert!(r
        .client
        .put_act(&g.encode())
        .await
        .unwrap()
        .receipt
        .is_some());
    assert_eq!(
        b.ask("status", json!({})).await.ok()["newIdentityLimit"],
        Value::Null
    );
}

/// The operator's rotation and the home's closure, from the page: typed
/// confirmation first; afterwards the home signs under the new key, and
/// once closed, it takes nothing new.
#[tokio::test(flavor = "multi_thread")]
async fn the_operator_rotates_and_closes_from_the_page() {
    let r = Running::start(Role::Home, Policy::Open).await;
    let b = Browser::new(&r);
    b.pair(&r).await;
    assert_eq!(
        b.ask("status", json!({})).await.ok()["holdsChainKey"],
        true
    );
    b.ask("rotate", json!({ "closure": false }))
        .await
        .refused(400, "type \"rotate\"");
    let rot = b
        .ask("rotate", json!({ "closure": false, "confirm": "rotate" }))
        .await
        .ok();
    let (g, _) = genesis("alice", vec![r.home()], None, None);
    let put = r.client.put_act(&g.encode()).await.unwrap();
    let rc = decode(put.receipt.as_ref().unwrap());
    assert_eq!(
        rc.outside.binding.map(|h| wire::hex(&h)),
        rot["rotation"].as_str().map(String::from),
        "the receipt is signed under the new key"
    );
    b.ask("rotate", json!({ "closure": true, "confirm": "rotate" }))
        .await
        .refused(400, "type \"close\"");
    b.ask("rotate", json!({ "closure": true, "confirm": "close" }))
        .await
        .ok();
    assert_eq!(b.ask("status", json!({})).await.ok()["closed"], true);
    let (g2, _) = genesis("bob", vec![r.home()], None, None);
    match r.client.put_act(&g2.encode()).await {
        Err(ClientError::Wire(e)) => assert_eq!(e.code, code::REFUSED),
        other => panic!("{other:?}"),
    }
}

/// An operator whose chain key is kept elsewhere rotates there, then gives
/// the home the rotation and the new key file through the page.
#[tokio::test(flavor = "multi_thread")]
async fn the_operator_hands_over_a_rotation_made_elsewhere() {
    use mor_relay::node::OperatorSetup;
    use mor_relay::operator::Keys;
    // An operator made elsewhere: its first key file and chain.
    let (g, op) = genesis(
        "operator",
        vec![Home {
            operator: None,
            hint: "https://elsewhere.example".into(),
        }],
        None,
        None,
    );
    let keys = Keys {
        identity: op.id,
        binding: op.id,
        signing_secret: mor_core::hash::sha256(b"operator/sign/0"),
        chain_key: None,
    };
    let r = Running::start_as(
        Role::Home,
        Policy::Open,
        Limits::default(),
        OperatorSetup::Existing {
            keys,
            chain: vec![g.encode()],
        },
    )
    .await;
    let b = Browser::new(&r);
    b.pair(&r).await;
    assert_eq!(
        b.ask("status", json!({})).await.ok()["holdsChainKey"],
        false
    );
    b.ask("rotate", json!({ "closure": false, "confirm": "rotate" }))
        .await
        .refused(409, "rotate where it is kept");
    // Where its chain key is kept, the operator rotates.
    let (rot, _) = rotation(&op, Rot::default());
    let new_keys = Keys {
        identity: op.id,
        binding: rot.id(),
        signing_secret: mor_core::hash::sha256(b"operator/sign/1"),
        chain_key: None,
    };
    let bundle = Bundle {
        acts: vec![rot.encode()],
        sealed: vec![],
        proofs: vec![],
    }
    .encode();
    // A key file that is not the rotation's is refused.
    let wrong = Keys {
        signing_secret: mor_core::hash::sha256(b"someone else"),
        ..new_keys.clone()
    };
    b.ask(
        "rotated",
        json!({ "rotation": hex(&bundle), "key": hex(&wrong.encode()) }),
    )
    .await
    .refused(409, "signing key");
    let held = b
        .ask(
            "rotated",
            json!({ "rotation": hex(&bundle), "key": hex(&new_keys.encode()) }),
        )
        .await
        .ok();
    assert_eq!(held["rotation"], wire::hex(&rot.id()));
    let (ga, _) = genesis("alice", vec![r.home()], None, None);
    let put = r.client.put_act(&ga.encode()).await.unwrap();
    assert_eq!(
        decode(put.receipt.as_ref().unwrap()).outside.binding,
        Some(rot.id())
    );
}
