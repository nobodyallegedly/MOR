// Names, contacts and short IDs in Edubba, as every app of the suite has them
// (hand test v3), in a real browser (headless Chromium), driven by clicks:
//
// - H88: at the end of bringing an identity, its ID whole, Copy ID and
//   Share your ID link; the identity panel shows them for the one in use.
// - H96, H106: the identity top right and in the panel by its names (the
//   name Edubba gives it, the name it published, faint), never a bare
//   `mid1…`; the founding grid's columns name their members.
// - H100: Edubba's own contacts from before are carried into the one list,
//   the people cMIP's, sealed at the identity's homes, once: taken out of
//   the list afterwards, a contact carried does not come back.
// - H109: Contacts top left: a contact added by ID with a nickname.
// - H119: a Contacts button beside a field taking IDs: the one chosen fills it.
// - H121: no short `mid1…` or `mact1…` shown without its tap; a tap shows it whole.
//
// Real homes and a relay on local ports. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { closeAll, dub, edubba, start, type Relay } from '../../damgar/test/world.ts';
import { shownId } from '../../genesis/src/shown.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let homes: Relay[];
let relay: Relay;
let browser: Browser;
let ana: Awaited<ReturnType<typeof dub>>;
let bo: Awaited<ReturnType<typeof dub>>;
let cy: Awaited<ReturnType<typeof dub>>;
let e: Awaited<ReturnType<typeof edubba>>;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  ana = await dub(H, R);
  await ana.c.ask('name', { name: 'Ana Published' });
  bo = await dub(H, R);
  await bo.c.ask('name', { name: 'Bo Published' });
  cy = await dub(H, R);
  e = await edubba(H, R);
  // Edubba's own list from before (H100): kept on the Mac, a name given here.
  await e.c.ask('real contact add', { id: bo.id, name: 'Bo from the Mac' });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(): Promise<Page> {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  page.on('pageerror', (err) => problems.push(err.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  await page.goto(`${e.app.base}/#pair=${e.app.access.newCode()}`);
  return page;
}

/** Every short `mid1…`, `mact1…` or fingerprint (`abcd1234…ef12`) shown that is no button to show it whole (H121): the kit's own pieces aside (the identity top right, the panel's and Contacts' rows, a card's signer and act ID), each opening what shows it whole. */
const bareShortIds = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.textContent ?? '';
      if (!/m(id|act)1[0-9a-z]{3}…[0-9a-z]{3}|[0-9a-f]{8}…[0-9a-f]{4}/.test(t)) continue;
      const el = n.parentElement!;
      if (el.closest('.k-idbtn, .k-me, .k-idrow, .k-signer, .k-actid')) continue;
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      out.push(`${el.tagName}.${el.className}: ${t.trim().slice(0, 80)}`);
    }
    return out;
  });

test('H88, H96, H100, H106, H109, H119, H121: Edubba’s names, its one contacts list, and every short ID a button', async () => {
  const page = await open();
  // Bringing an identity with a published name: its ID whole at the end, Copy ID and Share your ID link (H88).
  await page.locator('[data-add="bring"]').click();
  const form = page.locator('form#bring-identity');
  await form.waitFor();
  await form.locator('input[name=name]').fill('Ana here');
  await form.locator('input[name=id]').fill(shownId(ana.id));
  await form.locator('textarea[name=words]').fill(ana.words);
  await form.locator('input[name=address]').fill(homes[0].base);
  await form.locator('button[type=submit]').click();
  const own = page.locator('.k-status [data-k-ownid]');
  await own.waitFor({ timeout: 90_000 });
  assert.equal((await own.locator('.k-idwhole').innerText()).trim(), shownId(ana.id), 'its mid1… whole');
  assert.equal(await own.getByRole('button', { name: 'Copy ID' }).count(), 1);
  const share = own.getByRole('button', { name: 'Share your ID link' });
  assert.equal(await share.count(), 1);
  assert.ok((await share.getAttribute('data-k-share'))!.startsWith(shownId(ana.id)), 'the ID link carries the ID');

  // H96: the top right by its name, never a bare mid1…; the panel with the name it published beside, faint.
  const me = page.locator('.k-top .k-me .k-n');
  assert.equal((await me.innerText()).trim(), 'Ana here');
  await page.keyboard.press('Escape');
  await page.locator('[data-k-open="identity"]').click();
  const panel = page.locator('.k-panel[data-k-panel="identity"]');
  await panel.locator('.k-idrow.k-on .k-pub', { hasText: 'Ana Published' }).waitFor({ timeout: 60_000 });
  assert.match(await panel.locator('.k-idrow.k-on .k-nick').innerText(), /Ana here/);
  assert.doesNotMatch(await panel.locator('.k-idrow.k-on .k-names').innerText(), /mid1/);
  // H88: in the panel, the one in use with its ID whole, Copy ID and Share your ID link.
  assert.equal((await panel.locator('[data-k-ownid] .k-idwhole').innerText()).trim(), shownId(ana.id));
  assert.equal(await panel.locator('[data-k-ownid]').getByRole('button', { name: 'Share your ID link' }).count(), 1);
  assert.deepEqual(await bareShortIds(page), [], 'the panel: no short ID without its tap');
  await panel.locator('[data-k-close]').click();

  // H100: Contacts top left; Edubba's own list carried into the sealed list, its name kept as the nickname.
  await page.locator('[data-k-open="contacts"]').click();
  const contacts = page.locator('.k-panel[data-k-panel="contacts"]');
  await contacts.locator(`[data-k-contact="${bo.id}"] .k-nick`, { hasText: 'Bo from the Mac' }).waitFor({ timeout: 90_000 });
  await contacts.locator(`[data-k-contact="${bo.id}"] .k-pub`, { hasText: 'Bo Published' }).waitFor({ timeout: 60_000 });
  const carried = JSON.parse(readFileSync(join(e.dir, 'contacts-carried.json'), 'utf8')) as { done: boolean; into: Record<string, number> };
  assert.equal(carried.done, true, 'remembered as carried');
  assert.ok(carried.into[ana.id], 'carried into the identity in use');
  // Read from Ana's own Dub: the one list, sealed at her homes, holds it.
  const sealed = await e.c.ask<{ contacts: { id: string; name: string | null }[] }>('contacts', { fresh: true });
  assert.deepEqual(sealed.contacts.map((c) => [c.id, c.name]), [[bo.id, 'Bo from the Mac']]);

  // H109: added by ID with a nickname, in the panel.
  await contacts.locator('input[name=contact-id]').fill(shownId(cy.id));
  await contacts.locator('input[name=contact-nick]').fill('Cy nick');
  await contacts.getByRole('button', { name: 'Add to contacts' }).click();
  await page.locator(`.k-panel[data-k-panel="contacts"] [data-k-contact="${cy.id}"] .k-nick`, { hasText: 'Cy nick' }).waitFor({ timeout: 90_000 });

  // The carry does not repeat: Bo taken out of the list stays out, the panel opened again.
  await page.locator(`.k-panel[data-k-panel="contacts"] [data-k-contact-do="${bo.id}"]`).click();
  await page.locator('[data-k-ask-yes]').click();
  await page.locator(`.k-panel[data-k-panel="contacts"] [data-k-contact="${bo.id}"]`).waitFor({ state: 'detached', timeout: 90_000 });
  await page.locator('.k-panel[data-k-panel="contacts"] [data-k-close]').click();
  await page.locator('[data-k-open="contacts"]').click();
  await page.locator(`.k-panel[data-k-panel="contacts"] [data-k-contact="${cy.id}"]`).waitFor({ timeout: 60_000 });
  assert.equal(await page.locator(`.k-panel[data-k-panel="contacts"] [data-k-contact="${bo.id}"]`).count(), 0, 'not carried a second time');
  assert.deepEqual((await e.c.ask<{ contacts: { id: string }[] }>('contacts', { fresh: true })).contacts.map((c) => c.id), [cy.id]);
  assert.deepEqual((await e.c.ask<{ id: string }[]>('real contacts')).map((c) => c.id), [cy.id], 'Edubba reads the sealed list only');
  assert.ok(existsSync(join(e.dir, 'contacts.json')), 'its own list is left as it was, read no more');
  await page.locator('.k-panel[data-k-panel="contacts"] [data-k-close]').click();

  // H119: a Contacts button beside the founding's IDs; the one chosen fills the field.
  await page.locator('[data-k-tile="collectives"]').click();
  await page.locator('[data-k-col="found"]').click();
  const found = page.locator('form#real-found');
  await found.waitFor();
  await found.locator('[data-k-pick-for="typed"]').click();
  await page.locator(`[data-k-picker] [data-k-picked="${shownId(cy.id)}"]`).click();
  assert.equal((await found.locator('textarea[name=typed]').inputValue()).trim(), shownId(cy.id));
  // H106: the grid's columns name their members: the founder by her names, the one chosen by its nickname.
  const grid = page.locator('#e-grid-real-found');
  await grid.locator(`[data-k-who="${ana.id}"] .k-pub`, { hasText: 'Ana Published' }).waitFor({ timeout: 60_000 });
  await grid.locator(`[data-k-who="${cy.id}"] .k-nick`, { hasText: 'Cy nick' }).waitFor({ timeout: 60_000 });
  // The contacts to choose members from, by their names.
  await found.locator(`label.check [data-k-who="${cy.id}"] .k-nick`, { hasText: 'Cy nick' }).waitFor({ timeout: 60_000 });

  // H121: no short ID anywhere on the page without its tap; a tap shows it whole.
  assert.deepEqual(await bareShortIds(page), [], 'the founding: no short ID without its tap');
  const b = found.locator(`label.check [data-k-who="${cy.id}"] .k-idbtn`);
  assert.match(await b.innerText(), /^mid1.{3}…/);
  await b.click();
  assert.equal((await b.innerText()).trim(), shownId(cy.id), 'one tap: whole');
  assert.equal(await found.locator('input[name=member]:checked').count(), 0, 'the tap chose nobody');
  await b.click();
  await page.waitForFunction((el) => /Copied|copying refused/.test(el!.textContent ?? ''), await b.elementHandle());

  // The founding read back (an agreement, in plain words): every short ID in it a button too (H121).
  await found.locator('input[name=name]').fill('The tablet house');
  await found.locator('button[type=submit]').click();
  await page.locator('#e-real-review #reading').waitFor({ timeout: 90_000 });
  assert.deepEqual(await bareShortIds(page), [], 'the read-back: no short ID without its tap');
  assert.ok((await page.locator('#e-real-review .k-idbtn').count()) > 0, 'the read-back names its members by buttons');
  await page.locator('#e-real-review [data-action=cancel]').first().click();

  // The tiles, and the head of a pane, the same.
  await page.locator('[data-action="home-tiles"]').click();
  await page.locator('[data-k-tile="collectives"]').waitFor();
  assert.deepEqual(await bareShortIds(page), [], 'the tiles: no short ID without its tap');
  assert.deepEqual(problems, []);
  await page.context().close();
});
