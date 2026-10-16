# cMIP: People (follow and mute)

*Draft 1, 16 October 2026 (F332: "We need a follow list cMIP I think it's good to have at release"; "Muting is needed yes"; a people cMIP, follow and mute, private by default, a follow list publishable, "Works for me"; on the follow list's default, "Agreed"; the names attached to followed identities stay in the app either way; all Nobody, allegedly). **Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.** Written against the Identity MIR draft 13 (routes' versioning, "Which value counts", 3, borrowed), the Envelopes MIR draft 10, the working rule on options with a forced default (F59) and the findings to F332. It fills no task: an xtype (Development rule 18), defining one act type. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("People cMIP, draft 1, test value until publication")`. Its code is in Dub (`clients/dub/src/people.ts`).*

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decisions did not fix are marked **(mechanic, this draft's)**, taken by the session under the working practice on development-layer mechanics, to confirm when built.*

## In plain words

*To follow someone is to say "show me what they post". To mute someone is to say "show me nothing of theirs". Both are a person's own business, so by default both stay in the person's app and nobody else learns of them.*

*A person may choose to publish whom they follow, as a signed list anyone can read: a way of saying "these are the voices I listen to". Muting is never published. And the names a person gives those they follow ("Mum", "the bike shop") never leave the app, published list or not.*

## 1. Following

1.1. A client keeps, for each identity it holds, a **follow list**: identities, each by its ID (64 hexadecimal characters), with, optionally, a name the person gave it.

1.2. A person follows an identity by its ID, typed or pasted, or from any act a client shows: its signer. A client that follows from an act follows the signer the act carries, as the core library reads it, never a name.

1.3. **The follow list is private by default** (F59: an option with a forced default). Its two options: **private** (the default, when none is chosen: the list stays in the app, nothing is published) and **published** (section 3).

1.4. **The names attached to followed identities stay in the app, always**, under both options. A published list carries IDs only. *They are pet names: a person's own word for someone, which may say more about the person than the name does.*

## 2. Muting

2.1. A client keeps, for each identity it holds, a **mute list**: identities by their IDs.

2.2. A client shows nothing of a muted identity where it gathers acts for the person: no post in a feed, no reply or message addressed to the person. It MAY say how many were hidden, never what they said. **(mechanic, this draft's)**

2.3. **Muting is private, always.** No act is defined for it, and a client MUST NOT publish a mute list, nor tell the muted identity. *A mute that the muted could see would be a block, and an invitation.*

2.4. Muting an identity the person follows hides it, as 2.2 says, without unfollowing it; unmuting shows it again. **(mechanic, this draft's)**

## 3. A published follow list

3.1. **The act.** A follow list is published as a public everyday act of this cMIP, **type 0**, signed with the signing key, sent to the relays the identity's routes name as its outbox:

```cddl
follow-list-payload = {
  0 => uint,            ; version: 1 for the first, then the previous version plus one
  ? 1 => hash,          ; the previous follow list act (absent only for version 1)
  2 => [* hash],        ; the identities followed, by ID, each once, in the order the client keeps them
  ? 3 => true           ; withdrawn: the list is private again (2 is then empty)
}
```

3.2. **Versions.** Follow list acts form their own chain, as routes do (Identity, "Which value counts", 3): each names the one it replaces and carries its version plus one. The latest act of an unbroken, unforked chain counts. If two valid acts name the same predecessor, the chain is forked from that point, and a reader uses the last act before the fork and says it is forked. **(mechanic, this draft's)**

3.3. **Publishing.** A client that publishes reads the identity's latest follow list act first, at the places its routes name, and continues the chain from it. It publishes a new version each time the list changes while the option is **published**.

3.4. **Back to private.** Choosing **private** after **published** publishes one last version, empty, marked withdrawn (key 3); the client then publishes nothing more. *What was published stays published: an act cannot be unpublished. The withdrawn version says only that the list is no longer kept up to date in public.*

3.5. A client MUST say, before the first publication: "Anyone can read whom this identity follows, now and for good: a later change of mind stops new versions, it does not take this one back. The names you gave them stay in this app."

3.6. A client reading another identity's published list shows the IDs, each with its display name (the naming cMIP) beside its fingerprint, and never the publisher's pet names, which are not in it.

## 4. What a follow list is not

4.1. Following gives no authority, sends nothing to the followed, and is not a link (Identity rules 14 to 16): the followed identity signs nothing.

4.2. A published follow list is a statement of its signer, not of those it names. *Anyone can follow anyone: a list naming famous identities proves nothing about its signer.*

## Costs, stated

- **A published list is public for good,** versions included: going private again ends new versions, not old ones (3.4).
- **Two apps, one list.** An identity carried into two apps that each publish its list forks the chain (3.2); the fork is shown, never resolved by guessing. Publishing from one app only avoids it. *The private default makes this rare.*
- **A private list lives in one app.** It is not carried by the identity's words; another app holding the same identity starts with an empty list. *The price of keeping it private without a key to seal it to oneself.*
- **Muting is local.** A muted identity's acts still reach the relays and the inbox; the app only stops showing them.

## Tests

- Following by ID and from an act; names attached kept in the app and never in an act; unfollowing. *Run, `clients/dub/test/dub.test.ts`.*
- The private default: nothing published until published is chosen; the warning of 3.5; version 1, then 2 on a change; back to private, an empty withdrawn version, then nothing. *Run, same file.*
- A forked chain read as forked. *Run, `clients/dub/test/people.test.ts`.*
- Muting hides posts, replies and messages, and is never published. *Run, `clients/dub/test/dub.test.ts` and `browser.test.ts`.*
