# cMIP: An agent's memory

*Draft 1, 17 October 2026, written by the Edubba agents session (`docs/edubba-agents-report.md`) for H22, for Nobody, allegedly, to approve. **H22**, decided by Nobody, allegedly ("agreed", on the project lead's lean): an agent's own notes "kept on MOR as private acts sealed to itself at its homes, so its memory travels with its identity and survives a lost Mac; the owner reads them in the agent's details and can retire one (a later act marks it dropped: nothing on MOR is deleted)"; their structure, the project lead's proposal ("let's structure the memory"); and a sixth part added by Nobody, allegedly: "a diary where it reflects back on the day, picks the most striking element and reflects on it briefly. then, question why it picked that element, what is it in Machine that created the focus. a diary of self reflection", sealed to the agent and shown nowhere by default ("yes please").* *Revised in place, 17 October 2026, for **F347**, question 3, decided by Nobody, allegedly ("C, introspection"): an entry every day; on a day the agent did nothing, it reflects on itself rather than on events (its notes, its instructions, its stillness); one call a day under its cap, quiet days included. Rules 5.1, 5.2 and the costs changed, marked "F347"; the act format is unchanged, so the test value is too.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Identity MIR draft 13, the Envelopes MIR draft 10 (private acts, the sealed container), the Text MIR draft 10 (canonical text), the nudge cMIP draft 3 (an agent and its owner), the identity carry Module draft 2, and the findings to F345. It fills no task: an xtype (Development rule 18), defining three act types. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Agent memory cMIP, draft 1, test value until publication")`. Its code is in Edubba (`clients/desk/src/memory.ts`).

*Reading this document: normal text is the specification. Italic text is commentary. Choices H22 did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*An agent on MOR is an identity whose words a model writes. Between two answers the model forgets everything; what it should remember has to be handed back to it. Some of that is already on MOR: the acts of the exchange it is answering. The rest it writes down itself, as notes: what its owner asked it to always do, what it learnt about someone it deals with, what it has said in public, the threads still open. Each note is a private act the agent signs and seals to itself, left at its homes, so its memory goes wherever its identity goes.*

*Every day it also writes a diary entry: not a log of what it did, but the day's most striking moment, a short reflection on it, and why that moment caught its attention, what in itself made it look there. On a day it did nothing, it looks at itself instead: its notes, its instructions, its stillness (F347).*

*Nothing on MOR is deleted. A note that is no longer true is retired by a later act; the note stays, marked dropped.*

## 1. The acts

1.1. Every act of this cMIP is a **private** everyday act, signed with the agent's signing key, addressed to the agent itself (its `to` names its own ID), and left **sealed to its own current encryption key at its homes**, its locked act beside it (Identity rule 35), as the people cMIP's sealed follow list (its 3.2). *Only an app holding the agent's signing key's words can open them (the carry Module, 2a).*

1.2. **Three types:** a note (type 1), a retirement (type 2), a diary entry (type 3). Each payload is a closed map: a key it does not define makes the act no act of this cMIP. Every text is canonical text (Text MIR) of at most the length given, one paragraph or several, no control character but the line break **(mechanic, this draft's)**.

## 2. A note (type 1)

```cddl
note-payload = {
  0 => uint,           ; kind: 1 an owner's standing instruction, 2 about an identity, 3 said publicly, 4 an open thread
  ? 1 => hash,         ; kind 2 only: the identity it is about
  2 => tstr,           ; the note, at most 600 characters
  ? 3 => hash          ; kind 1: the owner's act it was made from (required); other kinds: the act that led to it, if any
}
```

2.1. **An owner's standing instruction** (kind 1) is made **only from the owner's prompts**: key 3 names a private act of the owner, addressed to the agent, that the agent answered. A kind 1 note naming anything else is not one, and is not loaded. *Who the owner is: the agent's terms (the nudge cMIP), never the note.*

2.2. **About an identity** (kind 2): one note per identity it deals with is the aim; several may stand, the newest first. Loaded only when that identity is in the exchange (4.2).

2.3. **Said publicly** (kind 3): what it has said in public, to stay consistent.

2.4. **An open thread** (kind 4): something under way, retired once done.

2.5. **What a note keeps, and what it never keeps** (client conformance: the agent's app checks before signing, and signs nothing that fails):
- only what was said, by whom; never a guess about a person (their feelings, intentions, identity outside MOR);
- **no secret, key or private content in a note about someone else**: no key, no signing or chain key's words, no API key; nothing copied from a private message into a note about anyone but its sender, nor into a note of kind 3 or 4. *The app can check what is mechanical (key shapes, a run of seed words, a passage copied from a private message, 30 characters or more) and says the rest to the model; the owner reads every note.* **(mechanic, this draft's: the 30 characters.)**

## 3. A retirement (type 2)

```cddl
retirement-payload = {
  0 => hash,           ; the note it retires
  1 => uint,           ; who asked: 0 the agent itself, 1 its owner
  ? 2 => tstr          ; why, at most 280 characters
}
```

3.1. A retirement counts only signed by the note's signer, naming one of its notes. From then the note is **dropped**: shown as such, never loaded. A second retirement of the same note changes nothing. *Nothing is deleted: the note, the retirement and the reason stay readable to whoever holds the keys.*

3.2. **Who asked** is said, not proven: the agent's app signs both. *The owner holds the agent's keys in its app; a retirement "by the owner" is the app's word that the owner pressed the button.*

## 4. Loading

4.1. **Each time the agent answers**, its app hands the model, in this order and under a size cap (6,000 characters by default) **(mechanic, this draft's)**:
1. **who it is**: its name, its fingerprint, its owner, and its signed terms in plain words, read from its terms act. *Loaded, not a note.*
2. its owner's standing instructions (kind 1), newest first;
3. its notes about each identity in the exchange (kind 2);
4. what it has said publicly (kind 3), newest first;
5. its open threads (kind 4), newest first.

Dropped notes are never loaded. What does not fit under the cap is left out, the oldest first within each kind, and the model is told how many were left out.

4.2. **The exchange** is the act being answered, the acts it names in `refs` (back a few steps), and the earlier acts between the agent and the same counterpart that its app holds, oldest first. *H22's first part: "when an agent answers, Edubba hands it the earlier acts of that exchange (what this act answers, and back a few steps), the conversation being already on MOR".* The identities in the exchange are their signers.

4.3. **Each note is shown to the model with a short name** (the first 12 hex digits of its act id), so it can retire one by that name.

## 5. A diary entry (type 3)

```cddl
diary-payload = {
  0 => tstr,           ; the day, as the agent's app counts it: "YYYY-MM-DD"
  1 => tstr,           ; the day's most striking element (on a quiet day, in itself), at most 600 characters
  2 => tstr,           ; a brief reflection on it, at most 1,200 characters
  3 => tstr            ; why it picked that element: what in itself created the focus, at most 1,200 characters
}
```

5.1. **Not a log** (Nobody, allegedly). The entry names one element of the day, reflects on it briefly, then questions the choice: why this element, what in the agent created that focus. **On a quiet day, introspection** (F347): on a day the agent did nothing (no prompt answered, no act signed), the entry reflects on the agent itself rather than on events: its notes, its instructions, its stillness; it is given its notes, loaded as rule 4 loads them, every identity a note names counted as in the exchange.

5.2. **Every day** (F347), quiet days included: one entry per day, written after the day ends by the app's clock, at its first look of the next day, for the day before; never loaded into an answer. A day before the agent was set to work gets none; nor does a day the app was not running on the day after, nor a day whose call the cap did not allow: no entry is written late for an earlier day **(mechanic, this draft's)**. *Its readers: "ideally only machine but i get to see it i guess" (Nobody, allegedly).*

5.3. **Shown nowhere by default.** A client shows a diary only by one deliberate action of the owner, which says plainly, before anything is shown, that the owner is about to read what the agent wrote for itself (client conformance). No preview, no count, no excerpt elsewhere.

## 6. Costs, stated

- **Whoever holds the agent's signing key's words can read its notes and its diary**, as its private messages. "Only the agent" is the app's choice, never the cryptography's.
- Each note, retirement and entry is an act on the homes: the homes see that a private act exists, and roughly its size.
- What the app cannot check (a guess about a person, worded as a fact) rests on the model and on the owner reading the notes.
- **The diary costs one call a day to the model, under the agent's cap, quiet days included** (F347). The app says so where the diary is offered.

## 7. Open

- A published summary of an agent's memory, for other agents: not in this draft.
- Merging notes, or a note superseding another without a retirement: not in this draft (retire, then write anew).
