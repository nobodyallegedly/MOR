# Module: Audience keys

*Draft 3, 7 November 2026. By Keep, identity safety on MOR. A Module for clients; it defines no act and fills no task (Identity, Tasks: "Key storage, backup and recovery are Modules"). Written against Identity draft 15, Envelopes draft 11 and Money draft 13 at the rehearsal commit `af2ed6f8`. Experimental: test identities only until MOR is frozen. No fee: free to use, copy and replace.*

*Draft 3 is draft 2 (`module-audience-keys-draft-2.md`, which stays) with three changes:*
- *A refund rail for every period, derived from the paper, on-chain, spendable only from the paper, so a refund the core owes always has somewhere to land (Money rule 17: "a fresh identity with no pointer names one"). Asked by Hop and The Back Row (`Keep-Hop-agreed-1`); sections 2, 4 and 6.*
- *The restore's questions spread over minutes through the phone's routing layer, and no line used until every answer is in, the line's first identity published as soon as step 1 settles. From Pointer, its first implementer (`Pointer-Keep-agreed-1`, Keep's closing note to Pointer); section 5.*
- *The subscriber's screen gains a fifth sentence, on refunds, and the paper is said first to be a key to money (The Back Row, `statements-for-people-draft-2`); section 6.*

*It stands on the texts as they are: nothing in it waits on a change to the core.*

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

A subscriber who pays from a fresh identity each period needs a new identity, a new bare key for the measurer's record, and somewhere a refund can land, every period, without typing anything, and without a stolen phone giving away the past.

One paper, made once, is the root of everything. The phone holds a **line**: a state that moves forward one step each period and forgets the step before. Whoever takes the phone gets the current period, and any period still open for contest, and can follow the line forward, never back. Every time the paper is typed on a new phone, it starts a **new line**, named by the period it begins in, so it can never be a line a thief already holds. The periods still open come back from the paper. Refunds land at addresses only the paper can spend.

## 1. Words

- **Audience paper.** A seed of 32 bytes, written as words in the form the Module that carries it defines (Identity, "No form for any secret"), made once per subscriber and never changed. It is not the main identity's chain-key paper, which changes at every change of keys.
- **Bundle.** The collective whose pass the subscriber buys, named by its identity hash `C`. One paper serves any number of bundles; each gets its own lines.
- **Period.** The numbered interval the bundle's terms define, from 0. The period number is public: every subscriber of one bundle is in period t at the same time.
- **Line.** One forward chain of states derived from the paper for one bundle, named `(s, k)`: the period s at which it began, and a counter k, from 0, for a second or third line begun in the same period.
- **Window.** The time after a period's record during which its purchase may be contested, as the bundle's terms set it.
- **Home set of a version.** The homes, with their addresses exactly as written, that a version of the bundle's terms names for period identities.
- **Refund rail.** The rail a payer's claim names (Money, payment claim, key 7) for money owed back on that payment.

## 2. Derivation

All derivations use HKDF-SHA256 (RFC 5869). Integers are written as 4 bytes, big-endian. Keys of a signature or encryption scheme are made from a 32-byte output as that scheme's specification makes a key from a seed.

- **Line root:** `L(s,k) = HKDF(paper, "keep/audience/line" || C || s || k)`.
- **Line state:** `S(s,k,0) = HKDF(L(s,k), "keep/audience/start")`, and `S(s,k,t+1) = HKDF(S(s,k,t), "keep/audience/next")`. Every line starts at the bundle's period 0; a line begun at period s is first held at `S(s,k,s)`, reached by stepping forward.
- **A period's signing key:** `HKDF(S(s,k,t), "keep/audience/signing")`.
- **A period's bare key** for the measurer's record: `HKDF(S(s,k,t), "keep/audience/bare")`.
- **A period's chain key:** `HKDF(L(s,k), "keep/audience/chain" || t)`, from the line root, never from the state.
- **A period's genesis values:** salt `HKDF(L(s,k), "keep/audience/salt" || t)`, first 16 bytes; nonce `HKDF(L(s,k), "keep/audience/nonce" || t)`, first 24 bytes; content key `HKDF(L(s,k), "keep/audience/content" || t)`.
- **A period's refund key** (new in draft 3): `HKDF(L(s,k), "keep/audience/refund" || t)`, from the line root, never from the state, made into a single-key on-chain receiving address as the on-chain rail Module makes one from a key. The refund rail is that rail Module with that address.

*The signing and bare keys come from the state, which the phone holds. The chain key, the genesis values and the refund key come from the line root, which only the paper rebuilds. The phone keeps the genesis values and the refund addresses it will need, as it keeps the commitments (section 4), and never a refund key.*

*Deriving the salt changes nothing a verifier sees: the core asks for it to be unguessable by others (Envelopes, inside field 10), and a value derived from a secret paper is. The nonce is used once, under a content key used once.*

## 3. A period's identity

The genesis of a period identity is fixed by the paper, the bundle and the period, so the same paper always rebuilds the same identity:

- its signing key and its chain-key commitment, from section 2;
- the home set of the version of the bundle's terms in force when the period began, its addresses exactly as written, with no home rule or audit beyond what that version names;
- no declarations: no pointer, vault or clock;
- on its outside, the nonce and the content key from section 2;
- on its inside, the salt from section 2, and no hint (field 9) or reference.

The identity is the genesis act's id (Identity, "Identity hash").

**Every payment claim a period identity signs names its period's refund rail** (key 7) (new in draft 3). *A period identity has no payee pointer, and declares no vault, so a refund to its refund rail counts in full (Money rule 17: "A payer that declares no vault has no vault rule").*

## 4. What the phone holds

*Client conformance.*

1. **The current state** `S(s,k,t)` of the line in use, and nothing earlier once the period changes: the client computes the next state, then overwrites the old one.
2. **The signing and bare keys of each earlier period whose window is still open**, and no others. Once a window closes, that period's keys are overwritten.
3. **For the next periods of the line in use, at most 36:** the chain-key commitments, the genesis values and the refund addresses, computed from the paper when the line began. None of them reveals a key.
4. **Never the paper, a line root, a chain key or a refund key.**

**Every time the paper is typed, a new line begins** (section 5), including when the 36 periods run out.

## 5. Typing the paper: a new line, and the open periods back

*Client conformance.* Whenever the paper is typed, at setup, after a loss or a theft, on a new phone, or when the 36 periods run out:

1. **Name the new line.** Let t be the current period. For k = 0, 1, 2 and so on, derive the period-t identity of line `(t, k)` and ask the homes whether it exists. The first k with none is the new line `(t, k)`.
2. **Begin it at once.** As soon as step 1 settles, and before step 3's questions, make and publish its period-t identity, so that a later typing in the same period sees it in step 1. *(Order made explicit in draft 3, from Pointer: a restore cut off in step 3 then costs only a line, which the next restore skips.)*
3. **Find the periods still open.** For each earlier period p whose window is still open, find the line that was in use at p: for s = p, p - 1, p - 2 and so on, back at most 36 periods, and for k = 0, 1, 2 and so on, ask whether the period-p identity of line `(s, k)` exists. Take the latest s, and the highest k at that s, that does. Rebuild that period's signing and bare keys from the paper.
4. **Compute** the new line's next commitments, genesis values and refund addresses, then forget the paper.

**How the questions are asked** (new in draft 3, from Pointer): each on its own connection; through the phone's routing layer where it has one; spread over minutes, never fired at once. Where the bundle's terms changed the home set of a period, the client asks under each version's home set in force since that line could have begun. **The new line is used for nothing until every question is answered**, save the first identity of step 2. The subscriber sees that their periods are being restored, with progress.

*A new line is named by the period it begins in, and every line a thief could hold began earlier, or is seen in step 1. So the new line is never a line anyone else holds. Starting a new line costs nothing, so the client does it every time the paper is typed, without asking whether there was a theft.*

## 6. Collecting refunds (new in draft 3)

*Client conformance.* A client holding the paper finds refunds by deriving the refund address of every period of every line it has found, and looking for coins at each. It spends each period's refund in a transaction of its own, never two periods' together.

*Spending two periods' refunds together links them on the chain; that is why each is collected alone.*

## 7. Five sentences, for the subscriber's screen

*These are the sentences clients may show verbatim, citing this Module by its hash. The first four are draft 2's, unchanged; the fifth is new in draft 3.*

> **You lose your phone, and kept your paper.** Type your paper on a new phone. Your past periods come back, and you can still contest any period whose window is open.
>
> **You lose your phone, and lost your paper.** Your past periods are gone, and with them your right to contest them. Nobody can prove they were yours, which is what keeps them private. Your main identity is not affected.
>
> **Your phone is stolen.** Whoever has it can act as your current period, and as any period still open for contest: read it, and sign for it. They cannot reach periods that have closed.
>
> **Your phone is stolen, and you restore from your paper.** Your new phone starts a new line the thief cannot follow. They keep only the periods the stolen phone held, and anything they make on your old line from then on is theirs, not yours.
>
> **Refunds come back to your paper.** Money owed back for a period goes to an address only your paper can spend, so you can collect it even years later. Collect each period's refund on its own: collecting two together shows they were both yours.

*The line above them, from The Back Row and Keep's statements for people, draft 2:* "Your paper is a key to your money and to your privacy."

## 8. Stated costs

- **Deletion is a promise of the client.** A phone that does not truly overwrite an old state keeps the past within a thief's reach. Nothing can prove a device forgot a key.
- **A thief can follow the old line forward.** Until the paper is typed again, the thief can derive every later period of that line. After that, those periods are no longer the subscriber's.
- **A thief holding a period's key can name their own refund rail** in a claim of their own for that period. Draft 3 does not stop that; it limits it to the periods the stolen phone held.
- **Typing the paper asks the homes questions.** A few for the new line (step 1), and up to 36 per open period, times the home-set versions (step 3), spread out and each on its own connection. A home serving many of them could still try to link them by timing.
- **The genesis is fixed by the derivation.** A client that adds its own random values, a hint or another home makes identities this Module cannot rebuild. The bundle's terms must write each version's home set once and never rewrite it.
- **The 36 periods run out.** The paper is typed once more, and a new line begins.
- **Refunds are on-chain only.** A refund rail that a phone can name without holding a key needs an address derivable offline, which Lightning does not give.
- **One paper for all periods and bundles.** Whoever holds the paper can link every period of every line of every bundle, and spend every refund. That is why it stays on paper.

## 9. Test, as Pointer will run it

On a test network: a paper typed, lines found, a new line begun; the old line's next period unreachable from the new phone; a period identity rebuilt from the paper alone, its id equal to the one first published; a lapsed subscriber, with no period in the last three, typing the paper and never beginning an old line again; the same paper, two bundles, no identity in common. New in draft 3: a refund paid to a period's refund rail, found and spent from the paper alone years of test periods later; a stolen phone that cannot spend it.

## 10. Dependencies

The Identity MIR (genesis; "Identity hash"; "No form for any secret"). The Envelopes MIR (the act's outside fields 4 and 5; inside fields 9 and 10). The Money MIR (payment claim, key 7; rule 17). The on-chain rail Module, for making an address from a key. The bundle's terms, for the period numbering, the window and the home sets. The head statement cMIP, for asking homes about a period's identity, on that period's own connection.
