# Dub, and its web client for testing (F281)

*GitHub session, 13 October 2026. Branch `claude/dub-web-client-testing-4h8eb5`, not merged. Client work only: the core, `spec/`, `cmips/`, `clients/site` and `clients/nudge` unchanged; the core library's WebAssembly unchanged, byte for byte.*

## In plain words

**MOR Post is now Dub** (𒁾, "tablet"), as decided. The app on the Mac works as before, under its new name. Two things to know if you have it on your Mac. First, run the app-making script once more from `clients/dub`: it makes **Dub** and removes **MOR Post**, which would otherwise point at a folder that no longer exists. Second, your identity stays where it is: Dub keeps using `~/mor-poster` until a `~/mor-dub` exists.

**Dub's web client** is the same page, running in the browser with nothing installed, ready to be served at `dub.dubsar.org`. Nothing was deployed.

- **Every page says "For testing only"** and states both risks in plain words. Whoever serves the page's code at the moment an identity is made could copy its keys. And the browser's storage, where the signing key is kept, can be lost, or read by what runs in the page. The banner also says that an identity meant to hold anything of value is made with a downloaded app, or with a chain key kept offline, never here.
- **Making an identity** shows 24 words once: its **chain key**, the key that can change the signing key if it is stolen or lost. You type three of them back, as Dub on the Mac asks. After that the page forgets them. They are never in the browser's storage: a test reads all of that storage, and nothing of them is there. They are written as the chain-key seed words Module writes them, so the air-gapped chain key Module can restore the chain key from your paper.
- **The signing key stays in the browser**, as it is, not locked. The only lock the page could use is one it could open by itself, and so could anything else running in the page, so a lock would only pretend. The page says so.
- **The way out** is a button, **Show the carry words**. It shows the identity's ID and 24 words (the identity carry Module), which bring the identity into Dub on the Mac or onto another device. A test does exactly that.
- **Each place keeps its own line of acts.** The web client goes on from its own last post, across reloads, while Dub on the Mac starts a line of its own. Every post on both lines verifies.
- **It is a checkable release**, like the display client. Its four files are kept in the repository with their fingerprints, built the same way twice, and `mor-dub check https://dub.dubsar.org/` tells whether a server serves exactly them.

**One bug found and fixed, older than this session:** in MOR Post's page, the form for **Bring an identity you have** never sent anything. The form has a field named "id", and the page's script read that field when it meant the form's own name. The earlier tests brought identities through the program directly, never by clicking, so they did not see it. If you tried the second door on your Mac (step 5 of the human test) and nothing happened, this was why. A test now brings an identity by clicks; it fails on the old code and passes on the new.

No flaw in a MIP found.

## What was built

| Where | What |
| --- | --- |
| `clients/dub/` (was `clients/poster/`) | The rename: package `mor-dub`, command `mor-dub`, app **Dub** (`scripts/make-app.sh`, which also removes the `MOR Post.app` an earlier run made), page title, README. `defaultDir` keeps `~/mor-poster` working while `~/mor-dub` does not exist. The pairing domain line stays `MOR post, version 1`, so browsers already paired with an install stay paired. |
| `clients/dub/src/dub.ts` | Dub's logic, unchanged in what it does on the Mac, now over a `Keep` (the folder, or the browser) and with a `web` mode: chain-key words at genesis instead of signing words; `carry()` for the carry words. Signing steps run one at a time through `Keep.exclusive`. |
| `clients/dub/src/chainwords.ts` | The chain key from a seed, as the words seed Module writes and derives it: key index 0, SLH-DSA scheme 3. Checked against the Module's published vectors, made by the Rust implementation. |
| `clients/dub/src/web/` | The web client: `app.ts` runs Dub in the page; `keep.ts` is IndexedDB (a waiting identity is held in memory only, and a file holding a chain key is refused); `headers.ts` is the content security policy, the reader's; `released.ts`; and two shims (`node:crypto`, `node:fs`) the build allows only for the two shared files that import them. |
| `clients/dub/src/page/ui.ts` | The page's screens, clicks and forms, now shared by the Mac (`app.ts`, with pairing) and the web client. The bug fix is here. |
| `clients/dub/scripts/build-web.ts`, `static/web.html`, `built/` | The web client's build, modelled on the display client's: not minified, reproducible, the reader's browser core library, and nothing from Node except the two shims. `npm run release` writes `built/` and `BUILT-WITH.txt` (the tools; each file's work hash and SHA-256). Its WebAssembly is the display client's released file, byte for byte. |
| `.github/workflows/release-dub-web.yml` | Builds the release on GitHub, as the display client's workflow does: by hand, or on a push to main with `[release dub web]`. |
| `clients/genesis/src/identity.ts` | Two small changes: base64 without Node's `Buffer`, so the file runs in a browser; and `TestIdentity.create` can take a chain key made elsewhere. The genesis client's behaviour is unchanged. |
| `clients/dub/src/cli.ts` | `mor-dub check URL`: the served files against `built/`, byte for byte. |
| Elsewhere | Comments and READMEs that named MOR Post: the desk, the genesis client, `clients/README.md`, the carry Module's README, and the test workflow's step. Earlier reports and drafts keep their wording. |

## Readings taken

Where the brief and the texts leave a choice. *To be confirmed by Nobody, allegedly.*

1. **"Wrapped by nothing it cannot unwrap itself"** is read as: no passphrase, and no pretend lock. The signing key is kept as it is, and the page says why: any lock the page could open by itself, code running in the page could open too.
2. **The chain-key words follow the chain-key seed words Module** (key 0, scheme 3, as Dub's identities use), so the paper restores the key in the air-gapped Module. The core library's WebAssembly was not changed: the derivation is SHA-256, done in TypeScript, and the existing `chainKeyFromSeeds` makes the key.
3. **A waiting identity lives in the page's memory.** Between the words and the three typed back, nothing is stored. A reload forgets the new identity, and nothing of it was published.
4. **The carry words are shown on request,** as often as asked. The carry Module says SHOULD show once, but it calls them the way out, and the brief names exporting them. Each showing says what the words do.
5. **"Forget this identity in this browser"** is a button. It clears what the browser keeps, after a warning that only the carry words bring the identity back. *Not asked for; small, and needed to test a second identity.*
6. **Suggested addresses:** an optional `dub.json` beside the page, https only, fills in the home and relay fields, and is trusted for nothing else. It is the reader's `reader.json` habit.
7. **Two tabs, one line:** every signing step takes a Web Lock and reads the identity afresh, so two tabs never sign at one position.
8. **No "other way to reach an address"** in the web client: a browser has none. An onion home cannot be reached from a browser.

## Stated limits

- **Signed:** the release is checkable now (files, fingerprints, `check`, reproducible). It is signed with the repository's releases at step 17, as the display client's is.
- **Changing the key of a web-made identity** needs its chain key restored from the paper in the air-gapped chain key Module. The derivation is checked against that Module's vectors, but no rotation from restored words was run in this session.
- **`built/` is built here,** on Linux with the tools `BUILT-WITH.txt` names (the same rustc and wasm-bindgen as the display client's release), and its WebAssembly matches the released one. The release workflow rebuilds it on GitHub once merged.
- **Every source change to the web page needs a new release** (`npm run test:build` says so); the display client works the same way.

## Tests

`scripts/test-all.sh` on main (`177229c`), before anything was changed: **all passed.** Rust workspace 671 passed (1 ignored); TypeScript 338: assess 50, barebone 10, collective 42, connector 13, desk 26, genesis 26, longform 26, manage 7, nudge 22, poster 7, reader 18, repo 19, site 66, jpeg 14, video 6, carry 6.

On this branch: see the next section.

New, in `clients/dub` (7 tests before, now 17):

- **The web client in headless Chromium,** a fresh profile, the built page served with its headers, real homes and a relay (`test/web.test.ts`). The banner and both risks are checked on every screen. The flow: make an identity; the chain-key words shown once; **nothing of the chain key in storage** (the words, the seed, the key's own seeds, in hex and in base64), checked across IndexedDB, local and session storage, caches and cookies, before the words are typed back and after, and nowhere on the page either; the genesis commits the key the words give; a wrong word refused; post; **reload; post again, the second post following the first in the same line**; export the carry words, which are the signing key, not the chain key; **bring the identity into Dub on the Mac**, which starts its own line at position 1 while the web client's goes on from its own last act; all four posts valid; both lines listed in each app; forgetting it leaves no key in storage; no console error; the content security policy refused nothing. Then an identity made by Dub on the Mac is brought into the web client, after wrong words are refused.
- **The seed Module's vectors** (`test/chainwords.test.ts`): the words, key seeds, public keys and commitments match.
- **The release** (`test/web-build.test.ts`): `built/` complete with its fingerprints listed, the banner in the page, the display client's WebAssembly; built twice in two folders, the same bytes; `check` says SAME, and catches an altered `dub.js` from the command line too; the old folder kept while the new one does not exist. `npm run test:build`: built here, the same as `built/`.
- **The bring door by clicks** on the Mac (`test/browser.test.ts`). It fails on the old code and passes now.

## How Nobody, allegedly, tries it

On the Mac, after merging:

```
git fetch origin && git checkout main && git pull
cd clients/genesis && npm install && npm run wasm
cd ../desk && npm install
cd ../dub && npm install && sh scripts/make-app.sh
```

Double-click **Dub**: your identity is there, as before. To try the web client before it is deployed, from `clients/dub`: `npm run build`, then serve `dist-web/` on `http://127.0.0.1` (for example `npx http-server dist-web -p 8480`, which downloads a small server the first time) and open it. A browser keeps keys only over https or on the machine itself. Make an identity with your test homes, write the chain-key words on paper, post, reload, post, then **Show the carry words** and bring them into a second Dub (`node --import tsx src/cli.ts open --dir ~/mor-dub-2 --port 8473`).

Deploying at `dub.dubsar.org` is a later machine session: the steps (copy `built/`, DNS, Caddy, `check`) are in `clients/dub/README.md`, "Putting it behind Caddy". The DNS record is yours to add.

Test identities only; never type a real identity's words or keys into it.
