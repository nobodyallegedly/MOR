# The encoding, second edition: report

15 November 2026. Written by Claude, for the MOR lead, and for the Dubsar Suite lead's briefing of the players. A record of work, not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

**What this step answers** (the ledger's exchange "Clean up first", his words): "How many sessions to clean it up first? We can always provide new hashes." And: "Write it please."

## In plain words

Before the players start, the text and the bytes they are given were cleaned so that two honest writers cannot write the same act in two ways, and so that the examples teach good habits. Fable's review of the first encoding found the places where they could; the first encoding's own report listed eighteen questions. Each is now answered, in a small draft 25 of the rules and a second edition of the bytes, and the code, the checker and the examples follow them.

Nothing a well-written act means has changed. What changed is that a few acts that could be written two ways now have one way, a few sentences that read two ways now read one, and every example act now stands where a real one would: in its signer's own sequence, after the act its signer made before it.

Every change is the MOR lead's, as technical wording. None changes anything Nobody, allegedly, decided, and none was found to touch one.

## What changed from encoding 1, and why (one line each)

1. **New spec hashes**, because the texts changed: acts under the old ones are now "not this encoding".
2. **The receiver says what it is**: `[0, position]` for one of the Terms' own parties, `[2, root]` for an agreement; a signer's identity hash can no longer pass as an unknown agreement's root (Fable's sharpest point).
3. **An agreement as receiver is always named by its root**, even when it is a party; pointing at its place in the list is refused, with a sentence saying so.
4. **A resolving update of Terms carries only what resolving needs** (replaces, agreement, resolves, continues, previous, and what it relied on): one that also carries parties, authors or words is refused, so it never "states" Terms it does not mean.
5. **A resolve is a Statement of its own kind** (kind 3): a player who forks their own line in two windows knows exactly what to write, and it is never also an assent.
6. **A confirmation, the tie between two halves and a buyer's contest name the settlement, never the payment**, so two honest confirmations of one payment name the same act and tie. The report block is published again as proposal 4 with that one change.
7. **A field the text does not give is refused**, and the draft no longer says it is "left unread"; what is still left unread is listed once.
8. **Two powers of one kind**: either rule saying yes is enough, now written.
9. **A private act held without its key**: the line before is unchecked, not invalid, now written (the one vector Fable could not reach from the text).
10. **One order for the cases of invalid**, the code's, in both texts; **one rule for one fault** (a party `[0, "A"]` is E9's; a cMIP not by fingerprint is G2.1's).
11. **The spec hash said aloud**: of the file as published on its branch; acts under it stay its own; a later draft is a new specification.
12. **The author's assent names the Terms act** in `previous`: the vectors showed a fork in the author's own line.
13. **The vectors chained**: every act stands in its signer's real sequence (`prev`, position, running summary), several acts per signer, and within each agreement every act names its signer's act before it.
14. **The report's other questions** written where a builder meets them: `continues` not among `resolves` is refused (3); a K7 kind is its cMIP whatever its parameters (6); `relies_on` naming what another field names is read once (7); a rejected act held makes the act naming it invalid (9); places and clocks stay 32 bytes until their layer exists (10); the bake is cited in both envelope fields (11); the report keeps its block's own hash (13); a socket written as bare text is refused (17); one role filled many times, never two identical roles (18).

## The new spec hashes and types

| Act | Spec hash | Type |
| --- | --- | --- |
| Terms | `dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c` (draft 25) | 0 |
| Statement | `dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c` (draft 25) | 1 |
| Report (a proposal) | `7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854` (`report-block-4.md`) | 0 |

Each spec hash is computed as the core computes a MIR's from its file (Development rule 26): `tagged_hash("MOR/spec", {0 => 4, 9 => text})`, the text being the file with its final line break removed. A test recomputes both from the files, in Rust and in Python. They are of the files as published on branch `claude/agreements-clean-1-hahuwn`.

## The hashes for the briefing

| File | Spec hash, as the core computes one | Plain SHA-256 of the file's bytes |
| --- | --- | --- |
| `docs/agreements-from-scratch/draft-25.md` | `dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c` | `SHA_DRAFT_25` |
| `docs/agreements-from-scratch/encoding-2.md` | `SPEC_ENCODING_2` | `SHA_ENCODING_2` |
| `docs/lead/proposals/report-block-4.md` | `7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854` | `SHA_REPORT_BLOCK_4` |

## What was written

- **The rules**: `docs/agreements-from-scratch/draft-25.md` (draft 24 with the changes above, nothing else), `reasons-25.md` (with six passages marked "(draft 25)"), and `history.md`, Part R, one table of the changes with where each comes from and where it landed. `draft-24.md`, `reasons-24.md` and `report-block-3.md` stay as they were.
- **The report block**: `docs/lead/proposals/report-block-4.md`, proposal 3 with only R2's sentence (and its plain words) changed, marked [4], the MOR lead's.
- **The bytes**: `docs/agreements-from-scratch/encoding-2.md`. `encoding-1.md` and its report stay as they were, for history.
- **The code**, brought to encoding 2 in place (`core/src/agreements_new/`, `wasm/src/agreements_new_js.rs`, `tools/agreements-check`): the new spec hashes, the receiver's two forms, a resolving update's fields, the resolve kind (`"resolve"` in the binding), the settlement in the doc comments and messages. The old core (`core/src/agreements/`) is unchanged.
- **The vectors** (`core/vectors/agreements-new/`), regenerated from the code: 44 valid and 116 invalid cases. Every act stands in its signer's sequence; a new test (`core/tests/agreements_new_vectors.rs`) and the Python check each rebuild every sequence from both files and check every act's `prev`, position and running summary.
- **Checks run before the push**: `cargo test --workspace --locked` passed in full (815 tests); the vectors regenerated byte for byte; `python3 core/vectors/check.py` agreed on every vector (the 160 new cases, the sequences and both spec hashes included); `mor-wasm` built for `wasm32-unknown-unknown`; the checker tool run by hand on a fork and its resolve.

## Where writing it needed a choice

Each is the MOR lead's, as technical wording, and is marked [lead] in `encoding-2.md`, section 11, or said in `history.md`, Part R. None reaches a rule Nobody, allegedly, decided.

- **A resolving update of Terms may name what it relied on** (`relies_on`). "Carries nothing else" read literally would refuse it; a resolving update made under a power may rest on a judge's decision, and G13.2 asks every act to name what it relied on. It is a naming, not words of its own.
- **A resolve may carry `for` and `under`, `answers`, `relies_on` and `settlement`**, as any Statement; only `content` is refused, as for an assent. The brief asked that it carry nothing that makes it also an assent, a counter signature or a contest; none of these does.
- **For a Statement, `resolves` without `continues` can no longer be written**: only a resolve carries the two fields, and it carries both. Draft 24's reading of such an act ("resolves nothing") now applies to Terms only.
- **The receiver's first items are 0 and 2**, E11's ("a party of ours", "an agreement"). A position beyond the list is still read as "no one receives, not shown" (a note): the brief asked only that a position naming an agreement be refused.

## Fable's section 3 cases, and what was done

| Fable's case | What was done |
| --- | --- |
| A private act held without its key: the text gave invalid, the vector pass | The text now says unchecked, not invalid (draft 25, G6.1; encoding 2, E23) |
| A resolving update in one signer's line: the text did not fix its kind | The resolve, kind 3 (draft 25, section 3.2; E15, E20); new vectors: a real fork in A's line and its resolve, one made under a power, and the act after it |
| A party `[0, "A"]`: E9 or E5 | E9, the party's form; "One fault, one rule" (draft 25, section 3; encoding 2, section 9) |
| The body's cMIP not by fingerprint: G2.1 or G2.2 | G2.1 in both texts and the code's messages |
| An author's assent with `previous` `[]`: a fork of the author's own line | The vector fixed (the assent names the Terms act); draft 25, section 3.2, and E17 say it |
| Every act a first act in the act format | Every act chained in its signer's sequence; the README says so in its first lines |

## What a stranger's reading found

STRANGER

## For the Dubsar Suite lead's briefing: what a player will trip on first

Fable's list, rewritten for encoding 2, in the order a player will meet it.

1. **Chain every act into your own sequence.** The act format's `prev`, position and running summary are your identity's whole sequence, across every act you sign, on every device. The vectors' values are their test identities', never yours: give `makeEveryday` your sequence so far.
2. **Two lines, both written.** `prev` is your whole sequence; the payload's `previous` is your line in this one agreement. If you signed the Terms, your assent's `previous` is that Terms act. If you have made no act in the agreement yet, it is `[]`.
3. **Use the spec hashes as given** (above). Never recompute them from your own copy of a text: one changed byte, and every act you write is "not this encoding". Acts written for encoding 1 are now "not this encoding" too.
4. **The receiver says what it is.** `[0, position]` for one of your Terms' own parties (a signer or a role); `[2, root]` for an agreement, even one that is among your parties. A bare number, a bare hash, or a signer's identity hash is refused.
5. **If you fork your own line** (two windows, a restored backup), write a **resolve**: a Statement of kind 3, naming both tips in `resolves` and the one that goes on in `continues`, with no content, its `previous` the act both tips name. Your next act names the resolve. Do not put `resolves` on an assent or a contest: it is refused.
6. **A resolving update of Terms carries only** `replaces`, `agreement`, `resolves`, `continues`, `previous`, and `relies_on` if it relied on something. Parties, authors, words or anything else make it refused.
7. **Name the settlement, never the payment**, in a confirmation's call and in a buyer's contest's `settlement`: it is the act both sides can see, and two confirmations of one payment must name the same act to tie.
8. **A role needs three things and the Terms a fourth**: kind, `what` (not for future), a spot socket, and `in_force` on the Terms. Lack one and the Terms are invalid, not rejected: the act exists and counts for nothing.
9. **Every socket has two items. Write `null` for no parameters. Leave the field out for an empty socket.** A socket written as a bare text address is refused.
10. **No empty list, and sets in byte order** (`authors`, `relies_on`, `powers`, `calls`, `answers`, `resolves`). Use the library's builders; do not sort by hand. One spot that several fill is one role, never two identical ones.
11. **The maps are closed.** A field of your own makes the act refused. Anything new goes in a Statement of a kind your cMIP defines, in its `content`.
12. **The first Terms act has no `agreement`.** Its own act id is the root. A Statement on the first version has `agreement` and `terms` equal.
13. **An assent, a counter signature and a resolve carry no `content`.**
14. **A report is another act**: another spec hash, no `previous`, one call. It still stands in your sequence.
15. **"Pass" is the checker's word, not the grammar's.** It does not say in force, bound, received or valid, and it passes both tips of a fork: the grammar's answers come with the grammar verifier, later.
