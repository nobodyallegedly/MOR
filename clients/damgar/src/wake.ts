// Damgar woken by another app on this computer, and its panel drawn inside
// that app's window (the second way to pay, 2A; decided by Nobody,
// allegedly, 21 October 2026: "Damgar should act as Kišib for money acts, it
// should pop up and authorise"). The program only, never the web client.
//
// The mechanism stays MOR's: the asking app leaves its draft on MOR, sealed
// to the identity, as before; then it only wakes Damgar, naming the
// identity and the draft's id. Damgar looks on MOR, finds the draft, and
// draws its panel in the kit's slot of the asking app: a page with no
// script, framed only by the origin that woke it, its two buttons a form
// sent inside the frame with a single-use value written here. The asking
// app cannot read the panel or press its buttons; it learns only whether the
// payment was signed or declined. Nothing travels outside MOR but the
// wake-up. *The gap, accepted (decided): a malicious app could cover the
// frame or trick a click.*

import { randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, readBody, send } from '../../desk/src/local.ts';
import { KIT_STYLE } from '../../kit/src/style.ts';
import { e } from '../../kit/src/html.ts';
import type { Damgar } from './damgar.ts';
import type { Line, ToSign } from './shapes.ts';

/** How long a panel waits for the person. */
export const WAIT = 10 * 60;

interface Asked {
  identity: string;
  draft: string;
  app: string;
  origin: string;
  nonce: string;
  at: number;
  item: ToSign;
  answer: 'waiting' | 'signed' | 'declined';
  lines: Line[];
}

const now = () => Math.floor(Date.now() / 1000);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** The panel's headers: framed only by the origin that woke Damgar; its form sent only here; no script. */
const panelHeaders = (ancestors: string[]) => ({
  'content-security-policy': `default-src 'none'; style-src 'self'; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors ${ancestors.length ? ancestors.join(' ') : "'none'"}`,
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'cache-control': 'no-store',
});
const publicHeaders = { 'x-content-type-options': 'nosniff', 'cache-control': 'no-store', 'cross-origin-resource-policy': 'cross-origin', 'access-control-allow-origin': '*' };

/** The panel's own style, beside the kit's. */
export const PANEL_STYLE = `
body.k-damgar-panel{margin:0;background:#0b0e14;color:var(--k-text);font:300 15px/1.5 "Atkinson Hyperlegible Next",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.k-dp{padding:14px 18px 10px}
.k-dp .k-by{font-size:13px;color:var(--k-p);margin:0 0 6px}
.k-dp h3{font-weight:300;font-size:20px;margin:0 0 2px}
.k-dp p{margin:4px 0}
.k-dp-words{border:1px solid var(--k-edge);border-radius:10px;padding:8px 12px;margin:10px 0;max-height:42vh;overflow:auto;background:var(--k-raise)}
.k-dp .k-btn{border-radius:999px;padding:8px 16px;font:inherit;cursor:pointer;border:1px solid var(--k-edge);background:none;color:var(--k-text)}
.k-dp .k-btn.k-p{background:var(--k-p);color:#0a0c10;border-color:var(--k-p)}
.k-dp .k-btn.k-q{border-color:transparent;color:var(--k-soft)}
.k-dp .k-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.k-dp .k-grow{flex:1}`;

const page = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Damgar</title><link rel="stylesheet" href="/damgar/panel.css"></head>
<body class="k-damgar-panel k-damgar"><main class="k-dp">${body}</main></body></html>`;

/** The panel: who woke Damgar, the payment in plain words, Authorise and sign, Decline. */
export function panel(o: { request: string; nonce: string; app: string; item: ToSign }): string {
  const i = o.item;
  return page(`<p class="k-by" data-damgar-panel="${e(o.request)}">Damgar · woken by ${e(o.app)}</p><h3>${e(i.title)}</h3>
<p class="k-small k-soft">${e(o.app)} put the draft on MOR, sealed to you. Damgar found it there.</p>
${i.amount ? `<p>${e(i.amount.said)}</p>` : ''}
<div class="k-dp-words" id="words">${i.lines.map((l) => `<p dir="auto">${e(l.text)}</p>`).join('')}</div>
<form method="post" action="/damgar/panel/${e(o.request)}"><input type="hidden" name="n" value="${e(o.nonce)}">
<div class="k-row">${i.unknown ? '' : '<button type="submit" name="answer" value="sign" class="k-btn k-p">Authorise and sign</button>'}<button type="submit" name="answer" value="decline" class="k-btn k-q">Decline</button><span class="k-grow"></span><span class="k-small k-faint">money always asks</span></div></form>`);
}

/** What the frame shows once answered, or where nothing waits. */
export const panelSaid = (title: string, lines: string[]) => page(`<p class="k-by">Damgar</p><h3 data-damgar-said>${e(title)}</h3>${lines.map((t) => `<p class="k-small k-soft">${e(t)}</p>`).join('')}`);

/** Damgar's doors for the apps on this computer: wake (JSON, a header a web page cannot send without asking first), the answer, and the panel. */
export function wakeRoutes(damgar: Damgar, base: () => string, fonts: Record<string, { body: Buffer }>) {
  const asked = new Map<string, Asked>();
  const live = (fp: string) => {
    const a = asked.get(fp);
    if (a && a.answer === 'waiting' && now() - a.at > WAIT) asked.delete(fp);
    return asked.get(fp) ?? null;
  };
  return async (req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> => {
    if (!url.pathname.startsWith('/damgar/')) return false;
    if (req.method === 'GET' && url.pathname === '/damgar/panel.css') return send(res, 200, 'text/css; charset=utf-8', `${KIT_STYLE}\n${PANEL_STYLE}`, publicHeaders), true;
    const font = /^\/damgar\/([a-z_]+\.woff2)$/.exec(url.pathname);
    if (req.method === 'GET' && font && fonts[`/${font[1]}`]) return send(res, 200, 'font/woff2', fonts[`/${font[1]}`].body, publicHeaders), true;
    const pm = /^\/damgar\/panel\/([0-9a-f]{64})$/.exec(url.pathname);
    if (pm) {
      const fp = pm[1];
      const a = live(fp);
      const dest = req.headers['sec-fetch-dest'];
      if (dest && dest !== 'iframe') return send(res, 403, 'text/plain; charset=utf-8', 'Damgar’s panel is shown only inside the app that woke it.', panelHeaders([])), true;
      const ancestors = a ? [a.origin, a.origin.replace('127.0.0.1', 'localhost')] : [];
      if (req.method === 'GET') {
        if (!a || a.answer !== 'waiting') return send(res, 200, 'text/html; charset=utf-8', panelSaid('Nothing waits here', [a ? `Already ${a.answer}.` : 'This payment was answered, or waited past its ten minutes. It still waits in Damgar, in Waiting, if it was not answered.']), panelHeaders(ancestors)), true;
        return send(res, 200, 'text/html; charset=utf-8', panel({ request: fp, nonce: a.nonce, app: a.app, item: a.item }), panelHeaders(ancestors)), true;
      }
      if (req.method === 'POST') {
        const form = new URLSearchParams((await readBody(req, 1 << 14)).toString('utf8'));
        if (!a || a.answer !== 'waiting' || form.get('n') !== a.nonce) return send(res, 200, 'text/html; charset=utf-8', panelSaid('Not signed', ['This panel is no longer the one Damgar drew for this payment: nothing was signed from it.']), panelHeaders(ancestors)), true;
        // Single use: the value written into the panel is spent by this answer, whatever it is.
        a.nonce = randomBytes(32).toString('hex');
        try {
          if (form.get('answer') === 'sign') {
            const r = await damgar.signDraft(a.draft);
            a.answer = 'signed';
            a.lines = r.lines;
            return send(res, 200, 'text/html; charset=utf-8', panelSaid('Signed', [...r.lines.map((l) => l.text), 'Pay it in your own wallet once they answer: Damgar shows it in Waiting, To pay.']), panelHeaders(ancestors)), true;
          }
          const r = await damgar.decline(a.draft);
          a.answer = 'declined';
          a.lines = r.lines;
          return send(res, 200, 'text/html; charset=utf-8', panelSaid('Declined', ['Nothing was signed.']), panelHeaders(ancestors)), true;
        } catch (err) {
          a.lines = [{ text: err instanceof Error ? err.message : String(err), tone: 'warn' }];
          return send(res, 200, 'text/html; charset=utf-8', panelSaid('Not signed', a.lines.map((l) => l.text)), panelHeaders(ancestors)), true;
        }
      }
      return send(res, 405, 'text/plain', 'not allowed'), true;
    }
    // The door for apps: JSON, POST only, a header a web page cannot send without asking first (and is not allowed to).
    if (req.method !== 'POST' || req.headers['mor-damgar-wake'] !== '1') return json(res, 403, { error: 'Only an app on this computer wakes Damgar.' }), true;
    try {
      const body = JSON.parse((await readBody(req, 1 << 14)).toString('utf8') || '{}') as Record<string, unknown>;
      if (url.pathname === '/damgar/wake') {
        const origin = text(body.origin);
        if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) return json(res, 400, { error: 'Damgar draws its panel only inside an app on this computer.' }), true;
        const draft = text(body.draft);
        if (!/^[0-9a-f]{64}$/.test(draft)) return json(res, 400, { error: 'The wake-up names no draft.' }), true;
        const item = await damgar.woken({ identity: text(body.identity), draft });
        if (!item) return json(res, 404, { error: 'Damgar did not find the payment on MOR yet: it waits in Damgar, in Waiting, once found.' }), true;
        const fp = randomBytes(32).toString('hex');
        asked.set(fp, { identity: text(body.identity), draft, app: text(body.app).slice(0, 40) || 'an app', origin, nonce: randomBytes(32).toString('hex'), at: now(), item, answer: 'waiting', lines: [] });
        return json(res, 200, { request: fp, panel: `${base()}/damgar/panel/${fp}`, title: item.title }), true;
      }
      if (url.pathname === '/damgar/answer') {
        const a = live(text(body.request));
        return json(res, 200, a ? { answer: a.answer, lines: a.lines } : { answer: 'expired', lines: [] }), true;
      }
      return json(res, 404, { error: 'not found' }), true;
    } catch (err) {
      return json(res, 422, { error: err instanceof Error ? err.message : String(err) }), true;
    }
  };
}
