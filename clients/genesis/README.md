# mor-genesis

The genesis client, in TypeScript, with the core library through WebAssembly. Roadmap step 5.

**Test identities only.** A test identity holds its safety key in software, in its file: a prototype, labelled as such in the file itself. The real identity is created only with the air-gapped safety key Module, at the first acts (roadmap step 17).

## In plain words

An identity in MOR starts with a genesis: a signed statement of its first everyday key, a fingerprint of its safety key (kept back, for emergencies), and the homes where anyone can check it. This program makes one, sends it to each home, and collects each home's signed receipt. After that it can:

- **Say where to find you (routes).** Where your posts are, and your inbox, where others deliver things for you.
- **Publish an encryption key.** A public key others use to send you things only you can open. It is X-Wing: two locks in one, one that a future quantum computer cannot pick (ML-KEM-768) and one that has been trusted for years (X25519). What is locked stays locked if either holds.
- **Rotate.** Replace your everyday key using the safety key. The rotation counts once the homes your rule names have signed receipts for it: by default a majority of homes, counted per operator. Until then it is pending, and the program keeps the exact same bytes to send again, never a second rotation.
- **Deliver a key.** To give someone the key to something private, the program puts a small signed note, "the key of act X is K", inside a sealed container locked to their encryption key, and drops it in their inbox. The relay sees whom it is for, never who sent it or what it is. A key can also go to a one-off "bare" key someone handed out, found again by a tag (for an anonymous buyer).
- **Look anyone up** as any reader would: fetch the chain and receipts from every home, and let the core library decide which rotation counts. Nothing a relay says unsigned is trusted.

## Precisely

| File | What |
| --- | --- |
| `src/core.ts` | Loads the core library's WebAssembly (`wasm/`, crate `mor-wasm`); the test spec hashes. |
| `src/transport.ts` | The relay transport cMIP: `info`, publishing acts and sealed containers, fetching, the feed, identity records. Recomputes the id of everything fetched. |
| `src/identity.ts` | The test identity file; genesis, routes (Identity type 3), encryption key (Envelope type 4), rotation (prepare, save, submit, settle), bringing homes up to date, key delivery to an identity or a bare key, reading an inbox, and looking an identity up (`lookUp`). |
| `src/kex.ts` | Records every X-Wing exchange (public key, eseed, ciphertext; for opening, the private key used), so the tests can re-make each one with a second implementation. |
| `src/cli.ts` | The command line (`npm run cli -- help`). |

What the core library does, through `mor-wasm` (`wasm/src/lib.rs`): deterministic CBOR both ways, act making and describing, genesis and rotation (checked by the core's own genesis and rotation checks before they are returned), everyday acts with position and running summary, the routes, encryption-key and key-delivery payloads, X-Wing, sealing and opening containers, and the `Verifier` (which rotation counts, the standing of any act, and which routes and encryption-key act counts).

## Tests

```
npm install
npm run wasm        # builds mor-wasm and its JavaScript glue into wasm/
npm test            # starts real homes and a relay from target/debug/mor-relay (built if needed)
```

- `test/genesis.test.ts`, the step's "done when", against three homes under three test operators and an open relay, run from the relay program of step 4 on local ports: a test identity is born and each home signs a receipt; each home serves the chain, receipts, routes and encryption key; it rotates, pending until the homes hold it, then counting by majority; with one home off, two of three still make a rotation count, and the home is brought up to date when it comes back; with two homes off, the rotation stays pending, while a reader reaching the one home left still counts the earlier rotations from the other homes' receipts it serves, and the rotation counts once resent unchanged; a key delivered to an identity opens only with its key (not another identity's, not the sender's), and the relay never sees the sender; after a new encryption key, new deliveries use it and old ones still open; a key delivered to a bare key, found by pickup tag and by scanning, opens only with that key. Last, **every X-Wing exchange made or opened in these tests is re-made by noble** (`@noble/post-quantum`, X-Wing on noble's own ML-KEM and X25519), and the two agree.
- `test/xwing.test.ts`: the core library's X-Wing against noble, on the draft's three test vectors and on fresh keys.
- `test/cli.test.ts`: the command line as a user drives it; and an operator identity made by this client running a home (`export-operator`, then `mor-relay init --operator-key`), its safety key never on the server.

## Running it against the three deployed homes

*The build window cannot reach the public homes (its network policy refuses them), so this is run by Nobody, allegedly, on the machine that runs the onion home.*

```
cd clients/genesis && npm install && npm run wasm
alias mg='npm run -s cli --'
```

1. **An identity on the three homes**, majority of three operators by default. The onion home is reached through its local port on this machine (`--via`); the address written into the genesis stays the onion one.
   ```
   mg new --file ~/mor-test/a.json \
     --home https://home1.dubsar.org --home https://home2.dubsar.org --home http://ONION.onion \
     --via http://ONION.onion=http://127.0.0.1:8080
   ```
   The onion home keeps only listed identities: its answer is "refused (5)" until it is told to serve the new identity. Then send the genesis again (the same bytes):
   ```
   mor-relay allow --dir ~/mor-home IDENTITY
   mg spread --file ~/mor-test/a.json --via http://ONION.onion=http://127.0.0.1:8080
   ```
2. **Routes and an encryption key** (an inbox on one of the open homes):
   ```
   mg routes --file ~/mor-test/a.json --outbox https://home1.dubsar.org --inbox https://home1.dubsar.org --via …
   mg enckey --file ~/mor-test/a.json --via …
   ```
3. **Rotate**, then look it up from outside, as a reader: `mg rotate --file ~/mor-test/a.json --via …`, then `mg check IDENTITY --at https://home2.dubsar.org`.

Keep `~/mor-test/*.json` secret: each holds every key of its test identity.

## Readings, for Nobody, allegedly, to confirm

Where the texts are silent, the program takes the reading below.

1. **X-Wing's number.** Encryption keys share Identity's scheme number space, and X-Wing is founding number 4, defined by Envelope; 1 to 3 stay signature schemes and are refused as encryption keys. Identity's `scheme` for signing keys is unchanged. The pickup tag of a bare X-Wing key is therefore `tagged_hash("MOR/transport/pickup", 0x04 ‖ key)`.
2. **Media in a key delivery** is named by its publication's act id, with field 2 set (`true`); an act's own key is named by the act's id.
3. **The sealed container's details** (Envelope draft 6): one capsule per recipient in `to`, a bare key always alone; the container key wrapped under `tagged_hash("MOR/sealed/wrap", shared secret)` with a zero nonce; the one-time key is a Schnorr key signing `tagged_hash("MOR/sealed", [to, one-time-key, locked-act])`.
4. **The encryption-key act** is an everyday act of the owner, public, in the owner's sequence, and is sent to every home, like the routes.
5. **Which routes or encryption key counts:** only acts the core library judges valid take part (a disputed act never counts, Identity), followed from version 1; a fork leaves the last act before it, shown as contested.
6. **Old encryption keys are kept** in the identity file, so deliveries made to an earlier key still open.
7. **The owner's client brings the homes up to date** after a rotation counts: every chain act a home missed (the same bytes), every receipt the other homes signed (cMIP, identity record part 8), and the chain acts of the homes' operators, which any relay may carry as ordinary acts. A reader who cannot reach an operator's own home looks for the operator's chain at the other homes. *Cost, stated:* a copy found elsewhere may be out of date; if the operator rotated after a theft of its everyday key and the reader cannot reach the operator's homes, the reader may count a receipt the operator's rotation voided. A reader that can reach the operator's own homes always prefers them.
8. **The test identity file** is JSON, every key in the clear, readable by its owner only, labelled in its first line. A rotation is saved as pending before it is sent, so a retry sends the same bytes (Identity rule 8a); the program refuses to sign a second one while one is pending.
9. **Randomness** is drawn from the platform (`crypto.getRandomValues`); SLH-DSA signatures are hedged, as the air-gapped Module signs.
10. **One sequence per identity file.** Key deliveries are everyday acts in it, private, so a rotation's kept tip may be a private act; the running summary proves its line without opening it (Envelope).

## Not yet

- **The three deployed homes:** the steps above, run by Nobody, allegedly (see the roadmap).
- **A genesis from the air-gapped Module's commitment export**, and the phone app with a camera the Module's README placed with this step. Test identities keep their safety key in software; the real identity needs both at step 17.
- **A browser build.** The library code has no Node-only logic beyond loading the WebAssembly file and the file system; the web reader (step 10) loads it the browser's way.
- **Homeless rotation, escape, closure** from the client: the identity gauntlet (step 7) drives them.
