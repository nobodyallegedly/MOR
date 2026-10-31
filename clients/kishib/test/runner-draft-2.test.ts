// The Dubsar runner, draft 2 (`cmips/cmip-runner-draft-2.md`; decided by
// Nobody, allegedly, 22 October 2026): the passphrase and the keys encrypted
// at rest; locked and off, two states; opening what is sealed to an
// identity, for an app allowed to; relying always asking. Kišib's program
// and Dub's talk as they do on the Mac, against real homes and a relay on
// local ports; the panel is answered as its frame answers it.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { encryptionSecret, fromWords } from '../../../modules/carry/src/carry.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { readSealedList } from '../../dub/src/people.ts';
import { RUNNER_NO_OPEN_SAY, RUNNER_OPENS_SAY } from '../../dub/src/dub.ts';
import { asking, clickPanel, closeAll, dub, dubBeside, everything, forms, kishib, kishibAgain, PASS, refused, runnerOn, standing, start, type Relay, stopAll } from './world.ts';
import { LOCKED_SAY, NO_OPEN_SAY, Runner, WRONG_SAY, type RunnerView } from '../src/runner.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  // Part 4: every program, page and server this file started, stopped whatever the outcome (`world.ts`, stopAll).
  await stopAll();
});

const state = (c: { ask<T>(op: string, a?: unknown): Promise<T> }) => c.ask<RunnerView>('runner state');
const re = (s: string) => new RegExp(s.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

test('the passphrase: chosen when the runner is first turned on, typed twice; the folder read whole holds no key in the clear; Kišib restarted asks it; a wrong one opens nothing; a forgotten one means the words given again', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words;
  let k = await kishib();

  // Chosen when turned on: typed twice, the same; long enough. Until then, it stays off.
  await refused(k.c.ask('runner on', { read: true, passphrase: PASS, again: `${PASS}.` }), /typed twice differs/);
  await refused(k.c.ask('runner on', { read: true, passphrase: 'short', again: 'short' }), /at least 8 characters/);
  assert.equal((await state(k.c)).state, 'off');
  let v = await k.c.ask<RunnerView>('runner on', { read: true, passphrase: PASS, again: PASS });
  assert.equal(v.state, 'on');
  assert.match(v.risk.join(' '), /someone who saw your passphrase typed/);
  assert.match(v.risk.join(' '), /a Mac taken, or a program running as you, while Kišib is open and unlocked/);
  await k.c.ask('runner give', { id: a.id, address: H[0], words: words.join(' ') });

  // Kišib's folder read whole: no key in the clear, nor the identity it holds; one file, encrypted.
  const seed = fromWords(words.join(' '));
  const all = everything(k.dir);
  for (const f of [...forms(words, seed, encryptionSecret(seed)), a.id]) assert.ok(!all.includes(f), 'nothing of the runner in the clear');
  const file = JSON.parse(readFileSync(join(k.dir, 'runner.json'), 'utf8'));
  assert.deepEqual(Object.keys(file).sort(), ['cipher', 'kdf', 'label', 'nonce', 'sealed']);
  assert.equal(file.cipher, 'aes-256-gcm');
  assert.equal(file.kdf.name, 'scrypt');
  assert.ok(file.kdf.N >= 1 << 17, 'a memory-hard derivation, 128 MiB');

  // Kišib restarted: the runner is locked, holds nothing readable, and asks its passphrase.
  k = await kishibAgain(k);
  v = await state(k.c);
  assert.equal(v.state, 'locked');
  assert.equal(v.on, false);
  assert.deepEqual([v.held, v.apps, v.signed], [[], [], []]);
  await refused(k.c.ask('runner give', { id: a.id, address: H[0], words: words.join(' ') }), re(LOCKED_SAY));
  await refused(k.c.ask('runner on', { read: true, passphrase: PASS, again: PASS }), /locked, not off/);

  // A wrong passphrase: refused, nothing opened.
  await refused(k.c.ask('runner unlock', { passphrase: 'not the passphrase' }), re(WRONG_SAY));
  v = await state(k.c);
  assert.equal(v.state, 'locked');
  assert.deepEqual(v.held, []);

  // The right one: everything back.
  v = await k.c.ask<RunnerView>('runner unlock', { passphrase: PASS });
  assert.equal(v.state, 'on');
  assert.deepEqual(v.held.map((h) => h.id), [a.id]);

  // Forgotten: the keys stay unreadable; turned off, everything erased; on again from nothing, the words given again.
  k = await kishibAgain(k);
  await refused(k.c.ask('runner unlock', { passphrase: 'what was it again' }), re(WRONG_SAY));
  v = await k.c.ask<RunnerView>('runner off');
  assert.equal(v.state, 'off');
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  v = await k.c.ask<RunnerView>('runner on', { read: true, passphrase: 'a new passphrase', again: 'a new passphrase' });
  assert.deepEqual([v.held, v.apps, v.signed], [[], [], []]);
  v = await k.c.ask<RunnerView>('runner give', { id: a.id, address: H[0], words: words.join(' ') });
  assert.deepEqual(v.held.map((h) => h.id), [a.id]);
});

test('locked: Kišib closed with the runner on, reopened, the passphrase given: pairings and the log back, Dub signing again with no new pairing; while locked, Dub refused, said plainly', async () => {
  const H = homes.map((h) => h.base);
  const all = [...H, relay.base];
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  let k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  await k.c.ask('runner approve', { pairing: p.id, identities: [a.id] });
  await k.c.ask('runner yes', { pairing: p.id, kind: 'posts', on: true });
  await d.c.ask('runner take', { id: a.id });
  const first = (await d.c.ask<{ post: { id: string } }>('post', { text: 'Before Kišib was closed.' })).post.id;
  const was = await state(k.c);
  assert.equal(was.signed.length, 1);

  // Closed, and opened again: locked. Dub's request refused, saying Kišib is locked.
  k = await kishibAgain(k);
  assert.equal((await state(k.c)).state, 'locked');
  await refused(d.c.ask('post', { text: 'While Kišib is locked.' }), /Kišib is locked: its runner signs and opens nothing until its passphrase is given/);
  const said = await d.c.ask<{ problem: string | null }>('runner');
  assert.match(said.problem ?? '', /Kišib is locked/);

  // The passphrase given: the pairing, its standing yes and the log are back; Dub signs again, never paired again.
  const v = await k.c.ask<RunnerView>('runner unlock', { passphrase: PASS });
  assert.deepEqual(v.apps.map((x) => [x.id, x.state, x.yes]), [[p.id, 'approved', ['posts']]]);
  assert.deepEqual(v.signed.map((s) => s.act), was.signed.map((s) => s.act));
  const second = (await d.c.ask<{ post: { id: string } }>('post', { text: 'After the passphrase was given again.' })).post.id;
  for (const x of [first, second]) assert.equal(await standing(x, a.id, all), 'valid');
  assert.equal((await state(k.c)).signed.length, 2);
  assert.equal((await state(k.c)).apps.length, 1, 'no new pairing');

  // Lock now, without quitting Kišib: locked, Dub refused; the passphrase given, back.
  assert.equal((await k.c.ask<RunnerView>('runner lock')).state, 'locked');
  await refused(d.c.ask('post', { text: 'Locked from the page.' }), /Kišib is locked/);
  assert.equal((await k.c.ask<RunnerView>('runner unlock', { passphrase: PASS })).apps.length, 1);
  await d.c.ask('post', { text: 'Unlocked again from the page.' });
});

test('off: every key, pairing and log entry gone, the folder read whole; turned on again, it starts from nothing', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words;
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words: words.join(' ') });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  await k.c.ask('runner approve', { pairing: p.id, identities: [a.id] });
  await k.c.ask('runner yes', { pairing: p.id, kind: 'posts', on: true });
  await d.c.ask('runner take', { id: a.id });
  await d.c.ask('post', { text: 'Signed before the runner was turned off.' });

  let v = await k.c.ask<RunnerView>('runner off');
  assert.equal(v.state, 'off');
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  const seed = fromWords(words.join(' '));
  const folder = everything(join(k.dir, '..'));
  for (const f of [...forms(words, seed, encryptionSecret(seed)), a.id, 'scrypt', 'aes-256-gcm']) assert.ok(!folder.includes(f), 'nothing of the runner remains');

  // On again: from nothing. Dub's old pairing is unknown; it pairs again.
  v = await runnerOn(k.c).then(() => state(k.c));
  assert.deepEqual([v.held, v.apps, v.signed, v.waiting], [[], [], [], []]);
  await refused(d.c.ask('post', { text: 'After the runner was turned on again.' }), /no longer knows this app/);
});

test('opening: Dub approved with “may open” reads a private message from someone else and keeps its contacts list sealed, each opening counted in Signed; approved without, the reply not readable, said plainly, until allowed; revoked, refused', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const other = await dub(H, [relay.base]);
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words });

  // Dub, approved with "may open what is sealed to this identity".
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  let v = await k.c.ask<RunnerView>('runner approve', { pairing: p.id, identities: [a.id], opens: [a.id] });
  assert.deepEqual(v.apps[0].opens, [a.id]);
  const took = await d.c.ask<{ lines: { text: string }[] }>('runner take', { id: a.id });
  assert.ok(took.lines.some((l) => l.text === RUNNER_OPENS_SAY));

  // A private message from someone else, read in Dub, Dub holding no key.
  await other.c.ask('message', { to: a.id, text: 'A private reply for A, sealed to it.' });
  const box = await d.c.ask<{ messages: { text: string; dir: string; with: string }[]; encryption: boolean; opening: string | null }>('inbox');
  assert.equal(box.encryption, true);
  assert.equal(box.opening, null);
  assert.ok(box.messages.some((m) => m.dir === 'in' && m.with === other.id && m.text === 'A private reply for A, sealed to it.'), JSON.stringify(box.messages));

  // Counted in Signed: which app, what kind of act, nothing signed.
  v = await state(k.c);
  const opened = v.signed.filter((s) => s.opened);
  assert.ok(opened.some((s) => s.app === 'Dub' && s.kind === 'messages' && /^Opened for Dub: a private message, from /.test(s.words[0])), JSON.stringify(opened));
  const count = opened.length;
  await d.c.ask('inbox');
  assert.equal((await state(k.c)).signed.filter((s) => s.opened).length, count, 'read once: Dub keeps what it read');

  // Its contacts list, sealed to the identity: a contacts act asked in the panel, signed, then read back with the identity's own key.
  const following = d.c.ask('follow', { id: other.id, name: 'The other one' });
  const ask = await asking(d.c);
  assert.equal(ask.title, 'Dub asks Kišib to sign the contacts list');
  assert.match(await clickPanel(ask.panel, 'sign'), /Signed/);
  await following;
  const st = await d.c.ask<{ identity: { sealed: { version: number } | null; encryption: boolean } }>('state');
  assert.equal(st.identity.encryption, true);
  assert.equal(st.identity.sealed?.version, 1);
  const list = await readSealedList(a.id, [encryptionSecret(fromWords(words))], H);
  assert.deepEqual(list.follows.map((f) => [f.id, f.name]), [[other.id, 'The other one']]);

  // A second Dub, approved without it: the reply not readable, said plainly; then allowed in Kišib, and read.
  const d2 = await dubBeside(k.dir);
  await d2.c.ask('runner pair');
  const p2 = (await state(k.c)).apps.find((x) => x.state === 'waiting')!;
  await k.c.ask('runner approve', { pairing: p2.id, identities: [a.id] });
  const took2 = await d2.c.ask<{ lines: { text: string }[] }>('runner take', { id: a.id });
  assert.ok(took2.lines.some((l) => l.text === RUNNER_NO_OPEN_SAY));
  let box2 = await d2.c.ask<{ messages: { text: string; problem: string | null }[]; encryption: boolean; opening: string | null }>('inbox');
  assert.equal(box2.encryption, false);
  assert.equal(box2.opening, RUNNER_NO_OPEN_SAY);
  assert.ok(!box2.messages.some((m) => m.text === 'A private reply for A, sealed to it.'));
  assert.ok(box2.messages.some((m) => m.problem === RUNNER_NO_OPEN_SAY), 'the sealed reply is listed, unread, said why');
  await k.c.ask('runner opening', { pairing: p2.id, identity: a.id, on: true });
  box2 = await d2.c.ask('inbox');
  assert.equal(box2.encryption, true);
  assert.ok(box2.messages.some((m) => m.text === 'A private reply for A, sealed to it.'), 'read once allowed');

  // Asked at the runner's door: not allowed, refused; allowed, the act inside and its content key, never the identity's key; revoked, refused.
  const sealed = (await relayAt(relay.base).feed({ to: a.id })).items.filter((it) => it.kind === 'sealed').map((it) => it.item);
  assert.ok(sealed.length);
  const probe = k.app.runner.pair({ name: 'Probe', origin: 'http://127.0.0.1:1' });
  k.app.runner.approve({ pairing: probe.pairing, identities: [a.id] });
  assert.throws(() => k.app.runner.open(probe.token, { identity: a.id, sealed }), re(NO_OPEN_SAY));
  k.app.runner.setOpen({ pairing: probe.pairing, identity: a.id, on: true });
  const got = k.app.runner.open(probe.token, { identity: a.id, sealed });
  assert.ok(got.opened.some(Boolean));
  const enc = encryptionSecret(fromWords(words));
  const said = JSON.stringify(got);
  for (const f of [Buffer.from(enc).toString('hex'), Buffer.from(enc).toString('base64')]) assert.ok(!said.includes(f), 'never the identity’s key');
  k.app.runner.revoke({ pairing: probe.pairing });
  assert.throws(() => k.app.runner.open(probe.token, { identity: a.id, sealed }), /no longer knows this app/);
  // Dub revoked: refused, and Dub says it.
  await k.c.ask('runner revoke', { pairing: p.id });
  const box3 = await d.c.ask<{ encryption: boolean; opening: string | null }>('inbox');
  assert.equal(box3.encryption, false);
  assert.match(box3.opening ?? '', /not paired with Kišib/);
});

test('relying through the runner: always the panel, no standing yes offered, even with every other kind allowed', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const other = await dub(H, [relay.base]);
  const theirs = (await other.c.ask<{ post: { id: string } }>('post', { text: 'An act to rely on.' })).post.id;
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  await k.c.ask('runner approve', { pairing: p.id, identities: [a.id] });
  await d.c.ask('runner take', { id: a.id });
  const v = await state(k.c);
  for (const kd of v.kinds.filter((x) => !x.always)) await k.c.ask('runner yes', { pairing: p.id, kind: kd.kind, on: true });
  assert.ok(v.kinds.find((x) => x.kind === 'agreements')!.always);
  assert.match(v.kinds.find((x) => x.kind === 'agreements')!.name, /relying on an act/);
  await refused(k.c.ask('runner yes', { pairing: p.id, kind: 'agreements', on: true }), /relying on another’s act, and keys always ask/);

  for (const answer of ['decline', 'sign'] as const) {
    const relying = d.c.ask<{ lines: { text: string }[] }>('rely', { id: theirs, signer: other.id, typed: 'RELY' });
    const ask = await asking(d.c);
    assert.equal(ask.title, 'Dub asks Kišib to sign an agreement act');
    const html = await (await fetch(ask.panel, { headers: { 'sec-fetch-dest': 'iframe' } })).text();
    assert.ok(!/Always yes/.test(html), 'no standing yes offered');
    assert.match(html, /relying on another’s act, and keys always ask/);
    // Answered with the box ticked, as a crafted form could: still no standing yes kept.
    await clickPanel(ask.panel, answer, true);
    if (answer === 'decline') await refused(relying, /Declined in Kišib/);
    else assert.match((await relying).lines[0].text, /You rely on/);
  }
  assert.ok(!(await state(k.c)).apps[0].yes.includes('agreements'));
});

test('a draft 1 file, its keys in the clear, found when Kišib starts: locked until a passphrase is chosen, typed twice; then sealed under it, nothing left in the clear', async () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'kishib-draft1-')), 'mor-kishib');
  mkdirSync(dir, { recursive: true });
  const secret = 'ab'.repeat(32);
  const id = 'cd'.repeat(32);
  const clear = { label: 'MOR Kišib runner: signing keys, kept while the runner is on. TEST IDENTITIES ONLY.', since: 1, held: [{ id, secret, binding: 'ef'.repeat(32), homes: [], name: 'Old', given: 1 }], apps: [], log: [], lines: [] };
  writeFileSync(join(dir, 'runner.json'), JSON.stringify(clear));
  let r = new Runner(dir);
  assert.equal(r.view().state, 'locked');
  assert.equal(r.view().upgrade, true);
  await assert.rejects(r.unlock({ passphrase: PASS, again: 'something else' }), /typed twice differs/);
  const v = await r.unlock({ passphrase: PASS, again: PASS });
  assert.deepEqual(v.held.map((h) => h.id), [id]);
  const all = everything(dir);
  for (const f of [secret, id]) assert.ok(!all.includes(f), 'nothing left in the clear');
  r = new Runner(dir);
  assert.equal(r.view().state, 'locked');
  assert.equal(r.view().upgrade, false);
  assert.deepEqual((await r.unlock({ passphrase: PASS })).held.map((h) => h.id), [id]);
});
