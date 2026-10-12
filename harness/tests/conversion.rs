//! The conversion cMIP, draft 1 (`cmips/cmip-conversion-draft-1.md`), end
//! to end on regtest: a rail swap sold as a proven offer, with receipts per
//! hop. Freeze suite, scenario 2, steps 4 and 4b, for the route.
//!
//! A conversion service publishes a standing offer (Agreements type 6, a
//! lone seller's) selling the conversion cMIP's terms: Lightning in,
//! Bitcoin regtest out, 1:1, a fee of 500, within 6 blocks. Ana pays it
//! 30,000 over Lightning to have 29,500 paid on the chain to the owners'
//! split service. Before Ana pays, the service signs an order under the
//! offer binding that forward; Ana's client checks it. The service receipts
//! Ana's payment declaring the forward, pays it on the chain from its own
//! coins, and the owners' receipt names the service's. A third party reads
//! the home: every receipt verifies on its rail, the route reads as one
//! chain of receipts (Money rule 24), and the core, asking the conversion
//! cMIP's checker, says the delivery is proven (Agreements rule 11, F261).
//!
//! **Step 4b:** Ben pays 20,000 the same way; the service receipts it,
//! declaring the forward, and forwards nothing. Once the order's deadline
//! is buried six blocks deep, the forward is the service's open obligation
//! under its offer (Money rule 27), and the route stops at the service's
//! receipt, naming that hop and its agreement (rule 28).
//!
//! It starts one btcd node on regtest itself, from the btcd release in
//! `MOR_BTCD` (a directory holding `btcd`):
//!
//!   MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test conversion -- --nocapture
//!
//! **With `MOR_LN_REGTEST` also set** (the regtest Lightning network of
//! `modules/lightning/regtest/up.sh`), the first hops move over real lnd
//! nodes: the service's node is bob, the payers pay from alice, each
//! invoice issued by bob. The Lightning network runs on its own regtest
//! chain, beside the on-chain hop's (two regtest chains, both test coins).
//! Without it, each invoice is a real BOLT 11 invoice signed by a test node
//! key and settled by its preimage, and no node moves money.
//!
//! Without `MOR_BTCD` it says so and passes without running. Test
//! identities and regtest coins only.

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::key::Keypair;
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use bitcoin::sighash::{EcdsaSighashType, SighashCache};
use bitcoin::{absolute, consensus, transaction, Address, CompressedPublicKey, OutPoint, ScriptBuf, Sequence, Transaction, TxIn, TxOut, Txid, Witness};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_conversion::route::{self, Route};
use mor_conversion::{Checker, Hop, Judgment, Offer, Order, Owed, Payment, Rate, Terms};
use mor_core::act::{Act, Object};
use mor_core::agreements::{self, AgreementsView, Mips, ProofChecker, ProofVerdict};
use mor_core::chain::Status;
use mor_core::hash::{sha256, Hash};
use mor_core::money::{self, Amount, Citations, Claim, PaidAt, PayeePointer, Payer, Payload, Rail, Receipt, VaultEntry};
use mor_harness::net::{Http, Site};
use mor_harness::person::Person;
use mor_harness::reader::Reader;
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::lnd::Lnd;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::btcd::{Btcd, Node};
use mor_onchain::chain::HeaderChain;
use mor_onchain::clock::{self, BitcoinClock};
use mor_onchain::{Network, Onchain, OnchainAddress, CONFIRMATIONS};
use mor_payment::{paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use mor_relay::operator::random;
use mor_relay::{Policy, Role};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::Duration;

fn money_spec() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
}

fn mips() -> Mips {
    Mips {
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

/// The pointers the payment cMIP asks for.
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

/// The Lightning rail as this test runs it: real lnd nodes where
/// `MOR_LN_REGTEST` is set (bob the service's, alice the payers'),
/// otherwise a test node key signing real invoices.
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

    fn test_key() -> SecretKey {
        secret("the conversion service's Lightning node, a test key")
    }

    /// The node key the service's pointer names.
    async fn service_node(&self) -> [u8; 33] {
        match self {
            Ln::Nodes { bob, .. } => bob.node_key().await.unwrap(),
            Ln::Keys => PublicKey::from_secret_key(&Secp256k1::new(), &Ln::test_key()).serialize(),
        }
    }

    /// Pay `sat` to the service, the invoice committing to `commitment`,
    /// issued by the service's node: the proof, settled.
    async fn pay(&self, sat: u64, commitment: &Hash) -> LnProof {
        match self {
            Ln::Nodes { alice, bob } => {
                let (invoice, _) = bob.add_invoice(sat, commitment).await.expect("an invoice from the service's node");
                let preimage = alice.pay(&invoice).await.expect("paid over a real channel");
                LnProof { invoice, preimage: Some(preimage) }
            }
            Ln::Keys => {
                let preimage = random::<32>();
                LnProof { invoice: invoice(&Ln::test_key(), sat * 1000, commitment, &preimage), preimage: Some(preimage) }
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

// ---------------------------------------------------------------- the service's coins, and the owners' address

/// The conversion service's own coins on the chain: a regtest P2WPKH key
/// the node mines to. It pays each forward from them.
struct Coins {
    sk: SecretKey,
    script: ScriptBuf,
    unspent: Vec<(OutPoint, u64)>,
}

impl Coins {
    fn new() -> Coins {
        let sk = secret("the conversion service's coins, regtest only");
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

/// The owners' split service's on-chain rail: its key and request key.
struct OwnersKeys {
    key: SecretKey,
    request: SecretKey,
}

impl OwnersKeys {
    fn new() -> OwnersKeys {
        OwnersKeys { key: secret("the owners' split service's on-chain key, regtest only"), request: secret("the owners' split service's request key, regtest only") }
    }
    fn address(&self) -> OnchainAddress {
        let x = |sk: &SecretKey| Keypair::from_secret_key(&Secp256k1::new(), sk).x_only_public_key().0.serialize();
        OnchainAddress { network: Network::Regtest, key: x(&self.key), request: x(&self.request), tree: None, endpoint: Some("in-process, for this test".into()) }
    }
    /// The owners' side's request for a payment to them.
    fn request(&self, c: &Commitment) -> [u8; 64] {
        let kp = Keypair::from_secret_key(&Secp256k1::new(), &self.request);
        Secp256k1::new().sign_schnorr_with_aux_rand(&Message::from_digest(mor_onchain::p2c::request_message(&c.hash())), &kp, &random::<32>()).serialize()
    }
}

fn btcd_dir() -> Option<PathBuf> {
    std::env::var("MOR_BTCD").ok().map(PathBuf::from)
}

fn receipt_in(rd: &Reader, id: &Hash) -> Receipt {
    match Payload::decode(money::types::RECEIPT, &payload(rd, id)) {
        Ok(Payload::Receipt(r)) => r,
        _ => panic!("a receipt"),
    }
}

/// A receipt as a third party holds it: checked as an act by its reader,
/// the acts its `objects` name, and the rail's answer.
fn hop(rd: &Reader, id: &Hash, held: &Pointers, modules: &Modules) -> Hop {
    let r = receipt_in(rd, id);
    let objects = Citations::of(&rd.v.get(id).unwrap().inside).objects.unwrap_or_default().iter().flat_map(|o| [o.chain, o.predecessor]).collect();
    let answer = verify(Record::Receipt(&r), held, modules).answer;
    Hop { id: *id, receipt: r, objects, answer }
}

/// One conversion bought: the payer, the order act, the payment, the
/// service's receipt act.
struct Bought {
    name: &'static str,
    payer: Hash,
    order_act: Act,
    order: Order,
    commitment: Commitment,
    claim: Act,
    receipt: Act,
}

#[tokio::test(flavor = "multi_thread")]
async fn a_rail_swap_lightning_in_onchain_out_through_a_conversion_service_on_regtest() {
    let Some(bin) = btcd_dir() else {
        eprintln!("MOR_BTCD is not set: the regtest conversion test did not run (see modules/onchain/README.md)");
        return;
    };
    let ln = Ln::from_env();
    eprintln!("{}", if ln.real() { "Lightning: real lnd nodes (MOR_LN_REGTEST): bob the service's node, alice the payers'" } else { "Lightning: a test node key signs real invoices; no node moves money (MOR_LN_REGTEST not set)" });
    let run = std::env::temp_dir().join(format!("mor-conversion-regtest-{}", std::process::id()));
    let mut coins = Coins::new();
    let node = Node::start(&bin, &run.join("a"), 28576, 28577, &coins.address()).await.expect("a btcd node");
    // Taproot activates on btcd's regtest only after a few hundred blocks.
    node.rpc.generate(500).await.unwrap();
    coins.scan(&node.rpc).await;

    let http = Http::new(None);
    let site = Site::start("conversion", "home", Role::Home, Policy::Open, &http).await;
    let seed = random::<32>();

    // ------------------------------------------------ the conversion service, the owners, their pointers
    let mut svc = born(&site, &seed, "the conversion service").await;
    let lightning = Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node: ln.service_node().await, endpoint: Some("in-process, for this test".into()) }.encode() };
    let svc_pointer = PayeePointer { payee: svc.id, version: 1, previous: None, rails: vec![lightning] };
    let svc_pointer_act = svc.act(money_spec(), money::types::PAYEE_POINTER, Payload::PayeePointer(svc_pointer.clone()).to_map(), None, None);
    put(&site, &svc_pointer_act).await;
    let mut owners = born(&site, &seed, "the owners' split service").await;
    let owners_keys = OwnersKeys::new();
    let owners_pointer = PayeePointer { payee: owners.id, version: 1, previous: None, rails: vec![Rail { module: mor_onchain::spec(), address: owners_keys.address().encode() }] };
    let owners_pointer_act = owners.act(money_spec(), money::types::PAYEE_POINTER, Payload::PayeePointer(owners_pointer.clone()).to_map(), None, None);
    put(&site, &owners_pointer_act).await;
    let held = Pointers(vec![(svc_pointer_act.id(), svc_pointer.clone()), (owners_pointer_act.id(), owners_pointer.clone())]);

    // ------------------------------------------------ its standing offer: a rail swap, a proven offer
    let terms = Terms { out_rail: mor_onchain::spec(), out_unit: mor_onchain::unit(Network::Regtest), rate: Rate::Fixed { num: 1, den: 1 }, fee: 500, blocks: 6 };
    let standing = terms.standing_offer(sat(100_000), &clock::reference(Network::Regtest), Some("Lightning in, Bitcoin regtest out, 1:1, a fee of 500, paid on within 6 blocks of the order. Regtest only.".into()));
    let offer_act = svc.act(mips().agreements, agreements::types::STANDING_OFFER, standing.to_map(), None, None);
    put(&site, &offer_act).await;
    let under_offer = Some(vec![Object { chain: offer_act.id(), predecessor: offer_act.id() }]);
    eprintln!("the conversion service publishes its pointer (Lightning) and its standing offer (Agreements type 6, a lone seller's): Lightning in, regtest coins out, 1:1, a fee of 500, within 6 blocks");

    // ------------------------------------------------ Ana and Ben each buy a conversion
    let lnm = Lightning;
    let ln_only = Modules::new().adopt(&lnm);
    let mut bought = vec![];
    for (name, paid) in [("ana", 30_000u64), ("ben", 20_000)] {
        let mut p = born(&site, &seed, name).await;
        // The payer reads the offer from the home; the core says it counts,
        // and that it is a proven offer, by its form.
        let rd = read(&site, &[svc.id]).await;
        assert!(AgreementsView::new(&rd.v, mips()).offer(&offer_act.id()).unwrap().counts, "the standing offer counts");
        let lo = agreements::Offer::decode(&rd.v.get(&offer_act.id()).unwrap().inside).expect("an offer in Agreements' format").offer;
        assert!(matches!(lo.sold[0].class(), agreements::OfferClass::Proven { cmip, .. } if cmip == mor_conversion::spec()), "a proven offer, the access form");
        let o = Offer::read(offer_act.id(), svc.id, &lo).expect("a conversion offer");
        // The payment follows the offer, to the service's flow.
        let commitment = Commitment { rail: mor_lightning::spec(), payee: svc.id, amount: sat(paid), fulfils: offer_act.id(), payer: Some(Payer::Identity(p.id)), paid_to: PaidTo::Flow { pointer: svc_pointer_act.id(), rail: 0 }, salt: random::<16>(), purchase: None };
        // The service's endpoint hands back the order, an act it signs
        // under the offer: the forward to the owners, following their
        // pointer, by a deadline.
        let now = node.rpc.block_count().await.unwrap();
        let forward = money::Forward { next_payee: owners.id, amount: o.out(&commitment.amount, None).unwrap(), agreement: offer_act.id() };
        let order = Order { offer: offer_act.id(), commitment: commitment.hash(), forward, onward: owners_pointer_act.id(), deadline: now + terms.blocks, quote: None };
        let order_act = svc.act(mor_conversion::spec(), mor_conversion::ORDER, order.to_map(), under_offer.clone(), None);
        put(&site, &order_act).await;
        // The payer's client checks the order before paying.
        let rd = read(&site, &[svc.id]).await;
        assert_eq!(Order::from_map(&payload(&rd, &order_act.id())), Some(order.clone()), "an order the service signed");
        mor_conversion::acceptable(&o, &order, &commitment, node.rpc.block_count().await.unwrap()).expect("the payer's client accepts the order");
        assert_eq!((order.forward.next_payee, order.onward), (owners.id, owners_pointer_act.id()), "the forward the payer asked for");
        // Paid over Lightning, settled; the payer's claim.
        let proof = ln.pay(paid, &commitment.hash()).await;
        let rail = Proof { paid_to: commitment.paid_to, salt: commitment.salt, rail: proof.encode() }.encode();
        let claim = Claim { rail: commitment.rail, proof: rail.clone(), payee: svc.id, amount: commitment.amount, fulfils: offer_act.id(), disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        assert_eq!(verify(Record::Claim(&claim, p.id, &Citations::default()), &held, &ln_only).answer, Answer::Valid);
        let claim_act = p.act(money_spec(), money::types::CLAIM, Payload::Claim(claim).to_map(), None, None);
        put(&site, &claim_act).await;
        // The service's receipt of the first hop, declaring the forward its
        // order promised (Money receipt field 7).
        let r = Receipt { rail: commitment.rail, proof: rail, payer: commitment.payer.clone(), payee: svc.id, amount: commitment.amount, fulfils: offer_act.id(), previous: None, forward: Some(order.forward.clone()), batch: None, purchase: None };
        let receipt_act = svc.act(money_spec(), money::types::RECEIPT, Payload::Receipt(r).to_map(), None, None);
        put(&site, &receipt_act).await;
        eprintln!("{name} pays {paid} over Lightning to the conversion service, following its offer; the service's receipt declares the forward of its order: {} on the chain to the owners' split service, by block {}", order.forward.amount.value, order.deadline);
        bought.push(Bought { name, payer: p.id, order_act, order, commitment, claim: claim_act, receipt: receipt_act });
    }

    // ------------------------------------------------ Ana's forward, paid on the chain
    let ana = &bought[0];
    let onward = Commitment { rail: mor_onchain::spec(), payee: owners.id, amount: ana.order.forward.amount, fulfils: ana.order.onward, payer: Some(Payer::Identity(svc.id)), paid_to: PaidTo::Flow { pointer: owners_pointer_act.id(), rail: 0 }, salt: random::<16>(), purchase: None };
    let script = owners_keys.address().script(&onward.hash()).unwrap();
    let t = coins.pay(&script, onward.amount.value);
    node.rpc.send(&consensus::serialize(&t)).await.expect("the node takes the onward payment");
    node.rpc.generate(CONFIRMATIONS as u64).await.unwrap();
    let rail = node.rpc.proof(owners_keys.request(&onward), &stripped(&t), 0).await.expect("a proof from the node");
    // The owners' receipt names the service's receipt of Ana's payment, in
    // field 6 and in its `objects`: a route is a chain (Money, "Settlement
    // receipt").
    let r = Receipt { rail: onward.rail, proof: Proof { paid_to: onward.paid_to, salt: onward.salt, rail: rail.encode() }.encode(), payer: onward.payer.clone(), payee: owners.id, amount: onward.amount, fulfils: onward.fulfils, previous: Some(ana.receipt.id()), forward: None, batch: None, purchase: None };
    let onward_act = owners.act(money_spec(), money::types::RECEIPT, Payload::Receipt(r).to_map(), Some(vec![Object { chain: ana.receipt.id(), predecessor: ana.receipt.id() }]), None);
    put(&site, &onward_act).await;
    eprintln!("the service pays {} on the chain from its own coins to the owners' split service; six blocks later the owners' receipt names the service's receipt of ana's payment", onward.amount.value);

    // ------------------------------------------------ a third party reads the route
    let who = vec![svc.id, owners.id, bought[0].payer, bought[1].payer];
    let eve = read(&site, &who).await;
    let chain = node.rpc.chain(Network::Regtest).await.expect("the node's headers");
    let onchain = Onchain::on(&chain);
    let both = Modules::new().adopt(&lnm).adopt(&onchain);
    let receipts: Vec<Hop> = eve
        .v
        .signed_by(&svc.id)
        .chain(eve.v.signed_by(&owners.id))
        .filter(|a| a.inside.spec == money_spec() && a.inside.type_ == money::types::RECEIPT)
        .map(|a| hop(&eve, &a.id, &held, &both))
        .collect();
    assert_eq!(receipts.len(), 3, "the service's two receipts and the owners' one, on the home");
    for x in &receipts {
        assert_eq!(x.answer, Answer::Valid, "each receipt verifies on its rail: Lightning, or the chain the node follows");
    }
    assert_eq!(route::ending_at(&onward_act.id(), &receipts), Route::Complete { hops: vec![ana.receipt.id(), onward_act.id()] }, "one chain of receipts (Money rule 24)");
    eprintln!("a third party reads the home: every receipt verifies on its rail, and the route from ana's Lightning payment to the owners' coins reads as one chain of receipts (Money rule 24)");
    let lo = agreements::Offer::decode(&eve.v.get(&offer_act.id()).unwrap().inside).unwrap().offer;
    let offer = Offer::read(offer_act.id(), svc.id, &lo).unwrap();
    let orders: Vec<(Hash, Order)> = eve.v.signed_by(&svc.id).filter(|a| a.inside.spec == mor_conversion::spec() && a.inside.type_ == mor_conversion::ORDER).map(|a| (a.id, Order::from_map(&payload(&eve, &a.id)).unwrap())).collect();
    assert_eq!(orders.len(), 2);
    let claim_in = |id: &Hash| match Payload::decode(money::types::CLAIM, &payload(&eve, id)) {
        Ok(Payload::Claim(c)) => c,
        _ => panic!("a claim"),
    };
    let payments: Vec<Payment> = bought.iter().map(|b| Payment { commitment: b.commitment.clone(), answer: verify(Record::Claim(&claim_in(&b.claim.id()), b.payer, &Citations::default()), &held, &both).answer }).collect();
    let bitcoin = BitcoinClock { chain: &chain };
    let first = receipts.iter().find(|x| x.id == ana.receipt.id());
    let at = node.rpc.block_count().await.unwrap() - CONFIRMATIONS as u64 + 1;
    assert_eq!(mor_conversion::judge(&offer, &ana.order_act.id(), &ana.order, &payments[0], first, &receipts, &bitcoin, &held), Judgment::Delivered { point: at, onward: onward_act.id() });
    // The core asks the conversion cMIP's checker (Agreements rule 11,
    // F261); a payment following the offer is a purchase accepted under its
    // terms (F215).
    let mut rail_valid: BTreeMap<Hash, PaidAt> = BTreeMap::new();
    for b in &bought {
        rail_valid.insert(b.claim.id(), paid_at(&Record::Claim(&claim_in(&b.claim.id()), b.payer, &Citations::default())).unwrap());
    }
    let verdict = |chain: &HeaderChain, onward: Option<&Hash>, order: &Hash| {
        let clock = BitcoinClock { chain };
        let checker = Checker { offers: vec![offer.clone()], orders: orders.clone(), payments: payments.clone(), hops: receipts.clone(), clock: &clock, held: &held };
        let checkers: [(Hash, &dyn ProofChecker); 1] = [(mor_conversion::spec(), &checker)];
        AgreementsView::new(&eve.v, mips()).proven_delivery(&offer_act.id(), &mor_conversion::delivery_proof(order, onward), &checkers).unwrap()
    };
    assert_eq!(verdict(&chain, Some(&onward_act.id()), &ana.order_act.id()), ProofVerdict::Proven);
    {
        let mut v = AgreementsView::new(&eve.v, mips());
        v.rail_valid = rail_valid.clone();
        for b in &bought {
            assert_eq!(v.purchase(&b.claim.id()).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase, "{}: a purchase accepted under the offer's terms (F215)", b.name);
        }
    }
    eprintln!("ana: the forward placed at block {at}, by the deadline {}: delivered; the core, asking the conversion cMIP's checker, says proven (Agreements rule 11, F261)", ana.order.deadline);

    // ------------------------------------------------ step 4b: Ben's forward, never paid
    let ben = &bought[1];
    let first = receipts.iter().find(|x| x.id == ben.receipt.id());
    let buried = ben.order.deadline + CONFIRMATIONS as u64 - 1;
    if chain.tip() < buried {
        assert_eq!(mor_conversion::judge(&offer, &ben.order_act.id(), &ben.order, &payments[1], first, &receipts, &bitcoin, &held), Judgment::Pending);
        node.rpc.generate(buried - chain.tip()).await.unwrap();
    }
    let chain = node.rpc.chain(Network::Regtest).await.unwrap();
    let bitcoin = BitcoinClock { chain: &chain };
    let owed = Owed { debtor: svc.id, forward: ben.order.forward.clone(), declared_by: ben.receipt.id() };
    assert_eq!(mor_conversion::judge(&offer, &ben.order_act.id(), &ben.order, &payments[1], first, &receipts, &bitcoin, &held), Judgment::Default { owed: owed.clone() });
    assert_eq!(route::from(&ben.receipt.id(), &receipts), Route::Stopped { hops: vec![ben.receipt.id()], owed: owed.clone(), near: vec![] }, "the receipts name the hop that failed and its agreement");
    assert!(matches!(verdict(&chain, None, &ben.order_act.id()), ProofVerdict::NotProven(_)));
    eprintln!("ben: the service receipted ben's payment, declaring a forward of {}, and paid nothing on; block {} buried six deep: the route stops at the service's receipt, and the forward is the service's open obligation under its offer (Money rule 27)", owed.forward.amount.value, ben.order.deadline);

    // Every act counts for a reader.
    for b in &bought {
        let rd = read(&site, &who).await;
        for id in [b.order_act.id(), b.claim.id(), b.receipt.id(), onward_act.id()] {
            assert_eq!(rd.status(&id), Status::Valid);
        }
    }
    drop(node);
}
