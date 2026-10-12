# F267, F268 and Identity rule 17 in the clients: built

*GitHub session, 12 October 2026. Branch `claude/f267-f268-rule-17-build`, pull request open, not merged. One roadmap step, three decisions built: F267 (CV1), F268 (Development draft 7, Q1), and Identity rule 17 in the clients, as settled in "Rule 17 in the clients: stopped, two questions read as mechanics". Library, WebAssembly, clients and cMIPs. **`spec/` untouched** (another session is writing the marked pass and core v22). Test identities only, regtest only, no server addresses.*

## In plain words

**F267: a silent next payee no longer keeps a paid forward open.** A conversion service takes money on one payment system and pays it on another. Until now, the only thing that showed it had paid on was the next payee's receipt. If the next payee simply never signed one, the service still owed what it had already paid. Now the service's own record of its payment, its claim, can say which payment it was passing on: one new optional field in Money's claim, "the previous hop's receipt". A route then reads as one chain where the next hop's receipt *or* the paying hop's claim names the hop before. One payment can carry one forward only: a payment claimed for two forwards carries neither, and where the next payee did sign, its receipt decides. The conversion cMIP's checker and its pinned test now read it that way.

**F268: a cMIP that checks proofs of delivery says so.** Proven offers are judged by the checker of the cMIP they name. That checker is not a numbered task. Instead, a cMIP that checks proofs of delivery declares it, by one field in its specification. The core library now reads that declaration, and asks or lists only checkers whose cMIP declares it. The anchoring and conversion cMIPs declare it.

**Identity rule 17 (now rule 35) in the clients: a key change keeps every app's line.** An identity's everyday acts form lines, one per app or device. Before a key change, the client making it now reads every act of the identity from its homes and relays, follows each act back to the one before it, and finds each line: its latest act, how long it is, its running summary, and what its latest act is, in plain words. It keeps every line. The owner can leave one out only by naming it, and only after a warning that its acts become void. A line the client cannot read (it holds a private act another app made) is shown as such, and its card is asked for: latest act, position and summary, as that app shows them. Given the card, the line is kept. Given nothing, it is left out after the same warning. The key change is never refused, and never goes ahead on a warning alone. MOR Post, the desk and the genesis client each show their own line's latest act, so the owner can tell their lines from a thief's (F152).

To read how acts chain, a client needs each act's `prev`, which only the core library can open. The WebAssembly's description of an act now gives it. The core crate and its rules are unchanged. **The WebAssembly's bytes changed**, so a display client release follows the merge.

No flaw in a MIP was found. No question comes back. A few readings need confirming against the marked pass (field numbers, mainly), listed below.

## What was built

### F267: claim field 10, and the route read through claims

- **The core library** (`core/src/money.rs`). `Claim` gains `previous`, **field 10**: the previous hop's receipt. It is decoded, encoded and refused when malformed. Key 11 is unknown. It is also added to the array an anonymous payer's key signs, so the key binds it.
- **The conversion cMIP, draft 2** (`cmips/cmip-conversion-draft-2.md`, new; draft 1 kept as the record). Items 6, 7, 11 to 14, the client conformance, the costs and the freeze scenarios now read claims. Item 15 is new (F268, below). Draft 1's stated cost CV1 is closed.
- **Its code** (`cmips/conversion`):
  - `Hop` holds a receipt or a claim (`By::Payee`, `By::Payer`), with the payment it records as its rail Module tells payments apart (`payment`, F200). A claim is read in the receipt's shape: its field 10 as the previous hop, no forward.
  - `route::carriers` lists the records that carry a hop's forward on, with Money rule 12 read over everything held. `route::from`, `route::ending_at` and `judge` use it.
  - The checker judges the onward record its proof names beside every record of the same payment, so rule 12 sees a second claim.
  - Its test spec value now names draft 2.
- **The Bitcoin clock Module** (`modules/onchain/src/clock.rs`) places a claim's payment as it places a receipt's (`Hop::record`).
- Every existing `Claim { … }` in the workspace gained `previous: None`. That is 61 literals across 22 files, mechanical, done by the compiler's own errors.

### F268: specification field 12

- **`core/src/development.rs`** (new). `checks_delivery` reads a specification's content: `12 => true` on a cMIP declares a proof-of-delivery checker. Absent means nothing is declared. Any other value, or the field on another kind, makes the specification invalid.
- **`ProofChecker::checks_delivery`** (`core/src/agreements/proofs.rs`). A checker states what its cMIP's specification declares, as a rail Module states its kind (`RailKind`).
- **`agreements::delivery_checkers`** lists the declared checkers.
- **`AgreementsView::proven_delivery`** asks a checker only where its cMIP declares it. Otherwise the verdict is unknown and names F268.
- **The anchoring cMIP**: `Checker::checks_delivery` is true, and a dated note sits under draft 4's item 10a. No rule changed. **The conversion cMIP**: the same, and item 15 of draft 2.

### Identity rule 17 (now 35) in the clients

- **The WebAssembly** (`wasm/src/lib.rs`). `describeAct` also gives `prev`: one act id, or nothing for a line's first act or a locked inside.
- **`clients/genesis/src/lines.ts`** (new, shared):
  - `actsBy` reads every act an identity signed from the given homes and relays.
  - `linesOf` follows `prev` from each line's latest act to its first. It gives each line's card (latest act, position, running summary), says what the latest act is in plain words (`whatIs`), marks this device's own line, and shows a line it cannot follow as unreadable, with why.
  - `planLines` works out what a rotation keeps and leaves out, what to show, and the warning (`voidWarning`).
  - `checkWarned` refuses to sign unless the warning shown is passed back word for word.
  - `ownLine` gives an app's own card. `readCards` reads cards as typed or pasted.
- **The genesis client** (`clients/genesis/src/identity.ts`, `cli.ts`):
  - `lines()` and `planRotation()` are new.
  - `prepareRotation()` is now async. It reads the lines, keeps them all, takes `leaveOut`, `cards` and `warned`, and signs nothing until the warning is passed back.
  - `rotate` shows the lines and takes `--leave ACT` and `--card ACT:POSITION:SUMMARY` (and `--at` for more relays). Where anything is left out it asks you to type VOID.
  - `show` gives this client's own line.
- **The collective's rotations** (`clients/repo/src/collective.ts`):
  - `changeMembers` and `rollback` take `lines` (`KeptLines`), checked before anything is signed and again at the rotation.
  - `planLines()` is new.
  - The repo command line's `change` shows the lines and takes `--leave-line` and `--card`, with the same VOID step.
- **The collective client** (`clients/collective`):
  - The member change and rollback reviews have a section, "Lines of acts the rotation keeps", with the warning in red where anything is left out. Confirming the review is leaving it out.
  - The forms gain "Lines of acts (rarely needed)": lines to leave out, and cards.
  - A typo blocks the review, with why. A line left out or unread never does.
- **Each app's own line** (F152):
  - MOR Post's card uses the shared `ownLine`. Its words now say that the client changing the key reads this line and keeps it.
  - The desk's card for each identity gains "This desk's line" (acts, latest, summary).
  - The genesis client gives its own line in `show`.
- **READMEs**: genesis, poster, desk, collective, the conversion crate, `cmips/README.md`.

## Readings taken (mechanics, to confirm)

Each respects a decided rule. Where the marked pass in `spec/` writes a number differently, the code follows it in one line.

1. **Claim field 10** is the previous hop's receipt (F267 named "one optional field", mirroring receipt field 6): the next free number.
2. **Where field 10 goes in the anonymous claim's signed array.** F267 says the array is "extended by it". I put it in field order: after field 9, before the inside keys 3, 7 and 8. *The other reading would append it at the very end.* Every anonymous claim's signed bytes change either way, since absent fields are written as null. No published vector holds a claim.
3. **A claim names the previous hop's receipt in field 10 and in `objects`**, as a receipt must in field 6 and `objects` (the conversion build's reading 4). One naming it in field 10 alone carries nothing on.
4. **Rule 12's bound, read in four cases:**
   - A claim carries a forward on only where no other claim of its payment names another hop. A payment claimed twice serves neither.
   - Where the next payee signed a valid receipt of the payment, that receipt says which hop it served, and the claim adds nothing.
   - Two receipts of one payment naming two hops serve neither.
   - A claim whose payment this verifier's Modules cannot tell apart carries nothing on.
5. **A receipt is followed before a claim**, then the smallest act id (extending draft 1's mechanic).
6. **The checker reads every record of the onward payment the proof names**, not only that record, so a second claim of the same payment is seen.
7. **Specification field 12 is `true` alone**, valid only on a cMIP. F268 named "one declared field" and no number. A value that admits only `true` gives one encoding per specification.
8. **A checker's declaration is stated in its code** (`checks_delivery`), as each rail Module states its kind. The cMIPs' spec hashes stay test values until step 17, so there is no published content to read yet. `development::checks_delivery` is the reading for when there is.
9. **A held checker whose cMIP does not declare it is not asked.** The verdict is unknown, never proven (F261: "not proven here").
10. **Anchoring: a dated note in draft 4. Conversion: a new draft 2.** The anchoring cMIP only gains the declaration. The conversion cMIP's items change with F267.
11. **`prev` in the WebAssembly is one id or nothing.** Envelopes allows at most one `prev` per everyday act (F24). An empty list, a line's first act, gives nothing.
12. **Which lines a rotation judges.** These are the lines whose latest act was signed with the key being replaced (the act's binding is the current one). A line whose latest act is older was judged by an earlier rotation. This device's own line is always kept, as before.
13. **The public acts before a private act made elsewhere show as a line of their own.** The private act's `prev` is locked, so the client cannot see that those acts continue into it. Keeping that shorter line is harmless, because the core judges each kept tip on its own. With the private line's card given, both are kept. *Stated cost:* the owner sees two lines where the other app has one, and the review says that the unreadable one holds a private act made elsewhere.
14. **Cards.** A card for a line read here must match what was read, or it is refused with why. A card for a line not found at the homes or relays is kept as given, and the review says so. The rotating client cannot check an unread line's summary; a verifier does.
15. **How the warning is "shown, then passed back".**
    - Library calls take `warned`, the exact warning, as the witness act takes its explanation (F110).
    - The collective client's review carries the warning, and its digest covers it, so confirming it is the owner's choice.
    - Both command lines ask you to type VOID.
16. **The plain words** for what an act is (`whatIs`) name each type Identity, Envelopes, Text, Money and Agreements define that a line can hold. Any other act is "an act of type N under …", and a private one is "a private act".

## Questions for Nobody, allegedly

None. Building exposed no flaw in a MIP. Readings 1, 2 and 7 are field numbers the marked pass may write differently; the code follows it in a line.

## Tests

**Before** (main at `04f743a`, `scripts/test-all.sh` without `--reproducible` or regtest, the tree untouched during the run): **all passed.**
- Rust: 647 passed, 0 failed, 1 ignored.
- TypeScript: 249 passed, 0 failed.
- The first attempt stopped at the WebAssembly step because this container lacked `wasm-bindgen-cli` 0.2.129, which the script names as a requirement. The Rust workspace had already passed. I installed it outside the tree and ran the whole script again.

**After** (this branch at `7ac8d5b`, the same script, the tree untouched during the run): **all passed.**
- Rust: 652 passed, 0 failed, 1 ignored (five new tests; one renamed and turned).
- TypeScript: 254 passed, 0 failed (five new tests; four extended or turned).
  - By package: barebone 9, collective 42, connector 12, desk 12, genesis 20, longform 26, manage 7, poster 7, reader 16, repo 19, site 58, jpeg 14, video 6, carry 6.
- The site's browser tests ran in Chromium.

*The first run on the branch stopped at one test:* the collective client's browser test, `the author, without a terminal, from the page alone`. Its selector `details.change summary` now found two boxes, because the change form holds the new "Lines of acts" box inside it. The selector now names the change box's own summary (`details.change > summary`). After that commit, the whole script was run again from the start; that second run is the one reported here.

### The new and changed tests, and how each failed first

**F267**
- `core/tests/money.rs`, four tests extended:
  - `every_payload_round_trips`: a claim with field 10.
  - `an_anonymous_claim_is_signed_by_its_committed_key`: field 10 changed after signing breaks the signature.
  - `the_anonymous_message_is_the_array_the_format_shows`: the array extended by field 10.
  - `shapes_are_strict`: field 10 is a hash; key 11 is unknown.
  - **Failed first:** all four, against the library with the struct field present but field 10 neither decoded, encoded nor signed. 6 passed, 4 failed. Then 10 passed.
- `modules/onchain/tests/conversion.rs`:
  - **`f267_a_silent_next_payee_the_services_claim_carries_the_forward_on`**: the pinned CV1 test, turned the other way. It was `question_cv1_a_silent_next_payee_keeps_a_paid_forward_open`. Now the service's claim of the onward payment names its receipt of the first hop. The route is one chain, read from either end. The judgment is delivered, and the core, asking the checker, says proven.
  - `f267_a_claim_not_citing_the_previous_hop_is_not_the_forward` (field 10 alone, not in `objects`: a default).
  - **`f267_one_payment_claimed_for_two_forwards_serves_neither`** (rule 12: both routes stop, both forwards owed, the checker not proven).
  - `f267_the_next_payees_receipt_decides_which_forward_a_payment_served`.
  - **Failed first:** three of the four, against the route reading receipts only, as Money draft 7 read before F267. The fourth is a guard that holds either way.

**F268**
- `core/tests/vows.rs`:
  - `f268_only_a_cmip_declaring_it_checks_proofs_of_delivery`: only the declared checker is listed and asked; the other's verdict is unknown, naming F268.
  - `f268_the_specification_field_marks_a_proof_checker`: the field's check on specification contents.
  - **Failed first:** both, against stubs (every checker listed and asked, the field's reading always false).
- The anchoring and conversion tests asking the core for a verdict (`modules/onchain/tests/agreement.rs`, `conversion.rs`, `harness/tests/conversion.rs`) still say proven: those cMIPs declare it.

**Identity rule 17 (now 35)**
- `clients/genesis/test/genesis.test.ts`, three new tests:
  - **Every line kept:** the client reads both lines from the homes and relay, and the other app's card matches what that app shows. After the rotation every act stays valid.
  - **A line left out on purpose:** refused without the warning passed back (nothing signed). The plan shows it in red with the warning. After the warning, its act is void and the client's own line is kept.
  - **An unreadable line:** a private act made by another app is shown as unreadable, with why. Given nothing, the warning is asked for, never a refusal. A card that contradicts a line read here is refused. Given the app's card, the line is kept and the private act is valid, opened by the reader with its key.
  - **Failed first:** all three, before the client could read lines.
- `clients/genesis/test/cli.test.ts`, extended: `rotate` shows its own line, "Kept"; `show` gives it (F152).
- **`clients/poster/test/poster.test.ts`, turned.** On main this test asserted that the genesis client's rotation voided MOR Post's line, and it passed. Now the genesis client reads three lines (its own and two MOR Posts'), the one it reads for MOR Post equal to MOR Post's own card. It rotates keeping all of them: every post valid. MOR Post still refuses to sign with the spent key.
- `clients/repo/test/repo.test.ts`, new test:
  - A collective's member change keeps another device's line.
  - Leaving it out without the warning is refused before anything is signed (no pending change, the agreement unchanged).
  - A second change leaves a line out after the warning: void, while the line kept before stays valid.
  - **Failed first** at the refusal, against the rotation keeping only its own line.
- `clients/collective/test/collective.test.ts`:
  - The "another device" test is extended: the member change's review shows that device's line, kept.
  - A new test, through the client's own requests:
    - a private line is shown as unreadable, its card asked for, and the warning shown in red, never blocking;
    - a mistyped card blocks, with why;
    - the card given keeps it, and its act is valid;
    - a line left out by name is warned about in the review, then void.
  - **Failed first:** both, with the client's source changes stashed (the tests in place). 6 passed, 2 failed.
- `clients/desk/test/desk.test.ts`, extended: after an approval, the identity's card shows this desk's line ending at the act just signed (F152).
- `clients/collective/test/browser.test.ts`: the selector, as above.

### The invariant properties, ten seeds each

Release build, the test binary run directly from `core/`, four at a time, after the full run, the tree untouched. Each run used only `AGREEMENTS_INVARIANT_SEED`, so each property ran its default 48 cases. Each log names the property and ends "1 passed; 0 failed". Total test time about 66 seconds.

| Property | Seeds | Passed | Failed |
|---|---|---|---|
| `deal_promises_hold` | `342496596031783879`, `6755445627007421233`, `6136257130434580867`, `2818509680483408957`, `7664484480162301649`, `4445024145280221603`, `3126423524274911067`, `2785939783954052435`, `8932890838322047296`, `4912703869188007102` | 10 | 0 |
| `collective_promises_hold` | `4159587585305355305`, `1228395768516556558`, `6797912394034398271`, `6985999277674342742`, `9022351374442800577`, `3545223728654024069`, `5645814605685245181`, `6176758110597886829`, `2549537153070897976`, `5186114207245317008` | 10 | 0 |

To replay one: `AGREEMENTS_INVARIANT_SEED=<seed> cargo test -p mor-core --release --test agreements_invariants -- --exact <property> --nocapture`.

### The WebAssembly's bytes: changed

- On main, the WebAssembly built by `npm run wasm` was byte for byte the published display client's (`clients/site/built/mor_wasm_bg.wasm`, SHA-256 `09901e60…b629`).
- On this branch it is `535af353…af73`, 3,708,570 bytes against 3,704,995. It changed because `describeAct` gives `prev`, and because the core library it carries now reads claim field 10 and specification field 12.
- What the display client does does not change. **A display client release follows the merge** (a `[release display client]` commit, as for F133). `clients/site/built/` is untouched here.

### Regtest

Not run: the brief asked for the script without regtest. `harness/tests/conversion.rs` compiles with the new `Hop`, and passes without running where `MOR_BTCD` is not set, as the other regtest tests do. Its route now also reads claims, but its story, the next payee signing, is unchanged.

## Not done

- **The texts in `spec/`.** Money draft 7's claim format and rules 24 and 27 (F267), Development's specification format and Agreements' paragraph on proven offers (F268), and Identity's wording. Another session writes them in the marked pass. This build follows the decisions, and readings 1, 2 and 7 say where its numbers could differ.
- **The display client release** (after merge).
- **Anchoring a Lightning onward hop** and the other open points of the conversion cMIP: unchanged.
