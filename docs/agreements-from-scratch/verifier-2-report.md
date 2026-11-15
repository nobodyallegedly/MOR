# The grammar verifier, second edition: report

15 November 2026. Written by Claude, for the MOR lead, and for the Dubsar Suite lead's briefing of the players. A record of work, not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

## In plain words

The first grammar verifier (pull request 182, `verifier-1-report.md`) was built on draft 24 and the first encoding. Meanwhile a clean-up wrote draft 25 and encoding 2 (pull request 183), so that two honest writers cannot write one act two ways. This step carries the verifier onto them. Branch `claude/agreements-verifier-2` starts from the clean-up and merges the first verifier's commits; the clean-up's files are as it left them.

Very little had to change in the verifier, because draft 25 changes nothing it answers about a well-written act. Three things did:
- a fork in one signer's line is now resolved by a Statement of its own kind, `resolve`;
- a confirmation of a payment names the payment's settlement, never the payment;
- a call in Terms that do not hold its task is now said, in G2.2, to be left unread, and the verifier says so.

The vectors were made again from real encoding-2 acts. Every act now stands in its signer's real sequence (`prev`, position, running summary), as the clean-up's vectors do, and every case quotes draft 25.

Of the first report's 22 questions, draft 25 settles one (two powers of one kind) and part of another (an act held that cannot be read, named in `previous`), changes the ground of one more (a buyer's confirmation, now named by its settlement), and leaves the rest open. Two new questions come with it. **Thirteen open questions change an answer**; they are listed first, in section 3.

`draft-25.md`, `encoding-2.md` and `report-block-4.md` did not change: their plain SHA-256 are still `883ddbb2…e09c`, `9fe27446…1c16` and `c25aafcd…1c73`. Regenerating every vector leaves every file the same, byte for byte; the clean-up's `valid.json` and `invalid.json` come out exactly as it published them.

## 1. What changed

**In the verifier** (`core/src/agreements_new/grammar/`):

- **Spec hashes and words.** It reads acts under draft 25's spec hash (`dd90f8af…3b2c`) and the report block's fourth proposal (`7b65c60f…7d8e3d7854`). Acts under draft 24's are "not this encoding", and the verifier never sees them. Its plain words name draft 25.
- **The resolve.** A fork in one signer's line is resolved by a Statement of kind `resolve` (draft 25, section 3.2, G12.4): by the signer itself, or by another under a power of kind `resolves` in Terms by which the signer is bound, its `for` naming that signer. A power of kind `resolves` matches a resolve and nothing else. A resolve is never counted as an assent. Encoding 2 rejects a Statement of another kind that carries `resolves`, so the verifier never meets one.
- **A payment's settlement.** For the buyer's leg, a confirmation is a report whose call names the settlement the payment names (G11.7, "and never the payment itself"); the data socket finds the payment by that settlement. A report whose call names the payment itself is not read as its confirmation (question N1).
- **What is left unread** (G2.2): besides the checker's notes, the verifier says it left unread a call attached to the Control task in Terms that do not hold it, and a call attached to any other task, which these grammar rules do not read (G11.2).
- **The receiver.** Encoding 2 writes it `[0, position]` or `[2, root]`, and rejects a position naming a party named as an agreement. The verifier reads the same two values as before. Its branch for "a position naming an agreement's entry: no one receives" can no longer be reached, and stays as a guard.
- **A resolving update of Terms** now carries only what resolving needs. The verifier never read its words, so nothing changed there. It is in force at once by G4.1's default, since it names no party (question B1, still open).

**In the cases and vectors** (`grammar/cases.rs`, `grammar/scenario.rs`, `core/vectors/agreements-new/grammar.json`):

- **Every act stands in its signer's real sequence** within its case: `prev` names the signer's act before it, its position counts from 1, its running summary covers every act before it. A test rebuilds each signer's sequence from every case's bytes and checks every act's `prev`, position and running summary.
- **The line resolved by its signer** is now a `resolve`. A new case: a signer's fork resolved by a resolve made for that signer under a power (G12.4), and the assent it continues counting.
- **The buyer's confirmations** name the settlement.
- **A new case for G2.2**: a call in Terms that do not hold its task is left unread.
- **One case was rebuilt so that no act is taken out of a sequence**: the act under a power made after its Terms were replaced (G5.4). The first edition had removed an earlier act from the book; this one never writes it.
- **Every case quotes draft 25.** A test checks each quoted sentence (or each part, where the quote leaves words out with "...") against `draft-25.md`. Four quotes had to change: three were mine (an elision, a bold mark, a shortened clause), and one is draft 25's own change to G2.2.
- **120 cases** (117 before, and three new).

**In the independent check** (`core/vectors/agreements_new_grammar_check.py`): it is the one an independent reader wrote for the first verifier, without the Rust code. This time I brought it onto draft 25 myself, for draft 25's changes only, each marked "draft 25" in the file:
- the spec hashes;
- the receiver's two forms;
- the confirmation named by its settlement;
- a signer's fork resolved under a power;
- the call left unread.

It now judges **115 of the 120 cases**, and agrees on all of them. The five it cannot judge are as before: fillings, a filling's rights, the walk before paying, the delegation ended by its delegator, and the act made under it afterwards. Because I wrote those edits, they are not independent of the verifier, as the first edition's reader was; a stranger's second reading of them is open.

**Tests and CI.** All pass here:
- `cargo test --workspace --locked`;
- the vectors regenerated byte for byte;
- `python3 core/vectors/check.py`: all 569 vectors agree;
- the binding's test.

The binding (`agreementsNewAsk`) is unchanged but for draft 25's words. Nothing in `clients/`, `cmips/` or `modules/` changed, and nothing of the old core.

## 2. The first report's 22 questions, against draft 25

| | Question (`verifier-1-report.md`) | Draft 25 |
|---|---|---|
| A1 | The answer word for a late update | **Open.** G4.7(c) is unchanged |
| A2 | The answer word for late Terms | **Open.** G14.2(c) is unchanged |
| A3 | A place orders every two updates | **Open.** G4.7(b) is unchanged |
| A4 | Which knots show an update late | **Open.** G4.7(a) is unchanged |
| A5 | Which lacking act "might be what shows L came late" | **Open.** G4.7(c) is unchanged |
| A6 | "Everyone who signed the original" and an assent whose cancellation is not shown | **Open.** G4.8(a) is unchanged |
| A7 | Two powers of the same kind | **Settled**, as built: G1.2 and G5.1(b) now say "where those Terms give two or more powers for that kind, the act binds where any one of their rules says yes" |
| A8 | An agreement whose power of the kind says no | **Open.** G1.2's "Where x's Terms give no such power" is unchanged |
| A9 | Acts held that cannot be read | **Settled in part**, as built: G6.1 now says that where `previous` names an act held and not opened, "the act counts, the signer's line is **unchecked** before it (G9), and the act is not invalid". Whether an unreadable act held that may be an assent makes in force unchecked is still open |
| A10 | Two versions by one author fork that author's line | **Open.** Section 3.2's new paragraph, "An author's first act", says only that the author's assent names the Terms act; rival versions by one author still fork that author's line |
| A11 | "Nothing they name is lacking", for a thief's Terms | **Open.** G14.3(a) is unchanged |
| A12 | The first counter signature | **Open.** G4.10 is unchanged |
| B1 | A resolving update's own `in_force` | **Open, and changed in ground.** A resolving update now carries only `replaces`, `agreement`, `resolves`, `continues`, `previous` and `relies_on` (section 3.2), so it never names a party, and G4.1 read literally puts it in force at once. `encoding-2-report.md` lists this as the grammar verifier's |
| B2 | "Removes or narrows the power" | **Open.** G5.5 is unchanged |
| B3 | The holder in a fork the layer resolves for itself | **Open.** G14.2 is unchanged |
| B4 | Late Terms per place | **Open.** G14.2(b) is unchanged |
| B5 | Who is a side, for silence | **Open.** G11.4(d) is unchanged |
| B6 | Which Terms' data cMIPs are asked about a buyer's confirmation | **Changed in ground, still open.** A confirmation now names the settlement (G11.7), so the verifier finds the payment by its settlement; which Terms are asked is read as before |
| B7 | A contest against a tip of a fork that stands | **Open.** G11.8 is unchanged on this point; only what `settlement` names changed |
| B8 | The qualifier of an answer resting on the version an act names | **Open.** Unchanged |
| B9 | What the stubs of K2 and K4 are handed | **Open.** Unchanged (section 10, item 12) |
| B10 | An assent to a tip that also names it in `relies_on` | **Open.** G12.2 is unchanged |

## 3. The questions still open

Each is unchanged from the first report unless said. Nothing is decided; each is for the MOR lead and Nobody, allegedly.

### Those that change an answer (13)

1. **A1. The answer word for a late update** (G4.7(c)). Reading: shown, G4.7, to "is it late?"; not shown, G4.7, to "is it in force?".
2. **A2. The answer word for late Terms** (G14.2(c)). Reading: G14.3's answer is not shown, G14.2, with "late" shown beside it.
3. **A3. A place orders every two updates** (G4.7(b)). Under a named place, the later of two updates is late, so a fork of Terms stands only where both become valid at one position.
4. **A4. Which knots show an update late** (G4.7(a)). Reading: L's own namings, or one needed assent's, each alone, not several added together.
5. **A5. Which lacking act might show L late** (G4.7(c)). Reading: any act-naming fingerprint that is not held, not a piece held, and not known to Money or the envelope's chain. Clients should hand the verifier the pieces they hold.
6. **A6. An assent whose cancellation is not shown** (G4.8(a)). Reading: its signer is not counted among those who signed the original. Lean: the update's answer should then be not shown.
7. **A8. An agreement whose power of the kind says no** (G1.2). Reading: it has not signed, even if every signer signs.
8. **A9, the part left. An unreadable act held** (a private act without its key; a signature scheme not implemented) that may be an assent. Reading: it counts for nothing, and in force is not made unchecked by it. Lean: unchecked.
9. **A10. Two versions by one author** (G6.2, G4.7). They fork that author's own line, which stops both until the line is resolved too. Draft 25's resolve resolves a signer's line, and a resolving update of Terms resolves Terms. Draft 25 does not say whether one act can resolve both, or must be two acts.
10. **A11. "Nothing they name is lacking"** (G14.3(a)). Reading: the acts the Terms name directly, other than `envelope`, `envelope_at` and `agreement`; one lacking makes the answer unchecked rather than invalid.
11. **A12. The first counter signature** (G4.10). Reading: the one that follows no other; between two that follow none of each other, the first by id.
12. **N1 (new). A report whose call names the payment itself.** G11.7 (draft 25): a confirmation "names the act that stands for it: the settlement the payment names, the act both sides can see, and never the payment itself". The bytes cannot tell a payment's id from another act's, so such a report is not rejected. Reading: it is no confirmation of that payment, and ties nothing; the payment stays one side only. Lean: as built; draft 25 could say whether such a report is listed, as a report by someone who is not a side is. *Changes an answer:* yes: in the first edition it was matched.
13. **N2 (new; raised in `encoding-2-report.md`). The doer where the receiver is an agreement named as a party.** G11.2: "Where the receiver those Terms name is not one of their own parties (another agreement, or none), no doer is shown under those Terms". Encoding 2 names an agreement as receiver by its root even where it is a party. Reading: such a receiver is "another agreement" for G11.2, so there is no doer, and with `control` empty the Terms do not hold the Control task. Lean: as built; draft 25 could say "an agreement, whether or not one of their parties". *Changes an answer:* yes, under the other reading.

### Those that do not change an answer (10)

B1 (a resolving update in force at once), B2, B3, B4, B5, B6 (the Terms asked, now from the settlement), B7, B8, B9 and B10, as section 2 says of each. One new one sits with them:

- **N3 (new). A call attached to a task other than K6.** G2.2 (draft 25) lists "a call in Terms that do not hold the task it is attached to" as left unread, and G11.2 reads only a call attached to the Control task. Reading: a call attached to another task is not read, and the verifier says so with what it left unread, whether or not the Terms hold that task. It changes no answer word.

## 4. What the players can ask

As in the first report, section 6, against draft 25's acts: through `agreementsNewAsk`, every question in `grammar/questions.rs`. Every answer comes with its rule, its qualifier, whether it is disputed, and whose word it rests on.

They cannot have yet: answers through real cMIPs (the stubs stand in, and anything else is unchecked), or a real place, clock, envelope chain or Money layer (the stand-ins' tables stand in).

Test identities only; no server address, onion address or key appears.
