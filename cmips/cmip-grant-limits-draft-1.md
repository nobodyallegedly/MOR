# cMIP: A grant's limits

*Draft 1, 17 October 2026, written by the Edubba agents session (`docs/edubba-agents-report.md`) for F345, for Nobody, allegedly, to approve. **F345**, decided by Nobody, allegedly ("Agreed"): "a grant limits cMIP, draft 1, drafted in the agents session as the shared piece Damgar's round 2 lanes reuse (F338's grants: 'Per act cap is fine'): a per-act cap in a named units Module, and an expiry judged against a named clock (the timestamp clock Module's stamp of the act, or a block height by the Bitcoin clock on regtest). Edubba feeds the core its verdict; a verifier not knowing the cMIP still answers unknown." The example it serves: an owner granting an agent authority, "what it may sign, how much it may spend, for how long" (decided by Nobody, allegedly, 17 October 2026, "an example of grant").*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Agreements MIR draft 14 (grant fields 3 and 4; rules 73 to 80; "A grant's dials", F320), the Money MIR draft 8 (amounts), the Bitcoin units Module draft 1, the timestamp clock Module draft 2 and the Bitcoin clock Module draft 3, and the findings to F345. It fills the Agreements task 12, grant limits. Its hash stays a draft hash until its creator is named at step 17; until then grants name a test value, `sha256("Grant limits cMIP, draft 1, test value until publication")`. Its code is in `clients/grants` (`src/limits.ts`), shared by Edubba and, in round 2, Damgar.

*Reading this document: normal text is the specification. Italic text is commentary. Choices F345 did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*A grant lets someone act in your name with a key of their own, within limits. Agreements says what a grant reaches (which kinds of acts) and leaves the limits to a cMIP. This one gives two: how much one act may move, and until when the grant may be used. An act past either is not backed: the grant goes quiet for it, and stays revocable.*

*MOR has no clock. So "until when" names a clock the grantor chooses: a timestamp clock's stamp of the act (an operator's word, enough where little is at stake), or a Bitcoin block height (on regtest for now). Until the act is placed on that clock, whether it came before the expiry is unknown.*

## 1. The limits (grant field 3, field 4 naming this cMIP)

```cddl
limits = {
  ? 0 => cap,                       ; the most one act may move
  ? 1 => expiry                     ; until when the grant backs acts
}
cap    = [ unit: hash, value: uint ]                ; a unit (a specification of a units Module, as Money's amounts name it), an amount in it
expiry = [ clock: hash, ref: any, point: uint ]      ; a clock Module, its reference's second element, a point on it
```

1.1. A limits map with neither key, a key it does not define, or a field of the wrong kind makes the grant's limits unreadable: every act of its key is **unknown** under this cMIP. **(mechanic, this draft's)**

1.2. **Both limits are judged act by act**: an act of the grant key is within the limits only when it is within each limit present.

## 2. The cap per act

2.1. **The amount an act moves** is the amount a Money act names (Money draft 8): an obligation's (type 1), a receipt's (type 2), a claim's (type 3); and a draft's or request's amount where a money messages cMIP act carries one. An act that names no amount (a post, a publication) moves nothing: it is within the cap. **(mechanic, this draft's)**

2.2. *A unit is its own specification (the Bitcoin units Module: four units, one per network), so the unit's hash names the units Module too.* **Within** the cap: the act's amount is in the unit the cap names, and at most its value. **Outside**: an amount in that unit above the value, or an amount in another unit (no conversion is assumed: "never summed across units"). *An act moving several amounts (none does today) is judged by each.*

2.3. *A cap per act, not per period (F338: "Per act cap is fine"): a period's total would need every act of the key, some of them private, so no outsider could check it.*

## 3. The expiry

3.1. **The timestamp clock** (`ref` the clock's identity, `point` seconds since 1970): an act is **within** where a stamp of that clock, valid through its chain, names the act at a time at or before the point; **outside** where the earliest such stamp is after it; **unknown** where the verifier holds no stamp of that clock naming the act. *The timestamp clock Module says what a stamp proves: its operator's word. The grantor chose that clock.*

3.2. **The Bitcoin clock** (`ref` the network, as the Bitcoin clock Module names it; `point` a block height): an act is **within** where its anchor (the anchoring cMIP) places it in a block at or below the height; **outside** above; **unknown** without an anchor the verifier can check against a chain it follows. *Defined here; Edubba's first build judges the timestamp clock only, and says so for a grant naming a height.*

3.3. *The expiry is judged against the clock the grant names only, never the verifier's own clock (Agreements: "past its terms" is judged against the reference named).*

## 4. What a verifier does

4.1. A verifier implementing this cMIP gives Agreements its verdict for each act of the grant key: within, outside, or unknown (3.1). Agreements then backs the act within, does not back it outside ("the grant goes quiet rather than ending", F320), and answers unknown where this cMIP does (rule 80).

4.2. A verifier not implementing it answers unknown for every act of a grant carrying it (Agreements, "rule 18d"; Development rule 9).

## 5. What the grantee's client does (client conformance)

5.1. **Before signing with a grant key**, the client reads the grant's limits and refuses, saying why, an act above the cap or in another unit, and an act while its own clock is past the expiry. *The clock that judges is the grant's; the client's own clock only stops it signing what would likely fall outside.*

5.2. **After signing**, a client that can asks the named clock to place the act (a timestamp clock's open form, `POST /stamp`), so that a verifier can judge the expiry.

## 6. Costs, stated

- The timestamp clock is one operator's word: a dishonest clock could stamp a late act early. Where more is at stake, name the Bitcoin clock.
- An act no clock placed stays unknown under the expiry: a grantee's act is safe for its counterparty only once placed.
- A thief holding the grant key acts within the limits until the grant is revoked (Agreements, F128's stated cost).
