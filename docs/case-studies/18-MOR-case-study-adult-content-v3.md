# MOR Case Study: Adult Content, Consent on the Record

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1, 3 and 4, nothing else changed. Item 2 waits on an open question for Nobody, allegedly (what a purchase of a sole creator's claimed work names); item 5 was optional and item 6 needed no change. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects draft 1 after review round 2 (F46, F68, F79): payment goes to the publisher's pointer; the vault covers each unit accepted; a platform withdraws its own publication and a non-conforming one is contested; there is no "closing act" for an identity.*

## Why this case study

Adult content is a large, legal industry in much of the world, and the place where every guarantee MOR makes is tested hardest.

- **Payments get switched off.** Card networks and banks have repeatedly cut off legal adult businesses. In 2021 a leading subscription platform announced it would ban explicit content under pressure from its banking partners, then reversed course. In 2025, major game stores removed adult games after pressure on payment processors. Whoever controls the rails decides what legal work can be paid for.
- **Consent must be certain,** for everyone who appears in a work, for every use, and it must be possible to stop future distribution when someone withdraws.
- **Age must be verified twice:** performers must be adults, and so must viewers, without building databases of who watched what.
- **Privacy is not a preference.** Performers can lose jobs, relationships or safety if their work is linked to their legal name; buyers want their purchases to stay private.

This case study stays businesslike. It follows a performer, Mara, from selling her own work to collaborating, working with a studio and a platform, and living through a payment shutdown. It never describes content; the title is enough.

## 1. A working identity

**Mara creates a working identity,** separate from her everyday one. The two are not linked unless she links them, and linking would itself be a visible signed act. Her working identity has its own keys, home, payee pointers and history.

**She is verified without being exposed.** A checking service verifies her age and legal identity, and signs an attestation about her working identity: "adult, identity verified, record held by this service". The record of who she is stays with the checking service, available to authorities as the law requires, never published on MOR. Anyone can see that she was verified, and by whom; nobody can see who she is.

**Her works are hers.** Each work is bound to her working identity, encrypted, with a price. Payment goes to her working identity's own payee pointer, since she is the publisher. Buyers pay; her side releases the key.

**Buyers stay private.** A payment names its receiver, not its sender, unless the sender chooses otherwise. Receipts are shared only between the parties, and a buyer's own record of a payment is the buyer's to publish or not. Whether Mara shows her income publicly is her dial.

**Viewers prove they are adults** without saying who they are. A credential module lets a viewer's client present a proof of age, issued once by a checking service, without revealing identity, as the democracy case study does for residents. Clients and relays that sell adult work ask for the proof; none of them learn the viewer's name.

## 2. Consent for every work

**Mara works with a co-performer.** Before anything is published, each person appearing in the work signs a consent act with their own working identity: which work, which uses (sale, subscription, clips, promotion), which territories, for how long. Each consent act points to that person's age attestation.

**No consent, no publication.** Relays, platforms and clients that carry adult work refuse any work lacking a signed consent and an age attestation from every person in it. This is not a core rule; it is the condition of doing business in this sector, set by a consent cMIP that responsible relays and clients adopt, and the absence of consent is visible to all of them.

**The income is shared as agreed.** The work's agreement sets each performer's stake, in millionths, and the split pays each one with their own receipt.

## 3. Withdrawing consent

**Nothing on MOR is updated, but distribution can stop.** A performer may need to withdraw consent: they have left the industry, circumstances have changed, or the terms were broken. A withdrawal is a new signed act pointing at the consent it withdraws.

**What a withdrawal does depends on the consent cMIP,** for example:

- **revocable at any time for future distribution:** new sales stop immediately;
- **revocable after a minimum period,** with compensation to co-performers or producers who invested;
- **fixed for the agreed term,** then revocable.

**Encryption makes stopping real.** Every work is encrypted. When consent is withdrawn, the key-release services stop releasing keys to new buyers, conforming platforms withdraw their own publications, and conforming clients stop offering the work. A platform that keeps its publication up is contested, its publication is shown as lacking consent, and relays that follow the consent cMIP refuse to serve it; the performer withdraws a publication made for her herself, and contests only those that are not, which every honest client can see should have been withdrawn. Buyers who already hold keys keep what they paid for, unless the work was sold only through a closed app that holds the keys itself, in which case the app can stop playing it.

**Copies are found.** Matching modules, like those that expose stolen photos in the journalism case study, recognise re-uploads of withdrawn or leaked work by what they contain, not by their bytes. A copy without valid consent is visible for what it is, and relays refuse it.

## 4. A studio and a platform

**Mara joins a studio,** a collective with its own identity and founding agreement, like the band in the music case study. The studio handles production, and each production's agreement sets the stakes of everyone involved: performers, camera operators, editors. Performers sign consent to each production separately.

**A subscription platform publishes Mara's work.** The platform is a publisher holding a stake in its own publications, never in the work itself, and its cut appears in every settlement. Its publications name Mara's working identity as the one they are made for where her agreement says so, so payment reaches her whatever wallet pays. Subscribers pay monthly; the platform's split module divides subscription revenue among the creators they follow, visibly.

**Mara publishes through several platforms at once,** each with its own publication, and compares them in real settlements. Her subscribers follow her identity, not a platform account.

## 5. The rails refuse

**One morning, the platform's card processor stops serving it.** Under today's systems, this ends the business: payments stop, creators lose their income, subscribers lose access.

On MOR:

- **Payee pointers accept several units.** In Finance each unit (a currency, a token) is a specification and each rail a Module, and a payee pointer can accept several. Mara's pointer already declares more than one, and her vault, behind her safety key, has an entry for each unit she accepts, on more than one rail: a unit the vault does not cover cannot be paid to her everyday pointer at all, which is what stops a thief from opening a road she never chose. Adding a unit later takes a rotation, which she planned for.
- **Buyers' clients show the alternatives.** When the card route fails, a subscriber's client offers the other units Mara accepts, and conversion routes turn what the buyer has into what Mara receives, each hop disclosed.
- **The audience stays.** Subscribers follow Mara's identity. Losing a payment rail does not mean losing the audience.
- **Agreements stand.** Subscriptions are agreements between subscribers and creators; a rail that refuses a payment does not void the agreement, it only closes one road for paying it.

**The refusal is legible too.** A rail that refuses is one module among several, and the payer's wallet shows the other roads. Card networks keep every right to decline business; they lose the power to decide alone what legal work can be paid for.

## 6. Leaving the industry

**Mara decides to stop.** She withdraws consent for future distribution under her agreements' terms, withdraws her own publications, and lets her working identity go quiet. Nothing in MOR closes an identity, and nothing needs to: an identity that signs nothing more is simply silent, and can be resumed or left forever. Her earnings, her records and her stakes in past works remain hers.

**Her working identity was never linked to her legal one,** so leaving does not follow her into the rest of her life. The right of exit, applied to a person's own past.

## 7. What studios, platforms and payment networks keep

- **Studios keep producing,** with consent and age attestations built into every production, which protects them as much as their performers.
- **Platforms keep publishing,** taking visible cuts and competing on service, safety and reach.
- **Payment networks keep their choice** to serve or refuse, visibly, as one rail among several.
- **Regulators gain a stricter system than today:** every work carries signed consent and verified ages for everyone in it, and every viewer carries a proof of age.

## 8. The network behind it

- **Performers and studios:** producing and selling work.
- **Platforms:** publishing and running subscriptions.
- **Checking services:** verifying performers' and viewers' ages and identities, holding records under the law.
- **Key-release services:** releasing keys to buyers, and stopping when consent is withdrawn.
- **Matching services:** finding copies of withdrawn or leaked work.
- **Payment modules and conversion routes:** keeping several roads open.
- **Relays:** carrying only work with valid consent.
- **Developers:** building consent, credential, key-release and payment tools.

## 9. What MOR provides, and what it needs

**From the core, nothing new.** Separate identities, attestations, encrypted works and key delivery, withdrawal of one's own publications and contests of others', payee pointers with several units and a vault per unit, conversion routes with disclosure, public receivers and private senders, agreements, splits, collectives and the task for identity proofs are already defined.

**Open for others to build (cMIPs and Modules):**

- **A consent cMIP:** per-work, per-use consent from everyone depicted, linked to age attestations; withdrawal terms; what relays refuse.
- **Credential modules:** proofs of age for viewers, and verified-performer attestations.
- **Key-release services** that honour withdrawals.
- **Matching modules** for re-uploaded work.
- **Unit modules and conversion routes** that keep payments possible when one rail refuses.
- **Subscription split modules** for platforms.

## 10. Honest limits

- **Copies already sold cannot be recalled.** Withdrawal stops future distribution; a buyer who holds a key or a copy still has it.
- **A platform's publication not made for the performer is the platform's to withdraw.** One made for her, she withdraws herself. The performer's withdrawal of consent makes a platform that keeps publishing visibly wrong; it does not take the publication down. Relays and clients that refuse such publications are the sector's answer.
- **Every rail can refuse.** Several rails make a shutdown harder, not impossible; converting to local money still needs someone willing to do it.
- **Checking services hold sensitive records.** They must be trusted, secured and bound by law; a breach would be severe.
- **Separation of identities depends on care.** A performer who links identities by accident, through timing, style or metadata, can be exposed. The protocol cannot protect against every slip.
- **Bad actors can stay off MOR.** The rules protect those who use them; work produced without consent elsewhere remains a matter for the law.
- **Law differs by country,** on what is legal, on age verification and on performers' rights.

## 11. What it demonstrates

The sector where payments are most often switched off, consent matters most and privacy is most fragile uses the same rules as every other. Consent becomes a signed act from everyone involved, age is proved without exposure, withdrawal really stops distribution among those who follow the rules and exposes those who do not, and no single payment network can decide alone what legal work gets paid. People keep their work, their income and their privacy, and can leave without their past following them.
