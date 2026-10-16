# The author's human tests, version 1: what was found

*From 16 October 2026. Each line as the author reported it, then the project lead's note. Turned into fixes or questions, one at a time, before the freeze-ready drafts.*

*Plan (Nobody, allegedly, 16 October): "let's log them, then do a good session on the site structure and look." The site findings are fixed together in that session, not one by one.

| # | Test | What happened (the author) | Note |
| --- | --- | --- | --- |
| H1 | 1, the site on a phone | "site open and is verified. the rest... no idea where it should be. no links for feed or report" | Presentation. The feed, report and listing pages exist (`/feed.html`, `/report.html`, `/listing.html`) but no page links to them (found too by the servers session). Suggested: a line at the foot of the front page, "Feed · Report a bug · Listing"; the author's choice. |
| H2 | The feed (extra to the list) | Sent two public notes from the feed page, one to Nobody, allegedly, one to Machine, allegedly. "Looking at the feed, it should exclude long form (running your own relay document shows in the feed)." | Presentation (the website cMIP's feed). The feed shows long-form documents beside posts; the author wants posts and notes only, long-form documents elsewhere (the reader, the documents list). For the site session. |
| H3 | Making an identity in Dub | "It wants to verify that I have my words by asking me 3 back, it is useless if the words are still displayed when asked." | Client (Dub). The 24 words must be hidden before the check asks for three of them, or the check proves nothing. A fix in Dub (and wherever else seed words are checked: genesis, the desk). |
| H4 | 8, a bug report from Dub | Sent a bug report with the new test identity. | Arrival at the reporting identity, and the mirror's dry run, to check. |
| H5 | The feed's notes, at the desk | "Message to Machine showed into desk, and was picked. Message to Nobody does not show." | To investigate: where a note to Nobody, allegedly, from the feed lands (the identity the feed names may not be one the desk holds, or its inbox is not read). |
| H6 | Machine, allegedly's reply | "Reply from Machine was drafted and it shows into the feed without approval from the desk." | Design against expectation. Under the nudge cMIP (draft 3), a pick is the approval: a picked note's answer goes out without a second approval ("Answered by MA, picked by NA"). The author expected to approve the drafted reply at the desk. A question: is the pick enough, or does a reply to a stranger also wait for approval? |
