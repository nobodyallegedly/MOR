# A companion for Agreements: outline

17 November 2026. Written by Claude, as the scribe (session S2). An outline for Nobody, allegedly, to shape before anyone writes prose. A proposal: it decides nothing, writes no rule and settles no reading of a rule. It proposes an order of headings and says what each would draw on.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "can I with a single click reward all the people that contributed to the service or good via MOR" And the budget rule: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

**Why a companion, in his words** (ledger entry "A companion for Agreements", 17 November): "Agreements has become quite abstract. It will need a good companion that explains why it is structured as such and how we got that that shape." Then: "The how we got there needs to build around the research we ran on agreeing. « What is the minimum two people have to write »" Then: "It's also a good place to state that what the review found was MOR other layers and the sockets."

**The reader the companion is for.** A newcomer who has never seen MOR, and who knows what an agreement between two people is.

**The spine.** His question: "What is the minimum two people have to write". Each heading below is a step in answering it, or says why it stands apart.

**How to read the marks.**

- **CAN BE WRITTEN NOW**: the section rests on the research, on his quoted words, or on what already happened.
- **WAITS ON THE REWRITE**: the section describes something he has not yet decided, or rules of draft 25 that may not stand.
- Words in quotation marks after "He:" are his, as the ledger has them, typos included. Everything else is the scribe's, and where a line is the MOR lead's reading it says so.

**Words a reader of this outline may not know** (the scribe's plain glosses, not definitions):

- **MOR**: Media Over Relays. `README.md` opens: "Research into a protocol for media, money and agreements between people." It has a small core in six layers, each with its own text of rules: Identity, Text, Envelopes, Money, Agreements and Development.
- **Agreements**: one of those six layers, and the text that holds its rules. The companion is about that text.
- **Who is who**: Nobody, allegedly, is the author of MOR, a person. The MOR lead, the scribe and Fable are AI sessions with different jobs (the lead runs the work and keeps the ledger; the scribe writes texts; Fable reviews). A "window" is one AI session; a "stranger" is a window that was told nothing of MOR.
- **grammar**: here, the few fixed ways of writing and reading an agreement, as against rules about what people must agree.
- **draft 25**: the latest text of Agreements, written from scratch; not merged.
- **cMIP**: a rule or solution written outside the six layers, which people choose for their own agreement; anyone may write one. (The sources read do not spell the acronym out.)
- **socket**: a place in an agreement where a cMIP plugs in and answers one question. He: "task has always been the socket in my mind."
- **the ledger**: `docs/decisions.md`, the record of his exchanges with the MOR lead. Each entry ends with an "Arrived at (to check)" line, which is the MOR lead's reading.
- **the research on agreeing**: two texts by windows that knew nothing of MOR, `docs/strangers-2026-11/agreement-tasks.md` and `agreement-grammar.md` (branch `claude/lead-records-2`).

**Read for this outline, and nothing else.** `CLAUDE.md`; the ledger from "Current wish" to the end; the research on agreeing (both files and the folder's README); draft 25 (`docs/agreements-from-scratch/draft-25.md`, branch `claude/agreements-clean-1-hahuwn`, pull request 183), sections 1, 4's introduction, 5 and 8.1 only; `history.md` on the same branch (its head, the openings of Parts A and R and the part headings; the parts between were not read line by line); Fable's review `docs/reviews/fable-draft-25.md` (branch `claude/fable-draft-25`), "In plain words" and section 7 only. To find MOR's opening definition: the head of `spec/02-MOR-MICS-v37.md` and of `README.md`.

**Not read.** The research on prior art for the grammar (`MOR-research-grammar-prior-art.md`, kept outside the repository). `reasons-25.md` and `companion-3.md`, which stand beside draft 25. The rest of draft 25. The simulation's findings.

---

## The opening

One thing the newcomer already knows, then the question the companion answers. Three candidates, one line each, the scribe's wording. None is chosen.

- **A. The paper.** You have written a deal down with someone before; what was the least the two of you had to put on paper for it to hold?
- **B. The third person.** You already know why people write an agreement down: so that neither can deny it later; so what is the least a stranger would need to see?
- **C. The click.** You paid for something five people made; what would those five have had to write down for one payment to reach them all?

Source for A and B: `agreement-tasks.md`, "Starting points". Source for C: the wish ("can I with a single click reward all the people that contributed to the service or good via MOR", ledger entry "What must hold").

---

## The headings, in the order proposed

The order runs in three movements: the question and what the research answered (1 to 5); what that left for Agreements to write (6 to 10); then how the answer was checked (11), how it was reached (12), what kind of thing it is (13) and what stays open (14).

### 1. The question

- **Says:** where the question comes from and why it was asked without MOR's words. It was put to windows that knew nothing of MOR, so the answer would owe nothing to what was already built.
- **Step in the spine:** it states the question.
- **Draws on:** ledger, "A companion for Agreements" and "Current wish"; `docs/strangers-2026-11/README.md`.
- **Status:** CAN BE WRITTEN NOW.

### 2. Who the writing is for: a third person

- **Says:** the research's first answer. A written agreement is written for an outsider who may never turn up; so the least two people need to write is the least a third person needs to see.
- **Step in the spine:** the first answer, before any list.
- **Draws on:** `agreement-tasks.md`, "Starting points".
- **Status:** CAN BE WRITTEN NOW.

### 3. What can go wrong: ten situations, forty-nine questions

- **Says:** how the research found what must be written: for each situation (selling, promising, owning together, and so on) it asked which new lie or failure becomes possible. The result is a checklist of 49 questions (the research calls them "tasks"). For each it says whether the two parties can answer it between themselves, or need something outside them: a register, a witness, someone holding the value, a judge. That split is what heading 6 turns on.
- **Step in the spine:** the minimum, counted the long way.
- **Draws on:** `agreement-tasks.md`, "Method", "The full list", "How the ten situations fed the list", "What collapsed".
- **Status:** CAN BE WRITTEN NOW.

### 4. The same few moves answer most of them

- **Says:** the 49 are questions; a handful of operations keep answering them (State, Sign, Deliver, Order, Control, and a sixth the research had used without naming, Apply: working out a stated rule on known inputs, which anyone can redo). 33 of 49 are fully expressed by them. What is left over is of three kinds: truth (someone must say what happened in the world), minds (what a person understood or wanted), and hands (something must actually move the value). The research calls the operations and who does them a "grammar"; that is where the word comes from.
- **Step in the spine:** the minimum shrinks from a checklist to a toolkit.
- **Draws on:** `agreement-grammar.md`, "The hypothesis", "The test", "Result", "Findings", "Design consequences".
- **Status:** CAN BE WRITTEN NOW.

### [A marked place: prior art for the grammar]

- **Not read.** The MOR lead names a research text on prior art for the grammar (`MOR-research-grammar-prior-art.md`), kept outside the repository. The scribe did not read it and does not guess what it says.
- **Why here:** it is named as being about the grammar, so it is placed beside heading 4. The position is the scribe's guess from its title alone.
- **Status:** cannot be marked until it is read.

### 5. Take away the shared register, take away the held value

- **Says:** the research then made it harder, twice. First: suppose there is no one register that puts everybody's entries in a single order. Second: suppose the record cannot itself hold money or goods, only statements about them. What stays clean is what two people do between themselves: signed words, receipts and calculation. The section ends on a line from that research text (written by a window that knew nothing of MOR, so "the stranger's line") (quoted whole under "Where three sentences sit", item 1).
- **Step in the spine:** the minimum under the hardest conditions; what a record can be when it controls nothing.
- **Draws on:** `agreement-grammar.md`, "Second test", "Third test", "Both suppositions together"; ledger, "An evidence and accounting layer".
- **Status:** the research part CAN BE WRITTEN NOW. How the stranger's line is set beside MOR's opening definition WAITS (question 1 at the end).

### 6. What the research had found without knowing it: MOR's other layers, and the sockets

- **Says:** the things the research said two people cannot do alone are things draft 25 does not define either: it names them and leaves them to other layers, or to a socket where people plug in their own choice. So the research, done blind, drew the edge of Agreements.
- **Step in the spine:** it subtracts. What others carry is not part of the minimum Agreements has to write.
- **Draws on:** ledger, "A companion for Agreements" (third exchange); `agreement-tasks.md`, the four outside roles (register, witness of the world, hand, judge); draft 25, sections 1, 5.3 and 8.1; Fable's review, section 7. See "Where 'what the review found' sits" below for what the sources allow and do not allow.
- **Status:** the statement itself CAN BE WRITTEN NOW, in his words. Which research finding lands in which layer WAITS ON THE REWRITE: three of the lower layers' parts that draft 25 leans on do not exist yet, and their rewrite is not decided.

### 7. What is left for Agreements: two acts and a way to read them

- **Says:** what remains once the rest is subtracted. Draft 25 has two kinds of signed act: Terms (what is agreed) and Statement (what someone says under it), and a way of reading them that tells who is bound by what. Agreements does not say what anyone must agree; it is a grammar in which people write how they agree. He, on reading draft 1: "It’s not ruling… it's setting up grammar for people to decide how to agree on rules." The research's method (which new lie becomes possible?) became the test of every rule in the draft.
- **Step in the spine:** the answer for Agreements itself.
- **Draws on:** ledger, "Reading draft 1" and "What the grammar is for"; draft 25, section 1 and the introduction of section 4. The link between the research's method and the draft's test of each rule is the scribe's observation.
- **Status:** the shape CAN BE WRITTEN NOW, from his words. Any description of the rules themselves WAITS ON THE REWRITE.

### 8. The one idea the rest is built with: an agreement can be a party

- **Says:** an agreement can itself be one of the parties to another agreement. Works, services, groups and their deals are then things people build, and none needs a rule of its own. He: "The key concept is « agreement as a party » then it’s what you build with it that changes".
- **Step in the spine:** why the minimum can stay small while what people build grows.
- **Draws on:** ledger, "A work as a party", "The payment chain", "The key concept", "Constitution, executive and judicial"; draft 25, section 1.
- **Status:** the idea CAN BE WRITTEN NOW, from his words. How the draft writes it WAITS ON THE REWRITE.

### 9. Where people's own choices plug in: the sockets

- **Says:** if an agreement can be a party (heading 8), something must still say how such a party signs, who may change the agreement, who counts. The grammar answers none of that: it leaves a place for each, where a cMIP answers one question. (In his sentence "task" means such a place, not one of the research's 49.) He: "Yes, task has always been the socket in my mind. One cMIP per socket, multiple modules where needed, possibly multiple sockets in one cMIP." This is the part a newcomer finds most abstract, and the reason the companion exists.
- **Step in the spine:** what the two people do not have to write, because they point at a rule someone else wrote.
- **Draws on:** ledger, "A task is a socket", "Seven sockets, and data", "The update condition", "The default update condition"; draft 25, section 5 (its table and section 5.3).
- **Status:** the idea CAN BE WRITTEN NOW. The list of sockets and what each takes and gives WAITS ON THE REWRITE: it is draft 25's, and may not stand.

### 10. What the minimum leaves out on purpose: not to be used bare

- **Says:** the grammar alone gives no way out of an agreement, no protection for either side, no fairness. Those are built on top, by the cMIPs people choose. The section holds his exchange on the right of exit, whole (under "Where three sentences sit", item 2), and his words on what the core is for, where ID, text and development are three of the six layers: "ID and text are universal, development is definition, the rest is to build on top of."
- **Step in the spine:** the minimum is a base, not a finished agreement; a reader who expects more must be told so plainly.
- **Draws on:** ledger, "No default way out", "What the core is for", "The wrong cMIP", "Grants" ("Yes, we’re not Law."), and the principle "Building blocks over solutions."; draft 25, sections 5.1 and 5.2; Fable's review, "In plain words", item 2.
- **Status:** his words CAN BE WRITTEN NOW. WAITS ON THE REWRITE for anything about how an exit is built: "No default way out" is of this evening, is in no draft, and its entry leaves open the wording of an older principle of MOR, which the ledger calls a cornerstone and quotes as "anyone can leave anything and take what is theirs".

### 11. How it was tested: by building on top

- **Says:** how anyone knows the minimum is enough. He, on draft 1: "Some of it looks good in theory but only building cMIPs above it will confirm it to my eyes." The tests in order: the shower model as he would use it himself (its origin is his text "Thank You For the Shower", named and not retold), the one click (one payment reaching everyone who contributed), strangers building software from the text alone, the exact bytes of each act written down, a program that checks agreements against the text, and a simulation with many test identities.
- **Step in the spine:** the check on the answer.
- **Draws on:** ledger, "What to build first", "What must hold", "Must every leg report?", "The encoding first", "After box 2", "Clean up first"; `history.md`, the head and Parts D, F, K and M by their headings.
- **Status:** up to draft 25 CAN BE WRITTEN NOW. The simulation and what it found WAITS: it is not finished and its findings were not read.

### 12. What left the grammar on the way

- **Says:** the drafts moved mostly by taking things out. Each time a rule solved a case, the question became whether a cMIP could build it instead. He: "What the previous version of agreement focused on solving issues… this one supports and specifies the language for creating solutions". The section would list what left and where it went, draft by draft, briefly.
- **Step in the spine:** the minimum was reached by subtraction, and this is the record of it.
- **Draws on:** `history.md` (its head lists what each of drafts 9 to 25 changed); ledger, "Building blocks in draft 9", "What the grammar is for", "Where three rules live", "The place is a pointer", "Only rules in the hashed text".
- **Status:** drafts 1 to 25 CAN BE WRITTEN NOW. What the 17 November exchanges take out (three rules moving to other layers; the rule about where an agreement's latest version is looked up cut to one sentence; the text that is fingerprinted holding rules only) WAITS ON THE REWRITE: agreed in the ledger, written in no text.
- **Open:** whether this draft-by-draft record belongs in a companion for a newcomer at all (question 4).

### 13. What kind of thing MOR is, and Agreements within it

- **Says:** a short section on what the reader has just read: not quite a rulebook, not quite a protocol in the usual sense. He said it of MOR as a whole. It holds his sentence "It's between a protocol and a language almost in some parts" (under "Where three sentences sit", item 3).
- **Stands apart from the spine:** it does not answer the question; it tells the reader how to hold the answer. It could instead open the companion (question 5).
- **Draws on:** ledger, "Between a protocol and a language", "May and can't".
- **Status:** CAN BE WRITTEN NOW only as his words quoted. More than that is his to write.

### 14. What is still open

- **Says:** the questions the research itself left open (the first: how much a proven liar must stand to lose, and where it is kept), what Agreements still needs from layers that are not written, and what he has not yet decided.
- **Stands apart from the spine:** it marks where the answer is not finished.
- **Draws on:** `agreement-grammar.md` and `agreement-tasks.md`, "Still open"; draft 25, section 8.1; Fable's review, section 7; the ledger's open lines (among them "Three lines cut back" and the word "assent", which he does not like).
- **Status:** WAITS ON THE REWRITE, except the research's own open questions, which CAN BE WRITTEN NOW.

---

## Where three sentences sit

### 1. The stranger's line, and MOR's opening definition

**The line**, whole (`docs/strangers-2026-11/agreement-grammar.md`, "Both suppositions together"; quoted in the ledger entry "An evidence and accounting layer"):

> "The record becomes an evidence and accounting layer: it proves who owes what and who lied, and it moves nothing. Its only force is what a proven liar stands to lose."

**He** (same entry): "An evidence and accounting layer…. That bit has to complement the opening definition of MOR"

**Where MOR's opening definition lives today.** In `spec/02-MOR-MICS-v37.md`, under "Purpose", the first paragraph, "The test", whole:

> "**The test.** MOR is the law where bytes can prove it, and keeps the record where they cannot: what a signature, a hash or an order on a chain proves, every verifier decides alike; what bytes cannot prove (a fair price, an intention, whether a promise was kept in the world) MOR keeps signed and placed, and leaves to the people, their courts and their reputation, so its promise is not "nobody can take unfairly" but "nobody can take unseen", and the record is what lets the core stay small and right. The chain that places an act, a collective's own chain among them, is where bytes get their order: the one move behind a collective's line, behind what a line placed staying placed, and behind transfers counted where the line placed them, turning a fact nobody can time into a fact one chain has ordered."

That this paragraph is "the opening definition" is the MOR lead's reading in the "Arrived at" line, not his words. Another opening a newcomer meets is the first line of `README.md`: "**Media Over Relays.** Research into a protocol for media, money and agreements between people."

**In the outline:** the line closes heading 5. Two readings of "complement", both kept:

- **In the companion.** The companion sets the stranger's line beside MOR's definition, at the end of heading 5 or in the opening, and shows the two together.
- **Beside the definition itself.** The line, or "that bit" of it, goes where MOR is defined (the MICS's "Purpose"), when that text is next written. The companion then only quotes the research and points there. This is the MOR lead's reading: "to be placed when the MICS is rewritten."

The outline does not say how the two sentences fit together. "That bit" may also mean the phrase "An evidence and accounting layer" alone and not the two sentences.

### 2. "Agreements is not to be used bare. It's to build on top of."

**The exchange it closes**, his words in order (ledger entry "No default way out", 17 November; it replaces the afternoon's "A way out by default"):

- "Leaving an agreement should leave a clear identifiable evidence, yes"
- "Leaving an agreement forces the agreement to be redrafted anyway. It's a new agreement, updated from the previous one and in its chain, but it is its own new act"
- "That's the trap… and an agreement is a trap. My question is, under what conditions did she join the agreement? None for exits will be your answer. So, leaving the agreement needs the agreement of the other parties. That's what an agreement is for truly. So, no, there is no standard way out of an agreement that is the purpose of an agreement."
- "I know… I too can change my mind. An agreement is there so that you cannot leave it. That's why it exists"
- "No, what I mean is written agreements have always been about not being able to escape the agreement. That is why humans have started writing in the first place… so right of exit? No, not from an agreement."
- "Yes, it.s still true under the right cMIPs. Agreements is not to be used bare. It's to build on top of."

**Why no right of exit, in his words:** "An agreement is there so that you cannot leave it. That's why it exists"; "written agreements have always been about not being able to escape the agreement."

**What he said that afternoon, since replaced** (ledger entry "A way out by default"): "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out"

**In the outline:** heading 10, which takes its title from the sentence. The sentence also answers the newcomer's likeliest objection to headings 7 to 9 (so little is ruled), so it could be said earlier, at the end of heading 7. The research's own list has the same shape for leaving (task 49, Leave: possible alone "if a rule or buyer exists"); that link is the scribe's observation.

### 3. "It's between a protocol and a language almost in some parts"

**The exchange**, his words (ledger entry "Between a protocol and a language", 17 November): "I tried to keep most of my ideologies away, but many had slipped in. Also, when we started I didn't fully grasp initially what Mor could be and where its power was… takes time to wrap the head around it. It's between a protocol and a language almost in some parts" Then: "It comes from my limitations and wide ambitions. « yes, technically it is a media protocol, but… »"

**In the outline:** heading 13. In the exchange "It" is MOR, not Agreements alone; placing it in a companion for Agreements is the MOR lead's reading ("for the companion and the paper") and this outline's.

---

## Where "what the review found" sits

**He** (ledger entry "A companion for Agreements"): "It's also a good place to state that what the review found was MOR other layers and the sockets."

**In the outline:** heading 6, the hinge between the research (1 to 5) and Agreements (7 to 10).

**What the outline can say of it from the sources read:**

- The research names five operations (State, Sign, Deliver, Order, Control). Draft 25, section 1, says Agreements defines none of them: "It does not define how words are fixed, how signatures work, how acts travel, how a shared order is kept, or how value is held; it names those operations (State, Sign, Deliver, Order, Control) where it needs them."
- The research sorts what two people cannot do alone into four outside roles: a register, a witness of the world, a hand, a judge. In draft 25, section 5.3, a witness and a judge are things a cMIP in a socket may lean on; the hand appears at the socket for passing value on; the register appears as the place Terms may name.
- Draft 25, section 8.1, is a list of what Agreements needs from the other layers and does not have. Fable's review, section 7, of that list: "the best brief the lower layers could be given".
- Fable's review, "In plain words": three of the fourteen rules "rest on layers that do not exist yet".

**What the outline cannot say:**

- **Which review he means.** The MOR lead's "Arrived at" line reads it as the research on agreeing. It could also be Fable's review of draft 25, which found a small heart plus rules resting on other layers. Heading 6 is written for the first reading and would move after heading 12 under the second (question 2).
- **Which finding is which layer.** The sources read name layers by what they do (the Sign layer, the Deliver layer, the layer that orders acts, the layer that holds value). None of them lists the research's findings against MOR's six layers by name, and the scribe does not guess the list.

---

## What the outline could not place

- **The prior-art research.** Not read; a marked place stands after heading 4.
- **`companion-3.md` and `reasons-25.md`**, which stand beside draft 25 ("how the research is used"; each rule in plain words). Not on the reading list. Whether this companion replaces them, absorbs them or sits beside them is not said in any source read. He, on draft 1: "Isn’t “how the 49 tasks land” more of a companion section, it says: this is how the research was used."
- **"May and can't"** ("MOR is built on the concept of « may »…"). He called it an observation and said "Don*t treat it as a bible." Listed as a source under heading 13; it may belong nowhere.
- **Surveillance and data** ("People have to AGREE to be under surveillance, in an agreement they signed."). A strong reason behind one socket; it has no heading of its own and would be one example under heading 9.
- **The contest** ("Making greed legible does not work without contest, it makes it core."). A contest is a buyer's signed complaint that what was paid for was not delivered. It is the one thing he kept in the grammar against a lean to move it out. It fits heading 12 as the exception, or heading 7.
- **The voucher exchange, the windows, the waves, the Dubsar agents coordinating on MOR.** His first project and how the work is run; not about why Agreements has its shape. Left out.
- **The simulation.** Not finished, findings not read.
- **A worked example.** A newcomer would want one agreement followed from start to end. The research gives ten situations and the ledger many cases, but choosing one is a choice of emphasis the scribe leaves to him.

---

## Where a heading rests on the MOR lead's "Arrived at" wording more than on his words

Each is quoted both ways. Where they differ, his words win.

| Heading | His words | The MOR lead's "Arrived at" line | What the line adds |
|---|---|---|---|
| The spine; all headings | "The how we got there needs to build around the research we ran on agreeing. « What is the minimum two people have to write »" | "the companion's story of how Agreements got its shape is built around the research on how people agree, with his question as its spine: what is the minimum two people have to write." | "spine". He said it of "the how we got there"; he did not say it of "why it is structured as such". This outline, as asked, runs it through everything. |
| 5, and item 1 | "An evidence and accounting layer…. That bit has to complement the opening definition of MOR" | "the stranger's sentence complements the opening definition of MOR (today the MICS's "The test": "MOR is the law where bytes can prove it, and keeps the record where they cannot"), to be placed when the MICS is rewritten." | Which text is the opening definition; that "that bit" is the whole sentence; that it is placed in the MICS, and when. |
| 6 | "It's also a good place to state that what the review found was MOR other layers and the sockets." | "the companion states that what the review of how people agree found turned out to be MOR's other layers and the sockets." | "of how people agree": which review. "turned out to be". |
| 7 | "It’s not ruling… it's setting up grammar for people to decide how to agree on rules." | "Agreements is a grammar, not rules" | Shorter and harder than his sentence. |
| 8 | "I’m really happy with the work done on this round. The key concept is « agreement as a party » then it’s what you build with it that changes" | ""agreement as a party" is the grammar's central idea; collectives, works, services and their deals are what people build with it." | "the grammar's central idea": he said it of that round's work. The list of what is built. |
| 9 | "Yes, task has always been the socket in my mind. One cMIP per socket, multiple modules where needed, possibly multiple sockets in one cMIP." | "a task is a socket: a place in an act where a cMIP plugs in and answers one question." | The definition "a place in an act where a cMIP plugs in and answers one question". |
| 10, and item 2 | "Yes, it.s still true under the right cMIPs. Agreements is not to be used bare. It's to build on top of." | "the right of exit still holds, through the cMIPs an agreement chooses (an exit is something Terms can carry, in the update condition's socket or another); the grammar bare has none. Agreements is not meant to be used bare; it is built on." | What "it" is: the entry does not record the question he answered "Yes" to. Where an exit would sit. |
| 10 | "Those sentences are why agreement was not right… not because the ideas were wrong, but because it forces the protocol into a corner instead of doing what we meant. ID and text are universal, development is definition, the rest is to build on top of." | "the receiver's duty after an update is not a core rule; it is for the cMIPs Terms choose. Rules that settle how people should behave in a deal corner the protocol, however right the idea. Identity and Text are universal; Development is definition; the rest is built on top of." | Which rules corner the protocol. Whether "the rest" counts Agreements among what is built on, or is what is built on Agreements, is said by neither. |
| 11 | "The shower is an idea, the exact text does not need to hold. What needs to hold is: can I with a single click reward all the people that contributed to the service or good via MOR" | "the test of the grammar is one click reaching every contributor." | "the test of the grammar". |
| 12 | "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested." | "a hashed text holds its rules and nothing else. The history, the open lists and the reasons go into companion documents beside it." And, under "A companion for Agreements": "With "Only rules in the hashed text", the reasons and the history go there." | That the history goes into this companion. He said "companion documents", more than one, "for the few who might be interested"; this companion is for a newcomer. |
| 13, and item 3 | "It's between a protocol and a language almost in some parts" | "not a decision: how he describes MOR now, for the companion and the paper." | "for the companion and the paper": he named neither. |

---

## Questions for Nobody, allegedly

Those that change the companion's shape come first. One at a time; the first is the one the scribe would ask first.

1. **The evidence and accounting layer.** You said that bit "has to complement the opening definition of MOR". Should the companion itself set the two side by side, or does the line belong where MOR is defined, with the companion only pointing to it? And is the definition you meant the MICS's "The test"?
2. **"what the review found".** Is "the review" the research on agreeing (the two texts by the windows that knew nothing of MOR), or Fable's review of draft 25? Heading 6 moves depending on the answer.
3. **How far the question runs.** You gave the question for "the how we got there". Should it also carry "why it is structured as such", as this outline does, or are those two parts with the question in one of them?
4. **The draft-by-draft record** (heading 12). Does it belong in this companion, for a newcomer, or in a second one "for the few who might be interested"?
5. **"between a protocol and a language".** You said it of MOR. Does it belong in the companion for Agreements, and if so, at the opening or near the end?
6. **Against which text.** Headings 6 to 10 and 12 partly wait. Is the companion to be written against draft 25 as it stands, with the waiting parts left marked, or held until the rewrite of the layers is decided?
7. **The prior-art research.** May the scribe read it, and does it belong in this companion?
8. **One example.** Should one agreement be followed through the whole companion, and which?
9. **`companion-3.md` and `reasons-25.md`.** Does this companion replace them, take them in, or sit beside them?
10. **The word "assent".** You do not like it. A newcomer's companion would use the word chosen; none is chosen yet.

## The cold reading before the push

The outline was handed to a subagent that had seen neither the ledger nor the scribe's prompt, with the question: "from these headings alone, what would this companion tell you, and where did you lose the thread?" Its summary matched the order proposed. It stumbled on unexplained words (MOR, Agreements, layers, who is a person and who a program, the stranger, the two acts, the cornerstone, the tests in heading 11, the jump from 8 to 9, the three movements, the title of 13); those are reworded above.

Not fixed, because they are not wording:

- **Sockets are needed at heading 6 and explained at heading 9.** The gloss at the top carries it for now; the order is his to shape.
- **No example agreement, so everything from heading 6 on stays abstract.** Question 8.
- **Heading 13's sentence is about MOR, not Agreements.** Question 5.
- **The long head before the first heading.** It is the outline's own apparatus, not the companion's.
- **What "cMIP" stands for.** Not spelled out in the sources read.

---

Test identities only; no server address, onion address or key appears here.
