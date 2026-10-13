# MOR Case Study: From the Stands to the Main League

*Case study, draft 6, 13 October 2026. Draft 5 rewritten in layers under F280 and F283 (`docs/case-studies-f280-layers.md`), nothing else changed: the club's and the relay's shares, the feeds' named shares and a clip's lineage are paid off the top of their envelope, and what is left goes to the owner, Dario for his stream, the clipper for the clip. Draft 5's note follows.*

*Case study, draft 5, 12 October 2026. Draft 4 brought up to date with vows and the decisions F252 to F266 (`docs/case-studies-update-2026-10-12.md`), nothing else changed, before the author's redraft: a vow names what is promised, never the event, so the club's vow is for a place in the stand and Dario's for access to his stream, each under its own agreement, neither naming the other, each free to reference the match if it ever exists on MOR (F259, revised); a feed is a stream, its recording a work bound by Dario's own claim (F237); a clip names the recording as its source (Q17-4); the shape of a subscription is Dario's choice (Q17-2); tickets are sales of the club's vow, each confirmed by the fan's wallet on the way out, a moment the organiser sets through the ticketing cMIP (the author's answer of 12 October), and a resale outside the club's agreement is shown as such, never refused (F247); a key delivered under a vow is evidence, the viewer still confirms (F261, F264); media modules become the live media cMIP; the club and the clubs check their own cut (F248, F250). Draft 4's note follows.*

*Case study, draft 4, 10 October 2026. Draft 3 aligned with the current core by the project lead before the author's redraft, nothing else changed: the Envelopes layer by its new name (F212); francs become US dollars, as in the other studies; the relay's share in the stream's split named by its role and acknowledged by the viewer's wallet (F193, F194, formats review 7.2); section 8 no longer says "nothing new": the formats of standing offers, split plans and work claims were written on 10 October 2026 (step 12b, F227), and services are paid under F194. Checked and unchanged: paid live access by standing offer (offers sell access, F215, F227), the club's grant and share, targets under a condition, clips' lineage, raids by the viewer's signed referral, subscriptions, tickets resold with the club's signature, co-streaming and the broadcaster's grant key. Draft 3's note follows.*

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 6, nothing else changed. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects one point after review round 2: a live stream has no work hash until it ends, so paid live access is a standing offer, not a publication.*

## Why this case study

Live events are where attention peaks and where rights are fought over hardest. At the top, sports leagues sell broadcast rights for fortunes, split by country and by time window, and pirate streams chase every match. At the bottom, thousands of amateur clubs play every weekend with nobody filming, and fans who cannot be there see nothing.

In between, a new kind of broadcaster has appeared: the streamer, live with an audience, paid by subscriptions and tips, and sometimes invited by rights holders to comment on official feeds, a practice called *co-streaming*.

This case study follows one fan, Dario, from filming his local team for friends stuck at work, to commentating matches he cannot show, to becoming part of the machinery that covers a main league. The video case study covered recorded work; this one covers **live**, and the rights that come with it.

How live video is described and carried (its opening, its segments and their order, its closing, the recording it becomes) is defined by the live media cMIP, not by the core, with a media Module per media type for the segments' bytes. The core keeps only the vow that names the stream before it starts, and the state of each sale of it. Relays and clients that speak the same cMIP and Module can carry and play any stream; latency and bandwidth are then up to the relays. *The core's texts call the act a vow; Envelopes draft 7 and the live media cMIP still say "announcement" for the same act, until their own redraft.*

## 1. A phone in the stands

**Dario's friends are stuck at work** on Saturday afternoons, when their amateur club plays. So Dario starts streaming the matches from his phone in the stands, commenting as he goes. A handful of friends watch.

**The stream is named before it starts.** Dario's client signs a vow for Saturday: "access to my stream of the match, from my seat, with commentary". It names what Dario promises his viewers, never the match itself; if the match ever exists on MOR as an act of its own, the vow may reference it. The vow's id is the stream's name for good: friends' offers, tips and clips can point at it before a single frame exists.

**The stream is live media on a relay.** His client cuts the stream into segments as the live media cMIP describes, each signed as it goes out, only his own segments and those under his grant keys counting, and a live-video relay carries them to viewers, whose clients speak the same cMIP. Dario never sees any of this. While it runs, the stream is not yet a work: a publication needs a work hash, and a live stream has none until it ends. So live access, free or paid, is sold by a standing offer naming the vow, and the segments' keys are delivered under it. Each viewer's sale is pending, confirmed or contested, and only a viewer who signed onto the vow, by paying or by signing the free offer, can confirm or contest it. The key is evidence that sits in the sale, not the confirmation: a stream cut short is a key that worked and a promise that was not kept, and the viewer says so. When Dario closes the stream, the recording is a work: his own claim binds it to him, dated by itself, since a claim on the vow's name covers nothing it became.

**Whose match is it?** The match belongs to the club and its players; the commentary belongs to Dario. The club is a collective, a full identity like the band in the music case study, and it grants Dario permission to stream, as a signed agreement. **A live-rights cMIP is needed** to express such permissions, for example:

- **free with credit:** anyone may stream, naming the club;
- **free with a share:** anyone may stream, and a share of what they earn goes to the club;
- **exclusive:** only named streamers may stream, for a period.

The club chooses "free with a share": 20% of whatever Dario earns. Dario's vow for his stream stays his own: it sits under his agreement, the club's share in the live-rights agreement, and how he manages the rights to his own vow is his business.

**Friends tip, and strangers start watching.** Former players, parents, fans who moved away. The tips go to the one pointer Dario's agreement designates, and its split pays off the top the club's share and a share for whichever relay carried the stream, named in the plan by its role and paid when the viewer's wallet acknowledges that relay as it pays; what is left goes to Dario, whose stream it is. The club checks its 20% at its own flow address.

## 2. A target for equipment

**The audience outgrows the phone.** Viewers ask for better sound and a second angle. Dario publishes a **target**: "$1,800 for a camera, a microphone and a mobile encoder, so the whole league's supporters can follow our matches properly."

- **Progress is computed from receipts.** Dario publishes them, without the payers' names, so anyone can check the bar against the signed payments.
- **All or nothing.** Pledges are held under an agreement with a condition, paid only if the target is reached by the start of the season. If it fails, nobody pays. Dario could as well have signed a vow for the equipment, each pledge a sale of it confirmed when the receipts appear; a conditional agreement or a vow, the organiser chooses.
- **Delivery is on the record.** When the equipment arrives, Dario publishes what he bought, with the receipts. The next target, for a second camera, stands on this one's record.

**The club joins in.** The club contributes to the target from its own funds, in exchange for a larger share of future stream income, written into a new version of their agreement, cloned and signed by both.

## 3. A proper stream

**More feeds, more contributors.** A second volunteer operates the new camera; a statistics fan publishes live numbers alongside the stream. Each feed is a stream of its own, with its own opener: camera angles, commentary, statistics. Once closed, each recording is a work, bound to its maker. Dario's split pays each of them a named share off the top, beside the club's; what is left is still his.

**Clips pay their source.** Viewers cut highlights from the recording. A clip names the recording, a work, as its source, so when a clip earns, lineage pays in layers, if the clipper's agreement honours the recording's offer: the clip's split pays the recording's share off the top to the pointer the recording's agreement designates, where Dario's split takes the club's share off the top and leaves the rest to Dario, and what is left of the clip's income is the clipper's; if it does not, its published split shows exactly that. The stream's vow is a name, not a work: nothing is cut from it, and lineage never passes through it. **Clip rights are a question for the live-rights cMIP too**, for example: free with a lineage share, licensed per clip, or reserved to the club.

**Other streamers send their audiences.** When a streamer ends their own broadcast by sending viewers to Dario's stream, a *raid* in streaming language, the referral can carry a small share of what those viewers pay that day.

**Subscriptions.** Regular viewers subscribe monthly, a signed agreement with a recurring obligation; subscribers get live access, the full match recordings and a vote on the player of the match. How Dario shapes it is his choice: one vow for the season, its matches the promises it bundles and each subscriber's month a sale of it, or a vow per match. He chooses the season. A missed match marks one subscriber's sale contested, if that subscriber contests, never every sale of the season; what is owed back for it is in the vow's words.

**Tickets are sales of the club's vow.** The club signs a vow for a place in the stand, never for the match itself, and sells tickets as offers naming it. Each fan's ticket is a sale, pending until the fan confirms. The club, as organiser, chooses the moment, and the ticketing cMIP sets it: here the fan's wallet confirms on the way out, by acknowledging the exit scan, once the seat and the match were both delivered. A fan who leaves a match abandoned at half-time does not confirm, and may contest; a fan turned away at the gate contests; nobody else can do either. Whether tickets can be resold, at what price cap, and with what share to the club, is the club's choice, stated at sale; the seats, the numbers and the caps are the ticketing cMIP's, since the core counts nothing. A fan who resells by an offer naming the club's vow, outside the club's agreement, makes a valid act, which a conforming client shows every buyer as outside the club's agreement. Scalping becomes visible; the core does not refuse it.

**Consent in the stands.** Players' image rights are part of their agreements with the club. Spectators who do not want to appear can sit in marked areas the cameras avoid; the club's streaming terms say so.

## 4. The commentator

**People come for Dario's voice.** His commentary is praised well beyond the club. He starts doing **watch-alongs**: live commentary over professional matches his viewers watch elsewhere, on the channel that holds the rights.

**He shows only what is his.** Dario does not have the rights to the professional feed, so he streams only his own commentary and his own camera; viewers sync it with the feed they watch. His commentary is his work, and it earns through tips and subscriptions.

**His audience is his.** Viewers follow his identity, not a platform account. His record (streams, clips, ratings, the target he delivered) is his.

## 5. Into the machinery

**The main league's rights are sold the traditional way.** The league is a collective of clubs. It sells exclusive broadcast rights, by country and by time window: live on one broadcaster, delayed on another, highlights on a third. Each deal is an agreement with conditions, a time reference and a keeper. Blackouts and exclusives are conditions. The broadcaster delivers the matches to its subscribers' apps, with content keys held in secure hardware, as the streaming service does in the video case study.

This is the world as it is, and it works on MOR unchanged.

**The broadcaster licenses co-streaming.** Pirate streams cost rights holders dearly, and chasing them rarely works. The broadcaster tries something else: it licenses streamers to show the official feed with their own commentary. Each co-stream is an agreement: the streamer shows the feed in the broadcaster's territories and windows; the broadcaster receives a share of the streamer's income, or a flat fee. **A co-streaming cMIP is needed**, for example:

- **revenue share:** the broadcaster takes a share of what each co-stream earns;
- **flat fee per match or season;**
- **free for promotion,** in markets the broadcaster does not serve.

**Dario becomes part of the machinery.** He signs a co-streaming agreement, and his watch-alongs become full co-streams of the main league. Later, the broadcaster offers him a place in its own commentary team, one feed among several in different styles and languages. He works under a grant from the broadcaster, signing commentary with a key the broadcaster granted him: what he publishes that way is the broadcaster's own act, and pays the broadcaster; under the live media cMIP, segments signed with the broadcaster's grant keys add to the broadcaster's own stream. What he publishes under his own identity, and his audience and history, remain his.

**He does not forget the club.** On Saturdays, the amateur club's stream still runs, now operated by volunteers he trained, with the equipment his first target bought.

## 6. What rights holders and broadcasters keep

- **Exclusive rights stay exclusive.** Territories, windows, blackouts and closed apps work as today, as signed conditions.
- **Piracy becomes partly licensable.** Streamers who would have pirated the feed can become paying partners, visibly. An unlicensed offer that names the broadcaster's vow for a match stream, outside the broadcaster's agreement, is shown by conforming clients as outside it.
- **Commentary scales.** A broadcaster can offer dozens of commentary feeds, in every language and style, from streamers who bring their own audiences.
- **Talent arrives with a record.** A broadcaster hiring a commentator sees their audience, their ratings and their history, all signed.
- **Leagues see their money.** Rights income, co-stream shares and clip shares arrive in settlements the clubs can check, each club asking one question: is my cut at my flow address?

## 7. The network behind it

- **Fans and streamers:** filming, commentating, clipping.
- **Clubs and leagues:** holding and licensing rights.
- **Broadcasters:** buying exclusive rights and licensing co-streams.
- **Live-video relays:** carrying streams, paid for bandwidth.
- **Camera operators, statisticians, clippers:** paid as contributors.
- **Ticketing services:** issuing and reselling tickets.
- **Keepers:** recording rights deals.
- **Developers:** building streaming clients, feed switching, clip tools, co-streaming and ticketing modules.

## 8. What MOR provides, and what it needs

**From the core.** The vow that names a stream, a seat or a season before it exists, and the state of each sale of it (pending, confirmed, contested, by those who signed onto it alone); recorded media published as works; collectives and grants; agreements with conditions, time references and keepers; the one pointer each agreement designates; splits and role shares with the viewer's signed referral for raids; subscriptions and key delivery to secure hardware are defined; lineage, and targets computed from receipts, are built from these core pieces. The exact formats of standing offers, split plans and work claims were written on 10 October 2026 (roadmap step 12b): a standing offer sells named publications, a vow, or a delivery proven under a cMIP's terms, never "any publication carrying a work". Who is paid for a service follows the core's rule: a service chosen in advance is a named share, one chosen at payment (a relay, a raid's referrer) is acknowledged by the viewer's wallet, and none is paid on its own record alone. What a vow became, seats and quantities, delivery and the streams themselves are the cMIPs'.

**Open for others to build (cMIPs and Modules):**

- **The live media cMIP,** begun (draft 1, experimental): a stream's opening, by a vow or a first segment; only the opener's segments, and those under its grant keys; the closing act; forks shown; the recording's hash computed from the segments in order. Media Modules for the segments' bytes, so any relay and any client can carry and play them.
- **Live-rights cMIPs:** permissions to stream, clip rights, exclusivity.
- **Co-streaming cMIPs:** revenue share, flat fee, promotion.
- **Multi-feed modules:** camera angles, commentaries, statistics.
- **Ticketing cMIPs:** tickets as sales of the club's vow, the moment a fan confirms, seats and numbers, resale caps and shares.
- **Target cMIPs** for equipment and seasons.
- **Raid and referral modules.**
- **Watch-along sync tools.**

## 9. Honest limits

- **Live is hard to carry.** The live media cMIP and the media Modules define the format; low latency and large audiences still need serious relay infrastructure. MOR pays for it; it does not build it.
- **A stream never closed has no recording.** If Dario's phone dies mid-match, the segments stay, signed, but no closing act names the last one, and no recording's hash is computed; viewers who paid say whether the promise was kept.
- **Piracy remains.** Licensing co-streams converts some pirates; it does not stop the rest.
- **Rights law is complex** and varies by country, league and sport.
- **Everyone in the stands is filmed.** Consent areas help, but crowd filming raises privacy questions law must answer.
- **Youth sports need more care:** filming minors needs their parents' consent, and clubs must decide whether to stream at all.
- **Amateur audiences are small.** Most local streams will never earn much; their value is to the community.

## 10. What it demonstrates

A phone in the stands for friends stuck at work, and a main league sold country by country, use the same rules. A fan builds an audience, funds his equipment with a target anyone can check, and brings his commentary all the way into the professional machinery, carrying his identity, audience and record with him. The rights holders keep their exclusives and gain a way to turn streamers into partners. And on Saturdays, the amateur club is still on air.
