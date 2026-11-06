**The freeze is being rehearsed: you can now read MOR's texts and code.**

MOR's core, the eight texts every act is written in, is about to freeze. Before it does, we rehearse: for this round, treat the texts as frozen and build on them as you would on the real thing. What you find, while building and while trying to break things, decides whether the real freeze happens as is.

**Where.** The repository is `nobodyallegedly/MOR` on GitHub. Read it at the tag **`rehearsal-1`**, not at main, so that every team reads exactly the same texts. Main may move on; the tag will not.

**Where to look, in this order:**
1. `docs/state-of-mor.md`: what exists now, in a page.
2. `spec/`: the eight texts. The MICS (`spec/02-MOR-MICS-v36.md`) is the map: start there. Then the six MIRs (Identity, Text, Envelopes, Money, Agreements, Development), and the freeze test suite (`spec/03-MOR-freeze-test-suite-v36.md`), which says what must work. `spec/README.md` names the current draft of each.
3. `cmips/cmip-collective-control-draft-6.md`: the default control model, which says how a collective decides its everyday acts. It is a cMIP, not core. The MOR Law Firm team keeps it, and anyone may write another one: Agreements rule 99 says what a control model must accept and produce.
4. `core/`: the reference verifier in Rust, and `core/vectors/`, the test vectors. A verdict there is what the texts mean in code.
5. `wasm/README.md`, the section "For the Dubsar Suite": the functions apps call, and what changed lately.
6. `clients/`, `cmips/`, `modules/`: the Dubsar Suite's apps, cMIPs and Modules. They are examples of building on the core, not the core itself.
7. Why a rule is as it is: `docs/findings/MOR-findings-log-round-2.md` (newest first), and `docs/reviews/`.

**How to behave:**
- **Read-only.** Do not push to, or open pull requests on, this repository. Build in your own space, as the Dubsar lead arranges.
- **The core is treated as frozen.** Adapt to it. If it truly cannot serve what you are building, or you can break it, that is the most useful thing you can bring back.
- **Bring findings, not fixes.** For each one, write in plain words: what you tried; what the texts or the code did; what you expected; the rule or vector involved (for example "Agreements rule 48" or a vector's id); and whether it blocks you. Send it through Nobody, allegedly, or the Dubsar lead. Do not edit the texts yourself.
- **Say what is yours to choose.** Much of what you will want belongs above the core, in a cMIP or a Module you write yourselves. Before calling something a flaw in the core, ask whether a cMIP could do it. The core holds only the shared language and the guarantees no module may break.
- **Never write the author's personal name** in anything you publish or send; write "Nobody, allegedly".
- **Safety:** test identities only; regtest or signet only, never real money; no keys, signing words, server addresses or onion addresses in anything you publish or share.

Questions about where something is, or what a rule means, go the same way as findings. "The texts don't say" is a finding too.
