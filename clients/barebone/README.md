# mor-barebone

The barebone client (roadmap step 9): it posts text with a picture, and shows posts, verified. At step 17 it publishes the first short post.

## In plain words

A post with a picture is two acts. The picture is published first: stripped to the picture alone (the JPEG Module), locked, and described by a public publication carrying its key. Then the post: a text act whose references name that publication (F27). A reader who knows only the post's id and a relay fetches the post, checks it through its signer's identity chain, then the picture: its publication, its signer, its bytes against their hashes, and that no withdrawal has been published. Only then is the picture shown, turned the right way up, under the name of whoever published it.

## What is here

| File | What |
| --- | --- |
| `src/post.ts` | `post()`, `publishPicture()`, `withdraw()`; `readPost()`, `listPosts()`. |
| `src/html.ts` | A post as HTML: its text (plain, or long-form when it names that format), its pictures under their own signers, standing, and the plain text one tap away. |
| `src/cli.ts` | `mor-post post`, `show`, `feed`, `withdraw` (run `npm run cli` for help). |
| `src/specs.ts` | The spec hashes a post names (test values). |

## Run

Build the core library's WebAssembly first (see `clients/README.md`). The JPEG Module's code (`modules/jpeg/src/jpeg.ts`) needs no package of its own. Then:

```
npm install
npm test
npm run cli -- post --file me.json --relay https://home1.dubsar.org --text "Thank you for the shower…" --jpeg earth.jpg
npm run cli -- show POST_ID --relay https://home1.dubsar.org --out post.html
```

`me.json` is a test identity made with `mor-genesis new` (clients/genesis).

## What the tests show

- A test identity posts a text with a phone photo. Another client, knowing only the post's id and the relay, shows it verified: the post and the picture valid for their signer's chain, the bytes matching the publication's work hash and size, no location, camera or preview left, turned as the camera said, and the same pixels as the photo taken (decoded by jpeg-js). The same from a separate process through the command line, and posting from the command line saves the identity file.
- Posts without a picture, and in the long-form format, show too; an identity's posts are listed in order.
- A post showing someone else's picture shows it under that picture's signer, "not by the poster".
- Once its signer withdraws a picture, readers stop showing it; the post stands. A withdrawal by anyone else changes nothing.
- A picture published by a client that did not strip it is shown, and the reader says what it still carries.
- Not shown, with the reason: bytes that are not a JPEG, a truncated JPEG, media of another type, a locked picture, bytes that do not match the work hash.
- References to acts that are not pictures are named, not shown.

Checked once in headless Chromium, not in the tests: the page shows the stripped phone photo upright, as its kept orientation says.

## Readings

Where the texts are silent, this client and the JPEG Module take these readings. *Confirmed by Nobody, allegedly, 30 September 2026.*

1. **A post is a text act that refers to its picture** (F27): no new act type and no post cMIP. A client without the JPEG Module still shows the text, and the reference as a reference.
2. **A referenced picture is shown under its own signer.** A picture published by another identity is labelled "not by the poster": a repost is a reference (Envelopes), never a claim.
3. **The JPEG Module is a media type** (Development, kind 3) filling task 5 (media interpretation); its hash is a test value until its creator is named at step 17.
4. **Stripping is a MUST for a posting client, with no option to keep metadata** in this client (Module, rule 6, client conformance). The Module itself accepts any JPEG (decided by Nobody, allegedly).
5. **The orientation is kept, as a one-entry Exif segment,** so the picture is never re-encoded to turn it. Readers apply it (Module, rule 3), as browsers do by default.
6. **The colour profile and Adobe's segment are kept.** They change how the colours are read; removing them would change the picture. The JFIF segment is kept without its thumbnail.
7. **Pixels are square.** A JFIF pixel density never changes a picture's shape (Module, rule 2), as in browsers.
8. **A reader never shows metadata, and says what a picture still carries** when another client did not strip it.
9. **Every picture is checked against its work hash and size,** not only purchases (Envelopes rule 14 asks it of purchases).
10. **The reader's own relays first.** A picture's bytes are fetched from the relays the reader was given, and only then from the places the publication names, which the poster chose.
11. **A withdrawal is an Envelopes act of type 3 with an empty payload,** naming the publication in `objects` as `[publication, publication]` (the publication is the root of its own chain). A reader looks for one in the feeds of the publication's signer and of its `for` identity at the relays it asks; a withdrawn picture is not shown, and the post stands. Silence proves nothing (relay transport cMIP): a withdrawal the reader never reached leaves the picture shown.

For it, the WebAssembly bindings (`wasm/`) gained references: `makeEveryday` takes `refs` (act ids), and `describeAct` returns an opened act's `objects`, `refs` and `webRefs`. The genesis client's `publish` passes `refs` through.
