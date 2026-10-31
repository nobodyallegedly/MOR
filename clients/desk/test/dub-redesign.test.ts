// Dub after the redesign (21 October 2026), by clicks in its page on the Mac,
// beside the apps it works with: Damgar granting Dub's lane, Edubba
// publishing a sealed picture and two vows, the anchoring service offering
// its tiers. The three ways to pay, each from one chooser: under Dub's lane
// (a tip, a picture bought and opened, two vows bought), Ask Damgar, by hand;
// Purchases after a buy, each vow confirmed or contested from its own menu;
// an act anchored from its menu, prepared for Damgar; a collective under the
// identity (its member's own key), appended to a private message and checked
// by the reader's Dub, and posted as from the identity panel. No console
// error, nothing the content security policy refused. `MOR_SCREENSHOTS=DIR`
// keeps a picture of each screen.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Locator, type Page } from 'playwright-core';
import { closeAll, dub as dubOf, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { FakeChain, addressScript } from '../../damgar/test/chain.ts';
import { StubLnd, TestNode } from '../../damgar/test/node.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import { idForm } from '../../genesis/src/forms.ts';
import { foundCollective } from './cast.ts';
import type { PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
import type { Done } from '../src/page/api.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const R = SPEC.units.regtest;
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const JPEG = readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));

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
  for (const h of [...homes, relay]) await h.stop();
});

const shot = async (page: Page, name: string, size = 'mac') => {
  if (shots) await page.screenshot({ path: join(shots, `${size}-${name}.png`) });
};
async function done(page: Page, words: string | RegExp) {
  try {
    await page.locator('#status .k-note.k-done', { hasText: words }).waitFor({ timeout: 90_000 });
  } catch (e) {
    throw new Error(`${e instanceof Error ? e.message : e}\nThe page said: ${await page.locator('#status').innerText().catch(() => '(nothing)')}`);
  }
}
const actMenu = async (c: Locator, item: string | RegExp) => {
  await c.locator('.k-actid').click();
  await c.page().getByRole('menuitem', { name: item, exact: typeof item === 'string' }).click();
};

/** A Dub page on the Mac, paired, in a browser profile of its own. */
async function pageOf(app: { base: string; access: { newCode(): string } }): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('console', (m) => {
    if ((m.type() === 'error' && !/status of 4\d\d/.test(m.text())) || /Content Security Policy/i.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('dialog', (d) => void d.accept());
  await page.goto(`${app.base}/#pair=${app.access.newCode()}`);
  await page.locator('#feed').waitFor({ timeout: 60_000 });
  await page.evaluate(() => document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP refused ${e.blockedURI} (${e.violatedDirective})`)));
  return page;
}

/** The lane's invoice: the seller's Damgar answers the request once Dub has sent it; paid in the wallet (the test node), its preimage typed back in the pop-up. */
async function payInvoice(page: Page, preimages: Map<string, string>, seller: { ask(op: string): Promise<unknown> }) {
  const modal = page.locator('.k-modal');
  const form = modal.locator('form#paid').first();
  await modal.getByText(/invoice requested/).first().waitFor({ timeout: 90_000 });
  // Dub looks again by itself while the payment's place is open.
  for (let i = 0; i < 12 && !(await form.isVisible()); i++) {
    await seller.ask('look');
    await form.waitFor({ timeout: 8_000 }).catch(() => undefined);
  }
  const invoice = await modal.locator('textarea.dub-hand').first().inputValue();
  await form.locator('input[name=proof]').fill(preimages.get(invoice)!);
  await form.getByRole('button', { name: /Check it and sign the claim/ }).click();
  await done(page, /claim/i);
  await modal.locator('[data-k-popup="close"]').click();
}

test('paying from Dub three ways, Purchases, a vow confirmed and another contested from their menus, an act anchored, by clicks', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const seller = await person(H, [relay.base], { link: link.factory });
  const rv = await seller.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await seller.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await seller.damgar.c.ask('link', link.config);
  const own = await seller.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await seller.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  await seller.dub.c.ask('name', { name: 'Seller' });
  const sold = await seller.dub.c.ask<{ post: { id: string } }>('post', { text: 'Tablets, fired today.' });

  // Edubba publishes a sealed picture and two vows, as the seller.
  const e = await edubba(H, [relay.base]);
  await e.c.ask('bring', { name: 'Seller', id: seller.id, words: seller.dub.words, address: H[0] });
  const p = await e.c.ask<any>('publishing upload read', { media: 'picture', data: b64(JPEG), title: 'A tablet, photographed', then: 'price', price: '2000' }); // Round 8: an upload with a price tag on the bare bake (was a protected file with an offer).
  const [publication, , picturePost] = (await e.c.ask<Done>('publishing confirm', { plan: p.plan, digest: p.digest })).acts;
  const vows: string[] = [];
  for (const words of ['A seat at the reading of the tablets.', 'A walk to the clay pits.']) {
    const r = await e.c.ask<any>('publishing vow read', { words, title: words.slice(0, 20), price: '500' });
    vows.push((await e.c.ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest })).acts[2]);
  }

  // The buyer: Dub and Damgar holding the same identity, Dub's page by clicks.
  const buyer = await person(H, [relay.base]);
  const page = await pageOf(buyer.dub.app);
  const modal = page.locator('.k-modal');

  // Before any lane: the chooser says so; Ask Damgar and by hand are open for a tip, not for a purchase.
  await page.locator('[data-k-open="contacts"]').click();
  await page.locator('form#follow input[name=id]').fill(idForm(seller.id));
  await page.locator('form#follow input[name=name]').fill('Seller');
  await page.getByRole('button', { name: 'Add to contacts' }).click();
  await done(page, 'Added to contacts');
  await page.keyboard.press('Escape');
  const tipped = page.locator(`#feed [data-k-act="${sold.post.id}"]`);
  await tipped.waitFor({ timeout: 90_000 });
  await actMenu(tipped, 'Tip');
  await modal.locator('form#pay').waitFor({ timeout: 60_000 });
  assert.ok(await modal.locator('input[value=lane]').isDisabled());
  assert.ok(await modal.locator('input[value=damgar]').isEnabled());
  await modal.locator('[data-k-popup="close"]').click();
  const picture = page.locator(`#feed [data-k-act="${picturePost}"]`);
  await picture.waitFor({ timeout: 90_000 });
  await actMenu(picture, 'Buy');
  await modal.locator('form#pay').waitFor({ timeout: 60_000 });
  for (const w of ['lane', 'damgar', 'hand']) assert.ok(await modal.locator(`input[value=${w}]`).isDisabled(), `${w}: not open for a purchase without a lane`);
  assert.match(await modal.innerText(), /A purchase follows the seller’s price tag/);
  await modal.locator('[data-k-popup="close"]').click();

  // A lane, asked from the identity's menu, granted in Damgar.
  await page.locator('[data-k-open="identity"]').click();
  await page.locator(`[data-k-idmenu="${buyer.id}"]`).click();
  await page.getByRole('menuitem', { name: /^A lane from Damgar/ }).click();
  await modal.locator('form#lane input[name=cap]').fill('5000');
  await shot(page, '21-lane');
  await modal.getByRole('button', { name: 'Ask Damgar for this lane' }).click();
  await done(page, /Asked, not granted/);
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });

  // Way one, under Dub's lane: a tip, the invoice paid in the wallet, the claim signed here.
  await actMenu(tipped, 'Tip');
  await modal.locator('input[value=lane]:not([disabled])').waitFor({ timeout: 60_000 });
  assert.match(await modal.innerText(), /Per payment: at most 5[\s\S]?000[\s\S]*paid under it so far: nothing yet/);
  await modal.locator('input[name=value]').fill('300');
  await modal.locator('input[value=lane]').check();
  await shot(page, '22-pay-chooser-lane');
  await modal.getByRole('button', { name: 'Tip' }).click();
  await payInvoice(page, link.preimages, seller.damgar.c);
  // Way two, Ask Damgar: a money message Damgar queues.
  await actMenu(tipped, 'Tip');
  await modal.locator('input[name=value]').fill('200');
  await modal.locator('input[value=damgar]').check();
  await modal.getByRole('button', { name: 'Tip' }).click();
  await done(page, /Prepared, not signed/);
  await buyer.damgar.c.ask('look');
  assert.ok((await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.some((i) => i.kind === 'draft'), 'it waits in Damgar');
  // Way three, by hand: shown to copy, nothing signed.
  await actMenu(tipped, 'Tip');
  await modal.locator('input[name=value]').fill('100');
  await modal.locator('input[value=hand]').check();
  await modal.getByRole('button', { name: 'Tip' }).click();
  await modal.locator('textarea.dub-hand').waitFor({ timeout: 60_000 });
  await modal.getByRole('button', { name: 'Copy it' }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await modal.locator('textarea.dub-hand').inputValue());
  await shot(page, '23-by-hand');
  await modal.locator('[data-k-popup="close"]').click();

  // The picture bought under the lane, paid; the seller's Damgar receipts it; Edubba delivers its key; Purchases shows it opened.
  await actMenu(picture, 'Buy');
  await modal.locator('input[value=lane]:not([disabled])').waitFor({ timeout: 60_000 });
  await modal.getByRole('button', { name: 'Buy it' }).click();
  await payInvoice(page, link.preimages, seller.damgar.c);
  await seller.damgar.c.ask('look');
  await e.c.ask('publishing deliver');
  // Two vows bought, each from its own menu.
  for (const v of vows) {
    const card = page.locator('#feed .k-act', { has: page.locator('.k-kind', { hasText: 'vow' }) }).filter({ hasText: v === vows[0] ? 'A seat at the reading' : 'A walk to the clay pits' });
    await page.getByRole('button', { name: 'Look again' }).click();
    await card.waitFor({ timeout: 90_000 });
    await actMenu(card, 'Buy');
    await modal.locator('input[value=lane]:not([disabled])').waitFor({ timeout: 60_000 });
    await modal.getByRole('button', { name: 'Buy it' }).click();
    await payInvoice(page, link.preimages, seller.damgar.c);
  }
  await seller.damgar.c.ask('look');
  await e.c.ask('publishing deliver');
  await page.locator('[data-k-part="purchases"]').click();
  // The key and the seller's receipts arrive in their own time: Look again until they have.
  const arrived = async () => (await page.locator('#bought .k-act img').isVisible()) && !/not paid yet/.test(await page.locator('#bought').innerText());
  for (let i = 0; i < 15 && !(await arrived()); i++) {
    await page.locator('#bought-foot').getByRole('button', { name: 'Look again' }).click();
    await page.waitForTimeout(4_000);
  }
  const pic = page.locator('#bought .k-act', { has: page.locator('img') });
  assert.match(await pic.innerText(), /picture · bought/i);
  assert.match(await pic.innerText(), /opened/);
  await page.locator('[data-k-shelf="vows"]').click();
  await page.locator('#bought .k-act', { hasText: 'A walk to the clay pits' }).waitFor();
  assert.equal(await page.locator('#bought .k-act img').count(), 0, 'Vows: the vows only');
  await shot(page, '24-purchases');
  // Confirm one, contest the other, each in its own menu, below a line (decided, question 5).
  const seat = page.locator('#bought .k-act', { hasText: 'A seat at the reading' });
  await seat.locator('.k-actid').click();
  await page.getByRole('menuitem', { name: 'Confirm: it was kept' }).waitFor();
  await shot(page, '25-vow-menu');
  await page.getByRole('menuitem', { name: 'Confirm: it was kept' }).click();
  await done(page, /reads confirmed/);
  const walk = page.locator('#bought .k-act', { hasText: 'A walk to the clay pits' });
  await actMenu(walk, 'Contest it…');
  await modal.locator('form#contest input').fill('The pits were closed.');
  await modal.getByRole('button', { name: 'Contest it' }).click();
  await done(page, /contest of that sale is signed/);
  await page.locator('#bought .k-act', { hasText: 'A seat at the reading' }).locator('.k-label', { hasText: 'confirmed: it was kept' }).waitFor({ timeout: 90_000 });
  await page.locator('#bought .k-act', { hasText: 'A walk to the clay pits' }).locator('.k-label', { hasText: 'contested' }).waitFor();
  await seat.locator('.k-actid').click();
  assert.equal(await page.getByRole('menuitem', { name: 'Confirm: it was kept' }).count(), 0, 'confirmed: no confirm or contest left');
  await page.keyboard.press('Escape');

  // An act anchored from its menu: the service's offer read, a tier chosen, the payment prepared for Damgar.
  const chain = new FakeChain();
  chain.mine(10);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'dub-svc-')), 'svc'), new StubLnd(chain, addressScript), chain, { homes: H, relays: [relay.base] });
  await svc.start();
  await page.locator('[data-k-part="public"]').click();
  await actMenu(tipped, 'Anchor it');
  await modal.locator('form#anchor-offers input[name=service]').fill(idForm(svc.id));
  await modal.getByRole('button', { name: 'Read its offer' }).click();
  await modal.locator('form#anchor input[name=tier]').first().waitFor({ timeout: 90_000 });
  await shot(page, '26-anchor');
  await modal.getByRole('button', { name: 'Prepare the payment for Damgar' }).click();
  await done(page, /Asked: an anchor/);
  await buyer.damgar.c.ask('look');
  assert.ok((await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.some((i) => i.lines.some((l) => /anchor/i.test(l.text))), 'the anchor waits in Damgar');

  assert.deepEqual(problems, []);
  await page.context().close();
  void ({} as PaymentShown);
});

test('a collective under the identity: appended to a private message, checked by the reader; posted as, from the identity panel', async () => {
  const H = homes.map((h) => h.base);
  const e = await edubba(H, [relay.base]);
  const A = (await e.c.ask<Done>('identity', { name: 'A', linked: false })).acts[0];
  const max = await dubOf(H, [relay.base]);
  const pa = await dubOf(H, [relay.base]);
  await max.c.ask('name', { name: 'Max' });
  await pa.c.ask('name', { name: 'Pa' });
  const { collective } = await foundCollective(e, A, [max, pa], [{ name: 'Posts', layer: [1, 2], holders: [A, max.id, pa.id], number: 1 }], { name: 'Collective Y' });

  const page = await pageOf(max.app);
  const modal = page.locator('.k-modal');
  // The collective, added under Max from Max's own menu: its member key found at Max's homes.
  await page.locator('[data-k-open="identity"]').click();
  await page.locator(`[data-k-idmenu="${max.id}"]`).click();
  await page.getByRole('menuitem', { name: /^A collective under it/ }).click();
  await modal.locator('form#collective input[name=id]').fill(idForm(collective));
  await modal.getByRole('button', { name: 'Add it under this identity' }).click();
  await done(page, /is under this identity/);
  await page.locator('[data-k-open="identity"]').click();
  const sub = page.locator(`[data-k-use="${collective}"][data-k-under="${max.id}"]`);
  await sub.waitFor();
  await shot(page, '27-identity-panel-collective');

  // A private message to Pa, in Max's own name, the collective appended; Pa's Dub shows it, the membership checked.
  await page.keyboard.press('Escape');
  await page.locator('[data-k-open="contacts"]').click();
  await page.locator('form#follow input[name=id]').fill(idForm(pa.id));
  await page.locator('form#follow input[name=name]').fill('Pa');
  await page.getByRole('button', { name: 'Add to contacts' }).click();
  await done(page, 'Added to contacts');
  await page.locator(`[data-k-contact="${pa.id}"]`).getByRole('button', { name: 'Message' }).click();
  await page.locator(`[data-append="${collective}"]`).click();
  await page.locator('#message textarea').fill('Can Collective Y bring the tablets on Thursday?');
  await page.locator('#message').getByRole('button', { name: 'Send' }).click();
  await done(page, /collective .* appended/);
  await page.locator('#thread .k-act .k-of').waitFor({ timeout: 90_000 });
  await shot(page, '28-private-appended');
  const got = (await pa.c.ask<{ messages: { text: string; of: { id: string; checked: boolean } | null }[] }>('inbox')).messages.find((m) => m.text === 'Can Collective Y bring the tablets on Thursday?')!;
  assert.deepEqual([got.of?.id, got.of?.checked], [collective, true], 'the reader’s app checked the membership');

  // Acting as the collective: the same gesture as switching; a post signed with Max's own key, naming the collective (no member keys, rule 58).
  await page.locator('[data-k-part="public"]').click();
  await page.locator('[data-k-open="identity"]').click();
  await page.locator(`[data-k-use="${collective}"]`).click();
  await page.locator('.k-me .k-dot.k-c').waitFor({ timeout: 60_000 });
  await page.locator('#post textarea').fill('Collective Y’s first word.');
  await page.getByRole('button', { name: 'Post', exact: true }).click();
  await done(page, /Posted for the collective, signed with your own key and naming the collective/);
  await page.locator('#feed .k-act', { hasText: 'Collective Y’s first word.' }).waitFor({ timeout: 90_000 });
  // A collective writes in public only from Dub: in Private, Max writes in its own name and appends it.
  await page.locator('[data-k-part="private"]').click();
  await page.locator(`[data-conv="${pa.id}"]`).click();
  await page.locator('#message textarea').fill('As the collective?');
  await page.locator('#message').getByRole('button', { name: 'Send' }).click();
  await page.locator('#status .k-note.k-error', { hasText: 'A collective writes in public only' }).waitFor({ timeout: 60_000 });
  await shot(page, '29-acting-as-collective');
  assert.deepEqual(problems, []);
  await page.context().close();
});
