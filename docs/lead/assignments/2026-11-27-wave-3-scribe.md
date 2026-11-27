To the scribe, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. Wave three of the stint of 26 November: the draft 26 brief redone, then draft 26. Writing spec text, for the first time in this stint: draft 26 is a new file beside draft 25, which stays as it is.

**The wish** (Nobody, allegedly, 26 November 2026, 16:46, at the top of `docs/decisions.md` on main): "We need to change the current wish to updating the core after the findings" And on what carries over (16:47): "Yes, we’ll go back to analysis, maybe add the focus on agreements"

**His words, quoted from the ledger, that shape the text:**
- "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it."
- "What I can state… when trying to build an agreement layer that could make everyone happy it became clear that it was best to treat it almost as a language and let the community implementations write the rules"
- On the introduction (27 November, 07:26): "I think agreement need an introduction that states a few things yes. I don’t think it should be stated as such." "Not to be used bare. Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." "Keepers (old “place”) gives the drafters of agreements a way to agree on where the agreement shall be stored. (This can be simply mentioned when introducing the concept of keeper)" "Knots is a MOR wide concept, but in agreement Rely is a good place to discuss their importance."
- "Protect the unknown parties." "It’s an agreements principle" "There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?"
- "A fork is a fork. When a fork exists there could be a race between a white party and a black party. Or, the fork could be resolved amicably by all emvolved"
- "Knots a cross acts by nature, and possibly cross layer."
- "Missing act is always “I don’t know”"
- "Let’s speak Mor…. terms are record, agreement is law, right? There is no such thing as an unsigned act on Mor"
- "The clock specified in the agreement and its anchoring." "There is no valid update to sign, only signed terms to respect."
- "Agreed. An uploader lodges, the relay relays, and the client fetches."
- "Those old drafts should be buried deep, only for people who wish to do some archeology…"

**What draft 26 rests on (in my wording, the MOR lead's, every item marked "to check" in the ledger):**
1. `docs/decisions.md` on main: the stint of 26 November whole (its entries of 26 and 27 November), and the stints of 20 November and of 10 to 20 November, which carry over.
2. `docs/lead/notes/2026-11-27-what-changed-in-agreements.md`: the changes by rule.
3. `docs/lead/notes/2026-11-27-settled-by-the-lead.md`: the remaining points of wave two and what each rests on. Where draft 26 cannot carry one without a new choice, stop and say so; do not choose.
4. Draft 25 and encoding 2 (pull request 183, branch `claude/agreements-clean-1-hahuwn`): the text being rewritten.
5. Your draft 26 brief (pull request 206, branch `claude/draft-26-brief-ucdzo3`) and your check (pull request 266): the sort of the 124 rules, now to be redone.
6. The codemeister's impact sheet (branch `claude/impact-26-november-4vze7a`): what each change does to verifier 2, and its 22 new vectors, for the companion's scenarios.
7. `spec/README.md` for every other text's LATEST; Identity draft 16 for rule 34, rotation and the escape; Envelopes draft 12 for the envelope, acknowledgements and the sealed container.

**Rules for every session:** draft 25 and encoding 2 are not edited; draft 26 and encoding 3 are new files beside them. No code or vector changes. No keys, signing words, server addresses, onion addresses, ports or access details; never the author's personal name: write "Nobody, allegedly". Where the ledger and a note disagree, the ledger wins; where the ledger is silent, stop and ask through me. Plain words first, then precisely.

## The task, in two stages

**Stage one: the brief, redone.** `docs/agreements-from-scratch/draft-26-brief-2.md`: the 124 rules of draft 25 sorted again against everything above (stays, changes, goes, moves, new), each with the ledger entry it rests on; the new rules (the gate and the pin; the keeper, one or several; the set of acts; the words as a Text act; the principle; the term ending by the clock; "shown after") each with its source; the size estimate; and the list of what the sources leave unsaid, for me. One session. Report to me before stage two starts; I check it and may bring items to Nobody, allegedly.

**Stage two: draft 26.** `docs/agreements-from-scratch/draft-26.md` and `encoding-3.md`, in the MIR shape (purpose; dependencies; definitions; the data each act carries; the validity rules, MUST, SHOULD, MAY; the tasks handed to cMIPs; open parameters), with:
- the introduction he asked for, his three paragraphs' substance in the text's own words, as the first thing a reader meets;
- only rules in the hashed text; the reasoning, the stated costs and the scenarios in a companion beside it (`draft-26-companion.md`), whose spine is "What is the minimum two people have to write" and which carries the evidence-and-accounting line;
- the words lodge, relay, fetch, keeper, shown after, late, fork, valid, in force, not shown, unchecked, each defined once;
- each rule traceable to its ledger entry in the companion, never in the hashed text.
As many sessions as the text needs, outline first, then the sections; say how many and in what order. Every prompt whole, in its own code box, the environment and the model above each.

## What you return

Branch `claude/draft-26`, a pull request, no merge, draft 25 untouched. After stage one, report to me short: the sort's totals, what is unsaid, your questions one at a time. After stage two: the size, what you could not write without a choice, and your questions one at a time.
