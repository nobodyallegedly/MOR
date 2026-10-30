// Edubba's Publishing tab, ways 2 to 4 (round 8, F407; decided by Nobody,
// allegedly, 24 October 2026: "Claim. Setup an ownership agreement. Build a
// publishing envelope from an ownership agreement").
//
// Three test identities, each with their own Dub, Damgar and Edubba, and a
// test split service. River uploads a work (way 1, stopping at the upload),
// then claims it alone with Ana (way 2), who signs the claim in her own
// Edubba; sets up its ownership agreement (way 3: River, Pa and Ana; H98,
// the shares even until touched), which Pa and Ana sign; and builds a
// publication from it (way 4): Ana a partner labelled "client", 5% off the
// top, a referral role of 10%, the split service receiving every payment.
// Pa, Ana and the service sign it; it counts; the service puts its price
// tag on it; a fourth identity buys it from Dub; the service splits and
// pays; River's Edubba, told of the sale by the service, delivers the key;
// the file opens in the buyer's Dub. Then the publication is withdrawn (a
// later version selling nothing). A vow's ownership, in two versions (rule
// 14), and its publication. Real homes and relay, test Lightning nodes;
// regtest satoshis, worth nothing. Test identities only.
//
// Premises replaced in round 8 (said here, as the brief asks): "a deal
// between separate people" with its own payee (an identity made for each
// deal, its grant to the split service and the key the service made for it,
// terms carrying the split plan, the service and the payee grant, fields 8,
// 14, 28, 29) is gone. Its equivalent is three acts, each signed by the
// people it names: a claim, an ownership agreement (ownership only), and a
// publication naming the split service, which receives in its own name. The
// assertions on "the deal's own payee", the service's grant and "the work
// then belongs to the deal" now assert the claim, the ownership agreement's
// shares and the publication's parties, partners and price tag. A tip to a
// shared post (the old second test) is now a tip through a publication,
// Dub's to show; this file keeps the vow's ownership in two versions.

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

/** Each other person signs, in their Edubba's To sign, what waits for them: the first act `acts` names, and the others with it. */
async function signIn(people: Awaited<ReturnType<typeof sharer>>[], acts: string[], title: RegExp, said: RegExp) {
  for (const p of people) {
    const ps = await waitFor(async () => (await p.edubba.c.ask<{ proposals: any[] }>('member proposals')).proposals.find((x) => x.act === acts[0] && !x.answer), `${p.name} has it in To sign`);
    assert.equal(ps.reading.kind, 'deal');
    assert.deepEqual(ps.reading.blocking, []);
    assert.match(ps.reading.title, title);
    assert.match(JSON.stringify(ps.reading), said);
    const r = await p.edubba.c.ask<{ lines: { text: string }[] }>('member accept', { thread: ps.thread });
    assert.equal(r.lines.filter((l) => /Signed/.test(l.text)).length, acts.length, JSON.stringify(r.lines));
  }
}

/** A wait for a condition, not a read once: asked again until it holds (CI robustness, Part 4). */
async function waitFor<T>(f: () => Promise<T | undefined | null | false>, what: string, tries = 20): Promise<T> {
  for (let i = 0; i < tries; i++) {
    const x = await f();
    if (x) return x;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Never: ${what}`);
}

test('ways 2 to 4: a work claimed with Ana, its ownership agreement (River, Pa, Ana), a publication with a partner labelled “client”, a referral and a split service; each signed in each one’s own Edubba; bought from Dub, split, the key delivered, the file opened; then the publication withdrawn', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const [river, pa, ana] = [await sharer(H, RL, 'River'), await sharer(H, RL, 'Pa'), await sharer(H, RL, 'Ana')];
  const e = river.edubba;
  await e.c.ask('real contact add', { id: pa.id, name: 'Pa' });
  await e.c.ask('real contact add', { id: ana.id, name: 'Ana' });
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();

  // Way 1, stopping at the upload: nothing for sale yet.
  const text = 'A recording, shared three ways.';
  const up = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode(text)), title: 'Three ways', then: 'none' });
  assert.deepEqual(up.reading.blocking, []);
  const [bake] = (await e.c.ask<Done>('publishing confirm', { plan: up.plan, digest: up.digest })).acts;

  // Way 2, a claim alone, by the bake's ID, made with Ana: a person by an ID alone is refused (H119).
  assert.ok((await e.c.ask<any>('publishing claim read', { work: bake, title: 'Three ways', creators: [{ who: ana.id }] })).reading.blocking.some((b: string) => /never by an ID alone/.test(b)));
  const cl = await e.c.ask<any>('publishing claim read', { work: bake, title: 'Three ways', creators: [{ who: 'Ana' }] });
  assert.deepEqual(cl.reading.blocking, []);
  assert.match(cl.reading.summary.join(' '), /binding the work’s fingerprint to its creators: River .*, Ana/);
  assert.match(JSON.stringify(cl.reading), /MOR is not a court|never who truly made it/);
  const claimed = await e.c.ask<Done>('publishing confirm', { plan: cl.plan, digest: cl.digest });
  const [claim] = claimed.acts;
  assert.ok(claimed.lines.some((l) => /Sent to Ana/.test(l.text)), JSON.stringify(claimed.lines));
  await signIn([ana], [claim], /A claim to sign/, /“we made this”/);
  let g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /The claim is bound/.test(l.text)), JSON.stringify(g.lines));

  // Way 3, the ownership agreement (H98): you and one other, shares even until touched; then three, the shares typed.
  const even = await e.c.ask<any>('publishing ownership read', { claim, people: [{ who: 'River' }, { who: 'Ana' }] });
  assert.deepEqual(even.reading.blocking, []);
  assert.match(even.reading.summary.join(' '), /River .* 50%, Ana .* 50%/);
  const alone = await e.c.ask<any>('publishing ownership read', { claim, people: [{ who: 'River' }, { who: '' }] });
  assert.ok(alone.reading.blocking.some((b: string) => /Name at least one other person/.test(b)), JSON.stringify(alone.reading.blocking));
  const owners = (o: { ana?: string } = {}) => [{ who: 'River', share: '50' }, { who: 'Pa', share: '30' }, { who: 'Ana', share: o.ana ?? '20' }];
  assert.ok((await e.c.ask<any>('publishing ownership read', { claim, people: owners({ ana: '25' }) })).reading.blocking.some((b: string) => /add up to 105%, not 100%/.test(b)));
  const ow = await e.c.ask<any>('publishing ownership read', { claim, people: owners() });
  assert.deepEqual(ow.reading.blocking, []);
  assert.match(JSON.stringify(ow.reading), /Ownership only: no split, no fees, no split service/);
  assert.match(JSON.stringify(ow.reading), /Pa \[[0-9a-f]{8}…[0-9a-f]{4}\]: 30%/);
  assert.match(JSON.stringify(ow.reading), /(is|are) not among the claim’s creators/, 'Pa is an owner, not a creator: said');
  const agreed = await e.c.ask<Done>('publishing confirm', { plan: ow.plan, digest: ow.digest });
  const [agreement] = agreed.acts;
  assert.equal(agreed.lines.filter((l) => /Sent to/.test(l.text)).length, 2, JSON.stringify(agreed.lines));
  // A publication naming it before every owner signed is refused in plain words.
  assert.ok((await e.c.ask<any>('publishing publication read', { owners: agreement, sold: [bake], service: svc.id, price: '1000' })).reading.blocking.some((b: string) => /waits for .* to sign/.test(b)));
  await signIn([pa, ana], [agreement], /An ownership agreement to sign/, /Who owns it.*: 50%.*: 30%.*: 20%/);
  g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /The ownership agreement counts/.test(l.text)), JSON.stringify(g.lines));

  // Way 4, a publication from it: Ana a partner labelled “client”, 5% off the top; a referral of 10%; the split service by its ID.
  const pub = (o: Record<string, unknown> = {}) => e.c.ask<any>('publishing publication read', { owners: agreement, sold: [bake], partners: [{ who: 'Ana', share: '5', label: 'client' }], service: svc.id, referral: '10', price: '1000', tagBy: 'service', ...o });
  assert.ok((await pub({ tagBy: 'me' })).reading.blocking.some((b: string) => /You sign its price tag only as one of its parties/.test(b)));
  assert.ok((await pub({ service: '' })).reading.blocking.some((b: string) => /Name the split service/.test(b)));
  const pr = await pub();
  assert.deepEqual(pr.reading.blocking, []);
  const said = JSON.stringify(pr.reading);
  assert.match(said, /Ana .*\(“client”\): 5% off the top, a partner/);
  assert.match(said, /Off the top: 10% of each payment to whoever reposted it/);
  assert.match(said, /The rest, to the owners: River .* 50%, Pa .* 30%, Ana .* 20%/);
  assert.match(said, /signed by its split service, in its own app/);
  const drafted = await e.c.ask<Done>('publishing confirm', { plan: pr.plan, digest: pr.digest });
  const [publication] = drafted.acts;
  assert.match(drafted.title, /sent to each party/);
  assert.ok(drafted.lines.some((l) => /signs it in its own app: give its operator the ID/.test(l.text)), JSON.stringify(drafted.lines));

  // The service signs it in its own app, its operator given the ID; nothing sells until every party has signed.
  assert.match(await svc.accept(publication), /signed, as its split service/);
  g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /waiting for Pa .*, Ana .* to sign/.test(l.text)), JSON.stringify(g.lines));
  await signIn([pa, ana], [publication], /A publication to sign/, /Its split service, .* receives every payment and pays everyone/);
  g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is published: every party signed it/.test(l.text)), JSON.stringify(g.lines));
  assert.ok(g.lines.some((l) => /sealed to Pa/.test(l.text)), 'the key to each other owner');
  const st = await e.c.ask<any>('publishing');
  const p = st.publications.find((x: any) => x.id === publication);
  assert.equal(p.state, 'counts');
  assert.match(await svc.tag(publication, { unit: R, value: 1000 }), /./);

  // A fourth identity buys it from Dub: the service answers, receipts in its own name, splits, pays each one.
  const b = await buyer(H, RL);
  await b.dub.c.ask('follow', { id: river.id, name: 'River' });
  const seen = await waitFor(async () => (await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === p.post && i.sealed?.tag), 'the post, its price tag counting');
  assert.equal(seen.sealed.through?.publication, publication, JSON.stringify(seen.sealed));
  const bought = await b.dub.c.ask<{ lines: { text: string }[] }>('buy', { publication: bake, seller: river.id, post: p.post });
  const asked = await svc.tick();
  assert.ok(asked.some((t) => /An invoice of its node sent/.test(t)), JSON.stringify([bought, asked]));
  await payFromDub(b, node);
  const told = await settle(svc, [river, pa, ana]);
  assert.match(told, /Split .*: 50 to .* \(partner\)/, told);

  // River's Edubba, told of the sale by the service, delivers the key; the text opens in the buyer's Dub.
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /a sale its publication’s split service receipted/.test(l.text)), JSON.stringify(d.lines));
  await b.dub.c.ask('money look');
  const opened = (await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === p.post)!;
  assert.equal(opened.sealed.state, 'opened');
  assert.equal(opened.sealed.text, text);

  // Withdraw the publication: a later version selling nothing, every party signing it; the bake stays, said plainly.
  const end = await e.c.ask<any>('publishing publication end read', { publication });
  assert.deepEqual(end.reading.blocking, []);
  assert.match(JSON.stringify(end.reading), /A bake is never withdrawn by the protocol/);
  const ended = await e.c.ask<Done>('publishing confirm', { plan: end.plan, digest: end.digest });
  assert.equal((await e.c.ask<any>('publishing')).publications.find((x: any) => x.id === publication).state, 'ending');
  await signIn([pa, ana], [ended.acts[0]], /The end of a publication to sign/, /sells nothing/);
  assert.match(await svc.accept(ended.acts[0]), /signed/);
  g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is ended: every party signed its ending/.test(l.text)), JSON.stringify(g.lines));
});

test('a vow claimed by its name; its ownership agreement in two versions (rule 14: the founding writes the stake to the vow’s signer, the second shares it); a publication selling it', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const [river, pa] = [await sharer(H, RL, 'River'), await sharer(H, RL, 'Pa')];
  const e = river.edubba;
  await e.c.ask('real contact add', { id: pa.id, name: 'Pa' });
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const r = await e.c.ask<any>('publishing vow read', { words: 'A lesson on reading tablets, given by two.', title: 'A lesson', price: '700' });
  const [vow] = (await e.c.ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest })).acts;
  const cl = await e.c.ask<any>('publishing claim read', { work: vow, title: 'A lesson', creators: [{ who: 'Pa' }] });
  assert.deepEqual(cl.reading.blocking, []);
  assert.match(cl.reading.summary.join(' '), /binding the vow’s name/);
  const [claim] = (await e.c.ask<Done>('publishing confirm', { plan: cl.plan, digest: cl.digest })).acts;
  await signIn([pa], [claim], /A claim to sign/, /“we made this”/);
  const ow = await e.c.ask<any>('publishing ownership read', { claim, people: [{ who: 'River', share: '60' }, { who: 'Pa', share: '40' }] });
  assert.deepEqual(ow.reading.blocking, []);
  assert.match(JSON.stringify(ow.reading), /its first version writes the whole stake to you, the vow’s signer \(rule 14\)/);
  const agreed = await e.c.ask<Done>('publishing confirm', { plan: ow.plan, digest: ow.digest });
  assert.equal(agreed.acts.length, 2, 'the founding and its second version, each to sign');
  await signIn([pa], agreed.acts, /An ownership agreement to sign/, /Its second version: the stake shared/);
  await e.c.ask('publishing gather');
  const pr = await e.c.ask<any>('publishing publication read', { owners: agreed.acts[0], sold: [vow], service: svc.id, price: '700' });
  assert.deepEqual(pr.reading.blocking, []);
  assert.match(JSON.stringify(pr.reading), /The vow .*, by its name/);
  const [publication] = (await e.c.ask<Done>('publishing confirm', { plan: pr.plan, digest: pr.digest })).acts;
  assert.match(await svc.accept(publication), /signed, as its split service/);
  await signIn([pa], [publication], /A publication to sign/, /A vow, by its name/);
  const g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is published: every party signed it/.test(l.text)), JSON.stringify(g.lines));
});

test('a collective’s work bought (S7e, round 8): its claim opened by every member’s Edubba from MOR; the purchase verified under the collective’s publication, the buyer’s contest beside it in each member’s Sales and the buyer’s Dub Purchases; Damgar’s Shared deals still unknown (the receipt sealed to the collective)', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const { foundCollective } = await import('./cast.ts');
  const [A, iPa, iPh] = [await sharer(H, RL, 'A'), await sharer(H, RL, 'iPa'), await sharer(H, RL, 'iPh')];
  const e = A.edubba;
  // Round 8 (F407), moved to the new Money tab (premises replaced, said here as the brief asks): the shares are set at the
  // founding; the collective's money is a split agreement (owners its founding agreement) the service signs, its payee pointer
  // then naming the service (no grant key: the service receives in its own name, rule 16); the collective's work is sold by the
  // collective's own publication, its price tag the service's. What follows the purchase is kept as it was asserted.
  const { collective } = await foundCollective(
    e,
    A.id,
    [iPa.dub, iPh.dub],
    [
      { name: 'Publishing', layer: [1, 2], holders: [A.id, iPa.id, iPh.id], number: 1 },
      { name: 'Publications', layer: 4, holders: [A.id, iPa.id], number: 2 },
      { name: 'Money', layer: 3, holders: [A.id], number: 1 },
    ],
    { shares: { [A.id]: 50, [iPa.id]: 30, [iPh.id]: 20 } },
  );
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const review = await e.c.ask<any>('real money prepare', { collective, way: 'service', referral: 0, service: svc.id });
  assert.deepEqual(review.reading.blocking, []);
  const split = (await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest })).acts[0];
  // Its judicial tier (S7h-4): every member signs the collective's split agreement, iPa and iPh in Dub's Signing tab.
  for (const m of [iPa, iPh]) {
    const sp = await waitFor(async () => (await m.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === split), 'the split agreement in the member’s Signing tab');
    await m.dub.c.ask('accept', { thread: sp.thread });
  }
  assert.equal((await e.c.ask<any>('real gather', { act: split })).standing.enough, true);
  assert.match(await svc.accept(split), /signed/);
  const rec = await e.c.ask<Done>('real money record', { act: split });
  assert.ok(rec.lines.some((l) => /payee pointer now names the split service/.test(l.text)), JSON.stringify(rec.lines));
  await e.c.ask('publishing act as', { id: collective });
  const up = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode('The collective’s story.')), title: 'A story', then: 'none' });
  assert.deepEqual(up.reading.blocking, []);
  const [publication] = (await e.c.ask<Done>('publishing confirm', { plan: up.plan, digest: up.digest })).acts;
  const pr = await e.c.ask<any>('publishing publication read', { sold: [publication], service: svc.id, price: '1000', tagBy: 'service' });
  assert.deepEqual(pr.reading.blocking, []);
  const [pub] = (await e.c.ask<Done>('publishing confirm', { plan: pr.plan, digest: pr.digest })).acts;
  const pp = await waitFor(async () => (await iPa.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === pub), 'the publication in iPa’s Signing tab');
  await iPa.dub.c.ask('accept', { thread: pp.thread });
  assert.match(await svc.accept(pub), /signed, as its split service/);
  const g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is published by the collective/.test(l.text)), JSON.stringify(g.lines));
  assert.match(await svc.tag(pub, { unit: R, value: 1000 }), /./);
  const postId = (await e.c.ask<any>('publishing')).publications.find((x: any) => x.id === pub).post;

  const b = await buyer(H, RL);
  await b.dub.c.ask('follow', { id: A.id, name: 'A' });
  await waitFor(async () => (await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === postId && i.sealed?.tag), 'the post, its price tag counting');
  await b.dub.c.ask('buy', { publication, seller: A.id, post: postId });
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
    // Round 8 (F407), premise replaced: the payment goes to the split service under the collective's own publication and
    // its price tag, so it is verified as a purchase: the buyer's contest shows beside it (S7e's "unknown", a collective's
    // pointer signed under a grant key a Money-only reading could not hold, no longer arises; question 2 of the report).
    assert.equal(sale.beside.state, 'shown', `${m.name}: ${JSON.stringify(sale.beside)} ${JSON.stringify(s.problems)}`);
    assert.deepEqual(sale.beside.contests.map((x: any) => x.promise), ['Not the story told.']);
    assert.equal(sale.beside.noPurchase, null);
    // Damgar's Account › Shared deals: the collective's sale beside the deals, unknown, with its reason; the payout to this member, on its own node, valid.
    await m.damgar.c.ask('look');
    const a = await m.damgar.c.ask<Account>('account');
    const c = a.shared?.find((x) => x.name === 'a collective’s work');
    assert.ok(c?.payments.length, `${m.name}: ${JSON.stringify(a.shared)}`);
    for (const x of c.payments) {
      assert.equal(x.rail.answer, 'unknown', JSON.stringify(x));
      assert.match(x.standing, /its receipt is sealed to the collective, which this Damgar does not open: whether it was paid is unknown here/, x.standing);
    }
    assert.ok(c.payouts.length && c.payouts.every((x) => x.paid && x.amount.unit === R), JSON.stringify(c.payouts));
  }
  // Dub's Purchases: the purchase unknown beside the file, with its reason; Dub's Payments (its Damgar): the claim's rail answer unknown, with its reason.
  const bought = (await b.dub.c.ask<{ items: any[] }>('purchases')).items.find((x) => x.id === publication);
  assert.equal(bought?.contests?.state, 'shown', JSON.stringify(bought));
  assert.deepEqual(bought.contests.contests.map((x: any) => x.promise), ['Not the story told.'], JSON.stringify(bought));
  const paid = (await b.dub.c.ask<{ done: PaymentShown[] }>('payments')).done.find((x) => x.amount.value === 1000)!;
  assert.deepEqual(paid.proofs.map((x) => [x.kind, x.rail.answer, x.rail.why]), [['claim', 'valid', '']], 'the claim’s rail answer, now the split service’s own (round 8)');

  // By clicks: a member's Damgar, Account › Shared deals; a member's Edubba, Publishing › Sales; the buyer's Dub, Purchases.
  const problems: string[] = [];
  const pg = await openPage(iPa.damgar.app.base, iPa.damgar.app.access.newCode(), problems);
  await pg.locator('[data-k-tile=account]').click({ timeout: 60_000 });
  await pg.locator('.k-col button', { hasText: 'Shared deals' }).click();
  await pg.locator('.k-act', { hasText: 'whether it was paid is unknown here' }).first().waitFor({ timeout: 60_000 });
  await shot(pg, 'damgar-shared-deals-unknown.png');
  const pe = await openPage(iPa.edubba.app.base, iPa.edubba.app.access.newCode(), problems);
  await pe.locator('[data-k-tile=publishing]').click({ timeout: 60_000 });
  await pe.locator('.k-col button', { hasText: 'Sales' }).click();
  await pe.locator('.edubba-beside', { hasText: 'Not the story told.' }).first().waitFor({ timeout: 60_000 });
  await shot(pe, 'edubba-sales-contest.png');
  const pd = await openPage(b.dub.app.base, b.dub.app.access.newCode(), problems);
  await pd.locator('[data-k-part="purchases"]').click({ timeout: 60_000 });
  await pd.locator('#bought .k-act', { hasText: 'Not the story told.' }).first().waitFor({ timeout: 60_000 });
  await shot(pd, 'dub-purchases-contest.png');
  assert.deepEqual(problems, []);
});
