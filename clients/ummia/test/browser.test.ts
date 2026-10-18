// Ummia in a real browser (headless Chromium, fresh profiles), by clicks and
// typing alone, against real homes and relays on local ports:
//
// - the program's page: an identity made in Dub brought by its signing
//   words; who acts (the chooser); a release from a folder chosen with the
//   picker, every file listed, signed, then checked as anyone would; a cMIP
//   read back with its hash, then published; Tracking finding it, and
//   accepting it from there; the Accepted tab showing it; a MIP started in
//   the MIP shape and its draft published; a report sent; Settings;
// - Edubba's folder checks, carried over with its releases (H19, H23, H31):
//   a name with a space at its end named as a near match, a Terminal path
//   with "\ " read as a space, a quoted path, and the picker browsing the
//   computer's folders from the program;
// - the web client, built as released and served with its headers: the
//   banner and its risks on every screen, releases said to need a
//   computer, a specification published from the browser, nothing of a
//   chain key in its storage.
//
// `MOR_SCREENSHOTS=DIR` keeps a picture of every screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { contentSecurityPolicy } from '../src/web/headers.ts';
import { closeAll, dub, folder, start, ummia, type Relay } from './world.ts';

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
let web: string;
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
  const d = mkdtempSync(join(tmpdir(), 'ummia-web-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', d], { cwd: here, stdio: 'ignore' });
  web = await serveBuilt(d, policy);
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
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());
  await page.goto(url);
  return { context, page };
}

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

async function bring(page: Page, who: { id: string; words: string }, home: string) {
  await sees(page, 'form#bring', 'bring');
  await page.locator('form#bring [name=id]').fill(who.id);
  await page.locator('form#bring [name=words]').fill(who.words);
  await page.locator('form#bring [name=address]').fill(home);
  await page.getByRole('button', { name: 'Bring it' }).click();
  await sees(page, 'nav.tabs', 'app');
  await settled(page);
}

test('Ummia by clicks, the program’s page: a release, a specification tracked and accepted, a MIP, a report', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const me = await dub(H, R);
  const u = await ummia();
  const { page } = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  await shot(page, 'ummia-identity-window');
  await bring(page, me, H[0]);
  // Who acts: the chooser, yourself checked, collectives said to come later.
  assert.equal(await page.locator('#acting input[name=actor]:checked').getAttribute('value'), me.id);
  assert.match(await page.locator('.acting').innerText(), /Acting as a collective you belong to comes in a second round/);
  await shot(page, 'ummia-releases');

  // A release: the folder chosen with the picker, read back with every file, signed, checked as anyone would.
  const f = folder();
  await page.getByRole('button', { name: 'Choose a folder…' }).click();
  await sees(page, '.picker', 'picker');
  await page.locator('#picker').evaluate((el, p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.action = 'folders';
    b.dataset.path = p;
    b.id = 'go-there';
    el.appendChild(b);
  }, dirname(f));
  await page.locator('#go-there').click();
  await sees(page, '.picker button[data-path$="testrelease"]', 'picker-into');
  await page.locator('.picker button[data-path$="testrelease"]').first().click();
  await page.getByRole('button', { name: 'Use this folder' }).click();
  await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement)?.value === 'testrelease');
  await page.locator('form#release [name=version]').fill('1.0');
  await page.locator('form#release').getByRole('button', { name: 'Read it back' }).click();
  await sees(page, '#release-review .review', 'release-review');
  const files = await page.locator('#release-review .files').innerText();
  assert.match(files, /README\.md/);
  assert.match(files, /src\/main\.ts/);
  assert.doesNotMatch(files, /\.hidden/);
  await shot(page, 'ummia-release-review');
  assert.match(await done(page, page.locator('#release-review').getByRole('button', { name: 'Sign and publish' }), 'released'), /testrelease 1\.0 is published/);
  await sees(page, '[data-release] button[data-action="release check"]', 'release-list');
  await page.locator('[data-release] button[data-action="release check"]').first().click();
  await sees(page, '.check-out li.ok', 'checked');
  assert.match(await page.locator('.check-out').first().innerText(), /VERIFIED/);
  await shot(page, 'ummia-release-checked');

  // A cMIP: its hash shown before signing, then published.
  await page.locator('button.tab[data-tab=specs]').click();
  await sees(page, 'form#spec', 'spec');
  await page.locator('form#spec [name=text]').fill('# cMIP: Clicked notes, draft 1\n\nNotes, published by clicks.');
  await page.locator('form#spec summary', { hasText: 'Act types it defines' }).click();
  await page.locator('form#spec [name=types]').fill('0 note note = tstr');
  await page.getByRole('button', { name: 'Read it back, with its hash' }).click();
  await sees(page, '#review-hash', 'spec-review');
  // Shown written for people (F349, mspec1…), its hexadecimal beside.
  const shown = (await page.locator('#review-hash').innerText()).trim();
  assert.match(shown, /^mspec1[02-9ac-hj-np-z]{58}$/);
  const hash = (await page.locator('#review-hash').getAttribute('title'))!;
  assert.match(hash, /^[0-9a-f]{64}$/);
  await shot(page, 'ummia-spec-review');
  assert.match(await done(page, page.locator('#spec-review').getByRole('button', { name: 'Sign and publish' }), 'spec-published'), new RegExp(hash));

  // Tracking finds it; accepted from there; the Accepted tab shows it.
  await page.locator('button.tab[data-tab=track]').click();
  await sees(page, 'form#track', 'track');
  await page.locator('form#track').getByRole('button', { name: 'Look' }).click();
  await sees(page, `.spec-card[data-hash="${hash}"]`, 'tracked');
  assert.match(await page.locator('.limit').innerText(), /sees public agreements only/);
  await shot(page, 'ummia-tracking');
  await done(page, page.locator(`.spec-card[data-hash="${hash}"] button[data-action="accept spec"]`).first(), 'accepted');
  await page.locator('button.tab[data-tab=accepted]').click();
  await sees(page, '#accepted-body .hash', 'accepted-tab');
  assert.match(await page.locator('#accepted-body').innerText(), new RegExp(shown));
  await shot(page, 'ummia-accepted');

  // A MIP: started in the MIP shape, its draft published for discussion.
  await page.locator('button.tab[data-tab=mips]').click();
  await sees(page, 'form#mip-new', 'mips');
  await page.locator('form#mip-new [name=title]').fill('Text, with footnotes');
  await page.locator('form#mip-new [name=forks]').selectOption('text');
  await page.getByRole('button', { name: 'Start it in the MIP shape' }).click();
  await sees(page, 'form.mip-text textarea', 'mip-text');
  assert.match(await page.locator('form.mip-text textarea').inputValue(), /^# MIP: Text, with footnotes/);
  await shot(page, 'ummia-mip');
  assert.match(await done(page, page.getByRole('button', { name: 'Publish this draft for discussion' }), 'mip-draft'), /published for discussion/);

  // A report, to a reporting identity named in Settings.
  const reporting = TestIdentity.create({ homes: [homes[0].home] });
  await reporting.publishGenesis();
  await reporting.publishRoutes([{ kind: 0, scope: null, hints: R }, { kind: 1, scope: null, hints: R }]);
  await page.locator('button.tab[data-tab=settings]').click();
  await sees(page, 'form#settings', 'settings');
  await page.locator('form#settings [name=reports]').fill(reporting.id);
  await done(page, page.locator('form#settings').getByRole('button', { name: 'Save' }), 'settings-saved');
  await page.locator('button.tab[data-tab=reports]').click();
  await sees(page, 'form#report', 'report');
  await page.locator('form#report [name=text]').fill('Ummia: a test report\n\nIt works by clicks.');
  assert.match(await done(page, page.getByRole('button', { name: 'Sign and send it' }), 'report-sent'), /Left in the reporting identity’s inbox/);
  await shot(page, 'ummia-reports');
  assert.deepEqual(problems, []);
});

test('H19, H23, H31, carried over from Edubba: a near match named, a Terminal path read, the picker browsing the computer’s folders', async () => {
  const H = homes.map((h) => h.base);
  const me = await dub(H, [relay.base]);
  const u = await ummia();
  const { page } = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  await bring(page, me, H[0]);
  const was = process.env.HOME;
  const home = mkdtempSync(join(tmpdir(), 'ummia-home-'));
  mkdirSync(join(home, 'Projects', 'testrelease '), { recursive: true });
  mkdirSync(join(home, 'Projects', '.hidden'), { recursive: true });
  writeFileSync(join(home, 'Projects', 'testrelease ', 'notes.txt'), 'clay\n');
  process.env.HOME = home;
  try {
    const field = page.locator('form#release [name=folder]');
    // Typed without the space at its end, as Finder shows it: no such folder, and the near match named.
    await field.fill('~/Projects/testrelease');
    await field.dispatchEvent('change');
    await page.locator('#status .note.error').waitFor({ timeout: 30_000 });
    assert.match(await page.locator('#status').innerText(), /There is no folder at .*testrelease\. Did you mean “testrelease ” \(with a space at the end\)\?/);
    await shot(page, 'ummia-near-match');
    // Pasted from the Terminal: "\ " is a space.
    await field.fill('~/Projects/testrelease\\ ');
    await field.dispatchEvent('change');
    await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement).value === 'testrelease ');
    // Quoted, as Finder's “Copy as Pathname” pasted into the Terminal may be.
    await field.fill(`'${join(home, 'Projects', 'testrelease ')}'`);
    await field.dispatchEvent('change');
    await page.locator('#folder-said', { hasText: 'a plain folder' }).waitFor({ timeout: 30_000 });
    // The picker: the computer's folders, browsed by the program; the space at the end said; hidden folders counted, not listed.
    await page.locator('form#release [name=name]').fill('');
    await page.getByRole('button', { name: 'Choose a folder…' }).click();
    await page.locator('.picker', { hasText: home }).waitFor({ timeout: 30_000 });
    await page.locator('.picker button', { hasText: 'Projects' }).click();
    await page.locator('.picker button', { hasText: 'with a space at the end' }).waitFor({ timeout: 30_000 });
    assert.match(await page.locator('.picker').innerText(), /1 hidden folder/);
    await shot(page, 'ummia-picker');
    await page.locator('.picker button', { hasText: 'with a space at the end' }).click();
    await page.getByRole('button', { name: 'Use this folder' }).click();
    await page.waitForFunction(() => (document.querySelector('form#release [name=name]') as HTMLInputElement).value === 'testrelease ');
    assert.equal(await field.inputValue(), join(home, 'Projects', 'testrelease '));
  } finally {
    process.env.HOME = was;
  }
});

test('Ummia’s web client: the banner on every screen, releases said to need a computer, a specification published, nothing of a chain key kept', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const me = await dub(H, R);
  const { page } = await open(`${web}/`);
  const banner = async (where: string) => {
    const t = await page.locator('#for-testing-only').innerText();
    assert.match(t, /^For testing only\./, where);
    assert.match(t, /could copy its signing key/, where);
  };
  await sees(page, 'form#bring', 'web-bring');
  await banner('the identity window');
  await shot(page, 'ummia-web-identity-window');
  await bring(page, me, H[0]);
  await banner('releases');
  assert.match(await page.locator('#releases-body').innerText(), /Releases are made from a folder on a computer/);
  await page.locator('button.tab[data-tab=specs]').click();
  await sees(page, 'form#spec', 'web-spec');
  await banner('specifications');
  await page.locator('form#spec [name=text]').fill('# cMIP: From the web client, draft 1\n\nFor testing only.');
  await page.getByRole('button', { name: 'Read it back, with its hash' }).click();
  await sees(page, '#review-hash', 'web-spec-review');
  await done(page, page.locator('#spec-review').getByRole('button', { name: 'Sign and publish' }), 'web-spec-published');
  await shot(page, 'ummia-web-spec');
  for (const t of ['track', 'mips', 'reports', 'accepted', 'settings'] as const) {
    await page.locator(`button.tab[data-tab=${t}]`).click();
    await settled(page);
    await banner(t);
  }
  // Nothing of the chain key in the browser's storage: only the signing key, as the banner says.
  const kept = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const r = indexedDB.open('ummia');
        r.onsuccess = () => {
          const t = r.result.transaction('keep').objectStore('keep').getAll();
          t.onsuccess = () => resolve(JSON.stringify(t.result));
        };
      }),
  );
  assert.ok(kept.includes(me.id));
  for (const w of me.chainWords) assert.ok(!new RegExp(`\\b${w}\\b.*\\b${me.chainWords[1]}\\b`).test(kept) || me.words.includes(w), 'no chain word kept');
  assert.ok(!kept.includes(me.chainWords.join(' ')));
  assert.deepEqual(csp, [], 'nothing the content security policy refused');
  assert.deepEqual(problems, []);
});
