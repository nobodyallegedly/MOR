To the research window, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. One question, asked to run during the break; useful whatever the simulation shows. Reading and research only: no texts, code or vectors change. No deadline before the simulation ends.

**His words, quoted from the ledger** (`docs/decisions.md`, branch `claude/lead-records-2`):
- "Now the question is… was money overdefined?" Then: "Makes sense, money truly is two things « pay this pls » « this has been paid » it carries no money it simply accounts it and links it"
- "I think the task will be to verify that money has all the sockets needed to let agreements build Finance"
- "ID and text are universal, development is definition, the rest is to build on top of." And: "Yes, agreement is now closer to language than protocol. It.s all about what is built on top."
- The measure since the start of the stint: "can I with a single click reward all the people that contributed to the service or good via MOR"
- On his first project: "Yes, each voucher becomes currency, only those who need redeeming them redeem. Voucher then disappears." "The voucher is spent. The promise of something was fulfilled"
- Then, setting the question: "The question is: what does finance do with money? And when it does it how does it interact with money itself?"

**In my wording (the MOR lead's):** finance is a use, built on top, never a layer. Money, in his words, is two statements. The question is where finance, whatever it does, actually touches those two, and whether it ever needs to touch money in any other way.

## The question

**What does finance do with money? And when it does, how does it interact with money itself?**

Work it two ways, and keep them apart.

**1. From first principles, without reading MOR's Money.** Take these: a loan and its repayment; an instalment plan; a subscription; a split among several receivers (the shower's click); a payment passed on down a chain of receivers; an escrow; a refund; a deposit; a wage; a dividend; a membership fee; an invoice paid in parts; a bond or a stake posted in advance; a voucher issued, passed on and redeemed; mutual credit between members; an insurance pool; a donation.

For each:
- **What it does with money**, in plain words: asks for it, holds it, promises it, delays it, splits it, pools it, passes it on, returns it, converts it, counts it.
- **The moments it touches money itself**: each point where a payment is asked for, made, or recorded as made. Name each moment, who acts, and what is said.
- **What it does without touching money at all**: what is only a promise, a rule or an account between people, and so belongs to an agreement.

Then: across all of them, the smallest set of ways finance touches money. Is it two ("pay this, please" and "this has been paid"), or more? Is anything finance does with money left that neither statement, nor an agreement, can say?

**2. From prior art.** How existing systems split the request from the record, and what else they found they had to carry. At least: double-entry bookkeeping (Pacioli) and what it records that a payment record does not; the REA accounting model (McCarthy: resources, events, agents); ISO 20022's split between payment initiation, clearing and account reporting (the pain, pacs and camt messages); invoices and receipts in law and practice; Lightning's invoices (BOLT 11 and BOLT 12) and their proof of payment; open-banking payment initiation; mutual-credit systems (WIR, Sardex) and how they record a debt that is also money. For each: its smallest units, what it left to agreements or to people, where it was overbuilt, and where it was missing something it later had to add.

**Then, and only then, a comparison** with MOR's Money draft 9 (`spec/MIR-money-draft-9.md` on main): which of its parts map to the smallest set, which to agreements, and which to neither. One line each. Name every part of the smallest set that Money draft 9 does not carry, and every part of Money that nothing in the smallest set asks for.

Decide nothing, and propose no wording. Mark counted, traced or inferred. Say where sources disagree. Write `docs/research/what-finance-needs-prior-art.md` (branch `claude/research-what-finance-needs`, a pull request, no merge). Plain words first. Cite sources; where you could read only an abstract, say so. Open with your sentence on models and people. Never write the author's personal name; write "Nobody, allegedly". No server addresses, onion addresses or keys. Report back to me short: the smallest set, what Money has beyond it, what Money lacks, and your questions, one at a time.
