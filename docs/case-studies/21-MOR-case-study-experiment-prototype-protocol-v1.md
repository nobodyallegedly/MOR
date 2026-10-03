# MOR Case Study: Experiment, Prototype, Protocol

*Case study, draft 7, 30 September 2026. Not how MOR can be used, but how it passes from its author to the people who build on it.*

## Why this case study

Every other case study ends with a list of what still needs building. This one is about who builds it, and who asks what comes next.

MOR was designed by one person with a concept and built with one machine that writes code. Its core is frozen at inception, and nobody is appointed to carry it forward. A protocol that needs its author is not free.

The author does maintain one thing: the code repository. It is worth little in itself. The frozen protocol needs no one to control it, and anyone can fork the code. The repository is an excuse: a reason to gather the first builders into a collective, so that when he leaves, there is a group of people who know each other, and who will have to ask themselves what comes next.

## 1. The freeze

**The core is frozen.** Six rulebooks, their hashes published together, alongside a freeze report that says, rule by rule, what was tested against running code and what was only reasoned on paper.

**What exists on the day:** a core library with published test vectors; a few relays and three homes; a genesis client, a barebone client and a web reader; a Lightning module, a split module and a tool that reads agreements in plain words; the documents; the code repository, maintained by the author and signed on MOR with his own identity, because a collective of one would need a successor and a share of its key in escrow, and the collective is meant to be born with its builders; and two first acts, "Thank you for the shower…" with a photograph of the Earth, and the full text it comes from, written in London in 2014.

## 2. The bottles go out

**A short introduction goes out, one message at a time:**

> *MOR is a way for people to share, pay and agree with each other directly, where every cut is visible and anyone can leave. Its core is frozen, its code is open, and everything is running. Here is a link. The first thing you will read is a thank-you note. If something in it speaks to you, the rest is yours to build.*

It goes to selected university departments, to cryptography forums with the freeze report, and to a few people chosen because MOR answers a frustration they have spoken about. Most messages go unanswered. The snowball needs only a handful.

## 3. The handful

**Ines,** a cryptography student, reads the freeze report as a map of where nobody has dug. She writes her own implementation of the core, in Go, from the documents alone, and a module that checks any act against the published test vectors. Her one disagreement with the other implementations, a rule whose wording allows two readings, is the first finding from outside. When she publishes the module, she is the first builder the author would take in. She did not ask. Her work was the proof. There is no collective to add her to yet: a collective of two, each holding half of its key, could lose everything with either of them, so the author waits for a second.

**Aroha** has run relays for another protocol for years. She disagrees with half of how MOR's relays are built, so she writes her own relay, from the specification alone, and runs it her way. A month later, with her relay carrying real traffic, the three of them found the collective that maintains and signs MOR's code, any two of them able to act, its founding agreement visible to anyone. He keeps a veto over anything the collective publishes. From now on, joining is a clone of that agreement and a rotation of its keys.

**Dmitri** came for the post-quantum safety key in the code, and found the ceremony around it too heavy for anyone but himself. He builds a signer that lives on an old phone kept in a drawer, with a guided setup that takes five minutes, and asks Ines to attack it. She finds one flaw; he fixes it. He is the third to be added.

**Yuki** reads the shower text at night and does not sleep much. In the morning she finds the barebone client clumsy, and starts a mobile client that evening. It pairs with Dmitri's drawer signer from its first version. Ines finds a signature check it skips; Yuki fixes it overnight. After her client's third release, she becomes the fourth member.

**Kwame** hosts audio for a community radio station and is tired of paying a platform to hold its archive. He builds a relay made for sound, and the audio module that tells any client how to play it, because one is useless without the other. Aroha disagrees with how he prices storage, publicly; they end up offering each other's users a discount. When the station's archive has moved across, he is added.

**Noor** spends twenty minutes reading a hash aloud to her sister so her sister can find her, and writes a naming cMIP. Yuki's client adopts it; a stranger publishes a rival one, and she argues with him in public for a week, well. She is the sixth to be added.

**Olu** left a payments company with two friends to build a wallet for MOR, and a route from satoshis to francs and euros, each hop with its receipt and its fee: the first part of the network that makes real money. Yuki's client carries the wallet within a month. Olu is added last, because the layers his team works on are the ones the freeze report says were least tested, and somebody who lives in them should be in the room.

Seven people, none of whom asked, have now delivered every kind of work the author set as the condition, most of it more than once: Modules, relays, clients, cMIPs.

Then he leaves. Not in protest, and not to make a point: what remains to be done is building, and building is not his craft. He brought a concept. If it holds, the people who can build it are now in the room, and a veto held by someone who cannot build would only stand in their way. It is a rotation and a clone like any other member change. By his own founding rule, his departure forces those who remain to write the collective's rules again, without him and his veto. They do it in an afternoon. Then they reach the question his leaving was meant to put in front of them:

**How will the drafting of MOR2 be governed?**

## 4. What each version is for

Ines's ambiguous rule is already the first entry in a public file called "Notes for MOR2". Others will follow. Someone will have to decide how a successor is drafted, reviewed and frozen, and who gets a say. It will not be the author.

It is the question for now, because of what each version is for. **MOR is an experiment:** built by one person and one machine, frozen at inception, to find out what holds. **MOR2 will be a prototype:** built by the people who used the experiment, from what it taught them. **MOR3 will be the protocol:** earned through two predecessors, by whoever is building by then.

The story ends with the question open. That is the point of it.

## 5. What it took

**From the core, nothing new.** Everything here sits above the frozen core: implementations, relays, clients, cMIPs, Modules, a collective, and a file of notes. The freeze was the condition for all of it.

**What the handover needed:**

- **a freeze report honest enough** to tell strangers where to dig;
- **documents clear enough** to build from alone;
- **a first act that moved someone;**
- **a pretext to gather them:** a repository nobody needs to control, signed by a collective that exists mostly so its members meet;
- **builders chosen by what they built,** not by who asked;
- **an author who leaves,** so that the next question is theirs to answer.

**Honest limits.** Most snowballs melt, and a handful of builders can scatter as easily as they gathered. A collective without its founder can drift, stall or split. Nothing guarantees that MOR2 is ever drafted. The story claims only that MOR can be handed on cleanly, and that the question of what comes next can belong to the people who built.
