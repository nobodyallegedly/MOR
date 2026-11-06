# Longhouse: findings about the core

*Newest first. Read against commit `af2ed6f8`: the MICS v36, Identity draft 15, Envelopes draft 11, Agreements draft 23, freeze test suite v36, relay transport cMIP draft 7. Written by Longhouse, a relay company building on MOR, for Nobody, allegedly. Not part of the core. For `market/longhouse/findings.md`.*

## F-LH-3. No scenario exercises a stale serving (6 November 2026)

**What we tried.** We looked for a freeze scenario in which a home stores and receipts a rotation, then serves an older chain, with no newer log summary, to a client that asks it alone.

**What the texts do.** Suite scenario 5.6 exercises a home that does not store a rotation (outvoted); 5.7b a forged receipt and non-extending summaries. Neither exercises an honest-looking home that simply leaves the latest rotation out for one client.

**What we expected.** A scenario showing that such a client's chain stops at "the end of what is held" (Identity, "What stops a chain"), that nothing binding rests on it ("Every verifier gives the same answer"), and that a cosigned summary fetched from an auditor exposes the omission.

**Rules involved.** Identity rules 19, 23, 28; Identity section 13; freeze test suite scenario 5.

**Blocks us.** No. We will run it on regtest against our own homes and bring the result.

## F-LH-2. Must an auditor be a relay operator? The text says so; the check does not (6 November 2026)

**What we tried.** An identity declaring as auditor an identity that runs no relay.

**What the texts do.** The words say an auditor is an operator: the glossary ("Audit: a home's log summary checked and cosigned by another operator"), rule 56 ("other operators, declared by the owner"), the definition of Operator ("the identity that runs a home or an auditing relay"). The cosignature check ("Log summaries and audits", 3) requires only that the signer be declared as an auditor by the identity whose receipt is checked, and that its chain keeps the cosignature valid.

**What we expected.** One answer. Either the check says "an operator declared as auditor", or the words say any identity may be declared.

**Rules involved.** Identity rule 56; section 13, "Log summaries and audits" 3; the definitions of Audit and Operator.

**Blocks us.** No, but it draws a market line in this room: if an auditor must run a relay, a firm that runs none cannot be a declared auditor under the core, and its "home audits" are a service beside the core's audit, not the core's.

## F-LH-1. Uncheckable MUSTs on homes, not marked as such (6 November 2026)

**What we tried.** We read Identity rules 19 (a home MUST NOT drop a valid rotation it accepted, and MUST serve the full chain) and 20 (a home MUST sign and serve a receipt for every chain act it accepts) as a verifier would, asking what bytes could show a breach.

**What the texts do.** None can: a home that serves an older chain, or holds back a receipt, produces nothing a verifier can check. The MICS ("Client conformance") says rules no verifier can check are marked as conformance "and the text says so"; the fourth design rule says a rule resting on a fact nobody can check becomes an act someone signs, a conformance rule, or nothing. Rule 28's commentary admits it for receipts ("a withheld receipt leaves no evidence"); rules 19 and 20 carry no such mark.

**What we expected.** The two rules marked as conduct rules a verifier cannot check, or one line in section 4 saying a home's compliance shows only through its receipts, its cosigned summaries and the other homes.

**Rules involved.** Identity rules 19, 20, 28; the MICS, "Client conformance" and the four design rules.

**Blocks us.** No. It fixes how we word our audit terms: we can promise to detect a stale serving, never to prove it from a home's own bytes.
