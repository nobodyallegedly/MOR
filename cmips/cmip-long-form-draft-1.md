# cMIP: Long-form Text Format

*Draft 1, 30 September 2026 (roadmap step 8). Approved by Nobody, allegedly. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v17, the Text MIP draft 6, the Envelope MIP draft 6, the Production MIP draft 4, the relay transport cMIP draft 2 and findings F1 to F102. Not core: a founding cMIP for task 4 (text format), frozen at publication, competing with any other format.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A long document is plain text with a few signs that say "this is a heading", "this word is in italic", "this is a list". The signs are a small part of Markdown, which many people already write. A reader that knows this format hides the signs and shows the layout; a reader that does not shows the text as it is, signs and all, and it still reads well.*

*What the format may never do is set by the Text MIP: it hides only its own signs, never a letter or a digit; it never shows anything that is not in the text; and it shows what it does not hide in the order it was written (F102). So Markdown's links that hide their address, its codes such as `&amp;`, its embedded HTML and its renumbered lists are all left out. Anything outside the format is simply text, shown as typed. The plain text is always one tap away.*

## Purpose

This cMIP fills task 4 of the Text MIP (Production, task table): it accepts any canonical text and produces a rendering for display. It defines:

- the markup: which lines and signs mean what;
- the rendering: what is shown, what is hidden, and what a rendering may add around it;
- the checks that prove a rendering keeps the Text MIP's bound.

It defines no act type. A long-form document is a text act (Text MIP, type 0) whose format field (payload field 1) names this cMIP's spec hash.

## Dependencies

Text (canonical text, the text act, task 4) and Production. Envelope and the relay transport cMIP only to publish and fetch the acts, as for any act.

## Definitions

- **Line.** The text between two LFs, or between an LF and the start or end of the text. Canonical text has no other line break, and no line ends in a space.
- **Blank line.** An empty line.
- **Markup character.** One of: LF, SPACE (U+0020), `#`, `*`, `>`, `<`, `` ` ``, `\`, `-`. None is a letter or a digit. These are the only characters a rendering ever hides.
- **Space.** One of the space characters of canonical text (Text MIP, rule 4 of canonical text: U+0020, U+00A0, U+1680, U+2000 to U+200A, U+202F, U+205F, U+3000).
- **Shown.** A character is shown when the rendering displays it as itself, at its place in the text's order. Everything not shown is hidden.

## The markup

A text is read once, from the first line to the last, block by block; within a block, each line's inline content is read from left to right. The reading never fails: every canonical text has exactly one reading, and whatever is not markup is text.

### Blocks

Blank lines separate blocks and are hidden. At the start of a block, the first rule below that matches decides what it is.

1. **Nesting limit.** Quotes and list items nest at most 16 levels deep. At that depth, the signs that would open a deeper quote or list are text. *The limit keeps every reader's work bounded, whatever the text; F91 bounds acts the same way.*

2. **Code block.** A line of three or more backticks, followed by anything without a backtick (the label), opens a code block. It runs to the first later line made only of backticks, at least as many as opened it, or to the end of the text. The fence lines' backticks are hidden. The label and every line inside are shown exactly, with the LFs between them; nothing inside is markup. *A label, such as a language name, is shown, not hidden: it is made of letters.*

3. **Heading.** A line starting with one to six `#` and a space, followed by at least one character, is a heading of that level. The `#` signs and the space are hidden; the rest is inline content. *Seven `#` signs, or none followed by a space, are text: `#hashtag` is not a heading.*

4. **Rule line.** A line made only of three or more `-`, or only of three or more `*`, is a rule line: a separator, its signs hidden. *A line of `-` under a paragraph is a rule, never a heading: this format has one way to write a heading.*

5. **Quote.** A line starting with `>` opens a quote, which runs over every following line starting with `>`. From each, the `>` and one space after it, if there is one, are hidden; what remains of the lines is read again as blocks, inside the quote. *A quote ends at the first line not starting with `>`, a blank line included; there is no "lazy" continuation.*

6. **List.** A line starting with a marker and a space opens a list item. A marker is `-`, `*` or `+` (a bullet), or one to nine digits followed by `.` (a number). The item continues over each following line that starts with as many spaces as the marker and its space are wide; those spaces are hidden. Blank lines belong to the item only when a line so indented follows them. What remains of the item's lines is read again as blocks, inside the item. The list goes on, across blank lines, to the next item with the same kind of marker: the same bullet sign, or any number. Another marker starts another list; any other line ends it.
   - **The marker is shown as written.** A rendering shows the bullet sign or the number and its dot, never a bullet, number or letter of its own. The space after the marker is hidden. *Two items both numbered "1." say "1." twice. Showing "2." would add a digit that is not in the bytes.*

7. **Paragraph.** Any other line opens a paragraph, which runs over the following lines up to a blank line or a line that opens one of the blocks above. Each LF inside a paragraph is shown as a line break. *A line break stays a line break, as in the plain text; this format does not join lines.*

### Inline content

Within one line of a heading or paragraph, the signs below are read from left to right. Inline content never spans two lines.

8. **Escape.** A `\` followed by one of ``\ ` * _ # - + . > < [ ] ( ) ! | ~`` is hidden, and the character after it is shown as text. A `\` before anything else is text.

9. **Code span.** A run of backticks opens a code span, closed by the next run of exactly as many backticks on the same line. The backticks are hidden; everything between is shown exactly, markup included. A run with no closing run is text.

10. **Link.** A `<`, followed by `https:`, `http:` or `mailto:` and at least one character, none of them a U+0020 space, `<` or `>`, then a `>`, is a link. The `<` and `>` are hidden. The address between them is shown in full, and is the link's target, character for character. *A link never hides its address: the address is made of letters. Any other scheme is text, `<` and `>` included, so no link runs a script.*

11. **Emphasis.** A run of one, two or three `*` is a delimiter; a longer run is text. A delimiter can open if a character follows it on the line and that character is not a space; it can close if a character precedes it on the line and that character is not a space. Read the delimiters from left to right: one that can close closes the nearest open delimiter of the same length, if there is one, and every open delimiter after that one becomes text; otherwise, one that can open is opened; otherwise it is text. Delimiters still open at the end of the line are text. A pair of one `*` is italic, of two is bold, of three is bold and italic. Paired delimiters are hidden.
    *Runs pair only with runs of their own length: `**bold *and italic***` stays text, as typed; `**bold *and italic* **` does not either, since the last run follows a space. Write `***both***`, or close each in turn. A simple rule every reader applies the same way was chosen over Markdown's, which gives the same answer on ordinary text and a different one on strange text.*

Everything else is text. In particular `_`, `[`, `]`, `!`, `|`, `~`, `&` and HTML tags have no meaning: `[text](https://x.org)` and `<b>` are shown as typed.

## The rendering

12. **What is shown.** A rendering shows every character of the text except those this document hides, and hides only markup characters. It shows them in the order of the text (Text MIP, task 4, F102): a character shown never appears before one that precedes it in the text.
13. **What is added.** A rendering adds no character. It may add layout that is not text: space between blocks, indentation, a bar beside a quote, a line for a rule line, type size and weight for headings and emphasis, a type face for code, the link's underline. It never makes a shown character invisible or unreadable (Text MIP, task 4, F102): no colour, size or position hides one.
14. **Plain text, always.** A client that renders this format MUST offer the plain text, character for character, alongside the rendering (Text MIP, rules 3 and 5a), and before any act is signed.
15. **Isolation.** *Client conformance.* Each block SHOULD be displayed as its own bidirectional isolate, with its direction taken from its first strong character, so that a bidirectional control cannot reorder text beyond its block. *Rule 5a of the Text MIP shows controls visibly before terms are signed; isolation limits what one can do to a reader before that.*
16. **Links.** *Client conformance.* A client SHOULD open a link only on the reader's action, and SHOULD NOT fetch anything a link names to display the document.
17. **Title.** Where a client needs a title for a document, it is the text shown by its first heading, if it has one.

A client that does not implement this format shows the text plain (Text MIP, rule 4). *The markup was chosen to read well that way.*

## Checking a rendering

A rendering keeps rules 12 and 13 when the list of positions it shows, in the order it shows them, is strictly increasing, and every position not in the list holds a markup character. An implementation can compute that list from its own reading of the text, and SHOULD check it; the founding implementation checks it on every rendering it tests (`clients/longform`).

Test vectors: `clients/longform/vectors/longform.json`, each a text and the text its rendering shows. Every implementation of this cMIP MUST show the same characters on every vector; how it lays them out is its own.

## Stated costs

- **Less than Markdown.** No links with hidden addresses, no images, no tables, no footnotes, no HTML, no underscores for emphasis, no headings underlined with `=` or `-`, no lazy continuation of quotes and lists. *Each either breaks the Text MIP's bound or adds a way for two readers to disagree. Images come as media objects, through a media Module (roadmap step 9); a successor format may add tables, as long as it keeps the bound.*
- **Markdown habits that read differently.** A line break is a line break, so text wrapped by hand at a fixed width shows its wrapping. A line starting with a number and a dot, such as a year, is a list item unless its dot is escaped (`1984\.`).
- **Size.** A document is one text act, so it is limited by what a relay accepts for one act (at least 256 KiB on the founding relays). *A longer work is several documents, or a later format carried as media.*

## Reasoning

- **Markdown, cut down.** *People already write it, and it reads well as plain text, which matters because every client without the format shows it plain. Cutting it down to what keeps the Text MIP's bound was simpler than inventing a new markup nobody knows (decided by Nobody, allegedly, 30 September 2026).*
- **Hide only signs, show them in order.** *A reader of an offer must see the same words the signer's bytes say. A format that hid letters could hide a clause; one that moved text could turn "I do not agree" around; one that added numbers could change a list of terms. The format's list of hidden characters is fixed and small, so the bound is checked by a machine, not argued.*
- **One reading, never an error.** *A format that rejected some texts would make some acts unreadable, which the Text MIP forbids. Anything that is not markup is text.*
- **Markers as written.** *A number the author typed is part of the text. A number the reader's software invents is not.*

## Readings

Where the texts were silent, this draft takes the readings listed in `clients/longform/README.md`.
