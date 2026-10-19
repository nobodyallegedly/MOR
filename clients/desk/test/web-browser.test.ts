// Edubba's web client (testing only) in headless Chromium, by clicks and
// typing alone, as people on several devices: the founder in Edubba's web
// client, each member in Dub's web client, each in its own browser profile,
// both clients built as released and served with their headers. Real homes
// and a relay on local ports; nothing simulated.
//
// The banner on every screen; no Agents tab, nothing of Claude's, no test
// collective, no folder; an identity brought by its ID (written for people)
// and its words; one tab at a time; a real collective founded with members
// signing in Dub on the web, the shares dealt, nothing of a share kept in any
// browser; a member change signed in Dub on the web, then waiting for Kišib;
// a correction; a collective brought by its ID, read only; the forms written
// for people; every list and feed in its own scrollable box (H42).
// `MOR_SCREENSHOTS=DIR` keeps every new screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { hex, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { shownId } from '../../genesis/src/shown.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { post as postAs } from '../../barebone/src/post.ts';
import { encryptionSecret, fromWords, toWords } from '../../../modules/carry/src/carry.ts';
import { contentSecurityPolicy } from '../../dub/src/web/headers.ts';
import { WEB_BANNER, RELEASE_ON_WEB } from '../src/page/view.ts';

const deskDir = fileURLToPath(new URL('..', import.meta.url));
const dubDir = fileURLToPath(new URL('../../dub/', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `web-${name}.png`), fullPage: true });
};
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png' };

let homes: Relay[];
let relay: Relay;
let browser: Browser;
const servers: Server[] = [];
let edubbaBase: string;
let dubBase: string;
const contexts: BrowserContext[] = [];
const problems: string[] = [];

/** A web client built as released, served with its headers on a port of its own (its own origin). */
async function served(cwd: string, policy: string): Promise<string> {
  const dist = mkdtempSync(join(tmpdir(), 'web-client-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dist], { cwd, stdio: ['ignore', 'ignore', 'inherit'] });
  const site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    try {
      if (!/^[a-z0-9_.-]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': policy, 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  servers.push(site);
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${(site.address() as { port: number }).port}`;
}

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  edubbaBase = await served(deskDir, policy);
  dubBase = await served(dubDir, policy);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  for (const c of contexts) await c.close();
  await browser?.close();
  for (const s of servers) await new Promise((r) => s.close(r));
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

/** A page in a browser profile of its own (its own storage), or in `context`. */
async function pageOf(url: string, context?: BrowserContext): Promise<Page> {
  if (!context) {
    context = await browser.newContext({ viewport: { width: 900, height: 1000 } });
    contexts.push(context);
  }
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
          const keys = await new Promise<IDBValidKey[]>((res) => {
            const r = st.getAllKeys();
            r.onsuccess = () => res(r.result);
          });
          const values = await new Promise<unknown[]>((res) => {
            const r = st.getAll();
            r.onsuccess = () => res(r.result);
          });
          // A file of Edubba's folder (`src/web/vfs.ts`) read as text; anything else as it is.
          const entries: [string, unknown][] = [];
          for (let i = 0; i < keys.length; i++) {
            const x = values[i] as { data?: unknown } | null;
            entries.push([String(keys[i]), x && typeof x === 'object' && x.data instanceof Uint8Array ? new TextDecoder('latin1').decode(x.data) : x]);
          }
          out[`${info.name}/${s}`] = Object.fromEntries(entries);
        }
        db.close();
      }
      return out;
    }),
  );
}

/** One file of Edubba's folder as the web client keeps it (`src/web/vfs.ts`), parsed. */
async function file<T>(page: Page, path: string): Promise<T> {
  return JSON.parse((JSON.parse(await kept(page)) as Record<string, Record<string, string>>)['edubba/files'][path]) as T;
}

const done = (page: Page, sel: string, words: string | RegExp) => page.locator(sel, { hasText: words }).first().waitFor({ timeout: 90_000 });

/** The banner, whole, on the screen now. */
async function banner(page: Page, where: string) {
  const b = page.locator('#for-testing-only');
  assert.ok(await b.isVisible(), `the banner on ${where}`);
  assert.match(await b.innerText(), /For testing only[\s\S]*signing key[\s\S]*storage[\s\S]*chain key[\s\S]*memory/);
}

/** An identity made elsewhere, as Dub makes one: an inbox, and the encryption key its signing key's words carry. */
async function elsewhere(): Promise<TestIdentity> {
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  await g.publishRoutes([
    { scope: null, hints: [relay.base], kind: 0 },
    { scope: null, hints: [relay.base], kind: 1 },
  ]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  for (const act of g.chainActs()) await relayAt(relay.base).putAct(act);
  return g;
}

/** Edubba's web client: its places set in Settings, by clicks. */
async function places(ed: Page) {
  await ed.click('[data-action=tab][data-tab=settings]');
  await ed.fill('#desk-settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await ed.fill('#desk-settings textarea[name=relays]', relay.base);
  await ed.click('#desk-settings button[type=submit]');
  await done(ed, '#settings-status, #e-status', /saved/i);
}

/** Bring an identity into Edubba's web client by its ID written for people and its words, by clicks. */
async function bringIn(ed: Page, name: string, g: TestIdentity) {
  await ed.click('[data-action=tab][data-tab=identities]');
  await ed.click('.entry.add[data-id=new]');
  await ed.fill('#bring-identity input[name=name]', name);
  await ed.fill('#bring-identity input[name=id]', shownId(g.id));
  await ed.fill('#bring-identity textarea[name=words]', toWords(unhex(g.f.signingSecret)).join(' '));
  await ed.click('#bring-identity button[type=submit]');
  await done(ed, '#e-status .note.done', `“${name}” is here`);
}

/** Make an identity in a Dub web page by clicks (the chain key's words shown, hidden, three typed back); its ID. */
async function makeIn(page: Page): Promise<string> {
  await page.locator('form#begin').waitFor({ timeout: 60_000 });
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
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res) => {
      const r = indexedDB.open('dub');
      r.onsuccess = () => res(r.result);
    });
    return new Promise<string>((res) => {
      const r = db.transaction('keep').objectStore('keep').get('active');
      r.onsuccess = () => res(String(r.result));
    });
  });
}

/** Turn Signing on in a Dub page's identity window, and come back to its Signing tab. */
async function signingOn(page: Page) {
  await page.locator('[data-action=window]').click();
  await page.locator('#signing-on').waitFor();
  await page.locator('#signing-on').check();
  await done(page, '#status .note', /Signing is on/);
  await page.getByRole('button', { name: 'Back to Dub' }).click();
  await page.locator('[data-tab=signing]').click();
}

/** In a Dub page: sign the proposal whose title says `what`. */
async function signIn(page: Page, what: RegExp, reload = false) {
  // A proposal arriving later is found on opening (as for a release in test/real-browser.test.ts).
  if (reload) {
    await page.reload();
    await page.locator('[data-tab=signing]').waitFor({ timeout: 60_000 });
  }
  await page.locator('[data-tab=signing]').click();
  const card = page.locator('.proposal', { has: page.locator('h3', { hasText: what }) }).first();
  await card.waitFor({ timeout: 90_000 });
  await card.getByRole('button', { name: 'Sign it' }).click();
  await done(page, '#status .note.done', 'Signed');
}

/** In a Dub page: show its share once, hide it, type three words back; its words. */
async function shareIn(page: Page): Promise<string[]> {
  await page.locator('[data-tab=signing]').click();
  await page.locator('[data-action=share]').first().waitFor({ timeout: 90_000 });
  await page.locator('[data-action=share]').first().click();
  await page.locator('#share-words').waitFor({ timeout: 60_000 });
  const words = (await page.locator('#share-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await page.getByRole('button', { name: /I have written share \d+ and its 24 words down/ }).click();
  const form = page.locator('form.share-back');
  const inputs = form.locator('input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(words[p - 1]);
  await form.getByRole('button', { name: 'Check them' }).click();
  await done(page, '#status .note.done', 'Your share is written down');
  return words;
}

/** At an iPhone's width (the viewport set to 390 pixels): nothing wider than the screen, and the banner there. */
async function narrow(page: Page, where: string) {
  const wide = await page.evaluate(() =>
    // A grid scrolls sideways inside its own box (round 3): what lies within it is not the page's width.
    [...document.querySelectorAll('body *')].filter((x) => !x.closest('.gridbox') && x.getBoundingClientRect().right > 391).map((x) => `${x.tagName.toLowerCase()}.${x.className} ${Math.round(x.getBoundingClientRect().right)}`),
  );
  assert.deepEqual(wide, [], `nothing wider than the phone on ${where}`);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= 390, `no sideways scrolling on ${where}`);
  await banner(page, `${where}, at a phone’s width`);
}

/** H42: an element whose content scrolls inside it, not the page. */
const scrolls = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => ['auto', 'scroll'].includes(getComputedStyle(el).overflowY) && getComputedStyle(el).maxHeight !== 'none');

test('the banner on every screen; no Agents tab and nothing of Claude’s; an identity brought by its ID written for people; one tab at a time', async () => {
  const ed = await pageOf(edubbaBase);
  await ed.locator('h1.mark', { hasText: 'Edubba' }).waitFor({ timeout: 60_000 });
  // The banner is in the page's HTML itself, so it shows even before the script runs.
  assert.ok(readFileSync(join(deskDir, 'static/web.html'), 'utf8').includes('<!-- edubba banner -->'));
  await banner(ed, 'the first screen');
  // No Agents tab: the Identities tab first, while nothing is held, with its one door.
  assert.deepEqual(await ed.locator('nav.tabs [data-action=tab]').evaluateAll((xs) => xs.map((x) => (x as HTMLElement).dataset.tab)), ['collectives', 'publishing', 'identities']);
  assert.equal(await ed.locator('[data-tab=agents]').count(), 0);
  await ed.locator('#bring-identity').waitFor();
  assert.equal(await ed.locator('#new-identity').count(), 0, 'no identity made here');
  assert.equal(await ed.locator('input[name=linked]').count(), 0, 'nothing of Claude’s');
  await shot(ed, 'first');
  await places(ed);
  await banner(ed, 'Settings');
  assert.equal(await ed.locator('textarea[name=via], input[name=drafts], [data-collective-root], [data-action=code]').count(), 0, 'Settings: homes and relays only');
  await shot(ed, 'settings');

  const ada = await elsewhere();
  // Wrong words: refused, nothing kept.
  await ed.click('[data-action=tab][data-tab=identities]');
  await ed.fill('#bring-identity input[name=name]', 'Ada');
  await ed.fill('#bring-identity input[name=id]', shownId(ada.id));
  await ed.fill('#bring-identity textarea[name=words]', toWords(crypto.getRandomValues(new Uint8Array(32))).join(' '));
  await ed.click('#bring-identity button[type=submit]');
  await done(ed, '#e-status .note.error', /do not give this identity’s current signing key/);
  await banner(ed, 'a refusal');
  await bringIn(ed, 'Ada', ada);
  assert.ok(!/Claude/.test(await ed.locator('#e-status').innerText()), 'nothing said of Claude');
  // The forms written for people (F349): the ID shown as mid1…, its hexadecimal in its title, copied as mid1….
  const head = ed.locator('#e-detail .head .id span');
  assert.equal(await head.innerText(), shownId(ada.id));
  assert.match(await ed.locator('#e-detail .head [data-action=copy]').getAttribute('data-id') ?? '', /^mid1/);
  await ed.locator('#e-record', { hasText: 'Its keys' }).waitFor({ timeout: 60_000 });
  assert.match(await ed.locator('#e-record').innerText(), /Declared by act mact1/);
  assert.match(await ed.locator('#e-record').innerText(), /Latest act\s+mact1/);
  // The identity's page: its record, relying, its posts; no drafts from Claude and no money drafts; releases said to be Ummia's.
  for (const absent of ['[data-action=link]', '#e-drafts-fold', '[data-action=drafts]', 'form.pay']) assert.equal(await ed.locator(absent).count(), 0, absent);
  assert.match(await ed.locator('#e-detail').innerText(), /kept in this browser’s storage/);
  await banner(ed, 'the Identities tab');
  // H42: the list on top scrolls in its own box.
  assert.ok(await scrolls(ed, '.list[aria-label=Identities]'), 'the identities list scrolls in its own box');
  await shot(ed, 'identity');

  // Kept: a reload finds it, read from this browser's storage.
  await ed.reload();
  await ed.locator('.list[aria-label=Collectives]').waitFor({ timeout: 60_000 });
  await banner(ed, 'the Collectives tab');
  await ed.click('[data-action=tab][data-tab=identities]');
  await ed.locator('.entry', { hasText: 'Ada' }).waitFor();
  const stored = await kept(ed);
  assert.ok(stored.includes(ada.f.signingSecret), 'the signing key is kept in this browser’s storage, as the banner says');
  assert.ok(!stored.includes(ada.f.safety.seeds), 'never its chain key');

  // The Collectives tab: no test collective; the Publishing tab: its placeholder.
  await ed.click('[data-action=tab][data-tab=collectives]');
  assert.equal(await ed.locator('.entry.add[data-id=found]').count(), 0, 'no test collective on the web');
  await ed.locator('.entry.add[data-id=real]').waitFor();
  await ed.locator('.entry.add[data-id=bring]').waitFor();
  await ed.click('[data-action=tab][data-tab=publishing]');
  await banner(ed, 'the Publishing tab');
  await ed.locator('#e-body', { hasText: 'Coming after Damgar’s round 2' }).waitFor();

  // At an iPhone's width, nothing scrolls sideways, on every tab.
  await ed.setViewportSize({ width: 390, height: 844 });
  for (const tab of ['collectives', 'identities', 'settings']) {
    await ed.click(`[data-action=tab][data-tab=${tab}]`);
    await ed.waitForTimeout(300);
    await narrow(ed, tab);
  }
  await shot(ed, 'phone');
  await ed.setViewportSize({ width: 900, height: 1000 });

  // One tab at a time: a second tab of the same site says so and keeps nothing apart.
  const second = await pageOf(edubbaBase, ed.context());
  await done(second, '.note.error', /open in another tab of this browser/);
  await banner(second, 'the second tab');
  await shot(second, 'second-tab');
  await second.close();
  assert.deepEqual(problems, []);
});

test('a real collective founded in the web client, its members signing in Dub on the web; the shares dealt and kept nowhere; a member change; a correction; a collective brought read only', async () => {
  const nobody = await elsewhere();
  // A post of its own, made where it was made, to correct here later.
  const first = await postAs(nobody, { text: 'The tablet house opens on Monday.', relays: [relay.base] });

  // Two members, each on Dub's web client in a browser of their own, made by clicks.
  const ana = await pageOf(dubBase);
  const anaId = await makeIn(ana);
  const bo = await pageOf(dubBase);
  const boId = await makeIn(bo);
  const cy = await pageOf(dubBase);
  const cyId = await makeIn(cy);

  // The founder's Edubba, on the web.
  const ed = await pageOf(edubbaBase);
  await ed.locator('h1.mark', { hasText: 'Edubba' }).waitFor({ timeout: 60_000 });
  await places(ed);
  await bringIn(ed, 'Nobody, allegedly', nobody);

  // A correction of its own post, from the Identities tab, as on the Mac.
  await ed.locator('#e-identity-posts > summary').click();
  const p1 = ed.locator(`#e-identity-posts .post[data-post="${first.id}"]`);
  await p1.waitFor({ timeout: 60_000 });
  await p1.locator('details.correct > summary').click();
  await p1.locator('textarea[name=text]').fill('The tablet house opens on Tuesday.');
  await p1.getByRole('button', { name: 'Sign the correction' }).click();
  await done(ed, '#e-status .note.done', /correct/i);
  // Redrawn, its posts folded as the person left them: unfolded.
  await ed.locator('#e-identity-posts .post .label', { hasText: 'Correction' }).waitFor({ state: 'attached', timeout: 60_000 });
  if (!(await ed.locator('#e-identity-posts').evaluate((d) => (d as HTMLDetailsElement).open))) await ed.locator('#e-identity-posts > summary').click();
  assert.match(await ed.locator(`#e-identity-posts .post[data-post="${first.id}"]`).innerText(), /Corrected by/);
  assert.ok(await scrolls(ed, '#e-identity-posts .feed'), 'its posts in their own scrollable box (H42)');
  await shot(ed, 'correction');

  // Contacts, by the IDs written for people, then the founding, read back in plain words, signed.
  await ed.click('[data-action=tab][data-tab=collectives]');
  await ed.click('.entry.add[data-id=real]');
  await banner(ed, 'the founding form');
  assert.match(await ed.locator('#e-detail').innerText(), /This is a web page/);
  for (const [id, name] of [[anaId, 'Ana'], [boId, 'Bo'], [cyId, 'Cy']]) {
    await ed.fill('#contact-add input[name=id]', shownId(id));
    await ed.fill('#contact-add input[name=name]', name);
    await ed.click('#contact-add button[type=submit]');
    await ed.locator('#e-contacts li', { hasText: name }).waitFor({ timeout: 30_000 });
  }
  await ed.fill('#real-found input[name=name]', 'The tablet house');
  for (const id of [anaId, boId]) await ed.check(`#real-found input[name=member][value="${id}"]`);
  // Round 3: the grid. Members are its columns, the founder first; three bands, the constitution first.
  const grid = ed.locator('#e-grid-real-found table.grid');
  await grid.waitFor({ timeout: 30_000 });
  assert.deepEqual((await grid.locator('thead th[scope=col]').allInnerTexts()).length, 3, 'one column per member');
  assert.deepEqual((await grid.locator('tr.band th').allTextContents()).map((x) => x.trim()), ['The constitution', 'The judges', 'The areas: operations']);
  // A Money area: Nobody and Ana's keys, one key, two above 10,000.
  await ed.click('[data-grid-add=real-found]');
  const money = grid.locator('tr[data-area="1"]');
  await money.locator('input.areaname').fill('Money');
  await money.locator('select[data-grid-layer]').selectOption('2');
  for (const id of [nobody.id, anaId]) await grid.locator(`tr[data-area="1"] button[data-grid-cell="area:1"][data-m="${id}"]`).click();
  await grid.locator('tr[data-area="1"] input[data-grid-cap]').fill('10000');
  await grid.locator('tr[data-area="1"] input[data-grid-cap]').press('Tab');
  await grid.locator('tr[data-area="1"] td.say', { hasText: 'above 10,000, 2 keys' }).waitFor({ timeout: 10_000 });
  assert.match(await grid.locator('tfoot').innerText(), /Money/);
  // A second area over all of Money is refused in plain words, then removed.
  await ed.click('[data-grid-add=real-found]');
  await grid.locator('tr[data-area="2"] input.areaname').fill('More money');
  await grid.locator(`tr[data-area="2"] button[data-grid-cell="area:2"][data-m="${boId}"]`).click();
  await ed.click('#real-found button[type=submit]');
  await ed.locator('#e-real-review', { hasText: 'reach the same acts' }).waitFor({ timeout: 90_000 });
  await grid.locator('[data-grid-remove="2"]').click();
  // At a phone's width the grid scrolls in its own box; the page does not.
  await ed.setViewportSize({ width: 390, height: 844 });
  assert.ok(await ed.locator('#e-grid-real-found .gridbox').evaluate((b) => b.scrollWidth > b.clientWidth), 'the grid scrolls sideways in its own box');
  assert.ok(await ed.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'nothing else scrolls sideways');
  await ed.setViewportSize({ width: 900, height: 1000 });
  await shot(ed, 'found-form');
  await ed.click('#real-found button[type=submit]');
  await ed.locator('#e-real-review #reading h2', { hasText: 'Propose to found the collective “The tablet house”' }).waitFor({ timeout: 90_000 });
  const rv = await ed.locator('#e-real-review').innerText();
  assert.match(rv, /The areas[\s\S]*“Money”: all money \(the Money layer\)\. Any one of [\s\S]*above 10,000 regtest satoshis an act, 2 keys/);
  assert.match(rv, /Above 10,000 an act, one more holder's key/);
  await banner(ed, 'the founding review');
  await ed.click('#e-real-review [data-action=confirm]');
  await done(ed, '#e-status .note.done', 'The founding of “The tablet house” is proposed');
  assert.match(await ed.locator('#e-status').innerText(), /The terms are act mact1/);

  // Each member reads it in plain words in Dub on the web, and signs.
  await signingOn(ana);
  await signIn(ana, /Found a collective/);
  await signingOn(bo);
  await signIn(bo, /Found a collective/);

  // The answers, looked for by themselves; founding refused until what this device holds is read; then dealt.
  await ed.locator('.proposal-status', { hasText: '3 of 3 signed' }).waitFor({ timeout: 90_000 });
  await ed.click('[data-action=real-found]');
  await done(ed, '#e-status .note', 'Read what this device will hold while founding (F337)');
  await ed.check('input[id^=real-found-read-]');
  await ed.click('[data-action=real-found]');
  await done(ed, '#e-status .note.done', '“The tablet house” is founded');
  assert.match(await ed.locator('#e-status').innerText(), /The collective is born: mid1/);
  await ed.locator('#e-to-show').waitFor();
  assert.match(await ed.locator('#e-to-show').innerText(), /this page’s memory only, never in its storage/);
  await banner(ed, 'the founded collective');
  await ed.click('[data-action=real-show-share]');
  await ed.locator('#e-share-here .words').waitFor();
  const mine = (await ed.locator('#e-share-here .words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await shot(ed, 'own-share');
  await ed.click('[data-action=real-share-written]');
  const back = ed.locator('#real-share-back');
  const pos = (await back.locator('input').evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of pos.entries()) await back.locator('input').nth(i).fill(mine[p - 1]);
  await back.getByRole('button', { name: 'Check them' }).click();
  await done(ed, '#e-status .note.done', /Share \d is written down/);
  const aw = await shareIn(ana);
  const bw = await shareIn(bo);

  // Nothing of a share in any browser's storage, read whole; the collective's file holds its signing key, never its chain key.
  const places_ = { edubba: await kept(ed), ana: await kept(ana), bo: await kept(bo) };
  for (const w of [mine, aw, bw]) {
    const v = fromWords(w);
    for (const [where, text] of Object.entries(places_)) {
      for (const f of [hex(v), Buffer.from(v).toString('base64'), w.slice(0, 6).join(' ')]) assert.ok(!text.includes(f), `a share in ${where}`);
    }
  }
  const collective = (JSON.parse(places_.edubba)['edubba/files'] as Record<string, unknown>);
  const colFile = Object.keys(collective).find((k) => k.startsWith('/edubba/real/collectives/') && k.endsWith('.json'))!;
  const col = await file<{ identity: { signingSecret: string; safety: { seeds: string } } }>(ed, colFile);
  assert.ok(col.identity.signingSecret, 'the collective’s signing key, held by its founder here');
  assert.equal(col.identity.safety.seeds, '', 'never its chain key');
  assert.ok(!places_.ana.includes(nobody.f.signingSecret) && !places_.bo.includes(nobody.f.signingSecret), 'the founder’s key in no member’s browser');

  // The collective's page: what its agreement lets you do; a release said to be made on a computer; no money drafts.
  await ed.locator('#e-may').waitFor({ timeout: 60_000 });
  assert.match(await ed.locator('#e-real-release').innerText(), /made in Ummia/);
  assert.ok((await ed.locator('#e-real-release').innerText()).includes(RELEASE_ON_WEB));
  assert.equal(await ed.locator('#real-release, [data-action=pick-folder], [data-anchorable]').count(), 0);
  assert.equal(await ed.locator('#e-posts [data-action=correct], #e-posts details.correct').count(), 0, 'a real collective posts nothing from here, so nothing to correct');
  await shot(ed, 'collective');

  // A member change: Cy joins. Every member whose voice remains signs, and Cy, each in Dub on the web; then it waits for Kišib.
  await ed.click('#e-real-change > summary');
  // The same grid, filled from the agreement in force: its areas, the Money area's cap.
  const cg = ed.locator('#e-grid-real-change table.grid');
  await cg.waitFor({ timeout: 60_000 });
  assert.equal(await cg.locator('input.areaname').nth(1).inputValue(), 'Money');
  assert.equal(await cg.locator('input[data-grid-cap]').first().inputValue(), '10000');
  await ed.check(`#real-change input[name=member][value="${cyId}"]`);
  await cg.locator('thead th[scope=col]', { hasText: 'Cy' }).waitFor({ timeout: 10_000 });
  await ed.click('#real-change button[type=submit]');
  await ed.locator('#e-real-review #reading').waitFor({ timeout: 60_000 });
  await banner(ed, 'the member change review');
  await shot(ed, 'change-review');
  await ed.click('#e-real-review [data-action=confirm]');
  await done(ed, '#e-status .note.done', /proposed/);
  await signIn(ana, /Change a collective’s agreement/, true);
  await signIn(bo, /Change a collective’s agreement/, true);
  await signingOn(cy);
  await signIn(cy, /Change a collective’s agreement/);
  await ed.locator('.proposal-status', { hasText: '4 of 4 signed' }).waitFor({ timeout: 120_000 });
  await done(ed, '.proposal-status .note.warn', 'that is Kišib’s work');
  await shot(ed, 'change-waits-for-kishib');
  await ed.setViewportSize({ width: 390, height: 844 });
  await narrow(ed, 'a real collective’s page');
  await shot(ed, 'collective-phone');
  await ed.setViewportSize({ width: 900, height: 1000 });

  // A collective brought by its ID, read only, in another browser where a member is brought.
  const other = await pageOf(edubbaBase);
  await other.locator('h1.mark', { hasText: 'Edubba' }).waitFor({ timeout: 60_000 });
  await places(other);
  await bringIn(other, 'Nobody, allegedly', nobody);
  await other.click('[data-action=tab][data-tab=collectives]');
  await other.click('.entry.add[data-id=bring]');
  await other.fill('#bring-collective input[name=id]', shownId(colFile.slice(-69, -5)));
  await other.fill('#bring-collective input[name=name]', 'The tablet house');
  await other.click('#bring-collective button[type=submit]');
  await done(other, '#e-status .note.done', /brought|here/i);
  await other.locator('.entry', { hasText: 'brought here · no key held' }).waitFor({ timeout: 60_000 });
  await other.locator('#e-may').waitFor({ timeout: 60_000 });
  await banner(other, 'a brought collective');
  await shot(other, 'brought');
  assert.deepEqual(problems, []);
});
