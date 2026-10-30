// The seal's door (the Dubsar runner cMIP, draft 3, section 10): what Kišib's
// seal in the macOS menu bar asks of Kišib's program, tested here by the
// program alone, on any machine; the seal itself (a Swift helper) is compiled
// and run against the program on GitHub's macOS machines (`test/mac/`).
// Its token in Kišib's folder; the states (off, locked, on, and what waits);
// Open Kišib, Lock now, Turn off, Quit Kišib; quitting locks the runner, and
// the page's Quit does the same.

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { DOMAIN, serve, type Running } from '../src/server.ts';
import { closeAll, kishib, kishibAgain, PASS, runnerOn } from './world.ts';
import type { RunnerView } from '../src/runner.ts';

after(closeAll);

/** What the seal reads: Kišib's port and the seal's token, from Kišib's folder. */
function sealOf(dir: string) {
  const run = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as { port: number };
  const { token } = JSON.parse(readFileSync(join(dir, 'seal.json'), 'utf8')) as { token: string };
  const at = (p: string) => `http://127.0.0.1:${run.port}${p}`;
  return {
    token,
    state: async () => (await (await fetch(at('/seal/state'), { headers: { 'mor-seal': token } })).json()) as { state: string; waiting: number; held: number },
    post: async (p: string) => {
      const r = await fetch(at(p), { method: 'POST', headers: { 'mor-seal': token } });
      return { status: r.status, body: (await r.json()) as Record<string, unknown> };
    },
    raw: (p: string, token?: string) => fetch(at(p), { headers: token ? { 'mor-seal': token } : {} }),
  };
}

test('the seal’s door: its token, the states, Open Kišib, Lock now, Turn off; Quit Kišib locks the runner, from the seal and from the page', async () => {
  let k = await kishib();
  const seal = sealOf(k.dir);
  // Its token is new at each start, in Kišib's folder, owner only; nothing opens without it.
  assert.equal((await seal.raw('/seal/state')).status, 403);
  assert.equal((await seal.raw('/seal/state', 'a'.repeat(64))).status, 403);
  assert.equal(readFileSync(join(k.dir, 'seal.json')).length > 0, true);

  // Off: a hollow seal.
  assert.deepEqual(await seal.state(), { state: 'off', waiting: 0, held: 0 });
  // On: a full seal; an app's pairing waiting shows as a number.
  await runnerOn(k.c);
  assert.equal((await seal.state()).state, 'on');
  k.app.runner.pair({ name: 'Probe', origin: 'http://127.0.0.1:1' });
  assert.equal((await seal.state()).waiting, 1);

  // Open Kišib: a link that pairs a browser once.
  const opened = await seal.post('/seal/open');
  assert.match(String(opened.body.url), new RegExp(`^${k.app.base}/#pair=`));
  // Lock now: a padlock; the passphrase given again on the page, on.
  assert.deepEqual((await seal.post('/seal/lock')).body, { state: 'locked' });
  assert.equal((await seal.state()).state, 'locked');
  await k.c.ask('runner unlock', { passphrase: PASS });
  assert.equal((await seal.state()).state, 'on');

  // Quit Kišib from the seal: the runner locked, the program ended (here, closed), its token gone with it.
  assert.equal((await seal.post('/seal/quit')).body.quit, true);
  for (let i = 0; i < 50 && existsSync(join(k.dir, 'seal.json')); i++) await new Promise((r) => setTimeout(r, 20));
  assert.ok(!existsSync(join(k.dir, 'seal.json')), 'the program ended');
  assert.ok(existsSync(join(k.dir, 'runner.json')), 'nothing erased');
  k = await kishibAgain(k);
  const seal2 = sealOf(k.dir);
  assert.notEqual(seal2.token, seal.token, 'a new token at each start');
  assert.equal((await seal2.state()).state, 'locked', 'quitting locked the runner');

  // Quit Kišib from the page: the same.
  await k.c.ask('runner unlock', { passphrase: PASS });
  const q = await k.c.ask<{ quit: boolean; runner: RunnerView }>('quit');
  assert.equal(q.quit, true);
  assert.equal(q.runner.state, 'locked');
  for (let i = 0; i < 50 && existsSync(join(k.dir, 'seal.json')); i++) await new Promise((r) => setTimeout(r, 20));
  k = await kishibAgain(k);
  assert.equal((await sealOf(k.dir).state()).state, 'locked');

  // Turn off from the seal (its menu asks first): everything erased, a hollow seal.
  assert.deepEqual((await sealOf(k.dir).post('/seal/off')).body, { state: 'off' });
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  assert.equal((await sealOf(k.dir).state()).state, 'off');
});

test('Quit Kišib ends the program by its own hand where it runs as one (the quit handed to it)', async () => {
  const dir = join((await kishib()).dir, '..', 'own');
  let quit = 0;
  const app: Running = await serve({ dir, port: 0, quit: () => void quit++ });
  // Part 4: closed whatever the outcome.
  try {
    const c = await Client.open(await newKey(), app.base, DOMAIN);
    await c.ask('pair', { code: app.access.newCode(), label: 'test' });
    await c.ask('quit');
    for (let i = 0; i < 50 && !quit; i++) await new Promise((r) => setTimeout(r, 20));
    assert.equal(quit, 1);
  } finally {
    await app.close().catch(() => undefined);
  }
});
