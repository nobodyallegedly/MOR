# MOR Case Study: Migration to MOR 2

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 3, nothing else changed; item 4 needed no change. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects section 7 after review round 2 (F54, F55, F63): the everyday key can migrate to a post-quantum scheme, and must, before a break.*

> *"If you wish, you can take all this when you leave."*

## The right of exit

Every part of MOR is built around one condition: **anyone can leave anything, and take what is theirs.** A home, a relay, a publisher, a split service, a platform, a collective, a cMIP, a module, a client, or MOR itself for its successor. Identity, works, stakes, agreements and history go with the person who leaves.

Migration to MOR 2 is simply the largest case of a right that runs through the whole design:

- **cMIPs compete** because nobody is locked into one: agreements move to another by cloning.
- **Modules are frozen and replaceable,** so no module can hold its users hostage.
- **Homes can be left,** through a normal rotation, a homeless rotation, or an escape with both keys.
- **Members can leave a collective** and keep their stakes in what they helped make.
- **Publications can be withdrawn,** and audiences follow identities, not platforms.

The health of MOR is measured by one question: *can I still leave?*

## Stated from the start

**MOR is built to be a good ancestor.** Its first release, MOR 1, is tested, attacked and fixed while changing the rules is still allowed, and frozen when it is presented, with a freeze report saying, scenario by scenario, what was run and what was only reasoned. After that, MOR 1 never changes; flaws, better ideas and broken cryptography are answered by a successor that runs alongside it. A community will build MOR 2, learning from MOR 1's mistakes, and MOR 2's own mistakes will lead to **MOR 3: the intended destination.**

This is not a confession of weakness. It is a design commitment. Fred Brooks wrote that you should plan to throw one away, because you will anyway. MOR plans for more than that: each version teaches, the next one corrects, and nobody loses who they are along the way.

It also sets what MOR 1 must get right. Most imperfections can be fixed by MOR 2. What cannot be fixed later is **the way out**: if people, their works, their agreements and their history cannot cross to the next version, every flaw becomes a dead end. So the exit is the one part of MOR 1 that has to be right from the start.

This case study shows how that crossing works, with the people from the other case studies: Lea and her band, Nico and his production team, and a commune running its budget.

## 1. Why MOR 2 will come

Three things make a successor certain:

- **Flaws found in use.** However carefully MOR 1 is reviewed, years of real use will reveal things no reviewer saw.
- **Better ideas.** Some of what the community learns on MOR 1 will not fit a frozen core.
- **Broken cryptography.** MOR 1's everyday signatures use elliptic curves. A large enough quantum computer would break them for everyone at once. Nobody knows when, but a core frozen forever will outlive them.

## 2. What MOR 1 already provides for the crossing

Everything below is already in the MIPs. Nothing needs to be added for migration to work.

- **Identities are hashes, not keys.** An identity survives any number of key changes, and can declare a successor.
- **Succession rides on rotation.** A rotation, signed by the offline safety key, can name the identity that succeeds this one, in MOR or in another protocol. A thief holding only the everyday key can never redirect an identity's followers, agreements or money.
- **Safety keys are post-quantum, and everyday keys can become so.** Even if elliptic-curve signatures are broken, nobody can forge a rotation or a succession, and nobody can forge a genesis, since the identity hash fixes it. And a signature scheme is a specification named by its hash, so when a post-quantum everyday scheme is standardised, anyone publishes it, clients adopt it, and owners rotate to it, with no change to the core.
- **Works are facts about bytes.** A work's hash is the same on any protocol, so a song or a video is recognisably the same work in MOR 1 and MOR 2.
- **Agreements change by cloning.** A clone names its parent and closes it. A clone into MOR 2 can name its MOR 1 parent, so every stake and obligation carries its history across.
- **Links to other protocols.** An identity can link to an identifier on another protocol, two-way where both sides sign.
- **Anchoring.** Any act can be anchored, proving it existed at a point in time, whatever happens to signatures later.
- **Data stays in core formats,** so no module can hold anyone's history hostage.

## 3. MOR 2 arrives

**Years into MOR 1,** a community of developers, some of whom built MOR 1's modules, publishes MOR 2. It fixes things MOR 1 got wrong and adds what MOR 1 could not. Like any specification, MOR 2 names MOR 1 as its predecessor, and its documents explain what changed and why.

**Nobody is forced to move.** MOR 1 keeps running, unchanged, for as long as anyone uses it. Adoption decides, exactly as it decides which cMIPs and Modules survive: the evolutionary model, now at the level of the protocol itself.

**Both run side by side.** Clients learn to speak both. Relays carry both. For a while, most people live in MOR 1, a few in MOR 2, and bridges carry messages and payments between them.

## 4. Lea's band crosses

**The band decides to move.** It creates its MOR 2 identity, then rotates its MOR 1 identity with its safety key, declaring the MOR 2 identity as its successor. Under the band's key grammar, this needs the signatures its founding agreement requires for a rotation.

**Followers follow.** Every client that reads the band's MOR 1 identity sees the succession, signed by the safety key, and can offer to follow the band on MOR 2. Nothing is lost in the move: the followers are the same people, now pointed at the new home.

**Works keep their identity.** The band's songs have the same work hashes in MOR 2. The band publishes MOR 2 claims naming its MOR 1 claims, so the chain of ownership is unbroken.

**Agreements cross by cloning.** Each song's agreement is cloned into MOR 2, naming its MOR 1 parent. The clone rule applies as usual: every stake holder whose share would change must sign, and nobody's share can shrink without their signature.

**Someone does not follow.** The drummer who left years ago never moves to MOR 2. His stakes stay valid in MOR 1, and the MOR 2 clones carry them unchanged: his share keeps paying him, through a bridge, until he chooses to cross. Where an agreement names an abandonment clause, it decides what happens if a party can no longer be reached.

**The label hesitates.** The label's deal needs the label's signature to be cloned. Until the label moves, that deal stays in MOR 1 and keeps working there. Coexistence means nothing breaks while people decide.

## 5. Nico's team crosses

The production team moves the same way: succession through a rotation, works keeping their hashes, agreements cloned with their parents named.

The coproduction with the streaming service is the slowest to move: it involves a company, a keeper, milestones and an exclusivity window. It simply continues in MOR 1 until its parties agree to clone it, or until it ends. Subscribers' records of what they paid for stay valid wherever they were made.

## 6. The commune crosses

Civic identities cross by succession like any other. For a budget, the cleanest moment is between rounds: the last MOR 1 round closes, its ballot commitment anchored, and the next round opens on MOR 2. The history of past rounds stays verifiable on MOR 1 forever.

## 7. If the cryptography breaks

This is the hard case, and the reason MOR 1 is built the way it is.

**The day elliptic-curve signatures fall,** anyone with a large enough quantum computer can forge everyday acts for any identity: posts, receipts, agreements signed with signing keys.

**What survives:**

- **Identities, for owners who prepared.** Rotations and successions are signed with post-quantum safety keys, which the break does not touch. But whether a rotation *counts* rests on receipts, objections and summaries signed by homes and auditors with everyday keys; after a break those can be forged too, and a forged objection can block a homeless rotation. So the exit after a break belongs to owners who hold both keys (the escape needs no home's consent) and, above all, to owners who migrated their everyday key to a post-quantum scheme before the break, along with their homes and auditors. Migration comes first; the safety key is the last resort, not the plan.
- **Genesis.** Nobody can forge an existing identity's genesis, since the identity hash fixes it.
- **Anchored history.** Every act anchored before the break stays trustworthy: its existence at that point in time is proven independently of its signature.

**What becomes disputable:** everyday acts that were never anchored. After the break, a forged act and a genuine one can look the same.

**The cost of not anchoring.** This is where a principle from MOR's earliest design sessions pays off. Anchoring is optional: each party decides what is worth anchoring, their risk, their dial. Money has a rule of its own: name a clock and anchor, or bear the loss of a theft. Deals of lasting value, such as a label contract, a coproduction or a commune's ballot commitment, are anchored. A casual post may not be. When the break comes, what was anchored crosses intact, and the migration to MOR 2 has solid ground to stand on.

**Migration must be prepared before the break.** Successions, anchoring and dual-protocol clients all need to exist before they are urgently needed. So does the post-quantum everyday scheme: it is a specification anyone can publish, and the sooner it is adopted, the less the break can touch. That is why this case study is written now.

## 8. From MOR 2 to MOR 3

MOR 2 will have its own flaws. Its builders will have learned from MOR 1, and the builders of MOR 3 will learn from both. If each version provides a clean way out, the path is repeatable: the crossing described here works from any version to the next.

MOR 3 is the intended destination because by then the protocol will have been tested twice by real use, at scale, over years. Not a guess at the right design, but one earned through two predecessors.

## 9. What MOR provides, and what it needs

**From the core, nothing new.** Succession in rotations, post-quantum safety keys, identities as hashes, work hashes, cloning with named parents, links to other protocols, anchoring and core data formats are all already defined.

**Open for others to build (cMIPs and Modules):**

- **An anchoring cMIP,** for example wrapping OpenTimestamps, which anchors hashes to Bitcoin in batches at almost no cost, so anchoring is one click from day one.
- **Dual-protocol clients** that speak MOR 1 and MOR 2 during coexistence.
- **Succession-following logic** in clients: offering to follow an identity to its successor.
- **Agreement migration tools:** preparing clones into MOR 2, gathering signatures, and tracking who has and has not crossed.
- **Bridges** for messages and payments between the two protocols.
- **Anchoring reminders:** clients suggesting which acts are worth anchoring, based on their value.

## 10. Honest limits

- **MOR 1 can make the crossing possible; it cannot make MOR 2 accept it.** Whether MOR 2 honours MOR 1's successions, claims and agreements is MOR 2's choice. This case study is also an invitation to MOR 2's builders to do so.
- **Unanchored history is at risk after a break.** Anchoring is cheap, but it is a choice, and many will not make it.
- **A lost safety key means no succession.** An identity whose owner lost the offline key can never rotate or declare a successor.
- **An unmigrated everyday key is exposed after a break.** The safety key secures the exit; it does not secure the homes, auditors and keepers whose signatures decide whether that exit counts. Owners, homes and auditors who did not migrate before the break leave only with both keys, and cannot rely on what they left behind.
- **Parties who refuse to sign stay behind.** Agreements needing their signature remain in MOR 1 until they agree, the agreement ends, or its abandonment clause applies.
- **Coexistence splits attention.** For a while, audiences and markets are divided across two protocols; bridges soften this but do not remove it.

## 11. What it demonstrates

A frozen protocol does not have to be a trap. By making identities hashes, successions post-quantum, works recognisable by their bytes and agreements clonable with their history, MOR 1 lets everyone cross to what comes next, carrying who they are, what they made and what they are owed. That is what it means to be a good ancestor: MOR does not need to be the final protocol. It needs to lead cleanly to the next one, all the way to MOR 3.
