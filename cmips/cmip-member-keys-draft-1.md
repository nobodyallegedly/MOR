# cMIP: Member keys

*Draft 1, 19 October 2026, written by the round 3 session for **F353**, for Nobody, allegedly, to approve. Decided by Nobody, allegedly, 18 and 19 October 2026: each member acts for a collective with a key of their own, named in their signature of its founding or clone (Agreements draft 16, rule 73); "the app that makes the key leaves it as a private act sealed to the member's own identity, as the accepted list (F340) and money drafts travel; any app holding the identity opens it; the key stays the same through the member's own change of keys (the collective unaffected), re-sealed to the new encryption key in Kišib's change of keys. Stated cost: the key sits encrypted at the member's homes." "Other ways of keeping and using keys are for the competitive layer."*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against Agreements draft 16 (rules 60 and 73), Envelopes draft 10 (private acts, the sealed container), Identity draft 14. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Member keys cMIP, draft 1, test value until publication")`. Its code is in `clients/grants` (`src/member.ts`), shared by Dub, Edubba, Damgar, Ummia and Kišib.

*Reading this document: normal text is the specification. Italic text is commentary. Choices F353 did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*When you sign a collective's founding, or a change of its members, and you hold one of its lanes, your app makes a key for you, there and then. Your signature names its public half; that is all the collective needs. The private half has to reach your other apps (Damgar for the collective's money, Ummia for its releases, Edubba on the web), and apps here talk only through MOR. So your app seals it to you, as a private act only you can open, and leaves it at your homes. Any of your apps holding your identity finds it there and opens it.*

## 1. The act

A member key is a private act of its holder (type 0 of this cMIP), `to` its holder alone, sealed to the holder's current encryption key and left at each of the holder's homes:

```cddl
member-key = {
  0 => hash,                ; the founding or clone the holder signed, naming the key
  1 => hash,                ; that signature act (Agreements type 1, field 1): what acts made with the key name as their binding
  2 => signing-key,         ; the key's public half, Identity's [ scheme, key ], as the signature names it
  3 => bstr                 ; the key's secret: the signing secret of its scheme
}
```

1.1. A member key whose act is public, is not addressed to its signer alone, or whose key does not match field 2 of the signature act field 1 names, is no member key: apps ignore it. **(mechanic, this draft's)**

1.2. *The core never reads this act: it judges only the signature naming the key, and the acts made with it (Agreements draft 16). This cMIP is how a member's own apps share a secret among themselves.*

## 2. Making it (client conformance)

2.1. The member's app makes the key as the member signs a founding or clone giving them an area, names its public half in that signature (Agreements signature field 1), publishes the signature, then seals the member key to the member at their homes.

2.2. A member who signs nothing makes nothing. *Where a member never signs, the keys others made for that founding are left unused: a stated cost of F353.*

## 3. Finding and using it

3.1. An app holding the member's identity reads the sealed acts addressed to them at their homes, opens them with the encryption keys it holds, and keeps those of this cMIP that are valid under Identity (or void by a later change of keys that kept them: the key itself is unchanged).

3.2. For a collective, the app uses the member's latest key (by its place in the member's own line) whose founding or clone belongs to that collective's agreement chain. Agreements then judge whether it is in force (draft 16, rule 73: once complete, the holder's latest).

3.3. An act made with it is the collective's: its signer the collective, its binding the signature act (field 1), citing the collective's latest decision (rule 58), on the key's own strand (each naming the previous act bound to the same signature). **(mechanic, this draft's: the strand is read from the acts the collective's places hold bound to that signature, so two apps of one member continue one strand.)**

## 4. A change of the member's own keys

4.1. The member key stays the same through the member's own change of keys: it is the collective's key, not the member's. When the member's encryption key changes with it, the app that publishes the new encryption key opens each member key sealed to the member with the old one and leaves the same act sealed again to the new one at the member's homes. **(mechanic, this draft's: the decision named Kišib's change of keys; Kišib holds the chain key's paper, never the signing words that carry the encryption key, so the sealing again is done where the change of keys is taken up, in Dub or Edubba, by the app publishing the new encryption key. A reading to confirm.)**

## 5. Costs, stated

- The key sits encrypted at the member's homes: whoever holds the member's encryption key (their signing words carry it) can act with it, within the areas the member holds, as they could already sign the member's own signature acts.
- A stolen member key acts within its holder's areas until a member change names a new one: the collective's chain key rotates it away.
- Two apps of one member signing at the very same moment may fork the key's strand; the collective's next act joins the heads it holds (rule 58).
