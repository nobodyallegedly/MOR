// Real collectives (H18) in real browsers, as three people on three devices:
// the founder's Edubba, a member's Dub on the Mac, and a member's Dub web
// client (built as released, served with its headers), each in its own
// headless Chromium page with its own profile, by clicks and typing alone.
// Real homes and a relay on local ports; nothing simulated.
//
// The founding proposed in Edubba; a proposal waiting in a Dub whose
// Signing tab is off; each member reading it in plain words and signing in
// its own Dub; Edubba founding it once every party signed; each share shown
// once in its member's Dub, three words typed back; the founder's own shown
// in Edubba once; a release signed in a member's Dub and counting; no share
// or one-time secret in any folder or in the web client's storage, read
// whole. `MOR_SCREENSHOTS=DIR` keeps every new screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { hex } from '../../genesis/src/core.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { serve, type Running } from '../src/server.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN, type Running as DubRunning } from '../../dub/src/server.ts';
import { contentSecurityPolicy } from '../../dub/src/web/headers.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';
import { ummiaFor } from './ummia.ts';

const dubDir = fileURLToPath(new URL('../../dub/', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `real-${name}.png`), fullPage: true });
};
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

let homes: Relay[];
let relay: Relay;
let site: Server;
let webBase: string;
let browser: Browser;
let edubba: Running;
let mac: DubRunning;
let eDir: string;
let macDir: string;
const contexts: BrowserContext[] = [];
/** Other programs a test starts (Ummia, round 3). */
const others: { close(): Promise<void> }[] = [];
const problems: string[] = [];

before(async () => {
  const dist = mkdtempSync(join(tmpdir(), 'real-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dist], { cwd: dubDir, stdio: ['ignore', 'ignore', 'inherit'] });
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    try {
      if (!/^[a-z0-9_.]+$/.test(name) || name === 'dub.json') throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': policy, 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  webBase = `http://127.0.0.1:${(site.address() as { port: number }).port}`;
  eDir = join(mkdtempSync(join(tmpdir(), 'real-browser-edubba-')), 'edubba');
  edubba = await serve({ dir: eDir, port: 0, machineEvery: 0, drafts: join(eDir, '..', 'drafts') });
  macDir = mkdtempSync(join(tmpdir(), 'real-browser-dub-'));
  mac = await serveDub({ dir: macDir, port: 0 });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  for (const c of contexts) await c.close();
  await browser?.close();
  await edubba?.close();
  await mac?.close();
  for (const o of others) await o.close();
  await new Promise((r) => site?.close(r));
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function pageOf(url: string): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 900, height: 1000 } });
  contexts.push(context);
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(`${url}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`${url}: ${e.message}`));
  page.on('dialog', (d) => void d.accept(d.type() === 'prompt' ? '' : undefined));
  await page.goto(url);
  return page;
}

/** Everything a page's origin keeps in the browser, read whole. */
async function kept(page: Page): Promise<string> {
  return JSON.stringify(
    await page.evaluate(async () => {
      const out: Record<string, unknown> = { local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie, caches: await caches.keys() };
      for (const info of await indexedDB.databases()) {
        const db = await new Promise<IDBDatabase>((res, rej) => {
          const r = indexedDB.open(info.name!);
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
        for (const s of [...db.objectStoreNames]) {
          const st = db.transaction(s).objectStore(s);
          out[`${info.name}/${s}`] = await new Promise((res) => {
            const r = st.getAll();
            r.onsuccess = () => res(r.result);
          });
        }
        db.close();
      }
      return out;
    }),
  );
}

function everything(dir: string): string {
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

const done = (page: Page, sel: string, words: string | RegExp) => page.locator(sel, { hasText: words }).first().waitFor({ timeout: 90_000 });

/** Make an identity in a Dub page by clicks (the chain key's words shown, hidden, three typed back). */
async function makeIn(page: Page) {
  const begin = page.locator('form#begin');
  await begin.locator('textarea[name=homes]').fill(homes[0].base);
  await begin.locator('textarea[name=relays]').fill(relay.base);
  await begin.getByRole('button', { name: 'Make it' }).click();
  await page.locator('#words').waitFor({ timeout: 60_000 });
  const written = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await page.getByRole('button', { name: 'I have written them down' }).click();
  const inputs = page.locator('form#confirm input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(written[p - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await done(page, '#status .note.done', 'The identity is born');
}

/** Turn Signing on in a Dub page's identity window, and come back to its Signing tab. */
async function signingOn(page: Page, name: string) {
  await page.locator('[data-action=window]').click();
  await page.locator('#signing-on').waitFor();
  await shot(page, `${name}-identity-window-signing`);
  await page.locator('#signing-on').check();
  await done(page, '#status .note', /Signing is on/);
  await page.getByRole('button', { name: 'Back to Dub' }).click();
  await page.locator('[data-tab=signing]').click();
}

/** In a Dub page: show its share once, read it, hide it, type three words back. */
async function shareIn(page: Page, name: string): Promise<{ x: number; words: string[] }> {
  await page.locator('[data-tab=signing]').click();
  await page.locator('[data-action=share]').first().waitFor({ timeout: 90_000 });
  await page.locator('[data-action=share]').first().click();
  await page.locator('#share-words').waitFor({ timeout: 60_000 });
  const words = (await page.locator('#share-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  const x = Number((await page.locator('.share-number strong').innerText()).trim());
  assert.match(await page.locator('#share-shown').innerText(), /The collective’s chain key share/i);
  assert.equal(await page.locator('#share-shown input').count(), 0, 'nothing asked while the words show');
  await shot(page, `${name}-share-shown`);
  await page.getByRole('button', { name: /I have written share \d+ and its 24 words down/ }).click();
  const form = page.locator('form.share-back');
  await form.waitFor();
  assert.equal(await page.locator('#share-words').count(), 0, 'the words are hidden before three are asked (H3)');
  const inputs = form.locator('input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  await shot(page, `${name}-share-type-back`);
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(words[p - 1]);
  await form.getByRole('button', { name: 'Check them' }).click();
  await done(page, '#status .note.done', 'Your share is written down');
  return { x, words };
}

/** A number of the founding grid (round 3), typed and left, as a person would. */
async function gridNumber(page: Page, field: string, value: string) {
  const x = page.locator(`#e-grid-real-found input[data-grid-num="${field}"]`);
  await x.fill(value);
  await x.press('Tab');
}

test('three people, three apps, three browsers: a real collective founded, a release signed, nothing of a share kept anywhere', async () => {
  // The founder's Edubba: its places and its identity (set up by its own requests), then only clicks.
  const ec = await Client.open(await newKey(), edubba.base);
  await ec.ask('pair', { code: edubba.access.newCode(), label: 'setup' });
  await ec.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  const nobody = (await ec.ask<Done>('identity', { name: 'Nobody, allegedly', linked: false })).acts[0];

  // Two members: one on Dub's web client, one on Dub on the Mac, each made by clicks in its own browser.
  const web = await pageOf(webBase);
  await web.locator('form#begin').waitFor({ timeout: 60_000 });
  await makeIn(web);
  const webId = await web.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res) => {
      const r = indexedDB.open('dub');
      r.onsuccess = () => res(r.result);
    });
    return new Promise<string>((res) => {
      const r = db.transaction('keep').objectStore('keep').get('active');
      r.onsuccess = () => res(String(r.result));
    });
  });
  const macPage = await pageOf(`${mac.base}/#pair=${mac.access.newCode()}`);
  await macPage.locator('form#begin').waitFor({ timeout: 60_000 });
  await makeIn(macPage);
  const macId = (await mac.dub.state()).identity!.id;
  assert.match(webId, /^[0-9a-f]{64}$/);

  // Edubba: contacts, then the founding, reviewed in plain words, signed.
  const ed = await pageOf(`${edubba.base}/#pair=${edubba.access.newCode()}`);
  await ed.locator('h1.mark', { hasText: 'Edubba' }).waitFor();
  await ed.click('[data-action=tab][data-tab=collectives]');
  // H27: what real and test mean, on the buttons and beside them.
  await ed.locator('.entry.add[data-id=real]', { hasText: 'members on their own devices' }).waitFor();
  await ed.locator('.entry.add[data-id=found]', { hasText: 'everyone held here, for trying alone' }).waitFor();
  assert.match(await ed.locator('.list').innerText(), /each member is a person with their own identity, on their own device[\s\S]*every member is held in this Edubba, and their consent is simulated[\s\S]*shares of its chain key are kept in this Edubba’s folder/);
  // H33: whom the tab acts as, said.
  assert.equal(await ed.locator('#acting-select').inputValue(), nobody);
  await shot(ed, 'edubba-collectives-list');
  await ed.click('.entry.add[data-id=real]');
  await ed.locator('#e-contacts').waitFor();
  for (const [id, name] of [[webId, 'Ana (web)'], [macId, 'Bo (Mac)']]) {
    await ed.fill('#contact-add input[name=id]', id);
    await ed.fill('#contact-add input[name=name]', name);
    await ed.click('#contact-add button[type=submit]');
    await ed.locator('#e-contacts li', { hasText: name }).waitFor({ timeout: 30_000 });
  }
  await ed.fill('#real-found input[name=name]', 'The tablet house');
  for (const id of [webId, macId]) await ed.check(`#real-found input[name=member][value="${id}"]`);
  // The grid (round 3): its one area, Publishing, asks two members' keys, as the Releases area did.
  await ed.locator('#e-grid-real-found table.grid thead th[scope=col]').nth(2).waitFor({ timeout: 30_000 });
  await gridNumber(ed, 'area:0', '2');
  await shot(ed, 'edubba-found-form');
  await ed.click('#real-found button[type=submit]');
  await ed.locator('#e-real-review #reading h2', { hasText: 'Propose to found the collective “The tablet house”' }).waitFor({ timeout: 90_000 });
  assert.match(await ed.locator('#e-real-review').innerText(), /How it travels[\s\S]*negotiation message/);
  await shot(ed, 'edubba-found-review');
  await ed.click('#e-real-review [data-action=confirm]');
  await done(ed, '#e-status .note.done', 'The founding of “The tablet house” is proposed');
  await ed.locator('.proposal-status').waitFor();
  assert.match(await ed.locator('.proposal-status').innerText(), /1 of 3 signed/);
  await shot(ed, 'edubba-founding-waiting');

  // The Mac Dub has Signing off: the proposal waits, said on its Private tab.
  await macPage.reload();
  await macPage.locator('[data-tab=private]').click();
  await done(macPage, '#signing-waiting', /A proposal to sign waits[\s\S]*Signing is off/);
  assert.equal(await macPage.locator('[data-tab=signing]').count(), 0, 'no Signing tab while it is off');
  await shot(macPage, 'mac-proposal-waits');

  // The web member turns Signing on, reads the proposal in plain words, signs.
  await signingOn(web, 'web');
  const card = web.locator('.proposal').first();
  await card.locator('h3', { hasText: 'Found a collective' }).waitFor({ timeout: 90_000 });
  const read = await card.innerText();
  for (const h of ['What each party is bound to', 'Who decides what', 'Shares and fees', 'How it ends', 'Risks']) assert.ok(read.includes(h), h);
  assert.match(await web.locator('.experimental').innerText(), /Even more experimental/);
  await shot(web, 'web-proposal');
  await card.getByRole('button', { name: 'Sign it' }).click();
  await done(web, '#status .note.done', 'Signed');
  await web.locator('.proposal .state', { hasText: 'Signed by you' }).waitFor();
  await web.locator('[data-action=sharehand]').waitFor();
  // H30: a plain button where the share is awaited; a reload keeps the Signing tab.
  await web.getByRole('button', { name: 'Look for my share' }).click();
  await done(web, '#status', /Not arrived yet/);
  await shot(web, 'web-signed-waiting-share');
  await web.reload();
  await web.locator('[data-tab=signing].on').waitFor({ timeout: 60_000 });
  await web.locator('.proposal .state', { hasText: 'Signed by you' }).waitFor({ timeout: 60_000 });

  // The Mac member, the same.
  await signingOn(macPage, 'mac');
  await macPage.locator('.proposal').first().getByRole('button', { name: 'Sign it' }).click();
  await done(macPage, '#status .note.done', 'Signed');

  // Edubba: the answers, looked for by itself (H32: no click, the button kept), then founding; the founder's own share shown once, typed back.
  await ed.locator('[data-action=real-gather]').waitFor();
  await ed.locator('.proposal-status', { hasText: '3 of 3 signed' }).waitFor({ timeout: 90_000 });
  await shot(ed, 'edubba-founding-all-signed');
  // F337: founding refused until what this device will hold is read and ticked.
  assert.match(await ed.locator('.proposal-status').innerText(), /trusted-dealer weakness[\s\S]*one hour at most/);
  await ed.click('[data-action=real-found]');
  await ed.locator('#e-status .note.warn', { hasText: 'Read what this device will hold while founding (F337)' }).waitFor();
  await ed.check('input[id^=real-found-read-]');
  await ed.click('[data-action=real-found]');
  await done(ed, '#e-status .note.done', '“The tablet house” is founded');
  await ed.locator('#e-to-show').waitFor();
  await shot(ed, 'edubba-founded');
  await ed.click('[data-action=real-show-share]');
  await ed.locator('#e-share-here .words').waitFor();
  const mine = (await ed.locator('#e-share-here .words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await shot(ed, 'edubba-own-share');
  await ed.click('[data-action=real-share-written]');
  const back = ed.locator('#real-share-back');
  const pos = (await back.locator('input').evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of pos.entries()) await back.locator('input').nth(i).fill(mine[p - 1]);
  await back.getByRole('button', { name: 'Check them' }).click();
  await done(ed, '#e-status .note.done', /Share \d is written down/);

  // H30: the web member, still on its Signing tab, finds its share by itself.
  await web.locator('[data-action=share]').first().waitFor({ timeout: 90_000 });
  // Each member opens its own share once, in its own Dub.
  const ws = await shareIn(web, 'web');
  const ms = await shareIn(macPage, 'mac');
  assert.deepEqual([...new Set([ws.x, ms.x])].length, 2);

  // Nothing of a share, nor a one-time secret, anywhere: the web client's storage and every folder read whole.
  const values = [mine, ws.words, ms.words].map((w) => fromWords(w));
  const places = { web: await kept(web), edubba: everything(eDir), mac: everything(macDir) };
  for (const v of values) for (const [where, text] of Object.entries(places)) for (const f of [hex(v), Buffer.from(v).toString('base64')]) assert.ok(!text.includes(f), `a share in ${where}`);
  for (const w of [mine, ws.words, ms.words]) for (const [where, text] of Object.entries(places)) assert.ok(!text.includes(w.slice(0, 6).join(' ')), `a share's words in ${where}`);
  assert.ok(!/"waiting":\{"[0-9a-f]{64}"/.test(places.web), 'no one-time secret in the web client’s storage');
  // Nor another's key: the founder's and the Mac member's signing keys appear nowhere but in their own app.
  const founderKey = JSON.parse(readFileSync(join(eDir, 'identities', `${nobody}.json`), 'utf8')).signingSecret as string;
  const macKey = JSON.parse(readFileSync(join(macDir, 'identities', macId, 'identity.json'), 'utf8')).signingSecret as string;
  for (const [where, text] of [['web', places.web], ['mac', places.mac]] as const) assert.ok(!text.includes(founderKey), `the founder's key in ${where}`);
  for (const [where, text] of [['web', places.web], ['edubba', places.edubba]] as const) assert.ok(!text.includes(macKey), `the Mac member's key in ${where}`);
  const webKey = (JSON.parse(places.web)['dub/keep'] as { identity: string; signingSecret: string }[]).find((x) => x?.identity === webId)?.signingSecret;
  assert.ok(webKey && !places.edubba.includes(webKey) && !places.mac.includes(webKey), 'the web member’s key in no other app');

  // A release of the collective: made in Ummia (round 3, F339), signed by the web member in its Dub, then counting. Edubba's card says where releases are made.
  await ed.locator('#e-real-release').waitFor({ timeout: 60_000 });
  assert.match(await ed.locator('#e-real-release').innerText(), /made in Ummia/);
  assert.equal(await ed.locator('#real-release').count(), 0);
  const founderSecret = JSON.parse(readFileSync(join(eDir, 'identities', `${nobody}.json`), 'utf8')).signingSecret as string;
  const realId = ((await ec.ask<any>('state')).collectives as { id: string; real?: boolean }[]).find((x) => x.real)!.id;
  const um = await ummiaFor({ id: nobody, secret: founderSecret, home: homes[0].base, relays: [relay.base], collective: realId, apps: others });
  const relId = await um.release('tablets', '1', 'a tablet\n');
  await web.reload();
  await web.locator('[data-tab=signing]').click();
  const rel = web.locator('.proposal', { hasText: 'Sign a release: tablets 1' });
  await rel.waitFor({ timeout: 90_000 });
  assert.match(await rel.innerText(), /clay\.txt: 9 bytes/);
  await shot(web, 'web-release');
  await rel.getByRole('button', { name: 'Sign it' }).click();
  await done(web, '#status .note.done', 'Signed');
  assert.ok((await um.standing(relId)).met, 'it counts as the collective’s release');
  await shot(ed, 'edubba-collective');

  // A member change, reviewed (its signing in members' apps and its rotation are in test/real.test.ts):
  // three to two members no longer fits the absence rule, said plainly, Sign off.
  // Folded at first (H34): opened to change its members.
  await ed.click('#e-real-change > summary');
  await ed.uncheck(`#real-change input[name=member][value="${macId}"]`);
  await ed.click('#real-change button[type=submit]');
  // The grid (round 3) says it first, in its own words: the numbers no longer fit two members.
  await ed.locator('#e-real-review #reading', { hasText: 'Judge absence: a number from 1 to 1' }).waitFor({ timeout: 60_000 });
  assert.ok(await ed.locator('#e-real-review [data-action=confirm]').isDisabled());
  await ed.click('#e-real-review [data-action=cancel]');
  // With the same members and a contact more, it is: every voice and the joining member sign; then it waits for Kišib.
  await ed.check(`#real-change input[name=member][value="${macId}"]`);
  await ed.fill('#real-change textarea[name=typed]', nobody.replace(/./g, (ch, i) => (i === 0 ? (ch === 'a' ? 'b' : 'a') : ch)));
  await ed.click('#real-change button[type=submit]');
  await ed.locator('#e-real-review #reading').waitFor({ timeout: 60_000 });
  await shot(ed, 'edubba-change-review');
  await ed.click('#e-real-review [data-action=cancel]');

  // Test mode, labelled.
  await ed.click('.entry.add[data-id=found]');
  await ed.locator('.note.warn', { hasText: 'Test mode' }).waitFor();
  await shot(ed, 'edubba-test-mode');
  assert.deepEqual(problems, []);
});

test('H33: Edubba acting as a member it holds: the proposal read in plain words, signed there, the share shown once and kept nowhere; contacts from a follow list sealed in Dub', async () => {
  const ec = await Client.open(await newKey(), edubba.base);
  await ec.ask('pair', { code: edubba.access.newCode(), label: 'setup' });
  const st0 = await ec.ask<{ identities: { id: string; name: string }[] }>('state');
  const nobody = st0.identities.find((i) => i.name === 'Nobody, allegedly')!.id;
  const dee = (await ec.ask<Done>('identity', { name: 'Dee (held here)', linked: false })).acts[0];
  const ed = await pageOf(`${edubba.base}/#pair=${edubba.access.newCode()}`);
  await ed.locator('h1.mark', { hasText: 'Edubba' }).waitFor();
  await ed.click('[data-action=tab][data-tab=collectives]');
  await ed.click('.entry.add[data-id=real]');
  await ed.fill('#real-found input[name=name]', 'Two of us');
  await ed.selectOption('#real-found select[name=founder]', nobody);
  await ed.fill('#real-found textarea[name=typed]', dee);
  await ed.locator('#real-found textarea[name=typed]').press('Tab');
  await ed.locator('#e-grid-real-found table.grid thead th[scope=col]').nth(1).waitFor({ timeout: 30_000 });
  for (const [n, v] of [['chain', '1'], ['area:0', '1'], ['clone', '2'], ['absence', '1']]) await gridNumber(ed, n, v);
  await ed.click('#real-found button[type=submit]');
  await ed.locator('#e-real-review #reading').waitFor({ timeout: 90_000 });
  await ed.click('#e-real-review [data-action=confirm]');
  await done(ed, '#e-status .note.done', 'The founding of “Two of us” is proposed');

  // Acting as Dee: the proposal, read in plain words, signed here.
  await ed.selectOption('#acting-select', dee);
  await done(ed, '#e-status .note.done', 'Acting as Dee (held here)');
  await ed.click('#e-to-sign');
  const card = ed.locator('#e-signing .proposal').first();
  await card.locator('h3', { hasText: 'Found a collective' }).waitFor({ timeout: 90_000 });
  for (const h of ['What each party is bound to', 'Who decides what', 'Risks']) assert.ok((await card.innerText()).includes(h), h);
  assert.match(await ed.locator('#e-detail .experimental').innerText(), /Even more experimental/);
  await shot(ed, 'edubba-member-proposal');
  await card.getByRole('button', { name: 'Sign it' }).click();
  await done(ed, '#e-status .note.done', 'Signed');
  await ed.locator('#e-signing .proposal .state', { hasText: 'Signed by you' }).waitFor({ timeout: 60_000 });

  // Back as the founder: every answer in, by itself (H32); founded; Dee's share sealed to its one-time key.
  await ed.selectOption('#acting-select', nobody);
  await done(ed, '#e-status .note.done', 'Acting as Nobody, allegedly');
  const entry = ed.locator('.entry', { hasText: 'Two of us' });
  await entry.click();
  await ed.locator('.proposal-status', { hasText: '2 of 2 signed' }).waitFor({ timeout: 90_000 });
  await ed.check('input[id^=real-found-read-]');
  await ed.click('[data-action=real-found]');
  await done(ed, '#e-status .note.done', '“Two of us” is founded');

  // As Dee again: its share, shown once, three words typed back, then nothing of it here.
  await ed.selectOption('#acting-select', dee);
  await done(ed, '#e-status .note.done', 'Acting as Dee');
  await ed.click('#e-to-sign');
  await ed.locator('#e-signing [data-action=share]').waitFor({ timeout: 90_000 });
  await ed.click('#e-signing [data-action=share]');
  await ed.locator('#share-words').waitFor({ timeout: 60_000 });
  const words = (await ed.locator('#share-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await shot(ed, 'edubba-member-share');
  await ed.getByRole('button', { name: /I have written share \d+ and its 24 words down/ }).click();
  const form = ed.locator('#e-signing form.share-back');
  const positions = (await form.locator('input').evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await form.locator('input').nth(i).fill(words[p - 1]);
  await form.getByRole('button', { name: 'Check them' }).click();
  await done(ed, '#e-status .note.done', 'The share is written down');
  const all = everything(eDir);
  assert.ok(!all.includes(hex(fromWords(words))) && !all.includes(words.slice(0, 6).join(' ')), 'no share in Edubba’s folder');
  assert.ok(!/"waiting":\s*\{\s*"[0-9a-f]{64}"/.test(readFileSync(join(eDir, 'member', `${dee}.signing.json`), 'utf8')), 'the one-time key destroyed');

  // People cMIP draft 2: the follow list sealed to Nobody, written by a Dub holding it, joins Edubba's contacts with its names.
  const f = JSON.parse(readFileSync(join(eDir, 'identities', `${nobody}.json`), 'utf8')) as { signingSecret: string };
  const { toWords } = await import('../../../modules/carry/src/carry.ts');
  const { unhex } = await import('../../genesis/src/core.ts');
  await mac.dub.bring({ id: nobody, words: toWords(unhex(f.signingSecret)).join(' '), address: homes[0].base });
  await mac.dub.follow({ id: 'ab'.repeat(32), name: 'Ezra, met in Dub' });
  await ed.selectOption('#acting-select', nobody);
  await ed.click('.entry.add[data-id=real]');
  await ed.click('#e-contacts [data-action=real-lists]');
  await ed.locator('#e-contacts li', { hasText: 'Ezra, met in Dub' }).waitFor({ timeout: 60_000 });
  assert.match(await ed.locator('#e-contacts li', { hasText: 'Ezra, met in Dub' }).innerText(), /in Nobody, allegedly’s follow list/);
  await shot(ed, 'edubba-contacts-from-list');
  assert.deepEqual(problems, []);
});
