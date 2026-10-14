# The shapes of collectives, mapped against the core

*Draft 1, 14 October 2026, for Nobody, allegedly (F306). Four shapes people use to own and run things together (a band, a cooperative, a company, an investor-backed venture), each sketched as a cMIP above Agreements MIR draft 13, and the common language the four need the core to speak. Written against Agreements draft 13, Money draft 7, the findings log to F306 (above all F270 to F285, F103, F109, F127) and Fable's Agreements review (A10, A11, its Q7 and Q8). **Sketches and analysis only: no MIR, MICS, freeze suite or code is changed.** Where the sketches point to a core change, it is put at the end as a question, one at a time, in the order to decide them. The Company cMIP sketch in the log ("Open, not decided: owners without a voice") is the first of these maps; sketch 3 extends it.*

## In plain words first

MOR already keeps two things apart that many legal forms bundle: **owning** (a stake: a share of what something earns) and **running** (being a member with a say, holding an area, or acting under a grant). A band, a cooperative, a company and a venture differ mostly in how they tie those two together, and in what protects an owner who does not run anything.

Here is what the four maps found.

- **A band and a small cooperative fit the core almost as it stands.** Their owners and their operators are the same people, so nobody is an owner without a voice. Where they strain, there are ways around it today: a band keeps a departed member in what they made by giving each record or tour its own agreement; a cooperative pays back a leaver's buy-in as an ordinary debt instead of giving them a share of income forever.
- **A company, and a venture with passive investors, do not fit.** Today the only protection an owner without a voice has is a **personal veto**: their own signature on every change that pays them less (F270, F282), and on every new share issued, since issuing one lowers everyone else's share (rule 8). With a hundred passive owners, every new fee, every change to how much is kept for the business, and every new share needs a hundred signatures. That is the finding of the Company sketch, confirmed and widened here: it also blocks issuing shares, keeping money in the business, and selling the works.
- **The four shapes need the core to say only a few more things, and one of them already exists in small.** The smallest common language is:
  1. **A holders' rule:** for each stake, how its holders consent *together*. "Every holder" stays the default (today's personal signature); an agreement may choose instead "holders together holding at least this share of the stake". It reaches only changes that treat every holder of the stake alike. The core already has exactly this shape for one matter: the release rule (terms field 24), which says which holders of a stake must sign its release to the public domain.
  2. **Issuance as a named change:** new holders added to a stake, every existing holder's share shrinking in the same proportion, decided by the holders' rule, with each existing holder first offered its own proportion on the same terms (a pre-emptive right) unless every holder waived it.
  3. **Owners' matters, named:** the things the holders' rule (or, by default, each voiceless holder) must consent to: what a stake is paid (F270, F274), issuance, a collective's sale or release of what its income comes from (Fable's A11), and the terms a fork's successors give the holders they must keep (A10).
- **Everything else the shapes ask for is a cMIP's**, or a cost to state: liquidation preferences, vesting, forced sales, share classes, restrictions on who may buy.
- **The guarantees not in question all hold** under that language: the way out (selling, succession, forks, leaving), "shared ownership means shared fruits" (F280), the voiceless never treated worse than members (rule 68), nothing updated.

What it costs, said plainly: an owner without a voice could be paid less **without signing**, if owners holding enough of the stake agreed and the change hit every holder alike. Their protection becomes the company kind (equal treatment, a proportional say, a right to keep their proportion, and the exit) instead of the partnership kind (a personal veto). That reopens F279's sentence "No advance permission reaches what a stake is paid", and it is the author's call.

One flaw found on the way, named plainly (side finding, below): the release rule's threshold is counted **by head** among a stake's holders, and anyone can split their share among identities they control, so a threshold by head can be manufactured.

## How to read this

Each sketch has the same three parts.

1. **How the shape works in the world**, in plain words: who owns, who decides, how people join and leave, how new owners come in (issuance), how money flows (costs, dividends, reinvestment), what protects a minority or a passive owner, how it ends. Real practice, not one country's law; where practice differs, it says so, and where it is uncertain, it says that too.
2. **Against the core**: for each of those, a table: what the core offers today, what a cMIP can do above it, and where the core blocks it, with the rule quoted.
3. **What the cMIP would need from the core**, as the smallest addition.

Then the synthesis tests each candidate for the common language: which shapes need it, what it replaces or reopens among F270 to F285, what it costs, and whether it passes the admission test (*is it part of the shared language every act is written in, or a guarantee no module may break?*). The questions come last.

Rules are cited by their draft 13 numbers. "Voiceless holder" means a holder of a stake who has no voice in the power making a change: in a collective, every holder who is no member (F282: departed holders, stake successors, buyers); in a deal, a holder who is no party.

## What the core offers every shape today

The toolbox, in one place, so the sketches can point to it.

| Tool | What it is | Where |
| --- | --- | --- |
| Stake | A share in a work, a publication, a vow, or the collective itself (a share of all its income), in millionths summing to the whole. Its holders are whoever the transfer chain names. | Rules 7 to 10, field 7, F121 Q8, F284 |
| Split plan and fees | Money in is divided: overhead off the top (fees, named receivers, roles, metrics), the rest to the stakes by their parts, and within a stake by its holders' shares. | Rules 16 to 32, F280 |
| Transfer | A holder sells or gives part of a stake; "other holders are notified, not asked". | Rule 10 |
| Members and the constitution | A collective's parties decide by its change rules: the constitutional change rule (field 18, every party by default), the clone rule, the judicial tier (every member). | Rules 62 to 67 |
| Areas and grants | Members hold areas of the business and may hire within them by grant, a scoped key, "authority without a stake". | Rules 60, 73 to 80 |
| Departed holders | A member who leaves keeps their stake, loses every say, and is treated exactly like a member of the same size. | Rules 68, 70 |
| The personal signature | No stake reduced without its holder (rule 8, rule 48); nothing paying a voiceless holder less without its signature (F270, F274, F282). | Rules 45, 48 |
| Succession and abandonment | A stake passes to the successor a holder named; abandonment moves a stake only by succession (F279). | Rules 81 to 89 |
| Nesting | Any agreement can be a party to another, paid at the one pointer it designates; responsibility ends there. | Rule 15, F254, F256 |
| Debts | An obligation is visible until paid or released by its creditor. | Money rules 15 to 17; rule 92 |
| Endings | A collective ends by a group leaving, a fork, active abandonment, or a closing once it holds and owes nothing. A deal ends by a clone every party signs. | Rules 91, 47 |
| The release rule | Which holders of a stake must sign its release to the public domain: every holder by default, set at founding, changed only by every owner. | Field 24, rule 55, N8 |

---

## Sketch 1: a band

### 1.1 How a band works in the world

*Practice varies widely, and many bands never write anything down. Where nothing is written, general partnership law usually fills the gap in many countries (equal shares, unanimity for fundamental changes); details differ by country and are not relied on here.*

- **Who owns.** Usually two layers, kept apart: the **songs** (the compositions, owned by whoever wrote them, often in agreed percentages per song) and the **band's own income** (recordings, live shows, merchandise, the name), often split equally among the members of the moment. Recordings are frequently owned or licensed by a label, the band holding a royalty.
- **Who decides.** The members, often by unanimity on big matters (signing a label, the name, admitting a member) and by majority or by a manager on day-to-day matters. Owners and operators are the same people.
- **Joining.** A new player often starts as a paid musician, and becomes a member later, by everyone's agreement.
- **Leaving.** The common pattern, in written band agreements and in record contracts' "leaving member" clauses: a leaver **keeps their share of income from what was made while they were in** (songs, records), and **has no share of what comes after** (new records, future tours). The name usually stays with the band, or with whoever the agreement says. A leaver is sometimes bought out instead.
- **New owners (issuance).** Rare. A new member gets a share of future income, not of the old catalogue.
- **Money.** Gross income pays costs first (crew, manager, label recoupment), then the members. Reinvestment is mostly informal.
- **Minority protection.** Unanimity on big matters, and the fact that a band is small enough to talk.
- **Ending.** The band splits up; the catalogue keeps earning and keeps paying those who made it; the name is fought over or retired.

### 1.2 A band against the core

| Matter | The core today | A band cMIP above it | Where the core blocks |
| --- | --- | --- | --- |
| Songs, owned per song by their writers | A work claim per song, a deal per song among its writers with their shares (rules 7, 47). | Nothing to add. | Nowhere. |
| The band's own income, split among members | A collective whose members are the band; a stake in itself among them (field 7, null). | Equal shares, an area for bookings, grants to a manager. | Nowhere, while the line-up stays. |
| A leaver keeps what they made, not what comes after | Rule 68: a departed holder's stake "is a share of all the collective's income, not only of what was made while it was a member." | **Per-project agreements:** each record, each tour, its own deal (or a collective's sub-agreement) among those who made it, the band collective a party where it should earn (rule 15, F254). A leaver stays in the old projects' deals and is in none of the new ones. The band collective itself writes no stake in itself, or a small one. | Not blocked, but only this way. Inside **one** agreement holding many works' stakes, adding a new work's stake changes the plan's weights, which F274 counts as paying every existing stake less ("another share added or raised"; "the split cMIP or its parameters changed"), so every departed holder would sign each new record. |
| Buyout of a leaver | A transfer the leaver signs (rule 10). | The cMIP shows the agreed price. | An **agreed-in-advance** buyout (the leaver must sell at a formula price) is an advance permission moving a stake without its holder: rule 48, "the only advance permissions that move a stake without its holder are rule 89's". The leaver must sign at the time. |
| Admitting a member | Constitutional clone and rotation (rule 69); the new member signs (Q11). | With per-project deals, the new member joins new projects only. | With a stake in itself, the newcomer's share lowers every existing holder's share: every holder signs, a departed one included (rule 8: "Any act that changes the size of a stake requires its holder's signature"; rule 45). |
| The name | The collective is an identity; its name is its own (Identity). | Nothing. | Nowhere. Who may *use* a name outside MOR is not the core's. |
| Costs before members | Overhead off the top (fees, named receivers), the rest to the stakes (F280). | A recoupment cMIP for a label's advance (F284, Q3). | Nowhere. |
| Splitting up | Shape A (a group leaves), B (a fork), C (actively abandoned), D (closing) (rule 91). | Per-project deals keep paying their makers whatever the collective does. | Nowhere. |

### 1.3 What a band needs from the core

**Nothing, if it is built as per-project agreements.** That is also how bands already think: "who played on it" decides who is paid by it. The core's own segmenting ("The idea of the network is to segment everything so that the point of failure or cheating is easily found", F256) points the same way.

Two things are worth the author's eye, neither a question yet:

- *F274 makes one agreement holding a growing catalogue rigid once anyone has left:* every new work's stake needs every departed holder's signature. A band or a label that keeps its catalogue in one agreement will meet it. The way out exists (one agreement per project); clients and the deal tool should say so before founding.
- *An advance buyout clause cannot bind the leaver* (rule 48, F279). A band that wants one writes it as a promise in words; the leaver signs the transfer at the time, or keeps their stake. That is a stated cost of F279, and probably the right one.

---

## Sketch 2: a cooperative

### 2.1 How a cooperative works in the world

*The International Co-operative Alliance's seven principles (1995) are the common reference; laws differ widely (worker, consumer, producer, housing and multi-stakeholder cooperatives; Italy's, France's, Spain's, the UK's and the US's rules all differ in detail).*

- **Who owns.** The members, each usually holding one or a few member shares, often at a fixed nominal price. Capital is a tool, not the measure of ownership.
- **Who decides.** Members, **one member one vote** in a primary cooperative, whatever capital they hold. Large cooperatives elect a board, which hires managers.
- **Joining.** Open and voluntary: a newcomer who meets the conditions buys a member share and is admitted.
- **Leaving.** The member leaves, and their member share is usually **paid back at its nominal value** (sometimes after a delay, sometimes with limited interest). A leaver takes no share of future surplus.
- **New owners (issuance).** Admission is issuance: every new member adds a member share. Nobody's vote is diluted beyond one in the number of members.
- **Money.** Surplus goes, by the members' decision, to: reserves (in many countries partly **indivisible**, never paid out to members), limited interest on capital, and **patronage refunds**: back to members in proportion to how much they used the cooperative (bought, sold, worked), not to how much capital they hold.
- **Minority protection.** Equal votes, open books, and in many laws an **asset lock**: on dissolution, what is left after debts goes to another cooperative or a public purpose, not to the last members.
- **Ending.** Rare; often by merger with another cooperative. Where an asset lock applies, members do not share the reserves.

### 2.2 A cooperative against the core

Two variants, because the core treats them very differently: a **small cooperative** whose every member is a party of the collective (a worker cooperative of a dozen), and a **large one** whose members are many and mostly passive (a consumer cooperative of thousands).

| Matter | The core today | A cooperative cMIP above it | Where the core blocks |
| --- | --- | --- | --- |
| One member one vote (small) | Members are parties; the constitutional change rule counts parties, one each (rules 64, 65). | Areas for the board's work, grants to managers. | Nowhere. |
| One member one vote (large) | Every member a party means: admitting each one is a constitutional clone and a rotation of the collective's keys (rule 69: "Changing members means a rotation to new keys plus a clone"); every act sealed to every member (rule 57); every member with constitutional power covered by the abandonment clause (rule 61). | A voting cMIP among members who are not parties (a budget vote is already "cMIP business", F284). | **Not blocked, but the core's protections do not reach a vote held outside it.** A cMIP's vote binds the collective only through acts of its members. See Q4. |
| Member capital, paid back at par on leaving | An **obligation** (Money type 1) the collective signs to the member at admission: "your buy-in, owed back when you leave". Visible until paid (Money rule 15). | The cMIP writes the obligation and shows it. | Nowhere, **if the cooperative writes no stake in itself.** A cooperative that gives members a stake in its own income meets rule 70: a leaver "keeps its stake", a share of all future income, for good, unless it signs a transfer. |
| Surplus by patronage, not by capital | Two ways: (a) a metric share off the top, divided by use (F280, F283: "a measured division is a service's envelope, its pool paid off the top"); (b) no stake in itself: the surplus stays with the collective and is paid out by its Money lane as members decide. | The patronage calculation; the yearly decision. | Nowhere. Under (b), equal treatment among members is visible (every act sealed to every member) but **not checked**: the core reads it as the collective paying people. |
| Indivisible reserves | Money the collective keeps (variant b). | The cMIP states the reserve. | Not blocked; **not protected either**. The core has no rule keeping money from members. |
| Asset lock on dissolution | A closing needs the collective to hold and owe nothing (rule 91, D). | The cMIP pays the residue to the named cooperative before closing. | **No core rule can hold the last members to it.** The lock is a promise in words, visible, unenforced. Stated cost. |
| Admission as issuance (large, with member shares as stakes) | A newcomer's stake lowers every holder's share: every holder signs (rule 8, rule 45). | — | Blocked at scale, the same block as the company's (sketch 3). |
| Non-transferable member shares | Transfers are free: "other holders are notified, not asked" (rule 10). | Member shares kept outside field 7 (variant b), so there is nothing to sell. | If member shares are stakes, anyone may buy them. A buyer gets income, no vote: oddly, exactly the "transferable interest" that partnership and LLC laws give a buyer in many US states, which carries economic rights and no management rights. |

### 2.3 What a cooperative needs from the core

- **A small cooperative needs nothing new.** Members as parties, the constitutional change rule as one member one vote, member capital as debts owed back, surplus kept by the collective and paid by patronage. The core's protections are its members' votes and "information runs free"; the asset lock is a stated cost.
- **A large cooperative needs what the company needs** if its members are to be owners in the core's sense (a holders' rule, issuance), with one twist that matters: a cooperative counts **by head**, and a holders' rule counted by head among the holders of a freely transferable stake can be gamed (split a share among identities one controls; see the side finding). So one member one vote belongs with **membership** (parties, admitted one by one), never with stake holding. A large cooperative on MOR either admits its members as parties, at the cost of a rotation per admission, or holds its member vote in a cMIP and states that the core does not protect it. That second path is Q4's territory.

---

## Sketch 3: a company with passive and tradable owners

*This extends the Company cMIP sketch in the findings log ("Open, not decided: owners without a voice, and a Company cMIP"), whose finding stands: "under F282 every buyer of part of a stake holds a personal veto over every change to the plan, so a company with many passive owners cannot exist on MOR today."*

### 3.1 How a company works in the world

*Company law differs by country, and between private and public companies; what follows is the common pattern, with the main differences named.*

- **Who owns.** Shareholders, in proportion to shares. Shares are usually **transferable**: freely in a listed company; in a private one, often restricted (a right of first refusal, the board's approval).
- **Who decides.** Two levels, kept apart: the **board** (and the officers it appoints) runs the business; the **shareholders**, voting **by share**, decide owner-level matters. Which matters are owner-level differs, but nearly everywhere they include: electing and removing directors, changing the charter, mergers, selling all or substantially all the assets, dissolving, and, in much of Europe, issuing new shares.
- **Joining and leaving.** Owners join by buying shares and leave by selling them; nobody's permission is needed in a listed company. Directors join and leave by the shareholders' election.
- **New owners (issuance).** New shares dilute every existing holder alike. Who may decide it differs: in the UK and the EU, directors need the shareholders' authority to allot, and existing holders have a **pre-emptive right** (to take their proportion of new shares issued for cash) unless the shareholders vote to waive it by a large majority; in Delaware, the board issues within the charter's authorised shares, and there is no pre-emptive right unless the charter grants one.
- **Money.** Costs first; then profit is either **kept** in the business or **paid out as dividends**, pro rata. In the US the board declares dividends; in the UK's model articles and in much of continental Europe, the owners approve a dividend the board proposes, and cannot raise it above the proposal. Reinvestment is the default.
- **Minority and passive owners' protection.** Not a veto. Instead: **equal treatment** of shares of the same class; **pre-emptive rights** where the law or charter gives them; **directors' duties** of loyalty and care, enforced by courts; **class consent** for changes that hurt one class of shares; **appraisal or fair-value rights** in some mergers; remedies for oppression or "unfair prejudice"; and the **exit**: selling.
- **Ending.** Creditors are paid first, then what is left is shared among shareholders by share (preferences aside, see sketch 4). A merger or an asset sale needs the shareholders' vote.

### 3.2 A company against the core

The mapping: **shareholders** are holders of the collective's stake in itself (field 7, object null); the **board and officers** are the collective's members, its areas and its grantees; a **buyer** of shares is a holder by transfer (rule 10).

| Matter | The core today | A Company cMIP above it | Where the core blocks |
| --- | --- | --- | --- |
| Shares, tradable | A stake in the collective itself; transfers free (rule 10). | A register view, a market. | Nowhere. |
| A board running the business | Members, areas, grants (rules 60, 73). | Board procedures. | Nowhere. |
| Costs and fees | Fees and overhead off the top (rule 28, F280). | — | **Blocked at scale.** "A version that lowers a stake's part of the split plan (field 8), or adds or raises a fee the stake bears (field 28), needs the signature of every holder of that stake it pays less who has no voice in the power making that change … a holder who bought part of a stake (rule 10)" (rule 48, F270, F282). With a thousand passive owners, a thousand signatures for every fee. |
| Keeping money in the business (reinvestment) | Money reaching a stake is divided among its holders at each payment ("The stakes decide every holder's money", rule 68). To keep some, the plan names an off-the-top receiver for it. | The cMIP chooses the retention each year. | **Blocked at scale**, twice. Changing how much is kept is changing the plan: every voiceless holder signs (F274). And who the off-the-top receiver for the collective's own kept money may be is not written (see Q5): a stake in itself held by the collective is invalid (field 7). |
| Dividends declared by a decision | Not a concept: payment through the stake is automatic and per payment. | A Company cMIP could write **no stake in itself**, keep its income, keep the share register in its own acts (an xtype, F278) and pay dividends as ordinary payments. | Not blocked, but then **the core protects no shareholder at all**: equal treatment, F270 and rule 68 reach only stakes. The cMIP's register is not a stake. |
| Issuing new shares | A clone that adds a holder lowers every existing share. | — | **Blocked at scale**: rule 8, "Any act that changes the size of a stake requires its holder's signature", and rule 45, "every holder whose share of a stake it drops or lowers has one too, member or not". Every shareholder signs every issuance, members included. F274 lists it too ("another share added"). |
| A shareholders' vote by share | No power in the core is counted by share; every power is counted among parties, one each (rule 65). | A vote in the cMIP. | **The vote binds nothing in the core.** What it decides still needs each voiceless holder's signature. |
| Shareholders electing the board | Members change by a constitutional clone under the parties' own rule, and a rotation of the keys (rule 69). | — | **No way for holders who are not parties to choose the parties.** See Q4. |
| Selling the business's works | The collective transfers or releases its stakes in works by its own rules (rules 10, 55). | — | **Not blocked, and not protected:** Fable's A11. The holders own the collective's *income*, not its works; a sale for a token price to the members' own new collective leaves them "25% of nothing", unsigned. Release text: "a business decision of the collective, like setting a price to zero, which departed holders, passive, accept". |
| Mergers | No merger act. A merger is built of acts the core has: one collective issues stake to another (or to its holders) and the other transfers its works. | The cMIP batches them. | Blocked where issuance is (above); unprotected where the sale is (A11). |
| Equal treatment | Built in: every payout matches its stake exactly, every fee alike (rule 68, N10). | — | Nowhere: this is the core's strongest company-law protection already. |
| Self-dealing by the board | A fee to a service the members own is public; the collective's client must disclose ownership (rule 68, F140, client conformance). | Disclosure screens. | Not blockable: the core has no court. Stated cost. |
| Restricting transfers (private company) | Rule 10's transfer is "by default", but no field sets another way. | A promise in words; a right of first refusal as an offer the cMIP shows. | **Cannot bind:** a holder may sell to anyone. Stated cost, and arguably right (the way out). |
| Dissolution | Closing once the collective holds and owes nothing; works sold or released first (rule 91, D). | — | Owes-nothing is checked (creditors first, as in law); the sales before it are A11's gap. |

### 3.3 What a Company cMIP needs from the core

Three things, and nothing else:

1. **A collective way of consenting for holders without a voice**, counted **by share**, accepted by those it binds: by signing a version that carries it (a member who later leaves, a successor) or by completing a transfer under such a version (a buyer). It replaces the personal signature only for changes that treat every holder of the stake alike.
2. **Issuance** decided that way, with the existing holders' **pre-emptive right** as its guard.
3. **The owners' matters named**, so that a sale or release of what the income comes from (A11), and a fork's successors' terms (A10), are among the things owners consent to.

Optionally, a fourth (Q4): owners choosing operators. And one reading (Q5): where money a collective keeps for itself sits.

---

## Sketch 4: an investor-backed venture

### 4.1 How an investor-backed venture works in the world

*Venture terms below follow common US practice, where the National Venture Capital Association's model documents are widely used; Europe's are similar in kind, with local differences. Terms vary by round and by market cycle; "usual" here means common, not universal.*

- **Who owns.** Founders, employees (through options), and investors. Investors usually hold **preferred** shares, a separate class; founders and employees hold common shares.
- **Who decides.** The board, on which investors usually take seats; shareholders on owner-level matters; and, on a listed set of matters, **the investors as a class**.
- **Joining (issuance).** Each round is an issuance: new preferred shares sold to investors for cash, every earlier holder diluted. Employees join through an **option pool**: promises to issue shares later at a fixed price.
- **The terms investors usually ask:**
  - **Liquidation preference:** on a sale or dissolution, investors get their money back (commonly once, "1x", and then either convert to common or share in the rest) before common holders get anything.
  - **Pro-rata (pre-emptive) rights:** to keep their proportion in later rounds.
  - **Anti-dilution:** if a later round is priced lower, their conversion price is adjusted, which gives them more shares and dilutes common holders further.
  - **Protective provisions:** a class veto over listed matters (new senior shares, selling the company, changing the charter, paying dividends, taking on debt beyond a limit).
  - **Board seats and information rights.**
  - **Founder vesting:** founders' shares are earned over time (four years, with a one-year cliff, is common); a founder who leaves early loses the unvested part (the company buys it back at cost).
  - **Drag-along:** if a defined majority sells the company, everyone must sell on the same terms. **Tag-along (co-sale):** if founders sell, investors may join on the same terms. **Right of first refusal** on founders' shares.
  - **Dividends:** rarely paid; reinvestment is the point.
- **Money.** Investors' cash funds costs; the business reinvests everything; returns come at an **exit** (a sale or a listing), divided by the preference stack.
- **Ending.** An acquisition (shares sold, or assets sold and the proceeds distributed), a listing, or a wind-down where creditors are paid, then preferences, then common.

### 4.2 A venture against the core

| Matter | The core today | A Venture cMIP above it | Where the core blocks |
| --- | --- | --- | --- |
| A round: new shares for cash | The investor pays; a clone adds the investor to the stake in itself (rules 45, 10's payment mechanics). | The cMIP ties payment and clone together (rule 50, "Atomic where possible"). | **Issuance:** every holder signs (rule 8). Fine while the only holders are the founders at the table; blocked once any holder is passive (an early angel, a departed co-founder). *The text does not say whether a holder written into field 7 by a clone must sign it; rule 45 asks it of "every party it adds", not of a new holder who is no party. To settle when issuance is written.* |
| Investors as a class | One stake per object: "an object once" (field 7). Two stakes on the collective's own income cannot exist. | Preference built as **recoupment off the top**: the investor a named receiver until a threshold (a recoupment cMIP, F284 Q3), plus a share of the common stake. | Not blocked; **approximated**. The preference then bites on running income too, unless the recoupment cMIP scopes it to the proceeds of sales of works. |
| Pro-rata rights | — | The cMIP offers each round to existing holders first. | **Not binding** unless the core gives issuance a pre-emptive shape (Q2). |
| Anti-dilution | — | The cMIP computes the extra shares. | An adjustment that gives the investor more and others less is **not pro rata**, so it needs every lowered holder's signature under any rule (rule 8; and under the holders' rule proposed below, which reaches only changes treating holders alike). Stated cost; a cash or recoupment substitute is the cMIP's. |
| Protective provisions (class veto) | Investors who take a **board seat** are members: the constitutional change rule may name them (`[2, named parties]`), and an area may need their signature. | The cMIP lists the matters. | Not blocked **for investors who sit at the table.** For passive investors, the only veto the core gives is F270/F282's, on pay, and it is personal, not by class. |
| Founder vesting | A departing founder keeps every share (rule 70). Reverse vesting (a buy-back without the leaver's signature) is an advance permission: blocked (rule 48, F279). | **Vesting by staged issuance**: founders receive their shares over time, each tranche an issuance, instead of receiving them all and losing some. An option is a promise to issue: an agreement of the collective. | Not blocked, if issuance exists (Q2). Without it, every tranche needs every holder's signature. |
| Drag-along | A forced transfer: blocked. "A stake is sold or given by a transfer signed by the seller" (rule 10). | **Sell the business's works instead of its shares** (an asset sale), by the owners' consent; the proceeds pass through the stake to every holder pro rata, preferences through the recoupment. | The forced transfer is blocked, and should stay so (the way out). The asset sale is A11's gap today: unprotected, or every voiceless holder signs. |
| Tag-along, right of first refusal | Transfers are free (rule 10). | Promises in words, shown by the cMIP. | Cannot bind. Stated cost. |
| Reinvest everything | As for the company: the plan's off-the-top share for the business, changed only with every voiceless holder. | — | Blocked at scale (F270, F274); Q5 for where it sits. |
| Exit by acquisition | Each holder sells its own part of the stake (rule 10), or the collective sells its works. | The cMIP coordinates a sale, and divides the price by the preference stack outside the core. | The share sale needs every holder (no drag); the asset sale is A11's. |
| Wind-down | Closing after the works are sold and every debt paid or released (rule 91 D, rule 92). | — | Creditors first: checked. Preference: via the recoupment. |

### 4.3 What a Venture cMIP needs from the core

The same three things as the company: **a holders' rule by share, issuance with pre-emption, the owners' matters named**. The venture adds nothing to the core's list that the company does not already need; what it adds are terms the core should *not* carry (classes, anti-dilution, vesting clawbacks, drag-along), each with a way to build it above, or a stated cost.

---

## The synthesis: the common language

### What the four ask of the core

| Need | Band | Cooperative (small / large) | Company | Venture |
| --- | --- | --- | --- | --- |
| Owners and operators apart | Same people | Same people / apart | Apart | Apart, investors partly both |
| Owners without a voice | Leavers only, avoidable by per-project deals | None / many | Many | Some (angels, departed founders, employees) |
| A collective way of consenting among owners | No | No / yes, by head (in membership, not stakes) | Yes, by share | Yes, by share |
| Issuance | No (per-project deals) | No / yes | Yes | Yes, every round |
| Pre-emption | No | No | Often (law or charter) | Yes (pro-rata rights) |
| Owners consent to a sale of the works | No (members decide; leavers keep their projects) | No / yes | Yes | Yes |
| Owners choose operators | No | No / yes | Yes, in law | By contract (board seats) |
| Money kept by the collective | Little | Yes (reserves) | Yes | Yes, all of it |
| Classes, preferences, vesting, drag | No | No | Sometimes | Yes |

The pattern: **the band and the small cooperative bundle owning and running, so the core's member rules already protect them.** The company, the venture and the large cooperative separate them, and then everything turns on one missing piece: how owners who do not run things consent, together, to the few things that touch what they own.

### The candidates, tested

Each candidate: which shapes need it; what it replaces or reopens among F270 to F285; what it costs; whether it passes the admission test; the verdict.

#### C1. Owners and operators as separate roles

- **Needed by:** company, venture, large cooperative.
- **Finding:** the core **already** separates them: stakes on one side; parties, areas and grants on the other (F103: "Grants stay what they are: authority to act in the collective's name without a stake"). The log's sketch said it: "MOR's formats keep them apart (stakes; areas, grants), members bundle them". What is missing is not the separation but **the owners' voice once separated**: a holder who is no member has none, save a personal veto on its pay.
- **Verdict:** nothing to add as such. C1 reduces to C2.

#### C2. A collective way of consenting: the holders' rule

- **What it would say.** For each stake, an agreement may state **how its holders consent together**. Two forms only:
  - **every holder** (the default, today's personal signature: F59's forced default, one of the declared options);
  - **holders together holding at least a stated share of the stake**, in millionths (a vote by share).

  It **reaches only changes that treat every holder of the stake alike**: a change of the plan or the fees (which by construction falls on a stake's holders pro rata, rule 68, N10), and issuance (C3, every existing share scaled alike). A change treating one holder of the stake worse than another of the same size still needs that holder's own signature, whatever the holders' rule says.
  It **binds only those who accepted it**: by signing a version that carries it (a member who later leaves; a successor, whose stake is born in a clone it signs, F282), or by completing a transfer under such a version (a buyer: the buyer's signature act completes the transfer, which names the version, rule 10). *Client conformance, as rule 85's for the abandonment clause:* a buyer's client shows the holders' rule in plain words before the buyer signs.
  It **protects itself**: changing a stake's holders' rule needs every holder of that stake, as field 24 already does for the release rule ("a clone every owner signs changes it", N8).
- **Precedent in the core.** The release rule (field 24) is already "a rule counted among a stake's holders", set at founding and changed only by every owner. C2 is that shape, widened from one matter (release) to the owners' matters (C5), with a form counted by share.
- **Needed by:** company, venture, large cooperative (by share; see the side finding on counting by head).
- **Reopens:** **F279's sentence** "No advance permission reaches what a stake is paid" (rule 48): a holders' rule accepted in advance is an advance permission, of a collective kind. **F282**: "every holder who is no member signs what pays it less" becomes the default rather than the only way. **F270**: "needs the signature of every holder … it pays less who has no voice" gains "or the stake's holders' rule". Unchanged: F274's definition of "paid less", F280, F283, F284, F285, F273's "never" for a deal's non-party holder *unless that holder accepted a holders' rule* (a deal's investor buying under a version carrying one).
- **Cost.** The guarantee weakens for those who accept it: a voiceless holder can be paid less **without signing**, when owners holding enough of the stake agree and the change hits every holder alike. What protects them instead: equal treatment (already core), a proportional say (new), pre-emption (C4), seeing every fee and who receives it (rule 68), and the exit. A majority owner who also runs things can still favour itself by side channels (a fee to its own service): visible, not prevented, as today for members (rule 68's disclosure). New mechanics: **who holds what at the moment of the vote** (a register point the core can place: transfers take effect on sellers' lines, F217, while the change takes effect on the collective's line, F109; a seller voting before a sale and the buyer after it must not both count). Clients must show the rule before signing and before buying.
- **Admission test: passes.** Whether a clone is complete is the core's (rule 45); no cMIP can make a change complete without the signatures the core lists. It is part of the language every clone is judged in.
- **Verdict:** the centre of the common language. Q1.

#### C3. Issuance as its own act

- **What it would say.** An issuance is a version that adds new holders to a stake and **scales every existing holder's share by the same factor** (within rule 9's rounding), so no existing holder's proportion to another changes. It is complete when the stake's holders' rule is met (by default, every holder, as today), every new holder signs to accept, and, unless waived (C4), each existing holder was first offered its proportion of the new shares on the same terms.
- **Needed by:** company, venture (every round, every option exercise, vesting by staged issuance), large cooperative (admission).
- **Reopens:** **rule 8** ("Any act that changes the size of a stake requires its holder's signature") and **rule 45**'s "every holder whose share of a stake it drops or lowers has one too, member or not", for the pro rata case only; **F274**'s "another share added" stays a "paid less" change, now consentable by the holders' rule.
- **Cost.** An issuance at a low price to insiders dilutes outsiders in value; the core cannot judge a price (A11's own reasoning: "the core cannot judge a price, so who signs is the only protection it can give"). Pre-emption answers it for owners with cash, not for owners without (also true in law). A time reference is needed for the offer window.
- **Admission test: passes**, for the same reason as C2: the completeness of a version changing field 7 is the core's.
- **Verdict:** needed. Q2.

#### C4. Pre-emptive rights

- **What it would say.** An issuance decided by a holders' rule short of every holder first offers each existing holder its proportion, on the same terms, for a period on the agreement's time reference; what is not taken goes to the named new holders. Waived only by every holder of the stake, at founding or later.
- **Needed by:** company (where law or charter gives it), venture (pro-rata rights). Not by band or cooperative.
- **Why it belongs with C3.** It is what makes C2 safe for issuance. Without it, a majority by share can issue to itself at a token price; with it, every holder can keep its proportion. It is checkable: the offers are acts, their terms comparable, their period on the time reference.
- **Reopens:** nothing among F270 to F285; it adds a check to C3.
- **Cost.** Every issuance by vote waits out an offer period; a holder without money is diluted anyway (stated, as in law). Some jurisdictions and charters have no pre-emption at all (Delaware's default), so a forced default of "on" is a choice, not a universal.
- **Admission test: passes** as a guarantee no module may break, *if* C3 is in the core; as a free option of a cMIP it would protect nothing, since the core would count the issuance complete without it.
- **Verdict:** part of Q2, as its default.

#### C5. What a fork or a sale owes passive owners (A10, A11): the owners' matters

- **What it would say.** The owners' matters of a stake, which its holders' rule (by default, each voiceless holder) consents to:
  1. what the stake is paid (rule 48 with F270, F274, F280; as today);
  2. issuance (C3);
  3. **a collective's transfer or release of a stake it holds in a work**, for the holders of its stake in itself (A11, Fable's option b: "a change that pays it less (F274, by effect)");
  4. **a fork's successors' founding terms paying a kept holder less** than the original did (A10's smallest fix: "a fork completes only where no successor's founding plan pays a kept holder less … or that holder signs").
- **Needed by:** company and venture (sale of substantially all assets, mergers and demergers are owner matters in company law nearly everywhere); large cooperative. A band with per-project deals does not meet it.
- **Reopens:** rule 48 (one sentence); rule 55 and the release format's "which departed holders, passive, accept"; the fork's completeness (rule 91 B, "Fork (type 19)"). Answers **Agreements Q7 and Q8**, which F306 parked for this map.
- **Cost.** Without C2, every sale of a work by a collective with any departed holder needs that holder's signature, as a fee change already does (Fable's stated cost). With C2, the holders' rule carries it. A fork cannot reset the overhead against its kept holders without their consent. The core still cannot tell "substantially all" from one song, so *every* transfer or release of a work's stake is an owners' matter unless the holders' rule delegates it (as field 24 already lets the release rule "say otherwise").
- **Admission test: passes** as a guarantee: without it, "shared ownership means shared fruits" has a side door ("25% of nothing"), which is pattern 1 of round 2 turned around (the thing that decides is signed by the wrong party).
- **Verdict:** needed. Q3.

#### C6. Terms written into a stake at its birth (vesting clawback, forced buyout, drag-along, anti-dilution, compulsory redemption)

- **Needed by:** venture (vesting, drag, anti-dilution), band (agreed buyout), cooperative (redemption at par on leaving).
- **What it would reopen:** F279 at its root and rule 10: each moves a holder's stake without that holder's signature at the time. Unlike C2, they treat one holder unlike the others.
- **Ways above the core instead:** vesting by staged issuance (C3); redemption at par as a debt owed back, with no income stake (sketch 2); drag-along as a sale of the works by the owners' consent (C5); anti-dilution by every lowered holder's signature, or by a cash or recoupment term.
- **Admission test:** these are terms of particular deals, not language every act is written in; and they break a guarantee (pattern 3: "a rule that protects the owner also traps the owner"; the way out).
- **Verdict:** not proposed. Stated cost: a founder who leaves early keeps every share they were already given.

#### C7. Classes of stake on the same income

- **Needed by:** venture (preferred and common), sometimes company.
- **Today:** "an object once" (field 7): one stake on the collective's own income.
- **Way above:** preference as recoupment off the top (F284 Q3), which F280 already allows as overhead.
- **Admission test:** a second stake on one object would need F280's "by ownership" to rank owners against owners, which is what "shared ownership means shared fruits" refused.
- **Verdict:** not proposed. Stated cost: a preference is an approximation, an overhead with a threshold.

#### C8. Owners choosing operators

- **Needed by:** company (in law, shareholders elect the board); large cooperative (members elect the board). Not band, small cooperative, or venture (seats are by contract).
- **What it would say.** A collective's constitutional change rule, or the power over membership, may be counted as a stake's holders' rule by share (or, for a cooperative, among members of a cMIP's register, which the core cannot count).
- **Reopens:** rule 65 ("only parties whose voice remains are counted"), rule 61 (coverage of every constitutional voice), and the line between owning and running that C1 found already in place.
- **Cost.** Owners could vote a change of operators that operators then refuse to put into force: a change of members needs **a rotation of the collective's keys** (rule 69), and the key grammar is cryptographic ("the key grammar's thresholds are cryptographic, and this rule never lowers them", rule 65). A vote the keys can ignore is a promise the core cannot keep, unless the owners also name a key holder answerable to them (a custodian, rule 59), which is the cMIP's design, not the core's.
- **Admission test:** passes as language (powers are core), but fails "smallest": every shape can be built without it, owners keeping consent on what they own, and the exit.
- **Verdict:** a genuine choice for the author. Q4.

#### C9. Money a collective keeps for itself

- **Needed by:** cooperative (reserves), company and venture (reinvestment).
- **Today:** a collective writing a stake in itself pays everything left after the overhead to its holders (F280); keeping money means naming an off-the-top receiver, and "a stake in the collective held by the collective itself is invalid" (field 7). The text does not say, as far as this reading found, whether the collective itself may be that off-the-top receiver, or where money a split leaves to the collective rests (a payout to its own pointer would come back to its own split service).
- **Admission test:** the split plan's validity is core (rule 22), so if a reading is needed, it is the core's.
- **Verdict:** a reading to confirm. Q5.

### The common language, stated

Taken together, the smallest thing the core must allow so each shape can be built as a cMIP above it:

1. **Owners and operators are already two words** (stakes; parties, areas, grants). Keep them.
2. **A holders' rule per stake:** every holder (default) or holders holding at least a share; reaching only changes that treat every holder alike; accepted by signing or by buying; changed only by every holder. *The release rule, widened.*
3. **Issuance:** a named, pro rata change of a stake, consented by its holders' rule, pre-emptive by default.
4. **The owners' matters:** pay (as today), issuance, the sale or release of what the stake's income comes from, and a fork's successors' terms for the holders they keep.

Everything else (votes on budgets, patronage, preferences, vesting, options, drag, tag, rights of first refusal, board procedures, share registers for display, asset locks) is a cMIP's, with the stated costs above.

### The guarantees kept in view

| Guarantee | Under the common language |
| --- | --- |
| The way out (selling, succession, clones across, forks, leaving) | Unchanged. No candidate proposed forces a transfer or blocks one. A holder outvoted can still sell. |
| "Shared ownership means shared fruits" (F280) | Unchanged, and closed at one more door (C5: the sale of the works, the fork's successor plan). Non-owners still paid only off the top. |
| The voiceless never treated worse than members (rule 68) | Kept: a holders' rule counts members' and voiceless holders' shares alike, and reaches only changes treating every holder alike. A departed holder gains a proportional say on owner matters, which it does not have today. |
| Nothing updated, only published or signed again | Unchanged: a holders' rule, an issuance and a consent are each a clone or a signed act. |
| No stake reduced without its holder (rule 8) | Narrowed for the pro rata case only (issuance), and only where the holder accepted a holders' rule. |
| No advance permission reaches what a stake is paid (F279) | Narrowed: no advance permission reaches what **one** holder is paid unlike the others; a holders' rule the holder accepted reaches what **every** holder of the stake is paid alike. Abandonment still never lowers pay. |

### Side finding: the release rule's threshold can be manufactured

*Named plainly, as CLAUDE.md asks of a flaw found on the way.* The release rule (field 24) is a `rule`: `[0]` every holder, `[1, k]` a threshold, or `[2, named]` named holders, counted among a stake's holders. A threshold `[1, k]` counts **heads**. Transfers are free (rule 10), and a holder may sell or give any part of its share (field 3 of the transfer, "above zero"). So a holder can split its share among identities it controls until it alone supplies `k` signatures, and release a work the other holders wanted to keep. "Every holder" and named holders are not open to it. *Possible answers, for the author:* count field 24's threshold by share instead of by head; or keep it and state the cost. It bears on C2: a holders' rule counted by head would have the same hole, which is why C2 proposes only "every holder" and "by share". *Not a question in the list below, since it may be answered with Q1; flagged for the log.*

---

## Questions for Nobody, allegedly, one at a time, in the order to decide them

Each names its area. The first decides whether the rest are light or heavy.

### Q1. A holders' rule: may owners without a voice consent together? (core business: Agreements, stakes; reopens F279's sentence, F282, F270)

**Plainly.** Today an owner who has no say in the collective (a member who left, a successor, a buyer) protects their income by signing, personally, every change that pays them less. Should an agreement be able to say instead, for a stake, "these changes are agreed when owners holding at least this share of the stake agree", binding only owners who accepted that rule by signing or buying, and reaching only changes that hit every owner of the stake alike?

- **(a) Yes: a holders' rule per stake, the release rule widened.** Two forms, "every holder" (the default, today) and "holders holding at least a share"; reaching only changes treating every holder alike; accepted by signing or buying; changed only by every holder. *For it:* without it, a company or a venture with passive owners cannot exist on MOR (sketch 3); the protection it gives instead is the one company law has settled on across most of the world (equal treatment, a proportional vote, the exit), and the shape is already in the core (field 24). F59's working rule is kept: the default is one of the options, the stronger one.
- **(b) No: the personal signature stays the only way.** Companies with many passive owners wait for MOR 2; MOR 1's collectives are bands, cooperatives and companies whose owners all sit at the table. *For it:* the guarantee stays the strongest possible, and the author's F279 sentence stands whole; "fewer things, done well" for a frozen core; the cost is stated, not hidden.
- **(c) Only for buyers.** A holders' rule binds those who bought into it; a departed member and a successor keep their personal signature. *For it:* a buyer chooses a company's terms with eyes open; a member who left gave up their say expecting to keep their veto. *Against it:* one stake governed two ways, which rule 67's "one version for everyone" warns against; and departures would grow vetoes over time.

**Recommendation: (a).** It is the smallest addition that lets the company and the venture be built, it reuses a shape the core already has, and the default keeps today's protection for anyone who does not choose otherwise. The register point (who holds what when the vote is counted) is a mechanic to settle when it is written; double counting across a sale is the risk to close.

### Q2. Issuance: may a stake take new owners, everyone diluted alike? (core business: Agreements, stakes; reopens rule 8, rule 45, with F274)

**Plainly.** Today a new owner can only come into a stake if every existing owner signs, because each one's share gets smaller. Should the core name issuance (new owners in, every existing share shrinking in the same proportion) as a change the holders' rule can agree to, with each existing owner first offered the chance to keep their proportion on the same terms?

- **(a) Issuance named, pre-emptive by default.** Consented by the holders' rule; each existing holder offered its proportion, on the same terms, for a period on the time reference; pre-emption waived only by every holder. *For it:* it answers the author's own question ("So what we are missing is the issuance of new shares…"); pre-emption closes the classic abuse (a majority issuing to itself), and the offers are acts anyone can check.
- **(b) Issuance named, without pre-emption in the core.** Pre-emption left to cMIPs. *For it:* simpler; matches Delaware's default; ventures write pro-rata rights by contract anyway. *Against it:* a cMIP's pre-emption binds nothing the core counts complete, so it protects no one.
- **(c) No issuance: every holder signs, as today.** *For it:* rule 8 whole. *Against it:* every round, every option, every new member of a large cooperative needs every holder.

**Recommendation: (a).** Decided after Q1; under Q1 (b), issuance stays "every holder signs" whatever is answered here.

### Q3. The owners' matters: what a fork or a sale owes passive owners (core business: Agreements, rules 48, 55, 91; answers Agreements Q7 and Q8, A10 and A11)

**Plainly.** Two side doors let a collective pay its passive owners less without asking them: (A11) selling or giving away the works its income comes from; (A10) forking into successors whose own plans take more off the top. Should both count among the things a stake's owners must agree to, by their holders' rule or, by default, each of them signing?

- **(a) Both, as owners' matters.** A collective's transfer or release of a stake it holds in a work is consented by the holders' rule of its stake in itself (default: every holder who is no member signs, with F279's way out against one who vanished); a fork completes only where each successor's founding terms pay no kept holder less than the original did, or the kept holders consent. *For it:* "Shared ownership means shared fruits"; company law treats the sale of the business and a demerger as owners' decisions nearly everywhere; Fable's recommendation for both.
- **(b) A10 yes, A11 a stated cost.** The fork's check is F270's own test run once more; the sale of works is the collective's business, its price unjudged. *For it:* a sale for a fair price pays nobody less, and asking passive owners for every sale is friction a label will feel. *Against it:* the core cannot tell a fair price from a token one, and the stated cost is exactly "25% of nothing".
- **(c) Both stated costs.** *For it:* the lightest. *Against it:* leaves the two quiet routes F270 and F280 were written to close.

**Recommendation: (a)**, with Q1's holders' rule as the way a company carries it. Without Q1, (a) still holds, at the cost Fable stated: a sale needs every departed holder's signature, as a fee change already does.

### Q4. Owners choosing operators (core business: Agreements, the constitutional tier; reopens rules 61, 65)

**Plainly.** In a company, the owners elect the board. In MOR, the people who run a collective (its members) are chosen only by the members themselves. Should a collective be able to let its owners, voting by share, choose its members?

- **(a) Yes, as an option:** a constitutional change rule (or the power over membership) may be counted as a stake's holders' rule by share. *For it:* it completes the company: owners who can remove the board, not only consent on what they own; without it, a MOR company is shaped like a limited partnership (owners with protections, operators who choose themselves).
- **(b) No: owners consent on what they own, and leave if they disagree.** *For it:* a change of members needs a rotation of the collective's keys, which the operators hold; an owners' vote the keys can ignore is a promise the core cannot keep; the limited-partnership shape is real practice too (funds, non-voting shares), and the exit stays whole. A cMIP may still give owners a key holder answerable to them.

**Recommendation: (b) for MOR 1**, the one recommendation here held with least confidence: (a) is what "a company" means in most law, and the author may judge the gap larger than the key problem. Decided after Q1 to Q3, since it only matters if they are answered (a).

### Q5. Money a collective keeps for itself (core business: Agreements, the split plan, rule 22; a reading)

**Plainly.** A cooperative keeps reserves; a company reinvests. When a collective's income goes through a stake to its owners, how does it keep some for itself?

- **(a) The plan may name the collective itself off the top**, its part kept as the collective's own money, never split again (F280 unchanged: it is overhead, and changing its size pays the stake less, so it is an owners' matter).
- **(b) Not the collective itself:** keeping money means naming another identity off the top (an operating account run under a grant, a deal of the operators), stated.
- **(c) No stake in itself for collectives that keep money:** they pay their owners by decision (the cooperative's variant b), and the core does not protect those payments.

**Recommendation: (a)**, read first against how a split service treats a payout to the collective's own pointer today, which this reading did not find written. Its smallest form is one sentence in rule 22.

## What this changes, and what would follow

**Nothing changes now.** No MIR, MICS, freeze suite or code is touched by this document. F270, F274, F279, F280 and F282 stand as written until the author answers.

**If Q1 to Q3 are answered as recommended**, the next Agreements draft would carry: a stake's holders' rule (a new terms field or a widening of field 24, the release rule then one of its matters); issuance as a named change in rules 8, 45 and 48, with its offer act; rule 48's paragraph on F279 rewritten ("no advance permission reaches what one holder is paid unlike the others"); a sentence in rule 48 and a check in the transfer's and the release's completeness for A11; a condition in the fork's completeness for A10; freeze scenarios for each (a company of a hundred passive owners raising a fee by holders' rule; a token-price issuance to insiders defeated by pre-emption; Fable's A10 and A11 scenarios under the chosen readings). The founding cMIPs to sketch afterwards as instruments, labelled experimental: a Company cMIP and a Venture cMIP over the new language; a band and a cooperative need none.

**Whatever is answered**, the side finding on field 24's threshold by head goes to the findings log for its own decision.

## Sources read

- `CLAUDE.md`, `docs/build-brief-v1.md`, `docs/roadmap-v1.md`.
- `docs/findings/MOR-findings-log-round-2.md`: F306; "Open, not decided: owners without a voice, and a Company cMIP"; F270, F273, F274, F279, F280, F282, F283, F284, F285; F103, F109, F127; the working rules (round 2's patterns, F59, F265).
- `spec/MIR-agreements-draft-13.md`, whole: above all rules 6, 8, 10, 14, 15, 22, 45, 47, 48, 55, 58, 64 to 70, 81 to 93, the split plan and fees, the fork and the closing, the release, the terms format (fields 7, 22, 24).
- `spec/MIR-money-draft-7.md`, where it pays stakes and holds debts (rules 15 to 18; the obligation and the creditor's release).
- `docs/reviews/fable-step-15-agreements.md`: A10, A11, its Q7 and Q8, the five questions.

*Real-world practice is described from general knowledge of company, partnership and cooperative practice and common venture terms; where a country's rule is named, it is as an example of a pattern, not a claim about every jurisdiction, and the author should treat any single legal detail as checkable rather than settled.*
