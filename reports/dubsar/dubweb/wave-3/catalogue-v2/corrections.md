# Corrections: every finding of the three rereads, checked against the acts

*DubWeb wave 3, session F, 26 November 2026. Author: Nobody, allegedly. For each finding of `reread/reread.md` (session D: I1, I2, I3, B5, F1, H1), `reread/reread-E1.md` (session E1: I4, I5, F2, F3, B1, B2, B3) and `reread/reread-E2.md` (session E2: B4, B6, R1, R2, R3, H2, and the catalogue's sections 3, 4 and 5), the act it cites was opened in the full copy (`_research/`, public acts only, through `check-cat/read.mjs`), and the finding was applied or not. "Old" is version 1 (`../catalogue/`), "new" is version 2 (this folder). Words are cut, never changed; "…" marks a cut. Acts are cited by their first 8 and last 4 characters.*

Three kinds of sentence, as in the rereads: **the act says** (quoted), **the catalogue says** (old or new), **inferred** (marked). Verdicts: **applied**, **applied in part** (with what was not), **not applied** (with the act's words), **checked, no change** (the reread itself said it holds, or asked a question the act answers without a change to the catalogue).

Numbering: `D` = reread.md, `E1` = reread-E1.md, `E2` = reread-E2.md; then the problem or section, then the order in that section.

## reread.md (session D)

### I1. Warnings

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·I1·1 | "A notice is never a refusal on its own" is draft 3's change list; rule 9 is "A notice is not a verdict" and lets a client refuse on (a) or (b) | `aab7569f…46d5` | applied | "draft 3's rule 9 says 'A notice is never a refusal on its own'"; "none moves or blocks anything" | "draft 3 lists as its change 'A notice is never a refusal on its own' … Rule 9 itself, 'A notice is not a verdict', lets a client refuse where '(a) the client has itself checked the claim from the evidence's bytes … or (b) the buyer has chosen, beforehand, whose notices count for them'"; "no notice or mark moves or blocks anything by itself" |
| D·I1·2 | "Found by Luca": Fennec's own post already names the flaw | `0d94a533…3a78`, `04bfa5f4…7dba` | applied | "Found by Luca" | "Found by Kofi, its author, in the release itself ('Known flaw: it flags honest warnings that mention 'bonus' or 'alpha' too'); and Luca, reading it. Which came first is not ordered here" |
| D·I1·3 | Pointer Look 0.1.5's fix rests on Pointer's word | `06ee9a70…86a0` | applied | "Fixed: rules 9 and 10 of draft 3; Pointer Look 0.1.5" | "Fixed in the text by rules 9 and 10 of draft 3; fixed in Pointer Look 0.1.5 by Pointer's statement …, the code not held" |
| D·I1·4 | `5ad530fd` is Graziella's account and orders nothing against any warning | `5ad530fd…5708` | applied | "Failing: every warning about the Welcome Desk came after Giuliana had sent her key file" | "Failing: Graziella's account says the 'Welcome Desk' asked Giuliana for 'the long list of words' in her key file. Whether any warning came before that is not shown here: ordering acts of different signers needs a place's record (rule 7)" |
| D·I1·5 | Rule 7 of draft 2 credits Pierre Silva and co. and Postmark's place, not the hosts | `3f6c016b…c4cf`, `aab7569f…46d5` | applied | "Rule 7 of draft 2 … follows the hosts' line on time" | "Rule 7 of draft 2 … credits Pierre Silva and co. and Postmark's place, not the hosts; that its window-two timing follows the hosts' line on time (`hosts-log.md`) is inferred" |
| D·I1·6 | "Draft 1 is of day five, window one": the act gives no window | `ea275eab…b254` | applied in part | "Draft 1 is of day five, window one" | "Draft 1 is dated '20 November 2026, day 5' in the act; its window, one, is from The Back Row's day-5-window-1 report, which presents draft 1". Not removed: the report (`windows/the-back-row/reports/day-5-window-1.md`, "cMIP warning notice, draft 1") gives the window. |
| D·I1·7 | Missed: Pierre Silva's notice is under draft 1's spec and says "established" for a payment | `9ef25d25…3c81` (spec 56dd0814…), `ea275eab…b254`, `aab7569f…46d5` | applied | (no such fault) | New fault: draft 1 reads a payment as "reported", and "A reader who finds an 'established' claim it cannot check … reads the whole notice as 'reported'"; draft 3 says only "a notice signed under draft 2 reads the same under draft 3". Open. Also in I1's lean and section 3 point 1. |
| D·I1·8 | Missed: the notice readers stop at draft 1 | `c03b0054…ed1f`, `ae11d444…edb2`, `81ba353a…45e0` | applied | (not listed) | New fault: standing.mjs 0.3 "counts identity-taken notices under our draft 1 spec only, not drafts 2 and 3"; its code holds one notice spec. Open, "With Sanne Verhoeven". |
| D·I1·9 | Lean stands; the other way: "established" by inference, mixed notices, one reader at draft 1, Pointer's word, rule 7 unchecked | `8dcd2510…88fe`, `06ee9a70…86a0` | applied in part | "Still open inside it: 'established' per claim …; and 'shown when'…" | Lean kept; "Still open" adds the draft-1 notice, standing.mjs's draft-1 reading and Pointer's word. Not marked "changed": the lean stands. |

### I2. Whose keys

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·I2·1 | "minutes before the Terms" is Marthe's act only | `1cd7c7ff…010b`, `0162c5a8…1fda`, `a96a8cbf…8d9d` | applied | "each of the three witnesses signed CONFIRMED for one rotation the owner made herself, 'minutes before the Terms'" | "Three CONFIRMED acts … Only Marthe Delcourt's says 'It was made minutes before the Terms'; Bastien Leroy's says 'I asked her in person', Sanne Verhoeven's 'she told me on a call before she ran it'" |
| D·I2·2 | Inferred: that rotation is before the Terms, which neither text judges: "the honest path, once" overstates | `1820e96c…7158` ("For any rotation of this identity made after these Terms"), `aefd33ef…2085` ("before the Terms: not judged") | applied | "The honest path, once …"; "Written, and untested against a thief" | "Inferred: a rotation made before the Terms is one the text does not judge … so the witnesses signed in the agreed form and the reading rule was never exercised in public"; "Written, and untested: against a thief, and on the honest path too". Also in I2's "In the round", its lean and section 3. |
| D·I2·3 | 0.1.3 fixed a different fault, a forked witness line | `f90fd736…6618`, `37dee3fe…7d49` | applied | "Fixed in 0.1.2 and 0.1.3" | "Fixed in 0.1.2"; new fault: "a witness whose own line holds two acts at one position (a forked line: a stolen key, or a mistake) gets no voice", fixed in 0.1.3 |
| D·I2·4 | Two points open in standing.mjs 0.3 | `c03b0054…ed1f`, `81ba353a…45e0`, `ae11d444…edb2` | applied | (no open fault) | New fault: "SUCCESSOR still takes the first 64-character id in the text; and it counts identity-taken notices under our draft 1 spec only". Open, "With Sanne Verhoeven". |
| D·I2·5 | Counterparty's two notes, "not faults" | `5db21117…925a` | applied | (not listed) | Notes: "Two smaller notes, not faults": the threshold "is written in the code", and Beatrice's guardians use other words |
| D·I2·6 | "three faults found in two days" is low and mixes a wording fault | `5db21117…925a`, `22fae0ff`, `aefd33ef…2085`, `f90fd736…6618` | applied | "Its reader had three faults found in two days" | "Its reader had faults fixed in 0.1, 0.1.1 and 0.1.2 … and two points still open in 0.3". The count of days is dropped: not checked here. |
| D·I2·7 | The ring's "Apps" cites a request, not a run | `3596a08d…a81f`, `ae11d444…edb2` | applied | "read by standing.mjs from version 2 on" | "standing.mjs 0.3 was written with it in mind ('LEAVING (Beatrice and Giulia)'); Beatrice asked 'Sanne, please try standing.mjs on it'; no act read shows it run on her Terms" |
| D·I2·8 | The ring's version 2 no longer recognises a new identity | `c412a37d…6ea7`, `34d68932…a002` | applied | "The ring, as first written, recognises a new identity …" (as the difference left) | "Version 2 of the ring has the word in advance's shape … 'Nothing an identity says about itself counts here: not 'this is my new identity'' … version 2 replaced that" |
| D·I2·9 | Odile's version 2 adds a notice and lodging; the ring's version 2 has neither | `1820e96c…7158`, `c412a37d…6ea7` | applied | "Odile's version 2 adds a warning notice with each TAKEN and lodging at a place" | the same, plus "the ring's version 2 has neither, and has no update rule of its own" |
| D·I2·10 | The quote drops the first word, "hers" | `3596a08d…a81f` | not applied | "which 'was better worded and already has a reader'" | Unchanged. The act says "hers was better worded and already has a reader"; the words quoted are a continuous run of the act, cut at its start, and the sentence's subject (Odile's word in advance) is named. |
| D·I2·11 | Lean wobbles: the "second case" brings back a rule its author replaced | `c412a37d…6ea7`, `3596a08d…a81f` | applied | "Merge … Odile Ferrant's version 2 with Beatrice's rule for a new identity as its second case" | Lean "changed": "Treat the two as the one text they already are in shape … Do not bring back the ring's first rule for a new identity: its author replaced it … untested, on the honest path too, until a rotation made after the Terms is judged …" |
| D·I2·12 | The other way: notice rule 6 and Keep recovery draft 2 are built on draft 1's recognitions | `aab7569f…46d5`, `2c6a10b9…4dcf` | checked, no change | — | A reading for the reader leaning the other way; the lean no longer brings back recognitions, so it does not turn on them. |

### I3. Getting an identity back

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·I3·1 | Draft 1 says "never a password alone" | `f2b809a2…8ea9`, `2c6a10b9…4dcf` | applied | "Draft 1 decides 'the right person' by a password and a wait"; fault "Draft 1 left 'the right person' to a password and a wait" | "Draft 1 decides 'the right person' by a public request, a wait and the holders' own check, 'never a password alone' … Draft 2 gives its own account of draft 1: 'Draft 1 left 'the right person' to a password and a wait …'"; the fault line now says it is draft 2's account |
| D·I3·2 | "no ring and no wait stops that" is draft 2's only | `16432468…c7f4`, `2c6a10b9…4dcf`, `f2b809a2…8ea9` | applied | "both drafts end on the same limit: 'A thief with both keys …'" | "Draft 2 states its limit: '…no ring and no wait stops that'. Draft 1, which has no ring, says it at its start: 'Whoever gathers the signing key and the chain key together is the owner completely'" |
| D·I3·3 | Draft 2 does not say "not a rule a verifier checks" | `f2b809a2…8ea9`, `2c6a10b9…4dcf` | applied | "both drafts say 'not a rule a verifier checks'" | "draft 1 says 'not a rule a verifier checks', draft 2 'not something a verifier of the core checks'" |
| D·I3·4 | "Built on by: none", yet Odile's version 2 names and refs it | `1820e96c…7158` | applied | "no other signer's specification text names it" (the script's rule, unchanged) | Added note: "Odile Ferrant's word in advance, version 2, names it and refs it: 'Keep's recovery (act f2b809a2…8ea9) is the thing that stops one'; as words of Terms, the script does not count it". The script's rule is kept; the note names the case. |
| D·I3·5 | Lean stands | `c91262bb`, `0d3c58a3` (as cited by `2c6a10b9…4dcf`) | applied in part | "Recovery by shares was run once by its author alone" | adds "and draft 2's cancel path once, by its author, on its own test identity" (rule b, from E2's section 3.2). Not "changed". |

### B5. Delivery

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·B5·1 | "had no act to say so": a buyer's contest was filed, naming the settlement in the clear | `808f58bc…3653`, `528e3b5c…e63f` (opened: its words and payload key 9 carry payment hash 25ca6535…c5b8) | applied | "Failing: a paid buyer did not receive Edubba and had no act to say so under the pipe" | "It had an act: 'We have filed its buyer's contest: act 528e3b5c…', which names the settlement in the clear; what was missing … the shower 'follows the money, not the work'"; and "Why it matters" adds that the contest shows the link made |
| D·B5·2 | "Neither text says how the other's act is to be read": section 6 says what a client shows | `537b6390…ad17` | applied | "Neither text says how the other's act is to be read: whether rule 2 shows such a receipt, or how …" | "Public flow's section 6 says what a client shows where an act breaks rule 1 or 2: 'not shown: it names who paid (or the buyer's payment, in the clear) …'; and a buyer's act that does not open the commitment is shown as 'the buyer's word, unchecked as to payment'. Inferred: whether a buyer's own receipt 'breaks' rule 2 is not said …; and neither text says how a reader … matches a receipt … to a public-flow sale" |
| D·B5·3 | Rule T credits the Mending Circle, Postmark and Longhouse, not the hosts | `87d4b559…8749`, `98e3deb4…12e9` | applied | "Draft 2's rule T follows the hosts' line on time and the Mending Circle's rule 12" | "For time, draft 2 credits the Mending Circle's rule 12, Postmark's place and Longhouse's anchors; it names no hosts' line" (in the solution's data; the entry is now a pointer, see below) |
| D·B5·4 | The "with" outcome: buyer by assent "proves an assent, never a payment" | `14b01383…c639` | applied | "that check is one the kit can make for every sale" | adds "Even then, DubLaw's buyer by assent 'proves an assent, never a payment': the kit would show that the signer is the buyer, not that the hash in key 1 is the buyer's payment" |
| D·B5·5 | "A receipt names the agreement, not the seller" is in kept.mjs itself | `3fdf9b59…4ba5` | applied | "(kept.mjs's own stated flaw, wave-2 scan)" | "(kept.mjs: 'the seller, or the service that wrote the Terms for them: the receipt does not say which')" |
| D·B5·6 | Lean wobbles: key 5 names the payment hash; deposits use it; public flow names commitments only under its Terms | `87d4b559…8749`, `943e2ad4…e40d`, `9f1911e7…55c6`, `537b6390…ad17` | applied | "Merge: Kept Word's outcomes and arm's-length count, named by public flow's commitment instead of the payment hash …" | Lean "changed", kind now "a gap still open": "A seam between two texts in two areas … DubWeb no longer proposes simply to rename the receipt by commitment: its key 5 also names 'the buyer's own notice of payment, naming the payment hash'; … 'The receipt's payment hash is the deposit's'; … public flow names commitments only 'where the work's Terms name this cMIP'. The proposal is that each text say how it reads the other's act" |

### F1. Nothing skipped

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·F1·1 | Missed: Pointer's 27 acts signed and never sent | `05957c93…5cf4` | applied | (not in "In the round") | "Failing, on the sending side: 27 of Pointer's acts signed and never sent"; "Why it matters" quotes "Of the 61 public acts Pointer signed, 27 never reached any home … it does not send it" |
| D·F1·2 | Neither signed tip proves a reader is caught up | `9435f660…646b`, `e15cb368…73ed` | applied | "both texts could be read as the pattern for the everyday line" | adds "Neither proves a reader is caught up: 'It does not prove the stated log size is the newest'; 'Arrival leaves no bytes'. Each makes a home's word refutable, not complete." Lean stands. |

### H1. Leaving a closing home

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·H1·1 | "They agree on" does not hold for turnstile-move | `bcd4000c…93c9` | applied | "All read the closing home's whole feed, recompute every id …" | "The check and the census read the closing home's whole feed … turnstile-move 'Sends every act you signed, oldest first, to each new home'; its code is not held" |
| D·H1·2 | "only an owner's rotation …" is Longhouse's sentence | `3f9351b0…0b05` | applied | "because 'only an owner's rotation changes which homes its chain names'" (as turnstile-move's) | "'Only an owner's rotation changes which homes its chain names', as Longhouse's check says of itself" |
| D·H1·3 | Missed: homes.mjs read the wrong field, fixed in 1.1 | `505597a0…697d`, `ff1eaf70…995b`, `7d1df140…82bf` | applied | (one fault) | New fault: "homes.mjs now reads a rotation's homes from field 6 (our error, corrected in act 7d1df140)"; inferred bearing on who "names the closing home" |
| D·H1·4 | Sealed items 706, 718, 719 stay open | `5ffd0f50…543c`, `732ce4d0…17af`, and `e349b1db…12be` (opened: Turnstile's later receipt) | applied | "every act until-home showed was found at a staying home" | "every act of until-home the check could read was found at a staying home … The sealed items 706, 718 and 719 stayed open; Turnstile's later receipt says they are 'Held nowhere else'" |
| D·H1·5 | Dubsar closed with notice; no act shows a home closing without notice | `bcd4000c…93c9`, `b531bab6…4c09` | applied | "And the case with no notice was not drilled: when dubsar closed, …" | "Dubsar closed with notice; for an identity whose only home was dubsar, the rule to leave existed and 'Today's kit has no command for it'. No act here shows a home closing without notice, drilled or not." |
| D·H1·6 | The lean is headed "a gap" and proposes a merge | — | not applied | "a gap still open"; "Merge the handover check and the census …" | Unchanged. The kind names the gap (no tool moves a resident who does not act); the merge inside it is of two counting tools, and the reread found the lean stands on its gap. Adds, from the act, "Turnstile told until-home's residents to sign the kit's own rotate" (`d1befc39…e15b`). |

### Rules of the wave (session D)

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| D·a | Part 1's "13 warning notices … by 5 identities" has no caveat beside it | (count from catalogue.mjs) | applied | "13 warning notices were signed by 5 identities, and three players' clients read them" | "… by 5 identities (a count of use; used is not checked), …" |
| D·b | "the honest path, once" overstates what was tried | as D·I2·2 | applied | as D·I2·2 | as D·I2·2 |
| D·c | I2 may turn on the grammar's default update rule (Counterparty's C2) | `3596a08d…a81f`, `63b6f2d4…e50b` (point 5; the C2 act itself is sealed, not opened) | applied | (one outcome) | I2 now gives both outcomes: with the default changed, "a change signed by Beatrice alone is no longer refused by the kit"; without, "the kit refuses a change of the ring signed by its holder alone". Marked: whether this is a named-signers case is DubWeb's lean, for Nobody, allegedly, to judge. |

## reread-E1.md (session E1)

### I4. Head statements

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·I4·1 | "Not shown: any reader comparing two homes' statements": Longhouse compared them by hand | `2412c4d1…019d` | applied | "any reader comparing two homes' statements" | "any client comparing two homes' statements. Longhouse compared its own two homes' statements by hand: 'Both name the same head: that is what a client should see'" |
| E1·I4·2 | "two operators": by Turnstile's directory, one operator for safety | `3cf407b6…3125` | applied | "served by two operators"; "two home operators only" | "served by two homes of one company ('counts as one operator for safety')"; "two home operator ids only … which Turnstile's directory counts as one" |
| E1·I4·3 | "the one text … provable from bytes" does not hold | `e15cb368…73ed`, `ae14b26f…3863` | applied | "It is the one text in DubWeb's area whose failure is provable from bytes by its own rules" | "Its failure is provable from bytes by its own rules … It is not alone in that: the place has a section 'Proving the place wrong, from bytes alone', and open books' 'grows only' is 'checkable from the bytes'" |
| E1·I4·4 | Longhouse's audit offer is a text act, Terms, and bears on the problem | `fdc195a5…2fd0` | applied | "that is a service, not a text, and it was not read further here" | "offered, as Terms, to audit a home for a fee: to 'ask it at least once for a head statement … and publish what we find'. Inferred: that is section 6's stale check, offered for sale. Whether anyone bought it is not checked here." |
| E1·I4·5 | Missed: the promised number and Counterparty's target 1 | `9435f660…646b` | applied | (not listed) | Notes: "'How often a client holds none is measured by Counterparty's target 1; the number will be written here'; no act read shows the number, or the attack its scenarios await" |
| E1·I4·6 | Lean stands, its wording wobbles; "keep, unattacked" | as above | applied | "say beside it that it was served by two operators and checked by no client" | Lean "changed": "served by two homes of one company …, compared by hand by that operator only, checked by no client, and not yet attacked …" |
| E1·I4·7 | The thief in `fba20df5` rests on other acts (E1 section 4) | `fba20df5…0b11`, `161e54c4…f69e` | applied | "The home that took the thief's rotation of Giuliana's identity" | "The home that took the rotation of Giuliana's identity which The Back Row's notice calls taken" |

### I5. Findings held in trust

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·I5·1 | "Found by Counterparty": it is its author revising its own draft | `cf64943b…8b4f` | applied | "Found by Counterparty" | "its author, Counterparty: draft 2 revises its own draft 1 and names no finder; its change for recipients who rotate builds on Odile Ferrant's and Beatrice's words and standing.mjs" |
| E1·I5·2 | "follow the hosts' line on time": the text names no hosts' note | `cf64943b…8b4f` | applied | "Draft 2's several references follow the hosts' line on time" | "Draft 2 gives its own reason … ('MOR proves order, not hours') and names no hosts' note; that it follows the hosts' line on time (`hosts-log.md`) is inferred" |
| E1·I5·3 | Missed: the one use is under draft 1 | `b54a2876…8459` (opened: spec 0d23dd94…, payload key 2 = 144), `aa552d9c…e1b8` | applied | (draft not said) | "It is typed under draft 1's spec with one wait of 144 blocks, draft 1's shape: draft 2 was never used" |
| E1·I5·4 | Missed: the reveal was signed and handed to the hosts | `aa552d9c…e1b8` | applied | "No acknowledgement, status or reveal is in the copy" | "No public acknowledgement, status or reveal …; Counterparty says 'the hosts never acknowledged', and 'We signed the reveal (type 3, act 7e6066ac…) and gave its bytes to the hosts'" |
| E1·I5·5 | Missed: the author's own fault, what draft 3 needs | `aa552d9c…e1b8` | applied | (not listed) | New fault: "Draft 3 should merge its acknowledgement and status into one act … tonight we did that by hand". Open. |
| E1·I5·6 | "Built on by" The Back Row and Edubba 12: they name it, they do not build on it | `a1a2deb9…fc82`, `14b01383…c639` | applied | (the script's list, unannotated) | Note: "The Back Row names it as 'also new today and worth reading together', and Edubba version 12 lists it by spec hash …: by the script's rule they name it; neither builds on it" |
| E1·I5·7 | "notice 8 paid bounties": the Dub teams paid | `bed976d5…a6e5` | applied | "notice 8 paid bounties for findings 'published in public, naming the act and the rule'" | "notice 8 set bounties 'paid by each Dub team from its own budget for findings against its own text, published in public, naming the act and the rule'" |
| E1·I5·8 | Lean wobbles: say draft 1, draft 2 unused, draft 3 named | as above | applied | "Keep it as written, marked untested and used once by its author" | Lean "changed": "… used once by its author, under draft 1: draft 2 was never used, and its author has named what draft 3 needs" |

### F2. Finding the text a hash stands for

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·F2·1 | Misquote: no Turnstile act says "replaces nothing" | `8c3c083b…5de2`, `a4fd9edd…5e21`, and, searched in the full copy, `b86ca191…7415`, `4ab6e806…6705` | applied in part | "Each edition 'replaces nothing': the old one stays, a reader must find the newest" | "Each names, in its own words, what it follows: directory edition 2 and contest catalogue edition 2 begin 'Replaces nothing: edition 1 …'; rerun edition 2 says 'Replaces edition 1 (act 4836974a…) and our correction (act 8a1d1bd7…)'". Not applied as given: the words are in two Turnstile editions the pack did not hold; "each" was the error. |
| E1·F2·2 | The Edubba example shows an old version run unknowingly, not a list gone stale | `ee66defb…d3c7`, `14b01383…c639` | applied | "a tool's list of known texts goes stale in a day: on the rerun's first day Edubba read …" | "a reader may run an old tool without knowing it: Turnstile read the rerun's Terms with Edubba version 1 …; DubLaw: 'Turnstile read Terms with version 1 two days late …, and nothing told it the app was old'" |
| E1·F2·3 | Ummia's MISSING correction is conditional | `692ba300…cc43`, `0872f77a…1f94` | applied | "Its `pipe` said a deal's parameter was MISSING where the deal's words named it" | "DubWeb's post said a deal's parameter was MISSING, read with 'DubWeb's reader'; its correction is conditional: 'If so, DubWeb's 'MISSING' was wrong for your version 2 …'"; also in section 5 |
| E1·F2·4 | Contradiction: turnstile-check's code "held" (apps) and "not held" (F09) | `_research/apps-from-trays/` (README, SHA256SUMS, `turnstile-check-v1.answer`) | applied | "turnstile-check 1 (…; held in `_research/apps-from-trays/`)" | "Its code is not held: the file `_research/apps-from-trays/turnstile-check-v1.answer` holds Ummia's code". The merged feature list (F09) is not changed here. |
| E1·F2·5 | Missed: two acts headed "the straight split, draft 6" | `7e0ac8f1…9a49`, `333bdbc7…6e07`, and `7555d468…f119` (opened: Counterparty's pass) | applied | (not listed) | "Two acts are headed 'the straight split, draft 6'; the second is draft 7 as first published, under that wrong first line, 'now withdrawn' and reissued; a join by title merges it with draft 6". The pack could not say which is behind e51e8653; Counterparty's act does: the reissued act b9e43db4…, "e51e8653…8dc8, as released". |
| E1·F2·6 | Missed: the report block, proposal 4, cited under three hashes | `333bdbc7…6e07`, `7e0ac8f1…9a49`, `c30f9374…b033` | applied | (not listed) | "cited under three hashes: '7b65c60f…7854', '7b65c60f…3e9e' and 'c25aafcd…1c73'" |
| E1·F2·7 | Missed: Turnstile's own admitted faults and stated limits | `3fc6810e…3243`, `4836974a…5691`, `8c3c083b…5de2` | applied | (corrections only) | New fault: "'our catalogue has been wrong twice by reading for you' …; 'NOT checked: whether the Terms are in force'; 'We read it for two deals only'" |
| E1·F2·8 | Lean stands; the other way: Turnstile names by hand, Edubba 12 names its version | `8c3c083b…5de2`, `14b01383…c639` | applied | — | New "In the round" line: "Working, by hand: Turnstile's editions name by act id the editions they follow; Edubba version 12 'says its own version on every run …'". Lean unchanged. |

### F3. One reader for small records

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·F3·1 | "Never named by any act": the Mending Circle names it | `19ce6306…9289` | applied | "Never named by any act"; "nobody named it" | "Named, not used: the Mending Circle names it"; "the Mending Circle named it, as 'waiting for an answer or an attack'" |
| E1·F3·2 | "Built on by" the Mending Circle: it names, it does not build | `19ce6306…9289` | applied | (the script's list, unannotated) | Note: "it names it, it does not build on it" |
| E1·F3·3 | "All say 'a line proves who said it …'" is line records' alone | `a9136f29…3a91`, `ad3b8e7f…fca7` | applied | "All say 'a line proves who said it, never that it is true'" | "Line records says it: 'A line proves who said it, never that it is true'; held for you says something close: 'it proves what it owes, never what it has'" |
| E1·F3·4 | CONFIRMED/TAKEN credited to Odile; the cited act says Sanne; Beatrice missing | `2c6a10b9…4dcf`, `16432468…c7f4` | applied | "Odile Ferrant (CONFIRMED, TAKEN)" | "Sanne Verhoeven and Odile Ferrant (CONFIRMED, TAKEN, SUCCESSOR), Beatrice (recognitions, denials)"; the fault quotes Keep's own list ("Sanne's CONFIRMED/TAKEN/SUCCESSOR, Beatrice's recognitions and denials") |
| E1·F3·5 | Missed: a second finder, Counterparty | `aa552d9c…e1b8` | applied | "Found by Keep" | "Keep; and Counterparty, apart: 'A witness's word, as bytes … Readers hard-code them'" |
| E1·F3·6 | Missed: two forms under one kind name, HELD | `2c6a10b9…4dcf`, `ad3b8e7f…fca7`, `46aaf149…e56b` | applied | (not listed) | New fault, quoting the three line forms; "Inferred: a reader of Stall's form refuses or misreads a Keep HELD line". Also in B3. |
| E1·F3·7 | Lean falls on its first ground, wobbles on its second | `19ce6306…9289` | applied | "it was named by no one, and it fixes the weakest of the three forms" | Lean "changed": its first ground dropped; the second marked as this catalogue's judgment; the other way's three points given |

### B1. Public flow

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·B1·1 | F1 and F2 were fixed in draft 4; F2 is not about the settlement | `5820a918…60a2`, `47477761…408b`, `587e9ee6…3b52` | applied | "Drafts 3 to 5 let a report name the buyer's settlement in the clear (Counterparty's F1 and F2 …). Fixed in draft 8, rules 2 and 3." | "Draft 3 let a report name the buyer's settlement in the clear (F1 …); and a filler's consent given under one version could be read under a later one (F2 …). Fixed in draft 4, by the ruling …; drafts 4 and 5 open 'Fixes Counterparty's F1 to F5'" |
| E1·B1·2 | W7 described backwards; fixed in draft 7 | `2ac300da…8422`, `95e124e8…59ca` | applied | "a deal's own data cMIP could darken the flow … Fixed above the core in draft 8, section 6" | "with public flow named only in the work and the deal naming no data cMIP, the flow went dark ('With public flow named only in the work, the flow is dark, and says nothing') … Fixed in draft 7, by the ruling ('Fix in draft 7'), and kept in draft 8, section 6" |
| E1·B1·3 | The wrong file: DubWeb said it; Counterparty found the effects | `ad058df2…56b9`, `c924941a` (as cited by the ruling) | applied | "Found by Counterparty's second reading; DubWeb's ruling" | "Found by DubWeb, of its own file, in its ruling on Counterparty's second reading, which found the effects", quoting "First, a mistake of mine, said plainly …" |
| E1·B1·4 | Missed: Counterparty's second reading, N2, N5, N6, N9, N10 | `ad058df2…56b9` | applied | (not listed) | New fault listing N2 ("only the named deliverer's statement counts"), N5, N6, N9 ("one narrowing darkens the whole full report"), N10; "Fixed in draft 8, which credits each finding (section 11)". `c924941a` itself was not opened; the words are the ruling's. |
| E1·B1·5 | "Draft 6's commitment … point 7": point 7 reads draft 5 | `ca301f7d…b5ef`, `537b6390…ad17` | applied | "Draft 6's commitment could be linked from a public invoice ([ca301f7d], point 7)" | "DubPay's point 7 reads draft 5: 'Draft 5 gives 'the invoice's own secret' as an example'; draft 8 says it of draft 6 … Inferred: offered as an example in drafts 4 and 5, made the rule in draft 6" |
| E1·B1·6 | The sale's states were first written into draft 5 | `587e9ee6…3b52` | applied | "Fixed in draft 8: the sale's states, and only the buyer's signature makes it received" | "First written into draft 5: 'A sale is paid, not finished, until its buyer says so'; five states from draft 6; in draft 8 only the buyer's signature makes a sale received" |
| E1·B1·7 | Draft 5 credits Eleanor Hughes's finding to `c81be6d8`, DubWeb's act | `587e9ee6…3b52`, `c81be6d8…07e6` (signer 762c0b4c, DubWeb) | applied | (not said) | "Draft 5 credits Eleanor Hughes's finding to 'act c81be6d8', which is an act of DubWeb's; her act is `4d149bfc`" (her act was not reopened) |
| E1·B1·8 | "Built on by" lists two "draft 6" acts and the hosts' invitation | `7e0ac8f1…9a49`, `333bdbc7…6e07`, `7555d468…f119`, `bed976d5…a6e5` | applied | (the script's list, unannotated) | Note: "[7e0ac8f1] is draft 6; [333bdbc7] is draft 7 as first published … The hosts' 'attack the shower' is an invitation to attack draft 3, not a text built on it" |
| E1·B1·9 | Missed credit: "attacked and passed by Counterparty, act 7555d468…" | `c7619d03…cb26`, `7555d468…f119` (opened) | applied | (not mentioned) | "The hosts say the released pipe was 'attacked and passed by Counterparty, act 7555d468…'; Counterparty's act calls it 'fit for tomorrow's contest on one condition, our P1'" |
| E1·B1·10 | Lean: "drafts 3 to 7 … should not be named" goes beyond the text | `537b6390…ad17`, `a4fd9edd…5e21` | applied | "drafts 3 to 7 stay readable and should not be named" | Lean "changed": "draft 8 says 'They stay readable, and Terms that name them keep them', and only that 'Draft 6 must not be named' and draft 7 as published 'is not the text announced'" |
| E1·B1·11 | "The silent `readers` default": draft 8 states it; the "stands alone" line is inference | `537b6390…ad17` | applied | "Open: the default stands in draft 8"; "Public flow then stands alone as the one K8 text" | "Draft 8 states the default, 'Empty (no parameters) means `parties`'; what stays silent is Terms that leave the parameter out"; "Inferred: public flow then stands alone …" |
| E1·B1·12 | "Notice 8 … paid bounties" (as in I5) | `bed976d5…a6e5` | applied | "paid bounties to attack it" | "invited attacks on it, with bounties 'paid by each Dub team from its own budget …'" |
| E1·B1·13 | Lean wobbles on "no other", the fault list, and "already with the MOR lead" | `537b6390…ad17` (section 12) | applied | "Its two core questions … are already with the MOR lead" | "named in draft 8's text for the MOR lead; whether they have reached the MOR lead is not checked here"; "most of the faults were closed in drafts 4 to 7" |

### B2. Open books

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·B2·1 | Missed: "grows only" read two ways | `ae14b26f…3863`, `2b30872d…918e`, `9e1daa90…93ad` (their opening lines read here; the money lines' recomputation is E1's, not repeated) | applied | "Faults found: none" | New fault: rule 3 "begins with every one of its lines, byte for byte" against "Any other line of the text is commentary and is not checked"; "Inferred: the rule does not say which reading applies" |
| E1·B2·2 | Missed: line codes are not the straight split's "as they stand" | `ae14b26f…3863`, `333bdbc7…6e07` | applied | (not listed) | New fault: "`[0, amount]` … `[1, amount, to, settlement]`" against "`[0, amount, by]` … `[1, amount, to, by]`" |
| E1·B2·3 | "agreed in 2d5716c6" is DubWeb's own yes, and the line is not clean | `2d5716c6…50ed` | applied | "agreed in [2d5716c6]"; "as the two texts already agree it" | "DubWeb's own act agrees that line with DubPay's seam act, and adds 'A pot with petty cash held by one member could use both'; DubPay's seam act and the pot's text are not opened here"; lean: "as DubWeb's act agrees it with DubPay's" |
| E1·B2·4 | Missed: one time reference read from prose; Longhouse's proof to come | `001ad100…fe7f` | applied | (not listed) | New fault: "'when' reads Postmark's anchors from the wording of its posts", and edition 2's proof "follows Longhouse's next anchor" |
| E1·B2·5 | "read with a stranger's tool" is DubWeb's own report | `001ad100…fe7f` | applied | "The acts show both of its time references agreeing on edition 1, read with a stranger's tool" | "By DubWeb's own act, both of its time references agree on edition 1, read with a stranger's tool" |
| E1·B2·6 | Lean stands; the other way: a reading of public flow, and the area | `ae14b26f…3863` | applied in part | — | Lean kept, findings added. Its area is now settled (Web, open books) by DubPay's check in inventory-v2, so the area point is closed there, not here. |

### B3. Held for you

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·B3·1 | "the other side" is held for you's words, not Proven claim's, and inverted | `ecf9afc4…e862` | applied | "Proven claim is 'the other side' by its own words" | "Held for you calls itself the other side of Proven claim, in its own words: …" |
| E1·B3·2 | Missed: "claimed, unpaid (rule 6)" now points at the wrong rule | `ecf9afc4…e862` (its numbered rules read: 6 lodge first, 7 two clocks, 8 a late holder) | applied | (not listed) | New fault: "the late holder is now rule 8, but 'How to read a holder's book' still sends 'claimed, unpaid' to rule 6" |
| E1·B3·3 | Missed: Keep's HELD is not Stall's | as E1·F3·6 | applied | "Keep recovery draft 2 uses the HELD line for shares" | "writes shares as HELD lines in a form of its own, whose fields differ from Stall's (see F3)" |
| E1·B3·4 | Missed: rule 4 rests on one place, which stopped | `aa552d9c…e1b8`, `4a60428e…81dc`, `bbce9673` (as cited) | applied | (not listed) | New fault: rule 4 "counts only where the HELD names a place … which 'stops recording at 22:30'; … Inferred: after that, no new CLAIM can be lodged at the place these lines name" |
| E1·B3·5 | Lean wobbles: "its one weakness is its form, not its rules" | `ecf9afc4…e862`, `27fabf34…8e50` | applied | "Its one weakness is its form (see F3), not its rules" | Lean "changed": "with three findings: its cross-reference …; rule 4's witness …; and its form … Hop's lines say 'place none', so its claim and release paths are untested" |
| E1·B3·6 | Rule 7's credit includes Longhouse | `ecf9afc4…e862` | applied | "credits 'the hosts' note on time'" | "is credited 'from the hosts' note on time and from Longhouse's anchors'" |

### Rules of the wave (session E1)

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E1·a1 | B1's "most named text" without the caveat | — | applied | "It is the most named text in DubWeb's area" | "… (a count of use; used is not checked)" |
| E1·a2 | I4's "two home operators only" refers back to a count | — | applied | "by two home operators only (the 'written under it' count above)" | "… (the 'written under it' count above; used is not checked)" |
| E1·a3 | B2's "One keeper used it" without the caveat | — | applied | "One keeper used it: its author." | "One keeper used it: its author (used is not checked)." |
| E1·b | Vouched recovery never called tried | — | checked, no change | — | Holds in version 2. |
| E1·c | B1's "with" branch: buyer by assent "proves an assent, never a payment" | `14b01383…c639` | applied | (not said) | "Even then, buyer by assent 'proves an assent, never a payment': the kit would say who assented, not who paid" |

## reread-E2.md (session E2)

### B4. Signed credits

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·B4·1 | Backlot's section 7 is written | `5d6a2519…25b7` (signer c48cdf0c…, Backlot), `fadd9853…261e` (signer 76f53113…, Ampersand) | applied | Fault "Its section in the joint text is not written … Open."; "its section 7 … is empty" | "Backlot wrote that section in an act of its own, '## 7. The Terms form (Backlot)' … No act read is one text holding both forms signed by both collectives … The section is written; the joint text with both forms, signed by both, is not in the copy." |
| E2·B4·2 | "draft 2 … ends 'The Terms form (Backlot, to write)'": section 7 is in the middle | `fadd9853…261e` | applied | "draft 2 of Ampersand's text ends 'The Terms form (Backlot, to write)'" | "Draft 2 of the joint text marks its section 7 'The Terms form (Backlot, to write)'" |
| E2·B4·3 | "nothing written under Backlot's" conflicts with the table, and lacks the caveat | (counts from catalogue.mjs) | applied | "nothing written under Backlot's" | "and Terms naming Backlot's spec in a socket (the counts above; used is not checked)" |
| E2·B4·4 | The "with named signers" outcome: later versions still need Plain Words' in-force cMIP | `5d6a2519…25b7`, `710de023…3ce0` | applied | "the Terms form needs no in-force cMIP" | "the Terms form's first version needs no in-force cMIP …, while its later versions still need Plain Words' cMIP"; the kit line says the same |
| E2·B4·5 | To check: Beatrice cites "Backlot's joint draft 2 with Ampersand (act b4ba6f2f)" | `1e2e81a0…c95c`, `b4ba6f2f…86aa` (opened) | checked, no change | — | `b4ba6f2f` is Ampersand's letter to Backlot ("Ampersand to Backlot …, answering act aeda6bce…"), not the joint draft; the catalogue cites `fadd9853` and is not changed. Listed in found-while-correcting.md. |
| E2·B4·6 | "found by" is the catalogue's word; the act credits contributions | `fadd9853…261e` | applied | "Backlot, Carmen Vidal, Steward & Co. (credited in draft 2)" | "(draft 2 credits each for what it added, section 9; 'found by' is this catalogue's word)" |
| E2·B4·7 | Lean wobbles: the gap it names falls | `5d6a2519…25b7` | applied | "The gap is that the second form's section is unwritten" | Lean "changed": "Backlot has written its section; what is left is one text holding both forms, signed by both collectives …"; the other way's point added as inferred |

### B6. Hours of care

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·B6·1 | The quote describes Plain Words' period payment; applying it to "both" is a reading | `6b0cc411…f333` | applied | "Both: 'one side states, the other side confirms, anyone counts'" | "The text says it is shaped after Plain Words' period payment: '…'; inferred: the circle's lines follow the same pattern" |
| E2·B6·2 | Missing limit: Postmark's place stopped, and its notice names the circle | `4a60428e…81dc`, `62ead1cf…f068` | applied | (not listed) | New "In the round" line and note: "after 22:30 our place records nothing more" |
| E2·B6·3 | Inferred, to check: the Krog's 1.5× rule cannot be written or checked | `62ead1cf…f068`, `6b0cc411…f333` | applied, as inferred | (not listed) | Note: "Inferred, to check: the Krog … counts hours that start after 23:00 'one and a half' and records 'Never … a time of day', while this text allows 'a whole number of quarter units' …" |
| E2·B6·4 | The twin is Kenta Mori's text naming the circle's lines | `a9136f29…3a91` | applied | "counted under line records (F3)" | "which line records names (F3)" |
| E2·B6·5 | Lean stands; the other way: the line form already serves two circles | `a9136f29…3a91` | checked, no change | — | A reading; the lean already sends it to F3. |

### R1. Time

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·R1·1 | The Pointer Cite fault was found by Postmark | `58d5d812…919f` | applied | "Found by Pointer, of its own app" | "Found by Postmark ('Postmark: you were right. Cite counted a record one too high')"; "Corrected by Pointer, who adds 'The same fault was in our contest checker'" |
| E2·R1·2 | "a copier's claim was set aside": both were, then the place ordered them | `a701456f…b218`, `cbce1eab…72f4` | applied | "a copier's claim was set aside because only a witness orders two signers" | "register 0.3 marked both rival claims 'contested, order needs a witness' and counted neither, and register 0.4 then ordered them by the place" |
| E2·R1·3 | "Every text says the same sentence" is the catalogue's reading | `28bfd7db…a862`, `e15cb368…73ed` | applied | "Every text says the same sentence in its own words: 'MOR proves order, not hours'" | "Inferred: every text says the same in its own words. Pointer Cite: 'MOR proves order, not hours'; the place: 'Order, never time'" |
| E2·R1·4 | "two clocks" is held for you's alone | `ecf9afc4…e862`; full-copy search: two acts, both Stall's | applied | "the round's day-five texts name both as 'two clocks'" | "held for you names them 'two clocks', other day-five texts 'two references'"; section 1 likewise |
| E2·R1·5 | Anchoring covers what feeds showed, not what a home holds | `08aab7c0…0609`, `3f9351b0…0b05` | applied | "Anchoring covers every act a home holds" | "Anchoring covers what each feed showed in the ranges it names ('every act, once, on dubsar's feed arrivals 804 to 1197, …'), … not what a home holds" |
| E2·R1·6 | "locally" is the catalogue's word | `4a60428e…81dc` | applied | "drilled locally" | "'drilled from one place to another and back, never run on the round's machine'" (R1 and the place's faults) |
| E2·R1·7 | Lean stands; the one comparison is DubWeb's own | `001ad100…fe7f` | applied | "both references agreed on DubWeb's open books" | "…, by DubWeb's own act about its own books" |

### R2. Proven claim

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·R2·1 | Misquote: "beside an identity's number" | full-copy search: no act; `d6647391…1f1e`, `de67b513…009c`, `ad3b8e7f…fca7` | applied | "the three records 'beside an identity's number'" | "the records a debt is written in 'beside the debtor's number' and 'beside the holder's number'" |
| E2·R2·2 | A co-author's register run is listed as another signer's text | `cbce1eab…72f4` (signer 4e760abc…, "Pierre Muller, administrateur judiciaire"), `d6647391…1f1e` | applied | (the script's list) | Note: "The register run … is signed by Pierre Muller, a named co-author …: a run of the register, not another signer's text" |
| E2·R2·3 | Draft 1's rule is cut short | `d6647391…1f1e`, `a701456f…b218` | applied | "Draft 1 ordered rival claims by each claimant's own sequence" | "Draft 1's rule 5 counts 'The first, by the claimant's own sequence and by the earliest anchor or home receipt that shows it'; register 0.1 'ordered by position and gave him her claim'" |
| E2·R2·4 | The established notice is a draft-1 notice | `9ef25d25…3c81`, `ea275eab…b254` (opened: the pack lacked it) | applied | "A warning notice was established on one" | "…; that notice is typed under the warning notice's draft 1 spec, whose rule 1 reads a payment as 'reported' (see I1)" |
| E2·R2·5 | Two acts give different ids for draft 2 | `c96e1cea…8f37`, `1ec28779…9e83` (opened: Pierre Silva's letter to DubLaw), `623a2749…63cd` | applied | (not listed) | New fault: "act 1ec28779 is Pierre Silva's letter to DubLaw saying what 'Draft 2 will say'; draft 2 is [de67b513] … Open, in DubLaw's text" |
| E2·R2·6 | Missing limit: Postmark's notice names Pierre Silva's register | `4a60428e…81dc` | applied | (not listed) | New fault and "In the round" line |
| E2·R2·7 | Lean stands; the other way: the register already shows the order | `cbce1eab…72f4` | applied in part | "Keep Proven claim, draft 2, and read it with …" | Lean "changed" for the misquote and the pointer (Proven claim is now DubLaw's, P10); the other way's reading is not folded in |

### R3. Custody receipt

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·R3·1 | Missed: draft labels lag | `ba354a86…9fcd`, `3f62c4b8…dac9`, `9b6627e3…d3bb`, `ed92f0e3…c894`, and `e349b1db…12be` (opened: a later receipt) | applied | (not listed) | New fault quoting the act lines, the first receipt's "end to end in arrival order: Until's format" and draft 1's "sorted, joined by one line feed"; "Turnstile's later receipt opens 'custody receipt, draft 2' and names draft 2" |
| E2·R3·2 | Section 4.8 cites the manifest for the three lists | `a95af5cc…dc50`, `ba354a86…9fcd` | applied | "three keepers made three lists before agreeing one ([a95af5cc])" | "([ba354a86]; Until's manifest is [a95af5cc])" |
| E2·R3·3 | "A keeper's 'not held' is unsigned" is credited to Longhouse by the text | `ba354a86…9fcd` | applied | (no credit) | "(the text credits it as 'Longhouse's point')" |
| E2·R3·4 | Lean stands; the other way: the label lag | `ba354a86…9fcd` | applied | "It is already the merge." | "It is already the merge, in its prose: its act lines still name draft 1 …" |

### H2. A home's promises

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·H2·1 | "No other home published a policy" falls | `3f62c4b8…dac9`, `ed92f0e3…c894`, `52bd8175…fc5b` (opened: "# Turnstile home: policy", version 1) | applied | "No other home published a policy as a text DubWeb's inventory found" | "Another home published a policy: 'Turnstile home: policy', version 1, with a section 'If it closes', which turnstile-home's receipts cite …; the inventory holds it as no text". Not added as a solution: the order adds no text. |
| E2·H2·2 | "Both say what the home will do when it stops" rests on version 1 | `6f779dbe…93a9`, `d6ab83fb…480e` | applied | "Both say what the home will do when it stops" | "Policy version 1 and the bond say …; policy version 2, which replaces version 1, has no section on stopping" |
| E2·H2·3 | "a text nobody signs but the operator" is wrong about the signer | `6f779dbe…93a9`, `d6ab83fb…480e`, `24f93535…c7a2` (all signed 3022fb29…) | applied | "a text nobody signs but the operator" | "a text signed by Until's identity, not by the home's operator key (named in [d6ab83fb])" |
| E2·H2·4 | Missed: the bond's Terms bind manifest 1 | `be5f5d6c…3725` (opened: body key 14 holds `manifest: a95af5cc…`), `9cbdffb3…1160`, `3f62c4b8…dac9` | applied | "Faults found: none" | New fault: "Its Terms name `manifest` a95af5cc…dc50, Until's manifest 1 …; Turnstile's receipt read 1571 items … Inferred: most later acts sit outside the bond's promise" |
| E2·H2·5 | Missed: `notice_windows` against "`notice` blocks" | `be5f5d6c…3725` (`notice_windows: 3`), `9cbdffb3…1160` | applied | (not listed) | New fault: "the key and the unit differ" |
| E2·H2·6 | Missed: the escrow's arbiter and its mode | `14b01383…c639`, `5102247f…387a` | applied | (not listed) | New fault: "'in mode event, no arbiter decides until Until's draft 5'. The bond does not say which mode its vow uses." |
| E2·H2·7 | "Funded" cannot be checked from an act | `be5f5d6c…3725` | applied | "One bond was made and funded" | "One bond was made …; 'funded' is Until's report's word, and no payment act is cited here" |
| E2·H2·8 | To check: the notice says Thursday 19 November; other acts date the drill "today" | `24f93535…c7a2`, `d1befc39…e15b` | not applied | — | Not resolved: `d1befc39` says "which closes today" with no date, so the copy's acts do not settle it. The catalogue states no date. Listed in found-while-correcting.md. |
| E2·H2·9 | The notice is conditional | `24f93535…c7a2` | applied | "Until gave a day's notice of closing in a signed act" | "…, conditional: 'If they agree, it closes on Thursday 19 November'" |
| E2·H2·10 | Lean wobbles: "the only examples" falls | `52bd8175…fc5b` | applied | "keep both texts as the only examples" | Lean "changed": "read Until's two texts beside Turnstile's policy version 1 before calling it a gap" |

### Section 3: the three most important leans

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·3·1 | Warnings holds; both notices cited are version-1 notices | `161e54c4…f69e`, `9ef25d25…3c81` (both spec 56dd0814…) | applied | point 1 | adds "Still open inside it: how a notice signed under draft 1 reads under draft 3; the two notices most cited here are draft-1 notices" |
| E2·3·2 | Whose keys: Keep recovery draft 2's cancel path was tested; its ring was not | `2c6a10b9…4dcf` | applied | "call it, and all recovery by vouching, written and untested …" | Point 2 "changed": "Keep recovery draft 2's cancel path was run once by its author; its ring was not", with D·I2·11 |
| E2·3·3 | Delivery: half checkable; can a sale be matched by the agreement root? | `87d4b559…8749` | applied | point 3, "merge … named by the commitment" | Point 3 "changed": "a seam, not a merge …; inferred, a reader might match a receipt to a sale by that root even where the payment hash is hidden, but no text says so" |

### Section 4: for the MOR lead (every citation reopened)

Every act the section cites was opened in the full copy (the JSON lists them under `for_the_mor_lead[].acts_cited`); the points below are the reread's, and each says what changed.

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·4·1 | "where Dub lost acts" against "Nothing was lost"; field 4 | `e15cb368…73ed`, `9435f660…646b`, `2d5716c6…50ed`, `398036c6…672f`, `433dfdc7…11a3`, `ed92f0e3…c894` | applied | "which is where Dub lost acts … and where Stall and DubLaw lost them too" | "where readers missed acts: Dub's fault was in paging a home's feed ('Nothing was lost: the posts are on the homes'), and Stall and DubLaw 'missed' acts …"; plus the "refutable, not complete" point (D·F1·2) and, inferred, to check against the Identity MIR, field 4 |
| E2·4·2 | The word in advance's line 4 says "the same hour it is signed" | `de67b513…009c`, `3f6c016b…c4cf`, `ecf9afc4…e862`, `1820e96c…7158`, `a701456f…b218` | applied | "four texts wrote 'lodge first, at a place, before publishing anywhere'" | "three texts wrote …; a fourth, the word in advance version 2, line 4, asks that each witness's word be lodged 'the same hour it is signed'" |
| E2·4·3 | The list is incomplete; the one comparison is DubWeb's own; the hosts' hand shows | `ae14b26f…3863`, `ecf9afc4…e862`, `ba354a86…9fcd`, `fadd9853…261e`, `87d4b559…8749`, `cf64943b…8b4f`, `001ad100…fe7f`, `c96e1cea…8f37`, `de67b513…009c`, `1820e96c…7158`, `62ead1cf…f068` | applied | "the one comparison in the copy found them agreeing" | adds the four texts left out, "DubWeb's own act about DubWeb's own books", and the two credits that name the hosts |
| E2·4·4 | Holds; "no wait" is inferred | `f2b809a2…8ea9`, `2c6a10b9…4dcf`, `161e54c4…f69e` | applied | "The round's theft was a valid rotation with no wait" | "…a valid rotation, 'in its chain (checkable)'; inferred, from Keep's words, that nothing made it wait" |
| E2·4·5 | The quote is cut before its exception | `f2b809a2…8ea9` | applied | "… as concerning it" | "… as concerning it, except addressing it privately'. A private route exists; what is missing is a public one." |
| E2·4·6 | Holds | `2c6a10b9…4dcf`, `a9136f29…3a91` | checked, no change | — | — |
| E2·4·7 | "Each text then falls back on a place" does not hold | `ae14b26f…3863`, `ba354a86…9fcd`, `9cbdffb3…1160`, `ecf9afc4…e862` | applied | "Each text then falls back on a place as witness" | "Only held for you then falls back on a place …; open books leave omission to the givers, the custody receipt says 'A count can show where an item was found, never prove where it was not', and the bond falls back on 'the arbiter's own fetch'" |
| E2·4·8 | The three-lists cite should be `ba354a86` | as E2·R3·2 | applied | as E2·R3·2 | as E2·R3·2 |
| E2·4·9 | Holds; `b531bab6` may predate a later kit | `3f9351b0…0b05`, `d1befc39…e15b`, `b531bab6…4c09` | applied | "the kit had no command for it" | adds "whether a later kit added the command is not checked here" |
| E2·4·10 | Holds for the place; the report block and anchoring text not checkable from the pack | `e15cb368…73ed` | checked, no change | — | The counts of hashes with no text stay the script's. |

### Section 5: faults in Kišib, Dub or Ummia

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·5·1 | Empty page: holds | `2d5716c6…50ed` | checked, no change | — | — |
| E2·5·2 | Signer unchecked: the quote is Keep's verdict, not point 6 | `4c9e5c04…db2c` | applied | "…: 'trust Dub's 'who signed this' only …' (point 6)" | "'The signer Dub shows is not checked' (point 6); Keep's verdict: 'trust Dub's 'who signed this' only for identities whose record you have checked yourself'" |
| E2·5·3 | Keys wording: holds | `4c9e5c04…db2c` | checked, no change | — | — |
| E2·5·4 | "The hosts" label: "announced nowhere" overstates | `adc0a751…2231` | applied | "one announced nowhere" | "of the second, The Back Row says it 'is not in anything the hosts have given us'" (section 5 and Dub's marks) |
| E2·5·5 | Invoice mark: holds | `adc0a751…2231` | checked, no change | — | — |
| E2·5·6 | [new]: holds | `4c9e5c04…db2c` | checked, no change | — | — |
| E2·5·7 | Ummia MISSING: the correction was conditional | as E1·F2·3 | applied | "`pipe` printed MISSING …" | as E1·F2·3 |
| E2·5·8 | Missing row: Dub's default relay was dubsar | `adc0a751…2231` | applied | (no row) | New row: "'Its default relay is dubsar, which closes on day three' … No fixing act read. To check in 0.5.2." |
| E2·5·9 | Kišib: cannot check from the pack | — | checked, no change | — | Nothing in the full copy either: no public act reports a fault in Kišib. |

### Rules of the wave (session E2)

| # | The reread's point | Act opened | Verdict | Old | New |
|---|---|---|---|---|---|
| E2·a1 | B4's "nothing written under Backlot's" without the caveat | — | applied | as E2·B4·3 | as E2·B4·3 |
| E2·a2 | "Working" lines report readers' outputs; would read more safely with "by hand" | — | not applied | — | Each such line cites the act whose words it reports, and none is a count; rule a asks the caveat beside counts. The reread's own word is "would read more safely". |
| E2·b | Part 1 should say Keep recovery draft 2's cancel path was run | `2c6a10b9…4dcf` | applied | "Keep recovery draft 2 are written and untested" | "Keep recovery draft 2's ring are written and untested; Keep recovery draft 2's cancel path was run once, by Keep, on its own test identity" |
| E2·c | B4's "with" outcome leaves out later versions | as E2·B4·4 | applied | as E2·B4·4 | as E2·B4·4 |

## The report's section 3 (DubWeb, 25 November)

Every point of `report.md` section 3 is one of session D's above (D·I3·1, D·I3·2, D·I2·1, D·H1·2, D·I2·3, D·I2·4, D·H1·3, D·I1·8, D·B5·1, D·B5·2, D·I1·5 and D·B5·3, the lean table, D·F1·1). Nothing further.

## Counts

From `count-corrections.mjs` (beside this file; it reads this file's table rows and prints): 169 findings, 43 from session D, 60 from session E1, 66 from session E2. By verdict: applied 147, applied as inferred 1, applied in part 6, not applied 4 (D·I2·10, D·H1·6, E2·H2·8, E2·a2), checked with no change 11.
