# The facts a signer was shown, carried in the signature: judged

*Fable, 10 November 2026. Input: the idea as put (a core-defined summary of the facts a signer is bound by; cMIP declarations in the core's vocabulary; the summary's hash carried in binding signatures; a verifier recomputing it); `docs/reviews/fable-fresh-eyes.md` (pull request 134), section 5 above all; my `fable-after-the-rehearsal.md`, section 2; main at `fc624ab8`: Text 11 rule 6, Agreements 24 rule 4, the signature format (type 1), "Termination", rules 85 to 89 and 99, Development 12 rules 6 to 9 and the task table. Read, not run; a recommendation, nothing decided.*

## In plain words

The idea has three parts, and they deserve three different answers.

**The facts, computable and the same for everyone: yes, and the part of it only the core can give should be written before the freeze.** That part is small: each task whose cMIP decides a signer's fate must produce a declaration in the core's own words. Without it, no client, no consumers' association and no signer can see through a cMIP; with it, anyone can compute what a person is bound by, and nobody can bend it.

**The list of facts, frozen in the core: no.** A list of "what matters before you sign" is the thing most likely to be wrong in ten years, and the stranger's review asks for a core half its size. The list belongs in a cMIP the *signer's* client chooses, never the agreement, so that the side being protected picks its own reader. That needs one row in the task table.

**The hash in the signature: no, not before the freeze and not as MOR 2 either, as it stands.** It proves less than it seems to and it cuts the wrong way. The summary is computed from the terms, and the signature already names the terms, so the hash adds nothing about what was signed. It is the same for every signer of the same terms and anyone can compute it, the other side included, so a client that shows nothing can still commit the right hash by copying it. And once it is there, it reads as proof that the person was shown: evidence of informed consent that the person can never rebut. That is the history of signed disclosures in consumer law: they protect the one who discloses. The stranger's sentence stands: the verifiable guarantees protect property and the unverifiable ones protect understanding. A hash cannot move understanding from the second kind to the first; it can only make it look moved.

So the smallest version worth having is: declarations from three tasks; one client-chosen task for reading terms; one sentence of client conformance in place of many; and the signer Module showing the facts on its own screen from the terms it is handed. No signature changes, no verdict changes, nothing rebuilt for a hash.

## 1. The admission test, part by part, and the task each plugs into

The test: *part of the shared language every act is written in, or a guarantee no module may be able to break.*

| Part of the idea | Verdict | Where it lives, and the task |
| --- | --- | --- |
| **A declaration in the core's vocabulary from each cMIP that decides a signer's fate** | **Core.** What a task accepts and produces is the language between the core and every cMIP (Development rule 7), and only the core can ask it of them | In each task's "produces": termination terms (task 15), absence proof (task 14), and the control model's query (rule 99), which already answers in the core's words and needs one more answer |
| **The summary itself: which facts, in what order** | **Not core.** No act is written in it; it is a reading of acts. A reading every client must share would be frozen with MOR 1 | A cMIP for a new, client-chosen task, **terms reading** (task 16): it accepts terms and the declarations of the cMIPs they name, and produces facts. The signer's client names it, as a client chooses its naming cMIP (task 2); an agreement never does |
| **The hash of the summary in the signature** | **Fails the test.** It is not language (it restates what the terms' hash already fixes) and it guarantees nothing a module cannot fake (anyone can compute it) | Nowhere; see section 3 |
| **"Signed without being shown", as something a verifier says** | **Fails**: it names a fact nobody can check, the fourth pattern | Nowhere |
| **The signer showing the facts on its own screen** | **A Module's** | The air-gapped safety key Module, under the terms-reading cMIP it runs |
| **What you can always do, whatever the terms** (sell your share, resign, be shown a declaration that names you) | **Already core**: it is rule 98's list | One client line pointing at it; nothing to compute, since it is the same for everyone |

Why the reader must be the client's choice and not the agreement's: a summary named by the agreement is chosen by whoever drafted the agreement, which is the first pattern, the thing that decides signed by the wrong party. A reader chosen by the signer's side is the digital form of bringing your own adviser, and it gives the consumers' association in the rehearsal a place in the grammar for what it already sells.

## 2. The facts

**Computable from the texts as they stand, from the terms alone:**

- who the parties are, and your place (party, holder, both);
- your share (field 7), and the rule under which it can be paid less or diluted without your own signature (the holders' rule, field 24; "none: you sign each time" where there is none);
- who changes the constitution, and whether you are among them (field 18; the layers' rules, field 19);
- who may declare you absent, and what then happens to your voice and your stake (the abandonment clause: its authority, its outcomes), including the plainest fact in the list where it is true: *the authority decides alone, on no proof*;
- who judges: the keepers, the arbitrators, the chain of judgment, by name;
- what you owe, to whom, and whether each debt is conditional (the obligations the terms carry);
- who ends this, by default: the defaults by kind ("Termination");
- in a publication: the split as numbers, who holds the money, and where an unfilled share goes (plan key 3), which, with the fourth destination asked for in `fable-after-the-rehearsal.md`, is "where your money goes if the promise fails";
- which cMIPs decide anything, by creator and hash.

**Needing a task's declaration:**

- **termination terms (task 15):** for each party, may it terminate alone: yes; after a point on the time reference; never;
- **absence proof (task 14):** what counts as absence (which acts of yours break it) and for how long, on which time reference;
- **the control model (rule 99's query):** who acts alone in Money, which the query already gives through areas; and one answer it lacks: may the stake be issued without each holder's signature, and by whom.

The condition cMIP (task 9) I would leave out: that a debt is conditional is computable; what the condition means is the terms' own words, and a declaration of it would be prose in disguise.

**A declaration is computed, not asserted.** It is produced by the cMIP's own rule from the parameters the terms name, as its answers are, so a drafter cannot write it. It can be wrong only where the cMIP's declaration and its answers disagree, and that is a defect of the cMIP that vectors and reviewers can find before anyone signs, not only afterwards.

**Never in the list:** anything forecast (what you will earn, scenarios, a share's value); anything judged (fair, usual, risky, a score); anything about the other party (reputation, history); any comparison with other agreements; any prose. The line is the core's own: what arithmetic settles is in, what it does not is left in view and unsummarised. A facts list that forecasts is the investment key-information document with its performance scenarios, which had to be rewritten.

## 3. The signatures, and why none should carry the hash

If it were adopted, the signatures that bind a person to terms are: a party's signature on founding terms or a clone (type 1); a buyer's signature on a transfer, which is buying in; a named party's signature accepting a place (a split service, a partner, a successor confirming). A purchase carries none: payment accepts the sale, not the terms.

**What a verifier could answer:** only a mark beside a valid signature, never a verdict: summary committed and matching; none committed; committed and not matching; cannot be computed (a cMIP not held). It could not be more than a mark. If a missing or wrong hash made a signature invalid, a person could unmake their own signature by committing a wrong hash on purpose, and a client's omission would void what its user meant to sign: a rule that protects the signer would trap the signer and arm the dishonest one.

**Why the mark is not worth having:**

1. **It adds nothing about what was signed.** The summary is a function of the terms; the signature names the terms. Every verifier can compute the summary whether or not any signature carries its hash.
2. **It does not show that the signer's client computed anything.** A verifier must be able to recompute the hash, so anyone can: the first signer's signature publishes it, and the party that drafted the terms can hand it over with them. Only a lazy client is caught; the client built to hide commits the right hash and shows something else. The brief's own limit ("it proves the facts were computed and committed") is too generous by one step: it proves they were committed.
3. **It manufactures consent.** A committed hash will be read, by the other party, by an arbitrator and by a court, as "the signer was shown the facts". The signer cannot prove otherwise. For the person the stranger's review pictures, that is worse than nothing: today a client that showed nothing is a client that broke conformance; with the hash, it is a signer who acknowledged.
4. **"Signed without being shown" is not a fact a verifier holds.** A missing hash means a client did not commit one; the person may have been shown everything. A present hash means nothing about a screen. The label would be wrong in both directions.

**What does the work the hash was meant to do:** the facts being computable by anyone (section 1's declarations), so that a second client, an association or the person's own signer can recompute them from the same bytes; and the signer Module, which is the only place a "trusted display" can exist. A signer that is handed only the hash of the terms signs blind whatever the signature carries; a signer that is handed the terms can check their hash, run the reading and show the facts itself. That is a requirement on what the signer receives, and it belongs in the Module.

## 4. The way out, and verdicts

As recommended here, **no verdict changes**: declarations add answers to tasks; a client-chosen task adds a row; conformance loses sentences and gains one.

It touches the way out in one good way and one to guard. Good: "what you can always do" is rule 98's list shown at the moment it matters, and the absence fact ("who may declare you absent, on what silence") is the one the stranger found most dangerous for a person who withdraws to avoid a conflict. To guard: nothing in the reading may ever be a condition of a way-out act. A resignation, a transfer, a release carry no reading and wait on none; the conformance sentence should say "before a signature that binds a person to terms", and name them as not such.

With the hash, as the idea was put, the way out would have been touched badly in the case named in section 3: a wrong hash as a tool to dispute one's own signature.

## 5. Against the stranger's other points

**Does client conformance shrink?** Yes, and this is the best argument for the idea. Of the passages the stranger counted (about 48 in Agreements, 13 in the MICS, 8 in Identity, 7 in Money), the largest family is "before signing, the client shows X": the holders' rule and issuance terms, Money first; who may declare absence; the veto warning; the areas; the last-voice warning; the worked example. Each was added when an attack was found, each in its own words. One sentence replaces the family: *Before a signature that binds a person to terms, the client shows what its terms-reading cMIP produces from them, names that cMIP, and shows what the person can always do (rule 98).* The particular warnings move to the founding terms-reading cMIP, which is the builders' code the stranger asks for, with a task under it. Text rule 6 and Agreements rule 4 stay: plain text and visible controls are about bytes, not facts.

**Does it fit a core moved toward half its size?** As recommended, yes: the core gains three declaration lines and one table row and loses a few thousand words of scattered conformance. As put (a list of facts and a hash in the core), no: it adds grammar, a frozen list, a field in every binding signature and a mark every verifier computes, to a core being asked to shed exactly that kind of thing.

**One more of the stranger's points it answers:** "the texts rely, more than they admit, on a good client standing between this person and the terms." They will still rely on it. What changes is that the good client's work becomes recomputable by a second one, which is the honest size of the gain.

## 6. The prior art, corrected where it needs it

- **Ricardian contracts:** right, and closer than the brief implies. A Ricardian contract is one document readable by people and parseable by programs, identified by its hash, and that hash is what transactions carry. MOR's terms already are that: canonical text and fields, named by hash, in the signature. The idea adds a second hash of a derived view, which the Ricardian design never needed.
- **Hardware wallets:** right. "Blind signing" is signing what the device cannot parse and show. The lesson is that the remedy lives in what the device is given and can decode, not in what the signature carries.
- **EIP-712:** right, with a sharper lesson than "misleading field names". The structure is shown faithfully and people are still drained by signatures whose fields were true and whose consequences were not shown (token approvals, off-chain orders). Faithful fields are not understood consequences; and the signature being well-formed was no defence for the victim.
- **"What you see is what you sign":** a property named in the cryptographic literature of the late 1990s and discussed in guidance for signature-creation software; as far as I know it is not something the signature regulations themselves prove or require in that form. It has always been a property of a trusted device and display, never of the signed data. Worth checking before it is cited in a text.
- **Key facts sheets:** right, in both halves: the standard boxes of consumer credit work best where they hold a few computed numbers, and the investment documents' computed scenarios were criticised and revised. Add the general criticism of mandated disclosure: signed disclosures tend to protect the discloser. That is point 3 of section 3.
- **Creative Commons:** right: legal code, deed, metadata. The deed says of itself that it is a summary and not the licence. Any facts list must say the same on its face, which is the answer to "false comfort".

## 7. The smallest version worth having, its cost, and when

**The smallest version:**

1. **Three declarations**, in the core's vocabulary: task 15 (who may terminate alone: yes, after a point, never); task 14 (which acts break absence, for how long, on which time reference); the control model's query (whether the stake may be issued without each holder's signature, and by whom).
2. **One task row:** terms reading, task 16, client-chosen: accepts terms and the declarations of the cMIPs they name; produces facts, never forecasts or judgments.
3. **One conformance sentence** (section 5), in place of the "shows before signing" family, in the say-it-once pass already asked for.
4. **Outside the core:** a founding terms-reading cMIP carrying the list of section 2; the air-gapped signer Module receiving the terms, checking their hash and showing the facts.

**Cost:** about ten sentences and four format lines in Agreements and Development; the default control cMIP and any absence-proof cMIP gain a declaration; vectors for the three declarations; no change to any signature, any verdict, any published vector; no client or signer rebuilt for the core's sake. The founding reading cMIP is a new document, and a good one for the second rehearsal's players to attack.

**When.** Items 1 and 2 **before the freeze**: what a task produces and which tasks exist cannot change afterwards, and without the declarations no reader, in MOR 1 or built later, can see through a cMIP. Item 3 with them. Item 4 beside the freeze, not in it.

**The hash in the signature: not at all**, unless someone finds a form of it that a party other than the signer cannot compute, and I do not think one exists without a trusted device, which is the Module's ground and not the core's.

## What I read and what I reason

Read: the stranger's review whole; my review after the rehearsal; Text rule 6, Agreements rule 4 and the signature format; "Termination"; rules 85 to 89 and 99 with the query-answer; Development's rules 6 to 9 and the task table (tasks 9, 12, 14, 15); a count of "Client conformance" in the four texts (47, 13, 8, 5 by search, close to the stranger's). Reasoned: the hash against what the terms' hash already fixes and against who can compute it; the list against the freeze; the reader against the first pattern; the prior art from what I know of it, with the one item I am unsure of marked. Nothing run.
