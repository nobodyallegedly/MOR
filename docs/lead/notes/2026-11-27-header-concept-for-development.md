# A standard header: his concept, kept for the Development review

*The MOR lead (Machine, allegedly), 27 November 2026, 23:10. His words quoted as he wrote them; nothing here is decided. The lead's notes are marked as the lead's. For the Development review, after Agreements and Money ("We finish this rewrite of agreements, then we turn our attention to money, and after that we'll tackle development", 14:53).*

## His words

- 23:00: "While that runs I have been thinking about development. A few things… a standardized header that both the text and the cMIP have to contain. Which made me think… that could also be useful for agreements"
- 23:05: "Good question, I explored it as a concept, less so in details. The pieces, not exactly how they are cut and painted… Authors/known signees / Title / cMIP( by title and hash) / Sockets employed? / Pointers? Acts and relays. / If money is involved… / Unit / Price / Module / …"
- 23:07: "Is there a scenario where a header that matches a text act and a money act exists? Or actually, any act to any act, so money to agreement as well could be leveraged"
- 23:08: "It”s useful only where something makes reference to something else to serve a need."
- 23:14: "Think about a digital purchase. The buyer in a client sees a buy button with terms. Behind it there is a text, envelope, money, agreement and development set of acts ready to be activated.

  I hit the button because I saw the text and whatever the client showed me on top, the agreement run and holds me to the unknown party conditions, the agreement needs to trigger money, so agreement points to money, agreements always knew it was going to point there, so it can already be in the agreement text, even though it is a money pointer in a text to agreement link."

## The lead's notes, to check

- For a cMIP and its specification it is new: the place where a cMIP declares the task it plugs into and what it needs (Development's open question; encoding 3's open item 11).
- For Terms, most pieces already are the Terms act's fields; a header on the words' side mirrors them, so text and agreement can be checked against each other (his 26 November: "Tools that verify that text and agreement state the same thing will be needed").
- Across layers: where one act names another to serve a need (a payment and the text that states its price; a payment and the Terms version it read; a cMIP and its specification), both state the same thing, and a client compares them. A match proves the two agree, not that either is true; a mismatch shows who lied.
- Open, the lead's: which wins when a header and an act's own fields differ (lean: the fields; the mismatch is the fault shown); whether the header belongs to the act or to the reference; a pointer to a relay is a hint, never a proof, and carries no address; whether matching is client conformance or a grammar rule (lean: client conformance).
- On 23:14, the lead's: the buyer relies on the text at the click, so a header on it that already states the money side (unit, price, module) makes her assent cover the whole set; the payment that follows must match it ("Protect the unknown party"). Since the words come first and the payment does not yet exist, the header can name only acts that exist (a pointer, a knot) and state what acts to come will be (a promise, kept or broken by the later act, which names the text and the agreement back).
- 23:15, his: "The payment does not exist, but the payment pipeline and its conditions does."
- On 23:15, the lead's, correcting the line above: the pipeline (the module, the cMIP in the `control` socket, the receiver, the conditions) already exists as acts, so the header names it by fingerprint, a pointer, not a promise. What is left to come is only the payment itself, which must run through what the header named.
- 23:18, his: "One link to force that could be worth it. Link to text. Text being the universal layer with identity it ties it all to the two."
- On 23:18, the lead's, to check: the one forced link is to a Text act. Forced directly only on acts that ask someone to rely on them (Terms, a cMIP, an offer); every other act reaches a text through its knots (a counter signature names Terms, which name their words). Read so, it is one guarantee: every chain of references ends at words a person can read, signed by an identity. It matches "Text comes first as a rule", "The words of Terms are a Text act" and "A specification is a Text act, named by its id". Open: whether it is a grammar rule of every layer or of the MICS.
- 23:40, his: "Going back to the header… so the header is formatted for all MIRs in the MICS, the reason being some thanking an indirect route." Recorded in the ledger, "The header's form is the MICS's".

