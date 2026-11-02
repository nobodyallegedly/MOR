**Done. The WebAssembly and every binding's answer are unchanged: the core already let any co-creators sit beside a collective, so only the texts and the vectors moved. The MICS and the suite's texts moved, so Ummia's pinned hashes are new (below).**

# S7l: a claim's co-creators, any identities

*Session S7l, 2 November 2026, on `claude/s7i-routes` (pull request 116), beside the Dubsar Suite's round 10. The decision is F417 (`claude/lead-records`). Only `spec/`, `core/` (vectors only) and `docs/` are touched, and the c-box's vectors README. No release is rebuilt, and this session records no finding of its own.*

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

## Ummia's pinned hashes (the MICS and the suite moved)

- `MICS_HASH = '09aeabbfb7ddb636b43f34bf8bbf649726fd45220e60ed58e661329771993736'`
- `SUITE_HASH = 'df0bdd86bc9c271c8a421a26c676aa7d1f65f9b5790fedb17951adbc9f162486'`

## For the Dubsar Suite

Edubba may now allow a collective's claim with any co-creators; the core already answered it. `agreementsWorkOwners` (yours) gives the same answers as the vectors.

## Question

1. **Who holds a co-produced work by default.**
   - *Plain words:* with no ownership agreement, the default holder of a co-created work is the creator who opened the claim, the band, not the producer or the studio beside it. Co-creators who want shares sign an ownership agreement.
   - *Precisely:* "Claim (type 3)": "Where no ownership agreement targets it, the default holder is the creator who opened it." `work_owners` gives one `default_holder`, the opener. F417 says "ownership can be multiple IDs", which an ownership agreement already allows.
   - *Options:*
     - **(a)** keep it (as now): one default holder, the opener; co-ownership is written in an ownership agreement.
     - **(b)** every creator a default holder, in equal shares. That is a core change: `default_holder` becomes a list, and a binding's shape changes, `agreementsWorkOwners` included.
   - *Lean:* (a). A default should be the simplest safe reading, and equal shares are a guess about a co-production's terms. *Cost:* a co-creator who signs a claim and no ownership agreement holds nothing until one is signed.
