# cMIP: Release Manifest

*Draft 5, 30 October 2026 (the Dubsar Suite's round 8, F407), on draft 4 (`cmip-release-manifest-draft-4.md`), for Nobody, allegedly, to approve. **Experimental, not approved.** The core moved to the redesign (S7h: `docs/s7h-report.md`, steps 1 to 4; `wasm/README.md`, "For the Dubsar Suite"): Envelopes type 0 is a **bake**, "I uploaded this", its signer its uploader, never withdrawn; MOR has **six layers**, Text and Envelopes two of them; and **a collective has no signing key and no member keys**: each member acts for it with their own key, the act naming the collective (Agreements rules 56 to 60). Draft 5 says what a release is in those terms: **a release is a bake of the manifest, uploaded by a member for the collective, naming it**, and it counts for the collective where Agreements finds its uploader, with the members who sign it, meeting the rule of the layer or area that reaches it. Rewritten, each marked **new in draft 5**: "In plain words", "Publishing" (rules 1 to 4), "What counts as a release" (rules 2 and 3), "Verifying" (steps 1 to 3), two stated costs and the first line of reasoning. **The manifest's format does not change**: every manifest written under draft 4 reads the same, and field 2 and field 6's hints, which drafts 1 to 4 called publication ids, are the same act ids, now of bakes. Its hash stays a draft hash until its creator is named at step 17, named until then by the same test value as drafts 1 to 4. Draft 4's own header follows.*

*Draft 4, 15 October 2026, a working draft for Fable's aggregated review, for Nobody, allegedly, to approve: draft 3 (not yet approved, as `cmips/README.md` records it) with the decision of the step 15 review written in: **"implements" names specifications by their hashes** (Development Q7, taken by the project lead under the working practice, from Fable's Development review, D8: "the release manifest's 'implements' (field 6) names spec hashes, a publication id beside each as a hint only, never as the name"). Field 6 now holds, for each specification the release implements, its spec hash, and beside it, optionally, the act id of one publication of it, a hint where to find it; a reader finds the specification by its hash, whichever copy it holds. Rule 4, one stated cost and one line of reasoning follow it, each marked **new in draft 4 (Development Q7, taken)**. Nothing else changes: publishing, what counts as a release and verifying are draft 3's. Follows the Development MIR draft 10 (written in parallel with this draft; its Part three, the specification format, F322 to F325). Not the freeze-ready draft: its hash stays a draft hash until its creator is named at step 17, named until then by the same test value as drafts 1 to 3. Draft 3's own header follows.*

*Draft 3, 14 October 2026 (F290's note, "code released": the listing's reading 2, taken by the project lead under the delegation for development-layer mechanics; Nobody, allegedly, 13 October 2026: "All good then. Don't really need to run these by me." And: "Releasing MOR on MOR is forcing us to use Mor, build for it and that is perfect."). **New, for Nobody, allegedly, to approve. Not yet approved.** Draft 3 is draft 2 with one field added to the manifest, marked **new in draft 3**: field 6, **implements**, the specifications a release implements, named by the act ids of their publications, sorted, each once, signed with the release as every field of the manifest is. A listing reads it first to say which code is released for a specification, and a release's publication's references only for a release without it (website cMIP draft 10, rule 13c). Optional: a release naming nothing leaves it out, and a manifest without it reads as in draft 2. Nothing else changes: publishing, what counts as a release and verifying are draft 2's. One stated cost and one line of reasoning added. Its hash stays a draft hash until its creator is named at step 17; until then it is named by the same test value as drafts 1 and 2 (a test value names the cMIP, not a draft). Readings: `docs/follow-up-pass-2026-10-14.md`. Draft 2's note follows.*

*Draft 2, 1 October 2026 (the Agreements draft 7 rework, after roadmap step 11c). Draft 1 with rule 3 of "What counts as a release" rewritten for the Agreements MIR draft 7: a collective's release rule is an area of its agreement, not a list in its key grammar; the agreement in force for a release is the one its chain declares or its own record wrote before it, judged on the collective's own sequence (F109); and the verifier fetches the collective's own acts too. Nothing else changes: the manifest, publishing and verifying are draft 1's. **Not yet approved.** Draft 1 was approved by Nobody, allegedly, 29 September 2026. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value (the same one: a test value names the cMIP, not a draft). Written against core v18, the Identity MIR draft 10, the Envelopes MIR draft 6, the Text MIR draft 6, the Agreements MIR draft 7, the Development MIR draft 5, the relay transport cMIP draft 2, freeze test suite v18 and findings F1 to F109. Not core: a founding cMIP, frozen at publication, competing with any other way to publish software.*

*Draft 5 is written against MICS v30 and the Identity MIR draft 15, the Envelopes MIR draft 11, the Text MIR draft 11, the Agreements MIR draft 17 and the Development MIR draft 11, as S7h rewrote them.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples. **New in draft 4 (Development Q7, taken):** a statement draft 4 adds, from a decision of the step 15 review. **New in draft 5:** a statement draft 5 adds or rewrites, for the redesign.*

## Reassessment (new in draft 5)

*In plain words: this cMIP still has its job, and the redesign changed who signs a release, not what a release is.*

**What it still does.** *It says what a release of software is: a list of every file with its fingerprint, uploaded and signed so that anyone can check a copy against it, file by file. The core has no such list and no rule for it; without this cMIP, "the code released for a specification" would mean nothing anyone can check.*

**What the redesign changed for it.** *Three things. The act that carries the list was called a publication; it is a* ***bake*** *now, "I uploaded this", and the word publication belongs to the act that sells (Agreements type 6), which a release is not. A collective* ***has no key of its own*** *any more: draft 4 had the collective sign the release with its signing key and the members add their signatures; now* ***a member uploads the release for the collective with their own key, naming it****, and the others who must agree add their signatures, as for any act a collective does. And the rule that decides how many must agree is no longer optional: every collective names, for each layer, who acts for it there, so a release falls under the Envelopes layer's rule, or under a release area that narrows it.*

**Should it retire?** *No. The core now says, for every act a collective does, who must sign it; this cMIP only has to say that a release is such an act, which makes it shorter than before. What it alone defines, the manifest and how to check files against it, is unchanged.*

## In plain words

*A release of the code is a list of every file with its fingerprint, the release it follows, the libraries it depends on, and (new in draft 3) the specifications it implements, named by their hashes (new in draft 4, Development Q7, taken). **New in draft 5:** one member uploads that list for the collective that governs the code, as a bake signed with their own key and naming the collective, and as many other members as the collective's rule asks for add their own signatures, each visible, each a separate act. Anyone can then fetch the list and the files from any relay that holds them, and check, file by file, that what they got is exactly what the members signed.*

*A list the collective's members did not upload and sign is not the collective's release. **New in draft 5:** a list uploaded by one member alone is a release of the collective only where the collective's rule lets one member act alone there; otherwise enough members must sign it to meet the rule. The rule is the one the collective's founding names for the Envelopes layer, or the rule of an area within it that reaches bakes (a release area). And because MOR has no clock, the rule that applies is read from the collective's own chain: the decision the release cites, and the decisions its history holds. When a member leaves, the collective draws a line, and from it on their upload and their signature no longer count for it (F109). A person releasing their own code alone uploads the list with their own key, naming no collective.*

## Purpose

This cMIP defines:

- the manifest: a media type describing a release of software, file by file;
- how a release is uploaded, and where its files are found;
- what counts as a release: for a collective, Agreements' answer for an act done for it, under the agreement in force;
- how anyone verifies a release, and a checkout against it.

It fills no task of the MICS: it is a new kind of thing built from core pieces (Development rule 8a). An agreement that governs releases names it as an extension (Agreements, terms field 15). It adds rules; it relaxes none.

## Dependencies

Identity, Text, Envelopes, Agreements and Development; the relay transport cMIP for fetching.

## The manifest

The manifest is a media object, public, described by a **bake** (Envelopes type 0; **new in draft 5**: drafts 1 to 4 called it a publication) whose media spec (field 0) is this cMIP's spec hash. The bake describes "a manifest of the parts" (Envelopes, "Media"): its work hash, locked hash, size, nonce and key are the manifest's own, and its field 6 lists where the manifest and every file can be fetched. *A bake carries no price and names no one it is made for (its fields 7 and 8 are refused): a release is stored, never sold by its bake. Code sold, if ever, is sold by a publication (Agreements type 6) naming the bake, which this cMIP does not define.*

```cddl
manifest = {
  0 => tstr,            ; name: what is released, e.g. "MOR"
  1 => tstr,            ; version: a label chosen by the uploader
  2 => hash / null,     ; previous: the act id of the previous release's bake; null for the first
  3 => [+ file],        ; every file, sorted by path (byte order of its UTF-8), no path twice
  4 => [* dependency],  ; the libraries it depends on, sorted by registry, name, version
  ? 5 => tstr,          ; source: where it was built from, e.g. "git <commit>"; a hint, never load-bearing
  ? 6 => [+ implemented] ; implements (new in draft 3): the specifications it implements, by their spec hashes
                        ;   (new in draft 4, Development Q7, taken), sorted ascending by spec hash (byte order), no spec hash twice
}

implemented = [         ; new in draft 4 (Development Q7, taken)
  spec: hash,           ; the spec hash of a specification the release implements: its name
  ? hint: hash          ; the act id of one bake uploading it, where a reader may find it: a hint, never the name
]

file = [
  path: tstr,           ; relative, "/" between segments; no empty, "." or ".." segment; no "\\" or control character
  work: hash,           ; tagged_hash("MOR/work", the file's bytes)
  size: uint,           ; the file's size in bytes
  locked: hash,         ; SHA-256 of the file's locked bytes, as stored
  nonce: bstr .size 24, ; the nonce of its lock
  key: bstr .size 32    ; its content key: a release is public
]

dependency = [
  registry: tstr,       ; "crates.io", "npm", or a source as the lock file names it
  name: tstr,
  version: tstr,
  checksum: tstr        ; as the lock file states it: SHA-256 in hex for crates, the integrity string for npm
]
```

*New in draft 5: only the words of three comments changed (field 1's "uploader", field 2's and the hint's "bake"); the format and every value are draft 4's.*

1. **Closed format.** A manifest with a key this cMIP does not define, a field of the wrong kind, an invalid path, or paths out of order or repeated, is invalid. Every `tstr` is canonical text (Text MIR).
2. **Files are media objects.** Each file is locked as a media object of its own (Envelopes, "Media": XChaCha20-Poly1305, no associated data). *A file unchanged since the previous release is the same object: the same locked bytes, nonce and key, not a new object under a reused key. So a new release uploads only what changed.*
3. **Dependencies are what the lock files say.** *They repeat what the lock files among the files already fix, so a reader can see what the code runs on without reading them. They are a statement, checked by whoever rebuilds; nothing here fetches or checks the libraries themselves.*
4. **Implements names specifications by their hashes** (new in draft 3; rewritten in draft 4, Development Q7, taken). Field 6 names each specification the release implements by its spec hash (Development, "The spec hash covers the content"), never by a bake. Beside a spec hash, an entry may give a hint: the act id of one bake uploading that specification, a public bake (Envelopes type 0) whose media spec is the Development MIR's spec hash (Development, Part three), where a reader may look for it. The hint is never the name: the specification named is the one whose spec hash the entry gives, whichever bake of it a reader holds. Field 6 is present only to name at least one; its entries are sorted by spec hash and name no spec hash twice, or the manifest is invalid (rule 1). *It is the releaser's word, signed with the release: whoever uploads the release says the code implements those specifications, and members who sign it say so too. Nothing here checks that the code does. A reader looks for each specification by its hash: at the hint first, where one is given, then at any bake it holds or finds whose content has that spec hash; a specification it finds nowhere is shown as not found (unknown, never invalid). A hint whose bake is not of that specification is shown as a wrong hint, and changes nothing the entry names. A specification uploaded by several identities is one specification, so any of its bakes serves (Fable's Development review, D8).* *Client conformance:* a client making a release SHOULD check, before signing, that each spec hash it names is the hash of a specification's content it holds, and that each hint it gives is a bake of that specification. *New in draft 5: "publication" read "bake" throughout this rule; nothing else changed.*

## Publishing

*New in draft 5: rules 1, 3 and 4 rewritten for a collective with no key of its own.*

1. **Uploaded for the governing identity.** A release is a public bake of the manifest. For a person releasing alone, they upload it with their own key, and it names no collective. **For a collective, a member uploads it with their own key, for the collective, naming it** (Agreements rule 58): its inside's `objects` names the collective's identity as chain, once for each act it cites on the collective's chain, the decision it acts under first, then each other head of the collective's chain the member's client holds. *A bake has no field naming whom it is for: the collective is named where every act for a collective names it, in `objects`. The member's client follows Agreements rule 57: the release is public, so it is sealed to every member by being public, and its citations put it on the collective's chain.*
2. **The bake first.** The uploader puts the bake on its relays, then the manifest's locked bytes, then every new file's. *A relay that keeps media only for bakes it holds (relay transport cMIP, "Publishing media") keeps the manifest; whether it keeps the files is its policy. The uploader lists in field 6 relays that keep them.*
3. **Chains carried along.** The uploader, and every member who signs, carries its identity-chain acts (the same bytes) to the relays it uploads to, and **the uploader carries the collective's too** (new in draft 5: its genesis, which declares its founding agreement, and its rotations), so that a reader who knows only a relay finds each genesis, and from it the homes. *Any relay may carry them; delivery is the signer's interest (Envelopes).*
4. **Members sign.** Each member whose consent the rule needs, beyond the uploader, publishes an Agreements signature act (type 1) naming the bake, public, on the same relays, naming the collective in its `objects` as the bake does (Agreements rules 58 and 60). *Client conformance:* a member's client SHOULD fetch the release and check every file, and SHOULD compare them with the member's own checkout, before signing. *What you sign is what you saw.* *New in draft 5: the uploader's own signature is the bake's; under a rule of `[1, 1]` no other signature is needed, and under `[1, 2]` one more.*

## What counts as a release

A bake B is a release of identity C when:

1. B is valid (Envelopes, "The act"), public, of Envelopes type 0, and its media spec is this cMIP's hash;
2. **new in draft 5:** where C is a person (its genesis declares a signing key), B's uploader is C, and B's standing for C's identity chain is valid: bound by a counting chain act, and not voided by a later rotation (Identity). Where C is a collective (its genesis declares its founding agreement in place of a signing key; Identity rule 1), B's uploader is another identity, B names C in its `objects` as rule 1 of "Publishing" says, and B's standing for **its uploader's** identity chain is valid, as for any act of the uploader;
3. **Agreements' answer for B is met** (new in draft 5, replacing draft 4's reading of the collective's key and declarations; Agreements rules 57, 58, 60, 65, 71 and 72; F109). Where C is a collective, **B counts for C** as Agreements judges an act done for a collective: it is done (public, and on C's chain, citing C's latest decision as its uploader knew it); its uploader, with the identities whose valid signature acts name B, meets the rule that reaches B under the agreement in force for B, each a party of that agreement who signed it or a version it descends from and whose voice remains for B; counted as rule 65 counts. **The rule that reaches B** is that of an area within the Envelopes layer whose kinds name Envelopes bakes (`[1, Envelopes MIR, 0]`), where one does, and otherwise the rule the founding names for the Envelopes layer (terms field 19, key 2). A layer or area that stands frozen makes nothing count (rule 71). The agreement in force for B is the one rule 72 picks from the decisions B's history holds, starting from the decision B cites. *An act naming a collective by a stranger counts for nothing (rule 58): a list a non-member uploads naming the collective is no release of it.* Where C is a person, C's upload suffices. A specification C's agreement adopts nowhere does not make B count (Agreements rule 36a, Q16): B's own specification is the Envelopes MIR's, never unadopted;
4. the manifest is valid, and matches the bake's work hash and size.

A release names its previous release; *whether that one is a release too is checked the same way, on its own.*

*New in draft 5: draft 4 named "the Envelopes and Text layer", one layer before the redesign; a bake belongs to the Envelopes layer (2), which is now its own.*

## Verifying

A verifier needs only the release's id and one place to look.

1. Fetch B; recompute its id; open it with the key on its outside; check its type and media spec.
2. Resolve its uploader's identity chain from its homes (relay transport cMIP, "Homes"), starting from its genesis; judge B's standing. **New in draft 5:** where B names a collective, resolve the collective's identity chain too, from its genesis, which declares its founding agreement.
3. Read the collective's founding agreement and the decisions B cites and its history holds; fetch each, its parents, every party's identity chain and signature acts naming B, and the collective's own acts (its records, the clones they name, and the resignations they register), from the places given, the bake's field 6 and the homes; ask Agreements whether B counts for the collective.
4. Fetch the manifest's locked bytes; check their SHA-256, open them, check the work hash and size; decode the manifest strictly.
5. Fetch every file's locked bytes; check their SHA-256, open them, and check each file's work hash and size.

The release verifies only if every step passes. A verifier writes the files out only once all of them have passed. *A checkout from anywhere else, such as the code repository on GitHub, can then be compared file by file with the manifest: the same work hash is the same file.*

## Stated costs

- **One member's key can be the release** (new in draft 5, replacing draft 4's "One key signs for the collective"). Where the rule reaching releases is `[1, 1]`, any one member uploads a release alone; whoever holds that member's signing key can too, until the member's rotation disowns it (Identity rule 34). *A rule of two or more members, or a release area narrower than the Envelopes layer, covers releases; a founding client shows, layer by layer, what one member may do alone (Agreements rule 60, client conformance).*
- **A departure counts from the collective's line.** A member who resigns still counts toward a release done before the record that registers the resignation (Agreements, F109, stated cost). *The collective's client draws that line in its next act.*
- **A client reading only Envelopes cannot tell a collective's release** (new in draft 5). Whether B counts for C is Agreements' answer; a client that does not read Agreements shows a release of a collective unknown, as the MICS says of every act for a collective. *It can still check every file against the manifest; it cannot say that the collective released it.*
- **Files a relay refuses.** An allowlist relay may keep the manifest and not the files; the files are then found only where field 6 points. *A release is as available as the relays that keep it.*
- **Dependencies are declared, not verified.** A manifest says which libraries the code was built with; nothing in it proves they are the ones any machine will download.
- **"Implements" is a claim** (new in draft 3). A release naming a specification says its releaser holds that the code implements it; nothing checks the code against the specification. *A reader shows who claims it and lets whoever adopts the code judge.*
- **A manifest with field 6 is invalid to a draft 2 reader** (new in draft 3). Draft 2's closed format refuses a key it does not define, and the drafts share one test value until step 17. *Clients are updated before a release naming field 6 is published; a release naming nothing reads the same in every draft.*
- **Draft 3's field 6 and draft 4's are not read by each other** (new in draft 4, Development Q7, taken). Draft 3's field 6 holds bare act ids, draft 4's entries holding a spec hash and an optional hint; each draft's closed format refuses the other's, and the drafts share one test value until step 17. *Draft 5 reads draft 4's field 6 unchanged.*
- **A release under draft 4 is no release under draft 5** (new in draft 5). Draft 4's release was signed by the collective's own signing key, which the redesigned core refuses (Identity rule 1): such a bake has no counting standing. *A collective uploads its releases again under draft 5; the manifests and files are the same bytes, so only the bake and the signatures are new.*

## Reasoning

- **A member uploads, members consent visibly** (new in draft 5, replacing draft 4's "The governing identity signs"). *Draft 4 had the collective sign, because a collective's key could be fenced at a member change by its rotation, and a member's own signature could not. The redesign fences a member by the line instead: a member's power ends at the line that registers their departure (Agreements rule 58), so an upload or signature after it counts for nothing for the collective, while their own key keeps signing their own acts. So the collective needs no key, and whoever uploads and signs is visible by name.*
- **Rules by the chain, not by the clock.** *Which agreement applies is read from the collective's own chain, at the decision the release cites. No time is needed, and no one can pick the rules after the fact.*
- **Every file on its own.** *A file is checked by its own fingerprint, so a checkout from anywhere, a mirror or a stranger's disk, can be compared with the release one file at a time, and an unchanged file is never uploaded twice.*
- **Implements, in the manifest** (new in draft 3). *A release saying what it implements in its own signed list is the release's word, made once, with the members' signatures on it; a reference from the bake can also mean a changelog or a dependency.*
- **By spec hash, a bake only as a hint** (new in draft 4, Development Q7, taken). *Draft 3 named copies, so that a reader found the specification where the release pointed. But a copy is one upload: the same specification uploaded by three identities has three act ids, and a reader holding another copy than the one named showed "not found" for a specification it held (Fable's Development review, D8). A claim about a specification names the specification, by the hash that is its name everywhere (Development rule 1, F41); the bake beside it only saves the reader a search.*
- **Agreements decide, this cMIP asks.** *What a release is, is defined here, so no lower layer depends on Agreements. Whether members consented is Agreements' answer, the same for a release as for any act a collective does.*

## Readings, confirmed

Where the texts were silent, draft 1 took the readings listed in `clients/repo/README.md`, confirmed by Nobody, allegedly (29 September 2026). Draft 2 adds none. Draft 5 takes two, each for Nobody, allegedly, to confirm: the rule reaching a release is an area naming Envelopes bakes, else the Envelopes layer's (not the Development layer's, though this cMIP is an extension: the release's own act is a bake); and a release under draft 4 is uploaded again rather than read under the old rules.
