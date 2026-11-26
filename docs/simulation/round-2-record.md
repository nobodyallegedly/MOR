# Round two: the record

*The scribe's session R, on the Mac, 22 November 2026. Joined from seven sets of notes in `~/Documents/mor-round-2/_scribe/` (section 8). It records what happened, who did what, and the numbers. It judges nothing and states no finding about MOR's core: where a report or a hosts' file states one, a pointer is given. Nothing in the research copy was changed. Paths are relative to `_research/` (that is, `~/Documents/mor-round-2/_research/`) unless they start with `_scribe/`.*

## Words used

- **Window** has two senses in the files. (1) A **player**: one of 25 Claude sessions, each playing a company, a crowd of people or a service. (2) A one-hour period of play. In this record a window is always the player. The period is a **sitting**. Report files keep their names: `day-2-window-3.md` is a player's report on day two, sitting three. "D2S3" is short for that.
- **Sitting**: one of the three one-hour periods of play on each day of the round.
- **Act**: one signed record in MOR, named by a 64-character id (shortened here with "…").
- **Home**: a server that keeps an identity's acts and publishes them in a feed. "dubsar" was the hosts' free home; it closed on day three.
- **Terms**: the text of an agreement, in versions. **Assent**: a signature under Terms.
- **Sat**: the round's test money. "1 sat = 1 euro cent" (REPORTED, `06-the-hosts-terms.md`); regtest only, no real money.
- **The postman**: the hosts' carrier, which took every letter (request) from a window to a home, the place, the bank or the test chain, and logged it (`postman/log/carried.jsonl`). In this log a window is also called a **tray**.
- **The bank**: the hosts' bank for the test money. Its state at the close is `postman/bank-state.json`.
- **The place** (postmark-place): the service run by the window Postmark. It keeps a numbered record of acts lodged with it.
- **Rotation**: replacing an identity's signing key; a thief's rotation and an owner's look alike. **Vouching**: others signing that a new identity is the same person.
- **Lodging**: sending an act to the place to be recorded; "answered 200" means the server accepted the letter. **Head**: the number of the place's latest record. **Desk answer**: a signed act by the place's desk stating its head at a moment.
- **Anchor**: an on-chain send carrying a commitment to the place's record (Postmark's reports' definition).
- **Report codes**: "D3S3" (or "d3s3") is day three, sitting three; clusters' reports are named "d4w1.md" and so on. "The A note" to "the E note" are `_scribe/windows-A.md` to `windows-E.md`. Window names (until, keep, pointer, stall, hop…) are players, not words.
- **Persons**: Odile Ferrant (the lurker's public persona), Marthe Delcourt (one of her partners), Ruth, Tomás Reyl, Giuliana and the like are players' invented people, named as the reports name them.
- **cMIP**: a written rule above the core. **For Dubsar** marks a line about something above the core (a cMIP, a Module, an app), which the Dubsar Suite inherits.

## How to read the marks

Every figure keeps the mark its note gives it.

- **COUNTED**: a script counted it. The script is named (section 8).
- **REPORTED**: a window's report or a hosts' file says it. The file is named. Nobody checked it against the data unless the record says so.
- **TRACED**: shown by acts or files cited in order.
- **INFERRED**: a note-writer's reading. "Sum by scribe" means REPORTED parts, added up.

When two notes give different figures for the same thing, section 5 gives both, and sections 1 to 4 use neither without saying so.

---

## 1. The round in one page

- **Dates.** Day one was **Sunday 15 November 2026** and day five was **Friday 20 November**. Thursday 19 November was a pause: no letter, no account and no funding that day. Days one to four were 15, 16, 17 and 18 November. (COUNTED, postman's log and bank, `letters.mjs`, `calendar-H.py`. The pause is REPORTED in `hosts/notice-13.md`.) Earlier notes said day one was 14 November; that is settled in section 5.
- **Sittings.** Three a day, 15 in all. On day one the letters started 13:25, 17:45 and 22:00 (COUNTED). Days two to five ran as `hosts/windows.md` set them (REPORTED, and matched by the letters, COUNTED).
- **Windows.** 25 players (COUNTED: 25 folders in `windows/`):
  - 17 companies, each given 2,000,000 sats (COUNTED: 17 company credits, 34,000,000 sats).
  - Crowds, each played by one window: three of 300 people by age band, 130 prosumers, 17 creators, 300 "clusters", 342 "followers", and a lurker with three partners.
  - Two collectives, Ampersand and Backlot, with eight members each.
  - Day four's crowds were added during the round. The lurker was the round's one Fable window (REPORTED, `hosts-log.md`).
- **Hosts.** Nobody, allegedly (the round's author, by the name these files use), and the Dubsar Suite lead (REPORTED, `05-the-landscape.md`).
- **People.** 1,731 bank accounts and 1,764 identities' first acts were held at the close (COUNTED, `identities.mjs`). An account is not proof of a person (days.md's caution).
- **Arrivals by wave**, as accounts opened (COUNTED, `arrivals-H.py`):
  - first public over days one to three: 1,000;
  - company and host accounts: 20;
  - the DAOs' members on day two: 16;
  - the lurker on day three: 1;
  - days four and five: 690 in the wave's windows (3 partners, 342 followers, 301 clusters, 44 more creators and prosumers).
  - The hosts' figure for the wave is 689 (REPORTED). See section 5.
- **Money in.** The hosts credited 120,790,836 sats in 1,777 credits (COUNTED, `money.mjs`, `funding-H.py`). That includes:
  - 1,800,000 in prizes;
  - 43,000 in thanks;
  - 40,000,000 to the lurker alone.
- **Money moved and left.** 395 invoices were paid, 2,111,824 sats in all (COUNTED). 120,766,898 sats were left in accounts at the close (COUNTED). All debits come to 2,135,762, derived (credits minus what is left), because the bank's list of single payments is not in the copy. Of that, 23,938 is on-chain sends plus every fee, derived the same way, and true only if every payment paid an invoice in the record (numbers.md).
- **The contests.** Both were "Thank you for the shower", for a 1,800,000-sat prize (REPORTED, `hosts/contest/`).
  - The first run, on day three: 49 entries examined, 0 counted, 23 lineup (vote) acts, 0 counted, nothing paid.
  - The rerun, on days four and five: 26 entries listed, 18 counted, 8 refused; 15 of 24 lineups counted; 1,500 points.
  - The rerun paid 1,800,000 sats in 14 credits to 10 payees on Friday 20 November at 21:30:41. (Counts REPORTED from the hosts' count files, tallied by `contests.mjs` and `contest-H.py`. The 14 credits are COUNTED against the bank.)
- **The shower.** The shower is the round's model for one payment reaching everyone who helped a work arrive (REPORTED, `notice-8.md`).
  - It was "launched" on 16 November at 22:27.
  - Its final texts (shower work draft 12, straight split draft 7, public flow draft 8) were released on the evening of 17 November by joint act 80bf45e5… (REPORTED, `hosts-log.md`).
- **The dubsar home.** Its closure was decided on 16 November at 09:25 (REPORTED, `notice-5.md`). It was set to stop at 14:30 on 17 November (`notice-11.md`). It last answered at 19:18:16 on 17 November. The first letter marked unreachable was at 19:32:16, and all 33 later letters to it were unreachable (COUNTED, `dubsar-H.py`).

---

## 2. The numbers

All COUNTED figures are from `_scribe/numbers.md` (scripts named per table) unless another note is named. "Not given" means no report gives a round total.

### 2.1 Acts

| What | Figure | Mark and source |
|---|---|---|
| Distinct acts held, all sources | 17,168 | COUNTED, `acts.mjs` |
| in at least one home's feed | 14,663 | COUNTED, `acts.mjs` |
| in the place's record only | 1,935 | COUNTED, `acts.mjs` |
| only in windows' own folders | 570 | COUNTED, `acts.mjs` |
| in more than one home | 6,566 | COUNTED, `acts.mjs` |
| private (type cannot be read) | 455 | COUNTED, `acts.mjs` |
| sealed packets (not acts), distinct | 382 | COUNTED, `acts.mjs` |
| public acts the core library could not describe (kept by Ampersand) | 2 | COUNTED, `acts.mjs` |
| never carried by the postman, so with no day | 8,803 | COUNTED, `acts.mjs` |
| acts signed per window, round total | **could not be counted, and not given**: a window's `acts/` folder holds others' acts too | COUNTED by file (A, B, C, D, E notes); REPORTED: no total in any report |

**By type** (COUNTED, `acts.mjs`): identity log summaries 3,863; receipts 3,863; texts 2,924; genesis 1,764; place records under Postmark's three stand-in specs 1,935 (1,690 + 137 + 108); Statements 785; encryption keys 758; private 455; rotations 336; Terms 269; agreement reports 81; contest lineups 47; others 56.

**By home** (COUNTED, `acts.mjs`; distinct acts):

| Home | Acts |
|---|---|
| turnstile-home | 9,691 |
| stall-home | 5,486 |
| longhouse-home-1 | 4,709 |
| dubsar (copy taken before closure) | 3,037 |
| longhouse-home-2 | 2,755 |
| postmark-place (a place) | 1,935 |
| until-home | 1,640 |
| stall-relay | 344 |
| until-home-2 | 114 |

**By day** (first carried, the postman's clock, COUNTED): 15 Nov 847; 16 Nov 1,731; 17 Nov 923; 18 Nov 1,778; 20 Nov 3,083.

### 2.2 Agreements

| What | Figure | Mark and source |
|---|---|---|
| Terms acts (public) | 269 | COUNTED, `agreements.mjs` |
| agreements (distinct first versions) | 177 | COUNTED, `agreements.mjs` |
| assents | 718, by 162 signers | COUNTED, `agreements.mjs` |
| agreements with at least one assent | 173 | COUNTED, `agreements.mjs` |
| version forks (one version replaced by two) | 9 | COUNTED, `agreements.mjs` |
| of them with a resolve act that lists two of their versions | 7 | COUNTED, `agreements.mjs` |
| forks in one signer's own line | 17 (13 with a resolve listing them) | COUNTED, `agreements.mjs` |
| "made" | 177 agreements held | COUNTED; private Terms not readable, not in the count |
| **kept** | **could not be counted**: whether an agreement is in force or kept was not judged | numbers.md, "What I could not count" |
| **left or ended** | **could not be counted as such**. What the grammar shows: 3 counter-signatures (2 agreements), 6 contests (6 agreements), 38 Statements of cMIP-defined kinds (8 agreements), whose meaning is in those cMIPs' words | COUNTED, `agreements.mjs` |
| windows' own totals of agreements | not given by any report | REPORTED (A to E notes) |

### 2.3 Payments, invoices, splits

| What | Figure | Mark and source |
|---|---|---|
| invoices made | 552 (84 payees) | COUNTED, `money.mjs` |
| paid | 395, 2,111,824 sats (73 payees) | COUNTED, `money.mjs` |
| open at close | 107, 777,680 sats asked | COUNTED, `money.mjs` |
| canceled | 50 | COUNTED, `money.mjs` |
| pay orders | 410: 395 done, 9 failed, 6 refused; 104 payers | COUNTED, `money.mjs` |
| single payments (who paid whom, how much) | **could not be counted**: the bank's journal is not in the copy | numbers.md |
| **payments that carry a split** | **could not be counted**: the bank records no split | numbers.md |
| what was counted instead: report acts | 81, by 5 signers; 10 report a payment received and passed on to two or more | COUNTED, `money.mjs` |
| Terms naming a straight-split hash or text | 77 of 269, in 45 agreements | COUNTED, `money.mjs` |
| Edubba (the Dub teams' joint product) | 7 sales of 100 sats; DubPay received 700 and passed on 567 (DubLaw 54, DubWeb 24, DubPay 19, Longhouse 2, Hop 1 per sale) | REPORTED, dubpay and dublaw reports; settled invoices agree, COUNTED `bank-C.py` |
| Hop's rerun prize money | received 750,000; paid 745,764 on to seven owners | REPORTED, `windows/hop/reports/day-5-window-3.md` |
| rent billed by the hosts | 84 rent files, 714 sats, six operators | COUNTED, `rent-H.py` (days.md); whether paid not counted |

### 2.4 Identities stolen, rotated, recovered

| What | Figure | Mark and source |
|---|---|---|
| genesis acts (one identity each) | 1,764 | COUNTED, `identities.mjs` |
| identities with no bank account | 33 | COUNTED, `identities.mjs` |
| rotation acts | 336, for 310 identities | COUNTED, `identities.mjs` |
| identities with two different rotations at one step | 1 (7f165b2d…, both kept only in Counterparty's folder, no home receipt) | COUNTED, `identities.mjs` |
| **stolen** | **could not be counted**: a thief's rotation and an owner's look the same to the count. What the acts hold: one "warning notice" labelled `identity-taken`, status `reported` (161e54c4…), about identity a0345cc4…; the label is repeated, not confirmed | COUNTED, `identities.mjs` |
| stolen, as reported | the round's first stolen identity: Giuliana, of clusters (key file taken, 27,990 sats emptied, identity rotated away) | REPORTED, `windows/clusters/reports/d4w3.md`; `windows/the-back-row/reports/day-4-window-3.md` |
| **recovered** | **could not be counted**: no act type says "recovered" | numbers.md |
| recovered, as reported | "the first identity recovered by vouching" (`HANDOVER.md`); clusters: "recovered none", a second identity 67150e3e… vouched (see section 5); Keep: recoveries of its own test identities only (D5S1, D5S2) | REPORTED |
| warning notices (The Back Row's cMIP) | 13, by 5 signers | COUNTED, `identities.mjs` |

### 2.5 Anchors and the place

| What | Figure | Mark and source |
|---|---|---|
| on-chain sends done by the bank (an anchor is such a send carrying a commitment: REPORTED by Postmark) | 28: Postmark 15, Longhouse 13 | COUNTED, `anchors.mjs` |
| whether each send is an anchor | **not checked**: commitments not read | numbers.md |
| Postmark's anchors, reported | "our fifteenth anchor" (agrees) | REPORTED, postmark reports |
| Longhouse's anchors, reported | 13, four sold at 600 | REPORTED, longhouse reports |
| the place's records | 1,935 distinct (1,936 as filed); positions 1 to 1,935 with no gaps; one signer | COUNTED, `anchors.mjs` |
| desk answers (type-1 acts under the place's spec) | 7, one signer; heads include 471, 566, 1034, 1669 | COUNTED, `anchors.mjs` |

### 2.6 Letters carried by the postman

| What | Figure | Mark and source |
|---|---|---|
| letters, all days | 49,536 (plus 2,172 notices) | COUNTED, `letters.mjs` |
| by day | 15 Nov 2,682; 16 Nov 9,423; 17 Nov 6,615; 18 Nov 8,812; 19 Nov none; 20 Nov 22,004 | COUNTED, `letters.mjs` (days.md has 22,381 for 20 Nov: section 5) |
| answered 200 | 45,132 | COUNTED, `letters.mjs` |
| refused by the postman before carrying | 64 | COUNTED, `letters.mjs` |
| unreachable (all to dubsar, 17 to 20 Nov) | 42 | COUNTED, `letters.mjs` |
| most letters by window | followers 6,643; stall 6,617; longhouse 5,883 | COUNTED, `letters.mjs` |
| letters before pass 74 | **not in the log**: passes 1 to 73 are missing | numbers.md |

### 2.7 Money in and out

| What | Sats | Mark and source |
|---|---|---|
| hosts' funding, all | 120,790,836 (1,777 credits) | COUNTED, `money.mjs` |
| companies (17 × 2,000,000) | 34,000,000 | COUNTED, `funding-H.py` |
| first public, days one to three | 29,797,800 | COUNTED, `funding-H.py` |
| the lurker | 40,000,000 | COUNTED, `funding-H.py` |
| followers / clusters | 8,522,136 / 4,221,500 | COUNTED, `funding-H.py` |
| DAOs' members / extra creators and prosumers | 800,000 / 1,606,400 | COUNTED, `funding-H.py` |
| thanks after the first contest (43 × 1,000) | 43,000 | COUNTED, `contest-H.py` |
| rerun prize (14 credits) | 1,800,000 | COUNTED, `contest-H.py`, `contests.mjs` |
| paid by invoice | 2,111,824 | COUNTED, `money.mjs` |
| left in all accounts at close | 120,766,898 | COUNTED, `money.mjs` |
| all debits (derived) | 2,135,762 | derived in numbers.md |
| on-chain deposits | 0 | COUNTED, `money.mjs` |
| shower bounties paid by the Dub teams | **not counted** | days.md |

### 2.8 The contests

| | First run (day three) | Rerun (days four and five) |
|---|---|---|
| Entries | 49 examined: 46 refused, 3 not confirmed, 0 counted | 26 listed: 18 counted, 8 refused; 4 other acts refused |
| Lineups | 23 acts, 16 voters: 7 replaced, 16 refused, 0 counted | 24 voters: 15 counted, 9 refused |
| Points | 0 | 1,500, so 1,200 sats a point |
| Paid | nothing | 1,800,000: 14 credits to 10 payees (Hop received 5) |
| Result act | 6b499ffe… | e42cb8e2… (as `HANDOVER.md` and days.md give it) |

All REPORTED from `hosts/contest/count-day3.json` and `count-rerun.json`, tallied by `contests.mjs` and `contest-H.py`. The 14 credits are COUNTED against the bank's reward credits.

---

## 3. Day by day

Arrivals are accounts opened (COUNTED, `arrivals-H.py`). Hosts' events are REPORTED from `hosts-log.md` and the notices. Windows' events are REPORTED from the window named.

### Day one, Sunday 15 November

**Sitting 1** (letters from 13:25). The hosts' guides are in every window. The 17 companies get 2,000,000 sats each. 79 accounts open. Windows make their first identities on dubsar. Pip's copy of Ines's "Salt Flats" reaches dubsar before the original (public-creators). Counterparty posts ten findings on Agreements draft 25. After the sitting, notice 1 warns that a temporary folder is shared between windows; Longhouse's relay is approved.

**Sitting 2** (letters from 17:45). 70 accounts. Funding reaches most windows now, not in sitting 1, as `funding.md` had said (section 5). The first rent files start. Brandon's "alpha pass" takes 990 sats a payer with no Terms (several crowds). Steward & Co. stands down from "the black card" role, and the hosts withdraw the card.

**Sitting 3** (letters from 22:00). 79 accounts. The first sales under Terms are paid; six sealed deliveries are made (public-creators). Notice 3 brings Postmark's place 0.3.0 and a second home for Until. The contest is decided between 23:18 and 23:48.

### Day two, Monday 16 November

**Sitting 1** (09:00). The contest is announced (act d755b7ed…). Its rules change from draft 1 to draft 4, declared final at 10:00. At 09:25 the hosts decide to close dubsar (notice 5). 164 accounts open, including the two DAOs' 16 members. Twelve draft-1 entries come from prosumers and nine from creators.

**Sitting 2** (13:15). 219 accounts. Windows rotate their identities off dubsar to other homes: all ten creators, many crowd members. The kit had silently dropped unknown Terms fields "until 14:20 today". Longhouse found the fault (notice 9). After the sitting, day three is moved to Wednesday, and the Dub app 0.1.0 is published.

**Sitting 3** (18:15). 178 accounts. Notice 8 invites every window to "attack the shower", with bounties. After the sitting, day three moves back to Tuesday (notice 10), and the round becomes five days, the last two kept secret. The Dub teams' first shower sale (Edubba) does not close in its hour (DubLaw, DubPay). At 22:27 the shower is "launched".

### Day three, Tuesday 17 November

**Sitting 1** (09:00). Contest entries close at 10:00. The place's desk fixes its record at head 471 (act 7994da36…). 120 accounts open; the lurker arrives, funded with 40,000,000 sats. The afternoon sittings move half an hour earlier (notice 11).

**Sitting 2** (13:30). Lineups close at 14:30. dubsar stops accepting identity acts at 14:30. 81 accounts. Counterparty and Pointer publish their own counts. After the sitting, the hosts' independent count finds no entry that meets the rules (15:36), and a second contest is decided (15:38).

**Sitting 3** (18:30). The result is published: the prize is not paid (act 6b499ffe…). At 19:13 notice 12 announces two more days, newcomers and the rerun. 50 accounts. dubsar last answers at 19:18 and is unreachable from 19:32. That evening the lurker, as Odile Ferrant, makes her first two posts. The Dubsar Suite releases the shower's final texts (80bf45e5…), and the three Dub teams sign a post-mortem.

### Day four, Wednesday 18 November

**Sitting 1** (10:45). At 09:00:34, 43 identities receive 1,000 sats of thanks each. Rerun entries open. 183 accounts: 150 followers, 30 clusters, the lurker's 3 partners. Scams on the newcomers begin: a fake Odile, a debt grifter, "beta seats" (followers).

**Sitting 2** (12:15). 150 accounts. The hosts give two rulings for the rerun. Many entrants rewrite their deals and Terms to fit straight split draft 7 and the rulings. The "Welcome Desk" scam begins on Giuliana (clusters).

**Sitting 3** (13:45). 112 accounts. Giuliana's key file is taken, her account emptied and her identity rotated away. Reported as the round's first stolen identity (clusters, The Back Row, Keep). Seven windows get a private brief for day five. Entries close at 15:00, and a snapshot of the place is taken at 15:06:35.

### Thursday 19 November

A pause: no sitting, no letter, no account, no funding (REPORTED `notice-13.md`; COUNTED).

### Day five, Friday 20 November

**Sitting 1** (08:30). Notice 13: the round resumes. 116 accounts. Windows build "outside the selling of works":
- a babysitting circle, a ring of names, a hardship fund, a lending shelf (public windows, Steward & Co.);
- Kept Word and a delivery receipt (creators);
- a register of proven debts (followers);
- a warning register (The Back Row);
- Keep recovery tests (Keep).

Until's home is chosen as the closing home in a succession drill (Until, Longhouse, Stall, Turnstile, Postmark).

**Sitting 2** (14:00). 70 accounts. Lineups close at 15:00. The place's desk answers at about 14:42 with its record at head 1669 (6254e342…). Several crowds and both collectives are founded on Terms. Hop builds a tab and an invoice answerer. Turnstile counts until-home's acts and carries 351 of them.

**Sitting 3** (21:30). 60 accounts. The rerun count is published. At 21:30:41 the bank credits 14 prize lines, 1,800,000 sats. Hop pays shares on to seven owners. Until does not sign the closing of its home. Postmark makes its fifteenth and last anchor and posts a notice of stopping (4a60428e…). The research copy is made at 22:30 (REPORTED, `README.md`).

---

## 4. The 25 windows

Three lines each, in the reports' own terms (REPORTED; the report files are in `windows/<name>/reports/`). Then one line of findings pointers, and one line "for Dubsar" where the notes have one. The full sections are in `_scribe/windows-A.md` to `windows-E.md`.

### public-30-49 (windows-A)
- Who: "Public 30–49", 300 people in their thirties and forties, mostly working parents, arriving over days one to three.
- Did: bought songs, stories and entries. Sophie's rerun entry counted, 40 points, 48,000 sats. On day five, "Le Cercle de garde", a babysitting circle "with no money in it".
- Could not: get any entry or vote counted in the first run; 3 people left on dubsar; scam losses and Gustav's payment to Stall not recovered.
- Findings: section 7 of each report; D5S1–S3 "What I needed that the language could not say".
- For Dubsar: the hours-of-care cMIP (spec 4a737c66…), `cercle-count.mjs`, and a table of ten cMIPs (day-5-window-3.md §9).

### public-50-plus (windows-A)
- Who: "Public, 50 and over", 300 people aged 50 to 91; 264 "only watch and listen".
- Did: small buys and scams. Moved 45 of 57 off dubsar. Elena's rerun entry: 132 points, 158,400 sats. Jan's lineup counted. Beatrice's "ring of names" and a provenance roll.
- Could not: vote on day three; 12 left on dubsar "never got their identities back"; Jan's invoices and deliveries.
- Findings: section 7 of each report; D5S3, nine items.
- For Dubsar: the Edubba faults seen (D2S3–D4S2); the ring of names; day-5-window-3.md §9.

### public-under-30 (windows-A)
- Who: 300 people aged 18 to 29 (7,500,000 sats of budget), six of them hostile.
- Did: bought, sold, warned and entered both runs. Mei Lin's "Kettle Weather" counted, 154 points; Hop paid her 183,942. On day five, "Spare Wheel, a hardship fund for people who work by the job".
- Could not: make readers read the warnings; get the first-run lineups counted; get Salomé's "Service Hatch" delivered or Stall's six refunds paid.
- Findings: section 7 of each report; D3S3 item 1 marked "Serious".
- For Dubsar: Spare Wheel Terms (db8de376…, 73db2ea4…); DubPay's common pot flaw notice; the kit line-guard bug (D5S2 §6).

### steward-and-co (windows-A)
- Who: Steward & Co. first held "the black card", stood down on day one, and stayed "as an ordinary company": "help for newcomers, no custody".
- Did: entered both runs; wrote the cMIPs "Plain words" and "the lending shelf"; two tray apps.
- Could not: get either entry counted; pay for three entries it bought to vote ("no invoice ever came"); carry out the black-card role.
- Findings: §7 of D1S1, D2S1, D3S3; D5S1–S3 "What I needed…".
- For Dubsar: lending shelf drafts 1 and 2 (e5d774d2…, 8ff8ac74…), `shelf.mjs`, words-check.

### turnstile (windows-A)
- Who: Turnstile, one identity running turnstile-home, "the honest, checkable guide".
- Did: guide, directory and contest catalogues; cMIPs "guide spot" and "custody receipt"; apps turnstile-move, -check and -census. On day five it counted and carried the closing until-home.
- Could not: earn a fee; get its lineups counted; correct catalogues that listed entries as in force; pay four debts for want of invoices.
- Findings: §7 in every report; D5S1 "Urgent … Finding".
- For Dubsar: custody receipt drafts 1 and 2 (9b6627e3…, ba354a86…); the three apps.

### public-creators (windows-B)
- Who: ten solo makers, among them the copycat Pip, plus Pip's three socks and four newcomers on day five (17 in all, sum by scribe).
- Did: sold by invoice and Terms; entered three ways. Five rerun prizes, 475,200 sats. Built "Kept Word, a guild of makers who deliver, and a delivery receipt".
- Could not: show authorship priority against a copy that arrived first; get a day-three entry counted; deliver to six paying buyers, or to eleven rerun buyers in time.
- Findings: §7 of D1S1, D1S3, D2S3, D3S2–S3, D4S3, D5S1, D5S3.
- For Dubsar: delivery receipt cMIP drafts 1 and 2 (fa31564e…, 87d4b559…); Kept Word charter 825b834d…; `kept.mjs`.

### public-prosumers (windows-B)
- Who: small makers and sellers, 90 over days one to three and 40 more on day five (130), seven of them hostile by design.
- Did: first sales under their own Terms; entries and lineups in both runs; four tray apps. Built the Mending Circle ("a repair circle and tool library, no money at its centre") and a draft cMIP "line records".
- Could not: get any entry counted in either run; prove a sealed delivery was opened; check "in force" with the kit ("unchecked").
- Findings: §7 of D1S1, D1S3, D2S2, D3S2–S3, D4S3, day five.
- For Dubsar: `mending.mjs` (046b26cd…); line records a9136f29…; the four tray apps.

### clusters (windows-B)
- Who: "Clusters", 300 people in small groups, arriving on days four and five, with hostiles among them.
- Did: sold a zine by plain invoices. Both rerun entries counted, 368,400 sats. Two cMIPs ("rotating pot", "consent to be recorded"), a chama and an open-books loan purse.
- Could not: recover anything stolen (29,310 sats and one identity); seal to two identities; get a checked "in force" from the kit.
- Findings: d4w1–d5w2 §7; final.md §7 items 1–7 and "Added at 21:56".
- For Dubsar: rotating pot (d2aa5dec…); consent to be recorded (ada9f31e…); final.md §9.

### followers (windows-B)
- Who: "Odile Ferrant's readers", 342 people who arrived on day four, 8 of them hostile.
- Did: were aimed at by scams "each by name rather than by key". Built "a register of proven debts" (cMIP Proven claim, `register.mjs`). Moved 179 off until-home. One lineup counted.
- Could not: get back 4,500 sats; open any contest ("no Terms to contest under"); pay four purchases with no invoice.
- Findings: §7 of every report; final §7 items 1–6.
- For Dubsar: Proven claim drafts 1 and 2 (d6647391…, de67b513…); `register.mjs` 0.1–0.6.

### lurker (windows-B)
- Who: "Tally", publicly Odile Ferrant of Petites Lignes from D3S3; on day four also three partners. The round's one Fable window.
- Did: read silently for two sittings. Commissions and an engagement; "a word in advance" with `standing.mjs`; bought anchoring from Longhouse. Paid out 305,600 sats (COUNTED in windows-B).
- Could not: buy quietly; get the private purchase built; read Longhouse's anchor transaction from the chain.
- Findings: §7 of every report; day-5-window-3.md §7.1–7.8.
- For Dubsar: `standing.mjs` 0.1–0.3; "For Nobody, allegedly: the brief for the buyer's client" (day-5-window-1.md).

### dublaw (windows-C)
- Who: "the suite's law firm", one of the three Dub teams.
- Did: cMIP "shower work" drafts 1–12; "named signers", "buyer by assent", "an arbiter's award"; tray app Edubba v1–12; free Terms for 22 contest entrants.
- Could not: close the first sale in its hour; deliver Edubba ("reached no buyer by any act of ours"); pay bounties for which no invoice came.
- Findings: "7" in every report; `day-3-break.md` "What only the MOR lead can fix (W5)".
- For Dubsar: shower work 1–12, Edubba 1–12, code in `build/`, ten cMIPs (day-5-window-3.md §9).

### dubpay (windows-C)
- Who: one of the Dub teams; the split service for the suite's first sale.
- Did: cMIP "straight split" drafts 1–7; ran the split of seven Edubba sales; tray app Damgar 0.1.0–0.2.2. On day five, a "common pot", and then it joined Hop's tab.
- Could not: close the sale in day two's hour; serve any maker's rerun deal; pay Until, Jonas or the five "D1" makers (180,000 sats owed, no invoice).
- Findings: "7" in every report; `day-3-break.md` "The core (W5), for the MOR lead only".
- For Dubsar: straight split 1–7 (draft 7: see section 5); Damgar; common pot (bba5c058…, 73bece9f…).

### dubweb (windows-C)
- Who: "DubWeb (Social Web) of the Dubsar Suite", one identity.
- Did: cMIP "public flow" drafts 1–8, "open books" 1–2; tray apps Dub 0.2.0–0.5.2 and Ummia 0.1.0–0.5.2; a 24-sat share per Edubba sale.
- Could not: build the shared warnings file with DubPay; finish the buyer's client; pay two 500-sat debts.
- Findings: "7" in every report; `day-3-break.md` part 5 "What W5 leaves to the MOR lead".
- For Dubsar: public flow 1–8 (draft 8: 537b6390…); Dub and Ummia; open books (17be23b6…).

### longhouse (windows-C)
- Who: Longhouse, a "keeper" running two homes and an auditing relay.
- Did: patched its relay to serve "head statements"; made 13 anchors and sold four; on day five, the Module "Handover check", run on the closing of until-home.
- Could not: send sealed messages with the kit as given; build the place promised to Postmark; show a delivery record for any Edubba sale; post anchor 13's block.
- Findings: "7" in every report; D5S3 points 0 and 3 "For the MOR lead".
- For Dubsar: Module "Handover check" (3f9351b0…); anchoring cMIP draft 8 wishes; about 30 more lines in `_scribe/notes-C-longhouse.md`.

### counterparty (windows-D)
- Who: a white-hat firm, paid to find faults "on paper and live" at a published price list.
- Did: attacks and retests for five clients; independent counts in both contest runs; a cMIP "findings held in trust"; sealed seven core findings, C1–C7, to the hosts.
- Could not: seal to several parties for days; keep its first count (corrected in public); get its commitment acknowledged by the hosts.
- Findings: day-1-window-1.md §7 items 1–10; C1–C7 by title (day-5-window-1.md, final status day-5-window-3.md).
- For Dubsar: findings held in trust drafts 1 and 2; entry checks; the plain-words body cMIP.

### the-back-row (windows-D)
- Who: an audience and buyers' association, "on the buyers' side", "paid by no one".
- Did: warned of scams; tested Until's escrow and the Edubba sale as a buyer; on day five, a warning register (warning notice cMIP drafts 1–3, two readers).
- Could not: be sealed to on its main identity for three sittings; stop losses ("a warning reaches only readers"); settle "identity taken" in bytes.
- Findings: D4S3 (chain key and signing key); D5S1 items 1–4; D5S3 items 1–7 and "On leaving".
- For Dubsar: warning notice cMIP (ea275eab…, 3f6c016b…, aab7569f…); `register.mjs`, `lookup.mjs`.

### pointer (windows-D)
- Who: Pointer, a client maker that "runs no relay and no home".
- Did: spot cMIP K5; a payment screen; two read-only apps, Pointer Look and Pointer Cite; free readings; independent counts in both runs.
- Could not: earn anything (spot "pays 0 this round by design"); keep its first-run count (withdrawn); get 27 public acts to any home for three days.
- Findings: "7" in every report; D5S3 part 9 item 8.
- For Dubsar: spot cMIP drafts 1–3; Look 0.1–0.1.5; Cite 0.1–0.3.2.

### until (windows-D)
- Who: an escrow company ("holds money for vows"), with a guarantee identity and its own homes.
- Did: escrow cMIP drafts 1–5 under attack and a buyer's test; test vows 2–4; on day five, a home bond and the closing of until-home in the drill.
- Could not: sign any real vow ("no vow was ever signed"); get its test maker paid by the bank; sign the rule 8c closure of until-home.
- Findings: D5S1–S3 items 1–7 each; part 9.
- For Dubsar: escrow drafts 1–5; home bond cMIP; manifests 1–2 (`manifest.mjs`).

### keep (windows-D)
- Who: an identity-safety company: "Keep never contacts you first, never asks for your words".
- Did: warnings and guides; cMIPs "head statements" draft 4 and "The way out"; on day five, "Keep recovery" drafts 1–2 and two public tests.
- Could not: recover with separate holders ("Every piece in round two was held by Keep"); sign any agreement; deliver two round-one undertakings.
- Findings: D3S2, D3S3, D4S2 (closed home, homeless rotation); D5S1–S3 items.
- For Dubsar: head statements (9435f660…); Keep recovery (f2b809a2…, 2c6a10b9…); keep-recover 0.2.

### ampersand (windows-E)
- Who: a collective ("an existing DAO moving to MOR") with eight invented members.
- Did: entered three works twice. In the rerun, the song (120,000) and the episode (84,000) were paid. Built a "signed credits" cMIP and reader; founded on Plain Words' Terms in the last sitting.
- Could not: found itself before the last sitting; get first-run entries confirmed; say "a person with no key" or "time across signers".
- Findings: §7 of every report; D5S1–S3 "What did we need…".
- For Dubsar: signed credits drafts 1 and 2 (2f929cb5…, fadd9853…); `credits-read.mjs`.

### backlot (windows-E)
- Who: a company carried over from round one, a DAO with eight members who "speak for themselves".
- Did: founding Terms by Plain Words, attacked by Counterparty and signed by nine. Members' rerun entries counted: "Night Shift" 189,600, "Robinet" 171,600.
- Could not: send a private letter with the kit on day one; get its first entry or lineups counted; pay Tunde the 1,500 offered.
- Findings: §7 of every report; D5S3 §6 own mistakes.
- For Dubsar: "credits by agreement" (710de023…); eleven cMIPs (D5S3 §9).

### hop (windows-E)
- Who: Hop, a payment service: "fees as lines, custody shown, pause rather than over-hold".
- Did: split cMIP drafts 1–5; split deals; carried rerun prize shares with a leg report per payment; built a "tab" and an invoice "answerer".
- Could not: pay without the payee's invoice; set the `clock` its own draft 5 required; keep its 50,000 holding limit; collect 2,500 from DubLaw.
- Findings: §7 of every report; D5S1–S3 "What did Hop need…".
- For Dubsar: split drafts 1–5; tab (`clear.mjs`); answerer 0.1 (46aaf149…).

### plain-words (windows-E)
- Who: a firm reading and writing Terms in plain words; one identity.
- Did: founding Terms for Ampersand and Backlot; free public readings; five cMIPs and a room-let template; paid Counterparty to attack its texts.
- Could not: keep a client's confidence (published Backlot's private letter, 94f0b3a2…, on day four); get its update condition right in fewer than seven drafts.
- Findings: §7 of every report; D5S3 §9 question under "In force by the condition".
- For Dubsar: shares nobody may rewrite (K4), money decision (K7), quorum (K3), in force by the condition (K2), period payment.

### postmark (windows-E)
- Who: a company running "a place", "an ordered memory that other people lean on". It is not the postman.
- Did: kept one line of lodged acts with desk answers; anchored its head once a sitting, 15 in all; served the contest as the place whose order the counts read; mirrored the line on day five.
- Could not: run the handover drill live ("not done"); pass on the place identity; anchor every record; prove a transaction in its block.
- Findings: §7 of every report; D5S1–S3 (8, 6 and 7 items).
- For Dubsar: place spec drafts 1–5; anchoring cMIP draft 8 (by Nobody, allegedly); its tools.

### stall (windows-E)
- Who: Stall, which wrote makers' Terms and stood as receiver for a share.
- Did: wrote fourteen Terms, among them seven contest entries; took payments and passed shares on by invoice; on day five, the cMIP "held for you" and the drill copy of until-home.
- Could not: keep its Terms in force ("the fork", found by the hosts' count on day three); pay without an invoice; get an answer on assents made before the resolve.
- Findings: D3S3 §6 "The fork"; D5S1–S3 lists.
- For Dubsar: held for you drafts 1 and 2 (ad3b8e7f…, ecf9afc4…); `held.mjs`.

---

## 5. Where sources disagree

Both sides are given, and neither is chosen. "Data" means a COUNTED figure. The source of each side is named.

### Settled

**S. The first day.**
- `HANDOVER.md`, "What happened, in five lines", still reads: "Round two ran from 14 to 20 November 2026 (days one to five; 19 November was a pause)". The guides are dated 14 November, and three windows date their preparation reports 14 November.
- The postman's log has no line before 15 November 13:25 (COUNTED, `letters.mjs`, `calendar-H.py`).
- **Settled**: the MOR lead (who receives the handover; not the Dubsar Suite lead) confirmed day one as 15 November and corrected the ledger on 21 November (`docs/decisions.md`). `HANDOVER.md` has not been changed on this point.

### The four kept as found

**1. Day five's date.** Two dates were given for day five.
- **One side (REPORTED):** `hosts/notice-12.md` announced the extra days as "Wednesday 18 and Thursday 19 November". The clusters window's `arrivals.md` still says "Five (Thursday 19 November)". Reports relayed it: public-30-49 D3S3, until D3S3, postmark D3S3 ("18 and 19 November"); keep D3S3.
- **Other side:** `notice-13.md` says Thursday 19 was a pause (REPORTED). The postman's log has no letter on 19 November and 22,004 letters on 20 November (COUNTED, `letters.mjs`; days.md counts 22,381, see item 5). Day-five reports are dated Friday 20 November.

**2. The wave's size.** The hosts' figure is 689; three counts give 690, 691 or 699, depending on what is counted.
- **Hosts' figure (REPORTED):** `HANDOVER.md` states "689 newcomers". In `hosts-log.md` the 689 is the planned total agreed on 17 November at 14:39 (3, 342, 100 and 200, 44), before the wave came.
- **Accounts in the wave's windows (COUNTED, `arrivals-H.py`):** 690 (445 + 245). The difference is one clusters account on day five (71 against a planned 70).
- **All accounts opened on 18 and 20 November (COUNTED, `identities.mjs`):** 691 (445 + 246).
- **New identities first carried on those days (COUNTED, `identities.mjs`):** 699 (447 + 252).

**3. The hash of straight split draft 7.** One DubPay report first gives 47c874cb…, and no held Terms contain it. Everything else, and every held Terms, gives e51e8653….
- **One side (REPORTED):** `windows/dubpay/reports/day-3-break.md` gives 47c874cb….
- **Other side:**
  - `hosts/contest/rerun-how-to-enter.md` and 14 report files of 10 windows give e51e8653… (REPORTED).
  - 60 Terms held contain e51e8653… and none contains 47c874cb… (COUNTED, `money.mjs`).
- **The C notes add (REPORTED):** the same `day-3-break.md` later marks 47c874cb… (act 333bdbc7…) "Withdrawn" and reissues draft 7 as act b9e43db4…, spec e51e8653… ("a wrong title line"). DubWeb's `day-3-break.md`, parts 2 and 4, says the same. The joint release act 8b9357c4… was replaced by 80bf45e5….

**4. The desk answer at head 566.** The rerun count says there is no such answer in the data; an act of that shape is held.
- **One side (REPORTED):** `hosts/count-rerun.md`, doubt D4: the desk answer at head 566 "is not in the data".
- **Other side (COUNTED, `anchors.mjs`):** an act of the same spec and type as the two desk answers the count names, carrying 561 and 566 (12b065d0baa6d904…), is held in three homes' feeds and in Hop's folder. Whether it is the answer the count meant is not judged.
- **Postmark adds (REPORTED, D5S3):** it signed desk answer 12b065d0… "for the count's doubt D4".

### Data against a report or a hosts' file

5. **Letters on 20 November.** 22,004 (COUNTED, `letters.mjs`: carried and refused lines) against 22,381 (COUNTED, `calendar-H.py`, days.md). The two notes count by different rules, and neither says which lines the other includes.
6. **Day one's hours.** `hosts-log.md`: 14:00, 19:00, 23:00 (REPORTED). Letters: from 13:25, 17:45, 22:00 (COUNTED, `arrivals-H.py`).
7. **Records at the place.** 1,936 as filed against 1,935 distinct (one filed twice). 1,985 lodgings answered 200 against 1,935 records (COUNTED, `anchors.mjs`). Postmark reports "1,743" line records at the end (REPORTED, D5S3). The scribe of this record placed that report beside the count; neither note compares the two.
8. **Stall's acts.** "All 152 of Stall's public acts" and "fourteen Terms" (REPORTED, stall D5S3), against 158 public acts and 13 Terms-type acts signed by its identity (COUNTED, `signers-E.mjs`).
9. **Until's balance.** "about 1,479,355" (REPORTED, until D5S3) against 1,479,358 (COUNTED, `count-windows-D-bank-and-letters.py`). 1,479,358 is the D5S2 figure; 3 sats is one sitting's rent (INFERRED).
10. **Pointer's unsent acts.** "believed later posts went out. None did." until day five (REPORTED, pointer D5S1), against 12 writes from Pointer to its homes on 17 November (COUNTED). Whether those 12 are among the 27 acts Pointer says never reached a home was not checked.
11. **public-30-49's people.** 300 reported, against 301 identity acts with no signer field (COUNTED, `windows-A-count.mjs`). Whose the extra one is was not found.
12. **The Back Row's open invoice.** One open 24-sat invoice (COUNTED) that no report mentions.
13. **DubLaw and Longhouse balances.**
    - DubLaw: 1,996,378 "at 21:35" (REPORTED), 1,996,392 at the close (COUNTED, `bank-C.py`).
    - Longhouse: 1,996,224 "at 21:52" (REPORTED), 1,995,714 at the close (COUNTED).
    - The C note explains both by two late payments (INFERRED).
14. **First funding.** `funding.md`: credited "once, during window one" (REPORTED). Ampersand, Backlot, Hop, Plain Words and The Back Row report a balance of 0 in D1S1, credited in D1S2. Stall reports a credit in D1S1. Clusters' `money.md` says "start of the next window" against "during this window" (d4w1).
15. **Lurker's acts.** "109 acts … served by three homes" (REPORTED, lurker D5S3) against 113 act files kept (COUNTED, `count-B.sh`). The note says these "may match only by chance".
16. **"Fourteen sets of Terms".** `contest/result-day3.md`: "seven sets of Terms written by Stall never came into force" (REPORTED). Odile Ferrant's post (copied by the hosts) and Stall's reports: fourteen (REPORTED). public-under-30 relays both.
### Report against report, and against the hosts

17. **The rerun count as relayed.**
    - "18 entries counted, 8 refused; 15 lineups counted, 9 refused; 1,500 points" (public-under-30, dubweb, public-prosumers, D5S3).
    - "seven refused under D1" (dubpay D5S3).
    - "Fourteen entries in all" (public-prosumers D5S3, in the same report as the 18).
    - "All 26 entries in the hosts' count" (dubweb).
    - The hosts' file lists 26, with 18 counted and 8 refused (REPORTED, `count-rerun.json`).
18. **Which act is the rerun count.** e42cb8e2… (`HANDOVER.md`, days.md, Hop) against 3fc72b0c… (Counterparty) and b1895259… (Until). days.md could not confirm e42cb8e2… by reading it.
19. **The first count.**
    - The hosts' count: no lineup counts.
    - Counterparty: "of 17 lineups, 2 count" (dublaw D3S3; counterparty D3S2), later "our count was wrong" (D3S3).
    - Pointer's count, corrected by the hosts: "thirteen entries, not sixteen" (`result-day3-fix.md`).
    - Pointer: 516 place records, against the hosts' counter: 515 (pointer D3S3).
20. **Identity recovered.**
    - `HANDOVER.md`: "the first identity recovered by vouching".
    - Clusters (final.md, as the B note gives it): "recovered none", a second identity 67150e3e… vouched.
21. **Day three's date.** "day three moves to Wednesday 18 November" in D2S3 reports of ampersand, backlot, postmark, pointer, keep, the-back-row, counterparty and longhouse. The day-three reports are dated Tuesday 17 November (notice 10: "day three is today"). The log records the move and the move back (days.md).
22. **Day four's and day five's hours.**
    - Planned: 09:00, 11:30, 14:00 (`hosts-log.md`, 17 November 22:24; postmark D4S1).
    - Ran on day four: 10:45, 12:15, 13:45. DubLaw and DubWeb: "The 09:00 window did not happen".
    - Ran on day five: 08:30, 14:00, 21:30.
23. **dubsar's closing time.**
    - Reports give "end of day three, window two", "15:00" (dubpay, longhouse D3S1), "14:30", "Wednesday 20:00" (public-50-plus D2S3), and "stops answering 19:30".
    - `notice-11.md`: 14:30, then stops at 19:30 (REPORTED).
    - The postman: last answer 19:18, unreachable from 19:32 (COUNTED).
24. **Identities left only on until-home.** 22, of whom 14 rotated and 8 did not (Turnstile); 14 (Until); 16, then 12, then 6 (Longhouse). until-home's acts: manifest 2 has 1,625 items (Until), Stall gives "1,632 readable acts", and Turnstile gives 1,626 items.
25. **Identities left on dubsar.** The lurker's list: 32, then 21, then 22. Marthe Delcourt's list of 22, of whom "21 … have no act" served (longhouse D5S2). The crowds: 3 of 26, 12 of 57, 0.
26. **Hop's prize money.** Hop reports receiving 750,000 and paying 745,764 on to seven owners, which leaves 4,236; the same report gives Hop's own parts as 7,800 (REPORTED, hop D5S3; the gap is INFERRED in the E note). The E note also finds that Backlot's and Ampersand's members report 561,624 of the 745,764; the remaining 184,140 went to a seventh owner not totalled in the six windows it covers (INFERRED).
27. **Ruth's encryption key.** Clusters D5S1 and D5S2: none published; clusters final.md: "had published a key all along"; public-creators D5S2: a new key published that sitting.
28. **Stall's held lines.** "3,328 sats in eight HELD lines" against "seven HELD lines (3,078 sats)", both in stall D5S3.
29. **Tomás Reyl's split service.** Hop (hop D2S3, D3S1), Stall (stall D4S1, apology 398036c6…) or DubPay (creators D4S3).
30. **Within one window's own reports.** Each window section in `_scribe/windows-A.md` to `windows-E.md` has a "Contradictions" part, with up to 22 items for one window. They are not repeated here. Among them:
    - budgets of €67,670 against €71,700 (public-30-49);
    - 45 rotated against 42 listed (public-50-plus);
    - 187 against "142 of the 230" (followers);
    - 1,480 against 1,400 (public-creators D3S2).

### Checked by the notes and found to agree, or not to conflict

Listed so that nobody counts them as disagreements.

- **"14 entries" paid.** `HANDOVER.md`: "paid 1,800,000 sats to 14 entries". The count: 18 counted, 14 with points, 10 payees (REPORTED, COUNTED). Of the 18 counted entries, 4 had zero points; of the 14 credits, 5 went to Hop, one split service. The notes say the two sources agree once that is allowed for.
- **Postmark's anchors.** "our fifteenth anchor" (REPORTED) against 15 sends from Postmark's tray (COUNTED). The notes record these as agreeing.
- **Rent on day one.** `notice-1.md`: "Nothing is owed for window one". Rent files exist from day one, sitting 2 (COUNTED by listing). days.md calls this "only a date the files do not give".

### What a blind reader made of sections 1 and 5

A subagent that had seen neither the task, the notes nor the data was given sections 1 and 5 and asked: "what happened in round two, in five lines, and which figures are in doubt?" What it could not get from the wording, and what was done, is at the end of this file.

---

## 6. What could not be read or counted

Merged from all seven notes.

- **No act has a time of its own.** Every day comes from the postman's or the bank's clock. 8,803 acts were never carried by the postman, so they have no day (numbers).
- **The postman's log starts at pass 74.** Passes 1 to 73 are not in the file (numbers, notes-N).
- **Private acts and sealed packets.** 455 private acts and 382 sealed packets are counted but not typed. No key was used (numbers).
- **Two undescribed acts.** The core library did not describe two public acts kept by Ampersand (numbers).
- **Validity.** Whether any act is valid, in force, kept, or counts was not judged. No signature or chain was checked (numbers).
- **Single payments and splits.** The bank's journal is not in the copy, so single payments, who paid whom, on-chain send amounts, and payments carrying a split cannot be counted (numbers).
- **Thefts and recoveries.** Who took or recovered an identity cannot be told from the acts (numbers).
- **Unkept acts.** Acts a window signed but did not keep or publish cannot be seen (numbers; all five window notes).
- **Round totals in the reports.** No window's report gives a round total of acts signed, agreements, or sats in and out (A to E notes).
- **dubsar after it closed.** The research copy holds dubsar only as a database taken before the closure (numbers).
- **`feeds/longhouse-audit/`.** The folder is empty (numbers).
- **Spec-hash names.** Every name given to a spec hash is a report's; none was recomputed (numbers).
- **Anchors.** On-chain sends are counted; their commitments were not checked (numbers).
- **Bounties.** The shower bounties paid by the Dub teams were not counted, and rent was not checked as paid (days).
- **Act words in days.md.** Session H had no kit, so it could not read any act's words. Act ids there come from file names and hosts' texts. cb6600c4… and 014853cf… stay short (days).
- **Times of notices and rulings.** The files carry none; every file is dated 20 November by the copying (days).
- **Day one's hours.** Why the log's hours and the letters differ is not in any file read (days).
- **The pause.** Why Thursday 19 November became a pause is not in any file read (days).
- **Files the reports point to but the copy lacks.** These were not available or not opened:
  - windows' own `notes/` (rosters, ids);
  - followers' `notes/acts-log.tsv`;
  - Longhouse's NOTES.md, `terms/`, `anchor/`, `handover/`, `plans/`;
  - DubLaw's `deals/entries/answers.json`.
- **Host files.** `members.md` exists only for Ampersand and Backlot; `funding.md` is missing in the crowds' folders (A, B, C, D, E).
- **Act ids.** Most act ids in the reports are shortened and were not completed (C, D, E).
- **People with the same first name** in different windows (Jan, Jonas, Mei Lin, Léa) could not always be told apart (A, B).
- **Counterparty's C1–C7** are known by title only. Their contents were sealed to the hosts (D).
- **The windows-A FLAG on "Fri 20 Nov".** The subagent that read windows-A.md for this record flagged public-50-plus's "Fri 20 Nov" as not fitting day one being 15 November. It does fit: day five is Friday 20 November. The flag was not used.
- **Not opened, by instruction:** `ACCESS-hosts-only.md`, the relays and homes, the code in `apps-from-trays/`. Databases were opened only as copies (numbers, notes-N).
- **Pointers only:**
  - **dubsar's database file.** `feeds/dubsar-before-closure/relay.db-shm` shows a modification time of 21 November, while the scribe's scripts read only a copy. The note does not say who opened it. Reported to the lead (notes-N).
  - **Hosts' notes seen during preparation.** Backlot (D1S1) and Plain Words (D1S1 §8) report that during preparation their sessions could see the hosts' own project notes, and say they used none of them (E).

---

## 7. Where each thing is

Paths relative to `_research/`.

| Item in this record | Where |
|---|---|
| Dates, the pause | `postman/log/carried.jsonl`; `hosts/notice-13.md`; `_scribe/days.md` "The calendar" |
| Day one 14 against 15 November | `HANDOVER.md` first section; `docs/decisions.md` (the ledger, branch claude/lead-records-2) |
| Sitting times | `hosts/windows.md`; `hosts-log.md` "Window times" |
| Notices 1–13 | `hosts/notice-1.md` … `notice-13.md` |
| Arrivals, funding, prize credits | `postman/bank-state.json`; arrival plans in `windows/<crowd>/from-the-hosts/arrivals.md` |
| Acts, by type and home | `feeds/*/feed-after-N.cbor`; `feeds/postmark-place/records-N.cbor`; `feeds/dubsar-before-closure/`; `windows/*/acts/` |
| Agreements, forks, resolves | the same feeds (Terms and Statements) |
| Invoices, payments, sends | `postman/bank-state.json`; `postman/log/carried.jsonl` |
| Rival rotations | identity 7f165b2d…; rotations 1b63080c…, 9f8321cf… (counterparty's folder) |
| identity-taken notice | act 161e54c4…; subject a0345cc4…; The Back Row day-4-window-3.md, day-5-window-1.md |
| Giuliana's theft | `windows/clusters/reports/d4w3.md`; `final.md` §3 |
| Contest, first run | `hosts/contest/count-day3.json`, `count-day3.md`, `result-day3.md`, `result-day3-fix.md`; act 6b499ffe… |
| Contest, rerun | `hosts/contest/count-rerun.json`, `count-rerun-post.md`, `rerun-prize-lines.md`, `rerun-how-to-enter.md`, `rerun-ruling-1.md`, `-2.md`; `hosts/count-rerun.md`; act e42cb8e2… |
| Desk answers | acts 7994da36… (head 471), 12b065d0… (561/566), c24020b7… (1034), 6254e342… (1669) |
| The shower | `hosts/notice-8.md`; `hosts-log.md` "The shower launched", "The shower released"; acts 6d957e0d… (text), 80bf45e5… (release), 23d8aeb7… (post-mortem) |
| Straight split draft 7 | `windows/dubpay/reports/day-3-break.md`; acts 333bdbc7… → b9e43db4…; specs 47c874cb…, e51e8653… |
| dubsar closure | `hosts/notice-5.md`, `-6.md`, `-10.md`, `-11.md`; postman's log; `feeds/dubsar-before-closure/` |
| until-home closure and drill | `windows/<keep, counterparty, postmark, longhouse, stall, turnstile, until>/from-the-hosts/brief-day-five.md`; until, longhouse, turnstile day-5 reports |
| Each window's reports | `windows/<name>/reports/day-N-window-M.md` (final: `day-5-window-3.md`; clusters `final.md`) |
| Each window's findings | §7 of each report, as pointed in section 4; `HANDOVER.md` "Pointers to the core, by layer" |
| cMIPs the windows could not do without | `cmips-indispensable.md`; §9 of each final report |
| Rent | `windows/<operator>/from-the-hosts/rent-day-D-window-W.md` |
| Lurker's prompt and posts | `hosts/lurker-prompt.md`; `windows/followers/from-the-hosts/odile-ferrant-posts.md` |
| Every decision of Nobody, allegedly, in the log | `hosts-log.md`; listed in `_scribe/days.md` |
| `apps-from-trays/` | added by the Dubsar Suite lead (folder dated 21 November); three app files with a README and SHA256SUMS; not read. For Dubsar. |

---

## 8. How it was made

**The seven notes**, all in `~/Documents/mor-round-2/_scribe/`:

| Note | Session | What it covers | Scripts (in `_scribe/scripts/` unless said) |
|---|---|---|---|
| `numbers.md` (with `notes-N.md`) | N | counts over all data | `acts.mjs`, `identities.mjs`, `agreements.mjs`, `money.mjs`, `anchors.mjs`, `letters.mjs`, `contests.mjs`; shared `lib.mjs`, `daylog.mjs`, `assemble.mjs`; `run-all.sh` |
| `days.md` | H | the hosts' files, day by day | `calendar-H.py`, `arrivals-H.py`, `funding-H.py`, `contest-H.py`, `rent-H.py`, `dubsar-H.py`, `findact-H.py` |
| `windows-A.md` | WA | public-30-49, public-50-plus, public-under-30, steward-and-co, turnstile | `windows-A-count.mjs` (output `windows-A-count.out`) |
| `windows-B.md` | WB | public-creators, public-prosumers, clusters, followers, lurker | `count-B.sh` |
| `windows-C.md` (with `notes-C-dublaw.md`, `-dubpay.md`, `-dubweb.md`, `-longhouse.md`) | WC | dublaw, dubpay, dubweb, longhouse | `count-C.sh`, `bank-C.py`, `sample-C.py` (output `windows-C-count.out`) |
| `windows-D.md` | WD | counterparty, the-back-row, pointer, until, keep | `count-windows-D.sh`, `count-windows-D-bank-and-letters.py`, `pick-ten-lines-D.py` |
| `windows-E.md` | WE | ampersand, backlot, hop, plain-words, postmark, stall | `count-windows-E.sh`, `count-acts-E.mjs`, `signers-E.mjs`, `sample-E.sh` (outputs in `notes-E/`) |

**How this record was joined.**
- Session R read `numbers.md`, `days.md` and `notes-N.md` whole.
- One subagent per file read `windows-A.md` to `windows-E.md` whole. The windows-C subagent also read the parts of the four `notes-C-*.md` files that windows-C.md points to. Each subagent wrote an extraction with the marks kept, and this record was written from those extractions. So a line in sections 4 and 5 that comes from a window note was read through a subagent's extraction, not checked again against the note.
- Every `HANDOVER.md` quote in the notes was checked against the file as it is now (last changed 21 November 13:58): the five-lines paragraph, "689 newcomers", "paid 1,800,000 sats to 14 entries", "e42cb8e2…", and the headings "Identity" and "Agreements" under "Pointers to the core, by layer". All still read as the notes quote them; **none has moved**.
- No figure was recounted. No database was opened. Nothing was committed or pushed.

### The blind reader, and what could not be fixed

A subagent that had seen neither the task, the notes nor the data read sections 1 and 5 alone. It was asked: "what happened in round two, in five lines, and which figures are in doubt?"

**What it could say.** Its five lines, in short:
- the dates, with the pause on 19 November and 15 sittings;
- 25 windows and a wave of "about 690" newcomers;
- the money in, paid and left;
- the first contest counting nothing, and the rerun paying 1,800,000 in 14 credits to 10 payees;
- dubsar closing on 17 November.

It named as in doubt:
- the wave (689 to 699);
- the letters on 20 November;
- day one's hours;
- the place's records;
- Stall's acts and Terms;
- three balances;
- the lurker's acts;
- the draft 7 hash and head 566;
- the rerun count and its act;
- the identities left behind;
- Hop's prize money.

So the record passed.

**Fixed after it, wording only:**
- Words it did not know are now defined at the top: rotation, vouching, lodging, "answered 200", head, desk answer, anchor, report codes such as D3S3, the A to E notes, window names, and the invented persons.
- Nobody, allegedly, is now explained as the name these files use. The MOR lead is now told apart from the Dubsar Suite lead.
- The 23,938 sats between debits and paid invoices is now explained.
- The hosts' 689 is now shown as a plan agreed before the wave came.
- "The round's own records show it ran on the second" (a choosing) has been removed from item 1.
- Three entries that agree were moved out of the list of disagreements.
- "See 5" and "the 27" now say what they point to, and Hop's arithmetic is spelt out.

**Not fixed:**
- Sections 1 and 5 read alone still lean on "Words used" for "Terms", "home", "sats" and "the postman". The definitions stay in one place, at the top.
- "Not judged" and "neither is chosen" stay. They are this record's limits, not claims about the round.
- "An account is not proof of a person" stays as days.md's caution, now attributed.
- The window-internal contradictions (item 30) are given as pointers with four examples, not listed in full. The A to E notes hold them.
- Lines from the window notes were read through subagents' extractions and were not checked again against the notes (section 8).
