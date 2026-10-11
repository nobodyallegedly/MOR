# Case studies 08, 12, 14, 16 and 17 against the vow decisions

*Review, 11 October 2026. Written for Nobody, allegedly, against main at `bed26d9`. No case study is edited; this is a report only. Read against F237, F239, F240, F241, F244, F246 to F250 (`docs/findings/MOR-findings-log-round-2.md`), `docs/vow-grammar-build.md`, and, for what is now written in the texts, Agreements draft 10 (rules 15b, 32, 32b, the offer format, type 14) and `cmips/cmip-live-media-draft-1.md`. Latest drafts read: 08 v3, 12 v4, 14 v4, 16 v2, 17 v4. F234 had already listed these five as "to check when next touched".*

## In plain words

**What changed since these stories were written.** MOR now has a way to sell something before it exists: a **vow** (the texts still say "announcement" until the redraft, F241). Someone signs a short act saying, in words, what is to come; offers name that vow and sell it. The core tracks only one thing per sale: is it **pending**, **confirmed** (the buyer acknowledged something about the vow) or **contested** (the buyer signed a contest). Only someone who signed onto the vow, by paying or by signing a free offer, can move a sale; a stranger's contest, or the seller vouching for their own delivery, changes nothing (F240). Everything about what is promised (seats, quantities, delivery, what the vow became, and streams) belongs to cMIPs (F237).

On money: a work's agreement **designates one payment pointer**, and a publisher pays that pointer and is done (F244, F248). Who splits it, the backups and what counts as failure live in the **split cMIP** the agreement names; the core only checks, for each participant, "is my cut at my flow address?" (F249, F250). And in a chain of judges, **only one judge is active on a question at a time**, each stage with an agreed deadline (F245, F246).

**What I found, in one line per story.**

- **08 (musician):** mostly holds. Its money paths predate F248 and F250 and say "the label" or "the band's payee pointer" where the rule now says "the pointer the work's agreement designates". It never uses a vow, though an album sold before it is recorded is the textbook case (F234 named "preorders" for it).
- **12 (gig economy):** one sentence now reads wrong: a courier's own delivery act "stands on the record" as if it settled something; under F240 it leaves the sale pending. The rest holds, and vows would give it a much sharper "job" step. Whether every service is a vow is unclear.
- **14 (learning and work):** holds. Its word "streams" (of ratings) now collides with the technical word "stream". Vows fit the live session and the assessment; whether a course is a layer above lessons (F248) or a derivative with lineage is unclear.
- **16 (commerce):** the biggest open question. A listing "is a signed offer", but an offer can only sell a publication, access, or a vow; a bowl already in stock is none of these yet. Made-to-order work and the numbered series are clear vows; F247 would let it say much more about resale.
- **17 (live sports):** the most outdated. It predates F237: feeds are called "works", the recording is "bound to Dario" without saying by his own claim, tickets "need the club's signature" for resale (the core does not prevent a resale; it shows it outside the claiming agreement), and "media modules" are now the live media cMIP. Its draft note says streams were "settled" by F229 to F232, which F237 then moved out of the core.

Thirteen questions follow, grouped by story; two of them (Q-G1, Q-G2) bear on several stories at once, and Q16-1 is Q-G1 asked for one story. One at a time, as you prefer.

---

## Questions that reach several stories

**Q-G1. Can a vow sell something that already exists but has no bytes?** The task's summary is "vows, sold before they exist"; F234's words were "something that has no bytes, or no bytes yet" and "IOU of services that need to come at a later date". An offer's `sold` today names a publication, access (`[ 2, [cMIP, params] ]`), or a vow (`[ 3, vow ]`). A ceramic bowl on Inès's shelf (16), a handyman's hourly rate (12), a warehouse's storage (16) are not publications. *Options:* (a) yes: a vow is any act naming something MOR cannot hash, existing or to come, and every sale of a physical good or a service names one; (b) no: a vow is only for what does not exist yet; goods and services that exist are sold through the access form, named by a cMIP, with no sale state; (c) the cMIPs decide (a listing cMIP may open a vow per product or not). *Why it matters:* under (a), every bowl and every job gets pending, confirmed, contested for free; under (b), the core tracks nothing for them, which is what Fable's finding 7 ("two forms for one task") warned of.

**Q-G2. One vow per thing, or one per sale?** A season of matches (17), a series of twenty vases (16), a weekly tutoring slot (14), a recurring delivery round (12). The core counts nothing (F237: quantities are the cMIPs'). *Options:* (a) one vow for the series, each buyer's sale its own state, which number or seat each got a cMIP's; (b) one vow per item (per match, per vase), versions on each; (c) the cMIPs decide, both allowed. *Why it matters:* a contest marks "every sale of that buyer of that vow" (V-R9): under (a), a fan who contests one bad match marks the whole season contested.

---

## 08, From Bedroom to Label (draft 3)

### What now reads wrong or outdated

1. **The band's pointer, not the work's.** *"The band's payee pointer points to a split service named in their agreement through a grant."* Each song has its own agreement (*"Each song's agreement sets the stakes, for example 40% each..."*), so under F248 it is **each song's agreement** that designates the one pointer at which that song accepts payment. "The band's payee pointer" blurs the band (a collective, an identity) with the song (a work, with an agreement). It may well be the same split service; the text should say whose designation it is.
2. **Distribution: "payment reaches the label".** *"each publication naming the label as the identity it is made for, so payment reaches the label whatever wallet pays."* Under F244 and F248 a publisher's split pays the work's share to the pointer **the work's agreement designates**; the publishing agreement states the publisher's cut, and the publisher's responsibility ends once the share reaches that pointer. Whether that pointer is the label's depends on the album's agreement, which holds the band's and the label's stakes. As written, the label looks like the receiver by default.
3. **The split service, without backups or failure.** *"When a fan pays, the service publishes the split, pays each member as a simple payment with its own receipt, and keeps anything it cannot deliver as a visible open obligation."* Still true, but now partial: under F250 the service, its backups in order and what counts as a failed attempt are fields of the split cMIP the agreement names; and the check is each member's own ("is my cut at my flow address?"), not the service's publication alone.
4. **"From the core, nothing new."** *"Everything above uses what the MIPs already define: ..."* The list predates vows and the designated pointer; neither is used, so it is not wrong, but section 5's list of cMIPs (*"Split cMIPs: pro-rata, recoupment-first, payer-side splitting..."*) now has a home for backups and failure conditions that it does not mention.

### What the decisions would let it say better

- **A preorder, as a vow (F234 named 08 for it).** The deal already has *"a time reference, for deadlines such as delivering an album"*. The label (or the band) signs a vow, "our second album, twelve songs, out by spring", and sells preorders by offers naming it. Each fan's preorder is pending; it is confirmed when the fan's own claim acknowledges the release; a fan who never gets it can contest. A stranger who dislikes the band cannot (F240).
- **The stake in a release, kept as it is, now with its reason.** *"a share of each new release's publication or work, written in by a new version of the deal once the release exists"* is exactly right under F237: a stake in the album's vow would cover nothing the vow became, so the album's own claim and a new version of the deal are still needed. The text can say why: nothing is backdated.
- **Distribution, with F248's line.** "Each publisher pays the album's share to the one pointer the album's agreement designates, and its responsibility ends there; what happens behind that pointer is the album's agreement alone. When something goes wrong, the receipts show which side of the line it went wrong on." (F248: "clear segmentation also helps pinpointing the cause of problems, or bad actors.")
- **The film licence** already says *"The payment runs through the split of the agreement whose pointer was paid"*; it can say "the pointer the song's agreement designates", which is now the rule rather than a description.
- **Each member checks their own cut** at their flow address (F250), including the drummer who left: his stake keeps paying him, and he can see whether it does.
- **Section 5:** "Split cMIPs: ..., with the split service's backups and what counts as a failed attempt (F249, F250)."

### Unclear for this story

- **Q08-1. Which agreement designates the album's pointer?** Each song has its own agreement; the label's stake is either *"in the band itself, written into the band's own agreement"* or *"a share of each new release's publication or work"*. When a publisher sells the album, does it pay one pointer (an album agreement, designating one) or twelve (one per song's agreement)? F248 says "a work always accepts payments at the same addresses"; the album is a work built from twelve works. *Options:* (a) the album is a work with its own agreement and designates one pointer, its split paying the songs' pointers in turn (a layer, F235); (b) a publication of an album pays each song's pointer, the publishing agreement stating each song's cut; (c) the stems or album cMIP decides.

### Note on words

- If a preorder is added: "the label signs a **vow** (the texts' announcement) for the album".

---

## 12, One Reputation, Many Trades (draft 4)

### What now reads wrong or outdated

1. **The courier's own delivery act.** *"The customer's client signs a delivery act when the order arrives, of the kind the delivery cMIP defines. If the customer does not respond, the courier's own signed delivery act, with whatever evidence the delivery cMIP accepts (a photo, a time, a code), stands on the record."* If the order is a sale of a vow, F240 and rule 32b decide this: **the seller's side acknowledging its own delivery changes nothing**; the sale stays pending until the customer confirms or contests. The courier's act is on the record, and a delivery cMIP may weigh it, but in the core it settles nothing. "Stands on the record" reads as if it did.
2. **"From the core, nothing new."** *"Identities, standing offers, agreements, time references, keepers and the negotiation record, splits and role shares, receipts and open obligations, collectives and grants, and the task for identity proofs are already defined."* The core now has one more piece made for this study (F234: "even the gig economy can leverage it"): the vow and the state of each sale.
3. **Disputes, without the chain of judgment.** *"A dispute cMIP is needed, for example: a named arbitrator in the agreement, paid through the split; a jury of peers...; the platform decides..."* These are offered as alternatives. The core already has a chain of judgment in the agreement (rules 34a, 45b), and under F245 and F246 they can be **stages of one chain**: the arbitrator first, with an agreed deadline; if it passes unanswered, the jury is the active judge and the arbitrator is void on that question. Only the active judge settles. The dispute cMIP is then how a jury is drawn and how a judge decides, not which single judge exists.
4. **"The settlement pays everyone visibly ... each with its own receipt."** Still true; under F248 and F250 it is incomplete: the job's agreement designates one pointer; the split cMIP names the service, its backups and failure; each party (worker, platform, the cleaner in section 6, the mutual pool in section 7) can check its cut at its own flow address.

### What the decisions would let it say better

- **The job, as a vow.** "The worker signs a vow: 'repair the bathroom tap, Tuesday'. The client's payment names it. Until the client confirms, the job is pending; if the client contests, it is contested; nothing else moves it." This gives the three-step pattern (job, settlement, rating) a core-level fact under it that no platform writes.
- **The rating caveat, sharpened by F240.** The study's open reports (*"anyone may file a signed report without one"*) stay a rating cMIP's choice; but a **contest** of a job is reserved by the core to those who signed on. That is the receipt-bound principle at the core's level; ratings may be wider. Saying so separates a rating (anyone's opinion, weighed by a cMIP) from a contest (a buyer's statement about a sale).
- **Milestones.** *"A bathroom renovation is split into milestones on a named time reference."* Each milestone can be a version of the job's vow, or a vow of its own (Q-G2), each confirmed by the client in turn; the custodian's release is the cMIP's and can read those states.
- **Late payment and the mutual pool:** the pool's share is a cut it checks at its own flow address (F250); a missing cut is visible to the pool, not only to the worker.
- **The production chain.** F248's reason (a publisher's responsibility ends at the designated pointer; "clear segmentation also helps pinpointing the cause of problems") fits the agency, production company and crew. See Q12-2 before saying so.

### Unclear for this story

- **Q12-1. Does every gig name a vow?** Q-G1 for services: the handyman's standing offer (*"repairs, $60 an hour"*) sells hours not yet worked. *Options:* (a) yes, the offer names a vow the worker signs; (b) only jobs agreed in advance (the renovation), a standing rate staying an access offer; (c) the pricing or job cMIP decides.
- **Q12-2. Does F248's "responsibility ends at the pointer" reach a subcontracting chain?** F248 is decided for a publisher and a work. The agency paying the production company's designated pointer looks the same shape. *Options:* (a) yes, any agreement paying another agreement pays its designated pointer and is discharged there; (b) only publishing layers; the chain cMIP decides the rest.

### Note on words

- "The job is an agreement" can become "the job is a **vow** (the texts' announcement) sold under an agreement", if Q12-1 is (a) or (b).

---

## 14, Shown, Not Listed (draft 4)

### What now reads wrong or outdated

1. **"Streams" of ratings.** *"many signed streams of ratings are weighted and combined by a module"*, *"Many streams, arriving over time"*, *"as the strongest stream it has"*, *"the most valuable stream of all"*. "Stream" is now a technical word: a chain of segments named by a vow, with its own cMIP (terminology note of 10 October; the live media cMIP). The study does not mean that, and in a world where lessons have live sessions it will be read that way. *Suggested:* "sources", "strands" or "flows" of ratings. A wording choice for the author.
2. **"From the core, nothing new."** *"Identities, works and versions, agreements and payments, splits and role shares, stakes, signed attestations..."* As in 12, it predates the vow and the designated pointer.
3. **The course's lineage.** *"when it earns, lineage pays each lesson's teacher, if the course's agreement honours the lessons' offers"*. Still a fair description of lineage. But if the course publishes the lessons (a layer above them, F235), F244 and F248 say something stronger: the course pays each lesson's designated pointer and divides nothing. Which reading applies is Q14-1.

### What the decisions would let it say better

- **The live session, as a vow.** *"the studio where the live session takes place"*: a session that has not happened is a vow; enrolment is an offer naming it; each student's enrolment is pending until the student confirms, or contested. A contest by an enrolled student is a signed, attributable fact an accreditation module can read; an expert who was paid for a review but never enrolled cannot contest it (F240). That fits the study's anchor ("calibrate against outcomes").
- **The assessment, as a vow.** Karim pays for an assessment not yet done; the assessor's vow ("assess your grading work") is sold, and Karim confirms or contests the sale. His contest does not touch the attestation's content; it says the sale was not respected.
- **The split.** *"The lesson's split pays Elena, a tutor..., the studio..., and the rental service..."*: the lesson's agreement designates one pointer; the split cMIP names service, backups and failure; each of the four checks its cut at its own flow address (F250). The raters' pool (section 4) likewise.

### Unclear for this story

- **Q14-1. Is an aggregator's course a layer above its lessons, or a derivative with lineage?** Section 4 says lineage; the players list says aggregators *"compile lessons ... as editors compile assets in the journalism case study"*. *Options:* (a) a layer (F235): the course's agreement states each lesson's cut and pays each lesson's designated pointer, responsibility ending there (F248); (b) a derivative work, as the remix in 08, paying upstream by its own agreement's honour; (c) either, chosen by the aggregator, the study showing one.
- **Q14-2. Is a contest by an enrolled student evidence an accreditation module may read?** The core says only what a contest does to the sale's state (rule 32b: it voids nothing). Whether the study may present it as one of the "strands" an accreditation module weighs is a cMIP's choice; I would like to know whether you want the study to suggest it.

### Note on words

- "The live session" can be "a **vow** (the texts' announcement) for the live session". Keep "stream" out of section 4 (point 1).

---

## 16, No Firm Required (draft 2)

### What now reads wrong or outdated

1. **A listing "is a signed offer".** *"Each product is listed as a standing offer: photos, description, price, stock, delivery terms."* A standing offer must name what it sells, and the offer format has three forms: publications, access, or a vow (`[ 3, vow ]`). A physical bowl is not a publication. What the listing names is not said, and Q-G1 decides it. Also, **"stock"** is a quantity, which F237 places with the cMIPs: the core counts nothing under an offer (Fable's finding that "a ticket sold twice is caught" was false). The study already lists *"Listing cMIPs: products, stock, variants"*; the listing sentence should not read as if the core held the stock.
2. **The numbered series: "a claim naming the series and its number".** *"Each vase is a physical object with a signed record: a claim naming the series and its number."* "A claim" in the core is a work claim (rule 15), which covers works only; a claim on a vow's name covers nothing it became. If the record is a provenance cMIP's act, say so; if it is a vow, say that.
3. **Resale, without F247.** *"the resale is a new sale under the reseller's terms, and it pays Inès her share if those terms honour hers; if they do not, the reseller's published split shows exactly that."* Still true. If the vase was sold through a vow that Inès's agreement claims, F247 now adds: an offer naming that vow, not made under her agreement, is **shown as outside it** to every buyer (rule 15b, client conformance).
4. **An order "is an agreement" and is "done".** *"A buyer accepts the offer and pays. The payment has a receipt; the order has terms."* If the bowl is sold through a vow, the order is **pending** until the buyer confirms receipt, or contested. The study's returns (*"a return is a new agreement reversing the order"*) and disputes can start from a contest, which voids nothing; what is owed back is the terms' (F219).
5. **The courier "paid through the order's split".** As in 12, now: the order's agreement designates one pointer; the split cMIP names service, backups and failure; the courier checks its cut at its own flow address (F248, F250).

### What the decisions would let it say better

- **Made to order, as a vow** (F234: "a commission (a piece of furniture)"). "Inès signs a vow: 'a set of six bowls, glazed to your colour, in six weeks'. The buyer pays the offer naming it; the sale is pending until the buyer confirms." This is the clearest case of selling what does not exist yet, and the study has none.
- **The series, as a vow.** "Twenty vases, numbered, to be fired this winter": sold before they exist; each collector's sale pending, then confirmed on delivery; which number each got is the provenance cMIP's.
- **Handovers feeding the state.** *"Each handover is signed."* The last handover is the act a buyer's claim acknowledges to confirm the sale (rule 32b, "an act about the vow"): the core needs no delivery rule; the buyer's own acknowledgement of the courier's handover is the confirmation.
- **Storefronts and resale, F247.** A storefront selling a claimed vow without Inès's agreement is shown as outside it; *"The referee cannot secretly play"* gains a second mechanism beside the storefront's own identity on its listings.
- **Section 9:** "standing offers, including offers naming a vow, and the state of each sale".

### Unclear for this story

- **Q16-1. Does a bowl in stock name a vow?** Q-G1, for this story. The answer decides whether section 1 can say "the order is pending until the buyer confirms" for every sale, or only for made-to-order work.
- **Q16-2. Can a resale of an object sold through a vow be shown outside the maker's agreement when the reseller opens a new vow instead?** F247 reaches an offer that **names** the claimed vow. A reseller who signs a fresh vow for vase 7/20 escapes it, and the core cannot tell the two are the same object. *Options:* (a) a stated cost, the provenance cMIP's to catch; (b) something more in the core. I read F237 as (a); confirming before the study says "resale pays the maker".

### Note on words

- "A **vow** (the texts' announcement)" for the commission and the series.

---

## 17, From the Stands to the Main League (draft 4)

### What now reads wrong or outdated

1. **Its draft note.** *"the redraft set aside by Nobody, allegedly, until streams were settled (F229 to F232, settled 10 October 2026, night)"* (in `docs/case-studies/README.md`) and the draft 4 note itself. F237, the same night, moved F230 to F232's stream rules out of the core into the live media cMIP and replaced announcements' closing-and-claim rules. The study is aligned with neither.
2. **Media modules, not the live media cMIP.** *"How live video is described and carried (segments, their order, their timing) is defined by media modules for the Envelopes layer, not by the core."* and section 8: *"Live media modules for the Envelopes: how a live stream is cut into segments, ordered, timed and signed"*. There is now a live media cMIP (draft 1, experimental): the stream's opening (a vow, or a first segment), only the opener's segments, the closing act, forks shown, the recording's hash computed. Media Modules remain for the segments' bytes. The open-for-others list should name the cMIP as begun.
3. **"Each feed is a work with its own maker."** *"Each feed is a work with its own maker: camera angles, commentary, statistics."* A live feed is a **stream**, not a work (the terminology note of 10 October: "if I get told off for using work, let's be careful onwards"). Under the live media cMIP, a second camera is its own stream; its recording, once closed, is a work.
4. **The recording "bound to Dario".** *"the recording afterwards is a work, bound to Dario, and published like any other."* Right in outcome; under F237 it must be said how: by **Dario's own work claim on the recording**, dated by itself (rule 15). A claim on the stream's vow covers nothing it became, so nothing is backdated.
5. **Live access, free or paid, "through a standing offer".** *"So live access, free or paid, is offered through a standing offer, and the segments' keys are delivered under it."* Now: the offer **names the stream's vow, with its words** (`[ 3, vow ]`), and each viewer's sale is pending, confirmed or contested. A free viewer who signs onto the offer is a signer too, and may contest (F240, "at any price, including none").
6. **Tickets: "a resale needs the club's signature".** *"Since the club is a party to each ticket, a resale needs the club's signature too; a ticketing service working under the club's grant can sign for it. Scalping becomes visible."* The core does not refuse a resale. A fan's offer naming the match's vow, not under the club's agreement, is a valid act, **shown as outside the claiming agreement** (F247, rule 15b); the vow build's own test keeps "the fan's sale" standing. Caps, numbers and seats are the ticketing cMIP's (F237). "Scalping becomes visible" is right; "needs the club's signature" overclaims.
7. **Section 8's list.** *"a standing offer sells named publications or access, never 'any publication carrying a work'"* now has a third form: a vow.
8. **Tips "through the stream's split".** *"The tips flow through the stream's split: Dario's share, the club's share, and a share for whichever relay..."* As in 08: the stream's agreement designates one pointer; the split cMIP names service, backups, failure; the club checks its 20% at its own flow address (F248, F250). The relay's role share, acknowledged by the viewer's wallet, is unchanged.

### What the decisions would let it say better

- **The match, named before it starts.** "Dario's client signs a vow for Saturday's stream: 'Rovers v. United, from my seat, with commentary'. Its id is the stream's name for good; friends' offers, tips and clips point to it before a single frame exists." (F232, 1, now the live media cMIP's rule 1.)
- **Tickets, as sales of the club's vow.** The club signs a vow for the match; tickets are offers naming it; each fan's ticket is pending until the fan's claim acknowledges the door scanner's act (the vow build's own example), then confirmed; a fan turned away can contest. A stranger cannot.
- **A sponsor or a scalper outside the club's deal** is shown as such (F247). This also gives section 6's *"Piracy becomes partly licensable"* a concrete edge: an unlicensed offer that names the league's match vow is visibly outside the league's agreement.
- **Commentators under grant keys**, already in the text (*"signing commentary with a key the broadcaster granted him: what he publishes that way is the broadcaster's own act"*), is exactly the live media cMIP's rule 2: segments signed with the broadcaster's grant keys add to the broadcaster's own stream. The study can cite it.
- **A stream never closed has no recording** (the cMIP's stated cost): an honest limit worth one line in section 9 (a phone dies mid-match).
- **Rights deals with a chain of judges.** The league's deals have *"conditions, a time reference and a keeper"*; a dispute over a blackout can go to a chain, one active judge per question, each stage with its agreed deadline (F245, F246). Optional.
- **"Leagues see their money"**: each club checks its cut at its own flow address (F250).

### Unclear for this story

- **Q17-1. Whose vow is the match?** The club's ticket vow and Dario's stream vow are different acts. *Options:* (a) two vows, unrelated in the core: the club's for the match (tickets), Dario's for his stream (access), the club's 20% under the live-rights agreement; (b) Dario's stream vow is claimed by an agreement in which the club writes a stake, so F247 shows any offer for it outside that agreement; (c) the live-rights cMIP decides. (b) would let the club see unlicensed sales of Dario's stream; (a) is simpler.
- **Q17-2. What does a subscription sign onto?** *"subscribers get live access under the standing offer, the full match recordings and a vote"*. Q-G2 for this story: one vow per match, each a sale of its own state, or a season vow with one sale per subscriber per month.
- **Q17-3. Is a target a vow?** *"Pledges are held under an agreement with a condition, paid only if the target is reached ... Delivery is on the record. When the equipment arrives, Dario publishes what he bought."* A target sells something to come (better coverage) and is confirmed by delivery: it reads like a vow. F234's list did not name targets. *Options:* (a) a target may be a vow, each pledge a sale, confirmed when the pledger acknowledges the published receipts; (b) targets stay as they are (an agreement with a condition), vows not involved.
- **Q17-4. What does a clip name as its source?** *"A clip names the stream as its source, so when a clip earns, lineage pays Dario, the club and the clipper"*. Clips are cut *"from the recording"*, a work; the stream is a vow's name. Under F237 a claim on the stream's name reaches nothing it became. *Options:* (a) the clip names the recording (a work), lineage as for any work; (b) it may name the stream's vow, the lineage cMIP reading it; (c) both.

### Note on words

- "Dario's client signs a **vow** (the texts' announcement) for the stream"; "the club signs a **vow** for the match". Keep "stream" for the live chain and "work" for the recording.

---

## Not in scope, noticed

- 16 still carries *"[OPEN: F184]"* on the storefront's role share; F184's remaining gap (several referrers on one payment) is the advertising study's, kept for the redraft. Not reviewed here.
- 08's draft note says item 2 *"waits on an open question for Nobody, allegedly (what a purchase of a sole creator's claimed work names)"*. Not reviewed here; F215 (a lone seller's offer is the agreement) may already answer it.
- F239 keeps "tally" for vote counts; none of the five studies uses "tally".
