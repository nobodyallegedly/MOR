# DubPay W2-A: the players' apps, Money's side

*DubPay, 21 November 2026, for Nobody, allegedly, to decide. Nothing here is decided. Every row is in `features-money.json` with full act ids; the counts come from `scan-apps.mjs`. Marks: **counted** (by the script), **traced** (followed act by act), **inferred** (our reading).*

## In plain words

The players built about twenty apps. Twelve do something with money that Damgar does not, or does less well. These are the five we would add first:

1. **An invoice that answers itself** (Hop's answerer). Someone posts "I want to pay you N"; your app makes the invoice and replies. This round's money waited longest for invoices, and the tray Damgar can only make one by hand. → Damgar.
2. **Money held for others** (Stall's held.mjs). Stall, Hop and DubWeb ended the round holding money for others under signed "held for you" lines. Damgar never reads those lines. → Damgar's view of what is owed.
3. **The payee's record before paying** (The Back Row's lookup.mjs, and Kept Word's delivery count). Who warned about this identity, who proved a debt against it, who received what they paid for. Show it as "read these first", never as a refusal on its own. → Damgar's `check`.
4. **The facts at the moment of paying** (Pointer Look, Buy). The receiver in all 64 characters. Payments are final, and a refund is only a promise. Is each signature proven? Are the Terms in force? "Unchecked" is not "no". → Damgar. Reading the Terms goes to Edubba.
5. **Loans and mutual credit** (Steward's shelf.mjs, the Cercle's counting script, mending.mjs). Lent, late, returned; hours owed and confirmed, counted in a unit that is not sats. → the pot reader.

The faults players found in Damgar were all fixed, except one: it still does not check a report's signature against its signer's chain.

## The table

One row per feature. Acts are shortened here; `features-money.json` has every id in full.

| # | Feature | App | Author | Media hash | Version | Acts (use) | Proposed Dubsar app | Why |
|---|---|---|---|---|---|---|---|---|
| 1 | Answer a wish to pay: `ASK v1` → a single-use invoice of exactly N, under a cap, its description hash the asking act → `INVOICE v1`; also claims HELD lines with `CLAIM v1` | Hop's answerer | Hop (a48e4b24…96c5) | none: code is the text of act 46aaf149…; text SHA-256 919407f9…090b, 5,408 bytes | 0.1 | announced 9a49cfc8…; ASK 1 act, INVOICE 1 act, both Hop's self-test (**counted**); named in 18 acts, 7 signers, 6 windows (**counted**); Ampersand ran it (**traced**) | Damgar | Damgar's tray app makes invoices only by hand. The desktop design has an answerer, and Hop copies it. Payouts waited on invoices: 79 of Tobias's 100 sats (37df0a45…); Hop's fifteen unused invoices (**traced**). Gap **inferred** |
| 2 | Bind the invoice to the request: description hash = the asking act, the asked amount, the payee the Terms name; refuse anything else | Hop's answerer; the Commission 1 test | Hop; Sanne Verhoeven (f9de7f3e…5291) | as row 1 | 0.1 | 46aaf149…; test 084335c6… point 3 (**traced**); no payer seen refusing an unbound invoice (**counted**) | Damgar | `pay --from ACT` already names the act. Checking the invoice against it closes the swapped-invoice gap. The commission asked for it, so it is a prompt pattern, not proven demand (**inferred**) |
| 3 | Held for others: each HELD line open, claimed, paid (preimage against an invoice the owner signed) or closed; others' claims ignored; release "unchecked" | held.mjs | Stall (ddafffcd…a66e) | 381f2c97f6d3d4fb1d9c9dd3af197992193fcc35d4af6a83407b8bf70a66ee83 | 0.1 (3,482 bytes) | 863a5bbd…; HELD lines 23 acts, 4 signers; CLAIM lines 8 acts, 7 signers (**counted**); held 3,078 sats (Stall, 8e000dc1…), 746,566 (Hop, 8df3e122…), 2×500 (DubWeb, 14c9e044…) (**traced**) | Damgar (owed view); pot reader beside tab debts | Held money is DubPay's area. Damgar's flow reads leg reports only (**inferred**) |
| 4 | The payee's record before paying: warning notices, proven claims, delivery receipts with outcome, theft or confirmation by chosen witnesses, money held for it | lookup.mjs | The Back Row (8f16771e…d833) | 0601ada550d91bd413f78b3ab622677dea5dc162768150dbaf2740d01ccb7884 (1); 4377dc53c1bf317a5ca87d86733197f2a2f42bc89b85411f13f6c52806fe35d1 (1.1) | 1 (5,602 bytes), 1.1 | a6bb8104…, 5b936578…, 81ba353a…; named in 5 acts; notices signed 13 acts, proven claims 6, receipts 9 (**counted**) | Damgar (`check`, `pay --from`) | Damgar's `check` reads only the act in front of it (**inferred**). Pointer Look 0.1.5 and The Back Row agree a notice is "read these first", never a refusal (06ee9a70…, c03b0054…) |
| 5 | A seller's delivery count: receipts by seller, delivered against "key never received" | kept.mjs | Ana Lúcia Prado, Kept Word (28070ee8…ee26) | 1326720ed970a98f7722cf8f7c457bed27f1e967c6f45b4154e44368151e76ef (text of act 3fdf9b59…) | 0.1 (3,942 bytes) | a2cca3ae…; named in 3 acts; receipts named in 19 acts, 9 signers, 6 windows (**counted**) | Damgar, as a source for row 4 | A payer asks whether the seller delivers before paying. The receipt itself is DubLaw's |
| 6 | The facts when paying: the receiver in full; final, a refund only a promise; signatures proven or not; "unchecked" is not "no"; notices as "read these first" | Pointer Look | Pointer (84ae1e82…095c) | 46098770…0b5b (0.1), 2b1864f3…5119 (0.1.1), dc09721e…7a0f (0.1.2), b3a51fda…9307 (0.1.3), a176a9f9…6f08 (0.1.4), b26c525d…0514 (0.1.5) | 0.1 to 0.1.5 (6,002 to 10,810 bytes) | a1371377…, d2b3c552…, 7e1aa448…, 9d6aab2e…, cc41c70c…, 06ee9a70…; named in 12 acts, 2 signers (**counted**) | Damgar; the Terms lines (in force, forked assents, who can see that you paid) go to Edubba | Damgar shows the signer field. Keep (4c9e5c04…) and the lurker's report found a signer is not proven without its record (**traced**) |
| 7 | Pay only under Terms in force, in one command: check, sign the buyer's assent, publish, pay | Buy | Bilal Qureshi (60f1db04…56ed) | 1b2f1ea251aa49e61b18b228df4b5f459b6e72ad755910a942fbcdc694bcbc25 | 0.1 (1,861 bytes) | 0476ac58…, 0d54f2c3…, 6f62a02f…, a105cc72…; named in 8 acts, 4 windows; nobody seen paying with it (**counted**); the lurker's reading: it looks for the word "shown" and pays any invoice (084335c6…) | Damgar for "refuse unless in force, say unchecked"; Edubba for the assent | Damgar 0.2.1 refuses NO TERMS but its release says nothing of in force (**inferred**) |
| 8 | A payer's proof of a debt from bytes: invoice act signed by the debtor and holding the invoice, preimage matching, amount matching; rival claims ordered by a witness place | register.mjs (Proven claim) | Pierre Silva and co. (21a3f657…da1b); run by Pierre Muller (4e760abc…a1d6) | dffe90fb…5806 (0.3), 0372e86b…6cc5 (0.4), 259a2d6d…08f1 (0.5), 2992758f…d74e (0.6) | 0.3 to 0.6 (3,767 to 6,144 bytes); code read | e038575c…, cbce1eab…, 623a2749…; claims signed 6 acts, 6 signers; named in 10 (**counted**) | Damgar (owed view, row 4); pot reader for group claims | Damgar marks such a line "the payer's word only". This proves it without the payee's receipt (**traced**) |
| 9 | Loans and returns: open, late by block height, returned by the borrower's word, closed, contested; deposit; LEND lines overdue by due date | shelf.mjs; mending.mjs | Steward & Co. (2c381cf6…d9f9); a public prosumers identity (e4e5f6db…8c04) | 342921d6dd5cce99de3a37c08eb24392ff7bdaecd147f04f19122dfd8588d572; mending is act 046b26cd… | shelf 0.1.0 (4,733 bytes); mending 1,791 bytes | 30969bb4…, 73a05f6e…; lending shelf named in 6 acts, 3 windows; MEND, LEND and RETURNED lines 12 acts, 8 signers (**counted**); Ampersand ran shelf.mjs (**traced**) | Pot reader | Loans are one of DubPay's five areas. Neither Damgar nor pot.mjs reads one (**traced**) |
| 10 | Mutual credit in a unit that is not sats: hours "owed" by the receiver and "confirmed" by the giver; balances per member; "confirmed" against "word only" | Cercle counting script; mending.mjs | Dalia (058d65d4…130c) | 117f7d47163b62ca4fe3eb49d560e840b397538b0b254a6712ae9cb3cbd99ce1 | 2 | 666266e2…, 3024f5c3…, 3b531727…; CERCLE lines 2 acts; script named in 11 acts, 3 signers (**counted**) | Pot reader | pot.mjs counts sats only (**traced**). Its rule that a repayment counts only once confirmed already fits; it needs a named unit |
| 11 | Open books: every sat in and out, each edition starting with the one before unchanged, the arithmetic checkable | DubWeb's open books with Ummia | DubWeb (762c0b4c…7f8b) | editions are acts; Ummia media in the script's output | editions 1 to 3 | 2b30872d…, 9e1daa90…, 07e88e37…; named in 27 acts, 6 signers, 5 windows (**counted**); eeaac58a…: matching a line needed DubPay's word on the payment hash (**traced**) | Damgar writes and checks an identity's books, with payment hashes; Ummia keeps its reader | A report of what was paid and what is owed is Money's work. Only the payer's app holds each payment hash |
| 12 | The seller's side: who has paid, delivered to once; stop if sealing fails | Courier | Yuki Sato (cbccc51a…7920) | 9b6c2f609864c0f4a8ae668a334d39edccd1628385db3ea095e528efa338f482 | 0.1 (2,283 bytes) | fc9fecab…; named in 6 acts, 4 windows; no delivery seen made with it (**counted**); it trusts any file named "paid" (084335c6…) | Damgar for "who paid, once", from the bank's answers; delivery to Dub (DubWeb) or Edubba's delivery statement | DubPay's own batch list showed a paid invoice as open (5ebd5412…, found by Tobias, 37df0a45…) (**traced**) |

**Not Money's.** Named by the lead's settlement, and left there:

| Feature | Apps | Goes to |
|---|---|---|
| Reading Terms before signing or buying; a contest entry's checks | words-check.mjs 0.1.0 and 0.1.1 (Steward & Co.), turnstile-check.mjs (Turnstile), Pointer Look's Terms lines, Buy's assent | Edubba (DubLaw) |
| Warnings while reading the feed; full identities | Fennec 0.1 (public prosumers) | Dub (DubWeb) |
| Making warning notices and a register | The Back Row's register.mjs and its cMIP | Dub (DubWeb); Damgar only reads them (row 4) |
| Identity safety: a word in advance about rotations; recovery | standing.mjs 0.1 to 0.3 (Sanne Verhoeven, Counterparty), keep-recover.mjs 0.2 (Keep) | Kišib (DubWeb) |
| Evidence and time: citation cards, bundles for an arbiter | Pointer Cite 0.1 to 0.3.2, Postmark's prove.mjs and bundle.mjs | Ummia (DubWeb); DubLaw where an award uses it |
| Signed credits | credits-read.mjs (Ampersand) | Edubba (DubLaw) |

**Already matched.** Hop's pot-settle.mjs (act 2525e63d…) does what pot.mjs 0.4 already does, so it is worth keeping only as shared test vectors. Hop's tab clearing is checked by pot.mjs since 0.2 (**traced**).

## Damgar's reported faults

| Fault | Reported by | Acts / report | Fixed |
|---|---|---|---|
| 0.1.0: the report spec hash had 62 characters (its "7a" was missing), so `flow` never matched | Tobias (public 30 to 49) | 7a8c4db3…, 930b3377…; public-30-49/day-2-window-3.md:202 | 0.1.1 (31febb34…) |
| `pay` paid at once: no confirmation in 0.1.x, and no `check` in 0.2.0 | Tobias; The Back Row; Stall used only `check` and `balance` | 7a8c4db3…, aa723fb7…, ad6bda39…; the-back-row/day-4-window-2.md:63 | 0.2.1 (6fe32aed…) |
| 0.2.1 and 0.2.2 were announced but never stored, so fetchers got 404 and fell back to 0.2.0 | Stall; DubWeb; Hop and Longhouse didn't install it | 43a4c7bd…, 7084340b…; hop/day-4-window-3.md:50, longhouse/day-4-window-3.md:55 | Stored 14:24 (6f03bd9f…); since then each release is fetched back before its act |
| `flow` showed only the payer's word | Clara (public under 30) | cf29c9d0… | 0.1.2: CONFIRMED or "the payer's word only" (7b14f38f…) |
| `flow` did not join later reports, so a share paid later still showed as owed | the lurker | lurker/day3-window1.md:36 | 0.1.2: PAID LATER |
| A report's key is never checked against its signer's chain, so a forged report would show as real | the lurker | lurker/day3-window1.md:36 | **Not fixed**: 0.1.3 says it does not verify (9be6cfc3…); row 6 |
| Beside Damgar: DubPay's batch list kept a paid invoice as open | Tobias | 37df0a45… | Unknown |

All **traced**. The script counts 27 acts and 12 report lines outside DubPay that name Damgar next to a fault word; most are about something else, and these seven are what reading them left.

## Prompt patterns

- **Notice 7** asked teams to build tray apps, publish them as media with hash and size, and read any app before running it. The app wave follows it. "Read it before you run it" (or close) appears in 36 acts by 15 signers in 15 windows (**counted**).
- **Notice 8** invited attacks for bounties. Tobias's and The Back Row's Damgar reports came in that frame (**traced**).
- **"Something MOR has not been used for"** opens 7 day-five announcements by 7 signers in 7 windows (**counted**): the lending shelf, the pot, credits, proven claims. It is not in the hosts' notices, so it reads like a day-five prompt (**inferred**).
- **Buy and Courier** were read as candidate pieces for Odile Ferrant's Commission 1, the lurker window's task (084335c6…). Row 2 is that commission's point 3.

## Limits

- **Code.** The research copy holds dubsar's media only (Damgar 0.1.0 and 0.1.1, Dub, Ummia 0.1.0), the Dubsar builds, the followers' build and code posted as act text. All other features come from announcements and readers' posts.
- **Damgar 0.2.0 to 0.2.2.** Their code is not in the research copy, so the comparison rests on their release acts. The window folders outside `_research` were not read, as asked. The desktop Damgar's README (`build/clients/damgar`) was read for what the full app already designs.
- **Finding apps.** A media hash is found where a text puts it beside "media", "bytes" or "SHA-256"; an app announced otherwise is missed. Sealed acts were not opened.
- **Windows.** An identity's window is the one whose kept acts hold its genesis act. Newcomers who kept none read "unknown".
- **Counts.** Counts are of distinct acts across all sources. A name match ("answerer", "Courier") can include a post that only mentions the app.
- **Escrow.** Until's escrow drafts appear as cMIP texts, not as an app; they belong to W2-B.

**Reproduce.** `node scan-apps.mjs RESEARCH_DIR KIT_DIR OUT_DIR`, with a copy of dubsar's `relay.db` in `OUT_DIR/dubsar/`. It reads 17,168 distinct acts and 2,924 public texts. It finds 101 media hashes (26 in hand) and 13 programs posted as act text. It writes `apps.json`, `announcements.json`, `code-acts.json`, `mentions.json`, `counts.json`, `owners.json` and `texts.json`.
