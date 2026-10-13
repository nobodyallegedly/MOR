# A listing of cMIPs and Modules on dubsar.org

*13 October 2026. Machine report for F288 (area: development layer; Development rule 17, "No core registry"; field 12, discovery). Decided by Nobody, allegedly, 13 October 2026: "A) let's show discoverability in action." A listing on dubsar.org that reads the cMIPs and Modules published on the relays it follows and shows each, saying plainly at the top "one listing among any; anyone can run another". Never a registry: it decides nothing and refuses nothing. Test identities only; nothing published, nothing released.*

## Do the tests pass?

**Yes.** RESULTS

## In plain words

A page of the site can now say: "list the specifications published on these relays." It names the relays by their addresses. The visitor's browser then reads everything those relays hold, picks out the cMIPs and Modules (and any other specification), and checks each one with MOR's core library, as it already checks the page and the feed: who signed it, and that its text is exactly what they signed.

At the top, before anything it lists, it says in its own words: **"One listing among any; anyone can run another. It decides nothing and refuses nothing."** A specification is named by the hash of its content, so being listed here gives it nothing and leaving it out takes nothing away. Anyone can read the same relays, or others, and list differently.

Then, one card for each specification (its drafts together):

- **its name**, the first line of its text;
- **what it is**: a cMIP, a Module, or another kind; **the layer**; **the task it fills** (by number and name), or that it is **an xtype** (it defines new act types and fills no task), the layers it declares **for use as an extension**, the **cMIP a Module works under**, and **field 12**, "checks proofs of delivery of proven offers", the field that serves discovery;
- **its creator**, by the whole fingerprint, and whether the creator published it; if only someone else did, it says **"Unclaimed by its named creator"**;
- **whether code is released** for it: a release naming it, by its creator or by someone else, with the release's name and version;
- **its drafts in order**, each draft naming the one before; a draft by **another creator** than the one it follows is said, and two drafts naming the same one are both shown.

A publication that cannot be checked is shown apart, as **Not verified**, with the reason; nothing it says is shown, not even its name.

It only reads. Nothing is signed, published or kept in the browser.

**What it looks like on a phone** (dubsar.org's page with test specifications on two test relays, 390 pixels wide, Chromium): `docs/listing/listing-phone-chromium.png`.

**On dubsar.org today it would list nothing:** no specification has been published on MOR yet (that comes with the first acts). The page reads home1 and home2; once specifications are published there, they appear, with no change to the page or the code.

## Precisely

### The specification: website cMIP draft 9

`cmips/cmip-website-draft-9.md`. Draft 8 stays. Draft 9 is draft 8 with **rule 13c, Listings, marked "new in draft 9", for Nobody, allegedly, to approve**; its note, the plain words, the purpose, the dependencies, five stated costs and one line of reasoning are added. The manifest's format is unchanged.

The element:

```html
<mor-listing>
  <mor-relay address="https://home1.dubsar.org">home1.dubsar.org</mor-relay>
  <mor-relay address="https://home2.dubsar.org">home2.dubsar.org</mor-relay>
</mor-listing>
```

How a display client finds published specifications and reads their fields, verifying each (rule 13c):

1. Each relay named is read through the unfiltered feed (relay transport cMIP: "A feed with no filter returns everything the relay holds"), at most 5,000 acts a relay, said where it stops. An address a browser cannot reach (plain http to another machine, an onion address) is not asked, and said.
2. A publication of a specification is a public publication (Envelopes type 0) whose media spec is the Development MIR's spec hash (Development, Part three).
3. Each is checked: the publication judged valid for its signer's identity chain (looked up from its homes); its content fetched, opened and matched against its work hash and size; decoded strictly as Development's `spec` (only keys 0 to 12, each of its kind, field 9 canonical text, a creator for every kind but a MIR, field 10 ascending from 0 to 3, canonical encoding); its spec hash computed, `tagged_hash("MOR/spec", content)`. The same content published by several identities is one specification.
4. What it is, from its own fields only; its creator against rule 3; its drafts by field 8 against rule 25; the code released for it from releases naming it.

### The code

| File | What |
| --- | --- |
| `clients/site/src/listing.ts` | Reading a listing: the relays read, the specifications found, checked, decoded (`decodeSpec`), hashed (`specHash`), grouped into lines of drafts (`linesOf`), the releases naming them; what each says it is in plain words (`roleWords`). Runs in the browser and in Node. |
| `clients/site/src/shell/listing-view.ts` | The listing's own frame, phone first: "One listing among any" first, a card for each line of drafts, then what could not be verified. |
| `clients/site/src/shell/page.ts`, `app.ts`, `view.ts` | `mor-listing` turned into a box the display client fills after the feeds; the bar (rule 9) lists every relay read, its counts, what was not asked, and how many were verified. |
| `clients/site/src/specs.ts` | The release manifest cMIP's test value, the same as the repo client's. |
| `docs/dubsar.org/listing.html` | dubsar.org's page, "cMIPs and Modules", reading home1 and home2. |
| `clients/site/test/listing.test.ts` | 10 tests, below. |

No change to `core/`, `spec/`, `clients/desk`. The released copy of the display client (`clients/site/built/`) is not rebuilt: that is a release. Gateways need the display client released with draft 9 before serving `listing.html` (a stated cost of the cMIP).

### The tests

`clients/site/test/listing.test.ts`, 10 tests, real homes and relays on local ports, test identities only. Test specifications are published as acts on two local relays exactly as Development's Part three says: a cMIP filling task 6 (Payment) and its **second draft** naming it, with a release naming the second; the first draft published again by another identity; a **Module under the cMIP**, a request rail; an **xtype** with two act types, with a release by its creator, and a successor by **another creator**; a **proof-of-delivery checker** (field 12) declaring the layers Money and Agreements; a specification naming Alice as creator published only by Carol (**unclaimed**); and two that **cannot be verified**: one whose signer's home was gone before its genesis reached anyone, one whose content is no specification.

1. A specification decodes strictly (six malformed ones refused, each with its reason), is named by its hash and its text's first line; a MIR has no creator.
2. The relays named are read; an onion address over http is not asked.
3. The cMIP filling a task and its second draft, in order, layer Money, task 6, claimed, the release with its name and version; the first draft published twice is one specification, its creator's publication first.
4. The Module under the cMIP takes its layer from it, and says it is a request rail.
5. The xtype (layer Development, "defines 2 act types (note, answer), filling no task") and its successor by another creator, said as such.
6. Field 12 and the layers an extension declares.
7. The specification naming a creator who never published it, shown as unclaimed.
8. The two that cannot be verified: shown as such with the reason, nothing they say read.
9. Lines of drafts: a fork named on both sides, a predecessor not found said.
10. **dubsar.org's `listing.html` in Chromium on a phone (390 × 844)**, with the two test relays in place of home1 and home2: verified as the site's page; "One listing among any; anyone can run another. It decides nothing and refuses nothing" first in the listing; five cards, each showing what tests 3 to 7 found; the two unverified ones shown as "Not verified", their words nowhere on the screen; nothing wider than the screen; the bar counting 7 specifications verified and 2 publications not, and each relay's acts read; nothing fetched from anywhere but the gateway, the homes and the relays; no error in the browser.

### Counts against main

COUNTS

## Readings, for Nobody, allegedly, to confirm or change

Where the decision and the specifications are silent, these are the readings taken. Each is in draft 9 and the code, and easy to change.

1. **What a specification's publication names as its media spec.** Development's Part three says a specification is "a public act (Envelopes type 0, a publication) whose media is the specification's content", but not what the publication's media spec (field 0) holds. Read as **the Development MIR's spec hash**, since Development defines the content's format. *This is a silence in the Development MIR, not a contradiction; every publishing tool and listing must agree on it, so it may belong in the MIR's next draft.* Options: (a) the Development MIR's hash (built); (b) a hash of its own for "a specification"; (c) the specification's own kind decides.
2. **"Code released".** No field of a specification, and no field of a release manifest, links the two. Read as: **a release (release manifest cMIP) whose publication names the specification's publication among its references**, shown with who released it (its creator or another identity), checked through the releaser's chain, its files not checked. Options: (a) as built; (b) a field in a specification naming its code (a Development change); (c) a field in the release manifest naming the specifications it implements (a new release manifest draft).
3. **A specification's name** is the first line of its text holding a letter, a heading's `#` removed: Development gives no name field ("labelled under its creator's identity", rule 1).
4. **The layer.** A task's MIR gives it; a Module's comes from the cMIP it works under (when that cMIP is listed); an xtype, or a cMIP filling no task, is Development (its own acts belong to Development, F106). A specification saying nothing more says so; nothing is guessed.
5. **An extension** is what an agreement makes of a cMIP (terms field 15), so the listing never calls anything "an extension"; it shows field 10 as "declares, for use as an extension, the layers it acts on".
6. **Not verified, words not shown**, as the feed does: an unverified publication's name and fields are not shown.
7. **Every kind is listed**, not only cMIPs and Modules (units, media types, signature schemes, MIRs), each by its kind: "refuses nothing".
8. **At most 5,000 acts read per relay**, said where it stops.
9. **The page is not linked yet** from the front page or a door, as `feed.html` is not; the page itself also says "One listing among any" above the listing, besides the display client's own words, which a page cannot remove.
