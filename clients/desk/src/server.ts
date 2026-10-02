// The desk's program: it holds the test keys, in its folder, and serves its
// page to the browser on this machine only (127.0.0.1). Every request from
// the page is signed by a paired browser, as in the collective client
// (step 11b), with the desk's own domain line, so a request or a pairing
// code made for one program is never good for the other.

import { randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Access, Refusal } from '../../collective/src/access.ts';
import { Desk } from './desk.ts';
import { Store } from './store.ts';
import { STYLE } from './page/view.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR desk, version 1\n';
export const CODE_LABEL = 'MOR desk pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

/** The page's script, built from `src/page/` into memory, not minified, so anyone can read what their browser runs. */
async function pageScript(): Promise<string> {
  const out = await build({
    entryPoints: [here('src/page/app.ts')],
    bundle: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    legalComments: 'inline',
    logLevel: 'warning',
  });
  return out.outputFiles[0].text;
}

const HEADERS = {
  'content-security-policy':
    "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'cache-control': 'no-store',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
};

/** What `open` reads to reach the running program: its port, and a secret only the owner's account can read. */
export interface RunFile {
  port: number;
  pid: number;
  secret: string;
}

export interface Running {
  server: Server;
  port: number;
  base: string;
  store: Store;
  access: Access;
  desk: Desk;
  close(): Promise<void>;
}

function send(res: ServerResponse, status: number, type: string, body: string | Buffer) {
  res.writeHead(status, { ...HEADERS, 'content-type': type });
  res.end(body);
}

const json = (res: ServerResponse, status: number, v: unknown) => send(res, status, 'application/json; charset=utf-8', JSON.stringify(v));

async function readBody(req: IncomingMessage, limit = 1 << 20): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let n = 0;
  for await (const c of req) {
    n += (c as Buffer).length;
    if (n > limit) throw new Refusal(413, 'The request is too large.');
    chunks.push(c as Buffer);
  }
  return Buffer.concat(chunks);
}

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Start the program on 127.0.0.1 at `port` (0: any free port), with its folder at `dir`. */
export async function serve(opts: { dir: string; port: number; drafts?: string }): Promise<Running> {
  const store = new Store(opts.dir);
  if (opts.drafts) store.saveSettings({ ...store.settings(), drafts: opts.drafts });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const desk = new Desk(store);
  const script = await pageScript();
  const index = readFileSync(here('static/index.html'), 'utf8');
  const secret = randomBytes(32).toString('hex');
  let port = opts.port;

  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'state':
        return { ...desk.state(), paired: access.paired().map((p) => ({ ...p, you: p.key === key })) };
      case 'settings': {
        const via: Record<string, string> = {};
        for (const line of list(a.via)) {
          const [from, to] = line.split('=').map((s) => s.trim());
          if (!from || !to) throw new Error(`“${line}”: write it as address=where to reach it`);
          via[from] = to;
        }
        await desk.setSettings({ homes: list(a.homes), relays: list(a.relays), via, drafts: text(a.drafts) });
        return {};
      }
      case 'identity':
        return desk.createIdentity({ name: text(a.name), linked: a.linked === true });
      case 'rename':
        desk.rename(text(a.id), text(a.name));
        return {};
      case 'link':
        desk.link(text(a.id), a.on === true);
        return {};
      case 'drafts':
        return desk.drafts();
      case 'waiting':
        return desk.waiting();
      case 'approve':
        return desk.approve(text(a.digest));
      case 'decline':
        return desk.decline(text(a.digest), text(a.note));
      case 'send back':
        return desk.sendBack(text(a.digest), text(a.note));
      case 'resend':
        return desk.resend(text(a.digest));
      case 'refresh':
        return desk.refresh(text(a.identity));
      case 'sort':
        desk.sort(text(a.identity), text(a.key), text(a.sorted));
        return {};
      case 'code':
        return { code: access.newCode() };
      case 'unpair':
        access.unpair(text(a.key));
        return {};
      default:
        throw new Refusal(400, `unknown operation ${op}`);
    }
  };

  const server = createServer(async (req, res) => {
    try {
      // Only this machine, by its own name: a web page elsewhere that points
      // a name of its own at 127.0.0.1 (DNS rebinding) is refused.
      const host = req.headers.host ?? '';
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 421, 'text/plain', 'not this address');
      const url = new URL(req.url ?? '/', `http://${host}`);
      if (req.method === 'GET') {
        if (url.pathname === '/') return send(res, 200, 'text/html; charset=utf-8', index);
        if (url.pathname === '/app.js') return send(res, 200, 'text/javascript; charset=utf-8', script);
        if (url.pathname === '/app.css') return send(res, 200, 'text/css; charset=utf-8', STYLE);
        if (url.pathname === '/hello') return json(res, 200, { app: access.app, time: Math.floor(Date.now() / 1000) });
        return send(res, 404, 'text/plain', 'not found');
      }
      if (req.method === 'POST' && url.pathname === '/local/code') {
        if (req.headers['mor-local'] !== secret) return json(res, 401, { error: 'not the owner' });
        return json(res, 200, { code: access.newCode() });
      }
      if (req.method === 'POST' && url.pathname === '/api') {
        const body = await readBody(req);
        const r = access.check(body, req.headers['mor-key'] as string | undefined, req.headers['mor-signature'] as string | undefined);
        try {
          return json(res, 200, { ok: (await api(r.op, r.args, r.key)) ?? {} });
        } catch (e) {
          if (e instanceof Refusal) throw e;
          return json(res, 422, { error: e instanceof Error ? e.message : String(e) });
        }
      }
      return send(res, 405, 'text/plain', 'not allowed');
    } catch (e) {
      if (e instanceof Refusal) return json(res, e.status, { error: e.message });
      return json(res, 500, { error: e instanceof Error ? e.message : String(e) });
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(opts.port, '127.0.0.1', () => resolve());
  });
  const a = server.address();
  port = typeof a === 'object' && a ? a.port : opts.port;
  const run = store.path('run.json');
  writeFileSync(`${run}.tmp`, JSON.stringify({ port, pid: process.pid, secret } satisfies RunFile) + '\n', { mode: 0o600 });
  renameSync(`${run}.tmp`, run);
  return {
    server,
    port,
    base: `http://127.0.0.1:${port}`,
    store,
    access,
    desk,
    close: () =>
      new Promise<void>((resolve) => {
        rmSync(run, { force: true });
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}
