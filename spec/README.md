# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v18.md` | The core document: the map of all six MIPs. Start here. |
| `MIP-identity-draft-10.md` | Identity: the identity hash, keys, rotation, homes and receipts. |
| `MIP-text-draft-6.md` | Text: canonical text, the text act, and the bound on formats. |
| `MIP-envelope-draft-6.md` | Envelope: the act, locking, encryption keys and sealed containers, chains, media, relays. |
| `MIP-finance-draft-5.md` | Finance: receipts, obligations, payee pointers, the vault. |
| `MIP-law-draft-7.md` | Law: agreements, keepers, stakes, splits, collectives, grants; tiers, areas, lanes and clones' marks for collectives, deals by everyone's signature (F103 to F107); the first exact formats (terms, signatures, clones, key grammars, areas, resignations, records). What is still open is listed at its end. |
| `MIP-production-draft-5.md` | Production: specifications, tasks, verification rules, the trust root; an extension declares the layers it acts on (field 10, draft 5). |
| `03-MOR-freeze-test-suite-v18.md` | The freeze test suite: what must pass, run or reasoned, before the core is frozen. For builders, the specification of what to test. |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F107).

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.

*Awaiting approval:* Law draft 7, Production draft 5, core v18 and freeze test suite v18 apply F103 to F107, the answers to the redraft's questions Q1 to Q28 and its Flaws A to H. Writing them in left four flaws and four questions open (Flaws I to L, Q29 to Q32), listed at the end of Law draft 7. Until Nobody, allegedly, approves them, the drafts they replace are kept beside them: `MIP-law-draft-6.md`, `MIP-production-draft-4.md`, `02-MOR-core-v17.md` and `03-MOR-freeze-test-suite-v17.md`, which the core library and clients still implement.
