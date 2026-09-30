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
- The bound holds on every rendering tested: the positions shown are strictly increasing and every position hidden holds a markup character. On 20,000 generated texts, each checked canonical by the core library first, the HTML shows exactly the characters the reading says it shows.
- A test identity publishes the sample as a text act on a relay; a reader who knows only its id and the relay fetches it, the core library judges it valid through the signer's chain, and it renders. A text act naming a format this client lacks is shown plain. A text act whose text is not canonical does not open, and the reader says which rule it breaks.

## Readings

Where the texts are silent, this implementation takes these readings. *Confirmed by Nobody, allegedly, 30 September 2026.*

1. **A document is a text act.** A long-form document is a text act (Text MIP, type 0) whose format field names this cMIP, not a publication with the text as media. *Task 4 is about text acts; a text act is readable by every client. The cost is the act size limit (the cMIP's stated costs).*
2. **"Adds no text" is read strictly.** A list marker is shown as written. A bullet glyph or a number of the browser's own would be a character not in the bytes, so the stylesheet turns the browser's markers off.
3. **Which characters are "letters or digits".** The Text MIP does not say; this format needs no answer, since it hides only nine fixed ASCII characters, none of them a letter or a digit. A format hiding non-ASCII signs would need one. *Suggested for the freeze (step 16): Unicode general categories L and N, under the pinned Unicode version, as normalization already is.*
4. **A line break stays a line break.** Markdown joins the lines of a paragraph; this format shows each LF as a break, as the plain text does.
5. **Emphasis pairs by length only.** A simpler rule than Markdown's, so any two implementations agree on strange text (the cMIP, rule 11).
6. **Links: `https:`, `http:` and `mailto:` only.** Any other scheme is text, so no link can run a script in a reader.
7. **Nesting stops at 16 levels.** Deeper quote or list signs are text; every reader's work stays bounded.
8. **A code block's label is shown.** It is made of letters, so hiding it would break the bound.
9. **Blocks are isolated for bidirectional text.** Each block is its own isolate (`dir="auto"`, `unicode-bidi: isolate`), so an override cannot reach past its block (the cMIP, rule 15, client conformance).
10. **The reader checks the text itself.** Relays check an act's shape, hash and signature, not its inside (relay transport cMIP), so a relay may hold a public text act whose text is not canonical. Holding its key, the reader MUST check it before relying on it (Text MIP, validity rule 1); the core library does so when it opens the act. `describeAct` does not say why an act did not open, so the reader asks the core with `openWithKey` and passes the reason on.
11. **The title is the first heading's text,** where a client needs one (the web reader's page title).

For it, the WebAssembly bindings (`wasm/`) gained `checkText`: the core library's canonical-text check, with the pinned Unicode tables, used by the tests and by `mor-longform check`.
