//! The Bitcoin clock Module, draft 1 (`modules/module-bitcoin-clock-draft-1.md`):
//! a clock under the anchoring cMIP (`cmips/cmip-anchoring-draft-1.md`;
//! F202: "cMIP is the anchoring, modules are the clocks"). **Experimental.**
//!
//! - **Its reference** is one Bitcoin network: `[ this Module's spec,
//!   network ]` ([`reference`]), the shape of Finance's clock entry and
//!   Law's time reference.
//! - **Its point is the block** (F201): an anchor's point is the height, on
//!   the chain the verifier follows, of the block that carries it. Two
//!   anchors in one block are at the same point.
//! - **A payment's proof is its anchor** (F201): an on-chain rail proof
//!   anchors the receipt or claim whose payment commitment the transaction
//!   pays, recomputed from that act by the payment cMIP ("the anchoring
//!   task accepts a commitment naming its act"), where it passes this
//!   Module's check: the rail's rule answers valid on the chain the
//!   verifier follows ([`BitcoinClock::payment_anchor`]).
//! - **The same depth** (F205): an anchor counts once its block has as many
//!   confirmations as the on-chain rail Module requires; one number for
//!   both.
//! - **Checked against the real chain** (F204): the chain's headers are
//!   data the client hands over ([`crate::chain::HeaderChain`]).
//! - **Batch anchors** (step 14a's pooled anchoring service) are this
//!   Module's other proof, not defined before step 14a: such a proof is not
//!   accepted yet ([`BitcoinClock`]'s [`AnchoringCmip::verify`]).

use crate::chain::HeaderChain;
use crate::{Network, Onchain, OnchainProof};
use mor_core::cbor::Value;
use mor_core::envelope::anchoring::{Anchor, AnchoringCmip, Reference};
use mor_core::hash::{sha256, Hash};
use mor_payment::{Answer, Held, Modules, Proof, Record};

/// This Module's spec hash. A test value until its creator is named at
/// step 17.
pub fn spec() -> Hash {
    sha256(b"Bitcoin clock Module, draft 1, test value until publication")
}

/// The time reference this Module names for a network: `[ spec, network ]`.
/// What a clock entry names (Finance, "clock"; F202).
pub fn reference(network: Network) -> Reference {
    Reference { cmip: spec(), params: Value::Uint(network.number()) }
}

/// The pair `(clock Module, rail Module)` this Module declares: it reads
/// the on-chain rail's proofs as payments' anchors (F201). What a Law
/// client hands the core's Law view (`LawView::rail_clocks`).
pub fn reads() -> (Hash, Hash) {
    (spec(), crate::spec())
}

/// The clock, with the chain the verifier follows.
pub struct BitcoinClock<'a> {
    pub chain: &'a HeaderChain,
}

impl BitcoinClock<'_> {
    /// F201: the anchor an on-chain payment's proof gives the receipt or
    /// claim `act` (`record`, held as `act`): the payment's block, on this
    /// clock's reference. `None` where the record is not on the on-chain
    /// rail, or its rail answer is not valid on the chain this clock
    /// follows (pending, short of the depth, a block off that chain,
    /// invalid): no anchor.
    pub fn payment_anchor(&self, act: &Hash, record: &Record, held: &dyn Held) -> Option<Anchor> {
        let (rail, proof) = match record {
            Record::Receipt(r) => (&r.rail, &r.proof),
            Record::Claim(c, ..) => (&c.rail, &c.proof),
        };
        if rail != &crate::spec() {
            return None;
        }
        let onchain = Onchain::on(self.chain);
        if mor_payment::verify(record.clone(), held, &Modules::new().adopt(&onchain)).answer != Answer::Valid {
            return None;
        }
        let point = OnchainProof::decode(&Proof::decode(proof)?.rail)?.height_on(self.chain)?;
        Some(Anchor { act: *act, reference: reference(self.chain.network()), point })
    }
}

impl AnchoringCmip for BitcoinClock<'_> {
    fn spec(&self) -> Hash {
        spec()
    }

    /// A batch anchor (step 14a): not defined before that step, so no proof
    /// is accepted. A payment's anchor is [`BitcoinClock::payment_anchor`],
    /// since it needs the act's content, not only its id.
    fn verify(&self, _act: &Hash, params: &Value, _proof: &[u8]) -> Option<u64> {
        let _ = Network::from_number(match params {
            Value::Uint(n) => *n,
            _ => return None,
        })?;
        None
    }
}
