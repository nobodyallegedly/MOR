// Edubba's web client (testing only) in headless Chromium, by clicks and
// typing alone, as people on several devices: the founder in Edubba's web
// client, each member made in Dub's web client and signing in an Edubba web
// client of its own (Dub's Signing tab removed, decided 21 October 2026),
// each in its own browser profile,
// both clients built as released and served with their headers. Real homes
// and a relay on local ports; nothing simulated.
//
// The banner on every screen; no Agents tab, nothing of Claude's, no test
// collective, no folder; an identity brought by its ID (written for people)
// and its words; one tab at a time; a real collective founded with members
// signing in their own Edubba on the web, the shares dealt, nothing of a share
// kept in any browser; a member change signed there, then waiting for Kišib;
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
import { shortForm } from '../../kit/src/html.ts';

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

const done = async (page: Page, sel: string, words: string | RegExp) => {
  await page.locator(sel, { hasText: words }).first().waitFor({ timeout: 90_000 });
  // Read, then closed, as a person does, so it covers nothing.
  if (sel.startsWith('#e-status') && (await page.locator('#e-status [data-action=status-close]').count())) await page.click('#e-status [data-action=status-close]');
};

/** The banner, whole, on the screen now. */
async function banner(page: Page, where: string) {
  const b = page.locator('#for-testing-only');
  assert.ok(await b.isVisible(), `the banner on ${where}`);
  // One line with its "?" (the kit's disclaimers); the risks, whole, behind it.
  assert.match(await b.innerText(), /^For testing only\./);
  assert.match((await b.textContent()) ?? '', /For testing only[\s\S]*signing key[\s\S]*storage[\s\S]*chain key[\s\S]*memory/);
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

/** Bring an identity into Edubba's web client by its ID written for people and its words, by clicks: + Add › Bring one (or the first screen's), its homes and relays first where none are set. */
async function bringIn(ed: Page, name: string, g: TestIdentity | { id: string; words: string }, wrong = false) {
  if (await ed.locator('[data-add=bring]').count()) await ed.click('[data-add=bring]');
  else {
    await ed.click('[data-k-open=identity]');
    await ed.click('.k-panel [data-k-add=toggle]');
    await ed.click('.k-panel [data-k-add=bring]');
  }
  const m = ed.locator('.k-modal');
  if (await m.locator('#desk-settings').count()) {
    await m.locator('#desk-settings textarea[name=homes]').fill(homes.map((h) => h.base).join('\n'));
    await m.locator('#desk-settings textarea[name=relays]').fill(relay.base);
    await m.locator('#desk-settings button[type=submit]').click();
    await m.locator('.k-note.k-done', { hasText: /saved/i }).waitFor({ timeout: 60_000 });
  }
  const words = 'words' in g ? g.words : toWords(unhex(g.f.signingSecret)).join(' ');
  await m.locator('#bring-identity input[name=name]').fill(name);
  await m.locator('#bring-identity input[name=id]').fill('words' in g ? g.id : shownId(g.id));
  await m.locator('#bring-identity textarea[name=words]').fill(wrong ? toWords(crypto.getRandomValues(new Uint8Array(32))).join(' ') : words);
  await m.locator('#bring-identity button[type=submit]').click();
  if (wrong) return void (await m.locator('.k-note.k-error', { hasText: /do not give this identity’s current signing key/ }).waitFor({ timeout: 60_000 }));
  await done(ed, '#e-status .k-note.k-done', `“${name}” is here`);
}

/** A tile, from the tiles or the tabs. */
async function tile(ed: Page, key: string) {
  if (await ed.locator(`[data-k-tile=${key}]`).count()) await ed.click(`[data-k-tile=${key}]`);
  else await ed.click(`.k-top [data-tab=${key}]`);
}

/** A part of the column open now. */
const part = (ed: Page, label: string | RegExp) => ed.locator('.k-col button', { hasText: label }).first().click();

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
  await done(page, '#status .k-note.k-done', 'The identity is born');
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

/**
 * A member's Edubba, by its Dub page (Dub's Signing tab removed, decided 21
 * October 2026: members sign in Edubba, Collectives › To sign).
 */
const edubbaOf = new Map<Page, Page>();

/**
 * Carry a member from Dub on the web into an Edubba on the web of its own
 * browser, by clicks: its ID and signing key's words read in Dub's identity
 * menu, brought into Edubba, which then acts as it.
 */
async function signingOn(dub: Page, name: string) {
  await dub.locator('[data-k-open="identity"]').click();
  await dub.locator('[data-k-idmenu]').first().click();
  await dub.getByRole('menuitem', { name: /^Words/ }).click();
  await dub.locator('#carry-words').waitFor({ timeout: 60_000 });
  const words = (await dub.locator('#carry-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  const id = (await dub.locator('.k-mbody .k-mono').innerText()).replace(/\s+/g, '');
  await dub.locator('[data-k-popup="close"]').click();
  const ed = await pageOf(edubbaBase);
  await ed.locator('.edubba-first, .k-top').first().waitFor({ timeout: 60_000 });
  await bringIn(ed, name, { id, words: words.join(' ') });
  edubbaOf.set(dub, ed);
}

/** Collectives › To sign, in a member's Edubba, read again. */
async function toSign(ed: Page, reload: boolean) {
  if (reload) await ed.reload();
  await ed.locator('.k-top').waitFor({ timeout: 60_000 });
  if (!(await ed.locator('#e-signing').isVisible())) {
    await tile(ed, 'collectives');
    await part(ed, 'To sign');
  }
  await ed.locator('[data-action=member-look]').click({ timeout: 90_000 });
}

/** In a member's Edubba: sign the proposal whose title says `what`. */
async function signIn(dub: Page, what: RegExp, reload = false) {
  const ed = edubbaOf.get(dub)!;
  await toSign(ed, reload);
  const card = ed.locator('#e-signing .proposal', { has: ed.locator('h3', { hasText: what }) }).first();
  await card.waitFor({ timeout: 90_000 });
  await card.getByRole('button', { name: 'Sign it' }).click();
  await done(ed, '#e-status .k-note.k-done', 'Signed');
}

/** In a member's Edubba: show its share once, hide it, type three words back; its words. */
async function shareIn(dub: Page): Promise<string[]> {
  const ed = edubbaOf.get(dub)!;
  await toSign(ed, false);
  await ed.locator('#e-signing [data-action=share]').first().waitFor({ timeout: 90_000 });
  await ed.locator('#e-signing [data-action=share]').first().click();
  await ed.locator('#share-words').waitFor({ timeout: 60_000 });
  const words = (await ed.locator('#share-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await ed.getByRole('button', { name: /I have written share \d+ and its 24 words down/ }).click();
  const form = ed.locator('#e-signing form.share-back');
  const inputs = form.locator('input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(words[p - 1]);
  await form.getByRole('button', { name: 'Check them' }).click();
  await done(ed, '#e-status .k-note.k-done', 'The share is written down');
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

test('the banner on every screen; three tiles, no Agents and nothing of Claude’s; an identity brought by its ID written for people; one tab at a time', async () => {
  const ed = await pageOf(edubbaBase);
  await ed.locator('h2', { hasText: 'First, an identity' }).waitFor({ timeout: 60_000 });
  // The banner is in the page's HTML itself, so it shows even before the script runs.
  assert.ok(readFileSync(join(deskDir, 'static/web.html'), 'utf8').includes('<!-- edubba banner -->'));
  await banner(ed, 'the first screen');
  // No identity is made here: Make one and Use one from Kišib are not offered on the web.
  assert.ok(await ed.locator('[data-add=make]').isDisabled());
  assert.ok(await ed.locator('[data-add=kishib]').isDisabled());
  assert.equal(await ed.locator('input[name=linked]').count(), 0, 'nothing of Claude’s');
  await shot(ed, 'first');

  const ada = await elsewhere();
  // Wrong words: refused, nothing kept; then the right ones.
  await bringIn(ed, 'Ada', ada, true);
  await banner(ed, 'a refusal');
  await ed.locator('.k-modal #bring-identity textarea[name=words]').fill(toWords(unhex(ada.f.signingSecret)).join(' '));
  await ed.locator('.k-modal #bring-identity button[type=submit]').click();
  await done(ed, '#e-status .k-note.k-done', '“Ada” is here');
  assert.ok(!/Claude/.test(await ed.locator('#e-status').innerText()), 'nothing said of Claude');
  // Three tiles on the web (decided: "4 tiles but only 3 on web"), their danger marks as drawn.
  const tiles = await ed.locator('.k-tile').evaluateAll((ts) => ts.map((t) => [t.querySelector('h2')!.textContent, t.querySelector('.k-dm')!.className]));
  assert.deepEqual(tiles, [
    ['Collectives', 'k-dm k-l3'],
    ['Publishing', 'k-dm k-l2'],
    ['Vows', 'k-dm k-l2'],
  ]);
  assert.equal(await ed.locator('[data-k-tile=agents], [data-tab=agents]').count(), 0);
  // The forms written for people (F349): the identity top right by its ID written for people.
  assert.equal(await ed.locator('.k-me .k-s').innerText(), shortForm(shownId(ada.id)));
  await banner(ed, 'the tiles');
  await shot(ed, 'home');
  // The panel's foot: homes and relays only on the web.
  await ed.click('[data-k-open=identity]');
  await ed.click('.k-panel [data-action=this-app]');
  await ed.locator('.k-modal #desk-settings').waitFor();
  assert.equal(await ed.locator('.k-modal textarea[name=via], .k-modal input[name=drafts], .k-modal [data-collective-root], .k-modal [data-action=code]').count(), 0, 'homes and relays only');
  await shot(ed, 'this-app');
  await ed.click('.k-modal [data-k-popup=close]');

  // Kept: a reload finds it, read from this browser's storage.
  await ed.reload();
  await ed.locator('.k-tile').first().waitFor({ timeout: 60_000 });
  const stored = await kept(ed);
  assert.ok(stored.includes(ada.f.signingSecret), 'the signing key is kept in this browser’s storage, as the banner says');
  assert.ok(!stored.includes(ada.f.safety.seeds), 'never its chain key');

  // Collectives: no test collective; Publishing: a protected file.
  await tile(ed, 'collectives');
  await ed.locator('.k-col button', { hasText: '+ Found a collective' }).waitFor();
  assert.equal(await ed.locator('.k-col button', { hasText: '+ Found a test collective' }).count(), 0, 'no test collective on the web');
  await ed.locator('.k-col button', { hasText: '+ Bring a collective' }).waitFor();
  await tile(ed, 'publishing');
  await banner(ed, 'Publishing');
  await ed.locator('#pane h2', { hasText: 'A protected file' }).waitFor({ timeout: 60_000 });

  // At an iPhone's width, nothing scrolls sideways, on every tile.
  await ed.setViewportSize({ width: 390, height: 844 });
  for (const key of ['collectives', 'publishing', 'vows']) {
    await ed.click('[data-action=home-tiles]');
    await ed.click(`[data-k-tile=${key}]`);
    await ed.waitForTimeout(300);
    await narrow(ed, key);
  }
  await shot(ed, 'phone');
  await ed.setViewportSize({ width: 900, height: 1000 });

  // One tab at a time: a second tab of the same site says so and keeps nothing apart.
  const second = await pageOf(edubbaBase, ed.context());
  await done(second, '.k-note.k-error', /open in another tab of this browser/);
  await banner(second, 'the second tab');
  await second.close();
  assert.deepEqual(problems, []);
});

test('a real collective founded in the web client, its members made in Dub on the web and signing in their own Edubba; the shares dealt and kept nowhere; its tabs; a member change; a collective brought read only', async () => {
  const nobody = await elsewhere();
  const ana = await pageOf(dubBase);
  const anaId = await makeIn(ana);
  const bo = await pageOf(dubBase);
  const boId = await makeIn(bo);
  const cy = await pageOf(dubBase);
  const cyId = await makeIn(cy);

  const ed = await pageOf(edubbaBase);
  await ed.locator('.edubba-first').waitFor({ timeout: 60_000 });
  await bringIn(ed, 'Nobody, allegedly', nobody);

  // Contacts, by the IDs written for people, then the founding, read back in plain words, signed.
  await tile(ed, 'collectives');
  await part(ed, '+ Found a collective');
  await banner(ed, 'the founding form');
  assert.match(await ed.locator('#pane').innerText(), /This is a web page/);
  // H100, H109: contacts are the one list, top left, sealed to the identity in use; each added by its ID with a nickname.
  for (const [id, name] of [[anaId, 'Ana'], [boId, 'Bo'], [cyId, 'Cy']]) {
    await ed.click('[data-k-open="contacts"]');
    const panel = ed.locator('.k-panel[data-k-panel="contacts"]');
    await panel.locator('input[name=contact-id]').fill(shownId(id));
    await panel.locator('input[name=contact-nick]').fill(name);
    await panel.getByRole('button', { name: 'Add to contacts' }).click();
    await ed.locator(`.k-panel[data-k-panel="contacts"] [data-k-contact="${id}"]`, { hasText: name }).waitFor({ timeout: 60_000 });
    // What was said, top centre, closed first: it lies over the panel's ×.
    await ed.locator('#e-status [data-action=status-close]').click();
    await ed.locator('.k-panel[data-k-panel="contacts"] [data-k-close]').click();
    await ed.locator(`#real-found input[name=member][value="${id}"]`).waitFor({ timeout: 30_000 });
  }
  await ed.fill('#real-found input[name=name]', 'The tablet house');
  for (const id of [anaId, boId]) await ed.check(`#real-found input[name=member][value="${id}"]`);
  // Round 3: the grid. Members are its columns, the founder first; three bands, the constitution first.
  const grid = ed.locator('#e-grid-real-found table.grid');
  await grid.waitFor({ timeout: 30_000 });
  assert.deepEqual((await grid.locator('thead th[scope=col]').allInnerTexts()).length, 3, 'one column per member');
  assert.deepEqual((await grid.locator('tr.band th').allTextContents()).map((x) => x.trim()), ['The constitution', 'The judges', 'The areas: operations']);
  await ed.click('[data-grid-add=real-found]');
  const money = grid.locator('tr[data-area="1"]');
  await money.locator('input.areaname').fill('Money');
  await money.locator('select[data-grid-layer]').selectOption('2');
  for (const id of [nobody.id, anaId]) await grid.locator(`tr[data-area="1"] button[data-grid-cell="area:1"][data-m="${id}"]`).click();
  await grid.locator('tr[data-area="1"] input[data-grid-cap]').fill('10000');
  await grid.locator('tr[data-area="1"] input[data-grid-cap]').press('Tab');
  await grid.locator('tr[data-area="1"] td.say', { hasText: 'above 10,000, 2 keys' }).waitFor({ timeout: 10_000 });
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
  assert.match(await ed.locator('#e-real-review').innerText(), /“Money”: all money \(the Money layer\)\. Any one of [\s\S]*above 10,000 regtest satoshis an act, 2 keys/);
  await ed.click('#e-real-review [data-action=confirm]');
  await done(ed, '#e-status .k-note.k-done', 'The founding of “The tablet house” is proposed');

  // Each member reads it in plain words in its own Edubba on the web, and signs.
  await signingOn(ana, 'Ana');
  await signIn(ana, /Found a collective/);
  await signingOn(bo, 'Bo');
  await signIn(bo, /Found a collective/);

  // The founding in progress, its count in the column; founding refused until what this device holds is read; then dealt.
  await ed.locator('.proposal-status', { hasText: '3 of 3 signed' }).waitFor({ timeout: 90_000 });
  await ed.locator('.k-col button', { hasText: '3 of 3 signed' }).waitFor({ timeout: 30_000 });
  await ed.click('[data-action=real-found]');
  await done(ed, '#e-status .k-note', 'Read what this device will hold while founding');
  await ed.check('input[id^=real-found-read-]');
  await ed.click('[data-action=real-found]');
  await done(ed, '#e-status .k-note.k-done', '“The tablet house” is founded');
  await ed.locator('#e-to-show').waitFor({ timeout: 60_000 });
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
  await done(ed, '#e-status .k-note.k-done', /Share \d is written down/);
  const aw = await shareIn(ana);
  const bw = await shareIn(bo);

  // Nothing of a share in any browser's storage, read whole; the collective's file holds its signing key, never its chain key.
  const places_ = { edubba: await kept(ed), ana: await kept(ana), bo: await kept(bo), anaEdubba: await kept(edubbaOf.get(ana)!), boEdubba: await kept(edubbaOf.get(bo)!) };
  for (const w of [mine, aw, bw]) {
    const v = fromWords(w);
    for (const [where, text] of Object.entries(places_)) {
      for (const f of [hex(v), Buffer.from(v).toString('base64'), w.slice(0, 6).join(' ')]) assert.ok(!text.includes(f), `a share in ${where}`);
    }
  }
  const collective = JSON.parse(places_.edubba)['edubba/files'] as Record<string, unknown>;
  const colFile = Object.keys(collective).find((k) => k.startsWith('/edubba/real/collectives/') && k.endsWith('.json'))!;
  const col = await file<{ identity: { signingSecret: string; safety: { seeds: string } } }>(ed, colFile);
  assert.ok(col.identity.signingSecret, 'the collective’s signing key, held by its founder here');
  assert.equal(col.identity.safety.seeds, '', 'never its chain key');

  // Its tabs (decided): Act (permissions as chips, its feed, the typing box), Members, Money, Keepers, To sign; its constitution top right.
  assert.deepEqual(await ed.locator('.edubba-tabs button').allInnerTexts(), ['Act', 'Members', 'Money', 'Keepers', 'To sign']);
  await ed.click('.edubba-tabs button:has-text("Act")');
  await ed.locator('.edubba-chips .k-chip').first().waitFor({ timeout: 60_000 });
  await ed.locator('#collective-post').waitFor();
  await shot(ed, 'collective-act');
  await ed.click('.edubba-tabs button:has-text("Keepers")');
  await ed.locator('#pane', { hasText: 'names no keepers' }).waitFor({ timeout: 60_000 });
  await ed.click('.edubba-tabs button:has-text("Money")');
  await ed.locator('#pane', { hasText: 'A collective’s releases are made in Ummia' }).waitFor({ timeout: 60_000 });
  assert.equal(await ed.locator('#real-release, [data-action=pick-folder], [data-anchorable]').count(), 0, 'no release from a folder and no money drafts on the web');
  const shares = ed.locator('#real-money input[name=share]');
  assert.equal(await shares.count(), 3);
  await shares.nth(0).fill('50');
  await shares.nth(1).fill('30');
  await shares.nth(2).fill('20');
  await ed.fill('#real-money input[name=referral]', '10');
  await ed.fill('#real-money input[name=service]', cyId);
  await ed.fill('#real-money input[name=serviceKey]', '11'.repeat(32));
  await ed.fill('#real-money textarea[name=keepers]', cyId);
  await ed.click('#real-money button[type=submit]');
  await ed.locator('#e-real-review #reading h2', { hasText: 'The money of “The tablet house”' }).waitFor({ timeout: 60_000 });
  const moneyRead = await ed.locator('#e-real-review').innerText();
  assert.match(moneyRead, /a referral share of 10%/);
  assert.match(moneyRead, /50%[\s\S]*30%[\s\S]*20%/);
  await shot(ed, 'money-review');
  await ed.click('#e-real-review [data-action=cancel]');
  await done(ed, '#e-status', /Nothing was signed/);

  // A member change: Cy joins. Every member whose voice remains signs, and Cy, each in their own Edubba; then it waits for Kišib.
  await ed.click('.edubba-tabs button:has-text("Members")');
  await ed.click('#e-real-change > summary');
  const cg = ed.locator('#e-grid-real-change table.grid');
  await cg.waitFor({ timeout: 60_000 });
  assert.equal(await cg.locator('input.areaname').nth(1).inputValue(), 'Money');
  assert.equal(await cg.locator('input[data-grid-cap]').first().inputValue(), '10000');
  await ed.check(`#real-change input[name=member][value="${cyId}"]`);
  await cg.locator('thead th[scope=col]', { hasText: 'Cy' }).waitFor({ timeout: 10_000 });
  await ed.click('#real-change button[type=submit]');
  await ed.locator('#e-real-review #reading').waitFor({ timeout: 60_000 });
  await ed.click('#e-real-review [data-action=confirm]');
  await done(ed, '#e-status .k-note.k-done', /proposed/);
  await signIn(ana, /Change a collective’s agreement/, true);
  await signIn(bo, /Change a collective’s agreement/, true);
  await signingOn(cy, 'Cy');
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
  await other.locator('.edubba-first').waitFor({ timeout: 60_000 });
  await bringIn(other, 'Nobody, allegedly', nobody);
  await tile(other, 'collectives');
  await part(other, '+ Bring a collective');
  await other.fill('#bring-collective input[name=id]', shownId(colFile.slice(-69, -5)));
  await other.fill('#bring-collective input[name=name]', 'The tablet house');
  await other.click('#bring-collective button[type=submit]');
  await done(other, '#e-status .k-note.k-done', /brought|here/i);
  await other.locator('.edubba-head', { hasText: 'brought here · no key held' }).waitFor({ timeout: 60_000 });
  await other.locator('.edubba-chips .k-chip').first().waitFor({ timeout: 60_000 });
  assert.equal(await other.locator('#collective-post').count(), 0, 'nothing signed for it from here');
  await banner(other, 'a brought collective');
  await shot(other, 'brought');
  assert.deepEqual(problems, []);
});

test('Publishing and Vows in the web client by clicks: who acts; a protected text and picture read back and signed; a vow; Track; both seen sealed and for sale in Dub on the web', async () => {
  const ed = await pageOf(edubbaBase);
  await ed.locator('.edubba-first').waitFor({ timeout: 60_000 });
  const seller = await elsewhere();
  await bringIn(ed, 'The seller', seller);
  await tile(ed, 'publishing');
  await ed.locator('[data-actor].k-chip.k-on').waitFor({ timeout: 60_000 });
  await banner(ed, 'Publishing');
  assert.equal(await ed.locator('[data-actor].k-on').getAttribute('data-actor'), seller.id, 'acting as the identity in use');
  assert.match((await ed.locator('#pane .k-say').first().textContent()) ?? '', /A text, a JPEG picture, an MP4 film or an M4A recording/);
  await shot(ed, 'publishing');

  // A text, read back, then signed.
  await ed.fill('#pub-work textarea[name=text]', 'Three verses, sealed.');
  await ed.fill('#pub-work input[name=title]', 'Verses, sealed');
  await ed.fill('#pub-work input[name=price]', '1500');
  await ed.click('#pub-work button[type=submit]');
  await ed.locator('#e-pub-review #reading').waitFor({ timeout: 60_000 });
  assert.match(await ed.locator('#e-pub-review').innerText(), /lone seller’s: itself the agreement between you and each buyer/);
  await ed.click('#e-pub-review [data-action=confirm]');
  await done(ed, '#e-status .k-note.k-done', 'Published, sealed');
  await ed.locator('#here-feed .k-act', { hasText: 'Verses, sealed' }).waitFor({ timeout: 60_000 });

  // A picture, chosen as a file: stripped to the picture alone, read back, signed.
  const jpeg = readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));
  await part(ed, 'A protected file');
  await ed.click('button[data-media=picture]');
  await ed.locator('#pub-work[data-media=picture]').waitFor();
  await ed.setInputFiles('#pub-work input[name=file]', { name: 'tablet.jpg', mimeType: 'image/jpeg', buffer: jpeg });
  await ed.fill('#pub-work input[name=title]', 'A tablet, photographed');
  await ed.fill('#pub-work input[name=price]', '2000');
  await ed.click('#pub-work button[type=submit]');
  await done(ed, '#e-pub-review #reading', /stripped to the picture alone/);
  await ed.click('#e-pub-review [data-action=confirm]');
  await done(ed, '#e-status .k-note.k-done', 'Published, sealed');

  // A vow, read back, signed; Track points at the seller by default, at Edubba's own relays.
  await tile(ed, 'vows');
  await part(ed, 'A new vow');
  await ed.fill('#pub-vow textarea[name=words]', 'A seat at the reading of the tablets.');
  await ed.fill('#pub-vow input[name=title]', 'A seat, vowed');
  await ed.fill('#pub-vow input[name=price]', '500');
  await ed.click('#pub-vow button[type=submit]');
  await done(ed, '#e-vow-review #reading', /confirms it \(kept\) or contests it \(not kept\)/);
  await ed.click('#e-vow-review [data-action=confirm]');
  await done(ed, '#e-status .k-note.k-done', 'A vow, published');
  await part(ed, 'Track');
  await ed.locator('#track-feed .k-act', { hasText: 'A seat at the reading of the tablets.' }).waitFor({ timeout: 90_000 });
  assert.match(await ed.locator('#pane').innerText(), /nothing is indexed/);
  await shot(ed, 'vows-track');
  await ed.setViewportSize({ width: 390, height: 844 });
  await narrow(ed, 'Vows');
  await ed.setViewportSize({ width: 900, height: 1000 });

  // In Dub on the web, a reader following the seller sees the picture sealed and the vow for sale.
  const reader = await pageOf(dubBase);
  await makeIn(reader);
  await reader.locator('[data-k-open="contacts"]').click();
  await reader.locator('form#follow input[name=id]').fill(shownId(seller.id));
  await reader.locator('form#follow').getByRole('button', { name: 'Add to contacts' }).click();
  await done(reader, '#status .k-note.k-done', 'Added to contacts');
  await reader.keyboard.press('Escape');
  await reader.locator('#feed .k-act .k-kind', { hasText: 'sealed picture' }).waitFor({ timeout: 90_000 });
  const vow = reader.locator('#feed .k-act', { hasText: 'A seat at the reading of the tablets.' });
  await vow.waitFor({ timeout: 90_000 });
  await vow.locator('.k-actid').click();
  assert.ok(await reader.getByRole('menuitem', { name: 'Buy', exact: true }).isVisible(), 'the vow can be bought, from its menu');
  await reader.keyboard.press('Escape');
  assert.equal(await reader.locator('#feed .k-act .dub-sealed img').count(), 0, 'nothing of the picture shown before it is bought');
  await shot(reader, 'dub-sealed-and-vow');
  assert.deepEqual(problems, []);
});
