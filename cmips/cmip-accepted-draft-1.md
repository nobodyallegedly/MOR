# cMIP: Accepted specifications

*Draft 1, 17 October 2026, written by Damgar's build (`docs/damgar-report.md`) for F340, for Nobody, allegedly, to approve. **F340**, decided by Nobody, allegedly: one list of the cMIPs and Modules a person accepts, "a private act sealed to the person's own identity at its homes (as the sealed follow list), read by any app holding the identity, each applying the part it understands"; "the other apps should be able to push the decision, in case a user does not use Ummia": every app may change it for its part, "writing a new version on the latest it read and checking again before sending, so two apps changing it at once never lose a change (a fork shown and merged, never dropped)"; private by default, publishing it the other option (F59).*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Identity MIR draft 13, the Envelopes MIR draft 10 (private acts, the sealed container), the Development MIR draft 10 (rule 9: a client that has not adopted a specification answers unknown), the people cMIP draft 2 (whose sealed follow list this follows closely), the identity carry Module draft 2 (2a, the encryption key the signing key's words carry), the working rule on options with a forced default (F59) and the findings to F340. It fills no task: an xtype (Development rule 18), defining two act types. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Accepted cMIP, draft 1, test value until publication")`. Its code is in Damgar (`clients/damgar/src/accepted.ts`), which writes and reads it until Ummia does.

*Reading this document: normal text is the specification. Italic text is commentary. Choices F340 did not fix are marked **(mechanic, this draft's)**.*

## In plain words

*Every act names the specification it follows. An app that has not accepted a specification shows such an act as unknown and signs nothing for it, as the core asks of any specification a client does not implement. Which specifications you accept is your choice, and it should be the same in every app you use, on every device.*

*So the list of what you accept is kept as a private act that only your identity can open, left at your identity's homes, as the follow list is. Each app reads it and uses the part it understands: Damgar the payment rails and units, Edubba the agreements' cMIPs, Dub the formats it shows. Any app may change its part. When two apps change it at the same moment, the next app to write merges both changes, and says so. Nobody else can read it; you may publish it if you wish.*

## 1. The list

1.1. A person's **accepted list** is a set of specifications, each by its spec hash, with, optionally, a label: the specification's name and draft as the app that added it read it (at most 120 characters, one line) **(mechanic, this draft's)**. *The label is a hint for an app that does not know the specification, so it can show it; the hash decides.*

1.2. **What it means.** A client applying the list treats a specification on it as adopted (Development rule 9), and every other specification of the kinds it applies the list to as not adopted: an act depending on one is shown unknown, and nothing is signed for it. *Accepting is necessary, not sufficient: a client still needs code for what it accepts. A specification accepted but not implemented stays unknown, said as such.*

1.3. **Each app its part.** A client applies the entries it understands and keeps every other entry unchanged when it writes. *Damgar understands the Money layer's: the payment cMIP, its rail Modules, the units Modules, and shows the split, conversion and anchoring cMIPs and the Bitcoin clock Module, which round 1 uses only in part.*

1.4. **Nothing accepted** is the default where no list is found: every specification of the kinds a client applies the list to is unknown until the person chooses. *The safe side: a client never signs under a specification the person did not choose.*

1.5. **Two options** (F59): **private**, the default when none is chosen (section 2), and **published** (section 3), in which the list is also public.

## 2. The list sealed to oneself (the private option)

2.1. **The act.** A **private** everyday act of this cMIP, **type 1**, signed with the signing key, addressed to the identity itself (its `to` names its own ID):

```cddl
accepted-list-payload = {
  0 => uint,                 ; version: 1 for the first, then the highest version it follows plus one
  ? 1 => hash,               ; the act it follows (absent only for version 1)
  2 => [* accepted],         ; the specifications accepted, each once, in ascending order of hash
  ? 3 => [+ hash]            ; the other acts it merges: the other branches of a fork (2.6)
}
accepted = [hash, ? tstr]    ; a spec hash, and its label (1.1)
```

2.2. **Sealed to oneself, left at the homes**, exactly as the people cMIP's sealed follow list (its 3.2): a sealed container whose one recipient is the identity, sealed to its current encryption key as its homes serve it, left at every home of the identity, the locked act at its homes too (Identity rule 35).

2.3. **Who can open it:** any app holding the identity's signing key's words (the carry Module, 2a). An app holding the identity without its encryption key cannot read or write it, and says so.

2.4. **Reading it.** At each home, what is addressed to the identity; each sealed container opened with its encryption keys; the acts of type 1 signed by the identity itself and valid for its chain. They form a tree from version 1, each naming the act it follows in key 1 and any branches it merges in key 3. **The tips** are the acts no other act follows or merges. One tip: it counts. Several: the list is **forked**, and the reader shows each tip's difference from their last common act. **(mechanic, this draft's)**

2.5. **Writing it** (F340: "writing a new version on the latest it read and checking again before sending"). A client changing its part:
1. reads the tips (2.4);
2. where there are several, merges them (2.6);
3. applies the person's change to its own part only;
4. **reads the tips again** just before sending; where they changed, starts again from 1 with what it found, the person's change kept;
5. writes the next version: key 1 the tip it read (the smallest act id where it merged several), key 3 the other tips it merged, its version one more than the highest of them.

2.6. **A fork merged, never dropped.** Several tips are merged against their last common act (the base): a specification any tip added since the base is in the merge; a specification any tip removed since the base is not; the rest is the base's. *With sets, no two branches can disagree about one entry: one can only add what the base lacked, or remove what it had.* Where the tips share no act (two version 1s), the base is empty. The client shows the person what was merged, by whom it was added or removed where it can tell (the label), before writing. **(mechanic, this draft's)**

2.7. **A new encryption key.** After the identity's encryption key changes, the next version is sealed to the new key.

## 3. A published list (the other option)

3.1. **The act.** A **public** everyday act of this cMIP, **type 0**, at the relays the identity's routes name as its outbox: the same payload as type 1's, with one more key, `? 4 => true`, withdrawn (the list is private again; 2 is then empty). Its versions form their own chain.

3.2. The sealed list stays the one any app writes; a client publishing it writes the published version from the sealed list it just wrote. **(mechanic, this draft's)**

## Costs, stated

- **The relays and homes** see that a private act of this identity exists, and roughly how big it is.
- **Whoever holds the signing key's words** reads and changes it.
- **One act per change.**
- **An app that does not read this list** keeps its own choice; the person sees two choices until that app does.
- **Published, it says which software a person runs**: which rails they can pay on, which agreements they can read.

## Freeze scenarios

Not core. Run in Damgar's tests (`clients/damgar/test/accepted.test.ts`): written, read back by a second app holding the identity by its words; a change by one app keeps another app's entries; two apps writing at once, the fork shown and merged, an entry added in one branch and one removed in the other both kept; checked again before sending; nothing in the clear at the homes; published only by choice, withdrawn.
