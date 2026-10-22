// Kišib's program: it serves Kišib's page to the browser on this machine
// only (127.0.0.1), built at start under a content security policy, and
// runs Kišib's code (`kishib.ts`) for it. Every request from the page is
// signed by a paired browser (the collective client's `access.ts`), with
// Kišib's own domain line, so a request or a pairing code made for Dub or
// Edubba is never good here. The server itself is Edubba's
// (`clients/desk/src/local.ts`).
//
// Its folder holds what pairing needs and nothing else: the paired
// browsers' public keys (`access.json`) and how to reach the running
// program (`run.json`). Never a word, a key or an act: what Kišib holds for
// an act lives in this program's memory, and is gone when it stops. The one
// exception is the runner, while it is on and only then (`runner.json`: the
// signing keys given to it, its pairings, what it signed; the Dubsar runner
// cMIP, decided by Nobody, allegedly).
//
// The runner's doors (`/runner/…`): one for apps on this computer (pairing,
// requests, answers; JSON, a token in a header, never readable by a web
// page), and one for its panel, a page framed only by the origin of the
// pairing that asked, carrying no script.

import type { Server } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { json, pageScript, readBody, send, serveLocal } from '../../desk/src/local.ts';
import { KIT_STYLE } from '../../kit/src/style.ts';
import { RunnerRefusal, Runner, readRequest } from './runner.ts';
import { panel, panelSaid, PANEL_STYLE } from './page/panel.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
import { Kishib } from './kishib.ts';
import { OPS, run } from './ops.ts';
import { STYLE } from './page/view.ts';
import { version } from './version.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR Kišib, version 1\n';
export const CODE_LABEL = 'MOR Kišib pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  access: Access;
  kishib: Kishib;
  runner: Runner;
  close(): Promise<void>;
}

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

/** The largest request an app sends (a film, 64 MiB, in base64, with room). */
const RUNNER_LIMIT = 96 << 20;

/** The panel's headers (4.2): framed only by the pairing's origin; its form sent only here; no script. */
const panelHeaders = (ancestors: string[]) => ({
  'content-security-policy': `default-src 'none'; style-src 'self'; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors ${ancestors.length ? ancestors.join(' ') : "'none'"}`,
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'cache-control': 'no-store',
});

/** The panel's own style and fonts, loaded by a frame of no origin of its own: allowed across origins, public files. */
const publicHeaders = { 'x-content-type-options': 'nosniff', 'cache-control': 'no-store', 'cross-origin-resource-policy': 'cross-origin', 'access-control-allow-origin': '*' };

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`. */
export async function serve(opts: { dir: string; port: number; now?: () => number; via?: import('../../genesis/src/transport.ts').Via }): Promise<Running> {
  mkdirSync(opts.dir, { recursive: true, mode: 0o700 });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const kishib = new Kishib({ now: opts.now });
  const runner = new Runner(opts.dir, { via: opts.via });
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();
  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'code':
        return { code: access.newCode() };
      case 'unpair':
        access.unpair(text(a.key));
        return {};
      case 'state':
        return { ...kishib.state(), runner: runner.view() };
      // The runner, from Kišib's own page (section 6 and 2.2): the program only, never the web client.
      case 'runner state':
        return runner.view();
      case 'runner on':
        return runner.turnOn({ read: a.read === true });
      case 'runner off':
        return runner.turnOff();
      case 'runner give':
        return runner.give({ id: text(a.id), address: text(a.address), words: text(a.words) });
      case 'runner remove':
        return runner.remove({ id: text(a.id) });
      case 'runner approve':
        return runner.approve({ pairing: text(a.pairing), identities: list(a.identities) });
      case 'runner revoke':
        return runner.revoke({ pairing: text(a.pairing) });
      case 'runner yes':
        return runner.setYes({ pairing: text(a.pairing), kind: text(a.kind), on: a.on === true });
      case 'runner answer':
        return runner.pageAnswer({ request: text(a.request), yes: a.yes === true, always: a.always === true });
      case 'runner cards':
        return { cards: runner.cards(text(a.id)) };
      case 'runner standing':
        return runner.standing({ act: text(a.act), identity: text(a.identity) });
      default:
        if (!(OPS as readonly string[]).includes(op)) throw new Refusal(400, `unknown operation ${op}`);
        return run(kishib, op, a);
    }
  };
  // Inter and its licence, Dub's files, served beside the page from the program's own origin (F332).
  const files: Record<string, { type: string; body: Buffer }> = Object.fromEntries(Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(here(`../dub/${FONTS_DIR}/${name}`)) }]));
  // Kišib's icon, beside its name at the top (the kit's app mark), as the web client serves it.
  files['/icon.png'] = { type: 'image/png', body: readFileSync(here('static/icon/kishib.png')) };
  let base = '';
  const routes = async (req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> => {
    if (!url.pathname.startsWith('/runner/')) return false;
    const fail = (e: unknown) => json(res, e instanceof RunnerRefusal ? e.status : 422, { error: e instanceof Error ? e.message : String(e) });
    const token = req.headers['mor-runner'] as string | undefined;
    // The panel's style and fonts.
    if (req.method === 'GET' && url.pathname === '/runner/panel.css') return send(res, 200, 'text/css; charset=utf-8', `${KIT_STYLE}\n${PANEL_STYLE}`, publicHeaders), true;
    const font = /^\/runner\/(inter_(?:light|regular)\.woff2)$/.exec(url.pathname);
    if (req.method === 'GET' && font) return send(res, 200, 'font/woff2', files[`/${font[1]}`].body, publicHeaders), true;
    // The panel (section 4): into a frame only, of the pairing's origin only.
    const pm = /^\/runner\/panel\/([0-9a-f]{64})$/.exec(url.pathname);
    if (pm) {
      const fp = pm[1];
      const dest = req.headers['sec-fetch-dest'];
      if (dest && dest !== 'iframe') return send(res, 403, 'text/plain; charset=utf-8', 'Kišib’s panel is shown only inside the app that asked.', panelHeaders([])), true;
      if (req.method === 'GET') {
        const x = runner.panelFor(fp);
        if (!x) return send(res, 200, 'text/html; charset=utf-8', panelSaid({ title: 'Nothing waits here', text: 'This request was answered, withdrawn, or waited past its ten minutes. Nothing more is signed from this panel.' }), panelHeaders(runner.ancestorsOf(fp))), true;
        return send(res, 200, 'text/html; charset=utf-8', panel({ request: fp, nonce: x.nonce, ...runner.panelWords(x) }), panelHeaders(x.ancestors)), true;
      }
      if (req.method === 'POST') {
        const ancestors = runner.ancestorsOf(fp);
        let said: 'signed' | 'declined' | 'stale';
        try {
          const form = new URLSearchParams((await readBody(req, 1 << 14)).toString('utf8'));
          said = runner.panelAnswer(fp, { nonce: form.get('n') ?? '', yes: form.get('answer') === 'sign', always: form.get('always') === 'on' });
        } catch (e) {
          return send(res, 200, 'text/html; charset=utf-8', panelSaid({ title: 'Not signed', text: e instanceof Error ? e.message : String(e) }), panelHeaders(ancestors)), true;
        }
        const words = { signed: { title: 'Signed', text: 'Kišib signed it. The app has its signature.' }, declined: { title: 'Declined', text: 'Nothing was signed.' }, stale: { title: 'Not signed', text: 'This panel is no longer the one Kišib drew for this request: nothing was signed from it.' } }[said];
        return send(res, 200, 'text/html; charset=utf-8', panelSaid(words), panelHeaders(ancestors)), true;
      }
      return send(res, 405, 'text/plain', 'not allowed'), true;
    }
    // The door for apps (sections 2 to 4): JSON, POST only, a header a web page cannot send without asking first.
    if (req.method !== 'POST' || (!token && !req.headers['mor-runner-pair'])) return json(res, 403, { error: 'Only an app on this computer talks to Kišib’s runner.' }), true;
    try {
      const body = (await readBody(req, url.pathname === '/runner/ask' ? RUNNER_LIMIT : 1 << 16)).toString('utf8');
      const a = (body ? JSON.parse(body) : {}) as Record<string, unknown>;
      switch (url.pathname) {
        case '/runner/pair':
          return json(res, 200, runner.pair({ name: text(a.name), origin: text(a.origin) })), true;
        case '/runner/paired':
          return json(res, 200, runner.paired(token)), true;
        case '/runner/unpair':
          runner.unpair(token);
          return json(res, 200, {}), true;
        case '/runner/ask':
          return json(res, 200, await runner.ask(token, readRequest(a), base)), true;
        case '/runner/answer':
          return json(res, 200, await runner.result(token, { request: text(a.request), wait: typeof a.wait === 'number' ? a.wait : 0 })), true;
        case '/runner/drop':
          runner.drop(token, { request: text(a.request) });
          return json(res, 200, {}), true;
        default:
          return json(res, 404, { error: 'not found' }), true;
      }
    } catch (e) {
      return fail(e), true;
    }
  };
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files, routes });
  base = local.base;
  return {
    server: local.server,
    port: local.port,
    base: local.base,
    access,
    kishib,
    runner,
    close: async () => {
      kishib.forget();
      await local.close();
    },
  };
}
