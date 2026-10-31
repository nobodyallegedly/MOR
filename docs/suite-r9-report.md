# The Dubsar Suite, round 9 (F411): Assess on what people sign, a collective publishing, every hop receipted, the tip, the signing key as a string

*Session of 31 October 2026, on the branch `claude/suite-r9`, from main after pull request 113. App-only: nothing in `core/`, `wasm/`, `spec/`, `relay/` or the vectors was changed. Author of record: Nobody, allegedly. The finding is F411; no other number was taken.*

**Readings taken** (the round ran alone; each is the most reasonable reading, and each is open to change):
1. **"A publication paying partners before owners with no cap"** is read as a publication taking **half or more of each payment off the top** (partners, role and metric shares, fees on every payment). Nothing in the texts caps those shares below 100% together (Agreements rules 11 and 22), so "no cap" is always true; half is where Assess starts to flag it. Question 4.
2. **A collective's claim is not built.** The core reads a claim's opener as its signer, the member, who must be among its creators, and makes that opener the work's default holder (`core/src/agreements/view/owning.rs`). A collective has no key of its own, so it cannot open a claim in its own name. A claim naming the member beside the collective would make the member a creator and the default holder. That would be false, so nothing is offered. For the MOR lead, 1; question 1.
3. **"Way 3" for a collective is read-only.** Its owners are its constitution (his answer to Q3: "a constitution is an ownership agreement with an identity of its own"). Publishing shows the constitution, read by Assess, with nothing to sign, and points to the publication.
4. **"Each payout receipted, naming the split"** (Agreements rule 23: "with its own receipt naming the split") is read as the payout's commitment fulfilling the split act. The member's receipt copies what the payment fulfils (Money receipt field 5), so it names the split. Before this round a payout fulfilled the member's payee pointer, and the split was named nowhere in the receipt. For the MOR lead, 2.
5. **The shared-sale test is not converted to "one trusted pointer only".** A sale paid to a collective whose pointer names one member's wallet needs someone to answer an invoice request made out to the collective. Damgar refuses any request whose payee is not the identity itself, and no app answers for a collective. The S7e test stays as round 8 left it: a sale through the collective's split service, verified as a purchase. The split-service sale is also tested apart, in round 3. Question 2.
6. **Kišib's runner keeps its plain refusals of old member-key asks.** Runner draft 5, 9.1 asks it to refuse such an ask "said plainly". The refusals hold no key and make none, so they are not member keys. Every word of member keys elsewhere in the apps is gone. Question 5.
7. **Kišib's airgap WebAssembly was kept as released.** No airgap source changed on this branch, and the locally built airgap bytes differed from the released ones, so only `kishib.js` and its `BUILT-WITH.txt` lines changed.
8. **Nakišib stays words only.** It is Rust and offline; the string is the TypeScript Module's. The words and the string are one key, so a key Nakišib wrote can be brought into any app, which then shows its string on request.

## 1. In plain words: what changed for someone using the apps

- **Edubba reads what you are about to sign, and says what to watch.** Before you sign an ownership agreement or a publication in Publishing, and in a collective's "Its constitution, in plain words", Edubba shows who owns what, how the owners decide, how much of each payment comes off the top, and **the risks, each with the rule it rests on**. Examples: no maximum fee per payout; a partner taking half or more before the owners; one member alone able to act in Money; a co-owner nobody can declare absent.
- **A collective can sell through Publishing.** Acting as a collective you belong to, its owners are its constitution (Publishing shows it). Its publication names that constitution. You make it, and later end it, for the collective with your own key, and the other members its rule asks are asked in their own Edubba. A collective cannot yet claim a work (reading 2).
- **When a split service pays you your part of a sale, your own app signs your receipt for it, naming the split.** Every hop of a sale now has its receipt: the service's for the buyer's payment, then each member's for their payout.
- **You always pay the newest version.** If the owners sign a new version of who owns what, or the service changes the price, after you found the work, Dub pays under the new ones and shows you the new shares.
- **Your signing key can be a string instead of 24 words.** Wherever an app asks for your signing key, it takes its 24 words or its string (starting `morsk1`), the same key. Wherever it shows the words, "Show the same key as a string" unfolds the string. A copying mistake in the string is caught. The chain key stays words only.

**Screenshots:** none new this round. The visible changes are words in existing read-backs and one folded line under the signing key's words. Round 8's screenshots (`docs/suite-r8/`) still show every screen this round touched. The human test steps (section 5) walk each change.

## 2. Item by item

### Item 1. Assess, moved: built

- **What it judges now** (`clients/assess`):
  - **a work's ownership agreement**: who signed; what each party is bound to; who owns what; how the owners decide; who judges; how it ends; what is still owed;
  - **a collective's constitution**: the same, plus the five layers (Money first), the finer areas, and the holders' rule and pre-emption (Agreements rules 94 to 96);
  - **a publication**: what it sells; its price tags (a tag whose payee is not the split service said as a bypass, rule 16); its owners, read from the ownership agreement it names, never copied; its partners and their labels; its split plan and fees (how much comes off the top, and the owners' line left); its split service and backups; who signs and how it ends.
- **Its risks**, each citing its rule (rules quoted from draft 17 when "ask about this" is used):
  - **kept where they still hold:**
    - a party with no exit (rule 47; in a publication, no party ends it alone, rule 11);
    - an uncapped fee (rule 25, client conformance: the absence of a maximum fee per payout flagged before signing);
    - a judge who is also a party (rule 35);
    - no judge of forks (rule 47);
    - a stake diluted without its holder (outcome 1, rule 89; the release rule, rule 55; **new:** a holders' rule by share, rules 94 and 95; pre-emption waived, rule 96; a collective's publication signed under its Agreements rule, rules 11, 15 and 60);
    - money divided with no owner (rule 22: everything off the top; a split agreement naming a work or none);
    - the stated costs: absence on someone's word (rule 87); the split service's window (rule 32);
  - **new:**
    - **partners paid before the owners, with no cap** (half or more off the top, rules 22 and 11);
    - **one member alone holding Money** (rule 60: Money by any one member, or a Money area held by one with no cap);
  - **gone with the acts they read:** payer-side splitting; the fee-raising checks on terms fields 8 and 28.
- **Where it is used:**
  - Edubba's "Its constitution, in plain words" (unchanged call, new reading);
  - Publishing's read-back before an ownership agreement (`beforeSigning`) and before a publication (`beforeSigningPublication`, with the owners' terms in force);
  - the collective client and the desk, as before;
  - the command, `mor-assess ID`, now for a publication too (`gatherPublication`, which asks the core for `agreementsPublication` and `agreementsPublicationTip`).
- **Tests:** 56, all green. Its tests were rewritten on draft 17's acts: the freeze suite's and the case studies' agreements as ownership agreements, constitutions and publications; each risk present and absent; the command against a home and a relay; "ask about this" against a fake API.
- **In CI:** a step of its own in the "all" job, its typecheck then its tests.

### Item 2. A collective in Edubba's Publishing: built, except the claim

- **Owners:** `prepareOwnership` as a collective shows its constitution in force, read by Assess, and says "Nothing to sign here".
- **Publication** (round 8 had begun it): its owners field names the collective's founding agreement. It is made by a member under the rule reaching publications, and the area's other holders are asked in their own Edubba. It is now read back with Assess (for example: "the collective signs this publication under its rule for Agreements (any 2 of 3 members)").
- **Ending:** new. A version selling nothing, made for the collective by the member with `signAsMember`, naming the publication and the collective's chain; the others its rule asks are asked.
- **Claim:** not offered (reading 2). The words in the app say why.
- **Test:** `clients/desk/test/publishing.test.ts`, "way 1 as a collective… its owners its constitution; its publication and its ending, made for it by a member". It checks the read-back, the acts' signer (the member) and their objects (the collective's chain).

### Item 3. Every hop has its receipt: built

- **Checked end to end** in the round-3 test (`clients/desk/test/round-3.test.ts`). It runs on in-memory nodes here and on regtest Lightning in GitHub's "regtest" job. A buyer buys a collective's work through its split service:
  - **hop 1:** the service receipts the buyer's payment as itself (rule 16);
  - **then:** each of the four payouts (three members, one reposter) is receipted by its receiver's own Damgar, by itself under its receipts lane.
- **The gap found and fixed:** the members' receipts existed but named no split. A payout's commitment now fulfils the split (reading 4). Each receipt is sealed to the service, which keeps it (`onReceipt`) and lists every payment's hops (`hops()`).
- **The test walks every hop** and finds each receipt, signed by the right party. On the web, a member signs the same receipt by hand ("Sign the receipt" in Damgar), unchanged.
- **The texts already say it:** a payout is "paid as a simple Money payment, with its own receipt naming the split" (Agreements, "Payout" and rule 23). Nothing for the MOR lead on that point, beyond reading 4's question of how a receipt names the split.

### Item 4. The tip, always: built

- **One shared helper**, `publicationTip` (`clients/grants/src/deal.ts`), fetches a publication, its ownership agreement and every act of their parties, and asks the core's `agreementsPublicationTip`.
- **Dub** (`priceOf`, `vowPurchaseOf`): the purchase names `[agreement, latest version]`, the shares said before paying are the latest version's, and a tag the tip does not list is replaced by the tip's.
- **The anchoring reader** shared by Ummia, Damgar, Edubba and Dub (`offers`) keeps only a service's latest publication and each tier's latest tag.
- **Test:** `clients/dub/test/sales.test.ts`, "the tip, always". The buyer finds the work. Then the owners sign a 50/50 version, and the split service a new price. The purchase names the new version, follows the new tag and pays the new price.

### Item 5. Clean-ups decided: built, except the shared-sale test

- **`publishing work read`:** removed from `clients/desk/src/ops.ts`; its one test (`h80.test.ts`) now uses `publishing upload read` with a price.
- **The member keys cMIP: retired.** `cmip-member-keys-draft-2.md` opens with **Retired**, his words and why; draft 1 points to it; the cMIPs' index says so; Kit's rule list says it with his words. The last words of member keys in the apps went: Dub's identity panel, its collective form and its shapes.
- **The shared-sale test for the one trusted pointer only:** left (reading 5; question 2).

### Item 6. The signing key as a string: built

- **The Module draft:** `modules/module-signing-key-string-draft-1.md`, beside the carry Module. The signing key's 32 bytes are written as Bech32m (BIP-350): `morsk1` and 58 characters, the last 6 a checksum. Any one wrong character is caught, and so are up to four.
- **The code** (`modules/carry/src/string.ts`, TypeScript, not in the core): `toKeyString`, `fromKeyString` (refusing a wrong prefix, a character outside the alphabet, a wrong length, a failed checksum or mixed case, saying which), `fromCarried` (24 words or the string, to the same seed). For the pages, `keyStringHtml` (`src/key-html.ts`, with no import).
- **Tests:** 11, BIP-350's own test vectors among them.
- **In the apps** (Dub, Damgar, Ummia, Edubba, Kišib):
  - every place a signing key is brought takes either form, the box's label saying so;
  - where the signing key's words are shown (Dub, Damgar, Ummia, and Kišib for a new signing key), "Show the same key as a string" unfolds the string with its warning;
  - the chain key is never offered as a string.
- **Test:** `clients/dub/test/dub.test.ts`. A third Dub, brought by the string alone, is the same identity; a typo in the string is refused, nothing kept.

### Last

- **Main** had not moved since this branch began (still `dd8fdd3`), so its WebAssembly was unchanged (`63e514f9…`, the same as the releases').
- **Releases rebuilt** for the five apps this round touches: Dub, Damgar, Ummia, Kišib and Edubba (`npm run release` in each). The display client's rebuild came out byte for byte unchanged.
- **Tests:** below.

### Tests

Run on this machine (Linux x86-64; Chromium for the browser tests, named with `MOR_CHROMIUM` because this machine's browser sits at another path than the tests' default), every app's `npm test` after the releases:

| App | Passed | Failed |
| --- | --- | --- |
| Assess (now in CI) | 56 | 0 |
| Edubba (desk) | 117 | 0 |
| display client (site) | 86 | 0 |
| Dub | 47 | 0 |
| collective | 45 | 0 |
| Kišib | 44 | 0 |
| genesis | 41 | 0 |
| Damgar | 41 | 0 |
| Ummia | 35 | 0 |
| longform, reader, repo, kit, barebone, connector | 26, 22, 21, 18, 15, 13 | 0 |
| reports, grants, manage, testwallet, split service | 9, 8, 7, 4, 2 | 0 |
| Modules: carry, jpeg, audio, video, timestamp | 11, 14, 8, 6, 5 | 0 |

- **Repo, one red on the first run:** "the MOR repository itself, published and verified file by file". It compares the working tree with what is committed, and two record files were edited but not yet committed during that run. Run again after committing them: 21 of 21.
- **The four media Modules, red on the first run:** they could not start, because their packages were not installed on this machine (`tsx` not found). Installed and run again: all green, as above.
- **The Rust workspace was not run here:** this round changed no Rust. GitHub's "all" job runs it.

**On GitHub** (pull request 115): regtest, release, mac, linux, seal and browsers green at the first push of the code; "all" is reported in the pull request once it ends.

## 3. For the MOR lead

None of these was changed by the suite.

1. **A collective cannot open a claim** (reading 2).
   - *The cause:* `WorkClaim::decode` requires the act's outer signer among the creators, and `work_owners` makes that signer the default holder. For a member's act for a collective (naming it on its chain, Agreements rule 58), that is the member, never the collective.
   - *Asked:* should a claim made for a collective read the collective as its opener (as rule 58 reads other acts for it)? Or is a collective's claim meant to name its members as the creators?
   - The text's "the signer (who opens it) among them" does not say, for an act for a collective.
2. **How a payout's receipt "names the split"** (rule 23; reading 4).
   - *What the suite did:* a payout's commitment fulfils the split act, so the receipt's field 5 names it. Under "Belongs to", the receipt then belongs to the publication through the split.
   - *Asked:* please confirm that field 5 naming a split is the meaning, or name the field meant.
3. **No pure core reader of a publication's payload.**
   - `readTerms` reads terms from their bytes. A publication has only the verifier's `agreementsPublication`, which needs a signed act held.
   - Assess and Edubba read back a publication before it is signed, so Assess reads the payload's fields itself, as draft 17 writes them (`clients/assess/src/publication.ts`).
   - A `readPublication(payload)` binding, decoded strictly by the core, would replace that.
4. **`agreementsPublicationTip`'s `ownersLatest`** is the version in force, so a newer version whose founding version never came to exist (a party never signed it) leaves the founding as the tip. That is right by rule 47. Said only because the suite's own test first missed one signature and read it as a bug of its own.

## 4. Questions for Nobody, allegedly

One at a time, each with a lean.

1. **A collective's claim.**
   - *Plain words:* a collective has no key, so the member who signs a claim for it counts as a creator, and as the work's owner when no ownership agreement exists.
   - *Lean:* wait for the MOR lead's answer (For the MOR lead, 1); until then a collective sells through its publication, its owners its constitution, with no claim.
2. **A sale to a collective that uses one trusted pointer.**
   - *Plain words:* nobody answers a buyer's request to pay the collective when its money goes to one member's wallet, so such a sale cannot happen on Lightning today.
   - *Options:* (a) the trusted member's Damgar answers for the collective, under its rule for Money; (b) a collective selling must name a split service.
   - *Lean:* (a), next round, and the shared-sale test then moves to it.
3. **Approve the signing key's string, draft 1?**
   - *Plain words:* `morsk1` and 58 characters, a check built in, the same key as the 24 words.
   - *Lean:* approve after the hand test.
4. **"Partners before the owners": flag at half?**
   - *Plain words:* Assess warns when half or more of each payment goes to others before the owners.
   - *Lean:* keep half; it is a warning, never a block.
5. **Kišib's runner refusing old member-key asks.**
   - *Plain words:* an app written for draft 3 that asks Kišib to hold a member key gets a plain "there are no member keys any more".
   - *Lean:* keep the refusal until the freeze, then drop it with draft 3's apps.

## 5. Human test steps

They join the hand test of the redesign.

**On the Mac (Edubba, Dub, Damgar, Kišib, Ummia).**
1. **Edubba, an ownership agreement.** Publishing, An ownership agreement, from a claim, you and one other at 50/50: the read-back ends with "How the owners decide" and "Risks, before you sign (the assessment tool)". Check that it says a co-owner who cannot be declared absent can block every change, and that there is no judge of forks.
2. **Edubba, a publication.**
   - Build one with a partner labelled "label" at 55% and no referral: the read-back has "The split plan and its fees" ("Off the top of each payment: 55%") and, under Risks, "Partners paid before the owners" and "Uncapped fee".
   - Lower the partner to 10%: the first flag goes.
3. **Edubba, as a collective.**
   - Collectives, a collective of three; "Its constitution, in plain words": a "Who owns what" section and the Risks.
   - Publishing, act as the collective. An ownership agreement: "Nothing to sign here: a collective's owners are its constitution".
   - A publication of an upload of the collective: its read-back names the Agreements rule ("any 2 of 3 members"); sign it, and see the other member asked in their own Edubba.
   - Then, on that publication, Withdraw the publication: signed for the collective by you.
4. **Dub, the tip.** Find a work sold through its owners' publication. In Edubba, have the owners sign a new version (or the split service a new price). In Dub, Buy: the shares shown are the new ones, and the price is the new one.
5. **Every hop's receipt** (with the test split service). After a buyer pays a collective's work, each member's Damgar, Account: the payout from the service shows "receipt" signed by you. On the web Damgar: sign it by hand.
6. **The signing key as a string.**
   - Dub, the identity panel, "The signing key's words": "Show the same key as a string" unfolds a `morsk1…` string.
   - Write it down. In Damgar (or Ummia, or Edubba's "bring an identity"), bring the identity with the string instead of the words: the same identity.
   - Change one character: refused, "the checksum does not match".
7. **Kišib.** Make an identity: once the signing key's words are shown, the string unfolds beneath them; the chain key's paper has no string.

**On the iPad.**
- Edubba's read-backs with the new sections scroll in their own box; the Risks lines wrap, nothing runs off the side.
- The string under the signing key's words is folded until tapped, and selectable.

**On the iPhone.**
- Dub at 390 px: "Show the same key as a string" opens; the string wraps in groups of four, no sideways scrolling.
- Edubba's publication read-back at phone width: each risk readable, with its rule.
