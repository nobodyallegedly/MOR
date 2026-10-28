// Dub's page, rebuilt on the Dubsar Suite's kit (`clients/kit`), as the
// redesign of 20–21 October 2026 drew it (docs/design/suite-redesign.md,
// the mockups in docs/design/mockups): no tiles; a switch at the top,
// Public · Private · Purchases; Contacts top left; the identity top right.
// The same page on the Mac (the program) and in the web client (`web`).
// HTML strings only: what a click does is `ui.ts`. Everything from the
// program, from relays or typed by a person is escaped.

import {
  APPS,
  KIT_STYLE,
  NOT_STAMPED,
  appMark,
  card,
  clockLine,
  contactsButton,
  e,
  feedBox,
  lenses,
  note,
  meButton,
  pointRow,
  say,
  shortForm,
  switcher,
  top,
  typingBox,
  type KitAct,
  type KitLabel,
  type KitWho,
} from '../../../kit/src/index.ts';
import { cardWords } from '../../../genesis/src/card-words.ts';
import { PUBLISH_WARNING, type Item, type Line, type Message, type PayWays, type Purchase, type State, type Suggested, type Who } from '../shapes.ts';

// What the other apps take from Dub's page today (Kišib, Damgar, Ummia, Edubba): kept as they were, in `family.ts`.
export { STYLE, proposal, share, SIGNING_LABEL, leaveRead, shareTypeBack, post } from './family.ts';
export { e, note, PUBLISH_WARNING };
export type { Item, Line, Message, State, Suggested, Who };

export const NAME = 'Dub';
/** Asked by Nobody, allegedly, for the first screen. Kept equal to `TEST_ONLY` in `dub.ts` (a test checks). */
export const TEST_ONLY = 'Test identities only, until MOR is frozen';

/** Dub's colour: the Text layer's warm pearl (H36), in pastel fills (decided, 21 October 2026). */
export const TINT = { layer: APPS.dub.colour, pastel: APPS.dub.pastel } as const;

/**
 * The web client's banner, on every page it shows (F281: "With risks
 * stated, for testing purpose only"), in one line with a "?" that opens the
 * rest: for testing only, and both risks in plain words. It is in the page's
 * HTML itself (`static/web.html`, written there by the build), outside what
 * the script draws, so it shows even when the script does not run.
 */
export const WEB_BANNER = `<details class="k-say dub-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY}.<span class="k-help" aria-label="more">?</span></summary><div class="k-more-text"><p>Two risks, in plain words:</p>
<ol><li>Whoever serves this page’s code at the moment an identity is made here could copy its keys.</li>
<li>This browser’s storage, where the identity’s signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div></details>`;

/** Said wherever the web client keeps the signing key. */
export const KEPT_SAY =
  'Its signing key and its encryption key are kept in this browser’s storage (IndexedDB), as they are, not locked: the only lock this page could put on them is one it could open by itself, and so could whatever else runs in this page. Its signing key’s words are the way out: write them down.';

/** The page's style: the kit's, and Dub's few own pieces. */
export const PAGE_STYLE = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.dub-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.dub-banner strong{font-weight:400;color:var(--k-text)}
.dub-banner ol{margin:4px 0;padding-left:1.4em}
.dub-center{max-width:820px;margin:0 auto;width:100%}
.dub-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.dub-first h2{font-size:24px;margin:8px 0 4px}
.dub-first form{margin:6px 0}
.dub-picked{font-size:12.5px;color:var(--k-soft)}
.dub-code{font-size:22px;letter-spacing:.14em;color:var(--k-text);margin:6px 0}
.dub-film{display:flex;align-items:center;gap:10px;border:1px solid var(--k-line);border-radius:12px;padding:10px 12px;margin:6px 0;font-size:14px;color:var(--k-soft)}
.dub-sealed{border:1px solid var(--k-line);border-radius:12px;padding:8px 12px;margin:6px 0}
.dub-sealed img{margin:6px 0}
.dub-convs{width:300px;flex:none;border-right:1px solid var(--k-line);display:flex;flex-direction:column;min-height:0}
#private-notes{padding:0 14px 10px}
.dub-convs .dub-find{margin:12px;width:calc(100% - 24px)}
.dub-convs .dub-list{overflow:auto;flex:1;min-height:0}
.dub-conv{display:flex;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--k-line);width:100%;text-align:left}
.dub-conv.k-on{background:var(--k-wash2)}
.dub-conv .k-n{font-size:14.5px}
.dub-conv .dub-l{font-size:13px;color:var(--k-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;display:block}
.dub-conv .dub-w{margin-left:auto;font-size:11.5px;color:var(--k-faint);align-self:flex-start;white-space:nowrap}
.dub-conv .k-count{background:var(--k-p);color:var(--k-ink);margin-left:6px}
.dub-thread{flex:1;min-width:0;display:flex;flex-direction:column;padding:14px 22px 16px;min-height:0}
.dub-thread .dub-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.dub-thread .dub-head h2{font-size:20px}
.dub-cc{font-size:12.5px;color:var(--k-soft)}
#ccs{display:contents}
#ccs .k-chip{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ccs .k-chip .k-x{margin-left:4px;flex:none}
.dub-field{display:flex;gap:8px;align-items:center}
.dub-field input{flex:1}
.dub-modal-form textarea{min-height:5em}
.dub-ways{border-top:1px solid var(--k-line);margin:8px 0}
.dub-ways label{display:flex;gap:10px;align-items:flex-start;padding:10px 6px;border-bottom:1px solid var(--k-line);margin:0;color:var(--k-text);font-size:14.5px;cursor:pointer}
.dub-ways label.dub-closed{color:var(--k-faint);cursor:default}
.dub-ways input{margin-top:4px}
.dub-ways .k-small{display:block}
.dub-hand{width:100%;min-height:6em;font:12px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.dub-note-line{font-size:13px;color:var(--k-soft);margin:0 0 8px}
@media (max-width:600px){
  .dub-banner{padding:5px 10px}
  .dub-private .dub-convs{width:100%;border-right:0}
  .dub-private .dub-thread{display:none;padding:10px 12px}
  .dub-private.k-chosen .dub-convs{display:none}
  .dub-private.k-chosen .dub-thread{display:flex}
  .dub-private .k-back{display:inline-flex}
  .dub-first{padding:16px 14px 30px}
  .k-typing .dub-l{display:none}
}
.dub-film .k-btn{white-space:nowrap}
@media (min-width:601px){.dub-private .k-back{display:none}}`;

// ---------------------------------------------------------------- who, as the kit draws it

/** An identity as the kit's card shows it: the name given here, else its display name; its own display name beneath where it differs. */
export function kitWho(w: Who, collective = false): KitWho {
  const own = w.names[0] ?? null;
  return { id: w.id, form: w.form, link: w.link, name: w.pet ?? own, ownName: w.pet && own && own !== w.pet ? own : null, me: w.me, followed: w.followed, muted: w.muted, collective };
}

/** The name an identity is called by, here. */
export const nameOf = (w: Who) => (w.me ? 'you' : (w.pet ?? w.names[0] ?? shortForm(w.form)));

const bad = (standing: string) => /void|contest|invalid|stolen/.test(standing);

// ---------------------------------------------------------------- an act, as a card

/** A post (or another act, in the Relay lens) as the kit's act card. */
export function itemAct(it: Item, collectives: string[] = []): KitAct {
  const labels: KitLabel[] = [];
  if (it.repost) labels.push({ text: `↻ ${nameOf(it.repost.by)} reposted ${nameOf(it.repost.of)}’s sealed post` });
  for (const a of it.answers) labels.push({ text: `↳ answers ${a.who ? nameOf(a.who) : 'an act not found'}${a.snippet ? ` · “${a.snippet}”` : ` · ${shortForm(a.id.length === 64 ? actFormOf(a.id) : a.id)}`}` });
  if (it.corrects) labels.push({ text: `Correction of ${shortForm(actFormOf(it.corrects))}, which stays as signed` });
  if (it.correctedBy?.length) labels.push({ text: `Corrected by ${it.correctedBy.map((c) => shortForm(actFormOf(c))).join(', ')}: shown as it was signed` });
  if (it.authority) labels.push({ text: it.authority.words, tone: it.authority.backed ? undefined : 'warn' });
  for (const l of it.labels ?? []) labels.push(l);
  if (it.toMe) labels.push({ text: 'to you' });
  const alarm = it.problem && bad(it.problem) ? it.problem : null;
  if (it.problem && !alarm) labels.push({ text: it.problem, tone: 'warn' });
  const html = [
    ...it.pictures.map((x) => (x.src ? `<figure><img src="${e(x.src)}" width="${x.width}" height="${x.height}" alt=""></figure>` : `<div class="k-label k-warn">A picture not shown: ${e(x.problem ?? 'unknown')}.</div>`)),
    ...(it.films ?? []).map((f) =>
      f.problem
        ? `<div class="k-label k-warn">A film not shown: ${e(f.problem)}.</div>`
        : `<div class="dub-film" data-film="${e(f.publication)}" data-film-signer="${e(f.signer)}"><button type="button" class="k-btn k-p" data-action="play">▶ Play the film</button><span>${e(sizeWords(f.size))}, checked before it plays</span></div>`,
    ),
    // A recording, as a film is (the audio Module, rule 13): its bytes fetched and checked only when asked to play.
    ...(it.recordings ?? []).map((r) =>
      r.problem
        ? `<div class="k-label k-warn">A recording not shown: ${e(r.problem)}.</div>`
        : `<div class="dub-film" data-recording="${e(r.publication)}" data-recording-signer="${e(r.signer)}"><button type="button" class="k-btn k-p" data-action="play-recording">▶ Play the recording</button><span>${e(sizeWords(r.size))}, checked before it plays</span></div>`,
    ),
    it.doc ? `<a class="k-doc" href="${e(it.doc.link)}" target="_blank" rel="noopener noreferrer"><span dir="auto">${e(it.doc.title)}</span><br><span class="k-small k-soft">A long-form document: open it in the reader</span></a>` : '',
    it.sealed ? sealedBox(it) : '',
    it.vow ? vowBox(it) : '',
  ].join('');
  const answered = it.answers.find((a) => a.id !== it.corrects);
  return {
    id: it.id,
    form: it.form,
    signer: kitWho(it.who, collectives.includes(it.who.id)),
    when: it.when ?? null,
    unstamped: it.unstamped && !it.when ? NOT_STAMPED : null,
    hint: it.hint ?? null,
    kind: it.what ? it.what : it.vow ? 'vow' : it.sealed ? `sealed ${it.sealed.media}` : null,
    labels,
    text: it.repost || it.what ? '' : it.text,
    html,
    verified: !alarm && (it.standing === 'valid' || !!it.authority?.backed),
    alarm,
    answers: answered ? { id: answered.id, signer: answered.who?.id ?? null } : null,
    corrects: it.corrects ? { id: it.corrects, signer: it.who.id } : null,
    own: it.who.me,
  };
}

/** A private message as the kit's act card: its Cc for every recipient to see, a collective appended where its membership checks. */
export function messageAct(m: Message): KitAct {
  const labels: KitLabel[] = [];
  if (m.cc.length) labels.push({ text: `Cc: ${m.cc.map(nameOf).join(', ')}` });
  if (m.of && !m.of.checked) labels.push({ text: `appends a collective whose membership did not check (${m.of.why ?? 'not checked'}): not shown as theirs`, tone: 'warn' });
  const alarm = m.problem && bad(m.problem) ? m.problem : null;
  if (m.problem && !alarm) labels.push({ text: m.problem, tone: 'warn' });
  return {
    id: m.key,
    form: m.form || m.key,
    signer: kitWho(m.who),
    of: m.of?.checked ? (m.of.name ?? shortForm(actFormOf(m.of.id, 'mid'))) : null,
    // A card shows the Dubsar clock's time, or the signer's own hint, or nothing (decided 23 October 2026): a message sealed to you is not one the clock holds; the thread keeps the order this app found them in.
    when: null,
    hint: m.hint ?? null,
    labels,
    text: m.text,
    verified: !alarm && m.standing === 'valid',
    alarm,
    own: m.dir === 'out',
  };
}

/** A purchase as the kit's act card. */
export function purchaseAct(p: Purchase): KitAct {
  return {
    id: p.id,
    form: p.form,
    signer: kitWho(p.seller),
    kind: `${p.what} · bought`,
    labels: [{ text: p.state }, ...(p.price ? [{ text: p.price }] : []), ...contestLabels(p)],
    text: p.kind === 'vow' ? p.text : '',
    html: p.picture
      ? `<figure><img src="${e(p.picture)}" alt="The picture, opened"></figure>`
      : p.play
        ? sealedPlayBox(p.play)
        : p.kind === 'file' && p.text
          ? `<div class="dub-sealed"><div class="k-txt" dir="auto">${e(p.text)}</div></div>`
          : '',
    verified: true,
  };
}

/** The buyer's contests shown beside a purchase (F386); "unknown" where the core cannot say, never "none". */
function contestLabels(p: Purchase): KitLabel[] {
  const c = p.contests;
  if (!c) return [];
  if (c.state === 'unknown') return [{ text: `Contests beside it: unknown (${c.why ?? 'not read'})`, tone: 'warn' }];
  return c.contests.map((x) => ({ text: `Contested by you, shown beside it${x.promise ? `: “${x.promise}”` : ''}`, tone: 'bad' as const }));
}

/** A sealed film or recording opened: played when asked, checked by its Module first. */
function sealedPlayBox(x: { publication: string; seller: string; media: 'video' | 'audio' }): string {
  return `<div class="dub-film" data-sealed="${e(x.publication)}" data-sealed-seller="${e(x.seller)}" data-sealed-media="${x.media}"><button type="button" class="k-btn k-p" data-action="play-sealed">▶ Play the ${x.media === 'video' ? 'film' : 'recording'}</button><span>checked before it plays</span></div>`;
}

/** A sealed file a post names (round 2 and 3): its price, its state; opened once its key arrived. Bought from the act's menu. */
function sealedBox(p: Item): string {
  const x = p.sealed!;
  const what = x.media === 'picture' ? 'picture' : x.media === 'video' ? 'film' : x.media === 'audio' ? 'recording' : 'text';
  const opened = x.picture
    ? `<img src="${e(x.picture)}" alt="The picture, opened">`
    : x.media === 'video' || x.media === 'audio'
      ? x.problem
        ? ''
        : sealedPlayBox({ publication: x.publication, seller: x.seller, media: x.media })
      : `<div class="k-txt" dir="auto">${e(x.text ?? '')}</div>`;
  const state =
    x.state === 'opened' || x.state === 'yours'
      ? `${opened}<div class="k-small k-soft">${x.state === 'yours' ? 'Yours, sealed: its key is here, delivered to each buyer once your Damgar signs the receipt.' : `Opened: its key arrived from its seller, and its ${what} matches the fingerprint it was published with.`}</div>`
      : x.state === 'paying'
        ? '<div class="k-small k-soft">Bought: pay it in your wallet (Payments, in Private). Its key arrives once the seller’s Damgar signs the receipt.</div>'
        : `<div class="k-small k-soft">Sealed: its ${what} opens once paid. Buy it from the act’s menu.</div>`;
  return `<div class="dub-sealed"><span class="k-small">${e(x.price)}</span>${x.words ? `<div class="k-small k-soft">${e(x.words)}</div>` : ''}${state}${x.problem ? `<div class="k-label k-warn">${e(x.problem)}</div>` : ''}</div>`;
}

/** A vow a post names (round 3): its words, its price; bought, confirmed or contested from the act's menu. */
function vowBox(p: Item): string {
  const x = p.vow!;
  const state = x.state === 'yours' ? 'Your vow: each buyer confirms or contests their sale.' : x.state === 'bought' ? 'You bought it: confirm or contest it in its menu.' : x.state === 'paying' ? 'Bought: pay it in your wallet (Payments, in Private).' : x.problem ? '' : 'Buy it from its menu.';
  return `<div class="dub-sealed"><span class="k-small">${e(x.price)}</span><div class="k-txt" dir="auto">${e(x.words)}</div>${state ? `<div class="k-small k-soft">${e(state)}</div>` : ''}${x.problem ? `<div class="k-label k-warn">${e(x.problem)}</div>` : ''}</div>`;
}

/** An act's ID written for people, from its hexadecimal, in the page (the same bech32m the core writes; display only). */
export function actFormOf(hex: string, label: 'mact' | 'mid' = 'mact'): string {
  if (!/^[0-9a-f]{64}$/.test(hex)) return hex;
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16));
  const data: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data.push((acc >> bits) & 31);
    }
  }
  if (bits) data.push((acc << (5 - bits)) & 31);
  const polymod = (v: number[]) => {
    const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const x of v) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ x;
      for (let i = 0; i < 5; i++) if ((top >> i) & 1) chk ^= G[i];
    }
    return chk;
  };
  const hrp = [...label].map((c) => c.charCodeAt(0));
  const pm = polymod([...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...data, 0, 0, 0, 0, 0, 0]) ^ 0x2bc830a3;
  const check = [0, 1, 2, 3, 4, 5].map((i) => (pm >> (5 * (5 - i))) & 31);
  return `${label}1${[...data, ...check].map((d) => CHARSET[d]).join('')}`;
}

/** A size, in words. */
export function sizeWords(n: number): string {
  return n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} kB` : `${n} bytes`;
}

/** This app's time, in words: when it found or sent a message (not a signed time). */
function whenWords(t: number): string {
  const d = new Date(t * 1000);
  const today = new Date();
  return d.toDateString() === today.toDateString() ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------- the frame

export type Part = 'public' | 'private' | 'purchases';

/** The top of Dub: Contacts and the app top left, the switch in the middle, the identity top right. */
export function topBar(s: State, part: Part | null): string {
  const i = s.identity!;
  const acting = i.acting ? i.collectives.find((c) => c.id === i.acting) : null;
  const left = `<div class="k-row">${contactsButton()}<span class="k-hide-phone">${appMark(NAME, 'icon.png')}</span></div>`;
  const center = switcher(
    [
      { key: 'public', label: 'Public' },
      { key: 'private', label: 'Private' },
      { key: 'purchases', label: 'Purchases' },
    ],
    part ?? '',
  );
  const right = meButton({ name: i.who.names[0] ?? null, form: i.form, as: acting ? { name: acting.name ?? 'a collective', form: acting.form } : null });
  return top({ left, center, right });
}

/** The first screen, before any identity is here: Dub opens only once one is. Also the forms the identity panel's + Add opens. */
export function firstScreen(web: boolean, suggested: Suggested): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body"><section class="dub-first" id="first"><div id="status-here"></div>
<h2>Identity</h2><p class="k-soft">Dub opens once an identity is here.</p>
${makeForm(web, suggested)}${bringForm(web)}${web ? '' : `<div class="k-box" id="from-kishib"><h4>Use one from Kišib</h4><p class="k-small k-soft">Through Kišib’s runner, on this Mac: Kišib keeps the signing key and shows each act before it signs it; Dub holds no key.</p><div class="k-row"><button type="button" class="k-btn" data-k-add="kishib">Use one from Kišib</button></div></div>`}
${say(`${TEST_ONLY}.`, [`Every key is held in software${web ? ' in this browser' : ' in this program’s folder'}: a prototype, never for a real identity.`])}</section></div>`;
}

const via = `<details class="k-say"><summary>Another way to reach an address (rarely needed)<span class="k-help">?</span></summary><div class="k-more-text"><label>One per line, as address=where (for example an onion home at its local port)</label><textarea name="via"></textarea></div></details>`;
const lns = (xs?: string[]) => e((xs ?? []).join('\n'));

/** Make a new identity: its chain key's words shown once. */
export function makeForm(web: boolean, suggested: Suggested = {}): string {
  return `<form id="begin" class="k-box"><h4>Make a new identity</h4>
${say('Dub shows you 24 words, once: the chain key’s words, to write on paper.', [`Dub keeps nothing of the chain key. Its signing key stays in ${web ? 'this browser' : 'this app'}.`, 'The chain key is the only way to change this identity’s keys, in Kišib, if a device is lost.'])}
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://">${lns(suggested.homes)}</textarea>
<label>Relays for its posts and its inbox (one per line; empty: its home)</label><textarea name="relays">${lns(suggested.relays)}</textarea>
<label>A display name, if you like (anyone can take the same name)</label><input name="name" type="text" maxlength="48" autocomplete="off" placeholder="No name: its fingerprint alone">
${web ? '' : via}
<div class="k-row"><button type="submit" class="k-btn k-p">Make it</button></div></form>`;
}

/** Bring an identity you have: its ID and its signing key's words. */
export function bringForm(web: boolean): string {
  return `<form id="bring" class="k-box"><h4>Bring an identity you have</h4>
${say('Its ID and its signing key’s words; Dub checks they give its current key.', ['Never type the chain key’s words here: they belong to Kišib, the app where a change of keys is done, and to paper.', ...(web ? [KEPT_SAY] : [])])}
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its signing key’s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if it names none; one per line)</label><textarea name="relays"></textarea>
${web ? '' : via}
<div class="k-row"><button type="submit" class="k-btn k-p">Bring it</button></div></form>`;
}

/** The chain key's words, shown once (F332, amended), with no question beside them: three are asked only once they are hidden (H3). */
export function words(ws: string[], said: string[]): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body"><section class="dub-first"><h2>The chain key’s words</h2>
<ul class="k-small k-soft">${said.map((s) => `<li>${e(s)}</li>`).join('')}</ul>
<div class="k-words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="written">I have written them down</button><button type="button" class="k-btn k-q" data-action="abandon">Start again</button></div>
<p class="k-small k-faint">Once you go on, the words are hidden, and three of them are asked back.</p></section></div>`;
}

/** Three words typed back, the words hidden (H3: "it is useless if the words are still displayed when asked"). */
export function typeBack(positions: number[]): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body"><section class="dub-first"><div id="status-here"></div><h2>Three of the chain key’s words</h2>
<p class="k-soft">From what you wrote down. Nothing is published until these three are right.</p>
<form id="confirm"><div class="k-row">${positions.map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`).join('')}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Go on</button><button type="button" class="k-btn k-q" data-action="abandon">Start again with a new identity</button></div></form></section></div>`;
}

export function pairing(): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body"><section class="dub-first"><h2>Pair this browser</h2>
<p class="k-soft">This page acts for the program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required><button type="submit" class="k-btn k-p">Pair</button></form>
<div id="pair-status"></div></section></div>`;
}

/** A message alone on the page (a browser that cannot keep a key, a program away). */
export function alone(html: string): string {
  return `${top({ left: appMark(NAME, 'icon.png'), right: '' })}<div class="k-body"><section class="dub-first">${html}</section></div>`;
}

// ---------------------------------------------------------------- Public

export type Lens = 'following' | 'toyou' | 'relay';

/** The Relay lens's layers (H55): text and envelope acts by default, the others behind the filter. */
export const LAYERS = [
  { key: 'text', label: 'Text' },
  { key: 'envelopes', label: 'Envelopes' },
  { key: 'identity', label: 'Identity' },
  { key: 'agreements', label: 'Agreements' },
  { key: 'money', label: 'Money' },
  { key: 'development', label: 'Development' },
  { key: 'other', label: 'Other' },
];

/** Public: three lenses (Following · To you · Relay, Relay third), the feed box, the typing box fixed at the bottom. */
export function publicPart(s: State, lens: Lens, layers: string[]): string {
  const i = s.identity!;
  const acting = i.acting ? i.collectives.find((c) => c.id === i.acting) : null;
  const above = `${lenses(
    [
      { key: 'following', label: 'Following' },
      { key: 'toyou', label: 'To you' },
      { key: 'relay', label: 'Relay' },
    ],
    lens,
  )}${lens === 'relay' ? pointRow('Showing', LAYERS.map((l) => ({ key: l.key, label: l.label, on: layers.includes(l.key) })), 'layer') : ''}`;
  const tools = `<label title="A picture (JPEG)">▣<span class="dub-l"> Picture</span><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg"></label><label title="A film (MP4)">▶<span class="dub-l"> Video</span><input name="video" type="file" accept=".mp4,video/mp4"></label><label title="A recording (M4A)">♪<span class="dub-l"> Audio</span><input name="audio" type="file" accept=".m4a,audio/mp4"></label><button type="button" data-action="at" title="Mention someone">@</button><button type="button" data-action="address">To…</button>`;
  return `<div class="k-body"><section class="k-pane dub-center" id="public">${feedBox({ id: 'feed', above, cards: '', empty: 'Reading the feed…', below: '<div id="feed-foot"></div>' })}
${typingBox({ id: 'post', placeholder: acting ? `Write something public, as ${acting.name ?? 'the collective'}…` : 'Write something public…', button: 'Post', tools, opts: '<span id="replying"></span><span id="addressed"></span><span class="dub-picked" id="picked"></span>', extra: '<div class="dub-field" id="to-field" hidden><input id="to" placeholder="To: a contact’s name, or an ID" aria-label="To" spellcheck="false"><button type="button" class="k-btn k-q" data-action="unaddress">Done</button></div>' })}</section></div>`;
}

/** The foot of the feed box: whose clock orders it, and what was not shown. */
export function feedFoot(clock: { name: string; placed: number; shown: number } | null, notes: string[], again = true): string {
  return `${clockLine(clock)}${notes.map((n) => `<p class="k-clock">${e(n)}</p>`).join('')}${again ? '<button type="button" class="k-btn k-q k-small" data-action="look">Look again</button>' : ''}`;
}

/** Cards, in a feed box. */
export const cards = (acts: KitAct[]) => acts.map((a) => card(a)).join('');

// ---------------------------------------------------------------- Private: a mailbox

export interface Conversation {
  with: Who;
  last: Message | null;
  unseen: number;
}

/** Private: conversations on the left, one per identity; the thread; the typing box at the bottom. */
export function privatePart(s: State, convs: Conversation[], open: Conversation | null, msgs: Message[]): string {
  const i = s.identity!;
  const list = convs
    .map(
      (c) =>
        `<button type="button" class="dub-conv${open?.with.id === c.with.id ? ' k-on' : ''}" data-conv="${e(c.with.id)}"><span class="k-dot k-alt">${e((nameOf(c.with)[0] ?? '?').toUpperCase())}</span><span><span class="k-n" dir="auto">${e(nameOf(c.with))}</span>${c.unseen ? `<span class="k-count">${c.unseen}</span>` : ''}<span class="dub-l" dir="auto">${e(c.last?.text ?? 'Nothing yet')}</span></span><span class="dub-w">${c.last ? e(whenWords(c.last.at)) : 'new'}</span></button>`,
    )
    .join('');
  const usable = i.collectives.filter((c) => c.available);
  const thread = open
    ? `<div class="dub-head"><button type="button" class="k-back" data-action="convs">← Back</button><h2 dir="auto">${e(nameOf(open.with))}</h2><span class="k-mono k-faint">${e(shortForm(open.with.form))}</span><span class="k-grow"></span>${open.last ? '<span class="k-small k-soft">sealed to each</span>' : '<span class="k-chip">new</span>'}</div>
${feedBox({ id: 'thread', cards: msgs.length ? cards(msgs.map(messageAct)) : '', empty: `Nothing yet. What you write is sealed to ${nameOf(open.with)}: only they can open it.` })}
<p class="k-clock">In the order this app found or sent them: its own time, not a signed one.</p>
${typingBox({
  id: 'message',
  placeholder: `Write to ${nameOf(open.with)}…`,
  button: 'Send',
  opts: `<span class="k-chip">As ${e(i.who.names[0] ?? 'yourself')}</span>${usable.map((c) => `<button type="button" class="k-chip" data-append="${e(c.id)}" aria-pressed="false">+ of ${e(c.name ?? shortForm(c.form))}</button>`).join('')}<span id="ccs"></span><button type="button" class="k-chip" data-action="cc">+ Cc</button><button type="button" class="k-chip" data-action="askpaid">+ Ask to be paid</button>`,
  extra: '<div class="dub-field" id="cc-field" hidden><input id="cc" placeholder="Cc: a contact’s name, or an ID" aria-label="Cc" spellcheck="false"><button type="button" class="k-btn k-q" data-action="uncc">Done</button></div>',
  tools: '',
})}${usable.length ? '<p class="k-clock">A collective appended binds nothing; the reader’s app shows it only where your membership checks. Everyone sees the Cc.</p>' : ''}`
    : '<p class="k-empty">Choose a conversation, or start a new one.</p>';
  return `<div class="k-body dub-private${open ? ' k-chosen' : ''}"><aside class="dub-convs"><input class="dub-find" type="search" id="find-conv" placeholder="Find a conversation…" autocomplete="off" aria-label="Find a conversation"><div class="dub-list">${list}<button type="button" class="dub-conv" data-action="new-conv"><span class="k-soft">+ A new conversation</span></button></div><div id="private-notes"></div></aside><section class="dub-thread" id="private">${thread}</section></div>`;
}

// ---------------------------------------------------------------- Purchases

export type Shelf = 'all' | 'files' | 'vows';

/** Purchases: files bought and vows purchased, one feed box, All · Files · Vows. */
export function purchasesPart(shelf: Shelf): string {
  return `<div class="k-body"><section class="k-pane dub-center" id="purchases">${feedBox({
    id: 'bought',
    above: lenses(
      [
        { key: 'all', label: 'All' },
        { key: 'files', label: 'Files' },
        { key: 'vows', label: 'Vows' },
      ],
      shelf,
      'shelf',
    ),
    cards: '',
    empty: 'Reading what you bought…',
  })}<div id="bought-foot"></div></section></div>`;
}

// ---------------------------------------------------------------- pop-ups: the identity's own menu, paying, relying, anchoring

/** Lines said back, as a list. */
export const lines = (ls: Line[]) => `<ul class="k-small">${ls.map((l) => `<li class="${l.tone === 'bad' ? 'k-bad' : ''}">${e(l.text)}</li>`).join('')}</ul>`;

/** The units a payment may name (Damgar's units Modules), regtest first. */
export const unitOptions = (units: { hash: string; label: string }[] = []) => units.map((u) => `<option value="${e(u.hash)}">${e(u.label)}</option>`).join('');

/** The chooser of ways to pay (decided: three ways): Tip, Buy, Pay and unlocking all open it, with the ways open. */
export function payChooser(o: { title: string; sub: string; kind: 'tip' | 'buy' | 'vow' | 'pay'; ways: PayWays; units: { hash: string; label: string }[]; price: string | null }): string {
  const w = o.ways;
  const first = w.lane.open ? 'lane' : w.damgar.open ? 'damgar' : w.hand.open ? 'hand' : '';
  const way = (key: 'lane' | 'damgar' | 'hand', label: string, open: boolean, said: string) =>
    `<label class="${open ? '' : 'dub-closed'}"><input type="radio" name="how" value="${key}"${open ? '' : ' disabled'}${key === first ? ' checked' : ''}><span><span>${e(label)}</span><span class="k-small k-soft">${e(said)}</span></span></label>`;
  const laneSaid = w.lane.open
    ? `Dub signs it now, with its lane’s key. Per payment: at most ${w.lane.perPayment}${w.lane.total ? ` · In all: ${w.lane.left} left of ${w.lane.total}` : ''}${w.lane.until ? ` · until ${new Date(w.lane.until * 1000).toISOString().slice(0, 10)}` : ''} · paid under it so far: ${w.lane.spent} (Dub’s own count${w.lane.total ? '; the cap in all is kept by Dub and counted in Damgar, not judged by verifiers' : ''}).`
    : (w.lane.why ?? '');
  const amount = o.kind === 'tip' || o.kind === 'pay';
  return `<form class="dub-modal-form" id="pay" data-kind="${e(o.kind)}"><p class="k-small k-soft">${e(o.sub)}</p>${w.shared ? `<p class="k-label dub-shared">${e(w.shared)}</p>` : ''}
${amount ? `<div class="k-row"><input name="value" inputmode="numeric" placeholder="Amount" required class="k-grow"><select name="unit">${unitOptions(o.units)}</select></div><input name="whatFor" placeholder="What for (optional)" maxlength="280">` : `<p>${e(o.price ?? '')}</p>`}
<div class="dub-ways">${way('lane', 'Under Dub’s lane', w.lane.open, laneSaid)}${way('damgar', 'Ask Damgar', w.damgar.open, w.damgar.open ? (w.damgar.wakes ? 'Dub leaves it on MOR, sealed to you, and wakes Damgar: Damgar pops up here, reads it to you, and you authorise it in its panel. It waits in Damgar’s Waiting too.' : 'Dub leaves it on MOR, sealed to you; Damgar queues it in Waiting, reads it to you and signs it there.') : (w.damgar.why ?? ''))}${way('hand', 'By hand', w.hand.open, w.hand.open ? 'Dub shows the payment to copy into Damgar; nothing is signed or sent from here.' : (w.hand.why ?? ''))}</div>
<div class="k-row"><button type="submit" class="k-btn k-p"${first ? '' : ' disabled'}>${o.kind === 'tip' ? 'Tip' : o.kind === 'pay' ? 'Pay' : 'Buy it'}</button><span class="k-grow"></span><span class="k-small k-faint">the record goes to Damgar’s account</span></div><div id="pay-said"></div></form>`;
}

/** The payment by hand, shown to copy (the money messages cMIP's draft, section 2.1). */
export function byHand(h: { text: string; said: string[] }): string {
  return `<div class="k-box">${lines(h.said.map((text) => ({ text })))}<label>The draft, as the money messages cMIP writes it (section 2.1), in base64: copy it into Damgar</label><textarea class="dub-hand" readonly>${e(h.text)}</textarea><div class="k-row"><button type="button" class="k-btn" data-copy-text="${e(h.text)}">Copy it</button></div>${say('In Damgar: Waiting, + Paste an act to sign.', ['Damgar reads it to you in plain words, and you sign it or decline it there. Nothing is signed or sent from Dub.'])}</div>`;
}

/** Rely on an act, read back first, RELY typed (as Edubba asks). */
export function relyForm(r: { lines: Line[]; explanation: string; blocking: string[] }): string {
  return `${lines(r.lines)}<p class="k-small k-soft">${e(r.explanation)}</p>${
    r.blocking.length
      ? `<div class="k-alarmbox">It cannot be relied on from here:${lines(r.blocking.map((text) => ({ text })))}</div>`
      : `<form id="rely" class="dub-modal-form"><label>Type RELY to sign the witness act</label><input name="typed" autocomplete="off" autocapitalize="characters" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Sign the witness act</button></div></form>`
  }`;
}

/** Anchor an act: the service named, its offers read, a tier chosen; prepared for Damgar. */
export function anchorForm(offers: { act: string; unit: string; tiers: { tier: number; words: string }[]; words: string | null }[] | null, service = ''): string {
  return `<form id="anchor-offers" class="dub-modal-form">${say('An anchor puts this act’s fingerprint on the Bitcoin chain, through a pooled anchoring service, paid in Damgar.', ['Anyone may anchor any act (the anchoring cMIP). Dub prepares the payment; Damgar signs it; the blind that ties the anchor to this act is kept here. Round 1 runs on regtest: its coins are worth nothing.'])}
<label>The anchoring service’s ID</label><div class="k-row"><input name="service" value="${e(service)}" required spellcheck="false" autocomplete="off" class="k-grow"><button type="submit" class="k-btn">Read its offer</button></div></form>${
    offers === null
      ? ''
      : offers.length
        ? `<form id="anchor" class="dub-modal-form" data-service="${e(service)}"><div class="dub-ways">${offers.flatMap((o) => o.tiers.map((t, i) => `<label><input type="radio" name="tier" value="${e(o.act)}:${t.tier}"${i === 0 ? ' checked' : ''}><span>${e(t.words)}${o.words ? `<span class="k-small k-soft">${e(o.words)}</span>` : ''}</span></label>`)).join('')}</div><div class="k-row"><button type="submit" class="k-btn k-p">Prepare the payment for Damgar</button></div></form>`
        : '<p class="k-small k-soft">No standing offer of that service was found.</p>'
  }`;
}

/** Correct one's own act (the corrections cMIP). */
export function correctForm(): string {
  return `<form id="correct" class="dub-modal-form">${say('A correction is a new post naming the old one, labelled “Correction”.', ['The old post stays as it was signed, shown with “corrected by”: nothing on MOR is changed or deleted. Apps that do not know the corrections cMIP show an ordinary post naming the old one.'])}<textarea name="text" required placeholder="The correction"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Sign the correction</button></div></form>`;
}

/** Contest a vow bought, or a file bought (F386): what was not kept, in words, if you say it. */
export function contestForm(file = false): string {
  return `<form id="contest" class="dub-modal-form"><p class="k-small k-soft">${file ? 'A contest naming your purchase is signed in public, and shown beside it, to you and to the seller. It undoes nothing: the payment, the key and the file stay as they are.' : 'A contest naming your sale is signed in public. It voids nothing; the payment stays as it is.'}</p><input name="promise" placeholder="What was not kept (optional)" maxlength="280"><div class="k-row"><button type="submit" class="k-btn k-alarm">Contest it</button></div></form>`;
}

/** Ask to be paid (in the private typing box): a request prepared for Damgar. */
export function askPaidForm(units: { hash: string; label: string }[]): string {
  return `<form id="askpaid" class="dub-modal-form"><div class="k-row"><input name="value" inputmode="numeric" placeholder="Amount" required class="k-grow"><select name="unit">${unitOptions(units)}</select></div><input name="whatFor" placeholder="What for (optional)" maxlength="280">${say('Prepared here, signed in Damgar.', ['Dub seals a request to this identity at its homes; Damgar reads it to you and signs it or not. A request is not a debt: they may pay it, accept it as a debt, or decline.'])}<div class="k-row"><button type="submit" class="k-btn k-p">Prepare it for Damgar</button></div></form>`;
}

// ---------------------------------------------------------------- the identity's own menu, each item in a pop-up

/** Name: a display name, shown beside the fingerprint, never instead of it. */
export function nameForm(s: State): string {
  return `<form id="name" class="dub-modal-form"><label>Your display name: shown beside your ID, never instead of it. Anyone can take the same name.</label><input name="name" maxlength="48" autocomplete="off" value="${e(s.identity!.who.names.join(' / '))}" placeholder="No name: your ID alone"><div class="k-row"><button type="submit" class="k-btn k-p">Save</button></div></form>`;
}

/** Relays (H39, H53): shown, and changed with a new routes act read back first, for an identity Dub made. */
export function relaysForm(s: State): string {
  const i = s.identity!;
  return `<dl class="k-facts"><dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd><dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd></dl>${
    i.kind === 'made'
      ? `<form id="relays" class="dub-modal-form"><label>Its relays, one per line: where its acts are found and its inbox is</label><textarea name="relays">${e(i.relays.join('\n'))}</textarea><div class="k-row"><button type="submit" class="k-btn">Read it back</button></div></form><div id="relays-review"></div>`
      : '<p class="k-small k-soft">This identity was brought here: Dub publishes no routes for it (a second writer would fork them). Change its relays in the app that made it.</p>'
  }${say('Its homes change only with the chain key.', ['Its homes are named in its identity chain: they change in Kišib, from the chain key’s paper.'])}`;
}

/** Words: the signing key's words, on request (the carry Module). */
export function carry(c: { grouped: string; words: string[]; say: string[] }): string {
  return `<p class="k-mono k-soft">${e(c.grouped)}</p><ul class="k-small k-soft">${c.say.map((s) => `<li>${e(s)}</li>`).join('')}</ul><div class="k-words" id="carry-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join('')}</div>`;
}

/** Line and homes: this app's line, and where the identity lives. */
export function lineFacts(s: State): string {
  const i = s.identity!;
  return `<dl class="k-facts"><dt>Its ID</dt><dd class="k-mono">${e(i.form)}</dd><dt>Made</dt><dd>${i.kind === 'made' ? 'Here. Its chain key was shown once as words, and is kept nowhere here.' : 'Elsewhere, brought here by its signing key’s words. Its chain key is not here.'}</dd>
${i.oldChainKey ? '<dt>Old chain key</dt><dd>Made by Dub before 16 October 2026: its chain key is still in this app’s folder, unused and untouched.</dd>' : ''}
<dt>Private messages</dt><dd>${i.kind === 'runner' ? e(i.encryption ? 'Opened here through Kišib, which holds its key: each opening is listed in Kišib.' : (i.opening ?? 'Not opened here.')) : i.encryption ? 'Its encryption key is here: its private messages open here.' : 'No encryption key here: its private messages cannot be opened here.'}</dd>
<dt>Homes</dt><dd>${e(i.homes.join(', '))}</dd><dt>Relays</dt><dd>${e(i.relays.join(', '))}</dd>
<dt>This app’s line</dt><dd>${cardWords(i.line, 'Dub', e)}</dd></dl>
${say('A change of keys must keep this line.', ['If the signing key is ever changed (in Kišib, with the chain key’s words), that change must keep this line, or the posts made here become void: take the line above to it.'])}`;
}

/** A lane from Damgar: asked here, granted there. */
export function laneForm(s: State, web: boolean, said: string[]): string {
  return `${say('A lane lets Dub pay by itself, within a cap Damgar grants.', said)}<div id="lanes"><p class="k-small k-soft">Reading the lanes…</p></div>
<form id="lane" class="dub-modal-form"><input name="label" value="${web ? 'Dub on the web' : 'Dub on this computer'}" maxlength="80" autocomplete="off">
<div class="k-row"><input name="cap" inputmode="numeric" placeholder="At most, per payment" required class="k-grow"><select name="unit">${unitOptions(s.units)}</select></div>
<div class="k-row"><input name="total" inputmode="numeric" placeholder="In all, for the whole lane (optional)" class="k-grow"></div>
<label>Until (optional), judged on a timestamp clock: its ID${s.identity!.laneClock ? `, prefilled with ${e(s.identity!.laneClock.name)}` : ''}</label><div class="k-row"><input name="until" type="datetime-local"><input name="clock" class="k-grow" placeholder="the clock’s ID" spellcheck="false" value="${e(s.identity!.laneClock?.id ?? '')}"></div>
<p class="k-small k-soft">The clock is written in the lane’s grant, so the lane’s words name it: change it here before asking, if you wish. With an Until, a payment under the lane counts for whoever you pay only once that clock has stamped it (the Dubsar clock does within a minute or so): until then it waits in their Damgar, said.</p>
<div class="k-row"><button type="submit" class="k-btn k-p">Ask Damgar for this lane</button></div></form>
<h4>Payments under the lane</h4><div id="payments"><p class="k-small k-soft">Reading…</p></div>`;
}

/** The lanes asked here, and where each stands. */
export function lanesHere(ls: { label: string; state: string; cap: string; total?: string | null; until: number | null }[]): string {
  return ls.length ? `<ul class="k-small">${ls.map((l) => `<li>${e(l.label)} · ${e(l.state)} · at most ${e(l.cap)} a payment${l.total ? ` · in all ${e(l.total)}` : ''}${l.until ? ` · until ${e(new Date(l.until * 1000).toISOString().slice(0, 16).replace('T', ' '))} UTC` : ''}</li>`).join('')}</ul>` : '<p class="k-small k-soft">No lane yet: Dub pays nothing by itself.</p>';
}

/** A payment as Damgar's code shows it, the part Dub draws. */
export interface PaymentShownHere {
  key: string;
  other: { id: string; short: string };
  amount: { said: string };
  stageSaid: string;
  pay: { invoice?: string; address?: string } | null;
  proofs: { kind: string; rail: { answer: string }; how: string }[];
}

/** Payments signed here under the lane (round 2): the invoice to pay in the wallet, and the proof taken back to sign the claim; those done. */
export function paymentsHere(r: { payments: PaymentShownHere[]; done: PaymentShownHere[]; problems: string[] }, who: (id: string) => Who): string {
  const one = (p: PaymentShownHere) => `<div class="k-box" data-payment="${e(p.key)}"><div class="k-row"><span class="k-small">to</span><span dir="auto">${e(nameOf(who(p.other.id)))}</span><span class="k-mono k-faint">${e(shortForm(who(p.other.id).form))}</span><span class="k-grow"></span><span class="k-small">${e(p.amount.said)}</span></div><p class="k-small k-soft">${e(p.stageSaid)}</p>
${p.pay?.invoice && !p.proofs.some((x) => x.kind === 'claim') ? `<textarea class="dub-hand" readonly>${e(p.pay.invoice)}</textarea><div class="k-row"><button type="button" class="k-btn" data-copy-text="${e(p.pay.invoice)}">Copy the invoice</button></div><form class="dub-modal-form" id="paid" data-key="${e(p.key)}"><input name="proof" required spellcheck="false" autocomplete="off" placeholder="The preimage, from your wallet once paid"><div class="k-row"><button type="submit" class="k-btn k-p">Check it and sign the claim, under the lane</button></div></form>` : ''}
${p.proofs.length ? `<ul class="k-small">${p.proofs.map((x) => `<li>${x.kind === 'claim' ? 'Claim' : 'Receipt'}: ${e(x.rail.answer)} · ${e(x.how)}</li>`).join('')}</ul>` : ''}</div>`;
  return `${r.payments.map(one).join('')}${r.done.length ? `<h4>Done</h4>${r.done.map(one).join('')}` : ''}${!r.payments.length && !r.done.length ? '<p class="k-small k-soft">No payment made from Dub yet.</p>' : ''}${r.problems.map((x) => `<p class="k-clock">${e(x)}</p>`).join('')}`;
}

/** Add a collective under this identity, by its ID. */
export function collectiveForm(s: State): string {
  const cs = s.identity!.collectives;
  return `${cs.length ? `<ul class="k-small">${cs.map((c) => `<li>${e(c.name ?? shortForm(c.form))} · ${c.available ? 'usable' : e(c.why ?? 'not usable')} <button type="button" class="k-btn k-q" data-action="collective-remove" data-id="${e(c.id)}">Remove</button></li>`).join('')}</ul>` : ''}
<form id="collective" class="dub-modal-form"><label>A collective this identity is a member of: its ID</label><input name="id" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Add it under this identity</button></div></form>
${say('Acting as a collective is the same gesture as switching.', ['It is listed under this identity in the identity panel: choose it to post as it, with your own member key (made when you signed its founding). Where its area asks more keys than one, a post counts once another holder signs it, in Edubba.'])}`;
}

/** The panel's foot, for the app itself: paired browsers (the Mac), the clock feeds are ordered by, homes and relays. */
export function appFoot(s: State, web: boolean): string {
  // Decided 23 October 2026: every app relies on the Dubsar clock; no choice of clock on the screens for now (the form and its operation, `clock`, are kept for when better clocks come).
  return `${web ? '' : `<h4>Browsers paired with this app</h4><div class="k-row"><button type="button" class="k-btn" data-action="code">A code for another browser on this machine</button><button type="button" class="k-btn k-q" data-action="unpair">Unpair this browser</button></div><div id="code"></div>`}
<h4>The clock feeds are ordered by</h4><p class="k-small k-soft">The Dubsar clock, the timestamp clock dubsar.org’s feed names. A choice of clock comes later, when there are better clocks.</p>
${say('A clock orders what is shown; it never decides what is true.', ['A timestamp clock signs “I held these acts at this time”: its word only. Acts it did not stamp keep their signer’s own order, and show the signer’s own hint where it wrote one. Order is proven only inside a chain. To anchor an act on Bitcoin, Anchor it, paid in Damgar.'])}
${say(`${TEST_ONLY}.`, [`Every key is held in software${web ? ' in this browser' : ' in this program’s folder'}: a prototype, never for a real identity.`])}`;
}

// ---------------------------------------------------------------- contacts

/** Contacts' own lines, below the list: follow by ID, muted, whether the list is published. */
export function contactsBelow(s: State): string {
  const i = s.identity!;
  return `<form id="follow" class="dub-modal-form"><input name="id" autocomplete="off" spellcheck="false" placeholder="+ Add by ID (mid1…, or an ID link)" required aria-label="Add by ID"><input name="name" autocomplete="off" placeholder="Your name for it (sealed to you)" aria-label="Your name for it"><div class="k-row"><button type="submit" class="k-btn">Add to contacts</button></div></form>
${i.muted.length ? `<details class="k-say"><summary>Muted (${i.muted.length})<span class="k-help">?</span></summary><div class="k-more-text">${i.muted.map((m) => `<div class="k-row"><span dir="auto">${e(nameOf(m))}</span><span class="k-mono k-faint">${e(shortForm(m.form))}</span><button type="button" class="k-btn k-q" data-action="unmute" data-id="${e(m.id)}">Unmute</button></div>`).join('')}</div></details>` : ''}
<label class="k-row"><input type="checkbox" id="publish-list" ${i.list === 'published' ? 'checked' : ''}> Publish whom ${e(i.who.names[0] ?? 'this identity')} follows</label>
${say(i.list === 'published' ? 'Published: anyone reads the IDs; your names for them stay sealed.' : 'Your names for them stay sealed to you. The same list in Public and Private.', [
  i.encryption
    ? `Whom it follows, with the names you gave, is a private act sealed to this identity and kept at its homes${i.sealed ? ` (version ${i.sealed.version})` : ''}: any app holding this identity reads it; nobody else can. Its homes and relays see only that a private act exists, and roughly how big it is; whoever holds the signing key’s words reads it.`
    : i.kind === 'runner'
      ? `The list stays in this app only, not sealed to this identity: ${i.opening ?? 'Kišib does not open for Dub.'}`
      : 'This app holds no encryption key of this identity, so the list stays in this app only.',
  'Muting stays in this app, always.',
  ...(i.sealed?.forked ? ['The list was forked: two apps changed it at once. The longer branch is shown.'] : []),
])}`;
}

/** The new signing key's words taken, where the key was changed elsewhere (in the kit's warning, H82). */
export function renewForm(): string {
  return `<form id="renew"><label>The new signing key’s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Use the new words</button></div></form>`;
}

// ---------------------------------------------------------------- an identity used through Kišib (the Dubsar runner cMIP)

/** Where Dub's pairing with Kišib stands, as the program says it. */
export interface RunnerState {
  available: boolean;
  origin: string | null;
  state: string | null;
  code: string | null;
  identities: { id: string; form: string; name: string | null; held: boolean }[];
  problem: string | null;
}

/** + Add, Use one from Kišib: pair, then choose an identity Kišib lets Dub use. */
export function runnerForm(r: RunnerState): string {
  const intro = '<p class="k-small k-soft">Kišib’s runner keeps the identity’s signing key on this Mac; Dub holds none of its keys. Each act Dub would sign is shown by Kišib, in its own panel inside this window, before Kišib signs it (unless you give Dub a standing yes for that kind, in Kišib). Money, agreements, relying on another’s act, and keys always ask. Where you let Dub, in Kišib, Kišib also opens what is sealed to the identity, so that Dub reads its private messages.</p>';
  if (!r.available) return `${intro}<p>Kišib’s runner is in the computer’s program only, never in the web client.</p>`;
  const problem = r.problem ? `<div class="k-note k-error">${e(r.problem)}</div>` : '';
  if (r.state === 'approved') {
    const ids = r.identities.map((x) => `<div class="k-idline"><span class="k-dot k-alt">${e((x.name ?? 'M')[0].toUpperCase())}</span><span class="k-grow"><span class="k-n">${e(x.name ?? 'No name')}</span><br><span class="k-s k-mono">${e(shortForm(x.form))}</span></span>${x.held ? '<span class="k-small k-faint">used here</span>' : `<button type="button" class="k-btn k-p" data-action="runner-take" data-id="${e(x.id)}">Use it</button>`}</div>`).join('');
    return `${intro}<p class="k-small">Dub is paired with Kišib’s runner. The identities Kišib lets Dub use:</p><div class="k-list">${ids || '<p class="k-small k-soft">None: choose some for Dub in Kišib (Runner, Apps).</p>'}</div><div class="k-row"><button type="button" class="k-btn k-q" data-action="runner-look">Look again</button></div>`;
  }
  if (r.state === 'waiting') return `${intro}<p>Dub asked Kišib to pair. Approve it in Kišib (Runner, Apps), only if Kišib shows the same code:</p><p class="k-mono dub-code" id="runner-code">${e(r.code ?? '')}</p><div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-look">I approved it in Kišib</button><button type="button" class="k-btn k-q" data-action="runner-pair">Ask again</button></div>`;
  const was = r.state === 'revoked' ? '<p class="k-small k-soft">Kišib no longer knows Dub: its pairing was revoked, or the runner was turned off.</p>' : r.state === 'refused' ? '<p class="k-small k-soft">Kišib refused Dub’s pairing.</p>' : '';
  return `${intro}${problem}${was}<p class="k-small k-soft">First, Kišib’s runner must be on, and hold the identity (Kišib: Runner; Identities, Held here). Then Dub asks to pair; you approve in Kišib.</p><div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Ask Kišib to pair</button></div>`;
}

/** Remove, said plainly first, for an identity used through Kišib: only unlinked here. */
export function runnerRemoveSaid(name: string): string {
  return `<div class="k-box" data-k-remove><h4>Remove ${e(name)} from Dub?</h4><p class="k-small k-soft">Dub stops using ${e(name)} through Kišib, and forgets what it kept about it on this device. Dub holds no key of it. Kišib’s runner keeps its key until you remove it there, or turn the runner off; ${e(name)} itself, its acts and its homes are not touched.</p><div class="k-row"><button type="button" class="k-btn k-p" data-k-remove-yes>Remove it</button><button type="button" class="k-btn k-q" data-k-remove-no>Keep it</button></div></div>`;
}

/** The signing key's words, for an identity used through Kišib: not here. */
export function runnerWords(): string {
  return '<p>Kišib’s runner holds this identity’s signing key, on this Mac; Dub holds none of its keys. Its words are given and changed in Kišib (Runner; Identities, Held here), never here.</p>';
}
