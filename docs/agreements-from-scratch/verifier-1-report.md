# The grammar verifier, first edition: report

15 November 2026. Written by Claude, for the MOR lead, and for the Dubsar Suite lead's briefing of the players. A record of work, not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

## In plain words

The new acts had bytes, a checker and vectors (pull request 179). The checker says one act is well formed and signed. This step builds what reads **a set of acts** and gives draft 24's answers, grammar rule by grammar rule: which Terms are in force, whether two acts are a fork, whether an update is late, who receives a payment, whether a person is bound, whether an agreement signed, whether two halves of a leg match, whether Terms for a baked work count, and the rest. Each answer is one of draft 24's words (shown, not shown, fork, valid, not valid, invalid, unchecked), names the grammar rule it comes from, says what it stands on (per place, per clock, per anchoring, as shown), is marked disputed where draft 24 says so, and names whoever said what it rests on.

The verifier never computes what a cMIP is for: every socket (K1 to K8) is a plug-in. With the cMIP held, its answer is used; with none, the answer is **unchecked**. For tests, small **stub cMIPs** plug into each socket and answer from a table. The layers draft 24 leans on and that do not exist yet (a place, a clock, the envelope's chain and its holder, Money's payments and settlements) each sit behind one small interface, with a test stand-in.

117 cases, built from real signed acts, test the answers; they are written to a vector file that a second builder can replay from the file alone. An independent Python check judges a share of them again from draft 24's text (section 4).

Nothing of the old Agreements was opened or reused. `draft-24.md`, `encoding-1.md` and `report-block-3.md` did not change (their plain SHA-256 are still `bb2514fa…20fd`, `f9996741…0349` and `467c23f5…cb22`). The encoding's checker answers exactly as before: its two vector files come out byte for byte the same. The only lines touched outside the new submodule are `pub mod grammar;` and a `Hash` derive on `Who`, in `core/src/agreements_new/mod.rs`.

## 1. What was built, rule by rule

The code is `core/src/agreements_new/grammar/` (Rust), beside the encoding and not touching the old module. Each file says in its first lines, in plain words, what it reads.

| Grammar rule | What the verifier answers | Where |
|---|---|---|
| G1.2 | whether an act is an agreement's signature: under a power its own Terms in force give, or by every one of its signers (one signing: the same act but for `previous`, `answers`, `relies_on`) | `force.rs`, `order.rs` (`signature_of`) |
| G1.4 | the receiver for an act: from the version it names, or the Terms in force; through agreements until a party is reached; a role filled once; not shown where none, a role filled twice, or a loop; unchecked where the verifier stops (a limit) or lacks acts; during a fork, the shared Terms' receiver with the fork shown; a payment naming a version set aside, disputed | `receiver.rs` |
| G2 | invalid where the checker finds G2.1; what is left unread (G2.2) | `order.rs` (`act`, `whole`) |
| G3 | invalid where the checker finds G3.1 | `order.rs` (`act`) |
| G4.1 to G4.4 | in force, by `in_force`'s cMIP or the default; an agreement named as a party not counted by default; an assent shown where counted and its Terms in force | `force.rs`, `order.rs` |
| G4.5 to G4.9 | the chain: each update valid by the original's condition (or the default: everyone who signed the original) and in force by its own `in_force`; replaced Terms not shown, naming what replaced them; forks; late updates, by knots, per place, per clock, per anchoring; one update unchecked makes the rest unchecked | `chain.rs` |
| G4.10 | counter signatures: which assent each is read against, and whether it came before the Terms came into force (per place, or by citing); not shown where no order; a limit on readings that lean on one another | `force.rs` |
| G4.11 | valid or not valid, with the condition named and its ground, or "by default"; never "not valid" by default | `force.rs`, `chain.rs` |
| G5.1 to G5.4 | bound: by one's own assent, through a power, or through an update the condition answers valid; an act with no `for` in its signer's name only; an act under a power made after the Terms that gave it were replaced | `force.rs`, `order.rs` (`bound`) |
| G5.5 | a delegation ended by its delegator alone (body read through K1) | `force.rs` |
| G6, G12 for lines | forks in a signer's line, whatever a place shows; resolution by the signer or under a power to resolve; a line unchecked before an act not held | `line.rs`, `order.rs` (`line`) |
| G7 | per place (only acts the place shows count); per the reader's anchoring where none is named; unchecked without the place's answers, or with two that contradict | `mod.rs` (`counts`, `scope_of`) |
| G8 | every answer lists whose word it rests on (a signer, a place, a cMIP, the envelope's chain, Money) | `answer.rs` (`said`) |
| G9 | unchecked wherever a cMIP, an act, an agreement's acts or a place's answer is lacking; limits on following | throughout |
| G10 | fillings with their proof and who confirmed them; whether a spot takes new identities (the task's output); a filling's rights and the later versions that change them | `spots.rs` |
| G11 | whether Terms hold the Control task; the two halves of a leg (matched, mismatched, one side only); a call expecting one side; no report called for; unanswered or not shown, by who reads; the data socket (yes, no, one leg); the buyer's leg; before paying; the contest, and a buyer's contest | `legs.rs` |
| G12 for Terms | forks, resolving updates, set aside, an act shaped as a resolving update with no fork is an act like any other, rival resolving updates, a power to resolve, what others relied on stands (disputed) | `chain.rs`, `line.rs`, `receiver.rs` |
| G13 | the order from citing | `order.rs` (`order`) |
| G14 | the baker: the holder at the act cited, from the envelope's chain; shown, not shown, invalid (a thief; an `envelope_at` not of the chain), unchecked; after a sale; late Terms; a double sale; the same work baked again, shown beside | `baker.rs` |

**The public questions** are listed by name in `grammar/questions.rs` (25 of them: `in_force`, `last_version`, `update`, `assent`, `counter_signature`, `bound`, `signature_of`, `line`, `resolution`, `order`, `receiver`, `receiver_for_payment`, `fillings`, `takes_new`, `rights`, `holds_control`, `leg`, `silence`, `data`, `buyer_leg`, `before_paying`, `contest`, `baker`, `act`, `whole`).

**The vectors**: `core/vectors/agreements-new/grammar.json`, its own section of the README there. 117 cases, defined once in the library (`grammar/cases.rs`), each with its acts (written with the encoding's builders, signed by the same test identities as the encoding's vectors), the stand-in tables, the question, the stubs' answers, the expected answer and the sentence of draft 24 it tests. They cover every case the brief lists: in force by the default and by `in_force`; an update by the default and by an update condition; a fork in a signer's line and of Terms, both tips stopped, resolved by an update; a late rival shown by knots (and per place); the counter signature (before, after, no order); an agreement as a party signing through a power (and by all its signers); one leg's call, its two halves matched, mismatched and one side only; the buyer's leg; a contest; the baker at the cited act, after a sale, a thief's Terms invalid, late Terms; the same work baked again.

**Tests and CI**: `grammar/cases.rs` runs every case and checks that every grammar rule listed has one; `core/tests/agreements_new_grammar_vectors.rs` replays the file from its bytes and tables alone and must get every recorded answer; the binding's test asks through it and compares. CI's existing steps run all of it (the workspace tests, the vectors regenerated byte for byte, the Python check).

**The binding** (optional, done): `wasm/src/agreements_new_grammar_js.rs`, read-only: `agreementsNewQuestions` and `agreementsNewAsk` (acts as bytes, the stand-in tables a client has, the reader, a question by name; the answers as JSON text). It answers every socket with the stubs: any other cMIP is lacking, and its answers are unchecked. Nothing in `clients/`, `cmips/` or `modules/` was touched.

## 2. What could not be built, and why

- **Real cMIPs.** None exists for the new sockets; the stubs answer from tables. So every answer through a socket is as good as its stub, and no more.
- **Real layers.** A place, a clock, the envelope's chain and Money are stand-ins (section 5). Draft 24, section 8.1: "Until this exists, every 'per place' in this text has nothing under it that can be built", and "Until this exists, G14 has nothing under it that can be built." The verifier is built against the interfaces those layers would need to offer; the interfaces are a reading, not a design.
- **G3.2 and G12.8** are not a verifier's (draft 24 says so); nothing was built for them.
- **"Per clock" for which Terms are in force.** The clock is read for lateness (G4.7(b), G14.2(b)); an answer about what is latest is per place, per anchoring or as shown. Draft 24 gives no rule for "in force per clock"; none was invented.
- **What one doer's report gives each receiving side** (G11.3), **"still owed" lines closed later** (section 8.2, item 15), **pools** (item 16), **a pending payment** (item 14), **the modules** (item 17): left to cMIPs or to the layers, as draft 24 leaves them; the verifier reads no K6 cMIP beyond whether the task is held.
- **K7** (a kind's meaning) is never needed by the grammar's answers beyond matching a power's kind; its stub exists, unused.
- **"As if the tip had stood alone"** (G12.5) is read by following, from the tip set aside, each version that is the one update of the one before; a fork inside a branch set aside is not read further.
- **Rival resolving updates** are resolved one level deep (a resolving update naming the rivals); deeper leaning is not followed, and the fork stands.
- **A filling's rights** (G10.6) are read against the versions of the line after the version it was earned under; only case (b) has a vector; (a) is built and has no vector yet.

## 3. Where draft 24 had to be read: the questions

Each is a place where draft 24 is silent or unclear, with the sentence, the reading taken, the lean, and whether it changes an answer. Nothing here is decided; each is for the MOR lead and Nobody, allegedly. **Twelve change an answer, and come first.**

### Questions that change an answer (12)

**A1. The answer word for a late update.** G4.7(c): "About L, a verifier answers that it replaces nothing and is no tip, names G4.7 and what shows that L came late". No word from section 2 is named. *Reading:* asked whether L is late (`update`), **shown**, G4.7, with its qualifier; asked whether L is in force, **not shown**, G4.7, with that answer beside. *Lean:* as built; draft 24 could name the word. *Changes an answer:* yes (which word a player sees).

**A2. The answer word for late Terms.** G14.2(c): "no new answer word. A verifier shows the Terms as late, names G14.2". *Reading:* G14.3's answer about late Terms is **not shown**, rule G14.2, with "late" (shown, qualified) beside it; they count for nothing. *Lean:* as built; note that "not shown" here cannot be undone by an act not held, unlike section 2's definition of the word. *Changes an answer:* yes.

**A3. A place orders every two updates.** G4.7(b): "L came after O was replaced, per that place, where the first position at which ... L is valid and in force comes after the first position at which, so counted, F is valid and in force". *Reading:* where the original names a place, of two updates the one valid and in force later at the place is late; so a fork of Terms stands under a place only where both become valid at the same position. *Lean:* as written; Nobody, allegedly, may want to see that a place all but removes forks of Terms. *Changes an answer:* yes (fork, or late).

**A4. Which knots show an update late.** G4.7(a): "So L is late by knots where L itself, or an assent without which L is not an update of O, names, directly or through the acts it names, enough acts for F to be valid and in force." *Reading:* L's own namings, or those of one such assent, each alone; the namings of several of L's acts are not added together (the sentence before it, "counting every act held but those that came after O was replaced", is read through this one). *Lean:* as built. *Changes an answer:* yes: building the cases, two rival updates whose assents each named half of what made the other came out a fork, not late.

**A5. Which lacking act "might be what shows L came late".** G4.7(c): "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late, whether L is late is **unchecked**". *Reading:* any fingerprint in a field that names acts (`replaces`, `previous`, `terms`, `under`, `answers`, `relies_on`, `resolves`, `continues`, `settlement`, `envelope_at`), directly or through acts held, that is not an act held, a piece the verifier holds, a payment or settlement Money gives, or an act of an envelope's chain. Since Terms' `relies_on` also holds pieces (not acts), a verifier that is not handed those pieces answers unchecked. Asked only where there is another update to be late against. *Lean:* as built; clients should hand the verifier the pieces they hold. *Changes an answer:* yes.

**A6. "Everyone who signed the original" and assents whose cancellation is not shown.** G4.8(a): "each party in whose name an assent to the original counts". *Reading:* only assents surely counted; one whose counter signature's order is not shown does not count, so its signer is not asked by the default. *Lean:* the update's answer should rather be not shown in that case; not built. *Changes an answer:* yes, in that rare case.

**A7. Two powers of the same kind.** G5.1(b): "those Terms give a power for acts of this kind; and that power's rule ... says yes". *Reading:* any one of them saying yes is enough (encoding-1 report, question 4). *Lean:* as built. *Changes an answer:* yes.

**A8. An agreement with a power of the kind that says no.** G1.2: "Where x's Terms give no such power, x signs by every one of its signers". *Reading:* where they give such a power and its rule says no, x has not signed, even if every signer signs the same act. *Lean:* as built. *Changes an answer:* yes.

**A9. Acts held that cannot be read.** Section 2 and G9 speak of acts lacking, not of acts held unreadable (a private act without its key; a signature scheme not implemented). *Reading:* such an act counts for nothing, and is named as unreadable where asked; an answer that might rest on it (an unreadable assent) is not made unchecked. *Lean:* unchecked would be safer where the act is named by another act, which is what is built for lateness (A5); for counting assents, not built. *Changes an answer:* yes (not shown where unchecked might be wanted).

**A10. Two versions by one author are a fork in that author's line.** G6.2: "Two acts by one signer within one agreement that name the same `previous` ... are a fork." Two rival versions written by one signer, each naming that signer's last act, are both a fork of Terms (G4.7) and a fork in the signer's line, which stops both (and everything built on them) until the signer's line is resolved too. *Reading:* both apply, as written; the cases write rival versions by different authors. *Lean:* draft 24 could say how the two forks are resolved together (one resolving update serves both only if it is also that signer's act naming the shared previous). *Changes an answer:* yes.

**A11. "Nothing they name is lacking", for a thief's Terms.** G14.3(a): "and the holder at that act is not among the Terms' parties, and they reach that holder through no role, and nothing they name is lacking, they are **invalid**". *Reading:* the acts the Terms name directly (other than `envelope`, `envelope_at` and `agreement`) must be held, or be pieces the verifier holds; otherwise **unchecked**. *Lean:* as built; draft 24 could say which namings it means. *Changes an answer:* yes (invalid or unchecked).

**A12. The first counter signature.** G4.10: "An assent is read against the first counter signature in the same name that follows it". *Reading:* the one, of those that follow it, that follows no other; where two follow none of each other, the one first in byte order of id is read. *Lean:* draft 24 could say: both are read, and either cancelling is enough. *Changes an answer:* yes, in that contrived case.

### Questions that do not change an answer (10)

**B1. A resolving update's own `in_force`.** It names no party, so "Terms that name no party as a signer, and carry no `in_force`, are in force at once" (G4.1); its signatures are the condition's answer (G4.11(g)).

**B2. "Removes or narrows the power"** (G5.5) is read as: the version's `powers` entries, as bytes, a proper subset of the old ones'.

**B3. The holder in a fork the layer resolves for itself** (G14.2, "A double sale"): where the layer gives a holder at a tip, the answer is that holder, with the fork shown beside; where it gives none, not shown.

**B4. Late Terms per place** (G14.2(b), "shows the Terms after Y") is read from the Terms act's own position against the transfer's, not from a first position at which they are in force.

**B5. Who is a side, for silence** (G11.4(d)): the doer, a party named as a signer, or the receiver for a party named as an agreement; told by `Reader`.

**B6. Which Terms' data cMIPs are asked about a buyer's confirmation** (G11.6(b)): the version the payment names (only where the payer's assent to it is held), and, where its receiver is another agreement, that agreement's Terms in force.

**B7. A contest against a tip of a fork that stands** counts for nothing while the fork stands (G12.2), and is not shown; against a tip set aside it is shown, disputed (G11.8).

**B8. The qualifier of an answer that rests on the version an act names** (the receiver for an act, G1.4): "as shown", since whether that version is a tip or set aside depends on the acts held; the version itself is fixed by fingerprint.

**B9. The stub of K2 is asked with the assents counted, by name**; the stub of K4 is also given "everyone who signed the original" (it may use it or not). What a real cMIP is handed is the encoding of that socket's input (draft 24, section 10, item 12), not fixed here.

**B10. An assent to a tip** counts for whether that tip was signed only through its `terms` field (G12.2); one that also names the tip in `relies_on` is built on it, and does not count.

## 4. The independent check

`core/vectors/agreements_new_grammar_check.py`, run by `core/vectors/check.py`, written by a separate reader from draft 24 and encoding-1 only, without the Rust verifier. RESULTS_PENDING

## 5. The stand-ins

Each is in `grammar/layers.rs`, behind one small interface, with a test stand-in built from a table (`Table*`), **for tests only**. Each stands in for a sentence of draft 24's section 8.1.

| Interface | Stand-in | Section 8.1's sentence it stands in for |
|---|---|---|
| `Place` | `TablePlace` (positions, and acts on which it holds contradicting answers) | "A place, from the layer that orders acts ... (2) one line of the acts the place was shown, in the order it was shown them; (3) a signed answer, by the place, that says of an act ... whether it is in that line and at which position; (4) in the same answer, whether anything of the same agreement comes after it ...; (5) a way for a verifier to tell that two answers of one place contradict each other (G7.2)." |
| `Clock` | `TableClock` (a time for an act) | "What a clock is, which layer gives it, and how it is identified without a server address (G7.4)." |
| `EnvelopeChain` | `TableChain` (each envelope's bake, baker, work, transfers; whether the layer gives a holder in a fork) | "The envelope's chain, from the layer below (G14) ... (1) the bake names the baker ...; (2) a transfer act ...; (3) who may sign it ...; (4) how a reader gets the holder at an act ...; how a verifier tells that an act is of a given envelope's chain ...; (5) what a fork there shows ... Also, as before: how a verifier tells that two envelopes carry the same work." |
| `Money` | `TableMoney` (payments with the version each read and its settlement; settlements held; pairs of the same payment) | "What a settlement is, as the layer that holds value gives it ...; and what a payment is there: how it names the version of the work agreement it read", and "'The same payment', and Money's counting ... this text needs its answer to whether two such acts are of the same payment (G11.4(b))." |

The stub cMIPs (`grammar/stubs.rs`), one per socket, each named by the fingerprint of a label that says it is a stub: K1 (parts and a delegation), K2 (names, or a count of names), K3 (signers who may), K4 (k of the original's signers, never, always), K5 (fillings listed), K6 (always yes), K7 (a meaning), K8 (readers listed).

## 6. What the players can ask once this is merged

- Through the binding: `agreementsNewAsk({ acts, ask, args, onBehalfOf?, anchoring?, places?, envelopes?, payments? })`, with `agreementsNewQuestions()` for the list. For example: is this Terms act in force; what is the agreement's last version (or is there a fork); is this update valid or late; does this assent bind; does this counter signature cancel; is this person bound by this act; is this act this agreement's signature; is this signer's line forked; who receives a payment naming this version; who fills this spot; do these two halves of a leg match; is the buyer's payment confirmed; whom does this contest reach; do these Terms for a baked work count.
- Every answer comes with its rule, its qualifier, whether disputed, and whose word it rests on.
- What they cannot have yet: answers through real cMIPs (the stubs stand in; anything else is unchecked), and real places, clocks, envelope chains or Money (the stand-ins' tables stand in). An answer "per place" is only as good as the table it was given.
- Test identities only; no server address, onion address or key appears.
