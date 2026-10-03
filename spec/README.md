# The MOR core, in draft

These are the current drafts of the core: the map, the six MIPs and the freeze test suite. They are drafts, not frozen: their spec hashes will change at freeze.

| File | What it is |
| --- | --- |
| `02-MOR-core-v20.md` | The core document: the map of all six MIPs. Start here. Version 20 names Law draft 9. |
| `MIP-identity-draft-10.md` | Identity: the identity hash, keys, rotation, homes and receipts. |
| `MIP-text-draft-6.md` | Text: canonical text, the text act, and the bound on formats. |
| `MIP-envelope-draft-6.md` | Envelope: the act, locking, encryption keys and sealed containers, chains, media, relays. |
| `MIP-finance-draft-5.md` | Finance: receipts, obligations, payee pointers, the vault. |
| `MIP-law-draft-9.md` | Law draft 9: draft 8 with Flaws B17 to B19 answered by Nobody, allegedly, and written in: where one person holds the safety key, the succession clone also carries a plan for the successor, naming their own successor, signed by them in it (B17); where the declared member alone holds the everyday key, the recovery rotation removing them names the signature acts on the declaration (B18, a third element of its Law declaration); in a deal, the absence authority is one identity, never a threshold of the other parties (B19). Open at its end: what B14's answer leaves open, and the readings taken writing it. |
| `MIP-production-draft-5.md` | Production: specifications, tasks, verification rules, the trust root; an extension declares the layers it acts on (field 10, draft 5). |
| `02-MOR-core-v21.md` | **Core v21, not yet approved** (the core pass, 3 October 2026): everything decided since v20 (F108, F110 to F117, the sixteen wording changes of step 12, the specialized fork), and the Law section rewritten for plain reading without changing a rule; F118 and F119; the seven hard rules restated; "Areas and lanes" rewritten for a non-specialist. Names Law draft 10. Revised in place for F120 and F121. |
| `MIP-identity-draft-11.md` | **Draft 11, not yet approved:** the witness act (F110). |
| `MIP-envelope-draft-7.md` | **Draft 7, not yet approved:** a publication's size is the unlocked media's (F108); only Identity, Finance and Law act types carry acknowledgements (F110). |
| `MIP-finance-draft-6.md` | **Draft 6, not yet approved:** rule 14a confirmed; F111 (rule 14b); F112; F113 (an anonymous payer's committed key); F114 (the smallest limit); F115 (the payee's rails); F116; F117. |
| `MIP-law-draft-10.md` | **Draft 10, not yet approved:** draft 9 read alike with the core pass: the negotiation message, a Law act (F118, rule 56); a rail Module's role share evidenced by a receipt the split service signs, on a Module the payee published (F119, rules 19 and 22); the anonymous refund to the committed key (F113, rule 32); evidence of use from a party (F116); four rules in plainer words, meaning unchanged; no example of a particular use. Revised in place for F120 and F121: the judicial tier changed only by every member, a chain of judgment (field 21), departed holders (field 22), the payee pointer check (rule 18), the fork of a collective in principle; flaws K1 and P1 and the fork's questions open at its end. |
| `MIP-production-draft-6.md` | **Draft 6, not yet approved:** F112 (rule 8, task table rows 6 and 7, the verification rule) and F116 (rule 17). |
| `03-MOR-freeze-test-suite-v21.md` | **Version 21, not yet approved:** lines for F108, F110, F111, F113 to F116, F118 (step 5.3) and F119 (step 2.4e); step 3.7g rewritten (F115); F120 and F121 (steps 3.7f, 3.7i, 3.7n, 3.7p to 3.7s, 3.8b, 3.9). |
| `03-MOR-freeze-test-suite-v20.md` | The freeze test suite, version 20: version 19 with Law draft 9 applied (steps 7k and 8b of scenario 3, steps 9 and 9c of scenario 1). |

Why each rule exists is recorded in `docs/findings/` (F1 to F52, then F53 to F121).

The drafts marked *not yet approved* are the core pass of 3 October 2026 (`docs/core-pass-v21.md`); the approved versions they would replace stay until approval.

Reading convention: normal text is the protocol; italic text is commentary, reasoning and examples.

*Approved by Nobody, allegedly, 1 October 2026:* Law draft 8, core v19 and freeze test suite v19 (with flaw B1 and B2 to B16; B17 to B19 open at the end of Law draft 8), after Law draft 7, Production draft 5, core v18 and freeze test suite v18, applying F103 to F107 and F109 (eight passes). Nothing in them is open but the eight readings of the third pass, listed at the end of Law draft 7, to be checked at the end of the roadmap. The drafts they replace remain in the repository's history; the core library and the clients still implement Law draft 6 until they are reworked.

*Approved by Nobody, allegedly, 2 October 2026:* Law draft 9, core v20 and freeze test suite v20, writing in Flaws B17 to B19 as Nobody, allegedly answered them (recorded under F109), with the code built to them, and the four readings confirmed. Law draft 8, core v19 and freeze test suite v19 are retired; they remain in the repository's history.
