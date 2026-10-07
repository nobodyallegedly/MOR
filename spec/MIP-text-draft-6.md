# MIP: Text

*Draft 6, 30 September 2026. Draft 5 with F102 applied (roadmap step 8, the long-form text format): a format shows what it does not hide in the order of the bytes, and never makes it invisible by styling. Written against core v17, the Identity MIP draft 10, the Envelope MIP draft 6 and findings F1 to F102. Draft 5 applied review round 2: bidirectional controls shown visibly before signing (a MUST for the Law act types), and a bound on what a format may hide.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

Text is the only native media of MOR, because the protocol itself speaks in text: terms, agreements, grants, names, messages. This MIP defines two things:

1. **Canonical text:** the one form every piece of text takes inside any act, so that the same words always give the same bytes, and therefore the same hash.
2. **The text act:** a plain message every client can read. Whatever cMIPs two clients use, their users can always exchange text.

## Dependencies

Identity, for signers. The act format is the envelope defined in the Identity MIP and completed by the Envelope MIP. Every client implements this MIP.

## Definitions

- **Canonical text.** A string that meets the rules below. Every text field of every act, in every MIP and cMIP, is canonical text.
- **Text act.** An act whose payload is a canonical text, readable by any client.
- **Format.** An optional cMIP that gives text extra meaning when displayed, such as emphasis or links. The text stays readable as plain text without it.
- **Pinned Unicode version.** The version of the Unicode Standard whose tables every verifier uses for the normalization check: the latest version available when the core freezes (Unicode 17.0 as of this draft).
- **Bidirectional controls.** The characters U+202A to U+202E and U+2066 to U+2069, which change the visual order of text without changing its bytes.

## Canonical text

A canonical text is a sequence of Unicode characters, encoded as a CBOR text string, that meets all of these rules:

1. **UTF-8.** It is valid UTF-8. The character U+FEFF (byte order mark, zero-width no-break space) never appears, anywhere in the text.
2. **One line break.** Lines are separated by LF (U+000A) only. CR (U+000D), and the line and paragraph separators U+2028 and U+2029, never appear.
3. **No control characters** other than LF: nothing from U+0000 to U+001F except U+000A, nothing from U+007F to U+009F. This excludes TAB.
4. **No trailing spaces or line break.** No line ends with a space character, the text does not end with one, and the text does not end with LF. The space characters are: U+0020, U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000. The list is fixed, so it cannot change with Unicode.
5. **No noncharacters.** None of the 66 code points Unicode reserves for internal use: U+FDD0 to U+FDEF, and the last two code points of every plane (U+FFFE, U+FFFF, U+1FFFE, U+1FFFF, and so on up to U+10FFFE, U+10FFFF).
6. **NFC.** The text is in Normalization Form C, checked with the tables of the pinned Unicode version. A character not yet assigned in that version is left as it is.

The empty string is canonical text. Bidirectional controls are valid canonical text: isolates have legitimate uses in mixed-script text, and the protection against their misuse is in display (rule 5a), not in validity.

## Act format

```cddl
text-payload = {
  0 => tstr,        ; the text, canonical
  ? 1 => hash       ; format: the cMIP that gives the text extra meaning
}
```

A text act is an Envelope MIP act. Outside: `signer` and `binding`. Inside: `spec` (the hash of this MIP, written `TEXT`), `type` 0, `prev`, the payload, and optionally `refs`: the acts or web resources it responds to or mentions. Like every act, its inside is locked: a public text carries its key, a private one is delivered to its recipients, possibly in a sealed container. A private text looks like any other act to a relay.

## Validity rules

1. Every text field of every act MUST be canonical text. An act with a text field that is not canonical is invalid. For a private act, only those who hold its key can check this, and they MUST before relying on it.
2. A verifier MUST check rules 1 to 5 of canonical text exactly, and rule 6 with the tables of the pinned Unicode version, never with whatever version its system happens to have.
3. A client MUST be able to display any valid text act as plain text, whatever its format.
4. A client that does not implement the format a text act names MUST still display its text as plain text. Format is the only case where an unknown cMIP does not make an act unknown: the text itself is always understood.
5. A client SHOULD warn about lookalike characters (letters from different scripts that look the same) and about invisible characters that can make text display differently from its bytes: the zero-width space (U+200B), the bidirectional marks (U+061C, U+200E, U+200F) and controls: every character of the pinned Unicode version whose general category is Cf (format) or whose property is Bidi_Control or Default_Ignorable_Code_Point (F140). These are client warnings, not validity rules: text in every script, mixed as people need, stays valid. The zero-width joiner (U+200D) and non-joiner (U+200C) are needed by emoji sequences and several scripts, and are never warned about for their presence alone.
5a. *Client conformance.* Before any act is signed, a client MUST be able to show all of its text as plain text, character for character, and SHOULD show it that way by default for agreements, terms and grants. Before signing terms, a grant or a clone (Law), a client MUST show every bidirectional control visibly, as an escape, in that plain-text view, so that no clause can display in an order different from its bytes. What you sign is what you saw. *This is a rule for the signer's own client; no verifier can check it, which is why it is conformance and why Law's act types are named explicitly (F78).*
6. A client composing text SHOULD normalize it for the user: convert line breaks to LF, apply NFC, remove trailing spaces and a final line break, remove U+FEFF, replace each TAB with spaces, and remove other control characters and noncharacters, telling the user when it removed something visible, so users never see a rejection for invisible reasons.

## Tasks

- **Text format.** A cMIP accepts a canonical text and produces a rendering for display. It must accept every canonical text. It may change how text looks, but it may hide only its own markup: the characters its specification declares as markup, in the positions it declares them, and nothing else (F149, replacing F140's bound by Unicode category); and whatever its declaration says, it never hides a letter, a digit or a combining mark (general categories L, N and M), a currency sign (Sc), a mathematical sign (Sm) next to a digit, the percent and per-mille signs, a character between two digits, a plus or minus sign (U+002B, U+002D, U+2212, and the dash-like minus signs U+2013, U+FE63, U+FF0D) directly before a digit or a currency sign or directly after a digit, the per-ten-thousand sign (U+2031), any run of hidden characters between two digits (a line break that ends a block excepted, since a new block is shown, not hidden), emphasis or code markup between two digits, a full stop or comma directly before a digit, a bracket directly around an amount, a space or apostrophe between two letters, or a question or exclamation mark (F167, F174); it must never add text that is not in the bytes. It shows the characters it does not hide in the order of the bytes, and it never makes one of them invisible or unreadable by styling: no colour, size or position hides one (F102). Plain display is always the fallback, and before signing, the plain text is always available (rule 5a). *A format that could hide letters could hide a clause from readers of an offer; bounding what it may hide keeps readers, not only signers, protected (F82, M7). A format that could hide everything but letters and digits could still hide a minus sign, a decimal point or a vowel mark, and change what an amount or a word says without hiding a letter; so the bound is the format's own declared markup, which a verifier checks against the format's specification (F149). But the format's author writes that declaration, and the bound must hold against the publisher who picks the format; so under every declaration lies a floor the protocol sets, the characters that carry what an amount or a word says, which no declaration can make hideable (F167). Banning all punctuation and symbols would forbid markup itself; the floor names only what carries meaning. A format that could move text, a clause to a footnote at the end, a "not" to another column, could make a reader see an order the bytes do not say, as a bidirectional override can; a format that could shrink or colour text to nothing could hide it without "hiding" it. So a format keeps the order and keeps what it shows readable (F102).*

## Reasoning

- **One form, one hash.** *Agreements, names and text works are compared and hashed as bytes. If the same words could be written in two byte forms, two people could sign "the same" terms with different hashes, or claim "the same" work twice. Canonical text removes that.*
- **One final form.** *Editors often add a final line break without the writer noticing. Banning it removes the most common way the same words end up with two hashes.*
- **Noncharacters and U+FEFF are out.** *Unicode reserves noncharacters for internal use, and U+FEFF is an invisible leftover of file encodings. Neither belongs in text people exchange.*
- **What you sign is what you saw.** *Formats may hide markup, as a Markdown renderer hides the asterisks around bold words; they may not move words or make them vanish by styling. That is fine for reading, but not for signing: before anything is signed, the plain text is always one tap away, and it is the default for terms. Bidirectional controls are the one case where even plain text can lie about its order, so for the acts that bind people they are shown as what they are.*
- **The rules are fixed, not borrowed.** *Unicode grows every year. Rules that follow whatever version a machine has would let two verifiers disagree on whether an act is valid. So the space list is written out, control characters are defined by range, and normalization uses one pinned version. New characters, such as new emoji, remain usable. One rare edge remains: a combining mark added to Unicode after the pinned version is treated as unassigned, so two orders of such marks could both pass. Every verifier still agrees, which matters more. Unicode's stability policy guarantees that text in NFC under one version stays in NFC under every later one, so pinning never shuts out future text.*
- **No TAB.** *A tab displays at different widths in different places, and can hide alignment tricks in terms. Text that needs layout uses a format.*
- **Warnings, not rules, for lookalikes.** *Banning mixed scripts would exclude real people writing real languages. Deciding what looks alike is judgement, so it belongs to clients.*
- **Every client can open text.** *Every client implements the Envelope MIP, so every client can unlock a public text and any private text addressed to it. Locking everything does not weaken text's universality.*
- **Formats never lock text away.** *Text is the one media every client understands, so no cMIP may make a message unreadable. A format adds meaning; it never replaces the words, and it never hides them.*

## Open technical parameters

- The pinned Unicode version: the latest available when the core freezes.
- Maximum text length, if any: left to relays' storage policy.
- Language tags: not included; a format or a cMIP can carry them.

## Freeze scenarios

- Text universal across sub-networks: scenario 5 (a messaging client with no Finance or Law still exchanges text with both parties).
- Canonical text in every act: all scenarios, since terms, names and messages are text.
- A text act with a format the receiving client lacks, displayed as plain text: scenario 5.
- Terms containing a bidirectional override, shown with the control visible before signing: scenario 1.
- A formatted text act whose rendering hides only markup, adds nothing, and shows the rest in the order of the bytes: scenario 5 (F102).
