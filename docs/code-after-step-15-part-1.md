# The code after step 15, part 1: Identity, Envelopes and Text

*15 October 2026. For Nobody, allegedly. The code for the step 15 decisions that wait on nothing (F292 to F300, with F328 Q1 and Q3), built against Envelopes draft 10, Text draft 8, Identity draft 13, the MICS v28 and the freeze suite v28, with the drafts corrected where the build showed them wrong. Part 1 of 4 (`docs/roadmap-v1.md`, step 15: "the code for the decided findings"); one pull request. Test identities only; no real money.*

## In plain words first

Everything the Identity, Envelopes and Text decisions asked of the code is built, and every scenario the suite names for them now runs: in the core library's tests, in the identity gauntlet against homes, and in the air-gapped Module's own tests. Nothing failed that passed before.

What changed, in plain words:

- **The sealed envelope has no outside signature any more** (F293). Its outside proves nothing, by design; the act inside proves everything. The core library, the relay, the WebAssembly the clients use, the harness and the clients all speak the new two-part container, and a published test vector pins it.
- **An act outside its format is invalid** (F295, F296). A text act with no text, an extra field or `objects`, a publication missing its nonce, a withdrawal naming no publication, the retired type 2 (F294), and, found by the build, Identity's own routes, names and links when malformed: each is invalid wherever the client knows the specification, which for Envelopes and Text is every client. A withdrawal now also counts only from the publication's signer or its `for`, as Envelopes rule 24 always said.
- **Invalid beats unknown** (T3): a client shows an act invalid by any rule it can apply before it says unknown for what it cannot read.
- **`prev` absent or with two entries is invalid at once**, act by act (E1, F328 Q1); a wrong position or summary is judged only when a line is rebuilt (F292).
- **Someone else's evidence counts only while its signer stands by it** (F297): an objection, a cosignature or an acknowledgement disowned by its signer's rotation decides nothing, even witnessed by an accomplice. The gauntlet runs the thief's objection against a home: before the operator rotates it blocks the exit (the stated cost), after it the exit counts.
- **A verifier missing a piece says unknown** (F298), never void or invalid: a post whose line it has not fetched, a scoped act whose grant it has not seen, an identity born under a scheme it lacks, a rotation built on one it does not hold. Once the piece arrives, the answer is the final one.
- **A succession is followed only once the successor confirms it** (F300).
- **The air-gapped Module opens rule 29's exceptions only on bytes it checks itself** (F299, F328 Q3, I5): the escape out of a contested self-hosted position needs the thief's rotation; signing again after an invalid rotation needs the identity chain, against which the device runs the checks. Its text is republished as draft 5.
- **The clients tell their verifier the Envelopes and Text hashes** (E5), and compose text with the same Unicode tables the core checks with (T5).

No question for Nobody, allegedly, came out of this part: where the build met a gap, the decided rule settled it (named below, with the readings taken).

## Tests: before and after

| | Before (main at `7feaed8`) | After (this branch) |
| --- | --- | --- |
| Rust workspace (`cargo test --workspace --locked`) | 680 passed, 0 failed, 1 ignored | 701 passed, 0 failed, 1 ignored |
| TypeScript, 18 packages (`scripts/test-all.sh`'s list) | 410 passed, 0 failed | 414 passed, 0 failed (four new: `clients/genesis/test/after-step-15.test.ts`) |
| The identity gauntlet (local run) | 51 checks, all passed | 60 checks, all passed |

The one ignored Rust test is the same as before (the Lightning regtest test, skipped unless `MOR_LN_REGTEST` is set). The display client's and Dub's web client's `built/` folders are not touched: the project lead releases them after the merge.

## Which suite steps now run

| Step | Run by |
| --- | --- |
| 5.5c (F298) | `core/tests/drafts_after_step_15.rs` (three tests), the gauntlet's 5.5c |
| 5.5d (F328 Q1) | `prev_absent_or_with_two_entries_is_invalid_act_by_act_5_5d`, both orders |
| 5.7e (F297, F328 Q2) | the three tests F297 names; the gauntlet's 5.7e (two checks) |
| 5.7f (F299) | the gauntlet's 5.7f (two checks); the Module's half in `modules/airgap/tests/rule_29.rs` |
| 5.7g (I5, F328 Q3) | the gauntlet's 5.7g (two checks); the Module's half in `rule_29.rs` |
| 5.8b (F300) | `a_succession_is_followed_only_once_confirmed_5_8b`; the gauntlet's 5.8b (two checks) |
| 8.4, the F298 half | `an_identity_born_under_a_scheme_the_client_lacks_is_unknown_8_4` |
| 2.4h (F295 for Money) | `core/tests/money_f295.rs`, as before |
| Components, "Envelopes and Text" | the container (F293), `prev` (E1, F292, F328), two copies of one act (E4, now at the relay too), a key delivery with a wrong key (E7), the text act's format (F295), `objects` on a text act (F296), invalid beats unknown (T3), the withdrawal's format (F294) and its authority |

The suite's own "to build" marks on these steps are replaced by where each runs (corrected in `spec/03-MOR-freeze-test-suite-v28.md`).

## What was built

**Core library** (`core/`):

- `envelopes.rs`: `Sealed` is `[to, locked-act]`; `SealRandom` loses the one-time secret; `open` checks steps 4 and 5 only; `check_act`, the Envelopes acts' format (types 0, 1, 3, 4, 5; type 2 retired, `RETIRED_COMMITMENT`); the dead `MOR/sealed` constant removed.
- `text.rs`: `check_act`, the text act decoded strictly (type 0, a closed map, field 0 text, field 1 a 32-byte hash, no `acks`, no `objects`); `nfc`.
- `identity.rs`: routes, names, name withdrawals, link claims, confirmations and terminations decoded strictly (F295; they had been read as "other", unchecked).
- `chain.rs`: `Held.format`; `status_cx` reordered, every rule the act alone allows applied before "unknown" (T3), `prev`'s shape (E1, F328 Q1), the withdrawal's authority (Envelopes rule 24); F297 in `homeless_basis` (objections and absence statements count only valid), `cosigned` and `acknowledged` (by the acknowledging act's status); F298 in `judge` (a fourth answer, `Unknown`, when a kept line cannot be rebuilt, the line rebuilt as `Rebuilt`, `Mismatch` or `Missing`), the scoped branch (a binding not held is unknown), `Stop::Unknown` and `NoGenesis` chains, rotations beyond what is held (`beyond`), a new `Stop::CannotTell` where an objection's status cannot be told, and `status` of an act not held; F300's `succession` (`SuccessionSeen`).
- Tests: `core/tests/drafts_after_step_15.rs` (17); `sealed.json`, a new published vector for the container, checked by `tests/vectors.rs`; the envelope tests rewritten for the two-part container (`a_recipient_can_be_stripped_from_the_container`). The test world now tells its verifier the Envelopes and Text hashes, as every client does, which showed fixtures writing malformed publications: they now write them whole (`common::publication`), and two fixtures that were wrong under the decided rules were corrected (a Money claim outside Money's format no longer acknowledges, F295 with F297; a text reply naming a thread in `objects` is invalid, F296).

**Relay** (`relay/`): the container's shape (F293); E4, a held copy whose signature the relay could not verify replaced by one it can (`replace_act_bytes`), with a test.

**The air-gapped Module** (`modules/airgap/`, text `modules/module-airgap-chain-key-signer-draft-5.md`): pending-rotation fields 6 (the competing rotation) and 7 (the identity chain); `Exception::EscapeContested` and `Exception::AfterInvalid`; `Refusal::Evidence`; the self-hosted escape refused without bytes; rotation check 5 run on the new rotation when the chain is given; `online::with_evidence`. Tests: `tests/rule_29.rs` (5.7f, 5.7g). The existing exceptions test now uses a home that can refuse, since a self-hosted home refuses nothing (F299).

**WebAssembly** (`wasm/`): the verifier's constructor takes the Envelopes and Text hashes (E5); `succession`; `nfc`; the container without its one-time secret; `Stop::CannotTell` shown as "unknown".

**Clients** (`clients/`): every verifier is built with the Envelopes and Text hashes; the desk, before sending a signed act, now holds the acts it names in `objects` (a withdrawal is judged against its publication, and is unknown without it); the genesis client and the reader seal without a one-time secret; `compose` normalizes with the pinned tables (T5); a test, `clients/genesis/test/after-step-15.test.ts` (E5, F295, F296, T5, F293).

**Harness** (`harness/`): the gauntlet's five new steps (`src/gauntlet/after_step_15.rs`, nine checks); the reader told the Envelopes and Text hashes; a held objection counts as proof of a home's life only while valid (F297); the harness person can declare a successor, sign a witness act and confirm a succession.

## What was not built, and why

- **The air-gapped Module inside the gauntlet.** The harness's test identities hold their chain keys in software, so the gauntlet's 5.7f and 5.7g run the escape and the second signature against homes, and the Module's half (it signs only on bytes) runs in the Module's own tests. The online side's command (`modules/airgap/examples/online_side.rs`, used by the step 17 rehearsal) does not yet write fields 6 and 7: part 4, with the rehearsal.
- **A cosignature or a witness act disowned, in the gauntlet.** The library runs all three cases F297 names; the gauntlet runs the objection, the one that blocks the way out.
- **A key delivery "shown so"** (E7): valid by shape and ignored when its key opens nothing, at the verifier; no client yet tells the user that a delivered key was wrong. Conformance, for the clients' session.
- **Showing a succession in a client** (F300's presentation): the library and the WebAssembly say declared or confirmed; no client shows successions yet (none did before). For the clients' session.
- **`check.py` and the new container vector**: the independent Python checker has no X-Wing; the vector is checked by the Rust library only, as the README says.
- **Keeper records under F297.** The verifier takes a keeper's record as a fact the caller states (`keeper_recorded`), with no act whose signer's chain it could consult. Agreements reads keepers' records; that is G2, part 3.

## What changed in the drafts

Each change is marked in its text as corrected or written in by the build (code after step 15, part 1).

- **Envelopes draft 10**, the container's step 3: draft 10 said a relay's container id was "now the only object hashed under `MOR/sealed`"; the relay had already moved to its cMIP's own tag, `MOR/transport/sealed` (relay transport cMIP draft 4). Corrected: nothing is hashed under `MOR/sealed`.
- **Identity draft 13**, after "A verifier that cannot tell answers unknown": the build's readings written in (an act not held is unknown; a rotation built on one not held, and what is bound to it, unknown; an objection whose status cannot be told leaves the position unknown).
- **The MICS v28**, common conventions: the verdict vocabulary said once (aggregated review Q5, taken: *pending* one meaning, the "no X" family one verdict, *counts for nothing* an umbrella, the records decide nothing); F297's clause in "An act counts only where it is held" (G6). The glossary already carried Identity's four nouns of "contested" (G8).
- **The freeze suite v28**: 5.3, a text reply naming the thread in `objects` is invalid (F296; version 28 had kept version 27's sentence); every step above marked with where it runs (G9's "reasoned until built" marks, for this part's steps); the withdrawal's authority now checked by the core.
- **The air-gapped Module, draft 5** (`modules/module-airgap-chain-key-signer-draft-5.md`), draft 4 kept beside it: fields 6 and 7, rule 3.4's two exceptions as Identity draft 13's rule 29 has them, their tests, and a stated cost: a message is at most 256 KiB, so field 7 carries about thirty rotations under SLH-DSA-128s (fourteen under 128f); an identity with a longer chain leaves by the escape instead. A chain signature in the chain is not supported by this draft.

The other items of the aggregated review's list (G1 to G5, G7, G8's Development and Agreements sentences, the stale citations, the suite's 3.9 sentence, F328 Q9's scenario, F326's sentence in the founding cMIPs and Modules) belong to parts 2 and 3.

## Readings taken while building (for Nobody, allegedly, to see; any may be overruled)

None changes a decided rule; each is a detail the decided rules bound.

1. **Identity's routes, names and links decoded strictly.** F295 rested on "Identity already treats its own malformed acts as invalid"; for six of its types the library did not. They now are, by Identity draft 13's own formats.
2. **The withdrawal's authority in the core.** Envelopes rule 24 ("valid only if signed by the publication's signer or by the identity named in its `for` field") was checked by the clients only; the core now checks it, unknown while the publication is not held (F298).
3. **F298's reach.** An act not held is unknown (it was invalid); a rotation built on a rotation not held is unknown; an objection whose status cannot be told leaves the homeless position unknown (a new resolution stop), where before a void objection let it count. Written into Identity draft 13 as readings.
4. **F297's "valid".** An acknowledgement, a cosignature, an objection or an absence statement counts only with the status valid: disputed, pending, scoped or unknown count for nothing as evidence (a pending or unknown objection excepted, which makes the position unknown, reading 3).
5. **A self-hosted identity's escape without bytes.** Where the device knows every home is self-hosted, it refuses an escape asked for without the competing rotation: a self-host refuses nothing, so the first case of rule 29's exception cannot apply.
6. **With every rival abandoned, the escape counts under the old rule.** At a self-hosted home, the escape's endorsement abandons both served rotations, leaving the escape the one rotation at the position: it counts as the self-host's served rotation, not as a homeless one. Either way it counts; the gauntlet checks that it counts.

## Questions for Nobody, allegedly

None from this part.
