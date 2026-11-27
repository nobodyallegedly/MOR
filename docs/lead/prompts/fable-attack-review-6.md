A fresh review session, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. The sixth attack review, on draft 26 of Agreements whole, as the scribe's passes P1 to P7 left it. It runs overnight, unattended: ask no question while you work; put every question in your report. Reading and writing a review only: no text, code or vector changes.

**The wish** (Nobody, allegedly, 26 November 2026, 16:46, at the top of `docs/decisions.md` on main): "We need to change the current wish to updating the core after the findings" On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development."

**His words, quoted from the ledger, on the text:** "This version of agreements is not to be used bare. Big warning needs to be placed on it." "Protect the unknown parties." "A fork is a fork." "Missing act is always “I don’t know”" "The person publishing the act is by default an author, the rest adds signature later" "Yes, I don’t see the need to have her sign twice" And of 27 November, late evening, on keepers: "To be valid the agreement needs to be checked at the keeper." "There is no update. It’s a new act. If you always think about it as a new act then it’s easier to solve these ones." "Are you creating rules for exceptions that are covered by logic?" "What decides if it’s two out of two or three out of two or just one. The agreement and the cMIP it uses" "Do we force cross verification, or simply redundancy." "Agreed, and there is a socket to lift it."

**What this review reads:** draft 26 of Agreements at commit b58e4171 on branch `claude/draft-26-outline-vbtvu7` (pull request 292, not merged): `docs/agreements-from-scratch/draft-26.md`, `encoding-3.md`, `draft-26-companion.md`, `draft-26-trace.md` and `draft-26-report.md`; the ledger `docs/decisions.md` on main, the stint of 26 November whole, its entries of 27 November late evening last; the lead's readings, `docs/lead/notes/2026-11-27-readings-for-p2.md` on main, every line the lead's. The fifth attack, `docs/reviews/fable-attack-review-5.md` (pull request 306), is the one before yours: read it last, and say which of its breaks draft 26 now closes and which still stand. Every "Arrived at" line is marked to check; every reading of the lead's is the lead's.

**Rules:** no spec text, code or vector of the repository changes. No keys, signing words, server addresses, onion addresses, ports or access details; never the author's personal name: write "Nobody, allegedly". Mark each claim traced (to a rule, a line of the ledger or an act), counted, or inferred. Decide nothing; propose nothing. Plain words first, then precisely.

## The task

**Attack draft 26. Find where it breaks.** Read draft 26 and encoding 3 first, as a stranger would; then the companion and the report; then the ledger. Then try to break it, alone and in combination:
1. **Two honest verifiers, two answers:** any rule that two readers can apply differently to the same bytes. Each with the bytes and both answers.
2. **Exploits:** a person who gains by the rules at another's cost. Take at least: keepers (one, two, three; cross verification by default and a cMIP in K9 that lifts it; a keeper that lies, contradicts itself, goes silent, or dies; a copy of a dead keeper's record held by one party only); the new agreement made after a dead keeper, naming the old one, against the old one's unknown parties; an update the keepers never show; the publisher's Terms act counted as their assent; the two classes of party; a power used past its limits; a fork made on purpose and never resolved; a late update; the words act withheld or replaced; a term with no clock.
3. **What the principle cannot protect,** and what it protects too much.
4. **Rules no verifier can check from bytes,** and rules the hashed text carries that are not rules.
5. **The way out:** succession, leaving, carrying an agreement to another system.
6. **What the introduction promises that the rules do not keep,** and the reverse.
For each: the story in plain words, with named people; the rules it rests on, quoted short; whether the bytes make it a provable lie, a visible pattern or nothing; whether a cMIP in one of the sockets answers it (say which). Rank by harm.

Open the file with this sentence: "I am Fable 5.1, a model, not a person: an attack shows where MOR breaks, never where it holds for people."

## What you return

`docs/reviews/fable-attack-review-6.md` (branch `claude/fable-attack-review-6`, a pull request, no merge). End with your questions in one numbered batch, each with your lean, those that may change a verifier's answer first. Report back in ten lines: the five worst breaks, which of the fifth attack's breaks still stand, and the number of questions.
