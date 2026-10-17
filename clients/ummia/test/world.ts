// What Ummia's tests share: real homes and relays on local ports, Ummia's
// program, Dubs and Damgars, each in its own folder, driven through their
// programs' requests (signed by a paired browser key, as the page signs
// them).

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN, type Running as DubRunning } from '../../dub/src/server.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import { serve, DOMAIN, type Running } from '../src/server.ts';

export { start, type Relay };

export const apps: { close(): Promise<void> }[] = [];

export async function closeAll() {
  for (const a of apps.splice(0)) await a.close();
}

/** An Ummia program in a folder of its own, paired. */
export async function ummia(chain?: ChainSource | null): Promise<{ app: Running; c: Client; dir: string }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'ummia-')), 'mor-ummia');
  const app = await serve({ dir, port: 0, chain });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/** A Dub with a new identity made in it. */
export async function dub(homes: string[], relays: string[]): Promise<{ app: DubRunning; c: Client; dir: string; id: string; words: string; chainWords: string[] }> {
  const dir = mkdtempSync(join(tmpdir(), 'ummia-dub-'));
  const app = await serveDub({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DUB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes, relays });
  await c.ask('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  const id = (await c.ask<{ identity: { id: string } }>('state')).identity.id;
  const words = (await c.ask<{ words: string[] }>('carry')).words.join(' ');
  return { app, c, dir, id, words, chainWords: b.words };
}

/** A developer: an identity made in Dub, brought into an Ummia by its signing words, tracking the relays given. */
export async function developer(homes: string[], relays: string[], o: { chain?: ChainSource | null; track?: string[] } = {}) {
  const d = await dub(homes, relays);
  const u = await ummia(o.chain);
  await u.c.ask('bring', { id: d.id, words: d.words, address: homes[0] });
  await u.c.ask('settings', { relays, track: o.track ?? relays });
  return { dub: d, ummia: u, id: d.id };
}

/** A Damgar program, paired. */
export async function damgar(chain?: ChainSource | null) {
  const { serve: serveDamgar, DOMAIN: DAMGAR_DOMAIN } = await import('../../damgar/src/server.ts');
  const dir = join(mkdtempSync(join(tmpdir(), 'ummia-damgar-')), 'mor-damgar');
  const app = await serveDamgar({ dir, port: 0, chain });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DAMGAR_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/** A Kišib program, paired. */
export async function kishib() {
  const { serve: serveKishib, DOMAIN: KISHIB_DOMAIN } = await import('../../kishib/src/server.ts');
  const dir = join(mkdtempSync(join(tmpdir(), 'ummia-kishib-')), 'mor-kishib');
  const app = await serveKishib({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, KISHIB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/** An Edubba program with the test's homes and relays in its settings. */
export async function edubba(homes: string[], relays: string[], chain?: ChainSource | null) {
  const { serve: serveEdubba } = await import('../../desk/src/server.ts');
  const dir = join(mkdtempSync(join(tmpdir(), 'ummia-edubba-')), 'edubba');
  const app = await serveEdubba({ dir, port: 0, machineEvery: 0, drafts: join(dir, '..', 'drafts'), chain });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes, relays, via: [], drafts: '' });
  return { app, c, dir };
}

/** A small folder to release: a plain one, or a git one. */
export function folder(o: { git?: boolean; files?: Record<string, string> } = {}): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'ummia-release-')), 'testrelease');
  mkdirSync(dir, { recursive: true });
  const files = o.files ?? { 'README.md': '# A test release\n', 'src/main.ts': 'export const answer = 42;\n', '.hidden': 'not released\n' };
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(join(dir, p, '..'), { recursive: true });
    writeFileSync(join(dir, p), body);
  }
  if (o.git) {
    const g = (...a: string[]) => execFileSync('git', a, { cwd: dir, stdio: 'ignore' });
    g('init', '-q');
    g('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'add', '.');
    g('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-q', '-m', 'test');
  }
  return dir;
}

export const refused = async (p: Promise<unknown>, words: RegExp) => {
  await assert.rejects(p, (e: Error) => {
    assert.match(e.message, words);
    return true;
  });
};

/** Every file under a folder, read whole. */
export function everything(dir: string): string {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(readFileSync(p).toString('latin1'));
    }
  };
  walk(dir);
  return out.join('\n');
}
