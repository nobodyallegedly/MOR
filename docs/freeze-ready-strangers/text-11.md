# Stranger's reading: Text draft 11

*A subagent read `spec/MIR-text-draft-11.md` with access only to the other core texts, as the C session will. Its lists, condensed; what the session did in brackets: **[fixed]**, **[Q]** (a question in the report), **[gap]**, **[as designed]**, **[MICS/suite/Development]** (fixed in that text's freeze-ready version).*

## 1. Rules it could not understand or check

1. "Every text field of every act" (rule 1): under a cMIP the verifier does not implement, which CBOR strings are text fields (map keys, `hint`, web `ref`s)? [Q: which strings are text fields]
2. Rule 14: a verifier implementing Identity, Envelopes and Text only cannot tell whether a signer is a collective (Agreements' declaration in its genesis), so for a text act carrying one object it cannot tell "individual, invalid" from "collective, valid". [Q: what a Text-only verifier answers on rule 14's two cases]
3. Rule 14: how a verifier knows a key is a grant key, and what it checks of the installing act; Identity rule 8 says a client without Agreements shows a scoped act unknown, while the suite line says "valid under Text". [Q: what a Text-only verifier answers on rule 14's two cases]
4. For a holder's member key, the binding names a signature act, the grant being the founding or clone: which is the predecessor? [Q: rule 14's grant case and a holder's member key]
5. An act signed with a collective's grant key has the collective as signer: both cases apply, each allowing one object with different predecessors. [Q: rule 14's two cases overlap]
6. "Exactly one object" against Agreements rule 58 and Envelopes rule 14, where an action also cites heads it joins: a collective's text can never join heads. [Q: rule 14's two cases overlap]
7. "Its own latest decision": "latest" cannot be checked. [as designed: Agreements treats citing the latest as the signer knew it; the text means a decision of its own]
8. "On its actions chain (a link of its identity chain or one of its records)": records and links are on the decisions chain. [fixed: wording]
9. A collective's records may be sealed to members, so a non-member never holds the decision named, and a public collective text stays unknown to outsiders. [as designed: unknown is the verdict; stated cost, added]
10. The suite line says "a predecessor that is no decision of its own: invalid", Agreements says "counts for nothing". [Q: rule 14's two cases overlap]
11. "An individual signer naming its own chain: invalid" against the grant case. [fixed: "save the grant case"]
12. "Any other `objects`… a grantee's… is invalid": the grantee is not the signer. [fixed: wording]
13. Whether a text act is an everyday act; position and summary optional in the CDDL. [as designed: Envelopes rule 13; every act but Identity-chain acts is everyday]
14. "`to` where it is addressed or answers someone": "answers someone" undefined. [gap: client practice]
15. `TEXT`, the hash of this MIR, cannot be computed yet; the file ends with a line break, so it is not canonical text. [Q: the frozen files' final line break]
16. The pinned Unicode version is not fixed ("17.0 as of this draft"). [Q: the pinned Unicode version]
17. Rule 12, "a character not yet assigned is left as it is": a check, not a normalization step. [gap]
18. "A text act with no text" against the empty string being canonical. [fixed: "no field 0"]
19. Field 1 naming something that is no format cMIP, or no specification. [gap]
20. Rule 3: how an unknown text act is displayed. [gap]
21. Rule 5's warning set: Default_Ignorable includes U+200C and U+200D, which are "never warned about for their presence alone". [gap]
22. Rule 6's two lists of acts; "Agreements' act types are named explicitly" without type numbers. [gap]
23. The format task's floor: undefined terms ("amount", "block", "next to"), U+2031 listed twice, no format for a format's declaration. [gap; the duplicate U+2031 fixed]
24. Development task 4 says a format hides "only non-letters", Text "only its own markup" above a floor, MICS "never letters or digits". [Development, MICS: aligned to Text's task]
25. MICS says "a text act carrying `acks` or `objects` is invalid", with no exceptions. [MICS: fixed in v30]

## 2. Terms used two ways

valid ("valid under Text" a partial verdict); invalid and Agreements' "counts for nothing"; unknown (a verdict, and "an unknown format" meaning not implemented); act, action, decision; type; chain (Envelopes' chain, identity, actions and decisions chains, a cMIP's chained texts, "a collective's record" as a chain); object (an `objects` entry, and the object a chain is about); format (a format cMIP, an act's format, a specification's format); specification; grant (a grant act, a founding or clone for a holder's key); scoped key; collective (a signer property Text cannot detect); decision (narrowed here); record; controls (bidirectional controls, and every Cf character in rule 5). [Taken where wording: "controls" in rule 5 is now "the format characters"; the rest in the glossary and the report's term question.]

## 3. Cross-references

- Suite v30 named before it exists. [as designed]
- "A bidirectional override, shown visibly before signing: scenario 1": scenario 1 has no such step; a component line does. [suite: checked in v30]
- The collective and grant-key components "under Envelopes and Text" do not exist in suite v29. [suite: added in v30]
- "The pointer Agreements rule 58 asks of every act of a collective" overstates rule 58 (negotiation messages and Identity acts excepted). [fixed: "of a collective's acts"]
- Rule 4 does not cite Envelopes rule 32, its counterpart. [fixed]

## 4. History left

The header's approval line; "Unicode 17.0 as of this draft" [Q]; rule 14 out of reading order [fixed: said so]; the reasoning "a text act is closed" written before the two exceptions [fixed].
