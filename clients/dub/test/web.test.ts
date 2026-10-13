// Dub's web client in a real browser (headless Chromium, a fresh profile),
// built as released and served with its headers, against real homes and a
// relay on local ports. Only clicks and typing in the page; what the page
// keeps is then read from the browser's own storage and checked. Then the
// identity is carried by its words into Dub on the Mac, and each keeps its
// own line. Test identities only, generated here. `MOR_SCREENSHOTS=DIR`
// keeps a picture of each step.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { base64, describeAct, hex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { listPosts, readPost } from '../../barebone/src/post.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { INDEX, SCHEME, keySeeds, newChainKey } from '../src/chainwords.ts';
import { serve, type Running } from '../src/server.ts';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import type { IdentityFile } from '../../genesis/src/identity.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
};
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `web-${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
let site: Server;
let base: string;
let browser: Browser;
let mac: Running;
const csp: string[] = [];
const problems: string[] = [];

before(async () => {
  const dist = mkdtempSync(join(tmpdir(), 'dub-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', dist], { cwd: here, stdio: 'ignore' });
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  site = createServer((req, res) => {
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
    if (name === 'dub.json') {
      res.writeHead(200, { 'content-type': TYPES['.json'] });
      res.end(JSON.stringify({ homes: ['https://home.example'], relays: [] }));
      return;
    }
    try {
      if (!/^[a-z_.]+$/.test(name)) throw new Error('no');
      const body = readFileSync(join(dist, name));
      res.writeHead(200, {
        'content-type': TYPES[extname(name)] ?? 'application/octet-stream',
        'content-security-policy': `${policy}; report-uri /csp`,
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'cache-control': 'no-cache',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(site.address() as { port: number }).port}`;
  browser = await chromium.launch({ executablePath: CHROMIUM });
  mac = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-mac-')), port: 0 });
});

after(async () => {
  await browser?.close();
  await mac?.close();
  await new Promise((r) => site?.close(r));
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (page: Page, words: string | RegExp) => page.locator('#status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });

/** Everything this site keeps in the browser: IndexedDB (every database, every entry), local and session storage, caches, cookies. */
async function kept(page: Page): Promise<{ text: string; identity: IdentityFile | undefined }> {
  const dump = await page.evaluate(async () => {
    const out: Record<string, unknown> = { local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie, caches: await caches.keys() };
    const dbs: Record<string, unknown> = {};
    for (const info of await indexedDB.databases()) {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(info.name!);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const stores: Record<string, unknown> = {};
      for (const s of [...db.objectStoreNames]) {
        const st = db.transaction(s).objectStore(s);
        const [keys, values] = await Promise.all(
          [st.getAllKeys(), st.getAll()].map((r) => new Promise<unknown[]>((res, rej) => ((r.onsuccess = () => res(r.result as unknown[])), (r.onerror = () => rej(r.error))))),
        );
        stores[s] = keys.map((k, i) => [k, values[i]]);
      }
      dbs[info.name!] = stores;
      db.close();
    }
    out.indexedDB = dbs;
    return out;
  });
  const entries = ((dump.indexedDB as Record<string, Record<string, [string, unknown][]>>).dub?.keep ?? []) as [string, unknown][];
  return { text: JSON.stringify(dump), identity: entries.find(([k]) => k === 'identity')?.[1] as IdentityFile | undefined };
}

/** Every way the chain key could be written down: its words, its seed, the key's own seeds, in hex and base64. */
function chainForms(words: string[]): string[] {
  const seed = fromWords(words);
  const seeds = keySeeds(seed, SCHEME, INDEX);
  return [words.join(' '), words.slice(0, 6).join(' '), hex(seed), base64(seed), hex(seeds), base64(seeds), hex(seeds.subarray(0, 16))];
}

const banner = async (page: Page, where: string) => {
  const b = page.locator('#for-testing-only');
  assert.ok(await b.isVisible(), `the banner on ${where}`);
  const t = await b.innerText();
  assert.match(t, /^For testing only\./, where);
  assert.match(t, /Whoever serves this page's code at the moment an identity is made here could copy its keys\./, where);
  assert.match(t, /This browser's storage, where the identity's signing key is kept, can be lost, or read by what runs in this page\./, where);
};

test('the web client: a new identity, its chain key shown once as words and kept nowhere; posts across a reload; carried into Dub on the Mac, each keeping its own line', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());

  // The first screen: the banner, two doors, the deployer's suggested home filled in.
  await page.goto(`${base}/`);
  await page.getByRole('heading', { name: 'Make a new identity' }).waitFor({ timeout: 60_000 });
  await banner(page, 'the doors');
  assert.equal(await page.locator('form#begin textarea[name=homes]').inputValue(), 'https://home.example');
  assert.equal(await page.locator('textarea[name=via]').count(), 0, 'no other way to reach an address: a browser has none');
  assert.match(await page.locator('form#bring').innerText(), /kept in this browser’s storage \(IndexedDB\), as it is, not locked/);
  await shot(page, '1-doors');

  // Door one: the chain key's words, shown once.
  const begin = page.locator('form#begin');
  await begin.locator('textarea[name=homes]').fill(homes.map((h) => h.base).join('\n'));
  await begin.locator('textarea[name=relays]').fill(relay.base);
  await begin.getByRole('button', { name: 'Make it' }).click();
  await page.locator('#words').waitFor({ timeout: 60_000 });
  await banner(page, 'the words');
  const words = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.equal(words.length, 24);
  assert.match(await page.locator('.say').innerText(), /this identity’s chain key/);
  assert.match(await page.locator('.say').innerText(), /neither this page nor this browser keeps them/);
  await shot(page, '2-chain-words');
  const forms = chainForms(words);
  // Even while they wait to be typed back, nothing of the chain key is in storage.
  for (const f of forms) assert.ok(!(await kept(page)).text.includes(f), 'nothing of the chain key in storage, before');

  // Three typed back: one wrong first, refused, nothing published.
  const inputs = page.locator('form#confirm input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(i === 1 ? 'wrong' : words[p - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await page.locator('#status .note.error', { hasText: 'Nothing has been published' }).waitFor({ timeout: 60_000 });
  await inputs.nth(1).fill(words[positions[1] - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await done(page, 'The identity is born');
  await banner(page, 'the identity');
  await shot(page, '3-born');

  // The genesis at the homes commits the chain key these words give (the seed Module's key 0, scheme 3).
  const store1 = await kept(page);
  const me = store1.identity!;
  assert.ok(me, 'the identity is kept in IndexedDB');
  const genesis = (await relayAt(homes[0].base).identity(me.identity)).chain[0];
  const commit = newChainKey(fromWords(words)).key.commit;
  assert.ok(hex((describeAct(genesis) as { payload: Uint8Array }).payload).includes(commit), 'the genesis commits the chain key of the words shown');
  // Nowhere in storage afterwards: not the words, not the seed, not the key's seeds. The signing key is there, as it is (said on the page).
  for (const f of forms) assert.ok(!store1.text.includes(f), `nothing of the chain key in storage: ${f.slice(0, 12)}…`);
  assert.deepEqual(me.safety, { scheme: 0, seeds: '' });
  assert.match(me.signingSecret, /^[0-9a-f]{64}$/);
  assert.ok(store1.text.includes(me.signingSecret));
  // Nor on the page any more.
  const html = await page.content();
  for (const f of forms) assert.ok(!html.includes(f), 'the words are not on the page any more');
  assert.match(await page.locator('#identity').innerText(), /Its chain key was shown once as words, and is kept nowhere here\./);

  // A post, read back verified.
  await page.locator('form#post textarea[name=text]').fill('First, from the web client.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, 'Posted');
  assert.match(await page.locator('#published .mor-post').innerText(), /verified/);
  const first = (await page.locator('#published [data-post]').getAttribute('data-post'))!;

  // A reload: the identity is still here, and the next post continues the same line.
  await page.reload();
  await page.locator('form#post').waitFor({ timeout: 60_000 });
  await banner(page, 'the page after a reload');
  await page.locator('form#post textarea[name=text]').fill('Second, after a reload.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, 'Posted');
  const second = (await page.locator('#published [data-post]').getAttribute('data-post'))!;
  const a1 = describeAct((await relayAt(relay.base).getAct(first))!) as { position: number; prev?: string };
  const a2 = describeAct((await relayAt(relay.base).getAct(second))!) as { position: number; prev?: string };
  assert.equal(a2.prev, first, 'the second post follows the first, in the same line');
  assert.equal(a2.position, a1.position + 1);
  const store2 = await kept(page);
  assert.deepEqual(store2.identity!.sequence.slice(-2), [first, second]);
  for (const f of forms) assert.ok(!store2.text.includes(f), 'still nothing of the chain key in storage');
  await shot(page, '4-posted');

  // The carry words, on request: the way out.
  await page.getByRole('button', { name: 'Show the carry words' }).click();
  await page.locator('#carry-words').waitFor();
  const carry = (await page.locator('#carry-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  const grouped = await page.locator('#carry .id').innerText();
  assert.equal(carry.length, 24);
  assert.equal(hex(fromWords(carry)), me.signingSecret, 'the carry words are the signing key');
  assert.notDeepEqual(carry, words, 'not the chain key');
  assert.match(await page.locator('#carry .say').innerText(), /Whoever holds these words can post as this identity/);
  await shot(page, '5-carry');

  // Into Dub on the Mac, by those words: it checks the current signing key, and starts its own line.
  await mac.dub.bring({ id: grouped, words: carry.join(' '), address: homes[1].base });
  const onMac = await mac.dub.post({ text: 'Third, from Dub on the Mac.' });
  const a3 = describeAct((await relayAt(relay.base).getAct(onMac.post.id))!) as { position: number; prev?: string };
  assert.equal(a3.position, 1, 'the Mac starts its own line');
  assert.ok(!a3.prev);
  // And the web client goes on with its own.
  await page.locator('form#post textarea[name=text]').fill('Fourth, from the web client again.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, 'Posted');
  const fourth = (await page.locator('#published [data-post]').getAttribute('data-post'))!;
  const a4 = describeAct((await relayAt(relay.base).getAct(fourth))!) as { position: number; prev?: string };
  assert.equal(a4.prev, second, 'the web client’s line goes on from its own last act');
  // Every post valid, read by a reader that knows only the relay; both lines listed in each app.
  for (const id of [first, second, onMac.post.id, fourth]) assert.equal((await readPost(id, [relay.base])).standing, 'valid', id);
  assert.deepEqual(new Set(await listPosts(me.identity, relay.base)), new Set([first, second, onMac.post.id, fourth]));
  await page.getByRole('button', { name: 'Look again' }).click();
  await page.locator('#posts', { hasText: 'Third, from Dub on the Mac.' }).waitFor({ timeout: 60_000 });
  assert.equal((await mac.dub.posts()).length, 4);
  await shot(page, '6-both-lines');

  // Forgetting it in this browser leaves nothing of it in storage.
  await page.getByRole('button', { name: 'Forget this identity in this browser' }).click();
  await page.getByRole('heading', { name: 'Make a new identity' }).waitFor({ timeout: 60_000 });
  assert.ok(!(await kept(page)).text.includes(me.signingSecret));

  assert.deepEqual(problems, []);
  assert.deepEqual(csp, [], 'the content security policy refused nothing');
  await context.close();
});

test('the web client brings an identity made by Dub on the Mac, and refuses wrong words', async () => {
  const mac2 = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-mac2-')), port: 0 });
  try {
    const b = await mac2.dub.begin({ homes: [homes[0].base], relays: [relay.base] });
    const st = await mac2.dub.state();
    await mac2.dub.confirm(b.positions.map((p) => b.words[p - 1]));
    const id = (await mac2.dub.carry()).id;
    assert.equal(st.confirm!.id, id);

    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', (e) => problems.push(e.message));
    await page.goto(`${base}/`);
    const bring = page.locator('form#bring');
    await bring.waitFor({ timeout: 60_000 });
    const wrong = [...b.words];
    [wrong[0], wrong[1]] = [wrong[1], wrong[0]];
    await bring.locator('input[name=id]').fill(id);
    await bring.locator('textarea[name=words]').fill(wrong.join(' '));
    await bring.locator('input[name=address]').fill(homes[0].base);
    await bring.getByRole('button', { name: 'Bring it' }).click();
    await page.locator('#status .note.error', { hasText: /Nothing was kept/ }).waitFor({ timeout: 60_000 });
    assert.equal((await kept(page)).identity, undefined);
    await bring.locator('textarea[name=words]').fill(b.words.join(' '));
    await bring.getByRole('button', { name: 'Bring it' }).click();
    await done(page, 'The identity is here');
    await banner(page, 'a brought identity');
    assert.match(await page.locator('#identity').innerText(), /Elsewhere, and brought here by its words\. Its chain key is not here\./);
    await page.locator('form#post textarea[name=text]').fill('From the web, an identity made on the Mac.');
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    await done(page, 'Posted');
    const pid = (await page.locator('#published [data-post]').getAttribute('data-post'))!;
    assert.equal((describeAct((await relayAt(relay.base).getAct(pid))!) as { position: number }).position, 1, 'its own line');
    assert.equal((await readPost(pid, [relay.base])).standing, 'valid');
    assert.deepEqual(problems, []);
    await context.close();
  } finally {
    await mac2.close();
  }
});
