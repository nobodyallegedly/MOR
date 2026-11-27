# Agreements, from scratch: the encoding, third edition

27 November 2026. Written by the scribe's session M8, from encoding 2 and draft 26; for the MOR lead to take or change; not a decision. Where each change comes from is in `draft-26-trace.md`, under "M8".

## In plain words

Draft 26 (`draft-26.md`) says what each act of Agreements carries: Terms say what is agreed; a Statement is anything else said within an agreement (an assent, a counter signature, a contest, a resolve, or a kind a cMIP defines). This text says how each is written as bytes, so that two verifiers written apart agree on every act. It is `encoding-2.md` brought to draft 26, and changes only what draft 26 changed: the words of Terms are a Text act, named by its act id; the place is now the keeper, and Terms may name one keeper or several; the set of acts is a new kind of value; the report has gone to the MICS, with its bytes; and the checker's order of the cases of invalid is draft 26's, with one case more. `encoding-2.md` stays as it was; acts written under its spec hashes are not acts of this encoding.

The acts are written in the act format MOR already has (Envelopes, Part three): every act has an outside, which relays see, and a locked inside, which holds its specification, its type, its payload, and its place in its signer's sequence. A Terms act and a Statement are ordinary everyday acts, signed by one signer, under draft 26's own spec hash. Their payloads are small maps with numbered fields, in deterministic CBOR, closed: a field this text does not give makes the act rejected. A report is no longer written here: it is the MICS's act type, and its bytes are the MICS's (section 6).

Every list that is a set is written in one order, so that two people who mean the same thing write the same bytes. A socket (a field where a cMIP plugs in) is the cMIP's spec hash and its parameters; an empty socket is the field left out. Parties are a list; authors point into it by position. The receiver says, in its first item, whether it names a party by position or an agreement by its root. The words are not in the Terms: the Terms carry the act id of the Text act that holds them.

**What these texts do not give, and a writer must still take elsewhere.** The act around the payload: its outside, its lock, its `prev`, position and running summary (Envelopes, Part three, "The act", "Sequences", "The running summary"); the signer's identity, its genesis, and the binding that ties the signing key to it (Identity, sections 1 and 2, and Part three); `tagged_hash` and canonical text (Identity, "Encoding and conventions"). The Text act that carries the words (Text, rule 14, and its Part three). A cMIP's spec hash (Development). A report, and a call's meaning (the MICS's report block). An amount's unit and value (Money).

A checker reads an act's bytes and answers **pass**, **rejected** (no Agreements act: it never reaches the grammar rules), **invalid** (an act whose bytes, or the acts held beside it, show that it cannot count, with the grammar rule named), **unknown**, **cannot open** or **not this encoding**, naming the rule. It does not give the grammar's answers (in force, fork, unchecked and so on): that is the grammar verifier's.

Where draft 26 leaves a byte to this text and the choice has not been made, this text gives the readings and picks none: each is marked **open**, with the readings side by side, and listed in section 11 and in the trace. Where encoding 2 made a choice marked **[lead]** and draft 26 does not change it, the choice is kept, still marked **[lead]**; section 11 re-reads each.

## 1. How to read this text

The rules of this text are numbered E1 to E25, as in encoding 2: a rule keeps its number where it says the same thing; E21 and E22 (the report and its lines) are gone, and their numbers are not given again; E25 is new. Section 12 lists every change. A rule of draft 26 is cited by its number in draft 26 (5.2.2, §4.3). An Envelopes, Identity or Text rule is cited by its MIR. MUST and MAY are used as in RFC 2119. Formats are in CDDL, with the conventions of Identity, Part three, "Encoding and conventions" (closed maps; `? n => x` optional; `hash` is `bstr .size 32`; `[+ x]` one or more; `[* x]` zero or more; `[2* x]` two or more; every `tstr` canonical text).

Draft 26 has three answers for an act that does not hold, and this text keeps them apart:

- **rejected**: the checker's word for bytes that are **not an Agreements act** (draft 26, §3.6, §4): bytes that never reach the grammar rules. The core calls such an act **invalid** as an act: outside its specification's format (MICS, "Common conventions"), or refused by the act format. "Rejected" is the checker's verdict and no answer of the grammar. A checker names the rule of this text (or of the act format) that gives the form at fault (draft 26, §4.4, "One fault, one rule", case 1).
- **invalid**: draft 26's word for an act of this encoding that shows, by itself or with the acts held, that it cannot count (§3.6, "Invalid"; §4.4, cases 2 to 8). A checker names the grammar rule.
- **left unread**: a value draft 26 says is not read and changes nothing. 5.2.3 lists them all: an entry of `relies_on` that is not a fingerprint; a power of sort `replaces` (§5.6); a call in Terms that do not hold the task it is attached to (§5.11); a `what` on a role of sort future (5.10.4); and the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (5.4.2). A checker gives a note for each of these its bytes show: all but the call, since whether Terms hold a call's task needs their cMIPs, the grammar verifier's (E16).

## 2. The act

**E1. An everyday act** (draft 26, §2: the act, Envelopes). Every act of this encoding is an everyday act of the act format in force (Envelopes, Part three, "The act"; Identity: every act other than a genesis, a rotation and a chain signature). Its outside MUST name its signer (field 0) and the binding of its signing key (Identity, rule 5); it is signed by that key over the act id. It MAY be public or private, and MAY be addressed (`to`) as any act. Bytes the act format refuses are rejected, named by the act format's rule (Envelopes rules 1, 2, 3, 5 and 13). A signature that does not verify over the act id with the key it carries is rejected (E1). A signature scheme the checker does not implement makes the act **unknown**, where no other rule fails (Identity, "Signature schemes"). *The checker verifies the signature with the key the act carries. That the key is the signer's at that point of its chain is the identity chain's to show (Identity, "Verification procedures"), and is not checked from one act's bytes.*

**Its place in the signer's sequence.** Its inside MUST carry `prev`, a position and a running summary, as every everyday act does (Envelopes rule 13): the act is the next of **all** its signer's everyday acts, whatever specification they are under (a Text act carrying words included), not of its acts in one agreement. `prev` names the signer's act before it, and is `[]` only for the signer's very first everyday act; the position counts from 1; the running summary is `S(p − 1)`, over every act before it (Envelopes, "The running summary"). The checker refuses an absent `prev`, or one of two entries, and checks nothing else of the sequence, as Envelopes says (position and summary are judged where a whole line is held). *A writer who copies a first act's `[]`, 1 and 32 zero bytes into a later act forks their own sequence: the signer's sequence is one line, kept across every act it signs, on every device. The payload's `previous` (E17) is another line: the signer's acts within one agreement (5.7.1). Both are written.*

**E2. Spec hash and type.**

| Act | Spec hash | Type |
| --- | --- | --- |
| Terms | draft 26's, `SPEC_DRAFT_26` | 0 |
| Statement | draft 26's, `SPEC_DRAFT_26` | 1 |

A spec hash is computed as the core computes a MIR's from its file (Development rule 26; `Spec::mir_file_hash` in the core library): `tagged_hash("MOR/spec", {0 => 4, 9 => text})`, where 4 is the kind of a MIR in Development's numbering, and `text` is the file's content with its final line break removed if it has one (only one; nothing else is removed), which must be canonical text. **[lead]**

- `SPEC_DRAFT_26`: of `docs/agreements-from-scratch/draft-26.md` as the scribe's session N1 (wave four) left it on branch `claude/draft-26-outline-vbtvu7` (429 lines, 147,279 bytes): `04bae25cb3416e111e1f65ddca2c99c5769d3945c0751a6846621929c0d29904`, computed as this rule says, by the core library's `Spec::mir_file_hash` on the file. The plain sha256 of the file's bytes, which is not the spec hash, is `09ba9ce52f1e995872aaf7a35838442516f7c014e0b104256f273c2c7f0f85ff` (`sha256sum draft-26.md`). One changed byte of the file changes both. The values M11 gave (`e9e5b683…` and `6ee29fc2…`) name the text before wave four, and no longer.

**Said aloud.** The hash is of the file **as published on its branch**. A writer uses the hash as given here, never one recomputed from a copy of their own: one changed byte in a copy is another specification. Acts written under a hash stay that text's, whatever is written later; a later draft is a new specification with a hash of its own, and nothing written under this one is updated. Encoding 2's hashes (draft 25's, `dd90f8af…`, and the report block's fourth proposal's, `7b65c60f…`) and encoding 1's name other specifications: an act under them is **not this encoding**.

Under `SPEC_DRAFT_26`, a type other than 0 or 1 is rejected. An act under any other spec hash is **not this encoding**. *A report is not one of draft 26's act types (draft 26, §4.3: "one act type, defined once, in the MICS's report block"): it is written under the MICS's hash and type, by the MICS's bytes, and this checker answers a report **not this encoding**.*

**E3. No `objects`, no `acks`.** An act of this encoding MUST NOT carry `objects` or `acks` in its inside; one that does is rejected. Its lines (an agreement's chain, by `replaces`; a signer's line within an agreement, by `previous`) and everything it names are in its payload, where draft 26 reads them (5.13.1). It MAY carry `refs` and a `hint`, which the act format says never decide anything (Envelopes rules 6 and 20); this encoding does not read them, and they are no knot of draft 26 (5.13.1 reads fields of the payload; the act format says `refs` decide nothing). **[lead]**

**E4. A closed map.** Each payload, and every map within it (a role), is a closed map whose keys are the small unsigned integers its format lists. A key it does not list, or one that is not an unsigned integer, makes the act rejected. *Draft 26 says the same (§4, its opening; §3.6): a field §4 does not give makes the act not an Agreements act, and is never left unread (5.2.3).*

## 3. The kinds of value

Draft 26, §4.1: "Each field holds one kind of value". Each kind is written once, here.

**E5. A fingerprint** (draft 26, §3.1, **Fingerprint**; 5.2.1) is `hash`: a byte string of exactly 32 bytes. A fingerprint field that holds anything else is rejected, save where draft 26 says it reaches the grammar rules (§4.1's three exceptions: E7, E8, E10, and an entry of `relies_on`). What each fingerprint is of, and over which bytes, is in this table. A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is.

| Named | Its fingerprint | Over |
| --- | --- | --- |
| an act: a Terms act, a Statement, a Text act, a report, a payment; a version; the root | its act id, `tagged_hash("MOR/act", outside)` | the act's encoded outside, which commits to its locked inside; the signature is not part of it (Envelopes, "How it fits together") |
| the root of an agreement | the act id of its first Terms act | as any act |
| the words (`body`'s first item) | the act id of the Text act that carries them (5.2.2) | as any act |
| a cMIP (in a socket, a K7 kind, a power's K7 kind) | its spec hash, `tagged_hash("MOR/spec", content)` | its specification's encoded content, as Development gives it for its kind (E2's map is that content for a MIR's text) |
| an envelope (`envelope`) | the bake's act id (Envelopes' bake: draft 26, §4.2, `envelope`) | as any act |
| the act of the envelope's chain cited (`envelope_at`) | that act's id: the bake's, where the Terms cite the bake (then `envelope` and `envelope_at` are equal, draft 26, §4.2); a transfer's otherwise | as any act |
| a settlement (`settlement`) | the act id of the Money act that is the settlement (a receipt or a claim), the act both sides can see; never the payment's own id, where the two are different acts (draft 26, 5.9.1, 5.11.7) | as any act |
| a role's `what` | a fingerprint its spot's cMIP (K5) reads | as that cMIP says |
| a signer (a party, `for`) | the identity hash | its genesis |
| *a set of acts: reading (i) of "The set of acts", below* | *its value, as below* | *as below* |

**The set of acts** (draft 26, §3.1, **The set of acts**; §4.1; §7). **Open: where it is written**, a row of E5's table (reading (i), the row above) or an E-rule of its own (reading (ii), numbered E26 if taken). The bytes below are the same under both readings; only where the rule stands differs. *Under reading (i), a set's value is one more kind of fingerprint, and "One fault, one rule" names E5 for it; under reading (ii), a fault in it is named by its own rule.*

A set of acts is named by one value, computed from a list of act ids and never written as a list in its field (§4.1):

1. Each member is an act id: 32 bytes (E5's first row). Members are acts only (§4.1).
2. The ids are sorted in the bytewise order of their 32 bytes, and an id that appears more than once is kept once (§4.1: "the ids sorted, repeats dropped").
3. The sorted ids are hashed with a label for a set of acts: `tagged_hash(LABEL, members)`, where `tagged_hash` is Identity's (Identity, "Encoding and conventions").
4. The value is `hash`: 32 bytes, bare, as any fingerprint; a field that holds one says that what it holds is a set (§4.1).
5. The empty set has the label and no members (§4.1): its value is `tagged_hash(LABEL, members)` with no member.

**Open, and not chosen here:**

- **The label's bytes** (draft 26, §7, "its hash and its label"). A tag text for `tagged_hash`, which Identity's list of the core's tags would then name (Identity, "Encoding and conventions": "Every tag the core uses begins with `MOR/`"). No text gives its string.
- **`members`: how the sorted ids are joined.** Reading (a): the ids concatenated, 32 bytes after 32 bytes, nothing between (the MOR lead's recipe in the exchange of 26 November: "joined"); the empty set is then the label over no bytes. Reading (b): the deterministic CBOR array of the ids as byte strings, as the rest of the payload is written; the empty set is then the label over the one byte of an empty array. Draft 26 says only "sorted, repeats dropped, and hashed with a label".
- **Which fields may hold a set's value** (draft 26, §7: "in this text none does"). This text gives no field the set form: no key of section 4 or 5 is written as one. A parameter of a cMIP is any value (E7), which only that cMIP reads: a cMIP that asks for acts names them by this value (§4.1), in its own parameters, and the checker does not read them.

*A set's value is no knot by itself (§4.1; 5.13.1): it names no act a verifier can read without the list it was computed from. The checker cannot tell a set's value from an act id by its bytes: where one stands in a field that holds act ids (an entry of `relies_on`, say), it is read as an act id, which no act held has.*

**E6. An identifier** (draft 26, §4.1: "an identifier (of a signer, a keeper or a clock)") of a keeper or of a clock is `hash`. Anything else is rejected, under E6.

- **A keeper's identifier** (5.8.1: "by the identifier the layer that orders acts gives it"). **Open: what it is the hash of.** Reading (a): the keeper's identity hash, the act id of its genesis, as a signer is named (E5), since a keeper lodges signed records (§3.4, **Keeper's record**; 5.8.4). Reading (b): 32 bytes kept as encoding 2 kept them, opaque, until the layer that orders acts gives keepers an identifier; a richer form would then be a new specification. Neither is chosen.
- **A clock's identifier** (5.8.5: "What a clock is, and how it is identified, is for the layer that gives it"). Kept as encoding 2 wrote it, 32 bytes, **[lead]**. **Open**: whether key 9 stands as written (draft 26, §7, "How Terms name their clock"), which waits on what identifies a clock.

**E7. A socket** (draft 26, §3.1, **Task**; §4: "Every socket holds a cMIP by fingerprint, with its parameters") is a cMIP and its parameters, written as the act format writes them for a vow:

```cddl
socket = [ cmip: any, params: any ]   ; exactly two items
```

`params` is any value, which only that cMIP reads; a cMIP that takes none is given `null` (its parameters are still written: there is one form). **[lead]** An **empty socket is the field left out**: draft 26's defaults (5.4.1 for `in_force`, 5.5.5(a) for `condition`, one leg for `data`, 5.11.2 for `control`) then apply. A socket that is not an array of exactly two items is rejected: a socket written as a bare text address is rejected, not invalid (§4.1: "a socket that is not written as a socket at all … not Agreements acts"). In Terms, a `cmip` that is not a fingerprint, in that place of a socket, does not make the act rejected: it reaches the grammar rules, and the Terms are **invalid** (5.2.1).

**E8. The body** (draft 26, §4.2, `body`; 5.2.2) is the words, named by the act id of the Text act that carries them, and the socket of the cMIP that reads them (task K1):

```cddl
body = [ words: any, socket ]   ; words: the Text act's act id (E5)
```

Anything other than an array of two items, the second a socket, is rejected. `words` that are not a fingerprint make the Terms **invalid** (5.2.1). The checker reads no words: what `words` names is tested only among the acts held (E25).

**E9. A party** (draft 26, §3.2, **Party**) is named in one of three ways, told apart by its first item:

```cddl
party = [0, signer: hash]   ; a signer, by identity hash
      / [1, role]           ; a role (E10)
      / [2, root: hash]     ; an agreement, by its root
```

Anything else is rejected, under E9: a party `[0, "A"]` (a signer not named by a fingerprint) is rejected under E9, the rule that gives a party's form, and not under E5 (section 9, "One fault, one rule").

**E10. A role** (draft 26, 5.10.1, 5.10.4; §4.1).

```cddl
role = {
  ? 0 => any,       ; sort: 0 done, 1 received, 2 holding, 3 fits, 4 future
  ? 1 => any,       ; what: a fingerprint (not read for sort 4)
  ? 2 => socket,    ; spot socket (task K5)
}
```

A role whose sort is lacking or not one of the five is not of sort 4: its `what` is read as for any other sort, so a role with a bad sort and no `what` shows 5.10.1 twice. A role that is not a map is rejected; so is a key other than 0, 1 and 2 (E4), and a spot that is not a socket (E7). The three fields are optional in the bytes because draft 26 reads their lack as **invalid**, not as rejected (§4.1; 5.10.1): a role with no sort, or a sort that is not an unsigned integer from 0 to 4, is read as lacking it; a role of any sort but 4 with no `what`, or a `what` that is not a fingerprint, is read as lacking it; a role with no spot socket lacks its cMIP; each makes the Terms invalid (5.10.1). A spot whose `cmip` is not a fingerprint makes them invalid (5.2.1). A `what` on a role of sort 4 is left unread (5.10.4). **[lead]**: the five sorts (done, received, holding, fits, future) are written as numbers, as the act format writes its kinds.

**How a role is named**: by its position in `parties` (E13, E12). A role carries no label. **[lead]**

**E11. In whose name** (`for`; draft 26, §4.3, `for`; 5.1.2):

```cddl
who = [0, signer: hash] / [2, root: hash]
```

the same first items as E9; a role is never written here. Anything else is rejected.

**E12. The receiver** (draft 26, 5.1.3) names one of these Terms' parties, by its position, or an agreement, by its root, and says which in its first item:

```cddl
receiver = [0, position: uint]   ; one of these Terms' parties named as a signer or a role, by its position in parties (counting from 0)
         / [2, root: hash]       ; an agreement, by its root, whether or not it is one of the parties
```

Anything else is rejected, under E12: a bare number or a bare hash, `[0, h]` with `h` a hash (a signer is named by its position, never by its identity hash), and any other first item. A position that names a party named as an agreement is **rejected**, the checker naming E12 (5.1.3: "makes the act not an Agreements act"): an agreement is named as receiver by its root, `[2, root]`. A position beyond the list is read: draft 26 answers that no one receives by these Terms, **not shown** (5.1.4: "names as receiver a signer or a role that is not among its own parties"); the checker gives it as a note. **[lead]**: the first items 0 and 2 are E11's, "a party of ours" and "an agreement".

**E13. Authors** (draft 26, §4.2, `authors`; 5.3.1) are positions in `parties`:

```cddl
authors = [+ uint]   ; sorted, each once (E18)
```

Positions count from 0, as in E12. An entry that is not an unsigned integer is rejected. A position beyond the list, or one naming a party named by role or as an agreement, makes the Terms **invalid** (5.3.1: "an author is never a party named by role, and never one named as an agreement"). The act's signer, named on its outside (E1), MUST be the `signer` of a party `[0, signer]` (E9) that one of `authors` names: Terms whose `authors` name no such party make the Terms **invalid** (5.3.1: "Terms whose `authors` do not name their own signer are **invalid**"). A resolving update carries no `authors` (E19), and this is not asked of it.

**E14. A power** (draft 26, §4.2, `powers`; §5.6) is its sort and its rule:

```cddl
power = [ sort: 0 / 1 / 2 / 3 / 4 / hash, rule: socket ]
; 0 assent, 1 counter_signature, 2 contest, 3 resolves, 4 replaces; hash: a K7 kind's cMIP
```

Anything else is rejected, a sort written as text included (§4.1: "a power's sort that is neither one of its words nor a fingerprint"). Sort 4, `replaces`, is written so that draft 26's case can be: an entry of that sort gives no power and is left unread (a note), not rejected (§4.2, `powers`; 5.2.3). **[lead]** **What a power is for** (§4.2, `powers`): sort 0, 1 and 2 for a Statement of that kind; sort 3, `resolves`, for a resolving update: in a signer's line, a Statement of kind 3, `resolve` (E15); for a fork of Terms, a Terms act written as a resolving update whose `replaces` names the Terms that give the power (5.12.5); a hash, for every Statement whose K7 kind's `cmip` is that hash, whatever its parameters. Two entries of one sort, with different rules, are two entries of the set (E18): an act they are for binds where any one of their rules says yes (§4.2; 5.6.1(b)). Which power a verifier reads is the grammar's; the checker reads none.

**E15. A Statement's kind** (draft 26, §4.3, `kind`):

```cddl
kind = 0 / 1 / 2 / 3 / [ cmip: hash, params: any ]   ; assent, counter_signature, contest, resolve, or a K7 socket
```

Anything else is rejected, a K7 kind whose `cmip` is not a fingerprint included: the grammar rules give no invalid case for a Statement's kind (§4.4's list has none), so that is a field of the wrong kind. Kind 3, **resolve**, is a resolving update in its signer's own line and nothing more (§3.1, **Statement**; §4.3; E20). A K7 kind is its cMIP, whatever its parameters: a power's K7 kind (E14) matches it where its hash is the socket's `cmip`. **[lead]**: a K7 kind is a socket, with parameters, as "every socket holds a cMIP by fingerprint, with its parameters" (§4).

**E16. A call** (draft 26, §4.2, `calls`: "as the MICS's report block gives them"):

```cddl
call = [ task: 1..8, from: 0 / 1 / 2 ]   ; the task K1 to K8 by its number; 0 the doer, 1 the receiving side, 2 both
```

Anything else is rejected, a call carrying anything more included (a closed form: no token it does not know is read past). **One call per task**: two calls with the same task in one Terms act are rejected. **[lead]** The payer's call made by default (5.11.7) is not written in Terms: a payment holds it by default. *Whether a call is attached to a task those Terms hold is the grammar's (5.2.3: "left unread"), not the bytes'. Draft 26 gives a call's form to the MICS's report block: these bytes are encoding 2's, kept until the MICS gives a call's bytes (section 11, item 12).*

**E17. `previous`** (draft 26, §4.2, §4.3, `previous`; 5.7.1) is written as the act format writes `prev`:

```cddl
previous = [] / [hash]   ; [] for none: the signer's first act in this agreement
```

Anything else is rejected. It is always written, in Terms and in Statements (§4.2, §4.3: "`previous` | yes"). It names the signer's act before this one **within the same agreement** (5.7.1), whatever kind it is, but for a resolving update: a resolve, and a Terms act written as a resolving update, name **the shared act** both tips follow (5.12.4), not either tip. **The author's first act** (§4.3, "An author's first act"): the first Terms act is its signer's first act within its agreement, so that signer's assent to it, and any next act of theirs there, names it, or the act after it, in `previous`; never `[]`. A party with no act in the agreement yet writes `[]`.

**E18. Lists** (draft 26, §4.1, §4.2, §4.3).

- **No empty list.** A list field holds one or more entries. A list with nothing in it is left out: absent means none (no power, no call, no keeper, nothing relied on). An empty list is rejected. The one exception is `previous` (E17), which writes "none" as `[]`, as `prev` does.
- **Sets are sorted.** `authors`, `relies_on`, `powers`, `calls`, `answers` and `resolves` are sets: their entries are in the bytewise lexicographic order of their deterministic encodings (byte by byte, a shorter encoding first where it is a prefix of a longer one), and each entry appears once. An entry out of order, or twice, is rejected. Order carries no meaning in them. **[lead]** *A sorted list of act ids, written in a field, is not the set of acts of section 3: that is one value computed from such a list, and no field of this text holds one. `resolves` is written as the list of the tips' ids (5.12.4), sorted as a set is.*
- **The keeper field.** **Open**: whether its list (in either form of key 8, section 4) is a set, sorted and each keeper once, as the lists above; or keeps the writer's order, as `parties` does. Draft 26 gives the keepers no order (5.8.3 reads where they agree), and says nothing of the bytes.
- **One list keeps the writer's order**, because positions in it are named: `parties` (by `authors` and `receiver`). The same party twice in `parties` (the same bytes) is rejected (§4.2, `parties`): a spot that several fill is **one role, filled more than once** (5.10.2), not two identical roles. A signer named directly and the same signer able to fill a role are two different entries.
- **Named in two fields.** An act named in `relies_on` that another field of the same act also names is read once, as one naming, and is not rejected (§4.3, `relies_on`).

**E19 and E20** are the presence rules of Terms and of a Statement (sections 4 and 5).

**Canonical text.** Every text string anywhere in an act, a socket's parameters and a Statement's content included, is canonical text: the act format already makes an act invalid whose inside holds one that is not (Envelopes rule 5).

## 4. Terms (type 0)

```cddl
terms = {
  ? 0 => hash,             ; replaces: the Terms act this one replaces
  ? 1 => hash,             ; agreement: the root; exactly when 0 is present
  ? 2 => [+ party],        ; parties, in the writer's order
  ? 3 => [+ uint],         ; authors: positions in parties
  ? 4 => body,             ; body: [words, socket]; words: the Text act's act id (E8)
  ? 5 => [+ any],          ; relies_on: fingerprints; an entry that is not one is left unread (5.2.3)
  ? 6 => socket,           ; in_force (K2); absent: 5.4.1's default; in a Terms act with 0, its answer on coming into force is left unread (5.2.3)
  ? 7 => [+ power],        ; powers: [kind, rule] (K3)
  ? 8 => keeper,           ; keeper: one keeper or several, by identifier (E6); its form is open (below)
  ? 9 => hash,             ; clock, by identifier (E6)
  ? 10 => receiver,        ; [0, position] / [2, root] (E12)
  ? 11 => hash,            ; envelope: the bake's act id
  ? 12 => hash,            ; envelope_at: the act of the envelope's chain these Terms cite
  ? 13 => socket,          ; condition (K4); absent: the known parties (5.5.5(a))
  ? 14 => socket,          ; control (K6)
  ? 15 => [+ call],        ; calls
  ? 16 => socket,          ; data (K8); absent: one leg
  ? 17 => [+ hash],        ; resolves: the list of the tips' ids
  ? 18 => hash,            ; continues: one of the entries of 17
  19 => [] / [hash],       ; previous
}
```

The keys follow the order of draft 26's table (§4.2), which is draft 25's.

**Key 8, the keeper field** (draft 26, §4.2, `keeper`; 5.8.1: "one keeper or several, each by the identifier the layer that orders acts gives it"). **Open: its form.** Two readings, neither chosen:

```cddl
; reading (i): one form, a list always
keeper = [+ hash]              ; one keeper is a list of one

; reading (ii): two forms, told apart by their bytes
keeper = hash / [2* hash]      ; one keeper bare; several as a list of two or more
```

Under reading (i), one keeper has one form and several have the same; under reading (ii), a list of one keeper is rejected, so that one keeper is still written one way. Under either, the keeper field is not a socket (§3.4, **Keeper**: "not a cMIP, so the keeper field is not a task"), each entry is an identifier (E6), and whether a list is sorted is E18's open point. A keeper is not a clock: key 8 never stands for key 9 (5.8.6). A keeper is not an act, and a list of keepers is not the set of acts (§4.1: "its members are acts only").

**E19. Presence** (draft 26, §4.2's "Required" column; §4.3, "What a resolving update carries").

- `previous` (19) is required.
- `agreement` (1) is written exactly when `replaces` (0) is; one without the other is rejected.
- `envelope_at` (12) is written exactly when `envelope` (11) is; one without the other is rejected (§4.2, `envelope_at`).
- `continues` (18) is written only beside `resolves` (17), and names one of its entries; otherwise rejected (§4.2, `continues`).
- **A resolving update** is a Terms act written with both `resolves` and `continues`. It carries `replaces` and `agreement` (0, 1), `resolves` and `continues` (17, 18) and `previous` (19); it MAY carry `relies_on` (5); it carries **nothing else**. One that lacks `replaces`, or carries any other field (`parties`, `authors`, `body`, `in_force`, `keeper`, `clock`, the receiver, a socket, anything), is rejected (§4.3: "it carries nothing else"). This is a rule of the bytes only: whether the act in fact resolves a fork is the grammar's (5.12.4), from other acts, and an act written so that resolves nothing is read as 5.12.4 says, and is not rejected after the fact.
- `parties`, `authors` and `body` (2, 3, 4) are required in every other Terms act. Terms with `resolves` and no `continues` resolve nothing, and are read as an act like any other (§4.3: "it carries what any Terms act carries"), so they need all three.
- Every other field is optional.
- A Terms act with no `replaces` is read as a first Terms act, the root of its own agreement: §4.2 asks `replaces` "in every Terms act except the first", and nothing in one act's bytes shows that an act is not a first.

**What Terms show by themselves** (the checker answers **invalid**, the rule named), in draft 26's order (§4.4, "One fault, one rule", cases 2 to 5 and 8; cases 6 and 7, and the second part of case 2, need other acts: section 7, section 9):

1. Case 2, 5.2.1: the body's `words` (an act id is a fingerprint: 32 bytes, E5), then the `cmip` of the body's socket, of `in_force`, of `condition`, of `control`, of `data`, and of each power's rule (in the order of `powers`), is not a fingerprint.
2. Case 3, for each role in `parties`, in their order: 5.10.1, its sort lacking or not one of the five; then 5.10.1, its `what` lacking or not a fingerprint (but for sort future); then 5.10.1, its spot socket lacking, or 5.2.1, its spot's `cmip` not a fingerprint (E10).
3. Case 4, 5.4.2: a party is named by role, and `in_force` is absent, in every Terms act that carries `parties`, an update included.
4. Case 5, 5.3.1: an author is beyond the parties, or names a party named by role or as an agreement (E13), in the order of `authors`; then the act's signer, not named by any of `authors` (E13).
5. Case 8, 5.8.6: Terms that do not supply what a cMIP they name declares it needs. **Open**: the checker cannot give it from the act's bytes, since no byte of a Terms act says what a cMIP it names declares; section 9, step 7, gives the readings.

*Case 7 (Envelopes' rules for Terms that name an envelope, §4.4) needs the envelope's chain and Envelopes' rules: a checker of these bytes does not give it.*

**Notes the checker gives** (the act passes): an entry of `relies_on` that is not a fingerprint, left unread (5.2.3); a power of sort `replaces`, left unread (5.2.3, §4.2); a `what` on a role of kind future, not read (5.10.4); `in_force` in a Terms act that carries `replaces`, its answer on coming into force left unread, still read for who fills a role (5.2.3, 5.4.2); `resolves` with no `continues`, read as an act like any other (§4.3, 5.12.4); a receiver whose position is beyond the parties, by which no one receives (5.1.4, not shown).

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
  ? 10 => [+ hash],        ; resolves: the list of the tips' ids; exactly for kind 3
  ? 11 => hash,            ; continues: one of the entries of 10; exactly for kind 3
}
```

**E20. Presence** (draft 26, §4.3).

- `agreement`, `terms`, `kind` and `previous` are required.
- `for` and `under` are written together, or neither.
- `content` is left out for an assent, a counter signature and a resolve (§4.3: "An assent's `content` is empty", and a counter signature's and a resolve's too); written there, the act is rejected. For a contest it is optional, any value, and not read by the grammar rules. For a K7 kind it is as that cMIP says: optional, any value. "By fingerprint or inline as the kind says": a fingerprint is written as `hash`, inline as any value; the bytes do not tell them apart, the kind's cMIP does. **[lead]**
- **A resolve** (kind 3) carries `resolves` and `continues`, `continues` one of the entries of `resolves`; one that lacks either is rejected. No Statement of another kind carries `resolves` or `continues`: one that does is rejected (§4.3: "no Statement of another kind carries `resolves` or `continues`"). So, for a Statement, `resolves` without `continues` cannot be written. A resolve MAY carry `for` and `under` (made under a power of sort `resolves`, 5.12.5), `answers`, `relies_on` and `settlement`, as §4.3 says.
- `resolves` is the list of the tips' ids (5.12.4), and `continues` is one of its entries (§4.3), as for Terms.

A Statement shows no case of invalid by itself: the one draft 26 lists for a Statement (§4.4, case 6; 5.7.1) needs the acts held (section 7).

## 6. The report

A report is the MICS's act type, defined once, in the MICS's report block (draft 26, §3.1, **Report**; §4.3: "this text uses it and gives it no fields of its own"). Its bytes, a call's reference, its lines and how a report is read go with the block to the MICS. This text gives a report no bytes, and its checker answers an act under the block's hash **not this encoding** (E2). Encoding 2's section 6 (E21, E22) stays where it is, as the record of the block's fourth proposal; nothing in this text reads it.

What draft 26 asks of a leg report is in K6's row (§6): the acts it relied on are named by act id (E5), each amount as Money writes one. Those bytes are the MICS's to give.

## 7. Among the acts held

A checker handed several acts reads them as the acts a verifier holds. It reads two things among them: what `previous` names (E23), and what `body` names (E25).

**E23. `previous`** (draft 26, 5.7.1; §4.4, case 6). For each Terms act and Statement whose `previous` names an act among them:

- **The same agreement.** An act is within the agreement its `agreement` field names (a Statement's `agreement`; a Terms act's `agreement`); the first Terms act, which has no `agreement`, is within the agreement it is the root of: its own act id.
- Where the act named opens and is a Terms act or a Statement of this encoding, by the same signer (the outside's field 0), within the same agreement, nothing is found.
- Where it is held and **cannot be opened** (a private act held without its key), what it is cannot be read: the act counts, its signer's line is **unchecked** before it (5.7.1), a note, and the act is **not invalid**.
- Otherwise the act is **invalid** (5.7.1): `previous` names an act of another signer, an act within another agreement, a report, a payment, an act of another specification (a Text act among them), or an act held that is **rejected** (a record that is no Terms act and no Statement, 5.7.1: "An act held that is not an Agreements act … an act whose `previous` names it is **invalid**").

Where `previous` names no act held, the act counts and its signer's line is unchecked before it (5.7.1): a note. Where its `previous` names nothing (`[]`), nothing is checked. *Whether two acts are a fork (two acts of one signer naming the same `previous`, 5.7.2) is the grammar's, and the checker does not answer it: it passes both tips.*

**E25. The act `body` names** (draft 26, 5.2.2; §4.4, case 2, its last part). For each Terms act with a `body` whose `words` is a fingerprint:

- Where the act it names is held, opens, and is a **Text act**, nothing is found. A Text act is an act under Text's spec hash, `TEXT`, of type 0, whose payload is as Text's Part three gives it (Text, rule 14 and "Text act (type 0)"). The checker reads nothing else of it: not its words, not its signer, not whether it came first (5.2.2: "naming it by its act id is all that this asks").
- Where the act it names is held, opens, and is not a Text act (an act under another spec hash, of another type, or with a payload Text does not give), the Terms are **invalid** (5.2.2: "Where the act `body` names is held and is not a Text act, the Terms are **invalid**").
- Where it is held and **cannot be opened** (a private Text act, held without its key), what it is cannot be read, and the Terms are **not invalid** (§3.6: "If an act the verifier does not hold could change the answer, the answer is never invalid"). **Open**: whether the checker gives a note (the words unchecked, as E23 gives for `previous`) or nothing (the words not read: the grammar does not read them, 5.2.2).
- Where the act it names is **not held**, the Terms are not invalid. **Open**, as for the act that cannot be opened: a note (unchecked) or nothing (not read). Draft 26 does not say; 5.13.3 ("Where the acts that could show B after A need an act that is named in a field of an act held, and the verifier does not hold it, the answer is **unchecked**") speaks of order, not of the words.
- **Open**: which spec hashes are `TEXT`: Text draft 11's alone (draft 26, §2, names "Text, draft 11"), or any draft of Text. An act under an earlier Text draft's spec hash is a Text act under the second reading, and not one under the first.

## 8. One signing

**E24. One signing of an agreement** (draft 26, 5.1.2, "Which acts are one signing"). The core has no act signed by several at once (MICS: "One signer per act"). So an agreement that signs by all its signers signs by one act of each: Statements whose payloads have the same bytes under the keys 0 (`agreement`), 1 (`terms`), 2 (`kind`), 3 (`content`), 4 (`for`), 5 (`under`), 9 (`settlement`), 10 (`resolves`) and 11 (`continues`), a key absent in one being absent in the other; their `previous`, `answers` and `relies_on` may differ. Whether their signers are that agreement's signers is the grammar's.

**Building an act, ready to sign.** A client builds the payload, writes sets in their order, and refuses what would be rejected, naming the rule. The existing everyday act seals and signs it, with its place in the signer's sequence, under the spec hash and type of E2. The core library's builders and checker (`Terms::to_payload`, `Statement::to_payload`, `check`, `check_held`, `tools/agreements-check`, and their WebAssembly bindings) are encoding 2's: none is yet written for encoding 3, and this text changes no code.

## 9. What the checker answers

For one act, in this order, the first failing step giving the answer (invalid beats unknown):

1. The bytes are an act of the act format: **rejected**, Envelopes rule 1 (or 2, 5).
2. It opens: a private act and no key, **cannot open** (Envelopes rule 10); the lock or the commitment fails, **rejected**, Envelopes rule 3; its inside's shape or text, **rejected**, Envelopes rule 1 or 5.
3. Its spec hash and type (E2): another spec, **not this encoding**; another type, **rejected**, E2.
4. An everyday act (E1, E3): no signer, **rejected**, E1; `prev` absent or of two entries, **rejected**, Envelopes rule 13; `objects` or `acks`, **rejected**, E3.
5. The signature (E1): does not verify, **rejected**, E1; a scheme not implemented, remembered.
6. The payload (E4 to E20): **rejected**, the rule named (draft 26, §4.4, case 1: "Not an Agreements act").
7. **Invalid** (draft 26, §4.4, cases 2 to 8), every case found listed in `invalid`, in this order, and `rule` the first of them:
   1. case 2, 5.2.1: what is not a fingerprint, in section 4's order (its item 1); then, with several acts, 5.2.2: the act `body` names, held and not a Text act (E25);
   2. case 3, 5.10.1 and 5.2.1: each role, in the order of `parties` (section 4, item 2);
   3. case 4, 5.4.2: a role and no `in_force` (section 4, item 3);
   4. case 5, 5.3.1: each author at fault, in the order of `authors`, then the act's signer not among them (section 4, item 4);
   5. case 6, 5.7.1: with several acts, `previous` among the acts held (E23);
   6. case 7: not given (section 4);
   7. case 8, 5.8.6 (§4.4's case 8, "the case it names, of a condition in time with no anchor the Terms state", is 5.8.6's test: "Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid**"): **open** (draft 26, §7, "How a cMIP declares what it needs"). No byte of the act shows what a cMIP it names declares it needs, so the checker cannot give this case from the act, or from the acts held, as this text writes them. Two readings, neither chosen: (a) the checker is handed, beside the acts, what each cMIP named declares it needs, in a form Development would give, and finds the case where a declared need for a clock finds no key 9, or a declared need for a keeper finds no key 8 (a keeper never supplies a clock, 5.8.6), naming the socket; (b) the case is not the checker's: it is given by the grammar verifier, which holds the cMIPs. Until one is chosen, the checker gives no case 8, and an act that would show it passes this step.
8. A scheme not implemented: **unknown**, E1. Otherwise **pass**, with the notes: section 4's; E23's (a signer's line unchecked before the act, where `previous` names an act not held, or held and not opened); and E25's, where the open point there is read as a note (the words named and not held, or held and not opened).

**One fault, one rule** (draft 26, §4.4). A fault is rejected under the rule that gives the form of the field it is in, the innermost: E9 for a party (its signer's fingerprint included), E10 for a role's map, E7 for a socket wherever it sits (a role's spot, a power's rule, the body's socket), E8 for the body, E11 for `for`, E12 for the receiver, E13 for an author, E14 for a power, E15 for a Statement's kind, E16 for a call, E17 for `previous`, E6 for a keeper and a clock (key 8's form, section 4, under whichever reading is taken); E5 only for a field whose form is a bare fingerprint (`replaces`, `agreement`, `envelope`, `envelope_at`, `continues`, `under`, `settlement`, an entry of `resolves` or `answers`); E18 for a list's emptiness, order and repeats; E4 for a key; E19 and E20 for presence. A fault that fits two grammar rules is invalid under one (§4.4, its last paragraph): 5.2.1 for a body or a cMIP not named by fingerprint, 5.10.1 for a role's kind or `what`.

**Several faults.** Where an act is rejected for several faults, the checker names the first it meets and stops; which one is not fixed by this text, so each rejected vector has one fault only. Where an act shows several cases of invalid, all are listed, in step 7's order, and the first is named, as §4.4 asks of a verifier that names one.

**The answer is written**: `{ verdict, act, id, signer, rule, says, invalid: [{ rule, says }], notes: [{ rule, says }] }`, `verdict` one of `pass`, `rejected`, `invalid`, `unknown`, `cannot open`, `not this encoding`. These words are the checker's: the grammar's answer words (shown, not shown, unchecked, invalid; valid, not valid, in force, fork, late; with their qualifiers, draft 26, §3.6) are the grammar verifier's.

## 10. The encoding tasks of draft 26, item by item

Draft 26 gives no list of tasks for the encoding, as draft 25's section 10 did. It names the encoding in four places, and leaves it the bytes of the values in §7 that reach an act. Each, then each item of encoding 2's section 10, re-read.

**Where draft 26 names the encoding.**

1. **§4.1, "How each kind is written as bytes is the encoding's."** Section 3: E5 (fingerprint), E6 (identifier: a keeper, a clock), E7 (socket), the set of acts, E8 to E17; the words of §4.1 written as small numbers (E10, E14, E15, E16).
2. **§4.1, the set of acts: "Its bytes and its label are the encoding's."** Section 3, "The set of acts": the recipe written; the label's bytes, the joining, and where the rule stands open.
3. **§4.4, case 1, "under the encoding's rule that gives the form at fault".** Section 9, "One fault, one rule".
4. **§4.4, its last paragraph: "A field whose bytes are of the wrong kind is not an Agreements act, under the encoding's rule that gives that field's form."** The same.

**§7's values, where they reach bytes.**

5. **The set of acts: its hash and its label.** Open (section 3).
6. **Which fields take the set form.** None in this text (section 3); a cMIP's parameters are its own (E7).
7. **The empty set.** Its value is written by the same recipe with no member (section 3); its bytes wait on the joining.
8. **How Terms name their clock.** Key 9, 32 bytes, kept from encoding 2 (E6); open.
9. **How a cMIP declares what it needs.** Not in an act's bytes; case 8 open (section 9, step 7).
10. **How far a verifier follows.** Not in these bytes: the grammar verifier's. The checker follows nothing beyond one `previous` and one `body` (E23, E25).

**Encoding 2's section 10, re-read against draft 26.**

11. **Each field's kind** (encoding 2, item 1). Changes: the identifier is a keeper's or a clock's (E6); the words are an act id (E8); the set of acts is a new kind (section 3). The three exceptions that reach the grammar rules are §4.1's: a body's words or a socket's cMIP not a fingerprint (invalid, 5.2.1); a role's sort or `what` (invalid, 5.10.1); an entry of `relies_on` not a fingerprint (left unread, 5.2.3).
12. **Required and optional fields** (item 2). Stays, cited to §4.2 and §4.3 (E19, E20); a resolving update carries no `keeper` or `clock`.
13. **Lists** (item 3). Changes: a report's `relies_on` and `lines` go with the report; the keeper list is new, its order open (E18).
14. **The entries of `parties`** (item 4). Stays (E9, E10, E12, E13).
15. **Fingerprints** (item 5). Changes: the core's tags in this text are `MOR/act` and `MOR/spec`; `MOR/work` goes with the body's work hash; a set's label would be a tag of its own, open.
16. **`for` and `under`** (item 6). Stays (E11).
17. **A call** (item 7). Stays in bytes (E16); its form is the MICS block's to give (section 11, item 12).
18. **A report** (item 8). Goes: the MICS's (section 6).
19. **An amount** (item 9). Goes from this text with the report's lines; Money writes one.
20. **A payment and a settlement** (item 10). Stays, cited to 5.9.1 and 5.11.7: a settlement is named by its Money act's id (E5); the buyer's assent and the payment are two acts.
21. **Signatures by several people** (item 11). Stays: one act by each signer, matched as E24 says (5.1.2).
22. **The parts for machines of a body** (item 12). Stays: a cMIP's output (K1), not bytes of an act.
23. **The place's answer, the clock's answer, an envelope and its chain** (item 13). Changes: the keeper's answer (its records, §3.4) and the clock's are another layer's, not fields of these acts; this encoding writes only `keeper` and `clock` as identifiers (E6), and `envelope` and `envelope_at` as act ids (E5). The checker gives no answer about `envelope_at`: Envelopes' rules for such Terms are case 7 (section 4).
24. **What a verifier is told** (item 14). Stays: the grammar verifier's input, not an act's bytes.
25. **The answer words** (item 15). Stays (section 9).
26. **Limits on untrusted input** (item 16). Stays: none beyond the act format's (no data item deeper than 128 levels, Envelopes rule 2).
27. **Vectors for a late update** (item 17). Stays: no new field; the namings are in the bytes, `body` among them now (5.13.1).
28. **Vectors for the baker's rights** (item 18). Stays: they need the envelope's chain; Envelopes'.
29. **The field `envelope_at`** (item 19). Stays: key 12, exactly when key 11 is (E19).

## 11. The choices marked [lead], re-read against draft 26

Each was encoding 2's, the simplest that fits the act format in force, and the MOR lead's to take or change. Each is kept, dropped, or listed open.

1. The spec hash is computed as the core computes a MIR's (E2). **Kept**, for `SPEC_DRAFT_26`.
2. The report is written under the block's fourth proposal's spec hash. **Dropped**: the report is the MICS's (section 6).
3. No `objects` and no `acks` (E3). **Kept**.
4. Closed maps: an unknown field is rejected (E4). **Kept**; draft 26 says so (§4).
5. The body's words are named by work hash (E5). **Dropped**: the words are a Text act, named by its act id (5.2.2; E5, E8).
6. A place and a clock are named by a 32-byte identifier (E6). **Changed**: the place is the keeper, one or several; what a keeper's identifier is the hash of is **open**; the clock's 32 bytes are kept, and whether key 9 stands is **open** (E6).
7. A socket is `[cmip, params]`, `null` for none; an empty socket is the field left out (E7). **Kept**.
8. The words of the text (kinds, from whom) are written as small numbers; the resolve is kind 3 of a Statement, as `resolves` is kind 3 of a power (E10, E14, E15, E16). **Kept**.
9. A role is named by its position in `parties`, and carries no label (E10, E12, E13). **Kept**.
10. A power of sort `replaces` is written (4), and left unread (E14). **Kept** (§4.2, `powers`; 5.2.3).
11. A K7 kind is a socket, with parameters (E15). **Kept**.
12. One call per task (E16). **Kept**, with a call's form; draft 26 gives calls to the MICS's report block (§4.2, `calls`), so both stand until the MICS gives a call's bytes. Listed.
13. Sets are sorted, each entry once; an empty list is never written (E18). **Kept**; whether the keeper list is one of these sets is **open**.
14. A Terms act with `resolves` and no `continues` needs parties, authors and body (E19). **No longer a choice**: draft 26 says it (§4.3: "it carries what any Terms act carries").
15. A contest's content, and a K7 kind's, is any value, by fingerprint or inline (E20). **Kept**.
16. A report names one call, by `[act]` or `[act, task]` (E21). **Dropped**: the MICS's.
17. "Still owed" is named by `[report, line]` (E22). **Dropped**: the MICS's.
18. The receiver's two forms are `[0, position]` and `[2, root]`, E11's first items (E12). **Kept**; draft 26 says the two forms are "told apart in the bytes, not by guessing" (5.1.3).
19. A resolving update of Terms may carry `relies_on` (E19). **No longer a choice**: draft 26 says it (§4.3: "MAY carry `relies_on`").

**Open in this text, not yet chosen** (listed in the trace, under M8's "Open", by its numbers). None is picked here. Each is for the codemeister, who proposes; where the choice changes a verifier's answer, it is for Nobody, allegedly, too.

1. The set's label. *for the codemeister, who proposes.*
2. How a set's members are joined. *for the codemeister, who proposes.*
3. Whether the set's rule is a row of E5 or an E-rule of its own (E26). *for the codemeister, who proposes.*
4. Which fields may hold a set's value (none in this text, as draft 26, §7, says). *for the codemeister, who proposes, and for Nobody, allegedly.*
5. The keeper field's form, for one keeper and for several. *for the codemeister, who proposes.*
6. Whether the keeper list is sorted. *for the codemeister, who proposes.*
7. What a keeper's identifier is the hash of. *for the codemeister, who proposes.*
8. Whether key 9 stands as 32 bytes. *for the codemeister, who proposes, and for Nobody, allegedly.*
9. Whether a `words` act held without its key, or not held, gives a note or nothing. *for the codemeister, who proposes, and for Nobody, allegedly.*
10. Which spec hashes are `TEXT`. *for the codemeister, who proposes, and for Nobody, allegedly.*
11. How a cMIP's declared needs are read, and by whom (case 8). *for the codemeister, who proposes, and for Nobody, allegedly.*
12. `SPEC_DRAFT_26`: not a choice; computed by M11 once the text was final, and again by N1 after wave four, and given in E2. *For the codemeister, who checks it.*

## 12. What changed from encoding 2

Entry by entry; each is draft 26's, or follows from it; the wording is the scribe's, to check.

- **In plain words; 1. How to read.** Changed: draft 26 named; "rejected" written as draft 26's "not an Agreements act"; the left-unread list is 5.2.3's, with the answer of `in_force` on coming into force in an update added; E25 new, E21 and E22 gone.
- **E1.** Stays; the signer's sequence counts every act, a Text act included.
- **E2.** Changed: `SPEC_DRAFT_26` in place of `SPEC_DRAFT_25`, not yet computed; the report's row goes; acts under encoding 2's hashes, the report block's included, are not this encoding.
- **E3, E4.** Stay; cited to draft 26.
- **E5.** Changed: the row for the body's words by work hash goes; the words are a Text act's act id (a row of their own, as any act); a Text act and a payment are among the acts named by act id; the rows that named a report's lines go; a row for the set of acts is one of two readings.
- **The set of acts.** New: its recipe written from §4.1; its label, its joining, and its place (a row of E5 or E26) open.
- **E6.** Changed: an identifier of a keeper or of a clock, in place of a place or a clock; the keeper's preimage open; the clock kept, its standing open.
- **E7.** Stays; the defaults cited to draft 26.
- **E8.** Changed: `words` is the Text act's act id; the held test is E25's.
- **E9, E10, E11, E12.** Stay in bytes; cited to draft 26 (5.10.1, 5.10.4, 5.1.2, 5.1.3, 5.1.4); E11 no longer serves a report's line.
- **E13.** Stays in bytes; changed in what is invalid: an author naming a party named by role is now invalid too (5.3.1); and Terms whose `authors` leave out the act's own signer are invalid (5.3.1, the scribe's session N1).
- **E14, E15.** Stay; cited to draft 26.
- **E16.** Stays in bytes; the call's form is the MICS block's to give; the report's naming of the payer's call goes.
- **E17.** Stays; cited to 5.7.1 and 5.12.4.
- **E18.** Changed: a report's `relies_on` and `lines` go; "no keeper" joins "absent means none"; the keeper list's order open; the set of acts is said not to be a sorted list in a field.
- **E19.** Changed: key 8 is the keeper field, its form open; key 13's default is the known parties; key 6 on an update gets its note; keys 11 and 12 stay; a resolving update carries no keeper and no clock; invalid case 4 reaches updates; case 5 includes an author by role; case 8 is listed, open.
- **E20.** Stays; `resolves` is the list of the tips' ids.
- **Section 6, E21, E22.** Gone: the report's bytes go to the MICS with the block; section 6 is a pointer.
- **E23.** Changed: "the same agreement" written as its test (from 5.7.1, by the lead's reading); a payment and a Text act among the acts that make an act invalid when `previous` names them.
- **E25.** New: the act `body` names, among the acts held (5.2.2; §4.4, case 2).
- **E24.** Stays; cited to 5.1.2. The building paragraph: the library is encoding 2's, and no code is changed.
- **Section 9.** Changed: step 6 reads E4 to E20; step 7 follows §4.4's eight cases, with E25 inside case 2 and E23 as case 6; case 7 not given; case 8 open.
- **Section 10.** Changed: draft 26's encoding tasks, then encoding 2's nineteen items re-read.
- **Section 11.** Changed: each [lead] choice re-read: 12 kept, 1 changed, 4 dropped, 2 no longer choices; the open points listed.
