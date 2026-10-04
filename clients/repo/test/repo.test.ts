// Roadmap step 5a, "done when", against three homes under three test
// operators and an open relay, run from the relay program of step 4 on
// local ports: a test collective founded under a real founding agreement; a
// release signed under its release rule, published, then fetched and
// verified file by file by a verifier that knows only the release's id and
// one relay; a member joins and another leaves by clone and rotation; the
// next release is signed under the new rules.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cborDecode, cborEncode, checkTerms, describeAct, rebuildSafety, verifyShare } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { TestCollective, type Governance } from '../src/collective.ts';
import { LAW_SPECS } from '../src/law.ts';
import {
  compareWithTree,
  decodeManifest,
  encodeManifest,
  gitFiles,
  publishRelease,
  signRelease,
  verifyRelease,
  type FileIn,
} from '../src/release.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const text = (s: string) => new TextEncoder().encode(s);

let homes: Running[] = [];
let relay: Running;
let m: TestIdentity[] = [];
let c: TestCollective;
let first: string;
let second: string;

const governance: Governance = {
  safetyThreshold: 2,
  releaseThreshold: 2,
  cloneThreshold: 2,
  abandonmentOthers: 2,
  text: 'The MOR test collective. It publishes releases of the MOR code and nothing else. Its everyday key is held by one member; its safety key is split among the members, any two of whom rebuild it. A release counts only when two members have signed it, each with an act of their own. Members change by a clone of this agreement, signed by any two members and by each member who joins, and a rotation of the collective declaring it. The other two members together decide whether a member is absent; the outcome is that member losing their voice.',
};

const small: FileIn[] = [
  { path: 'README.md', bytes: text('# A test tree\n') },
  { path: 'src/lib.rs', bytes: text('pub fn one() -> u8 { 1 }\n') },
  {
    path: 'Cargo.lock',
    bytes: text(
      '# generated\nversion = 4\n\n[[package]]\nname = "sha2"\nversion = "0.10.9"\nsource = "registry+https://github.com/rust-lang/crates.io-index"\nchecksum = "a7507d819769d01a365ab707794a4084392c824f54a7a6a7862f8c3d0892b283"\n\n[[package]]\nname = "mor-core"\nversion = "0.1.0"\n',
    ),
  },
];

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
  for (let i = 0; i < 4; i++) {
    const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
    await t.publishGenesis();
    m.push(t);
  }
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

test('a collective is founded under a founding agreement every member signed', async () => {
  const got = await TestCollective.found({
    members: m.slice(0, 3),
    homes: homes.map((h) => h.home),
    relays: [relay.base, homes[0].base],
    governance,
    scheme: 3,
  });
  c = got.collective;
  assert.equal(got.sent.filter((s) => s.result?.receipt).length, 3, 'each home receipted the genesis');
  assert.equal(got.signed.length, 3);
  assert.deepEqual(c.f.members, m.slice(0, 3).map((x) => x.id));
  // Each member's share checks against the dealing, all the same dealing.
  const fps = c.f.safety.shares.map((s) => (verifyShare(Buffer.from(s.share, 'base64')) as { fingerprint: string }).fingerprint);
  assert.equal(new Set(fps).size, 1);
});

test('a release counts only once two members have signed it', async () => {
  const p = await publishRelease(c, { name: 'MOR test tree', version: '1', files: small, source: 'a test' });
  first = p.id;
  assert.equal(p.uploaded, 3);
  assert.deepEqual(p.manifest.dependencies, [
    {
      registry: 'crates.io',
      name: 'sha2',
      version: '0.10.9',
      checksum: 'a7507d819769d01a365ab707794a4084392c824f54a7a6a7862f8c3d0892b283',
    },
  ]);

  let v = await verifyRelease(first, [relay.base]);
  assert.equal(v.ok, false);
  assert.match(v.problems[0], /not a release: any 2 of the Releases area's holders must sign it; 0 did/);

  await signRelease(m[0], first, c.f.relays);
  v = await verifyRelease(first, [relay.base]);
  assert.equal(v.ok, false, 'one signature of two');
  assert.deepEqual(v.signers, [m[0].id]);

  // Someone outside the collective signing never counts.
  await signRelease(m[3], first, c.f.relays);
  assert.equal((await verifyRelease(first, [relay.base])).ok, false);

  await signRelease(m[1], first, c.f.relays);
  const out = mkdtempSync(join(tmpdir(), 'mor-repo-out-'));
  v = await verifyRelease(first, [relay.base], { out, collective: c.identity });
  assert.deepEqual(v.problems, []);
  assert.equal(v.ok, true);
  assert.deepEqual(v.signers, [m[0].id, m[1].id]);
  assert.equal(v.agreement, c.f.agreement);
  assert.equal(v.checked, 3);
  for (const f of small) assert.deepEqual(new Uint8Array(readFileSync(join(out, f.path))), f.bytes);

  // A release by another identity is not this collective's.
  const other = await verifyRelease(first, [relay.base], { collective: m[0].id });
  assert.equal(other.ok, false);
});

test('a checkout that differs from the release shows where', async () => {
  const v = await verifyRelease(first, [homes[0].base]);
  assert.ok(v.ok, v.problems.join('; '));
  const out = mkdtempSync(join(tmpdir(), 'mor-repo-out-'));
  await verifyRelease(first, [relay.base], { out });
  assert.deepEqual(compareWithTree(v.manifest!, out), { same: 3, differ: [], missing: [] });
  writeFileSync(join(out, 'src/lib.rs'), 'pub fn one() -> u8 { 0 }\n');
  assert.deepEqual(compareWithTree(v.manifest!, out), { same: 2, differ: ['src/lib.rs'], missing: [] });
  const empty = mkdtempSync(join(tmpdir(), 'mor-repo-empty-'));
  assert.equal(compareWithTree(v.manifest!, empty).missing.length, 3);
});

test('a member leaves alone and another joins, by record, clone and rotation', async () => {
  const [m1, m2, m3, m4] = m;
  const old = JSON.parse(JSON.stringify(c.f.identity));
  const got = await c.changeMembers({
    members: [m1.id, m2.id, m4.id],
    proposer: m1,
    signers: [m1, m2, m4],
    rebuilders: [m1.id, m2.id],
    leaving: [m3],
  });
  assert.equal(got.resigned.length, 1, 'the member who leaves resigns alone');
  assert.ok(got.record, 'the collective registers the resignation at once, its line');
  assert.equal(got.sent.filter((s) => s.result?.receipt).length, 3);
  assert.equal(await c.settle(), true, 'the rotation counts');
  assert.deepEqual(c.f.members, [m1.id, m2.id, m4.id]);
  assert.equal(c.f.agreements.length, 2);
  // The leaving member holds no share of the next key.
  assert.ok(!c.f.safety.shares.some((s) => s.holder === m3.id));
  assert.equal(c.f.safety.index, 1);

  // The first release still stands, under the founding agreement.
  const v1 = await verifyRelease(first, [relay.base]);
  assert.ok(v1.ok, v1.problems.join('; '));
  assert.equal(v1.agreement, c.f.agreements[0]);

  // The old everyday key signs a "release" after the rotation: void (F100).
  const ghost = new TestCollective({ ...c.f, identity: old, releases: [] });
  const g = await publishRelease(ghost, { name: 'MOR test tree', version: 'ghost', files: small });
  await signRelease(m1, g.id, c.f.relays);
  await signRelease(m3, g.id, c.f.relays);
  const vg = await verifyRelease(g.id, [relay.base]);
  assert.equal(vg.ok, false);
  assert.match(vg.problems[0], /void/);
});

test('the next release is signed under the new rules', async () => {
  const [m1, , m3, m4] = m;
  const files = small.map((f) => (f.path === 'src/lib.rs' ? { ...f, bytes: text('pub fn one() -> u8 { 2 - 1 }\n') } : f));
  const p = await publishRelease(c, { name: 'MOR test tree', version: '2', files });
  second = p.id;
  assert.equal(p.uploaded, 1, 'only the changed file is new; the rest are the same objects');
  assert.equal(p.manifest.previous, first);

  await signRelease(m1, second, c.f.relays);
  await signRelease(m3, second, c.f.relays);
  let v = await verifyRelease(second, [relay.base]);
  assert.equal(v.ok, false, 'the member who left no longer counts');
  assert.deepEqual(v.signers, [m1.id]);
  assert.equal(v.agreement, c.f.agreement);

  await signRelease(m4, second, c.f.relays);
  v = await verifyRelease(second, [relay.base]);
  assert.ok(v.ok, v.problems.join('; '));
  assert.deepEqual(v.signers, [m1.id, m4.id]);

  // F127: the release is an action of the collective: it cites, on the
  // collective's chain, the decision it acts under, the rotation that
  // changed its members; and a release citing nothing counts for nothing.
  const act = await relayAt(relay.base).getAct(second);
  const objects = (describeAct(act!) as { objects?: [string, string][] }).objects ?? [];
  assert.deepEqual(objects, [[c.identity, c.f.identity.binding]]);
  const cites = c.f.identity.cites;
  c.f.identity.cites = undefined;
  const loose = await publishRelease(c, { name: 'MOR test tree', version: 'uncited', files });
  c.f.identity.cites = cites;
  await signRelease(m1, loose.id, c.f.relays);
  await signRelease(m4, loose.id, c.f.relays);
  const vl = await verifyRelease(loose.id, [relay.base]);
  assert.equal(vl.ok, false);
  assert.match(vl.problems[0], /F127/);
});

test('an ordinary change is recorded at once, without a rotation', async () => {
  const [m1, , , m4] = m;
  const before = c.f.agreement;
  const position = c.f.identity.position;
  const got = await c.changeReleaseWords({ words: 'Releases are signed after a fresh checkout.', proposer: m1, signers: [m1, m4] });
  assert.equal(c.f.identity.position, position, 'no rotation');
  assert.equal(c.f.agreement, got.clone);
  assert.notEqual(got.clone, before);
  // A release made after the record is judged under the recorded clone.
  const p = await publishRelease(c, { name: 'MOR test tree', version: '3', files: small });
  await signRelease(m1, p.id, c.f.relays);
  await signRelease(m4, p.id, c.f.relays);
  const v = await verifyRelease(p.id, [relay.base]);
  assert.ok(v.ok, v.problems.join('; '));
  assert.equal(v.agreement, got.clone);
  // The second release, made before the record, still stands under the clone before.
  const v2 = await verifyRelease(second, [relay.base]);
  assert.ok(v2.ok, v2.problems.join('; '));
  assert.equal(v2.agreement, before);
});

test('the MOR repository itself, published and verified file by file', async () => {
  const files = gitFiles(root);
  const p = await publishRelease(c, { name: 'MOR', version: 'test', files, source: 'this checkout' });
  await signRelease(m[1], p.id, c.f.relays);
  await signRelease(m[3], p.id, c.f.relays);
  const out = mkdtempSync(join(tmpdir(), 'mor-repo-self-'));
  const v = await verifyRelease(p.id, [relay.base], { out });
  assert.ok(v.ok, v.problems.join('; '));
  assert.equal(v.checked, files.length);
  assert.ok(v.manifest!.dependencies.some((d) => d.registry === 'crates.io' && d.name === 'fips205'));
  assert.ok(v.manifest!.dependencies.some((d) => d.registry === 'npm' && d.name === '@noble/post-quantum'));
  assert.deepEqual(compareWithTree(v.manifest!, root).differ, []);
});

test('manifests are strict', () => {
  const m0 = decodeManifest(encodeManifest({
    name: 'x',
    version: '1',
    previous: null,
    files: [{ path: 'a', work: '00'.repeat(32), size: 0, locked: '11'.repeat(32), nonce: new Uint8Array(24), key: new Uint8Array(32) }],
    dependencies: [],
  }));
  const bad = (f: Partial<(typeof m0.files)[0]>[]) => () =>
    decodeManifest(encodeManifest({ ...m0, files: f.map((x) => ({ ...m0.files[0], ...x })) }));
  assert.throws(bad([{ path: '../etc/passwd' }]), /valid path/);
  assert.throws(bad([{ path: 'a//b' }]), /valid path/);
  assert.throws(bad([{ path: '/abs' }]), /valid path/);
  assert.throws(bad([{ path: 'b' }, { path: 'a' }]), /sorted/);
  assert.throws(bad([{ path: 'a' }, { path: 'a' }]), /sorted/);
  assert.throws(bad([]), /no files/);
  assert.throws(() => decodeManifest(cborEncode(new Map<number, unknown>([[9, 1]]))), /unknown field/);
});

test('a key grammar that one lost holder would freeze is refused (F96)', () => {
  const h = (n: number) => new Uint8Array(32).fill(n);
  const terms = (safety: unknown[], extra: [number, unknown][] = []) =>
    cborEncode(
      new Map<number, unknown>([
        [0, [h(1), h(2), h(3)]],
        [1, 'terms'],
        [2, new Map()],
        [4, [0]],
        [5, [1, 2]],
        [9, new Map<number, unknown>([[0, [1, 2]], [1, [0]]])],
        [12, new Map<number, unknown>([[0, [0, h(1)]], [1, safety]])],
        [25, [[null, 'https://relay.test']]],
        ...extra,
      ]),
    );
  checkTerms(terms([1, 2, [h(1), h(2), h(3)]]), LAW_SPECS);
  // F126: a collective's terms name its relays.
  const none = cborDecode(terms([1, 2, [h(1), h(2), h(3)]])) as Map<number, unknown>;
  none.delete(25);
  assert.throws(() => checkTerms(cborEncode(none), LAW_SPECS), /^Error: law\/check:.*F126/);
  assert.throws(() => checkTerms(terms([1, 3, [h(1), h(2), h(3)]]), LAW_SPECS), /^Error: law\/check:.*recovery/);
  assert.throws(() => checkTerms(terms([0, h(1)]), LAW_SPECS), /^Error: law\/check:.*F96/);
  // Every member with constitutional power is covered by an abandonment
  // clause able to remove their voice (F105).
  assert.throws(
    () => checkTerms(terms([1, 2, [h(1), h(2), h(3)]], [[9, new Map<number, unknown>([[0, [1, 2]], [1, [1]]])]]), LAW_SPECS),
    /^Error: law\/check:.*F105/,
  );
  // Draft 6's listed act types are retired: areas reach acts.
  assert.throws(
    () => checkTerms(terms([1, 2, [h(1), h(2), h(3)]], [[12, new Map<number, unknown>([[0, [0, h(1)]], [1, [1, 2, [h(1), h(2), h(3)]]], [2, []]])]]), LAW_SPECS),
    /^Error: law\/shape:/,
  );
});

test('shares check alone, and fewer than the threshold rebuild nothing', () => {
  const s = c.f.safety.shares.map((x) => Buffer.from(x.share, 'base64'));
  const tampered = new Uint8Array(s[0]);
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => verifyShare(tampered));
  assert.throws(() => rebuildSafety([s[0]]), /shares; the dealing needs 2/);
  assert.equal((rebuildSafety([s[1], s[2]]) as { commit: string }).commit, c.f.safety.commit);
});
