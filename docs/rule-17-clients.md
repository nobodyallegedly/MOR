# Identity rule 17 in the clients that rotate: stopped before building

*GitHub session, 12 October 2026. Branch `claude/rule-17-clients`, not merged. Nothing built: this report only. The core, the WebAssembly and every client unchanged.*

## In plain words

The settled answer to MOR Post's Q1 is this. Before a key change, the client making it reads every act of the identity from its homes and relays. It finds each line's latest act, shows the lines in plain words, and keeps all of them unless the owner leaves one out on purpose.

To do that, the client has to see how acts chain together: for each act, which act came before it in its line. That fact is written inside every act, and only the core library can open an act. The core library's WebAssembly, the part the clients use, tells a client an act's position in its line (1, 2, 3…) but not which act came before it. No client reads it today. Positions alone cannot separate lines: two apps' lines both have an act at position 1, 2, 3, and so on.

So the job cannot be done as a client-only change with the core and its WebAssembly left byte for byte as they are. I stopped and asked. The answer was to build nothing and to put the choice here (Q1 below).

There is a second limit, which holds whatever is chosen. A private act's inside is locked: only whoever holds its key can read which act came before it. A line that holds a private act made by another app cannot be followed by the rotating client, under any option. Q2 is about that line.

## What was found

| Where | What |
| --- | --- |
| `clients/genesis/src/identity.ts`, `prepareRotation` | The genesis client's rotation. It keeps exactly one line, its own (`this.f.sequence`). Used by its command line (`rotate`) and by tests. |
| `clients/repo/src/collective.ts`, `rotateTo` | The collective's rotation (member changes and rollbacks in the collective client). It too keeps only the rotating device's own line. The collective client already warns about acts it finds at its relays that are not in its own line (`unheard`, `endingGate` in `clients/collective/src/actions.ts`), but only before a record or an ending, not before a rotation, and it does not keep them. |
| `clients/desk/` | Signs no rotation. It shows "an act signed with this identity's key that this desk did not make" (F152) and tells the owner to rotate. It does not show its own line's latest act. |
| `clients/poster/` | Signs no rotation (it holds no chain key). It shows its line's number of acts, latest act and running summary on its card. |
| `wasm/src/lib.rs`, `describeAct` | Reports an act's signer, binding, whether it is public, its spec, type, position, objects, refs and acks. It does **not** report `prev` (the act before it in its line) or `summary`. Both sit inside every act (`core/src/act.rs`, `Inside`, fields 2 and 6). |
| `core/src/chain.rs`, `line` | How a verifier checks a kept tip: it walks `prev` from the tip back to the line's first act, and the running summary of all those ids must match the tip's. |

What a kept tip needs (Identity, rotation field 4): the tip's id, its position, and the running summary *including* the tip. The summary inside an act covers only the acts before it, and a running summary cannot be extended from another summary alone. So the rotating client needs every act id of the line, in order, which means following `prev` from the tip to the start. One `prev` per act is the whole need. The `summary` field is not needed.

## Readings taken

None were put into code. Two shaped the question:

1. **"The core unchanged" covers the WebAssembly too.** The bindings live in `wasm/`, not in the core crate, but their bytes are what the display client ships (`clients/site/built/mor_wasm_bg.wasm`). Earlier sessions kept them byte for byte for that reason (MOR Post, the identity carry Module behind a cargo feature). So adding a field there is not done quietly.
2. **Reading an act's inside in TypeScript is not done quietly either.** It would be possible for public acts: their content key is on the outside, and the lock is XChaCha20-Poly1305. But it would copy a step of the core library into a client ("every act is made and judged by the core library"), and it still could not read private acts.

## Questions for Nobody, allegedly

Both are checked against the working rule, "core business, or the participants' choice". Neither changes a rule. Identity rule 17's sentence on tracking lines is client conformance, and the core already says everything a verifier needs. Q1 is about the tools. Q2 is about a case the tools cannot reach, and what it costs.

**Q1. How does a client read which act comes before another?** *(Area: the core library's WebAssembly, the tool the clients use. No MIP changes.)*

- **(a) Expose it.** The WebAssembly's description of an act also gives `prev`. The Rust core crate and every rule stay as they are. *Cost:* the WebAssembly's bytes change, so the display client needs a release after merge (a `[release display client]` commit, as for F133). What the display client does does not change.
- **(b) Keep the WebAssembly byte for byte.** The clients unlock public acts themselves in TypeScript, with a new cryptography dependency. *Cost:* one step of the core library is copied into the clients, so two pieces of code read acts and could disagree. Private acts stay unreadable.
- **(c) Carry by hand only.** No reading. The owner copies each app's line (latest act, position, summary) to the rotating device. That is option (b) of the earlier Q1, which was not taken. *Cost:* the settled answer is not built.

*Lean: (a). It is a few lines in the bindings and adds nothing to what a verifier decides. The release it needs is routine.*

**Q2. A line holding a private act made by another app.** *(Area: presentation and clients. Not so rare: the genesis client (key deliveries), the collective client, the connector's drafts and the reader's messages sign private acts; MOR Post signs public posts only.)* Whatever Q1's answer, the rotating client cannot follow such a line, because the private act's `prev` is locked. Options:

- **(a) Show it and ask for its card.** The rotating client shows "a line it cannot read, ending at …". Before the rotation it asks for that line's latest act, position and summary, copied from the app that made it (MOR Post's card already shows them). If the owner gives nothing, the line is left out only after the same warning as a line left out on purpose: its acts become void.
- **(b) Refuse to rotate** while such a line is unread. *Cost:* a stolen signing key could block the owner's rotation by signing one private act. That runs against the reason to rotate at all.
- **(c) Leave it as a stated cost:** warn only.

*Lean: (a). It keeps the default "keep every line", and it never lets an unreadable act hold the owner's key change hostage. Because private acts are common, this falls under the working rule that a common case must work safely by default: (c) alone would not.*

## What would be built, once Q1 and Q2 are answered

As settled, with shared code rather than copies:

- **`clients/genesis/src/lines.ts`** (shared). Read every act of the identity from its homes and the relays its routes name. Keep those signed with the current key. Follow `prev` back to each line's start, to get each line's latest act, its position and its running summary, and what that act is, in plain words (a post, routes, a key delivery…). Mark which line is this device's own. Lines that cannot be followed are shown as unreadable (Q2).
- **The genesis client's rotation.** `prepareRotation` takes the lines found. It keeps every line except those the owner leaves out by name. Each left-out line is first warned about: "every act of this line becomes void". A line not made on this device is shown as made elsewhere, never silently kept or dropped. The `rotate` command shows them before signing.
- **The collective's rotation** (`rotateTo`, and the collective client's member change and rollback screens): the same, through the same code.
- **Each app shows its own line's latest act** so the owner can tell their lines from a thief's (F152): MOR Post (already on its card), the desk (new, per identity), and the genesis client (`show`).
- **Tests.** MOR Post's test where a genesis-client rotation voids its line, turned the other way (the line kept). Leaving a line out on purpose warns, then voids it. A line the owner does not recognise is shown, not silently kept or dropped. Every client's tests still pass.

No flaw in a MIP found. The text already says what is needed. What is missing is a tool that lets a client see how acts chain together.

## The tests

`scripts/test-all.sh` on main (`ea7cd5d`), without `--reproducible` or regtest, before anything else: **all passed**. That covers the Rust workspace (634 tests) and every client and Module: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, poster 7, reader 16, repo 18, site 57, jpeg 14, video 6, carry 6. The site's browser test ran in Chromium. A first run stopped at the WebAssembly step because this container lacked `wasm-bindgen-cli` 0.2.129, which the script lists as needed. With it installed, the second run passed. The tree was untouched during both runs.

Nothing was changed, so there is no second run. This branch adds only this report.
