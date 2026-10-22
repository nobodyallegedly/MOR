// The Dubsar runner (`cmips/cmip-runner-draft-1.md`), its programs talking
// as they do on the Mac: Kišib's program and Dub's, against real homes and a
// relay on local ports. The panel is answered here as its frame answers it
// (a form carrying the single-use value Kišib wrote into it); its drawing
// inside Dub's window, by clicks, is in `runner-browser.test.ts`.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hex } from '../../genesis/src/core.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN } from '../../dub/src/server.ts';
import { apps, closeAll, dub, everything, kishib, refused, standing, start, type Relay } from './world.ts';
import { OFF_SAY, RUNNER_SPENT_SAY, type RunnerView } from '../src/runner.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

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

test('the runner: off by default, the risk read first, Dub paired and approved, a post through its panel, a standing yes, money and agreements always asking, Waiting, Revoke, off with every key gone', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const k = await kishib();

  // Off by default: nothing in Kišib's folder but what pairing its page needs.
  let v = await k.c.ask<RunnerView>('runner state');
  assert.equal(v.on, false);
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  const d = await dubBeside(k.dir);
  await refused(d.c.ask('runner pair'), new RegExp(OFF_SAY.slice(0, 30)));

  // Turned on only once the risk is read.
  await refused(k.c.ask('runner on', { read: false }), /Read the risk/);
  v = await k.c.ask<RunnerView>('runner on', { read: true });
  assert.equal(v.on, true);
  assert.match(v.risk.join(' '), /whoever gets into this Mac can sign/i);

  // An identity given by its signing words; never the chain key's.
  await refused(k.c.ask('runner give', { id: a.id, address: H[0], words: a.chainWords.join(' ') }), /never the chain key’s/);
  v = await k.c.ask<RunnerView>('runner give', { id: a.id, address: H[0], words });
  assert.equal(v.held.length, 1);

  // Pairing started in Dub, the same code in Kišib, approved there.
  const { code } = await d.c.ask<{ code: string }>('runner pair');
  v = await k.c.ask<RunnerView>('runner state');
  const p = v.apps.find((x) => x.code === code)!;
  assert.equal(p.name, 'Dub');
  assert.equal(p.state, 'waiting');
  await refused(d.c.ask('runner take', { id: a.id }), /not approved Dub yet/);
  await k.c.ask('runner approve', { pairing: p.id, identities: [a.id] });
  const took = await d.c.ask<{ lines: { text: string }[] }>('runner take', { id: a.id });
  assert.match(took.lines[0].text, /Kišib holds its signing key, Dub none/);
  // Dub holds no key of it.
  for (const f of [hex(fromWords(words)), words]) assert.ok(!everything(d.dir).includes(f), 'no key in Dub’s folder');
  await refused(d.c.ask('carry'), /Kišib’s runner holds this identity’s signing key/);

  // A post: its panel asked for, answered with Sign it.
  const posting = d.c.ask<{ post: { id: string } }>('post', { text: 'Through the runner.' });
  const ask1 = await asking(d.c);
  assert.equal(ask1.title, 'Dub asks Kišib to sign a post');
  assert.match(await clickPanel(ask1.panel, 'sign'), /Signed/);
  const post1 = (await posting).post.id;
  assert.equal(await standing(post1, a.id, [...H, relay.base]), 'valid');

  // A standing yes for Dub's posts, from the panel's box: the next post signs with no panel.
  const posting2 = d.c.ask<{ post: { id: string } }>('post', { text: 'Second, with a standing yes given.' });
  assert.match(await clickPanel((await asking(d.c)).panel, 'sign', true), /Signed/);
  await posting2;
  v = await k.c.ask<RunnerView>('runner state');
  assert.deepEqual(v.apps[0].yes, ['posts']);
  const post3 = (await d.c.ask<{ post: { id: string } }>('post', { text: 'Third: no panel.' })).post.id;
  assert.equal(await standing(post3, a.id, [...H, relay.base]), 'valid');
  assert.equal((await d.c.ask<{ asking: unknown }>('runner asking')).asking, null);

  // Money always asks, even with a standing yes for its kind refused: declined here, nothing signed.
  await refused(k.c.ask('runner yes', { pairing: p.id, kind: 'money', on: true }), /always ask/);
  const unit = (await d.c.ask<{ units: { hash: string }[] }>('state')).units[0].hash;
  const other = await dub(H, [relay.base]);
  const theirs = (await other.c.ask<{ post: { id: string } }>('post', { text: 'Someone else’s.' })).post.id;
  const paying = d.c.ask('pay', { how: 'damgar', kind: 'tip', signer: other.id, post: theirs, value: '10', unit, whatFor: 'a tip' });
  const ask2 = await asking(d.c);
  assert.equal(ask2.title, 'Dub asks Kišib to sign a money act');
  const html = await (await fetch(ask2.panel, { headers: { 'sec-fetch-dest': 'iframe' } })).text();
  assert.ok(!/Always yes/.test(html), 'no standing yes is offered for money');
  assert.match(html, /A payment prepared for Damgar/);
  assert.match(await clickPanel(ask2.panel, 'decline'), /Declined/);
  await refused(paying, /Declined in Kišib: nothing was signed/);

  // An agreement (relying on an act) always asks: answered in Kišib's own page, Waiting (a panel closed).
  const relying = d.c.ask<{ lines: { text: string }[] }>('rely', { id: theirs, signer: other.id, typed: 'RELY' });
  const ask3 = await asking(d.c);
  assert.equal(ask3.title, 'Dub asks Kišib to sign an agreement act');
  v = await k.c.ask<RunnerView>('runner state');
  assert.equal(v.waiting.length, 1);
  assert.equal(v.waiting[0].always, true);
  await k.c.ask('runner answer', { request: v.waiting[0].request, yes: true });
  assert.match((await relying).lines[0].text, /You rely on/);

  // What it signed: each act, newest first, with its words.
  v = await k.c.ask<RunnerView>('runner state');
  assert.deepEqual(v.signed.map((s) => s.kind), ['agreements', 'posts', 'posts', 'posts']);
  assert.ok(v.signed[2].standing === false && v.signed[1].standing === true);
  assert.match(v.signed[3].words.join(' '), /Through the runner/);

  // A panel shown only into a frame, and nothing more from a stale one.
  const posting4 = d.c.ask('message', { to: other.id, text: 'Sealed, through the runner.' });
  const ask4 = await asking(d.c);
  assert.equal((await fetch(ask4.panel, { headers: { 'sec-fetch-dest': 'document' } })).status, 403);
  const framed = await fetch(ask4.panel, { headers: { 'sec-fetch-dest': 'iframe' } });
  assert.match(framed.headers.get('content-security-policy') ?? '', new RegExp(`frame-ancestors ${d.app.base}`));
  assert.match(await clickPanel(ask4.panel, 'sign'), /Signed/);
  await posting4;
  // The key delivered to itself went with the message, with no panel of its own.
  v = await k.c.ask<RunnerView>('runner state');
  assert.equal(v.signed[0].kind, 'messages');
  assert.match(v.signed[0].words.join(' '), /delivered to the identity itself/);
  assert.equal(v.signed[1].kind, 'messages');

  // Revoked: Dub refused.
  await k.c.ask('runner revoke', { pairing: p.id });
  await refused(d.c.ask('post', { text: 'After the revocation.' }), /no longer knows this app/);

  // Turned off: every key gone, Kišib's folder read whole.
  v = await k.c.ask<RunnerView>('runner off');
  assert.equal(v.on, false);
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  const all = everything(join(k.dir, '..'));
  for (const f of [hex(fromWords(words)), words, a.id]) assert.ok(!all.includes(f), 'nothing of the runner remains');
});
