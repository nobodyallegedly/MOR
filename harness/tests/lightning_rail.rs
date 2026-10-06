//! Roadmap step 12, end to end on regtest: a test identity pays another
//! over Lightning, and both hold a verified receipt and claim; a payment
//! above the vault's limit goes to the vault, or, where the vault offers no
//! rail the payer has, is refused; a payment in a unit the vault does not
//! cover is refused; each refusal is sent to the payee's inbox as an
//! ordinary message (Finance rule 14b, F111).
//!
//! It needs the regtest network of `modules/lightning/regtest/up.sh`:
//!
//!   MOR_LN_REGTEST=RUN_DIR cargo test -p mor-harness --test lightning_rail -- --nocapture
//!
//! Without `MOR_LN_REGTEST` it says so and passes without running.
//! Test identities and regtest coins only.

use mor_core::act::{Act, Inside, Scheme};
use mor_core::identity::SigningKey;
use mor_core::sig::SchnorrKey;
use mor_core::chain::Status;
use mor_core::envelope::{self, DecKey, EncryptionKey, Recipient, Routes, SealRandom, Sealed};
use mor_core::finance::{Anonymous, Payer, 
    self, choose, Amount, Choice, Claim, PayeePointer, Payload, Rail, Receipt, VaultEntry,
};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::Payload as Id;
use mor_harness::net::{Http, Site};
use mor_harness::person::Person;
use mor_harness::reader::Reader;
use mor_lightning::bolt11::{self, Network};
use mor_lightning::lnd::Lnd;
use mor_lightning::{unit, Lightning, LnAddress, LnProof};
use mor_payment::{verify, Answer, Commitment, Held, Modules, PaidTo, Proof, RailInput, Record};
use mor_relay::client::FeedQuery;
use mor_relay::operator::random;
use mor_relay::store::Filter;
use mor_relay::{Policy, Role, Specs};
use std::path::Path;

fn finance() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
}

fn text_spec() -> Hash {
    sha256(b"a text specification")
}

/// The on-chain rail Module of step 12a, not yet written: a vault entry on
/// it is one this payer's wallet cannot pay.
fn onchain_module() -> Hash {
    sha256(b"on-chain rail Module, draft 1, test value until publication")
}

fn regtest_sat(n: u64) -> Amount {
    Amount {
        unit: unit(Network::Regtest),
        value: n,
    }
}

fn short(h: &Hash) -> String {
    h[..4].iter().map(|b| format!("{b:02x}")).collect()
}

// ---------------------------------------------------------------- the people

/// An identity, its decryption key, and the nodes it runs.
struct Party {
    p: Person,
    dk: DecKey,
    /// What it has picked up from its inbox, read with the core.
    rd: Reader,
}

async fn put(site: &Site, a: &Act) {
    site.client
        .put_act(&a.encode())
        .await
        .unwrap_or_else(|e| panic!("the relay refused an act: {e:?}"));
}

impl Party {
    async fn born(
        site: &Site,
        seed: &[u8; 32],
        name: &str,
        vault: Option<Vec<VaultEntry>>,
    ) -> Party {
        let decl = vault.map(|v| vec![finance::vault_declaration(&finance(), &v)]);
        let (g, mut p) = Person::genesis_declaring(seed, name, vec![site.home()], None, None, decl);
        put(site, &g).await;
        let dk = DecKey::from_secret(random::<32>());
        let routes = p.routes(1, None, &site.base);
        let key = p.encryption_key(1, None, &dk);
        put(site, &routes).await;
        put(site, &key).await;
        Party {
            p,
            dk,
            rd: Reader::new(Http::new(None)),
        }
    }

    /// Sign and publish a Finance act.
    fn finance_act(&mut self, payload: &Payload, to: Option<Hash>) -> Act {
        self.p.act(
            finance(),
            payload.type_(),
            payload.to_map(),
            None,
            to.map(|t| vec![t]),
        )
    }

    /// Pick up and open what reached this identity's inbox; returns the
    /// inner acts, now held by its reader.
    async fn pick_up(&mut self, site: &Site) -> Vec<(Hash, Inside)> {
        let page = site
            .client
            .feed(&FeedQuery {
                filter: Filter {
                    to: Some(self.p.id),
                    ..Default::default()
                },
                ..Default::default()
            })
            .await
            .expect("the feed");
        let mut out = vec![];
        for item in page.items {
            let Ok(s) = Sealed::decode(&item.item) else {
                continue;
            };
            let Ok(o) = envelope::open(&s, Some(&self.p.id), &self.dk) else {
                continue;
            };
            let id = o.act.id();
            if self.rd.v.get(&id).is_none() {
                let _ = self.rd.v.add_with_key(o.act.clone(), o.key.as_ref());
                out.push((id, o.inside));
            }
        }
        out
    }
}

/// Seal an act to an identity's current encryption key and deliver it to
/// the inbox route it declared.
async fn deliver(to: &PayeeView, a: &Act, key: &[u8; 32]) {
    let (inbox, ek) = (&to.inbox, &to.ek);
    let to = &to.id;
    let one_time_secret = loop {
        let s = random::<32>();
        if mor_core::sig::SchnorrKey::from_secret(&s).is_some() {
            break s;
        }
    };
    let rnd = SealRandom {
        container_key: random::<32>(),
        nonce: random::<24>(),
        eseeds: vec![random::<64>()],
        one_time_secret,
        aux: random::<32>(),
    };
    let s = envelope::seal(
        a,
        Some(key),
        &[Recipient::Identity {
            id: *to,
            key: ek.clone(),
        }],
        &rnd,
    )
    .expect("a sealed container");
    mor_relay::client::Client::new(inbox)
        .put_sealed(&s.encode(), &[])
        .await
        .expect("the inbox takes it");
}

// ---------------------------------------------------------------- what a payer reads

/// The payee as the payer's wallet reads it from the relay, with the core:
/// its pointer in force, its vault in force, its inbox and encryption key.
struct PayeeView {
    id: Hash,
    pointer: Option<(Hash, PayeePointer)>,
    vault: Option<(Hash, Vec<VaultEntry>)>,
    inbox: String,
    ek: envelope::EncKey,
}

/// What a reader holds, as the payment cMIP asks for it: only acts that
/// count on their signer's chain.
struct View<'a>(&'a Reader);

impl Held for View<'_> {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        let h = self.0.v.get(id)?;
        if self.0.status(id) != Status::Valid || h.inside.spec != finance() {
            return None;
        }
        let p = Payload::decode(h.inside.type_, &h.inside.payload).ok()?;
        finance::check_signer(&p, h.act.outside.signer.as_ref()?).ok()?;
        match p {
            Payload::PayeePointer(p) => Some(p),
            _ => None,
        }
    }

    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        let h = self.0.v.get(id)?;
        if self.0.status(id) != Status::Valid {
            return None;
        }
        let (who, decls) = match h.identity.as_ref()?.as_ref().ok()? {
            Id::Genesis(g) => (*id, g.declarations.clone()?),
            Id::Rotation(r) => (*h.act.outside.signer.as_ref()?, r.declarations.clone()?),
            _ => return None,
        };
        let v = finance::vault_in(&finance(), &decls).ok()??;
        Some((who, v?))
    }

    fn obligation(&self, id: &Hash) -> Option<mor_payment::HeldObligation> {
        let h = self.0.v.get(id)?;
        if self.0.status(id) != Status::Valid || h.inside.spec != finance() {
            return None;
        }
        let p = Payload::decode(h.inside.type_, &h.inside.payload).ok()?;
        finance::check_signer(&p, h.act.outside.signer.as_ref()?).ok()?;
        match p {
            Payload::Obligation(o) => Some(mor_payment::HeldObligation {
                pointer_cited: finance::pointer_cited(&self.0.v, &o),
                obligation: o,
            }),
            _ => None,
        }
    }
}

async fn read_payee(rd: &mut Reader, site: &Site, id: &Hash) -> PayeeView {
    rd.follow(id, &[site.base.clone()]).await;
    for a in site.client.acts_by(id).await.expect("the payee's acts") {
        rd.add(&a);
    }
    let counts = |h: &Hash| rd.status(h) == Status::Valid;
    let (mut pointers, mut routes, mut keys) = (vec![], vec![], vec![]);
    let mut vault = None;
    for h in rd.v.signed_by(id).chain(rd.v.get(id)) {
        if !counts(&h.id) {
            continue;
        }
        let i = &h.inside;
        if i.spec == finance() && i.type_ == finance::types::PAYEE_POINTER {
            if let Ok(Payload::PayeePointer(p)) = Payload::decode(i.type_, &i.payload) {
                pointers.push((h.id, p));
            }
        } else if i.spec == Specs::test().identity && i.type_ == 3 {
            if let Ok(r) = Routes::decode(&i.payload) {
                routes.push((h.id, r));
            }
        } else if i.spec == Specs::test().envelope && i.type_ == 4 {
            if let Ok(k) = EncryptionKey::decode(&i.payload) {
                keys.push((h.id, k));
            }
        }
        // The vault in force: the latest chain act that declared one. These
        // identities never rotate in this test, so it is the genesis.
        if let Some(v) = View(rd).vault(&h.id) {
            vault = Some((h.id, v.1));
        }
    }
    let latest = finance::latest_pointer(&pointers);
    let pointer = pointers.into_iter().find(|(i, _)| Some(*i) == latest.act);
    let r = envelope::latest(
        &routes
            .iter()
            .map(|(i, r)| (*i, r.version))
            .collect::<Vec<_>>(),
    );
    let k = envelope::latest(
        &keys
            .iter()
            .map(|(i, k)| (*i, k.version))
            .collect::<Vec<_>>(),
    );
    let route = routes
        .iter()
        .find(|(i, _)| Some(*i) == r.act)
        .expect("an inbox route");
    let key = keys
        .iter()
        .find(|(i, _)| Some(*i) == k.act)
        .expect("an encryption key");
    PayeeView {
        id: *id,
        pointer,
        vault,
        inbox: route.1.inbox(&text_spec()).expect("an inbox").hints[0].clone(),
        ek: key.1.key.clone(),
    }
}

// ---------------------------------------------------------------- the payee's invoice endpoint

/// The payee's software: it issues an invoice on its own node, committing to
/// a payment it recognises as its own, and nothing else.
struct Endpoint<'a> {
    payee: Hash,
    /// Its pointer and vault acts, and the node behind each address.
    pointer: Hash,
    vault: Option<Hash>,
    nodes: Vec<([u8; 33], &'a Lnd)>,
}

impl Endpoint<'_> {
    async fn invoice(&self, c: &Commitment, address: &[u8]) -> Result<(String, &Lnd), String> {
        if c.payee != self.payee || c.rail != mor_lightning::spec() {
            return Err("not a payment to this payee on Lightning".into());
        }
        match c.paid_to {
            PaidTo::Flow { pointer, .. } if pointer == self.pointer => {}
            PaidTo::Vault { declared_by, .. } if Some(declared_by) == self.vault => {}
            _ => return Err("not one of this payee's own pointers or vaults".into()),
        }
        let a = LnAddress::decode(address).ok_or("not a Lightning address")?;
        let (_, lnd) = self
            .nodes
            .iter()
            .find(|(k, _)| *k == a.node)
            .ok_or("not one of this payee's nodes")?;
        let (inv, _) = lnd.add_invoice(c.amount.value, &c.hash()).await?;
        Ok((inv, *lnd))
    }
}

// ---------------------------------------------------------------- the payer's wallet

#[derive(Debug)]
enum Outcome {
    Paid {
        receipt: Act,
        claim: Act,
        commitment: Hash,
        invoice: String,
    },
    Refused(finance::Undeliverable),
}

struct Payment<'a> {
    payer: &'a mut Party,
    payee: &'a mut Party,
    payer_node: &'a Lnd,
    site: &'a Site,
    endpoint: &'a Endpoint<'a>,
    /// An anonymous payer's one-time key, committed as payer (F113).
    anonymous: Option<&'a SchnorrKey>,
}

/// A one-time key in Identity's signing-key form (F113).
fn bare(k: &SchnorrKey) -> SigningKey {
    SigningKey {
        scheme: Scheme::Founding(1),
        key: k.public().to_vec(),
    }
}

impl Payment<'_> {
    /// Who the payment commits to as payer: the payer's identity, or its
    /// one-time key when it pays anonymously (F113).
    fn payer_in_commitment(&self) -> Payer {
        match self.anonymous {
            Some(k) => Payer::Key(bare(k)),
            None => Payer::Identity(self.payer.p.id),
        }
    }

    async fn pay(&mut self, view: &PayeeView, amount: Amount, fulfils: Hash) -> Outcome {
        let ln = Lightning;
        // The payer's node is on regtest: it can pay a Lightning rail on
        // regtest, in regtest satoshis, and nothing else.
        let can_pay = |m: &Hash, a: &[u8], u: &Hash| {
            m == &mor_lightning::spec()
                && mor_payment::RailModule::unit(&ln, a) == Some(*u)
                && *u == unit(Network::Regtest)
        };
        let choice = choose(
            view.pointer.as_ref().map(|(_, p)| p),
            view.vault.as_ref().map(|(_, v)| v.as_slice()),
            &amount,
            can_pay,
        );
        let (paid_to, address) = match choice {
            Choice::Flow(i) => {
                let (id, p) = view.pointer.as_ref().unwrap();
                (
                    PaidTo::Flow {
                        pointer: *id,
                        rail: i as u64,
                    },
                    p.rails[i].address.clone(),
                )
            }
            Choice::Vault(i) => {
                let (id, v) = view.vault.as_ref().unwrap();
                (
                    PaidTo::Vault {
                        declared_by: *id,
                        entry: i as u64,
                    },
                    v[i].source.clone(),
                )
            }
            Choice::Undeliverable(why) => {
                // Rule 14b (F111): the refusing wallet tells the payee.
                let text = format!(
                    "A payment to you was not sent. {} tried to pay you {} in unit {} for act {}, and its wallet refused: {}. The debt stays open (Finance rule 16): it can be paid once you can receive it, for this unit by adding it to your vault in a rotation.",
                    short(&self.payer.p.id),
                    amount.value,
                    short(&amount.unit),
                    short(&fulfils),
                    why
                );
                let (msg, key) = self.payer.p.message(view.id, &text);
                put(self.site, &msg).await;
                deliver(view, &msg, &key).await;
                return Outcome::Refused(why);
            }
        };
        let c = Commitment {
            rail: mor_lightning::spec(),
            payee: view.id,
            amount,
            fulfils,
            payer: Some(self.payer_in_commitment()),
            paid_to,
            salt: random::<16>(),
            purchase: None,
        };
        let (invoice, payee_node) = self
            .endpoint
            .invoice(&c, &address)
            .await
            .expect("an invoice");
        // Before paying: the invoice is signed by the node the payee
        // declared and commits to exactly this payment (pending: unpaid).
        let before = Lightning::rule(&RailInput {
            commitment: c.hash(),
            amount: &amount,
            address: &address,
            rail_proof: &LnProof {
                invoice: invoice.clone(),
                preimage: None,
            }
            .encode(),
        });
        assert!(
            matches!(before, Answer::Pending(_)),
            "the invoice checks out before paying: {before:?}"
        );
        let preimage = self
            .payer_node
            .pay(&invoice)
            .await
            .expect("the payment goes through");
        let proof = |pre: [u8; 32]| {
            Proof {
                paid_to,
                salt: c.salt,
                rail: LnProof {
                    invoice: invoice.clone(),
                    preimage: Some(pre),
                }
                .encode(),
            }
            .encode()
        };
        // The payer's claim, delivered to the payee.
        let claim = Payload::Claim(Claim {
            rail: mor_lightning::spec(),
            proof: proof(preimage),
            payee: view.id,
            amount,
            fulfils,
            disagrees: None,
            referral: None,
            refund: self.anonymous.map(|_| Rail {
                module: mor_lightning::spec(),
                address: b"where the anonymous payer wants a refund".to_vec(),
            }),
            anonymous: None,
            purchase: None,
        });
        // F113: an anonymous payer's key signs its claim.
        let claim = match (claim, self.anonymous) {
            (Payload::Claim(mut cl), Some(k)) => {
                cl.anonymous = Some(Anonymous {
                    key: bare(k),
                    sig: k.sign(&cl.anonymous_message(), &[0; 32]).sig,
                });
                Payload::Claim(cl)
            }
            (cl, _) => cl,
        };
        let claim_act = self.payer.finance_act(&claim, Some(view.id));
        deliver(view, &claim_act, &key_of(&claim_act, &self.payer.p)).await;
        // The payee sees its invoice settled, and signs the receipt.
        let inv = bolt11::decode(&invoice).unwrap();
        let settled = payee_node
            .settled(&inv.payment_hash)
            .await
            .expect("the payee's node answers")
            .expect("settled");
        let receipt = Payload::Receipt(Receipt {
            rail: mor_lightning::spec(),
            proof: proof(settled),
            payer: Some(self.payer_in_commitment()),
            payee: view.id,
            amount,
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let receipt_act = self.payee.finance_act(&receipt, Some(self.payer.p.id));
        let payer_view = read_payee(
            &mut Reader::new(Http::new(None)),
            self.site,
            &self.payer.p.id,
        )
        .await;
        deliver(
            &payer_view,
            &receipt_act,
            &key_of(&receipt_act, &self.payee.p),
        )
        .await;
        Outcome::Paid {
            receipt: receipt_act,
            claim: claim_act,
            commitment: c.hash(),
            invoice,
        }
    }
}

/// The content key of an act this person just signed: private acts in this
/// test are made with keys the person keeps.
fn key_of(a: &Act, p: &Person) -> [u8; 32] {
    p.key_of(&a.id()).expect("the signer kept the content key")
}

/// Verify a receipt or claim the party holds, with the core and the cMIP.
fn check(party: &Party, act: &Hash) -> (Answer, Option<Hash>) {
    let h = party.rd.v.get(act).expect("held");
    let signer = h.act.outside.signer.expect("signed by an identity");
    let p = Payload::decode(h.inside.type_, &h.inside.payload).expect("a Finance act");
    finance::check_signer(&p, &signer).expect("signed by the right party");
    let ln = Lightning;
    let m = Modules::new().adopt(&ln);
    let v = match &p {
        Payload::Receipt(r) => verify(Record::Receipt(r), &View(&party.rd), &m),
        Payload::Claim(c) => verify(Record::Claim(c, signer), &View(&party.rd), &m),
        _ => panic!("not a receipt or claim"),
    };
    (v.answer, v.trusted)
}

fn regtest() -> Option<String> {
    std::env::var("MOR_LN_REGTEST").ok()
}

#[tokio::test(flavor = "multi_thread")]
async fn a_test_identity_pays_another_over_lightning() {
    let Some(dir) = regtest() else {
        eprintln!("MOR_LN_REGTEST is not set: the regtest Lightning test did not run (see modules/lightning/regtest/up.sh)");
        return;
    };
    let dir = Path::new(&dir);
    let node = |n: &str, port: u16| {
        Lnd::from_dir(&format!("https://127.0.0.1:{port}"), &dir.join(n)).expect("an lnd node")
    };
    let (alice_ln, bob_ln, carol_ln) = (
        node("alice", 18080),
        node("bob", 18081),
        node("carol", 18082),
    );
    let (bob_key, carol_key) = (
        bob_ln.node_key().await.unwrap(),
        carol_ln.node_key().await.unwrap(),
    );

    let http = Http::new(None);
    let site = Site::start("lightning", "home", Role::Home, Policy::Open, &http).await;
    let seed = random::<32>();
    let addr = |node: [u8; 33], network: Network| {
        LnAddress {
            network,
            node,
            endpoint: Some("in-process, for this test".into()),
        }
        .encode()
    };

    // Alice pays. Bob receives: his flow on his own node; his vault, for
    // regtest satoshis above 10,000, on a second node (carol), declared in
    // his genesis under the safety key.
    let mut alice = Party::born(&site, &seed, "alice", None).await;
    let bob_vault = vec![VaultEntry {
        unit: unit(Network::Regtest),
        rail_module: mor_lightning::spec(),
        source: addr(carol_key, Network::Regtest),
        limit: 10_000,
    }];
    let mut bob = Party::born(&site, &seed, "bob", Some(bob_vault)).await;
    // His flow pointer lists his node twice: on regtest, and on signet, a
    // unit his vault does not cover.
    let pointer = Payload::PayeePointer(PayeePointer {
        payee: bob.p.id,
        version: 1,
        previous: None,
        rails: vec![
            Rail {
                module: mor_lightning::spec(),
                address: addr(bob_key, Network::Regtest),
            },
            Rail {
                module: mor_lightning::spec(),
                address: addr(bob_key, Network::Signet),
            },
        ],
    });
    let pointer_act = bob.finance_act(&pointer, None);
    put(&site, &pointer_act).await;
    // Dana's vault holds regtest satoshis above 1,000 only on-chain, a rail
    // Alice's wallet does not have.
    let mut dana = Party::born(
        &site,
        &seed,
        "dana",
        Some(vec![VaultEntry {
            unit: unit(Network::Regtest),
            rail_module: onchain_module(),
            source: b"a descriptor, for the on-chain Module of step 12a".to_vec(),
            limit: 1_000,
        }]),
    )
    .await;
    let dana_pointer = dana.finance_act(
        &Payload::PayeePointer(PayeePointer {
            payee: dana.p.id,
            version: 1,
            previous: None,
            rails: vec![Rail {
                module: mor_lightning::spec(),
                address: addr(carol_key, Network::Regtest),
            }],
        }),
        None,
    );
    put(&site, &dana_pointer).await;

    let bob_genesis = bob.p.id;
    let endpoint = Endpoint {
        payee: bob.p.id,
        pointer: pointer_act.id(),
        vault: Some(bob_genesis),
        nodes: vec![(bob_key, &bob_ln), (carol_key, &carol_ln)],
    };
    let dana_endpoint = Endpoint {
        payee: dana.p.id,
        pointer: dana_pointer.id(),
        vault: Some(dana.p.id),
        nodes: vec![],
    };
    // Alice's wallet reads both payees from the relay.
    let mut alice_rd = Reader::new(Http::new(None));
    let bob_view = read_payee(&mut alice_rd, &site, &bob.p.id).await;
    let dana_view = read_payee(&mut alice_rd, &site, &dana.p.id).await;
    assert_eq!(
        bob_view.pointer.as_ref().map(|p| p.0),
        Some(pointer_act.id())
    );
    assert_eq!(bob_view.vault.as_ref().map(|v| v.0), Some(bob_genesis));

    // 1. A tip of 1,234 regtest satoshis to Bob's flow pointer.
    let tip = Payment {
        payer: &mut alice,
        payee: &mut bob,
        payer_node: &alice_ln,
        site: &site,
        endpoint: &endpoint,
        anonymous: None,
    }
    .pay(&bob_view, regtest_sat(1_234), pointer_act.id())
    .await;
    let Outcome::Paid {
        receipt,
        claim,
        commitment,
        invoice,
    } = tip
    else {
        panic!("the tip was refused: {tip:?}")
    };
    // lnd's own reading of the invoice agrees with ours.
    let d = bob_ln.decode(&invoice).await.unwrap();
    let hex = |b: &[u8]| b.iter().map(|x| format!("{x:02x}")).collect::<String>();
    assert_eq!(d["destination"].as_str(), Some(hex(&bob_key).as_str()));
    assert_eq!(d["num_msat"].as_str(), Some("1234000"));
    assert_eq!(
        d["description_hash"].as_str(),
        Some(hex(&commitment).as_str())
    );
    // Both hold both, delivered through their inboxes, and both verify.
    for party in [&mut alice, &mut bob] {
        let got = party.pick_up(&site).await;
        let ids: Vec<Hash> = got.iter().map(|g| g.0).collect();
        let other_side = if ids.contains(&receipt.id()) {
            receipt.id()
        } else {
            claim.id()
        };
        assert!(ids.contains(&other_side));
        // Each also holds its own act, as signed.
        let own = if other_side == receipt.id() {
            &claim
        } else {
            &receipt
        };
        party
            .rd
            .v
            .add_with_key(own.clone(), Some(&party.p.key_of(&own.id()).unwrap()))
            .unwrap();
        // And what the verifier needs: the payee's pointer and genesis.
        read_payee(&mut party.rd, &site, &bob_genesis).await;
        for act in [receipt.id(), claim.id()] {
            let (a, trusted) = check(party, &act);
            assert_eq!(
                a,
                Answer::Valid,
                "{} verifies {}",
                party.p.name,
                short(&act)
            );
            assert_eq!(trusted, None, "Lightning relies on no trusted party");
        }
        eprintln!(
            "{} holds a valid receipt {} and a valid claim {}",
            party.p.name,
            short(&receipt.id()),
            short(&claim.id())
        );
    }

    // 2. 50,000 regtest satoshis: above the vault's limit, so to the vault,
    // under its entry, on the vault's own node.
    let big = Payment {
        payer: &mut alice,
        payee: &mut bob,
        payer_node: &alice_ln,
        site: &site,
        endpoint: &endpoint,
        anonymous: None,
    }
    .pay(&bob_view, regtest_sat(50_000), pointer_act.id())
    .await;
    let Outcome::Paid {
        receipt,
        claim,
        invoice,
        ..
    } = big
    else {
        panic!("the vault payment was refused: {big:?}")
    };
    assert_eq!(
        bolt11::decode(&invoice).unwrap().node,
        carol_key,
        "paid to the vault's node"
    );
    bob.pick_up(&site).await;
    bob.rd
        .v
        .add_with_key(receipt.clone(), Some(&bob.p.key_of(&receipt.id()).unwrap()))
        .unwrap();
    for act in [receipt.id(), claim.id()] {
        assert_eq!(check(&bob, &act).0, Answer::Valid);
    }
    let Payload::Receipt(r) =
        Payload::decode(2, &bob.rd.v.get(&receipt.id()).unwrap().inside.payload).unwrap()
    else {
        panic!()
    };
    assert!(matches!(
        Proof::decode(&r.proof).unwrap().paid_to,
        PaidTo::Vault { .. }
    ));
    eprintln!("50,000 above the limit of 10,000 went to Bob's vault node, verified");
    // The same amount presented as paid to the flow would not have
    // followed the published vault: not protected by good faith (rule 15).
    assert!(!finance::flow_followed_vault(
        bob_view.vault.as_ref().map(|v| v.1.as_slice()),
        &regtest_sat(50_000)
    ));

    // 3. 500 signet satoshis to Bob: a unit his vault does not cover.
    let before = bob.rd.v.signed_by(&alice.p.id).count();
    let signet = Amount {
        unit: unit(Network::Signet),
        value: 500,
    };
    let out = Payment {
        payer: &mut alice,
        payee: &mut bob,
        payer_node: &alice_ln,
        site: &site,
        endpoint: &endpoint,
        anonymous: None,
    }
    .pay(&bob_view, signet, pointer_act.id())
    .await;
    assert!(
        matches!(
            out,
            Outcome::Refused(finance::Undeliverable::UnitNotCovered)
        ),
        "{out:?}"
    );
    let notices = bob.pick_up(&site).await;
    let text = notices
        .iter()
        .find_map(|(_, i)| match i.payload.first() {
            Some((_, mor_core::cbor::Value::Text(t))) if i.spec == text_spec() => Some(t.clone()),
            _ => None,
        })
        .expect("Bob was told");
    assert!(
        text.contains("500") && text.contains("vault has no entry for this unit"),
        "{text}"
    );
    assert_eq!(
        bob.rd.v.signed_by(&alice.p.id).count(),
        before + 1,
        "a message, and no claim"
    );
    eprintln!("refused, and Bob was told: {text}");

    // 4. 20,000 regtest satoshis to Dana: above her limit, and her vault is
    // only on a rail Alice's wallet does not have.
    let out = Payment {
        payer: &mut alice,
        payee: &mut dana,
        payer_node: &alice_ln,
        site: &site,
        endpoint: &dana_endpoint,
        anonymous: None,
    }
    .pay(&dana_view, regtest_sat(20_000), dana_pointer.id())
    .await;
    assert!(
        matches!(out, Outcome::Refused(finance::Undeliverable::NoSharedRail)),
        "{out:?}"
    );
    let notices = dana.pick_up(&site).await;
    assert!(
        notices.iter().any(|(_, i)| i.spec == text_spec()),
        "Dana was told"
    );
    eprintln!("20,000 to Dana refused (her vault is on-chain only), and Dana was told");

    // 5. F113: an anonymous tip of 777 to Bob's flow. Alice commits a
    // one-time key of its own as payer; the claim, signed with it, counts,
    // and names where a refund should go. Bob's node learnt the preimage
    // when it was paid, as every node on a route would: a claim he makes as
    // payer, from the same proof, is invalid.
    let one_time = SchnorrKey::from_secret(&random::<32>()).unwrap();
    let anon = Payment {
        payer: &mut alice,
        payee: &mut bob,
        payer_node: &alice_ln,
        site: &site,
        endpoint: &endpoint,
        anonymous: Some(&one_time),
    }
    .pay(&bob_view, regtest_sat(777), pointer_act.id())
    .await;
    let Outcome::Paid { receipt, claim, .. } = anon else {
        panic!("the anonymous tip was refused: {anon:?}")
    };
    bob.pick_up(&site).await;
    bob.rd
        .v
        .add_with_key(receipt.clone(), Some(&bob.p.key_of(&receipt.id()).unwrap()))
        .unwrap();
    for act in [receipt.id(), claim.id()] {
        assert_eq!(check(&bob, &act).0, Answer::Valid, "{}", short(&act));
    }
    let Payload::Claim(alices) =
        Payload::decode(3, &bob.rd.v.get(&claim.id()).unwrap().inside.payload).unwrap()
    else {
        panic!()
    };
    assert_eq!(alices.payer(&alice.p.id), Payer::Key(bare(&one_time)));
    // Bob, holding the preimage, claims the payment (and its refund) as his.
    let mut bobs = alices.clone();
    bobs.anonymous = None;
    bobs.refund = Some(Rail {
        module: mor_lightning::spec(),
        address: b"Bob's own address".to_vec(),
    });
    let forged = bob.finance_act(&Payload::Claim(bobs), None);
    bob.rd
        .v
        .add_with_key(forged.clone(), Some(&bob.p.key_of(&forged.id()).unwrap()))
        .unwrap();
    assert!(matches!(check(&bob, &forged.id()).0, Answer::Invalid(_)));
    eprintln!("an anonymous tip of 777: the claim signed with the committed key counts; the payee holding the preimage cannot claim it");
}
