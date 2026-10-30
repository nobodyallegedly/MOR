// Notes (hand test v3, H122): a private text act sealed to oneself, left at
// the identity's homes; Edit signs a new version, the earlier ones kept;
// Retire marks it dropped, kept readable. In a real browser (headless
// Chromium), by clicks: + New note, Sign and keep; the note chosen, Edit,
// Sign the new version, Earlier drafts; Retire. Then another Dub holding the
// same identity (brought by its words) opens the same notes; nothing of
// them shows in Private, and nobody else can open them. Real homes and a
// relay on local ports; test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { closeAll, dub, start, type Relay } from '../../damgar/test/world.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { NOTES_FORMAT } from '../src/notes.ts';
import { stopAll } from './stop.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;

let homes: Relay[];
let relay: Relay;
let browser: Browser;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(() => stopAll(() => browser?.close(), () => closeAll(), ...[...(homes ?? []), relay].map((r) => () => r?.stop())));

interface NoteShown {
  id: string;
  versions: { id: string; text: string }[];
  retired: boolean;
}

test('H122: Notes in Dub: a note sealed to oneself, edited as new versions, retired; opened by another app holding the identity', async () => {
  const H = homes.map((h) => h.base);
  const max = await dub(H, [relay.base]);
  const problems: string[] = [];
  for (const size of [{ width: 1280, height: 800 }]) {
    const page = await (await browser.newContext({ viewport: size })).newPage();
    page.on('pageerror', (err) => problems.push(err.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
    });
    await page.goto(`${max.app.base}/#pair=${max.app.access.newCode()}`);
    await page.locator('[data-k-part="notes"]').click({ timeout: 60_000 });
    await page.locator('#notes', { hasText: 'Choose a note, or write a new one.' }).waitFor({ timeout: 60_000 });
    // + New note, written, signed and kept.
    await page.locator('[data-action="note-new"]').click();
    await page.locator('#note textarea').fill('Groceries\nbread, olives');
    await page.locator('#note button[type="submit"]').click();
    await page.locator('.k-note.k-done', { hasText: 'Signed and sealed to you at your homes' }).waitFor({ timeout: 60_000 });
    const item = page.locator('.dub-notes [data-note]', { hasText: 'Groceries' });
    await item.waitFor({ timeout: 60_000 });
    await page.locator('.dub-note-latest', { hasText: 'bread, olives' }).waitFor();
    if (shots) await page.screenshot({ path: join(shots, 'h122-note.png') });
    // Edit: a new version, the earlier one under Earlier drafts.
    await page.locator('[data-action="note-edit"]').click();
    await page.locator('#note textarea').fill('Groceries\nbread, olives, figs');
    await page.locator('#note button[type="submit"]', { hasText: 'Sign the new version' }).click();
    await page.locator('.dub-note-latest', { hasText: 'figs' }).waitFor({ timeout: 60_000 });
    const drafts = page.locator('.dub-notes details.k-fold', { hasText: 'Earlier drafts (1)' });
    await drafts.locator('summary').click();
    await drafts.locator('.dub-note-draft', { hasText: 'bread, olives' }).waitFor();
    assert.equal(await drafts.locator('.dub-note-draft', { hasText: 'figs' }).count(), 0, 'the earlier draft is the one as first signed');
    if (shots) await page.screenshot({ path: join(shots, 'h122-note-edited.png') });
    // A second note, then the first retired: kept, readable, marked.
    await page.locator('[data-action="note-new"]').click();
    await page.locator('#note textarea').fill('Call the plumber');
    await page.locator('#note button[type="submit"]').click();
    await page.locator('.dub-notes [data-note]', { hasText: 'Call the plumber' }).waitFor({ timeout: 60_000 });
    // Latest first.
    assert.match(await page.locator('.dub-notes [data-note]').first().innerText(), /Call the plumber/);
    await item.click();
    await page.locator('[data-action="note-retire"]').click();
    await page.locator('[data-k-ask-yes]').click();
    await page.locator('#notes .k-chip', { hasText: 'Retired' }).waitFor({ timeout: 60_000 });
    await page.locator('.dub-note-latest', { hasText: 'figs' }).waitFor();
    if (shots) await page.screenshot({ path: join(shots, 'h122-retired.png') });
    // Nothing of it in Private.
    await page.locator('[data-k-part="private"]').click();
    await page.locator('.dub-private:not(.dub-notes)').waitFor();
    assert.equal(await page.locator('.dub-private', { hasText: 'Groceries' }).count(), 0, 'no note in Private');
    await page.context().close();
  }
  assert.deepEqual(problems, []);

  // Another Dub holding the same identity opens the same notes, versions and all.
  const other = await dub(H, [relay.base]);
  await other.c.ask('bring', { id: max.id, words: max.words, address: H[0] });
  await other.c.ask('use', { id: max.id });
  const r = await other.c.ask<{ notes: NoteShown[]; problems: string[] }>('notes');
  const groceries = r.notes.find((n) => n.versions.some((v) => v.text.startsWith('Groceries')))!;
  assert.ok(groceries, 'the note is there');
  assert.equal(groceries.versions.length, 3, 'two versions and the one retiring it');
  assert.ok(groceries.retired);
  assert.equal(groceries.versions[1].text, 'Groceries\nbread, olives, figs');
  assert.ok(r.notes.some((n) => n.versions[0].text === 'Call the plumber' && !n.retired));
  // Nobody else opens them: at the homes, only sealed containers (no note's text in the clear).
  const feed = await relayAt(H[0]).feed({ to: max.id });
  assert.ok(feed.items.some((x) => x.kind === 'sealed'));
  const clear = new TextDecoder().decode(new Uint8Array(feed.items.flatMap((x) => [...x.item])));
  assert.ok(!clear.includes('plumber'), 'no note readable at the homes');
  assert.ok(NOTES_FORMAT.length === 64);
});
