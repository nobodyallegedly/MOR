# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v19.md` | The core document: the map of all six MIPs. Start here. Version 19 names Law draft 8 (in draft, awaiting approval). |
| `02-MOR-core-v18.md` | The core document as approved on 1 October 2026; kept until version 19 is approved. |
| `MIP-identity-draft-10.md` | Identity: the identity hash, keys, rotation, homes and receipts. |
| `MIP-text-draft-6.md` | Text: canonical text, the text act, and the bound on formats. |
| `MIP-envelope-draft-6.md` | Envelope: the act, locking, encryption keys and sealed containers, chains, media, relays. |
| `MIP-finance-draft-5.md` | Finance: receipts, obligations, payee pointers, the vault. |
| `MIP-law-draft-8.md` | Law draft 8, awaiting approval: draft 7 with Flaw B1 (a rotation declaring no new agreement carries forward the agreement in force, recorded clones included) and the answers B2 to B13 written in, among them the abandonment declaration's exact format (B12) and the resolution of a fork of records (B11). Then Flaw B14 (an automatic seat by succession: the successor in the departed member's place in the keys, thresholds unchanged, the used plan dropped), B15 (several members sign one declaration of absence) and B16 (C7's recovery rotation is the one removing the declared member), answered by Nobody, allegedly, and written in. Open at its end: Flaws B17 to B19 and the points B14's answer leaves open, found writing them in |
| `MIP-law-draft-7.md` | Law, as approved on 1 October 2026; kept until draft 8 is approved: agreements, keepers, stakes, splits, collectives, grants; tiers, areas, lanes and clones' marks for collectives, deals by everyone's signature (F103 to F107); before and after in a collective judged on its own sequence (F109); the first exact formats (terms, signatures, clones, key grammars, areas, resignations, records). What is still open is listed at its end. |
| `MIP-production-draft-5.md` | Production: specifications, tasks, verification rules, the trust root; an extension declares the layers it acts on (field 10, draft 5). |
| `03-MOR-freeze-test-suite-v19.md` | The freeze test suite, version 19, awaiting approval: version 18 with Law draft 8 applied. |
| `03-MOR-freeze-test-suite-v18.md` | The freeze test suite as approved on 1 October 2026; kept until version 19 is approved: what must pass, run or reasoned, before the core is frozen. For builders, the specification of what to test. |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F109).

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.

*Approved by Nobody, allegedly, 1 October 2026:* Law draft 7, Production draft 5, core v18 and freeze test suite v18, applying F103 to F107 and F109 (eight passes). Nothing in them is open but the eight readings of the third pass, listed at the end of Law draft 7, to be checked at the end of the roadmap. The drafts they replace remain in the repository's history; the core library and the clients still implement Law draft 6 until they are reworked.

*Drafted 1 October 2026, not yet approved:* Law draft 8, core v19 and freeze test suite v19 (Flaw B1, B2 to B13 and Flaw B14 to B16, recorded under F109), on the branch `claude/law-draft-8-code-rdvox0`, with the core library and the repo and collective clients reworked to them. The approved drafts they would replace stay here until Nobody, allegedly, approves them.
