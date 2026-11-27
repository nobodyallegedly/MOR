A fresh review session, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. Wave four of the stint of 26 November: the fifth attack review, on draft 26 of Agreements whole. Reading and writing a review only: no text, code or vector changes.

**The wish** (Nobody, allegedly, 26 November 2026, 16:46, at the top of `docs/decisions.md` on main): "We need to change the current wish to updating the core after the findings" On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (27 November, 16:54): "Yes pls"

**His words, quoted from the ledger, on the text:** "This version of agreements is not to be used bare. Big warning needs to be placed on it." "Not to be used bare. Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." "Protect the unknown parties." "There is no valid update for her anymore. Only a valid agreement" "A fork is a fork." "Knots a cross acts by nature, and possibly cross layer." "Missing act is always “I don’t know”" "There is no such thing as an unsigned act on Mor" "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do" "The person publishing the act is by default an author, the rest adds signature later" "No, Ana took the risk, she bears the responsability."

**What this wave reads:** draft 26 of Agreements as written on 27 November: `docs/agreements-from-scratch/draft-26.md`, `encoding-3.md`, `draft-26-companion.md`, `draft-26-trace.md` and `draft-26-report.md`, on branch `claude/draft-26-outline-vbtvu7` (pull request 292, not merged); the ledger `docs/decisions.md` on main, the stint of 26 November whole (its entries of 26 and 27 November), and the stints that carry over; the MOR lead's two notes under `docs/lead/notes/` (what changed, by rule; the points settled by the lead). Draft 25 and encoding 2 (pull request 183) are the text it replaces; verifier 2 (pull request 184) implements draft 25. Every "Arrived at" line in the ledger is marked to check; every reading of the lead's is marked as the lead's.

**Rules for every session:** no spec text, code or vector of the repository changes, except as each task below says. No keys, signing words, server addresses, onion addresses, ports or access details; never the author's personal name: write "Nobody, allegedly". Mark each claim traced (to a rule, a line of the ledger or an act), counted, or inferred. Decide nothing; propose where asked, and label the proposal yours. Plain words first, then precisely.

## The task

**Attack draft 26. Find where it breaks.**

You have not seen it before, and that is the point. Read draft 26 and encoding 3 first, as a stranger would, before the companion; then the companion and the report; then the ledger's stint of 26 November. Then try to break it, alone and in combination:
1. **Two honest verifiers, two answers:** any rule that two readers can apply differently to the same bytes. Each with the bytes and both answers.
2. **Exploits:** a person who gains by the rules at another's cost. Take at least: the unknown party under 5.10 (a seller, a buyer, a dropped role, a dissolution, a renewal); the gate and the pin with one, two and no keepers, and a keeper that lies; a fork made on purpose and never resolved; the double assent, in order and forked; the words act withheld, replaced, private or voided; a late update shown by knots across layers; a set of acts built to collide or to hide one; a power used past its limits, the agent blameless; a specification named by a stand-in; a term with no clock.
3. **What the principle cannot protect,** and what it protects too much.
4. **Rules no verifier can check from bytes,** and rules the hashed text carries that are not rules.
5. **The way out:** succession, leaving, carrying an agreement to another system, under draft 26.
6. **What the introduction promises that the rules do not keep,** and the reverse.
For each: the story in plain words, with named people; the rules it rests on, quoted short; whether the bytes make it a provable lie, a visible pattern or nothing; whether a cMIP in one of the eight sockets answers it (say which). Rank by harm. Propose nothing: no rule, no wording, no fix.

Open the file with this sentence: "I am Fable 5.1, a model, not a person: an attack shows where MOR breaks, never where it holds for people."

## What you return

`docs/reviews/fable-attack-review-5.md` (branch `claude/fable-attack-review-5`, a pull request, no merge). End with your questions, those that may change a verifier's answer first. Report back in ten lines: the five worst breaks and the first question.
