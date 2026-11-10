# Research prompts, 11 November 2026

Four research tasks for windows with web search, in the MOR Project. Each saves its report to the project at the path named, cites its sources, and decides nothing.

## R1. Prior art for the grammar of agreeing

MOR is a protocol whose core aims to be "the grammar of agreeing": signed text, identities, ordered records, and a short list of tasks that pluggable specifications fill. A first-principles exercise (in the project: `docs/strangers-2026-11/agreement-tasks.md` and `agreement-grammar.md` in the repository) found 49 tasks of an agreement and five operations (state, sign, deliver, order, control) plus apply. Find who has tried to define the primitive elements of contracts or agreements, formally or for machines, and how far they got: for example the UNIDROIT Principles, Akoma Ntoso, LegalRuleML, Ricardian contracts, the Accord Project and its Cicero templates, ISDA's Common Domain Model, Catala, the Lexon language, smart legal contract work, and any academic ontology of contracts. For each: its primitives, what it left to humans, where it succeeded and why it stalled. Then compare their primitives with the 49 tasks and the five operations: what they have that the list lacks, and the reverse. Save as `claude/MOR-research-grammar-prior-art.md`.

## R2. Order without a shared ledger

Find how systems without a single shared ledger handle "only once" (one owner, no double transfer) and "by when" (deadlines, freshness, the latest version): Secure Scuttlebutt's per-person chains, Keybase sigchains, Certificate Transparency and gossip of signed tree heads, Git, Holochain, Willow and Earthstar, Nostr's replaceable events, Hypercore, blockchain anchoring and timestamping services such as OpenTimestamps. For each: what plays the witness, what a fork proves, what a missing entry proves, what attacks it suffered and what it could never solve. Then answer: can the different witnesses of such a system (a host, a log keeper, a group's ordering, an anchor, a clock) be one kind of thing with one rule, and where did systems that tried need them to differ? Save as `claude/MOR-research-order-without-ledger.md`.

## R3. Hands that hold money for others

Find the patterns by which money owed under an agreement is held and paid out by someone other than the parties, and what makes the holder accountable: trust and client accounts, escrow agents, payment facilitators and marketplace payouts, royalty administrators and collecting societies, multisignature escrow, Lightning hold invoices and payment channels, Bisq's security deposits, and how each proves it paid (receipts, statements, audits). For each: what the holder may do, how it is caught when it does not pay, what it must post or lose, and the failures on record. Then: what is the smallest set of rules that makes any such hand accountable, and does a "split service" need anything more than those? Save as `claude/MOR-research-hands.md`.

## R4. What protects people who do not negotiate

Find the research on what actually protects people who read terms literally, do not negotiate and miss implied traps: the evidence on mandated disclosure and its failure (for example Ben-Shahar and Schneider), key facts sheets and their testing, plain-language and visual contracts (comic contracts, legal design), cooling-off periods, default rules and "sticky" defaults, consumer associations, and any work on autistic or neurodivergent people and contracts, consent and online terms. For each: what was tried, what was measured, what worked. Then: which of these could a protocol enforce by its rules, which only a client or an association can, and which none can. Save as `claude/MOR-research-protecting-non-negotiators.md`.
