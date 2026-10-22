# The kit (mor-kit)

The Dubsar Suite's shared pieces: the look and the parts every app's page uses, built once (21 October 2026) from the redesign Nobody, allegedly, and the Suite lead drew and approved (`docs/design/suite-redesign.md`, the mockups in `docs/design/mockups/`). Dub is built on it first; Kišib, Damgar, Edubba and Ummia move onto it in later rounds.

**Test identities only, until MOR is frozen.**

## In plain words

Every app used to draw its own cards, menus and boxes, round after round, and they drifted apart. The kit is one set of pieces, the same everywhere:

- **The look.** Dark, dominantly black; Inter in its light weights (the font files are each app's own, served from the page's origin); each app's colour in pastel fills (Kišib glacier blue, Dub pearl, Damgar gold, Edubba emerald, Ummia coral), less in outlines; thin lines kept; red only for alarms.
- **Tiles**: big, an icon, a name, one line, and danger marks (three bars; the edge thickens with the level). A tile opens with **its column on the left** for its parts; on a phone the column comes first and folds away once a part is chosen, with a back arrow.
- **The feed box**: fills its space and scrolls inside, never the page; lenses or "point at / filter by" above it; under it, whose clock orders it ("Ordered by …'s clock", or each signer's own sequence where no clock is named, said as such).
- **The act card**: the signer's short ID and name **top left**, the act's short ID **bottom right**, each opening **its own menu** by a click or a tap (never a hover). Above a line, what you take, identical in every app and never signing: Copy ID, Copy ID link, Open profile; Copy act ID, Open what it answers or corrects, Why it's valid. Below, what changes something: Follow (adds to contacts) and Mute; Rely on it and Anchor it in every app, Correct it on one's own acts; then the app's own. One ✓ on a verified card; a void or contested act keeps its alarm line in red. Quiet labels: answers…, correction of…, signed under a grant, a pick or a nudge and who gave it.
- **The pop-up thread**: what an act answers or corrects, as a small feed box in a pop-up; opening something inside replaces its content, with a back arrow; closing returns you where you were.
- **The profile page**, light and friendly: the name, its own display name beneath where it differs, where it lives, the ID link, a red line only when there is trouble, Follow, Message, Pay, its feed, and quietly "Full record in Kišib".
- **The identity panel**, from the identity top right: the identities held, the one in use marked, **the collectives under each** (acting as a collective is the same gesture as switching), + Add (make, bring, and an empty place for "use one from Kišib", round 2), each identity's menu, **Remove said plainly first**, and a foot for the app itself.
- **Contacts and names**: one list, names first; **@ and To… offer names, never hashes**, a faint short ID only where two names collide; the app's own list, never the browser's autofill.
- **The slot**: an empty place where another app's panel will appear (Kišib's runner, Damgar's authorisation: round 2), drawn by that app in a frame this app cannot read or change.
- **Disclaimers in one line** with a "?" that opens the rest. No finding number on any screen.

The kit holds no app's logic: it is given plain words and IDs written for people, draws them, and hands every choice back to the app.

## Precisely

| File | What |
| --- | --- |
| `src/style.ts` | `KIT_STYLE`, the one stylesheet (every class `k-…`; nothing inline, so pages run under `style-src 'self'`); `APPS`, each app's colour and pastel; an app puts `k-page k-APP` on its root. `FONTS`: the files the style names, served by each app beside its page (Inter 4.1, SIL OFL 1.1; Dub's `static/fonts/` holds them today). |
| `src/html.ts` | The pieces as HTML strings, usable anywhere (Node included): `card` (and its `KitAct`, `KitWho`, `KitLabel`), `signerMenu`, `actMenu` (`MenuItem`), `top`, `appMark`, `switcher`, `meButton`, `contactsButton`, `tiles` (`Tile`, `danger`, `ICONS`), `opened` (the column), `lenses`, `pointRow`, `feedBox`, `clockLine`, `typingBox`, `say` (one-line disclaimers), `note`, `profile`, `identityPanel`, `removeSaid`, `contactsPanel`, `suggestions`, `shortForm`, `colliding`, `slotWords`, `e` (escape). |
| `src/dom.ts` | Their clicks in the browser: `attachCards` (both menus of every card, the copies done by the kit, every other choice handed to the app's `CardHost`), `attachClosing` (a click elsewhere or Escape closes a menu, then a panel, then the pop-up), `popAt`, `closeMenu`, `openPanel`, `redrawPanel`, `closePanel`, `panelOpen`, `Popup` (the pop-up thread: `show`, `replace`, `back`, `close`), `attachColumn`, `attachNames` and `namedIn` (@ and To…), `copy`, `openSlot` and `SLOT_RULES`. |
| `src/index.ts` | All of it. |

### The slot's rules (`SLOT_RULES`)

1. Only an origin the host app was given as the other app's is framed; any other is refused and nothing is drawn.
2. The frame is sandboxed without `allow-same-origin`: what is inside has an origin of its own, so the host cannot read or change it, and it cannot reach the host's page, storage or keys.
3. No navigation of the host, no pop-ups, no device features, no referrer.
4. Its edge is striped in the other app's colour and says who drew it ("Drawn by Kišib · Dub cannot read or change this frame"); the host draws only the edge and a way to close.
5. What passes between them is a message the other app posts to the host's window, taken only from that frame. *The gap, accepted (decided): a malicious host could cover the frame or trick a click.*

A host's content security policy must allow the other app's origin in `frame-src`; Dub's does not yet, since nothing fills the slot before round 2.

## Tests

```
npm install
npm test     # headless Chromium at /opt/pw-browsers or MOR_CHROMIUM
MOR_SCREENSHOTS=DIR npm test   # keeps a picture of every piece, at both sizes
```

`test/kit.test.ts` draws every piece on one page (`test/demo.ts`, invented people: Max, Pa twice, Ph, T, Collective Y), served under a strict content security policy, and uses it by clicks alone at a Mac's size (1280×800) and a phone's (390×844): both menus of a card and their identical top halves, nothing on hover, Copy ID / ID link / act ID landing in the clipboard, a click elsewhere and Escape closing; a collective appended, a grant label, an alarm in red, one ✓; the clock line; the feed box scrolling inside, never the page; Inter loaded light; the pop-up thread, a step inside with its back arrow, Back, Close; the identity panel (the one in use marked, a collective under its identity acted as, + Add with Kišib's place empty, the identity's menu, Remove said before anything is removed); @ by names with two names colliding (a faint short ID on each, none on a name alone) and To… keeping the ID beside the name; Contacts found by name; tiles, danger marks, the alarm, the column folding on a phone; a disclaimer opened by its "?"; the profile; the slot (an origin not allowed refused, the frame unreadable from the host, sandboxed, its words, its message taken, the host unreachable from inside). No console error, nothing the policy refused, no finding number anywhere.

Dub's own tests use the kit through Dub's page (`clients/dub/test/browser.test.ts`, `web.test.ts`, and `clients/desk/test/dub-redesign.test.ts`).
