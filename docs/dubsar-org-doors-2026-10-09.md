# dubsar.org: the departments' doors (9 October 2026)

*Report of a GitHub session on roadmap step 10a: the fourteen doors decided by Nobody, allegedly, on 9 October 2026 ("Doors on the site", under "Toward universities"). Nothing was released or published, the display client was not changed, and the server was not touched.*

## In plain words

`dubsar.org` stays the main door, exactly as it was: its five pages are unchanged. Beside it there are now fourteen smaller doors, one for each department on the working list. Each is a folder of the same site, so a pitch to a law department sends two addresses: `dubsar.org` and `dubsar.org/law/`.

Each door is one page. It looks like the main door's other pages (the same stylesheet, the same tab icon, the same footer with the contact, the sealed message link and the clay tablet). At the top, a link back to the main door. Then the department's name, then two placeholders: one where the door's opening lines will go, which are Nobody, allegedly's to write, and one saying that the documents will lead to their acts once they are published, at step 17, as on the main door's pages. Then the documents the working list names for that department, in the list's order, as plain items for now.

**Unlisted, never hidden.** The main door does not link to any of the doors. But a door is not a secret: the site's signed list of files names every path, so anyone who reads it finds them all.

**The same document in every door.** Each item will lead to the one signed act, never a copy (website cMIP, rule 13), so the adult content case study, for example, is the same act in the Law door and in the Sociology door.

## The folder names

| Folder | Door | Documents, in the list's order |
| --- | --- | --- |
| `computer-science/` | Computer science | the paper; the core document; relay transport; Migration to MOR 2 (10); Paying the Ones Everything Stands On (19) |
| `cryptography/` | Cryptography and security | the Identity MIP; keys and the theft rule; the freeze test suite |
| `ai/` | Artificial intelligence | From Agents to Open Intelligence (20); Paying the Ones Everything Stands On (19) |
| `law/` | Law | legible greed; the Law MIP; From Bedroom to Label (08); From Cat Video to Coproduction (09); One Reputation, Many Trades (12); From Pocket Game to Open Market (13); Adult Content, Consent on the Record (18) |
| `economics/` | Economics | who can earn; the Finance MIP; No Firm Required (16); One Reputation, Many Trades (12) |
| `business/` | Business and marketing | Paid for Results, Seen for What It Is (15); No Firm Required (16); From the Stands to the Main League (17) |
| `politics/` | Political science and public policy | Augmented Democracy (04); Migration to MOR 2 (10) |
| `journalism/` | Journalism and communication | From Local Question to World Story (11); Paid for Results, Seen for What It Is (15) |
| `music/` | Music | From Bedroom to Label (08) |
| `film/` | Film and media production | From Cat Video to Coproduction (09); From the Stands to the Main League (17) |
| `creative-industries/` | Creative industries and publishing | From Pocket Game to Open Market (13); From Bedroom to Label (08); From Cat Video to Coproduction (09) |
| `education/` | Education | Shown, Not Listed (14) |
| `sociology/` | Sociology and labour studies | One Reputation, Many Trades (12); Shown, Not Listed (14); Adult Content, Consent on the Record (18) |
| `philosophy/` | Philosophy and ethics | From Agents to Open Intelligence (20); legible greed; the way out |

The names are short, lower case (website cMIP, rule 2), and the ones a department would call itself where one word does; where the list joins two fields, the first or the usual one. Any of them can be renamed before the site is published: the folder, and its line in `clients/site/test/world.ts`. The case studies are named by the titles the Read page already uses.

## Precisely

- **Files:** `docs/dubsar.org/<folder>/index.html`, fourteen pages. Each refers to the main door's files with relative paths (`../site.css`, `../icon.jpg`, `../tablet-light.jpg`, `../tablet-dark.jpg`), and links back with `../`, which the display client turns into `/`. HTML with no scripts and nothing from elsewhere (rules 11, 12). The placeholders use the `placeholder` class and the "Placeholder:" wording of the main door's pages.
- **The main door's pages are unchanged** (`git diff` touches nothing in `docs/dubsar.org/` outside the fourteen folders).
- **Published, the site would hold 23 files** instead of 9. The display client and the gateway already handle folders (`pathFor`, `resolveRef`, `addressOf`, and `readFolder` reads subfolders), so nothing in the code changed.

### Tests

In `clients/site/test/`:

- `world.ts`: the list of the fourteen doors (folder and name), shared by both test files.
- `site.test.ts`: the published version's file list is the main door's nine files plus each door's `index.html`, no more and no fewer, each verifying from a relay.
- `browser.test.ts`, three new tests, through the real gateway, display client, homes and relay:
  - **every door verifies**, at its folder's address (`/law/`), signed by the owner, with its name as title and heading, no script, a link back to the main door (`/`, opening at the top), its placeholders, the main door's stylesheet (checked by the dark page colour), the same footer links, the tablet drawn on the dark page shown from its checked bytes, the KI icon on the tab, and nothing fetched from elsewhere;
  - **the main door lists no door**, and every door is in the signed version's file list (unlisted, never hidden);
  - **a door's link back** opens the main door, checked again.

Results are at the end of this report.

## Questions for Nobody, allegedly

Where a rule was unclear, nothing was chosen; the pages follow the list exactly.

1. **Case study 21 (academic publishing).** The roadmap says it "fits every door, since every department publishes", but the working list names it in no door, and it is not yet on the Read page (draft 2, not yet checked in full). It is in no door for now. Should every door carry it, and where in the order?
2. **Items that are not one document.** "Keys and the theft rule" (the Identity MIP's section, Finance's rule, or the theft-window baseline?), "the way out" (the core document's section, or the paper's section 4.4?) and "the core" (taken as the core document). Each is a placeholder item under the list's own words until step 17 says which act it leads to.
3. **An address without its last slash.** `dubsar.org/law/` opens the door; `dubsar.org/law`, typed without the slash, is told "the signed site has no file at this address", because the website cMIP's rule 3 gives a folder's page only at the folder's address followed by `/`. Until that is decided, every pitch should write the address with its slash. Making the address without the slash work too would mean a change to the display client and the gateway, and a reading of rule 3, which this session was not to make.
4. **The doors' names** on each page are the list's department names (for example "Political science and public policy"). They can be changed with the opening lines.

## For the machine session

Nothing to do yet. When the site is next published, the fourteen folders go with it (the publishing tool reads subfolders), and `mor-site check` should list 23 files.

## Results

In this session's container, in Chromium: the site's tests 34 of 34 (19 in the browser, 3 of them new; 15 others), typecheck clean. The test that the main door lists no door was checked to fail when a link to `law/` is added to the main page, then the page restored unchanged. WebKit cannot be installed here; the site's WebKit workflow on GitHub runs the same tests when `docs/dubsar.org/` changes. No other package changed, so no other tests were run.
