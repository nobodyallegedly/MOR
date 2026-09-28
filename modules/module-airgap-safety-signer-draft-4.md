# Spec Note: Pending Rotation and Air-Gapped Safety Keys

*Draft 4, 28 September 2026. Companion to the Identity MIP draft 9. Not core: a founding Module (confirmed by Nobody, allegedly), so that any signing device can support MOR safety keys. Draft 4 is draft 3 as built (roadmap step 6, `modules/airgap/`): seeds are defined by seed Modules, two of them founding (words and hex); the key index is the key's number in the identity's life; a key fingerprint both screens show alike; what "the same rotation" means for rule 3.4; clean-device mode chosen on the device; the share message and Pedersen dealing for collectives, with the promise of section 5 corrected (F96); the transports' exact types and limits; the tests marked run or not run. Draft 3 folded in the review notes N1 to N5 of draft 2 and applied review round 2.*

## 1. Purpose

The Identity MIP keeps the safety key offline and uses it only to sign rotations. In practice that means two devices:

- an **online device** (everyday phone or computer), holding the signing key, publishing and talking to homes;
- an **offline device** (an old phone kept in flight mode, a laptop never connected, or later a dedicated hardware signer), holding the safety seed and nothing else.

This note defines how the two exchange what they need, so that any client and any signing device can work together without knowing each other. It follows the lesson of Bitcoin's PSBT (partially signed Bitcoin transaction): one standard container for "waiting to be signed" made air-gapped signing routine, and let any wallet work with any signer.

## 2. Messages

Four messages cross the air gap. Each is one CBOR map with small integer keys, in deterministic encoding (Identity, "Encoding"), key 0 giving its kind. Every text string is canonical text. A map carries only the keys its kind defines.

**Key index.** A safety key's index is its number in the identity's life: 0 for the key genesis commits, n for the key the rotation at position n commits. The rotation at position n is therefore signed with key n − 1. *The online device always knows it, so the offline device never has to tell it, even across a fresh seed.*

### 2.1 Commitment export (offline to online, at genesis)

The offline device derives the first safety key from its seed and exports only its commitment:

```cddl
commitment-export = {
  0 => 0,              ; message kind
  1 => safety-commit,  ; [scheme, commit], as in the Identity MIP; scheme a founding number or a specification hash
  2 => uint            ; key index: 0 at genesis
}
```

The online device builds the genesis with this commitment, signs it with the signing key, and publishes it. The safety key itself never leaves the offline device.

### 2.2 Pending rotation (online to offline)

```cddl
pending-rotation = {
  0 => 1,              ; message kind
  1 => bstr,           ; the rotation's inside, encoded: spec, type 1 and payload, without the salt (inside key 10) and without the next safety commitment (payload key 3)
  2 => bstr,           ; the previous identity-chain act (genesis or last rotation), complete with its signature
  3 => uint,           ; key index of the safety key to use: the rotation's position minus one
  ? 4 => [+ bstr],     ; optional context for display (see rule 3.1: never trusted)
  ? 5 => bool          ; whether the online device has prepared an escape endorsement for this rotation (N4)
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

**Building the act offline (N1).** A rotation is a public act in the everything-encrypted envelope: an outside, a locked inside and a signature. After inserting the next safety commitment (rule 3.3), the offline device builds the whole act itself: it adds the salt, locks the inside with a content key it generates, builds the outside (signer, inside commitment, locked hash, nonce, content key), computes the act id and signs it. Salt, nonce and content key come from the offline device's own randomness, and so does SLH-DSA's hedging value (FIPS 205, hedged signing).

### 2.4 Share (dealer to each holder of a collective's safety key)

```cddl
share = {
  0 => 3,              ; message kind
  1 => dealing,        ; the public part, the same for every holder
  2 => uint,           ; x: this share's number, 1 to n
  3 => bstr .size 32,  ; f(x): the share of the seed
  4 => bstr .size 32   ; g(x): the share of the blinding
}

dealing = [
  safety-commit,       ; the key the shares rebuild
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
- any declaration it cannot read, with its specification, kind and value.

Consequential fields (succession, homeless flag, closure, vault changes, home and audit changes, disowned acts, unreadable declarations) are shown prominently. Any context supplied by the online device is for convenience only, shown apart as unchecked, and never replaces what the device computes itself.

**Fingerprint.** A key's fingerprint is the first 16 bytes of `tagged_hash("MOR/module/airgap/fingerprint", scheme || key)`, with `scheme` as in the safety commitment (one byte, or the 32-byte specification hash), written as eight groups of four hexadecimal characters. The online device shows the same fingerprint for the key it put in, so the two can be compared (section 4).

**Nothing unseen.** The device signs a rotation whose inside holds only spec, type and payload; it refuses any other inside field, since it could not show it. *A rotation has no use for acknowledgements, references or a hint; a field the owner cannot see is a field a compromised online device could use.*

**3.2 Check the chain, and say what was not checked (N2).** The device verifies that the previous identity-chain act is a genesis or a rotation of the Identity MIP, public, in its shape, with a valid signature (for a genesis, by the key it declares), that the pending rotation names it and follows its position, and that the safety key it is about to use matches the commitment in that act. It refuses otherwise. After a genesis it holds the whole chain state, so it also runs rotation check 5 (F94). It cannot know, offline, whether that act counts under the home rule, since receipts live at the homes; that check stays with the online device, and the device's summary says so, with whatever else it did not check, so nobody believes the offline device verified more than it did.

**3.3 Supply the next commitment itself.** The device derives the next safety key, index n + 1 after key n, from its current seed, or from a fresh seed if the current one may be exposed, and then shows the user that the new seed must be backed up. It inserts the next commitment into the rotation before signing. The online device never chooses it: a next commitment the online device sends anyway is dropped, replaced by the device's own, and the summary warns that the online device misbehaved. Otherwise a compromised online device could slip in an attacker's commitment and take over the identity at the next rotation. The next commitment may name a different scheme than the current key, by specification hash: this is how a safety-key scheme is replaced one day.

**3.4 Remember what was signed.** The device stores, per safety key, each rotation it signed: the request it answered and the signed bytes. The request is `tagged_hash("MOR/module/airgap/request", inside || previous act id)`, over the inside as the online device sent it, without salt and next commitment. *The request, not the act id: the act id changes with the device's own salt and keys.*

- Asked again for the same request, it re-exports the same signed bytes, whatever the user chooses this time. This includes the same homeless rotation, asked again with an escape endorsement announced: the endorsement is a separate act, so the rotation needs no new signature. A clean-device signing key is not kept, so a re-export does not carry it.
- Asked to sign a different rotation with the same key, it refuses.
- The exceptions are the two allowed by the Identity MIP, each once: one normal rotation after a homeless rotation voided by an objection, and one endorsed homeless rotation (an escape) after a normal rotation the homes refused. The device recognises each from what it signed last with that key, names the earlier rotation (the escape endorsement must list it as abandoned), and must confirm either explicitly with the user.

This enforces rule 8a of the Identity MIP in the device itself; the MIP calls 8a a client and Module rule for exactly this reason. *SLH-DSA is stateless and is not weakened by a few signatures; the point is that an owner never has two competing rotations in play.* *Cost, stated: a device restored from its seed backup starts with no memory, so rule 3.4 holds per device, not across a loss. A backup of the memory would close the gap and is left to devices.*

**3.5 Sign only rotations.** The safety key signs nothing else. The device refuses any other kind of act, of any specification.

**3.6 Accept only data.** The device parses the expected message and nothing else. It never executes anything received, whether by QR code or by file. It refuses a message larger than 256 KiB before reading it further, and any message not in deterministic CBOR, not of the kind expected, or with a key its kind does not define.

**3.7 Back up both seeds.** At genesis and at every fresh seed, the device tells the user that the safety seed must be backed up, and that the signing seed on the online device must be backed up too: the escape from a hostile or device-bound home needs the current signing key, and a lost phone with no backup can mean a lost identity at such a home (Identity, rules 12 and 37).

**3.8 Seeds are defined by seed Modules.** How a safety seed is written down and how its keys are derived is defined by a seed Module, named by its specification hash. A device implements one or more; a backup says which it follows. Two are founding: **words** (24 words of BIP-39's English list, `module-safety-seed-words-draft-1.md`) and **hex** (72 hexadecimal characters, `module-safety-seed-hex-draft-1.md`). A device restored from a backup finds which key to use by deriving keys from its seeds and matching the commitment in the previous act. *Several seed Modules side by side is the market in miniature: a device that knows a Module restores its backups; one that does not, cannot, and says so.*

**3.9 The online device checks what comes back.** Before publishing a signed rotation, the online device checks that it is the rotation it asked for: same identity, same payload but for the next safety commitment (and, in clean-device mode, the new signing key, whose secret must come with it and match), a valid signature by the key the previous act committed to. A signed rotation that fails is not published. *This is what catches a swapped file or QR sequence: the transports carry checksums against accidents, not attacks.*

## 4. The honest gap

The new signing key is normally generated on the online device. If that device is compromised at rotation time, it can hand over an attacker's key, and the offline device cannot tell.

Mitigations:

- The offline screen shows the new signing key's fingerprint (rule 3.1), so the user can compare it with a second, trusted screen.
- **Clean-device mode (N3).** The offline device may instead generate the new signing key itself, put its public key into the rotation, and export the secret alongside the signed rotation (message 2.3, key 2), for loading onto a clean everyday device. The user chooses the mode on the offline device; the online device does not ask for it. This does not help if the rotation is loaded back onto a compromised device, but it makes "rotate onto a clean device" one guided flow. Offered as a mode, never required. The offline device does not keep the key.
- Best practice: generate the new signing key on a clean device, especially when rotating after a suspected compromise.

No container fixes a compromised machine on its own; this should be stated plainly to users.

## 5. Collectives: split safety keys

For a collective whose safety key is held as shares (Law, key grammar), the rotation device is the one that rebuilds the key from k shares, signs once and forgets it. *For that moment one device holds the whole key; that is the price (Law rule 36).* The same holds for the next key: the device that generates it sees it before dealing its shares. **Nothing can prove that a device forgot a key (F96).** What can be checked is that the shares were dealt honestly, so that no device ends up the only one able to rotate.

**5.1 Deal the next shares verifiably.** The device that generates the next safety key MUST deal its shares so that each member can check, alone, that their share is consistent with every other member's, and MUST have the shares checked against the committed key before the rotation that commits to it is relied on. *Otherwise a dealing device could commit to a key it keeps and hand the members shares of another seed, and only it could ever rotate the collective (F82, M23, F96).*

- **The seed** is dealt with Shamir's scheme over the secp256k1 group order, any k of n shares rebuilding it: the seed of a seed Module, read as a number, big-endian; a seed at or above the group order is never dealt (the dealer draws another).
- **Pedersen commitments.** The dealer draws a second, random polynomial g, and publishes in the dealing Cj = aj·G + bj·H for the coefficients aj of the seed's polynomial f and bj of g. G is the group's generator; H is the first x-coordinate `tagged_hash("MOR/module/airgap/pedersen-h", [i])`, for i = 0, 1, …, that is on the curve, with even y, so that nobody knows its logarithm. A holder checks f(x)·G + g(x)·H = Σ xʲ·Cj. *Pedersen commitments hide the seed perfectly, even from an attacker with unlimited computing power, a quantum computer included; binding them rests on the discrete logarithm, so a dealer with a quantum computer could deal inconsistent shares undetected. Feldman's scheme, which publishes f's coefficients times G, would expose the seed to a quantum computer, defeating a post-quantum safety key.*
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
- A collective rotation from k shares, with the next shares verifiably dealt and checked by rebuild, then a rotation through an escrowed share. *Run.*

**Attacks:**

- A field changed on the online device (homes, vault, audit, succession, closure) is visible on the offline summary. *Run.*
- An online-supplied next safety commitment is ignored and replaced by the device's own. *Run.*
- A second, different rotation with the same key is refused; each exception allowed once, and only when confirmed. *Run.*
- A rotation whose previous act does not match the device's commitment is refused. *Run.*
- A tampered QR sequence or swapped file is rejected. *Run.*
- A file containing anything other than an expected message is rejected without being executed. *Run.*
- An online device that inserts an attacker's signing key: the fingerprint mismatch is visible on a second screen. *Run.*
- A dealing device that deals shares not rebuilding the committed next key: the rebuild check fails. A tampered share fails its holder's own check; holders handed different dealings see different fingerprints. *Run.* *A device that keeps a copy of a key it held cannot be detected by any test (F96).*

## 8. Why it matters

Defining the pending rotation once means any signing device can support MOR: an old phone in flight mode or a laptop that never connects for V1, and later hardware-wallet makers, who already have the screens, secure storage and air-gapped transports this needs. The hard lessons about display, tampering and transfer were learned in Bitcoin; MOR does not need to learn them again.
