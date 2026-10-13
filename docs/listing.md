# A listing of extensions, cMIPs and Modules on dubsar.org

*13 October 2026. Machine report for F288 (area: development layer; Development rule 17, "No core registry"; field 12, discovery). Decided by Nobody, allegedly, 13 October 2026: "A) let's show discoverability in action." A listing on dubsar.org that reads the cMIPs and Modules published on the relays it follows and shows each, saying plainly at the top "one listing among any; anyone can run another". Never a registry: it decides nothing and refuses nothing. **Then, the same day: "What really matters for MOR2 is the tracking of extensions, cMIPs and modules are a nice side effect."** So the listing's first purpose is the extensions agreements name; the cMIPs and Modules follow below. Test identities only; nothing published, nothing released.*

## Do the tests pass?

**Yes.** RESULTS

## In plain words

A page of the site can now say: "list the specifications published on these relays." It names the relays by their addresses. The visitor's browser then reads everything those relays hold, picks out the cMIPs and Modules (and any other specification), and checks each one with MOR's core library, as it already checks the page and the feed: who signed it, and that its text is exactly what they signed.

At the top, before anything it lists, it says in its own words: **"One listing among any; anyone can run another. It decides nothing and refuses nothing."** A specification is named by the hash of its content, so being listed here gives it nothing and leaving it out takes nothing away. Anyone can read the same relays, or others, and list differently.

**First, the extensions.** An extension is a cMIP an agreement names in its terms (field 15) for work the core did not foresee; each one marks a place MOR 2 may answer. Under the line **"Each extension marks work the core did not foresee: the raw material of MOR 2."**, the listing shows each cMIP the agreements it read name as an extension:

- **how many agreements name it**, most named first;
- **which layers the work touches**: Development, and the layers the extension's own specification declares (its field 10), where that specification is found; otherwise it says so;
- **links to those agreements' public terms**, opening in the reader.

It counts only agreements it can read and check: public terms, signed by every party, each checked in your browser. Two versions of one agreement count once. A proposal not yet signed by everyone is not counted. **Private agreements are not counted**, because their terms cannot be read, and the page says so plainly, with how many private acts it found and did not open.

**Then, below, the cMIPs and Modules**, one card for each specification (its drafts together):

- **its name**, the first line of its text;
- **what it is**: a cMIP, a Module, or another kind; **the layer**; **the task it fills** (by number and name), or that it is **an xtype** (it defines new act types and fills no task), the layers it declares **for use as an extension**, the **cMIP a Module works under**, and **field 12**, "checks proofs of delivery of proven offers", the field that serves discovery;
- **its creator**, by the whole fingerprint, and whether the creator published it; if only someone else did, it says **"Unclaimed by its named creator"**;
- **whether code is released** for it: a release naming it, by its creator or by someone else, with the release's name and version;
- **its drafts in order**, each draft naming the one before; a draft by **another creator** than the one it follows is said, and two drafts naming the same one are both shown.

A publication that cannot be checked is shown apart, as **Not verified**, with the reason; nothing it says is shown, not even its name.

It only reads. Nothing is signed, published or kept in the browser.

**What it looks like on a phone** (dubsar.org's page with test specifications on two test relays, 390 pixels wide, Chromium): `docs/listing/listing-phone-chromium.png`.

**On dubsar.org today it would list nothing:** no agreement naming an extension, and no specification, has been published on MOR yet (that comes with the first acts). The page reads home1 and home2; once specifications are published there, they appear, with no change to the page or the code.

## Precisely

### The specification: website cMIP draft 9

`cmips/cmip-website-draft-9.md`. Draft 8 stays. Draft 9 is draft 8 with **rule 13c, Listings, marked "new in draft 9", for Nobody, allegedly, to approve**; its note, the plain words, the purpose, the dependencies, five stated costs and one line of reasoning are added. The manifest's format is unchanged.

The element:

```html
<mor-listing reader="https://reader.dubsar.org/">
  <mor-relay address="https://home1.dubsar.org">home1.dubsar.org</mor-relay>
  <mor-relay address="https://home2.dubsar.org">home2.dubsar.org</mor-relay>
</mor-listing>
```

**Extensions first** (rule 13c, "Extensions first"): from the same relays, every public terms act (Agreements type 0) and every public signature act (type 1); each terms act judged valid for its signer's chain, every party's chain looked up, all in one verifier; the core library's `agreementsAgreement` says whether the agreement exists (a deal or founding terms, every party signed) or, a collective's clone, is ready: only those count. Versions of one agreement (field 11 back as far as found) count once. For each cMIP named in field 15 by an agreement counted: how many agreements, the layers (Development and its field 10, where its specification is listed), and the act ids of the public terms naming it, each a link `reader#id`. Private acts and sealed containers are counted as found and not opened; the page says private agreements are not counted. Two stated costs added: private agreements are not counted (counts are a lower bound, never a measure of use), and a count is of signed terms, not of use (anyone can sign many agreements naming one cMIP; each count links to the terms, so a visitor can look).

How a display client finds published specifications and reads their fields, verifying each (rule 13c):

1. Each relay named is read through the unfiltered feed (relay transport cMIP: "A feed with no filter returns everything the relay holds"), at most 5,000 acts a relay, said where it stops. An address a browser cannot reach (plain http to another machine, an onion address) is not asked, and said.
2. A publication of a specification is a public publication (Envelopes type 0) whose media spec is the Development MIR's spec hash (Development, Part three).
3. Each is checked: the publication judged valid for its signer's identity chain (looked up from its homes); its content fetched, opened and matched against its work hash and size; decoded strictly as Development's `spec` (only keys 0 to 12, each of its kind, field 9 canonical text, a creator for every kind but a MIR, field 10 ascending from 0 to 3, canonical encoding); its spec hash computed, `tagged_hash("MOR/spec", content)`. The same content published by several identities is one specification.
4. What it is, from its own fields only; its creator against rule 3; its drafts by field 8 against rule 25; the code released for it from releases naming it.

### The code

| File | What |
| --- | --- |
| `clients/site/src/listing.ts` | Reading a listing: the extensions agreements name (`readExtensions`), counted from public terms signed by every party, private acts said; the relays read, the specifications found, checked, decoded (`decodeSpec`), hashed (`specHash`), grouped into lines of drafts (`linesOf`), the releases naming them; what each says it is in plain words (`roleWords`). Runs in the browser and in Node. |
| `clients/site/src/shell/listing-view.ts` | The listing's own frame, phone first: "One listing among any" first, then the extensions section (its line on MOR 2, its counts and "Private agreements are not counted", each extension with its count, layers and links), then a card for each line of drafts, then what could not be verified. |
| `clients/site/src/shell/page.ts`, `app.ts`, `view.ts` | `mor-listing` turned into a box the display client fills after the feeds; the bar (rule 9) lists every relay read, its counts, what was not asked, and how many were verified. |
| `clients/site/src/specs.ts` | The release manifest cMIP's test value, the same as the repo client's. |
| `docs/dubsar.org/listing.html` | dubsar.org's page, "Extensions, cMIPs and Modules", reading home1 and home2, its links opening in `https://reader.dubsar.org/`. |
| `clients/site/test/listing.test.ts` | 12 tests, below. |

No change to `core/`, `spec/`, `clients/desk`. The released copy of the display client (`clients/site/built/`) is not rebuilt: that is a release. Gateways need the display client released with draft 9 before serving `listing.html` (a stated cost of the cMIP).

### The tests

`clients/site/test/listing.test.ts`, 12 tests, real homes and relays on local ports, test identities only. Test specifications are published as acts on two local relays exactly as Development's Part three says: a cMIP filling task 6 (Payment) and its **second draft** naming it, with a release naming the second; the first draft published again by another identity; a **Module under the cMIP**, a request rail; an **xtype** with two act types, with a release by its creator, and a successor by **another creator**; a **proof-of-delivery checker** (field 12) declaring the layers Money and Agreements; a specification naming Alice as creator published only by Carol (**unclaimed**); and two that **cannot be verified**: one whose signer's home was gone before its genesis reached anyone, one whose content is no specification. And **agreements naming extensions**, as public deals (Agreements type 0) and signature acts (type 1): Alice and Bob naming the xtype and the checker; Bob and Carol naming the xtype, in two versions (a clone naming its parent); Alice and Carol naming the xtype and a cMIP published nowhere; all signed by every party; a **proposal** naming the checker that Carol never signs; and a **private** deal between Alice and Bob naming the checker and the Module, sealed to them, both signing.

1. A specification decodes strictly (six malformed ones refused, each with its reason), is named by its hash and its text's first line; a MIR has no creator.
2. The relays named are read; an onion address over http is not asked.
3. The cMIP filling a task and its second draft, in order, layer Money, task 6, claimed, the release with its name and version; the first draft published twice is one specification, its creator's publication first.
4. The Module under the cMIP takes its layer from it, and says it is a request rail.
5. The xtype (layer Development, "defines 2 act types (note, answer), filling no task") and its successor by another creator, said as such.
6. Field 12 and the layers an extension declares.
7. The specification naming a creator who never published it, shown as unclaimed.
8. The two that cannot be verified: shown as such with the reason, nothing they say read.
9. Lines of drafts: a fork named on both sides, a predecessor not found said.
10. **The extensions agreements name, most named first:** the xtype by 3 agreements (Bob and Carol's two versions counted once, both terms linked), its layer Development; the checker by 1, its layers Development, Money, Agreements (its field 10); the cMIP published nowhere by 1, its layers not said.
11. **Only agreements signed by every party count; private ones are not counted:** 3 agreements counted from 5 public terms, 1 proposal not counted, the private deal's acts found and not opened; neither the checker nor the Module counted from the private deal (the Module, named only there, does not appear).
12. **dubsar.org's `listing.html` in Chromium on a phone (390 × 844)**, with the two test relays in place of home1 and home2: verified as the site's page; "One listing among any; anyone can run another. It decides nothing and refuses nothing" first in the listing; **then the extensions section before the cMIPs and Modules**, its line "Each extension marks work the core did not foresee: the raw material of MOR 2.", its counts saying "Private agreements are not counted: their terms cannot be read (… private acts found, not opened). 1 public proposal not yet signed by every party, not counted."; the three extensions in order with their counts and layers, the links to the four public terms naming the xtype, each to `https://reader.dubsar.org/#` and the act id, opening apart, none to the proposal or the private deal; then five cards, each showing what tests 3 to 7 found; the two unverified ones shown as "Not verified", their words nowhere on the screen; nothing wider than the screen; the bar counting 3 extensions named by 3 agreements from 5 public terms, private agreements not counted, 7 specifications verified and 2 publications not, and each relay's acts read; nothing fetched from anywhere but the gateway, the homes and the relays; no error in the browser.

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
9. **Which agreements count** (F288's extensions): an agreement counts once the core library says it exists (every party signed) or, a collective's clone, is ready; proposals and invalid terms are not counted; versions of one agreement (field 11) count once. Read from public terms on the relays the page names only; whether an agreement is still in force, or used the extension, is not read.
10. **The layers the work touches** are Development and the extension's own field 10, where its specification is listed here; where it is not, "not said". An agreement does not say which layers an extension touches; its specification does.
11. **Links to public terms** open in the reader the page names (`reader="https://reader.dubsar.org/"`, the act id after `#`), as the feed page's links do; where a page names none, the act ids are plain text. *Whether the reader shows terms acts well is the reader's business, not checked here.*
12. **The page is not linked yet** from the front page or a door, as `feed.html` is not; the page itself also says "One listing among any" above the listing, besides the display client's own words, which a page cannot remove.
