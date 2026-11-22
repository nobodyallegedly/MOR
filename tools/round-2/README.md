# Round two: the tools that read the round's acts

*The scripts and programs two sessions under the codemeister used on the Mac to run round two's real acts through the verifiers. They are here as handed back, with one line changed in each Rust crate (below). The write-up is `docs/code/round-2-verifier-answers.md`.*

## In plain words

These tools read a copy of everything round two left behind (the "research copy": the windows' acts, the homes' feeds, the place's record, the hosts' counts). They hold no data themselves. You tell each one, when you run it, where the research copy is, and where a kit folder is. They read in place and write nothing to disk: they print counts and verifiers' answers, with act ids cut to their first 8 characters. Two scripts are exceptions in what they print: `text.mjs` and `find-acts.mjs` print words of public text acts to the terminal, for reading, and still write nothing.

They need three things you give them by path:

- **DATA** (or RESEARCH_DIR): the research copy.
- **KIT**: a kit folder (`tools/postman/kit` on the postman branch). The scripts load its core library (`lib/core.mjs` and the WebAssembly beside it), which is mor-core built at f1a13feb.
- **The Rust programs' binaries**, for the scripts that ask verifier 2 directly: `ask` (session 1) or `count-ask` (session 2), built from the crates here.

No file names clash between the two handbacks, so everything sits in this one folder. Session 2's scripts import each other (`round.mjs`, `agreements.mjs`): keep them together.

## The two Rust crates

Each is its own crate with its own workspace, not part of the repository's `Cargo.toml`.

- **`ask/`** (session 1). Loads act files, feed pages or a list of files into verifier 2 exactly as the kit's `agreementsNewAsk` does (stub cMIPs only, no layers, no reader) and prints each answer: its word, the grammar rule applied, its qualifier and the verifier's words. `--as-default FP` is an experiment: it also holds, under FP, a K2 cMIP that answers by G4.1's default. That is not the kit's answer, and the program says so.
- **`count-ask/`** (session 2). Asks verifier 2 directly, with more inputs than the kit's binding gives: a place (`--place`, `--place-records`), cut at a position (`--upto`), the reader's anchoring (`--anchoring`), fingerprints held as pieces that are no acts (`--piece`, `--others-are-pieces`), and exploratory stand-ins for missing cMIPs (`--stand-in FP=NAME`, see `src/standin.rs`: none of them is the verifier's answer).

**The one change.** Both crates named mor-core by the Mac sessions' own checkout, `mor-core = { path = "../../../v2/core" }`. That line now names this repository's core by its relative path from the crate: `mor-core = { path = "../../../core" }`. Nothing else in them was changed: not the comments that still speak of `v2`, not the lock files, not the tests.

**Their tests still look for the vectors in `v2/`.** `ask/tests/vectors.rs` reads `../../../v2/core/vectors/agreements-new/grammar.json`, and `count-ask/tests/vectors.rs` reads `../../../v2/core/vectors/agreements-new/` unless `COUNT_ASK_VECTORS` names another folder. In this repository the vectors are in `core/vectors/agreements-new/`. So, from the repository's root:

```sh
# count-ask: point it at the vectors
cd tools/round-2/count-ask
COUNT_ASK_VECTORS="$(git rev-parse --show-toplevel)/core/vectors/agreements-new" cargo test --locked

# ask: its test has no such switch; a temporary link named v2 at the root lets it find them
cd "$(git rev-parse --show-toplevel)"
ln -s . v2 && (cd tools/round-2/ask && cargo test --locked); rm v2
```

Without that, the tests that read vectors fail, because they cannot find them (3 of 5 in `ask`, 2 of 3 in `count-ask`); the crates still build.

To build the binaries: `cargo build --release --locked` in each crate; they land in `target/release/ask` and `target/release/count-ask`.

## Session 1's scripts (handback 1)

| Script | What it does | How to run it |
|---|---|---|
| `census.py` | The census: for every home's feed, items by kind, acts by specification and type, agreements-check's answers (each act alone, and all of the home's acts held), and verifier 2's in-force answer for every Terms act. Numbers only. Opens dubsar's database immutable, so nothing is written into the research copy (and rows only in its write-ahead log are not counted). Calls `census-kit.mjs` beside it. | `python3 -I census.py DATA KIT` |
| `census-kit.mjs` | The census's decoder, in Node.js: reads a JSON list of homes on stdin, prints counts as JSON. | called by `census.py`; `node census-kit.mjs KIT < homes.json` |
| `rerun-in-force.py` | Finding 3: verifier 2's `in_force` for each entry of `hosts/count-rerun.json` (its Terms version in force and its deal version), with every act of every feed and of the place's record held. `--as-default FP` runs the experiment. | `python3 -I rerun-in-force.py DATA ASK_BINARY [--as-default FP ...]` |
| `lists.mjs` | Finding 2: compares lists of a home's acts, posted as text acts, with that home's feed, and recomputes each list's hash in several forms. Counts and hashes only. | `node lists.mjs DATA KIT HOME LIST_ACT_ID ...` |
| `identity.mjs` | Finding 4: an identity's chain judged by the core's Identity verifier, with every Identity act of every feed held. Short ids, types, positions and answers. | `node identity.mjs DATA KIT IDENTITY_PREFIX [ACT_PREFIX ...]` |
| `rotations.mjs` | Finding 4, exploratory: every rotation in the feeds, by what its bytes show, and whether any act signed with the replaced key extends a kept tip. Counts; short ids only for the identity asked. | `node rotations.mjs DATA KIT [IDENTITY_PREFIX]` |
| `find-acts.mjs` | Finds acts by id prefix and describes each: where it is, signer, spec, type, references; for a text act, its length and first characters, to the terminal only. | `node find-acts.mjs DATA KIT [--full] PREFIX ...` |

## Session 2's scripts (handback 2)

| Script | What it does | How to run it |
|---|---|---|
| `round.mjs` | Reads the round's data in place, into memory: the module the others import. | imported |
| `agreements.mjs` | The round's Agreements acts, decoded in memory; prints counts. Imported by the others. | `node agreements.mjs DATA KIT` |
| `overview.mjs` | For each entry of the rerun count, the acts of its two agreements, in the place's order, with their knots. | `node overview.mjs DATA KIT [ENTRY]` |
| `run.mjs` | The plan's questions about the rerun's agreements, asked of verifier 2 (`count-ask`) and of the kit's own binding side by side; flags any difference. | `node run.mjs DATA KIT COUNT_ASK [--mode as-shown\|anchoring] [--upto N] [--stand-in FP=NAME ...] [--entries a,b] [--roots r1,r2] [--full]` |
| `check.mjs` | Runs the repository's `agreements-check` on every Agreements act file, held together, and on the rerun's agreements alone; tallies verdicts and notes. | `node check.mjs DATA KIT AGREEMENTS_CHECK_BINARY` |
| `groupb.mjs` | The lineups: each voter's assents in each entry the lineup names, which version each names, where the place shows it, and verifier 2's answer. | `node groupb.mjs DATA KIT COUNT_ASK [--stand-in FP=NAME ...]` |
| `resolves.mjs` | Every Statement of kind resolve, what it names, and verifier 2's answers about it and its signer's line. | `node resolves.mjs DATA KIT COUNT_ASK` |
| `params.mjs` | A few fields of Terms acts (control parameters, in force, condition, relies on, receiver), no words. | `node params.mjs DATA KIT ID_PREFIX ...` |
| `text.mjs` | Prints a public text act's words to the terminal, for reading only. | `node text.mjs DATA KIT ID_PREFIX ...` |
| `tables.mjs` | Prints, as Markdown, handback 2's appendices: each agreement's acts with their knots, and the answers per verifier. To the terminal. | `node tables.mjs DATA KIT COUNT_ASK --stand-in FP=NAME ...` |

Run each from any folder, giving absolute paths; run Python with `-I`, so that nothing in the data's folder is loaded as code.

## What was checked here

On 22 November 2026, in this repository: `cargo test --locked` passes in both crates once the vectors are reachable (`ask`: 5 passed; `count-ask`: 3 passed, with 90 of 120 grammar cases asked and matched, and the checker's verdict and rule matched on 43 valid and 116 invalid cases); `python3 -I -m py_compile` passes for both Python scripts; `node --check` passes for every `.mjs` script. Nothing here was run against the research copy: it is not in this repository.
