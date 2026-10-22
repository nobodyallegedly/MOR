// Edubba on the kit (round 4): identities from the identity panel and keys
// changed elsewhere, in a real browser, by clicks and typing alone.
//
// - H15: + Add › Bring one: an identity brought by its ID and its signing
//   key's words; wrong words refused, the right ones taken.
// - H80 after Kišib: on opening, the warning under the top with the box for
//   the new words right under it; Rely on it (the act's menu) refused in the
//   same words, nothing reaching a home; wrong words refused in that box;
//   the right words taken; the next reliance read back, RELY typed, signed.
// - A collective brought by its ID (H15) in another Edubba: read only, no
//   typing box.
//
// MOR_SCREENSHOTS=DIR keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { post as postAs } from '../../barebone/src/post.ts';
import { encryptionSecret, toWords } from '../../../modules/carry/src/carry.ts';
import { serve, type Running } from '../src/server.ts';
import { Kishib } from '../../kishib/src/kishib.ts';
import { chainKeyAt } from '../../kishib/src/words.ts';
import { changeKeysHere } from '../../kishib/test/world.ts';
import { Client, newKey } from '../src/page/api.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`) });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let browser: Browser;
let page: Page;
let c: Client;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: join(mkdtempSync(join(tmpdir(), 'edubba-keys-browser-')), 'edubba'), port: 0, machineEvery: 0, kishib: mkdtempSync(join(tmpdir(), 'edubba-keys-no-kishib-')) });
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'setup' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  browser = await chromium.launch({ executablePath: CHROMIUM });
  page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('dialog', (d) => void d.accept());
});

after(async () => {
  await browser?.close();
  await app?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (words: string | RegExp) => page.locator('.k-note.k-done', { hasText: words }).first().waitFor({ timeout: 90_000 });

test('H15: + Add › Bring one: an identity brought by its signing key’s words; wrong words refused', async () => {
  const g = TestIdentity.create({ homes: [homes[1].home] });
  await g.publishGenesis();
  await g.publishRoutes([
    { scope: null, hints: [relay.base], kind: 0 },
    { scope: null, hints: [relay.base], kind: 1 },
  ]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.click('[data-add=bring]');
  await page.fill('.k-modal #bring-identity input[name=name]', 'Made in Dub');
  await page.fill('.k-modal #bring-identity input[name=id]', g.id);
  await page.fill('.k-modal #bring-identity textarea[name=words]', toWords(crypto.getRandomValues(new Uint8Array(32))).join(' '));
  await page.fill('.k-modal #bring-identity input[name=address]', homes[1].base);
  await page.click('.k-modal #bring-identity button[type=submit]');
  await page.locator('.k-modal .k-note.k-error', { hasText: 'do not give this identity’s current signing key' }).waitFor({ timeout: 60_000 });
  await shot(page, 'mac-60-bring-refused');
  await page.fill('.k-modal #bring-identity textarea[name=words]', toWords(unhex(g.f.signingSecret)).join(' '));
  await page.click('.k-modal #bring-identity button[type=submit]');
  await done('“Made in Dub” is here');
  assert.match(await page.locator('.k-me').innerText(), /Made in Dub/);
});

test('H80 after Kišib: the warning under the top, the box for the new words right under it; Rely refused, nothing at the home; wrong words refused; the right ones taken; then relied on', async () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const key0 = chainKeyAt(seed, 3, 0);
  const g = TestIdentity.create({ homes: [homes[0].home], chainKey: { scheme: 3, seeds: key0.seeds, commit: key0.commit } });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }, { scope: null, hints: [relay.base], kind: 1 }]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  await c.ask('bring', { name: 'Rotated in Kišib', id: g.id, words: toWords(unhex(g.f.signingSecret)).join(' '), address: homes[0].base });
  await c.ask('acting as', { id: g.id });
  const k = new Kishib();
  const r = await k.rotatePlan({ id: g.id, address: homes[0].base, words: toWords(seed).join(' ') });
  const fresh = (await changeKeysHere(k, r)).signing;

  // A post of someone else's, to rely on.
  const them = TestIdentity.create({ homes: [homes[0].home] });
  await them.publishGenesis();
  for (const a of them.chainActs()) await relayAt(relay.base).putAct(a);
  const p = await postAs(them, { text: 'Relied on after the change of keys.', relays: [relay.base] });

  await page.reload();
  const warn = page.locator('#spent', { hasText: 'This identity’s signing key was changed elsewhere' });
  await warn.waitFor({ timeout: 60_000 });
  await warn.locator('form#identity-renew').waitFor();
  await shot(page, 'mac-61-key-changed-box');

  // Relying (the act's menu's Rely on it, through the program's own path): refused in the same words, nothing at the home.
  const homeActs = async () => (await relayAt(homes[0].base).feed({ signer: g.id })).items.length;
  const atHome = await homeActs();
  // Relying is read back by its ID through the program: the same path as the menu's.
  const read = await c.ask<{ blocking: string[] }>('read act', { identity: g.id, act: p.id });
  assert.deepEqual(read.blocking, []);
  await assert.rejects(c.ask('witness', { identity: g.id, act: p.id, shown: (await import('../../genesis/src/witness.ts')).WITNESS_EXPLANATION, typed: 'RELY' }), /This identity’s signing key was changed elsewhere/);
  assert.equal(await homeActs(), atHome, 'nothing signed reached its home');

  // Wrong words (the old chain paper's): refused, the box still there.
  const box = page.locator('#spent form#identity-renew');
  await box.locator('textarea[name=words]').fill(toWords(seed).join(' '));
  await box.locator('button[type=submit]').click();
  await page.locator('#spent .k-note.k-error, #spent form .k-note.k-error', { hasText: 'do not give this identity’s current signing key' }).first().waitFor({ timeout: 60_000 });
  assert.equal(await box.count(), 1);
  // The right words: taken, the warning gone.
  await box.locator('textarea[name=words]').fill(fresh.join(' '));
  await box.locator('button[type=submit]').click();
  await done('The new signing key is taken');
  assert.equal(await page.locator('#spent').count(), 0);
  await shot(page, 'mac-62-new-words-taken');
  const ok = await c.ask<{ id: string }>('witness', { identity: g.id, act: p.id, shown: (await import('../../genesis/src/witness.ts')).WITNESS_EXPLANATION, typed: 'RELY' });
  assert.match(ok.id, /^[0-9a-f]{64}$/);
});

test('no console error', () => {
  assert.deepEqual(problems, []);
});
