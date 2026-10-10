# MOR Case Study: From the Stands to the Main League

*Case study, draft 4, 10 October 2026. Draft 3 aligned with the current core by the project lead before the author's redraft, nothing else changed: the Envelopes layer by its new name (F212); francs become US dollars, as in the other studies; the relay's share in the stream's split named by its role and acknowledged by the viewer's wallet (F193, F194, formats review 7.2); section 8 no longer says "nothing new": the formats of standing offers, split plans and work claims were written on 10 October 2026 (step 12b, F227), and services are paid under F194. Checked and unchanged: paid live access by standing offer (offers sell access, F215, F227), the club's grant and share, targets under a condition, clips' lineage, raids by the viewer's signed referral, subscriptions, tickets resold with the club's signature, co-streaming and the broadcaster's grant key. Draft 3's note follows.*

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 6, nothing else changed. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects one point after review round 2: a live stream has no work hash until it ends, so paid live access is a standing offer, not a publication.*

## Why this case study

Live events are where attention peaks and where rights are fought over hardest. At the top, sports leagues sell broadcast rights for fortunes, split by country and by time window, and pirate streams chase every match. At the bottom, thousands of amateur clubs play every weekend with nobody filming, and fans who cannot be there see nothing.

In between, a new kind of broadcaster has appeared: the streamer, live with an audience, paid by subscriptions and tips, and sometimes invited by rights holders to comment on official feeds, a practice called *co-streaming*.

This case study follows one fan, Dario, from filming his local team for friends stuck at work, to commentating matches he cannot show, to becoming part of the machinery that covers a main league. The video case study covered recorded work; this one covers **live**, and the rights that come with it.

How live video is described and carried (segments, their order, their timing) is defined by media modules for the Envelopes layer, not by the core. Relays and clients that speak the same live module can carry and play any stream; latency and bandwidth are then up to the relays.

## 1. A phone in the stands

**Dario's friends are stuck at work** on Saturday afternoons, when their amateur club plays. So Dario starts streaming the matches from his phone in the stands, commenting as he goes. A handful of friends watch.

**The stream is live media on a relay.** Dario starts a stream from his client. His client cuts it into segments as a live media module describes, each signed as it goes out, and a live-video relay carries them to viewers, whose clients speak the same module. Dario never sees any of this. While it runs, the stream is not yet a work: a publication needs a work hash, and a live stream has none until it ends. So live access, free or paid, is offered through a standing offer, and the segments' keys are delivered under it; the recording afterwards is a work, bound to Dario, and published like any other.

**Whose match is it?** The match belongs to the club and its players; the commentary belongs to Dario. The club is a collective, a full identity like the band in the music case study, and it grants Dario permission to stream, as a signed agreement. **A live-rights cMIP is needed** to express such permissions, for example:

- **free with credit:** anyone may stream, naming the club;
- **free with a share:** anyone may stream, and a share of what they earn goes to the club;
- **exclusive:** only named streamers may stream, for a period.

The club chooses "free with a share": 20% of whatever Dario earns.

**Friends tip, and strangers start watching.** Former players, parents, fans who moved away. The tips flow through the stream's split: Dario's share, the club's share, and a share for whichever relay carried the stream, named in the plan by its role and paid when the viewer's wallet acknowledges that relay as it pays.

## 2. A target for equipment

**The audience outgrows the phone.** Viewers ask for better sound and a second angle. Dario publishes a **target**: "$1,800 for a camera, a microphone and a mobile encoder, so the whole league's supporters can follow our matches properly."

- **Progress is computed from receipts.** Dario publishes them, without the payers' names, so anyone can check the bar against the signed payments.
- **All or nothing.** Pledges are held under an agreement with a condition, paid only if the target is reached by the start of the season. If it fails, nobody pays.
- **Delivery is on the record.** When the equipment arrives, Dario publishes what he bought, with the receipts. The next target, for a second camera, stands on this one's record.

**The club joins in.** The club contributes to the target from its own funds, in exchange for a larger share of future stream income, written into a new version of their agreement, cloned and signed by both.

## 3. A proper stream

**More feeds, more contributors.** A second volunteer operates the new camera; a statistics fan publishes live numbers alongside the stream. Each feed is a work with its own maker: camera angles, commentary, statistics. The stream's split pays each of them.

**Clips pay their source.** Viewers cut highlights from the recording. A clip names the stream as its source, so when a clip earns, lineage pays Dario, the club and the clipper, if the clipper's agreement honours the stream's offer; if it does not, its published split shows exactly that. **Clip rights are a question for the live-rights cMIP too**, for example: free with a lineage share, licensed per clip, or reserved to the club.

**Other streamers send their audiences.** When a streamer ends their own broadcast by sending viewers to Dario's stream, a *raid* in streaming language, the referral can carry a small share of what those viewers pay that day.

**Subscriptions.** Regular viewers subscribe monthly, a signed agreement with a recurring obligation; subscribers get live access under the standing offer, the full match recordings and a vote on the player of the match.

**Tickets are agreements too.** The club sells match tickets as signed agreements. Whether they can be resold, at what price cap, and with what share to the club, is the club's choice, stated at sale. Since the club is a party to each ticket, a resale needs the club's signature too; a ticketing service working under the club's grant can sign for it. Scalping becomes visible.

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

**Dario becomes part of the machinery.** He signs a co-streaming agreement, and his watch-alongs become full co-streams of the main league. Later, the broadcaster offers him a place in its own commentary team, one feed among several in different styles and languages. He works under a grant from the broadcaster, signing commentary with a key the broadcaster granted him: what he publishes that way is the broadcaster's own act, and pays the broadcaster. What he publishes under his own identity, and his audience and history, remain his.

**He does not forget the club.** On Saturdays, the amateur club's stream still runs, now operated by volunteers he trained, with the equipment his first target bought.

## 6. What rights holders and broadcasters keep

- **Exclusive rights stay exclusive.** Territories, windows, blackouts and closed apps work as today, as signed conditions.
- **Piracy becomes partly licensable.** Streamers who would have pirated the feed can become paying partners, visibly.
- **Commentary scales.** A broadcaster can offer dozens of commentary feeds, in every language and style, from streamers who bring their own audiences.
- **Talent arrives with a record.** A broadcaster hiring a commentator sees their audience, their ratings and their history, all signed.
- **Leagues see their money.** Rights income, co-stream shares and clip shares arrive in settlements the clubs can check.

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

**From the core.** Live media sold by standing offer and recorded media published as works, collectives and grants, agreements with conditions, time references and keepers, splits and role shares with the viewer's signed referral for raids, subscriptions and key delivery to secure hardware are defined; lineage, and targets computed from receipts, are built from these core pieces. The exact formats of standing offers, split plans and work claims were written on 10 October 2026 (roadmap step 12b): a standing offer sells named publications or access, never "any publication carrying a work". Who is paid for a service follows the core's rule: a service chosen in advance is a named share, one chosen at payment (a relay, a raid's referrer) is acknowledged by the viewer's wallet, and none is paid on its own record alone.

**Open for others to build (cMIPs and Modules):**

- **Live media modules for the Envelopes:** how a live stream is cut into segments, ordered, timed and signed, so any relay and any client can carry and play it.
- **Live-rights cMIPs:** permissions to stream, clip rights, exclusivity.
- **Co-streaming cMIPs:** revenue share, flat fee, promotion.
- **Multi-feed modules:** camera angles, commentaries, statistics.
- **Ticketing cMIPs:** tickets, resale caps and shares.
- **Target cMIPs** for equipment and seasons.
- **Raid and referral modules.**
- **Watch-along sync tools.**

## 9. Honest limits

- **Live is hard to carry.** Media modules define the format; low latency and large audiences still need serious relay infrastructure. MOR pays for it; it does not build it.
- **Piracy remains.** Licensing co-streams converts some pirates; it does not stop the rest.
- **Rights law is complex** and varies by country, league and sport.
- **Everyone in the stands is filmed.** Consent areas help, but crowd filming raises privacy questions law must answer.
- **Youth sports need more care:** filming minors needs their parents' consent, and clubs must decide whether to stream at all.
- **Amateur audiences are small.** Most local streams will never earn much; their value is to the community.

## 10. What it demonstrates

A phone in the stands for friends stuck at work, and a main league sold country by country, use the same rules. A fan builds an audience, funds his equipment with a target anyone can check, and brings his commentary all the way into the professional machinery, carrying his identity, audience and record with him. The rights holders keep their exclusives and gain a way to turn streamers into partners. And on Saturdays, the amateur club is still on air.
