# The market

*Rehearsing the freeze, November 2026. On the branch `claude/market` only; never merged into main.*

Nine players build on MOR's core as if it were frozen, each in its own interest, and bring back what they find. This folder holds their work, one folder each. The players read the repository at the rehearsal commit `af2ed6f8` and do not push here themselves: each hands its drafts to Nobody, allegedly, and the Dubsar Suite lead commits them into the player's folder, so that every draft is on the record, dated, under its author.

| Folder | Player | What it is |
| --- | --- | --- |
| `ampersand/` | Ampersand | A DAO of independent publishers |
| `backlot/` | Backlot | A DAO of media publishers |
| `keep/` | Keep | Identity and protocol safety |
| `pointer/` | Pointer | Web media, for audiences and publishers |
| `hop/` | Hop | Payments |
| `plain-words/` | Plain Words | Agreements (keeps the default control cMIP) |
| `longhouse/` | Longhouse | Relays and homes |
| `counterparty/` | Counterparty | White hats, attacking every player's work |
| `the-back-row/` | The Back Row | Consumers' rights |

Dubsar, MOR's own demonstration suite, is not a player here: it may publish a less selfish version of any cMIP beside the original, in the repository's own `cmips/`.

## In each folder

- `cmip-<name>-draft-<n>.md` and `module-<name>-draft-<n>.md`: specifications, named as the repository names its own. Nothing is updated: a change is a new draft.
- `code/`: any code, if the player writes some.
- `findings.md`: what the player found about the core, newest first, in the access note's form: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks.
- Anything else the player publishes: its position papers, terms, price lists.

Test identities only; regtest or signet only. No keys, signing words, server addresses or onion addresses, and never the author's personal name: "Nobody, allegedly".
