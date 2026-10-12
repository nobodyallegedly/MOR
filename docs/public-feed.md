# The public feed on the website

*12 October 2026. Machine report for the roadmap item "The public feed, and two identities on two homes" (area: presentation). Decided by Nobody, allegedly, 12 October 2026: "The website needs a client, read only, that shows the public feed." Option (a), "keep it clean": the feed of Nobody, allegedly, and Machine, allegedly, only, every post verified in the visitor's browser like the site's pages; "(b) could become interesting as a window later": built to take any list of identities. Test identities only; nothing published, nothing released.*

## In plain words

A page of the site can now say: "show what these identities have posted in public." It names them by their identity hash, with a name for each. The visitor's browser, not the server, then does the work: for each identity it finds where that identity keeps its posts (its homes, then the relays its routes name), fetches the posts, and checks every one with MOR's core library, as it already checks the page. Each post appears under its author's name, marked **Verified**. A reply appears with the post it answers above it. A post the browser cannot check is shown as **Not verified**, with the reason, and its words are not shown.

MOR has no clock, so nothing signed says *when* a post was written. The feed shows the only order MOR can prove: an act signed after another names it. So each identity's posts are in the order it signed them, and a reply always comes after what it answers. Where nothing links two posts, they follow the page's order of identities, and the feed says plainly that this is not a time order. As you said: the interactions between the two will sort them.

The list of identities belongs to the page, not to the code. Showing a third identity (or, one day, a window onto many) is one more line in the page and a new version of the site; the display client does not change. The test shows exactly that, with three.

It only reads. It signs nothing, posts nothing, keeps nothing in the browser and asks nothing of anyone but the gateway, the homes and the relays.

Nothing on dubsar.org changes yet: you said "Not yet. It will probably be a separate page, but the page could have more." The element is ready for that page.

**What it looks like on a phone** (a test page, 390 pixels wide, Chromium): `docs/public-feed/feed-phone-chromium.png`. With a post that cannot be verified, and the bar opened: `docs/public-feed/feed-unverified-phone-chromium.png`.

## Precisely

### The specification: website cMIP draft 6

`cmips/cmip-website-draft-6.md`. Draft 5 stays. Draft 6 is draft 5 with **rule 13a, Feeds, marked new, for Nobody, allegedly, to approve**; its note, the plain words, the purpose, the dependencies and four stated costs are updated. The manifest's format is unchanged, so every version published so far verifies the same, and the site's spec test value is unchanged.

The element:

```html
<mor-feed>
  <mor-author identity="1fc19135ea25e19bcd213e7bc610091f8248cef76a4683d582b8d4a69b6ec144">Nobody, allegedly</mor-author>
  <mor-author identity="02a6585ffa967e3c8b7a4bf0b8dadda4890a03ee814b7f9200e2da5c789bc0e3">Machine, allegedly</mor-author>
</mor-feed>
```

Rule 13a in short: how a display client finds each identity's posts (genesis from the gateway's relays; chain and routes from its homes; its outbox route for the Text MIR, or for everything else; the gateway's relays too; the feed by signer); each post judged valid by the core library on the visitor's device; a post it cannot verify shown as not verified, its words and pictures not shown; signed order, newest first; a reply with the post it answers; the feed apart from the page's styles, and every identity listed beside the page with its whole fingerprint, where it was asked for, and the counts; read only.

### The display client (`clients/site`)

- `src/feed.ts`: finding, ordering and reading. One verifier for the whole feed, each identity looked up once; posts read with the barebone client's `readPost`, sharing that verifier.
- `src/shell/page.ts`: a `mor-feed` becomes a box for the display client; only its `mor-author` elements with a valid identity hash count, each once.
- `src/shell/app.ts`: fills each feed's box, in a sandboxed frame of its own (no scripts), after the page's acts.
- `src/shell/feed-view.ts`: the feed's look, phone first: one column, text at reading size, pictures to the frame's width, "Who signed it" under each post with the whole fingerprint and act id.
- `src/shell/view.ts`: the bar's new "Feeds" row: per feed, posts shown and verified; per identity, the page's name, the whole fingerprint, posts found and verified, the addresses asked, and those not reachable from a browser.

**Lookup, and the instruction not to change genesis or reader.** Neither `clients/genesis` nor `clients/reader` is changed. The site client already uses the genesis client's `lookUp` (through `verify.ts` and the barebone client's `readPost`), unchanged; the feed calls it the same way. What the feed needed and those clients do not have (choosing the outbox route, setting aside addresses a browser cannot reach) is written in the site client, `src/feed.ts`, `placesFor`. Nothing was copied: a copy of `lookUp` would not have isolated the site from the other session's change, since `readPost` and `verify.ts` call the original anyway. When that session changes `lookUp`, the feed follows it.

**One small change outside the site client:** `clients/barebone/src/post.ts` exports `Judging`, and `readPost` takes an optional judge as a fourth argument, so the posts of a feed share one verifier (otherwise each post would look its signer up again). Called as before, it behaves as before.

### Readings taken where the decision is silent

For Nobody, allegedly, to confirm or change.

1. **The page names the identities, and the names are the page's words.** The bar says so: "The names are this page's; the identities are what was checked." A `mor-author` with no name is shown by the start of its fingerprint ("Identity a61931b0…acd1"). *Identity's name acts could later replace the page's words.*
2. **Where the posts are looked for:** the identity's outbox route for the Text MIR, or failing that its outbox route for everything else (Envelopes: "posts are published on the signer's outbox routes"), then the gateway's relays. The genesis is first looked for at the gateway's relays.
3. **An address a browser cannot reach is not tried, and is said** (as the project lead's reading (2) of 12 October asks of a browser reader): an onion address or plain http. It is listed in the bar as "not reachable from a browser, not asked".
4. **A post that cannot be verified** keeps its place in the feed, dashed in red, under the name of the identity it claims, with the reason; its words and pictures are not shown.
5. **Signed order** (decided). Where nothing signed links two posts: the page's order of identities, then the higher position in the signer's sequence, then the act id. Acts that are not posts (pictures, routes) carry the order through an identity's line and are left out of the feed.
6. **A reply's answered post** is shown only when signed by an identity the feed names; a post by anyone else is named by its whole fingerprint and not shown (option (a), "keep it clean"). Opening that is the same setting as opening the list.
7. **At most 30 posts,** the first of the order, saying how many older ones were left out (the reader's front page lists 30 too).

### For the gateway on dubsar.org, when the page comes

- The gateway's `relays` must include a place holding each named identity's genesis (home1 and home2 do); otherwise the bar says that identity was "not looked up", and its posts are shown as not verified.
- The gateway must run a display client released with draft 6. One released with draft 5 shows the names as plain words and no post.
- Machine, allegedly's posts at home2's onion address alone would not be shown in a browser; its https outbox is what a visitor reaches.

### Stated costs (in the cMIP)

- A feed is not in time order; it says so.
- The homes and relays asked learn that someone opened the feed; every visit looks every identity up, so a feed naming many identities is slow on a phone, and a wide window would need paging, not written.
- A post kept only where a browser cannot reach is not shown.

### Tests

`clients/site/test/feed.test.ts`, 4 tests, real homes and relays on local ports, headless Chromium, a phone's screen (390 × 844):

1. Signed order on its own: a reply after what it answers, an identity's line never reversed, the page's order otherwise, acts that are not posts carrying the order.
2. Three test identities on two homes, each posting through its outbox route to its own relay (one route also naming an onion address): the feed newest first in signed order, every post verified in the browser, each under its name; **the third identity, added only in the page, with no change to the code**; Machine's reply on the other home shown with the post it answers; the picture from its checked bytes, within the phone's width; nothing scrolling sideways; the bar naming each identity by its whole fingerprint, where it asked, and the onion address it did not try; nothing fetched from anywhere but the gateway and the local relays.
3. **A post that cannot be verified** (its signer's identity chain found nowhere): shown as not verified with the reason, its words nowhere on the screen, the bar counting "1 not verified"; a malformed `mor-author` and the feed's other content dropped.
4. A feed naming no identity says so and fetches nothing.

`scripts/test-all.sh`, this branch against main (`6598322`), 12 October 2026:

| | main | this branch |
| --- | --- | --- |
| Rust workspace | 653 passed | 653 passed |
| `clients/site` | 58 | **62** (the 4 above), all pass |
| Every other TypeScript package and module (barebone, genesis, reader and the rest) | 230 | 230, all pass |
| Total | 941 | **945**, all pass |

On main, the first full run stopped at one site test timing out (the film pop-up, `films.test.ts`) while a build ran beside it. Run again alone, it passed, 8 of 8. The three modules the script had not reached then pass on main too (jpeg 14, video 6, carry 6). The barebone client's 9 tests pass with its small change.

### Not done here

- No page of dubsar.org carries the feed yet (Nobody, allegedly: "Not yet").
- The display client is not released and the site is not published: the project lead releases after merging; the author publishes from the Mac.
- The roadmap is left to the project lead to mark.

## The feed's page (F275, 13 October 2026)

*Built from F275, decided by Nobody, allegedly, 12 October 2026: "It will be on a separate page, with a link to the third thank you essay. And a box to write (public or private) to either NA or MA using a little switch to chose." And: "I think that we should have the option of showing the ones we reply to. It creates a nice rule: if it's not worthy of fitting the tableau, it goes unanswered." Website cMIP draft 7, new for him to approve; draft 6 stays, approved. Test identities only; nothing published, nothing released.*

### In plain words

dubsar.org now has a page of its own for the feed, `feed.html`. At the top, a button to the third thank-you text; it leads to a placeholder until you publish the text, and the page says so in one plain line. Under it, a box to write. Then the posts.

**The box.** A visitor taps a name, Nobody, allegedly, or Machine, allegedly, then Private or Public, writes, and sends. Beside the box, in plain words: private means sealed in the browser so that only that identity can open it, then left in its inbox, and never shown on the page; public means left unsealed in its inbox, readable by anyone who holds it, and shown on the page only if one of you answers it. And always: the note is signed by a one-time identity made in the browser, whose keys are forgotten once it is sent, so no reply can reach the writer; nothing is kept in the browser. It is the reader's way of writing, used as it is.

**What is shown.** A visitor's public note appears only above a reply of yours or of Machine's that names it. An unanswered note never appears. Labels, as you set them:

| How the note was answered | Above, on the note | Below, the reply |
| --- | --- | --- |
| You signed a pick of it, Machine answered | "Picked by Nobody, allegedly" | Machine, allegedly, under its name alone |
| Machine chose it under your nudge | "Picked by Machine, allegedly" | Machine, allegedly, under its name alone |
| You answered it yourself | no pick | "Answered by Nobody, allegedly" |

A label rests on the signed acts: before "Picked by Nobody, allegedly" is shown, the browser fetches your pick and checks that you signed it, for Machine, naming that very note. Whether Machine kept its published terms (the nudge cMIP's full reading) is not judged here; that comes with the nudge cMIP's own build.

The page on a phone, with three answered notes (a test page, Chromium, 390 pixels wide): `docs/public-feed/feed-page-phone-chromium.png`.

### Precisely

- **Website cMIP draft 7** (`cmips/cmip-website-draft-7.md`): rule 13a gains "Visitors' notes" (what a note is, where it is looked for, the three labels), replacing draft 6's reading for notes; rule 13b, the writing box (`mor-write` with `mor-author` entries, the display client's own box, private and public, the one-time identity, the inbox from the routes); rule 21 names the new gateway setting; four stated costs added and "Pages without programs" amended. Draft 6 is unchanged in its own file.
- **The page**: `docs/dubsar.org/feed.html`, the two identities' hashes in the box and the feed; the link `https://reader.dubsar.org/#THIRD-THANK-YOU`, a placeholder to replace with the act's id.
- **The display client**: `src/write.ts` (private: the reader's `recipient` and `sendMessage`, imported unchanged; public: the same act unsealed, its one-time identity made as the reader makes one, copied, since the reader keeps that inside its private send); `src/shell/write-box.ts` (the box); `src/shell/page.ts` and `app.ts` (the box laid over its place, the place as tall as the box); `src/feed.ts` (notes found by the reply's reference at the places the feed asks, checked as posts, and who picked them read from the pick or nudge the reply names); `src/shell/feed-view.ts` (the note above its reply, the labels); `src/settings.ts` (`messageHomes`); the bar's new "Writing" row. `clients/reader` and `clients/genesis` are not changed.
- **The nudge cMIP's spec hash** is a test value in `src/specs.ts`, `sha256("nudge cMIP, draft 2, test value until publication")`, since no code of that cMIP exists yet: the clients that sign picks and nudges must use the same.

### Readings taken where the decision is silent

For Nobody, allegedly, to confirm or change.

1. **A visitor's note** is a public text act addressed (`to`) to an identity the feed names, by an identity it does not name. Anyone else's post a reply names stays as draft 6 shows it: named by its fingerprint, not shown.
2. **The homes that take a visitor's one-time identity** are a gateway setting, `messageHomes`, as the reader's settings name them; with none, the box says the gateway takes no notes and sends nothing.
3. **A public note is addressed to the identity chosen** (`to`), so the inbox relay files it for that identity, and readers can tell it was written to someone.
4. **Private is the box's default**, Nobody, allegedly, the first name: the page's order.
5. **The page has no link from the front page yet.** You said the feed goes on a separate page; where the front page points to it is your call. Until then, `dubsar.org/feed.html` opens it.
6. **Finding a note:** at the places the feed already asks (each identity's outbox relays and the gateway's relays). A note sits at the inbox it was written to, so it is found when that inbox is one of those places, as on dubsar.org today, where each identity receives where it posts. Once F272 is merged, a reference names its signer, and the note is looked for at the one-time identity's routes too.

### For the gateway on dubsar.org

- `messageHomes` in the site's settings: the homes that take a visitor's one-time identity (as the reader's `messageHomes`).
- Each identity needs an inbox route and, for private notes, a published encryption key that counts.
- The gateway must run a display client released with draft 7.

### Tests

`clients/site/test/feed-page.test.ts`, 4 tests, dubsar.org's page with two test identities on two homes, a phone's screen:

1. The placeholder link and its one line; the box, private by default, each choice and "nothing is kept" said in plain words, within the phone's width.
2. **A visitor writes privately from the page**: the owner's inbox holds it sealed; the owner opens it, verified; no act readable in the open; nothing in the browser's storage.
3. **A visitor writes publicly**: the inbox holds the act unsealed, addressed to the identity chosen; the feed does not show it unanswered.
4. **Notes shown only beside a reply that names them, above it**: "Picked by Nobody, allegedly", Machine's reply under its name alone; "Picked by Machine, allegedly" under a nudge; "Answered by Nobody, allegedly" on his own reply; an unanswered note nowhere; nothing fetched beyond the gateway, the homes and the relays.

`scripts/test-all.sh`, this branch against main (`c044b20`): COUNTS.
