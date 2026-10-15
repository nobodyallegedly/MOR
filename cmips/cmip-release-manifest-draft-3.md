# cMIP: Release Manifest

*Draft 3, 14 October 2026 (F290's note, "code released": the listing's reading 2, taken by the project lead under the delegation for development-layer mechanics; Nobody, allegedly, 13 October 2026: "All good then. Don't really need to run these by me." And: "Releasing MOR on MOR is forcing us to use Mor, build for it and that is perfect."). **New, for Nobody, allegedly, to approve. Not yet approved.** Draft 3 is draft 2 with one field added to the manifest, marked **new in draft 3**: field 6, **implements**, the specifications a release implements, named by the act ids of their publications, sorted, each once, signed with the release as every field of the manifest is. A listing reads it first to say which code is released for a specification, and a release's publication's references only for a release without it (website cMIP draft 10, rule 13c). Optional: a release naming nothing leaves it out, and a manifest without it reads as in draft 2. Nothing else changes: publishing, what counts as a release and verifying are draft 2's. One stated cost and one line of reasoning added. Its hash stays a draft hash until its creator is named at step 17; until then it is named by the same test value as drafts 1 and 2 (a test value names the cMIP, not a draft). Readings: `docs/follow-up-pass-2026-10-14.md`. Draft 2's note follows.*

*Draft 2, 1 October 2026 (the Agreements draft 7 rework, after roadmap step 11c). Draft 1 with rule 3 of "What counts as a release" rewritten for the Agreements MIR draft 7: a collective's release rule is an area of its agreement, not a list in its key grammar; the agreement in force for a release is the one its chain declares or its own record wrote before it, judged on the collective's own sequence (F109); and the verifier fetches the collective's own acts too. Nothing else changes: the manifest, publishing and verifying are draft 1's. **Not yet approved.** Draft 1 was approved by Nobody, allegedly, 29 September 2026. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value (the same one: a test value names the cMIP, not a draft). Written against core v18, the Identity MIR draft 10, the Envelopes MIR draft 6, the Text MIR draft 6, the Agreements MIR draft 7, the Development MIR draft 5, the relay transport cMIP draft 2, freeze test suite v18 and findings F1 to F109. Not core: a founding cMIP, frozen at publication, competing with any other way to publish software.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A release of the code is a list of every file with its fingerprint, the release it follows, the libraries it depends on, and (new in draft 3) the specifications it implements. The collective that governs the code publishes that list, signed with its own key, and enough members add their own signatures, each visible, each a separate act. Anyone can then fetch the list and the files from any relay that holds them, and check, file by file, that what they got is exactly what the members signed.*

*A release the collective did not sign is not a release. A list signed by the collective's key alone, without the member signatures its agreement asks for, is not a release either: the members holding the collective's releases (an area of its agreement) must sign it, enough of them to meet the area's number. And because MOR has no clock, the rules that apply are read from the collective's own sequence: the agreement its identity chain declared when its key signed the list, or a later version the collective wrote on its record before the list. When members change, the collective rotates, and the old key and old rules are fenced off (F100); when a member leaves, the collective draws a line, and from it on their signature no longer counts (F109).*

## Purpose

This cMIP defines:

- the manifest: a media type describing a release of software, file by file;
- how a release is published, and where its files are found;
- what counts as a release: Agreements' member signatures, under the agreement in force;
- how anyone verifies a release, and a checkout against it.

It fills no task of the MICS: it is a new kind of thing built from core pieces (Development rule 8a). An agreement that governs releases names it as an extension (Agreements, terms field 15). It adds rules; it relaxes none.

## Dependencies

Identity, Envelopes, Text, Agreements and Development; the relay transport cMIP for fetching.

## The manifest

The manifest is a media object, public, described by a publication (Envelopes type 0) whose media spec (field 0) is this cMIP's spec hash. The publication describes "a manifest of the parts" (Envelopes, "Media"): its work hash, locked hash, size, nonce and key are the manifest's own, and its field 6 lists where the manifest and every file can be fetched.

```cddl
manifest = {
  0 => tstr,            ; name: what is released, e.g. "MOR"
  1 => tstr,            ; version: a label chosen by the publisher
  2 => hash / null,     ; previous: the act id of the previous release's publication; null for the first
  3 => [+ file],        ; every file, sorted by path (byte order of its UTF-8), no path twice
  4 => [* dependency],  ; the libraries it depends on, sorted by registry, name, version
  ? 5 => tstr,          ; source: where it was built from, e.g. "git <commit>"; a hint, never load-bearing
  ? 6 => [+ hash]       ; implements (new in draft 3): the act ids of the publications of the specifications it implements,
                        ;   sorted ascending (byte order), no id twice
}

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

1. **Closed format.** A manifest with a key this cMIP does not define, a field of the wrong kind, an invalid path, or paths out of order or repeated, is invalid. Every `tstr` is canonical text (Text MIR).
2. **Files are media objects.** Each file is locked as a media object of its own (Envelopes, "Media": XChaCha20-Poly1305, no associated data). *A file unchanged since the previous release is the same object: the same locked bytes, nonce and key, not a new object under a reused key. So a new release uploads only what changed.*
3. **Dependencies are what the lock files say.** *They repeat what the lock files among the files already fix, so a reader can see what the code runs on without reading them. They are a statement, checked by whoever rebuilds; nothing here fetches or checks the libraries themselves.*
4. **Implements names publications** (new in draft 3). Field 6 names each specification the release implements by the act id of a publication of it: a public publication (Envelopes type 0) whose media spec is the Development MIR's spec hash (Development, Part three). Field 6 is present only to name at least one; its ids are sorted and unique, or the manifest is invalid (rule 1). *It is the releaser's word, signed with the release: whoever signs the release says the code implements those specifications, and members who sign it say so too. Nothing here checks that the code does; a reader checks that each id is a specification's publication it can find, and shows the rest as not found. A specification published by several identities is one specification (Development, "The spec hash covers the content"), so any of its publications names it. Client conformance: a client making a release SHOULD check, before signing, that each id it names is the publication of a specification.*

## Publishing

1. **Signed by the governing identity.** A release is published by the identity whose release it is: for a collective, the collective itself, signing with its signing key (F100). The publication is public; it needs no `for`.
2. **The publication first.** The publisher puts the publication on its relays, then the manifest's locked bytes, then every new file's. *A relay that keeps media only for publications it holds (relay transport cMIP, "Publishing media") keeps the manifest; whether it keeps the files is its policy. The publisher lists in field 6 relays that keep them.*
3. **Chains carried along.** The publisher, and every member who signs, carries its identity-chain acts (the same bytes) to the relays it publishes on, so that a reader who knows only a relay finds each genesis, and from it the homes. *Any relay may carry them; delivery is the signer's interest (Envelopes).*
4. **Members sign.** Each member who consents publishes an Agreements signature act (type 1) naming the publication (Agreements draft 7), public, on the same relays. *Client conformance:* a member's client SHOULD fetch the release and check every file, and SHOULD compare them with the member's own checkout, before signing. *What you sign is what you saw.*

## What counts as a release

A publication P is a release of identity C when:

1. P is valid (Envelopes, "The act"), public, of Envelopes type 0, and its media spec is this cMIP's hash;
2. P's signer is C, and P's standing for C's identity chain is valid: bound by a counting chain act, and not voided by a later rotation (Identity);
3. **Agreements' answer for P is met** (Agreements draft 7, rules 36a, 37, 37c, 44d; F100, F109). If C's chain declares, at P's binding, an agreement C lives under (Agreements declaration of kind 0), every declaration up to it must hold (the founding agreement signed by every founder; each later one a constitutional clone of the agreement in force at its rotation, complete with the signature acts the rotation names), and the agreement in force for P is the one declared there or the clone written by the latest record of C under that binding that P counts as made after, on C's own sequence. If an area of that agreement reaches P (an area whose kinds name Envelopes publications, type 0, or the Envelopes and Text layer), valid signature acts naming P by that area's holders whose voice remains for P must meet its number, counted as Agreements count it (all of them where fewer remain than it asks for; none where the area is frozen). If no area reaches P, C's own signature suffices, as it does where C declares no agreement: C is not a collective. A specification C's agreement adopts nowhere does not make P count (Agreements rule 36a, Q16): P's own specification is the Envelopes MIR's, never unadopted;
4. the manifest is valid, and matches the publication's work hash and size.

A release names its previous release; *whether that one is a release too is checked the same way, on its own.*

## Verifying

A verifier needs only the release's id and one place to look.

1. Fetch P; recompute its id; open it with the key on its outside; check its type and media spec.
2. Resolve C's identity chain from its homes (relay transport cMIP, "Homes"), starting from its genesis; judge P's standing.
3. Read the agreements C's chain declares; fetch each, its parents, every party's identity chain and signature acts, and C's own acts (its records, the clones they name, and the resignations they register), from the places given, the publication's field 6 and C's homes; ask Agreements.
4. Fetch the manifest's locked bytes; check their SHA-256, open them, check the work hash and size; decode the manifest strictly.
5. Fetch every file's locked bytes; check their SHA-256, open them, and check each file's work hash and size.

The release verifies only if every step passes. A verifier writes the files out only once all of them have passed. *A checkout from anywhere else, such as the code repository on GitHub, can then be compared file by file with the manifest: the same work hash is the same file.*

## Stated costs

- **One key signs for the collective.** Whoever holds the collective's signing key can sign acts no area reaches, alone (F100). *An area reaching every publication, as the test collective's release area does, covers releases.*
- **A departure counts from the collective's line.** A member who resigns still counts toward a release the collective signed before the record that registers the resignation (Agreements, F109, stated cost). *The collective's client draws that line in its next act.*
- **Files a relay refuses.** An allowlist relay may keep the manifest and not the files; the files are then found only where field 6 points. *A release is as available as the relays that keep it.*
- **Dependencies are declared, not verified.** A manifest says which libraries the code was built with; nothing in it proves they are the ones any machine will download.
- **"Implements" is a claim** (new in draft 3). A release naming a specification says its releaser holds that the code implements it; nothing checks the code against the specification. *A reader shows who claims it and lets whoever adopts the code judge.*
- **A manifest with field 6 is invalid to a draft 2 reader** (new in draft 3). Draft 2's closed format refuses a key it does not define, and the three drafts share one test value until step 17. *Clients are updated before a release naming field 6 is published; a release naming nothing reads the same in every draft.*

## Reasoning

- **The governing identity signs, members consent visibly.** *A member's signature on its own cannot be fenced: members' identities do not rotate when they leave. The collective's key can: its rotation at a member change voids whatever the old key signs afterwards. So the collective signs, and the members' signatures say who agreed (F100).*
- **Rules by the chain, not by the clock.** *Which agreement applies is read from the collective's own chain at the act's binding. No time is needed, and no one can pick the rules after the fact.*
- **Every file on its own.** *A file is checked by its own fingerprint, so a checkout from anywhere, a mirror or a stranger's disk, can be compared with the release one file at a time, and an unchanged file is never uploaded twice.*
- **Implements, in the manifest** (new in draft 3). *A release saying what it implements in its own signed list is the release's word, made once, with the members' signatures on it; a reference from the publication can also mean a changelog or a dependency. The field names publications, not spec hashes, so a reader finds the specification where the release points; the same content is the same specification wherever published.*
- **Agreements decide, this cMIP asks.** *What a release is, is defined here, so no lower layer depends on Agreements. Whether members consented is Agreements' answer, the same for a release as for any act an area of a collective reaches.*

## Readings, confirmed

Where the texts were silent, draft 1 took the readings listed in `clients/repo/README.md`, confirmed by Nobody, allegedly (29 September 2026). Draft 2 adds none.
