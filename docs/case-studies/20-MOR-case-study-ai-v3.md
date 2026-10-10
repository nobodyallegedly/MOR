# MOR Case Study: From Agents to Open Intelligence

*Case study, draft 3, 10 October 2026. Draft 2 aligned with the current core by the project lead, at the request of Nobody, allegedly ("Do a quick technical pass first to align it to current core"), before his own redraft; nothing else changed: francs become US dollars; an agent signing with a grant key signs as its grantor, so the jobs and ratings are on Lena's record (Law, grant keys, F128, F129); nothing is deleted, so a provider's false work stays on its record; contributors to a model not yet made hold stakes in the collective that owns it (a stake names an existing work); section 16 no longer says "nothing new": the formats of standing offers, work claims and split plans are open (step 12b), and services are paid under F194. Checked and unchanged: grants and their revocation by everyday acts, route disclosure (Finance rules 5 to 8), executable rules, keepers, the compute lenders' new version of Tarek's deal, sources paid as purchases under their offers. Draft 2's note follows.*

*Case study, draft 2, 9 October 2026. Draft 1 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 5 and 7, nothing else changed; item 6 was optional and item 8 needed no change. The rest is unchanged, for the author's own passes and the redraft. Draft 1's notes follow.*

*Case study, draft 1, 27 September 2026. What MOR could be, with your help.*

*Note, 6 October 2026: this draft predates the current core (Identity draft 11, Finance draft 6, Law draft 10) and the review rounds that changed it. Some rules it describes have since changed. It is to be redrafted (roadmap, 9 October 2026).*

## Why this case study

Artificial intelligence is being built by a handful of companies, from data taken with little asking, on computing power few can afford. Writers, artists and news organisations have taken AI companies to court over training data, and some cases have ended in large settlements. Meanwhile AI agents, software that acts on someone's behalf, are starting to shop, book, pay and hire, with no shared rules for who they are, what they may do, or who answers for them.

This case study has two parts.

**Part one shows how today's agents plug into MOR** without changing anything about them: an agent becomes an identity with limits, reads terms it can check, pays, earns, hires other agents, and every act it signs is attributable.

**Part two goes further.** MOR can coordinate the making of AI itself: data given on stated terms, computing power sold by anyone, models trained by collectives whose contributors hold stakes, and every answer a model gives paying back down the line to those who made it possible.

## Part one: agents plug in

### 1. A connector, not a rebuild

**Lena uses an AI assistant.** Like most assistants today, it connects to outside tools through standard connectors, the most widely adopted being the Model Context Protocol. A MOR connector exposes MOR's actions to any agent that speaks it: read offers, pay, sign, publish, rate.

**Nothing about the assistant changes.** It does not need to be rebuilt for MOR. It gains a set of tools, and the rules that govern their use.

### 2. An agent is an identity under a grant

**Lena gives her assistant an identity of its own,** and a grant from her identity, as the label gives its managers in the music case study. The grant sets what the agent may do:

- which kinds of acts it may sign (buy, sell, book, publish);
- how much it may spend, per act and per month;
- for how long the grant lasts.

**The agent holds a key of Lena's, limited to the grant.** The agent makes and holds that key, and what it signs with it is Lena's own act. Lena can revoke the grant at any moment with an everyday act. The grant's limits are checked by the grant-limits cMIP; the vault in the Finance MIP protects what Lena receives, not what the agent spends.

**Every act is attributable.** Anything the agent signs is Lena's act, signed with the key the grant gave the agent, and the grant names the agent. If it makes a mistake, the record shows what it did, when, and on whose authority.

### 3. Signing what it sees

**Terms are machine-readable.** Standing offers, agreements and splits on MOR are structured data, not prose buried in a web page. An agent reads them exactly.

**Rules are executable.** Where an agreement uses a rule (a split, a condition, a price formula), the rule is code with a fixed result, as the Production MIP defines. The agent runs it before signing and knows exactly what it is agreeing to. For humans, "signing what you see" means a client shows what a rule computes; for agents, it means running the rule itself.

**Above its limits, the agent asks.** When an act exceeds the grant, the agent prepares it and asks Lena to sign, showing her the computed result in plain language.

### 4. The agent buys

**Lena asks for a birthday present** for her nephew under $60. The agent reads standing offers from makers across the open catalogue of the commerce case study, compares their terms, prices, ratings and delivery chains, and buys within its limit. The receipt comes back to Lena.

**Advertising meets its match.** An agent choosing on behalf of its user is the on-device targeting of the advertising case study taken to its end: it reads offers and ignores the noise. Brands that want to reach it must publish clear terms.

### 5. The agent earns

**Lena is a translator,** and her agent sells first-draft translations under her identity's grant. Each job is an agreement, a settlement and a rating, as in the gig economy case study. The agent signs as Lena, with the key her grant gave it, so the jobs and their ratings are on Lena's record; the grant names the agent, so anyone can see which of them her agent did.

**Must an agent say it is an agent?** This is a question for an **agent disclosure cMIP**, for example:

- **always disclosed:** every act signed by an agent names it as one;
- **disclosed on request:** a counterparty may ask, and a false answer is a signed lie;
- **disclosed by the grant:** the grant itself is public, so anyone can see the identity is an agent's.

### 6. Agents hire agents

**Lena's agent needs a proofreader** for a technical text. It hires another agent that specialises in medical terminology, under its own grant, within its own budget. That agent in turn buys a terminology lookup from a third.

**Each hop is a receipt.** The chain is visible, as payment routes are in the Finance MIP: who hired whom, for how much, under which grant. When something goes wrong, the signed chain shows where.

**Who answers for a failure is a question for an agent liability cMIP**, for example: the agent the grant names, the human or company whose grant it acted under, or insurance named in each agreement.

### 7. A company's fleet

**A logistics company runs hundreds of agents** handling bookings, invoices and customer requests. Each works under a grant from the company, like an employee under a mandate, with limits set by role. Keepers record the company's significant agreements, sealed. The company's accountants read one signed record of everything its agents did.

**This is where part one ends:** agents as customers, sellers and employees of an economy with rules they can read and a record they cannot fake. That alone would be worth building.

It is not the end.

## Part two: MOR makes AI

Everything in part one treats AI as something that uses MOR. Part two asks what happens when MOR coordinates the making of AI itself.

### 8. Data, given on stated terms

**Large AI models barely speak most of the world's languages,** because little text or speech exists in them online. Nora teaches a minority language spoken in a few valleys. With her community, she records elderly speakers telling stories, explaining crafts and naming places.

**Every recording is a work** with its speaker's consent, signed for each use, as performers sign in the adult content case study. The community forms a collective that holds the dataset.

**The dataset states its terms before anyone trains.** Its standing offer says whether and how it may be used for training. **A training-terms cMIP is needed**, for example:

- **free:** anyone may train on it;
- **free for the community, paid for commercial use;**
- **paid per model trained, plus a share of what the model earns;**
- **not for training at all.**

The community chooses the second. Today, those terms would be argued in court after the fact; on MOR, they are stated first.

### 9. A small model

**A local developer, Tarek, fine-tunes a small open model** on the dataset so the community has an assistant that speaks its language. His model is a work whose claim names its lineage: the open base model it started from and Nora's dataset.

**He borrows computing power.** A few hobbyists with powerful graphics cards and a university lab lend him compute, each in exchange for a small stake in the resulting model, written into Tarek's agreement by a new version of it once the model exists, like the session musicians in the music case study who choose a stake over a fee.

**When the model earns, lineage pays.** Schools in the valleys pay a small subscription for the assistant. The split pays Tarek, the compute lenders' stakes, the dataset's share to the community, and a share to the base model's makers if their terms ask for one. The dataset's and the base model's shares are paid if Tarek's agreement honours their offers; if it does not, its published split shows exactly that.

### 10. A market for compute

**Anyone with processors can sell compute,** from a gamer's spare graphics card to a small data centre. Each provider is an identity with a standing offer, ratings, and signed attestations of its hardware. Buyers pay per hour of computation, with receipts.

**Proving the work was done is the hard part.** A provider paid to train or run a model could return rubbish and claim it computed. **A compute verification cMIP is needed**, for example:

- **redundancy:** the same piece of work is sent to several providers, and results must match;
- **spot checks:** a verifier recomputes a random sample of each provider's work;
- **proofs of training:** an active area of research, where the provider supplies evidence that the computation was really performed.

A provider caught returning false work keeps that on its record, permanently, under its own identity: nothing is deleted, and every later buyer can see it.

### 11. A training collective

**Nora's community, Tarek, dozens of compute providers and a group of independent researchers decide to train an open model from scratch,** one that speaks the valleys' language and several neighbouring minority languages, whose communities join with their own datasets.

**The training run is an agreement.** The parties form a collective with a founding agreement, as a band does, setting:

- **stakes** for every contributor: data communities, compute providers, researchers, in millionths;
- **milestones** on a named time reference: data prepared, training checkpoints, evaluations, release;
- **a target** to fund what contributions do not cover, computed from receipts;
- **a keeper** recording the run as it happens, sealed;
- **the release terms** of the finished model: open weights, weights for approved uses only, or access only through services.

**Distributed training across the internet has been demonstrated** in recent years, with models trained on machines spread across continents. Some projects coordinate it with tokens whose value depends on speculation. On MOR, contributors hold stakes in the collective that owns the model (the model does not exist yet when they join, and a stake names an existing work), and the model earns only when people pay to use it.

**Checkpoints are works.** Each saved stage of training is a work naming the previous one, so the model's history can be followed, and anyone can build on an earlier checkpoint with lineage intact.

### 12. Evaluated and tested

**Before release, independent evaluators test the model** for quality, bias and safety, and sign their findings, as verifiers sign checks in the journalism case study. They are paid through the collective's split, not by whether the results flatter the model.

**Evaluators have track records.** Their Trust Scores, as in the education case study, grow when their findings hold up in real use, and shrink when they missed what later became obvious.

**Release follows the findings.** The collective's release terms can depend on evaluations: if safety testers find serious risks, the agreement can require a more restricted release. The findings and the decision are both on the record.

### 13. Every answer pays back

**Inference providers serve the model,** open and closed models alike, as services with standing offers: a price per request, uptime commitments, ratings.

**Users pay per use, and the payment flows down the line.** When a school, a translator's agent or a company pays for an answer, the settlement pays the provider, then the model's collective, whose split pays the data communities, the compute providers who trained it, the researchers and the evaluators, and then upstream along the model's lineage, where each paying agreement honours it, visibly.

**Sources are paid at the moment of use.** When a model answers by retrieving a source, a news article, a photograph, a dataset entry, the retrieval is a use under that source's standing offer, and the settlement pays it, as the journalism case study foresaw. Some web infrastructure companies already let sites charge AI crawlers per visit; on MOR, payment follows each actual use.

**The loop closes.** The customers of these models are the agents of part one. Lena's agent, asking a question in a minority language, pays a fraction that reaches the elderly speakers who recorded their stories in the valleys.

### 14. What large AI labs keep

- **Their frontier models, closed if they choose.** A lab can serve its models on MOR as services with visible terms and prices, without releasing anything.
- **Their scale.** The largest training runs need tightly connected clusters that a distributed network cannot yet match. Labs keep that advantage.
- **Clean data.** A lab that licenses data on stated terms, with consent and lineage, trains without inviting lawsuits, and can show it.
- **Access to what they cannot build.** A lab can license community datasets, rent the network's compute when it needs more, and hire its evaluators.
- **Their evaluations become credible.** Published, signed, and comparable with independent ones.

## 15. The network behind it

- **Agents and those who grant them:** buying, selling, hiring, within limits.
- **Data communities and creators:** licensing data on their own terms.
- **Compute providers:** selling computation, verified and rated.
- **Researchers and training collectives:** building models with stakes for every contributor.
- **Evaluators and safety testers:** paid to judge, with track records.
- **Inference providers:** serving models as services.
- **Sources:** paid at the moment of use.
- **Developers:** building connectors, verification, training coordination and inference tools.

## 16. What MOR provides, and what it needs

**From the core.** Identities, grants with limits and their keys, flow and vault, executable rules, agreements, collectives, stakes, keepers and time references, signed attestations, receipts and route disclosure are defined; how a grant's limits are checked is a cMIP's task, and lineage and targets are built from these core pieces. The exact formats of standing offers, work claims and split plans are still being written (roadmap step 12b), and this case study relies on all three. Who is paid for a service follows the core's rule since 10 October 2026: a service chosen in advance is a named share, one chosen at payment is acknowledged by the payer, and none is paid on its own record alone.

**Open for others to build (cMIPs and Modules):**

- **A MOR connector** for existing agent frameworks.
- **Agent grant cMIPs:** limits, approval thresholds, revocation.
- **Agent disclosure and liability cMIPs.**
- **Training-terms cMIPs** for datasets and works.
- **Speaker and contributor consent cMIPs** for data.
- **Compute market cMIPs** and **compute verification modules.**
- **Training collective toolkits:** stakes, milestones, checkpoints, release terms.
- **Evaluation cMIPs:** what an evaluation names and signs.
- **Inference service cMIPs:** pricing per request, lineage payouts.
- **Retrieval payment modules:** paying sources at the moment of use.

## 17. Honest limits

- **Verifying computation is not solved.** Redundancy and spot checks cost extra; proofs of training are still research.
- **Distributed training trails the frontier.** Networks of scattered machines are slower than one giant cluster. Open collectives may lag the largest labs for a long time.
- **Open models can be misused.** Releasing powerful models openly carries real risks. MOR makes release decisions and safety findings visible; it does not make them safe.
- **Agents make mistakes.** Grants limit the damage; they do not prevent the error.
- **Attribution inside a model is approximate.** Paying data contributors by share of a model's income is a convention; nobody can say exactly which recording shaped which answer.
- **Deep lineage dilutes.** A model built on many datasets pays each very little.
- **Law is moving fast:** on training data, AI liability and agent disclosure, and it differs by country.
- **Energy and hardware are physical.** No protocol makes computation cheaper to power.

## 18. What it demonstrates

Today's agents can plug into MOR as they are, and gain an identity with limits, terms they can check, and a record nobody can fake. That is the easy part. The same rules that let a band share a song let a valley share its language, let a gamer sell spare computing power, let a collective train a model in which every contributor holds a stake, and let every answer a model gives pay back to the people whose words it learned from. AI does not have to be made by a few from what they take. It can be made by many, on terms they set, with every contribution named, weighted and paid.
