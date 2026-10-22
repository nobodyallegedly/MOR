// A program on this machine only (127.0.0.1) serving one page, built at
// start and not minified, under a content security policy, with every
// request from the page signed by a paired browser (the collective client's
// `access.ts`). The desk's, shared with Dub (`clients/dub`, called MOR Post until 13 October 2026): each
// program gives its own page, its own operations and its own domain line.

import { randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { Access, Refusal } from '../../collective/src/access.ts';

export const HEADERS = {
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
  /** The fingerprint of the code it was started from; absent before 4 October 2026. */
  version?: string;
}

export function send(res: ServerResponse, status: number, type: string, body: string | Buffer, headers: Record<string, string> = HEADERS) {
  res.writeHead(status, { ...headers, 'content-type': type });
  res.end(body);
}

export const json = (res: ServerResponse, status: number, v: unknown) => send(res, status, 'application/json; charset=utf-8', JSON.stringify(v));

export async function readBody(req: IncomingMessage, limit = 1 << 20): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let n = 0;
  for await (const c of req) {
    n += (c as Buffer).length;
    if (n > limit) throw new Refusal(413, 'The request is too large.');
    chunks.push(c as Buffer);
  }
  return Buffer.concat(chunks);
}

/** The page's script, built from its entry into memory, not minified, so anyone can read what their browser runs. */
export async function pageScript(entry: string): Promise<string> {
  const out = await build({
    entryPoints: [entry],
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

export type Api = (op: string, args: Record<string, unknown>, key: string) => Promise<unknown>;

export interface Local {
  server: Server;
  port: number;
  base: string;
  close(): Promise<void>;
}

/**
 * Listen on 127.0.0.1 at `port` (0: any free port) and serve the page, its
 * script and style, `/hello`, a pairing code to the owner's account
 * (`/local/code`, with the secret in `run.json`), and the signed API.
 * Writes `run.json` in `dir`, owner-only.
 */
export async function serveLocal(opts: {
  dir: string;
  port: number;
  access: Access;
  index: string;
  script: string;
  style: string;
  version: string;
  api: Api;
  /** The largest request body accepted, in bytes (default 1 MiB). */
  limit?: number;
  /**
   * Other files the page loads, by path (`/name`), with their type: Dub's
   * fonts. Where one is a font, this program's policy adds `font-src 'self'`;
   * a program serving none (the desk) keeps its own unchanged.
   */
  files?: Record<string, { type: string; body: Buffer }>;
  /** Films played from bytes checked in the page (Dub, the video Module): the policy adds `media-src blob:`; a program asking none keeps its own unchanged. */
  media?: boolean;
}): Promise<Local> {
  const { access } = opts;
  const files = opts.files ?? {};
  let csp = HEADERS['content-security-policy'];
  if (Object.values(files).some((f) => f.type.startsWith('font/'))) csp = csp.replace("style-src 'self';", "style-src 'self'; font-src 'self';");
  if (opts.media) csp = csp.replace("img-src 'self' data:;", "img-src 'self' data:; media-src blob:;");
  const headers = csp === HEADERS['content-security-policy'] ? HEADERS : { ...HEADERS, 'content-security-policy': csp };
  const reply = (res: ServerResponse, status: number, type: string, body: string | Buffer) => send(res, status, type, body, headers);
  const secret = randomBytes(32).toString('hex');
  let port = opts.port;
  const server = createServer(async (req, res) => {
    try {
      // Only this machine, by its own name: a web page elsewhere that points
      // a name of its own at 127.0.0.1 (DNS rebinding) is refused.
      const host = req.headers.host ?? '';
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return send(res, 421, 'text/plain', 'not this address');
      const url = new URL(req.url ?? '/', `http://${host}`);
      if (req.method === 'GET') {
        if (url.pathname === '/') return reply(res, 200, 'text/html; charset=utf-8', opts.index);
        if (url.pathname === '/app.js') return reply(res, 200, 'text/javascript; charset=utf-8', opts.script);
        if (url.pathname === '/app.css') return reply(res, 200, 'text/css; charset=utf-8', opts.style);
        const file = Object.hasOwn(files, url.pathname) ? files[url.pathname] : null;
        if (file) return reply(res, 200, file.type, file.body);
        if (url.pathname === '/hello') return json(res, 200, { app: access.app, time: Math.floor(Date.now() / 1000), pid: process.pid, version: opts.version });
        return send(res, 404, 'text/plain', 'not found');
      }
      if (req.method === 'POST' && url.pathname === '/local/code') {
        if (req.headers['mor-local'] !== secret) return json(res, 401, { error: 'not the owner' });
        return json(res, 200, { code: access.newCode() });
      }
      if (req.method === 'POST' && url.pathname === '/api') {
        const body = await readBody(req, opts.limit);
        const r = access.check(body, req.headers['mor-key'] as string | undefined, req.headers['mor-signature'] as string | undefined);
        try {
          return json(res, 200, { ok: (await opts.api(r.op, r.args, r.key)) ?? {} });
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
  const run = join(opts.dir, 'run.json');
  writeFileSync(`${run}.tmp`, JSON.stringify({ port, pid: process.pid, secret, version: opts.version } satisfies RunFile) + '\n', { mode: 0o600 });
  renameSync(`${run}.tmp`, run);
  return {
    server,
    port,
    base: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve) => {
        rmSync(run, { force: true });
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}
