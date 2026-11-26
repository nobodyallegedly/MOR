A fresh review session, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. Wave two, the first of the stint of 26 November: the fourth attack review, on the answers of 26 November taken together. Reading and writing a review only: no text, code or vector changes.

**The wish** (Nobody, allegedly, 26 November 2026, 16:46, at the top of `docs/decisions.md` on main): "We need to change the current wish to updating the core after the findings" And on what carries over (16:47): "Yes, we’ll go back to analysis, maybe add the focus on agreements"

**His words, quoted from the ledger.** On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications." On this wave (26 November, 16:37): "Yes, with attacks but using Fable 5.1, not 5.2". And, on earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

**What this wave reads: the pow wow of 26 November.** Seventeen exchanges, recorded in `docs/decisions.md` on main, under "His words in the stint of 20 November", from "A late version 3 is rejected" to "Wave two: check, then attack, then draft 26". Read each exchange whole, never a sentence lifted out of one. His words from them, quoted:
- "Version 3 is the one the network needs to reject" Then: "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it."
- "What I can state… when trying to build an agreement layer that could make everyone happy it became clear that it was best to treat it almost as a language and let the community implementations write the rules"
- "It should only say unchecked. If the client dev wishes to accept other methods instead of just supporting the cMIP, that’s their choice."
- "Agreed. It’s a different reason for a “sorry can’t do” and it’s always good to state why"
- "Protect the unknown parties." Then, on G10.6(b): "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under"
- "I think you are right. It is worth turning it into a principle. Protect the unknown party" Then: "It’s an agreements principle"
- On a key change that waits: "I don’t feel it’s a feature worth messing the core for"
- "Yes, knots of different kids, on different layers, used at different moments if needed"
- On one byte form for a set of acts: "Knots making is core core business, a"
- On a sealed container: "Agreed then"
- "I agree with CP. to me it means the same thing… valid, in force, what’s the difference for the core? The core should only see one version as valid" Then: "Yes, I always assumed in force to be human speech, and valid to be its translation for the verifier to be honest"
- "I think it”s cleaner, it keeps text to text and agreement grammar to agreement grammar, both have their own hashes to verify" Then: "Text comes first as a rule since agreement needs to point to it"
- "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition"
- "I’m tempted to state… sorry, we built two keys so that they could be kept separately"
- On Money's findings: "Let’s keep the focus where it is for now. Agreed"

**In my wording (the MOR lead's), what the exchanges arrived at, all marked "to check" in the ledger:** a version 3 naming a version already replaced is rejected once the replacing one is in force, and only a missing act that could carry a knot leaves that unchecked; named signers and buyer by assent stay cMIPs; a reader lacking a cMIP answers only "unchecked"; a resolve with nothing to resolve is "not shown", with the reason; G10.6 comes back with (a) only, replacing "Earned rights leave the grammar" of 18 November; "Protect the unknown party" is an Agreements principle; a place the parties never signed does not order their Terms; nothing is added to Identity (a waiting key change is a home's service; the two keys are kept apart; rule 34 stays); one byte form for a set of acts goes into Agreements' grammar; the sealed container gets no name in the core; for an update, valid means in force, one version at a time, two valid updates of one version a race; the words of Terms are a Text act, published first, named by act id; no stated anchor, no condition in time; Money's findings wait for the Money review.

**The ground it is weighed against:** the rest of `docs/decisions.md` (the stints of 20 November and of 10 to 20 November, both of which carry over); Agreements draft 25 and encoding 2 (pull request 183, `docs/agreements-from-scratch/draft-25.md` on branch `claude/agreements-clean-1-hahuwn`); the draft 26 brief (pull request 206, branch `claude/draft-26-brief-ucdzo3`); verifier 2 (pull request 184); `spec/README.md` for every other text's LATEST. The round's findings: `docs/research/round-2-what-the-language-could-not-say.md` (pull request 232), `docs/code/round-2-verifier-answers.md` (pull request 229), `docs/simulation/round-2-record.md` (pull request 226).

**Rules for every session:** you find; you change no text, code or vector, and decide nothing. No keys, signing words, server addresses, onion addresses, ports or access details, and never the author's personal name: write "Nobody, allegedly". Mark each claim traced (to a rule or an act), counted, or inferred. Plain words first, then precisely.

## The task

**Attack the answers of 26 November, taken together. Find where they break.**

You have not seen any of this before, and that is the point. Read the seventeen exchanges whole, then draft 25 and encoding 2, then the round's three findings files. Then try to break what was arrived at, alone and in combination:
1. **Contradictions:** two answers that cannot both hold; an answer that contradicts a ledger entry it does not mark as replaced.
2. **Exploits:** a person who gains by the new rules at another's cost. Take at least: a seller and an unknown buyer under G10.6 with (a) only; a majority and a silent member under "valid means in force"; two valid updates raced on purpose; the words as a Text act withheld, replaced or made private; a set of acts built to collide or to hide one act; Terms with no anchor that still try to say "before".
3. **What "Protect the unknown party" cannot protect,** and what it protects too much (a seller who can never fix an error in what was sold).
4. **Rules no verifier can check,** among the new ones.
5. **What the round's findings still show broken** after these answers.
For each: the story in plain words, with named people; the rules it rests on, quoted short; whether the bytes make it a provable lie, a visible pattern or nothing; and whether a cMIP in an existing socket answers it (say which). Rank by harm. Propose nothing: no rule, no wording, no fix.

Open the file with this sentence: "I am Fable 5.1, a model, not a person: an attack shows where MOR breaks, never where it holds for people."

## What you return

`docs/reviews/fable-attack-review-4.md` (branch `claude/fable-attack-review-4`, a pull request, no merge). End with your questions, those that may change a verifier's answer first. Report back in ten lines: the five worst breaks and the first question.
