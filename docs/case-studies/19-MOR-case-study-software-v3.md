# MOR Case Study: Paying the Ones Everything Stands On

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 5, nothing else changed. Item 6 asks the author to pick one of two recovery paths and is left. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects draft 1 after review round 2 (F72, F77): a rotation that needs every maintainer names its way through, and dependency shares are said to be honoured by the paying agreement, visibly, never automatically.*

## Why this case study

Almost all software is built on open-source code: libraries written and maintained, often for free, by people most users will never hear of. A well-known cartoon shows all of modern digital infrastructure as a tall tower resting on one tiny block: a project quietly maintained for years by a single unthanked volunteer. It is funny because it is true.

The costs of this are real:

- **Heartbleed** (2014): a flaw in OpenSSL, which secured much of the web, maintained by a handful of people on a tiny budget.
- **Log4Shell** (2021): a flaw in a logging library used by countless companies, maintained by volunteers.
- **The xz backdoor** (2024): an attacker spent about two years earning the trust of an exhausted lone maintainer, became a co-maintainer, and slipped a backdoor into a compression tool used by most Linux systems. It was caught by chance, weeks before it would have spread widely.

Funding tools exist: sponsorships, donation platforms, bounties. One project even tried paying developers with tokens according to how widely their packages were used; it was flooded with junk packages created only to collect rewards. Paying for usage invites faking usage.

MOR was designed with this failure in mind: **rewards attach to settlements, never to attention.** This case study follows one developer, Priya, from publishing a small library to maintaining a project companies depend on, and ends with MOR itself, whose own cMIPs and modules are software built the same way.

## 1. A small library

**Priya writes a library** that parses dates in many languages. She publishes it as a work, bound to her identity. Source code is text, and each release is a new work naming the previous one: nothing on MOR is updated.

**Releases are signed.** Anyone installing the library can check that each release was signed by Priya's identity, and that nobody slipped in a different version along the way.

**Her licence is her standing offer.** She publishes the library under an open-source licence: anyone may use, change and share it. On MOR, the licence is part of the work's terms, visible to every user.

**People use it, and some tip.** A developer whose app saved a week thanks to the library tips her from their wallet, to her own payee pointer.

## 2. Dependencies are lineage

**Software names what it is built on.** Every project has a list of its dependencies. On MOR, that list is lineage: an app names the libraries it uses, as a remix names its stems in the music case study, and those libraries name theirs.

**When software earns, lineage can pay upstream.** A company sells an app built on Priya's library, among two hundred others. The app's split can carry a share for its dependencies, divided along the tree: each level pays its immediate parents, and each parent pays its own. Whether it does is decided by the app's own agreement, the one whose pointer is paid; the core ties a sale to the seller's agreement, never to a dependency's stake. What the core guarantees is visibility: an app that names two hundred dependencies and pays none of them publishes a split that says exactly that, and every client and registry that reads splits can show it.

**Only real money flows.** Shares come from settlements, from sales, subscriptions and sponsorships that actually happened, never from download counts. A junk package that nobody pays for earns nothing, whatever its download numbers. This is the lesson of the token experiment, built into the design.

**Open-source licences guarantee freedom of use,** so a share cannot usually be forced on everyone. **How dependency shares work is a question for a dependency cMIP**, for example:

- **voluntary:** the app's makers choose whether to share, and how much, and the choice is visible;
- **required for commercial use:** the library is free for individuals and non-profits, and companies earning from it owe a share, a model some projects already use under names such as dual licensing; a company that does not pay is visibly in breach of the licence it accepted;
- **pooled:** a company pays one monthly amount for its whole dependency tree, divided by a split module (by how often each library is used in its builds, by fixed weights, or by the tree's own shares).

## 3. Targets and bounties

**Priya publishes a target:** "2,000 francs a month lets me maintain this library one day a week." Progress is computed from receipts, which she publishes without the payers' names. Each month she publishes what she fixed and released, signed. Next year's target stands on this year's record.

**Users fund bounties.** A company needs support for a calendar the library does not handle. It publishes a bounty: an amount, the feature, a deadline on a time reference, held by a custodian until the work is accepted. Any developer can take it on, the way any journalist can take on a funded question in the journalism case study. A contributor writes the feature; Priya reviews and accepts it; the custodian releases the payment, split between the contributor and a share for Priya's review.

## 4. A maintainers' collective

**The library grows,** and Priya cannot maintain it alone. She and three regular contributors form a collective: an identity with its own keys and founding agreement.

- Any two maintainers can sign a release.
- All four are needed to rotate the collective's safety key. Because that alone would freeze the project if one of them vanished for good, the grammar names its way through: a fifth share held in escrow by a custodian under the collective's grant, released by the abandonment authority the agreement names. Every key grammar must leave a way to rotate that needs less than everyone; this is theirs.
- The project's income is split by an agreement all four signed, with shares for past contributors.

**Nobody is irreplaceable, and nobody is trapped.** When a maintainer burns out and leaves, the others clone the agreement without her and rotate the keys. Her share in past work keeps paying her. The project does not depend on one exhausted person. And who judges a member's absence, or which keeper records the shares, cannot change without the signature of every member whose voice remains; once she has left, she is judged by the clause in force.

**Newcomers earn trust visibly.** A new contributor's identity carries its history: works published, reviews given, releases signed, and how long it has existed. Maintainers can see who they are giving keys to.

## 5. Security as paid work

**Reviewers become verifiers.** A security firm audits the library and signs its findings: what it checked, what it found, which release. Audits are paid by the companies that depend on the library, through a target or directly, and every user sees which releases were audited and by whom.

**Builds are reproduced.** Independent builders compile each release from its source and sign the result. When several builders produce identical files, users know the published package matches the published code. A backdoor hidden in the build, as in the xz attack, would show up as a mismatch.

**Trust has a record.** Every maintainer, reviewer and builder has a history under their identity. Trust Score modules, like those in the education case study, can weigh their signed judgements by how well they held up over time.

**An attack in slow motion, made visible.** An attacker who spends two years befriending a maintainer still leaves a record: a new identity, its first contributions, the pressure it applied, the keys it received. MOR cannot stop a patient attacker, but every step becomes visible to those who care to look, and independent builders and auditors are paid to look.

## 6. Companies and the status quo

**Companies keep every model they use today:**

- **Sponsorship:** a company sponsors the libraries it depends on, visibly.
- **Support contracts:** the collective sells guaranteed response times to companies, as agreements with terms and time references.
- **Hiring maintainers:** a company employs a maintainer to work on the library, under a grant, while the maintainer keeps their own identity and history.
- **Proprietary software:** closed-source products sold under licences, delivered to closed apps, as in the gaming and video case studies. MOR does not require anyone to open their code.
- **Software as a service:** subscriptions, as agreements, with the provider's cut and uptime commitments visible.

What changes is that everything a company takes from the open-source commons, and everything it gives back, can be seen.

## 7. MOR itself

**MOR's cMIPs and modules are software.** Each module is a work, frozen under its hash. Each Module names the cMIP it implements. The Production MIP pays the makers of cMIPs and modules when their work takes part in a settlement, through the module fees in each split. A module's use is evidenced by a party, never by the module, which signs nothing: for a payment rail module, by the receipt or claim naming it; for a service someone runs on a module, by a use record signed by whoever runs it.

**This case study is MOR's own economy.** A developer who writes a split module, a rating cMIP or a consent module for the other case studies is paid the way Priya is paid: through lineage, when real settlements use their work and the paying agreement honours the terms. Everything these case studies list under "open for others to build" is an invitation on these terms.

## 8. The network behind it

- **Maintainers and contributors:** paid through lineage shares, targets, bounties and support contracts.
- **Companies:** sponsoring, hiring, paying shares and buying support.
- **Auditors and independent builders:** paid to verify.
- **Custodians:** holding bounty money, and escrowed key shares.
- **Package registries and code hosts:** carrying releases, paid for storage and bandwidth, and showing which apps pay their dependencies.
- **cMIP and module makers:** building MOR itself.

## 9. What MOR provides, and what it needs

**From the core, nothing new.** Text and works, versions, standing offers and licences, splits and role shares with signed evidence, custodians and time references, collectives with a way to rotate, grants, key grammars and abandonment, signed attestations, and module fees are already defined; lineage and targets are built from these core pieces.

**Open for others to build (cMIPs and Modules):**

- **A dependency cMIP:** how software names its dependencies as lineage, how shares flow up the tree, and how a registry shows apps that pay and apps that do not.
- **Dependency split modules:** voluntary, licence-required, pooled.
- **Bounty cMIPs:** tasks, custody, acceptance and payout.
- **Release signing and reproducible-build attestations.**
- **Audit cMIPs:** what an audit names and signs.
- **Support contract toolkits.**
- **Escrowed key-share custodians** for collectives.
- **Bridges to existing package registries,** so today's ecosystems can take part without moving.

## 10. Honest limits

- **Freedom and payment pull against each other.** Open source means anyone may use the code; requiring payment changes what it is. Voluntary shares keep the freedom and depend on goodwill; the core makes the goodwill, or its absence, visible, and nothing more.
- **Deep trees dilute.** An app with thousands of dependencies may pay each one very little. Pooling and weighting help; they do not create money that is not there.
- **Money can change a community.** Paying some contributors can discourage those who gave freely.
- **Most small projects will earn little.** Lineage pays where money flows; much useful code sits far from any sale.
- **Security cannot be guaranteed.** Signatures, audits and reproducible builds raise the bar; a determined attacker can still clear it.
- **Adoption is slow.** Existing registries and tools must be bridged, not replaced.

## 11. What it demonstrates

A small date library and the software that runs companies use the same rules as a song and its remixes. Dependencies are lineage, and lineage pays upstream when real money flows and the paying agreement honours it, so faking usage earns nothing and ignoring one's dependencies is seen. Maintainers can fund their time with targets, share the load in a collective that can always rotate, and leave without losing their share. Security becomes paid, signed and visible work. And MOR's own builders are paid the same way: the protocol that asks others to build its modules pays them as it pays everyone else.
