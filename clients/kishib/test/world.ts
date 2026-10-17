// What Kišib's tests share: real homes and a relay on local ports, Kišib's
// program, Dubs and an Edubba, each in its own folder, driven through their
// own programs' requests, and the checks that nothing was kept.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN, type Running as DubRunning } from '../../dub/src/server.ts';
import { serve as serveEdubba, type Running as EdubbaRunning } from '../../desk/src/server.ts';
import { serve, DOMAIN, type Running } from '../src/server.ts';

export { start, type Relay };

export const apps: { close(): Promise<void> }[] = [];

export async function closeAll() {
  for (const a of apps.splice(0)) await a.close();
}

export async function kishib(now?: () => number): Promise<{ app: Running; c: Client; dir: string }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'kishib-')), 'mor-kishib');
  const app = await serve({ dir, port: 0, now });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/** A Dub with a new identity made in it: its chain key's words written, three typed back. */
export async function dub(homes: string[], relays: string[]): Promise<{ app: DubRunning; c: Client; dir: string; id: string; chainWords: string[] }> {
  const dir = mkdtempSync(join(tmpdir(), 'kishib-dub-'));
  const app = await serveDub({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DUB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes, relays });
  await c.ask('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  const id = (await c.ask<{ identity: { id: string } }>('state')).identity.id;
  return { app, c, dir, id, chainWords: b.words };
}

/** A Dub with an identity brought in by its signing key's words. */
export async function dubBringing(id: string, words: string, address: string): Promise<{ app: DubRunning; c: Client; dir: string }> {
  const dir = mkdtempSync(join(tmpdir(), 'kishib-dub-'));
  const app = await serveDub({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DUB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('bring', { id, words, address });
  return { app, c, dir };
}

export async function edubba(homes: string[], relays: string[]): Promise<{ app: EdubbaRunning; c: Client; dir: string }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'kishib-edubba-')), 'edubba');
  const app = await serveEdubba({ dir, port: 0, machineEvery: 0, drafts: join(dir, '..', 'drafts') });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes, relays, via: [], drafts: '' });
  return { app, c, dir };
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

/** Every way words or a secret could be written in a file. */
export const forms = (words: string[], ...secrets: Uint8Array[]) => [words.join(' '), words.slice(0, 6).join(' '), ...secrets.flatMap((b) => [hex(b), Buffer.from(b).toString('base64')])];

/** An act's standing, as any reader judges it: its signer looked up, the act added. */
export async function standing(act: string, signer: string, hints: string[]): Promise<string> {
  let bytes: Uint8Array | null = null;
  for (const h of hints) {
    bytes = await relayAt(h).getAct(act).catch(() => null);
    if (bytes) break;
  }
  assert.ok(bytes, `act ${act} found`);
  const l = await lookUp(signer, hints);
  l.verifier.add(bytes!);
  return l.verifier.status(act);
}

/** An identity as a reader of its homes and of the relays given sees it: every act found added, then judged (as the gauntlet's reader, and Kišib, read). */
export async function reader(id: string, hints: string[]): Promise<{ links: { act: string; position: number; how: string }[]; stop: string }> {
  const l = await lookUp(id, hints);
  for (const h of hints) {
    try {
      const rec = await relayAt(h).identity(id);
      for (const b of [...rec.chain, ...rec.receipts, ...rec.evidence]) l.verifier.add(b);
    } catch {
      // a plain relay: no record
    }
    for (const it of (await relayAt(h).feed({ signer: id })).items) if (it.kind === 'act') try { l.verifier.add(it.item); } catch { /* private */ }
  }
  return l.verifier.resolve(id) as { links: { act: string; position: number; how: string }[]; stop: string };
}

/** A member's share in its Dub: shown once, three words typed back, the one-time key destroyed. */
export async function receiveShare(c: Client, act: string): Promise<{ x: number; words: string[] }> {
  const p = (await c.ask<any>('proposals')).proposals.find((x: any) => x.act === act);
  assert.equal(p.share, 'ready', JSON.stringify(p.share));
  const shown = await c.ask<any>('share', { thread: p.thread });
  await c.ask('shareback', { thread: p.thread, typed: shown.positions.map((n: number) => shown.words[n - 1]) });
  return { x: shown.x, words: shown.words };
}

/** A founded collective with a member change signed by everyone and waiting for Kišib. */
export async function founded(homes: Relay[], relay: Relay) {
  const H = homes.map((h) => h.base);
  const e = await edubba(H, [relay.base]);
  const f = await dub(H, [relay.base]);
  const fWords = (await f.c.ask<{ words: string[] }>('carry')).words.join(' ');
  await e.c.ask('bring', { name: 'Nobody, allegedly (test)', id: f.id, words: fWords, address: H[0], linked: false });
  const ana = await dub([H[0]], [relay.base]);
  const bo = await dub([H[1]], [relay.base]);
  const cy = await dub(H, [relay.base]);
  for (const [m, n] of [[ana, 'Ana'], [bo, 'Bo'], [cy, 'Cy']] as const) await e.c.ask('real contact add', { id: m.id, name: n });
  const rv = await e.c.ask<any>('real found prepare', { name: 'The tablet house', founder: f.id, members: [ana.id, bo.id], safety: 2, release: 2, clone: 2, others: 2 });
  const terms = (await e.c.ask<any>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  for (const m of [ana, bo]) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: terms });
  const fd = await e.c.ask<any>('real found', { act: terms });
  const col = fd.acts[0] as string;
  const mine = await e.c.ask<any>('real show share', { collective: col, member: f.id });
  await e.c.ask('real share back', { collective: col, member: f.id, typed: mine.positions.map((n: number) => mine.words[n - 1]) });
  const papers: Record<string, { x: number; words: string[] }> = { [f.id]: { x: mine.x, words: mine.words } };
  for (const m of [ana, bo]) papers[m.id] = await receiveShare(m.c, terms);

  // The member change: Cy joins, Bo leaves. Every voice and the joining member sign, each in their own Dub.
  const ch = await e.c.ask<any>('real change prepare', { collective: col, members: [f.id, ana.id, cy.id] });
  const clone = (await e.c.ask<any>('real confirm', { plan: ch.plan, digest: ch.digest })).acts[0] as string;
  await cy.c.ask('signing', { on: true });
  for (const m of [ana, bo, cy]) {
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
    await m.c.ask('accept', { thread: p.thread });
  }
  const g = await e.c.ask<any>('real gather', { act: clone });
  assert.equal(g.standing.enough, true);
  return { H, e, f, fWords, ana, bo, cy, col, clone, papers };
}

