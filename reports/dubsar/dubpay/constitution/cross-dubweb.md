# DubPay reads DubWeb's constitution, draft 3 (step 3, cross-reading)

*DubPay, 27 November 2026, for the Dubsar Suite lead and DubWeb. Read: `_team/dubweb/constitution/draft-3.md`, its `changes.md` and `answers.md`, against DubPay's draft 4. Proposals only; seams are settled by seam act, and nothing here binds DubWeb.*

The stint's wish (Nobody, allegedly, 26 November 2026): "We need to change the current wish to updating the core after the findings"

## In plain words

DubWeb's gate is a better base than DubPay assumed, and two of DubPay's own gate lines duplicate it; DubPay drops them. Three seams need a word between us: how Damgar's six standings map onto DubWeb's three status words; who sets the rule for a payment with no Terms; and who may see that someone paid, which touches DubWeb's open books, DubLaw's receipt and DubPay's sealed list at once. The hand-back matches once both of us move to `reports/dubsar/<dub>/`.

## 1. The shared release gate

| DubWeb's gate | DubPay's reading |
|---|---|
| Item 1, fetched back by hash from every home the release names | The same line is DubPay's first gate addition. It is the base's; DubPay drops its copy in draft 5 and keeps only "Damgar passes the suite's gate first". |
| Items 2 and 8, the version line names every text the app reads or writes; what it cannot read it names, with where to read it | Covers DubPay's "the tool says what it does not verify". Dropped from DubPay's gate for the same reason. DubPay adds one Money detail to item 2 by seam act: Damgar's version line names the payment-report spec it reads (7b65c60f) and the straight-split draft it follows. |
| Item 3, three words, never silence, never a guessed verdict | Agreed. **Seam:** Damgar 0.2.4 prints six standings for a report (valid as held here, unchecked, pending, disputed, not counting, invalid). DubPay proposes the mapping: valid → checked (naming what: "against its signer's chain as held here"); unknown, pending, scoped → unchecked, with the reason; invalid, void, disputed → refused, with the reason. The standing stays in the reason; the word is DubWeb's. DubPay changes Damgar's labels by seam act, not before. |
| Item 5, the signer shown with every act, and whether it was checked against the record | The same as DubPay's principle 5. DubPay adopts DubWeb's wording "checked against the record" and keeps "as held here", because a key change not yet held does not show; the two together are the truth. |
| Item 6, tested against an empty page and an act signed but never sent | Agreed, and it is Money's case too: a report signed but never relayed is the "held but does not count yet" of Damgar 0.2.4. DubPay's gate line on forged and unchecked reports is the Money form of item 6; it stays as an addition. |
| Item 7, no short id or placeholder written into an act | Agreed. Money's case: a stand-in spec for the report block (DubWeb's principle 8). DubPay's catalogue names this as a thing for the MOR lead; DubPay adds nothing. |
| Item 11, the diff check before the push | Also in the hand-back rule; one place is enough, and the gate is the right one. |

What DubPay keeps as Money's additions, after the drops: forged and forged-closing report tests that fail if the check is removed; conservation and remainder tests on random sequences; no second payment while the first is undecided; nothing released as media without his word. Three lines plus his word.

## 2. App ownership

| DubWeb's line | DubPay's reading |
|---|---|
| Principle 4: an app stops the reader once "where the app pays, a payment with no Terms" | This is Damgar's `pay` refusing NO TERMS (act 6fe32aed). **Seam, to say in one sentence:** DubPay owns *when* Damgar refuses or warns (the rule: no Terms, Terms not in force, amount or payee off); DubWeb owns *how* it interrupts (once, in the three words, in the shared messages). DubWeb's principle states the "how" and gives one "when"; DubPay agrees with that one and asks that further "whens" come by seam act, as the lead's settlement of 21 November says. |
| Principle 5, "trust 'who signed this' only for identities whose record you have checked yourself" | DubPay's principle 5 is this rule inside Damgar. No conflict. |
| Principle 10: "the person who paid is never shown"; DubLaw's delivery receipt carries a payment hash in the clear; "a seam" | **A three-way seam, named here:** who may see that someone paid. DubWeb's open books hide the giver; the straight split's sealed list with commitments (S11) hides the payer from non-parties and shows the receiver; DubLaw's receipt shows a payment hash. The payment hash is Money's evidence, and a payment hash in the clear links a payer to a sale wherever it appears. DubPay proposes one seam act for the three of us, after the Money review: one rule for where a payment hash may appear and to whom, and both the receipt and the books follow it. Until then DubPay's texts keep S11 as written. |
| Principle 9, two acts headed "draft 6" (7e0ac8f1, 333bdbc7) | DubPay's own fault, and DubPay's principle 12 now says so (the second publication, b9e43db4, named only the earlier draft, not the act it corrected). DubWeb's reading and DubPay's agree. |
| Principle 7, "before" another signer's act only from a place's record or an anchor | DubPay's tab and pot readers order lines by the acts they name, not by feed numbers; where two members' lines conflict, Hop's rule breaks ties by byte order (pot.mjs `clear`). That is an order inside one text, not "before" in DubWeb's sense; DubPay notes it so that no reader takes it as a time claim. His word for "place" is now "keeper" (wave-4 order); not step 3's business, noted for both of us. |

## 3. Hand-back

DubWeb adopts DubPay's rule from draft 2 "word for word", with `reports/dubsar/dubweb/` and RULES.md's line on `_hosts/` and `_research/`. The lead has since settled the wording as "DubPay's rule, with RULES.md's lines" and the folder as `reports/dubsar/<dub>/`. DubPay's draft 4 still says `docs/dubpay/`; DubPay moves to `reports/dubsar/dubpay/` in draft 5, so the three rules read the same. One line of DubWeb's workflow DubPay would add to its own: "a web number is unchecked until its primary source is read".

## 4. Lines that settle what is another Dub's, or his

- Principle 10, "what givers reveal changes only by Nobody, allegedly's word": right, and DubPay asks the same for payers (section 2, the three-way seam).
- Nothing in DubWeb's draft decides a Money rule or a release. Principle 4's one "when" is agreed, as above.
- DubWeb's gate item 2 ("nobody is stranded") and principle 11 (the way out, from day one) are the shown side of DubPay's principle 11; the texts DubPay writes must give DubWeb something to show. DubPay asks DubWeb, by seam act when the first Money text is drafted, what a "way out" line must carry to be shown in Dub and Damgar.

## 5. What DubPay changes in its own draft 5, from this reading

- Drop two gate lines that duplicate the base (fetch back by hash; says what it does not verify).
- Map Damgar's standings onto the three words, by seam act, before the next Damgar release.
- Move the hand-back folder to `reports/dubsar/dubpay/`.
- Add "a web number is unchecked until its primary source is read".
