//! The stolen phone, end to end (Money rule 15: theft, anchor or bear the
//! loss; F169, F170, F176 to F181; freeze test suite scenario 1, step 5c).
//!
//! In plain words: Ana declared a clock (a main time reference and a
//! backup) and three homes, one of which she runs herself. Her phone is
//! stolen. The thief publishes a new wallet with her signing key and
//! re-points her deal with a label to it. During the window, the label
//! pays her royalties to the thief's wallet: one payment whose wallet
//! anchors the claim at once on her clock, one by a payer colluding with
//! the thief who anchors early but on a clock Ana never named, one never
//! anchored. Ana signs a rotation changing her locks and anchors it
//! herself, but holds it back from her homes for a while, as if to cut off
//! payments early; an honest payment arrives meanwhile. Then she
//! publishes it, the homes receipt it, and her client anchors the receipts.
//!
//! Precisely, over three layers at once:
//! - **the core library**: every act is signed and held by its verifier;
//!   the homes' receipts make the rotation count under the default
//!   majority; anchors are checked by a test anchoring cMIP through the
//!   Envelopes' anchoring interface (F173); the Agreements view reads the deal,
//!   the debts and rule 15 (`AgreementsView::payment_counts`);
//! - **the rail**: every payment is a real BOLT 11 invoice signed by the
//!   node of the wallet paid, checked by the Lightning rail Module and,
//!   independently, by `lightning-invoice`;
//! - **the payment cMIP**: `verify` (rule 12a: the rail Module the pointer
//!   paid to names, as the chain stood for the payment) and `beside`, which
//!   asks the core's rule 15 through a `Held` built on the Agreements view.
//!
//! Test identities and regtest units only.

#[path = "../../../core/tests/common/mod.rs"]
mod common;

use bitcoin::hashes::{sha256 as bh, Hash as _};
use bitcoin::secp256k1::{Message, PublicKey, Secp256k1, SecretKey};
use common::{home, Person, Rot, World};
use lightning_invoice::{Currency, InvoiceBuilder, PaymentSecret};
use mor_core::act::{Object, Ref};
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::envelopes::anchoring::{AnchoringCmip, Anchors, Reference};
use mor_core::money::{self as fin, Amount, Citations, Claim, Clock, Holding, Obligation, PaidAt, PayeePointer, Payer, Payload, Rail, VaultEntry};
use mor_core::hash::{sha256, tagged_hash, Hash};
use mor_core::identity::Payload as Id;
use mor_core::agreements::{self, AgreementsView, Mips};
use mor_core::sig::{self, SchnorrKey, Verdict};
use mor_lightning::bolt11::Network;
use mor_lightning::{unit, Lightning, LnAddress, LnProof};
use mor_payment::{beside, paid_at, verify, Answer, Commitment, Held, Modules, PaidTo, Proof, Record};
use std::collections::BTreeMap;
use std::time::Duration;

fn h(label: &str) -> Hash {
    sha256(label.as_bytes())
}

fn mips() -> Mips {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mips {
        identity: common::identity_spec(),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: common::money_spec(),
        agreements: common::agreements_spec(),
        development: t("PRODUCTION"),
    }
}

fn node(label: &str) -> SecretKey {
    SecretKey::from_slice(&h(label)).unwrap()
}

fn address(node: &SecretKey) -> Vec<u8> {
    LnAddress { network: Network::Regtest, node: PublicKey::from_secret_key(&Secp256k1::new(), node).serialize(), endpoint: None }.encode()
}

fn sat(n: u64) -> Amount {
    Amount { unit: unit(Network::Regtest), value: n }
}

// ---------------------------------------------------------------- the clocks

/// A test anchoring cMIP: a clock service signs `(act, point)`. Its
/// parameters name the clock by its key. Experimental, tests only.
struct Clockwork {
    key: SchnorrKey,
}

impl Clockwork {
    fn new(name: &str) -> Self {
        Clockwork { key: SchnorrKey::from_secret(&h(name)).unwrap() }
    }
    fn reference(&self) -> Reference {
        Reference { cmip: h("a test anchoring cMIP"), params: Value::Bytes(self.key.public().to_vec()) }
    }
    fn message(act: &Hash, point: u64) -> Hash {
        let mut m = act.to_vec();
        m.extend(point.to_be_bytes());
        tagged_hash("MOR/test/anchor", &m)
    }
    fn proof(&self, act: &Hash, point: u64) -> Vec<u8> {
        let mut p = point.to_be_bytes().to_vec();
        p.extend(self.key.sign(&Self::message(act, point), &[0; 32]).sig);
        p
    }
}

struct TestAnchoring;

impl AnchoringCmip for TestAnchoring {
    fn spec(&self) -> Hash {
        h("a test anchoring cMIP")
    }
    fn verify(&self, act: &Hash, params: &Value, proof: &[u8]) -> Option<u64> {
        let Value::Bytes(key) = params else { return None };
        let point = u64::from_be_bytes(proof.get(..8)?.try_into().ok()?);
        let s = mor_core::act::Signature { scheme: mor_core::act::Scheme::Founding(1), key: key.clone(), sig: proof[8..].to_vec() };
        (sig::verify(&s, &Clockwork::message(act, point)) == Verdict::Valid).then_some(point)
    }
}

// ---------------------------------------------------------------- an Agreements client's Held

/// What an Agreements client holds, as the payment cMIP asks for it: every answer
/// from the core library's verifier and Agreements view over the signed acts.
struct AgreementsHeld<'a> {
    view: AgreementsView<'a>,
}

impl AgreementsHeld<'_> {
    fn fin(&self, id: &Hash) -> Option<(Payload, Hash)> {
        let x = self.view.v.get(id)?;
        if x.inside.spec != mips().money {
            return None;
        }
        Some((Payload::decode(x.inside.type_, &x.inside.payload).ok()?, x.act.outside.signer?))
    }
}

impl Held for AgreementsHeld<'_> {
    fn pointer(&self, id: &Hash) -> Option<PayeePointer> {
        match self.fin(id)? {
            (Payload::PayeePointer(p), s) if s == p.payee && self.view.v.binding_status(id) == Status::Valid => Some(p),
            _ => None,
        }
    }
    fn vault(&self, declared_by: &Hash) -> Option<(Hash, Vec<VaultEntry>)> {
        let x = self.view.v.get(declared_by)?;
        let (who, decls) = match x.identity.as_ref()?.as_ref().ok()? {
            Id::Genesis(g) => (*declared_by, g.declarations.clone()?),
            Id::Rotation(r) => (x.act.outside.signer?, r.declarations.clone()?),
            _ => return None,
        };
        Some((who, fin::vault_in(&mips().money, &decls).ok()??.unwrap_or_default()))
    }
    fn obligation(&self, id: &Hash) -> Option<Obligation> {
        match self.fin(id)? {
            (Payload::Obligation(o), s) if s == o.debtor && self.view.v.binding_status(id) == Status::Valid => Some(o),
            _ => None,
        }
    }
    fn holding(&self, fulfils: &Hash, payee: &Hash) -> Option<Holding> {
        self.view.pointer_holding(fulfils, payee)
    }
    fn pointers_of(&self, payee: &Hash) -> Vec<(Hash, PayeePointer)> {
        self.view.v.signed_by(payee).filter_map(|x| Some((x.id, self.pointer(&x.id)?))).filter(|(_, p)| &p.payee == payee).collect()
    }
    fn voided_pointer(&self, id: &Hash) -> Option<(PayeePointer, Hash)> {
        if !matches!(self.view.v.status(id), Status::Void | Status::Disputed) {
            return None;
        }
        match self.fin(id)? {
            (Payload::PayeePointer(p), s) if s == p.payee => Some((p, self.view.v.judged_by(id)?)),
            _ => None,
        }
    }
    fn vault_in_force(&self, payee: &Hash) -> Option<Vec<VaultEntry>> {
        let res = self.view.v.resolve(payee);
        let mut out = None;
        for st in &res.states {
            if let Ok(Some(v)) = fin::vault_in(&mips().money, &st.declarations) {
                out = v;
            }
        }
        out
    }
    fn payment_counts(&self, payee: &Hash, at: &PaidAt, amount: &Amount, proof: &[u8], fulfils: &Hash) -> Option<bool> {
        Some(self.view.payment_counts(payee, at, amount, proof, fulfils))
    }
}

// ---------------------------------------------------------------- the story's world

struct Story {
    w: World,
    homes: Vec<Person>,
    anchors: Anchors,
    rail_valid: BTreeMap<Hash, PaidAt>,
    main: Clockwork,
    backup: Clockwork,
    elsewhere: Clockwork,
    ana: Person,
}

impl Story {
    fn view(&self) -> AgreementsView<'_> {
        let mut v = AgreementsView::new(&self.w.v, mips());
        v.rail_valid = self.rail_valid.clone();
        v.anchored = self.anchors.clone();
        v
    }

    fn anchor(&mut self, act: Hash, clock: &str, point: u64) {
        let c = match clock {
            "main" => &self.main,
            "backup" => &self.backup,
            _ => &self.elsewhere,
        };
        let (r, p) = (c.reference(), c.proof(&act, point));
        assert!(self.anchors.add_proof(&TestAnchoring, &r, &act, &p), "the anchoring cMIP checks its proof");
    }

    fn act(&mut self, p: &mut Person, spec: Hash, t: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>, refs: Option<Vec<Ref>>) -> Hash {
        let a = self.w.everyday_act_refs(p, spec, t, payload, objects, None, refs);
        self.w.add(&a)
    }

    /// A payment to Ana: a real invoice from the node of the wallet paid,
    /// the payer's claim signed and held, the rail checked by the Lightning
    /// rail Module, and the rail's answer handed to the Agreements view as the
    /// caller states it (`paid_at`). Returns the claim's act id and the
    /// claim.
    fn pay(&mut self, payer: &mut Person, debt: Hash, paid_to: PaidTo, wallet: &SecretKey, amount: Amount) -> (Hash, Claim) {
        let c = Commitment { rail: mor_lightning::spec(), payee: self.ana.id, amount, fulfils: debt, payer: Some(Payer::Identity(payer.id)), paid_to, salt: [9; 16], purchase: None };
        let preimage = h(&format!("preimage {debt:?}"));
        let invoice = InvoiceBuilder::new(Currency::Regtest)
            .description_hash(bh::Hash::from_byte_array(c.hash()))
            .payment_hash(bh::Hash::from_byte_array(sha256(&preimage)))
            .payment_secret(PaymentSecret([7; 32]))
            .amount_milli_satoshis(amount.value * 1000)
            .duration_since_epoch(Duration::from_secs(1_790_000_000))
            .min_final_cltv_expiry_delta(80)
            .build_signed(|m: &Message| Secp256k1::new().sign_ecdsa_recoverable(m, wallet))
            .unwrap()
            .to_string();
        let proof = Proof { paid_to, salt: [9; 16], rail: LnProof { invoice, preimage: Some(preimage) }.encode() }.encode();
        let claim = Claim { rail: mor_lightning::spec(), proof, payee: self.ana.id, amount, fulfils: debt, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None };
        let id = self.act(payer, mips().money, fin::types::CLAIM, Payload::Claim(claim.clone()).to_map(), None, None);
        // The rail's answer, by the cMIP and the rail Module.
        let ln = Lightning;
        let held = AgreementsHeld { view: self.view() };
        let rec = Record::Claim(&claim, payer.id, &Citations::default());
        assert_eq!(verify(rec.clone(), &held, &Modules::new().adopt(&ln)).answer, Answer::Valid, "the rail's proof is good");
        let at = paid_at(&rec).unwrap();
        self.rail_valid.insert(id, at);
        (id, claim)
    }

    fn debt(&mut self, label: &mut Person, deal: Hash, value: u64, named: Hash) -> Hash {
        let o = Payload::Obligation(Obligation { debtor: label.id, creditor: self.ana.id, amount: sat(value), pointer: named, agreement: Some(deal) });
        self.act(label, mips().money, fin::types::OBLIGATION, o.to_map(), None, None)
    }

    /// What the payment cMIP judges beside the rail, for a claim, through
    /// an Agreements client.
    fn beside(&self, claim: &Claim, payer: &Hash) -> Answer {
        let held = AgreementsHeld { view: self.view() };
        beside(Record::Claim(claim, *payer, &Citations::default()), &held)
    }
}

/// The whole story, step by step.
#[test]
fn the_stolen_phone() {
    let mut w = World::new();
    let homes = vec![w.operator("Ana's own home"), w.operator("a public home"), w.operator("another public home")];
    let (main, backup, elsewhere) = (Clockwork::new("the public chain"), Clockwork::new("a backup chain"), Clockwork::new("a chain Ana never named"));

    // Ana's genesis: three homes (the default majority, two of three), her
    // clock (main and backup), and a vault for amounts above 50,000 sat.
    let clock = Clock { main: main.reference(), backup: Some(backup.reference()) };
    let ana_vault = node("Ana's vault node");
    let decls = vec![
        fin::clock_declaration(&mips().money, &clock),
        fin::vault_declaration(&mips().money, &[VaultEntry { unit: unit(Network::Regtest), rail_module: mor_lightning::spec(), source: address(&ana_vault), limit: 50_000 }]),
    ];
    let mut ana = w.genesis_with("Ana", homes.iter().map(home).collect(), None, None, Some(decls), 3);
    let mut s = Story { w, homes, anchors: Anchors::new(), rail_valid: BTreeMap::new(), main, backup, elsewhere, ana: ana.clone() };
    let aid = ana.id;
    let mut label = s.w.genesis("the label", vec![common::own_home()], None, None);
    let mut mallory = s.w.genesis("a payer colluding with the thief", vec![common::own_home()], None, None);
    let mut lazy = s.w.genesis("a payer whose wallet never anchors", vec![common::own_home()], None, None);

    // Ana's wallet, and her signature on the label's deal citing it (F163).
    let ana_node = node("Ana's node");
    let rail = |n: &SecretKey| vec![Rail { module: mor_lightning::spec(), address: address(n) }];
    let v1p = Payload::PayeePointer(PayeePointer { payee: aid, version: 1, previous: None, rails: rail(&ana_node) });
    let v1 = s.act(&mut ana, mips().money, fin::types::PAYEE_POINTER, v1p.to_map(), None, None);
    let deal = s.act(&mut label, mips().agreements, agreements::types::TERMS, vec![], None, None);
    let on = |t: Hash| Some(vec![Object { chain: t, predecessor: t }]);
    s.act(&mut label, mips().agreements, agreements::types::SIGNATURE, agreements::signature_payload(&deal), on(deal), None);
    s.act(&mut ana, mips().agreements, agreements::types::SIGNATURE, agreements::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v1)]));

    // The phone is stolen. The thief publishes its own wallet as Ana's
    // version 2 and signs the deal again, citing it: the deal is re-pointed
    // (F170: the window's cost, borne by Ana).
    let thief_node = node("the thief's node");
    let mut thief = ana.clone();
    let v2p = Payload::PayeePointer(PayeePointer { payee: aid, version: 2, previous: Some(v1), rails: rail(&thief_node) });
    let v2 = s.act(&mut thief, mips().money, fin::types::PAYEE_POINTER, v2p.to_map(), None, None);
    let resigned = s.act(&mut thief, mips().agreements, agreements::types::SIGNATURE, agreements::signature_payload(&deal), on(deal), Some(vec![Ref::Act(v2)]));
    assert_eq!(s.view().pointer_holding(&deal, &aid).unwrap().pointers.len(), 2, "the re-pointed deal now selects the thief's wallet");

    // The window. Royalties, each a debt under the deal, paid where the
    // label's wallet finds the deal pointing: the thief's node.
    let to_thief = PaidTo::Flow { pointer: v2, rail: 0 };
    let d1 = s.debt(&mut label, deal, 20_000, v2);
    let (c1, claim1) = s.pay(&mut label, d1, to_thief, &thief_node, sat(20_000));
    s.anchor(c1, "main", 100); // the label's wallet anchors at once (F169)
    let d2 = s.debt(&mut label, deal, 20_000, v2);
    let (c2, claim2) = s.pay(&mut mallory, d2, to_thief, &thief_node, sat(20_000));
    s.anchor(c2, "elsewhere", 90); // early, but on a clock Ana never named
    let d3 = s.debt(&mut label, deal, 20_000, v2);
    let (_, claim3) = s.pay(&mut lazy, d3, to_thief, &thief_node, sat(20_000)); // never anchored
    for d in [d1, d2, d3] {
        assert_eq!(s.view().paid_toward(&d), 20_000, "in the window, everything that followed the published chain counts");
    }

    // Ana changes her locks: a rotation disowning the thief's acts. She
    // anchors it herself at once, but holds it back from her homes.
    let (rot_act, ana_after) = s.w.rotation(&ana, Rot { disowned: Some(vec![v2, resigned]), ..Default::default() });
    let rot = rot_act.id();
    s.anchor(rot, "main", 105);
    // Meanwhile an honest payment, anchored at 130: the chain as published
    // still points at the thief.
    let d4 = s.debt(&mut label, deal, 20_000, v2);
    let (c4, claim4) = s.pay(&mut label, d4, to_thief, &thief_node, sat(20_000));
    s.anchor(c4, "main", 130);

    // She publishes it. Her own home receipts first; the public homes
    // after. Until the homes hold it, it does not count at all.
    assert_eq!(s.w.v.resolve(&aid).links.len(), 1);
    s.w.add(&rot_act);
    let mut receipts = vec![];
    for i in 0..3 {
        let mut op = s.homes[i].clone();
        receipts.push(s.w.receipt(&mut op, &aid, &rot, 1));
        s.homes[i] = op;
    }
    s.ana = ana_after.clone();
    assert_eq!(s.w.v.resolve(&aid).position_of(&rot), Some(1), "the majority of her homes holds it: it counts");
    assert_eq!(s.w.v.status(&v2), Status::Void);
    for d in [d1, d2, d3, d4] {
        assert_eq!(s.view().paid_toward(&d), 20_000, "counting, but not anchored: Ana still bears the window");
    }

    // Her client obtains the quorum's receipts and anchors them on the main
    // clock (F181): her own home's at 151, the public homes' at 160 and 170.
    let q = s.w.v.quorum(&aid, &rot).unwrap();
    let mine: Vec<Hash> = match &q {
        mor_core::chain::Quorum::Homes { need: 2, supports } => supports.iter().flatten().copied().collect(),
        other => panic!("{other:?}"),
    };
    assert_eq!(mine, receipts);
    s.anchor(receipts[0], "main", 151);
    assert_eq!(s.view().paid_toward(&d3), 20_000, "one home's receipt is no quorum: no point yet (F180)");
    s.anchor(receipts[1], "main", 160);
    s.anchor(receipts[2], "main", 170);
    assert_eq!(fin::quorum_point(&q, &rot, &s.anchors, &s.main.reference()), Some(160), "the point: the second home's anchored receipt");

    // The verdicts, by the core.
    let paid = |s: &Story, d: &Hash| s.view().paid_toward(d);
    assert_eq!(paid(&s, &d1), 20_000, "anchored at 100, before the point: the label does not pay twice");
    assert_eq!(paid(&s, &d2), 0, "the colluding payer anchored on a clock Ana never named (F176)");
    assert_eq!(paid(&s, &d3), 0, "never anchored: the payer bears, by its choice of wallet");
    assert_eq!(paid(&s, &d4), 20_000, "anchored at 130: the rotation held back from 105 set no point (F177, F180)");

    // And by the payment cMIP, through an Agreements client, beside the rail.
    assert_eq!(s.beside(&claim1, &label.id), Answer::Valid);
    assert!(matches!(s.beside(&claim2, &mallory.id), Answer::Invalid(w) if w.contains("rule 15")));
    assert!(matches!(s.beside(&claim3, &lazy.id), Answer::Invalid(w) if w.contains("rule 15")));
    assert_eq!(s.beside(&claim4, &label.id), Answer::Valid);

    // After the lock change: the deal points at Ana's wallet again; a
    // payment to the thief, even anchored, does not count; one to her own
    // wallet does. Rule 12a reads the same selection: the rail Module of
    // the wallet paid, as the chain stood for the payment.
    let mut ana = ana_after;
    let _ = &mut ana;
    assert!(!s.view().pointer_holding(&deal, &aid).unwrap().pointers.contains(&v2), "a voided act holds nothing for money");
    let d5 = s.debt(&mut label, deal, 20_000, v1);
    let (c5, _) = s.pay(&mut label, d5, to_thief, &thief_node, sat(20_000));
    s.anchor(c5, "main", 200);
    assert_eq!(paid(&s, &d5), 0);
    let d6 = s.debt(&mut label, deal, 20_000, v1);
    s.pay(&mut label, d6, PaidTo::Flow { pointer: v1, rail: 0 }, &ana_node, sat(20_000));
    assert_eq!(paid(&s, &d6), 20_000);
    // Above her vault's limit, to the flow: never protected.
    let d7 = s.debt(&mut label, deal, 60_000, v2);
    let (c7, claim7) = s.pay(&mut label, d7, PaidTo::Flow { pointer: v1, rail: 0 }, &ana_node, sat(60_000));
    s.anchor(c7, "main", 1);
    assert_eq!(paid(&s, &d7), 0);
    assert!(matches!(s.beside(&claim7, &label.id), Answer::Invalid(w) if w.contains("14a")));
}
