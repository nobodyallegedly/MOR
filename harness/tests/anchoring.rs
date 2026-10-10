//! Roadmap step 14a, end to end on regtest: a pooled anchoring service on
//! Bitcoin. Test identities pay the service for hashes over Lightning; the
//! service anchors them in one batch by pay-to-contract (no OP_RETURN) and
//! publishes the batch in a signed act; anyone verifies inclusion from the
//! chain; a hash paid for and left out of its batch is a provable omission;
//! a hash whose batch never comes is a default once its deadline is buried
//! six blocks deep. Each default is a refund owed.
//!
//! The acts (the service's pointer, offer, tickets and publications, the
//! payers' claims and the acts they anchor) are real acts on a throwaway
//! home, read back and checked by a reader. **No Lightning node runs here:**
//! each invoice is a real BOLT 11 invoice signed by a test node key and
//! settled by its preimage, checked by the Lightning rail Module through the
//! payment cMIP, as in `modules/lightning/tests/rule.rs`; the Lightning
//! regtest network of step 12 is not started.
//!
//! It starts one btcd node on regtest itself, from the btcd release in
//! `MOR_BTCD` (a directory holding `btcd`):
//!
//!   MOR_BTCD=/path/to/btcd-dir cargo test -p mor-harness --test anchoring -- --nocapture
//!
//! Without `MOR_BTCD` it says so and passes without running. Test
//! identities and regtest coins only.

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use bitcoin::sighash::{EcdsaSighashType, SighashCache};
use bitcoin::{absolute, consensus, transaction, Address, CompressedPublicKey, OutPoint, ScriptBuf, Sequence, Transaction, TxIn, TxOut, Txid, Witness};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_anchoring::service::{self, Judgment, Offer, Payment, Publication, Ticket, Tier};
use mor_anchoring::tree::{self, Batch};
use mor_core::act::Act;
use mor_core::chain::Status;
use mor_core::envelope::anchoring::Anchors;
use mor_core::finance::{self, Amount, Citations, Claim, PayeePointer, Payer, Payload, Rail, VaultEntry};
use mor_core::hash::{sha256, Hash};
use mor_harness::net::{Http, Site};
use mor_harness::person::Person;
use mor_harness::reader::Reader;
use mor_lightning::bolt11::Network as LnNetwork;
use mor_lightning::{Lightning, LnAddress, LnProof};
use mor_onchain::btcd::{Btcd, Node};
use mor_onchain::clock::{self, BatchAnchor, BitcoinClock};
use mor_onchain::{Network, CONFIRMATIONS};
use mor_payment::{verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use mor_relay::operator::random;
use mor_relay::{Policy, Role};
use std::path::PathBuf;
use std::time::Duration;

fn finance_spec() -> Hash {
    sha256(b"FINANCE, test value until the freeze")
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

/// A reader that has followed `who` on the home and holds its acts.
async fn read(site: &Site, who: &Hash) -> Reader {
    let mut rd = Reader::new(Http::new(None));
    rd.follow(who, &[site.base.clone()]).await;
    for a in site.client.acts_by(who).await.expect("the acts") {
        rd.add(&a);
    }
    rd
}

/// What a reader holds of an act: its payload, if the act counts.
fn payload(rd: &Reader, id: &Hash) -> Vec<(mor_core::cbor::Value, mor_core::cbor::Value)> {
    assert_eq!(rd.status(id), Status::Valid, "the act counts");
    rd.v.get(id).expect("held").inside.payload.clone()
}

/// The service's pointer, as the payment cMIP asks for it.
struct ServiceHeld {
    pointer_id: Hash,
    pointer: PayeePointer,
}

impl Held for ServiceHeld {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        (id == &self.pointer_id).then(|| self.pointer.clone())
    }
    fn vault(&self, _: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        None
    }
    fn obligation(&self, _: &Hash) -> Option<finance::Obligation> {
        None
    }
    fn holding(&self, _: &Hash, _: &Hash) -> Option<finance::Holding> {
        None
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        if payee == &self.pointer.payee {
            vec![(self.pointer_id, self.pointer.clone())]
        } else {
            vec![]
        }
    }
    fn vault_in_force(&self, _: &Hash) -> Option<Vec<VaultEntry>> {
        None
    }
    fn payment_counts(&self, _: &Hash, _: &finance::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }
}

/// A real BOLT 11 invoice signed by the service's node key.
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

/// What a payer holds: the act it anchors, its blind, the payment, the
/// ticket act the service handed it.
struct Payer_ {
    name: &'static str,
    p: Person,
    act: Hash,
    blind: [u8; 32],
    commitment: Commitment,
    claim: Act,
    ticket_act: Act,
    ticket: Ticket,
}

#[tokio::test(flavor = "multi_thread")]
async fn test_identities_pay_for_hashes_and_a_batch_is_anchored_on_regtest() {
    let Some(bin) = btcd_dir() else {
        eprintln!("MOR_BTCD is not set: the regtest anchoring test did not run (see modules/onchain/README.md)");
        return;
    };
    let run = std::env::temp_dir().join(format!("mor-anchoring-regtest-{}", std::process::id()));
    let mut coins = Coins::new();
    let node = Node::start(&bin, &run.join("a"), 28566, 28567, &coins.address()).await.expect("a btcd node");
    // Taproot activates on btcd's regtest only after a few hundred blocks.
    node.rpc.generate(500).await.unwrap();
    coins.scan(&node.rpc).await;

    let http = Http::new(None);
    let site = Site::start("anchoring", "home", Role::Home, Policy::Open, &http).await;
    let seed = random::<32>();

    // ------------------------------------------------ the service: pointer and offer
    let mut svc = born(&site, &seed, "the anchoring service").await;
    let ln_node = secret("the service's Lightning node, a test key");
    let rail = Rail { module: mor_lightning::spec(), address: LnAddress { network: LnNetwork::Regtest, node: PublicKey::from_secret_key(&Secp256k1::new(), &ln_node).serialize(), endpoint: Some("in-process, for this test".into()) }.encode() };
    let pointer = PayeePointer { payee: svc.id, version: 1, previous: None, rails: vec![rail] };
    let pointer_act = svc.act(finance_spec(), finance::types::PAYEE_POINTER, Payload::PayeePointer(pointer.clone()).to_map(), None, None);
    put(&site, &pointer_act).await;
    let tiers = vec![Tier { price: 50, blocks: 2 }, Tier { price: 20, blocks: 6 }, Tier { price: 5, blocks: 144 }];
    let offer = Offer { reference: clock::reference(Network::Regtest), pointer: pointer_act.id(), unit: mor_onchain::unit(Network::Regtest), tiers };
    let offer_act = svc.act(mor_anchoring::spec(), service::OFFER, offer.to_map(), None, None);
    put(&site, &offer_act).await;
    let pool_key_sk = secret("the anchoring service's batch key");
    let pool_key = bitcoin::key::Keypair::from_secret_key(&Secp256k1::new(), &pool_key_sk).x_only_public_key().0.serialize();
    eprintln!("the service publishes its pointer and its offer: tiers of 2, 6 and 144 blocks at 50, 20 and 5 satoshis a hash");

    // ------------------------------------------------ four payers buy one hash each
    let now = node.rpc.block_count().await.unwrap();
    let mut payers = vec![];
    // Ana and Ben: in batch 0; Cal: promised batch 0 and left out; Dan:
    // promised batch 1, which never comes.
    for (name, tier, batch) in [("ana", 0u64, 0u64), ("ben", 1, 0), ("cal", 1, 0), ("dan", 0, 1)] {
        let mut p = born(&site, &seed, name).await;
        // The payer reads the service's offer and pointer from the home.
        let rd = read(&site, &svc.id).await;
        let o = Offer::from_map(&payload(&rd, &offer_act.id())).expect("an offer");
        assert_eq!(o, offer);
        let ptr = match Payload::decode(finance::types::PAYEE_POINTER, &payload(&rd, &pointer_act.id())) {
            Ok(Payload::PayeePointer(x)) => x,
            _ => panic!("a pointer"),
        };
        // The act it anchors, and a random blind: the service sees only the leaf.
        let act = p.post(&format!("{name}'s act, to be anchored"));
        put(&site, &act).await;
        let blind = random::<32>();
        let leaf = tree::leaf(&act.id(), &blind);
        let price = o.price(tier).unwrap();
        let paid_to = PaidTo::Flow { pointer: pointer_act.id(), rail: 0 };
        let salt = random::<16>();
        let commitment = Commitment { rail: mor_lightning::spec(), payee: svc.id, amount: price, fulfils: pointer_act.id(), payer: Some(Payer::Identity(p.id)), paid_to, salt, purchase: None };
        // The service's endpoint: the invoice for the commitment, and the
        // ticket, an act it signs, handed back directly.
        let preimage = random::<32>();
        let inv = invoice(&ln_node, price.value * 1000, &commitment.hash(), &preimage);
        let ticket = Ticket { offer: offer_act.id(), leaf, commitment: commitment.hash(), tier, batch, deadline: now + o.tiers[tier as usize].blocks };
        let ticket_act = svc.act(mor_anchoring::spec(), service::TICKET, ticket.to_map(), None, None);
        // The payer's client checks the ticket before paying.
        let mut rd = read(&site, &svc.id).await;
        rd.add_act(&ticket_act);
        assert_eq!(Ticket::from_map(&payload(&rd, &ticket_act.id())), Some(ticket.clone()), "a ticket the service signed");
        service::acceptable(&offer_act.id(), &o, &ticket, &commitment, &svc.id, node.rpc.block_count().await.unwrap()).expect("the payer's client accepts the ticket");
        // Paid, settled by the preimage; the payer's claim.
        let ln = LnProof { invoice: inv, preimage: Some(preimage) };
        let claim = Claim { rail: mor_lightning::spec(), proof: Proof { paid_to, salt, rail: ln.encode() }.encode(), payee: svc.id, amount: price, fulfils: pointer_act.id(), disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        let held = ServiceHeld { pointer_id: pointer_act.id(), pointer: ptr };
        let lnm = Lightning;
        assert_eq!(verify(Record::Claim(&claim, p.id, &Citations::default()), &held, &Modules::new().adopt(&lnm)).answer, Answer::Valid);
        let claim_act = p.act(finance_spec(), finance::types::CLAIM, Payload::Claim(claim).to_map(), None, None);
        eprintln!("{name} pays {} satoshis over Lightning for one hash (tier {tier}, batch {batch}, by block {})", price.value, ticket.deadline);
        payers.push(Payer_ { name, p, act: act.id(), blind, commitment, claim: claim_act, ticket_act, ticket });
    }

    // ------------------------------------------------ batch 0, anchored by pay-to-contract
    let leaves = vec![payers[0].ticket.leaf, payers[1].ticket.leaf];
    let batch = Batch::new(leaves.clone()).unwrap();
    let out = mor_onchain::tx::taproot_script(&mor_onchain::p2c::pay_to_contract(&pool_key, None, &batch.root()).unwrap());
    let t = coins.pay(&out, 330);
    let txid = node.rpc.send(&consensus::serialize(&t)).await.expect("the node takes the batch's transaction");
    node.rpc.generate(1).await.unwrap();
    let publication = Publication { offer: offer_act.id(), batch: 0, leaves, tx: txid, output: 0 };
    let pub_act = svc.act(mor_anchoring::spec(), service::PUBLICATION, publication.to_map(), None, None);
    put(&site, &pub_act).await;
    node.rpc.generate(CONFIRMATIONS as u64 - 1).await.unwrap();
    eprintln!("batch 0 anchored: two leaves, one output of 330 satoshis to the service's key tweaked by the root, no OP_RETURN; its publication signed and on the home");

    // ------------------------------------------------ anyone verifies, from the chain
    let eve = read(&site, &svc.id).await;
    let ids: Vec<Hash> = eve.v.signed_by(&svc.id).filter(|a| a.inside.spec == mor_anchoring::spec() && a.inside.type_ == service::PUBLICATION).map(|a| a.id).collect();
    let published: Vec<Publication> = ids.iter().map(|id| Publication::from_map(&payload(&eve, id)).unwrap()).collect();
    assert_eq!(published, vec![publication.clone()]);
    let chain = node.rpc.chain(Network::Regtest).await.expect("the node's headers");
    let block = node.rpc.proof([0; 64], &stripped(&t), 0).await.unwrap().paid.unwrap().block.expect("mined");
    let height = node.rpc.block_count().await.unwrap() - CONFIRMATIONS as u64 + 1;
    let anchor_of = |i: u64, blind: [u8; 32]| BatchAnchor { blind, index: i, count: batch.count(), branch: batch.branch(i).unwrap(), key: pool_key, tree: None, tx: stripped(&t), output: 0, block: Some(block.clone()) };
    let bitcoin = BitcoinClock { chain: &chain };
    let held_for = |x: &Payer_| ServiceHeld { pointer_id: pointer_act.id(), pointer: pointer.clone() }.pay(x);
    for (i, x) in payers.iter().take(2).enumerate() {
        let leaf_anchor = anchor_of(i as u64, [0; 32]).encode();
        let j = service::judge(&offer_act.id(), &offer, &svc.id, &x.ticket, &held_for(x), &published, Some(&leaf_anchor), &bitcoin);
        assert_eq!(j, Judgment::Anchored { point: height }, "{}", x.name);
        // The payer, holding the act and the blind, anchors the act itself.
        let mut anchors = Anchors::new();
        assert!(anchors.add_proof(&bitcoin, &clock::reference(Network::Regtest), &x.act, &anchor_of(i as u64, x.blind).encode()));
        eprintln!("{}: inclusion verified from the chain the node follows; the act is anchored at block {height}", x.name);
    }

    // ------------------------------------------------ Cal: a provable omission
    let cal = &payers[2];
    assert_eq!(service::judge(&offer_act.id(), &offer, &svc.id, &cal.ticket, &held_for(cal), &published, None, &bitcoin), Judgment::Omitted { refund: sat(20) });
    eprintln!("cal: batch 0 published without cal's leaf; the ticket and the publication, both signed by the service, show the omission: 20 owed back");

    // ------------------------------------------------ Dan: a default
    let dan = &payers[3];
    let j = service::judge(&offer_act.id(), &offer, &svc.id, &dan.ticket, &held_for(dan), &published, None, &bitcoin);
    let deadline_buried = dan.ticket.deadline + CONFIRMATIONS as u64 - 1;
    if chain.tip() < deadline_buried {
        assert_eq!(j, Judgment::Pending);
        node.rpc.generate(deadline_buried - chain.tip()).await.unwrap();
    }
    let chain = node.rpc.chain(Network::Regtest).await.unwrap();
    let j = service::judge(&offer_act.id(), &offer, &svc.id, &dan.ticket, &held_for(dan), &published, None, &BitcoinClock { chain: &chain });
    assert_eq!(j, Judgment::Default { refund: sat(50) });
    eprintln!("dan: batch 1 never published nor anchored; block {} buried six deep: a default, 50 owed back", dan.ticket.deadline);

    // The payers' claims and tickets are acts a judge reads; each payer's
    // reader holds them as valid.
    for x in &payers {
        let mut rd = read(&site, &svc.id).await;
        rd.follow(&x.p.id, &[site.base.clone()]).await;
        rd.add_act(&x.ticket_act);
        rd.add_act(&x.claim);
        assert_eq!(rd.status(&x.claim.id()), Status::Valid);
        assert_eq!(rd.status(&x.ticket_act.id()), Status::Valid);
        let _ = &x.commitment;
    }
    eprintln!("refunds owed: 20 to cal, 50 to dan (their payment, paid back is an ordinary payment under Finance rule 10a: not made in this test)");
    drop(node);
}

impl ServiceHeld {
    /// The payment buying a payer's ticket, as the payment cMIP verifies
    /// the payer's claim with the Lightning rail Module.
    fn pay(&self, x: &Payer_) -> Payment {
        let lnm = Lightning;
        let claim = match Payload::decode(finance::types::CLAIM, &x.claim_payload()) {
            Ok(Payload::Claim(c)) => c,
            _ => panic!("a claim"),
        };
        let answer = verify(Record::Claim(&claim, x.p.id, &Citations::default()), self, &Modules::new().adopt(&lnm)).answer;
        Payment { commitment: x.commitment.clone(), answer }
    }
}

impl Payer_ {
    fn claim_payload(&self) -> Vec<(mor_core::cbor::Value, mor_core::cbor::Value)> {
        let mut rd = Reader::new(Http::new(None));
        rd.add_act(&self.claim);
        rd.v.get(&self.claim.id()).expect("held").inside.payload.clone()
    }
}
