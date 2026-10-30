// Names, contacts and short IDs in Damgar (hand test v3: H88, H96, H100,
// H106, H109, H119, H121), the program's page by clicks. Alice, made in Dub
// with a published name, is brought into Damgar: at the end of bringing, her
// ID whole with Copy ID and Share your ID link (H88); the top right and the
// identity panel say her published name, never a bare mid1… (H96). Bob,
// with a published name of his own, is added to the one contacts list in
// Damgar's top-left panel by his ID with a nickname (H100, H109); the
// nickname shows in the list, in the Contacts pop-up beside a field taking
// an ID (H119), and on the card of a payment to him (H96, H106). Every short
// ID is a button: one tap shows it whole, a second copies it (H121); no
// short mid1…/mact1… is shown anywhere without its tap. Real homes and a
// relay on local ports; test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';
import { closeAll, damgar, dub, start, type Relay, shows } from './world.ts';
import { TestNode } from './node.ts';
import { ACCEPTABLE, SPEC } from '../src/specs.ts';
import { idForm } from '../../genesis/src/forms.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;

let homes: Relay[];
let relay: Relay;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

// Every browser, app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await browser?.close().catch(() => undefined);
    await closeAll();
  } finally {
    for (const r of [...(homes ?? []), relay]) await r?.stop().catch(() => undefined);
  }
});

async function open(url: string): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  return { context, page };
}

const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `names-${name}.png`) });
};

/** Wait for an element, or fail at once with what the page said. */
async function sees(page: Page, selector: string, name: string, timeout = 60_000) {
  const err = page.locator('#status .k-note.k-error');
  try {
    await Promise.race([page.locator(selector).first().waitFor({ timeout }), err.waitFor({ timeout }).then(async () => assert.fail(await err.innerText()))]);
  } catch (e) {
    await shot(page, `failed-${name}`);
    console.error(`at ${name}:`, (await page.locator('body').innerText()).slice(-1500));
    throw e;
  }
}

/** Open a part by the tiles and the column; wait until it is filled in (H115). */
async function go(page: Page, tab: string, part: string) {
  await page.locator('[data-action="home-tiles"]').click();
  await page.locator(`[data-k-tile="${tab}"]`).click();
  await sees(page, '.k-opened', tab);
  const label = (await page.locator(`.k-col [data-k-col="${part}"]`).innerText()).split('\n')[0].replace(/^\+ /, '').trim();
  await page.locator(`.k-col [data-k-col="${part}"]`).click();
  await sees(page, `#pane h2:text-is("${label}")`, `${tab}-${part}`);
  await page.locator('#pane .damgar-looking').waitFor({ state: 'detached', timeout: 60_000 });
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].some((b) => b.disabled), undefined, { timeout: 60_000 });
}

/**
 * H121's scan: every text showing a short `mid1…` or `mact1…` must be inside
 * a button that shows it whole or copies it: the kit's ID button, or the
 * card's signer and act buttons (each opening its menu, Copy ID first). The
 * kit's own subtitles under a name in the top right, the identity panel's
 * rows and the contacts' rows are listed apart (they are the kit's, each a
 * button of its own, the ID whole a tap away): reported, not hidden.
 */
async function bareShortIds(page: Page): Promise<{ bare: string[]; kits: string[] }> {
  return page.evaluate(() => {
    const SHORT = /\bm(?:id|act)1\w{3}…\w{3}\b/;
    const bare: string[] = [];
    const kits: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.textContent ?? '';
      if (!SHORT.test(t)) continue;
      const el = n.parentElement!;
      if (!el.getClientRects().length) continue;
      if (el.closest('.k-idbtn, .k-signer, .k-actid')) continue;
      if (el.closest('.k-me, .k-idrow, [data-k-picker]')) kits.push(t.trim());
      else bare.push(`${t.trim()} in <${el.tagName.toLowerCase()} class="${el.className}">`);
    }
    return { bare, kits };
  });
}

/** Every ID button in view: one tap shows it whole; the first, tapped again, is copied. */
async function tapsShowWhole(page: Page, where: string): Promise<number> {
  const r = await page.evaluate(() => {
    const out: string[] = [];
    const bs = [...document.querySelectorAll<HTMLButtonElement>('.k-idbtn')].filter((b) => b.getClientRects().length);
    for (const b of bs) {
      b.click();
      if (b.textContent !== b.dataset.kIdform) out.push(`${b.dataset.kIdform} shown as ${b.textContent}`);
    }
    return { n: bs.length, wrong: out };
  });
  assert.deepEqual(r.wrong, [], `${where}: every short ID shown whole on one tap`);
  return r.n;
}

test('H88, H96, H100, H106, H109, H119, H121: Damgar shows names, keeps the one contacts list, and every short ID is a button', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const node = new TestNode();
  // Bob: paid at his node, his name published in Dub.
  const bobD = await damgar();
  const bob = await dub(H, R, { damgar: bobD.dir });
  await bobD.c.ask('bring', { id: bob.id, words: bob.words, address: H[0] });
  await bobD.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const rv = await bobD.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bobD.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await bob.c.ask('name', { name: 'Bob Test' });
  // Alice: made in Dub, her name published there.
  const ad = await damgar();
  const alice = await dub(H, R, { damgar: ad.dir });
  await alice.c.ask('name', { name: 'Alice Test' });

  const { context, page } = await open(`${ad.app.base}/#pair=${ad.app.access.newCode()}`);
  await sees(page, 'form#bring', 'first screen');
  // H119: the field taking an ID has its Contacts button beside it, in the same form.
  assert.equal(await page.locator('form#bring [data-k-pick-for="id"]').count(), 1);
  await page.locator('form#bring [name=id]').fill(alice.id);
  await page.locator('form#bring [name=words]').fill(alice.words);
  await page.locator('form#bring [name=address]').fill(H[0]);
  await page.getByRole('button', { name: 'Bring it' }).click();

  // H88: at the end of bringing, its ID whole, with Copy ID and Share your ID link.
  await sees(page, '.damgar-first [data-k-ownid], #status [data-k-ownid]', 'own ID after bringing');
  const own = page.locator('.damgar-first [data-k-ownid], #status [data-k-ownid]').first();
  assert.equal(await own.locator('.k-idwhole').innerText(), idForm(alice.id));
  assert.equal(await own.locator('[data-k-copy-id]').innerText(), 'Copy ID');
  assert.equal(await own.locator('[data-k-share]').innerText(), 'Share your ID link');
  assert.ok((await own.locator('[data-k-share]').getAttribute('data-k-share'))!.startsWith(idForm(alice.id)), 'the ID link begins with the ID');
  await shot(page, '01-brought');

  // The rules, all of them, by clicks.
  await sees(page, 'form#accept', 'accept');
  for (const box of await page.locator('input[name=accept]').all()) await box.check();
  await page.getByRole('button', { name: 'Add these to my list' }).click();
  await sees(page, '.k-tile', 'tiles');

  // H96: the top right says her published name, never a bare mid1… in its place.
  await page.waitForFunction(() => document.querySelector('.k-me .k-n')?.textContent === 'Alice Test', undefined, { timeout: 60_000 });
  // H100: Contacts, top left.
  assert.equal(await page.locator('.k-top [data-k-open="contacts"]').count(), 1);

  // The identity panel: her name; the one in use with its ID whole, Copy ID and Share your ID link (H88).
  await page.locator('[data-k-open="identity"]').click();
  const panel = page.locator('[data-k-panel="identity"]');
  await panel.waitFor();
  await shows(panel.locator('.k-idrow.k-on'), /Alice Test/);
  assert.equal(await panel.locator('[data-k-ownid] .k-idwhole').innerText(), idForm(alice.id));
  await panel.locator('[data-k-ownid] [data-k-copy-id]').click();
  await page.waitForFunction(() => document.querySelector('[data-k-panel="identity"] [data-k-copy-id]')?.textContent === 'Copied');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), idForm(alice.id));
  assert.equal(await panel.locator('[data-k-ownid] [data-k-share]').innerText(), 'Share your ID link');
  await shot(page, '02-identity-panel');
  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'detached' });

  // H100, H109: Bob added to the one contacts list by his ID, with a nickname.
  await page.locator('[data-k-open="contacts"]').click();
  const contacts = page.locator('[data-k-panel="contacts"]');
  await contacts.waitFor();
  await contacts.locator('[name="contact-id"]').fill(idForm(bob.id));
  await contacts.locator('[name="contact-nick"]').fill('Bobby');
  await contacts.getByRole('button', { name: 'Add to contacts' }).click();
  const row = page.locator(`[data-k-panel="contacts"] [data-k-contact="${bob.id}"]`);
  await sees(page, `[data-k-panel="contacts"] [data-k-contact="${bob.id}"]`, 'contact added');
  // The nickname first, the name he published beside it, faint (H96).
  await page.waitForFunction((id) => document.querySelector(`[data-k-contact="${id}"] .k-pub`)?.textContent === 'Bob Test', bob.id, { timeout: 60_000 });
  assert.equal(await row.locator('.k-nick').innerText(), 'Bobby');
  assert.ok(await row.locator('[data-k-nick]').isVisible(), 'Nickname… on each contact (H109)');
  await shot(page, '03-contacts');
  await page.keyboard.press('Escape');
  await contacts.waitFor({ state: 'detached' });

  // H119: the Contacts button beside a field taking an ID (Lanes, In force: the clock for lanes); choosing Bob fills it.
  await go(page, 'lanes', 'in-force');
  await page.locator('form#clock [name=clock]').fill('');
  await page.locator('form#clock [data-k-pick-for="clock"]').click();
  const pick = page.locator('[data-k-picker] [data-k-picked]', { hasText: 'Bobby' });
  await pick.waitFor();
  await shot(page, '04-picker');
  await pick.click();
  assert.equal(await page.locator('form#clock [name=clock]').inputValue(), idForm(bob.id));

  // H96, H106: where Bob appears, his nickname: a tip to him prepared and signed, its payment's card.
  const tip = await ad.c.ask<{ id: string }>('tip', { to: bob.id, value: '300', unit: SPEC.units.regtest, whatFor: 'for the names test' });
  await ad.c.ask('sign draft', { id: tip.id });
  await go(page, 'waiting', 'to-pay');
  await page.waitForFunction((id) => document.querySelector(`#pane [data-k-who="${id}"] .k-nick`)?.textContent === 'Bobby', bob.id, { timeout: 60_000 });
  // His own name comes from his profile at the homes, after the nickname kept here: waited for, not read once.
  await page.waitForFunction((id) => [...document.querySelectorAll(`#pane [data-k-who="${id}"]`)].some((x) => /Bob Test/.test((x as HTMLElement).innerText)), bob.id, { timeout: 60_000 });
  // The card's signer (Alice, paying): her name, not "No name".
  await page.waitForFunction(() => [...document.querySelectorAll('#pane .k-signer .k-names')].some((x) => x.textContent?.includes('Alice Test')), undefined, { timeout: 60_000 });
  await shot(page, '05-to-pay');

  // H121: no short ID without its tap, wherever looked; every ID button shows the ID whole on one tap.
  const looked: Record<string, string[]> = {};
  const scan = async (where: string) => {
    const r = await bareShortIds(page);
    assert.deepEqual(r.bare, [], `${where}: a short ID shown without its tap`);
    looked[where] = r.kits;
  };
  await scan('Waiting, To pay');
  let taps = await tapsShowWhole(page, 'Waiting, To pay');
  // A second tap copies it, "Copied" said.
  const first = page.locator(`#pane [data-k-who="${bob.id}"] .k-idbtn`).first();
  await first.click();
  await page.waitForFunction((id) => document.querySelector(`#pane [data-k-who="${id}"] .k-idbtn`)?.textContent === 'Copied', bob.id);
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), idForm(bob.id));
  for (const [tab, part] of [
    ['account', 'summary'],
    ['account', 'payments'],
    ['lanes', 'in-force'],
    ['settings', 'paid'],
  ] as const) {
    await go(page, tab, part);
    await scan(`${tab}, ${part}`);
    taps += await tapsShowWhole(page, `${tab}, ${part}`);
  }
  assert.ok(taps >= 2, `ID buttons tapped: ${taps}`);
  // The panels too: the identity panel, the contacts.
  await page.locator('[data-k-open="identity"]').click();
  await panel.waitFor();
  await scan('the identity panel');
  await page.keyboard.press('Escape');
  await page.locator('[data-k-open="contacts"]').click();
  await contacts.waitFor();
  await scan('the contacts');
  await page.keyboard.press('Escape');
  // The kit's own subtitles under a name (top right, the panels' rows), each a button whose tap leads to the ID whole: said, for the record.
  if (process.env.MOR_VERBOSE) console.log('kit subtitles seen:', looked);
  await context.close();
  assert.deepEqual(problems, []);
});
