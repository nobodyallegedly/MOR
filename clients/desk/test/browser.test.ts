// The step's "done when" in a real browser (headless Chromium, a fresh
// profile), as the author will do it: open the launcher's link, then only
// clicks and typing into the page. Claude's side is the connector, driven
// over MCP as Claude's app drives it. Real homes and a relay.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { IDENTITY_TYPES, SPECS, cborEncode } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { readPost, textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { connect } from '../../connector/test/world.ts';
import { serve, type Running } from '../src/server.ts';
import { handed } from './setup.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/** Set MOR_SCREENSHOTS to a folder to keep a picture of each step, for a person to look at. */
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let browser: Browser;
let claude: Awaited<ReturnType<typeof connect>>;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
  const drafts = mkdtempSync(join(tmpdir(), 'mor-drafts-browser-'));
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-desk-browser-')), port: 0, drafts });
  claude = await connect({ MOR_RELAYS: `${relay.base},${homes[0].base}`, MOR_DRAFTS: drafts });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await claude?.close();
  await app?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (page: Page, words: string | RegExp) => page.locator('#status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });

test('the author, without a terminal: a draft from Claude sent back, reworked, approved; received interactions sorted', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', (m) => {
    // A browser not paired yet is answered 401, as it should be.
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(String(e)));

  // The launcher's link pairs this browser by itself; the code leaves the address bar.
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('h1', { hasText: 'MOR Identities' }).waitFor();
  assert.equal(await page.title(), 'MOR Identities');
  await page.locator('#settings form').waitFor();
  assert.equal(new URL(page.url()).hash, '');

  // Settings: the homes and the relay.
  await page.fill('#settings textarea[name=homes]', homes.map((h) => h.base).join('\n'));
  await page.fill('#settings textarea[name=relays]', relay.base);
  await page.click('#settings button[type=submit]');
  // Said beside the button that was pressed, not only at the top of the page.
  await page.locator('#settings-status .note.done', { hasText: 'Settings saved' }).waitFor({ timeout: 60_000 });

  // Two identities: the author's, and "Machine, allegedly", linked to Claude.
  await page.fill('#new-identity input[name=name]', 'Me');
  await page.click('#new-identity button[type=submit]');
  await done(page, '“Me” is born');
  await page.fill('#new-identity input[name=name]', 'Machine, allegedly');
  await page.check('#new-identity input[name=linked]');
  await page.click('#new-identity button[type=submit]');
  await done(page, '“Machine, allegedly” is born');
  const book = app.store.book().identities;
  const me = book.find((i) => i.name === 'Me')!.id;
  const machine = book.find((i) => i.name === 'Machine, allegedly')!.id;
  // The question on each card, answered on or off; the author's own stays off (decided 1 October 2026).
  const meCard = page.locator(`.card[data-identity="${me}"]`);
  const machineCard = page.locator(`.card[data-identity="${machine}"]`);
  assert.match((await meCard.textContent())!, /Claude may prepare drafts for this identity:/);
  assert.equal(await meCard.locator('[data-action=link][data-on=false]').getAttribute('aria-pressed'), 'true');
  assert.equal(await machineCard.locator('[data-action=link][data-on=true]').getAttribute('aria-pressed'), 'true');
  // Turned on, then off again, by clicks; the answer is said on the card.
  await meCard.locator('[data-action=link][data-on=true]').click();
  await meCard.locator('.here .note.done', { hasText: 'Claude may now prepare drafts' }).waitFor();
  assert.equal((app.store.book().identities.find((i) => i.id === me))!.linked, true);
  await page.locator(`.card[data-identity="${me}"] [data-action=link][data-on=false]`).click();
  await page.locator(`.card[data-identity="${me}"] .here .note.done`, { hasText: 'may no longer prepare' }).waitFor();
  assert.equal((app.store.book().identities.find((i) => i.id === me))!.linked, false);
  const refused = await claude.ask('mor_prepare_post', { signer: 'Me', text: 'Not for Claude.' });
  assert.equal(refused.isError, true);

  // Copy ID: the whole ID, without the spaces the fingerprint is shown with.
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: app.base });
  await meCard.locator('[data-action=copy]').click();
  await meCard.locator('[data-action=copy]', { hasText: 'Copied' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), me);

  // Claude prepares a post for Machine, allegedly; it appears without a click or a reload.
  const first = await claude.ask('mor_prepare_post', { signer: 'Machine, allegedly', text: 'Hello, word.', note: 'A first post.' });
  const d1 = handed(first.text);
  const card = page.locator(`.draft[data-draft="${d1}"]`);
  await card.waitFor({ timeout: 15_000 });
  await page.locator('#drafts-watch', { hasText: 'A new draft from Claude arrived' }).waitFor();
  const shown = (await card.textContent())!;
  assert.match(shown, /A post, to be published/);
  assert.match(shown, /For Machine, allegedly \[/);
  assert.match(shown, /Hello, word\./);
  assert.match(shown, /Claude's note to you/);
  assert.ok(shown.includes(d1.match(/.{4}/g)!.join(' ')), 'the digest Claude showed');
  await shot(page, '1-draft');

  // Sent back, with a note.
  await card.locator('textarea[name=note]').fill('The word is world.');
  await card.locator('form.send-back button[type=submit]').click();
  await done(page, 'Sent back to Claude');
  assert.match((await claude.ask('mor_drafts', { draft: d1 })).text, /> The word is world\./);

  // Claude reworks it; the desk shows the note it answers and the text it replaces.
  const second = await claude.ask('mor_prepare_post', { signer: 'Machine, allegedly', text: 'Hello, world.', reworks: d1 });
  const d2 = handed(second.text);
  await page.click('[data-action=drafts]');
  const card2 = page.locator(`.draft[data-draft="${d2}"]`);
  await card2.waitFor();
  assert.match((await card2.textContent())!, /It replaces draft .* which you sent back with this note:The word is world\./);
  await shot(page, '2-rework');

  // Approved: signed and accepted by the relay.
  await card2.locator('[data-action=approve]').click();
  await done(page, 'Approved and signed');
  assert.match((await page.locator('#status').textContent())!, new RegExp(`${relay.base.replace(/[.]/g, '\\.')}: accepted`));
  const post = app.store.identity(machine).f.sequence.at(-1)!;
  assert.equal((await readPost(post, [relay.base])).standing, 'valid');
  assert.match((await claude.ask('mor_drafts', { draft: d2 })).text, /APPROVED by the owner/);

  // A message from the machine to the author's own identity, which is not
  // linked: Claude reaches it by its copied ID. Approved by a click.
  const msg = await claude.ask('mor_prepare_message', { signer: 'Machine, allegedly', to: me, text: 'A private word.' });
  await page.click('[data-action=drafts]');
  await page.locator(`.draft[data-draft="${handed(msg.text)}"] [data-action=approve]`).click();
  await done(page, 'Approved and signed');
  await meCard.locator('[data-action=refresh]').click();
  await meCard.locator('.here .note.done', { hasText: '1 new item' }).waitFor({ timeout: 60_000 });
  assert.match((await meCard.locator('[data-pile="new"] .item').textContent())!, /A message.*A private word\./s);
  await meCard.locator('[data-pile="new"] .item [data-sorted="to answer"]').click();
  await page.locator(`.card[data-identity="${me}"] [data-pile="to answer"] .item`).waitFor();

  // Someone else replies to the post, publicly, to the machine's inbox.
  const other = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await other.publishGenesis();
  for (const a of other.chainActs()) await relayAt(relay.base).putAct(a);
  await other.publish(POST_SPECS.text, 0, textPayload('Nice post.'), { public: true, relays: [relay.base], to: [machine], refs: [post] });
  // Relying on the post is a witness act (F110): a text act may not acknowledge.
  await other.publish(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(new Map()), { public: true, relays: [relay.base], to: [machine], acks: [post] });

  // What the machine received, then sorted by clicks.
  const id = page.locator(`.card[data-identity="${machine}"]`);
  await id.locator('[data-action=refresh]').click();
  await id.locator('.here .note.done', { hasText: '2 new items' }).waitFor({ timeout: 60_000 });
  const pile = (p: string) => id.locator(`[data-pile="${p}"] .item`);
  assert.equal(await pile('new').count(), 2);
  await shot(page, '3-received');
  // Relying on the reply: the click explains first and signs nothing; Cancel leaves nothing signed.
  await pile('new').filter({ hasText: 'A reply' }).locator('[data-action="witness"]').click();
  await id.locator('.here', { hasText: 'I received this act and rely on it' }).waitFor();
  await id.locator('.here [data-action="witness-cancel"]').click();
  await pile('new').filter({ hasText: 'A reply' }).locator('[data-action="witness"]').click();
  await id.locator('.here [data-action="witness-sign"]').click();
  await id.locator('.here .note.done', { hasText: 'Witness act' }).waitFor({ timeout: 60_000 });
  await pile('new').filter({ hasText: 'A reply' }).locator('[data-sorted="answered"]').click();
  await id.locator('[data-pile="answered"] .item').first().waitFor();
  await pile('new').filter({ hasText: 'An acknowledgement' }).locator('[data-sorted="ignored"]').click();
  await id.locator('[data-pile="ignored"] .item').first().waitFor();
  assert.equal(await pile('new').count(), 0);
  assert.match((await pile('answered').textContent())!, /Nice post\./);
  assert.match((await pile('ignored').textContent())!, /A witness act: its sender relies on/);
  await shot(page, '4-sorted');

  // Nothing was ever typed in a terminal; the page made no error.
  assert.deepEqual(problems, []);
  await context.close();
});
