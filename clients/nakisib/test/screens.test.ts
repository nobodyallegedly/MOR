// Nakišib's page, by clicks, in headless Chromium, through every screen: the
// first screen saying "This Mac should never connect again."; a change of
// keys (the request read, its summary with the dangerous parts first, the
// paper, the new paper shown, hidden and three asked back, a wrong one
// refused, SIGN, the answer written); a new identity's first paper and its
// commitment; what it signed, written again; Quit.
//
// No network (the named test): Nakišib runs under strace, which records
// every network call its program makes; at the end, the only socket it ever
// opened is the one listening on 127.0.0.1, and it connected nowhere. Every
// request the page made went to Nakišib's own address, and nothing the
// content security policy refused. Where strace is missing, the test fails:
// it is the proof.
//
// MOR_SCREENSHOTS=DIR keeps a picture of every screen, at a Mac's size and
// a phone's.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import type { Review, State } from '../../kishib/src/shapes.ts';
import { closeAll, dub, folder, kishib, nakisib, start, stopAll, type Relay } from './world.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHOTS = process.env.MOR_SCREENSHOTS;
let browser: Browser;
let homes: Relay[];
let relay: Relay;
const files = mkdtempSync(join(tmpdir(), 'nakisib-stick-'));
const stick = (name: string) => join(files, name);

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
});

after(async () => {
  await browser?.close();
  await stopAll();
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

let shot = 0;
async function picture(page: Page, name: string) {
  if (!SHOTS) return;
  shot++;
  const n = String(shot).padStart(2, '0');
  await page.screenshot({ path: join(SHOTS, `nakisib-${n}-${name}.png`), fullPage: false });
}

test('every screen by clicks, nothing secret on disk, and no connection but the loopback', async () => {
  try {
    execFileSync('strace', ['-V'], { stdio: 'ignore' });
  } catch {
    assert.fail('strace is needed for the no-network test (apt-get install strace)');
  }
  const trace = join(files, 'strace.txt');
  const n = await nakisib({ wrap: ['strace', '-f', '-qq', '-e', 'trace=network', '-o', trace] });

  // Kišib's side: an identity made in Dub, a change of keys with Nakišib, its request on the stick.
  const H = homes.map((h) => h.base);
  const d = await dub(H, [relay.base]);
  const k = await kishib();
  const review = await k.c.ask<Review>('nakisib plan', { id: d.id, address: H[0] });
  await k.c.ask<State>('confirm', { plan: review.plan, digest: review.digest });
  writeFileSync(stick('request.mor'), Buffer.from((await k.c.ask<{ bytes: string }>('nakisib request')).bytes, 'base64'));

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const asked: string[] = [];
  const errors: string[] = [];
  page.on('request', (r) => asked.push(r.url()));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(n.base);

  // The first screen.
  await page.getByText('This Mac should never connect again.').first().waitFor();
  await picture(page, 'first-screen');
  const font = await page.evaluate(() => getComputedStyle(document.querySelector('.k-page')!).fontFamily);
  assert.match(font, /^Inter/);

  // A change of keys, by clicks.
  await page.click('[data-k-tile="rotation"]');
  await page.getByRole('heading', { name: 'Read a request from Kišib' }).waitFor();
  await page.fill('form[data-path="read"] input[name=path]', stick('request.mor'));
  await page.click('form[data-path="read"] button[type=submit]');
  await page.getByRole('heading', { name: 'What these bytes say' }).waitFor();
  const loud = await page.locator('#preview .nk-loud').innerText();
  assert.match(loud, /CONSEQUENTIAL — READ BEFORE SIGNING/);
  assert.match(loud, /New signing key: fingerprint/);
  await picture(page, 'summary');
  // A wrong paper refused, said plainly; the field emptied at once.
  await page.fill('#paper textarea[name=words]', 'abandon '.repeat(23) + 'art');
  await page.click('#paper button[type=submit]');
  await page.locator('.k-note.k-error').waitFor();
  assert.match(await page.locator('.k-note.k-error').innerText(), /may be an earlier, spent one/);
  await picture(page, 'wrong-paper');
  await page.fill('#paper textarea[name=words]', d.chainWords.join(' '));
  await page.click('#paper button[type=submit]');
  await page.getByRole('heading', { name: 'The paper is the right one' }).waitFor();
  await picture(page, 'paper-right');
  await page.click('[data-action="show"]');
  await page.locator('#words').waitFor();
  const parts = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.equal(parts.length, 24);
  await picture(page, 'new-paper');
  await page.click('[data-action="hide"]');
  await page.locator('#typed').waitFor();
  assert.equal(await page.locator('#words').count(), 0, 'hidden');
  const labels = await page.locator('#typed label').allInnerTexts();
  const at = labels.map((l) => Number(/\d+/.exec(l)![0]));
  await picture(page, 'three-asked');
  for (const i of at) await page.fill(`#typed input[name=t${i}]`, 'zoo');
  await page.click('#typed button[type=submit]');
  await page.locator('.k-note.k-error').waitFor();
  assert.match(await page.locator('.k-note.k-error').innerText(), /not the backup shown/);
  for (const i of at) await page.fill(`#typed input[name=t${i}]`, parts[i - 1]);
  await page.click('#typed button[type=submit]');
  await page.getByRole('heading', { name: 'Sign this change of keys' }).waitFor();
  assert.match(await page.locator('#module-summary .nk-loud').innerText(), /FRESH SEED/);
  await picture(page, 'sign');
  await page.fill('#sign input[name=word]', 'SIGN');
  await page.click('#sign button[type=submit]');
  await page.getByRole('heading', { name: 'Signed' }).waitFor();
  await picture(page, 'signed');
  await page.fill('form[data-path="write"] input[name=path]', stick('answer.mor'));
  await page.click('form[data-path="write"] button[type=submit]');
  await page.getByRole('heading', { name: 'Written' }).waitFor();
  await picture(page, 'written');
  // Kišib takes it: checked, sent, counting.
  let s = await k.c.ask<State>('nakisib answer', { answer: readFileSync(stick('answer.mor')).toString('base64') });
  if ((s.sitting!.stage as string) === 'sent') s = await k.c.ask<State>('refresh');
  assert.equal(s.sitting!.stage, 'counts');
  await page.click('[data-action="forget"]');

  // A new identity's first paper, by clicks.
  await page.click('[data-k-col="first"]');
  await page.getByRole('heading', { name: 'A new identity’s first paper' }).waitFor();
  await picture(page, 'first-start');
  await page.click('[data-action="first"][data-module="words"]');
  await page.locator('#words').waitFor();
  const first = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  await picture(page, 'first-paper');
  await page.click('[data-action="hide"]');
  await page.locator('#typed').waitFor();
  const at2 = (await page.locator('#typed label').allInnerTexts()).map((l) => Number(/\d+/.exec(l)![0]));
  for (const i of at2) await page.fill(`#typed input[name=t${i}]`, first[i - 1]);
  await page.click('#typed button[type=submit]');
  await page.locator('#commit').waitFor();
  await picture(page, 'commitment');
  await page.fill('form[data-path="write"] input[name=path]', stick('commitment.mor'));
  await page.click('form[data-path="write"] button[type=submit]');
  await page.getByRole('heading', { name: 'The commitment is written' }).waitFor();
  await page.click('[data-action="forget"]');

  // What it signed: the list, and the same bytes written again.
  await page.click('[data-k-col="signed"]');
  await page.locator('#signed-list li').first().waitFor();
  assert.equal(await page.locator('#signed-list li').count(), 1);
  await picture(page, 'signed-list');
  await page.fill('form[data-path="again"] input[name=path]', stick('again.mor'));
  await page.click('[data-action="again"]');
  await page.getByText(/Written again to/).waitFor();
  assert.deepEqual(readFileSync(stick('again.mor')), readFileSync(stick('answer.mor')));

  // At a phone's size, the column folds away.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('[data-action="home"]');
  await picture(page, 'phone-first-screen');
  await page.setViewportSize({ width: 1280, height: 800 });

  // Nothing secret on disk: Nakišib's folder, read whole, is its memory alone.
  const all = folder(n.dir);
  assert.deepEqual([...all.keys()], ['memory.cbor']);
  const mem = all.get('memory.cbor')!.toString('latin1');
  for (const p of [d.chainWords, parts, first]) assert.ok(!mem.includes(p.slice(0, 3).join(' ')));

  // Quit: Nakišib forgets and ends.
  await page.click('[data-action="quit"]');
  await page.getByText('Nakišib has ended').waitFor();
  await new Promise<void>((ok) => (n.proc.exitCode !== null ? ok() : n.proc.once('exit', () => ok())));
  await context.close();
  await k.c.ask('forget');

  // Every request the page made went to Nakišib's own address; nothing refused, no error.
  assert.ok(asked.length > 10);
  assert.deepEqual(asked.filter((u) => !u.startsWith(n.base)), [], 'the page asked nothing of anyone else');
  assert.deepEqual(errors.filter((e) => !/status of 400/.test(e)), [], 'no error but the refusals said on the page');

  // The program's every network call: one socket, bound to 127.0.0.1, listening; no connection made, ever.
  const calls = readFileSync(trace, 'utf8').split('\n').filter((l) => /\b(socket|connect|bind|sendto|sendmsg|listen)\(/.test(l));
  assert.ok(calls.some((l) => /bind\(\d+, \{sa_family=AF_INET, sin_port=htons\(\d+\), sin_addr=inet_addr\("127\.0\.0\.1"\)\}/.test(l)), calls.join('\n'));
  for (const l of calls) {
    assert.ok(!/\bconnect\(/.test(l), `a connection: ${l}`);
    assert.ok(!/AF_INET6|AF_NETLINK|AF_PACKET/.test(l), `another kind of network: ${l}`);
    if (/\bbind\(/.test(l)) assert.match(l, /inet_addr\("127\.0\.0\.1"\)/, `bound elsewhere: ${l}`);
    if (/\bsendto\(|\bsendmsg\(/.test(l)) assert.match(l, /NULL, 0\)|sendmsg\(\d+, \{msg_name=NULL/, `sent somewhere named: ${l}`);
  }
  assert.ok(calls.filter((l) => /\bsocket\(/.test(l)).every((l) => /socket\(AF_INET, SOCK_STREAM/.test(l)), calls.join('\n'));
});
