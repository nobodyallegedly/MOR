**Current wish** (Nobody, allegedly, `docs/decisions.md`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction."

Does Agreements from scratch, draft 1, fit the layers below it? In the MOR repository (`nobodyallegedly/MOR`), from main. Read `docs/agreements-from-scratch/draft-1.md` (branch `claude/agreements-from-scratch-3ibcsy`, pull request 147), its section 8 first, and these MIRs in `spec/`: Identity draft 16, Text draft 11, Envelopes draft 12, Money draft 14. **Do not open any Agreements draft, the MICS, Development, `docs/findings/`, `docs/reviews/`, `docs/agreements-inventory/` or `docs/agreements-marking/`**: the old Agreements is not to be translated into the new one, only the layers it stands on are checked.

**In plain words:** draft 1 names five operations it does not define (State, Sign, Deliver, Order, Control) and lists what it needed and did not have. This finds out what the layers actually give it.

**Please give:**
1. **Each item of draft 1's section 8**, answered from the MIRs, with the sentence quoted: fingerprints of fixed bytes; whether a per-signer chain already exists (making rule 5 redundant, or not); acts signed by several people; field names; what an ordered place can answer, including "nothing later than this", and how it is identified; what happens to a chain when a key is replaced or lost; how a cMIP is identified; whether "shown, not shown, fork, unchecked" have names elsewhere.
2. **Each operation draft 1 names**, with the layer and the act or rule that provides it, or "not provided".
3. **Each of draft 1's fields and rules that a layer already does**, so the draft need not, and **each one a layer contradicts**, quoted on both sides.
4. **What the layers provide that draft 1 does not use** and could rely on instead of a rule of its own.

Decide nothing; do not change the draft or any MIR. Plain words first, then precisely. Write `docs/agreements-from-scratch/layers-fit-1.md` (branch `claude/draft-1-layers-fit`, a pull request, no merge). Never write the author's personal name; write "Nobody, allegedly". No server addresses or keys.
