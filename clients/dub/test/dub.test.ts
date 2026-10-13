// Dub against real homes and a relay on local ports (the relay program
// of step 4), its program on another, and a client that signs its requests
// exactly as the page does (the desk's `src/page/api.ts`, run here in Node).
// Nothing is mocked. Test identities only, generated here.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { describeAct, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { post as barebonePost, readPost, type ShownPicture } from '../../barebone/src/post.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { read as readJpeg } from '../../../modules/jpeg/src/jpeg.ts';
import { toWords } from '../../../modules/carry/src/carry.ts';
import { DOMAIN, serve, type Running } from '../src/server.ts';
import { TEST_ONLY } from '../src/dub.ts';
import { TEST_ONLY as SHOWN_TEST_ONLY } from '../src/page/view.ts';
import type { State, Shown } from '../src/page/view.ts';

const PHONE = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)));

let homes: Relay[];
let relay: Relay;
const apps: Running[] = [];

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const a of apps) await a.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

/** A fresh Dub, in its own folder, and a paired client. */
async function dub(): Promise<{ app: Running; c: Client }> {
  const app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-')), port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c };
}

const refused = async (p: Promise<unknown>, words: RegExp) => {
  await assert.rejects(p, (e: Error) => {
    assert.match(e.message, words);
    return true;
  });
};

/** What the barebone reader, in this process and knowing only the relay, makes of a post. */
const reader = (id: string) => readPost(id, [relay.base]);

test('the first screen says it, word for word', () => {
  assert.equal(TEST_ONLY, 'Test identities only, until MOR is frozen');
  assert.equal(SHOWN_TEST_ONLY, TEST_ONLY);
});

test('a new identity: the words shown once, three typed back before anything is published; then posts, a picture stripped, a withdrawal', async () => {
  const { app, c } = await dub();
  assert.equal((await c.ask<State>('state')).stage, 'doors');
  // Settings live in the app's folder, owner-only.
  assert.equal(statSync(app.store.dir).mode & 0o777, 0o700);

  const b = await c.ask<{ words: string[]; positions: number[]; say: string[] }>('begin', { homes: homes.map((h) => h.base), relays: [relay.base] });
  assert.equal(b.words.length, 24);
  assert.equal(b.positions.length, 3);
  assert.ok(b.say.some((s) => /Whoever holds these words can post as this identity/.test(s)));
  const st = await c.ask<State>('state');
  assert.equal(st.stage, 'confirm');
  assert.deepEqual(st.confirm!.positions, b.positions);
  assert.ok(!JSON.stringify(st).includes(b.words.join(' ')), 'the words are not shown again');
  const id = st.confirm!.id;

  // Refused until the three are right; nothing published meanwhile.
  const right = b.positions.map((p) => b.words[p - 1]);
  await refused(c.ask('confirm', { typed: [right[0], right[1]] }), /not words .* Nothing has been published/);
  await refused(c.ask('confirm', { typed: [right[0], right[1], right[0] === 'zoo' ? 'abandon' : 'zoo'] }), /Nothing has been published/);
  for (const h of homes) assert.equal(await relayAt(h.base).getAct(id), null, 'no genesis at any home');
  assert.equal((await c.ask<State>('state')).stage, 'confirm');

  await c.ask('confirm', { typed: right.map((w) => ` ${w.toUpperCase()} `) });
  const ready = await c.ask<State>('state');
  assert.equal(ready.stage, 'ready');
  assert.equal(ready.identity!.id, id);
  assert.equal(ready.identity!.kind, 'made');
  for (const h of homes) assert.ok(await relayAt(h.base).getAct(id), 'the genesis at each home');
  // Its words are the identity's signing key (the carry Module).
  const file = JSON.parse(readFileSync(app.store.path('identity.json'), 'utf8'));
  assert.equal(toWords(unhex(file.signingSecret)).join(' '), b.words.join(' '));
  assert.equal(statSync(app.store.path('identity.json')).mode & 0o777, 0o600);

  // A post without a picture: shown as published, read back verified.
  const p1 = await c.ask<{ post: Shown }>('post', { text: 'Hello from Dub.' });
  assert.match(p1.post.html, /verified/);
  assert.match(p1.post.html, /Hello from Dub\./);
  const r1 = await reader(p1.post.id);
  assert.equal(r1.standing, 'valid');
  assert.equal(r1.signer, id);
  assert.equal(r1.text, 'Hello from Dub.');

  // With a phone photo: stripped (the JPEG Module), read back verified.
  assert.ok(readJpeg(PHONE).carries.includes('location'));
  const p2 = await c.ask<{ post: Shown; lines: { text: string }[] }>('post', { text: 'With a picture.', jpeg: Buffer.from(PHONE).toString('base64') });
  assert.ok(p2.lines.some((l) => /the place the picture was taken \(GPS\)/.test(l.text)));
  assert.match(p2.post.html, /<img src="data:image\/jpeg;base64,/);
  assert.equal(p2.post.withdrawable.length, 1);
  const r2 = await reader(p2.post.id);
  const pic = r2.refs[0] as ShownPicture;
  assert.equal(r2.standing, 'valid');
  assert.equal(pic.kind, 'picture');
  assert.equal(pic.standing, 'valid');
  assert.equal(pic.problem, null);
  assert.deepEqual(pic.picture!.carries, [], 'no location, camera data or preview left');
  assert.ok(pic.bytes!.length < PHONE.length);

  // The list: this identity's posts, newest first.
  const list = await c.ask<Shown[]>('posts');
  assert.deepEqual(
    list.map((p) => p.id),
    [p2.post.id, p1.post.id],
  );

  // Withdraw the picture: readers stop showing it; the post stands.
  await c.ask('withdraw', { publication: p2.post.withdrawable[0] });
  const r3 = await reader(p2.post.id);
  assert.equal(r3.standing, 'valid');
  assert.ok((r3.refs[0] as ShownPicture).withdrawn);
  assert.equal((r3.refs[0] as ShownPicture).bytes, null);
  const again = await c.ask<Shown[]>('posts');
  assert.deepEqual(again[0].withdrawable, []);
  assert.match(again[0].html, /Picture not shown: withdrawn by its signer/);
  // Someone else's picture cannot be withdrawn from here.
  const other = TestIdentity.create({ homes: [homes[0].home] });
  await other.publishGenesis();
  const theirs = await barebonePost(other, { text: 'Not yours.', jpeg: PHONE, relays: [relay.base] });
  await refused(c.ask('withdraw', { publication: theirs.picture!.id }), /another identity/);

  // Starting again before confirming forgets an identity never published.
  const { c: c2 } = await dub();
  await c2.ask('begin', { homes: [homes[0].base], relays: [] });
  await c2.ask('abandon');
  assert.equal((await c2.ask<State>('state')).stage, 'doors');
});

test('an identity made by the genesis client, brought in by its words; a wrong set refused; two apps, two lines, both valid; a rotation elsewhere keeps every line, and stops this app signing', async () => {
  // Made by the genesis client, with routes naming the relay.
  const g = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const gp = await barebonePost(g, { text: 'From the genesis client.', relays: [relay.base] });
  const words = toWords(unhex(g.f.signingSecret));

  const { app, c } = await dub();
  // Wrong sets: another identity's words; a word changed; a word off the list; too few.
  const stranger = TestIdentity.create({ homes: [homes[0].home] });
  await refused(
    c.ask('bring', { id: g.id, words: toWords(unhex(stranger.f.signingSecret)).join(' '), address: homes[1].base }),
    /do not give this identity’s current signing key.*Nothing was kept.*chain key’s words/,
  );
  const changed = words.slice();
  changed[23] = changed[23] === 'zoo' ? 'zone' : 'zoo';
  await refused(c.ask('bring', { id: g.id, words: changed.join(' '), address: homes[1].base }), /checksum|not hold a signing key|current signing key/);
  await refused(c.ask('bring', { id: g.id, words: [...words.slice(0, 23), 'notaword'].join(' '), address: homes[1].base }), /word 24, “notaword”, is not on the list/);
  await refused(c.ask('bring', { id: g.id, words: words.slice(0, 12).join(' '), address: homes[1].base }), /12 words, not 24/);
  await refused(c.ask('bring', { id: g.id.slice(2), words: words.join(' '), address: homes[1].base }), /an ID is 64 characters/);
  assert.equal((await c.ask<State>('state')).stage, 'doors', 'nothing kept');

  // The right words, its ID typed in groups of four: brought, relays from its routes.
  const grouped = g.id.toUpperCase().match(/.{4}/g)!.join(' ');
  const r = await c.ask<{ lines: { text: string }[] }>('bring', { id: grouped, words: words.join('  ').toUpperCase(), address: homes[1].base });
  assert.ok(r.lines.some((l) => /must keep this line/.test(l.text)), 'rule 17’s warning');
  const st = await c.ask<State>('state');
  assert.equal(st.identity!.kind, 'brought');
  assert.deepEqual(st.identity!.relays, [relay.base]);
  const held = JSON.parse(readFileSync(app.store.path('identity.json'), 'utf8'));
  assert.equal(held.safety.seeds, '', 'no chain key here: it never travels');

  // Two apps, one identity: each keeps its own line, both valid.
  const bp = await c.ask<{ post: Shown }>('post', { text: 'From Dub.' });
  const gp2 = await barebonePost(g, { text: 'From the genesis client again.', relays: [relay.base] });
  const bp2 = await c.ask<{ post: Shown }>('post', { text: 'From Dub again.' });
  for (const id of [gp.id, bp.post.id, gp2.id, bp2.post.id]) assert.equal((await reader(id)).standing, 'valid', id);
  // An act's position in its line: a new line starts again at 1.
  const position = async (id: string) => (describeAct((await relayAt(relay.base).getAct(id))!) as { position?: number }).position;
  assert.equal(await position(gp.id), 2, 'the genesis client’s line: its routes, then its post');
  assert.equal(await position(bp.post.id), 1, 'Dub starts its own line');
  assert.equal(await position(bp2.post.id), 2);
  assert.equal(await position(gp2.id), 3, 'the genesis client’s line goes on');
  const listed = (await c.ask<Shown[]>('posts')).map((p) => p.id);
  for (const id of [gp.id, bp.post.id, gp2.id, bp2.post.id]) assert.ok(listed.includes(id));
  assert.equal(listed[0], bp2.post.id);

  // A second Dub, brought by the same words: a third line, also valid.
  const { c: c3 } = await dub();
  await c3.ask('bring', { id: g.id, words: words.join(' '), address: homes[0].base });
  const cp = await c3.ask<{ post: Shown }>('post', { text: 'From a second Dub.' });
  assert.equal((await reader(cp.post.id)).standing, 'valid');
  assert.equal(await position(cp.post.id), 1);

  // Identity rule 35 (was 17): the genesis client rotates. It reads every
  // line from the homes and the relays the routes name first, and keeps
  // them all: its own, and both Dubs'. (Before this build it kept only
  // its own line, and Dub's posts became void.) Dub then refuses
  // to sign with the spent key.
  const shown = await c.ask<State>('state');
  const lines = await g.lines();
  assert.equal(lines.length, 3, 'three apps, three lines');
  const dubLine = lines.find((l) => l.tip === bp2.post.id)!;
  assert.deepEqual(
    { act: dubLine.card!.act, position: dubLine.card!.position, summary: dubLine.card!.summary },
    { act: shown.identity!.line.latest, position: shown.identity!.line.acts, summary: shown.identity!.line.summary },
    'the line the rotating client reads is the one Dub shows on its card (F152)',
  );
  await g.prepareRotation();
  await g.submitRotation();
  assert.ok((await g.settleRotation()).counts);
  for (const id of [gp.id, gp2.id, bp.post.id, bp2.post.id, cp.post.id]) assert.equal((await reader(id)).standing, 'valid', `kept: ${id}`);
  await refused(c.ask('post', { text: 'After the rotation.' }), /changed elsewhere.*Nothing was signed/);
});

test('requests from an unpaired browser are refused', async () => {
  const { app } = await dub();
  const stranger = await Client.open(await newKey(), app.base, DOMAIN);
  await refused(stranger.ask('state'), /not paired/);
  await refused(stranger.ask('begin', { homes: [homes[0].base] }), /not paired/);
  // A key paired with another program's domain line is not good here.
  const desk = await Client.open(await newKey(), app.base);
  await refused(desk.ask('pair', { code: app.access.newCode(), label: 'x' }), /signature does not match/);
  // Unsigned.
  const r = await fetch(`${app.base}/api`, { method: 'POST', body: '{}' });
  assert.equal(r.status, 401);
  // A pairing code is not given without the owner's secret.
  assert.equal((await fetch(`${app.base}/local/code`, { method: 'POST' })).status, 401);
  // The page itself is served under a content security policy.
  const page = await fetch(`${app.base}/`);
  assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'none'; script-src 'self'/);
});

test('nothing listens beyond 127.0.0.1', async () => {
  const { app } = await dub();
  const a = app.server.address();
  assert.ok(a && typeof a === 'object');
  assert.equal(a.address, '127.0.0.1');
  // Through any other address of this machine, nothing answers.
  const others = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && i.address !== '127.0.0.1')
    .map((i) => i!.address);
  for (const host of others) {
    await assert.rejects(fetch(`http://${host}:${app.port}/hello`), `nothing at ${host}`);
  }
  // A page elsewhere that points its own name at 127.0.0.1 is refused.
  const status = await new Promise<number>((resolve, reject) => {
    const q = request({ host: '127.0.0.1', port: app.port, path: '/hello', headers: { host: `evil.example:${app.port}` } }, (res) => resolve(res.statusCode ?? 0));
    q.on('error', reject);
    q.end();
  });
  assert.equal(status, 421);
});
