// After S7d (F386): a buyer's contest of a purchase, and the signer's own
// hint. A file published from Edubba, bought from Dub under its lane, paid,
// its key delivered; then contested from Dub's Purchases ("Contest it…"):
// the contest is shown beside the purchase in Dub and in Edubba's Sales. The
// same contest signed by another identity shows nothing. And an act carrying
// the signer's own hint (field 9) carries it into Dub's feed, labelled on the
// kit's card; one without carries none. Real homes and relay, Damgar's
// programs, a test Lightning node. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { MIRS, describeAct, purchaseContestPayload } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { card } from '../../kit/src/html.ts';
import { itemAct } from '../../dub/src/page/view.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import type { PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
import type { Done } from '../src/page/api.ts';
import { chromium, type Browser } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
// MOR_SCREENSHOTS=DIR keeps a picture of each screen.
const shots = process.env.MOR_SCREENSHOTS;
if (shots) mkdirSync(shots, { recursive: true });
let browser: Browser;

let homes: Relay[];
let relay: Relay;

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

const R = SPEC.units.regtest;
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
type Beside = { state: 'shown' | 'unknown'; contests: { act: string; promise: string | null }[]; why?: string };
type Bought = { id: string; kind: string; paid?: boolean; contests?: Beside | null };

test('a file bought from Dub, contested there: shown beside the purchase in Dub and in Edubba’s Sales; the same contest by another identity shows nothing; the signer’s own hint carried to the card, labelled', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const seller = await person(H, [relay.base], { link: link.factory });
  const buyer = await person(H, [relay.base]);
  const rv = await seller.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await seller.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await seller.damgar.c.ask('link', link.config);
  const own = await seller.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await seller.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  await buyer.dub.c.ask('lane ask', { label: 'Dub on the Mac', cap: '5000', unit: R });
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });

  // A protected text, published from Edubba as the seller.
  const e = await edubba(H, [relay.base]);
  await e.c.ask('bring', { name: 'Seller', id: seller.id, words: seller.dub.words, address: H[0] });
  const read = await e.c.ask<{ plan: string; digest: string }>('publishing work read', { media: 'text', data: b64(new TextEncoder().encode('The full concert, in words.')), title: 'The concert', price: '1000' });
  const [publication, , post] = (await e.c.ask<Done>('publishing confirm', { plan: read.plan, digest: read.digest })).acts;

  // Bought from Dub, paid, receipted, its key delivered by Edubba.
  await buyer.dub.c.ask('follow', { id: seller.id, name: 'Seller' });
  await buyer.dub.c.ask('feed', { fresh: true });
  await buyer.dub.c.ask('buy', { publication, seller: seller.id, post });
  // Not paid yet: no contest can name the purchase.
  await assert.rejects(buyer.dub.c.ask('purchase contest', { publication, promise: '' }), /not paid yet/);
  await seller.damgar.c.ask('look');
  const pay = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments[0];
  await buyer.dub.c.ask('paid', { key: pay.key, proof: link.preimages.get(pay.pay!.invoice!)! });
  await seller.damgar.c.ask('look');
  await e.c.ask('publishing deliver');
  await buyer.dub.c.ask('money look');

  // Paid, and nothing contested: shown as none, beside the purchase in Dub and in Edubba's Sales.
  let bought = (await buyer.dub.c.ask<{ items: Bought[] }>('purchases')).items.find((i) => i.id === publication)!;
  assert.equal(bought.paid, true);
  assert.deepEqual(bought.contests, { state: 'shown', contests: [] });
  let sales = await e.c.ask<{ by: Record<string, Record<string, Beside>> }>('publishing sales contests');
  assert.deepEqual(sales.by[publication]?.[buyer.id], { state: 'shown', contests: [] });

  // Contested from Dub's Purchases, the promise not kept in words.
  const said = await buyer.dub.c.ask<{ lines: { text: string }[] }>('purchase contest', { publication, promise: 'A slideshow, not the concert.' });
  assert.match(said.lines[0].text, /shown beside the purchase[\s\S]*undoes nothing/);
  bought = (await buyer.dub.c.ask<{ items: Bought[] }>('purchases')).items.find((i) => i.id === publication)!;
  assert.equal(bought.contests?.state, 'shown');
  assert.equal(bought.contests?.contests.length, 1);
  assert.equal(bought.contests?.contests[0].promise, 'A slideshow, not the concert.');
  const contest = bought.contests!.contests[0].act;
  sales = await e.c.ask<{ by: Record<string, Record<string, Beside>> }>('publishing sales contests');
  assert.deepEqual(sales.by[publication]?.[buyer.id], { state: 'shown', contests: [{ act: contest, promise: 'A slideshow, not the concert.' }] }, 'the seller sees it beside the sale');

  // By clicks, in Dub's Purchases: the contest beside the purchase, and "Contest it…" below the line of the act's menu.
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const problems: string[] = [];
  page.on('pageerror', (x) => problems.push(x.message));
  await page.goto(`${buyer.dub.app.base}/#pair=${buyer.dub.app.access.newCode()}`);
  await page.locator('[data-k-part="purchases"]').click({ timeout: 60_000 });
  const cardHere = page.locator('#bought .k-act', { hasText: 'Contested by you, shown beside it: “A slideshow, not the concert.”' });
  await cardHere.waitFor({ timeout: 60_000 });
  await cardHere.locator('.k-actid').click();
  await page.locator('.k-pop .k-own ~ button', { hasText: 'Contest it…' }).waitFor();
  if (shots) await page.screenshot({ path: join(shots, 'dub-purchase-contested.png') });
  await page.keyboard.press('Escape');
  // And in Edubba's Publishing › Sales, beside the sale, in red.
  await page.goto(`${e.app.base}/#pair=${e.app.access.newCode()}`);
  await page.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });
  await page.locator('.k-col button', { hasText: 'Sales' }).click();
  await page.locator('.k-label.k-bad.edubba-beside', { hasText: 'Contested by its buyer: “A slideshow, not the concert.”' }).waitFor({ timeout: 60_000 });
  if (shots) await page.screenshot({ path: join(shots, 'mac-34-sales-contested.png') });
  assert.deepEqual(problems, []);

  // The contest names the purchase: the buyer's own payer's claim, as its object.
  const contestAct = (await relayAt(relay.base).getAct(contest))!;
  const d = describeAct(contestAct) as { spec: string; type: number; signer: string; objects: [string, string][] };
  assert.deepEqual([d.spec, d.type, d.signer], [MIRS.agreements, 14, buyer.id]);
  const purchase = d.objects[0][0];
  assert.deepEqual(d.objects, [[purchase, purchase]]);

  // The same contest, signed by another identity: it shows nothing, in Dub or in Edubba.
  const other = TestIdentity.create({ homes: [homes[0].home] });
  await other.publishGenesis();
  await other.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  for (const a of other.chainActs()) await relayAt(relay.base).putAct(a);
  await other.publish(MIRS.agreements, 14, purchaseContestPayload(purchase, 'Not what was paid for.') as Uint8Array, { public: true, relays: [relay.base], objects: [[purchase, purchase]] });
  bought = (await buyer.dub.c.ask<{ items: Bought[] }>('purchases')).items.find((i) => i.id === publication)!;
  assert.deepEqual(bought.contests?.contests.map((x) => x.act), [contest], 'only the buyer’s own contest');
  sales = await e.c.ask<{ by: Record<string, Record<string, Beside>> }>('publishing sales contests');
  assert.deepEqual(sales.by[publication]?.[buyer.id].contests.map((x) => x.act), [contest]);

  // The signer's own hint: written by a test identity (no app writes one yet), read into Dub's feed, labelled on the card; none where none was written.
  const hinted = await other.publish(POST_SPECS.text, TEXT_ACT, textPayload('With a hint.'), { public: true, relays: [relay.base], hint: '2026-10-23T09:40:00Z' });
  const plain = await other.publish(POST_SPECS.text, TEXT_ACT, textPayload('Without one.'), { public: true, relays: [relay.base] });
  await buyer.dub.c.ask('follow', { id: other.id, name: 'Other' });
  const feed = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items;
  const withHint = feed.find((i) => i.id === hinted.id);
  const without = feed.find((i) => i.id === plain.id);
  assert.equal(withHint?.hint, '2026-10-23T09:40:00Z');
  assert.equal(without?.hint ?? null, null);
  const shown = card(itemAct(withHint, []));
  assert.match(shown, /class="k-hint"[^>]*>the signer’s own hint: 2026-10-23T09:40:00Z</);
  assert.doesNotMatch(card(itemAct(without, [])), /k-hint|own hint/);
  // Where a clock stamped the act, the card shows that clock's time, not the hint.
  assert.doesNotMatch(card({ ...itemAct(withHint, []), when: '09:41' }), /own hint/);
});
