# The default control cMIP: plan for draft 7

*7 November 2026. Plain Words keeps `cmips/cmip-collective-control` (draft 6 at `af2ed6f8`). This is a plan, not a draft. Draft 7 is written once the Dubsar lead says how a new draft relates to "the default" every client must hold (our PW-1). Not part of the core.*

## What draft 7 will change, and why

1. **Proxy revocations count by their own placement.** *Counterparty's finding, sent to us first as maintainer (6 November).* Today a holder's revocation of a proxy counts only where the collective's line places it, and the line is drawn by the members. So a holder who is no member cannot take back a proxy who sides with the members, and a fee change or an issuance passes on that vote. Draft 7 counts a revocation by its own placement, as a take-up of a proxy already is. *Touches the core's code:* the reference verifier implements this cMIP (`core/src/agreements/view/proxies.rs`, the revocation check, which requires the line's placement). The change is handed to Nobody, allegedly, as a change to the reference code as well as to the text.
2. **An optional "minimum holders" parameter for an area.** *Backlot meeting, 6 November.* While fewer than N holders of an area remain, the area's acts are refused, save payments naming an obligation they follow. Absent, nothing changes for anyone. Two limits, stated in the text: payouts under signed publications are the split services' and continue regardless; and a model reads no other act, so it can check that a payment names an obligation, not that the obligation came before the departure. The core allows this: a control model receives the voices that remain and may refuse an act within its room (Agreements rule 99).
3. **What an area's limits cMIP may read** (area key 6). Draft 6 names a limits cMIP without saying what it receives. Draft 7 states its input: the act, the area's answer (its holders that remain and its number) and the line. A limits cMIP that needs more is not one this model accepts.
4. **Tests of our own.** The crate `cmips/control` holds two tests of its own; the suite's steps run in `core/tests`. Draft 7 ships with tests for each change above, in the crate, before we call it ours to ship.

## What it waits on

- **PW-1.** If the core pins the default by hash at freeze, draft 7 is an ordinary choice beside draft 6, adopted by each collective in field 35. If not, publishing draft 7 changes what every client must hold. We will not publish it until we know which.
- **An attack.** Counterparty attacks draft 7 before it is published, on paper and against the reference code.
- **Dubsar.** We send the draft to the Dubsar lead before publishing it, so the reference suite can adopt it rather than replace it.
