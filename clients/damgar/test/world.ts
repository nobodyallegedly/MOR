// What Damgar's tests share: real homes and a relay on local ports, Damgar's
// program and Dubs, each in its own folder, driven through their programs'
// requests (signed by a paired browser key, as the page signs them).

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN, type Running as DubRunning } from '../../dub/src/server.ts';
import type { ChainSource } from '../src/chain.ts';
import type { InvoiceLink, LinkConfig } from '../src/link.ts';
import { serve, DOMAIN, type Running } from '../src/server.ts';
import { ACCEPTABLE } from '../src/specs.ts';

export { start, type Relay };

export const apps: { close(): Promise<void> }[] = [];

export async function closeAll() {
  for (const a of apps.splice(0)) await a.close();
}

/** A Damgar program in a folder of its own, paired. */
export async function damgar(chain?: ChainSource | null, link?: (c: LinkConfig) => Promise<InvoiceLink>): Promise<{ app: Running; c: Client; dir: string }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'damgar-')), 'mor-damgar');
  const app = await serve({ dir, port: 0, chain, link });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/** A Dub with a new identity made in it. */
export async function dub(homes: string[], relays: string[]): Promise<{ app: DubRunning; c: Client; dir: string; id: string; words: string; chainWords: string[] }> {
  const dir = mkdtempSync(join(tmpdir(), 'damgar-dub-'));
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

/** A person: an identity made in Dub, brought into a Damgar by its signing words, everything accepted but what is given. */
export async function person(homes: string[], relays: string[], o: { accept?: string[] | null; chain?: ChainSource | null; link?: (c: LinkConfig) => Promise<InvoiceLink> } = {}) {
  const d = await dub(homes, relays);
  const g = await damgar(o.chain, o.link);
  await g.c.ask('bring', { id: d.id, words: d.words, address: homes[0] });
  if (o.accept !== null) await g.c.ask('accept', { keys: o.accept ?? ACCEPTABLE.map((a) => a.key) });
  return { dub: d, damgar: g, id: d.id };
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

/** An Edubba program, following `chain`, with the test's homes and relays in its settings. */
export async function edubba(homes: string[], relays: string[], chain?: ChainSource | null) {
  const { serve: serveEdubba } = await import('../../desk/src/server.ts');
  const dir = join(mkdtempSync(join(tmpdir(), 'damgar-edubba-')), 'edubba');
  const app = await serveEdubba({ dir, port: 0, machineEvery: 0, drafts: join(dir, '..', 'drafts'), chain });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes, relays, via: [], drafts: '' });
  return { app, c, dir };
}

/** A real collective founded in Edubba by a founder made in Dub, with two other members in their own Dubs (as Kišib's tests found one). */
export async function founded(H: string[], R: string[], e: Awaited<ReturnType<typeof edubba>>) {
  const f = await dub(H, R);
  await e.c.ask('bring', { name: 'Nobody, allegedly (test)', id: f.id, words: f.words, address: H[0], linked: false });
  const ana = await dub(H, R);
  const bo = await dub(H, R);
  await e.c.ask('real contact add', { id: ana.id, name: 'Ana' });
  await e.c.ask('real contact add', { id: bo.id, name: 'Bo' });
  const rv = await e.c.ask<any>('real found prepare', { name: 'The tablet house', founder: f.id, members: [ana.id, bo.id], safety: 2, release: 2, clone: 2, others: 2 });
  const terms = (await e.c.ask<any>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  for (const m of [ana, bo]) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: terms });
  const fd = await e.c.ask<any>('real found', { act: terms, read: true });
  return { f, ana, bo, col: fd.acts[0] as string };
}

/** A Kišib program, paired. */
export async function kishib() {
  const { serve: serveKishib, DOMAIN: KISHIB_DOMAIN } = await import('../../kishib/src/server.ts');
  const dir = join(mkdtempSync(join(tmpdir(), 'damgar-kishib-')), 'mor-kishib');
  const app = await serveKishib({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, KISHIB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/**
 * A receive-only link to a test node (F351), standing in for lnd with a
 * macaroon baked for invoices alone: it makes invoices, and keeps each
 * one's preimage so the test can pay it as a wallet would. `wide`: a
 * permission that can read the balance, which Damgar refuses.
 */
export function testLink(node: { invoice(sat: number, hash: string): { invoice: string; preimage: string } }, o: { wide?: boolean } = {}) {
  const preimages = new Map<string, string>();
  const made: string[] = [];
  const factory = async (): Promise<InvoiceLink> => ({
    async invoice(sat, descriptionHash) {
      const x = node.invoice(sat, descriptionHash);
      preimages.set(x.invoice, x.preimage);
      made.push(x.invoice);
      return x.invoice;
    },
    async tooWide() {
      return !!o.wide;
    },
  });
  return { factory, preimages, made, config: { rest: 'https://127.0.0.1:1', macaroon: 'ab'.repeat(16), cert: 'test' } };
}
