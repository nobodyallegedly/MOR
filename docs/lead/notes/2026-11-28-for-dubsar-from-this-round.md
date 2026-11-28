# For the Dubsar Suite lead: what this round leaves for the competitive layer

*The MOR lead (Machine, allegedly), 28 November 2026, 10:30. What the decisions of 27 and 28 November leave for cMIPs and Modules, DubLaw above all. Every item points to its ledger entry on main (`docs/decisions.md`), where his words are quoted; the framing as work for Dubsar is the lead's, a proposal, not his. Draft 26 is still being rewritten on these decisions; nothing here is final text.*

## For DubLaw

His words (28 November, 10:25): "DubLaw will need to demonstrate how the agreement layer can be used, quite important set of cMIPs at launch." Since Agreements is "not to be used bare" (26 November), DubLaw's set is what makes the layer usable on the first day. The lead's proposal for that set, to check: an ending condition for each common shape (all known parties; a majority; by clock, anchored); K9 rules (cross verification, two of three); a spot cMIP for buyers (K5); a resolver for forks; the open-obligation check; the collective templates below; each shown in a case study.

- **Constitutions as ending conditions.** The update condition is gone; the socket is the ending condition: what ends an agreement, by signatures, a clock, or any condition the bytes can check ("The ending condition"). There are no versions: any change is an end and a new agreement ("No versions: the chain guards the end and forces knots"). Constitutional cMIPs are written for the end and the hand-over, not for amending.
- **Renew or exit.** When a collective changes who it is, it is a new party; the old one runs on while it has standing obligations; every counterparty renews or exits; no succession of a party in the core ("A change of who they are: renew or exit", with "proceed with the new board"). Templates for the renewal ask, and for running two collectives during the overlap, are DubLaw's.
- **Running a collective on several agreements.** The framework thought through this round: a face that rarely changes (who they are, how they govern themselves), and the churn in agreements the face is a party to, as a large corporation keeps its face while employees come and go ("Collectives: the dual agreement framework"; his 10:17: "surely it is structured with more than 2 agreements. So, the face does not need to change often even if employees do."). Templates for it, and for which agreement holds which part, are DubLaw's. Its limit: it absorbs churn, not a change of who they are, which stays renew or exit ("proceed with the new board").
- **Dissolving.** No dissolving while an unknown party's obligation is open; the known parties are protected by their signatures or the scheme they agreed to ("No dissolving with open obligations to unknown parties"). A cMIP that answers whether an obligation is open is needed.
- **Closing.** A new agreement's first act may carry a closing pointer: the old one is no longer valid, and it once existed; it closes only where its signatures meet the old one's ending condition; two acts ending the same agreement are a fork, for a resolver ("The closing pointer: no longer valid, and it once existed"; the sorted test questions, A1 and A2).
- **Partners.** Terms that name a buyer as a signer make her a partner, bound as known parties are; warning her is a client's ("A buyer named as a signer is a partner").
- **Clocks.** An agreement that states a clock is provisional until anchored ("An act that names a clock is anchored to it").

## For the relay and client side

- **Keeper services.** In the core a keeper is a relay: lodge, relay, fetch ("A keeper is a relay"; "The keeper's ordered record is a service, not the core"). A keeper that signs an ordered record, and the cMIP that names how many keepers count (K9: cross verification by default, lifted by a cMIP), are services to build ("Keepers: cross verification by default, a socket to lift it").
- **Evidence.** Where bytes cannot confirm that an act was at the stated where, clients show the signed acts that bear on it, a rely among them ("Rely when a relay dies").
- **Answers of absence** are "as far as I can see", naming how many keepers they rest on ("“As far as I can see” is the honest answer").

## For Development, when it comes

- **The header:** one form, the MICS's; every act links to a text, directly or indirectly; the keepers' socket is among what it carries ("Every act links to a text"; "The header's form is the MICS's"; `docs/lead/notes/2026-11-27-header-concept-for-development.md`).
