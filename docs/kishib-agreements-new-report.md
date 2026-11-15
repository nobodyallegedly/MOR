# Kišib and the new Agreements acts: report

*15 November 2026, second edition. Dubsar Suite, a build session for the suite lead, branch `claude/kishib-agreements-new` (pull request 180, now against `claude/agreements-verifier-2`, pull request 184, on pull request 183; none merged). The first edition (14 November) was written on draft 24 and encoding 1; this one replaces it, and section 5 says what changed. A record of work, not a decision. Test identities only; no server address, key or signing words in the repository.*

**The wish** (Nobody, allegedly): "After the cBOX Dubsar and the companies build atop to see where it snaps." On this step: "Agreed on Kišib" (Kišib must sign the new acts from the round's first window), before the round starts. The MOR lead, on moving it: "Kišib (pull request 180) still needs moving to encoding 2."

## 1. In plain words

**What Kišib does now.** It can write, check and sign the three new acts of Agreements written from scratch, in draft 25's bytes (encoding 2): **Terms** (a resolving update of Terms among them), a **Statement** (an assent, a counter signature, a contest, a **resolve** of a fork in the signer's own line, or a kind a cMIP defines), and a **report** (a proposal of the report block, proposal 4, not yet in any spec). Acts under encoding 1's spec hashes are not acts of encoding 2: Kišib no longer treats them as agreements acts. Two ways in:

- **An app, through Kišib's runner.** The app sends the act's fields (or its payload) with the identity, line and position, as for any act it asks Kišib to sign. An agreements act always asks: there is no standing yes for it.
- **The person, on the command line**: `mor-kishib agreements sign terms FIELDS.json --id … --home …`, the signing key's words typed on the first line (never shown on the screen, used for this one act, then overwritten), then "sign".

Either way, Kišib writes the bytes with the core library's own builder, signs a **draft with a throwaway key, never the identity's**, and runs the core library's checker on that draft. **What does not pass is refused, the rule named, and nothing is signed.** What passes is shown and signed with the identity's own key only once the person says so; the signed act is checked again before it leaves Kišib.

**Beside every verdict:** a pass means only that the bytes are well formed and signed; the grammar's answers (in force, fork, who receives, late, the baker's rights) are the grammar verifier's, which rests for now on stub cMIPs and stand-in layers.

**Before a Terms act, an assent or a resolve**, Kišib says that no terms-reading cMIP for draft 25 exists, shows the Terms as written, then **asks the read-only grammar verifier the answers that matter to the signer** (are these Terms in force once you sign, are you bound by them, what a resolve resolves), each with its word, rule and qualifier and the warning that they are provisional, and then shows what draft 25 itself says a person can do whatever Terms say, by rule number. Draft 25 has no list of what a person can always do, and it gives **no way to leave Terms once they are in force**; it says so itself in a stated cost, "No default way out" (section 7). The screen says both (finding 1).

**What it does not do.** It reads no cMIP named in a socket (the verifier answers only for its stub cMIPs; any other gives unchecked); it does not fetch the words a Terms act names, nor the Terms an assent names: it shows them where the app or the person hands them, and says plainly where it cannot. One place falls short of the decided client rule, said on the screen: an assent whose Terms Kišib was not handed (finding 4).

## 2. Precisely: what was built

All in `clients/kishib/`; nothing in `spec/`, `core/`, `wasm/` or `relay/` changed.

- `src/agreements.ts`. `NEW_SPECS` from the binding's `agreementsNewSpecs` (Terms: `dd90f8af…3b2c`, type 0; Statement: the same, type 1; report: `7b65c60f…7d8e3d7854`, type 0). `build`: the binding's `agreementsNewTermsPayload`, `agreementsNewStatementPayload` (kind `"resolve"` among its words), `agreementsNewReportPayload` (in JSON, a socket's `params` and a Statement's `content` are their CBOR in hex); a builder's refusal is said with the rule it names ("Kišib could not build this Terms act: E19: …"). `check`: `agreementsNewCheck`, or `agreementsNewCheckHeld` with the acts held before. `precheck` and `precheckDraft`: the draft made by `makeEveryday` with a fresh throwaway signing secret (overwritten at once), then checked with the acts held; refused unless the verdict is pass. `postcheck`: the identity's own act, checked again; refused and not given out unless it passes. `grammarLines`: the binding's `agreementsNewAsk` over the acts handed and the draft: `in_force` and `bound` (the signer, the Terms) for Terms and an assent, `resolution` for a resolve, each answer said with its word, rule, qualifier, whether disputed and the cMIP named, under `GRAMMAR_SAY`. `screen`, `termsFields` (the receiver in encoding 2's two forms, `[0, position]` and `[2, root]`; a resolving update with no draft-25 defaults, since it carries none), `statementFields` (the resolve, kind 3), `reportFields`.
- `src/runner-read.ts`, `src/runner.ts`. An act under either new spec hash, whatever its type, is of the kind **agreements** (always asks). `readRequest` takes `agreements: { act, input }` (Kišib builds the payload; a spec, type or payload beside it must be the act's own), `held: [{ act, key? }]` (base64, at most 64) and `termsWords`. `ask` runs the check right after the outright refusals, before the key check, and puts the screen's lines first in the panel and in Waiting. `sign` runs `postcheck` before anything is listed in Signed or returned. `requestPrint` covers the held acts and the words, appended only where given.
- `src/agreements-cli.ts`, `src/cli.ts`: `mor-kishib agreements specs | build | check | sign`, as before; the screen is the runner's, the grammar's lines included.
- `README.md`: the section "The new Agreements acts", moved to draft 25.
- **Not in the web client.** The web client's code (`src/kishib.ts`, `src/ops.ts`, `src/page/`, `src/web/`) is unchanged.

**Tests** (`test/agreements-new.test.ts`, on encoding 2's vectors; run here against real homes and a relay):

- **Every valid vector** (44): its payload signed again through the runner by a test identity Kišib holds, answered "Sign it" in Kišib's page, passes the checker with exactly the vector's notes. Encoding 2's vectors are chained (several acts per case, each in its signer's sequence): the earlier acts of the same signer are signed first; the later payloads name the new ids where they named the old, and their sets (E18) are sorted again, as a writer would write them; another signer's act, an act that is rejected, and a private act held without its key, are held as the vector holds them.
- **Every invalid vector** (116): Kišib's check gives the vector's verdict and rule. For the 104 whose failure is something an app hands Kišib (its spec, type, payload, objects, acks, the acts held), the runner, asked to sign it, refuses naming that rule; nothing is signed or left waiting. The 12 others fail in the bytes alone, which Kišib never writes: they are checked only. Each is also checked by the command line, which answers its verdict and rule and exits 1.
- **Round trip through the runner's JSON door**: Terms by their fields with their words; the grammar's lines (in force: not shown, G4.1, as shown; bound: not shown, G5.1) before what a person can always do; an assent with the Terms held, and the grammar asked of those Terms; an assent without them (said: cannot show them); a **resolve** by its fields, and the grammar asked what it resolves; a resolve with content refused by the builder (E20); a report; refused by the builder (E19), by the check (G4.2), and the same payload sent raw; no standing yes for agreements.
- **Round trip through the command line**: Terms signed from the words on standard input (never written out), the grammar's lines shown; declined, nothing signed; the chain key's words refused; refused before any word is read (E19) and by the check (G3.1).

Run here: the new file and the runner's other tests (`runner.test.ts`, `runner-draft-2`, `-draft-5`, `-lines`, `-needs`): 17 of 17 pass. `web-build.test.ts` needs Kišib's own WebAssembly for Nakišib, which needs the wasm32 target this sandbox lacks; CI runs it.

## 3. How the built folders were made

The sandbox has no wasm32 target, so neither the core library's WebAssembly (`clients/genesis/wasm`) nor Kišib's release can be built here. The scratch branch `claude/kishib-agreements-new-scratch` (never to be merged) was set again on `claude/agreements-verifier-2`, with its one workflow (`.github/workflows/scratch-kishib-agreements-new.yml`): on each push, with the release workflows' pinned tools (Rust 1.97.0, wasm-bindgen 0.2.129, Node 22, as `BUILT-WITH.txt` names them), it runs `npm run wasm` in `clients/genesis`, `npm run release` and `npm run test:build` in `clients/kishib`, and pushes `clients/genesis/wasm` and `clients/kishib/built` back to the scratch branch.

- Run 1 (from `66fdc5ab`, the verifier branch and the workflow): built and pushed as `e69f770b`. Its binding was used here, uncommitted, to run the tests. Its `clients/kishib/built` (the new shared WebAssembly, `mor_wasm_bg.wasm`, Kišib's own `kishib_airgap_bg.wasm`, and `BUILT-WITH.txt`; the page, script and style unchanged) was copied into this branch as built, in a commit of its own. Nothing was edited by hand. The first edition's release commit (encoding 1's binding) was dropped from the branch when it moved.
- Run 2 (this branch merged into the scratch branch, `5b74d352`): built and checked again on GitHub (`npm run release`, then `npm run test:build`, both passing), and nothing to push: this branch's code gives, byte for byte, the release committed here.

The web client does not use the new acts. Its release changes only because the shared WebAssembly changed.

## 4. What the screen shows before a Terms signature

For a Terms act naming two signers, its words given and matching the fingerprint, as Kišib shows it (in the runner's panel, in Waiting, and on the command line):

> A Terms act of Agreements draft 25 (encoding 2; spec dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c, type 0): stating Terms, and signing them as their writer.
>
> Checked before signing, as signed by a throwaway key, never this identity’s: PASS: a Terms act of this encoding: its shape, fields and signature pass (the signature verifies with the key the act carries; that the key is its signer's is the identity chain's to show, and is not checked here).
>
> A pass means only that the bytes are well formed and signed. It gives none of the grammar’s answers: whether Terms are in force, whether two acts are a fork, who receives, whether an act is late, or the baker’s rights. Those are the grammar verifier’s, which rests for now on stub cMIPs and stand-in layers: provisional.
>
> No terms-reading cMIP for Agreements draft 25 exists yet: this is the text as written, not a reading of it:
>
> parties: 0. a signer, 0101…0101; 1. a signer, 0202…0202
>
> authors: party 0
>
> body: the words 53da45a6…cb3d, read as the cMIP 0404…0404, with parameters none (null) says (task K1)
>
> The words, as given to Kišib, matching that fingerprint: “Each of us gives the other a test loaf; nothing real is owed.”
>
> previous: none: the signer’s first act in this agreement
>
> in_force: not written. Draft 25’s default: in force once there is an assent in the name of every party named as a signer (G4.1).
>
> condition: not written. Draft 25’s default: an update is valid when everyone who signed the original signs it (G4.11(e)).
>
> powers: none written: no act made in another’s name under these Terms binds that other (G5.1(b)).
>
> Read by the grammar verifier (read-only), from the acts Kišib was handed and this act as signed by the throwaway key, as they would stand once you sign. Its sockets are answered by stub cMIPs for tests only (any other cMIP gives unchecked, G9), and places, the envelope’s chain and Money are stand-ins: every answer here is provisional.
>
> Whether these Terms are in force once you sign them (in_force): NOT SHOWN, G4.1, as shown: not in force: by the default of G4.1, an assent in the name of every party named as a signer; none is counted for 010101010101, 020202020202.
>
> Whether you are bound by them once you sign (bound): NOT SHOWN, G5.1, no qualifier: 010101010101 is not shown bound by these Terms: no assent in their name is counted, and no update condition of Terms that bind them answers valid for them.
>
> What you can always do: Agreements draft 25 has no list of it. These are its grammar rules that hold whatever these Terms say:
>
> You are bound by an act only if you signed it in your own name; or it was made for you under a power in Terms you are bound by, and that power’s rule says yes; or it is an update that the update condition of Terms you are bound by answers valid (G5.1). An act with no “for” and no “under” is made in its signer’s name only (G5.3).
>
> An assent binds you only while the Terms it names are in force (G4.3).
>
> Until the Terms are in force, you can cancel your assent with a counter signature (G4.10). Once they are in force, a counter signature changes nothing.
>
> Against an offer or a vow (Terms that name a party by role), you can make a contest: it reaches their signers and stands on the record; it moves no money (G11.8; section 7).
>
> A delegator can end a delegation at any time, by default: only where its Terms name no update condition and state no condition on ending it (G5.5).
>
> What draft 25 does not give you: a way to leave Terms once they are in force. An agreement never ends (G4.9); by default an update needs everyone who signed the original (G4.11(e)); a party can leave alone only where the Terms’ update condition answers valid for that (section 5.2, task K4), and Kišib reads no update condition. Draft 25 says so itself: “No default way out” (section 7).

(The fingerprints are whole on the screen; the panel shows each short, a tap showing it whole. Where the words were not given: "The words are named by their fingerprint only: Kišib was not given them, and cannot show them. Read them before you sign." Before a resolve: "A resolve: a resolving update in your own line. Of the fork of your acts in this agreement, the tip it names in “continues” goes on, the others are set aside (G12.3). The tip that continues counts as your act; Kišib does not read what it binds you to.", its fields, the grammar's answer to what it resolves, and the same block.)

## 5. What changed on the screen since the first edition

- **The spec hashes**: draft 25's and the report block's fourth proposal's; every "draft 24" is "draft 25", "encoding 1" is "encoding 2", "proposal 3" is "proposal 4".
- **New: the grammar's answers**, between the Terms as written and what a person can always do, with the warning that they are provisional.
- **What a pass means**: "No verifier of those exists yet" became "Those are the grammar verifier’s, which rests for now on stub cMIPs and stand-in layers: provisional", since one now exists.
- **The way out**: the last line now also cites draft 25's own stated cost, "No default way out" (section 7). It was already in draft 24 (its section 7); the first edition missed it.
- **The receiver** read in encoding 2's two forms; **a resolve** said for what it is, and a **resolving update of Terms** said as one, with no defaults listed, since it carries none.
- **Re-checked against draft 25's rule numbers**: G4.1, G4.3, G4.9, G4.10, G4.11(e), G5.1, G5.3, G5.5, section 5.2's row and section 7 read the same in draft 25 as in draft 24; G11.8 changed only in what a buyer's contest names (the settlement, never the payment), which the screen's line does not say.

## 6. Findings against the texts

Each is a record of work, this session's, for the suite lead to take to the MOR lead or to Nobody, allegedly. None was worked around in silence: each is said on Kišib's screen where it touches the person.

1. **Draft 25 has no "what the person can always do".** The client rule decided on 11 November names "what the person can always do" (F441, gate 1, which pointed at the earlier Agreements' rule 98, the way out). Draft 25 has no such rule. What holds there whatever Terms say is protective (G5.1, G5.3, G4.3) or limited (G4.10 only until the Terms are in force; G11.8 only against an offer or a vow; G5.5 only by default). And it gives **no way to leave Terms once they are in force**, which it says itself ("No default way out", section 7: "The way out is designed in advance or not at all"). Kišib says exactly that, and does not invent a guarantee. Under the project's rule that the way out must be right, this is the largest gap the build met: the client duty points at a guarantee the new text chose not to hold.
2. **Which signatures "bind a person to terms" is not said in draft 25's words.** "Stating Terms is not agreeing to them" (section 2), and the grammar verifier now confirms it on the screen: the writer of Terms is not shown bound by signing them alone (G5.1); their own assent, naming the Terms act in `previous`, is what binds. Kišib still shows the screen before a Terms act (the lean), and before an assent, a resolve and a kind a cMIP defines. Open: before which acts the duty is owed.
3. **The words of Terms are only a fingerprint in their bytes** (encoding 2, E5 and E8). Kišib shows the words only where the app or the person hands them and they match. It does not refuse to sign without them: no app of the round hands words yet, and refusing would block every Terms signature on day one. *This session's lean:* refuse once the apps hand the words.
4. **An assent whose Terms Kišib is not handed** can be signed after the screen says: "… Kišib does not hold these Terms: it cannot show them. Signing binds you to Terms not shown here. Ask the app to hand Kišib those Terms, or decline." **This is the one case where Kišib does not meet the decided client rule.** It is kept so that every valid vector signs (their assents name Terms the case may not hold); refusing is one line in `screen`, for the suite lead or Nobody, allegedly, to choose.
5. **An act for a collective is not read where the runner reads it** (against the suite's own runner cMIP, drafts 5 and 6, section 5.5; not against draft 25). The runner reads `objects`; encoding 2 forbids them (E3), and the new acts name the agreement in `for`. Nothing is lost for the person (agreements always ask; the screen shows `for`, `under` and the G5.1(b) line); the runner cMIP's next draft should read `for`.
6. **The check before signing relies on E1's present reading** (the signature verified with the key the act carries). That lets Kišib check a draft signed with a throwaway key. If a later checker verified the key against the signer's chain, Kišib would sign with the identity's key and withhold the act until it passes. A dependency, stated.
7. **The grammar's answers are about the draft, not the act signed.** The draft and the signed act have different ids (the signature, salts and nonces differ). The answers are the same for both, since no act held names either; the screen says they are provisional. An app that hands Kišib acts naming the draft's id cannot exist, so this holds.
8. **A report's one leg is not in its bytes** (the block's R3; encoding 2's report carries no addressee). Kišib signs a report addressed as the app asks, and cannot tell whether that is the other side of the leg.

## 7. Requests for the MOR lead

Nothing in `wasm/` was changed; the binding had everything needed. Three requests, none blocking:

1. **A reader in the binding**: a payload back to the builder's own input form, so every client shows the same fields as written. Kišib reads the payload's CBOR itself by encoding 2's numbering, which would drift silently if the numbering changed.
2. **Structured refusals from the builders** (`{ rule, says }`, as the checker and the verifier answer), instead of "E19: …", which Kišib parses.
3. **Rebuilding on change.** Kišib's release carries the shared WebAssembly; each later change to the binding needs Kišib's release built again on GitHub.

## 8. State

- Pull request **180**, a draft, now against `claude/agreements-verifier-2`, marked not to merge until Nobody, allegedly, says so. Nothing merged by this session.
- CI: in the pull request's comments, once it finished.
- The scratch branch `claude/kishib-agreements-new-scratch` exists only to build; never to be merged.
