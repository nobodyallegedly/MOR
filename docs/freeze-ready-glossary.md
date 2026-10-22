# Freeze-ready texts: one meaning per word

*Kept by the freeze-ready texts session (S1) as it goes. For each word the eight freeze-ready texts use in a defined sense: the one meaning, where it is defined, and any second meaning found and how it was resolved. Where two words meant one thing, the MICS's word was kept. Where one word meant two things and a verdict could turn on it, the choice is a question in `docs/freeze-ready-drafts-report.md`, never taken here.*

## Verdict words

| Word | One meaning | Defined in |
| --- | --- | --- |
| valid | Passes every rule of its own specification that the verifier can apply, and, for an act of another identity used as evidence, its signer's chain keeps it. | Envelopes rule 30; MICS common conventions |
| invalid | A rule the verifier can apply fails: shape, canonical text, format of its own specification, signature. Invalid beats unknown. | Envelopes rule 30; MICS common conventions |
| unknown | The verifier cannot decide: it does not implement the specification, does not hold an act the rule needs, or the act names something that is no specification. Never valid, void or invalid. | Identity, "A verifier that cannot tell answers unknown"; Envelopes rule 30 |
| void | A valid act a later act takes effect against: left out or disowned by a rotation and relied on by nobody (Identity rule 34); racing or after an ending (Agreements, the tie rule); under a revoked grant, outside what the revocation holds, relied on by nobody (Agreements rule 76). Void acts decide nothing. | Identity rule 34; Agreements rules 76, 79 |
| disputed | A display, never a verdict that decides: an act void by rule but relied on in a way the protocol can see (acknowledged by another identity, or recorded by a keeper the rules allow before the voiding act). Shown with both sides. | Identity rule 34; Agreements rule 76 |
| pending | Waiting on something outside the act: a rotation not yet counted, a payment the rail has not answered, a condition not yet decided, a vow's sale neither confirmed nor contested. | MICS common conventions |
| scoped | Identity's status for an act signed with a scoped key: its signature checked, its standing left to the MIR that installed the key. | Identity rule 8 |
| contested | In Identity, four things each with its own noun (a contested position, a contested rotation, a contesting receipt, contested routes). In Agreements, a vow's sale with a contest act naming it. Agreements' contest act is none of Identity's four. | Identity, "Words used"; Agreements, vows |

## The two keys

| Word | One meaning |
| --- | --- |
| signing key | The key that signs everyday acts; bound by genesis or a rotation; never adds to the identity chain. |
| chain key | The post-quantum key committed in advance by its hash, revealed and used once, to sign a rotation or a chain signature. "Safety key" is the old name; it survives only in the hash tag `"MOR/safety"`, which is part of the wire format. |
| scoped key | A key of an identity installed by a higher MIR's act, limited to that act's scope; a grant key is the one kind MOR 1 has. Never a third key of the identity: it signs nothing on the identity chain. |
| grant key | A scoped key handed by a grant; what it signs is the grantor's own act. A collective's member key (named by a holder's founding or clone signature) is a grant key. |
| encryption key | The public key an identity publishes to receive private content (Envelopes). Not a signing key. |

## Agreements' structures

| Word | One meaning | Defined in |
| --- | --- | --- |
| keeper | An identity's relay an agreement names to record the acts around it as they arrive: act ids and signers, never content. It orders, it never times. | Agreements rules 36 to 44 |
| keeper record | A keeper's signed statement naming one act and its signer (type 2, `{ 0 => [act, signer] }`), one per act, in the keeper's sequence; counts only alongside the act, and only from a keeper rule 42 allows. Not a collective's record (type 17). | Agreements, "Keeper record (type 2)" |
| keeper's sequence | The keeper's records, each naming the one before: a signed order, checkable from any copy. Places nothing on a time reference. | Agreements rule 37 |
| anchor | A proof, under the anchoring cMIP, that something existed by a point of a clock. The only thing that places anything on the clock. | Envelopes, task "Anchoring"; Agreements rules 33, 41 |
| time reference | The source of time an agreement names (terms field 6, a cMIP filling task 10), on which its deadlines are judged. The anchoring task now says "clock" (technical pass, question 15). | Agreements rule 33; Development task 10 |
| area | Acts of a collective and operational matters its founding agreement gives to some members, who alone decide there; may reach a whole layer ("the area reaching Money"). | Agreements rule 60 |
| member key | A key a holder's signature on a collective's founding or clone names: a grant key of the collective within the areas that version gives the holder. | Agreements rules 60, 73 |
| grant to oneself | A grant whose grantee is its own grantor: a person's grant key for an application acting for it. | Agreements rule 73 |
| line | An act of a collective (a record or a rotation; forks and closings end its lines) at which an event changing who may act for it takes effect. Second meanings found (a purchase's line, a deal's line of versions, an identity's own line): question 45 and the term question. | Agreements, "Made before, made after" |
| record | A collective's everyday line (type 17), writing a clone and registering departures. Distinct from a keeper record. | Agreements, "Record (type 17)" |
| everyday act | Every act other than genesis, a rotation and a chain signature: it carries `signer`, `binding` and `prev` and sits in a sequence (technical pass: written as defined). | Identity, "Everyday act"; Envelopes rule 13 |
| belongs to | An act belongs to an agreement when it names it, or an act of its chain, in `objects`, or through the act it answers (a receipt or claim through the claim it pays under and what it fulfils; an obligation through its agreement or offer). Its keepers' records count for it: those of the version in force for the act; every act in a collective's name belongs to the collective's agreement (S2, F371.2). | Agreements, "Belongs to", rule 42 |
| text field | Every CBOR text string anywhere in an act, whatever specification defines it. | Text, "Text field" |
| fulfils | What a receipt's field 5 or a claim's field 4 names: the act the payment follows. Judged by Money only where it names an act Money or Agreements reads; naming anything else, the payment fulfils nothing in Money's sense (S2, F370). | Money, "What a payment fulfils" |
| payment cMIP | A cMIP whose field 2 lists Money's task 6; a rail Module is a Module whose field 5 names one, decided by decoding that cMIP (S2, F371.4). | Development, "A rail Module's kind and binding" |
| clock | What an anchor is made on: a clock Module and its parameters under the anchoring cMIP. Kept apart from "time reference", which is only task 10's. | Envelopes, task "Anchoring" |

## Words checked

| Word | Finding | Resolution |
| --- | --- | --- |
| lane | Agreements and the MICS called an area reaching a whole layer that layer's "lane"; the apps call a person's grant to an app a "lane". | Decided (prompt, from Nobody, allegedly): the MIRs and the MICS say "area" only. Every "lane" in the area sense became an area ("the area reaching Money"); the grant-to-oneself sense is written "a grant to oneself". The word "lane" appears nowhere in the eight texts. |
| unrecorded | Agreements used "unrecorded" for a sale its seller's side has not recorded; the MICS's word is "pending". | "Pending" in every text. |
| contested | Identity's four senses and Agreements' contest act and contested sales. | Already separated by the texts (Identity names each; Agreements' contest act changes no status). Kept. |
| disputed | Identity's status after a rotation; now also an act under a revoked grant (Agreements rule 76). | One meaning, written in Identity rule 34's words in both; what it confers on an agreement chain is question 24. |
| record | Agreements' collective record (type 17) and keeper record (type 2); delivery, use and metric records of cMIPs. | Kept apart by their full names; listed in the term question. |
| keeper | Also release field 4 (`keeper`, a key deliverer, no keeper) and "a keeper or custodian role, for a cMIP". | The wire name of release field 4 is unchanged; listed in the term question. |
| specification, kind, cMIP, Module, task, extension, adoption, implement | Several senses each (the Development stranger's list). | Listed in the term question; no verdict found to turn on one word alone, except "implement" against "adopt" for unknown (question 37). |

*The strangers' full lists of words used two ways are in `docs/freeze-ready-strangers/`. Every one not resolved here is in the report's term question.*
