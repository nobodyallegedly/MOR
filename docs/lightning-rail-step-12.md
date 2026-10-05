# Roadmap step 12: the Lightning rail

*2 October 2026. Branch `claude/lightning-rail-step-12`, not merged. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved yet.*

## What was written

- **Finance draft 6** (`spec/MIP-finance-draft-6.md`; draft 5 kept until approval). Rule 14a confirmed as drafted. F111 as rule 14b, client conformance: warn before pricing in an uncovered unit; show uncovered debts; a refusing wallet sends the payee an ordinary inbox message. F112: definitions of payment cMIP, rail Module and conversion service; the payment task rewritten (one payment cMIP per agreement fills it, each rail a rail Module under it with its own verification rule, receipts signed by receivers, claims by payers, nothing signed or "produced" by a specification); conversion and custodial flow services are identities; "rail Module" throughout. Two new reasoning entries, the open parameters updated, one new scenario line.
- **The payment cMIP, draft 1** (`cmips/cmip-payment-draft-1.md`). How rail Modules plug in; the **payment commitment** (one hash of rail, payee, amount, what it fulfils, payer, where paid, and a salt), which every rail carries; the proof a receipt or claim carries; how they are verified; how a wallet chooses where to pay and what it does when it cannot.
- **The Lightning rail Module, draft 1** (`modules/module-lightning-rail-draft-1.md`). A BOLT 11 invoice signed by the node the payee declared, whose description hash is the payment commitment, and its preimage. The rule answers valid, invalid, pending (no preimage) or unknown (a required feature it does not know, or a pointer it does not hold).
- **Units** (`modules/units-bitcoin-draft-1.md`): the satoshi, and one unit for each test network. *A regtest satoshi is not a satoshi.*

## What was built

- **Core library** (`core/src/finance.rs`): Finance's exact formats (payee pointer, vault entries, obligation, receipt, claim), who must sign each, which pointer counts (rule 12), and where a payment may go under the vault (rules 14a and 16).
- **Payment cMIP** (`cmips/payment`, crate `mor-payment`): the commitment, the proof, the rail Module interface, verification.
- **Lightning rail Module** (`modules/lightning`, crate `mor-lightning`): a BOLT 11 decoder written from the specification, checked against an independent decoder (`lightning-invoice`) and against lnd's own; the rule; a client for lnd.
- **Regtest network** (`modules/lightning/regtest/up.sh`): btcd and three lnd nodes, on this machine only.
- **End-to-end test** (`harness/tests/lightning_rail.rs`), on **regtest**: test identities on a throwaway home; Alice tips Bob 1,234 regtest satoshis; Bob signs the receipt, Alice the claim, each delivered sealed to the other's inbox; both verify both as valid. 50,000 (above Bob's limit of 10,000) goes to his vault node and verifies there. 500 signet satoshis (a unit Bob's vault does not cover) is refused, and Bob gets an inbox message saying what, in which unit, and why. 20,000 to Dana, whose vault is on-chain only, is refused, and Dana is told.

Not built: a TypeScript wallet (the harness plays the wallet, as it plays the clients in the gauntlet); the WebAssembly bindings for Finance; obligations' discharge (rule 7); routes, conversion and batches; the RV32IM program of the rule (its profile is not published).

## Questions a, b and c

### a. How a verifier ties the proof to the payee's MOR identity

*In plain words:* the payee's payee pointer, signed with its MOR key, names its Lightning node. An invoice counts only if that node signed it. The invoice carries the payment commitment, so the node has signed who pays, how much and for what. Paying it reveals the secret. So the payer cannot fake a payment (it cannot sign as the node, and gets the secret only by paying), and the payee cannot deny one (the payer holds the signed invoice and the secret).

*Precisely:* the payment cMIP's `paid-to` names the payee-pointer act and rail index, or the genesis or rotation declaring the vault and entry index; the verifier finds the node key there, signed by the payee; the rule recovers the invoice's signing key and requires it to be that key, the description hash to be the commitment hash, the amount exact, and SHA-256(preimage) to be the payment hash.

Options considered:
1. **The node key named in the payee's own pointer or vault, and the commitment in the invoice** (built). Strong, needs nothing new. Cost: it links the MOR identity to its Lightning node publicly.
2. A two-way link between the node and the identity (Identity task 3, outside link proofs): the node signs a statement naming the identity. Stronger against a pointer naming someone else's node, but heavier, and a pointer naming someone else's node only sends the payer's money to that node.
3. The payee's MOR key signs each invoice. Needs the MOR key online for every payment, which the vault exists to avoid.

**Lean: 1.** It is built and tested; neither side alone could fake a payment in any of the tests.

### b. What a vault entry's "source" means for Lightning

*In plain words:* nothing can be worked out offline on Lightning, unlike an on-chain wallet's addresses. The source names the vault's own node; the payer asks it for a fresh invoice each time and checks the invoice against the key in the vault.

Options:
1. **The node key, with a hint where to ask** (built): `[network, node key, ? endpoint]`, the same form as a pointer's address. A fresh invoice per payment is the fresh address.
2. A BOLT 12 offer: more private (blinded paths), but its invoices may be signed by keys derived per offer, and lnd does not support it yet.
3. An LNURL address: rests on a web server and its certificate, which no verifier can check later. Not proposed.

**Lean: 1**, with 2 as a later Module. *Stated cost: a Lightning vault is only as safe as the vault node's key, which sits on a machine that is online. It protects against a thief with the everyday MOR key (who cannot change the vault's node), not against someone who takes the node.* Finance draft 6 words the source as "what the rail Module needs to obtain a fresh receiving address", covering both deriving and issuing.

### c. How an agreement says which rail Modules count (F112, open: not decided)

*In plain words:* an agreement names one payment cMIP. A receipt names a rail Module. Something must say which rail Modules count under that agreement, so two clients, and a collective's lanes, agree.

*What building showed:* a receipt is a Finance act (its `spec` is the Finance MIP), so the core places every receipt in the Finance lane, whatever rail it names. The freeze suite's step 3.7g ("a receipt of another payment cMIP the terms name nowhere counts for nothing", Q16) and the core library's test for it model a receipt as an act of the payment cMIP; under F112 that is no longer what a receipt is. Q16 can only bite through the rail Module the receipt names in its field 0.

Options:
1. **The payment cMIP lists its rail Modules.** A new rail means a new payment cMIP and a clone of every agreement using it. Simplest check; rigid.
2. **Any rail Module whose specification names the agreement's payment cMIP** (Production field 5, "implements"). Open to new rails without a clone; anyone can publish a Module claiming to implement it.
3. **The payee's own pointer or vault chooses**, among rail Modules that implement the agreement's payment cMIP (2, narrowed by the receiver). The receiver already decides where it is paid; in a collective, its pointer is signed in its Finance lane, so the Finance holder chooses rails without a clone. Q16 reads: a receipt naming a rail Module that does not implement the adopted payment cMIP counts for nothing.
4. **The terms name rail Modules**, beside the payment cMIP (a new terms field, Law): most explicit; a Law change, and every new rail a clone.

**Lean: 3.** It follows "the receiver decides where it is paid", needs no Law change, and gives Q16 a mechanical reading. Its cost: a Module's field 5 is its creator's own claim, so a payee could list a lax Module; it harms only receipts paid to that payee, and every verifier sees which Module it was. Not built: verification currently accepts any rail Module the verifier has adopted.

## Flaws found in the MIPs

**L1. A Lightning proof does not show who paid** (Finance rule 10a, F80; rule 18). Rule 10a gives a refund on an anonymous payment to "whoever presents the rail proof", because "only the payer holds that proof". On Lightning that is false: the payee and every node on the route learn the preimage. Any of them could claim the refund. Named payers are safe: the commitment names them, and only they can sign the claim.
- Options: (1) the anonymous payer puts a bare key of its own (the kind rule 18 already uses for delivery) in the payment commitment; a refund is owed to whoever signs with that key. (2) The payer commits to the hash of a secret only it knows, and presents it. (3) Keep the rule and state the cost: on Lightning, a route node or the payee can take an anonymous refund. (4) Leave it to each rail Module.
- **Lean: 1.** One sentence in rule 10a ("whoever signs with the key the payment committed to, where the rail cannot show the payer"), and the commitment's payer field takes a bare key. *Built meanwhile:* a claim on an anonymous payment answers unknown, with the reason; refunds are not built.

**L2. Rule 14a does not say which limit applies when a unit has several vault entries** with different limits. "No larger than that entry's limit": which entry?
- Options: (1) the smallest limit (fail closed); (2) the largest; (3) all entries of a unit must carry the same limit, or the vault is shown as malformed; (4) per rail.
- **Lean: 1**, the smallest: it is the safe side, and needs no new invalidity. *Built meanwhile:* below the smallest, to the flow; above the largest, to the vault; between, refused as unsettled.

**L3. Production rule 17 has a Module signing** ("provided the module's use record is signed by the module"). Under F112 a specification signs nothing.
- Options: (1) the evidence of a Module's use is the receipt or claim naming it (field 0), signed by the receiver or the payer; (2) a use record signed by the identity that operated the service running the Module (a conversion or split service); (3) both, by case.
- **Lean: 1** for rail Modules (the receipt already names the Module and is signed by someone other than the split service), 2 for services. A wording change in Production and Law's role shares.

**L4 (F112, part of question c). Receipts are Finance acts, but the freeze suite and the core library treat them as the payment cMIP's.** See c.

**Input for F110** (deferred "until after the Lightning work"): the payment cMIP and the Lightning rail Module needed no acknowledgement anywhere. Receipts and claims stand on the commitment and the rail proof. So option 2 (only Identity, Finance and Law's own act types carry acknowledgements) costs nothing for payments.

**Stated costs, not flaws:** a claim without its preimage stays pending forever (no clock, so no expiry); a Lightning vault is only as safe as an online node; a payee pointer naming a node links the identity to it publicly; an invoice for a fraction of a satoshi cannot be a MOR payment; keysend and AMP payments prove nothing.

## Wording changes for the next core version (not made)

*Core v20 waits on the Law branch; these are listed, not written.*

**The core document** (v19):
1. Finance, "Settlement receipt": "Every rail module, whether Lightning, stablecoin or fiat, emits the same receipt" → "Whatever the rail, Lightning, stablecoin or fiat, the receiver signs the same receipt … Only the rail's proof differs, checked by the rule of the rail Module it names."
2. Finance, "Routes across rails": "conversion services carry the money in hops" → "conversion services, identities paid under their own offers, carry the money in hops".
3. Finance, "Flow and vault": "each with a source the rail derives fresh addresses from" → "each with a source under which its rail Module obtains a fresh address for every payment". *(F111 itself changes nothing in the core document.)*
4. Finance, "Tasks: payment, per rail; conversion." → "Tasks: payment, one payment cMIP per agreement with a rail Module for each rail beneath it; conversion. Receipts are signed by receivers and claims by payers; no specification signs."
5. "Outside the core": "Payment rails, units, vault address derivation | Payment modules and unit specifications" → "Payment rails, units, vault receiving addresses | Rail Modules under the payment cMIP, and unit specifications"; "Rate limits on the flow | Custodial flow services" stays (services are identities).
6. Glossary: add "Payment cMIP: the cMIP an agreement names for payment; rail Modules plug in beneath it." and "Rail Module: a Module under the payment cMIP for one rail: its addresses, its proof and the rule that checks it. It signs nothing." Add "Conversion service: an identity that receives on one rail or unit and pays on another, under its own offer."

**Production, rule 8 and around it** (draft 5):
7. Rule 8: "Several Modules may operate at once under one task (for example several payment modules for different rails), each implementing a cMIP." → "Several Modules may operate at once under the one cMIP an agreement names for a task (for example several rail Modules under the payment cMIP, one per rail), each naming that cMIP in its field 5. A Module is a specification: it signs nothing; the identities acting under it sign."
8. Task table, row 6: "Payment, per rail | an obligation, offer or payee pointer and an amount, or a vault entry | a settlement receipt and its verification rule; a derived receiving address" → "Payment | an obligation, offer or payee pointer, an amount, and the flow rail or vault entry paid to | how rail Modules plug in; how a payment carries what its receipt and claim say; how the receiver's receipt and the payer's claim carry a rail's proof, and the rule that checks it; how a fresh receiving address is obtained under a vault entry".
9. Task table, row 7: "Conversion | a hop on one rail | a receipt forwarding on another" → "Conversion | a conversion service's offer, and a hop received on one rail | how the service's receipt with a forward, and its onward hop, are evidenced".
10. Definition of verification rule: "such as a payment module's check of a rail proof" → "such as a rail Module's check of a rail proof".
11. Rule 17 (flaw L3), and freeze scenario line "A payment module's verification rule run by two different clients" → "A rail Module's verification rule …".

**The freeze test suite** (v19):
12. Component "Flow and vault: per-unit, per-rail entries with derived addresses" → "… with a fresh receiving address per payment, derived or issued under the entry's source".
13. Scenario 5, step 2 (the flow-off step; the only suite change F111 asks for): add "A tip in a unit the journalist's vault does not cover is refused by the reader's wallet, which tells the journalist in its inbox; the debt stays open."
14. Scenario 2, step 5: "the payment module's verification rule" → "the rail Module's verification rule".
15. Scenario 3, step 7g: "A receipt of the payment cMIP the label's terms name for task 6" → "A receipt naming a rail Module under the payment cMIP the label's terms name for task 6", and "A receipt of another payment cMIP the terms name nowhere" → "A receipt naming a rail Module under no payment cMIP the terms name" (exact wording follows the answer to c).
16. Scenario 2, step 6 (the anonymous refund claimed by proof): follows the answer to L1.

## Tests

Rust workspace: **253 passed, 0 failed** (237 on main before this step), run with the regtest network up. New: core Finance 7, Lightning rule and decoder 8 (200 invoices decoded alike by our decoder and `lightning-invoice`), end-to-end on regtest 1 (lnd's own `decodepayreq` agreeing with ours). The end-to-end test runs only with `MOR_LN_REGTEST` set; without it, it says so and passes. The TypeScript clients were not touched. Built with btcd 0.24.2 and lnd 0.18.5-beta, checked against their release manifests.

## The human test, on the Mac

See `modules/lightning/README.md`; the exact commands are in the session report.
