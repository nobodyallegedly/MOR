# The Dubsar Suite, human test v3: one walkthrough in sittings

*For Nobody, allegedly, by the Dubsar Suite lead, 23 October 2026. Gathered from the human test steps of every round of the redesign: the kit and Dub (round 1), Kišib and the runner (round 2, drafts 2 and 3), Damgar (round 3), Edubba (round 4 and its follow-up), the splits round (round 5), and Ummia (round 6, added when its report lands). Test identities only, regtest only, never real money. Each sitting stands alone; do them in order the first time, since later ones use what earlier ones made.*

*What to write down, at every step: what you expected, what you saw, and anything that surprised you, in your own words. A finding is anything that is not obvious to you: that is the point of the test.*

## Before the first sitting: the Mac, once

**Bring the Mac to main**, in Terminal, from the MOR folder:
```
git checkout main && git pull
cd clients/genesis && npm install && npm run wasm
cd ../kit && npm install && cd ../barebone && npm install
cd ../desk && npm install && cd ../site && npm install
cd ../dub && npm install && sh scripts/make-app.sh
cd ../kishib && npm install && sh scripts/make-app.sh
cd ../damgar && npm install && sh scripts/make-app.sh
cd ../desk && sh scripts/make-app.sh
cd ../ummia && npm install && sh scripts/make-app.sh
```
- **Apple's command-line tools** first, if not yet installed (`xcode-select --install`): without them Kišib's seal in the menu bar is not built, and its script says so.
- **Money on regtest**: once, in `clients/damgar`, `npm start -- --regtest RUN_DIR`, with the test wallet open, as `docs/damgar-regtest.md` says.
- **People and devices**: Sittings 6 and 8 run on three devices, **Max** (the Mac), **iPa** (the iPad) and **iPh** (the iPhone); the iPad and the iPhone use the web clients, so a server session must have served the releases built on main first. Other sittings need a second identity now and then: a second identity on the Mac is enough.
- **The phone**: the web clients at `*.dubsar.org` show the new apps only once a server session has served the releases built on main. Until then, skip the phone parts (Sitting 10).

## Sitting 1. Kišib, the identity hub (about 30 minutes)

1. Open **Kišib**. Four tiles, with their bars: Identities one, Runner two, Paper three, Collectives three. Top right: "Holds nothing · runner off". The seal in the menu bar: **hollow**.
2. **Paper**: a quiet door, nothing else on screen. Open it: Check the paper, Change keys, Change the vault, Name a successor, and Escape apart.
3. **Identities › Make an identity**: a home, relays if you like; Read it back; Sign it; write the **chain words**, three typed back; then the **signing words**, three back. Keep both papers. This is your test identity for the sittings that follow ("Max" below).
4. **Paper › Check the paper**: the chain words: "these are the right words", and which key they give.
5. **Identities › Read a record**: Max's record (homes, receipts, keys, names, lines).
6. *(Later, after Sitting 3, once Dub has made acts.)* **Paper › Change keys** for Max: its chain words, and each app's card pasted whole (from each app's identity panel, Line and homes). The steps along the top; **the new chain paper first** (written, three back), then the change signed and sent; then **the new signing words**. Carry the new signing words to each app (each one says the key changed, with the box right under it). The old chain paper given again: refused, said plainly.

## Sitting 2. The runner: Kišib signing for Dub (about 40 minutes)

1. **Runner › On or off**: read the risk. Two different passphrases: refused. The same twice, tick, **Turn it on**. The seal: **full**. In Terminal, `cat ~/mor-kishib/runner.json`: only `label`, `kdf`, `cipher`, `nonce`, `sealed`; no ID, no words.
2. **Identities › Held here**: give Max by its ID, a home and its **signing** words. Top right names it.
3. In **Dub**: the identity panel (top right) › **+ Add › Use one from Kišib** › Ask Kišib to pair. A **1** beside the seal while it waits.
4. In **Kišib › Runner › Apps**: the same code; tick **Dub may open what is sealed to this identity**; **Approve**. In Dub: I approved it › **Use it**.
5. Post in Dub: **Kišib's panel appears inside Dub's window**, striped blue, "Drawn by Kišib · Dub cannot read or change this frame". Sign it. Post again ticking **Always yes for Dub's posts and replies**; a third post: no panel.
6. Close a panel with its ×: Dub says Kišib waits; **Runner › Waiting** has it.
7. **Runner › Signed**: each act a card; its act ID › Why it's valid.
8. **Lock and quit**: the seal's menu › **Lock now** (a padlock; the passphrase on Kišib's page: full again); Runner › **Lock now** on the page; the seal's menu › **Quit Kišib** (reopened: a padlock, the passphrase asked); **Quit Kišib** on the page ("Kišib is not running"; the seal's **Open Kišib** starts it). While locked, Dub says **Kišib is locked**; after the passphrase, Dub signs again with no new pairing.
9. **Opening, per identity**: give Kišib a second test identity; approve Dub for both, "may open" ticked for **one** only. From another identity, send each a private message: Dub reads the first; for the second it says it can send but not read, and how to allow it. Tick it in Kišib: Dub reads it.
10. **Revoke** Dub in Apps; post in Dub: refused. Pair again for the next sittings.
11. *(At the end of the day)* **Turn it off** from the seal's menu: asked first; everything erased; the seal hollow; `runner.json` gone.

## Sitting 3. Dub, the customers' app (about 40 minutes)

1. Dub opens on **Public**. Top: **Public · Private · Purchases**. Under the feed: "Ordered by the Dubsar clock"; each card's time, faint, top right, "· by the Dubsar clock". A post too new for the clock shows "the signer's own hint", or no time.
2. **Contacts** (top left): add someone by their ID link, with a name; the name shows, never a hash.
3. Typing box: "Hello @", choose them by name; post. A photo; a short MP4 film (Play); **an M4A recording** (Audio; it plays after its check). A file that is not an M4A under Audio: refused in plain words.
4. On a card: the short ID **top left** (the signer's menu), then the act's ID **bottom right** (the act's menu); nothing opens on hover. Copy act ID, Open what it answers, Why it's valid.
5. Someone's post: **Rely on it** (type RELY). Your own: **Correct it**; "correction of…", the original from its menu.
6. **Relay** lens: texts and envelopes only; tick another layer.
7. **Private**: + A new conversation; send; + Cc someone; the Cc label.
8. Identity panel › the identity's **…** › **Remove from Dub…**: read what it says; cancel.

## Sitting 4. Damgar and money (about 60 minutes)

*The regtest network has been running since 19 October and its last block is old: if a payment is refused because a node is "not synced", press **Mine** once in the test wallet.*
1. Open **Damgar**: Waiting three bars, Account one, Lanes two, Settings two. Each tile's column. Top right: Max, by name.
2. **A tip, by hand**: in Dub, a post's act ID › **Tip** › **By hand**; copy. In Damgar, **Waiting › + Paste an act to sign**, Read it, Sign it; when the invoice comes, pay it in the test wallet, paste the preimage, **Check it and sign my claim**.
3. **Ask Damgar**: Tip › Ask Damgar: **Damgar's gold panel inside Dub's window**; Authorise and sign. Once with Damgar closed: it waits in Damgar.
4. **A lane with a cap in all**: Dub, the identity's **…** › **A lane from Damgar**: at most 2000 a payment, **in all 3000**; its **Until** prefilled with the Dubsar clock. In Damgar, **Lanes › Asked**: read it, **Grant this lane**. In Dub: 2500 refused (per payment); 1800 paid; 1000 from a profile (Open profile › **Pay**); the chooser says "200 left of 3 000"; 500 refused. Damgar: **Lanes › In force** "2 800 spent, 200 left"; **Account › Under the lanes** lists both.
5. **A transfer to the vault**: declare a vault in Kišib (Paper › Change the vault), give Damgar the new words; **Waiting › To the vault**, 3000, Read it back (it names your vault's declaration), **Bind it**; the invoice from the vault's node; pay; paste; **Account › Payments**: "moved to your vault".
6. **Rely and Anchor a receipt**: Account › Payments › a receipt's act ID › **Rely on it** (RELY). Then **Anchor it**: the test anchoring service's ID, Read its offer, a tier, sign; pay its invoice in Waiting › To pay; **Account › Anchors** lists it.

## Sitting 5. Edubba, the agreements hub (about 45 minutes)

1. Open **Edubba**: four tiles, Agents two bars, Collectives three, Publishing two, Vows two. Top right: Max, with the collectives under it; + Add (Make one, Bring one, Use one from Kišib); the foot, **This app** (homes and relays).
2. **Agents › + Add an agent**: the API key, Machine, allegedly, yourself as owner; read the terms, sign. **Talk**: write to it; its answer in the feed. **Queue**, **Terms**.
3. **Mind › its diary › Read it…**: the act ("I have read Machine, allegedly's diary, on …", to the agent, public). **Not now** once: nothing opens. Then **Sign it, then open the diary**: it opens once a home accepted the act. In Dub, the act is a public post from you to the agent.
4. **Publishing › A protected file**: **An audio (M4A)**, a title, a price; Read it back (stripped by the audio Module), Sign. A file that is not an M4A: refused, nothing signed. **Published here**.
5. **Vows › A new vow**: read back, sign. **Track**: point at yourself; the vow shows.
6. **Use one from Kišib** (the runner on): pair as in Sitting 2; a vow refused in plain words ("Edubba signs for it only in Collectives, To sign"); To sign signs through Kišib's panel inside Edubba's window.
7. After a change of keys in Kišib (Sitting 1, step 6): the warning, and the box for the new words right under it.

## Sitting 6. A real collective, three people (about 45 minutes)

*Three devices, three identities, as Nobody, allegedly, runs it: **Max** on the Mac (the apps), **iPa** on the iPad and **iPh** on the iPhone (the web clients: Dub, Edubba, Damgar, once served, see Sitting 10). Kišib's runner and the agents stay on the Mac.*
1. In Max's Edubba: **Collectives › + Found a collective**, with iPa and iPh as members (by their names in the contacts). The column: "1 of 3 signed".
2. In iPa's and iPh's Edubba (the web client): **Collectives › To sign**: the founding in plain words; Sign it. The count goes to "3 of 3"; **Found it**; each share shown once, three words back.
3. The collective's tabs: **Act, Members, Money, Keepers, To sign**; **Its constitution, in plain words** top right.
4. The identity panel: choose the collective under Max: you act as it. Post for it in **Act**: signed with your own member key.
5. **Through Kišib**: with Max used through Kišib in Dub, its **…** › **A collective under it**, the collective's ID. In Kišib, **Add it**. In Dub, choose the collective and post: Kišib's panel says "as the collective …, with … own member key".

## Sitting 7. Buying, opening and contesting (about 40 minutes)

1. A second identity buys Max's protected audio (Sitting 5) in **Dub** (Buy, from its act menu), pays through Damgar, and Max's Edubba delivers the key (**Published here › Deliver keys to buyers**, or by itself). In the buyer's **Dub › Purchases**: **▶ Play**.
2. The buyer's **Purchases**: the file's act menu, below the line, **Contest it…** (shown only once paid); say what was not kept, in words if you want. In Max's **Edubba › Publishing › Sales**: the contest beside the sale, in red. The same contest signed by anyone else shows nothing.
3. The buyer buys Max's vow (Sitting 5); in Purchases, the vow's own form: **Confirm: it was kept** or **Contest it…**. In Edubba's **Vows › Track**, the sale and its state.
4. Where a payment was not verified, every screen says **unknown**, with its reason, never "paid" or "none".

## Sitting 8. A split between three people (about 60 minutes)

*The same three devices: **Max** (River below, the proposer, on the Mac), **iPa** (Pa) and **iPh** (Ana), each in its own Dub, Damgar and Edubba; a fourth identity buys (a second identity on the Mac, say). The test split service running on the Mac (`clients/split-service/README.md`).*
1. In River's Edubba, add Pa and Ana to the contacts by name.
2. **Publishing › A protected file › Details › Who shares in it**: Pa 30, Ana 20, River 50, referral 10, the split service and the key it made for the deal (copy the deal's own ID shown there; run the service's `key` command; paste the key). **Read it back**: it says first that the work then belongs to the deal, and every payment for it, a tip included, goes to the split service. Sign.
3. In Pa's and Ana's Edubba: **Publishing › To sign**: read it, Sign it. In River's: **Shared deals**, Look for signatures: announced only once both signed.
4. A fourth identity, in Dub: **Buy** on the post says "This work is shared: River (50%), Pa (30%), Ana (20%)…". Pay. In each party's **Damgar › Account › Shared deals**: the sale and their own payout. The file plays in the buyer's Purchases.
5. The buyer contests it: Pa's and Ana's **Edubba › Sales › Shared works** show the contest beside the sale.
6. River's **Publishing › A shared post** (the same people); a tip on it from Dub: the line says it is shared, the tip is split. A tip on River's own unshared post: to River alone.
7. Refused in plain words: shares not adding to 100; the service as one of the people; a person by an ID alone.

## Sitting 9. Ummia, the developers' app (about 40 minutes)

1. **Bring Max** into Ummia (Bring one: its ID, its signing words from Dub, a home). Identity menu › **Relays**: where your acts go, and the relays Look asks. Four tiles: Look one bar, Discuss one, Publish two, Choose two.
2. **Publish › A cMIP or Module**: a short text (`# cMIP: My notes, draft 1` and a line). **Read it back, with its hash**: the hash first; **Copy**; **Sign and publish**.
3. **Its card** appears: the title, a summary, "Start a discussion thread" ticked; read back, sign.
4. **Look**: the cMIP with your card's title. **Its page**: the card, the thread, you as creator. In Dub, the card is a plain post; reply to the thread from Dub. In Ummia, **Discuss › Discussions**: Dub's reply is there; **Reply, as a signed document**.
5. **Published here › A later card**: a new summary; on its page the new one counts, "1 earlier card, superseded".
6. **Following a developer**: a second identity publishes two releases of one folder (0.3, then 0.4 naming 0.3). In Max's Look, the 0.4 card says what changed since 0.3. Its signer's menu › **Follow their releases**: **Saved** gains their releases; Dub's contacts include them (the same follow list). **Its line** shows both.
7. **Choose**: on the second identity's cMIP card, the act menu › **Add to accepted list**. **Choose › Every layer** lists it; filtered by layer, Development shows it and Money does not. **+ Accept by hash**, **Remove**, **Publish it**.
8. **A core text's page**: Look › A specification's page, the Text MIR's hash: its own heading as its title, no card signed for the core. **Write a card of your own** (through Kišib's panel if Max is used through Kišib): shown as your word.

## Sitting 10. The phone

*The releases built on main are served (Mac and server session, 24 October). Noted there: Damgar's and Edubba's banners take two lines on a phone, even at 430 pixels; Kišib's "?" wraps at 375. Only Kišib shows its tiles before an identity is there; the others open on making or bringing one.*
1. **Dub** in Safari: the banner one line with a "?"; make or bring an identity; post; @ by name (Dub's own list, not the keyboard's); a card's IDs open as a sheet from the bottom; Private full screen with a back arrow; a profile's Message and Pay.
2. **Kišib**: three tiles, no Runner; a tile's column first, then the part, a back arrow; Paper's quiet door.
3. **Damgar**: the banner; make or bring; the tiles stack; Waiting, then ← Back for its column.
4. **Edubba**: three tiles, no Agents; bring an identity; Collectives › To sign.

## Sitting 11. Nakišib, two Macs (about 60 minutes)

*The offline M1 Mac and the everyday Mac. Test identities only: the real identity is born at step 17. Nakišib's zip was built on the everyday Mac on 24 October; its fingerprint, **e5bd1a7d566be0a2885dc6aa0ddcdad84dfdd6bee8d43afe86771d866672d465**, written on paper, must reach the offline Mac by another road than the stick.*

1. **Prepare the offline Mac, once**: erase it (Erase All Content and Settings), set it up with no Apple Account, no Wi-Fi joined, Bluetooth and location off; from then on nothing plugged in but power and the stick. The Wi-Fi icon crossed out.
2. **Carry Nakišib**: `~/Applications/Nakisib.zip` to the stick. On the offline Mac, into Documents; Terminal, `shasum -a 256 ` and drag the zip in: **every character the same as the paper**, or delete it and start again. Unzip, move Nakišib to Applications, Control-click › Open the first time. Its own window (not Safari), the stone seal in the Dock, "This Mac should never connect again.", three tiles, "Offline · keeps nothing secret".
3. **A test identity from Nakišib's commitment**: Nakišib › A new identity › **Draw a paper of 24 words**; write them; three back (a wrong one refused). Write the commitment to the stick. On the everyday Mac, Kišib › Identities › **Make one with Nakišib**: the file, homes and relays; read back (the same commitment as Nakišib showed); sign; its signing words; bring it into Dub and post once. *(If Kišib says its Nakišib part is missing: `cd clients/kishib && npm run airgap`, then reopen Kišib.)*
4. **A change of keys through Nakišib**: Kišib › Paper › **Change keys with Nakišib**, read back, sign, **Write the request for Nakišib** (to the stick). Nakišib › Change keys › the file: "CONSEQUENTIAL — READ BEFORE SIGNING", the new signing key's fingerprint the same as Kišib's. Type the paper (a wrong word first: refused); **the new paper** shown, written, three back (one wrong first: nothing signed); the Module's summary ("FRESH SEED"); type **SIGN**; write the answer to the stick. Kišib › **Read Nakišib's answer**: "exactly the change Kišib asked for", then "It counts"; the new signing words; give them to Dub.
5. **Its memory**: Nakišib › What it signed: one line. The same request again: the same bytes. A second change with the **first** paper: refused ("an earlier, spent one"); with the new paper: it works.
6. **Nothing kept**: quit Nakišib; in Finder, Home › `mor-nakisib`: one file, `memory.cbor`, nothing else.

## Also to check on the Mac, once

- **The Dubsar clock** is checked: the Mac and server session of 24 October found `1c743854…f453` is the clock running, still stamping. dubsar.org's feed labels it "the dubsar.org clock"; the apps say "the Dubsar clock": the same identity.
- **Known, not yet built** (no finding needed): test collectives still offered in Edubba (to be removed); the connector's draft tools (to be removed); the "Dubsar" titles; the deal's own payee identity (to go once F392 is on main); a collective's proposal signed with the member key held in Kišib; in Nakišib, collectives' shares, the clean-device key and rule 8a's two rare exceptions (refused, pointing to `mor-signer`).
