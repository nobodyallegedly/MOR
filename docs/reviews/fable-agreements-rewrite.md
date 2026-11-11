# Agreements written again from scratch: a report for the MOR lead

*Fable, 10 November 2026. From a conversation with Nobody, allegedly, the same evening, after `fable-signed-facts.md` (pull request 135) and the stranger's review (pull request 134). It proposes a session and lists what to feed it; it changes no text, code or vector and decides nothing. Checked on main at `fc624ab8`: Agreements draft 24 (81,516 words), `docs/must-audit-2026-10.md`, `core/vectors/` and `core/tests/`, `docs/s7r-4-report.md`.*

## In plain words

Nobody, allegedly, is considering having Agreements redrafted whole, from scratch, with no editing of draft 24: "Now we have a much more educated view of what matters", and "I think it is worth it". I agree, with one correction to how it would be verified and one gate before it starts.

The reason to do it is not size. The discussion settled that size matters less than it did: people and developers now point an agent at the text and ask for the part they need, so length is cheap and contradiction is expensive. What matters is the standard Nobody, allegedly, named: **each rule said once, in one place; no sentence that reads two ways; words that mean one thing.** Draft 24 cannot reach that by editing, because it carries its history in its skeleton: rules sit where they were born, numbered in the order the attacks came, and every edit inherits that order. A text written from the four-part grammar outward would read in the order a person thinks, and say each thing once by construction.

**The correction.** "We can use the vectors to verify a full rewrite" is true only one way. The vectors test the code, and a rewrite of the text does not touch the code, so they would pass whatever the new text said. They verify the rewrite only if **an independent verifier is built from the new text alone** and run against them, as the C verifier was built from draft 17. That is the real test of "the same law in better words", and it should be planned as part of the work, not after it.

**The gate.** What leaves the core must be decided first, or the text is written twice.

## 1. What the session is asked to do

Write Agreements again as a new text, from its grammar, so that a reader with no history can read it in order. The law does not change: no verdict moves, no byte of any format moves. It is a rewrite of the words and their order only.

## 2. The ingredients

**What binds it (it may not change these):**

- **The act formats** (draft 24, Part five): the CDDL is carried over exactly; only the commentary around it is written anew.
- **An inventory of every verdict-bearing sentence of draft 24**, made before the writing starts, each to land in exactly one sentence of the new text. `docs/must-audit-2026-10.md` is the model, but it maps October's drafts, and draft 24 writes most of its rules without the word MUST (29 uses in 81,516 words), so the unit has to be the rule sentence in normal text, not the keyword. Making this inventory is a session of its own, and it is the most valuable ingredient: it is the checklist the rewrite is diffed against.
- **The freeze suite's Agreements checklist and scenarios** (v37): every box still has its rule.
- **The 291 vectors** (113 of them verdict vectors) and the tests under `core/tests/`: unchanged, and run against an independent verifier built from the new text.
- **The other five MIRs, the MICS and Development's task table**, as fixed neighbours the new text must agree with; their pointers into Agreements are updated by the table of section 5.
- **The attacks to stay closed:** a list drawn from the findings log, one line per attack and the rule that answers it, without the narrative.

**What guides it (the shape):**

- **The outline:** the four parts the MICS already names: the grammar of agreeing; what others relied on stands; the way out; who decides.
- **The principles the fixes kept returning to, stated once, up front:** what others relied on stands; no stake moves without its holder; whatever the holder held is what is passed; termination is the agreed way out, beside the way out no term reaches; unknown is never rounded up; only the plan pays.
- **The stated costs**, as a list: each survives, once, beside its rule. The stranger would not cut one of them and neither would I.
- **The standard:** one rule, one place, one meaning. Numbering follows reading order. Plain words first. A word used as a term means one thing throughout (`docs/freeze-ready-glossary.md` is the starting list; the stranger's "holds means four things" and "contested names four things" are the known offenders).
- **The stranger's two-way readings** (its section 2), as traps to write around, above all rule 85 against rule 87.

**What stays out of its hands:**

- **Draft 24's prose and order as a source.** It is consulted to check what a rule says; it is never the structure and never copied by the paragraph. Otherwise this is an edit under another name.
- **The history:** no retired numbers, no "numbers kept as history", no author's words, no notes for MOR 2 inside the text.
- **New ideas.** Anything the writing exposes is logged and brought to Nobody, allegedly, as always; the session resolves nothing itself.

## 3. Decisions needed before it starts

1. **What leaves the core.** The stranger's list: client conformance to a builders' companion or, as `fable-signed-facts.md` proposes, to a terms-reading cMIP; advice; the publishing model (partners, role and metric shares, backups, fees) to a founding cMIP, the core keeping conservation, "only the plan" and no stake moved without its holder; the freeze apparatus out of the hashed text. Each is Nobody, allegedly's, and each changes what the session writes. My view on the largest, the publishing model: it can move only if the split check stays the core's, since a cMIP cannot be trusted with who may be paid; that boundary needs its own short review before the decision.
2. **The open items of the last reviews:** the fourth destination for an unfilled share (back to the payer); the three declarations and the terms-reading task; the founding non-party holder's clause; rule 85 against rule 87 for a member who resigned; who may draw the line registering their own resignation; a party of a deal who holds no share.
3. **Whether the same is wanted for the MICS**, which the stranger would cut to a fifth. I would do Agreements first and let the map follow the territory.

## 4. How it is verified

1. **The inventory diff:** every sentence of the inventory maps to one sentence of the new text, and every rule sentence of the new text maps back to the inventory. A sentence with no origin is a new idea and comes out; an inventory line with no home is a lost guard and goes in.
2. **The independent verifier:** built from the new text alone, by a builder who has not seen draft 24, run against the 291 vectors. Every disagreement is either a flaw in the new text or a rule draft 24 never wrote down, and both are worth finding before a freeze.
3. **The suite:** each Agreements box and scenario step pointed at its new rule.
4. **A cold reader:** no history, the new text only, end to end, formats included, which the stranger's review asked for and could not itself do.

## 5. What it costs, and what can go wrong

- **Cost:** the inventory session; the writing, in several sessions by part; the independent verifier; one table from old rule numbers to new, kept outside the frozen text, for the code's comments, the suite, the other MIRs' pointers and every review in `docs/`. The second rehearsal should wait for it: the players should read the text that will be frozen.
- **A guard lost quietly.** Each odd sentence in draft 24 is a scar from a real attack. The inventory and the attack list are the defence; neither is perfect, which is why the independent verifier matters.
- **Second-system temptation.** A clean page invites better rules. The rule "no new ideas" has to be held by whoever reviews the session, not only by the session.
- **A law the old text never stated.** The reference code may do things no sentence of draft 24 says ("already pays" was one). The rewrite will surface these; each is a finding, not a failure.

## 6. My view

Worth doing, before the freeze, in this order: the decisions of section 3; the inventory; the writing; the verification of section 4; then the second rehearsal on the result. It delays the freeze by those sessions and gives a text that can be frozen for people who never met its authors, which the stranger's review says draft 24 is not yet.

## What I checked and what I did not

Checked: draft 24's word count and its uses of MUST; that the must-audit maps October's drafts; the vector count in S7r-4's report (291, 113 verdict vectors) and the test files present; the four parts in the MICS. Not checked: how much of the reference code's behaviour has no sentence in draft 24; what an independent verifier would cost to build again; nothing run.
