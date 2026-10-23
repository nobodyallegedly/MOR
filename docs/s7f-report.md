# S7f, the last core session before the quiet window: report

*Session S7f, 23 October 2026, branch `claude/s7f-last-before-quiet`. The decisions written in: S7e's question 2 (F389), F391, F392. This session recorded no finding of its own: F393 stays free. The questions below go to Fable before they are decided; the branch carries my lean on each.*

## In plain words

- **A judge must name every branch its requester knew.** A judge's settlement of a deal's fork now counts as having seen the request it answers, with everything the requester had signed before asking. A judge who keeps A and drops B, while the requester had signed a third version C, settles nothing.
- **A deal's money can go straight to the deal's split service.** A payment to the pointer of the service the payee's own grant in the deal names (or a backup) now counts for that payee. Nobody has to point their whole wallet at the service, and tips to a person still go to that person.
- **A collective's sale is a purchase.** The collective's stake in itself counts as a stake in every work it sells under its agreement, so its sales are purchases, not money owed back, and a buyer's contest shows beside them.
- **Every seller can read the buyer's claim.** A client conformance sentence: where a purchase's payee is a collective or a deal with several parties, the buyer's client makes its claim readable by every member or party. Its stated cost: they all see who bought.
- **A pass over the texts for sentences no test exercised.** Identity, Money and Agreements, read whole: 460 such sentences. 22 of them now have test cases. Three are places where I ran the core and confirmed it does something else than the text: those, and the readers' other suspected differences, are questions below. No rule or code changed because of them.

## What changed

**The texts** (one line each under "After the box" in the workbook):
- Agreements 17, "What a settlement could see": "what it cites, a judge's settlement its request, each with its own history (what its `prev` and the predecessors its `objects` name, followed back)". The prompt asked for no text change unless the stranger found the sentence unclear; the stranger did (two definitions of "history", and the request not named), so it is named.
- Agreements 17, after "A contest of a purchase": F391's client conformance sentence, its stated cost in the same italic paragraph.
- Agreements 17, the glossary's "Stake": a stake in the collective itself is "a share of all that collective's income, whoever earns it and whenever, and so a stake in every work the collective sells under that agreement" (F392, 2: the word the purchase rule needed).
- Money 11, rule 4's second condition: F392's clause, with the appositive split after the stranger's reading ("field 14's, the agreement's designated pointer; field 29's, a backup"). One sentence after the conditions: for such a pointer, the first and third conditions read the grantee's own pointer chain and vault in force, the pointer counting where rule 1 counts it. Without it, rule 4's first and third conditions ("the payee's pointer", "the ones rule 29 selects") read literally cancel the clause.
- **Agreements rules 15 to 17 and the pointer check (rule 16) need no change** to read with the clause; one tension the stranger found is question 1.

**The core** (`core/src/agreements/`):
- `view.rs`, `deal_walk`: a judge's settlement's seen set adds the request it cites, with the request's history (`keepers.rs`, `act_history`: `prev` and every `objects` predecessor, followed back), each version found there with its own history.
- `view.rs`, `payment_counts_rec`: a payment to another identity's pointer counts where that identity is a `designated_grantees` of the payee for what the payment follows (terms; an offer made under terms; an obligation naming terms; the version named and the version in force), the pointer counting on the grantee's own chain (`pointer_counts`) within the grantee's vault. A deal's grants count only where the deal carries them (`deal_services`); a collective's grant only where the payee is the collective (its own signed and consenting, or a founder's "this collective" grant in the founding). New: `record_counts`, the same asked of a held receipt or claim.
- `view.rs`, the purchase path: `work_stake` (a stake in the work, or in a collective's terms with none, the collective's own stake), used by the purchase check and `claim_version`; `sold_under_own_stake`, by which `sellers`, `claim_holders` and `claim_line` name the collective itself.
- One unit test changed what it checks, because the rule changed: `f190_qf2_the_reference_names_the_judge_of_forks`'s "Three, not seen" case had the requester sign Three before asking. It now makes Three after the request (the F192 case it meant), and asserts the new reading beside it (Three signed before the request, unnamed: nothing settled).
- The rehearsal script (`scripts/rehearsal/rehearse.ts`) matches the clock's identity by a pattern, the placeholder or a hex identity, as it does for the two authors.

**The vectors** (`core/vectors/verdicts.json`, 153 cases, 2,413,352 bytes): 29 new, every one passing in Rust, each earlier case keeping its verdict, its place and its act ids, the pool's earlier acts unchanged. Two new questions, "payment counts" and "purchase"; no new fact. Seven cases from the decisions (a judge's settlement and its request's history, two; a deal's payments, three; a collective's sale and its contest, two); run against the core as it was before this session, the judge's, the collective's two and the payments counting gave the old answers (the payment cases through the old pointer check, which refused any other identity's pointer); 22 from the pass (below). Both READMEs carry "What changed since the previous edition". `python3 core/vectors/check.py`: "all 192 vectors agree".

## The untested sentences

`docs/untested-sentences.md` holds the full lists. **Read:** Identity, Money, Agreements, whole. **Remaining:** Envelopes, Text, Development.
- **Found:** 460 sentences a verdict turns on that no case exercised: 366 the core follows, 58 questions, 36 that no vector can show (client conformance, stated costs, facts outside the core).
- **Now exercised:** 22 of them, money, exits and authority first: the old home's rotation beating a final escape, an escape standing against an objection, a self-hosted identity's rotations (Identity); which pointer a debt is paid to, who signs Money's acts (Money); a deal's fork settled by its parties, two settlements tangled, the parties' against a judge's, a tip not held; purchases naming no claim, a claim, a lone seller's offer; two keepers under each rule; a deal designating no pointer (Agreements). The other 344 stay listed with a plan each; about 30 need a question or a fact the vector format does not have yet (a payment to a vault, an invalid or pending rail answer, a closing's "counts").
- **Questions:** 58; three confirmed by running the core (questions 4 to 6), Identity's confirmed by its reader's probes, the rest a reader's reading of the code (question 7).

## Questions, for Fable before they are decided

**1. Money rule 4 against Agreements rule 17's guarantee.**

*Plain words:* Rule 17 promises "money goes only to an address the owners signed", and says the owners' pointer leads to the first service, checked by rule 16. With the new clause, a payer may pay the service's own pointer directly, an address the service signs alone and can change.

*Options:* (a) as built and written: the owners' signed grant naming the service is their signature of where the money goes; rule 17 already accepts a backup's own signed pointer. (b) One clause in rule 17's guarantee: "or the pointer of a service their grant in the terms names (Money rule 4)".

*Lean:* (b), wording only, in the next text pass. *Cost:* none in verdicts; without it a careful reader finds the guarantee narrower than the rule.

**2. Which version of the terms lists the grant.**

*Plain words:* A deal's later version may drop a service. The core counts a payment at a grantee's pointer where the grant is listed in the version the payment follows or in the version in force.

*Options:* (a) as built, either. (b) The version in force only (rule 15: "read from the holding agreement's version in force"), judged as the chain stood for the payment.

*Lean:* (a): a payer pays under the version it names, as a purchase names its line (rule 12). *Cost:* a service the parties removed still receives, for its payee, payments that name the older version.

**3. A backup's pointer counts without a failed attempt.**

*Plain words:* Agreements rule 15 says a backup receives a payment only once the attempt before it failed. Money rule 4's clause counts a payment to a backup's pointer for the payee, whatever happened first; whether the first attempt failed is the split cMIP's answer, which the core never holds.

*Options:* (a) as built: Money counts it as paid; whether the backup should have been tried is the split cMIP's (rule 17's italic: a payout to a backup unknown, never a mismatch, without its answer). (b) Unknown in Money until the split cMIP's answer says the attempt failed.

*Lean:* (a). *Cost:* a payer who skips the first service still discharges, and the trail shows it.

**4. A rotation built on a pending rotation is invalid in the core; the text says pending** (confirmed by running the core).

*Plain words:* Identity says an act bound to a rotation not yet receipted is pending, "never valid and not invalid". The core answers invalid for a second rotation built on a first that waits for its receipt, and for every act bound to it, and both become valid once the receipt arrives.

*Options:* (a) the core follows the text: pending (`chain.rs`, `status_cx`), with a vector. (b) The text says such a rotation is invalid until its predecessor counts.

*Lean:* (a), after the quiet window. *Cost:* a core change after the box; the C verifier must meet it.

**5. Terms nobody signed "claim" a work in the core** (confirmed).

*Plain words:* A payment for a publication "carrying a work some agreement claims" must name the claim. The core reads any held terms staking the work, signed by nobody. So anyone can publish draft terms over another's work and turn its Money-only sales into refunds owed.

*Options:* (a) the core reads only agreements that exist (rule 1) (`view.rs`, `claimed`), with a vector. (b) The text says any terms.

*Lean:* (a). *Cost:* a core change; a claim by a deal not yet signed by all no longer reaches payments.

**6. One payment counts toward two debts in the core** (confirmed).

*Plain words:* Money rule 12: records of one payment naming different purposes share it only under a named batch; otherwise a verifier holding both counts neither. The core reads each debt alone, so two claims of one payment toward two debts each count in full.

*Options:* (a) the core counts neither until the receiver resolves them (`view.rs`, `paid_toward_if`), with a vector. (b) The text narrows.

*Lean:* (a). *Cost:* a core change; a payer splitting one payment across debts must name a batch.

**7. The other suspected differences, not yet confirmed.** The readers name 52 more; each is in `docs/untested-sentences.md` with the code it cites. The weightiest, all reader-only save Identity's (probed by its reader):
- Identity: a homeless rotation made final by an escape through different homes (text: only under the rule it declared); a self-hosted identity's homeless rotation counting without its new homes' receipts; a disowned act whose only acknowledgement is unknown or pending answering void, flipping to disputed later; a signing key of the wrong length accepted.
- Agreements: outcome 2 of a declaration of absence not built; the owners' consent counted on the current roster, not the roster at the line; "what others relied on" read on any act, a one-party draft included; a member key and a grantee's acceptance ending with their holder's later rotation; a succession clone placing the successor elsewhere answering unsettled, not invalid; the pointer check (rule 16) feeding no verdict; splits not following stake transfers.
- Money: a receipt's field 0 never compared with the pointer's rail; a refund repaid by a receipt under a revoked grant.

*Lean:* a session after the quiet window confirms each by running the core on its case, then writes the vector or the question. *Cost:* none now; they are listed, not acted on.

**8. F391's sentence and what stands near it** (the stranger's reading). Agreements rule 16's set-aside italic lists "sending every buyer's claim to every owner (it reveals buyers)" among rejected mechanisms for the pointer check; F391 now does it, for another reason, at the stated cost. A party that is itself an agreement cannot be sealed to (rule 57 makes such acts public).

*Options:* (a) leave both: the set-aside was about the pointer check, and "readable" covers public. (b) A clause: "or public, as rule 57 says where a member or party is itself an agreement".

*Lean:* (b) in the next text pass. *Cost:* none in verdicts.

## The stranger's reading

A subagent read only the eight texts and the diff. No finding number, review label or history appears in the changed passages. Taken, wording only: the request named in "What a settlement could see", with its history defined there (it found two definitions of "history" and the request unnamed); rule 4's appositive split for field 29; the sentence after rule 4's conditions (read literally, the first and third conditions cancelled the clause); "and so" in the glossary. One reader of the pass also caught that the sentence first cited "rule 12" where the pointer that counts is rule 1, now fixed. Not taken, as questions: rule 17's guarantee (question 1); which version lists the grant (question 2); F391 beside rule 16's set-aside and a party that is an agreement (question 8); "judged by Agreements as rule 7 judges a collective's pointer", which the stranger found vague: it is F392's own words, and says that Agreements, not Money, judges the grant; the glossary's "income" being wider than sales (a stake in itself still covers all income; "and so" names the consequence the purchase rule needs).

## For the Dubsar Suite

**The WebAssembly interface:** no function added, removed or renamed; no argument changed; no new error code. `AgreementsView::record_counts` is new in the core and not exported.

**Functions whose answer moves:**
- **`agreementsPurchase(specs, id)`**: a collective's sale of a work its agreement stakes only through the collective's own stake now answers `"purchase"` (it answered `"no-purchase"`, "carries no stake in the work it pays for"), or `"unrecorded"` until the collective's chain records it on a request rail. *Result shape:* unchanged. *Inputs that matter:* the collective's receipt, with consent (its Money area's holders) and its rail accepted (a pointer of the collective naming the rail); `specs.railValid` for the claim and the receipt.
- **`agreementsPurchaseContests(specs, purchase)`**: the buyer's contest of such a sale is now shown (it showed nothing). Shape unchanged.
- **`agreementsOwedBack(specs, collective)`**: such sales no longer appear as owed back. Shape unchanged.
- **`agreementsClosing(specs, id)`**: reads the list above, so a closing such sales blocked may now be complete. Shape unchanged.
- **`agreementsPaid(specs, id)`** (what is paid toward an obligation): a payment stated in `specs.railValid` as paid to the pointer of the deal's split service (or a backup), where the payee's own grant to it is listed in the deal's field 14 or 29 and the deal carries its grants, now counts. Shape unchanged. *Inputs that matter:* `specs.railValid` naming the service's pointer act as where it was paid; the deal's terms and grants held.
- **`agreementsVersionInForce`, `agreementsDealFork`**, and everything that reads a deal's version in force (splits, `agreementsPayerSplit`, layer services): a judge's settlement now settles nothing where the request it answers had seen a version the settlement neither keeps nor names; the deal stays on its reference. Shape unchanged. *What avoids it:* the judge names every tip the requester had signed.

**Unchanged:** the Money functions (`moneyJudge` and the rest), which never read Agreements; a Money-only reading shows a payment at a grantee's pointer as it did ("paid to another identity's pointer" in the payment cMIP, whose step 3 is the suite's draft 5).

## The releases rebuilt

After the MOR lead merged the splits round (pull request 104; main green at `bc926601`), I merged main into this branch, and again after Ummia's round (pull request 106, app-only, merged at 16:11 UTC). Each time the one conflict was a generated file (Edubba's, then Ummia's `built/BUILT-WITH.txt`), which the rebuild rewrites. After each merge I rebuilt all six releases in this branch, as their READMEs say:
- `cd clients/genesis && npm run wasm`;
- then `npm run release` in `clients/site` (the display client), `clients/dub`, `clients/kishib`, `clients/damgar`, `clients/ummia` and `clients/desk` (Edubba).

Each one's `npm run test:build` passed: it builds the release again and finds the same bytes. The tools were rustc 1.97.0, wasm-bindgen 0.2.129 and each client's pinned esbuild. All six carry the same WebAssembly: SHA-256 `7e59bfcd94243b89…`, 5,246,036 bytes, work hash `4896106160b80cb6…` (as `BUILT-WITH.txt` records it). The JavaScript glue is unchanged: no interface change.

## The box

`scripts/c-box/make-c-box.sh` into a scratch folder, after the final text and vector edits: it refused nothing, 8 texts, 12 vector files. (A first run refused a pointer to `docs/` in the box's vector README, now reworded.)

## Checks run

- `cargo test --workspace --locked`: all green (88 test binaries).
- `gen_vectors`: the vectors written as above; every earlier case byte-identical at its place.
- `python3 core/vectors/check.py`: "all 192 vectors agree".
- After the second merge, Ummia's suite again: 34 of 34 on three runs; one run before them failed its new by-clicks browser test at a Mac's size (the screens, not the core), which then passed every time; its message was not kept.
- Every client suite CI runs, run here on the merged branch and this core: desk (Edubba, 105, the splits round's shared-deal and collective-sale tests among them), dub, damgar, ummia, kishib, barebone, collective, connector, genesis, grants, longform, manage, kit, anchoring-service, testwallet, reader, repo and reports. All passed.
- Not run here: the regtest job (btcd and lnd). CI runs it.
- CI on GitHub, read by me: green on `744e61ef` before the merge (all, regtest, browsers, seal, release: the reproducible display client). After the first merge and rebuild, on `9b8eb6ba` and `f9ace56f`: read on the pull request. After the second merge and rebuild: the final head's result, read by me before marking it ready, is on the pull request.
