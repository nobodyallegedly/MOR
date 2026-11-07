# Module: Audience keys

*Draft 2, 6 November 2026. By Keep, identity safety on MOR. A Module for clients; it defines no act and fills no task (Identity, Tasks: "Key storage, backup and recovery are Modules"). Written against Identity draft 15 and Envelopes draft 11 at the rehearsal commit `af2ed6f8`. Experimental: test identities only until MOR is frozen. No fee: free to use, copy and replace.*

*Draft 2 is draft 1 (`module-audience-keys-draft-1.md`, which stays) with the restore made to work from the paper alone. Two gaps were found by Pointer, as this Module's first implementer, and one by Keep while fixing them:*
- *A period identity could not be rebuilt from the paper: its genesis's id commits to a random salt, a nonce, a content key and the homes. All four are now fixed by the derivation and the bundle's terms (section 3).*
- *A restore could not know where an old line started. Every line's state now starts at the bundle's period 0, and a line is named by the period at which it began (section 2).*
- *(Keep) The same paper used for two bundles gave both the same identities, linking them. The bundle's collective is now in every derivation (section 2).*
- *(Keep) Draft 1's restore found the used lines by asking only about the current and previous periods, which found nothing for a subscriber who had paid no period lately, and so could start an old, stolen line again. A line is now named by the period it began, so a new one never repeats an old one (section 5).*

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

A subscriber who pays from a fresh identity each period needs a new identity, and a new bare key for the measurer's record, every period, without typing anything, and without a stolen phone giving away the past.

One paper, made once, is the root of everything. The phone holds a **line**: a state that moves forward one step each period and forgets the step before. Whoever takes the phone gets the current period, and any period still open for contest, and can follow the line forward, never back. Every time the paper is typed on a new phone, it starts a **new line**, named by the period it begins in, so it can never be a line a thief already holds. The periods still open come back from the paper.

## 1. Words

- **Audience paper.** A seed of 32 bytes, written as words in the form the Module that carries it defines (Identity, "No form for any secret"), made once per subscriber and never changed. It is not the main identity's chain-key paper, which changes at every change of keys.
- **Bundle.** The collective whose pass the subscriber buys, named by its identity hash `C`. One paper serves any number of bundles; each gets its own lines.
- **Period.** The numbered interval the bundle's terms define, from 0. The period number is public: every subscriber of one bundle is in period t at the same time.
- **Line.** One forward chain of states derived from the paper for one bundle, named `(s, k)`: the period s at which it began, and a counter k, from 0, for a second or third line begun in the same period.
- **Window.** The time after a period's record during which its purchase may be contested, as the bundle's terms set it.
- **Home set of a version.** The homes, with their addresses exactly as written, that a version of the bundle's terms names for period identities.

## 2. Derivation

All derivations use HKDF-SHA256 (RFC 5869). Integers are written as 4 bytes, big-endian. Keys of a signature or encryption scheme are made from a 32-byte output as that scheme's specification makes a key from a seed.

- **Line root:** `L(s,k) = HKDF(paper, "keep/audience/line" || C || s || k)`.
- **Line state:** `S(s,k,0) = HKDF(L(s,k), "keep/audience/start")`, and `S(s,k,t+1) = HKDF(S(s,k,t), "keep/audience/next")`. Every line starts at the bundle's period 0; a line begun at period s is first held at `S(s,k,s)`, reached by stepping forward.
- **A period's signing key:** `HKDF(S(s,k,t), "keep/audience/signing")`.
- **A period's bare key** for the measurer's record: `HKDF(S(s,k,t), "keep/audience/bare")`.
- **A period's chain key:** `HKDF(L(s,k), "keep/audience/chain" || t)`, from the line root, never from the state.
- **A period's genesis values:** salt `HKDF(L(s,k), "keep/audience/salt" || t)`, first 16 bytes; nonce `HKDF(L(s,k), "keep/audience/nonce" || t)`, first 24 bytes; content key `HKDF(L(s,k), "keep/audience/content" || t)`.

*The signing and bare keys come from the state, which the phone holds; the chain key and the genesis values come from the line root, which only the paper rebuilds. The phone keeps the genesis values it will need, as it keeps the commitments (section 4).*

*Deriving the salt changes nothing a verifier sees: the core asks for it to be unguessable by others (Envelopes, inside field 10), and a value derived from a secret paper is. The nonce is used once, under a content key used once.*

## 3. A period's identity

The genesis of a period identity is fixed by the paper, the bundle and the period, so the same paper always rebuilds the same identity:

- its signing key and its chain-key commitment, from section 2;
- the home set of the version of the bundle's terms in force when the period began, its addresses exactly as written, with no home rule or audit beyond what that version names;
- no declarations;
- on its outside, the nonce and the content key from section 2;
- on its inside, the salt from section 2, and no hint (field 9) or reference.

The identity is the genesis act's id (Identity, "Identity hash").

## 4. What the phone holds

*Client conformance.*

1. **The current state** `S(s,k,t)` of the line in use, and nothing earlier once the period changes: the client computes the next state, then overwrites the old one.
2. **The signing and bare keys of each earlier period whose window is still open**, and no others. Once a window closes, that period's keys are overwritten.
3. **For the next periods of the line in use, at most 36:** the chain-key commitments and the genesis values, computed from the paper when the line began. Commitments and genesis values reveal no key.
4. **Never the paper, a line root, or a chain key.**

**Every time the paper is typed, a new line begins** (section 5), including when the 36 periods run out.

## 5. Typing the paper: a new line, and the open periods back

*Client conformance.* Whenever the paper is typed, at setup, after a loss or a theft, on a new phone, or when the 36 periods run out:

1. **Name the new line.** Let t be the current period. For k = 0, 1, 2 and so on, derive the period-t identity of line `(t, k)` and ask the homes whether it exists. The first k with none is the new line `(t, k)`.
2. **Begin it at once.** Make and publish its period-t identity immediately, so that a later typing in the same period sees it in step 1.
3. **Find the periods still open.** For each earlier period p whose window is still open, find the line that was in use at p: for s = p, p - 1, p - 2 and so on, back at most 36 periods, and for k = 0, 1, 2 and so on, ask whether the period-p identity of line `(s, k)` exists. Take the latest s, and the highest k at that s, that does. Rebuild that period's signing and bare keys from the paper.
4. **Compute** the new line's next commitments and genesis values, then forget the paper.

Each question is asked on its own connection. Where the bundle's terms changed the home set of a period, the client asks under each version's home set in force since that line could have begun.

*A new line is named by the period it begins in, and every line a thief could hold began earlier, or is seen in step 1. So the new line is never a line anyone else holds. Starting a new line costs nothing, so the client does it every time the paper is typed, without asking whether there was a theft.*

## 6. Four cases, for the subscriber's screen

*These are the sentences clients may show verbatim, citing this Module by its hash.*

> **You lose your phone, and kept your paper.** Type your paper on a new phone. Your past periods come back, and you can still contest any period whose window is open.
>
> **You lose your phone, and lost your paper.** Your past periods are gone, and with them your right to contest them. Nobody can prove they were yours, which is what keeps them private. Your main identity is not affected.
>
> **Your phone is stolen.** Whoever has it can act as your current period, and as any period still open for contest: read it, and sign for it. They cannot reach periods that have closed.
>
> **Your phone is stolen, and you restore from your paper.** Your new phone starts a new line the thief cannot follow. They keep only the periods the stolen phone held, and anything they make on your old line from then on is theirs, not yours.

## 7. Stated costs

- **Deletion is a promise of the client.** A phone that does not truly overwrite an old state keeps the past within a thief's reach. Nothing can prove a device forgot a key.
- **A thief can follow the old line forward.** Until the paper is typed again, the thief can derive every later period of that line. After that, those periods are no longer the subscriber's.
- **Typing the paper asks the homes questions.** A few for the new line (step 1), and up to 36 per open period, times the home-set versions (step 3), each on its own connection. A home serving many of them could still try to link them by timing.
- **The genesis is fixed by the derivation.** A client that adds its own random values, a hint or another home makes identities this Module cannot rebuild.
- **The 36 periods run out.** The paper is typed once more, and a new line begins.
- **One paper for all periods and bundles.** Whoever holds the paper can link every period of every line of every bundle. That is why it stays on paper.

## 8. Test, as Pointer will run it

On a test network: a paper typed, lines found, a new line begun; the old line's next period unreachable from the new phone; a period identity rebuilt from the paper alone, its id equal to the one first published; a lapsed subscriber, with no period in the last three, typing the paper and never beginning an old line again; the same paper, two bundles, no identity in common.

## 9. Dependencies

The Identity MIR (genesis; "Identity hash"; "No form for any secret"). The Envelopes MIR (the act's outside fields 4 and 5; inside fields 9 and 10). The bundle's terms, for the period numbering, the window and the home sets. The head statement cMIP, for asking homes about a period's identity, on that period's own connection.
