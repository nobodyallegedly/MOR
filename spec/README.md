# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v18.md` | The core document: the map of all six MIPs. Start here. |
| `MIP-identity-draft-10.md` | Identity: the identity hash, keys, rotation, homes and receipts. |
| `MIP-text-draft-6.md` | Text: canonical text, the text act, and the bound on formats. |
| `MIP-envelope-draft-6.md` | Envelope: the act, locking, encryption keys and sealed containers, chains, media, relays. |
| `MIP-finance-draft-5.md` | Finance: receipts, obligations, payee pointers, the vault. |
| `MIP-law-draft-7.md` | Law: agreements, keepers, stakes, splits, collectives, grants; tiers, areas, lanes and clones' marks for collectives, deals by everyone's signature (F103 to F107); before and after in a collective judged on its own sequence (F109); the first exact formats (terms, signatures, clones, key grammars, areas, resignations, records). What is still open is listed at its end. |
| `MIP-production-draft-5.md` | Production: specifications, tasks, verification rules, the trust root; an extension declares the layers it acts on (field 10, draft 5). |
| `03-MOR-freeze-test-suite-v18.md` | The freeze test suite: what must pass, run or reasoned, before the core is frozen. For builders, the specification of what to test. |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F109).

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.

*Approved by Nobody, allegedly, 1 October 2026:* Law draft 7, Production draft 5, core v18 and freeze test suite v18, applying F103 to F107 and F109 (eight passes). Nothing in them is open but the eight readings of the third pass, listed at the end of Law draft 7, to be checked at the end of the roadmap. The drafts they replace remain in the repository's history; the core library and the clients still implement Law draft 6 until they are reworked.
