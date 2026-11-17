# Old Agreements pointers: the three parts joined

17 November 2026. Written by Claude, the scribe's session P4. A list only: it changes no text in the repository, decides nothing, and proposes no wording, fix or rule. It joins three lists made by the sessions P1, P2 and P3, which are copied unchanged beside this file, and counts and summarises them. Where this file groups or orders things, the grouping is the scribe's, said so where it is used.

**The wish** (Nobody, allegedly, quoted from the ledger, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." And what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". On now: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite."

**Why** (the MOR lead's wording): to show him how big the rewrite really is, before he decides it.

**Words used here.** *The old Agreements*: draft 24 of the Agreements rulebook, `spec/MIR-agreements-draft-24.md` on main. *Draft 25*: the rewrite from scratch, `docs/agreements-from-scratch/draft-25.md`, branch `claude/agreements-clean-1-hahuwn`, pull request 183. *A place* is one sentence (or one test step) somewhere in the repository that relies on ("leans on") the old Agreements: it names it, cites one of its rules, or uses one of its words, fields or act types. *The MICS* is the core document over all six layers (`spec/02-MOR-MICS-v37.md`). *The layers below* are the other rulebooks (Identity, Text, Envelopes, Money, Development) and whatever is later written in their place. A *verifier* is the software that applies the rules to signed acts and gives an answer. A *cMIP* is a document, named by its hash, that an agreement plugs into one of its fields to answer one question; a *Module* is a piece such a cMIP may use. G1 to G14 are draft 25's grammar rules, K1 to K8 its eight fields for cMIPs ("sockets"); C-, S-, M- and D- numbers are rows of the three parts.

## 1. In plain words

1. Before Nobody, allegedly, decides whether to rewrite the Agreements rulebook from scratch, three sessions (parts 1 to 3 of this list) listed every place that leans on the old one (draft 24, in `spec/`): 1,886 places in 31 files, plus 22 of the 41 latest cMIPs and Modules.
2. 1,034 of the places are in the seven core files, and 536 of those in the MICS alone; the freeze test suite holds 313; the case studies, paper and companions 539.
3. 875 places rest on something draft 25 does not have at all (collectives, keepers, claims, publications, stakes, splits, endings); 581 state a rule draft 25 reads another way; only 430 need just a new word.
4. Draft 25, in its section 8.1, lists 20 things it needs from the layers below and does not have; the three parts found 22 further needs, listed in section 4 with the rows that found them.
5. In 20 supporting documents the story itself changes: mostly who must sign a change, how a buyer signs on, who confirms a sale, whether anything ends, and who sees how money is divided.
6. 52 cases are unclear: draft 25 does not say what stands there. 25 of them would change a verifier's answer; the first in section 7's order is a co-owner who sells a work alone: allowed and shown in draft 24, possibly "invalid" in draft 25.

## 2. Counts

Each part's counts are taken as it gives them. Every part's own totals add up: part 1, 172 + 305 + 557 = 1,034; part 2, 18 + 81 + 214 = 313; part 3, 240 + 195 + 104 = 539. The scribe also counted the rows of each table by script, and found the same numbers. The three parts cover different files, so no place is counted twice.

The three kinds, as the parts define them: **a word to change** (the idea survives in draft 25 under another name or number); **a rule to rewrite** (draft 25 answers the same question differently); **a concept gone** (draft 25 has nothing for it). Every place has exactly one kind.

| file | a word to change | a rule to rewrite | a concept gone | all |
|---|---|---|---|---|
| **The MICS**, `spec/02-MOR-MICS-v37.md` | 63 | 161 | 312 | **536** |
| `spec/MIR-identity-draft-16.md` | 7 | 9 | 80 | 96 |
| `spec/MIR-text-draft-11.md` | 10 | 8 | 12 | 30 |
| `spec/MIR-envelopes-draft-12.md` | 10 | 25 | 17 | 52 |
| `spec/MIR-money-draft-14.md` | 33 | 69 | 54 | 156 |
| `spec/MIR-development-draft-12.md` | 27 | 25 | 57 | 109 |
| `spec/README.md` | 22 | 8 | 25 | 55 |
| *Part 1, the core: all* | *172* | *305* | *557* | *1,034* |
| `spec/03-MOR-freeze-test-suite-v37.md` | 18 | 81 | 214 | 313 |
| *Part 2, the suite: all* | *18* | *81* | *214* | *313* |
| `docs/case-studies/04-MOR-case-study-augmented-democracy-v5.md` | 3 | 4 | 3 | 10 |
| `docs/case-studies/08-MOR-case-study-musician-to-label-v5.md` | 17 | 23 | 14 | 54 |
| `docs/case-studies/09-MOR-case-study-cat-video-to-coproduction-v5.md` | 15 | 15 | 8 | 38 |
| `docs/case-studies/10-MOR-case-study-migration-to-MOR2-v4.md` | 10 | 7 | 2 | 19 |
| `docs/case-studies/11-MOR-case-study-journalism-v3.md` | 14 | 3 | 1 | 18 |
| `docs/case-studies/12-MOR-case-study-gig-economy-v7.md` | 11 | 19 | 3 | 33 |
| `docs/case-studies/13-MOR-case-study-gaming-v4.md` | 6 | 9 | 8 | 23 |
| `docs/case-studies/14-MOR-case-study-learning-and-work-v6.md` | 5 | 6 | 1 | 12 |
| `docs/case-studies/15-MOR-case-study-advertising-v4.md` | 6 | 3 | 1 | 10 |
| `docs/case-studies/16-MOR-case-study-commerce-v4.md` | 5 | 10 | 3 | 18 |
| `docs/case-studies/17-MOR-case-study-live-sports-v6.md` | 13 | 15 | 6 | 34 |
| `docs/case-studies/18-MOR-case-study-adult-content-v4.md` | 6 | 6 | 3 | 15 |
| `docs/case-studies/19-MOR-case-study-software-v4.md` | 13 | 3 | 3 | 19 |
| `docs/case-studies/20-MOR-case-study-ai-v6.md` | 25 | 10 | 6 | 41 |
| `docs/case-studies/21-MOR-case-study-academic-publishing-v3.md` | 18 | 6 | 12 | 36 |
| `docs/case-studies/README.md` | 1 | 3 | 0 | 4 |
| `docs/paper/mor-paper-draft-3.md` | 11 | 16 | 12 | 39 |
| `docs/companions/05-MOR-the-unwritten-layer-v3.md` | 36 | 23 | 8 | 67 |
| `docs/companions/05-MOR-who-can-earn-v6.md` | 12 | 9 | 6 | 27 |
| `docs/companions/Core-principle-legible-greed-v3.md` | 1 | 4 | 0 | 5 |
| `docs/companions/MOR-the-path-to-mor-2-draft-1.md` | 3 | 0 | 1 | 4 |
| `docs/07-MOR-in-one-page-v11.md` | 7 | 1 | 3 | 11 |
| `docs/dubsar-org-doors-2026-10-09.md` | 2 | 0 | 0 | 2 |
| *Part 3, the documents: all* | *240* | *195* | *104* | *539* |
| **All three parts** | **430** | **581** | **875** | **1,886** |

Part 3 writes its paths from `docs/` (as `case-studies/…`); the `docs/` prefix above is the scribe's. Part 3 read one more file, `docs/companions/README.md`, and found no place in it.

**Unclear.** The parts count these differently, so they are not added into the table. Part 1 marks 202 of its 1,034 rows "unclear" (MICS 78, Identity 13, Text 11, Envelopes 11, Money 35, Development 29, README 25), counted inside the three kinds. Part 2 names 12 cases (U-01 to U-12), 8 of which change a verifier's answer. Part 3 names 6 cases (U1 to U6). Section 7 gives them one scheme: 52 cases.

**The cMIPs and Modules**, counted apart, by name, not by kind (part 2): 22 of the 41 latest specifications lean on the old Agreements: 19 of the 25 latest cMIPs, 3 of the 16 latest Modules. They are named in section 6.

## 3. The three working lists, joined by name

Each part built its own list of what draft 25 dropped or renamed, and numbered it on its own: part 1 as W01 to W57, part 2 as W1 to W49 with additions A1 to A8, part 3 without numbers (cited here by the first words of its row). The same number means different things in different parts: part 1's W13 is the ownership agreement, part 2's W13 the publication. They are joined here by the concept's name. The status is each part's own word, quoted. "—" means that part's list has no entry for the concept. Where the statuses differ, the last column says so and shows them; no choice is made between them.

| concept (draft 24) | part 1 | part 2 | part 3 | the parts |
|---|---|---|---|---|
| Agreements act types (0 to 25) | W01: "every type but 0 and 1 dropped; type 1 renamed and widened" | — | — | |
| Terms (type 0) and its fields | W02: "same word, new fields; every d24 field number is gone" | W1: "kept, fields renumbered"; A8 (field numbers) | "Terms (type 0), with…": "changed" | agree that the word stays and the fields change |
| Signature (type 1) | W03: "renamed" (assent) | W2: "renamed" (assent) | "Signature (type 1)": "renamed" | agree |
| `objects` and `acks` on an act | W04: "dropped for Agreements acts" | A5 (no status) | — | |
| Agreement, and its id | W05: "kept, renamed "root"" | W3: "kept, another meaning" | "Agreement: terms plus signatures…": "changed" | differ in word: P1 says the id is renamed; P2 and P3 that the meaning of "agreement" changed |
| Agreement chain | W06: "split and renamed" | W4: "kept, another meaning" | "Agreement chain…": "narrowed" | differ: "split and renamed", "kept, another meaning", "narrowed" |
| Clone, complete clone, draft | W07: "renamed" (update) | W43: "renamed" | "Clone (rule 45)…": "renamed"; also "Nothing on MOR is updated": "word reversed" | agree |
| Mark (field 4) | W08: "dropped" | W39: "dropped" | inside "Change rules; constitutional change rule; clone rule; mark": "renamed" | differ: P1 and P2 "dropped"; P3 lists it in a row marked "renamed" |
| Change rules (constitutional rule, layer rules, control-model powers) | W09: "renamed" | W37: "renamed (constitutional rule); dropped (the rest)" | "Change rules…": "renamed" | differ: P2 has the rest dropped |
| "Every party" in a deal (rule 47); no stake reduced without its holder (rule 48) | inside W09 ("renamed") | — | "A deal changes only with everyone's signature…": "changed" | differ in word: "renamed", "changed" |
| Power | W10: "same word, meaning changed" | W38: "kept, another meaning" | "Power…": "changed" | agree |
| Termination, active/terminated, a deal's end | W11: "dropped" | W46: "dropped" | inside "Release to the public domain; …; termination…": "dropped" | agree |
| Claim (type 3) | W12: "dropped" | W9: "dropped" | "Claim (type 3, rule 7)": "dropped" | agree |
| Ownership agreement (field 33) | W13: "dropped as a type; plain word "work"" | W10: "renamed (kind 0); dropped (kind 1)" | "Ownership agreement…": "dropped" | differ: P2 has kind 0 renamed to "work"; P1 and P3 dropped |
| Stake (field 7, millionths) | W14: "dropped" | W11: "renamed, form dropped" | "Stake, in millionths…": "dropped" | differ: P2 "renamed" (to shares); P1 and P3 "dropped" |
| Stake transfer (type 4), transfer | inside W14 ("dropped") | W49: "kept, another meaning" (only the baker's rights) | inside "Stake, in millionths…; stake transfer": "dropped" | differ: P2 "kept, another meaning"; P1 and P3 "dropped" |
| Position (rule 5) | W15: "dropped" | W6: "dropped" | "Position…": "dropped" | agree |
| Publication (type 6), publisher, withdrawal | W16: "dropped as a type; "offer"" | W13: "renamed, another form" | "Publication (type 6)…": "dropped" | differ: P2 "renamed" (to offer); P1 and P3 "dropped" with "offer" nearest |
| Split agreement | W17: "dropped" | W14: "dropped" | inside "Split agreement, split plan…": "dropped" | agree |
| Partner | W18: "dropped" | W15: "dropped" | inside "Split agreement…": "dropped" | agree |
| Price tag (Money type 5) | W19: "the publication it names is gone" | W16: "dropped from Agreements" | "Price tag, purchase (rule 12)": "changed" | differ: P3 "changed" (to payment) |
| Purchase | W20: "renamed" (the buyer's leg) | W17: "renamed, another rule" | inside "Price tag, purchase": "changed" | agree that it changes; differ in word |
| Proven and promised delivery | W21: "dropped" | W7: "dropped" | "Proven delivery…": "dropped" | agree |
| Vow | W22: "same word, meaning changed" | W18: "kept, another meaning" | "Vow: its own act and chain…": "changed" | agree |
| Claiming a vow; a sale "made outside the claiming agreement" | — | — | "Claiming a vow…": "dropped" | |
| Request rail, push rail | W23: "dropped" | W19: "dropped from Agreements" | — | agree |
| Negotiation message (type 18) | W24: "dropped" | W8: "dropped" | "Negotiation message…": "dropped" | agree |
| Split plan, owners' line | W25: "dropped" | W20, W21: "dropped" | inside "Split agreement, split plan, owners' line…": "dropped" | agree |
| Role share | inside W25 ("dropped") | W25: "dropped; word kept, another meaning" | "Role share (rule 22)": "dropped" | agree that it is dropped |
| Split service | W26: "renamed" (service) | W22: "renamed" | "Split service": "renamed" | agree |
| Split (type 8), payout | W27: "renamed" (leg report) | W23: "renamed, another form"; W24 payout: "renamed" (leg) | inside "Split agreement, … split (type 8), payout fee": "dropped" | differ: P1 and P2 "renamed"; P3 "dropped", with K6 and leg reports nearest |
| Deal | W28: "same word, meaning changed" | W5: "kept, another meaning" | "Deal: an agreement founding no collective": "renamed" | differ in word: P3 "renamed" |
| Where money ends: payee pointer; legible money rules 15 to 32 | W29: "dropped as rules" | — | "The one pointer an agreement designates (rule 16)": "renamed" (receiver); "Each participant's check… (rule 18)": "renamed"; "Open obligation of a split service (rule 30)": "renamed" | differ: P1 "dropped as rules"; P3 has three of those rules "renamed" |
| Settlement request (type 22), fork settlement (type 23); a deal's fork, settlement, judge of forks | W30: "dropped; word reused" | A6 (no status) | — | |
| Keeper, keeper record (type 2) | W31: "dropped; "place" stands in" | W26: "replaced by another thing" | "Keeper (rules 36 to 44); "belongs to"": "dropped" | differ in word: P2 "replaced by another thing" |
| Belongs to | W32: "dropped" | W27: "dropped" | inside "Keeper…": "dropped" | agree |
| Time reference | W33: "renamed" (clock) | W31: "renamed" | "Time reference (rule 33)": "renamed" | agree |
| Judge, chain of judgment, arbitrator | W34: "renamed; tasks dropped" | W28 arbitrator: "renamed; "verifier" another meaning"; W29 judge: "kept, another meaning"; W30 chain of judgment: "dropped" | "Arbitrator; judge; chain of judgment": "changed" | differ in word; P2 splits them in three |
| Contest (type 14) | W35: "renamed" | W33: "kept, another meaning" | "Contest, by "someone with standing"": "changed" | differ in word |
| Standing | W36: "same word, meaning changed" | W34: "kept, another meaning" | "Standing…": "changed" | agree |
| Concurrency rule (already retired) | — | W32: "dropped" | — | |
| The tasks, in Development's numbering | W37: "renumbered; d24's tasks dropped" | A4 (no status) | "The tasks (numbered…)": "changed"; "Conditions (task 9)": "narrowed" | differ in word |
| Anchoring as a task (11) | W38: "renamed" | inside A4 | inside "Time reference": "renamed" | agree |
| Collective | W39: "dropped" | W35: "dropped" | "Collective: an identity with its own keys…": "dropped" | agree |
| Key grammar | W40: "dropped" | inside W35 | inside "Collective…" | agree |
| Control model | W41: "dropped; name collides" (with draft 25's `control`) | inside W35 | inside "Collective…" | agree |
| Layer rule | W42: "dropped" | inside W35 | inside "Collective…" | agree |
| Area | W43: "dropped" | inside W35 | inside "Collective…" | agree |
| Voice | W44: "dropped" | inside W35 | "Owners' consent; voice; departed holder": "dropped" | agree |
| Departed holder | W45: "dropped" | inside W35 | inside "Owners' consent; voice; departed holder" | agree |
| Owners' consent | — | W12: "dropped" | "Owners' consent…": "dropped" | agree |
| The collective's chain, record (type 17), line, decisions and actions chains, history, tie rule, done | W46: "dropped; "line" reused" | W36: "dropped; "line" another meaning" | "The collective's chain…": "dropped" | agree |
| Fork of a collective (type 19), closing (type 20) | W47: "dropped; "fork" reused" | W45: "dropped; "fork" another meaning" | inside "Release to the public domain; fork of a collective; closing…": "dropped" | agree |
| Succession | W48: "dropped" | W48: "dropped" | "Abandonment…; succession plans…": "dropped" | agree |
| Abandonment, liveness, notice, resignation | W49: "dropped" | inside W48 (abandonment) | "Abandonment (rules 85 to 89)…": "dropped" | agree |
| Grant, revocation, grant key | W50: "renamed; grant key dropped" | W42: "renamed (grant); dropped (grant key)" | "Grant (types 9, 10), grant key, revocation, import": "renamed" | agree |
| Release to the public domain (type 5) | W51: "dropped" | W44: "dropped" | "Release to the public domain…": "dropped" | agree |
| Creditor's release | W52: "dropped from Agreements" | W47: "dropped from Agreements" | — | agree |
| Extension (field 15) | W53: "dropped" | W41: "dropped" | "Extension (terms field 15)": "dropped" | agree |
| Layer numbering (4 Agreements) | W54: "not said" | W40: "dropped from Agreements" | — | differ: P1 "not said"; P2 "dropped from Agreements" |
| The Agreements MIR as a text in `spec/`, and its hash | W55: "changed" | A1 (no status) | — | |
| "Agreements rule N" | (cited through W55 in rows) | A2 (no status) | — | |
| "Dispute", "disputed" | W56: "word reused" | inside A3 | — | |
| "Valid", and the answers said of acts (void, unknown, pending) | W57: "word narrowed in d25" | A3 (no status) | — | |
| Made before, made after | — | A7 (no status) | — | |
| What you sign is what you saw (rule 4) | — | — | "What you sign is what you saw": "dropped" | |
| A member can always leave alone (rule 70) | — | — | "A member can always leave alone": "dropped" | |
| "Envelope" for one agreement's money (F280 layers) | — | — | ""Envelope" for one agreement's money": "word clash" | |

## 4. What the lower layers must now carry for draft 25

### 4a. Draft 25's section 8.1, item by item

In draft 25's words where possible, shortened; "…" marks a cut. The numbers 8.1-1 to 8.1-20 are the scribe's, for pointing; draft 25 does not number these items. The layer is named only where draft 25 names it.

| # | what draft 25 needs and does not have | layer, as 8.1 names it |
|---|---|---|
| 8.1-1 | "The core's act format: whether it already gives fingerprints, a per-signer line of acts (which would make G6 redundant), acts signed by several people at once, and field names." | the core |
| 8.1-2 | **A place.** "(1) a way to name a place without a server address, which Terms can carry in `place`; (2) one line of the acts the place was shown, in the order it was shown them; (3) a signed answer, by the place, that says of an act, or of an agreement's root, whether it is in that line and at which position; (4) in the same answer, whether anything of the same agreement comes after it, said as of the answer's own position…; (5) a way for a verifier to tell that two answers of one place contradict each other (G7.2). Until this exists, every "per place" in this text has nothing under it that can be built." | "the layer that orders acts" |
| 8.1-3 | "What the Sign layer does when a key is replaced or lost, since that decides whether G6 sees a fork." | the Sign layer |
| 8.1-4 | "How cMIPs are identified in practice, so that "named by fingerprint" in G2 can be met." | layer not named |
| 8.1-5 | **The report, a block of the shared language** (the MOR lead's proposal, `report-block-2.md`, not a decision). It needs: "that a task may carry a call for a report, or not; that the call says from whom, and names no place and no reader…; that only the signers of the act holding the task can make it; that a report carries the call it answers, the acts it relied on and its signer; that a report is addressed to the other side of its own leg, and to no one else, in every layer…; that two halves are tied by an act both name, or… by that layer's answer to "the same payment"…; that a report is one act type, defined once in the shared language, which every layer's tasks use; and that "unanswered" and "no report called for" are shown as such." Not yet said by the block: how a call is written and where it sits; how "where that side receives" is found without a server address; how a report is written as an act; whether a call is per task or per act; whether one report can answer several calls (P6); whether "unanswered" ever ends. | the shared language; "where that side receives": "the Deliver layer's, and the security rules'" |
| 8.1-6 | **The seams with the block** (proposed in `report-block-3.md` and `report-block-4.md`, the MOR lead's to take or change). The block would need: that a task may define a call as made by default by the act that holds it, and that a report may name it by naming that act, or the act that stands for it ("for a payment, its settlement"); to drop "who both signed" from its plain words and say the two sides as G11.1 does; R4 to say the case where a call expects one side only; that a report names one call; and to allow a task to say which lines each receiving side receives. | the shared language (the block) |
| 8.1-7 | **Seeing beyond one leg.** "that none of them carries a report further than its leg; that none lets a call name a place or a reader; that none lets anyone who did not sign an act call for reports on it; and that none gives, for its own tasks, a path for a report that the people it concerns did not sign for." Still not had: what a data cMIP focused on agreements is beyond its socket (K8), and whether it belongs to Agreements alone. | "the shared language and… every other layer" |
| 8.1-8 | **"The same payment", and Money's counting.** Where one payment is recorded as two acts (a claim and a receipt), "its answer to whether two such acts are of the same payment (G11.4(b))"; and where one of two differing amounts is counted toward a debt, "that counting is Money's". | "the layer that holds value"; Money |
| 8.1-9 | "What a settlement is, as the layer that holds value gives it, so that the `settlement` field (G8.5) names the right thing; and what a payment is there: how it names the version of the work agreement it read (G13.2; that is Money's to say…)." | the layer that holds value; Money |
| 8.1-10 | "How that layer writes an amount, so that the amounts in a leg report (task K6) can be read by everyone alike (P20)." | the layer that holds value |
| 8.1-11 | "The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an evidence-only record to be enough." | layer not named |
| 8.1-12 | "Whether the verifier's answers (shown, not shown, fork, valid and not valid, invalid, unchecked) are already named in another layer, so that the words match; in particular where "invalid" stops there (P19)." The core's "valid" and "disputed" are known to differ; "The core's "unknown", "void" and "pending" have no word here." | "another layer" (not named) |
| 8.1-13 | **The envelope's chain** (G14): "(1) **the bake names the baker**…; (2) **a transfer act**: an act of the envelope's chain that names the envelope, follows the act of that chain before it, and names the next holder by an identifier…; whether that identifier may be an agreement's root (G1.1), and whether one transfer may name several holders, is that layer's to say…; (3) **who may sign it**: the holder of the moment, and how a verifier tells that the signer was the holder of the moment; whether a holder may sign it through an agent, or, for an agreement, as that agreement's signature (G1.2)…; (4) **how a reader gets the holder at an act**…; how a verifier tells that an act is of a given envelope's chain, so that `envelope_at` can be checked (G14.3(a)); and whether that layer gives an anchoring of its own that orders Terms against its transfers…; (5) **what a fork there shows**: two transfers signed by the holder of the moment that follow the same act of the chain (a double sale), shown as a fork; whether and how that layer resolves one; what it answers of the holder at an act that is a tip of one, or follows one…" Also: "how a verifier tells that two envelopes carry the same work (G14.5). Until this exists, G14 has nothing under it that can be built." | "the layer below" |
| 8.1-14 | "What a clock is, which layer gives it, and how it is identified without a server address (G7.4)." | not named: the item asks which |
| 8.1-15 | "Whether the core has an act signed by several people at once, for an agreement that signs by every one of its signers (G1.2; P17); and whether the core's `for`, if it has one, can hold an agreement's root." | the core |
| 8.1-16 | "What a receiving side's "automatic" report is on a way of paying, as the layer that holds value gives it: who signs it, and whether a settlement can itself be the confirmation (G11.5, G11.7; P20)." | the layer that holds value |
| 8.1-17 | "What a payment is as an act, in the layer that holds value: where the payer's call sits in it, and whether a payer can state that no confirmation is called for (G11.7)." | the layer that holds value |
| 8.1-18 | "What access to what was bought is, who gives it, and what shows that it was given or was not (G11.7, G11.8): the Deliver layer's evidence, or a recipient's acknowledgment (delivery, section 5.3)." | the Deliver layer, or a recipient's acknowledgment |
| 8.1-19 | "Whether the core already has a contest." If it has, draft 25 "should name it and say only what is extended". | the core |
| 8.1-20 | "What a client is, where the duties of clients are kept, and how a client is tested against them, since no verifier can check G12.8." | layer not named |

### 4b. The envelope's chain, from the two ledger exchanges

Written from the exchanges in the ledger (`docs/decisions.md`, branch `claude/lead-records-2`), "The envelope states its owner" and "The holder at the time", read whole. "He" is Nobody, allegedly; the MOR lead's readings are labelled as his. Each exchange in the ledger ends with an "Arrived at (to check)" line: what the exchange arrived at, not yet checked with him.

- **His words** (Nobody, allegedly; the first exchange): "This is what I think… the chain in question is the one (or should be) of the envelope, not the one of the baker. The envelope tracks its baker and if that is transferred the envelope is updated with a new ID for those rights"; and, to the MOR lead's reading below: "Yes. I think that is the cleanest approach and flips ownership to the thing being owned stating it".
- **The MOR lead's reading he said yes to** (the first exchange): "the envelope has its own chain, starting with the bake; a transfer of the baker's rights is a new act in that chain, signed by the current holder and naming the new one; Agreements reads the current holder from it, and Terms count if that holder is a party; the succession through agreements and the rights cMIP passing rights in a body go; a double sale is a fork in the envelope's chain; that chain is the layer below's, named by Agreements and listed for the rewrite of the lower layers."
- **The MOR lead's lean he agreed to** (the second exchange; he: "Agreed"): "Terms name the envelope act they relied on, and the holder is read at that point; agreements made before a sale keep standing; the buyer holds the rights from then on; a thief's Terms stay invalid for good; where knots or anchoring show Terms cite an old point of the envelope's chain to dodge a later transfer, they do not count, as with a late rival."

The scribe's summary of what the layer below must carry, from these two exchanges: an envelope with its own chain, starting with the bake; a transfer of the baker's rights as a new act in that chain, signed by the holder and naming the new one; a holder that can be read at a given act of that chain; a double sale shown as a fork in that chain. The second exchange replaces "the current holder" of the first with the holder "at that point". The layer, in the ledger's words: "the layer below's… listed for the rewrite of the lower layers". Draft 25's item 8.1-13 above lists the same needs in more detail.

**Open: where an "Arrived at (to check)" line says more than its exchange.** Each is quoted beside the exchange's words. Nothing here is decided.

- *"Bound by them."* Arrived at (first exchange): "Terms for the envelope count only if that holder is a party, bound by them." The exchange: "Terms count if that holder is a party". "Bound by them" is not in the exchange. (Draft 25's G14.2 takes the words "bound by them" from the earlier exchange "The baker's rights after a sale".)
- *"Not by agreements."* Arrived at (first exchange): "ownership of a baked work is stated by the work's own envelope, not by agreements." The exchange: he, "flips ownership to the thing being owned stating it"; the MOR lead, "the succession through agreements and the rights cMIP passing rights in a body go". The exchange does not say "not by agreements" of ownership as a whole.
- *"An act that never counted."* Arrived at (second exchange): "A thief's Terms, which cite a point where he held nothing, are invalid for good, so "invalid" stays an act that never counted." The exchange: "a thief's Terms stay invalid for good". "An act that never counted" is not in the exchange.

### 4c. Needs the three parts found that 8.1 does not hold

Found in the parts' rows and unclear cases, not in section 8.1. C-, S- and D- numbers are rows of parts 1, 2 and 3; UC- numbers are the unclear cases of section 7. Each is worded as an open question, with the rows that found it; none of them is decided or answered here. The layer is written "layer not named" because neither 8.1 nor the ledger names one for these; the rulebook a row sits in (Identity, Money, Envelopes, Text, Development) says where the place was found, and is not taken as naming the layer the need falls to.

| # | what is open | found by | layer |
|---|---|---|---|
| N1 | Whether draft 25, written under its own spec hash `SPEC_DRAFT_25` as a file in `docs/`, is the Agreements MIR: one of the six frozen texts of the trust root, layer 4, the hash the freeze computes, `AGREEMENTS` | C-461, C-677, C-979, C-940, C-941, C-942 (and C-003, C-004, C-093 and the others of UC-30); S-312 (UC-26) | layer not named |
| N2 | What Development's task numbers 8 to 15, `task-ref` and a cMIP's field 2 become, now that draft 25's tasks K1 to K8 are fields of an act and carry no number | C-893, C-945, C-948, C-950, C-951, C-952, C-018, C-458, C-879, C-891; S-091, S-298 (UC-27) | layer not named |
| N3 | Which module names which: draft 25 has the cMIP in a socket name its modules; Development has a Module name its cMIP (field 5) | C-896 | layer not named |
| N4 | The payment cMIP an agreement names: Money's rule that a receipt counts only on a rail implementing "that agreement's payment cMIP", and the Payment task, where draft 25's Terms have no payment socket | C-073, C-731, C-734, C-843, C-724, C-849, C-850, C-855 | layer not named |
| N5 | Money sent to a bare bake, with no Terms: "money sent to a bake goes to its uploader, with no split possible" | C-012, C-056, C-193, C-686, C-785, C-786; S-014, S-277 (UC-28) | layer not named |
| N6 | How a payment naming a bake relates to Terms naming its envelope; whether a receipt's or claim's field names a root or a version, where it named "the agreement or publication it arises from" | C-685, C-824, C-006, C-090 | layer not named |
| N7 | Reading a buyer from a payment claim, or a route's first payer, where draft 25 reads a buyer from an assent; and whether a Money-only wallet's payment is still a buyer's payment under the offer | C-730, C-807; S-025, S-140 (UC-02) | layer not named |
| N8 | Obligations: an obligation "closed by clone", what is owed when an update replaces a version, redirecting what is owed, refunds and money owed back | C-760, C-078, C-095, C-737, C-761, C-788, C-814, C-815 | layer not named |
| N9 | A receiver that is an agreement, against a payee pointer | C-716, C-015 | layer not named |
| N10 | Fees: for cMIP and Module authors, and which signed act now carries a fee a client can compare | C-805, C-465, C-921, C-928, C-972 | layer not named |
| N11 | The vow: whether Envelopes keeps a vow act (type 5), with its sales pending, confirmed or contested | C-005, C-060, C-693, C-707, C-664, C-1005, C-061, C-065 | layer not named |
| N12 | Whether draft 25's "envelope" is Envelopes' bake (type 0) | C-666 | layer not named |
| N13 | Whether the envelope's transfer act needs a chain signature, as Identity's rule asks of some acts — next to 8.1-13 (3), "who may sign it" | C-597 | layer not named |
| N14 | Delegated key release (Envelopes, "through a grant", "stopping on lapse"): whether a draft 25 power can cover a key delivery, and what "lapse" becomes | C-668, C-713 | layer not named |
| N15 | Identity's keyless genesis, and its one-way door, once there is no collective | C-552, C-553, C-742 | layer not named |
| N16 | Scoped keys: whether any layer still installs one | C-542, C-544, C-557 | layer not named |
| N17 | Acknowledging: Agreements acts carry no `acks` (encoding-2, E3); whether naming an act in the payload (`relies_on`, `answers`) counts as acknowledging it for Identity's rotation rules; what an act carrying `refs` holds | C-037, C-054, C-775, C-777 | layer not named |
| N18 | Text acts: the shapes of `objects` a text act may carry, where draft 25 says nothing of text acts | C-640, C-643, C-648 | layer not named |
| N19 | Text's rule 6 (a client shows every bidirectional control before signing "terms, a grant or a clone"): which draft 25 acts it covers, Statements included — next to 8.1-20 | C-650, C-656, C-634, C-649, C-122, C-123 | layer not named |
| N20 | Whether an agreement can be a specification's creator (Development field 1 is an identity hash) | C-890 | layer not named |
| N21 | Extensions: draft 25 has no field to name one; whether another layer still offers them | C-008; D-525 (part 3's own guess, not 8.1's: "that layer's question") | layer not named |
| N22 | The core's tag list (`MOR/…`): whether tags that draft 25 and encoding-2 do not use stay | C-611 | layer not named |

## 5. The supporting documents whose story changes

From part 3's section "The story changes": one line per document, with the rows it cites. Each paragraph there quotes both the document and draft 25. Part 3 leaves out the journalism case study (11), the case studies' README and the doors list of 9 October 2026 ("whose words change but whose story holds") and the companions' README, where nothing leans on the old Agreements. The numbers before the case studies' names are their own; the others (01 to 03, 05 to 07) are not among the files part 3 read.

| document | where the story changes | rows |
|---|---|---|
| 04, Augmented Democracy | Who signs for the association, and how a delegation ends | D-001, D-003 |
| 08, From Bedroom to Label | Who signs when a member leaves; how fans sign on; who confirms; what ends; who sees a sale outside the deal | D-023, D-029, D-030, D-042, D-044, D-045, D-053, D-054 |
| 09, From Cat Video to Coproduction | Who signs a share sale; how a deal ends; who sees the streamer's division | D-074, D-078, D-088, D-093 |
| 10, Migration to MOR2 | Who signs the crossing, and whether anything ends | D-106, D-109, D-112, D-115, D-120 (and UC-48, section 7) |
| 12, One Reputation, Many Trades | How a client signs on, who confirms, who may contest, who judges | D-143, D-144, D-149, D-159 |
| 13, From Pocket Game to Open Market | Who must sign a change to a licence | D-185, D-195 (and UC-49, section 7) |
| 14, Shown, Not Listed | Whether a course needs the lessons' consent; who confirms an enrolment | D-200, D-203 (and UC-47, section 7) |
| 15, Paid for Results, Seen for What It Is | Whose word earns a referrer's share | D-210, D-217 |
| 16, No Firm Required | Who confirms an order; what marks a resale | D-223, D-230, D-231 |
| 17, From the Stands to the Main League | Who confirms a ticket; what marks a resale; whose word pays a relay | D-255, D-257, D-262, D-267 |
| 18, Adult Content, Consent on the Record | How distribution stops, and who stops it | D-275, D-284 (and UC-47, section 7) |
| 19, Paying the Ones Everything Stands On | Who signs when a maintainer leaves; how the judge changes | D-295, D-296 |
| 20, From Agents to Open Intelligence | Who signs for Lena (the person in the case study), and how the delegation ends | D-311, D-317 |
| 21, From One Sentence to a Research Programme | Who must sign a change; who decides who judges | D-355, D-357, D-367, D-377 |
| The paper, draft 3 | Almost all of sections 5.2 to 5.4, and the claims built on them | D-393, D-394, D-395, D-400, D-401, D-402, D-403, D-404, D-407, D-413, D-415, D-416, D-417 |
| The unwritten layer, version 3 | How buyers sign on, who sees the division, whether a deal ends, who owns | D-424, D-432, D-436, D-441, D-443, D-449, D-451, D-457, D-459, D-485 |
| Who Can Earn, version 6 | Selling shares, leaving, the co-owner's lone sale | D-493, D-496, D-497, D-499, D-501 (and UC-50, section 7) |
| Core principle: legible greed, version 3 | Whose word counts, and whether the core judges a lone sale | D-519, D-520, D-521 (and UC-50, section 7) |
| The path to MOR 2, draft 1 | How a cMIP plugs into an agreement | D-525 |
| MOR in one page, version 11 | How a group ends, and how a work is given to everyone | D-533, D-534 |

Part 3 names five ways most of these change: "who must sign a change, how a buyer signs on, who confirms a sale, whether anything ever ends, and who sees how money was divided."

## 6. The cMIPs and Modules that lean on the old Agreements

For the Dubsar Suite lead. Part 2's names, latest drafts only, with what each leans on as part 2 gives it (its W and A numbers are part 2's). Named only, not analysed or sorted by kind.

| part 2 | specification | leans on |
|---|---|---|
| M-001 | `cmips/cmip-anchoring-draft-8.md` | publication, price tag |
| M-002 | `cmips/cmip-appended-collective-draft-1.md` | an old Agreements draft; collective, departed holder |
| M-003 | `cmips/cmip-collective-control-draft-6.md` | an old Agreements draft; collective, control model |
| M-004 | `cmips/cmip-conversion-draft-5.md` | publication, price tag; contest of a purchase |
| M-005 | `cmips/cmip-corrections-draft-2.md` | collective |
| M-006 | `cmips/cmip-grant-limits-draft-4.md` | grant, collective, rules 56 to 60 |
| M-007 | `cmips/cmip-live-media-draft-1.md` | an older Agreements (draft 10): offers, sale states, the work claim |
| M-008 | `cmips/cmip-member-keys-draft-2.md` | collective |
| M-009 | `cmips/cmip-money-messages-draft-6.md` | publication, split service, terms fields 8, 14, 28, 29 |
| M-010 | `cmips/cmip-naming-draft-1.md` | a publication's chain of versions |
| M-011 | `cmips/cmip-nudge-draft-4.md` | collective |
| M-012 | `cmips/cmip-payment-draft-6.md` | purchase, publication, ownership agreement, split service |
| M-013 | `cmips/cmip-relay-transport-draft-7.md` | grant, signature act, collective |
| M-014 | `cmips/cmip-release-manifest-draft-5.md` | collective |
| M-015 | `cmips/cmip-rotation-notice-draft-1.md` | an old Agreements draft; negotiation message |
| M-016 | `cmips/cmip-runner-draft-6.md` | collective, `objects` |
| M-017 | `cmips/cmip-specification-card-draft-2.md` | publication |
| M-018 | `cmips/cmip-split-draft-4.md` | an old Agreements draft; publication, split service, split plan |
| M-019 | `cmips/cmip-website-draft-12.md` | collective, "publication" |
| M-020 | `modules/module-airgap-chain-key-signer-draft-6.md` | collective's key grammar, grant, abandonment |
| M-021 | `modules/module-lightning-rail-draft-3.md` | an older Agreements rule; purchase |
| M-022 | `modules/module-onchain-rail-draft-3.md` | collective, split service |

Part 2 left the three media Modules (`module-audio-draft-1`, `module-jpeg-draft-1`, `module-video-draft-1`) uncounted, because "a public publication describes" there is Envelopes' older sense of "publication", and "lists them here so that the joining session can decide". This session is told to decide nothing beyond its sources, so they stay uncounted here, and are left open for the Dubsar Suite lead.

## 7. Every unclear case, in one scheme

One number for each case, UC-01 to UC-52, with each part's own number beside it. The order is the parts' own: first the cases each part marked as changing a verifier's answer, then the rest. Part 1's unclear places carry no case numbers: the scribe grouped them by what they share, citing the rows; the groups and their names are the scribe's, and each group keeps part 1's own marking. Part 3 does not mark which of its cases change a verifier's answer, so its six come last, as it gives them.

**Where the parts disagree on whether a case changes a verifier's answer.** Part 1 marks C-677, C-979, C-461 (which hash is the Agreements MIR's), C-945, C-948, C-950 (task numbers) and C-012, C-193, C-686 (money sent to a bare bake) as places where a verifier's answer would turn. Part 2 puts the same questions (U-09, U-10, U-11) among those where the answer "does not turn, or turns less". Both markings are kept as the parts gave them; none is chosen.

### Those that change a verifier's answer, as the parts marked them

**From part 2** (each in part 2's words, shortened):

- **UC-01 (part 2, U-01). A co-owner sells the work alone, by an offer of her own** (S-017, S-051, S-135). Draft 24: "valid, visibly contradicting it, … never prevented". Draft 25: if her Terms name the work's envelope and she is not the holder of the baker's rights at the act they cite, they are **invalid** (G14.3(a)); if they name no envelope, G14 is not asked. The answer could be valid or invalid. See also UC-50 (part 3, U4).
- **UC-02 (part 2, U-02). A Money-only wallet buys** (S-025, S-140). Draft 25 does not say whether a payment from a payer who signs no assent is still a buyer's payment under the offer, or only one that reaches the receiver (G11.6(b), G1.4).
- **UC-03 (part 2, U-03). "Pending" and "unknown"** (S-254). Draft 25: "The core's 'unknown', 'void' and 'pending' have no word here"; its own word is **unchecked** (G9); it does not say they are the same.
- **UC-04 (part 2, U-04). A signer rotates and disowns an act others relied on** (S-105, S-129, "and the collective's rotations"). Draft 25 lists the Sign layer's answer as needed (8.1-3); G12.5 is written for a tip a resolving update sets aside, not for a rotation.
- **UC-05 (part 2, U-05). A buyer's contest through a conversion service** (S-150). With two hops and two receipts, which act is "the settlement the payment names" (G11.8) is not said, so whether the contest is a buyer's, or **unchecked**, cannot be told.
- **UC-06 (part 2, U-06). A contest by someone who is not the buyer** (S-066, S-150, S-151). Draft 24: it "shows nothing". Draft 25: it "reaches the signers of what it is made against", and "Who else may make a contest, and when, is not said". See also UC-47 (part 3, U1).
- **UC-07 (part 2, U-07). A version the settlement never saw** (S-113). Draft 25: "A resolving update MUST name every tip" (G12.3); it does not say what changes once a third version arrives after the resolving update was accepted.
- **UC-08 (part 2, U-08). Acts racing the end of a power, with no order from citing and no place named** (S-170, S-246). Draft 24: "void". Draft 25: **not shown** (G5.4), and nothing is set aside (G5.7); whether "per place" or "not shown" applies cannot be told.

**From part 1** (its section "Where a verifier's answer would turn on it", grouped by the scribe; the reasons are part 1's):

- **UC-09 (part 1). Acknowledging without `acks`** (C-037). Unclear whether draft 25's naming in the payload (`relies_on`, `answers`) counts as acknowledging.
- **UC-10 (part 1). Loops and nesting** (C-115). Draft 25 says nothing of loops refused or nesting bounded at eight.
- **UC-11 (part 1). A settlement's finality, and a tip the resolving update did not name** (C-144). Unclear whether draft 25 reads it as "nothing reopened".
- **UC-12 (part 1). A share reduced without its holder's signature** (C-130). Which parts an update may change, and who must sign, is the update condition's; default everyone who signed the original.
- **UC-13 (part 1). "The payment decides", and a wrong receipt** (C-214). Draft 25 shows two reports matched or mismatched and chooses neither; "counting for nothing" is not said of a receipt.
- **UC-14 (part 1). Money sent to a bare bake, or a tip, goes to its uploader** (C-012, C-193, C-686). Where it goes is not said in draft 25; G14 gives the baker's rights to the holder at a transfer. See also UC-28 (part 2, U-11).
- **UC-15 (part 1). The payment cMIP an agreement names** (C-073, C-731, C-734, C-843). Draft 25's Terms have no payment socket; a payment holds K6 (G11.7).
- **UC-16 (part 1). A buyer read from a payment claim** (C-730, C-807). Draft 25 reads a buyer from an assent, not from a claim.
- **UC-17 (part 1). An update closing what was owed** (C-760). Draft 25 does not say an update closes anything owed under the version it replaces.
- **UC-18 (part 1). What `objects` a text act may carry** (C-640, C-643). Draft 25 says nothing of text acts.
- **UC-19 (part 1). What a client shows before signing** (C-650). Unclear whether an assent or another Statement is meant; draft 25 writes its one client duty in G12.8 "and nowhere else".
- **UC-20 (part 1). Whether draft 25's hash is the Agreements MIR's, one of the six** (C-677, C-979, C-461). See also UC-26 (part 2, U-09) and UC-30.
- **UC-21 (part 1). Whether Envelopes keeps a vow act** (C-693, C-060, C-1005). Draft 25's vow is "the same thing" as an offer "but without bytes attached"; what "bytes attached" means is open (8.4).
- **UC-22 (part 1). A keyless genesis without collectives** (C-552). Whether it has any use left.
- **UC-23 (part 1). Scoped keys** (C-544, C-557). No draft 25 act installs a key; whether another MIR installs scoped keys.
- **UC-24 (part 1). Task numbers and `task-ref`** (C-945, C-948, C-950). Draft 25's tasks carry no number; it does not read a cMIP's field 2. See also UC-27 (part 2, U-10).
- **UC-25 (part 1). Which names which, cMIP or Module** (C-896). Draft 25 has the cMIP name the module; Development has the Module name the cMIP in field 5.

### The rest

**From part 2** (its "The answer does not turn on these, or turns less"):

- **UC-26 (part 2, U-09). Which hash Agreements is frozen under** (S-312). Whether the freeze step applies to draft 25, a file in `docs/`, and what becomes of acts written under its present hash.
- **UC-27 (part 2, U-10). Task numbers** (S-091, S-298). Whether Development's numbers still name any of K1 to K8.
- **UC-28 (part 2, U-11). Money sent to a bare bake** (S-014, S-277). Draft 25 says nothing of a payment to a bare bake, or whether "unsplit" means anything there.
- **UC-29 (part 2, U-12). Publication as offer** (all of part 2's rows pointing at its W13). Draft 25: "That reading is Claude's (section 8.4)".

**From part 1** (its "The rest, in file order", grouped by the scribe; every one of the 171 rows is in exactly one group):

- **UC-30 (part 1). Whether draft 25 stays the Agreements MIR in `spec/`, one of the six, layer 4, and under which hash** (C-003, C-004, C-023, C-093, C-096, C-514, C-515, C-537, C-566, C-658, C-711, C-721, C-766, C-852, C-869, C-873, C-877, C-894, C-940, C-941, C-942, C-964, C-968, C-969, C-970, C-971, C-980, C-984, C-991, C-998, C-1023, C-1024, C-1025).
- **UC-31 (part 1). Records of earlier drafts and approvals** (C-1001, C-1010, C-1017, C-1026, C-1027, C-1028, C-1029, C-1030, C-1031, C-1032, C-1033).
- **UC-32 (part 1). The vow** (C-005, C-061, C-065, C-174, C-175, C-664, C-691, C-707).
- **UC-33 (part 1). Price tag, purchase, buyer, tips and bare bakes** (C-006, C-016, C-056, C-090, C-191, C-216, C-506, C-685, C-720, C-757, C-785, C-786, C-824, C-953).
- **UC-34 (part 1). The payment cMIP, rails and ways of paying** (C-087, C-724, C-756, C-804, C-849, C-850, C-855).
- **UC-35 (part 1). Works, offers, shares and receivers** (C-011, C-015, C-091, C-132, C-161, C-166, C-188, C-192, C-222, C-355, C-473, C-716, C-719, C-846).
- **UC-36 (part 1). Obligations, what is owed, refunds, confirmations** (C-077, C-078, C-079, C-095, C-202, C-203, C-207, C-223, C-737, C-761, C-788, C-814, C-815).
- **UC-37 (part 1). Delivery and access** (C-019, C-058, C-915).
- **UC-38 (part 1). What a client shows, and the words of answers** (C-029, C-030, C-122, C-123, C-217, C-634, C-649, C-656, C-659, C-765, C-1008).
- **UC-39 (part 1). Keys, rotations, keyless identities, "disputed"** (C-038, C-039, C-042, C-118, C-262, C-542, C-553, C-562, C-564, C-575, C-590, C-597, C-740, C-742).
- **UC-40 (part 1). Acknowledging, `objects`, `refs`** (C-054, C-648, C-775, C-777).
- **UC-41 (part 1). Delegation** (C-425, C-428, C-429, C-433, C-435, C-668, C-713, C-1012).
- **UC-42 (part 1). Versions in force, forks and settlements** (C-107, C-117, C-145, C-146).
- **UC-43 (part 1). Place** (C-260, C-266).
- **UC-44 (part 1). Contests, judges, the last resort** (C-450, C-456, C-988).
- **UC-45 (part 1). Tasks, cMIPs, Development's numbering, fees** (C-018, C-458, C-465, C-805, C-879, C-890, C-891, C-893, C-901, C-921, C-925, C-928, C-951, C-952, C-972).
- **UC-46 (part 1). "Publication" that may be Envelopes' media, not Agreements' type 6; the bake and the core's tags** (C-611, C-652, C-653, C-666, C-992, C-993, C-1004).

**From part 3** (not marked by part 3 as changing a verifier's answer or not; in its words, shortened):

- **UC-47 (part 3, U1). Who may contest, beside a buyer and a baker** (D-016, D-044, D-079, D-101, D-149, D-200, D-256, D-275). "Who else may make a contest, and when, is not said"; the things contested may be neither an offer nor a vow. See also UC-06.
- **UC-48 (part 3, U2). A MOR2 act replacing a MOR1 version** (D-108, D-523). Draft 25 says nothing of Terms written under another specification naming one of its versions in `replaces`.
- **UC-49 (part 3, U3). Reselling a game licence** (D-189). Whether a resale is an update of the licence's Terms or a new filling of a spot.
- **UC-50 (part 3, U4). A co-owner who sells alone** (D-496, D-520). G14.2 settles it only for Terms that name an envelope; the documents do not say whether the work is baked or the co-owner is the holder. See also UC-01.
- **UC-51 (part 3, U5). "The way out" in the philosophy door** (D-539). Which text the doors report means.
- **UC-52 (part 3, U6). Showing the next link's terms along a subcontracting chain** (D-163). Whether that is a data cMIP's question (K8).

## 8. The rows

- Part 1, the core (rows C-001 to C-1034, working list W01 to W57): [`old-agreements-pointers/part-1-core.md`](old-agreements-pointers/part-1-core.md), from branch `claude/old-agreements-pointers-core-lukvvs`.
- Part 2, the suite, cMIPs and Modules (rows S-001 to S-313, M-001 to M-022, cases U-01 to U-12, working list W1 to W49 and A1 to A8): [`old-agreements-pointers/part-2-suite.md`](old-agreements-pointers/part-2-suite.md), from branch `claude/old-agreements-pointers-suite-940qmw`.
- Part 3, the documents (rows D-001 to D-539, cases U1 to U6, "The story changes"): [`old-agreements-pointers/part-3-documents.md`](old-agreements-pointers/part-3-documents.md), from branch `claude/old-agreements-pointers-documents-s1i17o`.

The three files are copied here unchanged.

## Rows to check

Rows and markings that look wrong to the scribe, left as the parts wrote them, each with the reason. None is corrected.

1. **Part 2, rows that do not carry their case.** Part 2's plain words say "Those rows say "unclear (U-01)" and so on". But S-017 and S-051 (cited by U-01) say "see U-01", not "unclear"; S-113 (U-07), S-151 (U-06), S-170 and S-246 (U-08) name no case at all; U-04 cites "the collective's rotations" with no row numbers; U-12 cites "all rows pointing at W13", and none of them names U-12. A reader following a row will not find its case.
2. **Part 2, S-014 and S-277** are "a word to change", while their case U-11 says draft 25 "says nothing of a payment to a bare bake". By part 2's own definition, a place for which draft 25 has nothing is "a concept gone".
3. **Part 2, S-110** is cited in part 2's plain words as a place where the verifier's answer changes ("counts" in draft 24, "counts for nothing" in draft 25), but it carries no case, and is not among the eight that "change a verifier's answer".
4. **The verifier-answer marking differs between part 1 and part 2** on the same three questions (section 7, opening): which hash is the Agreements MIR's, task numbers, money sent to a bare bake.
5. **Part 3's working list** marks "Deal" as "renamed" although draft 25 keeps the word "deal" with another meaning (part 1, W28 "same word, meaning changed"; part 2, W5 "kept, another meaning"); and it marks "mark" inside a "renamed" row although parts 1 and 2 have it "dropped" (section 3).

## The cold reader's check

Before the pull request, sections 1, 4 and 5 were given to a subagent that had seen neither the ledger, the parts nor the prompt, and it was asked where it stumbled. It found 24 stumbles. Fixed in the wording: who the three parts are and that "the old Agreements" is draft 24; the decision the list is for; who "he" is in 4b; what an "Arrived at (to check)" line is; the scribe's summary in 4b labelled as the scribe's; "25 of them"; "22 further needs"; which order "the first" case follows; that the 20 needs are draft 25's section 8.1; what the C-, S-, D- and UC- numbers are; why rows that name Identity, Money or Development still say "layer not named" (N13 and N21 reworded); the U-labels in section 5 now point to section 7; "no place" for the companions' README; the doors list's date; who Lena is; and the case studies' numbering.

**Not fixed.** The protocol's words (MICS, MIR, cMIP, Module, freeze, trust root, spec hash, socket, Terms, bake, baker, envelope, knots, anchoring, Statement) are explained at the head of this file, which the reader was not given, and not again in each section; many need draft 25 itself. Draft 25's rule numbers (G, K, P, E, R) point to texts not shown here. "Valid and not valid, invalid" and "the security rules'" are draft 25's own words, quoted, and are not reworded. "MOR2" and "MOR 2" are spelled as each document spells them. In N1 the items after the colon are the several ways the parts' rows ask the one question.
