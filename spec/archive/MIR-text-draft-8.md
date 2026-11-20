# MIR: Text

*Draft 8, 15 October 2026, a working draft for Fable's aggregated review, for Nobody, allegedly, to approve: draft 7 (approved by Nobody, allegedly, 12 October 2026) with the decisions of the step 15 review (`docs/reviews/fable-step-15-text.md`) written in: **F296** ("B."), section 2 made a rule, rule 14, listing the fields a text act carries (T2's list, with `to` where it is addressed or answers someone, F276), a text act carrying `acks` or `objects` invalid, chained texts a cMIP's, by a companion act; **F295**, the text act's payload decoded strictly (a closed map, field 0 a text string, field 1 a 32-byte hash), the rule itself said once in the MICS's common conventions and pointed to here; and Fable's mechanics taken by the project lead: T3 (invalid beats unknown, rule 1, pointing to Envelopes rule 30) and T4 (the format task's bound is checked by a client implementing the format, as conformance, not by a verifier). Each change is marked "new in draft 8" where it stands. Written against Envelopes draft 10. Not the freeze-ready draft: old numbers and transition notes stay; the freeze-ready draft drops them after Fable's aggregated review. Draft 7's own header follows.*

*Draft 7, 12 October 2026: a transition draft, for Nobody, allegedly, to review and approve (F251). It is draft 6 (approved 30 September 2026, revised in place since, last for F182) written for plain reading, in Agreements draft 11's and Money draft 7's style. **It changes no rule.** How text runs most of the time comes first and the exact rules after, and the rules are numbered afresh in reading order, each with its old number beside it. Written against core v21, Identity MIR draft 11, Envelopes MIR draft 7, Agreements MIR draft 11 and the findings F1 to F266. The record of how each rule came about stays in draft 6 and in the findings log; this draft does not repeat it. The freeze-ready draft that follows drops the old numbers.*

## How to read this draft

Normal text is the protocol. Italic text is commentary: reasons, examples and plain summaries. A plain summary in italics (*How it runs most of the time*) repeats what the rules say; where the two seem to differ, the rule's own text decides.

Draft 6 numbered two lists separately: the six rules of canonical text, and the validity rules. Its numbers therefore repeat (draft 6 has a rule 1 in both lists). Each rule here shows its old number and the list it was in: "Rule 7 (was canonical 1)", "Rule 6 (was validity 5a)". The table at the end maps every old number to its new one. Code comments, tests, records and the other drafts keep citing the old numbers until the freeze-ready draft; the table is how to find them here.

These marks recur:

- *Client conformance:* a rule for the signer's own client, which no verifier can check.
- **New in draft 8 (Fxxx):** a statement draft 8 adds, from a decided finding.
- **New in draft 8 (Fable's Tk, mechanic):** a mechanic Fable's step 15 review proposed, taken by the project lead under the working practice, not a decision of principle.

The MIR has four parts. Part one is text as it runs most of the time: one form for every text, the text act, and what a client shows. Part two is the exact rules of canonical text. Part three is the act format, for reference. Part four is the tasks (the bound on formats), the reasoning, the open parameters and the freeze scenarios.

## Purpose

Text is the only native media of MOR, because the protocol itself speaks in text: terms, agreements, grants, names, messages. This MIR defines two things:

1. **Canonical text:** the one form every piece of text takes inside any act, so that the same words always give the same bytes, and therefore the same hash.
2. **The text act:** a plain message every client can read. Whatever cMIPs two clients use, their users can always exchange text.

## Dependencies

Identity, for signers. The act format is the envelope defined in the Identity MIR and completed by the Envelopes MIR. Every client implements this MIR.

## Words used in this MIR

- **Canonical text.** A string that meets the rules below. Every text field of every act, in every MIR and cMIP, is canonical text.
- **Text act.** An act whose payload is a canonical text, readable by any client.
- **Format.** An optional cMIP that gives text extra meaning when displayed, such as emphasis or links. The text stays readable as plain text without it.
- **Pinned Unicode version.** The version of the Unicode Standard whose tables every verifier uses for the normalization check: the latest version available when the core freezes (Unicode 17.0 as of this draft).
- **Bidirectional controls.** The characters U+202A to U+202E and U+2066 to U+2069, which change the visual order of text without changing its bytes.

## Part one: text as it runs most of the time

*How it runs most of the time: a person types; their client should normalize what they typed into canonical text, so the same words always give the same bytes; the text is signed inside an act like any other. Every client can show it as plain text, whatever format it names. Before anything is signed, a client must be able to show its plain text, and before terms, a grant or a clone is signed, it must show the bidirectional controls as what they are.*

### 1. One form for every text

#### Rule 1 (was validity 1). Every text field is canonical

Every text field of every act MUST be canonical text. An act with a text field that is not canonical is invalid. For a private act, only those who hold its key can check this, and they MUST before relying on it.

This holds whatever else in the act the verifier cannot read: an act of a specification the verifier does not implement, carrying a text that is not canonical, is invalid, not unknown (new in draft 8, Fable's T3, mechanic; Envelopes rule 30, "Invalid beats unknown").

*Canonical text is defined exactly in Part two (rules 7 to 12).*

#### Rule 2 (was validity 6). The client normalizes for the user

A client composing text SHOULD normalize it for the user: convert line breaks to LF, apply NFC, remove trailing spaces and a final line break, remove U+FEFF, replace each TAB with spaces, and remove other control characters and noncharacters, telling the user when it removed something visible, so users never see a rejection for invisible reasons.

### 2. The text act

A text act is an Envelopes MIR act of `type` 0 under the hash of this MIR, written `TEXT`. The fields it carries are rule 14's (new in draft 8, F296: draft 7 listed them here as a summary, "Outside: `signer` and `binding`. Inside: `spec` ..., `type` 0, `prev`, the payload, and optionally `refs`"). Like every act, its inside is locked: a public text carries its key, a private one is delivered to its recipients, possibly in a sealed container. A private text looks like any other act to a relay. *Its payload is in Part three.*

#### Rule 14 (new in draft 8, F296). What a text act carries

Besides what every act carries (Envelopes, Part three, "The act"), a text act carries, on its outside, `signer`, `binding`, its content key if it is public, and `to` where it is addressed or answers someone (F276); inside, `spec` (`TEXT`), `type` 0, the everyday fields (`prev`, position and running summary, Envelopes rule 13), the payload (Part three), and optionally `refs` (the acts or web resources it responds to or mentions) and `hint`. A text act carrying `acks` or `objects` is invalid.

Chained texts (a co-written document, a collective's log, a thread in one agreed order) are a cMIP's: each version stays a plain text act, and the cMIP carries the chain in a companion act of its own that names it. *A text act belongs to no core chain. Allowed `objects`, anyone could attach text acts to another's chain (a deal, a collective's record) by naming it, for a careless client to show as if they belonged there, and a text act naming an agreement's head would read, by Envelopes rule 15 taken literally, as a fork of that agreement. With a companion act every word stays readable by every client, at one extra act per step. "B." (Nobody, allegedly; F296.)*

#### Rule 3 (was validity 3). Plain text, always

A client MUST be able to display any valid text act as plain text, whatever its format.

#### Rule 4 (was validity 4). An unknown format still shows its text

A client that does not implement the format a text act names MUST still display its text as plain text. Format is the only case where an unknown cMIP does not make an act unknown: the text itself is always understood.

### 3. What a client shows

#### Rule 5 (was validity 5). Warnings, not rules

A client SHOULD warn about lookalike characters (letters from different scripts that look the same) and about invisible characters that can make text display differently from its bytes: the zero-width space (U+200B), the bidirectional marks (U+061C, U+200E, U+200F) and controls: every character of the pinned Unicode version whose general category is Cf (format) or whose property is Bidi_Control or Default_Ignorable_Code_Point (F140).

These are client warnings, not validity rules: text in every script, mixed as people need, stays valid. The zero-width joiner (U+200D) and non-joiner (U+200C) are needed by emoji sequences and several scripts, and are never warned about for their presence alone.

#### Rule 6 (was validity 5a). What you sign is what you saw

*Client conformance.* Before any act is signed, a client MUST be able to show all of its text as plain text, character for character, and SHOULD show it that way by default for agreements, terms and grants. Before signing terms, a grant or a clone (Agreements), a client MUST show every bidirectional control visibly, as an escape, in that plain-text view, so that no clause can display in an order different from its bytes. What you sign is what you saw. *This is a rule for the signer's own client; no verifier can check it, which is why it is conformance and why Agreements' act types are named explicitly (F78).*

## Part two: the exact rules of canonical text

### 4. The six rules

A canonical text is a sequence of Unicode characters, encoded as a CBOR text string, that meets all of these rules:

#### Rule 7 (was canonical 1). UTF-8

It is valid UTF-8. The character U+FEFF (byte order mark, zero-width no-break space) never appears, anywhere in the text.

#### Rule 8 (was canonical 2). One line break

Lines are separated by LF (U+000A) only. CR (U+000D), and the line and paragraph separators U+2028 and U+2029, never appear.

#### Rule 9 (was canonical 3). No control characters

No control characters other than LF: nothing from U+0000 to U+001F except U+000A, nothing from U+007F to U+009F. This excludes TAB.

#### Rule 10 (was canonical 4). No trailing spaces or line break

No line ends with a space character, the text does not end with one, and the text does not end with LF. The space characters are: U+0020, U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000. The list is fixed, so it cannot change with Unicode.

#### Rule 11 (was canonical 5). No noncharacters

None of the 66 code points Unicode reserves for internal use: U+FDD0 to U+FDEF, and the last two code points of every plane (U+FFFE, U+FFFF, U+1FFFE, U+1FFFF, and so on up to U+10FFFE, U+10FFFF).

#### Rule 12 (was canonical 6). NFC

The text is in Normalization Form C, checked with the tables of the pinned Unicode version. A character not yet assigned in that version is left as it is.

**The empty string and bidirectional controls.** The empty string is canonical text. Bidirectional controls are valid canonical text: isolates have legitimate uses in mixed-script text, and the protection against their misuse is in display (rule 6), not in validity.

### 5. How a verifier checks them

#### Rule 13 (was validity 2). Exactly, with the pinned tables

A verifier MUST check rules 7 to 11 exactly, and rule 12 with the tables of the pinned Unicode version, never with whatever version its system happens to have.

## Part three: act format

### Text act (type 0)

```cddl
text-payload = {
  0 => tstr,        ; the text, canonical
  ? 1 => hash       ; format: the cMIP that gives the text extra meaning
}
```

The payload is decoded strictly (new in draft 8, F295): a closed map, field 0 a text string, field 1, if present, a 32-byte hash, and no other field. A text act whose payload is not in this format, or whose type is not 0, is invalid, under the MICS's common convention for every specification (Envelopes rule 30). *Every client implements this MIR, so every client shows such an act invalid: a text act with no text, a byte string in field 0, a field 2, or type 7 under `TEXT` is not a text act anywhere.*

## Part four: tasks, reasoning, open parameters and freeze scenarios

### Tasks

- **Text format.** A cMIP accepts a canonical text and produces a rendering for display. It must accept every canonical text. It may change how text looks, but it may hide only its own markup: the characters its specification declares as markup, in the positions it declares them, and nothing else (F149, replacing F140's bound by Unicode category); and whatever its declaration says, it never hides a letter, a digit or a combining mark (general categories L, N and M), a currency sign (Sc), a mathematical sign (Sm) next to a digit, the percent, per-mille and per-ten-thousand signs (U+0025, U+066A, U+FE6A, U+FF05, U+2030, U+0609, U+2031), a character between two digits, a plus or minus sign (U+002B, U+002D, U+2212, and the dash-like minus signs U+2010, U+2011, U+2012, U+2013, U+2796, U+FE63, U+FF0D) directly before a digit or a currency sign or directly after a digit, the per-ten-thousand sign (U+2031), any run of hidden characters between two digits (a line break that ends a block excepted, since a new block is shown, not hidden), emphasis or code markup between two digits, a full stop or comma directly before a digit, a bracket directly around an amount, a space or apostrophe between two letters, or a question or exclamation mark (F167, F174); a format's declaration says which of its hidden characters end a block (F178); where the floor forbids hiding a markup character, the format shows it as text rather than refusing the document (F182); it must never add text that is not in the bytes. It shows the characters it does not hide in the order of the bytes, and it never makes one of them invisible or unreadable by styling: no colour, size or position hides one (F102). Plain display is always the fallback, and before signing, the plain text is always available (rule 6). *A format that could hide letters could hide a clause from readers of an offer; bounding what it may hide keeps readers, not only signers, protected (F82, M7). A format that could hide everything but letters and digits could still hide a minus sign, a decimal point or a vowel mark, and change what an amount or a word says without hiding a letter; so the bound is the format's own declared markup, which a client implementing the format checks its rendering against; conformance, as rule 6 (F149; new in draft 8, Fable's T4, mechanic: draft 7 read "which a verifier checks against the format's specification"). But the format's author writes that declaration, and the bound must hold against the publisher who picks the format; so under every declaration lies a floor the protocol sets, the characters that carry what an amount or a word says, which no declaration can make hideable (F167). Banning all punctuation and symbols would forbid markup itself; the floor names only what carries meaning. A format that could move text, a clause to a footnote at the end, a "not" to another column, could make a reader see an order the bytes do not say, as a bidirectional override can; a format that could shrink or colour text to nothing could hide it without "hiding" it. So a format keeps the order and keeps what it shows readable (F102).*

### Reasoning

- **One form, one hash.** *Agreements, names and text works are compared and hashed as bytes. If the same words could be written in two byte forms, two people could sign "the same" terms with different hashes, or claim "the same" work twice. Canonical text removes that.*
- **One final form.** *Editors often add a final line break without the writer noticing. Banning it removes the most common way the same words end up with two hashes.*
- **Noncharacters and U+FEFF are out.** *Unicode reserves noncharacters for internal use, and U+FEFF is an invisible leftover of file encodings. Neither belongs in text people exchange.*
- **What you sign is what you saw.** *Formats may hide markup, as a Markdown renderer hides the asterisks around bold words; they may not move words or make them vanish by styling. That is fine for reading, but not for signing: before anything is signed, the plain text is always one tap away, and it is the default for terms. Bidirectional controls are the one case where even plain text can lie about its order, so for the acts that bind people they are shown as what they are.*
- **The rules are fixed, not borrowed.** *Unicode grows every year. Rules that follow whatever version a machine has would let two verifiers disagree on whether an act is valid. So the space list is written out, control characters are defined by range, and normalization uses one pinned version. New characters, such as new emoji, remain usable. One rare edge remains: a combining mark added to Unicode after the pinned version is treated as unassigned, so two orders of such marks could both pass. Every verifier still agrees, which matters more. Unicode's stability policy guarantees that text in NFC under one version stays in NFC under every later one, so pinning never shuts out future text.*
- **No TAB.** *A tab displays at different widths in different places, and can hide alignment tricks in terms. Text that needs layout uses a format.*
- **Warnings, not rules, for lookalikes.** *Banning mixed scripts would exclude real people writing real languages. Deciding what looks alike is judgement, so it belongs to clients.*
- **Every client can open text.** *Every client implements the Envelopes MIR, so every client can unlock a public text and any private text addressed to it. Locking everything does not weaken text's universality.*
- **A text act is closed** (new in draft 8, F296). *Its fields are listed as a rule, as every payload map is closed, so no reader takes a text act for part of another's chain, and no light act carries the weight of an acknowledgement. What is given up, a chain of plain text acts, is kept by a cMIP's companion act, every word still readable by every client.*
- **Formats never lock text away.** *Text is the one media every client understands, so no cMIP may make a message unreadable. A format adds meaning; it never replaces the words, and it never hides them.*

### Open technical parameters

- The pinned Unicode version: the latest available when the core freezes.
- Maximum text length, if any: left to relays' storage policy.
- Language tags: not included; a format or a cMIP can carry them.

### Freeze scenarios

- Text universal across sub-networks: scenario 5 (a messaging client with no Money or Agreements still exchanges text with both parties).
- Canonical text in every act: all scenarios, since terms, names and messages are text.
- A text act with a format the receiving client lacks, displayed as plain text: scenario 5.
- Terms containing a bidirectional override, shown with the control visible before signing: scenario 1.
- A formatted text act whose rendering hides only markup, adds nothing, and shows the rest in the order of the bytes: scenario 5 (F102).
- A text act with no text, with a field 0 that is not a text string, with a field 2, and one of a type Text does not define: invalid in every client (new in draft 8, F295): a component under "Envelopes and Text".
- A text act carrying `objects`, invalid at every verifier and never a fork of another MIR's chain; one carrying `acks`, invalid (new in draft 8, F296): a component under "Envelopes and Text".
- A cMIP act a client does not implement, carrying a text that is not canonical: invalid, not unknown (new in draft 8, Fable's T3, mechanic): a component under "Envelopes and Text".

## Old numbers to new

Draft 6's rules, list by list, with their numbers in this draft. Every old rule has exactly one new number; none was split, merged or dropped. Rule 14 is new in draft 8 (F296) and has no old number.

| Old | New | Rule |
| --- | --- | --- |
| canonical 1 | 7 | UTF-8 |
| canonical 2 | 8 | One line break |
| canonical 3 | 9 | No control characters |
| canonical 4 | 10 | No trailing spaces or line break |
| canonical 5 | 11 | No noncharacters |
| canonical 6 | 12 | NFC |
| validity 1 | 1 | Every text field is canonical |
| validity 2 | 13 | Exactly, with the pinned tables |
| validity 3 | 3 | Plain text, always |
| validity 4 | 4 | An unknown format still shows its text |
| validity 5 | 5 | Warnings, not rules |
| validity 5a | 6 | What you sign is what you saw |
| validity 6 | 2 | The client normalizes for the user |
| (none) | 14 | What a text act carries (new in draft 8, F296) |

*Older texts mostly cite the validity list ("Text MIP, rule 3", "rules 3 to 5", "rule 4", "rule 5a", "rule 6": now 3, 3 to 5, 4, 6 and 2); the long-form cMIP and the roadmap name the other list, as "rule 4 of canonical text" and "rule 6 of canonical text" (now 10 and 12). Agreements' "rules 3 to 5" excludes rule 5a, which it cites on its own.*