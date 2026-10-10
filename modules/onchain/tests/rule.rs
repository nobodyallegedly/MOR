//! The on-chain rail Module's decoders and rule, and the payment cMIP's
//! verification over it, without a node: keys, requests, transactions and
//! blocks are made by a second, independent implementation (rust-bitcoin),
//! which also reads everything the Module reads. Test identities and regtest
//! units only.

mod support;

use bitcoin::hashes::Hash as _;
use bitcoin::{consensus, CompactTarget, Target, Transaction};
use mor_core::finance::{Amount, Anonymous, Citations, Claim, PayeePointer, Payer, Rail, Receipt, VaultEntry};
use mor_core::hash::Hash;
use mor_core::identity::SigningKey;
use mor_core::sig::SchnorrKey;
use mor_onchain::{block, p2c, tx, unit, Network, Onchain, OnchainAddress, OnchainProof};
use mor_payment::{verify, Answer, Commitment, Held, Modules, PaidTo, Proof, RailInput, RailKind, RailModule, Record};
use support::*;

// ---------------------------------------------------------------- the decoders, against rust-bitcoin

#[test]
fn transactions_headers_and_branches_read_as_rust_bitcoin_reads_them() {
    for i in 0..60u64 {
        let outs: Vec<(Vec<u8>, u64)> = (0..(i % 5 + 1))
            .map(|j| (vec![0x51, 0x20].into_iter().chain(h(&format!("{i} {j}"))).collect(), 330 + i * 1000 + j))
            .collect();
        let t = tx(&format!("coins {i}"), &outs);
        let b = bytes(&t);
        let ours = tx::decode(&b).expect("one transaction");
        assert_eq!(ours.txid, t.compute_txid().to_byte_array());
        assert_eq!(ours.outputs.len(), t.output.len());
        for (o, x) in ours.outputs.iter().zip(&t.output) {
            assert_eq!(o.value, x.value.to_sat());
            assert_eq!(o.script, x.script_pubkey.to_bytes());
        }
        // A byte more, a byte less: not one transaction.
        assert!(tx::decode(&[b.clone(), vec![0]].concat()).is_none());
        assert!(tx::decode(&b[..b.len() - 1]).is_none());
    }
    // The witness serialisation is not the bytes a txid hashes.
    let mut t = tx("coins", &[(vec![0x51, 0x20].into_iter().chain([1; 32]).collect(), 5000)]);
    t.input[0].witness.push([1u8; 64]);
    assert!(tx::decode(&consensus::serialize(&t)).is_none());

    for bits in [0x207f_ffffu32, 0x1d00_ffff, 0x1e03_77ae, 0x170f_ffff, 0x1703_a30c, 0x1b0404cb, 0x0300_8000, 0x0400_8000] {
        let ours = block::target(bits).unwrap();
        let theirs = Target::from_compact(CompactTarget::from_consensus(bits)).to_be_bytes();
        assert_eq!(ours, theirs, "bits {bits:08x}");
    }
    assert!(block::target(0x0480_0001).is_none(), "negative");
    assert!(block::target(0x2301_0000).is_none(), "beyond 256 bits");

    let header = mine(h("previous"), &[h("a"), h("b")], REGTEST_BITS, 1_790_000_000);
    let ours = block::Header::decode(&header).unwrap();
    let theirs: bitcoin::block::Header = consensus::deserialize(&header).unwrap();
    assert_eq!(ours.hash, theirs.block_hash().to_byte_array());
    assert_eq!(ours.previous, h("previous"));
    assert_eq!(ours.merkle_root, theirs.merkle_root.to_byte_array());
    assert_eq!(ours.bits, REGTEST_BITS);
    assert!(ours.meets_its_target());

    for n in 1..20usize {
        let txids: Vec<[u8; 32]> = (0..n).map(|i| h(&format!("tx {i}"))).collect();
        let root = bitcoin::merkle_tree::calculate_root(txids.iter().map(|t| bitcoin::TxMerkleNode::from_byte_array(*t)))
            .unwrap()
            .to_byte_array();
        for i in 0..n {
            let branch = block::merkle_branch(&txids, i).unwrap();
            assert_eq!(block::merkle_root(&txids[i], i as u64, &branch), Some(root), "{i} of {n}");
        }
    }
}

#[test]
fn pay_to_contract_is_bip_341s_output_key() {
    for i in 0..50 {
        let key = xonly(&secret(&format!("key {i}")));
        let c = h(&format!("commitment {i}"));
        assert_eq!(p2c::pay_to_contract(&key, None, &c), Some(bitcoin_output_key(&key, &c)));
        // Beside the owner's own scripts: the branch of the two.
        let tree = h(&format!("a 2-of-3 multisig leaf {i}"));
        assert_eq!(p2c::tap_branch(&tree, &c), bitcoin_branch(&tree, &c));
        assert_eq!(p2c::pay_to_contract(&key, Some(&tree), &c), Some(bitcoin_output_key(&key, &bitcoin_branch(&tree, &c))));
    }
    // A key that is not the x coordinate of a point gives no address.
    let mut bad = [0xffu8; 32];
    bad[31] = 0xfe;
    assert_eq!(p2c::pay_to_contract(&bad, None, &h("c")), None);
}

#[test]
fn addresses_and_proofs_round_trip() {
    let k = Keys::new("payee");
    for a in [
        k.address(Network::Regtest),
        OnchainAddress { tree: Some(h("tree")), endpoint: Some("https://payee.example".into()), ..k.address(Network::Mainnet) },
        OnchainAddress { endpoint: Some("x".into()), ..k.address(Network::Signet) },
    ] {
        assert_eq!(OnchainAddress::decode(&a.encode()), Some(a));
    }
    for n in [None, Some(1), Some(N)] {
        for pays in [None, Some((vec![0x51, 0x20].into_iter().chain([3; 32]).collect(), 1000))] {
            let p = proof(&k.request, &h("c"), pays, n);
            assert_eq!(OnchainProof::decode(&p.encode()), Some(p));
        }
    }
}

// ---------------------------------------------------------------- the rule

fn sat(n: u64) -> Amount {
    Amount { unit: unit(Network::Regtest), value: n }
}

/// The rule on a payment of `amount` to `a`, committing to `c`.
fn rule(a: &OnchainAddress, c: &Hash, amount: &Amount, p: &OnchainProof) -> Answer {
    Onchain::rule(&RailInput { commitment: *c, amount, address: &a.encode(), rail_proof: &p.encode() })
}

/// What the payee's address says to pay for `c`, worth `v`.
fn to(a: &OnchainAddress, c: &Hash, v: u64) -> Option<(Vec<u8>, u64)> {
    Some((a.script(c).unwrap(), v))
}

#[test]
fn a_payment_confirmed_six_times_is_valid() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    assert_eq!(rule(&a, &c, &sat(1234), &proof(&k.request, &c, to(&a, &c, 1234), Some(N))), Answer::Valid);
    // With a script multisig beside the commitment, the same.
    let a = OnchainAddress { tree: Some(h("a 2-of-3 leaf")), ..a };
    assert_eq!(rule(&a, &c, &sat(1234), &proof(&k.request, &c, to(&a, &c, 1234), Some(N))), Answer::Valid);
}

#[test]
fn not_yet_paid_unconfirmed_or_short_of_six_it_is_pending() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    let pending = |p: &OnchainProof| match rule(&a, &c, &sat(1234), p) {
        Answer::Pending(w) => w,
        other => panic!("{other:?}"),
    };
    // The request alone: what a payer's wallet checks before paying.
    assert!(pending(&proof(&k.request, &c, None, None)).contains("not made"));
    // Broadcast, not mined.
    assert!(pending(&proof(&k.request, &c, to(&a, &c, 1234), None)).contains("unconfirmed"));
    for n in 1..N {
        assert!(pending(&proof(&k.request, &c, to(&a, &c, 1234), Some(n))).contains(&format!("{n} of {N}")));
    }
}

#[test]
fn one_payment_one_proof_more_than_six_headers_is_not_its_proof() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    assert!(matches!(rule(&a, &c, &sat(1234), &proof(&k.request, &c, to(&a, &c, 1234), Some(N + 1))), Answer::Invalid(w) if w.contains("exactly")));
}

#[test]
fn a_payment_to_an_address_not_tweaked_by_the_commitment_is_refused() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    let refused = |script: Vec<u8>| match rule(&a, &c, &sat(1234), &proof(&k.request, &c, Some((script, 1234)), Some(N))) {
        Answer::Invalid(w) => assert!(w.contains("not tweaked by this payment's commitment"), "{w}"),
        other => panic!("{other:?}"),
    };
    // The payee's key itself, untweaked.
    refused(tx::taproot_script(&a.key));
    // The key tweaked as a plain Taproot key with no scripts (BIP 86).
    refused(tx::taproot_script(&bitcoin_output_key_no_root(&a.key)));
    // Tweaked by another payment's commitment.
    refused(a.script(&h("another payment")).unwrap());
    // The request key's address.
    refused(tx::taproot_script(&a.request));
}

fn bitcoin_output_key_no_root(key: &[u8; 32]) -> [u8; 32] {
    use bitcoin::key::{TapTweak, XOnlyPublicKey};
    let k = XOnlyPublicKey::from_slice(key).unwrap();
    k.tap_tweak(&bitcoin::secp256k1::Secp256k1::new(), None).0.to_x_only_public_key().serialize()
}

#[test]
fn the_request_must_be_signed_by_the_payees_request_key() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    for wrong in [secret("someone else"), k.key] {
        let p = proof(&wrong, &c, to(&a, &c, 1234), Some(N));
        assert!(matches!(rule(&a, &c, &sat(1234), &p), Answer::Invalid(w) if w.contains("request")));
    }
    // A request for another commitment is no request for this one.
    let mut p = proof(&k.request, &c, to(&a, &c, 1234), Some(N));
    p.request = request(&k.request, &h("another payment"));
    assert!(matches!(rule(&a, &c, &sat(1234), &p), Answer::Invalid(w) if w.contains("request")));
}

#[test]
fn the_amount_and_its_unit_must_be_exact() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    for paid in [1233, 1235] {
        assert!(matches!(rule(&a, &c, &sat(1234), &proof(&k.request, &c, to(&a, &c, paid), Some(N))), Answer::Invalid(w) if w.contains("amount")));
    }
    let signet = Amount { unit: unit(Network::Signet), value: 1234 };
    assert!(matches!(rule(&a, &c, &signet, &proof(&k.request, &c, to(&a, &c, 1234), Some(N))), Answer::Invalid(w) if w.contains("unit")));
    // No such output.
    let mut p = proof(&k.request, &c, to(&a, &c, 1234), Some(N));
    p.paid.as_mut().unwrap().output = 7;
    assert!(matches!(rule(&a, &c, &sat(1234), &p), Answer::Invalid(_)));
}

#[test]
fn a_broken_block_proof_is_invalid() {
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    let good = proof(&k.request, &c, to(&a, &c, 1234), Some(N));
    let invalid = |p: &OnchainProof| assert!(matches!(rule(&a, &c, &sat(1234), p), Answer::Invalid(_)), "{p:?}");
    // The branch does not reach the block's root.
    let mut p = good.clone();
    p.paid.as_mut().unwrap().block.as_mut().unwrap().branch[0] = h("not a sibling");
    invalid(&p);
    let mut p = good.clone();
    p.paid.as_mut().unwrap().block.as_mut().unwrap().index = 0;
    invalid(&p);
    // A header that does not name the one before it.
    let mut p = good.clone();
    let b = p.paid.as_mut().unwrap().block.as_mut().unwrap();
    b.headers[3] = mine(h("elsewhere"), &[h("x")], REGTEST_BITS, 5);
    invalid(&p);
    // A header whose hash is above its own target.
    let mut p = good.clone();
    let b = p.paid.as_mut().unwrap().block.as_mut().unwrap();
    let mut x = b.headers[N - 1];
    loop {
        x[76] = x[76].wrapping_add(1);
        let hh = header_hash(&x);
        if !Target::from_compact(CompactTarget::from_consensus(REGTEST_BITS)).is_met_by(bitcoin::BlockHash::from_byte_array(hh)) {
            break;
        }
    }
    b.headers[N - 1] = x;
    invalid(&p);
    // A transaction the block does not hold.
    let mut p = good.clone();
    p.paid.as_mut().unwrap().tx = bytes(&tx("other coins", &[a_script(&a, &c)]));
    invalid(&p);
}

fn a_script(a: &OnchainAddress, c: &Hash) -> (Vec<u8>, u64) {
    (a.script(c).unwrap(), 1234)
}

#[test]
fn a_header_easier_than_the_networks_floor_is_unknown() {
    let k = Keys::new("payee");
    let a = k.address(Network::Mainnet);
    let c = h("a tip");
    let sats = Amount { unit: unit(Network::Mainnet), value: 1234 };
    // Headers at regtest's difficulty, on Bitcoin: anyone could make them.
    let p = proof(&k.request, &c, to(&a, &c, 1234), Some(N));
    assert!(matches!(rule(&a, &c, &sats, &p), Answer::Unknown(w) if w.contains("floor")));
    // Unconfirmed, the floor is not reached: pending as anywhere.
    let p = proof(&k.request, &c, to(&a, &c, 1234), None);
    assert!(matches!(rule(&a, &c, &sats, &p), Answer::Pending(_)));
}

#[test]
fn it_declares_itself_a_request_rail_and_carries_lightnings_units() {
    let onchain = Onchain;
    let ln = mor_lightning::Lightning;
    assert_eq!(onchain.kind(), RailKind::Request);
    assert_eq!(ln.kind(), RailKind::Request);
    assert!(Modules::new().adopt(&onchain).adopt(&ln).push_rails().is_empty());
    // One name per unit: a regtest satoshi on-chain is a regtest satoshi on
    // Lightning.
    use mor_lightning::bolt11::Network as LnNet;
    for (a, b) in [(Network::Mainnet, LnNet::Mainnet), (Network::Testnet, LnNet::Testnet), (Network::Signet, LnNet::Signet), (Network::Regtest, LnNet::Regtest)] {
        assert_eq!(unit(a), mor_lightning::unit(b));
    }
    assert_ne!(unit(Network::Regtest), unit(Network::Mainnet));
}

// ---------------------------------------------------------------- through the payment cMIP

/// What a verifier holds, stated by hand.
struct World {
    payee: Hash,
    payer: Hash,
    pointer_id: Hash,
    pointer: PayeePointer,
    vault_id: Hash,
    vault: Vec<VaultEntry>,
    flow: Keys,
    safe: Keys,
}

impl Held for World {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        (id == &self.pointer_id).then(|| self.pointer.clone())
    }
    fn vault(&self, id: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        (id == &self.vault_id).then(|| (self.payee, self.vault.clone()))
    }
    fn obligation(&self, _: &Hash) -> Option<mor_core::finance::Obligation> {
        None
    }
    fn holding(&self, _: &Hash, _: &Hash) -> Option<mor_core::finance::Holding> {
        None
    }
    fn voided_pointer(&self, _: &Hash) -> Option<(PayeePointer, Hash)> {
        None
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        if payee == &self.payee {
            vec![(self.pointer_id, self.pointer.clone())]
        } else {
            vec![]
        }
    }
    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>> {
        (payee == &self.payee).then(|| self.vault.clone())
    }
    fn payment_counts(&self, _: &Hash, _: &mor_core::finance::PaidAt, _: &Amount, _: &[u8], _: &Hash) -> Option<bool> {
        None
    }
}

fn world() -> World {
    let (flow, safe) = (Keys::new("flow"), Keys::new("vault"));
    let payee = h("payee");
    World {
        payee,
        payer: h("payer"),
        pointer_id: h("pointer act"),
        pointer: PayeePointer {
            payee,
            version: 1,
            previous: None,
            rails: vec![Rail { module: mor_onchain::spec(), address: flow.address(Network::Regtest).encode() }],
        },
        vault_id: h("genesis act"),
        vault: vec![VaultEntry {
            unit: unit(Network::Regtest),
            rail_module: mor_onchain::spec(),
            source: safe.address(Network::Regtest).encode(),
            limit: 10_000,
        }],
        flow,
        safe,
    }
}

const SALT: [u8; 16] = [5; 16];

/// A payment as both sides record it, (receipt, claim): the request signed
/// by `keys`' request key, committing to what the commitment says, the
/// transaction paying the address that commitment gives, confirmed `n`
/// times.
fn paid(w: &World, paid_to: PaidTo, keys: &Keys, amount: Amount, payer: Option<Payer>, n: Option<usize>) -> (Receipt, Claim) {
    let fulfils = w.pointer_id;
    let c = Commitment { rail: mor_onchain::spec(), payee: w.payee, amount, fulfils, payer: payer.clone(), paid_to, salt: SALT, purchase: None };
    let a = keys.address(Network::Regtest);
    let p = proof(&keys.request, &c.hash(), to(&a, &c.hash(), amount.value), n);
    let proof = Proof { paid_to, salt: SALT, rail: p.encode() }.encode();
    (
        Receipt { rail: mor_onchain::spec(), proof: proof.clone(), payer: payer.clone(), payee: w.payee, amount, fulfils, previous: None, forward: None, batch: None, purchase: None },
        Claim { rail: mor_onchain::spec(), proof, payee: w.payee, amount, fulfils, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None },
    )
}

fn answers(w: &World, r: &Receipt, c: &Claim, claimant: Hash) -> (Answer, Answer) {
    let onchain = Onchain;
    let m = Modules::new().adopt(&onchain);
    (verify(Record::Receipt(r), w, &m).answer, verify(Record::Claim(c, claimant, &Citations::default()), w, &m).answer)
}

fn flow(w: &World) -> PaidTo {
    PaidTo::Flow { pointer: w.pointer_id, rail: 0 }
}

fn vault(w: &World) -> PaidTo {
    PaidTo::Vault { declared_by: w.vault_id, entry: 0 }
}

#[test]
fn a_confirmed_payment_is_valid_on_both_sides_to_the_flow_and_to_the_vault() {
    let w = world();
    let me = Some(Payer::Identity(w.payer));
    let (r, c) = paid(&w, flow(&w), &w.flow, sat(1234), me.clone(), Some(N));
    assert_eq!(answers(&w, &r, &c, w.payer), (Answer::Valid, Answer::Valid));
    assert_eq!(r.proof, c.proof, "both sides hold the same proof");
    let (r, c) = paid(&w, vault(&w), &w.safe, sat(50_000), me, Some(N));
    assert_eq!(answers(&w, &r, &c, w.payer), (Answer::Valid, Answer::Valid));
}

#[test]
fn unconfirmed_both_sides_are_pending() {
    let w = world();
    for n in [None, Some(3)] {
        let (r, c) = paid(&w, flow(&w), &w.flow, sat(1234), Some(Payer::Identity(w.payer)), n);
        let (a, b) = answers(&w, &r, &c, w.payer);
        assert!(matches!(a, Answer::Pending(_)) && matches!(b, Answer::Pending(_)), "{a:?} {b:?}");
    }
}

#[test]
fn neither_side_alone_can_fake_a_payment_nor_relabel_it() {
    let w = world();
    let me = Some(Payer::Identity(w.payer));
    let (r, c) = paid(&w, flow(&w), &w.flow, sat(1234), me.clone(), Some(N));
    // The payer relabels the payment: another amount, another purpose,
    // another payee. Each recomputes another commitment, so another
    // address, which the transaction did not pay.
    for altered in [
        Claim { amount: sat(1235), ..c.clone() },
        Claim { fulfils: Hash::default(), ..c.clone() },
        Claim { payee: w.payer, ..c.clone() },
    ] {
        let (_, b) = answers(&w, &r, &altered, w.payer);
        assert!(matches!(b, Answer::Invalid(_)), "{b:?}");
    }
    // Someone else claims to be the payer: another commitment.
    let (_, b) = answers(&w, &r, &c, w.payee);
    assert!(matches!(b, Answer::Invalid(_)), "{b:?}");
    // Paid to the vault's address, presented as paid to the flow.
    let (r2, _) = paid(&w, vault(&w), &w.safe, sat(1234), me.clone(), Some(N));
    let mut p = Proof::decode(&r2.proof).unwrap();
    p.paid_to = flow(&w);
    let moved = Receipt { proof: p.encode(), ..r2 };
    let (a, _) = answers(&w, &moved, &c, w.payer);
    assert!(matches!(a, Answer::Invalid(_)), "{a:?}");
    // The payee's flow key signs a request for the vault: not the vault's
    // request key.
    let (r3, _) = paid(&w, vault(&w), &w.flow, sat(1234), me, Some(N));
    assert!(matches!(answers(&w, &r3, &c, w.payer).0, Answer::Invalid(_)));
}

#[test]
fn an_anonymous_payers_claim_counts_only_with_its_committed_key() {
    let w = world();
    let one_time = SchnorrKey::from_secret(&h("a one-time key")).unwrap();
    let bare = SigningKey { scheme: mor_core::act::Scheme::Founding(1), key: one_time.public().to_vec() };
    let (r, mut c) = paid(&w, flow(&w), &w.flow, sat(777), Some(Payer::Key(bare.clone())), Some(N));
    c.anonymous = Some(Anonymous { key: bare, sig: one_time.sign(&c.anonymous_message(&Citations::default()), &[0; 32]).sig });
    // Signed, as an act, by a one-time identity of the payer's.
    assert_eq!(answers(&w, &r, &c, h("a one-time identity")), (Answer::Valid, Answer::Valid));
    // The payee, who knows the commitment, claims the payment as its own.
    let mut theirs = c.clone();
    theirs.anonymous = None;
    assert!(matches!(answers(&w, &r, &theirs, w.payee).1, Answer::Invalid(_)));
}

#[test]
fn payer_and_payee_build_the_same_proof_independently() {
    // The request is given once; the transaction, its block and the six
    // headers are the chain's. Two proofs built apart are the same bytes.
    let k = Keys::new("payee");
    let a = k.address(Network::Regtest);
    let c = h("a tip");
    let t = bytes(&tx("the payer's coins", &[a_script(&a, &c)]));
    let rq = request(&k.request, &c);
    let block = confirm(&t, N);
    let by = |b: &mor_onchain::Block| OnchainProof { request: rq, paid: Some(mor_onchain::Paid { tx: t.clone(), output: 0, block: Some(b.clone()) }) }.encode();
    let payer = by(&block);
    let txid = consensus::deserialize::<Transaction>(&t).unwrap().compute_txid().to_byte_array();
    let payee = by(&mor_onchain::Block {
        index: 1,
        branch: block::merkle_branch(&[h("a coinbase"), txid, h("another payment")], 1).unwrap(),
        headers: block.headers.clone(),
    });
    assert_eq!(payer, payee);
    assert_eq!(rule(&a, &c, &sat(1234), &OnchainProof::decode(&payer).unwrap()), Answer::Valid);
}
