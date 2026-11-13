# The click on draft 10: what building on it showed

*The Dubsar Suite lead, 13 November 2026, for Nobody, allegedly, and the MOR lead. On `cmips/sketches/click/` (three split-service cMIPs sketched, a reader of rule 11.4, six runs). Against Agreements draft 10 (pull request 162). A record of work, not a decision.*

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

**The ground.** Case study 22 (pull request 158) was not used: a barter has no payment in it, so it cannot show a click climbing through split services. The sketch uses a film standing on a song and a sound library, the song co-owned by a band: a band member is three legs from the click, each run by a different split-service cMIP. Details in `cmips/sketches/click/README.md`; every run in `run-output.md`.

## In plain words

**One click can reach everyone, but only if every leg on the way reports, and only if rule 11.4 is read in a way its words do not quite say.**

When every service reports, a reader who knows none of the three cMIPs follows the click to the director, the editor, the producer and all three band members, each amount signed by the service that paid it (run 1). Three things stop it:

1. **Read literally, rule 11.4 stops at the first work that pays through a split service** (run 2). The film's service passes money "to the song". But the song is paid through its deal, so the next report is made within the deal, not within the song. Rule 11.4 looks in the song, finds nothing, and shows nobody beyond. This is a flaw in the grammar, and it's brought back here, not worked around.
2. **One silent leg hides everyone beyond it** (run 3). If the song's service gives no report, the producer and the band disappear, though they never chose that service.
3. **A person who receives for others never reports** (every run). The library's first owner receives for both owners; the second owner is never shown.

And the shared shape, as draft 10 writes it, is too thin in three places: it can't link one leg's report to the next, it can't show reports that disagree on amounts, and it can't tell a fee from money still owed.

## 1. Does one click reach everyone?

| Person | Run 1, every leg reports | Run 3, the song's service silent |
|---|---|---|
| director, editor | reached, stated | reached, stated |
| producer | reached, its share of a batch | not shown |
| three band members | reached, their share of a batch | not shown |
| library owner who receives | reached, holding the other's part | reached, holding the other's part |
| library's other owner | not shown | not shown |

So: yes, through three legs with three different cMIPs, as long as each leg reports and the reader follows the receiver between legs. Rule 11's idea works: a reader with none of the cMIPs read the whole climb.

## 2. Must every leg report?

**What the build shows:** every leg between the payer and a contributor must report, or that contributor is not shown. The people this hides (the producer, the band) never chose the service that kept quiet. A payer can't tell before paying whether the click will be readable all the way: nothing in a work says whether the deals below it report.

So "when needed", in his words, turns out to be every leg on every path to a person. The grammar doesn't need to say more for the click to work when services behave; it needs to say more only if those further along should be protected from a leg they did not choose. That choice is his (section 5).

## 3. What the grammar lacks, or gets in the way

**Flaws, brought back rather than worked around:**

- **3a. Rule 11.4 and the receiver.** 11.4 follows each `passed_on` entry naming an agreement "to the leg report of that agreement". When that agreement is paid through its receiver (rule 1.4, a deal), the report is made in the receiver. Read literally, the climb stops at the first deal (run 2). The sketch could only proceed by having each service name the receiver it actually paid, or by reading 11.4 as "that agreement, or its receiver now". Rule 11.4 should say which.
- **3b. Linking one report to the next.** 11.4 needs each report's `received` to name the report before it. Nothing tells the next service which report its money came from: its settlement arrives first, the report later. The sketch had to put each payout's settlement inside the `passed_on` entry ("what", P20). Without some such link, rule 11.4 can't be followed even when everyone reports.
- **3c. Disagreement needs amounts that the shape doesn't carry.** 11.4 asks a verifier to show where a leg names as received more or less than the leg before passed on. But `received` names acts, not amounts. The sketch saw the disagreement in run 5 only because it added a stated received amount. Rule 11.2 and 11.4 ask different things of the same shape.

**Pinches, expected (P6, P8, P20):**

- **3d. Kept or held?** (run 4, small clicks). The band's service held all three members' payouts under its minimum. In the shape, money held and still owed looks exactly like a fee kept: "kept 38 of 38". The shape needs to say "still owed" apart from "kept", or a held payout and a skimmed one look the same.
- **3e. Pools** (P6, every run). One report for a batch of payments works: its `received` names them all. But "how much of *my* click reached the band" is then arithmetic the reader does pro rata, which nobody states. The sketch marks it "not stated". Workable, if the reader says so.
- **3f. Loops** (P8, run 6). When the song names the film as a party, money goes round until fees and rounding eat it. It ended here, but only because the services round down and charge fees. The reader needed a rule of its own to detect the return. The grammar says nothing about what a loop answers.
- **3g. A person who receives for others** (P20, every run). A work whose receiver is one of its owners passes no report, and none is asked. That owner then holds the others' money invisibly. "Who signs a report where a leg has no service" is the question.

**What worked as written:** an agreement as a party; a receiver that is an agreement; every payment and report naming the version it read; shares read by each service's cMIP, not by the grammar. Nothing there got in the way.

## 4. What the sketch does not show

No forks, no place, no clock, one rail, one version per agreement, and services that lie only in one run. A service that passes on less than its shares require is not caught by a reader without its cMIP: rule 11.3 says so, and the sketch confirms it. Shown, signed, not checked.

## 5. For Nobody, allegedly, and the MOR lead

Three flaws to settle in the grammar (3a, 3b, 3c), and four parameters the build touched (3d to 3g). One question first, since the others follow from it:

**Should a leg that receives for others be required to report?** As written, no leg must, so one silent leg (or one person receiving for co-owners) hides everyone beyond it. The alternatives:
- (a) leave it a stated cost, as draft 10 does;
- (b) any agreement whose receiver passes money on to others must report, or what it received counts as not passed on;
- (c) a work's Terms may require it of the deals below it, as a block a payer can read before paying.

The Dubsar Suite lead's lean, not a decision: (c). It keeps the grammar's "where needed", lets a payer see before paying whether the click will be readable all the way, and protects the people further along without a rule for every leg.
