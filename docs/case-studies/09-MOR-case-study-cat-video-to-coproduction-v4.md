# MOR Case Study: From Cat Video to Coproduction

*Case study, draft 4, 9 October 2026. The author's own redraft of draft 3, with four fixes from the project lead's technical check, accepted by Nobody, allegedly: the stake sale needs no one else's approval (Agreements rule 14: other holders are notified, not asked), so "nobody else's stake changes" is kept; "clones with protected clauses" becomes deals that change only with every party's signature (protected clauses belong to collectives; a deal changes only with every party, Agreements rule 45b); a platform's metric service, not its module, reports views (a Module signs nothing, F116); "players gain". Draft 3's note follows.*

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1, 2, 3 and 6, nothing else changed; item 4 was optional and item 5 needed no change. Draft 2's own note below still says the metric is evidenced by the metric module: it records what draft 2 did and is kept as written. The rest is unchanged, for the author's own passes.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects draft 1 after review round 2 (F29, F68, F75, F77, F82): free video is locked with its key attached, not unencrypted; a repost is a reference; a key delivered to an app goes to a bare key; the team withdraws its own publications and contests a platform's; the chain-key grammar names its way through; the platform's metric is evidenced by the metric module.*

## Why this case study

Video is where today's platforms hold the most power and the most attention. A creator's audience, income and history all live inside one company's systems: if the platform changes its rules, demonetises a channel or disappears, the creator starts again from nothing. At the other end, film and series deals rest on long contracts, opaque recoupment and streaming revenue nobody outside can check. The industry’s biggest players gain more and more bargaining power as they grow. 

This case study follows one creator, Nico: from posting cat videos on his phone, to running a production team, to publishing on an ad-supported platform, to finally coproducing a series with a streaming service. It shows that the same small set of core rules carries every step, and that today's business models (tips, advertising, subscriptions, even locked-down streaming) all fit within the protocol, unchanged. What changes is that every stake, every cut and every payment is visible to those it concerns, and that nobody's audience or history can be held hostage.

This case study separates the production from the publishing, and focuses on the second.

## 1. Alone: cat videos and tips

**Nico gets an identity.** His client creates it on two devices: his phone holds the signing key, and an old phone kept offline holds the chain key; both seeds are backed up. His identity lives at a home he chooses, where anyone can find where to reach him and verify his content. 

**He posts a cat video.** He picks a file from his phone and uploads it to a video relay, the way he would to any video site. How the video is cut up, stored and streamed is handled by his client, the relay and a video media module they both speak, not by him. His client binds the video to him as a work, and his identity's routes tell other clients where his videos live. The video is free: like everything on MOR it is stored locked, and its key travels with the publication, so anyone can watch it and no relay can tell a free video from a paid one by its shape.

**Viewers tip him.** His identity declares a payee pointer, and a viewer tips from the simplest wallet with one tap. No agreement is needed for a tip. Nico keeps his flow pointer on his signing key for convenience, and sets a vault behind his chain key for anything large, per currency he accepts.

**Followers share his videos.** A repost is a reference to the original publication, never a publication of its own, so a tip on a repost is a tip on Nico's video and goes to Nico wherever people find him. Followers are people following his identity, not an account on a platform: if he changes apps, they come with him.

**He gets hooked.** Tips grow with his following. He starts planning better videos, and needs help. Creation found an audience. 

## 2. A team: the production collective

**Nico forms a production team.** The team becomes a collective: a full identity of its own, with its own home, signing key and chain key. Its founding agreement sets how the keys are held, for example:

- any one member signs everyday acts, like receipts for tips;
- two of three publish a video;
- two of three rotate the chain key, so no single member is ever needed. Every grammar must leave a way to rotate that needs less than everyone; a two-of-three share is the simplest.

**Each video has its own ownership.** Every video's agreement sets the stakes: Nico, an editor and a camera operator, written in millionths so shares always sum exactly. Crew members choose how to be paid: a flat fee through a standing offer, or a stake in the video, betting on its success.

**Money flows through a split service.** The team's payee pointer points to a split service named in its agreement through a grant. Every incoming payment, and every payer's record of one, is split according to the video's agreement and paid out to whoever holds each stake as a simple payment with its own receipt. Anything that cannot be delivered stays as a visible open obligation.

**Financing new equipment.** To buy a better camera, the team sells a small stake in its next three videos to a supporter, each stake transferred to the supporter once that video exists. The sale is signed by the team and the buyer, and the split service pays the supporter from then on; nobody else's stake changes. 

## 3. Publishing on an ad-supported platform

**The team publishes through a video platform** that runs advertising, the way today's large video sites do. On MOR, the platform is a publisher:

- It publishes the team's videos as its own publications, holding a stake in each publication, never in the video itself.
- Its agreement with the team says how ad revenue is shared: for example 55% to the team, 45% to the platform.
- Advertisers pay the platform per view or click, as reported by the platform's metric service, an identity running a metric module. That is an attention-based deal: allowed on MOR, and visible for what it is. The metric, the service reporting it under its own signature, and the resulting payments are all named in the settlements.

**The team compares platforms.** The same video can be published by several platforms at once, each with its own publication and stake. The team sees in real settlements which platform actually earns them money, not which one claims the most views.

**Leaving costs nothing.** If a platform changes its terms, the team ends its agreement, stops delivering new videos, and publishes elsewhere. On the other hand the platform withdraws its own publication or keeps it, and a publication the team no longer authorises is contested in the open. Past deals stand, and the team's identity, videos, followers and history stay with the team. The platform can end its service, it cannot take the audience.

## 4. A coproduction with a streaming service

**A streaming service notices a video** and proposes turning it into a series. The streamer is an identity (a company) whose executives act under grants: one can negotiate deals up to a limit, another manages existing productions.

**They negotiate on the record.** Messages are locked and signed, each acknowledging the last one received. The record stays private, but either side can publish it if things go wrong, and anyone can check it is complete up to the last acknowledged message.

**The coproduction deal.** The agreement names the team and the streamer as parties, and sets:

- **stakes in the series:** for example the streamer 60%, the team 40%, with the team's share divided among its members by their own agreement;
- **stakes in distribution:** the streamer's publication of the series, and the share of subscription revenue attributed to it;
- **financing and recoupment:** the streamer finances production and is paid first until its investment is recovered, after which the normal split applies;
- **milestones on a named time reference:** delivery of each episode, with what follows if a milestone is missed;
- **a keeper,** which records the deal and every act around it as it happens, sealed, without reading the content;
- **an exclusivity window:** the series streams only on the streamer's service for a set period on the time reference, after which the team may publish it elsewhere;
- **the cMIPs it uses,** one per task: split, conditions, time reference.

Every term, however demanding, is legible to both sides before they sign. Nothing in a deal changes without the signature of every party whose voice remains. The clauses that could move either side's stake (who judges absence, which keeper, which split service) cannot later be changed for a party who has not signed the change.

**The series is made.** Episodes are delivered as works, each bound to the coproduction's agreement. Delivery acts are recorded by the keeper, so milestones met and missed are provable.

## 5. Distribution on a closed subscription client

**The streamer distributes through its own app.** Subscribers pay a monthly subscription: a recurring obligation in an agreement between the subscriber and the streamer, signed by the subscriber, paid to the streamer's payee pointer.

**The content stays locked in the app.** Each episode is encrypted, and its content key is delivered to a bare key held inside the streamer's app. It is stored in the device's secure hardware, as streaming services do today. Subscribers watch in the app but never hold the key. This is today's copy protection, rebuilt on MOR, and it is visible: the key delivery shows the key went to an app key, not to the subscriber's identity.

**Access follows payment.** While the subscription is paid, the app receives keys for new episodes; when it lapses, the obligation shows as past its terms and no new keys are released.

**Subscription money is shared visibly.** The streamer's subscription revenue is divided among the works on its service by a split module: by total viewing across all subscribers, by each subscriber's own viewing, or by fixed shares. Whichever model the streamer uses, the coproducers see it, the metric is signed by the service that measured it, and they can check that the series' share is computed as their agreement says. The team's portion then flows through its own split service to each member.


**After the exclusivity window,** the team publishes the series through other platforms as well, under the terms of the coproduction deal, and the streamer's publication keeps earning its agreed share where it applies.

## 6. The network behind it

- **Video relays:** storing and streaming video in the formats video media modules define, paid for storage and bandwidth.
- **Publishers and platforms:** earning through publication stakes and ad-revenue shares.
- **Metric services:** reporting views and clicks for attention-based deals under their own signature, competing on trustworthiness.
- **Split services:** running the team's and the coproduction's splits.
- **Keepers:** notarising the coproduction and its milestones.
- **Key-release services:** delivering content keys to subscribers' apps at scale, under a grant from the streamer.
- **Access modules:** subscriptions, lapse and copy protection.
- **Developers:** building players, publishing tools, split logic and streaming clients as MOR modules and clients.

## 7. What MOR provides, and what it needs

**From the core, nothing new.** Everything above uses what the MIPs already define: identities, homes and routes; media objects and locked media with attached or delivered keys; key delivery to a bare application key; payee pointers, flow and vault; work claims, stakes, publication stakes and stake sales; collectives with a way to rotate, and grants; agreements, keepers, time references, deals that change only with every party's signature, and the negotiation record; splits, including splits that follow attention metrics evidenced by the service that measured them.

**Open for others to build (cMIPs and Modules):**

- **Video media modules for the Envelopes:** how segmented video is described, so any relay and any client can carry and play it.
- **Ad-revenue cMIPs:** how views and clicks are reported, and how ad revenue is shared.
- **Metric modules,** run by metric services that report attention under their own signature, and ways to compare their reliability.
- **Subscription cMIPs** and **split modules** for pooled subscription revenue (by total viewing, by each subscriber's viewing, or fixed).
- **Recoupment split modules.**
- **Coproduction toolkits:** milestone tracking, delivery acts, exclusivity windows.
- **Access and copy-protection modules** for closed clients.

## 8. Honest limits

- **Attention metrics rest on trust.** Views reported by a platform's own metric service are only as honest as the platform. MOR makes the deal legible and the metric service accountable for its signature; it cannot make the count true. Competing metric services and audits are the answer.
- **Copy protection can be broken.** Keys held in an app raise the cost of copying; they do not prevent it.
- **A closed client limits the viewer.** Subscribers cannot take the series to another app during the exclusivity window. What they keep is the record of what they paid for.
- **A platform's publication is the platform's.** The team cannot withdraw it; it can stop authorising it, contest it, and publish elsewhere.
- **Contracts still need courts.** MOR records who agreed to what and when; enforcing a missed milestone is still a matter for the parties, arbitration or the law.

## 9. What it demonstrates

A cat video tipped by strangers and a coproduced series on a subscription service use the same rules. Tips, advertising, stake sales, coproduction, recoupment, subscriptions and even locked-down streaming all fit without changing the core. The creator's identity, audience and history belong to the creator at every stage, and every cut taken along the way, by a platform, a streamer or a partner, is visible to the people who pay it.
