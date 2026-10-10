# mor-repo

The repo client, in TypeScript, with the core library through WebAssembly. Roadmap step 5a: MOR governs its own code.

**The command line is a test tool, not a client** (F187, 9). `src/cli.ts` drives this package's mechanics for tests and scripts: it marks a member change from this device's copy of the collective, without asking Agreements first, so it can sign and publish a clone whose mark Agreements call false, which breaks the collective (Agreements rule 37d; the step 11b fault). The collective client (`clients/collective`) is the client: it takes every mark from Agreements' own count and asks Agreements again before anything is sent.

**Test collectives only.** A test collective holds every key in software, in its file: its everyday key and every member's share of its safety key. Its members are simulated identities, all held by whoever runs it, so the mechanics run (the release rule, visible signatures, clone, rotation) while independent consent does not; the freeze report says so. The real collective is created at step 17 the same way, with each member's share on that member's own offline device.

## In plain words

The code of MOR is published as releases. A release is a list of every file with its fingerprint, the release before it, and the libraries the code depends on. MOR publishes it on its own relays, not only on GitHub.

- **A collective owns the releases.** A collective is an identity of its own, like a person's, whose keys its members hold under a founding agreement. The members sign that agreement, each with an act of their own. It says: one member keeps the everyday key; the safety key is cut into shares, any two of which rebuild it; a release counts only when two members have signed it.
- **Publishing a release.** The collective signs the list with its own key and puts it, and every file, on its relays. Then members sign it, each with a visible act. Until enough have signed, it is not a release.
- **Checking a release, on any machine.** Give the program the release's number and one relay. It finds the collective's identity, checks that the collective really signed, reads the founding agreement the collective declared, checks the members' signatures against it, and then fetches every file and checks each against its fingerprint. Only if everything matches does it say VERIFIED and write the files out. It can also compare a GitHub checkout with the release, file by file.
- **Changing members.** A member who leaves signs a resignation alone, and the collective writes it at once on its own record, its line: from there on, that member's signature counts for nothing (F109). The others and any newcomer sign a copy of the agreement with the new list (a clone), marked with the rule that brought it in (the constitutional change rule: by default every member whose voice remains), and the collective rotates to new keys, its safety key dealt afresh to the new members only. The rotation names the clone and the signatures that complete it. From then on the new rules apply, and anything the old key signs is void (F100).
- **Ordinary changes.** The release rule is an area every member holds (Agreements draft 7). Its own words are its holders' to change: they sign a clone marked with the area's power, and the collective writes it on its record at once, with no rotation.

## Precisely

| File | What |
| --- | --- |
| `src/specs.ts` | The Agreements spec hash and the manifest cMIP's, test values until the freeze and step 17. |
| `src/agreements.ts` | Agreements draft 7 acts as the collective makes them: founding terms (the release rule as an area, the abandonment clause removing a voice) and clones with their marks (checked by the core library's `checkTerms` and `agreementsClonePlan` before signing), signature acts, resignations, records; carrying an identity's chain to the relays it publishes on. |
| `src/collective.ts` | The test collective file; founding (agreement signed by every founder, dealing, genesis declaring the agreement, routes); member change (resignations registered by a record, clone marked with the constitutional change rule, signatures, rotation from the staying members' shares declaring the clone with its signature acts, next key dealt to the new members); an ordinary change recorded at once; settling. |
| `src/release.ts` | The manifest (release manifest cMIP draft 1): encoding, strict decoding, files from `git ls-files`, dependencies from `Cargo.lock` and every `package-lock.json`; publishing a release; a member's signature; verifying a release as a fresh machine; comparing a checkout. |
| `src/cli.ts` | The command line (`npm run cli -- help`): a test tool, not a client. |

It reuses the genesis client (`../genesis/src`) for identities, the relay transport and the WebAssembly. What the core library does, through `mor-wasm`: Agreements' formats and checks (`core/src/agreements/`: terms, areas and marks, key grammars with F96 and F105, the powers a clone needs, records and lines on the collective's own sequence, which agreement is in force, the consent an area requires), media locking and work hashes, and the air-gapped Module's share dealing (`modules/airgap/src/shares.rs`: Pedersen dealing, each holder's check, the rebuild check).

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../repo
npm install
npm test            # starts real homes and a relay from target/debug/mor-relay (built if needed)
```

- `test/repo.test.ts`, the step's "done when", against three homes under three test operators and an open relay, on local ports: a collective founded by three members, each checking their share of the same dealing; a release that is not one with no signature, nor with one, nor with a stranger's, and is one with two; verified by a verifier that knows only the release's id and one relay, which writes out every file; a checkout compared file by file; a member leaves alone by a resignation the collective registers at once, and another joins by clone and rotation, the rotation naming the signatures that complete the clone; the first release still verifying under the founding agreement; the old key's "release" after the rotation refused as void, whoever signs it; the next release reusing unchanged files, not counting with the former member's signature, counting with the new member's; an ordinary change recorded at once without a rotation, the next release judged under it and the one before under the version before; the whole MOR repository published and verified file by file, with its crates and npm packages listed; strict manifests; F96's grammar refused, an agreement leaving a member uncovered by the abandonment clause refused (F105), draft 6's listed act types refused, each by a stable error code; tampered shares refused, and one share rebuilding nothing.
- `test/cli.test.ts`: the command line as its users drive it; `verify` runs as a separate process knowing only the release's id and one relay; a member refuses to sign a release that differs from their checkout.
- `core/tests/agreements.rs` and `core/tests/agreements_collective.rs` (Rust): Agreements draft 7's formats, checks and powers, and freeze suite v18's scenario 3 (with 7o's ordering stories) and scenario 1, on hand-made chains.

## Running it on the deployed homes

*The build window cannot reach the public homes, and it keeps no keys from one window to the next, so this is run by Nobody, allegedly, on the machine that runs the onion home, where the test collective's files then live. Every later window prepares the code; the release is published and signed from that machine.*

```
cd clients/genesis && npm install && npm run wasm && cd ../repo && npm install
alias mg='npm run -s --prefix ../genesis cli --'
alias mr='npm run -s cli --'
V='--via http://ONION.onion=http://127.0.0.1:8080'
H='--home https://home1.dubsar.org --home https://home2.dubsar.org --home http://ONION.onion'
```

1. **Four member identities** (three found the collective, one joins later). Allow each on the onion home, then send its genesis again:
   ```
   for n in 1 2 3 4; do mg new --file ~/mor-test/m$n.json $H $V; done
   mor-relay allow --dir ~/mor-home MEMBER_ID     # for each
   mg spread --file ~/mor-test/m1.json $V          # for each
   ```
2. **Found the collective** (its relays: the two open homes, which keep files):
   ```
   mr found --file ~/mor-test/collective.json --member ~/mor-test/m1.json --member ~/mor-test/m2.json --member ~/mor-test/m3.json \
     $H --relay https://home1.dubsar.org --relay https://home2.dubsar.org $V
   ```
   The onion home refuses the collective's genesis until it is allowed: `mor-relay allow --dir ~/mor-home COLLECTIVE_ID`, then run `mg spread` on the collective's identity file (inside `collective.json`), or found it again after allowing.
3. **A release, signed:**
   ```
   mr release --file ~/mor-test/collective.json --version 5a.1 $V
   mr sign --member ~/mor-test/m1.json --release ID --at https://home1.dubsar.org --against ../.. $V
   mr sign --member ~/mor-test/m2.json --release ID --at https://home1.dubsar.org --against ../.. $V
   ```
4. **On a fresh machine** (any computer with Node and Rust, a fresh clone): `mr verify ID --at https://home2.dubsar.org --out /tmp/mor-release --against .`
5. **A member leaves and one joins, then the next release:**
   ```
   mr change --file ~/mor-test/collective.json --stay ~/mor-test/m1.json --stay ~/mor-test/m2.json --join ~/mor-test/m4.json --leave M3_ID $V
   mr release --file ~/mor-test/collective.json --version 5a.2 $V
   mr sign --member ~/mor-test/m2.json --release ID2 --at https://home1.dubsar.org $V
   mr sign --member ~/mor-test/m4.json --release ID2 --at https://home1.dubsar.org $V
   mr verify ID2 --at https://home2.dubsar.org
   ```

Keep `~/mor-test/*.json` secret: `collective.json` holds the collective's everyday key and every share of its safety key.

## Readings, confirmed by Nobody, allegedly (29 September 2026)

Where the texts are silent, the program and Agreements draft 6 take the reading below.

1. **Signature acts.** A signature's payload is `{ 0 => the act signed }`, and its inside names, in `objects`, the act signed as both chain and predecessor. Signatures naming one act are parallel consents to it, never a fork among themselves (Agreements rule 5, reworded).
2. **The release rule's number.** Agreements rule 36 lets a grammar list act types that need visible member signatures, but not how many. Draft 6 gives each listed type an Agreements `rule`: every party, any k, or named parties (`[spec, type, rule]`).
3. **An agreement that uses no task** carries an empty cMIP map (terms field 2, `{ * uint => hash }`). The test collective's agreement names the manifest cMIP as an extension (field 15), not a task.
4. **The abandonment clause's format:** the authority, a named identity or a threshold of the other parties; the outcomes allowed, from rule 53's list; a period only with a time reference. The test collective names no time reference, so the authority (the two other members) judges absence without one, and a missed deadline stays undetermined (Agreements rule 33).
5. **The Agreements declaration.** Kind 0 of Agreements in the declarations slot is the agreement a collective lives under; its value is the agreement's id. A member change's rotation declares the clone.
6. **Which agreement is in force** for an act of the collective: the one declared at the chain act that bound the act's key. Each agreement declared after the founding one must be a complete clone of the one declared before it; if not, the collective's listed acts count for nothing.
7. **Whose signatures count:** only parties who signed the agreement in force. A party a clone adds is bound, and counts, once it signs the clone.
8. **A clone is complete** when the parent's clone rule is met among the parent's parties. Its inside names `[[parent, parent]]` in `objects`.
9. **Terms fields whose formats are still open** (stakes, split plan, fork rule, refund terms) are refused as unsupported, never accepted unchecked.
10. **F96, checked from the agreement alone:** a safety key held by every member needs a recovery path; a sole holder needs an escrowed share, released by the authority the abandonment clause names, and a seat successor in the holder's succession plan; a sole custodian needs a recovery path held by someone else.
11. **The test collective's way to rotate** is its threshold, any two of three, below the member count (rule 36's first way). It names no separate recovery path (escrow or custodian), though the roadmap lists one; adding an escrowed share would make the dealing three of four, so that a voluntary departure needs either the departing member's share or the abandonment authority. *Say if you want one.*
12. **The grammar lists every publication** of the collective (Envelopes type 0) as needing two members' signatures, not only manifests: a grammar names act types, and a manifest is a publication. The collective publishes nothing else.
13. **The signing key's holder** is the first member. At a member change it stays with that member if they stay, else passes to the first member of the new list.
14. **Chains carried along.** The collective and every member who signs put their identity-chain acts on the relays they publish on, so a reader who knows only a relay finds the homes.
15. **Files as media objects,** one per file; a file unchanged since the previous release is the same object (same locked bytes, nonce and key), which is not key reuse (Envelopes rule 9 forbids one key for two objects). An allowlist relay (the onion home) keeps only the manifest, which a publication names; files go to open relays.
16. **Dependencies** are read from `Cargo.lock` (crates from a registry, with their SHA-256) and every `package-lock.json` (packages with their integrity string). Crates of this repository are not dependencies.
17. **What a member checks before signing:** the release's files against their hashes, and, with `--against`, against the member's own checkout. The program refuses to sign if anything differs.

## Agreements draft 7 (1 October 2026)

The readings above were taken under Agreements draft 6. Under draft 7, the texts now settle readings 2, 5, 6, 7, 8 and 12: the release rule is an area of the agreement (its holders, its number, its id 1), not a list in the key grammar; a rotation's Agreements declaration names the clone and the signature acts that complete it (Flaw M); the agreement in force is the one declared or recorded since, judged on the collective's own sequence (F109); a member's signature counts while their voice remains there; a clone is complete when its mark names exactly the powers its changes need, met as Agreements count them (F104). Founding still needs every founder (Q11), and member changes need, by default, every member whose voice remains (F103), no longer a majority: a member who leaves resigns first, alone. The test collective founded under draft 6 on the deployed homes uses draft 6 formats and is no longer read by this client (see the report of the rework).

## Not yet

- **The live run** on the three deployed homes: the steps above, by Nobody, allegedly (see the roadmap).
- **An escrowed recovery share** (reading 11), and the abandonment declaration, liveness and contest acts: formats still to come (step 16; Agreements draft 7 leaves the declaration's format open).
- **The safety key's shares on offline devices,** one per member, with the air-gapped Module (`mor-signer`), for the real collective at step 17.
