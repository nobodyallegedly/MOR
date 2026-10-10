# MOR Findings Log, continuation: review round 2

*Continues MOR-findings-log.md from F53. Kept as a separate file during the round 2 work so each decision is a small write; merged into the main log at the consolidated revision.*

**Names, old to new (the rename pass, 10 October 2026, `docs/rename-pass.md`).** The entries below, and every other record, keep the names of their day; read them with this map. Wording only: no rule and nothing on the wire changed.
- **Layers** (F212): Envelope → **Envelopes**; Finance → **Money**; Law → **Agreements**; Production → **Development**; Identity and Text unchanged. "Finance rule 15" in a record is Money rule 15; `MIP-law-draft-10.md` is `MIP-agreements-draft-10.md`. In code: `layers::FINANCE`, `LAW`, `PRODUCTION`, `ENVELOPE_AND_TEXT` are `layers::MONEY`, `AGREEMENTS`, `DEVELOPMENT`, `ENVELOPES_AND_TEXT`, numbers unchanged (2, 3, 4, 1); the modules `law`, `finance`, `envelope` are `agreements`, `money`, `envelopes`.
- **Keys** ("The two keys renamed", 5 October 2026): the safety key → **the chain key**; the everyday key → **the signing key**; so a safety commitment, seed or scheme is a chain-key commitment, seed or scheme. "Everyday act", "everyday check" and "everyday line" are unchanged (acts signed with the signing key). The hash tag `"MOR/safety"` is unchanged; `module-airgap-safety-signer-draft-4.md` and the safety seed Modules are `module-airgap-chain-key-signer-draft-4.md`, `module-chain-key-seed-words-draft-1.md` and `module-chain-key-seed-hex-draft-1.md`.

## Round 2 review patterns (working rules)

Each finding names its pattern before its fix. Round 2 named three; the reaction added a fourth.

1. **What decides is signed by the wrong party.** A record that decides status or money counts only alongside something the party who benefits cannot produce alone: a second signature from the other side, or a valid act it points to.
2. **A lower layer depends on a higher layer's data.** A layer's validity may depend only on data that layer's own clients hold. Push a small field down; never pull a rule up.
3. **A rule that protects the owner also traps the owner.** Every protection an owner chooses must be removable by the owner's safety key alone; every protection others hold over a party must need that party's signature to change.
4. **A rule rests on a fact nobody can check.** Make the fact an act someone signs, move the rule to client conformance and say so, or drop it.

## Working rule: options with a forced default (Nobody, allegedly, F59)

Where the core offers the owner several options, one of them is the default when none is selected. The default is one of the declared options, never a third, weaker rule. This may be repeated elsewhere in the protocol when needed.

## Working rule: rare cases and markets (Nobody, allegedly, F63)

Costs that fall only on rare cases mostly super users will care about are acceptable. MOR expects markets to kick in where there is value to be protected.

## F53. A receipt counts only alongside the valid act it names (round 2, C2)

**Pattern:** 1.

**Found in review round 2 (C2):** the receipt checks in Identity draft 6 verify the operator's act, the home set, the audit proof and the kept ancestry, but never the identity-chain act the receipt names. Anyone holding a home operator's everyday key, or a dishonest home, could sign a second receipt at any past chain position naming a made-up act, create a "conflict", and un-count a rotation everyone had relied on; every act bound to that rotation then failed everyday check 2 and became invalid, not disputed. A home's everyday key was as powerful as the safety key of every identity relying on that home.

**Checked against the draft (Fable):** holds as written. The report's fix needed two extra conditions, found while drafting: the named act's identity and position must match the receipt's, otherwise a stolen key could receipt a real position-2 rotation "at position 3" and still manufacture a conflict.

**Decided (Nobody, allegedly):** accepted. "Not perfect, but pretty good."

**Resolution (Fable, accepted):** a new first receipt check in Identity:

*A receipt counts, or conflicts with another, only if the verifier holds the identity-chain act it names, that act passes the checks for its type (genesis or rotation), its signer or identity hash is the identity the receipt names, and its position is the position the receipt states (genesis is position 0). A receipt naming an act the verifier does not hold, or one that fails those checks, is neither support nor conflict.*

**Consequences:**
- A conflict now needs two valid rotations at one position, which needs the safety key. A stolen operator key alone can no longer touch any identity's chain.
- A home is proven dishonest only by receipting two genuine rotations: rule 11 broken and provable.
- Verifiers need only the identity chain they already fetch; two honest verifiers holding the same chain agree.
- Tests: exit unchanged; legibility improved (every conflict shows a real act); nothing moves to a cMIP; no conflict with other round 2 fixes; C1 and I3 shrink.

**Residual, on record, not solved here:** a genuine conflict (a thief with the safety key plus a home that receipts both rotations) still un-counts retroactively. Belongs with finality (C1, I5). *Partly resolved by F55: the verdict no longer reaches earlier positions.*

**Core changes:** Identity (Verification procedures: Receipt, new check before the current ones; Conflicting receipts and rule 10b read "two receipts that count"; Definitions: Receipt; Reasoning: "Receipts make homes answerable").

**Freeze suite changes:** scenario 5.7b rewritten: a thief with a stolen operator key signs a receipt naming a made-up act; it names no valid act and changes nothing; the identity is never contested. New 5.7d: the same stolen key receipts a thief's genuine rotation (the thief holds the safety key); the identity is contested at that position until the operator rotates; the audit settles which receipt is real; the journalist's earlier receipt under a cosigned summary survives. Pass criterion "no identity is frozen by a stolen home key" adds "nor contested by a forged receipt".

## F54. Signature schemes are named by number or by specification hash (round 2, C1, first move)

**Pattern:** 3, in the good-ancestor sense: the format `signing-key = [scheme: 1, key: bstr .size 32]` protects determinism today and traps every owner after an elliptic-curve break, since no rotation can install a post-quantum everyday key. The MOR 2 case study promised what the format forbade.

**Found in review round 2 (C1):** the way out after a break rests on schnorr-signed acts, and the everyday key can never leave schnorr.

**Options weighed:** reserved scheme numbers (the report's suggestion; a registry in the frozen text) or a specification hash naming a signature-scheme specification, like units (F34).

**Decided (Nobody, allegedly):** specification hash.

**Resolution (Fable, accepted):**
- `scheme = 1 / 2 / 3 / hash`: the founding numbers as now, or the hash of a signature-scheme specification (Production) that defines key encoding, signature encoding and verification. `key: bstr`, no size bound.
- The same form applies to the safety-key commitment, so that SLH-DSA itself can be replaced one day; the commitment already hashes `scheme || key`.
- A rotation's own validity never depends on the kind of everyday key it installs, so every client verifies the rotation; acts signed under a scheme a client lacks are unknown, never valid (F11, fail closed). Migration is by adoption.
- Signature-scheme specifications are a kind of specification in Production; how a client learns one is the same as for units.

**Not changed by this:** an identity that has not migrated its everyday key before a break is not saved by it. Case study 10 must say migration comes first (reaction).

**Core changes:** Identity (Encoding: signature schemes table gains the hash form; Shared parts: `signing-key`, `safety-commit`; Every act check 4 "scheme is known" reads "known to this client, otherwise unknown"); Envelope (signature field); Production (signature scheme as a kind of specification, alongside units); case study 10.

**Freeze suite changes:** scenario 8 adds: a signature-scheme specification is published; an identity rotates to an everyday key of that scheme; a client without it shows the identity's later acts as unknown and the rotation as valid; a client with it verifies them.

## F55. A dishonesty verdict never reaches backwards (round 2, C1, second move)

**Pattern:** 1 (a verdict producible by the home's everyday key alone, or by anyone after a break) and 4 ("from then on" was undefined).

**Found in review round 2 (C1):** two non-extending log summaries were "proof the home is dishonest" with no stated consequence, and a dishonest home's receipts counted for nothing "from then on" with no definition of "then". Read together, a stolen operator key today, or anyone after a break, could strip every receipt a home ever signed and un-count years of rotations for every identity there.

**Decided (Nobody, allegedly):** both rules, once shown to rest on different reasons: rule 1 closes C1; rule 2 makes an undefined word decidable and keeps "nothing relied on is silently erased" against a thief holding the safety key and a bad home, who may contest the future but not erase the past.

**Resolution (Fable, accepted):**
1. *Two non-extending summaries carry no verdict on receipts.* Auditors MUST NOT cosign further summaries of that home; clients SHOULD flag the home to its owners. Receipts under a cosigned summary stay protected (F45); the rest are judged as before.
2. *Dishonesty is position-bound.* A home proven dishonest for an identity at chain position n (two counting receipts for two genuine rotations at n, F53) counts for nothing at positions after n. Its receipts at positions before n keep counting. The chain position is the "then"; no clock.

**After F53, F54 and F55, post-break:** an owner holding both keys still leaves; an owner holding only the safety key can be blocked by a forged objection on a homeless rotation. Inherent; case study 10 says migration comes first.

**Core changes:** Identity (Log summaries and audits rule 1: consequence stated; Conflicting receipts rule 3 and rule 10d: "at positions after n"; Reasoning: "Homes audit each other", "Contested, not frozen").

**Freeze suite changes:** 5.7d (F53) adds: the home is proven dishonest at that position; the journalist's earlier rotations keep counting; a pair of forged non-extending summaries from the stolen key changes no receipt's standing, and the auditors stop cosigning.

## F56. A home closes by a rotation of its operator (round 2, I3)

**Pattern:** 1. "This home is gone", the fact that unlocks a homeless rotation no home can object to, was signed by the operator's everyday key. Side effect: the closure invalidated every later act in the operator's sequences, so an honest operator who closed gracefully lost their own identity.

**Found in review round 2 (I3):** a thief with a stolen operator key could close the home, making every identity there provably homeless; with a victim's safety key as well, the thief walked that identity out uncontested.

**Options weighed:** keep closure as an everyday act, narrow its effect, and make a homeless rotation resting on it provisional (the report); or declare closure in a rotation of the operator (Fable).

**Decided (Nobody, allegedly):** closure by rotation. "Closure is a rare, force-majeure case; a forced rotation is warranted."

**Resolution (Fable, accepted):**
- Act type 11 (home closure) is removed. The rotation payload gains a closure flag: the signer's home stops serving every identity.
- For the homeless procedure, a home is gone (step 4, first case) when a rotation of its operator that counts declares closure. Rule 34 reads: a home that closes SHOULD do so by rotation.
- The operator's identity continues under its new key; only the home role ends. No sequence is invalidated.
- Follows the F10 principle: anything whose theft causes lasting harm is changed only with the safety key.

**Costs stated:** a graceful closure spends a safety key; an operator who has lost their safety key cannot close gracefully, and their identities fall back on auditors' absence statements or the verifier's own attempt, as before.

**Touches I5:** a closure resting on a counting rotation is as settled as that rotation, which gives the closure case of finality a clean footing.

**Core changes:** Identity (Types table; rotation payload field 12; Home closure, objection and absence statement procedure; Homeless rotation step 4; rules 11a, 34; Reasoning: "Nobody dies with their home").

**Freeze suite changes:** 5.7c: the vanished home is replaced by a home whose operator closes by rotation; the owner re-homes; a thief with a stolen operator everyday key cannot close the home, and the home still objects to the thief's homeless rotation.

## F57. A disowned act is void unless relied on, like an act outside the kept ancestry (round 2, I4)

**Pattern:** 3. Rule 16 protected continuity (a disowned act sits inside the owner's own kept line) and trapped the owner whose device kept appending after a thief's act: keeping later genuine acts meant keeping the thief's, and disowning left it valid.

**Found in review round 2 (I4):** a thief's stake transfer inside the kept line could only be marked disputed; the accomplice held a valid stake, and the owner's only alternative was voiding their own later acts.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** rules 16 and 17 collapse into one: *an act outside the kept ancestry, or within it but listed as disowned, is void, unless another identity acknowledged it (Envelope) or a named keeper recorded it before recording the rotation (Law); then it is shown as disputed.* Later acts in the line stay valid: their validity rests on being inside the kept ancestry, not on the disowned act's validity; hash links and running summaries are untouched.

**Why nothing new becomes escapable:** an owner could always void an unacknowledged act by rotating to a tip before it; this removes only the price of losing later genuine acts. The protection against escaping deals was never rule 16 but acknowledgement and keepers (scenarios 1.5b, 2.5c), which still apply: a disowned sale the buyer acknowledged or a keeper recorded is a visible dispute, never nothing (F47).

**Core changes:** Identity (rules 16 and 17 merged; Reasoning: "Nothing relied on is silently erased"); Law (one line: a void or disputed act on an agreement chain confers nothing; to be written with I20).

**Freeze suite changes:** scenario 1 step 5: the thief's stake transfer was appended to before the contributor noticed; the contributor keeps the later genuine acts and disowns the transfer; unacknowledged and unrecorded, it is void, and the accomplice's completing act confers no stake. Component "Disowning an act within the kept ancestry" reads "void unless relied on, then disputed".

## F58. A keeper record counts only alongside the valid act it names (round 2, challenge 4)

**Pattern:** 1. A keeper record is one of the two things that turn a void act into a dispute after a rotation (F57). Keepers are sealed (F37), so nothing required them to hold the act they record; a thief could buy "dispute" status for any 32 bytes.

**Explored:** a keeper duty "MUST NOT record an act it does not hold" was proposed and withdrawn on the author's question ("if unverifiable, what is the value?"): it is keeper hygiene, invisible to verifiers, pattern 4. The verifiable half carries all the value: a record of bytes nobody can produce as a valid act changes no verdict, and a record of a real act signed with a stolen key adds nothing beyond what an accomplice's acknowledgement already does (M4, accepted).

**Decided (Nobody, allegedly):** accepted, verifiable half only.

**Resolution (Fable, accepted):** in Law, keepers: *a keeper record counts, for the purpose of the disowned-or-outside rule, only if the verifier holds the act it names, that act is valid as an act, and the keeper is one named by an agreement the act's `objects` names.* Keepers stay sealed: they hold the locked act and check its outside, which a sealed notary can do.

**Not touched:** M24, a keeper delaying its record of the rotation, remains accepted trust in keepers, to be stated in Law's reasoning.

**Core changes:** Law (Keepers: the counting condition; Reasoning: what a record proves, and the delay trust).

**Freeze suite changes:** scenario 1 step 5 adds: a keeper record naming an act nobody holds confers no dispute status.

## F59. The furthest-along default is replaced by the majority rule as default (round 2, I6)

**Pattern:** 4 (a procedure two honest verifiers could run differently: look-ahead depth and branch-dependent home sets were unspecified), with a known-unsafe outcome by its own text.

**Found in review round 2 (I6):** with several homes and no declared rule, the furthest-along default was underspecified. F8 had kept it so that a genesis with several homes and no rule still resolves.

**Explored:** requiring a rule whenever several homes are declared (Fable, the reaction). Nobody, allegedly: a single home must stay possible at genesis, since forcing several homes is too much friction for a new user; multiple options are fine with one as the forced default.

**Decided (Nobody, allegedly):** one option is forced if none is selected. Recorded as a working rule above.

**Resolution (Fable, accepted):**
- One home: no rule, as now.
- Several homes and no declared rule: the majority rule applies, with a threshold greater than half the distinct operators, computed from the home list. An authoritative home needs an index the owner did not give, so majority is the default.
- The furthest-along procedure, rule 20 and its branch in "Which rotation counts" step 3 are removed; the homeless procedure's "every home under the default" case goes with it.
- Cost stated: an owner who added backups as mere copies gets a safety network by default, stricter, and may declare an authoritative home at any rotation.
- *Amended by F62: when a self-hosted home is declared, the default is instead that the self-hosted home is authoritative.*

**Core changes:** Identity (genesis payload comment for field 3; rule 5; rule 20; Which rotation counts step 3; Homeless rotation step 4; Reasoning: "Two forms of home rule"); core v11 (home rules).

**Freeze suite changes:** component "Home rules" drops "furthest-along default" and adds "majority by default when several homes declare no rule". 5.6 adds: a fourth identity with three homes and no declared rule resolves by majority.

## F60. A rotation's receipts are judged under the audit requirement it declares (round 2, I1)

**Pattern:** 3, the exact case: a protection the owner chose (audited receipts from named auditors) could not be removed by the safety key alone, because the removing rotation needed receipts audited by the auditors who were gone.

**Found in review round 2 (I1):** auditors close or stop cosigning; no receipt counts; no rotation counts, including the one that would drop the requirement. Step 4 of the finding also left open which requirement judges the new-home receipts of a homeless rotation or escape.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** *receipts for a rotation are judged under the audit requirement that rotation itself declares, or, if it declares none, under the requirement in effect before it.* The same sentence covers homeless rotations and escapes: their new-home receipts are judged under what the rotation declares or inherits. Consistent with rotation check 5, which already judges a new home rule against the new home set.

**What it opens and does not:** a safety-key thief can rotate with "no audit" past the auditors; but audit never protected against a safety-key thief, only against stolen home keys and history erasure (F15, F45), and the thief still needs the home to receipt the rotation (rule 11, first held wins, device policies). No guarantee lost; a trap removed.

**Core changes:** Identity (Receipt check 3: "the audit requirement the named rotation declares, or the one in effect before it"; Homeless rotation step 5; rule 10e).

**Freeze suite changes:** 5.7c adds: the journalist's declared auditor closes; the journalist rotates, dropping the requirement; the rotation counts on the home's receipt alone.

## F61. A device policy at a single or authoritative home is stated as a risk, not fixed (round 2, I2)

**Pattern:** 3 in appearance, 4 underneath: a refusal is the absence of a receipt, which nothing proves, so no rule can distinguish "the home refused" from "the home never saw it".

**Found in review round 2 (I2):** a lost phone at a home with a device policy closes every door: normal rotation refused (rule 12), homeless rotation objected to (rule 11a), escape needs the lost signing key.

**Explored and withdrawn:** "a home that refuses must not object" (the report's first direction). Unverifiable, and it would weaken the objection, the one thing that stops a safety-key thief walking past careful homes (rule 32). The reaction reached the same conclusion.

**Decided (Nobody, allegedly):** accepted as a plain statement plus client conformance.

**Resolution (Fable, accepted):**
- Rule 12 gains: *a home's acceptance conditions can refuse the owner as well as a thief; where the condition depends on a device the owner may lose, losing that device at a single or authoritative home can mean losing the identity.*
- Client conformance: *a client MUST NOT choose a device-bound policy at a single or authoritative home by default; where the owner chooses one, the client MUST say what it costs.*
- The escape already carries the answer for an owner who prepared: it needs the current signing key, which is a seed that can be backed up apart from the phone. Rule 37 adds "and backed up"; clients and key Modules offering device-bound policies SHOULD require that backup first.

No verdict changes; two verifiers are unaffected.

**Core changes:** Identity (rules 12, 37; client conformance under 18a or a new 12a; Reasoning: "Both keys always get out").

**Freeze suite changes:** 5.7c adds: the journalist's phone is lost at a home with a device policy; the signing seed was backed up; the journalist leaves with both keys.

## F62. A self-hosted identity is trusted on its own signatures; other homes are backups (round 2, C3)

**Pattern:** 3, literally: the most sovereign setup could never rotate, since its receipt had to be signed by a key that exists only once the rotation counts.

**Found in review round 2 (C3):** the circularity, and two honest verifiers reading "trusted for its own chain" differently.

**Question asked first (brainstorm notes):** is self-hosting a home like any other, or a different trust model? Reading A (home like any other) needs receipts and therefore declared auditors, which makes the self-hoster depend on others. Reading B: the identity has chosen to be trusted on its own signatures.

**Decided (Nobody, allegedly):** reading B. "In this event other homes are assumed to be used as backup, not safety network."

**Resolution (Fable, accepted):**
- *For a self-hosted home, the rotation the identity itself serves at that position counts, with no receipt and no first-held-wins.* Two rotations at one position served by a self-host make the position contested, as with conflicting receipts, until the owner serves one.
- A thief holding the safety key wins at once, as at a single lax home. The text says so; the risk is the owner's choice.
- When a self-hosted home is declared alongside others and no home rule is given, the default is that the self-hosted home is authoritative and the others are backups (working rule of F59: one of the declared options is the default). The owner MAY still declare a threshold explicitly, in which case the self-host counts as one operator whose served rotation stands in for a receipt.
- The homeless procedure does not treat a self-host as "gone": the owner is the home, and rotates to new homes by serving the rotation from anywhere.

**Checks:** exit improves; nothing hidden; adoption decides; mechanical from the served chain; no conflict with F53 (a self-host's rotation is held by definition).

**Core changes:** Identity (Shared parts: null operator comment; Resolving an operator; Which rotation counts step 3; rule 5 and the F59 default; Reasoning: new entry "Self-hosting is a trust model"); core v11 (homes).

**Freeze suite changes:** new component "Self-hosted identity: rotation counts on its own signatures; other homes as backups". Scenario 5 adds a self-hosted identity of the journalist that rotates with no receipt, and a second scenario where a thief with its safety key wins at once, shown as the stated cost.

## F63. A homeless rotation is final once the next rotation counts (round 2, I5)

**Pattern:** 2. Identity, the ground layer, made finality depend on an anchor defined in Law, which Identity-only clients cannot compute; and the closure case had no finality at all.

**Found in review round 2 (I5):** two clients, same data, different answers on whether a homeless rotation could still be overturned; a graceful closure left the owner permanently provisional.

**Options weighed:** define the anchor check inside Identity (still an upward dependency in substance); "final after n later receipts" (needs a number the core would have to pick); "final once the identity's next rotation counts" (the reaction's direction, Fable's recommendation).

**Decided (Nobody, allegedly):** next rotation. Cost accepted: "rare cases mostly super users will care about; MOR expects markets to kick in where there is value to be protected." Recorded as a working rule above.

**Resolution (Fable, accepted):**
- *A homeless rotation at position n is final once a rotation at position n plus one counts under the home rule the homeless rotation declared.* Nobody can name an act before it exists, so any objection or receipt surfacing afterwards is late by construction. No clock, no anchor, no Law.
- Applies alike to a homeless rotation resting on a closure by rotation (F56) or on auditors' absence statements. One resting only on the verifier's own failed attempt stays provisional, shown as "re-homed without audit", as before.
- Anchoring remains Law's tool for Law's purposes; Identity no longer depends on it.

**Core changes:** Identity (Homeless rotation: Finality rewritten; rule 33 area; Reasoning: "Nobody dies with their home"); Law (anchoring task: drop the reference to Identity finality).

**Freeze suite changes:** component "Homeless rotation ... final once audited and anchored" reads "final once the next rotation counts". 5.7c: the journalist rotates once more after re-homing; a late objection changes nothing.

## F64. Double entry: a payer's claim is evidence on equal footing with a receipt (round 2, C5, I11, I13, challenge 1)

**Pattern:** 1, in its purest money form: the only record of money arriving was written by whoever it arrived at. The same shape appeared four times (C5, I11, I13, I18); one rule covers three, and I18 gets its own sentence in Law because the pair of parties differs.

**Found in review round 2 (C5):** a receiver that delivers the key but signs no receipt, or a smaller one, leaves co-owners with no core-level view of what arrived; Finance rule 10 allowed a payer's claim only when the payee "signed nothing". Checked against Finance draft 4: holds; the claim format already carries rail proof, payee, amount and what was followed.

**Decided (Nobody, allegedly):** accepted. "One stone, multiple birds."

**Resolution (Fable, accepted):** Finance rule 10 is replaced by:

*A payment claim is a payer's record of a payment, carrying the rail's proof. It is admitted as evidence on equal footing with a receipt. A payer MAY publish one at any time; it is private by default, like every act, so publishing it reveals the payer only to whom the payer chooses. Where a claim and a receipt name the same rail proof and disagree in amount, payee, or what the payment fulfils, the disagreement is shown as an open question on the receiver, and the greater amount counts as received until the receiver signs a receipt matching the proof.*

**What it answers:** C5 (a payer can put an unreceipted payment on record; owners' clients count it against the split service); I11 (under-reporting and misattribution are visible mismatches); I13 (the payer's claim fixes what arrived, so with a maximum fee per payout stated in the split plan, a shortfall beyond it is computable and an open obligation of the service); challenge 1 (payer-signed records as equal evidence, private by default).

**The measured promise (reaction, adopted):** the core cannot make every payment legible; a seller can deliver outside MOR and a buyer can stay silent. *Hiding income requires the payer's silence or collusion.* The core principle "legible greed" is reworded to that. Payer-side splitting cMIPs, where each owner is paid directly, remain the models that need no service's honesty; "Who can earn" says so.

**Checks:** mechanical, from a claim and a receipt sharing one rail proof; privacy principle kept (the payer publishes by choice); no conflict with F46 or the vault rule.

**Core changes:** Finance (Payment claim definition; rule 10; a line under Receivers and senders); Law (split plan: maximum fee per payout; rule 24a; rule 29 counts claims as well as receipts); Core principle "legible greed"; "Who can earn" (Hidden fees; split models).

**Freeze suite changes:** 2.4c rewritten: the payee signs a receipt for less than it received; the buyer's claim exposes the gap; the greater amount counts. 2.4d adds: a payout arrives short of the plan's maximum fee; the shortfall shows as the service's open obligation. Component "Payment claim exposing a payee that signs nothing" reads "Payer's claim as equal evidence; a mismatch shown on the receiver".

## F65. One rail proof, several receipts or claims (round 2, I12)

**Pattern:** 4: nothing said one rail proof discharges one obligation.

**Found in review round 2 (I12):** the same proof could appear in two receipts or two claims naming two obligations; a verifier checking each alone saw a valid proof each time. The report's "a shared proof is a conflict" would break batching (F50).

**Decided (Nobody, allegedly):** accepted (the reaction's form).

**Resolution (Fable, accepted):** *Receipts or claims MAY share a rail proof only if they name the same batch, and their amounts together do not exceed what the proof shows. Otherwise a verifier holding both counts neither until the receiver signs a receipt that resolves them.* Mechanical from the acts and the proof.

**Core changes:** Finance (new rule after 10; batch named in receipt field for batched payouts, aligned with Law's batching grant).

**Freeze suite changes:** 2.4 adds: a debtor pays once and claims against two obligations with one proof; neither counts. 7.4 adds: one batched payout proof legitimately covers several payouts whose amounts sum to it.

## F66. An obligation is signed by the debtor (round 2, I14)

**Pattern:** 1: a creditor-signed "you owe me" naming a new flow-pointer version would let a thief holding the creditor's key collect an old backlog through the flow.

**Found in review round 2 (I14):** the obligation act had no "signed by" rule; the vault guarantee "a thief cannot collect the backlog" rested on a rule that was not written.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** *An obligation is signed by the debtor. A creditor's statement of what it is owed is a claim, never an obligation. The payee-pointer version an obligation names MUST be one that counted when the obligation's agreement act was made; a Law client checks that.*

**Core changes:** Finance (Obligation: signer; rule 14 reads with the version check); Law (rule 1: obligations arise from agreements and are signed by the party that owes).

**Freeze suite changes:** 1.5c adds: the thief, holding the creditor's signing key, re-issues an old royalty obligation naming the new flow pointer; it is invalid as an obligation, and the backlog still pays only to the vault.

## F67. The vault limit is per unit, fail closed (round 2, I10)

**Pattern:** 4 (a comparison across units nobody can make) and 3 in reverse (the thief, with the everyday key, chooses the unit).

**Found in review round 2 (I10):** a single limit in one unit, and a flow pointer switched to another unit, bypassed the one safety-key-protected money rule.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** *The vault limit is a list of [unit, amount] pairs. A payment in a unit with no declared limit MUST go to the vault.* Fail closed, as the air-gapped Module already assumes. Cost stated: an owner who omits a unit sends that unit's payments to the vault until the next rotation, which is the safe side.

**Core changes:** Finance (declaration kind 1 format; rule 14); air-gapped Module (already aligned); core v11 (flow and vault).

**Freeze suite changes:** 1.5c adds: the thief's flow pointer lists a rail in a unit with no declared limit; a conforming wallet pays the vault; a wallet that paid the flow did not follow the published rules and is not protected by good faith.

## F68. The publication carries a `for` field; payment and withdrawal follow it (round 2, C4, I9, challenge 5)

**Pattern:** 2, twice. Payment under a grant depended on a Law act a Finance-only wallet cannot read (C4); withdrawal authority depended on the publication's agreement, which an Envelope-only client cannot read (I9).

**Found in review round 2 (C4, I9):** a tips-only wallet paid the grantee, a full client paid the grantor, both conforming; a simple client called a valid withdrawal invalid and kept paying a withdrawn publication.

**Decided (Nobody, allegedly):** accepted. Challenge 5 (any holder of the work claim may withdraw a publisher's publication) declined: "wrong area"; the creator's recourse is a dispute, explored in the case studies, and their own publication.

**Resolution (Fable, accepted):**
- Envelope: the publication payload gains an optional field `for`: an identity hash, the identity the publication is made for.
- Finance: *a payment for a publication goes to the payee pointer of the identity in `for` if present, else of the signer.* A false `for` can only send money to the identity it names, never to its author, so nobody gains by lying in it. Whether a grant backs it is Law's business; a Law client MAY refuse a publication whose `for` is not backed by a grant it can check, and shows it so.
- Envelope: *a withdrawal is valid if signed by the publication's signer or by the identity named in `for`.* No agreement lookup.
- The creator's authority over a publisher's publication lives in Law: a dispute, and their own publication. Case studies 08, 09 and 18 are corrected where they imply otherwise (M25).

**Checks:** mechanical; every wallet pays the same identity; every client agrees on a withdrawal; exit holds (a departed grantee cannot keep collecting); the payee is visible on the publication itself.

**Core changes:** Envelope (Publication payload: `for`; Withdrawal: authority); Finance (payee pointer paragraph from F46; rule under Payee pointers); Law (rule 38: acts under a grant name it by hash; rule 44 and the withdrawal note); core v11.

**Freeze suite changes:** 2.4: the buyer's Finance-only wallet pays the identity in `for`; a full client pays the same. 3.2 adds: Marco publishes for the label with `for` set; a wallet pays the label. 2.6: A's withdrawal is signed by A; a withdrawal by a stranger is invalid in every client.

## F69. Law's objection act is renamed "contest"; only rotations make an act disputed (round 2, I20)

**Pattern:** 2 with a determinism edge. Identity's *disputed* has teeth (a disputed act never wins a "latest value" choice); Law's *dispute* "voids nothing". Read together, a Law act could knock out a payee pointer from a layer Identity clients cannot read; read apart, one word meant two things.

**Decided (Nobody, allegedly):** "Accept 'contest'. I do not contest."

**Resolution (Fable, accepted):**
- Identity keeps *disputed*: an act is disputed only by the rotation rules (F57), and only that status affects "latest value" choices.
- Law's act type 14 is renamed **contest**: a signed objection by a party with standing, naming the act it objects to. *A contest never changes any act's validity, status or selection; it is shown alongside what it names.*
- Checked: freeze scenarios 1.9 and 2, the Law definition, "Who can earn" and the case studies read correctly with the substitution; Finance uses neither word.

**Core changes:** Law (type 14 and definition; standing; every "dispute" as an act becomes "contest"); Identity (one sentence: the disputed status is set only by rotation rules); core v11; freeze suite wording; case studies.

**Freeze suite changes:** 1.9 and 3: "contests it with a signed contest". Scenario 2 adds: a contest against a payee-pointer act changes nothing about which pointer counts.

## F70. A reserved inbox route: how acts reach people (brainstorm note, decided by Nobody, allegedly)

**Source:** brainstorm note "How acts reach people" (Opus with Nobody, allegedly), handed to Fable during round 2. The core defined the outbox side (routes) and never the inbox side, nor which acts must travel where. Segmentation risk: two identities can only communicate if they share a relay.

**Decided (Nobody, allegedly), by the admission test:**
1. Core: a guarantee that any two identities can find each other without already sharing a relay. Most exists (identity → home → routes); the addition is a **reserved inbox route type**, shared language, never a mandate: an identity MAY declare no inbox.
2. Relay operators decide whether to accept deliveries, from whom, at what price, and whether to propagate: competition.
3. cMIPs: spam control, metadata privacy, retention, gossip.

**Attacked (Fable), answers on record:**
- *Home down, hostile or censoring.* Routes are signed and versioned, so a home can serve stale routes, never false ones; a reader that already holds a later version keeps it (version-plus-one chain). Withholding leaves no evidence, as with receipts: the answer is several homes, and the homeless path when a home is gone. No new exposure.
- *Signing-key thief redirects the inbox.* Same window as the encryption key (M10): deliveries until rotation go where the thief points, and the rotation voids the thief's routes act. A seller who delivered a key into that window owes a refund and did nothing wrong; the text says so. No new exposure beyond M10.
- *Delivery as a validity rule.* No: delivery is a fact only the recipient can check, and non-receipt cannot be proven (pattern 4). Delivery to counterparties' inboxes is a SHOULD for clients; the mechanical backstop is F64: the other side keeps its own record.
- *Pattern 3.* No trap: the inbox is optional, and an inbox relay that turns hostile is left by publishing new routes with the signing key.

**Resolution (Fable, accepted):**
- Identity: the route entry gains a kind: `route = [scope: hash / null, hints: [+ tstr], ? kind: 0 / 1]`, 0 outbox (default), 1 inbox. An inbox route says where others deliver acts addressed to this identity.
- Envelope: *an act counts for a verifier only once the verifier holds it; nothing forces propagation; delivery is the signer's interest.* Clients SHOULD deliver acts that concern a counterparty (agreements, signatures, receipts, claims, key deliveries, obligations) to that counterparty's inbox route where one is declared.
- The four reaches (home; counterparties; published; never leaves) go into Envelope's reasoning as a working picture, not rules.

**Core changes:** Identity (Routes: kind; Reasoning: "Anyone can find anyone"); Envelope (Relays: inbox delivery; the holding principle; reasoning: four reaches); core v11.

**Freeze suite changes:** new component "Inbox route: two identities on disjoint relays reach each other through homes and routes". 5.3: journalist and buyer share no relay; the buyer finds the journalist's inbox through the home. 5.7 adds: a thief redirects the inbox; deliveries in the window are re-sent after rotation.

## F71. A clone a party did not sign cannot change, for that party, the clauses that can move their stake or voice (round 2, I15)

**Pattern:** 3, second half: a protection others hold over a party must need that party's signature to change.

**Found in review round 2 (I15):** rule 46 stopped a clone from reducing a stake without its holder's signature, but a majority clone could change the abandonment authority, the absence period, the keepers and the split service; one quiet week later the majority declared the minority absent and took the stake, "pre-authorised" by a clause the minority never signed.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** rule 46 is extended: *A clone that a party has not signed cannot change, for that party, any clause that can move that party's stake or voice without that party's later signature: the abandonment clause, the succession plan, the fork rule, the keepers, the split service and the time reference. For that party, each such clause keeps the last version that party signed.*

**Why per party, not blanket:** a blanket freeze would let one member block every governance change forever, the trap in the other direction, and would reopen the dead-member case (F48). Per-party scoping lets a majority change the keeper for themselves while the minority's stake is judged under the keeper and clause they agreed to. Mechanical: for each party, the latest version of each protected clause carrying that party's signature act.

**Checked:** consistent with F48 (nothing requires every member) and independent of I17 (whether a stake earns from every sale stays open).

**Core changes:** Law (rule 46; definitions: protected clauses; rule 51: an abandonment declaration is judged, for the party declared absent, under the clause version that party signed; Reasoning).

**Freeze suite changes:** new 1.9b: two of three contributors clone the abandonment clause to a one-week period and a friendly keeper; the third has not signed; a declaration against the third under the new clause is invalid, and the old clause and keeper still govern the third's stake.

## F72. A stake pays through the agreement of whoever sells; the documents stop overclaiming (round 2, I17)

**The question (brainstorm notes: the biggest decision in the report):** does a stake in a work entitle its holder to income from any sale of the work, or only from sales made under their own agreement? The case studies and "Who can earn" assumed the first; the MIPs guaranteed only the second.

**Options weighed:**
- A: a rule tying a standing offer or publication of a claimed work to the claiming agreement's rule and stakes. Declined: evaded by re-encoding the file (new hash, new "work"); it would catch honest publishers and miss the dishonest one, and it would make the core judge which claim is *the* claim, which is legitimacy (F36).
- B: say plainly what the core does. A stake pays through the agreement of whoever sells; a lone sale by a co-owner is a valid act that visibly contradicts a signed agreement: the co-owner contests it (F69), a keeper has the claim on record, reputation services read both, and the lone seller's own split shows what they took.

**Decided (Nobody, allegedly):** B. "Core needs to be as least intrusive as possible. But it needs the bits and bolts to build sound solutions on top."

**Resolution (Fable, accepted):**
- Law gains one sentence: *the core cannot tie a sale to a work's stakes; it ties a sale to the seller's agreement, and makes a sale outside the claiming agreement visible to those it concerns.*
- The bits and bolts, already in the core, named in Law's reasoning so builders see them: work claims with order; contests with standing; keeper records; the seller's published split; the `for` field (F68); payer claims (F64). A cMIP or client can build "stakes paid on every sale" on these (for example a client that refuses to sell a claimed work under a plan that does not pay the claim's holders, or a reputation service that reads contests), and adoption decides.
- Client conformance SHOULD: a publication or standing offer for a work with an existing claim, not signed under that claim's agreement, is shown as such.
- Documents corrected: "Who can earn" ("every payment is split exactly" becomes "split exactly among the parties to the agreement whose pointer was paid"); the legible-greed principle; case studies 08, 09, 15 and 19 where a co-owner's share is said to arrive automatically.

**Core changes:** Law (one sentence under Standing offers; Reasoning: the bits and bolts; client SHOULD); "Who can earn" v5; core principle; case studies.

**Freeze suite changes:** 2.1 adds: a co-writer publishes the song alone with a 100% plan and sells it; every rule holds; a client shows the publication as outside the claiming agreement; the other co-writer's contest is visible. Pass criterion: "a sale outside the claiming agreement is visible, never prevented".

## F73. Split plans refer to stakes; the transfer chain names the holder (round 2, I16)

**Pattern:** 4: two honest split services could pay different parties after a transfer.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** *Fixed shares in a split plan refer to stakes, not to holders. The current holder of a stake is whoever the transfer chain on the agreement names. A transfer is an act on the agreement chain, and a split service MUST follow it.* Rule 26 ("cannot pay outside the plan") reads as "outside the plan's stakes as currently held".

**Core changes:** Law (split plan `share-rule`: stake reference instead of holder hash; rules 14, 26; Reasoning).

**Freeze suite changes:** 1.4 adds: after the investor's sale, the split service pays the buyer, and a payout to the seller would be outside the plan.

## F74. A party is bound only by its own signature act (round 2, I19)

**Pattern:** 1: under a threshold signing rule, two accomplices could publish a valid agreement naming a third as debtor.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** *A party is bound by an agreement only through its own signature act. A threshold rule decides when the agreement exists among those who signed, never who owes.* An obligation in the terms of a party who has not signed is shown as unsigned, never as open.

**Core changes:** Law (rules 1 and 4; Obligation state: unsigned; Finance rule 7 cross-reference).

**Freeze suite changes:** scenario 3 adds: a 2-of-3 agreement names a debt of the member who did not sign; every client shows it unsigned; no reputation-relevant obligation exists.

## F75. Role-share evidence is signed by a party other than the split service and the payee (round 2, I18)

**Pattern:** 1, the fourth face of F64 with a different pair of parties: the referral note travelled in the receipt the payee signs, so the split service could name its own sybil as referrer or drop the real one.

**Decided (Nobody, allegedly):** accepted.

**Resolution (Fable, accepted):** *Evidence for a role share MUST be an act signed by someone other than the split service and the payee: the payer's client for a referral (the referral becomes a signed field of the payer's claim or of the key request), the relay for delivery, the module's own signed use record. An unsigned referral note earns no share.* Cost stated: a referral needs the buyer's client to sign one small act; the advertising case study says so instead of "pays automatically".

**Core changes:** Law (rules 19, 22; role-share evidence definition); Finance (receipt field 8, referral note: removed or marked as unsigned hint only; the signed referral in the payment claim); case study 15.

**Freeze suite changes:** 2.4: the referral is a signed field of the buyer's claim; a referral the split service names on its own earns nothing. Component "Role shares with evidence" reads "evidence signed by a third party".

## F76. A revocation cannot seal before a deal the grantor acknowledged or paid on (round 2, I21; M21 authority correction)

**Pattern:** 3, second half: the grantor alone chose the seal point and alone decided which acknowledgements counted, so counterparties of a grantee held only a contest.

**Decided (Nobody, allegedly):** accepted: the constraint, and the M21 correction.

**Resolution (Fable, accepted):**
- Law, revocation: *the seal act named by a revocation MUST be at or after the last act on the grantee's branch that the grantor itself acknowledged, or paid on: a receipt or split signed by the grantor that names a deal on that branch counts as payment.* A grantor who took the money cannot later say the deal never happened. Deals the grantor never touched can still be sealed out; the counterparty's protection there is import, stated in bold: require import before performing.
- M21 correction: *an abandonment authority MUST be an identity.* An anchoring cMIP is named as the time reference the authority judges absence against, never as the authority.

**Core changes:** Law (rules 40 to 44: seal constraint; rule 42 no longer gives the collective a veto over acknowledgements that predate its own payment; abandonment clause: authority is an identity; bold warning to counterparties).

**Freeze suite changes:** 3.4 adds: the label had signed a split on deal 3; a revocation sealing before deal 3 is invalid; deal 3 stands. 1.9: the abandonment authority is the keepers (identities), judged against the block height.

## F77. A key grammar must leave a way to rotate that needs less than every member (round 2, challenge 3; amends F48)

**Pattern:** 3. F48's "k < n" avoided the dead-member trap by forbidding a grammar some collectives rationally want ("both, or the abandonment clause"), which the report called picking a winner. The reaction showed the trap is real at the key level: the abandonment clause moves stakes but cannot rebuild a split safety key with a share gone for good.

**Decided (Nobody, allegedly):** accepted. "I knew importing those reactions had value."

**Resolution (Fable, accepted):** the rule is about the exit, not the number. *A key grammar MUST leave a way to rotate that does not need every member: either a threshold below the member count, or a named recovery path, such as a custodian holding a share under grant or an escrowed share released by the abandonment authority. A grammar without one is invalid.* Two partners may choose "both", provided they name where a further share sits and who releases it. A verifier checks that the grammar declares a threshold below n or a recovery path; whether the path works is the members' risk, stated.

**Core changes:** Law (key grammar: the exit requirement replaces "k < n"; recovery path as a grammar element; Reasoning); Identity (the collective note); F48 amended; case studies 08, 09 and 19 show the recovery path they chose instead of a forbidden grammar.

**Freeze suite changes:** 3.1: the label's grammar requires all three for a rotation and names an escrowed share released by the abandonment authority; 3.8: the dead member's share is released and the rotation proceeds. Pass criterion "no rotation required every member" becomes "every rotation had a way through that needed less than every member".

## F78. Determinism encodings: running summary, RISC-V profile, bidirectional controls (round 2, I8, I22, I7)

**Pattern:** 4 in each case: an encoding or a protection left to convention or to a SHOULD.

**Decided (Nobody, allegedly):** accepted on trust; "other human review will judge those areas better than I can." Flagged for the technical reviewers at freeze.

**Resolution (Fable, accepted):**
- **I8, running summary (Envelope):** the summary of the first act of a sequence is 32 zero bytes. Leaves are `tagged_hash("MOR/leaf", act id)`; internal nodes `tagged_hash("MOR/mmr", left || right)`; the peaks of the mountain range are bagged right to left into one root. A test vector is published before freeze.
- **I22, executable rules (Production):** RV32IM only. The step budget is a field of the rule's specification. Input and output ABI, memory layout, and the treatment of environment calls and misaligned access are fixed in Production and published with test vectors before freeze; an environment call or a misaligned access answers *unknown* (fail closed).
- **I7, bidirectional controls (Text, Law):** client conformance, MUST: before signing terms, a grant or a clone, a client MUST show every bidirectional control (U+202A to U+202E, U+2066 to U+2069) visibly, as an escape, in the plain-text view. The characters stay valid canonical text (isolates have legitimate uses in mixed-script text; reaction).

**Core changes:** Envelope (Sequences: running summary, with the empty summary and bagging order; Open parameters: test vector); Production (rule 12; ABI section; F44 amended); Text (rule 5a becomes MUST for the Law act types named); Law (rule 4a).

**Freeze suite changes:** scenario 8 adds: two clients compute the same running summary for a three-act sequence from the published vector; a rule that makes an environment call answers unknown on both. Scenario 1 adds: terms containing a bidirectional override are shown with the control visible before signing.

## Status at F78

Every critical (C1 to C5), every important (I1 to I22) and every challenge (1 to 6) of round 2 is decided: F53 to F78. Remaining: the thirty minors (batched), the case-study corrections, and the consolidated revision.

## F79. The vault is a grammar for safer pointers: per unit, per rail, derived addresses, zero means flow off (round 2, M17; vault discussion)

**Background (Nobody, allegedly):** the single vault limit was a quick fix. The vault exists as a second layer of security for large payouts; it protects outstanding debt a thief could try to secure; rate was not considered but matters to some super users; the flow is easier to steal, and some entities need an option to secure it above a certain rate. The vault is not a single vault: it handles several currencies and several rails.

**What the vault protects against (Fable):** three ways a signing-key thief takes money through the flow. The backlog: closed by F34 and F66. The large payment: closed by F67. The stream between theft and rotation: open; this is the rate case.

**Decided (Nobody, allegedly):** "The vault is simply the grammar for setting up safer pointers if the user wishes to."

**Resolution (Fable, accepted):**
- The vault declaration (Identity declarations slot, Finance kinds 0 and 1 merged) is a set of entries *[unit, rail, derivation source, limit]*, all under the safety key. Several rails per unit are allowed, so a dead rail does not make the vault unreachable until rotation.
- A rail entry carries a derivation source, not a fixed address; the rail's Module derives a fresh receiving address per payment where the rail allows it. The core does not know what the source is (an xpub, a descriptor, a static address for rails without derivation). Answers M17's address reuse.
- A limit of zero for a unit means *flow off*: every payment in that unit goes to the vault. This is the strongest form of "secured above a rate", and needs no clock.
- A unit with no entry: payments go to the vault under any entry of that unit if one exists; otherwise, per F67, the payment is undeliverable to the flow and stays an open obligation (fail closed).
- **Rate, stated honestly:** a true rate limit cannot be a core rule: it needs a clock and a global view of what others have paid, both absent (pattern 4 twice). The core gives the two ends of the range, per-payment limits and flow off; the middle is the market's: a custodial flow Module holding the hot pointer and enforcing a rate off-protocol, which the owner points the flow at. Detection, not prevention, is shortened by F64 (payer claims) and F70 (inbox): the owner's client sees payments land at a pointer it did not publish and alarms.

**Core changes:** Finance (Payee pointers and the vault: the vault entry format; rule 14; Reasoning: "The vault is a grammar for safer pointers"; Tasks: rail modules derive addresses from a vault entry); Identity (declarations comment); air-gapped Module (limits per unit already; add flow-off); core v11; case study 18.

**Freeze suite changes:** component "Flow and vault" reads "Vault as per-unit, per-rail entries with derived addresses; limit zero as flow off". 1.5c adds: the contributor's vault lists two rails for one unit; one rail dies; the vault is still reachable. 5.2 adds: the journalist declares flow off for one unit; a tip in that unit goes to the vault.

## F80. A refund to an anonymous payer is owed to whoever presents the rail proof (round 2, M20)

**Found in review round 2 (M20):** a refund owed to a payer with no payer field could never be delivered; the obligation stayed open forever as noise on an honest seller.

**Options weighed:** stay open forever (unbounded noise); lapse after a period (favours the party holding the money; not written); claimable by proof.

**Decided (Nobody, allegedly):** claimable by proof. "Small addition with good reward."

**Resolution (Fable, accepted):** Law rule 32 gains: *a refund owed on a payment whose payer is not named is owed to whoever presents the rail proof of that payment, by a payment claim naming a place to be paid. Only the payer holds that proof. The obligation stays open and visible until claimed and discharged; a seller who refuses a valid claim is visibly in the wrong.* Whether an unclaimed refund ever lapses is for the standing offer's terms (for example "claimable within N blocks of the time reference"), which the buyer accepted; the core sets no lapse.

**Core changes:** Law (rule 32; standing offer: optional refund-claim terms); Finance (payment claim: MAY name a place to be paid, for this purpose); Reasoning in both.

**Freeze suite changes:** 2.6: the second buyer paid anonymously; they present the rail proof through a claim and are refunded to the address the claim names. 5.2 adds: the anonymous buyer's purchase fails to deliver; the refund is claimable by proof.

## F81. Three shape confirmations: null declarations, collapsed disputes, `objects` as [chain, predecessor] (round 2, M2, M4, M13)

**Decided (Nobody, allegedly):** all three accepted.

**Resolution (Fable, accepted):**
- **M2 (Identity):** a declaration's value MAY be null, meaning the kind is removed; the latest entry of a kind counts, as now.
- **M4 (Identity, client conformance):** the disputed status stays (F47, F57); clients MAY collapse disputed acts older than the rotation that voided them, showing a count rather than each act. No verdict changes.
- **M13 (Envelope):** each entry in `objects` becomes *[chain, predecessor]*: the chain the act belongs to and the act in that chain it follows. A merge of two branches is two entries with the same chain; a multi-chain touch (a stake transfer on the work's chain and the agreement's chain) is two entries with different chains. Single-chain acts are unchanged in cost.

**Core changes:** Identity (declaration format; rule 8b; client MAY under 18a); Envelope (inside field `objects`; Chains and ordering); Law (rule 14: a transfer names both chains; the reading of merges).

**Freeze suite changes:** 1.4: the stake transfer names the work's chain and the agreement's chain as two entries. 5.5 adds: a declaration is removed by a null entry in a rotation.

## F82. The remaining minors, applied without a decision (round 2 M-list)

Applied in the consolidated revision as drafting, each a sentence or a format note. Listed so they can be scanned.

- **M1:** per-operator counting makes centralisation visible only under honest labelling; the text says so and stops claiming more.
- **M3:** a disowned hash not in the kept ancestry has no effect (it is outside anyway) and is ignored.
- **M5, M16, M30:** rule 8a's "each allowed once", "followed the published pointer" and the client-only MUSTs (keepers never hold content keys, plain text always shown, what the rule computes is shown) are marked as client or Module conformance, not validity; freeze scenario 1's pass criterion names them as conformance.
- **M6:** several null home entries count as one operator (the identity itself); an identity naming its own hash as operator in a rotation is the same as a null entry.
- **M7:** a format may hide only characters that are not letters or digits.
- **M8:** Identity states that every `tstr` is canonical text, including address hints; homes set their own length policy.
- **M9:** key delivery `to` accepts an identity hash or a bare encryption key (scheme plus key bytes, as in F54's form).
- **M10:** the encryption-key hijack window is stated, with the consequence for media purchases (a refund owed by a seller who did nothing wrong).
- **M11:** a successor protocol MUST change the tag prefix ("MOR/"); Production says so under successors.
- **M12:** a repost is a reference to a publication, never a publication; a repost pays nobody by itself; role shares for referrals are how a reposter earns (F75).
- **M14:** a fork behind an act the owner's later rotation kept is settled by that rotation; clients need not rewind past it.
- **M15:** partial payments and discharge by several routes: an obligation is discharged when valid routes ending at the creditor's pointer sum to the owed amount; each route's receipts name the obligation.
- **M18:** the referral note is removed from the receipt (F75); no unread bytes travel in receipts.
- **M19:** "spending grants above the limit go through the vault" is removed from the declaration comment; spending is not a core concept.
- **M21 (rest):** `unfilled = 2` names the party; succession seat weights use a `[weight, member]` form; "delivery confirmation for unencrypted media" becomes "delivery confirmation for a publication whose key is public".
- **M22:** claim order is not evidence of authorship; a claim cMIP MAY carry a pre-publication commitment.
- **M23:** the split safety key rebuilt on one device: the Module MUST deal shares of the next key verifiably; the core text calls the split a Module safeguard, not a guarantee.
- **M24:** keeper delay is stated as accepted trust in keepers (F58).
- **M26:** a binary rule is carried as a separate locked object named by the specification, with its hash in the specification's content; the content field stays canonical text.
- **M27, M28:** clients that suggest successors show a creator mismatch; fee terms and reputation displays do not assume the named creator consented.
- **M29:** "add, never subtract" is stated as scoped to conforming clients; an extension's new act types are unknown to non-adopters.
- **Cross-cutting, the six hashes:** one paragraph in core and Production: the six MIP hashes are the trust root; a client learns them from the genesis repository and its own build; a fork presenting six others is a different protocol, and the tag prefix rule (M11) keeps its acts from replaying here.
- **Cross-cutting, sybil:** the documents stop describing per-operator, per-auditor, per-keeper or per-rater counting as resistance to a single actor.

## Consolidated revision after review round 2 (27 September 2026)

**Applied:** decisions F53 to F82, in one revision.

**New versions:** Identity MIP draft 7, Text MIP draft 5, Envelope MIP draft 4, Finance MIP draft 5, Law MIP draft 4, Production MIP draft 4, core v12, freeze test suite v11, core principle "legible greed" v2, Who can earn on MOR v5, MOR in one page v4 (a third approach: one object, one promise, one cost), air-gapped safety key Module draft 3. Case studies corrected: 04 (v3), 08, 09, 10, 12, 15, 17, 18, 19 (v2). Case studies 11, 13, 14 and 16 needed no change. They supersede the previous versions.

**Found while drafting (writing is also a review), stated in the drafts and flagged to Nobody, allegedly:**
- Finance rule 14a: once a vault is declared, a payment in a unit the vault has no entry for cannot go to the flow either; it is undeliverable until the owner adds the unit by rotation. F67's fail-closed applied to F79's per-unit entries. An identity with no vault keeps everything on the flow. Awaiting the author's confirmation; the alternative (uncovered units flow freely) reopens I10. *Confirmed by Nobody, allegedly, 2 October 2026:* "Missing payments because you do not set up a currency is fine, as long as the debt can be honored later." Rule 14a stays as drafted. The debt is honored later: it stays an open obligation (rule 16) and is paid to the vault once the owner adds the unit by rotation, or bridged meanwhile by a conversion service into a unit the vault covers. An opt-in setting letting uncovered units flow (suggested by the project lead) was not taken up.
- Envelope: a live stream has no work hash until it ends, so paid live access is a standing offer, not a publication (the report's sports gap), stated rather than decided.
- Law: a third share-rule form (a named receiver holding no stake) was needed once shares refer to stakes (F73), for services and positions.
- Production: task 13, work claims, so that F82's pre-publication commitment has a task to live under.
- Identity: the closure flag is valid on any rotation and takes effect only for identities whose declared homes name the signer as operator.
- Envelope: the running-summary tag names stay as draft 3 wrote them (`MOR/mmr-leaf`, `MOR/mmr-node`); F78's contribution is the empty summary, the bagging order and the test vector.

**Next:** technical review of the profiles and vectors named in "Open before freeze"; human adversarial review (round 3) on this revision; then MOR 0.1.

## F83. A staged freeze: communication first, then the rest (build planning, decided by Nobody, allegedly)

**Found while planning MOR 0.1:** every act names its specification by hash, and the MIP hashes change until freeze. The first acts would otherwise name draft specifications. The freeze test suite and Production (rule 20) assume one freeze of all six MIPs, once every scenario passes.

**Decided (Nobody, allegedly):** "We freeze what is needed to communicate and share media. We invite a small group to fidget with the other layers. We freeze those and send to unis."

**Resolution (Claude, accepted in principle; details open):**
- **Stage 1:** Identity, Text and Envelope are frozen before the first acts, once the identity gauntlet and the scenarios that exercise them pass. The first acts then name frozen specifications and are permanent.
- **Stage 2:** a small invited group works on Finance, Law and the rest of Production, which stay drafts meanwhile.
- **Stage 3:** those are frozen; the complete core is then sent to universities.
- The trust root becomes staged: three hashes first, the remaining three added at stage 3, each set published together with its texts.

**Consequences found while resolving, stated for Nobody, allegedly:**
1. **The specification format must freeze in stage 1.** A MIP's hash is computed over its content in the format Production defines (`spec` map, `MOR/spec` tag). The first three hashes cannot be fixed while that format can change. *Suggested (Claude):* move the specification format and spec-hash rule into Envelope, which already says every act names its specification by hash; Production keeps tasks, extensions, verification rules, adoption and earning. **Open, Nobody, allegedly to decide.**
2. **Identity points up to Law once:** a keeper record can make a voided act a visible dispute (Identity rule 16). Freezing Identity fixes that promise before Law is final; Law must be written to honour it.
3. **Open parameters of the three layers must be settled before stage 1:** the running-summary test vector, the pinned Unicode version, the hybrid key-delivery format (including the bare-key form), the Merkle construction for commitments, the encrypted form of private links, and how a home is queried (the relay transport cMIP answers the last).
4. **Rewrites:** the freeze test suite (freeze rule and procedure: staged, with which scenarios gate stage 1), Production rule 20 and the core's trust-root paragraph.

**Core changes (pending the open point):** freeze test suite (freeze rule, procedure); Production (rule 20; possibly the specification format moves to Envelope); core (trust root; Open before freeze).

## F84. Freeze the lot at the first release; say what was run and what was only reasoned (build planning, decided by Nobody, allegedly)

**Found while planning MOR 0.1:** the freeze test suite (v11) freezes the MIPs only once every scenario has passed, and several scenarios need Finance and Law running (splits, vaults, stakes, keepers, agreements). The build brief left Finance and Law out of 0.1, and F83 staged the freeze around that. The two cannot both hold if the first release freezes all six: either the build grows to every scenario, or the freeze rule gives way.

**Decided (Nobody, allegedly):** "The freeze document is the problem." "Whatever we release is the first, however we wanna call it. So, we'll freeze the lot at presentation, some purely theoretically." Added to the build: "LN integration (probably the easiest module), that tests Finance. Split Module (for Law). Something to assess deals… Production is tested throughout." The order: "We build solutions that test each layer, so we experience friction. Only then, Fable gets a look at everything (will need a bigger budget), breaks things and fixes them. Then we freeze it." Confirmed: the freeze publication states, scenario by scenario, whether it was tested against running code or only reasoned. The story, in his words: "A man with a concept and a machine with code built MOR1."

**Resolution:**
- **All six MIPs freeze together, at the first release.** F83's staged freeze (three layers first, three later) is withdrawn. Its stage 2 was already replaced by the circle of five (build brief, 28 September).
- **Run or reasoned.** Every scenario is either run against the founding components and passed, or reasoned through on paper against the texts. The freeze publishes a freeze report with the six texts and hashes, marking each scenario and component run or reasoned. *A reasoned rule is frozen on argument, not evidence; the report says so, so nobody mistakes one for the other.*
- **Friction in every layer.** Three components join the build: a Lightning integration module (Finance), a Split Module (Law) and a deal-assessment tool (Law, to be defined with Nobody, allegedly at its step). Production needs none: every specification published runs through it.
- **Review before freeze:** a machine review of everything, texts, code and freeze report, by Fable with a larger budget, breaking and fixing; then the five (the human round 3); then the freeze.

**Consequences, stated for Nobody, allegedly:**
1. **F83 point 1 dissolves.** The specification format stays in Production: it freezes with Envelope, so no frozen layer depends on a draft. F83 point 2 (Identity pointing up to Law) dissolves the same way.
2. **The trust root stays as written.** Production rule 20 and the core's paragraph already say the six hashes are published together; F83's staged rewrite is not needed.
3. **Exact formats for every Finance, Law and Production act** (core, "Open before freeze") become a hard prerequisite of the first release, as do the open parameters F83 listed, now for all six layers.
4. **Checked against the principles.** Right of exit: the way out (identity, rotation, escape, succession) is the part run hardest, by the gauntlet, so the uneven freeze does not fall on the exit. Evolutionary design: what fails after the freeze is fixed by a successor protocol, as the core already says. Legible greed: the run-or-reasoned report is the same legibility applied to the protocol itself.
5. **Naming is open.** The release is "the first, however we wanna call it"; the roadmap still calls the build 0.1 and the later battle-tested release V1. To settle with Nobody, allegedly.

**Changes:** freeze test suite v12 (freeze rule and procedure; scenarios and components unchanged); build brief (scope, components, decisions, open items); roadmap (new steps, freeze step rewritten, renumbered). No change to the core or the MIPs.

## F85. V1, frozen at inception, built by two (build planning, decided by Nobody, allegedly)

**Found:** F84 and the brief of the same morning had the circle of five review and freeze the first release, then carry it forward. That gives five people a say over the freeze, and invites a debate about who decides the next step.

**Decided (Nobody, allegedly):** "We'll test it in more details, no more five. You and me build V1, with help through questions in segmented fashion to other people. It's an ideological decision. Frozen at inception, no debate about who decides the next step. That is a problem they can deal with if they become curious and excited… and they can do so without me. I can move on to other things."

**Resolution:**
- **The first release is V1** (this settles F84's naming point). The build brief and roadmap are renamed accordingly.
- **Nobody, allegedly and Claude build and freeze V1.** Others help by answering segmented questions and decide nothing. The circle of five is withdrawn.
- **Questions come from the testing.** Nobody, allegedly: "By the time we're done testing we will know what is real and what only exists on paper. From that we can devise targeted questions to specialists." The draft freeze report (run or reasoned) is the source: each reasoned rule becomes a targeted question to a specialist in its field.
- **Tested in more detail:** the run-or-reasoned freeze report of F84 stands; every scenario the components can run is run.
- **The machine review (Fable) before the freeze stands.**
- **No steward after V1.** What comes next is whoever takes it up, as a successor protocol users move to by choice.

**Checked against the principles:** right of exit and evolutionary design are served: the core already says flaws after the freeze are fixed only by a new protocol running alongside, with users migrating by choice, and V1 names no one who could block that. Legible greed: no conflict.

**Conflict, resolved:** the core (v12, "Open before freeze") lists "Human adversarial review (round 3)" before freeze. Nobody, allegedly: "Semisol gets to get a go at it. 'Yo Semi, can you help me break this?' He won't resist…" Semisol is round 3: he attacks the whole, texts and running prototypes, after the machine review and before the freeze. What he breaks becomes findings, resolved with Nobody, allegedly; he decides nothing. The core item stays as written; no core change.

**Changes:** freeze test suite v12 (procedure step 5: human questions, not the five); build brief and roadmap renamed to V1, circle of five removed, "After V1" rewritten; README, CLAUDE.md, cMIP and Module READMEs and the project-lead prompt say V1. The air-gapped Module draft 3 still says "Tests for MOR 0.1" (a specification text, left for its next draft). Findings F83 and F84 keep their wording as history.

## F86. Receipts for a homeless rotation come from the new homes (found while drafting the relay transport cMIP, decided by Nobody, allegedly)

**Found while drafting:** relay transport cMIP, draft 1 (roadmap step 1; numbered F84 in the draft branch, renumbered at merge). Identity draft 7, receipt check 3, counts a receipt only from a home "declared in the home set in effect for that chain position: the homes set by the identity-chain act at the position before". The homeless procedure, step 5, counts "receipts from the new homes", which the homeless rotation itself declares, at that same position. Read literally, check 3 rejects every receipt step 5 needs, so no homeless rotation could ever count, and scenario 5.7c would fail on the text. A drafting contradiction, not a change of intent.

**Decided (Nobody, allegedly):** receipt check 3 gains: "or, for a homeless rotation, a home in the new set it declares (homeless procedure, step 5)."

**Core changes:** Identity (receipt check 3), at Identity draft 8 (roadmap step 1a). No change to the core document or the freeze test suite.

**Applied:** Identity draft 8, receipt check 3 (roadmap step 1a, approved by Nobody, allegedly, 28 September 2026). The freeze test suite v13 names "receipts from the new homes" in the homeless rotation component.

## F87. An unaudited homeless rotation is never final by the next rotation (found while drafting the relay transport cMIP, decided by Nobody, allegedly)

**Pattern 1** (what decides is signed by the wrong party).

**Found while drafting:** relay transport cMIP, Q4, what "tried and failed to reach" means (numbered F85 in the draft branch, renumbered at merge). Scenario: a journalist with one home abroad and no auditors; a state holding the stolen safety key makes a homeless rotation naming its own homes, and blocks the real home at its border. Clients inside fail to reach the home and accept the rotation as "re-homed without audit". Identity draft 7 then makes it final once a rotation at the next position counts under the home rule it declared; the thief holds the next safety key and chose those homes, so it rotates again at once, and the theft becomes final inside the country, beyond any later objection. The finality reasoning (F63: "anything surfacing after the next rotation is late by construction") holds for acts that did not exist yet, not for an objection that existed but was kept from arriving.

**Decided (Nobody, allegedly):** a homeless rotation that counts only through the verifier's own failed attempt (homeless procedure, step 4, last case) never becomes final by the next rotation. A valid objection from a home of the old set voids it whenever it surfaces, and with it every rotation built on it. Homeless rotations that count through closure, auditors' absence statements, or an escape endorsement become final as before.

**Cost, stated:** an honest owner whose single home vanished without closing, with no auditors, stays provisional unless they endorse the homeless rotation with their current signing key (escape), which objections cannot void. Only an owner who has also lost the signing key stays "re-homed without audit" for good: a rare case, and the core accepts costs on rare cases.

**Isolation, stated:** no protocol beats a country that seals itself off completely; its readers see the thief's rotation, labelled, until evidence gets in. The relay transport cMIP makes evidence travel: an objection from any source counts, relays probe homes on a client's behalf, bundles carry acts by hand, operators may publish onion addresses, and clients do not send private content to an identity re-homed without audit without a plain warning.

**Core changes:** Identity (homeless rotation: Finality; rule 30 area; core document, "The way out"), at Identity draft 8 and the next core version (roadmap step 1a). Freeze test suite: 5.7c gains a censored reader and a thief's second rotation that does not make the first final (approved by Nobody, allegedly, 28 September 2026).

**Applied:** Identity draft 8 (homeless rotation: Finality and "Re-homed without audit"; rule 32a; rule 35 and "Nobody dies with their home" commentary), core v13 ("The way out", glossary), freeze test suite v13 (5.7c, the homeless rotation component, pass criteria); roadmap step 1a, approved by Nobody, allegedly, 28 September 2026.

## F88. An escape endorsement is never judged by the rotation it endorses (found while writing Identity draft 8, decided by Nobody, allegedly)

**Pattern 3** (a rule that protects the owner also traps the owner): the rule that judges what a rotation keeps defeated the owner's way out with both keys.

**Found while writing:** Identity draft 8 (roadmap step 1a), checking the cost F87 states. An escape endorsement is signed by the owner's signing key bound just before the homeless rotation, which is the key that rotation replaces. Validity rules 15 to 17 say each rotation judges the acts signed with the key it replaces, and void those outside its kept ancestry unless acknowledged or recorded. The endorsement names the rotation, so it is made after it, and the rotation can never list it as kept. Read literally: if the endorsed rotation counts, it voids the endorsement; without the endorsement it does not count as an escape; so the endorsement is valid again. A loop, with no answer every verifier would agree on. The escape of F20, rule 36, and the way out F87 leaves an honest owner all rest on it. A drafting flaw since the escape was introduced, not a change of intent.

**Decided (Nobody, allegedly):** "an escape endorsement is never judged by the rotation it endorses."

**Core changes:** Identity draft 8 (escape endorsement; "Status of an act after a rotation"). No change to the core document or the freeze test suite: scenario 5.7c already runs an escape, and the loop would make it fail on the text.

**Applied:** Identity draft 8 (roadmap step 1a, approved by Nobody, allegedly, 28 September 2026).

## F89. The running summary's peaks are bagged with left kept on the left (found while building the core library, decided by Nobody, allegedly)

**Pattern 4** (an encoding left to convention).

**Found while building:** core library, part 1 (roadmap step 2). Envelope draft 4 says the peaks of the mountain range "are bagged right to left, each pair hashed as a node", but not which side of each node the peak and the bag so far go on. Both orders are equally safe; two implementations choosing differently compute different running summaries for any sequence whose length is not a power of two, and so disagree on every kept ancestry.

**Decided (Nobody, allegedly):** start from the rightmost peak; each peak to its left is hashed as `node(peak, bagged so far)`, so left stays left. A single peak is its own root, with no extra hashing; no acts give the empty summary, 32 zero bytes.

**Core changes:** Envelope (Sequences: the bagging rule written out). No change to the core document or the freeze test suite.

**Applied:** the core library (`core/src/mmr.rs`) and its published vectors (`core/vectors/running-summary.json`, `core/vectors/sequence-three-acts.json`), approved by Nobody, allegedly, 28 September 2026. Written into Envelope draft 5 (Sequences), approved by Nobody, allegedly, 28 September 2026.

## F90. The lock binds no associated data (found while building the core library, decided by Nobody, allegedly)

**Pattern 4** (an encoding left to convention).

**Found while building:** core library, part 1 (roadmap step 2). Envelope draft 4 locks an inside, or a media object, "with the content key using XChaCha20-Poly1305 and the nonce", but does not say whether the lock binds associated data. Any choice other than none changes the locked bytes of every act, so implementations must agree.

**Decided (Nobody, allegedly):** none. The locked bytes are the ciphertext followed by the 16-byte Poly1305 tag, with empty associated data. *The outside already commits to both the locked bytes (locked hash) and the unlocked inside (inside commitment), so binding more would add nothing.*

**Core changes:** Envelope ("How it fits together", step 1; media locking). No change to the core document or the freeze test suite.

**Applied:** the core library (`core/src/lock.rs`) and its published vectors (`core/vectors/lock.json`, `core/vectors/sequence-three-acts.json`, `core/vectors/open-act.json`), approved by Nobody, allegedly, 28 September 2026. Written into Envelope draft 5 ("How it fits together", step 1; Publication), approved by Nobody, allegedly, 28 September 2026.

## F91. No data item in an act is nested more than 128 levels deep (found while building the core library, decided by Nobody, allegedly)

**Pattern 4** (a rule left to each implementation, where verifiers must agree).

**Found while building:** core library, part 1 (roadmap step 2). A decoder that follows every level of nesting can be crashed by an act nested thousands of levels deep, so every decoder stops somewhere. If each stops at its own depth, one verifier accepts an act another cannot read: two verdicts on one act, which the core otherwise never allows. Unlike length, which only decides what a home stores, nesting depth decides whether an act can be read at all.

**Options weighed:** (a) each implementation's own limit, reported as "cannot process", not invalid; (b) one limit in the core, the same for every verifier.

**Decided (Nobody, allegedly):** (b), at 128 levels. "If an application exceeds it a custom solution can be implemented." In an encoded act, and in an encoded inside, no data item is nested more than 128 levels below the outermost item (level 0); deeper is invalid. *An application that needs deeper data carries it in a byte string or as a media object, which the act does not decode; the acts the MIPs define nest a handful of levels.*

**Core changes:** Envelope (validity rule 1a; Reasoning, "One depth for everyone"); core document ("Common conventions", encoding). No change to the freeze test suite.

**Applied:** the core library (`core/src/cbor.rs`) and its published vectors (`core/vectors/cbor.json`: 128 levels accepted, 129 rejected); Envelope draft 5 and core v14, approved by Nobody, allegedly, 28 September 2026 (roadmap step 2).

## F92. A rotation that counts under the old home rule beats even a final homeless rotation (found while building the core library, part 2, decided by Nobody, allegedly)

**Pattern 2** (a rule that only works for a verifier with a memory): finality was argued for acts arriving late, and a verifier only ever holds acts, never when each arrived.

**Found while building:** core library, part 2 (roadmap step 3), writing the resolver as a function of the acts a verifier holds. Identity draft 8 says a homeless rotation is final once the next rotation counts, and "no later objection or receipt can overturn it" (F63); homeless step 2 and rule 31 say a rotation that counts under the old home rule "always beats" a homeless rotation. On the same pile of acts the two give opposite answers, so one must be ordered first. With finality first, the library counted this attack, run as a test: a journalist rotates three times, each receipted by the one home; the home closes by rotation; a thief finds the journalist's first safety key, used years before, on an old backup, makes a homeless rotation at position 1 naming the thief's homes, and rotates again at once. The thief's chain became final and replaced the journalist's three genuine rotations. The same held after auditors' absence statements instead of a closure.

**Decided (Nobody, allegedly):** the old-rule rotation wins. Rule 31 stays "always": a rotation that counts under the old home rule beats a homeless rotation at the same position, final or not. Finality makes a late objection powerless, never a rotation the old homes held.

**Cost, stated:** a thief who holds a safety key, and whose rotation a home genuinely receipted at that position, still wins there, however late its receipts surface. That is first held wins, exactly as without any homeless rotation (rule 11). *F63's "late by construction" holds for an objection, which names the homeless rotation and so is made after it; a receipt names another rotation, which may be older.*

**Core changes:** Identity (homeless rotation: Finality; rule 31); core document ("The way out"). Freeze test suite: 5.7c gains the thief with a used safety key found after a closure; the homeless rotation component and the pass criteria follow.

**Applied:** the core library (`core/src/chain.rs`: the old rule is tallied before finality; `core/tests/chain.rs`: the attack above, and a final escape still beaten by a rotation the old home held); Identity draft 9, core v15, freeze test suite v14 (roadmap step 3), approved by Nobody, allegedly, 28 September 2026.

## F93. Absence statements are judged by the audit requirement in force before the homeless rotation (found while building the core library, part 2, decided by Nobody, allegedly)

**Pattern 1** (what decides is signed by the wrong party).

**Found while building:** core library, part 2 (roadmap step 3). Homeless step 4 counts a home as gone when "the identity requires audit, and at least the required number of its declared auditors have signed absence statements", and otherwise on the verifier's own failed attempt. The homeless rotation can itself declare a new audit requirement or drop it; F60 settled which requirement judges the new homes' receipts, not this step. Read as the rotation's own, a thief holding the safety key could drop auditing and fall back on each reader's failed attempt, or name auditors it controls, whose absence statements would make the rotation final.

**Decided (Nobody, allegedly):** the requirement in effect before the homeless rotation, while the old homes served: its auditors, its threshold, and whether a reader's own failed attempt is allowed at all.

**Cost, stated:** an owner whose declared auditors vanished together with the home leaves with both keys (escape), which needs no auditor.

**Core changes:** Identity (homeless procedure, step 4). Freeze test suite: 5.7c gains a thief who drops auditing, and one who names an auditor of its own.

**Applied:** the core library (`core/src/chain.rs`, `homeless_basis`; test `absence_statements_are_judged_by_the_auditors_in_force_before_the_homeless_rotation`); Identity draft 9, freeze test suite v14 (roadmap step 3), approved by Nobody, allegedly, 28 September 2026.

## F94. A home rule a rotation leaves in place must fit the homes it sets (found while building the core library, part 2, decided by Nobody, allegedly)

**Pattern 4** (a case left to each implementation, where verifiers must agree).

**Found while building:** core library, part 2 (roadmap step 3). Rotation check 5 validates "any new home rule" against the new home set, and is silent when a rotation changes the homes, leaves the rule in place, and the inherited rule no longer fits: an authoritative index past the end of the list, a threshold above the number of distinct operators, or fewer than two operators left.

**Options weighed:** the rotation is invalid; or the inherited rule lapses and the default of rule 5 applies, which quietly changes a protection the owner chose.

**Decided (Nobody, allegedly):** the rotation is invalid. The owner's client sends a rule that fits, or null for the default, whenever it changes the homes; a genesis client catches this before the safety key is spent.

**Core changes:** Identity (rotation check 5). No change to the core document or the freeze test suite.

**Applied:** the core library (`core/src/identity.rs`, `ChainState::apply`; test `a_new_home_set_must_still_fit_the_rule_in_effect`); Identity draft 9 (roadmap step 3), approved by Nobody, allegedly, 28 September 2026.

## F95. A voided but acknowledged receipt contests a position visibly, without blocking it (found while building the core library, part 2, decided by Nobody, allegedly)

**Pattern 3** (a rule that protects the owner also traps the owner).

**Found while building:** core library, part 2 (roadmap step 3). Receipt check 6: a receipt voided by the operator's rotation that another identity acknowledged "makes that chain position contested" and "never counts as support". Elsewhere "contested" means no rotation counts there (conflicts 1, rule 19). Read that way, a thief holding the safety key and a home's stolen everyday key, plus one accomplice's acknowledgement, would keep the owner's genuinely receipted rotation from ever counting at a single home, since nothing removes an acknowledgement.

**Decided (Nobody, allegedly):** a flag, not a block. The disputed receipt counts for nothing; the home's other receipts at that position are judged as before; the position is shown as contested. *An acknowledgement turns a thief's act into a visible dispute, never into a valid act, nor into a veto.*

**Core changes:** Identity (receipt check 6). No change to the core document or the freeze test suite.

**Applied:** the core library (`core/src/chain.rs`, `tally`; test `an_acknowledged_voided_receipt_is_never_support`); Identity draft 9 (roadmap step 3), approved by Nobody, allegedly, 28 September 2026.

## F96. A collective's key survives the loss of any one key holder (found while planning roadmap step 5a, decided by Nobody, allegedly)

**Pattern 3** (a rule that protects the owner also traps the owner).

**Found while planning:** roadmap step 5a, the test collective. Law draft 4, rule 36, requires "a way to rotate that does not need every member". A grammar in which one holder keeps the safety key meets that wording, since it needs only one person, yet if that holder dies the key can never rotate again and the collective is frozen for good. Law's own reasoning says the opposite should hold: "every grammar leaves a way through that needs less than everyone, so a dead member never freezes the key: the rule is about the exit, not the number." A single custodian holding the key under grant has the same flaw.

**Options weighed:** (a) reword the rule to survive the loss of any one key holder; (b) where one person holds the key, require a named successor and succession conditions for the agreement to be valid. (b) alone fails, since a successor with no key material cannot sign; with an escrowed share it is a case of (a).

**Decided (Nobody, allegedly):** both, as one rule. "Ok for now, building will reveal if it holds."

> A key grammar MUST leave a way to rotate that survives the loss of any one key holder. Where one person holds the safety key, the agreement MUST name a successor and an escrowed share released to them under its succession or abandonment clause; otherwise the agreement is invalid.

*A key holder is anyone holding the whole key or a share of it: a member, a custodian, the holder of an escrowed share. For a single holder, one construction: the key is split so that any two of four shares rebuild it; the holder keeps two and signs alone, the successor and a keeper hold one each, useless alone. When the named authority declares the holder absent, the keeper releases its share and the successor rotates the collective to a new key; the succession clone passes the seat.*

**Checkable:** a verifier checks the structure from the agreement alone (holders, threshold, recovery path). Whether the recovery works in practice stays the members' risk, as stated in F77. The succession and abandonment clauses are protected (rule 46a), so no majority removes them from the holder.

**Checked against the principles:** it strengthens the right of exit; no conflict.

**Core changes:** Law (rule 36; "Collectives are identities" commentary), at the next Law draft, written at roadmap step 5a, where the test collective first uses it. Freeze test suite: scenario 3's collective component gains a grammar with a single holder and no successor, rejected. No change to the core document.

**Applied (roadmap step 5a):** Law draft 6 (rule 36 and the "Collectives are identities" reasoning); freeze test suite v15 (scenario 3, step 7a, and the collective component). The core library checks the structure from the agreement alone (`core/src/law.rs`, `Terms::check`): a safety key held by every member needs a recovery path; a sole holder needs an escrowed share, released by the authority the abandonment clause names, and a seat successor in the holder's succession plan; a sole custodian needs a recovery path held by another. Tests: `core/tests/law.rs` (`a_grammar_leaves_a_way_to_rotate_that_survives_any_one_loss`) and `clients/repo/test/repo.test.ts`.

## F97. Verifiable dealing stops sole control of a collective's safety key, not a copy (found while building the air-gapped safety key Module, decided by Nobody, allegedly)

**Pattern 4** (a rule rests on a fact nobody can check).

**Found while building:** the air-gapped safety key Module (roadmap step 6). Law rule 36 said the Module rebuilding a collective's safety key "MUST deal the shares of the next key verifiably, or the device's holder ends up owning the collective's safety key"; Module 5.1 asked that each member verify their share "without the device retaining the whole key", and its attack test expected "a rotation device that tries to keep the collective's next key" to fail the members' share verification. It cannot. Whoever deals the next key sees it, and no check proves a device forgot something. What checking can stop is different: a device that commits to a key it keeps and hands the members shares of another seed, so that it alone could ever rotate. A second gap: shares can be checked against each other (verifiable secret sharing), but not against the hash commitment of an SLH-DSA key without either rebuilding the key or a zero-knowledge proof of SLH-DSA key generation, for which no established method exists.

**Options weighed:** reword and build share checks plus one rebuild check on a second offline device; reword and leave split safety keys to paper for V1 (collectives hold their safety key with one holder or a custodian); a zero-knowledge proof of key generation (strongest, but young tooling, a large build and a new dependency before the freeze).

**Decided (Nobody, allegedly):** reword, and build the checks. Verifiable dealing stops sole control, not a copy. The shares are dealt with Pedersen commitments, which hide the seed even from a quantum computer (Feldman's scheme would expose it, defeating a post-quantum safety key); every holder checks their share alone and compares the dealing's fingerprint with every other holder; right after dealing, k holders rebuild the key on a second offline device, compare it with the commitment, and forget it.

**Cost, stated:** the dealing device, and the device that runs the rebuild check, each hold the key for a moment and could keep a copy, as the rotating device already could. A dealer with a quantum computer could deal inconsistent shares undetected (Pedersen binding rests on the discrete logarithm); the rebuild check would still catch shares that do not rebuild the committed key.

**Core changes:** Law (rule 36's commentary and requirement). Air-gapped safety key Module (section 5 rewritten; the share message 2.4; the attack test becomes "a dealing device that deals shares not rebuilding the committed next key: the rebuild check fails"). No change to the core document or the freeze test suite.

**Applied:** `modules/airgap/` (`shares.rs`; `tests/collective.rs`: the dishonest dealer caught by the rebuild check, tampered shares, different dealings shown by fingerprint, a rotation through an escrowed share); Law draft 5, air-gapped Module draft 4 (roadmap step 6), approved by Nobody, allegedly, 28 September 2026.

## F98. Key delivery uses X-Wing (settling an open parameter of the Envelope MIP, decided by Nobody, allegedly)

**Found while choosing the libraries for roadmap step 5:** Envelope draft 5 recommends a hybrid X25519 plus ML-KEM-768 encryption key and leaves "the exact format of key deliveries under the hybrid scheme" open. The two libraries each yield a shared secret; how the two are combined into one key is a design choice, and a home-made combiner is where hybrid schemes usually go wrong.

**Decided (Nobody, allegedly):** "Adopt." Key delivery uses X-Wing, the general-purpose hybrid KEM for exactly this pair, specified in the IETF CFRG draft (draft-connolly-cfrg-xwing-kem). ML-KEM-768 through the `fips203` crate, X25519 through `x25519-dalek` (with `curve25519-dalek` 4.1.3 or later). Adopted, as for SLH-DSA, on the condition that the tests check every key exchange against a second, independent implementation.

**Checked against the principles:** content locked today stays locked if either half holds, which protects anchored history and private records for the long run; no conflict. *The draft may change before it is final; the version MOR names is fixed by hash at the freeze, like any specification.*

**Cost, stated:** neither ML-KEM crate is audited; `fips203` is called experimental by its authors. Their audit status is a specialist question before the freeze (F85).

**Core changes:** Envelope (encryption keys and key delivery; the open parameter closed, including the bare-key form), written at roadmap step 5. No change to the core document or the freeze test suite.

**Applied (roadmap step 5):** Envelope draft 6 ("Encryption keys and key delivery": founding scheme number 4, the `enc-key`, encryption-key and key-delivery formats). `core/src/xwing.rs` implements draft-connolly-cfrg-xwing-kem-11; its three test vectors pass, and every key exchange in the tests is checked against a second, independent implementation: libcrux (Cryspen's formally verified ML-KEM-768 and X25519) in the Rust tests, noble (`@noble/post-quantum`) in the TypeScript tests. The two agree on every exchange.

## F99. A private act reaches its recipients in a sealed container that carries its key (found while building the genesis client, decided by Nobody, allegedly)

**Pattern:** none of the four; a rule that depends on itself (the key delivery needed a key delivery), so it could not be carried out as written.

**Found while building:** the key delivery (roadmap step 5). Envelope draft 5 made a key delivery "a private act addressed to one recipient", whose payload "holds that key locked to the recipient's current encryption key". But a private act's payload sits in its locked inside, and a private act's content key is itself delivered by a key delivery. The first delivery's own key would need a second delivery, and that one a third, without end: the recipient could never open the first. Nothing on the outside carried the X-Wing ciphertext that would break the loop.

**Options weighed:** (1) the key exchange lives only in the sealed container, which already exists (F26: "the encrypted act plus key deliveries"): the container carries an act and the key that opens it, locked to each recipient; the act's shape does not change. (2) A new outside field carrying each act's content key locked to every recipient in `to`: any addressed private act opens by itself, but the act's shape changes in the core document, the core library and the relays. (3) A public key delivery whose payload holds the locked key: the smallest change, but every relay would then see that it is a key delivery, which act's key it carries and for whom, against "a private message does not stand out".

**Decided (Nobody, allegedly):** option 1. A private act reaches its recipients in a sealed container that carries its content key, or its key is delivered by a key delivery that travels in one. A key delivery's payload is plain: the act (or publication) and the key. Private, it travels sealed, addressed to its recipient or to no one for a bare key; public, addressed to no one, it is "going public later", the same payload.

**Cost, stated:** a private delivery always hides its sender from relays; a delivery that shows its sender to relays no longer exists. *Nothing relied on it: the recipient still sees the sender, and may show the signed inner act to anyone.*

**Core changes:** Envelope draft 6 (definitions; "Public and private"; "Encryption keys and key delivery"; "Sealed containers", now with the exact format; validity rules 10 and 10a; reasoning); core v16 ("Everything encrypted by default", "Public receiver, private sender"). No change to the freeze test suite: its sealed-container and key-delivery scenarios read the same.

**Applied:** `core/src/envelope.rs` (sealed containers, key deliveries, encryption keys, and which version of a routes or encryption-key chain counts); `core/tests/envelope.rs`; the genesis client (`clients/genesis/`) delivers keys this way to identities and to bare keys, over real relays.

## F100. A collective signs its own releases, and its member signatures are judged under the agreement its chain declared (found while building roadmap step 5a, decided by Nobody, allegedly)

**Pattern 1** (what decides is signed by the wrong party).

**Found while building:** the release manifest and the test collective (roadmap step 5a). The step's choices said a manifest is "a plain Envelope publication made for the collective (`for`)", which reads as: a member publishes it for the collective, and k members' visible signatures make it a release. But MOR has no clock, and members' own identities do not rotate when they leave a collective. After a member change, two former members could sign a new manifest under the old rules at any later time, and nobody could tell it was made after they left. Law draft 5 also left open which agreement judges an act of a collective when members have changed.

**Options weighed:** (1) the collective signs each release with its own everyday key, and k members add visible signature acts; the collective's rotation at a member change fences the old rules off, since whatever the old key signs afterwards is void under Identity's existing rules. (2) A member publishes for the collective, and the flaw is kept as a stated cost.

**Decided (Nobody, allegedly):** option 1. An act of a collective of a type its key grammar lists counts only with valid signature acts naming it, by parties who signed the agreement in force, meeting the grammar's rule for that type; the agreement in force is the one the collective's chain declares (Law declaration of kind 0) at the chain act that bound the act's key. A member change's rotation declares the complete clone, and each declared agreement must be a complete clone of the one declared before it. A release is a publication signed by the collective; it needs no `for`.

**Checked against the principles:** it uses Identity's rotation, unchanged, as the fence; nothing new below Law. It strengthens exit: leaving a collective is final.

**Cost, stated:** the collective's everyday key is used for every release, so whoever holds it (one member, in the test collective) can sign acts the grammar does not list without the others. The grammar lists what needs the members; listing every publication covers releases.

**Core changes:** Law draft 6 (rule 36, rule 37, the collectives' declaration, the key grammar's listed types gaining a rule). Freeze test suite v15 (scenario 3, step 7). No change to the core document.

**Applied:** `core/src/law.rs` (`LawView::consent`); `core/tests/law.rs` (`members_change_by_clone_and_rotation`: the old key's act after the rotation is void; a former member's signature does not count under the clone); the release manifest cMIP draft 1; `clients/repo/` (a "release" by the old key after the member change is refused). Law draft 6, freeze test suite v15 and the release manifest cMIP approved by Nobody, allegedly, 29 September 2026.

## F101. Inclusion proofs travel, so an audited identity's history outlives a vanished home (found while building roadmap step 7, decided by Nobody, allegedly)

**Found while building:** the identity gauntlet (roadmap step 7), scenario 5.7c, "declared auditors attest absence where a home vanished without closing", run for the first time with an audited rotation before the home vanished. Identity said inclusion proofs are not acts and "a home serves them on request". An identity that requires audit counts a rotation only with an inclusion proof of its receipt under a cosigned log summary (receipt check 4). Once the home vanished, a reader who had never reached it could prove no receipt it signed: the chain stopped at genesis for that reader, and the homeless rotation that both auditors' absence statements should let count could not count either. A reader who had read the identity before the home vanished still counted it. Two readers, two answers, from what they happened to have fetched earlier.

**Options weighed:** (1) proofs travel: anyone may carry them, since each is checked against a signed summary; the owner's client keeps the proofs of its own audited receipts and hands them to its new homes, which serve them; bundles carry them. (2) Auditors keep the logs they audit and serve proofs: more robust, but a new duty and storage for every auditor. (3) No rule change, the cost stated: an audited identity whose only home vanishes can be followed only by readers who read it before.

**Decided (Nobody, allegedly):** option 1.

**Checked against the principles:** nothing is trusted that was not before: a carried proof is checked against the signed, cosigned summary it names, as a proof from the home is. It follows "proof of life travels" (objections from anywhere). No clock, no new act type.

**Cost, stated:** proofs the owner's client never kept are lost with the home; an owner whose client kept nothing is back to option 3.

**Core changes:** Identity draft 10 (the log summary section: anyone may carry proofs; an owner's client SHOULD keep its own). Relay transport cMIP draft 2 (identity record parts 9 and 10, `POST /proofs`, bundle key 2, clients rule 5). Freeze test suite v16 (scenario 5.7c). No change to the core document.

**Applied:** `relay/` (the home keeps and serves carried proofs; `a_home_keeps_and_serves_carried_proofs`); `harness/src/carry.rs` (the owner keeps and delivers); the gauntlet's 5.7c check "(F101) a new reader cannot prove the audited rotation of a vanished home until the owner carries its inclusion proofs to the new home". Identity draft 10, relay transport cMIP draft 2 and freeze test suite v16 approved by Nobody, allegedly, 30 September 2026.

## F102. A format shows what it does not hide in the order of the bytes, and never hides it by styling (found while building roadmap step 8, decided by Nobody, allegedly)

**Pattern:** 4, in part: a rule rested on a word ("hide") that did not cover every way a reader can be shown something other than the bytes.

**Found while building:** the long-form text format (roadmap step 8), the first cMIP for task 4. The Text MIP bounds a format twice: it may hide only characters that are not letters or digits, and it may never add text (F82, M7). Nothing bounded the order. A format keeping both limits could still show the same words in another order than the bytes: a clause moved to a footnote at the end, text set in columns, a "not" placed elsewhere on the screen. A reader of an offer would see an order the signer's bytes do not say, the harm rule 5a guards against for bidirectional controls, reached through the format instead. Nor did "hide" plainly cover styling: a format could shrink or colour a clause to nothing without "hiding" a character.

**Options weighed:** (1) add both to the bound: a format shows what it does not hide in the order of the bytes, and never makes it invisible or unreadable by styling; (2) order only, styling left to client warnings, since "invisible" is a judgement; (3) no change: the founding format keeps order anyway, and other formats would be the reader's client's problem.

**Decided (Nobody, allegedly, 30 September 2026):** option 1.

**Checked against the principles:** it narrows what a cMIP may do and relaxes nothing. Order is checkable by a machine for any format that can say which character it shows where, as the founding format does (`clients/longform`, `checkBound`). Styling is judged as the bound on hiding already was.

**Cost, stated:** no format may move text: no footnotes gathered at the end, no side-by-side layout that changes the reading order. A format with such features shows them where they stand in the bytes.

**Core changes:** Text MIP draft 6 (task 4; reasoning; freeze scenarios). Core v17 ("MIP: Text"; its header now names the current drafts, Identity 10, Text 6 and Law 6). Freeze test suite v17 (the Envelope and Text checklist; scenario 5.9 and its pass condition).

**Applied:** the long-form text format cMIP, draft 1 (`cmips/cmip-long-form-draft-1.md`, rendering rules 12 and 13), and its founding implementation, whose tests check the bound on every rendering, 20,000 generated texts among them (`clients/longform`).

*F102, the long-form cMIP draft 1, Text MIP draft 6, core v17 and freeze test suite v17 approved by Nobody, allegedly, 30 September 2026.*

## F103. A collective's rules follow the layers, and Law's in three tiers; nobody loses their say by default (found while building roadmap step 11b, decided by Nobody, allegedly)

**Pattern:** 1, a guard with a side door: the protection sat on one route to an outcome, and another route reached the same outcome unguarded.

**Found while building:** the collective client (roadmap step 11b), while reading a clone's own signing rule (terms field 4, which for a clone plays no part; F104). Removing a party's voice from the clone rule is an outcome of the abandonment clause, and that clause is protected: it cannot change for a party who did not sign (rule 46a). But the clone rule itself (terms field 5) is not protected. Any clone meeting the current clone rule may rewrite it, so two members of three can, in one clone, write the third out of every later decision. Her stake and her protected clauses hold; her say in everything else is gone, without absence, a contest or her signature.

**Options weighed:** (1) keep it, and have clients say before signing that a majority can later decide without the minority; (2) let founders set a separate rule for changing the rules, defaulting to today's behaviour; (3) make the clone rule a protected clause, so nobody can ever be voted out; and, arising from the discussion, a structure in which each kind of act has its own rule.

**Decided (Nobody, allegedly, 30 September 2026):**
- **Rules follow MOR's layers.** Every act names its layer and type, so a collective's rules can say who may act on each layer (Identity, Envelope and Text, Finance, Law, Production) with nothing to interpret.
- **Within Law, three tiers.** *Constitutional:* who decides: the signing rule, the clone rule, the key grammar, membership. *Judicial:* who judges and by what: the protected clauses of rule 46a (abandonment clause, succession plan, fork rule, keepers, time reference), given a name and a place; the split service stays protected as a stated exception, operational in kind but able to move money. *Operational:* everything else, divided further.
- **Operational areas are powers of members,** written into the constitution: a member given power over an area decides there, and may grant within it. Grants stay what they are: authority to act in the collective's name without a stake, the employer-and-employee kind. A grant never reaches beyond the power of whoever issued it.
- **The constitutional tier has its own change rule.** If none was agreed at founding, the default is everyone: nobody loses their say without signing.

**Checked against the principles:** right of exit: nobody is written out by default; a group that wants expulsion writes it in at founding, where every founder signs it. Legible greed: every tier and area is stated in the terms and shown in plain words before signing (Law rule 4a). Evolutionary design: the core gives the language for tiers and areas; the constitutions themselves are the parties' choice and can be offered as cMIPs.

**Cost, stated:** by default a member who is present but unwanted cannot be removed; the others can leave, or use the abandonment clause where it applies. The exact format of the key grammar changes, which the repo client (step 5a) and the collective client (step 11b) already use.

**Core changes, to be made:** Law MIP draft 7 (definitions; terms fields; the key grammar's format; rules 45 to 46a; reasoning; freeze scenarios). Core v18 ("MIP: Law"). Freeze test suite v18 (scenario 3: a majority clone that rewrites the clone rule without the minority is incomplete under the default; an area power and a grant within it; a grant beyond its issuer's area is invalid).

**Applied:** not yet. The Law redraft comes before step 12, then the two clients.

**Scope (Nobody, allegedly, 1 October 2026, question Q1 of the Law redraft):** the tiers and lanes apply to collectives only. "Deals should be as simple as possible while remaining rich. Collectives is for when things get complicated." Two people who end up doing many deals together can found a collective.

**Answers to the Law redraft's questions (Nobody, allegedly):**
- Q2 (1 October 2026): a collective's words are split like its rules: the constitution's words are constitutional, and each area carries its own words, which its holders change with it.
- Q3 (1 October 2026): arbitrators, the condition cMIP and the anchoring cMIP are judicial and protected, beside the keepers and the time reference: each can decide who wins a dispute, so a majority cannot pick a friendlier judge after the fact.
- Q4 (1 October 2026, revised the same day in F106): adopting an extension is governed by whoever holds the Production lane.
- Q5 (1 October 2026): an area's power is exclusive. "The area is to her, or to the narrower collective rule that governs it." The collective's clone rule cannot reach into it; its holders, and the rule they act by, change only by a constitutional change.
- Q6 (1 October 2026): a member can always leave alone, by an act that gives up their voice without anyone else's signature; they keep their stake, and the remaining members rotate the collective's keys (F100), a resignation counting like a loss (F96, F105). And where a constitution allows removing a member, removal takes the voice only, never the stake: "Kicked from the board does not mean being forced to give up shares." (Absence remains the abandonment clause's business, under the clause the member signed.)
- Q7 (1 October 2026): a clone that changes several areas at once is valid when each area's rule is met; its mark (F104) names every rule it met, and it comes into force all at once or not at all.
- Q8 (1 October 2026): only constitutional clones need the collective's keys to rotate; operational clones leave the signers unchanged. "The collective key resembles more a safety key than a signing key in that regard."
- Q9 (1 October 2026): terms field 4 belongs to no tier. In a clone it is a mark of fact (F104), written fresh each time; founding terms are signed by everyone, and the tiers govern only later changes.
- Q10 (1 October 2026): lanes by layer and areas are one construct: an area may be defined by whole layers, by act types or by fields, with one set of rules for holding it, granting within it, leaving it and changing it.
- Q11 (1 October 2026): a collective's founding agreement exists only when every identity in its first version has signed. "A person should not be added to a collective without their approval": a member added later is bound only by their own signature (rule 45).
- Q12 (1 October 2026): a clone that changes an area and something outside every area is valid when both rules are met, its mark naming both, as Q7.
- Q13 (1 October 2026): giving up an area changes the constitution at that level. Three ways: the holder leaving nominates a replacement, and the constitutional rule approves or not; or the constitutional rule proposes a replacement, and the holder leaving approves; or the constitutional rule redraws that area's rules entirely. The replacement signs too (Q11). Until one of them completes, the holder keeps the area. And a holder may step down at once, alone ("I'm done, won't do anything anymore"): an act by which they give up the area without anyone's signature; the collective then makes the constitutional change for that area by one of the three ways. Between the stepping down and that change, the area is frozen: its acts count for nothing. "If her departure freezes a layer, the collective will organize quickly to fix it." (Payments to the collective's payee pointers still arrive on their rails; only the collective's own acts in that area wait.)
- Q14 (1 October 2026): a seat passes automatically by succession only if every member still counted signed that version of the succession plan; otherwise the successor is a nomination approved by the constitutional rule, as in Q13. A stake passes by succession as planned: it is property, not a seat.
- Flaw E (1 October 2026, third pass): an identity may keep several sequences, so "after" a resignation, a stepping-down or a record act was undefined across them. Like a rotation, each of these acts names the latest act of every sequence its signer keeps; anything outside those counts as made after it.
- R4 (1 October 2026): a specification adopted for tasks in two layers does not make the terms invalid. Adopting it for the second layer needs both lanes in one change, and its acts need both lanes' holders.
- Q15 (1 October 2026): the judicial tasks (condition evaluation, time reference, anchoring) stay judicial: the Law lane's holder cannot change them; for each member they change only with that member's signature (Q3). The Law lane adopts the other Law tasks' specifications.
- Q16 (1 October 2026): in a collective with areas, an act under a specification the collective never adopted counts for nothing; otherwise an unlisted specification would be a way around every lane.
- Q17 (1 October 2026): when one of several holders steps down, the others carry on under the flaw C rule; an area is frozen only when no holder remains. Grants within a frozen area stop; grants within an area that keeps running carry on.
- Q18 (1 October 2026): the specification format gains a field in which an extension declares the layers it acts on (Production MIP draft 5). Dropping an extension needs the same approvals as adopting it: Production and every layer it acts on.
- Q19 (1 October 2026): a seat passed by succession carries membership, never the areas its holder held; those are refitted as in Q13, frozen meanwhile unless co-holders carry on (Q17).
- Flaw F (1 October 2026, fourth pass): a sequence left out of a resignation, a stepping-down or a record could undo what others relied on (a completed clone falling back to a draft, a paid publication un-signed). As for rotations, an act another identity acknowledged, or a named keeper recorded, still counts as made before, shown as disputed; and the record or rotation that puts a clone in force counts as acknowledging the signatures that completed it.
- Q20 (1 October 2026, fourth pass): a specification adopted for a judicial task (condition evaluation, time reference, anchoring) cannot also be adopted for any other task; terms that do so are invalid. A judge never handles what it judges: "it removes a slight conflict of interest."
- Q21 (1 October 2026, fourth pass): the clone that completes a succession also removes the departed member from every area they held; an area may then have no holder, which means it is frozen until refitted (Q13, Q19). An empty holder list is allowed only in a clone, never in founding terms.
- Q22 (1 October 2026, fourth pass): grants within an area end for good when it freezes. A new holder may, on taking the area, reinstate any of the ended grants as their own, each by their own signature, never automatically.
- Q23 (1 October 2026, fourth pass): a signature made before its signer resigned or stepped down is valid: "her position at time of signing is valid. She was still acting. Whether it gets approved now depends on collective rules." For that clone or act, the signer still counts as a voice; the rule it needs is met or not as written, never lowered by the departure.
- Flaw G (1 October 2026, fifth pass): an acknowledgement carries no date, so under flaw F a departed member's deliberately forgotten sequence, acknowledged by a friend, could keep counting. Only what can be placed in time protects an act from counting as made after: a named keeper's record made before, and the record or rotation that put a clone in force. A bare acknowledgement keeps the act visible, without effect. *Cost, stated:* a buyer who only acknowledged a purchase is not protected by that alone; deals that need protection name a keeper.
- Flaw H (1 October 2026, fifth pass): nothing ordered a frozen area's grant branches against the freeze. At the refit, the new holders either seal each ended grant by a revocation naming the last act that counts (the existing seal rule, never before a deal the collective acknowledged or was paid on), or reinstate it (Q22). Until then, the grantee's acts after the last one known to precede the freeze are undetermined.
- Q24 and Q25 (1 October 2026, fifth pass): Q20 applies to deals too, and covers every way a specification can be named: a task, an extension, or the separate time-reference field.
- Q26 and Q27 (1 October 2026, fifth pass): when removing a holder leaves an area's number above its holders, a clone may say so, and it is counted by the flaw C rule (all remaining holders meet it). Reinstating a grant needs the area's own rule.
- Q28 (1 October 2026, fifth pass): an abandonment declaration removes a voice from then on; it never undoes a clone completed and recorded before it, whatever version of the clause it names, as for a resignation (flaw F, Q23).

*F103 decided in principle by Nobody, allegedly, 30 September 2026; the exact wording awaits the Law redraft.*

## F104. A clone's signing rule states truthfully what brought it into force (found while building roadmap step 11b, decided by Nobody, allegedly)

**Pattern:** 4, in part: a field every agreement carries, whose meaning the text gave only for founding terms.

**Found while building:** the collective client (roadmap step 11b). Terms field 4, the signing rule, says which signatures make an agreement exist. For founding terms it does. For a clone it plays no part: a clone comes into force when the parent's rule is met (rule 45). The field was written but unused, free to say anything: a line that looks binding, isn't, and can mislead a reader or split two implementations.

**Options weighed:** (1) ignored, whatever it says; (2) the truth: it states the rule that actually brought the clone into force, and verifiers check it; (3) absent: only founding terms carry it.

**Decided (Nobody, allegedly, 30 September 2026):** option 2, "which means simply a mark of who triggered it". With F103, a clone may come into force under different rules depending on what it changes: the constitutional tier's change rule (everyone by default), or the power of the members who hold an operational area. A clone's field 4 names which of the parent's rules it claims to meet, and the signatures that met it. A verifier checks that the named rule is the one what the clone changes requires, and that it was met; a clone whose mark is false is invalid.

**Checked against the principles:** it relaxes nothing: a clone still needs the parent's rule met. Legible greed: every version says, on its face, who brought it into force and under which power, checkable by a machine. It gives field 4 a use in every version, so no field is dead text.

**Cost, stated:** a verifier must decide which tier and area a clone touches before it can check the mark, so the Law redraft must define that mechanically from the fields a clone changes.

**Core changes, to be made:** with F103: Law MIP draft 7 (terms field 4; rule 45), core v18, freeze test suite v18 (scenario 3: a clone whose mark names a rule it did not meet, or a rule weaker than what it changes requires, is invalid).

**Applied:** not yet.

*F104 decided in principle by Nobody, allegedly, 30 September 2026; the exact wording awaits the Law redraft.*

## F105. Every identity with constitutional power in a collective is covered by an abandonment clause (found while drafting Law draft 7, decided by Nobody, allegedly)

**Pattern:** 1, the F96 hole again, one tier up: a promise kept for the keys and not for the rules.

**Found while drafting:** Law draft 7 (flaw A of the redraft for F103 and F104). Under F103, changing a collective's constitution needs everyone unless the founders agreed otherwise. If a member whose signature that rule needs dies, every later change to members, rules or keys waits for a signature that can never come. The collective's constitution is frozen for good, and F96's promise that the loss of any one member never freezes a collective holds for the keys only.

**Options weighed:** (1) every collective must carry an abandonment clause able to remove an absent member's voice from every rule; (2) required only where the change rule is "everyone"; (3) not required, stated as a cost; and the option decided, proposed by Nobody, allegedly: required for each identity holding constitutional power.

**Decided (Nobody, allegedly, 1 October 2026):** every identity whose signature a collective's constitutional change rule can require MUST be covered by an abandonment clause whose outcomes include removing that identity's voice. A founding agreement or clone of a collective that leaves such an identity uncovered is invalid. Collectives only: in an agreement that founds no collective, a party's death leaves the agreement running as written, with succession plans to step in, and locks nobody out of an identity.

**Checked against the principles:** right of exit and the good ancestor: the constitution is the tier that can repair every other (it can reassign an area, revoke a grant, refit the key grammar), so it alone must never freeze, and it freezes only through the loss of someone whose signature it needs. Members without constitutional power need no clause: their loss is repaired from above. The clause is judicial and protected (rule 46a), so every covered member signed it, and its authority and outcomes stay as each signed them.

**Cost, stated:** every collective names an abandonment authority from the start, and a founding agreement without one is refused, as the single-holder grammar is (scenario 3.7a).

**Core changes, to be made:** Law draft 7 (collectives; abandonment; the validity of founding terms and clones), core v18, freeze test suite v18 (scenario 3: a founding agreement leaving a constitutional member uncovered is rejected; a member with constitutional power dies, is declared absent, loses their voice, and the others change the constitution).

**Applied:** not yet; on the branch `claude/law-draft-7` with the rest of the redraft's answers.

**Then decided (Nobody, allegedly, 1 October 2026; flaw C of the Law redraft's second pass):** a number can outlast the voices it counts: "three of three" still asks for three after one voice is removed, and F105 would unfreeze nothing. So when fewer voices remain than a rule's number asks for, all the remaining voices together meet it; where enough remain, the number stands as written. A lone survivor still holds the keys and the constitution only under F96 and F105.

*F105 decided by Nobody, allegedly, 1 October 2026.*

## F106. A cMIP's act belongs to the layer of the task it fills; extensions travel in the Production lane (found while drafting Law draft 7, decided by Nobody, allegedly)

**Pattern:** 4, in part: F103 named lanes by layer, while an act names the specification that defines it, not a layer.

**Found while drafting:** Law draft 7 (flaw B of the redraft for F103 and F104). For the six MIPs' own acts, the layer follows from the specification. Two cases did not: acts defined by cMIPs, which name the cMIP; and Production, which has no acts of its own, since specifications and releases are Envelope publications.

**Decided (Nobody, allegedly, 1 October 2026):** a cMIP defines how a task is done, and what the core sees is that task's result, which belongs to the layer of the MIP that defines the task (Production, table of tasks). So a cMIP's act belongs to the layer of the task the collective's own terms assign that cMIP to (terms field 2): a collective that gives Finance to some members gives them the acts of every payment and conversion cMIP it adopted, by its own list, never by a label the cMIP's author chose. Production defines no tasks: specifications and releases are publications, in the Envelope lane.

**Checked against the principles:** evolutionary design: a new rail module needs no constitutional change to fall in the right lane, only the collective's adoption of it, which is already in its terms. Legible greed: which lane an act falls in is computed from the collective's own terms, so every verifier agrees and the client can show it before signing.

**Then decided (Nobody, allegedly, 1 October 2026; flaw D of the Law redraft's second pass):** "Modules and cMIPs should be able to be governed on the layer they sit." Adopting or replacing a cMIP for a task is governed in the lane of that task's layer: a treasurer holding Finance adopts a new payment cMIP alone. Extensions are not mapped to a MIP's task, so they sit in the Production lane, and "extensions are governed by whoever has the rights at production level": adopting one is a Production-lane change, not a constitutional one (this replaces the answer to Q4). Flaw D (an ordinary clone not written on the collective's own record, so the new cMIP's acts fell in no lane until the next rotation) is resolved by separating the two: every complete clone of a collective's agreement is written on its record at once; only constitutional clones also rotate its keys (Q8).

**And (Nobody, allegedly, 1 October 2026):** an extension that acts on another layer needs both the Production lane and that layer's lane to approve it, in one change (as Q7). An extension declares, in its specification, the layers it acts on, so a client knows whose approval to ask. The declaration is not trusted for enforcement: a verifier applies an extension's rules only to acts in the lanes whose holders approved it, so an extension that under-declares binds nothing beyond those lanes.

**Cost, stated:** a collective cannot give releases to one member and other publications to another by lane alone: both are Envelope publications.

**Then decided (Nobody, allegedly, 1 October 2026): extensions travel in the Production lane.** Production is the MIP that defines extensions and how specifications are adopted, and it has no tasks, so its lane was empty. The acts of extensions, and new act types that fill no task (Production rule 8a), belong to the Production lane. *(Revised the same day, below: adopting an extension is governed in the Production lane.)* Nothing an extension does relaxes the core (Production 8c): the MIPs' own acts stay in their own lanes, whatever an extension adds around them.

**Core changes, to be made:** Law draft 7 (the lanes; rule 36a), core v18, freeze test suite v18 (scenario 3: a receipt from the collective's payment cMIP falls in its Finance lane; the same cMIP not named in its terms falls in no lane; an act of an adopted extension falls in the Production lane, and its holder cannot adopt a new extension).

**Applied:** not yet; on the branch `claude/law-draft-7`.

*F106 decided by Nobody, allegedly, 1 October 2026.*

## F107. A deal changes only with everyone's signature (found while drafting Law draft 7, decided by Nobody, allegedly)

**Pattern:** 1, the side door of F103, left open in deals once the tiers were scoped to collectives (F103, scope).

**Found while drafting:** Law draft 7, after question Q1. With tiers and lanes for collectives only, a deal of three or more parties whose clone rule was "any two" could still be cloned by two of them into a clone rule that leaves the third out of every later change.

**Options weighed:** (1) make a deal's clone rule a protected clause, so only everyone can change it, majorities kept for the rest; (2) every change to a deal needs every party.

**Decided (Nobody, allegedly, 1 October 2026):** option 2, "deals should always be an everyone must agree scenario". In an agreement that founds no collective, the signing rule and the clone rule are every party: a deal exists when all its parties have signed, and a clone of it completes only when all the parent's parties have signed. Majorities, areas and tiers belong to collectives.

**Checked against the principles:** right of exit and legible greed: in a deal nobody's terms change without their signature, so a party never has to read a rule to know whether they can be outvoted. It simplifies Law: for deals, the per-party protected clauses (rule 46a) and forks among independent clones (rule 47) no longer arise, since no clone completes without everyone.

**Cost, stated and accepted ("one person can force everything until all agree. That's deal making in everyday life"):** one silent party blocks every change to a deal, however large. The ways out: the abandonment clause, whose declaration is not a clone, can remove an absent party's voice where the deal provides it; succession plans; and, for many parties or a long relationship, a collective.

**Core changes, to be made:** Law draft 7 (terms fields 4 and 5 for deals; rules 45 to 47), core v18, freeze test suite v18: scenario 1 step 9b becomes a clone of the abandonment clause signed by two of three, which stays a draft; step 7's "required signatures" are every party's.

**Applied:** not yet; on the branch `claude/law-draft-7`.

*F107 decided by Nobody, allegedly, 1 October 2026.*

## F108. A publication's size field is the size of the unlocked media (found while building roadmap step 11c, decided by Nobody, allegedly)

**Pattern:** 4: one field, two readings.

**Found while building:** the owner's desk (roadmap step 11c). Envelope's publication payload (field 3) is "size of those bytes", following field 2, the locked bytes as stored. The JPEG Module, the deployed barebone client and the reader all write and read the size of the unlocked picture. Two conforming programs read the same field differently.

**Options weighed:** (1) Envelope's wording changes to the unlocked size, matching what is deployed; (2) the Module and the two clients change to the locked size.

**Decided (Nobody, allegedly, 1 October 2026):** option 1. Field 3 is the size of the media once unlocked: what a reader and a media module need to know. A relay measures the locked bytes it stores for itself.

**Checked against the principles:** it relaxes nothing; it removes a reading two implementations could differ on, and matches the code already deployed.

**Core changes, to be made:** Envelope MIP draft 7 (publication payload, field 3); freeze test suite (a publication whose size is not the unlocked media's is shown as inconsistent).

**Applied:** already followed by the JPEG Module, the barebone client, the reader, the desk and the connector.

*F108 decided by Nobody, allegedly, 1 October 2026.*

**Written in (core pass, 3 October 2026, not yet approved):** Envelope draft 7 (field 3; rule 14a); freeze suite v21 (step 2.1b); core v21 (Envelope, media).

## F109. In a collective, "before" and "after" are judged on the collective's own sequence (found while drafting Law draft 7, decided by Nobody, allegedly)

**Pattern:** a root cause behind several findings: flaws E to L, Q23, Q28 and Q30 of the Law redraft each ordered a member's personal sequences against a collective event (a resignation, a stepping-down, a freeze, a declaration of absence, a record), and each patch opened another gap.

**Found while drafting:** Law draft 7, after its final pass found flaws I to L. Suggested by the project lead; tested on branch `claude/law-ordering-test-buw632` (`docs/law-ordering-rule-test.md`, simulation crate `mor-ordering-sim`). Replayed without draft 7's patches, every story kept its good outcome and lost its harm; over 20,000 simulated collectives (862,000 acts, forks, offline devices, backdating, late signatures) the rule gave no wrong answer, where draft 7 as written gave one in 8,490 worlds.

**Decided (Nobody, allegedly, 1 October 2026):** for anything done in a collective's name, "before" and "after" are judged only on the collective's own sequence, never on members' personal sequences. It replaces most of draft 7's "Made before, made after" section (the personal device list in resignations, the keeper and record exceptions for members' signatures, the separate line drawn by a declaration, "the last act known to precede the freeze", the seal's place in rule 42, the two exceptions in rule 44d), with four additions:
- **A1.** The collective draws its own line for each departure, as a field of its record act, written at once.
- **A2.** A record lists the signatures that put its clone in force (which also closes a flaw in draft 7: a record completed late could knock a later clone out of force, or count a member who had already left).
- **A4.** Two lines of the collective that do not name each other are concurrent, and records on them are a fork of the agreement; the earlier version stays in force.
- **A6.** A grantee's deal is settled by whether the collective itself acknowledged, paid or imported it.

**Checked against the principles:** right of exit: leaving still needs no one's permission; a collective that delays drawing a departing member's line only delays itself. Legible greed: one rule, checkable on one sequence the collective publishes. Evolutionary design: the core keeps one ordering rule instead of many patches.

**Costs, stated:** a departure takes effect for the collective's acts when the collective draws its line, not when the member signs; an act on a branch the collective's own line left out counts as made after it. Not reached by the rule: a member's own key rotation still judges their signatures through Identity (choice C5).

**Choices (Nobody, allegedly, 1 October 2026):**
- C1: a member's signature on an everyday act of the collective is placed at the act it signs: a member who left can still complete an act the collective signed before its line, and it counts ("the act was drafted with her in it"). *Cost, stated:* a pending act stays completable by whoever held the area when it was made.

- C2: Q23 under F109: a signature counts for a clone after its signer leaves when the collective placed it before its line: the record came first, or the collective acknowledged it as it arrived. *Stated:* a signature the collective never acknowledged before the line no longer counts; a collective's client SHOULD acknowledge members' signatures as they arrive, which keeps Q23's outcome.

- C3: the line for a departure is drawn by the collective's record act, with a new field naming the departures it registers, written at once with the everyday key (A1); the rotation still follows to fence off the departed member's key share (F100).

- C4 (A3 adopted): the collective's keepers, named by its agreement in force, may place the collective's own acts that its line left out: such an act counts as made before the line when a keeper recorded it before recording the line. Members' signatures and deals are not placed by keepers. *Stated:* a keeper that records a line late opens a window, the trust in keepers rule 11a already states.

- C5: a member's own rotation is registered by the collective on its line, like a departure; that member's signatures on acts of the collective placed before that line stay valid for the collective. If the member's key was stolen, the thief's signatures placed before the line count too, but only on acts the collective's key holders also signed: a stolen member key can finish an act the collective signed, never start one. "In the event of theft, the band reorganizes around it." *Cost, stated:* within a collective, Identity's theft protection is softened to this extent.

- C6: a revocation seals a grant's branch without naming a place on it; deals the collective acknowledged, paid or imported bind (rule 40); nothing is ordered on the grantee's own sequence.
- C7: a declaration of absence takes effect at the collective's line, or at the recovery rotation where the declared member is the one who would draw it; the authority draws no line for the collective.
- C8: between a freeze and the refit, a grantee's deal the collective has not placed is undetermined; the refit decides.
- Flaw M (seventh pass): the rotation that brings in a constitutional change lists the signatures that completed it, as a record does (A2), so no later signature can complete it late.
- Flaw N (seventh pass): a reinstatement (Q22) is an act of the collective completed by the new holders, placed after they took the area, not a signature on the old grant.
- Seventh pass, remaining items (1 October 2026), the session's leans: Q29 the issuing area seals its grants; Q31 both time-reference fields must name the same specification; Q32 each area gets a permanent number; Q33 C5 also protects signatures on clones; Q34 the keepers of the agreement in force at the line place the collective's acts; Q35 "only the time reference decides before and after" is narrowed to deadlines; Q36 a record's departures stand even if its clone fails; Q37 a threshold absence authority is counted at the collective's line registering the declaration; the two readings confirmed (a record may register a departure without a clone; in a deal, a declaration draws its own line). Q38: concurrent records are settled by the agreement's own fork rule; where it has none, the earlier version stays in force (A4).
- Flaw B1 (1 October 2026, found while reworking the code to Law draft 7): a collective rotation that declares no new agreement carries forward the agreement in force, recorded clones included; it changes keys, not rules. As written, it fell back to the last agreement declared at a rotation and silently dropped recorded clones.
- B2 to B13 (1 October 2026, code rework), the session's leans, to check at the end of the roadmap: B2 for a record, only records strictly before it count; B3 an acknowledged early signature of a departed member counts as a voice; B4 a change of a task's cMIP lies in the task's lane, else an area naming the task, else the clone rule; B5 a rotation may declare only a constitutional clone; B6 only a direct child of the agreement in force; B7 an area naming genesis, rotations or records is invalid; B8 a mark's signers in ascending order of hash; B9 "a keeper recorded it" means the keepers' rule; B10 named again after leaving only by a constitutional clone signed after their line; B11 a fork of records is resolved by a clone of either branch recorded after both lines; B12 the abandonment declaration's format: {0 agreement, 1 clause version, 2 party, 3 [+ outcome]}; B13 judicial-only changes in the collective client once B12 is in.
- Flaw B14 (1 October 2026, Law draft 8): an automatic seat by succession (Q14) could never complete, since the change passing it could neither update the keys nor drop the used plan. The successor takes the departed member's place in the keys, every threshold unchanged, and the used plan is dropped; the collective re-deals its keys to include the successor (F96, F105).
- B15 (1 October 2026, Law draft 8): where absence is judged by several members ("any k of the other members"), one of them signs the declaration and the others add signature acts naming it, as for terms; it counts once the required number have signed.
- B16 (1 October 2026, Law draft 8): C7's recovery rotation is the rotation that removes the declared member.
- B15's reading confirmed (1 October 2026): the other members' signatures on a declaration count where the collective acknowledged them, at or before its line (as A2 and C2). Law draft 8, core v19, freeze suite v19 and the code approved by Nobody, allegedly, and merged into main the same day, with flaws B17 (a sole safety-key holder's successor left with no successor named, rule 36), B18 (a declaration needing several signers when the absent member alone holds the everyday key) and B19 (where a declaration by several parties takes effect in a deal) open, refused by verifiers; B14's smaller points (the successor's place in the parties' list, voting weight, a successor already a party, several successors to a sole key, a departed custodian or recovery holder) left for the end of the roadmap.
- Flaw B17 (1 October 2026, after merging Law draft 8): where one person holds the safety key, the succession clone that gives the seat to a successor also carries a succession plan for that successor, signed by them in the same clone (they sign to join anyway, Q11), so the key always has a named successor (F96, rule 36).
- Flaw B18 (1 October 2026): where the declared member alone holds the everyday key, the recovery rotation that removes them names the declaration's signatures, as a rotation names a clone's (flaw M); the declaration then counts at that rotation.
- Flaw B19 (1 October 2026): in a deal, the absence authority is one identity: a party, a keeper, or a collective. A threshold of several parties is not allowed in a deal; parties who need to decide together form a collective, which orders its own acts (F109), as co-producers form one company for a film. "A collective made of collectives" (Nobody, allegedly).
- Found by the ordering simulation, written into draft 8 as B11's reading: "a clone of either branch" is a clone of that branch's latest clone, or a resolution would drop a clone already recorded on the branch.

**Core changes, to be made:** Law draft 7 (the "Made before, made after" section; rules 37, 37c, 40, 42, 44, 44d; the record act's fields); freeze suite v18 (scenario 3 and the stories of the test).

**Applied:** written into Law draft 7 (seventh pass), core v18 and freeze suite v18 on the branch `claude/law-draft-7` (1 October 2026); approved by Nobody, allegedly, and merged into main the same day. Flaws I to L and Q30 settled by it. Writing it in exposed Flaws M and N and questions Q33 to Q38, listed at the end of Law draft 7. Simulated against the text as written (`docs/law-ordering-rule-test.md`, section 8): no wrong answer over 20,000 worlds. *Eighth pass, the last writing pass (1 October 2026):* Flaws M and N, Q29, Q31 to Q38 and the two readings written into Law draft 7, core v18 and freeze suite v18 on the same branch, not merged: a rotation's Law declaration names its clone's signature acts, `[clone, [+ hash]]` (M); a reinstatement is a grant whose new field 7 names the ended grant (N); areas carry a permanent id, area key 5 (Q32); Q38 settles concurrent records only, records drawn one after the other staying as written (the second puts nothing in force). Nothing is left open in Law draft 7 but the third pass's eight readings. The simulation, which already modelled the answers where it reaches them, rerun unchanged: no wrong answer over 20,000 worlds.

*Draft 8 (1 October 2026):* Flaw B1 and B2 to B13 written into Law draft 8, core v19 and freeze suite v19 on the branch `claude/law-draft-8-code-rdvox0`, not merged; the core library and the repo and collective clients reworked to them. The ordering simulation, given B11 and a targeted sweep of 3,000 worlds starting from a fork of the agreement, gives no wrong answer; nor do its 20,000 random worlds. *Last pass (1 October 2026):* Flaw B14, B15 and B16 written into Law draft 8, core v19 and freeze suite v19 on the same branch, not merged, and built: an automatic succession clone puts the seat successor in the departed member's place in every holding of the key grammar, thresholds unchanged, and drops the executed plan, and the rotation declaring it re-deals the keys (scenario 3.8b run in the core's tests); a declaration by a threshold of the other parties is signed by one of them and completed by the others' signature acts, counted where the collective placed them at or before its line, by an earlier act or by the record registering it acknowledging them (A2's reason: no late completion); C7's recovery rotation is the one removing the declared member. Writing them in exposed three flaws, listed at the end of Law draft 8 for Nobody, allegedly, and refused by verifiers meanwhile: **Flaw B17**, a sole safety key holder's succession clone leaves the successor holding the safety key with no successor named, invalid by rule 36 (F96), so rule 36's own construction never completes automatically; **Flaw B18**, under C7 the collective cannot place the others' signatures before the recovery rotation, so a threshold declaration needing more than its own signer never takes effect there; **Flaw B19**, in a deal, where a declaration completed by several signatures takes effect. With them, the points B14's answer leaves open: where the successor goes in the parties' list when not in the departed member's place, a seat's voting weight, a successor already a party, several successors to a one-holder key, a departed custodian or recovery holder.

*Draft 9 (1 October 2026):* Flaws B17, B18 and B19, as answered by Nobody, allegedly, written into Law draft 9, core v20 and freeze suite v20 on the branch `claude/law-draft-9`, not merged, and built in the core library and the repo and collective clients: a succession clone passing a sole safety key holder's seat carries, in the executed plan's place, a plan for the successor naming their own successor, signed by the successor as the mark's signer (B17; scenario 3.8b, a sixth collective); the recovery rotation's Law declaration takes a third element, `[clone, [+ hash], [+ hash]]`, naming the signature acts on the declaration that takes effect there, which it places, a rotation naming any other act there putting nothing in force (B18; scenario 3.7k); terms of a deal whose abandonment authority is a threshold of the other parties are invalid (B19; scenario 1, steps 9 and 9c). The collective client now declares the holder of its everyday key absent, the next member change being the recovery rotation. Writing them in exposed no new flaw; four readings taken writing them are listed at the end of Law draft 9 for Nobody, allegedly, to confirm (the place of the successor's plan, its later automatic passing under Q14, the third element's strictness, and the threshold form invalid in a deal whatever its number). The ordering simulation, which models none of the three, gives no wrong answer over 20,000 worlds.

*F109 decided by Nobody, allegedly, 1 October 2026.*

## F110. A like must never become an acknowledgement (found while discussing reactions, decided in principle by Nobody, allegedly)

**Finding.** Every act can carry acknowledgements (`acks`, Envelope field 7), and an acknowledgement carries weight in three layers: it keeps an act visible as a dispute after a rotation (Identity), turns a regretted sale into a visible dispute (Finance), proves a negotiation thread complete, keeps a deal binding after a grant is sealed and places members' signatures before a collective's line (Law, F109). A reaction ("like") that names its target as an acknowledgement would therefore act as testimony: a like aimed at a thief's act would rescue it as disputed. The core defines an acknowledgement as "I received this", but nothing stops the misuse.

**Decision (in principle).** The separation is a core guarantee, not a client or cMIP rule: no module may give a reaction, or any act like it, an acknowledgement's weight. Clients additionally never sign an acknowledgement as a side effect of another gesture, and say plainly what one means.

**Open, for Nobody, allegedly.** The first wording, "only an act whose purpose is receipt may carry acknowledgements", conflicts with the core: Law's negotiation messages, a collective's acts and a buyer's acts carry acknowledgements inside acts whose purpose is something else. The guarantee must be drawn by layer or by type instead; its exact line is to be decided before the next core version.

**Options (2 October 2026):** (1) by layer: acknowledgements count only on acts in the Identity, Finance and Law layers, cMIP acts placed there by F106 included; (2) by type: only act types the Identity, Finance and Law MIPs themselves define may carry them, never a cMIP's or Module's act. The project lead leans to (2), the simplest check; its cost is that a cMIP needing to acknowledge signs a core act alongside its own.

**Deferred (Nobody, allegedly, 2 October 2026):** "Reserve it for after we work on Lightning rail." The Lightning integration (roadmap step 12) will show whether a rail cMIP needs to acknowledge.

**Decided (Nobody, allegedly, 2 October 2026, after step 12):** "It should be there only where truly needed." Step 12 needed no acknowledgement anywhere in payments: receipts and claims stand on the payment commitment and the rail proof. Every use in the core was listed: acknowledgements are truly needed to prove a negotiation complete (Law), to protect whoever relied on an act after its signer's rotation (Identity's rule, reached through Finance and Law acts), and for a collective to place its members' signatures (Law, F109); elsewhere they are one route among several (acknowledged, paid on or imported), and once a visual flag only (F95, an acknowledged voided home receipt).
- **The line: by type.** Only act types defined by the Identity, Finance and Law MIPs may carry acknowledgements (Envelope field 7). Text and Envelope acts, and every cMIP or Module act, may not; an act that does is invalid. Identity is kept ("can we keep it there or does it create a risk?"): its acts are structural and rare, no client makes a like of one, and homes and auditors, who would acknowledge a home receipt, already sign Identity acts.
- **Disputes on Text and Envelope acts remain:** the rule limits which acts carry an acknowledgement, not which acts can be acknowledged. A post or publication still becomes disputed, not void, after its signer's rotation when an Identity, Finance or Law act acknowledges it (a buyer's claim, a signature) or a keeper recorded it.
- **What was lost, replaced where needed: a witness act.** A new Identity act type whose only content is "I received this act and rely on it", carrying its acknowledgements. It brings back deliberate reliance on a post or message nobody paid for or signed around (a public promise, a threat kept as evidence, a statement a journalist relies on), and gives the F95 flag a natural carrier. *Client conformance:* a witness act is never a side effect of another gesture; before signing, the client says what it does ("this keeps the act visible as disputed even if its author later disowns it").
- **Risk, unchanged:** a thief's accomplice can witness the thief's own acts, as it could acknowledge them before; that makes a visible dispute, never a valid act. What disappears is the accidental case: likes or replies keeping a thief's words alive.

*Decided "for now" (Nobody, allegedly, 2 October 2026: "for now it seems to work").*

**Written in (core pass, 3 October 2026, not yet approved):** Envelope draft 7 (rules 4a, 7b), Identity draft 11 (type 15, rules 18b, 18c), core v21, freeze suite v21 (steps 2.5c, 5.5b); the core library, the genesis client (a `witness` command; acknowledgements refused on other types) and the desk (a witness act signed only after its explanation). Writing it in exposed flaw V1: Law rule 56's negotiation messages are text acts, which may no longer carry acknowledgements (`docs/core-pass-v21.md`).

**Changes, to be made:** Envelope's next draft (field 7: which act types may carry it; validity); Identity's next draft (the witness act type; client conformance); core document (acknowledgements, glossary: witness act); freeze suite (a Text act carrying `acks` is invalid; a like-style reaction under a cMIP carrying `acks` is invalid; a witness act keeps a disowned post visible as disputed; a buyer's claim does the same for a publication). The desk and the genesis client acknowledge only through these types.

## F111. An owner learns of payments the vault leaves undeliverable (found while confirming Finance rule 14a, decided by Nobody, allegedly)

**Pattern:** 4: a payment that fails leaves no act behind, so nothing can make its absence a validity rule.

**Found:** confirming rule 14a (fail closed) on 2 October 2026. Nobody, allegedly: missing payments because a currency is not set up is fine as long as the debt can be honored later, "however, there needs to be a way of being informed of such payments". As drafted, a payer's wallet refuses a payment in a unit the vault does not cover, and the owner may never hear of it.

**Decided (Nobody, allegedly, 2 October 2026):** client conformance in Finance's next draft, no new act type and no new validity rule:
1. **Before signing.** The owner's client SHOULD warn before the owner publishes a standing offer, or signs terms, priced in a unit the owner's declared vault does not cover: nobody could pay it.
2. **Debts.** The owner's client SHOULD show an obligation owed to the owner in a unit the vault does not cover as "owed in a unit your vault cannot receive", with the way to add it (a rotation).
3. **Spontaneous payers.** A payer's wallet that refuses a payment under rule 14a SHOULD send the payee an ordinary message to its inbox route (F70), saying what it tried to pay, in which unit, and why it could not.

**Why client conformance:** whether a notice arrived can never be checked, so it cannot be a validity rule; the inbox already carries it.

**Core changes, to be made:** Finance MIP's next draft (client conformance under rule 14a; reasoning). No change to the core document or the freeze test suite beyond a line in scenario 5's flow-off step (the payer's wallet notifies the payee).

*F111 decided by Nobody, allegedly, 2 October 2026.*

**Written in:** Finance draft 6, rule 14b (roadmap step 12); core v21 (Finance) and freeze suite v21 (step 5.2), core pass, 3 October 2026, not yet approved.

## F112. A rail is a Module under the payment cMIP; parties are not specifications (found while reading Finance, decided by Nobody, allegedly)

**Pattern:** 4, in part: one word meaning two things across the MIPs, and a task text that mixes specifications with the parties who act under them.

**Found (Nobody, allegedly, reading Finance draft 5, 2 October 2026):** "something feels off" in Finance's Tasks. Walked through together:
- *A text cannot sign.* "A cMIP … produces a settlement receipt", while Finance defines the receipt as signed by its receiver; the payer's side can produce only the payer's claim.
- *Parties are not specifications.* A conversion service, which receives and forwards, is an identity: it signs a receipt as receiver and pays onward at the rate of its own offer. A custodial flow service is an identity the owner points the flow at, which may run a Module; it is not a Module.
- *What a rail is.* Finance calls a rail a module throughout (receipt field 0, vault entries, "every rail module emits the same receipt"); its Tasks call payment "per rail" a cMIP; Law and the freeze suite adopt "a payment cMIP"; Production rule 8 has "several payment modules for different rails, each implementing a cMIP".

**Decided (Nobody, allegedly, 2 October 2026):** "It cannot be a cMIP as only one cMIP per task; rails need to be modules." An agreement names at most one cMIP per task (Law rule 2, terms field 2), so a rail as a cMIP would confine every agreement to one rail. The payment task is filled by one payment cMIP; each rail is a Module under it, with its own verification rule for its proof.

**To write (Finance's next draft):** the Payment task rewritten: the payment cMIP defines how rail Modules plug in, how the receiver's receipt and the payer's claim carry a rail's proof, and how the proof is checked; receipts are signed by receivers, claims by payers. Conversion and custodial flow services described as identities (parties), not cMIPs or Modules. "Rail module" kept, and made consistent across Finance, the core document (glossary and the cMIP table), Production rule 8 and the freeze suite.

**Open, for step 12:** how an agreement, or the payment cMIP it adopts, says which rail Modules count for it, so that a collective's lanes (F106, Q16) and two clients agree on a receipt naming a Module.

**Roadmap:** step 12 builds the Lightning rail Module, and the payment cMIP it plugs into if none exists yet.

*F112 decided by Nobody, allegedly, 2 October 2026.*

**Written in:** Finance draft 6 and the payment cMIP (roadmap step 12); Production draft 6 (rule 8, task table rows 6 and 7, the verification rule), core v21 and freeze suite v21, core pass, 3 October 2026, not yet approved.

## F113. An anonymous payer's refund goes to a key the payer put in the commitment (found while building roadmap step 12, flaw L1, decided by Nobody, allegedly)

**Pattern:** 1: the record that decides who is refunded could be produced by others than the party it protects.

**Found while building:** the Lightning rail (roadmap step 12, `docs/lightning-rail-step-12.md`, flaw L1). Finance rule 10a (F80) owes a refund on an anonymous payment "to whoever presents the rail proof", because "only the payer holds it". On Lightning the proof includes the preimage, which the payee and every node on the route learn; any of them could claim the refund. Named payers are unaffected: the payment commitment names them.

**Decided (Nobody, allegedly, 2 October 2026):** option 1, "if doable". An anonymous payer puts a bare key of its own (Finance rule 18's form, used once) into the payment commitment; a refund owed on that payment goes to whoever signs with that key. *Doable:* the payer's wallet supplies the key when asking for the invoice, and recomputes the commitment from the signed invoice before paying, so the payee's side cannot swap it.

**Set aside:** keeping rule 10a and stating the cost; a committed secret's hash; leaving it to each rail Module.

**Changes, to be made:** Finance draft 6 (rule 10a; the commitment's payer field accepts a bare key); the payment cMIP; freeze suite scenario 2 step 6 (the anonymous refund is claimed by a signature with the committed key, and a routing node holding the preimage cannot claim it).

*F113 decided by Nobody, allegedly, 2 October 2026.*

**Written in (core pass, 3 October 2026, not yet approved):** Finance draft 6 (rules 1 and 10a, receipt field 2, claim field 8), payment cMIP draft 2, Lightning rail Module draft 2, core v21, freeze suite v21 (steps 2.6, 2.6b, 5.2); built and tested offline and on regtest. *Reading taken:* the bare key is a signing key in Identity's form, not rule 18's delivery key (an encryption key, which cannot sign). Law draft 9 rule 32 still says "whoever presents the rail proof": Law needs a draft 10. *Law draft 10 (3 October 2026, not yet approved):* rule 32 sends the refund to whoever signs with the committed key, never to whoever presents the rail proof; built as `finance::refund_owed_to` and `claims_refund`.

## F114. Several vault entries for one unit: the smallest limit applies (found while building roadmap step 12, flaw L2, decided by Nobody, allegedly)

**Pattern:** 4: a rule naming "that entry's limit" where several entries can apply.

**Found while building:** the Lightning rail (roadmap step 12, flaw L2). A vault may list one unit on several rails (F79), each entry with its own limit; rule 14a sends a payment above "that entry's limit" to the vault, which names no entry when there are several.

**Decided (Nobody, allegedly, 2 October 2026):** option 1, "the safest". Where a vault has several entries for a unit, the smallest of their limits applies to every payment in that unit: no larger single payment counts as paid to the flow. A limit of zero on any entry turns the flow off for that unit.

**Set aside:** the largest limit; one limit per unit, a vault with two being malformed; a limit per rail, which lets the payer's or a thief's choice of rail pick the laxer limit.

**Why:** fail closed, as rule 14a; no existing vault becomes invalid.

**Changes, to be made:** Finance draft 6 (rule 14a); the code's refusal of payments between the smallest and largest limits as unsettled is replaced by the rule.

*F114 decided by Nobody, allegedly, 2 October 2026.*

**Written in (core pass, 3 October 2026, not yet approved):** Finance draft 6 (rule 14a), core v21, freeze suite v21 (step 5.2); the code's refusal between the limits is replaced by the rule.

## F115. The payee decides which rails it accepts (found while building roadmap step 12, question c and flaw L4, decided by Nobody, allegedly)

**Pattern:** 4: two clients could disagree on whether a receipt on a given rail counts, and a collective's lanes (F106, Q16) had no reading for receipts once rails became Modules (F112).

**Found while building:** the Lightning rail (roadmap step 12, question c). A receipt is a Finance act naming its rail Module in field 0; an agreement names one payment cMIP. Nothing said which rail Modules count. Freeze suite step 3.7g and its core test treat a receipt as the payment cMIP's own act, which F112 ends (L4).

**Walked through (2 October 2026):** a band's offer names the payment cMIP; a fan pays over a Lightning Module. Two things surfaced: not every payment has a drafter (a tip follows only the payee's pointer); and rail Modules change (a fix, a new Lightning feature) far more often than agreements, so terms pinning a Module's hash would need a clone, every party signing in a deal (F107), for each upgrade.

**Decided (Nobody, allegedly, 2 October 2026):** "If I wish to pay in bitcoin in a shop that does not accept it, I cannot." Acts always name the cMIPs and Modules they rely on. The receiver decides how it is paid: an agreement names its payment cMIP; the payee's pointer or vault names the rail Modules, implementing that cMIP, it accepts. A receipt counts only if its rail Module is one the payee's pointer or vault in force for that payment named. A payer whose rail the payee does not accept cannot pay on it, except through a conversion service paying the payee on a rail it accepts.

**Consequences:** a new rail Module needs a new pointer (signing key) or vault (safety key), never a clone of an agreement. In a collective, the pointer is a Finance act, so the holders of the Finance lane choose the rails. Q16 reads mechanically: a receipt naming a Module the payee never published, or one not implementing the adopted payment cMIP, counts for nothing.

**Changes, to be made:** Finance draft 6 (payee pointers and vault entries name rail Modules; receipt validity); the payment cMIP; freeze suite step 3.7g and its core test (a receipt on a rail the collective's pointer names counts with the treasurer; one on a rail it never named counts for nothing).

**And (Nobody, allegedly, 2 October 2026):** cross-rail services charging a fee are expected to appear; a client can build them in, giving its users free choice of currency and rail while delivering to the payee what the payee can receive. *Consistent with rule 14a and F111, which treated an unaccepted unit the same way: the payer cannot pay there directly, and the debt stays open (rule 16).*

*F115 decided by Nobody, allegedly, 2 October 2026.*

**Written in (core pass, 3 October 2026, not yet approved):** Finance draft 6 (rule 12a), payment cMIP draft 2, core v21, freeze suite v21 (step 3.7g rewritten); the core library's Law view and its test. *Reading taken:* the Law view checks that a counting pointer or the vault in force names the rail Module; which exact pointer the payment went to is in the rail's proof, which the payment cMIP checks. Law draft 9's scenario lines still speak of a payment cMIP's receipts: Law needs a draft 10.

## F116. Evidence that a Module was used comes from a party, never from the Module (found while building roadmap step 12, flaw L3, decided by Nobody, allegedly)

**Pattern:** 1, after F112: a specification cannot sign.

**Found while building:** the Lightning rail (roadmap step 12, flaw L3). Production rule 17 has a Module's use record "signed by the module", the evidence a Module's author needs to earn a share. After F112 a Module is a text or code, and signs nothing.

**Decided (Nobody, allegedly, 2 October 2026):** both, by case. For a rail Module, the receipt (and the payer's claim) naming it in field 0 is the evidence of use; nothing new is needed. For a service someone runs, the evidence is a record signed by the identity running the service. Either way, a party signs, never a specification.

**Changes, to be made:** Production's next draft (rule 17 and its freeze scenario line); the role-share evidence rule (Law rule 19, F75) reads alike.

*F116 decided by Nobody, allegedly, 2 October 2026.*

**Written in (core pass, 3 October 2026, not yet approved):** Production draft 6 (rule 17), Finance draft 6 (rule 10b), core v21, freeze suite v21. Law rule 19 does not read alike ("a module's signed use record", also rule 22): Law needs a draft 10, and rule 22's "someone other than the split service and the payee" meets F116 as flaw V2 (`docs/core-pass-v21.md`). *Law draft 10 (3 October 2026, not yet approved):* rules 19, 22 and 28 read alike (F119 for rule 22).

## F117. The first Lightning rail Module names the payee's node; its costs are stated, and it ships as experimental (roadmap step 12, questions a and b, decided by Nobody, allegedly)

**Found while building:** the Lightning rail (roadmap step 12, question a). To check later that a payment went to the payee, a verifier needs the key that signed the invoice; on Lightning there is no address in the on-chain sense. The Module as built names the payee's node key in its pointer or vault (a), and a Lightning vault entry names the vault's own node, which issues each invoice (b).

**Costs, stated (2 October 2026):** a public node exposes its channels and the on-chain coins behind them, possibly its network address, links identities that share it, and makes a visible target; a Lightning vault stops a thief with the everyday key, not one who takes the node, which must stay online. Mitigations are the payee's choice: an unannounced node, one node per identity, a hosted node, Tor. A Lightning Address (name@domain) was set aside: its invoices cannot be tied to the payee by a later verifier. A BOLT 12 offer would give a reusable, checkable address that hides the node, but lnd does not support it yet.

**Decided (Nobody, allegedly, 2 October 2026):** "I'm fine with presenting experimental stuff with plenty of disclaimers. The purpose is to throw stuff at the MIPs." a and b confirmed as built; the Module is presented as experimental, its costs stated plainly in its text and shown by clients. *Suggested (project lead):* a BOLT 12 rail Module later, as a second Module under the same payment cMIP, which also exercises F115 (a payee choosing between rails).

*F117 decided by Nobody, allegedly, 2 October 2026.*

**Written in (core pass, 3 October 2026):** Lightning rail Module draft 2 ("Costs, stated", experimental), Finance draft 6 (reasoning), the payment cMIP draft 2 (experimental).

## F118. A negotiation message is a Law act (found in the core pass, flaw V1, decided by Nobody, allegedly)

**Pattern:** a decision checked against too little: F110 was decided on the project lead's statement that negotiation messages were Law acts; they were Text acts.

**Found while writing:** the core pass (core v21, branch `claude/core-pass-v21`, flaw V1). Law rule 56 proves a negotiation record complete because each message acknowledges the last one received; a negotiation message was a Text act, and F110 forbids Text acts to carry acknowledgements. As written, no negotiation could be proven complete.

**Decided (Nobody, allegedly, 3 October 2026):** option 1, "it stays on the same layer". A negotiation message is a Law act type carrying text, and may carry acknowledgements like every Law act. No reaction or reply can be one.

**Set aside:** messages naming earlier ones as references (a disowned message would become void, not disputed); an exception for Text acts inside a negotiation (a hole in F110).

**Changes, to be made:** Law draft 10 (the negotiation message act type; rule 56); core and freeze suite where they describe negotiation records.

*F118 decided by Nobody, allegedly, 3 October 2026.*

**Written in (Law draft 10, 3 October 2026, not yet approved):** Law draft 10 (the negotiation message, type 18; rule 56; the readings on the thread's form listed there), core v21, Envelope draft 7 (V1 answered), freeze suite v21 (step 5.3, a component line); built in the core library (`LawView::negotiation`) and tested.

## F119. A split service's receipt is evidence that a rail Module was used (found in the core pass, flaw V2, decided by Nobody, allegedly)

**Pattern:** 1, checked: the party that signs is the split service, but what it can name is fixed by the payee.

**Found while writing:** the core pass (flaw V2). F116 makes the receipt naming a rail Module the evidence of its use; in a split, that receipt is signed by the split service, and Law rule 22 (F75) refuses the service's own signature as evidence for a role share.

**Decided (Nobody, allegedly, 3 October 2026):** option (a). The receipt counts as evidence of a rail Module's use even when a split service signs it, because under F115 a receipt counts only on a rail Module the payee's own pointer or vault names: the service cannot invent one. *Cost, stated:* where the payee's pointer names two Modules for one rail, whoever issues the invoice (here the split service) chooses which earns; the pointer shows it publicly, and the payee's agreement with the service can constrain it.

**Set aside:** keeping rule 22 strict, so only the payer's claim counts (claims are private by default, so most uses would go unrecorded); one Module per rail as a validity rule, suggested by the project lead and withdrawn on Nobody, allegedly's question ("how can it be enforced?"): "same rail" is a label each Module declares, which no verifier can check (as F106), and one Module per unit would forbid accepting a unit on two rails.

**Changes, to be made:** Law draft 10 (rules 19 and 22: the exception for a receipt naming a rail Module the payee published).

*F119 decided by Nobody, allegedly, 3 October 2026.*

**Written in (Law draft 10, 3 October 2026, not yet approved):** Law draft 10 (rules 19 and 22, the role share's definition, the split's evidence field, with the cost stated), core v21, freeze suite v21 (step 2.4e); built in the core library (`LawView::role_evidence`) and tested. *Reading taken:* the payee whose pointer or vault must name the Module is the identity the payment was made to, whose pointer leads to the split service, never the service.

**F110, the witness act's visibility (core pass, question V3; decided by Nobody, allegedly, 3 October 2026):** a witness act is public, like every Identity act. *Cost, stated:* anyone can see that its signer relies on a given act of another identity, a relationship, never the content of a private act. A private witness act was set aside: it would protect nothing for anyone not holding it, and would need rules of its own.

## F120. A version changing both a judge and the constitution needs the constitutional rule alone (found writing Law draft 10, question J1, decided by Nobody, allegedly)

**Pattern:** 4: two rules of Law disagreed on one case.

**Found while writing:** Law draft 10 (`docs/law-draft-10.md`, J1), restating the seven rules the core pass could not state plainly. Rule 36a says the judicial tasks (condition evaluation, time reference, anchoring) change only under the clone rule; rule 44c.1 says a version touching the constitution needs the constitutional change rule alone, "which may change every tier". When one version does both, they disagree, but only where the clone rule is stricter than the constitutional rule.

**Decided (Nobody, allegedly, 3 October 2026):** reading (a), the constitutional change rule alone: "rare case, but if core allows it" it must have one answer. Rule 36a's "only under the clone rule" reads as "never by the Law lane nor any other area". Under rule 46a, a member who did not sign keeps the judge they signed for, whatever the version.

**Set aside:** both rules met (a check the constitutional rule could remove in the same version); forbidding both changes in one version (only an extra step).

**Changes, to be made:** Law draft 10 (rules 36a and 44c.1 read alike); core v21's "Areas and lanes" (J1 no longer open).

*F120 decided by Nobody, allegedly, 3 October 2026.*

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved):** rules 36a and 44c.1, core v21 ("Three tiers", "Areas and lanes"), freeze suite v21 (step 3.7s); built in the core library and tested. *Its reason, rule 46a's per-member protection, is removed by F121: where the constitutional change rule is below every party, the two disagree (flaw K1, `docs/law-draft-10.md`, section 5), and such a version is refused as unsettled until it is decided.*

## F121. One judicial tier for everyone, a chain of fallbacks, and the fork of a collective (found writing Law draft 10, decided in part by Nobody, allegedly)

**Pattern:** 3, both halves: F71's per-member protected clauses protect each member from rules they never signed, and leave two members with no judge they both signed.

**Found while writing:** Law draft 10 (noticed outside the session's task). Under rule 46a (F71) a member who does not sign a change of a protected clause keeps the version they signed. Two members can then hold different judges, and where one joined after a change the other never signed, no judge both signed. Nothing said who decides a dispute between them.

**Walked through (3 October 2026):** Nobody, allegedly: "It's the joint signature that matters", and "how could there be a valid newer version Anna did not sign?" Requiring every member's signature for the judicial tier costs three things (a holdout can block, a dead judge can trap, leverage); each was answered: "leverage is part of life"; a dead judge is answered by a chain of judgment; and the holdout by a standoff: "if a group within the collective wants change A but another group refuses it, it creates a standoff, which is good. Communication becomes the only channel to solve it, with a collective fork as an option to settle it."

**Decided (Nobody, allegedly, 3 October 2026), in principle:**
1. **The judicial tier changes only with every member's signature,** one version for everyone, replacing F71's per-member versions. *(The project lead's reading of the walk-through; confirmed by Nobody, allegedly, 3 October 2026.)*
2. **A chain of judgment:** each judge, keeper or other judicial service may name, at founding, the one that takes over when it answers "unknown" or cannot act; everyone signs the chain, so a failing judge is replaced without new signatures. "It's a chain of judgment."
3. **The fork of a collective** is its own grammar ("a fork of a collective makes sense, that's really what a collective splitting is"): the side that does not want the change keeps the collective as it is, minus the departing members; the side that wants it founds a new collective, naming the original as its parent. Where both sides want changes, the original closes with a final act declaring the fork, and both found new collectives naming it.
4. **Cost, stated and accepted ("I think it is"):** the status-quo side can be one member, who then keeps the collective's identity, history and pointers while the others leave, each keeping their stake (Q6). A collective that will not accept this writes a removal clause at founding.

**Still to settle, one at a time:** works and their claims after a fork; the collective's debts and obligations; grants; keys and the departing members' shares; the act that declares a fork and what the new collectives' first acts name; whether the existing "fork rule" (rule 47, forks of records) needs a new name to avoid confusion.

**A work after a fork (Nobody, allegedly, 3 October 2026):** leaving costs the vote and the right to act, never a stake unless it is sold. A work is just a work: whoever made it (a person, a collective, a collective of collectives, a deal), the right to earn from it belongs to all the parties its claim lists as owners, not to its publisher. Anything made before the fork belongs to both groups. *The project lead's reading, confirmed by Nobody, allegedly, 3 October 2026:* either side may sell pre-fork works, each sale paying the owners as the claim lists them; the fork act names both successors as descending from the original agreement, so neither side's sales show as outside the claiming agreement.

**Can the side keeping the original starve past members? (asked by Nobody, allegedly, 3 October 2026; the project lead's analysis):** blocked: shrinking a stake (rule 46); skipping a stake in a payout (visible as a shortfall); stopping sales, once pre-fork works can be sold by both sides. Open:
- **F121 must not strip departed owners' protection.** Under F71 a departed member who kept a stake kept the protected clauses as they signed them; if F121's unanimity counts only current members, the staying side could change the split service or the fork rule without the owners who left. The protected clauses that touch money must still need every stake holder's signature, member or not.
- **The pointer can bypass the split.** Law rule 18 says the owners' payee pointer points to the split service "so money actually reaches it", but nothing makes that a check: a collective's Finance lane could point the pointer at another receiver, and buyers' claims are private by default, so departed owners might never see the sales. A rule, or a visibility duty, is needed.
- **Re-encoding** a work makes a new fingerprint, a "new" work outside the claim (F72's known limit): visible only where someone links the two.

**Revised (Nobody, allegedly, 3 October 2026): no side keeps the original.** "Then maybe it is best no group keeps the original hash." A fork closes the original collective with a final act declaring it; every side founds a new collective naming the original as its parent, the status-quo side's being a copy of the original agreement minus the departing members. This replaces point 3's "the status-quo side keeps the collective" and removes point 4's cost (a lone holdout keeping the identity). Taken "for now".

**Still needed, fork or not (accepted the same day):** fix 1, the protected clauses that touch money need every stake holder's signature, member or not, so ordinary leaving never strips a departed owner's protection; fix 2, the payee pointer cannot bypass the split service the agreement granted (a rule, or a duty making sales visible to every owner). Each to be settled one at a time.

**Fix 2 decided (Nobody, allegedly, 3 October 2026): a Law check on the pointer.** "Law check makes sense, splits are law." A payee pointer of an identity whose agreement names a split service counts, for Law, only if it names that service (Law rule 18 made a rule, not a description); Law clients, and any wallet reading Law, check it before paying, and show a pointer that bypasses the split as such. *Cost, stated:* a wallet reading only Finance cannot check it (as F68), so payers who want the protection use wallets that read Law. Set aside: making every pointer change need all stake holders (every new rail would need everyone); visibility alone, the buyer's claim sent to every owner (reveals buyers).

**Fix 1 decided (Nobody, allegedly, 3 October 2026): a departed member is a passive holder.** Walked through a scenario (four members; one leaves keeping 25%; the others change the split service and its fee). Per-owner versions ("everything that touches him", undefined, and a split service keeping two sets of terms for one payment) and a three-part shape were set aside for the status quo of legal frameworks for collective efforts: "A person who keeps stake in a collective accepts that they have zero control over decisions. If I think the collective won't survive, the incentive to sell the stake is there. It's a stake in a collective as a whole (not only on the work done while he was a member); it simply defines his share of income." A rail swap is the collective's decision: "to get paid, past members have to accept the decision and set up accordingly if they wish to get paid." So:
- **The departed members entry** of a collective records who left and their stake, nothing else.
- **No control, no veto:** the collective's current rules and judges apply to departed holders.
- **The stake never shrinks** without its holder's signature (rule 46); it is a share of all the collective's income.
- **Equal treatment** (suggested by the project lead, from company law; accepted): every term applies equally to every stake, member or departed. Members cannot treat departed stakes worse than their own; a fee raised for the departed is raised for the members, and a fee paid to a service the members own is public. "Your scenario is one of those where the change and creative accounting are made legible and poetically public."
- **Unpaid shares stay open debts** (rule 16) until the holder can receive, for instance after setting up on a new rail.
This also settles fix 1 without making the judicial tier need departed holders' signatures: F121's unanimity counts members only.

**Changes, to be made:** Law (rule 46a; the chain of judgment; a fork grammar); core; freeze suite.

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved; `docs/law-draft-10.md`, section 5):** the judicial tier changed only by every member, its power `[4]` (rules 6, 36a, 36b, 44c, 44d, 46a); the chain of judgment, terms field 21 (rule 34a); departed holders, terms field 22 (rule 46b); the payee pointer check (rule 18), not built, since a pointer names rails, never an identity (flaw P1); the fork of a collective in principle (rules 15b, 47a), its grammar left unwritten; core v21, freeze suite v21 (steps 3.7f, 3.7i, 3.7n, 3.7p to 3.7s, 3.8b, 3.9), one page v6; a to c built in the core library and the repo and collective clients, and tested. Open for Nobody, allegedly: flaws K1 and P1; the fork's debts, grants, keys, act, name and money after it; when an identity judge "cannot act"; members' own stakes in the collective; how a fee to the members' own service is public; eight readings.

## F122. A version changing a judge and the constitution needs both rules (found writing F121 into Law draft 10, flaw K1, decided by Nobody, allegedly)

**Pattern:** a later decision changing an earlier one's ground: F120 rested on the constitutional rule being able to remove any stricter check; F121 fixed "every member" for the judicial tier in Law itself.

**Found while writing:** F120 and F121 into Law draft 10 (`docs/law-draft-10.md`, section 5, K1). Under F120 a version changing both a judge and the constitution needs the constitutional rule alone; under F121 a judge changes only with every member. Together, two of three members could change a judge by adding any change of the constitution to the same version.

**Decided (Nobody, allegedly, 3 October 2026):** option (b). Such a version needs the constitutional rule and every member's signature for the judge; it stays a draft until both are met. This revises F120.

**Set aside:** the constitutional rule alone (the loophole); forbidding both changes in one version (an extra step, same result).

**Changes, to be made:** Law draft 10 (rules 36a, 44c.1 and mark [4]); the code's "unsettled" refusal replaced by the rule.

*F122 decided by Nobody, allegedly, 3 October 2026.*

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved; `docs/law-draft-10.md`, section 6):** rules 36a, 44c.1, 44e and 46a (the mark names `[0]` and `[4]`), core v21, freeze suite v21 (step 3.7s); built in the core library (the "unsettled" refusal replaced) and the collective client, and tested. *Writing it in exposed flaw M1: a removal under a constitutional change rule below every party that drops the removed member's own succession plan is a judicial change too, which F122 counts the removed member in.*

## F123. The split service vouches for the addresses in the owners' pointer (found writing F121 into Law draft 10, flaw P1, decided by Nobody, allegedly)

**Pattern:** 4: a rule resting on a fact nobody can check. A payee pointer lists payment addresses and node keys, never an identity, so "the pointer names the split service" (F121, fix 2) cannot be verified.

**Decided (Nobody, allegedly, 3 October 2026):** option (a), "make it legible". The split service publishes its own payee pointer, signed by itself. The owners' payee pointer counts, for Law, only if every address in it also appears in the split service's own signed pointer in force. A bypass needs the service to sign, publicly, for an address that is not its own: collusion in plain view. No format change.

**Set aside:** a "receiver" field (anyone can write any name next to their own address); a pointer that delegates to another identity's pointer (cleanest, but a change to Finance and every wallet).

**Changes, to be made:** Law draft 10 (rule 18 as a check); the pointer check built in the core library; freeze suite scenario 3.7r run.

*F123 decided by Nobody, allegedly, 3 October 2026.*

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved; `docs/law-draft-10.md`, section 6):** rule 18 (one service's own pointer in force carries every address of the owners' pointer: the service named, or one its chain names, reading 4), core v21, freeze suite v21 (step 3.7r, now run); built in the core library (`LawView::pointer_check`) and the collective client, and tested. *Writing it in exposed flaw P2: the owners' vault is not reached by the check.*

**F121, the fork's questions (`docs/law-draft-10.md`, section 5; answered by Nobody, allegedly, 3 October 2026, one at a time):**
- *Q1, debts at a fork:* (c) the fork act assigns each debt to a side, which signs for it; any debt it does not name is owed by both sides. "It forces communication to reach agreement, which is a positive outcome." No debt can vanish.
- *Q2, grants at a fork:* (a) every grant of the original ends at closing, as when an area loses its last holder; each new collective reinstates the grants it wants; a grantee's deal the collective acknowledged, paid on or imported binds (a debt under Q1); any other waits until a side takes it up or seals it. "A fork forces a whole lot of decisions to be taken again."
- *Q2, grants at a fork:* (a) every grant ends at closing, as when an area loses its last holder; each new collective reinstates the grants it wants; a grantee's deal the collective acknowledged, paid on or imported binds (a debt under Q1); any other waits until a side takes it up or seals it. "A fork forces a whole lot of decisions to be taken again."
- *Q3, keys at closing:* (a) "for now", closing by a rotation of the old collective declaring the fork. "But there is a problem hiding around here": the key grammar would decide who can fork (a key holder refusing to rotate blocks it, and the refusing side keeps the identity). *Proposed by the project lead, awaiting confirmation:* the fork is a Law act signed by the forking members with their own identities, not the collective's key; once a valid fork act exists, Law treats the old collective as closed and anything its keys sign afterwards counts for nothing in Law; the rotation becomes optional cleanup. *Confirmed by Nobody, allegedly, 3 October 2026, "only if closed":* the fork act closes the old collective in Law only where the fork closes it. "A collective could be 'actively abandoned' while staying alive. It becomes a vehicle to manage past works only, until it makes sense doing so."
- *The root's assets after a fork (raised by Nobody, allegedly):* a closed root could never change its pointer or rails for works sold for years. **Decided:** "works need to be cloned and ownership of the root collective split amongst the new groups." The work's fingerprint never changes; the fork act transfers the root's ownership of each work to the successors in shares it names (as a stake transfer), so each side owns its share outright and runs it (pointer, rails, split service); the root keeps nothing to manage; its old offers stop when their rails die. This replaces "either side may sell, paying every owner".
- *Departed members at a fork:* "departed members get a seat in both groups for stakes." **Decided:** a departed member keeps the same percentage in every successor, and the members divide the rest by the ownership split, so nobody gains or loses (example: four at 25%, one departed, A taking two thirds and B one third: the departed holds 25% of each, the others 37.5% in A or 75% in B). The stake follows into the successors' future works, as a stake in the collective as a whole. "If too many departed members still own shares, the incentive is to create an entirely new collective instead of forking."
- *An actively abandoned collective:* no new grammar and no declaration: "plain collective enough, it's only how it is used by stakeholders that changes." It keeps its rules, changes rails, renews offers and pays every holder until winding it down makes sense.

**F121, four shapes of ending (Nobody, allegedly, 3 October 2026):**
- **A, one group splits off with the powers to do so:** a membership change; the old collective re-signs (rotation and clone) and keeps its identity; the leaving group founds its own collective; its members become departed holders of the old one (stakes kept, equal treatment, the pointer check, no veto). Members without the powers can still leave one by one and found something new together.
- **B, both groups want changes and disagree:** the fork proper. "Both forks need to sign." The original closes; ownership of its works is transferred to the successors; departed members keep their percentage in each. *"A fork closes the original" applies to B only.*
- **C, everyone agrees the collective has ended but works still earn:** actively abandoned, still existing (plain collective).
- **D, the collective dies:** its works are sold (stake transfers) or made public domain, then it closes. Public domain is "a work that belongs to no one but traces its history": its claim ends, nobody earns from it as owner, and its history (who made it, who owned it) stays visible. **Decided (Nobody, allegedly, 3 October 2026):** a release act ends the claim, names the work's history (creators and past owners, which stay on record), and publishes the content key; anyone may then carry or sell copies, and no sale is outside a claim; a later claim on a released work is shown as made after the release. It needs every stake holder's signature, departed included (rule 46): "majority stake is not enough", since a majority releasing would give away the minority's value. Founding terms may set a different release rule, since everyone signs them, and a later buyer of a stake buys it under those terms. A majority that wants a release buys out the minority first, or leaves the collective actively abandoned.
- *Q5, a name:* (a) "fork of a collective" for the split; Law rule 47's "fork rule" (forks of records) is renamed the "concurrency rule".
- *Q6, money reaching the closed original:* (a) its old split service pays the successors in the shares the fork act transferred; each pays its own members and departed holders. "What if the old split service dies?" Lightning payments to a dead node fail before money moves; on-chain addresses could still receive. **So the fork act also withdraws the original's open offers**: wallets reading Law see them withdrawn and pay A's or B's instead. *Cost, stated:* a wallet reading only Finance does not see the withdrawal and could still pay an on-chain address of a dead service.
- *Q7, when a person or service judge "cannot act":* (b) each link of the chain of judgment names a period; after it, measured by the agreement's time reference, the next may act. "With compulsory time reference": a period is compulsory for every link, and an agreement whose chain names any judge that can stay silent must name a time reference (itself a judge, with its own chain).
- *Q8, members' stakes in the collective:* a stake (terms field 7) whose object is the collective itself is a share of all the collective's income; equal treatment is checked against those shares, member or departed alike.
- *Q9, fees visible:* every split is delivered to every holder it pays, departed or not, naming each fee and who received it. The core cannot prove who owns a service; it never hides a fee.
- *The eight readings of `docs/law-draft-10.md`, section 5:* 1 to 6 and 8 confirmed (Nobody, allegedly, 3 October 2026). Reading 7 corrected: for a party whose voice was removed before a judicial change, the abandonment clause **in force** applies, not an older one, as departed holders are under the collective's current rules (fix 1).

*F121's questions all answered, 3 October 2026. To write: the fork grammar (scenario B: a fork act signed by both sides, closing the original in Law; ownership transfers; defaults; the "forked from" field; withdrawal of open offers), scenarios A, C and D, the release act, the pointer check (F123), equal treatment (Q8), fee visibility (Q9), the periods of the chain of judgment (Q7), and the rename of rule 47 to the concurrency rule.*

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved; `docs/law-draft-10.md`, section 6):** the chain's periods on a compulsory time reference (field 21, rule 34a); stakes in the collective itself (field 7 made exact) and equal treatment checked against them (rule 46b); every split delivered to every holder it pays, naming each fee and its receiver (type 8 made exact, rules 20, 27); the four shapes of ending (rule 47a), the fork act (type 19) and "forked from" (field 23), the release act (type 5 made exact) and the release rule (field 24, rule 17); reading 7 corrected; the concurrency rule (field 10); core v21, freeze suite v21 (3.7p, 3.7q, 3.7t, 3.7u, 3.9, 3.9a to 3.9c; 3.7r and 3.9 now run), one page v6; built in the core library and the collective client, and tested. Writing it in exposed flaw S1 (founding terms cannot name the collective itself, so members' stakes in it come by a first clone), and fourteen questions (N1 to N14, `docs/law-draft-10.md`, section 6), each with a lean, the code built on the leans.

## F124. Questions from writing F121 to F123 into Law draft 10 (`docs/law-draft-10.md`; answered by Nobody, allegedly, 3 October 2026, one at a time)

- **S1, a collective cannot name itself at birth:** a collective's genesis names its founding agreement, so that agreement cannot name the collective, which does not exist yet; stakes in the collective itself (F121 Q8) and its own grants could never be in founding terms. **Decided:** option (a), "let's reuse the mechanic": a null object or holder in a stake or grant means "this collective", as Identity lets a genesis name itself as its home's operator by null. Set aside: always a first clone; a separate members' shares entry.
- **M1, a member could block their own removal:** under F122, removing a member drops their succession plan, a judicial change needing every member, the removed one included. **Decided:** option (a), a clause naming only the member being removed goes with the removal, as their areas do (Q21); no other judicial clause changes in that way. *Nuance (project lead's reading, from Q6 and Q14):* only the seat part of the plan goes; the plan for the removed member's stake stays with the stake, which removal never takes.
- **P2, the vault slips past the pointer check:** payments above a limit go to the owners' vault, whose addresses nobody checks, so large payments could land with one member and never reach the split. Walked through: "is it truly two flows or one long flow with member IDs as destinations?" Both exist: a split service (two flows: payer to collective, service to members) and payer-side splitting (one flow: the payer's wallet pays each holder's own pointer by the split plan, F64), with no intermediary, nothing to bypass, each holder's own vault protecting their share, equal treatment automatic; at the cost of several payments, partial payment if one fails, owners' pointers visible to the buyer, and a wallet that reads Law. **Decided ("for now"):** both models stay, chosen per collective; for the split-service model, option (a): every entry of the owners' vault must also appear in the split service's own signed vault, as F123 does for the pointer.
- **N1, who signs a fork:** "forks is a constitutional decision": a fork follows the constitutional change rule, every member by default (a silent member is the abandonment clause's business). Where the founders set a lower rule, the fork may complete without a member; such a member is "forced to either fork or leave": they join a side by signing, or have no seat in any successor, and become a departed holder of every successor at their percentage. "Stakes are a separate line of business."
- **N2, "afterwards" for the closed original:** (a) the fork act names the original's chain act and kept tips, a line drawn by the members as a record draws a departure (F109); anything of the original not before that line counts for nothing in Law.
- **N3, default shares with no stakes written:** (a) each member counts alike: "no agreement means equal weight".
- **N4, which collective is a side's successor:** dissolved. "If they are in a position to fork, how they fork is up to them. Fork only works if the members holding constitutional powers activate it… If they wish to fork twice to split business activities, why not. But I don't see the scenario where we have competing forks." Each side founds its collective first; the fork act, signed under the constitutional rule, names the successors by their identities, so nobody claims descent and no ambiguity arises; "forked from" stays a back-link for readers, deciding nothing. A later fork of a successor is a new fork, in sequence. Two fork acts signed concurrently on the same agreement are concurrent acts on its chain, settled as any (rule 5 and the concurrency rule: otherwise the status quo stands).
- **N5, the stake entries:** (a) "they are stakeholders. So the stakes still show them, but the organizational part files the ID as departed." The stakes (field 7) decide the money for every holder; the departed members entry (field 22) records only that the identity is departed, without voice.
- **N6, the period and a late answer:** (a) the period runs from a signed request to the judge by someone with standing; "if the next judge is triggered, the previous judge is void": an answer after the period counts for nothing.
- **N7, a release where an owner is a collective:** option (b), on Nobody, allegedly's instinct ("a release is a complex decision, because it is an envelope with finance and law most of the time; it needs to meet the collective rule for those three layers"), investigated together: there are two levels of ownership. A release needs every direct owner of the work (rule 46). Where an owner is a collective, the work is the collective's asset, and its members and departed holders own shares of its income, not the work; releasing is a business decision of the collective, like setting a price to zero or ceasing to sell, which departed holders, passive, accept. So the collective signs by its own rules, meeting the lanes of every layer the release touches (Envelope, Finance, Law; Q7). Equal treatment holds (a release affects every holder alike). This refines F121's release rule ("every stake holder") to every direct owner.
- **N8, the release rule's life:** (b), against the session's lean: the release rule is set in the founding terms and may be changed later by a clone every owner signs. "Freedom of making mistakes and fixing them."
- **N9, how a dissolved collective ends:** (b), against the session's lean: "let's close… work is either sold or made public domain. Clean." A closing act, signed under the constitutional rule like the fork act, ends a collective that holds nothing (every work sold or released); after its line, the collective's keys count for nothing in Law.
- **N10, the direction of equal treatment:** dissolved on Nobody, allegedly's question ("payout is dictated by stake holding, no? The share of the departed can be adjusted, sold or transferred"). Every payout must match its stake exactly, but for rounding of one smallest unit per payout, and every fee applies alike to every stake; any deviation, either way, breaks the plan (rule 26). Equal treatment is what following the stakes with uniform fees produces, not a separate test; a member who wants to give income to another transfers part of a stake.
- **N11, a timed release:** (a), "let's use 1 and see if it holds": the release act may name a future point on the agreement's time reference; the claim ends there, checkably. The content key is delivered then by a keeper the act names. *Cost, stated:* key delivery rests on that keeper; if it vanishes, the work is legally released but its key may never come out; owners may always publish the key earlier.
- **N12, a release missing an owner:** dissolved, walked through on Nobody, allegedly's request. Every stake in a work lives in its one claiming agreement (rule 15), and transfers are recorded on that agreement's chain (rule 14), so a release signed by every holder of that agreement is complete. A separate promise of income from the work is the promisor's obligation, not a stake. A competing claim by another identity stays openly contested, shown beside the release, which cannot end it.
- **N13, who signs a debt a fork assigns:** (b), the side's successor collective, which exists before the fork act (N4) and signs for the debt in it; members are never made personal debtors of what the collective owed. **And:** "the fork cannot activate unless all debt is transferred." **Confirmed after walking it through (Nobody, allegedly: "how could they not know about the debt?", "how could they break the rule?"):** a debt is signed by its debtor (F66), so every debt of the collective is on its own chain. *Client conformance:* every private act of a collective is sealed to every member as well as its recipient, so no member can keep the collective's debts out of the others' sight. The fork act must assign every obligation of the original, each to a successor or to several jointly, or it does not take effect. Since non-delivery cannot be proven (pattern 4), a member with a non-conforming client could still hide a debt; Q1's "owed by both" covers only such a debt: when it surfaces, every successor owes it, so the hider cannot shift it, and the act shows who signed it.
  **And, mechanical (Nobody, allegedly, 3 October 2026, "worth adding"):** an obligation signed by a collective binds the collective only once its outside is public (published on relays); its inside may stay locked, its key sealed to the members. The creditor, wanting the debt to count, publishes it; every member can then see that the collective owes, and demand the key. A hidden debt does not bind, so hiding gains nothing. *Cost, stated:* anyone can see that a collective has debts, and how many, never their content.
- **N14, the old split service after a fork:** walked through. If its grant ended, it would keep receiving at the original's frozen pointer with no mandate. **Provisionally (Nobody, allegedly, 3 October 2026, "yes, but"):** its grant continues, held jointly by the successors, who together can revoke it; the fork act says so. Nobody, allegedly is looking for something more elegant: moving the flow to the successors' own split services and abandoning the old one.
  **N14 decided, replacing the provisional answer (Nobody, allegedly, 3 October 2026):** "the work is the point of payment, the work now states the two new collectives as stakeholders; why does it need the old one?" The work itself carries nothing and never changes; payment follows its current claim (owners and shares), the owners' pointers (rails) and the offer (price). The fork changes only the claim, so the routing follows to the successors' own pointers and split services. Every grant ends at the fork, the old split service's included. A stray payment to the old service (a wallet not reading Law paying a withdrawn offer) is that service's open debt to the work's current owners (rule 30).

*F124's questions all answered, 3 October 2026.*

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved; `docs/law-draft-10.md`, section 7):** null as this collective in stakes and grants (S1; terms field 7, grant field 8); the seat part of a removed member's plan going with the removal (M1; rule 44b); both split models, the vault vouched for by the service (P2; rule 18); the fork under the constitutional rule, a member on no side a departed holder of each successor, successors founded first and named by the fork act, "forked from" a back-link, concurrent forks ending nothing (N1 to N4; type 19, field 23, rule 47a); the stakes deciding money, field 22 a list (N5); the chain's period (N6, rule 34a); releases by direct owners, a collective through its lanes, the release rule changed by a clone every owner signs, a timed release, a competing claim beside a release (N7, N8, N11, N12; type 5, field 24, rule 17); the closing act (N9, type 20); every payout matching its stake (N10); debts assigned at a fork and signed for by successors, sealed to every member, binding once public (N13); every grant ending at a fork, payment following the claim, a stray payment owed to the successors (N14); core v21, freeze suite v21 (3.7q, 3.7r, 3.7s, 3.7t, 3.9, 3.9a, 3.9c rewritten; 3.7v, 3.9d to 3.9g new), one page v6; built in the core library and the collective client (the successors founded and named in the fork act end to end), and tested. Writing it in exposed flaw D1 (a debt surfacing after a fork falls under both N13 rules) and questions D2 to D6, each with a lean.

## F125. Questions from writing F124 into Law draft 10 (`docs/law-draft-10.md`, section 7; answered by Nobody, allegedly, 3 October 2026, one at a time)

- **D1, a debt that surfaces after a fork:** N13's two rules collided (an unassigned debt stops the fork; a hidden debt surfacing is owed by every successor); with no clock, a member and a friend could publish a secret debt late to undo any fork. **Decided:** option (a). A complete fork is never undone over a debt. Assigning every known debt is each member's client's duty; any debt the fork act did not assign, hidden or not, is owed by every successor jointly. The project lead's combination of N13's rules caused the collision.
- **D2, how a verifier knows a debt was published:** (a) the verifier reports finding its outside on a relay, as it reports keeper records; an act counts where it is held, and the creditor, wanting the debt to bind, spreads it.
- **D3, choosing the split model:** (a) by naming a split service or not; no new field.
- **D4, changing the release rule:** (a) every owner's signature, and the ordinary clone rule for the version itself.
- **D5, debts before closing:** (a) a collective cannot close while it owes anything; one that cannot pay stays open, abandoned, its debt visible.
- **Bankruptcy (asked by Nobody, allegedly, after D5):** walked through. A collective that cannot pay keeps its debts open and visible and cannot close; its assets can go to creditors by sale or by stake transfers (debt turned into ownership); members are not personally liable (N13), so in effect liability is limited; with nothing left, it stays open, abandoned, its debts visible. Missing was discharge: MOR has no court and cannot force a creditor to let go. **Decided ("a scenario worth considering"):** a creditor's signed release, by which a creditor ends an obligation without full payment (for instance against stakes or a partial payment). Only the creditor can sign it; with every debt paid or released, the collective may close.
- **D6, a grant in the collective's name at founding:** (a) the founding terms, signed by every founder, carry it; the collective's key takes over from then on; the service shows its acceptance by receiving.
- **The nine readings of `docs/law-draft-10.md`, section 7:** 1 to 8 confirmed. Reading 9 corrected: a stray payment to the old split service is owed to the successors in the shares the fork act transferred, the defaults applying only where the act named none.

*F125's questions all answered, 3 October 2026. To write: D1 to D6, the creditor's release, reading 9 corrected.*

**Written in (Law draft 10, revised in place, 3 October 2026, not yet approved; `docs/law-draft-10.md`, section 8):** a complete fork never undone over a debt, any debt the fork act did not assign owed by every successor jointly, assigning every known debt each member's client's duty, the "unsettled" state of freeze 3.9g removed (D1; type 19, rule 47a); a verifier stating that it found a debt's outside on a relay (D2); the split model chosen by naming a split service or not (D3); the release rule changed with every owner and the ordinary clone rule (D4); no closing while the collective owes anything, its own debts and those it owes as a successor (D5; type 20); a founding grant carried by the founding terms (D6); the creditor's release, signed by the creditor alone (type 21, rule 47b), a closing checking that every debt is paid or released; a stray payment in the shares the fork transferred (reading 9 corrected); readings 1 to 8 confirmed in the text; core v21, freeze suite v21 (3.9, 3.9f, 3.9g rewritten, 3.9h new), one page v6; built in the core library and the collective client (a creditor's release; a closing checking debts), and tested. Writing it in exposed tension T1 (a successor owing a debt it never signed for, against rule 1) and questions E1 to E4, each with a lean.

## F126. Questions from writing F125 into Law draft 10 (`docs/law-draft-10.md`, section 8; answered by Nobody, allegedly, from 4 October 2026, one at a time)

- **T1 reopened at the root (Nobody, allegedly: "this idea of missed debt at the fork bothers me"):** walked through how a hidden debt exists: one member holding the collective's everyday key signs in its name and seals the act to the recipient alone, so the other members never see it. **Decided, on Nobody, allegedly's principle ("one thing is to act, one thing is to read"; "powers can be segmented, but information should run free; it's a continuous collective assembly where matters are exposed. It only bothers cheaters"):** an act in a collective's name binds the collective only if it is sealed to every member and its outside is on a relay. N13's sealing to every member moves from client conformance to a validity rule, and D2's public outside extends from debts to every act in the collective's name. An act signed with the collective's key that fails either condition is not the collective's; it binds only its signer. *Cost, stated:* a collective keeps no secret from its own members, and anyone can see that it acts, never what. *Still open:* an act published after a fork (no clock), and with it T1 itself.
- **When a collective's act is done (Nobody, allegedly, 4 October 2026: "what a collective plans to do can still be a secret for some time and not all members are aware, but once done it is a fact and that touches everyone in the collective"; "why is Cy liable? Let's imagine he acted as the collective intended"):** the project lead's first suggestion, that an act signed but published only after a fork binds its signer personally, was withdrawn. **Decided ("publishing the act to a place the collective can read is a condition to be verified to confirm"):** an act in a collective's name is done only once it is sealed to every member and its outside is on a relay; before that, even signed, it is planning and binds no one, its signer included. A fork act's line (N2) then settles timing: an act done before the line must be assigned by the fork act or the fork does not take effect (checkable, and late publishing cannot undo a fork); an act not done before the line can never be done, since the original's key counts for nothing after it. The successors owe only what the fork act assigned them, by their own signature. This replaces D1's "a debt the fork missed is owed by every successor" and dissolves T1. A creditor holding a signed, unpublished act publishes it at once to make it count. *Sequence, Nobody, allegedly:* the client drafts, signs, publishes, then verifies that the act is readable where the collective reads. *To verify in the code:* that N2's line and the history rules cover every act in the collective's name.
- **Where a collective's act must be published (Nobody, allegedly, 4 October 2026: "absolutely. We are X, we push to relays ABC"):** "a place the collective can read" is not any relay, since an act on a relay no member watches is public in name and hidden in practice. **Decided:** a collective's founding terms name its relays, changeable like any other term; an act in the collective's name is done only once its outside is on one of the relays the terms name at that point. **One is enough** (Nobody, allegedly): each member's client reads all of them.
- **E1, must a creditor's release be public:** (a) no. It counts wherever a verifier holds it, as every act does; the collective, wanting its closing to count everywhere, publishes it on its relays.
- **E2, which lane signs a collective's release of a debt owed to it:** (d), a fourth option raised in discussion: the Finance lane alone. Nobody, allegedly: "this is not an act that defines a complex interaction. It's a simple money decision"; "simple money equals Finance". Unlike N7's release of a work, which touches Envelope, Finance and Law, forgiving a sum only gives up money.
- **Where the creditor's release lives (raised by the project lead after E2; Law type 21 had been the project lead's framing, never decided):** Nobody, allegedly: "that 10% is what changed everything, that's a complex deal that continues in the future. That is law." **Decided:** the release becomes a Finance act ("I let go of this sum"), beside the obligation and its states; a collective signs it by its Finance lane (E2). A release given against something (a share of future income, stakes) is a deal: a Law agreement, signed by the collective's Law lane, which the Finance release names as its reason. Plain forgiveness needs Finance; forgiveness traded for future terms needs both lanes. Law type 21 and rule 47b move to Finance.
- **E4, "released" among an obligation's states:** settled by the move: Finance lists it (discharged by payment, or released).
- **E3 dissolved, and reading 9 replaced (Nobody, allegedly: "walk me through how the stray payment exists"; "the work carries a law act, why can the finance only wallet act?"):** a payment to a withdrawn offer is not valid; it exists only because a rail moves money without reading Law (a wallet paying a stale offer, an old split service still receiving, a push rail that cannot refuse). The project lead first suggested refunding it rather than forwarding it; Nobody, allegedly's question went further. **Decided ("yes, absolutely"):** buying a work is not pure money, since the work's claim and offer are Law. A purchase names the claim it pays under (the agreement, and the line at which it is current), so the payer's client must read the work's Law claim; a Finance-only wallet cannot make a valid purchase. A payment naming a superseded claim, or none, is no purchase: it is money received for nothing, owed back to the payer as a refund (Finance's refund path: the payer's committed key, F113; with none, an open, visible debt). *Client conformance:* a split service whose grant has ended stops issuing payment requests, so on invoice rails a stray cannot happen. Reading 9 (a stray payment forwarded to the successors by the fork act's shares) is withdrawn, and with it E3 (which work a stray paid for).
- **The five readings of `docs/law-draft-10.md`, section 8:** confirmed, two adjusted by this round. 1: a release ends the whole debt; to forgive part, the debtor signs a new obligation for the rest and the creditor releases the old one. 2: a release counts wherever held, even before the debt it ends binds. 3 (adjusted): what a release was given against is a record, never checked; terms it was traded for are their own Law agreement, binding on their own. 4 (adjusted): a later fork of a successor must assign every debt done before its line, inherited ones included, or it does not take effect. 5: a closing checks every debt the collective owes as a successor, placed by the original's line.

*F126's questions all answered, 4 October 2026. To write: a collective's act done only once sealed to every member and on one of its named relays; the fork assigning every act done before its line (D1's joint liability withdrawn, T1 dissolved); relays named in the founding terms; the creditor's release moved to Finance, signed by the Finance lane, with a Law agreement where traded for terms; "released" among Finance's states; a purchase naming its claim, a payment to a superseded claim refunded; reading 9 and E3 withdrawn; readings 1 to 5.*

## F127. Flaws from writing F126 into Law draft 10 (`docs/law-draft-10.md`, section 9; answered by Nobody, allegedly, from 4 October 2026, one at a time)

- **W1 taken to its root (Nobody, allegedly: "feels like the same problem popping up over and over in different shapes… what is hiding here?"; "the collective has a clean chain though, or it should, via hashes"; "I keep getting questions about hidden debt and I keep wondering why it exists"):** walked through. The common cause of hidden debt, late publishing, the missing device, the stray payment and W2 is that MOR has no shared clock: acts are ordered only where one cites another, and a collective's history may branch into several sequences (F109), so an act can live on a branch no one else builds on. The project lead first suggested an act counts only once the collective's chain builds on it; withdrawn on Nobody, allegedly's objection ("if I act within my powers in a collective I act for the collective"): an act within the signer's powers counts as soon as it is done, provided it cites the collective's head as the signer knows it, and becomes the new head; the chain's role is to make acts unmissable, not to confirm them.
- **Two chains (proposed by Nobody, allegedly: "a collective has two chains. One is the collective public actions, the other is the decisions by all members within the collective. Can we make it work?"; decided in principle, "it sounds like the best approach"):** a collective keeps a **decisions chain** (founding, clones of the terms, members joining or leaving, the release rule, fork, closing; signed under the collective's rules, each citing the previous decision) and an **actions chain** (debts, payments, publications, releases, sales; signed by the holder of the power, each citing the previous action and the decision it acts under). A decision cites the action head it saw; a fork cites the action head, and everything in that history must be handed out. Law's records (type 17) are partly a decisions chain already. *Stated limit:* two acts signed at the same moment without seeing each other cannot be ordered by hashes alone; with two chains this remains only where a decision ending powers (fork, closing, removal) meets an action using them. *To verify in the code:* how F109's sequences map onto the two chains.
- **The tie rule, where a decision ending powers meets an action using them, neither citing the other:** (a), "seems fine": the ending wins. An action missing from the ending's history was made with powers that are ending, and is void; its counterparty deals again with a successor. Otherwise anyone holding a power could keep a fork or closing from settling by racing it. A counterparty protects itself by waiting until the actions chain visibly moves past its act before delivering.
- **W2, a payment against the act that superseded its claim:** decided, "agreed", the session's option (a) made checkable by the two chains: a payment is the buyer's act; it becomes a sale once the collective's actions chain records it (delivery or receipt, signed by the collective or by its split service under its grant, both acts in the collective's name). A sale in the fork's history is a purchase; a payment the original's chain never recorded before the fork is no purchase and is refunded; a sale recorded concurrently with the fork falls under the tie rule (the fork wins; refunded).
- **W3, must a collective's records be done:** (a). A record (Law type 17), a link on the decisions chain, that is not sealed to every member and on one of the collective's relays is not done and puts nothing in force. One rule for every act in the collective's name, no exception by type.
- **The six readings of `docs/law-draft-10.md`, section 9:** confirmed, reading 3 adjusted. 1: "sealed to every member" means every party of the agreement in force is among the recipients, or the act is public; a departed holder is not a member. 2: "in the collective's name" means signed with its key or by a grantee under its grant; a member's own signature act on such an act is the member's. 3 (adjusted): relays are named as homes are (operator, address); required in a collective's terms, forbidden in a deal's; **changing them is constitutional, not operational** (Nobody, allegedly: "because so much stands on it"; the relays are the collective's notice board). 4: the claim a purchase names is the latest act that changed who is paid for the work (a version of the claiming agreement, a fork, a closing, a release); tips and debt payments name none. 5: a payment that is no purchase commits to exactly the same fields as before. 6: test collectives founded before F126 name no relays and must be founded again.

*F127's questions all answered, 4 October 2026. To write: the two chains (decisions and actions; verify how F109's sequences map onto them); an act within powers counts once done and citing the collective's head; a fork cites the action head and must hand out everything in its history (F126 item 2 rewritten; D1's joint liability withdrawn; T1 dissolved; F125 reading 4 as adjusted in F126); the tie rule (the ending wins); W2 (a sale is recorded on the actions chain); W3 (records must be done); readings 1 to 6, 3 adjusted.*

## F128. Questions from writing F127 into Law draft 10 (`docs/law-draft-10.md`, section 10; answered by Nobody, allegedly, from 4 October 2026, one at a time)

- **G1 taken to its mechanism (Nobody, allegedly: "how is the signature in name of the collective mechanically executed?"; "maybe what is missing is a mechanic in the grant. As of now, it's a personal signature that is valid in name of the collective for what the grant covers"):** walked through. A collective's own acts are signed with its key on its devices, each a strand of its actions chain; a grantee signed with its personal key, pointing to a grant, so its acts lived outside the collective's chains, which is what G1 and G2 trip over. The project lead first suggested moving grants and revocations to the decisions chain; Nobody, allegedly went to the mechanism. **Decided ("yes, it's a grant key, scoped"):** a grant hands the grantee a **grant key** of the collective, scoped to the grant's area, like a device of the collective limited to that scope. The grant is a decision naming the grantee's own identity, which signs to accept it; the grantee's acts are a strand of the collective's actions chain, citing the decision they act under; revoking the grant removes the key, a decision ending powers. **G1 answered by the tie rule:** a grantee's act and a revocation that cite neither each other, the ending wins. Every grant key ends at a fork's line (N14). *Costs, stated:* the collective's identity gains a scoped kind of key, a change to Identity draft 11; a stolen grant key acts within its scope until revoked.
- **G2, a grant when its area's holder departs (Nobody, allegedly: "in the end, it is an extra key that is tied to both the collective and the grantee's hashes"; "not all member departures are the same. Some could leave an area of power empty. That's the case where keeping the grantee makes little sense"):** **decided ("an empty area should be treated as an emergency. End it. The copy still exists, cloning it takes two seconds if need of reinstating"):** a departure that leaves an area held leaves its grants in force; only a revocation ends them. A departure that empties an area ends every grant in it: a decision ending powers, so the tie rule voids any grantee's act racing it, and every act after it is void. No suspension, no undetermined acts: C8's limbo for grants is withdrawn. A grant is reinstated by cloning the ended grant, a new decision. *Client conformance:* a member's client shows an empty area as an emergency.
- **Named relays withdrawn from validity (Nobody, allegedly, while weighing W4: "naming relays seems to be a solution, again… but I am sure it is also creating problems, just unsure which ones"; then "something feels wrong with naming the relay in this case… let's step back, zoom out a bit"):** the project lead listed the problems (a vanished or hostile operator freezing a collective, even its decision to change relays; leverage over the collective; omission to readers checking one relay; offline verifiers) and, on zooming out, named the cause: "done = on a named relay" made an act's validity depend on infrastructure, crossing MOR's line that an act is valid by its signatures and content wherever held, relays being transport (a cMIP). The relays were added in the morning (F126) as a witness of time; the evening's two chains and tie rule (F127) answer "before" without them. **Decided ("I think it does, yes"):** an act in a collective's name is done once sealed to every member and on the chain (citing the collective's head as its signer knew it). "On one of the collective's relays" is withdrawn as a validity condition, and with it terms field 25 as a required field, "one is enough", and F127 reading 3's "changing the relays is constitutional". Relays return to transport: where a collective's clients publish and look first, client conformance or a cMIP, never the core. Sealing to every member keeps "information runs free". A counterparty is safe once a later act of the collective cites its act. *To settle:* whether N13's "a collective's obligation binds only once its outside is public" and D2 still have a purpose.
- **W4, a superseded claim no collective's chain settles (Nobody, allegedly: "why did the client miss the tip?"; "the old version should not be accessible anymore"; "is not having a clock turning out to be a huge problem in many cases?"):** walked through. A buyer's client misses the tip by being stale, looking in the wrong place, not checking, or being shown an old tip by omission; the root is that the buyer guesses the current version while the seller knows it. "Accessible" was the wrong word: in MOR old versions stay readable forever (nothing is updated); they must not be actionable. The missing clock is a cost, not a flaw: each identity's chain orders its own acts, chains knot where one act cites another, and real deadlines borrow the clock an agreement names (its time reference, a judicial task). "That's why the core decides to outsource that problem for those who truly need it." **Decided ("yes"):** (1) on rails with a payment request, the claim a purchase names is the one the seller's request commits to, so a buyer cannot pay a version the seller has left; (2) on push rails, each holder settles afterwards on its own chain: a receipt recorded before that holder's signature on the new version is a sale under the old one, one recorded after it is not; the payment is a purchase only if every holder's receipt is a sale, otherwise every holder refunds what it received and the buyer buys again under the current version. The clock is when each holder records, the only one MOR has, and it belongs to the one answering for it. The session's lean (b), "undetermined", is not taken. *In Nobody, allegedly's summary:* "to not make it actionable, the burden is passed to the step where the action truly takes place."
- **W5, must a fork or a closing be done:** (a). A fork or closing counts only once done: sealed to every member (or public) and citing the collective's head, as it already must. An ending is no exception to "information runs free". *Client conformance:* the client also makes an ending public, since creditors and buyers depend on it.
- **W6, a collective's negotiation messages:** (b). "Negotiation is talk. Only signed law carrying acts matter." Negotiation messages bind nothing and sit on neither chain; they need not be sealed to every member (planning may be secret, F126); the signed deal they lead to is an action and must be done.
- **N13's public outside and D2:** withdrawn ("if the two chains solve it, gone"). A collective's obligation binds once done, like any act; publishing it is the creditor's choice and protection (client conformance). D2's "the verifier found it on a relay" goes with it: no validity rests on where an act is stored. The cost N13 stated (anyone can see how many debts a collective has) goes too.
- **The nine readings of `docs/law-draft-10.md`, section 10:** confirmed, four adjusted. 1: decisions keep their formats; actions cite the decision they act under and other devices' heads in `objects`. 2 (adjusted): actions are every act signed with the collective's key, a grant key included, except records and Identity's own acts. 3: an action is judged under the decisions its history holds. 4 (adjusted): decisions ending powers are a fork, a closing, a departure, a grant's revocation (G1) and a departure emptying an area (G2). 5: everything in a fork's history means every debt signed there, published or not, paid or not, plus what an earlier fork handed down; a debt never sealed to every member was never the collective's. 6 (adjusted): a sale is recorded by the collective's receipt or its split service's, signed with its grant key. 7: a new version changes who is paid only where the work's shares in it differ. 8 (adjusted): founding and rotations are done by Identity's own rules; no relays. 9 (adjusted): a verifier states where it found each act as information only; no validity rests on it.

*F128's questions all answered, 4 October 2026. To write: grant keys (a scoped key of the collective, a strand of its actions chain; the grant a decision naming the grantee, who signs to accept; revocation a decision ending powers; every grant key ending at a fork), G1 by the tie rule, G2 (an emptied area ends its grants; reinstated by cloning; the client shows an emergency; C8's limbo for grants withdrawn); named relays withdrawn from validity (done = sealed to every member and on the chain; field 25, "one is enough" and relays constitutional withdrawn; relays as client conformance); W4 (the seller's payment request names the claim; on push rails each holder's chain settles, all refunding if any cannot accept); W5 (forks and closings must be done); W6 (negotiation on neither chain); N13's public outside and D2 withdrawn; readings 1 to 9 as adjusted.*
- **Open, found reviewing the adversarial test plan (4 October 2026):** F128 made a grant a scoped key of the collective, but deals between individuals also name services by grant (suite steps 1.3, 6.2, 7.1), and a deal has no collective identity to hold such a key. How a deal grants is undecided: to settle with Nobody, allegedly, before F128 is written in, or to be raised by the session writing it.
- **Grant keys for every identity (raised by Fable and the project lead reviewing the test plan; decided by Nobody, allegedly, 4 October 2026: "I think yes. I don't see why not. The mechanic is there and it can serve some real use cases"):** a grant key is issued by any identity, a person as well as a collective, as Law draft 10's grants already are. In a deal, each payee grants the split service a grant key scoped to that deal; the service holds one per payee. The alternative, the service as a signing party of the deal, was set aside: leaving the service would become a renegotiation rather than a revocation, failing the exit test. *To check in writing:* whether a person's grant key can be added and revoked by a lighter act than a rotation needing the safety key, scoped and visible.

## F129. Questions from writing F128 into Law draft 10 (`docs/law-draft-10.md`, section 11; answered by Nobody, allegedly, from 5 October 2026, one at a time)

- **H1, what a client without Law sees of a grant key:** (a), "makes more sense", as built. Identity checks the signature of an act signed with a grant key and shows it as **scoped** (signed by a key a higher layer's act installed), leaving the rest to Law; a client without Law shows such an act as unknown. Nothing is lost against before F128, when a Finance-only wallet could not tell a split service's receipt was the group's either. Option (b), Identity installing each grant key by an act of its own, was set aside (two acts per grant and per revocation; impossible for a grant in founding terms).
- **H3, the handover:** (a). The handover (rule 41) is withdrawn: with grant keys, a revoked grantee's acts are the grantor's own acts, and a void one counts only if the grantor adopts it by an act of its own key (acknowledging, paying on or importing it); another grantee then manages it under its own grant. Adoption already does the job, visibly; a second mechanism would have no purpose of its own.
- **H4, how a deal names its payees' grants:** (b), "feels the cleanest". The grants are written inside the deal's terms, each naming "this agreement" by null, as founding terms name "this collective" (S1, D6); signing the deal signs them, the split service signs to accept, and field 14 lists one grant per payee. Each payee can revoke its own grant later, so leaving the service stays a revocation, not a renegotiation.
- **H5, what a payee's grant key may sign:** (b) with (a) beside it. Nobody, allegedly: "if it's a grant, it should use the grant key. Worth noting that whoever uses it still signs from under its own identity but via grant key." A payee's grant key to the split service signs only receipts for money coming into the deal (purchases of its work, payments on its offer), nothing else; and, stated explicitly, it never signs a receipt whose payer is the service itself or a split's payout, so a payout without the payee's own receipt stays the service's open obligation (rule 29). The grant names the grantee's identity, which signed to accept it, so every act of the key is traceable to who used it.
- **The twelve readings of `docs/law-draft-10.md`, section 11, and the person's grant:** confirmed. 1: the grantee makes the grant key; the grant names its public part and counts once the grantee signed to accept it (replacing D6's acceptance by receiving). 2: a grant-key act cites its grant and is judged at the latest link among its grant and the decisions it cites. 3: a grant survives rotations; only a revocation, an emptied area, a fork or a closing ends it. 4: a grant key signs no decision and adopts nothing. 5: grants and revocations are decisions. 6: a void grant-key act counts only if the grantor adopts it by its own key; at a fork, only before its line. 7: a reinstatement copies the grant with a fresh key and takes nothing on. 8: each rail Module states whether it is a request or a push rail; every rail Module under payment cMIP draft 2 is a request rail. 9: one push payment to several holders is one rail payment. 10: "after the holder's signature" means within the receipt's own history; a receipt on a device that had not seen the signature is a sale (cost: each holder answers for its own devices; any holder refusing makes all refund). 11: splits stay signed by the split service's own identity; its receipts in the group's name use the grant key. 12: terms carrying field 25 are refused; test collectives naming relays are founded again. **A person's grant** is public, and a person grants and revokes with its everyday key, no safety key (cost: a thief holding the everyday key can grant or revoke until the owner rotates; the rotation drops it).

*F129's questions all answered, 5 October 2026. To write: H1 as built; H3 (the handover withdrawn, rule 41); H4 (a deal's grants in its terms, naming "this agreement" by null; field 14 one grant per payee); H5 (a payee's grant key signs only receipts for money coming into the deal, never one whose payer is the service or a split's payout); readings 1 to 12; the person's grant public.*

## F130. Questions from writing F129 into Law draft 10 (`docs/law-draft-10.md`, section 12; answered by Nobody, allegedly, from 5 October 2026, one at a time)

- **H6, a deal's chain of judgment following its split service:** (a), "feels right". A deal's chain link lists one grant per payee for each service taking over, grouped by service, each naming "this agreement" like field 14's, signed with the terms. So the chain works in deals as in collectives. (b), no backups in deals, was set aside: switching would need a clone every party signs, so one absent payee would leave the deal with no service, the case fallbacks exist for; (c), granting at the switch, would need every payee present at the moment of failure.
- **H7, H5's limit for a collective's split service:** (a), "one rule for all". A split service's grant key, whoever granted it, a person or a collective, signs only receipts for money coming in under the grantor's own claims and offers; never one whose payer is the service, nor a payout the grantor is owed. A grantor may scope its grant more narrowly still.
- **The six readings of `docs/law-draft-10.md`, section 12:** confirmed. 1: a payee's grant is a person's grant, signed with its own key, public, revoked by the payee alone; it counts once a deal its grantor signed lists it and exists, every party having signed. 2: "this agreement" is the deal with the versions it clones; a grant listed by two deals its grantor signed serves each. 3: one split service per deal, one grant per payee; otherwise the deal carries none, and a verifier not holding every listed grant fails closed. 4: a payout is a receipt carrying a batch or naming a split; a receipt received by anyone but the grantor is never backed. 5: a collective's field 14 stays one hash. 6: adoption is the grantor's, a person's as a collective's.

*F130's questions all answered, 5 October 2026. To write: H6 (a deal's chain link lists one grant per payee per service taking over, grouped by service, naming "this agreement", signed with the terms); H7 (H5's limit for every split service's grant key, a collective's included); readings 1 to 6.*
- **The five readings of `docs/law-draft-10.md`, section 13:** confirmed. 1: every backup group is signed by the owners who signed field 14's grants, one each, and names a service of its own; otherwise the deal carries none of its grants. 2: a backup's keys count from the deal's existence (the chain decides who judges, not whose key works); walked through on Nobody, allegedly's question ("backup keys?"): those keys sign only receipts for money really arriving, with its rail proof, routed to the backup by an owner's own pointer, so before a failure they are effectively asleep, and switching them on only when the chain passes would need a clock-like condition for almost no gain. 3: "never a receipt where the service paid" covers every service the agreement names for the job, backups included. 4: a split service's grant is held to the limit whichever version of the grantor's agreement its act cites. 5: a collective's own claims are its agreement and the versions it clones.

## F131. Text findings from invariant hunting (`docs/law-invariants.md`, branch `claude/law-invariants`; answered by Nobody, allegedly, from 5 October 2026, one at a time)

*Invariant hunting also found seven code failures (IC1 to IC7), fixed in the core library and kept as named tests; they changed no rule.*

- **IT1, a second fork undoing the first:** "a complete fork is never undone" collided with F125's reading 4 ("any two complete forks or closings of one collective are concurrent, and neither ends it"): a later second fork would revive the original collective, its offers, its debts. **Decided: (b).** A complete ending is final: a later fork or closing of the same collective counts for nothing. Only two endings made without knowing each other, neither naming the other, are concurrent, and neither counts until one names the other, as any race between equals. F125's reading 4 is narrowed to that case. A successor forking again remains a fork of the successor.
- **IT2a, a revocation racing an act the collective already cited:** (b). Once an act of the collective's own key that counts cites an act, the act is adopted (as H3's adoption by acknowledging), and no ending racing that citation can void it; the tie rule voids only acts the collective never took on. A buyer who waited until the collective cited the sale is safe from a device it cannot see.
- **IT2b, a fork drawn on an old line on purpose:** (a), the cost stated. Without a clock, a line drawn early on purpose cannot be told from one drawn before the later acts existed, and every cure would let something published after a fork reopen it, against IT1. Pulling it off needs every signer of the fork to collude against a creditor, and it stays fully legible: the signed debt, the collective's citation of it and the fork leaving it out stand as evidence for any outside court. *Client conformance:* a member's client refuses to sign a fork or closing until it has pulled every device's latest acts and holds every act its history should hold. The promise to counterparties is restated: safe once cited, against everything but the collusion of an ending's signers, which stays visible.
- **IT3, one push payment whose receipts name different claims:** (b). The payment decides: the claim is the one the payment's commitment names (F126: a purchase names its claim). A holder's receipt naming another claim is a wrong receipt, shown as such, counting for nothing; W4 then applies to the holders' receipts naming the payment's claim, each settled on its own holder's chain.

*F131's questions all answered, 5 October 2026. To write, on branch `claude/law-invariants` with IC1 to IC7: IT1 (a complete ending is final; F125 reading 4 narrowed to truly concurrent endings); IT2a (an act the collective's own key cites is adopted, beyond any racing ending); IT2b (the stated cost and the client conformance; the promise to counterparties restated); IT3 (the payment's claim decides; a receipt naming another is wrong). The counterexample tests it1, it2 and it3 then assert the decided behaviour.*

## F132. Questions from writing F131 in (`docs/law-invariants.md`, "F131 written in"; branch `claude/law-invariants-f131-rnfint`; answered by Nobody, allegedly, from 5 October 2026, one at a time)

*Writing F131 in and rerunning the large runs also found two code failures (IC8, a record after a collective's ending still registering a departure; IC9, a departure racing a citation still taking a voice off the cited act), fixed and kept as named tests; they changed no rule.*

- **U1, a later ending that does not name the first:** without a clock, a second fork whose signers knew of the first but left it unnamed could not be told from one made in ignorance, so the two would tie and the collective would revive. **Decided: (c),** "leveraging knots each time we can". A member who signed both endings orders them: each signer's own chain only grows forward, so a signature on an ending placed, in that signer's own history, after its signature on another complete ending of the same collective counts as naming it. A true tie remains only where two endings share no signer. **Principle stated by Nobody, allegedly:** wherever acts must be ordered and no citation orders them, use the knots, the signers' own chains, before declaring a tie or a cost.
- **U2, settling a true tie between endings:** (a), confirmed as built. A third ending that names both tied endings settles the tie and counts, as a later clone settles two clashing records (B11). A tie that could never be settled would trap the collective forever, against the right of exit.
- **U3 and the readings of "F131 written in":** confirmed, one adjusted. U3: "cites" reads as "holds in its history", so citing a later act of a strand cites the earlier ones. IC9's reading: a departure racing the collective's citation takes no voice off the cited act; the act counts if it counts as judged, or once those racing departures are set aside. Adjusted for U1: an ending names another in its own act's `objects`, or through a signer's own chain, its signature on the later ending placed after its signature on the earlier one. A push payment whose receipts name different claims is unrecorded until the rail's answer is held. One push payment's holders' receipts share its proof without a batch (Finance 8a, as W4 reads it).

*F132's questions all answered, 5 October 2026. To write, on branch `claude/law-invariants-f131-rnfint`: U1 (a signer's own chain orders two endings it signed), the adjusted reading on what an ending names, U2 and U3 and the readings as confirmed; then the large runs again. Then approval of the revised set and merge.*
- **U1 refined, a member signing two endings from two unsynced devices (raised by the session writing F132):** a person's history is one line per device, so two parallel devices leave no knot. Asked "why is cross-device chaining impossible?", walked through: devices join whenever they sync, but a device cannot be forced to cite what it has not seen; the one line per identity that never branches is the identity chain (rotations, the safety key). **Decided, option (d), proposed by the project lead (Nobody, allegedly: "forks and closures are important decisions and I think the use of the safety key makes sense here"):** a member's signature on a fork or closing is made with that member's safety key, as an act on the member's identity chain, so any two ending signatures of one member are always ordered. With U1, a later ending sharing a signer with a complete one counts as naming it; a true tie remains only between endings sharing no signer. *Cost, stated:* every member signing an ending goes through the safety-key ceremony (the air-gapped device), so forks and closings are slow and heavy, as rotations are. This touches Identity (an ending signature on the identity chain). Options (a) stated cost, (b) any shared signer and (c) a format rule were set aside.
- **U1 refined, how an ending signature sits on the identity chain (raised by the session writing F132 in):** a rotation already does three things (reveals the safety key, sets a signing key, judges every act of the old key), so an ending signature could be (i) a rotation declaring the ending, or (ii) a new identity-chain act. **Decided: (ii), Nobody, allegedly.** A **chain signature** (Identity type 16): signed with the revealed safety key, naming the previous identity-chain act and its position, committing the next safety key and naming the act it signs; it keeps the signing key, the homes, the rules and the declarations, judges no act, and counts as a rotation counts (the homes' receipts; on its own signatures for a self-hosted identity). *Readings taken writing it in, to confirm:* a member signs a fork or closing only by one, the ending act's own signer included (the ending act, an everyday act, is the proposal); a successor's signature for a debt handed to it stays a signature act (any two endings sharing a successor share that side's members, who order them). (i) was set aside: every ending signature a full rotation, every device synced and rebound, and an exception to Identity rule 8b.
- **U4, an old proposal finished late (found writing U1 refined in; checked by a test against the code as it stood):** naming tells when an ending was drawn; finality needs when it was finished. Ben drafts a closing and signs it; Ana does not. They close by a second one naming the first; it is complete. Ana then signs the first. As built, the first counted and the second for nothing; with U1, each named the other and neither counted: IT1's harm, by one member. No rule cures it fully without a clock: completions lie on different members' chains. **Decided: (a), Nobody, allegedly.** A member's signature on an ending counts for nothing where it lies, on their identity chain, after their own signature on another ending of the same collective that names it (in `objects`, or through a signer's chain): once you signed the ending that replaced a proposal, you can no longer finish it. Under an every-member constitutional rule this closes it. *Cost, stated:* under a threshold, members who signed no ending naming an old proposal can still finish it with others' earlier signatures, visible on their chains. *Client conformance:* a member's client signs no ending that another ending it holds names, nor any once it holds a complete ending of the collective. (b), a stated cost only, was set aside. *Reading taken writing it in, to confirm:* "names" is judged in two steps, so that no signature both judges and is judged: first by `objects`; then, among the signatures left, through signers' chains too; the endings an ending names through signers' chains are read from the signatures left after both. Read in one step, two members who each signed the other's ending after their own would void each other's signatures, and a single late signature could void an honest earlier one.

*F132 refined, answered 5 October 2026. To write, on the same branch: Identity's chain signature (type 16), ending signatures on it, U1 with it, U4 and its stated cost and client conformance; then the large runs again.*
- **U4b, a replacing ending that leaves out a proposal its drafter signed (found by the large run after U4 was written in, TEXT; the code and the oracle agreed):** Ben drafts and signs a fork; Ana does not. Ben drafts a second fork leaving the first out of its `objects`, bypassing his client; both sign it, and it is complete. Ana then signs the first. Ben's chain says first then second, Ana's second then first: each names the other, and neither counts, even under the every-member rule. The same signatures arise from a true race (Ana drafting the second without having seen the first), so no reading of the chains can tell them apart; U4 decides only where the replacing ending names the proposal in `objects`. **Decided: (b), Nobody, allegedly.** An ending's drafter names, in its `objects`, every ending of the collective they signed earlier on their own identity chain (than their signature on it); otherwise it is no ending, and its signatures count for nothing. Checkable on the drafter's own chain, unlike "every ending a client holds". The case cannot arise; what remains is a drafter who never signed the proposal, the cost already stated under thresholds. (a), correcting the stated cost only, was set aside. *Written in, the stated cost made exact (the rerun met it under the every-member rule):* where the replacing ending's drafter never signed the old proposal and leaves it unnamed (not having held it, a true race, or bypassing their client), the proposal finished late may still count as the earlier ending, or tie with the replacing one; under a threshold, members who signed neither suffice.

*U4b answered 5 October 2026. Written in on the same branch.*
- **The two keys renamed (Nobody, allegedly, 5 October 2026, once the safety key also signs endings: "safety key will need a new name"; "signing key and chain key sound good for the two keys, deep key is the close second"):** the safety key becomes the **chain key** (it signs the one line of an identity that never branches: rotations and ending signatures); the everyday key is called the **signing key** throughout. "Deep key" noted as the close second. *To apply:* one rename pass across the MIPs, core, suite, one page, Modules (safety seed words and hex, the air-gapped signer), clients and code, after the session writing F132, not during it.
- **The three readings taken writing F132 in (Law draft 10, "Open in this draft"):** confirmed, 5 October 2026. The ending act's own drafter signs by a chain signature too, the act itself being the proposal; a successor's signature for its debts stays a signature act; U4 is judged in two steps, first by `objects`, then, among the signatures left, through signers' chains, so that no single late signature voids another member's honest earlier one.


## F133. Rule 14 without "when" (rule 14 built, 6 October 2026)

**Found building Finance rule 14 (R14-1):** the rule said the pointer version an obligation names must be "one that counted when the obligation's agreement act was made". With no clock, "when" cannot be checked; a debt re-signed to name a thief's newer flow pointer would let the thief collect it, and nothing refused it.

**Decided (Nobody, allegedly, 6 October 2026):** the version an obligation names must be one its agreement act holds in its history (cites, directly or through what it cites), the same move as the knots and the ending rules. Working rule, in his words: **"'when' is to be avoided unless anchoring is involved."** Every rule judges order by what an act cites; only a named time reference (anchoring) may speak of time.

**Still open, from the same build (for later, not decided):** R14-2, a payment in good faith after the owner's rotation (rule 15) needs the same treatment; R14-3, agreements name no pointer, so payments under them are judged "unknown"; R14-4, freeze scenario 1 step 5c's wording follows rule 14 ("only to the vault, or to the flow pointer the debt names"), a wording fix.

**Core changes:** Finance draft 6, rule 14 (revised in place). To build: the core library checks the cited pointer version (the session that built rule 14, or the next).

*Built the same day (a1b2fbf). Reading taken there, then decided:* a debt naming no agreement act (field 4 absent), such as an IOU signed by the debtor alone, or a refund owed after a cancelled payment, had no history to cite a pointer, so the build counted it only when paid to the vault. **Decided (Nobody, allegedly, 6 October 2026): "Agreed"** to the project lead's suggestion: with no agreement act, the obligation act itself must hold the pointer version it names in its history. A thief still gains nothing: a debt re-signed to the thief's pointer is a new debt its debtor signs, the stated cost of the window between theft and rotation. *Core change:* Finance rule 14, third sentence. *To build:* the core library's `pointer_cited` falls back to the obligation's own history when field 4 is absent.

**Built, 6 October 2026:** `finance::pointer_cited` in the core library walks the agreement act's citations (`prev` and `objects`); the payment cMIP refuses a payment to the flow for a debt whose agreement act does not cite the pointer it names, and judges it unknown where the history held cannot tell (`docs/finance-rule-14-2026-10-06.md`, "F133, built"). A debt naming no agreement act counted only through the vault, a reading, since decided below; the fallback to the obligation's own history built the same day.


## F134. Private links, against "every Identity act is public" (rule audit, 6 October 2026)

**Found by the rule audit (`docs/must-audit-2026-10.md`, Identity, unclear 1):** F7 decided that a link may be private, stored encrypted with its key given only to whoever should see it (Identity rules 13 and 26 assume it), but F29 later made every Identity act public. As written, a private link could not exist, and the core refused any private Identity act.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed"** to the project lead's suggestion: links are the one stated exception. A link's claim, confirmation and termination may be private; every other Identity act stays public. A link carries no key event, so no home or auditor needs it to follow an identity's keys. *The point of a private link* (asked by Nobody, allegedly): proving to one party, and only that party, that two identities belong to the same person: a pseudonymous journalist to an award jury or a publisher's lawyer, an artist name to a label at contract time, a business identity to a bank, a pseudonymous identity to a service that needs a verified one; without it, the only proof is public, and the separation the owner chose is gone.

**Core changes:** Identity draft 11, the sentence on public acts. *To build:* the core accepts private acts of types 6 to 8, and still refuses every other private Identity act.


## F135. The anonymous payer's signature covers the whole claim (rule audit, 6 October 2026)

**Found by the rule audit (Finance, unclear: line 149):** an anonymous payer's key-8 signature covered fields 0 to 4 and 7, not field 5 (the receipt disputed), 6 (the referral) or 9 (the purchase's claim, which since F131 decides purchase or refund). Anyone holding the claim could re-wrap it with another referrer or another purchase, still apparently signed by the payer; rule 10b's "signed by the payer" did not hold for the referral.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** the signature covers every field of the claim (0 to 7 and 9, each absent one as null). A format fix with no change in meaning.

**Core changes:** Finance draft 6, the anonymous claim's signed bytes. *To build:* the core library and the payment cMIP sign and check the new array; existing test vectors regenerated.


## F136. Absence checked by anchoring where a period is named (rule audit, 6 October 2026)

**Found by the rule audit (Law, unclear: rule 49, line 650):** the abandonment clause may name a period of absence on the agreement's time reference (key 2), but rule 51's checks left it out: the core checked only who signed a declaration. A named authority could declare an active member absent at any moment, removing their voice; liveness acts (rule 50) protected nothing.

**Options:** (a) the declaration is the authority's judgment, a stated cost, visible and contestable; (b) where the clause names a period, the declaration counts only if the party has no act anchored on the time reference within the period before it; with no period, (a).

**Decided (Nobody, allegedly, 6 October 2026): (b), with (a) as the fallback** ("Your suggestion fits"), in line with the working rule of F133: time only where anchoring is involved.

**Core changes:** Law draft 10, rule 51. *To build:* the core reads the clause's period and the anchors of the party's acts and of the declaration on the agreement's time reference; unanchored or unplaceable, the declaration does not count. Depends on the anchoring and time-reference cMIPs, whose formats are open (FORMAT OPEN until then).


## F137. "The same answer for every verifier", stated with its inputs (rule audit, 6 October 2026)

**Found by the rule audit (Identity, unclear: line 439):** Identity promised the same answer to every verifier holding the same chain, acknowledgements and keeper records, but a homeless rotation may count on a reader's own failed attempts to reach the old home (rule 32a), and answers also depend on the inclusion proofs held. Two readers holding the same acts could disagree. Paper claim 1 rests on the promise.

**Options:** (a) restate the promise with all its inputs (the same acts, proofs and attempts), mark answers resting on the reader's own attempts, and keep binding acts from relying on them; (b) remove the own-attempt basis, so all readers agree but a censored owner cannot escape until auditors attest absence.

**Decided (Nobody, allegedly, 6 October 2026): (a).**

**Core changes:** Identity draft 11, the sentence closing the validity rules. *To build:* `LawView` and the payment cMIP refuse to rely on an answer whose basis is the reader's own attempt (`Basis::OwnAttempt`), audit gap 4. Paper claim 1 to name its inputs.


## F138. A payment under an agreement follows the pointer the agreement cites (R14-3, 6 October 2026)

**Found building rule 14 (R14-3), confirmed by the rule audit:** rule 15 said a payment names its pointer "through the obligation or agreement", but Law's terms name no payee pointer, so a payment under an agreement or offer with no obligation between had nothing to compare; the code answered "unknown".

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** as for F133, the pointer that counts is the payee's pointer the agreement act or offer holds in its history; no new field. A thief's newer pointer, which the agreement never cited, gains nothing.

**Core changes:** Finance draft 6, rule 15. *To build:* the payment cMIP's `pointer_in_force` reads the pointer the agreement act or offer cites.


## F139. Good faith after a rotation, judged by what the payer's claim cites (R14-2, 6 October 2026)

**Found building rule 14 (R14-2), confirmed by the rule audit:** rule 15 protects a payment that followed the published pointer "even if a later rotation invalidates that pointer", but after the rotation a verifier cannot tell a payment made before it, in good faith, from one made after; the code answered "unknown".

**Decided (Nobody, allegedly, 6 October 2026): "Agree":** the payment counts as made if the payer's claim does not hold the owner's rotation in its history (the payer had not seen it). A payer who leaves the rotation out on purpose, colluding with the thief, is the theft window's stated cost, borne by the owner and visible.

**Core changes:** Finance draft 6, rule 15. *To build:* the payment cMIP counts such a payment as made when the claim's history does not hold the rotation; a receipt alone (no payer's claim) is judged as before.


## F140. Ten unclear rules made checkable (rule audit, 6 October 2026)

**Decided (Nobody, allegedly, 6 October 2026): "All approved"**, as the project lead proposed:
1. **Rail kind** (payment cMIP): a rail Module declares in its specification whether it is a request or a push rail, in a field clients read.
2. **Law's act table** follows the fork section (F132): forks and closings are completed by members' chain signatures.
3. **The absence period** exists "only when the agreement names a time reference".
4. **Rounding leftovers** go to each stake's first holder (rules 15a and 21, the stakes format), as the code already did; the first party listed may hold no part of that stake.
5. to 8. **Formats open:** how an identity is marked as a publisher (rule 16), the modules a split ran under (rule 27), a metric and its module (rule 28), the "use record" act (Production rule 17); settled with the split plan's format before freeze.
9. **A fee to a service the members own** (rule 46b): client conformance; the collective's client discloses ownership to the members.
10. **Text:** "and similar" and "letters or digits" name exact Unicode categories of the pinned version (Cf, Bidi_Control, Default_Ignorable_Code_Point; L and N).

**Core changes:** Law draft 10 (act table, abandonment clause, rules 15a, 16, 21, 27, 28, 46b, stakes format), Production draft 6 (rule 17), Text draft 6 (rule 5, the format task), payment cMIP draft 2 (rail Modules, item 3). *To build:* rail kind read from the Module's specification instead of `push_rails` by hand.


## F141. A claim and a receipt disagreeing in payee or purpose (U5, 6 October 2026)

**Found building double entry (U5):** rule 10 said the greater amount counts where a claim and a receipt sharing one rail proof disagree, but not toward which obligation when they disagree in payee or in what the payment fulfils; counting toward both counts one payment twice, and rule 8a says such acts count neither until resolved. On every rail under the payment cMIP draft 2 the commitment binds payee and purpose, so both cannot be valid; the case arises only on a rail without such a binding.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed"** to the project lead's suggestion, following IT3: the payment's own commitment decides; where a rail binds no payee or purpose, neither counts until the receiver resolves them (rule 8a), the disagreement shown.

**Core changes:** Finance draft 6, rule 10. *Code:* as built (the disagreeing claim adds nothing, the disagreement shown); the commitment check on rails that bind payee and purpose to be confirmed in the next Finance session.


## F142. A witness act adopts nothing (verifier2, reading A, 6 October 2026)

**Found by verifier2** (`docs/verifier2-report.md`, reading A, 269 of 4,000 stories): the reference library let an Identity witness act (type 15) by the collective adopt a grant key's act (rule 42); an independent verifier written from the text read rules 35a and 35b first: an act binds the collective only once done, sealed to every member and on its chain, and a witness act is on neither chain, so it adopts nothing.

**Decided (Nobody, allegedly, 6 October 2026): "Agree":** adoption binds the collective, so it meets the same bar as everything that binds it ("one thing is to act, one thing is to read", F126). A witness act adopts nothing; the collective adopts by an action citing the act.

**Core changes:** Law draft 10, rule 42. *To build:* `LawView::backing` takes as adopters only acts done on the collective's chain.


## F143. An ending is judged on its own history (verifier2, reading B, 6 October 2026)

**Found by verifier2** (reading B, 47 of 4,000 stories): both verifiers always agreed on which ending counts, but the reference reported a later ending's completeness with the first ending already in force (its debts after the first ending void, its records registering nothing), while verifier2 judged every ending as if it were the one that counted. A later closing could show "complete" in one and "incomplete" in the other; the reference's answer depended on whether it was asked during or after its own choice.

**Decided (Nobody, allegedly, 6 October 2026): "Agree":** each ending is judged on its own history; one that counts for nothing says so plainly, with its own completeness.

**Core changes:** Law draft 10, after the closing's format ("Judged on its own history"). *To build:* `LawView::closing` and `fork` report completeness as `closed_by` judges it during the choice.


## F144. A fork hands out only debts that are the collective's (verifier2, reading C, 6 October 2026)

**Found by verifier2** (reading C, 32 of 4,000 stories; which ending counts changed in 15): a fork must hand out every obligation in its history, "save one sealed neither to every member nor publicly, which is never the collective's (rule 35a)". The reference read the exception by the seal alone, so a debt on no chain (citing no decision), which both verifiers agree binds no one, still had to be handed out, and blocked every fork reaching it until a successor signed for a debt nobody owes. Verifier2 read it by its reason: never the collective's.

**Decided (Nobody, allegedly, 6 October 2026): "I agree":** a fork hands out the debts that bind the collective, done and on its chain; a debt that binds no one cannot block it, and stays visible as what it is.

**Core changes:** Law draft 10, the fork's field 6 (each place it is stated). *To build:* the reference's `to_hand_out` takes only obligations done on the collective's chain.

*Verifier2's three readings are all decided (F142 to F144). Reading D was settled by the text itself; the sentence "its own sequence's previous act counts as cited" to be reworded so it cannot mislead (with the next Law pass).*


## F145. The pointer is judged by the payee's own act (review finding 1, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 1, first half):** F133 and F138 judged which pointer counts by the agreement act, an obligation or an offer, acts the payer or the debtor may sign or draft. A payer colluding with a thief could draft terms or an IOU citing the thief's pointer.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** the pointer is judged by the payee's own act, never the payer's. In an agreement, that is the payee's own signature act on it, which holds the payee's latest pointer and any rotation; in an offer, the offer, which is already the payee's. An obligation with no act of the payee's, such as an IOU, counts only if paid to the vault, until the payee acknowledges it with an act of their own.

**Core changes:** Finance draft 6, rules 14 and 15 (replacing F133's and F138's "the agreement act holds"). *To build:* the payment cMIP's `pointer_in_force` reads the payee's signature act or the offer; an IOU without a payee's act counts only to the vault. *Still open:* good faith after a rotation (finding 1, second half; F139).


## F146. Good faith after a rotation: the payer's claim as the floor, anchoring where both use it (review finding 1, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 1, second half):** F139 judges good faith by whether the payer's claim cites the rotation, an act the payer signs: a payer colluding with the thief leaves it out, and an honest payer who writes the claim after hearing of the rotation loses protection.

**Considered and set aside:** judging by anchor order alone (the project lead's first suggestion). Nobody, allegedly: anchoring is not a core mechanic and has always been optional, so a Finance rule cannot depend on it. Judging by the owner's own list of accepted payments would put the loss on honest payers, against rule 15.

**Decided (Nobody, allegedly, 6 October 2026): "Agree. Documentation can outline the risk and recommend anchoring where there is value to protect":** F139 stays as the floor. Where both the payer's claim and the rotation are anchored, anchor order decides. Collusion is the stated cost of an unanchored theft window, borne by the owner and visible. A payer's client writes the claim at the moment it pays (client conformance). Documentation outlines the risk and recommends anchoring wherever there is value to protect.

**Core changes:** Finance draft 6, rule 15. *To build:* the payment cMIP compares anchors when both acts are anchored; clients write the claim at payment. *Documentation:* the risk and the recommendation, in "Who can earn on MOR" and the case studies that handle value.


## F147. An anonymous payer's claim covers its citations; several claims for one payment are read together (review finding 2, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 2):** the key-8 signature of an anonymous payer's claim (F135) covered the payload, not the act's citations or acknowledgements. Since F139 and F146 a claim's history decides good faith, so anyone holding the claim could re-wrap it in a new act citing the owner's rotation (or stripping it), turning the payer's good faith on or off, and could add or remove acknowledgements, making or unmaking a dispute in the payer's name. Also unclear: which of a payer's two claims for one payment counts.

**Decided (Nobody, allegedly, 6 October 2026): "Trusting you on this one. If it fails we'll come back to it":** the key-8 signature also covers the act's `objects`, `acks` and `refs`; the claim's history, for an anonymous payer, is only those covered citations (not `prev`, which is the act signer's). A payer's several claims for one payment are read together: the payment counts as made if any of them meets rule 15's proviso. The decision was the project lead's suggestion, accepted on trust; it is to be revisited if building or review breaks it.

**Core changes:** Finance draft 6, claim format (anonymous signature) and rule 15. *To build:* the anonymous claim's signed bytes; the history walk for anonymous claims; reading a payer's claims for one proof together. *Freeze suite:* step 2.5c (a buyer's claim acknowledging a publication) relies on the covered `acks`.


## F148. Absence periods: anchoring is a MUST where a clause expresses a time (review finding 3, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 3):** under F136, (a) an authority could anchor an absence declaration during a gap, keep it, and publish it months after the party returned; (b) unanchored liveness acts protected no one, against freeze scenario 1 ("the liveness act prevents a wrongful declaration"); (c) "act anchored on the agreement's time reference" could be read as any act anywhere, against rule 49; (d) the spec did not say that no period declaration can count until the anchoring and time-reference formats exist.

**Decided (Nobody, allegedly, 6 October 2026): "This is one place where anchoring becomes a must… someone expressed a temporal variable":** anchoring stays optional in the core except where an act expresses a time; a clause naming a period of absence does, so there it is a MUST. A party's client MUST anchor its acts on such an agreement, liveness acts included; anyone may anchor anyone's act, and an anchored act protects its party whoever anchored it. A declaration counts only once an acknowledgement of it by another party or the keeper is anchored within one further period after the declaration's anchor, with no act of the declared party on the agreement anchored between. Only acts on the agreement count as presence (editorial, following rule 49), and the spec states the format dependency (editorial).

**Working rule (follows F133's "'when' is avoided unless anchoring is involved"):** where a signed act expresses a time, anchoring is a MUST for what depends on it; elsewhere it stays optional.

**Core changes:** Law draft 10, rules 50 and 51. *To build:* the acknowledgement-within-a-period check; anchored presence. *Freeze suite:* scenario 1's liveness act is anchored.


## F149. A text format may hide only its own declared markup (review finding 5, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 5):** F140 bounded what a text format may hide to characters outside Unicode categories L and N, so a format could hide combining marks (a Hindi vowel sign turns "work" into "less"), punctuation (a decimal point) and symbols (a minus sign), changing an amount or a word without hiding a letter.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** the bound is inverted. A format may hide only its own markup: the characters its specification declares as markup, in the positions it declares them; everything else is shown.

**Core changes:** Text draft 6, Text format task and its reasoning (replacing F140 item 10's category bound). *To build:* a format cMIP declares its markup; the long-form cMIP's declaration and the client check follow. Rule 5's warning list (Cf, Bidi_Control, Default_Ignorable_Code_Point) is unchanged.


## F150. Leftovers by largest remainder, ties by the payment's hash (review finding 6, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 6):** F140 gave each stake's rounding leftovers to its first listed holder, but the order of holders is protected by nothing: a clone that only reorders them changes no share, needs no signature from the holder who loses, and with small payments moves most of the money (1 unit split three ways goes wholly to the first). The freeze suite still said "first listed party", and the paper's "within one smallest unit" did not hold.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** leftover units go one each to the holders with the largest fractional remainders; ties are ordered by a hash of the payment's receipt with each holder's identity. The listed order decides nothing. A split cMIP's own remainder rule must not depend on it either.

**Core changes:** Law draft 10, stakes CDDL comment, rules 15a and 21, reasoning; freeze suite line on stakes. *To build:* the split computation in the core library and the split service, with a test that reordering holders changes no payout.


## F156. Does a collective's witness act count in Law? (verifier2 rerun, 6 October 2026)

*Numbered F151 by the Law gaps session (merge commit f542e45 says so) while F151 was also given, the same evening, to review finding 7; renumbered F156 by the project lead, 6 October 2026. The entry stands where the session put it.*

**Found by rerunning verifier2 after F142 to F144 were built** (`docs/verifier2-report.md`, "Rerun"): on the same 4,000 random collective histories, the two verifiers now agree on every ending, every ending signature, which ending counts and every debtor; one disagreement remains, in 262 stories, on one kind of act. The collective's own Identity witness act (type 15), the act by which it acknowledges another act (F110), carries no `objects`. The reference library counts it as the collective's act (`Consent::NoArea`: valid under Identity, reached by no area, Identity governs it, on no chain of Law's) that adopts nothing (F142) and binds nothing, but places the members' signature acts it acknowledges ("Made before, made after", 2: "an act of the collective before it acknowledges them"). Verifier2 reads rule 35b first ("Identity's own everyday acts carry no objects and are on neither chain"; "an action citing no decision ... counts for nothing"): the witness act counts for nothing in Law at all. F142 decided what such an act adopts (nothing), not what it is.

**Options:** (a) the reference's reading: a witness act of the collective is its act under Identity, counting on its signature, which Law neither judges nor voids; it adopts nothing and binds nothing, and it can still place a member's signature act by acknowledging it; (b) verifier2's reading: it counts for nothing in Law; a member's signature is then placed only by an action on the chain acknowledging or citing it, or by a record, and rule 35b's sentence says so plainly.

*What turns on it:* only the placement of members' signatures by acknowledgement, and the label a client shows on the witness act; no ending, signature or debt changed in the 4,000 stories. Smallest story: `verifier2/stories/compared/a-witness-act-counts` (seed 1, case 9, steps 10, 11, 18). *For Nobody, allegedly, to decide; neither verifier was changed.*

**Decided (Nobody, allegedly, 6 October 2026): "Agreed", option (b):** a collective's line is how Law orders without a clock, so an act on neither chain has no place on it and cannot give a signature one. A collective's Identity witness act counts for nothing in Law; it adopts nothing (F142) and places nothing. A collective places a member's signature by an action on its chain acknowledging it, or by a record or rotation naming it ("or citing" corrected, F162). The witness act keeps its Identity role (keeping an act visible as received).

**Core changes:** Law draft 10, rule 35b and "Made before, made after" item 2. *To build:* the reference library stops placing signatures by a collective's witness act (`Consent::NoArea`), so the two verifiers agree; rerun verifier2.



## F151. On a rail that binds nothing, the payer's claim decides the purpose (review finding 7, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 7):** under F141, where a rail binds no payee or purpose and a claim and receipt disagree, neither counted until the receiver resolved them, so a creditor could receive a debt payment, sign a receipt calling it a tip, never resolve, and demand the money again: a receiver's veto. It also contradicted paper section 5.1. Rare: every rail written so far binds both.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** back to F64's fallback. Where the rail binds nothing, the payer's claim decides what the payment fulfils; the receiver's contrary receipt stays shown as a dispute.

**Core changes:** Finance draft 6, rule 10 (replacing F141's last clause; where the rail binds them, F141 stands). *To build:* the payment cMIP's resolution for non-binding rails.


## F152. A private link's existence is public (review finding 8, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 8):** with F134's private links, a thief holding an owner's signing key could claim and confirm a link privately and hand it to one party (a bank), reaching no relay: the owner never sees it and never rotates. Also, rule 24's "Ending stops the link going forward" is a "when" with no meaning for a party who never received a private termination.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** a private link act counts only if its sealed form is published where its signer's acts are published; content stays private, existence is public, so the owner's client sees an act it did not write. Stated cost: others see that a private link act exists, never with whom. Editorial, following F133's working rule: a link's ending applies to every act that holds the termination in its history. The spec now says that only key holders can tell a private act's type, and a verifier that opens a private Identity act other than types 6 to 8 refuses it.

**Core changes:** Identity draft 11, the envelope section and rule 24. *To build:* homes store sealed private link acts; the owner's client warns on an unrecognised act signed with its key; verifiers check publication.


## F153. Nothing binding rests on a reader's own attempts (review finding 9, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 9):** F137's sentence forbade only keepers, vault payments and agreements from relying on an answer that rests on a verifier's own failed attempts to reach homes, while its italic and paper claim 1 promise "nothing binding". A debt discharged through a pointer only that reader's attempts accepted, and a Law fork or closing counting a member's signature through such a re-homing, slipped through. Since F134, two verifiers can hold the same acts but different content keys, which the list of inputs did not name.

**Decided (Nobody, allegedly, 6 October 2026): "Agree":** the MUST NOT is widened to everything binding (keeper records, payments, discharge of debts, agreements, forks, closings); for these, such an answer is shown as unknown until it no longer rests on the verifier's own attempts. Reading and following an identity may still rest on it, the escape from a censor. Editorial: "content keys" joins the inputs.

**Core changes:** Identity draft 11, the sentence after rule 17. *To build:* Finance and Law callers treat an own-attempt identity answer as unknown. Paper claim 1 now matches the text.


## F154. A payment with no payer's claim counts as made (review finding 10, 6 October 2026)

**Found by the hostile review of F133 to F144 (finding 10):** rule 15's good-faith proviso (F139, F146) speaks only of the payer's claim. F139's build note said "a receipt alone is judged as before", but the spec did not, and freeze scenario 1 step 5c (a fan tipping in good faith before the rotation) and scenario 5 step 2 (a tip from a Finance-only wallet) depend on the reading.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** a payment with no payer's claim is judged as if the payer had a claim citing nothing: it counts as made. Nothing of the payer's is anchored, so F146's anchor order does not apply. A silent colluding payer gains nothing a claim leaving the rotation out would not already give; the cost is the unanchored theft window's, borne by the owner.

**Core changes:** Finance draft 6, rule 15. *To build:* the payment cMIP's good-faith check with no claim.


## F155. One selection rule for the pointer: the latest the payee's own act holds through its citations (review findings 16 and 17, 6 October 2026)

**Found by the hostile review of F133 to F144:** (16) "holds in its history" could mean reachable through citations or a hash written anywhere in the payload; the code (`finance::pointer_cited`) reads the first. (17) F138 selected the latest pointer held, F133 accepted any version held, so under one agreement a debt could name an older pointer than a direct payment followed.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed", reconfirmed after a correction:** "holds" means reachable through the act's citations (`prev`, `objects`, `acks`, `refs`), never a hash in the payload. One selection rule for payments and debts: the latest of the payee's pointer chain that the payee's own act holds (F145); a debt naming another version is read as naming that one. **Correction recorded:** the project lead first explained that a payment counts if paid to the selected wallet "or a later one"; the code (`named >= paid`) and rule 14 say the selected wallet *or an older one*, and a newer wallet counts only once a payee's act holds it (until then, the vault). The lead's error, put to Nobody, allegedly, before recording; the decision stood. Finding 17's worry, a payment to a wallet the payee has since left, is not removed: without a clock nothing can tell, so it is written as a stated cost.

**Core changes:** Finance draft 6, rules 14 and 15. *To build:* `pointer_in_force` walks from the payee's own act and takes the latest version up to any fork; obligations' named version becomes informative.


## F157. The payee's pointer is found through the payee's own acts only (build of F145 to F156, flaw 1, 6 October 2026)

**Found building F145 and F155** (`docs/review-decisions-build-2026-10-06.md`, flaw 1): "holds" followed every citation, and a signature act must cite the terms it signs. A debtor working with a thief drafts terms citing the thief's pointer; the owner signs; the owner's own signature then holds the thief's pointer, and debts under those terms count on the thief's flow. Likewise an owner's acknowledgement of an IOU held everything its debtor cited. Review finding 1's first story was still open. Pinned by `flaw_the_payees_signature_holds_what_the_drafters_terms_cite`.

**Decided (Nobody, allegedly, 6 October 2026): "Agreed":** for selecting the payee's pointer, the walk passes only through the payee's own acts, never through an act another identity signed. The payee's pointers are acts in the payee's own sequence, so the walk finds the latest one the payee had published when signing.

**Core changes:** Finance draft 6, rule 14. *To build:* `finance::select_pointer` and `law::view::pointer_holding` walk own acts only; the pinning test is turned to expect the fix.


## F158. A declaration is acknowledged by someone other than its signer (build of F145 to F156, flaw 2, 6 October 2026)

**Found building F148** (flaw 2): where the keeper's operator is the authority, as in freeze scenario 1, "or by the keeper" let it acknowledge its own declaration, anchor both in January and publish them in October; the kept-for-later attack worked again.

**Decided (Nobody, allegedly, 6 October 2026): "Yes, stated cost is always fine for me. 'Use additional feature or risk'":** the acknowledgement must come from an identity other than the declaration's signer(s) and the declared party. Where none exists (a two-party deal whose other party is the authority, no keeper), a period declaration cannot count, and a client warns at signing that the clause needs a keeper or a third party: a stated cost.

**Working rule (Nobody, allegedly):** a stated cost is acceptable where the safer path is an additional feature the parties can choose ("use additional feature or risk").

**Core changes:** Law draft 10, rules 50 and 51. *To build:* `absence_by_anchors` refuses an acknowledgement by the declaration's signer; client warning at signing; scenario 1 test of the keeper-authority acknowledging itself. Also answers the build's question 4 (the declaring party may not acknowledge its own declaration).


## F159. What a verifier found at the homes is an input; which homes count (build of F145 to F156, flaw 3 and question 14, 6 October 2026)

**Found building F152** (flaw 3, question 14): a private link counts only if published at its signer's homes, but F137's list of shared inputs did not name what a verifier found there, so two verifiers holding the same acts could disagree; and which homes count was unstated (a signer who moves homes).

**Decided (Nobody, allegedly, 6 October 2026): "Agree":** what a verifier found at the signer's homes joins the inputs; where it decides anything binding it is treated like a reader's own attempts (F153), shown as unknown until it no longer rests on one verifier's fetch. The homes that count are those the signer's chain names at the link act's binding; a later move does not void the link; a link nobody can fetch is unknown, never invalid. Identity rule 13: a home MUST store and serve sealed private links.

**Working rule (Nobody, allegedly, refining F158's):** "We're more and more in rare cases. A common case would not get the 'argh just use the added stuff' reply." A stated cost, with an additional feature as the safer path, is acceptable for rare cases; a common case must work safely by default.

**Core changes:** Identity draft 11, rule 13, the envelope section, the sentence after rule 17. *To build:* `published_at_home` judged against the homes at the link's binding; the fetch treated as an own-attempt input in `binding_status`.


## F160. The vault is selected like the pointer (build of F145 to F156, question A, 6 October 2026)

**Found building F145** (question A): the pointer was selected by the payee's own act, but the vault was "the published vault … in force for that payment", naming no act. The code judged a payment against the vault the payee's chain declares now, so a fan's 900 paid under a 1,000 limit stopped being protected once the owner rotated to a 500 limit.

**Decided (Nobody, allegedly, 6 October 2026): "Agree":** the vault and its limits that apply are those held by the payee's own act for the payment (the signature act on the agreement, the offer, or the publication paid), walking through the payee's own acts only (F157). One rule for pointer and vault; a payer is judged by what the payee showed.

**Core changes:** Finance draft 6, rules 12a and 14a. *To build:* the vault check reads the vault selected from the payee's act; a test of the lowered-limit story.


## F161. The remaining "when" sentences rewritten (review finding 11, 6 October 2026)

**Found by the hostile review** (finding 11) and proposed by the build of F145 to F156 (`docs/review-decisions-build-2026-10-06.md`, "The 'when' sentences"): sentences still said "in force when", "a later rotation", "an earlier final one".

**Applied by the project lead, as editorial under F133's working rule ("'when' is to be avoided unless anchoring is involved"):** each time replaced by what an act cites or by the selection rules F145, F155, F157: Finance obligation field 3, rule 14's first sentences, rule 15, the vault reasoning; core v21 "Good faith"; Law "Judged on its own history"; freeze scenario 1 step 5c; paper section 5.1. None changes a rule's meaning; the one that would (which vault counts) was decided as F160.


## F162. The build's smaller questions answered (build of F145 to F156, 6 October 2026)

**Found building F145 to F156** (`docs/review-decisions-build-2026-10-06.md`, "Questions where the spec is silent or unclear"). The project lead suggested an answer to each; **Nobody, allegedly, 6 October 2026: "All accepted".** Numbers as in the report (4, 14 and 15 settled by F158 and F159):

1. The anonymous signature's bytes as built: fields 0 to 4; 5, 6, 7, 9 or null; inside keys 3, 7, 8 or null, each as the act encodes it.
2. The reference library may count a period declaration on anchors a test states; the rule runs, its input is stated; the spec keeps FORMAT OPEN for real use.
3. Anchored points in the period's unit; bounds inclusive: an act anchored at the same point as the declaration protects its party.
5. Presence: acts naming any version of the agreement, earlier or later by clones, or a signature on one; in a collective, a member's acts on the collective's chain.
6. Acknowledgement means Envelope `acks`; a keeper record counts once its format exists.
7. The leftover tie hash's array is encoded in deterministic CBOR.
8. A wallet dividing before a receipt exists shows that a tied unit is decided by the receipt's hash; at most one unit per tie, shown, satisfies rule 4a.
9. A split from a payer's claim with no receipt orders ties by the claim's hash.
10. A fork's division follows F150: largest remainder, ties by the hash of the fork act with each side. Freeze scenario 9 becomes 333,333 / 666,667.
11. Freeze 7t's wording follows F150; the split check tightens to one unit where the default rule applies; declared remainder rules wait for a reader.
12. A member's signature is placed by an act on the chain acknowledging it (spec wording); the log's "or citing" corrected.
13. An Identity-layer area governs the collective's rotations and key events (Identity acts on its decisions chain); everyday Identity acts count for nothing in Law.
16. "Rests on own attempts" as built (differs from the answer with none of them); the partial case noted as an open edge.
17. Link acts as built: a confirmation or termination follows its claim in `objects`; either side may end a MOR-to-MOR link.
18. The long-form markup declaration's two points confirmed (a line break ending a block before another block; an escaped character ends a run).

**Core changes:** Law draft 10, rules 15a, 36a, 50, fork ownership; freeze suite 7t and scenario 9. *To build:* items 3, 5, 8 to 11, 13; others confirm what was built.


## Review of F133 to F144 (6 October 2026, evening)

A hostile review by a separate Opus session (`docs/reviews/f133-f144-review.md`) attacked the twelve decisions together. **Four break:** (1) F133, F138 and F139 judge the pointer and good faith by an act that the party who gains from it signs: the payer, or the debtor drafting terms or an IOU, so a payer colluding with a thief keeps paying the thief's voided pointer after the rotation, and an honest payer who writes a claim after hearing of the rotation loses protection; (2) F135 with F139: an anonymous claim can be re-wrapped with other citations, turning its good faith on or off; (3) F136: a declaration anchored during a gap can be used months later, and unanchored liveness acts protect no one; (4) F144 listed forms, so a debt outside its signer's powers still blocks a fork. Smaller: F140's Unicode bound lets a format hide signs, decimal points and vowel marks; F140's rounding lets a reorder of holders move leftovers; F141 gives a receiver a veto on rails binding no purpose; F134 lets a thief show a private link to one victim; several sentences still say "when".

**Corrected the same evening by the project lead, as editorial or following the decisions' own stated reasons (no new decision):** F144 now hands out every obligation that binds the collective (done, on its chain, within its signer's powers or adopted), as decided ("the debts that bind the collective"); F142 says "an action of its own key", "wherever it is stored"; F143's italic no longer claims independence from when a verifier is asked; F135's null sentence names keys 5, 6, 7 and 9; the rail-kind field marked format open; the freeze suite's leftover wording follows F140.

**Open for Nobody, allegedly:** findings 1, 2, 3, 5, 6, 7, 8, 9, 10, 16 and 17 decided (F145 to F155); the "when" sentences rewritten (F161). The build of F145 to F156 then found F157 to F160.


## F163. A payee's client cites its latest pointer when signing what pays it (review of F145 to F162, finding 2, 7 October 2026)

**Found by the hostile review of F145 to F162** (finding 2, common case): an identity keeps one sequence per device (Envelope, "Sequences"), and F157's walk through the payee's own acts follows only the signing device's line, so a deal signed on the phone holds no pointer published from the laptop; its royalties could go only to the vault, or with no vault nowhere.

**Considered and set aside:** selecting the newest pointer published anywhere, which would also pick a thief's pointer and reopen the backlog; having homes serve the latest payee pointer (the project lead's suggestion). Nobody, allegedly: "It does make sense to keep them together on the home, but these are separate layers Identity and Finance."

**Decided (Nobody, allegedly, 7 October 2026): "Agreed", then "Fetch it from where the finance decision was published":** a payee's client signing an act that can pay it (its signature on terms, its offer) cites in `refs` the latest of the payee's pointers, fetched from where the pointers are published, whichever device published it (client conformance). Verifiers are unchanged: the walk through the payee's own acts finds it. Where a client fails, rule 14's remedy applies: the payee signs an act on the deal citing a pointer; until then payments go only to the vault. **Correction recorded:** the project lead first said the client would fetch from the homes, which do not store pointers (Identity rule 13).

**Core changes:** Finance draft 6, rule 14. *To build:* clients that sign terms or offers fetch and cite the latest pointer; a test with two devices.


## F164. Good faith after a theft: the payee's receipt, the payer's word until the owner anchors (review of F145 to F162, findings 1 and 3, 7 October 2026)

**Found by the hostile review of F145 to F162:** (1) F160 froze the vault into each act the payee had signed, so flow off after a theft protected nothing already signed (and read literally, no act holds a vault at all); (3) the good-faith proviso rests on the payer's claim, which a colluding payer can always write citing nothing, and the owner cannot anchor the payer's claim, so the theft window never shut. One problem: without a clock, "already made" and "still to come" need evidence.

**Considered:** the project lead's first suggestion (the payee's receipt, or the payer's word until the owner anchors) was put with a cost called rare; asked "What sort of scenario creates the rare case?", the lead found it is every honest payer between the theft and the rotation, and that it changes rule 15's principle ("the loss from a theft window falls on the owner, never on a payer who followed the rules"). Two options were then put: (a) keep the principle, collusion an unbounded stated cost; (b) let the owner shut the window by anchoring.

**Decided (Nobody, allegedly, 7 October 2026): (b): "Basically this says to the client dev, anchor your users payment or they'll risk." "Yes. And it is why the idea was to create the clusterfrick of paying via LN and then anchoring on chain pooled":** F160 is withdrawn: the vault applies as the payee's chain declares it, so a change applies at once. A payment to a pointer a rotation voided, or under earlier limits, counts as made where (a) the payee's own receipt shows it (on a kept line, or the payee's split service's grant key), or (b) on the payer's word (F139, F147, F154) until the owner anchors the rotation; after the anchor, only a payer's claim anchored before it. Clients write the claim at payment and should anchor it, pooled. Stated cost: an honest payer in the window with no receipt and no anchored claim, once the owner anchors. The design intent recorded: paying over Lightning and anchoring claims on chain, pooled.

**Core changes:** Finance draft 6, rules 12a, 14a, 15 (F146's both-anchored sentence replaced; F160 withdrawn); core v21 "Good faith"; paper section 5.1. *To build:* the receipt test in good faith; the anchored-rotation cut-off; undo `vault_at` selection.


## F165. Leftover ties take turns, counted along the split service's receipts (review of F145 to F162, finding 4, 7 October 2026)

**Found by the hostile review of F145 to F162** (finding 4): F150's tie hash is of the receipt, whose signer (the split service) picks its 16-byte salt and can grind the hash until each tie falls where it wants; with equal shares and small payments every payment is a tie.

**Decided (Nobody, allegedly, 7 October 2026): "It does. Extra acts are fine as long as the process doesn't bloat the clients too much":** ties take turns: a tied unit goes to the tied holder with the fewest leftover units from this stake so far, counted along the split service's receipts; equal counts go to the smallest identity hash. Each receipt carries the running count per stake and cites the previous receipt for that stake, so checking a tie needs two acts; a verifier missing the previous one shows that unit as unknown. Payer-side splits keep the hash (the payer steers at most a unit per tie, a stated cost); forks keep the fork act's hash (every member signs it). Asked "How costly is the cost?", the project lead answered: a few hundred bytes per receipt, one extra field, one extra act to check.

**Core changes:** Law draft 10, rule 15a and its reasoning. *To build:* the tally in split services' receipts (format open), the turn rule in `divide_stake`, a test that a service cannot steer ties.


## F166. Coming back defeats an absence declaration (review of F145 to F162, findings 5 and 6, 7 October 2026)

**Found by the hostile review of F145 to F162:** (5) with one accomplice acknowledging it, a declaration anchored during a holiday could be kept and shown months after the party returned (F148 and F158 bound when acts existed, not when they were shown); (6) F158 made a duo's period clause need a keeper or third party, though every collective must carry an absence clause, so a common case needed an added feature, against F159's working rule.

**Decided (Nobody, allegedly, 7 October 2026): "Agree":** a declaration under a period clause counts only while the declared party has no act on the agreement anchored after the declaration's anchor; the party's own anchored act defeats it whenever it is shown. What was put in force while it counted (a clone without the party, at a line or by signatures a keeper recorded) is never undone (Q28). The acknowledgement requirement of F148 and F158, and F158's client warning, are withdrawn; a duo's period clause works with no third party.

**Core changes:** Law draft 10, rules 50 and 51. *To build:* `absence_by_anchors` drops the acknowledgement and checks for a later anchored act of the party; scenario 1's tests follow; the collective client's F158 warning is removed. *For the building session:* what a defeated declaration's outcomes mean for splits paid while it counted, read through "Made before, made after".


## F167. A floor under every format's declaration (review of F145 to F162, finding 7, 7 October 2026)

**Found by the hostile review of F145 to F162** (finding 7): under F149 a format may hide only its declared markup, but the format's author writes the declaration, so a hostile format declares the decimal point or the minus sign as markup and a conforming check passes.

**Decided (Nobody, allegedly, 7 October 2026): "Ok, so narrowing the list looking at what is used in the stuff we're trying to protect from being hidden." "Yes, let's try it, the session will check the details":** whatever its declaration says, a format never hides a letter, digit or combining mark (L, N, M), a currency or mathematical sign (Sc, Sm), the percent and per-mille signs, a character between two digits, or a plus or minus sign directly before a digit. Fable's alternative (ban every P and S) was set aside because markup is itself punctuation. Caveat recorded: a list can miss a case (the project lead first put `%` among maths signs; it is punctuation, Po); a miss weakens protection only against a hostile format, for that character, and plain display stays the fallback.

**Core changes:** Text draft 6, the format task and its reasoning. *To build:* the floor check in the long-form client's `checkBound()`; tests over amounts, dates, percentages and scripts with vowel marks; the building session checks the floor's details and reports any case it misses or any markup it wrongly forbids.


## F168. The review's smaller findings and the build's questions answered (review of F145 to F162, findings 8 to 14; build of F157 to F162, questions 1, 3 to 5; 7 October 2026)

**Suggested by the project lead, in one batch; Nobody, allegedly, 7 October 2026: "Agreed."**

- **8.** A link gives no authority (rule 25), so it never decides anything binding, and a fetch's standing is never needed; Identity rule 26 follows F152 (each half counts once published at its signer's homes; holding one back delays the link).
- **9.** A refund under rule 10a is outside rule 14's pointer selection: its creditor is a bare key.
- **10.** Where the payer divides, the payer decides each tied unit, at most one per tie, a stated cost; no hash.
- **11.** The latest pointer held by any of the payee's own acts on the agreement counts (signature acts, its own offer, later acts); a payee changing wallet has its client sign one act on each agreement citing the new pointer, no clone; rule 12a's reasoning says so.
- **12.** On a rail that binds nothing, a payer can relabel a payment: a stated cost, rare; a rail Module declares whether it binds (FORMAT OPEN).
- **13.** An offer is the payee's own act only if the payee signed it; otherwise the payee's act is its signature accepting it.
- **14.** Editorial: "afterwards" removed from rule 14a; "until" made "unless" in rule 14; freeze scenario 1 follows F166 and runs on stated anchors; the paper's claim 6 tolerance is one unit.
- **B1.** At a fork, members counted alike give leftovers to the first as listed in the agreement in force, an order every member signed.
- **B3.** Answered by 8. **B4.** A private link act signed by a scoped key is invalid (rule 1a); the code refuses it. **B5.** A private link voided by a rotation is void whether or not fetched; the rotation is judged first.
- (B2, a rotation lacking its Identity area's consent, was answered during the build: shown only.)

**Core changes:** Identity draft 11 (envelope section, rule 26); Finance draft 6 (rules 10, 10a, 12a, 14, 14a); Law draft 10 (rule 15a); freeze suite scenario 1; paper claim 6. *To build:* items 9 to 11, 13, B4, B5.


## Review of F145 to F162 (7 October 2026, morning)

A hostile review by Fable, which built none of it (`docs/reviews/f145-f162-review.md`), attacked the eighteen decisions together, after F145 to F162 were built and merged (`docs/decisions-f157-f162-build-2026-10-06.md`, main `b2b79a8`, display client released `9e53e70`). **Six break, two in common cases:** (1) F160: an individual's everyday acts never cite the identity chain where the vault is declared, so no act "holds" a vault; read through the binding, a vault lowered after a theft protects nothing already signed; (2) F157: a person with two devices has two sequences, and the walk follows one, so a deal signed on the phone holds no pointer published from the laptop; (3) F146, F147, F154: a payer can always add a claim citing nothing, and an owner cannot anchor the payer's claim, so the proviso excludes only honest payers and the theft window never shuts; (4) F150: the receipt's signer chooses its salt, so it can choose the tie; (5) F148, F158: a declaration acknowledged by one accomplice can still be kept and used later; (6) F149: a format declares its own bound. Smaller: findings 6 to 14. The build session's own questions (its report, "Questions") are open too. *The decisions were made fast, mostly on the project lead's suggestions; the two common-case breaks follow from his suggestions (F157, F160).*

**All decided:** findings 1 to 14 as F163 to F168; the build's questions as F168 (B2 answered during the build).


## F169. Theft: anchor or bear the loss (the theft window from first principles, 7 October 2026)

**Found:** four rounds of fixes on one question (F133, F138, F139, F145 to F147, F154, F157, F160, F163, F164) each broke in a new place; the second Fable review showed F164 gave the owner a lever. The project lead set out a baseline and a ledger (`docs/theft-window-baseline-2026-10-07.md`), and Nobody, allegedly, took the question "removed from the protocol".

**The principle, decided step by step by Nobody, allegedly (7 October 2026):**
- "Who bears the theft? Of what… a signing key? The owner of the key, no?" The owner bears what the stolen key did.
- "Locks changed, security patched. The person did the work… so the change of lock acts as the 'reported it'."
- "The app is guilty, but cannot be made to bear the loss. So, buyer's choice of app becomes the 'mistake'. In both cases the problem is acting on outdated information."
- On the grey zone (a payment that may have been in the window or after): "a client that plans to execute many transactions and most likely take a cut is responsible to execute it properly. We're back to 'you should anchor, we just don't specify how'."
- "Agreed. But walk it all again one more time yourself to verify the logic." The walk-through withdrew the project lead's refinement (that only voiding a wallet, not lowering a limit, counts as a lock change), since a stolen phone holding the everyday wallet is changed by switching it off; added that an unanchored lock change leaves the owner bearing the window, and that incomparable anchors favour the payer; and stated that an old payment never anchored nor receipted can be put in doubt by a later lock change.
- "Yes, a theft scenario justifies stating 'anchor or bear the loss'."

**Decided:** a lock change is a rotation that voids a payee pointer or lowers or removes a vault limit. Unanchored, the owner bears (payments that followed what was published count). Anchored, a payment it affects counts only where the payee's own receipt (kept line, or split service grant key) or a payer's claim anchored before it shows it. Anchors compare only on one reference; incomparable favours the payer. Clients write the claim at payment and should anchor promptly; how is the anchoring cMIP's business. Stated costs: the owner's lever (bounded by the earlier limit, visible, beaten by prompt anchoring); old unanchored, unreceipted payments.

**Working rule (Nobody, allegedly, 7 October 2026):** "stating that a core action is recommended even if the core does not specify how is fine. Money moves and core never specify how, media moves and the core never specifies how exactly." Anchoring joins rails and media types: the core names the task and what it must deliver; cMIPs and Modules decide how.

**Replaces:** F139, F146, F154 and the rule of F164 (F147's anonymous signature over citations stands; reading several claims together is moot). F160 stays withdrawn.

**Core changes:** Finance draft 6, rules 14a and 15; core v21 "Good faith"; paper section 5.1 and claim 2. *Next:* one hostile review of the whole set by Fable before building.


## F170. Re-pointing deals during the window is the window's cost (review of F163 to F168, findings 5 and 6, 7 October 2026)

**Found by the hostile review of F163 to F168:** (5) F168 item 11's "any later act of the payee's on the agreement" lets a thief holding the signing key sign one act per deal citing the thief's pointer, re-pointing every royalty that falls due in the window, which F157 had closed and which the core, Finance's reasoning and the paper still promised; (6) F163's client rule, in the window, makes the owner's honest device cite the thief's pointer, and "where the payee's pointers are published" was not named in Finance.

**Considered:** (b) requiring the debtor's acknowledgement before a deal is re-pointed (friction on every honest wallet change, partial protection). Asked "All these findings still apply under the changes?", the project lead found that 5 and 6 now fall under F169's principle (the owner bears what the stolen key did until the lock change).

**Decided (Nobody, allegedly, 7 October 2026): "Yes":** both are the window's cost, borne by the owner, bounded per payment by the vault limits; the backlog is protected after the lock change, not during the window. The promises are corrected in the core, Finance's reasoning and the paper. F163's place is named: where the payee's routes act says its Finance acts are found.

**Core changes:** core v21 "Flow and vault"; Finance draft 6, rule 14 and the vault reasoning; paper section 5.1.


## F171. Every holder keeps the tally chain; a reset or fork breaks the plan (review of F163 to F168, finding 7, 7 October 2026)

**Found by the hostile review of F163 to F168** (finding 7): F165's tally chain had no rule for a receipt that cites no previous receipt or forks the chain, so a service could reset the count each time and hand every tie to one holder; two consecutive receipts show consistency, not truth; and a holder paid nothing receives no receipt, so the loser never holds the evidence.

**Decided (Nobody, allegedly, 7 October 2026): "Agreed"** (after "So basically stakeholders build reference chains that is then used to check that the latest receipts are sound?" — yes): the split service delivers every receipt for a stake to every holder, paid or not (client conformance); each holder keeps the chain and checks each receipt on arrival; a receipt not citing the latest for its stake, or two citing the same one, is a deviation that breaks the plan (rule 46b).

**Core changes:** Law draft 10, rule 15a. *To build:* delivery of every receipt to every holder; the deviation check; a test of a reset and a fork.


## F172. Absence returns to the members' chosen judgment; proof by time becomes a module (review of F163 to F168, findings 8 and 9, 7 October 2026)

**Found by the hostile review of F163 to F168:** (8) F166 did not say what a defeated declaration undoes, and the declaration format's "a record naming it counts for nothing" contradicted "never undone"; (9) a duo's period clause became a hair-trigger, and a contest became a defeat even of a rightful declaration.

**Zoomed out at Nobody, allegedly's request ("Let's zoom out on this one too… How did we get to this?"):** the rule approved on 5 October was the authority's judgment, a stated cost accepted by signing the clause, with a visible contest. F136 made absence provable from anchored time; each later fix (F148, F158, F166) answered the one before, and the duo problem was created by F158, not by the original design. Nobody, allegedly: "So, we have an agreement of collaboration, this agreement has a field relating to absence used to define what can be done if a person goes missing. So, how it is setup from various options is the members responsibility."

**Decided (Nobody, allegedly, 7 October 2026): "Yes":** the core returns to the original rule: the declaration is the authority's judgment, checked for signer, outcome and version, a stated cost the party accepted, shown with any contest. Proof of absence by time becomes an optional **absence-proof cMIP** the clause may name (key 3, with its parameters; key 2 retired); where named, the declaration counts only if the cMIP accepts it. A declaration moves nothing by itself: its outcomes take effect only through a record, rotation or clone put in force under it, judged where that act uses it, and no later act undoes it. F136, F148, F158 and F166 (and F162 items 3, 5, 6) move to the absence-proof task.

**Core changes:** Law draft 10, abandonment clause format, rules 50 and 51, the declaration format's record sentence, Tasks; freeze suite scenario 1 step 9 and its pass condition. *To build:* revert `absence_by_anchors` from the core path (keep it as a reference absence-proof module, if useful), remove the collective client's period warnings, retire key 2.


## F173. Anchoring moves to the Envelope (review of F163 to F168, finding 2, 7 October 2026)

**Found by the hostile review of F163 to F168** (finding 2): anchoring was a Law task, while Finance (F169's lock change) and rotations rely on anchors; Finance promises never to depend on Law, and "anchored" named no reference.

**Decided (Nobody, allegedly, 7 October 2026): "Agreed. It fits as it is 'media' and then all layers after it can leverage it":** the anchoring task moves to the Envelope: a cMIP accepts any act id and produces proof that it existed by a point on a named time reference; anchors compare only on the same reference; anyone may anchor any act. Law keeps its time references and deadlines on top of it. Identity's validity still does not depend on it (F63).

**Core changes:** Envelope draft 7, Tasks; Law draft 10, Tasks. *To build:* the anchoring interface in the core library's Envelope part.


## F174. The second review's smaller findings (review of F163 to F168, findings 3, 10 to 14, 7 October 2026)

**Suggested by the project lead in one batch; Nobody, allegedly, 7 October 2026: "All agreed."**

- **3.** A payee's own receipt also counts when signed with a key its chain binds after the rotation; "a grant key the chain still holds" becomes "a grant key whose grant still stands".
- **10.** The text floor forbids hiding a mathematical sign only next to a digit, so `<` and `>` stay usable as quote and link markup; currency signs stay always protected.
- **11.** The floor also covers a plus or minus before a currency sign or after a digit, a full stop or comma before a digit, brackets around an amount, a space or apostrophe between two letters, and question and exclamation marks.
- **12, 13.** Rule 15 points to rule 14's selection; a refund to a bare key is carried into rule 7 (and so outside rule 12a).
- **14.** Freeze scenario 1 step 5c follows F169 and says the rotation is anchored; the stake line and Law's reasoning heading say "turns"; the paper's claim 2 states that a thief's offer acknowledged after the rotation stays visible as disputed, though no money under it counts against the owner once the rotation is anchored.

**Core changes:** Finance draft 6, rules 7 and 15; Text draft 6, the format task; Law draft 10, reasoning; freeze suite; paper claim 2.

**With F169 to F174 the second review's findings are all decided.**


## F175. The F163 to F168 build's remaining questions (7 October 2026)

**Found building F163 to F168** (`docs/decisions-f163-f168-build-2026-10-07.md`, on branch `build-f163-f168`): the report reached the project lead after F169 to F174 were decided; checked against them, its F166 questions (8 to 12) are moot under F172, question 14 is settled by F174, question 6 by F171, F167 questions 1 and most of 5 by F174.

**Suggested by the project lead; Nobody, allegedly, 7 October 2026: "All agreed":**
- **F167 (2, 3, 4, 5).** A line break that ends a block may be hidden between two digits (a new block is shown); emphasis or code markup between two digits is refused; any run of hidden characters between two digits is covered; the dash-like minus signs (U+2013, U+FE63, U+FF0D) and the per-ten-thousand sign join the floor.
- **F165 (7).** Under the default rule every leftover unit goes exactly where rule 15a sends it; a unit sent elsewhere is a deviation (as built).
- **F169 (from 13).** Where several anchored lock changes affect a payment, it counts only if the claim is anchored before the first of them.

**Core changes:** Text draft 6, the format task; Finance draft 6, rule 15; Law draft 10, rule 21.


## F176. Name your services, name your clock (whole-set review, finding 1, 7 October 2026)

**Found by the whole-set review** (`docs/reviews/whole-set-review-2026-10-07.md`, finding 1): nothing named the reference a lock change and a claim are compared on, and incomparable anchors favoured the payer, so a colluding payer anchored on a reference the owner never used and the owner bore the window despite anchoring.

**Decided (Nobody, allegedly, 7 October 2026), after a walk: "Yes, name your services, name your clock.":** the owner declares the clock (the anchoring references, each an anchoring cMIP and its time reference) in the identity chain's declarations slot with the safety key, as the vault (Finance kind 1). A lock change counts as anchored only on a declared reference; after it, a claim anchored on none of them is not protected; a payee with no declared clock has chosen no protection and bears; a payer's client must read the clock before paying.

**Working rule (Nobody, allegedly):** "name your services, name your clock": what is compared between parties is named in advance by the party a thief cannot be.

**Core changes:** Finance draft 6, the clock declaration and rule 15. *To build:* the clock declaration, the comparison on declared references, the payer's client reading it.


## F177. The locks count as changed when a home's receipt is anchored (whole-set review, finding 2, 7 October 2026)

**Found by the whole-set review** (finding 2): an anchor proves an act existed by a point, not that anyone could see it; an owner could sign and anchor a lock change on Monday, keep it back, receive payments all week from promptly anchoring clients, and publish it on Saturday, putting every payment after the lock change.

**Decided (Nobody, allegedly, 7 October 2026): "We can assume that a sub fork will align on important matters such as clocks. It's a bit like signed receipts on important letters. It is not when you send the letter that matters, but when the receiving has been confirmed.":** a lock change's point is the earliest anchored home receipt for its rotation, on the declared clock; a rotation kept back has no point. For a self-hosted identity, the rotation's own anchor is its point, a stated cost of that trust model. Recorded with it: communities are expected to align on common clocks, so incomparable references should be rare in practice.

**Core changes:** Finance draft 6, rule 15. *To build:* the lock change point read from anchored home receipts.


## F178. The whole-set review's wording and small calls (findings 3 to 17, 7 October 2026)

**Suggested by the project lead in one batch; Nobody, allegedly, 7 October 2026: "English is my third language, even though I am more than fluent. These kind of small corrections get approved with curiosity."**

- **3, 4.** Where rule 15 counts a payment as made, its version is selected from the payee's acts as they stood before the lock change, voided ones included, so a debtor who paid a deal re-pointed in the window does not pay twice; otherwise, for money, an act the rotation did not keep holds no pointer, signs no receipt and selects no version, whatever acknowledgement keeps it visible.
- **5.** A lock change is defined by its effect: any rotation after which a payment that followed the chain as published before no longer follows it after.
- **6.** "Before or at the lock change's point"; each act judged by its earliest anchor.
- **7.** The owner's lever stated at its true size: every unreceipted, unanchored payment the lock change affects.
- **8, 9, 10, 13.** The paper's claims 2 and 5, the Production task table (anchoring under Envelope; absence proof as task 14), the core's task and judge lists, and freeze scenario 9b follow F172 and F173; period mentions removed.
- **11.** Before a party signs terms with an abandonment clause, its client must show in plain words who may declare it absent, with which outcomes, and whether an absence-proof cMIP stands between (rule 49).
- **12.** An absence-proof cMIP judges only the acts the history of the record or clone using the declaration holds, so "never undone" stays true.
- **14.** Absence proof is a judicial task: a judge never handles what it judges, and the chain of judgment applies.
- **15.** The running count is a field of the split act; the split format's rounding sentence follows F175.
- **16.** Each format's declaration says which of its hidden characters end a block; the percent signs are listed by code point.
- **17.** The long-form format shows a link's closing `>` next to a digit (cosmetic; the format may choose another closer).

**Core changes:** Finance draft 6, rule 15; Law draft 10, rules 15a, 49, Tasks, split format; Text draft 6; Production draft 6, task table; core v21; freeze suite 9b; paper claims 2 and 5. *Next:* one more hostile pass on rule 15 alone before building, as the review suggests.


## F179. One clock, with a backup used only when it fails (rule 15 review, finding 1, 7 October 2026)

**Found by the rule 15 review** (finding 1): a clock naming several references let a payer anchor on the one the owner did not, and the rule named no reference that decides.

**Considered:** one clock only (a single point of failure: a dead clock at a theft leaves the owner bearing); several clocks all anchored (heavier). Asked "When would the need of anchoring on ALL clocks truly surface?", the project lead answered: only with a theft and a dead clock at once, or payers on another clock.

**Decided (Nobody, allegedly, 7 October 2026): "Can we have a back up clock? And only anchor that one rarely when truly needed?" … "Back up service as added security. We used it in the last didn't we?":** the clock names a main reference and, optionally, a backup, in order, with the safety key. Comparison is on the main one where the lock change is anchored there; otherwise on the backup, and then a payer's claim anchored on the main one also counts. The owner's client anchors on the main one, and on the backup only where it cannot use the main one. The same pattern as the chain of judgment (F121), a deal's backup split service (F130) and the vault's several entries per unit.

**Core changes:** Finance draft 6, the clock format and rule 15.


## F180. The locks count as changed when the home quorum is met (rule 15 review, finding 2, 7 October 2026)

**Found by the rule 15 review** (finding 2): "the earliest anchored home receipt" let a home the owner runs receipt a rotation days before the public homes held it, so the point came before the rotation counted under its home rule and before payers could see it.

**Decided (Nobody, allegedly, 7 October 2026): "Or when Home quorum is met. (If that is the right word)":** the lock change's point is when its home quorum is met and anchored: the receipts the home rule requires for the rotation to count are all anchored, each passing Identity's checks; with a single home, that home's receipt. "Quorum" is the right word: the smallest number of homes whose receipts make the rotation count.

**Core changes:** Finance draft 6, rule 15 (refining F177).


## F181. The rule 15 review's remaining findings (findings 3 to 8, 7 October 2026)

**Suggested by the project lead in one batch, weighted words called out; Nobody, allegedly, 7 October 2026: "Agreed"** (after asking "Is the disowning a problem in itself?": no; disowning is needed because a thief signs on the owner's own kept line, and its abuse is the owner's lever, public forever, needing the safety key, beaten by an anchored claim).

- **3.** The owner's lever stated at its true size: every affected payment whose receipt the rotation did not keep, disowning its own receipt included, and whose claim is not anchored by the point.
- **4.** One reach: a lock change affects a payment that followed the chain as published immediately before it and no longer follows it after.
- **5.** Rule 12a reads the pointer and vault rule 15 selects for that payment, as the chain stood for it.
- **6.** After a lock change, the owner's client **MUST** obtain the quorum's home receipts and anchor them on the main reference (client conformance); before genesis or a rotation leaving no clock, the client **SHOULD** say plainly that a theft's loss will be the owner's.
- **7.** A clock entry names the anchoring cMIP and its parameters (one time reference), as Law's time reference does.
- **8.** Editorial: the core's "Good faith" and "Flow and vault", the freeze suite's step 5c (the contributor declares a clock) and Finance's scenario list follow F176 to F181; rule 15 says what "anchored" means at its first use.

**Core changes:** Finance draft 6, the clock format, rules 12a, 14b and 15, scenario list; core v21; freeze suite 5c. **With F179 to F181 the rule 15 review is answered.**


## F182. The F169 to F181 build's questions (7 October 2026, afternoon)

**Found building F169 to F181** (`docs/decisions-f169-f181-build-2026-10-07.md`; merged `427e5c7`, display client released `65cbafe`, main green at `3701a14`; Rust 403, TypeScript 172, verifier2 0 disagreements on 4,000 histories). **Suggested by the project lead in one batch, weighted words called out; Nobody, allegedly, 7 October 2026: "All agreed."**

1. A lock change anchored only on the backup: a claim anchored on the main reference counts, whatever its point.
2. A homeless rotation's point is read from the new homes' quorum under the new rule.
3. A payment a lock change affects stays affected, even if a later rotation would let it follow the chain again.
4. The entry-less vault payment form is dropped (test-only).
5. The running count is split key 4, `[+ [ stake, [+ [ holder, count ]] ]]`, the count after this split.
6. "Receipt" in rule 15a means the split act.
7. A reset or fork is shown on every split involved; each holder's client names the second.
8. After a deviation, the reference stays the last split that continued the chain; splits from a payer's claim are in the chain; a new holder starts with a warning.
9, 11. Where the floor forbids hiding a markup character, the format shows it as text rather than refusing the document.
10. A block break inside a run between digits: the whole run is excepted, as built.
12. The readings confirmed; the minus look-alikes U+2010, U+2011, U+2012, U+2796 join the floor; "- 5" stays a stated miss (it is also list markup).
13, 15. Confirmed as built.
14. Absence proof is task 14; a chain of judgment names it as any judge.
16. A client **MUST NOT** sign terms naming an absence-proof cMIP it does not implement.
17. The reference absence-proof module stays in the repository as an example, not a specification.

**Core changes:** Finance draft 6, rule 15; Law draft 10, rule 15a and Tasks; Text draft 6, the format task. *To build:* 1, 2, 4, 8, 9 to 12, 14, 16.


## F183. The F182 build's questions (7 October 2026, afternoon)

**Found building F182** (`docs/decisions-f182-build-2026-10-07.md`; merged `229c1d6`, display client released `3c5efb0`, main green at `51c04ba`; Rust 407, TypeScript 172, verifier2 0 disagreements). **Suggested by the project lead; Nobody, allegedly, 7 October 2026: "All agreed."**

1. An absence-proof cMIP is named only in the abandonment clause's key 3; terms field 2 naming task 14 is refused (as built).
2. Law's `judge` CDDL comment names task 14 (editorial, done).
3. A line starting `>` before a digit is not a quote; the `>` is text.
4. Several pieces of markup between two digits: the first piece on the line becomes text (long-form cMIP rule 11a).
5. A holder whose first split deviates keeps "no good split yet"; the next split must cite none.
6. The long-form cMIP's revision in place (rules 5, 10, 11a and the markup declaration) is approved.

**With F183 the theft, absence, splits and text work of 6 and 7 October is decided and built.**


## F184. Rewarding the helpers along the pipe (7 October 2026, evening; open, high priority)

**The question, from Nobody, allegedly:** "The water has to reward everyone along the pipe if wished to." Can a split plan pay every party that helped a payment happen, including ones not known when the plan was written (a reposter, the client used to read)?

**What the core already gives** (Law draft 10, Finance draft 6): stakes; a named receiver holding no stake (`[ 2, receiver, part ]`), which covers helpers known at publication (the publishing client, the formats and cMIPs used, the homes, a community fund); a collective as a stake holder, so money flows upstream; small shares held as open obligations (scenario 4d); every split shown to every holder. Role shares (`[ 1, role, part ]`) pay a role filled at payment time, on evidence signed by someone other than the split service and the payee (rule 22).

**The gaps found:**
1. **One referral per claim** (Finance, claim key 6): only one helper known at payment time can be evidenced, so a chain of reposts pays only its last link, and the reader's client has no slot at all. The gap was filled by assumption, never decided: that "last click" is enough, and that clients earn outside payments.
2. **No reward by contribution over time.** A split divides each payment as it arrives; a split cMIP declares only its remainder rule (rule 21), never weights drawn from evidence. A community can collect a fund but cannot share it out by counted work (for example, a relay fund shared by deliveries) inside MOR.
3. **Rewarding helpers who do not exist yet.** Rewarding the past is one thing; the plan must also be able to promise a reward to helpers yet unknown, and keep that promise checkable.

**Stated cost to be written down whatever is chosen:** the payer's client writes the evidence for payment-time roles. A dishonest client can name its own operator or fake helpers; this hurts the owners and the real helpers, never the payer, so the payer has no reason to police it. The owners' only bound is the size of the parts they offer. (The self-referral was accepted as a cost in the author's earlier work on Nostr.)

**Decided by Nobody, allegedly:** the core stays out of defining participants, but **the grammar to support those who will must be in the core.** Role names belong to cMIPs. Looking forward, to helpers not yet known, is the key requirement. A high priority.

**Suggested by the project lead, not decided:** the claim's referral becomes a list `[+ [ role, identity, evidence ]]`, signed by the payer; a way for a split cMIP to weight payouts by evidence over a period. Neither is to be written until Nobody, allegedly, has fleshed out the principle; then one hostile review of the incentive layer as a whole, not item by item.

**Tracing the chain (same evening).** A free video with donations, a lone poster, free clients and relays: (a) a lone poster has no Law agreement, so a tip has no split plan and rewards nobody but the poster, the most common case failing by default; (b) Law names "a relay's signed delivery record" as evidence (rule 19), but no MIP or cMIP defines it; (c) what happens when the video is watched (the reading client, the serving relay, the repost followed) leaves no evidence of its own, but is known to the payer's client at the moment of paying, and is written there, in the claim, on the payer's word; (d) a repost is "a reference to a publication" (Envelope rule 5), so a chain of reposts forms only by client habit: nothing gives a reference the meaning "I came through this one", and a reposter may cite any repost.

**Principle, stated by Nobody, allegedly:** "We cannot force people to use it only in a healthy manner, but we can make it legible." The incentive layer is left to the developers who think about rewarding the pipe; his expectation is that they make the most productive area of the network, and over time possibly the healthiest. *Project lead's caution, recorded with it: legible is not the same as deterred (Steem's curation was on a public chain and was still gamed), so the expectation is a hypothesis to be stated as one, and legibility counts only where a client shows it and the cost of gaming falls on whoever chose the plan.*

**The building ground, stated by Nobody, allegedly:** "When I look at MOR I imagine a diversity of ethos and wish to see them compete. It's a building ground." Corrected the same evening: "It's pay the pipe if you wish to", **the choice applied to the builders, not the users**: the ethos compete among those who build clients, relays and incentive layers; users choose among what is built. **And a builder's choice must be legible to those who wish to poke** (Nobody, allegedly): what a client does with a tip, who it pays and why, can be found and checked by anyone who looks. *Open question for 8 October: how a builder ships "pay the pipe" as a default for its users, with no agreement formed by each poster.* *Raised by the project lead at the close: every tip has two builders behind it, the poster's client and the viewer's; if the viewer's client pays the pipe from the tip, the poster never agreed; if the poster's client sets the split, the viewer's has no say. Which choice wins where two ethos meet on one payment?* Nobody, allegedly: "I don't see a way out of it. It's maybe even a dangerous idea." Left open overnight. Then, on why it felt dangerous: "bad actors are expected. The worst kind, those who pretend to be good actors for years until they pull the rug" (a builder's default is trust placed by many at once; a silent change cashes it in). **Direction, decided by Nobody, allegedly: "Let's keep the mechanics solid for those who wish to form good partnerships knowingly."** The grammar serves partnerships each party enters knowingly; defaults set on others' behalf are not what it is built around. **And the core must stay safe for the bigger, more serious users, "let's call them pros"** (Nobody, allegedly): nothing added for the pipe may weaken what professional partnerships rely on (agreements, splits, the theft rule, endings). *Test drawn from it for the grammar, suggested by the project lead: it must let opposite ethos be built on it with equal ease (pay the whole pipe, pay only the poster, pay by contribution over time), favouring none, and must let anyone leave one for another, taking their work and agreements with them.*

**The danger, located (close of 7 October).** The scenario explored was the free v4v economy, whose nearest likeness is the street performer; Nobody, allegedly, felt that serving it was threatening professionals doing real business, without seeing how. Located by the project lead, and confirmed by Nobody, allegedly, as matching the feeling: two of the evening's suggestions changed the shared core to serve the street performer. (1) A lone poster's simple split plan would be a second, lighter way of dividing money beside Law's, without the agreement, grant and visibility that make Law's split safe, and usable to avoid it. (2) Turning the claim's referral into a list widens the payer-written evidence in every split, a professional's purchases included. **The safe shape:** a performer's hat holds money given to the performer, who may share it afterwards. A tip needs only Finance and the payee pointer, so the free v4v economy is built in cMIPs and Modules on top of tips, and competes there; the core changes for it only where something is impossible without a change, and then never touching purchases, agreements or splits. **This is the opening line for 8 October.**

**Morning of 8 October: the case studies already hold the shower.** Nobody, allegedly: the panic of the night before was "the shower does not hold", but a case study outlines how it could work. *Read by the project lead:* the cat video case study (09) is the farmer's cart, then the partnership: a lone poster's tips go to him alone, a repost pays nobody by itself, and when he needs help he forms a collective whose agreements, entered knowingly, split the money. The advertising case study (15) puts helpers known only at payment into role shares, with attribution left to an attribution cMIP (last, first, or shared among every referrer the buyer's client recorded), the buyer's wallet signing the referrers. **One conflict, flagged:** the "shared" option needs several referrers on one payment, and Finance's claim carries one (key 6). The case study promises what the core cannot carry, and it is a professional's case (a brand's standing offer), so the evening's reading that a list of referrers serves the street performer at the professionals' expense is at least partly wrong.

**The case study Nobody, allegedly, meant: software (19), "Paying the ones everything stands on".** It holds the shower as lineage: dependencies are lineage, and when software earns, each level pays its immediate parents, and each parent pays its own; whether it does is decided by the paying agreement, entered knowingly, and the core guarantees only that paying or not paying is visible. Rewards attach to settlements, never to usage counts. This is "pay the pipe if you wish to", the builders' choice, legible, and the core already carries it. *Read by the project lead:* (1) gap 2 above is likely no core gap: the case study's pooled module has the payer compute weights from its own builds and pay, or write them into a plan, which needs no new grammar; (2) a stale line to fix in the redraft: "each module's use is evidenced by the module's own signed record" contradicts F112 and F116 (a Module signs nothing; a rail Module's use is evidenced by the receipt or claim naming it).

**9 October 2026: what remains of F184.** *Read by the project lead, confirmed by Nobody, allegedly:* the fear of 7 October ("the shower does not hold") was settled by the software case study; two concrete gaps remain, neither from fear: (1) the advertising case study's "shared" attribution needs several referrers on one payment, while a claim carries one: **kept for the case-study redraft**; (2) Law names "a relay's signed delivery record" as evidence (rules 19, 22; the role share definition), and nothing defines it.

**(2), decided by Nobody, allegedly, 9 October 2026 ("Yes"):** the **delivery record** is defined in the relay transport cMIP: a relay's signed act saying it served a file for a request; **it counts as evidence for a relay's role share only when the payer's claim acknowledges it** (a claim is a Finance act, which may carry acknowledgements, Envelope rule 4a). *The project lead's reasoning:* a relay's own signature alone would let it claim deliveries it never made ("paying for usage invites faking usage"); the confirming signature comes from the other side of the deal, as for the referral (F75); no new core grammar; a claim may acknowledge several records, so several relays can share one payment. *Noted for (1), not decided:* the same acknowledgements might carry several referrals.

**Written in, 9 October 2026:** `cmips/cmip-relay-transport-draft-3.md` (not yet approved): the delivery record, type 0 of the cMIP, `[locked hash, size, client's nonce]`, signed by the relay's operator identity; asked for by `POST {base}/delivery-record`; counting only when the payer's claim acknowledges it; several records in one claim; the stated costs. *Still to align (the next building session, since Law is being edited now):* Law rules 19 and 22 and the role share definition say the relay's delivery record counts once acknowledged by the payer's claim.

**Next, decided by Nobody, allegedly:** taken up on 8 October 2026, straight after the collective client human test (step 11b).

**Written into Law and built, 9 October 2026** (`docs/f190-build-2026-10-09.md`): Law draft 10, the role share and rules 19 and 22: a relay's delivery record counts as evidence for a relay's role share only when the payer's claim for the payment acknowledges it, and the object it names is the one the payment was for; the split reading in the core checks it, given which specification is the relay transport cMIP (a fact the verifier states, as for push rails). Freeze suite step 2.4f. *Question QG3 raised:* a verifier not told which specification is the relay transport cMIP still reads a delivery record as any third party's act.

## F185. A broken collective, and its way back (8 October 2026, evening)

**Found building the fix for the step 11b human test** (`docs/step-11b-false-mark-2026-10-08.md`, merged `b081a50`): rule 37 says that where a rotation declares an agreement that fails it, "the collective's acts that need member signatures count for nothing", and says nothing of what comes next. The core reads such a collective as broken for good.

**What broken is, set out by the project lead:** the collective's keys moved (Identity counts the rotation) without the consent Law requires (the agreement it declares fails rule 37): Identity and Law no longer agree on who is in. Breaking the collective is what makes such a move worthless, where ignoring the failed declaration would let the holders of the safety key rotate a member out of the keys at no cost.

**Decided by Nobody, allegedly, in principle:** technical errors will happen, so a broken collective has a way back, and that way back is **a rollback**: "The chain needs to fork from one act before the corrupted one, all while showing the corrupted one. I'm not saying mechanically that is what happens, but that is what the collective faces, a rollback." Nothing is erased: the corrupted acts stay visible, counting for nothing.

**Mechanics suggested by the project lead, not yet decided:** the identity chain cannot un-rotate (its keys moved, and an identity fork is a conflict), so the rollback happens in Law: a later rotation declares a clone whose parent is **the last valid agreement**, skipping the failed one, complete with the signatures that agreement requires (its own voices, so a member rotated out without consent must sign the way back). The agreement's lineage forks from before the corruption; the identity chain carries on; every act of the broken stretch stays shown and counts for nothing in Law.

**Decided by Nobody, allegedly (same evening):** "Whatever was in vigor just before the broken act needs approval of all involved before the broken act. The broken act is simply void by unanimous agreement, and always referenced." So: the identity chain carries on; the rollback is a clone of the agreement in force just before the broken act, **approved by every party of that agreement, unanimously** (not by its ordinary change rule); the repair **names the broken act**, which it voids, and which stays visible.

**Corrected by Nobody, allegedly, at once:** "Sorry, the constitutional powers need to be met." Not unanimity: the rollback needs **the constitutional change rule of the agreement in force just before the broken act** (rule 44c), counted among the voices that remain (rule 44d), so a party declared absent under that agreement's clause, or departed on a line before the broken act, no longer blocks it. By default that rule is every party whose voice remains.

**Leaving a broken collective (the build's second question). Decided by Nobody, allegedly:** yes: during the broken stretch a resignation names the agreement in force just before the broken act, and takes effect at the collective's next valid line, normally the rollback. *His check, "what if the resignation breaks the needs of the constitutional layer?", answered by the project lead from the texts:* it cannot make the constitutional rule impossible, since a number is counted among the voices that remain and asks for all of them where fewer remain than it names (rule 44d, flaw C; `Rule::needed`); only when every voice has gone does nothing meet it, and then no rollback is possible and the members keep their stakes as departed holders (rule 46b). Where a departure takes away a share of the collective's key that the rollback's rotation needs, the key grammar's own way through applies (rule 37a: a resignation counts like a loss for an escrowed share). Neither case is new to a broken collective.

**When every member resigns** (asked by Nobody, allegedly: "what happens to the works?"). *Read by the project lead:* the works stay published and claimed; every former member keeps its stake as a departed holder (rule 46b); a split service named in the founding terms holds a grant tied to no area, so money under offers already published can keep flowing (to be checked); nothing else can be decided, a release to the public domain included, since a collective owner releases by its own rules (N7) and no voice remains. **Decided by Nobody, allegedly: no new rule.** "Someone with stakes in works worth keeping does not resign." A **stated cost**: when the last voice leaves, the collective's works are frozen as they stand. **Client conformance, suggested by the project lead and approved by Nobody, allegedly ("It acts as an: entering danger zone"):** where the member resigning is the last voice that remains, the client MUST say so in plain words before signing: the works will be frozen, and nobody will be able to change, release or move them.

**What rollbacks open (reviewed the same evening, at Nobody, allegedly's question).** *Set out by the project lead:* for the good, mistakes become survivable, a key grab becomes worthless, competing clients can fail without bricking their users, and the broken stretch stays legible. To watch: (1) **the hold-out**: a member whose signature the rollback needs can ask a price for it; the same veto it has over any constitutional change, worth more on a broken collective; (2) **break and hold**: holders of enough of the safety key could break the collective on purpose and refuse the repair, freezing a decision they dislike while staying in (they could brick it before F185 already); (3) **dealings during the broken stretch**: agreements, releases and grants signed then count for nothing in Law; money received still counts in Finance (rule 10); what a rollback does with grants and records of the stretch is for the building session to raise; (4) **pressure to turn repair into undo**. (1) and (2) are to be written as stated costs. **Decided by Nobody, allegedly, for (4): a rollback voids only an act Law reads as broken, never a valid one.** *Repair, not undo: finality stands (a complete ending is final, IT1; a signature placed counts).*

**Attempts at a rollback of one's own** (Nobody, allegedly: "it is assumed that people will attempt rollbacks of their own, right?"). *Set out by the project lead:* a rollback naming an act Law does not read as broken is rejected, and being a rotation declaring an agreement, it is itself a broken act: the attempt freezes the collective, visibly, and is repaired by a rollback to just before it; a break made on purpose reaches back no further than the agreement in force just before it, which holds every valid decision made until then; a person has no rollback. **Client conformance, decided by Nobody, allegedly: a client MUST NOT propose a rollback unless Law reads the collective as broken.** "Does not mean that a client will comply": a client that does not comply makes its user's attempt fail as above, visibly, at the attempters' cost.

**Written in and built, 8 October 2026** (`docs/f185-broken-collective-2026-10-08.md`): Law draft 10 rules 37, 37a and the new rule 37d, the rollback's Law declaration `[clone, [+ hash], broken, [* hash]]`; core v21; freeze suite v21, step 3.7w; the core library, its bindings, the repo client and the collective client (a rollback proposed and reviewed in plain words, only where Law reads the collective as broken; leaving during the broken stretch; the last voice warned). The hold-out and break-and-hold written as stated costs. Building it showed that an act of the broken stretch must place no signature, which "counts for nothing" already says; rule 37d now says it outright. Questions left open for Nobody, allegedly (RB1 to RB6), and readings to confirm, in Law's "Open in this draft".

**RB1 to RB6, answered in two rounds** (`docs/two-rounds/`, 8 and 9 October 2026). **Agreed in both rounds, by Nobody, allegedly:** a broken collective is **quarantined**: a grantee's acts during the broken stretch count for nothing, and the grants work again after the rollback, which restores every condition as at the act before the break (RB1); what others relied on is signed anew after the rollback (RB2); the last voice's warning is given too where the last member holding constitutional power leaves while others keep voices in their areas, "You are about to break the collective" (RB5); a broken collective cannot fork or close before it is fixed (RB6). **RB2's follow-up, decided by Nobody, allegedly, 9 October 2026 ("Yes, if it can be handled by the network"):** every payment the collective received during the broken stretch is no purchase and is **owed back** to the payer (as Finance already says of a payment that is no purchase), unless the sale is signed anew after the rollback; until settled it stands as a visible open obligation. *The project lead's note on "handled by the network": the network records and shows the debt and the payer's claim; it cannot force a payment back, as with every obligation in MOR.* **RB4, one round only (9 October):** a rotation whose declaration is missing or unreadable is a break ("technical, where the other was human error"); **confirmed the same morning: it has the same way back, the same rollback** ("Yes, broken is broken"). **RB3, decided in a third round, 9 October 2026** ("Agreed. On paper it seems right"): the rollback may register a declaration of absence made during the stretch under the last valid agreement's clause, exactly as outside the stretch; **client conformance: a declaration naming a party MUST always be shown to that party, broken collective or not, with the way to contest it.** *Corrected in the third round:* under rule 52 (F172) a contest shows a declaration, it does not void it; a wrongly declared member regains their voice only by a later version naming them. *Reasoning, the project lead's:* a faction that is the absence authority could already declare a member absent falsely with no break, so the break adds steps, not power; the new risk was attention, which the client rule closes.

**RB1 to RB6 written in and built, 9 October 2026** (`docs/f186-rb-f187-build-2026-10-09.md`): Law draft 10 rules 37, 37a, 37d, 38, 47a and 52, and "Collectives in the identity chain" (the rollback's fourth element names declarations of absence and their signature acts, which it places); core v21; freeze suite v21, step 3.7w; the core library (grantees' acts of the stretch void, payments received in it owed back, `owed_back`; a rollback registering a declaration; a technical break with a rollback), its bindings, and the collective client (owed back and declarations shown, with the way to contest; a declaration in the stretch registered by the rollback; the last constitutional voice warned; no fork or closing before the rollback). Questions BQ1 to BQ6 and readings left for Nobody, allegedly, in Law's "Open in this draft".

## F186. Two complete versions of one deal (8 October 2026, evening)

**Found discussing F185** (can a simple agreement break?). A deal cannot break: it has no keys of its own, and a change that is not complete, or carries a false mark, is a draft or invalid and changes nothing (rules 45, 45a, 45b). *But the texts were found silent* on a deal with **two complete clones of the same parent**: rule 45 says a complete clone closes the parent, and with no clock nothing says which closed it first; rule 47 settles forks for collectives only. It needs every party to sign both (two devices out of sync, a careless client, or one party in bad faith with the other mistaken).

*Two rules set out by the project lead:* (A) a party's first signature counts, which fails where a party's two devices leave its two signatures unordered; (B) a fork waits for a choice, the shape of rule 47 and IT1.

**Decided by Nobody, allegedly:** "If there is a fork with two tips of the same length, the point before the fork is the reference. But as soon as one of the branches grows, the other is discarded." So: where two complete clones of the same deal share a parent, **the parent stays in force while the branches are of equal length; once one branch is longer, it is in force and the other is not.** *Made precise by the project lead, to be confirmed in writing it in:* a branch grows only by a **complete** clone (signed by every party whose voice remains, rule 45b), so no party can grow a branch alone; length is counted in complete clones from the shared parent.

**Written in, 8 October 2026** (`docs/f185-broken-collective-2026-10-08.md`): Law draft 10 rules 5, 45 and 45b, with the project lead's precision written in to confirm (a branch grows only by a complete clone; length counted in complete clones from the shared version); core v21; freeze suite v21, step 1.7a. Written beside rule 47, it differs in seven places, left as questions for Nobody, allegedly (Law, "Open in this draft", DF1 to DF7): growth by parties who never saw the other branch; the length rule against rule 47's one resolving step; whether a discarded branch can come back; a branch that forks again; a deal's own concurrency rule; its keepers; and what was done under a branch not in force. Not built yet: the core still leaves the version before a deal's fork in force for good (audit R5b).

**Answered in two rounds** (`docs/two-rounds/`, 8 and 9 October 2026; DF1 to DF7 taken from first principles). **Agreed in both rounds, by Nobody, allegedly:** while a deal has two branches, the version before the split holds (A1); once settled, settlement is final, and a branch not chosen never comes back (A3); what was done under either branch counts, since every party signed both, and Law and Finance cannot be separated here; clients catch the fork and raise the alarm (A4). **Differing between the rounds, then decided by Nobody, allegedly, 9 October 2026 ("The bad faith cases push me towards b"):** a split is settled **only by a version that names both branches**, so every signer saw the choice (A2). *This replaces the reading "once one branch is longer, it is in force" decided on 8 October. The project lead's reasoning, recorded with it:* under "the next complete version on one branch settles it", a party in bad faith can steer an unaware partner into settling the fork with a harmless change, and a verifier holding one branch only sees no fork at all; one act naming both tips makes the choice knowing and the settlement checkable. *Its cost:* a version may name, beside its one parent, the other branch's tip it settles (grammar to be written). *To reconcile in writing it in:* A1 beside A4 (what a new act follows while the branches stand, given that acts under either branch count).

**A1 beside A4, decided by Nobody, allegedly, 9 October 2026:** while the fork stands, a new act may follow either branch, and counts; **the buyer is protected from the parties' human error**. "I'd like the before split to always count, but it cannot due to the decentralized nature of the network. So, this scenario has to be accepted, the buyer should be protected from the human errors." The version before the split is the last version every party agrees on: the point the settling version names, and what a verifier reports as the unforked state. *His question:* can such a purchase act as the alarm bell for the sellers, who may not see the fork themselves? *The project lead's answer:* yes, with no new grammar: a payment under an agreement names the version it followed (Finance, the claim's field 4, and the receipt), so a purchase under the other branch reaches the sellers as signed evidence of the fork. **Client conformance, decided by Nobody, allegedly, 9 October 2026: a seller's client, and a split service, MUST raise the alarm when a payment names a version of the deal that does not descend from the version they hold, showing both branches and pointing to settling the fork.** "They are the participants who can look for the full picture if made aware of the need to look."

**Written in and built as decided, 9 October 2026** (`docs/f186-rb-f187-build-2026-10-09.md`): Law draft 10 rules 5, 45 and 45b, with terms field 26 (settles); core v21; freeze suite v21, step 1.7a; the core library (`deal_state`: the reference, either branch counting, settlement by a version naming both branches, final; the undecided shapes refused), its bindings, the repo client (`sellerAlarm`) and the desk (the alarm on every payment received). The invariants' deal oracle rewritten from the text. Questions DQ1 to DQ8 and readings left for Nobody, allegedly, in Law's "Open in this draft". No split service for deals is built: its half of the conformance is the core reading a service would call.

## F187. Fable's review of the step 11b fix and F185 as built (9 October 2026)

**Review:** `docs/reviews/f185-rollback-review-2026-10-08.md` (merged `e568884`). The step 11b fix holds: the client could not be made to sign a change Law refuses, and a rollback cannot undo a valid act. **Four breaks, code faults to fix with no decision needed:** (1) the rollback's members come from this device's copy and can deal a share of the new safety key to a member who already left: take them from Law's voices, the departed written to field 22; (2) the rollback's checks do not cover the resignations it registers, and the client reports success on a rollback Law refuses: check every registered act against a fresh reading before the rotation, and report from Law's reading; (3) the last voice's warning misses resignations published from other devices; (4) leaving while Law cannot be read names this device's copy of the agreement, with no warning: name Law's agreement where Law can be read, and say so where it cannot.

**Five small items, suggested by the project lead and accepted by Nobody, allegedly, 9 October 2026 ("Accepted"):** (5) the broken clone itself is refused as a rollback's clone, as the text says; (6) a departing member's signature placed before the rollback counts as at every other line (C2): the text changes to match; (7) an act of the broken stretch places no signature at all, a declaration of absence included: only the rollback's registration counts (RB3); (8) stepping down during the stretch is treated as resigning: the client allows it and the rollback registers it; (9) the repo client's command line is labelled a test tool, not a client, in its help and README.

**Next:** one building session writes the two rounds' decisions (F186; RB1 to RB6) into the texts and the code, and fixes (1) to (9); then a hostile review.

**Fixed, 9 October 2026** (`docs/f186-rb-f187-build-2026-10-09.md`), in Fable's order, each with a test that fails before the fix (item 6 changes the text only, its test pinning the code): (1) the rollback's members from Law's voices, the departed written to field 22, no share dealt to them; (2) every registered act checked by Law from the relays before the rotation (`lawRollbackRegisters`), "done" only from Law's reading after; (3) published resignations read for the last voice's warning (`lawPublishedResignations`); (4) leaving names Law's agreement, and says when Law cannot be read; (5) the broken clone refused as the rollback's clone; (6) the text now says a placed signature counts at the rollback (C2); (7) no placement from the stretch, a declaration's included; (8) stepping down during the stretch, registered by the rollback, whose clone leaves that member out of the area; (9) the repo client's command line labelled a test tool. Next: the hostile review.

## F188. The questions of the F186, RB and F187 build (9 October 2026)

**From** `docs/f186-rb-f187-build-2026-10-09.md` (merged `6dbcd0e`): DQ1 to DQ8, BQ1 to BQ6 and eight readings, in Law draft 10, "Open in this draft".

**DQ1 to DQ4, taken together (the project lead suggested one decision for four variants of one rare case, by the working practice), decided by Nobody, allegedly, 9 October 2026 ("Yes"):** when a deal's fork turns tangled (a split within a split, three complete versions of one version, two competing settling versions, a settling version that splits its own branch again), **the deal stays on its last agreed version, the reference, until one clean settlement**: the parties lose the changes the tangled versions made and must settle cleanly; **any buyer who paid under a version every party signed stays protected**, as for a simple fork (A4). *A stated cost, borne by those who kept double-signing. Noted by the project lead: as built, the verifier refuses to name any version in force in these shapes, which may leave such a buyer in limbo; the code must follow this decision.*

**DQ5, decided by Nobody, allegedly, 9 October 2026 ("Yes, Carla needs to sign either way"):** **a version that settles a deal's fork must be signed by the parties of both branches**, so no one on the discarded side is dropped without consent. *Reasoning, the project lead's:* by accident the case almost never arises; on purpose it is a bait branch, a fork only one side knows of, used to take a newcomer's money, work, rights or name for a share, then settle on the other side and drop them. *Stated cost:* a party of either branch can refuse every settlement and keep the deal on its reference version; that is all it can do.

**DQ6, decided by Nobody, allegedly, 9 October 2026 ("Yes"), from his remark that one count across both branches would act as an alarm:** while a deal is forked, **the turns for leftover units stay per branch** (each branch's holders, rule 15a), and **a single numbering runs across every split the service makes, on any branch**, each split showing its number; **client conformance: a holder's client MUST raise the alarm when the numbers on the splits it receives skip**, since splits are then being made where it is not shown. *The project lead's note:* a gap reveals a hidden branch even to the party a bait branch was hiding from; the split service's receipts may already form one numbered chain (rule 15a, F165), to be checked in writing it in.

**DQ7, decided by Nobody, allegedly, 9 October 2026:** a payment naming an **older version** of the same line, with no fork, raises **a plain notice**, not the alarm; **the alarm is kept for forks**. "It is not the same issue. One is a fork, one is an outdated offer somehow still interpreted as valid." *The project lead's reasoning:* alarm fatigue would teach sellers to ignore the alarm the day a bait branch shows up.

**Against outdated offers, decided by Nobody, allegedly, 9 October 2026 ("Yes, absolutely. That is a strong should. Find offer, verify that it is truly the last in its chain."):** **client conformance, SHOULD (a strong should): before paying, a buyer's client finds the offer and verifies that it is truly the latest in its chain, fetching the seller's latest version from its homes or relays, and warns where what it shows is outdated.** *Already in place (rule 32a, F126, F128):* a purchase names the version and the point at which the client read it current; on a request rail the seller commits to the version sold; on a push rail each holder settles on its own chain, and a payment after the newer version is refunded. *Also suggested by the project lead, as guidance, not rule:* sellers prefer request rails for sales; an offer may carry its own expiry on a named time reference.

**DQ8, decided by Nobody, allegedly, 9 October 2026:** the amicable path comes first: a version naming both branches, signed by the parties of both (DQ5). **Where the parties cannot agree, the arbitrator named in the deal's reference version may settle the fork**, "a grant to act under specific conditions, here the condition is the existence of a fork", every party having consented in advance by signing the reference version or a branch that inherits it; **the keepers' record of who signed what, and in what order, is the evidence the arbitrator weighs**, never an automatic "first wins"; with no arbitrator named, the deal stays on its reference version. **The arbitrator acts only once activated by one of the signing parties**, by a signed request naming the fork, which its settlement names: never on its own initiative, and never before a party knows of the fork. *Raised by the project lead and accepted:* a keeper or arbitrator settling a fork before the parties notice would reopen the bait branch through a colluding keeper; the request is what MOR can check, having no clock.

**BQ1, decided by Nobody, allegedly, 9 October 2026 ("Yes, everyone have to acknowledge the rollback. Safer."):** after a rollback, **an act of a grantee counts only once it cites the rollback or a later decision of the collective**; an act that cites nothing newer than the time before the break, including one made just before the break that no act of the collective took in, counts for nothing and is signed again. **Client conformance: a grantee's client cites the latest decision of the collective it holds in every act it signs.** *Wording corrected by Nobody, allegedly, in deciding it:* "MOR has no clock of its own, so an **unanchored** act proves where it stands only by what it cites." An anchor can place an act; the rule asks for the citation all the same, as the safer path.

**BQ2, decided by Nobody, allegedly, 9 October 2026, from his principle:** "When there is a broken stretch the collective should not be able to keep any action that did not respect the collective rules prior to the breaking." **The test: would it have been valid under the collective's rules as they stood just before the break? If yes, the collective keeps it; if not, it does not.** A debt paid under an agreement made before the break: kept, and the debt stands as paid (the payer's claim shows it, Finance rule 10). A tip: kept. A sale under an offer published before the break: kept, and what the collective owes for it (a key delivery) is done once the rollback lets it act. A sale under an offer published during the stretch: owed back, unless signed anew after the rollback. *This narrows RB2 as built (every sale of the stretch owed back) and answers his own doubt of round 2 ("only if activities do not respect the rules at the act before the break").* **The frame, his words:** "We need to assume that the collective has an internal problem that freezes changes to external interactions." The collective's own acts of the stretch still count for nothing; what it keeps is only what others did within rules that already held.

**The five lines of a broken collective**, set out by the project lead at Nobody, allegedly's request to zoom out, as the shape the day's answers built: (1) broken: the keys moved without the consent the rules require, by human error or a technical fault; (2) quarantine: nothing the collective or its grantees sign during the stretch counts; (3) it keeps only what its rules before the break allowed; (4) the way back is a rollback by the constitutional powers in force before the break, which everyone cites, with declarations of absence always shown to the party named; (5) no ending while broken, and warnings before anyone breaks it.

**Answered by applying them, accepted by Nobody, allegedly, 9 October 2026 ("Yes"):** **BQ3**: a payment shown only by the payer's claim is judged by the offer it names, not by when it was paid: an offer made before the break, kept; one made during the stretch, owed back; the rail's own time (a block, an invoice) is supporting evidence where it exists, never the rule. **BQ6**: no new rule: a member who stepped down is named again by a rollback only with their own signature (B10). **Five readings confirmed:** while a deal is forked, the reference is what a verifier reports in force; a settling version naming a version the verifier does not hold waits until it holds it; "signed anew" is a new receipt of the collective, never an adoption; a resignation published but not yet registered counts as gone for the warnings only; field 26's number and the rollback's fourth element are technical choices, accepted.

**BQ5, decided by Nobody, allegedly, 9 October 2026:** "It breaks, but it only breaks one layer." The warning to the last holder of constitutional power: **"You are about to break the collective's constitutional layer. Once you leave, nobody will be able to change its rules again. The other members keep acting in their areas."** (First sentence his; the rest the project lead's, accepted: "It works.") It is not a broken collective (rule 37d) and has no rollback. **"This could become a deliberate act under rare scenarios"** (Nobody, allegedly): a collective may choose to freeze its own rules for good, and the warning makes sure it is chosen.

**The settling version's reach, decided by Nobody, allegedly, 9 October 2026 ("Yes, absolutely. Tips are what matter on the forks"):** **a settling version must name the latest version, the tip, of the branch it discards**; one naming an older version settles nothing, and where a newer version of that branch turns up that it did not name, the fork is not settled and the deal stays on its reference (DQ1 to DQ4). *Replaces the build's reading "may name any version of the other branch".*

**A collective whose very first agreement fails, decided by Nobody, allegedly, 9 October 2026:** **it is simply refounded**, with no rollback: "nothing that law would accept ever existed." *A stated cost, small: a new collective has no history, works, money or followers yet.*

**BQ4, decided by Nobody, allegedly, 9 October 2026 ("Yes, as new needs are discovered the grammar needs definition. Normal"):** the next building session writes **the contest act's format** (Law type 14): it names the declaration it answers and is signed by the party declared absent, which shows presence; per rule 52 it shows the dispute and voids nothing; the client lets the declared member sign it.

**With BQ4, every question of the F186, RB and F187 build is decided** (DQ1 to DQ8, BQ1 to BQ6, the eight readings). Next: one building session writes F188 in and builds it, after Fable's review of the build, so both can go into one session.

**Written in and built, 9 October 2026** (`docs/f188-f189-build-2026-10-09.md`): Law draft 10 (rules 5, 15a, 32a, 37a, 37d, 38, 45b, 47a, 52; the contest, type 14; the settlement request and fork settlement, types 22 and 23; split key 5), core v21 and freeze suite v21 (steps 1.7a and 3.7w); the core library, its bindings, the repo client (the seller's notice and alarm, the buyer's check, the request), the collective client (the contest, the words of BQ5, refounding) and the desk (the split numbers). Writing it in exposed questions QF1 to QF6 and eleven readings, left for Nobody, allegedly, in Law's "Open in this draft": QF1 is where F188's tip rule and F189 (4) meet.

## F189. Fable's review of the F186, RB and F187 build (9 October 2026, afternoon)

**Review:** `docs/reviews/f186-rb-f187-review-2026-10-09.md` (merged `ab99c7e`). Every BREAKS and CONFLICTS was reproduced by a test. The build holds where it was aimed: no rollback undoes a valid act, a key grab by rollback gains nothing, and the nine F187 fixes close what they targeted.

**Answered by the day's decisions, accepted by Nobody, allegedly, 9 October 2026 ("Yes"), for the next building session to fix:** (1) a resignation is spent once its signer comes back by signing a version that names them (B10): a line registers only a resignation signed after the member's latest return, so an old resignation cannot take a returned member's voice again, by a record or a rollback; (2) a version is checked to be complete and to belong to the deal before it is read as settling a fork, so no draft or stranger's act makes a forked deal unreadable; (3) a payment naming a version the seller does not hold raises the alarm: an unknown version is the hidden fork the alarm exists for; (4) settlement is final in the code as in the text (A3): nothing that grows on a discarded branch unsettles the deal; (5) field 26 names the tip of the discarded branch (F188); (6) a settling version also cites the settled version in `objects`, so verifiers that fetch by citation find it.

**(7), decided by Nobody, allegedly, 9 October 2026 ("Agreed"):** while a collective is broken, **no fork or closing counts, whatever line it names**, the last good link before the broken act included; and **money owed back from the broken stretch counts as a debt** for a closing's "owes nothing", so a collective cannot close until those payers are settled. *His frame:* "It's an emergency situation with emergency rules. All that happened under emergency has to be settled to the respect of the rules before the emergency is lifted." *The project lead's reasoning:* a closing on an old line was a quiet way out of the refunds owed for the stretch.

**(8), decided by Nobody, allegedly, 9 October 2026, in essence ("Unsure about your wording, but agreeing with the essence"; the wording to be made plain in writing it in):** **a declaration of absence counts only if it is public or addressed (sealed) to the member it names**, among others if wished; one that is neither counts for nothing, so no rollback or line can register it. *Why it needs no agreement on relays (his question, the project lead's answer):* a declaration has effect only where an act registers it, and that act names it; whoever checks that act, the named member included, must obtain the declaration to accept it, so it either reaches the member through the very act that uses it, or that act does not count for the member. Publishing a declaration at the collective's routes and the member's inbox is a SHOULD, so the member sees it early; it is not the safeguard. *His question behind it, kept:* "why isn't Cy's app looking where matters potentially affecting him happen?": a collective's routes are that place, and a member's client watches them.

**Built, 9 October 2026** (`docs/f188-f189-build-2026-10-09.md`), in Fable's order, each with a test that fails first: (1) a resignation spent once its signer comes back, the client's rollback never naming a returned member, and Law's reading of departures counting the return; (2) only complete versions of the deal read as settling; (3) the alarm on a version the seller does not hold; (5) the settlement naming the discarded tip; (6) its citation; (7) no fork or closing while broken, whatever its line, and money owed back blocking a closing; (8) a declaration counting only if public or addressed to the member. **(4) is not fixed: writing it in, F188's tip rule and A3 meet** (a version on the discarded branch past the named tip may have come before or after the settlement, and MOR cannot tell): question QF1 for Nobody, allegedly; meanwhile a verifier refuses rather than guesses, and a settlement made after another, which names it, changes nothing.

## F190. The questions of the F188 and F189 build (9 October 2026, evening)

**From** `docs/f188-f189-build-2026-10-09.md` (merged `c551790`): QF1 to QF6 and eleven readings, in Law draft 10, "Open in this draft". *The project lead's view on all six was given first: QF2, QF4, QF5 and QF6 follow rules already set; QF1 and QF3 need thought.*

**QF1, decided by Nobody, allegedly, 9 October 2026 ("Yes"):** a complete version on a dropped branch, beyond the tip the settlement named and not citing the settlement, makes the deal **tangled**: it returns to its reference until a clean settlement (DQ1 to DQ4). A version that cites the settlement is plainly after it and changes nothing, so finality (A3, F189 item 4) holds wherever it can be shown. *It takes every party's signature to make such a version, so nobody can unsettle a deal alone.* This unblocks F189's item 4.

**QF3, decided by Nobody, allegedly, 9 October 2026 ("Yes, expand to multiple tips as needed"):** **a settling version names every tip it discards** (field 26 becomes a list), and is signed by the parties of all the branches involved, so a tangled deal can settle cleanly: everyone sees every option, everyone signs the choice. *Without it a tangled deal could never leave its reference, contrary to DQ1 to DQ4 ("until one clean settlement").*

**QF2, QF4, QF5 and QF6, accepted by Nobody, allegedly, 9 October 2026 ("Yes"), as rules already set elsewhere:** QF2, the deal's reference version must name which of its judges settles forks; where that is unclear, none does, and the deal waits on its reference. QF4, a deal's split with a missing or repeated number is a deviation that breaks the plan, as a tally reset (F171). QF5, money owed back is repaid like any debt, by a payment naming what it repays, proven by either side's record (double entry); no new act. QF6, an old stepping down is spent once the member holds the area again, as for resignations (F189, item 1).

**With F190, every question of the F188 and F189 build is decided** (the eleven readings to be confirmed with the revised texts). Next: one building session writes F190 in, with the relay's delivery record in Law rules 19 and 22 (F184), and the Production MIP's and core task table's wording on units and anchoring (noted by the technical-pass session).

**Written in and built, 9 October 2026** (`docs/f190-build-2026-10-09.md`): Law draft 10 (terms fields 26, a list, and 27, the judge of forks; the fork settlement's field 2, a list; rules 5, 15a, 19, 22, 37d, 45b; the resignation; the role share), core v21, Production draft 6 (wording only) and the freeze suite (steps 1.7a, 2.4f, 3.7w), each revised in place for Nobody, allegedly, to approve again; the core, its bindings, the repo client, the collective client and the desk, each change with a test that fails first. F189 (4) is completed by QF1. Writing it in, the settlement's reach was made exact as **clean**: every complete version of the deal either in the settlement's history or made after it; the first clean settlement holds (a reading to confirm). Questions QG1 to QG5 for Nobody, allegedly (Law, "Open in this draft"): a refund to a bare key or to nobody (QG1), the payer's pointer for a repayment (QG2), how a verifier knows a delivery record (QG3), the chain of judgment for the judge of forks (QG4), Production's other kinds called Modules (QG5).

## F191. The questions of the F190 build (9 October 2026, evening)

**From** `docs/f190-build-2026-10-09.md` (merged `32bb877`): QG1 to QG5 and nine readings, in Law draft 10, "Open in this draft".

**A working principle, stated by Nobody, allegedly, 9 October 2026:** "Decisions built from elements already decided always win unless they create new problems."

**QG1, decided by Nobody, allegedly, 9 October 2026** (accepted with the principle above): money a broken collective owes back to a payer it cannot name (QF5). **A refund owed to a bare key** (Finance rule 10a) is repaid once the collective's claim carries the rail's proof that the money reached where the claim signed with that key said: the same double entry as Finance rule 10, a claim with a rail proof showing the money arrived. **Money owed back to nobody** (a payment that committed no key, so its refund is unclaimable, rule 10a) stays open and visible, as rule 10a says, but **does not block a closing**: the closing act names every such obligation it leaves open, as a settling version names every tip it discards (F190, QF3). *Suggested by the project lead:* both, from rules already set. *Why:* as built, one anonymous tip with no key received in a broken stretch kept the collective from ever closing, a protection trapping every member (the brainstorm's failure pattern 3), with nobody gaining from it. *Stated cost:* a collective may close while visibly owing an anonymous payer who could never have been paid. *To build:* the closing act (Law type 20) names the unclaimable obligations it leaves open; a refund to a bare key counts as repaid on the collective's claim with the rail's proof.

**QG2, decided by Nobody, allegedly, 9 October 2026 ("Agreed"):** money owed back follows the debt rule exactly (QF5: "repaid like any debt"): to the refund rail the payer's own claim on the payment names (key 7), where it names one; otherwise to the pointer Finance rule 14 selects from the payer's own acts on that payment, or the payer's pointer in force where there is none; a payment to the payer's vault always counts; and the payer's own receipt counts wherever the money went. *Suggested by the project lead. Why:* as built, a repayment counted at any payee pointer the payer ever published, so a collective could repay to an old pointer a thief controls and be cleared while the payer lost the money; Finance rules 14 and 15 exist to stop exactly that for every other debt. *Cost:* the collective looks up the payer's current pointer, as any debtor does. *To build:* replaces the build's reading "any version".

**QG3, decided by Nobody, allegedly, 9 October 2026 ("Agreed"):** **any act offered as a relay's evidence for its role share counts only when the payer's claim for the payment acknowledges it**, whatever cMIP defines it, so no verifier needs telling which specification is the relay transport cMIP and every verifier gives the same answer. *Suggested by the project lead. Why:* as built, a verifier not told read the relay's own record as any third party's and paid the relay on its own word, reopening what F184 closed, and two honest verifiers disagreed (the brainstorm's failure pattern 4). Built from F184 and F75: the confirming signature comes from the other side of the deal. **Found while weighing it, not decided:** Law rule 22 also pays a service for its use on a record the service signs itself (F116), the same shape of self-evidence. *Decided by Nobody, allegedly, on the project lead's suggestion:* not stretched tonight; it goes to Fable's review of the F190 build first, to be decided as a whole.

**QG4, decided by Nobody, allegedly, 9 October 2026:** the judge of forks (field 27) follows the chain of judgment (field 21) like any judge the terms name: "judging relies on a chain of judges every time it is needed. If a fork ends up being disputed it needs to follow the chain described in the agreement." Where the judge of forks does not act within its period, the next link takes over, with no new signature, as the chain was signed by everyone (F121). *Suggested by the project lead, with it:* settling a fork is signing a fork settlement (type 23), so only an identity in the chain can settle; a link that is a specification is passed over. *Why:* as built, a silent judge left the deal on its reference for good, to the advantage of whichever party preferred to wait. *To build:* replaces the build's reading "the chain of judgment is not followed".

**QG5, decided by Nobody, allegedly, 9 October 2026:** "Align the wording." Production's definition of a Module drops media types and signature schemes, specifications of their own (kinds 3 and 5), as units already are (kind 2); the core's table "Outside the core" says "media types, and the Modules that play them", and gives time sources to time-reference cMIPs (a Law task, F173, F176), not to verifying modules. Wording only, no rule changes. *Suggested by the project lead.* Case studies saying "media module" for the code that plays a format stay true; any line that does not is fixed at its document's next redraft.

**Delegated by Nobody, allegedly, the same evening:** "Wording on technical matters is your realm more than mine." *Read by the project lead as:* technical wording that changes no rule may be settled by the project lead, recorded the same turn and marked as the project lead's; anything that changes what a rule does stays his decision.

**Next:** the nine readings of the F190 build, after Fable's review of it (running), since the review attacks the clean-settlement reading first; then one building session writes F191 in.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`), after Fable's review and F192 to F199, as the order mended above asked: QG1 (Law rule 37d, the closing's new field 4; Finance rule 10a), QG2 (rule 37d; Finance rule 14), QG3 with F193 and F194 (rules 19, 22), QG4 with F192 (rule 45b, types 23 and 27's chain), QG5 (Production's Module, the core's table "Outside the core"), and the wording settled under the delegation (rule 37d's "the receipt's field 5 or the claim's field 4"; "the version of the fork it keeps"; DQ8's request restated, with its cost; the bindings refusing a repeated tip). Each change with a test that fails first. Questions QH3 (the object a relay's record names, and a purchase naming an offer) and QH5 (a bare key that never named a refund rail) left for Nobody, allegedly, in Law's "Open in this draft".

## Review of the F190 build (9 October 2026, night)

Fable's review (`docs/reviews/f190-review-2026-10-09.md`, merged, with seven `review_f190_*` tests that pass while each attack works): the build does what F190 decided; QF4 held, field 26 as a list held, the judge cannot overturn the parties' clean settlement. Found: (1) **the judge of forks can unsettle a settled deal alone** by a second settlement, and the next plain version then picks the winner with no tip named (high); (2) **a party left alone on a dropped branch can tangle a settled deal by itself** ("nobody can unsettle a deal alone" is false in that shape; medium to high); (3) a complete version held back and published after a settlement tangles it, at the cost of an honest signer (the no-clock cost; medium); (4) **the split service writes the receipt's payer, so it chooses who acknowledges its own relay's delivery record** (medium to high), and (4b) on a purchase naming the offer, no delivery record ever counts; (4c) a prompt split pays no relay; (5) a stepping down never registered takes the area whenever it is registered; (6) smaller: a repayment to a disowned pointer (6a), "field 5" for a claim's field 4 in rule 37d (6b), a complete version naming an unheld tip kills the deal (6c), and wording; (8) **a service's use record is the relay's self-evidence one clause along** (F116; dormant while the record has no format).

**Against F191, read by the project lead:** QG1, QG2 and QG5 match Fable's independent readings, and QG2 as decided closes 6a. **QG4 (the chain of judgment) waits on finding 1**, since a chain of judges who may each speak twice multiplies it: *the project lead's error, stated:* QG4 was put before the review arrived; nothing is built, so the order is mended at no cost. **QG3 waits on finding 4 and section 8**: the payer's claim must be one the rail's proof commits to, not the payer the split service names, and section 8 proposes the line for services (chosen in advance by the owners: a named share, no evidence; chosen by the payer: the relay's rule; evidenced only by their own record: not paid).

**Decisions to put to Nobody, allegedly, one at a time** (Fable's order, kept): finding 1, then QG4 completed; finding 4 and 4b, then QG3 completed with section 8; finding 2 (narrowing 3); finding 5 and 6c; 6g with QG1; the rest as wording or stated costs. New findings are numbered from F192.

## FORK-HANDS-OUT, the old invariant failure (9 October 2026, night)

`docs/fork-hands-out-2026-10-09.md` (merged): the failure the F190 build found (seed `12903442695522571031`) was **the test's oracle, not the core**, and four more cases found on larger runs were the same: the oracle read "within its signer's powers" as "the right people signed it", which the spec does not allow; each time the core followed the spec. The oracle is fixed, with named tests; nothing in `spec/` or the library changed. **Two questions for Nobody, allegedly, open:**

- **FH1. Does a fork drawn on an old line take away a payment's rail?** A buyer's payment and the collective's act taking it on are inside the fork's history, but the payee pointer the receipt relied on is outside it, so it counts for nothing (rule 47a) and the receipt stops counting (Finance rule 12a). (1) a stated cost of a fork on an old line (IT2b); (2) the pointer stands for payments already made to it, "as the chain stood" (F181); (3) such a fork is not complete. *Suggested by the project lead, not decided:* (2), built from F181, since a buyer the collective visibly took on was promised safety.
- **FH2. Can a departure drawn after a fork decide whether the fork took effect?** As built the library ends with the fork complete, the debt binding and no successor owing it, wrong under any reading. (1) only departures registered in the fork's history count for its check, so a later departure never changes whether it took effect; (2) later ones count too, with an exception to IC8. *Suggested by the project lead, not decided:* (1), matching the fork's own text, still "to confirm": "whether a fork took effect never changes with what happens after it". The library needs a fix either way.

A reading noted, not a failure: where several acts took the same debt on, the core sets aside every departure any of them missed, all at once.

## F192. Settle is final, restored: a late version loses (10 October 2026, morning)

**From** Fable's review of the F190 build, findings 1 to 3: a settled deal could be reopened alone, by the judge signing a second settlement, by a party left alone on a dropped branch, or by a complete version held back and published after the settlement. *The project lead's reading, confirmed by Nobody, allegedly:* the three are one hole, made by **QF1** (F190), which treated a version on a dropped branch, past the tips the settlement named and not citing it, as possibly made before the settlement, and so reopened the deal ("finality holds wherever it can be shown"). That narrowed **A3**, decided in both rounds on 8 October ("Settle is final… Only one survives… Matter closed"), and broke "only what a party can read can be used against them". The fourth patch on deal forks (F186, F188, F189, F190): zoomed out before patching.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes agreed"), replacing QF1:** **A settlement is final for everything its signers could see when they settled.** A version on a dropped branch that was not visible to them, a second settlement by the judge of forks, or a version a lone party grows on a dropped branch reopens nothing. Only a new version signed by every party whose voice remains in the version the settlement put in force changes the deal. A client may show such a late version as a leftover of a dropped branch; it changes nothing. **Stated cost:** whoever signed a version on a dropped branch that the settlement's signers could not see loses it, honestly forgotten on an out-of-step device or kept hidden on purpose; nobody who settled in good faith loses anything. *What "could see" means for a verifier with no clock (the settlement names, or holds in its history, every tip it drops; anything else is not seen) is for the building session to write exactly, and to bring back as a question where the text is unclear.* Closes Fable's findings 1, 2 and 3 together. **QG4 (F191) stands:** the judge of forks follows the chain of judgment, and under F192 any judge speaks once per fork, a second settlement counting for nothing.

*How it went wrong, recorded by the project lead:* QF1 arrived from a build as a technical puzzle (a verifier cannot tell before from after), the cautious-sounding answer protected a version nobody could see against those who settled in plain view, its wording ("wherever it can be shown") hid that it narrowed A3, its reassurance ("nobody can unsettle a deal alone") was untested, the four questions were not asked of it, and it passed in a batch of six late on the ninth day.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): rule 45b rewritten common case first; "what a settlement could see" written exactly as its history (its own line, the tips it names, what it cites, each with its own history; a judge's settlement, the histories of the versions it names); a settlement counts only where it names every tip it saw; a settlement whose history holds another is after it and reopens nothing; only a version on the line in force changes the deal. Fable's `review_f190_1` and `review_f190_2` rewritten to pin the fix. Writing it in exposed QH1 (two settlements, a judge's among them, neither holding the other: the verifier refuses meanwhile) and QH2 (a branch the settlement never named, carrying a newcomer: dropped, as F192 says, against DQ5's reason), in Law's "Open in this draft".

## F193. Only the payer the payment commits to acknowledges a delivery (10 October 2026, morning)

**From** Fable's review of the F190 build, finding 4: "the payer" whose claim acknowledges a relay's delivery record was read from the receipt, which the split service writes, so a service could name a puppet as payer, have it acknowledge its own relay's record, and take the relay share from the owners: the attack F184 was decided against, one step sideways. *Laid beside it:* F184 (the delivery record counts only acknowledged by the payer's claim); F131, IT3 ("the payment decides"); QG3 (F191).

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, the loss is minimal"):** **the payer whose claim may acknowledge a delivery record is the payer the payment's own commitment names** (payment cMIP: an identity, an anonymous payer's bare key, or nobody): a claim signed by that identity, or by that key; never the payer a receipt names. Where the commitment names nobody, no delivery record can be acknowledged, and the relay share is unfilled. *Suggested by the project lead, built from IT3.* **Stated cost:** a payer who stays wholly anonymous, committing no key, cannot reward a relay. Replaces the build's reading "the payer its receipt names" (Law rules 19, 22). The `review_f190_5_*` test is to be rewritten to pin the fix.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): the acknowledging claim is one whose rail proof carries the payment's commitment, its signer or bare key as payer; `review_f190_5` rewritten to pin the fix.

## F194. No service is paid on its own record alone (10 October 2026, morning)

**From** Fable's review of the F190 build, section 8 (asked by the project lead after QG3): Law rule 22 and Production rule 17 pay a service's role share on "a use record signed by the identity running the service" (F116), the one party who gains by it: the self-evidence F184 closed for relays, one clause along; dormant while the use record has no format (F140). *Laid beside it:* F116; F184's reason ("paying for usage invites faking usage"); the role share (helpers known only at payment time; helpers known in advance take named shares); QG3 (F191); F193.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, then it is a question of good practice from clients devs"):** **a service chosen by the owners in advance is paid by a named share**, with no evidence; **a service chosen by the payer at payment time is paid by a role share only when the payer the payment commits to acknowledges its use record** (the relay's rule, F193); **a service evidenced only by its own record is not paid.** A service that worked unnamed is paid by whoever chose it: the owners (by naming it in a new version), the payer (through a client that carries the choice into the payment), or the relay or service that used it (by its own agreement with it). *Suggested by Fable and the project lead.* Whether a client carries a user's choices into the payment is good practice for client developers, the builders' choice, legible to those who look (F184: "pay the pipe if you wish to"). Replaces "the identity running a service for its use" as sufficient evidence (Law rule 22; Production rule 17's "it is enough for role shares").

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): Law rules 19 and 22, Production rule 17; a referral's evidence counts the same way, named in the committed payer's claim (rule 22's "the payer's client for a referral").

## F195. A resignation is spent by coming back, registered or not (10 October 2026, morning)

**From** Fable's review of the F190 build, finding 5: F189 (1) and QF6 spend a resignation or a stepping down only where a line registered it and the member came back after; one handed in and never registered can be registered years later, whatever the member signed since, and takes the voice or the area with no new signature of theirs. *Laid beside it:* F189 (1), B10, QF6.

**Decided by Nobody, allegedly, 10 October 2026 ("Good"), after asking what "spent" means** (*the project lead's answer:* used up, like a punched ticket: still on the record and visible, but registering it changes nothing): **a resignation or a stepping down is spent by any later version its signer signed that names them again** (as a member, or as holder of the area), **whether or not it was ever registered**; once spent, no line registers it. *Suggested by the project lead, built from F189 (1).* *Cost:* none found; a member who means to leave signs a new resignation after the last version they signed. The `review_f190_6_*` test is to be rewritten to pin the fix.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): `review_f190_6` rewritten to pin the fix. Writing it in exposed QH4: read literally, the version a line puts in force while registering a member's resignation, which the member signed before leaving (C2; F187, 6), would spend the very resignation it registers; built so that version never brings its signer back, for Nobody, allegedly, to confirm.

## F196. A settlement naming a version nobody holds is read as a plain version (10 October 2026, morning)

**From** Fable's review of the F190 build, finding 6c: a complete settling version whose field 26 names a hash nobody holds made every reading of the deal fail for good, with no later version able to mend it. *Laid beside it:* F189 (2) (no draft or stranger's act makes a deal unreadable); F188's reading (a settling version naming a version the verifier does not hold waits until it holds it).

**Decided by Nobody, allegedly, 10 October 2026 ("Approved"):** **a settling version naming a dropped version the verifier does not hold is read as a plain version, not a settlement, until that version is held**; the deal stays readable, forked or on its reference as before, and the parties may sign a correct settlement. Once the named version is held, the settlement counts from then, as F188 reads it. *Suggested by the project lead, built from F189 (2).* The `review_f190_7_*` test is to be rewritten to pin the fix.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): `review_f190_7` rewritten to pin the fix.

## F197. Money owed back to a payer who gave no address: a notice first, a holder if chosen (10 October 2026, morning)

**From** Fable's review of the F190 build, finding 6g: a payer with an identity but no pointer, vault or refund rail, who never signs a receipt, leaves money owed back that cannot be paid anywhere, so the collective can never close: a stranger freezes its ending for a penny. *Laid beside it:* QG1 (F191): money owed to nobody does not block a closing and is named in the closing act. *The project lead's error, stated:* first offered as "Carla can still claim it later"; corrected on Nobody, allegedly's question: after a closing the collective's keys count for nothing, so nothing can be paid.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, exactly"):**
- **The floor, required:** before closing, the collective sends the payer a notice sealed to their identity, with a deadline on a time reference, asking where the money should go. The notice's conditions (its deadline, how it was sent) are visible, so its good faith can be judged: "the notice demonstrates good faith. The degree of that good faith depends on the conditions of the notice." If the payer names an address in time, they are paid; if not, the collective may close, the debt named in the closing act and visible, unpaid.
- **An option a collective may choose, legibly:** set the amount aside with a named holder that outlives the closing and pays the payer when they turn up: a keeper or custodian role, built as a cMIP. Nobody, allegedly's reference: the Swiss 2nd pillar, where benefits an employee leaving names no destination for go to a holding institution that then seeks the employee. The core requires neither the holder nor any one notice period; it shows which a collective chose.

*Suggested by the project lead (the notice), with Nobody, allegedly (the holder as a legible option).* A payer who committed only a one-time key cannot be reached by a notice; QG1 applies to them as decided.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): the notice (Law type 24), sealed to the payer and to every member (rule 35a), with a deadline on a time reference whose passing the verifier states; the closing's field 4 naming each payment it leaves open, its notice, and a holder where one is chosen; the collective client sends a notice and names what it leaves open. QH5 (a payer who committed only a one-time key) left for Nobody, allegedly.

## F198. A payee pointer left outside a fork still counts for payments already made to it (10 October 2026, morning)

**From** FH1 (`docs/fork-hands-out-2026-10-09.md`): a fork drawn on purpose on an old line holds a buyer's payment and the collective's act taking it on, but not the payee pointer the receipt relied on; the pointer counting for nothing (rule 47a), the receipt stopped counting (Finance rule 12a) and the purchase vanished, though the buyer was safe under IT2a. *Laid beside it:* IT2a and IT2b (F131); F181 ("as the chain stood"); repair, not undo (F185).

**Decided by Nobody, allegedly, 10 October 2026 ("Feels like the only option, agreed"):** **a payee pointer left outside a fork's history still counts for payments already made to it**, as the chain stood for each payment (F181); for anything after the fork it counts for nothing (rule 47a). *Suggested by the project lead.* *Why:* a stated cost (option 1) would let members erase, by an old-line fork, sales they had visibly taken on, against IT2a; failing the fork (option 3) would let one payment block an ending, the trap F191 and F197 closed for closings. The FORK-HANDS-OUT test at seed `7145587436215071231` is to pass once built.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): the seed `7145587436215071231` passes at 5,000 cases. On the way it found the same promise broken one step over (the pointer inside the fork's history, the act that took it on outside): built as F198 read "as the chain stood without the ending", question QH6 to confirm.

## F199. A fork's effect is judged by its own history only (10 October 2026, morning)

**From** FH2 (`docs/fork-hands-out-2026-10-09.md`): a fork that leaves out a binding debt does not take effect; a departure registered afterwards, by a record that never saw the debt, made the debt count as made after it, so the fork became complete; then IC8 voided that record, and the debt bound again: the fork complete, the debt binding, no successor owing it. *Laid beside it:* the fork's own reading, "whether a fork took effect never changes with what happens after it" (to confirm); IC8; F192.

**Decided by Nobody, allegedly, 10 October 2026 ("1 is agreed"):** **whether a fork took effect is judged only by what its own history holds: the departures registered before its line count for its check of the debts it must hand out; a departure registered after it never changes it.** The fork's reading is confirmed. In the story, the fork stays incomplete, and the members sign a new one that hands the debt out. *Suggested by the project lead*, following F192: what was decided is judged by what its signers could see. The library is to be fixed; the FORK-HANDS-OUT test at seed `7020607380199548456` is to pass once built.

**Written in and built, 10 October 2026** (`docs/f191-f199-build-2026-10-10.md`): the seed `7020607380199548456` passes at 5,000 cases; a closing's check of its debts reads its own departures the same way, as F143 already says (a reading to confirm).

## How the documents are to be written: the common case first (10 October 2026, morning)

**Stated by Nobody, allegedly, while deciding F199:** "The documents can become rather heavy due to mechanic needed on rare cases. It will be important to structure the documents in a way where how things run most of the time is clear first, and only then the complexities linked to rare cases are explored." *Read by the project lead as a rule for every spec text and its redrafts:* each section opens with how things run most of the time, in plain words; the mechanics of rare cases (forks, broken collectives, theft windows, departures racing acts) follow, marked as such. It echoes "use additional feature or risk for rare cases only; a common case must work by default", now applied to writing; and it meets the standing need to rewrite Law's section of the core document for plain reading (roadmap, "Decisions due along the way").

## F200. One payment, one proof, on every rail (10 October 2026, late morning)

**From** the on-chain rail build (step 12a, question OC3: one payment re-mined after a reorganisation has two valid proofs, and Finance counts it twice) and Fable's review of it (finding 1: without any reorganisation, about one payment in eight has a twin proof in its own block, Bitcoin's Merkle tree repeating an odd row's last node). *Laid beside it:* Finance rule 8a (F65, one proof, one payment); F131, IT3 (the payment decides).

**Decided by Nobody, allegedly, 10 October 2026 ("Agreed"):** both, together. (1) **The proof is canonical**: the on-chain rail Module accepts only one index where a Merkle node is duplicated, so the twin proof is invalid. (2) **A rail Module says what "the same payment" is** (on-chain: the transaction's output; on Lightning: the payment hash), and Finance's rules that tell payments apart (8a, 10, 15) read "the same payment" through it, not through the proof's bytes; a payment mined again after a reorganisation stays one payment. *Suggested by Fable and the project lead.* Not chosen: the commitment identifying the payment, which would widen the pending-claim attack of Fable's finding 2. The review's tests on finding 1 are to be rewritten to pin the fix.

## F201. On a Bitcoin clock, an on-chain payment's block is its anchor (10 October 2026, early afternoon)

**From** the on-chain rail build (step 12a, question OC2: the theft rule meets a payer's claim still pending at the lock change) and Fable's review of it (findings 2 and 3: option 1, the pending claim's anchor counting, lets a thief and a payer anchor in the window and pay after the lock change; option 2, only a valid claim's anchor counting, gives the owner an hour-wide lever no prompt anchoring beats; the third reading, the payment's block as its point where the clock is Bitcoin, gives neither side a lever). *Laid beside it:* F173 (anchoring is an Envelope task: "It fits as it is 'media' and then all layers after it can leverage it"); F176 (name your clock); F177 (the point is the anchored home receipt); F179 (a main clock and a backup); step 14a (anchoring to Bitcoin, pooled, paid in sats); step 12a (a request rail by pay-to-contract).

**Asked by Nobody, allegedly, before deciding:** "On what layer does the act of anchoring lives?" The Envelope (F173). The project lead's first wording ("Finance must let a rail Module supply a point") would have put anchoring into Finance; withdrawn.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, that is the whole idea of anchoring via Bitcoin, no?"):** where the owner's declared clock is Bitcoin, an on-chain payment's six-block proof counts as that payment's anchor on the clock, provided it passes the Envelope anchoring cMIP's own check; Finance reads it like any other anchor and gains no new notion. The point on a Bitcoin reference is the block (defined once, in the anchoring cMIP, and used by the rail and by step 14a alike), so "the payment's block before or at the lock change's block" is the comparison rule 15 makes. *Suggested by Fable and the project lead.*

**Technical wording, the project lead's (no rule changed):** the Envelope anchoring task takes an act's id, while a pay-to-contract payment commits to the payment's commitment; the payment cMIP's commitment is to carry the request act's id, or the anchoring task to accept a commitment naming its act, whichever the build finds smaller, so that the payment's block anchors an act.

**Still open:** what happens where the owner's clock is not Bitcoin (OC2 for other clocks; options 1 and 2 stand with their costs at the size Fable found); the forgery price of header chains and whether the anchoring verifier follows the real chain (review 9, item 1); OC1.

**Core changes:** Envelope draft 7, the anchoring task (the point on a block-based reference); Finance draft 6, rule 15 (a rail proof read as an anchor where it passes the clock's anchoring cMIP); the on-chain rail Module draft 1 and the payment cMIP (the commitment names its act). *To build:* with step 14a's anchoring cMIP, which must define its point as the block before its code.

## F202. One anchoring cMIP; the clocks are Modules (10 October 2026, early afternoon)

**Decided by Nobody, allegedly, 10 October 2026, while deciding OC2 ("We need tu ensure that anchoring to multiple clocks is possible, cMIP is the anchoring, modules are the clocks."):** the anchoring task has one cMIP, which says what an anchor is, how two anchors on one clock compare, and what a clock must accept and produce; each clock (Bitcoin, a timestamp service, any other) is a Module under it, as rails are Modules under the payment cMIP. An act may be anchored on any number of clocks (already true: anyone may anchor any act, F173); the owner's declared clock names, by Module, the main clock and the backup that decide rule 15 (F176, F179).

**Read with F201 (the project lead's wording, no rule changed):** "passes the anchoring cMIP's own check" reads as "passes the Bitcoin clock Module's check, under the anchoring cMIP"; the point on a block-based clock (the block) is defined by the anchoring cMIP for any such clock, and by the Bitcoin clock Module for Bitcoin.

**Core changes:** Envelope draft 7, the anchoring task (one cMIP, clocks as Modules); Finance draft 6, the clock format (each entry names a clock Module, where it now says "an anchoring cMIP and its parameters"). *To build:* with step 14a, the first clock Module being Bitcoin.


## F203. On a clock that is not Bitcoin, the owner bears on-chain payments caught in the window (10 October 2026, early afternoon)

**From** OC2 for clocks that cannot see the payment's block (F201 settled the Bitcoin clock). *Laid beside it:* F176 ("a payee with no declared clock has chosen no protection and bears"; a payer's client reads the clock before paying; what is compared is named by the party a thief cannot be); F170 (re-pointing in the window is the window's cost); Fable's review, findings 2 and 3.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, option 1."):** where the owner's clock is not Bitcoin, the earliest anchor among the payer's claims of the same payment (F200: "the same payment" as the rail Module says) counts, once one of them is valid. *Suggested by the project lead.* **Stated cost, at the size Fable found:** a thief and a payer together can anchor a claim in the window, pay after the lock change, and be protected; the owner bears, having accepted on-chain payments under a clock that cannot see them, and can close it by declaring Bitcoin as the clock. Not chosen: option 2, which let the owner void any honest on-chain payment by a lock change within the hour.

**Core changes:** Finance draft 6, rule 15 (the earliest anchor of the same payment's claims, once one is valid, where the clock cannot compare with the rail's own proof), with the cost stated; the on-chain rail Module draft 1, "Costs, stated". *To build:* with F200 and F201.

## F204. Bitcoin proofs are checked against the real chain (10 October 2026, afternoon)

**From** Fable's review of the on-chain rail (finding 4, the floor; section 9, item 1: "the floor decides the theft rule unless the anchoring verifier holds the chain it follows"), made principle-level by F201 (Bitcoin blocks decide rule 15 on a Bitcoin clock). *Laid beside it:* Production rule 12 (a rule runs frozen, with no clock, network or randomness; its input is the act and the data it names); rule 13 (every verifier reaches the same answer); the project's rule that MOR is built to be a good ancestor, the way out and anchored history done right.

**The problem:** the rule checked that six headers carry work above a fixed floor, not that they are Bitcoin's; six forged headers cost about 0.7 of a block today (about 2.2 BTC), less every year, in a Module that will be frozen; they could prove a payment never made, or, through F201, lie about when the locks changed. At a difficulty below the floor (as until 2021) every honest proof would answer unknown and the rail would stop.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes B."):** a verifier checks a Bitcoin proof (a payment's, or an anchor's on the Bitcoin clock) against the real chain's headers, handed to the frozen rule as data with the proof; a block not on that chain answers unknown, never valid. *Suggested by Fable and the project lead.* **Stated cost:** a client keeps Bitcoin's headers (about 75 MB in 2026, about 4 MB more a year), or relies on someone who keeps them for it; a client relying on a header service trusts it for this, and should say so (client conformance). Rule 12 holds: the chain arrives as input, not as network access.

**The mechanics delegated, in his words:** "It's easier for me to state a rule and express why than to specify the details of the mechanic. If the mechanic you find respect the rules we go ahead." Left to the build, within this rule: how headers are handed to the rule and how far back; how two verifiers holding different tips agree (depth, which joins OC1); whether the floor stays as a backstop or goes; what an offline client answers.

**Core changes:** Production draft 6, rule 12 (a chain's headers may be data the rule names, supplied by the client); the on-chain rail Module draft 1 (the proof checked against supplied headers; the floor's role restated); the Bitcoin clock Module (F202), from its first draft. *To build:* with F200 to F203 and step 14a.

## F205. An on-chain payment is final once counted (10 October 2026, afternoon)

**From** the on-chain rail build (step 12a, question OC1: a payment counted at six confirmations, then taken back by a chain reorganisation) and Fable's review (the three options weighed; section 9, item 5: anchors must be final at N or a reorganisation reopens a theft window). *Laid beside it:* F192 ("settle is final for what signers could see"); F204 (proofs checked against the real chain, which answers forgery and leaves only a real rewrite).

**Decided by Nobody, allegedly, 10 October 2026 ("Hard for me to imagine, so I will agree with you. But, never say never."):** option 1. A payment counted at its confirmations stays counted; anchors on a Bitcoin clock are final at the same depth, one number for both. *Suggested by the project lead.* **Stated cost, never said to be impossible:** a rewrite deeper than the confirmations leaves a counted payment unpaid or an anchor pointing at a block no longer on the chain; the remedy is Law. *Corrected by the project lead the same turn:* it had said such a rewrite "has never happened on Bitcoin"; it has, twice, from software faults rather than attacks: August 2010 (the value overflow, about 53 blocks) and March 2013 (the 0.8 database fork, about 24 blocks). An attack needs a majority of the hash rate; a fault needs none, so the cost is stated for both.

**A mechanic, the project lead's, under the delegation:** a payee's request may name more confirmations than the Module's minimum, for a large sum; the rail counts the payment only at that depth. Not chosen: undone by evidence (everything built on a payment reopens, verifiers disagree meanwhile); confirmations by amount as a rule (its purpose was the forgery price, answered by F204).

**Core changes:** the on-chain rail Module draft 1 ("Costs, stated"; the request's confirmations field); the Bitcoin clock Module (F202), its depth; Finance draft 6, nothing (a counted answer already stands). *To build:* with F200 to F204.

## F206. Two settlements neither of which saw the other: the parties win, a judge who contradicts itself has spoken for nothing (QH1, 10 October 2026, afternoon)

**From** the F191 to F199 build, QH1: a verifier tells a later settlement only by what it holds; where a judge's settlement is one of two settlements neither holding the other (the judge signing twice; the judge and the parties settling at once), the build refused to name the version in force. *Laid beside it:* F192 (final for what its signers could see; any judge speaks once per fork); QG4 (F191: "judging relies on a chain of judges every time it is needed"); DQ1 to DQ4 (a tangled deal stays on its last agreed version until one clean settlement, buyers protected); and, checked before recording, rule 45b (a deal changes only with everyone's signature; the judge acts only once a settlement request activates it), rule 34a (the chain moves on when a judge answers "unknown"), IT1 (two endings neither naming the other: neither counts until one names the other).

**Decided by Nobody, allegedly, 10 October 2026 ("If nothing new is created, agreed."):** *Suggested by the project lead.*
- **(a) A judge's two settlements of one fork, neither holding the other, both count for nothing**, read as the judge answering "unknown": the deal stays on its last agreed version (DQ1 to DQ4) and the next link of the chain of judgment settles (rule 34a, QG4). The double signature stays visible.
- **(b) A settlement signed by every party and a judge's, neither holding the other: the parties' holds**, the judge's counts for nothing. The judge is a fallback a request activates; a version every party signed is the deal changing by its own rule (45b).

**Checked against the condition, by the project lead:** no new mechanism. (a) is IT1's pattern (neither counts) with rule 34a's existing step (unknown passes the chain on); (b) is rule 45b's own rule ranked above the fallback it already is. Two sentences of rule 45b, citing these.

**Core changes:** Law draft 10, rule 45b (the two sentences). *To build:* `deal_state`, where QH1 now refuses; `review_f190_2` to pin it.

## EXPLORED, NOT DECIDED: a forked deal is broken, like a collective (10 October 2026, afternoon)

**How it arose.** Answering QH2, the project lead suggested that a settlement settles nothing where its own signers had signed a branch it leaves out. Nobody, allegedly: "I have a Déjà vu feeling so we need to stop and zoom out." The chain, laid out by the project lead: F186 (longer branch wins), the two rounds (A1 to A4: the version before the split holds; settled only by a version naming both branches; settle is final; what was done under either branch counts, buyers protected), F188 (DQ1 to DQ4 tangled; DQ5 "Carla needs to sign either way"; DQ8 the judge), F190's QF1 (narrowed A3), F192 (final for what its signers could see, restoring A3), the build's reading of "could see" as the settlement's history, QH2. *The project lead's suggestion was withdrawn:* it fails Fable's F190 review, finding 3 (a version honestly signed, held back and published after the settlement), and it is QF1's cousin. The root, as the project lead read it: without a clock, nothing tells a branch hidden before a settlement from one grown after it, and every fix chose which mistake to make.

**Nobody, allegedly's reframing:** "What if the mistake was to try to treat this differently from a broken collective to ensure smooth continuation of operations since all deals are signed." … "Let's explore it without attempting to settle it. Let's look truly at what it is. Two agreements existing referencing the same act. What the network should propagate from all participants that can see it is: terms broken, do not use this." … "I think the roll back finds it use again, nothing is rolled back truly, a third branch is made, referencing the act before it, and the tip of the other two branches to close them and mark them as settled mistakes." … On a branch hidden and revealed after the repair: "Yes, if you enter a deal where one party has an incentive of making the deal stall and you did not anchor the acts… what can I say? Seriously?"

**What it would be, as explored (the project lead's reading of his words, not decided):**
- **Two complete versions naming the same parent are self-proving evidence**: the deal is broken. Everyone who sees both passes the pair on ("terms broken, do not use this"), so buyers, newcomers and sellers are warned before they act, not after. The same language as Identity's conflict (KERI's duplicity): one act, two successors, broken.
- **While broken, no new version counts** on either branch (the broken stretch of F185); payments keep counting under the version they named, so buyers stay protected (A4's protection kept, A4's "a new act may follow either branch, and counts" dropped).
- **The repair is a third branch** from the last agreed version, naming both tips as closed, settled mistakes, visible forever (F185: "the chain needs to fork from one act before the corrupted one, all while showing the corrupted one"). No branch wins or is dropped; whatever continues is written into the repair and signed again by those it concerns. A version grown on a closed tip counts for nothing (it names the tip as parent; the repair names it as closed: two kinds of reference).
- **What it answers:** QH2 (a hidden branch is not closed, so the deal breaks again and the next repair must close it, its parties signing, DQ5); Fable's F190 findings 2 and 3 (nothing grown during a fork or on a closed tip counts); the "could see" reading (no longer needed).
- **What remains, a stated cost:** a whole branch made at the split by every party, hidden, revealed after the repair, breaks the deal again; it can stall, never win; answered by anchoring, in the shape of F176 (protection is available; whoever does not take it bears) and F173 (anyone may anchor any act).
- **Open within it:** whether a repair needs the parties of every branch it closes (DQ5) or of the last agreed version only (F185's rollback); a judge's repair under DQ8 in this shape; how "do not use this" is carried (relay, home, client conformance).

**Status:** explored, not decided. QH2 parked under it. Before deciding: a write-up for a hostile pass (the lesson of QF1). *Closed by F221 (10 October 2026, evening), after Fable's review: not adopted; finality stands.*

## F207. A resignation names the drafts it leaves behind (QH4, 10 October 2026, afternoon)

**From** the F191 to F199 build, QH4: F195 spends a resignation by "any later version its signer signed that names them again"; a draft a member signed before resigning, put in force by the line registering her resignation, is such a version read literally, and would bring her back by the very step that records her leaving. *As built:* that one version never brings its signer back; but the same draft put in force by a later line still would, though she resigned after signing it, as F195's own advice tells her to. *Laid beside it:* F195 ("Good"); F109 (before and after judged only on the collective's own sequence, never on members' personal sequences, so her devices' order is not read); C2 (a signature the collective placed before its line still counts after its signer leaves).

**Asked by Nobody, allegedly, before deciding:** "But her chain shows the order of the acts, no?" (only her key events form one line; each device keeps its own sequence of ordinary acts, and F109 chose not to read them); and "why was it structured in a way that pulled her back in? Are we fixing something that could have been avoided?" *The project lead's answer, recorded as its own error:* yes. F195's "later", the project lead's wording, did not say later on which sequence, the very thing F109 requires; and "signed a version naming you" happens at every vote in a collective, so it was never a sound sign of a return, only the easiest to check.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes. If the resignation needs it, the resignation gets it."):** a resignation (or a stepping down) names the drafts its signer had signed and leaves behind; a version it names never brings its signer back. What she signed while present still speaks where C2 counts it; nothing she signed while present pulls her back in. Her client names the drafts when she resigns (client conformance); a draft it fails to name is her stated cost, as F195 already says. The order lives inside one act, read on the collective's own chain (F109). *Suggested by the project lead.*

**Core changes:** Law draft 10, the resignation format (a field naming the drafts left behind) and its paragraph (F195's "later" pinned: a version names her again as a return only where her resignation does not name it); the client's resign flow. *To build:* `came_back` and `spent` (the QH4 exception replaced by the named drafts); `f187_6` and the F195 tests.

## F208. A one-time key is noticed too, and never blocks a closing for good (QH5, 10 October 2026, afternoon)

**From** the F191 to F199 build, QH5: a payer who committed only a one-time key and never named a refund rail can be neither repaid nor reached by F197's notice (sealed to an identity); as built, owed to a key, it blocks the closing for good. *Laid beside it:* QG1 (F191: a refund to a bare key repaid on the rail's proof; money owed to nobody named in the closing act, not blocking; a protection trapping every member with nobody gaining is a failure); F197 ("Yes, exactly": a notice with a deadline first, then the collective may close, the debt named and visible).

**Decided by Nobody, allegedly, 10 October 2026 ("Agreed"):** F197 applies to a one-time key as well: the collective addresses a notice to that key, as directly as the rail allows, with a deadline on a time reference; if the key's holder names where to pay in time, it is paid (QG1's first part); if not, the closing names the debt, visible and unpaid, and does not wait (QG1's second part). *Suggested by the project lead, built from QG1 and F197.* **The mechanic, delegated:** how a notice reaches a bare key (sealed to it where the key allows, otherwise published naming it, so its holder finds it by looking); where published openly, the cost to the payer's privacy (the key linked to this collective) is stated.

**Core changes:** Law draft 10, rule 37d and the notice (type 24) addressed to a one-time key; the closing's field 4. *To build:* the notice to a key; `f191` closing tests where a bare key now no longer blocks after its deadline.

## F209. F198 covers a pointer inside a fork whose taking-on was left out (QH6, 10 October 2026, afternoon)

**From** the F191 to F199 build, QH6: found by the invariants at 5,000 cases (seed `7145587436215071231`) once F198 was built: the pointer inside the history of a fork drawn on an old line, the act taking it on (rule 40, IT2a) outside; read literally, the pointer is void and the buyer's receipt with it. *Laid beside it:* F198 ("Feels like the only option, agreed"); IT2a; F181 ("as the chain stood").

**Confirmed by Nobody, allegedly, 10 October 2026 ("Yes"):** as built: for payments already made to it, a payee pointer is judged as the collective's own line stood without the ending, in both shapes (left outside the fork, or inside it with its taking-on outside); for anything after the fork, rule 47a. *Suggested by the project lead.* The sequence is the collective's own line (F109; F207's working practice).

**Core changes:** none beyond the build (Law draft 10, "Open in this draft": QH6 answered).

## The F191 to F199 build's readings, taken under the delegation (10 October 2026, afternoon)

*Taken by the project lead under the delegation of mechanics ("If the mechanic you find respect the rules we go ahead"), each checked against the decision it reads, none changing what a rule does; recorded as the project lead's.* Confirmed as written in `docs/f191-f199-build-2026-10-10.md`, "Readings taken, to confirm": **QG4, the chain** (with F206: a judge's contradicting settlements read as "unknown"); **F193** (the payer shown by a claim with a valid rail proof; on a rail binding no payer, nobody); **QG2** (the refund rail reached by `paid-to`); **QG1** (the rail's proof decides, the payee field unread); **F197** (the deadline is the time reference's answer; the notice sealed to the members too; with F208 for a one-time key); **F199 for closings**; **F195, "named again"** (by a constitutional clone, B10; with F207, never by a draft the resignation names). The F190 build's nine readings, as the build's table states them, likewise. **Parked, not confirmed:** the two readings of F192 ("holding"; the line after a judge's settlement) and the suggested client citation, since a forked deal is under exploration (above) and they may not survive it.

## Fable's review of the formats proposal, sorted (10 October 2026, afternoon)

*From* `docs/reviews/formats-proposal-review-2026-10-10.md` (merged). **The sort, proposed by the project lead and accepted by Nobody, allegedly ("Seems right."):**

**Taken by the project lead under the delegation of mechanics**, each following a decided rule, to be built with a test that fails first, recorded as the project lead's: the offer's field 3 given a payer-side form (F124, F125), checked against field 14, and, in a deal, an offer signed by every party, OF3 (a) (F107; selling alone stays possible under one's own agreement, shown as outside, rule 15b) (review 2.1 to 2.3, 3.1); the role share's evidence named by its role, any cMIP's act acknowledged by the committed payer's claim, never a transport cMIP's hash (7.2; F115, QG3, F184, F193, and F202's working rule); a request to a judge, and a settlement request, counting only where public or sealed to the judge it names (2.6; F189 (8)); a measurer none of the identities its metric divides among, nor the split service (2.7; F194); T-1 dissolved by reading Finance 10c's "the work's current one" as the current version of the claim the payment names (6.1; rule 15b, F72); Fable's readings of the remaining questions where the review shows they follow decided texts, the options decided texts exclude dropped (3.1), in Fable's order (section 9).

**For Nobody, allegedly, one at a time, in this order:** (1) OF10, late relay evidence: machinery on every split, or client conformance with a stated cost (7.1); (2) F-1, retiring the fee-terms act, type 15 (6.2); (3) FR3, an area holder adding a fee every stake bears (2.4); (4) FR5, a fee owed where the split omits a Module visibly used (2.5); (5) the offer's field 0, a sole seller with no agreement (7.3); (6) OF15, how a publisher is marked (rule 16); (7) a stake sold twice (2.8, parked with the forked-deal exploration as the same shape) and when a sale takes effect (2.9, leaning on a seller's own sequence); (8) the `unfilled` default and who keeps a lapsed refund (OF7).


## The release fix (10 October 2026, afternoon)

`docs/release-fix-2026-10-10.md` (merged): the reproducible-build test copied a hand-kept list of crates and missed the on-chain crate added by step 12a, so the copies could not build at all; main's tests had been red since the 12a merge. The test now reads the workspace's members from `Cargo.toml`, and shows Cargo's output when a build fails. *Found beside it:* GitHub's prebuilt wasm-bindgen writes "0.2.129 (165586f85)" into the WebAssembly's producers section where one installed by cargo writes "0.2.129", 12 bytes apart, so a rebuilder following `build-wasm.sh` got other bytes while told the tools were the same. **Option (a), taken by the project lead under the delegation** (it serves the decided aim that anyone on Linux x86-64 rebuilds the same bytes, and changes no rule): `build-wasm.sh` passes `--remove-producers-section`; the released bytes change once.

## F210. Late relay evidence: client conformance and a stated cost, no machinery (formats OF10, 10 October 2026, afternoon)

**From** the open formats proposal, OF10 (held role shares, a completing split, a new split key, a new rule 20, a changed delivery record, for evidence arriving after the money is divided), and Fable's review, 7.1: the premise has the order backwards; for locked media the client fetches the locked bytes before paying and writes its claim at payment (Finance rule 15), so the relay's record exists and is acknowledged in that claim; late evidence is a client that pays first. *Laid beside it:* "common case first" (Nobody, allegedly, 10 October); a common case must work by default, extra weight for rare cases only; F184 ("pay the pipe if you wish to", the builders' choice, legible); F194 ("good practice from client devs").

**Decided by Nobody, allegedly, 10 October 2026 ("Yes. The grammar is there to make it work, responsibility then goes onto the clients."):** no held shares, no completing split, no new key or rule. **Client conformance:** a buyer's client fetches, asks the relay for its delivery record, and acknowledges it in the claim written at payment. **Stated cost:** a record acknowledged after the split fills nothing. The two smaller items (one record, several payments; review 2.10) are stated costs, with the record spent for its payer's other claims naming the same object. *Suggested by Fable and the project lead.*

**Core changes:** the formats (split plan and split without the held form or key 9; the delivery record unchanged, CH16 and CH22 dropped); Law rule 22 or 20, the client conformance line and the cost. *To build:* with step 12b's formats.

## F211. A Module states its fee in its own specification; the fee-terms act retired (formats F-1, OF14, 10 October 2026, afternoon)

**From** the open formats proposal, flaw F-1 (Production's specification field 7 holds the fee terms' hash, and fee terms naming their Module would need the spec hash first: neither can name the other) and OF14; Fable's review, 6.2 (retire type 15; the plan's `fee` entry is the signed terms). *Laid beside it:* Production rule 16 ("Fees are standing offers"); F42 (creators earn through signed terms, not automatically); the core's "no cMIP or Module can force a fee"; legible greed.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, specs should carry as much as possible."):** a Module's specification carries its own fee in a field of its content (the rate, a part of each payment or a fixed amount, and the identity paid, absent the creator), so nothing must name both ways; **Law type 15, Module fee terms, is retired, never reused**. The rate is machine-readable and informative: a client shows a plan that pays less than the specification asks; the plan's signers decide what is paid, and only a plan's `fee` entry, signed by whoever bears it (rule 27), makes a fee owed; nothing is forced (F42). Rule 16 reads: a creator who charges states its fee in its specification. *Suggested by the project lead (Fable suggested retiring the act with the rate in plain words).* OF14 (a) to (f) fall away.

**Working rule, stated with it (Nobody, allegedly):** "specs should carry as much as possible."

**Core changes:** Production draft 6, the specification format (field 7 becomes the fee: rate and payee) and rule 16; Law draft 10, the act table (type 15 retired) and rule 27's "declared fee" (declared in the specification, owed as the plan says); core v21. *To build:* with step 12b's formats.

## F212. The layers renamed: Identity, Text, Envelopes, Money, Agreements, Development (10 October 2026, afternoon)

**From** FR3 (formats review 2.4), where the split plan was called part of "the Finance lane" by the review and then by the project lead. Nobody, allegedly: "No, Finance does not include the split plan. Splits are Law." … "We need to consider changing the name of the layers. Finance is misleading, because a lot of Finance stands on Law." *Laid beside it:* the Finance MIP's own purpose ("how a simple payment moves through MOR … and nothing about who owns what"); in common speech finance means ownership, shares and returns, which in MOR are Law.

**Decided by Nobody, allegedly, 10 October 2026:** "Identity / Text / Envelopes / Money / Agreements / Development. The old names is how we got here, what we got is something else." So: **Envelope becomes Envelopes; Finance becomes Money; Law becomes Agreements; Production becomes Development**; Identity and Text stay; listed in the order the MIPs were written.

**Checked by the project lead:** nothing on the wire changes: acts and declarations carry the layers as numbers (`layers::FINANCE = 2`, `LAW = 3`, `PRODUCTION = 4` in `core/src/law/formats.rs`), so the rename is wording and code names only; no rule changes. The essay's four pillars (Communication, Finance, Law, Production) are the author's worldview and stay as written. **Records keep their wording** (findings, reviews, build reports, earlier drafts): "Finance rule 15" in an old record means Money rule 15.

**To do:** one rename pass before freeze, after the builds now running are merged (to avoid conflicts): the core document, the six MIPs (new file names), the freeze suite, the cMIPs and Modules, case studies, companions, the website's texts, CLAUDE.md and the build brief, then the code's names (crates, modules, constants), with a short mapping note at the head of the findings log. The project's instructions on claude.ai name the old layers: Nobody, allegedly, to update them there (the project lead cannot).

## Q21 reaffirmed: an area left with no holder stays frozen, and the constitution must refit it (10 October 2026, afternoon)

**From** FR3 (formats review 2.4). Nobody, allegedly, first: "Always, if an area within the layers of a collective does not have defined acting IDs, the constitutional layer inherits the duties and powers." Laid beside Q21 (1 October: an area with no holder stands frozen until refitted) and the clone rule (operational matters outside every area), and drawn on a map of the collective's structure at his request. Then: **"Ok, I think the freeze was intentional. The idea was that if the areas was left unattended the collective was forced to act. So, the constitutional is called to act, but not on the lane, but on the constitution as to who operates the lane."**

**Reaffirmed by Nobody, allegedly, 10 October 2026:** Q21 stands. An area with no holder whose voice remains is frozen; the constitutional rule never acts inside it; its duty is to refit the constitution, naming who operates the area. *Stated cost, recorded by the project lead:* while a lane is frozen nothing is signed in it (for a Money lane, no receipts: payers' claims still record what arrives, double entry, Finance rule 10; the pointer stands); that pause is the pressure to act. *The project lead's earlier reading ("better, and it costs nothing") is withdrawn.*

## F213. Fees can be placed on their own, apart from the split plan (FR3, 10 October 2026, afternoon)

**From** Fable's formats review, 2.4 (FR3): the finest cut a constitution can give an area is a whole operational field; the plan's fees sit inside the split plan (field 8), so whoever holds the plan can add, alone, a fee every stake bears (fees come off the top, rule 26), while rule 27 asks for "the signature of whoever bears its cost". *Laid beside it:* rule 27; Q5 (areas exclusive, given by the constitution); F112 (one person, two identities); the map of the collective's structure; Q21 reaffirmed (the constitution names who operates, never operates).

**Decided by Nobody, allegedly, 10 October 2026 ("Fees are an act of Agreements, and the granularity of Jobs under Agreements should allow to set them individually from other tasks."):** fees are an Agreements matter that a collective's constitution can place on their own: an area may reach fees without the split plan, and the split plan without fees. Fees placed in no area fall, like every operational matter outside the areas, to the clone rule, never to the plan's holder alone.

**The mechanic, the project lead's under the delegation:** the plan's fee entries become their own operational field of the terms (a new `field-ref`), so the existing area grammar places them; an area reaching field 8 no longer reaches fees. *Not to be confused with F211:* that retired the Module creator's fee-terms act (type 15); this is the collective's own decision to pay a fee, signed under its agreement.

**Core changes:** Agreements (Law) draft 10, the terms (fees as a field), `field-ref`, rule 27's reading in a collective (the bearers consent by the power the constitution placed fees under); the formats proposal's plan format. *To build:* with step 12b's formats.

## F214. A fee is owed as the agreement states; a service that skips it is liable (FR5, 10 October 2026, afternoon)

**From** Fable's formats review, 2.5 (FR5: "a fee in the plan whose module the split names is owed on that split; one whose module it does not name is not", so a split service makes a declared fee not owed by leaving the Module out of key 6). *Laid beside it:* rule 26 (a split service must not change the plan); rule 27 (every split names the modules it ran under, so an omitted declared fee is visible); F211 (only a plan's fee entry, signed by whoever bears it, makes a fee owed); F128, W4 (the burden where the action takes place).

**Decided by Nobody, allegedly, 10 October 2026 ("Basically the agreement states, this will use module x and % will go to its dev. A service not respecting this is liable. Agreed"):** option (c). A plan's fee entry says when it applies, in terms a verifier can check (every payment; payments for a named publication; payments by a named rail); the service applies it as written; the split's key 6 is the service's statement, never what decides. A split that leaves out a fee the entry makes owed is a wrong split, and the fee is the service's open obligation, as a payout it skipped (rule 29). *Suggested by the project lead.* Not chosen: FR5 as proposed (the service's list decides); Fable's reading (owed where use is readable from the acts, the list deciding elsewhere).

**Core changes:** Agreements (Law) draft 10, rules 27 and 29 (a fee entry's scope; the skipped fee an open obligation of the service); the plan format (the fee entry's scope, absent meaning every payment). *To build:* with step 12b's formats.

## F215. A lone seller's offer is itself the agreement with the buyer (formats, the offer's field 0, 10 October 2026, afternoon)

**From** Fable's formats review, 7.3 and section 4 ("field 0 of the offer is required": a sole seller with no agreement, the commonest seller, cannot publish an offer, and a live stream, which only an offer sells, needs a one-party deal first). *Laid beside it:* rule 32 (owners publish terms that anyone accepts by paying; an offer is the only way to sell what has no work hash yet); Envelope, "Publication" (a publication's plain price); a common case must work by default.

**Asked and corrected by Nobody, allegedly:** to the project lead's "an offer under no agreement is a plain payment": "Well, the offer is an agreement with the buyer as well. It still needs to be defined publicly."

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, she has no co-ownership to manage. It's a bit like the collective with two faces. Offers need that additional element only where there is a coownership."):** field 0 is present only where an agreement of co-owners stands behind the offer; then everything is as proposed (the purchase names that agreement, refund terms come from its field 17, FR1). **A lone seller's offer names no agreement behind it and is itself the agreement between seller and buyer**: always public, carrying its price, its words, its deadline and, if the seller sets any, its own refund terms; the buyer's payment accepts them and refunds follow them. *The mechanic, the project lead's under the delegation:* an optional refund-terms field in the offer, used only where field 0 is absent.

**Noted by Nobody, allegedly, with it:** "an agreement with a payment rail can be based on % and that creates the need for the agreement even with a simple sale." *Read by the project lead:* a lone seller whose sales owe a percentage to anyone (a Module's developer, a service) needs a plan, so an agreement, even for a simple sale: a fee is owed only through a plan's fee entry (F211, F214); an offer with nothing behind it divides nothing and owes no fee.

**Core changes:** Agreements (Law) draft 10, rule 32 and the act table (an offer is always public; with no agreement behind it, the offer is the agreement); the offer format (field 0 optional; the refund-terms field); Money (Finance) rule 10c (a payment following an offer with nothing behind it is accepted under the offer's terms). *To build:* with step 12b's formats.

## F216. A publication is an envelope of an envelope, carrying two agreements (formats OF15, 10 October 2026, afternoon)

**From** the open formats proposal, OF15 (how a publisher is marked, so that a publisher's stake is told from an owner's: (a) type the stake's object, (b) mark the holder, (c) a position instead of a stake, (d) no publisher shares, fees only) and Fable's review (3.2, the `only-for` gap; OF1's `[1, work]` tied to it). *Laid beside it:* rule 16 ("A publisher may hold a stake in its publication, never in the work"); rule 15 (a publication is a neutral carrier, claiming nothing); rule 4 (a position: income without ownership); rule 15b; freeze scenario 1 (a waterfall split cMIP) and scenario 2. *Noted by Nobody, allegedly, on the project lead's first framing:* "If you sell it to me like that how can I state anything else than A"; the project lead then gave each option its strongest case.

**Nobody, allegedly's framing:** "What is a publication, it an envelope of an envelope, which carries two agreements. That is what it is." … "The work envelope (WE) defines how whatever gets to it is redistributed. The Publishing Envelope (PE) defines the terms of use, and the redistribution of the income between the participants of the PE agreement." … on recoupment: "we need to see how the recoupment can be structured, and wether we want to let participants structure it in many various ways."

**Decided by Nobody, allegedly, 10 October 2026 ("Yes. The owners have to all sign that agreement according to the rules of their deal and define the terms of the publication. The agreement of the work acts as a single use collective."):**
- **Two envelopes, two agreements.** The work's agreement (WE) redistributes whatever reaches the work among its owners. The publication's agreement (PE) sets the terms of use and redistributes the publication's income among its participants. Each owns only its own layer: a publisher's share lives in the PE's agreement, so "never in the work" holds by construction, and no stake needs marking as a publisher's.
- **The WE's owners are a participant of the PE agreement**, signing it by their own agreement's rule (in a deal, every party) and defining the publication's terms with the publisher; for that one agreement, the work's agreement acts as a single-use collective: one participant, its consent given by its own rule.
- **A sale through a publication passes outside in:** the PE's split takes what the PE agreement gives its participants and passes the WE's line onward; the WE's split divides what reaches it. A sale through the owners' own publication passes only through the WE.
- **Recoupment and every other shape** (flat shares, waterfalls, tiers, caps, recoup-then-share) are the PE's split, computed by the split cMIP its agreement names; participants choose among competing cMIPs; the running count each split already carries lets the WE's owners check recoupment themselves. *Read by the project lead with OF8's reading (the split cMIP computes `part`).*
- **Resale:** whoever acquires a PE participant's stake inherits the PE agreement, including the WE's line, which nobody on the PE's side changes alone (rule 26 at each envelope).

*Suggested by the project lead, from Nobody, allegedly's framing.* OF15's (a) to (d) fall away; rule 16 is rewritten.

**For the build, mechanics the project lead will settle under the delegation, or bring back:** how a PE agreement names the work's agreement as a participant and how its consent is read (its parties' signatures by its own rule: a deal has no keys, F186); how the WE's line is paid (a hop to the work's payee, a receipt naming the previous one, Money's routes); OF1's `[1, work]` (an offer selling any publication carrying the work) read against two agreements.

**Core changes:** Agreements (Law) draft 10, rule 16 (publication agreements in place of publication stakes), rule 15 and the definitions (the work's and the publication's agreements); Envelopes, "Publication" (the publication's agreement); the formats (stakes unchanged; the plan's participants may name an agreement); core v21; scenario 2. *To build:* with step 12b's formats.

## F217. A stake's sale takes effect on the seller's own line; the window before the service follows is legible, not banned (formats 2.9, OF19, 10 October 2026, afternoon)

**From** Fable's formats review, 2.9: under OF19 (a), a transfer counts for splits from the first split citing it, so a seller and a friendly split service choose when a sale takes effect, and the buyer, never sent a split, hears nothing. *Laid beside it:* W4 (F128: each holder settles on its own chain; "the clock is when each holder records"); F214 (a service not respecting the agreement is liable); rule 29 (a payout without its holder's receipt is the service's open obligation); F132 (the chain signature: "signatures needing an order no device can blur sit on the one line an identity never branches"); F109 and F207's working practice (the sequence named: the seller's own line).

**Explored at Nobody, allegedly's request ("Let's explore the honest edge"; "What public trails does it leave"):** devices blur the order of a seller's acts; a transfer signed as a chain signature fixes its place on the seller's one line; a receipt from a stale device moves no money on its own, since the service decides whom to pay; what remains is collusion between seller and service in the window before the service's first split citing the transfer, after which the service's own chain orders its splits. The trail: the completed transfer (held by the buyer), its chain signature (held by the seller's homes), the service's signed splits paying the seller for what he sold, the seller's payout receipts, the sales in the window, the co-owners who were told of the transfer and receive every split, on-chain payouts where used, and any anchors. It proves the pattern; only an anchor measures which splits fell in the window.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, it's an acceptable cost. Make it legible, don't ban it. This one leaves plenty of bread crumbs"):**
- **The rule (Fable's, in W4's shape):** once the seller has signed a stake transfer, a payout receipt he signs for that stake after it on his own line is a wrong receipt, counting for nothing; that payout is owed to the buyer as the service's open obligation (rule 29), the service settling with the seller.
- **The window, a stated cost, legible:** between the transfer and the service's first split citing it, a colluding seller and service can keep paying the seller; the buyer's protection is to anchor the transfer (F173, the theft window's shape); otherwise the trail shows the collusion and the service is liable once it is shown (F214). Not banned.
- **Mechanics, the project lead's under the delegation:** the seller signs a stake transfer as a chain signature (F132), so no device blurs its place; *client conformance:* a co-owner's and the buyer's client show a split that pays a seller for a stake he has transferred, beside the transfer.

*Suggested by Fable and the project lead.* OF19's split key 8 stays as the service's statement, never the moment a sale takes effect. The second-device case is answered by the chain signature; the build checks it and brings back anything that does not hold.

**Core changes:** Agreements (Law) draft 10, rule 14 (a transfer takes effect on the seller's own line; the wrong receipt; the service's obligation), the stake transfer format (a chain signature), the window stated as a cost with its client conformance; the formats proposal, OF19. *To build:* with step 12b's formats.

## F218. A role share nobody fills goes back to the owners unless the plan says otherwise (formats, the `unfilled` default, 10 October 2026, afternoon)

**From** Fable's formats review, section 4 (the `unfilled` default `[0]` is a choice, not a reading: rule 22 gives three outcomes, to the owners pro rata, held open as an obligation, or to a named party). *Laid beside it:* F210 (the relay acknowledged in the claim written at payment, so an unfilled share means none was acknowledged); Production rule 15 (a client shows what a plan computes on a concrete example before signing).

**Decided by Nobody, allegedly, 10 October 2026 ("Yes"):** absent a choice in the plan, an unfilled role share goes to the stakes, in proportion to their parts; held open or to a named party stays the plan's to write; the signer's client shows it before signing (rule 15). *Suggested by the project lead.*

**Added by Nobody, allegedly, with it:** "and who « owns the work » in shared ownerships is either defined or defaults to creator of the first act." Laid beside rule 15 by the project lead ("first act" read as the first publication would hand a carrier the work and make order evidence of authorship). Nobody, allegedly: "Ok, this is where MOR and reality and Law all friction. What we need to focus on is: in the eyes of MOR and here are all that MOR could record about the claims." **Decided ("Yes"):** in MOR's eyes, the owners are who the recorded work claim names, with the shares its agreement gives; where no shares are written, the default holder is **the creator who opened the work claim**; a client shows it "as recorded", with any contest beside it, never as legitimacy (rule 15: the core records claims and their order, never legitimacy). What MOR can record about a work's claims, listed by the project lead: the work claim and its co-creators' signatures; the agreement behind it and its versions; order on each identity's own line and where lines knot; anchors; keepers' records; a claim cMIP's pre-publication commitment; competing claims shown as openly contested; contests and standing; publications carrying the work, as carrying; stake transfers on their sellers' lines.

**Core changes:** Agreements (Law) draft 10, rule 22 (the default) and rule 15 (the default holder where a claim's agreement writes no shares); the plan format (field 3 absent means `[0]`). *To build:* with step 12b's formats.

## F219. A refund past its terms is ended; bad-faith terms stay public (formats OF7, 10 October 2026, afternoon)

**From** the open formats proposal, OF7 (how a refund's "how long" is measured, and whether a lapsed refund blocks a closing) and format 3's "the owners keep the money"; Fable's review (Finance rule 7 lists "past its terms" as a state beside "discharged" without saying the obligation ends; the closing half belongs with Part F). *Laid beside it:* F215 (the buyer accepts an offer's terms by paying); QG1 and F197 (what can never be paid must not freeze a collective forever).

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, and bad faith terms remain public."):** a refund past the terms the buyer accepted by paying is **ended**: the obligation closes there, the owners keep the money, and it does not block a closing. Terms written in bad faith (a deadline too short to use, say) are not refused; they stay public, as every agreement's terms do, for anyone to judge. *Suggested by the project lead.* **The mechanic, the project lead's under the delegation:** the deadline is a fixed point on the agreement's time reference (OF7 a; for a lone seller's offer, on the offer's own, F215); *client conformance:* the buyer's client shows it before paying.

**Core changes:** Money (Finance) draft 6, rule 7 ("past its terms" ends the obligation); Agreements (Law) draft 10, the closing (a refund past its terms is not a debt that binds it), terms field 17; the formats (refund terms, OF7). *To build:* with step 12b's formats.

## F220. A payment counted, then erased by a deeper rewrite: final for whoever counted it (rail build Q1, 10 October 2026, evening)

**From** `docs/onchain-rail-f200-f205-build-2026-10-10.md`, Q1: after a rewrite of Bitcoin deeper than the confirmations, F205 keeps a counted payment counted while F204 answers "unknown" for a block not on the chain followed; a verifier that only ever saw the new chain cannot hold both. *Laid beside it:* F204 ("Yes B."); F205 ("Hard for me to imagine, so I will agree with you. But, never say never."); F192 ("settle is final for what signers could see").

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, 1 seems right"):** option 1, as built. A payment is final for whoever counted it, and nothing built on it reopens on its own; a verifier that never held its block answers "unknown". After such a rewrite two verifiers can disagree: that is the stated cost F205 already names. F204 stays exact. *Suggested by the build and the project lead.* Not chosen: a kept branch counting (changes F204's "not on the chain"); a side branch at the chain's own difficulty counting (reopens forgery, undoing F204).

**The build's four readings, taken by the project lead under the delegation** (each reads a decision, none changes a rule): (1) a pending claim protects only with a payment shown (on-chain the transaction; on Lightning the preimage), F203; (2) where a clock's main and backup references differ, rule 15 reads each its own way (F201 on Bitcoin, F203 elsewhere), F179; (3) "before or at" on Bitcoin includes the lock change's own block (F178, item 6); (4) a lock change's point on the Bitcoin clock needs its home receipts anchored on Bitcoin, which step 14a's service does; until then a client states those anchors.

**Core changes:** none beyond the build (the Module's "Costs, stated" and Finance rule 15 already carry it). *Merged the same evening, main `5dfa1d4`; the display client to be released again.*

## Step 14a built (10 October 2026, night)

`docs/anchoring-step-14a.md` (branch `claude/amazing-hypatia-nkwjwf`, merged the same evening): the pooled anchoring service on Bitcoin. The anchoring cMIP **draft 2** and the Bitcoin clock Module **draft 2** written (drafts 1 kept, superseded): the batch, domain-separated with one proof per leaf (review 7d; section 9, item 6); the batch anchor, a sibling of the on-chain rail's rule with the same tweak and header checks against the chain followed and no amount, final at six (F204, F205); the service's offer with each urgency tier's price, the ticket naming its batch and deadline, and each batch published with its leaves in a signed act, so that a batch published without a paid leaf is a provable omission and no anchor by the deadline a default (section 9, items 2 and 3), each a refund owed; what the service learns stated (items 8 and 9; it never learns the act). A lock change's point on the Bitcoin clock read from its home receipt's batch anchor (F220, reading 4), and the delay a service can still impose within its tier pinned by a test. Each change built with a test that fails first; end to end on regtest. **The core library unchanged**; Rust 534 passed. Every mechanic marked as the build's. **Three questions for Nobody, allegedly:** Q1, who pays the output and the fee when a batch costs more than its pool; Q2, where the refund owed on a default lives (Finance rule 10a's path, or the offer's terms); Q3, whether the owner's client should anchor a lock change through two services or by itself (rule 15's client conformance, F181 item 6). Four readings to confirm.

## F221. A settlement stands against a branch its signers never saw; the exploration closed; a client never signs two successors of one version silently (10 October 2026, evening)

**From** Fable's hostile review of the exploration "a forked deal is broken, like a collective" (`docs/reviews/forked-deal-broken-review.md`, merged): the shape is today's settlement with finality removed; a hidden sibling becomes a standing option to revert any repaired deal, at the hider's chosen time, repeatable, and anchoring does not close it (the hider anchors early); the collective analogy voids two valid acts (F185 (4)); QH2 is answered only under DQ5-signing; the judge loses its purpose. *The project lead's error, stated:* it had told Nobody, allegedly, that the shape answered QH2 and left only a stall. *Laid beside it:* A3 (both rounds: "Settle is final… Only one survives… Matter closed"); F185 (4) ("a rollback voids only an act Law reads as broken, never a valid one"); F192 ("Yes agreed").

**Asked by Nobody, allegedly, before deciding:** "Concrete example again, Déjà vu feeling all over…" and "Let's walk the process and see whose behavior caused it precisely." *The walk, the project lead's:* every hidden branch passes through one point, a party signing two different successors of the same version: carelessly (a client signing a second draft without warning, then signing a settlement that does not name the first) or deliberately (settlers hiding a branch they signed). The one hurt is always someone who did not double-sign, or did so unknowingly. QF1 and the exploration protected the hidden branch; F192 protected the settlers: the same fork, met a third time.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, if that is the version that shifts the weight and the responsible party the best."):**
- **Finality stands.** A settlement is final against a complete branch its signers never saw (F192, A3); the exploration is **closed**, not adopted. QH2 (a newcomer on a branch the settlers hid) is F192's stated cost, to be narrowed.
- **With it, the rule that shifts the weight to the responsible party** (client conformance, suggested by the project lead from the walk): before signing a successor of a version, a client checks, across all its owner's devices, whether its owner has already signed another successor of the same version; if so, it shows the first and does not sign silently; and a settling version the client signs names every successor of the reference its owner signed (IT2b's rule for endings, carried to deals). Accidental double signing disappears; what remains is deliberate, its trail public for good.

**Unblocked:** F206 (QH1) may be built; formats review 2.8 (a stake sold twice) is no longer parked with the exploration (Fable reads it as F217's shape: ordered on the seller's own line); QH2's narrowing is next.

**Core changes:** Agreements (Law) draft 10, rule 45b (finality restated; the exploration not adopted) and the client conformance line; F192's tests and Fable's `review_fdb_*` tests stand as the pins. *To build:* with F206.

## F222. QH2: a stated cost, narrowed by the joiner's client check; a keeper for deals that want more (10 October 2026, evening)

**From** QH2 (a newcomer on a branch the settlers hid, dropped by a settlement that does not name it), after F221 (finality stands; no silent double signing of one version's successors). *Laid beside it:* DQ5 ("Carla needs to sign either way"); Q28 ("deals that need protection name a keeper"); F176 (protection is available; whoever does not take it bears); Fable's review, section 12.

**Decided by Nobody, allegedly, 10 October 2026 ("Agreed"):** QH2 is F192's stated cost, now reached only by settlers who knowingly double-signed past their clients' warnings, their signatures public for good. *Client conformance:* before a newcomer signs onto a deal, her client looks for another successor of the version she joins, at the parties' relays and keepers, and warns her if it finds one. *For deals that want more:* a keeper, as Q28 already says; nothing new in the core. *Suggested by the project lead.* Not chosen: settlements signed as chain signatures (a ceremony on every settlement).

**Core changes:** Agreements (Law) draft 10, rule 45b's stated cost and the client conformance line. *To build:* with F206 and F221.

## Step 14a's readings, taken under the delegation (10 October 2026, evening)

*Taken by the project lead under the delegation of mechanics, each reading a decided rule (step 14a's "a paid hash missing after the deadline is a provable default"; F201, F204, F205), none changing what a rule does; recorded as the project lead's.* From `docs/anchoring-step-14a.md` (merged): (1) a leaf moved to a later batch is an omission from the batch its ticket named, and still counts as an anchor at its block; (2) late is a default, owing the price back, and still counts as an anchor at its block; (3) a payment for a hash follows the service's payee pointer as a tip does, the anchoring offer being an act of the anchoring cMIP, not a Law offer; (4) the default is read on the verifier's own chain once its tip reaches the deadline plus five. **Three questions for Nobody, allegedly, open:** AQ1 (who pays when a batch costs more than its pool collected), AQ2 (where the refund owed on a default lives: Finance by rule 10a's path, or the offer's terms in Law), AQ3 (whether an owner's client SHOULD anchor a lock change through two services, or by its own transaction).

## The evening's builds: readings and mechanics taken under the delegation (10 October 2026, night)

*Taken by the project lead under the delegation of mechanics, each reading a decided rule, none changing what a rule does; recorded as the project lead's.*

**From `docs/deals-owning-build.md` (merged):** D1 (a judge's two settlements read "neither holding the other" with F192's history); D2 (a judge that contradicted itself stays "unknown" on that fork for good); D3 (F221's "across all devices": the verifier reads the owner's acts, gathering them from the owner's homes is the client's part); D4 (F223's debt is the part of a payout above the seller's remaining due, owed by the service to the buyer). **QK2, taken as option (a):** a later version that names (cites) a transfer absorbs it, and only transfers it does not name are subtracted from what the seller still held; a share bought by transfer counts as the buyer's from the transfer: F224's "what the seller still held at that point", read so a written-in buyer is not counted twice. **QK4, the project lead's own two mechanics in conflict, resolved as built:** the payment names the transfer it fulfils (a transfer may still name a payment made before it); the over-sale's payment is owed back by the seller either way. *The project lead's error, stated:* "a transfer names the buyer's payment" and "a buyer pays only once the transfer is receipted" could not both hold.

**From `docs/anchoring-second-pass.md` (merged):** its three readings (an anchoring offer's field 2 is the most one hash costs; its refund point is a block, past once buried six deep; repaid wins over ended). **RQ1, taken as option (1):** the payment cMIP's `paid-to` gains a form paying to the refund rail a claim names (its key 7), so QG1 and QG2 become checkable as decided; a format change in the payment cMIP only. *To build.*

**From `docs/collective-client-fix-12b.md` (merged):** the client's test rewritten (it pinned the split plan's "format open"); F207's client half built (the resign flow names the drafts left behind). Left open there, for Nobody, allegedly: whether stepping down from one area names drafts too.

**Open for Nobody, allegedly:** QK1 (two links of the chain of judgment each settling the fork, neither holding the other); QK3 (QJ2's receipt by the work's service against H5 and H7: a grant key never signs a split's payout); the live work review's six questions (`docs/reviews/live-work-review.md`); a step-down naming drafts.

## The layers-and-judges build: readings, and F244 (10 October 2026, night)

**From `docs/layers-judges-build.md` (merged, pull request 1):** F242 written in (Money keeps payments, fields and states; Agreements state each obligation once); F235 with its amendment built (layer by layer, each service receipting in its own name; an owner's grant signs an incoming share only with the rail's proof; three layers); F236 built (the earlier judge in the chain prevails); F207's stepping-down half built (the collective client names the drafts left behind). Rust 585, TypeScript 205; no format changed, the vectors unchanged. *Readings R1 to R7 taken by the project lead under the delegation of mechanics,* each respecting the decided rule (R2: the grant is the one the owner already gave as a payee of the next layer's agreement, no new kind; R3: the rail's proof is the verifier holding the rail's valid answer for that receipt; R5: a deal inside a deal, up to eight layers; R7: a stepping down names the same drafts a resignation would).

## F249. Backup split services are a backup, not judgement; what counts as failure is a cMIP's (QW1, 11 October 2026, night)

**From** `docs/judges-vows-pointer-build.md`, QW1: once a deal's chain has passed to a backup split service, is the backup the designated pointer, or must the agreement be cloned first? **Nobody, allegedly:** "This is not a line of judgement. It is truly a back up if users wish to. It acts if the previous one fails, which means, failure has to be defined. To me, it's cMIP arena as so much depends on rails and such."

So: backup split services are optional, in order, chosen by the owners; a backup acts, and becomes the designated pointer (F248), only once the one before it has failed; **what counts as failure is defined by a cMIP the agreement names**, since it depends on rails and services; the core only follows the order once that cMIP says a service has failed. *The project lead's note, the consequence:* H6 (5 October, "feels right") placed a deal's backup services in its chain of judgment; by these words they are not judgement, so they would leave the chain of judgment for an ordered backup list of their own, F246's stages and deadlines not applying to them. **Confirmed by Nobody, allegedly, the same night: "It is different yes. A judge chain has stages. A back up chain has attempts if previous one fails. Everything reverts back if attempts 1 succeeds."** So backup split services leave the chain of judgment (H6's placement superseded; H6's grants per payee stay) for an ordered backup list of their own. It runs by **attempts, per payment**, not by stages: each payment is tried at the designated pointer first; only if that attempt fails, as the named cMIP defines failure, is the next backup tried, and so on; the next payment starts again from the first. The designated pointer (F248) is always the first; a payer's obligation ends when the payment reaches the first service in order whose attempt succeeds, with Money's receipt as proof. F246's stages and deadlines do not apply to backups.

**Core changes:** Agreements draft 10 (terms: an ordered list of backup split services and the cMIP that defines a failed attempt; H6's chain-of-judgment placement removed; rule 16, rule 18's payee pointer check, the split plan; F248's designation is the list's first); the library (`layer_receiver` accepts a payout to a later service in the list where the caller states the earlier attempts failed, as with `judges_lapsed`). *To build.*

## The judges, vows and pointer build: readings (11 October 2026, night)

**From `docs/judges-vows-pointer-build.md` (merged, pull request 4):** F246 built (the chain runs per question: the first valid request starts the active link's period; later requests join it; a lapsed link is void on that question; a settlement outside its link's window counts for nothing; F236's code and test removed; QG4's test answer changed accordingly); F247 built (`outside_claims`: an offer on a claimed vow or work, not under the claiming agreement, is shown, still counting); F248 built (`layer_receiver`: field 14's one service is the designated pointer, or a lone owner's own pointer; the chain's backup services not designated). Rust 597, TypeScript 219; no vector changed. *Readings J-R1 to J-R5, V-R15 to V-R18 and P-R1 to P-R4 taken by the project lead under the delegation of mechanics.* *The project lead's error, stated:* QV2 was put to Nobody, allegedly, on the vow build's premise that "each payee may grant its own split service"; the texts already require every field 14 grant to name the same service, so an agreement names several services only through its chain of judgment. F248's rule stands; its premise was misread, and the project lead put it forward without checking. **Open for Nobody, allegedly:** QW1 (once the chain of judgment has passed to a backup split service, is the backup the designated pointer, or must the work's agreement be cloned first?).

## F248. A work agreement designates one address for payments; a publisher points to it (QV2, 11 October 2026, night)

**From** `docs/vow-grammar-build.md`, QV2: in a deal each payee may grant its own split service (field 14 is a list), so an agreement may name several; as built, a payout to any of them counted. *Options put:* (a) any; (b) none until the deal names one; (c) the first listed. **Decided by Nobody, allegedly: "The publisher pays the one designated by the work agreement. A work always accept payments at the same addresses. The publisher simply points to it."** So a work's agreement designates the one pointer at which it accepts payments, the same whoever pays (a buyer directly, or a layer above); the publisher points there and divides nothing. An agreement that designates none, or names several without designating one, cannot be paid through a layer until it designates one (option (b) in effect). *Suggested by the project lead (b); the rule's form Nobody, allegedly's.* **Its reason, in his words:** "Yes, that is the idea of the two envelopes. Publisher does not care what happens in the work's envelope, it simply pays to it." (F216: two envelopes, two agreements.) **And, the same night:** "Yes, it keeps matters separated and pointing rules easy. Work Agreement states pointer, publishing agreement states cut. Publisher delivers cut and its responsibility ends there." So the publisher's obligation for the work's share is discharged once that share reaches the work's designated pointer (Money's receipt shows it); what follows is the work agreement's alone. Its benefit, in his words: "clear segmentation also helps pinpointing the cause of problems, or bad actors."

**Core changes:** Agreements draft 10 (the terms designate the work's one payment pointer; rule 16 and the split plan read it; F244's "the one pointer" is that designation); the library's `layer_receivers` reads the designation only. *To build,* with F246 and F247.

## F247. An offer on a claimed vow, outside the claiming agreement, is shown as such (QV1, 11 October 2026, night)

**From** `docs/vow-grammar-build.md`, QV1: rule 15b marks a publication or standing offer for a claimed *work* made outside the claiming agreement; F237 sells a vow "under whatever agreement claims it", and F232's line 5 said the same for streams before moving to the cMIP. *Options put:* (a) rule 15b reads a vow's name as it reads a work's; (b) the cMIPs decide. **Decided by Nobody, allegedly ("Agreed"): (a).** One rule for anything sold under a claim, bytes or not: a buyer sees that the seller is not the agreement claiming the vow. *Suggested by the project lead.*

**Core changes:** Agreements draft 10, rule 15b (a vow's name read as a work's); the library's showing of such an offer. *To build,* with F246.

## The video on the site: merged (11 October 2026, night)

**From `docs/video-on-the-site.md` (merged, pull request 2):** the video Module draft 1 (MP4, H.264 pictures, optional AAC sound; read and checked before playing, never decoded to check; stripped of everything but the film before publishing, byte for byte; limits 67,108,848 bytes, ten minutes, 1920 by 1080), the website cMIP draft 4 (a page may show a film of its own version with a poster of its own version; nothing from elsewhere), and the display client's player (fetched only on play, checked against the signed version, inline on an iPhone, never starting with sound). The WebKit failure was a known harmless notice the film tests did not yet filter, and the test builds sharing one folder; fixed in the tests only; WebKit and Chromium 27 of 27. *The project lead's merge of main into the branch* resolved one conflict in `cmips/README.md` (both lines kept). *Readings 1 to 15 taken by the project lead under the delegation of mechanics.* The drafts are not yet approved (with the rest, at the end of the roadmap). Not yet published: the film goes out with the site's next version, at the top of the sections (F243).

## The vow grammar build: readings (11 October 2026, night)

**From `docs/vow-grammar-build.md` (merged, pull request 3):** F237 and F240 built (the vow act, Envelopes type 5, its genesis id its name, later versions on its own chain; an offer's `sold` naming a vow, its words required; each sale pending, confirmed by an act the buyer acknowledges, or contested by the buyer's contest; only someone who signed onto it, at any price including none, moves a sale; a vow nobody signed onto carries no state); the stream rules moved to `cmips/cmip-live-media-draft-1.md` (experimental, no code); F230's cost corrected as F237 says; F244 built (the layer above pays the one pointer the next agreement names). Rust 593, TypeScript 205; no vector changed. The texts say "announcement" until the redraft before review (F241); the code says `vow`. *Readings V-R1 to V-R14 taken by the project lead under the delegation of mechanics.* **Open for Nobody, allegedly:** QV1 (is an offer naming a claimed vow, made outside the claiming agreement, shown as such, as rule 15b does for works?) and QV2 (a deal whose payees name several split services: which is "the one pointer"?).

## F246. One agreed deadline per stage: a judge whose stage has passed is void for that question (supersedes F236; 10 October 2026, night)

**How we got here** (walked through at Nobody, allegedly's request, "Rewind that back how did we get here"): F121 (the chain of judgment); Q7 (each link names a period); **N6, 3 October** ("if the next judge is triggered, the previous judge is void"; an answer after the period counts for nothing); QG4 (forks follow the chain); the deals-and-owning build's QK1, which read N6's "the period runs from a signed request" as one clock per request, so two links could each settle one fork; F236 (the earlier link prevails), put without N6 beside it. *The project lead's error, stated:* N6 already answered QK1; the per-request clock was a build's reading, never decided.

**Decided by Nobody, allegedly: "There is no 'one party deadline'. There is an agreed deadline."** The chain runs on the agreement's deadlines, stage by stage, for the question (a disputed fork, or any question put to the chain), not per party: the first valid request with standing starts the active link's period; later requests on the same question join that stage; when the period passes without an answer, the next link is active and every earlier link is void on that question (N6, F245). Only the active link can settle. So QK1's case cannot arise, and **F236 is superseded** (it stays as a record). F192 (a settlement holding another is after it; the first counted is final) and F206 (a link that contradicts itself has spoken for nothing; the chain moves on) stand. *Mechanic taken by the project lead under the delegation:* the period is measured on the agreement's time reference from the first request that counts (rule 34a, type 25); a settlement signed by a link outside its active window counts for nothing. *QL3 read the same way, the project lead's:* the rule is the chain's, so it holds for every judge the chain serves, one active link per question.

**Core changes:** Agreements draft 10, rules 34a and 45b (F236's sentence replaced); the library's `deal_walk` (the earliest-link rule replaced by the active-link window); the F236 test replaced. *To build,* after the vow grammar build.

## F245. The currently active judge settles (QL2, 10 October 2026, night)

**From** the layers-and-judges build, QL2: where the earlier judge in the chain settles after seeing the later judge's settlement (the later one called because the earlier let its period pass), F192 keeps the first counted (the later judge's), while F236 read literally gives the earlier judge's. *Options put:* the later judge's stands (finality; no reward for lapsing), or the earlier judge's (the chain as hierarchy). **Decided by Nobody, allegedly: "Yes, the currently active judge settles it. Who that is depends on the chain of succession and what stage was activated."** The later judge's settlement stands: once the chain's rules activated the next stage, the earlier judge is no longer the one who settles. *Suggested by the project lead (that it stands); the principle, the active judge, Nobody, allegedly's.* **Open, asked next:** whether a stage is activated per request (as built, so F236's case can arise) or for the whole fork (one active judge at a time, which would make F236's case impossible).

## F244. The publisher pays the pointer the work's agreement names (QL1, 10 October 2026, night)

**From** the build, QL1: F235 has each layer pay the next layer's split service, but an agreement may name none (payer-side splitting); as built, the split showed a mismatch. *Options put:* (a) such an agreement cannot be carried; (b) the earlier service pays the owners directly; (c) as built.

**Nobody, allegedly:** "Split services become pointers where needed, if there is nothing to split at the work level no split is needed… but publishers will always need one." "A work with several owners has its own agreement. Either use a split service or have someone act as a treasury for the joint venture. I'd pick the first." **Decided: "The publisher pays the pointer specified by the work's agreement."**

So the layer above never divides the next layer's share: it pays the one pointer the next layer's agreement names for money arriving from above. Behind that pointer is the next agreement's own business: a lone owner's payee pointer (nothing to split), a split service, or an owner acting as treasury for the joint venture (preferred by Nobody, allegedly: a split service). An agreement naming no such pointer cannot be paid through a layer until it names one. *Suggested by the project lead (the restatement); the rule Nobody, allegedly's.*

**Core changes:** Agreements draft 10, rule 16 and the split plan (the receiver of a layer's share is the pointer the next agreement names; replaces "the next layer's split service"); the library's `split` and `layer_services` read that pointer. *To build,* with the vow grammar build.

## F243. The explainer film plays on dubsar.org's front page, carried by MOR (10 October 2026, night)

**Asked by Nobody, allegedly:** "What will be needed to run the video via MOR?" *The project lead's answer:* nothing in the core (a film is bytes; Envelopes carry any bytes); above it, a video Module (the format, MP4 with H.264, and the checks a client runs before playing), room on the homes (64 MB per media object today; the 3-minute draft is 23 MB), a website cMIP draft letting a page use a video file of its own signed version, a player in the display client, and publication by the test identity. **Decided by Nobody, allegedly ("Project managers hate me. Yes it should"):** the film lives on dubsar.org's front page. *Noted:* a longer or sharper film needs the media cMIP that serves one object in parts from many homes, not yet written.

**Changes, none to a MIP:** a video Module draft 1; the website cMIP draft 4 (rule 12: a `video` element naming a file of the same version, with a poster picture); the display client's player. *To build;* the film's final version is published later with the site's next version. **Where it sits (Q1 of `docs/video-on-the-site.md`), Nobody, allegedly:** "I have walked a few options in my head and can't settle it. Probably below the 4 sections." *Then, the same night:* "I can see it. The earth, the two buttons. The invitation to scroll. The scroll, the section, the top one the video, lazy mind picks video over text, keep scrolling, play video." *Read by the project lead* as: the film is the first thing after the scroll, at the top of the sections, above the four. **Nobody, allegedly: "Not exactly what I said, but a happy accident. Approved."** So: the first act and the two shortcuts stay as they are (the layout of 7 October keeps nothing under the first act). To be checked on his phone with the site's next version.

## F242. What Money states and what Agreements decide: the rename pass's M1 to M8, item by item (10 October 2026, night)

**Asked by Nobody, allegedly:** "Let's verify what belongs where." Each sentence the rename pass found (`docs/rename-pass.md`, part 3) is read against F225: Money says which rails, units, where to, that money moved, or asks that it move; Agreements say what must happen in return or in consequence.

- **M1, Money rule 7, "past its terms": decided ("Yes").** Money keeps the state and shows it (past its terms: nothing moved); the obligation's end, who keeps the money and that it blocks no closing are Agreements' (rule 32, F219), and Money points there.
- **M2, Money rule 10c, a payment that is no purchase: decided ("Exactly, that is the spirit").** Field 9 naming the claim, and the payment commitment carrying it on the rail, stay in Money; whether the payment is a purchase and what is owed when it is not are Agreements' (rule 32a); a refund owed is paid by Money rule 10a.
- **M3 to M8, delegated ("I think you can lay it safely to the rest"), taken by the project lead as the rename pass suggested, recorded as the project lead's:** M3 (a push rail: each holder settles on its own chain whether its receipt is a sale, Agreements rule 32a saying what it owes otherwise); M4 (a collective seller: when a payment becomes a sale, F127 and W2, and what is owed otherwise, are Agreements'); M5 (the stated cost: a Money-only wallet can pay a claimed work's publication but cannot tell whether it bought it; what is owed is Agreements', and it can still receive the refund); M6 (a stake transfer's over-sale: what the payment buys and what the seller owes are Agreements rule 14's, which no longer cites Money as its ground but says the refund is paid by Money rule 10a; the circular citation ends); M7 (an unclaimable refund stays open and visible and nobody can take it, which stays in Money; what that means for a broken collective's closing moves to Agreements rule 37d, QG1); M8 (when a payout counts as discharged stays in Money; what the split service owes for a shortfall is Agreements', the split plan, F64, F214; amounts below a rail's minimum cannot move until they reach it, F50). In every case the refund's payment stays in Money (rule 10a). No rule changes what it does; each obligation is stated once, where F225 places it.

**Core changes:** Money draft 6, rules 7, 10a, 10c and 18a; Agreements draft 10, rules 14, 32a and 37d (the obligations stated there, citing Money only for how a refund is paid). *To write,* with the layers-and-judges build.

**Main went red after the merge, and was fixed (10 October 2026, evening;** `docs/rename-ci-fix.md`, merged**).** A test file added to main while the rename branch was open still used the old module names; the merge had no textual conflict, so it compiled on neither side's tests but failed on their union. One test file renamed; Rust 581 and TypeScript 204 passing; the vectors unchanged. *The project lead's error, stated:* the merged tree was pushed to main untested. *Working practice from now on:* a branch is merged through a pull request (the tests run on pull requests), or its merged tree waits for the tests before the next step builds on it.

## The rename pass's questions: readings taken under the delegation (10 October 2026, evening)

*Taken by the project lead under the delegation of mechanics and "wording on technical matters is your realm"; recorded as the project lead's.* From `docs/rename-pass.md` (merged): **Q2,** "everyday act" and its family keep the word: they name the acts the signing key signs, not the key, and every act is signed, so "signed acts" would mislead. **Q3,** the collective page's `law` reading property becomes `reading`, in the next client build. **Q5,** the persisted fields (`safety`, `safetyThreshold`) and the file labels stay until the test identities are wiped before the first real acts (step 16b), so no test file needs converting. **Q4,** the paper, the run guide and the project-lead prompt follow the new names at their next drafts; the roadmap is a record and keeps the names of its day, new rows using the new ones. *Open for Nobody, allegedly:* **Q1,** moving M1 to M8 from Money to Agreements as F225 asks; and Q4's one page v10, his own redraft.

## F241. The layer names stay as F212 set them; vow lands in the redraft before adversarial review (10 October 2026, evening)

**Nobody, allegedly**, having opened "Agreements instead of Law is meh. Let's be poetic on all layers and see what comes out", weighed for the Agreements layer: Pact, Accord, Covenant, Concord, Clasp, Troth, Handfast, Weft, and Law again ("Law still sounds the best"; "Law felt arrogant"); then asked what the layer does now (binding, sharing, governing, settling, departing). **Decided: "Let's keep agreements for now, keep vow for a later redraft, before adversarial."** The six names stay Identity, Text, Envelopes, Money, Agreements, Development (F212). The word vow (F239, F240) goes into the texts in a redraft before the machine review and round 3. *Mechanic taken by the project lead under the delegation:* code written before then for this act uses "vow", so nothing new needs renaming later; F237's texts keep "announcement" until the redraft.

## F240. Only someone who signed onto a vow may confirm or contest it (10 October 2026, evening)

**Raised by the project lead:** F237's states belong to each sale, so a vow nobody signed onto has no state, and someone it touches could not contest it without buying in. **Decided by Nobody, allegedly: "Only a person who signed to use the vow should be able to contest it."** A vow with no counterpart carries no state in the core. *The project lead's note:* signing onto a vow may cost nothing (an offer at no price); who may sign, and at what cost, is the cMIPs' and the fork's. **His use, the same evening:** "It can also be leveraged in the democracy case. Citizens express needs, vows are drafted to meet them."

## F239. Tallies are renamed vows, so the word "tally" keeps its meaning (10 October 2026, evening)

**Nobody, allegedly:** "Argh. Wait it was also my fear. To keep tally… vow it is then." Supersedes F238's word; F238 stays as the record. The vote count keeps the word "tally"; nothing is reworded. Vow is used nowhere else in MOR.

## F238. Announcements are renamed tallies (10 October 2026, evening)

**Nobody, allegedly:** "Maybe announcements is the wrong label… got a better one?" Weighed: promise ("a cleaner description"), pledge ("sounds better"; in law a pledge is collateral), then poetic options: vow, oath, tally. **Decided by Nobody, allegedly: "Tally. I like it."**

*The project lead's note on why it fits:* a medieval tally was a stick notched with a debt and split in two, seller and buyer each keeping half; matching halves settled it. F237's grammar is the same: a tally (its own chain, its genesis id its name), offers naming it, each sale pending, confirmed by acts the buyer acknowledges, or contested.

**The collision, stated:** the code and texts already use "tally" for counting a collective's votes (`core/src/law/view.rs`, `formats.rs`, `chain.rs`, the collective and desk clients, about 25 files). *Mechanic taken by the project lead under the delegation:* the vote count is reworded ("count" of votes) when the tally act is built, so the word keeps one meaning. F237 and F229 to F234 keep the word "announcement" as records.

## F237. The core keeps the grammar of announcements; what is claimed, delivered or became moves to cMIPs (10 October 2026, night)

**From** Fable's review of announcements (`docs/reviews/announcements-review.md`, merged): an announcement's claim covering what it became is a backdated claim on anything (Mara closes an anchored "album, next year" on a stranger's record); the closing, the announcer's act, binds the creators' claim; "a ticket sold twice is caught as F224 catches a stake" is false (nothing counts payments under an offer); when a sale of an announcement is complete is unclear; "computed, never declared" overclaims; two closings and offers after a closing are unsaid; "something MOR cannot hash" reaches every good and service, two forms for one task; F230's cost misstates what a rotation voids. *The project lead's errors, stated:* the F224 sentence in F233, and the check that announcements "replace nothing".

**Nobody, allegedly:** "we must separate the claim and confirmation grammar from what will be claimed and confirmed. in other words, a whole lot of this needs to come down to cMIPs. core wants to know, was the claim in the offered deal respected. so, the core only wants to know whether it is confirmed, pending, or already contested."

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, I think this is cleaner and what I did before was an overreach. The core should not care."):** the core keeps **only the grammar**: an **announcement** (an act naming something to come, its id its name); **offers naming it**, with their words, under whatever agreement claims it; and **the state of each sale: pending, confirmed or contested** (confirmed by acts the buyer acknowledges, F193's shape; contested by a contest act; otherwise pending): was what the offered deal promised respected. **Everything about the substance moves to cMIPs:** what is claimed or delivered and how it is confirmed; what an announcement became (an album, a recording, a chair) and how claims reach it (by an ordinary work claim, dated by itself under rule 15, so nothing is backdated); quantities and seats; delivery points; kinds (tickets, preorders, commissions); and **streams**: their segments, who signs them, their closing, branches and the recording's computation, which F230 to F232 had placed in the core, keep their content and move to the live media cMIP. *Suggested by the project lead, from his words.* Fable's questions 1 to 7 dissolve into the cMIPs; question 8 stands as a correction (a rotation voids the opener's own acts after the kept tip, never a name others wrote down). The terminology note stands.

**Core changes:** the announcement act and its id; the offer's `sold` naming an announcement; the three states of a sale and how each is shown; rule 15 unchanged (works only); the stream rules removed from the core's list into the live media cMIP's. F230 to F234 keep their wording as records.

**Added by Nobody, allegedly, the same night:** "it's a fingerprint for the announcement, since it will have its own chain it has a genesis." An announcement has its own chain: its first act is its genesis, whose id is its name for good; later versions (a new date, a changed description) are signed again on that chain, each naming the first, as offers' and agreements' versions do. *The project lead's note:* the id is the announcement's fingerprint, never a work hash.

**Its reason, in his words:** "By keeping the grammar lean, the same tools can be used for concerts, sports events, live streams, gigs,… the cMIPs used by the sub fork will decide."

## F236. When two judges in the chain each settle a fork, the earlier in the chain prevails (QK1, 10 October 2026, night)

**From** `docs/deals-owning-build.md`, QK1: the chain of judgment turns per request, so where the first judge let its period pass on one party's request but answered another's, the first and the next judge can each settle the same fork, neither holding the other; as built, the verifier refuses to name a version in force. *Laid beside it:* QG4 ("If a fork ends up being disputed it needs to follow the chain described in the agreement"); F206 (a judge that contradicts itself has spoken for nothing; the chain moves on). *Options put:* both void (deadlock a party could engineer); the earlier prevails; the later prevails (rewarding a request left to lapse).

**Decided by Nobody, allegedly, 10 October 2026 ("Yes … The second judge only gets actioned under pre set rules. Once the rules apply, its voice stops mattering."):** the earlier judge in the chain prevails: once it has settled the fork, on any party's request, the later judge's settlement of the same fork counts for nothing; a later judge acts only as the agreement's rules call it, and its voice stops mattering once the earlier one has spoken. F206 still applies within one judge. *Suggested by the project lead.*

**A principle restated by Nobody, allegedly, with it** (on F235's grant: "my point was that my statement always applies, within the limits. The question asked me whether something could happen, and that something could happen if the participant wished it"): within the protocol's limits, what a participant may do with what it holds is its own choice; a question "can this happen?" is answered by whether a participant who wished it could, within those limits.

**Core changes:** Agreements (Law) draft 10, rule 45b and rule 34a (the chain's order decides between links). *To build:* with F235.

## F235. Money passes envelope by envelope: each layer's split service receives in its own name and splits under its own agreement (QK3, 10 October 2026, night)

**From** `docs/deals-owning-build.md`, QK3: QJ2 (a), the project lead's mechanic, needed the work's split service to sign, with a grant key, for a payout of the publication's split; F129 (H5) and F130 (H7), decided 5 October, forbid a split service's grant key ever signing a split's payout ("a payout without the payee's own receipt stays the service's open obligation"). *Laid beside it:* H5, H7; F216 (outside in); F112 (one operator, two identities); freeze scenario 7 (a music service's pro-rata and user-centric sharing). *Options put:* (a) an exception to H5/H7 (open to one operator running both services); (b) the payee signing each time with her own key; (c) the work's split service named as the receiver of the work's share, receipting in its own name.

**Decided by Nobody, allegedly, 10 October 2026:** option (c), generalised: "Yes, the publisher has its own split for its own need, it will send a portion to the split of the work agreement which will then use the rules of its agreement to redistribute. It could even be three layers, and it should. Publisher is a subscription model à la Netflix. It pools money, and splits it according to its stated rules. The publishing envelope gets its share. Money is split envelope by envelope, deal by deal, and can involve more participants than simply the work and the publisher, to reward the pipe. All this was agreed in the agreement of the publishing envelope. After the second split, handled by the service in the agreement, a portion is now handled by the work stakeholders split service."

So: **money passes layer by layer** (a pool, such as a subscription service's, splitting by its stated rules; then each publication's agreement; then the work's agreement), **each layer's split naming the next layer's split service as the receiver of that layer's share**, that service receipting **in its own name**, never with a grant key, and splitting under its own agreement. Each layer may pay more participants than the work and the publisher (relays and other pipes, by role shares, F193, F194), as its agreement says. H5 and H7 stand whole. *Replaces* QJ2 (a) as the project lead had settled it. *Suggested by the project lead (c); the layers Nobody, allegedly's.*

**Amended by Nobody, allegedly, the same night ("It might need a grant. Depends on the kind of rail" … "Yes, the owner can grant whatever the owner wishes to whoever the owner chose. No?"):** where the rail pays the service itself (Lightning to its own node), the service receipts in its own name; where the rail pays an account an owner holds (a bank transfer to the owner), **the owner may grant the work's service to sign for that incoming share on its behalf, the rail's proof required on the receipt**. *The project lead's answer to his question:* yes, a grant carries whatever its grantor holds ("a grant never reaches beyond the power of whoever issued it"); H5 and H7 were a protective limit on one grant, stopping a service from forging the payee's own receipt for its own split's payouts; with the rail's proof required, the forgery is impossible, so the limit stays only where no rail proof stands behind the signature.

**Core changes:** Agreements (Law) draft 10, rule 16 and the split plan (a receiver may be another agreement's split service, receipting in its own name; layers chained receipt to receipt, as Money's routes); scenario 7 read as the pool layer; the deals-and-owning build's QJ2 code (a payout to the work's agreement's payee) replaced. *To build.*

## F234. Announcements: a structured way of selling what has no bytes, or no bytes yet (10 October 2026, night)

**Amended by Nobody, allegedly, the same night: "Good, let's drop Events, and call them Announcements. They're IOU of services that need to come at a later date."** The word "event" is dropped from the core: F233's events are announcements; an announcement is an IOU of a service, or a thing, to come at a later date.

**From** Nobody, allegedly, after F233: "Basically it can be used for everything that needs to be sold but does not exist yet, even the gig economy can leverage it. It's an act that defines something that MOR cannot hash at the moment." *The project lead's reading:* events and streams are cases of one concept; so are a preorder (an album not yet recorded), a commission (a piece of furniture), gig work; the word, the project lead's under the delegation of technical wording: **announcement**. Checked: the gig economy case study already works through agreements and settlements; announcements add selling before the thing exists, replacing nothing.

**Decided by Nobody, allegedly, 10 October 2026 ("I know it works, but we just giving it a more defined grammar. MOR truly needed a structured way of selling something that has no bytes, or no bytes yet."):** the core concept is **an announcement**: an act its signer makes, naming something not yet hashable, its id that thing's name from the moment it is signed. **Offers naming it** sell it, with a description (F232, 5), under whatever agreement claims it. **A closing act** its signer makes ends it and names what it became, where that is hashable (a recording, an album, a file); a claim on the announcement covers what it became (F232, 4). **How delivery or attendance is confirmed is a Module's** (F233). **Kinds are Modules'** (events, preorders, commissions), save **streams**, the one kind the core spells out, because their segments chain and their recording is computed (F230 to F232). *Suggested by the project lead, from his words.*

**Core changes:** F232's and F233's section becomes "Announcements" (definitions; opening, naming, closing; claims covering what an announcement became; streams as its spelled-out kind); Agreements' offer: `sold` may name an announcement (access to an event, a preorder, a commission), with the offer's words required; rule 15 (a claim may name an announcement); rule 32a (a purchase of an announced thing under its claim); the core document's description of the layers. *To check when next touched:* case studies 12 (gig economy) and 14 (learning and work), 16 (commerce), 08 (preorders), 17 (live sports).

## F233. Events: an offer about a future live event; a stream is one kind (10 October 2026, night)

**From** Nobody, allegedly, after F232: "If the human confirmation from the buyer counts, the same grammar can be used for in person live events ticketing." *The project lead's reading:* the announcement opens the event and names it; tickets are access offers naming it, with a description, under the event's agreement; a closing act ends it; what changes is the evidence of access (a stream proves itself segment by segment; in a hall, a human confirmation). Flagged: the delivery confirmation (type 7) was retired in step 12b (OF6 b); resale already has its grammar (a ticket sold twice is caught as F224 catches a stake sold twice).

**Decided by Nobody, allegedly, 10 October 2026 ("Events: an offer about a future live event. Without specifying further, modules can then decide whether the confirmation comes from attendee in person, or in client verifications."):** the core defines **events**: an event is opened by an announcement its opener signs, named by that act's id; access to it is sold by offers naming it, with a description (F232, 5); it ends by a closing act its opener signs (F232, 3). **A stream is an event that carries signed segments** and becomes a recording when closed (F232, 2 and 4). **How access is confirmed is a Module's**: an attendee's confirmation in person, or a client's verification (for a stream, F232's line 7 is one such check), unspecified by the core. *Suggested by the project lead, from his words.*

**Core changes:** the "Streams" section of F232 becomes "Events", with streams as its one kind the core names; Agreements' access offer names an event; the confirmation of access left to Modules (none in the core). *Mechanic for later:* an attendee's confirmation, where a Module wants one, is that Module's act, not the retired type 7.

## F232. Streams defined: how MOR treats a streamable event (10 October 2026, night)

**From** the live work review (`docs/reviews/live-work-review.md`, questions 3 to 6) and Nobody, allegedly's own turn on it: "what the streamer is truly selling is an access offer, that access offer needs to be sold before the stream starts … The first offer can only promise that a pointer to the stream will be delivered once live." Then: **"I think that streaming deserves to be defined properly. Not how it streams, but how a streamable event is treated by MOR. Streams MUST…"** The project lead drafted the rules; checked against the core texts and the freeze suite (nothing contradicted; three lines added from Fable's review); each line then put to Nobody, allegedly, one at a time. *Terms as settled:* a **stream**, its **opening act**, its **recording** (the terminology note above).

**Decided by Nobody, allegedly, 10 October 2026, line by line:**
1. **Opened by an act of its opener, its name that act's id** (F230); **the opening act may be an announcement signed before any media exists.** ("Yes. Streams are an event, that event requires existing before it actually starts.")
2. **Only the opener's segments**, signed by it or a grant key it issued, each naming the stream and the segment it follows (F231); a segment by anyone else is shown as a fork, never as the stream.
3. **A stream ends only by a closing act its opener signs, naming the last segment** ("Yes"); no clock says a stream has ended; a stream never closed has a name and segments and no recording (stated cost). Refunds are not the closing act's business: **"Refunds are a case by case business between participants and the terms are what was agreed"** (F215, F219).
4. **No work hash while open; once closed, its recording's work hash is computed from its segments in order, never declared** (F230). **A fork is "a state not wished by MOR" that exists** ("Same as a work branch, a state not wished by MOR exists"): while forked, both branches are shown as a fork; **the closing act chooses the branch that becomes the recording**, the other a visible leftover becoming no recording; **a claim on the stream covers its recording** ("Yes."), a stranger claiming that recording's hash a competing claim, shown contested.
5. **An offer selling access to a stream must name it**, by its opening act, **and carry a description** ("It must name it, and carry a description. As sloppy as they wish, or as detailed as needed."): the offer's words, optional elsewhere, required here; the stream's agreement then covers every access sale, an offer under no such agreement shown outside it (rule 15b), a lone streamer's offer unchanged (F215).
6. **A stream and its recording are two things**: while it runs, a stream is claimed and sold by access offers; once closed, its recording is published like any work ("Yes, they are two separate things. One is a live event, one is a series of bytes that can be sold for access. Whether the offer bundles them, it's up to the seller."). An offer may bundle both, naming the recording in a later version once published.
7. **The buyer's check, client conformance, where it can** ("If it can, users also talk when streams go down"): for access to a stream, a buyer's client SHOULD check each segment is signed by the opener (or its grant key) and chained to the stream it paid for, in place of the work hash; where it cannot, the community's word does the rest.
8. *Already standing:* a fork's meaning is the stream's media cMIP's (Envelopes rule 2); a stream's name is as durable as its opening act (F230's cost); everything about how it streams (segment format, timing, keys, how segments join into the recording, how forks are shown) is the live media cMIP's and its Modules'.

*Suggested by Fable and the project lead; the announcement and the turn to "a streamable event" Nobody, allegedly's.* **The project lead's reading of review question 6, under the delegation:** "a class of its own" is a mark on the stream's name where it is used (claim, offer, publication), so a verifier can tell a stream's name from a work hash; the rest is the live media cMIP's. **Not yet decided:** access to things that are not streams (a service's app, freeze scenario 6), left as today.

**Core changes:** Envelopes draft 7, a short section "Streams" (definitions and rules 1 to 4, 7), the media paragraph, rule 14 (the stream branch, a SHOULD); Agreements (Law) draft 10, rule 15 (a claim on a stream covers its recording), rule 32 and the offer format (access to a stream names it and carries words); the core document's "Media"; the freeze suite's live scenario; the must-audit line. *To build:* with a minimal live media cMIP for tests. Case study 17's redraft unblocked.

## Terminology: a stream, not a "live work" (10 October 2026, night)

**Asked by Nobody, allegedly:** "Let's use the right terminology, if I get told off for using work, let's be careful onwards." *Settled by the project lead under the delegation of technical wording (no rule changed):* from here on, what F229 to F231 call a "live work" is **a stream**: a chain of segments signed by its opener, **named by the id of the act that opens it** (F230). **A work** keeps its one meaning: complete content with a work hash, what ownership points to. A stream's **recording**, once it ends, is a work, its work hash computed from the stream's segments in order (F230). F229 to F231 keep their wording as records; texts written from them say "stream".

## F231. Only the opener, and its grant keys, add segments to a live work (live work review, question 2, 10 October 2026, night)

**From** Fable's review of F229, finding 4: "each later segment names the one before, signed as it goes": signed by whom? If anyone, a stranger's segment becomes part of the opener's work and its claim covers content the opener never made. *Laid beside it:* F128 (a grant key's act is the grantor's own); case study 17 ("each feed is a work with its own maker"); F217 ("Make it legible, don't ban it"); rule 15 ("The core records claims and their order, never legitimacy").

**Decided by Nobody, allegedly, 10 October 2026 ("Agreed"):** a live work's segments are acts of its opener, signed with its own keys or a grant key it issued; a segment by anyone else naming the chain is shown by the live media cMIP as a fork, never as the work. A second camera is its own live work; a broadcaster's commentators, signing with its grant keys, add to the broadcaster's own. *Suggested by Fable and the project lead.* **Stated, with it:** a claim on a live work before it runs reserves a name, not content: for a live work, order is not evidence even of content (rule 15's "order is not evidence of authorship", read for live works).

**Core changes:** Envelopes draft 7 (one sentence: a live work's segments are its opener's acts); the live media cMIP (forks shown).

## F230. A live work has a name from its opening act; "work hash" stays for the finished recording, computed from its segments (live work review, question 1, 10 October 2026, night)

**From** Fable's review of F229 (`docs/reviews/live-work-review.md`, finding 1, with 7 and 10): "the fingerprint of its first signed segment" read as the bytes' fingerprint is copyable (a shared slate, a rival copying the opening); read as the opening act's id it is unique and the opener's, but voidable like any everyday act. The want is right; the word "work hash" is not. *Laid beside it:* F229 ("I think a stream should have a work hash as soon as it starts, if that stream then becomes a VOD it can have another hash pointing to the live as evidence"); Envelopes, "Work hash", approved 5 October ("the fingerprint of a work's complete plaintext … what ownership points to").

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, agreed"):** a live work is **named by the id of the act that opens it**, the opener's own act, unique, from its first second; the word **work hash keeps its meaning**: a live work has one when it ends, **computed from its segments in order**, so the recording's tie to the live work is checkable by anyone holding the segments, not declared. "A live stream has no work hash until it ends" stays true beside "a live work has a name from its first segment" (finding 10: an addition, not a reversal). *Suggested by Fable and the project lead.* **Stated cost:** a rotation that voids the opening act voids the name, as for any everyday act.

**Core changes:** Envelopes draft 7 (the live work's name beside "Work hash"; the media paragraph); Agreements draft 10, rule 15 (a claim may name a live work). Still open in the review: who may add a segment (2), access offers naming the live work (3), published while running or at the end (4), the closing segment and per-branch recordings (5), the mark and the split with the cMIP (6).

## F229. A live work is named by its opening segment, a class of its own; its recording is a separate work naming it (10 October 2026, evening)

**From** Nobody, allegedly's redraft of case study 17 (live sports), stopping at "a live stream has no work hash until it ends": "I think a stream should have a work hash as soon as it starts, if that stream then becomes a VOD it can have another hash pointing to the live as evidence." *Laid beside it:* Envelopes draft 7, "Work hash" ("the fingerprint of a work's complete plaintext … what ownership points to (Law)"); its line "A live stream has no work hash until it ends; paid live access is sold through a standing offer (Law), not a publication", from review round 2 (case study 17, draft 2); F227 (offers sell named publications or access). *The project lead's reading:* a content fingerprint cannot exist before the content; what is wanted is a fixed name from the first second, so permissions, claims, clips and sales can point at the stream while it runs.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes, and I am fine it being a different class of acts from standard works."):** a **live work** is a class of its own, beside standard works: it is named from its start by the fingerprint of its first signed segment; each later segment names the one before, signed as it goes, so anyone can check a segment belongs to it, in order; its recording, once complete, is a standard work with its own content fingerprint, naming the live work as its source. *Suggested by the project lead, from his words.* It reverses the review round 2 line that a live stream has no work hash until it ends; a live work can then be claimed, published and priced while it runs.

**Before building:** a hostile pass (a reversal of a review correction, in a core text): what a claim on a live work binds before its content exists; a stream that forks (two segments naming one); a stream that never ends; a live work's publication and its key delivery; the recording's claim against the live work's.

**Core changes:** Envelopes draft 7, "Work hash" and the media paragraph (the live work, its naming and chaining; segmentation stays the live media cMIP's); Agreements (Law) draft 10, rule 15 (claims on a live work) and the offer (F227: access, or a live work's publication); the freeze suite, a live scenario.

## Step 14a's second pass built (10 October 2026, night)

`docs/anchoring-second-pass.md`, branch `claude/anchoring-second-pass`, merged the same night. **F225:** the anchoring service's offer is an Agreements standing offer (type 6), a lone seller's (F215), selling the anchoring cMIP's terms (`[2, [anchoring cMIP, terms]]`: its tiers, prices or price scheme, deadlines) on its own time reference, the Bitcoin clock; tickets and publications are the service's acts under it, naming it; omission, default and late anchoring are judged under its terms, and the refund is owed under them, to the payer the payment committed to; the refund is paid back over Lightning to the payer's own pointer, the service's claim naming the payment refunded with the rail's proof, and the core shows it repaid (`LawView::refund_repaid`, new, additive). **Reading 3 of step 14a is reversed:** a payment following the service's pointer as a tip buys no ticket. **F228:** a tier may state a price scheme on the fee rate, quoted in the ticket, capped; a shortfall is the service's, the deadline fixed. **F226:** Money (Finance) draft 6, rule 15's client conformance, the SHOULD written in beside F181's MUST; the cMIP's stated cost points to it; a test pins the earliest of two services' anchors closing one's delay. The anchoring cMIP draft 3. The regtest test runs with real lnd nodes where step 12's Lightning regtest network is up. *Mechanics marked in the report; readings to confirm and questions there.*

## F228. A batch's cost is the anchoring service's own burden, under its own terms (AQ1, 10 October 2026, evening)

**From** `docs/anchoring-step-14a.md`, AQ1: who pays the output and the fee when a batch costs more than its pool collected. *Laid beside it:* F225 (buying an anchor is an agreement, the service's standing offer); F219 (bad-faith terms stay public); the roadmap's step 14a ("who pays when a batch costs more than the pool, stated in advance").

**Decided by Nobody, allegedly, 10 October 2026 ("Service's own terms, the service makes a promise and states a price or price scheme based on onchain metrics. If the service they offer ends up losing money, they are to take on that burden."):** no core rule. The service's offer states its price, or a price scheme tied to on-chain measures (fees, say), and its promise; each ticket's deadline is the promise it answers for. A batch that costs more than it collected is the service's loss to bear; a service that does not deliver by the deadline defaults and owes the refund under its terms (F225). *Suggested by the build and the project lead* (option 1, the service bears), *refined by Nobody, allegedly* (a price scheme on on-chain measures, in the offer).

**Core changes:** none; the anchoring cMIP's offer may carry a price scheme (its format, the cMIP's), the stated cost noting that the service bears a shortfall.

## F227. A work is bought through a publication, never "through any publication" (QJ3, 10 October 2026, evening)

**From** `docs/formats-build-12b.md`, QJ3: OF1's `[1, work]`, an offer selling any publication carrying a work, would under F216 sell a publisher's publication around the publication's agreement, and a stranger's republication with it; as built, kept out. *Laid beside it:* F216 (two envelopes, two agreements); rule 15 (a publication is a neutral carrier); an offer's field 1 is a list.

**Nobody, allegedly, after asking "What happened?" and a slower explanation:** "I see. You cannot buy the song through any publication. You can buy access to the publication via the publication. A song as a work can have its own price when self published. So I was trying to understand a sentence that made no sense to me."

**Decided by Nobody, allegedly, 10 October 2026:** option (a), as built. An offer sells named publications (one or several, field 1 being a list) or access; never "any publication carrying the work". A work has its own price where its owners publish it themselves (a publication's price, or their offer naming their publication); bought through another's publication, it is bought under that publication's agreement (F216). *Suggested by the build and the project lead.*

**Core changes:** none beyond the build (OF1's `[1, work]` removed from the offer format in Agreements draft 10).

## F226. A lock change SHOULD be anchored through two services, or by the owner's own transaction (AQ3, 10 October 2026, evening)

**From** `docs/anchoring-step-14a.md`, AQ3: within a tier's deadline an anchoring service chooses, unseen, when a paid hash lands; working with a thief, it can hold back an owner's lock-change receipt so that payments to the thief mined meanwhile count against the owner (pinned by a test); the refund is the price, never the loss. *Laid beside it:* F181, item 6 (after a lock change the owner's client MUST obtain the quorum's home receipts and anchor them on the main reference); F178 (each act judged by its earliest anchor); F179 ("Can we have a back up clock? And only anchor that one rarely when truly needed?"; "Back up service as added security").

**Asked by Nobody, allegedly, with the decision:** "Can we give a should on something the core does not handle directly? I think we can, it's not a must." *The project lead's answer:* yes; the core already carries client conformance on anchoring (F181's MUST in Finance rule 15); a SHOULD beside it binds no verifier and names the good practice.

**Decided by Nobody, allegedly, 10 October 2026 ("Agreed"):** *client conformance, SHOULD:* after a lock change, the owner's client anchors the quorum's home receipts through two independent anchoring services, or by its own transaction, at an urgent tier; the earliest anchor counts (F178). *Suggested by the build and the project lead.* Cost: two small prices, or one on-chain fee, per lock change, a rare event. Not chosen: leaving one service's delay as the only answer.

**Core changes:** Money (Finance) draft 6, rule 15's client conformance (beside F181's MUST); the anchoring cMIP's stated cost points to it.

## F225. Buying an anchor is an agreement; Money says money moved, Agreements say what follows (AQ2, 10 October 2026, evening)

**From** `docs/anchoring-step-14a.md`, AQ2: where does the refund owed on an anchoring default live: Money, by rule 10a and 10c's path, or the offer's terms in Law? The project lead first suggested Money ("money received for nothing"). Nobody, allegedly: "Unsure. And unsure why…". *The project lead then named three weaknesses:* a late anchor is delivered, not "nothing"; a wallet reading Money only cannot judge a default anyway; rule 10c was written for purchases.

**Nobody, allegedly:** "Paying for anchoring is an agreement." … **"Money says what payment cMIPs, what rails, what units, where to, where to above a certain threshold. It says. Yes, money has moved. Or, please, make money move. Agreement says if money moves then x has to happen in return or in consequence."**

**Decided by Nobody, allegedly, 10 October 2026:** the anchor itself (proof that an act existed by a block) stays an Envelopes task (F173); **buying an anchor is an agreement**: the service's standing offer, a lone seller's offer (F215), its tiers, prices and deadlines its terms, accepted by paying; an omission, a default or a late anchor is judged under those terms, and the refund is owed under them; Money carries the refund's payment. Only a client that reads Agreements judges it, as for any purchase under an agreement (F126). *Reverses* the project lead's taking of step 14a's reading 3 ("the anchoring offer is an act of the anchoring cMIP, not a Law offer"): the service's offer is an Agreements standing offer.

**The principle, stated by Nobody, allegedly, recorded as a working rule of the layers:** Money says how money moves (payment cMIPs, rails, units, where to, where to above a threshold), that money has moved, or asks that it move. Agreements say what must happen, in return or in consequence, when money moves. *Noted by the project lead, to check in the rename pass and before re-approval:* the places where Money's text decides a consequence (rule 10c's "money received for nothing … owed back"; rule 7's "past its terms", F219; F224's over-sale refund) to be read against this principle: the obligation arising in Agreements, its payment carried by Money.

**Core changes:** the anchoring cMIP draft 2 (its offer an Agreements standing offer; the ticket and publication as the service's acts under it); Agreements (Law) draft 10, the standing offer's terms carrying deadlines and a refund for a service; the principle in the core document's description of the layers. *To build:* the refund paid, with AQ1 and AQ3 decided.

## F224. A stake sold twice is settled on the seller's own line (formats review 2.8, 10 October 2026, evening)

**From** Fable's formats review, 2.8: two transfers naming the same previous link were a fork, and rule 5's status quo left the seller holding the stake and both payments; one chain per stake also made two honest partial sales a fork. Unparked by F221. *Laid beside it:* F217 (a stake transfer is a chain signature on the seller's own line); F223 (what that line orders); W4 (a holder's own race settled on its own chain); F221 (whoever signs twice is the responsible party).

**Asked by Nobody, allegedly, before deciding:** "How is this policed?" *The project lead's answer:* nobody polices it; it is prevented where it can be and made undeniable where it cannot: the seller's homes hold and receipt his identity line, so a buyer's client sees an earlier transfer before paying, and the line accepts one stamp at each position; every verifier computes holdings alike, so the over-sale confers nothing and no split pays it; what remains is a refund debt any wallet sees, with signed proof of the double sale, for reputation, a named judge or a court.

**Decided by Nobody, allegedly, 10 October 2026 ("Yes"):** a stake's transfers are ordered on the seller's own line; each is checked against what the seller still held at that point; transfers that fit are all valid (two partial sales are not a fork); **an over-sale confers nothing, and its payment is owed back by the seller**. *Suggested by Fable and the project lead.* **Mechanics, the project lead's under the delegation:** a transfer names the buyer's payment, so the over-sale's refund is an ordinary Money refund (money received for nothing, rule 10c); *client conformance:* a buyer's client pays only once the seller's transfer is receipted by the seller's homes and checked against what he still holds.

**Core changes:** Agreements (Law) draft 10, rule 14 and the stake transfer format (holdings followed along the seller's line; the payment named); Money (Finance) rule 10c (the over-sale's payment received for nothing). *To build:* with F206, F221 to F223.

## F223. A seller's receipt is "after" his transfer once it belongs to a later key period (QJ1, 10 October 2026, evening)

**From** `docs/formats-build-12b.md`, QJ1: F217 placed a stake transfer on the seller's own line by a chain signature, but Identity binds an everyday act (a receipt) only to genesis or a rotation, never to a chain signature; so no receipt of the seller's is "after" the transfer until his next rotation. *Laid beside it:* F217 ("Yes, it's an acceptable cost. Make it legible, don't ban it. This one leaves plenty of bread crumbs"); F214 (a service not respecting the agreement is liable); F109 and F207's working practice (the sequence named).

**Decided by Nobody, allegedly, 10 October 2026 ("Agreed"):** option (b), no Identity change. A seller's payout receipt for a stake he transferred is "after" the transfer, and wrong, once it is bound to a rotation later than the transfer's chain signature; until then, what moves the money is the service: from its first split citing the transfer, every payout to the seller for that stake is the service's debt to the buyer (F217, F214). The collusion window F217 accepted as legible gains a second edge, the seller's next rotation, stated as a cost. *Suggested by the project lead.* Not chosen: (a) letting an everyday act's binding name a chain signature (an Identity change that would catch only the careless case, since a stale or deliberate device may still bind to the older rotation); (c) the service's first citing split as the only moment (refused in F217).

**Core changes:** Agreements (Law) draft 10, rule 14 (F217's "after" pinned to the seller's key periods; the window's second edge stated). *To build:* with F206, F221, F222.

## Step 12b's readings, and QJ2, taken under the delegation (10 October 2026, evening)

*Taken by the project lead under the delegation of mechanics, each reading a decided rule, none changing what a rule does; recorded as the project lead's.* From `docs/formats-build-12b.md` (merged): **R1** a payment following an offer that does not count (in a deal, one party signing alone; a payee field 14 does not list; not public) is no purchase and is owed back by its payee: the consequence of OF3 (a) in the sort, closing review 2.2's hole; a lone co-owner still sells under an agreement of his own, shown as outside (rule 15b). **R2** a purchase following co-owners' offer names a version of the agreement the offer is made under. **R3** the role a cMIP's type definition names is shown by clients, not checked by the core (QG3). **R4** standing for a request to a judge, as built, is a party who signed the version; *to revisit* with rule 57a (stake holders, keepers, arbitrators) before freeze. **R5** F219's lapse is the time reference's answer, stated by the verifier. **R6** F214's publication scope covers a payment following an offer that sells it. **R7** in a deal, an offer's later version stays under the agreement its first names.

**QJ2, settled by the project lead under F216's delegation ("mechanics the project lead will settle under the delegation, or bring back"):** option (a): with split services, the publication's split pays the work's line to a payee of the work's agreement (its field 14), and the work's service's receipt names the publication's split, as Money's routes chain receipts; nothing new. *To build.*

**For Nobody, allegedly, open:** QJ1 (a receipt "after" a transfer on the seller's own line: Identity binds everyday acts only to genesis or a rotation, so F217's window stays open until the seller's next rotation; options: let a binding name a chain signature, an Identity change; or state the cost; or the first split citing the transfer); QJ3 (OF1's `[1, work]`, an offer selling any publication carrying a work, against F216's two agreements: kept out as built, allowed only where no publication's agreement stands, or allowed with its cost).

## The open formats built, step 12b (10 October 2026, evening)

`docs/formats-build-12b.md` (branch `claude/great-newton-gbmsbb`, merged the same evening): the open formats, as Fable's review sorted them and F207, F208 and F210 to F219 decided them, written into Law draft 10, Finance draft 6, Production draft 6 and core v21 (each revised in place, for Nobody, allegedly, to approve again) and built in the core library and its binding, each change with a test; Rust 536 passed (516 before). Types 7, 11 and 15 retired, field 10 withdrawn; every mechanic chosen under the delegation marked as the build's. **Three questions for Nobody, allegedly:** QJ1 (a receipt "after" a transfer on the seller's own line: Identity binds everyday acts to rotations only, never to a chain signature, so F217's window stays open until the seller rotates); QJ2 (how a split service pays the work's agreement its line, F216); QJ3 (OF1's `[1, work]` against two agreements). Seven readings to confirm (R1 to R7). Not in this step: F206 and deal forks, review 2.8, anything on-chain.

## F200 to F205 built (10 October 2026, evening)

`docs/onchain-rail-f200-f205-build-2026-10-10.md` (branch `claude/onchain-rail-f200-f205`, merged the same evening by the project lead): the on-chain rail Module draft 2, the anchoring cMIP draft 1 and the Bitcoin clock Module draft 1 written; Finance draft 6 (rules 8a, 10, 15, the clock format), Envelope draft 7 (anchoring), Production draft 6 (rule 12), the payment cMIP and the Lightning Module revised in place; each change built with a test that fails first; Fable's review tests rewritten to pin the fixes; regtest end to end with two btcd nodes. Every mechanic chosen under the delegation is marked as the build's in the report. **One question for Nobody, allegedly:** Q1, a payment counted and then rewritten deeper than its confirmations: F205 keeps it counted, F204 makes its block, off the chain followed, answer unknown; as built, the rule follows F204.

## F191 to F199 built (10 October 2026, early afternoon)

`docs/f191-f199-build-2026-10-10.md` (merged): F191 to F199 written into Law draft 10, Finance draft 6, Production draft 6, core v21 and the freeze suite (each revised in place for Nobody, allegedly, to approve again) and built, each with a test that fails first; Rust 502 passed; both FORK-HANDS-OUT seeds and every invariant pass at 5,000 cases; Fable's `review_f190_*` tests rewritten to pin the fixes (5b, the offer's object, unchanged: QH3). The display client released again. **Six questions for Nobody, allegedly, open:** QH1 (two settlements of one fork, neither holding the other, one the judge's); QH2 (a branch nobody named, carrying a newcomer, dropped by F192 without her signature); QH3 (the object a relay's record names, and a purchase naming an offer; joins step 12b's OF1); QH4 (a resignation and the very version that registers it); QH5 (a one-time key that gave no refund address); QH6 (a pointer inside a fork's history whose taking-on the fork left out). Nine readings to confirm.

## Review of F163 to F168 (7 October 2026, morning)

A hostile review by Fable (`docs/reviews/f163-f168-review.md`) found that four of the six decisions answer their findings (F163 for conforming clients, F165, F167 in the main, most of F168), and that the two which changed a principle each leave a hole on the side of the party who gains: (1) F164 gives the payee the cut-off (it withholds the receipt, rotates, anchors), so an owner with no theft can unmake an honest payment to its own wallet, against rule 10's "the claim alone shows the money arrived"; (2) "anchored" names no reference, and Finance now depends on Law; (8) F166 does not say what a defeated declaration undoes. Also: F168 item 11 lets a thief re-point existing deals in the window (5); F163 imports a thief's pointer in the window (6); F165's receipt chain has no fork or reset rule (7); F167's floor forbids the long-form format's own markup and misses common negative and decimal forms (10, 11); editorial conflicts (12 to 14).

**All decided** as F169 to F174 (the building session for F163 to F168, launched the same morning, built the text as it stood and was asked to hold F164, F166 and F168 item 11).

## Whole-set review (7 October 2026, late morning)

Fable's review of the whole set after the reset (`docs/reviews/whole-set-review-2026-10-07.md`): absence (F172) and "the core names a task, not how" hold as principles; the theft principle (F169) is judged right, its rule not yet delivering it (findings 1 and 2, decisions; 3 to 10, wording). Findings 1 and 2 decided as F176 and F177; 3 to 17 as F178; 18 to 20 held. **Next:** one hostile pass on Finance rule 15 alone, then building.

## Rule 15 review (7 October 2026, midday)

Fable's review of Finance rule 15 alone (`docs/reviews/rule-15-review-2026-10-07.md`): "the principle is now mostly delivered"; the three doors of the whole-set review are shut, and everything the thief can reach with the signing key alone is shut out after an anchored lock change. Two real findings: (1) a clock naming several references lets a payer anchor on the one the owner did not; (2) "the earliest anchored home receipt" lets the owner's own home set the point before the rotation counts under its home rule. Smaller: the owner can disown its own receipt (3); the lock change's reach defined twice (4); rule 12a judges rails against the chain now (5); nobody is told to anchor (6); the clock cannot name a time reference's parameters (7); the core and suite lag (8). All decided as F179 to F181.

## Working practice after 6 and 7 October

**Recorded at the close of 7 October.** The decisions that held were set from first principles by Nobody, allegedly, and attacked as a whole set by a separate reviewer; the ones that broke were the project lead's fast patches, accepted in batches, some framed as editorial. Before any suggestion is put forward, it answers four questions in plain words: who gains from the rule, and can they pull it; the rare case, as a story; what it breaks elsewhere; how we got here, and whether it is fixing a fix (the last two marked by Nobody, allegedly: "Noted, especially the last two"). Batches are reviewed as a set, not patch by patch.

**Added 10 October 2026 (F192), by the project lead:** when a question from a build touches something Nobody, allegedly, already decided, his earlier decision is laid beside it, in his words, before the question is put; a principle-level choice is never put in a batch, nor dressed as a technical one.

**Added 10 October 2026, asked by Nobody, allegedly:** every session's prompt asks for its report in a place the project lead can read directly, not only in the session's reply. GitHub and review sessions: the report committed under `docs/` (reviews under `docs/reviews/`) on a pushed branch, the final message naming the branch and the path. Machine sessions on the Mac, which never push and keep operational details out of the repository: the report written into the MOR project (`claude/machine-report-<date>-<subject>.md`), or, where that is not possible, saved in the Mac's MOR folder under `reports/`, the final message saying where. Chat sessions in the project: the report written into the project.

**Added 10 October 2026, afternoon, by Nobody, allegedly: what is a cMIP and what is a Module.** "The needs sort of decide what is a cMIP and what has to be a module. If multiple options need to often or always exist side by side for the same task, they have to be modules. How the modules are managed can come down to the cMIPs where needed." (Applied first in F202: one anchoring cMIP, the clocks Modules under it, as the rails under the payment cMIP.)

**Added 10 October 2026, afternoon, the delegation widened by Nobody, allegedly:** "It's easier for me to state a rule and express why than to specify the details of the mechanic. If the mechanic you find respect the rules we go ahead." *Read by the project lead as:* he states the rule and its reason; a mechanic that respects his stated rules goes ahead without coming back to him, recorded and marked as the project lead's (or the build's); a mechanic that would change what a rule does, or that meets a rule it cannot respect, comes back to him as a question.

**Added 10 October 2026, afternoon, by the project lead (F207's lesson):** any rule or suggestion that says "before", "after", "later" or "first" names the sequence it is read on (the collective's own line, an identity's key events, a named clock, an agreement's lineage), and the project lead checks this before suggesting one. MOR has no clock; an unpinned "later" is a hidden choice between sequences.

**Amended 10 October 2026, evening, by the project lead (the machine report of that day):** a Machine session cannot read or write the claude.ai project. Its prompt carries everything it needs from the private servers note, and its report is saved on the Mac in `~/Documents/MOR Development/reports/`, beside the clone and never inside it, for the author to bring to the project lead.

**Added 10 October 2026, night, asked by Nobody, allegedly:** "Every time our discussions have covered your needs for a new session, you can share the prompt here before we continue." The project lead writes a session's prompt into the conversation as soon as the decisions it needs are in hand, before moving on.

**Amended the same night by Nobody, allegedly:** "Never share what I should not launch yet." A prompt is shared only once it can be launched at once; one that must wait for another session is held back until then.

