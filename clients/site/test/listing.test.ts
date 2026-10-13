// dubsar.org's listing of cMIPs and Modules (F288; website cMIP draft 9,
// rule 13c): test specifications published as acts on two local relays, by
// test identities on their homes, as Development's Part three says (a public
// publication whose media is the specification's content): a cMIP filling a
// task and its second draft, a Module under it, an xtype and a successor of
// it by another creator, a proof-of-delivery checker declaring the layers it
// acts on, a copy published by someone else, one naming a creator that never
// published it, releases naming two of them; and two that cannot be
// verified, one whose signer's home is gone, one whose content is no
// specification. The listing read on its own, then dubsar.org's page in a
// real browser on a phone's screen, with the two test relays in place of
// home1 and home2. Real homes and relays on local ports; test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Frame } from 'playwright-core';
import { MIRS, SPECS, cborEncode, lockMedia, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { Gateway } from '../src/gateway.ts';
import { decodeSpec, linesOf, nameOf, readListing, roleWords, specHash, type Listed, type Listing } from '../src/listing.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { parseGatewaySettings } from '../src/settings.ts';
import { PUBLICATION, RELEASE_MANIFEST } from '../src/specs.ts';
import { benign, SITE_DIR } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WEBKIT = process.env.MOR_BROWSER === 'webkit';
const shots = process.env.MOR_SCREENSHOTS;
/** An address no browser reaches: an onion address over plain http. */
const ONION = 'http://abcdefghijklmnopqrstuvwxyz234567abcdefghijklmnopqrstuv.onion';

let browser: Browser;
let gateway: Gateway;
let base: string;
const running: Running[] = [];
let relayA: string;
let relayB: string;
let places: string[];
let alice: TestIdentity;
let bob: TestIdentity;
let carol: TestIdentity;
let gone: TestIdentity;
/** Spec hashes and publication ids, by name. */
const hash: Record<string, string> = {};
const pub: Record<string, string> = {};
let listing: Listing;

/** A specification's content: Development's `spec` map, canonical CBOR. */
function content(fields: [number, unknown][]): Uint8Array {
  return cborEncode(new Map<number, unknown>(fields));
}

/** Publish a specification as Development's Part three says: a public publication whose media is its content. */
async function publishSpec(by: TestIdentity, bytes: Uint8Array, relays: string[], mediaSpec = MIRS.development): Promise<{ id: string; hash: string }> {
  const lm = lockMedia(bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(mediaSpec)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, bytes.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, relays],
    ]),
  );
  const made = await by.publish(SPECS.envelopes, PUBLICATION, payload, { public: true, relays });
  for (const r of relays) await relayAt(r, by.via).putMedia(lm.locked);
  return { id: made.id, hash: specHash(bytes) };
}

/** A release (release manifest cMIP) naming a specification's publication among its references. */
async function publishRelease(by: TestIdentity, name: string, version: string, names: string, relays: string[]): Promise<string> {
  const manifest = cborEncode(new Map<number, unknown>([[0, name], [1, version], [2, null], [3, []], [4, []]]));
  const lm = lockMedia(manifest) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(RELEASE_MANIFEST)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, manifest.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, relays],
    ]),
  );
  const made = await by.publish(SPECS.envelopes, PUBLICATION, payload, { public: true, relays, refs: [names] });
  for (const r of relays) await relayAt(r, by.via).putMedia(lm.locked);
  return made.id;
}

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  const [home1, home2, home3] = [await start('home'), await start('home'), await start('home')];
  const [site, a, b] = [await start('relay'), await start('relay'), await start('relay')];
  running.push(home1, home2, home3, site, a, b);
  relayA = a.base;
  relayB = b.base;
  places = [site.base, home1.base, home2.base];

  alice = TestIdentity.create({ homes: [home1.home] });
  bob = TestIdentity.create({ homes: [home1.home] });
  carol = TestIdentity.create({ homes: [home2.home] });
  for (const who of [alice, bob, carol]) await who.publishGenesis();
  const id = (who: TestIdentity) => unhex(who.id);

  // A cMIP filling task 6 (Money, payment), and its second draft naming it.
  const pay1 = content([[0, 0], [1, id(alice)], [2, [[unhex(MIRS.money), 6]]], [9, '# cMIP: Test payment, draft 1\n\nHow test rails plug in.']]);
  Object.assign(pub, { pay1: (await publishSpec(alice, pay1, [relayA])).id });
  hash.pay1 = specHash(pay1);
  const pay2 = content([[0, 0], [1, id(alice)], [2, [[unhex(MIRS.money), 6]]], [8, unhex(hash.pay1)], [9, '# cMIP: Test payment, draft 2\n\nHow test rails plug in, again.']]);
  ({ id: pub.pay2, hash: hash.pay2 } = await publishSpec(alice, pay2, [relayA]));
  pub.release = await publishRelease(alice, 'test-payment', '0.2', pub.pay2, [relayA]);
  // The same first draft, published again by someone else: the same specification, still Alice's.
  pub.pay1copy = (await publishSpec(carol, pay1, [relayB])).id;

  // A Module under the second draft: a rail Module, a request rail.
  const rail = content([[0, 1], [1, id(bob)], [5, unhex(hash.pay2)], [9, '# Module: Test rail\n\nA rail for tests, never for money.'], [11, 0]]);
  ({ id: pub.rail, hash: hash.rail } = await publishSpec(bob, rail, [relayA]));

  // An xtype: act types, no task; code released by its creator. Then a successor by another creator.
  const notes = content([[0, 0], [1, id(bob)], [3, [[0, 'note', 'note = tstr'], [1, 'answer', 'answer = tstr']]], [9, '# cMIP: Test notes\n\nNotes and answers.']]);
  ({ id: pub.notes, hash: hash.notes } = await publishSpec(bob, notes, [relayA]));
  pub.notesRelease = await publishRelease(bob, 'test-notes', '1.0', pub.notes, [relayA]);
  const notes2 = content([[0, 0], [1, id(carol)], [3, [[0, 'note', 'note = tstr']]], [8, unhex(hash.notes)], [9, '# cMIP: Test notes, by Carol\n\nNotes only.']]);
  ({ id: pub.notes2, hash: hash.notes2 } = await publishSpec(carol, notes2, [relayB]));

  // A proof-of-delivery checker (field 12), declaring the layers it acts on as an extension (field 10).
  const checker = content([[0, 0], [1, id(carol)], [9, '# cMIP: Test checker\n\nChecks proofs of delivery.'], [10, [2, 3]], [12, true]]);
  ({ id: pub.checker, hash: hash.checker } = await publishSpec(carol, checker, [relayB]));

  // One naming Alice as its creator, published only by Carol: unclaimed by Alice (Development rule 3).
  const unclaimed = content([[0, 0], [1, id(alice)], [2, [[unhex(MIRS.agreements), 8]]], [9, '# cMIP: Test split, said to be Alice’s\n\nA split.']]);
  ({ id: pub.unclaimed, hash: hash.unclaimed } = await publishSpec(carol, unclaimed, [relayB]));

  // Two that cannot be verified: a signer whose home is gone before its genesis reached anyone, and content that is no specification.
  gone = TestIdentity.create({ homes: [home3.home] });
  await home3.stop();
  pub.gone = (await publishSpec(gone, content([[0, 0], [1, id(gone)], [9, '# cMIP: Words that must not be shown unverified']]), [relayA])).id;
  pub.garbage = (await publishSpec(carol, cborEncode(new Map<number, unknown>([[0, 0], [99, 'what']])), [relayB])).id;

  listing = await readListing(
    [
      { address: relayA, name: 'the first relay' },
      { address: relayB, name: null },
      { address: ONION, name: 'an onion relay' },
    ],
    places,
  );

  // dubsar.org, its listing page reading the two test relays in place of home1 and home2.
  const dir = mkdtempSync(join(tmpdir(), 'mor-site-listing-'));
  cpSync(SITE_DIR, dir, { recursive: true });
  const page = join(dir, 'listing.html');
  writeFileSync(page, readFileSync(page, 'utf8').replace('https://home1.dubsar.org', relayA).replace('https://home2.dubsar.org', relayB));
  const v = await publishSite(alice, { name: 'dubsar.org', files: readFolder(dir), relays: [site.base] });
  gateway = new Gateway(
    parseGatewaySettings({
      listen: '127.0.0.1:0',
      look: 0,
      sites: [{ hosts: ['127.0.0.1'], version: v.id, identity: alice.id, name: 'Nobody, allegedly', relays: places, serve: 'pinned' }],
    }),
    join(here, 'dist'),
    { extraConnect: ['http://127.0.0.1:*'] },
  );
  assert.ok((await gateway.load()).every((s) => s.loaded.ok));
  base = await gateway.listen('127.0.0.1', 0);
  browser = WEBKIT ? await webkit.launch() : await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  gateway?.close();
  for (const r of running) await r.stop().catch(() => {});
});

const all = () => new Map(listing.lines.flatMap((l) => l.drafts.map((d) => [d.listed.hash, d.listed] as [string, Listed])));
const lineOf = (h: string) => listing.lines.find((l) => l.drafts.some((d) => d.listed.hash === h))!;
const listed = (h: string) => all().get(h)!;

test('a specification decodes strictly, is named by its hash and by the first line of its text', () => {
  const ok = content([[0, 1], [1, new Uint8Array(32)], [9, '# Module: A\n\nText.'], [11, 2]]);
  const s = decodeSpec(ok);
  assert.equal(s.kind, 1);
  assert.equal(s.rail, 2);
  assert.equal(nameOf(s.text), 'Module: A');
  assert.equal(specHash(ok).length, 64);
  assert.notEqual(specHash(ok), specHash(content([[0, 1], [1, new Uint8Array(32)], [9, '# Module: B']])), 'another content, another hash');
  for (const [bad, why] of [
    [[[0, 0], [9, 'x']], /names no creator/],
    [[[0, 9], [1, new Uint8Array(32)], [9, 'x']], /kind/],
    [[[0, 0], [1, new Uint8Array(32)]], /no text/],
    [[[0, 0], [1, new Uint8Array(32)], [9, 'x'], [10, [3, 2]]], /ascending/],
    [[[0, 0], [1, new Uint8Array(32)], [9, 'x'], [12, false]], /field 12/],
    [[[0, 0], [1, new Uint8Array(32)], [9, 'x'], [13, 1]], /key Development does not define/],
  ] as [[number, unknown][], RegExp][]) {
    assert.throws(() => decodeSpec(content(bad)), why);
  }
  // A MIR has no creator.
  assert.equal(decodeSpec(content([[0, 4], [9, '# MIR: X']])).creator, null);
});

test('the listing reads the relays named, and only those a browser can reach', () => {
  const [a, b, onion] = listing.relays;
  assert.equal(a.address, relayA);
  assert.equal(a.name, 'the first relay');
  assert.ok(a.asked && b.asked);
  assert.equal(a.specs, 5, 'each relay holds five publications of specifications');
  assert.equal(b.specs, 5);
  assert.ok(a.read > a.specs, 'every act it serves is read, specifications picked out');
  assert.equal(onion.asked, false, 'an onion address over http is not asked from a browser');
  assert.equal(onion.read, 0);
});

test('a cMIP filling a task, its second draft, and the code released for it', () => {
  const line = lineOf(hash.pay1);
  assert.deepEqual(
    line.drafts.map((d) => [d.listed.hash, d.number]),
    [
      [hash.pay1, 1],
      [hash.pay2, 2],
    ],
    'its drafts in order, by the predecessor each names',
  );
  assert.equal(line.newest.hash, hash.pay2);
  assert.equal(line.newest.name, 'cMIP: Test payment, draft 2');
  const w = roleWords(line.newest, all());
  assert.equal(w.kind, 'cMIP');
  assert.equal(w.layer, 'Money');
  assert.deepEqual(w.role, ['fills task 6, Payment']);
  assert.equal(line.newest.spec.creator, alice.id);
  assert.ok(line.newest.claimed, 'published by its creator');
  assert.equal(line.drafts[1].otherCreator, false);
  assert.deepEqual(
    line.newest.releases.map((r) => [r.id, r.signer, r.name, r.version, r.problem]),
    [[pub.release, alice.id, 'test-payment', '0.2', null]],
  );
  // The first draft, published twice: one specification, its creator's publication first.
  const first = listed(hash.pay1);
  assert.deepEqual(
    first.publications.map((p) => p.signer),
    [alice.id, carol.id],
  );
  assert.ok(first.claimed);
  assert.equal(first.releases.length, 0);
});

test('a Module under a cMIP takes its layer from it', () => {
  const m = listed(hash.rail);
  const w = roleWords(m, all());
  assert.equal(w.kind, 'Module');
  assert.equal(w.layer, 'Money');
  assert.deepEqual(w.role, ['works under the cMIP “cMIP: Test payment, draft 2”', 'a rail Module: a request rail']);
  assert.equal(lineOf(hash.rail).drafts.length, 1);
});

test('an xtype, and a successor of it by another creator, said as such', () => {
  const line = lineOf(hash.notes);
  assert.deepEqual(
    line.drafts.map((d) => d.listed.hash),
    [hash.notes, hash.notes2],
  );
  const w = roleWords(listed(hash.notes), all());
  assert.equal(w.layer, 'Development');
  assert.match(w.role[0], /^an xtype: defines 2 act types \(note, answer\), filling no task$/);
  assert.equal(line.drafts[1].otherCreator, true, 'Development rule 25: a successor by another creator is shown as such');
  assert.equal(listed(hash.notes).releases[0].signer, bob.id);
  assert.equal(listed(hash.notes2).releases.length, 0);
});

test('field 12, the discovery field, and the layers an extension declares', () => {
  const w = roleWords(listed(hash.checker), all());
  assert.equal(w.layer, 'Development');
  assert.deepEqual(w.role, [
    'declares, for use as an extension, the layers it acts on beyond Development: Money, Agreements',
    'checks proofs of delivery of proven offers (field 12)',
  ]);
});

test('a specification naming a creator who never published it is shown as unclaimed', () => {
  const u = listed(hash.unclaimed);
  assert.equal(u.spec.creator, alice.id);
  assert.equal(u.claimed, false);
  assert.deepEqual(
    u.publications.map((p) => p.signer),
    [carol.id],
  );
  assert.equal(roleWords(u, all()).layer, 'Agreements');
});

test('what cannot be verified is shown as such, with the reason, and nothing it says', () => {
  const ids = listing.unverified.map((p) => p.id).sort();
  assert.deepEqual(ids, [pub.gone, pub.garbage].sort());
  const g = listing.unverified.find((p) => p.id === pub.gone)!;
  assert.match(g.problem!, /identity chain could not be looked up/);
  assert.equal(g.spec, null, 'nothing it says is read');
  const x = listing.unverified.find((p) => p.id === pub.garbage)!;
  assert.match(x.problem!, /not a specification as Development defines one/);
  assert.equal(listing.lines.length, 5, 'payment (two drafts), rail, notes (two drafts), checker, unclaimed');
});

test('lines of drafts: a fork named, a predecessor not found said', () => {
  const mk = (h: string, pred: string | null, creator = 'c'.repeat(64)): Listed => ({
    hash: h,
    name: h,
    spec: { kind: 0, creator, tasks: [], types: [], dependencies: [], implements: null, rules: 0, fee: false, predecessor: pred, text: h, layers: null, rail: null, checker: false },
    publications: [],
    claimed: true,
    releases: [],
  });
  const lines = linesOf([mk('a', null), mk('b', 'a'), mk('c', 'a'), mk('d', 'z')]);
  const first = lines.find((l) => l.drafts[0].listed.hash === 'a')!;
  assert.deepEqual(
    first.drafts.map((d) => [d.listed.hash, d.number, d.siblings]),
    [
      ['a', 1, []],
      ['b', 2, ['c']],
      ['c', 2, ['b']],
    ],
  );
  const lone = lines.find((l) => l.drafts[0].listed.hash === 'd')!;
  assert.equal(lone.drafts[0].afterMissing, 'z');
});

async function open(path: string) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: !WEBKIT, hasTouch: true });
  const page = await ctx.newPage();
  const problems: string[] = [];
  const elsewhere: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !benign(m.text()) && !/Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (e) => {
    if (!benign(String(e))) problems.push(String(e));
  });
  page.on('request', (r) => {
    if (!/^(http:\/\/127\.0\.0\.1:|blob:|data:|about:)/.test(r.url())) elsewhere.push(r.url());
  });
  await page.goto(`${base}${path}`);
  await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 60_000 });
  return { page, ctx, problems, elsewhere };
}

async function listingFrame(page: import('playwright-core').Page): Promise<Frame> {
  const outer = await (await page.waitForSelector('#mor-page')).contentFrame();
  assert.ok(outer);
  const box = await outer.waitForSelector('.mor-listing[data-done]', { timeout: 120_000 });
  const inner = await (await box.$('iframe'))?.contentFrame();
  assert.ok(inner, 'the listing is shown in a frame of its own');
  return inner;
}

test('dubsar.org’s listing on a phone: one listing among any, each specification checked in the browser', async () => {
  const { page, ctx, problems, elsewhere } = await open('/listing.html');
  assert.match((await page.textContent('#mor-standing'))!, /^Verified/);
  const f = await listingFrame(page);

  // First, in plain words: one listing among any.
  const first = await f.$eval('body', (b) => (b.firstElementChild as HTMLElement).id);
  assert.equal(first, 'l-any');
  assert.match((await f.textContent('#l-any'))!, /^One listing among any; anyone can run another\.\s*It decides nothing and refuses nothing/);

  const cards = await f.$$eval('.l-line[data-verified="yes"]', (els) =>
    els.map((e) => ({
      spec: (e as HTMLElement).dataset.spec!,
      name: e.querySelector('.l-name')!.textContent,
      kind: e.querySelector('[data-kind]')!.textContent,
      layer: e.querySelector('[data-layer]')!.textContent,
      role: e.querySelector('[data-role]')!.textContent,
      code: (e.querySelector('[data-code]') as HTMLElement).dataset.code,
      claimed: (e.querySelector('[data-claimed]') as HTMLElement | null)?.dataset.claimed,
      drafts: [...e.querySelectorAll('[data-draft]')].map((d) => (d as HTMLElement).dataset.draft),
      other: !!e.querySelector('[data-other-creator]'),
      text: e.textContent ?? '',
    })),
  );
  assert.equal(cards.length, 5);
  const card = (h: string) => cards.find((c) => c.spec === h)!;
  const pay = card(hash.pay2);
  assert.equal(pay.name, 'cMIP: Test payment, draft 2');
  assert.equal(pay.kind, 'cMIP');
  assert.equal(pay.layer, 'Money');
  assert.match(pay.role!, /fills task 6, Payment/);
  assert.equal(pay.code, 'released');
  assert.match(pay.text, /released by its creator: “test-payment” 0\.2/);
  assert.equal(pay.claimed, 'yes');
  assert.deepEqual(pay.drafts, [hash.pay1, hash.pay2], 'its drafts, in order');
  assert.match(pay.text, new RegExp(`Creator ${alice.id.match(/.{4}/g)!.join(' ')}`), 'its creator by the whole fingerprint');
  assert.match(card(hash.rail).role!, /works under the cMIP “cMIP: Test payment, draft 2”/);
  assert.equal(card(hash.rail).layer, 'Money');
  assert.equal(card(hash.notes2).other, true, 'a draft by another creator, said');
  assert.match(card(hash.notes2).role!, /an xtype/);
  assert.match(card(hash.checker).role!, /checks proofs of delivery of proven offers \(field 12\)/);
  assert.equal(card(hash.unclaimed).claimed, 'no');
  assert.match(card(hash.unclaimed).text, /Unclaimed by its named creator/);
  assert.equal(card(hash.unclaimed).code, 'none');

  // The two that could not be verified: shown as such, their words nowhere.
  const bad = await f.$$eval('.l-line[data-verified="no"]', (els) => els.map((e) => ({ id: (e as HTMLElement).dataset.pub, text: e.textContent ?? '' })));
  assert.deepEqual(bad.map((b) => b.id).sort(), [pub.gone, pub.garbage].sort());
  assert.ok(bad.every((b) => /Not verified/.test(b.text) && /What it says is not shown/.test(b.text)));
  assert.ok(!(await page.evaluate(() => document.body.innerText)).includes('must not be shown'));
  assert.ok(!(await f.textContent('body'))!.includes('must not be shown'), 'its words are nowhere on the screen');

  // Phone first: nothing wider than the screen.
  const wide = await f.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(wide <= 0, `nothing scrolls sideways (${wide}px)`);
  assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);

  // The bar names the relays read, the one not asked, and the counts.
  await page.click('#mor-bar summary');
  const listed = (await page.textContent('#mor-listings'))!;
  assert.match(listed, /7 specifications verified, 2 publications not verified/);
  assert.match(listed, /home1\.dubsar\.org, http:\/\/127\.0\.0\.1:\d+: \d+ acts read, 5 publications of specifications/);
  assert.match(listed, /home2\.dubsar\.org, http:\/\/127\.0\.0\.1:\d+: \d+ acts read, 5 publications of specifications/);
  if (shots) await page.screenshot({ path: join(shots, 'listing-phone.png'), fullPage: true });
  assert.deepEqual(elsewhere, [], 'nothing fetched from anywhere but the gateway, the homes and the relays');
  assert.deepEqual(problems, []);
  await ctx.close();
});
