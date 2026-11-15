# Agreements, from scratch: the encoding, second edition

15 November 2026. Written by Claude, for the MOR lead to take or change; not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

**Why this text exists** (the ledger's exchange "The encoding first", his words): "Maybe that should be properly defined first? We have the wording but not the actual code?", and "I think it’s best to do this properly first." **Why a second edition** (the ledger's exchange "Clean up first", his words): "How many sessions to clean it up first? We can always provide new hashes."

## In plain words

Draft 25 (`draft-25.md`) says what each act of Agreements carries: Terms say what is agreed; a Statement is anything else said within an agreement (an assent, a counter signature, a contest, a resolve, or a kind a cMIP defines). This text says how each is written as bytes, so that a test identity can write and sign the new acts, and anyone can check them. It is `encoding-1.md` brought to draft 25: the same bytes, but for the places where two honest writers could write one act two ways, which are closed (section 12 lists them). `encoding-1.md` stays as it was, for history; acts written under its spec hashes are not acts of this encoding.

The acts are written in the act format MOR already has (Envelopes, Part three): every act has an outside, which relays see, and a locked inside, which holds its specification, its type, its payload, and its place in its signer's sequence. A Terms act and a Statement are ordinary everyday acts, signed by one signer, under draft 25's own spec hash. Their payloads are small maps with numbered fields, in deterministic CBOR, closed: a field this text does not give makes the act rejected. A report, the shared language's block that draft 25 uses but does not define, is written the same way under the spec hash of the block's own fourth proposal, and is a proposal like the block.

Every list that is a set is written in one order, so that two people who mean the same thing write the same bytes. A socket (a field where a cMIP plugs in) is the cMIP's spec hash and its parameters; an empty socket is the field left out. Parties are a list; authors point into it by position. The receiver says, in its first item, whether it names a party by position or an agreement by its root.

**What these two texts do not give, and a writer must still take elsewhere.** The act around the payload: its outside, its lock, its `prev`, position and running summary (Envelopes, Part three, "The act", "Sequences", "The running summary"); the signer's identity, its genesis, and the binding that ties the signing key to it (Identity, sections 1 and 2, and Part three); `tagged_hash` and canonical text (Identity, "Encoding and conventions"). A cMIP's spec hash (Development). An amount's unit and value (Money). Use the library's builders and `makeEveryday`, which write all of it (section 8).

A checker (`tools/agreements-check`) reads an act's bytes and answers **pass**, **rejected** (no Agreements act: it never reaches the grammar rules), **invalid** (an act whose bytes show by themselves that it cannot count, with the grammar rule named), **unknown**, **cannot open** or **not this encoding**, naming the rule. It does not give the grammar's answers (in force, fork, unchecked and so on): that is a later step.

Where draft 25 leaves a choice to the bytes and does not say which, this text chooses the simplest that fits the act format in force, and marks it **[lead]**: the MOR lead's to take or change. They are listed together in section 11.

## 1. How to read this text

The rules of this text are numbered E1 to E24, as in the first edition; a rule keeps its number where it says the same thing, and its changes are listed in section 12. A rule of draft 25 is cited as draft 25 cites it (G2.1, section 3.1). An Envelopes or Identity rule is cited by its MIR. MUST and MAY are used as in RFC 2119. Formats are in CDDL, with the conventions of Identity, Part three, "Encoding and conventions" (closed maps; `? n => x` optional; `hash` is `bstr .size 32`; `[+ x]` one or more; `[* x]` zero or more; every `tstr` canonical text).

Draft 25 has three answers for an act that does not hold, and this text keeps them apart:

- **rejected**: draft 25's word (section 2, "Not an Agreements act") for bytes that never reach the grammar rules. The core calls this an act **invalid** as an act: outside its specification's format (MICS, "Common conventions"), or refused by the act format. A checker names the rule.
- **invalid**: draft 25's word for an act that is an act of this encoding and shows, by itself, that it cannot count (section 2, "invalid"). A checker names the grammar rule.
- **left unread**: a value draft 25 says is not read and changes nothing (G2.2 lists them all: an entry of `relies_on` that is not a fingerprint; a power of kind `replaces`, G5.2; a call in Terms that do not hold its task, G11.2; a `what` on a role of kind future, G10.4). A checker gives a note for each of these its bytes show: all but the call, since whether Terms hold a call's task needs their body's cMIP, the grammar verifier's (E16).

## 2. The act

**E1. An everyday act.** Every act of this encoding is an everyday act of the act format in force (Envelopes, Part three, "The act"; Identity: every act other than a genesis, a rotation and a chain signature). Its outside MUST name its signer (field 0) and the binding of its signing key (Identity, rule 5); it is signed by that key over the act id. It MAY be public or private, and MAY be addressed (`to`) as any act. Bytes the act format refuses are rejected, named by the act format's rule (Envelopes rules 1, 2, 3, 5 and 13). A signature that does not verify over the act id with the key it carries is rejected (E1). A signature scheme the checker does not implement makes the act **unknown**, where no other rule fails (Identity, "Signature schemes"). *The checker verifies the signature with the key the act carries. That the key is the signer's at that point of its chain is the identity chain's to show (Identity, "Verification procedures"), and is not checked from one act's bytes.*

**Its place in the signer's sequence.** Its inside MUST carry `prev`, a position and a running summary, as every everyday act does (Envelopes rule 13): the act is the next of **all** its signer's everyday acts, whatever specification they are under, not of its acts in one agreement. `prev` names the signer's act before it, and is `[]` only for the signer's very first everyday act; the position counts from 1; the running summary is `S(p − 1)`, over every act before it (Envelopes, "The running summary"). The checker refuses an absent `prev`, or one of two entries, and checks nothing else of the sequence, as Envelopes says (position and summary are judged where a whole line is held). *A writer who copies a first act's `[]`, 1 and 32 zero bytes into a later act forks their own sequence: the signer's sequence is one line, kept across every act it signs, on every device. The payload's `previous` (E17) is another line: the signer's acts within one agreement. Both are written.*

**E2. Spec hash and type.**

| Act | Spec hash | Type |
| --- | --- | --- |
| Terms | draft 25's, `SPEC_DRAFT_25` | 0 |
| Statement | draft 25's, `SPEC_DRAFT_25` | 1 |
| Report (a proposal) | the report block's fourth proposal's, `SPEC_REPORT_BLOCK_4` | 0 |

A spec hash is computed as the core computes a MIR's from its file (Development rule 26; `Spec::mir_file_hash` in the core library): `tagged_hash("MOR/spec", {0 => 4, 9 => text})`, where 4 is the kind of a MIR in Development's numbering, and `text` is the file's content with its final line break removed if it has one (only one; nothing else is removed), which must be canonical text. **[lead]**

- `SPEC_DRAFT_25` = `dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c`, of `docs/agreements-from-scratch/draft-25.md`.
- `SPEC_REPORT_BLOCK_4` = `7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854`, of `docs/lead/proposals/report-block-4.md`.

**Said aloud** (draft 25, its head): each hash is of its file **as published on its branch** (`claude/agreements-clean-1-hahuwn`). A writer uses the hash as given here, never one recomputed from a copy of their own: one changed byte in a copy is another specification. Acts written under a hash stay that text's, whatever is written later; a later draft is a new specification with a hash of its own, and nothing written under this one is updated. Encoding 1's hashes (draft 24's, `af5e41f9…`, and the third proposal's, `99a3b2d6…`) name another specification: an act under them is **not this encoding**.

Under `SPEC_DRAFT_25`, a type other than 0 or 1 is rejected; under `SPEC_REPORT_BLOCK_4`, a type other than 0. An act under any other spec hash is **not this encoding**. *The report is not draft 25's act type (draft 25, section 3.2: "It is one act type, defined once, in the shared language"); so it is not written under draft 25's hash. Once the block is written into a spec text, a report is written under that text's hash and type, and these bytes stay those of the proposal: nothing in MOR is updated.*

**E3. No `objects`, no `acks`.** An act of this encoding MUST NOT carry `objects` or `acks` in its inside; one that does is rejected. Its lines (an agreement's chain, by `replaces`; a signer's line within an agreement, by `previous`) and everything it names are in its payload, where draft 25 reads them. It MAY carry `refs` and a `hint`, which the act format says never decide anything (Envelopes rules 6 and 20); this encoding does not read them. **[lead]**

**E4. A closed map.** Each payload, and every map within it (a role), is a closed map whose keys are the small unsigned integers its format lists. A key it does not list, or one that is not an unsigned integer, makes the act rejected. *Draft 25 says the same (section 3, G2.2): a field section 3 does not give makes the act rejected, and is never left unread.*

## 3. The kinds of value

Draft 25, section 3: "Each field holds one kind of value". Each kind is written once, here.

**E5. A fingerprint** is `hash`: a byte string of exactly 32 bytes. A fingerprint field that holds anything else is rejected, save where draft 25 says it reaches the grammar rules (E7, E8, E10, and an entry of `relies_on`). What each fingerprint is of, and over which bytes, is in this table. A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is.

| Named | Its fingerprint | Over |
| --- | --- | --- |
| an act: a Terms act, a Statement, a report; a version; the root | its act id, `tagged_hash("MOR/act", outside)` | the act's encoded outside, which commits to its locked inside; the signature is not part of it (Envelopes, "How it fits together") |
| the root of an agreement | the act id of its first Terms act | as any act |
| a cMIP (in a socket, a K7 kind, a power's K7 kind) | its spec hash, `tagged_hash("MOR/spec", content)` | its specification's encoded content, as Development gives it for its kind (E2's map is that content for a MIR's text) |
| the body's words | the work hash, `tagged_hash("MOR/work", words)` **[lead]** | the words' bytes themselves, as they are, not wrapped in CBOR; for text, its canonical text as UTF-8 |
| an envelope (`envelope`) | the bake's act id (the core's bake is draft 25's envelope: section 9, item 8) | as any act |
| the act of the envelope's chain cited (`envelope_at`) | that act's id: the bake's, where the Terms cite the bake (then `envelope` and `envelope_at` are equal, draft 25, section 3.1); a transfer's otherwise | as any act |
| a settlement (`settlement`; a line's `by`; a report's call made by default) | the act id of the Money act that is the settlement (a receipt or a claim), the act both sides can see; never the payment's own id, where the two are different acts (draft 25, G11.7, G11.8) | as any act |
| a role's `what` | a fingerprint its spot's cMIP (K5) reads | as that cMIP says |
| a signer (a party, `for`, a line's `to`) | the identity hash | its genesis |
| a unit (an amount) | the unit specification's spec hash, as Money writes an amount | its content |

**E6. An identifier** of a place or a clock is `hash`. What it is the hash of is the layer's that gives places and clocks (draft 25, section 8.1); no layer gives one yet, and these 32 bytes are kept until one does: a richer form (a chain and a position, a set of witnesses) will be a new specification. **[lead]** Anything else is rejected.

**E7. A socket** is a cMIP and its parameters, written as the act format writes them for a vow:

```cddl
socket = [ cmip: any, params: any ]   ; exactly two items
```

`params` is any value, which only that cMIP reads; a cMIP that takes none is given `null` (its parameters are still written: there is one form). **[lead]** An **empty socket is the field left out**: draft 25's defaults (G4.1, G4.11(e), one leg) then apply. A socket that is not an array of exactly two items is rejected: a socket written as a bare text address is rejected, not invalid (draft 25, section 3). In Terms, a `cmip` that is not a fingerprint, in that place of a socket, does not make the act rejected: it reaches the grammar rules, and the Terms are **invalid** (G2.1).

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

Anything else is rejected, under E9: a party `[0, "A"]` (a signer not named by a fingerprint) is rejected under E9, the rule that gives a party's form, and not under E5 (section 9, "One fault, one rule").

**E10. A role.**

```cddl
role = {
  ? 0 => any,       ; kind: 0 done, 1 received, 2 holding, 3 fits, 4 future
  ? 1 => any,       ; what: a fingerprint (not read for kind 4)
  ? 2 => socket,    ; spot socket (task K5)
}
```

A role whose kind is lacking or not one of the five is not of kind 4: its `what` is read as for any other kind, so a role with a bad kind and no `what` shows G10.1 twice. A role that is not a map is rejected; so is a key other than 0, 1 and 2 (E4), and a spot that is not a socket (E7). The three fields are optional in the bytes because draft 25 reads their lack as **invalid**, not as rejected (G10.1): a role with no kind, or a kind that is not an unsigned integer from 0 to 4, is read as lacking it; a role of any kind but 4 with no `what`, or a `what` that is not a fingerprint, is read as lacking it; a role with no spot socket lacks its cMIP; each makes the Terms invalid (G10.1). A spot whose `cmip` is not a fingerprint makes them invalid (G2.1). A `what` on a role of kind 4 is left unread (G10.4). **[lead]**: the words of section 10, item 1 (done, received, holding, fits, future) are written as numbers, as the act format writes its kinds.

**How a role is named** (section 10, item 4): by its position in `parties` (E13, E12). A role carries no label. **[lead]**

**E11. In whose name** (`for`), and **to whom** (a line of a report):

```cddl
who = [0, signer: hash] / [2, root: hash]
```

the same first items as E9; a role is never written here. Anything else is rejected.

**E12. The receiver** names one of these Terms' parties, by its position, or an agreement, by its root, and says which in its first item:

```cddl
receiver = [0, position: uint]   ; one of these Terms' parties named as a signer or a role, by its position in parties (counting from 0)
         / [2, root: hash]       ; an agreement, by its root, whether or not it is one of the parties
```

Anything else is rejected, under E12: a bare number or a bare hash (encoding 1's forms), `[0, h]` with `h` a hash (a signer is named by its position, never by its identity hash), and any other first item. A position that names a party named as an agreement is **rejected**, the checker naming E12 (draft 25, G1.3, gives the reason; a rejected act never reaches the grammar rules): an agreement is named as receiver by its root, `[2, root]`. A position beyond the list is read: draft 25 answers that no one receives by these Terms, **not shown** (G1.4); the checker gives it as a note. **[lead]**: the first items 0 and 2 are E11's, "a party of ours" and "an agreement".

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

Anything else is rejected, a kind written as text included (a power's kind that is neither one of its words nor a fingerprint: draft 25, section 3). Kind 4, `replaces`, is written so that G5.2's case can be: an entry of that kind gives no power and is left unread (a note), not rejected (G5.2). **[lead]** **What a power is for** (draft 25, section 3.1): kind 0, 1 and 2 for a Statement of that kind; kind 3, `resolves`, for a resolving update: in a signer's line, a Statement of kind 3, `resolve` (E15); for a fork of Terms, a Terms act written as a resolving update whose `replaces` names the Terms that give the power; a hash, for every Statement whose K7 kind's `cmip` is that hash, whatever its parameters. Two entries of one kind, with different rules, are two entries of the set (E18): an act of that kind binds where any one of their rules says yes (G5.1(b)). Which power a verifier reads is the grammar's; the checker reads none.

**E15. A Statement's kind:**

```cddl
kind = 0 / 1 / 2 / 3 / [ cmip: hash, params: any ]   ; assent, counter_signature, contest, resolve, or a K7 socket
```

Anything else is rejected, a K7 kind whose `cmip` is not a fingerprint included: the grammar rules give no invalid case for a Statement's kind, so that is a field of the wrong kind. Kind 3, **resolve**, is a resolving update in its signer's own line and nothing more (draft 25, section 3.2; E20). A K7 kind is its cMIP, whatever its parameters: a power's K7 kind (E14) matches it where its hash is the socket's `cmip`. **[lead]**: a K7 kind is a socket, with parameters, as "every socket holds a cMIP by fingerprint, with its parameters" (section 3).

**E16. A call** (the report block's R1; section 10, item 7):

```cddl
call = [ task: 1..8, from: 0 / 1 / 2 ]   ; the task K1 to K8 by its number; 0 the doer, 1 the receiving side, 2 both
```

Anything else is rejected, a call carrying anything more included (a closed form: no token it does not know is read past). **One call per task**: two calls with the same task in one Terms act are rejected (the block's open point 1: per task). **[lead]** The payer's call made by default (G11.7) is not written at all: a payment holds it by default, and a report names it by naming the payment's settlement (E21). *Whether a call is attached to a task those Terms hold is the grammar's (G11.2: "left unread"), not the bytes'.*

**E17. `previous`** is written as the act format writes `prev`:

```cddl
previous = [] / [hash]   ; [] for none: the signer's first act in this agreement
```

Anything else is rejected. It is always written, in Terms and in Statements (draft 25: "`previous` | yes"). It names the signer's act before this one **within the same agreement** (G6.1), whatever kind it is, but for a resolving update: a resolve, and a Terms act written as a resolving update, name **the shared act** both tips follow (G12.3), not either tip. **The author's first act** (draft 25, section 3.2): the first Terms act is its signer's first act within its agreement, so that signer's assent to it, and any next act of theirs there, names it, or the act after it, in `previous`; never `[]`. A party with no act in the agreement yet writes `[]`.

**E18. Lists.**

- **No empty list.** A list field holds one or more entries. A list with nothing in it is left out: absent means none (no power, no call, nothing relied on). An empty list is rejected. The one exception is `previous` (E17), which writes "none" as `[]`, as `prev` does.
- **Sets are sorted.** `authors`, `relies_on`, `powers`, `calls`, `answers`, `resolves`, and a report's `relies_on`, are sets: their entries are in the bytewise lexicographic order of their deterministic encodings (byte by byte, a shorter encoding first where it is a prefix of a longer one), and each entry appears once. An entry out of order, or twice, is rejected. Order carries no meaning in them. **[lead]**
- **Two lists keep the writer's order**, because positions in them are named: `parties` (by `authors` and `receiver`) and a report's `lines` (by a later line's `closes`). The same party twice in `parties` (the same bytes) is rejected: a spot that several fill is **one role, filled more than once** (draft 25, section 3.1; G10.2), not two identical roles. A signer named directly and the same signer able to fill a role are two different entries.
- **Named in two fields.** An act named in `relies_on` that another field of the same act also names is read once, as one naming, and is not rejected (draft 25, section 3.2); the same holds for a report (E21).

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
  ? 10 => receiver,        ; [0, position] / [2, root] (E12)
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

The keys follow the order of draft 25's table (section 3.1). **E19. Presence.**

- `previous` (19) is required.
- `agreement` (1) is written exactly when `replaces` (0) is; one without the other is rejected.
- `envelope_at` (12) is written exactly when `envelope` (11) is; one without the other is rejected (section 3.1).
- `continues` (18) is written only beside `resolves` (17), and names one of its entries; otherwise rejected.
- **A resolving update** is a Terms act written with both `resolves` and `continues`. It carries `replaces` and `agreement` (0, 1), `resolves` and `continues` (17, 18) and `previous` (19); it MAY carry `relies_on` (5); it carries **nothing else**. One that lacks `replaces`, or carries any other field (`parties`, `authors`, `body`, `in_force`, the receiver, a socket, anything), is rejected (draft 25, section 3.2: "What a resolving update carries"). This is a rule of the bytes only: whether the act in fact resolves a fork is the grammar's (G12.3), from other acts, and an act written so that resolves nothing is read as G12.3 says, and is not rejected after the fact.
- `parties`, `authors` and `body` (2, 3, 4) are required in every other Terms act. Terms with `resolves` and no `continues` "resolve nothing, and are read as an act like any other" (G12.3), so they need all three.
- Every other field is optional.

**What Terms show by themselves** (the checker answers **invalid**, the rule named), in this order, which is draft 25's (section 2, "invalid"):

1. G2.1: the body's `words`, then the `cmip` of the body's socket, of `in_force`, of `condition`, of `control`, of `data`, and of each power's rule (in the order of `powers`), is not a fingerprint.
2. For each role in `parties`, in their order: G10.1, its kind lacking or not one of the five; then G10.1, its `what` lacking or not a fingerprint (but for kind future); then G10.1, its spot socket lacking, or G2.1, its spot's `cmip` not a fingerprint (E10).
3. G4.2: a party is named by role, and `in_force` is absent.
4. G3.1: an author is not one of the parties named as signers or roles (E13), in the order of `authors`.

*Two cases of invalid in draft 25 about Terms that name an envelope (G14.3(a)) need the envelope's chain, which no layer gives yet (section 8.1): a checker of the bytes alone does not give them.*

**Notes the checker gives** (the act passes): an entry of `relies_on` that is not a fingerprint, left unread (G2.2); a power of kind `replaces`, left unread (G5.2); a `what` on a role of kind future, not read (G10.4); `resolves` with no `continues`, read as an act like any other (G12.3); a receiver whose position is beyond the parties, by which no one receives (G1.4, not shown).

## 5. Statement (type 1)

```cddl
statement = {
  0 => hash,               ; agreement: the root
  1 => hash,               ; terms: the Terms act it is made within
  2 => kind,               ; E15
  ? 3 => any,              ; content: as the kind requires; never for 0, 1 or 3
  ? 4 => who,              ; for: the person, or the agreement by its root
  ? 5 => hash,             ; under: the Terms giving the power
  6 => [] / [hash],        ; previous
  ? 7 => [+ hash],         ; answers
  ? 8 => [+ any],          ; relies_on: an entry that is not a fingerprint is left unread
  ? 9 => hash,             ; settlement: the Money act it is tied to
  ? 10 => [+ hash],        ; resolves: exactly for kind 3
  ? 11 => hash,            ; continues: one of the entries of 10; exactly for kind 3
}
```

**E20. Presence.**

- `agreement`, `terms`, `kind` and `previous` are required.
- `for` and `under` are written together, or neither.
- `content` is left out for an assent, a counter signature and a resolve (draft 25, section 3.2: "An assent's `content` is empty", and a counter signature's and a resolve's too); written there, the act is rejected. For a contest it is optional, any value, and not read by the grammar rules. For a K7 kind it is as that cMIP says: optional, any value. "By fingerprint or inline as the kind says": a fingerprint is written as `hash`, inline as any value; the bytes do not tell them apart, the kind's cMIP does. **[lead]**
- **A resolve** (kind 3) carries `resolves` and `continues`, `continues` one of the entries of `resolves`; one that lacks either is rejected. No Statement of another kind carries `resolves` or `continues`: one that does is rejected (draft 25, section 3.2: a resolving update is not also an assent, a counter signature, a contest or another kind). So, for a Statement, `resolves` without `continues` cannot be written. A resolve MAY carry `for` and `under` (made under a power of kind `resolves`, G12.4: its `for` names the signer whose line forked, its `previous` is its own signer's), `answers`, `relies_on` and `settlement`, as any Statement may.
- `continues` only beside `resolves`, and one of its entries, as for Terms.

A Statement shows no case of invalid by itself: the one draft 25 lists for a Statement (G6.1) needs the acts held (section 7).

## 6. The report (type 0 under the block's spec hash): a proposal

*Everything in this section is a proposal, as the report block is (`report-block-4.md`, the MOR lead's; draft 25, section 8.1). It is written so that draft 25's reports can be signed and checked; the block's own text may write them otherwise.*

```cddl
report = {
  0 => call-ref,           ; the call it answers
  ? 1 => [+ hash],         ; relies_on: the acts it relied on, beyond its call and its lines' acts
  ? 2 => [+ line],         ; lines, in the writer's order (K6's row)
}
call-ref = [ act: hash ]               ; a call made by default: the act that stands for it; for a payment, its settlement
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

**E21. The report.** A report names the call it answers (the block's R2: "A report that names no call is no report"); one without it is rejected. It names **one call** (the block's R2 [3]; draft 25, section 3.2). For a call made by default, it names the act that stands for it (the block's R2 [4]; draft 25, G11.7): **for a payment, always the settlement the payment names, the act both sides can see, never the payment itself**, so that two confirmations of one payment name the same act. The call's task, where written, is 1 to 8. It carries **no `previous`**: it stands in no line (section 3.2), though, as an everyday act, it stands in its signer's sequence (E1). Its signer is the act's signer, on its outside. `relies_on` is a set of fingerprints (E18). *The acts a report relied on are its call's act, each line's `by`, and `relies_on`: each is meant to be named in the field that says why it is named, and `relies_on` for the rest. An act named in two of these fields is read once (E18), and two lines with the same `by` are not refused.* **[lead]** *The checker cannot tell, from bytes, whether `[act]` names a settlement or Terms: a report naming Terms without the task is not rejected.*

**E22. Lines** (K6's row). Each line is one of the five kinds, written in the six forms above (a passed-on line with or without `closes`); anything else is rejected, and so is an amount that is not `[unit, value]`, and a `closes` that is not `[report, line]`. A receiving side's confirmation is a report whose lines are received lines. **Two amounts match** where their bytes are the same: the same unit and the same value (G11.4(c)). **"Still owed" can be named** by a later line (section 8.2, item 15): by the report it was stated in and its position in that report's `lines`, counting from 0, which a later passed-on line names in `closes`. Whether that later line closes it is a K6 cMIP's, as draft 25 says; the bytes only let it be said.

## 7. Among the acts held: `previous` (G6.1)

**E23.** A checker handed several acts reads them as the acts a verifier holds. For each Terms act and Statement whose `previous` names an act among them:

- where that act opens and is a Terms act or a Statement of this encoding, by the same signer (the outside's field 0), within the same agreement (a Statement's `agreement`; a Terms act's `agreement`, or, for the first Terms act, its own act id), nothing is found;
- where that act is held and **cannot be opened** (a private act held without its key), what it is cannot be read: the act counts, its signer's line is **unchecked** before it (G6.1, G9), a note, and the act is **not invalid**;
- otherwise the act is **invalid** (G6.1): `previous` names an act of another signer, an act within another agreement, a report, an act of another specification, or an act held that is **rejected** (a record that is no Terms act and no Statement, draft 25, G6.1).

Where `previous` names no act held, the act counts and its signer's line is unchecked before it (G6.1): a note. Where its `previous` names nothing (`[]`), nothing is checked. *Whether two acts are a fork (two acts of one signer naming the same `previous`, G6.2) is the grammar's, and the checker does not answer it: it passes both tips.*

## 8. One signing, and building an act

**E24. One signing of an agreement** (G1.2; section 10, item 11). The core has no act signed by several at once (MICS: "One signer per act"). So an agreement that signs by all its signers signs by one act of each: Statements whose payloads have the same bytes under the keys 0 (`agreement`), 1 (`terms`), 2 (`kind`), 3 (`content`), 4 (`for`), 5 (`under`), 9 (`settlement`), 10 (`resolves`) and 11 (`continues`), a key absent in one being absent in the other; their `previous`, `answers` and `relies_on` may differ. Whether their signers are that agreement's signers is the grammar's.

**Building an act, ready to sign.** A client builds the payload (in the core library, `Terms::to_payload`, `Statement::to_payload`, `Report::to_payload`; in the WebAssembly binding, `agreementsNewTermsPayload`, `agreementsNewStatementPayload`, `agreementsNewReportPayload`), each of which writes sets in their order and refuses what would be rejected, naming the rule. The existing everyday act seals and signs it, with its place in the signer's sequence: `act::make` in the core, `makeEveryday` in the binding (given the signer's sequence so far), with the spec hash and type of E2 (`agreementsNewSpecs`). The checker is `check` and `check_held` in the core, `agreementsNewCheck` and `agreementsNewCheckHeld` in the binding, and the command-line tool `tools/agreements-check`.

## 9. What the checker answers

For one act, in this order, the first failing step giving the answer (invalid beats unknown):

1. The bytes are an act of the act format: **rejected**, Envelopes rule 1 (or 2, 5).
2. It opens: a private act and no key, **cannot open** (Envelopes rule 10); the lock or the commitment fails, **rejected**, Envelopes rule 3; its inside's shape or text, **rejected**, Envelopes rule 1 or 5.
3. Its spec hash and type (E2): another spec, **not this encoding**; another type, **rejected**, E2.
4. An everyday act (E1, E3): no signer, **rejected**, E1; `prev` absent or of two entries, **rejected**, Envelopes rule 13; `objects` or `acks`, **rejected**, E3.
5. The signature (E1): does not verify, **rejected**, E1; a scheme not implemented, remembered.
6. The payload (E4 to E22): **rejected**, the rule named.
7. What the payload shows by itself (sections 4 and 5), and with several acts, E23: **invalid**; every case found is listed in `invalid`, in section 4's order, then G6.1; `rule` is the first of them.
8. A scheme not implemented: **unknown**, E1. Otherwise **pass**, with the notes.

**One fault, one rule** (draft 25, section 3). A fault is rejected under the rule that gives the form of the field it is in, the innermost: E9 for a party (its signer's fingerprint included), E10 for a role's map, E7 for a socket wherever it sits (a role's spot, a power's rule, the body's socket), E8 for the body, E11 for `for` and a line's `to`, E12 for the receiver, E13 for an author, E14 for a power, E15 for a Statement's kind, E16 for a call, E17 for `previous`, E21 for a report's call and its `relies_on`, E22 for a line and what it holds, E6 for a place and a clock; E5 only for a field whose form is a bare fingerprint (`replaces`, `agreement`, `envelope`, `envelope_at`, `continues`, `under`, `settlement`, an entry of `resolves` or `answers`); E18 for a list's emptiness, order and repeats; E4 for a key; E19 and E20 for presence. A fault that fits two grammar rules is invalid under one (draft 25, section 3): G2.1 for a body or a cMIP not named by fingerprint, G10.1 for a role's kind or `what`.

**Several faults.** Where an act is rejected for several faults, the checker names the first it meets and stops; which one is not fixed by this text, so each rejected vector has one fault only. Where an act shows several cases of invalid, all are listed, in step 7's order, and the first is named.

**The answer is written** (the binding's and the tool's `--json`): `{ verdict, act, id, signer, rule, says, invalid: [{ rule, says }], notes: [{ rule, says }] }`, `verdict` one of `pass`, `rejected`, `invalid`, `unknown`, `cannot open`, `not this encoding`. These words are the checker's: the grammar's answer words (shown, not shown, fork, valid, not valid, unchecked, with their qualifiers) are written with the grammar verifier, later (section 10, item 15).

## 10. Draft 25's section 10, item by item

1. **Each field's kind.** E5 to E17: a fingerprint (E5), a list of fingerprints (E18), an identifier (E6), a socket (E7), and the words: a Statement's kind (E15), a power's kind (E14), a role's kind (E10), a call's "from whom" (E16), all as small unsigned integers. **Refused as shape** (rejected): every field holding another kind than its own, but for three that reach the grammar rules: a body's words or a socket's cMIP not a fingerprint (invalid, G2.1, E7, E8); a role's kind or `what` not one G10.1 allows (invalid, G10.1, E10); an entry of `relies_on` not a fingerprint (left unread, G2.2).
2. **Required and optional fields.** E19 and E20. `relies_on` "if anything else is used": whether something else was used is not in the bytes, so the field is optional and its lack is never refused. "None" for a first act's `previous` is `[]` (E17). A field section 3 does not give is rejected (E4), as draft 25 says. A resolving update carries what E19 lists and nothing else.
3. **Lists.** E18: the lists are `parties`, `authors`, `powers`, `calls`, `relies_on`, `answers`, `resolves`, and a report's `relies_on` and `lines`. Order matters only in `parties` and `lines`; the others are sorted. Duplicates are rejected. An empty list is never written: absent is the one form of "none", so an empty `powers` cannot be written, and no power is `powers` left out; an empty `data` socket is the field left out (one leg).
4. **The entries of `parties`.** E9 and E10, told apart by their first item. A role is named by `authors` and `receiver` by its position in `parties` (E12, E13); an agreement, as receiver, by its root.
5. **Fingerprints.** E5's table. One hash function, SHA-256, under the core's tags, which name the kinds apart (`MOR/act`, `MOR/spec`, `MOR/work`); an identity hash is a genesis's act id. A fingerprint is told from anything else by being a 32-byte byte string, in a field that holds one.
6. **`for` and `under`.** E11: `[0, identity]` or `[2, root]`. The core's act format has no `for`: it is this payload's field.
7. **A call.** E16: `[task, from]` in `calls`, nothing more, one per task. The payer's call made by default is not written (G11.7): a report names it by naming the payment's settlement (E21).
8. **A report.** Section 6, a proposal: the call it answers by `[act]` or `[act, task]`, its `relies_on`, its signer on the outside, one call, no `previous`; the lines of K6's row, each with its amount and the act it came or went by; "still owed" named by `[report, line]`. Written under the block's own fourth proposal's hash, so that Agreements' encoding only refers to it (E2).
9. **An amount.** As Money writes one, `[unit, value]` (Money, "amount"); two match where their bytes are the same (E22).
10. **A payment and a settlement.** Money's acts, named by act id (E5). How a payment names the version it read is Money's to say, and so is whether two settlements are "of the same payment" (G11.4(b)): that is Money's answer, handed to the grammar verifier, not in these bytes. A confirmation names, as its call, the settlement the payment names, never the payment (E21; G11.7). A buyer's contest names that settlement in `settlement` (G11.8). The buyer's assent and the payment are **two acts** (one signer per act; the assent is a Statement of this encoding, the payment a Money act); a verifier finds the payer's assent to the version a payment names as a Statement of kind assent, signed by the payment's signer, whose `terms` is that version.
11. **Signatures by several people.** None: one act by each signer, matched as E24 says.
12. **The parts for machines of a body.** A cMIP's output, not bytes of an act: not fixed here. Each socket's output is written with the grammar verifier and the stub cMIPs (section 9, item 3, of draft 25).
13. **The place's answer, the clock's answer, an envelope and its chain.** Another layer's (section 8.1); not fields of these acts. This encoding writes only `place` and `clock` as identifiers (E6), and `envelope` and `envelope_at` as act ids (E5). No layer gives a transfer act yet, so no checker can tell from bytes that `envelope_at` names an act of the envelope's chain, but where it names the bake itself (`envelope_at` equal to `envelope`). Whether the layer below gives the bake another id in its chain is that layer's. The checker gives no answer about `envelope_at` either way: such Terms pass, with no note.
14. **What a verifier is told** (on whose behalf it reads, which anchoring it accepts): not in an act's bytes; the grammar verifier's input, later.
15. **The answer words.** The checker's answers are written in section 9; the only "who said it" the checker gives is the act's signer. The grammar's answers, their qualifiers and the rule named, are written with the grammar verifier, later.
16. **Limits on untrusted input.** None beyond the act format's: no data item deeper than 128 levels (Envelopes rule 2). No size of an act, a field or a list is fixed; relays and homes set their own policy, as for every act. The depths at which a verifier stops following (G9.2; P2, P8) are the grammar verifier's, and not in these bytes; the checker follows nothing beyond one `previous`. The vectors rely on no limit.
17. **Vectors for a late update.** No new field: the namings are in the bytes (`replaces`, `previous`, `answers`, `relies_on`, `terms`, `under`, `settlement`). Those vectors are the grammar's, with its verifier.
18. **Vectors for the baker's rights.** They need the envelope's chain, which no layer gives yet (item 13): not written. This encoding gives the bytes of Terms that name an envelope and cite an act of its chain (E19).
19. **The field `envelope_at`.** One fingerprint, the act id of the bake or of a transfer of the envelope's chain (E5), key 12, written exactly when `envelope` is (E19). Telling that it is of that envelope's chain is the layer below's (item 13). Its name stays draft 25's.

## 11. The choices marked [lead]

Each is the simplest that fits the act format in force, and each is the MOR lead's to take or change.

1. The spec hash of draft 25 is computed as the core computes a MIR's (E2).
2. The report is written under the block's fourth proposal's spec hash, not draft 25's (E2).
3. No `objects` and no `acks` (E3).
4. Closed maps: an unknown field is rejected (E4); draft 25 now says so too.
5. The body's words are named by work hash (E5).
6. A place and a clock are named by a 32-byte identifier, until the layer that gives them exists (E6).
7. A socket is `[cmip, params]`, its parameters always written, `null` for none; an empty socket is the field left out (E7).
8. The words of draft 25 (kinds, from whom) are written as small numbers (E10, E14, E15, E16); the resolve is kind 3 of a Statement, as `resolves` is kind 3 of a power.
9. A role is named by its position in `parties`, and carries no label (E10, E12, E13).
10. A power of kind `replaces` is written (4), and left unread (E14).
11. A K7 kind is a socket, with parameters (E15).
12. One call per task (E16).
13. Sets are sorted, each entry once; an empty list is never written (E18).
14. A Terms act with `resolves` and no `continues` needs parties, authors and body (E19).
15. A contest's content, and a K7 kind's, is any value, by fingerprint or inline (E20).
16. A report names one call, by `[act]` or `[act, task]`, and each act it relied on once (E21).
17. "Still owed" is named by `[report, line]`, and a passed-on line may name it in `closes` (E22).
18. The receiver's two forms are `[0, position]` and `[2, root]`, E11's first items (E12).
19. A resolving update of Terms may carry `relies_on` (E19): it is a naming (G13.2), not words of its own.

## 12. What changed from encoding 1

Each is draft 25's, or follows from it; each is the MOR lead's, as technical wording.

1. **Spec hashes** (E2): `SPEC_DRAFT_25` and `SPEC_REPORT_BLOCK_4` in place of draft 24's and the third proposal's; said aloud.
2. **An act's place in its signer's sequence** (E1): said, and the vectors chained.
3. **The receiver** (E12): `[0, position]` or `[2, root]`; a position that names an agreement's entry is rejected; the G1.4 note is for a position beyond the list only.
4. **A resolving update of Terms** (E19): carries `replaces`, `agreement`, `resolves`, `continues`, `previous`, and may carry `relies_on`; nothing else.
5. **The resolve** (E15, E20): a Statement of kind 3, carrying `resolves` and `continues`, no `content`; no other kind carries them. The G12.3 note for a Statement is gone, since it can no longer be written.
6. **The settlement** (E5, E16, E21, section 10, item 10): a call made by default, a confirmation and a buyer's contest name the payment's settlement, never the payment.
7. **What a power is for** (E14): the resolve, a K7 kind whatever its parameters, two powers of one kind.
8. **An unopened act held** (E23): unchecked, not invalid; a rejected act held: invalid. Both written.
9. **The author's first act** (E17): the author's assent names the Terms act.
10. **The order of the cases of invalid** (section 4, section 9): one order, the code's, as draft 25's section 2 now gives it.
11. **One fault, one rule** (E9, section 9).
12. **Left unread** (section 1): only what draft 25's G2.2 lists.
