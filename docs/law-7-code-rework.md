# The code reworked to Law draft 7

*1 October 2026. A report for the project lead, from the build window of the roadmap's item "the core library and the repo and collective clients reworked to Law draft 7". Branch `claude/law-7-code-rework-j7w1j5` (the branch this session was given; the task named `claude/law-7-code`), made from main with the collective client branch (`claude/step-11b-collective-client`) merged in first. Not merged to main. The roadmap is not edited.*

## In plain words

The code now speaks Law draft 7. A collective's agreement has areas (who decides what), a constitution changed by everyone unless the founders agreed otherwise, and a mark on every clone saying which rule brought it in. Members leave alone, by a resignation; the collective writes it on its own record, its line, and from there on the member's signature counts for nothing. "Before" and "after" are read only on the collective's own sequence, whatever device a member signed from. The core library checks all of this from the bytes, and the two clients use it.

Some parts of draft 7 could not be built, because their formats are still open in the text: the abandonment declaration, revocations, imports, the fork rule, keeper records, stakes, split plans and refund terms. The core refuses them rather than guessing; the scenarios that need them are marked "reasoned" below. Building also found one flaw (a rotation that declares nothing drops a recorded clone) and twelve questions where the texts are silent or allow two readings. They are listed at the end, each with options and a lean.

The deployed test collective was founded under draft 6 formats and must be founded again (test only): the new core cannot read its founding agreement.

## What was built

**Core library** (`core/src/law/`, replacing `core/src/law.rs`):

- `formats.rs`: terms with field 4 as a rule (founding: every party) or a mark (a clone), fields 18 (constitutional change rule), 19 (areas, each with a permanent id) and 20 (each area's words); the key grammar without key 2 (refused if present); resignations (type 16, stepping down with field 1); records (type 17: a clone, the signature acts completing it, the other sequences' tips, registrations); grants with fields 5, 6 and 7; the rotation's Law declaration `[clone, [+ signature act]]`. The checks needing no other act: a deal's rules are every party (F107); founding terms need every party (Q11); judges serve no other task (Q20, Q24, Q25); one time reference (Q31); areas don't overlap, reach operational fields only, carry distinct ids, have holders in founding terms (Q5, Q21, Q32); every constitutional voice is covered by the abandonment clause (F105); F96 as before.
- `tiers.rs`: what a clone changes, field by field and entry by entry, the tier of each change, the area it lies in (lanes from the collective's own terms, R4, extensions by Production field 10), and the powers the mark must name (rules 44a to 44c).
- `view.rs`: agreements and deals; the collective's declarations (a rotation's clone complete only with the signature acts it names, Flaw M); records and lines (A1, A2, Q36); the agreement in force for an act (rule 37c), with concurrent records of sibling clones leaving the parent in force (A4); "made before, made after" on the collective's own sequences, with keepers placing the collective's own acts (C4, Q34); members' signatures placed by the collective's acts (C1, C2); departures, flaw C counting, a departed voice counting through a signature placed before the line (Q23); members' own rotations registered on the line (C5, Q33); frozen areas and stepping down (Q13, Q17); grants within areas, through a freeze, reinstated (Q22, Q27, Flaw N, A6, C8).
- Two small public helpers in `core/src/chain.rs` (an act's acknowledgements; the line ending in a kept tip), which the ordering rule reuses from Identity.

**WebAssembly bindings** (`wasm/src/lib.rs`): every Law call takes the six MIP hashes; Law errors carry a stable code (`law/check: …`), so clients never match wording; new calls for a clone's changes and powers, records, resignations, the agreement in force, the collective's current state, before and after, and acts under grants.

**Repo client** (`clients/repo/`): the release rule is an area every member holds; founding by every founder; member changes by resignations the collective registers on a record, a clone marked with the constitutional change rule, and a rotation naming its signatures; ordinary changes (the release area's words) recorded at once, without a rotation; the abandonment clause removes a voice (F105). Release verification fetches the collective's own records. `cmips/cmip-release-manifest-draft-2.md`: rule 3 of what counts as a release, rewritten for areas and the collective's own sequence; nothing else changed. Draft 1 is kept until draft 2 is approved.

**Collective client** (`clients/collective/`): every review is read from the exact bytes, as before, and now says in plain words: founding needs every founder; a clone's mark and whether it names exactly the powers its changes need (a false mark shown in red); who decides what, by tier; the release area (holders, how many decide, its own words, stepping down, frozen); leaving alone and when it takes effect; F105 coverage. New actions: **Leave** (a resignation alone and the collective's record, nothing else; reading 8 replaced: leaving is no longer a member change), **Step down** from the release area (frozen when nobody holds it, releases then refused), and an **ordinary change** of the area's words (recorded at once, no rotation). Before any record, the client fetches the collective's acts and warns if one of its sequences would be left out (client conformance). Reading 6 is settled by F104 (a clone's field 4 is its mark). The client no longer matches the core's error wording: it reads the error's code. The repo client gained, for it, three optional fields in the collective file (departures, steppings down, records) and a fix in release verification: the collective's own acts are loaded before judging a release's standing, which records made necessary (a release followed by records and a rotation was otherwise reported void).

## What the tests show

- Rust, `core/tests/law.rs` (11) and `core/tests/law_collective.rs` (20), all pass, with the whole workspace (relay, harness, air-gapped Module, bindings) still green. Scenario 3 steps run on real signed acts: 3.2, 3.7 (with Flaw M and F100), 3.7a to 3.7n where formats allow (3.7m's refit by redraw included), 3.7o's stories; scenario 3.8 and 3.8b are reasoned (they need the abandonment declaration); scenario 1's steps 6, 7 and 9b (a deal changes only with everyone).
- Repo client: 11 of 11 (against real homes and a relay), including a member leaving alone, the rotation naming its signatures, and an ordinary change recorded without a rotation.
- Collective client: 15 of 15 (reviews from bytes, the whole flow by requests against real homes, and once by clicks in headless Chromium): found, add, remove (resignation, record, clone), release, leave alone, the refit (first refused in plain words by F96 and the absence rule, then with the rules rewritten), an ordinary change, stepping down until the area freezes, and the warning for a left-out sequence.

**Against the ordering simulation.** The simulation's 19 stories still pass on their own. Where the core can run the same story on real acts, it gives the same verdict:

| Story (`harness/ordering/tests/stories.rs`) | Core test (`law_collective.rs`) | Verdict |
| --- | --- | --- |
| `flaw_e_and_f_forgotten_devices` | `a_departure_takes_effect_at_the_labels_line` | same |
| `flaw_f_completed_clone_stays_complete` | same test (the clone part; the paid publication needs a payment format) | same |
| `flaw_g_friend_ack_places_nothing` | same test; `the_treasurer_adopts_a_cmip_and_the_record_places_it` | same |
| `flaws_h_i_and_q30_grant_through_a_freeze` | `an_area_freezes_and_its_grants_wait_for_the_refit` (reinstatement path) | same; the seal path not run (revocation and import formats open) |
| `flaw_j_no_keeper_needed_for_area_acts` | `a_departure_takes_effect_at_the_labels_line` | same |
| `flaw_k_ack_after_the_seal_binds` | not run (revocation format open) | reasoned |
| `flaw_l_a_year_of_receipts_survives_a_declaration` | run with a resignation in place of the declaration (format open) | same rule, same verdict; C7 itself reasoned |
| `q23_signature_placed_before_leaving` | `a_departure_takes_effect_…` (two of three), `a_number_never_asks_for_more_voices_than_remain` (three of three) | same |
| `q28_declaration_never_undoes_a_recorded_clone` | run with a resignation (C2) | same rule; the declaration reasoned |
| `attack_omitted_fork_and_the_keeper` | `an_omitted_fork_a_keeper_and_a_backdated_fork`, `the_keepers_of_the_agreement_in_force_place` | same |
| `attack_backdated_fork` | `an_omitted_fork_a_keeper_and_a_backdated_fork` | same |
| `attack_concurrent_lines` | `concurrent_lines` | same |
| `choice_late_completion` (α, adopted as C1) | `a_departure_takes_effect_…` | same |
| `addition_a2_records_name_their_signatures` | `the_treasurer_adopts_a_cmip_…` | same |
| `agreement_fork_status_quo` | `concurrent_lines` | same |
| `c5_member_rotation_registered_on_the_line` | `a_members_own_rotation_is_registered_on_the_line` | same |
| the two random sweeps | the simulation's own (0 wrong answers) | not replayed in the core |

One difference of reading surfaced and was settled by the freeze suite's own words (question B3 below).

## Not built, because the format is open

Refused by the core with "not supported yet", never guessed: the abandonment declaration (type 13: so F105's declared absence, Q28, Q37, C7, scenario 3.8's trigger and 3.8b's automatic succession, whose plan power needs the trigger); revocations and imports (types 10, 11: C6, Flaw K, scenario 3.4, 3.5 and the seal path of 3.7m); the fork rule (field 10: 3.3's ranking); keeper records (type 2: a verifier states which acts each keeper recorded, in order, as it already does for Identity); stakes, split plans and refund terms (fields 7, 8, 17: the scenario steps that use refund terms or the split plan were run with an area's own words, an operational field with exact format). A payment format for "paid on" (A6) is Finance's: the tests use the collective's acknowledgement, which the rule treats the same.

## A flaw found while building

**B1. A rotation that declares nothing drops a clone the collective recorded.** Law says the agreement in force for an act is the one the chain declares at the act's binding, or a clone recorded under that same binding. A collective that adopts a payment cMIP (recorded, operational) and later rotates its keys without declaring a new clone (to fence off a departed member's share, say, before the refit is signed) would, as written, fall back to the agreement before the payment cMIP for every act under the new key: the treasurer's adoption silently undone. *The core refuses that case for now (`unsettled`).* Options: (1) a rotation that declares nothing carries forward the agreement in force at the rotation, records included; (2) every rotation must declare, re-declaring the agreement in force (a record's clone then "declared" by a rotation although not constitutional); (3) as written, the cost stated. *Lean: (1); it matches "every complete clone is written on the collective's record at once" and needs no new format.*

## Questions where the texts are silent or allow two readings

Each was implemented the conservative way, and is listed here for a decision.

- **B2. Lines among themselves.** Rule 1 of "Made before, made after" says an act not before a line counts as after it. Read literally between two records drawn on two devices, each would be "after" the other, so each would judge the other's clone under the wrong parent, and A4's fork could never arise. *Implemented:* for a record's own agreement in force, only records strictly before it count; for any other act, a record it is not before counts. *Lean:* keep; say so in the text.
- **B3. A departed member's early signature that the rotation does not name.** Under three of three, Ana signs a constitutional clone, the collective acknowledges it, Ana resigns, and the rotation names only Ben's and Cy's signatures. *Implemented,* following scenario 3.7's words ("three voices count for it and three signatures are needed"): Ana counts as a voice, so the two named do not meet it. Options: (1) as implemented; (2) a voice through a signature counts only where that signature is named. *Lean: (1).*
- **B4. Where a change of a task's cMIP lies.** Rule 44b's first bullet puts it in the task's lane; the last bullet puts "that field or task" in an area naming it by a field reference `[1, task]`. *Implemented:* the lane, else an area naming the task, else no area (the clone rule). *Lean:* keep, and write it so.
- **B5. A rotation declaring a clone that changes no constitutional field.** Rule 37 says rotations declare constitutional clones and "only the last changes the constitutional tier". *Implemented:* refused (the collective's member-signed acts then count for nothing). Options: refuse; accept it like a record. *Lean:* refuse.
- **B6. A rotation declaring a clone several steps down the agreement chain.** Rule 37 allows descent "through complete clones", but an unrecorded operational clone has no line at which its completeness is judged (A2). *Implemented:* the declared clone's parent must be the agreement in force at the rotation. *Lean:* keep; every operational clone is recorded at once anyway.
- **B7. An area kind naming genesis, rotations or records.** "Never in an area's reach": *implemented* as invalid terms. Option: allowed but reaching nothing. *Lean:* invalid.
- **B8. The order of a mark's signers.** Powers are ascending; signers' order is not said. *Implemented:* any order, no repeats. *Lean:* ascending by hash, for one encoding per meaning.
- **B9. "A keeper recorded it" (C4).** One named keeper, or the keepers' own rule (any one, a threshold, all)? *Implemented:* the keepers' rule (rule 8). *Lean:* keep.
- **B10. "Named again by a later version it signed."** *Implemented:* a constitutional clone after the version the member left, naming them (as a party, or as the area's holder), signed by them by a signature the collective did not place before their departure line. An ordinary clone that only copies the old list does not restore them (found by the collective client: otherwise a holder who stepped down would count again by signing a change of the area's words). *Lean:* keep. *Known gap:* the core's summary of a collective's current state (`current`) shows frozen areas without this restoration; the counting itself applies it.
- **B11. Rule 47's "a clone naming both branches".** A clone names one parent (field 11). How does a clone resolve two concurrent records? Options: a new field naming the other branch; a clone of either branch recorded after both lines. *Lean:* the second, stated in rule 47; it needs no new format.
- **B12. The abandonment declaration's format** (the largest gap): rule 51 lists what it states (agreement, clause version, party, outcome) without a format. *Lean:* `{ 0 => agreement, 1 => the clause's agreement version, 2 => party, 3 => [+ outcome] }`, naming the agreement in `objects`, so that records can register it and scenario 3.7k and 3.8 can run.

- **B13. A judicial-only change in the collective client** (only who judges absence changing) is refused there rather than prepared under the clone rule, since the client's rules forms change members and rules together. *Lean:* add it to the client when the abandonment declaration has a format.
The third pass's eight readings, to be confirmed at the end of the roadmap, are unchanged; the code follows them.

## The deployed test collective (test only)

The test collective on the deployed homes (`a02ff57a…bb25`, founding agreement `a66171cc…f77a`, its clone `75e37214…6322`) uses draft 6 formats: its founding terms list publications in key grammar key 2, which draft 7 retires; its rotation declares the clone as a bare id, without the signature acts Flaw M asks for; it has no areas. The new core refuses to read its founding agreement, so its releases 5a.1 and 5a.2 no longer verify with the new clients (they still do with the code at `d510beb`).

It cannot be carried over: a clone needs a readable parent, and a genesis cannot be re-declared. Refounding it takes, on the Mac, with the new clients:

1. Keep the four test members' identities: Identity did not change, so they need nothing new.
2. Found a new test collective with `mor-repo found` (or the collective client): every founder signs the draft 7 founding terms (release area held by every member, any two signing; constitution by every member; abandonment clause removing a voice), a fresh safety key is dealt, a new genesis on the three homes.
3. Publish a release, have two members sign it, and verify it from a fresh clone knowing only its id and one home.
4. Run the member change of step 5a again the draft 7 way: the leaving member resigns alone; the collective records it; the two who stay and the newcomer sign the clone; the rotation names the three signatures.
5. Retire the old collective's file (`~/mor-test/collective.json`), keeping a copy as the record of step 5a's run; nothing on the relays needs deleting (test acts, wiped at step 17).

## The human test that follows

On the author's Mac, after `npm run wasm` in `clients/genesis`: the refounding above with `mor-repo`, then the collective client's "done when" through **MOR Collective**: found a test collective with two simulated members, add one, a member leaving alone (a resignation and the collective's record, shown in plain words), the refit, a release signed under the new rules, stepping down from the release area and seeing it frozen, and an ordinary change recorded without a rotation; each read in plain words before signing.
