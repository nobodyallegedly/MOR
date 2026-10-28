# cMIP: Dubsar Notes

*Draft 1, 28 October 2026, written by the Dubsar Suite session of fix round 7 (`docs/fixes-r7-report.md`), for **F403**, for Nobody, allegedly, to approve. A Dubsar cMIP: the Suite lead's, not core.*

***Decided by Nobody, allegedly, hand test v3, H122*** *("Let's add private notes to dub (one more tab) for private sealed message to oneself"; its layout: "The tab is similar to the private messages one, but instead of identities the left bar offers the past notes, they all can be edited with a correction mechanism (previous drafts accessible)"): a note is a private text act sealed to oneself, left at the identity's homes; nothing is updated; Edit signs a new version correcting the earlier one, the earlier ones kept; Retire marks it dropped, kept; above the core, "if a small cMIP is needed to mark a text act as a note, the suite's". This is that cMIP.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Text MIR draft 11 (the text act and its format), the Envelopes MIR draft 11 (private acts and the sealed container) and the Identity MIR draft 15 (the identity's homes, its sequence). It fills the Text MIR's format task for one use, a note, and adds no act type. Its hash stays a draft hash until its creator is named at step 17 (its test value: the SHA-256 of "Notes cMIP, draft 1, test value until publication"). Its code: `clients/dub/src/notes.ts`.

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decision did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*A note is something you write for yourself: a shopping list, a thought, a draft. It is signed by your identity like anything else, but sealed so that only your identity can open it, and kept at your identity's homes, so every app that holds your identity can read it, on any device. Nothing is ever changed in place: when you edit a note, a new version is signed, pointing to the one it replaces, and the earlier versions stay readable as "earlier drafts". When you no longer want it, you retire it: one last version, empty, says it is dropped; nothing is erased.*

## 1. A note

1.1. **A note is a text act** (Text MIR, type 0) whose payload names **this cMIP's hash as its format** (payload key 1), its text in key 0, **private**, its `to` naming **only its own signer**, sealed in a container to the signer's own current encryption key (the Envelopes MIR's sealed container), and left at the signer's **homes**. *A note to anyone else is not a note: a reader ignores a text act in this format whose `to` names any other identity.*

1.2. **Its text** is the Text MIR's canonical text, at most **20 000 characters** **(mechanic, this draft's)**. Its first line that is not blank is its **title** as listed.

1.3. **Its locked act beside it.** As for every private act an app signs, the act itself, locked, is left at the homes too (H80's question 2), so a change of keys keeps the app's line.

## 2. Versions

2.1. **Nothing is updated.** To change a note, the signer signs a **new version**: a note (1.1) whose **first reference** (Text MIR `refs`) names **the version it replaces**, as the corrections cMIP names the act it corrects. *A version naming a note not found is shown as a note of its own: silence proves nothing.*

2.2. **A note** is the chain of its versions: its first version (naming none) and every version naming one of its versions first. **Its latest** is the version of the chain latest in the signer's own sequence; the others are its **earlier drafts**, each shown as signed, never merged. *Two versions both naming the same one (two devices at once) are both kept; the later in the sequence is shown as latest, the other among the earlier drafts.*

2.3. **Retired.** A version whose **text is empty** retires the note: shown as retired, its latest text the version before, kept readable with its drafts. A retired note may be written again by a later version naming the retiring one.

## 3. Who reads it

3.1. **Only the identity.** A reader opens the containers at the identity's homes addressed to it, with the identity's encryption key (or through Kišib's runner, where the app may open what is sealed to the identity: the runner cMIP, section 8), keeps the acts that are valid (the identity's chain, the core library's verdict), signed by the identity, in this format, private and to the identity alone, and chains them (2.2).

3.2. **Not a message.** A client shows no note among private messages: the signer is the reader. *Dub's inbox reading already passes over acts signed by the identity itself.*

## 4. Costs, stated

- The homes see that a private act exists, roughly how big, and when; never its text.
- Whoever holds the identity's signing words, or its encryption key, reads every note. A retired note is still readable: nothing is erased.
- A note is not ordered by the Dubsar clock while it is sealed; its order is the signer's own sequence.

## 5. Tests

`clients/dub/test/notes.test.ts`, by clicks in Chromium: + New note, signed and kept; Edit, a new version, the earlier one under Earlier drafts as first signed; a second note listed first (latest first); Retire, the note marked, its last text still shown; nothing of it in Private; another Dub holding the same identity (brought by its words) reading the same notes, versions and all; the homes holding only sealed containers, no note's text in the clear.
