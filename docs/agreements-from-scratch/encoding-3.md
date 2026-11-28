# Agreements, from scratch: the encoding, third edition

27 November 2026. Written by the scribe's session M8, from encoding 2 and draft 26; brought to draft 26 as the scribe's session P1 left it by the scribe's session P2 (wave five); to draft 26 as the scribe's session P3 left it, by P3; to draft 26 as the scribe's session P5 left it, by P5; to draft 26 as the scribe's session P6 left it, by P6; to draft 26 as the scribe's session P7 left it, by P7; to draft 26 as the scribe's session P8 left it, on the model of 28 November (no versions; the ending condition; the closing pointer; the keeper as a where), by P8; and to draft 26 as the scribe's session P9 left it (the word "valid"; the MOR lead's eight answers of 17:20), by P9, its quotations only; for the MOR lead to take or change; not a decision. Where each change comes from is in `draft-26-trace.md`, under "M8", "P2", "P3", "P5", "P6" and "P7", and, for P8, in `draft-26-report.md` and section 12 below.

## In plain words

Draft 26 (`draft-26.md`) says what each act of Agreements carries: Terms say what is agreed; a Statement is anything else said within an agreement (an assent, a counter signature, a contest, a resolve, or a kind a cMIP defines). This text says how each is written as bytes, so that two verifiers written apart agree on every act. It is `encoding-2.md` brought to draft 26, and changes only what draft 26 changed: the words of Terms are a Text act, named by its act id; the place is now the keeper, and Terms may name one keeper or several; the set of acts is a new kind of value; the report has gone to the MICS, with its bytes; and the checker's order of the cases of invalid is draft 26's, with one case more. `encoding-2.md` stays as it was; acts written under its spec hashes are not acts of this encoding. As the scribe's session P8 left draft 26, an agreement has no versions: its Terms are never replaced, it lives until its ending condition is met, and a new agreement's Terms may carry a closing pointer to an old one. No byte changes for it: the fields a replacement used are kept, as open items, for the codemeister to keep or retire (section 11, items 14 to 18).

The acts are written in the act format MOR already has (Envelopes, Part three): every act has an outside, which relays see, and a locked inside, which holds its specification, its type, its payload, and its place in its signer's sequence. A Terms act and a Statement are ordinary everyday acts, signed by one signer, under draft 26's own spec hash. Their payloads are small maps with numbered fields, in deterministic CBOR, closed: a field this text does not give makes the act rejected. A report is no longer written here: it is the MICS's act type, and its bytes are the MICS's (section 6).

Every list that is a set is written in one order, so that two people who mean the same thing write the same bytes. A socket (a field where a cMIP plugs in) is the cMIP's spec hash and its parameters; an empty socket is the field left out. Parties are a list; authors point into it by position. The receiver says, in its first item, whether it names a party by position or an agreement by its root. The words are not in the Terms: the Terms carry the act id of the Text act that holds them.

**What these texts do not give, and a writer must still take elsewhere.** The act around the payload: its outside, its lock, its `prev`, position and running summary (Envelopes, Part three, "The act", "Sequences", "The running summary"); the signer's identity, its genesis, and the binding that ties the signing key to it (Identity, sections 1 and 2, and Part three); `tagged_hash` and canonical text (Identity, "Encoding and conventions"). The Text act that carries the words (Text, rule 14, and its Part three). A cMIP's spec hash (Development). A report, and a call's meaning (the MICS's report block). An amount's unit and value (Money).

A checker reads an act's bytes and answers **pass**, **rejected** (no Agreements act: it never reaches the grammar rules), **invalid** (an act whose bytes, or the acts held beside it, show that it cannot count, with the grammar rule named), **unknown**, **cannot open** or **not this encoding**, naming the rule. It does not give the grammar's answers (in force, fork, unchecked and so on): that is the grammar verifier's.

Where draft 26 leaves a byte to this text and the choice has not been made, this text gives the readings and picks none: each is marked **open**, with the readings side by side, and listed in section 11 and in the trace. Where encoding 2 made a choice marked **[lead]** and draft 26 does not change it, the choice is kept, still marked **[lead]**; section 11 re-reads each.

## 1. How to read this text

The rules of this text are numbered E1 to E25, as in encoding 2: a rule keeps its number where it says the same thing; E21 and E22 (the report and its lines) are gone, and their numbers are not given again; E25 is new. Section 12 lists every change. A rule of draft 26 is cited by its number in draft 26 (5.2.2, §4.3). An Envelopes, Identity or Text rule is cited by its MIR. MUST and MAY are used as in RFC 2119. Formats are in CDDL, with the conventions of Identity, Part three, "Encoding and conventions" (closed maps; `? n => x` optional; `hash` is `bstr .size 32`; `[+ x]` one or more; `[* x]` zero or more; `[2* x]` two or more; every `tstr` canonical text).

Draft 26 has three answers for an act that does not hold, and this text keeps them apart:

- **rejected**: the checker's word for bytes that are **not an Agreements act** (draft 26, §3.6, §4): bytes that never reach the grammar rules. The core calls such an act **invalid** as an act: outside its specification's format (MICS, "Common conventions"), or refused by the act format. "Rejected" is the checker's verdict and no answer of the grammar. A checker names the rule of this text (or of the act format) that gives the form at fault (draft 26, §4.4, "One fault, one grammar rule", case 1).
- **invalid**: draft 26's word for an act of this encoding that shows, by itself or with the acts held, that it cannot count (§3.6, "Invalid"; §4.4, cases 2 to 8). A checker names the grammar rule.
- **left unread**: a value draft 26 says is not read and changes nothing. 5.2.3 lists them all: an entry of `relies_on` that is not a fingerprint; a call in Terms that do not hold the task it is attached to (§5.11); and a `what` on a role of sort future (5.10.4). A checker gives a note for each of these its bytes show: all but the call, since whether Terms hold a call's task needs their cMIPs, the grammar verifier's (E16). *Draft 26 as P8 left it no longer lists a power of sort `replaces` or the answer of `in_force` in a Terms act that carries `replaces`: no rule of it now reads either (section 11, open items 16 and 17).*

## 2. The act

**E1. An everyday act** (draft 26, §2: the act, Envelopes). Every act of this encoding is an everyday act of the act format in force (Envelopes, Part three, "The act"; Identity: every act other than a genesis, a rotation and a chain signature). Its outside MUST name its signer (field 0) and the binding of its signing key (Identity, rule 5); it is signed by that key over the act id. It MAY be public or private, and MAY be addressed (`to`) as any act. Bytes the act format refuses are rejected, named by the act format's rule (Envelopes rules 1, 2, 3, 5 and 13). A signature that does not verify over the act id with the key it carries is rejected (E1). A signature scheme the checker does not implement makes the act **unknown**, where no other rule fails (Identity, "Signature schemes"). *The checker verifies the signature with the key the act carries. That the key is the signer's at that point of its chain is the identity chain's to show (Identity, "Verification procedures"), and is not checked from one act's bytes.*

**Its place in the signer's sequence.** Its inside MUST carry `prev`, a position and a running summary, as every everyday act does (Envelopes rule 13): the act is the next of **all** its signer's everyday acts, whatever specification they are under (a Text act carrying words included), not of its acts in one agreement. `prev` names the signer's act before it, and is `[]` only for the signer's very first everyday act; the position counts from 1; the running summary is `S(p − 1)`, over every act before it (Envelopes, "The running summary"). The checker refuses an absent `prev`, or one of two entries, and checks nothing else of the sequence, as Envelopes says (position and summary are judged where a whole line is held). *A writer who copies a first act's `[]`, 1 and 32 zero bytes into a later act forks their own sequence: the signer's sequence is one line, kept across every act it signs, on every device. The payload's `previous` (E17) is another line: the signer's acts within one agreement (5.7.1). Both are written.*

**E2. Spec hash and type.**

| Act | Spec hash | Type |
| --- | --- | --- |
| Terms | draft 26's, `SPEC_DRAFT_26` | 0 |
| Statement | draft 26's, `SPEC_DRAFT_26` | 1 |

A spec hash is computed as the core computes a MIR's from its file (Development rule 26; `Spec::mir_file_hash` in the core library): `tagged_hash("MOR/spec", {0 => 4, 9 => text})`, where 4 is the kind of a MIR in Development's numbering, and `text` is the file's content with its final line break removed if it has one (only one; nothing else is removed), which must be canonical text. **[lead]**

- `SPEC_DRAFT_26`: of `docs/agreements-from-scratch/draft-26.md` as the scribe's session P9 left it on branch `claude/draft-26-outline-vbtvu7` (416 lines, 138,725 bytes): `76cc16a45813ac1c50ebbf1bfa60c0c14265b39e8cded84fa01454280466557b`, computed as this rule says, by the core library's `Spec::mir_file_hash` on the file. The plain sha256 of the file's bytes, which is not the spec hash, is `d9b9b2fbfc293dd852bdca03cc944e34f1a9f8d37f2d2e7ff5bf3bb3c0fd044e` (`sha256sum draft-26.md`). One changed byte of the file changes both. The values P8 gave (`a20fcbf1…` and `b8bde4c9…`) name the text before P9, and no longer. The values P7 gave (`eb8bfb87…` and `afadb7d5…`) name the text before P8, and no longer. The values P6 gave (`eff0648f…` and `5d63d56f…`) name the text before P7, and no longer. The values P5 gave (`783f6821…` and `a0ee4064…`) name the text before P6, and no longer. The values P3 gave (`60c0b84e…` and `c770b324…`) name the text before P5, and no longer. The values N1 gave (`04bae25c…` and `09ba9ce5…`) and M11's (`e9e5b683…` and `6ee29fc2…`) name the text before wave five, and no longer.

**Said aloud.** The hash is of the file **as published on its branch**. A writer uses the hash as given here, never one recomputed from a copy of their own: one changed byte in a copy is another specification. Acts written under a hash stay that text's, whatever is written later; a later draft is a new specification with a hash of its own, and nothing written under this one is updated. Encoding 2's hashes (draft 25's, `dd90f8af…`, and the report block's fourth proposal's, `7b65c60f…`) and encoding 1's name other specifications: an act under them is **not this encoding**.

Under `SPEC_DRAFT_26`, a type other than 0 or 1 is rejected. An act under any other spec hash is **not this encoding**. *A report is not one of draft 26's act types (draft 26, §4.3: "one act type, defined once, in the MICS's report block"): it is written under the MICS's hash and type, by the MICS's bytes, and this checker answers a report **not this encoding**.*

**E3. No `objects`, no `acks`.** An act of this encoding MUST NOT carry `objects` or `acks` in its inside; one that does is rejected. Its lines (an agreement's chain, by `replaces`; a signer's line within an agreement, by `previous`) and everything it names are in its payload, where draft 26 reads them (5.13.1). It MAY carry `refs` and a `hint` (Envelopes rules 6 and 20). **[lead]** **`refs` and `prev` are knots** (draft 26, 5.13.1: "the layer below's `prev` and `refs`"; "a verifier reads the fields of every layer of the core (§2)"): each fingerprint in them is a naming, which the grammar verifier reads for "shown after" as it reads one in a field of the payload (5.13.3). The checker reads `prev` only as E1 says (present, of one entry or none) and does not read `refs`: whether one act is shown after another is the grammar's, not the checker's (section 9). A `hint` names no act and is no knot.

**E4. A closed map.** Each payload, and every map within it (a role), is a closed map whose keys are the small unsigned integers its format lists. A key it does not list, or one that is not an unsigned integer, makes the act rejected. *Draft 26 says the same (§4, its opening; §3.6): a field §4 does not give makes the act not an Agreements act, and is never left unread (5.2.3).*

## 3. The kinds of value

Draft 26, §4.1: "Each field holds one kind of value". Each kind is written once, here.

**E5. A fingerprint** (draft 26, §3.1, **Fingerprint**; 5.2.1) is `hash`: a byte string of exactly 32 bytes. A fingerprint field that holds anything else is rejected, save where draft 26 says it reaches the grammar rules (§4.1's three exceptions: E7, E8, E10, and an entry of `relies_on`). What each fingerprint is of, and over which bytes, is in this table. A verifier cannot tell two kinds of fingerprint apart by their bytes: the field says which it is.

| Named | Its fingerprint | Over |
| --- | --- | --- |
| an act: a Terms act, a Statement, a Text act, a report, a payment; the root | its act id, `tagged_hash("MOR/act", outside)` | the act's encoded outside, which commits to its locked inside; the signature is not part of it (Envelopes, "How it fits together") |
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
- **Which fields may hold a set's value** (draft 26, §7: "in this text none does"). No grammar field holds a set's value: no key of section 4 or 5 is written as one. A parameter of a cMIP may (E7): a cMIP that asks for acts names them by this value (§4.1), in its own parameters, which only that cMIP reads, and the checker does not read them.

**Before any vector.** The label's bytes, the joining and the empty set's value are this text's to fix. They are fixed by the codemeister's proposal and written here before any vector of a set is written; none is picked in this text. Until they are written, no verifier conforms to `SPEC_DRAFT_26` on a set of acts.

*A set's value is no knot by itself (§4.1; 5.13.1): it names no act a verifier can read without the list it was computed from. The checker cannot tell a set's value from an act id by its bytes: where one stands in a field that holds act ids (an entry of `relies_on`, say), it is read as an act id, which no act held has.*

**E6. An identifier** (draft 26, §4.1: "an identifier (of a signer, a keeper or a clock)") of a keeper or of a clock is `hash`. Anything else is rejected, under E6.

- **A keeper's identifier** (5.8.1: "each by its identifier as a relay"; §4.2, `keeper`: "which Identity and Envelopes give"). **Open: what it is the hash of.** Reading (a): the keeper's identity hash, the act id of its genesis, as a signer is named (E5), since a keeper is a relay with an identity (Identity, Envelopes). Reading (b): 32 bytes kept as encoding 2 kept them, opaque, until Identity and Envelopes give a relay an identifier; a richer form would then be a new specification. Neither is chosen. *P8: reading (a) no longer rests on "a keeper lodges signed records": draft 26 has no keeper's record (5.8.1, 5.8.4).*
- **A clock's identifier** (5.8.5: "What a clock is, and how it is identified, is for the layer that gives it"). Kept as encoding 2 wrote it: key 9, 32 bytes, **[lead]**, and key 9 stands as written. What the 32 bytes are the identifier of is the layer's that gives the clock (5.8.5); draft 26's §7 still lists "How Terms name their clock" as open.

**E7. A socket** (draft 26, §3.1, **Task**; §4: "Every socket holds a cMIP by fingerprint, with its parameters") is a cMIP and its parameters, written as the act format writes them for a vow:

```cddl
socket = [ cmip: any, params: any ]   ; exactly two items
```

`params` is any value, which only that cMIP reads; a cMIP that takes none is given `null` (its parameters are still written: there is one form). **[lead]** An **empty socket is the field left out**: draft 26's defaults (5.4.1 for `in_force`, 5.5.2(e) for `condition`, one leg for `data`, 5.11.2 for `control`) then apply. A socket that is not an array of exactly two items is rejected: a socket written as a bare text address is rejected, not invalid (§4.1: "a socket that is not written as a socket at all … not Agreements acts"). In Terms, a `cmip` that is not a fingerprint, in that place of a socket, does not make the act rejected: it reaches the grammar rules, and the Terms are **invalid** (5.2.1).

**E8. The body** (draft 26, §4.2, `body`; 5.2.2) is the words, named by the act id of the Text act that carries them, and the socket of the cMIP that reads them (task K1):

```cddl
body = [ words: any, socket ]   ; words: the Text act's act id (E5)
```

Anything other than an array of two items, the second a socket, is rejected. `words` that are not a fingerprint make the Terms **invalid** (5.2.1). The checker reads no words: what `words` names is tested only among the acts held (E25). The body's cMIP (task K1) is given the act id in `words` as its input (draft 26, §6, K1's row: "the Text act `body` names, by its act id (5.2.2)").

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

Anything else is rejected, under E12: a bare number or a bare hash, `[0, h]` with `h` a hash (a signer is named by its position, never by its identity hash), and any other first item. A position that names a party named as an agreement is **rejected**, the checker naming E12 (5.1.3: "makes the act not an Agreements act"): an agreement is named as receiver by its root, `[2, root]`. A position beyond the list is read: draft 26 answers that no one receives by these Terms, **not shown** (5.1.4: "name as receiver a signer or a role that is not among their own parties"); the checker gives it as a note. **[lead]**: the first items 0 and 2 are E11's, "a party of ours" and "an agreement".

**E13. Authors** (draft 26, §4.2, `authors`; 5.3.1) are positions in `parties`:

```cddl
authors = [+ uint]   ; sorted, each once (E18)
```

Positions count from 0, as in E12. An entry that is not an unsigned integer is rejected. A position beyond the list, or one naming a party named by role or as an agreement, makes the Terms **invalid** (5.3.1: "Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, are **invalid**").

**The signer.** The act's signer, named on its outside (E1), is its first author, whether or not `authors` names it (5.3.1: "The signer of a Terms act is its first author, whether or not `authors` names them: `authors` names the other authors, and MAY name the signer too"). `authors` MAY hold the position of the party `[0, signer]` (E9) that names the signer, and need not. No Terms are invalid for leaving their signer out of `authors` (5.3.1). The Terms act is its signer's assent to those Terms (draft 26, §4.3, **An author's first act**: "The act that publishes Terms is its signer's assent to them"); no byte marks it, and no other act of the signer's is asked for it.

**A signer who is no party.** Where the act's signer is the `signer` of no party `[0, signer]` in `parties`, the Terms are **invalid**, at §4.4's case 5, after the authors (section 4, item 4; section 9, step 7.4). This is the MOR lead's reading 6 of 20:41 (`docs/lead/notes/2026-11-27-readings-for-p2.md`): "A Terms act signed by someone who is not a party is invalid." Draft 26 now names it so (5.3.1: "so are Terms whose signer is not one of the parties they name as signers"; §4.4, case 5). A resolving update carries no `parties` and no `authors` (E19): neither test is asked of it from its bytes (the lead's answer 5 of 21:45, the same note).

**E14. A power** (draft 26, §4.2, `powers`; §5.6) is its sort and its rule:

```cddl
power = [ sort: 0 / 1 / 2 / 3 / 4 / hash, rule: socket ]
; 0 assent, 1 counter_signature, 2 contest, 3 resolves, 4 replaces; hash: a K7 kind's cMIP
```

Anything else is rejected, a sort written as text included (§4.1: "a power's sort that is neither one of its words nor a fingerprint"). Sort 4, `replaces`, was written so that draft 26's case could be: an entry of that sort gave no power and was left unread (a note). **Open** (section 11, item 16): draft 26 as P8 left it has no sort `replaces` (§4.2, `powers`: "`assent`, `counter_signature`, `contest`, `resolves` (a resolve, §5.12), or a K7 fingerprint"); sort 4 is kept here, unread, not removed, for the codemeister. **[lead]** **What a power is for** (§4.2, `powers`): sort 0, 1 and 2 for a Statement of that kind; sort 3, `resolves`, for a resolve, a Statement of kind 3, `resolve` (E15; 5.12.5); a hash, for every Statement whose K7 kind's `cmip` is that hash, whatever its parameters. Two entries of one sort, with different rules, are two entries of the set (E18): an act they are for binds where any one of their rules says yes (§4.2; 5.6.1(b)). Which power a verifier reads is the grammar's; the checker reads none.

**E15. A Statement's kind** (draft 26, §4.3, `kind`):

```cddl
kind = 0 / 1 / 2 / 3 / [ cmip: hash, params: any ]   ; assent, counter_signature, contest, resolve, or a K7 socket
```

Anything else is rejected, a K7 kind whose `cmip` is not a fingerprint included: the grammar rules give no invalid case for a Statement's kind (§4.4's list has none), so that is a field of the wrong kind. Kind 3, **resolve**, is the act that resolves a fork and nothing more (§3.1, **Statement**; §4.3; E20). A K7 kind is its cMIP, whatever its parameters: a power's K7 kind (E14) matches it where its hash is the socket's `cmip`. **[lead]**: a K7 kind is a socket, with parameters, as "every socket holds a cMIP by fingerprint, with its parameters" (§4).

**E16. A call** (draft 26, §4.2, `calls`: "as the MICS's report block gives them"):

```cddl
call = [ task: 1..8, from: 0 / 1 / 2 ]   ; the task K1 to K8 by its number; 0 the doer, 1 the receiving side, 2 both
```

Anything else is rejected, a call carrying anything more included (a closed form: no token it does not know is read past). **One call per task**: two calls with the same task in one Terms act are rejected. **[lead]** The payer's call made by default (5.11.7) is not written in Terms: a payment holds it by default. *Whether a call is attached to a task those Terms hold is the grammar's (5.2.3: "left unread"), not the bytes'. Draft 26 gives a call's form to the MICS's report block: these bytes are encoding 2's, kept until the MICS gives a call's bytes (section 11, item 12).*

**E17. `previous`** (draft 26, §4.2, §4.3, `previous`; 5.7.1) is written as the act format writes `prev`:

```cddl
previous = [] / [hash]   ; [] for none: the signer's first act in this agreement
```

Anything else is rejected. It is always written, in Terms and in Statements (§4.2, §4.3: "`previous` | yes"). It names the signer's act before this one **within the same agreement** (5.7.1), whatever kind it is, but for a resolve of a fork of a line, which names **the shared act** both tips follow (5.12.4), not either tip. A signer's line starts afresh in each agreement (5.7.1): a Terms act writes `[]`. *P8: a Terms act written as a resolving update is no longer draft 26's (§4.2 no longer gives `resolves` or `continues` to Terms); the codemeister's answer 1 of 08:40 stands for a Statement of kind `resolve`.* **The author's first act** (§4.3, "An author's first act"): the Terms act is its signer's first act within its agreement, so that signer's next act there, whatever it is, names it, or the act after it, in `previous`; never `[]`. A party with no act in the agreement yet writes `[]`. *That Terms act is its signer's assent (§4.3: "The act that publishes Terms is its signer's assent to them: it is the assent counted in that signer's name, and the signer does not assent to them again"; the ledger's "Publishing the Terms is the publisher's assent", 27 November, 20:49–20:50). No byte of `previous` changes for it.*

**E18. Lists** (draft 26, §4.1, §4.2, §4.3).

- **No empty list.** A list field holds one or more entries. A list with nothing in it is left out: absent means none (no power, no call, no keeper, nothing relied on). An empty list is rejected. The one exception is `previous` (E17), which writes "none" as `[]`, as `prev` does.
- **Sets are sorted.** `authors`, `relies_on`, `powers`, `calls`, `answers`, `resolves` and the keeper field (key 8) are sets: their entries are in the bytewise lexicographic order of their deterministic encodings (byte by byte, a shorter encoding first where it is a prefix of a longer one), and each entry appears once. An entry out of order, or twice, is rejected. Order carries no meaning in them. **[lead]** *A sorted list of act ids, written in a field, is not the set of acts of section 3: that is one value computed from such a list, and no field of this text holds one. `resolves` is written as the list of the tips' ids (5.12.4), sorted as a set is.*
- **The keeper field** (key 8, section 4) is always a list, and a set: its identifiers sorted as the sets above, each keeper once. Draft 26 gives the keepers no order (5.8.3: "a count or a set of the keepers named, never an order"). **[lead]** A keeper list that is present and empty is rejected under this rule, as any empty list is: the MOR lead's answer 1 to the codemeister of 20:41 (`docs/lead/notes/2026-11-27-readings-for-p2.md`): "A keeper list that is present and empty is E18's fault." Draft 26 names it in §4.4's case 1: "a `keeper` present and holding no keeper (encoding 3, E18)".
- **One list keeps the writer's order**, because positions in it are named: `parties` (by `authors` and `receiver`). The same party twice in `parties` (the same bytes) is rejected (§4.2, `parties`): a spot that several fill is **one role, filled more than once** (5.10.2), not two identical roles. A signer named directly and the same signer able to fill a role are two different entries.
- **Named in two fields.** An act named in `relies_on` that another field of the same act also names is read once, as one naming, and is not rejected (§4.3, `relies_on`).

**E19 and E20** are the presence rules of Terms and of a Statement (sections 4 and 5).

**Canonical text.** Every text string anywhere in an act, a socket's parameters and a Statement's content included, is canonical text: the act format already makes an act invalid whose inside holds one that is not (Envelopes rule 5).

## 4. Terms (type 0)

```cddl
terms = {
  ? 0 => hash,             ; replaces: no rule of draft 26 now uses it (P8); open, section 11, item 16
  ? 1 => hash,             ; agreement: no rule of draft 26 now uses it in Terms (P8); open, item 16
  ? 2 => [+ party],        ; parties, in the writer's order
  ? 3 => [+ uint],         ; authors: positions in parties
  ? 4 => body,             ; body: [words, socket]; words: the Text act's act id (E8)
  ? 5 => [+ any],          ; relies_on: fingerprints; an entry that is not one is left unread (5.2.3)
  ? 6 => socket,           ; in_force (K2); absent: 5.4.1's default
  ? 7 => [+ power],        ; powers: [sort, rule] (K3)
  ? 8 => keeper,           ; keeper: one keeper or several, by identifier (E6): always a list, sorted (below)
  ? 9 => hash,             ; clock, by identifier (E6)
  ? 10 => receiver,        ; [0, position] / [2, root] (E12)
  ? 11 => hash,            ; envelope: the bake's act id
  ? 12 => hash,            ; envelope_at: the act of the envelope's chain these Terms cite
  ? 13 => socket,          ; condition (K4): the ending condition; absent: every known party (5.5.2(e))
  ? 14 => socket,          ; control (K6)
  ? 15 => [+ call],        ; calls
  ? 16 => socket,          ; data (K8); absent: one leg
  ? 17 => [+ hash],        ; resolves: no rule of draft 26 now uses it in Terms (P8); open, item 16
  ? 18 => hash,            ; continues: no rule of draft 26 now uses it in Terms (P8); open, item 16
  19 => [] / [hash],       ; previous
}
```

The keys follow the order of draft 26's table (§4.2) as it stood before P8, which is draft 25's. **P8.** Draft 26 as P8 left it gives Terms no `replaces`, no `agreement`, no `resolves` and no `continues` (§4.2): keys 0, 1, 17 and 18 are kept above, not removed, as open items (section 11, item 16). It gives Terms a field of its own for the closing pointer, `closing_pointer` (§4.2; 5.5.4: "Terms MAY carry, in `closing_pointer`, one or more closing pointers, each naming an earlier agreement by its root"): no key is written for it here; its name and key are the codemeister's (section 11, item 14).

**Key 8, the keeper field** (draft 26, §4.2, `keeper`; 5.8.1: "one keeper or several, each by its identifier as a relay"). One form, a list always:

```cddl
keeper = [+ hash]              ; one keeper is a list of one; sorted, each keeper once (E18)
```

One keeper and several are written the same way. A bare `hash` in key 8, or any form but a list of identifiers, is rejected under E6, the rule that gives the keeper's form; an empty list, one out of order, or one keeper twice, under E18. **[lead]** The keepers named are no socket (§3.4, **Keeper**: "not a cMIP, so the keepers named are not a task; the cMIP beside them is (K9)"), each entry is an identifier (E6), and the list is a set (E18). Draft 26 now names a socket beside the keepers (§4.2, `keeper`: "Beside them, a socket (task K9): the cMIP that says at how many of them an act must be; empty means every keeper named (5.8.3)"); where it is written, and under which key, is open (section 11, item 15): this section writes no byte for it. A keeper is not a clock: key 8 never stands for key 9 (5.8.6). A keeper is not an act, and a list of keepers is not the set of acts (§4.1: "its members are acts only").

**E19. Presence** (draft 26, §4.2's "Required" column, as it stood before P8; §4.3, "What a resolving update carries", before P8). *P8: draft 26's §4.2 now requires `parties`, `authors`, `body` and `previous` of every Terms act, and gives no `replaces`, `agreement`, `resolves` or `continues`; §4.3's paragraph is now "What a resolve carries", of a Statement only. The bullets below on keys 0, 1, 17 and 18, and on a resolving update, rest on no rule of draft 26 now; they are kept, not removed, as open item 16, for the codemeister.*

- `previous` (19) is required.
- `agreement` (1) is written exactly when `replaces` (0) is; one without the other is rejected.
- `envelope_at` (12) is written exactly when `envelope` (11) is; one without the other is rejected (§4.2, `envelope_at`).
- `continues` (18) is written only beside `resolves` (17), and names one of its entries; otherwise rejected (§4.2, `continues`).
- **A resolving update** is a Terms act written with both `resolves` and `continues`. It carries `replaces` and `agreement` (0, 1), `resolves` and `continues` (17, 18) and `previous` (19); it MAY carry `relies_on` (5); it carries **nothing else**. One that lacks `replaces`, or carries any other field (`parties`, `authors`, `body`, `in_force`, `keeper`, `clock`, the receiver, a socket, anything), is rejected (§4.3 before P8, "it carries nothing else"). This is a rule of the bytes only: whether the act in fact resolves a fork is the grammar's (5.12.4), from other acts, and an act written so that resolves nothing is read as 5.12.4 says, and is not rejected after the fact.
- `parties`, `authors` and `body` (2, 3, 4) are required in every other Terms act. Terms with `resolves` and no `continues` resolve nothing, and are read as an act like any other (§4.3 before P8, "it carries what any Terms act carries"), so they need all three.
- Every other field is optional.
- A Terms act with no `replaces` is read as a first Terms act, the root of its own agreement: §4.2 asks `replaces` "in every Terms act except the first", and nothing in one act's bytes shows that an act is not a first.

**What Terms show by themselves** (the checker answers **invalid**, the rule named), in draft 26's order (§4.4, "One fault, one grammar rule", cases 2 to 5 and 8; cases 6 and 7, and the second part of case 2, need other acts: section 7, section 9):

1. Case 2, 5.2.1: the body's `words` (an act id is a fingerprint: 32 bytes, E5), then the `cmip` of the body's socket, of `in_force`, of `condition`, of `control`, of `data`, and of each power's rule (in the order of `powers`), is not a fingerprint.
2. Case 3, for each role in `parties`, in their order: 5.10.1, its sort lacking or not one of the five; then 5.10.1, its `what` lacking or not a fingerprint (but for sort future); then 5.10.1, its spot socket lacking, or 5.2.1, its spot's `cmip` not a fingerprint (E10).
3. Case 4, 5.4.2: a party is named by role, and `in_force` is absent.
4. Case 5, 5.3.1: an author is beyond the parties, or names a party named by role or as an agreement (E13), in the order of `authors`. Then, as 5.3.1 now says (the MOR lead's reading 6 of 20:41, `docs/lead/notes/2026-11-27-readings-for-p2.md`), the act's signer named by no party `[0, signer]` (E13, "A signer who is no party"). Leaving the signer out of `authors` is no case (5.3.1).
5. Case 8, 5.8.6: Terms that do not supply what a cMIP they name declares it needs. A cMIP declares it in its own published text, and a verifier reads it from that act (5.8.6). **Open**: no byte of a Terms act says what a cMIP it names declares; section 9, step 7, gives the readings.

*Case 7 (Envelopes' rules for Terms that name an envelope, §4.4) needs the envelope's chain and Envelopes' rules: a checker of these bytes does not give it.*

**Notes the checker gives** (the act passes): an entry of `relies_on` that is not a fingerprint, left unread (5.2.3); a `what` on a role of sort future, not read (5.10.4); a receiver whose position is beyond the parties, by which no one receives (5.1.4, not shown). *P8: three notes rest on no rule of draft 26 now, and are kept as open item 17, not given until the codemeister says: a power of sort `replaces`; `in_force` in a Terms act that carries `replaces`; and `resolves` with no `continues` in Terms.*

## 5. Statement (type 1)

```cddl
statement = {
  0 => hash,               ; agreement: the root; the same act as key 1, an agreement having one Terms act (§4.3, P8); open, item 16
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

- **The same agreement.** An act is within the agreement its `agreement` field names (a Statement's `agreement`); a Terms act is within the agreement it is the root of: its own act id (§3.1, **Agreement**). *P8: a Terms act's `agreement` (key 1) is no longer draft 26's.*
- Where the act named opens and is a Terms act or a Statement of this encoding, by the same signer (the outside's field 0), within the same agreement, nothing is found.
- Where it is held and **cannot be opened** (a private act held without its key), what it is cannot be read: the act counts, its signer's line is **unchecked** before it (5.7.1), a note, and the act is **not invalid**.
- Otherwise the act is **invalid** (5.7.1): `previous` names an act of another signer, an act within another agreement, a report, a payment, an act of another specification (a Text act among them), or an act held that is **rejected** (a record that is no Terms act and no Statement, 5.7.1: "An act held that is not an Agreements act … an act whose `previous` names it is **invalid**").

Where `previous` names no act held, the act counts and its signer's line is unchecked before it (5.7.1): a note. Where its `previous` names nothing (`[]`), nothing is checked. *Whether two acts are a fork (two acts of one signer naming the same `previous`, 5.7.2) is the grammar's, and the checker does not answer it: it passes both tips.*

**E25. The act `body` names** (draft 26, 5.2.2; §4.4, case 2, its last part). For each Terms act with a `body` whose `words` is a fingerprint:

- Where the act it names is held, opens, and is a **Text act**, nothing is found. A Text act is an act under a Text spec hash, `TEXT` (below), of type 0, whose payload is as that Text draft's Part three gives it (Text, rule 14 and "Text act (type 0)"). The checker reads nothing else of it: not its words, not its signer, not whether it came first (5.2.2: "naming it by its act id is all that this asks").
- "A Text act invalid under Text's own grammar rules is no Text act here" (5.2.2). **Open**: whether the checker applies Text's own rules to the act `body` names. Reading (a): it does, as Text's checker would, and an act Text's rules make invalid is not a Text act, so the Terms are **invalid** (5.2.2). Reading (b): it reads the spec hash, the type and the payload's form only, and Text's other rules are the grammar verifier's. Neither is chosen.
- Where the act it names is held, opens, and is not a Text act (an act under another spec hash, of another type, or with a payload Text does not give), the Terms are **invalid** (5.2.2: "Where the act `body` names is held and is not a Text act, the Terms are **invalid**").
- Where the act it names is **not held**, or is held and **cannot be opened** (a private Text act, held without its key), the Terms are **not invalid**: "whether the Terms are invalid under this rule is **unchecked**, with a note of what is lacking; where several acts are checked together, the note names each" (5.2.2). The checker passes the act with a note naming 5.2.2 and the act lacking, by its act id, and whether it is not held or held and not opened; handed several Terms acts, it gives each its own note, each naming the act it lacks.
- Where that act is disowned by its signer's key change (Identity, rule 34), "the Terms stand, and they are **unchecked** as to their words" (5.2.2). A key change is the identity chain's to show (E1), not one act's bytes: the checker gives no answer about it, and the note is the grammar verifier's.
- **`TEXT`**: the spec hash of any draft of Text, each listed here. Held in the repository: Text draft 11 (`spec/MIR-text-draft-11.md`, the LATEST); MIR Text drafts 6 to 10 and MIP Text drafts 6 and 7 (`spec/archive/`). Each value is computed by E2's recipe from its file; none is written yet: the codemeister's to compute, before any vector. Drafts of Text not held in `spec/` (drafts 1 to 5) are listed as missing, not as values; the MIP drafts' texts define no Text act (a search for "Text act" in them finds none), and whether an act under their hash can be a Text act is not said. After the change to Development ("A specification is a Text act, named by its id", the ledger, 27 November, 14:47–14:52), the words act is named by its act id and this list goes.

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
   1. case 2, 5.2.1: what is not a fingerprint, in section 4's order (its item 1); then, with several acts, 5.2.2: the act `body` names, held, opened, and not a Text act (E25);
   2. case 3, 5.10.1 and 5.2.1: each role, in the order of `parties` (section 4, item 2);
   3. case 4, 5.4.2: a role and no `in_force` (section 4, item 3);
   4. case 5, 5.3.1: each author at fault, in the order of `authors`; then the act's signer named by no party `[0, signer]` (5.3.1: "so are Terms whose signer is not one of the parties they name as signers"; the MOR lead's reading 6 of 20:41, `docs/lead/notes/2026-11-27-readings-for-p2.md`; E13; section 4, item 4). No step asks that `authors` name the signer (5.3.1: "No Terms are invalid for leaving their signer out of `authors`");
   5. case 6, 5.7.1: with several acts, `previous` among the acts held (E23);
   6. case 7: not given (section 4);
   7. case 8, 5.8.6 (§4.4's case 8, "the case it names, of a condition in time that names no clock the Terms state, or another clock than theirs", is 5.8.6's test: "Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid**"): **open**. Draft 26 says where the need is declared: "A cMIP declares what it needs in its own published text, in the form Development fixes (§7), and a verifier reads it from that act; where the verifier lacks the cMIP, this rule is **unchecked** for it" (5.8.6). No byte of the Terms act shows it, and the form is Development's, not yet fixed (draft 26, §7, "How a cMIP declares what it needs"). Two readings, neither chosen: (a) the checker is handed, beside the acts, each named cMIP's own published act, reads its declaration in the form Development fixes, and finds the case where a declared need for a clock finds no key 9, or a declared need for a keeper finds no key 8 (a keeper never supplies a clock, 5.8.6), naming the socket; where a cMIP named is not handed, 5.8.6 is **unchecked** for it, a note; (b) the case is not the checker's: the grammar verifier, which reads each cMIP's act, gives it, and the checker gives no note. Until one is chosen, the checker gives no case 8, and an act that would show it passes this step.
8. A scheme not implemented: **unknown**, E1. Otherwise **pass**, with the notes: section 4's; E23's (a signer's line unchecked before the act, where `previous` names an act not held, or held and not opened); and E25's (the act `body` names not held, or held and not opened: unchecked, naming 5.2.2 and that act).

**One fault, one rule** (draft 26, §4.4). A fault is rejected under the rule that gives the form of the field it is in, the innermost: E9 for a party (its signer's fingerprint included), E10 for a role's map, E7 for a socket wherever it sits (a role's spot, a power's rule, the body's socket), E8 for the body, E11 for `for`, E12 for the receiver, E13 for an author, E14 for a power, E15 for a Statement's kind, E16 for a call, E17 for `previous`, E6 for a keeper and a clock (key 8's form: a list of identifiers, section 4); E5 only for a field whose form is a bare fingerprint (`agreement`, `envelope`, `envelope_at`, `continues`, `under`, `settlement`, an entry of `resolves` or `answers`); E18 for a list's emptiness, order and repeats, a keeper list present and empty included (the MOR lead's answer 1 to the codemeister of 20:41, `docs/lead/notes/2026-11-27-readings-for-p2.md`); E4 for a key; E19 and E20 for presence. A fault that fits two grammar rules is invalid under one (§4.4, its last paragraph): 5.2.1 for a body or a cMIP not named by fingerprint, 5.10.1 for a role's kind or `what`; a Terms act whose signer is named by no party `[0, signer]`, 5.3.1, at case 5, after the authors (the MOR lead's reading 6 of 20:41, the same note). A note names its grammar rule as an invalid case does: the note on the words (E25) names 5.2.2 (draft 26, §4.4, case 2: "the note of what is lacking names 5.2.2") (the MOR lead's answer 2 to the codemeister of 20:41, the same note: "5.2.2 names the fault on a words note"); the note on `previous` (E23), 5.7.1.

**Several faults.** Where an act is rejected for several faults, the checker names the first it meets and stops; which one is not fixed by this text, so each rejected vector has one fault only. Where an act shows several cases of invalid, all are listed, in step 7's order, and the first is named, as §4.4 asks of a verifier that names one.

**The answer is written**: `{ verdict, act, id, signer, rule, says, invalid: [{ rule, says }], notes: [{ rule, says }] }`, `verdict` one of `pass`, `rejected`, `invalid`, `unknown`, `cannot open`, `not this encoding`. These words are the checker's: the grammar's answer words (shown, not shown, unchecked, invalid; valid, not valid, in force, fork; with their qualifiers, draft 26, §3.6; "late" and "per keeper" are no longer draft 26's, P8) are the grammar verifier's.

## 10. The encoding tasks of draft 26, item by item

Draft 26 gives no list of tasks for the encoding, as draft 25's section 10 did. It names the encoding in four places, and leaves it the bytes of the values in §7 that reach an act. Each, then each item of encoding 2's section 10, re-read.

**Where draft 26 names the encoding.**

1. **§4.1, "How each kind is written as bytes is the encoding's (encoding 3)."** Section 3: E5 (fingerprint), E6 (identifier: a keeper, a clock), E7 (socket), the set of acts, E8 to E17; the words of §4.1 written as small numbers (E10, E14, E15, E16).
2. **§4.1, the set of acts: "Its bytes and its label are the encoding's (encoding 3)."** Section 3, "The set of acts": the recipe written; the label's bytes, the joining, and where the rule stands open.
3. **§4.4, case 1, "under the encoding's rule that gives the form at fault".** Section 9, "One fault, one rule".
4. **§4.4, its last paragraph: "A field whose bytes are of the wrong kind is not an Agreements act, under the encoding's rule that gives that field's form, and under no grammar rule."** The same.

**§7's values, where they reach bytes.**

5. **The set of acts: its hash and its label.** Open (section 3).
6. **Which fields take the set form.** No grammar field (section 3); a cMIP's parameters may (E7).
7. **The empty set.** Its value is written by the same recipe with no member (section 3); its bytes wait on the joining.
8. **How Terms name their clock.** Key 9, 32 bytes, kept from encoding 2, and it stands (E6); what identifies a clock is the layer's (draft 26, §7).
9. **How a cMIP declares what it needs.** In the cMIP's own published text, read from that act (5.8.6), in a form Development fixes; not in a Terms act's bytes; case 8 open (section 9, step 7).
10. **How far a verifier follows.** Not in these bytes: the grammar verifier's. The checker follows nothing beyond one `previous` and one `body` (E23, E25).

*Values of draft 26's §7 written after this list:* **the keepers' cMIP** (P6), open (section 11, item 15); **the closing pointer's field** (P8, in place of P6's "which field of a first act names an earlier agreement"), open (section 11, item 14); **how an act is anchored to a clock** (P8), the clock's layer's, no byte of these acts. None renumbers the list.

**Encoding 2's section 10, re-read against draft 26.**

11. **Each field's kind** (encoding 2, item 1). Changes: the identifier is a keeper's or a clock's (E6); the words are an act id (E8); the set of acts is a new kind (section 3). The three exceptions that reach the grammar rules are §4.1's: a body's words or a socket's cMIP not a fingerprint (invalid, 5.2.1); a role's sort or `what` (invalid, 5.10.1); an entry of `relies_on` not a fingerprint (left unread, 5.2.3).
12. **Required and optional fields** (item 2). Stays, cited to §4.2 and §4.3 (E19, E20); P8: the Terms resolving update is no longer draft 26's (open item 16).
13. **Lists** (item 3). Changes: a report's `relies_on` and `lines` go with the report; the keeper list is new: always a list, sorted, each keeper once (E18).
14. **The entries of `parties`** (item 4). Stays (E9, E10, E12, E13).
15. **Fingerprints** (item 5). Changes: the core's tags in this text are `MOR/act` and `MOR/spec`; `MOR/work` goes with the body's work hash; a set's label would be a tag of its own, open.
16. **`for` and `under`** (item 6). Stays (E11).
17. **A call** (item 7). Stays in bytes (E16); its form is the MICS block's to give (section 11, item 12).
18. **A report** (item 8). Goes: the MICS's (section 6).
19. **An amount** (item 9). Goes from this text with the report's lines; Money writes one.
20. **A payment and a settlement** (item 10). Stays, cited to 5.9.1 and 5.11.7: a settlement is named by its Money act's id (E5); the buyer's assent and the payment are two acts.
21. **Signatures by several people** (item 11). Stays: one act by each signer, matched as E24 says (5.1.2).
22. **The parts for machines of a body** (item 12). Stays: a cMIP's output (K1), not bytes of an act.
23. **The place's answer, the clock's answer, an envelope and its chain** (item 13). Changes: what a keeper holds (P8: a keeper keeps no record in draft 26, 5.8.1) and the clock's anchorings are another layer's, not fields of these acts; this encoding writes only `keeper` and `clock` as identifiers (E6), and `envelope` and `envelope_at` as act ids (E5). The checker gives no answer about `envelope_at`: Envelopes' rules for such Terms are case 7 (section 4).
24. **What a verifier is told** (item 14). Stays: the grammar verifier's input, not an act's bytes.
25. **The answer words** (item 15). Stays (section 9).
26. **Limits on untrusted input** (item 16). Stays: none beyond the act format's (no data item deeper than 128 levels, Envelopes rule 2).
27. **Vectors for a late update** (item 17). *Withdrawn by P8*: draft 26 has no updates and no lateness (5.5.1); vectors for two endings (5.5.5) read the namings in the bytes, `body` and `closing_pointer` among them (5.13.1).
28. **Vectors for the baker's rights** (item 18). Stays: they need the envelope's chain; Envelopes'.
29. **The field `envelope_at`** (item 19). Stays: key 12, exactly when key 11 is (E19).

## 11. The choices marked [lead], re-read against draft 26

Each was encoding 2's, the simplest that fits the act format in force, and the MOR lead's to take or change. Each is kept, dropped, or listed open.

1. The spec hash is computed as the core computes a MIR's (E2). **Kept**, for `SPEC_DRAFT_26`.
2. The report is written under the block's fourth proposal's spec hash. **Dropped**: the report is the MICS's (section 6).
3. No `objects` and no `acks` (E3). **Kept**; `refs` and `prev` are knots (5.13.1).
4. Closed maps: an unknown field is rejected (E4). **Kept**; draft 26 says so (§4).
5. The body's words are named by work hash (E5). **Dropped**: the words are a Text act, named by its act id (5.2.2; E5, E8).
6. A place and a clock are named by a 32-byte identifier (E6). **Changed**: the place is the keeper, one or several, written always as a sorted list; what a keeper's identifier is the hash of is **open**; the clock's 32 bytes are kept, and key 9 stands (E6).
7. A socket is `[cmip, params]`, `null` for none; an empty socket is the field left out (E7). **Kept**.
8. The words of the text (kinds, from whom) are written as small numbers; the resolve is kind 3 of a Statement, as `resolves` is kind 3 of a power (E10, E14, E15, E16). **Kept**.
9. A role is named by its position in `parties`, and carries no label (E10, E12, E13). **Kept**.
10. A power of sort `replaces` is written (4), and left unread (E14). **Open** (P8): draft 26 no longer gives the sort (§4.2, `powers`); item 16 below.
11. A K7 kind is a socket, with parameters (E15). **Kept**.
12. One call per task (E16). **Kept**, with a call's form; draft 26 gives calls to the MICS's report block (§4.2, `calls`), so both stand until the MICS gives a call's bytes. Listed.
13. Sets are sorted, each entry once; an empty list is never written (E18). **Kept**; the keeper list is one of these sets.
14. A Terms act with `resolves` and no `continues` needs parties, authors and body (E19). **No longer a choice**, and since P8 no longer draft 26's: Terms carry no `resolves` (§4.2); every Terms act needs parties, authors and body (§4.2, "Required"); item 16 below.
15. A contest's content, and a K7 kind's, is any value, by fingerprint or inline (E20). **Kept**.
16. A report names one call, by `[act]` or `[act, task]` (E21). **Dropped**: the MICS's.
17. "Still owed" is named by `[report, line]` (E22). **Dropped**: the MICS's.
18. The receiver's two forms are `[0, position]` and `[2, root]`, E11's first items (E12). **Kept**; draft 26 says the two forms are "told apart in the bytes, not by guessing" (5.1.3).
19. A resolving update of Terms may carry `relies_on` (E19). **No longer draft 26's** (P8): a resolve is a Statement only, and "MAY carry `for` and `under` (a resolve made under a power to resolve, §5.12), `answers`, `relies_on` and `settlement`" (§4.3); item 16 below.

**Open in this text, not yet chosen** (listed in the trace, under M8's "Open", by its numbers). None is picked here. Each is for the codemeister, who proposes; where the choice changes a verifier's answer, it is for Nobody, allegedly, too.

1. The set's label. *Open: for the codemeister, who proposes.* The label, the joining and the empty set are this text's, fixed by the codemeister's proposal and written here before any vector of a set; until written, no verifier conforms to `SPEC_DRAFT_26` on a set (section 3, "Before any vector").
2. How a set's members are joined, and so the empty set's value. *Open: for the codemeister, who proposes*, as item 1 says.
3. Whether the set's rule is a row of E5 or an E-rule of its own (E26). *Open: for the codemeister, who proposes.*
4. Which fields may hold a set's value. *Read*: no grammar field; a cMIP's parameters may (section 3).
5. The keeper field's form, for one keeper and for several. *Read*: one form, always a list (section 4, key 8).
6. Whether the keeper list is sorted. *Read*: sorted, each keeper once; empty, E18's fault (E18).
7. What a keeper's identifier is the hash of. *Open: for the codemeister, who proposes.*
8. Whether key 9 stands as 32 bytes. *Read*: kept, 32 bytes (E6). Draft 26's §7 still lists how Terms name their clock as open.
9. Whether a `words` act held without its key, or not held, gives a note or nothing. *Answered by draft 26's 5.2.2*: unchecked, with a note of what is lacking, each act named (E25).
10. Which spec hashes are `TEXT`. *Read*: every Text draft, listed in E25; the values are the codemeister's to compute; after the change to Development the list goes (E25).
11. How a checker reads a cMIP's declared needs from the cMIP's own published act (5.8.6), in the form Development fixes, and whether the checker or only the grammar verifier gives case 8. *Open: for the codemeister, who proposes, and for Nobody, allegedly.*
12. `SPEC_DRAFT_26`: not a choice; computed by M11 once the text was final, again by N1 after wave four, by P3 after wave five, by P5 after it, by P6, by P7, and by P8, and given in E2. *For the codemeister, who checks it.*
13. Whether the checker applies Text's own grammar rules to the act `body` names (E25, "A Text act invalid under Text's own grammar rules is no Text act here", 5.2.2). *Open: for the codemeister, who proposes.*
14. **The closing pointer's field** (draft 26, §4.2, `closing_pointer`; 5.5.4: "Terms MAY carry, in `closing_pointer`, one or more closing pointers, each naming an earlier agreement by its root"; §7, "The closing pointer's field"). *Open: for the codemeister, who proposes; nothing chosen.* Draft 26 calls the field `closing_pointer`; its name and its key are the codemeister's to propose (the ledger, "The closing pointer: no longer valid, and it once existed", 28 November, 09:05–09:09, its "Arrived at" line the MOR lead's, to check). Its form: one or several roots (the MOR lead's reading B20), so a list, and a set (E18), is the reading that fits; whether it is written so is the codemeister's. It is a knot (5.13.1). *P6's item 14, "Which field of a first act names an earlier agreement", is withdrawn: draft 26 now gives the field (the MOR lead's "Which naming closes, 09:08", `docs/lead/notes/2026-11-28-ground-for-p8.md`, to check).*
15. The keepers' cMIP (draft 26, §4.2, `keeper`: "Beside them, a socket (task K9): the cMIP that says at how many of them an act must be; empty means every keeper named (5.8.3)"; 5.8.3; §6, K9; §7). *Open: for the codemeister, who proposes; nothing chosen.* Where it is named: inside key 8 beside the list (then key 8 is no longer a bare list, item 5), or under a key of its own (the MOR lead's reading 21 of the sixth attack: key 20, a stand-in until the MICS gives the header's form, to check). That it is a socket of its own, beside the keeper list, is his (the ledger, "Keepers: cross verification by default, a socket to lift it", 27 November, 23:52, to 28 November, 00:00: "It’s own socket makes sense."); empty, the default is cross verification, every keeper named (5.8.3), and a cMIP in it lifts it. Its form: a socket as E7 writes one, empty left out (E7's defaults then name 5.8.3). What it is asked (K9), as P8 left draft 26: whether the act is at enough of the keepers named, "a count or a set of the keepers named, never an order" (5.8.3); a keeper service named there gives its own answer, labelled as that service's (5.8.3). *P7's "given the keepers' records the verifier holds … where they disagree, what the answer rests on" is withdrawn: draft 26 has no keeper's record.* Also whether a call may name K9 (E16's `task: 1..8`).
16. **Fields and values no rule of draft 26 now uses** (P8). Kept in the bytes above, not removed, each for the codemeister to keep, retire or give again: Terms keys 0 (`replaces`), 1 (`agreement`), 17 (`resolves`) and 18 (`continues`); E19's bullets on a resolving update of Terms; power sort 4 (`replaces`, E14); and a Statement's key 0 (`agreement`), which now names the same act as key 1 (`terms`), an agreement having one Terms act (draft 26, §4.3). Until the codemeister says, a checker of this text reads them as encoding 3 before P8 did; that reading rests on no rule of draft 26 now. *Open: for the codemeister, who proposes.*
17. **Notes that rest on no rule now** (P8): a power of sort `replaces`, left unread; `in_force` in a Terms act that carries `replaces`; Terms with `resolves` and no `continues`. Draft 26's 5.2.3 no longer lists them. *Open: for the codemeister*, with item 16.
18. **A Statement kind that ends an agreement** (draft 26, 5.5.2(e): "These grammar rules name no Statement kind that ends an agreement: a kind that does is a K7 cMIP's, and an agreement ended without a new agreement is ended by a Statement of such a kind"). No byte: a K7 kind (E15). Listed so that no kind number is given to it here. Which act ends an agreement with no successor was the no-versions test's question 4; the MOR lead's answer 2 of 17:20, to check, is the sentence quoted.

Items 4, 5, 6, 8 and 10 are read as the MOR lead's readings of 27 November evening (`docs/lead/notes/2026-11-27-draft-26-readings.md`, rows C36/C45/F14, C8/C35/C34 and C33/F15), and the empty keeper list as his answer 1 of 20:41 (`docs/lead/notes/2026-11-27-readings-for-p2.md`); each is the lead's reading, not a decision of Nobody, allegedly (the trace, P2).

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

**Wave five (the scribe's session P2), to draft 26 as P1 left it.** Each line is the MOR lead's reading named, or draft 26's words; the trace gives each row.

- **Head line.** P2 named.
- **E3.** Changed: `refs` and `prev` are knots, as 5.13.1 now names them; the checker reads `prev` only as E1 says and does not read `refs`; "they are no knot" goes.
- **The set of acts.** Changed: no grammar field holds a set's value, a cMIP's parameters may; "Before any vector" added: the label, the joining and the empty set fixed by the codemeister's proposal before any vector, and until then no verifier conforms on a set.
- **E6.** Changed: key 9 stands, 32 bytes; its open point goes, draft 26's §7 still listing the clock.
- **E8.** Changed: K1's input is the act id in `words` (§6, K1).
- **E13.** Changed: the signer is the first author, whether or not `authors` names them; no Terms invalid for leaving the signer out; a signer named by no party `[0, signer]` invalid, on the lead's reading 6 of 20:41, at case 5.
- **E17.** A note added: "Publishing the Terms is the publisher's assent" (the ledger, 20:50); draft 26's §4.3 not yet changed; no byte changes.
- **E18.** Changed: the keeper field is a set, sorted, each once; a keeper list present and empty is E18's fault.
- **Section 4.** Changed: key 8, one form, always a list; the two readings go; item 4 (case 5) follows E13; item 5 (case 8) reads the declaration from the cMIP's own act.
- **E25.** Changed: the act not held, or not opened, is unchecked with a note naming 5.2.2 and each act lacking (5.2.2); a Text act invalid under Text's rules is no Text act, whether the checker applies Text's rules open; the key change case written; `TEXT` is every Text draft, listed, values the codemeister's.
- **Section 9.** Changed: step 7.1 reads "held, opened"; step 7.4 drops the signer-in-`authors` test and adds the signer who is no party (the lead's reading 6); step 7.7 rewritten on 5.8.6's new words, still open; step 8's E25 note named; "One fault, one rule" gains the empty keeper list (E18), the signer who is no party (5.3.1, case 5) and the notes' rules (5.2.2 for the words, the lead's answer 2).
- **Section 10.** Items 6, 8, 9 and 13 follow.
- **Section 11.** The [lead] list's items 3, 6 and 13 follow; the open list: items 4, 5, 6, 8 and 10 read, item 9 answered by 5.2.2, item 11 reworded, item 13 new; items 1, 2, 3, 7 and 11 stay open. The hash lines (E2, item 12) are P3's, unchanged.

**Wave five (the scribe's session P3), to draft 26 as P3 left it.** No byte changes.

- **Head line.** P3 named.
- **Section 1, section 4.** §4.4's heading quoted as draft 26 now has it, "One fault, one grammar rule" (the lead's reading 15 of 20:55); this text's own paragraph in section 9 keeps its name.
- **E2.** `SPEC_DRAFT_26` and the plain sha256 of draft 26 as P3 left it.
- **E13.** The Terms act is its signer's assent (§4.3, his 20:50); the signer who is no party now in draft 26's words (5.3.1, §4.4 case 5).
- **E17.** The note on his 20:50 replaced by §4.3's words.
- **E18.** Draft 26's §4.4 case 1 quoted for the empty keeper list.
- **Section 4, item 4; section 9, step 7.4.** 5.3.1 quoted for the signer who is no party.
- **Section 9, "One fault, one rule".** §4.4's case 2 quoted for the words note.
- **Section 11.** Item 12: P3 named.

**After wave five (the scribe's session P5), to draft 26 as P5 left it.** No byte changes.

- **Head line.** P5 named.
- **E2.** `SPEC_DRAFT_26` and the plain sha256 of draft 26 as P5 left it.
- **Section 11.** Item 14, new and open: which field of a first act names an earlier agreement (the lead's 22:45, 3); item 12: P5 named.
- No quotation of a rule P5 changed stands in this text (P5's check 5).

**After P5 (the scribe's session P6), to draft 26 as P6 left it.** No byte changes.

- **Head line.** P6 named.
- **E2.** `SPEC_DRAFT_26` and the plain sha256 of draft 26 as P6 left it.
- **E18, section 4's key 8.** §3.4 **Keeper** and 5.8.3 quoted as they now stand; the socket beside the keepers named, no byte written.
- **Section 10.** Draft 26's two new §7 values pointed to section 11.
- **Section 11.** Item 14: draft 26's §7 lists it (the lead's 23:22, 4); item 15, new and open: the keepers' cMIP (his 23:22–23:28; the socket, the lead's reading of 23:33, to check); item 12: P6 named.

**After P6 (the scribe's session P7), to draft 26 as P7 left it.** No byte changes.

- **Head line.** P7 named.
- **E2.** `SPEC_DRAFT_26` and the plain sha256 of draft 26 as P7 left it.
- **Section 11.** Item 15: the socket beside the keeper list is his (23:52 to 00:00), the default cross verification; its bytes and key stay open, for the codemeister; item 12: P7 named.
- No quotation of a rule P7 changed (§3.6 **Unchecked**, 5.5.3, 5.8.3, 5.8.4, 5.10.6) stands in this text; E18's "5.8.3 reads how many of them show an act, and where they disagree" still holds.

**On the model of 28 November (the scribe's session P8), to draft 26 as P8 left it.** No byte changes, and no field removed. Each line is draft 26's words or the MOR lead's reading named; the report (`draft-26-report.md`, "What P8 changed") gives the entries they rest on.

- **Head line.** P8 named, with the model.
- **Section 1.** The left-unread list is 5.2.3's two and `relies_on`; the power of sort `replaces` and `in_force` on a Terms act that carries `replaces` go from it, listed as open items 16 and 17.
- **E2.** `SPEC_DRAFT_26` and the plain sha256 of draft 26 as P8 left it.
- **E5.** "a version" goes from the acts named by act id: an agreement has one Terms act (§3.1).
- **E6.** The keeper's identifier cited to 5.8.1 and §4.2 as they now stand (the MOR lead's reading 11 of the sixth attack); reading (a) no longer rests on a keeper's record.
- **E7.** The default of `condition` is 5.5.2(e), every known party.
- **E14.** Sort 4, `replaces`, kept and unread, open item 16; sort 3 is for a resolve, a Statement only.
- **E15.** Kind 3 is the act that resolves a fork (§3.1).
- **E17.** A signer's line starts afresh in each agreement (5.7.1; the MOR lead's reading B3); the Terms resolving update goes from draft 26, the codemeister's answer 1 of 08:40 standing for a Statement of kind `resolve`.
- **E18.** The keeper field: "a count or a set of the keepers named, never an order" (5.8.3).
- **Section 4.** Keys 0, 1, 17 and 18 marked as used by no rule, open item 16; key 6's note on `replaces` goes; key 13 is the ending condition, its default 5.5.2(e); the closing pointer's field named, no key written, open item 14; key 8 quoted as §4.2 now stands; E19's bullets on 0, 1, 17, 18 and the resolving update marked as resting on no rule now; case 4 no longer names an update; three notes moved to open item 17.
- **Section 5.** Key 0 of a Statement noted as the same act as key 1, open item 16.
- **E23.** A Terms act is within its own agreement; its key 1 is no longer draft 26's.
- **Section 9.** Case 8 quoted as §4.4 now has it ("a condition in time that names no clock the Terms state"); `replaces` goes from E5's list of bare fingerprints; "late" and "per keeper" go from the grammar's answer words.
- **Section 10.** Items 1, 2 and 4 quote §4.1 and §4.4 as they stand; the §7 values gain the closing pointer's field and how an act is anchored; item 12 names open item 16; item 23 no longer speaks of a keeper's records; item 27 withdrawn.
- **Section 11.** Items 10, 14 and 19 of the [lead] list re-read; open item 14 is now the closing pointer's field (P6's item 14 withdrawn); item 15 re-read, P7's wording on a keeper's records withdrawn; items 16, 17 and 18 new; item 12: P8 named.
- Every quotation of draft 26 in this text matches draft 26 as P8 left it (P8's check, the report).

**The scribe's session P9, to draft 26 as P9 left it.** No byte changes; quotations only.

- **Head line.** P9 named.
- **E2.** `SPEC_DRAFT_26` and the plain sha256 of draft 26 as P9 left it.
- **Section 9, step 7.** Case 8 quoted as §4.4 now has it ("or another clock than theirs", the MOR lead's answer 8 of 17:20, to check).
- **Section 11, item 18.** 5.5.2(e) quoted as it now stands (the MOR lead's answer 2 of 17:20, to check).
- Every quotation of draft 26 in this text matches draft 26 as P9 left it (P9's check, the report).
