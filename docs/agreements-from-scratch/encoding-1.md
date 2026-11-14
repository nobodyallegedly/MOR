# Agreements, from scratch: the encoding, first edition

14 November 2026. Written by Claude, for the MOR lead to take or change; not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

**Why this text exists** (the ledger's exchange "The encoding first", his words): "Maybe that should be properly defined first? We have the wording but not the actual code?", and "I think it’s best to do this properly first."

## In plain words

Draft 24 (`draft-24.md`) says what each act of Agreements carries: Terms say what is agreed; a Statement is anything else said within an agreement (an assent, a counter signature, a contest, or a kind a cMIP defines). It does not say how any of it is written as bytes. This text does, so that a test identity can write and sign the new acts, and anyone can check them.

The acts are written in the act format MOR already has (Envelopes, Part three): every act has an outside, which relays see, and a locked inside, which holds its specification, its type and its payload. A Terms act and a Statement are ordinary everyday acts, signed by one signer, under draft 24's own spec hash. Their payloads are small maps with numbered fields, in deterministic CBOR, closed: a field this text does not give makes the act rejected. A report, the shared language's block that draft 24 uses but does not define, is written the same way under the spec hash of the block's own proposal, and is a proposal like the block.

Every list that is a set is written in one order, so that two people who mean the same thing write the same bytes. A socket (a field where a cMIP plugs in) is the cMIP's spec hash and its parameters; an empty socket is the field left out. Parties are a list; authors and the receiver point into it by position.

A checker (`tools/agreements-check`) reads an act's bytes and answers **pass**, **rejected** (no Agreements act: it never reaches the grammar rules), **invalid** (an act whose bytes show by themselves that it cannot count, with the grammar rule named), **unknown**, **cannot open** or **not this encoding**, naming the rule. It does not give the grammar's answers (in force, fork, unchecked and so on): that is a later step.

Where draft 24 leaves a choice to the bytes and does not say which, this text chooses the simplest that fits the act format in force, and marks it **[lead]**: the MOR lead's to take or change. They are listed together in section 11. Where draft 24 is silent on a rule, not on its bytes, nothing is chosen: the question is listed in `encoding-1-report.md`.

## 1. How to read this text

The rules of this text are numbered E1 to E24. A rule of draft 24 is cited as draft 24 cites it (G2.1, section 3.1). An Envelopes or Identity rule is cited by its MIR. MUST and MAY are used as in RFC 2119. Formats are in CDDL, with the conventions of Identity, Part three, "Encoding and conventions" (closed maps; `? n => x` optional; `hash` is `bstr .size 32`; `[+ x]` one or more; `[* x]` zero or more; every `tstr` canonical text).

Draft 24 has three answers for an act that does not hold, and this text keeps them apart:

- **rejected**: draft 24's word (section 2, "Not an Agreements act") for bytes that never reach the grammar rules. The core calls this an act **invalid** as an act: outside its specification's format (MICS, "Common conventions"), or refused by the act format. A checker names the rule.
- **invalid**: draft 24's word for an act that is an act of this encoding and shows, by itself, that it cannot count (section 2, "invalid"). A checker names the grammar rule.
- **left unread**: a value draft 24 says is not read and changes nothing (G2.2, G5.2, G10.4). A checker gives a note.

## 2. The act

**E1. An everyday act.** Every act of this encoding is an everyday act of the act format in force (Envelopes, Part three, "The act"; Identity: every act other than a genesis, a rotation and a chain signature). Its outside MUST name its signer (field 0); its inside MUST carry `prev` with at most one entry (Envelopes rule 13), a position and a running summary as for any everyday act; it is signed by the signer's signing key over the act id. It MAY be public or private, and MAY be addressed (`to`) as any act. Bytes the act format refuses are rejected, named by the act format's rule (Envelopes rules 1, 2, 3, 5 and 13). A signature that does not verify over the act id with the key it carries is rejected (E1). A signature scheme the checker does not implement makes the act **unknown**, where no other rule fails (Identity, "Signature schemes"). *The checker verifies the signature with the key the act carries. That the key is the signer's at that point of its chain is the identity chain's to show (Identity, "Verification procedures"), and is not checked from one act's bytes.*

**E2. Spec hash and type.**

| Act | Spec hash | Type |
| --- | --- | --- |
| Terms | draft 24's, `SPEC_DRAFT_24` | 0 |
| Statement | draft 24's, `SPEC_DRAFT_24` | 1 |
| Report (a proposal) | the report block's third proposal's, `SPEC_REPORT_BLOCK_3` | 0 |

A spec hash is computed as the core computes a MIR's from its file (Development rule 26; `Spec::mir_file_hash` in the core library): `tagged_hash("MOR/spec", {0 => 4, 9 => text})`, where 4 is the kind of a MIR in Development's numbering, and `text` is the file's content with its final line break removed if it has one (only one; nothing else is removed), which must be canonical text. **[lead]**

- `SPEC_DRAFT_24` = `af5e41f9476deff36fb97397815b96293288d190f2fcf9e24d636465eefc0439`, of `docs/agreements-from-scratch/draft-24.md` as it stands on this branch.
- `SPEC_REPORT_BLOCK_3` = `99a3b2d6711c0541128e93c2d893b19f3eede2b9f24b9cdf40cc37d65a9a6d78`, of `docs/lead/proposals/report-block-3.md`.

Under `SPEC_DRAFT_24`, a type other than 0 or 1 is rejected; under `SPEC_REPORT_BLOCK_3`, a type other than 0. An act under any other spec hash is **not this encoding**. *The report is not draft 24's act type (draft 24, section 3.2: "It is one act type, defined once, in the shared language"); so it is not written under draft 24's hash. Once the block is written into a spec text, a report is written under that text's hash, and these bytes stay those of the proposal: nothing in MOR is updated.*

**E3. No `objects`, no `acks`.** An act of this encoding MUST NOT carry `objects` or `acks` in its inside; one that does is rejected. Its lines (an agreement's chain, by `replaces`; a signer's line within an agreement, by `previous`) and everything it names are in its payload, where draft 24 reads them. It MAY carry `refs` and a `hint`, which the act format says never decide anything (Envelopes rules 6 and 20); this encoding does not read them. **[lead]**

**E4. A closed map.** Each payload, and every map within it (a role), is a closed map whose keys are the small unsigned integers its format lists. A key it does not list, or one that is not an unsigned integer, makes the act rejected. *Draft 24's section 10, item 2, leaves the choice: "the bytes must allow a field they do not know, or say that they do not". These bytes say that they do not, as every format of the act format in force does. So G2.2's "a field section 3 does not give" cannot reach the grammar rules in these bytes: it is rejected first.* **[lead]**

## 3. The kinds of value

Draft 24, section 3: "Each field holds one kind of value". Each kind is written once, here.

**E5. A fingerprint** is `hash`: a byte string of exactly 32 bytes. A fingerprint field that holds anything else is rejected, save where draft 24 says it reaches the grammar rules (E7, E8, E10, and an entry of `relies_on`). What each fingerprint is of, and over which bytes, is in this table. A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is.

| Named | Its fingerprint | Over |
| --- | --- | --- |
| an act: a Terms act, a Statement, a report; a version; the root | its act id, `tagged_hash("MOR/act", outside)` | the act's encoded outside, which commits to its locked inside; the signature is not part of it (Envelopes, "How it fits together") |
| the root of an agreement | the act id of its first Terms act | as any act |
| a cMIP (in a socket, a K7 kind, a power's K7 kind) | its spec hash, `tagged_hash("MOR/spec", content)` | its specification's encoded content, as Development gives it for its kind (E2's map is that content for a MIR's text) |
| the body's words | the work hash, `tagged_hash("MOR/work", words)` **[lead]** | the words' bytes as they are; for text, its canonical text as UTF-8 |
| an envelope (`envelope`) | the bake's act id (the core's bake is draft 24's envelope: section 9, item 8) | as any act |
| the act of the envelope's chain cited (`envelope_at`) | that act's id: the bake's, where the Terms cite the bake; a transfer's otherwise | as any act |
| a settlement (`settlement`; a line's `by`) | the act id of the Money act that is the settlement (a receipt or a claim); never the payment's own id, where the two are different acts | as any act |
| a payment (a report's call) | the Money act's id | as any act |
| a role's `what` | a fingerprint its spot's cMIP (K5) reads | as that cMIP says |
| a signer (a party, `for`, a line's `to`) | the identity hash | its genesis |
| a unit (an amount) | the unit specification's spec hash, as Money writes an amount | its content |

**E6. An identifier** of a place or a clock is `hash`. What it is the hash of is the layer's that gives places and clocks (draft 24, section 8.1); no layer gives one yet. **[lead]** Anything else is rejected.

**E7. A socket** is a cMIP and its parameters, written as the act format writes them for a vow:

```cddl
socket = [ cmip: any, params: any ]   ; exactly two items
```

`params` is any value, which only that cMIP reads; a cMIP that takes none is given `null` (its parameters are still written: there is one form). **[lead]** An **empty socket is the field left out**: draft 24's defaults (G4.1, G4.11(e), one leg) then apply. A socket that is not an array of exactly two items is rejected. In Terms, a `cmip` that is not a fingerprint does not make the act rejected: it reaches the grammar rules, and the Terms are **invalid** (G2.1, G2.2).

**E8. The body** is the words and the socket of the cMIP that reads them (task K1):

```cddl
body = [ words: any, socket ]
```

Anything other than an array of two items, the second a socket, is rejected. `words` that are not a fingerprint make the Terms **invalid** (G2.1).

**E9. A party** is named in one of three ways, told apart by its first item:

```cddl
party = [0, signer: hash]   ; a signer, by identity hash
      / [1, role]           ; a role (E10)
      / [2, root: hash]     ; an agreement, by its root
```

Anything else is rejected.

**E10. A role.**

```cddl
role = {
  ? 0 => any,       ; kind: 0 done, 1 received, 2 holding, 3 fits, 4 future
  ? 1 => any,       ; what: a fingerprint (not read for kind 4)
  ? 2 => socket,    ; spot socket (task K5)
}
```

A role that is not a map is rejected; so is a key other than 0, 1 and 2 (E4), and a spot that is not a socket (E7). The three fields are optional in the bytes because draft 24 reads their lack as **invalid**, not as rejected (G10.1): a role with no kind, or a kind that is not an unsigned integer from 0 to 4, is read as lacking it; a role of any kind but 4 with no `what`, or a `what` that is not a fingerprint, is read as lacking it; a role with no spot socket lacks its cMIP; each makes the Terms invalid (G10.1). A spot whose `cmip` is not a fingerprint makes them invalid (G2.1). A `what` on a role of kind 4 is left unread (G10.4). **[lead]**: the words of section 10, item 1 (done, received, holding, fits, future) are written as numbers, as the act format writes its kinds.

**How a role is named** (section 10, item 4): by its position in `parties` (E13, E12). A role carries no label. **[lead]**

**E11. In whose name** (`for`), and **to whom** (a line of a report):

```cddl
who = [0, signer: hash] / [2, root: hash]
```

the same first items as E9; a role is never written here. Anything else is rejected.

**E12. The receiver** is one of these Terms' parties, by its position in `parties` (counting from 0), or another agreement, by its root:

```cddl
receiver = uint / hash
```

Anything else is rejected. A position (counting from 0) that names no party named as a signer or a role (beyond the list, or an agreement's entry) is read: draft 24 answers that no one receives by these Terms, **not shown** (G1.4); the checker gives it as a note. *To name an agreement as receiver, whether or not it is a party, its root is written.*

**E13. Authors** are positions in `parties`:

```cddl
authors = [+ uint]   ; sorted, each once (E18)
```

Positions count from 0, as in E12. An entry that is not an unsigned integer is rejected. A position beyond the list, or naming a party named as an agreement, makes the Terms **invalid** (G3.1: "an author who is not one of those parties makes them invalid").

**E14. A power** is its kind and its rule:

```cddl
power = [ kind: 0 / 1 / 2 / 3 / 4 / hash, rule: socket ]
; 0 assent, 1 counter_signature, 2 contest, 3 resolves, 4 replaces; hash: a K7 kind's cMIP
```

Anything else is rejected. Kind 4, `replaces`, is written so that G5.2's case can be: an entry of that kind gives no power and is left unread (a note), not rejected (G5.2: "An entry of `powers` of that kind gives no power; a verifier says that it left it unread"). **[lead]**

**E15. A Statement's kind:**

```cddl
kind = 0 / 1 / 2 / [ cmip: hash, params: any ]   ; assent, counter_signature, contest, or a K7 socket
```

Anything else is rejected, a K7 kind whose `cmip` is not a fingerprint included: the grammar rules give no invalid case for a Statement's kind, so that is a field of the wrong kind. A power's K7 kind (E14) matches a Statement's K7 kind where its hash is the socket's `cmip`. **[lead]**: a K7 kind is a socket, with parameters, as "every socket holds a cMIP by fingerprint, with its parameters" (section 3).

**E16. A call** (the report block's R1; section 10, item 7):

```cddl
call = [ task: 1..8, from: 0 / 1 / 2 ]   ; the task K1 to K8 by its number; 0 the doer, 1 the receiving side, 2 both
```

Anything else is rejected, a call carrying anything more included (a closed form: no token it does not know is read past). **One call per task**: two calls with the same task in one Terms act are rejected (the block's open point 1: per task). **[lead]** The payer's call made by default (G11.7) is not written at all: a payment holds it by default, and a report names it by naming the payment (E21). *Whether a call is attached to a task those Terms hold is the grammar's (G11.2: "left unread"), not the bytes'.*

**E17. `previous`** is written as the act format writes `prev`:

```cddl
previous = [] / [hash]   ; [] for none: the signer's first act in this agreement
```

Anything else is rejected. It is always written, in Terms and in Statements (draft 24: "`previous` | yes").

**E18. Lists.**

- **No empty list.** A list field holds one or more entries. A list with nothing in it is left out: absent means none (no power, no call, nothing relied on). An empty list is rejected. The one exception is `previous` (E17), which writes "none" as `[]`, as `prev` does.
- **Sets are sorted.** `authors`, `relies_on`, `powers`, `calls`, `answers`, `resolves`, and a report's `relies_on`, are sets: their entries are in the bytewise order of their deterministic encodings, as a map's keys are, and each entry appears once. An entry out of order, or twice, is rejected. Order carries no meaning in them. **[lead]**
- **Two lists keep the writer's order**, because positions in them are named: `parties` (by `authors` and `receiver`) and a report's `lines` (by a later line's `closes`). The same party twice in `parties` (the same bytes) is rejected; two roles that are meant as two seats differ in their bytes (in their spot's parameters, for instance), and a signer named directly and the same signer able to fill a role are two different entries.

**E19 and E20** are the presence rules of Terms and of a Statement (sections 4 and 5).

**Canonical text.** Every text string anywhere in an act, a socket's parameters and a Statement's content included, is canonical text: the act format already makes an act invalid whose inside holds one that is not (Envelopes rule 5).

## 4. Terms (type 0)

```cddl
terms = {
  ? 0 => hash,             ; replaces: the Terms act this one replaces
  ? 1 => hash,             ; agreement: the root; exactly when 0 is present
  ? 2 => [+ party],        ; parties, in the writer's order
  ? 3 => [+ uint],         ; authors: positions in parties
  ? 4 => body,             ; body: [words, socket] (K1)
  ? 5 => [+ any],          ; relies_on: fingerprints; an entry that is not one is left unread (G2.2)
  ? 6 => socket,           ; in_force (K2); absent: G4.1's default
  ? 7 => [+ power],        ; powers: [kind, rule] (K3)
  ? 8 => hash,             ; place, by identifier
  ? 9 => hash,             ; clock, by identifier
  ? 10 => uint / hash,     ; receiver: a position in parties, or another agreement's root
  ? 11 => hash,            ; envelope: the bake's act id
  ? 12 => hash,            ; envelope_at: the act of the envelope's chain these Terms cite
  ? 13 => socket,          ; condition (K4); absent: everyone who signed the original (G4.11(e))
  ? 14 => socket,          ; control (K6)
  ? 15 => [+ call],        ; calls
  ? 16 => socket,          ; data (K8); absent: one leg
  ? 17 => [+ hash],        ; resolves: every tip of a fork
  ? 18 => hash,            ; continues: one of the entries of 17
  19 => [] / [hash],       ; previous
}
```

The keys follow the order of draft 24's table (section 3.1). **E19. Presence.**

- `previous` (19) is required.
- `agreement` (1) is written exactly when `replaces` (0) is; one without the other is rejected.
- `envelope_at` (12) is written exactly when `envelope` (11) is; one without the other is rejected (section 3.1).
- `continues` (18) is written only beside `resolves` (17), and names one of its entries; otherwise rejected.
- `parties`, `authors` and `body` (2, 3, 4) are required, except in an act **written as a resolving update**, with both `resolves` and `continues`. This is a rule of the bytes only: whether the act in fact resolves a fork is the grammar's (G12.3), from other acts, and an act written so that resolves nothing is not rejected for lacking them. Nothing more is asked of its bytes here (see the report's questions on a resolving update). Terms with `resolves` and no `continues` "resolve nothing, and are read as an act like any other" (G12.3), so they need all three. **[lead]**
- Every other field is optional.

**What Terms show by themselves** (the checker answers **invalid**, the rule named):

- G2.1: the body's `words`, or the `cmip` of any socket of these Terms (the body's, `in_force`, a power's rule, `condition`, `control`, `data`, a role's spot), is not a fingerprint.
- G3.1: an author is not one of the parties named as signers or roles (E13).
- G4.2: a party is named by role, and `in_force` is absent.
- G10.1: a role lacks its kind, its `what` (but for kind future) or its spot socket, or holds a kind or `what` that is not one G10.1 allows (E10).

*Two cases of invalid in draft 24 about Terms that name an envelope (G14.3(a)) need the envelope's chain, which no layer gives yet (section 8.1): a checker of the bytes alone does not give them.*

**Notes the checker gives** (the act passes): an entry of `relies_on` that is not a fingerprint, left unread (G2.2); a power of kind `replaces`, left unread (G5.2); a `what` on a role of kind future, not read (G10.4); `resolves` with no `continues`, read as an act like any other (G12.3); a receiver that names no party named as a signer or a role, by which no one receives (G1.4, not shown).

## 5. Statement (type 1)

```cddl
statement = {
  0 => hash,               ; agreement: the root
  1 => hash,               ; terms: the Terms act it is made within
  2 => kind,               ; E15
  ? 3 => any,              ; content: as the kind requires
  ? 4 => who,              ; for: the person, or the agreement by its root
  ? 5 => hash,             ; under: the Terms giving the power
  6 => [] / [hash],        ; previous
  ? 7 => [+ hash],         ; answers
  ? 8 => [+ any],          ; relies_on: an entry that is not a fingerprint is left unread
  ? 9 => hash,             ; settlement: the Money act it is tied to
  ? 10 => [+ hash],        ; resolves
  ? 11 => hash,            ; continues: one of the entries of 10
}
```

**E20. Presence.**

- `agreement`, `terms`, `kind` and `previous` are required.
- `for` and `under` are written together, or neither.
- `content` is left out for an assent and a counter signature (section 3.2: "An assent's `content` is empty", and a counter signature's too); written there, the act is rejected. For a contest it is optional, any value, and not read by the grammar rules. For a K7 kind it is as that cMIP says: optional, any value. "By fingerprint or inline as the kind says": a fingerprint is written as `hash`, inline as any value; the bytes do not tell them apart, the kind's cMIP does. **[lead]**
- `continues` only beside `resolves`, and one of its entries, as for Terms.

A Statement shows no case of invalid by itself: the one draft 24 lists for a Statement (G6.1) needs the acts held (section 7).

## 6. The report (type 0 under the block's spec hash): a proposal

*Everything in this section is a proposal, as the report block is (`report-block-3.md`, the MOR lead's; draft 24, section 8.1). It is written so that draft 24's reports can be signed and checked; the block's own text may write them otherwise.*

```cddl
report = {
  0 => call-ref,           ; the call it answers
  ? 1 => [+ hash],         ; relies_on: the acts it relied on, beyond its call and its lines' acts
  ? 2 => [+ line],         ; lines, in the writer's order (K6's row)
}
call-ref = [ act: hash ]               ; a call made by default: the act that holds it (a payment), or the act standing for it (its settlement)
         / [ act: hash, task: 1..8 ]   ; a call written in Terms: those Terms' act id, and the task it is attached to
line = [0, amount, by: hash]                          ; received, with the act it came by
     / [1, amount, to: who, by: hash]                 ; passed on, to whom, with the act it went by
     / [1, amount, to: who, by: hash, closes: line-ref] ; the same, paying a still-owed line
     / [2, amount]                                    ; the doer's own part
     / [3, amount]                                    ; kept: a fee
     / [4, amount, to: who]                           ; still owed, to whom
amount = [ unit: hash, value: uint ]                  ; as Money writes an amount
line-ref = [ report: hash, line: uint ]               ; a report's act id, and a line's position in it
```

**E21. The report.** A report names the call it answers (the block's R2: "A report that names no call is no report"); one without it is rejected. It names **one call** (the block's R2 [3]; draft 24, section 3.2). The call's task, where written, is 1 to 8. It carries **no `previous`**: it stands in no line (section 3.2). Its signer is the act's signer, on its outside. `relies_on` is a set of fingerprints (E18). *The acts a report relied on are its call's act, each line's `by`, and `relies_on`: each is meant to be named in the field that says why it is named, and `relies_on` for the rest. The bytes do not refuse an act named in two of these fields, or two lines with the same `by`; neither is rejected.* **[lead]** *The checker cannot tell, from bytes, whether `[act]` names a payment or Terms: a report naming Terms without the task is not rejected.*

**E22. Lines** (K6's row). Each line is one of the five kinds, written in the six forms above (a passed-on line with or without `closes`); anything else is rejected, and so is an amount that is not `[unit, value]`, and a `closes` that is not `[report, line]`. A receiving side's confirmation is a report whose lines are received lines. **Two amounts match** where their bytes are the same: the same unit and the same value (G11.4(c)). **"Still owed" can be named** by a later line (section 8.2, item 15): by the report it was stated in and its position in that report's `lines`, counting from 0, which a later passed-on line names in `closes`. Whether that later line closes it is a K6 cMIP's, as draft 24 says; the bytes only let it be said.

## 7. Among the acts held: `previous` (G6.1)

**E23.** A checker handed several acts reads them as the acts a verifier holds. For each Terms act and Statement whose `previous` names an act among them, that act MUST be a Terms act or a Statement of this encoding, by the same signer (the outside's field 0), within the same agreement (a Statement's `agreement`; a Terms act's `agreement`, or, for the first Terms act, its own act id). Otherwise the act is **invalid** (G6.1). Where `previous` names no act held, the act counts and its signer's line is unchecked before it (G6.1): a note. Where its `previous` names nothing (`[]`), nothing is checked. *The act format's own `prev` is the signer's whole sequence; `previous` is the signer's line within one agreement. The two are different lines, and both are written.*

## 8. One signing, and building an act

**E24. One signing of an agreement** (G1.2; section 10, item 11). The core has no act signed by several at once (MICS: "One signer per act"). So an agreement that signs by all its signers signs by one act of each: Statements whose payloads have the same bytes under the keys 0 (`agreement`), 1 (`terms`), 2 (`kind`), 3 (`content`), 4 (`for`), 5 (`under`), 9 (`settlement`), 10 (`resolves`) and 11 (`continues`), a key absent in one being absent in the other; their `previous`, `answers` and `relies_on` may differ. Whether their signers are that agreement's signers is the grammar's.

**Building an act, ready to sign.** A client builds the payload (in the core library, `Terms::to_payload`, `Statement::to_payload`, `Report::to_payload`; in the WebAssembly binding, `agreementsNewTermsPayload`, `agreementsNewStatementPayload`, `agreementsNewReportPayload`), each of which writes sets in their order and refuses what would be rejected, naming the rule. The existing everyday act seals and signs it: `act::make` in the core, `makeEveryday` in the binding, with the spec hash and type of E2 (`agreementsNewSpecs`). The checker is `check` and `check_held` in the core, `agreementsNewCheck` and `agreementsNewCheckHeld` in the binding, and the command-line tool `tools/agreements-check`.

## 9. What the checker answers

For one act, in this order, the first failing step giving the answer (invalid beats unknown):

1. The bytes are an act of the act format: **rejected**, Envelopes rule 1 (or 2, 5).
2. It opens: a private act and no key, **cannot open** (Envelopes rule 10); the lock or the commitment fails, **rejected**, Envelopes rule 3; its inside's shape or text, **rejected**, Envelopes rule 1 or 5.
3. Its spec hash and type (E2): another spec, **not this encoding**; another type, **rejected**, E2.
4. An everyday act (E1, E3): no signer, **rejected**, E1; `prev` absent or of two entries, **rejected**, Envelopes rule 13; `objects` or `acks`, **rejected**, E3.
5. The signature (E1): does not verify, **rejected**, E1; a scheme not implemented, remembered.
6. The payload (E4 to E22): **rejected**, the rule named.
7. What the payload shows by itself (sections 4 and 5), and with several acts, E23: **invalid**; every case found is listed in `invalid`, and `rule` is the first of them, in the order of section 4's list (G2.1, then the roles' G10.1 and G2.1 by party, then G4.2, then G3.1), and G6.1 last.
8. A scheme not implemented: **unknown**, E1. Otherwise **pass**, with the notes.

Where an act is rejected for several reasons, the checker names the first it meets and stops; which one is not fixed by this text, so each rejected vector fails one rule only. **The answer is written** (the binding's and the tool's `--json`): `{ verdict, act, id, signer, rule, says, invalid: [{ rule, says }], notes: [{ rule, says }] }`, `verdict` one of `pass`, `rejected`, `invalid`, `unknown`, `cannot open`, `not this encoding`. These words are the checker's: the grammar's answer words (shown, not shown, fork, valid, not valid, unchecked, with their qualifiers) are written with the grammar verifier, later (section 10, item 15).

## 10. Draft 24's section 10, item by item

1. **Each field's kind.** E5 to E17: a fingerprint (E5), a list of fingerprints (E18), an identifier (E6), a socket (E7), and the words: a Statement's kind (E15), a power's kind (E14), a role's kind (E10), a call's "from whom" (E16), all as small unsigned integers. **Refused as shape** (rejected): every field holding another kind than its own, but for three that reach the grammar rules: a body's words or a socket's cMIP not a fingerprint (invalid, G2.1, E7, E8); a role's kind or `what` not one G10.1 allows (invalid, G10.1, E10); an entry of `relies_on` not a fingerprint (left unread, G2.2).
2. **Required and optional fields.** E19 and E20. `relies_on` "if anything else is used": whether something else was used is not in the bytes, so the field is optional and its lack is never refused. "None" for a first act's `previous` is `[]` (E17). A field section 3 does not give is rejected (E4): the bytes say that they do not allow it.
3. **Lists.** E18: the lists are `parties`, `authors`, `powers`, `calls`, `relies_on`, `answers`, `resolves`, and a report's `relies_on` and `lines`. Order matters only in `parties` and `lines`; the others are sorted. Duplicates are rejected. An empty list is never written: absent is the one form of "none", so an empty `powers` cannot be written, and no power is `powers` left out; an empty `data` socket is the field left out (one leg).
4. **The entries of `parties`.** E9 and E10, told apart by their first item. A role is named by `authors` and `receiver` by its position in `parties` (E12, E13).
5. **Fingerprints.** E5's table. One hash function, SHA-256, under the core's tags, which name the kinds apart (`MOR/act`, `MOR/spec`, `MOR/work`); an identity hash is a genesis's act id. A fingerprint is told from anything else by being a 32-byte byte string, in a field that holds one.
6. **`for` and `under`.** E11: `[0, identity]` or `[2, root]`. The core's act format has no `for`: it is this payload's field.
7. **A call.** E16: `[task, from]` in `calls`, nothing more, one per task. The payer's call made by default is not written (G11.7): a report names it by naming the payment, or its settlement (E21).
8. **A report.** Section 6, a proposal: the call it answers by `[act]` or `[act, task]`, its `relies_on`, its signer on the outside, one call, no `previous`; the lines of K6's row, each with its amount and the act it came or went by; "still owed" named by `[report, line]`. Written under the block's own proposal's hash, so that Agreements' encoding only refers to it (E2).
9. **An amount.** As Money writes one, `[unit, value]` (Money, "amount"); two match where their bytes are the same (E22).
10. **A payment and a settlement.** Money's acts, named by act id (E5). How a payment names the version it read is Money's to say, and so is whether two settlements are "of the same payment" (G11.4(b)): that is Money's answer, handed to the grammar verifier, not in these bytes. A confirmation names the payment, or its settlement, as its call (E21). The buyer's assent and the payment are **two acts** (one signer per act; the assent is a Statement of this encoding, the payment a Money act); a verifier finds the payer's assent to the version a payment names as a Statement of kind assent, signed by the payment's signer, whose `terms` is that version.
11. **Signatures by several people.** None: one act by each signer, matched as E24 says.
12. **The parts for machines of a body.** A cMIP's output, not bytes of an act: not fixed here. Each socket's output is written with the grammar verifier and the stub cMIPs (section 9, item 3, of draft 24).
13. **The place's answer, the clock's answer, an envelope and its chain.** Another layer's (section 8.1); not fields of these acts. This encoding writes only `place` and `clock` as identifiers (E6), and `envelope` and `envelope_at` as act ids (E5). No layer gives a transfer act yet, so no checker can tell from bytes that `envelope_at` names an act of the envelope's chain, but where it names the bake itself (`envelope_at` equal to `envelope`). The checker gives no answer about `envelope_at` either way: such Terms pass, with no note.
14. **What a verifier is told** (on whose behalf it reads, which anchoring it accepts): not in an act's bytes; the grammar verifier's input, later.
15. **The answer words.** The checker's answers are written in section 9; the only "who said it" the checker gives is the act's signer. The grammar's answers, their qualifiers and the rule named, are written with the grammar verifier, later.
16. **Limits on untrusted input.** None beyond the act format's: no data item deeper than 128 levels (Envelopes rule 2). No size of an act, a field or a list is fixed; relays and homes set their own policy, as for every act. The depths at which a verifier stops following (G9.2; P2, P8) are the grammar verifier's, and not in these bytes; the checker follows nothing beyond one `previous`. The vectors rely on no limit.
17. **Vectors for a late update.** No new field: the namings are in the bytes (`replaces`, `previous`, `answers`, `relies_on`, `terms`, `under`, `settlement`). Those vectors are the grammar's, with its verifier.
18. **Vectors for the baker's rights.** They need the envelope's chain, which no layer gives yet (item 13): not written. This encoding gives the bytes of Terms that name an envelope and cite an act of its chain (E19).
19. **The field `envelope_at`.** One fingerprint, the act id of the bake or of a transfer of the envelope's chain (E5), key 12, written exactly when `envelope` is (E19). Telling that it is of that envelope's chain is the layer below's (item 13). Its name stays draft 24's.

## 11. The choices marked [lead]

Each is the simplest that fits the act format in force, and each is the MOR lead's to take or change.

1. The spec hash of draft 24 is computed as the core computes a MIR's (E2).
2. The report is written under the block's third proposal's spec hash, not draft 24's (E2).
3. No `objects` and no `acks` (E3).
4. Closed maps: an unknown field is rejected, so G2.2's unknown field never reaches the grammar (E4).
5. The body's words are named by work hash (E5).
6. A place and a clock are named by a 32-byte identifier (E6).
7. A socket is `[cmip, params]`, its parameters always written, `null` for none; an empty socket is the field left out (E7).
8. The words of draft 24 (kinds, from whom) are written as small numbers (E10, E14, E15, E16).
9. A role is named by its position in `parties`, and carries no label (E10, E12, E13).
10. A power of kind `replaces` is written (4), and left unread (E14).
11. A K7 kind is a socket, with parameters (E15).
12. One call per task (E16).
13. Sets are sorted, each entry once; an empty list is never written (E18).
14. A Terms act with `resolves` and no `continues` needs parties, authors and body (E19).
15. A contest's content, and a K7 kind's, is any value, by fingerprint or inline (E20).
16. A report names one call, by `[act]` or `[act, task]`, and each act it relied on once (E21).
17. "Still owed" is named by `[report, line]`, and a passed-on line may name it in `closes` (E22).
