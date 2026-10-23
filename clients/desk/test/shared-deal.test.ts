// Splits between separate people (this round; decided by Nobody, allegedly,
// 22 October 2026: "Edubba is the place"; "with a tip IF there is a split
// the target is the agreement not the act"; the reading,
// `docs/splits-reading.md`).
//
// Three test identities, each with their own Dub, Damgar and Edubba, and a
// test split service. River sets up a deal in Edubba (River 50%, Pa 30%,
// Ana 20%, 10% off the top to a reposter) for a protected recording; Pa and
// Ana sign it in their own Edubba's To sign; nothing is announced until both
// have. A fourth identity buys it from Dub: the service answers, receipts in
// the deal's own payee's name, publishes the split, pays each one by their
// share, tells each of the sale; River's Edubba delivers the key; the file
// opens in the buyer's Dub. Then a vow under a deal, bought and confirmed; a
// plain post under a deal, tipped from Dub, the tip split; a tip to River's
// own post, paid to River alone; the buyer's contest shown to every party;
// and the refusals in plain words. Real homes and relay, test Lightning
// nodes; regtest satoshis, worth nothing. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAll, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import type { Account, PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
import { SplitService, type Node } from '../../split-service/src/service.ts';
import type { Done } from '../src/page/api.ts';
import { chromium, type Browser, type Page } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
// MOR_SCREENSHOTS=DIR keeps a picture of each screen (the report's: docs/splits/).
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

/** A page paired with an app of the suite, its errors gathered. */
async function openPage(base: string, code: string, problems: string[]): Promise<Page> {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
  page.on('pageerror', (x) => problems.push(x.message));
  await page.goto(`${base}/#pair=${code}`);
  return page;
}
const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: join(shots, name), fullPage: true });
};

after(async () => {
  await browser?.close();
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

const R = SPEC.units.regtest;
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');

/** Every invoice any test node issued, paid by learning its preimage. */
const wallets: Map<string, string>[] = [];
const pay = (invoice: string) => {
  for (const w of wallets) if (w.has(invoice)) return w.get(invoice)!;
  throw new Error('an invoice no test node issued');
};

/** Someone paid on Lightning: Dub, Damgar (answering and receipting by itself), and their own Edubba holding the same identity. */
async function sharer(H: string[], RL: string[], name: string) {
  const node = new TestNode();
  const link = testLink(node);
  wallets.push(link.preimages);
  const p = await person(H, RL, { link: link.factory });
  const rv = await p.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await p.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await p.damgar.c.ask('link', link.config);
  const own = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await p.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  const e = await edubba(H, RL);
  await e.c.ask('bring', { name, id: p.id, words: p.dub.words, address: H[0] });
  return { ...p, edubba: e, name };
}

/** A buyer paying from Dub under its lane. */
async function buyer(H: string[], RL: string[]) {
  const b = await person(H, RL);
  await b.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
  await b.damgar.c.ask('look');
  const lane = (await b.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await b.damgar.c.ask('grant lane', { id: lane.id });
  return b;
}

/** The service's node: its invoices settled once the buyer's wallet pays; a holder's invoice paid from the wallets. */
function serviceNode(): Node & { markPaid(invoice: string): void } {
  const n = new TestNode();
  const hashOf = new Map<string, string>();
  const paid = new Map<string, string>();
  const mine = new Map<string, string>();
  wallets.push(mine);
  return {
    async nodeKey() {
      return n.key;
    },
    async addInvoice(sat, descriptionHash) {
      const i = n.invoice(sat, descriptionHash);
      hashOf.set(i.invoice, [...n.preimages.keys()].pop()!);
      mine.set(i.invoice, i.preimage);
      return { invoice: i.invoice, hash: hashOf.get(i.invoice)! };
    },
    async settled(hash) {
      return paid.get(hash) ?? null;
    },
    async pay(invoice) {
      return pay(invoice);
    },
    markPaid(invoice: string) {
      paid.set(hashOf.get(invoice)!, mine.get(invoice)!);
    },
  };
}

/** The buyer pays the invoice the service answered with, in their wallet, and pastes the proof back in Dub. */
async function payFromDub(b: Awaited<ReturnType<typeof buyer>>, node: ReturnType<typeof serviceNode>): Promise<void> {
  await b.damgar.c.ask('look');
  const pays = (await b.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  const p = pays.find((x) => x.pay?.invoice)!;
  assert.ok(p, `a payment to pay: ${JSON.stringify(pays.map((x) => x.stageSaid))}`);
  node.markPaid(p.pay!.invoice!);
  await b.dub.c.ask('paid', { key: p.key, proof: pay(p.pay!.invoice!) });
}

/** Ticks of the service, the holders' Damgars looking between, until each payout is paid. */
async function settle(svc: SplitService, holders: Awaited<ReturnType<typeof sharer>>[]): Promise<string> {
  const said: string[] = [];
  for (let i = 0; i < 6; i++) {
    said.push(...(await svc.tick()));
    for (const h of holders) {
      await h.damgar.c.ask('look');
    }
  }
  return said.join(' | ');
}

/** Each other person signs the deal waiting in their Edubba's To sign. */
async function signIn(people: Awaited<ReturnType<typeof sharer>>[], acts: string[]) {
  for (const p of people) {
    const ps = (await p.edubba.c.ask<{ proposals: any[] }>('member proposals')).proposals;
    const deal = ps.find((x) => x.act === acts[0]);
    assert.ok(deal, `${p.name} has the deal in To sign: ${JSON.stringify(ps.map((x) => x.reading?.title))}`);
    assert.equal(deal.reading.kind, 'deal');
    assert.deepEqual(deal.reading.blocking, []);
    const said = JSON.stringify(deal.reading);
    assert.match(said, /the work then belongs to the deal, and every payment for it, a tip included, goes to its split service/);
    const r = await p.edubba.c.ask<{ lines: { text: string }[] }>('member accept', { thread: deal.thread });
    assert.equal(r.lines.filter((l) => /Signed/.test(l.text)).length, acts.length, JSON.stringify(r.lines));
  }
}

test('a deal between three separate people, set up in Edubba and signed in each one’s own; a protected recording bought from Dub, the service paid, the split published, each paid by their share and told of the sale, the key delivered, the file opened; the buyer’s contest shown to every party; a tip to one of them alone', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const [river, pa, ana] = [await sharer(H, RL, 'River'), await sharer(H, RL, 'Pa'), await sharer(H, RL, 'Ana')];
  const e = river.edubba;
  await e.c.ask('real contact add', { id: pa.id, name: 'Pa' });
  await e.c.ask('real contact add', { id: ana.id, name: 'Ana' });

  // The split service, its own identity and node; its key for the deal's own payee, whose ID Edubba shows.
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const st = await e.c.ask<{ dealPayee: string; sharesSay: string[] }>('publishing');
  assert.match(st.dealPayee, /^[0-9a-f]{64}$/);
  assert.ok(st.sharesSay.some((t) => /The work then belongs to the deal/.test(t)));
  const key = svc.grantKey(st.dealPayee);

  // By clicks, in River's Edubba: Publishing › A protected file › Details, “Who shares in it”, the deal's own payee shown to give the service.
  const problems: string[] = [];
  const pe = await openPage(e.app.base, e.app.access.newCode(), problems);
  await pe.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });
  await pe.locator('details[data-shares] summary').click();
  await pe.locator('details[data-shares] code.k-mono', { hasText: st.dealPayee }).waitFor({ timeout: 60_000 });
  await pe.locator('input[name=with0]').fill('Pa');
  await pe.locator('input[name=share0]').fill('30');
  await pe.locator('input[name=with1]').fill('Ana');
  await pe.locator('input[name=share1]').fill('20');
  await pe.locator('input[name=mine]').fill('50');
  await pe.locator('input[name=dealReferral]').fill('10');
  await pe.locator('input[name=dealService]').fill(svc.id);
  await pe.locator('input[name=dealKey]').fill(key);
  await pe.locator('#pub-work textarea[name=text]').fill('A recording, shared three ways.');
  await pe.locator('#pub-work input[name=title]').fill('Three ways');
  await pe.locator('#pub-work input[name=price]').fill('1000');
  await shot(pe, 'edubba-who-shares-in-it.png');
  await pe.locator('#pub-work button[type=submit]').click();
  await pe.locator('#e-pub-review', { hasText: 'Who shares in it' }).waitFor({ timeout: 60_000 });
  await pe.locator('#e-pub-review', { hasText: 'the work then belongs to the deal' }).waitFor();
  await shot(pe, 'edubba-shared-read-back.png');

  const text = new TextEncoder().encode('A recording, shared three ways.');
  const shares = (o: Partial<{ pa: string; ana: string; mine: string; service: string; key: string; who: string }> = {}) => ({
    with: [
      { who: o.who ?? 'Pa', share: o.pa ?? '30' },
      { who: 'Ana', share: o.ana ?? '20' },
    ],
    mine: o.mine ?? '50',
    referral: '10',
    service: o.service ?? svc.id,
    serviceKey: o.key ?? key,
  });
  const read = (s: ReturnType<typeof shares>) => e.c.ask<any>('publishing work read', { media: 'text', data: b64(text), title: 'Three ways', price: '1000', shares: s });

  // Refused in plain words: shares not adding to 100; the service as a party; a person by an ID alone; the service's key missing.
  assert.ok((await read(shares({ ana: '25' }))).reading.blocking.some((b: string) => /add up to 105%, not 100%/.test(b)));
  assert.ok((await read(shares({ service: pa.id }))).reading.blocking.some((b: string) => /cannot be one of the people sharing in it/.test(b)));
  assert.ok((await read(shares({ who: pa.id }))).reading.blocking.some((b: string) => /never by an ID alone/.test(b)));
  assert.ok((await read(shares({ key: '' }))).reading.blocking.some((b: string) => /mor-split-service key/.test(b)));

  const w = await read(shares());
  assert.deepEqual(w.reading.blocking, []);
  const said = JSON.stringify(w.reading);
  assert.match(said, /the work then belongs to the deal, and every payment for it, a tip included, goes to the split service/);
  assert.match(said, /Pa \[[0-9a-f]{8}…[0-9a-f]{4}\]: 30%/);
  assert.match(said, /The deal-assessment tool’s reading/);
  const started = await e.c.ask<Done>('publishing confirm', { plan: w.plan, digest: w.digest });
  assert.match(started.title, /sent to each person/);
  assert.equal(started.acts.length, 2, 'the terms and the offer, each to sign');
  assert.equal(started.lines.filter((l) => /Sent to/.test(l.text)).length, 2, JSON.stringify(started.lines));
  assert.ok((await svc.tick()).some((t) => /grant .* accepted/.test(t)), 'the service accepts the deal’s payee’s grant');

  // Nothing is announced while a party has not signed.
  let g = await e.c.ask<{ lines: { text: string }[] }>('publishing deals gather');
  assert.ok(g.lines.some((l) => /waiting for Pa .*, Ana .* to sign. Nothing is announced yet/.test(l.text)), JSON.stringify(g.lines));
  assert.equal((await e.c.ask<any>('publishing')).works.length, 0);
  // In Pa's own Edubba: Publishing › To sign, the deal read from its exact bytes.
  const pp = await openPage(pa.edubba.app.base, pa.edubba.app.access.newCode(), problems);
  await pp.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });
  await pp.locator('.k-col button', { hasText: 'To sign' }).click();
  await pp.locator('#e-signing-wrap', { hasText: 'A shared deal' }).waitFor({ timeout: 60_000 });
  await shot(pp, 'edubba-to-sign-a-shared-deal.png');
  await signIn([pa], started.acts);
  g = await e.c.ask<{ lines: { text: string }[] }>('publishing deals gather');
  assert.ok(g.lines.some((l) => /waiting for Ana/.test(l.text)), JSON.stringify(g.lines));
  const pe2 = await openPage(e.app.base, e.app.access.newCode(), problems);
  await pe2.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });
  await pe2.locator('.k-col button', { hasText: 'Shared deals' }).click();
  await pe2.locator('#deals-feed', { hasText: 'Waiting' }).waitFor({ timeout: 60_000 });
  await shot(pe2, 'edubba-shared-deals-waiting.png');
  await signIn([ana], started.acts);
  g = await e.c.ask<{ lines: { text: string }[] }>('publishing deals gather');
  assert.ok(g.lines.some((l) => /is announced: every person signed/.test(l.text)), JSON.stringify(g.lines));
  const work = (await e.c.ask<any>('publishing')).works[0];
  assert.ok(work?.deal && work.payee === st.dealPayee, JSON.stringify(work));

  // A fourth identity buys it from Dub: one line says it is shared, before paying.
  const b = await buyer(H, RL);
  await b.dub.c.ask('follow', { id: river.id, name: 'River' });
  await b.dub.c.ask('follow', { id: pa.id, name: 'Pa' });
  await b.dub.c.ask('follow', { id: ana.id, name: 'Ana' });
  const item = (await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === work.post);
  assert.ok(item?.sealed, 'the post is in the buyer’s feed');
  const ways = await b.dub.c.ask<{ shared: string | null }>('pay ways', { kind: 'buy', post: work.post, signer: river.id });
  assert.match(ways.shared ?? '', /^This work is shared: River \(50%\), Pa \(30%\), Ana \(20%\)\. The split service, .*, answers for it\.$/);
  // By clicks, in the buyer's Dub: the card's act menu, Buy: the one line before paying.
  const pd = await openPage(b.dub.app.base, b.dub.app.access.newCode(), problems);
  const card = pd.locator('.k-act', { hasText: 'Three ways' }).first();
  await card.waitFor({ timeout: 60_000 });
  await card.locator('.k-actid').click();
  await pd.locator('.k-pop button', { hasText: 'Buy' }).first().click();
  await pd.locator('.dub-shared', { hasText: 'This work is shared: River (50%), Pa (30%), Ana (20%).' }).waitFor({ timeout: 60_000 });
  await shot(pd, 'dub-buy-a-shared-work.png');
  await pd.keyboard.press('Escape');
  const bought = await b.dub.c.ask<{ lines: { text: string }[] }>('buy', { publication: work.publication, seller: river.id, post: work.post });
  assert.match(bought.lines[0].text, /^This work is shared/);
  assert.ok((await svc.tick()).some((t) => /An invoice of its node sent/.test(t)));
  await payFromDub(b, node);

  // The service: the receipt in the deal's payee's name, the split, the sale told, each paid by their share.
  const t = await settle(svc, [river, pa, ana]);
  assert.match(t, /its receipt signed with .* grant key/);
  // Found directly, through no repost: the referral share is filled by nobody and goes to the owners (Agreements rule 22: absent a choice, to the stakes).
  assert.match(t, /Split .*: 500 to .*, 300 to .*, 200 to/, t);
  assert.match(t, /The sale told to 4 parties/, t);
  assert.equal((t.match(/Paid \d+ to/g) ?? []).length, 3, t);
  for (const [m, value] of [[river, 500], [pa, 300], [ana, 200]] as const) {
    await m.damgar.c.ask('look');
    const a = await m.damgar.c.ask<Account>('account');
    const deal = a.shared?.find((x) => x.name === 'Three ways');
    assert.ok(deal, `${m.name}’s Damgar shows the deal: ${JSON.stringify(a.shared)}`);
    assert.ok(deal.payments.some((x) => x.kind === 'a sale' && x.amount.value === 1000), JSON.stringify(deal.payments));
    assert.ok(deal.payouts.some((x) => x.amount.value === value && x.paid), `${m.name}’s payout: ${JSON.stringify(deal.payouts)}`);
  }

  // River's Edubba, told of the sale, delivers the key; the recording's text opens in the buyer's Dub.
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /a sale your deal’s split service receipted, told to every person sharing in it/.test(l.text)), JSON.stringify(d.lines));
  await b.dub.c.ask('money look');
  const opened = (await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === work.post)!;
  assert.equal(opened.sealed.state, 'opened');
  assert.equal(opened.sealed.text, 'A recording, shared three ways.');
  // The buyer's own payment, shown with the deal's name in its Damgar.
  await b.damgar.c.ask('look');

  // The buyer contests the purchase; every party's Edubba shows it beside the sale (the claim sealed to each).
  await b.dub.c.ask('purchase contest', { publication: work.publication, promise: 'Not three ways at all.' });
  for (const m of [river, pa, ana]) {
    const s = await m.edubba.c.ask<{ sales: any[]; problems: string[] }>('publishing shared sales');
    const sale = s.sales.find((x) => x.buyer === b.id);
    assert.ok(sale, `${m.name}’s Edubba lists the sale: ${JSON.stringify(s)}`);
    assert.equal(sale.kind, 'deal');
    assert.ok(sale.claim, `${m.name} holds the buyer’s claim`);
    assert.equal(sale.beside.state, 'shown', `${m.name}: ${JSON.stringify(sale.beside)} ${JSON.stringify(s.problems)}`);
    assert.equal(sale.beside.contests[0]?.promise, 'Not three ways at all.');
  }

  // By clicks: Pa's Damgar, Account › Shared deals; Pa's Edubba, Publishing › Sales, the contest beside the shared sale.
  const pg = await openPage(pa.damgar.app.base, pa.damgar.app.access.newCode(), problems);
  await pg.locator('[data-k-tile=account]').click({ timeout: 60_000 });
  await pg.locator('.k-col button', { hasText: 'Shared deals' }).click();
  await pg.locator('.k-act', { hasText: 'Its split pays you 300' }).first().waitFor({ timeout: 60_000 });
  await shot(pg, 'damgar-shared-deals.png');
  const pp2 = await openPage(pa.edubba.app.base, pa.edubba.app.access.newCode(), problems);
  await pp2.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });
  await pp2.locator('.k-col button', { hasText: 'Sales' }).click();
  await pp2.locator('.k-label.k-bad.edubba-beside', { hasText: 'Contested by its buyer: “Not three ways at all.”' }).waitFor({ timeout: 60_000 });
  await shot(pp2, 'edubba-sales-shared-contested.png');
  assert.deepEqual(problems, []);

  // And in the buyer's own Purchases, in Dub.
  const mine = (await b.dub.c.ask<{ items: any[] }>('purchases')).items.find((x) => x.id === work.publication);
  assert.equal(mine?.contests?.contests[0]?.promise, 'Not three ways at all.', JSON.stringify(mine?.contests));

  // A tip to River's own post, not under the deal: paid to River alone, the service sees nothing.
  const own = (await river.dub.c.ask<{ post: { id: string } }>('post', { text: 'Just me, today.' })).post;
  await b.dub.c.ask('feed', { fresh: true });
  const ownWays = await b.dub.c.ask<{ shared: string | null }>('pay ways', { kind: 'tip', post: own.id, signer: river.id });
  assert.equal(ownWays.shared, null);
  const tipped = await b.dub.c.ask<{ lines: { text: string }[] }>('tip now', { post: own.id, signer: river.id, value: '77', unit: R });
  assert.ok(!tipped.lines.some((l) => /shared/.test(l.text)));
  assert.ok(!(await svc.tick()).some((t) => /77|invoice/i.test(t)), 'the service is asked nothing');
  await river.damgar.c.ask('look');
  const tip = (await b.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments.find((x) => x.amount.value === 77);
  assert.ok(tip?.pay?.invoice, 'River’s own Damgar answered the tip');
});

test('a vow under a deal between separate people, bought from Dub and confirmed; a plain post under a deal, tipped from Dub: the tip goes to the deal, through its split service, and is split', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const [river, pa] = [await sharer(H, RL, 'River'), await sharer(H, RL, 'Pa')];
  const e = river.edubba;
  await e.c.ask('real contact add', { id: pa.id, name: 'Pa' });
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const shares = (key: string) => ({ with: [{ who: 'Pa', share: '40' }], mine: '60', referral: '', service: svc.id, serviceKey: key });

  // A vow, shared: its stake first wholly River's (Agreements rule 14), then shared by a second version both sign.
  const k1 = svc.grantKey((await e.c.ask<{ dealPayee: string }>('publishing')).dealPayee);
  const v = await e.c.ask<any>('publishing vow read', { words: 'A song written for you, by the two of us.', title: 'A song for you', price: '1000', shares: shares(k1) });
  assert.deepEqual(v.reading.blocking, []);
  assert.match(JSON.stringify(v.reading), /A vow’s stake is first written to its signer, you \(Agreements rule 14\)/);
  const vs = await e.c.ask<Done>('publishing confirm', { plan: v.plan, digest: v.digest });
  assert.equal(vs.acts.length, 3, 'the founding, its second version, the offer');
  await signIn([pa], vs.acts);
  const pr = (await pa.edubba.c.ask<{ proposals: any[] }>('member proposals')).proposals.find((x) => x.act === vs.acts[0]);
  assert.match(JSON.stringify(pr.reading), /Its second version: the stake shared/);
  assert.ok((await e.c.ask<{ lines: { text: string }[] }>('publishing deals gather')).lines.some((l) => /is announced/.test(l.text)));
  await svc.tick();
  const vow = (await e.c.ask<any>('publishing')).vows[0];
  assert.ok(vow?.deal, JSON.stringify(vow));

  const b = await buyer(H, RL);
  for (const [id, name] of [[river.id, 'River'], [pa.id, 'Pa']]) await b.dub.c.ask('follow', { id, name });
  await b.dub.c.ask('feed', { fresh: true });
  const bought = await b.dub.c.ask<{ lines: { text: string }[] }>('vow buy', { vow: vow.vow, seller: river.id, post: vow.post });
  assert.match(bought.lines[0].text, /^This work is shared: River \(60%\), Pa \(40%\)/);
  await svc.tick();
  await payFromDub(b, node);
  const t = await settle(svc, [river, pa]);
  assert.match(t, /Split .*: 600 to .*, 400 to/, t);
  assert.match(t, /The sale told to 3 parties/, t);
  // Confirmed by its buyer, from Dub's Purchases: its claim again, in public, acknowledging the vow; the sale reads confirmed.
  assert.match((await b.dub.c.ask<any>('vow confirm', { vow: vow.vow })).lines[0].text, /reads confirmed/);
  const sales = (await b.dub.c.ask<{ vows: any[] }>('vows bought')).vows.find((x) => x.vow === vow.vow);
  assert.equal(sales?.sale, 'confirmed', JSON.stringify(sales));

  // A plain post, shared: a tip on it goes to the deal, not to River alone.
  const k2 = svc.grantKey((await e.c.ask<{ dealPayee: string }>('publishing')).dealPayee);
  const p = await e.c.ask<any>('publishing post read', { text: 'Our first song is out. Tips are shared.', shares: shares(k2) });
  assert.deepEqual(p.reading.blocking, []);
  assert.match(JSON.stringify(p.reading), /Nothing is sold: a tip is a tip/);
  const ps = await e.c.ask<Done>('publishing confirm', { plan: p.plan, digest: p.digest });
  await signIn([pa], ps.acts);
  await e.c.ask('publishing deals gather');
  await svc.tick();
  const post = (await e.c.ask<any>('publishing')).posts[0];
  assert.ok(post?.post, 'the shared post is announced');
  await b.dub.c.ask('feed', { fresh: true });
  const ways = await b.dub.c.ask<{ shared: string | null }>('pay ways', { kind: 'tip', post: post.post, signer: river.id });
  assert.match(ways.shared ?? '', /^This work is shared: River \(60%\), Pa \(40%\)/);
  const tipped = await b.dub.c.ask<{ lines: { text: string }[] }>('tip now', { post: post.post, signer: river.id, value: '500', unit: R });
  assert.ok(tipped.lines.some((l) => /The tip goes to the deal, not to the one who posted it/.test(l.text)), JSON.stringify(tipped.lines));
  assert.ok((await svc.tick()).some((x) => /An invoice of its node sent/.test(x)), 'the service answers the tip');
  await payFromDub(b, node);
  const tt = await settle(svc, [river, pa]);
  assert.match(tt, /Split .*: 300 to .*, 200 to/, tt);
  assert.doesNotMatch(tt, /The sale told/, 'a tip sells nothing');
  for (const [m, value] of [[river, 300], [pa, 200]] as const) {
    await m.damgar.c.ask('look');
    const a = await m.damgar.c.ask<Account>('account');
    const d = a.shared?.find((x) => x.payments.some((y) => y.kind === 'a tip'));
    assert.ok(d?.payouts.some((x) => x.amount.value === value && x.paid), `${m.name}: ${JSON.stringify(a.shared)}`);
  }
});

test('a collective’s work bought: its claim opened by every member’s Edubba from MOR, and beside the sale in each member’s Sales what the core reads of the buyer’s contest (no purchase, for the MOR lead)', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const { foundCollective } = await import('./cast.ts');
  const [A, iPa, iPh] = [await sharer(H, RL, 'A'), await sharer(H, RL, 'iPa'), await sharer(H, RL, 'iPh')];
  const e = A.edubba;
  const { collective } = await foundCollective(e, A.id, [iPa.dub, iPh.dub], [
    { name: 'Publishing', layer: 1, holders: [A.id, iPa.id, iPh.id], number: 1 },
    { name: 'Offers and deals', layer: 3, holders: [A.id, iPa.id], number: 1 },
    { name: 'Money', layer: 2, holders: [A.id], number: 1 },
  ]);
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const key = svc.grantKey(collective);
  const review = await e.c.ask<any>('real money prepare', { collective, shares: { [A.id]: 50, [iPa.id]: 30, [iPh.id]: 20 }, referral: 0, service: svc.id, serviceKey: key, keepers: [], keepersNeeded: 1 });
  const money = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  for (const m of [iPa, iPh]) {
    const pp = (await m.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === money.acts[0]);
    await m.dub.c.ask('accept', { thread: pp.thread });
  }
  assert.equal((await e.c.ask<any>('real gather', { act: money.acts[0] })).standing.enough, true);
  await e.c.ask('real money record', { act: money.acts[0] });
  await svc.tick();
  await e.c.ask('publishing act as', { id: collective });
  const w = await e.c.ask<any>('publishing work read', { media: 'text', data: b64(new TextEncoder().encode('The collective’s story.')), title: 'A story', price: '1000' });
  assert.deepEqual(w.reading.blocking, []);
  const [publication, , postId] = (await e.c.ask<Done>('publishing confirm', { plan: w.plan, digest: w.digest })).acts;

  const b = await buyer(H, RL);
  await b.dub.c.ask('follow', { id: collective, name: 'The collective' });
  await b.dub.c.ask('feed', { fresh: true });
  await b.dub.c.ask('buy', { publication, seller: collective, post: postId });
  await svc.tick();
  await payFromDub(b, node);
  await settle(svc, [A, iPa, iPh]);
  await e.c.ask('publishing deliver');
  await b.dub.c.ask('money look');
  await b.dub.c.ask('purchase contest', { publication, promise: 'Not the story told.' });
  for (const m of [A, iPa, iPh]) {
    const s = await m.edubba.c.ask<{ sales: any[]; problems: string[] }>('publishing shared sales');
    const sale = s.sales.find((x) => x.buyer === b.id);
    assert.ok(sale, `${m.name}’s Edubba lists the collective’s sale: ${JSON.stringify(s)}`);
    assert.equal(sale.kind, 'collective');
    assert.ok(sale.claim, `${m.name} opened the buyer’s claim from MOR`);
    // Found this round, for the MOR lead (docs/splits-report.md): the core reads a collective's sale under its agreement as no purchase where
    // the agreement stakes the collective itself (all its income) and not the work; a contest then shows beside nothing. Edubba says so.
    assert.equal(sale.beside.state, 'shown', `${m.name}: ${JSON.stringify(sale.beside)} ${JSON.stringify(s.problems)}`);
    assert.match(sale.beside.noPurchase ?? '', /carries no stake in the work it pays for/, `${m.name}: ${JSON.stringify(sale.beside)}`);
  }
});
