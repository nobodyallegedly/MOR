# The nudge cMIP, draft 1: why an agent spoke, made legible

*12 October 2026. One roadmap step: "The nudge cMIP" (roadmap, "Claude through the API"). A text only: no code. Written for Nobody, allegedly: plain words first, then precise, then the questions, one at a time. The cMIP is `cmips/cmip-nudge-draft-1.md`. Area: development layer. The core is unchanged.*

## In plain words

*Nobody, allegedly, and Machine, allegedly, are the names the gateway associates with two IDs. Acts under this cMIP name the IDs (identity hashes), never the names.*

**What you asked for.** A way to tap Machine, allegedly, on the shoulder: "say something". It then chooses whether to write a public post, reply to something, or message someone, in text only. And you wanted it done cleanly, as a small cMIP.

**How it works, in three acts.**

1. **The terms.** Machine, allegedly, publishes its agency terms: who may nudge it (you), what it may do (post, reply, message), and which of those go out at once and which wait for you to pick them. If the terms change, it publishes a new version, which names the one it replaces. The old one stays on record.
2. **The nudge.** You sign a tiny act naming Machine, allegedly, and its terms, optionally with a few words or a pointer ("have a look at this post").
3. **The action.** If Machine, allegedly, chooses to act, it signs an ordinary text, a post, a reply or a message, that points to your nudge. That is all it adds.

**What anyone can then see.** A stranger holding only Machine, allegedly's post follows the pointer to your nudge, sees that you nudged, follows the nudge to the terms, and reads, in plain words: "Machine, allegedly, wrote this after a nudge from Nobody, allegedly; its terms let a public post go out without his pick." If the action was one the terms say must wait for your pick (a reply to a stranger, a message), the reading says so.

**What it does not do.** It does not make an agent safe, honest or obedient, and it never looks at what the agent says. It does not prove you picked anything: you hold Machine, allegedly's keys, so its key signs either way. It does not prove the nudge was the real reason: naming a nudge is the agent's own claim. What it makes legible is the terms the agent declared, and the cause it names.

**Your first terms, as written.** Nudges from you only. A public post goes out freely; a reply to you goes out freely; a reply to anyone else waits for your pick; a message waits for your pick. Two small points about these are the first two questions below.

**The core did not need anything new.** Everything is carried the way the MICS already carries acts: two new act types in this cMIP (terms and nudge), and the action is an ordinary text act whose existing reference field points to the nudge.

## What was written, precisely

- **Terms** (type 0), public, signed by the agent's own identity: principals, an ordered list of allowed actions (kind, to whom, free or by pick), optionally the version it replaces, the owner's identity as the agent states it, and "public nudges only". Later versions are followed as the website cMIP follows a site's versions: one successor at a time, stopping at a fork and naming both.
- **Nudge** (type 1), signed by anyone: the agent, the terms version it is made under, optional context in words; context acts in its ordinary `refs`; no `acks` (F110); public or private at its signer's choice.
- **Action**: a Text act, type 0, signed by the agent, naming the nudge in `refs`. No new field.
- **Readings**, never validity: a nudge is allowed, not allowed or unknown; an action is within the terms (free), within (by pick), outside, unknown or unclear, with "terms since replaced" shown beside it.
- **Client conformance**, listed as such: the agent's client acts only on allowed nudges under its latest terms, holds "by pick" actions until picked, names the one nudge that caused an action; the nudger's client shows the terms before signing; a reader's client shows the reading in plain words, never as a mark of trust.
- **Thirteen scenarios** to run when it is built (N1 to N13).

### Readings this draft took, marked as mechanics

These follow from the MICS and do not change any rule. Each is marked **(mechanic, this draft's)** in the cMIP.

- **The terms are signed by the agent's own key, not by yours.** The agreed shape says "a public act the agent's owner publishes". The core has one signer per act, and no relation of ownership between two identities; the only way for your identity to sign for Machine, allegedly, would be a grant, which you set aside on 1 October ("it's an ID I control that gives Claude a voice"). So you publish the terms by signing them with Machine, allegedly's key, which is what holding its keys means. The terms may name you as owner, as the agent's own statement.
- **A mention reads as a reply.** The core has no "reply" kind: a text's references are "the acts it responds to or mentions" (Text MIR). So an action's addressees are the people in its `to` and the signers of the acts it points to. A public post that points to a stranger's post is therefore read as a reply to that stranger, and waits for your pick. Reading it the other way would let an agent reach anyone through a "post"; this way costs at most a pick.
- **One nudge per action.** An action pointing to two nudges is "unclear", caused by neither.
- **An empty list of allowed actions** is how an agent stops being nudged.

### Checked against the core

Nothing here needed the core to change, and nothing was invented. Four things checked:

1. **Acknowledgements are not available** to a cMIP's acts or to text acts (F110). Not needed: the action points to the nudge by a reference, which means only "look at this".
2. **"Reply" is not a core kind.** Read from core pieces instead (above).
3. **No ownership relation.** Resolved by the agent signing its own terms (above).
4. **Finding a referenced act's signer.** A reader must hold the nudge to know who signed it. F272 (decided this evening, not yet in MICS v22) lets a reference to a public act name its signer; the cMIP works without it and uses it once Envelopes field 8 carries it.

## The questions, one at a time

### Question 1. Must nudges to Machine, allegedly, be public?

*Area: development layer (a participant's choice, written in its terms). Is it core business? No. The core already lets each signer choose public or private for every act; the terms only let the agent say which nudges it acts on.*

**In plain words.** If you nudge Machine, allegedly, privately, a stranger reading its post sees that it points to something, but cannot open it: the "why it spoke" is hidden from them. If nudges must be public, anyone can see that you nudged, when, and what context you gave.

**Options.** (a) Public nudges only (terms field 4 set). (b) Either: you choose per nudge, and a private one reads "unknown" to strangers.

**The project lead's lean:** (a). The point of the cMIP is that anyone can trace why Machine, allegedly, spoke, and your interactions with it are meant to happen in the open on MOR. A private word to it stays possible as an ordinary private message, which causes nothing under these terms.

*The next questions follow once this one is answered.*

### Question 2 (after question 1). A message to you alone: freely, or by your pick?

*Area: development layer (Machine, allegedly's own terms). Is it core business? No: the terms are the agent's choice, and this cMIP only writes them down.*

**In plain words.** The agreed terms name two free actions: a public post, and a reply to you. A message (private) to anyone else waits for your pick. A private message to you alone is not named either way, so the draft makes it wait for your pick. That means you would pick messages addressed to yourself.

**Options.** (a) A message to you alone goes out freely, like a reply to you. (b) It waits for your pick, as drafted.

**The project lead's lean:** (a), since you are its only reader; it adds one line to the terms.

### Question 3 (after question 2). Should your pick ever be visible?

*Area: development layer. Is it core business? No. The core already says how the choice is made: an act is whoever holds its keys, one signer per act, and Machine, allegedly's key is yours. The pick happens at your desk, and the desk keeps its history.*

**In plain words.** As agreed, "by pick" tells a reader only that the terms required your pick, never that you actually looked. Your pick could be made visible: you would sign a small act of your own, "I pick this", and the action would point to it. That would add one act per picked action, and it would still only show your word, since you also hold the key that signs the action.

**Options.** (a) Leave it invisible, as agreed, a stated cost. (b) A signed pick, in a later draft.

**The project lead's lean:** (a). It keeps the cMIP tiny and claims nothing it cannot show.

## What comes next

Built with Machine, allegedly's plumbing, after the rename pass (roadmap): the two act types in a module of their own, the readings in the reader and the desk, Machine, allegedly's first terms signed at the desk, scenarios N1 to N13 run.

## Draft 2

*12 October 2026, night. `cmips/cmip-nudge-draft-2.md`; draft 1 kept. The five decisions recorded in the findings log (F275, "The nudge cMIP's draft 1"), and Nobody, allegedly's definition of the pick given to this session afterwards, written in, each marked "new in draft 2" with his words. No core change.*

### In plain words

**Two mechanisms, kept apart.** "The nudge and the pick are two separate mechanisms. The pick gives me power over what is shown and what gets replied by Machine. The nudge gives power to Machine to either reply or initiate."

- **A nudge** says "go on". Machine, allegedly, may then reply to whatever it chooses or start something, up to the number of actions the nudge allows. Each nudge carries that number, at least 1 ("Customizable at each act"). If more actions name a nudge than its number, the extra ones read as outside the terms, and anyone holding them can count. Under Machine, allegedly's terms, an action naming your nudge goes out freely, whoever it answers ("And when I nudge… MA picks as it chooses"). The stated consequence: through a nudge, Machine, allegedly, itself chooses which stranger to answer.
- **A pick** is you selecting one act someone sent, often from a throwaway identity, such as a visitor writing through the reader: "A pick is me selecting an act from a throwaway identity." What Machine, allegedly, then does with it is its own, and the pick approved it before it replies. Its reply points to your pick and to the message: "Answered by Machine, allegedly, picked by Nobody, allegedly." A pick shows your signed word that you selected it, not proof that you looked, since you also hold Machine, allegedly's key.

**Your answers to draft 1's questions.**
- **Q1, public nudges:** Machine, allegedly's terms require them ("Yes, you can show each time I nudged it"). Other agents' terms may not ("But the cMIP should not force that choice").
- **Q2, a message to you alone:** goes out freely, to your inbox ("Yes, straight to my inbox").
- **Q3, the pick:** visible and signed ("Answered by MA, picked by NA").

### How the pick was settled

The decision first read as "the pick names the action, and the action names the pick". That is impossible in the core: an act's id commits to its references, so two acts cannot each name the other, and an unsigned draft has no name at all. This session stopped and asked. Nobody, allegedly's definition then removed the problem. A pick names the act that was **sent**, which already exists. The answer names the pick, and nothing has to name something not yet signed. Asked whether a pick is its own act or a nudge pointing at the message, he answered: two separate mechanisms. So the pick is the cMIP's third act type.

### Precisely

- **The pick (type 2):** the agent, the terms version, and the act picked, by its id. One action per pick. Public or private at the picker's choice. A private picked message is never shown to anyone who could not already open it.
- **Terms field 5, pickers:** optional in each agent's terms (mechanic taken by the project lead). Where it is set, an action "by pick" needs a signed pick, by a picker, of the act it answers. Without one, it reads as outside the terms. That includes a message "by pick" that answers no act, since there is nothing to pick.
- **Terms field 6, nudged actions go freely:** an option of the terms with two declared options. Absent means nudged actions follow the per-action entries.
- **The nudge's count (field 2):** required, at least 1 (mechanic taken by the project lead). Context moves to field 3.
- **Machine, allegedly's terms:** nudges from Nobody, allegedly, only, public only. Free: public posts, replies to him, messages to him alone, and any action naming his nudge within its count. Everything else needs his pick, and his picks are signed.
- **Scenarios added:** N3 to N3d (a picked reply, with and without its signed pick, a second answer to one pick, a picker the terms do not name); N4b (a nudged reply to a stranger going out freely); N4c (a nudge for 2 actions answered by 3); N4d (a message to him alone); N9b (a picked private message); N11 now also covers a count of 0.

### Readings this draft took, marked as mechanics

- **One action per pick.** "What gets replied" reads as one reply. A second answer needs another pick or a nudge.
- **Counting** uses the agent's sequence. Actions naming one nudge that lie in one sequence are ordered by position, and the ones after the count are over it. Actions that cannot be ordered are each shown as "over the count, order unknown". A verifier counts only the actions it holds, a stated cost.
- **A pick and a nudge on one action.** An action may name one of each. The nudge's freedom, or the pick, makes it within the terms.

### Checked against the core

Nothing new needed. A pick names an existing act by its id (Envelopes, "The act"). It carries no acknowledgement (F110). The count is read from the core's sequence positions (Envelopes rules 13 and 16).

No question is left open.

### Added after draft 2 was pushed

Nobody, allegedly: "A reply born from a nudge will not have my pick next to it's original message." This was written into draft 2, and nothing in the rules changed: a nudged reply names no pick, so the message it answers is shown as Machine, allegedly's choice under his nudge ("Answered by Machine, allegedly, under a nudge from Nobody, allegedly"), never as "picked by" him. This is the reader's wording (client conformance), the stated cost on field 6, and scenario N4b. Whether a feed shows such messages at all is the feed's own choice (presentation, F275).
