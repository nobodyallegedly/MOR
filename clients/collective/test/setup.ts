// Real homes and a relay on local ports (the relay program of step 4), the
// collective client's program on another, and a paired client that signs
// its requests exactly as the page does (`src/page/api.ts`, run here in
// Node, whose WebCrypto has Ed25519 too). Nothing is mocked.

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
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

export async function world(): Promise<World> {
  const homes = [await start('home'), await start('home'), await start('home')];
  const relay = await start('relay');
  const dir = mkdtempSync(join(tmpdir(), 'mor-collective-'));
  const app = await serve({ dir, port: 0 });
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
      await app.close();
      for (const h of [...homes, relay]) await h.stop();
    },
  };
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
