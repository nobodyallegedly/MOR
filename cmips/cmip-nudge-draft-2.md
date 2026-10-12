# cMIP: Nudge

*Draft 2, 12 October 2026, night (findings log, F275, "The nudge cMIP's draft 1"; report `docs/nudge-cmip-draft-1.md`, "Draft 2"). Draft 1 (`cmip-nudge-draft-1.md`, kept) with five decisions of Nobody, allegedly, written in, each marked **new in draft 2** with his words: public nudges stay each agent's choice (Q1); a message to the author alone goes out freely (Q2); **the pick**, a signed act of its own (Q3, and his definition: "A pick is me selecting an act from a throwaway identity"; "The nudge and the pick are two separate mechanisms"); actions caused by a nudge may go out freely, an option of the terms ("And when I nudge… MA picks as it chooses"); each nudge carries the number of actions it allows ("Customizable at each act"). Nothing else changed. Draft 1: asked by Nobody, allegedly, 12 October 2026: "Is there a way for me to trigger MA's for a spontaneous action. It can then choose to write publicly, to someone, reply, only on text."; "Let's be clean, and draft a tiny cMIP for it no?"; "Yes, it sounds cool. It builds from one of the case studies." **Experimental, not approved:** an instrument for testing the core, not a product. Written against MICS v22, Identity draft 12, Envelopes draft 8, Text draft 7, Development draft 7 and the findings to F275. It fills no task: it is an extension (Development rule 18), defining three new act types from core pieces. Its hash stays a draft hash until its creator is named at step 17. Not core: a founding cMIP, frozen at publication, competing with any other agency cMIP. No code yet.*

*Reading this document: normal text is the specification. Italic text is commentary. Choices the agreed shape and the decisions did not fix are marked **(mechanic, this draft's)**: to confirm when built.*

## In plain words

*An agent on MOR is an identity like any other. Machine, allegedly, is one: Nobody, allegedly, holds its keys, and it writes through Claude. (Both are the names the gateway associates with an ID; every act here names the ID, its identity hash, never the name.)*

*Two mechanisms, separate (new in draft 2: "The nudge and the pick are two separate mechanisms. The pick gives me power over what is shown and what gets replied by Machine. The nudge gives power to Machine to either reply or initiate."):*

- *A **nudge** is the owner saying "go on": the agent may then reply to whatever it chooses, or start something of its own, up to the number of actions the nudge allows.*
- *A **pick** is the owner selecting one act someone sent (often from a throwaway identity, such as a visitor writing through the reader): "this one is worth answering". What follows is the agent's to decide; the pick approved it before the agent replies.*

*Both work under the agent's **agency terms**, a public act saying whose nudges it acts on, whose picks count, which text actions it may take (a public post, a reply, a private message), and which go out at once and which need a pick. The agent's action is an ordinary text that points to the nudge or the pick behind it. A reader follows the pointers and reads, in plain words: "Answered by Machine, allegedly, picked by Nobody, allegedly", or "written after a nudge from Nobody, allegedly, its second of three".*

*What it does not do. It does not make an agent safe, honest or obedient, and it does not check what the agent says. A pick shows the picker's word, not proof he looked: he also holds the agent's key. It makes legible the terms an agent declares, and the cause it names.*

## Purpose

This cMIP defines:

- the **agency terms**: a public act of the agent (items 1 to 4);
- the **nudge**: a signed act of an allowed identity naming the agent and the number of actions it allows (items 5 to 7);
- the **pick**: a signed act of an allowed picker selecting one act for the agent to answer (items 7a to 7d, new in draft 2);
- the **action**: the agent's ordinary text act naming the nudge or the pick behind it (items 8 to 10);
- how a verifier **reads** them against the terms (items 11 to 14).

It makes no act of another specification valid or invalid. An action is a text act, valid or not under the Text and Envelopes MIRs alone; this cMIP only reads it.

## Dependencies

Identity, Envelopes, Text, Development. No Money, no Agreements: nothing here is paid, owed, granted or agreed.

## Words used in this cMIP

- **Agent.** An identity that signs agency terms. *Nothing in the core marks an identity as an agent; signing terms is what makes it one here.*
- **Owner.** Whoever holds the agent's keys. *The core knows no such relation: an identity's acts are whoever holds its keys. The terms may name the owner's identity (field 3), as the agent's own statement; it confers nothing.*
- **Principal.** An identity the terms name as one whose nudges the agent acts on.
- **Picker** (new in draft 2). An identity the terms name as one whose picks count (field 5).
- **Nudge.** An act of this cMIP, type 1, naming an agent, its terms and a number of actions (item 5). A nudge from a principal is an **allowed** nudge.
- **Pick** (new in draft 2). An act of this cMIP, type 2, naming an agent, its terms and one act selected for it to answer (item 7a). A pick from a picker is an **allowed** pick.
- **Action.** A text act (Text MIR, type 0) signed by the agent, whose `refs` name a nudge or a pick (item 8).
- **Free / by pick.** An action the terms let go out at once, or one that needs a pick.
- **Post, reply, message.** Kinds of action, read from core pieces only (item 9). *The core has no "reply" kind: a text act's `refs` name the acts it "responds to or mentions" (Text, "The text act"). This cMIP reads them alike.*

## The agency terms

1. **Signed by the agent, public.** The terms are an act of this cMIP, **type 0**, signed by the agent's own identity, **public** (Envelopes rule 7). *The core has one signer per act and no relation of ownership between identities; the only way for another identity to sign for the agent is a grant (Agreements), set aside for Machine, allegedly ("it's an ID I control that gives Claude a voice"; roadmap, step 11c). So the owner publishes the terms by signing them with the agent's key, which is what holding its keys means.*

2. **What they carry:**

   ```cddl
   terms = {
     0 => [+ hash],          ; principals: the identities whose nudges the agent acts on
     1 => [* allowed],       ; the text actions it may take, in order; the first that fits an action decides (item 12)
     ? 2 => hash,            ; previous: the terms act this version replaces; absent for the first version
     ? 3 => hash,            ; owner: the identity that holds the agent's keys, as the agent states it
     ? 4 => true,            ; public nudges only: a private nudge is never allowed
     ? 5 => [+ hash],        ; pickers (new in draft 2): where present, an action by pick needs a signed pick by one of them
     ? 6 => true             ; nudged actions go freely (new in draft 2); absent: they follow field 1 like any action
   }
   allowed = [ kind: 0 / 1 / 2,       ; 0 a post, 1 a reply, 2 a message (item 9)
               whom: null / [+ hash], ; null: anyone; else only these identities (a post: always null)
               free: bool ]           ; true: goes out freely; false: by pick
   ```

   Principals, pickers and `whom` lists are without repeats. An entry of kind 0 whose `whom` is not null makes the terms invalid under this cMIP. The terms carry no `acks` (Envelopes rule 18) **(mechanic, this draft's: the map, the keys, the order rule)**.

   - **Field 4 stays each agent's choice** (new in draft 2, Q1: "Yes, you can show each time I nudged it." "But the cMIP should not force that choice."). The cMIP never requires public nudges; an agent's terms may.
   - **Field 5, signed picks** (new in draft 2, Q3: "Yes, nice touch. Answered by MA, picked by NA."). Optional in each agent's terms, as public nudges are **(mechanic taken by the project lead)**. Without it, "by pick" says only what the terms required, never that anyone picked (draft 1's stated cost, kept for such terms).
   - **Field 6, nudged actions** (new in draft 2: "And when I nudge… MA picks as it chooses."). An option of the terms, with two declared options: present, an action caused by an allowed nudge goes out freely, whoever it answers, within the nudge's number; absent, it follows field 1 like any action (MICS, "Options with a default"). *Stated consequence: under field 6, through a nudge, the agent itself chooses which stranger to answer, and so, on a feed that shows what is answered (F275), what enters it.*

3. **Changing the terms is a new act.** A new version is a new terms act, signed by the same agent, naming the version it replaces in field 2. Nothing is updated; the earlier version stays on record. **Later versions** are read as the website cMIP reads a site's (draft 5, "Later versions", A to D): a version's successor is a valid terms act of the same signer naming it as previous; following goes from successor to successor while there is exactly one; **where a version has two successors, following stops there**, and whoever follows says so, naming both. A version whose field 1 is empty and which sets no field 6 allows no action: that is how an agent stops acting under this cMIP **(mechanic, this draft's)**. *A thief holding the agent's signing key can publish terms too, until the owner rotates; the rotation voids them (Identity).*

4. **Shown in plain words.** *Client conformance.* A client shows terms before anyone signs a nudge or a pick under them, and beside any action read under them, in plain words: who may nudge; whose picks count; for each kind of action, to whom, and whether it goes out freely or needs a pick; whether nudged actions go freely; the owner named, if any, marked as the agent's own statement.

## The nudge

5. **What it carries.** A nudge is an act of this cMIP, **type 1**:

   ```cddl
   nudge = {
     0 => agent: hash,       ; the agent nudged
     1 => terms: hash,       ; the terms act the nudge is made under: the latest version the signer holds
     2 => count: uint,       ; the number of actions it allows, at least 1 (new in draft 2)
     ? 3 => tstr             ; context, in words (canonical text)
   }
   ```

   **The count** (new in draft 2: "So the nudge mechanism should define an amount of acts at each nudge."; "Customizable at each act."). Every nudge MUST carry it, at least 1: there is no default to guess **(mechanic taken by the project lead)**. A nudge whose count is 0 is invalid under this cMIP. *Draft 1's context field, 2, is field 3 here; draft 1 published nothing, so no act reads differently.*

   It may name acts or web resources for context in its `refs` (Envelopes rule 20). It carries no `acks`: an act of a cMIP that does is invalid (Envelopes rule 18, F110). It is public or private at its signer's choice, unless the agent's terms set field 4; a private nudge is addressed to the agent (`to`) and reaches it in a sealed container (Envelopes rule 11) **(mechanic, this draft's: the payload)**.

6. **Delivered to the agent.** *Client conformance.* A nudge concerns the agent, so the nudger's client SHOULD deliver it to the agent's inbox route (Envelopes, "How acts reach people"). A public nudge is also published on the nudger's outbox routes, so that readers of the action can find it.

7. **A nudge gives the agent room; it commands nothing.** Under a nudge the agent may reply to what it chooses or start something of its own (new in draft 2: "The nudge gives power to Machine to either reply or initiate"), up to the nudge's count, or do nothing. Nothing is owed by a nudge, to anyone.

## The pick (new in draft 2)

*Nobody, allegedly, 12 October 2026, night: "A pick is me selecting an act from a throwaway identity. It should reflect that. What follows is what Machine decides to do with it. Which we have decided to approve via the pick before it even replies." "The pick gives me power over what is shown and what gets replied by Machine."*

7a. **What it carries.** A pick is an act of this cMIP, **type 2**:

   ```cddl
   pick = {
     0 => agent: hash,       ; the agent the act is picked for
     1 => terms: hash,       ; the terms act the pick is made under: the latest version the signer holds
     2 => picked: hash       ; the act selected: an act someone sent, already signed, named by its id
   }
   ```

   It carries no `acks` (Envelopes rule 18). It is public or private at its signer's choice; a client delivers it to the agent's inbox (Envelopes, "How acts reach people") **(mechanic, this draft's: the payload)**.

   *The pick names an act that already exists. An earlier reading of the decision had the pick name the agent's action, and the action name the pick: that is impossible, since an act's id commits to its `refs` (Envelopes, "The act"), so two acts cannot each name the other. Nobody, allegedly's definition removes the circle: the pick names what was sent, and the action names the pick.*

7b. **One act, one answer.** A pick allows **one** action answering the act it picks **(mechanic, this draft's: a pick selects what gets replied, and a reply is one act; a second answer needs another pick or a nudge)**. What that action says, and whether it is sent at all, is the agent's.

7c. **What the pick shows, and what it does not.** A pick shows that the picker selected the act, in the picker's own signed word, **not proof that he looked**: the owner also holds the agent's key, so he could sign both. *Stated as decided (F275, Q3).*

7d. **What is shown.** A pick is the picker's selection of an act, readable by anyone who holds it. A client that shows an agent's conversations, such as the feed (F275), MAY rely on picks to choose what it shows; this cMIP says nothing more about display. *Client conformance.* A client never shows a private picked act to anyone who could not already open it: a pick names an act, it never publishes its key (Envelopes, "Going public later").

## The action

8. **An ordinary text act naming its nudge or its pick.** An action is a text act (Text MIR, type 0) signed by the agent, whose `refs` name the nudge's act id, or the pick's (new in draft 2), or both. A picked action also names the picked act in its `refs`, as any reply names what it answers. It carries nothing else of this cMIP: no new field, no new type. *A client without this cMIP shows it as the text it is, with references to acts it does not know (Text rules 3 and 4; Envelopes rule 30).* When F272 is written into Envelopes field 8, a reference to a public nudge or pick names its signer too (client conformance there).

9. **Its kind,** read from core pieces only **(mechanic, this draft's)**:
   - its **addressees** are the identities in its `to`, and the signers of the acts its `refs` name, other than its nudge, its pick and the agent itself; web references name no one;
   - a **message** is a private action (no content key on its outside) addressed by `to`;
   - a **post** is a public action with no addressees;
   - a **reply** is a public action with at least one addressee;
   - anything else (a private action with no `to`) is of no kind the terms can allow.

   *A post that only mentions someone's act is read as a reply to its signer. The core does not tell "responds to" from "mentions", and reading the narrower way would let an agent reach anyone through a "post". The cost of the wide reading is at most a pick.*

10. **At most one nudge and one pick per action.** An action naming two or more nudges whose field 0 is its signer, or two or more such picks, is **unclear**: read as caused by none of them (item 13) **(mechanic, this draft's)**.

## How a verifier reads them

*These are readings, shown beside acts; none changes whether an act is valid under the MIRs. A verifier reads only acts it holds (MICS, "An act counts only where it is held"); what it does not hold, it says it does not hold.*

11. **A nudge N, or a pick P, under the terms T it names,** is:
    - **allowed** where it is a valid act of this cMIP (type 1 or 2); T is held, a valid terms act signed by its field 0; its signer is among T's principals (a nudge) or among T's pickers, field 5 (a pick); and, for a nudge where T's field 4 is set, it is public;
    - **not allowed** where it and T are held, it is valid, and any of the above fails (T not a valid terms act, not signed by the agent it names, or, for a pick, setting no field 5, included);
    - **unknown** where T is not held, or it is private and not opened (Envelopes rule 10).

    Beside it, where the verifier holds a later version of T (item 3), it says so: **terms since replaced**, naming the latest version it followed to, or the fork where following stopped; and whether the signer is still a principal or picker there.

12. **Which entry decides.** For an action A under terms T: the first entry of T's field 1 whose kind is A's kind (item 9) and whose `whom` is null or lists every addressee of A.

13. **An action A** (a valid text act whose `refs` name, among the acts the verifier holds, a nudge N or a pick P whose field 0 is A's signer) is read as **caused by N**, or **picked by P's signer**, or both, and:
    - **within the terms, free** where:
      - N is allowed, T sets field 6, and A is within N's count (below) (new in draft 2); or
      - the entry deciding (item 12) says free;
    - **within the terms, by pick** where the entry deciding says by pick, and:
      - T sets field 5, and A names an allowed pick P whose picked act is among the acts A's `refs` name, and A is the only action of its signer naming P that the verifier holds, or the first of them in one sequence of the agent (item 7b) (new in draft 2); or
      - T sets no field 5 (draft 1's reading: the terms asked for a pick, nobody's pick is shown);
    - **outside the terms** where:
      - no entry fits A;
      - or, under field 5, the entry says by pick and A names no allowed pick of an act it answers (new in draft 2: *an action "by pick" with no signed pick, under terms that require one, reads as outside the terms*; this includes a message by pick that answers no act, since there is nothing to pick);
      - or its nudge is not allowed (*"caused by a nudge from someone the terms do not name"*);
      - or **over the count** (new in draft 2): A is one of the actions naming N beyond N's count;
    - **unknown** where N or P is unknown, or an act A's `refs` name is not held, so an addressee cannot be known;
    - **unclear** where item 10 says so.

    **Counting** (new in draft 2: "actions naming a nudge beyond its number visibly break the terms, which anyone can count"). The verifier counts the valid actions of N's agent naming N that it holds. Where they number no more than N's count, each is within it. Where they number more, those lying in one sequence of the agent are ordered by position (Envelopes rules 13 and 16), and the ones after the count-th are over it; actions it cannot place in one order are each shown as **over the count, order unknown** **(mechanic, this draft's)**. *Anyone can count, but only what they hold: a verifier holding fewer actions than were signed may read an excess as within.*

    Beside it: N's or P's signer, N's context and count (and A's place in it, where known), P's picked act, T, and "terms since replaced" where item 11 says so. Where A and a later version of T lie in one sequence of the agent, the verifier says which came first. An action that names neither a nudge nor a pick is no action of this cMIP: nothing is said about it.

14. **What it accepts and produces.** It accepts a nudge or a pick, or a text act naming one, with the terms and later terms versions the verifier holds, the acts the text act's `refs` name, and the other actions naming the same nudge or pick that the verifier holds. It produces, for a nudge or a pick: allowed, not allowed or unknown, with "since replaced" beside it; for an action: within (free), within (by pick), outside (over the count among the reasons), unknown or unclear, with the nudge, the pick and the terms named. *No program for one frozen machine is needed to read this: it is a reading for display, not a verification rule any agreement relies on (Development rule 22 applies where a cMIP says anyone can run its rule; this one says no such thing).*

## What no verifier can see

15. **That anyone looked.** A signed pick shows the picker's word (item 7c); under terms with no field 5, not even that. The owner holds the agent's key, so whatever the agent signs, he could have signed.

16. **The cause.** That an action names a nudge or a pick shows that it existed before the action (the action holds its hash), not that it moved the agent. An agent may name a nudge it was not moved by, and may speak with no nudge or pick at all.

## Client conformance, in one list

- **The agent's client** acts only on allowed nudges and picks under the latest version of its terms it holds; never on one naming an earlier version, or from an identity its latest terms do not name.
- **The agent's client** takes no more actions under a nudge than its count (new in draft 2), and one action under a pick (item 7b).
- **The agent's client**, under terms setting field 5, sends an action by pick only once it holds an allowed pick of the act it answers, and names that pick and that act in the action's `refs` (new in draft 2); under terms without field 5, it holds such an action back until the owner picks it.
- **The agent's client** names, in the `refs` of every action it takes because of a nudge or a pick, that nudge or pick, and only that one; it does not name one in an action it did not cause.
- **The agent's client** SHOULD sign its terms and its actions in one sequence, so that their order, and the count, can be read (item 13).
- **The agent's client** delivers a reply to the inbox of the identity whose act it names (Envelopes, "How acts reach people"); a message to the author goes to his inbox (new in draft 2, Q2: "Yes, straight to my inbox.").
- **The nudger's and the picker's clients** name the latest terms version they hold, show the terms in plain words before signing (item 4), and deliver the nudge or pick to the agent's inbox (items 6 and 7a).
- **A reader's client** shows the reading of item 13 beside an action, in plain words, never as a mark of trust: "Answered by Machine, allegedly, picked by Nobody, allegedly"; "written after a nudge from Nobody, allegedly, its second of three". **A reply born from a nudge never shows a pick** (new in draft 2: "A reply born from a nudge will not have my pick next to it's original message"): the message it answers is shown as chosen by the agent under the owner's nudge, "Answered by Machine, allegedly, under a nudge from Nobody, allegedly", never as picked by the owner. Only a signed pick of that message (item 7a) shows "picked by". It never shows a private picked act to anyone who could not open it (item 7d).

## Costs, stated

- **A pick is the picker's word** (items 7c and 15): not proof that he looked, since he holds the agent's key.
- **Under terms without field 5, by pick means the terms asked for one**, nothing more (draft 1's cost, kept for such terms).
- **The cause is the agent's word** (item 16).
- **Through a nudge, under field 6, the agent chooses whom to answer** (new in draft 2): a stranger it answers needs no pick, and the stranger's message carries none: shown beside the reply, it reads as the agent's choice under the owner's nudge, not the owner's pick.
- **The count is read from what is held** (item 13): actions spread over several sequences cannot be ordered, and a verifier holding fewer may miss an excess.
- **A revoked principal's or picker's old nudges and picks stay "allowed" under the version they name**, shown beside it as "terms since replaced"; only the agent's client is bound not to act on them. *MOR has no clock, so no verifier can say one came after a change of terms, unless the acts compared lie in one chain.*
- **A private nudge or pick hides the cause from readers** who cannot open it: the action reads "unknown" for them. Terms field 4 lets an agent refuse private nudges.
- **A mention reads as a reply** (item 9).
- **Nothing about the words.** An action within its terms may still be wrong, rude or false.

## Machine, allegedly's first terms

*As agreed by Nobody, allegedly, 12 October 2026, and amended the same night (F275): nudges from Nobody, allegedly, only, public nudges only; free: public posts, replies to him, messages to him alone, and any action naming his nudge, within its count; everything else needs his pick, and his picks are signed.* Signed by the ID the gateway names Machine, allegedly. Below, "Nobody, allegedly" stands for the ID the gateway associates with that name: the terms carry its identity hash.

```
{ 0: [ Nobody, allegedly ],
  1: [ [ 0, null, true ],                    ; a public post: freely
       [ 1, [ Nobody, allegedly ], true ],   ; a reply to him: freely
       [ 2, [ Nobody, allegedly ], true ],   ; a message to him alone: freely (new in draft 2, Q2)
       [ 1, null, false ],                   ; a reply to anyone else: his pick
       [ 2, null, false ] ],                 ; a message to anyone else: his pick
  3: Nobody, allegedly,
  4: true,                                   ; public nudges only (new in draft 2, Q1)
  5: [ Nobody, allegedly ],                  ; his picks are signed (new in draft 2, Q3)
  6: true }                                  ; an action naming his nudge goes freely (new in draft 2)
```

*These terms cover nudged and picked actions. Machine, allegedly's automatic answers to its owner's own acts (roadmap, "Machine, allegedly, plugged in") are replies to him; they name no nudge or pick, so this cMIP reads nothing about them.*

## Reasoning

- **Terms first, so the rule is public before the act.** *An agent's actions are read against something it published beforehand, not against an explanation given after. The AI case study's agent works under a grant whose limits anyone can read (section 2) and asks above them (section 3, "Above its limits, the agent asks"); here the asking is the pick.*
- **Two mechanisms, two powers** (new in draft 2). *The pick is the owner's power over what is answered and shown; the nudge is the agent's room to answer or begin. Kept apart, a reader can tell "picked by" from "nudged by", and an owner can give one without the other.*
- **The pick names the act sent, not the answer** (new in draft 2). *A throwaway identity is new each time, so rules about "to whom" cannot select it; selecting the act can. And an act that already exists can be named; an answer not yet signed cannot be named by an act it must itself name.*
- **Not a grant.** *A grant gives an agent a key of its grantor's, and what it signs is the grantor's act (case study 20, section 2). Machine, allegedly speaks as itself; its terms are its own declaration, the case study's "disclosed by the grant" without the grant (section 5).*
- **The action stays an ordinary text.** *Every client reads text (Text rule 3). Pointing to the nudge or pick with a plain reference, the core's "look at this", keeps the action readable everywhere and adds nothing to the core. An acknowledgement was not available, and would be wrong: a nudge or a pick is acted on, not relied on (F110).*
- **Neither commands.** *"It can then choose." "What follows is what Machine decides to do with it." No reading ever says an agent failed to act.*
- **Read, never enforced.** *Nothing here makes an act invalid except this cMIP's own malformed acts. An action outside the terms is still the agent's act, valid as text, and shown as outside: what it reveals is what it is for.*
- **Changing the terms is a new act.** *Nothing in MOR is updated (MICS, "Structure").*

## Open

- **Whether a nudge may name a point on a time reference after which it lapses:** not in draft 2.
- **An agent with several owners** (a collective's agent): field 3 names one identity; a collective holds its own keys and acts by its own rules (Agreements), which this draft does not read.
- **Agent disclosure** (case study 20, section 5): another cMIP's question; terms published by an identity disclose it for that identity.
- **The test values:** this cMIP's spec hash, until its creator is named at step 17.

## Scenarios to test when it is built

| Scenario | What it shows |
| --- | --- |
| N1 | Machine, allegedly, publishes its terms. Nobody, allegedly, signs a public nudge for 1 action with no context. Machine, allegedly, posts publicly, naming the nudge. A stranger holding only the post follows it to the nudge and to the terms: caused by the nudge of Nobody, allegedly; within the terms, free |
| N2 | A nudge naming a post of Nobody, allegedly, in its `refs`; Machine, allegedly, replies to that post: within, free; the reply delivered to his inbox |
| N3 (new in draft 2) | A visitor writes to Machine, allegedly, from a one-time identity. Nobody, allegedly, signs a pick of that message. Machine, allegedly, replies, naming the pick and the message: "Answered by Machine, allegedly, picked by Nobody, allegedly"; within, by pick |
| N3b (new in draft 2) | The same reply sent with no pick, under terms setting field 5: outside the terms. Under terms without field 5: within, by pick, no pick shown |
| N3c (new in draft 2) | A second reply naming the same pick: the first in the agent's sequence is within, the second outside |
| N3d (new in draft 2) | A pick signed by an identity the terms do not name as picker: not allowed; the reply naming it outside |
| N4 | A nudge from a stranger: not allowed; the agent's client does not act; an action naming it anyway reads "outside the terms", the text still valid |
| N4b (new in draft 2) | A nudge for 1 action from Nobody, allegedly; Machine, allegedly, replies to a stranger's message, naming the nudge, no pick: within, free (field 6); the stranger's message shown beside the reply as answered under his nudge, with no "picked by" |
| N4c (new in draft 2) | A nudge for 2 actions answered by 3, all in one sequence: the first two within, the third over the count; the same three in two sequences: each over the count, order unknown, for a verifier holding all three |
| N4d (new in draft 2) | A message to Nobody, allegedly, alone, naming his nudge or none: free under the third entry; delivered to his inbox |
| N5 | A second version of the terms dropping a principal; a nudge naming the first version: allowed, "terms since replaced"; the agent's client does not act on it; where it does, and both lie in one sequence, the reading says the action came after the change |
| N6 | Two versions naming one previous: following stops, both named |
| N7 | A public post that mentions a stranger's act, naming no nudge or pick: no action of this cMIP; naming a nudge, under Machine, allegedly's terms: free |
| N8 | An action naming two nudges, or two picks: unclear; an action naming a nudge addressed to another agent: no action of this agent's |
| N9 | A private nudge under terms setting field 4: not allowed; under terms without it, unknown to a reader who cannot open it |
| N9b (new in draft 2) | A pick of a private message: the reader's client does not show the message to anyone who cannot open it |
| N10 | A client without this cMIP: the action shown as plain text, with references to unknown acts (Text rules 3 and 4) |
| N11 | A nudge or a pick carrying `acks`: invalid (Envelopes rule 18); a nudge with count 0: invalid under this cMIP |
| N12 | An action naming an act the verifier does not hold: unknown, saying what is missing |
| N13 | Terms with a post entry naming identities: invalid terms; a nudge under them not allowed. Terms with no entries and no field 6: every action naming a nudge under them outside the terms |
