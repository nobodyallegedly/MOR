# mor-collective

The collective client, in TypeScript, with the core library through WebAssembly. Roadmap step 11b: "I will be needing to manage a collective without typing a line of code" (Nobody, allegedly).

**Test identities only.** Every key, every share of a collective's safety key, is held in software in the program's folder. The real identity's keys come through the air-gapped Module and its phone app (step 16b).

## In plain words

A small program runs on your computer and holds your test identities and collectives. You use it from a page in your browser, on that computer only. Double-click **MOR Collective** and the page opens, already paired with the program; nothing is typed in a terminal.

From the page you can:

- make test identities: yourself, and the simulated members a test needs;
- publish a release of the code under your own name, as the first real release will be (step 17);
- found a collective, add and remove members, publish its releases, sign them as a member, and leave;
- check any release by its id, as anyone would;
- see everything you signed.

**Nothing is signed until you have read what it means.** Every action goes in two steps. First the program makes the exact bytes to be signed, then reads them back through the core library and tells you, in plain words, what signing means: who is bound, what each rule does, what changes compared with now, what is released and what changed since the last release. Words of an agreement are shown as plain text, character for character, with any invisible direction control shown as a code, so no clause can read in another order than it is written. Only when you press **Sign** does the program sign, and only those same bytes: if anything changed in between, it refuses and asks you to look again. What cannot be signed (rules Law refuses, a specification this client does not implement, files that differ from your checkout) is said plainly, and the Sign button stays off.

## Precisely

| File | What |
| --- | --- |
| `src/explain.ts` | The plain-words reading: an agreement (founding or clone) from the core library's own decoding of its bytes (`readTerms`, new in `mor-wasm`), what a clone changes against the agreement in force, what a release changes against the one before. The first piece of the deal-assessment tool (step 14). |
| `src/actions.ts` | Every operation: `prepare` makes the exact bytes and their reading, with a digest; `confirm` signs them only with that digest, within 15 minutes, once, and only if no file it depends on changed. A new identity, a release (one's own or a collective's), founding, a member or rules change, a member's signature on a release, verifying. |
| `src/store.ts` | The program's folder (default `~/mor-collective`, owner-only): `book.json` (names, which identity is you, releases under one's own name), `settings.json`, `identities/` and `collectives/` (the genesis and repo clients' own file formats), `history.jsonl`, `access.json`. |
| `src/access.ts` | Pairing and signed requests, as the management page of step 11: a browser key that cannot be read out, a one-time code, each request its exact JSON signed after `"MOR collective client, version 1\n"`, naming this program, the time (five minutes) and a single-use nonce. |
| `src/server.ts` | The program: `127.0.0.1` only, the page (built from `src/page/` at start, not minified) under a content security policy, `/hello`, `/api`, and `/local/code` for the launcher. Requests addressed to any other host name are refused (DNS rebinding). |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link), `run`, `stop`. |
| `src/page/` | The page: requests, the browser's key, the sections and the reviews. |
| `scripts/make-app.sh` | Makes `~/Applications/MOR Collective.app` on macOS, which runs `open`. |

It builds on the repo client (step 5a), which gained, for it: `prepareRelease` and `publishPrepared` (a release made and shown before it is signed, by a collective or by one identity), `proposePayload` and `encodeTerms`, `collectiveTerms`, and member changes that may also rewrite the rules (`changeMembers({ governance })`), each refusing to sign if the terms made now are not the bytes shown (`expect`).

## Readings

Where the texts are silent, the client takes these readings. *To be confirmed by Nobody, allegedly.*

1. **A program on the machine, a page in the browser.** The keys live in files in the program's folder, as the genesis and repo clients keep them; the page holds only its pairing key. *Set aside:* a page alone, with keys in browser storage: clearing a site's data would lose them, and a release reads the files git tracks, which a browser cannot.
2. **Pairing without typing.** As step 11, except that the code is never typed: the launcher asks the running program for one, over a secret in `run.json` that only the owner's account can read, and opens the page at a link carrying it in the fragment, which the browser never sends. A code can also be made on the page for another browser. *Cost, stated:* anything running under the owner's account can read that secret, as it can read the keys themselves.
3. **What you sign is what you saw (Law rule 4a, Text rule 5a).** The reading is made from the exact bytes, as the core library decodes them, never from what was typed into a form; confirming needs the reading's digest; the plan lasts 15 minutes and serves once; it is refused if an identity or collective file it depends on changed after it was shown. Agreements' words are shown as plain text by default, every invisible control of Text rule 5 as an escape.
4. **Fail closed (Law rule 2, Envelope rule 11).** Terms naming a task cMIP, an extension or a time reference this client does not implement, or a split service, cannot be signed here. Terms using a field whose format is still open are not read at all.
5. **Every objection at once.** Law stops at its first objection; the client also checks the numbers against the member count, so every one is listed together, Law's own words beside the one it names.
6. **A clone comes into force by the parent's clone rule** (Law rule 45), so the review says so, and does not describe the clone's own signing rule (terms field 4), which for a clone plays no part. *Question for the texts:* should Law say what field 4 of a clone means, or require it to repeat the parent's?
7. **Simulated consent, said each time.** In a test collective every member is held by this program; every review lists who signs on this device and says their consent is simulated.
8. **Leaving is a member change,** and the members who stay write the rules (After V1: "The act of me leaving forces the rewrite of the rules"). The Leave button fits the numbers to those who stay (a safety key needing fewer than all of them, absence judged by at most all the others) and the review shows each change. *Consequence, stated:* with two members left, F96 allows only "either member alone can rotate", or an escrowed share, which is not supported yet; the review says so in words.
9. **Words and rules.** With no words written, the standard words for the rules are used. If the rules change and the words were standard, they follow; if members wrote their own, they stay, with a warning that they may no longer say what the rules do.
10. **No release while a member change waits:** signed with the old key, it would be void once the change counts (F100).
11. **A member signs a release** only if they are a party to the agreement in force at the release's binding, have not signed it yet, and every file matches their checkout (repo client reading 17). The checkout defaults to the MOR repository the program is part of.
12. **Names stay on the device.** Names of identities and collectives are kept in `book.json` and never published.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../collective
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM
```

- `test/collective.test.ts`: the step's "done when" through the program's requests, against three homes and a relay: four identities; a release under one's own name, verified as not a collective's; a collective founded with two simulated members, its review read from the bytes; a member added, one removed; a release under the new rules, refused to the former member, signed by two and verified by a fresh verifier; leaving, first refused in plain words (F96, absence), then with the rules rewritten; after it, the author cannot sign, the two who stay make the next release, the earlier one still verifies. Then what you sign is what you saw: a wrong digest, a used review, a review whose files changed, a blocked review: nothing signed.
- `test/browser.test.ts`: the same in headless Chromium on a fresh profile, from the launcher's link, by clicks alone, under the page's content security policy, with no console error; a hidden direction control in the founding words shown as `U+202E`. `MOR_SCREENSHOTS=DIR` keeps a picture of each review.
- `test/explain.test.ts`: readings from bytes; direction controls; unknown extensions and open formats refused; Law's objections in words; what a clone changes.
- `test/access.test.ts`: pairing once, a code from the page, unpairing; a request replayed, altered, made for another program, too old, or addressed to another host name; the page's security headers; the launcher starting the program and pairing by its link.

## Using it (a human test, on the author's Mac)

*The build window cannot reach the deployed homes, and keeps no keys.*

1. Once, in a terminal, from this folder: `npm install`, then `sh scripts/make-app.sh`. (`npm run wasm` in `clients/genesis` first, if not built.)
2. From then on, double-click **MOR Collective** in `~/Applications`. The page opens, paired.
3. Under **Settings**: homes `https://home1.dubsar.org`, `https://home2.dubsar.org` and the onion address; relays `https://home1.dubsar.org` and `https://home2.dubsar.org`; the onion address's local port as `ONION.onion=http://127.0.0.1:8080`.
4. Then the "done when": yourself and two simulated members (each allowed on the onion home from its management page); a release under your own name; found a collective; add a member and remove one; a release, signed by two members; leave.

## Not yet

- **Members on separate devices:** signing an agreement or clone someone else proposed, fetched by its id; rebuilding the safety key from shares held elsewhere. Every member is held here, as in step 5a.
- **The real identity** through the air-gapped Module and its phone app (step 16b).
- **An escrowed recovery share,** which a collective of two that does not want "either alone" needs (F96).
- **Using the files of step 5a's test collective** (`~/mor-test`): this client keeps its own folder.
