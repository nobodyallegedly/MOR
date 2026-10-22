// Kišib in a real browser (headless Chromium, fresh profiles), by clicks and
// typing alone, against real homes and a relay on local ports:
//
// - its web client, built as released and served with its headers: the
//   banner on every screen; a personal rotation of an identity made in
//   Dub's web client (in its own page), brought into Dub on the Mac and into
//   Edubba, keeping the three lines; stalled, sent again with the same
//   bytes; the new words shown once, hidden, three typed back; checking
//   paper words; the record; the escape and the succession forms;
// - the program's own page on the Mac, paired: a collective rotation from
//   two of three paper shares, the founder in the program's page (F337's
//   screen read and ticked first), a member giving their share in the web
//   client's page;
// - nothing kept: the web client's storage read whole (IndexedDB, local and
//   session storage, caches, cookies) holds nothing at all, and the
//   program's folder holds no word.
//
// `MOR_SCREENSHOTS=DIR` keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { describeAct } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { post as barebonePost } from '../../barebone/src/post.ts';
import { fromWords, toWords } from '../../../modules/carry/src/carry.ts';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { changeKeys, closeAll, dub, dubBringing, edubba, everything, forms, founded, kishib, receiveShare, standing, start, type Relay } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
};
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `kishib-${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
/** A home for the escape to go to, known to the page's policy from the start. */
let spare: Relay;
const sites: Server[] = [];
let kishibWeb: string;
let dubWeb: string;
let browser: Browser;
const csp: string[] = [];
const problems: string[] = [];

/** Serve a built folder with the web client's headers. */
async function serveBuilt(dist: string, policy: string): Promise<string> {
  const site = createServer((req, res) => {
    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    if (req.method === 'POST' && path === '/csp') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        csp.push(body);
        res.end();
      });
      return;
    }
    try {
      if (!/^[a-z0-9_.-]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name)] ?? 'application/octet-stream', 'content-security-policy': `${policy}; report-uri /csp`, 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  sites.push(site);
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${(site.address() as { port: number }).port}`;
}

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
  spare = await start('home');
  const policy = contentSecurityPolicy([...homes, relay, spare].map((r) => r.base));
  const k = mkdtempSync(join(tmpdir(), 'kishib-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', k], { cwd: here, stdio: 'ignore' });
  const d = mkdtempSync(join(tmpdir(), 'kishib-dubweb-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', d], { cwd: join(here, '../dub'), stdio: 'ignore' });
  kishibWeb = await serveBuilt(k, policy);
  dubWeb = await serveBuilt(d, policy);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const s of sites) await new Promise((r) => s.close(r));
  for (const r of [...(homes ?? []), relay, spare]) await r?.stop();
});

async function open(url: string): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 760, height: 900 } });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  return { context, page };
}

const banner = async (page: Page, where: string) => {
  const b = page.locator('#for-testing-only');
  assert.ok(await b.isVisible(), `the banner on ${where}`);
  const t = await b.innerText();
  assert.match(t, /^For testing only\./, where);
  assert.match(t, /The words you type here are your chain key: whoever serves this page’s code at that moment could copy them/, where);
  assert.match(t, /Kišib keeps nothing in this browser’s storage; but nothing can prove a device forgot what it held\./, where);
};

/** Everything this site keeps in the browser: IndexedDB, local and session storage, caches, cookies. */
async function kept(page: Page): Promise<{ text: string; empty: boolean }> {
  const dump = await page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    return { local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie, caches: await caches.keys(), indexedDB: dbs.map((d) => d.name) };
  });
  const empty = !Object.keys(dump.local).length && !Object.keys(dump.session).length && !dump.cookies && !dump.caches.length && !dump.indexedDB.length;
  return { text: JSON.stringify(dump), empty };
}

/** Wait for a heading, or fail at once with what the page said. */
async function heading(page: Page, name: RegExp) {
  const err = page.locator('#status .note.error');
  await Promise.race([page.getByRole('heading', { name }).waitFor({ timeout: 60_000 }), err.waitFor({ timeout: 60_000 }).then(async () => assert.fail(await err.innerText()))]);
}

/** Wait for a button, or fail at once with what the page said. */
async function button(page: Page, name: string) {
  const err = page.locator('#status .note.error');
  try {
    await Promise.race([page.getByRole('button', { name }).waitFor({ timeout: 60_000 }), err.waitFor({ timeout: 60_000 }).then(async () => assert.fail(await err.innerText()))]);
  } catch (e) {
    await shot(page, 'failed');
    throw e;
  }
}

/** Wait until the page's request is answered: its buttons enabled again. */
const settled = (page: Page) => page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled && !b.closest('[data-blocked]')), undefined, { timeout: 60_000 });

const door = (page: Page, name: string) => page.locator('button.door', { hasText: name }).click();
const fill = async (page: Page, form: string, values: Record<string, string>) => {
  for (const [k, v] of Object.entries(values)) await page.locator(`${form} [name=${k}]`).fill(v);
};

/** The words on screen, as shown. */
const shownWords = async (page: Page) => (await page.locator('#words').waitFor(), await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\s*/, '').trim());

async function typeBack(page: Page, words: string[]) {
  await page.locator('form#typed').waitFor();
  const inputs = page.locator('form#typed input');
  const names = await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name));
  for (const [i, n] of names.entries()) await inputs.nth(i).fill(words[Number(n.slice(1)) - 1]);
  await page.getByRole('button', { name: 'Check' }).click();
}

const CHAIN_BUTTON = 'Show the new chain key’s words (a new paper)';

/**
 * A change of keys signed by clicks (H79): the new chain key's words first, written, three typed back, before
 * anything is signed; then, once the homes' receipts are in, the new signing key's.
 */
async function bothWords(page: Page): Promise<{ chain: string[]; signing: string[] }> {
  await page.getByRole('button', { name: CHAIN_BUTTON }).waitFor({ timeout: 60_000 });
  await page.getByRole('button', { name: CHAIN_BUTTON }).click();
  await page.getByRole('heading', { name: 'The new chain key’s words: a new paper' }).waitFor();
  const chain = await shownWords(page);
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await typeBack(page, chain);
  await page.getByRole('button', { name: 'Show the new signing key’s words' }).waitFor({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Show the new signing key’s words' }).click();
  const signing = await shownWords(page);
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await typeBack(page, signing);
  return { chain, signing };
}

test('the web client: a personal rotation of an identity made in Dub’s web client, keeping the lines of Dub’s web client, Dub on the Mac and Edubba; stalled and sent again with the same bytes; the new words once; nothing kept', async () => {
  const H = homes.map((h) => h.base);
  // An identity made in Dub's web client, by clicks, its chain key's words written down here.
  const { context: dc, page: dp } = await open(`${dubWeb}/`);
  await dp.getByRole('heading', { name: 'Make a new identity' }).waitFor({ timeout: 60_000 });
  await dp.locator('form#begin textarea[name=homes]').fill(H.join('\n'));
  await dp.locator('form#begin textarea[name=relays]').fill(relay.base);
  await dp.locator('form#begin').getByRole('button', { name: 'Make it' }).click();
  await dp.locator('#words').waitFor({ timeout: 60_000 });
  const chain = (await dp.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await dp.getByRole('button', { name: 'I have written them down' }).click();
  const di = dp.locator('form#confirm input');
  const pos = (await di.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of pos.entries()) await di.nth(i).fill(chain[p - 1]);
  await dp.getByRole('button', { name: 'Go on' }).click();
  await dp.locator('#status .k-note.k-done', { hasText: 'The identity is born' }).waitFor({ timeout: 60_000 });
  await dp.locator('form#post textarea[name=text]').fill('From Dub’s web client, before.');
  await dp.getByRole('button', { name: 'Post', exact: true }).click();
  await dp.locator('#status .k-note.k-done', { hasText: 'Posted' }).waitFor({ timeout: 60_000 });
  const dumped = await dp.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((res, rej) => {
      const r = indexedDB.open('dub');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const st = db.transaction('keep').objectStore('keep');
    const all = await new Promise<unknown[]>((res) => {
      const r = st.getAll();
      r.onsuccess = () => res(r.result as unknown[]);
    });
    return all.find((x) => x && typeof x === 'object' && 'signingSecret' in (x as object)) as { identity: string; signingSecret: string };
  });
  const id = dumped.identity;
  const signing = toWords(Buffer.from(dumped.signingSecret, 'hex')).join(' ');
  const webPost = (await relayAt(relay.base).feed({ signer: id })).items.map((i) => (describeAct(i.item) as { id: string; type?: number }).id).at(-1)!;
  // Dub on the Mac and Edubba bring it by its signing words, each its own line.
  const mac = await dubBringing(id, signing, H[0]);
  const mp = await mac.c.ask<{ post: { id: string } }>('post', { text: 'From Dub on the Mac, before.' });
  const e = await edubba(H, [relay.base]);
  await e.c.ask('bring', { name: 'Mine', id, words: signing, address: H[0], linked: false });
  const other = TestIdentity.create({ homes: [homes[0].home] });
  await other.publishGenesis();
  await other.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const theirs = await barebonePost(other, { text: 'Someone else’s post.', relays: [relay.base] });
  const read = await e.c.ask<{ explanation: string }>('read act', { identity: id, act: theirs.id });
  const wit = await e.c.ask<{ id: string }>('witness', { identity: id, act: theirs.id, shown: read.explanation, typed: 'RELY' });

  // Kišib's web client.
  const { context, page } = await open(`${kishibWeb}/`);
  await page.locator('button.door').first().waitFor({ timeout: 60_000 });
  await banner(page, 'the first screen');
  // H35: the icons load from the page's own files, as images, within its content security policy.
  const iconSizes = await page.evaluate(() => Promise.all(['icon.png', 'apple-touch-icon.png'].map(async (f) => { const i = new Image(); i.src = f; await i.decode(); return [i.naturalWidth, i.naturalHeight]; })));
  assert.deepEqual(iconSizes, [[256, 256], [180, 180]]);
  assert.equal(await page.locator('link[rel=icon]').getAttribute('href'), 'icon.png');
  assert.equal(await page.locator('link[rel=apple-touch-icon]').getAttribute('href'), 'apple-touch-icon.png');
  await shot(page, '01-start');
  assert.ok((await kept(page)).empty, 'nothing kept at the start');

  // May: check paper words.
  await door(page, 'Check paper words');
  await banner(page, 'checking words');
  await fill(page, '#form-check', { id, address: H[0], words: chain.join(' ') });
  await shot(page, '02-check-form');
  await page.getByRole('button', { name: 'Check them' }).click();
  await page.locator('#status', { hasText: 'These are the right words' }).waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('#form-check textarea[name=words]').inputValue(), '', 'the words are cleared from the form once used');
  await shot(page, '03-check-result');
  // May: the record.
  await page.locator('[data-action=home]').first().click();
  await door(page, 'Show an identity’s record');
  await fill(page, '#form-record', { id, address: H[0] });
  await page.getByRole('button', { name: 'Read it' }).click();
  await page.locator('#status', { hasText: 'Its lines of acts' }).waitFor({ timeout: 60_000 });
  await shot(page, '04-record');

  // The rotation: read back in full, three lines kept.
  await page.locator('[data-action=home]').first().click();
  await door(page, 'Change an identity’s keys');
  await banner(page, 'the rotation form');
  await fill(page, '#form-rotate', { id, address: H[0], words: chain.join(' ') });
  await shot(page, '05-rotate-form');
  await page.getByRole('button', { name: 'Read it back' }).click();
  await page.getByRole('heading', { name: /Change the keys of/ }).waitFor({ timeout: 60_000 });
  await banner(page, 'the review');
  const reviewText = await page.locator('.review').innerText();
  assert.equal((reviewText.match(/Kept\./g) ?? []).length, 3, reviewText);
  assert.match(await page.locator('.signs').innerText(), /one rotation .* \(key 0\)/);
  await shot(page, '06-rotate-review');

  // H79: confirmed, nothing is signed yet: the new chain key's words first, a new paper, written and three typed back.
  await page.getByRole('button', { name: 'Sign it' }).click();
  await page.getByRole('heading', { name: /first, the new paper/ }).waitFor({ timeout: 60_000 });
  assert.match(await page.locator('.review').innerText(), /Nothing is signed yet[\s\S]*until then the old paper still works, but only to send this same change again/);
  assert.equal((await relayAt(homes[0].base).identity(id)).chain.length, 1, 'nothing signed before the new paper is written');
  await page.getByRole('button', { name: CHAIN_BUTTON }).click();
  await page.locator('#words').waitFor();
  await banner(page, 'the new chain words');
  assert.match(await page.locator('body').innerText(), /closed before the change is sent, nothing was signed/);
  const newChain = await shownWords(page);
  assert.equal(newChain.length, 24);
  await shot(page, '06b-new-chain-words');
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await page.locator('form#typed').waitFor();
  assert.equal(await page.locator('#words').count(), 0, 'hidden before three are asked');
  // Stalled: two of three homes away, as the change is signed and sent.
  await homes[1].stop();
  await homes[2].stop();
  try {
    await typeBack(page, newChain);
    await page.getByRole('heading', { name: /The rotation of/ }).waitFor({ timeout: 60_000 });
    await page.locator('.review', { hasText: 'does not count yet' }).waitFor({ timeout: 60_000 });
    await banner(page, 'waiting for the homes');
    await shot(page, '07-stalled');
    await page.getByRole('button', { name: 'Send it again (the same bytes)' }).click();
    await settled(page);
    await page.locator('.review', { hasText: 'does not count yet' }).waitFor({ timeout: 60_000 });
  } finally {
    await homes[1].start();
    await homes[2].start();
  }
  await page.getByRole('button', { name: 'Send it again (the same bytes)' }).click();
  await settled(page);
  await page.getByRole('button', { name: 'Show the new signing key’s words' }).waitFor({ timeout: 60_000 });
  await shot(page, '08-counts');
  for (const h of homes) assert.equal((await relayAt(h.base).identity(id)).chain.length, 2, 'one rotation at every home');
  // Then, once it counts, the new signing key's.
  await page.getByRole('button', { name: 'Show the new signing key’s words' }).click();
  await page.locator('#words').waitFor();
  await banner(page, 'the new words');
  const fresh = await shownWords(page);
  assert.equal(fresh.length, 24);
  await shot(page, '09-new-words');
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await page.locator('form#typed').waitFor();
  assert.equal(await page.locator('#words').count(), 0, 'hidden before three are asked');
  await shot(page, '10-three-back');
  await typeBack(page, fresh);
  await page.locator('.review', { hasText: 'forgotten here' }).waitFor({ timeout: 60_000 });
  await banner(page, 'the end');
  await shot(page, '11-done');

  // Every earlier act valid: the three lines kept. Dub on the Mac takes the new words.
  for (const [act, by] of [[webPost, id], [mp.post.id, id], [wit.id, id]] as const) assert.equal(await standing(act, by, [relay.base, ...H]), 'valid', act);
  await mac.c.ask('renew', { words: fresh.join(' ') });
  assert.equal(await standing((await mac.c.ask<{ post: { id: string } }>('post', { text: 'After.' })).post.id, id, [relay.base, ...H]), 'valid');

  // Nothing kept: the browser's storage is empty, the page holds no word.
  const k = await kept(page);
  assert.ok(k.empty, k.text);
  for (const ws of [chain, newChain, fresh]) for (const f of forms(ws, fromWords(ws))) assert.ok(!(await page.content()).includes(f));
  // The old paper is spent: said, by clicks; the new paper is the right one.
  await page.getByRole('button', { name: 'Done: back to the start' }).click();
  await door(page, 'Check paper words');
  await fill(page, '#form-check', { id, address: H[0], words: chain.join(' ') });
  await page.getByRole('button', { name: 'Check them' }).click();
  await page.locator('.review', { hasText: 'These words are spent' }).waitFor({ timeout: 60_000 });
  await fill(page, '#form-check', { id, address: H[0], words: newChain.join(' ') });
  await page.getByRole('button', { name: 'Check them' }).click();
  await page.locator('.review', { hasText: 'These are the right words' }).waitFor({ timeout: 60_000 });
  assert.ok((await kept(page)).empty);
  await page.locator('[data-action=home]').first().click();
  await page.locator('button.door').first().waitFor();
  await context.close();
  await dc.close();
  assert.deepEqual(problems, []);
  assert.deepEqual(csp, []);
});

test('the escape and the succession, by clicks in the web client', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const b = await dub([H[1]], [relay.base]);
  const own = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const { context, page } = await open(`${kishibWeb}/`);
  await page.locator('button.door').first().waitFor({ timeout: 60_000 });

  // Name a successor (the identity, with its chain words), then confirm (the successor, with its signing words).
  await door(page, 'Name or confirm a successor');
  await banner(page, 'succession');
  await shot(page, '20-succession-forms');
  await fill(page, '#form-rotate', { id: a.id, address: H[0], words: a.chainWords.join(' '), successor: b.id });
  await page.locator('#form-rotate').getByRole('button', { name: 'Read it back' }).click();
  await page.getByRole('heading', { name: /Change the keys of/ }).waitFor({ timeout: 60_000 });
  assert.match(await page.locator('.review').innerText(), /A succession declared/);
  await shot(page, '21-succession-review');
  await page.getByRole('button', { name: 'Sign it' }).click();
  // H79: that change made a new paper too; the newest paper is what a thief would steal next.
  const { chain: c1, signing: w1 } = await bothWords(page);
  await page.getByRole('button', { name: 'Done: back to the start' }).click();
  await door(page, 'Name or confirm a successor');
  const bWords = (await b.c.ask<{ words: string[] }>('carry')).words.join(' ');
  await fill(page, '#form-confirm', { owner: a.id, successor: b.id, address: H[0], words: bWords });
  await page.locator('#form-confirm').getByRole('button', { name: 'Read it back' }).click();
  await page.getByRole('heading', { name: /Confirm that/ }).waitFor({ timeout: 60_000 });
  await shot(page, '22-confirm-review');
  await page.getByRole('button', { name: 'Sign it' }).click();
  await page.locator('.review', { hasText: 'the succession is confirmed' }).waitFor({ timeout: 60_000 });
  await shot(page, '23-confirmed');
  await page.getByRole('button', { name: 'Done: back to the start' }).click();

  // A thief rotates with the stolen words (in a Kišib of its own); the owner escapes, by clicks, to a new home.
  const thief = await kishib();
  const tr = await thief.c.ask<any>('rotate plan', { id: a.id, address: H[0], words: c1.join(' ') });
  // The thief's Kišib, as the owner's: a new paper written first (H79), then the change signed and sent.
  await changeKeys(thief.c, tr);
  const fresh = spare;
  try {
    await door(page, 'Escape a contested position');
    await banner(page, 'the escape form');
    // The owner's signing words are the key it held before the thief's change: the one the succession's rotation installed.
    await fill(page, '#form-escape', { id: a.id, address: H[0], words: c1.join(' '), signingWords: w1.join(' '), homes: fresh.base });
    await shot(page, '24-escape-form');
    await page.getByRole('button', { name: 'Read it back' }).click();
    await heading(page, /Escape position 2/);
    assert.match(await page.locator('.review').innerText(), /it counts now/);
    await shot(page, '25-escape-review');
    await page.getByRole('button', { name: 'Sign it' }).click();
    // H79: the escape's new paper first; only then are the escape and its endorsement signed.
    await bothWords(page);
    await shot(page, '26-escape-counts');
    const l = await lookUp(a.id, [fresh.base, relay.base, ...H]);
    assert.match(l.resolution.links.at(-1)!.how, /escape/);
    void own;
  } finally {
    // the spare home stops with the others
  }
  assert.ok((await kept(page)).empty);
  await context.close();
  assert.deepEqual(problems, []);
});

test('the program’s page on the Mac: a collective rotation from two of three paper shares, F337’s screen read first; a member gives their share in the web client', async () => {
  const { H, e, f, fWords, ana, cy, col, clone, papers } = await founded(homes, relay);
  const aWords = (await ana.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const k = await kishib();
  const context = await browser.newContext({ viewport: { width: 760, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  await page.locator('button.door').first().waitFor({ timeout: 60_000 });
  assert.match(await page.locator('#test-only').innerText(), /Kišib writes nothing of your words to this device/);
  await shot(page, '30-mac-start');
  await door(page, 'Rotate a collective');
  await fill(page, '#form-start', { collective: col, address: H[0], number: String(papers[f.id].x), shareWords: papers[f.id].words.join(' '), founder: f.id, founderWords: fWords });
  await shot(page, '31-collective-form');
  await page.getByRole('button', { name: 'Read it back' }).click();
  await page.locator('#mustread').waitFor({ timeout: 60_000 });
  assert.match(await page.locator('#mustread').innerText(), /whole chain key for a moment/);
  await shot(page, '32-collective-review');
  // Not without saying it was read.
  await page.getByRole('button', { name: 'Sign it' }).click();
  await page.locator('#status .note.error', { hasText: 'Read what this device will hold' }).waitFor();
  await page.locator('#read-it').check();
  await page.getByRole('button', { name: 'Sign it' }).click();
  await page.locator('#request-state').waitFor({ timeout: 60_000 });
  const full = await page.locator('#request-state .full').innerText();
  assert.match(await page.locator('#request-state').innerText(), /1 of 2 shares are in/);
  await shot(page, '33-collective-waiting');

  // Ana, in the web client: the rotation read first, then her paper and words.
  const { context: wc, page: wp } = await open(`${kishibWeb}/`);
  await wp.locator('button.door').first().waitFor({ timeout: 60_000 });
  await door(wp, 'Give my share to a collective’s rotation');
  await banner(wp, 'giving a share');
  await fill(wp, '#form-give', { collective: col, fingerprint: full, address: H[0] });
  await wp.getByRole('button', { name: 'Read the rotation first' }).click();
  await wp.locator('#request', { hasText: 'asks for your share' }).waitFor({ timeout: 60_000 });
  await fill(wp, '#form-give', { member: ana.id, number: String(papers[ana.id].x), shareWords: papers[ana.id].words.join(' '), memberWords: aWords });
  await shot(wp, '34-give-form');
  await wp.getByRole('button', { name: 'Read it back' }).click();
  await wp.getByRole('heading', { name: /Give share/ }).waitFor({ timeout: 60_000 });
  await shot(wp, '35-give-review');
  await wp.getByRole('button', { name: 'Sign it' }).click();
  await wp.locator('.review', { hasText: 'Sealed to the starter’s one-time key' }).waitFor({ timeout: 60_000 });
  await shot(wp, '36-given');
  assert.ok((await kept(wp)).empty);
  await wc.close();

  // The founder's page: found, rebuilt, rotated, dealt.
  await page.getByRole('button', { name: 'Look for the members’ shares' }).click();
  await page.getByRole('button', { name: 'Rebuild, rotate and deal now' }).waitFor({ timeout: 60_000 });
  await shot(page, '37-two-of-two');
  await page.getByRole('button', { name: 'Rebuild, rotate and deal now' }).click();
  await page.getByRole('button', { name: 'Show the collective’s new signing key’s words' }).waitFor({ timeout: 60_000 });
  await shot(page, '38-rotated');
  await page.locator('[data-action="show share"]').click();
  await page.locator('#words').waitFor();
  await shot(page, '39-new-share');
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await page.getByRole('button', { name: 'Show the collective’s new signing key’s words' }).click();
  const cw = await shownWords(page);
  await shot(page, '40-collective-words');
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await typeBack(page, cw);
  await button(page, 'Done: back to the start');
  await shot(page, '41-collective-done');
  for (const m of [ana, cy]) await receiveShare(m.c, clone);

  // Edubba, by clicks: the change waits for Kišib, with the box for the collective's new words; given them, it is in force.
  const ep = await context.newPage();
  ep.on('pageerror', (x) => problems.push(x.message));
  await ep.goto(`${e.app.base}/#pair=${e.app.access.newCode()}`);
  await ep.click('[data-action=tab][data-tab=collectives]');
  await ep.click(`.entry[data-id="${col}"]`);
  const box = ep.locator('form#real-renew');
  await box.waitFor({ timeout: 60_000 });
  assert.match(await ep.locator('.proposal-status').last().innerText(), /Open Kišib and choose “Rotate a collective”/);
  await shot(ep, '42-edubba-waits-for-kishib');
  await box.locator('textarea[name=words]').fill(cw.join(' '));
  await box.locator('button[type=submit]').click();
  await ep.locator('#e-status .note.done', { hasText: 'The member change is in force' }).waitFor({ timeout: 60_000 });
  await ep.locator('.proposal-status', { hasText: 'In force: Kišib’s rotation' }).waitFor({ timeout: 60_000 });
  await shot(ep, '43-edubba-in-force');
  // Edubba reads the collective under the change in force: the joining member's signature, declared by the rotation, is read too.
  await ep.locator('#e-perms', { hasText: 'is a party of it' }).waitFor({ timeout: 60_000 });
  assert.doesNotMatch(await ep.locator('#e-perms').innerText(), /cannot read/);
  // The program's folder holds no word.
  const folder = everything(k.dir);
  for (const ws of [papers[f.id].words, fWords.split(' '), cw]) for (const x of forms(ws, fromWords(ws))) assert.ok(!folder.includes(x));
  await context.close();
  assert.deepEqual(problems, []);
});
