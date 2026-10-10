//! Roadmap step 12a, end to end on regtest: a test identity pays another
//! on-chain, by pay-to-contract, and both hold a verified receipt and claim,
//! shown pending until six confirmations; a payment above the vault's limit
//! goes to the vault's address; a payment to an address not tweaked by the
//! commitment is refused, by the payer's wallet before paying and by the
//! rule after; and a chain reorganisation takes back a payment both sides
//! had already recorded as valid, which the records cannot show (question 1
//! of `docs/onchain-rail-step-12a.md`).
//!
//! It starts two btcd nodes on regtest itself, from the btcd release in
//! `MOR_BTCD` (a directory holding `btcd`):
//!
//!   MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test onchain_rail -- --nocapture
//!
//! Without `MOR_BTCD` it says so and passes without running. Test
//! identities and regtest coins only.

use bitcoin::hashes::Hash as _;
use bitcoin::key::{Keypair, TapTweak};
use bitcoin::secp256k1::{Message, Secp256k1, SecretKey};
use bitcoin::sighash::{EcdsaSighashType, Prevouts, SighashCache, TapSighashType};
use bitcoin::taproot::TapNodeHash;
use bitcoin::{absolute, consensus, transaction, Address, CompressedPublicKey, OutPoint, ScriptBuf, Sequence, Transaction, TxIn, TxOut, Txid, Witness};
use mor_core::act::{Act, Inside};
use mor_core::chain::Status;
use mor_core::envelopes::{self, DecKey, EncryptionKey, Recipient, Routes, SealRandom, Sealed};
use mor_core::money::{self, choose, Amount, Choice, Citations, Claim, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::Payload as Id;
use mor_harness::net::{Http, Site};
use mor_harness::person::Person;
use mor_harness::reader::Reader;
use mor_onchain::btcd::{Btcd, Node};
use mor_onchain::chain::HeaderChain;
use mor_onchain::{unit, Network, Onchain, OnchainAddress, OnchainProof, CONFIRMATIONS};
use mor_payment::{beside, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, RailInput, RailModule, Record};
use mor_relay::client::FeedQuery;
use mor_relay::operator::random;
use mor_relay::store::Filter;
use mor_relay::{Policy, Role, Specs};
use std::path::PathBuf;

fn money() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
}

fn text_spec() -> Hash {
    sha256(b"a text specification")
}

fn sat(n: u64) -> Amount {
    Amount { unit: unit(Network::Regtest), value: n }
}

fn short(h: &Hash) -> String {
    h[..4].iter().map(|b| format!("{b:02x}")).collect()
}

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn secret(label: &str) -> SecretKey {
    SecretKey::from_slice(&h(label)).unwrap()
}

fn xonly(sk: &SecretKey) -> [u8; 32] {
    Keypair::from_secret_key(&Secp256k1::new(), sk).x_only_public_key().0.serialize()
}

// ---------------------------------------------------------------- the people

/// An identity, its decryption key, and what it picked up.
struct Party {
    p: Person,
    dk: DecKey,
    rd: Reader,
}

async fn put(site: &Site, a: &Act) {
    site.client.put_act(&a.encode()).await.unwrap_or_else(|e| panic!("the relay refused an act: {e:?}"));
}

impl Party {
    async fn born(site: &Site, seed: &[u8; 32], name: &str, vault: Option<Vec<VaultEntry>>) -> Party {
        let decl = vault.map(|v| vec![money::vault_declaration(&money(), &v)]);
        let (g, mut p) = Person::genesis_declaring(seed, name, vec![site.home()], None, None, decl);
        put(site, &g).await;
        let dk = DecKey::from_secret(random::<32>());
        let routes = p.routes(1, None, &site.base);
        let key = p.encryption_key(1, None, &dk);
        put(site, &routes).await;
        put(site, &key).await;
        Party { p, dk, rd: Reader::new(Http::new(None)) }
    }

    fn money_act(&mut self, payload: &Payload, to: Option<Hash>) -> Act {
        self.p.act(money(), payload.type_(), payload.to_map(), None, to.map(|t| vec![t]))
    }

    /// Pick up and open what reached this identity's inbox.
    async fn pick_up(&mut self, site: &Site) -> Vec<(Hash, Inside)> {
        let page = site
            .client
            .feed(&FeedQuery { filter: Filter { to: Some(self.p.id), ..Default::default() }, ..Default::default() })
            .await
            .expect("the feed");
        let mut out = vec![];
        for item in page.items {
            let Ok(s) = Sealed::decode(&item.item) else { continue };
            let Ok(o) = envelopes::open(&s, Some(&self.p.id), &self.dk) else { continue };
            let id = o.act.id();
            if self.rd.v.get(&id).is_none() {
                let _ = self.rd.v.add_with_key(o.act.clone(), o.key.as_ref());
                out.push((id, o.inside));
            }
        }
        out
    }

    /// Hold an act this party signed itself.
    fn keep(&mut self, a: &Act) {
        let k = self.p.key_of(&a.id()).expect("the signer kept the content key");
        self.rd.v.add_with_key(a.clone(), Some(&k)).unwrap();
    }
}

/// Seal an act to an identity's encryption key and deliver it to its inbox.
async fn deliver(to: &PayeeView, a: &Act, key: &[u8; 32]) {
    let one_time_secret = loop {
        let s = random::<32>();
        if mor_core::sig::SchnorrKey::from_secret(&s).is_some() {
            break s;
        }
    };
    let rnd = SealRandom { container_key: random::<32>(), nonce: random::<24>(), eseeds: vec![random::<64>()], one_time_secret, aux: random::<32>() };
    let s = envelopes::seal(a, Some(key), &[Recipient::Identity { id: to.id, key: to.ek.clone() }], &rnd).expect("a sealed container");
    mor_relay::client::Client::new(&to.inbox).put_sealed(&s.encode(), &[]).await.expect("the inbox takes it");
}

// ---------------------------------------------------------------- what a payer reads

struct PayeeView {
    id: Hash,
    pointer: Option<(Hash, PayeePointer)>,
    vault: Option<(Hash, Vec<VaultEntry>)>,
    inbox: String,
    ek: envelopes::EncKey,
}

/// What a reader holds, as the payment cMIP asks for it (as in the
/// Lightning rail's test): a Money-only wallet.
struct View<'a>(&'a Reader);

impl Held for View<'_> {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        let h = self.0.v.get(id)?;
        if self.0.v.binding_status(id) != Status::Valid || h.inside.spec != money() {
            return None;
        }
        let p = Payload::decode(h.inside.type_, &h.inside.payload).ok()?;
        money::check_signer(&p, h.act.outside.signer.as_ref()?, &Citations::of(&h.inside)).ok()?;
        match p {
            Payload::PayeePointer(p) => Some(p),
            _ => None,
        }
    }
    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        let h = self.0.v.get(id)?;
        if self.0.v.binding_status(id) != Status::Valid {
            return None;
        }
        let (who, decls) = match h.identity.as_ref()?.as_ref().ok()? {
            Id::Genesis(g) => (*id, g.declarations.clone()?),
            Id::Rotation(r) => (*h.act.outside.signer.as_ref()?, r.declarations.clone()?),
            _ => return None,
        };
        let v = money::vault_in(&money(), &decls).ok()??;
        Some((who, v?))
    }
    fn obligation(&self, _: &Hash) -> Option<money::Obligation> {
        None
    }
    fn holding(&self, _: &Hash, _: &Hash) -> Option<money::Holding> {
        None
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        self.0
            .v
            .signed_by(payee)
            .filter(|h| h.inside.spec == money() && h.inside.type_ == money::types::PAYEE_POINTER)
            .filter_map(|h| Some((h.id, self.pointer(&h.id)?)))
            .filter(|(_, p)| &p.payee == payee)
            .collect()
    }
    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>> {
        let res = self.0.v.resolve(payee);
        let mut out = None;
        for st in &res.states {
            if let Ok(Some(v)) = money::vault_in(&money(), &st.declarations) {
                out = v;
            }
        }
        out
    }
    fn payment_counts(&self, _: &Hash, _: &money::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
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
        if i.spec == money() && i.type_ == money::types::PAYEE_POINTER {
            if let Ok(Payload::PayeePointer(p)) = Payload::decode(i.type_, &i.payload) {
                pointers.push((h.id, p));
            }
        } else if i.spec == Specs::test().identity && i.type_ == 3 {
            if let Ok(r) = Routes::decode(&i.payload) {
                routes.push((h.id, r));
            }
        } else if i.spec == Specs::test().envelopes && i.type_ == 4 {
            if let Ok(k) = EncryptionKey::decode(&i.payload) {
                keys.push((h.id, k));
            }
        }
        if let Some(v) = View(rd).vault(&h.id) {
            vault = Some((h.id, v.1));
        }
    }
    let latest = money::latest_pointer(&pointers);
    let pointer = pointers.into_iter().find(|(i, _)| Some(*i) == latest.act);
    let r = envelopes::latest(&routes.iter().map(|(i, r)| (*i, r.version)).collect::<Vec<_>>());
    let k = envelopes::latest(&keys.iter().map(|(i, k)| (*i, k.version)).collect::<Vec<_>>());
    let route = routes.iter().find(|(i, _)| Some(*i) == r.act).expect("an inbox route");
    let key = keys.iter().find(|(i, _)| Some(*i) == k.act).expect("an encryption key");
    PayeeView { id: *id, pointer, vault, inbox: route.1.inbox(&text_spec()).expect("an inbox").hints[0].clone(), ek: key.1.key.clone() }
}

/// Verify a receipt or claim the party holds, with the core and the cMIP;
/// and, beside it, whether it counts for this Money-only wallet (rules 12
/// to 14a; for a tip, the pointer it follows).
fn check(party: &Party, act: &Hash, chain: &HeaderChain) -> (Answer, Answer) {
    let h = party.rd.v.get(act).expect("held");
    let signer = h.act.outside.signer.expect("signed by an identity");
    let p = Payload::decode(h.inside.type_, &h.inside.payload).expect("a Money act");
    let cited = Citations::of(&h.inside);
    money::check_signer(&p, &signer, &cited).expect("signed by the right party");
    let onchain = Onchain::on(chain);
    let m = Modules::new().adopt(&onchain);
    let rec = match &p {
        Payload::Receipt(r) => Record::Receipt(r),
        Payload::Claim(c) => Record::Claim(c, signer, &cited),
        _ => panic!("not a receipt or claim"),
    };
    let v = verify(rec.clone(), &View(&party.rd), &m);
    assert_eq!(v.trusted, None, "the on-chain rail relies on no trusted party");
    (v.answer, beside(rec, &View(&party.rd)))
}

fn rail_proof(party: &Party, act: &Hash) -> OnchainProof {
    let h = party.rd.v.get(act).expect("held");
    let proof = match Payload::decode(h.inside.type_, &h.inside.payload).unwrap() {
        Payload::Receipt(r) => r.proof,
        Payload::Claim(c) => c.proof,
        _ => panic!(),
    };
    OnchainProof::decode(&Proof::decode(&proof).unwrap().rail).unwrap()
}

// ---------------------------------------------------------------- the payee's side

/// Bob's software: his request service, which signs a request only for a
/// payment to him, to his own pointer or vault, with the request key of the
/// address paid; and his watcher, which reads the chain from his own node.
struct PayeeSide {
    payee: Hash,
    pointer: Hash,
    vault: Hash,
    /// (address's request key, its secret), and (address's key, its secret).
    requests: Vec<([u8; 32], SecretKey)>,
    keys: Vec<([u8; 32], SecretKey)>,
}

impl PayeeSide {
    fn request(&self, c: &Commitment, address: &[u8]) -> Result<[u8; 64], String> {
        if c.payee != self.payee || c.rail != mor_onchain::spec() {
            return Err("not a payment to this payee on-chain".into());
        }
        match c.paid_to {
            PaidTo::Flow { pointer, .. } if pointer == self.pointer => {}
            PaidTo::Vault { declared_by, .. } if declared_by == self.vault => {}
            _ => return Err("not one of this payee's own pointers or vaults".into()),
        }
        let a = OnchainAddress::decode(address).ok_or("not an on-chain address")?;
        let (_, sk) = self.requests.iter().find(|(k, _)| *k == a.request).ok_or("not one of this payee's request keys")?;
        let kp = Keypair::from_secret_key(&Secp256k1::new(), sk);
        let m = mor_onchain::p2c::request_message(&c.hash());
        Ok(Secp256k1::new().sign_schnorr_with_aux_rand(&Message::from_digest(m), &kp, &random::<32>()).serialize())
    }

    /// Spend a payment it received, by the key path with its key tweaked by
    /// the payment's commitment (BIP 341): the money is the payee's.
    /// It sweeps to a fresh key of its own, never to the declared key's own
    /// address, which would link the payment to the public pointer (client
    /// conformance; review finding 7b).
    fn sweep(&self, address: &OnchainAddress, commitment: &Hash, prev: OutPoint, value: u64) -> Transaction {
        let (_, sk) = self.keys.iter().find(|(k, _)| *k == address.key).expect("the payee's key");
        let secp = Secp256k1::new();
        let tweaked = Keypair::from_secret_key(&secp, sk).tap_tweak(&secp, Some(TapNodeHash::from_byte_array(*commitment)));
        let spent = TxOut { value: bitcoin::Amount::from_sat(value), script_pubkey: ScriptBuf::from_bytes(address.script(commitment).unwrap()) };
        let mut t = Transaction {
            version: transaction::Version::TWO,
            lock_time: absolute::LockTime::ZERO,
            input: vec![TxIn { previous_output: prev, script_sig: ScriptBuf::new(), sequence: Sequence::MAX, witness: Witness::new() }],
            output: vec![TxOut { value: bitcoin::Amount::from_sat(value - 500), script_pubkey: ScriptBuf::from_bytes(mor_onchain::tx::taproot_script(&xonly(&secret(&format!("Bob's next fresh key {}", address.key[0]))))) }],
        };
        let sighash = SighashCache::new(&t).taproot_key_spend_signature_hash(0, &Prevouts::All(&[spent]), TapSighashType::Default).unwrap();
        let sig = secp.sign_schnorr_with_aux_rand(&Message::from_digest(sighash.to_byte_array()), &tweaked.to_keypair(), &random::<32>());
        t.input[0].witness.push(sig.serialize());
        t
    }
}

// ---------------------------------------------------------------- the payer's wallet

/// Alice's coins: regtest coinbase outputs to her key, spent one per
/// payment, signed by rust-bitcoin.
struct Coins {
    sk: SecretKey,
    script: ScriptBuf,
    unspent: Vec<(OutPoint, u64)>,
}

impl Coins {
    fn new() -> Coins {
        let sk = secret("Alice's coins, regtest only");
        let pk = CompressedPublicKey::from_private_key(&Secp256k1::new(), &bitcoin::PrivateKey::new(sk, bitcoin::Network::Regtest)).unwrap();
        Coins { sk, script: Address::p2wpkh(&pk, bitcoin::Network::Regtest).script_pubkey(), unspent: vec![] }
    }
    fn address(&self) -> String {
        Address::from_script(&self.script, bitcoin::Network::Regtest).unwrap().to_string()
    }
    /// Find the mature coinbase outputs paying her.
    async fn scan(&mut self, node: &Btcd) {
        let tip = node.block_count().await.unwrap();
        for height in 1..=tip.saturating_sub(100) {
            let b = node.block_hash(height).await.unwrap();
            let cb = node.block_txids(&b).await.unwrap()[0];
            let (raw, _) = node.transaction(&cb).await.unwrap();
            let t: Transaction = consensus::deserialize(&raw).unwrap();
            if t.output[0].script_pubkey == self.script {
                self.unspent.push((OutPoint { txid: Txid::from_byte_array(cb), vout: 0 }, t.output[0].value.to_sat()));
            }
        }
    }
    /// A transaction spending one coin, paying `to` exactly `value`, the
    /// rest (less a fee) back to her.
    fn pay(&self, coin: (OutPoint, u64), to: &[u8], value: u64) -> Transaction {
        let (prev, have) = coin;
        let mut t = Transaction {
            version: transaction::Version::TWO,
            lock_time: absolute::LockTime::ZERO,
            input: vec![TxIn { previous_output: prev, script_sig: ScriptBuf::new(), sequence: Sequence::MAX, witness: Witness::new() }],
            output: vec![
                TxOut { value: bitcoin::Amount::from_sat(value), script_pubkey: ScriptBuf::from_bytes(to.to_vec()) },
                TxOut { value: bitcoin::Amount::from_sat(have - value - 1_000), script_pubkey: self.script.clone() },
            ],
        };
        let secp = Secp256k1::new();
        let pk = bitcoin::PublicKey::new(bitcoin::secp256k1::PublicKey::from_secret_key(&secp, &self.sk));
        let sighash = SighashCache::new(&t).p2wpkh_signature_hash(0, &self.script, bitcoin::Amount::from_sat(have), EcdsaSighashType::All).unwrap();
        let sig = secp.sign_ecdsa(&Message::from_digest(sighash.to_byte_array()), &self.sk);
        t.input[0].witness = Witness::p2wpkh(&bitcoin::ecdsa::Signature { signature: sig, sighash_type: EcdsaSighashType::All }, &pk.inner);
        t
    }
}

/// The transaction without its witness: the bytes its txid hashes, which
/// the proof carries.
fn stripped(t: &Transaction) -> Vec<u8> {
    let mut t = t.clone();
    for i in &mut t.input {
        i.witness = Witness::new();
    }
    consensus::serialize(&t)
}

/// One payment as the payer's wallet makes it.
struct Made {
    commitment: Commitment,
    address: OnchainAddress,
    request: [u8; 64],
    tx: Transaction,
    /// The claim written at the moment of payment (Money rule 15), pending.
    claim_at_payment: Act,
}

#[derive(Debug)]
enum Refused {
    Undeliverable(money::Undeliverable),
    WrongAddress(Answer),
}

struct Wallet<'a> {
    alice: &'a mut Party,
    coins: &'a mut Coins,
    site: &'a Site,
}

impl Wallet<'_> {
    /// Choose where to pay (rules 14a and 16), ask the payee's side for a
    /// request, check it and the address before paying (payment cMIP step
    /// 2), pay, and write and deliver the claim at once. `offered` is what
    /// the payee's side offers to pay to, where it is not the address the
    /// commitment gives.
    async fn pay(&mut self, node: &Btcd, view: &PayeeView, side: &PayeeSide, amount: Amount, fulfils: Hash, offered: Option<Vec<u8>>) -> Result<Made, Refused> {
        let onchain = Onchain::offline();
        let can_pay = |m: &Hash, a: &[u8], u: &Hash| m == &mor_onchain::spec() && onchain.unit(a) == Some(*u) && *u == unit(Network::Regtest);
        let (paid_to, address) = match choose(view.pointer.as_ref().map(|(_, p)| p), view.vault.as_ref().map(|(_, v)| v.as_slice()), &amount, can_pay) {
            Choice::Flow(i) => {
                let (id, p) = view.pointer.as_ref().unwrap();
                (PaidTo::Flow { pointer: *id, rail: i as u64 }, p.rails[i].address.clone())
            }
            Choice::Vault(i) => {
                let (id, v) = view.vault.as_ref().unwrap();
                (PaidTo::Vault { declared_by: *id, entry: i as u64 }, v[i].source.clone())
            }
            Choice::Undeliverable(why) => return Err(Refused::Undeliverable(why)),
        };
        let c = Commitment { rail: mor_onchain::spec(), payee: view.id, amount, fulfils, payer: Some(Payer::Identity(self.alice.p.id)), paid_to, salt: random::<16>(), purchase: None };
        let request = side.request(&c, &address).expect("a request");
        // Before paying: the request checks out (pending: not paid yet).
        let before = Onchain::rule(&RailInput {
            commitment: c.hash(),
            amount: &amount,
            address: &address,
            rail_proof: &OnchainProof { request, confirmations: None, paid: None }.encode(),
        }, None);
        assert!(matches!(before, Answer::Pending(_)), "the request checks out before paying: {before:?}");
        let a = OnchainAddress::decode(&address).unwrap();
        let expected = a.script(&c.hash()).unwrap();
        let to = offered.unwrap_or_else(|| expected.clone());
        let coin = self.coins.unspent.remove(0);
        let t = self.coins.pay(coin, &to, amount.value);
        // The wallet checks what it is about to broadcast with the rule, as
        // it would stand once paid: an output not tweaked by the
        // commitment is refused, and nothing is sent.
        let as_paid = Onchain::rule(&RailInput {
            commitment: c.hash(),
            amount: &amount,
            address: &address,
            rail_proof: &OnchainProof { request, confirmations: None, paid: Some(mor_onchain::Paid { tx: stripped(&t), output: 0, block: None }) }.encode(),
        }, None);
        if !matches!(as_paid, Answer::Pending(_)) {
            self.coins.unspent.insert(0, coin);
            return Err(Refused::WrongAddress(as_paid));
        }
        node.send(&consensus::serialize(&t)).await.expect("the node takes the payment");
        let claim_at_payment = self.claim(view, &c, request, &t, node).await;
        Ok(Made { commitment: c, address: a, request, tx: t, claim_at_payment })
    }

    /// Write and deliver the payer's claim with the proof as the chain now
    /// shows it.
    async fn claim(&mut self, view: &PayeeView, c: &Commitment, request: [u8; 64], t: &Transaction, node: &Btcd) -> Act {
        let rail = node.proof(request, &stripped(t), 0).await.expect("a proof");
        let claim = Payload::Claim(Claim {
            rail: mor_onchain::spec(),
            proof: Proof { paid_to: c.paid_to, salt: c.salt, rail: rail.encode() }.encode(),
            payee: view.id,
            amount: c.amount,
            fulfils: c.fulfils,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: None,
        });
        let a = self.alice.money_act(&claim, Some(view.id));
        put(self.site, &a).await;
        deliver(view, &a, &self.alice.p.key_of(&a.id()).unwrap()).await;
        self.alice.keep(&a);
        a
    }
}

/// The payee's watcher, once its own node shows six confirmations: it
/// builds the proof from the chain itself, checks it with the rule, and
/// signs the receipt, delivered to the payer.
async fn receipt(bob: &mut Party, node: &Btcd, made: &Made, payer: &PayeeView) -> Act {
    let rail = node.proof(made.request, &stripped(&made.tx), 0).await.expect("a proof");
    let c = &made.commitment;
    let chain = node.chain(Network::Regtest).await.expect("the node's headers");
    let answer = Onchain::rule(&RailInput { commitment: c.hash(), amount: &c.amount, address: &made.address.encode(), rail_proof: &rail.encode() }, Some(&chain));
    assert_eq!(answer, Answer::Valid, "the payee signs only once the rule says valid");
    let r = Payload::Receipt(Receipt {
        rail: mor_onchain::spec(),
        proof: Proof { paid_to: c.paid_to, salt: c.salt, rail: rail.encode() }.encode(),
        payer: c.payer.clone(),
        payee: c.payee,
        amount: c.amount,
        fulfils: c.fulfils,
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    });
    let a = bob.money_act(&r, Some(payer.id));
    deliver(payer, &a, &bob.p.key_of(&a.id()).unwrap()).await;
    bob.keep(&a);
    a
}

fn btcd_dir() -> Option<PathBuf> {
    std::env::var("MOR_BTCD").ok().map(PathBuf::from)
}

async fn until<F: std::future::Future<Output = bool>>(what: &str, mut f: impl FnMut() -> F) {
    for _ in 0..300 {
        if f().await {
            return;
        }
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
    }
    panic!("timed out waiting: {what}");
}

#[tokio::test(flavor = "multi_thread")]
async fn a_test_identity_pays_another_on_chain() {
    let Some(bin) = btcd_dir() else {
        eprintln!("MOR_BTCD is not set: the regtest on-chain test did not run (see modules/onchain/README.md)");
        return;
    };
    let run = std::env::temp_dir().join(format!("mor-onchain-regtest-{}", std::process::id()));
    let mut coins = Coins::new();
    // Two btcd nodes, A (everyone's) and B (where the double spend is
    // mined), both mining to Alice.
    let a = Node::start(&bin, &run.join("a"), 28556, 28557, &coins.address()).await.expect("node A");
    let b = Node::start(&bin, &run.join("b"), 28558, 28559, &coins.address()).await.expect("node B");
    a.rpc.connect(&b.p2p).await.unwrap();
    until("A and B are peers", || async { a.rpc.peers().await.unwrap_or(0) > 0 }).await;
    // Segregated witness and Taproot activate on btcd's regtest only after
    // a few hundred blocks.
    a.rpc.generate(500).await.unwrap();
    until("B follows A", || async { b.rpc.best().await.ok() == a.rpc.best().await.ok() }).await;
    coins.scan(&a.rpc).await;
    assert!(coins.unspent.len() > 10, "Alice has coins");

    let http = Http::new(None);
    let site = Site::start("onchain", "home", Role::Home, Policy::Open, &http).await;
    let seed = random::<32>();

    // Bob's keys: his flow (its own request key the same), and his vault: an
    // ordinary key he would keep offline, with a request key apart, kept
    // online to sign requests only.
    let (flow_sk, vault_sk, vault_rq) = (secret("Bob's flow key"), secret("Bob's vault key, offline"), secret("Bob's vault request key"));
    let flow = OnchainAddress { network: Network::Regtest, key: xonly(&flow_sk), request: xonly(&flow_sk), tree: None, endpoint: Some("in-process, for this test".into()) };
    let safe = OnchainAddress { network: Network::Regtest, key: xonly(&vault_sk), request: xonly(&vault_rq), tree: None, endpoint: Some("in-process, for this test".into()) };
    let mut alice = Party::born(&site, &seed, "alice", None).await;
    let bob_vault = vec![VaultEntry { unit: unit(Network::Regtest), rail_module: mor_onchain::spec(), source: safe.encode(), limit: 10_000 }];
    let mut bob = Party::born(&site, &seed, "bob", Some(bob_vault)).await;
    let pointer = Payload::PayeePointer(PayeePointer { payee: bob.p.id, version: 1, previous: None, rails: vec![Rail { module: mor_onchain::spec(), address: flow.encode() }] });
    let pointer_act = bob.money_act(&pointer, None);
    put(&site, &pointer_act).await;
    let side = PayeeSide {
        payee: bob.p.id,
        pointer: pointer_act.id(),
        vault: bob.p.id,
        requests: vec![(flow.request, flow_sk), (safe.request, vault_rq)],
        keys: vec![(flow.key, flow_sk), (safe.key, vault_sk)],
    };
    let mut alice_rd = Reader::new(Http::new(None));
    let bob_view = read_payee(&mut alice_rd, &site, &bob.p.id).await;
    let alice_view = read_payee(&mut Reader::new(Http::new(None)), &site, &alice.p.id).await;
    let tip_pointer = pointer_act.id();
    // Both read Bob's pointer and genesis, which the verifier needs.
    for party in [&mut alice, &mut bob] {
        read_payee(&mut party.rd, &site, &side.payee).await;
    }

    // ------------------------------------------------ 1. A tip, pending, then counted.
    let made = Wallet { alice: &mut alice, coins: &mut coins, site: &site }
        .pay(&a.rpc, &bob_view, &side, sat(1_234), tip_pointer, None)
        .await
        .expect("the tip is paid");
    // Paid, not yet settled: the claim written at payment is pending, for
    // both; Bob signs no receipt.
    bob.pick_up(&site).await;
    for party in [&alice, &bob] {
        let (answer, _) = check(party, &made.claim_at_payment.id(), &a.rpc.chain(Network::Regtest).await.unwrap());
        assert!(matches!(&answer, Answer::Pending(w) if w.contains("unconfirmed")), "{}: {answer:?}", party.p.name);
    }
    eprintln!("tip of 1,234 broadcast: the claim written at payment is pending (unconfirmed); no receipt yet");
    // One block: pending, 1 of 6.
    a.rpc.generate(1).await.unwrap();
    let one = a.rpc.proof(made.request, &stripped(&made.tx), 0).await.unwrap();
    let c = &made.commitment;
    let chain = a.rpc.chain(Network::Regtest).await.unwrap();
    let rule = |p: &OnchainProof| Onchain::rule(&RailInput { commitment: c.hash(), amount: &c.amount, address: &made.address.encode(), rail_proof: &p.encode() }, Some(&chain));
    assert!(matches!(rule(&one), Answer::Pending(w) if w.contains("1 of 6")));
    eprintln!("mined once: pending, 1 of {CONFIRMATIONS}");
    // Six: valid. Bob's watcher builds the proof from his own node and
    // signs the receipt; Alice writes her claim with the same proof.
    a.rpc.generate(CONFIRMATIONS as u64 - 1).await.unwrap();
    let tip_receipt = receipt(&mut bob, &a.rpc, &made, &alice_view).await;
    let tip_claim = Wallet { alice: &mut alice, coins: &mut coins, site: &site }.claim(&bob_view, &made.commitment, made.request, &made.tx, &a.rpc).await;
    alice.pick_up(&site).await;
    bob.pick_up(&site).await;
    let chain = a.rpc.chain(Network::Regtest).await.unwrap();
    for party in [&alice, &bob] {
        for act in [tip_receipt.id(), tip_claim.id()] {
            assert_eq!(check(party, &act, &chain), (Answer::Valid, Answer::Valid), "{} verifies {}", party.p.name, short(&act));
        }
        assert!(matches!(check(party, &made.claim_at_payment.id(), &chain).0, Answer::Pending(_)), "the claim written at payment stays pending: an act never changes");
        assert_eq!(rail_proof(party, &tip_receipt.id()), rail_proof(party, &tip_claim.id()), "one payment, one proof: the same bytes on both sides");
    }
    eprintln!("six confirmations: Alice and Bob each hold a valid receipt {} and claim {}, with the same proof", short(&tip_receipt.id()), short(&tip_claim.id()));
    // The money is Bob's: he spends it with his key tweaked by the
    // commitment.
    let txid = made.tx.compute_txid();
    let sweep = side.sweep(&made.address, &made.commitment.hash(), OutPoint { txid, vout: 0 }, 1_234);
    a.rpc.send(&consensus::serialize(&sweep)).await.expect("Bob's sweep is a valid Taproot spend");
    a.rpc.generate(1).await.unwrap();
    assert!(a.rpc.unspent(&txid.to_byte_array(), 0).await.unwrap().is_none(), "spent by Bob");
    eprintln!("Bob spent the tip with his key tweaked by the commitment: the money is his");

    // ------------------------------------------------ 2. Above the vault's limit: to the vault.
    let big = Wallet { alice: &mut alice, coins: &mut coins, site: &site }
        .pay(&a.rpc, &bob_view, &side, sat(50_000), tip_pointer, None)
        .await
        .expect("paid to the vault");
    assert!(matches!(big.commitment.paid_to, PaidTo::Vault { .. }), "above 10,000: to the vault");
    assert_eq!(big.address, safe);
    a.rpc.generate(CONFIRMATIONS as u64).await.unwrap();
    let big_receipt = receipt(&mut bob, &a.rpc, &big, &alice_view).await;
    bob.pick_up(&site).await;
    assert_eq!(check(&bob, &big_receipt.id(), &a.rpc.chain(Network::Regtest).await.unwrap()), (Answer::Valid, Answer::Valid));
    let (txid, _) = rail_proof(&bob, &big_receipt.id()).outpoint().unwrap();
    let (raw, _) = a.rpc.transaction(&txid).await.unwrap();
    let t: Transaction = consensus::deserialize(&raw).unwrap();
    assert_eq!(t.output[0].script_pubkey.as_bytes(), safe.script(&big.commitment.hash()).unwrap().as_slice(), "the vault's key, tweaked by the commitment");
    assert_ne!(t.output[0].script_pubkey.as_bytes(), mor_onchain::tx::taproot_script(&safe.key).as_slice(), "never the vault key's own address: nothing on the chain links it to the vault");
    // The same payment presented as paid to the flow would not have
    // followed the vault (rule 14a).
    assert!(!money::flow_followed_vault(bob_view.vault.as_ref().map(|v| v.1.as_slice()), &sat(50_000)));
    eprintln!("50,000 above the limit of 10,000 went to Bob's vault address, its request signed by the vault's request key, verified");
    // Signet satoshis: a unit Bob's vault does not cover. Fail closed
    // (rule 14a): refused before anything is asked or paid.
    let out = Wallet { alice: &mut alice, coins: &mut coins, site: &site }
        .pay(&a.rpc, &bob_view, &side, Amount { unit: unit(Network::Signet), value: 500 }, tip_pointer, None)
        .await;
    assert!(matches!(&out, Err(Refused::Undeliverable(money::Undeliverable::UnitNotCovered))), "{:?}", out.err());
    eprintln!("500 signet satoshis: a unit Bob's vault does not cover, refused (rule 14a)");

    // ------------------------------------------------ 3. An address not tweaked by the commitment.
    // A request service that offers Bob's untweaked key as the address:
    // the wallet checks before broadcasting, and refuses.
    let wrong = mor_onchain::tx::taproot_script(&flow.key);
    let out = Wallet { alice: &mut alice, coins: &mut coins, site: &site }
        .pay(&a.rpc, &bob_view, &side, sat(2_000), tip_pointer, Some(wrong.clone()))
        .await;
    assert!(matches!(&out, Err(Refused::WrongAddress(Answer::Invalid(w))) if w.contains("not tweaked by this payment's commitment")), "{:?}", out.err());
    eprintln!("an address not tweaked by the commitment: Alice's wallet refused before paying");
    // A careless wallet pays it anyway: once confirmed, the rule refuses
    // the proof, so Bob signs no receipt and the claim counts for nothing.
    let c = Commitment { rail: mor_onchain::spec(), payee: bob.p.id, amount: sat(2_000), fulfils: tip_pointer, payer: Some(Payer::Identity(alice.p.id)), paid_to: PaidTo::Flow { pointer: tip_pointer, rail: 0 }, salt: random::<16>(), purchase: None };
    let rq = side.request(&c, &flow.encode()).unwrap();
    let coin = coins.unspent.remove(0);
    let t = coins.pay(coin, &wrong, 2_000);
    a.rpc.send(&consensus::serialize(&t)).await.unwrap();
    a.rpc.generate(CONFIRMATIONS as u64).await.unwrap();
    let careless = Wallet { alice: &mut alice, coins: &mut coins, site: &site }.claim(&bob_view, &c, rq, &t, &a.rpc).await;
    bob.pick_up(&site).await;
    let chain = a.rpc.chain(Network::Regtest).await.unwrap();
    for party in [&alice, &bob] {
        assert!(matches!(check(party, &careless.id(), &chain).0, Answer::Invalid(w) if w.contains("not tweaked")), "{}", party.p.name);
    }
    eprintln!("paid anyway to the untweaked key and confirmed six times: the claim is invalid for both");

    // ------------------------------------------------ 4. A reorganisation after six confirmations.
    // B leaves the network. On A, Alice pays Bob 3,000; it confirms six
    // times; both record it as valid.
    a.rpc.disconnect(&b.p2p).await.unwrap();
    until("A and B apart", || async { a.rpc.peers().await.unwrap_or(1) == 0 && b.rpc.peers().await.unwrap_or(1) == 0 }).await;
    let coin = coins.unspent[0];
    let paid = Wallet { alice: &mut alice, coins: &mut coins, site: &site }
        .pay(&a.rpc, &bob_view, &side, sat(3_000), tip_pointer, None)
        .await
        .expect("paid");
    a.rpc.generate(CONFIRMATIONS as u64).await.unwrap();
    let r4 = receipt(&mut bob, &a.rpc, &paid, &alice_view).await;
    let c4 = Wallet { alice: &mut alice, coins: &mut coins, site: &site }.claim(&bob_view, &paid.commitment, paid.request, &paid.tx, &a.rpc).await;
    alice.pick_up(&site).await;
    bob.pick_up(&site).await;
    let counted_on = a.rpc.chain(Network::Regtest).await.unwrap();
    for party in [&alice, &bob] {
        for act in [r4.id(), c4.id()] {
            assert_eq!(check(party, &act, &counted_on), (Answer::Valid, Answer::Valid));
        }
    }
    let block = rail_proof(&bob, &r4.id()).block_hash().unwrap();
    assert!(a.rpc.on_best_chain(&block).await.unwrap());
    eprintln!("3,000 confirmed six times on A: both hold a valid receipt and claim");
    // Meanwhile on B, the same coins go back to Alice, and B mines a longer
    // chain.
    let back = coins.pay(coin, coins.script.as_bytes(), 3_000);
    b.rpc.send(&consensus::serialize(&back)).await.expect("B takes the double spend: it never saw the payment");
    b.rpc.generate(CONFIRMATIONS as u64 + 2).await.unwrap();
    // B returns: A follows the chain with more work.
    a.rpc.connect(&b.p2p).await.unwrap();
    until("A reorganises onto B's chain", || async { a.rpc.best().await.ok() == b.rpc.best().await.ok() }).await;
    let paid_txid = paid.tx.compute_txid().to_byte_array();
    assert!(!a.rpc.on_best_chain(&block).await.unwrap(), "the block the proof names is no longer on A's best chain");
    assert!(a.rpc.unspent(&paid_txid, 0).await.unwrap().is_none(), "Bob's output does not exist on the best chain");
    assert!(a.rpc.transaction(&back.compute_txid().to_byte_array()).await.unwrap().1.is_some(), "the double spend is confirmed");
    // F204: checked against the chain A now follows, the proofs' block is
    // on no chain the verifier holds: unknown, never valid. Checked against
    // the chain they were counted on, they stay valid. A rewrite deeper than
    // the confirmations is F205's stated cost; what a verifier answers for
    // a payment counted before it is the build report's open question.
    let now = a.rpc.chain(Network::Regtest).await.unwrap();
    for party in [&alice, &bob] {
        for act in [r4.id(), c4.id()] {
            assert!(matches!(check(party, &act, &now).0, Answer::Unknown(_)), "{} on the chain now", party.p.name);
            assert_eq!(check(party, &act, &counted_on).0, Answer::Valid, "{} on the chain it was counted on", party.p.name);
        }
        assert!(matches!(check(party, &paid.claim_at_payment.id(), &now).0, Answer::Pending(_)));
    }
    eprintln!(
        "reorganised: the block of the 3,000 payment is off the best chain, the coins went back to Alice, and Bob's output does not exist; \
         against the chain now followed the receipt {} and the claim {} answer unknown (F204); against the chain they were counted on, valid",
        short(&r4.id()),
        short(&c4.id())
    );
    drop((a, b));
    let _ = std::fs::remove_dir_all(&run);
}
