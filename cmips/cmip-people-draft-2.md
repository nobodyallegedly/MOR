# cMIP: People (follow and mute)

*Draft 2, 17 October 2026. Draft 1 (`cmip-people-draft-1.md`) is kept beside it. What changed (H29, decided by Nobody, allegedly: "can't a private follow list be a private encrypted act?"; then, on the project lead's lean, "yes, everything makes sense"): **the private follow list, with the names given, is a private act sealed to one's own identity and kept at its homes**, read by any app holding the identity, so it survives a lost device and follows the identity from Dub on the Mac to Dub on the web and to Edubba. Private, sealed to oneself, is the default (F59); published is the other option, as in draft 1. Muting is unchanged: kept in the app, never published, never sealed anywhere.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Identity MIR draft 13 (routes' versioning, "Which value counts", 3, borrowed; rule 35, lines of acts), the Envelopes MIR draft 10 (private acts, the sealed container), the identity carry Module draft 2 (the encryption key carried by the signing key's words, 2a), the working rule on options with a forced default (F59) and the findings to H34. It fills no task: an xtype (Development rule 18), defining two act types. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("People cMIP, draft 2, test value until publication")`. Its code is in Dub (`clients/dub/src/people.ts`); Edubba reads the sealed list (`clients/desk/src/real.ts`).

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decisions did not fix are marked **(mechanic, this draft's)**, taken by the session under the working practice on development-layer mechanics, to confirm when built.*

## In plain words

*To follow someone is to say "show me what they post". To mute someone is to say "show me nothing of theirs". Both are a person's own business.*

*Whom you follow, and the names you give them ("Mum", "the bike shop"), are kept as a private act that only your own identity can open, left at your identity's homes. Any app you bring your identity into (by its signing key's words) finds it there and opens it, so the list is not lost with a phone, and is the same everywhere you use the identity. Nobody else can read it. The relays and homes holding it see only that a private act of yours exists, and roughly how big it is.*

*You may also publish whom you follow, as a signed list anyone can read: IDs only, never the names you gave them, which stay sealed. Muting is never published and never leaves the app.*

## 1. Following

1.1. A client keeps, for each identity it holds, a **follow list**: identities, each by its ID (64 hexadecimal characters), with, optionally, a name the person gave it (at most 64 characters, one line) **(mechanic, this draft's: 64, as Dub had)**.

1.2. A person follows an identity by its ID, typed or pasted, with a name if they like, or from any act a client shows: its signer. A client that follows from an act follows the signer the act carries, as the core library reads it, never a name.

1.3. **The follow list has two options** (F59: an option with a forced default):
- **private** (the default, when none is chosen): the list, with its names, is kept as a private act sealed to the identity itself (section 3). Nothing is public.
- **published**: the IDs are also published, as a public act anyone can read (section 4). The names stay in the sealed list only.

1.4. **The names attached to followed identities are never public**, under both options: they are in the sealed list, which only the identity can open. *They are pet names: a person's own word for someone, which may say more about the person than the name does.*

## 2. Muting

2.1. A client keeps, for each identity it holds, a **mute list**: identities by their IDs.

2.2. A client shows nothing of a muted identity where it gathers acts for the person: no post in a feed, no reply or message addressed to the person. It MAY say how many were hidden, never what they said. **(mechanic, draft 1's)**

2.3. **Muting is private, always, and stays in the app.** No act is defined for it, sealed or public, and a client MUST NOT publish a mute list, nor tell the muted identity. *A mute that the muted could see would be a block, and an invitation. Draft 2 does not carry mutes in the sealed list: the decision named the follow list; a later draft may.*

2.4. Muting an identity the person follows hides it, as 2.2 says, without unfollowing it; unmuting shows it again. **(mechanic, draft 1's)**

## 3. The follow list sealed to oneself (the private option)

3.1. **The act.** The follow list is a **private** everyday act of this cMIP, **type 1**, signed with the signing key, addressed to the identity itself (its `to` names its own ID):

```cddl
sealed-follow-list-payload = {
  0 => uint,                    ; version: 1 for the first, then the previous version plus one
  ? 1 => hash,                  ; the previous sealed follow list act (absent only for version 1)
  2 => [* followed]             ; the identities followed, each once, in the order the client keeps them
}
followed = [hash, ? tstr]       ; an ID, and the name the person gave it, if any (1.1)
```

3.2. **Sealed to oneself.** The act is put in a sealed container (Envelopes, "Sealed container") whose one recipient is the identity itself, sealed to **its current encryption key** as its homes serve it. The container is left at **every home of the identity**, addressed to it; the act itself, locked, goes to its homes too, as every private act of a line does, so that a change of its keys keeps the line (Identity rule 35). **(mechanic, this draft's: at its homes, not its inbox relays, since a home keeps what is addressed to its identities and is where any app looks first.)**

3.3. **Who can open it.** Whoever holds an encryption key of the identity whose public half it was sealed to: in practice, **any app holding the identity's signing key's words**, since the encryption key is carried by them (the identity carry Module, draft 2, 2a). An app holding the identity without its encryption key cannot read or write the sealed list, and keeps the list in the app only, saying so.

3.4. **Reading it.** A client holding the identity reads, at each of its homes, what is addressed to the identity; opens each sealed container with the identity's encryption keys, newest first; keeps the acts of this cMIP's type 1 signed by the identity itself and valid for its chain (the core library's verdict, the act's key delivered with it); and follows them as a chain from version 1, each naming the one it replaces (Identity, "Which value counts", 3, borrowed). The latest act of that chain counts. **(mechanic, this draft's)**

3.5. **A fork.** Two apps changing the list at the same moment may both write the same next version. Where two valid acts name the same predecessor, the reader takes the branch reaching the highest version, and between equal versions the act whose id is smaller in byte order, and says the list was forked. The next version a client writes names the act it read, so the fork ends there. *Nothing is lost silently: the other branch's change is not in the list read, and the client says the list was forked, so the person can follow again.* **(mechanic, this draft's)**

3.6. **Writing it.** A client changing the list reads the latest sealed version first (3.4), applies the person's change to that list, and writes the next version, naming the one it read. It writes one act per change. **(mechanic, this draft's)**

3.7. **Carrying over.** A client that kept a follow list in the app before this draft (draft 1's private option) writes it as the sealed list the first time it reads the identity's homes: as version 1 where none is found; where one is found, the identities the app held that the sealed list lacks are added, with their names, as the next version, and nothing is removed. **(mechanic, this draft's)**

3.8. **A new encryption key.** After the identity's encryption key changes (a rotation, the carry Module 2a.4), the next version is sealed to the new key; earlier versions stay sealed to the key they were sealed to.

## 4. A published follow list (the other option)

4.1. **The act.** A follow list is published as a public everyday act of this cMIP, **type 0**, signed with the signing key, sent to the relays the identity's routes name as its outbox. Its format is draft 1's, unchanged:

```cddl
follow-list-payload = {
  0 => uint,            ; version: 1 for the first, then the previous version plus one
  ? 1 => hash,          ; the previous follow list act (absent only for version 1)
  2 => [* hash],        ; the identities followed, by ID, each once, in the order the client keeps them
  ? 3 => true           ; withdrawn: the list is private again (2 is then empty)
}
```

4.2. **One chain across drafts.** A reader takes type 0 acts naming this draft's hash or draft 1's as one chain: draft 1's published versions are continued, not restarted. **(mechanic, this draft's)**

4.3. **Versions, publishing, back to private, the warning.** As draft 1, sections 3.2 to 3.5: each version names the one it replaces; a fork is shown, never resolved by guessing; a client publishing reads the latest version first and publishes a new one at each change while the option is **published**; choosing **private** again publishes one last, empty version marked withdrawn, then nothing more public. A client MUST say, before the first publication: "Anyone can read whom this identity follows, now and for good: a later change of mind stops new versions, it does not take this one back. The names you gave them stay in this app." *Draft 1's words, kept: the names stay sealed, read only by apps holding the identity.*

4.4. **The sealed list goes on.** While published, the sealed list (section 3) is still written at each change: it holds the names, which the published list never carries.

4.5. A client reading another identity's published list shows the IDs, each with its display name (the naming cMIP) beside its fingerprint, and never the publisher's names, which are not in it.

## 5. What a follow list is not

5.1. Following gives no authority, sends nothing to the followed, and is not a link (Identity rules 14 to 16): the followed identity signs nothing.

5.2. A published follow list is a statement of its signer, not of those it names. *Anyone can follow anyone: a list naming famous identities proves nothing about its signer.*

## Costs, stated

- **The relays and homes see that a private act exists, and its rough size.** A sealed list hides whom you follow and what you call them, not that you keep a list, nor roughly how many you follow (its size grows with the list), nor when you change it (each change is an act). *Ways to say less (padding to fixed sizes, decoys, splitting across relays) are ideas above the core, for builders (roadmap, "Private acts that say less").*
- **Whoever holds the signing key's words reads the list**, names included: the encryption key is carried by them. As for the identity's private messages.
- **One act per change**, at the identity's homes, in its line.
- **A list sealed to an old encryption key** opens only with that key: an app brought in later by new words after a rotation reads the versions sealed since.
- **Two apps changing the list at once** fork it (3.5); the one not taken is said, not merged.
- **A published list is public for good,** versions included (4.3).
- **Muting is local.** A muted identity's acts still reach the relays and the inbox; the app only stops showing them, and another app holding the identity does not know of the mute.

## Tests

- Following by ID with a name and from an act; the name never in a public act; unfollowing; naming. *Run, `clients/dub/test/dub.test.ts`.*
- **The sealed list:** written at a change, sealed to the identity, left at its homes, never in the clear at a home or relay; opened by another app holding the identity by its signing words (Dub on the Mac and the web client; Edubba), with its names; a carry-over from an app's own list; nothing removed by a carry-over; a fork read as said. *Run, `clients/dub/test/dub.test.ts`, `clients/dub/test/people.test.ts`, `clients/dub/test/web.test.ts`, `clients/desk/test/real.test.ts`.*
- The published option: nothing public until published is chosen; the warning of 4.3; version 1, then 2 on a change; back to private, an empty withdrawn version, then nothing. *Run, `clients/dub/test/dub.test.ts`.*
- A forked published chain read as forked. *Run, `clients/dub/test/people.test.ts`.*
- Muting hides posts, replies and messages, and is never published nor sealed. *Run, `clients/dub/test/dub.test.ts` and `browser.test.ts`.*
