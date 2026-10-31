//! Roadmap step 14a, end to end on regtest, as its second pass left it
//! (F225, F228), moved to the redesign by the anchoring cMIP's draft 6
//! (round 8, F407): a pooled anchoring service on Bitcoin, selling under
//! an Agreements **publication**, a lone seller's, the service its own
//! split service, priced by a **price tag** naming it. Test identities buy
//! anchors by paying that tag at their tier's price; the service anchors
//! them in one batch by pay-to-contract (no OP_RETURN) and signs a batch
//! notice under the publication; anyone verifies inclusion from the chain;
//! a hash paid for and left out of its batch is a provable omission; a
//! hash whose batch never comes is a default once its deadline is buried
//! six blocks deep. Each default owes the price back under the
//! publication's terms, and **the refund
//! is paid**: the service pays it back over Lightning to the payer's own
//! pointer and signs its claim naming the payment refunded, and the core's
//! Agreements view shows it repaid.
//!
//! **The pool as visible custody** (anchoring cMIP draft 4): the service
//! puts its tickets and its receipts on its home. It funds the batch from
//! its own coins by a payment to its own pointer's on-chain rail, and pays
//! the batch's change back to itself the same way, each shown by a receipt
//! it signs. A third party then follows the batch's money from the payers'
//! payments to the transaction that anchors it: in, paid back, the fee,
//! the output, and what the service kept, here a loss, the service's
//! (F228), shown.
//!
//! *Premises moved (draft 6): the standing offer is gone from the core;
//! where this test read it (`AgreementsView::offer`), it reads the
//! publication (`AgreementsView::publication`) and its tag
//! (`AgreementsView::tag_under`), and the payments pay the tag.*
//!
//! The acts (the pointers, the publication and its price tag, tickets and batch notices,
//! the claims, the acts anchored) are real acts on a throwaway home, read
//! back and checked by a reader and the core's Agreements view.
//!
//! It starts one btcd node on regtest itself, from the btcd release in
//! `MOR_BTCD` (a directory holding `btcd`), for the anchors:
//!
//!   MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test anchoring -- --nocapture
//!
//! **With `MOR_LN_REGTEST` also set** (the regtest Lightning network of
//! `modules/lightning/regtest/up.sh`), every payment moves over real lnd
//! nodes: the service's node is bob, the payers pay from alice, and the
//! refunds go back from bob to alice, each invoice issued by the payee's
//! own node. The Lightning network runs on its own regtest chain, beside
//! the anchors' (two regtest chains, both test coins). Without it, each
//! invoice is a real BOLT 11 invoice signed by a test node key and settled
//! by its preimage, and no node moves money.
//!
//! Without `MOR_BTCD` it says so and passes without running. Test
//! identities and regtest coins only.

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::key::{Keypair, TapTweak};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use bitcoin::sighash::{EcdsaSighashType, Prevouts, SighashCache, TapSighashType};
use bitcoin::taproot::TapNodeHash;
use bitcoin::{absolute, consensus, transaction, Address, CompressedPublicKey, OutPoint, ScriptBuf, Sequence, Transaction, TxIn, TxOut, Txid, Witness};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_anchoring::custody::{self, Anchoring, Coin, Paid as Sold};
use mor_anchoring::service::{self, Judgment, Offer, Payment, Price, Publication, Standing, Terms, Ticket, Tier};
use mor_anchoring::tree::{self, Batch};
use mor_core::act::{Act, Object};
use mor_core::chain::Status;
use mor_core::envelopes::anchoring::Anchors;
use mor_core::money::{self, Amount, Citations, Claim, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt, RefundTo, VaultEntry};
use mor_core::hash::{sha256, Hash};
use mor_core::agreements::{self, AgreementsView, Mirs};
use mor_harness::net::{Http, Site};
use mor_harness::person::Person;
use mor_harness::reader::Reader;
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::lnd::Lnd;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::btcd::{Btcd, Node};
use mor_onchain::clock::{self, BatchAnchor, BitcoinClock};
use mor_onchain::{Network, Onchain, OnchainAddress, OnchainProof, CONFIRMATIONS};
use mor_payment::{paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use mor_relay::operator::random;
use mor_relay::{Policy, Role};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::Duration;

fn money_spec() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
}

fn mirs() -> Mirs {
    Mirs {
        identity: sha256(b"IDENTITY, test value until the freeze"),
        envelopes: sha256(b"ENVELOPE, test value until the freeze"),
        text: sha256(b"a text specification"),
        money: money_spec(),
        agreements: sha256(b"LAW, test value until the freeze"),
        development: sha256(b"PRODUCTION, test value until the freeze"),
    }
}

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn secret(label: &str) -> SecretKey {
    SecretKey::from_slice(&h(label)).unwrap()
}

fn sat(n: u64) -> Amount {
    Amount { unit: mor_onchain::unit(Network::Regtest), value: n }
}

async fn put(site: &Site, a: &Act) {
    site.client.put_act(&a.encode()).await.unwrap_or_else(|e| panic!("the relay refused an act: {e:?}"));
}

async fn born(site: &Site, seed: &[u8; 32], name: &str) -> Person {
    let (g, p) = Person::genesis(seed, name, vec![site.home()], None, None);
    put(site, &g).await;
    p
}

/// A reader that has followed each of `who` on the home and holds its acts.
async fn read(site: &Site, who: &[Hash]) -> Reader {
    let mut rd = Reader::new(Http::new(None));
    for w in who {
        rd.follow(w, &[site.base.clone()]).await;
        for a in site.client.acts_by(w).await.expect("the acts") {
            rd.add(&a);
        }
    }
    rd
}

/// What a reader holds of an act: its payload, if the act counts.
fn payload(rd: &Reader, id: &Hash) -> Vec<(mor_core::cbor::Value, mor_core::cbor::Value)> {
    assert_eq!(rd.status(id), Status::Valid, "the act counts");
    rd.v.get(id).expect("held").inside.payload.clone()
}

/// The pointers the payment cMIP asks for: the service's and the payers'.
struct Pointers(Vec<(Hash, PayeePointer)>);

impl Held for Pointers {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        self.0.iter().find(|(i, _)| i == id).map(|(_, p)| p.clone())
    }
    fn vault(&self, _: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        None
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
        self.0.iter().filter(|(_, p)| &p.payee == payee).cloned().collect()
    }
    fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
        None
    }
    fn payment_counts(&self, _: &Hash, _: &money::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }
}

// ---------------------------------------------------------------- Lightning

/// Who receives a payment: the service (bob's node), or a payer getting a
/// refund (alice's node).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Side {
    Service,
    Payer,
}

/// The Lightning rail as this test runs it: real lnd nodes where
/// `MOR_LN_REGTEST` is set, otherwise test node keys signing real invoices.
enum Ln {
    Nodes { alice: Lnd, bob: Lnd },
    Keys,
}

impl Ln {
    fn from_env() -> Ln {
        match std::env::var("MOR_LN_REGTEST") {
            Ok(dir) => {
                let dir = Path::new(&dir);
                let node = |n: &str, port: u16| Lnd::from_dir(&format!("https://127.0.0.1:{port}"), &dir.join(n)).expect("an lnd node");
                Ln::Nodes { alice: node("alice", 18080), bob: node("bob", 18081) }
            }
            Err(_) => Ln::Keys,
        }
    }

    fn real(&self) -> bool {
        matches!(self, Ln::Nodes { .. })
    }

    fn test_key(side: Side) -> SecretKey {
        secret(match side {
            Side::Service => "the service's Lightning node, a test key",
            Side::Payer => "the payers' Lightning node, a test key",
        })
    }

    /// The node key a receiver's pointer names.
    async fn node_key(&self, side: Side) -> [u8; 33] {
        match (self, side) {
            (Ln::Nodes { bob, .. }, Side::Service) => bob.node_key().await.unwrap(),
            (Ln::Nodes { alice, .. }, Side::Payer) => alice.node_key().await.unwrap(),
            (Ln::Keys, s) => PublicKey::from_secret_key(&Secp256k1::new(), &Ln::test_key(s)).serialize(),
        }
    }

    /// Give the service's node room to pay refunds: a refund leaves the
    /// service's node, and lnd keeps a channel reserve (about 1% of the
    /// channel) that the few hundred satoshis received for hashes do not
    /// cover. Alice pays bob 200,000 regtest satoshis on a plain invoice,
    /// no MOR payment. *A service on Lightning needs outbound liquidity to
    /// refund at all: its operational cost, stated in the report.*
    async fn refund_liquidity(&self) {
        if let Ln::Nodes { alice, bob } = self {
            let (invoice, _) = bob.add_invoice(200_000, &h("liquidity for refunds, no MOR payment")).await.unwrap();
            alice.pay(&invoice).await.expect("liquidity moved to the service's side");
        }
    }

    /// Pay `sat` to `to`, the invoice committing to `commitment`, issued by
    /// the receiver's node: the proof, settled.
    async fn pay(&self, to: Side, sat: u64, commitment: &Hash) -> LnProof {
        match self {
            Ln::Nodes { alice, bob } => {
                let (receiver, payer) = if to == Side::Service { (bob, alice) } else { (alice, bob) };
                let (invoice, _) = receiver.add_invoice(sat, commitment).await.expect("an invoice from the receiver's node");
                let preimage = payer.pay(&invoice).await.expect("paid over a real channel");
                LnProof { invoice, preimage: Some(preimage) }
            }
            Ln::Keys => {
                let preimage = random::<32>();
                LnProof { invoice: invoice(&Ln::test_key(to), sat * 1000, commitment, &preimage), preimage: Some(preimage) }
            }
        }
    }
}

/// A real BOLT 11 invoice signed by a test node key.
fn invoice(sk: &SecretKey, msat: u64, dh: &Hash, preimage: &Hash) -> String {
    InvoiceBuilder::new(Currency::Regtest)
        .description_hash(bh::Hash::from_byte_array(*dh))
        .payment_hash(bh::Hash::from_byte_array(sha256(preimage)))
        .payment_secret(PaymentSecret([7; 32]))
        .amount_milli_satoshis(msat)
        .duration_since_epoch(Duration::from_secs(1_790_000_000))
        .min_final_cltv_expiry_delta(80)
        .basic_mpp()
        .build_signed(|m: &Message| Secp256k1::new().sign_ecdsa_recoverable(m, sk))
        .unwrap()
        .to_string()
}

// ---------------------------------------------------------------- the pool's coins

/// The service's on-chain coins, a regtest P2WPKH key the node mines to.
struct Coins {
    sk: SecretKey,
    script: ScriptBuf,
    unspent: Vec<(OutPoint, u64)>,
}

impl Coins {
    fn new() -> Coins {
        let sk = secret("the anchoring pool's coins, regtest only");
        let pk = CompressedPublicKey::from_private_key(&Secp256k1::new(), &bitcoin::PrivateKey::new(sk, bitcoin::Network::Regtest)).unwrap();
        Coins { sk, script: Address::p2wpkh(&pk, bitcoin::Network::Regtest).script_pubkey(), unspent: vec![] }
    }
    fn address(&self) -> String {
        Address::from_script(&self.script, bitcoin::Network::Regtest).unwrap().to_string()
    }
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
    /// rest (less a fee) back.
    fn pay(&mut self, to: &[u8], value: u64) -> Transaction {
        let (prev, have) = self.unspent.pop().expect("a coin");
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

fn stripped(t: &Transaction) -> Vec<u8> {
    let mut t = t.clone();
    for i in &mut t.input {
        i.witness = Witness::new();
    }
    consensus::serialize(&t)
}

fn btcd_dir() -> Option<PathBuf> {
    std::env::var("MOR_BTCD").ok().map(PathBuf::from)
}

// ---------------------------------------------------------------- one payer

/// What a payer holds: the act it anchors, its blind, its pointer, the
/// payment, its claim, the ticket act the service handed it.
struct Buyer {
    name: &'static str,
    p: Person,
    act: Hash,
    blind: [u8; 32],
    pointer: Hash,
    commitment: Commitment,
    claim: Act,
    ticket_act: Act,
    ticket: Ticket,
}

/// What an Agreements client states of a claim it checked: the rail's answer,
/// valid, where it was paid, and which payment it is (F200).
#[allow(clippy::too_many_arguments)]
fn state(rail_valid: &mut BTreeMap<Hash, PaidAt>, payments: &mut BTreeMap<Vec<u8>, Vec<u8>>, held: &Pointers, modules: &Modules, id: Hash, c: &Claim, signer: Hash) {
    let rec = Record::Claim(c, signer, &Citations::default());
    assert_eq!(verify(rec.clone(), held, modules).answer, Answer::Valid);
    rail_valid.insert(id, paid_at(&rec).unwrap());
    if let Some(x) = mor_payment::payment(&rec, modules) {
        payments.insert(c.proof.clone(), x);
    }
}

fn claim_of(c: &Commitment, ln: &LnProof) -> Claim {
    Claim { rail: mor_lightning::spec(), proof: Proof { paid_to: c.paid_to, salt: c.salt, rail: ln.encode() }.encode(), payee: c.payee, amount: c.amount, fulfils: c.fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None }
}

/// The service's receipt of a payment it received, carrying the same rail
/// proof as the payer's claim (Money rule 10's double entry).
fn receipt_of(c: &Commitment, ln: &LnProof) -> Receipt {
    Receipt { rail: c.rail, proof: Proof { paid_to: c.paid_to, salt: c.salt, rail: ln.encode() }.encode(), payer: c.payer.clone(), payee: c.payee, amount: c.amount, fulfils: c.fulfils, previous: None, forward: None, batch: None, purchase: None }
}

/// The payment commitment a receipt recomputes (payment cMIP).
fn commitment_of(r: &Receipt) -> Commitment {
    let p = Proof::decode(&r.proof).expect("the payment cMIP's proof");
    Commitment { rail: r.rail, payee: r.payee, amount: r.amount, fulfils: r.fulfils, payer: r.payer.clone(), paid_to: p.paid_to, salt: p.salt, purchase: r.purchase.clone() }
}

/// The service's own on-chain coins, under its pointer's on-chain rail: the
/// address, its key and request key. A payment of the service to itself
/// there is a pool coin, shown by the receipt it signs.
struct Pool {
    key: SecretKey,
    request: SecretKey,
}

impl Pool {
    fn new() -> Pool {
        Pool { key: secret("the anchoring pool's on-chain key, regtest only"), request: secret("the anchoring pool's request key, regtest only") }
    }
    fn address(&self) -> OnchainAddress {
        let x = |sk: &SecretKey| Keypair::from_secret_key(&Secp256k1::new(), sk).x_only_public_key().0.serialize();
        OnchainAddress { network: Network::Regtest, key: x(&self.key), request: x(&self.request), tree: None, endpoint: Some("in-process, for this test".into()) }
    }
    /// A payment of `svc` to its own pointer's on-chain rail (rail 1).
    fn to_itself(&self, svc: Hash, pointer: Hash, amount: u64) -> (Commitment, Vec<u8>) {
        let c = Commitment { rail: mor_onchain::spec(), payee: svc, amount: sat(amount), fulfils: pointer, payer: Some(Payer::Identity(svc)), paid_to: PaidTo::Flow { pointer, rail: 1 }, salt: random::<16>(), purchase: None };
        let script = self.address().script(&c.hash()).unwrap();
        (c, script)
    }
    /// The service's side's request for a payment to it.
    fn request(&self, c: &Commitment) -> [u8; 64] {
        let kp = Keypair::from_secret_key(&Secp256k1::new(), &self.request);
        Secp256k1::new().sign_schnorr_with_aux_rand(&Message::from_digest(mor_onchain::p2c::request_message(&c.hash())), &kp, &random::<32>()).serialize()
    }
    /// A transaction spending the pool coin `prev` (paid under `c`, worth
    /// `value`) by the key path, its key tweaked by the commitment, paying
    /// `outputs`.
    fn spend(&self, c: &Commitment, prev: OutPoint, value: u64, outputs: &[(Vec<u8>, u64)]) -> Transaction {
        let secp = Secp256k1::new();
        let tweaked = Keypair::from_secret_key(&secp, &self.key).tap_tweak(&secp, Some(TapNodeHash::from_byte_array(c.hash())));
        let spent = TxOut { value: bitcoin::Amount::from_sat(value), script_pubkey: ScriptBuf::from_bytes(self.address().script(&c.hash()).unwrap()) };
        let mut t = Transaction {
            version: transaction::Version::TWO,
            lock_time: absolute::LockTime::ZERO,
            input: vec![TxIn { previous_output: prev, script_sig: ScriptBuf::new(), sequence: Sequence::MAX, witness: Witness::new() }],
            output: outputs.iter().map(|(s, v)| TxOut { value: bitcoin::Amount::from_sat(*v), script_pubkey: ScriptBuf::from_bytes(s.clone()) }).collect(),
        };
        let sighash = SighashCache::new(&t).taproot_key_spend_signature_hash(0, &Prevouts::All(&[spent]), TapSighashType::Default).unwrap();
        let sig = secp.sign_schnorr_with_aux_rand(&Message::from_digest(sighash.to_byte_array()), &tweaked.to_keypair(), &random::<32>());
        t.input[0].witness.push(sig.serialize());
        t
    }
}

/// The service's offer as a reader reads it (anchoring cMIP draft 6, item
/// 9): the publication `first` and the price tag `tag`, both held, the
/// core's Agreements view saying the publication counts and the tag counts
/// under it; read by the cMIP as its offer.
fn offer_in(rd: &Reader, first: &Hash, tag: &Hash, service: &Hash) -> Offer {
    let v = AgreementsView::new(&rd.v, mirs());
    let e = v.publication(first).expect("a publication");
    assert!(e.counts, "the publication counts: {:?}", e.problems);
    assert_eq!(v.tag_under(tag).unwrap(), agreements::TagUnder::Counts { publication: *first, withdrawn: false }, "its price tag counts under it");
    let Ok(Payload::PriceTag(t)) = Payload::decode(money::types::PRICE_TAG, &payload(rd, tag)) else { panic!("a price tag") };
    Offer::from_publication(*first, e.drafter, &e.publication, *tag, *service, &t).expect("an anchoring offer")
}

fn lightning(node: [u8; 33]) -> Vec<Rail> {
    vec![Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node, endpoint: Some("in-process, for this test".into()) }.encode() }]
}

#[tokio::test(flavor = "multi_thread")]
async fn test_identities_buy_anchors_under_a_publication_and_defaults_are_refunded_on_regtest() {
    let Some(bin) = btcd_dir() else {
        eprintln!("MOR_BTCD is not set: the regtest anchoring test did not run (see modules/onchain/README.md)");
        return;
    };
    let ln = Ln::from_env();
    eprintln!("{}", if ln.real() { "Lightning: real lnd nodes (MOR_LN_REGTEST): bob the service's node, alice the payers'" } else { "Lightning: test node keys sign real invoices; no node moves money (MOR_LN_REGTEST not set)" });
    let run = std::env::temp_dir().join(format!("mor-anchoring-regtest-{}", std::process::id()));
    let mut coins = Coins::new();
    let node = Node::start(&bin, &run.join("a"), 28566, 28567, &coins.address()).await.expect("a btcd node");
    // Taproot activates on btcd's regtest only after a few hundred blocks.
    node.rpc.generate(500).await.unwrap();
    coins.scan(&node.rpc).await;

    let http = Http::new(None);
    let site = Site::start("anchoring", "home", Role::Home, Policy::Open, &http).await;
    let seed = random::<32>();
    let lnm = Lightning;
    let modules = Modules::new().adopt(&lnm);

    // ------------------------------------------------ the service: pointer, publication and price tag
    let mut svc = born(&site, &seed, "the anchoring service").await;
    // Its pointer: Lightning (rail 0), where buyers pay; on-chain (rail 1),
    // where its own coins for the pool sit.
    let pool = Pool::new();
    let mut rails = lightning(ln.node_key(Side::Service).await);
    rails.push(Rail { module: mor_onchain::spec(), address: pool.address().encode() });
    let pointer = PayeePointer { payee: svc.id, version: 1, previous: None, rails };
    let pointer_act = svc.act(money_spec(), money::types::PAYEE_POINTER, Payload::PayeePointer(pointer.clone()).to_map(), None, None);
    put(&site, &pointer_act).await;
    let terms = Terms { reference: clock::reference(Network::Regtest), tiers: vec![Tier { price: Price::Fixed(50), blocks: 2 }, Tier { price: Price::Fixed(20), blocks: 6 }, Tier { price: Price::Fixed(5), blocks: 144 }] };
    let words = "Anchoring on Bitcoin regtest: tiers of 2, 6 and 144 blocks at 50, 20 and 5 satoshis a hash. A hash left out of its batch, or not anchored by its deadline, is refunded.";
    let publication_of = terms.publication(svc.id, mor_core::hash::sha256(b"a split cMIP, a test value"), Some(words.into()), None);
    let offer_act = svc.act(mirs().agreements, agreements::types::PUBLICATION, publication_of.to_map(), None, None);
    put(&site, &offer_act).await;
    // One price tag per tier (anchoring draft 7, F409), each at exactly its tier's price.
    let mut tag_acts = vec![];
    for (_, t) in terms.price_tags(offer_act.id(), mor_onchain::unit(Network::Regtest), svc.id) {
        let a = svc.act(money_spec(), money::types::PRICE_TAG, Payload::PriceTag(t).to_map(), None, None);
        put(&site, &a).await;
        tag_acts.push(a);
    }
    let under_offer = Some(vec![Object { chain: offer_act.id(), predecessor: offer_act.id() }]);
    let pool_key_sk = secret("the anchoring service's batch key");
    let pool_key = bitcoin::key::Keypair::from_secret_key(&Secp256k1::new(), &pool_key_sk).x_only_public_key().0.serialize();
    eprintln!("the service publishes its pointer, its publication (Agreements type 6, a lone seller's, its own split service) and its price tags (Money type 5, one per tier: 50, 20 and 5 satoshis): tiers of 2, 6 and 144 blocks at 50, 20 and 5 satoshis a hash");

    // ------------------------------------------------ four payers buy one hash each
    let now = node.rpc.block_count().await.unwrap();
    let mut buyers = vec![];
    let mut pointers = vec![(pointer_act.id(), pointer.clone())];
    let payer_node = ln.node_key(Side::Payer).await;
    // Ana and Ben: in batch 0; Cal: promised batch 0 and left out; Dan:
    // promised batch 1, which never comes.
    for (name, tier, batch) in [("ana", 0u64, 0u64), ("ben", 1, 0), ("cal", 1, 0), ("dan", 0, 1)] {
        let mut p = born(&site, &seed, name).await;
        // The payer's own pointer, where a refund comes back to.
        let own = PayeePointer { payee: p.id, version: 1, previous: None, rails: lightning(payer_node) };
        let own_act = p.act(money_spec(), money::types::PAYEE_POINTER, Payload::PayeePointer(own.clone()).to_map(), None, None);
        put(&site, &own_act).await;
        pointers.push((own_act.id(), own));
        // The payer reads the service's publication and price tag from the
        // home; the core's Agreements view says the publication counts and
        // the tag counts under it.
        let rd = read(&site, &[svc.id]).await;
        // The tier's own tag (draft 7): what the payment fulfils, and the offer read with it.
        let tag_act = &tag_acts[tier as usize];
        let o = offer_in(&rd, &offer_act.id(), &tag_act.id(), &svc.id);
        // The act it anchors, and a random blind: the service sees only the leaf.
        let act = p.post(&format!("{name}'s act, to be anchored"));
        put(&site, &act).await;
        let blind = random::<32>();
        let leaf = tree::leaf(&act.id(), &blind);
        let price = o.price(tier, None).unwrap();
        // The payment pays the price tag (F225; Money rule 18), at the
        // tier's price, to the service's flow.
        let paid_to = PaidTo::Flow { pointer: pointer_act.id(), rail: 0 };
        let commitment = Commitment { rail: mor_lightning::spec(), payee: svc.id, amount: price, fulfils: tag_act.id(), payer: Some(Payer::Identity(p.id)), paid_to, salt: random::<16>(), purchase: None };
        // The service's endpoint hands back the ticket, an act it signs
        // under the publication.
        let ticket = Ticket { offer: offer_act.id(), leaf, commitment: commitment.hash(), tier, batch, deadline: now + o.terms.tiers[tier as usize].blocks, quote: None };
        let ticket_act = svc.act(mor_anchoring::spec(), service::TICKET, ticket.to_map(), under_offer.clone(), None);
        // The payer's client checks the ticket before paying.
        let mut rd = read(&site, &[svc.id]).await;
        rd.add_act(&ticket_act);
        assert_eq!(Ticket::from_map(&payload(&rd, &ticket_act.id())), Some(ticket.clone()), "a ticket the service signed");
        service::acceptable(&o, &ticket, &commitment, node.rpc.block_count().await.unwrap(), None).expect("the payer's client accepts the ticket");
        // Paid, settled; the payer's claim.
        let proof = ln.pay(Side::Service, price.value, &commitment.hash()).await;
        let claim = claim_of(&commitment, &proof);
        assert_eq!(verify(Record::Claim(&claim, p.id, &Citations::default()), &Pointers(pointers.clone()), &modules).answer, Answer::Valid);
        let claim_act = p.act(money_spec(), money::types::CLAIM, Payload::Claim(claim).to_map(), None, None);
        put(&site, &claim_act).await;
        // Visible custody: the service puts the ticket on its home, and its
        // receipt of the payment, the same rail proof (Money rule 10).
        put(&site, &ticket_act).await;
        let receipt_act = svc.act(money_spec(), money::types::RECEIPT, Payload::Receipt(receipt_of(&commitment, &proof)).to_map(), None, None);
        put(&site, &receipt_act).await;
        eprintln!("{name} pays {} satoshis over Lightning, paying its tier's price tag, for one hash (tier {tier}, batch {batch}, by block {})", price.value, ticket.deadline);
        buyers.push(Buyer { name, p, act: act.id(), blind, pointer: own_act.id(), commitment, claim: claim_act, ticket_act, ticket });
    }

    // ------------------------------------------------ batch 0, anchored by pay-to-contract
    let leaves = vec![buyers[0].ticket.leaf, buyers[1].ticket.leaf];
    let batch = Batch::new(leaves.clone()).unwrap();
    let out = mor_onchain::tx::taproot_script(&mor_onchain::p2c::pay_to_contract(&pool_key, None, &batch.root()).unwrap());
    // The service puts 10,000 of its own coins into the pool: a payment to
    // its own pointer's on-chain rail, shown by its receipt.
    let (deposit, deposit_script) = pool.to_itself(svc.id, pointer_act.id(), 10_000);
    let t0 = coins.pay(&deposit_script, 10_000);
    let t0id = node.rpc.send(&consensus::serialize(&t0)).await.expect("the node takes the deposit");
    node.rpc.generate(1).await.unwrap();
    // The batch's transaction spends that coin: the batch's 330-satoshi
    // output, its change back to the service's own pointer (a receipt
    // again), and a fee of 1,000 to the miners, the rest.
    let (change, change_script) = pool.to_itself(svc.id, pointer_act.id(), 10_000 - 330 - 1_000);
    let t = pool.spend(&deposit, OutPoint { txid: Txid::from_byte_array(t0id), vout: 0 }, 10_000, &[(out.clone(), 330), (change_script, change.amount.value)]);
    let txid = node.rpc.send(&consensus::serialize(&t)).await.expect("the node takes the batch's transaction");
    node.rpc.generate(1).await.unwrap();
    let publication = Publication { offer: offer_act.id(), batch: 0, leaves, tx: txid, output: 0 };
    let pub_act = svc.act(mor_anchoring::spec(), service::BATCH_NOTICE, publication.to_map(), under_offer.clone(), None);
    put(&site, &pub_act).await;
    node.rpc.generate(CONFIRMATIONS as u64 - 1).await.unwrap();
    for (c, raw, output) in [(&deposit, stripped(&t0), 0u64), (&change, stripped(&t), 1)] {
        let rail = node.rpc.proof(pool.request(c), &raw, output).await.expect("a proof from the node");
        let r = Receipt { rail: c.rail, proof: Proof { paid_to: c.paid_to, salt: c.salt, rail: rail.encode() }.encode(), payer: c.payer.clone(), payee: c.payee, amount: c.amount, fulfils: c.fulfils, previous: None, forward: None, batch: None, purchase: None };
        put(&site, &svc.act(money_spec(), money::types::RECEIPT, Payload::Receipt(r).to_map(), None, None)).await;
    }
    eprintln!("batch 0 anchored: two leaves, one output of 330 satoshis to the service's key tweaked by the root, no OP_RETURN, funded by a coin the service paid itself and paying its change back to itself, each shown by its receipt; its batch notice signed under the publication and on the home");

    // ------------------------------------------------ anyone verifies, from the chain and the acts
    let mut who = vec![svc.id];
    who.extend(buyers.iter().map(|b| b.p.id));
    let mut eve = read(&site, &who).await;
    for b in &buyers {
        eve.add_act(&b.ticket_act);
    }
    let offer = offer_in(&eve, &offer_act.id(), &tag_acts[0].id(), &svc.id);
    let ids: Vec<Hash> = eve.v.signed_by(&svc.id).filter(|a| a.inside.spec == mor_anchoring::spec() && a.inside.type_ == service::BATCH_NOTICE).map(|a| a.id).collect();
    let published: Vec<Publication> = ids.iter().map(|id| Publication::from_map(&payload(&eve, id)).unwrap()).collect();
    assert_eq!(published, vec![publication.clone()]);
    // What an Agreements client states of each claim it checked: the rail's answer.
    let held = Pointers(pointers.clone());
    let mut rail_valid: BTreeMap<Hash, PaidAt> = BTreeMap::new();
    let mut payments: BTreeMap<Vec<u8>, Vec<u8>> = BTreeMap::new();
    let claim_in = |rd: &Reader, id: &Hash| match Payload::decode(money::types::CLAIM, &payload(rd, id)) {
        Ok(Payload::Claim(c)) => c,
        _ => panic!("a claim"),
    };
    for b in &buyers {
        state(&mut rail_valid, &mut payments, &held, &modules, b.claim.id(), &claim_in(&eve, &b.claim.id()), b.p.id);
    }
    {
        let mut v = AgreementsView::new(&eve.v, mirs());
        v.rail_valid = rail_valid.clone();
        for b in &buyers {
            assert_eq!(v.purchase(&b.claim.id()).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase, "{}: a purchase under the publication, by its price tag (Agreements rule 12, F225)", b.name);
        }
    }
    let chain = node.rpc.chain(Network::Regtest).await.expect("the node's headers");
    let block = node.rpc.proof([0; 64], &stripped(&t), 0).await.unwrap().paid.unwrap().block.expect("mined");
    let height = node.rpc.block_count().await.unwrap() - CONFIRMATIONS as u64 + 1;
    let anchor_of = |i: u64, blind: [u8; 32]| BatchAnchor { blind, index: i, count: batch.count(), branch: batch.branch(i).unwrap(), key: pool_key, tree: None, tx: stripped(&t), output: 0, block: Some(block.clone()) };
    let bitcoin = BitcoinClock { chain: &chain };
    let pay_of = |b: &Buyer| Payment { commitment: b.commitment.clone(), answer: verify(Record::Claim(&claim_in(&eve, &b.claim.id()), b.p.id, &Citations::default()), &held, &modules).answer };
    for (i, b) in buyers.iter().take(2).enumerate() {
        let leaf_anchor = anchor_of(i as u64, [0; 32]).encode();
        assert_eq!(service::judge(&offer, &b.ticket, &pay_of(b), &published, Some(&leaf_anchor), &bitcoin), Judgment::Anchored { point: height }, "{}", b.name);
        // The payer, holding the act and the blind, anchors the act itself.
        let mut anchors = Anchors::new();
        assert!(anchors.add_proof(&bitcoin, &clock::reference(Network::Regtest), &b.act, &anchor_of(i as u64, b.blind).encode()));
        eprintln!("{}: inclusion verified from the chain the node follows; the act is anchored at block {height}", b.name);
    }

    // ------------------------------------------------ Cal: a provable omission; Dan: a default
    let cal = &buyers[2];
    let Judgment::Omitted { refund: cal_refund } = service::judge(&offer, &cal.ticket, &pay_of(cal), &published, None, &bitcoin) else { panic!("cal's leaf omitted") };
    assert_eq!(cal_refund.amount, sat(20));
    eprintln!("cal: batch 0 published without cal's leaf; the ticket and the batch notice, both signed by the service under its publication, show the omission: 20 owed back under the publication's terms");
    let dan = &buyers[3];
    let deadline_buried = dan.ticket.deadline + CONFIRMATIONS as u64 - 1;
    if chain.tip() < deadline_buried {
        assert_eq!(service::judge(&offer, &dan.ticket, &pay_of(dan), &published, None, &bitcoin), Judgment::Pending);
        node.rpc.generate(deadline_buried - chain.tip()).await.unwrap();
    }
    let chain = node.rpc.chain(Network::Regtest).await.unwrap();
    let bitcoin = BitcoinClock { chain: &chain };
    let Judgment::Default { refund: dan_refund } = service::judge(&offer, &dan.ticket, &pay_of(dan), &published, None, &bitcoin) else { panic!("dan's batch never came") };
    assert_eq!(dan_refund.amount, sat(50));
    eprintln!("dan: batch 1 never published nor anchored; block {} buried six deep: a default, 50 owed back under the publication's terms", dan.ticket.deadline);

    // ------------------------------------------------ the refunds, paid for real
    ln.refund_liquidity().await;
    let mut refund_claims = vec![];
    for (b, r) in [(cal, &cal_refund), (dan, &dan_refund)] {
        let shown = |rv: &BTreeMap<Hash, PaidAt>, pm: &BTreeMap<Vec<u8>, Vec<u8>>, rd: &Reader| {
            let mut v = AgreementsView::new(&rd.v, mirs());
            v.rail_valid = rv.clone();
            v.payments = pm.clone();
            v.refund_repaid(&b.claim.id(), &r.to, &r.amount.unit).unwrap()
        };
        assert_eq!(service::standing(r, shown(&rail_valid, &payments, &eve), &bitcoin), Standing::Owed { left: r.amount.value });
        // The service pays the price back to the payer's own pointer,
        // naming the payment refunded (the payer's claim).
        let back = Commitment { rail: mor_lightning::spec(), payee: b.p.id, amount: r.amount, fulfils: b.claim.id(), payer: Some(Payer::Identity(svc.id)), paid_to: PaidTo::Flow { pointer: b.pointer, rail: 0 }, salt: random::<16>(), purchase: None };
        let proof = ln.pay(Side::Payer, r.amount.value, &back.hash()).await;
        let c = claim_of(&back, &proof);
        let act = svc.act(money_spec(), money::types::CLAIM, Payload::Claim(c).to_map(), None, None);
        put(&site, &act).await;
        refund_claims.push((act.id(), b, r));
    }
    let eve = read(&site, &who).await;
    for (id, _, _) in &refund_claims {
        state(&mut rail_valid, &mut payments, &held, &modules, *id, &claim_in(&eve, id), svc.id);
    }
    let mut v = AgreementsView::new(&eve.v, mirs());
    v.rail_valid = rail_valid.clone();
    v.payments = payments.clone();
    for (_, b, r) in &refund_claims {
        let repaid = v.refund_repaid(&b.claim.id(), &r.to, &r.amount.unit).unwrap();
        assert_eq!(service::standing(r, repaid, &bitcoin), Standing::Repaid, "{}", b.name);
        eprintln!("{}: {} satoshis paid back over Lightning to {}'s own pointer; the service's claim names the payment refunded, with the rail's proof: shown repaid", b.name, repaid, b.name);
    }

    // ------------------------------------------------ the pool as visible custody
    // A third party reads what the service put on its home: its tickets,
    // its receipts (the payments in, and the pool's coins), its
    // publications; Money's view of what was paid back. It follows batch
    // 0's money from the payers' payments to the transaction anchoring it.
    let chain = node.rpc.chain(Network::Regtest).await.unwrap();
    let onchain = Onchain::on(&chain);
    let both = Modules::new().adopt(&lnm).adopt(&onchain);
    let mine = |t: u64| eve.v.signed_by(&svc.id).filter(move |a| a.inside.type_ == t).map(|a| a.id).collect::<Vec<Hash>>();
    let tickets: Vec<Ticket> = eve.v.signed_by(&svc.id).filter(|a| a.inside.spec == mor_anchoring::spec() && a.inside.type_ == service::TICKET).map(|a| Ticket::from_map(&payload(&eve, &a.id)).unwrap()).collect();
    assert_eq!(tickets.len(), 4, "the four tickets, on the home");
    let receipts: Vec<(Hash, Receipt)> = mine(money::types::RECEIPT)
        .into_iter()
        .filter(|id| eve.v.get(id).unwrap().inside.spec == money_spec())
        .map(|id| match Payload::decode(money::types::RECEIPT, &payload(&eve, &id)) {
            Ok(Payload::Receipt(r)) => (id, r),
            _ => panic!("a receipt"),
        })
        .collect();
    for (_, r) in &receipts {
        assert_eq!(verify(Record::Receipt(r), &held, &both).answer, Answer::Valid, "each of the service's receipts verifies");
    }
    let unit = mor_onchain::unit(Network::Regtest);
    let sold: Vec<Sold> = tickets
        .iter()
        .map(|t| {
            let (id, r) = receipts.iter().find(|(_, r)| commitment_of(r).hash() == t.commitment).expect("a receipt of each ticket's payment");
            let b = buyers.iter().find(|b| b.ticket == *t).unwrap();
            Sold { ticket: t.clone(), payment: Payment { commitment: commitment_of(r), answer: verify(Record::Receipt(r), &held, &both).answer }, shown_by: *id, repaid: v.refund_repaid(&b.claim.id(), &RefundTo::Identity(b.p.id), &unit).unwrap() }
        })
        .collect();
    let pool_coins: Vec<(Hash, OnchainProof, u64)> = receipts
        .iter()
        .filter(|(_, r)| r.rail == mor_onchain::spec() && r.payee == svc.id)
        .map(|(id, r)| (*id, OnchainProof::decode(&Proof::decode(&r.proof).unwrap().rail).unwrap(), r.amount.value))
        .collect();
    let coins_shown: Vec<Coin> = pool_coins.iter().map(|(id, p, a)| Coin { shown_by: *id, payment: p.payment().unwrap(), amount: *a }).collect();
    let txs: Vec<Vec<u8>> = pool_coins.iter().map(|(_, p, _)| p.paid.as_ref().unwrap().tx.clone()).collect();
    let account = custody::follow(&offer, &sold, &published, &txs, &coins_shown, &BitcoinClock { chain: &chain });
    let l0 = &account.lines[0];
    assert_eq!((l0.batch, l0.paid_in(), l0.paid_back), (0, 90, 20), "batch 0: Ana 50, Ben 20, Cal 20 in; Cal's 20 paid back");
    let Anchoring::Shown { tx, spent, output, change: back, elsewhere, fee } = &l0.anchoring else { panic!("batch 0's money followed: {:?}", l0.anchoring) };
    assert_eq!((*tx, spent.len(), *output, back.len(), elsewhere.is_empty(), *fee), (publication.tx, 1, 330, 1, true, 1_000));
    assert_eq!((spent[0].1, back[0].1), (10_000, 8_670));
    assert_eq!(l0.kept(), Some(90 - 20 - 1_330), "the batch cost more than it brought in: the service's loss, shown");
    let l1 = &account.lines[1];
    assert_eq!((l1.batch, l1.paid_in(), l1.paid_back, &l1.anchoring, l1.kept()), (1, 50, 50, &Anchoring::NotPublished, Some(0)));
    assert_eq!(account.unspent(), 8_670, "the pool holds batch 0's change on the chain");
    eprintln!("custody, batch 0: {} in over Lightning (each payment shown by the service's receipt), {} paid back; its transaction spent a coin of {} (a receipt), paid the batch's output {} and change {} back (a receipt): fee {}; kept {}, a loss the service bears", l0.paid_in(), l0.paid_back, spent[0].1, output, back[0].1, fee, l0.kept().unwrap());
    eprintln!("custody, batch 1: {} in, {} paid back, never published: kept {}; the pool holds {} on the chain", l1.paid_in(), l1.paid_back, l1.kept().unwrap(), account.unspent());

    // The tickets and the batch notice are acts the service signed under
    // the publication; each counts for a reader.
    for b in &buyers {
        let mut rd = read(&site, &[svc.id, b.p.id]).await;
        rd.add_act(&b.ticket_act);
        assert_eq!(rd.status(&b.claim.id()), Status::Valid);
        assert_eq!(rd.status(&b.ticket_act.id()), Status::Valid);
    }
    drop(node);
}
