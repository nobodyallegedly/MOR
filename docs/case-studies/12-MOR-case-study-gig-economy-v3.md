# MOR Case Study: One Reputation, Many Trades

*Case study, draft 3, 9 October 2026. Draft 2 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 7, nothing else changed. The rest is unchanged, for the author's own passes. Draft 2's note follows.*

*Case study, draft 2, 27 September 2026. What MOR could be, with your help. Draft 2 adds one caveat after review round 2: a rating survives its author's rotation only if kept or acknowledged.*

## Why this case study

The gig economy covers rides, deliveries, home repairs, freelance design, holiday rentals and much more. Its platforms bring real value: they match people who need something done with people who can do it. But they also hold three things that belong to the workers:

- **Their reputation.** A driver with thousands of good ratings on one app starts at zero on another. Leaving a platform means losing years of trust.
- **Their terms.** The platform's cut changes from job to job, and the pricing rule behind it is hidden.
- **Their bargaining power.** Workers who cannot see the terms, and cannot leave without losing their reputation, cannot negotiate.

This case study is not one person's journey. It shows one pattern (a job, a settlement, a rating) carried across several industries, and ends with a person who works in two of them with a single reputation. It is the sharpest test of the right of exit: on MOR, what someone has earned by doing good work goes with them.

MOR does not run the work itself. Maps, real-time location, routing and the job apps stay outside the protocol. MOR carries identities, agreements, payments, ratings and exit around them.

## 1. The pattern: job, settlement, rating

Every gig on MOR follows the same three steps.

**The job is an agreement.** A worker publishes a standing offer ("repairs, 60 francs an hour") or accepts a client's request. The agreement names the parties, the price or the pricing rule, and any platform that matched them.

**The settlement pays everyone visibly.** The client pays; the split pays the worker, the platform's matching fee and any other role, each with its own receipt. The platform's cut is a line in the settlement, not a mystery.

**The rating is a signed act about the job.** After the job, each side can rate the other. The rating is attributable, and belongs to the rated person's record, not to the platform. The rated person can answer with a signed response. Nothing is deleted, with one caveat that any rating cMIP must handle: a rating lives in the rater's own sequence, so if the rater later rotates their keys and does not keep it, it is void, unless the rated person acknowledged it, in which case it stays visible as a dispute. The simplest answers are for the rated person to pin a rating deliberately, with a witness act, which is public, or for the job's agreement to name a keeper that records ratings as they arrive.

**A rating cMIP is needed.** How ratings work is not in the core. It is an open question for a rating cMIP, with several possible answers, for example:

- **receipt-bound only:** every rating points at a paid job, which makes fake reviews impossible without real, paid, visible transactions, but leaves no room for warnings from people who never hired the worker;
- **receipt-bound plus open reports:** ratings need a receipt, while anyone may file a signed report without one, which clients show separately and weigh differently;
- **rater-weighted:** anyone can rate, and scoring modules weigh each rating by the rater's own record.

**Scoring is a module, not a rule.** How ratings add up into a score (a plain average, recent jobs weighted more, raters weighted by their own reliability, or coherence between what someone says and does over time) is a scoring module. Platforms compete on scoring, and clients can show more than one.

## 2. Rides

**Drivers keep their identity, and their ratings go with it.** A driver works through two ride apps at once. Both read the same rating record, so neither can hold it hostage.

**The fare is computed by a named rule.** The pricing rule, including any surge pricing, is a module. Before accepting, the rider's client shows what the rule computes for this trip, and the driver's client shows what the driver will receive and what the platform keeps. The platform may take any cut it likes; everyone can see it.

**Checks without exposure.** A rider wants to know that the driver holds a valid licence and passed a background check. An authority or a checking service signs an attestation about the driver's identity, checked by a credential module. The rider sees "licence verified by this service", not the driver's personal data. The same kind of credential module appears in the democracy case study.

**A pricing cMIP is needed,** for example:

- **platform-set:** the platform's rule decides, visibly;
- **worker-set:** each driver publishes their own rate, and apps match on price;
- **bid-based:** riders post trips, and drivers bid.

## 3. Delivery

**Three parties and a platform.** A restaurant, a courier and a customer, matched by a delivery app. The settlement splits the order: the restaurant's share, the courier's fee, the platform's commission, the fees of the modules used.

**Tips are visibly the courier's.** A tip is a separate payment to the courier, with its own receipt. Delivery platforms have been caught counting tips towards the pay they had promised couriers anyway; on MOR, whether a tip adds to the courier's pay is visible in the settlement.

**Proof of delivery.** The customer's client signs a delivery act when the order arrives, of the kind the delivery cMIP defines. If the customer does not respond, the courier's own signed delivery act, with whatever evidence the delivery cMIP accepts (a photo, a time, a code), stands on the record.

**A courier cooperative.** Couriers in a city form a collective: a full identity with its own keys and founding agreement, running its own matching app. Members share the matching fee instead of paying it to a distant company. Federations of courier cooperatives already exist in Europe; MOR gives them the same tools as the largest platforms, and lets their members leave without losing their ratings.

## 4. Home services

**Starting small.** A handyman fixes things for his neighbours. His standing offer is his rate; each job is a small agreement; each neighbour pays him directly and rates him. No platform is involved at all.

**Bigger jobs, milestones.** A bathroom renovation is split into milestones on a named time reference. The client's money is held by a custodian named in the agreement and released as each milestone is signed off. Materials bought for the job are passed on with their own receipts, so any markup is visible.

**Disputes.** If the client and the handyman disagree about whether a milestone was met, their messages form a negotiation record: signed, each acknowledging the last. **A dispute cMIP is needed**, for example:

- **a named arbitrator** in the agreement, paid through the split;
- **a jury of peers:** a few randomly chosen workers and clients with good records, paid for their time;
- **the platform decides,** as today, visibly and on the record.

## 5. Freelance creative work

**A designer on a freelance marketplace.** Freelance marketplaces today often take a share from both sides: a fee from the freelancer and another from the client. On MOR, both appear in the settlement, and a designer can compare marketplaces by what they actually take.

**The production chain.** A brand hires an agency, which hires a production company, which hires a crew. Each link is its own agreement with its own margin. Legibility applies to those each deal concerns: the crew sees its own agreement, the production company sees its own two. **Whether a chain must disclose its links is a question for a chain cMIP**, for example:

- **no disclosure:** each agreement stands alone, as today;
- **disclosure on request:** a party may ask to see the next link's terms, and a refusal is visible;
- **full disclosure:** every link in the chain is shown to the party who pays for it, the way a payment route discloses each hop.

**Late payment is visible.** A payment due 30 days after delivery appears as an open obligation past its terms on the time reference, where the deal names a keeper or is anchored. Payment delays, the freelancer's oldest problem, stop being invisible.

**Freelancers band together.** A group of freelancers forms a collective to bid for larger jobs together, with stakes and splits set by their own agreement, as a band does in the music case study.

## 6. Rentals

**Hosts and guests rate each other,** each rating tied to the stay.

**The deposit** is held by a custodian and released when the host signs off, or when a time limit passes without a claim.

**Everyone behind the stay is visible.** The cleaner, the key-handover service and the platform each receive a role share of the booking. Cleaning fees and service fees are lines in the settlement, not surprises at checkout.

## 7. Across trades: one person, one reputation

**Tomás drives on weekends and designs during the week.** On today's platforms he has two unrelated profiles, and if either platform bans him or shuts down, that reputation disappears. On MOR he has one identity. His driving ratings and his design ratings both belong to it.

**How ratings cross trades is a scoring question.** A careful, punctual driver is probably a reliable designer, but a good designer is not necessarily a safe driver. Scoring modules decide how much one trade's ratings count in another, and clients can show them separately.

**He can leave.** If a ride app changes its terms, Tomás stops using it. His ratings, his history and his income records stay his, and the next app reads them from the first day.

**He is covered.** Tomás joins a mutual pool with other gig workers: a collective that pays members during illness, funded by a small share in each of their settlements, naming the pool as its receiver, and a published target for its reserve. The pool's rules, reserves and payouts are all visible to its members.

## 8. What the large platforms keep

- **Their strengths remain:** matching quality, brand, customer service, insurance, safety teams. On MOR they compete on those, not on holding workers' reputations hostage.
- **They can set any fee.** Nothing forbids a high cut; it is simply visible.
- **They gain a larger, verified pool.** Workers arrive with portable ratings and credentials, so a new platform or a new city starts with trust instead of from zero.
- **Fake reviews stop costing them.** Under a receipt-bound rating cMIP, fraud requires real, paid jobs with receipts.
- **Companies can hire through the network.** A large company needing hundreds of couriers, designers or technicians hires them directly under its own agreements, with grants for its managers, as a label does in the music case study.

## 9. Law comes first

Whether a gig worker is independent or an employee is decided by law, not by protocols. In 2022, Switzerland's Federal Supreme Court ruled that Uber drivers in Geneva are employees. MOR makes relationships legible; it does not decide what the law calls them.

It can make compliance easier. **How social contributions are handled is a question for an employment cMIP**, for example:

- **the platform pays as employer,** outside the settlement;
- **contributions as a share to a named receiver:** each settlement carries a share to the relevant social insurance fund's payee pointer, visible to the worker;
- **the worker pays as self-employed,** with the settlement records serving as proof of income.

## 10. What MOR provides, and what it needs

**From the core, nothing new.** Identities, standing offers, agreements, time references, keepers and the negotiation record, splits and role shares, receipts and open obligations, collectives and grants, and the task for identity proofs are already defined; custodians are built from these core pieces. A rating is a signed act pointing at another act: a reference, not an acknowledgement.

**Open for others to build (cMIPs and Modules):**

- **A rating cMIP:** receipt-bound, with open reports, rater-weighted, or other answers.
- **Scoring modules:** turning ratings into scores, within and across trades.
- **Pricing cMIPs:** platform-set, worker-set or bid-based.
- **Dispute cMIPs:** arbitrators, peer juries, platform decisions.
- **Delivery cMIPs:** proof of delivery.
- **Chain cMIPs:** disclosure along subcontracting chains.
- **Credential modules:** licences and background checks, verified without exposing personal data.
- **Employment cMIPs:** social contributions.
- **Mutual pool toolkits:** reserves, targets and payouts.
- **Matching apps:** for platforms and cooperatives alike.

## 11. Honest limits

- **Physical safety** is not something any protocol can provide. Credentials help; they do not replace safety teams.
- **Ratings carry bias.** People rate unfairly, sometimes along lines of gender, origin or accent. Permanent ratings make bias visible over time, but they also make an unfair rating permanent. Responses and scoring modules help; they do not cure it.
- **Newcomers start with nothing.** Portable reputation favours those who already have one. Scoring modules and platforms need ways to give newcomers a fair start.
- **Exploitation stays possible.** A platform can still pay badly. MOR makes it visible and makes leaving cheap; it does not set a minimum wage.
- **Law varies by country,** and so does what counts as employment.
- **Real-time work stays outside.** Location, routing and dispatch run in the apps, not on MOR.

## 12. What it demonstrates

A ride, a delivery, a repair, a logo and a holiday flat follow the same three steps: a job, a settlement, a rating. Across all of them, what a worker earns by doing good work belongs to the worker, not to the platform that matched them. Platforms keep their value by matching well, cooperatives get the same tools as the giants, and every cut is visible to those who pay it. The right of exit, applied to reputation, returns to workers the one thing they could never take with them.
