# Two lines per app: the report

*21 October 2026, a Dubsar Suite session. Branch `claude/two-lines-per-app`, from main after pull request 86. Finding F376. Answers question 1 of `docs/private-lines-report.md`, as decided by Nobody, allegedly ("Agreed", option (a)). Author: Nobody, allegedly.*

## 1. In plain words

**What was wrong.** Each app kept one line of acts, public and private together. After a change of keys, a reader keeps an act only if it can follow its line back to the first act, opening each one on the way. Only your own apps can open your private acts. So a public act that came after a private act on the same line became *unknown* to everyone else: a collective's founding signed in Edubba after a payment draft could no longer be read in force.

**What is fixed.** Each app now keeps two lines:

- **a public line**, holding only public acts (posts, names, routes, signatures, releases). Anyone can follow it after a change of keys, Kišib included, with no card needed;
- **a private line**, holding only private acts (messages, drafts, lists, member keys). It is kept by the app's card, as F373 built.

An identity held from before keeps its old mixed line exactly as it was, frozen. Its card keeps it, as before; both new lines start empty at the app's next act. New words (an identity brought again, or a key renewed) start new lines, as the one line did. A collective's own identity keeps its single line: its acts are the collective's.

Each app's identity window now shows one card per line, joined by "; ", each naming the app and the line (`public`, `private`, or `earlier` for the line from before). They are copied whole into Kišib as one, and Kišib names each line in its review ("Edubba's public line", "Damgar's private line", "Edubba's line from before"). In a red warning, it says what lives on that line.

**Tested.** A founding signed in Edubba right after a private payment draft. After the founder's change of keys, a reader holding no key of the founder's reads its terms and the founder's signature as valid. Every line is placed with nothing to tick, and Damgar still signs the collective's promise with the member key.

## 2. Every app

| App | Public line | Private line | Line from before |
| --- | --- | --- | --- |
| Dub | posts, names, routes, signatures, contests, follows published | messages, the follow list sealed, answers to proposals, member keys, key deliveries, lane requests | kept by its card |
| Edubba | terms, signatures, records, publications, vows, witness acts, names | prompts and messages, notes and diaries, member keys, invitations, drafts for Damgar | kept by its card |
| Damgar | the published list, rails, public claims and receipts, grants | the accepted list, sealed sends, drafts and sales to oneself, asks for a promise | kept by its card |
| Ummia | specifications, MIP drafts, releases, bug reports | the accepted list, an anchor's payment, asks for a release | kept by its card |
| Kišib | signs no line an app continues (its own acts stay off the homes, F373) | | |

The choice is made in one place, as an act is signed (`lineFor`, `clients/genesis/src/identity.ts`). The apps' sending is unchanged; the screens are unchanged except for the words of the card. Acts under a lane and a collective's acts are not affected.

## 3. For the MOR lead

Nothing that changes a rule. Identity rule 35 and every verdict are unchanged; an identity may keep as many lines as it likes, and each app now keeps two. Nothing in `core/`, `relay/` or `spec/` was touched.

One point, for information, found while testing (Edubba's keepers test). An act left out of a change of keys reads **unknown**, not void, to a reader who cannot open a private line kept by its card, when that line is longer than the act's position. To say "void", a reader must show the act lies on none of the kept lines, and it cannot follow a private line it cannot open (F298, as written). This holds since F373 wherever a private line is kept by its card; nothing binding rests on unknown, and the owner's own apps, which open the private line, say void. The test now leaves the phone's line out without giving the other cards, as it always did, and still shows the dispute. If the MOR lead wants a reader to tell void without opening private lines, that is a protocol question (for one, kept tips that name each line's length by public position); my lean is that it is not needed.

## 4. Questions for Nobody, allegedly

None open. Questions 2 and 3 of `docs/private-lines-report.md` are accepted as leaned; their stated costs are now said in the READMEs:

- Whoever holds your signing words can read the messages you sent: the cost of letting your own apps follow your lines.
- Kišib takes the apps' counts on their word: a count changes only what Kišib says, never what the change of keys keeps.

## 5. Human test steps (on the Mac)

*Checked against the READMEs of Dub, Edubba, Damgar, Ummia and Kišib. Test identities only; regtest only.*

1. **Bring the Mac up to this branch.** In Terminal, from the MOR folder: `git pull`, then `cd clients/genesis && npm install && npm run wasm`, then `npm install` in `clients/desk`, `clients/dub`, `clients/kishib`, `clients/damgar` and `clients/ummia`. Rebuild each app as its README says (`sh scripts/make-app.sh`).
2. **Three new test identities.** In Dub, make **A** and write its chain key's words on a paper; make **iPa** and **iPh** in other Dubs. Bring A into Edubba, Damgar and Ummia.
3. **A private act first, then a founding.** In Edubba, "Pay someone" from A (a small amount): a private draft for Damgar. Then found a real collective with iPa and iPh, its Money area held by A and iPa. iPa and iPh sign in Dub's Signing tab; gather and found it in Edubba.
4. **The cards.** In Edubba's Identities tab, "This desk's line" shows "its cards, for Kišib": two, joined by "; ", one ending `Edubba public`, the other `Edubba private`. Do the same in Dub's identity window, and in Damgar's and Ummia's once each has signed something.
5. **The change of keys.** In Kišib, change A's keys from its paper, pasting every app's cards. The review names "Edubba's public line" and "Edubba's private line", each kept, and nothing is in red. Sign it, as Kišib's README says.
6. **The founding still counts.** In Damgar, take A's new words and add the collective: its Money area is read ("Its Money area, …"), which needs its agreement in force, founded after the private draft. Sign a promise for the collective: "Signed for the collective with your own key".
7. **An identity from before (optional).** Use an identity held in Edubba since before this branch. Its window shows a third card, `Edubba earlier`, for the mixed line it kept. Give it to Kišib with the others: the review says "Edubba's line from before (public and private acts together)", kept.

## What changed, file by file

- `clients/genesis`: `src/identity.ts` (`lineFor`, `nextLine`, `ownLines`, `ownIds`, `freshLines`; the file's `private`, `earlier`, `split`), `src/lines.ts` (several own lines; a card names its line; cards joined by "; "; the lines named), `src/private.ts` (a card per line), `src/card-words.ts` (the words only); `test/cards.test.ts`.
- `clients/dub`, `clients/desk`, `clients/damgar`, `clients/ummia`: new words start new lines (`freshLines`); an app's own acts read from all its lines; READMEs.
- `clients/kishib`: README (two lines, the counts' stated cost).
- Tests: `clients/ummia/test/private-lines.test.ts` (the founding after a private act, valid for every reader), `clients/damgar/test/collective.test.ts` and `clients/ummia/test/kishib.test.ts` (the lines named), `clients/genesis/test/genesis.test.ts` (another app's private act on its own line, kept by its card), `clients/desk/test/keepers.test.ts` (the money terms signed on iPh's second Dub, whose line is the one left out: a phone lost), `clients/desk/test/agents-memory.test.ts` (acts counted across an agent's lines).
- Records: F376; `docs/private-lines-report.md` (questions 1 to 3 answered).
- `clients/desk/built`: Edubba's web release rebuilt (its pull-request check). Dub's, Damgar's, Ummia's and Kišib's are rebuilt on main by a commit carrying `[release dub web]`, `[release damgar web]`, `[release ummia web]` and `[release kishib web]`.
