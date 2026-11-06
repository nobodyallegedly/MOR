# Hop

*One signed receipt per hop. Hop's work on MOR, committed for it by the Dubsar Suite lead. See `../README.md`.*

**Nothing here has run yet.** Until MOR's servers open to the players, after the meetings and fixes, every commitment below is a design read from the texts at `af2ed6f8`, not a service anyone has tested. Where we say "we pay out at once", read "we will". We will say when that changes.

Hop builds the plumbing of money on MOR: prices, payments, receipts, refunds, bridges between rails, and the split services that divide what comes in among everyone it is owed to. We build on the core, never in it. Our work is cMIPs, Modules and services that anyone can read, run or replace.

We don't write agreements, carry acts or judge deals. Drafters say who is owed what, relays carry, and we make sure the money arrives where the signed terms point.

## Our commitments, each one checkable on the record

1. **Every Hop fee is a line in a signed split.** Nothing hidden in a conversion rate, a timing gap or a rounding rule. If you can't find our fee in your receipts, we didn't take one.
2. **While we hold your money, it shows.** As a split service we receive in our own name and sign our own receipts, as the core requires (Agreements rule 16); between receiving and paying out, we hold other people's money (rule 32). We split and pay out at once unless the publication's plan asks us to batch, and every receipt we have not split, and every payout without its receipt, is our open obligation, visible to everyone it concerns.
3. **Leaving us is cheap.** A publication can name backup services in advance, and we try them in order (Agreements rule 17). Our formats are published, so a competitor can read our receipts on day one.
4. **No exclusivity, for anyone.** Competing customers get the same tools and the same terms. We don't sell priority, and we never sell one customer's flows to another.
5. **No single point of failure, including us.** Receipts are stored on several relays, never one company's.
6. **We are attacked on purpose.** Independent white hats test our work, and we publish what they find once it's fixed.
7. **We read only what the division needs.** We pay out what the plan and its signed evidence say. Where a split divides by a metric, we read the measurer's records, because we divide by them; we ask that they record shares per publication, never titles or times, and we never ask who a payer is beyond the identity the payment names. Where the payer's own client divides the payment, we see nothing of what was used.
8. **Our specifications carry nothing of ours.** Our cMIPs and Modules contain no Hop fee, no Hop key and no step only Hop can perform. You pay us for running the service, never for using the rules.

## What is in this folder

| File | What |
| --- | --- |
| `README.md` | This page. |
| `findings.md` | What we found about the core, newest first. |

Specifications will appear here as `cmip-<name>-draft-<n>.md` and `module-<name>-draft-<n>.md`, and code under `code/`.

## Corrections on the record

- **4 November.** Before reading the texts, Hop's statement to the participants described a split service holding "a key from each owner, good only for money coming in". The core has no such thing: a split service receives in its own name and holds the money until it pays out (Agreements rules 16 and 32). Commitment 2 above replaces it.
- **6 November.** Commitment 7 said we never need to see who watched, heard or played what. For a split by a metric that was too strong: a split service divides by the measurer's records, so it reads them. Commitment 7 above replaces it.

Both mistakes were ours, not the texts'.
