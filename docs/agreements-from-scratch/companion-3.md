# Agreements, from scratch: companion to draft 8

13 November 2026. A record of work by Claude: how the research is used in `draft-8.md`. Not a decision, and not part of the grammar. Nothing here is read by a verifier.

*Changed for draft 9, in two rows of section 2 only: #6 Commit (a counter signature, from S37 in `draft-9.md`) and #48 End (no term "void", from S39 and W2 there). Draft 9 changes no rule number, so everything else here reads the same against `draft-9.md`.*

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR".

**Why this file exists.** Nobody, allegedly, on draft 1: "Isn’t “how the 49 tasks land” more of a companion section, it says: this is how the research was used." So the landing table left the draft, with the rest of what records the research's use rather than the grammar itself.

**Why it is rewritten.** `companion-2.md` was written for draft 2 and not changed since; drafts 6 and 7 listed the rows they read differently. The MOR lead settled, under his delegation for technical wording and mechanics (the ledger's words, recorded there as the lead's): "the companion is rewritten for the new text". This file replaces `companion-2.md` for draft 8. `companion-2.md` stays in the repository as the record that drafts 2 to 7 point to. Written from `draft-8.md`, `companion-2.md` and `docs/decisions.md` only; the research texts were not reopened, so everything said of them here is carried over from `companion-2.md`.

"Rule" below means a grammar rule of draft 8 (rule 1 to rule 14), in draft 8's numbers: the central rule, an agreement as a party, is rule 1, and what drafts 2 to 7 called rules 1 to 9 are rules 2 to 10. K1 to K14 are draft 8's tasks. P1 to P19 are its open parameters. #1 to #49 are the research's 49 tasks in `docs/strangers-2026-11/agreement-tasks.md`.

---

## 1. What was used from each research text

| Text | Used for |
|---|---|
| `agreement-tasks.md` | The starting points (a record is a defence against the other party's future self; written for a third person), the 49 tasks, the four outside roles (register, witness, hand, judge), "what collapsed" (agency and groups as one; Current, Whole and Alive as one problem of absence), and the open offer's assignment of Align to the one who writes. |
| `agreement-grammar.md` | The five operations, the two properties (Keep and Check), the silent sixth operation (Apply, which needs no trust), the closed-world rule, the residue (truth, minds, hands), the second test ("a fork convicts itself"; a shared sequence needed only for scarcity and freshness; ownership as global as its witness set), and the third test (the record holds no value; receipts are the only clean proof that value moved). |
| `late-roles.md` | The four ways a role meets its person (doing, receiving, holding, being), read against the four spots in Nobody, allegedly's words (rule 10); the roles no agreement could anticipate (rule 10.4); the fraud of counted attention (rule 11); fixed pools (P6); and the payer as sole confirmer (rule 10's lie). |

What came after the research, and is not from it: the central idea, in the words of Nobody, allegedly, "The key concept is « agreement as a party » then it’s what you build with it that changes" (rule 1); the payment chain (rule 1.6 to 1.9); forks and how they end (rule 12); "now" as what an act cites (rule 13); and the baker (rule 14). Each comes from an exchange recorded in `docs/decisions.md`, and `draft-8.md` says which.

---

## 2. How the 49 tasks land

One landing per task, in draft 8. `companion-2.md` had two columns (draft 1's landing, and what draft 2 added); they are merged here, with what drafts 3 to 8 changed. This is Claude's reading of `draft-8.md`, not a rule.

| # | Task | Where it lands in draft 8 |
|---|---|---|
| 1 | Fix | Terms `body`; rule 2 |
| 2 | Identify | K2; "whoever does X": a spot (rule 10), K12; kind fits rests on K2; who baked a work: its envelope (rule 14.1) |
| 3 | Able | K3; cost |
| 4 | Align | rule 3; K1; K10 decides late |
| 5 | Free | K3; cost |
| 6 | Commit | assent; nothing counts until the Terms are in force (rule 4.1), and until then a party may cancel its own assent by a counter signature (rule 4.10); by act: a spot of kind done (rule 10), with a K4 rule in `in_force` |
| 7 | Exchange | Deliver (K9); rule 4 |
| 8 | Order | Order layer; rule 7; order from what acts cite (rule 13.3) |
| 9 | Keep | property (durable) |
| 10 | Check | property (verifiable) |
| 11 | Title | K4 over acts per place; rule 7; a spot of kind holding (rule 10); for a baked work: the baker, or a chain from the baker (rule 14) |
| 12 | Sum | K4; rule 7; from a pool: P6 |
| 13 | Transfer | Statement of a K11 kind under a power; rule 7; K8 if value moves; to a work: its receiver, an identity or an agreement (rule 1.3), for a split its own deal with its service (rule 1.6, 1.8); the one who receives, as a spot of kind received (rule 10); a baker's rights: along the work's own chain (rule 14.2) |
| 14 | Admit | power; rule 5; a newcomer foreseen: a spot (rule 10) |
| 15 | Bind | newcomer's assent; rule 5; filling a spot binds only by own assent (rule 10.3) |
| 16 | Due | date: K4, with time per the clock the agreement names (rule 7.4; P11, P16); position: K4 over place positions; event: K5 |
| 17 | Perform | K9 (receiver), K8 (controller) or K5; rule 8; being seen: the agreed witness only (rule 11) |
| 18 | Inspect | K5; rule 8 |
| 19 | Measure | K5; rule 8; counts of being seen: rule 11 |
| 20 | Acknowledge | Statement with `answers`; K9 |
| 21 | Record | Statements; rule 6; what an act relied on: `relies_on` (rule 13.2); read across agreements: K13 |
| 22 | Show | Deliver (K9) |
| 23 | Hold | K8; a service is a hand, under its deal with the work (rule 1.6); escrow: a service's cMIP; a pool: P6 |
| 24 | Secure | guarantor: assent; pledge: K8 |
| 25 | Separate | K8; rule 8; cost |
| 26 | Divide | K4 computes, K8 pays; a work is paid at the address its deal gives and divided by its own shares, and a share owed to a work is paid to that work in the same way, which makes a series of splits possible (rule 1.8, 1.9); a payment is divided by the version it was made under (rule 1.9); the fee and late payments: as the deal states (rule 1.7); from a pool: P6 |
| 27 | Authorise | a delegation, as Terms; rule 5, and 5.5 for who ends it |
| 28 | Scope | the power's K4 rule |
| 29 | Name | `for` and `under`; rule 5; one act for many: P12; an act made for an agreement: P17 |
| 30 | Decide | the power's K4 rule |
| 31 | Count | open: K4; secret: K7; counts of being seen: rule 11; "first 100 buyers": a `closes` rule (rule 10.9) |
| 32 | Notify | K9; by publication: rule 7 |
| 33 | Current | what an act names is its "now" (rule 13.1); "nothing later": per the place the agreement names, for every reader (rules 7.2, 7.4), and only where it names none per the reader's own anchoring (rule 13.4); another agreement's receiver now: rule 1.4 |
| 34 | Whole | rules 2 and 7 |
| 35 | Alive | presence: a fresh act, by K9 challenge; absence: K5 or K4 waiting rule |
| 36 | Wait | K4 over place positions; time per the clock the agreement names (rule 7.4) |
| 37 | Succeed | power named in advance; rule 5; an heir as a spot of kind received (rule 10) |
| 38 | Recover | K8, designed in advance; cost |
| 39 | Conceal | cost |
| 40 | Reveal | Deliver the Terms; check against fingerprint (rule 2) |
| 41 | Raise | Statement of a K11 kind, delivered (K9); a buyer's contest stays on the record (cost "Paid, and the author gone") |
| 42 | Hear | K9 plus K4 waiting rule |
| 43 | Judge | K10; power; rule 5; for a fork: a join, or an arbiter named in advance (K14, rule 12) |
| 44 | Final | the power's K4 rule |
| 45 | Enforce | from posted value: K8; otherwise cost; what a proven liar loses in standing: K13 |
| 46 | Complete | Statement of a K11 kind |
| 47 | Amend | a new version, with the signatures the last one requires (rules 4.8, 5.2) |
| 48 | End | nothing ends: an agreement only gets a new version, whose conditions say what becomes of the work and its shares (rule 4.9); an offer closes to new identities, by a version or by its own condition (rules 10.5, 10.9); rights are in force, or no longer in force, by the condition their own version names (rule 10.8); a delegation is ended by its delegator (rule 5.5) |
| 49 | Leave | Transfer of a part, or a new version whose conditions divide (rule 4.9) |

---

## 3. How the late roles land

`late-roles.md` lists eighteen roles and five that no agreement anticipated. This table is Claude's reading of which spot kind each would use under rule 10 (Spots; rule 9 in drafts 2 to 7). It is not a rule: a cMIP answering K12 decides what proves each one.

| Role (`late-roles.md`) | Its kind there | Spot kind (rule 10) | Also |
|---|---|---|---|
| Referrer | Doing | done | |
| Curator, reposter, broadcaster | Doing | done | rewarded for being seen: rule 11 |
| Reseller, distributor | Receiving | received | owes upstream: the maker's agreement as a party (rule 1), paid as any work is (rule 1.8) |
| Bearer, holder | Holding | holding | |
| Performer | Doing | done | |
| Cover artist | (not classified) | done | owes the songwriter: the song's agreement as a party (rule 1) |
| Sampler, remixer | (not classified) | done | owes the original: rule 1 |
| Sublicensee | Receiving | received | owes upstream: rule 1 |
| Assignee | Receiving | received | of a baked work outright: the chain from the baker (rule 14.2) |
| Heir, successor | Receiving | received | |
| Bounty claimant | Doing | done | |
| Open-offer acceptor | Doing | done | |
| Third-party beneficiary | Being | fits | |
| Carrier, host | Doing | done, or holding for a relay holding data | delivery to an audience: rule 11 |
| Later contributor | (not classified) | done | |
| Class member | Being | fits | a fixed fund: P6 |
| Informer | Doing | done | |
| Toolmaker, intermediary | (not classified) | done | a fee per use; or its own agreement as a party (rule 1) |
| The unknowing source | anticipated by none | future | |
| The rescuer | Doing; and anticipated by none | future | `late-roles.md`: "The law writes the open offer on everyone's behalf" |
| The owed but unfindable | anticipated by none | future | an unclaimed share of a pool: P6 |
| The contributor recognised afterwards | anticipated by none | future | |
| The early user | Being; and anticipated by none | future, or fits | its recorded fraud is "one person as many": stated cost on spots |

Two patterns from `late-roles.md` shaped rules 10 and 11 most:

- "The payer as sole confirmer appears in the affiliate and bounty cases." Rule 10 fixes the test, and its cMIP, before anyone claims.
- "Where claimants share a fixed pool (streaming royalties, class funds, airdrops), each fake claim takes from real claimants, and the payer has little reason to resist." Rule 11 for counted attention; P6 for pools.

---

## 4. Design direction for cMIP authors, from the research

This was section 5 of draft 1, and section 4 of `companion-2.md`. It is direction, not a rule: no verifier can check it. It left the draft because Nobody, allegedly, said "Just be mindful to not attempt to solve something the cMIPs will." It is kept here unchanged, as what the research suggests to whoever writes cMIPs.

Turn witness questions into K4 wherever the term can be computed from the record instead of observed in the world. Turn a hand into Control by posting value in advance (#45 Enforce becomes #26 Divide). Name several witnesses so that none can lie alone, and combine them with a K4 rule.
