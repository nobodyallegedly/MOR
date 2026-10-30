// Buying and tipping in Dub on the redesigned core (F407, round 8): the
// bake, the price tag and the publication.
//
// In plain words: a work is uploaded (a bake) and sold by a price tag.
// Where its owners sell it through a publication, the publication's split
// service signs the tag, receives the payment, and pays the publication's
// partners first, then the owners. A tip to a work goes through the
// publication where it was found, never to whoever posted it. Someone who
// re-uploads the same work and puts their own price tag on it is paid
// alone: Dub says so plainly, by comparing the bake's uploader with the
// owners the work's claim's ownership agreement names, and leads the buyer
// to the owners' own publication.
//
// Real homes and a relay; the owners, their split service, a partner and a
// re-uploader are test identities signing with the shared code; the buyer
// uses Dub, through its operations and then, by clicks, its page. Every
// server is stopped in `after`, whatever the outcome.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { MIRS, publicationPayload } from '../../genesis/src/core.ts';
import { referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { lockWork } from '../../barebone/src/sealed.ts';
import { BAKE, POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { putTag } from '../../barebone/src/tag.ts';
import { SPLIT_CMIP, planIn, sign } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { claimPayload, dealTermsPayload } from '../../grants/src/deal.ts';
import { UNITS_MODULES } from '../../damgar/src/units.ts';
import { serve, type Running } from '../src/server.ts';
import type { Item, PayWays } from '../src/shapes.ts';
import { stopAll } from './stop.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SATS = UNITS_MODULES[0].units.find((u) => u.network === 3)!.hash;
const PHONE = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)));
const OTHER = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/cmyk.jpg', import.meta.url)));
const shots = process.env.MOR_SCREENSHOTS;

let homes: Relay[] = [];
let relay: Relay | undefined;
let app: Running | undefined;
let browser: Browser | undefined;

// The cast: two owners, their split service, a partner (a label), a re-uploader.
let ada: TestIdentity;
let bo: TestIdentity;
let svc: TestIdentity;
let label: TestIdentity;
let pirate: TestIdentity;
const w: Record<string, string> = {};

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-sales-')), port: 0 });
  const H = homes.map((h) => h.home);
  const R = [relay.base];
  const someone = async () => {
    const x = TestIdentity.create({ homes: H });
    await x.publishGenesis();
    await x.publishRoutes([{ scope: null, hints: R, kind: 0 }]);
    for (const a of x.chainActs()) await relayAt(relay!.base).putAct(a);
    return x;
  };
  [ada, bo, svc, label, pirate] = [await someone(), await someone(), await someone(), await someone(), await someone()];

  // The work, uploaded by Ada: a picture sealed for sale (its key absent), its bytes at the relay.
  const work = lockWork({ media: 'picture', bytes: PHONE, relays: R });
  const bake = await ada.publish(POST_SPECS.envelopes, BAKE, work.payload, { public: true, relays: R });
  await relayAt(relay.base).putMedia(work.locked);
  w.bake = bake.id;
  w.work = work.work;
  // Its claim (Ada and Bo made it), completed by Bo's signature; its ownership agreement, 60% and 40%.
  const claim = await ada.publish(MIRS.agreements, AGREEMENTS_TYPES.claim, claimPayload(work.work, [ada.id, bo.id]), { public: true, relays: R });
  await sign(bo, claim.id, R);
  const deal = { title: 'Two voices', what: 'a picture', shares: [[ada.id, 600_000], [bo.id, 400_000]] as [string, number][], claim: claim.id, referral: 0, service: svc.id };
  const terms = await ada.publish(MIRS.agreements, AGREEMENTS_TYPES.terms, dealTermsPayload(deal, '“Two voices”: Ada and Bo own this picture, 60% and 40%.'), { public: true, relays: R });
  await sign(bo, terms.id, R);
  w.agreement = terms.id;
  // Their publication: the bake sold, the label a partner at 5% off the top, the split service paying everyone.
  const p = publicationPayload({ sold: [{ bake: bake.id }], owners: terms.id, service: svc.id, plan: planIn({ roles: [], cmip: SPLIT_CMIP }), partners: [{ identity: label.id, share: 50_000, label: 'label' }], words: 'Two voices, a picture. Delivered by its key once paid.' }) as { type: number; payload: Uint8Array };
  const pub = await ada.publish(MIRS.agreements, p.type, p.payload, { public: true, relays: R, objects: [[terms.id, terms.id]] });
  for (const x of [bo, svc, label]) await sign(x, pub.id, R);
  w.publication = pub.id;
  // Its price: the split service's tag under it, paid to the service.
  const tag = await putTag(svc, { publication: pub.id }, { price: { unit: SATS, value: 2000 }, relays: R });
  w.tag = tag.id;
  const post = await ada.publish(POST_SPECS.text, TEXT_ACT, textPayload('Two voices: our picture, for sale.'), { public: true, relays: R, refs: [referenceTo(bake.act), referenceTo(pub.act), referenceTo(tag.act)] });
  w.post = post.id;

  // The re-uploader: the same bytes, uploaded as its own bake, with its own tag on the bare bake; its post names neither claim nor owners.
  const again = lockWork({ media: 'picture', bytes: PHONE, relays: R });
  const theirs = await pirate.publish(POST_SPECS.envelopes, BAKE, again.payload, { public: true, relays: R });
  await relayAt(relay.base).putMedia(again.locked);
  assert.equal(again.work, work.work, 'the same work');
  w.pirateBake = theirs.id;
  const ptag = await putTag(pirate, { bake: theirs.id }, { price: { unit: SATS, value: 300 }, relays: R });
  w.pirateTag = ptag.id;
  const ppost = await pirate.publish(POST_SPECS.text, TEXT_ACT, textPayload('Great picture, cheap.'), { public: true, relays: R, refs: [referenceTo(theirs.act), referenceTo(ptag.act)] });
  w.piratePost = ppost.id;

  // The buyer, in Dub: made, following both.
  const b = await app.dub.begin({ homes: [homes[0].base], relays: R });
  await app.dub.confirm(b.positions.map((x) => b.words[x - 1]));
  await app.dub.setName('Cy');
  await app.dub.follow({ id: ada.id, name: 'Ada' });
  await app.dub.follow({ id: pirate.id, name: 'Pirate' });
  await app.dub.follow({ id: svc.id, name: 'Split service' });
  await app.dub.follow({ id: label.id, name: 'Label' });
  await app.dub.follow({ id: bo.id, name: 'Bo' });
});

after(() => stopAll(() => browser?.close(), () => app?.close(), ...[...homes, relay].map((r) => () => r?.stop())));

const feedItems = async () => (await app!.dub.feed()).items as Item[];
/** The feed read until both sales show (the relay and homes take a moment): a wait for a condition, never a single read. */
async function sales(): Promise<{ owners: Item; theirs: Item }> {
  let last: Item[] = [];
  for (let i = 0; i < 40; i++) {
    last = await feedItems();
    const owners = last.find((x) => x.id === w.post);
    const theirs = last.find((x) => x.id === w.piratePost);
    if (owners?.sealed && theirs?.sealed) return { owners, theirs };
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`the sales never showed: ${JSON.stringify(last.map((x) => [x.id.slice(0, 8), !!x.sealed]))}`);
}

test('buying by price tag: under the owners’ publication, its split service’s tag counts; the purchase pays the service, naming the publication', async () => {
  const { owners } = await sales();
  const s = owners.sealed!;
  assert.equal(s.bake, w.bake);
  assert.equal(s.tag, w.tag, 'the split service’s tag is the one a purchase follows (Money rule 18)');
  assert.equal(s.problem, null);
  assert.match(s.price, /2[ ,]?000/);
  assert.equal(s.through?.publication, w.publication);
  assert.match(s.through!.words, /Through the publication where you found it: its split service, .* pays its partners first \(.* 5%, “label”\), then the owners: .* \(60%\), .* \(40%\)\./);
  assert.equal(s.outside, null, 'its uploader is one of the owners');
  const me = app!.dub;
  const ctx = await (me as unknown as { ctx(): Promise<{ me: TestIdentity }> }).ctx();
  const x = await me.money.purchaseOf(ctx.me, [relay!.base, ...homes.map((h) => h.base)], {}, { publication: w.bake, seller: ada.id, post: w.post });
  assert.equal(x.payee, svc.id, 'paid to the tag’s payee, the split service');
  assert.equal(x.fulfils, w.tag, 'following the tag (its version)');
  assert.deepEqual(x.amount, { unit: SATS, value: 2000 });
  assert.deepEqual(x.purchase, [w.publication, w.publication], 'a purchase under the publication, at the version read');
});

test('buying by price tag on a bare bake: only its uploader’s tag counts, paid to the uploader alone; a re-uploader is said plainly to be no owner, and the owners’ own publication offered', async () => {
  const { theirs } = await sales();
  const s = theirs.sealed!;
  assert.equal(s.tag, w.pirateTag);
  assert.equal(s.through, null, 'a bare bake: no publication');
  assert.match(s.outside ?? '', /Its uploader, .*, is not one of this work’s owners as its claim’s ownership agreement names them: .* \(60%\), .* \(40%\)\. Paying here pays the uploader alone, outside that agreement; the owners are paid nothing of it\./);
  assert.equal(s.owners?.post, w.post, 'the owners’ own post');
  assert.equal(s.owners?.bake, w.bake);
  const ctx = await (app!.dub as unknown as { ctx(): Promise<{ me: TestIdentity }> }).ctx();
  const x = await app!.dub.money.purchaseOf(ctx.me, [relay!.base, ...homes.map((h) => h.base)], {}, { publication: w.pirateBake, seller: pirate.id, post: w.piratePost });
  assert.equal(x.payee, pirate.id, 'money to a bare bake is the uploader’s, unsplit');
  assert.equal(x.fulfils, w.pirateTag);
  assert.equal(x.purchase, null);
  assert.ok(x.said.some((l) => /is not one of this work’s owners/.test(l)), 'said before paying');
  // The pay chooser for it says so too.
  const ways = (await app!.dub.payWays({ kind: 'buy', post: w.piratePost, signer: pirate.id, bake: w.pirateBake, seller: pirate.id })) as PayWays;
  assert.match(ways.shared ?? '', /is not one of this work’s owners/);
});

test('a tip to a work goes through the publication where it was found: to its split service, naming the publication; never to whoever posted it', async () => {
  await sales();
  const deal = await app!.dub.money.dealOf(w.post, ada.id, [relay!.base, ...homes.map((h) => h.base)], {});
  assert.equal(deal?.publication, w.publication, 'the publication the tip names (Money rule 18: a tip through the publication)');
  assert.equal(deal?.service, svc.id, 'paid to its split service');
  const ways = (await app!.dub.payWays({ kind: 'tip', post: w.post, signer: ada.id })) as PayWays;
  assert.match(ways.shared ?? '', /^Through the publication where you found it: its split service, .* pays its partners first \(.* 5%, “label”\), then the owners/);
  assert.equal(ways.hand.open, true);
  // By hand, a draft carries no post: refused for such a work, saying so.
  await assert.rejects(app!.dub.pay({ how: 'hand', kind: 'tip', signer: ada.id, post: w.post, value: '10', unit: SATS, whatFor: '' }), /a draft copied by hand carries no post, so it could not go through the publication/);
  // A tip to the re-uploader's post: no publication, so to the poster, as any tip to a person's post.
  const plain = await app!.dub.money.dealOf(w.piratePost, pirate.id, [relay!.base], {});
  assert.equal(plain, null);
});

test('by clicks: the re-upload’s card says its uploader is no owner, and Buy from the owners’ publication opens the owners’ purchase; a tip on the owners’ post says it goes through their publication', async () => {
  await sales();
  browser = await chromium.launch({ executablePath: CHROMIUM });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page: Page = await context.newPage();
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(`${app!.base}/#pair=${app!.access.newCode()}`);
  const card = (id: string) => page.locator(`#feed [data-k-act="${id}"]`);
  // The feed fills later: waited for, never read once.
  await card(w.piratePost).locator('.dub-outside').waitFor({ timeout: 90_000 });
  assert.match(await card(w.piratePost).locator('.dub-outside').innerText(), /is not one of this work’s owners/);
  assert.match(await card(w.piratePost).locator('.dub-owners').innerText(), /The owners sell it themselves, through their own publication/);
  await card(w.post).locator('.dub-through').waitFor();
  if (shots) await page.screenshot({ path: join(shots, 'dub-sales-feed.png') });
  // Buy from the owners' publication: the chooser is the owners' purchase, through their publication.
  await card(w.piratePost).locator('.k-actid').click();
  await page.getByRole('menuitem', { name: 'Buy from the owners’ publication', exact: true }).click();
  const chooser = page.locator('form#pay');
  await chooser.locator('.dub-shared').waitFor({ timeout: 60_000 });
  assert.match(await chooser.locator('.dub-shared').innerText(), /Through the publication where you found it: its split service, .* pays its partners first/);
  assert.match(await chooser.innerText(), /2[ ,]?000/);
  if (shots) await page.screenshot({ path: join(shots, 'dub-sales-owners.png') });
  await page.keyboard.press('Escape');
  await chooser.waitFor({ state: 'detached' });
  // Tip on the owners' post: through their publication.
  await card(w.post).locator('.k-actid').click();
  await page.getByRole('menuitem', { name: 'Tip', exact: true }).click();
  await chooser.locator('.dub-shared').waitFor({ timeout: 60_000 });
  assert.match(await chooser.locator('.dub-shared').innerText(), /^Through the publication where you found it/);
  await page.keyboard.press('Escape');
  assert.deepEqual(problems, []);
  await context.close();
});

test('by clicks: Withdraw the publication on a work offered through one (a later version selling nothing), Withdraw the price tag on a bare bake; each says the bytes stay where they were uploaded', async () => {
  const ctx = await (app!.dub as unknown as { ctx(): Promise<{ me: TestIdentity; s: { relays: string[] } }> }).ctx();
  const me = ctx.me;
  const R = [relay!.base];
  // Cy's own work, offered through Cy's lone publication (its split service the one above), with the service's tag; and a second, on a bare bake with Cy's own tag.
  // Another picture than the one Ada and Bo own: Cy is the owner of this one.
  const work = lockWork({ media: 'picture', bytes: OTHER, relays: R });
  const bake = await me.publish(POST_SPECS.envelopes, BAKE, work.payload, { public: true, relays: R });
  await relayAt(relay!.base).putMedia(work.locked);
  const p = publicationPayload({ sold: [{ bake: bake.id }], service: svc.id, plan: planIn({ roles: [], cmip: SPLIT_CMIP }), partners: [], words: 'Cy’s picture.' }) as { type: number; payload: Uint8Array };
  const pub = await me.publish(MIRS.agreements, p.type, p.payload, { public: true, relays: R });
  await sign(svc, pub.id, R);
  const tag = await putTag(svc, { publication: pub.id }, { price: { unit: SATS, value: 700 }, relays: R });
  const post = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload('Mine, through my publication.'), { public: true, relays: R, refs: [referenceTo(bake.act), referenceTo(pub.act), referenceTo(tag.act)] });
  // Kept in Dub's folder before Dub signs again: its sequence has grown.
  await app!.store.saveIdentity(me);
  const sold = await app!.dub.sell({ text: 'Only for buyers.', teaser: 'Mine, on a bare bake.', value: '400', unit: SATS });

  browser ??= await chromium.launch({ executablePath: CHROMIUM });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page: Page = await context.newPage();
  page.on('dialog', (d) => void d.accept());
  await page.goto(`${app!.base}/#pair=${app!.access.newCode()}`);
  const card = (id: string) => page.locator(`#feed [data-k-act="${id}"]`);
  const menu = async (id: string, item: string) => {
    // The feed refreshes as it reads: the card and its menu item waited for.
    await card(id).locator('.dub-sealed').waitFor({ timeout: 90_000 });
    await card(id).locator('.k-actid').click();
    await page.getByRole('menuitem', { name: item, exact: true }).click();
  };
  const done = page.locator('#status .k-note.k-done');
  await menu(post.id, 'Withdraw the publication');
  await done.filter({ hasText: 'Publication withdrawn' }).waitFor({ timeout: 60_000 });
  assert.match(await done.last().innerText(), /a later version that sells nothing, signed by you\. It ends the publication once every party signs it too[\s\S]*The bytes stay where they were uploaded unless homes and relays drop them/);
  await menu(sold.post, 'Withdraw the price tag');
  await done.filter({ hasText: 'Price tag withdrawn' }).waitFor({ timeout: 60_000 });
  assert.match(await done.last().innerText(), /version 2 carries no price[\s\S]*The bytes stay where they were uploaded/);
  if (shots) await page.screenshot({ path: join(shots, 'dub-sales-withdrawn.png') });
  // Read back: the publication's latest version sells nothing; the tag's carries no price; nothing left to withdraw on either.
  const items = await feedItems();
  const a = items.find((x) => x.id === post.id)!.sealed!;
  assert.match(a.problem ?? '', /publication it was offered through has ended/);
  assert.equal(a.ends, null);
  assert.equal(a.outside, null, 'Cy owns this one: nothing said about it');
  const b = items.find((x) => x.id === sold.post)!.sealed!;
  assert.match(b.problem ?? '', /withdrew its price tag/);
  assert.equal(b.ends, null);
  await context.close();
});
