# The click on draft 14: seats, a delegate, a partner's path, a contest

*The Dubsar Suite lead, 13 November 2026, for Nobody, allegedly, and the MOR lead. On `cmips/sketches/click/click-14.ts` (twelve runs in `run-output-14.md`), against Agreements draft 14 (pull request 167) and the report block, proposal 2 (`docs/lead/proposals/report-block-2.md`). The same film, song, band and library as before, with a delivery service, a band that signs through a delegate, and an undelivered purchase. A record of work, not a decision.*

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

## In plain words

**The money still reaches everyone, and each seat sees what draft 14 says it should.** The buyer gets the service's confirmation that the payment arrived, then access, and nothing more (run 1). A film owner sees the film's service pay out (run 2). A band member sees the band's service pay her and her bandmates (run 4). A contest on an undelivered film reaches the film's two signers and no one else, and they can pass it to their delivery service (run 10).

Where draft 14 snaps:

1. **A collective that co-owns a work has no voice in it, by default** (runs 3 to 7). The song belongs 70% to the band and 30% to its producer. Read one level, the band is a party "named as an agreement", so it isn't counted when the song is put in force or replaced, and it doesn't sign the song's deal. The producer alone can set the song's shares, and change them, and the band's members can't see the song's leg at all. This is a question for Nobody, allegedly (section 5).
2. **"The other side of its own leg" isn't settled, and both readings leak or lose data** (runs 3, 11, 12). If the other side is only those paid, a report that owes everyone and pays no one is addressed to nobody: the people owed never learn it. A report paying one bandmate carries what the others are owed. And the song's service, paid by the film's service, is shown the film's whole split, with every owner's amount, though it signed nothing in the film's deal.
3. **A delegate can't say whom she signs for** (run 8). Draft 14's `for` field holds a person; a band's delegate must name an agreement.

The rest is answered or narrowed: the partner's path (section 3), the contest (section 4), and the later payment of owed money, which is still untied (section 6).

## 1. What each seat sees

| Seat | Sees | Run |
|---|---|---|
| the buyer | the service's confirmation that 1000 arrived; access, from the delivery service | 1 |
| a film owner | the film's service: 1000 in, a fee of 10, and every payout of the film's leg | 2 |
| the song's service | the film's whole split, every owner's amount, being paid in that leg | 3 |
| a band member | the band's service: 409 in, her and her bandmates' payouts | 4 |
| the same, if each receiver gets only their own line | 409 in, her own 122 | 5 |
| the producer, if a call's signers are a side | the song's leg: its report and both confirmations | 6 |
| the same, if only those paid are | the song's report, sent because he was paid | 7 |

The buyer's seat is exactly his words: "Buyer needs to receive confirmation payment has been received. Then, access to wathever they bought. Not that the money reached all members." It works with no call written.

## 2. A collective signing through a delegate

The band's Terms give one member, as delegate, the power to sign deals for it, and let a majority decide anything else. The delegate signs the band's deal with its split service "for" the band, "under" the band's Terms (run 8).

**Are all the paths signed, through the delegate's power, as he reads it?** Yes, on the band's leg. The two other members are paid under a deal they didn't sign themselves. They are bound by it only through the band's Terms, which they did sign and which gave the delegate that power (rule 5.1(b)). Every payout from the band's service to a member travels a leg its people agreed to.

**Where they are not:**
- **On the song's leg** (snap 1 above): the band isn't a signer of the song, so nobody signs for the band there, delegate or not.
- **The `for` field.** It holds "the person in whose name the act is made" (section 3.2), and here it must hold an agreement. Draft 14 already lists this in P17 ("how an act names an agreement in `for`"). The run makes it concrete: a delegate's signature can't be written as the text stands.
- **"May inform the agreement she is under."** The band has no inbox: informing it means sending her confirmation to each of the other members. That's a path beyond her leg with the service. It carries her own half, and so the service's amounts too. Whether the band's own Terms are enough of an agreed path for that, or whether this needs a data cMIP, isn't said.

## 3. A partner who wants to see beyond one leg

The film's partner wants to see that one band member was paid from the film's money. A data cMIP for that has to answer two different questions, and the run shows the two lists differ (run 9):

- **Who must sign Terms naming the cMIP** (rule 11.6(b)): the people of each leg on the path. Here that's the film's deal (its service and the film's two owners), the song's deal (its service and the producer), and the band's deal (its service and the band, by its own rule).
- **Whose data it carries** (rule 11.6(a)). If it carries whole reports, that's everyone named in them: ten identities, including the library's receiver, who signed none of those Terms. If it carries only the lines on the path, it's the three services and the one band member.

So a data cMIP should carry only the lines on the path. Otherwise it carries people who never agreed. The library's receiver is the plain case: she's in the film's report because she was paid, not because she signed. That's draft 14's item 3, a receiver who signed nothing in the leg, seen from the partner's side.

In a band whose Terms let a majority decide, an outvoted member is read as the rule he signed (rule 11.6(b)). The run confirms the text reads as written. Whether that is agreeing is his question, already open (draft 14, item 16).

## 4. A contest on an undelivered purchase

The buyer paid, got the confirmation, and got no access (run 10).
- The contest is made within the film, naming the version read and the payment. It reaches the film's signers, one level: its two owners. It doesn't reach the song's or the library's people, the split service, or the delivery service. That's his "the signers of the agreement are contested at first, not the services they pick".
- One of the owners passes it on: a contest of her own within the film's deal with its delivery service, which the film signed. It reaches the service. "If the signer believe the mistake is at the service they contest the service": it works as he said, and the two contests are tied, the second answering the first.
- **What the run shows beyond the text:** by the time the buyer contests, the money has already gone down every leg. The film's service paid the owners, the song's service and the library's receiver. A refund comes from the signers who were contested, out of what they received; nothing brings back what went further. Draft 14 says how money comes back isn't the grammar's (11.8, section 7). The run makes the cost concrete: the people contested are the people who passed the money on.

## 5. For Nobody, allegedly: one question

**Is a band that co-owns a song meant to have no say in the song, unless the song's Terms ask for it?**

Under "one level" and the default of rule 4, a party named as an agreement isn't counted. So the producer alone puts the song in force, replaces it, and signs its deal, while the band holding 70% signs nothing and sees nothing of the song's leg. The text allows the song's Terms to name the band in their `in_force` rule, but nothing makes them, and a band could easily miss it. His earlier words ("The new agreement points to the other agreement as one party, no collective involved") were about a work that *points at* another, like a film using a song. Here the band is an *owner*. The grammar can't tell the two apart.

The Dubsar Suite lead's lean, not a decision: keep the grammar as it is, since counting every agreement party would make a film need every song's signature. But write it as a stated cost, and make it one of the first facts a terms reader shows: "this owner holds 70% and is not counted when these Terms change."

## 6. For the MOR lead: the rest

- **"The other side", for K8** (snap 2; draft 14, item 9). Ran both readings. Suggested, from the principle that data moves only along paths people signed for: the leg's signers (the call's makers) are a side and get the whole report; a receiver who signed nothing in the leg gets only its own line; anyone owed is addressed as if paid. Otherwise the song's service sees the film's whole split (run 3), and money owed under a minimum is reported to nobody (run 11).
- **`for` holding an agreement** (P17): needed for any delegate (run 8).
- **3d, a later payment of an owed line: still open** (run 11). A payout of old owed money and new money is one amount. K8's row needs a way to say "of which this much settles what was owed in that report".
- **3e, pools.** The buyer's confirmation is per payment and doesn't wait for a pooled service's batch (11.7). That's good. A batch report answering one call for many payments is still the block's open item 3.
- **3f, loops.** Now placed by the text in the data cMIP (11.6(a): "what a loop answers (P8)"). Nothing in the grammar walks past one leg, so nothing there loops.
- **The companies** weren't used. With the partner view now a data cMIP, Counterparty's best target is a data cMIP that carries whole reports where it should carry lines; Plain Words', the band's Terms, written so its members see before signing what the delegate may sign for them.
