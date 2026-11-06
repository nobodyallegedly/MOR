# Counterparty: findings

*Newest first. Each: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks.*

*Only findings about the core (the MICS, the six MIRs, the freeze test suite, the reference verifier) are published here. What we found in a player's own build, or in a shared cMIP or Module, has gone to its maintainer first, under our disclosure rules (`who-we-are.md`).*

*Read at `af2ed6f8`. "Confirmed" means we ran it against the reference verifier, or traced it in the code or a test. "Inferred" means it follows from the texts and the code paths cited, but we did not run it. Test identities only, on paper or in local tests; no network was touched.*

---

## 6 November 2026, evening

### C13. A payer cannot contest the record that divides its own payment

- **Tried:** a subscriber whose payment is divided by a metric record (Agreements rule 29) finds the record does not match what its client reported, and contests the record.
- **Texts:** "a contest of any other act", a metric record among them, counts only when signed by someone with standing (rule 54): a party to the agreement; a holder of a stake the act affects; a keeper, arbitrator or verifier the agreement names; or the buyer of a purchase, "for a contest of that purchase". The payer is none of the first three. As a buyer, it may contest only its purchase, and its field 1 names a promise "in words", or a vow's terms; it cannot name the record (Contest, type 14, field 0 and field 1).
- **Expected:** the one identity able to check a metric record against what was actually used, the payer, able to name it in a contest. The holders the record pays have standing; the payer it is measured on does not.
- **Rule or vector:** Agreements rules 29 and 54; Contest (type 14).
- **Blocks:** no. A contest changes nothing in any case, so this is about the record's honesty, not about money. Terms can name a verifier with standing to whom payers report. Read in the texts; not run.

---

## 6 November 2026: the first sweep

Twelve findings in the core, most severe first, then the answer to the question we brought to the table, then three stated costs we will not count as flaws.

### C1. A builder's fee can be paid to anyone, the split service included

- **Tried:** a publication whose split plan carries a fee for a Module, then a split in which the split service pays that fee to itself.
- **Texts and code:** a fee entry is `[module, part, ? scope]` and names no receiver (Agreements, the split plan's format, key 9). The verifier checks only that a payout's Module is among the plan's fees, never who receives it (`core/src/agreements/view.rs`, the split check, around line 10474). The reference test has the service pay the fee to itself and expects no mismatch (`core/tests/agreements_collective.rs`, around line 4239). The Module's own "who is paid" field is informative and nothing reads it.
- **Expected:** the rule's own promise, "Any payout to anyone else is a mismatch: never an address the parties did not sign" (Agreements, after rule 28). The fee's receiver is an address nobody signed.
- **Rule or vector:** Agreements rules 22 and 28; the split plan's format; no vector covers fees or splits.
- **Blocks:** yes, for any model that rewards the builders of Modules. A split cMIP cannot fix it, because the core's check decides. Confirmed in code and test.

### C2. An escape can unmake a sale, a fork's debt assignment, or any act relying on a chain signature

- **Tried:** a seller holding both keys sells a stake, is paid, then signs an escape at the same position that abandons the chain signature placing the transfer.
- **Texts and code:** Identity says a Module may sign an escape that abandons a rotation which counts, "the escape then wins", and chain signatures compete exactly as rotations do (Identity, rule 29's stated cost; section 11). The verifier adds chain signatures as candidates and drops abandoned ones before counting receipts (`core/src/chain.rs`, around lines 1358 and 1477 to 1505). Agreements protects endings and successors' debt signatures only against a *later* rotation ("no later rotation voids it", rule 91 and the fork's paragraphs); the escape sits at the same position.
- **Expected:** what others relied on stands, for chain signatures Agreements relies on, as it does for acknowledged acts.
- **Rule or vector:** Identity rule 29 and section 11; Agreements rules 10 and 91. No vector or freeze scenario exercises it (3.9aa, 3.9ae and 7f do not).
- **Blocks:** yes, for the freeze. The Identity mechanism is confirmed in code; the Agreements consequences are inferred: the texts don't say whether an over-sale refund is owed when a transfer is undone this way, or whether a fork loses its completeness.

### C3. Members can take an outside holder's stake through the absence clause

- **Tried:** the members of a collective, under their judicial tier, change the abandonment clause to name one member as the authority, allow outcome 1 and drop any absence-proof cMIP; then declare absent a holder who is no party (an investor, a departed founder, a buyer of a share) and is present.
- **Texts:** a declaration against a holder who is no party is made "under the clause in force", its authority and absence-proof cMIP the clause's (rule 85); "Coverage is judged under the clause in force, one version for everyone"; a contest voids nothing (rule 88). With no stake successor named, outcome 1 shares the stake among the remaining holders, the members mostly.
- **Expected:** the protection rule 48 gives a holders' rule, which "binds only holders who accepted it, by signing a version carrying it or by buying under it", applied to the clause that can move their stake.
- **Rule or vector:** Agreements rules 48, 85, 87, 88, 89; the judicial tier (rule 67, rule 98.2).
- **Blocks:** yes, for any collective with owners who are not members. A cMIP cannot fix it: the members can drop the cMIP as a judicial change. Inferred from the texts.

### C4. A home operator's rotation can undo its customers' key changes and bring a thief's acts back

- **Tried:** an owner with one unaudited home rotates out a stolen signing key. The home's operator then rotates without keeping its receipt line (a client bug, or on purpose). Variant: the operator's closing rotation keeps nothing, and a thief then uses the owner's already-spent first chain key from an old backup.
- **Texts and code:** receipt check 5 voids any receipt outside the operator's kept ancestry (`judge_receipt`, `core/src/chain.rs`, around lines 1717 to 1724). Run against the reference verifier: the owner's chain falls back to its first act (stop: pending), and the thief's post signed with the stolen key goes from void back to valid. In the variant, the thief's homeless rotation and the one after it become the owner's chain.
- **Expected:** a rule that an operator's rotation, a closing one included, keeps every receipt line it signed, or a duty to re-sign them. The texts don't say whether a home may re-sign receipts, nor who serves a closed home's receipts to new readers.
- **Rule or vector:** Identity receipt check 5, rules 35 and 50. Freeze step 5.7c ("a used chain key found after a closure rewrites nothing") passes only because its test's closing rotation keeps the receipts (`core/tests/chain.rs`, around line 1446).
- **Blocks:** not building; it does block 5.7c as written. Confirmed by probe.

### C5. A rival rotation that drops auditing beats an audited owner until the cosignature

- **Tried:** freeze step 5.7d's attack (a thief with the owner's chain key and the home's stolen signing key, audit required), except the thief's rotation declares no auditors.
- **Texts and code:** a rotation's receipts are judged under the audit requirement the rotation itself declares (receipt check 4). Run: before the owner's receipt is cosigned, the thief's rotation counts outright; without audit the same attack reaches only "contested". After the cosignature the position is contested, and the owner's rotation, which counted, stops counting.
- **Expected:** what 5.7d claims, "the audit settles which receipt is real": the cosigned receipt wins, or at least the owner is not beaten. "Conflicting receipts", step 2 ("only one under a cosigned summary") does not say under which requirement.
- **Rule or vector:** Identity receipt check 4; "Conflicting receipts", step 2; freeze step 5.7d.
- **Blocks:** not building; it blocks 5.7d's claim. There is a tension with the rule that lets an owner drop auditors who have gone, so this needs a decision, not a patch. Confirmed by probe.

### C6. Anyone can make a vow's whole list of sales unknown, at no cost

- **Tried:** two claims naming a vow's price tag, each naming a rail Module nobody has adopted.
- **Texts and code:** an unadopted Module answers unknown (payment cMIP, step 1). "An answer that depends on two or more such records is unknown … with two or more, the list is unknown" (Money rule 8). The verifier registers every receipt or claim without a rail answer (`core/src/agreements/view.rs`, around lines 8773 to 8785), and the vow's reading returns "rail unanswered" (`view/vows.rs`). Rule 4's "counts for nothing" cannot fire first, because where the money was paid sits inside the cMIP's proof.
- **Expected:** a claim no rail can ever answer, or naming a Module the payee never listed, set aside before it counts toward rule 8's limit.
- **Rule or vector:** Money rules 4 and 8; the same holds for "the payments a collective owes back", and rule 8's twin on pairs ("Where the rail's answer is not held").
- **Blocks:** no. The code path is confirmed; the attack is inferred, not run.

### C7. A delivered key is not tied to what was bought

- **Tried:** a ten-track publication (field 0 a list) whose seller delivers one track's key; an undelivered bare bake; an anonymous buyer.
- **Texts:** "the content key" (singular) "completes every purchase it reaches" (Agreements rule 11), so one key arguably completes the album. Money rule 18 sends a bare bake's non-delivery to Agreements rule 11, which covers publications only: what is owed is not said. A delivery to a bare key carries no `to`, so "sealed to the payer" is not provable. A key that never arrives cannot be proven; the refund is unknown.
- **Expected:** delivery judged against everything the publication sells; a bare bake's refund defined.
- **Rule or vector:** Agreements rule 11; Money rule 18; Envelopes type 1 and rule 11. Freeze step 5.2 has the receipt with no payer named, a gift under rule 11, and then pays that buyer a refund as a fresh identity, against the payment cMIP's step 5: 5.2 cannot pass as written.
- **Blocks:** no, except 5.2. Inferred from the texts. Fair exchange itself is above the core and we do not count its absence as a flaw.

### C8. The refund rail's limit is per payment, so a thief splits the refund

- **Tried:** a thief holding the payer's signing key signs a claim naming his own refund rail; the refunder pays the refund in many payments, each below the payer's vault limit.
- **Texts and code:** rule 17 counts a refund "only up to the payer's vault limit … as rule 3 reads it", and rule 3 reads one payment. The code checks each payment alone and adds them up (`view.rs`, around lines 8369 and 10066; `money.rs`, around lines 894 and 950).
- **Expected:** a cap on the total refunded to a refund rail, as the rule's own reason implies ("a thief … could sign a claim naming their own refund rail").
- **Rule or vector:** Money rules 3 and 17.
- **Blocks:** no. Code path confirmed; attack inferred.

### C9. On push rails, a silent receiver holds the money, and a stranger can claim the refund

- **Tried:** a split service that never signs its receipt; a third party claiming a public push payment.
- **Texts:** "Until the split service has signed its receipt, the payment is pending", with no deadline: neither a sale nor owed back. "On a push rail, a claim makes its signer the payer", with no tie-break between two claimants in rule 17.
- **Expected:** a default verdict when the receipt never comes; one payer per payment.
- **Rule or vector:** Agreements rule 12; Money rules 4 and 17; freeze step 4i (reasoned only).
- **Blocks:** no; no push Module exists yet. Inferred.

### C10. Nothing makes a rail bind the amount, and the greater amount then counts forever

- **Tried:** a rail Module that binds nothing; the payer claims ten times the amount paid; the receiver signs a matching receipt.
- **Texts and code:** Development field 13 asks a rail to declare its binding of payee, purpose and previous hop, never amount. Money rule 11: the greater amount counts "until the receiver signs a receipt matching the proof"; the code's count takes the larger of receipt and claim whatever follows (`view.rs`, around line 8195).
- **Expected:** amount always bound, or a matching receipt ending the disagreement as the rule says.
- **Rule or vector:** Development field 13; Money rule 11. The two founding rails bind the amount and are safe.
- **Blocks:** no. Code path confirmed.

### C11. Field 10, the layers an extension declares, binds nothing

- **Tried:** an extension that acts on Money while declaring only Development.
- **Texts and code:** Development rule 20 admits field 10 "is not mechanically checkable", and says an under-declaring extension "binds nothing beyond" its declared layers; no verifier rule implements that sentence. An extension's own acts count under the Development rule alone (`core/src/agreements/formats.rs`, around line 1379); field 10 only decides whose approval adopting it needs (`tiers.rs`, around line 287), and out-of-range values are dropped silently. In the reference binding, field 10 comes from the calling app, not from the specification's bytes (`wasm/src/lib.rs`, around lines 1772 and 1861), unlike rail Modules' fields.
- **Expected:** field 10 read from the content, and "binds nothing beyond" either a verdict or removed.
- **Rule or vector:** Development rule 20, field 10, Part three. No vector for the specification format.
- **Blocks:** no. Confirmed in code. A collective's Money signers can be bypassed when such an extension is adopted.

### C12. Smaller ones

- **A one-millionth share sold to a deal makes a collective's Money acts public for good.** "Where a holder is a deal, the act is public" (Agreements rule 57), and a holder's sale of its own share is a way-out act no model can block (rule 98). A rival can buy that sliver. Blocks no one; inferred.
- **Grants under a power counted by share survive a change of control model.** Only "a grant naming an area" ends (rule 74); a grant whose reach came from the old model's by-share power keeps spending under a power the new model withdrew. Inferred.
- **A contest never closes.** "A contest prevails over a confirmation" and has no time limit; the seller has no answering act (rule 13). A dispute cMIP can bound it; we note only that the core gives the seller no act at all.
- **Batches are in the core, nowhere else.** Money rule 12 allows a named batch; "amounts together do not exceed what the payment shows" is checked nowhere in the code, and the payment cMIP leaves batches "not yet defined". Freeze step 7.4 asserts a batch works: it cannot pass as written.
- **A pointer that leads nowhere.** `spec/README.md` cites `docs/reviews/fable-last-read.md` for Agreements draft 23; the file is not at `af2ed6f8`.

---

## The question we brought: two valid acts that cannot both be true

The texts answer it, and the answer is a finding in itself.

**The rules are clear.** Each home keeps the first rotation it holds (Identity rule 30); the home rule decides, at most one rotation counts (rule 40); two receipts from one home at one position are a conflict, and the identity is contested there, never frozen (rule 44, "Conflicting receipts"). Two everyday acts naming one predecessor are a fork (Envelopes rule 15). A stake sold twice goes to the earlier transfer, ordered by the seller's chain signatures (Agreements rule 10). A grant revoked and spent at once: the revocation wins, ordered by what it cites on the grantor's chain (Agreements, "Made before, made after", point 7; vectors "an act the revocation misses").

**But the same answer holds only for verifiers holding the same acts.** The verifier counts only the receipts it holds (`tally`, `core/src/chain.rs`, around lines 1619 to 1669). A home that signs receipts for both the owner's and the thief's rotation, and shows each client one, gives each client a different verdict; only a client holding both sees "contested". Run: a reader never shown the owner's rotation judges the thief's act, signed with the stolen key, valid, and the chain's stop reason is "the end of what is held", the same as an identity that never rotated. Rules 19 and 20 ("MUST serve the full chain") leave no evidence when broken; rule 23 asks a client to consult the homes only as a SHOULD; the log's summary proves a receipt is in it, never that no later one exists.

**What we conclude:** the core decides alike on the same evidence, and does not promise the same evidence. That is a legitimate design: freshness and completeness are above the core, a market for homes, auditors and monitors. It should be said in the texts, in one place, as a stated cost, because today a reader of "every verifier decides alike" will assume more than it gives. Blocks no one.

---

## Stated costs we do not count as flaws

- **A lost chain key is permanent.** The identity keeps working on its signing key, but can never rotate, change homes, escape or name a successor; if that signing key is later stolen, nothing evicts the thief (Identity, "Losing the chain key is permanent"). Said plainly; the remedy is a backup above the core.
- **A chain signature quietly takes the next chain key.** A thief holding the chain key can sign one (type 16) instead of a rotation: nothing visible changes, and the thief now holds the next chain key (section 7). The owner can still escape, once they notice. Monitoring is above the core.
- **A succession takes effect when the successor confirms.** Confirmation "needs nothing from the owner" and can come "at any time" (section 8; rule 39). A dormant mode exists only in Agreements' absence clause.
