// Dub in a real browser (headless Chromium, a fresh profile), as a person
// uses it: open the app's link, then only clicks and typing. Real homes and
// a relay; another person, a second Dub, on the other side. Every screen in
// turn: the identity window, the chain key's words (hidden before three are
// asked back, H3), the public tab (posting, a picture, following by ID, a
// reply, a long-form document's link, "to you" and its count, muting), the
// private tab (a sealed message each way, its count), one's own display
// name, the signing key's words, a second identity and the switch between
// them, and a key changed elsewhere. `MOR_SCREENSHOTS=DIR` keeps a picture of
// each screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { post as barebonePost, readPost, type ShownPicture } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { serve, type Running } from '../src/server.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { groupId, toWords } from '../../../modules/carry/src/carry.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PHONE = fileURLToPath(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string) => {
  if (!shots) return;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(shots, `mac-${name}.png`), fullPage: true });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let peer: Running;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-browser-')), port: 0 });
  peer = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-peer-')), port: 0 });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await app?.close();
  await peer?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = (page: Page, words: string | RegExp) => page.locator('#status .note.done', { hasText: words }).waitFor({ timeout: 60_000 });
/** Wait until an element holds nothing (a count gone, a notice cleared). */
const empty = (page: Page, sel: string) => page.waitForFunction((s) => document.querySelector(s)?.textContent === '', sel, { timeout: 60_000 });
const post = (page: Page, id: string) => page.locator(`#feed [data-post="${id}"]`);

test('a person, without a terminal, through every screen of Dub', async () => {
  const context = await browser.newContext({ viewport: { width: 760, height: 900 } });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());

  // The identity window, before anything: Dub opens only once an identity is here.
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.getByRole('heading', { name: 'Identity', exact: true }).waitFor({ timeout: 60_000 });
  assert.match(await page.locator('#test-only').innerText(), /^Test identities only, until MOR is frozen\./);
  await page.getByRole('heading', { name: 'Make a new identity' }).waitFor();
  await page.getByRole('heading', { name: 'Bring an identity you have' }).waitFor();
  assert.equal(await page.locator('[data-tab]').count(), 0, 'no tabs before an identity');
  await shot(page, '01-identity-window');

  // Make one: the chain key's words, shown once, with nothing asked beside them (H3).
  const begin = page.locator('form#begin');
  await begin.locator('textarea[name=homes]').fill(homes.map((h) => h.base).join('\n'));
  await begin.locator('textarea[name=relays]').fill(relay.base);
  // H12: a display name in the form that makes it, published right after the genesis. A malformed one is refused before anything is made.
  await begin.locator('input[name=name]').fill(' Ada‮ ');
  await begin.getByRole('button', { name: 'Make it' }).click();
  await page.locator('#status .note.error', { hasText: 'direction override' }).waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('#words').count(), 0, 'no words for a refused name');
  await begin.locator('input[name=name]').fill('Ada');
  await shot(page, '01b-make-with-a-name');
  await begin.getByRole('button', { name: 'Make it' }).click();
  await page.locator('#words').waitFor({ timeout: 60_000 });
  const written = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.equal(written.length, 24);
  assert.match(await page.getByRole('heading', { name: 'The chain key’s words' }).innerText(), /chain key/);
  assert.match(await page.locator('.say').innerText(), /Dub keeps nothing of the chain key/);
  assert.equal(await page.locator('form#confirm, input').count(), 0, 'no word is asked while the words are shown');
  await shot(page, '02-chain-words');

  // H3: once written down, the words are hidden, and only then are three asked back.
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await page.locator('form#confirm').waitFor();
  assert.equal(await page.locator('#words').count(), 0);
  const html = await page.content();
  assert.equal(await page.locator('.words').count(), 0);
  for (const i of [0, 8, 16]) assert.ok(!html.includes(`${i + 1}.</b>${written[i]}`) && !html.includes(written.slice(i, i + 3).join(' ')), 'no word left on the page');
  const inputs = page.locator('form#confirm input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(i === 2 ? 'wrong' : written[p - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await page.locator('#status .note.error', { hasText: 'Nothing has been published' }).waitFor({ timeout: 60_000 });
  await shot(page, '03-three-words');
  await inputs.nth(2).fill(written[positions[2] - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await done(page, 'The identity is born');
  await page.locator('#status', { hasText: 'Your display name is “Ada”' }).waitFor();
  await page.locator('header .me', { hasText: 'Ada' }).waitFor({ timeout: 60_000 });
  const me = (await app.dub.state()).identity!.id;

  // The public tab: post, and a picture, read back verified.
  await page.locator('[data-tab=public].on').waitFor();
  await page.locator('form#post textarea[name=text]').fill('Hello, from a page.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, 'Posted');
  await page.locator('form#post textarea[name=text]').fill('And a picture.');
  await page.locator('form#post input[name=picture]').setInputFiles(PHONE);
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /the place the picture was taken \(GPS\)/);
  const withPicture = (await page.locator('#feed .post').first().getAttribute('data-post'))!;
  await post(page, withPicture).locator('img').waitFor();
  const read = await readPost(withPicture, [relay.base]);
  assert.equal(read.standing, 'valid');
  assert.deepEqual((read.refs[0] as ShownPicture).picture!.carries, []);
  assert.match(await page.locator('#feed .post').nth(1).innerText(), /Hello, from a page\./);

  // Another person, in their own Dub, and an identity that publishes a long-form document.
  const pb = await peer.dub.begin({ homes: [homes[1].base], relays: [relay.base] });
  await peer.dub.confirm(pb.positions.map((p) => pb.words[p - 1]));
  const them = (await peer.dub.state()).identity!.id;
  await peer.dub.setName('River');
  const theirPost = await peer.dub.post({ text: 'A first word from River.' });
  const writer = TestIdentity.create({ homes: [homes[0].home] });
  await writer.publishGenesis();
  await writer.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  for (const a of writer.chainActs()) await relayAt(relay.base).putAct(a);
  const doc = await barebonePost(writer, { text: '# Running your own relay\n\nThe whole guide.', format: POST_SPECS.longform, relays: [relay.base] });

  // Follow both by their IDs, one with a name of one's own.
  await page.locator('#people summary').click();
  const follow = page.locator('form#follow');
  await follow.locator('input[name=id]').fill(groupId(them));
  await follow.locator('input[name=name]').fill('River (from the test)');
  await follow.getByRole('button', { name: 'Follow' }).click();
  await done(page, 'Followed');
  await follow.locator('input[name=id]').fill(writer.id);
  await follow.getByRole('button', { name: 'Follow' }).click();
  await done(page, 'Followed');
  await post(page, theirPost.post.id).waitFor({ timeout: 60_000 });
  const card = await post(page, theirPost.post.id).innerText();
  assert.match(card, /River \(from the test\)/, 'the name given here');
  assert.match(card, /River/, 'its display name');
  assert.ok(card.includes(`${them.slice(0, 8)}…${them.slice(-4)}`), 'beside its fingerprint, always');
  // H37: the people followed, offered where an identity is addressed (To… and the Private box), by name and fingerprint; an ID still typed.
  for (const sel of ['form#post input[name=to]', 'form#message input[name=to]']) assert.equal(await page.locator(sel).getAttribute('list'), 'followed');
  const offered = await page.locator(`#followed option[value="${them}"]`).getAttribute('label');
  assert.match(offered ?? '', /^River \(from the test\) · River · /);
  assert.ok(offered!.endsWith(`${them.slice(0, 8)}…${them.slice(-4)}`), 'the fingerprint beside the names');
  // The long-form document: not shown in the feed; a link to the reader.
  const link = post(page, doc.id).locator('a.doc');
  assert.equal(await link.getAttribute('href'), `https://reader.dubsar.org/#${doc.id}`);
  assert.ok(!(await post(page, doc.id).innerText()).includes('The whole guide.'));
  // Inter, light and regular, served by the program from the page's own origin, its licence beside it.
  assert.deepEqual(
    await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'Inter' && f.status === 'loaded').map((f) => f.weight).sort();
    }),
    ['300', '400'],
  );
  const font = await fetch(`${app.base}/inter_light.woff2`);
  assert.equal(font.headers.get('content-type'), 'font/woff2');
  assert.match(font.headers.get('content-security-policy') ?? '', /font-src 'self'/);
  assert.match(await (await fetch(`${app.base}/inter_license.txt`)).text(), /SIL Open Font License, Version 1\.1/);
  await shot(page, '04-public-feed');

  // A reply, as a quick action on the post.
  await post(page, theirPost.post.id).getByRole('button', { name: 'Reply' }).click();
  await page.locator('#replying .chip').waitFor();
  await shot(page, '05-replying');
  await page.locator('form#post textarea[name=text]').fill('Welcome, River.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /Left in the inbox of/);
  await page.locator('#feed .post .re', { hasText: 'answering' }).first().waitFor({ timeout: 60_000 });

  // The other side answers one of this identity's posts, and writes privately: counts on both tabs.
  const mine = (await app.dub.feed()).items.find((x) => x.text === 'Hello, from a page.')!;
  const theirReply = await peer.dub.post({ text: 'Thank you for the hello.', reply: { id: mine.id, signer: me } });
  await peer.dub.message({ to: me, text: 'A word just for you.' });
  await page.getByRole('button', { name: 'Look again' }).click();
  await page.locator('#count-public', { hasText: '1' }).waitFor({ timeout: 60_000 });
  await page.locator('#count-private', { hasText: '1' }).waitFor({ timeout: 60_000 });
  await page.locator('#count-toyou', { hasText: '1' }).waitFor();
  await shot(page, '06-counts');

  // "To you": a filter, not a hub; seen, the count goes.
  await page.locator('[data-filter=toyou]').click();
  await post(page, theirReply.post.id).waitFor();
  assert.equal(await page.locator('#feed .post').count(), 1);
  await empty(page, '#count-toyou');
  await shot(page, '07-to-you');
  // The relay view (H29): a filter one chooses, never the default; every public act at the relays, newest first.
  await page.locator('[data-filter=relay]').click();
  await page.locator('#feed .post', { hasText: 'Thank you for the hello.' }).waitFor({ timeout: 60_000 });
  await page.locator('#feed .post.act').first().waitFor();
  assert.match(await page.locator('#feed').innerText(), /newest first/);
  await shot(page, '07b-relay');
  await page.locator('[data-filter=all]').click();

  // The private tab: the message, opened here only; an answer, sealed.
  await page.locator('[data-tab=private]').click();
  await page.locator('#inbox .msg', { hasText: 'A word just for you.' }).waitFor({ timeout: 60_000 });
  await empty(page, '#count-private');
  await page.locator('#inbox .msg', { hasText: 'A word just for you.' }).getByRole('button', { name: 'Reply' }).click();
  assert.equal(await page.locator('form#message input[name=to]').inputValue(), them);
  await page.locator('form#message textarea[name=text]').fill('And one just for you.');
  await page.getByRole('button', { name: 'Send' }).click();
  await done(page, 'Sent');
  await page.locator('#inbox .msg.out', { hasText: 'And one just for you.' }).waitFor({ timeout: 60_000 });
  assert.ok((await peer.dub.inbox()).messages.some((m) => m.text === 'And one just for you.' && m.who.id === me));
  await shot(page, '08-private');

  // H30: a reload keeps the tab one was on; H34: a fold opened stays open.
  const peopleOpen = (await page.locator('#people[open]').count()) > 0;
  await page.reload();
  await page.locator('[data-tab=private].on').waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('#private').isVisible(), true);
  assert.equal(await page.locator('#public').isVisible(), false);
  assert.equal((await page.locator('#people[open]').count()) > 0, peopleOpen, 'the people fold as it was left');
  assert.equal(await page.locator('[data-filter=all].on').count(), 1, 'the filter is never kept: Everyone');

  // Mute, from the post: nothing of it shown; nobody told.
  await page.locator('[data-tab=public]').click();
  await post(page, theirPost.post.id).getByRole('button', { name: 'Mute' }).click();
  await page.locator('#feed').waitFor();
  await page.waitForFunction((id) => !document.querySelector(`#feed [data-post="${id}"]`), theirPost.post.id, { timeout: 60_000 });
  await page.locator('#people summary', { hasText: 'muted 1' }).waitFor({ timeout: 60_000 });
  await page.locator('#feed .post').first().waitFor({ timeout: 60_000 });
  // Still open from following: the panel stays as the person left it.
  if (!(await page.locator('#people[open]').count())) await page.locator('#people summary').click();
  await page.locator('#people[open]').waitFor();
  await shot(page, '09-muted');
  await page.locator('#people').getByRole('button', { name: 'Unmute' }).click();
  await post(page, theirPost.post.id).waitFor({ timeout: 60_000 });

  // The identity window, from the header: a display name, the signing key's words.
  await page.locator('[data-action=window]').click();
  await page.getByRole('heading', { name: 'Identity', exact: true }).waitFor();
  assert.equal(await page.locator('form#name input[name=name]').inputValue(), 'Ada', 'the name given at its making');
  await page.locator('form#name input[name=name]').fill('Ada Lovelace');
  await page.locator('form#name').getByRole('button', { name: 'Save' }).click();
  await done(page, /Your display name is “Ada Lovelace”/);
  await page.locator('#status', { hasText: '“Ada” withdrawn' }).waitFor();
  await page.getByRole('button', { name: 'Show the signing key’s words' }).click();
  await page.locator('#carry-words').waitFor();
  const carry = (await page.locator('#carry-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.notDeepEqual(carry, written, 'the signing key’s words, never the chain key’s');
  assert.match(await page.locator('#carry').innerText(), /The signing key’s words/i);
  assert.match(await page.locator('#carry').innerText(), /post as this identity and read its private messages/);
  await shot(page, '10-identity-window');
  await page.getByRole('button', { name: 'Hide them' }).click();
  await page.getByRole('button', { name: 'Back to Dub' }).click();
  assert.match(await page.locator('header .me').innerText(), /Ada/);

  // A second identity, brought by its words; the switch between them.
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  // H28: switching leaves the identity in use first, then the window to choose, make or bring one.
  await page.locator('[data-action=window]').click();
  await page.getByRole('button', { name: 'Switch identity' }).click();
  await done(page, /You left that identity/);
  assert.equal(await page.locator('#identity').count(), 0, 'no identity in use');
  await page.locator('#held', { hasText: 'Ada Lovelace' }).waitFor();
  await shot(page, '10b-left');
  await page.locator('details[data-fold=bring] > summary').click();
  const bring = page.locator('form#bring');
  await bring.locator('input[name=id]').fill(groupId(g.id));
  await bring.locator('textarea[name=words]').fill(toWords(unhex(g.f.signingSecret)).join(' '));
  await bring.locator('input[name=address]').fill(homes[0].base);
  await bring.getByRole('button', { name: 'Bring it' }).click();
  await done(page, 'The identity is here');
  await page.locator('[data-action=window]').click();
  assert.match((await page.locator('#identity').textContent())!, /brought here by its signing key’s words/);
  await page.getByRole('button', { name: 'Switch identity' }).click();
  await page.locator('#held li').nth(1).waitFor();
  assert.equal(await page.locator('#held li').count(), 2);
  await shot(page, '11-two-identities');
  await page.locator('#held li').filter({ hasNotText: 'Ada' }).getByRole('button', { name: 'Use this one' }).click();
  await page.locator('[data-tab=public]').waitFor({ timeout: 60_000 });
  await page.locator('[data-action=window]').click();

  // A key changed elsewhere (Kišib's work; the genesis client stands in): said, and the new words taken.
  await g.prepareRotation();
  await g.submitRotation();
  assert.ok((await g.settleRotation()).counts);
  await page.getByRole('button', { name: 'Back to Dub' }).click();
  await page.locator('#spent .note.spent').waitFor({ timeout: 60_000 });
  assert.match(await page.locator('#spent').innerText(), /changed elsewhere.*Kišib/s);
  await shot(page, '12-key-changed-elsewhere');
  await page.locator('form#renew textarea[name=words]').fill(toWords(unhex(g.f.signingSecret)).join(' '));
  await page.getByRole('button', { name: 'Use the new words' }).click();
  await done(page, 'The new words are in use');
  await empty(page, '#spent');

  // Back to the first identity.
  await page.locator('[data-action=window]').click();
  await page.getByRole('button', { name: 'Switch identity' }).click();
  await page.locator('#held li', { hasText: 'Ada' }).getByRole('button', { name: 'Use this one' }).click();
  await page.locator('header .me', { hasText: 'Ada' }).waitFor({ timeout: 60_000 });

  assert.deepEqual(problems, []);
  await context.close();
});
