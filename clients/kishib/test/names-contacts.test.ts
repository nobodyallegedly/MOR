// Names, contacts and IDs in Kišib, by clicks (hand test v3: H88, H96, H100,
// H106, H109, H119, H121): Kišib's page against real homes and a relay, its
// runner holding an identity. An identity given to the runner, then one made
// in Kišib: each last screen shows its `mid1…` whole, with Copy ID and Share
// your ID link. Contacts, top left: the contact Max added in Dub, with its
// nickname, read here from what is sealed to the identity held; shown, not
// changed (Kišib signs only for the apps paired with it).
// The Contacts button beside a field taking an ID fills it. Every identity
// shown by its names (the nickname, the published name faint; "No name
// published" where none is), never a bare `mid1…` where a name is known; no
// short ID anywhere without its tap, and a tap shows it whole. The runner's
// panel, with no script, shows the identity named with its ID a tap too.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { idForm } from '../../genesis/src/forms.ts';
import { KIT_STYLE } from '../../kit/src/style.ts';
import { panel, PANEL_STYLE } from '../src/page/panel.ts';
import { closeAll, dub, kishib, runnerOn, start, type Relay } from './world.ts';

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
  if (shots) await page.screenshot({ path: join(shots, `names-${name}.png`) });
}

/** A part of a tile, by clicks: the tile (or its tab), the quiet door where there is one, then the part in its column. */
async function go(page: Page, tab: string, part: string) {
  if (await page.locator(`[data-k-tile="${tab}"]`).count()) await page.click(`[data-k-tile="${tab}"]`);
  else await page.click(`[data-tab="${tab}"]`);
  if (await page.locator('#door').count()) await page.click('[data-action="open-door"]');
  await page.click(`[data-k-col="${part}"]`);
}

/** Wait for a button, or fail at once with what the page said. */
async function button(page: Page, name: string) {
  const err = page.locator('#status .k-note.k-error');
  await Promise.race([page.getByRole('button', { name }).waitFor({ timeout: 60_000 }), err.waitFor({ timeout: 60_000 }).then(async () => assert.fail(await err.innerText()))]);
}

/** The words on screen, as shown. */
const shownWords = async (page: Page) => (await page.locator('#words').waitFor(), await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.?\s*/, '').trim());

async function typeBack(page: Page, words: string[]) {
  await page.locator('form#typed').waitFor();
  const inputs = page.locator('form#typed input');
  const names = await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name));
  for (const [i, n] of names.entries()) await inputs.nth(i).fill(words[Number(n.slice(1)) - 1]);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
}

/**
 * H121: every short ID visible on the page, outside its tap (the kit's
 * `.k-idbtn`, and a card's own two menus, whose taps offer it whole). A
 * `mid1…`/`mact1…` short form, or a hash's first eight and last four.
 */
const bareShortIds = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement!;
      if (el.closest('.k-idbtn, .k-sid, .k-actid') || !el.checkVisibility()) continue;
      for (const m of (n.textContent ?? '').matchAll(/\bm(?:id|act)1[0-9a-z]{3}…[0-9a-z]{3}\b|\b[0-9a-f]{8}…[0-9a-f]{4}\b/g)) out.push(m[0]);
    }
    return out;
  });

/** H106: a whole `mid1…` shown as text where its identity's name is known (not in one's own ID block, which shows it whole on purpose). */
const bareWholeIds = (page: Page, forms: string[]) =>
  page.evaluate((fs) => {
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement!;
      if (el.closest('.k-idbtn, [data-k-ownid], input, textarea') || !el.checkVisibility()) continue;
      for (const f of fs) if ((n.textContent ?? '').includes(f)) out.push(f);
    }
    return out;
  }, forms);

test('names, contacts and IDs in Kišib, by clicks', async () => {
  const H = homes.map((h) => h.base);
  // Max: given to Kišib's runner. Bea: a published name. And one with none.
  const a = await dub(H, [relay.base]);
  await a.c.ask('name', { name: 'Max' });
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const b = await dub(H, [relay.base]);
  await b.c.ask('name', { name: 'Bea' });
  const c = await dub(H, [relay.base]);

  const k = await kishib();
  await runnerOn(k.c);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  await page.goto(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  await page.locator('.k-tile').first().waitFor({ timeout: 60_000 });

  // H100: Contacts, top left, as in every app.
  assert.equal(await page.locator('.k-top [data-k-open="contacts"]').count(), 1);
  const left = await page.locator('.k-top [data-k-open="contacts"]').boundingBox();
  const mark = await page.locator('.k-top .kishib-home-btn').boundingBox();
  assert.ok(left!.x < mark!.x, 'Contacts before the app’s mark, top left');

  // H88, bringing one: an identity given to the runner by clicks; its ID whole, Copy ID, Share your ID link.
  await go(page, 'identities', 'held');
  await page.fill('#form-give-runner [name="id"]', a.id);
  await page.fill('#form-give-runner [name="address"]', H[0]);
  await page.fill('#form-give-runner [name="words"]', words);
  await page.click('#form-give-runner button[type="submit"]');
  await page.locator(`[data-held="${a.id}"]`).waitFor({ timeout: 60_000 });
  const given = page.locator('#status .k-note.k-done [data-k-ownid]');
  await given.waitFor();
  assert.equal((await given.locator('.k-idwhole').innerText()).trim(), idForm(a.id));
  assert.equal(await given.getByRole('button', { name: 'Copy ID' }).count(), 1);
  assert.equal(await given.getByRole('button', { name: 'Share your ID link' }).count(), 1);
  assert.match((await given.getByRole('button', { name: 'Share your ID link' }).getAttribute('data-k-share')) ?? '', new RegExp(`^${idForm(a.id)}\\?r=`));
  // In Held here too, beside its record: its own ID block.
  assert.equal((await page.locator(`[data-held="${a.id}"] [data-k-ownid] .k-idwhole`).innerText()).trim(), idForm(a.id));
  // H96: its name as read, not "No name".
  await page.locator(`[data-held="${a.id}"] h3 [data-k-who] .k-nick`, { hasText: 'Max' }).waitFor({ timeout: 30_000 });
  await shot(page, '01-held');

  // H100, H109: the contact Max added in Dub, with its nickname, here at once; shown, not changed.
  await a.c.ask('follow', { id: b.id, name: 'Bee' });
  await page.click('.k-top [data-k-open="contacts"]');
  const contacts = page.locator('[data-k-panel="contacts"]');
  await contacts.waitFor();
  const row = page.locator(`[data-k-panel="contacts"] [data-k-contact="${b.id}"]`);
  await row.waitFor({ timeout: 60_000 });
  assert.equal((await row.locator('.k-nick').innerText()).trim(), 'Bee');
  assert.equal((await row.locator('.k-pub').innerText()).trim(), 'Bea', 'the published name beside the nickname, faint');
  assert.equal(await contacts.locator('form[data-k-contact-add], [data-k-nick], [data-k-contact-do]').count(), 0, 'nothing to change here');
  assert.match(await contacts.innerText(), /changed in Dub, Damgar, Edubba or Ummia/);
  await shot(page, '02-contacts');
  const listed = await k.c.ask<{ contacts: { id: string; name: string | null }[]; problem: string | null }>('contacts', { fresh: true });
  assert.equal(listed.problem, null);
  assert.deepEqual(listed.contacts.map((x) => [x.id, x.name]), [[b.id, 'Bee']]);
  await assert.rejects(k.c.ask('contact add', { id: c.id, nick: 'C' }), /Kišib signs only for the apps paired with it/);
  assert.ok(!(await k.c.ask<{ signed: { app: string }[] }>('runner state')).signed.some((x) => x.app === 'Kišib'), 'Kišib signed nothing for itself');
  await page.locator('[data-k-panel="contacts"] [data-k-close]').click();

  // H119: the Contacts button beside a field taking an ID; choosing one fills it.
  await go(page, 'identities', 'record');
  await page.click('#form-record [data-k-pick-for="id"]');
  const picker = page.locator('[data-k-picker]');
  await picker.waitFor();
  assert.match(await picker.innerText(), /Bee/);
  await picker.locator(`[data-k-picked="${idForm(b.id)}"]`).click();
  assert.equal(await page.inputValue('#form-record [name="id"]'), idForm(b.id));
  assert.ok((await page.locator('#form-record [data-k-pick-for]').count()) >= 1);

  // H96, H106: names where an identity is shown: the record of Bea says Bee, Bea faint; one with no name, said so.
  await page.fill('#form-record [name="address"]', H[0]);
  await page.click('#form-record button[type="submit"]');
  const answer = page.locator('#answer');
  await answer.waitFor({ timeout: 60_000 });
  await answer.locator(`h3 [data-k-who="${b.id}"] .k-nick`, { hasText: 'Bee' }).waitFor({ timeout: 30_000 });
  assert.equal((await answer.locator(`h3 [data-k-who="${b.id}"] .k-pub`).innerText()).trim(), 'Bea');
  await shot(page, '03-record-named');
  assert.deepEqual(await bareShortIds(page), [], 'no short ID without its tap');
  assert.deepEqual(await bareWholeIds(page, [idForm(a.id), idForm(b.id)]), [], 'no bare mid1… where a name is known');
  await page.fill('#form-record [name="id"]', idForm(c.id));
  await page.fill('#form-record [name="address"]', H[0]);
  await page.click('#form-record button[type="submit"]');
  await page.locator(`#answer h3 [data-k-who="${c.id}"] [data-k-name-state="none"]`, { hasText: 'No name published' }).waitFor({ timeout: 30_000 });

  // H121: a tap shows a short ID whole, a second copies it; Open profile beside it.
  const tap = page.locator(`#answer h3 [data-k-who="${c.id}"] .k-idbtn`);
  await tap.click();
  assert.equal((await tap.innerText()).trim(), idForm(c.id));
  assert.equal(await page.locator('#answer [data-k-open-profile]').count(), 1);
  await tap.click();
  await page.waitForFunction((el) => /Copied|Select it/.test(el!.textContent ?? ''), await tap.elementHandle());

  // H88, making one: by clicks to its last screen, its ID whole with Copy ID and Share your ID link.
  await go(page, 'identities', 'make');
  await page.locator('#form-make [name="homes"]').fill(H.join('\n'));
  await page.locator('#form-make [name="relays"]').fill(relay.base);
  await page.getByRole('button', { name: 'Read it back' }).click();
  await button(page, 'Sign it');
  await page.getByRole('button', { name: 'Sign it' }).click();
  await button(page, 'Show the chain key’s words (its paper)');
  await page.getByRole('button', { name: 'Show the chain key’s words (its paper)' }).click();
  const chain = await shownWords(page);
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await typeBack(page, chain);
  await button(page, 'Show its signing key’s words');
  await page.getByRole('button', { name: 'Show its signing key’s words' }).click();
  const signing = await shownWords(page);
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await typeBack(page, signing);
  await page.locator('.kishib-review', { hasText: 'forgotten here' }).waitFor({ timeout: 60_000 });
  const made = (await k.c.ask<{ sitting: { id: string; link?: string } }>('state')).sitting;
  const end = page.locator('#made-id [data-k-ownid]');
  assert.equal((await end.locator('.k-idwhole').innerText()).trim(), idForm(made.id));
  assert.equal(await end.getByRole('button', { name: 'Copy ID' }).count(), 1);
  assert.equal(await end.getByRole('button', { name: 'Share your ID link' }).getAttribute('data-k-share'), made.link);
  assert.match(made.link ?? '', new RegExp(`^${idForm(made.id)}\\?r=`));
  // Its heading names it by its names (none published yet), its ID a tap: never a bare short one.
  await page.locator(`.kishib-pane h2 [data-k-who="${made.id}"] .k-idbtn`).waitFor();
  await end.getByRole('button', { name: 'Copy ID' }).click();
  await page.waitForFunction(() => /Copied|Select it/.test(document.querySelector('#made-id [data-k-copy-id]')?.textContent ?? ''));
  assert.deepEqual(await bareShortIds(page), [], 'no short ID without its tap, at the end of making one');
  await shot(page, '04-made');
  await page.getByRole('button', { name: 'Done', exact: true }).click();

  // Every runner screen: no short ID without its tap.
  for (const part of ['onoff', 'apps', 'waiting', 'signed']) {
    await go(page, 'runner', part);
    await page.waitForTimeout(300);
    assert.deepEqual(await bareShortIds(page), [], `Runner, ${part}: no short ID without its tap`);
  }
  await go(page, 'identities', 'held');
  await page.locator(`[data-held="${a.id}"]`).waitFor();
  assert.deepEqual(await bareShortIds(page), [], 'Held here: no short ID without its tap');
  assert.deepEqual(errors, []);
  await context.close();
});

test('the runner’s panel, with no script: the identity named by its name, its ID a tap showing it whole', async () => {
  const id = 'ab'.repeat(32);
  const form = idForm(id);
  const html = panel({ request: 'f'.repeat(64), nonce: '00', title: 'Dub asks Kišib to sign a post', as: `As Max · ${form} · public`, words: ['“Hello.”', `Sealed to ${idForm('cd'.repeat(32))}.`], always: null });
  const page = await browser.newPage();
  await page.setContent(html.replace('<link rel="stylesheet" href="/runner/panel.css">', `<style>${KIT_STYLE}\n${PANEL_STYLE}</style>`));
  assert.match(await page.locator('.k-rp > p.k-soft').innerText(), /^As Max · mid1\w{3}…\w{3} · public$/);
  assert.deepEqual(await bareShortIds(page), [], 'in the panel: no short ID without its tap');
  const tap = page.locator('.k-rp > p.k-soft .k-tap');
  await tap.click();
  assert.equal((await tap.innerText()).trim(), form, 'tapped: whole, to select and copy');
  await page.close();
});
