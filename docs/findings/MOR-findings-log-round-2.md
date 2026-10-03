# MOR Findings Log, continuation: review round 2

*Continues MOR-findings-log.md from F53. Kept as a separate file during the round 2 work so each decision is a small write; merged into the main log at the consolidated revision.*

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

## F113. An anonymous payer's refund goes to a key the payer put in the commitment (found while building roadmap step 12, flaw L1, decided by Nobody, allegedly)

**Pattern:** 1: the record that decides who is refunded could be produced by others than the party it protects.

**Found while building:** the Lightning rail (roadmap step 12, `docs/lightning-rail-step-12.md`, flaw L1). Finance rule 10a (F80) owes a refund on an anonymous payment "to whoever presents the rail proof", because "only the payer holds it". On Lightning the proof includes the preimage, which the payee and every node on the route learn; any of them could claim the refund. Named payers are unaffected: the payment commitment names them.

**Decided (Nobody, allegedly, 2 October 2026):** option 1, "if doable". An anonymous payer puts a bare key of its own (Finance rule 18's form, used once) into the payment commitment; a refund owed on that payment goes to whoever signs with that key. *Doable:* the payer's wallet supplies the key when asking for the invoice, and recomputes the commitment from the signed invoice before paying, so the payee's side cannot swap it.

**Set aside:** keeping rule 10a and stating the cost; a committed secret's hash; leaving it to each rail Module.

**Changes, to be made:** Finance draft 6 (rule 10a; the commitment's payer field accepts a bare key); the payment cMIP; freeze suite scenario 2 step 6 (the anonymous refund is claimed by a signature with the committed key, and a routing node holding the preimage cannot claim it).

*F113 decided by Nobody, allegedly, 2 October 2026.*

## F114. Several vault entries for one unit: the smallest limit applies (found while building roadmap step 12, flaw L2, decided by Nobody, allegedly)

**Pattern:** 4: a rule naming "that entry's limit" where several entries can apply.

**Found while building:** the Lightning rail (roadmap step 12, flaw L2). A vault may list one unit on several rails (F79), each entry with its own limit; rule 14a sends a payment above "that entry's limit" to the vault, which names no entry when there are several.

**Decided (Nobody, allegedly, 2 October 2026):** option 1, "the safest". Where a vault has several entries for a unit, the smallest of their limits applies to every payment in that unit: no larger single payment counts as paid to the flow. A limit of zero on any entry turns the flow off for that unit.

**Set aside:** the largest limit; one limit per unit, a vault with two being malformed; a limit per rail, which lets the payer's or a thief's choice of rail pick the laxer limit.

**Why:** fail closed, as rule 14a; no existing vault becomes invalid.

**Changes, to be made:** Finance draft 6 (rule 14a); the code's refusal of payments between the smallest and largest limits as unsettled is replaced by the rule.

*F114 decided by Nobody, allegedly, 2 October 2026.*

## F115. The payee decides which rails it accepts (found while building roadmap step 12, question c and flaw L4, decided by Nobody, allegedly)

**Pattern:** 4: two clients could disagree on whether a receipt on a given rail counts, and a collective's lanes (F106, Q16) had no reading for receipts once rails became Modules (F112).

**Found while building:** the Lightning rail (roadmap step 12, question c). A receipt is a Finance act naming its rail Module in field 0; an agreement names one payment cMIP. Nothing said which rail Modules count. Freeze suite step 3.7g and its core test treat a receipt as the payment cMIP's own act, which F112 ends (L4).

**Walked through (2 October 2026):** a band's offer names the payment cMIP; a fan pays over a Lightning Module. Two things surfaced: not every payment has a drafter (a tip follows only the payee's pointer); and rail Modules change (a fix, a new Lightning feature) far more often than agreements, so terms pinning a Module's hash would need a clone, every party signing in a deal (F107), for each upgrade.

**Decided (Nobody, allegedly, 2 October 2026):** "If I wish to pay in bitcoin in a shop that does not accept it, I cannot." Acts always name the cMIPs and Modules they rely on. The receiver decides how it is paid: an agreement names its payment cMIP; the payee's pointer or vault names the rail Modules, implementing that cMIP, it accepts. A receipt counts only if its rail Module is one the payee's pointer or vault in force for that payment named. A payer whose rail the payee does not accept cannot pay on it, except through a conversion service paying the payee on a rail it accepts.

**Consequences:** a new rail Module needs a new pointer (signing key) or vault (safety key), never a clone of an agreement. In a collective, the pointer is a Finance act, so the holders of the Finance lane choose the rails. Q16 reads mechanically: a receipt naming a Module the payee never published, or one not implementing the adopted payment cMIP, counts for nothing.

**Changes, to be made:** Finance draft 6 (payee pointers and vault entries name rail Modules; receipt validity); the payment cMIP; freeze suite step 3.7g and its core test (a receipt on a rail the collective's pointer names counts with the treasurer; one on a rail it never named counts for nothing).

**And (Nobody, allegedly, 2 October 2026):** cross-rail services charging a fee are expected to appear; a client can build them in, giving its users free choice of currency and rail while delivering to the payee what the payee can receive. *Consistent with rule 14a and F111, which treated an unaccepted unit the same way: the payer cannot pay there directly, and the debt stays open (rule 16).*

*F115 decided by Nobody, allegedly, 2 October 2026.*

## F116. Evidence that a Module was used comes from a party, never from the Module (found while building roadmap step 12, flaw L3, decided by Nobody, allegedly)

**Pattern:** 1, after F112: a specification cannot sign.

**Found while building:** the Lightning rail (roadmap step 12, flaw L3). Production rule 17 has a Module's use record "signed by the module", the evidence a Module's author needs to earn a share. After F112 a Module is a text or code, and signs nothing.

**Decided (Nobody, allegedly, 2 October 2026):** both, by case. For a rail Module, the receipt (and the payer's claim) naming it in field 0 is the evidence of use; nothing new is needed. For a service someone runs, the evidence is a record signed by the identity running the service. Either way, a party signs, never a specification.

**Changes, to be made:** Production's next draft (rule 17 and its freeze scenario line); the role-share evidence rule (Law rule 19, F75) reads alike.

*F116 decided by Nobody, allegedly, 2 October 2026.*

## F117. The first Lightning rail Module names the payee's node; its costs are stated, and it ships as experimental (roadmap step 12, questions a and b, decided by Nobody, allegedly)

**Found while building:** the Lightning rail (roadmap step 12, question a). To check later that a payment went to the payee, a verifier needs the key that signed the invoice; on Lightning there is no address in the on-chain sense. The Module as built names the payee's node key in its pointer or vault (a), and a Lightning vault entry names the vault's own node, which issues each invoice (b).

**Costs, stated (2 October 2026):** a public node exposes its channels and the on-chain coins behind them, possibly its network address, links identities that share it, and makes a visible target; a Lightning vault stops a thief with the everyday key, not one who takes the node, which must stay online. Mitigations are the payee's choice: an unannounced node, one node per identity, a hosted node, Tor. A Lightning Address (name@domain) was set aside: its invoices cannot be tied to the payee by a later verifier. A BOLT 12 offer would give a reusable, checkable address that hides the node, but lnd does not support it yet.

**Decided (Nobody, allegedly, 2 October 2026):** "I'm fine with presenting experimental stuff with plenty of disclaimers. The purpose is to throw stuff at the MIPs." a and b confirmed as built; the Module is presented as experimental, its costs stated plainly in its text and shown by clients. *Suggested (project lead):* a BOLT 12 rail Module later, as a second Module under the same payment cMIP, which also exercises F115 (a payee choosing between rails).

*F117 decided by Nobody, allegedly, 2 October 2026.*

## F118. A negotiation message is a Law act (found in the core pass, flaw V1, decided by Nobody, allegedly)

**Pattern:** a decision checked against too little: F110 was decided on the project lead's statement that negotiation messages were Law acts; they were Text acts.

**Found while writing:** the core pass (core v21, branch `claude/core-pass-v21`, flaw V1). Law rule 56 proves a negotiation record complete because each message acknowledges the last one received; a negotiation message was a Text act, and F110 forbids Text acts to carry acknowledgements. As written, no negotiation could be proven complete.

**Decided (Nobody, allegedly, 3 October 2026):** option 1, "it stays on the same layer". A negotiation message is a Law act type carrying text, and may carry acknowledgements like every Law act. No reaction or reply can be one.

**Set aside:** messages naming earlier ones as references (a disowned message would become void, not disputed); an exception for Text acts inside a negotiation (a hole in F110).

**Changes, to be made:** Law draft 10 (the negotiation message act type; rule 56); core and freeze suite where they describe negotiation records.

*F118 decided by Nobody, allegedly, 3 October 2026.*

## F119. A split service's receipt is evidence that a rail Module was used (found in the core pass, flaw V2, decided by Nobody, allegedly)

**Pattern:** 1, checked: the party that signs is the split service, but what it can name is fixed by the payee.

**Found while writing:** the core pass (flaw V2). F116 makes the receipt naming a rail Module the evidence of its use; in a split, that receipt is signed by the split service, and Law rule 22 (F75) refuses the service's own signature as evidence for a role share.

**Decided (Nobody, allegedly, 3 October 2026):** option (a). The receipt counts as evidence of a rail Module's use even when a split service signs it, because under F115 a receipt counts only on a rail Module the payee's own pointer or vault names: the service cannot invent one. *Cost, stated:* where the payee's pointer names two Modules for one rail, whoever issues the invoice (here the split service) chooses which earns; the pointer shows it publicly, and the payee's agreement with the service can constrain it.

**Set aside:** keeping rule 22 strict, so only the payer's claim counts (claims are private by default, so most uses would go unrecorded); one Module per rail as a validity rule, suggested by the project lead and withdrawn on Nobody, allegedly's question ("how can it be enforced?"): "same rail" is a label each Module declares, which no verifier can check (as F106), and one Module per unit would forbid accepting a unit on two rails.

**Changes, to be made:** Law draft 10 (rules 19 and 22: the exception for a receipt naming a rail Module the payee published).

*F119 decided by Nobody, allegedly, 3 October 2026.*

**F110, the witness act's visibility (core pass, question V3; decided by Nobody, allegedly, 3 October 2026):** a witness act is public, like every Identity act. *Cost, stated:* anyone can see that its signer relies on a given act of another identity, a relationship, never the content of a private act. A private witness act was set aside: it would protect nothing for anyone not holding it, and would need rules of its own.

## F120. A version changing both a judge and the constitution needs the constitutional rule alone (found writing Law draft 10, question J1, decided by Nobody, allegedly)

**Pattern:** 4: two rules of Law disagreed on one case.

**Found while writing:** Law draft 10 (`docs/law-draft-10.md`, J1), restating the seven rules the core pass could not state plainly. Rule 36a says the judicial tasks (condition evaluation, time reference, anchoring) change only under the clone rule; rule 44c.1 says a version touching the constitution needs the constitutional change rule alone, "which may change every tier". When one version does both, they disagree, but only where the clone rule is stricter than the constitutional rule.

**Decided (Nobody, allegedly, 3 October 2026):** reading (a), the constitutional change rule alone: "rare case, but if core allows it" it must have one answer. Rule 36a's "only under the clone rule" reads as "never by the Law lane nor any other area". Under rule 46a, a member who did not sign keeps the judge they signed for, whatever the version.

**Set aside:** both rules met (a check the constitutional rule could remove in the same version); forbidding both changes in one version (only an extra step).

**Changes, to be made:** Law draft 10 (rules 36a and 44c.1 read alike); core v21's "Areas and lanes" (J1 no longer open).

*F120 decided by Nobody, allegedly, 3 October 2026.*

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

## F122. A version changing a judge and the constitution needs both rules (found writing F121 into Law draft 10, flaw K1, decided by Nobody, allegedly)

**Pattern:** a later decision changing an earlier one's ground: F120 rested on the constitutional rule being able to remove any stricter check; F121 fixed "every member" for the judicial tier in Law itself.

**Found while writing:** F120 and F121 into Law draft 10 (`docs/law-draft-10.md`, section 5, K1). Under F120 a version changing both a judge and the constitution needs the constitutional rule alone; under F121 a judge changes only with every member. Together, two of three members could change a judge by adding any change of the constitution to the same version.

**Decided (Nobody, allegedly, 3 October 2026):** option (b). Such a version needs the constitutional rule and every member's signature for the judge; it stays a draft until both are met. This revises F120.

**Set aside:** the constitutional rule alone (the loophole); forbidding both changes in one version (an extra step, same result).

**Changes, to be made:** Law draft 10 (rules 36a, 44c.1 and mark [4]); the code's "unsettled" refusal replaced by the rule.

*F122 decided by Nobody, allegedly, 3 October 2026.*

## F123. The split service vouches for the addresses in the owners' pointer (found writing F121 into Law draft 10, flaw P1, decided by Nobody, allegedly)

**Pattern:** 4: a rule resting on a fact nobody can check. A payee pointer lists payment addresses and node keys, never an identity, so "the pointer names the split service" (F121, fix 2) cannot be verified.

**Decided (Nobody, allegedly, 3 October 2026):** option (a), "make it legible". The split service publishes its own payee pointer, signed by itself. The owners' payee pointer counts, for Law, only if every address in it also appears in the split service's own signed pointer in force. A bypass needs the service to sign, publicly, for an address that is not its own: collusion in plain view. No format change.

**Set aside:** a "receiver" field (anyone can write any name next to their own address); a pointer that delegates to another identity's pointer (cleanest, but a change to Finance and every wallet).

**Changes, to be made:** Law draft 10 (rule 18 as a check); the pointer check built in the core library; freeze suite scenario 3.7r run.

*F123 decided by Nobody, allegedly, 3 October 2026.*

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

## F124. Questions from writing F121 to F123 into Law draft 10 (`docs/law-draft-10.md`; answered by Nobody, allegedly, 3 October 2026, one at a time)

- **S1, a collective cannot name itself at birth:** a collective's genesis names its founding agreement, so that agreement cannot name the collective, which does not exist yet; stakes in the collective itself (F121 Q8) and its own grants could never be in founding terms. **Decided:** option (a), "let's reuse the mechanic": a null object or holder in a stake or grant means "this collective", as Identity lets a genesis name itself as its home's operator by null. Set aside: always a first clone; a separate members' shares entry.
- **M1, a member could block their own removal:** under F122, removing a member drops their succession plan, a judicial change needing every member, the removed one included. **Decided:** option (a), a clause naming only the member being removed goes with the removal, as their areas do (Q21); no other judicial clause changes in that way. *Nuance (project lead's reading, from Q6 and Q14):* only the seat part of the plan goes; the plan for the removed member's stake stays with the stake, which removal never takes.
