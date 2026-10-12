# The MIR rename pass (12 October 2026)

*One roadmap step, wording only (F269): no rule changed, nothing a machine signs or hashes changed. Built on main at `525354a`, after pull request 28 (F267, F268 and rule 17) was merged. Branch `claude/mir-rename-pass`. Records keep their words: the findings log, reviews, dated reports, approved earlier drafts and earlier versions were not edited.*

**In plain words.** The core's six texts used to be called MIPs, "MOR Improvement Proposals" in spirit, after Bitcoin's BIPs and Nostr's NIPs. They are not proposals: once frozen they are rules. So each one is now a **MIR**, MOR Inscribed Rules ("the Identity MIR", "the Money MIR, rule 17"), and the six together are the **MICS**, MOR Inscribed Core Spec. The MICS is the core; the MIRs give a layer by layer look at it. The core document is now the MICS's own document, and says so in its title and first paragraph. **cMIPs keep their name**: the community's proposals. **MIP** is kept for proposals toward MOR 2, and means nothing else now; the MICS document's glossary and `spec/README.md` say so.

The names people read changed. The numbers machines read did not: a specification is named by the hash of its text, not by a word, and every test vector is byte for byte what it was. The code's tests pass, the same number as on main. A script now lists every "MIP" left in the repository, each with its reason, and fails if it meets one it cannot justify.

## 1. What was renamed

**The rule for the words.**
- One text: "the Text MIP" became "the Text MIR"; "a MIP", "this MIP", "a higher MIP" became "a MIR", "this MIR", "a higher MIR"; "Identity MIP draft 11" became "Identity MIR draft 11"; the sections of the MICS document, "MIP: Identity", became "MIR: Identity".
- The whole core: where "the MIPs" or "the six MIPs" meant the core as one thing, it became **the MICS**, never "the MIRs". For example "Zero democracy on the MICS", "Tasks exist only where the MICS defines them", "Below the MICS the one trust root is the six MIR hashes", "Everything above uses what the MICS already defines", "The MICS is frozen whole, its six MIRs together". Where the six texts are counted or each is meant ("the six MIR hashes", "MIRs have no creator", "every MIR it acts on"), MIR stays plural.
- cMIP, cMIPs and every word containing them were not touched: no "cMIR" exists anywhere in the repository (`git grep cMIR` finds nothing).

**The texts changed** (wording only):
- `spec/`: the six current drafts (Identity 12, Text 7, Envelopes 8, Money 7, Agreements 11, Development 7), the MICS document v22, the freeze test suite v22 and `spec/README.md`.
  - The MICS document: titled "The MICS: MOR Inscribed Core Spec"; its purpose paragraph says the MICS is the core and the six MIRs a layer by layer look at it; its glossary gives MIR, MICS and MIP (reserved for MOR 2). One italic line under its version note says it was renamed in place (F269), wording only. The freeze suite carries the same line.
  - Development draft 7's `task-ref = [ mir: hash, task: uint ]`: the first element's label was `mip`. A CDDL array is encoded by position, so the label is no byte on the wire, and no code builds a `task-ref` yet.
  - `spec/README.md`: titled "The MICS, in draft"; the table names the new files; a paragraph under F212's says what F269 renamed, that the old names point to the new ones, that cMIPs keep their name and that MIP now means only a proposal toward MOR 2.
- The READMEs: the root, `clients/`, `clients/desk`, `longform`, `manage`, `reader`, `cmips/`, `core/`, `core/vectors/`, `harness/`, `modules/airgap`, `jpeg`, `lightning`, `onchain`, `video`, `relay/`, `verifier2/`, `docs/`, `docs/case-studies/`, `docs/companions/`.
- `CLAUDE.md` and `docs/build-brief-v1.md`, which every session reads first: "the MICS document, the six MIRs and the freeze test suite"; "a flaw in a MIR". Not in the list I was given, but each is a current text that would otherwise send a new session looking for MIPs.
- The roadmap's current sections: "The rule", "Review and freeze", the open row on Text MIR commentary, and "If a step exposes a flaw in a MIR". Its dated entries (steps done, decisions taken) keep their words.
- The latest draft of each cMIP and Module that names the core: conversion 2, live media 1, long form 1, payment 2, relay transport 3, release manifest 2, split 1, website 5; the air-gapped chain-key signer 4, chain-key seed words 1, identity carry words 1, JPEG 1, Lightning rail 2, on-chain rail 2, video 1, Bitcoin units 1. Their header notes ("Written against … the Identity MIR draft 11") are renamed with them; website 5's quoted note of draft 2 is not.
- The latest case studies that name the core: 04 v4, 08 v4, 09 v4, 10 v4, 11 v2, 15 v3, 16 v3, 19 v3, 20 v5, 21 v2. The companions' latest versions name no MIP; their README does. "MOR in one page" v11, the latest, not yet approved: its one sentence ("The MICS document is the map; the six MIRs are the rules"), with a line in its version note.
- The site (`docs/dubsar.org`): the Build door's list ("The MICS document: the core, and the map of all six MIRs", "The Identity MIR", …, "Every rule of the MICS mapped to the code and tests"), and the cryptography, economics and law doors. The site's next release carries it.

## 2. Files moved

As F212 did: each file moved under its new name with its text unchanged (one commit, renames only, so `git log --follow` keeps the history), then a one-line pointer written at each old name (the next commit), so a link in an older record still leads to the text.

| Old name | New name |
| --- | --- |
| `spec/02-MOR-core-v22.md` | `spec/02-MOR-MICS-v22.md` |
| `spec/02-MOR-core-v21.md` | `spec/02-MOR-MICS-v21.md` (superseded) |
| `spec/MIP-identity-draft-12.md`, `-11` | `spec/MIR-identity-draft-12.md`, `-11` |
| `spec/MIP-text-draft-7.md`, `-6` | `spec/MIR-text-draft-7.md`, `-6` |
| `spec/MIP-envelopes-draft-8.md`, `-7` | `spec/MIR-envelopes-draft-8.md`, `-7` |
| `spec/MIP-money-draft-7.md`, `-6` | `spec/MIR-money-draft-7.md`, `-6` |
| `spec/MIP-agreements-draft-11.md`, `-10` | `spec/MIR-agreements-draft-11.md`, `-10` |
| `spec/MIP-development-draft-7.md`, `-6` | `spec/MIR-development-draft-7.md`, `-6` |

The superseded texts (Identity 11, Envelopes 7, Text 6, Money 6, Agreements 10, Development 6, the core document v21, suite v21) moved with their text unchanged: they still say MIP inside, as approved. The suite's files have no MIP in their names and did not move. The four pointers F212 left (`MIP-envelope-draft-7.md`, `MIP-finance-draft-6.md`, `MIP-law-draft-10.md`, `MIP-production-draft-6.md`) now point straight to the MIR files, so no link takes two hops.

## 3. The code

**Identifiers renamed**, in 91 files (Rust, TypeScript, Python), segment by segment as F212 did:
- TypeScript: the constant `MIPS` (the six texts' spec hashes, `clients/genesis/src/core.ts` and its copy `clients/reader/src/web/common.ts`) → `MIRS`, with every client importing it (76 uses).
- Rust: the struct `agreements::Mips` → `Mirs` (65 uses); its fields and every variable and function `mips` → `mirs` (555); `Verifier::with_mips` → `with_mirs` (7); `is_mip` → `is_mir` (2).
- Comments and user-facing messages say MIR ("type {t} is not defined by the Identity MIR", "not canonical text (Text MIR, rule 1)", the collective client's "the Money MIR"). One comment that meant the whole core says the MICS (`relay/src/wire.rs`: "any act the MICS defines today").
- Test code changed only by these renames. One test's title changed with them (`clients/longform/test/floor.test.ts`: "what the floor, as the Text MIR writes it, does not cover (reported)"), and one assertion's failure message (`core/tests/chain.rs`, "a scoped key signs a higher MIR's act"). No test was added, removed or loosened.

**Left as they were, and why:**
- **The test vector generator's two descriptions** (`core/examples/gen_vectors.rs`, "Canonical text (Text MIP)…", "…(Text MIP type 0)…"). They are written into the published vectors `core/vectors/canonical-text.json` and `sequence-three-acts.json`, which must stay byte for byte. Their comments were renamed.
- **The released display client** (`clients/site/built/`): its `gateway.js` still says `MIPS`, and its WebAssembly carries the old doc comments. It is the released build, rebuilt and released after the merge, not by this pass (as F212 left it).
- **Hash tags and stand-in strings** never said MIP: `sha256("FINANCE, test value until the freeze")` and its siblings are unchanged, so every spec hash is the same.
- **`mips64el`** in the package locks is a processor, not the word.

**What a machine can see changing:**
- **The WebAssembly's bytes.** wasm-bindgen copies the exported functions' doc comments into the binary, and the core's error messages are compiled in, so the core library built for the clients differs from main's. Built from both (`npm run wasm` in `clients/genesis`): main `7c0f4394…` (the same bytes as the released display client, `clients/site/built/mor_wasm_bg.wasm`), this branch `a557f694…`. As after pull request 28, a display client release follows the merge.
- **One relay answer's plain-text reason**: asked for its commitment, the relay answers error `NOT_HELD` with the reason "…still open in the Envelopes MIR" (was MIP). The relay transport cMIP gives an error a code for machines and a plain-text reason for people; the code is unchanged. No act, receipt or signature carries it.

## 4. The remaining "MIP" list

`scripts/mip-remaining.py` reads every file git tracks (binary ones too) and finds MIP, MIPs, MIPS, Mips, mips or mip, alone or inside a name (`MIP-identity-draft-12.md`, `with_mips`), never inside cMIP or cmip and never `mips64el`. Each hit must match a reason in its table; a hit none covers is printed as UNJUSTIFIED and the script fails. `python3 scripts/mip-remaining.py --all` prints every line with its reason. On this branch:

```
   157  record: a dated report, or an earlier version of a document
   147  superseded draft, its text kept as approved
   106  record: the findings log
    47  record: a review
    30  an earlier draft of a cMIP
    29  outside the pass's list: the paper (a question in the report)
    25  an earlier version of a case study
    20  roadmap: a dated entry of a step done (a record)
    19  the released display client: rebuilt and released after the merge, not by this pass
    16  a one-line pointer at an old file name
    14  this script, which names the word it looks for
    13  outside the pass's list: the adversarial test plan (a question in the report)
     6  roadmap: a step done or a decision taken, in the words of its day (a record)
     2  the vector generator's description, written into a published vector
     2  a published test vector: byte for byte unchanged
     2  outside the pass's list: the project lead's prompt, which the author keeps (a question in the report)
     2  a dated version note: a record inside a current text
     2  the rename notes: old file names, and the word's new meaning
     1  a dated note of an earlier draft, kept in the latest one
     1  Unicode's own test data: a Korean syllable's name
     1  its own version note, quoting the old word
     1  the glossary's MIP: reserved for MOR 2's proposals
     1  a quotation of older texts' citations
644 lines justified, 0 unjustified
```

Each reason, briefly:
- **Records:** the findings logs, the reviews, the earlier rounds, every dated report in `docs/`, earlier versions of documents (case studies, the one page v6 to v10, the adversarial test plan v2 and v3, the earlier project lead prompts), earlier cMIP drafts, and the roadmap's dated entries of steps done and decisions taken.
- **Superseded drafts**, their text kept as approved under the new names, and the **pointers** at the old names.
- **Inside current texts:** the MICS glossary's MIP entry and `spec/README.md`'s rename notes, which define the word's new meaning; two dated version notes (core v20's, quoted in the MICS v22 and suite v22 histories); Text draft 7's quotation of how older texts cite it ("Text MIP, rule 3"); the one page v11's own version note; website draft 5's quoted note of draft 2.
- **Bytes that must not change:** the two published vectors and their generator's descriptions; the released display client; Unicode's own test data, where MIP is the name of a Korean syllable (HANGUL SYLLABLE MIP).
- **Outside this pass's list**, left as written (questions below): the paper's three drafts, the adversarial test plan v4, the project lead's prompt v3.

## 5. Tests

`scripts/test-all.sh`, without `--reproducible` or regtest, the tree untouched during each run:
- **main `525354a`**, before writing: Rust 652 passed, 0 failed, 1 ignored; TypeScript 288 passed, 0 failed; "All tests passed".
- **this branch `7c5600b`** (every rename, before this report and two last touches): Rust 652 passed, 0 failed, 1 ignored; TypeScript 288 passed, 0 failed; "All tests passed". The same tests, the same counts as main.
- **this branch, final commit** (this report; website draft 5's quoted note of draft 2 restored; the script justifying itself): FINAL_RESULT
- **Vectors regenerated from the renamed code**, as F212 did: `cargo run -p mor-core --example gen_vectors` (the seven files in `core/vectors/`), `mor-airgap`'s `seed_vectors` and `carry_vectors` (each compared with `cmp` against `modules/airgap/vectors/`), `npm run vectors` in `clients/longform` and `modules/jpeg`. The tree was clean afterwards: no vector file changed. `git diff 525354a -- ` over every vector file is empty; in `core/vectors/` only the README's prose and `check.py`'s docstring changed. The independent checkers agree: `modules/airgap/vectors/check.py` ("seed vectors: 24 keys checked"), `modules/jpeg/vectors/check.py` ("9 of 9 vectors agree"). `core/vectors/check.py` could not run here: its `unicodedata2` package is not installed (as in F212's pass).
- **Why that settles it:** spec hashes are hashes of the stand-in strings and, at freeze, of the texts; no tag, stand-in string, layer number or field number changed; Development's CDDL label is not encoded. So an act built by the renamed code is the same bytes as one built before.

## 6. Questions for Nobody, allegedly

One at a time, as each comes up:
1. **The documents outside this pass's list:** the paper (`docs/paper/mor-paper-draft-3.md`, "Six specifications, the MIPs…"), the adversarial test plan v4 and the project lead's prompt v3 (its table "MIPs | Identity 11, …", and the instructions on claude.ai it mirrors). Bring them along, in new versions? The prompt on claude.ai only you can change.
2. **"Core v22" as a version name.** The pass kept "core v22", "core v21" in the texts that cite a version (for example "matches core v22"), and the file is now `02-MOR-MICS-v22.md`. Should citations say "MICS v22" from the next version on?
3. **The relay's plain-text reason** now says MIR (section 3). Keep, or keep the old reason until the next relay release?
4. **The findings log.** F269 asks for "the findings' forward references" to be renamed; the instructions for this pass say the log is never edited. Left untouched; F212 added one mapping note at the head of the log. Add one for F269, saying MIP-… files are now MIR-… and the core document the MICS document?

*Also noticed, not changed:* the root README still links the core document v21 (now `02-MOR-MICS-v21.md`), and says the core library has 516 tests. It is a fact correction, not a rename, so it is left for a session that touches the README.
