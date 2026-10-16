# mor-nudge

The nudge cMIP, draft 3 (`cmips/cmip-nudge-draft-3.md`; draft 2 with every text act of an agent read against its terms), in code: a module of its own, in TypeScript, with the core library through WebAssembly. **Experimental, not approved,** like the cMIP: an instrument for testing the core. Test identities only.

## In plain words

An agent on MOR, such as Machine, allegedly, publishes its **agency terms**: who may nudge it, whose picks count, and which kinds of action go out at once or wait for a pick. Its owner can **nudge** it ("go on, up to two actions") or **pick** one act someone sent ("answer this one"). Whatever the agent then writes is an ordinary text that points to the nudge or the pick behind it.

This module makes the three acts (terms, nudge, pick) and reads them. Given the acts a reader holds, it says in plain words what anyone can check: "Answered by Machine, allegedly, picked by Nobody, allegedly"; "Answered by Machine, allegedly, under a nudge from Nobody, allegedly, its first of two"; or that an action is outside its terms (over the nudge's number, a pick no one may give, a nudge from a stranger), unknown (something it names is not held), or unclear (two nudges at once). These are readings shown beside an act, never a mark of trust: nothing here makes an act valid or invalid under the MIRs, and nothing checks what the agent says.

## Precisely

| File | What |
| --- | --- |
| `src/specs.ts` | The cMIP's spec hash (a test value until step 17), its three types (terms 0, nudge 1, pick 2), the kinds of action. |
| `src/nudge.ts` | `encodeTerms`/`decodeTerms`, `encodeNudge`/`decodeNudge`, `encodePick`/`decodePick` (each refuses what the cMIP makes invalid: a post entry naming identities, a count of 0, repeats, a context that is not canonical text); `termsInWords` (item 4); `entryFor` (item 12); `Reading`, holding acts, with `readCause` (item 11: allowed, not allowed, unknown, or invalid, with "terms since replaced"), `readAction` (item 13: within free, within by pick, outside, unknown, unclear, with the count and the place in it), `follow` (later versions, stopping at a fork), `mayAct` (the agent's client acts only on an allowed nudge or pick under the latest terms it holds), `termsFor` and the reading of an act naming no cause (item 8a, draft 3), `maySign` (draft 3, client conformance: the agent's client signs no text act its terms do not let go out freely without an allowed nudge or pick that allows it, the act read as it would be once signed) and `pickedShown` (item 7d: a private picked act is never shown to one who cannot open it). |

### Readings this code takes, where the cMIP leaves a choice

1. **Acts passed in are taken as valid under the MIRs.** The caller judges each through its signer's identity chain (the desk does, for what it receives); this module reads only what the cMIP adds.
2. **"One sequence"** is read by following `prev` through the acts held: two actions are in one order when one is reached from the other. Where any two naming one nudge cannot be placed, every one of them is "over the count, order unknown" (the cMIP's mechanic, read for the mixed case too).
3. **An act of this cMIP that is invalid** (acks, a count of 0, malformed) is no nudge or pick: an action naming only such an act is no action of this cMIP.
4. **A text act naming no cause is read against its signer's terms** (draft 3, item 8a; decided by Nobody, allegedly, "it should not exist without a nudge"; draft 2's reading here, "no action of this cMIP", is withdrawn). Read under the latest terms version that does not lie after it in the agent's sequence, followed from the one first version held; unknown where that cannot be told (two first versions, the first not held, a fork); nothing said where the verifier holds no terms of the signer, where the act was signed before them, or where it is private and addressed to no one.
5. **The spec hash stays draft 2's test value:** draft 3 changes no act and no format, and the terms Machine, allegedly published under draft 2 read the same.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../nudge
npm install
npm test
```

`test/nudge.test.ts`: scenarios N1 to N13, the draft 2 additions (N3 to N3d, N4b to N4d, N9b, N11's count of 0) and draft 3's (N3b, N4d, N7 and N11 rewritten; N3e, N3f and `maySign`, N3g), each act signed by a test identity through the core library, offline; the terms in plain words; the payloads read back exactly. Delivery to inboxes, and the desk acting on nudges and picks, are tested in `clients/desk/test/machine.test.ts`; Edubba's several agents, each under its own terms, its prompt box (the owner's private message, answered freely) and a nudge answering a post of its feed, in `clients/desk/test/edubba.test.ts`.
