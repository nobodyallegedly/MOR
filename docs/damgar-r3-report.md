# Damgar on the kit, and the three ways to pay: report

*22 October 2026, Dubsar Suite, round 3 of the redesign, branch `claude/damgar-kit-three-ways`, for Nobody, allegedly, and the Suite lead. Built from the redesign drawn and approved (`docs/design/suite-redesign.md`; the mockups `docs/design/mockups/damgar-*`, `dub-damgar-tip`, `dub-pay-chooser`, `dub-profile-pay`; `docs/design/mockups-report.md`). Finding **F379**. Test identities only; regtest only; no server address or key in the repository.*

## 1. In plain words

### What Damgar looks like now

Damgar opens on **four big tiles**, each with its danger marks, as decided on the mockups: **Waiting** (three bars), **Account** (one), **Lanes** (two), **Settings** (two). A tile opens with its **column** on the left; tabs across the top move between tiles; the duck, top left, brings back the tiles. On a phone the tiles stack, a tile opens on its first part, and the back arrow shows its column.

- **Waiting**: **To pay** (each payment one card: read it in plain words, sign it, then the invoice or address to pay in your own wallet appears on the same card, and you paste the proof back), **To receive** (an invoice to make, an address to give, a receipt to sign), **+ Paste an act to sign** (the "by hand" way), **To the vault**.
- **Account**: **Summary** (per unit: in, out, pending, owed, never added across units; requests and debts), **Payments** (each payment a card with the kit's two menus, how each act was signed as a label), **Under the lanes** (what Dub paid under its lane: its record lives here), **Anchors**.
- **Lanes**: **Asked**, **In force** (each lane with its cap per payment, **In all** with what is spent and left, any overspend in red; the clock for lanes beneath), **Damgar's own** (its receipts and referral lanes; the node link beneath), **Ended**.
- **Settings**: **Where you are paid** (the vault shown, changed in Kišib), **What you accept**, **Homes and relays**, **Every step by hand**.

**Top right is the identity**, by its display name. Its panel lists the identities held and **the collectives under each**: choosing a collective there is how you act as it (no tab any more); Waiting then gains its part, "For …", with the promise to pay. **+ Add** offers **Make one** (new: its chain key's words shown once, three typed back), **Bring one**, and **Use one from Kišib** (on the Mac: Damgar holds no key; every money act shows Kišib's panel inside Damgar's window).

### The three ways to pay from another app, and how to try each

1. **By hand.** In Dub, Tip (or Pay on a profile), choose **By hand**: Dub shows the payment to copy. In Damgar, **Waiting › + Paste an act to sign**, paste, **Read it**: it appears in To pay, in plain words, marked "pasted by hand". **Sign it** there.
2. **Ask Damgar.** In Dub, choose **Ask Damgar**. Dub leaves the payment on MOR, sealed to you, as before, and Damgar shows it in Waiting. **On the Mac, Damgar pops up**: Dub only wakes Damgar's program, and Damgar draws its panel **inside Dub's window**, striped gold, "Drawn by Damgar · Dub cannot read or change this frame", the payment in plain words. **Authorise and sign** there. Dub never sees inside the frame: it only learns "signed" and closes it. (Damgar must be open on the same Mac; if not, the payment simply waits in Damgar.)
3. **A lane with a cap per act and a cap in all.** In Dub: the identity's **…** menu › **A lane from Damgar**: "At most, per payment" and the new **"In all, for the whole lane"**. In Damgar: **Lanes › Asked**, read it, **Grant this lane**. Then pay in Dub with **Under Dub's lane**: the chooser says "In all: … left of …"; past the cap per payment, or past what is left in all, Dub refuses and says what is left. Damgar's **Lanes › In force** shows the same count, and **Account › Under the lanes** keeps the record of each payment.

**What the cap in all is, and is not.** It is your rule for your own apps. Dub keeps it, and Damgar counts it. **No verifier judges it**: a total needs every act of the lane, some of them private, so no outsider can check it. A Dub that ignored it could keep paying up to the cap per payment until the lane is revoked; Damgar would then show the overspend in red.

### The vault transfer

**Waiting › To the vault** (it was in Settings). The transfer now names the act that declared your vault as what it follows: a transfer to yourself (the payment cMIP, draft 4). Every verifier checks it: one naming the vault declaration but paid by anyone else is **invalid** (step 4a). Transfers of the earlier form are still read.

### Pictures to look at first

In `docs/damgar-r3/`:
1. `mac-03-home.png`, `phone-01-home.png`: the four tiles (beside `damgar-home`).
2. `dub-02-damgar-panel.png`: Damgar's panel inside Dub's window (beside `dub-damgar-tip`).
3. `dub-04-chooser-in-all.png`: Dub's chooser, "In all: … left" (beside `dub-pay-chooser`).
4. `mac-21-lane-in-all.png` and `mac-23-overspent.png`: Lanes, In force, the cap in all counted; the overspend.
5. `mac-11-pasted.png`: a payment pasted by hand, in To pay.
6. `mac-12-to-pay-invoice.png`: the same card once the payee answered: the invoice to pay, the proof to paste.
7. `mac-04-identity-panel.png`, `mac-web-02-panel-collective.png`, `mac-web-03-for-the-collective.png`: the identity panel, a collective under the identity, acting as it.
8. `mac-31-kishib-panel.png`: Kišib's panel inside Damgar's window (Use one from Kišib).
9. `phone-web-01-make-words.png`: Make an identity, on the phone.

## 2. Every function of Damgar, and where it lives now

| Function | Before | Now |
| --- | --- | --- |
| Bring an identity by its words | identity window | first screen; panel › + Add › Bring one |
| **Make an identity** | none | first screen; + Add › Make one (new) |
| **Use one from Kišib** | none | first screen; + Add › Use one from Kišib (Mac only) |
| Switch identity; forget it here | identity window | identity panel; its menu › Remove from Damgar… (said plainly first) |
| The signing key's words | identity window | its menu › Words |
| Damgar's line, the card for Kišib | identity window | its menu › Line and homes |
| New words after a change of keys | identity window | its menu › New words from Kišib; the red line under the top |
| What you accept (first use; change; publish) | first screen; Settings | first screen; Settings › What you accept |
| Drafts from Dub, Edubba, Ummia; requests to pay; an unread message set aside | To sign | Waiting › To pay |
| Invoices to make, addresses to give, receipts to sign | To sign | Waiting › To receive |
| Lanes asked by apps | To sign | Lanes › Asked |
| Pay an invoice or address; paste the proof; check the chain again | Pay | Waiting › To pay, on the payment's own card |
| **Paste an act to sign** | none | Waiting › + Paste an act to sign (new) |
| Transfer to the vault; its vault invoice | Settings › The vault; Pay | Waiting › To the vault |
| The vault (read only) | Settings | Settings › Where you are paid (and To the vault) |
| Totals; requests and debts; what it does not judge | The account | Account › Summary |
| Payments, their proofs, how each was signed | The account | Account › Payments (cards, two menus) |
| **Payments other apps made under their lanes** | none | Account › Under the lanes (new) |
| Anchors paid | The account (a ticket on a payment) | Account › Anchors |
| Lanes: list, revoke (read back first) | Lanes | Lanes › In force; Ended |
| Damgar by itself (receipts, referral shares) | Lanes | Lanes › Damgar's own |
| The clock for lanes | Settings | Lanes › In force (accepted) |
| The receive-only node link | Settings | Lanes › Damgar's own (accepted) |
| Where you are paid (payee pointer, read back with costs) | Settings | Settings › Where you are paid |
| Relays | Settings | Settings › Homes and relays |
| Every step by hand | Settings | Settings › Every step by hand |
| For a collective: add, its Money area, a promise to pay, promises signed | For a collective (tab) | identity panel (a collective under the identity) › Waiting › For … ; its menu › A collective under it |
| **Ask Damgar, woken on the Mac** | none | Damgar's panel in the asking app's window (new) |
| **Tip** | none in Damgar | a card's signer menu › Tip (settled on the mockups) |
| Pairing this browser | pairing screen | unchanged |
| The web client's banner | a paragraph | one line with its "?" |

Nothing was dropped.

## 3. Where the build differs from the mockups, and why

| Built (`docs/damgar-r3/`) | Mockup | Difference, and why |
| --- | --- | --- |
| `mac-waiting-to-pay.png`, `mac-waiting-to-receive.png` | `damgar-waiting` | **Columns as the brief names them** (To pay, To receive, + Paste an act to sign, To the vault), not the mockup's (To sign, To pay, Requests and debts, For Collective Y): the brief came after the mockups and walks one payment on one card. Requests and debts moved to Account › Summary; For Collective Y appears only while acting as it. |
| `mac-26-summary.png` | `damgar-account` | "Totals" is **Summary**, as the brief names it; "What it does not judge" is behind the "?" of its one line; the mockup's "Latest" list is not repeated (Payments has every payment). |
| `mac-21-lane-in-all.png`, `mac-lanes-own.png` | `damgar-lanes` | Columns as the brief names them (Asked, In force, Damgar's own, Ended); the clock for lanes under In force, the node link under Damgar's own. "Kinds" are in the lane's plain words behind its "?". |
| `mac-settings-paid.png` | `damgar-settings` | As drawn; "Change it" folds the form; the brief's four parts. The transfer to the vault moved to Waiting (brief). Settings' folding sections (H45) give way to the column, each section one part. |
| `mac-24-act-menu.png`, `mac-25-signer-menu.png` | `damgar-act-menu`, `damgar-act-signer-menu` | **No Rely on it or Anchor it** in Damgar's act menu: Damgar signs no everyday act (relying is an Identity act signed in Dub or Edubba; an anchor is prepared there and paid here), so it uses the kit's `signs: false`, as Kišib does. **Tip** is in the signer menu for anyone but you. Follow and Mute (the kit always offers them) say that contacts are Dub's. |
| `mac-04-identity-panel.png` | `damgar-identity-panel` | As drawn. An identity or a collective without a display name shows by its short ID. The menu adds "New words from Kišib" and "A collective under it" (how one is added). |
| `dub-02-damgar-panel.png` | `dub-damgar-tip` | As drawn, with the payment's own plain words (the same as in Waiting) instead of a To / For / Amount table, and a single title ("A payment to make") for a tip and a Pay alike. |
| `dub-04-chooser-in-all.png` | `dub-pay-chooser` | As drawn: "In all: … left of …" on the lane's line, beside Dub's count of what was paid. |
| cards | all | **No time on a card**, as in Dub: no act carries a signed time, and a time not signed looks like one that is. |
| `phone-*` | `damgar-*-phone` | As drawn; a tile opens on its first part, the back arrow showing its column (the kit's way, as in Kišib). |

**Found while building, and done:**
- **Damgar could not read Dub's payments under the lane**: they are sealed to the payee, and Dub left only their locked acts at the identity's homes. To keep their record in Damgar (decided), Dub now delivers each such act's content key to the identity itself, as Damgar does for its own private acts; Damgar opens them and keeps the record. Stated in the grant limits cMIP's draft 3 (8.4) with its cost.
- **An answer to Dub's invoice request was a "problem" in Damgar**: both apps read the same inbox, and Damgar did not know Dub's requests. It is now kept with that payment's record (a refusal gives back to the cap in all).
- **Damgar's every signature now goes through the asynchronous path** (`signNow`), so an identity used through Kišib signs there; with its key held here, nothing changes.
- The words "in To sign" and "in Pay" in Damgar's notes now say "in Waiting" and "Waiting, To pay".

## 4. For the MOR lead

**Nothing for the MOR lead.** No MIR, MICS, freeze test or verdict of the core changed.
- **Step 4a** is the payment cMIP's (the Dubsar team's), decided in its draft 4: built in `cmips/payment` (`transfer_to_oneself`), with its tests.
- **The cap in all** changes no verdict: it is never in a grant; a verifier implementing the grant limits cMIP's draft 3 judges exactly what draft 2 judges. Said in the cMIP.
- **The WebAssembly the clients share changes**, because it carries `cmips/payment`: the display client's, Dub's and Damgar's web releases are rebuilt here, on the same bytes (`23588fea…`), each reproducible (`npm run test:build`). Kišib's, Ummia's and Edubba's releases still carry the earlier WebAssembly; they change with their next release, as usual.

## 5. Questions for Nobody, allegedly

One at a time; the next only once the one before is answered.

**Question 1. Should the cap in all be public?** Built: it is written in the lane's request and Damgar's record, both sealed to you, **never in the public grant**. A verifier has nothing to judge with it, and putting it in the grant under the earlier drafts would make every payment under the lane unknown to their readers.
- *My lean:* keep it private. A payee could not rely on it anyway.

**Question 2 (after question 1). Lanes for an identity used through Kišib.** For Damgar to keep the record of a payment Dub makes under its lane, Dub delivers the payment's key to your identity, which takes a signature with your own key. Through Kišib's runner that would be one panel per payment, which defeats the lane. Built: Dub does not deliver then; Damgar shows those acts as "sealed, not counted", and Dub's own count still refuses past the cap in all.
- *My lean:* in the runner's next draft, let Kišib sign, without a panel, a key delivery to the identity itself for an act signed under a lane that same app holds.

**Question 3 (after question 2). Rely and Anchor in Damgar's act menu.** The mockup drew them; built without them, since Damgar signs no everyday act.
- *My lean:* leave them out; relying and anchoring live in Dub, Edubba and Ummia.

**Question 4 (after question 3). The wake-up names the draft.** Dub wakes Damgar with the identity and the draft's ID (an ID, not the payment), so Damgar shows the right one when several wait.
- *My lean:* keep it; nothing of the payment travels outside MOR.

## 6. Human test steps

*Test identities only, regtest only. Checked against Damgar's and Dub's READMEs ("Using it").*

**Install once**, on the Mac, from the MOR folder:
```
git fetch origin && git checkout claude/damgar-kit-three-ways && git pull
cd clients/genesis && npm install && npm run wasm
cd ../desk && npm install && cd ../site && npm install && cd ../kit && npm install
cd ../dub && npm install && sh scripts/make-app.sh
cd ../damgar && npm install && sh scripts/make-app.sh
```
(On Linux, `make-desktop.sh` in place of `make-app.sh`.) For payments on regtest, as `docs/damgar-regtest.md` says: `npm start -- --regtest RUN_DIR` once in `clients/damgar`, the test wallet open.

**Damgar on the Mac**
1. Open **Damgar** from `~/Applications`. The four tiles: Waiting three bars, Account one, Lanes two, Settings two.
2. Open each tile; check its column (section 1). Top right: your identity by name. Open it: + Add shows Make one, Bring one, Use one from Kišib.
3. **Make one** (a test identity): write the 24 words, type back the three asked. Choose what you accept. Then switch back to your usual test identity in the panel.
4. If you hold a collective's Money area: the identity's **…** › **A collective under it**, its ID. In the panel, choose the collective under the identity: top right shows it; Waiting shows "For …". Choose it again to stop.

**Damgar on the phone** (the web client, once released and served at `damgar.dubsar.org`, as the README's "The web client" says)
1. The banner is one line; tap its "?".
2. Make or bring a test identity; accept; the tiles stack; open Waiting, then ← Back for its column.

**A tip from Dub, each of the three ways** (Dub and Damgar open on the same Mac, the same identity in both)
1. **By hand**: on someone's post, the act's ID › **Tip** › **By hand**, an amount, **Tip**. Copy the text. In Damgar: **Waiting › + Paste an act to sign**, paste, **Read it**; in To pay, **Sign it**. When the payee answers, the invoice appears on the card: pay it in the test wallet, paste the preimage, **Check it and sign my claim**.
2. **Ask Damgar**: Tip › **Ask Damgar** › Tip. Damgar's gold panel appears inside Dub's window: read it, **Authorise and sign**. Dub says "Damgar signed it". Try once with Damgar closed: Dub says it waits in Damgar.
3. **Under the lane**: see the next part.
4. **Pay from a profile**: open the payee's profile (the signer's menu › Open profile) › **Pay**: the same chooser, each way as above.

**A lane with a cap in all, spent to its end**
1. In Dub: your identity's **…** › **A lane from Damgar**: at most 2000 per payment, **In all 3000**. Ask.
2. In Damgar: **Lanes › Asked**: read "In all: at most 3 000 regtest satoshis…", **Grant this lane**.
3. In Dub: Tip 2500 under the lane: refused (cap per payment). Tip 1800: the invoice shows; pay it in the wallet, paste the proof. Pay 1000 from a profile under the lane.
4. Tip again: the chooser says "In all: 200 regtest satoshis left of 3 000". Try 500: refused, "200 left".
5. In Damgar: **Lanes › In force**: "3 000 · 2 800 spent, 200 left". **Account › Under the lanes**: the two payments.

**A transfer to the vault**
1. Declare a vault in Kišib (Paper › Change the vault), then give Damgar the new signing words (the identity's menu › New words from Kišib).
2. In Damgar: **Waiting › To the vault**: an entry, 3000, **Read it back**: read that it names your vault's declaration, a transfer to yourself. **Bind it**.
3. Make the invoice on the vault's node in the test wallet with the description hash shown; paste it; pay it; paste the preimage. **Account › Payments**: "moved to your vault".

## 7. What changed, file by file

- `cmips/payment`: `src/lib.rs` (step 4a, `transfer_to_oneself`), `tests/transfer.rs` (new).
- `cmips/cmip-grant-limits-draft-3.md` (new); `cmips/README.md`.
- `clients/damgar`: `src/page/view.ts`, `src/page/ui.ts` (the page on the kit), `src/page/app.ts`, `src/web/app.ts`; `src/damgar.ts` (Make; paste; Tip; woken; the record under the lanes and the cap in all; the runner; every signature through `signNow`; the vault transfer under draft 4; display names); `src/total.ts`, `src/wake.ts` (new); `src/accepted.ts` (opening through an opener); `src/ops.ts`, `src/server.ts`, `src/shapes.ts`; tests `browser.test.ts` (rewritten), `three-ways.test.ts` (new), `vault.test.ts`, `web-build.test.ts`, `answer-amount.test.ts`, `world.ts`; `built/` (the web release, rebuilt); README.
- `clients/dub` (only the pay chooser, waking Damgar and the lane's total): `src/damgar-link.ts` (new), `src/dub.ts` (`askDamgar`, `damgarAnswer`, the lane's total in `payWays` and `laneAsk`), `src/money.ts` (the lane asked with In all), `src/ops.ts`, `src/server.ts` (Damgar's origin framed), `src/shapes.ts`, `src/page/ui.ts` (Damgar's panel in the slot), `src/page/view.ts` (the chooser's words, the lane form's In all); `built/` (rebuilt); README.
- `clients/site/built`: the display client rebuilt on the new WebAssembly (Dub's release must carry the same bytes).
- `clients/kit`: unchanged.
- Records: F379; this report and `docs/damgar-r3/`.
