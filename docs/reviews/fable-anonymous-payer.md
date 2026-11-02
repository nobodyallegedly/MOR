# The anonymous payer, end to end: what still earns its place

*Fable, 1 November 2026. Input: Money and Agreements on pull request 116's branch (the receipt's payer field, the payment claim and its anonymous form, rules 11, 12, 17, 19, 22 and 24; Agreements rule 13 and "A contest of a purchase"); `docs/s7k-report.md`, question 1; F30, F80, F113, F168 and F416. Read, not run; a recommendation, nothing decided.*

## In plain words

Yes, it can be simpler, and the simplest shape is the one the decision already points at. Once standing belongs to identities, the bare key does one job: it lets a payer who named no identity collect a refund. But a fresh identity does that job too, with acts the texts already have and none of the signed-array machinery: the payer's wallet makes a throwaway identity hosted by itself (Identity rule 4), names it as the payer, and if money is owed back, says in its claim where to send it (claim key 7, which every claim already carries). Two acts instead of one, no second signature scheme inside an act, and the hijack S7k found cannot arise, because the act's own signer is the payer.

Then the payer field has two values, an identity or nothing, and a payment naming no payer is a gift: it counts as paid toward what it names, and no refund is ever owed on it. That removes the one category the texts have never been comfortable with, the refund nobody can claim, which sat as noise on honest sellers (F80's worry) and complicated every closing. Who loses: a payer with no MOR identity at all, paying from an ordinary wallet, who today is owed an unclaimable refund and tomorrow is owed nothing. In practice that is the same money; in the texts it is one rule fewer.

## 1. The machinery, piece by piece

**The payer field left empty.** Keep, with a new meaning. Today "absent" means "anonymous and committed no key", and such a payment can still be a purchase whose refund, if owed, nobody can claim (rule 19). Simplified: *a payment naming no payer is a gift: it counts toward what it names (a tag's price, a tip, a debt), and no refund is owed on it; whoever pays so has chosen it.* Cost: the ordinary-wallet payer who pays a tag and gets nothing has no recourse in MOR, which is already true (an unclaimable refund is not a refund); the seller's side loses a permanent open obligation it could never discharge. A tip is unchanged. A route whose first payer named nobody has no buyer, as now.

**The bare key in the payer field, and the anonymous claim's signed array (key 8).** Cut. It was built (F113) because "whoever presents the proof" leaked on Lightning, so the payer committed a key of its own; and it needed a second signature inside the act because the act's signer was not the payer. With standing gone to identities, the key's only job is the refund, and a fresh identity does it: the wallet makes a genesis naming itself as home (rule 4, no third party), commits that identity in the payment (the payment cMIP's field that took the bare key takes an identity hash; the same recomputation before paying stops the payee's side swapping it), and the claim is signed by that identity, so key 7 is the payer's word with no array to carry it. Cost: one genesis per fresh identity, shipped with the claim to the seller so the signature can be checked; a wallet does it in milliseconds. What a fresh identity gives that a bare key never could: standing, if the payer ever wants it. *This is the door that closes:* a frozen claim format never gets key 8 back, and a frozen payer field never gets the bare key back. Nothing in MOR 1 needs them once identities are cheap, and MOR 2 can reopen it if a reason appears.

**A refund to a bare key (rule 19).** Cut with the key. What replaces it is one clause in rule 17: *a refund owed to an identity is paid to its payee pointer, or, where the payer's claim of the payment names a refund rail (key 7), there; a fresh identity with no pointer names one so.* Rule 19's one durable sentence, that presenting the rail proof proves nothing about who paid, moves to rule 11's commentary, since it is why the payer is named in the commitment at all.

**"Nobody can claim it" for a payment that committed no key.** Cut, by the gift rule. Agreements rule 93 (a broken collective's closing) and S7j's Q2 (a closing may leave open a refund owed to nobody) lose their special case: there is no refund owed to nobody.

**Standing** (a contest, a vow's confirmation, a route's first payer): identities only, as decided. The texts rewritten under F416's first decision revert to one sentence each; the fresh identity is the way to stand while staying unknown, and the stated cost says so.

## 2. The simplest core that keeps the four guarantees

*A payer with no MOR identity can pay:* yes, as a gift, to any tag, pointer or tip. *A refund owed can reach whoever paid:* yes, for every payer who named an identity, by pointer or by the claim's refund rail. *Nobody but the payer can take it:* yes, because the refund's destination is in an act the payer signed with the identity the payment committed to; no proof, preimage or copied claim stands for the payer. *Standing only for identities:* yes, by construction.

What this shape loses against today's: the ordinary-wallet payer's unclaimable refund (a right with no way to exercise it), and the option of a refund without any identity at all. Against the alternative "a refund always to the pointer an identity names": that one loses the fresh identity with no pointer, which is why key 7 stays. I would not go further and make every payment name a payer: tips from ordinary wallets are the carrier's neutral case, and a rule refusing them would refuse money.

## 3. Before the freeze, and after

**Before the freeze**, because each is a format or a signed message and so a one-way door either way: the payer field's grammar (`identity / absent`, the bare key removed); the claim's key 8 removed, with its tagged-hash message `MOR/finance/anonymous-claim`; the payment cMIP's commitment taking an identity where it took a key; rule 19 cut and rule 17 gaining its clause; the gift sentence in rule 11 or 12; Agreements rule 12's "owed back to the payer" reading "to the payer named, or nothing where none is". The suite's scenario 2 step 6 (an anonymous refund claimed by the committed key; a routing node cannot claim it) becomes: a refund claimed by the fresh identity the payment committed to; a routing node holding the preimage cannot. The one vector that moves is that one.

**Left as it is:** nothing of this needs MOR 2, and nothing here keeps MOR 2 from adding an anonymous form if a reason appears; it would be a new claim key in a new MIR, as any addition is.

## The sentences

- Money, receipt format, field 2: *payer: an identity; absent where the payer named none, a gift.*
- Money, rule 11 or 12, one sentence: *A payment that names no payer, in its receipt and by no claim, is a gift: it counts toward what it names as paid, and no refund is owed on it. A payer who may want money back, or standing, names an identity, a fresh one hosted by itself where they wish to stay unknown (Identity rule 4).*
- Money, rule 17, one clause: *or, where the payer's claim of the payment names a refund rail (key 7), there.*
- Money, rule 19: struck; its commentary on the rail proof moves to rule 11.
- Agreements, rule 13 and "A contest of a purchase": *the buyer is the identity the payment's commitment names, or the signer of the sign-on; a payment naming none has no buyer.*
- The stated cost, once, in Money's reasoning: *anonymity on MOR is a fresh identity, not a missing one.*

## What I read and what I reason

Read: the formats and rules named, on the branch; the five findings; S7k's question 1. Reasoned: that a self-hosted fresh identity costs a wallet no more than a key, which Identity rule 4 allows and nothing forbids; that the payment cMIP's commitment can take an identity where it took a key, which the cMIP's own text must confirm. S7l should build the fresh-identity refund as a vector before anything is struck.
