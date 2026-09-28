# Spec Note: Pending Rotation and Air-Gapped Safety Keys

*Draft 3, 27 September 2026. Companion to the Identity MIP draft 7. Not core: a founding Module (confirmed by Nobody, allegedly), so that any signing device can support MOR safety keys. Draft 3 folds in the review notes N1 to N5 of draft 2 and applies review round 2: schemes by specification hash, the vault as per-unit entries with flow off, closure by rotation, disowned acts as voids, and verifiable share dealing for collectives.*

## 1. Purpose

The Identity MIP keeps the safety key offline and uses it only to sign rotations. In practice that means two devices:

- an **online device** (everyday phone or computer), holding the signing key, publishing and talking to homes;
- an **offline device** (an old phone kept in flight mode, a laptop never connected, or later a dedicated hardware signer), holding the safety seed and nothing else.

This note defines how the two exchange what they need, so that any client and any signing device can work together without knowing each other. It follows the lesson of Bitcoin's PSBT (partially signed Bitcoin transaction): one standard container for "waiting to be signed" made air-gapped signing routine, and let any wallet work with any signer.

## 2. Messages

Three messages cross the air gap.

### 2.1 Commitment export (offline to online, at genesis)

The offline device derives the first safety key from its seed and exports only its commitment:

```cddl
commitment-export = {
  0 => uint,           ; message kind: 0
  1 => safety-commit,  ; [scheme, commit], as in the Identity MIP; scheme a founding number or a specification hash
  2 => uint            ; key index in the seed
}
```

The online device builds the genesis with this commitment, signs it with the signing key, and publishes it. The safety key itself never leaves the offline device.

### 2.2 Pending rotation (online to offline)

```cddl
pending-rotation = {
  0 => uint,           ; message kind: 1
  1 => bstr,           ; the rotation inside (payload and fields), canonical CBOR, complete except the next safety commitment, the salt and the lock
  2 => bstr,           ; the previous identity-chain act (genesis or last rotation), complete with its signature
  3 => uint,           ; key index of the safety key to use
  ? 4 => [+ bstr],     ; optional context for display (see rule 3.1: never trusted)
  ? 5 => bool          ; whether the online device has prepared an escape endorsement for this rotation (N4)
}
```

### 2.3 Signed rotation (offline to online)

```cddl
signed-rotation = {
  0 => uint,           ; message kind: 2
  1 => bstr,           ; the complete rotation act: outside, locked inside and signature, built by the offline device
  ? 2 => bstr          ; optional: a new signing key's private part, when the device generated it (mode of section 4)
}
```

The online device publishes it to the identity's homes.

**Building the act offline (N1).** A rotation is a public act in the everything-encrypted envelope: an outside, a locked inside and a signature. After inserting the next safety commitment (rule 3.3), the offline device builds the whole act itself: it adds the salt, locks the inside with a content key it generates, builds the outside (inside commitment, locked hash, nonce, content key), computes the act id and signs it. Salt, nonce and content key come from the offline device's own randomness.

## 3. Rules for the signing device

**3.1 Never trust a summary you are handed.** The device builds its own plain summary from the exact bytes it will sign, and shows it before signing:

- the new signing key's fingerprint, and its scheme (a founding scheme, or a named specification);
- homes and home rule, if changed;
- the vault, if changed: every entry as unit, rail, limit, with "flow off" shown in words where a limit is zero, and any unit removed;
- audit requirement, if changed or removed;
- succession, if declared or ended;
- whether the rotation is homeless, and whether an escape endorsement is announced (N4);
- whether the rotation declares closure of the signer's home;
- how many sequences are kept, and how many acts are disowned. Disowning voids an act unless someone relied on it; the device says so.

Consequential fields (succession, homeless flag, closure, vault changes, home and audit changes) are shown prominently. Any context supplied by the online device is for convenience only and never replaces what the device computes itself.

**3.2 Check the chain, and say what was not checked (N2).** The device verifies that the previous identity-chain act's signature is valid, and that the safety key it is about to use matches the commitment in that act. It refuses otherwise. It cannot know, offline, whether that act counts under the home rule, since receipts live at the homes; that check stays with the online device, and the device's summary says so, so nobody believes the offline device verified more than it did.

**3.3 Supply the next commitment itself.** The device derives the next safety key from its current seed, or from a fresh seed if the current one may be exposed, and then shows the user that a new seed must be backed up. It inserts the next commitment into the rotation before signing. The online device never chooses it. Otherwise a compromised online device could slip in an attacker's commitment and take over the identity at the next rotation. The next commitment may name a different scheme than the current key, by specification hash: this is how a safety-key scheme is replaced one day.

**3.4 Remember what was signed.** The device stores, per key index, the hash of the rotation it signed.

- Asked again for the same rotation, it re-exports the same signed bytes.
- Asked to sign a different rotation with the same key, it refuses.
- The exceptions are the two allowed by the Identity MIP, each once: one normal rotation after a homeless rotation voided by an objection, and one endorsed homeless rotation (an escape) after a normal rotation the homes refused. The device must confirm either explicitly with the user.

This enforces rule 8a of the Identity MIP in the device itself; the MIP calls 8a a client and Module rule for exactly this reason. *SLH-DSA is stateless and is not weakened by a few signatures; the point is that an owner never has two competing rotations in play.*

**3.5 Sign only rotations.** The safety key signs nothing else. The device refuses any other kind of act.

**3.6 Accept only data.** The device parses the expected message and nothing else. It never executes anything received, whether by QR code or by file.

**3.7 Back up both seeds.** At genesis and at every fresh seed, the device tells the user that the safety seed must be backed up, and that the signing seed on the online device must be backed up too: the escape from a hostile or device-bound home needs the current signing key, and a lost phone with no backup can mean a lost identity at such a home (Identity, rules 12 and 37).

## 4. The honest gap

The new signing key is normally generated on the online device. If that device is compromised at rotation time, it can hand over an attacker's key, and the offline device cannot tell.

Mitigations:

- The offline screen shows the new signing key's fingerprint, so the user can compare it with a second, trusted screen.
- **Clean-device mode (N3).** The offline device may instead generate the new signing key itself, put its public key into the rotation, and export the private part alongside the signed rotation (message 2.3, key 2), for loading onto a clean everyday device. This does not help if the rotation is loaded back onto a compromised device, but it makes "rotate onto a clean device" one guided flow. Offered as a mode, never required.
- Best practice: generate the new signing key on a clean device, especially when rotating after a suspected compromise.

No container fixes a compromised machine on its own; this should be stated plainly to users.

## 5. Collectives: split safety keys

For a collective whose safety key is held as shares (Law, key grammar), the rotation device is the one that rebuilds the key from k shares, signs once and forgets it. Two rules beyond the above:

**5.1 Deal the next shares verifiably.** The device that generates the next safety key MUST deal its shares so that each member can verify their share belongs to the committed key without the device retaining the whole key: a verifiable secret sharing, with the commitment to the next key shown to every member. Otherwise the device's holder ends up owning the collective's safety key (F82, M23). The core text calls the split a Module safeguard for this reason.

**5.2 Show the recovery path.** Where the grammar names a recovery path (an escrowed or custodial share), the device shows which share it is using and whether the rotation is proceeding through that path, so members can see that a dead member's share was released as the grammar allows and not otherwise.

## 6. Transport

Both transports carry the same messages, unchanged.

- **Animated QR codes.** A signed rotation is about 8 KB (SLH-DSA small variant) to 17 KB (fast variant), too large for one QR code. Proposed: Blockchain Commons' Uniform Resources (UR), which split data into animated QR frames with fountain-code error recovery, as used by Keystone devices and the Sparrow wallet. Reusing an existing standard lets existing tooling and devices support MOR.
- **Files** on an SD card or USB stick: faster and robust for large data, but a physical connection, so rule 3.6 matters most here.

## 7. Tests for MOR 0.1

Both transports are tested, including under attack.

**Functional:**

- Identity creation with commitment export by QR, and by file.
- Rotation round trip by animated QR, and by file, with the act built entirely offline.
- Poor light, older cameras, and dropped QR frames recovered.
- A retried rotation re-exported identically.
- Clean-device mode: a signing key generated offline and loaded onto a fresh device.
- A collective rotation from k shares, with the next shares verifiably dealt.

**Attacks:**

- A field changed on the online device (homes, vault, audit, succession, closure) is visible on the offline summary.
- An online-supplied next safety commitment is ignored and replaced by the device's own.
- A second, different rotation with the same key is refused.
- A rotation whose previous act does not match the device's commitment is refused.
- A tampered QR sequence or swapped file is rejected.
- A file containing anything other than an expected message is rejected without being executed.
- An online device that inserts an attacker's signing key: the fingerprint mismatch is visible on a second screen.
- A rotation device that tries to keep the collective's next key: the members' share verification fails.

## 8. Why it matters

Defining the pending rotation once means any signing device can support MOR: an old phone in flight mode for 0.1, and later hardware-wallet makers, who already have the screens, secure storage and air-gapped transports this needs. The hard lessons about display, tampering and transfer were learned in Bitcoin; MOR does not need to learn them again.
