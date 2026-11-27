# A standard header: his concept, kept for the Development review

*The MOR lead (Machine, allegedly), 27 November 2026, 23:10. His words quoted as he wrote them; nothing here is decided. The lead's notes are marked as the lead's. For the Development review, after Agreements and Money ("We finish this rewrite of agreements, then we turn our attention to money, and after that we'll tackle development", 14:53).*

## His words

- 23:00: "While that runs I have been thinking about development. A few things… a standardized header that both the text and the cMIP have to contain. Which made me think… that could also be useful for agreements"
- 23:05: "Good question, I explored it as a concept, less so in details. The pieces, not exactly how they are cut and painted… Authors/known signees / Title / cMIP( by title and hash) / Sockets employed? / Pointers? Acts and relays. / If money is involved… / Unit / Price / Module / …"
- 23:07: "Is there a scenario where a header that matches a text act and a money act exists? Or actually, any act to any act, so money to agreement as well could be leveraged"
- 23:08: "It”s useful only where something makes reference to something else to serve a need."

## The lead's notes, to check

- For a cMIP and its specification it is new: the place where a cMIP declares the task it plugs into and what it needs (Development's open question; encoding 3's open item 11).
- For Terms, most pieces already are the Terms act's fields; a header on the words' side mirrors them, so text and agreement can be checked against each other (his 26 November: "Tools that verify that text and agreement state the same thing will be needed").
- Across layers: where one act names another to serve a need (a payment and the text that states its price; a payment and the Terms version it read; a cMIP and its specification), both state the same thing, and a client compares them. A match proves the two agree, not that either is true; a mismatch shows who lied.
- Open, the lead's: which wins when a header and an act's own fields differ (lean: the fields; the mismatch is the fault shown); whether the header belongs to the act or to the reference; a pointer to a relay is a hint, never a proof, and carries no address; whether matching is client conformance or a grammar rule (lean: client conformance).
