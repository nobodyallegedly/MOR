# cMIP: Website

*Draft 1, 1 October 2026 (roadmap step 10a). **Not yet approved:** written for Nobody, allegedly, to review, with the questions listed in `clients/site/README.md`. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v17, the Identity MIP draft 10, the Envelope MIP draft 6, the Text MIP draft 6, the Law MIP draft 6, the Production MIP draft 4, the relay transport cMIP draft 2, the release manifest cMIP draft 1, the long-form text format cMIP draft 1, freeze test suite v17 and findings F1 to F107. Not core: a founding cMIP, frozen at publication, competing with any other way to publish a website.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A website is a handful of files: pages, a stylesheet, pictures. Here, the site's owner publishes a list of those files, each with its fingerprint, signed with their identity, on relays, the same way a release of the code is published. Anyone can fetch the list and the files and check that every byte is what the owner signed.*

*Most people do not fetch files from relays: they type a domain into a browser. A gateway is what stands at the domain. It fetches the site from relays, checks it, and serves it. But a browser trusts whoever answers at the domain, so a gateway could lie. That is why the pages never come alone: every page is shown inside a small frame of the gateway's own software, which carries the core library and checks, in the visitor's own browser, who signed the site and whether the page matches what they signed, and says so above the page. A page that does not match is not shown.*

*That frame is itself served by the gateway, so a gateway that is hostile could change the frame too. No page can check the code that checks it. What this cMIP does about that is to make the frame small, the same for every site, and taken from MOR's own signed releases, so that anyone can compare what a gateway serves with what was released, from somewhere else; and to keep every byte of the site checkable without any gateway at all.*

## Purpose

This cMIP defines:

- the site manifest: a media type describing one version of a website, file by file;
- how a site is published, and what counts as a version of an identity's site;
- how a site is shown: what a display client checks and what it may display;
- what a gateway is: a display client served from a domain;
- what a hostile gateway can and cannot do (the stated cost of roadmap step 10a).

It fills no task of the MIPs: it is a new kind of thing built from core pieces (Production rule 8a). It adds rules; it relaxes none.

## Dependencies

Identity, Envelope and Production; Text, for the acts a page shows; the relay transport cMIP for fetching. The release manifest cMIP for the shape of a file entry, and for the release of the display client's own code.

## The site manifest

A version of a site is a media object, public, described by a publication (Envelope type 0) whose media spec (field 0) is this cMIP's spec hash. The publication describes the manifest (Envelope, "Media"): its work hash, locked hash, size, nonce and key are the manifest's own, and its field 6 lists where the manifest and every file can be fetched.

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
7. **Files are media objects,** locked one by one (Envelope, "Media": XChaCha20-Poly1305, no associated data). *A file unchanged since the previous version is the same object: the same locked bytes, nonce and key, so a new version uploads only what changed (release manifest cMIP, rule 2).*

## Publishing

1. **Signed by the site's owner.** A version is published by the identity whose site it is. The publication is public; it needs no `for`. *A collective's site is not defined by this draft: see "What counts as a version", rule 3.*
2. **The publication first,** then the manifest's locked bytes, then every new file's, on the relays named in field 6. *As for a release: a relay that keeps media only for publications it holds then keeps the manifest.*
3. **Chains carried along.** The owner carries their identity-chain acts to those relays, so that whoever knows only a relay finds the genesis, and from it the homes.
4. **One version names the one before.** *Nothing is updated. A new version is a new act; the old one stays on record and still verifies.*

## What counts as a version

A publication P is a version of identity S's site when:

1. P is valid (Envelope, "The act"), public, of Envelope type 0, and its media spec is this cMIP's hash;
2. P's signer is S, and P's standing for S's identity chain is valid: bound by a counting chain act, and not voided by a later rotation (Identity);
3. S's chain declares no agreement S lives under (Law declaration of kind 0) at P's binding. *A collective's site is left to a later draft, which would judge it by Law as the release manifest does; this draft refuses it rather than accept it unjudged;*
4. no withdrawal of P (Envelope, "Withdrawal") by S is found where the verifier looked. *Silence proves nothing (relay transport cMIP): a withdrawal on a relay nobody asks is not found;*
5. the manifest is valid, and matches the publication's work hash and size.

*Which version is current is not something MOR can say: it has no clock. A gateway serves the version its operator names (see "Gateways"); a visitor sees which version that is.*

## Showing a site

A **display client** is software that shows a site to a person. It is given a version (P's act id), the identity it expects (S), and places to look. *The gateway's frame, below, is one; a command-line verifier that writes the files out is another.*

8. **Check before showing.** A display client shows a file only once P is a version of S's site, by the rules above, judged by the core library on the visitor's own device, and the file's bytes match their manifest entry (work hash and size). It never shows a file whose bytes it has not checked, whoever served them.
9. **Say who signed.** Beside every file it shows, outside the file's own display, a display client shows: whether the version verified, in plain words; the signer's whole fingerprint (the identity hash, as the web reader shows it); whether the signer is the identity the display client was told to expect; and P's act id. *Outside: a page cannot draw over it or remove it.*
10. **Fail visibly.** A version that does not verify, or a file that does not match, is shown as failing, with the reason, and the file is not shown. *Client conformance.* A display client SHOULD NOT fall back to bytes from another source for a file the gateway served wrongly without saying so: what a gateway served wrongly is itself what a visitor needs to know.

### Pages

A page is an HTML document, UTF-8. What it may use, and how a display client shows it:

11. **No code runs.** Nothing in a page runs: a display client shows a page in a context where scripts are disabled, and drops `script`, `noscript`, `iframe`, `frame`, `object`, `embed`, `form`, `base`, `meta` that refresh or redirect, every attribute starting with `on`, and `style` elements and attributes. *A site is pages to read, not a program. A page's look comes from its stylesheets.*
12. **Nothing from elsewhere.** A page uses only files of the same version: pictures (`img` with `src` naming a picture's path, relative to the page), and stylesheets (`link` with `rel="stylesheet"` and `href` naming a stylesheet's path). A display client loads them only from what it has checked, and drops any other reference that would load something (an address on another site, `srcset`, `picture` sources, `video`, `audio`, a stylesheet's `@import` and `url()`). *A visitor's browser asks no third party for anything while a page is shown, so no third party learns who reads it.*
13. **Acts shown as acts.** An element `mor-act` whose attribute `act` holds an act id (64 lower-case hex digits) is shown as that act: fetched, checked and judged through its signer's identity chain by the display client, with its own signer and standing, as the web reader shows a post. A display client shows each act apart from the page's own styles, and lists every act the page shows, with its standing and its signer's fingerprint, beside the page (rule 9). *The site holds the link; the act stays the act, signed by whoever signed it, and is not copied into the site. A page's stylesheet could still draw over an act's box, so what counts is the list beside the page, which the page cannot touch.* A display client that cannot show it shows its id and why.
14. **Links on the visitor's action.** A link (`a` with `href`) to a path of the same version opens that page through the display client. A link to an `https:` or `mailto:` address opens on the visitor's action, outside the site. Any other link is shown as text. *Client conformance.* A display client SHOULD show where a link leaving the site goes before it is followed.
15. **Pages are designs, not terms.** *A stylesheet can hide words and move them; the Text MIP's bound (F102) governs text acts and their formats, not a site's pages. Whatever is to be agreed or signed is a text act, read in a client that keeps the bound: a page may show it (rule 13) but never stands in for it.*
16. **The title** of a page is its `title` element's text, shown by the display client as the page's title. A page without one is titled by its path.
17. **A file that is not a page** is shown by its kind (rule 4): a picture as itself, a stylesheet or text as plain text, each with rule 9's line beside it.

## Gateways

A **gateway** serves a site at an address (a domain over HTTPS, an onion address) to browsers. It is two things at once: a server, which fetches a version from relays, checks it, and serves its files; and a display client, which runs in the visitor's browser.

18. **The gateway checks before it serves.** A gateway serves a version only once it has checked it by "What counts as a version", every file included. It serves the version its operator names; it never serves a version that did not verify, nor a file that did not match.
19. **Never a page alone.** At every address of the site, a gateway serves its display client, which fetches the file it is asked for and shows it by "Showing a site". A gateway serves a site's files themselves only as bytes for its display client to check, never as a document a browser would display on its own. *So no page of the site ever reaches a visitor's screen without passing the check.*
20. **The display client is released code.** The display client a gateway serves is a release of software, published and verifiable by the release manifest cMIP, and the same for every site the gateway serves; a gateway SHOULD name the release it runs. *A site carries no code of its own (rule 11), so the code that checks is not the site's to choose, and it can be compared with its release by anyone, from anywhere.*
21. **What the gateway's settings say is a hint.** The version, the expected identity, the owner's name and the relays a gateway hands its display client are the operator's word: the display client checks the version against the relays and shows the signer's fingerprint, so that a visitor who knows the fingerprint can tell.

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
- **No current version.** MOR has no clock, so nothing says which version is the latest: a gateway serves the one its operator names, and a visitor sees which one it is. A withdrawal is found only where someone looks.
- **Relays learn what is fetched.** The visitor's browser fetches the version and its signer's chain from relays, which learn that someone opened the site; a gateway learns which pages.
- **Pages are not bound like text acts** (rule 15): a page can hide or move words with its stylesheet. Terms belong in text acts.

## Reasoning

- **Like a release.** *A site is files named by hash under a signed list, exactly as a release of the code is (release manifest cMIP). The same file entries, the same publishing order, the same reuse of unchanged files: one way to name files on MOR, not two.*
- **The check belongs to the visitor's browser, not to the gateway's word.** *A gateway that checked and said "trust me" would add nothing a plain web server does not. So the gateway checks for its own sake (it never serves a broken site), and the visitor's browser checks again for the visitor's.*
- **No code in a site.** *If a site could carry scripts, its own code could paint a fake "verified" or fetch something unchecked. Without them, what a visitor sees is what was signed, shown by a display client that is the same everywhere.*
- **The display client is MOR's code, released.** *The one thing a visitor must trust is then one small program, the same for every site, signed as a release: something that can be checked once, by many, rather than every site's code by every visitor.*
- **Acts stay acts.** *The site's owner points at acts; they are not copied into the site, so each keeps its own signer and standing, and is judged on its own.*

## Readings and questions

Where the texts are silent, this draft takes the readings and leans listed in `clients/site/README.md`, for Nobody, allegedly, to confirm or change.
