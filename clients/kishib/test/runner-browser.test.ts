// The Dubsar runner by clicks (`cmips/cmip-runner-draft-2.md`): Kišib's page
// and Dub's page, each its own program on this computer, against real homes
// and a relay. Kišib's runner turned on with the risk read first; an
// identity given to it; Dub paired from its first screen and approved in
// Kišib; a post signed through the runner, its panel drawn inside Dub's
// window and unreadable from Dub; a standing yes, then a post with no panel;
// money always asking; a panel closed, answered in Kišib's Waiting; what it
// signed, each act a card with the kit's two menus; an unpaired origin
// refused by the slot, and the panel refused in another page's frame;
// Revoke, then Dub refused; turned off, Kišib's folder holding nothing of it.
// At a Mac's size, then the panel again at a phone's. Then draft 2: the
// passphrase chosen by clicks, typed twice; a private message from someone
// else read in Dub through Kišib, Dub approved with “may open”, the opening
// listed in Signed; Kišib closed and opened again, “Runner locked” top right,
// the passphrase given on its first screen, Dub signing again with no new
// pairing; turned off, said as erasing everything.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { hex } from '../../genesis/src/core.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { closeAll, dub, dubBeside, everything, kishib, kishibAgain, PASS, standing, start, type Relay } from './world.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
let browser: Browser;
let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser.close();
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

async function shot(page: Page, name: string) {
  if (shots) await page.screenshot({ path: join(shots, `runner-${name}.png`) });
}

/** A page, its console errors and what its policy refused kept. */
async function open(url: string, size = { width: 1280, height: 800 }) {
  const context = await browser.newContext({ viewport: size });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  return { context, page, errors };
}

test('the runner by clicks: Kišib and Dub, the panel inside Dub’s window', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  await a.c.ask('name', { name: 'Max' });
  const other = await dub(H, [relay.base]);
  const theirs = (await other.c.ask<{ post: { id: string } }>('post', { text: 'Someone else’s post.' })).post.id;

  const k = await kishib();
  const K = await open(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  const kp = K.page;
  await kp.waitForSelector('.k-tile');

  // Off by default: "Holds nothing · runner off", top right; nothing in Kišib's folder.
  assert.match(await kp.textContent('.kishib-holds') ?? '', /Holds nothing\s*runner off/);
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  await kp.click('[data-k-tile="runner"]');
  await shot(kp, 'mac-01-off');
  // The risk said first; Turn it on refused until it is read.
  assert.match(await kp.textContent('#risk') ?? '', /Whoever gets into this Mac while Kišib is open and unlocked can sign/);
  await kp.click('[data-action="runner-on"]');
  await kp.waitForSelector('#status .k-error');
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  await kp.check('#risk-read');
  await kp.fill('#runner-pass', PASS);
  await kp.fill('#runner-pass-again', PASS);
  await kp.click('[data-action="runner-on"]');
  await kp.waitForSelector('#runner-state >> text=since');
  assert.ok(existsSync(join(k.dir, 'runner.json')));

  // An identity given to it: Identities, Held here.
  await kp.click('[data-tab="identities"]');
  await kp.waitForSelector('#form-give-runner');
  await kp.fill('#form-give-runner [name="id"]', a.id);
  await kp.fill('#form-give-runner [name="address"]', H[0]);
  await kp.fill('#form-give-runner [name="words"]', words);
  await kp.click('#form-give-runner button[type="submit"]');
  await kp.waitForSelector(`[data-held="${a.id}"]`);
  assert.match(await kp.textContent('.kishib-holds') ?? '', /Holds Max\s*runner on/);
  await shot(kp, 'mac-02-held');

  // Dub, holding no identity: its first screen, Use one from Kišib.
  const d = await dubBeside(k.dir);
  // Dub's policy frames Kišib's origin, then Damgar's (its money panel, since Damgar's round 3), and nothing else.
  const policy = (await fetch(`${d.app.base}/`)).headers.get('content-security-policy') ?? '';
  const framed = (/frame-src ([^;]*);/.exec(policy)?.[1] ?? '').split(' ');
  assert.deepEqual(framed.slice(0, 2), [k.app.base, k.app.base.replace('127.0.0.1', 'localhost')]);
  assert.deepEqual(framed.slice(2).map((o) => o.replace(/:\d+$/, '')), ['http://127.0.0.1', 'http://localhost'], 'Damgar’s origin, on this computer, and nothing else');
  const D = await open(`${d.app.base}/#pair=${d.app.access.newCode()}`);
  const dp = D.page;
  await dp.waitForSelector('#from-kishib');
  await dp.click('#from-kishib [data-k-add="kishib"]');
  await dp.click('[data-action="runner-pair"]');
  const code = (await dp.textContent('#runner-code'))!.trim();
  assert.match(code, /^[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  await shot(dp, 'mac-03-dub-code');
  // Approved in Kišib, comparing the code.
  await kp.click('[data-tab="runner"]');
  await kp.click('[data-k-col="apps"]');
  await kp.waitForSelector(`.kishib-app >> text=${code}`);
  await shot(kp, 'mac-04-approve');
  await kp.click('[data-action="approve"]');
  await kp.waitForSelector('[data-app] >> text=Revoke');
  await dp.click('[data-action="runner-look"]');
  await dp.click(`[data-action="runner-take"][data-id="${a.id}"]`);
  await dp.waitForSelector('.k-me');

  // A post, through the runner: Kišib's panel drawn inside Dub's window.
  await dp.fill('#post textarea', 'Through Kišib’s runner.');
  await dp.click('#post button[type="submit"]');
  const frame = await dp.waitForSelector('.k-frame.k-kishib iframe');
  assert.match(await dp.textContent('.k-frame .k-by') ?? '', /Drawn by Kišib · Dub cannot read or change this frame/);
  assert.equal(await frame.getAttribute('sandbox'), 'allow-scripts allow-forms');
  const fl = dp.frameLocator('.k-frame iframe');
  await fl.locator('text=Dub asks Kišib to sign a post').waitFor();
  await fl.locator('text=“Through Kišib’s runner.”').waitFor();
  // Unreadable from Dub: its document is not Dub's to read, and its address answers Dub's page nothing.
  const reads = await dp.evaluate(async () => {
    const f = document.querySelector<HTMLIFrameElement>('.k-frame iframe')!;
    let doc = 'readable';
    try {
      doc = f.contentDocument ? 'readable' : 'null';
    } catch {
      doc = 'refused';
    }
    let fetched = 'read';
    try {
      await (await fetch(f.src)).text();
    } catch {
      fetched = 'refused';
    }
    return { doc, fetched };
  });
  assert.deepEqual(reads, { doc: 'null', fetched: 'refused' });
  // Refused twice over: Dub's own policy lets its page connect to nothing but Dub's program, and Kišib answers no other origin.
  assert.ok(D.errors.length && D.errors.every((x) => /Content Security Policy/.test(x)), D.errors.join('\n'));
  D.errors.splice(0);
  await shot(dp, 'mac-05-panel');
  await fl.locator('button:has-text("Sign it")').click();
  await dp.waitForSelector('.k-frame', { state: 'detached' });
  await dp.waitForSelector('.k-act >> text=Through Kišib’s runner.');

  // A standing yes for Dub's posts, from the panel's box; then a post with no panel.
  await dp.fill('#post textarea', 'With a standing yes given.');
  await dp.click('#post button[type="submit"]');
  await fl.locator('text=Always yes for Dub’s posts and replies').click();
  await fl.locator('button:has-text("Sign it")').click();
  await dp.waitForSelector('.k-act >> text=With a standing yes given.');
  await dp.fill('#post textarea', 'No panel this time.');
  await dp.click('#post button[type="submit"]');
  await dp.waitForSelector('.k-act >> text=No panel this time.');
  assert.equal(await dp.$('.k-frame'), null, 'signed under the standing yes, no panel');

  // An agreement (relying on someone's act) always asks: the panel closed, answered in Kišib's Waiting.
  const relying = d.c.ask<{ lines: { text: string }[] }>('rely', { id: theirs, signer: other.id, typed: 'RELY' });
  // (asked by Dub's program; the page shows the panel only for its own requests, so it is answered in Kišib)
  await kp.click('[data-k-col="waiting"]');
  await kp.waitForSelector('.kishib-wait >> text=Dub asks Kišib to sign an agreement act');
  assert.equal(await kp.$('.kishib-wait [data-always]'), null, 'no standing yes is offered for an agreement');
  await shot(kp, 'mac-06-waiting');
  await kp.click('.kishib-wait [data-action="answer"][data-yes="1"]');
  assert.match((await relying).lines[0].text, /You rely on/);

  // Money always asks: a tip prepared for Damgar, its panel without a box for a standing yes; the panel closed, then declined.
  const unit = (await d.c.ask<{ units: { hash: string }[] }>('state')).units[0].hash;
  const paying = d.c.ask('pay', { how: 'damgar', kind: 'tip', signer: other.id, post: theirs, value: '10', unit, whatFor: 'a tip' }).then(
    () => 'signed',
    (e: Error) => e.message,
  );
  await kp.waitForSelector('.kishib-wait >> text=Dub asks Kišib to sign a money act');
  assert.equal(await kp.$('.kishib-wait [data-always]'), null);
  await kp.click('.kishib-wait [data-action="answer"][data-yes="0"]');
  assert.match(await paying, /Declined in Kišib/);

  // A panel closed in Dub: Kišib still waits, in Dub's note and in Kišib; shown again from Dub, and signed.
  await dp.keyboard.press('Escape');
  await dp.fill('#post textarea', '@');
  await dp.fill('#post textarea', 'Asked again, after a closed panel.');
  await kp.click('[data-tab="runner"]');
  await kp.click('[data-k-col="apps"]');
  await kp.click('[data-action="yes"][data-kind="posts"][data-on="0"]');
  await dp.click('#post button[type="submit"]');
  await dp.waitForSelector('.k-frame iframe');
  await dp.click('.k-frame .k-round');
  await dp.waitForSelector('#status >> text=Kišib waits for your answer');
  await kp.click('[data-k-col="waiting"]');
  await kp.waitForSelector('.kishib-wait >> text=Asked again, after a closed panel.');
  await dp.click('[data-action="runner-again"]');
  await fl.locator('button:has-text("Sign it")').click();
  await dp.waitForSelector('.k-act >> text=Asked again, after a closed panel.');

  // What it signed: each act a card, with the kit's two menus; no Rely or Anchor in Kišib.
  await kp.click('[data-k-col="signed"]');
  await kp.waitForSelector('#signed .k-act');
  assert.ok((await kp.$$('#signed .k-act')).length >= 5);
  await kp.locator('#signed .k-act').first().locator('.k-actid').click();
  const menu = await kp.textContent('.k-pop');
  assert.match(menu ?? '', /Copy act ID/);
  assert.match(menu ?? '', /Why it’s valid/);
  assert.doesNotMatch(menu ?? '', /Rely on it|Anchor it/);
  await kp.click('.k-pop [data-k-item="why"]');
  await kp.waitForSelector('.k-modal >> text=Valid');
  await shot(kp, 'mac-07-signed');
  await kp.keyboard.press('Escape');

  // Every post signed through the runner is valid for any reader.
  for (const t of ['Through Kišib’s runner.', 'No panel this time.']) {
    const id = await dp.locator('.k-act', { hasText: t }).getAttribute('data-k-act');
    assert.equal(await standing(id!, a.id, [...H, relay.base]), 'valid');
  }

  // An unpaired origin, refused by the slot: nothing is drawn.
  await dp.route(`${d.app.base}/api`, async (route) => {
    const body = JSON.parse(route.request().postDataBuffer()!.toString('utf8')) as { op: string };
    if (body.op !== 'runner asking') return route.continue();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: { asking: { request: 'a'.repeat(64), panel: 'http://127.0.0.1:9/elsewhere', title: 'Elsewhere asks' }, origin: k.app.base } }) });
  });
  await dp.fill('#post textarea', 'An origin not Kišib’s.');
  await dp.click('#post button[type="submit"]');
  await dp.waitForSelector('#status >> text=is not Kišib’s');
  assert.equal(await dp.$('.k-frame'), null, 'nothing drawn for an origin not Kišib’s');
  await dp.unroute(`${d.app.base}/api`);
  await d.c.ask('runner asking');
  const pend = (await k.c.ask<{ waiting: { request: string }[] }>('runner state')).waiting;
  for (const w of pend) await k.c.ask('runner answer', { request: w.request, yes: false });

  // The panel refused in another page's frame: framed only by the origin of the pairing that asked.
  const asking = d.c.ask('post', { text: 'Framed elsewhere?' }).catch(() => null);
  let panel = '';
  for (let i = 0; i < 100 && !panel; i++) {
    panel = (await d.c.ask<{ asking: { panel: string } | null }>('runner asking')).asking?.panel ?? '';
    await new Promise((r) => setTimeout(r, 50));
  }
  const evil = createServer((_q, s) => {
    s.writeHead(200, { 'content-type': 'text/html' });
    s.end(`<!doctype html><iframe src="${panel}" sandbox="allow-scripts allow-forms"></iframe>`);
  });
  await new Promise<void>((r) => evil.listen(0, '127.0.0.1', r));
  const E = await open(`http://127.0.0.1:${(evil.address() as { port: number }).port}/`);
  await E.page.waitForTimeout(800);
  const inner = E.page.frames().find((f) => f !== E.page.mainFrame());
  const text = inner ? await inner.evaluate(() => document.body?.innerText ?? '').catch(() => '') : '';
  assert.doesNotMatch(text, /Sign it/, 'the panel is not shown in another page’s frame');
  await E.context.close();
  evil.close();
  for (const w of (await k.c.ask<{ waiting: { request: string }[] }>('runner state')).waiting) await k.c.ask('runner answer', { request: w.request, yes: false });
  await asking;

  // At a phone's size, the panel inside Dub's window.
  const P = await open(`${d.app.base}/#pair=${d.app.access.newCode()}`, { width: 390, height: 844 });
  await P.page.waitForSelector('#post textarea');
  await P.page.fill('#post textarea', 'From the phone’s size.');
  await P.page.click('#post button[type="submit"]');
  await P.page.frameLocator('.k-frame iframe').locator('text=Dub asks Kišib to sign a post').waitFor();
  await shot(P.page, 'phone-01-panel');
  await P.page.frameLocator('.k-frame iframe').locator('button:has-text("Sign it")').click();
  await P.page.waitForSelector('.k-act >> text=From the phone’s size.');
  await P.context.close();

  // Revoked in Kišib: Dub refused.
  await kp.click('[data-k-col="apps"]');
  await kp.click('[data-action="revoke"]');
  await kp.click('[data-k-ask-yes]');
  await kp.waitForSelector('text=No app is paired');
  await dp.fill('#post textarea', 'After the revocation.');
  await dp.click('#post button[type="submit"]');
  await dp.waitForSelector('#status >> text=no longer knows this app');

  // Turned off: every key gone, Kišib's folder read whole.
  await kp.click('[data-k-col="onoff"]');
  await kp.click('[data-action="runner-off"]');
  await kp.click('[data-k-ask-yes]');
  await kp.waitForSelector('#risk');
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  const all = everything(join(k.dir, '..'));
  for (const f of [hex(fromWords(words)), words, a.id]) assert.ok(!all.includes(f), 'nothing of the runner remains');
  assert.match(await kp.textContent('.kishib-holds') ?? '', /Holds nothing\s*runner off/);
  await shot(kp, 'mac-08-off-again');

  assert.deepEqual(K.errors, []);
  assert.deepEqual(D.errors, []);
  await K.context.close();
  await D.context.close();
});


test('draft 2 by clicks: the passphrase typed twice, a message read through Kišib, Kišib closed and opened again, “Runner locked”, the passphrase given, Dub signing again without pairing, off erasing everything', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  await a.c.ask('name', { name: 'Max' });
  const other = await dub(H, [relay.base]);
  await other.c.ask('name', { name: 'River' });

  let k = await kishib();
  let K = await open(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  let kp = K.page;
  await kp.waitForSelector('.k-tile');
  await kp.click('[data-k-tile="runner"]');
  // The passphrase chosen, typed twice: two that differ refused, the runner still off.
  await kp.check('#risk-read');
  await kp.fill('#runner-pass', PASS);
  await kp.fill('#runner-pass-again', 'not the same passphrase');
  await kp.click('[data-action="runner-on"]');
  await kp.waitForSelector('#status >> text=typed twice differs');
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  await shot(kp, 'd2-01-passphrase');
  await kp.fill('#runner-pass', PASS);
  await kp.fill('#runner-pass-again', PASS);
  await kp.click('[data-action="runner-on"]');
  await kp.waitForSelector('#runner-state >> text=since');
  assert.equal(await kp.inputValue('#runner-pass').catch(() => ''), '');
  await kp.click('[data-tab="identities"]');
  await kp.fill('#form-give-runner [name="id"]', a.id);
  await kp.fill('#form-give-runner [name="address"]', H[0]);
  await kp.fill('#form-give-runner [name="words"]', words);
  await kp.click('#form-give-runner button[type="submit"]');
  await kp.waitForSelector(`[data-held="${a.id}"]`);

  // Dub paired, approved in Kišib with “may open what is sealed to this identity”.
  const d = await dubBeside(k.dir);
  const D = await open(`${d.app.base}/#pair=${d.app.access.newCode()}`);
  const dp = D.page;
  await dp.click('#from-kishib [data-k-add="kishib"]');
  await dp.click('[data-action="runner-pair"]');
  const code = (await dp.textContent('#runner-code'))!.trim();
  await kp.click('[data-tab="runner"]');
  await kp.click('[data-k-col="apps"]');
  await kp.waitForSelector(`.kishib-app >> text=${code}`);
  assert.equal(await kp.isChecked('.kishib-app input[name="open"]'), false, 'off unless chosen');
  await kp.check('.kishib-app input[name="open"]');
  await shot(kp, 'd2-02-approve-open');
  await kp.click('[data-action="approve"]');
  await kp.waitForSelector('[data-open] button.k-on:has-text("Yes")');
  await dp.click('[data-action="runner-look"]');
  await dp.click(`[data-action="runner-take"][data-id="${a.id}"]`);
  await dp.waitForSelector('.k-me');

  // River writes to Max privately: read in Dub, through Kišib.
  await other.c.ask('message', { to: a.id, text: 'A word for Max, sealed.' });
  await dp.locator('[data-k-part="private"]').click();
  await dp.locator('[data-conv]', { hasText: 'River' }).click({ timeout: 60_000 });
  await dp.locator('#thread .k-act', { hasText: 'A word for Max, sealed.' }).waitFor({ timeout: 60_000 });
  await shot(dp, 'd2-03-dub-private');
  // Listed in Kišib's Signed, as an opening.
  await kp.click('[data-k-col="signed"]');
  await kp.waitForSelector('#signed .k-act >> text=Opened for Dub: a private message');
  assert.match(await kp.locator('#signed .k-act', { hasText: 'Opened for Dub' }).first().innerText(), /opened, nothing signed/);
  await shot(kp, 'd2-04-signed-opened');

  // Kišib closed, and opened again: “Runner locked” top right; its first screen asks the passphrase.
  await K.context.close();
  k = await kishibAgain(k);
  K = await open(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  kp = K.page;
  await kp.waitForSelector('#form-unlock');
  assert.match(await kp.textContent('.kishib-holds') ?? '', /Runner locked/);
  await shot(kp, 'd2-05-locked');
  // Meanwhile Dub is told plainly.
  await dp.locator('[data-k-part="public"]').click();
  await dp.fill('#post textarea', 'While Kišib is locked.');
  await dp.click('#post button[type="submit"]');
  await dp.waitForSelector('#status >> text=Kišib is locked');
  await shot(dp, 'd2-06-dub-locked');
  // A wrong passphrase: nothing opened.
  await kp.fill('#form-unlock [name="passphrase"]', 'not the passphrase');
  await kp.click('#form-unlock button[type="submit"]');
  await kp.waitForSelector('#status >> text=does not open');
  assert.match(await kp.textContent('.kishib-holds') ?? '', /Runner locked/);
  await kp.fill('#form-unlock [name="passphrase"]', PASS);
  await kp.click('#form-unlock button[type="submit"]');
  await kp.waitForSelector('.kishib-holds >> text=Holds Max');
  // Dub signs again, never paired again.
  await dp.fill('#post textarea', 'After Kišib was opened again.');
  await dp.click('#post button[type="submit"]');
  await dp.frameLocator('.k-frame iframe').locator('button:has-text("Sign it")').click();
  await dp.waitForSelector('.k-act >> text=After Kišib was opened again.');
  const id = await dp.locator('.k-act', { hasText: 'After Kišib was opened again.' }).getAttribute('data-k-act');
  assert.equal(await standing(id!, a.id, [...H, relay.base]), 'valid');

  // Turned off: said as erasing everything; Kišib's folder holding nothing of it.
  await kp.click('[data-k-tile="runner"]');
  // Lock now and Quit Kišib, on the page as in the seal (draft 3: "accessible from both").
  await kp.locator('#quit-box [data-action="runner-lock"]', { hasText: 'Lock now' }).waitFor();
  await kp.locator('#quit-box [data-action="quit"]', { hasText: 'Quit Kišib' }).waitFor();
  assert.match(await kp.textContent('#quit-box') ?? '', /Closing Kišib’s window does not end it/);
  assert.match(await kp.textContent('.k-box:has(h3:has-text("Turn it off"))') ?? '', /erases everything/);
  await kp.click('[data-action="runner-off"]');
  // Asked in the page, never the browser's own dialog (H90).
  assert.match(await kp.locator('[data-k-ask]').innerText(), /erases everything/);
  await kp.click('[data-k-ask-yes]');
  await kp.waitForSelector('#risk');
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
  const all = everything(join(k.dir, '..'));
  for (const f of [hex(fromWords(words)), words, a.id]) assert.ok(!all.includes(f), 'nothing of the runner remains');
  await shot(kp, 'd2-07-off');

  assert.deepEqual(K.errors, []);
  assert.deepEqual(D.errors, []);
  await K.context.close();
  await D.context.close();
});

test('H90: Off on Kišib’s page turns the runner off (asked in the page), runner.json gone, the seal hollow; and the page follows what the seal does: Lock now, Turn off, Quit', async () => {
  const k = await kishib();
  await k.c.ask('runner on', { read: true, passphrase: PASS, again: PASS });
  const K = await open(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  const kp = K.page;
  kp.on('dialog', () => assert.fail('no browser dialog: every question is asked in the page'));
  await kp.click('[data-k-tile="runner"]');
  await kp.click('[data-k-col="onoff"]');
  // The segmented Off: the same question, asked at once.
  await kp.locator('.kishib-seg button', { hasText: 'Off' }).click();
  await kp.locator('[data-k-ask]', { hasText: 'erases everything' }).waitFor();
  await shot(kp, 'h90-01-off-asked');
  await kp.click('[data-k-ask-yes]');
  await kp.waitForSelector('#risk');
  assert.ok(!existsSync(join(k.dir, 'runner.json')), 'runner.json gone');
  const run = JSON.parse(readFileSync(join(k.dir, 'run.json'), 'utf8')) as { port: number };
  const seal = async (p: string, method = 'GET') => {
    const { token } = JSON.parse(readFileSync(join(k.dir, 'seal.json'), 'utf8')) as { token: string };
    return (await (await fetch(`http://127.0.0.1:${run.port}${p}`, { method, headers: { 'mor-seal': token } })).json()) as { state: string };
  };
  assert.equal((await seal('/seal/state')).state, 'off', 'the seal hollow');
  assert.match(await kp.textContent('.kishib-holds') ?? '', /runner off/);

  // On again, then locked from the seal: the page follows without a refresh, on whatever screen it shows.
  await k.c.ask('runner on', { read: true, passphrase: PASS, again: PASS });
  await kp.locator('.kishib-holds', { hasText: /Holds/ }).waitFor();
  await kp.click('[data-action="home-tiles"]').catch(() => undefined);
  // H111: the Runner tile shows the menu bar's seal, filled while on.
  await kp.locator('[data-k-tile="runner"] svg path[fill="currentColor"]').waitFor({ timeout: 15_000 });
  await seal('/seal/lock', 'POST');
  await kp.locator('#unlock, form#unlock, [data-runner-state="locked"], .kishib-holds:has-text("locked")').first().waitFor({ timeout: 15_000 }).catch(async () => {
    assert.match(await kp.locator('body').innerText(), /[Ll]ocked/);
  });
  assert.match(await kp.locator('body').innerText(), /[Ll]ocked/);
  await kp.click('[data-action="home-tiles"]').catch(() => undefined);
  // H111: a padlock while locked.
  await kp.locator('[data-k-tile="runner"] svg rect').waitFor({ timeout: 15_000 });
  await shot(kp, 'h90-02-locked-from-the-seal');
  // Turned off from the seal: the page says off.
  await seal('/seal/off', 'POST');
  await kp.waitForFunction(() => /runner off/.test(document.querySelector('.kishib-holds')?.textContent ?? ''), undefined, { timeout: 15_000 });
  // H111: hollow while off.
  if (await kp.locator('[data-k-tile="runner"]').count()) assert.equal(await kp.locator('[data-k-tile="runner"] svg path[fill="currentColor"], [data-k-tile="runner"] svg rect').count(), 0);
  // Quit from the seal: the page says Kišib has quit.
  await k.c.ask('runner on', { read: true, passphrase: PASS, again: PASS });
  await kp.waitForFunction(() => !/runner off/.test(document.querySelector('.kishib-holds')?.textContent ?? ''), undefined, { timeout: 15_000 });
  await seal('/seal/quit', 'POST');
  await kp.locator('#quit-done', { hasText: 'Kišib has quit' }).waitFor({ timeout: 20_000 });
  await shot(kp, 'h90-03-quit-from-the-seal');
  assert.deepEqual(K.errors.filter((e) => !/Failed to fetch|NetworkError|ERR_CONNECTION_REFUSED/.test(e)), []);
  await K.context.close();
});
