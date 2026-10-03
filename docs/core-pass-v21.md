# The core pass: core v21

*3 October 2026. Branch `claude/core-pass-v21`, from main, with `claude/lightning-rail-step-12` merged in; not merged. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved yet; the approved versions stay in `spec/` beside the new ones until approval.*

## 0. Main, before anything else

Main (`e16655f`, after Law draft 9's merge) passes every test: Rust workspace 239/239; clients genesis 13, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 18, connector 12, desk 8, all typechecking. The merge broke nothing, so nothing was fixed.

One thing to know: the air-gap signer's command-line test (`modules/airgap/tests/cli.rs`) failed once with "broken pipe" when the whole workspace ran at once, and passed every time alone and on the full rerun. It is a timing race in the test (the signer refuses a bad file before reading what the test types to it), not a fault in the signer, and the Law merge did not touch it. Left as is; a one-line fix in the test (ignore a closed pipe when writing) is there for whoever wants it.

## 1. What each new version changes

| File | What changes |
| --- | --- |
| `spec/MIP-finance-draft-6.md` (revised, still draft 6) | 14a confirmed; F111 (rule 14b); F112. Now also: **F113** an anonymous payer may put a one-time signing key of its own in the payment commitment; a refund goes to whoever signs with it (rules 1, 10a; receipt field 2 takes the key; claim field 8 carries its signature). **F114** several entries for one unit: the smallest limit (rule 14a). **F115** the agreement names the payment cMIP, the payee's pointer or vault names the rail Modules it accepts, and a receipt or claim counts only on one of those (new rule 12a). **F116** evidence of a rail Module's use is the receipt or claim naming it (rule 10b). **F117** the Lightning Module experimental, its costs stated (reasoning). L1, L2 and question c removed from the open list. |
| `spec/MIP-envelope-draft-7.md` | **F108** a publication's size is its unlocked media's (field 3; a mismatch shown as inconsistent). **F110** only Identity, Finance and Law act types may carry `acks` (rules 4a, 7b); any other act carrying them is invalid. Flaw V1 noted as open. |
| `spec/MIP-identity-draft-11.md` | **F110** the witness act, type 15: empty payload, `acks` naming what it relies on, no `objects`; client conformance: never a side effect, explained before signing (rules 18b, 18c). |
| `spec/MIP-production-draft-6.md` | **F112** rule 8, task table rows 6 and 7, the verification rule's definition. **F116** rule 17: evidence of use is a receipt or claim for a rail Module, a record signed by the operating identity for a service; a Module signs nothing. |
| `spec/02-MOR-core-v21.md` | The sixteen wording changes of step 12 (the six for the core document here; Production's in draft 6; the suite's in v21). F110, F111, F113 to F116 in plain words; F108. "Specialized fork" in the evolutionary model, the table of what lies outside the core, and the glossary. The Law section rewritten for plain reading, under headings, with a short list of defined words; no rule changed (checked below). The long version history moved to the end. |
| `spec/03-MOR-freeze-test-suite-v21.md` | Lines for F108 (2.1b), F110 (2.5c, 5.5b, and a component line: a text act carrying `acks` invalid, a cMIP reaction carrying `acks` invalid, a witness act keeping a disowned post disputed, a buyer's claim doing the same for a publication), F111 (5.2), F113 (2.6, 2.6b: a routing node holding the preimage cannot claim the anonymous refund), F114 (5.2), F115 (3.7g rewritten), F116. Step 5.3's negotiation thread marked open (V1). |
| `docs/07-MOR-in-one-page-v6.md` | "Specialized fork", in one sentence under "Nobody plans the winners". |
| `cmips/cmip-payment-draft-2.md`, `modules/module-lightning-rail-draft-2.md` | Changed only as far as testing the core needs: the payer may be a bare key (F113); a receipt counts only on a rail the payee named, and under an agreement only on a Module implementing its payment cMIP (F115); the Module labelled experimental, with a "Costs, stated" section clients must show (F117). |

**Does Law rule 19 read alike for F116? No.** Rules 19 and 22 still speak of "a module's signed use record"; rule 32 still sends an anonymous refund to "whoever presents the rail proof" (F113); and the scenario lines at the end still call receipts the payment cMIP's acts (F112, F115). **Law needs a draft 10**, which this pass did not write. It would also carry the answers to V1 and V2 below.

## 2. Flaws found

**V1. Negotiation records can no longer carry acknowledgements** (Law rule 56 against F110).
*Plain words:* Law proves a negotiation complete because each message acknowledges the last one from the other side. A message is a text act. F110 now says only Identity, Finance and Law acts may acknowledge. So, as written, a negotiation thread is either invalid or cannot prove it is complete. F110's own reasoning assumed negotiation messages were Law acts; Law defines no such act.
- (a) **Law draft 10 defines a negotiation message**, a Law act carrying text (canonical, with a format as the Text MIP allows) and `acks`. Negotiation stays exactly as described, and stays private. Cost: a new Law type; a negotiation needs a Law client, which it needs anyway to sign the deal.
- (b) Rule 56 drops acknowledgements: each message names, in `objects`, the previous message and the latest one received (a merge in the thread's chain). Completeness is proven the same way. Lost: a disowned message of the other side would be void instead of disputed, unless the receiver signs a witness act, which is public.
- (c) An exception in Envelope for text acts in a negotiation thread. Breaks the simple check by type that F110 chose.
- **Lean: (a).** It keeps F110's line and Law's promise, and it is Law's record.
*Left open in the texts (Envelope draft 7, core v21, suite v21 step 5.3), not worked around. No code implements negotiation yet.*

**V2. A rail Module's evidence of use against Law rule 22** (F116).
*Plain words:* F116 says the receipt naming a rail Module is the evidence that the Module was used. But in a split, the receipt for the incoming payment is signed by the split service, and Law rule 22 accepts as role-share evidence only acts signed by someone other than the split service and the payee. So the evidence F116 names is the one kind rule 22 refuses; only the payer's claim, which payers publish by choice, would remain.
- (a) Rule 22 accepts the receipt for a rail Module's role share, because the service does not choose the Module: the payee's own pointer names it (F115) and the Module's rule checks the proof. Cost: a pointer naming two Modules for one rail lets the service pick which one earns.
- (b) Rule 22 unchanged: a rail Module earns only where the payer published a claim.
- **Lean: (a).**

**V3 (a question, not a flaw). A witness act is public.** Every Identity act is public (Envelope rule 8), so a witness act shows everyone which act its signer relies on, though never what it says. Someone keeping a threat as evidence may not want that seen. Options: (a) keep it public, the cost stated, as written now (the dispute it creates is meant to be visible); (b) allow a private witness act, an exception to rule 8. **Lean: (a).** Stated in Identity draft 11 and core v21.

**Readings taken, to check:**
- **R1 (F113).** "Rule 18's form" is an encryption key, which cannot sign; the committed key is read as a *signing* key in Identity's form. A payer wanting both delivery and refunds supplies both. The claim, as every act, still needs an identity as signer: an anonymous payer uses a one-time identity, and the key in field 8 shows it is the payer.
- **R2 (F115).** "In force for that payment" is judged by rules 12, 14 and 14a. In a collective, the core library checks that a counting pointer of the collective, or its vault in force, names the rail Module; which exact pointer a payment went to is inside the rail's proof, which the payment cMIP checks.
- **R3 (F110).** A verifier that does not know the Finance and Law hashes shows a non-Identity act carrying `acks` as unknown, never valid.

## 3. Law section: rules I could not restate plainly

An independent check compared the old and new Law sections rule by rule: 173 of 177 rules unchanged, 4 subtly changed (since fixed: "the hash of" a cMIP; "what any rule computes", not "an example"; role-share evidence on the split, not on what is paid; a grantee's act the collective acknowledged binds for good, not "until the refit"), none missing. These rules I could not make plain without risking a change of meaning; that is a flaw in the text, not only in the wording:
1. **"Judged under the agreement the collective's identity chain declared when its key signed the act."** It needs the reader to know that a collective's genesis or rotation declares its agreement, and that every act is bound to one of them.
2. **The judicial tasks "stay outside the Law lane, as each member signed them".** "As each member signed them" has no plain reading: it seems to mean they change only with every member who signed them (the protected clauses), but the text does not say so.
3. **A specification adopted for two layers "answers to both lanes, for its adoption and for its acts".** What "answers to" requires (both lanes' holders signing each act? only the adoption?) is not said.
4. **Extensions: adopted and dropped by the Production lane "together with the lane of each layer an extension declares".** Who must agree, in what order, is left to the reader.
5. **A departed member's earlier signature: "its signer a voice for that clone or act, the rule met or not as written".** It packs Q23 into one clause; it cannot be unpacked without an example.
6. **Forks: "records on lines that do not name each other … until a clone of either branch is recorded after both lines".** Correct, but it can only be followed with a picture.
7. **"A thief's signatures count only where the collective's key holders also signed."** Restated as "signatures made with the member's replaced key by whoever stole it", which is my reading of C5.

## 4. The code

- **Core library.** The verifier refuses `acks` on any act whose type is not Identity's, Finance's or Law's (invalid; unknown if it was not told the Finance and Law hashes), and counts only those acts as acknowledgements. The witness act (type 15) decodes and is checked. Finance: the payer may be a bare key; an anonymous claim's key must have signed it; the smallest limit applies. The Law view: a collective's receipt or claim naming a rail Module its pointers and vault never named counts for nothing (new answer `RailNotAccepted`).
- **Payment cMIP and Lightning Module.** Anonymous claims verified by the committed key; `verify_under` refuses a Module implementing another payment cMIP than the agreement names.
- **WebAssembly.** The verifier takes the Finance and Law hashes.
- **Genesis client.** Refuses to sign `acks` on any other act type; `witness` (and a `witness` command) signs a witness act only after the explanation was shown (the command asks you to type RELY).
- **Desk.** An act carrying `acks` it may not carry is shown as invalid; a witness act is shown as one; **Rely on this act…** explains first, and only **Sign the witness act** signs.

**Tests:** Rust workspace **260 passed, 0 failed** (255 on the merged branch before this pass); clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 18, connector 12, desk 8: **110 passed**, all typechecking. New: core F110 (likes and text replies keep nothing alive, a witness act and a buyer's claim keep posts disputed, witness shape), Finance F113 and F114, Law 3.7g rewritten for F115, Lightning F113 and F115 offline, genesis and desk witness acts (the desk's in a real browser). **On regtest** (btcd 0.24.2 and lnd 0.18.5-beta, checked against their release manifests' hashes): the Lightning test passes, with a new fifth payment: an anonymous tip of 777 whose commitment names a one-time key; the claim signed with it counts, and the payee, whose node learnt the preimage, cannot claim it.

## 5. The human test, on the Mac (the regtest run)

No real money: regtest coins exist only on your Mac. You need Rust, as for the other tests.

1. Download, for Apple silicon, `btcd-darwin-arm64-v0.24.2.tar.gz` and `manifest-v0.24.2.txt` from github.com/btcsuite/btcd/releases (v0.24.2), and `lnd-darwin-arm64-v0.18.5-beta.tar.gz` and `manifest-v0.18.5-beta.txt` from github.com/lightningnetwork/lnd/releases (v0.18.5-beta), into `~/mor-ln`.
2. Check them:
   ```
   cd ~/mor-ln
   shasum -a 256 btcd-darwin-arm64-v0.24.2.tar.gz lnd-darwin-arm64-v0.18.5-beta.tar.gz
   ```
   The two lines must read `ece9c708…1d05` and `f62d4e88…e07e`, as in the manifests.
3. Unpack, and let macOS run them:
   ```
   tar xzf btcd-darwin-arm64-v0.24.2.tar.gz && tar xzf lnd-darwin-arm64-v0.18.5-beta.tar.gz
   xattr -dr com.apple.quarantine btcd-darwin-arm64-v0.24.2 lnd-darwin-arm64-v0.18.5-beta
   ```
4. From the repository, on this branch (`git fetch && git checkout claude/core-pass-v21`):
   ```
   BTCD_DIR=~/mor-ln/btcd-darwin-arm64-v0.24.2 LND_DIR=~/mor-ln/lnd-darwin-arm64-v0.18.5-beta modules/lightning/regtest/up.sh ~/mor-ln/run
   MOR_LN_REGTEST=~/mor-ln/run cargo test -p mor-harness --test lightning_rail -- --nocapture
   modules/lightning/regtest/down.sh ~/mor-ln/run
   ```
5. Paste back the output of the second command. It should end with five lines: both sides hold a valid receipt and claim; 50,000 went to Bob's vault node; 500 refused and Bob told; 20,000 to Dana refused and Dana told; the anonymous tip of 777, claimed only by its committed key; then `test result: ok. 1 passed`.

## Waiting on Nobody, allegedly

In order: V1, V2, V3; the readings R1 to R3; whether Law draft 10 is written next; approval of Finance draft 6, Envelope draft 7, Identity draft 11, Production draft 6, core v21, suite v21 and the one-page v6; then the human test.
