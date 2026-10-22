# cMIP: A grant's limits

# cMIP: A grant's limits

*Draft 3, 22 October 2026, a Dubsar Suite session (round 3 of the redesign, `docs/damgar-r3-report.md`, F379), for Nobody, allegedly, to approve: draft 2 with one section added, marked **new in draft 3 (F379)**: **the cap in all of a lane** (section 8), a total for the whole lane, **kept by the apps and never judged by a verifier**. Decided by Nobody, allegedly, 21 October 2026, on the three ways to pay from Dub: a lane "with a cap on total, and a cap per act"; "Yes, add it". Section 2.3 below says why a verifier cannot judge a total: it needs every act of the lane, some of them private, so no outsider can check it. Section 8 therefore leaves every verdict as draft 2 gives it: a verifier implementing draft 3 judges exactly what draft 2 judges. **The cap in all is the apps' rule, not a verdict.** Its test value: `sha256("Grant limits cMIP, draft 3, test value until publication")`, named by no grant (8.1). Draft 2's text follows unchanged but for section 8.*

*Draft 2, 19 October 2026, for Nobody, allegedly, to approve: draft 1 with one section added, marked **new in draft 2 (F353)**: **limits on a lane's members' keys** (section 7). Agreements draft 16 lets an area name a cMIP judging limits on its holders' own keys (area key 6), and keeps only rule 60's count of keys. Decided by Nobody, allegedly, 19 October 2026, to the round 3 session: "Capping a lane should be left to the cMIPs, what the core keeps is rule 60"; "The cMIP adds the second signature, and makes the first one conditional, grants already have limit cMIP somewhere I think." Its test value: `sha256("Grant limits cMIP, draft 2, test value until publication")`. Written by the round 3 session; draft 1's text follows unchanged but for section 7.*

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

## 7. Limits on a lane's members' keys (new in draft 2, F353)

7.1. **Where an area names this cMIP** (Agreements draft 16, area key 6), its parameters are a `limits` map of section 1 holding a cap (key 0); an expiry there is unreadable for an area (1.1). **(mechanic, this draft's)**

7.2. **Within the cap** (section 2), an act of the collective the area reaches counts at the area's number as Agreements count it (rule 60): its holders' keys, as many as the number. **Above it**, or in another unit, it counts only with **one more** holder's key than the area's number: the first key's act is conditional on the second's signature. *"The cMIP adds the second signature, and makes the first one conditional" (Nobody, allegedly).* An act that names no amount is within (2.1).

7.3. A verifier implementing this section gives Agreements its verdict for the act (within, or above); one that does not answers unknown for the area (4.2), and the act does not count there.

7.4. **The member's client refuses before signing** (client conformance): an act above the cap with no second holder asked is prepared, never published as done; the app says that a second key is needed and gathers it, as a release's signatures are gathered.

7.5. *So a lane for small payments is written once, in the constitution: "Money: A and iPa, one key; above 10,000 regtest satoshis an act, two". The core counts keys; this cMIP says when one is not enough.*

## 8. The cap in all of a lane (new in draft 3, F379)

*A lane (a person's grant to itself, its key held by an app, F351) may be asked with a total: the most it may move in all its acts, over its whole life. Where the cap per act stops one large payment, the cap in all stops many small ones. It is the person's rule for their own apps, not a verdict: a verifier never judges it (2.3).*

8.1. **Where it is written.** The cap in all is **limits key 2**, `total = [ unit: hash, value: uint ]`, in the unit of the cap per act (key 0), its value a whole amount at least the cap per act. It is written **only** in the limits an app asks a lane with (the money messages cMIP's lane request, field 3, sealed to the identity itself) and in the money app's own record of the lane, sealed to the identity. **A grant never carries it**: the grant's field 3 holds keys 0 and 1 only, read as draft 2 reads them, and a grant whose limits carry key 2 has unreadable limits (1.1, unchanged). A grant goes on naming the draft it named (draft 1's or draft 2's hash); no grant names draft 3. **(mechanic, this draft's)** *Why not in the grant: a verifier has nothing to judge with it, and a key that draft 1 and draft 2 readers do not define would make every act of the lane unknown to them (1.1).*

8.2. **What spends it.** Each payment the lane's key commits to, once: the amount of the commitment in each invoice request signed under the lane (the money messages cMIP, type 3), whatever claims follow it (a claim of a payment already counted adds nothing). A payment its payee refused to bind (an answer refusing it) gives its amount back. An act in another unit than the total's is refused before signing (8.3). **(mechanic, this draft's)**

8.3. **The app holding the lane's key refuses before signing** (client conformance): an invoice request that would take what the lane has spent, by its own count (8.2), past the cap in all is refused, saying how much is left; nothing is signed. *Dub's count is the one it refuses by: the payments it made under the lane, as it keeps them.*

8.4. **The money app counts it.** The money app (Damgar) shows, for each lane asked with a total, the total, what the lane spent by the acts under it that it can read, what is left, and **any overspend**, said plainly. To make the acts readable, an app signing a private act under a lane, and holding the identity's own key, **delivers that act's content key to the identity itself** (an Envelopes key delivery, sealed to the identity, left at its homes), as it does for its other private acts; the money app opens the act under the lane with it and keeps the payment's record (decided: a payment under the lane is finished in the app, its record in Damgar's account). An act under the lane whose key was not delivered is counted as sealed, not as spending, and said so. **(mechanic, this draft's)**

8.5. **Not judged by verifiers.** An act past the cap in all, within the cap per act and before the expiry, is backed exactly as draft 2 backs it. A verifier implementing draft 3 gives Agreements the same verdict as one implementing draft 2; one implementing neither answers unknown (4.2, unchanged).

8.6. **Costs, stated.**
- An app that ignores the total (one that does not implement this section, or a thief holding the lane's key) can go on signing up to the cap per act until the lane expires or is revoked: the cap in all binds only the apps that keep it. The money app shows the overspend once it reads the acts; the answer is to revoke the lane (one act, rule 76).
- The money app's count is as complete as the keys delivered to it: an act whose key was never delivered (an app holding no identity key, such as one used through Kišib's runner, or one that does not deliver) is not counted, and the overspend may be larger than shown. Each such act is counted as sealed, and said.
- Delivering each content key to the identity itself makes one more private act per act under the lane, at the identity's homes: the homes see that one exists and its rough size, as for every private act.
- The total is private: sealed to the identity, never in the public grant. A payee cannot see how much of it is left; it gives the payee nothing to rely on, and is not meant to.
