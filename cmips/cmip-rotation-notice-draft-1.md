# cMIP: Dubsar Rotation Notice

*Draft 1, 28 October 2026, written by the Dubsar Suite session of fix round 7 (`docs/fixes-r7-report.md`), for **F403**, for Nobody, allegedly, to approve. A Dubsar cMIP: the Suite lead's, not core.*

***Approved.*** *"Approved and tests will refine them", Nobody, allegedly, 29 October 2026.*

***Proposed by Nobody, allegedly, hand test v3, H97*** *(walking a member change, at the step where a member gives a paper share: "waiting for you could be prefilled via a custom cMIP private message"), and* ***settled*** *("Ah, true. We made kišib amnesiac… well kišib computer can have it if the runner is setup."; "Kišib web really should not be used anyway. It's for demo and testing purpose"): the starter's message gains a structured part (the collective, the rotation's fingerprint, the relays holding the request, the expiry, the member's share number), the free text kept for any client without it; Kišib reads the member's inbox and lists each rotation waiting, prefilled; on the Mac with the runner on and holding the member, at once; on the web, and on the Mac without the runner, after the member's words. The rotation is still checked against the collective's chain, never believed from the message.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Agreements MIR draft 17 (the negotiation message, type 18, its payload's key 1 naming a text format as a text act may), the Text MIR draft 11 (a text format; plain text always available) and the Identity MIR draft 15 (a collective's change of keys). It fills the Text MIR's format task for one use and adds no act type: **a text format**, named in key 1 of a negotiation message's payload. Its hash stays a draft hash until its creator is named at step 17 (its test value: the SHA-256 of "Rotation notice cMIP, draft 1, test value until publication"). Its code: `clients/kishib/src/collective.ts` (written by the starter's Kišib, read by the member's).

*Reading this document: normal text is the specification. Italic text is commentary. Choices the proposal did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*When a collective changes its members, the member who starts the change leaves a request at the collective's relays and tells each other member in a message. Until now that message was only words: the member copied the collective's ID and a long fingerprint by hand into Kišib. With this cMIP the same message carries those values in a fixed form at its end, which Kišib reads: the rotation waiting for you is listed under Waiting for you, already filled in; you tap it, read the rotation (which Kišib checks against the collective's own chain, never trusting the message), and type only your share's words and your signing words. A client without this cMIP still shows the whole message as words, the values included.*

## 1. The notice

1.1. **A rotation notice is a negotiation message** (Agreements, type 18), in the thread of the member's proposal as today, signed by the member starting the rotation, sealed to the member told, whose payload names **this cMIP's hash as its format** (key 1). Its text (key 0) is canonical text (Text MIR) in two parts:

- **the free text**, first, as today, in plain words, for any reader;
- **the structured part**, last: a line holding exactly `-- Dubsar rotation notice, draft 1 --`, then one line per field, `name: value`, in this order, each once:

| Field | Value |
| --- | --- |
| `collective` | the collective's identity, 64 lowercase hexadecimal characters |
| `fingerprint` | the rotation request's fingerprint, 64 lowercase hexadecimal characters, as Kišib computes it today |
| `relays` | the relays holding the request, each an `https://` (or, for tests, `http://`) address, separated by one space; at least one, at most eight **(mechanic, this draft's)** |
| `expires` | when the request expires, whole seconds since 1970 (UTC) |
| `share` | the number of the paper share this member holds, as written on it (1 to 255) |

1.2. **Nothing follows** the structured part. A text whose last block is not exactly this form is read as free text only: the notice is then shown as words, never half-read. *Plain text always available (Text rules 3 to 6): a client without this cMIP shows the message as it shows any negotiation message, the values readable in it.*

## 2. Reading it

2.1. **Where.** The member's Kišib reads the member's inbox (the Agreements inbox the member's identity declares) for negotiation messages in this format, sealed to the member. **On the Mac with the runner on and holding the member**, at once (the runner holds the member's key and opens for Kišib itself); **elsewhere** (the web, or the Mac without the runner), only after the member's signing words are typed, Kišib holding nothing before. *Settled: "well kišib computer can have it if the runner is setup".*

2.2. **Listed, prefilled.** Each notice whose `expires` is in the future and whose sender is a member of the collective named is listed under **Waiting for you**: the collective, by name where known, the fingerprint short (a tap shows it whole), when it expires, the share number. Tapping one fills in the collective and the fingerprint.

2.3. **Never believed.** The rotation itself is read from the request at the relays named (and the collective's homes), **checked against the collective's chain and the fingerprint** exactly as when typed by hand; a notice whose request is not found, or does not match, is said so, and nothing is signed. The member still types their **share's words** and **signing words**. *The message only saves copying; everything that matters is checked as before.*

2.4. **Typed by hand still works.** A member may always give the collective and the fingerprint by hand, as today.

## 3. Costs, stated

- The inbox's relays see that a private act arrived, roughly how big, and when; never its text.
- Whoever holds the member's signing words reads the notice. It carries the share's **number**, never a share.
- A wrong or forged notice costs a look: the rotation is checked against the collective's chain before anything is signed (2.3).

## 4. Tests

`clients/kishib/test/rotation-notice.test.ts`: a rotation started by one member; the other member's Kišib on the Mac with the runner on and holding the member lists it under Waiting for you, prefilled, at once; on the web, after the words; the rotation read and checked as by hand; a notice whose fingerprint does not match the request refused, said, nothing signed; a notice with its structured part spoiled read as free text only; a client without the cMIP (a plain reading) showing the whole text.
