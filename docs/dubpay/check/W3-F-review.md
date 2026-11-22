# DubPay W3-F: review of Damgar tray 0.2.3 (the payment-report key fix)

The stint's wish (Nobody, allegedly, 20 November 2026): "Current wish: extract data, knowledge and understanding from the simulation run"
His order (20 November, through the MOR lead): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications."

Reviewer: a DubPay check session (W3-F), reading the code cold. This is a review, a proposal for the leads. It decides nothing. No file was changed but this one.

Read: the two commits on `docs/dubpay/build/damgar-tray/` on branch `claude/dubpay-fix-report-key` (0.2.2 as released, then the fix), `damgar-flow.test.mjs`, `README.md`, and the core library's own sources (`core/src/chain.rs`, `wasm/src/lib.rs`).

How each finding is marked:
- **[ran]**: shown by running, in this session.
- **[traced]**: traced in the code, by reading.
- **[inferred]**: inferred; not shown either way.

## In plain words

1. **The fix works where it claims to.** A forged report no longer confirms a payment, and no longer closes a still-owed line. Only a report the core library calls "valid" can do either. I ran the test, and all four cases pass on 0.2.3 and fail on 0.2.2.
2. **"Valid" only means valid against the acts you hold.** If you have not fetched someone's key change, a report signed with their old, stolen key still shows as valid and confirms. The screen says "checked against its signer's chain" and does not say "as held here".
3. **A real report from the wrong person is shown in the payment tree, with a reassuring tick.** It does not confirm anything, but it reads as if that person received the money. Separately, anyone can say "I passed this payment on", and the receiver's genuine report then marks it CONFIRMED. That was already true in 0.2.2.
4. **Some words on screen are wrong.** "NOT PAID" and "no received line held" appear even when a report is held but not yet checked. "Disputed" is explained wrongly. The `reports` command shows a forged report's lines, though the README says it does not.
5. **The test misses half the fix.** Removing the check from the "paid later" path breaks no test. Removing the hiding of forged lines breaks no test either. My lean is that Damgar should ask the verifier for `bindingStatus`, not `status`.

## 1. Does the fix do what it claims?

The claim: every report is judged by the core library's verifier, and only a report judged "valid" can confirm a payment or close a still-owed line.

How 0.2.3 judges [traced]:
- `reportsFrom` collects every act in the answers it reads.
- It builds one `mor.Verifier` from three sources: the identity records the kit holds (`Kit.heldRecords()`), every `.mor` file in `acts/`, and those answer acts.
- It sets `r.standing = v.status(r.id)` for each report. If the call throws, the standing is "unknown".
- `counts(r)` is true only when the standing is "valid".

Every path by which a report can act on what the reader sees:

| Path | Where | Needs "valid"? |
| --- | --- | --- |
| A passed-on line marked "CONFIRMED by the receiver's own report" | `confirmed()`, called from `follow` | **Yes** [traced]. `counts(x)` is part of the `find`. A forged receiver report gives "by the payer's word only" [ran: test case 2; probe D3]. |
| A still-owed line marked "PAID LATER by report …" | `closing()` | **Yes** [traced]. `!counts(x)` skips it. A forged closing report gives "NOT PAID" [ran: probe A1]. |
| "PAID LATER …, confirmed by the receiver" | `confirmed()` inside the closing branch | **Yes** [traced], through the same `confirmed()`. |
| The draft-6 commitment path (`--preimage`) | `follow(reps, c)` | **Yes** [traced]. The same `follow`, `confirmed` and `closing`, and the same standings. |
| A report shown as "X… received N sats" (the tree) | `follow`, the line per report | **No, by design.** Invalid and void reports are collapsed to one line, "NOT COUNTED … Its lines are not shown" [ran: test case 2]. Every other standing (unknown, pending, disputed, not counting, scoped) is printed with its amount, and the standing is written after it [ran: test cases 3 and 4]. |
| The `reports` command | the `reports` case | **No.** It prints every report with its standing, and **every line, forged ones included** [ran: probe J]. |
| The summary line "Signatures, judged …: 2 valid, 1 invalid" | the `flow` case | Counts every report held, not only those on this payment's path [traced]. |

So the claim holds for confirming and closing. It does not hold for "shown as received": that rests on a label, not on the verdict. The README's "its lines are not shown" is true in `flow` and false in `reports`.

## 2. Can a forged or unverifiable report still mislead a reader?

- **A chain held only in part ("pending").** Handled for counting. "pending" is not "valid", so the report confirms nothing [traced]. I made a report under a key change that has no home receipts, and the core said "pending" [ran: probe R2]. Damgar prints "UNCHECKED: its signer's chain is not complete here", then the line "to check it: … --get /identity/ID". Fetching the identity record may not be enough: what is missing may be a home's receipt for the rotation [traced in `chain.rs`, rotation step 2; inferred for the round's homes].

- **A disputed chain.** Counting is handled: "disputed" never counts [traced]. **The words are wrong** [traced]. In the core, `Disputed` means "Valid, and shown as disputed: voided by a rotation, but another identity acknowledged it or a keeper recorded it (rule 16)". It is a state of one act, not of the chain. Damgar says "its signer's chain is disputed". A chain the core cannot settle is a different case, the "contested" stop of `resolve`, and Damgar never shows it. Whether a disputed report should confirm a payment is a question of the rules, not of code. Damgar refusing it is the cautious reading; I would ask the leads.

- **A valid report from the wrong signer.** Confirmation is handled: `confirmed()` requires `x.signer === receiver` [traced; ran: probe C]. **It still misleads** [ran: probe C]. Under the owner's passed-on line, `follow` recurses on that payment's settlement and prints every report that names it as received, whoever signed it. So the stranger's genuine report appears in the tree as "… received 60 sats (…; signature checked against its signer's chain)". It sits directly under "by the payer's word only". A reader can take it as the payee's receipt. This was already in 0.2.2, but the new tick makes it more convincing.

- **Claiming someone else's payment.** Not handled; this was already in 0.2.2 [ran: probe H]. A receiver's received line names only the amount and the settlement, and the receiver's report is public. So anyone who reads it can sign a valid report of their own saying "passed on 60 to the owner, settlement S". Damgar then shows "CONFIRMED by the receiver's own report". The confirmation proves the receiver was paid under S. It does not prove this payer paid. Whether the report format should bind the payer (for example, the draft-6 commitment) is a rules question for the leads [inferred].

- **A report named in two answers.** Handled [ran: probes D1, D2, D3; traced in `Verifier::add`]. The act id does not cover the signature. Two copies with the same id therefore carry the same content, so the lines Damgar shows are the same either way. When the verifier receives a copy with a good signature, it keeps that copy over a broken one, in either order. A genuine report plus a broken copy gives "valid". A broken copy alone gives "invalid". `out.set(d.id, …)` removes the duplicate on Damgar's side.

- **A rotated identity.** **Not handled when the rotation is not held** [ran: probes R1, R3, R4]. This is the most serious remaining gap. I took a test identity, wrote its key change, and then made a report with the old key, as a thief holding that key would.
  - Rotation not held: the thief's report is "valid" (under both `status` and `bindingStatus`), and in `flow` it CONFIRMS the payment.
  - Rotation held in `acts/`, but without home receipts: the rotation does not count, so the result is the same.
  - Damgar fetches nothing itself: no key change and no receipts. The verdict is right for the acts held. What misleads is the words "signature checked against its signer's chain", where "as held here" is true.
  - The reverse case is safe: the genuine new-key report is "unknown" or "pending" until the rotation counts, so it confirms nothing.
  - Once a rotation counts, reports made before it and not listed as kept become void, and Damgar hides them [traced, rule 16 in `chain.rs`; not run].

- **Acts in `acts/` that the user did not fetch.** These feed the verifier only, never the list of reports [traced]. A receiver's report that sits only in `acts/` is not shown, and the line reads "payer's word only" [ran: probe E]. That fails safe. The danger is the other way round: whatever was *not* fetched (a key change, receipts) can leave a stale "valid" (see the rotated identity above). Also, `acts/` is read in full whatever `--from` names, and so are all held identity records [traced]. The verdict therefore does not depend on which letters you pass.

- **The order acts are added to the verifier.** Handled [traced, ran]. The core says "Each index is kept in act-id order, never in arrival order" and "a copy with a valid signature is kept over one without". Probes D1 and D2 gave the same output in both orders.

- **When the verifier cannot be built.** Every `add` and the `heldRecords()` call are wrapped in an empty `catch` [traced]. If the kit's `Kit` has no `heldRecords`, every report silently becomes "unknown". That fails safe, but the hint the user sees ("fetch the identity") will not help. The top-level `import` of `kit/lib/kit.mjs` is *not* caught [traced]. On a kit without that file, every command fails before it starts, `balance` and `pay` included [inferred: that depends on the round's kit, which I did not have].

## 3. "status" or "bindingStatus"?

What the core says [traced]:
- `bindingStatus` is for "everything binding (keeper records, payments, discharge of debts, agreements, forks, closings)". It gives "unknown" where the answer rests on this client's own failed attempts to reach homes, or on what it found at homes.
- "Reading and following an identity use `status`."
- The Money bindings in the same crate use `binding_status` for their own payments (`wasm/src/money_js.rs`).

What Damgar does [traced]. It never calls `failedToReach` or `foundAtHome`, and Damgar's verifier has no other way to get such inputs. So today the two calls give the same answer. My probes showed the same value from both in every case [ran: R1, R2]. Swapping in `bindingStatus` also passes all four test cases [ran: mutation M3].

**My lean (the reviewer's, not a decision):** use `bindingStatus` for `counts()`, meaning confirming a payment and closing a still-owed line. Those are exactly "payments" and "discharge of debts" in the core's own list. The swap costs nothing today. It stays correct if a later version starts recording failed attempts or private links found at homes, for example by reusing a kit verifier that does. `status` may stay for the display label if the leads want it. If both are kept, each should be used for its stated purpose.

## 4. Is the test sound?

**Run.** The round's kit (`kit/lib/core.mjs`, `kit/lib/kit.mjs`, `kit/mor.mjs`) is not in this repository. So I did this:
- I built the core library's WebAssembly from `wasm/` with the pinned tool versions.
- I wrote a **stand-in kit of my own**. Its `core.mjs` re-exports the built bindings, with plain hex helpers and placeholder spec hashes. Its `kit.mjs` has a `heldRecords()` that yields the acts in `in/` answers to `GET /identity/…` and `GET /feed?signer=…`. Its `mor.mjs` sends nothing.
- The stand-in is my guess at the kit's shape, not the kit. Everything marked [ran] is shown against the real core and my stand-in.

Result [ran]:
- 0.2.3: `ok` ×4, "all passed".
- 0.2.2: `FAIL` ×4, "4 failed". The README's "All four fail on 0.2.2 and pass on 0.2.3" holds.

Would each case fail if the fix were removed? I removed one piece of the fix at a time [ran]:

| Mutation | Case 1 genuine | Case 2 forged | Case 3 chain not held | Case 4 payer unchecked |
| --- | --- | --- | --- | --- |
| M1: no `counts()` in `confirmed()` | ok | **FAIL** | **FAIL** | ok |
| M2: no `counts()` in `closing()` | ok | ok | ok | ok |
| M3: `status` → `bindingStatus` | ok | ok | ok | ok (as it should) |
| M4: invalid and void lines no longer hidden in `flow` | ok | ok | ok | ok |

Reading this:
- Cases 2 and 3 are the real guards, and only for `confirmed()`.
- Cases 1 and 4 check that the right words appear. They fail on 0.2.2 only because 0.2.2 printed no standing at all.
- Nothing guards the still-owed path (M2) or the hiding of forged lines (M4). Case 2's `/NOT COUNTED: its signature fails/` matches the label alone, whether or not the lines are hidden.

Missing cases (each would be a test identity in memory, sending nothing):
- A forged or unchecked closing report: the still-owed line must stay NOT PAID (kills M2).
- A forged report's lines must not appear in `flow` (kills M4), and the same for `reports` if the README's promise is kept.
- A valid report from the wrong signer: no CONFIRMED, and not shown as the payee's receipt (probe C).
- A report signed with an old key after a rotation, with the rotation held and counting. That needs home receipts in the fixture. Without the rotation, the expected answer should be written down as a known limit (probes R1 and R3).
- "pending", "void" and "disputed" reports: none confirms, and each label is right.
- One report in two answers, one copy broken, in both orders (probes D1 and D2).
- The `--preimage` (draft-6 commitment) path with a forged full report.
- A kit whose `heldRecords` throws or is missing: everything shows "unknown", nothing confirms, and no crash.
- The test builds folders under the system temp directory and never removes them [traced]. That is harmless, but it is worth a cleanup.

## 5. Anything else in the diff that is wrong, unsafe or misleading

- **Contradicting lines** [ran: test case 3's own output]. When the receiver's report is held but unchecked, the passed-on line still reads "by the payer's word only (no received line from the receiver held)". The very next line shows that receiver's report, held, marked UNCHECKED. "Held but unchecked" should be said as such.
- **"NOT PAID in any report held"** [ran: probe A2]. This is printed when a genuine closing report *is* held but its signer's chain is not. That overstates the case against the payer: the right words are "paid by a report not yet checked".
- **Standings with no label** [traced]. "not counting" and "scoped", which the core can return, fall to the generic `UNCHECKED: the verifier says "…"`. They do not count, which is safe. But "scoped" means the act may be valid under Agreements, which Damgar does not judge, and the user is not told that.
- **The words "signature checked against its signer's chain"** [traced, ran]. These should say the chain as held here: see the rotated identity in section 2.
- **README** [traced]: "its lines are not shown" is false for `reports`. The README says "the identity records held in `in/`", but which answers count as identity records is decided by the kit's `heldRecords`, which is not in the diff and which I could not read.
- **Comments** [traced]: the 0.1.2 comment "say whose word each line rests on" and the new block comment agree with the code. The version strings are updated in both places.
- **Outside the diff, noted only** [traced]: `check ACT`, used before `pay`, prints "Signed by … (the identity that signed it)" from `describeAct` alone, without the verifier. Same class of fault, different path. It was not part of the claimed fix.

## Limits

- I did not have the round's kit. The test and all probes ran against the real core library (built here from `wasm/`) and **a stand-in kit I wrote**. If the real `heldRecords()` reads different answers, or `plain()` converts differently, the results may differ.
- The spec hashes in the stand-in are placeholders, so the report spec is not one the verifier knows as Money. Damgar's own verifier gets the kit's real hashes. A report under a spec the verifier recognises may be judged by more rules than I exercised [inferred].
- "pending" was shown only through a rotation without home receipts. "disputed" and "void" were not constructed. They are traced in `chain.rs` only.
- The probes (A1, A2, C, D1 to D3, E, H, J, K, R1 to R4) and the mutations (M1 to M4) were scripts in this session's scratch space. Under the hand-back rule, only this file is committed. Each probe is described where it is cited, and can be rebuilt from `damgar-flow.test.mjs`'s own helpers.
- No home, relay or network was used. Every identity was a test identity made in memory and discarded. No real money was involved.
- I read nothing of DubPay's beyond the three files named in the brief, and nothing of the round's records.
- This is the reviewer's reading. Which findings matter, and what changes, is for the leads and Nobody, allegedly.
