# Stranger's reading: Envelopes draft 11

*A subagent read `spec/MIR-envelopes-draft-11.md` with access only to the core texts. Its lists, condensed; what the session did in brackets: **[fixed]**, **[Q]**, **[gap]**, **[as designed]**, **[other text]** (fixed where it lives).*

## 1. Rules it could not understand or check

**Contradictions**
- Rule 8: "Identity acts MUST be public" against Identity's private links; the encryption key (Envelopes type 4) listed as an Identity act; the rule said twice. [fixed]
- "The specification names its creator" against MIRs, the MICS document and test suites having none. [fixed]
- Rule 1's float clause and its commentary ("section 4.2.1 leaves floats to the protocol") against Identity's plain "section 4.2.1"; what "tags and simple values as they are" allows; NaN, −0. [Q: deterministic CBOR's floats, tags and simple values, said once]
- The anchoring task: "accepts any act id" against "an anchor may place a commitment… the act itself is written later". [gap]
- "A time reference is a clock Module and its parameters" (anchoring task) against the time-reference task (task 10) filled by its own cMIP. [Q: time reference, one meaning]
- A sealed container is "not an act" yet "invalid" (rule 12). [as designed: rule 12 says what invalid means for it]

**Missing definitions or inputs**
- "Everyday act" undefined here: which types must carry `prev`, position, summary; whether identity-chain acts must leave them out. [gap: one definition, "every act other than genesis, a rotation and a chain signature", proposed in the report]
- An everyday act missing position or summary: invalid, or only unprovable? [gap]
- The running summary: "up to this act" (CDDL comment) against "up to and including the previous act"; Identity's kept tip "including it". [Q: the running summary, inclusive or exclusive]
- `node(peak, bagged so far)` undefined; the test vectors named but not in the texts. [gap; the vectors go with the texts to the C session]
- The six MIR hashes: how a MIR's hash is computed (Development rule 26 against Part three's `tagged_hash("MOR/spec", content)`); Envelopes names no constant for itself. [Q: how a MIR's spec hash is computed]
- `hash`, `scheme`, `tagged_hash` defined only in Identity. [as designed: Identity's encoding section]
- When `binding` must be absent or present. [as designed: Identity's checks]
- The encryption key's chain (payload field 1 or `objects`), which key is "current", a sender sealing to an older key, a private type 4. [gap]
- Which branch of a forked encryption-key chain a later rotation keeps. [gap]
- Rule 11: addressing checked at container level only; several recipients on a key delivery; "rule 7's test" for a media key; the act named not held. [gap]
- "A key delivery addressed to no one, with the key on its outside" read as the delivered key. [gap: wording to check]
- A private inner act without `key` in `contents`; step 5's inner `to` equal to or containing the container's. [gap]
- An acknowledgement of the signer's own act; "invalid as an act"; acknowledgements of void acts; the MICS's "while its signer's chain keeps it" missing here. [gap]
- A web reference's hash: function and input. [gap]
- "A stranger's act naming the chain is no version of it": its verdict; "a new date" with no date field. [gap]
- Rule 24: a withdrawal whose publication is not held; `for` signing with a grant key; extra `objects`; a private withdrawal. [gap]
- Rule 27: two copies both validly signed. [gap]
- Rule 2: whether a tag counts as a level; whether it applies to the sealed container. [gap]
- Rule 30: "unknown to every client" and "shows it as no specification" for one case. [as designed: two readers, one verdict each]
- Rule 32: an exception to which rule. [as designed: rule 30]

## 2. Terms used two ways

valid and invalid ("valid as an act by its shape"; a fork of "two acts" and of "two valid acts"); unknown ("an unknown key" meaning a key not in the format); disputed (a display; Money's "visible dispute"); type (act type, media type, a route's spec scope); chain (an object's chain; the encryption key's and routes' payload-linked chains; the identity chain; a clock's blockchain; the chain of judgment); object (a CBOR item, a signed object, a media object, the object a chain is about, the `objects` entry); fork; sequence; position (from 1 in a sequence, from 0 on the identity chain, a home's log position); line; specification; publication; genesis (an identity's, a vow's); reference (`refs`, time reference, by reference to an act, `rule-ref`); acknowledgement (the act and the entry); inbox (a route and a relay's role); anchor, time reference, clock; vow ("existing or to come" against Agreements' "to come"). [Taken where wording: Agreements' vow entry aligned; the rest in the glossary and the report's term question.]

## 3. Cross-references

- Freeze scenario numbers that differ from the suite's (key delivery, work hash, withdrawal, unknown act, repost); suite lines with no Envelopes line (encryption key and hijack window, Identity acts public, vows). [suite: checked at v30]
- Pointers to cMIPs and Modules by role (relay transport, live media, voting, anchoring and its clocks, payment, media, access, absence proof), a key-exchange specification, the X-Wing IETF draft. [as designed: named by role; the X-Wing draft is the external standard named by version]
- Other texts cite Envelopes by old numbers (Agreements "rule 4a", "7b", "rule 4", "'Chains', rule 3", "rule 11"; MICS "draft 10"). [other text: fixed]

## 4. History left

Rule 28 and type 2's retired lines [as designed]; scenario 4's line on the relay commitment [kept: tells the reader what scenario 4 rests on]; "(and the CDDL left key 2 optional)" [fixed]; "Web references are unchanged" [fixed]; "no one-time key, no signature" and the 96 bytes [kept: says what the container has not]; the X-Wing draft's version [as designed]; a stray ",." [fixed].
