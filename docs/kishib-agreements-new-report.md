# Kišib and the new Agreements acts: report

*14 November 2026. Dubsar Suite, a build session for the suite lead, branch `claude/kishib-agreements-new` (pull request 180, against `claude/agreements-encoding-1-nwgiyk`, pull request 179, itself on draft 24, pull request 178; none merged). A record of work, not a decision. Test identities only; no server address, key or signing words in the repository.*

**The wish** (Nobody, allegedly): "After the cBOX Dubsar and the companies build atop to see where it snaps." On this step: "Agreed on Kišib" (Kišib must sign the new acts from the round's first window), before the round starts.

## 1. In plain words

**What Kišib does now.** It can write, check and sign the three new acts of Agreements written from scratch: **Terms**, a **Statement** (an assent, a counter signature, a contest, or a kind a cMIP defines), and a **report** (a proposal of the report block, not yet in any spec). Two ways in:

- **An app, through Kišib's runner.** The app sends the act's fields (or its payload) with the identity, line and position, as for any act it asks Kišib to sign. An agreements act always asks: there is no standing yes for it.
- **The person, on the command line**: `mor-kishib agreements sign terms FIELDS.json --id … --home …`, the signing key's words typed on the first line (never shown on the screen, used for this one act, then overwritten), then "sign".

Either way, Kišib writes the bytes with the core library's own builder, signs a **draft with a throwaway key, never the identity's**, and runs the core library's checker on that draft. **What does not pass is refused, the rule named, and nothing is signed.** What passes is shown and signed with the identity's own key only once the person says so; the signed act is checked again before it leaves Kišib.

**What Kišib says beside every verdict:** a pass means only that the bytes are well formed and signed. It gives none of the grammar's answers: in force, fork, who receives, late, the baker's rights.

**Before a Terms act or an assent**, Kišib says that no terms-reading cMIP for draft 24 exists, shows the Terms as written, and shows what draft 24 itself says a person can do whatever Terms say, by rule number. Draft 24 has no list of what a person can always do, and it gives **no way to leave Terms once they are in force**: the screen says both (section 4, finding 1).

**What it does not do.** It reads no grammar answer (none exists yet); it reads no cMIP named in a socket; it does not fetch the words a Terms act names, nor the Terms an assent names: it shows them where the app or the person hands them, and says plainly where it cannot. One place falls short of the decided client rule, said on the screen: an assent whose Terms Kišib was not handed (finding 4).

## 2. Precisely: what was built

All in `clients/kishib/`; nothing in `spec/`, `core/`, `wasm/` or `relay/` changed.

- `src/agreements.ts` (new). `NEW_SPECS` from the binding's `agreementsNewSpecs` (Terms: `af5e41f9…0439`, type 0; Statement: the same, type 1; report: `99a3b2d6…6d78`, type 0). `build`: the binding's `agreementsNewTermsPayload`, `agreementsNewStatementPayload`, `agreementsNewReportPayload` (in JSON, a socket's `params` and a Statement's `content` are their CBOR in hex); a builder's refusal is said with the rule it names ("Kišib could not build this Terms act: E19: …"). `check`: `agreementsNewCheck`, or `agreementsNewCheckHeld` with the acts held before. `precheck`: the draft made by `makeEveryday` with a fresh throwaway signing secret (overwritten at once), then checked with the acts held; refused unless the verdict is pass ("Kišib checked this act before signing, and it does not pass: INVALID, G4.2: … Kišib signs only what passes. Nothing was signed."). `postcheck`: the identity's own act, checked again; refused and not given out unless it passes. `screen`, `termsFields`, `statementFields`, `reportFields`: what is shown, the fields read from the payload by encoding 1's numbering.
- `src/runner-read.ts`, `src/runner.ts`. An act under either new spec hash, whatever its type, is of the kind **agreements** (always asks, `ALWAYS_ASKS`). `readRequest` takes `agreements: { act, input }` (Kišib builds the payload; a spec, type or payload beside it must be the act's own), `held: [{ act, key? }]` (base64, at most 64: the acts before it in its line, the Terms an assent agrees to) and `termsWords`. `ask` runs `precheck` right after the outright refusals, before the key check, and puts the screen's lines first in the panel and in Waiting. `sign` runs `postcheck` before anything is listed in Signed or returned. `requestPrint` also covers the held acts and the words, appended only where given, so every other request's fingerprint is unchanged.
- `src/agreements-cli.ts` (new), `src/cli.ts`: `mor-kishib agreements specs | build ACT FIELDS.json | check ACT.hex [--key HEX] [--held ACT.hex[,KEY]] | sign ACT FIELDS.json --id ID --home URL [--sequence ID,ID] [--private] [--to ID,ID] [--held …] [--words FILE] [--out FILE]`. `sign` builds first (a payload the encoding would reject is refused before any word is read), reads the words from standard input (hidden at a terminal; a `morsk1` string taken too), checks them against the key the homes serve (`lookCurrent`; a chain key's words refused), prechecks, shows the screen, asks "Type “sign” to sign it…; anything else declines" (nothing preselected), signs with `makeEveryday`, postchecks and writes the act in hex (and its content key where private). Kišib sends it nowhere and writes nothing to its folder.
- `README.md`: a section "The new Agreements acts", plain words then precisely, and the test's line.
- **Not in the web client.** The runner and the command line are the program's only. The web client's code (`src/kishib.ts`, `src/ops.ts`, `src/page/`, `src/web/`) is unchanged.

**Tests** (`test/agreements-new.test.ts`; run here against real homes and a relay):

- **Every valid vector** (34): its payload signed again through the runner by a test identity Kišib holds, answered "Sign it" in Kišib's page, passes the checker with exactly the vector's notes. For the cases holding several acts, the earlier acts of the same signer are signed first and the later payloads name the new ids where they named the old; another signer's act, an act that is rejected, and a private act held without its key, are held as the vector holds them.
- **Every invalid vector** (99): Kišib's check gives the vector's verdict and rule. For the 87 whose failure is something an app hands Kišib (its spec, type, payload, objects, acks, the acts held), the runner, asked to sign it, refuses naming that rule; nothing is signed or left waiting. The 12 others fail in the bytes alone, which Kišib never writes (not CBOR, not the act's shape, the lock or commitment changed, a private act with no key, another specification, no signer, a signature that does not verify or of a scheme not implemented, `prev` absent or of two): they are checked only. Each is also checked by the command line, which answers its verdict and rule and exits 1.
- **Round trip through the runner's JSON door** (`/runner/ask`, `/runner/answer`, by HTTP with the app's token): Terms by their fields with their words, an assent with the Terms held, an assent without them (said: cannot show them), a report; the screen in Waiting and in the panel's HTML; refused by the builder (E19), by the check (G4.2), and the same payload sent raw refused too; no standing yes for agreements.
- **Round trip through the command line**: Terms signed from the words on standard input (the words never written out), the act passing and signed by the identity; declined with an empty answer, nothing signed; the chain key's words refused; refused by the builder before any word is read (E19), and by the check (G3.1).

Run here: the new file and the runner's other tests (`runner.test.ts`, `runner-draft-2`, `-draft-5`, `-lines`, `-needs`) pass, 21 of 22; `web-build.test.ts`'s second test cannot run here (Kišib's own WebAssembly for Nakišib needs the wasm32 target this sandbox lacks); CI runs it.

## 3. How the built folders were made

The sandbox has no wasm32 target and cannot fetch one, so neither the core library's WebAssembly (`clients/genesis/wasm`, which Kišib's program loads) nor Kišib's release can be built here. As earlier sessions did, a **scratch branch**, `claude/kishib-agreements-new-scratch` (never to be merged), carries one workflow, `.github/workflows/scratch-kishib-agreements-new.yml`, run on each push to it, with the release workflows' pinned tools (Rust 1.97.0, wasm-bindgen 0.2.129, Node 22, as `BUILT-WITH.txt` names them): it runs `npm run wasm` in `clients/genesis`, `npm run release` and `npm run test:build` in `clients/kishib`, and pushes `clients/genesis/wasm` and `clients/kishib/built` back to the scratch branch.

- Run 1 (from `6d05b241`, the base branch and the workflow): built and pushed as `36e7a7b6`. The binding it built was used here, uncommitted, to run the tests. Its `clients/kishib/built` (the new shared WebAssembly, `mor_wasm_bg.wasm`, and Kišib's own, `kishib_airgap_bg.wasm`, and `BUILT-WITH.txt`; `kishib.js`, `kishib.css` and `index.html` unchanged) was copied into this branch as built, in a commit of its own. Nothing was edited by hand.
- Run 2 (this branch merged into the scratch branch, `9c98b237`): built and checked again on GitHub (`npm run release`, then `npm run test:build`, both passing), and nothing to push: this branch's code gives, byte for byte, the release committed here.

The web client does not use the new acts. Its release changes only because the shared WebAssembly changed on the base branch (pull request 179); without it, `npm run test:build` would fail on any branch built on 179.

## 4. What the screen shows before a Terms signature

For a Terms act naming two signers, its words given and matching the fingerprint, as Kišib shows it (in the runner's panel, in Waiting, and on the command line):

> A Terms act of Agreements draft 24 (encoding 1; spec af5e41f9476deff36fb97397815b96293288d190f2fcf9e24d636465eefc0439, type 0): stating Terms, and signing them as their writer.
>
> Checked before signing, as signed by a throwaway key, never this identity’s: PASS: a Terms act of this encoding: its shape, fields and signature pass (the signature verifies with the key the act carries; that the key is its signer's is the identity chain's to show, and is not checked here).
>
> A pass means only that the bytes are well formed and signed. It gives none of the grammar’s answers: whether Terms are in force, whether two acts are a fork, who receives, whether an act is late, or the baker’s rights. No verifier of those exists yet.
>
> No terms-reading cMIP for Agreements draft 24 exists yet: this is the text as written, not a reading of it:
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
> in_force: not written. Draft 24’s default: in force once there is an assent in the name of every party named as a signer (G4.1).
>
> condition: not written. Draft 24’s default: an update is valid when everyone who signed the original signs it (G4.11(e)).
>
> powers: none written: no act made in another’s name under these Terms binds that other (G5.1(b)).
>
> What you can always do: Agreements draft 24 has no list of it. These are its grammar rules that hold whatever these Terms say:
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
> What draft 24 does not give you: a way to leave Terms once they are in force. An agreement never ends (G4.9); by default an update needs everyone who signed the original (G4.11(e)); a party can leave alone only where the Terms’ update condition answers valid for that (section 5.2, task K4), and Kišib reads no update condition.

(The fingerprints are whole on the screen; the panel shows each short, a tap showing it whole. Where the words were not given: "The words are named by their fingerprint only: Kišib was not given them, and cannot show them. Read them before you sign." Before an assent with its Terms handed: "An assent: you agree to the Terms … No terms-reading cMIP for Agreements draft 24 exists yet: this is the text as written, not a reading of it:", the Terms' fields, the Statement's own fields, and the same block.)

## 5. Findings against the texts

Each is a record of work, this session's, for the suite lead to take to the MOR lead or to Nobody, allegedly. None was worked around in silence: each is said on Kišib's screen where it touches the person.

1. **Draft 24 has no "what the person can always do".** The client rule decided on 11 November names "what the person can always do" (F441, gate 1, which pointed at the earlier Agreements' rule 98, the way out). Draft 24 has no such rule. What holds there whatever Terms say is protective (G5.1, G5.3, G4.3) or limited (G4.10 only until the Terms are in force; G11.8 only against an offer or a vow; G5.5 only by default). And it gives **no way to leave Terms once they are in force**: an agreement never ends (G4.9), the default update needs everyone who signed the original (G4.11(e)), and leaving alone is a cMIP's (section 5.2, "A party wants to leave, and the Terms name no way", task K4). Kišib says exactly that on the screen, and does not invent a guarantee. Under the project's rule that the way out must be right, this is the largest gap the build met: the client duty points at a guarantee the new text does not hold.
2. **Which signatures "bind a person to terms" is not said in draft 24's words.** Section 2 says "Stating Terms is not agreeing to them", so the writer of a Terms act is not, by signing it, bound to them; G5.1(a) says a person is bound by an act they signed in their own name. Kišib follows the lean (the screen before Terms and before an assent), and adds a kind a cMIP defines (K7), since it cannot tell whether such a Statement binds. A Statement made for another under a power binds the other (G5.1(b)), not its signer; Kišib shows its `for` and `under` and says it cannot apply the power's rule. Open: before which acts the duty is owed.
3. **The words of Terms are only a fingerprint in their bytes** (encoding 1, E5 and E8; draft 24, G2). "The text as written" of a Terms act is the work hash of its words; nothing in the act says where the words are. Kišib shows the words only where the app or the person hands them and they match (`termsWords`; `--words`); otherwise it says it cannot show them. *Not done, and why:* Kišib does not refuse to sign Terms, or an assent, without their words. No app of the round hands words yet, and a refusal would block every Terms signature on day one. *This session's lean:* refuse once the apps hand the words; it is the suite lead's, or Nobody, allegedly's, to decide.
4. **An assent names its Terms only by fingerprint**, so Kišib can show them only where it is handed them (`held`). Without them, the screen says, before the click: "… Kišib does not hold these Terms: it cannot show them. Signing binds you to Terms not shown here. Ask the app to hand Kišib those Terms, or decline." The person may still sign. **This is the one case where Kišib does not meet the decided client rule**, said on the screen and here. It is kept so because the vectors' assents name stand-in Terms that no one holds, and the task asks that every valid vector signs; refusing such an assent is one line in `src/agreements.ts` (`screen`), for the suite lead or Nobody, allegedly, to choose.
5. **An act for a collective is no longer read where the runner reads it** (against the suite's own runner cMIP, drafts 5 and 6, section 5.5; not against draft 24). The runner finds the collective an act is made for in its `objects`; encoding 1 forbids `objects` (E3), and the new acts name the agreement in whose name they are made in the payload's `for`. So the runner's "For the collective …, signed with …’s own key" line does not appear for them. Nothing is lost for the person: an agreements act always asks, and the screen shows `for` and `under` and the G5.1(b) line. The runner cMIP's next draft should read `for` in the new acts.
6. **The check before signing relies on E1's present reading.** The checker verifies a signature with the key the act carries, and says that whether the key is the signer's is the identity chain's (E1). That is what lets Kišib check a draft signed with a throwaway key, signing nothing with the identity's key before the verdict. If a later checker also verified the key against the signer's chain, Kišib would have to sign with the identity's key and withhold the act until it passes. Not a flaw; a dependency, stated.
7. **A report's one leg is not in its bytes.** The block's R3 says a report goes to the other side of its leg and no one else; encoding 1's report carries no addressee, and the act format's `to` is whatever the app asks. Kišib signs a report public or private, addressed as the app asks, and cannot tell whether that is the other side of the leg. Said here only; the screen says the report is a proposal.

## 6. Requests for the MOR lead

Nothing in `wasm/` was changed; the binding had everything needed to build, check and sign. Three requests, none blocking:

1. **A reader in the binding**: a payload back to the builder's own input form (for example `agreementsNewRead(spec, type, payload)`), so that every client shows the same fields as written. Kišib reads the payload's CBOR itself (`termsFields`, `statementFields`, `reportFields`), by encoding 1's numbering; it would drift silently if the numbering changed.
2. **Structured refusals from the builders** (`{ rule, says }`, as the checker answers), instead of the message "E19: …", which Kišib parses.
3. **Rebuilding on change.** Kišib's release (`clients/kishib/built`) carries the shared WebAssembly; each change to the binding in pull request 179 or after needs Kišib's release built again on GitHub (the scratch workflow above, or the release workflow once merged).

## 7. State

- Pull request **180**, a draft, marked not to merge until Nobody, allegedly, says so. Nothing merged by this session.
- CI on the branch: *see the pull request; recorded below when it finished.*
- The scratch branch `claude/kishib-agreements-new-scratch` exists only to build; never to be merged.
