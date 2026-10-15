// The reader in a real browser (headless Chromium), on a fresh profile, as a
// fresh device would open it: the built page, served with the headers of the
// deployment, reads a link, fetches the act from local relays, verifies it
// with the core library's WebAssembly, and shows it; the front page lists
// the documents; a visitor sends a message that the owner then opens.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { SPECS, cborEncode, mirHash } from '../../genesis/src/core.ts';
import { MIR_TEXTS } from '../src/mirs.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { publishDocument } from '../../longform/src/act.ts';
import { post } from '../../barebone/src/post.ts';
import { contentSecurityPolicy } from '../src/headers.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const dist = join(here, 'dist');
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const sample = readFileSync(new URL('../../longform/examples/sample.md', import.meta.url), 'utf8').replace(/\n$/, '');
const phone = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)));
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
};

let homes: Running[] = [];
let relay: Running;
let owner: TestIdentity;
let server: Server;
let page0: string;
let browser: Browser;
let docId: string;
let postId: string;
let replyId: string;
let keptId: string;
const onion = 'http://exampleexampleexampleexampleexampleexampleexample7ad.onion';
let settings: string;
const csp: string[] = [];
/** Set MOR_SCREENSHOTS to a folder to keep a picture of each page, for a person to look at. */
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: import('playwright-core').Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  owner = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await owner.publishGenesis();
  await owner.publishRoutes([{ scope: null, hints: [relay.base], kind: 1 }]);
  await owner.publishEncryptionKey();
  docId = (await publishDocument(owner, sample, [relay.base])).id;
  postId = (await post(owner, { text: 'Thank you for the shower… (a test post)', jpeg: phone, relays: [relay.base] })).id;
  // F272: an identity whose post is kept at the second home only, one of its homes an onion address; the owner's reply names it with its signer.
  const nym = TestIdentity.create({ homes: [...homes.map((h) => h.home), { operator: null, hint: onion }] });
  await nym.publishGenesis();
  await nym.publishRoutes([{ scope: null, hints: [homes[1].base] }]);
  for (const a of nym.chainActs()) await relayAt(relay.base).putAct(a);
  const kept = await nym.publish(SPECS.text, 0, cborEncode(new Map([[0, 'A post kept at home two.']])), { public: true, relays: [homes[1].base] });
  keptId = kept.id;
  const replier = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await replier.publishGenesis();
  for (const a of replier.chainActs()) await relayAt(relay.base).putAct(a);
  replyId = (await replier.publish(SPECS.text, 0, cborEncode(new Map([[0, 'A reply naming it.']])), { public: true, relays: [relay.base], refs: [[kept.id, nym.id]] })).id;
  settings = JSON.stringify({
    identity: owner.id,
    name: 'Nobody, allegedly',
    relays: [relay.base],
    email: 'someone@example.org',
    links: [{ label: 'The code', href: 'https://github.com/nobodyallegedly/mor' }],
    messageHomes: homes.map((h) => h.base),
  });
  server = createServer((req, res) => {
    const path = new URL(req.url!, 'http://x').pathname;
    const name = path === '/' ? 'index.html' : path.slice(1);
    const headers = {
      'content-security-policy': contentSecurityPolicy(['http://127.0.0.1:*']),
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    };
    if (name === 'reader.json') {
      res.writeHead(200, { ...headers, 'content-type': TYPES['.json'] }).end(settings);
      return;
    }
    const file = join(dist, name);
    if (name.includes('/') || !existsSync(file)) {
      res.writeHead(404, headers).end();
      return;
    }
    res.writeHead(200, { ...headers, 'content-type': TYPES[extname(name)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const a = server.address();
  page0 = `http://127.0.0.1:${typeof a === 'object' && a ? a.port : 0}/`;
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  server?.close();
  for (const r of [...homes, relay]) await r.stop();
});

/** A fresh browser context: no cache, no storage, as a fresh device. */
async function open(hash: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(m.text());
    if (/Content.Security.Policy/i.test(m.text())) csp.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(page0 + hash);
  return { page, ctx, problems };
}

test('a link opened on a fresh device shows a verified document', async () => {
  const { page, ctx, problems } = await open(`#${docId}`);
  await page.waitForSelector('.standing', { timeout: 60_000 });
  assert.match(await page.textContent('.standing.ok') ?? '', /^Verified/);
  assert.equal(await page.textContent('h1'), 'A long-form test document');
  assert.equal(await page.title(), 'A long-form test document · MOR reader');
  const fp = (await page.textContent('#signer .fp'))!.replace(/ /g, '');
  assert.equal(fp, owner.id, 'the whole fingerprint of the signer');
  assert.ok((await page.textContent('#signer'))!.includes('The identity this reader names as Nobody, allegedly'));
  await page.click('details summary');
  assert.ok((await page.textContent('.mor-lf-plain'))!.includes('# A long-form test document'), 'the plain text, one tap away');
  assert.ok(await page.$('a[href="mailto:someone@example.org"]'));
  await shot(page, 'document');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a post with a picture shows it, verified, upright', async () => {
  const { page, ctx, problems } = await open(`#${postId}`);
  await page.waitForSelector('.standing', { timeout: 60_000 });
  assert.match(await page.textContent('.standing.ok') ?? '', /^Verified/);
  const img = await page.waitForSelector('figure img');
  const size = await img.evaluate((i) => [(i as HTMLImageElement).naturalWidth, (i as HTMLImageElement).naturalHeight]);
  const [w, h] = [Number(await img.getAttribute('width')), Number(await img.getAttribute('height'))];
  assert.deepEqual(size, [w, h], 'the browser shows it the size the Module says, turned as its orientation says');
  await shot(page, 'post');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('the front page lists the documents, verified; a link to nothing says so', async () => {
  const { page, ctx, problems } = await open('');
  await page.waitForFunction(() => document.querySelectorAll('#docs li a').length >= 2, null, { timeout: 60_000 });
  const titles = await page.$$eval('#docs li a', (as) => as.map((a) => a.textContent));
  assert.deepEqual(titles, ['Thank you for the shower… (a test post)', 'A long-form test document']);
  // F324, suite 8.1: the six MIRs' hashes, recomputed in the browser from the texts the reader ships.
  await page.waitForFunction(() => document.querySelectorAll('#mirs li[data-hash]').length === 6, null, { timeout: 60_000 });
  const mirs = await page.$$eval('#mirs li', (ls) => ls.map((l) => [(l as HTMLElement).dataset.mir, (l as HTMLElement).dataset.hash]));
  assert.deepEqual(
    mirs,
    MIR_TEXTS.map(({ layer, file }) => [layer, mirHash(readFileSync(join(here, '../../spec', file), 'utf8'))]),
    'the same six as the core library recomputes outside the browser',
  );
  await page.click('#docs li:nth-child(2) a');
  await page.waitForSelector('h1');
  assert.equal(await page.textContent('h1'), 'A long-form test document');
  await page.goto(page0 + '#' + '00'.repeat(32));
  await page.waitForSelector('.note.error', { timeout: 60_000 });
  assert.match((await page.textContent('.note.error'))!, /not found/);
  await page.goto(page0 + '#nonsense');
  await page.waitForSelector('.note.error');
  assert.match((await page.textContent('.note.error'))!, /does not name an act/);
  assert.deepEqual(problems.filter((p) => !/Failed to load resource|^404 .*\/acts\/0{64}$/.test(p)), [], 'only the act that is not there');
  await ctx.close();
});

test('a visitor sends a message over MOR from the page; the owner opens it, verified', async () => {
  const { page, ctx, problems } = await open('');
  await page.fill('#message-text', 'Hello from a browser.\nA second line.');
  await page.click('#message button');
  await page.waitForSelector('#message-status .note.done, #message-status .note.error', { timeout: 60_000 });
  const status = (await page.textContent('#message-status'))!;
  assert.match(status, /^Sent, sealed/, status);
  const got = await owner.readInbox({ inbox: [relay.base], senderHints: [relay.base] });
  const m = got.find((g) => g.text === 'Hello from a browser.\nA second line.');
  assert.ok(m, 'the owner finds it');
  assert.equal(m.status, 'valid');
  assert.ok(status.includes(m.act!) && status.includes(m.from!));
  assert.equal(await page.inputValue('#message-text'), '');
  await shot(page, 'front-message-sent');
  assert.deepEqual(problems, []);
  await ctx.close();
});

test('a reply shows the post it answers, found by its signer at another home; an onion home is not tried, and the page says so (F272; B3)', async () => {
  const { page, ctx, problems } = await open(`#${replyId}`);
  await page.waitForSelector('.standing', { timeout: 60_000 });
  await page.waitForFunction(() => document.body.textContent?.includes('as the reference says'), undefined, { timeout: 60_000 });
  const text = (await page.textContent('body'))!;
  assert.match(text, /signed by [0-9a-f]{8}…[0-9a-f]{4} as the reference says: a text act/);
  assert.match(text, /Not tried: http:\/\/example[a-z0-9]*\.onion, an onion address, which a web browser cannot reach/);
  await shot(page, 'reply');
  // The reader's own relay answers "not held" for the post before the signer is followed: an answer
  // of the cMIP (error 8), which the browser logs as a 404. Nothing else: no request to the onion address.
  const notHeld = `404 ${relay.base}/acts/${keptId}`;
  assert.ok(problems.includes(notHeld), JSON.stringify(problems));
  assert.deepEqual(
    problems.filter((p) => p !== notHeld && !/^Failed to load resource: the server responded with a status of 404/.test(p)),
    [],
    'no request to the onion address, and nothing else in the console',
  );
  assert.equal(problems.filter((p) => /status of 404/.test(p)).length, 1);
  await ctx.close();
});

test('the page ran under its content security policy, with nothing refused', () => {
  assert.deepEqual(csp, []);
});
