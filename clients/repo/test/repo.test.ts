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
import { MIRS, SPECS, Verifier, cborDecode, cborEncode, decodeSpec, checkTerms, hex, describeAct, lockMedia, rebuildChainKey, signaturePayload, unhex, verifyShare } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestIdentity, lookUp } from '../../genesis/src/identity.ts';
import { actsBy } from '../../genesis/src/lines.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { TestCollective, type Governance } from '../src/collective.ts';
import { AGREEMENTS_SPECS, latestPointer, pointerPayload, sign } from '../src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../src/specs.ts';
import {
  checkImplements, findImplemented, resolveImplements,
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
  text: 'The MOR test collective. It publishes releases of the MOR code and nothing else. Its signing key is held by one member; its chain key is split among the members, any two of whom rebuild it. A release counts only when two members have signed it, each with an act of their own. Members change by a clone of this agreement, signed by any two members and by each member who joins, and a rotation of the collective declaring it. The other two members together decide whether a member is absent; the outcome is that member losing their voice.',
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

  // A collective has no signing key: the first member uploaded the release
  // with their own key, naming the collective, and so is its drafter, one of
  // the two the Releases area needs (Agreements rules 58 and 60).
  let v = await verifyRelease(first, [relay.base]);
  assert.equal(v.ok, false, 'one member of two');
  assert.match(v.problems[0], /not a release: any 2 of the Releases area's holders must sign it; 1 did/);
  assert.deepEqual(v.signers, [m[0].id]);

  // The uploader's own signature act adds nobody.
  await signRelease(m[0], first, c.f.relays);
  v = await verifyRelease(first, [relay.base]);
  assert.equal(v.ok, false, 'still one member of two');
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
  // Key 0 signed the genesis (Identity rule 1), key 1 was dealt at founding, key 2 now.
  assert.equal(c.f.safety.index, 2);

  // The first release still stands, under the founding agreement.
  const v1 = await verifyRelease(first, [relay.base]);
  assert.ok(v1.ok, v1.problems.join('; '));
  assert.equal(v1.agreement, c.f.agreements[0]);

  // A collective has no signing key to outlive a change (F100 is moot): the
  // member who left uploads a "release" naming it after the change, with
  // their own key. They are no party of the agreement in force, so they are
  // not counted as its drafter (Agreements rules 58, 60): one current
  // member's signature is one of the two the Releases area needs.
  void old;
  const ghost = new TestCollective(JSON.parse(JSON.stringify({ ...c.f, releases: [] })), c.id.via).by(m3);
  const g = await publishRelease(ghost, { name: 'MOR test tree', version: 'ghost', files: small });
  await signRelease(m1, g.id, c.f.relays);
  const vg = await verifyRelease(g.id, [relay.base]);
  assert.equal(vg.ok, false);
  assert.deepEqual(vg.signers, [m1.id]);
  assert.ok(!vg.signers.includes(m3.id), 'the member who left is counted for nothing');
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
  // An upload naming the collective but citing, on its chain, an act that
  // is no decision of it (here the uploader's own genesis) is on none of its
  // chains (rule 58).
  const cites = c.f.identity.cites;
  c.f.identity.cites = [m1.id];
  const loose = await publishRelease(c, { name: 'MOR test tree', version: 'uncited', files });
  c.f.identity.cites = cites;
  await signRelease(m1, loose.id, c.f.relays);
  await signRelease(m4, loose.id, c.f.relays);
  const vl = await verifyRelease(loose.id, [relay.base]);
  assert.equal(vl.ok, false);
  assert.match(vl.problems[0], /on no chain of the collective.*rule 58/);
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

test('a release names the specifications it implements by their spec hashes, a publication of each as a hint (release manifest cMIP draft 4)', async () => {
  // Two specifications, published as Development's Part three says (F290: the media spec is the Development MIR's).
  const publishSpec = async (by: TestIdentity, words: string, media = MIRS.development, fields: [number, unknown][] = []) => {
    const content = cborEncode(new Map<number, unknown>([[0, 0], [1, unhex(by.id)], [9, words], ...fields]));
    const l = lockMedia(content) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
    const payload = cborEncode(new Map<number, unknown>([[0, unhex(media)], [1, unhex(l.workHash)], [2, unhex(l.lockedHash)], [3, content.length], [4, l.nonce], [5, l.key], [6, [relay.base]]]));
    const made = await by.publish(SPECS.envelopes, 0, payload, { public: true, relays: [relay.base] });
    await relayAt(relay.base).putMedia(l.locked);
    let hash = '';
    try {
      hash = (decodeSpec(content) as { hash: string }).hash;
    } catch {
      // content not in the format: no specification, no spec hash read from it
    }
    return { id: made.id, hash };
  };
  const a = await publishSpec(m[0], '# A test cMIP');
  const b = await publishSpec(m[1], '# Another test cMIP');
  // The same text published by another identity is the same specification
  // only where the content is the same; this one names another creator.
  const a2 = await publishSpec(m[2], '# A test cMIP');
  assert.notEqual(a2.hash, a.hash, 'the creator is in the content');
  // Read first: a specification's publication gives its spec hash; anything else is said.
  const ok = await resolveImplements([a.id, b.id], [relay.base]);
  assert.deepEqual(ok.problems, []);
  assert.deepEqual(ok.entries, [{ spec: a.hash, hint: a.id }, { spec: b.hash, hint: b.id }]);
  const otherMedia = await publishSpec(m[0], '# Under another media spec', 'f'.repeat(64));
  const malformed = await publishSpec(m[0], '# Field 10 out of order', MIRS.development, [[10, [3, 0]]]);
  const notSpec = await checkImplements([second, '00'.repeat(32), otherMedia.id, malformed.id], [relay.base]);
  assert.match(notSpec[0], /not the publication of a specification/);
  assert.match(notSpec[1], /not found/);
  assert.match(notSpec[2], /not the publication of a specification/, 'F290: another media spec is no specification');
  assert.match(notSpec[3], /no specification/, 'F323: content not in the format is no specification');

  const p = await publishRelease(c, { name: 'MOR test tree', version: '4', files: small, implements: [...ok.entries, ok.entries[0]] });
  const want = [{ spec: a.hash, hint: a.id }, { spec: b.hash, hint: b.id }].sort((x, y) => (x.spec < y.spec ? -1 : 1));
  assert.deepEqual(p.manifest.implements, want, 'sorted by spec hash, each once');
  await signRelease(m[0], p.id, c.f.relays);
  await signRelease(m[3], p.id, c.f.relays);
  const v = await verifyRelease(p.id, [relay.base]);
  assert.ok(v.ok, v.problems.join('; '));
  assert.deepEqual(v.manifest!.implements, want, 'read back from the signed manifest');
  // A reader looks each specification up by its hash: at the hint first.
  assert.deepEqual((await findImplemented(v.manifest!.implements!, [relay.base])).map((x) => x.seen), ['found', 'found']);
  // A hint naming another specification's publication is a wrong hint; a spec hash found nowhere, not found.
  const odd = await findImplemented([{ spec: a.hash, hint: b.id }, { spec: 'ab'.repeat(32) }], [relay.base]);
  assert.deepEqual(odd.map((x) => x.seen), ['wrong hint', 'not found']);
  // A release naming nothing has no field 6, as every release before draft 3.
  const v2 = await verifyRelease(second, [relay.base]);
  assert.equal(v2.manifest!.implements, undefined);
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
  // Field 6, implements (draft 3): at least one, sorted, each once, each a hash.
  const withImpl = (x: unknown) => () => {
    const raw = cborDecode(encodeManifest(m0)) as Map<number, unknown>;
    raw.set(6, x);
    return decodeManifest(cborEncode(raw));
  };
  // Field 6 (draft 4): entries [spec, ? hint], sorted by spec hash.
  const [lo, hi, pub] = [new Uint8Array(32).fill(1), new Uint8Array(32).fill(2), new Uint8Array(32).fill(3)];
  assert.deepEqual(withImpl([[lo], [hi, pub]])().implements, [{ spec: hex(lo) }, { spec: hex(hi), hint: hex(pub) }]);
  assert.throws(withImpl([]), /at least one/);
  assert.throws(withImpl([[hi], [lo]]), /sorted by spec hash and unique/);
  assert.throws(withImpl([[lo], [lo, pub]]), /sorted by spec hash and unique/);
  assert.throws(withImpl([[new Uint8Array(31)]]), /implemented specification/);
  assert.throws(withImpl([lo, hi]), /\[spec, \? hint\]/, "draft 3's bare ids are refused by draft 4's closed format");
});

test('a key grammar that one lost holder would freeze is refused (F96)', () => {
  const h = (n: number) => new Uint8Array(32).fill(n);
  const terms = (chainKey: unknown[], extra: [number, unknown][] = []) =>
    cborEncode(
      new Map<number, unknown>([
        [0, [h(1), h(2), h(3)]],
        [1, 'terms'],
        [2, new Map()],
        [4, [0]],
        [5, [1, 2]],
        [7, [[h(1), 333_334], [h(2), 333_333], [h(3), 333_333]]],
        [9, new Map<number, unknown>([[0, [1, 2]], [1, [0]]])],
        [12, new Map<number, unknown>([[1, chainKey]])],
        [19, new Map<number, unknown>([1, 2, 3, 4, 5].map((l) => [l, [1, 1]]))],
        [33, [1, null]],
        ...extra,
      ]),
    );
  checkTerms(terms([1, 2, [h(1), h(2), h(3)]]), AGREEMENTS_SPECS);
  // Rule 59: a collective has no signing key; a key grammar naming one (key 0) is refused.
  const keyed = cborDecode(terms([1, 2, [h(1), h(2), h(3)]])) as Map<number, unknown>;
  keyed.set(12, new Map<number, unknown>([[0, [0, h(1)]], [1, [1, 2, [h(1), h(2), h(3)]]]]));
  assert.throws(() => checkTerms(cborEncode(keyed), AGREEMENTS_SPECS), /^Error: law\/(check|shape):/);
  // Rule 60: a founding naming who acts in only four layers founds nothing.
  const four = cborDecode(terms([1, 2, [h(1), h(2), h(3)]])) as Map<number, unknown>;
  four.set(19, new Map<number, unknown>([1, 2, 3, 4].map((l) => [l, [1, 1]])));
  assert.throws(() => checkTerms(cborEncode(four), AGREEMENTS_SPECS), /^Error: law\/(check|shape):.*layer/);
  // F128: terms field 25 (the relays) is withdrawn; terms carrying it are refused.
  const relays = cborDecode(terms([1, 2, [h(1), h(2), h(3)]])) as Map<number, unknown>;
  relays.set(25, [[null, 'https://relay.test']]);
  assert.throws(() => checkTerms(cborEncode(relays), AGREEMENTS_SPECS), /^Error: law\/check:.*F128/);
  assert.throws(() => checkTerms(terms([1, 3, [h(1), h(2), h(3)]]), AGREEMENTS_SPECS), /^Error: law\/check:.*recovery/);
  assert.throws(() => checkTerms(terms([0, h(1)]), AGREEMENTS_SPECS), /^Error: law\/check:.*F96/);
  // Every member with constitutional power is covered by an abandonment
  // clause able to remove their voice (F105).
  assert.throws(
    () => checkTerms(terms([1, 2, [h(1), h(2), h(3)]], [[9, new Map<number, unknown>([[0, [1, 2]], [1, [1]]])]]), AGREEMENTS_SPECS),
    /^Error: law\/check:.*F105/,
  );
  // Draft 6's listed act types are retired: areas reach acts.
  assert.throws(
    () => checkTerms(terms([1, 2, [h(1), h(2), h(3)]], [[12, new Map<number, unknown>([[1, [1, 2, [h(1), h(2), h(3)]]], [2, []]])]]), AGREEMENTS_SPECS),
    /^Error: law\/(shape|check):/,
  );
});

test("a deal carries no split plan, payees' grants, fees or backups: a publication does (terms fields 8, 14, 28, 29 withdrawn)", () => {
  // Before the redesign a deal listed its payees' grants in field 14 (F129, H4);
  // now the publication names its split service, which receives in its own name,
  // its plan, its fees and its backups (Agreements, "Publication (type 6)").
  const h = (n: number) => new Uint8Array(32).fill(n);
  const deal = (extra: [number, unknown][] = []) =>
    cborEncode(
      new Map<number, unknown>([
        [0, [h(1), h(2)]],
        [1, 'a song'],
        [2, new Map()],
        [4, [0]],
        [5, [0]],
        ...extra,
      ]),
    );
  checkTerms(deal(), AGREEMENTS_SPECS);
  for (const [field, value] of [[8, new Map<number, unknown>([[0, []], [1, h(4)]])], [14, [h(7), h(8)]], [28, [[h(5), 1000]]], [29, new Map<number, unknown>([[0, [h(6)]]])]] as [number, unknown][]) {
    assert.throws(() => checkTerms(deal([[field, value]]), AGREEMENTS_SPECS), /^Error: law\/check:.*withdrawn/, `field ${field}`);
  }
});

test('shares check alone, and fewer than the threshold rebuild nothing', () => {
  const s = c.f.safety.shares.map((x) => Buffer.from(x.share, 'base64'));
  const tampered = new Uint8Array(s[0]);
  tampered[tampered.length - 1] ^= 1;
  assert.throws(() => verifyShare(tampered));
  assert.throws(() => rebuildChainKey([s[0]]), /shares; the dealing needs 2/);
  assert.equal((rebuildChainKey([s[1], s[2]]) as { commit: string }).commit, c.f.safety.commit);
});

test("a deal signed on the phone cites the wallet published from the laptop (F163)", async () => {
  // Ana keeps two devices, two sequences of one identity (Envelopes,
  // "Sequences"). Her laptop publishes her wallet; her phone signs a deal.
  const relays = [relay.base];
  const laptop = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await laptop.publishGenesis();
  const phone = new TestIdentity(JSON.parse(JSON.stringify({ ...laptop.f, sequence: [] })), laptop.via);
  const label = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await label.publishGenesis();
  const wallet = (version: number, previous?: string) =>
    pointerPayload({ payee: laptop.id, version, previous, rails: [[REPO_SPECS.agreements, text(`Ana's wallet ${version}`)]] });
  const v1 = await laptop.publish(MIRS.money, 0, wallet(1), { public: true, relays });
  const v2 = await laptop.publish(MIRS.money, 0, wallet(2, v1.id), { public: true, relays });
  assert.equal(await latestPointer(phone, relays), v2.id, 'the latest, published from the other device');
  const terms = (n: string) => label.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.terms, cborEncode(new Map([[0, n]])), { public: true, relays });
  const holding = (deal: string, acts: Uint8Array[]) => {
    const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
    for (const a of [...laptop.chainActs(), ...label.chainActs(), v1.act, v2.act, ...acts]) v.add(a);
    return v.agreementsPointerHolding(AGREEMENTS_SPECS, deal, laptop.id) as { pointers: string[]; complete: boolean };
  };
  // A signature from the phone citing nothing holds no pointer: its line
  // has none, so the deal's royalties could go only to the vault.
  const bare = await terms('a deal signed bare');
  const uncited = await phone.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, signaturePayload(bare.id), { public: true, relays, objects: [[bare.id, bare.id]] });
  assert.deepEqual(holding(bare.id, [bare.act, uncited.act]).pointers, []);
  // The client's `sign` cites the latest pointer it finds where they are
  // published: the laptop's wallet is reached.
  const deal = await terms('the film deal');
  const signed = await sign(phone, deal.id, relays);
  assert.deepEqual(holding(deal.id, [deal.act, signed.act]).pointers.sort(), [v1.id, v2.id].sort());
  // F272: the pointer is a public act the client held, so its reference names its signer.
  const sd = describeAct(signed.act) as { refs?: string[]; refSigners?: (string | undefined)[] };
  assert.deepEqual(sd.refs, [v2.id]);
  assert.deepEqual(sd.refSigners, [laptop.id]);
  // Signing what cannot pay its signer cites nothing.
  const other = await label.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, signaturePayload(deal.id), { public: true, relays, objects: [[deal.id, deal.id]] });
  const d = describeAct((await sign(phone, other.id, relays)).act) as { refs?: string[] | null };
  assert.ok(!d.refs?.length, 'a signature on a signature pays nobody');
});

// ---------------------------------------------------------------- Identity rule 35 (was 17)

/** An act's standing, as a reader holding every act of the identity at its homes and relays judges it. */
async function standingOf(identity: string, id: string): Promise<string> {
  const l = await lookUp(identity, homes.map((h) => h.base));
  for (const a of await actsBy(identity, [relay.base, ...homes.map((h) => h.base)])) {
    try {
      l.verifier.add(a);
    } catch {
      // not this reader's to open
    }
  }
  return l.verifier.status(id);
}

test('Identity rotation check 4: a collective\'s rotation keeps no tip, and voids nothing a member made for it (Identity rule 35 has nothing to keep for it)', async () => {
  // Before the redesign a collective's other device kept its own line under
  // the collective's signing key, and a rotation had to keep it (rule 35).
  // A collective has no signing key now: each act for it is a member's own,
  // on the member's line, placed on the collective's line by citation
  // (Agreements rule 58); its rotation installs no key and keeps no tip.
  const [m1, m2, m3, m4] = m;
  const col = (await TestCollective.found({ members: [m1, m2, m3, m4], homes: homes.map((h) => h.home), relays: [relay.base], governance, scheme: 3 })).collective;
  const kept = await publishRelease(col.by(m2), { name: 'Released by another member', version: 'kept', files: small });
  await signRelease(m1, kept.id, col.f.relays);
  assert.ok((await verifyRelease(kept.id, [relay.base])).ok, 'the release counts: Ben uploaded it, Ana signed it');
  // No line of the collective's own to keep, and so no warning to pass.
  const { plan } = await col.id.planRotation({ hints: col.f.relays, specs: AGREEMENTS_SPECS });
  assert.equal(plan.warning ?? null, null);
  await col.changeMembers({ members: [m1.id, m2.id, m4.id], proposer: m1, signers: [m1, m2, m4], rebuilders: [m1.id, m2.id], leaving: [m3] });
  assert.equal(await col.settle(), true);
  assert.equal(col.f.identity.signingSecret, '', 'the rotation installed no signing key');
  assert.equal(await standingOf(m2.id, kept.id), 'valid', 'Ben\'s own act, valid on his own chain');
  const v = await verifyRelease(kept.id, [relay.base]);
  assert.ok(v.ok, v.problems.join('; '));
  assert.equal(v.agreement, col.f.agreements[0], 'judged under the agreement its history holds');
});
