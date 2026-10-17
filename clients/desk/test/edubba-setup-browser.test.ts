// The small session's Edubba screens in a real browser (headless Chromium, a
// fresh profile, the launcher's link, then only clicks and typing), against
// real homes and a relay:
//
// - the Identities tab as an identity setup page (F333): the record in plain
//   words, relying on an act read back and signed only once RELY is typed;
// - an identity brought by its signing key's words (H15);
// - releases under one's own name said to be Ummia's (F339; H16, and the
//   folder checks of H19, H23 and H31, run in clients/ummia's tests);
// - "What you may do for it" folded and unfolded, remembered across a
//   reload (H14); a collective brought by its ID (H15);
// - the Identities tab's sections folding, remembered across a reload (H26);
//
// MOR_SCREENSHOTS=DIR keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { post as postAs } from '../../barebone/src/post.ts';
import { encryptionSecret, toWords } from '../../../modules/carry/src/carry.ts';
import { verifyRelease } from '../../repo/src/release.ts';
import { serve, type Running } from '../src/server.ts';
import { Kishib } from '../../kishib/src/kishib.ts';
import { chainKeyAt } from '../../kishib/src/words.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `setup-${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let other: Running;
let browser: Browser;
let page: Page;
let c: Client;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: join(mkdtempSync(join(tmpdir(), 'edubba-setup-browser-')), 'edubba'), port: 0, machineEvery: 0, drafts: mkdtempSync(join(tmpdir(), 'edubba-drafts-')) });
  other = await serve({ dir: join(mkdtempSync(join(tmpdir(), 'edubba-setup-other-')), 'edubba'), port: 0, machineEvery: 0, drafts: mkdtempSync(join(tmpdir(), 'edubba-drafts-')) });
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'setup' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  browser = await chromium.launch({ executablePath: CHROMIUM });
  const context = await browser.newContext({ viewport: { width: 900, height: 1000 } });
  page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('dialog', (d) => void d.accept());
});

after(async () => {
  await browser?.close();
  await app?.close();
  await other?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const said = (words: string | RegExp) => page.locator('#e-status .note.done', { hasText: words }).waitFor({ timeout: 90_000 });

let ME: string;

test('the Identities tab: a new identity, its record in plain words, its lines with their cards', async () => {
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('h1.mark', { hasText: 'Edubba' }).waitFor();
  await page.click('[data-action=tab][data-tab=identities]');
  await page.locator('h3', { hasText: 'Bring an identity you have' }).waitFor();
  await shot(page, '01-new-or-bring');
  await page.fill('#new-identity input[name=name]', 'Nobody, allegedly');
  await page.click('#new-identity button[type=submit]');
  await said('“Nobody, allegedly” is born');
  ME = (await c.ask<any>('state')).identities[0].id;
  const rec = page.locator('#e-record');
  await rec.locator('h4', { hasText: 'Its lines of acts' }).waitFor({ timeout: 60_000 });
  const text = await rec.innerText();
  assert.match(text, /Made here, by Edubba/);
  assert.match(text, /Its homes: where it lives/);
  assert.match(text, /Its acts are published at/);
  assert.match(text, /Its inbox is at/);
  assert.match(text, /Signing key: the one Edubba holds, current/);
  assert.match(text, /Encryption key: published by/);
  assert.match(text, /Its display names[\s\S]*None published/);
  await shot(page, '02-record');
});

test('relying on an act: read back in plain words, nothing signed until RELY is typed', async () => {
  const them = TestIdentity.create({ homes: [homes[0].home] });
  await them.publishGenesis();
  for (const a of them.chainActs()) await relayAt(relay.base).putAct(a);
  const p = await postAs(them, { text: 'I will deliver the tablets by spring.', relays: [relay.base] });
  // Folded by default (H34): opened to rely on an act.
  assert.equal(await page.locator('#e-rely').evaluate((d) => (d as HTMLDetailsElement).open), false);
  await page.click('#e-rely > summary');
  await page.fill('#rely input[name=act]', p.id);
  await page.click('#rely button[type=submit]');
  const shown = page.locator('#e-rely-shown');
  await shown.locator('h4', { hasText: 'What signing does' }).waitFor({ timeout: 60_000 });
  assert.match(await shown.innerText(), /a text, such as a post or a message[\s\S]*Valid, through its signer’s identity chain[\s\S]*I will deliver the tablets by spring\./);
  await shot(page, '03-rely-read-back');
  await page.fill('#rely-sign input[name=typed]', 'yes');
  await page.click('#rely-sign button[type=submit]');
  await page.locator('#e-rely-shown .note.error', { hasText: 'Type RELY' }).waitFor({ timeout: 30_000 });
  // Nothing signed: read it back again, type RELY.
  await page.click('#rely button[type=submit]');
  await page.locator('#rely-sign input[name=typed]').waitFor({ timeout: 60_000 });
  await page.fill('#rely-sign input[name=typed]', 'RELY');
  await page.click('#rely-sign button[type=submit]');
  await page.locator('#e-rely-shown .note.done', { hasText: 'Witness act signed and sent' }).waitFor({ timeout: 60_000 });
  // The record, read again, shows this device's line of one act, its card ready for MOR Safety.
  const n = (await c.ask<any>('state')).identities[0].line.acts;
  await page.locator('#e-record', { hasText: `This device’s line: ${n} acts, the latest` }).waitFor({ timeout: 60_000 });
  await page.locator('#e-record .card-of', { hasText: 'Position' }).first().waitFor();
  await shot(page, '04-relied');
});

test('F339: releases under one’s own name are Ummia’s; the card says so', async () => {
  const card = page.locator('#e-release');
  await card.waitFor({ timeout: 30_000 });
  assert.match(await card.innerText(), /Releases under its own name: in Ummia/);
  assert.match(await card.innerText(), /made in Ummia, the developers’ app/);
  assert.equal(await page.locator('#release-folder').count(), 0, 'no release form here');
  await shot(page, '05-releases-moved');
});

test('H26: the Identities tab’s sections fold, each remembered by the program across a reload', async () => {
  const rec = page.locator('#e-record-fold');
  assert.equal(await rec.evaluate((d) => (d as HTMLDetailsElement).open), true, 'open at first');
  await rec.locator('summary').first().click();
  await page.waitForFunction(() => !(document.getElementById('e-record-fold') as HTMLDetailsElement).open);
  for (let i = 0; i < 50 && app.store.book().unfolded?.['identity-record'] !== false; i++) await new Promise((r) => setTimeout(r, 100));
  assert.equal(app.store.book().unfolded?.['identity-record'], false);
  await page.reload();
  await page.click('[data-action=tab][data-tab=identities]');
  await page.locator('#e-record-fold').waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('#e-record-fold').evaluate((d) => (d as HTMLDetailsElement).open), false, 'still folded after a reload');
  assert.equal(await page.locator('#e-release').evaluate((d) => (d as HTMLDetailsElement).open), true);
  await shot(page, '06b-folds');
  await page.locator('#e-record-fold > summary').click();
});

test('H15: an identity brought by its signing key’s words', async () => {
  const g = TestIdentity.create({ homes: [homes[1].home] });
  await g.publishGenesis();
  await g.publishRoutes([
    { scope: null, hints: [relay.base], kind: 0 },
    { scope: null, hints: [relay.base], kind: 1 },
  ]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  await page.click('.entry.add[data-id=new]');
  await page.fill('#bring-identity input[name=name]', 'Made in Dub');
  await page.fill('#bring-identity input[name=id]', g.id);
  await page.fill('#bring-identity textarea[name=words]', toWords(crypto.getRandomValues(new Uint8Array(32))).join(' '));
  await page.fill('#bring-identity input[name=address]', homes[1].base);
  await page.click('#bring-identity button[type=submit]');
  await page.locator('#e-status .note.error', { hasText: 'do not give this identity’s current signing key' }).waitFor({ timeout: 60_000 });
  await page.fill('#bring-identity textarea[name=words]', toWords(unhex(g.f.signingSecret)).join(' '));
  await page.click('#bring-identity button[type=submit]');
  await said('“Made in Dub” is here');
  await page.locator('.head .tag', { hasText: 'brought here' }).waitFor();
  await page.locator('#e-record', { hasText: 'Made elsewhere, brought here by its signing key’s words' }).waitFor({ timeout: 60_000 });
  await shot(page, '07-brought');
});

test('After Kišib: the record says the signing key was changed elsewhere, and takes the new words in its box', async () => {
  // An identity whose chain key is on paper (the words seed Module, key 0), brought here by its signing words.
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const key0 = chainKeyAt(seed, 3, 0);
  const g = TestIdentity.create({ homes: [homes[0].home], chainKey: { scheme: 3, seeds: key0.seeds, commit: key0.commit } });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }, { scope: null, hints: [relay.base], kind: 1 }]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  await c.ask('bring', { name: 'Rotated in Kišib', id: g.id, words: toWords(unhex(g.f.signingSecret)).join(' '), address: homes[0].base, linked: false });
  // Kišib changes its keys from the paper words.
  const k = new Kishib();
  const r = await k.rotatePlan({ id: g.id, address: homes[0].base, words: toWords(seed).join(' ') });
  let s = await k.confirm({ plan: r.plan, digest: r.digest });
  for (let i = 0; (s.sitting!.stage as string) === 'sent' && i < 3; i++) s = await k.resend();
  assert.equal(s.sitting!.stage, 'counts');
  const fresh = k.showWords().words;
  // Edubba's record: changed elsewhere, the box for the new words.
  await page.reload();
  await page.click('[data-action=tab][data-tab=identities]');
  await page.click(`.entry[data-id="${g.id}"]`);
  const box = page.locator('form#identity-renew');
  await box.waitFor({ timeout: 60_000 });
  assert.match(await box.innerText(), /changed elsewhere \(in Kišib/);
  await shot(page, '08-key-changed-in-kishib');
  await box.locator('textarea[name=words]').fill(toWords(seed).join(' '));
  await box.locator('button[type=submit]').click();
  await page.locator('#e-status .note.error', { hasText: 'do not give this identity’s current signing key' }).waitFor({ timeout: 60_000 });
  await box.locator('textarea[name=words]').fill(fresh.join(' '));
  await box.locator('button[type=submit]').click();
  await said('The new signing key is taken');
  await page.locator('#e-record', { hasText: 'Signing key: the one Edubba holds, current' }).waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('form#identity-renew').count(), 0);
  await shot(page, '09-new-words-taken');
});

test('Collectives: “What you may do for it” folds, remembered across a reload (H14); a collective brought by its ID (H15)', async () => {
  const confirm = async (args: object) => {
    const r = await c.ask<{ plan: string; digest: string }>('collective prepare', args);
    return c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest });
  };
  const ids: string[] = [];
  for (const [name, mine] of [['Me', true], ['Ana', false], ['Bo', false]] as const) ids.push((await confirm({ kind: 'identity', name, mine })).acts[0]);
  await confirm({ kind: 'found', name: 'The tablet house', members: ids, rules: {} });
  const col = app.collectives.list()[0].id;
  await page.reload();
  await page.click('[data-action=tab][data-tab=collectives]');
  const may = page.locator('#e-may');
  await may.locator('.item').first().waitFor({ timeout: 90_000 });
  assert.equal(await may.evaluate((d) => (d as HTMLDetailsElement).open), true, 'unfolded at first');
  await may.locator('summary').click();
  await page.waitForFunction((id) => true && id, col);
  await page.waitForFunction(() => !(document.getElementById('e-may') as HTMLDetailsElement).open);
  await page.locator('#e-may summary .small', { hasText: 'Unfold' }).waitFor();
  // Remembered by the program, for this collective.
  for (let i = 0; i < 50 && app.store.book().unfolded?.[col] !== false; i++) await new Promise((r) => setTimeout(r, 100));
  assert.equal(app.store.book().unfolded?.[col], false);
  await shot(page, '08-folded');
  await page.reload();
  await page.click('[data-action=tab][data-tab=collectives]');
  await page.locator('#e-may').waitFor({ timeout: 90_000 });
  assert.equal(await page.locator('#e-may').evaluate((d) => (d as HTMLDetailsElement).open), false, 'still folded after a reload');
  await page.locator('#e-may summary').click();
  await page.locator('#e-may .item').first().waitFor();

  // H15: another Edubba, holding Ana, brings it by its ID.
  const o = await Client.open(await newKey(), other.base);
  await o.ask('pair', { code: other.access.newCode(), label: 'other' });
  await o.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  const ana = app.collectives.store.identity(ids[1]);
  await o.ask('bring', { name: 'Ana', id: ana.id, words: toWords(unhex(ana.f.signingSecret)).join(' '), address: homes[0].base });
  await page.goto(`${other.base}/#pair=${other.access.newCode()}`);
  await page.locator('h1.mark', { hasText: 'Edubba' }).waitFor();
  await page.click('[data-action=tab][data-tab=collectives]');
  await page.click('.entry.add[data-id=bring]');
  await page.fill('#bring-collective input[name=id]', col);
  await page.fill('#bring-collective input[name=name]', 'The tablet house');
  await shot(page, '09-bring-collective');
  await page.click('#bring-collective button[type=submit]');
  await said('“The tablet house” is here');
  await page.locator(`.entry[data-id="${col}"]`, { hasText: 'brought here · no key held' }).waitFor();
  await page.locator('#e-may', { hasText: 'Edubba holds none of its keys' }).waitFor({ timeout: 90_000 });
  await page.locator('#e-may', { hasText: 'Ana' }).waitFor();
  await page.locator('#e-posts').waitFor();
  await shot(page, '10-brought-collective');
  assert.deepEqual(problems, []);
});
