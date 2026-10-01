// Websites on MOR (website cMIP, draft 1), in Node: the manifest's rules,
// publishing, what counts as a version, the gateway's server, and the
// command line (verify with no gateway; check a gateway from elsewhere).
// Real homes and a relay on local ports; the browser is browser.test.ts.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { cborEncode, checkText, randomBytes } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { withdraw } from '../../barebone/src/post.ts';
import { parse, title } from '../../longform/src/format.ts';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { TestCollective } from '../../repo/src/collective.ts';
import { Gateway } from '../src/gateway.ts';
import { addressOf, decodeSite, encodeSite, kindOf, pathFor, resolveRef, type SiteManifest } from '../src/manifest.ts';
import { checkFiles, publishSite, readFolder, type FileIn } from '../src/publish.ts';
import { parseGatewaySettings, parseSiteSettings } from '../src/settings.ts';
import { fetchFile, openVersion } from '../src/verify.ts';
import { phone, siteCopy, world, type World } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const run = promisify(execFile);
const utf8 = (s: string) => new TextEncoder().encode(s);
const page = (body: string) => utf8(`<!doctype html><title>t</title>${body}`);

let w: World;

before(async () => {
  await run('node', ['--import', 'tsx', 'scripts/build.ts'], { cwd: here });
  w = await world();
});

after(async () => {
  await w?.stop();
});

const settingsFor = (version: string, identity = w.owner.id) =>
  parseSiteSettings({ version, identity, name: 'Nobody, allegedly', relays: [w.relay.base] });

test('paths: lower-case, four kinds, addresses both ways', () => {
  for (const p of ['index.html', 'a/b-c_d.e.css', 'earth.jpg', 'notes.txt']) assert.ok(kindOf(p), p);
  for (const p of ['Index.html', 'a.js', 'a.png', '.hidden.html', 'a//b.html', 'a/../b.html', 'é.html', 'a b.html', 'html', '/a.html', 'a/']) {
    assert.equal(kindOf(p), null, p);
  }
  assert.equal(kindOf(`${'a'.repeat(101)}.txt`), null, 'a segment of at most 100 characters');
  assert.equal(pathFor('/'), 'index.html');
  assert.equal(pathFor('/run.html'), 'run.html');
  assert.equal(pathFor('/docs/'), 'docs/index.html');
  assert.equal(pathFor('/run'), null);
  assert.equal(pathFor('/%72un.html'), null, 'nothing is decoded');
  assert.equal(addressOf('index.html'), '/');
  assert.equal(addressOf('docs/index.html'), '/docs/');
  assert.equal(addressOf('run.html'), '/run.html');
  assert.equal(resolveRef('docs/a.html', '../run.html'), 'run.html');
  assert.equal(resolveRef('docs/a.html', 'b.html#x'), 'docs/b.html');
  assert.equal(resolveRef('docs/a.html', './'), 'docs/index.html');
  assert.equal(resolveRef('read.html', './'), 'index.html');
  assert.equal(resolveRef('read.html', '/use.html'), 'use.html');
  assert.equal(resolveRef('read.html', '../../x.html'), null, 'never above the site');
  assert.equal(resolveRef('read.html', 'https://example.org/'), null);
  assert.equal(resolveRef('read.html', '//example.org/a.html'), null);
});

test('the manifest is strict: closed, sorted, unique, with a front page', () => {
  const f = (path: string) => ({ path, work: '11'.repeat(32), size: 1, locked: '22'.repeat(32), nonce: randomBytes(24), key: randomBytes(32) });
  const m: SiteManifest = { name: 'dubsar.org', previous: null, files: [f('index.html'), f('run.html')] };
  assert.deepEqual(decodeSite(encodeSite(m)).files.map((x) => x.path), ['index.html', 'run.html']);
  assert.throws(() => decodeSite(encodeSite({ ...m, files: [f('run.html'), f('index.html')] })), /sorted/);
  assert.throws(() => decodeSite(encodeSite({ ...m, files: [f('index.html'), f('index.html')] })), /sorted and unique/);
  assert.throws(() => decodeSite(encodeSite({ ...m, files: [f('run.html')] })), /front page/);
  assert.throws(() => decodeSite(encodeSite({ ...m, files: [f('index.html'), f('x.js')] })), /not a valid path/);
  assert.throws(() => decodeSite(encodeSite({ ...m, name: 'a\u0000b' })), /canonical/);
  const extra = cborEncode(new Map<number, unknown>([[0, 'x'], [1, null], [2, []], [3, 1]]));
  assert.throws(() => decodeSite(extra), /unknown field 3/);
  const short = encodeSite({ ...m, files: [{ ...f('index.html'), nonce: randomBytes(12) }] });
  assert.throws(() => decodeSite(short), /nonce/);
});

test('files the cMIP refuses are refused before anything is published, every reason at once', () => {
  const files: FileIn[] = [
    { path: 'About.html', bytes: page('x') },
    { path: 'app.js', bytes: utf8('alert(1)') },
    { path: 'photo.jpg', bytes: phone },
    { path: 'broken.html', bytes: new Uint8Array([0x3c, 0xff, 0xfe]) },
  ];
  assert.throws(
    () => checkFiles(files),
    (e: Error) =>
      /About\.html: not a path/.test(e.message) &&
      /app\.js: not a path/.test(e.message) &&
      /photo\.jpg: carries more than the picture/.test(e.message) &&
      /broken\.html: not UTF-8/.test(e.message) &&
      /no front page/.test(e.message),
  );
  checkFiles([{ path: 'index.html', bytes: page('ok') }, { path: 'photo.jpg', bytes: strip(phone).bytes }]);
});

test('the dubsar.org site is published as a version of its owner, and every file verifies from a relay', async () => {
  const v = await openVersion(w.site.id, w.owner.id, [w.relay.base]);
  assert.deepEqual(v.problems, []);
  assert.ok(v.ok);
  assert.equal(v.signer, w.owner.id);
  assert.equal(v.standing, 'valid');
  assert.equal(v.manifest!.name, 'dubsar.org');
  assert.equal(v.manifest!.previous, null);
  const paths = v.manifest!.files.map((f) => f.path);
  assert.deepEqual(paths, ['build.html', 'index.html', 'read.html', 'run.html', 'site.css', 'use.html']);
  for (const f of v.manifest!.files) {
    const b = await fetchFile(f, v.places);
    assert.ok(b, f.path);
    assert.deepEqual(b, new Uint8Array(readFileSync(join(w.dir, f.path))));
  }
  assert.equal(w.site.uploaded, 6);
});

test('a new version names the one before, uploads only what changed; the old one still verifies', async () => {
  const dir = siteCopy(w.firstAct);
  writeFileSync(join(dir, 'run.html'), readFileSync(join(dir, 'run.html'), 'utf8').replace('<h1>Run</h1>', '<h1>Run, again</h1>'));
  const next = await publishSite(w.owner, { name: 'dubsar.org', files: readFolder(dir), relays: [w.relay.base], previous: w.site.id });
  assert.equal(next.uploaded, 1, 'only run.html');
  assert.equal(next.manifest.previous, w.site.id);
  const v = await openVersion(next.id, w.owner.id, [w.relay.base]);
  assert.ok(v.ok, v.problems.join('; '));
  assert.equal(v.manifest!.files.find((f) => f.path === 'site.css')!.locked, w.site.manifest.files.find((f) => f.path === 'site.css')!.locked, 'the same object');
  assert.ok((await openVersion(w.site.id, w.owner.id, [w.relay.base])).ok);
});

test('what is not a version of the expected site is refused, with the reason', async () => {
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home) });
  await other.publishGenesis();
  const copy = await publishSite(other, { name: 'dubsar.org', files: readFolder(w.dir), relays: [w.relay.base] });
  const byOther = await openVersion(copy.id, w.owner.id, [w.relay.base]);
  assert.equal(byOther.ok, false);
  assert.equal(byOther.signer, other.id, 'the real signer is named');
  assert.match(byOther.problems.join(), /not by the identity expected/);
  assert.match((await openVersion(w.firstAct, w.owner.id, [w.relay.base])).problems.join(), /not a publication/);
  assert.match((await openVersion('00'.repeat(32), w.owner.id, [w.relay.base])).problems.join(), /not found/);
  assert.match((await openVersion('nonsense', w.owner.id, [w.relay.base])).problems.join(), /not an act id/);

  // Withdrawn by its signer: no longer a version.
  const gone = await publishSite(other, { name: 'gone', files: readFolder(w.dir), relays: [w.relay.base] });
  assert.ok((await openVersion(gone.id, other.id, [w.relay.base])).ok);
  const wd = await withdraw(other, gone.id, [w.relay.base]);
  const after = await openVersion(gone.id, other.id, [w.relay.base]);
  assert.equal(after.ok, false);
  assert.equal(after.withdrawn, wd.id);
});

test("a collective's site is refused in draft 1, rather than accepted unjudged", async () => {
  const members: TestIdentity[] = [];
  for (let i = 0; i < 3; i++) {
    const t = TestIdentity.create({ homes: w.homes.map((h) => h.home) });
    await t.publishGenesis();
    members.push(t);
  }
  const { collective } = await TestCollective.found({
    members,
    homes: w.homes.map((h) => h.home),
    relays: [w.relay.base],
    governance: { safetyThreshold: 2, releaseThreshold: 2, cloneThreshold: 2, abandonmentOthers: 2, text: 'A test collective.' },
  });
  const s = await publishSite(collective.id, { name: 'a collective', files: readFolder(w.dir), relays: [w.relay.base] });
  const v = await openVersion(s.id, collective.identity, [w.relay.base]);
  assert.equal(v.ok, false);
  assert.equal(v.standing, 'valid', 'validly signed, and still not a version');
  assert.match(v.problems.join(), /collective/);
});

test('the gateway checks before it serves, serves its display client at every address, and the files only as bytes', async () => {
  const g = new Gateway(settingsFor(w.site.id), join(here, 'dist'));
  const l = await g.load();
  assert.ok(l.ok, [...l.version.problems, ...l.problems].join('; '));
  const base = await g.listen('127.0.0.1', 0);
  try {
    const shell = readFileSync(join(here, 'dist/index.html'), 'utf8');
    for (const a of ['/', '/run.html', '/site.css']) {
      const r = await fetch(base + a);
      assert.equal(r.status, 200, a);
      assert.equal(await r.text(), shell, `${a}: the display client, never the page itself`);
      assert.match(r.headers.get('content-security-policy')!, /script-src 'self' 'wasm-unsafe-eval'/);
      assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    }
    const missing = await fetch(base + '/nothing.html');
    assert.equal(missing.status, 404);
    assert.equal(await missing.text(), shell, 'the display client says what is missing');
    const s = await (await fetch(base + '/_mor/site.json')).json();
    assert.deepEqual(s, { version: w.site.id, identity: w.owner.id, name: 'Nobody, allegedly', relays: [w.relay.base], release: null });
    const f = await fetch(base + '/_mor/file/run.html');
    assert.equal(f.headers.get('content-type'), 'application/octet-stream');
    assert.equal(f.headers.get('content-disposition'), 'attachment');
    assert.deepEqual(new Uint8Array(await f.arrayBuffer()), new Uint8Array(readFileSync(join(w.dir, 'run.html'))));
    assert.equal((await fetch(base + '/_mor/file/nothing.html')).status, 404);
    assert.equal((await fetch(base + '/_mor/elsewhere.js')).status, 404);
    assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);

    // Told to switch to a version that does not verify, it keeps serving the one it checked.
    const other = TestIdentity.create({ homes: w.homes.map((h) => h.home) });
    await other.publishGenesis();
    const copy = await publishSite(other, { name: 'dubsar.org', files: readFolder(w.dir), relays: [w.relay.base] });
    const bad = await g.load(settingsFor(copy.id));
    assert.equal(bad.ok, false);
    assert.equal((await (await fetch(base + '/_mor/site.json')).json()).version, w.site.id);
  } finally {
    g.close();
  }

  // A gateway whose version never verified serves nothing of the site.
  const none = new Gateway(settingsFor(w.firstAct), join(here, 'dist'));
  assert.equal((await none.load()).ok, false);
  const nb = await none.listen('127.0.0.1', 0);
  try {
    const r = await fetch(nb + '/');
    assert.equal(r.status, 503);
    assert.match(await r.text(), /no version of its site that verifies/);
  } finally {
    none.close();
  }
});

test('the settings are checked, never guessed', () => {
  const good = { version: 'ab'.repeat(32), identity: 'cd'.repeat(32), relays: ['https://relay.example.org/'] };
  assert.deepEqual(parseSiteSettings(good).relays, ['https://relay.example.org']);
  assert.equal(parseGatewaySettings(good).listen, '127.0.0.1:8090');
  assert.throws(() => parseSiteSettings({ ...good, version: 'x' }), /version/);
  assert.throws(() => parseSiteSettings({ ...good, identity: 'x' }), /identity/);
  assert.throws(() => parseSiteSettings({ ...good, relays: ['http://relay.example.org'] }), /relays/, 'plain http only on this machine');
  assert.throws(() => parseSiteSettings({ ...good, release: 'x' }), /release/);
  assert.throws(() => parseGatewaySettings({ ...good, listen: 'everywhere' }), /listen/);
});

test('from the command line, with no gateway: verify a version and write its files out', async () => {
  const out = mkdtempSync(join(tmpdir(), 'mor-site-out-'));
  const r = await run('node', ['--import', 'tsx', 'src/cli.ts', 'verify', w.site.id, '--identity', w.owner.id, '--at', w.relay.base, '--out', out], { cwd: here });
  assert.match(r.stdout, /VERIFIED: the site "dubsar.org", 6 files/);
  for (const p of ['index.html', 'run.html', 'site.css']) assert.deepEqual(readFileSync(join(out, p)), readFileSync(join(w.dir, p)));
  await assert.rejects(
    run('node', ['--import', 'tsx', 'src/cli.ts', 'verify', w.site.id, '--identity', 'ab'.repeat(32), '--at', w.relay.base], { cwd: here }),
    (e: { code: number; stdout: string }) => e.code === 1 && /NOT VERIFIED/.test(e.stdout),
  );
});

test('from elsewhere, check a gateway: the same as signed and released, or where it differs', async () => {
  const g = new Gateway(settingsFor(w.site.id), join(here, 'dist'));
  assert.ok((await g.load()).ok);
  const base = await g.listen('127.0.0.1', 0);
  try {
    const ok = await run('node', ['--import', 'tsx', 'src/cli.ts', 'check', base], { cwd: here });
    assert.match(ok.stdout, /^SAME: /m);
    assert.doesNotMatch(ok.stdout, /DIFFERS/);

    // The gateway alters a page, keeping the honest display client.
    g.files.set('run.html', utf8(readFileSync(join(w.dir, 'run.html'), 'utf8').replace('<h1>Run</h1>', '<h1>Run (altered)</h1>')));
    await assert.rejects(
      run('node', ['--import', 'tsx', 'src/cli.ts', 'check', base, '--at', w.relay.base], { cwd: here }),
      (e: { code: number; stdout: string }) => e.code === 1 && /DIFFERS {2}run\.html/.test(e.stdout) && /same {2}index\.html/.test(e.stdout),
    );
  } finally {
    g.close();
  }

  // The gateway serves an altered display client: found by comparing with the release (here, a build of it).
  const doctored = mkdtempSync(join(tmpdir(), 'mor-site-dist-'));
  for (const f of ['index.html', 'gateway.css', 'mor_wasm_bg.wasm']) writeFileSync(join(doctored, f), readFileSync(join(here, 'dist', f)));
  writeFileSync(join(doctored, 'gateway.js'), readFileSync(join(here, 'dist/gateway.js'), 'utf8').replace('Verified:', 'Verified (trust me):'));
  const h = new Gateway(settingsFor(w.site.id), doctored);
  assert.ok((await h.load()).ok);
  const hb = await h.listen('127.0.0.1', 0);
  try {
    await assert.rejects(
      run('node', ['--import', 'tsx', 'src/cli.ts', 'check', hb], { cwd: here }),
      (e: { code: number; stdout: string }) => e.code === 1 && /DIFFERS {2}display client: gateway\.js/.test(e.stdout),
    );
  } finally {
    h.close();
  }
});

test('the Run guide is a long-form document, canonical text, carrying no private details', () => {
  const guide = readFileSync(new URL('../../../docs/run-guide-draft-1.md', import.meta.url), 'utf8').replace(/\n$/, '');
  checkText(guide);
  assert.ok(title(parse(guide)), 'it has a title');
  assert.doesNotMatch(guide, /[0-9a-f]{64}/, 'no identity, key or act id');
  assert.doesNotMatch(guide, /dubsar/i, 'no address of the deployed homes');
  assert.doesNotMatch(guide, /infomaniak|1984 hosting/i, 'no host of the deployed homes');
  assert.doesNotMatch(guide, /\b(?!127\.0\.0\.1)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, 'no IP address but the machine itself');
  for (const m of guide.matchAll(/([a-z0-9-]+)\.onion/gi)) assert.match(m[1], /^YOUR-ONION-ADDRESS$/, `no onion address: ${m[0]}`);
  assert.doesNotMatch(guide, /\/Users\/[a-z]/i, 'no home folder of the author');
});
