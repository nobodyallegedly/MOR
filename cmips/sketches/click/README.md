# The click, sketched on Agreements draft 10

*The Dubsar Suite, 13 November 2026. A sketch to test the grammar by building on it, as Nobody, allegedly, chose; not a cMIP draft, not a product, nothing final. Written against `docs/agreements-from-scratch/draft-10.md` (branch `claude/agreements-draft-10`, pull request 162). The findings are in `docs/click-sketch-report.md`.*

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

## In plain words

A film is paid with one click. The film's owners are its director, its editor, a song it uses and a sound library it uses. The song's owners are its producer and a band. The band's owners are its three members. The library's owners are two people, and one of them receives for both.

Three split services, each with its own cMIP, carry the money: one for the film, one for the song, one for the band. So a band member is three legs from the click, each leg run by a different cMIP. The question is whether a reader who knows none of those three cMIPs can follow the click to every person, using only what draft 10 gives: each leg's report of what it received, what it passed on, and to whom (rule 11).

Run it: `node --experimental-strip-types cmips/sketches/click/click.ts`. Its output is `run-output.md`.

## The scenario

| Agreement | Owners and shares | Receiver |
|---|---|---|
| the film | director 50%, editor 20%, the song 20%, the sound library 10% | its deal with service A |
| the song | the band 70%, producer 30% | its deal with service B |
| the band | three members, 40%, 30%, 30% | its deal with service C |
| the sound library | two owners, 60%, 40% | the first owner, a person |

Each deal is an agreement between a service and the work as a party (rule 1); each work names its deal as its receiver (rule 1.3). Every payment names the version it read (rule 13.2). Test identities and made-up amounts only; no rail, no money.

## Three split-service cMIPs (sketches, task K8)

Each is the smallest thing that differs from the others in a way the climb has to survive.

1. **Straight split** (service A, the film). Accepts: one payment to the work's deal. Produces: the payment less a flat fee, divided by the work's shares, rounded down to whole units, the remainder to the largest share; paid out at once; one leg report per payment.
2. **Pooled split** (service B, the song). Accepts: payments to the work's deal, gathered for a period. Produces: at the period's end, the total less a fee of 2%, divided by the shares as above; one leg report for the whole batch, naming every payment it covers (draft 10's P6, pools, in its simplest form).
3. **Minimum-payout split** (service C, the band). Accepts: payments to the work's deal. Produces: the total divided by the shares; any part under a minimum (50 units) is held, owed, and added to the next batch; one leg report per batch naming only what was paid out.

What all three must produce for the climb to be read: a leg report (rule 11.2) whose `passed_on` entries say, for each payout, to whom, how much, and **the settlement of that payout**. The last is this sketch's assumption on P20: without it, the next leg cannot find the report its money came from, and rule 11.4 cannot be followed (finding 3a).

## The reader

`read()` in `click.ts` follows rule 11.4 from one click's settlement: from the first leg report naming it, through each `passed_on` entry that names an agreement, to the leg report whose `received` names the report before. It knows none of the three cMIPs. It reads two ways, to show finding 1: rule 11.4 **read literally** (the next report must be made within the agreement the entry names), and **following the receiver now** between legs (rule 1.4).

## What the sketch assumes, because draft 10 leaves it open

- one version per agreement, no forks, no place, no clock;
- one rail, amounts in whole units;
- shares written in each work's body, read by the services' cMIPs (K1, K4);
- the shared shape's "what" is an amount and the payout's settlement (P20);
- the band's service, in one variant, states the amount it received (a field draft 10 does not have), to test what rule 11.4 asks about reports that do not agree.

## Run again on draft 12

`click-12.ts` runs the same scenario on draft 12 (pull request 165) and the report block, proposal 1: each leg's Terms carry a call (from the doer and the receivers, and where); the doer reports what it received, passed on, kept and still owes; each person paid confirms; the two halves are tied by the settlement both name; reports go only where the call says, so each seat reads only the legs it signed (one leg, rule 11.6). Twelve runs, read from the seats of the payer, a film owner, a band member, the producer and a partner, in `run-output-12.md`. The findings are in `docs/click-sketch-12-report.md`.

Run it: `node --experimental-strip-types cmips/sketches/click/click-12.ts`.

## Run again on draft 14

`click-14.ts` runs it on draft 14 (pull request 167) and the report block, proposal 2: each report is addressed to the other side of its own leg and no one else; the buyer's own leg (the receiver confirms to the buyer, then access); a band that signs its deal through a delegate; a partner's data path, sketched only as far as whose signatures it needs; a contest on an undelivered purchase. Where draft 14 leaves "the other side" open (its item 9), both readings are run. Twelve runs in `run-output-14.md`; findings in `docs/click-sketch-14-report.md`.
