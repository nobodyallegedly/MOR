# Draft 26: the ground for P8, after the sixth attack

*The MOR lead (Machine, allegedly), 28 November 2026, 09:05. What P8 is written on: his entries of this morning, quoted in the ledger `docs/decisions.md` on main, and the lead's readings of the sixth attack's questions (pull request 340), every reading the lead's and marked so. Nothing here is his but what the ledger quotes.*

## His entries of 28 November, read whole in the ledger

1. "The keeper's ordered record is a service, not the core" (08:34), with "the keeper line states a “where”" (08:36).
2. "A buyer named as a signer is a partner" (08:38).
3. "Ending the old agreement is an act on its chain" (08:40), with "The pointing to it is what closes it" (08:46).
4. "A mistake is fixed by a new chain; the chain is for lineage and knots" (08:51).
5. "Nothing is updated: new acts" (08:53).
6. "The ending condition" (08:56).
7. "No dissolving with open obligations to unknown parties" (08:57), with "The known parties are protected by their signatures, or the signature scheme they agreed to." (08:58).

## What they change in draft 26, the lead's reading of them

- **The keeper** is the agreement's official relay: the stated where its acts are provided from. An act counts for the agreement where it is there ("act exists @"). In the core it keeps no ordered list and gives no positions: **Keeper's record**, **Placed**, "vouches for their order only", the pin and lateness answered **per keeper**, and 5.13.3's keeper's record as a way of being "shown after" go. Order is the acts' own chain, by knots; where it shows none, a fork. A keeper that keeps a signed, ordered record is a service, named by a cMIP; draft 26 may say that such a service plugs into the keepers' socket, and nothing more.
- **Several keepers:** K9 says at how many of the keepers named an act must be there; empty, at every one ("Keepers: cross verification by default, a socket to lift it", 28 November, 00:00, which stands).
- **A dead keeper:** the version stays valid, closed to new acts on that chain. A new agreement that points to the old one's version closes the old one at that version for those who sign it; without the pointer, a new chain is born, and the old tip may come back when its keeper returns.
- **No updates.** A version is a new Terms act that names, in `replaces`, the version it follows; a new agreement is a new first act that MAY name an old one. "Update", "updated", "update condition" leave the text, its glossary, encoding 3 and the companion; the rules stay.
- **The ending condition** replaces the update condition: what ends a version as the act states it, followed by a new version or by none (dissolved); by signatures, or any condition the bytes can check, a clock anchoring among them. While any unknown party's filling is open, the agreement is not dissolved; where a verifier cannot tell, the dissolution is not shown, never a yes (the lead's).
- **Two classes, two protections,** beside **Two classes** in §3.2: the unknown party by the principle; the known parties by their signatures or the scheme they agreed to.
- **§0** promises the protection to those who take part through a spot.

## The sixth attack's questions, the lead's readings

| # | The lead's reading |
|---|---|
| 1 | Moot as asked. The verifier asks the keeper: the act is there, it counts; not there, it does not; the keeper cannot be reached, **unchecked**. |
| 2, 8, 12 | Moot in the core: there is no keeper's record; they are a keeper service's. |
| 3 | His (08:36): no fork; an act not at the stated where does not count. |
| 4, 16 | A known party who fills a spot stays a known party and a default signer; "never a signer who fills a role" means filling a role makes nobody known. |
| 5 | Barred: a power is given only by Terms in force, so a power in version 1 cannot act on version 1 before it is; 5.4.5 says so. |
| 6 | Not there, so it does not count ("act exists @"). |
| 7 | As the codemeister's answer 1 of 08:40. |
| 9 | The keeper gives no order in the core; the clock gives time only; order is by knots. |
| 10 | The Terms act and the Statements whose `terms` names it, only. |
| 11 | The keeper's record is gone from the core; a keeper's identifier, the relay the Terms name, is Identity's and Envelopes' (encoding 3, E6). |
| 13 | K9 answers at how many keepers an act must be there: a count or a set, never an order. |
| 14 | His (08:38): a partner. |
| 15 | His (08:40, 08:46): the pointer closes it. |
| 17 | §1: unknown parties do not go on; they stay bound by their version. The sentence says so. |
| 18 | Yes: §0 names several keepers and their socket. |
| 19 | "and none will" goes: a forecast is no rule. |
| 20 | `relies_on`, by its tip (the codemeister's item 14), to check. |
| 21 | Key 20, a stand-in until the MICS gives the header's form. |
| 22 | No: the keeper provides the agreement's acts; the words are a Text act fetched where Text acts are, named by id in the Terms, so a swap is caught. |
| 23 | Yes, P8 writes the lead's three of 00:20 where they still stand on this ground. |

Added at 09:05, his 09:02 ("Rely when a relay dies: a proof, not one for the bytes"): where the bytes cannot confirm that an act was at the stated where, the answer stays **unchecked**, and every signed act that bears on it is shown beside it as evidence.

Open, for him, not asked: whether draft 26's "valid" widens to his "safe to run" (08:49); the text keeps its word until he says.

## Which naming closes, 09:08

*The scribe's question before P8; the lead's answer, to check.*

The scribe's lean, with one change. Only the first Terms act of a new agreement, naming an old version in that field, closes the old agreement at that version, for each known party of the old one who signs it, and for no one else. Nothing else that names a version, in any field, closes anything. Lineage and closing are one act (his 22:36 and 08:46, read together).

The change: since that naming has an effect no other naming has, it is carried in a field of its own, which says no more and no less than his 09:09: the act it names "is not valid anymore", and "it once existed" (ledger, "The closing pointer: no longer valid, and it once existed"); not "follows on from", and not `relies_on`, whose naming says the act is still valid and relied on, so that a contest or a Statement naming a version can never close it by accident. This revises the lead's reading 20 and the codemeister's item 14 (`relies_on`, by its tip): the field's name and key are the codemeister's to choose, to check.
