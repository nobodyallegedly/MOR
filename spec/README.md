# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v20.md` | The core document: the map of all six MIPs. Start here. Version 20 names Law draft 9. *Awaiting approval.* |
| `02-MOR-core-v19.md` | Version 19, naming Law draft 8: the approved version, kept until version 20 is approved. |
| `MIP-identity-draft-10.md` | Identity: the identity hash, keys, rotation, homes and receipts. |
| `MIP-text-draft-6.md` | Text: canonical text, the text act, and the bound on formats. |
| `MIP-envelope-draft-6.md` | Envelope: the act, locking, encryption keys and sealed containers, chains, media, relays. |
| `MIP-finance-draft-5.md` | Finance: receipts, obligations, payee pointers, the vault. |
| `MIP-law-draft-9.md` | Law draft 9: draft 8 with Flaws B17 to B19 answered by Nobody, allegedly, and written in: where one person holds the safety key, the succession clone also carries a plan for the successor, naming their own successor, signed by them in it (B17); where the declared member alone holds the everyday key, the recovery rotation removing them names the signature acts on the declaration (B18, a third element of its Law declaration); in a deal, the absence authority is one identity, never a threshold of the other parties (B19). Open at its end: what B14's answer leaves open, and the readings taken writing it. *Awaiting approval.* |
| `MIP-law-draft-8.md` | *The approved draft, kept until draft 9 is approved.* Law draft 8: draft 7 with Flaw B1 (a rotation declaring no new agreement carries forward the agreement in force, recorded clones included) and the answers B2 to B13 written in, among them the abandonment declaration's exact format (B12) and the resolution of a fork of records (B11). Then Flaw B14 (an automatic seat by succession: the successor in the departed member's place in the keys, thresholds unchanged, the used plan dropped), B15 (several members sign one declaration of absence) and B16 (C7's recovery rotation is the one removing the declared member), answered by Nobody, allegedly, and written in. Open at its end: Flaws B17 to B19 and the points B14's answer leaves open, found writing them in |
| `MIP-production-draft-5.md` | Production: specifications, tasks, verification rules, the trust root; an extension declares the layers it acts on (field 10, draft 5). |
| `03-MOR-freeze-test-suite-v20.md` | The freeze test suite, version 20: version 19 with Law draft 9 applied (steps 7k and 8b of scenario 3, steps 9 and 9c of scenario 1). *Awaiting approval.* |
| `03-MOR-freeze-test-suite-v19.md` | Version 19: version 18 with Law draft 8 applied; the approved version, kept until version 20 is approved. |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F109).

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.

*Approved by Nobody, allegedly, 1 October 2026:* Law draft 8, core v19 and freeze test suite v19 (with flaw B1 and B2 to B16; B17 to B19 open at the end of Law draft 8), after Law draft 7, Production draft 5, core v18 and freeze test suite v18, applying F103 to F107 and F109 (eight passes). Nothing in them is open but the eight readings of the third pass, listed at the end of Law draft 7, to be checked at the end of the roadmap. The drafts they replace remain in the repository's history; the core library and the clients still implement Law draft 6 until they are reworked.

*Written 1 October 2026, not yet approved:* Law draft 9, core v20 and freeze test suite v20, writing in Flaws B17 to B19 as Nobody, allegedly answered them (recorded under F109), with the code built to them on branch `claude/law-draft-9`.
