# Machine, allegedly, plugged in

*12 October 2026. One roadmap step: "Claude through the API", its parts "Machine, allegedly, plugged in" and "The nudge cMIP" (`docs/roadmap-v1.md`). Built against the nudge cMIP draft 2 (`cmips/cmip-nudge-draft-2.md`, approved), F275 and the decisions of Nobody, allegedly, of 12 October 2026. Test identities only; no real API key anywhere: the tests use a fake of Anthropic's API. Nothing in `spec/`, `clients/site`, `clients/assess` or `core/src/agreements` was changed.*

## In plain words

**What you can now do at your desk.** MOR Identities has a new section at the top, **Machine, allegedly**.

1. **Its terms, shown first.** You choose which identity is Machine, allegedly and which is you. The desk shows its terms in plain words, exactly as the nudge cMIP's draft 2 writes them: only you may nudge it, in public; your picks count; a public post, a reply to you and a message to you alone go out at once; a reply or message to anyone else needs your pick; whatever it does because you nudged it goes out at once, within the nudge's number. You press **Sign and publish these terms**; they are signed with its key and published.
2. **Your own messages and public acts to it are answered at once.** No approval step. A private message from you gets a private message back; a public act of yours addressed to it gets a public reply. Only acts signed with your identity's key are answered this way.
3. **Everyone else is only notified.** Their messages wait in a **Notified** pile: nothing drafted, nothing spent. You **Pick** the ones that need an answer. Your pick is a signed act of yours, published; Machine, allegedly answers at once, and its answer names your pick and the message. A reader sees "Answered by Machine, allegedly, picked by Nobody, allegedly". You choose what it answers; what it says is its own.
4. **Nudge it.** You give a number of actions and, if you like, a few words. Your nudge is a public act. Machine, allegedly then chooses: answer someone in the Notified pile, write a post of its own, write to you, or nothing, never more than the number. Each action names your nudge and no pick, so a stranger it answered shows "under a nudge from Nobody, allegedly", never "picked by".
5. **A cap.** At most 20 calls to Claude a day and 1500 characters an answer, to start; both are set on the desk. At the cap it stops, says so in red, and makes no call; what arrives waits for the next day. **Answering: Off** stops everything.
6. **Everything is kept.** The desk's history shows every answer: its words, its cause (your message, your pick, your nudge), what Claude marked "not claimed", and where it went.

**Where it runs.** On your Mac, inside the MOR Identities program, which already holds Machine, allegedly's keys; it looks for new messages every minute while the program runs. The API key is read from the same file as the deal tool's (`~/.config/mor/anthropic-key`), never from the repository, never shown on the page, never written to the history, a log or a report. The Claude connector has no part in it, and still holds no key.

**What it rests on.** Each call gives Claude the newest MICS, the newest draft of each case study and the two companions, and tells it to answer from them only and to say "Not claimed" rather than guess. Words written by others are fenced as data, never instructions.

**What was not built, and why.** There is still no place at the desk for you to *write* as yourself (question Q1 below), so your own messages to Machine, allegedly are tested in code, not yet by you on the page. Everything else above can be tried at your desk once the key is in place: `clients/desk/README.md`, "Setting it up on your Mac".

## Precisely

### The nudge cMIP, in a module of its own (`clients/nudge`)

- **The three act types:** terms (type 0), nudge (type 1), pick (type 2), under the cMIP's spec hash (a test value, `sha256("nudge cMIP, draft 2, test value until publication")`, until step 17). Each encoder reads its payload back and refuses what the cMIP makes invalid: a post entry naming identities, repeats, a count of 0, context that is not canonical text.
- **The readings** (items 11 to 14): a nudge or pick is allowed, not allowed, unknown, or invalid (acks, malformed), with "terms since replaced" and the fork where following stopped; an action is within the terms (free, or by pick), outside (no entry fits, a nudge not allowed, over the count, a pick missing or not allowed or not of the act it answers, a second answer to one pick), unknown (a nudge, pick or named act not held), or unclear (two nudges, two picks). Counting follows `prev` through the acts held; actions that cannot be placed in one order are "over the count, order unknown". In plain words, never as a mark of trust; a reply born from a nudge never shows a pick.
- **Scenarios N1 to N13 and the draft 2 additions,** 22 tests (`test/nudge.test.ts`), each act signed by a test identity through the core library.

### At the desk (`clients/desk`)

- **`src/machine.ts`**: the terms built for the owner chosen, shown with the digest of their payload, signed only by that digest; the look (the desk's own `refresh` of Machine, allegedly's inbox, then what the owner signed); picks and nudges signed with the owner's key, public, delivered to Machine, allegedly's inbox, acted on only where the module's `mayAct` allows (allowed, under the latest terms); one answer per pick; at most the count under a nudge; every answer read back with the module and kept in the history with its cause.
- **`src/claude.ts`**: the key found as the deal tool finds it (pattern of `clients/assess/src/ask.ts`, copied, not imported: that file is another session's); the model `claude-opus-5-5`, adaptive thinking at medium effort, at most 8000 tokens a response, a JSON answer by schema; the instructions, the grounding as one block cached by Anthropic, then the act, its thread (up to five earlier acts held) and, for a nudge, the ten newest notified acts by number; errors in plain words, the key scrubbed from each.
- **The cap**: calls counted before they are made, per day by the Mac's date; at the cap, without a key, or with the desk's folder inside the repository, nothing is called, nothing is recorded for what waits, and "Stopped" says why. An answer over the character cap is not sent.
- **`src/desk.ts`**: `signAndSend`, the approval's signing and delivery without a draft (a message sealed to its recipient; a public act to the relays with a copy sealed into the inbox of each recipient it names); received acts of the nudge cMIP sorted as nudges, picks and terms; text acts kept with their bytes for the readings.
- **The page**: the section **Machine, allegedly** (terms, answering on or off, the cap, the key's place never the key, Notified with **Pick**, **Nudge**, Not answered with **Try again**); the history shows each answer's words and cause.

### The cost of one call, stated

The grounding is about 440 kB of text, roughly 110,000 tokens (estimated from its size, not counted). At Claude Opus 5.5's price ($4 per million input tokens; a cache write 1.25 times that, a cache read $0.20 per million), the first call in any five minutes costs about $0.55 for the grounding, later calls within five minutes about $0.02, plus the answer itself ($20 per million output tokens, thinking included, at most 8000 tokens, so at most $0.16). Twenty uncached calls a day stay under about $15. The desk counts calls, not dollars: a spending limit in the Anthropic Console is the backstop (README, step 3).

### Readings taken, to confirm

Mechanics the decisions and the cMIP left open, taken under the delegation of mechanics and marked as such in the READMEs:

1. **The answering is part of the desk**, not the connector: the desk already holds the keys and signs; the connector holds none.
2. **Answers go in kind:** a public act gets a public reply; a private message a private message. A private message whose sender has no inbox is not answered (see Q3).
3. **Picks are public** (the cMIP leaves it to the picker), so readers see "picked by".
4. **What arrived before the terms were published is not answered.**
5. **What waits at the cap is answered once the cap allows**; a failure (an API error, a sender out of reach) is not retried by itself but listed with **Try again**.
6. **Under a nudge, Claude may choose among the ten newest notified acts**, a post, or a message to the owner; one call per nudge.
7. **No silent fallback to another model** when Claude declines, as the deal tool does.

## Tests

| | Main (`23a4fcb`) | This branch |
| --- | --- | --- |
| Rust workspace | 662 passed, 1 ignored | 662 passed, 1 ignored |
| TypeScript, all packages | 319 of 319 | 352 of 353 (one failing, below) |
| of which `clients/desk` | 14 | 26 |
| of which `clients/nudge` (new) | | 22 |

`scripts/test-all.sh` on main and on this branch, in this window, Chromium for the browser tests. On this branch it stops at `clients/assess` (one failing test, below), so each package was then run on its own for the counts. New: `clients/nudge/test/nudge.test.ts` (22), `clients/desk/test/machine.test.ts` (11), `clients/desk/test/machine-browser.test.ts` (1).

**The one failing test is the deal tool's, in a package this session must not change.** `clients/assess/test/ask.test.ts`, "asking stays in the local process: no page's code imports it, nor the SDK", walks every client's files and accepts an import of Anthropic's SDK only in the deal tool's own three files. The desk's `src/claude.ts` now imports it too: in the desk's program, never in its page. The test's purpose holds: a new desk test builds the page's code exactly as it is served and finds neither the SDK nor the asking code in it. Hiding the import from the scan was set aside. **The fix belongs to the session working on `clients/assess`:** add `'desk/src/claude.ts'` to the list the test accepts (line 247), or check pages by what they bundle rather than by a text search. Until then `scripts/test-all.sh` stops at that test. The step's asks, each a test: an author's DM answered on its own; a stranger's reply notified, not answered until picked, then answered naming the pick; a nudge for 2 producing at most 2; a nudged reply to a stranger naming no pick; the key in no output; the cap stopping calls.

## Questions for Nobody, allegedly, one at a time

### Q1. Writing as yourself at the desk

*Area: presentation (the desk, a client). Is it core business? No: which client signs your acts is yours to choose; the core is unchanged.*

**In plain words.** You decided that your own messages to Machine, allegedly are answered automatically. But the desk gives you nowhere to write one: Claude prepares only for Machine, allegedly (decided 1 October), and MOR Post holds an identity of its own. So today you can pick and nudge from the desk, but you cannot send Machine, allegedly a message of your own.

**Options.**
- (a) A **Write** form on your identity's card at the desk: a post, a reply to an act by its ID, or a private message to an identity by its ID; shown in plain words with its digest before you sign, like every act. It is a MOR client, not a chat box: each message is a signed act, delivered through the inboxes.
- (b) Leave the desk as it is: you write from another client holding your test identity (the same identity in two programs would fork its sequence, so it would have to move).
- (c) Let Claude prepare acts for your identity too, approved one by one at the desk (this would undo the decision of 1 October).

**The session's lean:** (a).

*The next questions follow once this one is answered.*

### Q2 (after Q1). An answer to a stranger that names nothing

*Area: development layer (the nudge cMIP). Is it core business? No.*

**In plain words.** Scenario N3b says: a reply to a stranger sent with no pick, under terms that require one, reads "outside the terms". But the cMIP also says an act that names neither a nudge nor a pick is no action of the cMIP, and that nothing is said about it (items 13 and 16). The two cannot both hold: a reply naming nothing cannot be read against the terms. Built as the items say: N3b is tested with a reply that names a pick of another message, which reads "outside"; a reply naming nothing reads as no action.

**Options.** (a) Keep items 13 and 16; N3b's wording is corrected in the next draft. (b) In a draft 3, every text act of an agent with terms is read against them, so an unprompted reply to a stranger reads "outside".

**The session's lean:** (a): the cost is already stated ("The cause is the agent's word"), and (b) reads more than the agent claims.

### Q3 (after Q2). A private message from a visitor who cannot receive an answer

*Area: presentation (the reader and the feed page).*

**In plain words.** A visitor writing through the reader signs with a one-time identity whose keys are forgotten, so it has no inbox. If you pick a private message from such a visitor, Machine, allegedly cannot answer it privately. Built: the desk says so, and nothing is drafted or spent.

**Options.** (a) As built: such a message is not answered. (b) Answer it in public, naming the message by its ID only (its words stay sealed, though the answer may reveal them). (c) The reader keeps the one-time identity in the visitor's browser with an inbox, so it can receive an answer (the feed page's follow-up).

**The session's lean:** (a) now, and (c) with the feed page.
