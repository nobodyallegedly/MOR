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

/** The runner's passphrase in these tests (the Dubsar runner cMIP, draft 2): a test value. */
export const PASS = 'test passphrase, not a real one';

/** Turn Kišib's runner on: the risk read, the passphrase chosen, typed twice. */
export const runnerOn = (c: Client) => c.ask('runner on', { read: true, passphrase: PASS, again: PASS });

/** Kišib closed and opened again on the same folder (the Mac restarted, or Kišib quit): a new program, a new page paired. */
export async function kishibAgain(k: { app: Running; dir: string }): Promise<{ app: Running; c: Client; dir: string }> {
  // On its own port again, as on the Mac (Dub's policy frames Kišib's origin by its port).
  const port = k.app.port;
  await k.app.close();
  apps.splice(apps.indexOf(k.app), 1);
  const app = await serve({ dir: k.dir, port });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir: k.dir };
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

type Sat = { sitting: { positions?: number[]; stage: string; act: string | null; words?: string; lines: { text: string }[] } };

/**
 * A change of keys (or an escape) confirmed in Kišib, to the end (H79,
 * Nobody, allegedly, 21 October 2026: "confirming the new chain key comes
 * before signing the rotation, confirming the new signing key can come
 * after"): the new paper's words shown, written, three typed back, and only
 * then the change signed and sent; sent again until it counts; then the new
 * signing key's words, the same. Both sets, as a person writes them down.
 */
export async function changeKeys(c: Client, review: { plan: string; digest: string; warning?: string | null }): Promise<{ chain: string[]; signing: string[]; act: string }> {
  let s = await c.ask<Sat>('confirm', { plan: review.plan, digest: review.digest, ...(review.warning ? { warned: review.warning } : {}) });
  assert.equal(s.sitting.stage, 'paper', 'the new paper first, before anything is signed');
  assert.equal(s.sitting.act, null, 'nothing signed yet');
  const ch = await c.ask<{ words: string[]; which?: string }>('words show');
  assert.equal(ch.which, 'chain');
  s = await c.ask<Sat>('words written');
  s = await c.ask<Sat>('words typed', { typed: s.sitting.positions!.map((p) => ch.words[p - 1]) });
  for (let i = 0; s.sitting.stage === 'sent' && i < 3; i++) s = await c.ask<Sat>('resend');
  assert.equal(s.sitting.stage, 'counts', JSON.stringify(s.sitting.lines));
  const act = s.sitting.act!;
  const sg = await c.ask<{ words: string[]; which?: string }>('words show');
  assert.equal(sg.which, 'signing');
  s = await c.ask<Sat>('words written');
  s = await c.ask<Sat>('words typed', { typed: s.sitting.positions!.map((p) => sg.words[p - 1]) });
  assert.equal(s.sitting.stage, 'done');
  return { chain: ch.words, signing: sg.words, act };
}

/** The same, for a Kišib held in this process. */
export async function changeKeysHere(
  k: { confirm(a: { plan: string; digest: string; warned?: string }): Promise<Sat | unknown>; showWords(): { words: string[]; which?: string }; written(): unknown; typed(a: { typed: string[] }): Promise<unknown>; resend(): Promise<unknown>; state(): unknown },
  review: { plan: string; digest: string; warning?: string | null },
): Promise<{ chain: string[]; signing: string[] }> {
  const st = () => k.state() as Sat;
  await k.confirm({ plan: review.plan, digest: review.digest, ...(review.warning ? { warned: review.warning } : {}) });
  assert.equal(st().sitting.stage, 'paper');
  const ch = k.showWords();
  assert.equal(ch.which, 'chain');
  k.written();
  await k.typed({ typed: st().sitting.positions!.map((p) => ch.words[p - 1]) });
  for (let i = 0; st().sitting.stage === 'sent' && i < 3; i++) await k.resend();
  assert.equal(st().sitting.stage, 'counts', JSON.stringify(st().sitting.lines));
  const sg = k.showWords();
  assert.equal(sg.which, 'signing');
  k.written();
  await k.typed({ typed: st().sitting.positions!.map((p) => sg.words[p - 1]) });
  return { chain: ch.words, signing: sg.words };
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
  const fd = await e.c.ask<any>('real found', { act: terms, read: true });
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


// ---------------------------------------------------------------- the runner (the Dubsar runner cMIP)

/** A Dub on this computer that knows where Kišib's folder is. */
export async function dubBeside(kishibDir: string) {
  const dir = mkdtempSync(join(tmpdir(), 'kishib-runner-dub-'));
  const app = await serveDub({ dir, port: 0, kishib: kishibDir });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DUB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c, dir };
}

/** The panel, as its frame loads it and the person clicks in it. */
export async function clickPanel(panel: string, answer: 'sign' | 'decline', always = false): Promise<string> {
  const html = await (await fetch(panel, { headers: { 'sec-fetch-dest': 'iframe' } })).text();
  const n = /name="n" value="([0-9a-f]+)"/.exec(html)?.[1];
  assert.ok(n, html);
  const body = new URLSearchParams({ n, answer, ...(always ? { always: 'on' } : {}) });
  return (await fetch(panel, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'sec-fetch-dest': 'iframe' }, body })).text();
}

/** Wait for Dub's request to show its panel. */
export async function asking(c: Client): Promise<{ request: string; panel: string; title: string }> {
  for (let i = 0; i < 200; i++) {
    const a = (await c.ask<{ asking: { request: string; panel: string; title: string } | null }>('runner asking')).asking;
    if (a) return a;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('no panel was asked for');
}

