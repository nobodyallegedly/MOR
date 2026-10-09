# MOR Case Study: From Bedroom to Label

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1, 3 to 6 and 8 to 11, nothing else changed. Item 2 waits on an open question for Nobody, allegedly (what a purchase of a sole creator's claimed work names); item 7 asks the author to pick one of two recovery paths; item 12 was optional. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 corrects where draft 1 overclaimed after review round 2 (F46, F68, F72, F75, F77): payment goes to the publisher's pointer; upstream shares are honoured by the remixer's agreement, visibly, not automatically; referrals are the buyer's signed evidence; a rotation needing every member names a recovery path; a publisher's publication is withdrawn by the publisher.*

## Why this case study

Music is where online collaboration was tried first, and where it most often stalled. Platforms like BandLab showed that people want to make music together online: share stems, fork each other's tracks, build songs across continents. Nostr projects tried the same in the open. What was missing was never the collaboration itself. It was an economic layer underneath: a way to say who made what, who owns what, and how money flows when the music earns. Collaboration without ownership, credit or payment stays a demo.

This case study follows one musician, Lea, from making tracks alone in her bedroom, to forming a band, to signing with a label, and shows that the same small set of core rules carries her the whole way. Nothing she does needs a special feature. Every step uses the same identities, agreements, splits and grants, from a free stem shared with strangers to a professional label deal.

## 1. Alone: an identity and a first track

**Lea gets an identity.** Her client creates it on two devices: her everyday phone holds the signing key, and an old phone kept in flight mode holds the safety key. Both seeds are backed up. Her identity lives at a home she chooses, a small relay run by a service she trusts. Her songs and posts can live on any relays she likes, and her routes say where others can deliver to her.

**She makes a track from stems.** Each stem she records (drums, bass, vocals) is a work, and she binds each one to herself with an explicit claim. The finished track is a work too, built from those stems.

**She uses tools made by others.** Her vocals go through a reverb plugin and a vocal preset she bought from other creators. A plugin, a preset or a mixing template is a work like any song, bound to its maker and sold through a standing offer. The makers can sell in several ways side by side:

- a one-off purchase;
- a subscription;
- a share of what the finished track earns. If Lea's release uses the preset, her track's split names the preset maker as the receiver of a small share for "tools used", which needs no evidence.

A preset built on someone else's preset names its source, and that source can ask for a share too.

**She publishes, and people pay.** The track goes out encrypted, with a price. Payment goes to Lea's own payee pointer, since she is the publisher; a publication has no pointer of its own. A fan pays from the simplest wallet; Lea's side delivers the key, and the deal is done. A tip needs nothing more than that. The fan's wallet keeps its own record of the payment, so if Lea's side ever signed nothing, the fan could still put the payment on record.

**Others fork her work.** Lea publishes her stems with a standing offer: "free to remix; 20% of any income goes to me." A producer in another country makes a remix. The remix is a new work whose claim names Lea's stems as its sources. When the remix earns, the money goes to the producer's pointer and is split by the producer's agreement. If that agreement honours Lea's offer, her share is paid; if it does not, the producer's published split shows exactly that, Lea contests it, and every client that reads contests can see a remix that took a free stem and kept the 20%. The core makes the breach visible; it does not prevent it, because it never decides which claim is the claim.

Lineage works at every depth. A remix of the remix names its own source, the first remix, whose split in turn names Lea. Each level only pays its immediate parent, and the chain takes care of itself among people who keep their offers. Forking stops feeling like theft and starts paying the people it builds on, and anyone who does not pay is seen not paying.

## 2. Together: forming a band

**Three musicians meet online** through Lea's remix and start working together. At first they simply share stems and sessions, each contributor's stake set by agreement as they join: a contribution becomes ownership only when the others sign.

**They form a band.** The band becomes a collective: a full identity of its own, with its own home, signing key and safety key. Its founding agreement sets the grammar for how those keys are held:

- any one member can sign everyday things, like receipts for incoming payments;
- publishing a release is an area of the agreement that two of three hold (the key grammar says only how the keys are held);
- all three are needed to rotate the band's safety key. Because that would trap the band if one of them vanished, the grammar also names its way through: a fourth share of the safety key held in escrow by a custodian under the band's grant, released only by the abandonment authority the agreement names. Every grammar must leave a way to rotate that needs less than everyone; this is theirs.

**Their songs have shared ownership.** Each song's agreement sets the stakes, for example 40% each for the two writers and 20% for the drummer, written in millionths so they always add up exactly. Any tiny leftover from dividing goes to the holders with the largest remainders, ties taking turns.

**They get paid through a split service.** The band's payee pointer points to a split service named in their agreement through a grant. When a fan pays, the service publishes the split, pays each member as a simple payment with its own receipt, and keeps anything it cannot deliver as a visible open obligation. The split can include:

- the members' shares, paid to whoever holds each stake at the time;
- a share for whoever reposted the song and led to the sale, evidenced by the referral the buyer's own wallet signed, so the service cannot name a friend of its own;
- a share for "tools used" (the preset maker from section 1), named in the plan as its receiver, which needs no evidence;
- the fees of the modules the payment ran through, and the service's own cut, capped by the plan.

**Engineers and session musicians choose how to be paid.** When the band hires a mixing engineer, the engineer chooses: a flat fee through a standing offer, or a small stake in the song, betting on its success. A session violinist makes the same choice. Both are ordinary agreements.

**A member leaves.** When the drummer moves on, the remaining members clone the founding agreement without him and rotate the band's keys to new ones he never held. His stakes in past songs stay his, and keep paying him. He loses his voice in the band's future, not his share of its past.

**A member disappears.** If a member simply vanishes, the abandonment clause they all signed decides what happens: who judges absence (and, if they chose one, which absence-proof cMIP proves it), and what follows (for example, their vote is removed but their stake keeps paying them). It also releases the escrowed share, so the band can rotate without the missing member. And that clause cannot change without the signature of every member whose voice remains; a member who has left is judged by the clause in force.

## 3. Signed: a label deal

**A label notices the band.** The label is itself an identity, a company or a collective, with its managers acting under grants: one can sign new deals up to a limit, another manages existing ones.

**They negotiate.** Messages between the band and the label are locked and signed, each acknowledging the last one received from the other side. The record stays private, but either side can publish it if the negotiation turns into a dispute, and anyone can check it is complete up to the last acknowledged message.

**They sign a deal.** The agreement is terms plus one signature per party, naming:

- the cMIPs it uses, one per task (split, conditions, time reference);
- a keeper, which records the deal and everything around it as it happens, sealed, without reading the content;
- the stakes: for example, the label takes a stake in the band itself, written into the band's own agreement, which shares in all its income; or a share of each new release's publication or work, written in by a new version of the deal once the release exists, as the parties agree;
- the split plan: the label's cut, the members' shares, fees and role shares, and the maximum fee per payout;
- a recoupment rule, if the label advances money: the label is paid first until the advance is repaid, then the normal split applies;
- a time reference, for deadlines such as delivering an album.

Every term, however generous or harsh, is legible to both sides before they sign, in plain text with nothing hidden in the characters. A label that takes 80% may do so; every other band can see it, and a label that takes less can advertise the difference.

**The label's manager signs under a grant,** with a key of the label limited to the grant, so the deals the manager signs are the label's own acts. If the label later revokes that grant, the manager's powers end: a deal signed before the revocation binds the label; one signed at the same time or after is void, unless the label adopts it by an act of its own key, such as acknowledging it, citing it or paying on it. Counterparties who want certainty wait until a later act of the label cites their deal before they perform.

**Distribution competes.** The label publishes the album through several publishers at once, each publication naming the label as the identity it is made for, so payment reaches the label whatever wallet pays. Each publisher holds a stake in its own publication, never in the music. The band and the label see, in real settlements, which publisher actually sells. A publisher withdraws its own publication; the label can end its agreement with one that does not sell, withdraw a publication made for it that it no longer authorises, and publish elsewhere.

**A film wants the song.** A production company licenses the track for a film. The licence is an agreement with conditions (territory, duration, use), a time reference, and the keeper recording it. The payment runs through the split of the agreement whose pointer was paid, so the band, the label, the preset maker and the drummer who left all receive exactly what that agreement says.

**Deals change by cloning.** When the band renegotiates with the label, nothing is edited. The deal is cloned with new terms, signed again under its clone rule, and the old deal closes. Nobody's stake shrinks without their own signature, and nobody's keeper, abandonment clause or split service changes without it either.

## 4. The network behind it

Lea's journey only works if a whole network of people builds and runs the pieces. MOR pays them through the same settlements that pay the music:

- **Plugin and preset makers:** sold as works, including the share-of-earnings option.
- **Engineers and session musicians:** paid by fee or by stake.
- **Split services:** paid through their own share in the splits they run.
- **Publishers and curators:** paid through publication stakes and referral shares the buyers' wallets evidence.
- **Homes, relays and keepers:** paid for hosting identities, serving files, receiving deliveries and notarising deals.
- **Developers:** building the collaboration tools, the DAW integrations, the stems format and the split logic as MOR modules, and earning fees in the splits those modules take part in.

## 5. What MOR provides, and what it needs

**From the core, nothing new.** Everything above uses what the MIPs already define: identities and homes, text, envelopes and locked media, payments, payee pointers and the payer's own record, work claims, stakes, agreements and clones, splits and role shares with third-party evidence, keepers, grants and the publication's "for", collectives with a way to rotate, abandonment, contests and the negotiation record.

**Open for others to build (cMIPs and Modules):**

- **A stems format:** how a multitrack work and its stems are described and linked.
- **A remix-lineage cMIP:** how a derivative work names its sources, how upstream shares are expressed in standing offers, and how a client refuses to sell a remix whose plan ignores them.
- **Split cMIPs:** pro-rata, recoupment-first, payer-side splitting, and "tools used" evidence from session files.
- **A session-file module:** a record, signed by the musician, of which works (stems, plugins, presets) went into a release; a record, not evidence for role shares.
- **Collaboration clients:** a BandLab-style studio where joining a session proposes a stake, and saving a contribution asks the others to sign.
- **A label toolkit:** grants for managers, recoupment tracking, publisher comparison, import before performance.
- **Sync licensing conditions:** territory, duration and use, as condition modules.
- **Escrowed key shares:** a custodian service holding a collective's recovery share under grant, with a Module naming only how shares are dealt and checked.

## 6. What it demonstrates

The same rules serve a teenager sharing a free stem and a label signing a band. Nothing changes between the two but the agreements people choose to sign. Today's practices, including tough label terms, fit unchanged. What changes is that every stake, every cut and every payment is visible to the people it concerns, from both ends, and that leaving, whether a band, a label or a platform, never costs anyone what they already made.
