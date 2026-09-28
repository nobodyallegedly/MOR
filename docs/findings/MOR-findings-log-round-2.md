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
- Finance rule 14a: once a vault is declared, a payment in a unit the vault has no entry for cannot go to the flow either; it is undeliverable until the owner adds the unit by rotation. F67's fail-closed applied to F79's per-unit entries. An identity with no vault keeps everything on the flow. Awaiting the author's confirmation; the alternative (uncovered units flow freely) reopens I10.
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

## F97. Verifiable dealing stops sole control of a collective's safety key, not a copy (found while building the air-gapped safety key Module, decided by Nobody, allegedly)

**Pattern 4** (a rule rests on a fact nobody can check).

**Found while building:** the air-gapped safety key Module (roadmap step 6). Law rule 36 said the Module rebuilding a collective's safety key "MUST deal the shares of the next key verifiably, or the device's holder ends up owning the collective's safety key"; Module 5.1 asked that each member verify their share "without the device retaining the whole key", and its attack test expected "a rotation device that tries to keep the collective's next key" to fail the members' share verification. It cannot. Whoever deals the next key sees it, and no check proves a device forgot something. What checking can stop is different: a device that commits to a key it keeps and hands the members shares of another seed, so that it alone could ever rotate. A second gap: shares can be checked against each other (verifiable secret sharing), but not against the hash commitment of an SLH-DSA key without either rebuilding the key or a zero-knowledge proof of SLH-DSA key generation, for which no established method exists.

**Options weighed:** reword and build share checks plus one rebuild check on a second offline device; reword and leave split safety keys to paper for V1 (collectives hold their safety key with one holder or a custodian); a zero-knowledge proof of key generation (strongest, but young tooling, a large build and a new dependency before the freeze).

**Decided (Nobody, allegedly):** reword, and build the checks. Verifiable dealing stops sole control, not a copy. The shares are dealt with Pedersen commitments, which hide the seed even from a quantum computer (Feldman's scheme would expose it, defeating a post-quantum safety key); every holder checks their share alone and compares the dealing's fingerprint with every other holder; right after dealing, k holders rebuild the key on a second offline device, compare it with the commitment, and forget it.

**Cost, stated:** the dealing device, and the device that runs the rebuild check, each hold the key for a moment and could keep a copy, as the rotating device already could. A dealer with a quantum computer could deal inconsistent shares undetected (Pedersen binding rests on the discrete logarithm); the rebuild check would still catch shares that do not rebuild the committed key.

**Core changes:** Law (rule 36's commentary and requirement). Air-gapped safety key Module (section 5 rewritten; the share message 2.4; the attack test becomes "a dealing device that deals shares not rebuilding the committed next key: the rebuild check fails"). No change to the core document or the freeze test suite.

**Applied:** `modules/airgap/` (`shares.rs`; `tests/collective.rs`: the dishonest dealer caught by the rebuild check, tampered shares, different dealings shown by fingerprint, a rotation through an escrowed share); Law draft 5, air-gapped Module draft 4 (roadmap step 6), approved by Nobody, allegedly, 28 September 2026.
