**Done. The WebAssembly's code is unchanged, but binding answers move: `agreementsConsent` and `agreementsDone` on a collective's key delivery sealed only to the members acting for it in Envelopes now count, and are done (they read "not done" before); one sealed to every member but missing an Envelopes member is now not done. The co-creators point moved no answer. The MICS and the suite moved: Ummia's pinned hashes are new (below).**

# S7l: a claim's co-creators, any identities

*Session S7l, 2 November 2026, on `claude/s7i-routes` (pull request 116), beside the Dubsar Suite's round 10. The decisions are F417 and F419 (`claude/lead-records`). Only `spec/`, `core/` and `docs/` are touched, and the c-box's vectors README. No release is rebuilt, and this session records no finding of its own.*

## In plain words

A band's claim on a song may now name anyone beside the band as co-creators: a member, a producer outside it, or another collective, such as a studio. A collective counts as one creator. Each co-creator binds the claim by signing it; a collective signs through a member acting for it. Where no ownership agreement exists, the default holder is still the one who opened the claim.

## What changed

- **Texts:**
  - Agreements, "Claim (type 3)": "any co-creators may be listed beside the collective, members or not, persons or collectives, each collective counting as one creator". Its commentary names the three kinds, and says how each binds the claim: a member and an outside person by their own signature act; another collective by one signature act for it, counting under its rule (rule 58).
  - Agreements rule 58's sentence on a collective's claim.
  - The acts table's row for type 3.
  - The MICS's claim sentence ("members listed beside it" is gone).
  - The suite's checklist line for the claim.
- **Core: no change.** `WorkClaim::decode` asks only that the opener be among the creators. `work_owners` asks every other creator to sign, and `valid_sigs` already reads a collective's signature as a member's act for it, counting under its rule. The limit was in the texts alone.

## Vectors

- 5 new cases, 514 in all. Every earlier case keeps its verdict, acts and ids. All five pass on the core as it stood.
  - A collective's claim with a person who is no member beside it: not bound until that person's own signature act; then bound, the collective the default holder.
  - A collective's claim with another collective beside it: not bound until a member's signature act for that collective; then bound, the opening collective the default holder.
  - The same, a stranger's signature act naming the other collective: not bound.
- Both vectors READMEs and the c-box's are updated. `python3 core/vectors/check.py`: all 276 agree, 98 verdict cases judged. The box assembles: 8 texts, 12 vector files.

## A collective's content key (F419, decided by Nobody, allegedly)

*Plain words:* when a band holds a locked work, its content key goes to the members the band's founding names for Envelopes, not to every member. A key delivery commits the band to nothing, so the rule that every member must see every act does not reach it.

- **Texts:**
  - Agreements, beside rule 57: "A key delivery binds the collective to nothing, so this rule does not reach it." It is sealed to the members acting for the collective in Envelopes (rule 60), or public. Its commentary says rule 57 keeps a debt or a decision from being hidden, and a key delivery is neither.
  - Envelopes, the `to` field's comment.
  - The MICS's "done" bullet.
  - The suite's 1f gains the two cases.
- **Core:** `not_done` (`core/src/agreements/view.rs`) reads a collective's key delivery (Envelopes type 1) apart from rule 57. It is done where public, or sealed to every holder of the finer areas reaching it, or of the Envelopes layer's rule where none does. Before, it asked for every member.
- **Vectors:** 2 new cases, judged by "consent counts".
  - Sealed only to the member the Envelopes rule names (Ana): counts. The old core gave false.
  - Sealed to the other members, and not to Ana: not done.

## Vectors, in all

516 cases, 7 added this session. Every earlier case keeps its verdict, acts and ids. Both READMEs and the c-box's are updated. `python3 core/vectors/check.py`: all 276 agree, 98 verdict cases judged. `cargo test -p mor-core`: green.

## Ummia's pinned hashes (the MICS and the suite moved)

- `MICS_HASH = '435bfb07a4d78cce2d5f46f8ef836921edddfcb9346c718dc27efd6477a0d56c'`
- `SUITE_HASH = '1d6ae968970214aa786e8a4573c08ba53a89aacb9b0e977c300091cdbe0e5276'`
- *Corrected by the MOR lead, 2 November: the values first printed here did not match the files; these are computed from the files on this branch as Ummia's test computes them (`tagged_hash("MOR/spec", {0: kind, 9: text})`), and are the values the suite pinned (09d2e4bf, dd3e5888).*

## For the Dubsar Suite

Edubba may now allow a collective's claim with any co-creators; the core already answered it. `agreementsWorkOwners` (yours) gives the same answers as the vectors. An app delivering a collective's content key seals it to the members its Envelopes rule (or a finer area reaching key deliveries) names.

## Question

1. **Who holds a co-produced work by default.**
   - *Plain words:* with no ownership agreement, the default holder of a co-created work is the creator who opened the claim, the band, not the producer or the studio beside it. Co-creators who want shares sign an ownership agreement.
   - *Precisely:* "Claim (type 3)": "Where no ownership agreement targets it, the default holder is the creator who opened it." `work_owners` gives one `default_holder`, the opener. F417 says "ownership can be multiple IDs", which an ownership agreement already allows.
   - *Options:*
     - **(a)** keep it (as now): one default holder, the opener; co-ownership is written in an ownership agreement.
     - **(b)** every creator a default holder, in equal shares. That is a core change: `default_holder` becomes a list, and a binding's shape changes, `agreementsWorkOwners` included.
   - *Lean:* (a). A default should be the simplest safe reading, and equal shares are a guess about a co-production's terms. *Cost:* a co-creator who signs a claim and no ownership agreement holds nothing until one is signed.
