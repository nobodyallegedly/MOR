// Names, contacts and short IDs in Ummia, in a real browser (headless
// Chromium, a fresh profile), by clicks and typing alone, against real homes
// and a relay on local ports (hand test v3):
//
// - H88: a named identity brought into Ummia; the end of bringing it, and
//   the identity panel, show its ID whole with Copy ID and Share your ID link;
// - H96, H106: the top right and the identity panel say its published name,
//   never a bare `mid1…`;
// - H100, H109: Contacts top left, the one list: a contact added by its ID
//   with a nickname, then seen in Look's "my contacts", by its nickname and
//   the name it published;
// - H119: the Contacts button beside "a single ID" fills the field;
// - H121: no short `mid1…` or `mact1…` shown without its tap; a tap shows it
//   whole, a second copies it.
//
// Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright-core';
import { idForm } from '../../genesis/src/forms.ts';
import type { Done, Review } from '../src/shapes.ts';
import { closeAll, developer, dub, start, ummia, type Relay } from './world.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let homes: Relay[];
let relay: Relay;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(url).origin });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  return page;
}

/** Wait for an element, or fail at once with what the page said. */
async function sees(page: Page, selector: string, timeout = 90_000) {
  const err = page.locator('#status .k-note.k-error');
  await Promise.race([page.locator(selector).first().waitFor({ timeout }), err.waitFor({ timeout }).then(async () => assert.fail(await err.innerText()))]);
}

/** Every short `mid1…`/`mact1…` shown, outside the kit's buttons for it (its own short-ID button, and the menus' buttons on cards, top right and in the panel). */
const bareShortIds = (page: Page) =>
  page.evaluate(() => {
    const SHORT = /\bm(?:id|act)1[0-9a-z]{3}…[0-9a-z]{3}\b/;
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement!;
      if (!SHORT.test(n.textContent ?? '')) continue;
      if (el.closest('.k-idbtn, .k-signer, .k-actid, .k-me, .k-idrow')) continue;
      if (!(el as HTMLElement).offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      out.push(`${el.outerHTML.slice(0, 200)}`);
    }
    return out;
  });

test('Ummia: a named identity, Contacts top left with a nickname, the Contacts button, own ID, and every short ID a tap away', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  // Bo: a developer with a published name and a specification on the relay.
  const bo = await developer(H, R);
  await bo.dub.c.ask('name', { name: 'Bo Published' });
  const r = await bo.ummia.c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Names test, draft 1\n\nFor the contacts.', types: '0 seen seen = tstr' });
  await bo.ummia.c.ask<Done>('confirm', { plan: r.plan, digest: r.digest });
  // Ada: made and named in Dub, brought into Ummia by clicks.
  const ada = await dub(H, R);
  await ada.c.ask('name', { name: 'Ada Test' });
  const u = await ummia();
  const page = await open(`${u.app.base}/#pair=${u.app.access.newCode()}`);
  await sees(page, 'form#bring');
  await page.locator('form#bring [name=id]').fill(ada.id);
  await page.locator('form#bring [name=words]').fill(ada.words);
  await page.locator('form#bring [name=address]').fill(H[0]);
  await page.getByRole('button', { name: 'Bring it' }).click();
  await sees(page, '.k-tile');

  // H88: the end of bringing it: its ID whole, Copy ID, Share your ID link.
  const adaForm = idForm(ada.id);
  const end = page.locator('#status [data-k-ownid]');
  await end.waitFor();
  assert.equal((await end.locator('.k-idwhole').innerText()).trim(), adaForm);
  assert.deepEqual(await end.locator('button').allInnerTexts(), ['Copy ID', 'Share your ID link']);
  assert.match((await end.locator('[data-k-share]').getAttribute('data-k-share'))!, new RegExp(`^${adaForm}\\?`), 'the ID link carries where it lives');

  // H96: the top right says its published name, not a bare mid1….
  assert.equal((await page.locator('.k-me .k-n').innerText()).trim(), 'Ada Test');
  // The panel: its name, its own ID with Copy ID and Share your ID link (H88).
  await page.locator('[data-k-open="identity"]').click();
  const panel = page.locator('[data-k-panel="identity"]');
  await panel.waitFor();
  assert.match(await panel.locator('.k-idrow.k-on .k-names').innerText(), /Ada Test/);
  assert.equal((await panel.locator('[data-k-ownid] .k-idwhole').innerText()).trim(), adaForm);
  assert.deepEqual(await panel.locator('[data-k-ownid] button').allInnerTexts(), ['Copy ID', 'Share your ID link']);
  assert.deepEqual(await bareShortIds(page), [], 'the identity panel');
  await panel.locator('[data-k-close]').click();

  // H100, H109: Contacts top left; Bo added by its ID, with a nickname.
  const boForm = idForm(bo.id);
  await page.locator('.k-top [data-k-open="contacts"]').click();
  const contacts = page.locator('[data-k-panel="contacts"]');
  await contacts.waitFor();
  await contacts.locator('[name="contact-id"]').fill(boForm);
  await contacts.locator('[name="contact-nick"]').fill('Bobby');
  await contacts.getByRole('button', { name: 'Add to contacts' }).click();
  await sees(page, '#status .k-done');
  await page.locator('[data-k-panel="contacts"]', { hasText: 'Bobby' }).waitFor();
  assert.match(await page.locator('[data-k-panel="contacts"]').innerText(), /Bo Published/, 'its published name beside the nickname');
  await page.locator('[data-k-panel="contacts"] [data-k-close]').click();

  // The one list in Look's "my contacts": Bo's specification, by its nickname and its published name.
  await page.locator('.k-tile', { hasText: 'Look' }).click();
  await sees(page, '.k-col');
  await page.locator('[data-k-point="contacts"]').click();
  const boCard = page.locator('#look-feed .k-act', { hasText: 'Names test' }).first();
  await boCard.waitFor({ timeout: 90_000 });
  await page.waitForFunction(() => /Bobby/.test(document.querySelector('#look-feed .k-act .k-signer .k-names')?.textContent ?? ''));
  assert.match(await boCard.locator(':scope > .k-signer .k-names').innerText(), /Bobby\s*Bo Published/);
  assert.match(await page.locator('#pane').innerText(), /your contacts|the people you follow/);

  // H121: no short ID without its tap; a tap shows one whole, a second copies it.
  assert.deepEqual(await bareShortIds(page), [], 'Look, my contacts');
  const hash = boCard.locator('.k-idbtn').first();
  const whole = (await hash.getAttribute('data-k-idform'))!;
  assert.match((await hash.innerText()).trim(), /…/);
  await hash.click();
  assert.equal((await hash.innerText()).trim(), whole, 'one tap: whole');
  await hash.click();
  await page.waitForFunction((b) => b?.textContent === 'Copied', await hash.elementHandle());

  // H119: the Contacts button beside "a single ID" fills it.
  await page.locator('[data-k-point="id"]').click();
  await sees(page, 'form#look [name=value]');
  await page.locator('form#look [data-k-pick-for="value"]').click();
  const picker = page.locator('[data-k-picker]');
  await picker.waitFor();
  await picker.locator('[data-k-pick-find]').fill('bob');
  await picker.locator('[data-k-picked]', { hasText: 'Bobby' }).click();
  assert.equal(await page.locator('form#look [name=value]').inputValue(), boForm);
  await page.locator('form#look').getByRole('button', { name: 'Look' }).click();
  await page.locator('#look-feed .k-act', { hasText: 'Names test' }).first().waitFor({ timeout: 90_000 });
  assert.deepEqual(await bareShortIds(page), [], 'Look, a single ID');

  // A specification's page: its creator by their names, a tap away (H96, H106).
  await page.locator('#look-feed .k-act [data-spec]').first().click();
  await sees(page, '#spec-title');
  await page.locator('#pane .k-who .k-nick', { hasText: 'Bobby' }).first().waitFor();
  assert.deepEqual(await bareShortIds(page), [], 'a specification’s page');

  // The engine: the same list, by its operations.
  const list = await u.c.ask<{ contacts: { id: string; name: string | null }[]; problem: string | null }>('contacts');
  assert.deepEqual(list.contacts.map((c) => [c.id, c.name]), [[bo.id, 'Bobby']]);
  assert.equal(list.problem, null);
  assert.deepEqual(problems, []);
});
