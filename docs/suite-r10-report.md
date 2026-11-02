**Ready to merge on the suite's side: STATUS_LINE**

# The Dubsar Suite, round 10 (F415): anonymity a fresh identity, the route buyer's claim, a collective one holder, the escape, Fable's bound in the apps, round 9's remainder

*Session of 2 November 2026, on the MOR lead's branch `claude/s7i-routes` (pull request 116), after S7i, S7j and S7k. App-only: nothing in `core/`, `wasm/`, `spec/`, `relay/` or the vectors was changed (the generator gives the same bytes). Author of record: Nobody, allegedly. The finding is F415; no other number was taken.*

**Readings taken** (the session ran alone; each is open to change):
1. **"The apps' anonymous paths"**: no app had a path where a payer stayed unnamed (Damgar always paid as the person's identity). Read as: build one, in Damgar, the wallet, as a fresh identity. The visitor's note on a gateway (`clients/site`, `clients/reader`) already signs with a one-time identity born at the homes the gateway names: a fresh identity already, not self-hosted, left as it is.
2. **"Without it the escape is refused"** (S7k, for the air-gapped Module): at operated homes, without the rival's bytes, the device still offers the *ordinary* escape (the homes refused the rotation, on the online side's word, as since draft 4); what it never offers without the bytes is the *contested* escape. The tests say so; only at a self-hosted home is any escape refused without the bytes, as before.
3. **Kišib's refusal of old member-key asks dropped**: the special refusal, the endpoint and the member line are gone; such a request is refused as any malformed one is. The erasing of member keys found in an old runner file (runner 9.3) is kept: it erases secrets a test machine may still hold.
4. **The shared-sale test is not moved** (round 9's reading 5): see question 1.

## 1. In plain words: what changed for someone using the apps

- **You can pay without your name** (Damgar, "Pay without your name" beside "Sign it"). Damgar makes a new identity for that one payment, hosted by itself, and pays as it. The seller sees an ID that is not yours. If a refund is owed, it is owed to that identity, and Damgar keeps its key so you can receive it. A payment that names no payer at all is a gift: shown so, with no refund to wait for.
- **Paying through a converter gives you your rights as a buyer.** When Damgar pays a conversion service on its way to a seller, your claim names the seller's price tag, so you, not the service, can contest the sale, confirm a vow and carry a referral. (No screen yet: an app reaches it through Damgar's `pay tag`.)
- **A collective that owns part of a work is one owner.** Edubba lists it once, asks it once, and its members sign for it under its rule; they are never shown as owners of the work. In Dub's and Edubba's To sign, a request for the collective opens with "You sign for the collective".
- **A collective can claim a work** in Edubba's Publishing: the collective is its creator, the members who made it with it beside it.
- **A collective with one trusted wallet can be paid:** the member whose wallet it is answers a buyer's request made out to the collective, and signs the receipt for it.
- **When the rail has not answered yet, the apps say so for the whole list.** A collective's money owed back, or a vow's sales, resting on two or more payments the rail has not confirmed, reads "unknown, waiting for the rail", and a collective cannot close until it is known.
- **The escape** (Kišib and the air-gapped signer): if someone holding your stolen chain key changes your keys at the same place as you, you can leave, whatever your homes are, once the device has checked their change itself.
- **Assess's "partners paid before the owners"** warns at half by default, and you can set your own line (`mor-assess --partners-line 30`).

## 2. Item by item

### 1. The payment cMIP first: built
- **S7k's patch** (`docs/s7k-cmips-payer.patch`) applied as written: the commitment's payer `Option<Hash>`, a claim's payer its signer, `transfer_to_oneself` comparing identities, the anchoring refund's `to` the payer named or none.
- **Beyond the patch:** the payment cMIP's dead check of an anonymous claim's signature removed (the core's `check_signer` now always passes a claim), its comment saying why a routing node still cannot claim; the doc comments of the three crates name their new drafts.
- **Tests moved** (each `Payer::Identity(x)` → `x`, `anonymous: None` gone): `cmips/payment/tests/transfer.rs` (a payer is another identity or none), `cmips/anchoring/tests/batch.rs`, `cmips/split/tests/step13.rs`, `modules/lightning/tests/{rule,flow_theft,stolen_phone}.rs`, `modules/onchain/tests/{rule,agreement,service,money,review,conversion,custody}.rs`. The three bare-key cases became fresh-identity cases: `an_anonymous_payer_is_a_fresh_identity_f113_f416` (Lightning: the fresh identity's claim counts, a routing node's does not, a gift nobody can claim), `an_anonymous_payers_claim_counts_only_signed_by_its_fresh_identity` (on-chain), `rq1_a_refund_to_a_fresh_identity_is_checked_where_its_claim_said` (refunded at the refund rail its claim names).
- **The drafts:** `cmip-payment-draft-6.md` (payer `hash / null`; item 5, the anonymous payer a fresh identity delivering its genesis; step 5, a claim's payer its signer; the refund rail's payee), `cmip-conversion-draft-5.md` (a hop's claim's payer its signer; item 2 below), `cmip-anchoring-draft-8.md` (a default's refund to the payer named; a gift owed nothing). The index updated.
- **The anonymous path, each place:**
  - **Damgar**, paying a draft: "Pay without your name" makes a fresh identity (one genesis naming itself as its only home, no operator: Identity rule 4; its chain key dropped at once), commits it as payer, signs the invoice request and every claim with it, by hand only, names the refund rail the person gives (key 7), and leaves its genesis, routes and encryption key at the payee's inbox and the person's relays (client conformance). Damgar reads what is sealed to it with its own key. Test: `clients/damgar/test/anonymous.test.ts` (the seller resolves the fresh identity from the genesis delivered, receipts it; the core reads the purchase's `refundTo` as the fresh identity, not the person).
  - **Damgar**, Shared deals: a payment naming no payer is shown as a gift, no refund owed.
  - **The gateway's and the reader's visitor notes**: already a one-time identity; unchanged (reading 1).

### 2. Paying through a route: built
- Damgar's new operation `pay tag` pays a conversion service's tag (`value` at most its price) with `cites`, the seller's tag: the claim's key 4 stays the commitment's (the service's tag), and every claim of the payment cites the seller's tag in `refs`, the private one sealed to the service and the public one of `confirm purchase`; a referral in key 6. `payUnderLane` takes `cites` too.
- Test `clients/damgar/test/route.test.ts`, the service's publication, tag, forward receipt (field 7) and the seller's onward receipt (field 6) built with test identities, the rail answers stated as the apps state them: `moneyRouteBuyer` "the first payer", the buyer's contest shown by `agreementsPurchaseContests`; the vow's sale pending, then confirmed by the later claim acknowledging the door's record (`agreementsVow`); the referral carried by that claim (`agreementsSplit`).

### 3. A collective, one holder: built
Every place, in plain words:
1. **Edubba's ownership agreement:** a collective owner is marked "(a collective: one owner)" and asked once, the request going to its members with a voice in its rule for Agreements, naming it; Edubba waits on it as one entry, its signature counting only when the core finds the rule met. *Before, the request went to the collective's own inbox, which it does not have, and waited for a key's signature.*
2. **Edubba's publication from it, and its ending:** the same; the work's key goes to the collective, sealed to each member (rule 57).
3. **A collective's own publication:** its words no longer call its members "its owners".
4. **To sign (Dub's Signing tab and Edubba's, one code):** "You sign for the collective"; the member signs the collective's signature, the others its rule needs asked to add theirs. *Before, the member signed as themselves, counting for nothing.*
5. **Checked, unchanged:** Dub's buy read-back (a collective owner listed once); a split agreement version paying a stake less (no app builds one); Edubba's other "who must sign" lists (members of their own collective).
- Test: `clients/desk/test/publishing.test.ts`, "a work held by a person and a collective of three": two owners, no member listed, the collective asked once, its 2-of-3 rule met in Dub, the core's `agreementsAgreement` reading two parties.

### 4. The escape: built
- `modules/airgap`: `Exception::EscapeContested`'s words ("contested by two rotations revealing this key"), its doc comment and `check_competing`'s, the README's paragraph. `tests/rule_29.rs`: two homes (rule 44) and three homes each missing the home rule (rule 40): without the rival's bytes only the ordinary escape; the device's own rotation or one that does not compete refused; the rival's bytes open the contested escape, said so, and it signs.
- Kišib: the escape's words in its form, its doc comment and README (it already found rivals wherever served).

### 5. Fable's bound on the owed-back list: built
- `clients/collective/src/actions.ts`: `owedBackOf` reads the core's answer; `law/rail-unanswered` makes the list **unknown as a whole**, shown as "unknown, waiting for the rail", and it blocks the closing, said in plain words (`UNKNOWN_OWED_BACK`). *Before, that refusal was read as an empty list, so the closing would not have been blocked.* The owed-back entries lose `toKind` (S7k); the closing's left-open entries always carry their notice.
- `clients/collective/test/rb.test.ts`, "QG1 and F197, under Fable's bound": one payer's entry, a notice, left open; then a gift's second unanswered record makes the whole list unknown, blocking the closing, no entry named alone; and a unit test of the reading.
- Dub's vows likewise (`vowProblem`, `test/vow-waiting.test.ts`).

### 6. Ummia's pinned hashes: built
`MICS_HASH = c1ced602…b9b2`, `SUITE_HASH = 586d2f1d…9b2e`, as S7k's "Checks" gives them; `test/cards.test.ts` computes them again from the files.

### 7. Every binding change of S7i, S7j and S7k
| Change | Taken in |
| --- | --- |
| S7i `readPublication` | Assess (item 8). Dub's own `readPublication` (`clients/barebone/src/sealed.ts`) reads a signed act, its drafter and bakes, for finding; left (question 5). |
| S7i `moneyRoute`, `moneyForwardOwed`; S7j `moneyRouteBuyer` | Damgar's route test (item 2). `moneyRefundAlong`: not used by any app yet. |
| S7i: a payout's receipt names its split in field 5 | already so (round 9) |
| S7j: unknown spreads (vow, purchase contests, owed back) | Dub's vows, the collective's owed back (item 5); Dub's contest reading already said unknown |
| S7j/S7k: the route buyer's claim citing the tag | Damgar (item 2) |
| S7k: the payer an identity or null; `toKind` gone; `refundTo` identity or null | the cMIPs; the collective; Damgar's anonymous path |
| S7k: the closing's notice required | `closingPayload`'s `LeftOpen.notice` a string |
| S7k: `[5, stake]` not listed under every holder | no app named it |

### 8. Round 9's remainder: built, save the shared-sale test
- **A collective's claim** (F412): Publishing, acting as the collective, makes it (after an upload or alone): the collective opener and creator, the member signing for it under its rule, members beside it as co-creators each signing their own act (only members may be listed). Read back; the core's verdict shown. Test: "a collective's claim (round 10, F412)". The default holder is said in words: no binding reads a work's owners (For the MOR lead, 1).
- **Assess on the core's reader**: its own payload reader removed; the core's words shown for a malformed publication (a new test).
- **One trusted wallet**: the payer's Damgar seals the request to the member whose own pointer names the collective's address; the member's Damgar answers by hand where it acts for the collective, its rule for Money counts the member, and the pointer is the collective's in force; the receipt is the collective's, signed by the member, sealed to every member (F126; a bug the test found). Test `clients/damgar/test/trusted-wallet.test.ts`. **The shared-sale test is not moved**: Edubba's publication for a collective requires a split service, so a sale under it always pays the service (question 1).
- **Kišib's refusal dropped**, with `cmip-runner-draft-6.md` (reading 3).
- **Assess's partner line**: default 50%; `partnersLine` in the context, `--partners-line` on the command; the warning names its line; a bad line refused in plain words. Edubba stays on the default (its settings not yet carrying it).

### 9. Last
- Main had not moved (`14520bb`, already in the branch): the merge was empty.
- The six web releases rebuilt (`npm run release` in `clients/site`, `dub`, `kishib`, `damgar`, `ummia`, `desk`), each built again to the same bytes (`npm run test:build`, all green). Kišib's air-gapped WebAssembly changed with the Module's words.

### Tests
TESTS_TABLE

GITHUB_LINES

## 3. For the MOR lead
1. **A binding for a work's owners.** `work_owners` and its default holder exist in the core (`core/src/agreements/view/owning.rs`), but no binding exposes them, so Edubba says "the collective is the default holder" in words only. A small `agreementsWorkOwners(specs, work)` would let the apps show it as the core reads it.
2. **Several first-hop claims are read by the smallest id** (S7j's question 4): a buyer's later confirming claim can become the vow's sale act and `moneyRouteBuyer`'s `claim`, so a contest naming the first claim may fall out of step. The first in time on the payer's line would not shift. The route test accepts either.

## 4. Questions for Nobody, allegedly
One at a time, each with a lean.

1. **How does a collective with one trusted wallet sell a work?**
   - *Plain words:* Edubba sells a collective's work only through a split service, so the shared-sale test cannot yet move to the one wallet.
   - *Options:* (a) a priced bare bake uploaded for the collective, its tag signed by a member for it, paid to the collective unsplit; (b) a publication naming the collective as its own split service.
   - *Lean:* (a); Edubba then offers it, and the test moves.
2. **Who may be listed beside a collective on its claim?**
   - *Lean:* its members only, as "Claim (type 3)" says; Edubba refuses anyone else today.
3. **A collective asked as an owner:** every member with a voice in its rule receives the request, and whoever signs first signs for the collective, the others adding theirs.
   - *Lean:* keep it so, rather than naming one member to be asked.
4. **A refund rail the anonymous payer gives that their own pointer already names** would link them.
   - *Lean:* refuse it, saying why (today Damgar only warns in the field's words).
5. **Dub's own publication reader** (`clients/barebone/src/sealed.ts`), used to find works, reads signed acts by hand.
   - *Lean:* move it to the core's reader next round, as Assess now is.
6. **Assess's partner line at 100% (off):** refused today, "No owner" covering it.
   - *Lean:* keep refusing.
7. **"Receiver" shares off the top:** Assess counts role and metric shares and fees; if a publication may carry a receiver share, it is off the top too.
   - *Lean:* ask the MOR lead whether a publication's plan may carry one; if so, count it.

## 5. Human test steps
They join the hand test that follows the merge.

**On the Mac.**
1. **Pay without your name.** Dub, tip someone. Damgar, Waiting: open "Pay without your name", tick it, optionally paste a node key for refunds, "Sign it". The payee's Damgar shows the request from an ID that is not yours. Pay, paste the preimage: your Account says "Paid without your name, as the fresh identity …"; the payee's shows a claim by that ID.
2. **One trusted wallet.** Edubba: a collective whose Money is held by A alone; Money, one trusted pointer with A's wallet. A's Damgar: publish A's rails; Settings, act for the collective. From another Damgar, tip the collective's ID: A's Waiting says you answer for the collective; make the invoice, then sign the receipt by hand. The payer's Account shows it settled.
3. **A collective's claim.** Edubba, a collective of three (2 of 3 for Agreements). Publishing, act as the collective, upload a text, "Then: a claim", naming yourself and another member beside it: read back (the collective the opener, the default holder); sign; the second member is asked; the co-creator signs in Dub; "Look for signatures": bound, with the core's verdict.
4. **A shared work.** A second Edubba (River) adds the collective as a contact, uploads, claims, an ownership agreement River 50%, the collective 50%: two owners, "asked once, as the collective". One member signs for it in Dub ("You sign for the collective"), another adds theirs; River's "Look for signatures": it counts. Then a publication from it.
5. **Waiting for the rail.** In the collective client, a broken collective with two payments the test rail never answers: its card says "Owed back: unknown, waiting for the rail", and Close is blocked with the same words.
6. **The escape.** Kišib, Paper, "Escape a contested position": the form's words now say "two changes made with the same chain key contest one position, wherever your homes hold them".
7. **Assess.** `mor-assess <publication> --at <relay>` with a 10% partner: no warning; with `--partners-line 10`: "10% or more, the line set for this warning"; `--partners-line half`: refused in plain words.

**On the iPad and the iPhone.**
- Damgar's "Pay without your name" fold, at phone width: the tick box, the refund field and its cost wrap, nothing runs off the side.
- Edubba's read-back of a shared work: "(a collective: one owner)" and "asked once" readable at 390 px.
