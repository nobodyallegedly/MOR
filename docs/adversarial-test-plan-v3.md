# MOR 0.1: Adversarial Test Plan

*Version 3, 4 October 2026. Version 1 written by Fable for Nobody, allegedly, and Machine; version 2 filled in by the project lead against freeze test suite v21, findings F1 to F128 and the instruments already built; version 3 by Fable, adding the text review that must precede the verifiers, splitting the Law batch, and moving the Finance attacks that rest on collectives to where collectives exist. This plan is step 4 of the freeze procedure ("Machine adversarial review", F84). The suite says what must hold; this says how we find out whether it does. Changes from version 2 are listed at the end.*

## 0. When this plan runs

The batches attack the core as it will be frozen, not as it was a week ago. Three things happen in order before most batches start.

**First, approval.** Every batch but batch 1 waits for the core pass set (Law draft 10, Finance 6, Envelope 7, Identity 11, Production 6, core v21, suite v21) to be approved with F128 written in. F128 changes Identity (grant keys) and Law (grants, relays, "done"), and several scenario steps in suite v21 predate it (3.4 and 7.7 still revoke grants by the rule-40 seal; 1.3, 6.2 and 7.1 name services "by grant"). Those steps are rewritten when F128 is written in; a batch attacking the old wording would test a rule that no longer exists. Batch 1 can start now: Envelope and Text are stable.

**Second, a text review of what changed since round 2.** Round 2 was the last adversarial reading of the MIP text. Since then, F83 to F128 have moved Law from draft 4 to 10 and Identity from 7 to 11, and added the two chains, forks and closings, the tie rule, grant keys, purchase verdicts and releases. None of that has been read by an adversary. Verifier B cannot be written against unreviewed text: a verifier built on a rule that allows two readings returns `ambiguous` on every fixture that touches it, and the batch stalls on text findings that a reading would have caught in an afternoon. So before Verifier B is written for a MIP, Fable reads the deltas of that MIP with the four patterns of round 2 (the thing that decides is signed by the wrong party; a lower layer's rule depends on data only a higher layer's client holds; a rule that protects the owner also traps the owner; a rule rests on a fact nobody can check) and with the admission test. The review is scoped to the deltas, in batch order: Identity (F86 to F95, F101, F110, F128) first, then Finance (F111 to F116, F119, F123, F126 to F128), then Law (F96, F104 to F107, F120 to F122, F127, F128), then Production (F106). It is written up as one report per MIP in the round 2 shape, and its findings continue the log from F129 like any other.

The review has one standing item beyond the four patterns: the verdict vocabulary. Round 2 worked with eight verdicts; the core now uses about sixteen (section 1). Each is checked against the admission test: it stays in the core only if two verifiers holding the same acts must agree on it, and no module could reach it by another route. A verdict that only a client needs to display, or that restates another verdict under a second name, is moved to a cMIP or folded in before Verifier B implements it. A vocabulary that grows with every finding is the first sign that rules are being added by instance rather than by pattern.

**Third, Verifier B,** one module per MIP, written after that MIP's review and before its batch. The modules are written in the same order, cheapest first: Envelope and Text (bytes and vectors, mostly mechanical), Identity (the gauntlet's 51 checks are the first fixtures and already exist), Finance against the mock rail, Law, Production.

Batch 2 is the exception to "review, then verifier, then batch": the Identity review and batch 2 run together, because the gauntlet already holds the fixtures that exercise every Identity delta, and reading a rule next to the fixture that attacks it is the fastest reading there is. Batches 3, 4a, 4b, 6 and 7 wait for the review of the MIPs they attack.

## 1. The stance

A prototype is not tested by its own tests. It is tested by handing it acts an adversary made and asking whether every honest verifier reaches the verdict the MIPs require. Three consequences follow, and everything below is built on them.

**Acts in, verdicts out.** Every test is a set of act bytes and the verdict each one must receive. The verdicts the core now uses: valid, invalid, unknown, draft (not every party has signed), pending, void, disputed, contested, counts; for a collective's acts, not done (not sealed to every member, or on no chain) and uncited (naming no decision on the collective's chain); for payments, purchase, no purchase (with whom the refund is owed to), unrecorded (no sale recorded yet) and undetermined where a rule says so; for obligations, open, discharged, released and past its terms. This list is an input to the review in section 0, not a settled fact; the list Verifier B implements is the one that survives the admission test. A test passed by reading a log, a screenshot or a sentence from the builder is not a test. If a claim cannot be reduced to bytes and verdicts, it is a conformance claim (section 7), checked by inspection and never counted as a verifier pass.

**Two verifiers, written apart.** The core's own standard is that two honest verifiers holding the same acts decide the same way. So there are two. Verifier A is Machine's: the core library inside the relays and clients. Verifier B is written by Fable from the MIP text alone, without reading Verifier A. Every disagreement between them is a finding before anyone looks at the code: either one implementation is wrong, or the text allowed two readings. Both are worth exactly the same.

**The freeze suite is the oracle.** Each batch claims scenarios and components from suite v21 (or its approved successor) and is judged against those claims. The suite's pass criteria become assertions; the attacks of review round 2 and every finding since become regression fixtures, so nothing fixed can return without a verifier noticing.

**There is no clock.** MOR orders acts only where one cites another: each identity's chain orders its own acts, a collective's two chains order its decisions and actions, and an ending settles a race by the tie rule (F127). Real deadlines borrow the time reference an agreement names. So no fixture may depend on wall time, arrival time or a timestamp an act carries; a fixture that passes only because acts arrived in a convenient order is a broken fixture.

## 2. The instruments

**The attack harness.** A scripted way to play every party in a scenario: create identities with chosen configurations, sign acts with chosen keys (including stolen ones), submit to chosen relays, and read back what each relay holds and what each verifier concludes. It must be able to do everything an attacker can do: sign with a key it should not have, submit the same bytes to three homes, submit different bytes to three homes, withhold an act from one relay and not another, replay an old act, reorder arrival, sign two acts on one head from two devices at once. The harness is the adversary; the relays and clients never know whether a request is a test. The harness also generates every test identity's seeds itself, inside the container, so that no seed is ever typed, pasted or sent (section 8).

*What already exists, and is reused rather than rebuilt:*
- `harness/` (`mor-gauntlet`): the identity gauntlet, scenario 5 steps 6 to 7d, 51 checks, against real homes and throwaway homes. Its checks are the first fixtures of batch 2, converted to the fixture format.
- `harness/ordering`: a simulation of F109's "made before, made after", 21 stories. It models sequences without the joins and citations of F127's two chains, and was not extended to them. Extending it is part of batch 4b's entry condition.
- The Lightning regtest harness (`modules/lightning/regtest/`, `lightning_rail` test): a real rail on regtest, five payments, run on the author's Mac. Batch 3 uses it alongside a mock rail.

**Verifier B.** A standalone program, one module per MIP, that takes act bytes and the acts they name and returns verdicts, with the rule it applied cited by number. It implements only what the MIP text says. Where the text is silent or ambiguous, Verifier B returns `ambiguous: <rule>` rather than guessing, and that return is itself a finding against the text. It is written after the text review of its MIP (section 0), so that `ambiguous` marks what the review missed, not what it would have caught.

**The fixture ledger.** Every attack, once run, is frozen as a fixture: the act bytes, their arrival order per relay, the expected verdict from each verifier, the scenario step and the MIP rule it exercises. Fixtures are committed and replayed on every later build. A fixture that changes verdict between builds is a regression, whatever the changelog says.

## 3. What makes a test good

**Negative tests outnumber positive ones.** The happy path proves the code runs. The core's guarantees are all of the form "X cannot happen", and only an attempt at X tests them. For every rule, the fixture set contains at least one act that the rule must reject, and that act differs from a valid one by the smallest possible change: one byte of position, one wrong operator, one receipt naming an act nobody holds, one recipient missing from a collective's sealed act.

**Every verdict is bound to a rule.** A fixture names the MIP rule that decides it. A fixture without a rule is testing the implementation's habits, not the protocol.

**Order independence.** The same acts delivered in a different order, or to relays in a different sequence, must produce the same final verdicts. Each fixture is replayed in at least two arrival orders, and in a variant where one relay never receives one act. Where the core says an outcome may differ with partial knowledge (void becomes disputed when an acknowledgement surfaces; a fork is not complete for a verifier missing an act its history names), the fixture states which transitions are allowed and asserts that no other happens: in particular, an act that counts never becomes invalid except through a rotation that counts, a rotation that counts at position n never stops counting because of a receipt that names no act, and a complete fork is never undone by an act published after it.

**Concurrency at its edge.** For every rule that settles a race, a fixture where the two acts cite neither each other: two clones recorded from two devices (the concurrency rule), a fork and a debt on the same action head, a revocation and a grantee's act, a departure emptying an area and an act under one of its grants, a sale and a fork. The tie rule says the ending wins; the fixture asserts it in every arrival order.

**Byte-level determinism.** Every encoding the core fixes has a vector: deterministic CBOR of each act type, the act id, the safety-key commitment, the running summary for a three-act sequence (F78) with its peaks bagged left on the left (F89), the work hash, the inside commitment with salt, the lock with no associated data (F90), the sealed container carrying its key (F99), the X-Wing key delivery (F98), the payment commitment with and without its purchase element. Both verifiers produce the bytes; the bytes are compared, not the structures. A vector is published before the code that consumes it, so the code is written to the vector and not the other way round.

**Minimal distance.** When an attack fails to break the rule, the next fixture moves one step closer: if a forged receipt naming a random act is ignored, the next names a real rotation at the wrong position, then a real rotation of another identity, then a real rotation at the right position signed by a key that counts at the home but not for this identity. The rule is tested at its edge, not at its centre.

**Nothing trusted that can be checked.** Signatures are checked by both verifiers with independent implementations of the schemes where practical; the cryptographic libraries themselves are trusted, and that trust is written down in section 9.

## 4. The fixture format

One folder per fixture:

- `acts/`: each act as raw bytes, named by its act id, plus any sealed containers and proofs (inclusion, consistency) as served by the relays;
- `delivery.txt`: which relay received which act, in which order; variants listed;
- `expected.txt`: per act, the verdict each verifier must return; for identity chains, the position that counts and the home rule applied; for collectives, the decision each action is judged under and the fork's or closing's history;
- `rule.txt`: the MIP, rule number and freeze-suite step this fixture exercises; for regressions, the finding number (F53 onward);
- `attack.txt`: one paragraph in plain words: who is the thief, what they hold, what they are trying to make happen, and why it must not.

The plain-words paragraph is not decoration. It is how Nobody, allegedly, reads the test, and the test is wrong if the paragraph and the bytes disagree.

## 5. The batches

Each batch has an entry condition (what must exist before the attack starts), the attacks, and an exit condition (what has to be true for the batch to close). A batch closes only when every fixture in it passes on both verifiers in every arrival order, or every remaining disagreement is logged as a finding with a decision. Every scenario of the suite is claimed by a batch; a step a batch cannot run is marked reasoned, with the reason.

The order is 1, 2, 3, 4a, 4b, then the Finance attacks that rest on collectives (listed under 4b), then 5, 6, 7. Batch 5 depends on nothing but bytes and can run whenever Production is reviewed.

### Batch 1: bytes. Envelope and Text

*Entry:* the act encoder and the canonical-text checker exist; the vectors are published.
*Attacks:* non-deterministic CBOR accepted; an unknown key tolerated; nesting deeper than 128 levels (F91); a locked inside that does not match the commitment; a public act whose key opens to a different inside (the two-plaintext trick); a lock carrying associated data (F90); a sealed container whose key opens nothing or opens for the wrong recipient (F99); text with a trailing space, a BOM, a noncharacter, two NFC forms, against the pinned Unicode version; a format hiding a letter or digit, adding a character, or reordering the bytes it shows (F102); a publication whose size field is not its unlocked media's (F108); the empty running summary; peak bagging on sequences of length 1, 2, 3, 4, 7 and 8; `objects` with two entries on one chain versus two chains; `acks` on a Text or Envelope act, or on a cMIP act whose task is outside Identity, Finance and Law (F110: invalid).
*Exit:* byte-identical vectors from both verifiers; every malformed act rejected by both.

### Batch 2: the identity gauntlet. Scenario 5

*Entry:* the home relay, the genesis client with the air-gapped Module, three homes under three operators, one self-hosted identity, one identity with an audit requirement; the gauntlet's 51 checks converted to fixtures; the Identity text review running alongside (section 0).
*Attacks, in the order of the findings:* a receipt naming a made-up act (F53); a receipt naming a real rotation at the wrong position; two non-extending summaries from a stolen operator key (F55); a dishonesty verdict tested for reach backwards (F55); closure attempted with the everyday key, then by rotation (F56); a thief's act inside the kept line, disowned, with later genuine acts kept (F57); majority by default with no declared rule, and the self-hosted default (F59, F62); auditors gone, requirement dropped by the rotation that drops it (F60); the lost phone at a strict home, with and without a backed-up signing seed (F61); a homeless rotation, a late objection before and after the next rotation (F63); receipts for a homeless rotation from the old homes rather than the new (F86); an unaudited homeless rotation claimed final by the next rotation (F87); an escape endorsement judged by the rotation it endorses (F88); a rotation under the old home rule against a final homeless one (F92); absence statements judged under the wrong audit requirement (F93); a home rule left in place that no longer fits the homes (F94); a voided but acknowledged receipt (F95); inclusion proofs carried to a new home after the old one vanished, for a reader who never reached it (F101); a thief with the safety key at a lax single home (the stated cost); an everyday key of a scheme Verifier B does not implement (F54: rotation valid, later acts unknown); four sequences from four devices kept in one rotation, with one omitted and its acts void; a post left out of a rotation kept alive by a like or a text reply carrying `acks` (invalid) and by a witness act (disputed) (F110, step 5b); linkage claimed by a stranger and never confirmed (step 1); the private negotiation thread proven complete up to the last acknowledgement, and a text reply slipped into it (step 3); a grant key presented as a device key, and a device key presented as a grant key (F128).
*Exit:* every verdict matches across verifiers and orders; the pass criteria of scenario 5 hold; Machine's rotation with four sequences replays identically.

### Batch 3: money. Finance, scenarios 1 and 2, and the payment cMIP

This batch covers Finance between identities. Finance attacks that need a collective's two chains (sales before and after a fork, closings while owing, releases that rest on a Law agreement) are listed under batch 4b and run there, since they cannot be fixtures before the chains exist.

*Entry:* the payment cMIP with the Lightning rail Module on regtest, and a mock rail with checkable proofs for fast fixtures; payee pointers naming accepted rail Modules; the vault declaration; a split service holding a grant key (F128); the Finance text review closed.
*Attacks:* a flow pointer redirected by a stolen signing key, then an old obligation paid to it (F34), re-issued by the creditor (F66), paid in an uncovered unit (F67), paid above the per-unit limit, with several vault entries for one unit where only the smallest limit holds (F114), paid with flow off (F79); a payment the vault leaves undeliverable, and the owner never notified (F111); a receipt under-reporting against the payer's claim, a receipt absent against a claim, two claims on one proof, a batched proof covering payouts that sum, then one that over-claims (F64, F65); a refund claimed by proof from an anonymous payer, by a routing node holding the preimage, and by the payee (F80, F113: only the committed key claims); a payment on a rail Module the payee's pointer never named (F115); evidence of Module use signed by the Module itself rather than a party, and by the split service as receipt (F116, F119); a referral named by the service alone (F75); a split service paid at addresses the owners' pointer does not vouch for (F123); a payout not matching its stake, or a fee applied unevenly (N10); purchases: a Finance-only wallet paying a claimed work (no purchase, refund, F126); a payment naming a superseded claim; on a request rail, a buyer paying a version the seller's request does not commit to; on a push rail, two holders recording receipts on either side of their signatures on a new version, all refunding if either cannot accept (F128, W4); a creditor's release signed by the wrong lane (F126).
*Exit:* both wallets pay the same identity in every case; every mismatch shows on the receiver; no proof discharges more than it shows; the vault is never bypassed by the everyday key; no payment buys a version its seller has left.

### Batch 4a: deals. Law, scenario 1

*Entry:* terms, signatures, clones, keepers, the split plan, grant keys, the key grammar with a recovery path; the Law text review closed for the rules deals use.
*Attacks:* the two-step stake strip through a majority clone (F71); a 2-of-3 agreement naming a non-signer's debt (F74); a deal changed by fewer than every party (F107); a transfer and the service paying the seller (F73); a keeper record of an act nobody holds (F58); an n-of-n grammar with no recovery path, then with one, then a dead member's share released by the wrong authority (F77); a contest attempted against a payee pointer (F69); terms with a bidirectional override (F78, conformance); a threshold of parties named as a deal's authority on absence (step 1.9c); a judge named also as the payment cMIP or an extension (step 1.7); a late judgment after its period, the next judge in the chain answering (F121, N6); a grantee acting after revocation, and racing it (G1); a grant key acting outside its scope; a stolen grant key; a release missing a direct owner, a release rule changed without every owner, a timed release whose keeper vanishes (N7, N8, N11); a negotiation message treated as binding (W6).
*Exit:* no stake moves without its holder's signature or the clause version they signed; no verdict changes because of a contest; every record counts only beside its act; no grant acts beyond its scope or past its end.

### Batch 4b: collectives. Law, scenario 3, and the Finance attacks that need two chains

*Entry:* batch 4a closed; the two chains, forks and closings; `harness/ordering` extended to joins, citations and the tie rule; one collective of three members with an area held by one member and a grant key under it (section 8); the Law text review closed.
*Attacks, collectives:* a founding with the safety key in one hand and no successor (F96); a clone whose signing rule lies about what brought it into force (F104); a constitutional power with no abandonment clause (F105); a version changing a judge and the constitution under one rule only (F120, F122); two clones recorded concurrently, with and without a concurrency rule (step 3.3); an act in the collective's name sealed to one member, and one citing no decision (not done, uncited); a record not done, drawing no line (W3); an action judged under a decision it never saw (F127); a debt in the fork's history left out of the fork act, then published late; a debt outside the history, published late to undo the fork; a debt on a forgotten device's strand; a fork and a debt racing on one head (tie rule); a closing while owing (D5); a fork or closing not done (W5); a departure emptying an area while a grantee acts under it, and after it (G2); a departed holder voting, or paid unequally (field 22).
*Attacks, Finance on the chains:* a sale recorded on the collective's actions chain before a fork and one after it (F127, W2); a release traded for terms without its Law agreement, and a closing while a debt is neither paid nor released (F126); a sale and a fork racing on one head.
*Exit:* no collective owes a debt it did not sign, and no fork is undone by anything published after it; every race at an ending resolves to the ending in every order; a sale after a fork buys nothing from the collective that forked.

### Batch 5: specifications. Production, scenario 8

*Entry:* specifications published as acts; one verification rule on the RV32IM profile; the six MIP hashes; the Production text review closed.
*Attacks:* a rule making an environment call, exceeding its budget, reading unaligned; two clients disagreeing on the same rule; a successor by another creator; a specification naming a creator who never published it; a binary rule carried in the content field rather than as a locked object; six other hashes presented as MOR; a specification whose field 10 is out of order or names no layer, and an extension trying to relax a core rule (F106, step 8.3); a cMIP act placed in a layer other than its task's (F106); a client signing an agreement naming an extension it lacks.
*Exit:* identical answers on both verifiers for every rule and vector; unknown everywhere the profile says unknown; no extension relaxes a core rule.

### Batch 6: services. Scenarios 4, 6 and 7

*Entry:* batches 3 and 4a closed; a streaming offer requiring an app, a key-release service holding a grant key, a subscription agreement against a time reference, a play-count module, a split service batching monthly; a voting cMIP stub for scenario 4.
*Attacks:* an app requirement hidden before purchase; a content key delivered to the buyer's key instead of the app's; a licence that stops being portable after the title is withdrawn (scenario 6); a lapsed subscription still releasing keys, a lapse not verifiable against the time reference, a month where the service receipts nothing and only listeners' claims show the money, the creators' revocation racing the service's last split (scenario 7, G1); a use record signed by the module rather than a party (F116); for scenario 4, what the core touches only: points that fail to behave as a unit under conservation, ballots treated as signed acts.
*Exit:* scenarios 6 and 7 pass as written; scenario 4 is marked reasoned for unlinkability and ballot secrecy (they rest on the voting cMIP, outside the core), and run for conservation.

### Batch 7: the way out. The good-ancestor guarantees

The way out must be right; everything else can be fixed by MOR 2. So it gets its own batch rather than scattered steps, and it runs last, against every instrument the earlier batches built.

*Entry:* batches 2, 3, 4a and 4b closed; successor declarations, homeless and both-keys exits, clones onto new cMIPs, forks of collectives, the migration case study (10) as the scenario.
*Attacks:* an identity trapped by a hostile home, by a vanished home, by an operator closing it (steps 5.7c, 5.7d); a successor declared by a thief, or a sign-in with the old key after rotation (step 5.8); an agreement that cannot be cloned onto a new payment cMIP without a party being able to block it unfairly, or that a non-signer can clone (steps 1.6, 1.7); a member who cannot leave a collective without losing a stake (step 3.7, Q6); a minority unable to fork, or a fork leaving a party bound to the old collective (F121); history that a reader cannot prove after every original home is gone (F101); a specification republished elsewhere whose hashes change (step 8.1).
*Exit:* every exit works and becomes final without anyone else's permission beyond what the texts require; nothing a party signed is lost on the way out.

## 6. Reporting

Each batch returns one report in the round 2 shape: pattern first, then the attack, the loss, the confidence, the smallest fix. Two fields are added. **Kind:** text (the MIP allowed two readings, or was silent), code (one verifier diverged from a clear rule), or instrument (a cMIP, Module or client failed, with no core rule at fault). **Verifiers:** which one Fable's verdict agreed with, if either. Findings continue the log from F129, the text review's included. A text finding is decided with Nobody, allegedly, one at a time, and applied to the drafts; a code finding is fixed by Machine and its fixture is kept; an instrument finding is logged and fixed when cheap, and never blocks the freeze, since cMIPs and Modules are instruments for testing the core, not deliverables.

A text finding found during a batch, after the review of that MIP closed, is also a finding against the review: the report says what pattern it belongs to and why the reading missed it, so the next review reads differently.

A batch report also lists what was attacked and could not be broken, as round 2 did. That list is the actual deliverable of the freeze: the report that says, rule by rule, what was run and what was only reasoned. Each rule left reasoned becomes a candidate for the specialist questions of freeze step 5 (F85).

## 7. Conformance, tested by inspection

Some rules bind the signer's own client and no verifier can check them: what you sign is what you saw; bidirectional controls shown; what a rule computes shown before signing; no device-bound policy by default; keepers never delivered content keys; the air-gapped device building its own summary; no witness act signed as a side effect of another gesture (F110); a member's client holding and handing out every act of the fork's history; an empty area shown as an emergency (F128); a split service whose grant ended issuing no payment requests; the buyer's client reading the work's claim before buying. They are tested by inspecting the founding clients, with a fixed checklist per rule, and the result is reported as conformance, never as a verifier pass. The freeze suite marks them; the report keeps the mark.

## 8. The reviewer's identities, and what is never attacked

Fable holds identities on the test relays, configured for the risky cases on purpose: one with a single home under a device policy; one with an audit requirement and one auditor; one self-hosted with a backup home; one with a vault covering a single unit; one collective of three members with an area held by one member and a grant key under it. Fable holds both seeds of each, so every attack in batch 2 can be run as owner, as thief, or as both. Every seed is generated by the harness inside the container where the tests run, and used only there; Fable never holds a seed in a chat or a file it sends. Machine's identity keeps one sequence per window and is the first to rotate with several sequences.

Limits, without exception:
- **Test identities only.** No real identity exists before step 17. Every identity attacked is a test identity, and every test act is wiped with the relays before real use.
- **No real money.** Rails run on regtest or signet only.
- **Keys stay where they are made.** Seeds and private keys never appear in a chat, a report, a fixture's `attack.txt` or a commit; fixtures carry act bytes and public keys only.
- **Deployed homes are attacked only in ways the gauntlet already allows.** Stealing an operator's key, closing an operator or switching a home off runs on throwaway homes the harness starts.
- **Names.** Anything Fable writes into the repository follows its rule: the author is "Nobody, allegedly", never by name.

## 9. Honest limits

- **Cryptographic libraries are trusted.** BIP-340, SLH-DSA, XChaCha20-Poly1305, ML-KEM and X-Wing are taken from reviewed implementations; the plan tests their use, not their mathematics.
- **No timing attacks, no load.** Latency, bandwidth and denial of service are relay-market concerns and are not in scope for the freeze.
- **The rail is mocked where it must be.** The mock rail tests Finance's rules exactly and fast; the regtest run tests Lightning on a private chain. Neither tests Lightning on the open network.
- **Relays are transport.** Since F128 no validity rests on where an act is stored, so relay behaviour is attacked only where the core's guarantees depend on it (withholding, reordering, privacy of the thread in step 5.3), not as a market.
- **The text review is a reading, not a proof.** It is scoped to the deltas since round 2; rules it did not touch are covered only by the fixtures that exercise them. A reading finds what its patterns find, which is why section 6 records what it missed.
- **Conformance is inspection.** Section 7 is only as good as the inspector.
- **A pass is not a proof.** It is evidence that the rules hold against every attack anyone thought of. The report says which those were, so the next reviewer can start from the list rather than from zero.

## 10. What a batch must contain when it reaches Fable

The scenarios and components claimed; the approved `spec/` text the code was written to, with its hashes; the findings log from F83 to the current entry, so every rule can be read with the decision that made it; Machine's divergence list (where code and text disagree, and why); the session reports that wrote the latest findings in (for Law, `docs/law-draft-10.md`); the fixture folders already run, with Verifier A's verdicts; the harness, runnable in a container, or the act bytes and relay transcripts where it is not; and what Machine already tried to break, so nothing is attacked twice. Fable returns Verifier B's verdicts, the disagreements, new fixtures for the edges Machine did not reach, and the report.

For the text review that precedes a batch, the same pass set and log are enough; no harness is needed.

## Changes from version 2

- Section 0 now has three steps: approval, a text review of the deltas F83 to F128 with the four patterns and the admission test, then Verifier B; batch 2 runs alongside the Identity review, every later batch waits for the review of its MIP. The verdict vocabulary is a standing item of that review.
- Batch 4 split into 4a (deals) and 4b (collectives), each with its own entry and exit; the Finance attacks that rest on a collective's chains moved from batch 3 to 4b.
- Batch order fixed (1, 2, 3, 4a, 4b, 5, 6, 7) and the entry conditions of batches 6 and 7 name the batches they depend on.
- Batch 2 gains the grant-key confusion attack (F128); batch 4a gains the grant and release attacks from the old batch 4.
- Section 8 states that seeds are generated by the harness inside the container; the five limits are unchanged.
- Reporting records a text finding found after a review closed as a finding against the review; section 9 adds the review's own limit; section 10 asks for the findings log from F83.
