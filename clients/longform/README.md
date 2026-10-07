# mor-longform

The long-form text format (roadmap step 8): the founding implementation of `cmips/cmip-long-form-draft-1.md`, a strict subset of Markdown on top of canonical text, for task 4 of the Text MIP. The web reader (step 10) renders documents with it.

## In plain words

A long document is a text act whose format field names this cMIP. This package reads the text, finds the headings, emphasis, quotes, lists, code and links, and writes HTML, with the plain text always one tap away. Every character it shows is taken from the text, with its position; so a test can prove, for any text, that the rendering hides only markup, adds nothing and keeps the order of the bytes (Text MIP, task 4, F102).

## What is here

| File | What |
| --- | --- |
| `src/format.ts` | The reading: blocks and inline content, each node with the positions of what it shows; `shown()`, `checkBound()`, `title()`. |
| `src/html.ts` | HTML rendering, its stylesheet, the plain view (with invisible characters shown as escapes, as rule 5a asks before signing terms), and a standalone page. |
| `src/text.ts` | Composing canonical text from a file, as a client should (Text MIP, rule 6). |
| `src/act.ts` | A document as a public text act: publish it; fetch one by id, open it, judge it through its signer's identity chain. |
| `src/cli.ts` | `mor-longform render <file> [--out page.html]` and `mor-longform check <file>`. |
| `examples/sample.md` | A test document using every construct. |
| `vectors/longform.json` | Test vectors: each text, the text its rendering shows, and this implementation's HTML (`npm run vectors` rewrites it). |

## Run

Build the core library's WebAssembly first (see `clients/README.md`), then:

```
npm install
npm test          # the format's cases, 20,000 generated texts, the vectors, and a document published and read back through real relays
npm run cli -- render examples/sample.md --out sample.html
```

## What the tests show

- Each construct renders as the cMIP says, including everything that must stay text: links with hidden addresses, HTML, `&amp;`, other link schemes, underscores, runs of four stars.
- The bound holds on every rendering tested: the positions shown are strictly increasing and every position hidden holds markup in a position the cMIP's markup declaration gives it (F149). A minus sign, a decimal point and a Devanagari vowel sign are shown inside every construct; readings tampered to hide them, or to hide a markup character where it is not markup (a `-` before a number, an LF inside a paragraph), are refused. On 20,000 generated texts, each checked canonical by the core library first, the HTML shows exactly the characters the reading says it shows.
- The floor under every format's declaration (Text MIP draft 6, the Text format task; F167, F174, F175, F178) is checked first, whatever declaration `checkBound()` is handed: real documents read by a hostile format that hides a currency sign, a minus sign, a decimal point, a bracket, a percent sign, a vowel sign, a question mark, an apostrophe, or ", " between two numbers, are refused and shown plain (`test/floor.test.ts`). Each clause's test was run with that clause removed and failed. Where the floor forbids hiding one of the format's own signs, the format shows it as text rather than refusing the document (F182): a `>` before a digit opens no quote, a link's `<` after a digit is shown, and emphasis or code markup between two digits is text. On the 20,000 generated texts, no reading is refused (804 were, before F182: 650 for a link's `<` directly after a digit, 127 for a quote's `>` directly before one, 27 for emphasis or code markup between two digits).
- A test identity publishes the sample as a text act on a relay; a reader who knows only its id and the relay fetches it, the core library judges it valid through the signer's chain, and it renders. A text act naming a format this client lacks is shown plain. A text act whose text is not canonical does not open, and the reader says which rule it breaks.

## Readings

Where the texts are silent, this implementation takes these readings. *Confirmed by Nobody, allegedly, 30 September 2026.*

1. **A document is a text act.** A long-form document is a text act (Text MIP, type 0) whose format field names this cMIP, not a publication with the text as media. *Task 4 is about text acts; a text act is readable by every client. The cost is the act size limit (the cMIP's stated costs).*
2. **"Adds no text" is read strictly.** A list marker is shown as written. A bullet glyph or a number of the browser's own would be a character not in the bytes, so the stylesheet turns the browser's markers off.
3. **What a format may hide.** *Superseded by F149 (6 October 2026):* not "anything but letters and digits" (F140's Unicode categories L and N, which let a format hide a minus sign, a decimal point or a vowel sign), but only its own declared markup, in the positions it declares it. The cMIP's markup declaration lists them; `checkBound()` checks every hidden character against it, from the text itself, and `renderHtml()` shows the text plain, flagged, if a reading would break it.
4. **A line break stays a line break.** Markdown joins the lines of a paragraph; this format shows each LF as a break, as the plain text does.
5. **Emphasis pairs by length only.** A simpler rule than Markdown's, so any two implementations agree on strange text (the cMIP, rule 11).
6. **Links: `https:`, `http:` and `mailto:` only.** Any other scheme is text, so no link can run a script in a reader.
7. **Nesting stops at 16 levels.** Deeper quote or list signs are text; every reader's work stays bounded.
8. **A code block's label is shown.** It is made of letters, so hiding it would break the bound.
9. **Blocks are isolated for bidirectional text.** Each block is its own isolate (`dir="auto"`, `unicode-bidi: isolate`), so an override cannot reach past its block (the cMIP, rule 15, client conformance).
10. **The reader checks the text itself.** Relays check an act's shape, hash and signature, not its inside (relay transport cMIP), so a relay may hold a public text act whose text is not canonical. Holding its key, the reader MUST check it before relying on it (Text MIP, validity rule 1); the core library does so when it opens the act. `describeAct` does not say why an act did not open, so the reader asks the core with `openWithKey` and passes the reason on.
11. **The title is the first heading's text,** where a client needs one (the web reader's page title).

### Readings of the floor (7 October 2026; confirmed by Nobody, allegedly, F182)

12. **"A digit" is any character of category N**, as the floor names N among what it never hides: Arabic-Indic and Devanagari digits count, and so do ½ and Ⅻ.
13. **"Next to", "before", "after", "between" mean directly**, the character itself and its neighbour in the bytes, except for a run of hidden characters between two digits, which is read on the rendering.
14. **The lists by name.** Full stops and commas: the punctuation characters (Po) Unicode names FULL STOP or COMMA, and the Arabic decimal and thousands separators. Apostrophes: U+0027, U+2019, U+055A, U+FF07. Question and exclamation marks: the Po characters Unicode names QUESTION MARK or EXCLAMATION MARK, and the interrobangs. The percent signs are the Text MIP's own list, by code point.
15. **A letter followed by its combining marks is a letter** for "a space or apostrophe between two letters", so the space after "हिंदी" lies between two letters.
16. **An amount, for brackets,** is a run of digits, currency signs, plus and minus signs, full stops and commas, percent signs, apostrophes and spaces, holding a digit, with no space directly inside either bracket: "(5)", "(−2.50)", "($5)" and "(1 000 €)" are protected; "(5 EUR)" is not.
17. **A run of hidden characters between two digits that holds an LF ending a block is allowed whole**, a heading's, quote's, fence's or rule line's markup with it, since a new block is shown. An LF ends a block only where the declaration says so and the rendering does show another block after it.
18. **The format's markup the floor forbids hiding is shown as text** (F182, replacing "shown plain"): a `>` directly before a digit opens no quote; a link's `<` directly after a digit, or its closing `>` next to one, is shown, the address still the link; emphasis or code markup that would be hidden between two digits is text, the first such sign on the line first, and the line read again (the cMIP's rules 5, 10 and 11a).

For it, the WebAssembly bindings (`wasm/`) gained `checkText`: the core library's canonical-text check, with the pinned Unicode tables, used by the tests and by `mor-longform check`.
