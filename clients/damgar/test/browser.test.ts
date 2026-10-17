// Damgar in a real browser (headless Chromium, fresh profiles), by clicks
// and typing alone, against real homes and a relay on local ports:
//
// - its web client, built as released and served with its headers: the
//   banner and its risks on every screen; an identity made in Dub brought
//   by its signing words; the first screen choosing what is accepted; a tip
//   prepared in Dub (by clicks in Dub's page) read in To sign and signed;
//   the payee's Damgar (the program's page, by clicks) making the invoice
//   from a wallet; Pay showing it; the preimage pasted back and the claim
//   signed; the payee signing the receipt; the account, each proof valid;
//   Settings: where one is paid, read back with each rail's stated costs,
//   then published; nothing of a chain key in the browser's storage;
// - Edubba's pieces, by clicks: a payment from an identity, and the
//   anchoring of a collective's act, its service's offer read;
// - Kišib's change of keys, its vault fields.
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
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { closeAll, damgar, dub, edubba, founded, kishib, start, type Relay } from './world.ts';
import { FakeChain, addressScript } from './chain.ts';
import { StubLnd, TestNode } from './node.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import { ACCEPTABLE, SPEC } from '../src/specs.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
};
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
const sites: Server[] = [];
let damgarWeb: string;
let browser: Browser;
const csp: string[] = [];
const problems: string[] = [];

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
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const policy = contentSecurityPolicy([...homes, relay].map((r) => r.base));
  const d = mkdtempSync(join(tmpdir(), 'damgar-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', d], { cwd: here, stdio: 'ignore' });
  damgarWeb = await serveBuilt(d, policy);
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const s of sites) await new Promise((r) => s.close(r));
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 760, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
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
  assert.match(t, /could copy its signing key, and the on-chain request key Damgar makes/, where);
  assert.match(t, /Damgar holds no wallet/, where);
};

/** Wait for an element, or fail at once with what the page said. */
async function sees(page: Page, selector: string, name: string, timeout = 60_000) {
  const err = page.locator('#status .note.error');
  try {
    await Promise.race([page.locator(selector).first().waitFor({ timeout }), err.waitFor({ timeout }).then(async () => assert.fail(await err.innerText()))]);
  } catch (e) {
    await shot(page, `failed-${name}`);
    console.error(`at ${name}:`, (await page.locator('body').innerText()).slice(-1500));
    throw e;
  }
}

/** Click, the earlier note cleared first, and wait for what the page says done. */
async function done(page: Page, button: ReturnType<Page['locator']>, name: string): Promise<string> {
  await page.evaluate(() => {
    const st = document.getElementById('status');
    if (st) st.innerHTML = '';
  });
  await button.click();
  await sees(page, '#status .note.done', name);
  return page.locator('#status').innerText();
}

const settled = (page: Page) => page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled), undefined, { timeout: 60_000 });

test('Damgar by clicks: the web client and the program’s page, a tip from Dub to a receipt; Settings; nothing of a chain key kept', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const alice = await dub(H, R);
  const bob = await dub(H, R);
  const node = new TestNode();

  // Bob's Damgar, the program's page, paired by its link.
  const bd = await damgar();
  const { page: bp } = await open(`${bd.app.base}/#pair=${bd.app.access.newCode()}`);
  await sees(bp, 'form#bring', 'bring');
  await shot(bp, 'damgar-identity-window');
  await bp.locator('form#bring [name=id]').fill(bob.id);
  await bp.locator('form#bring [name=words]').fill(bob.words);
  await bp.locator('form#bring [name=address]').fill(H[0]);
  await bp.getByRole('button', { name: 'Bring it' }).click();
  await sees(bp, 'form#accept', 'accept');
  await shot(bp, 'damgar-accept');
  for (const box of await bp.locator('input[name=accept]').all()) await box.check();
  await bp.getByRole('button', { name: 'Accept these' }).click();
  await sees(bp, 'nav.tabs', 'app');
  await settled(bp);
  // Settings: where Bob is paid, read back with the Lightning Module's stated costs, then published.
  await bp.locator('button.tab[data-tab=settings]').click();
  await sees(bp, 'form#rails', 'settings');
  await shot(bp, 'damgar-settings');
  await bp.locator('form#rails [name=lightning]').fill(node.key);
  await bp.locator('form#rails').getByRole('button', { name: 'Read it back' }).click();
  await sees(bp, '.costs', 'costs');
  assert.match(await bp.locator('.costs').innerText(), /A public node exposes its owner/);
  await shot(bp, 'damgar-settings-review');
  assert.match(await done(bp, bp.getByRole('button', { name: 'Sign and publish it' }), 'published'), /payee pointer, version 1, is published/);

  // Alice's Damgar: the web client, by clicks.
  const { context: ac, page: ap } = await open(`${damgarWeb}/`);
  await sees(ap, 'form#bring', 'web-bring');
  await banner(ap, 'the identity window');
  await shot(ap, 'damgar-web-identity-window');
  await ap.locator('form#bring [name=id]').fill(alice.id);
  await ap.locator('form#bring [name=words]').fill(alice.words);
  await ap.locator('form#bring [name=address]').fill(H[0]);
  await ap.getByRole('button', { name: 'Bring it' }).click();
  await sees(ap, 'form#accept', 'web-accept');
  await banner(ap, 'the first choice');
  await shot(ap, 'damgar-web-accept');
  for (const box of await ap.locator('input[name=accept]').all()) await box.check();
  await ap.getByRole('button', { name: 'Accept these' }).click();
  await sees(ap, 'nav.tabs', 'web-app');

  // In Dub, Alice tips Bob's post, by clicks: prepared there, signed nowhere as money.
  await bob.c.ask('post', { text: 'A post worth a tip.' });
  await alice.c.ask('follow', { id: bob.id, name: 'Bob' });
  const { page: dp } = await open(`${alice.app.base}/#pair=${alice.app.access.newCode()}`);
  await sees(dp, 'article.post', 'dub-feed');
  const post = dp.locator('article.post', { hasText: 'A post worth a tip.' });
  await post.getByRole('button', { name: 'Tip' }).click();
  await post.locator('form.tip [name=value]').fill('1500');
  await shot(dp, 'dub-tip');
  assert.match(await done(dp, post.getByRole('button', { name: 'Prepare it for Damgar' }), 'dub-tipped'), /Prepared, not signed/);
  await dp.locator('button.tab[data-tab=private]').click();
  await dp.locator('details[data-fold=askpaid] > summary').click();
  await shot(dp, 'dub-ask-to-be-paid');

  // Alice's web client: To sign, the draft read in plain words; signed.
  await ap.getByRole('button', { name: 'Look again' }).click();
  await sees(ap, '.item[data-item]', 'web-draft');
  const draft = ap.locator('.item[data-item]').first();
  assert.match(await draft.innerText(), /Prepared in Dub[\s\S]*1 500 regtest satoshis[\s\S]*On Lightning, to their flow/);
  await banner(ap, 'To sign');
  await shot(ap, 'damgar-web-to-sign');
  await done(ap, draft.getByRole('button', { name: 'Sign it' }), 'web-signed');

  // Bob's page: an invoice to make, with the description hash; one made by his node, pasted, checked, sent.
  await bp.locator('button.tab[data-tab=sign]').click();
  await bp.getByRole('button', { name: 'Look again' }).click();
  await sees(bp, 'form.invoice', 'invoice');
  const dh = (await bp.locator('.item .copy').first().innerText()).trim();
  await shot(bp, 'damgar-to-sign-invoice');
  const made = node.invoice(1500, dh);
  await bp.locator('form.invoice [name=invoice]').fill(made.invoice);
  await done(bp, bp.getByRole('button', { name: 'Check it and send it' }), 'invoice-sent');

  // Alice: Pay shows the invoice; the proof pasted back; her claim signed.
  await ap.locator('button.tab[data-tab=pay]').click();
  await sees(ap, 'form.paid', 'web-pay');
  assert.ok((await ap.locator('#pay-list .copy').first().innerText()).includes(made.invoice));
  await banner(ap, 'Pay');
  await shot(ap, 'damgar-web-pay');
  await ap.locator('form.paid [name=proof]').fill(made.preimage);
  assert.match(await done(ap, ap.getByRole('button', { name: 'Check it and sign my claim' }), 'web-claimed'), /says valid/);

  // Bob: the claim checked from the rail's own evidence; his receipt signed.
  await bp.getByRole('button', { name: 'Look again' }).click();
  await sees(bp, 'button[data-action="sign receipt"]', 'receipt');
  await shot(bp, 'damgar-to-sign-receipt');
  await done(bp, bp.locator('button[data-action="sign receipt"]'), 'receipted');

  // Alice's account: the claim and the receipt, each valid.
  await ap.locator('button.tab[data-tab=sign]').click();
  await ap.getByRole('button', { name: 'Look again' }).click();
  await settled(ap);
  await ap.locator('button.tab[data-tab=account]').click();
  await sees(ap, '#account-body .proofs', 'web-account');
  assert.equal(await ap.locator('#account-body .proofs .v.valid').count() >= 2, true);
  assert.match(await ap.locator('.totals').innerText(), /Went out \(verified\)\s*1 500 regtest satoshis/);
  await banner(ap, 'the account');
  await shot(ap, 'damgar-web-account');
  await bp.locator('button.tab[data-tab=account]').click();
  await sees(bp, '#account-body .proofs', 'account');
  await shot(bp, 'damgar-account');
  await ap.locator('button.tab[data-tab=settings]').click();
  await sees(ap, 'form#rails', 'web-settings');
  await shot(ap, 'damgar-web-settings');
  await ap.locator('button.me').click();
  await sees(ap, 'form#bring', 'web-window');
  await shot(ap, 'damgar-web-identity-in-use');

  // The browser's storage: the identity's signing key, as said; never a chain key.
  const kept = await ap.evaluate(async () => {
    const db: IDBDatabase = await new Promise((res, rej) => {
      const r = indexedDB.open('damgar');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    const all: unknown[] = await new Promise((res) => {
      const r = db.transaction('keep').objectStore('keep').getAll();
      r.onsuccess = () => res(r.result);
    });
    return JSON.stringify(all);
  });
  assert.ok(kept.includes(alice.id));
  assert.ok(!kept.includes(alice.chainWords.join(' ')) && !/"seeds":"[0-9a-f]+"/.test(kept), 'no chain key kept');
  await ac.close();
  assert.deepEqual(problems, []);
  assert.deepEqual(csp, []);
});

test('Edubba’s pieces by clicks: a payment prepared for Damgar; a collective’s act anchored, its service’s offer read; Kišib’s vault fields', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  chain.mine(5);
  const lnd = new StubLnd(chain, addressScript);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'damgar-svc-')), 'svc'), lnd, chain, { homes: H, relays: R });
  await svc.start();
  const e = await edubba(H, R, chain);
  const { f, col } = await founded(H, R, e);
  await e.c.ask('acting as', { id: f.id });
  const { page: ep } = await open(`${e.app.base}/#pair=${e.app.access.newCode()}`);
  // Identities tab: pay someone.
  await sees(ep, 'button[data-tab=identities], [data-tab=identities]', 'edubba');
  await ep.locator('[data-tab=identities]').first().click();
  await sees(ep, '#e-pay', 'edubba-pay');
  await ep.locator('#e-pay > summary').click();
  await ep.locator('form#pay-someone [name=to]').fill(svc.id);
  await ep.locator('form#pay-someone [name=value]').fill('42');
  await ep.locator('form#pay-someone [name=whatFor]').fill('a thank you');
  await shot(ep, 'edubba-pay-someone');
  await ep.locator('form#pay-someone').getByRole('button', { name: 'Prepare it for Damgar' }).click();
  await sees(ep, 'form#pay-someone .note.done', 'edubba-paid');
  assert.match(await ep.locator('form#pay-someone .note.done').innerText(), /Prepared, not signed/);
  // Collectives tab: the anchor of one of its acts, the service's offer read, a tier chosen.
  await ep.locator('[data-tab=collectives]').first().click();
  await sees(ep, '#e-real-anchor', 'edubba-collective');
  await ep.locator('#e-real-anchor > summary').click();
  await ep.locator('form#anchor-offers [name=service]').fill(svc.id);
  await ep.locator('form#anchor-offers').getByRole('button', { name: 'Read its offer' }).click();
  await sees(ep, 'form.anchor-ask', 'edubba-offer');
  await shot(ep, 'edubba-anchor-offer');
  await ep.getByRole('button', { name: 'Prepare the payment for Damgar' }).click();
  await sees(ep, 'form.anchor-ask .note.done', 'edubba-anchored');
  await sees(ep, '#e-anchors .item', 'edubba-anchors');
  await shot(ep, 'edubba-anchors');
  // The founder's Damgar holds both drafts.
  const g = await damgar(chain);
  await g.c.ask('bring', { id: f.id, words: f.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  await g.c.ask('look');
  const items = (await g.c.ask<{ items: { app: string | null; title: string }[] }>('to sign')).items;
  assert.deepEqual(items.map((i) => [i.app, i.title]).sort(), [['Edubba', 'A payment for an anchor'], ['Edubba', 'A payment to make']]);

  // Kišib: the change of keys, its vault fields.
  const k = await kishib();
  const { page: kp } = await open(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  await kp.locator('button.door', { hasText: 'Change an identity’s keys' }).click();
  await sees(kp, 'form#form-rotate', 'kishib-rotate');
  await kp.locator('form#form-rotate details', { hasText: 'The vault' }).locator('summary').click();
  assert.ok((await kp.locator('form#form-rotate [name=vaultUnit] option').allInnerTexts()).some((t) => /regtest satoshis/.test(t)));
  await kp.locator('form#form-rotate [name=vault]').selectOption('set');
  await shot(kp, 'kishib-vault');
  void SPEC;
  assert.deepEqual(problems, []);
});
