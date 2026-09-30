# MOR Freeze Test Suite

*Version 16, 29 September 2026. Version 15 with F101 applied (roadmap step 7, the identity gauntlet): in scenario 5.7c, the home that vanishes without closing had receipted an audited rotation, and the journalist's client carries that home's inclusion proofs to the new home, so a reader who never reached the old home still proves the journalist's history. It matches core v16 and the MIP drafts (Identity 10, Envelope 6, Law 6; findings F1 to F101). Version 15 was version 14 with F96 and F100 applied (roadmap step 5a): scenario 3's collective gains a key grammar with a single holder and no successor, rejected, and a member who left whose signature no longer counts. It matches core v16 and the MIP drafts (Identity 9, Envelope 6, Law 6; findings F1 to F100). Version 14 was version 13 with F92 and F93 applied: scenario 5.7c gains a thief who finds a used safety key after the home closes and cannot rewrite the history the home receipted, and a thief who drops auditing in a homeless rotation (approved with the step 3 findings, 28 September 2026). It matches core v15 and Identity draft 9 (findings F1 to F95). Version 13 applied F86 and F87: scenario 5.7c gains a censored reader and a thief's second rotation that does not make the first final (approved by Nobody, allegedly, 28 September 2026), and the homeless rotation component follows. It matches core v13 and the MIP drafts (Identity 8; findings F1 to F87). Version 12 applied F84 and F85: the freeze rule and the freeze procedure. Every critical and important attack of round 2 is a scenario, so a later change cannot quietly bring one back.*

## Purpose

This is the end-game checklist for freezing the MOR core. It is for the founding team, not for readers of the protocol.

**Freeze rule:** the six MIPs are frozen together, at the first release (F84). Before that, each scenario below is either **run**, exercised against the founding components and passed, or **reasoned**, walked through on paper against the texts without running code. Every scenario the founding components can run is run. The freeze publishes, with the six texts and their hashes, a **freeze report** marking each scenario and each core component run or reasoned. The cMIPs and Modules used may be clunky; only the core has to hold. A failure found before the freeze that needs a core change is a finding, fixed before the freeze.

*A reasoned rule is frozen on argument, not evidence. The report says so, so nobody mistakes one for the other, and the next reviewer knows where to press first.*

**Conformance versus validity.** Some pass criteria name rules only the signer's own client can honour (what you sign is what you saw; showing what a rule computes; never defaulting to a device-bound policy; keepers never holding content keys). They are tested by inspecting the founding clients, not by verifiers, and are marked *(conformance)*.

## Core components

Each box is ticked only when the component has passed. Numbers show the scenarios that exercise it. In the freeze report, each ticked box is marked run or reasoned.

**Identity**

- [ ] Genesis: signing key, safety commitment, homes as operator plus address, declarations slot with null removal (all)
- [ ] Identity chain of key events; sequences with position and running summary from the published vector (all, 8)
- [ ] Rotation by safety key, offline, same bytes to every home; pending until the home rule is met, shown by receipts (1, 5)
- [ ] Receipts count only alongside the valid act they name; a forged receipt changes nothing; conflicts only between genuine rotations; contest, never freeze; dishonesty bound to a position; receipts under a cosigned summary survive the operator's rotation (5)
- [ ] Home rules: authoritative home, majority of operators, majority by default when several homes declare no rule; self-hosted home authoritative by default; homes counted per operator (5)
- [ ] Self-hosted identity: rotation counts on its own signatures; the stated cost (5)
- [ ] Competing rotation: first held by the homes that count wins; home acceptance policies; a lost device survived by a backed-up signing seed (5)
- [ ] Audits: log summaries cosigned; an identity requiring audited receipts; non-extending summaries stop the audit and carry no verdict; a rotation's receipts judged under the requirement it declares (5)
- [ ] Rotation keeps the named acts' ancestry in each sequence, provable from the rotation alone even when a kept tip is private; excluded or disowned acts void, or disputes if acknowledged or recorded; later genuine acts kept (1, 2, 5)
- [ ] Routine rotation keeps unacknowledged history (5)
- [ ] Closure by rotation; a stolen operator key cannot close a home (5)
- [ ] Homeless rotation: closure, objection, auditor absence statements judged by the auditors in force before it; a vanished home's audited history proved by inclusion proofs the owner carried (F101); receipts from the new homes; final once the next rotation counts, yet beaten by a rotation the old homes held; unaudited stays provisional and is never made final by the next rotation, an objection voiding it and every rotation built on it whenever it surfaces (5)
- [ ] Escape with both keys past a hostile home, including after a refused normal rotation (5)
- [ ] Links: claim plus confirmation, ended by either, unconfirmed never displayed, public or encrypted (5)
- [ ] Outside link proved by a cMIP; signing in with MOR after a rotation (5)
- [ ] Succession declared in a rotation (5)
- [ ] Routes and payee pointers as versioned chains; a fork contested; an inbox route; two identities on disjoint relays reach each other (1, 5)
- [ ] Rotation to an everyday key of a new scheme, unknown to a client without it, valid to one with it (8)
- [ ] Collective as an identity with a threshold key grammar and a split safety key; a grammar with a recovery path (3)

**Envelope and Text**

- [ ] Act with outside and locked inside; salted inside commitment; closed format (all)
- [ ] Public act with key attached; private act with key delivered; going public later by publishing the key (2, 5)
- [ ] Identity acts always public (all)
- [ ] Encryption key published and versioned; hybrid post-quantum key delivery; the hijack window re-delivered after rotation (5, 6)
- [ ] Sealed container: relay sees the recipient, never the sender (5)
- [ ] Types by specification hash; unknown act carried, shown, adopted by opt-in (2)
- [ ] Hash-linked ordering; provable forks; `objects` entries naming their chain; a two-chain act (stake transfer) read correctly; no clock (1, 3)
- [ ] Acknowledgements counting only alongside the act they name; references, including a web reference with a snapshot hash; a repost as a reference (2, 5)
- [ ] Work hash of plaintext; locked media fingerprinted; segmentation by the named cMIP; a live stream sold by offer (1, 2, 6, 17)
- [ ] Key delivery to an identity and to a bare application key; delegated key release stopping on lapse (6, 7)
- [ ] Relays and commitments; inbox delivery (4, 5)
- [ ] Publication with `for`; withdrawal by signer or `for`, including a payment racing it (2, 3, 5)
- [ ] Canonical text; format shown as plain text by a client without the format; bidirectional controls shown visibly before signing terms *(conformance)* (1, 5)
- [ ] Text universal across sub-networks (5)

**Finance**

- [ ] Settlement receipt in the common format, signed by the receiver (1, 2, 5)
- [ ] Verification answers, including a named trusted party for a fiat rail (1, 2)
- [ ] Route across rails through a conversion service; a failed hop named by the receipts (2)
- [ ] Double entry: a payer's claim as equal evidence; a mismatch shown on the receiver; the greater amount counts (2)
- [ ] One rail proof per payment or per named batch (2, 7)
- [ ] Obligation signed by the debtor; a re-issued obligation invalid; discharge, unit-agnostic, by one or several routes; units as specifications (1, 4)
- [ ] Only identities have payee pointers; a publication pays the identity it is made for; a Finance-only client and a full client pay the same identity; the wallet checks the vault (2, 3)
- [ ] Flow and vault: per-unit, per-rail entries with derived addresses; a thief changing the flow pointer cannot collect older obligations; a unit switch goes to the vault; a dead vault rail covered by another; flow off (1, 5)
- [ ] Good-faith payment to an invalidated pointer counts as made; a payment that ignored the vault is not protected (1)
- [ ] Undeliverable payment kept as an open obligation; refund to an anonymous payer claimable by proof (2, 5)
- [ ] Receiver visibility dial; sender never required; a payer's claim published by choice (2, 5)
- [ ] A plain tip with no module fees; a referral signed by the payer (2, 5)

**Law**

- [ ] Agreements as terms plus signatures; a party bound only by its own signature; one cMIP per task; extensions (all, 3, 8)
- [ ] Sealed keepers named by the agreement; keepers check homes; recorded acts survive rotation as disputes; a record of an act nobody holds confers nothing (1)
- [ ] Several keepers with a threshold; a keeper lost, its records surviving in copies (1)
- [ ] Arbitrator given keys by key delivery to judge content (1)
- [ ] Stakes in millionths, stake rule, transfer naming both chains; shares refer to stakes and the service pays the buyer; leftovers to the first listed party (1, 3)
- [ ] Explicit work claims; a publication that carries or quotes without claiming; conflicting claims; a co-owner's lone sale visible as outside the claiming agreement, never prevented (2)
- [ ] Public domain, timed (2)
- [ ] Split service named by grant: split per receipt or payer's claim, exact sums, payouts as Finance payments, net of fees within the plan's maximum; amounts too small to send held (1, 2, 7)
- [ ] Role shares with third-party evidence; a referral named by the service alone earning nothing; an unfilled role share following the chosen option (2)
- [ ] Module fees consented; an omitted fee visible in the split (2)
- [ ] Split by an attention metric, evidenced by the module (7)
- [ ] Split service failing to split, or under-reporting against a payer's claim, shown as an open obligation; owners switching services (2, 7)
- [ ] Standing offers; key delivery or delivery confirmation as the binding moment; refund owed otherwise, claimable by proof (2, 5)
- [ ] Named time reference; recurring obligation; lapse shown as past its terms; a missed deadline shown only with an anchor or keeper, otherwise undetermined (1, 7)
- [ ] Collective founded with a key grammar that leaves a way to rotate, surviving the loss of any one key holder; a single holder with no successor rejected; member leaving by rotation plus clone, the rotation declaring the clone; a former member's signature no longer counting; a dead member's share released by the recovery path (3)
- [ ] Grant branches, seal at a named act, never before a deal the grantor paid on, import, handover; a publication under a grant with `for` (3)
- [ ] Acknowledgement recorded by the collective (3)
- [ ] Clone drafts; fork rule; status quo default; protected clauses unchanged for a party who did not sign; exit by cloning onto another cMIP (1, 3)
- [ ] Abandonment declaration by the named authority, an identity, under the clause the party signed; liveness act; contest by a contest act (1)
- [ ] Succession plan: stake and seat successors, triggered by the party or the abandonment authority, executed by clone (3)
- [ ] Negotiation record with acknowledgements; disclosure by publishing keys; standing to contest; a contest changes nothing (2, 5)

**Production**

- [ ] Specifications named by content hash; creator inside for cMIPs and Modules; MIPs without creator; a successor by another creator shown as such (8)
- [ ] Frozen at publication; a successor naming its predecessor (8)
- [ ] Verification rule on the RV32IM profile, same answer on two clients; over budget or outside the profile answers unknown (2, 8)
- [ ] Signing what a rule computes: a split shown with its payouts before signing *(conformance)* (2)
- [ ] Extension named by an agreement; a client lacking it cannot sign; an extension cannot relax a core rule (8)
- [ ] Task numbers used identically by every client (8)
- [ ] Creator paid through fee terms and role shares evidenced by signed records (2)
- [ ] A signature-scheme specification published and adopted (8)
- [ ] The six MIP hashes stable wherever published; a read-only client checks them against its build (8)

## Scenarios

### 1. Feature film, end to end

1. Several contributors sign terms binding the work by an explicit work claim, with a clone rule, a time reference (a block height), three sealed keepers with a two-of-three rule, an arbitrator for milestone disputes, and an abandonment clause naming the keepers' operators as the authority on absence, judged against the block height. One keeper later disappears; its records survive in the parties' copies. The terms contain a bidirectional override in a percentage clause; every signer's client shows the control visibly before signing *(conformance)*.
2. Media is published as locked segments; the work hash matches after unlocking.
3. Revenue reaches the owners' payee pointer, which points to a split service named by grant; it publishes a split per incoming receipt using a waterfall split cMIP, every split summing exactly, and pays each payout with its own receipt, deducting no more than the plan's maximum fee.
4. An investor sells their stake; only seller and buyer sign; the transfer names the work's chain and the agreement's chain. The split service pays the buyer from then on; a payout to the seller would be outside the plan.
5. A contributor's signing key is stolen. The thief signs a stake transfer at position 41 of the contributor's sequence; the contributor's own device, unaware, appends positions 42 to 60. The contributor rotates with the safety key from an offline device, naming position 60 as the kept tip and listing 41 as disowned. The thief's acts outside the ancestry, and the disowned act inside it, are void where nobody acknowledged and no keeper recorded them; the accomplice's completing act confers no stake; positions 42 to 60 stay valid. One act a friend acknowledged, and one a keeper recorded, become visible disputes, never valid acts. A keeper record naming an act nobody holds confers no status.
5b. Another contributor tries to escape a sale they regret by rotating to a point before it. The keeper had recorded the sale, so it stands as a visible dispute rather than disappearing.
5c. A thief with a stolen signing key changes the contributor's flow pointer. A fan tips in good faith before the rotation; the payment counts as made. Accumulated royalties, whose obligations name an earlier flow pointer, can only be paid to the vault; the thief, holding the creditor's signing key, re-issues an old obligation naming the new pointer, and it is invalid as an obligation. The thief's new flow pointer lists a rail in a unit the vault has no entry for; a conforming wallet does not pay the flow; a wallet that did is not protected by good faith. The contributor's vault lists two rails for one unit; one dies; the vault stays reachable.
6. One party signs a proposed clone alone; it stays a draft and nothing changes.
7. The deal is cloned onto a new payment cMIP with the required signatures.
8. One party misses a deadline, judged against the block height; the arbitrator, given the milestone's keys, decides the dispute.
9. One contributor with nothing to sign for months posts a liveness act and keeps their vote. Another goes silent on the deal while active elsewhere; the keepers' operators sign an abandonment declaration redistributing their stake as the clause defined. The absent party contests it with a contest act, visible to all.
9b. Two of three contributors clone the abandonment clause to a one-week period and a friendly keeper; the third has not signed the clone. A declaration against the third under the new clause is invalid; the old clause and keepers still govern the third's stake.

**Passes if:** every split balances and every payout has a receipt within the plan's maximum fee, stakes change only as signed or pre-authorised and pay their current holder, old-key acts outside the kept ancestry or disowned are rejected by every conforming verifier while later genuine acts stand, the keepers never held content keys *(conformance)*, the liveness act prevents a wrongful declaration, the draft changes nothing, the deadline and abandonment are verifiable, and a clone cannot move a non-signer's stake in two steps.

### 2. A song, two publishers

1. A musician binds a song with a work claim and publishes it through publisher A. A second identity later publishes a conflicting work claim. A fan's post quotes the song and links a web page with a snapshot hash; neither claims anything. A co-writer holding half the claim publishes the song alone under a 100% plan and sells it: every rule holds, a client shows the publication as outside the claiming agreement, and the musician's contest is visible; nothing is prevented.
2. The work is published again through publisher B; both publications coexist.
3. Each publisher uses its own publishing cMIP and charges a creator-side fee, consented by the creator, shown with its computed payouts before signing *(conformance)*, and split among its module stack.
4. A buyer using a Finance-only wallet pays the publication's price on Lightning, to the identity in its `for` field, with a referral signed in the buyer's claim; a full client pays the same identity. The owners' split service is paid in a stablecoin, through a conversion service. The route reads as one chain of receipts. The split service resolves the referral as a role share with the buyer's signed evidence and pays the referrer's pointer; a referral the service names on its own earns nothing. A second referrer has declared no payee pointer; their share stays as an open obligation. The key is delivered and the buyer checks the unlocked song against the work hash.
4b. On a second purchase, the conversion service fails to forward; the receipts name that hop and its agreement.
4c. The payee signs a receipt for less than it received; the buyer's claim, naming the same rail proof, exposes the gap; the greater amount counts and the question shows on the receiver. On another purchase the payee signs nothing; the claim alone shows the money arrived.
4d. A referral share is below the rail's minimum: the split service holds it as an open obligation and pays it once enough has accumulated. Each payout arrives net of the rail fee its receiver bears under the plan; one arrives short of the plan's maximum fee, and the shortfall shows as the service's open obligation. A debtor pays once and claims against two obligations with one proof; neither counts.
5. The buyer's client meets an act from an unknown cMIP, shows it as unknown, and later adopts it by opt-in. Two clients run the payment module's verification rule on the RV32IM profile and get the same answer; a rule that makes an environment call answers unknown on both.
5b. A split omits a module's declared fee; the omission is visible in the split.
5c. The musician regrets a direct sale made without a keeper and rotates to a point before it. The buyer's client had acknowledged the delivery, so the sale becomes a visible dispute.
6. Publisher A withdraws its publication, signed by A; B's continues; a withdrawal by a stranger is invalid in every client. A second buyer's payment reaches A just after the withdrawal, paid anonymously: no key is delivered, a refund obligation opens, and the buyer claims it by presenting the rail proof and naming where to be paid.
7. The owners dedicate the work to the public domain from a future date.

**Passes if:** the deal closes with no intermediary, conflicting claims are visible and ordered where possible, quoting claims nothing, a sale outside the claiming agreement is visible and never prevented, fees are consented and balance, the cross-rail route and its failure are legible, the payer's claim exposes silence and under-reporting, the unknown act is never acted on before opt-in, withdrawal affects only A's publication, the late payment is owed back and claimable, and past deals stand.

### 3. A label

1. A label is a collective: an identity with its own genesis and homes, founded by an agreement whose key grammar lets any two of three members sign everyday acts and requires all three for a rotation, with an escrowed share of the safety key released by the abandonment authority as the recovery path. The label grants Marco authority to sign new deals, capped per deal, and to publish for it.
2. Marco signs deals 1 to 5 on his branch; some are acknowledged, and the label records acknowledgements as they arrive. The label signs settlement receipts with its threshold key. Marco publishes an album for the label with `for` set to the label; a tips-only wallet pays the label. A 2-of-3 agreement names a debt of the member who did not sign; every client shows it unsigned.
3. Two managers with independent authority sign conflicting clones; the label's fork rule (ranking) settles it.
4. The label had signed a split on deal 3. It revokes Marco's grant; a revocation sealing before deal 3 is invalid; it seals at deal 3.
5. It imports deals 1 and 5, hands deal 4 to Sofia's branch, and leaves deal 2 unimported. Deal 3 stands by rule 40.
6. The label sells part of its catalogue stakes; the split service pays the buyer thereafter.
7. A member leaves: the remaining members rotate to keys the departing member never held, re-split the safety key, and clone the founding agreement; the rotation declares the clone. The departing member and another sign an act of a type the grammar lists, made with the label's old key after the rotation: it is void, and their signatures count for nothing under the clone (F100).
7a. A founding agreement is proposed whose grammar gives the safety key to one holder and names no successor and no escrowed share: every client rejects it as invalid (F96).
8. Another member dies. Their succession plan gives their stake to two children in equal shares and their seat to a trusted colleague, with a position paying for the job. The abandonment authority declares the absence, the plan executes as a clone, the escrowed share is released, and the members rotate and re-split the safety key to include the colleague.

**Passes if:** deals 1, 3 and 5 bind the label, deal 4 is managed by Sofia while keeping its origin, deal 2 is void, the fork resolves by the stated rule, the sale changes no other holder's stake and pays the buyer, the departing member can no longer sign for the label, every rotation had a way through that survived the loss of any one key holder, the grammar with a single holder and no successor is rejected, the former member's late signatures count for nothing, the unsigned debt binds nobody, and the succession gives stakes and seat exactly as planned.

### 4. A democracy round

1. Eligible identities prove membership through a verifying module, without revealing who they are.
2. Each allocates or delegates a fixed pool of points.
3. Ballots are sealed containers, published locked on a relay, mirrored, and committed by hash at round close; the keys are published when the round closes. *Ballots are not signed acts, since every act names a signer; the voting cMIP defines their form.*
4. Anyone recomputes the result from a mirror.

**Passes if:** points behave as a unit under conservation, no voter is linkable to a ballot, no relay could read a ballot before the close, and every mirror matches the commitment.

### 5. A nym journalist

1. A journalist publishes under an identity unlinked to their others. They later link two of them: first privately, shown to one counterparty, then publicly, by a claim and a confirmation. An unconfirmed claim by a stranger naming the journalist is never displayed.
2. A buyer pays anonymously: the receipt is signed by the journalist's side, with no payer named, and the key is delivered to a bare key the buyer supplied, in a sealed container. The journalist keeps incoming flows at the default visibility. A reader tips from a Finance-only wallet, with no module fees. The journalist has declared flow off for one unit; a tip in that unit goes to the vault. A purchase fails to deliver; the anonymous buyer's refund is claimable by proof.
3. Journalist and buyer share no relay; the buyer finds the journalist's inbox through the home and its routes. They negotiate in a private, acknowledged thread; relays route it by recipient but never see the sender or content. After a dispute, one discloses it by publishing the thread's keys. A repost of one of the journalist's pieces is a reference; tips on it reach the journalist.
4. The journalist withdraws a piece.
5. The journalist rotates routinely; the last act kept is a private reply to a source. Years of unacknowledged public posts remain valid, and every reader can prove it from the rotation alone. In the same rotation a declaration is removed by a null entry.
6. The journalist's three homes, run by three different operators, receive a new rotation; one does not store it. Receipts from the other two meet the majority rule, and clients follow it. A fourth identity of the journalist declares three homes and no rule; it resolves by majority. A fifth, self-hosted, rotates with no receipt; a thief holding its safety key would win at once, which the client says plainly.
7. A thief steals the journalist's safety key and submits a rotation. Two of the three homes require proof from a registered device and refuse it; the thief's rotation is held only by the lax home, misses the majority, and the journalist's own rotation wins. The journalist's phone is later lost at the strict home; the signing seed was backed up; the journalist leaves that home with both keys.
7b. A thief steals one home operator's everyday key and signs a receipt naming a made-up act. It names no valid act and changes nothing; the identity is never contested. The same key signs a pair of non-extending log summaries; no receipt's standing changes, and the auditors stop cosigning that home. The thief cannot close the home: closure needs a rotation.
7c. A second, single-home identity of the journalist loses its home when the operator closes it by rotation. The journalist leaves with a homeless rotation; declared auditors attest absence where a home vanished without closing, after it had receipted an audited rotation; the journalist's client carries that home's inclusion proofs to the new home, so a reader who never reached the old home still proves the history (F101). A thief's homeless rotation for a live home is voided by that home's objection. A live but hostile home refuses the journalist's normal rotation; the journalist leaves with both keys, the endorsement listing the refused rotation as abandoned. The journalist's declared auditor closes; the journalist rotates, dropping the requirement, and the rotation counts on the home's receipt alone. After re-homing, the journalist rotates once more; a late objection changes nothing. A thief who finds the journalist's long-used first safety key on an old backup, after that home has closed, makes a homeless rotation at that old position and rotates again at once; the rotations the home receipted still count, and the thief's chain counts for nothing. A thief holding the safety key of an audited identity drops auditing in a homeless rotation, and names an auditor of its own; neither a reader's failed attempt nor the thief's auditor makes the live home gone. A censored reader: a third single-home identity of the journalist, with no auditors, has its home abroad. A thief holding its safety key makes a homeless rotation naming the thief's own homes, and a censor blocks the real home from the reader's network. The reader's client tries every known address and asks relays to probe, all blocked; it shows the identity as re-homed without audit, and sends it nothing private without a plain warning *(conformance)*. The thief rotates again at once under the homes it chose; the first rotation is not made final. The home's objection later reaches the reader in a bundle: the homeless rotation and the thief's second rotation are both void, and the identity's last counting act is again the one before the theft. A thief with the signing key redirects the inbox and the encryption key; deliveries in the window are re-sent after rotation.
7d. A thief holding the journalist's safety key gets a genuine rival rotation receipted by a home whose stolen operator key also receipts the journalist's. The identity is contested at that position until the operator rotates; the audit settles which receipt is real; the home is proven dishonest at that position, the journalist's earlier rotations keep counting, and the journalist's earlier receipt under a cosigned summary survives.
8. The journalist declares a successor in a rotation, and links their MOR identity to an account on another protocol, which confirms by signing the claim in its own protocol. They sign in to an outside service with MOR after the rotation; a sign-in with the old key fails.
9. Throughout, a messaging client with no Finance or Law exchanges text with both parties, including a text act with a format it lacks, shown as plain text.

**Passes if:** no linkage exists until confirmed, the disclosed thread verifies as complete up to the last acknowledgement, no relay could read the private thread or name its sender, the two parties met without sharing a relay, the routine rotation loses no history, the non-storing home is outvoted, the thief's rotations lose, no identity is frozen or contested by a forged receipt or summary, no everyday key can close a home, the homeless and both-keys exits work and become final, a homeless rotation accepted on a censored reader's own failed attempt is labelled and never made final by the thief's next rotation, and the objection undoes both however late it arrives, a used safety key found after a closure rewrites no history, the audit requirement is droppable, the self-hosted identity rotates, and succession is readable by any client.

### 6. A streaming service

1. A streaming company sells access under a standing offer requiring its own app.
2. Content keys are delivered to the app's bare key, not the buyer's; key release is delegated to a service through a grant.
3. The company later withdraws the title.

**Passes if:** the requirement is visible before purchase, the buyer never holds the key, and the buyer's licence remains a portable, signed act after withdrawal.

### 7. A subscription service

1. A music service signs agreements with creators naming its split cMIP: one creator group under pro-rata sharing, another under user-centric sharing. The service is their split service, named by grant, allowed to batch payouts monthly on a named time reference.
2. A listener subscribes: an agreement with a monthly obligation against the time reference, signed by the listener, paid to the service's payee pointer.
3. Keys for new content are released through a delegated key-release service while payments are discharged.
4. A play-count module reports listening, with its own signed use record; each month, every incoming receipt is matched by a split under each creator's chosen model, and every payout is paid with its own receipt. One batched payout proof legitimately covers several payouts whose amounts sum to it.
5. The listener's payment lapses: the obligation shows as past its terms, and no new keys are released.
6. The listener cancels; past access stands.
7. One month the service publishes no split for part of what it received; a listener's claim shows a payment the service never receipted: the unmatched receipts and claims show as its open obligations. The creators revoke its grant, name a new split service, and publish a new payee pointer version; the old service still owes what it received.

**Passes if:** both sharing models run side by side and each creator can see which applies to them, every monthly split balances, the lapse is verifiable against the time reference, access stops without any core change, and the failed month is visible and owed, including what only the payers' claims revealed.

### 8. Specifications

1. The six MIPs are published as specifications with no creator; anyone can republish them and their spec hashes stay the same. A read-only client shows them and checks the six hashes against its build. Two clients map an agreement's task numbers to the same tasks.
2. A cMIP author publishes a split cMIP with a verification rule on the RV32IM profile, its binary carried as a locked object the specification names; a fixed version is published later, naming the first as its predecessor. The first stays on record. A stranger publishes a "successor" naming the same predecessor; a client shows the creator mismatch.
3. An agreement names an extension for a kind of work no task covers. A client without the extension cannot sign; a client with it enforces the extra rule. An extension that tries to allow a split not summing exactly is overridden by the core: the act is rejected.
4. A signature-scheme specification is published. An identity rotates to an everyday key of that scheme; a client without it shows the rotation as valid and the identity's later acts as unknown; a client with it verifies them.
5. Two clients compute the same running summary for a three-act sequence from the published test vector.

**Passes if:** spec hashes are stable wherever published, every client computes the same verification answers and summaries, the extension adds a rule without relaxing any core rule, no client signs an agreement naming an extension it lacks, and a new scheme is adopted without any core change.

## Freeze procedure

1. Settle the remaining technical parameters: the RV32IM profile and vectors, the running-summary vector, the signature-scheme specification format, the pinned Unicode version, exact formats for Finance, Law and Production.
2. Build the founding cMIPs and Modules, starting with MOR V1: a home relay, a basic relay, the genesis client (with the air-gapped safety key Module), a read-only client and a basic client; and, so every layer meets friction, a Lightning integration module (Finance), a Split Module and a deal-assessment tool (Law). Clunky is acceptable.
3. Run every scenario the founding components can run; reason through the rest against the texts. Mark each run or reasoned, ticking each component as it passes.
4. Machine adversarial review: everything, the texts, the code and the draft freeze report, reviewed by a model given the budget to break things and propose fixes (Fable, F84).
5. Specialist questions (F85): from the draft freeze report, each rule that is only reasoned becomes a targeted question to a specialist in its field, one person and one question at a time. Then human adversarial review (round 3): one reviewer attacks the whole, the running prototypes as well as the texts. Nobody outside decides the freeze.
6. Fix any failure requiring a core change, and rerun or re-reason the affected scenarios.
7. When every box is ticked, run or reasoned, the six MIPs are frozen: their texts, their hashes and the freeze report are published together.

After the freeze, a flaw in the core is fixed only by a new protocol running alongside, with users migrating by choice.
