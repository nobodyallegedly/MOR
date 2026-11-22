# DubLaw W3-C: an independent check of wave 2's two results

*Author: Nobody, allegedly. DubLaw wave 3, session C, 22 November 2026. Read-only over `_research`, wave 2's results and the MOR repository. This session has not seen A's or B's reasoning. Every count below comes from the scripts beside this file (`run.sh` reruns them all) and is in their JSON outputs. The index of acts is this session's own (`index.mjs`), decoded with the players' kit (74739bb7); no wave 2 script was used except A's `scan-apps.mjs` for the rerun task 1 asks for. Each finding gives its ground: **counted**, **traced** (acts cited in order) or **inferred** (my reading).*

## 1. Summary

- **Task 1, A's rerun: held.** `scan-apps.mjs` rerun gives a byte-identical `apps-inventory.json` (SHA-256 `d37e2460…f0a2`). 17 of A's figures (summary, section 2, section 3) agree with the JSON; 0 disagree; 1 cannot be checked as written ("2 to 19 acts each"). Counted.
- **Task 2, twelve of B's entries: 11 held, 1 did not.** B gives `2d7062e9…79e8` as "not held". This session finds its text, act `3a1aa627…2c79`, by the SHA-256 of that text up to its 29th sentence end. Two of the 11 need a note: assents agree once one unpublished assent is set aside, and B files a power's kind under "K7". Counted.
- **Task 3, six of A's features (4.1, 4.2, 4.8, 4.9, 4.10, 4.11): held, with 1 disagreement.** All 123 cited acts exist and are the kind A says. Every list and every population this session could recount matches. The one disagreement: 4.10's "27 acts by 6 signers by others" counts the app's second author as an "other". Leave that author out and it is 17 by 5. Counted.
- **Task 4, four claims DubLaw relied on: 4 of 4 held.** Kit: 0 of 122 fingerprints are in its 11 files, and its verifier answers "unchecked" for 7 of 7 K2 cMIPs. Award: no act under it and no Terms naming it, for either hash. Until: its 6 cMIPs are escrow drafts 1 to 5 and a home bond, and none is an arbiter's. Clients: they read the spec hash `00538b90…` (draft 17), which no act of the round is under; all 1055 Agreements acts are under `dd90f8af…`. Counted and traced.
- **Between A and B** (not a finding about either one): the 17169 acts against 17168 come from the same one unpublished assent. A's 2919 text acts against B's 2924 are 5 text acts whose text is empty. Counted.
- **Files newer than A's JSON:** `HANDOVER.md`, which changes nothing, and dubsar's `relay.db-shm`, whose mtime is 22 November 09:28. That second one is not explained (section 2.3).

## 2. Task 1: A's scan, rerun

### 2.1 The rerun (counted)

`node scan-apps.mjs --research _research --kit KIT --out SCRATCH`, as its header says, into a scratch folder of this session's:

| File | SHA-256 |
|---|---|
| A's `apps-inventory.json` | `d37e2460ed063826bff7a7d3937c57d212fd7c07ff37b953c9c608cb97c2f0a2` |
| the rerun's | `d37e2460ed063826bff7a7d3937c57d212fd7c07ff37b953c9c608cb97c2f0a2` |

They are equal, so there is no difference to show (`check-a-figures.json`, `sha256`, `differences: []`).

### 2.2 A's figures against A's JSON (counted, `check-a-figures.py`)

| Where | Figure | Document | JSON | |
|---|---|---|---|---|
| 1 | media hashes published | 130 | `stats.media_hashes` 130; distinct `media_hash` in `apps` 130 | agree |
| 1 | programs as text acts | 15 | `stats.code_in_text_acts` 15 | agree |
| 1 | media held | 26 | `stats.media_held` 26 | agree |
| 1 | media not held ("list in section 3") | 103 | `stats.media_to_fetch` 103; `to_fetch` 103 entries | agree |
| 1 | 130 = 26 + 103 + 1 | — | the one left: the media hash held by no home (in the JSON's `figures`) | agree |
| 1 | features | 12 | 12 sections 4.1 to 4.12 | agree |
| 1 | award cMIP: acts under it, Terms naming it | 0, 0 | `features.award` 0, 0 | agree |
| 1 | questions to the MOR lead | five | 5 numbered items in section 5 | agree |
| 1 | "2 to 19 acts each" | 2 to 19 | the "N acts by M signers" of section 4 run from 0 to 119 (4.6: 79 and 119; 4.10: 27) | cannot be checked as written: "most of those apps" does not say which counts. Inferred |
| 2 | distinct acts | 17169 | `stats.uniqueActs` 17169 | agree |
| 2 | text acts | 2919 | `stats.textActs` 2919 | agree |
| 2 | report lines naming a hash | 7273 | `stats.report_lines_with_hashes` 7273 | agree |
| 3 | table rows | 103 | `to_fetch` 103 | agree |
| 3 | rows differing from `to_fetch`, in order (hash, name, version, kind, bytes, homes, uploader) | 0 | — | agree |
| 3 | "the ones that matter": each hash is in `to_fetch` | 13 hashes | 13 in `to_fetch` | agree |
| 3 | "the ones that matter": versions | 13 | 0 differ | agree |

Against this session's index (`index.mjs`): distinct acts 17169, Terms 269, Statements 786. All three are A's figures. There are 2924 text acts, 2919 of them with non-empty text. A's `texts = all.filter((a) => a.text)` leaves out the five empty ones: `a6410fc1…`, `6e63e83c…`, `743e0d26…`, `40e44fea…`, `a71a85dc…` (full ids in `check-a-figures.json`). B counts 2924. Counted.

### 2.3 Files in `_research` newer than A's `apps-inventory.json` (counted)

A's file has mtime 21 November 13:15. The newer files are:

- **`HANDOVER.md`** (21 November 13:58). The rerun is byte-identical, so it changes nothing in A's JSON. Expected.
- **`feeds/dubsar-before-closure/relay.db-shm`** (22 November 09:28:24, during this session). This is SQLite's shared-memory index, not data. `relay.db` and `relay.db-wal` keep their mtime of 20 November 22:40:19 and their SHA-256 (`e24a596d…0b51`, `2450db23…005a`). This session opened the database in place once, with `sqlite3 -readonly "file:…relay.db?immutable=1"`, to read its schema. A test of that same command on a copy, run with an old mtime on the `-shm`, left the `-shm` unchanged. Every other read by this session, and by A's script, is of a private copy. After 09:28, `run.sh` (A's scan included) and `index.mjs` ran again, and the `-shm`'s mtime and SHA-256 (`77cdc215…23ca`) stayed as they were. So this session cannot say what touched the file: perhaps another session reading the database in place. **Not explained**, and reported as such. Inferred.
- No `_research/apps/` exists.

## 3. Task 2: twelve of B's entries, traced

**Rule** (fixed before any trace ran, in `trace-b.mjs`):
- **Most named:** B's four entries with the most Terms naming them (`use.terms`, ties by fingerprint).
- **Least named:** the four with the fewest Terms naming them, among those named by at least one.
- **Random:** four from the 107 left, by a mulberry32 shuffle with **seed 20261122**.

**What "the text" is** (this session's code): a text act whose fingerprint is the entry's, by any one of these:
- Development's spec hash `tagged_hash("MOR/spec", {0: kind, 1: creator, 9: text})`, with the text act's signer as creator, kinds 0 to 3 (`core/src/development.rs`);
- its act id;
- its plain SHA-256;
- its work hash;
- the SHA-256 of its text up to one of its first 30 sentence ends.

**Sockets:** every socket of every Terms act, plus a power's kind where it is a K7 cMIP. **Assents:** Statements of kind assent whose `terms` is one of those Terms.

| Chosen as | Fingerprint | Title (B) | Text act (how) | Signer = B's author; published by = B's | Sockets, mine / B | Terms, mine / B | Assents, mine / B | Signers, mine / B | |
|---|---|---|---|---|---|---|---|---|---|
| most | `5516c238d6a0a14f…` | public flow, draft 8 | `537b6390…` (spec hash) | `762c0b4c…` yes; yes | K8×115 / K8×115 | 115 / 115 | 257 / 256 † | 62 / 62 | held † |
| most | `61bcdb5b15c282e8…` | Counterparty plain-words body, v1 | `ee0fd121…` (SHA-256 to sentence 4) | `f1de20f8…` yes; yes | K1×100 / K1×100 | 100 / 100 | 221 / 221 | 96 / 96 | held |
| most | `ed7e3956354a7356…` | named signers, draft 1 | `d8a19d7d…` (spec hash) | `218a2a93…` yes; yes | K2×93 / K2×93 | 93 / 93 | 287 / 286 † | 89 / 89 | held † |
| most | `d47b432221e9fdeb…` | buyer by assent, draft 1 | `735c3cf8…` (spec hash) | `218a2a93…` yes; yes | K5×79 / K5×79 | 79 / 79 | 242 / 241 † | 71 / 71 | held † |
| least | `01c17e3894d81c27…` | rotating pot, draft 1 | `d2aa5dec…` (spec hash) | `ba28ac63…` yes; yes | K1×1 / K1×1 | 1 / 1 | 6 / 6 | 6 / 6 | held |
| least | `2d7062e908c51d78…` | (B: not held) | **`3a1aa627…`** (SHA-256 to sentence 29) | `b820fe4b…`; B: none | K1×1 / K1×1 | 1 / 1 | 1 / 1 | 1 / 1 | **did not hold** ‡ |
| least | `3a2f40f4a4f57819…` | in force by the condition, draft 2 | `5f5443a6…` (spec hash) | `76a78f70…` yes; yes | K2×1 / K2×1 | 1 / 1 | 9 / 9 | 9 / 9 | held |
| least | `3f2a69dee8f2e09b…` | Stall: seller may change an offer | `3f2a69de…` (act id) | `ddafffcd…` yes; yes | K4×1 / K4×1 | 1 / 1 | 0 / 0 | 1 / 1 | held |
| random | `8cd7b8b158b0d6f6…` | money decision, draft 5 | `f2970dcc…` (spec hash) | `76a78f70…` yes; yes | power kind×2 / "K7"×2 § | 2 / 2 | 19 / 19 | 21 / 21 | held § |
| random | `301481877f9abd20…` | money decision, draft 3 | `14e01443…` (spec hash) | `76a78f70…` yes; yes | none / none | 0 / 0 | 0 / 0 | 0 / 0 | held |
| random | `7ff9be42bef9875f…` | the straight split, draft 5 | `2e295742…` (spec hash) | `880d33f2…` yes; yes | none / none | 0 / 0 | 0 / 0 | 0 / 0 | held |
| random | `eea5e5644b2fd2b0…` | shower work, draft 8 | `8acd058f…` (spec hash) | `218a2a93…` yes; yes | none / none | 0 / 0 | 0 / 0 | 0 / 0 | held |

Full ids, every Terms act and socket, and the K7 and spec counts are in `trace-b.json`.

- **†** The extra assent is act `82452b2e…f49c`, held only as `windows/followers/build/vote/UNPUBLISHED-duplicate-assent-82452b2e.mor`. It is in no feed, not in dubsar's database and in no `acts/` folder. B's sources leave it out; this session's index and A's do not. Without it, the three counts are 256, 286 and 241, B's figures. The same act explains B's 17168 distinct acts against A's 17169, and B's 785 Statements against 786. Counted; traced (that one act).
- **‡ Disagreement.** B: `2d7062e9…79e8` is "not held", with no author and no publishing act. This session: it is the SHA-256 of the text of act `3a1aa6272283da3682d9557ff1c14399efd10bd7a864f8143c56050357872c79`, up to its 29th sentence end. That act is signed by `b820fe4b…10f1` and begins "Longhouse services, round two, version 1 (an offer; …)". The one Terms naming it, in K1, is `293444c6…f909`, by the same signer. B's own search stops at the 20th sentence end. Both figures stand; this session does not resolve them. Counted.
- **§** `8cd7b8b1…` is named by two Terms (`9f387d1d…`, `5cdbc711…`) as the **kind of a power** (K3, encoding 2 E14), not in a socket. B files these under "K7". This session's index has 11 K7 Statements of that kind, as B has. The counts agree; only the label differs. Counted.

## 4. Task 3: six of A's features, traced

**Rule** (`trace-a.py`): the six sections of 4.1 to 4.12 that cite the most distinct acts, an act being a 64-hex string in the section that is an act id in this session's index. The ranking: 4.2 (26), 4.9 (25), 4.8 (22), 4.1 (19), 4.10 (16), 4.11 (15), then 4.5 (14). So the six are 4.1, 4.2, 4.8, 4.9, 4.10 and 4.11, with 123 cited acts.

All 123 exist in the index. Each claim "N acts by M signers (…)" was checked four ways: the listed count, the distinct signers of the listed acts, the kind of each act, and, where the label defines one, a recount of the whole population.

| § | Claim (A) | Listed / signers | Kind of each | Recount of the population (rule) | |
|---|---|---|---|---|---|
| 4.1 | lending-shelf Statements, 8 by 6 | 8 / 6 | K7 `255551a7…` ×8 | 8 / 6 (K7 kind prefix) | held |
| 4.1 | Terms in those agreements, 4 by 4 | 4 / 4 | Terms ×4 | 4 / 4 (Terms whose root is a listed Statement's agreement) | held |
| 4.1 | named by others, 5 by 3 | 5 / 3 | text ×5 | 5 / 3 (`shelf.mjs` or `shelf 0.1`, signers other than `2c381cf6…`), same ids | held |
| 4.2 | receipts, draft 1, 9 by 4 | 9 / 4 | spec `ec1f118d…` ×9 | 9 / 4 (spec prefix) | held |
| 4.2 | receipts, draft 2, 4 by 2 | 4 / 2 | spec `9e19e62c…` ×4 | 4 / 2 | held |
| 4.2 | the charter Terms, 1 by 1; its assents, 9 by 9 | 1 / 1; 9 / 9 | Terms; assent ×9 | 1 / 1; 9 / 9 (assents to its root) | held |
| 4.2 | named by others, 0 | — | — | 0 (`kept.mjs`) | held |
| 4.8 | hours-of-care Statements, 2 by 2 | 2 / 2 | K7 `4a737c66…` ×2 | 2 / 2 | held |
| 4.8 | the Cercle's Terms, 2 by 1; its assents, 10 by 5 | 2 / 1; 10 / 5 | Terms ×2; assent ×10 | 2 / 1; 10 / 5 | held |
| 4.8 | text records CERCLE-HOURS, CERCLE-CONFIRM, 6 by 5 | 6 / 5 | text ×6 | 6 / 5 (text acts holding either mark) | held |
| 4.8 | named by others: cercle-count 1 by 1, mending.mjs 0 | 1 / 1; — | text | 1 / 1, same id; 0 | held |
| 4.9 | acts under credits draft 1, 19 by 14 | 19 / 14 | spec `91a94236…` types 1 (5) and 2 (14) | 19 / 14 | held |
| 4.9 | under draft 2, 1 by 1 | 1 / 1 | spec `4a4f08c2…` | 1 / 1 | held |
| 4.9 | Terms naming Backlot's credits cMIP, 3 by 2 | 3 / 2 | Terms ×3 | 3 / 2 (the socket cMIP the three share that the fewest Terms name) | held |
| 4.9 | named by others, 2 by 1 | 2 / 1 | text ×2 | 2 / 1 (`credits-read`), same ids | held |
| 4.10 | the Terms (root `66072149…`), 2 by 1 | 2 / 1 | Terms ×2 | 2 / 1 | held |
| 4.10 | Statements in it, 8 by 4 | 8 / 4 | assent ×8 | 8 / 4 (Statements whose agreement is the root) | held |
| 4.10 | text acts naming standing.mjs "by others", 27 by 6 (no list) | — | — | **27 / 6** leaving out only `f9de7f3e…5291`; **17 / 5** leaving out both of the app's authors (`f9de7f3e…`, and Counterparty `f1de20f8…9bfb`, who signed versions 0.1.2 and 0.1.3) | **disagreement** |
| 4.11 | handover check named by others, 11 by 5 | 11 / 5 | text ×11 | 11 / 5 (`handover check`, signers other than `b820fe4b…`), same ids | held |
| 4.11 | turnstile-move, turnstile-census named by others: 0, 0 | — | — | 0, 0 | held |

The app text acts A names in these sections are text acts, and each is signed by the author A gives:
- `73a05f6e…` and `30969bb4…`, by `2c381cf6…`;
- `3fdf9b59…`, `9e601202…` and `98e3deb4…`, by `28070ee8…`;
- `046b26cd…`, by `e4e5f6db…`;
- the six standing.mjs versions: four by `f9de7f3e…`, and 0.1.2 and 0.1.3 by `f1de20f8…`;
- the handover check drafts, by `b820fe4b…`;
- the census versions, by `11e77c4b…`.

Counted.

**4.10, the disagreement.** A's section names standing.mjs's author as "Sanne Verhoeven (`f9de7f3e…5291`), with versions 0.1.2 and 0.1.3 by Counterparty (`f1de20f8…9bfb`)". Its "27 acts by 6 signers" counts Counterparty's acts as "by others", its two version texts included. Both figures and both lists of acts are in `trace-a.json`. This session does not say which reading is meant. Counted; the two readings are inferred.

**A note on "named by others", not a disagreement.** This session's counts use names only. A second count, which also accepts a text holding one of the app's full hashes, adds Longhouse's anchor lists: "anchor 10, its blinds" and "anchor 11", which list act ids. With them, 4.1 has 6 by 4, 4.2 has 2 by 1, cercle-count 2 by 2, mending.mjs 1 by 1, handover check 16 by 5, and turnstile-move and turnstile-census 4 by 1 each. A's figures are the name-only ones. Counted (`patternOnly` in `trace-a.json`).

## 5. Task 4: four claims DubLaw has relied on

### 5.1 "The kit checked none of the agreement cMIPs" (B, summary): held

The fingerprints searched were these 122 together:
- every fingerprint the round's acts name in a socket, as a power's kind or as a K7 kind (39);
- every fingerprint and spec hash of B's 115 entries.

The search ran over every file of the kit at 74739bb7: `lib/`, `mor.mjs`, the documentation and `core/mor_wasm_bg.wasm`, 11 files in all. It looked for the full hex, the 32 raw bytes, and the first 16 hex characters. Hits: **0**. The kit's control cMIP (`82c58f7c…`) is named by no act of the round. Counted.

The kit's own verifier (`agreements ask in_force`) was asked of one Terms act for each of the 7 distinct K2 cMIPs, with every act of that agreement that a window kept. It answered **unchecked** 7 times out of 7:
- 3 times because "this verifier does not hold the cMIP of K2": `ed7e3956…`, `de8d5d29…`, `e51e8653…`;
- 4 times because the Terms name the place `b3d7eee6…` and the verifier has no answer for it. That answer comes before any cMIP is read.

Traced (`check-claims.json`, `claim1.verifierAsked`).

### 5.2 DubLaw's arbiter's award has no act under it and no Terms naming it: held

The full hashes were found by prefix and suffix:
- `7d42b01cd8cb230a355ca6b18cf015c610683a2876e9e283605126d14cff9130`, B's "an arbiter's award, draft 2";
- `ebcc09e34317484cf3ab2a611aa57cd329cea9ecd866397a2eee398a0886c6b4`, B's "draft 1".

For each:
- acts signed under it as their spec: 0;
- Terms naming it anywhere in their decoded fields (sockets, power kinds, relies_on): 0;
- Statements naming it: 0.

Text acts naming it in full: 2 for draft 2 (one by `218a2a93…`, one by `76a78f70…`) and 3 for draft 1. Those are mentions, not use. Counted.

### 5.3 Until wrote no arbiter cMIP of its own: held

**Until's identities**, by this rule: hashes that Until's own reports name within 40 characters after the word "Until", at least twice. There are three:
- `3022fb29…89e7` (88 text acts);
- `147510a0…007c` (0 text acts);
- `fe73da86…d421` (2 text acts).

Of their 90 text acts, 6 have a first line that titles a cMIP or a Module: escrow drafts 1 to 5, and home bond draft 1. None has a title naming an arbiter, an award or arbitration. All six mention an arbiter in their text. Escrow draft 5 (`ca9d95cd…`) cites, beside the word, DubLaw's award draft 1 (`ebcc09e3…`, and its text act `5102247f…`). Counted; the citation is traced.

### 5.4 Dubsar's desk and collective clients read Agreements draft 17, not draft 25: held

Which draft they read, only:

- **Desk sources.** `desk/src/mirs.ts` holds the Agreements spec hash `00538b90…796a`, which is SHA-256("LAW, test value until the freeze"). `desk/src/deals.ts` reads Terms with `readTerms` from `../../genesis/src/core.ts`. The desk's README and `publishing.ts` say "Agreements draft 17".
- **Collective sources.** `collective/src/explain.ts` reads Terms with `readTerms(payload, AGREEMENTS_SPECS)`.
- **Neither client** names draft 25's spec hash `dd90f8af…2c` or any `agreementsNew…` function, in source, tests or documentation.
- **The imported modules.** Both clients import `repo/src/specs.ts` and `genesis/src/core.ts` from outside `build/`. They were read at commit `5d73191b`, the commit `build/FROM-MAIN.txt` says the clients were copied from. Both define `agreements` as the hash of "LAW, test value until the freeze", which is `00538b90…`.
- **The round's acts.** 0 are under `00538b90…`. 1055 are under `dd90f8af…`: 269 Terms and 786 Statements, the spec the kit's `agreementsNewSpecs` gives for draft 25.

So the clients look for Agreements acts under a spec hash that no act of the round carries. Counted and traced. That `00538b90…` is "draft 17" comes from the clients' own comments: the hash is a test value and names no draft. Inferred.

## 6. Limits

- **Mine against B's.** This session's index reads every `*.mor` file in `_research`, not only `acts/` folders. Its counts include one unpublished assent that B's do not. Section 3 gives both figures wherever that act counts.
- **What "named by others" means** is this session's choice: one pattern per app, from A's own names. The anchor lists show that a by-hash reading gives other figures. A's script was read only to learn its definition of "by others" (`mentions`, `reach`). None of its code was run, except the rerun of task 1.
- **The twelve fingerprints.** Every text act in the round was tested against the twelve, by the methods listed in section 3. An entry matched by none of them would have shown as not held; none of the twelve, as B gives them, was.
- **Section 2.3's `relay.db-shm`.** Its mtime changed during this session. This session's in-place read was tested and left it alone, but what changed it is not known. The data files are unchanged.
- **Not done.** No sealed act was opened. No home, relay or player's file was touched. Nothing was resolved, grouped or compared beyond the figures asked for, and the core was not judged. Wave 2's other outputs (B's categories, "built on" and windows; A's sections 4.3 to 4.7 and 4.12) were not checked.
- **Rerun.** Every count reruns with `run.sh`. It needs Node 22.5 or later (`node:sqlite`, on a private copy of dubsar's database) and Python 3. This Mac has `sqlite3`, so no stand-in was needed; this session's own code does not use it. The index (about 14 MB) is written to the scratch folder and is not delivered.
