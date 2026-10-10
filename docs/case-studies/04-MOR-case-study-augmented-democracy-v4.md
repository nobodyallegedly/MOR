# MOR Case Study: Augmented Democracy

*Case study, draft 4, 9 October 2026. Draft 3 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 2 to 6, nothing else changed. Item 1, the anonymous ballot, is left: the pass offers two fixes and leaves the choice to the author. Item 7 needed no change. The rest is unchanged, for the author's own passes. Draft 3's note follows.*

*Case study, draft 3, 27 September 2026. What MOR could be, with your help. Draft 3 corrects one claim after review round 2: an anonymous ballot cannot be a signed act, since every act names a signer; it is a sealed container whose form the voting cMIP defines.*

## Why this case study

Representative democracy selects people, who then select priorities. Citizens hand a whole bundle of wishes to a candidate every few years, and lose control of how that bundle is weighed. New technology makes another step possible: people can express their needs and priorities directly, and those priorities can create a targeted competition to serve them.

The idea behind this case study predates MOR by years; it was brought to MOR, not derived from it. That makes it a real test of the core: if a model of local democracy runs on rules designed for media and money, without any change to the core, the rules are general enough.

In one line: **creating healthy competition to serve common needs.**

This case study follows one community through three stages: a neighbourhood association trying it out, a commune running a consultative budget, and finally a binding budget decided through the protocol.

## 1. The model

**Points, not candidates.** Each participant receives a fixed pool of points per round, for example 100, and distributes them across the priorities that matter to them: a playground, safer crossings, a library, lower fees. The result is a live map of the community's needs, weighted by how much people care.

**All or nothing.** Taking part is voluntary. But whoever takes part allocates or delegates the whole pool; a ballot is always complete. Points of those who do not take part simply lapse.

**The allocation is the first feedback.** People always start by overspending on what they love or underspending out of caution. The last step of every ballot is the search for balance: the moment a citizen faces the same trade-offs the budget does.

**A protocol instead of a mayor.** No single decider allocates the budget. An overseer with limited powers guards the rules, coordinates projects and handles emergencies within defined bounds. The people who care most about each priority drive the projects that serve it.

**Delegation, for those who want it.** Anyone may hand some or all of their points to someone they trust, per topic, and that person may pass them on. Democracy becomes as granular as each person wants: allocate everything yourself, delegate everything, or anything in between.

## 2. First steps: a neighbourhood association

**The association sets itself up as a collective.** It is a full identity with its own home and keys, and a founding agreement that says how its keys are held: for example, two of five board members sign everyday acts, and four of five rotate its chain key.

**Members join with their own identities.** Membership is a signed list in the founding agreement, changed by cloning it and rotating the association's keys. Nothing is anonymous yet: in a small association, everyone knows who voted, and that is acceptable.

**A round is announced.** The association publishes the list of priorities for the round (renovating the clubhouse, a summer festival, new equipment) and the round's rules: pool size, whether allocation is linear or quadratic, delegation limits. The rules are a voting cMIP the association chose.

**Members allocate.** Each ballot is a signed act naming the round. Delegation is a grant: "my 40 points on events go to Sam". Sam signs the delegator's ballot with a key the delegator granted, and the delegator can revoke it with an everyday act until the round closes.

**The result is computed by anyone.** The tally is a rule anyone can run on the published ballots, giving the same result everywhere. Nobody announces the outcome; everybody computes it.

**Budget follows the points.** The association's budget is split across projects in proportion to the result, through a split plan in the association's agreement, a new version of which is signed each round. Each project's lead receives its share as a simple payment with its own receipt, and every franc is visible to members.

This stage needs no privacy technology at all, and it already tests the heart of the model: pools, delegation, tallies anyone can run, and budgets that follow the points.

## 3. A commune: a consultative budget

**Now privacy matters.** In a commune of a few thousand residents, a vote must be secret, and one resident must mean one ballot.

**A separate civic identity.** Each resident creates an identity used only for civic participation, unlinked to their other identities unless they choose to link them. Whoever uses MOR for state purposes uses a state-purpose identity; nobody can be forced to bind it to their media life, and any such link would itself be a visible signed act.

**The registry binds, but never sees votes.** The commune's residents' registry already knows who is eligible. In Switzerland it would use the AVS number. Each resident's app generates a secret and derives a commitment from it; the registry binds that commitment to a verified resident. At each round, the registry publishes the set of eligible commitments as a Merkle tree, never the names.

**Voting proves membership without revealing it.** An anonymous ballot is not a signed act, because every act names its signer; it travels as a sealed container, the wrapper the Envelopes MIP uses for private senders, whose inner form the voting cMIP defines. It carries a zero-knowledge proof that its author's commitment is in the tree, and a per-round nullifier that prevents voting twice without revealing who voted. The Semaphore protocol is the model to study. These proofs are checked by a credential module, through the Identity MIP's task for identity proofs.

**Coercion and vote buying.** A voter must not be able to prove to anyone how they voted. Designs such as MACI (Minimal Anti-Collusion Infrastructure) let a voter secretly change their ballot before the round closes, so any proof shown to a buyer is worthless.

**Delegation with privacy.** Delegates are public: anyone holding others' points acts in the open. Delegators stay private, which means a delegation in this stage is not a grant (a grant names its grantor) but a delegation record inside a sealed ballot, defined by the voting cMIP. Delegation remains revocable in secret until the round closes, which also makes buying delegations pointless. Caps on carried points, a maximum chain depth and expiry each round guard against super-delegates.

**The commune's relay filters by proof, not by person.** It accepts any ballot carrying a valid membership proof and an unused nullifier, and rejects the rest. Validity comes from the proof, not from the relay: citizens can submit anywhere.

**Anyone can check the count.** Voters can run a mirror of the commune's relay. At the close of the round, the relay publishes a commitment to the full set of ballots, anchored so that it cannot be changed later. Every mirror checks it holds the same set, and anyone can recompute the result.

**Consultative first.** In this stage, the result advises the council alongside its normal process. The commune learns how residents use their points, whether delegation concentrates, and how many take part, before anything binds.

## 4. A binding budget

**The budget has two parts.**

- **The maintenance floor:** the transparent cost of keeping current operations running. It is shown in full, so every resident sees what the baseline takes.
- **The adaptive margin:** what is left for growth or cuts, steered by the points.

Because each pool is fixed, raising one priority lowers another, exactly as in a real budget. The question put to each resident is: how would you balance your budget?

**Projects compete to serve the priorities.** For each funded priority, teams propose how to deliver it. The people who care most about an issue drive its project, as a collective with its own identity. Funding reaches them through the commune's split plan, each payment with its own receipt, so every franc can be followed from the budget to the project.

**The overseer's limited role** is defined in the commune's agreements: guarding the rules, coordinating projects, and acting in emergencies within stated bounds. Every act of the overseer is signed and visible.

**Deadlines and delivery.** Projects commit to milestones on a named time reference. Missed deadlines are visible; what follows (redirection of funds, a new round) is defined in the project agreements.

## 5. What MOR provides, and what it needs

**From the core, nothing new.** Everything above uses what the MIPs already define:

- **Identity:** separate civic identities, homes, and the task for identity proofs.
- **Envelopes and Text:** signed ballots where nobody needs anonymity, sealed containers where they do, published priorities, relays, commitments, mirrors and anchoring.
- **Money:** payments to projects and their receipts; points counted in their own unit, defined by a unit specification.
- **Agreements:** collectives and their key grammars, grants for open delegation, split plans for budgets, time references for rounds and deadlines, relying on the Envelopes' anchoring.

**Open for others to build (cMIPs and Modules):**

- **Voting cMIPs:** pool size, linear or quadratic cost, all-or-nothing ballots, delegation rules and caps.
- **A tally module:** the rule anyone can run to compute a result.
- **Credential modules:** registry-bound commitments, membership proofs and nullifiers, in the spirit of Semaphore.
- **Anti-coercion modules,** in the spirit of MACI.
- **A points unit module.**
- **Budget tools:** showing the maintenance floor and the margin, and translating points into money as residents allocate.
- **Relay software** for filtering by proof, publishing ballot commitments and running mirrors.

## 6. Honest limits

- **Trade-offs between needs** still require judgement; points express priorities, not solutions.
- **Metrics can be gamed:** projects rewarded on a number may optimise the number.
- **Who can afford to care:** engaged, connected people allocate most, and priorities may tilt toward them.
- **Local passion against the wider good:** a project may serve its drivers at others' expense; the overseer needs clear grounds to intervene.
- **Emergencies** cannot wait for a round.
- **Legitimacy** is earned slowly. Geneva abandoned its own e-voting system, CHVote, in 2019: verifiability for ordinary citizens matters as much as the cryptography.
- **Law comes first.** Binding budgets depend on what local law allows; the protocol can only offer the tools.

## 7. What it demonstrates

A protocol built for media and money turns out to carry a model of democracy without a single change to its core. Identities, signed acts, grants, collectives, splits and anchoring are enough. The same tools that let a band share its income let a neighbourhood share its budget, and in both cases every point, every franc and every decision is visible to the people it concerns.
