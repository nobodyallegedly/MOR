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

## Words checked so far

| Word | Finding | Resolution |
| --- | --- | --- |
| lane | Agreements and the MICS called an area reaching a whole layer that layer's "lane"; the apps call a person's grant to an app a "lane". | Decided (prompt, from Nobody, allegedly): the MIRs and the MICS say "area" only. Every "lane" in the area sense becomes an area (for instance "the area reaching Money"); the grant-to-oneself sense is written "a grant to oneself". The word "lane" appears nowhere in the eight texts. |
| contested | Identity's four senses and Agreements' contest act and contested sales. | Already separated by the texts (Identity's glossary names each; Agreements' contest act changes no status). Kept. |
| record | Identity has none; Agreements' "record" is a collective's everyday line, and "keeper record" is a keeper's act (type 2). | See Agreements below (in progress). |

*In progress: Envelopes, Money, Agreements, Development, MICS and suite still to check.*
