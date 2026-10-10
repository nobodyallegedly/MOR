# MOR Case Study: From Local Question to World Story

*Case study, draft 2, 9 October 2026. Draft 1 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 5 and 7, nothing else changed; item 6 was optional and is left. The rest is unchanged, for the author's own passes and the redraft. Draft 1's notes follow.*

*Case study, draft 1, 27 September 2026. What MOR could be, with your help.*

*Note, 6 October 2026: this draft predates the current core (Identity draft 11, Money draft 6, Agreements draft 10) and the review rounds that changed it. Some rules it describes have since changed. It is to be redrafted (roadmap, 9 October 2026).*

## Why this case study

Journalism is dying almost everywhere, and what replaces it is often pure propaganda. Advertising moved to the platforms. Paywalls work for a handful of big brands and fail for everyone else. Local news is disappearing first, and where it disappears, whoever pays for content decides what people believe.

Propaganda wins on cost and volume. MOR cannot change that. What it can change is **legibility**: who made a story, from what, who checked it, who stands behind it, and who pays for it. It can also give journalists something they have lost: many ways to be paid, so that nobody can cut off their funding with a single decision.

This case study follows one local journalist, Sara, from answering a single question for her commune to a story picked up around the world. It starts with one person and ends with a large news agency, and shows that the same rules serve both, and that the big agency is safe on MOR too.

## 1. The roles

Journalism on MOR is a set of roles. Each can be filled by a single person, a large organisation or an automated service, and they all use the same rules.

- **Contributors** supply assets: a photo, a video clip, a recorded interview, a document, a dataset, a translation. Each asset is a work, bound to its maker, offered through a standing offer (free with credit, a flat price, or a share of what the story earns). Buying under a standing offer needs a client that reads Agreements; a tip does not.
- **Editors** compile assets into stories for an audience. An editor can be a newspaper desk, a solo newsletter writer, or an automated or assisted compiler. A story names the assets it is built from, the way a track names its stems, and when the story earns, its split pays each contributor.
- **Verifiers** check assets and claims, and sign what they checked: "this photo was taken at this place, on this date", "this quote matches the recording". Verification is a job in its own right. Agencies do it, and so do the research teams behind satire shows, magazine fact-checkers and open-source investigators.
- **Agencies** are hubs. At one end, an automated market where assets are listed and bought. At the other, a specialised business with its own network, its own verification and its own reputation, selling to outlets.
- **Raters and aggregators** read the whole signed record and help readers make sense of it.

## 2. A funded question

**Sara covers her commune.** She has an identity with a signing key on her phone and a safety key on an offline device, like every creator in these case studies. Her readers follow her identity, not a newspaper's website.

**Readers fund a question.** Residents want to know what is in the commune's contract with a developer for a piece of public land. They pool money on the question: a signed agreement stating the question, the amount, a deadline on a named time reference, and a keeper. The pledges can be held by a custodian named in the agreement, or remain signed commitments paid only when the condition is met. Either way, the money is released on delivery, not before.

**Any journalist can take it.** Sara takes it on, and so could anyone else. The question is a small public competition to serve a common need, the same idea as the budget in the democracy case study.

**She builds the story from assets.**

- A resident sells her a photo of surveyors on the land, through the resident's standing offer.
- Sara's own interview recordings and document scans are assets too, bound to her.
- A verifier checks the photo's place and date from shadows, landmarks and weather, and signs the check. The verifier never needs to know who the resident is.

**She delivers.** The story names its assets. The keeper records delivery, and the pooled money is split: Sara's share, the resident's price, the verifier's fee, and the fees of the modules it ran through. Each payment has its own receipt.

## 3. Independent: a target and a subscription

**Sara goes independent full-time.** She publishes a **target**: a signed act stating what her beat costs ("4,000 francs a month: rent, travel, legal insurance, verifiers") and what she will cover. The idea comes from the developer world, where projects publish what they need to stay afloat and the community funds the goal.

- **Progress is computed from receipts,** not claimed. She publishes her receipts, without the payers' names, so anyone can check her bar against the signed payments she has received. Payers stay private; the total is public.
- **Pledges can keep or wait.** Some readers donate immediately. Others pledge on an all-or-nothing basis, paid only if the target is reached by a date. For an ambitious target, Sara can use a *dominant assurance contract*: if the target fails, pledgers receive a small bonus from her, which makes pledging worth it even for doubters.
- **Surplus is declared in advance:** next month, a legal fund, or refunds.
- **Delivery is on the record.** Each month she publishes what the money paid for, signed. Next year's target stands on this year's record.

**Readers also subscribe.** A reader can pay one monthly amount to a news subscription that covers many independent journalists. The amount is split by what that reader actually read. The reader's own client computes the split, so reading history never leaves the reader's device; only the resulting payments do.

**Tips keep flowing** for individual pieces, from the simplest wallet.

Sara now has four sources of income: tips, a target, funded questions and subscription splits. None of them can be cut off by one platform or one advertiser.

## 4. The story grows

**The contract turns out to be part of a larger pattern.** The same developer appears in land deals in several countries.

**An agency licenses her work.** A large news agency sees Sara's story and licenses her assets for its outlet subscribers through her standing offer. The agency adds its own verification, signed with its reputation, and republishes. Sara keeps her identity, her readers and her record, and earns from the licence every time an outlet uses her work.

**An editor compiles an international piece.** An editor at a foreign newspaper combines Sara's assets with a colleague's in another country and the agency's verification. The piece names all its sources, and its split pays each of them.

**A source publishes.** Someone inside the developer's company publishes an internal document. They use a fresh, one-time identity, a nym, with no link to who they are. Their protection is operational (timing, metadata, where they publish from), not something the protocol can promise. Verifiers check the document itself: its formatting, its internal consistency, whether its facts match public records. The document can be trusted without its author being known.

**Several verifiers check the same assets,** independently. Agreement between them means something, and so does disagreement.

## 5. A fork and a correction

**A propaganda outlet copies the photo.** It publishes a distorted version of the story, with the developer cast as a victim of a smear. It does not fork: it takes the resident's photo, recrops and recolours it so its bytes and its hash are new, and publishes it as its own, with no lineage and no payment.

**Sara forks the copy.** Her fork names the outlet's piece and her original, and makes her claim: this image is derived from the one she published. The resident, as the photo's maker, can make the same claim, and a maker's claim backed by Sara's licence is the strongest.

- **Priority:** her original was published and anchored before the copy existed, so the timeline is provable. Assets of value are worth anchoring the moment they are published.
- **Similarity:** a new hash does not make a new image. Matching modules, comparing what images look like rather than their bytes, and independent verifiers sign that the two are the same photo, edited.

**The dishonesty becomes legible.** In every client that reads those claims, the outlet's copy now carries a visible branch: an uncredited copy of an earlier photo, verified by three. Nobody can force the outlet to pay; that still takes a court, and MOR supplies the evidence, signed and anchored. What matters is that hiding lineage has become a signal, and once caught, the outlet's whole record carries it.

Had the outlet forked honestly, naming its source, the photo's standing offer would have applied, and the resident would have been paid by both sides of the argument. On MOR, honest disagreement pays its sources; theft only exposes itself.

**The developer's company demands a correction.** It sends a signed demand. Sara reviews it and finds one real error: a date in her first story was wrong. She publishes a **correction**: a new act, signed by her, pointing at the original.

**Only the author corrects.** A correction is the author saying "I now stand behind this instead". Under the proposal in section 9, every conforming client that shows her story would also show her correction, and nobody could present her work as something she has since corrected. Everything else in the story stands, and the rest of the company's demand stays on the record as a demand.

**Nothing is erased.** The original, the correction, the demand and the fork all stay. That record is what gives Sara's reputation substance: a journalist who corrects openly is more credible than one whose errors quietly disappear.

## 6. What the reader sees

A reader opens an aggregator: a client that groups every piece about the same event, in the spirit of today's bias-tracking news apps.

**The story appears as a tree.** At the root, Sara's original story and her correction. Branches: the agency's licensed version, the international piece, and Sara's fork exposing the propaganda outlet's copy.

For each branch, the reader sees:

- **who made it, and from what:** named assets, or none;
- **who verified what:** signed checks, by verifiers with their own track records;
- **who owns whom:** for outlets living on MOR, their stakes and funding are visible in their agreements and splits;
- **ratings:** bias and reliability ratings, published as signed assessments by competing rating services. The reader chooses which raters to trust, and can see where they disagree;
- **blindspots:** which outlets covered the story and which ignored it, computed by a rule anyone can run.

**Propaganda has a visible shape.** The outlet's piece names no assets, carries no verifications, uses a photo verified as an uncredited copy, and its outlet's ownership is not on MOR. The missing record is itself a signal. Nobody has to call it propaganda; the reader can see what it lacks.

**The aggregator is paid like a curator:** a share when a reader pays for a piece it surfaced, not by selling the reader's attention.

## 7. What the agency keeps

Nothing here asks a large agency to become something else. MOR changes what it competes on, and gives it more to sell.

- **Its strengths remain:** its network, its verification, its reputation, its legal team. On MOR, its reputation becomes a signed, permanent record that competitors cannot fake.
- **It can license from everyone.** Every independent's assets are available through standing offers, so its reach becomes as wide as the network.
- **It can sell verification** as a service, to outlets and to independents.
- **It can publish targets** for the bureaus readers value most ("our Kyiv bureau needs this"), and take on funded questions alongside independents.
- **Exclusive deals still work.** Agreements with conditions, keepers, time references and closed clients carry today's wire contracts, embargoes and exclusives unchanged.
- **Its staff can still be staff.** Journalists can work under grants from the agency, signing on its behalf, exactly as employees do today.

The agency and the independent do not live in separate worlds. They fill the same roles in the same network, compete for the same readers and the same funded questions, and pay each other when they use each other's work.

## 8. The network behind it

- **Contributors:** professionals and residents, paid by standing offers and splits.
- **Editors:** human, assisted or automated, paid by their share of the stories they compile.
- **Verifiers:** paid by fee or role share, building a permanent record.
- **Agencies:** licensing, verifying and distributing.
- **Raters and aggregators:** competing on trustworthiness and paid as curators.
- **Keepers:** recording funded questions and licences.
- **Custodians:** holding pledges for questions and all-or-nothing targets.
- **Developers:** building the tools below.

## 9. What MOR provides, and what it needs

**From the core, almost nothing new.** Identities, nyms, works and claims, standing offers, agreements with conditions, keepers and time references, splits and role shares, receipts, grants and publication stakes are already defined; lineage, custodians and targets are built from these core pieces.

**One proposal for the core:** conforming clients that show a work must also show a correction signed by its author. This is a small rule in the spirit of "signing what you see", and it is up to the MIP drafts to decide where it belongs, or whether it is needed at all.

**Open for others to build (cMIPs and Modules):**

- **An asset format for news:** photos, recordings, documents and data, with their provenance.
- **Verification cMIPs:** how a check names what was checked and how.
- **Funded-question cMIPs:** questions, pledges, custody, delivery and payout.
- **Target cMIPs:** targets, progress from receipts, all-or-nothing pledges, assurance bonuses, surplus rules, delivery reports.
- **Reader-side subscription splits,** computed on the reader's device.
- **Correction and fork display** in clients.
- **Aggregators:** story trees, grouping modules, blindspot rules.
- **Matching modules:** recognising edited copies of images, audio and video by what they look or sound like, not their bytes.
- **Derivation claims:** how a maker or licensee claims that someone else's work copies theirs.
- **Rating cMIPs:** signed bias and reliability assessments.
- **Agency toolkits:** licensing, embargoes, verification services.
- **Source tools:** one-time identities and guidance on operational safety.

## 10. Honest limits

- **Propaganda is cheap and fast.** MOR makes it recognisable; it does not make it rare.
- **Only outlets on MOR show their ownership.** An outlet publishing from outside shows nothing, which is a signal but not proof.
- **Verification is judgement.** A signed check can be wrong, and a well-funded liar can hire verifiers. Permanent records make this costly over time, not impossible.
- **Funded questions can be captured.** A company could fund a question to attack a rival. Journalists can require funders above a certain amount to be disclosed; readers can weigh it.
- **Sources' safety is operational.** The protocol cannot protect a source who is careless with timing or metadata. Talking to journalists privately stays outside MOR, on tools built for it.
- **Journalists' physical safety** is not something any protocol can provide.
- **Not every client will conform.** A client can ignore corrections; it simply is not a conforming MOR client.
- **Attention is still scarce.** Diverse funding helps journalists survive; it does not guarantee anyone reads them.
- **Theft is exposed, not stopped.** A copy is shown for what it is; being paid for it still takes a court. Heavily edited copies may not be provably the same.
- **Defamation is still a matter for courts.** MOR records who said what and when.

## 11. What it demonstrates

A resident's photo, a local question and a world story use the same rules. Journalism on MOR is a set of roles anyone can fill, from a single reporter to a global agency, with every asset credited, every check signed, every correction shown and every payment visible to those it concerns. Journalists get four ways to be paid instead of one, readers get the means to see what a story is made of, and propaganda loses the one thing it needs most: not being seen for what it is.
