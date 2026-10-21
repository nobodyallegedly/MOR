# Module: Dubsar Air-Gapped Chain-Key Signer (pending rotation and air-gapped chain keys)

*Draft 6, 21 October 2026, a Dubsar Suite session (`docs/texts-r0-report.md`), for Nobody, allegedly, to approve. Draft 5 as below, with three changes, each marked "new in draft 6". **A fresh seed at every change of keys, as the rule** (rule 3.3): decided by Nobody, allegedly, 21 October 2026 (F361): "No, it does not stay the same. Unsure why sessions believe so. A rotation generates two new sets of keys, chain and signing." Deriving the next key from the current seed stays only as an exception the owner chooses on the device, never offered by default, with its cost stated. **The new chain-key seed confirmed before the rotation is signed, the new signing seed after** (rules 3.3 and 3.7): decided by Nobody, allegedly, the same day (F362): "From a safety point of view, confirming the new chain key comes before signing the rotation, confirming the new signing key can come after." **The key index across a fresh seed** (section 2): key *n* of the seed drawn for the rotation at position *n*, as Kišib builds it (F362). Named with the house prefix "Dubsar" (F356). Not core: the Identity MIR commits only the hash of the next chain key; where it comes from is this Module's (F361, judged by the MOR lead). The code, `modules/airgap/`, still implements draft 5's rule 3.3 (a fresh seed as the user's choice; the backup notice shown in the summary, not confirmed before signing): draft 6's default and its confirmation are to build there (section 7). Kišib, which signs rotations from paper without this Module's messages, already follows draft 6 (`clients/kishib`, pull request 81). Draft 5's own header follows.*

*Draft 5, 15 October 2026, written by the build of the step 15 decisions (`docs/code-after-step-15-part-1.md`), for Nobody, allegedly, to approve. Draft 4 as below, with Identity draft 13's rule 29 written in: the escape out of a position contested at a self-hosted home (F299; Agreements round 2, Q7, taken) and the second signature after a rotation that failed the rotation checks (Fable's I5; F328, Q3, taken by the project lead under the working practice), each opened by the device only on bytes it checks itself, never on the online side's word. The pending rotation gains two optional fields, 6 and 7 (section 2.2); rule 3.4 gains the two exceptions; section 7 their tests. Each change is marked "new in draft 5". The code is `modules/airgap/` (`device.rs`, `msg.rs`, `online.rs`, `tests/rule_29.rs`). Draft 4's own header follows.*


*Draft 4, 28 September 2026. Companion to the Identity MIR draft 9. Not core: a founding Module (confirmed by Nobody, allegedly), so that any signing device can support MOR chain keys. Draft 4 is draft 3 as built (roadmap step 6, `modules/airgap/`): seeds are defined by seed Modules, two of them founding (words and hex); the key index is the key's number in the identity's life; a key fingerprint both screens show alike; what "the same rotation" means for rule 3.4; clean-device mode chosen on the device; the share message and Pedersen dealing for collectives, with the promise of section 5 corrected (F97); the transports' exact types and limits; the tests marked run or not run. Draft 3 folded in the review notes N1 to N5 of draft 2 and applied review round 2.*

## 1. Purpose

The Identity MIR keeps the chain key offline and uses it only to sign rotations. In practice that means two devices:

- an **online device** (everyday phone or computer), holding the signing key, publishing and talking to homes;
- an **offline device** (an old phone kept in flight mode, a laptop never connected, or later a dedicated hardware signer), holding the chain-key seed and nothing else.

This note defines how the two exchange what they need, so that any client and any signing device can work together without knowing each other. It follows the lesson of Bitcoin's PSBT (partially signed Bitcoin transaction): one standard container for "waiting to be signed" made air-gapped signing routine, and let any wallet work with any signer.

## 2. Messages

Four messages cross the air gap. Each is one CBOR map with small integer keys, in deterministic encoding (Identity, "Encoding"), key 0 giving its kind. Every text string is canonical text. A map carries only the keys its kind defines.

**Key index.** A chain key's index is its number in the identity's life: 0 for the key genesis commits, n for the key the rotation at position n commits, whichever seed it comes from. The rotation at position n is therefore signed with key n − 1. *The online device always knows it, so the offline device never has to tell it, even across a fresh seed.*

**New in draft 6: the index across a fresh seed.** A fresh seed drawn for the rotation at position n gives that rotation's commitment the seed's key n, never its key 0: the index counts the identity's keys, not the seed's. Under the rule of 3.3 each seed therefore gives one key that counts: key 0 of the seed made at genesis, and key n of the seed drawn for the rotation at position n, which signs the rotation at position n + 1 and is then spent. Its keys below n are never used. *So a device holding several seeds of one identity, or restored from a backup, finds the key to use by deriving, from each seed it holds, the key at the index the pending rotation gives (field 3), and matching its commitment (rule 3.8): one derivation per seed, never a search. Built this way in Kišib, 21 October 2026 (F362), and in this Module's code, which already derives a fresh seed's first key at index n (`Signer::review`).*

### 2.1 Commitment export (offline to online, at genesis)

The offline device derives the first chain key from its seed and exports only its commitment:

```cddl
commitment-export = {
  0 => 0,              ; message kind
  1 => chain-key-commit,  ; [scheme, commit], as in the Identity MIR; scheme a founding number or a specification hash
  2 => uint            ; key index: 0 at genesis
}
```

The online device builds the genesis with this commitment, signs it with the signing key, and publishes it. The chain key itself never leaves the offline device.

### 2.2 Pending rotation (online to offline)

```cddl
pending-rotation = {
  0 => 1,              ; message kind
  1 => bstr,           ; the rotation's inside, encoded: spec, type 1 and payload, without the salt (inside key 10) and without the next chain-key commitment (payload key 3)
  2 => bstr,           ; the previous identity-chain act (genesis or last rotation), complete with its signature
  3 => uint,           ; key index of the chain key to use: the rotation's position minus one
  ? 4 => [+ bstr],     ; optional context for display (see rule 3.1: never trusted)
  ? 5 => bool,         ; whether the online device has prepared an escape endorsement for this rotation (N4)
  ? 6 => bstr,         ; new in draft 5 (F299): the competing rotation served at this position of a self-hosted identity, complete with its signature
  ? 7 => [+ bstr]      ; new in draft 5 (Fable's I5, F328 Q3): the identity chain from genesis to the rotation's predecessor, each act complete with its signature, in order
}
```

### 2.3 Signed rotation (offline to online)

```cddl
signed-rotation = {
  0 => 2,              ; message kind
  1 => bstr,           ; the complete rotation act: outside, locked inside and signature, built by the offline device
  ? 2 => bstr .size 32 ; clean-device mode (section 4): the new signing key's 32-byte Schnorr secret
}
```

The online device checks it before publishing (rule 3.9) and publishes it to the identity's homes.

**Building the act offline (N1).** A rotation is a public act in the everything-encrypted envelope: an outside, a locked inside and a signature. After inserting the next chain-key commitment (rule 3.3), the offline device builds the whole act itself: it adds the salt, locks the inside with a content key it generates, builds the outside (signer, inside commitment, locked hash, nonce, content key), computes the act id and signs it. Salt, nonce and content key come from the offline device's own randomness, and so does SLH-DSA's hedging value (FIPS 205, hedged signing).

### 2.4 Share (dealer to each holder of a collective's chain key)

```cddl
share = {
  0 => 3,              ; message kind
  1 => dealing,        ; the public part, the same for every holder
  2 => uint,           ; x: this share's number, 1 to n
  3 => bstr .size 32,  ; f(x): the share of the seed
  4 => bstr .size 32   ; g(x): the share of the blinding
}

dealing = [
  chain-key-commit,       ; the key the shares rebuild
  seed-module: hash,   ; the seed Module that derives it from the rebuilt seed
  index: uint,         ; its key index in the collective's life
  threshold: uint,     ; any k shares rebuild the seed
  holders: [+ holder], ; one per share, share x held by holders[x − 1]
  commitments: [+ bstr .size 33]   ; Pedersen commitments C0 … C(k−1), compressed secp256k1 points
]

holder = [ role: 0 / 1 / 2, identity: hash / null ]   ; 0 a member, 1 a custodian holding it under the collective's grant, 2 an escrow released by the abandonment authority
```

See section 5.

## 3. Rules for the signing device

**3.1 Never trust a summary you are handed.** The device builds its own plain summary from the exact bytes it will sign, and shows it before signing:

- the new signing key's fingerprint, and its scheme (a founding scheme, or a named specification);
- homes and home rule, if changed;
- the vault, if changed: every entry as unit, rail, limit, with "flow off" shown in words where a limit is zero, and any unit removed (named where the previous act declared the vault; otherwise the device says that any unit not listed is undeliverable, fail closed);
- audit requirement, if changed or removed;
- succession, if declared or ended;
- whether the rotation is homeless, and whether an escape endorsement is announced (N4);
- whether the rotation declares closure of the signer's home;
- how many sequences are kept, and how many acts are disowned. Disowning voids an act unless someone relied on it; the device says so. A rotation that keeps no sequence is shown prominently: every act under the old key becomes void unless relied on;
- where the next chain key comes from (new in draft 6): from a fresh seed, whose backup is confirmed before signing (rule 3.3), or, by the owner's exception, from the current seed, shown prominently with its cost;
- any declaration it cannot read, with its specification, kind and value.

Consequential fields (succession, homeless flag, closure, vault changes, home and audit changes, disowned acts, unreadable declarations, and a next key taken from the current seed) are shown prominently. Any context supplied by the online device is for convenience only, shown apart as unchecked, and never replaces what the device computes itself.

**Fingerprint.** A key's fingerprint is the first 16 bytes of `tagged_hash("MOR/module/airgap/fingerprint", scheme || key)`, with `scheme` as in the chain-key commitment (one byte, or the 32-byte specification hash), written as eight groups of four hexadecimal characters. The online device shows the same fingerprint for the key it put in, so the two can be compared (section 4).

**Nothing unseen.** The device signs a rotation whose inside holds only spec, type and payload; it refuses any other inside field, since it could not show it. *A rotation has no use for acknowledgements, references or a hint; a field the owner cannot see is a field a compromised online device could use.*

**3.2 Check the chain, and say what was not checked (N2).** The device verifies that the previous identity-chain act is a genesis or a rotation of the Identity MIR, public, in its shape, with a valid signature (for a genesis, by the key it declares), that the pending rotation names it and follows its position, and that the chain key it is about to use matches the commitment in that act. It refuses otherwise. After a genesis it holds the whole chain state, so it also runs rotation check 5 (F94). It cannot know, offline, whether that act counts under the home rule, since receipts live at the homes; that check stays with the online device, and the device's summary says so, with whatever else it did not check, so nobody believes the offline device verified more than it did.

**3.3 Supply the next commitment itself, from a fresh seed** (rewritten in draft 6). The device draws a **fresh seed at every rotation**, under a seed Module it implements (rule 3.8), and derives from it the next chain key, at the index the rotation commits (n + 1 after key n; section 2). *A rotation makes new keys, chain and signing (F361): whoever holds the current seed's backup, a thief who photographed it included, derives nothing that counts after the rotation.*

- **The backup first, then the signature.** Before it signs, the device shows the fresh seed's backup, as its seed Module writes it (24 words, or 72 hexadecimal characters), and says that this is the chain-key backup for the next change of keys, to be written down and kept apart from every device. It then hides it and asks part of it back, chosen by the device: three of the words, or three groups of four characters, by their place. **Only once they match does it sign the rotation.** A wrong answer is refused and asked again; nothing is signed. A review abandoned before then signs nothing: the device overwrites the fresh seed, and the next review draws another, so a backup written for a rotation never signed is worthless, and says nothing about the next one. *Confirming the new chain key comes before signing (F362): a rotation signed and published before its new backup was written would leave the identity with a chain key nobody holds, and with it every later change of keys. The new signing key's backup can come after (rule 3.7): if it is lost, the new chain key makes the next rotation.*
- **The earlier backup.** The device says that the earlier backup is spent once this rotation counts at the identity's homes, which the online device knows; until then it is kept, since the exceptions of rule 3.4 sign with it, and the same rotation is only re-exported. *The offline device cannot see the homes' receipts; it says what it cannot check (rule 3.2).*
- **The exception: the current seed** (new in draft 6). The device may instead derive the next key from the current seed, at the next index, only when the owner chooses it on the device, for this rotation, after reading its cost; it is never the default, never chosen by the online device, and never offered at the exceptions of rule 3.4 (an escape follows a theft) or for a collective (section 5 always deals a fresh seed). Its summary shows it prominently, with the cost: **whoever has seen or taken the current backup derives this next key and every later one, so a rotation made this way does not recover from a stolen backup**; it MUST NOT be chosen where the backup may have been exposed. *Cost, stated: the exception keeps one backup for the identity's whole life (a backup stamped in steel and kept in a safe, say), for rotations after a lost phone, where the paper was never exposed. Exposure is often unknown, which is why it is never the default.*

The device inserts the next commitment into the rotation before signing. The online device never chooses it: a next commitment the online device sends anyway is dropped, replaced by the device's own, and the summary warns that the online device misbehaved. Otherwise a compromised online device could slip in an attacker's commitment and take over the identity at the next rotation. The next commitment may name a different scheme than the current key, by specification hash: this is how a chain-key scheme is replaced one day.

**3.4 Remember what was signed.** The device stores, per chain key, each rotation it signed: the request it answered and the signed bytes. The request is `tagged_hash("MOR/module/airgap/request", inside || previous act id)`, over the inside as the online device sent it, without salt and next commitment. *The request, not the act id: the act id changes with the device's own salt and keys.*

- Asked again for the same request, it re-exports the same signed bytes, whatever the user chooses this time. This includes the same homeless rotation, asked again with an escape endorsement announced: the endorsement is a separate act, so the rotation needs no new signature. A clean-device signing key is not kept, so a re-export does not carry it.
- Asked to sign a different rotation with the same key, it refuses.
- The exceptions are the two allowed by the Identity MIR, each once: one normal rotation after a homeless rotation voided by an objection, and one endorsed homeless rotation (an escape) after a normal rotation the homes refused. The device recognises each from what it signed last with that key, names the earlier rotation (the escape endorsement must list it as abandoned), and must confirm either explicitly with the user.
- **New in draft 5 (F299; Agreements round 2, Q7):** the escape is also the way out of a position contested at a self-hosted home (Identity draft 13, rule 4 and rule 29's second exception). The device grants it there only on field 6, the competing rotation, which it checks itself, offline: an Identity rotation in its shape, its signature valid under the chain key it reveals, that key the one this device's key commits to (the same chain key), naming the same previous act and position as the rotation the device signed, and not a rotation the device signed. The escape endorsement must then list both rotations as abandoned, and the device says so. Where the identity's homes, as the device knows them (from the previous act, or from field 7), are all self-hosted, an escape asked for without field 6 is refused: a self-hosted home refuses nothing, and the online side's word alone opens nothing. A refusal by the homes that count (the first case) stays unprovable from bytes, and is told to the user as before. Allowed once, with the first case: one escape per key.
- **New in draft 5 (Fable's I5; F328, Q3):** a rotation that fails the rotation checks was never a rotation, so signing again with the same key is no second rotation (Identity draft 13, rule 29). The device accepts as showing it only field 7, the identity chain from genesis to the rotation's predecessor, whose last act must be the previous act given: it checks each act (its signature; each rotation following the act before it, signed with the chain key that act committed, and passing the rotation checks against the state before it), rebuilds the state, and runs the rotation checks on the rotation it signed. Only if that rotation fails them does it sign again, naming it, with the user's explicit confirmation. Given the chain and a rotation that passes, it refuses as before. With field 7 the device holds the whole state, so it also runs rotation check 5 (F94) on the new rotation, and its summary no longer lists it as not checked. *Whether each rotation of the chain counted at its homes cannot be checked offline (receipts live at the homes); a compromised online side cannot forge the chain's rotations, which the owner's chain keys signed.* *Cost, stated: a message is at most 256 KiB (rule 3.6), so field 7 carries at most about thirty rotations under SLH-DSA-128s and about fourteen under 128f; an identity with a longer chain cannot use this exception with this device, and leaves by the escape (the second exception) if it holds the signing key. A later draft can carry a proof of the state instead of the chain.* *A chain signature in the chain is not supported by this draft: the device refuses such a chain.*

This enforces rule 8a of the Identity MIR in the device itself; the MIR calls 8a a client and Module rule for exactly this reason. *SLH-DSA is stateless and is not weakened by a few signatures; the point is that an owner never has two competing rotations in play.* *Cost, stated: a device restored from its seed backup starts with no memory, so rule 3.4 holds per device, not across a loss. A backup of the memory would close the gap and is left to devices.*

**3.5 Sign only rotations.** The chain key signs nothing else. The device refuses any other kind of act, of any specification.

**3.6 Accept only data.** The device parses the expected message and nothing else. It never executes anything received, whether by QR code or by file. It refuses a message larger than 256 KiB before reading it further, and any message not in deterministic CBOR, not of the kind expected, or with a key its kind does not define.

**3.7 Back up both seeds, the chain-key seed first** (in order, new in draft 6). At genesis and at every rotation, two backups are made, in this order:

1. **The chain-key seed, on the offline device, before anything commits to it:** at genesis, before its commitment is exported (message 2.1); at a rotation, before the rotation is signed (rule 3.3). The device shows the backup, hides it, and asks part of it back; nothing is exported or signed until it matches. Under the exception of rule 3.3 there is no new chain-key backup: the device says that the current one now also holds the next key.
2. **The signing seed, on the online device, once the act that installs it counts:** after the genesis is accepted, or after the rotation's receipts are in from its homes; in clean-device mode (section 4), on the clean device the key is loaded onto. The online device shows it, hides it and asks part of it back, as above. *Its backup can come after the rotation (F362): a signing key whose backup is lost is replaced by the next rotation, from the new chain-key backup.*

The device tells the user both: the signing seed must be backed up too, because the escape from a hostile or device-bound home needs the current signing key, and a lost phone with no backup can mean a lost identity at such a home (Identity, rules 12 and 37). *The online device's half is a client's, not this device's: said here so that the two halves are made in this order everywhere this Module is used.*

**3.8 Seeds are defined by seed Modules.** How a chain-key seed is written down and how its keys are derived is defined by a seed Module, named by its specification hash. A device implements one or more; a backup says which it follows. Two are founding: **words** (24 words of BIP-39's English list, `module-chain-key-seed-words-draft-1.md`) and **hex** (72 hexadecimal characters, `module-chain-key-seed-hex-draft-1.md`). A device restored from a backup finds which key to use by deriving keys from its seeds and matching the commitment in the previous act; across fresh seeds (rule 3.3), the key at the index the pending rotation gives (section 2). **New in draft 6:** a backup the identity's rotations have since replaced gives no key the previous act commits to: the device says so, in plain words ("this backup gives no key this identity's last change of keys committed to: it may be an earlier, spent one"), and signs nothing. *Several seed Modules side by side is the market in miniature: a device that knows a Module restores its backups; one that does not, cannot, and says so.*

**3.9 The online device checks what comes back.** Before publishing a signed rotation, the online device checks that it is the rotation it asked for: same identity, same payload but for the next chain-key commitment (and, in clean-device mode, the new signing key, whose secret must come with it and match), a valid signature by the key the previous act committed to. A signed rotation that fails is not published. *This is what catches a swapped file or QR sequence: the transports carry checksums against accidents, not attacks.*

## 4. The honest gap

The new signing key is normally generated on the online device. If that device is compromised at rotation time, it can hand over an attacker's key, and the offline device cannot tell.

Mitigations:

- The offline screen shows the new signing key's fingerprint (rule 3.1), so the user can compare it with a second, trusted screen.
- **Clean-device mode (N3).** The offline device may instead generate the new signing key itself, put its public key into the rotation, and export the secret alongside the signed rotation (message 2.3, key 2), for loading onto a clean everyday device. The user chooses the mode on the offline device; the online device does not ask for it. This does not help if the rotation is loaded back onto a compromised device, but it makes "rotate onto a clean device" one guided flow. Offered as a mode, never required. The offline device does not keep the key.
- Best practice: generate the new signing key on a clean device, especially when rotating after a suspected compromise.

No container fixes a compromised machine on its own; this should be stated plainly to users.

## 5. Collectives: split chain keys

For a collective whose chain key is held as shares (Agreements, key grammar), the rotation device is the one that rebuilds the key from k shares, signs once and forgets it. *For that moment one device holds the whole key; that is the price (Agreements rule 36).* The same holds for the next key: the device that generates it sees it before dealing its shares. **Nothing can prove that a device forgot a key (F97).** What can be checked is that the shares were dealt honestly, so that no device ends up the only one able to rotate.

**5.1 Deal the next shares verifiably.** The device that generates the next chain key MUST deal its shares so that each member can check, alone, that their share is consistent with every other member's, and MUST have the shares checked against the committed key before the rotation that commits to it is relied on. *Otherwise a dealing device could commit to a key it keeps and hand the members shares of another seed, and only it could ever rotate the collective (F82, M23, F97).*

- **The seed** is dealt with Shamir's scheme over the secp256k1 group order, any k of n shares rebuilding it: the seed of a seed Module, read as a number, big-endian; a seed at or above the group order is never dealt (the dealer draws another).
- **Pedersen commitments.** The dealer draws a second, random polynomial g, and publishes in the dealing Cj = aj·G + bj·H for the coefficients aj of the seed's polynomial f and bj of g. G is the group's generator; H is the first x-coordinate `tagged_hash("MOR/module/airgap/pedersen-h", [i])`, for i = 0, 1, …, that is on the curve, with even y, so that nobody knows its logarithm. A holder checks f(x)·G + g(x)·H = Σ xʲ·Cj. *Pedersen commitments hide the seed perfectly, even from an attacker with unlimited computing power, a quantum computer included; binding them rests on the discrete logarithm, so a dealer with a quantum computer could deal inconsistent shares undetected. Feldman's scheme, which publishes f's coefficients times G, would expose the seed to a quantum computer, defeating a post-quantum chain key.*
- **One dealing for all.** Each holder compares the dealing's fingerprint, `tagged_hash("MOR/module/airgap/dealing", dealing)`, with every other holder, out of band. *The checks mean something only if everyone checks against the same commitments.*
- **The rebuild check.** The commitments show the shares agree with each other; they cannot show that the seed they rebuild gives the committed SLH-DSA key, which is a hash of a key derived by hashing. So, right after dealing, k holders bring their shares to a second offline device, which checks each share, rebuilds the seed, derives the key, compares its commitment with the dealing's, and forgets it. *Cost, stated: that second device also holds the key for a moment. A zero-knowledge proof of SLH-DSA key generation would remove it; none is established today.*

**5.2 Show the recovery path.** Where the grammar names a recovery path (an escrowed or custodial share), the device shows which shares it is using and whether the rotation is proceeding through that path, so members can see that a dead member's share was released as the grammar allows and not otherwise. It also shows how the next key is dealt, the dealing fingerprint, and that the rebuild check is still to be done.

## 6. Transport

Both transports carry the same messages, unchanged.

- **Animated QR codes.** A signed rotation is about 8 KB (SLH-DSA small variant) to 17 KB (fast variant), too large for one QR code. They travel as Blockchain Commons' Uniform Resources (UR), multi-part, which split data into animated QR frames with fountain-code error recovery, as used by Keystone devices and the Sparrow wallet. Reusing an existing standard lets existing tooling and devices support MOR. The UR types are `mor-commitment-export`, `mor-pending-rotation`, `mor-signed-rotation` and `mor-share`; a receiver accepts only the type it expects. Frames are drawn in upper case (QR alphanumeric mode) at error correction level M; fragments of 120 bytes keep each frame at QR version 11 or below, for older cameras. A frame's checksum catches accidents, not attacks (rule 3.9).
- **Files** on an SD card or USB stick: the message bytes and nothing else. Faster and robust for large data, but a physical connection, so rule 3.6 matters most here.

## 7. Tests for V1

Both transports are tested, including under attack. *Run* means passed by the implementation's tests (`modules/airgap/`); *not run* says why.

**Functional:**

- Identity creation with commitment export by QR, and by file. *Run.*
- Rotation round trip by animated QR, and by file, with the act built entirely offline, both SLH-DSA variants. *Run; the QR frames are drawn and read back by an independent decoder.*
- Dropped QR frames recovered. *Run.* Poor light and older cameras: *simulated* (low contrast, uneven light, small frames); *not run on a real camera, which needs the device.*
- A retried rotation re-exported identically. *Run.*
- Clean-device mode: a signing key generated offline and loaded onto a fresh device. *Run.*
- A fresh seed, under another seed Module and variant; a device restored from each seed Module's backup. *Run.*
- **New in draft 6:** a rotation from a fresh seed by default, its first key at the rotation's index; its backup shown, part of it asked back, a wrong answer refused, and nothing signed until it matches; a review abandoned before then signing nothing, its seed overwritten; the next rotation from the new backup; the earlier backup restoring no key that matches, said in plain words. *Not run in this Module's code: `modules/airgap/` implements draft 5 (`Choices::fresh_seed`, a fresh seed as the user's choice; the backup notice in the summary). Run in Kišib, which signs from paper (`clients/kishib/test/identity.test.ts`, H79).*
- **New in draft 6:** the exception: the current seed chosen on the device, shown prominently with its cost; refused at an escape and at rule 3.4's other exception; never chosen by the online device. *Not run: to build.*
- A collective rotation from k shares, with the next shares verifiably dealt and checked by rebuild, then a rotation through an escrowed share. *Run.*

**Attacks:**

- A field changed on the online device (homes, vault, audit, succession, closure) is visible on the offline summary. *Run.*
- An online-supplied next chain-key commitment is ignored and replaced by the device's own. *Run.*
- A second, different rotation with the same key is refused; each exception allowed once, and only when confirmed. *Run.*
- The escape out of a position contested at a self-hosted home: refused on the online side's word alone, refused with the device's own rotation or with a rotation that does not compete, signed on the competing rotation's bytes, once (new in draft 5, F299). *Run (`tests/rule_29.rs`; the gauntlet's 5.7f runs the escape against homes).*
- Signing again after a rotation the device signed and could not check (a home rule left in place that no longer fits): refused on the online side's word alone and with a chain that does not end with the previous act; signed on the chain's bytes, the device finding its rotation invalid itself; refused where the chain shows the rotation valid (new in draft 5, Fable's I5, F328 Q3). *Run (`tests/rule_29.rs`; the gauntlet's 5.7g runs it against homes).*
- A rotation whose previous act does not match the device's commitment is refused. *Run.*
- A tampered QR sequence or swapped file is rejected. *Run.*
- A file containing anything other than an expected message is rejected without being executed. *Run.*
- An online device that inserts an attacker's signing key: the fingerprint mismatch is visible on a second screen. *Run.*
- A dealing device that deals shares not rebuilding the committed next key: the rebuild check fails. A tampered share fails its holder's own check; holders handed different dealings see different fingerprints. *Run.* *A device that keeps a copy of a key it held cannot be detected by any test (F97).*

## 8. Why it matters

Defining the pending rotation once means any signing device can support MOR: an old phone in flight mode or a laptop that never connects for V1, and later hardware-wallet makers, who already have the screens, secure storage and air-gapped transports this needs. The hard lessons about display, tampering and transfer were learned in Bitcoin; MOR does not need to learn them again.
