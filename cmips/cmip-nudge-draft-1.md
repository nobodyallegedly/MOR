# cMIP: Nudge

*Draft 1, 12 October 2026 (roadmap, "Claude through the API", "The nudge cMIP"; report `docs/nudge-cmip-draft-1.md`). Asked by Nobody, allegedly, the same afternoon: "Is there a way for me to trigger MA's for a spontaneous action. It can then choose to write publicly, to someone, reply, only on text."; "Let's be clean, and draft a tiny cMIP for it no?"; "Yes, it sounds cool. It builds from one of the case studies." Its shape (agency terms, the nudge, the action) and Machine, allegedly's first terms were agreed then; this draft writes them down. **Experimental, not approved:** an instrument for testing the core, not a product. Written against MICS v22, Identity draft 12, Envelopes draft 8, Text draft 7, Development draft 7 and the findings to F272. It fills no task: it is an extension (Development rule 18), defining two new act types from core pieces. Its hash stays a draft hash until its creator is named at step 17. Not core: a founding cMIP, frozen at publication, competing with any other agency cMIP. No code yet.*

*Reading this document: normal text is the specification. Italic text is commentary. Choices this draft made that the agreed shape did not fix are marked **(mechanic, this draft's)**: to confirm when built.*

## In plain words

*An agent on MOR is an identity like any other. Machine, allegedly, is one: Nobody, allegedly, holds its keys, and it writes through Claude. Sometimes its owner wants to say "go on, say something" without saying what. This cMIP is how that is done in the open.*

*Three acts. First, the agent publishes its **agency terms**: whose nudges it acts on, which text actions it may take (a public post, a reply, a private message), and which of them go out at once and which wait for the owner to pick them. Second, an allowed person signs a **nudge**: a small act naming the agent, perhaps with a few words or a pointer for context. Third, the agent, if it chooses to act, signs an ordinary text (a post, a reply, a message) that points to the nudge. Anyone reading that text can follow the pointer to the nudge, see who nudged, follow the nudge to the terms, and see whether the action was one the terms let go out freely or one that waited for the owner's pick.*

*What it does not do. It does not make an agent safe, honest or obedient, and it does not check what the agent says. It makes two things legible: the terms an agent declares, and why it spoke.*

## Purpose

This cMIP defines:

- the **agency terms**: a public act of the agent, naming the identities whose nudges it acts on and the text actions it may take, each free or waiting for its owner's pick (items 1 to 4);
- the **nudge**: a signed act of an allowed identity naming the agent (items 5 to 7);
- the **action**: the agent's ordinary text act naming the nudge that caused it (items 8 to 10);
- how a verifier **reads** a nudge and an action against the terms (items 11 to 14).

It makes no act of another specification valid or invalid. An action is a text act, valid or not under the Text and Envelopes MIRs alone; this cMIP only reads it.

## Dependencies

Identity, Envelopes, Text, Development. No Money, no Agreements: nothing here is paid, owed, granted or agreed.

## Words used in this cMIP

- **Agent.** An identity that signs agency terms. *Nothing in the core marks an identity as an agent; signing terms is what makes it one here.*
- **Owner.** Whoever holds the agent's keys. *The core knows no such relation: an identity's acts are whoever holds its keys. The terms may name the owner's identity (item 2, field 3), as the agent's own statement; it confers nothing.*
- **Principal.** An identity the terms name as one whose nudges the agent acts on.
- **Nudge.** An act of this cMIP, type 1, signed by anyone, naming an agent and its terms (item 5). A nudge from a principal is an **allowed** nudge.
- **Action.** A text act (Text MIR, type 0) signed by the agent, whose `refs` name a nudge (item 8).
- **Free / by pick.** An action the terms let go out at once, or one that waits for the owner's pick. *The pick happens on the owner's own client; no verifier can see it (item 15).*
- **Post, reply, message.** Kinds of action, read from core pieces only (item 9). *The core has no "reply" kind: a text act's `refs` name the acts it "responds to or mentions" (Text, "The text act"). This cMIP reads them alike.*

## The agency terms

1. **Signed by the agent, public.** The terms are an act of this cMIP, **type 0**, signed by the agent's own identity, **public** (Envelopes rule 7). *The agreed shape says "a public act the agent's owner publishes". The core has one signer per act and no relation of ownership between identities; the only way for another identity to sign for the agent is a grant (Agreements), set aside for Machine, allegedly ("it's an ID I control that gives Claude a voice"; roadmap, step 11c). So the owner publishes the terms by signing them with the agent's key, which is what holding its keys means.*

2. **What they carry:**

   ```cddl
   terms = {
     0 => [+ hash],          ; principals: the identities whose nudges the agent acts on
     1 => [* allowed],       ; the text actions it may take, in order; the first that fits an action decides (item 12)
     ? 2 => hash,            ; previous: the terms act this version replaces; absent for the first version
     ? 3 => hash,            ; owner: the identity that holds the agent's keys and makes its picks, as the agent states it
     ? 4 => true             ; public nudges only: a private nudge is never allowed
   }
   allowed = [ kind: 0 / 1 / 2,       ; 0 a post, 1 a reply, 2 a message (item 9)
               whom: null / [+ hash], ; null: anyone; else only these identities (a post: always null)
               free: bool ]           ; true: goes out freely; false: waits for the owner's pick
   ```

   Principals and `whom` lists are without repeats. An entry of kind 0 whose `whom` is not null makes the terms invalid under this cMIP. The terms carry no `acks` (Envelopes rule 18) **(mechanic, this draft's: the map, the keys, the order rule)**.

3. **Changing the terms is a new act.** A new version is a new terms act, signed by the same agent, naming the version it replaces in field 2. Nothing is updated; the earlier version stays on record. **Later versions** are read as the website cMIP reads a site's (draft 5, "Later versions", A to D): a version's successor is a valid terms act of the same signer naming it as previous; following goes from successor to successor while there is exactly one; **where a version has two successors, following stops there**, and whoever follows says so, naming both. A version whose field 1 is empty allows no action: that is how an agent stops being nudged **(mechanic, this draft's)**. *A thief holding the agent's signing key can publish terms too, until the owner rotates; the rotation voids them (Identity).*

4. **Shown in plain words.** *Client conformance.* A client shows terms before anyone signs a nudge under them, and beside any action read under them, in plain words: who may nudge; for each kind of action, to whom, and whether it goes out freely or waits for the owner's pick; the owner named, if any, marked as the agent's own statement.

## The nudge

5. **What it carries.** A nudge is an act of this cMIP, **type 1**:

   ```cddl
   nudge = {
     0 => agent: hash,       ; the agent nudged
     1 => terms: hash,       ; the terms act the nudge is made under: the latest version the signer holds
     ? 2 => tstr             ; context, in words (canonical text)
   }
   ```

   It may name acts or web resources for context in its `refs` (Envelopes rule 20): a post to answer, a page to read. It carries no `acks`: an act of a cMIP that does is invalid (Envelopes rule 18, F110). It is public or private at its signer's choice; a private nudge is addressed to the agent (`to`) and reaches it in a sealed container (Envelopes rule 11) **(mechanic, this draft's: the payload)**.

6. **Delivered to the agent.** *Client conformance.* A nudge concerns the agent, so the nudger's client SHOULD deliver it to the agent's inbox route (Envelopes, "How acts reach people"). A public nudge is also published on the nudger's outbox routes, so that readers of the action can find it.

7. **A nudge asks; it commands nothing.** The agent may act on an allowed nudge once, several times or not at all. Nothing is owed by a nudge, to anyone.

## The action

8. **An ordinary text act naming its nudge.** An action is a text act (Text MIR, type 0) signed by the agent, whose `refs` name the nudge's act id. It carries nothing else of this cMIP: no new field, no new type. *A client without this cMIP shows it as the text it is, with a reference to an act it does not know (Text rules 3 and 4; Envelopes rule 30).* When F272 is written into Envelopes field 8, a reference to a public nudge names its signer too (client conformance there).

9. **Its kind,** read from core pieces only **(mechanic, this draft's)**:
   - its **addressees** are the identities in its `to`, and the signers of the acts its `refs` name, other than the nudge and other than the agent itself; web references name no one;
   - a **message** is a private action (no content key on its outside) addressed by `to`;
   - a **post** is a public action with no addressees;
   - a **reply** is a public action with at least one addressee;
   - anything else (a private action with no `to`) is of no kind the terms can allow.

   *A post that only mentions someone's act is read as a reply to its signer. The core does not tell "responds to" from "mentions" (Text, "The text act"), and reading the narrower way would let an agent reach anyone through a "post". The cost of the wide reading is at most a pick.*

10. **One nudge per action.** An action's `refs` name one nudge of its agent. An action naming two or more nudges whose field 0 is its signer is **unclear**: read as caused by none of them (item 13) **(mechanic, this draft's)**.

## How a verifier reads them

*These are readings, shown beside acts; none changes whether an act is valid under the MIRs. A verifier reads only acts it holds (MICS, "An act counts only where it is held"); what it does not hold, it says it does not hold.*

11. **A nudge N, under the terms T it names,** is:
    - **allowed** where N is a valid act of this cMIP, type 1; T is held, a valid terms act signed by N's field 0; N's signer is among T's principals; and, where T's field 4 is set, N is public;
    - **not allowed** where N and T are held, N is valid, and any of the above fails (T not a valid terms act, or not signed by the agent N names, included);
    - **unknown** where T is not held, or N is private and not opened (Envelopes rule 10).

    Beside it, where the verifier holds a later version of T (item 3), it says so: **terms since replaced**, naming the latest version it followed to, or the fork where following stopped; and whether N's signer is still a principal there.

12. **Which entry decides.** For an action A under terms T: the first entry of T's field 1 whose kind is A's kind (item 9) and whose `whom` is null or lists every addressee of A.

13. **An action A** (a valid text act whose `refs` name, among the acts the verifier holds, one nudge N whose field 0 is A's signer) is read as **caused by N**, and:
    - **within the terms, free** where N is allowed and the entry deciding (item 12) says free;
    - **within the terms, by pick** where N is allowed and the entry deciding says it waits for the owner's pick;
    - **outside the terms** where N is allowed and no entry fits A, or where N is not allowed (*"caused by a nudge from someone the terms do not name"*);
    - **unknown** where N is unknown, or an act A's `refs` name is not held, so an addressee cannot be known;
    - **unclear** where it names two or more such nudges (item 10).

    Beside it: N's signer, N's context, T, and "terms since replaced" where item 11 says so. Where A and a later version of T lie in one sequence of the agent, the verifier says which came first (Envelopes rules 13 and 16). An action that names no nudge is no action of this cMIP: nothing is said about it.

14. **What it accepts and produces.** It accepts a nudge, or a text act naming one, with the terms and later terms versions the verifier holds, and the acts the text act's `refs` name. It produces, for a nudge: allowed, not allowed or unknown, with "since replaced" beside it; for an action: within (free), within (by pick), outside, unknown or unclear, with the nudge and terms named. *No program for one frozen machine is needed to read this: it is a reading for display, not a verification rule any agreement relies on (Development rule 22 applies where a cMIP says anyone can run its rule; this one says no such thing).*

## What no verifier can see

15. **The pick.** Whether the owner picked an action is not shown by any act: the agent's key signs it either way, and the owner holds that key. "By pick" says only what the terms required, never that the owner looked. *This is the agreed shape: the pick happens at the owner's desk, and the desk keeps its history (roadmap, "Machine, allegedly, plugged in").*

16. **The cause.** That an action names a nudge shows that the nudge existed before it (the action holds its hash), not that the nudge caused it. An agent may name a nudge it was not moved by, and may speak with no nudge at all.

## Client conformance, in one list

- **The agent's client** acts only on allowed nudges under the latest version of its terms it holds; never on a nudge naming an earlier version, or from an identity its latest terms do not name.
- **The agent's client** holds back every action the deciding entry marks "by pick" until the owner picks it; it sends the free ones without asking.
- **The agent's client** names the nudge in the `refs` of every action it takes because of it, and only that one nudge; it does not name a nudge in an action the nudge did not cause.
- **The agent's client** SHOULD sign its terms and its actions in one sequence, so that their order can be shown (item 13).
- **The agent's client** delivers a reply to the inbox of the identity whose act it names (Envelopes, "How acts reach people"; the two homes reading of 12 October 2026).
- **The nudger's client** names the latest terms version it holds, shows the terms in plain words before signing (item 4), and delivers the nudge to the agent's inbox (item 6).
- **A reader's client** shows the reading of item 13 beside an action, in plain words, never as a mark of trust: "Machine, allegedly, wrote this after a nudge from Nobody, allegedly; its terms let a public post go out without his pick."

## Costs, stated

- **The pick is not seen** (item 15): by pick means the terms asked for one.
- **The cause is the agent's word** (item 16): naming a nudge is a claim that it moved the agent.
- **A revoked principal's old nudges stay "allowed" under the version they name**, shown beside it as "terms since replaced"; only the agent's client is bound not to act on them. *MOR has no clock, so no verifier can say a nudge came after a change of terms, unless the acts compared lie in one chain.*
- **A private nudge hides the cause from readers** who cannot open it: the action reads "unknown" for them. Terms field 4 lets an agent refuse private nudges.
- **A mention reads as a reply** (item 9): an agent's post naming a stranger's act waits for a pick where a reply to that stranger would.
- **Nothing about the words.** An action within its terms may still be wrong, rude or false.

## Machine, allegedly's first terms

*As agreed by Nobody, allegedly, 12 October 2026: "nudges from Nobody, allegedly, only; public posts and replies to him go out freely; a message or reply to anyone else waits for his pick."* Signed by Machine, allegedly:

```
{ 0: [ Nobody, allegedly ],
  1: [ [ 0, null, true ],                    ; a public post: freely
       [ 1, [ Nobody, allegedly ], true ],   ; a reply to him: freely
       [ 1, null, false ],                   ; a reply to anyone else: his pick
       [ 2, null, false ] ],                 ; a message: his pick
  3: Nobody, allegedly }
```

*Two points left open for him (report, questions 1 and 2): whether field 4 is set (public nudges only), and whether a message to him alone goes out freely; as written it waits for his pick, since the agreed terms name only posts and replies to him as free.* *These terms cover nudged actions only. Machine, allegedly's automatic answers to its owner's own acts (roadmap, "Machine, allegedly, plugged in") name no nudge, and this cMIP says nothing about them.*

## Reasoning

- **Terms first, so the rule is public before the act.** *An agent's actions are read against something it published beforehand, not against an explanation given after. The AI case study's agent works under a grant whose limits anyone can read (section 2) and asks above them (section 3, "Above its limits, the agent asks"); here the "asks" is the pick.*
- **Not a grant.** *A grant gives an agent a key of its grantor's, and what it signs is the grantor's act (case study 20, section 2). Machine, allegedly speaks as itself; its terms are its own declaration, which is the case study's "disclosed by the grant" without the grant (section 5).*
- **The action stays an ordinary text.** *Every client reads text (Text rule 3). Pointing to the nudge with a plain reference, the core's "look at this", keeps the action readable everywhere and adds nothing to the core. An acknowledgement was not available, and would be wrong: a nudge is not relied on, it is acted on (F110).*
- **A nudge asks, never commands.** *"It can then choose." Nothing obliges the agent; no reading ever says an agent failed to act.*
- **Read, never enforced.** *Nothing here makes an act invalid except this cMIP's own malformed acts. An action outside the terms is still the agent's act, valid as text, and shown as outside: what it reveals is what it is for.*
- **Changing the terms is a new act.** *Nothing in MOR is updated (MICS, "Structure").*

## Open

- **How many actions one nudge may cause,** and whether a nudge may name a point on a time reference after which it lapses: not in draft 1.
- **An agent with several owners** (a collective's agent): the terms' field 3 names one identity; a collective holds its own keys and acts by its own rules (Agreements), which this draft does not read.
- **Agent disclosure** (case study 20, section 5): whether an agent's every act should say it is one is another cMIP's question; terms published by an identity disclose it for that identity.
- **The test values:** this cMIP's spec hash, until its creator is named at step 17.

## Scenarios to test when it is built

| Scenario | What it shows |
| --- | --- |
| N1 | Machine, allegedly, publishes its first terms. Nobody, allegedly, signs a public nudge with no context. Machine, allegedly, posts publicly, naming the nudge. A stranger holding only the post follows it to the nudge and to the terms: caused by the nudge of Nobody, allegedly; within the terms, free |
| N2 | A nudge naming a post of Nobody, allegedly, in its `refs`; Machine, allegedly, replies to that post: within, free; the reply delivered to his inbox |
| N3 | A nudge; Machine, allegedly, replies to a stranger's post, and sends a message: each held back at the desk until picked; read as within, by pick |
| N4 | A nudge from a stranger: not allowed; the agent's client does not act; an action naming it anyway reads "outside the terms", the text still valid |
| N5 | A second version of the terms dropping replies to anyone else; a nudge naming the first version: allowed, "terms since replaced"; the agent's client does not act on it; where it does, and both lie in one sequence, the reading says the action came after the change |
| N6 | Two versions naming one previous: following stops, both named |
| N7 | A public post that mentions a stranger's act: read as a reply to the stranger, by pick |
| N8 | An action naming two nudges: unclear; an action naming a nudge addressed to another agent: no action of this agent's |
| N9 | A private nudge: unknown to a reader who cannot open it; not allowed under terms with field 4 set |
| N10 | A client without this cMIP: the action shown as plain text, with a reference to an unknown act (Text rules 3 and 4) |
| N11 | A nudge carrying `acks`: invalid (Envelopes rule 18) |
| N12 | An action naming an act the verifier does not hold: unknown, saying what is missing |
| N13 | Terms with a post entry naming identities: invalid terms; a nudge under them not allowed. Terms with no entries: every action naming a nudge under them outside the terms |
