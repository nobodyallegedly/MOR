An adversarial review of eleven decisions made today on MOR's new Agreements, in the MOR repository (`nobodyallegedly/MOR`). Read only: change no text, code or vectors, and decide nothing. Your job is to break the decisions before anything is written from them.

## Today's decisions (all four assignments of wave 2 read this)

Nobody, allegedly's words, quoted from the ledger (`docs/decisions.md`, branch `claude/lead-records-2`). Read each entry whole there, under its heading; each closes with an "Arrived at (to check)" line, which is the MOR lead's reading. Where that line says more than his words, his words win.

1. **Three lines cut back.** "Agreed." (to the MOR lead's lean to cut three "Arrived at" lines back to his words).
2. **The two gates.** "A, agreed": where the update condition answers valid, the update replaces the version it names; the new version's own `in_force` governs only its own later life.
3. **A way out by default.** "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out"
4. **Unclear means unchecked.** "Agreed" (verifier 2's A6 and A9: where it is unclear whether someone's assent counts, every answer that depends on it is unchecked).
5. **Crossing to a new text.** "A move to MOR2 potentially does end it, unless it is updated to MOR2, we update core drafts, that problem does not exist out there once we freeze" Then "Agreed": nothing new in MOR 1; on the MOR 2 list.
6. **Two threads, two owners.** "It does" (the signer's line belongs to the layer below, the agreement's thread to Agreements; a key change continues the signer's line).
7. **One freeze.** "Fine with me" (F84 stands: all six freeze together, once).
8. **Where three rules live.** "Agreed for the first" (the baker's rule moves into Envelopes); "Agreed" (the report block's home is the MICS, with the rules for reading reports).
9. **The place is a pointer.** "It's just a pointer to a relay then. Why the need for more grammar?" Then "Yes, agreed. My point was: this is simpler than what we are discussing.agreed" (the place is a field with one rule: where Terms name a place, every reader takes what is latest from it and from nothing else).
10. **Only rules in the hashed text.** "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested."
11. **Vouchers** (his first project, not the core): "Yes, each voucher becomes currency, only those who need redeeming them redeem. Voucher then disappears." "The voucher is spent. The promise of something was fulfilled" And: "the eggs from coop and the eggs from storby could end up being priced differently by the market…" "That's the rating agencies being dictated by a market"

**Still the budget rule:** "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." The rewrite is not decided: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite." So wave 2 reads, maps and attacks; it writes no rule and changes no code.

## Read, and only these

- the eleven entries above, whole, in `docs/decisions.md` on branch `claude/lead-records-2`, under their headings (from "Three lines cut back" to "The issuer is priced too");
- `docs/agreements-from-scratch/draft-25.md` on branch `claude/agreements-clean-1-hahuwn`, for what the decisions act on;
- `docs/reviews/fable-draft-25.md` on branch `claude/fable-draft-25` (pull request 186): an earlier fresh-eyes review that raised several of these questions.

## Questions

1. **Each decision against the others.** Do any two contradict, or does one quietly undo another? In particular: the default way out (3) against the update condition deciding alone (2); unclear means unchecked (4) against the default way out (3).
2. **Attack the way out (3).** Play the person who leaves to escape what they owe; the group that is left holding a promise; the receiver who leaves while money is still arriving; the signer who forks their own line instead of leaving. What must leaving never erase, for the default to be safe? Is "Terms that say so can keep someone in" enough, or can the lock be hidden in a cMIP no one reads?
3. **Attack unclear means unchecked (4).** Can someone keep an agreement unchecked for ever on purpose (a private assent never opened, a withdrawal never ordered), and so block every update? Who is protected, and who is now exposed?
4. **Attack the place (9).** A relay as the place: what happens when it lies, withholds, disappears, or is run by one of the parties?
5. **Attack the moves (8, 10).** Does anything lose its guarantee when the baker moves to Envelopes, the reading of reports to the MICS, and the history to companion documents?
6. **The admission test.** For each decision, does what stays in the core pass it: "part of the shared language every act is written in, or a guarantee no module may be able to break"?

Plain words first, then precisely, quoting what you judge. Say what you read and what you only reason. For each attack: who does it, what they gain, what the record shows. Rank by harm, the way out first. Write `docs/reviews/fable-attack-review-1.md` (branch `claude/fable-attack-review-1`, a pull request, no merge). Never write the author's personal name; write "Nobody, allegedly". No server addresses, onion addresses or keys.
