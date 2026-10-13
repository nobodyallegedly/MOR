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

`scripts/test-all.sh`, this branch against main (`c044b20`), 13 October 2026:

| | main | this branch |
| --- | --- | --- |
| Rust workspace | 653 | 653 |
| `clients/site` | 62 | **66** (the 4 above), all pass |
| Every other TypeScript package and module | 230 | 230, all pass |
| Total | 945 | **949**, all pass |

The first full run found two existing site tests that list dubsar.org's files exactly; each now counts `feed.html`, and the site's tests then pass, 66 of 66 (the full run stops at its first failing package, so the three modules were run after it, and pass: jpeg 14, video 6, carry 6). Main's code is unchanged since pull request 33's run, which counted 945.

## Ordered by a clock (13 October 2026)

*Built from Nobody, allegedly's decisions of 13 October 2026 (area: presentation): "A feed like the public feed could easily rely on a dumb anchoring." / "Anchoring precision and probability only matter when there is something to protect." And, for the page: "What the page can point towards if someone truly wish to interact are the clients and the link to home relays." Website cMIP draft 8, new for him to approve; draft 7 stays, approved. The timestamp clock Module draft 1, experimental. Test identities only; nothing published, nothing released.*

### In plain words

**The clock.** A clock is now the simplest thing it can be: an ordinary MOR identity that signs one kind of act, a *stamp*, saying "I held these posts at this time". Its time is its own computer's. A stamp proves one thing: that the clock's identity signed it. It does not prove the time is true; it is its operator's word. For a feed that is enough, since nothing is at stake (your words: precision only matters when there is something to protect). For money, the Bitcoin clock stays.

A small program, `mor-clock`, runs such a clock: it stamps the posts it is given, and the posts it finds at the relays you name, each once, never its own stamps, and never earlier than its last stamp even if its computer's clock is set back. It puts its stamps on its own relay.

**The feed.** A page names the clock it listens to, inside the feed, as it names the identities:

```html
<mor-clock identity="…the clock's identity hash…">the dubsar.org clock</mor-clock>
```

Where the posts carry that clock's stamps, the feed is ordered by them, across identities, which signed order cannot do: Nobody's post and Machine's post that do not name each other now come in the order the clock held them. At the top the feed says "Newest first, **ordered by the dubsar.org clock's stamps**: when the dubsar.org clock says it held each post, its word only." Each post shows its time (in UTC, so every visitor sees the same: "13 October 2026, 09:05 UTC"). Two things still hold whatever the clock says: a reply never comes before what it answers, and a post the clock has not stamped yet is shown at the top, marked "not stamped by the dubsar.org clock". A stamp signed by any other identity is never even fetched, so it orders nothing. Without a clock named, or if the clock has stamped none of the posts, the feed is in signed order and says it is not a time, exactly as before.

The page on a phone, ordered by a test clock across three identities, the newest post not yet stamped: `docs/public-feed/feed-clock-phone-chromium.png`.

**The pointers.** Under the writing box, the feed page now has a short section, "Take part": the box goes one way, so to post and be answered, make an identity of your own, with a client and a home. Then one plain line each: Dub; Dub on the web at `dub.dubsar.org`, **for testing only**, with both risks you accepted (F281) in a few words; MOR Identities, the desk the two identities are run from, on your own computer; and the two homes, `home1.dubsar.org` and `home2.dubsar.org`, "give its address to Dub". The real page names its clock by a placeholder, `CLOCK-IDENTITY`, until a clock runs: until then the feed stays in signed order.

### Precisely

- **The timestamp clock Module, draft 1** (`modules/module-clock-timestamp-draft-1.md`), under the anchoring cMIP draft 4 (item 4: parameters, points, proofs and rule, depth). Reference `[ the Module, the clock's identity ]`; point: seconds since 1970, UTC; a stamp is a public everyday act of the clock, type 1, `{ 0: time, 1: [+ act id] }`, at most 256, closed; proof: the stamp, valid for the clock's chain by the core library, naming the act; an act at its earliest stamp (anchoring cMIP item 2); depth: none. What it proves and does not, and its costs, stated. A client conformance for readers: an act placed at the earliest stamp of itself or of any act naming it.
- **Its code** (`modules/timestamp`, `mor-timestamp`, TypeScript): `src/stamp.ts` (the format, the test spec hash `sha256("timestamp clock Module, draft 1, test value until publication")`), `src/read.ts` (reading and judging a clock's stamps; the earliest stamp; the earliest by names), `src/service.ts` and `src/cli.ts` (`mor-clock run`, `mor-clock stamp`; `POST /stamp`). Added to `scripts/test-all.sh` and the CI workflow.
- **Website cMIP draft 8** (`cmips/cmip-website-draft-8.md`): rule 13a gains "Ordered by a clock" (`mor-clock`, its stamps, each post's time, the order, what is said); the signed-order bullet and "said beside it" point to it; plain words, purpose and dependencies (the anchoring cMIP and the Module) updated; five stated costs added. Draft 7 unchanged in its own file; draft 7's note in draft 8 records his approval.
- **The display client** (`clients/site`): `src/feed.ts` (`readFeed` takes the clock; its stamps read with the Module's `readStamps`, through the feed's one verifier; `earliestByNames` over every act found; `signedOrder` takes the times; each post's `time`; the feed's `clock` and `order`); `src/shell/page.ts` (`mor-clock`, the first naming an identity hash); `src/shell/feed-view.ts` (the label, each post's time, `timeWords`); `src/shell/view.ts` (the bar's clock line); `src/shell/app.ts`.
- **The page** (`docs/dubsar.org/feed.html`): "Take part" (the clients and the homes) and the `mor-clock` placeholder.
- `clients/poster`, `clients/dub`, `clients/nudge`, `clients/genesis`, `clients/reader` and `spec/` are not changed.

### Readings taken where the decisions are silent

For Nobody, allegedly, to confirm or change.

1. **The clock's code is TypeScript**, not Rust. A clock is an identity that signs acts, as Machine's desk is, and the feed reads its stamps in the visitor's browser with the same code; the repository's rule gives Rust to the core, relays and homes, and TypeScript to clients. Its stamps are judged by the core library (Rust, through WebAssembly), as every act is.
2. **The point is seconds since 1970, UTC**, and a feed shows it in UTC, the same for every visitor, as "13 October 2026, 09:05 UTC".
3. **A stamp names up to 256 acts at one time**, type 1 of the Module; one stamp per moment the clock holds new acts.
4. **A post the clock has not stamped comes first** (newest), in signed order, marked "not stamped by" the clock. The common case is a post written since the clock last looked. The cost: a post the clock never stamps (an identity it does not follow) stays at the top.
5. **An act existed by the earliest stamp of any act naming it** (a client conformance in the Module), so a reply the clock stamped before the post it answers does not make the post look newer.
6. **A feed is ordered by its clock once any post found carries a stamp**; otherwise in signed order, said as before.
7. **One clock per feed**: the first `mor-clock` naming an identity hash; any other is dropped.
8. **Where stamps are looked for**: the clock's outbox route for the Module, or for everything else, then the gateway's relays, as for the identities' posts.
9. **The service takes act ids, not acts** (an id is a hash: it learns nothing more), stamps everything it finds at the relays named (or only the signers named), never its own acts, and counts an act stamped once its stamp is published (one that did not reach its relays is stamped again later; the earliest counts).
10. **The pointers**: the heading "Take part"; Dub with no link, since it has no download yet ("to download once it is released"); the web client linked and marked "for testing only", with the two risks of F281 in a few words; MOR Identities described as the desk both identities are run from, on the author's own computer; the homes written out, not linked, since a home shows no page at its address, with "give its address to Dub".
11. **The real page's clock is a placeholder**, `CLOCK-IDENTITY`, named "the dubsar.org clock": dropped until replaced, so the feed stays in signed order.

### For the gateway on dubsar.org, when the clock comes

- A clock identity made with the genesis client, its outbox route naming where its stamps go, and `mor-clock run` following the relays where the two identities post (`--watch`, `--signer`).
- Its identity hash in place of `CLOCK-IDENTITY` in `feed.html`, then a new version of the site.
- The gateway's `relays` must include a place holding the clock's genesis, as for the identities.
- The gateway must run a display client released with draft 8; one released with draft 7 ignores the clock.
- `dub.dubsar.org`'s DNS record, the author's to add, before the link leads anywhere.

### Stated costs

- The clock's order is its operator's word: a clock that lies or runs wrong orders the feed wrongly, and the feed cannot tell. Signed order still holds.
- A post is placed when the clock held it, not when it was signed; one found late shows as newer.
- The clock learns every act at the relays it follows; its stamps are public.
- Every visit looks the clock up and fetches its stamps: one more lookup, and slower as the clock stamps more.

### Tests

`modules/timestamp/test/clock.test.ts`, 5 tests: the format and every refusal; only the named clock's public stamps of this Module place anything; the earliest stamp, and the earliest of any act naming one; the service on a real home and relays (what it finds, never its own stamps, each act once, never back in time when its computer's clock is set back, the open form); a reader judging the clock's stamps through its chain while a stamp by another identity, earlier, places nothing.

`clients/site/test/feed-clock.test.ts`, 3 tests, real homes and relays, headless Chromium, a phone's screen:

1. The order with times: across identities, never before what an act names, an unstamped act first; a reply stamped before what it answers.
2. **Three identities on two homes, five posts stamped one minute apart across identities, the newest unstamped; a second clock, which the page names second (dropped), stamping the same posts in the reverse order at the same relay:** the feed in the named clock's order, not signed order; "ordered by The test clock's stamps"; each post's time from the named clock, never the other's; the unstamped post first, "not stamped by The test clock"; the reply with the post it answers; the bar naming the clock by its whole fingerprint, "5 stamps found, 5 verified, placing 5 posts", and not the second clock; nothing fetched elsewhere; nothing scrolling sideways.
3. **A page naming no clock, one naming a clock that stamped nothing, and one whose clock is no identity hash:** signed order, "the order is not a time", no time shown; the quiet clock in the bar, "No post found carries its stamps".

`clients/site/test/feed-page.test.ts`: its first test also checks the pointers (the clients' lines, the web client's link and "for testing only", the two homes).

COUNTS-HERE
