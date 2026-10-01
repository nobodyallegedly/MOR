# mor-collective

The collective client, in TypeScript, with the core library through WebAssembly. Roadmap step 11b: "I will be needing to manage a collective without typing a line of code" (Nobody, allegedly).

**Test identities only.** Every key, every share of a collective's safety key, is held in software in the program's folder. The real identity's keys come through the air-gapped Module and its phone app (step 16b).

## In plain words

A small program runs on your computer and holds your test identities and collectives. You use it from a page in your browser, on that computer only. Double-click **MOR Collective** and the page opens, already paired with the program; nothing is typed in a terminal.

From the page you can:

- make test identities: yourself, and the simulated members a test needs;
- publish a release of the code under your own name, as the first real release will be (step 17);
- found a collective, add and remove members, publish its releases, sign them as a member, and leave;
- step down from its release area, and change that area's own words;
- change who judges absence, a judicial change made under the clone rule, without a rotation;
- check any release by its id, as anyone would;
- see everything you signed.

**Nothing is signed until you have read what it means.** Every action goes in two steps. First the program makes the exact bytes to be signed, then reads them back through the core library and tells you, in plain words, what signing means: who is bound, who decides what, what each rule does, what changes compared with now, what is released and what changed since the last release. Words of an agreement are shown as plain text, character for character, with any invisible direction control shown as a code, so no clause can read in another order than it is written. Only when you press **Sign** does the program sign, and only those same bytes: if anything changed in between, it refuses and asks you to look again. What cannot be signed (rules Law refuses, a specification this client does not implement, files that differ from your checkout) is said plainly, and the Sign button stays off.

## Precisely

| File | What |
| --- | --- |
| `src/explain.ts` | The plain-words reading: an agreement (founding or clone) from the core library's own decoding of its bytes (`readTerms`): who is bound, a clone's mark, the keys, the areas, who decides what (the three tiers), leaving, absence; what a clone changes against the agreement in force, each change with its tier and the powers its mark must name (`lawClonePlan`); what a release changes against the one before. Law's objections by their codes, in Law's own words. The first piece of the deal-assessment tool (step 14). |
| `src/actions.ts` | Every operation: `prepare` makes the exact bytes and their reading, with a digest; `confirm` signs them only with that digest, within 15 minutes, once, and only if no file it depends on changed. A new identity, a release (one's own or a collective's), founding, a member or rules change, leaving, stepping down from the release area, new words for that area, who judges absence (a judicial change), a member's signature on a release, verifying. Before any action that draws a record, a warning if the collective's relays hold acts this device's sequence does not. |
| `src/store.ts` | The program's folder (default `~/mor-collective`, owner-only): `book.json` (names, which identity is you, releases under one's own name), `settings.json`, `identities/` and `collectives/` (the genesis and repo clients' own file formats), `history.jsonl`, `access.json`. |
| `src/access.ts` | Pairing and signed requests, as the management page of step 11: a browser key that cannot be read out, a one-time code, each request its exact JSON signed after `"MOR collective client, version 1\n"`, naming this program, the time (five minutes) and a single-use nonce. |
| `src/server.ts` | The program: `127.0.0.1` only, the page (built from `src/page/` at start, not minified) under a content security policy, `/hello`, `/api`, and `/local/code` for the launcher. Requests addressed to any other host name are refused (DNS rebinding). |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link), `run`, `stop`. |
| `src/page/` | The page: requests, the browser's key, the sections and the reviews. |
| `scripts/make-app.sh` | Makes `~/Applications/MOR Collective.app` on macOS, which runs `open`. |

It builds on the repo client (step 5a), which gained, for it: `prepareRelease` and `publishPrepared` (a release made and shown before it is signed, by a collective or by one identity), `proposePayload` and `encodeTerms`, `collectiveTerms`, and member changes that may also rewrite the rules (`changeMembers({ governance })`), each refusing to sign if the terms made now are not the bytes shown (`expect`). For Law draft 7 it also gained, from this step: `expect` on `changeReleaseWords`; three optional fields of the collective file the client keeps (`departed`, `steppedDown`, `records`); and `verifyRelease` reading the publisher's own acts before judging a release's standing, since a release that is no longer the tip a rotation kept is valid only through the acts after it.

## Law draft 8

The client follows Law draft 8 (F103 to F109, with Flaw B1 and B2 to B13): as draft 7, and a mark's signers ascending by hash (B8), shown in the order the agreement lists its parties; a judicial-only change (B13). In plain words: a collective's agreement now says **who decides what**. The constitution (the members, the change rules, the keys, the areas, the constitution's words) changes only with every member whose voice remains, unless the founders chose a number: nobody loses their say without signing. Protected clauses (absence, keepers, arbitrators, time, succession) change for a member only with that member's signature. Releases are an **area**, held by the members, any k of whom make a release count; a holder may step down alone, and an area with nobody left is frozen until the members refit it. **Anyone can leave alone**, at any time, keeping what they own; it counts for the collective from its next record. Precisely: `readTerms`, `lawClonePlan`, `checkTerms` and the Verifier's Law calls all take the spec hashes (`LAW_SPECS`); a clone's field 4 is its mark (F104); records (Law type 17) are the collective's everyday lines (rule 37c, F109).

## Readings

Where the texts are silent, the client takes these readings. *To be confirmed by Nobody, allegedly.*

1. **A program on the machine, a page in the browser.** The keys live in files in the program's folder, as the genesis and repo clients keep them; the page holds only its pairing key. *Set aside:* a page alone, with keys in browser storage: clearing a site's data would lose them, and a release reads the files git tracks, which a browser cannot.
2. **Pairing without typing.** As step 11, except that the code is never typed: the launcher asks the running program for one, over a secret in `run.json` that only the owner's account can read, and opens the page at a link carrying it in the fragment, which the browser never sends. A code can also be made on the page for another browser. *Cost, stated:* anything running under the owner's account can read that secret, as it can read the keys themselves.
3. **What you sign is what you saw (Law rule 4a, Text rule 5a).** The reading is made from the exact bytes, as the core library decodes them, never from what was typed into a form; confirming needs the reading's digest; the plan lasts 15 minutes and serves once; it is refused if an identity or collective file it depends on changed after it was shown. Agreements' words are shown as plain text by default, every invisible control of Text rule 5 as an escape.
4. **Fail closed (Law rule 2, Envelope rule 11).** Terms naming a task cMIP, an extension or a time reference this client does not implement, or a split service, cannot be signed here. Terms using a field whose format is still open are not read at all.
5. **Every objection at once.** Law stops at its first objection; the client also checks the numbers against the member count, so every one is listed together: the client's own hints first, then Law's objection once, by its code, in Law's own words. The client never matches Law's wording to fold one into the other: the core's words may change, its codes do not.
6. **A clone's field 4 is its mark,** a statement of fact (Law draft 7, rule 45, F104): the review says “it comes in by *this power* signed by *these members*”, and that Law checks these are exactly the powers its changes need, met by those named; a false mark sinks the clone. No longer a question: F104 settled it. Founding terms exist only once every party has signed them (Q11), and the review says so.
7. **Simulated consent, said each time.** In a test collective every member is held by this program; every review lists who signs on this device and says their consent is simulated.
8. **Leaving is not a member change** (Law draft 7, rule 37a). The Leave button prepares a resignation the member signs alone, which the collective registers at once by a record, its line: nothing else changes, no rule is rewritten, and nothing (not even F96) can block it. From that line the member's signature counts for nothing, except for an act of the collective made before it (C1). The review says what follows: the members who stay refit the collective (Change members, removing the member who left), rotating to keys that member never held; that member is not asked to resign again. *Consequence, stated:* with two members left, F96 still allows only "either member alone can rotate", or an escrowed share, which is not supported yet: the refit lowers the shares needed, and its review says so in words. A member removed by Change members who has not left yet signs a resignation first (here a simulated member, held here, which the review says), registered by a record before the clone.
9. **Words and rules.** With no words written, the standard words for the rules are used. If the rules change and the words were standard, they follow; if members wrote their own, they stay, with a warning that they may no longer say what the rules do.
10. **No release while a member change waits:** signed with the old key, it would be void once the change counts (F100). Nor a record of leaving, stepping down or new words.
11. **A member signs a release** only if they are a party to the agreement in force at the release's binding, have not signed it yet, have not left or stepped down on a line before the release (judged on this device's copy of the collective's sequence), and every file matches their checkout (repo client reading 17). The checkout defaults to the MOR repository the program is part of.
12. **Names stay on the device.** Names of identities and collectives are kept in `book.json` and never published.
13. **Changes of members or rules are constitutional.** Their clone is marked with the constitutional change rule, signed by the members whose voice remains: by default all of them, held here; with a number k ("Members who must sign a change of members or rules"), any k of them, all of those who remain if fewer do (rule 44d). A rules change that would need another power only (a change of the absence rule alone is judicial) is refused here rather than marked falsely.
14. **Stepping down** from the release area is a resignation naming area 1, registered at once by a record (rule 37b, "Stepping down at once"). The other holders carry on; with nobody left the area is frozen, releases are refused here, and the review says the members must refit it. *Reading:* the client counts a holder who stepped down as holding the area again only after a constitutional change that redraws the area's entry and that they sign (rule 37b); the core also counts them again under any later version naming them that they signed (rule 44d). *Question for the texts* below.
15. **New words for the release area** are an ordinary change (rule 37c, Q8): a clone marked with the area's power, signed by enough of its holders whose voice remains, written on the collective's record at once with its everyday key; no rotation.
16. **A record names no other sequence** (a test collective keeps one). Before drawing one, the client fetches the collective's acts from its relays and homes, and warns (without blocking) if any is missing from this device's sequence: those acts would count as made after the line (Law, "Made before, made after"; client conformance: devices share their tips before a line is drawn).
17. **Who judges absence is a judicial change** (Law draft 8, B13; rules 44a, 46a). A rules change in which only "who judges absence" differs, with no member joining or leaving and no words typed, is prepared as a clone marked with the clone rule, signed by enough members whose voice remains (any k of them, all who remain if fewer do), and written on the collective's record at once: no rotation. The review says that for a member who does not sign it, absence stays judged by the clause they signed. *Reading:* the constitution's words are constitutional, so this change leaves them as they are, even standard words naming the old number; the review warns, and a change of the rules (constitutional) rewrites them.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../collective
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM
```

- `test/collective.test.ts`: the step's "done when" through the program's requests, against three homes and a relay: four identities; a release under one's own name, verified as not a collective's; a collective founded with two simulated members (every founder signs), its review read from the bytes (areas, tiers, F105); a member added; one removed (a resignation, the record registering it, then the clone, marked constitutional); a release under the new rules, refused to the former member, signed by two and verified by a fresh verifier; leaving, a resignation and a record, no rules rewritten; a release after it, refused to the member who left, made by the two who stay; the refit removing the member who left, first refused in plain words (F96, absence, then Law's objection), then with the rules rewritten; the release area's words changed by an ordinary change and a release under that record; stepping down until the release area is frozen, and a release refused. Then what you sign is what you saw: a wrong digest, a used review, a review whose files changed, a blocked review: nothing signed. Then the warning before a record when the relays hold an act of the collective made by another device (a copy of its identity file whose sequence was reset).
- `test/collective.test.ts`, last test: who judges absence changed alone, a judicial change under the clone rule recorded at once, no rotation, its review read from the bytes (rule 46a for the member who does not sign, the words left as they are), and a release under the recorded clone verified by a fresh verifier (Law draft 8, B13).
- `test/browser.test.ts`: the same, up to the refit and new words for the release area, in headless Chromium on a fresh profile, from the launcher's link, by clicks alone, under the page's content security policy, with no console error; a hidden direction control in the founding words shown as `U+202E`. `MOR_SCREENSHOTS=DIR` keeps a picture of each review.
- `test/explain.test.ts`: readings from bytes (areas, tiers, leaving, F105 coverage); a clone's mark in words; the release area's own words as plain text; direction controls; unknown extensions and open formats refused; Law's objections by their codes, after the client's hints; what a clone changes, by tier, and a false mark.
- `test/access.test.ts`: pairing once, a code from the page, unpairing; a request replayed, altered, made for another program, too old, or addressed to another host name; the page's security headers; the launcher starting the program and pairing by its link.

## Using it (a human test, on the author's Mac)

*The build window cannot reach the deployed homes, and keeps no keys.*

1. Once, in a terminal, from this folder: `npm install`, then `sh scripts/make-app.sh`. (`npm run wasm` in `clients/genesis` first, if not built.)
2. From then on, double-click **MOR Collective** in `~/Applications`. The page opens, paired.
3. Under **Settings**: homes `https://home1.dubsar.org`, `https://home2.dubsar.org` and the onion address; relays `https://home1.dubsar.org` and `https://home2.dubsar.org`; the onion address's local port as `ONION.onion=http://127.0.0.1:8080`.
4. Then the "done when": yourself and two simulated members (each allowed on the onion home from its management page); a release under your own name; found a collective; add a member and remove one; a release, signed by two members; leave; then the refit by the members who stay.

## Questions for the texts

- **A refit after stepping down** (rule 37b, rule 44d): rule 37b ends the freeze when a constitutional clone changes the area's entry; rule 44d (and the core) count a holder again under any later version naming them that they signed. Is a member change that leaves the area's entry as it is a refit? The client reads it as not, and says so in the review.

## Not yet

- **Members on separate devices:** signing an agreement or clone someone else proposed, fetched by its id; rebuilding the safety key from shares held elsewhere. Every member is held here, as in step 5a.
- **The real identity** through the air-gapped Module and its phone app (step 16b).
- **An escrowed recovery share,** which a collective of two that does not want "either alone" needs (F96).
- **Using the files of step 5a's test collective** (`~/mor-test`): this client keeps its own folder.
