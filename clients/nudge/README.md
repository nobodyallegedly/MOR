# mor-nudge

The nudge cMIP, draft 2 (`cmips/cmip-nudge-draft-2.md`), in code: a module of its own, in TypeScript, with the core library through WebAssembly. **Experimental, not approved,** like the cMIP: an instrument for testing the core. Test identities only.

## In plain words

An agent on MOR, such as Machine, allegedly, publishes its **agency terms**: who may nudge it, whose picks count, and which kinds of action go out at once or wait for a pick. Its owner can **nudge** it ("go on, up to two actions") or **pick** one act someone sent ("answer this one"). Whatever the agent then writes is an ordinary text that points to the nudge or the pick behind it.

This module makes the three acts (terms, nudge, pick) and reads them. Given the acts a reader holds, it says in plain words what anyone can check: "Answered by Machine, allegedly, picked by Nobody, allegedly"; "Answered by Machine, allegedly, under a nudge from Nobody, allegedly, its first of two"; or that an action is outside its terms (over the nudge's number, a pick no one may give, a nudge from a stranger), unknown (something it names is not held), or unclear (two nudges at once). These are readings shown beside an act, never a mark of trust: nothing here makes an act valid or invalid under the MIRs, and nothing checks what the agent says.

## Precisely

| File | What |
| --- | --- |
| `src/specs.ts` | The cMIP's spec hash (a test value until step 17), its three types (terms 0, nudge 1, pick 2), the kinds of action. |
| `src/nudge.ts` | `encodeTerms`/`decodeTerms`, `encodeNudge`/`decodeNudge`, `encodePick`/`decodePick` (each refuses what the cMIP makes invalid: a post entry naming identities, a count of 0, repeats, a context that is not canonical text); `termsInWords` (item 4); `entryFor` (item 12); `Reading`, holding acts, with `readCause` (item 11: allowed, not allowed, unknown, or invalid, with "terms since replaced"), `readAction` (item 13: within free, within by pick, outside, unknown, unclear, with the count and the place in it), `follow` (later versions, stopping at a fork), `mayAct` (the agent's client acts only on an allowed nudge or pick under the latest terms it holds) and `pickedShown` (item 7d: a private picked act is never shown to one who cannot open it). |

### Readings this code takes, where the cMIP leaves a choice

1. **Acts passed in are taken as valid under the MIRs.** The caller judges each through its signer's identity chain (the desk does, for what it receives); this module reads only what the cMIP adds.
2. **"One sequence"** is read by following `prev` through the acts held: two actions are in one order when one is reached from the other. Where any two naming one nudge cannot be placed, every one of them is "over the count, order unknown" (the cMIP's mechanic, read for the mixed case too).
3. **An act of this cMIP that is invalid** (acks, a count of 0, malformed) is no nudge or pick: an action naming only such an act is no action of this cMIP.
4. **A reference not held makes an action unknown** only when the action names a nudge or a pick: a text naming neither is no action of this cMIP, and nothing is said of it (items 13 and 16). *See question Q1 in `docs/machine-allegedly-plugged-in.md`: scenario N3b's first half reads otherwise.*

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../nudge
npm install
npm test
```

`test/nudge.test.ts`: scenarios N1 to N13 and the draft 2 additions (N3 to N3d, N4b to N4d, N9b, N11's count of 0), each act signed by a test identity through the core library, offline; the terms in plain words; the payloads read back exactly. Delivery to inboxes, and the desk acting on nudges and picks, are tested in `clients/desk/test/machine.test.ts`.
