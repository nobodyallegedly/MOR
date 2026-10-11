# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v21.md` | The core document: the map of all six MIPs. Start here. Version 21: everything decided since v20 (F108, F110 to F130), the Agreements section rewritten for plain reading without changing a rule. Names Agreements draft 10. |
| `MIP-identity-draft-11.md` | Identity: the identity hash, keys, rotation, homes and receipts; the witness act (F110); scoped keys, installed by a higher MIP's act, such as a grant key (F128, F129). |
| `MIP-text-draft-6.md` | Text: canonical text, the text act, and the bound on formats. |
| `MIP-envelopes-draft-7.md` | Envelopes: the act, locking, encryption keys and sealed containers, chains, media, relays; a publication's size is the unlocked media's (F108); only Identity, Money and Agreements act types carry acknowledgements (F110). |
| `MIP-money-draft-6.md` | Money: receipts, obligations, payee pointers, the vault; rails as Modules under one payment cMIP (F112); the anonymous payer's committed key (F113); the creditor's release (type 4); a purchase naming its claim; request and push rails; split services' grant keys for incoming money only (F111 to F130). |
| `MIP-money-draft-7.md` | Money draft 7, a transition draft, **awaiting approval by Nobody, allegedly** (F251): draft 6 written for plain reading in Agreements draft 11's style, the rules numbered afresh with their old numbers beside them and a table from old to new, no rule changed; then F255 written in (rule 17, was 14: a refund to a claim's refund rail counts only up to the payer's vault limit). Draft 6 stays as the approved text and the reference older citations use (`docs/money-draft-7.md`). |
| `MIP-agreements-draft-10.md` | Agreements: agreements, stakes, splits, keepers, collectives. Draft 10: negotiation messages (F118); judges and chains of judgment (F120 to F123); the four endings, forks, closings and releases (F121, F124, F125); acts done once sealed to every member and on the collective's chain, the two chains and the tie rule (F126, F127); grant keys for every identity, a deal's grants in its terms (F128 to F130). Open at its end: readings kept for the end of the roadmap, and formats left open on purpose. *Superseded by draft 11 (approved 11 October 2026); kept as the reference older citations use.* |
| `MIP-agreements-draft-11.md` | Agreements draft 11, a transition draft, **approved by Nobody, allegedly, 11 October 2026** (F251): draft 10 written for plain reading, the common case first, the rules numbered afresh in reading order with their old numbers beside them and a table from old to new, "vow" for "announcement", no rule changed; then the decided findings F252 to F260 written in, each marked "new in draft 11"; then the answers to its questions Q1 to Q6 (F261 to F263, F259 revised, two readings), then the answers to the two questions that raised, Q7 and Q8 (F264, F265), in `docs/agreements-draft-11.md`. Draft 11 is the approved text. Draft 10 stays in this folder as the reference that code comments, tests, records, core v21 and freeze suite v21 still cite, by its numbers, until the freeze-ready draft; draft 11's table maps each old number to its new one. |
| `MIP-development-draft-6.md` | Development: specifications, tasks, verification rules, the trust root; an extension declares the layers it acts on (field 10); rails as Modules (F112), evidence from a party (F116), the payment task naming a purchase's claim and its rail kind. |
| `03-MOR-freeze-test-suite-v21.md` | The freeze test suite, version 21: lines for F108 to F130, scenario 3 extended to steps 3.7v and 3.9v, steps 1.3, 3.4, 3.5, 6.2, 7.1 and 7.7 rewritten to grant keys. |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F130).

The layers were renamed on 10 October 2026 (F212): Envelope became Envelopes, Finance became Money, Law became Agreements, Production became Development. The old file names (`MIP-envelope-draft-7.md`, `MIP-finance-draft-6.md`, `MIP-law-draft-10.md`, `MIP-production-draft-6.md`) hold a one-line pointer each, so links in older records still lead here; the approvals below keep the drafts' numbers.

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.

*Approved by Nobody, allegedly, 1 October 2026:* Agreements draft 8, core v19 and freeze test suite v19, after Agreements draft 7, Development draft 5, core v18 and freeze test suite v18, applying F103 to F107 and F109.

*Approved by Nobody, allegedly, 2 October 2026:* Agreements draft 9, core v20 and freeze test suite v20, writing in Flaws B17 to B19.

*Approved by Nobody, allegedly, 5 October 2026:* the core pass (`docs/core-pass-v21.md`, `docs/law-draft-10.md`): Agreements draft 10, Money draft 6, Envelopes draft 7, Identity draft 11, Development draft 6, core v21, freeze test suite v21 and MOR in one page v6, with findings F108 to F130 written in and the code built to them; and, as instruments, experimental and never for real money, the payment cMIP draft 2 (`cmips/`) and the Lightning rail Module draft 2 (`modules/`). Agreements draft 9, Money draft 5, Envelopes draft 6, Identity draft 10, Development draft 5, core v20, freeze test suite v20 and MOR in one page v5 are retired; they remain in the repository's history. Still to run once: the Mac regtest test (`docs/core-pass-v21.md`, section 5).

*Approved by Nobody, allegedly, 11 October 2026 (afternoon):* Agreements draft 11 (`docs/agreements-draft-11.md`, three passes): draft 10 written for plain reading, no rule changed, then F252 to F265 written in; core v21 and freeze suite v21 revised in place where they quote a changed sentence. Draft 10 is superseded and kept in this folder for the citations that use its numbers; core v21 still names draft 10 until its next revision.

*Approved by Nobody, allegedly, 5 October 2026 (evening):* the same set revised in place for F131 and F132 after Agreements stress testing (`docs/law-invariants.md`): a complete ending final, a cited act adopted, the payment's claim deciding; members sign forks and closings by chain signatures (Identity type 16); the core library fixed for IC1 to IC9, found by invariant hunting over random histories.
