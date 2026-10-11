# Money draft 7: the report

*11 October 2026. Roadmap: Money draft 7, plain reading in Agreements draft 11's style (F251), one step, texts only. Branch `claude/money-draft-7`, two commits for the texts, one for this report. For Nobody, allegedly, to review and approve.*

## In plain words

Money draft 6 was readable but out of order. Rule 15, the longest by far, covers theft of the signing key and sits in the middle. Cross-rail routes, a rarer case, came before the vault. Each rule also carried its history. Draft 7 says the same rules again, in the order a reader meets them.

**The first commit changes no rule.**

- **Part one** is a payment as it runs most of the time:
  - where it goes: the pointer, the vault and its limits, the rails the payee accepts;
  - how it is proven: receipts, claims, the rail Module's check, double entry;
  - who is seen;
  - debts;
  - buying, refunds and referrals;
  - fees.
- **Part two** is the rare cases: routes through conversion services, and theft of the signing key ("anchor or bear the loss").
- **Part three** is the act formats, and **Part four** the tasks, reasoning, open parameters and freeze scenarios.

Long rules are cut into short paragraphs and lists, and the longer ones open with an italic *In short*. Every rule has a new number in reading order with its old number beside it ("Rule 3 (was 14a)"), and a table maps old numbers to new. Rules that cite Agreements now use draft 11's numbers, because draft 11 is the approved Agreements text. The revision notes of drafts 1 to 6 and the dates of each decision stay in draft 6 and the findings log.

**How we know no rule moved:**

- No code changed, and the code's 846 tests pass, as they did before.
- A script checked every cross-reference, rule by rule, against the table.
- A second reader, who had not written the text, compared it with draft 6 rule by rule, looking only for a rule that moved. That reader found no rule whose content changed. They did find 11 wording points: summaries that left out an exception, one clause moved out of the list it qualifies, two places where text moved between protocol and commentary, and one added line. All 11 are fixed. The list below names each.

**The second commit writes in F255.** A refund paid to the refund rail a payer's claim names counts as repaid only up to the payer's vault limit for that unit. Above that limit, it counts only once it reaches the payer's vault. A refund to an anonymous payer's bare key has no vault, so it has no limit. Agreements draft 11 points to this sentence as "Money rules 14 and 14a". It now stands in **rule 17 (was 14)**, in the paragraph on money owed back, with a pointer from **rule 3 (was 14a)**.

**No questions** for Nobody, allegedly. One point was checked against the working rule and not put (below).

## What changed, file by file

- `spec/MIP-money-draft-7.md`: new.
- `spec/02-MOR-core-v21.md`, one sentence quotes the changed sentence: the broken-collective paragraph's "the refund rail the payer's own claim names, up to the payer's vault limit and above it only at the vault". Its citation now reads "Money draft 7, rule 17, and Agreements draft 11, F255, built".
- `spec/03-MOR-freeze-test-suite-v21.md`, one sentence quotes it: scenario step "The debt rule" (QG2), with the same citation.
- `spec/README.md`: one line, draft 7, awaiting approval.
- **Unchanged:** `spec/MIP-money-draft-6.md` stays as the approved text, and the reference that code comments, tests, records, Agreements draft 11, core v21 and the freeze suite cite by its numbers. The first commit changed no sentence core or the suite quotes. No code, test or record was edited.

## Old numbers to new

Every old rule has exactly one new number. None was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| 1 | 7 | One format on every rail, signed by the parties |
| 2 | 8 | Checked by the rail Module's rule |
| 3 | 9 | A trusted party, named |
| 4 | 10 | Valid only when the answer is valid |
| 5 | 24 | A valid route |
| 6 | 25 | Only conversion hops forward |
| 7 | 15 | Discharge, and an obligation's states |
| 7a | 16 | The creditor's release |
| 8 | 26 | Disclosure along the route |
| 8a | 12 | One payment, one count |
| 9 | 27 | A hop that forwarded nothing |
| 10 | 11 | Double entry |
| 10a | 19 | Refunds to the committed key |
| 10b | 20 | Referrals, and evidence of a rail Module's use |
| 10c | 18 | A purchase names the claim it pays under |
| 11 | 28 | Failure named |
| 12 | 1 | The pointer that counts |
| 12a | 4 | The payee decides which rails it accepts |
| 13 | 2 | The flow and the vault change with different keys |
| 14 | 17 | Which pointer a debt is paid to |
| 14a | 3 | Vault limits, per unit, fail closed |
| 14b | 6 | The owner is informed |
| 15 | 29 | Good faith |
| 16 | 5 | Undeliverable payments |
| 17 | 13 | A receiver is public; its flows are its choice |
| 18 | 14 | A sender is never required |
| 18a | 21 | Payouts net of fees |
| 19 | 22 | No fees for specifications |
| 20 | 23 | Attention |

Agreements citations, draft 10's numbers to draft 11's (from draft 11's own table): 14 to 10, 24 to 24, 24a to 25, 32 to 11, 32a to 12, 37d to 93, 44 to 80, 47a to 91, 47b to 92.

## No rule moved: the rule-by-rule list

*How it was checked.* I rewrote draft 6 with a checklist of every condition, exception, MUST, SHOULD and MAY, "invalid", "counts for nothing", finding tag, client conformance mark, stated cost and reading. A script then listed each rule's cross-references in draft 6 and in draft 7 and checked each one through the table; all of them map. Then a second reader, who had not written the text, compared draft 7 with draft 6, rule by rule and section by section. They looked only for a statement changed, dropped, weakened, strengthened or added. They diffed the CDDL blocks, the tasks, the reasoning and the freeze scenarios against draft 6. The code's tests, unchanged, pass (below).

**What the rewrite removed on purpose** (history only; each fact is kept in draft 6):

- the revision notes of drafts 5 and 6, and every "revised in place" note;
- decision narration: "decided by Nobody, allegedly, date, 'Agreed'" in rules 4, 17 and 19 (were 12a, 14, 10a) and in the F226 clause of rule 29 (was 15); "Confirmed as drafted (… 2 October 2026)" in rule 3 (was 14a), whose quoted reason stays; "confirmed by Nobody, allegedly" in rule 12 (was 8a), which now reads "a reading, F131, confirmed, F132";
- remarks that only told how earlier texts read:
  - "F160 withdrawn" in rule 3 (was 14a);
  - "replacing F141's 'neither counts'" in rule 11 (was 10);
  - "replacing F139, F146, F154 and F164's rule" in rule 29 (was 15);
  - "withdrawing W4's undetermined state" in rule 18 (was 10c);
  - "(formerly 'a rail proof')" in rule 12 (was 8a);
  - "Draft 4's referral note … is removed" in the receipt section, whose protocol sentence stays;
  - "Moved here from Agreements … by F126" in the creditor's release, which now reads "Agreements' type 21 is retired";
  - the bullet "Settled in this revision" under the open technical parameters.

Quotes of Nobody, allegedly, that give a rule's reason stay, in italics. Every finding tag that backs a clause stays.

### The 29 rules

| New | Was | Rule | Second reading |
| --- | --- | --- | --- |
| 1 | 12 | The pointer that counts | no difference |
| 2 | 13 | The flow and the vault change with different keys | no difference |
| 3 | 14a | Vault limits, per unit, fail closed | fixed: the *In short* now says it holds where a vault is declared (with none, everything goes to the flow) |
| 4 | 12a | The payee decides which rails it accepts | fixed: the collective's pointer left outside its history is put back inside the list of conditions, as the exception to the pointer and vault conditions it qualifies |
| 5 | 16 | Undeliverable payments | no difference |
| 6 | 14b | The owner is informed | fixed: the sentence "whether a notice arrived can never be checked…" made italic again (commentary, as in draft 6) |
| 7 | 1 | One format on every rail, signed by the parties | no difference ("the formats above" now reads "the formats of this MIP (Part three)", since the formats moved after the rules) |
| 8 | 2 | Checked by the rail Module's rule | no difference |
| 9 | 3 | A trusted party, named | no difference |
| 10 | 4 | Valid only when the answer is valid | no difference |
| 11 | 10 | Double entry | fixed: the *In short* now keeps "until the receiver signs a matching receipt" and the payer's claim deciding where the rail binds nothing |
| 12 | 8a | One payment, one count | no difference |
| 13 | 17 | A receiver is public; its flows are its choice | no difference |
| 14 | 18 | A sender is never required | no difference |
| 15 | 7 | Discharge, and an obligation's states | fixed: an added italic line ("most of the time a route is a single hop") removed |
| 16 | 7a | The creditor's release | no difference |
| 17 | 14 | Which pointer a debt is paid to | fixed: the *In short* now keeps the obligation with no act of the payee's (only at the vault, unless the payee acknowledges it) |
| 18 | 10c | A purchase names the claim it pays under | fixed: the *In short* now keeps the lone seller's offer, which names no claim (F215) |
| 19 | 10a | Refunds to the committed key | fixed: the *In short* now keeps the payment that committed to no key, whose refund is unclaimable |
| 20 | 10b | Referrals, and evidence of a rail Module's use | no difference |
| 21 | 18a | Payouts net of fees | no difference |
| 22 | 19 | No fees for specifications | no difference |
| 23 | 20 | Attention | no difference |
| 24 | 5 | A valid route | no difference |
| 25 | 6 | Only conversion hops forward | no difference |
| 26 | 8 | Disclosure along the route | no difference |
| 27 | 9 | A hop that forwarded nothing | no difference |
| 28 | 11 | Failure named | no difference |
| 29 | 15 | Good faith | fixed: F226's reason and cost put back in protocol text with "cost:", as in draft 6, not as italic "Stated cost"; the *In short* now says "by the lock change's point" and "before the first, where several affect it". The payer's duty to read the clock stays outside the client-conformance list, unlabelled, as in draft 6 |

### The other sections

| Section | Second reading |
| --- | --- |
| Header, "How to read this draft" | fixed: a line carrying the F265 working rule over from Agreements draft 11 removed, since draft 6 never carried it |
| Purpose, dependencies | no difference (10c to 18) |
| Definitions (all 18 kept, grouped under five headings) | no difference (Agreements 47b to 92, 10c to 18) |
| Act formats: CDDL | byte-identical apart from three rule numbers in comments (14 to 17, 10c to 18 twice) |
| Act formats: prose | no difference (the delivery key's rule 18 to 14; "rules 14 and 15" to 17 and 29; 10b to 20; 47b to 92) |
| Tasks, reasoning | identical |
| Open technical parameters | identical, the "Settled in this revision" bullet aside |
| Freeze scenarios (17 bullets, grouped as the parts; each kept with its scenario numbers) | no difference ("rule 14a or 16" to "rule 3 or 5") |
| Old numbers to new | matches every heading |

## F255 (the second commit)

**Where it stands:** rule 17 (was 14), "Which pointer a debt is paid to", in the paragraph "Money owed back follows this rule exactly":

> to the refund rail the payer's own claim on that payment names (key 7), where it names one, **counting as repaid only up to the payer's vault limit for its unit, as rule 3 reads it; above it, only once it reaches the payer's vault** (new in draft 7, F255);
>
> … A payer that declares no vault has no vault rule (rule 3). **A refund owed to a bare key has no vault, so no limit** (new in draft 7, F255): it is paid where the claim signed with that key says (rules 15 and 19).

- The reason follows in italics: the thief with the payer's signing key who names their own refund rail, and "vault partly exists to take care of big IOUs" (Nobody, allegedly).
- **Rule 3 (was 14a)** gains one pointer sentence: "The same limit bounds a refund paid to a payer's refund rail (rule 17; new in draft 7, F255)."
- Rule 17's *In short*, the header and "How to read this draft" (the mark "New in draft 7 (Fxxx)") say the same.

**This is the sentence Agreements draft 11 points to** (its rule 11, "Money rules 14 and 14a", and rule 93's debt rule). Those are now Money rules 17 and 3.

**Readings, not put as questions:**

- **"As rule 3 reads it."** The limit is the unit's limit as rule 3 (was 14a) judges a payment to the flow. Where several entries cover a unit, the smallest limit applies. Where the payer's declared vault has no entry for the refund's unit, the refund rail takes nothing, and only the vault counts (fail closed). That is what the library's `repaid` does (`flow_followed_vault`), and draft 11 cites rule 14a for the limit. I checked it against the working rule: where the vault's limits apply is the core's business, already decided by rule 14a (fail closed, confirmed 2 October 2026). So it is not put.
- **The bare key.** Draft 6 already implied it: a refund to a bare key ends where the claim signed with that key says, and rule 12a's pointer and vault do not apply to it (draft 6 rules 7 and 10a, now 15 and 19). Draft 7 states it as the task gave it. Agreements draft 11 still marks it "Reading, to confirm"; approving draft 7 confirms it (see carried point 1).

**In code:** nothing to build. The library's `repaid` already does this, built with Agreements draft 11 (`docs/agreements-draft-11-build.md`, section 4). Its comments cite Agreements draft 11 rule 11 and Money rule 14a, by the old numbers, as all code does until the freeze-ready draft.

## Questions for Nobody, allegedly

None. Writing exposed no flaw or contradiction in a Money rule.

## Noticed in draft 6, carried unchanged

These were in draft 6 and are kept exactly as they were. They are listed for the freeze-ready draft.

1. **Agreements draft 11 now lags Money.** Its rule 11 still says "Money draft 6, rule 14, still counts such a refund at any size", and marks the bare key's "no limit" as a reading to confirm. Once draft 7 is approved, both are stale. The task limited edits to core and the suite, so Agreements is unchanged.
2. **"FORMAT OPEN, F140 item 1"** in rule 11 (was 10): whether a rail Module declares that it binds payee and purpose. Agreements draft 11's "Decided in text only" lists a rail Module's kind as a decided Development field (OF26 a: request rail; push rail binding the commitment; push rail binding nothing). The "open" mark looks stale.
3. **Open technical parameters.** The payment commitment is still "proposed in the payment cMIP draft 2 … to be confirmed", though the code and the rails are built on it.
4. **Lightning rail Module draft 1** in the vault section, while the header is written against draft 2.
5. **Words used but not defined:** request rail and push rail, the clock, lock change, refund rail. Each is defined where it is used (rules 18 and 29, the clock's format, claim key 7), not in "Words used in this MIP".
6. **"The treasurer"** in a freeze scenario (F115) stands for whoever holds the collective's Money lane, as rule 4 says.
7. **The hash tag `"MOR/finance/anonymous-claim"`** keeps the old layer name. It is on the wire, so it stays until a freeze decides otherwise, like `"MOR/safety"` (the findings log's rename note).
8. **Rule 7's citation of Agreements rule 80 (was 44)** for "Identity's scoped key": rule 80 is how an act signed with a grant key is evaluated. Correct, but the scoped key itself is Identity's. A freeze-ready draft could cite both.

## Tests

**Main, before writing anything** (commit `5892211`, `scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed.**

- Rust workspace: 626 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 220 passed, 0 failed, in 12 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, jpeg 14, video 6.

*How it ran:* this container had no `wasm-bindgen`, which the script needs after the Rust half. I installed the version the script names (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`), outside the repository, while the Rust half ran. The run then went through in one go. The tree was untouched during the run; the draft was written in a scratch folder.

**The branch, after both texts commits** (`1188450`, same options): **all tests passed**, with the same counts as on main: Rust 626 passed, 0 failed, 1 ignored; TypeScript 220 passed, 0 failed. No code or test changed, so the code's tests pass unchanged: the check that no rule moved. The tree was untouched during the run.
