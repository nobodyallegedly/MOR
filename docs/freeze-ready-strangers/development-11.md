# Stranger's reading: Development draft 11

*A subagent read `spec/MIR-development-draft-11.md` with access only to the core texts (the suite as v29). Its lists, condensed; what the session did in brackets: **[fixed]**, **[Q]**, **[gap]**, **[as designed]**, **[other text]**.*

## 1. Rules it could not understand or check

**Computing a spec hash** [Q: how a MIR's spec hash is computed, with question 17]
- "Canonical content" is not defined; the content map is not said to be deterministic CBOR (Identity and the MICS say it of acts only).
- Identity's "the hash of the frozen text of this MIR" against Development's content map `{0 => 4, 9 => text}`; rule 26's "canonical bytes" undefined.
- Which optional fields a MIR's content carries (only fields 0 and 9?) is not stated, so two tools could give two hashes; "can fill from the text" is a judgment.
- Whether a specification's media must be public; how a verifier goes from a spec hash to the bytes.
- Placeholders in the MICS and suite texts; "How the MIRs themselves are published" still listed open beside rule 26. [Q: question 34]

**Decoding the format** [gap, grouped with question 13]
- Unknown map keys, duplicate keys, non-deterministic encoding and a non-canonical field 9 in the content (not an act).
- Field 1 on kinds 4, 6 or 7; field 2 "required for a cMIP filling a task" undetectable from bytes, while the suite treats it as optional; `task-ref`'s bounds; field 5 naming "a MIR or one of its tasks" in one hash; fields 11 and 13 required "where field 5 names the payment cMIP" needing another specification fetched; "any other kind" (spec kind or rail Module) [Q: question 35]; field 10 and field 12 on other kinds; the layer numbering 0 to 3 defined only in Agreements' `kind`; field 7 on a cMIP, `amount` and `part` bounds, `paid`; field 6's hash tag, where the locked binary and its key are, `size`, `profile`; a founding reference implementation with no profile yet; the CDDL conventions for `payload-schema` [Q: question 34]; field 9 resting on the pinned Unicode version [Q: question 2].
- Content under another media spec is "no specification" in the suite, not stated in Development. [gap]
- "Unknown, never invalid" for an act naming a malformed specification, against "invalid beats unknown" (Envelopes rule 30): an act with non-canonical text or forbidden `acks` is invalid there. [as designed: Envelopes rule 30 decides; wording to tie in the report]
- "A creator that never published it": a verifier knows only what it holds. [gap]
- Claimed and unclaimed for units, media types, schemes and MIPs. [gap]
- "Published and signed by its creator" against a MIR signed by its publisher. [gap]

**The six MIR hashes**
- Not computable while the above is open. [Q]
- The draft file is not canonical text: trailing spaces and a doubled final line break. [fixed: trailing spaces removed in every freeze-ready text; each now ends with one line break, the final line break itself being question 12]
- "A specification whose text depends on them" cannot be checked (field 4 discovery only). [gap]

**The tasks table**
- Rule 7's "produce only what it allows" against tasks 6 and 7, whose cells describe duties; a verification rule's outputs (valid, invalid, pending, unknown) against tasks' other outputs; Identity task 1 also returning the module's hash; one cMIP per task per agreement against Identity task 3 ("per protocol") and Envelopes task 5 ("per type"); "Tasks 1 to 5 are tasks" circular; task 14's cMIP named in the abandonment clause's key 3; "the checker of the cMIP"; the profile's contents listed differently in rule 22 and Parameters. [gap]

**Other texts**
- Money "never depends on Development" against a Money-only client reading fields 11 and 13. [Q, with question 35]
- "May name any cMIP among its extensions" against Agreements forbidding a judge as an extension. [gap]
- The MICS glossary's "MOR 1 has none" against kind-8 MIPs publishable now. [fixed: "MOR 1's core has none"]
- MOR 2's starting drafts cloned from the MICS and labelled a MIP, against field 8 naming the MICS only for a new layer. [gap]
- Rule 13's example split summing to 9.20 on a sale of 10. [fixed: the publisher 1.80]
- Normative content in italics (several lines, rule 21 with no normal text at all); Part three "for reference" yet normative. [gap: listed in the report]

## 2. Terms used two ways

specification (document, content map, public act, field 9's text); kind (spec kind, rail kind, Agreements' `kind` and grant kinds); cMIP ("for one task" against several tasks, extensions and xtypes; "the payment cMIP" as if unique); Module (an "implementation or extension"; media module, media type, the Module that plays it); MIR (also a publication's media spec); MIP; task; extension (terms field 15, "under a MIR", RISC-V's M extension, field 10's "for an extension"); xtype; adoption (opt-in, a collective's adoption, the market); "implement", "adopt" and "hold" for what decides unknown; unknown; invalid; no specification; creator and publisher; publication; layer; rule; verification rule; profile. [In the glossary and the report's term question.]

## 3. Cross-references

- "Freeze test suite v30" not yet available to the reader. [suite: written]
- Freeze scenarios citing suite scenarios without step numbers. [suite: checked at v30]
- "(Agreements, rule 63)" for whose approval adopting or dropping an extension needs: it is rule 60. [fixed]
- "(Identity)" for a scheme "not adopted": Identity says "does not implement". [gap]
- Pointers outside the eight texts: the genesis repository and its check, the relay transport cMIP, founding seed Modules and air-gapped signers, founding cMIPs and reference implementations, the profile's test vectors, "a listing", "first wave". [as designed: named by role; the report lists them]

## 4. History left

The header line [as designed: the one-line header the prompt asks]; "(a reading, to confirm)" [Q: question 35]; "Still open" [Q: question 34]; type 15 retired [as designed]; "'RV32IM or RV64IM' would have been two machines" and the kind-4 arguments [kept: reasoning]; whitespace [fixed].
