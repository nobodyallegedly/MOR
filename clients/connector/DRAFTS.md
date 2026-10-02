# The drafts folder

How a draft passes from the MOR connector (Claude's side) to the desk (the owner's side), on the owner's Mac. Roadmap steps 11a and 11c.

*Decided (Nobody, allegedly, 1 October 2026):* drafts reach the desk on the Mac only, by a local format documented in the repository: no inbox, no cMIP. "I see and control the ID Claude speaks through." So this is not part of the protocol. It is a handoff between two programs run by one person under one account, and it can change with them.

This file only documents the format. Drafts are never written here: they are files in the drafts folder on the owner's Mac, `~/mor-drafts` by default.

## In plain words

Claude never signs and never sends. When you ask it to post, publish a picture, withdraw one or send a message, the connector writes a **draft** into a folder: exactly what the act will say, and for which identity. The desk finds it there, reads it again for itself from the file's own bytes, and shows it to you with a short fingerprint, its **digest**, which Claude shows too. You approve it, decline it, or send it back with a note. The desk writes its **answer** into the same folder, and Claude reads it there: an approval with the act it made, or your note saying what to change. The desk also writes which identities you **linked** to Claude, so Claude can name them and prepares nothing for the others.

## Precisely

The folder is `~/mor-drafts` unless set otherwise (`MOR_DRAFTS` for the connector, Settings at the desk). It holds no key. Every file is written whole under a temporary name, then renamed, so a reader never sees half a file.

| File | Written by | What |
| --- | --- | --- |
| `DIGEST.mor-draft` | the connector | A draft: deterministic CBOR, below. `DIGEST` is the SHA-256 of the file's exact bytes, in hex. |
| `DIGEST.mor-answer` | the desk | The desk's answer to that draft: JSON, below. At most one per draft; a draft with an answer is never answered again. |
| `linked.json` | the desk | The identities the owner linked to Claude: JSON, below. |

### The draft

```cddl
draft = {
  0 => "MOR draft, version 2",
  1 => hash,              ; signer: the identity that is to sign it
  2 => hash,              ; spec of the act
  3 => uint,              ; type of the act
  4 => bstr,              ; payload, as CBOR bytes, exactly as it will be inside
  5 => bool,              ; public: true, the act carries its key
  ? 6 => [+ hash],        ; refs
  ? 7 => [+ [hash, hash]],; objects: [chain, predecessor]
  8 => [* tstr],          ; relays a public act is sent to once signed (empty for a message)
  ? 9 => [hash],          ; a message: its one recipient
  ? 10 => [+ bstr],       ; media: locked bytes put on the relays after a publication
  ? 11 => tstr,           ; Claude's note to the owner: never signed, never part of the act
  ? 12 => hash,           ; the digest of the draft this one reworks
}
```

Deterministic CBOR as the core defines it; a draft that does not re-encode to its own bytes, has another field, or another label, is not a draft. A draft is never an act: the desk makes the act from it as the next in the identity's own sequence (position, previous act, running summary, binding, salt and lock are the desk's), so no program elsewhere can fork that sequence by guessing a position.

**What a draft may be** (decided by Nobody, allegedly, 1 October 2026: acts of the Text and Envelope layers only):

| Kind | Spec, type | Shape |
| --- | --- | --- |
| A post | Text, 0 | public; payload `{0: text, ? 1: long-form format}`; refs allowed; no objects, recipient or media |
| A message | Text, 0 | private; one recipient (field 9), who has an encryption key and an inbox; refs allowed; sealed to the recipient at the desk and left in its inbox |
| A picture | Envelope, 0 | public; a JPEG publication with its key (fields 0 to 6 of the media map, no price, no `for`); its locked bytes in field 10; the JPEG stripped to the picture alone |
| A withdrawal | Envelope, 3 | public; empty payload; objects `[[publication, publication]]`, a publication its signer made or that was made for it |

Anything else, a Law act above all, is refused: by the connector before any draft is written, and by the desk again if a draft arrives by another way.

### The answer

```json
{
  "format": "MOR desk answer, version 1",
  "draft": "DIGEST",
  "verdict": "approved" | "declined" | "sent back",
  "note": "the owner's words: what to change, or why (empty when approved)",
  "act": "ACT ID (approved only)",
  "sent": [{ "to": "relay, or inbox relay", "accepted": true, "answer": "what it said" }],
  "time": 1790000000
}
```

`time` is the desk's clock, a hint for people, never part of an act.

### The linked identities

```json
{
  "format": "MOR desk, identities linked to Claude, version 1",
  "identities": [{ "id": "IDENTITY HASH", "name": "the name given at the desk" }]
}
```

### Rework

When the owner sends a draft back, Claude reads the note (`mor_drafts`) and prepares a new draft naming the old one in field 12. The connector refuses to rework a draft that was not sent back, or that was for another identity. The desk shows the rework with the owner's note and the earlier text beside it, and refuses it if the draft it names was not sent back.

### What each side checks

- **The desk** reads every draft from its bytes alone (`readDraft` in `src/draft.ts`, the same code the connector uses), refuses a file whose bytes do not hash to its name, signs only a draft the owner approved by its whole digest, only for an identity it holds and the owner linked, and only once.
- **The connector** takes the desk's word for a decline, a note or a delivered message, but checks an approved public act for itself: it fetches the act from the relays and compares it with the draft, field by field.
- *Stated cost:* anything running under the owner's account can write into the folder, as it can read the keys themselves. A forged draft is still read in plain words from its bytes before anything is signed; a forged answer can mislead Claude, not sign anything.
