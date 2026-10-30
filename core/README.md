# mor-core

The MOR core library, in Rust. Part 1, roadmap step 2; part 2, roadmap step 3.

## In plain words

Every act in MOR is built from a few small pieces. This library makes those pieces, and checks them strictly, so that two programs given the same act always reach the same answer:

- **One way to write data (deterministic CBOR).** Any value has exactly one correct byte form. The library writes that form, and refuses any other, even if it means the same thing.
- **Labelled fingerprints (tagged hashes).** Each kind of fingerprint carries its own label (`MOR/act`, `MOR/inside`, and so on), so one kind can never be passed off as another.
- **The act.** A small outside that relays can read, and a locked inside. The library locks an inside, builds the outside that vouches for it, computes the act's id, and opens an act again, checking that what opens is exactly what was vouched for.
- **Canonical text.** The rules every piece of text in an act must meet, including the Unicode 17.0 normalization check the Text MIR pins.
- **Running summaries.** A short fingerprint of everything a person has signed so far in one line of acts, so it is cheap to prove that one act led to another.

Part 2 adds the signatures and the identity rules:

- **Signatures.** Everyday acts are signed with a Schnorr key (the kind Bitcoin uses). Rotations are signed with a post-quantum chain key (SLH-DSA), committed in advance by its hash, revealed and used once.
- **Which rotation counts.** Given the acts a verifier holds, the library decides, position by position, which act of an identity chain counts: from the homes' receipts under the owner's home rule, a self-hosted home's own word, or a homeless rotation (closure, auditors' absence statements, the reader's own failed attempt, or an escape with both keys). A home caught receipting two genuine rotations at one position counts for nothing there, and is proven dishonest only at that position, never backwards.
- **What a rotation keeps.** Every other act gets a standing: valid, pending, void, or disputed (voided, but someone else acknowledged it or a keeper recorded it). A rotation keeps the whole line behind each tip it names, which anyone can check from the running summary alone, even when the tip is private.

## Precisely

| Module | What | Where it is defined |
| --- | --- | --- |
| `cbor` | RFC 8949 §4.2.1 core deterministic encoding. The decoder rejects non-shortest arguments, indefinite lengths, unsorted or duplicate map keys, non-preferred floats (NaN included), invalid UTF-8, nesting deeper than 128 levels, malformed input and trailing bytes; a final round-trip check backs this up. | Identity, "Encoding"; Envelopes rule 1a |
| `hash` | SHA-256; `tagged_hash(tag, x) = SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ x)`; work hash, spec hash. | Identity, "Hashes"; Envelopes, "Media"; Development |
| `act` | `Outside`, `Inside`, `Act` in the exact CDDL shape (an unknown key is invalid); act id `tagged_hash("MOR/act", outside)`; inside commitment `tagged_hash("MOR/inside", inside)`; `seal` and `open`; `Sequence`, which checks `prev`, position and running summary. | Envelopes, "The act", "Sequences", validity rules 1–5 |
| `lock` | XChaCha20-Poly1305, 32-byte key, 24-byte nonce, no associated data; locked bytes are ciphertext ‖ 16-byte tag. | Envelopes, "How it fits together" |
| `text` | Canonical text rules 1–6; rule 6 by full comparison with NFC under Unicode 17.0 tables (`unicode-normalization` pinned to `=0.1.25`, checked at compile time). `check_value` checks every text string in a decoded value, map keys included. | Text, "Canonical text", validity rules 1–2 |
| `mmr` | The running summary: a Merkle mountain range over act ids, leaves `MOR/mmr-leaf`, nodes `MOR/mmr-node`, peaks bagged right to left; empty summary 32 zero bytes. | Envelopes, "Sequences" |
| `sig` | Scheme 1, Schnorr BIP-340 over the 32-byte act id (`k256`); schemes 2 and 3, SLH-DSA-SHA2-128s and 128f, pure FIPS 205 signing with context `MOR` (`fips205`, pinned `=0.4.1`); a scheme named by spec hash is unknown, never valid. Chain-key commitment `tagged_hash("MOR/safety", scheme ‖ key)`. Signing from caller-given seeds and randomness. | Identity, "Signature schemes" |
| `merkle` | A home's receipt log: RFC 9162 §2.1 tree over receipt act ids, inclusion and consistency proofs. | Identity, "Log summary" |
| `identity` | Every Identity payload (types 0, 1, 2, 9, 10, 12, 13, 14; 3 to 8 recognised), closed maps, encoding and decoding; genesis checks 1–5; rotation checks 1, 4, 5; home rules and the default of rule 5, homes counted per operator; the chain state a rotation leaves (keys, homes, rule, audit, declarations, succession). | Identity, "Act formats", "Verification procedures" |
| `xwing` | X-Wing (F98): draft-connolly-cfrg-xwing-kem-11, ML-KEM-768 through `fips203` (pinned `=0.4.3`), X25519 through `x25519-dalek` (pinned `=2.0.1`, with `curve25519-dalek` 4.1.3 or later), SHAKE256 and SHA3-256 through `sha3`. Key generation from the 32-byte private key, encapsulation from the caller's 64-byte `eseed`, decapsulation. | Envelopes, "Encryption keys and key delivery" |
| `envelopes` | Encryption keys (type 4) and `enc-key`, founding scheme 4; key deliveries (type 1); sealed containers, sealed to identities or a bare key and opened (F99); routes payloads (Identity type 3) and the inbox they name; which act of a versioned chain (routes, encryption keys) counts. | Envelopes, "Encryption keys and key delivery", "Sealed containers"; Identity, "Routes" |
| `agreements` | Agreements draft 6's first exact formats (roadmap step 5a): terms, closed and strict, with the key grammar (listed act types with their rule, recovery paths), the abandonment clause and succession plans; fields whose formats are still open refused as unsupported; signature acts; clones. `Terms::check`: rules fit the parties, one cMIP per task, and a grammar leaves a way to rotate that survives the loss of any one key holder (F96). `AgreementsView`: whether an agreement exists (signing rule; a clone by the parent's clone rule), which agreement an identity declares in force at a chain act, and `consent`: the visible member signatures an act of a collective needs, judged under the agreement its chain declared at the act's binding, each declared agreement a complete clone of the one before (F100). | Agreements, "Act formats", rules 1, 5, 36, 37, 45 |
| `chain` | `Verifier`: holds acts, inclusion proofs, the operators the reader failed to reach, and keeper records; resolves identity chains ("Which rotation counts", receipt checks 1–6, conflicts, dishonesty by position, audits, homeless procedure, escape, finality, operator loops on own signatures) and gives every act its status (everyday checks, validity rules 15–17, F88). | Identity, "Verification procedures", "Validity rules" |

The library never draws randomness itself. Content keys, nonces and salts are given by the caller, so test vectors can be reproduced; a client must draw them fresh for every object (Envelopes rule 9).

It builds to WebAssembly (`cargo build -p mor-core --target wasm32-unknown-unknown`) for the TypeScript clients. The JavaScript bindings are the crate `mor-wasm` (`wasm/`), made with the genesis client (roadmap step 5).

The Identity MIR's spec hash (`IDENTITY`) is fixed only at the freeze, so the `Verifier` takes it as a parameter; the tests use a fixed test value.

## Tests and published vectors

```
cargo test                                         # everything below
cargo run -p mor-core --example gen_vectors        # regenerate vectors/ (the output is identical)
python3 core/vectors/check.py                      # a second, independent implementation
```

- `vectors/`: the published test vectors, including the three-act running summary (F78). See `vectors/README.md`.
- `tests/vectors.rs`: the library against every value in the published vectors.
- `vectors/check.py`: an independent implementation in Python, written from the MIR texts and sharing no code with this library, checks the same vectors (freeze test suite, scenario 8.5: two clients compute the same running summary). It needs `cryptography` and `unicodedata2==17.0.0`.
- `tests/unicode.rs`: rule 6 against Unicode's own conformance file for the pinned version, `tests/data/NormalizationTest-17.0.0.txt` (© Unicode, Inc., distributed under the Unicode License v3), and every code point not listed in it.
- `tests/act.rs`: act shape, opening, private acts, and every way an act can break its place in a sequence.
- `tests/signatures.rs`: Schnorr against BIP-340's own vectors 0 to 14. SLH-DSA, both variants, against a second, independent implementation (RustCrypto's `slh-dsa`, a dev-dependency): the same seeds give the same keys, the same act id gives byte-identical signatures, deterministic and hedged, and both reject every broken signature, key and context.
- `tests/xwing.rs`: X-Wing against the draft's own three test vectors (`tests/data/xwing-draft-11.json`, from the draft's repository at tag `draft-connolly-cfrg-xwing-kem-11`), and every key exchange against a second, independent implementation (`tests/xwing2/`: libcrux's formally verified ML-KEM-768, X25519 and SHA-3, with the draft's construction written again): same keys, same ciphertexts, same secrets, and only the right key recovers the secret.
- `tests/envelopes.rs`: encryption-key, routes and key-delivery formats, strict; which version counts; sealed containers to one identity, to several, and to a bare key; tampering (re-addressed, flipped, re-signed); a key delivery that opens the act it names; going public by a public key delivery. Every X-Wing exchange a container makes or opens is re-made by libcrux.
- `tests/agreements.rs`: Agreements draft 6: terms round-trip and strict decoding, open fields refused; rules fitting the parties; F96's grammars (two of three; every member without and with an escrowed share; a sole holder without and with a successor; a sole custodian); the abandonment clause and succession plans; a collective on hand-made chains: a founding agreement not complete backs nothing; a publication counting with two members' signatures, never with a stranger's or a malformed signature; a member leaving and another joining by clone and rotation, the old release standing, the former member no longer counting, the old key's later act void; a declared agreement that is an incomplete clone, or no clone, refused.
- `tests/chain.rs`: hand-made identity chains (37 tests) and the answers the Identity MIR requires: genesis checks; pending until receipted; majority, authoritative and default rules, per operator; self-hosting and its cost; routine rotation keeping years of posts behind a private tip; disowned and excluded acts void unless acknowledged or recorded; the thief at the lax home (5.7); forged receipts, stolen operator keys, audits and dishonesty by position (5.7b, 5.7d); closure, absence statements, objections, escape, finality and the censored reader (5.7c); operator loops; an unknown signing-key scheme (8.4); succession and declarations; the same act fetched from several homes, held once. Every SLH-DSA signature that enters a verifier in these tests is also checked by the second implementation (`tests/common/mod.rs`), and the two must agree.

SLH-DSA is slow unoptimised, so the workspace builds the cryptography crates optimised even in tests (`Cargo.toml`, `[profile.dev.package.*]`); `tests/signatures.rs` still takes about a minute, mostly SHA2-128s signing.

## Readings the drafts left open, now decided

Building this exposed three places where the drafts did not fix the bytes, or where verifiers could disagree. Nobody, allegedly decided each, and each is written into Envelopes draft 5.

1. **Bagging the running summary (F89).** Start from the rightmost peak, and hash each peak to its left as `node(peak, bagged so far)`, so left stays left. A single peak is its own root, with no extra hashing.
2. **No associated data in the lock (F90).** The outside already commits to both the locked bytes and the unlocked inside.
3. **Nesting depth (F91).** No data item is nested more than 128 levels below the outermost one, in an act or in an inside; deeper is invalid for every verifier. An application that needs deeper data carries it in a byte string or a media object.

Also noted for the freeze, with no change now: an act's payload is `{ * any => any }`, so floats, tags and simple values are allowed wherever a type does not restrict them. The library handles them exactly as RFC 8949 §4.2.1 says, but they are extra surface on which implementations can disagree (NaN payloads, what a tag means). Whether the frozen core should forbid them is for step 16.

## Part 2: decided while building (F92 to F95)

Building the identity checks as a function of the acts a verifier holds exposed one flaw and three open places. Nobody, allegedly decided each; each is written into Identity draft 9 (and core v15, freeze test suite v14, for F92 and F93).

1. **F92, finality.** A rotation that counts under the old home rule beats a homeless rotation at the same position, even once the next rotation has made it final. Otherwise a used chain key found on an old backup, after the home closed, rewrote every rotation since (run as a test).
2. **F93, absence.** Absence statements, and whether a reader's own failed attempt counts, are judged by the audit requirement in force before the homeless rotation, never the one it declares.
3. **F94, home rules.** A home rule a rotation leaves in place must fit the new homes, or the rotation is invalid.
4. **F95, receipt check 6.** A voided receipt someone acknowledged is shown as contesting its position, and blocks nothing.

## Part 2: readings, confirmed

Where the drafts are silent and the answer seemed forced, the library takes the reading below. Nobody, allegedly confirmed all ten (28 September 2026); none changes a MIR text yet.

1. **"Names X in `objects`."** An objection, absence statement or escape endorsement names the homeless rotation as `[identity hash, rotation]`: the chain is the identity chain, whose root act is the genesis. A cosignature is accepted with any chain whose predecessor is the log summary; which chain it should name (the summaries' own chain, rooted at the home's first summary) is left open.
2. **Self-hosted "serves".** A self-hosted home's "rotation it serves" is the rotation the verifier holds at that position; two held there are a conflict (rule 22a, "Which rotation counts" step 2). A verifier cannot tell served from held.
3. **"Cosigned" for receipt check 5 and conflicts.** A receipt is under a cosigned summary when it meets check 4: an inclusion proof under a summary of its home with at least the threshold of cosignatures from the auditors of the audit requirement that judges it. An identity with no audit requirement has no declared auditors, so nothing protects its receipts from the operator's rotation (Identity, "Protected history").
4. **Proven dishonest.** A home is proven dishonest at a position when two of its receipts there, for different genuine rotations, are each either under a cosigned summary or kept through a rotation of the operator. A conflict whose receipts are both still under the operator's current key is a standing conflict, not yet proof.
5. **Operators, summaries and cosignatures are not judged by later rotations.** A log summary or cosignature counts if its key is bound by a counting act of its signer; a later rotation of that signer does not void it, since the receipts under a cosigned summary must survive the operator's rotation (receipt check 5).
6. **Closure ends the receipts too.** A receipt signed under the key a closing rotation set, or a later one, counts for nothing (rule 8c: closure ends the role "for good").
7. **The reader's own failed attempt is per operator.** `failed_to_reach` names an operator, as homes are counted per operator.
8. **Two homeless rotations that could both count at one position** leave the identity contested there.
9. **An acknowledgement counts** when the acknowledging act is validly signed by another identity under a key a counting act of its signer bound; the acknowledging act's own standing after its signer's rotations is not judged in turn.
10. **Status of identity-chain acts.** A genesis or rotation is `Valid` when it counts, `Pending` when it waits at the next position, and `Invalid` otherwise, including a genuine rotation that lost.

## Fixed while building the relays (roadmap step 4)

The verifier indexed an act again each time it was given it. A reader fetches the same chain from every home, so it held the same rotation several times and saw one rotation as two rivals: the identity showed as contested. Now the same act is held once, and a copy with a valid signature replaces one without (a signature is not part of the act id, so copies of one act can differ only there). Test: `the_same_act_from_several_homes_is_one_act`. No MIR text changes.

## Decided while building the genesis client (roadmap step 5)

1. **F98, X-Wing.** The `xwing` module; ML-KEM-768 through `fips203`, X25519 through `x25519-dalek`, checked in every test against libcrux (Rust) and noble (TypeScript).
2. **F99, the key exchange lives in the sealed container** (decided by Nobody, allegedly). A key delivery that was itself a private act could never be opened: its own key would need another delivery. The `envelopes` module seals an act with its content key to each recipient; a key delivery's payload is the key itself. Envelopes draft 6, core v16.

## Agreements, decided while building the repo client (roadmap step 5a)

1. **F96, a key grammar survives the loss of any one key holder** (decided earlier, written in now): checked from the agreement alone.
2. **F100, a collective signs its own releases** (decided by Nobody, allegedly): an act of a collective of a type its grammar lists counts only with visible signatures of parties who signed the agreement in force, which is the one its own chain declared at the act's binding. The collective's rotation at a member change fences the old rules off. Agreements draft 6, freeze test suite v15.

The readings Agreements draft 6 takes where the texts were silent are listed in `clients/repo/README.md`.

## Aligned to the freeze-ready texts (S2)

The core follows Identity 15, Text 11, Envelopes 11, Money 11, Agreements 17 and Development 11 where they had moved past it (`docs/s2-report.md`):

1. **Keeper records read from the acts held** (Agreements, "Keeper record (type 2)", rules 37 to 42): type 2 decoded strictly (`KeeperRecord`), a keeper's sequence built from its records' `prev` (`AgreementsView::keeper_sequence`), one record before another only in its ancestry, a record counting only alongside its act and its signer. A log the caller states (`keeper_logs`) still counts, as one more sequence.
2. **"Belongs to" and the keepers of the version in force** (`belongs_to`, `keepers_version`, `keepers_for`), and the acts a rotation voids that such keepers recorded first (`keeper_disputed_acts`, to state to Identity with `Verifier::keeper_recorded`).
3. **Deadlines** (rule 33, `AgreementsView::deadline`): met by an anchor of the act, or by keepers' records before records anchored by the point; missed only by keepers' sequences anchored past it, under the keepers' rule; otherwise undetermined.
4. **An act a revocation does not hold** (rule 76): `Backing::Disputed` where another identity, never the grantee, acknowledged it or a keeper recorded it before the revocation; conferring nothing unless the grantor adopts it.
5. **A member key's text** (Text rule 14): its one object `[collective, version]`; the version stands as the decision it acts under (Agreements rule 58).
6. **A payment cMIP told from bytes** (Development, "A rail Module's kind and binding"): `Spec::decode_judged`, `Spec::is_payment_cmip`; `Known::payment_cmip` still works.
7. **A MIR's spec hash from its file** (Development rule 26): `Spec::frozen_text`, `Spec::file_content`, `Spec::mir_file_hash` (one final line break removed, nothing else); `mirFileHash` in the WebAssembly bindings. `Spec::draft_without_status_line` is a tool's option for showing what a draft would hash to at the freeze, never on a verdict's path.

## What changed since the previous edition

The bake-to-publication texts (S7h; MICS v30, Identity 15, Text 11, Envelopes 11, Money 11, Agreements 17, Development 11, as rewritten then), as far as this edition of the core goes:

1. **Six layers** (`agreements::layers`): `IDENTITY` 0, `TEXT` 1, `ENVELOPES` 2, `MONEY` 3, `AGREEMENTS` 4, `DEVELOPMENT` 5; `ENVELOPES_AND_TEXT` is gone. `Mirs::layer` tells Text from Envelopes; `task_layer` puts task 4 in Text and tasks 5 and 11 in Envelopes, as Development's task table writes them; a specification's field 10 accepts 0 to 4.
2. **The bake** (`envelopes::types::BAKE`, Envelopes type 0): fields 7 and 8 are refused, a bake carrying either invalid. **Withdrawal retired** (`RETIRED_WITHDRAWAL`, type 3): an act of type 3 is invalid; the withdrawal's authority check is gone from the verifier.
3. **The price tag** (`money::types::PRICE_TAG`, Money type 5; `PriceTag`, `Priced`): exactly one of a bake and a publication, versioned (version 1 with no predecessor, then one more, naming `[first, previous]` first in `objects`, by the same signer, pricing the same thing), public, a version with no price withdrawing it (`PriceTag::withdrawn`). `Verifier::price_tag` says whose offer it is as Money and Envelopes can tell: on a bare bake only its uploader's counts (`TagCount::Counts`), another's is nobody's (`TagCount::Nobodys`), and a tag under a publication is unknown here, Agreements' to judge.
4. **The claim** (`agreements::types::CLAIM`, Agreements type 3), named as the texts name it.

Then the rest of the redesign (S7h-2), with the decisions on Q2, Q3, Q4, Q14 and Q24:

5. **The publication** (`agreements::types::PUBLICATION`, Agreements type 6; `Publication`, `Sold`, `Partner`): what is sold, the ownership agreement it reads by reference (field 1), its partners, its split service and split plan; it counts when every party signed it, and a later version selling nothing ends it. Terms fields 8, 14, 28 and 29 and the standing offer are gone; a split names the publication it pays under (field 3), its owners' line paid by the ownership agreement in force (payout key 2), each partner apart (key 8). A publication with no field 0 is a split agreement.
6. **The ownership agreement**: terms with a target (field 33: `Target::Claim` or `Target::Collective`) and one stake on it; terms with no target carry no stake. **Shares by reference**: a receipt's or claim's field 9 is `[agreement, version]`, the version in force the latest complete one on that line its history holds; a version on no line, or on a fork's branch not its reference, makes a wrong receipt.
7. **Purchases by price tag**: a payment naming the publication's price tag (Money field 5) is a purchase under it, its commitment on the request rail, its settlement on the push rail; a payment racing an ending is owed back by the split service from what it holds, then by each party in its share (`owed_back_by`); a payment naming the bake alone is a tip to its uploader. `Verifier::bake_uploader` answers unknown for a bake naming a collective, which Money alone cannot tell (Q13).
8. **The keyless collective**: field 19 a rule per layer, 1 to 5 (`Terms::layers`, `Power::Layer`), field 34 finer areas reaching kinds of act by type; an act for a collective names it as chain in its objects and is signed by a member or grantee with their own key; its history follows those objects; records are drawn by any member, a record putting a membership clone in force, a rotation needed only where the key grammar changes or a key or share holder leaves (Q4); a collective's grant carries no key; a closing's "holds nothing" applies the complete transfers its history cites (Q24); an ending's line is what it cites.
9. **The keyless genesis and rotation** (Identity rule 1, rotation check 4): `Genesis::signing_key`, `Rotation::signing_key` and `ChainState::signing_key` are `Option`; a collective's genesis is signed by its first chain key, revealed in its signature, and declares its founding agreement; its rotations carry no signing key and keep no tip; an everyday act its own identity signs is invalid. A collective's homeless rotation signed with its chain key is its own escape endorsement, an old home's objection voiding nothing (Q14).

S7h-3 wrote the decisions on S7h-2's questions into the texts, and changed nothing in this library: the core already read them so. Three verdict vectors show them (`core/vectors/README.md`); the second verifier's export follows the keyless collective.

S7h-4 brought the core to the texts where they were clear and it lagged: a sale before a price tag's withdrawal is settled as a push rail settles an ending (`tag_withdrawals`; Agreements rule 12); one valid objection from a live home voids a person's homeless rotation (`Status::Void`; Identity rule 49); a plan-marked clone passes the party's stakes to its stake successors, and changes a layer's rule only by putting the seat successor in the party's place (`plan_stakes`, `plan_layers`; rules 64 and 83); `after_closing` reads the collective an act names; rule 93 for publications; rule 48 and the owners' matters on a collective's split agreement (`owners_consent_problem`, `successor_split_pays_less`; rules 15, 48, 94, 95, 97); the 17 skipped tests restored.
