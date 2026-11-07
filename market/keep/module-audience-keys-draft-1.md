# Module: Audience keys

*Draft 1, 6 November 2026. By Keep, identity safety on MOR. A Module for clients; it defines no act and fills no task (Identity, Tasks: "Key storage, backup and recovery are Modules"). Written against Identity draft 15 at the rehearsal commit `af2ed6f8`. Experimental: test identities only until MOR is frozen. No fee: free to use, copy and replace.*

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

A subscriber who pays from a fresh identity each period needs a new identity, and a new bare key for the measurer's record, every period, without typing anything, and without a stolen phone giving away the past.

One paper, made once, is the root of everything. The phone holds a **line**: a state that moves forward one step each period and forgets the step before. Whoever takes the phone gets the current period, and any period still open for contest, and can follow the line forward, never back. After a theft or a loss, the paper starts a **new line** on a new phone. The old periods come back from the paper, and the thief's copy follows a line the subscriber never uses again.

## 1. Words

- **Audience paper.** A seed of 32 bytes, written as words in the form the Module that carries it defines (Identity, "No form for any secret"), made once per subscriber and never changed. It is not the main identity's chain-key paper, which changes at every change of keys.
- **Period.** The numbered interval the bundle terms define. The period number is public: every subscriber is in period t at the same time.
- **Line.** One forward chain of states derived from the paper, numbered from 0. A subscriber uses one line at a time.
- **Window.** The time after a period's record during which its purchase may be contested, as the bundle terms set it.

## 2. Derivation

All derivations use HKDF-SHA256 (RFC 5869), with the audience paper's seed as input key material, and the labels below as info strings. Keys of a signature or encryption scheme are made from the 32-byte output as that scheme's specification makes a key from a seed.

- **Line root:** `L_j = HKDF(paper, "keep/audience/line" || j)`, for line j (j as 4 bytes, big-endian).
- **Line state:** `S_{j,t0} = HKDF(L_j, "keep/audience/start" || t0)`, where t0 is the period at which the line starts; then `S_{j,t+1} = HKDF(S_{j,t}, "keep/audience/next")`.
- **A period's signing key:** `HKDF(S_{j,t}, "keep/audience/signing")`.
- **A period's bare key** for the measurer's record: `HKDF(S_{j,t}, "keep/audience/bare")`.
- **A period's chain key:** `HKDF(L_j, "keep/audience/chain" || t)`, from the line root, never from the state.

*The signing and bare keys come from the state, which the phone holds; the chain key comes from the line root, which only the paper rebuilds. So the phone can make each period's identity, and only the paper can change its keys.*

## 3. What the phone holds

*Client conformance.*

1. **The current state** `S_{j,t}`, and nothing earlier, once the period changes: the client computes `S_{j,t+1}`, then overwrites `S_{j,t}`.
2. **The signing and bare keys of each earlier period whose window is still open**, and no others. Once a window closes, that period's keys are overwritten.
3. **The chain-key commitments** for the next periods of the current line: at most 36, computed from the paper at setup and at each restore. A commitment is a hash and reveals no key (Identity, genesis field 1).
4. **Never the paper, the line root, or a chain key.**

A period's identity is made from these alone: a genesis naming that period's signing key and committing that period's chain key, with the homes the bundle terms name.

*After 36 periods the commitments run out, and the subscriber types the paper again, once. Stated cost.*

## 4. Restoring from the paper

*Client conformance.* Whenever the paper is typed on a new device, for any reason, after a loss, a theft or a new phone:

1. The client finds the lines already used: for the current period and the previous one, it derives the period identities of lines 0, 1, 2 and so on, and asks the homes whether each exists, each question on its own connection, until a line has none. The highest line found is the last used.
2. It starts a **new line**, one higher than the last used, at the current period.
3. It rebuilds, from the paper, the signing and bare keys of every earlier period still within its window, on whichever line it was made.
4. It computes the next chain-key commitments of the new line, and forgets the paper.

*A restore never reuses a line, so a thief who copied the old line's state follows a line the subscriber has left. Starting a new line costs nothing, so the client does it every time, without asking whether there was a theft.*

## 5. Four cases, for the subscriber's screen

*These are the sentences clients may show verbatim, citing this Module by its hash.*

> **You lose your phone, and kept your paper.** Type your paper on a new phone. Your past periods come back, and you can still contest any period whose window is open.
>
> **You lose your phone, and lost your paper.** Your past periods are gone, and with them your right to contest them. Nobody can prove they were yours, which is what keeps them private. Your main identity is not affected.
>
> **Your phone is stolen.** Whoever has it can act as your current period, and as any period still open for contest: read it, and sign for it. They cannot reach periods that have closed.
>
> **Your phone is stolen, and you restore from your paper.** Your new phone starts a new line the thief cannot follow. They keep only the periods the stolen phone held, and anything they make on your old line from then on is theirs, not yours.

## 6. Stated costs

- **Deletion is a promise of the client.** A phone that does not truly overwrite an old state keeps the past within a thief's reach. Nothing can prove a device forgot a key.
- **A thief can follow the old line forward.** Until the subscriber restores, the thief can derive every later period of that line. After a restore, those periods are no longer the subscriber's.
- **Finding the used lines asks the homes.** Each question is on its own connection, but a home serving many of them could still try to link them by timing. It asks only about two periods and a few lines.
- **The commitments run out.** After 36 periods, the paper is typed once more.
- **One paper for all periods.** Whoever holds the paper can link every period of every line. That is why it stays on paper.

## 7. Dependencies

The Identity MIR (genesis, field 1; "No form for any secret"). The bundle terms of the collective the subscriber pays, for the period numbering and the window. The head statement cMIP, for asking homes about a period's identity, on that period's own connection.
