# cMIP: Website

*Draft 3, 8 October 2026 (roadmap step 10a, the layout of dubsar.org). **Not yet approved.** Draft 3 is draft 2 with one rule added, decided by Nobody, allegedly, 8 October 2026: a page may name one of the site's own pictures as its icon, which the display client shows on the browser tab from its checked bytes (rule 16a, and rule 12 naming it). No other rule changes, and the manifest is unchanged, so a version published under draft 2 is read the same. Found while building the layout: the marks drawn for dubsar.org are SVG, which no site may hold (rule 4); they are published as JPEG copies instead, each drawn on the page's fixed colours, rather than adding a kind of file (decided the same day). Draft 2's note follows.*

*Draft 2, 1 October 2026 (roadmap step 10a). **Not yet approved.** Draft 2 is draft 1 with Nobody, allegedly's decisions of 1 October 2026 written in: a page is HTML with no scripts, and never terms (rules 11, 15); the checking code is MOR's own released display client, the same for every site (rule 20); the built display client is published in the release, and its build is reproducible (rule 20a); which version a gateway serves is set per site, by default the publisher's latest (rule 23, "Later versions"), and the display client always says when a newer version exists (rule 24); a gateway carries only the sites its operator chose (rule 22); a collective's site, published under its Envelopes lane, applies once Agreements draft 7 is approved ("What counts as a version", rule 3). Where the decisions are silent, the leans taken are listed in `clients/site/README.md`, for Nobody, allegedly, to confirm or change. Draft 1 was written the same day, with ten questions. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v17, the Identity MIP draft 10, the Envelopes MIP draft 6, the Text MIP draft 6, the Agreements MIP draft 6 (and, for a collective's site, Agreements draft 7, written on branch `claude/law-draft-7` and not yet approved), the Development MIP draft 4, the relay transport cMIP draft 2, the release manifest cMIP draft 1, the long-form text format cMIP draft 1, freeze test suite v17 and findings F1 to F107. Not core: a founding cMIP, frozen at publication, competing with any other way to publish a website.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A website is a handful of files: pages, a stylesheet, pictures. Here, the site's owner publishes a list of those files, each with its fingerprint, signed with their identity, on relays, the same way a release of the code is published. Anyone can fetch the list and the files and check that every byte is what the owner signed.*

*Most people do not fetch files from relays: they type a domain into a browser. A gateway is what stands at the domain. It fetches the site from relays, checks it, and serves it. But a browser trusts whoever answers at the domain, so a gateway could lie. That is why the pages never come alone: every page is shown inside a small frame of the gateway's own software, which carries the core library and checks, in the visitor's own browser, who signed the site and whether the page matches what they signed, and says so above the page. A page that does not match is not shown.*

*That frame is itself served by the gateway, so a gateway that is hostile could change the frame too. No page can check the code that checks it. What this cMIP does about that is to make the frame small, the same for every site, and taken from MOR's own signed releases, built so that anyone can rebuild the very same bytes from the source, so that anyone can compare what a gateway serves with what was released, from somewhere else; and to keep every byte of the site checkable without any gateway at all.*

*A gateway carries the sites its operator chose, and no others. For each, the operator says which version it serves. A site someone else publishes follows its publisher's latest version, by default: when to change their content is the publisher's call, not the operator's. The operator's own sites are set as the operator wishes; pinning one version guards against a stolen key. Whatever the gateway serves, the frame in the visitor's browser looks for later versions itself, and says when a newer one exists.*

## Purpose

This cMIP defines:

- the site manifest: a media type describing one version of a website, file by file;
- how a site is published, and what counts as a version of an identity's site;
- how a site is shown: what a display client checks and what it may display;
- what a gateway is: a display client served from a domain, carrying the sites its operator chose, each at the version its operator sets;
- which versions are later than another, with no clock;
- what a hostile gateway can and cannot do (the stated cost of roadmap step 10a).

It fills no task of the MIPs: it is a new kind of thing built from core pieces (Development rule 8a). It adds rules; it relaxes none.

## Dependencies

Identity, Envelopes and Development; Text, for the acts a page shows; the relay transport cMIP for fetching. The release manifest cMIP for the shape of a file entry, and for the release of the display client's own code.

## The site manifest

A version of a site is a media object, public, described by a publication (Envelopes type 0) whose media spec (field 0) is this cMIP's spec hash. The publication describes the manifest (Envelopes, "Media"): its work hash, locked hash, size, nonce and key are the manifest's own, and its field 6 lists where the manifest and every file can be fetched.

```cddl
site = {
  0 => tstr,            ; name: what the site is, e.g. "dubsar.org"; a label, never an address
  1 => hash / null,     ; previous: the act id of the previous version's publication; null for the first
  2 => [+ file]         ; every file, sorted by path (byte order of its UTF-8), no path twice
}

file = [                ; exactly as in the release manifest cMIP
  path: tstr,
  work: hash,           ; tagged_hash("MOR/work", the file's bytes)
  size: uint,
  locked: hash,         ; SHA-256 of the file's locked bytes, as stored
  nonce: bstr .size 24,
  key: bstr .size 32    ; its content key: a site is public
]
```

1. **Closed format.** A manifest with a key this cMIP does not define, a field of the wrong kind, an invalid path, or paths out of order or repeated, is invalid. Every `tstr` is canonical text (Text MIP).
2. **Paths.** A path is one or more segments separated by `/`. Each segment is made of the characters `a` to `z`, `0` to `9`, `-`, `_` and `.`, is not empty, does not start with `.`, and is at most 100 characters long; a path is at most 512 characters long. The last segment has an extension: a `.` followed by one of the extensions in rule 4. *Lower-case ASCII only: no two paths that look alike, nothing for a browser or a server to rewrite, and the same path on every operating system.*
3. **Addresses.** A file at path `p` is at the address `/p` under the place the site is served from. The file `index.html` of a folder, or of the site, is also at the folder's address followed by `/` (the site's own at `/`). *Links between pages are relative, so a site reads the same at a domain, at an onion address, or under any other address.*
4. **Kinds of file.** The extension of a path decides what its file is. A path with any other extension is invalid.

   | Extension | Kind | Shown as |
   | --- | --- | --- |
   | `.html` | page | a page (rules 11 to 17) |
   | `.css` | stylesheet | the look of the pages that name it; on its own, plain text |
   | `.jpg` | picture | a JPEG (the JPEG Module), stripped to the picture alone before publishing |
   | `.txt` | text | plain text, UTF-8 |

   *Kept small on purpose. Each kind added is a kind every display client must show safely; a picture format other than JPEG waits for its own Module, and files to download belong in a release.*

5. **A site has a front page:** `index.html`. A manifest without it is invalid.
6. **Pictures carry only the picture.** A JPEG is published stripped to the picture alone (JPEG Module, rule 6): no location, camera data, previews or hidden pictures. *As a posting client does (decided by Nobody, allegedly, 30 September 2026, for posts).*
7. **Files are media objects,** locked one by one (Envelopes, "Media": XChaCha20-Poly1305, no associated data). *A file unchanged since the previous version is the same object: the same locked bytes, nonce and key, so a new version uploads only what changed (release manifest cMIP, rule 2).*

## Publishing

1. **Signed by the site's owner.** A version is published by the identity whose site it is. The publication is public; it needs no `for`. *A collective's site is published as its releases are: the collective signs the publication with its own key, and whoever holds its Envelopes lane adds their signatures ("What counts as a version", rule 3).*
2. **The publication first,** then the manifest's locked bytes, then every new file's, on the relays named in field 6. *As for a release: a relay that keeps media only for publications it holds then keeps the manifest.*
3. **Chains carried along.** The owner carries their identity-chain acts to those relays, so that whoever knows only a relay finds the genesis, and from it the homes.
4. **One version names the one before.** *Nothing is updated. A new version is a new act; the old one stays on record and still verifies.* A version names as its previous only a version of the same identity's site. *Publishing tools refuse otherwise; a manifest naming someone else's version is still a valid manifest, and it is simply never followed to (see "Later versions").*

## What counts as a version

A publication P is a version of identity S's site when:

1. P is valid (Envelopes, "The act"), public, of Envelopes type 0, and its media spec is this cMIP's hash;
2. P's signer is S, and P's standing for S's identity chain is valid: bound by a counting chain act, and not voided by a later rotation (Identity);
3. **Agreements' answer for P is met,** as for a release (release manifest cMIP, "What counts as a release", rule 3). If S's chain declares, at P's binding, an agreement S lives under (Agreements declaration of kind 0), S is a collective, and P is an act of the collective of the Envelopes and Text layer (its `spec` is the Envelopes MIP's; Agreements draft 7, "Layer"): under the agreement in force for P (Agreements draft 7, rule 37c), where an area reaches that layer, its lane, P counts only with valid signature acts naming it by the holders of that area, meeting its threshold; where no area reaches it, the collective's own signature suffices, as for any act of the collective no area reaches (Agreements draft 7, rule 36a). *This rule applies once Agreements draft 7 is approved (decided by Nobody, allegedly, 1 October 2026: a collective's site is published by whoever holds the collective's Envelopes lane, as its releases are). Until then a verifier refuses a version whose signer declares an agreement, saying why, rather than accept it unjudged. A collective cannot give its site to one member and its releases to another by lane alone, since both are Envelopes publications (Agreements draft 7, stated cost of F106).* If S declares none, S's own signature suffices: S is not a collective;
4. no withdrawal of P (Envelopes, "Withdrawal") by S is found where the verifier looked. *Silence proves nothing (relay transport cMIP): a withdrawal on a relay nobody asks is not found;*
5. the manifest is valid, and matches the publication's work hash and size.

*Which version is current is not something MOR can say: it has no clock. What it can say is which versions come after another, by the names they carry (see "Later versions"). A gateway serves the version its operator's settings lead to (see "Gateways"); a visitor sees which version that is, and is told when a newer one exists.*

## Later versions

*MOR has no clock, so "latest" is read from the versions themselves. Each version names the one before it; the versions after a version V are those that name V, then those that name them, and so on. Each must be a version in its own right.*

A. **A successor.** A version Q is a successor of a version P when Q is a version of P's signer's site (rules 1 to 5, P's signer as the identity expected) and Q's manifest names P as its previous.

B. **Later versions.** From a version P, following goes from P to its successor, and on, as long as there is exactly one. The **latest version from P** is where it stops: P itself when P has no successor found.

C. **A fork stops following.** Where a version has two or more successors, following stops at that version, and whoever follows says so, naming the successors. *Two versions naming the same one, both signed by the owner, mean that two people hold the owner's key, or that the owner made a mistake; either way, choosing one would be a guess. The owner settles it by withdrawing one, or by a rotation that voids the thief's.*

D. **Where it was looked for.** Successors are found among the publications of P's signer that the places asked hold (relay transport cMIP, "Following": the feed by signer), each checked in full. *Silence proves nothing: a later version on a relay nobody asks is not found, and a withdrawal is found only where someone looks. A version withdrawn by its signer is not a version (rule 4); a version naming it is not followed to through it.*

## Showing a site

A **display client** is software that shows a site to a person. It is given a version (P's act id), the identity it expects (S), and places to look. *The gateway's frame, below, is one; a command-line verifier that writes the files out is another.*

8. **Check before showing.** A display client shows a file only once P is a version of S's site, by the rules above, judged by the core library on the visitor's own device, and the file's bytes match their manifest entry (work hash and size). It never shows a file whose bytes it has not checked, whoever served them.
9. **Say who signed.** Beside every file it shows, outside the file's own display, a display client shows: whether the version verified, in plain words; the signer's whole fingerprint (the identity hash, as the web reader shows it); whether the signer is the identity the display client was told to expect; and P's act id. *Outside: a page cannot draw over it or remove it.*
10. **Fail visibly.** A version that does not verify, or a file that does not match, is shown as failing, with the reason, and the file is not shown. *Client conformance.* A display client SHOULD NOT fall back to bytes from another source for a file the gateway served wrongly without saying so: what a gateway served wrongly is itself what a visitor needs to know.

### Pages

A page is an HTML document, UTF-8. What it may use, and how a display client shows it:

11. **No code runs.** Nothing in a page runs: a display client shows a page in a context where scripts are disabled, and drops `script`, `noscript`, `iframe`, `frame`, `object`, `embed`, `form`, `base`, `meta` that refresh or redirect, every attribute starting with `on`, and `style` elements and attributes. *A site is pages to read, not a program. A page's look comes from its stylesheets. (Decided by Nobody, allegedly, 1 October 2026: a page is HTML with no scripts.)*
12. **Nothing from elsewhere.** A page uses only files of the same version: pictures (`img` with `src` naming a picture's path, relative to the page), stylesheets (`link` with `rel="stylesheet"` and `href` naming a stylesheet's path), and an icon (rule 16a). A display client loads them only from what it has checked, and drops any other reference that would load something (an address on another site, `srcset`, `picture` sources, `video`, `audio`, a stylesheet's `@import` and `url()`). *A visitor's browser asks no third party for anything while a page is shown, so no third party learns who reads it.*
13. **Acts shown as acts.** An element `mor-act` whose attribute `act` holds an act id (64 lower-case hex digits) is shown as that act: fetched, checked and judged through its signer's identity chain by the display client, with its own signer and standing, as the web reader shows a post. A display client shows each act apart from the page's own styles, and lists every act the page shows, with its standing and its signer's fingerprint, beside the page (rule 9). *The site holds the link; the act stays the act, signed by whoever signed it, and is not copied into the site. A page's stylesheet could still draw over an act's box, so what counts is the list beside the page, which the page cannot touch.* A display client that cannot show it shows its id and why.
14. **Links on the visitor's action.** A link (`a` with `href`) to a path of the same version opens that page through the display client. A link to an `https:` or `mailto:` address opens on the visitor's action, outside the site. Any other link is shown as text. *Client conformance.* A display client SHOULD show where a link leaving the site goes before it is followed.
15. **Pages are designs, never terms.** A page is never terms. Anything signed to be agreed is a text act, shown as plain text in a client that keeps the Text MIP's bound (F102); a page may show the act (rule 13), in the display client's own rendering apart from the page's styles, but never stands in for it. *A stylesheet can hide words and move them; the bound governs text acts and their formats, not a site's pages (decided by Nobody, allegedly, 1 October 2026).*
16. **The title** of a page is its `title` element's text, shown by the display client as the page's title. A page without one is titled by its path.

    16a. **The icon.** A page may name an icon: a `link` whose `rel` includes `icon` and whose `href` names a picture's path of the same version, relative to the page. A display client MAY show that picture as the page's icon, such as on the browser tab, and only as bytes it has checked (rule 8), never from an address; a picture that does not match fails the page, as a stylesheet does. Only the first such `link` counts; any other `link` naming an icon is dropped. *A JPEG has no see-through parts, so an icon is a square picture. The tab belongs to the display client, and the page's own icon reaches it only through the check (decided by Nobody, allegedly, 8 October 2026).*
17. **A file that is not a page** is shown by its kind (rule 4): a picture as itself, a stylesheet or text as plain text, each with rule 9's line beside it.

## Gateways

A **gateway** serves a site at an address (a domain over HTTPS, an onion address) to browsers. It is two things at once: a server, which fetches a version from relays, checks it, and serves its files; and a display client, which runs in the visitor's browser.

18. **The gateway checks before it serves.** A gateway serves a version only once it has checked it by "What counts as a version", every file included. It serves the version its operator's settings lead to (rule 23); it never serves a version that did not verify, nor a file that did not match.
19. **Never a page alone.** At every address of the site, a gateway serves its display client, which fetches the file it is asked for and shows it by "Showing a site". A gateway serves a site's files themselves only as bytes for its display client to check, never as a document a browser would display on its own. *So no page of the site ever reaches a visitor's screen without passing the check.*
20. **The display client is MOR's released code.** The display client a gateway serves is MOR's own display client, as released: a release of software, published and verifiable by the release manifest cMIP, and the same for every site the gateway serves; a gateway SHOULD name the release it runs. *A site carries no code of its own (rule 11), so the code that checks is not the site's to choose, and it can be compared with its release by anyone, from anywhere (decided by Nobody, allegedly, 1 October 2026: "to keep it all in check").*

    20a. **Its built files are in the release, and rebuild the same.** The release carries the display client's built files, exactly the bytes a gateway serves, and the versions of the tools that built them. Its build is reproducible: built from the release's source with those tool versions, on any machine and in any folder, it gives the same bytes; nothing of the build machine (its folder names) is written into them. *So comparing a gateway with the release needs no build at all, and whoever doubts the built files can rebuild them and compare (decided by Nobody, allegedly, 1 October 2026: both).*
21. **What the gateway's settings say is a hint.** The version, the expected identity, the owner's name, how the version was chosen and the relays a gateway hands its display client are the operator's word: the display client checks the version against the relays and shows the signer's fingerprint, so that a visitor who knows the fingerprint can tell.
22. **A gateway carries the sites its operator chose.** A gateway serves only the sites its operator lists, each at the addresses the operator gives it (a domain, an onion address); at any other address it serves no site. *Carrying a site is the operator's choice, as keeping acts is a relay's policy. A publisher a gateway refuses carries their site elsewhere: on another gateway, on their own, or with no gateway at all, since every byte is on relays (decided by Nobody, allegedly, 1 October 2026).*
23. **Which version, set per site.** For each site it carries, the gateway's settings say which version it serves:
    - **latest:** the latest version from a version the settings name ("Later versions"), looked for again from time to time. This is the default, and the rule for a site someone else publishes: *when their content changes is the publisher's call, not the operator's;*
    - **pinned:** the version the settings name, and no other. *For the operator's own sites, set as the operator wishes: a pinned version guards against a stolen key, since a thief's new version is not served.*

    Any other arrangement between an operator and a publisher, such as pinning a version of the publisher's site, is a deal between them, outside this cMIP. Following, the gateway serves the latest version whose files all arrive and match; failing that, the one before it, and so on back to the version named. Where following stops at a fork (rule C), the gateway serves the version before it, and its operator is told.
24. **The display client looks for later versions.** Whatever version it is shown, and however the gateway chose it, a display client looks for later versions from it ("Later versions"), from the visitor's device, and says, beside the file it shows (rule 9), when a newer version exists, naming it, and when following stopped at a fork. *Client conformance.* It does so after showing the file, never holding it back. *A gateway pinned to an old version, or slow to follow, cannot keep a visitor from knowing that the owner has said more since.*

## Verifying

A verifier needs only a version's id, the identity expected, and one place to look.

1. Fetch P; recompute its id; open it with the key on its outside; check its type and media spec.
2. Resolve S's identity chain from its homes (relay transport cMIP, "Homes"), starting from its genesis; judge P's standing; check that S declares no agreement at P's binding; look for a withdrawal of P by S.
3. Fetch the manifest's locked bytes; check their SHA-256, open them, check the work hash and size; decode the manifest strictly.
4. For each file to be shown: take its bytes from wherever they come (a gateway, a relay, a disk), and check their work hash and size; or fetch its locked bytes, check their SHA-256, open them, and check the work hash and size.

The version verifies only if steps 1 to 3 pass; a file is shown only if step 4 passes for it.

## Stated costs

- **A hostile gateway (roadmap step 10a).** A browser trusts whoever answers at a domain over HTTPS, and runs whatever code they serve. A gateway that is hostile, or taken over, can serve a display client that lies: one that shows altered pages as verified, or no check at all. No page can prove the code that checks it. *What this cMIP settles, and how:*
  - *Every byte of a site is signed and named by hash, on relays, so it can be checked with no gateway at all: by any display client the visitor trusts, such as the command-line verifier, or a gateway the visitor runs (anyone can run one).*
  - *A gateway cannot pass off altered pages while serving the honest display client: the display client checks every file it is served against the signed manifest, in the visitor's browser, and shows a mismatch as failing (rule 10).*
  - *To lie, a gateway must alter the display client itself. The display client is the same for every site, is not minified, and is a signed release (rule 20), so what a gateway serves can be compared with the release from anywhere else, file by file (the command-line check, `mor-site check`, does it).*
  - *What remains: a gateway that serves altered code only to some visitors, and the honest code to whoever checks, is caught only by the visitors who check from their own device. A visitor who cannot check trusts the gateway, as with any website; the check makes a lie detectable, not impossible. Serving the site at a second address (an onion address) does not change this: each address is a gateway, trusted the same way.*
- **Pages without programs.** No script runs in a page, so a site cannot hold forms or anything interactive; it links to clients for that (such as the web reader, to write to its owner).
- **No clock, and versions found only where one looks.** MOR has no clock: "latest" means the end of the line of versions naming each other, as found at the places asked. A later version on a relay nobody asks is not found, and a withdrawal is found only where someone looks. A gateway following a site moves to a new version only when it looks again, so it can lag; the visitor's display client looks for itself (rule 24).
- **A stolen key moves the gateways that follow.** A thief holding the owner's everyday key can publish a version naming the latest one, and every gateway following that site serves it, until the owner rotates (which voids the thief's acts) or withdraws it. A version the owner also publishes after the same one makes a fork, and following stops before it. Pinning guards against this, at the cost of serving only what the operator names (rule 23). *The same window as for any act signed with a stolen everyday key (Identity).*
- **Relays learn what is fetched.** The visitor's browser fetches the version, its signer's chain and the signer's publications (to look for later versions) from relays, which learn that someone opened the site; a gateway learns which pages.
- **Reproducible only with the same tools.** The display client's built files rebuild the same only with the tool versions the release names (the Rust compiler, wasm-bindgen, the bundler); other versions give other bytes, which prove nothing either way.
- **Pages are not bound like text acts** (rule 15): a page can hide or move words with its stylesheet. Terms belong in text acts.

## Reasoning

- **Like a release.** *A site is files named by hash under a signed list, exactly as a release of the code is (release manifest cMIP). The same file entries, the same publishing order, the same reuse of unchanged files: one way to name files on MOR, not two.*
- **The check belongs to the visitor's browser, not to the gateway's word.** *A gateway that checked and said "trust me" would add nothing a plain web server does not. So the gateway checks for its own sake (it never serves a broken site), and the visitor's browser checks again for the visitor's.*
- **No code in a site.** *If a site could carry scripts, its own code could paint a fake "verified" or fetch something unchecked. Without them, what a visitor sees is what was signed, shown by a display client that is the same everywhere.*
- **The display client is MOR's code, released.** *The one thing a visitor must trust is then one small program, the same for every site, signed as a release: something that can be checked once, by many, rather than every site's code by every visitor. Its built files are in the release and rebuild the same, so checking it needs no trust in whoever built it.*
- **Per site, by whose site it is.** *Timing someone else's content is not a gateway's business, so by default it follows; its own site is its own business. Either way the visitor is told when there is more.*
- **Following by names, not by time.** *Versions name the one before, as routes acts do (Identity, "Routes"), and a fork is shown, never resolved by a guess.*
- **Acts stay acts.** *The site's owner points at acts; they are not copied into the site, so each keeps its own signer and standing, and is judged on its own.*

## Readings and questions

Draft 1's ten questions: the five main ones decided by Nobody, allegedly, 1 October 2026, and written in above; the other five taken on their leans, listed in `clients/site/README.md` to be checked at the end of the roadmap. Where draft 2's decisions are silent, its leans are listed there too, with the options.
