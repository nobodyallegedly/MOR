To the codemeister, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. Wave four of the stint of 26 November: what draft 26 does to verifier 2, with proposals. Reading and proposing: no code or vector of the repository changes.

**The wish** (Nobody, allegedly, 26 November 2026, 16:46, at the top of `docs/decisions.md` on main): "We need to change the current wish to updating the core after the findings" On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (27 November, 16:54): "Yes pls"

**His words, quoted from the ledger, on the text:** "This version of agreements is not to be used bare. Big warning needs to be placed on it." "Not to be used bare. Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." "Protect the unknown parties." "There is no valid update for her anymore. Only a valid agreement" "A fork is a fork." "Knots a cross acts by nature, and possibly cross layer." "Missing act is always “I don’t know”" "There is no such thing as an unsigned act on Mor" "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do" "The person publishing the act is by default an author, the rest adds signature later" "No, Ana took the risk, she bears the responsability."

**What this wave reads:** draft 26 of Agreements as written on 27 November: `docs/agreements-from-scratch/draft-26.md`, `encoding-3.md`, `draft-26-companion.md`, `draft-26-trace.md` and `draft-26-report.md`, on branch `claude/draft-26-outline-vbtvu7` (pull request 292, not merged); the ledger `docs/decisions.md` on main, the stint of 26 November whole (its entries of 26 and 27 November), and the stints that carry over; the MOR lead's two notes under `docs/lead/notes/` (what changed, by rule; the points settled by the lead). Draft 25 and encoding 2 (pull request 183) are the text it replaces; verifier 2 (pull request 184) implements draft 25. Every "Arrived at" line in the ledger is marked to check; every reading of the lead's is marked as the lead's.

**Rules for every session:** no spec text, code or vector of the repository changes, except as each task below says. No keys, signing words, server addresses, onion addresses, ports or access details; never the author's personal name: write "Nobody, allegedly". Mark each claim traced (to a rule, a line of the ledger or an act), counted, or inferred. Decide nothing; propose where asked, and label the proposal yours. Plain words first, then precisely.

## The task

**One sheet, `docs/code/impact-draft-26.md`: what draft 26 and encoding 3 do to verifier 2, rule by rule, and your proposal for each byte choice.**

1. For each rule of draft 26 (its 68 numbered and 33 lettered) and each E-rule of encoding 3: the code it meets in verifier 2 (file and line, `claude/agreements-verifier-2`); what the verifier would answer differently; the size of the change (a word, a rule, a field, a value form, a removal). Cite your build list (pull request 194) and your sheet of 26 November (`docs/code/impact-26-november.md`) where they already hold a point; say where draft 26 settled one of your 26 questions and how.
2. The vectors: which of today's change answer, which are retired with the rules that left, and the new ones needed (the 22 of 26 November, and what the 27 November entries add: the double assent in order and forked; two keepers one silent; a filling under a dropped role; a specification named by a stand-in; a late update shown by knots across layers; the words act voided and relied on). Each new vector in one line: the acts, the question, the answer. Write none yet.
3. The twelve byte choices of encoding 3's "Open": for each, the choices, what each costs a verifier and a client, and your proposal, labelled yours; the five marked for Nobody, allegedly, with the question in plain words for him.
4. What draft 26 asks of the layers below that verifier 2 takes from the act format today (`prev`, `objects`, `acks`, the keeper's identifier, a clock's reference, a Text act's id in `body`): one line each, for the MICS and Envelopes rewrite.
5. Your estimate: the size of verifier 3, and in what order you would build it (the gate and the pin first, the lead's lean).

As many sessions as it needs; say how many. Report to me short: the three largest changes, the byte choices for him, and your questions one at a time.

## What you return

Branch `claude/impact-draft-26`, a pull request, no merge, one file. Nothing under `core/`, `verifier2/` or `tools/` changes.
