// The collective client's program: it holds the test keys, in its folder,
// and serves its page to the browser on this machine only (127.0.0.1).
// Every request from the page is signed by a paired browser (access.ts);
// everything that signs an act goes through a review first (actions.ts).

import { randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Access, Refusal } from './access.ts';
import { Actions } from './actions.ts';
import { Store } from './store.ts';
import { STYLE } from './page/view.ts';

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
export async function serve(opts: { dir: string; port: number }): Promise<Running> {
  const store = new Store(opts.dir);
  const access = new Access(opts.dir);
  const actions = new Actions(store);
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
        return { ...(await actions.state()), paired: access.paired().map((p) => ({ ...p, you: p.key === key })) };
      case 'settings': {
        const via: Record<string, string> = {};
        for (const line of list(a.via)) {
          const [from, to] = line.split('=').map((s) => s.trim());
          if (!from || !to) throw new Error(`“${line}”: write it as address=where to reach it`);
          via[from] = to;
        }
        await actions.setSettings({ homes: list(a.homes), relays: list(a.relays), via, checkout: text(a.checkout).trim() || null });
        return {};
      }
      case 'rename':
        actions.rename(text(a.id), text(a.name).trim());
        return {};
      case 'prepare':
        switch (a.kind) {
          case 'identity':
            return actions.prepareIdentity({ name: text(a.name), mine: a.mine === true });
          case 'release':
            return actions.prepareRelease({ publisher: text(a.publisher), version: text(a.version), name: text(a.name) });
          case 'found': {
            const members = list(a.members);
            const shares: Record<string, number> = {};
            if (a.shares && typeof a.shares === 'object') {
              for (const [k, v] of Object.entries(a.shares as Record<string, unknown>)) shares[k] = Number(v);
            }
            return actions.prepareFound({ name: text(a.name), members, rules: rulesOf(a.rules, members.length), words: text(a.words), shares });
          }
          case 'change': {
            const c = store.collective(text(a.collective));
            const n = c.f.members.length - list(a.leave).length + list(a.join).length;
            return actions.prepareChange({
              collective: text(a.collective),
              join: list(a.join),
              leave: list(a.leave),
              rules: a.rules ? rulesOf(a.rules, n) : undefined,
              words: text(a.words),
            });
          }
          case 'sign':
            return actions.prepareSign({ member: text(a.member), release: text(a.release).trim().toLowerCase(), at: list(a.at) });
          case 'leave':
            return actions.prepareLeave({ collective: text(a.collective), member: text(a.member) });
          case 'rollback': {
            const c = store.collective(text(a.collective));
            return actions.prepareRollback({ collective: text(a.collective), rules: a.rules ? rulesOf(a.rules, c.f.members.length) : undefined });
          }
          case 'stepdown':
            return actions.prepareStepDown({ collective: text(a.collective), member: text(a.member) });
          case 'contest':
            return actions.prepareContest({ collective: text(a.collective), declaration: text(a.declaration) });
          case 'declare':
            return actions.prepareDeclare({ collective: text(a.collective), member: text(a.member), signers: list(a.signers) });
          case 'words':
            return actions.prepareWords({ collective: text(a.collective), text: text(a.text), signers: list(a.signers) });
          case 'stakes': {
            const shares: Record<string, number> = {};
            if (a.shares && typeof a.shares === 'object') {
              for (const [k, v] of Object.entries(a.shares as Record<string, unknown>)) shares[k] = Number(v);
            }
            return actions.prepareStakes({ collective: text(a.collective), shares });
          }
          case 'split-service':
            return actions.prepareSplitService({ collective: text(a.collective), service: text(a.service) });
          case 'pointer':
            return actions.preparePointer({ owner: text(a.owner), addresses: list(a.addresses) });
          case 'split': {
            const amounts: Record<string, number> = {};
            if (a.amounts && typeof a.amounts === 'object') {
              for (const [k, v] of Object.entries(a.amounts as Record<string, unknown>)) if (v !== '' && v !== null) amounts[k] = Number(v);
            }
            // To show a deviation the core shows (F171): the split cites no previous split, or the latest's own previous.
            const cite = a.cite === 'none' || a.cite === 'before-latest' ? a.cite : 'latest';
            return actions.prepareSplit({ collective: text(a.collective), amount: Number(a.amount), fee: Number(a.fee ?? 0), amounts, cite });
          }
          case 'fork': {
            const debts: Record<string, number[]> = {};
            if (a.debts && typeof a.debts === 'object') {
              for (const [k, v] of Object.entries(a.debts as Record<string, unknown>)) debts[k] = Array.isArray(v) ? v.map(Number) : [];
            }
            return actions.prepareFork({ collective: text(a.collective), sides: Array.isArray(a.sides) ? a.sides.map(list) : [], debts });
          }
          case 'debt':
            return actions.prepareDebt({ collective: text(a.collective), creditor: text(a.creditor), amount: Number(a.amount) });
          case 'closing':
            return actions.prepareClosing({ collective: text(a.collective) });
          case 'debt-release':
            return actions.prepareDebtRelease({ debt: text(a.debt), against: Array.isArray(a.against) ? a.against.map(String) : [] });
          case 'release-work':
            return actions.prepareReleaseWork({ collective: text(a.collective), release: text(a.release) });
          default:
            throw new Error('unknown kind');
        }
      case 'confirm':
        return actions.confirm(text(a.plan), text(a.digest));
      case 'cancel':
        actions.cancel(text(a.plan));
        return {};
      case 'verify':
        return actions.verify({ release: text(a.release).trim().toLowerCase(), at: list(a.at) });
      case 'resend':
        return actions.resend(text(a.collective));
      case 'check-pointer':
        return actions.checkPointer({ collective: text(a.collective) });
      case 'check-split':
        return actions.checkSplit({ collective: text(a.collective), split: text(a.split) });
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
    close: () =>
      new Promise<void>((resolve) => {
        rmSync(run, { force: true });
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}

/**
 * The numbers of a collective's rules, with the defaults: any 2, absence
 * judged by all the other members, and the constitution changed by every
 * member whose voice remains (no number: F103).
 */
function rulesOf(v: unknown, members: number) {
  const r = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const empty = (x: unknown) => x === undefined || x === null || x === '';
  const n = (x: unknown, d: number) => (empty(x) ? d : Number(x));
  return {
    safety: n(r.safety, 2),
    release: n(r.release, 2),
    clone: n(r.clone, 2),
    others: n(r.others, Math.max(members - 1, 1)),
    ...(empty(r.constitution) ? {} : { constitution: Number(r.constitution) }),
    ...(Array.isArray(r.constitutionNamed) && r.constitutionNamed.length ? { constitutionNamed: r.constitutionNamed.map(String) } : {}),
  };
}
