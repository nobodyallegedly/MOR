# verifier2: a second verifier for collectives' endings (Law draft 10)

*6 October 2026. An independent implementation of one part of Law, written from the
specification text alone, to be compared with the reference library. Nothing here is
the protocol: `spec/` is. Disagreements between the two are findings for Nobody,
allegedly, recorded in `docs/verifier2-report.md`.*

## What it covers

Law draft 10 on how a collective ends (`spec/MIP-law-draft-10.md`: "Made before, made
after", "Fork (type 19)", "Closing (type 20)", rules 35a, 35b, 36a, 37b, 40, 43, 44d,
47a, 47b; Identity draft 11, "Chain signature (type 16)"; findings F131 and F132):

- the two chains: history as what an act cites, transitively; before and after a line;
- acts done: sealed to every member (or public) and on the chain, else counting for nothing;
- the tie rule: an act a decision ending powers does not hold is void, the ending winning;
- adoption by citation (F131 IT2a, reading U3): an act of the collective's own key that
  counts, whose history holds a grant key's act, or acknowledges it, adopts it; a
  departure racing such a citation takes no voice off the cited act (the IC9 reading);
- forks and closings: complete only with members' chain signatures that count, under the
  constitutional change rule as rule 44d counts it, done, their line held, a fork handing
  out every obligation in its history, a closing owing nothing;
- which complete ending counts (IT1, U1, U2, U4, U4b): final once complete; a later one
  naming it, in `objects` or through a signer's chain, counts for nothing; a true tie only
  between endings sharing no signer, settled by a third naming both; a signature on an old
  proposal placed after its signer's signature on an ending naming it counts for nothing;
  an ending whose drafter leaves out an ending they signed earlier is no ending;
- what each successor owes after the fork that counts.

It does not cover byte formats, Identity validity (an input flag), the agreement in force
and its clones (an input flag), successors' founding terms (an input flag), stakes and
"holds nothing" (an input flag), rotations of the collective, or a successor's own fork.

## Files

- `law_endings.py`: the verifier. `python3 law_endings.py story.json` prints its verdict;
  `python3 law_endings.py stories/ --out verdicts/ --quiet` judges a directory.
  `--handout binding` and `--cites loose` switch one reading each (below).
- `test_law_endings.py`: one test per freeze scenario or smallest story, written from the
  text; running it also writes each story to `stories/`.
- `stories/`: those stories, as JSON; `stories/compared/`: the smallest stories of each
  disagreement with the reference, as exported, with the reference's verdicts.
- `export/export.rs`: the exporter, included as a child module at the end of
  `core/tests/law_invariants.rs` (the one change made there, test-only and ignored unless
  asked for). It draws the reference's random collective histories from a seed, writes
  each as a story in the format below, and writes the library's verdicts on it in the same
  terms. `compare.py` judges each story with this verifier and prints every disagreement;
  `shrink.py` reduces a disagreeing story to its smallest form by re-exporting it with
  fewer steps and a smaller shape; `render.py` prints a story and both verdicts in plain
  words; `group.py` groups a comparison's disagreements by their reasons; `classify.py`
  sorts disagreeing stories into the report's findings.

  To reproduce the comparison (`docs/verifier2-report.md`):

  ```
  cargo test -p mor-core --release --test law_invariants --no-run
  VERIFIER2_OUT=out VERIFIER2_SEED=1 VERIFIER2_CASES=3000 \
    target/release/deps/law_invariants-<hash> --ignored --exact verifier2_export::verifier2_export
  python3 verifier2/compare.py out --quiet --json cmp.json
  python3 verifier2/group.py cmp.json
  python3 verifier2/shrink.py out case00446 --seed 1
  ```

Python 3.11 or later, standard library only.

## The story format

One JSON object per collective:

```
{"collective": "C", "members": ["ana", "ben"],
 "rule": {"kind": "every"} | {"kind": "threshold", "n": 2},
 "areas": {"finance": {"holders": ["ben"], "threshold": 1}},
 "acts": [ ... ]}
```

Every act has `id`, `type`, `signer`, and may have `valid` (Identity; default true),
`held` (the verifier holds it; default true), `prev` (its previous act in its own
sequence), `cites` (acts it names on the collective's chain), `sealed_to_all` (default
true) and `public`, `acks` (acts it acknowledges), `area` and `sigs` (the area that reaches
it and the members whose signature acts name it), `grant` (the grant whose key signed it;
absent for the collective's own key).

| `type` | meaning | fields |
| --- | --- | --- |
| `genesis`, `rotation` | the collective's identity-chain acts (decisions) | `tips` for a rotation |
| `record` | a record (decision, a line) | `tips`, `registers`: `[{"member", "what": "resign" or "stepdown", "area"}]` |
| `grant` | a grant (decision) | `grantee`, `accepted` (default true), `area`, `sigs` |
| `revocation` | a revocation (decision) | `revokes` (the grant), `area`, `sigs` |
| `publication` | any other act of the collective's own key or of a grant key | `grant`, `within_reach`, `decision` (a grant key trying to sign a decision) |
| `obligation` | a debt in the collective's name | `creditor`, `amount`, and as a publication |
| `fork` | a fork act, signed by its drafter | `tips`, `sides`: `[{"successor", "members"}]`, `assigned`: `[{"obligation", "sides": [i]}]`, `objects` (earlier endings named), `successor_signed`: `{successor: bool}`, `successors_ok`, `agreement_ok`, `chain_act_ok`, `format_ok` |
| `closing` | a closing act | `tips`, `objects`, `holds_nothing`, `agreement_ok`, `chain_act_ok`, `format_ok` |
| `chain_sig` | a member's chain signature (Identity type 16) | `signer` (the member), `ending`, `position` (on the member's identity chain), `counts` (its homes hold it; default true) |
| `sig_act` | a signature act (Law type 1) on an ending: no member's signature | ignored |
| `payment` | a creditor's receipt toward an obligation | `signer`, `obligation`, `amount` |
| `release` | a creditor's release | `signer`, `obligation` |

## The verdict

```
{"closed_by": "F1" | null,
 "endings": {id: {"status": "no-ending" | "incomplete" | "complete", "counts": bool,
                  "signatures": {member: "counts" | "void"}, "names": [ids], "why": [...]}},
 "acts": {id: {"done": bool, "counts": bool, "why": [...], "adopted_by": id?}},
 "debtors": {obligation: [successors]}}
```

`acts[id].counts` is "this act is the collective's and counts": done, on the chain, its
area's consent met, not void by the tie rule; for a grant key's act, backed by its grant and
not void by a decision ending it, or adopted.

## Readings

Where the text left something to the implementer, this is what was taken, so that the
comparison can tell a reading from a slip. Each is a question for Nobody, allegedly, only
where the reference read it otherwise.

1. **What a fork must hand out** (`--handout`). The text: "every obligation of the
   original in that history, published or not, paid or not, save one sealed neither to
   every member nor publicly, which is never the collective's (rule 35a), one signed with
   a grant key included". Default (`done`): every obligation in the history that is done
   (sealed to every member or public, and on the chain), whether or not its area's
   holders signed it or its grant backs it. The alternative (`binding`): only obligations
   that bind the collective.
1a. **"An action citing no decision"** (`--cites`, rule 35b). Default (`strict`), taken
   after the comparison: an action's own `objects` name the decision it acts under; one
   that names nothing is on no chain, whatever its previous act cites. The first version
   of this verifier read it loosely (`loose`): a decision reached through the action's
   previous acts in its sequence sufficed, since "its own sequence's previous act counts
   as cited". The strict reading follows the format sentence, "an action names, in its
   inside's `objects`, ... the decision it acts under"; the loose one is kept as a switch
   and the disagreement it made is recorded in the report.
1b. **The agreement in force** at a record or an ending's line, added after the
   comparison: the clone written by the done record furthest along in the history that
   writes one, else the founding agreement (rule 37c, B2). A record naming another
   agreement is no line; an ending naming another is not complete. Stories that name no
   agreements skip the check.
1c. **A grant's acceptance** belongs to the grant key's act (rule 44: "the grant counts
   ... and its grantee signed to accept it"), not to whether the grant itself counts;
   changed after the comparison, where the first version folded acceptance into the
   grant's counting.
2. **A member's signature on an ending** is their earliest counting chain signature
   naming it; a chain signature by a non-member is no signature on it; a signature act
   (type 1) is none (F132).
3. **U4b** compares the drafter's chain signature on the ending with their chain
   signatures on every other held fork or closing act of the collective, whatever that
   act's own state (complete, incomplete, itself no ending). With no chain signature of
   the drafter on the ending, U4b has no reference point and does not apply (the ending
   is then incomplete anyway).
4. **Naming.** An ending names another in its `objects` directly or through the objects
   of the endings it names there; and through a signer's chain where one member's
   counting, non-void signature on it lies after the same member's on the other. The
   naming used to pick the counting ending is the transitive closure of both kinds.
5. **U4 in two steps**, as the text's reading says, not iterated further: first by
   `objects`; then, among the signatures left, by `objects` and signers' chains; the
   final naming is read from the signatures left after both.
6. **Which complete ending counts:** among the complete endings, those ordered against
   every other (naming it or named by it) are candidates; the one that counts is the
   candidate naming no other candidate; none, or more than one, and the collective is not
   ended.
7. **A closing's signers** are every member with a counting, non-void chain signature on
   it; each must be a member whose voice remains at the line, the drafter among them.
8. **Voices at an ending's line** are removed only by departures registered by done
   records in the ending's own history. Stepping down from an area removes no
   constitutional voice.
9. **A record outside the counting ending's history registers nothing** (rule 47a: after
   the line, the collective's keys count for nothing).
10. **Consent and racing departures** (rule 36a, 44d, the IC9 reading): a holder's voice
    is gone for an act when a counting record registering their departure does not hold
    the act. Where the act then fails, it is judged again with the departures racing a
    counting citation of it (an act of the collective's own key whose history holds it, or
    which acknowledges it, neither it nor the departure holding the other) set aside.
11. **Adoption** (rule 40): any act of the collective's own key that counts, a decision
    included, whose history holds the grant key's act or which acknowledges it; where an
    ending counts, only one in the ending's history.
12. **Owes nothing:** receipts signed by the creditor, summed, reach the amount, or the
    creditor's release exists; a receipt by anyone else pays nothing (Finance rule 7).
13. **An act the verifier does not hold:** an ending whose history names one is not
    complete; an action citing one is on no chain.
14. **A fork listing an obligation outside its history** is not thereby incomplete; that
    obligation is void and no successor owes it; a successor it names must still have
    signed.
15. **An ending's completeness is judged as if it were the one that counts**: its own
    line, the debts in its own history, the departures its own history registers; the
    same judgment whether or not another ending already counts (the report's finding B).
16. **A fork's successors** (N1, N4): where the story carries each successor's founding
    parties and departed holders, every successor's parties are exactly its side's
    members, and every member whose voice remains at the line on no side is among every
    successor's departed holders; shares are not modelled.

The comparison with the reference, and what it found, is in `docs/verifier2-report.md`;
the shrunk stories of each finding are in `stories/compared/`.
