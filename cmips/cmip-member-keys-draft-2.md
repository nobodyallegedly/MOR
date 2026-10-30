# cMIP: Member keys

*Draft 2, 30 October 2026 (the Dubsar Suite's round 8, F407), on draft 1 (`cmip-member-keys-draft-1.md`), for Nobody, allegedly, to approve. **Experimental, not approved.** **A retirement draft: it proposes that this cMIP be retired, and defines nothing new.** The core moved to the redesign (S7h: `docs/s7h-report.md`, step 4; `wasm/README.md`, "For the Dubsar Suite"), decided by Nobody, allegedly, 29 October 2026 (F402): **a collective has no signing key and no member keys**; each member acts for the collective with their own key, naming it (Agreements rules 56 and 58: "Collectives only have chain keys, and grant powers to the individual keys of their members: the collective grants powers to its members, not to keys. There is no member key."). A signature act carries no key any more (its key 1 retired, Agreements "Signature (type 1)"), so the thing draft 1 kept and shared, a member's key for a collective, named in the member's signature, no longer exists in MOR. Draft 1 is kept as it was.*

*Reading this document: normal text is the specification. Italic text is commentary.*

## Reassessment

*In plain words: this cMIP has nothing left to do, and should retire.*

**What it did.** *Draft 1 carried one secret among a member's own apps: the key a member made for each collective they acted for, named in their signature of the collective's founding. The app that made it sealed it to the member at their homes, so Damgar, Ummia, Edubba and Kišib could each find it and act for the collective with it.*

**What the redesign changed for it.** *Everything it carried is gone. A member now acts for a collective with the same key they act with for themselves, which every app holding the identity already has; nothing new needs to travel between the member's apps. The act a member signs for the collective names the collective in its `objects`, and Agreements judges it against the member's powers there (rule 60). The core no longer reads a signature's key, so a member key, if one were still made, would bind nothing.*

**Should it retire?** *Yes. Keeping it alive would invite apps to go on making keys the core ignores, and readers to look for keys that never come. Draft 2 retires it, as said below.*

## 1. What retiring means

1.1. **No member key is made.** An app MUST NOT make a member key, nor name one in a signature act (the core refuses a signature carrying key 1). *Client conformance.*

1.2. **None is read.** An app finding a member-key act of draft 1 sealed to its identity ignores it: it opens nothing with it and signs nothing with it. It MAY say once, in plain words, that the identity held keys for its collectives under a rule that no longer exists, and that it acts for them with its own key. *The Dubsar runner, draft 5, drops the member keys a runner file held (its 9.3).*

1.3. **Nothing is removed from the homes.** Draft 1's acts stay where they were left, sealed, as every act stays: MOR updates and deletes nothing. *They hold secrets of keys the core no longer reads, so whoever opens them gains no power in any collective.*

1.4. **Acts made with a member key under draft 1** were bound to the member's signature act, as their binding. The redesigned core reads no such binding (the relay transport cMIP draft 7 withdraws its third case): those acts count for no collective, and are shown as acts whose binding the core does not read.

1.5. **Code.** `clients/grants/src/member.ts`, and its uses in Dub, Edubba, Damgar, Ummia and Kišib, are removed by the session that moves the clients to the redesigned core. *Until then the apps' tests that found a collective fail on the core's refusal, as `wasm/README.md` lists.*

1.6. **No successor.** This cMIP names none: nothing replaces it, since a member's own key needs no sharing beyond what the identity carry Module already does.

## 2. Costs, stated

- **Draft 1's stated costs no longer apply**, and a new one replaces them, the redesign's, not this cMIP's: a member's own key is now their power in every collective they belong to, so a stolen member's key acts for each of them within that member's powers, until the member's rotation disowns it (Identity rule 34). *Draft 1's member key could be rotated away by the collective alone; a member's own key is rotated by the member.*
- **Old sealed acts stay at the homes** (1.3): a few more private acts there, unread.

## 3. Test

To run once the clients move: an app holding an identity whose homes hold a draft 1 member key acts for that collective with the identity's own key, the core judging the act; the member-key act is never opened for signing; no app makes a new one.
