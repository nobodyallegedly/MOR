// Releases of code under one's own name, moved from Edubba (F339), with every
// check Edubba made kept (H16): a folder chosen at each release, every file
// with its size and fingerprint before anything is signed, the release
// before it pre-set by name, a file changed after the review refused, and
// "check it as anyone would". And their Bitcoin anchoring, an option:
// prepared here as a draft sealed to oneself, paid in Damgar, anchored by
// the test service, checked here against the chain followed.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAll, damgar, developer, folder, refused, start, type Relay } from './world.ts';
import { FakeChain, addressScript } from '../../damgar/test/chain.ts';
import { StubLnd } from '../../damgar/test/node.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import { ACCEPTABLE } from '../../damgar/src/specs.ts';
import { workHash } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { verifyRelease } from '../../repo/src/release.ts';
import type { PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
import type { Done, Review } from '../src/shapes.ts';
import type { AnchorShown } from '../src/anchor.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

type Check = { ok: boolean; checked: number; files: number; problems: string[] };

test('a release from a plain folder and from a git folder: every file listed, nothing signed by the review, checked as anyone would', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const d = await developer(H, R);
  const c = d.ummia.c;

  const plain = folder();
  const s = await c.ask<{ name: string; previous: string | null; how: string }>('release suggest', { folder: plain });
  assert.deepEqual([s.name, s.previous, s.how], ['testrelease', null, 'plain']);
  const rv = await c.ask<Review>('release prepare', { folder: plain, name: s.name, version: '1.0', previous: '' });
  assert.deepEqual(rv.blocking, []);
  assert.deepEqual(rv.files!.map((f) => f.path), ['README.md', 'src/main.ts'], 'every file but hidden ones');
  for (const f of rv.files!) assert.match(f.fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(rv.files!.find((f) => f.path === 'README.md')!.size, 17);
  assert.ok(rv.sections.some((x) => x.heading === 'The release before it' && /starts a new release line/.test(x.lines[0].text)));
  assert.equal((await c.ask<{ releases: unknown[] }>('releases')).releases.length, 0, 'nothing signed by the review');
  await refused(c.ask('release confirm', { plan: rv.plan, digest: 'f'.repeat(64) }), /not the review’s/);
  const done = await c.ask<Done>('release confirm', { plan: rv.plan, digest: rv.digest });
  const id = done.acts[0];
  await refused(c.ask('release confirm', { plan: rv.plan, digest: rv.digest }), /no longer good/);

  // Checked as anyone would: by its id, from the relays alone, every file fetched.
  const ck = await c.ask<Check>('release check', { id });
  assert.equal(ck.ok, true, JSON.stringify(ck.problems));
  assert.equal(ck.checked, 2);

  // The next release of the same name: the one before it pre-set; a version already released blocked; a file changed after the review refused.
  appendFileSync(join(plain, 'README.md'), 'More.\n');
  const s2 = await c.ask<{ previous: string | null }>('release suggest', { folder: plain });
  assert.equal(s2.previous, id);
  const again = await c.ask<Review>('release prepare', { folder: plain, name: 'testrelease', version: '1.0', previous: id });
  assert.ok(again.blocking.some((b) => /already released/.test(b)));
  const rv2 = await c.ask<Review>('release prepare', { folder: plain, name: 'testrelease', version: '1.1', previous: id });
  assert.ok(rv2.sections.some((x) => x.heading === 'The release before it' && x.lines[0].text.includes(id)));
  appendFileSync(join(plain, 'src/main.ts'), '// changed after the review\n');
  await refused(c.ask('release confirm', { plan: rv2.plan, digest: rv2.digest }), /changed since the review/);

  // A git folder: what git tracks, its commit.
  const git = folder({ git: true, files: { 'a.txt': 'tracked\n', 'b/c.txt': 'tracked too\n' } });
  appendFileSync(join(git, 'untracked.txt'), 'not tracked\n');
  const g = await c.ask<Review>('release prepare', { folder: git, name: 'gitrelease', version: '0.1', previous: '' });
  assert.deepEqual(g.files!.map((f) => f.path), ['a.txt', 'b/c.txt']);
  assert.ok(g.sections.some((x) => /what git tracks|git folder/.test(x.lines[0]?.text ?? '')));
  const gd = await c.ask<Done>('release confirm', { plan: g.plan, digest: g.digest });
  assert.equal((await c.ask<Check>('release check', { id: gd.acts[0] })).ok, true);

  // A release naming a specification it implements, by spec hash, read and decoded first.
  const sp = await c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Implemented, draft 1\n\nFor a release.' });
  const spd = await c.ask<Done>('confirm', { plan: sp.plan, digest: sp.digest });
  const im = await c.ask<Review>('release prepare', { folder: git, name: 'gitrelease', version: '0.2', previous: gd.acts[0], implements: [spd.acts[0]] });
  assert.deepEqual(im.blocking, []);
  assert.ok(im.sections.some((x) => x.heading === 'The specifications it implements' && x.lines[0].text.startsWith(sp.hash!)));
  const nope = await c.ask<Review>('release prepare', { folder: git, name: 'gitrelease', version: '0.3', previous: gd.acts[0], implements: [gd.acts[0]] });
  assert.ok(nope.blocking.some((b) => /not the publication of a specification/.test(b)), JSON.stringify(nope.blocking));
});

test('a release anchored on Bitcoin, as an option: asked in Ummia, paid in Damgar, anchored by the service, checked in Ummia', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  chain.mine(10);
  const lnd = new StubLnd(chain, addressScript);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'ummia-svc-')), 'svc'), lnd, chain, { homes: H, relays: R });
  await svc.start();
  const d = await developer(H, R, { chain });
  const c = d.ummia.c;
  const g = await damgar(chain);
  await g.c.ask('bring', { id: d.id, words: d.dub.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });

  const f = folder();
  const rv = await c.ask<Review>('release prepare', { folder: f, name: 'anchored', version: '1.0', previous: '' });
  const rel = (await c.ask<Done>('release confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  const offers = await c.ask<{ act: string; tiers: { blocks: number }[] }[]>('anchor offers', { service: svc.id });
  assert.equal(offers.length, 1);
  await refused(c.ask('anchor ask', { release: 'a'.repeat(64), service: svc.id, offer: offers[0].act, tier: 1 }), /neither one of your releases nor a public act found/);
  await c.ask('anchor ask', { release: rel, service: svc.id, offer: offers[0].act, tier: 1 });
  let shown = (await c.ask<{ anchors: AnchorShown[] }>('releases')).anchors;
  assert.equal(shown[0].state, 'asked');

  // Damgar: the draft, prepared in Ummia, read and signed there; Ummia signed no money act.
  await g.c.ask('look');
  const dr = (await g.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!;
  assert.equal(dr.app, 'Ummia');
  assert.ok(dr.lines.some((l) => /a random secret Ummia keeps/.test(l.text)), JSON.stringify(dr.lines));
  await g.c.ask('sign draft', { id: dr.id });
  await svc.tick();
  await g.c.ask('look');
  const p = (await g.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  await g.c.ask('paid', { key: p.key, proof: lnd.pay(p.pay!.invoice!) });
  const said = await svc.tick();
  assert.ok(said.some((l) => /Batch 1 anchored/.test(l)), said.join('\n'));
  shown = (await c.ask<{ anchors: AnchorShown[] }>('releases')).anchors;
  assert.equal(shown[0].state, 'pending', JSON.stringify(shown));
  chain.mine(6);
  shown = (await c.ask<{ anchors: AnchorShown[] }>('releases')).anchors;
  assert.equal(shown[0].state, 'anchored', JSON.stringify(shown));
  assert.match(shown[0].lines.at(-1)!.text, /Anchored at block \d+/);
});

test('Edubba’s release checks, carried over whole (H16): the folder chosen at each release; every file with its size and fingerprint, and its libraries, before anything is signed', async () => {
  const d = await developer(homes.map((h) => h.base), [relay.base]);
  const c = d.ummia.c;
  const me = d.id;
  const actsBy = async (id: string) => (await relayAt(relay.base).feed({ signer: id })).items.length;
  const top = mkdtempSync(join(tmpdir(), 'edubba-release-'));

  // A plain folder: every file but hidden ones.
  const plain = join(top, 'site');
  mkdirSync(join(plain, 'pages'), { recursive: true });
  mkdirSync(join(plain, '.cache'));
  writeFileSync(join(plain, 'index.html'), '<h1>Hello</h1>\n');
  writeFileSync(join(plain, 'pages', 'about.html'), '<p>About</p>\n');
  writeFileSync(join(plain, '.env'), 'SECRET=never\n');
  writeFileSync(join(plain, '.cache', 'x'), 'hidden\n');
  writeFileSync(join(plain, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': { name: 'site' }, 'node_modules/left-pad': { version: '1.3.0', integrity: 'sha512-test' } } }));
  const sug = await c.ask<any>('release suggest', { folder: plain });
  assert.deepEqual([sug.how, sug.name, sug.previous], ['plain', 'site', null]);
  await refused(c.ask('release suggest', { folder: 'relative/path' }), /whole path/);
  await refused(c.ask('release suggest', { folder: join(top, 'nothing') }), /no folder/);
  const before = await actsBy(me);
  const r = await c.ask<any>('release prepare', { folder: plain, name: 'site', version: '1.0', previous: '' });
  assert.deepEqual(r.files.map((f: any) => f.path), ['index.html', 'package-lock.json', 'pages/about.html'], 'no hidden file, nothing in a hidden folder');
  const idx = r.files[0];
  assert.equal(idx.size, 15);
  assert.equal(idx.fingerprint, workHash(new TextEncoder().encode('<h1>Hello</h1>\n')));
  assert.deepEqual(r.dependencies, [{ registry: 'npm', name: 'left-pad', version: '1.3.0' }]);
  assert.deepEqual(r.blocking, []);
  assert.match(JSON.stringify(r.sections), /a plain folder: every file in it, except hidden ones/);
  assert.match(JSON.stringify(r.sections), /starts a new release line/);
  assert.match(r.summary[0], /3 files listed below, each with its size and fingerprint.*1 library it depends on/);
  assert.equal(await actsBy(me), before, 'nothing signed by the review');
  await refused(c.ask('release confirm', { plan: r.plan, digest: '00'.repeat(32) }), /not the review’s.*Nothing was signed/);
  // A file changed after the review: refused, nothing signed.
  writeFileSync(join(plain, 'index.html'), '<h1>Changed</h1>\n');
  await refused(c.ask('release confirm', { plan: r.plan, digest: r.digest }), /changed since the review.*Nothing was signed/);
  assert.equal(await actsBy(me), before);
  await refused(c.ask('release confirm', { plan: r.plan, digest: r.digest }), /no longer good/);
  const r1 = await c.ask<any>('release prepare', { folder: plain, name: 'site', version: '1.0', previous: '' });
  const d1 = await c.ask<Done>('release confirm', { plan: r1.plan, digest: r1.digest });
  const v1 = await verifyRelease(d1.acts[0], [relay.base]);
  assert.ok(v1.ok, JSON.stringify(v1.problems));
  assert.equal(v1.manifest!.files.length, 3);
  assert.equal(v1.manifest!.previous, null);

  // A git folder: the files git tracks, as they are on disk.
  const repo = join(top, 'library');
  mkdirSync(repo);
  const git = (...a: string[]) => execFileSync('git', a, { cwd: repo, stdio: 'ignore' });
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Test');
  writeFileSync(join(repo, 'lib.ts'), 'export const x = 1;\n');
  writeFileSync(join(repo, '.gitignore'), 'build/\n');
  writeFileSync(join(repo, 'untracked.txt'), 'not tracked\n');
  git('add', 'lib.ts', '.gitignore');
  git('commit', '-qm', 'one');
  const sg = await c.ask<any>('release suggest', { folder: repo });
  assert.deepEqual([sg.how, sg.name, sg.previous], ['git', 'library', null], 'another name: a new line by default');
  const g = await c.ask<any>('release prepare', { folder: repo, name: 'library', version: '0.1', previous: '' });
  assert.deepEqual(g.files.map((f: any) => f.path), ['.gitignore', 'lib.ts'], 'what git tracks, a hidden tracked file included, nothing untracked');
  assert.deepEqual(g.dependencies, []);
  assert.match(JSON.stringify(g.sections), /in a git folder: every file git tracks there/);
  assert.match(JSON.stringify(g.sections), /Made from git [0-9a-f]{40}/);
  await c.ask('cancel', { plan: g.plan });
  await refused(c.ask('release confirm', { plan: g.plan, digest: g.digest }), /no longer good/);

  // The plain folder again: the release before it pre-set by name, chosen by hand.
  const again = await c.ask<any>('release suggest', { folder: plain });
  assert.equal(again.previous, d1.acts[0], 'pre-set to the last release of the same name');
  await refused(c.ask('release prepare', { folder: plain, name: 'site', version: '2.0', previous: 'f'.repeat(64) }), /not one of this identity’s releases/);
  const same = await c.ask<any>('release prepare', { folder: plain, name: 'site', version: '1.0', previous: d1.acts[0] });
  assert.ok(same.blocking.some((b: string) => /already released/.test(b)));
  writeFileSync(join(plain, 'pages', 'contact.html'), '<p>Write</p>\n');
  const r2 = await c.ask<any>('release prepare', { folder: plain, name: 'site', version: '2.0', previous: d1.acts[0] });
  assert.match(JSON.stringify(r2.sections), /It follows site 1\.0/);
  assert.match(JSON.stringify(r2.sections), /Since site 1\.0: 1 file added, 0 changed, 0 removed; 3 files the same/);
  assert.match(r2.summary[0], /1 file is new since the release before it/);
  const d2 = await c.ask<Done>('release confirm', { plan: r2.plan, digest: r2.digest });
  const v2 = await verifyRelease(d2.acts[0], [relay.base]);
  assert.ok(v2.ok, JSON.stringify(v2.problems));
  assert.equal(v2.manifest!.previous, d1.acts[0]);
  const held = await c.ask<any>('releases');
  assert.deepEqual(held.releases.map((x: any) => [x.name, x.version]), [['site', '2.0'], ['site', '1.0']]);
});

test('a release line begun elsewhere (in Edubba, before F339) goes on in Ummia: found on the relays, offered as the release before', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const d = await developer(H, R);
  const c = d.ummia.c;
  // Another app holding the identity (Dub's file stands in for Edubba's) published release 1.0 of "elsewhere".
  const { TestIdentity } = await import('../../genesis/src/identity.ts');
  const { prepareRelease, publishPrepared } = await import('../../repo/src/release.ts');
  const other = TestIdentity.load(join(d.dub.dir, 'identities', d.id, 'identity.json'));
  const f = folder({ files: { 'a.txt': 'one\n' } });
  const p = { id: other, relays: R, releases: [] as { id: string; version: string; manifest: string }[] };
  const first = await publishPrepared(p, prepareRelease(p, { name: 'elsewhere', version: '1.0', files: [{ path: 'a.txt', bytes: new TextEncoder().encode('one\n') }] }));
  const listed = await c.ask<{ releases: { id: string; folder: string }[] }>('releases');
  assert.deepEqual(listed.releases.map((x) => [x.id, x.folder]), [[first.id, '(found on the relays: made elsewhere)']]);
  writeFileSync(join(f, 'a.txt'), 'two\n');
  const rv = await c.ask<Review>('release prepare', { folder: f, name: 'elsewhere', version: '1.1', previous: first.id });
  assert.ok(rv.sections.some((x) => x.heading === 'The release before it' && x.lines[0].text.includes(first.id)));
  const next = (await c.ask<Done>('release confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  const v = await verifyRelease(next, R);
  assert.ok(v.ok, JSON.stringify(v.problems));
  assert.equal(v.manifest!.previous, first.id);
});
