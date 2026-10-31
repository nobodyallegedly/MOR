// Real homes and a relay on local ports (the relay program of step 4), the
// collective client's program on another, and a paired client that signs
// its requests exactly as the page does (`src/page/api.ts`, run here in
// Node, whose WebCrypto has Ed25519 too). Nothing is mocked.

import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cborEncode, describeAct } from '../../genesis/src/core.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done, type Reading, type Review, type State } from '../src/page/api.ts';

export interface World {
  homes: Relay[];
  relay: Relay;
  app: Running;
  client: Client;
  checkout: string;
  stop(): Promise<void>;
}

/** A small git repository to release, so the tests stay quick. */
export function checkout(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mor-collective-checkout-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'README.md'), '# A test project\n');
  writeFileSync(join(dir, 'src', 'main.rs'), 'fn main() {}\n');
  const git = (...a: string[]) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('add', '.');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-q', '-m', 'first');
  return dir;
}

export function commit(dir: string, path: string, text: string): void {
  writeFileSync(join(dir, path), text);
  const git = (...a: string[]) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
  git('add', '.');
  git('-c', 'user.name=test', '-c', 'user.email=test@example.invalid', 'commit', '-q', '-m', path);
}

/**
 * Stop whatever was started, whatever the outcome, each within a bound: a
 * server left running keeps the test file's process alive, and the CI job
 * waits for it until its time limit (Part 4). A relay process that already
 * exited never says so again, so its stop is not waited for past the bound.
 */
export async function stopAll(things: ({ stop?: () => Promise<void>; close?: () => Promise<void> } | null | undefined)[]): Promise<void> {
  const errors: unknown[] = [];
  for (const t of things) {
    if (!t) continue;
    try {
      const done = t.close ? t.close() : t.stop!();
      await Promise.race([done, new Promise<void>((ok) => setTimeout(ok, 10_000).unref())]);
    } catch (e) {
      errors.push(e);
    }
    // A relay still running past the bound is killed.
    const proc = (t as unknown as { proc?: { kill(sig: string): void } | null }).proc;
    if (proc) proc.kill('SIGKILL');
  }
  if (errors.length) throw errors[0];
}

/** Every lossy relay still open, closed by the world's `stop` whatever the outcome of the test that opened it. */
const lossyOpen = new Set<{ close(): Promise<void> }>();

export async function world(): Promise<World> {
  const started: Parameters<typeof stopAll>[0] = [];
  try {
    const homes: Relay[] = [];
    for (let i = 0; i < 3; i++) {
      const h = await start('home');
      started.push(h);
      homes.push(h);
    }
    const relay = await start('relay');
    started.push(relay);
    const dir = mkdtempSync(join(tmpdir(), 'mor-collective-'));
    const app = await serve({ dir, port: 0 });
    started.unshift(app);
    const client = await Client.open(await newKey(), app.base);
    await client.ask('pair', { code: app.access.newCode(), label: 'test' });
    const co = checkout();
    await client.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base, homes[0].base], via: [], checkout: co });
    return {
      homes,
      relay,
      app,
      client,
      checkout: co,
      async stop() {
        await stopAll([...lossyOpen, ...started]);
      },
    };
  } catch (e) {
    // Started before the failure: stopped now, so nothing is left running.
    await stopAll(started).catch(() => undefined);
    throw e;
  }
}

/** Everything the page shows of a reading, as one text, to look for words in. */
export function words(r: Reading): string {
  return [r.title, ...r.summary, ...r.blocking, ...r.sections.flatMap((s) => [s.heading, ...s.lines.map((l) => l.text)]), ...r.plain.map((p) => p.text)].join('\n');
}

export async function prepare(c: Client, args: object): Promise<Review> {
  return c.ask<Review>('prepare', args);
}

/** Prepare, check nothing blocks it, then sign exactly what was shown. */
export async function sign(c: Client, args: object): Promise<{ review: Review; done: Done }> {
  const review = await prepare(c, args);
  if (review.reading.blocking.length) throw new Error(`blocked: ${review.reading.blocking.join('; ')}`);
  const done = await c.ask<Done>('confirm', { plan: review.plan, digest: review.digest });
  return { review, done };
}

export const state = (c: Client) => c.ask<State>('state');

const unhex = (h: string) => Uint8Array.from(h.match(/../g)!.map((x) => parseInt(x, 16)));

/**
 * A relay in front of another: everything passes, except that while `drop`
 * is set an Agreements act of one of the types in `types` (by default a record of
 * a collective, Agreements type 17) is answered as taken and never passed on.
 * What a person sees when a relay loses an act: the client was told it
 * arrived.
 */
export async function lossy(target: string): Promise<{ base: string; drop: boolean; types: number[]; close(): Promise<void> }> {
  const state = { drop: false, types: [AGREEMENTS_TYPES.record] as number[] };
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const ch of req) chunks.push(ch as Buffer);
    const body = Buffer.concat(chunks);
    if (state.drop && req.method === 'POST' && req.url === '/acts') {
      const d = describeAct(new Uint8Array(body)) as { id: string; spec?: string; type?: number };
      if (d.spec === REPO_SPECS.agreements && d.type !== undefined && state.types.includes(d.type)) {
        res.writeHead(200, { 'content-type': 'application/cbor' });
        res.end(Buffer.from(cborEncode(new Map<number, unknown>([[0, unhex(d.id)], [1, 0]]))));
        return;
      }
    }
    try {
      const r = await fetch(target + req.url, { method: req.method, headers: { 'content-type': req.headers['content-type'] ?? 'application/cbor' }, body: req.method === 'GET' ? undefined : body });
      res.writeHead(r.status, { 'content-type': r.headers.get('content-type') ?? 'application/cbor' });
      res.end(Buffer.from(await r.arrayBuffer()));
    } catch {
      // The relay behind it is away: say so, never leave the request hanging.
      res.writeHead(502);
      res.end();
    }
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const port = (server.address() as { port: number }).port;
  const close = () =>
    new Promise<void>((ok) => {
      lossyOpen.delete(out);
      server.close(() => ok());
      server.closeAllConnections();
    });
  const out = {
    base: `http://127.0.0.1:${port}`,
    get drop() {
      return state.drop;
    },
    set drop(x: boolean) {
      state.drop = x;
    },
    get types() {
      return state.types;
    },
    set types(x: number[]) {
      state.types = x;
    },
    close,
  };
  lossyOpen.add(out);
  return out;
}
