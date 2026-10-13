# The path to MOR 2

*Draft 1, 13 October 2026, by the project lead, for Nobody, allegedly, to redraft in his own hand. A companion document: it explains, it adds no rule. It goes out with the first wave of the call to universities (`docs/roadmap-v1.md`, "The way to the freeze, and the first wave"). It writes down what was decided in F269, F278, F286, F287 and F288, and nothing beyond them. Square brackets mark what cannot be filled in until later steps.*

---

## In short

MOR is a way for people to share, pay and agree with each other directly, where greed is legible and anyone can leave.

MOR 1 is finished and frozen. In its author's words, it is "an experiment, not even a prototype". Its rules will not change. What you break in it is recorded, in the open, and becomes the ground MOR 2 is built on.

We are asking two things of you:

1. **Break the core.** Find where MOR 1 fails, and tell us where.
2. **Build above it.** Make what the core leaves to others, now, on MOR 1 as it is.

The rest of this page says how to do each, and what happens to what you send.

## MOR 1 is frozen

The core of MOR is one specification, the **MICS** (MOR Inscribed Core Spec), read layer by layer through six texts, the **MIRs** (MOR Inscribed Rules): Identity, Text, Envelopes, Money, Agreements and Development. A freeze test suite says what must be tested. The six texts are published with their hashes, and every MOR 1 client takes those six hashes as its one root of trust.

Frozen means frozen. There is no process for changing a MIR, no vote, no committee and no patch. If you find a rule that is wrong, it stays wrong in MOR 1, and the finding is written down beside it. Code that misreads a rule is a different thing: that is a bug in the code, and code can be fixed. The rules cannot.

Why freeze an experiment? Because a moving target cannot be broken properly. A frozen MOR 1 is something you can attack today and still be attacking the same thing next year. Every break you find is a fact about a fixed object, and that is what MOR 2 needs.

How it was made, plainly: MOR was designed by one author without a coding background. The specifications were drafted, and the code written, with AI, and reviewed by AI. Much of it has not yet been read by any human expert. That is the main reason you are being asked. The paper in the repository says what was run and what was only reasoned.

## Break the core

Where to start, if you want a hint: identity continuity (what happens when keys are stolen, lost or rotated), ordering without a clock, and whether anything people really do needs something the core cannot say. The case studies on dubsar.org are a good source of real situations to throw at it.

Anything counts: a flaw in a rule, two rules that contradict each other, a gap between layers, an attack on the economics, a place where the code and the text disagree, a test the freeze suite should have and does not.

### How to report a bug or an attack

**On MOR.** MOR has a public reporting identity, with an inbox [its identity, to be made at step 17, when the first real identities are created]. You send a report to it as a signed act from your own MOR identity. A report is then a record like any other on MOR: it carries your signature, nobody can change it afterwards, and anyone can check who said what and when.

Reports are kept and answered in the open. Every report, and every answer to it, can be read by anyone. Nothing is triaged behind a door.

**On GitHub, if you are not on MOR yet.** The repository's issues are open as a mirror: [github.com/nobodyallegedly/MOR/issues](https://github.com/nobodyallegedly/MOR/issues). Use them if making a MOR identity is one step too many for now. What is reported there is answered there, and carried into the same open record.

*Precisely (F287): the reporting identity is an ordinary MOR identity with an inbox; a report is a signed act addressed to it; it is kept and answered in public; GitHub issues mirror it for those not on MOR yet, as GitHub mirrors the repository until MOR's own release browser is good enough (F277).*

## How MOR 2 is proposed

MOR 2 is the prototype that comes after the experiment. It will not be MOR 1 with fixes: it is a new protocol, made from what breaking MOR 1 taught.

**Proposals for MOR 2 are MIPs.** The name comes down from Bitcoin's BIPs and Nostr's NIPs, which are proposals; MOR 1's frozen texts were renamed MIRs, rules, so that "MIP" stays free for exactly this (F269). A MIP is drafted the way the MIRs are: one layer at a time, in the same shape. A MIP for Identity, a MIP for Text, for Envelopes, for Money, for Agreements, for Development. If MOR 2 needs a layer that MOR 1 does not have, that new layer gets its own MIP (F286).

A MIP is judged against what MOR 1's breakage taught. The question a MIP has to answer is not "is this a good idea?" but "which recorded break does this answer, and what does it cost?". That is why the record of what broke matters so much, and why it is kept in the open.

MOR 1 gives MOR 2 a few things to start from:

- **Extensions in wide use** show which tasks MOR 2 needs. If many people build the same thing on top of MOR 1, that is a sign the core should have had a place for it.
- **Identities and agreements can move.** MOR 1 identities can declare a successor and link both ways; agreements are kept in a format that can be cloned across. People move to MOR 2 by choice, taking their history with them.
- **No confusion between the two.** A successor protocol must use a different tag prefix in everything it signs, so no act from one is valid in the other.

**Nobody owns MOR 2.** Nobody has been appointed to decide what comes next, and the author is not keeping that role. MOR 2 is anyone's to propose, and anyone's to build. If several groups build different successors, people choose between them by moving, as they choose everything else on MOR.

## Build now, above the core

You do not have to wait for MOR 2 to build. The core is deliberately small. Almost everything people would want is left above it, to whoever builds it best.

There are two kinds of things to build:

- **cMIPs**, community MIPs: specifications for what the core leaves open. A cMIP plugs in one of three ways:
  - a **task**: a numbered point where a MIR hands work to a cMIP, which an agreement may name (how a payment is split, for example);
  - an **extension**: rules an agreement adds on top of the core, for something nobody foresaw. An extension may add rules, never relax the core's;
  - an **xtype**, "extra type": new kinds of acts built from core pieces, filling no task. Clients that have not adopted it show those acts as unknown (F278).
- **Modules**: implementations and extensions under a MIR or a cMIP, such as one payment rail under the payment cMIP, the code that plays a kind of media, or a way to keep a key on an offline device. A Module is a specification too: it signs nothing and holds nothing; the people acting under it do.

Every cMIP and Module is named by the hash of its content and signed by whoever made it. Once published, it never changes; a better version is a new one, which can name the one it replaces. Its maker can state a fee in it, and is paid only where an agreement signs that fee in.

**They compete on adoption.** There is no registry, and there will not be one in the core. Nobody approves a cMIP; people use it or they do not. That is the whole selection process: "zero democracy on the MICS; a free market on cMIPs and Modules, where adoption decides".

### Finding what exists

With no registry, how do you find what others have built? By looking where they publish. To show this working, dubsar.org runs a listing [its address, once built] that reads the cMIPs and Modules published on the relays it follows and shows each one's name, its layer, whether it is a task, an extension or an xtype, its drafts, and its code.

It says, on its own page: **one listing among any; anyone can run another.** It decides nothing, ranks nothing by authority, and leaves nothing out on purpose. If you think it is missing something or shows it badly, the answer is to run a better one (F288).

## What we keep about you

Nothing. This call collects nothing about its readers: no tracking, no analytics, no mailing list, no follow-up messages. If you do not answer, you will not be chased.

The way back is always open, whenever you want it:

- the box on dubsar.org;
- MOR itself, to the reporting identity, from your own identity;
- the contact address, [nobodyallegedly@dubsar.org](mailto:nobodyallegedly@dubsar.org);
- GitHub issues, as above.

If you wish to start a conversation, the route is clear.

## Where to read next

- **The MICS** and the six MIRs, in `spec/` in the repository: the core itself.
- **The freeze test suite**, in `spec/`: what must hold.
- **The findings log**, in `docs/findings/`: why each rule exists, and what has already been found.
- **The paper**, in `docs/paper/`: the problem, the design, the claims, the threat model, and the open problems.
- **The case studies and films** on dubsar.org: what MOR could be used for, and so what it must survive. None of them is what MOR is.

*Draft for Nobody, allegedly, to redraft in his own hand.*
