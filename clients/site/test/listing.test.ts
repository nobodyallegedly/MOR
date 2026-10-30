// dubsar.org's listing of cMIPs and Modules (F288; website cMIP draft 9,
// rule 13c): test specifications published as acts on two local relays, by
// test identities on their homes, as Development's Part three says (a public
// publication whose media is the specification's content): a cMIP filling a
// task and its second draft, a Module under it, an xtype and a successor of
// it by another creator, a proof-of-delivery checker declaring the layers it
// acts on, a copy published by someone else, one naming a creator that never
// published it, releases naming two of them; and two that cannot be
// verified, one whose signer's home is gone, one whose content is no
// specification. And agreements naming extensions (F288, the listing's
// first purpose): three deals signed by every party naming the xtype (one
// with a second version, a clone, naming it again), one also naming the
// checker and one a cMIP published nowhere; a proposal one party never
// signed; and a private agreement, which cannot be read. The listing read on its own, then dubsar.org's page in a
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
import { MIRS, SPECS, cborEncode, hex, lockMedia, signaturePayload, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { Gateway } from '../src/gateway.ts';
import { KINDS, decodeSpec, linesOf, nameOf, readListing, roleWords, specHash, type Listed, type Listing } from '../src/listing.ts';
import { publishSite, readFolder } from '../src/publish.ts';
import { parseGatewaySettings } from '../src/settings.ts';
import { PAYMENT_CMIP, BAKE, RELEASE_MANIFEST } from '../src/specs.ts';
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
/** Start a home or relay, kept for `after` at once: stopped whatever happens next (CI). */
const up = async (role: 'home' | 'relay') => {
  const r = await start(role);
  running.push(r);
  return r;
};
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
/** Agreements' terms, by name. */
const deal: Record<string, string> = {};

/** A deal's terms (Agreements type 0): its parties, its words, the extensions it names; a clone names its parent. */
function dealTerms(parties: TestIdentity[], text: string, extensions: string[], parent?: string): Uint8Array {
  const ids = parties.map((p) => p.id);
  const m = new Map<number, unknown>([
    [0, ids.map(unhex)],
    [1, text],
    [2, new Map()],
    [4, parent ? [[[1], [...ids].sort().map(unhex)]] : [0]],
    [5, [0]],
  ]);
  if (parent) m.set(11, unhex(parent));
  if (extensions.length) m.set(15, extensions.map(unhex));
  return cborEncode(m);
}

/** Propose terms, public or private, and have the parties named sign them. */
async function agree(by: TestIdentity, payload: Uint8Array, signers: TestIdentity[], relays: string[], o: { private?: TestIdentity[]; parent?: string } = {}): Promise<string> {
  const objects: [string, string][] | undefined = o.parent ? [[o.parent, o.parent]] : undefined;
  const made = o.private
    ? await by.publish(MIRS.agreements, 0, payload, { public: false, to: o.private.map((x) => x.id), relays, objects })
    : await by.publish(MIRS.agreements, 0, payload, { public: true, relays, objects });
  for (const who of signers) {
    await who.publish(MIRS.agreements, 1, signaturePayload(made.id), { public: !o.private, to: o.private?.map((x) => x.id), relays, objects: [[made.id, made.id]] });
  }
  return made.id;
}

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
  const made = await by.publish(SPECS.envelopes, BAKE, payload, { public: true, relays });
  for (const r of relays) await relayAt(r, by.via).putMedia(lm.locked);
  return { id: made.id, hash: specHash(bytes) };
}

/**
 * A release (release manifest cMIP): before draft 3, naming a specification's
 * publication among its publication's references; from draft 4, in its
 * manifest's "implements" (field 6), entries `[spec, ? hint]` sorted by spec
 * hash, with or without references; `draft3` writes draft 3's field 6, bare
 * publication ids, which draft 4 does not take.
 */
async function publishRelease(by: TestIdentity, name: string, version: string, names: string | null, relays: string[], implementsSpecs?: [string, string?][], draft3?: string[]): Promise<string> {
  const fields: [number, unknown][] = [[0, name], [1, version], [2, null], [3, []], [4, []]];
  if (implementsSpecs) fields.push([6, [...implementsSpecs].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([h, hint]) => (hint ? [unhex(h), unhex(hint)] : [unhex(h)]))]);
  if (draft3) fields.push([6, [...draft3].sort().map(unhex)]);
  const manifest = cborEncode(new Map<number, unknown>(fields));
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
  const made = await by.publish(SPECS.envelopes, BAKE, payload, { public: true, relays, refs: names ? [names] : undefined });
  for (const r of relays) await relayAt(r, by.via).putMedia(lm.locked);
  return made.id;
}

/** An act of an xtype's type (Development rule 2: named by the type within the specification that defines it). */
async function useXtype(by: TestIdentity, spec: string, type: number, relays: string[], o: { private?: TestIdentity[] } = {}): Promise<string> {
  const made = await by.publish(spec, type, cborEncode(new Map<number, unknown>([[0, 'a test note']])), { public: !o.private, to: o.private?.map((x) => x.id), relays });
  return made.id;
}

before(async () => {
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here, stdio: 'ignore' });
  const [home1, home2, home3] = [await up('home'), await up('home'), await up('home')];
  const [site, a, b] = [await up('relay'), await up('relay'), await up('relay')];
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
  const rail = content([[0, 1], [1, id(bob)], [5, unhex(hash.pay2)], [9, '# Module: Test rail\n\nA rail for tests, never for money.'], [11, 0], [13, [0, 1]]]);
  ({ id: pub.rail, hash: hash.rail } = await publishSpec(bob, rail, [relayA]));

  // An xtype: act types, no task; code released by its creator. Then a successor by another creator.
  const notes = content([[0, 0], [1, id(bob)], [3, [[0, 'note', 'note = tstr'], [1, 'answer', 'answer = tstr']]], [9, '# cMIP: Test notes\n\nNotes and answers.']]);
  ({ id: pub.notes, hash: hash.notes } = await publishSpec(bob, notes, [relayA]));
  pub.notesRelease = await publishRelease(bob, 'test-notes', '1.0', pub.notes, [relayA]);
  const notes2 = content([[0, 0], [1, id(carol)], [3, [[0, 'note', 'note = tstr']]], [8, unhex(hash.notes)], [9, '# cMIP: Test notes, by Carol\n\nNotes only.']]);
  ({ id: pub.notes2, hash: hash.notes2 } = await publishSpec(carol, notes2, [relayB]));

  // A proof-of-delivery checker (field 12), declaring the layers it acts on as an extension (field 10).
  // Field 10 [3, 4]: Money and Agreements, in Development draft 11's numbering (F407: Text 1 and Envelopes 2 are two layers; was [2, 3]).
  const checker = content([[0, 0], [1, id(carol)], [9, '# cMIP: Test checker\n\nChecks proofs of delivery.'], [10, [3, 4]], [12, true]]);
  ({ id: pub.checker, hash: hash.checker } = await publishSpec(carol, checker, [relayB]));
  // F290: a specification's content published under another media spec is no publication of a specification.
  pub.otherMedia = (await publishSpec(carol, content([[0, 0], [1, id(carol)], [9, '# cMIP: Under another media spec']]), [relayB], 'f'.repeat(64))).id;
  // Release manifest cMIP draft 4: a release naming the checker's spec hash in its manifest's "implements", its
  // publication beside it a hint, and referring to the rail Module from its publication: "implements" is read
  // first, so it is the checker's code, not the rail's (Development Q7, taken).
  pub.checkerRelease = await publishRelease(carol, 'test-checker', '3.0', pub.rail, [relayB], [[hash.checker, pub.checker]]);

  // The use of the two xtypes: public acts of their types, on both relays; a private one, an undefined type and an
  // act no chain counts are not counted.
  for (const [by, type, relay] of [[alice, 0, relayA], [bob, 0, relayB], [carol, 1, relayA]] as [TestIdentity, number, string][]) await useXtype(by, hash.notes, type, [relay]);
  await useXtype(carol, hash.notes2, 0, [relayB]);
  await useXtype(alice, hash.notes, 0, [relayA], { private: [bob] });
  await useXtype(alice, hash.notes, 7, [relayA]);

  // One naming Alice as its creator, published only by Carol: unclaimed by Alice (Development rule 3).
  const unclaimed = content([[0, 0], [1, id(alice)], [2, [[unhex(MIRS.agreements), 8]]], [9, '# cMIP: Test split, said to be Alice’s\n\nA split.']]);
  ({ id: pub.unclaimed, hash: hash.unclaimed } = await publishSpec(carol, unclaimed, [relayB]));
  // A release under draft 3's "implements", naming its publication: not a valid manifest under draft 4.
  pub.draft3Release = await publishRelease(carol, 'test-split', '0.3', null, [relayB], undefined, [pub.unclaimed]);
  // A release naming a spec hash with no hint: matched by the spec hash alone, whichever publication was found.
  pub.notes2Release = await publishRelease(carol, 'test-notes-carol', '2.0', null, [relayB], [[hash.notes2]]);

  // MIPs (Development kind 8, F325): a MIR and the MICS document, published with no creator (F291), and MIPs
  // forking them; one forking a MIP, one proposing a new layer under the MICS document (F328, Q10), one forking a
  // specification not found here and one forking a cMIP, each in a group of its own.
  const mir = content([[0, 4], [9, '# MIR: Test money\n\nThe money layer, for tests.']]);
  ({ id: pub.mir, hash: hash.mir } = await publishSpec(alice, mir, [relayA]));
  const mics = content([[0, 6], [9, '# MICS: Test core\n\nThe core, for tests.']]);
  ({ id: pub.mics, hash: hash.mics } = await publishSpec(alice, mics, [relayA]));
  const mip = (who: TestIdentity, forks: string, title: string) => content([[0, 8], [1, id(who)], [8, unhex(forks)], [9, `# MIP: ${title}\n\nA proposal.`]]);
  ({ hash: hash.mipA } = await publishSpec(bob, mip(bob, hash.mir, 'Money, forked by Bob'), [relayA]));
  ({ hash: hash.mipB } = await publishSpec(carol, mip(carol, hash.mipA, 'Bob’s fork, forked by Carol'), [relayB]));
  ({ hash: hash.mipC } = await publishSpec(carol, mip(carol, hash.mir, 'Money, forked by Carol'), [relayB]));
  ({ hash: hash.mipLayer } = await publishSpec(bob, mip(bob, hash.mics, 'A seventh layer'), [relayA]));
  ({ hash: hash.mipLost } = await publishSpec(bob, mip(bob, 'd'.repeat(64), 'Forking what is not here'), [relayA]));
  ({ hash: hash.mipOdd } = await publishSpec(bob, mip(bob, hash.pay2, 'Forking a cMIP'), [relayA]));
  pub.mipRelease = await publishRelease(bob, 'test-money-fork', '0.1', null, [relayA], [[hash.mipA]]);

  // Versions of one text (F322): one text, published with and without field 10.
  const v1 = content([[0, 0], [1, id(alice)], [9, '# cMIP: Test versions\n\nOne text, two ways.']]);
  const v2 = content([[0, 0], [1, id(alice)], [9, '# cMIP: Test versions\n\nOne text, two ways.'], [10, [0]]]);
  ({ hash: hash.v1 } = await publishSpec(alice, v1, [relayA]));
  ({ hash: hash.v2 } = await publishSpec(alice, v2, [relayA]));

  // Two that cannot be verified: a signer whose home is gone before its genesis reached anyone, and content that is no specification.
  gone = TestIdentity.create({ homes: [home3.home] });
  await home3.stop();
  pub.gone = (await publishSpec(gone, content([[0, 0], [1, id(gone)], [9, '# cMIP: Words that must not be shown unverified']]), [relayA])).id;
  await useXtype(gone, hash.notes, 1, [relayA]);
  pub.garbage = (await publishSpec(carol, cborEncode(new Map<number, unknown>([[0, 0], [99, 'what']])), [relayB])).id;

  // Agreements naming extensions. The xtype "Test notes" is named by three deals (one of them in two versions),
  // the checker by one, a cMIP published nowhere by one; a proposal Carol never signed, and a private deal, count for nothing.
  const NOWHERE = 'e'.repeat(64);
  deal.ab = await agree(alice, dealTerms([alice, bob], 'Alice and Bob keep notes.', [hash.notes, hash.checker]), [alice, bob], [relayA]);
  deal.bc = await agree(bob, dealTerms([bob, carol], 'Bob and Carol keep notes.', [hash.notes]), [bob, carol], [relayB]);
  deal.bc2 = await agree(bob, dealTerms([bob, carol], 'Bob and Carol keep notes, again.', [hash.notes], deal.bc), [bob, carol], [relayB], { parent: deal.bc });
  deal.ac = await agree(alice, dealTerms([alice, carol], 'Alice and Carol keep notes elsewhere.', [hash.notes, NOWHERE]), [alice, carol], [relayA]);
  deal.proposal = await agree(alice, dealTerms([alice, carol], 'A proposal Carol never signs.', [hash.checker]), [alice], [relayA]);
  deal.private = await agree(alice, dealTerms([alice, bob], 'A private deal.', [hash.checker, hash.rail]), [alice, bob], [relayA], { private: [alice, bob] });
  hash.nowhere = NOWHERE;

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
  assert.match(readFileSync(page, 'utf8'), /<mor-listing reader="https:\/\/reader\.dubsar\.org\/">/);
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

test('a specification decodes as the core library decodes it (Development draft 10), is named by its hash and by the first line of its text', () => {
  const under = new Uint8Array(32).fill(7);
  const ok = content([[0, 1], [1, new Uint8Array(32)], [5, under], [9, '# Module: A\n\nText.'], [11, 1], [13, [1]]]);
  const s = decodeSpec(ok);
  assert.equal(s.kind, 1);
  assert.deepEqual(s.rail, { kind: 'push', binds: ['purpose'] });
  assert.equal(nameOf(s.text), 'Module: A');
  assert.equal(specHash(ok).length, 64);
  assert.notEqual(specHash(ok), specHash(content([[0, 1], [1, new Uint8Array(32)], [5, under], [9, '# Module: B']])), 'another content, another hash');
  const c = new Uint8Array(32);
  for (const [bad, why] of [
    [[[0, 0], [9, 'x']], /creator, is required/],
    [[[0, 9], [1, c], [9, 'x']], /not a kind/],
    [[[0, 0], [1, c]], /field 9, its text, is required/],
    [[[0, 0], [1, c], [9, 'x'], [10, [3, 2]]], /ascending/],
    [[[0, 0], [1, c], [9, 'x'], [12, false]], /field 12/],
    [[[0, 0], [1, c], [9, 'x'], [14, 1]], /a field the format does not define/],
    [[[0, 1], [1, c], [9, 'x']], /field 5.*required for a Module/],
    [[[0, 0], [1, c], [5, under], [9, 'x']], /field 5 is a Module's/],
    [[[0, 1], [1, c], [5, under], [9, 'x'], [11, 0]], /go together/],
    [[[0, 1], [1, c], [5, under], [9, 'x'], [11, 0], [13, [0]]], /binds payee and purpose/],
    [[[0, 1], [1, c], [5, unhex(PAYMENT_CMIP)], [9, 'x']], /naming the payment cMIP carries fields 11 and 13/],
    [[[0, 8], [1, c], [9, 'x']], /field 8.*required for a MIP/],
    [[[0, 8], [9, 'x'], [8, c]], /creator, is required/],
    [[[0, 4], [1, c], [9, 'x']], /name no creator/],
    [[[0, 6], [1, c], [9, 'x']], /name no creator/],
  ] as [[number, unknown][], RegExp][]) {
    assert.throws(() => decodeSpec(content(bad)), why, JSON.stringify(bad.map(([k]) => k)));
  }
  // A MIR, the MICS document and a test suite have no creator (F291); a MIP has one, and its predecessor (F325).
  for (const k of [4, 6, 7]) assert.equal(decodeSpec(content([[0, k], [9, '# X']])).creator, null);
  const m = decodeSpec(content([[0, 8], [1, c], [8, under], [9, '# MIP: X']]));
  assert.equal(KINDS[m.kind], 'MIP');
  assert.equal(m.predecessor, hex(under));
});

test('the listing reads the relays named, and only those a browser can reach', () => {
  const [a, b, onion] = listing.relays;
  assert.equal(a.address, relayA);
  assert.equal(a.name, 'the first relay');
  assert.ok(a.asked && b.asked);
  assert.equal(a.specs, 13, 'bakes of specifications, each relay its own');
  assert.equal(b.specs, 7);
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
    line.newest.releases.map((r) => [r.id, r.signer, r.name, r.version, r.problem, r.by]),
    [[pub.release, alice.id, 'test-payment', '0.2', null, 'reference']],
    'a release before draft 3: its publication refers to it',
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
  assert.deepEqual(w.role, ['works under the cMIP “cMIP: Test payment, draft 2”', 'a rail Module: a request rail, its proof binding payee, purpose']);
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
  assert.deepEqual(listed(hash.notes2).releases.map((r) => r.signer), [carol.id], 'its own release, by its own spec hash, not its predecessor’s');
});

test('field 12, the discovery field, and the layers an extension declares', () => {
  const w = roleWords(listed(hash.checker), all());
  assert.equal(w.layer, 'Development');
  assert.deepEqual(w.role, [
    'declares, for use as an extension, the layers it acts on beyond Development: Money, Agreements',
    // "proven deliveries": Agreements draft 17's word (rule 11); there is no standing offer since the publication (F407).
    'checks proofs of proven deliveries (field 12)',
  ]);
});

test('code released: a release’s manifest “implements” read first, by spec hash, its publication’s references only where it has none (release manifest cMIP draft 4; Development Q7, taken)', () => {
  assert.deepEqual(
    listed(hash.checker).releases.map((r) => [r.id, r.signer, r.name, r.version, r.problem, r.by]),
    [[pub.checkerRelease, carol.id, 'test-checker', '3.0', null, 'implements']],
  );
  assert.deepEqual(listed(hash.rail).releases, [], 'its publication refers to the rail, but its manifest says what it implements');
  assert.equal(listed(hash.notes).releases[0].by, 'reference');
  // A spec hash with no hint: matched all the same.
  assert.deepEqual(
    listed(hash.notes2).releases.map((r) => [r.id, r.problem, r.by]),
    [[pub.notes2Release, null, 'implements']],
  );
  // Draft 3's field 6, naming publications: shown as not verified, with the reason.
  const [r3] = listed(hash.unclaimed).releases;
  assert.equal(r3.id, pub.draft3Release);
  assert.match(r3.problem!, /names publications in “implements” \(field 6\), as release manifest cMIP draft 3 did/);
});

test('MIPs in a part of their own, by the MIR they fork and how many fork each (website cMIP draft 11, F325; F328, Q10)', () => {
  const m = listing.mips;
  assert.equal(m.count, 6);
  const tree = (f: (typeof m.roots)[number]): unknown => [f.listed.hash, f.direct, f.total, f.forks.map(tree)];
  assert.deepEqual(
    m.roots.map(tree),
    [
      [hash.mics, 1, 1, [[hash.mipLayer, 0, 0, []]]],
      [hash.mir, 2, 3, [[hash.mipA, 1, 1, [[hash.mipB, 0, 0, []]]], [hash.mipC, 0, 0, []]]],
    ],
    'the MIRs and the MICS document by name; most forked first',
  );
  assert.deepEqual(
    m.unrooted.map((u) => [u.hash, u.kind, u.forks.map((f) => f.listed.hash)]),
    [
      [hash.pay2, 0, [hash.mipOdd]],
      ['d'.repeat(64), null, [hash.mipLost]],
    ].sort((a, b) => ((a[0] as string) < (b[0] as string) ? -1 : 1)),
  );
  // A MIP is never a line of drafts; its creator and its code released shown as for any specification.
  assert.ok(!listing.lines.some((l) => l.drafts.some((d) => d.listed.spec.kind === 8)));
  const a = m.roots[1].forks[0].listed;
  assert.equal(a.spec.creator, bob.id);
  assert.equal(a.claimed, true);
  assert.deepEqual(a.releases.map((r) => r.id), [pub.mipRelease]);
  // The MIR and the MICS document: no creator, its publisher shown as such.
  assert.equal(m.roots[1].listed.spec.creator, null);
  assert.equal(KINDS[m.roots[0].listed.spec.kind], 'MICS document');
});

test('versions of one text: two specifications, shown together with the fields in which they differ (F322)', () => {
  assert.deepEqual(
    listing.versions.map((g) => [g.name, g.versions.map((v) => [v.listed.hash, v.differs])]),
    [['cMIP: Test versions', [[hash.v1, [10]], [hash.v2, [10]]].sort((a, b) => ((a[0] as string) < (b[0] as string) ? -1 : 1))]],
  );
  assert.notEqual(hash.v1, hash.v2);
});

test('the use of each xtype: the public acts of its types found, counted by type; private acts are not counted', () => {
  assert.deepEqual(
    listing.xtypes.map((l) => [l.hash, l.use!.acts]),
    [
      [hash.notes, 3],
      [hash.notes2, 1],
    ],
    'most used first; each draft its own specification',
  );
  const notes = listed(hash.notes).use!;
  assert.deepEqual(notes.byType, [
    { type: 0, name: 'note', acts: 2 },
    { type: 1, name: 'answer', acts: 1 },
  ]);
  assert.equal(notes.notValid, 1, 'an act whose signer’s chain cannot be found: not counted');
  assert.equal(listed(hash.pay2).use, null, 'a cMIP filling a task is no xtype');
  assert.equal(listed(hash.checker).use, null);
});

test('F290: only a publication naming the Development MIR as its media spec is a specification', () => {
  assert.ok(![...all().values()].some((l) => l.publications.some((p) => p.id === pub.otherMedia)));
  assert.ok(!listing.unverified.some((p) => p.id === pub.otherMedia), 'not even shown as an unverified specification');
  assert.ok(![...all().values()].some((l) => l.name === 'cMIP: Under another media spec'));
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
  assert.match(x.problem!, /no specification \(Development draft 10, F323\)/);
  assert.equal(listing.lines.length, 9, 'payment (two drafts), rail, notes (two drafts), checker, unclaimed, the MIR, the MICS document, two versions of one text');
});

test('lines of drafts: a fork named, a predecessor not found said', () => {
  const mk = (h: string, pred: string | null, creator = 'c'.repeat(64)): Listed => ({
    hash: h,
    name: h,
    spec: { kind: 0, creator, tasks: [], types: [], dependencies: [], implements: null, rules: 0, fee: false, predecessor: pred, text: h, layers: null, rail: null, checker: false },
    publications: [],
    claimed: true,
    releases: [],
    use: null,
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

test('the extensions agreements name, most named first; versions of one agreement counted once', () => {
  assert.deepEqual(
    listing.extensions.map((x) => [x.hash, x.agreements.length]),
    [
      [hash.notes, 3],
      [hash.checker, 1],
      [hash.nowhere, 1],
    ],
  );
  const notes = listing.extensions[0];
  assert.equal(notes.listed?.name, 'cMIP: Test notes');
  assert.deepEqual(notes.layers, ['Development'], 'an xtype declaring no layer: its work touches Development');
  assert.deepEqual(
    notes.agreements.find((a) => a.agreement === deal.bc)!.terms.sort(),
    [deal.bc, deal.bc2].sort(),
    'a clone is a version of the same agreement: both its public terms, one agreement',
  );
  assert.deepEqual(listing.extensions[1].layers, ['Development', 'Money', 'Agreements'], 'the layers its field 10 declares');
  assert.equal(listing.extensions[2].listed, null);
  assert.equal(listing.extensions[2].layers, null, 'not said where its specification is not found');
});

test('only agreements signed by every party count; private ones are not counted, and said', () => {
  const a = listing.agreements;
  assert.equal(a.counted, 3, 'Alice and Bob, Bob and Carol (two versions, one agreement), Alice and Carol');
  assert.equal(a.terms, 5, 'five public terms, each valid for its signer');
  assert.equal(a.proposed, 1, 'the proposal Carol never signed');
  assert.deepEqual(a.notCounted, []);
  assert.ok(a.private >= 3, `the private terms and their two signatures found, not opened (${a.private})`);
  // The private deal named the checker and the rail Module: neither is counted from it.
  for (const x of listing.extensions) assert.ok(!x.agreements.some((g) => g.terms.includes(deal.private)));
  assert.ok(!listing.extensions.some((x) => x.hash === hash.rail));
  assert.equal(listing.extensions.find((x) => x.hash === hash.checker)!.agreements.length, 1);
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

  // The listing's first purpose: the extensions agreements name, most named first, before the cMIPs and Modules.
  const order = await f.$$eval('section', (els) => els.map((e) => e.id));
  assert.deepEqual(order, ['l-extensions', 'l-xtypes', 'l-mips', 'l-specs']);
  // The MIPs, in a part of their own, by what they fork.
  assert.match((await f.textContent('#l-mips-note'))!, /A MIP is a proposal toward a successor protocol, not a rule of MOR\..*A count of forks is of MIPs published at these relays, not of agreement with them\./);
  const mips = await f.$$eval('#l-mip-roots > li', (els) => els.map((e) => [(e as HTMLElement).dataset.mip, (e.querySelector('[data-total]') as HTMLElement).dataset.total]));
  assert.deepEqual(mips, [
    [hash.mics, '1'],
    [hash.mir, '3'],
  ]);
  assert.equal(await f.$$eval('#l-mips [data-unrooted]', (els) => els.length), 2);
  // The xtypes by use, said plainly that private acts are not counted.
  assert.match((await f.textContent('#l-use'))!, /Private acts are not counted: which specification a private act belongs to cannot be read\./);
  const uses = await f.$$eval('[data-xtype]', (els) => els.map((e) => [(e as HTMLElement).dataset.xtype, (e as HTMLElement).dataset.use, e.textContent ?? '']));
  assert.deepEqual(
    uses.map(([h, n]) => [h, n]),
    [
      [hash.notes, '3'],
      [hash.notes2, '1'],
    ],
  );
  assert.match(uses[0][2]!, /“cMIP: Test notes”.*3 public acts of its types found \(note 2, answer 1\); 1 not valid for its signer, not counted/);
  assert.equal((await f.textContent('#l-mor2'))!.trim(), 'Each extension marks work the core did not foresee: the raw material of MOR 2.');
  assert.match((await f.textContent('#l-counted'))!, /From 3 agreements counted.*Private agreements are not counted: their terms cannot be read \(\d+ private acts found, not opened\)\. 1 public proposal not yet signed by every party, not counted\./);
  const exts = await f.$$eval('[data-extension]', (els) =>
    els.map((e) => ({
      hash: (e as HTMLElement).dataset.extension,
      count: (e as HTMLElement).dataset.count,
      text: e.textContent ?? '',
      links: [...e.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.getAttribute('target')]),
    })),
  );
  assert.deepEqual(
    exts.map((x) => [x.hash, x.count]),
    [
      [hash.notes, '3'],
      [hash.checker, '1'],
      [hash.nowhere, '1'],
    ],
  );
  assert.match(exts[0].text, /“cMIP: Test notes”\s*named by 3 agreements; the work touches Development\./);
  assert.match(exts[1].text, /the work touches Development, Money, Agreements/);
  assert.match(exts[2].text, /a cMIP not found at the relays read\s*named by 1 agreement; which layers the work touches is not said/);
  assert.deepEqual(
    exts[0].links.map(([href]) => href!.split('#')[1]).sort(),
    [deal.ab, deal.bc, deal.bc2, deal.ac].sort(),
    'links to those agreements’ public terms',
  );
  assert.ok(exts.flatMap((x) => x.links).every(([href, target]) => href!.startsWith('https://reader.dubsar.org/#') && target === '_blank'));
  assert.ok(!exts.flatMap((x) => x.links).some(([href]) => href!.includes(deal.private) || href!.includes(deal.proposal)));

  const cards = await f.$$eval('#l-specs .l-line[data-verified="yes"]', (els) =>
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
  assert.equal(cards.length, 9);
  assert.match(card0(cards, hash.mir).text, /No creator: a MIR names none\. Uploaded by/);
  assert.equal(card0(cards, hash.mics).kind, 'MICS document');
  assert.match((await f.textContent('#l-versions'))!, /Versions of one text \(1\)/);
  const card = (h: string) => cards.find((c) => c.spec === h)!;
  const pay = card(hash.pay2);
  assert.equal(pay.name, 'cMIP: Test payment, draft 2');
  assert.equal(pay.kind, 'cMIP');
  assert.equal(pay.layer, 'Money');
  assert.match(pay.role!, /fills task 6, Payment/);
  assert.equal(pay.code, 'released');
  assert.match(pay.text, /released by its creator: “test-payment” 0\.2 \(its bake refers to it\)/);
  assert.match(card(hash.checker).text, /released by its creator: “test-checker” 3\.0 \(its manifest names it among what it implements\)/);
  assert.match(card(hash.notes2).text, /Use: 1 public act of its types found \(note 1\)\./);
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
  assert.equal(card(hash.unclaimed).code, 'unverified', 'a release under draft 3’s “implements”, not verified');
  assert.equal(card(hash.rail).code, 'none', 'a release referring to it, its manifest implementing another, is not its code');

  // The two that could not be verified: shown as such, their words nowhere.
  const bad = await f.$$eval('#l-specs .l-line[data-verified="no"]', (els) => els.map((e) => ({ id: (e as HTMLElement).dataset.pub, text: e.textContent ?? '' })));
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
  assert.match(listed, /3 extensions named by 3 agreements counted, from 5 public terms verified \(1 not yet signed by every party\); private agreements are not counted\. 2 xtypes listed, 4 public acts of their types counted; private acts are not counted\. 6 MIPs listed, under 2 MIRs; 1 text found in versions\. 17 specifications verified, 2 bakes not verified/);
  assert.match(listed, /home1\.dubsar\.org, http:\/\/127\.0\.0\.1:\d+: \d+ acts read, \d+ public terms, \d+ private, not opened, 13 bakes of specifications/);
  assert.match(listed, /home2\.dubsar\.org, http:\/\/127\.0\.0\.1:\d+: \d+ acts read, \d+ public terms, \d+ private, not opened, 7 bakes of specifications/);
  if (shots) await page.screenshot({ path: join(shots, 'listing-phone.png'), fullPage: true });
  assert.deepEqual(elsewhere, [], 'nothing fetched from anywhere but the gateway, the homes and the relays');
  assert.deepEqual(problems, []);
  await ctx.close();
});

function card0<T extends { spec: string }>(cards: T[], h: string): T {
  return cards.find((c) => c.spec === h)!;
}
