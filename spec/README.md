# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v15.md` | The core document: the map of all six MIPs. Start here. |
| `MIP-identity-draft-9.md` | Identity: the identity hash, keys, rotation, homes and receipts. |
| `MIP-text-draft-5.md` | Text: canonical text and the text act. |
| `MIP-envelope-draft-5.md` | Envelope: the act, locking, chains, media, relays. |
| `MIP-finance-draft-5.md` | Finance: receipts, obligations, payee pointers, the vault. |
| `MIP-law-draft-5.md` | Law: agreements, keepers, stakes, splits, collectives, grants. |
| `MIP-production-draft-4.md` | Production: specifications, tasks, verification rules, the trust root. |
| `03-MOR-freeze-test-suite-v14.md` | The freeze test suite: what must pass, run or reasoned, before the core is frozen. For builders, the specification of what to test. |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F97).

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.
