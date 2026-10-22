// Dub in a real browser (headless Chromium, a fresh profile), as a person
// uses it after the redesign of 21 October 2026: open the app's link, then
// only clicks and typing. Real homes and a relay; other people, other Dubs,
// on the other side. Every screen in turn: the first screen and the chain
// key's words (hidden before three are asked back, H3); Public, its three
// lenses (Following · To you · Relay) and the typing box at the bottom, with
// a picture, a film (H52), @ by names (H57, H78) and To…; the act card's two
// menus (H49, H68, H77): a reply, the pop-up thread and its back arrow
// (H50, H74), why it is valid, relying on it, correcting one's own; a
// profile; Contacts; Private, a mailbox: someone new, an empty thread, a Cc;
// the three ways to pay as far as Dub alone opens them; Purchases; the
// identity panel: a name, the signing key's words, a second identity
// brought, switched to, its key changed elsewhere and refused, then
// removed, said first (H58). Then the same page at a phone's size. No
// console error, nothing the content security policy refused, no finding
// number on any screen (H76). `MOR_SCREENSHOTS=DIR` keeps a picture of each
// screen. (Lane payments, purchases, anchoring and an appended collective
// run with Damgar and Edubba beside Dub: `clients/desk/test/dub-redesign.test.ts`.)

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Locator, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { post as barebonePost, readPost, type ShownPicture } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { serve, type Running } from '../src/server.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { describeAct, unhex } from '../../genesis/src/core.ts';
import { actForm, idForm } from '../../genesis/src/forms.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { groupId, toWords } from '../../../modules/carry/src/carry.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PHONE = fileURLToPath(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));
const FILM = fileURLToPath(new URL('../../../modules/video/test/fixtures/plain.mp4', import.meta.url));
const shots = process.env.MOR_SCREENSHOTS;
const shot = async (page: Page, name: string, size = 'mac') => {
  if (shots) await page.screenshot({ path: join(shots, `${size}-${name}.png`) });
};

let homes: Relay[];
let relay: Relay;
let app: Running;
let peer: Running;
let third: Running;
let browser: Browser;
const problems: string[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-browser-')), port: 0 });
  peer = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-peer-')), port: 0 });
  third = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-third-')), port: 0 });
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  for (const x of [app, peer, third]) await x?.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

const done = async (page: Page, words: string | RegExp) => {
  try {
    await page.locator('#status .k-note.k-done', { hasText: words }).waitFor({ timeout: 60_000 });
  } catch (e) {
    throw new Error(`${e instanceof Error ? e.message : e}\nThe page said: ${await page.locator('#status').innerText().catch(() => '(nothing)')}`);
  }
};
const error = (page: Page, words: string | RegExp) => page.locator('#status .k-note.k-error', { hasText: words }).waitFor({ timeout: 60_000 });
const cardOf = (page: Page, id: string, where = '#feed') => page.locator(`${where} [data-k-act="${id}"]`);
/** Open a card's act menu (its short ID, bottom right) and choose. */
const actMenu = async (c: Locator, item: string | RegExp) => {
  await c.locator('.k-actid').click();
  await c.page().getByRole('menuitem', { name: item, exact: typeof item === 'string' }).click();
};
const signerMenu = async (c: Locator, item: string | RegExp) => {
  await c.locator('.k-signer').click();
  await c.page().getByRole('menuitem', { name: item, exact: typeof item === 'string' }).click();
};
const noFindingNumber = async (page: Page) => assert.doesNotMatch(await page.locator('body').innerText(), /\b[FH]\d{1,3}\b/, 'no finding number on screen (H76)');
/** Make an identity in another Dub, without a page. */
async function made(r: Running, home: Relay, name: string) {
  const b = await r.dub.begin({ homes: [home.base], relays: [relay.base] });
  await r.dub.confirm(b.positions.map((p) => b.words[p - 1]));
  await r.dub.setName(name);
  return (await r.dub.state()).identity!.id;
}

test('a person, without a terminal, through every screen of the new Dub', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('console', (m) => {
    if ((m.type() === 'error' && !/status of 4\d\d/.test(m.text())) || /Content Security Policy/i.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());

  // The first screen: Dub opens only once an identity is here.
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.getByRole('heading', { name: 'Identity', exact: true }).waitFor({ timeout: 60_000 });
  await page.evaluate(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP refused ${e.blockedURI} (${e.violatedDirective})`)));
  assert.match(await page.locator('#first .k-say').last().innerText(), /^Test identities only, until MOR is frozen\./);
  assert.equal(await page.locator('[data-k-part]').count(), 0, 'no switch before an identity');
  await shot(page, '01-first-screen');

  // Make one: the chain key's words, shown once, with nothing asked beside them (H3).
  const begin = page.locator('form#begin');
  await begin.locator('textarea[name=homes]').fill(homes.map((h) => h.base).join('\n'));
  await begin.locator('textarea[name=relays]').fill(relay.base);
  // H12: a malformed display name is refused before anything is made.
  await begin.locator('input[name=name]').fill(' Ada‮ ');
  await begin.getByRole('button', { name: 'Make it' }).click();
  await error(page, 'direction override');
  assert.equal(await page.locator('#words').count(), 0, 'no words for a refused name');
  await begin.locator('input[name=name]').fill('Ada');
  await begin.getByRole('button', { name: 'Make it' }).click();
  await page.locator('#words').waitFor({ timeout: 60_000 });
  const written = (await page.locator('#words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.equal(written.length, 24);
  assert.equal(await page.locator('form#confirm, input').count(), 0, 'no word is asked while the words are shown');
  await shot(page, '02-chain-words');
  await page.getByRole('button', { name: 'I have written them down' }).click();
  await page.locator('form#confirm').waitFor();
  const html = await page.content();
  for (const i of [0, 8, 16]) assert.ok(!html.includes(`${i + 1}.</b>${written[i]}`), 'no word left on the page');
  const inputs = page.locator('form#confirm input');
  const positions = (await inputs.evaluateAll((xs) => xs.map((x) => (x as HTMLInputElement).name))).map((n) => Number(n.slice(1)));
  for (const [i, p] of positions.entries()) await inputs.nth(i).fill(i === 2 ? 'wrong' : written[p - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await error(page, 'Nothing has been published');
  await inputs.nth(2).fill(written[positions[2] - 1]);
  await page.getByRole('button', { name: 'Go on' }).click();
  await done(page, 'The identity is born');
  const me = (await app.dub.state()).identity!.id;

  // Always opens on Public: three lenses, Relay third; the typing box at the bottom.
  await page.locator('[data-k-part="public"].k-on').waitFor({ timeout: 60_000 });
  assert.deepEqual((await page.locator('[data-k-part]').allInnerTexts()).map((t) => t.trim()), ['Public', 'Private', 'Purchases']);
  assert.deepEqual((await page.locator('[data-k-lens]').allInnerTexts()).map((t) => t.trim()), ['Following', 'To you', 'Relay']);
  await page.locator('.k-me', { hasText: 'Ada' }).waitFor();
  assert.ok((await page.locator('#post').boundingBox())!.y > (await page.locator('#feed').boundingBox())!.y, 'the typing box below the feed');

  // A post, a picture, a film (H52).
  const ta = page.locator('#post textarea');
  await ta.fill('Hello, from a page.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, 'Posted');
  await ta.fill('And a picture.');
  await page.locator('#post input[name=picture]').setInputFiles(PHONE);
  await page.locator('#picked', { hasText: 'phone.jpg' }).waitFor();
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /the place the picture was taken \(GPS\)/);
  const withPicture = (await page.locator('#feed .k-act').first().getAttribute('data-k-act'))!;
  await cardOf(page, withPicture).locator('img').waitFor();
  assert.deepEqual(((await readPost(withPicture, [relay.base])).refs[0] as ShownPicture).picture!.carries, []);
  await ta.fill('And a film.');
  await page.locator('#post input[name=video]').setInputFiles(FILM);
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /film/);
  const withFilm = (await page.locator('#feed .k-act').first().getAttribute('data-k-act'))!;
  await cardOf(page, withFilm).getByRole('button', { name: /Play the film/ }).click();
  const video = cardOf(page, withFilm).locator('video[data-checked="yes"]');
  await video.waitFor({ timeout: 60_000 });
  assert.match((await video.getAttribute('src'))!, /^blob:/, 'played from bytes checked in the page');
  await shot(page, '03-public');

  // Other people, in their own Dubs, and a long-form writer; one more called Pa as the writer is named here.
  const them = await made(peer, homes[1], 'River');
  const ph = await made(third, homes[0], 'Ph');
  const theirPost = await peer.dub.post({ text: 'A first word from River.' });
  const writer = TestIdentity.create({ homes: [homes[0].home] });
  await writer.publishGenesis();
  await writer.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  for (const a of writer.chainActs()) await relayAt(relay.base).putAct(a);
  const doc = await barebonePost(writer, { text: '# Running your own relay\n\nThe whole guide.', format: POST_SPECS.longform, relays: [relay.base] });

  // Contacts, top left: one list, names first; add by ID with a name sealed to oneself.
  await page.locator('[data-k-open="contacts"]').click();
  const panel = page.locator('[data-k-panel="contacts"]');
  for (const [id, name] of [
    [groupId(them), 'River'],
    [writer.id, 'Pa'],
    [ph, 'Pa'],
  ]) {
    await panel.locator('form#follow input[name=id]').fill(id);
    await panel.locator('form#follow input[name=name]').fill(name);
    await panel.getByRole('button', { name: 'Add to contacts' }).click();
    await done(page, 'Added to contacts');
  }
  await page.locator('[data-k-panel="contacts"] [data-k-contact]').nth(2).waitFor();
  assert.deepEqual((await page.locator('[data-k-panel="contacts"] [data-k-contact] .k-n').allInnerTexts()).map((x) => x.trim()).sort(), ['Pa', 'Pa', 'River']);
  await shot(page, '04-contacts');
  await page.keyboard.press('Escape');
  await cardOf(page, theirPost.post.id).waitFor({ timeout: 60_000 });
  const card = await cardOf(page, theirPost.post.id).innerText();
  assert.match(card, /River/);
  assert.ok(card.includes(`mid1`), 'its ID written for people beside the name');
  // The long-form document: a link to the reader.
  assert.equal(await cardOf(page, doc.id).locator('a.k-doc').getAttribute('href'), `https://reader.dubsar.org/#${doc.id}`);
  // Inter, light and regular, from the program's own origin.
  assert.deepEqual(
    await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'Inter' && f.status === 'loaded').map((f) => f.weight).sort();
    }),
    ['300', '400'],
  );
  const policy = (await fetch(`${app.base}/inter_light.woff2`)).headers.get('content-security-policy') ?? '';
  assert.match(policy, /font-src 'self'/);
  assert.match(policy, /media-src blob:/);

  // @ by names, never hashes: the two called Pa told apart by a faint short ID; River alone carries none (H57, H78).
  await ta.click();
  await ta.pressSequentially('Thank you @P');
  const offered = page.locator('[data-k-suggest] [data-k-pick]');
  await offered.first().waitFor();
  assert.equal(await offered.count(), 2);
  assert.equal(await page.locator('[data-k-suggest] .k-k').count(), 2, 'a faint short ID on each Pa');
  await shot(page, '05-mention');
  await page.keyboard.press('Escape');
  await ta.fill('Thank you @Ri');
  await page.locator('[data-k-suggest] [data-k-pick]').first().waitFor();
  assert.equal(await page.locator('[data-k-suggest] .k-k').count(), 0, 'no short ID where the name is alone');
  await page.keyboard.press('Enter');
  assert.equal(await ta.inputValue(), 'Thank you @River ');
  await page.locator('#addressed', { hasText: 'To River' }).waitFor();
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /Left in the inbox of/);
  assert.ok((await peer.dub.inbox()).toYou.some((x) => x.text === 'Thank you @River'), 'a mention is an address: left in their inbox');

  // The act's menu on someone else's act: Copy act ID (H68), Reply.
  const theirs = cardOf(page, theirPost.post.id);
  await actMenu(theirs, 'Copy act ID');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), actForm(theirPost.post.id));
  await signerMenu(theirs, 'Copy ID');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), idForm(them));
  await actMenu(theirs, 'Reply');
  await page.locator('#replying', { hasText: 'Replying to River' }).waitFor();
  await shot(page, '06-replying');
  await ta.fill('Welcome, River.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /Left in the inbox of/);
  const reply = cardOf(page, (await app.dub.feed()).items.find((x) => x.text === 'Welcome, River.')!.id);
  await reply.locator('.k-label', { hasText: 'answers River' }).waitFor({ timeout: 60_000 });

  // The pop-up thread (H50): what the reply answers, a small feed box; Why it's valid inside replaces it, with a back arrow.
  await actMenu(reply, 'Open what it answers');
  const modal = page.locator('.k-modal');
  await modal.locator('.k-act').nth(1).waitFor({ timeout: 60_000 });
  assert.match(await modal.locator('.k-act').first().innerText(), /A first word from River\./);
  await shot(page, '07-thread');
  await actMenu(modal.locator('.k-act').first(), 'Why it’s valid');
  await modal.locator('h4', { hasText: 'Why it’s valid' }).waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /Verified: signed by this identity with a key its identity chain counts/);
  await shot(page, '08-why');
  await modal.locator('[data-k-popup="back"]').click();
  await modal.locator('.k-act', { hasText: 'A first word from River.' }).first().waitFor();
  await modal.locator('[data-k-popup="close"]').click();
  assert.equal(await page.locator('.k-modal').count(), 0);

  // Rely on it (H77): read back, RELY typed, the witness act signed.
  await actMenu(theirs, 'Rely on it');
  await modal.locator('form#rely').waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /I received this act and rely on it/);
  await modal.locator('form#rely input').fill('rely');
  await modal.getByRole('button', { name: 'Sign the witness act' }).click();
  await error(page, 'Type RELY');
  await modal.locator('form#rely input').fill('RELY');
  await modal.getByRole('button', { name: 'Sign the witness act' }).click();
  await done(page, /You rely on/);
  const witness = (await app.dub.state()).identity!.line.latest!;
  assert.deepEqual((describeAct((await relayAt(relay.base).getAct(witness))!) as { acks?: string[] }).acks, [theirPost.post.id]);

  // Correct one's own post: a correction, the original kept as signed (H74).
  const hello = (await app.dub.feed()).items.find((x) => x.text === 'Hello, from a page.')!;
  await actMenu(cardOf(page, hello.id), 'Correct it');
  await modal.locator('form#correct textarea').fill('Hello, from a page, corrected.');
  await modal.getByRole('button', { name: 'Sign the correction' }).click();
  await done(page, /Correction/);
  await page.locator('#feed .k-act', { hasText: 'Hello, from a page, corrected.' }).locator('.k-label', { hasText: 'Correction of' }).waitFor({ timeout: 60_000 });
  await cardOf(page, hello.id).locator('.k-label', { hasText: 'Corrected by' }).waitFor();
  // Correct it shows only on one's own acts.
  await theirs.locator('.k-actid').click();
  assert.equal(await page.getByRole('menuitem', { name: 'Correct it' }).count(), 0);
  await page.keyboard.press('Escape');

  // The three ways to pay, as Dub alone opens them: no lane yet (said), Ask Damgar, by hand.
  await actMenu(theirs, 'Tip');
  await modal.locator('form#pay').waitFor({ timeout: 60_000 });
  assert.ok(await modal.locator('input[value=lane]').isDisabled(), 'no lane from Damgar yet');
  assert.match(await modal.innerText(), /Dub has no lane from Damgar/);
  await modal.locator('input[name=value]').fill('300');
  await modal.locator('input[value=hand]').check();
  await shot(page, '09-pay-chooser');
  await modal.getByRole('button', { name: 'Tip' }).click();
  await modal.locator('textarea.dub-hand').waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /To River[\s\S]*Amount: 300/);
  await modal.locator('[data-k-popup="close"]').click();
  await actMenu(theirs, 'Tip');
  await modal.locator('input[name=value]').fill('300');
  await modal.locator('input[value=damgar]').check();
  await modal.getByRole('button', { name: 'Tip' }).click();
  await done(page, /Prepared, not signed/);

  // A profile, from the signer's menu: light and friendly; Pay there too.
  await signerMenu(theirs, 'Open profile');
  const prof = page.locator('.k-prof');
  await prof.waitFor({ timeout: 60_000 });
  await prof.locator('.k-act', { hasText: 'A first word from River.' }).waitFor({ timeout: 60_000 });
  assert.match(await prof.innerText(), /River[\s\S]*Lives on one home[\s\S]*Copy ID link[\s\S]*Following[\s\S]*Message[\s\S]*Pay[\s\S]*Full record in Kišib/);
  assert.equal(await prof.locator('.k-alarmbox').count(), 0, 'no red line without trouble');
  await shot(page, '10-profile');
  await prof.getByRole('button', { name: 'Pay' }).click();
  await modal.locator('form#pay[data-kind="pay"]').waitFor({ timeout: 60_000 });
  await modal.locator('[data-k-popup="close"]').click();
  await prof.getByRole('button', { name: '← Back' }).click();

  // The other side answers, and writes privately: counts on the switch and the lens; To you.
  const theirReply = await peer.dub.post({ text: 'Thank you for the hello.', reply: { id: hello.id, signer: me } });
  await peer.dub.message({ to: me, text: 'A word just for you.' });
  await page.getByRole('button', { name: 'Look again' }).click();
  await page.locator('[data-k-count="private"]', { hasText: '1' }).waitFor({ timeout: 60_000 });
  await page.locator('[data-k-count="toyou"]', { hasText: '1' }).waitFor({ timeout: 60_000 });
  await page.locator('[data-k-lens="toyou"]').click();
  await cardOf(page, theirReply.post.id).waitFor({ timeout: 60_000 });
  await shot(page, '11-to-you');
  // The Relay lens (H55): text and envelope acts by default; other layers behind the filter.
  await page.locator('[data-k-lens="relay"]').click();
  await page.locator('#feed .k-act', { hasText: 'Thank you for the hello.' }).waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('#feed .k-act .k-kind', { hasText: 'A display name' }).count(), 0, 'no display name by default');
  await shot(page, '12-relay');
  await page.locator('[data-k-layer="identity"]').click();
  await page.locator('#feed .k-act .k-kind', { hasText: 'A display name' }).first().waitFor({ timeout: 60_000 });
  await page.locator('#feed .k-act .k-kind', { hasText: 'A witness act' }).first().waitFor();
  await page.locator('[data-k-lens="following"]').click();

  // Private, a mailbox: River's message in its conversation; an answer, sealed.
  await page.locator('[data-k-part="private"]').click();
  await page.locator('[data-conv]', { hasText: 'River' }).click();
  await page.locator('#thread .k-act', { hasText: 'A word just for you.' }).waitFor({ timeout: 60_000 });
  await page.locator('#message textarea').fill('And one just for you.');
  await page.locator('#message').getByRole('button', { name: 'Send' }).click();
  await done(page, 'Sent');
  await page.locator('#thread .k-act', { hasText: 'And one just for you.' }).waitFor({ timeout: 60_000 });
  assert.ok((await peer.dub.inbox()).messages.some((m) => m.text === 'And one just for you.' && m.who.id === me));
  await shot(page, '13-private');
  // Someone new: an empty thread first; a Cc, seen by every recipient.
  await page.locator('[data-k-open="contacts"]').click();
  await page.locator('[data-k-contact]', { hasText: 'Pa' }).filter({ hasText: idForm(ph).slice(0, 7) }).getByRole('button', { name: 'Message' }).click();
  await page.locator('#thread .k-empty', { hasText: 'Nothing yet' }).waitFor();
  await shot(page, '14-private-new');
  await page.locator('[data-action="cc"]').click();
  await page.locator('#cc').pressSequentially('Riv');
  await page.locator('[data-k-suggest] [data-k-pick]').first().click();
  await page.locator('#ccs', { hasText: 'Cc: River' }).waitFor();
  await page.locator('#message textarea').fill('To Ph, River in Cc.');
  await page.locator('#message').getByRole('button', { name: 'Send' }).click();
  await done(page, /in Cc/);
  for (const r of [third, peer]) {
    const got = (await r.dub.inbox()).messages.find((m) => m.text === 'To Ph, River in Cc.')!;
    assert.ok(got, 'each recipient opens it');
    assert.deepEqual(got.cc.map((x) => x.id).sort(), [ph, them].filter((x) => x !== (r === third ? ph : them)).sort(), 'each sees who else received it');
  }
  await page.locator('#thread .k-act', { hasText: 'To Ph, River in Cc.' }).locator('.k-label', { hasText: 'Cc: River' }).waitFor({ timeout: 60_000 });
  await shot(page, '15-private-cc');

  // Purchases: nothing bought yet, said.
  await page.locator('[data-k-part="purchases"]').click();
  await page.locator('#bought .k-empty', { hasText: 'Nothing bought here yet' }).waitFor({ timeout: 60_000 });
  assert.deepEqual((await page.locator('[data-k-shelf]').allInnerTexts()).map((t) => t.trim()), ['All', 'Files', 'Vows']);
  await shot(page, '16-purchases');

  // Mute, from the signer's menu: nothing of it shown; unmuted in Contacts.
  await page.locator('[data-k-part="public"]').click();
  await signerMenu(cardOf(page, theirPost.post.id), 'Mute');
  await page.waitForFunction((id) => !document.querySelector(`#feed [data-k-act="${id}"]`), theirPost.post.id, { timeout: 60_000 });
  await page.locator('[data-k-open="contacts"]').click();
  await page.locator('[data-k-panel="contacts"] details.k-say summary', { hasText: 'Muted (1)' }).click();
  await page.locator('[data-k-panel="contacts"]').getByRole('button', { name: 'Unmute' }).click();
  await cardOf(page, theirPost.post.id).waitFor({ timeout: 60_000 });
  await page.keyboard.press('Escape');

  // The identity panel, top right: its menu; a display name; the signing key's words.
  await page.locator('[data-k-open="identity"]').click();
  const idp = page.locator('[data-k-panel="identity"]');
  await idp.locator('[data-k-use][aria-current]', { hasText: 'Ada' }).waitFor();
  await shot(page, '17-identity-panel');
  await idp.locator(`[data-k-idmenu="${me}"]`).click();
  assert.deepEqual((await page.locator('.k-pop [data-k-item]').allInnerTexts()).map((x) => x.split('\n')[0]), ['Name', 'Relays', 'Words', 'Line and homes', 'A lane from Damgar', 'A collective under it', 'Remove from Dub…']);
  await shot(page, '18-identity-menu');
  await page.getByRole('menuitem', { name: /^Name/ }).click();
  await modal.locator('form#name input').fill('Ada Lovelace');
  await modal.getByRole('button', { name: 'Save' }).click();
  await done(page, /Your display name is “Ada Lovelace”/);
  await page.locator('[data-k-open="identity"]').click();
  await page.locator(`[data-k-idmenu="${me}"]`).click();
  await page.getByRole('menuitem', { name: /^Words/ }).click();
  await modal.locator('#carry-words').waitFor({ timeout: 60_000 });
  const carry = (await modal.locator('#carry-words span').allInnerTexts()).map((t) => t.replace(/^\d+\.\s*/, '').trim());
  assert.notDeepEqual(carry, written, 'the signing key’s words, never the chain key’s');
  assert.match(await modal.innerText(), /post as this identity and read its private messages/);
  await modal.locator('[data-k-popup="close"]').click();

  // A second identity, brought by its words from + Add; switched to; its key changed elsewhere: refused, said, the new words taken.
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  await page.locator('[data-k-open="identity"]').click();
  await page.locator('[data-k-add="toggle"]').click();
  assert.ok(await page.locator('[data-k-add="kishib"]').isDisabled(), 'use one from Kišib: an empty place for round 2');
  await page.locator('[data-k-add="bring"]').click();
  const bring = modal.locator('form#bring');
  await bring.locator('input[name=id]').fill(groupId(g.id));
  await bring.locator('textarea[name=words]').fill(toWords(unhex(g.f.signingSecret)).join(' '));
  await bring.locator('input[name=address]').fill(homes[0].base);
  await bring.getByRole('button', { name: 'Bring it' }).click();
  await done(page, 'The identity is here');
  assert.equal((await app.dub.state()).identity!.id, g.id, 'the brought one in use');
  await g.prepareRotation();
  await g.submitRotation();
  assert.ok((await g.settleRotation()).counts);
  const before = (await app.dub.state()).identity!.line.acts;
  await page.locator('#post textarea').fill('Signed with a retired key?');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await page.locator('#spent-box', { hasText: /changed elsewhere[\s\S]*Kišib/ }).waitFor({ timeout: 60_000 });
  assert.equal((await app.dub.state()).identity!.line.acts, before, 'nothing signed with the retired key (H80)');
  await shot(page, '19-key-changed-elsewhere');
  await page.locator('form#renew textarea').fill(toWords(unhex(g.f.signingSecret)).join(' '));
  await page.getByRole('button', { name: 'Use the new words' }).click();
  await done(page, 'The new words are in use');
  assert.equal(await page.locator('#spent-box').count(), 0);

  // Remove, said plainly first (H58): nothing removed until confirmed.
  await page.locator('[data-k-open="identity"]').click();
  await page.locator(`[data-k-idmenu="${g.id}"]`).click();
  await page.getByRole('menuitem', { name: 'Remove from Dub…' }).click();
  await page.locator('[data-k-remove]', { hasText: /forgets[\s\S]*itself is not touched/ }).waitFor();
  assert.equal((await app.dub.state()).held.length, 2, 'nothing removed before it is confirmed');
  await shot(page, '20-identity-remove');
  await page.locator('[data-k-remove-yes]').click();
  await done(page, 'Removed from Dub');
  assert.deepEqual((await app.dub.state()).held.map((h) => h.id), [me]);
  await noFindingNumber(page);

  // The same page at a phone's size: the switch, an act's menu as a sheet, the mailbox's back arrow, the panel.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-k-part="public"]').click();
  await page.locator('#feed .k-act').first().waitFor({ timeout: 60_000 });
  await shot(page, '01-public', 'phone');
  await page.locator('#feed .k-act').first().locator('.k-actid').click();
  await page.locator('.k-pop').waitFor();
  const sheet = (await page.locator('.k-pop').boundingBox())!;
  assert.ok(sheet.x <= 10 && sheet.x + sheet.width >= 380, 'a sheet across the phone');
  await shot(page, '02-act-menu', 'phone');
  await page.keyboard.press('Escape');
  await page.locator('[data-k-part="private"]').click();
  // The conversation open before is open again, its back arrow first.
  if (await page.locator('[data-action="convs"]').isVisible()) await page.locator('[data-action="convs"]').click();
  await page.locator(`[data-conv="${them}"]`).click();
  await page.locator('#thread .k-act').first().waitFor({ timeout: 60_000 });
  assert.equal(await page.locator('.dub-convs').isVisible(), false, 'the conversations fold away once one is chosen');
  await shot(page, '03-private', 'phone');
  await page.locator('[data-action="convs"]').click();
  assert.equal(await page.locator('.dub-convs').isVisible(), true, 'the back arrow brings them again');
  await page.locator('[data-k-open="identity"]').click();
  await shot(page, '04-identity-panel', 'phone');
  await page.keyboard.press('Escape');
  await noFindingNumber(page);

  assert.deepEqual(problems, []);
  await context.close();
});
