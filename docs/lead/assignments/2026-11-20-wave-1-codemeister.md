To the codemeister, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. MOR's wave one in the new stint: understanding. Running and reading only: no texts, code, vectors or cMIPs change in the repository.

*(The common opening, `docs/lead/assignments/2026-11-20-wave-1-common.md`, is carried whole in the prompt.)*

## The task

**Run the real acts of the round through the verifiers, and record what each one answers and why.**

The four findings that would change what a verifier answers (from the handover; my selection):
1. **Counting across versions:** assents to a replaced version, forks healed by resolves, "in force at a deadline" (the rerun's seven forked entries; the count's doubts D2 and D3; `hosts/` and `count-rerun.*` in the data).
2. **"Exactly these acts":** three honest lists, three hashes (Turnstile, day five window one).
3. **"Unchecked":** a cMIP named but not held (the count, act e42cb8e2…).
4. **The thief's rotation:** valid by every rule (The Back Row, day five window one; clusters, day four window three).

For each, take the acts from the data (`feeds/`, `windows/*/acts/`) and run:
- the round's kit (the version each window used, from its `kit/`), and the postman's code at 74739bb7 where it matters;
- `tools/agreements-check` (branch `claude/round-2-postman`), and verifier 2 (`verifier2/`, pull request 184) against draft 25 and encoding 2.

Record, per act or set: the answer of each verifier, the rule it applied, and where they differ, the line of code and the line of text that differ. Name each difference as one of: the texts read two ways; the code mistranslates the text (cite your build list, pull request 194, if it is already there: T1 and the seven translation errors); the kit's own shortfall; or nothing differs and the readers counted by hand.

Also, as data for the map: how many acts of each type and kind the feeds hold, and how many the kit answered "unchecked", "not shown" or "invalid", by home. A script that reads the data in place and writes only counts.

## What you return

`docs/code/round-2-verifier-answers.md` (branch `claude/round-2-verifier-answers`, a pull request, no merge), with any scripts under `tools/round-2/` reading the data from a path given at run time, never copying it. No fix is made, and no code under `core/`, `verifier2/` or `tools/agreements-check` changes. Give your session prompts to Nobody, allegedly, whole, in code boxes, and say how many sessions. Report back to me short: per finding, whether the bytes give one answer or two, and your questions, one at a time.
