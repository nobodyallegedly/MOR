// The command line as its users drive it: members made by the genesis
// client, a collective founded, a release of a git tree published and
// signed, then verified by a separate process that knows nothing but the
// release's id and one relay, as a fresh machine would.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';

const run = promisify(execFile);
const here = fileURLToPath(new URL('..', import.meta.url));
const cli = (...args: string[]) =>
  run(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args], { cwd: here }).then((r) => r.stdout);

let homes: Running[] = [];
let relay: Running;
const dir = mkdtempSync(join(tmpdir(), 'mor-repo-cli-'));

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

test('found, release, sign, verify from the command line', async () => {
  const files: string[] = [];
  for (const n of ['a', 'b', 'c']) {
    const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
    await t.publishGenesis();
    const p = join(dir, `${n}.json`);
    t.save(p);
    files.push(p);
  }
  const tree = join(dir, 'tree');
  mkdirSync(join(tree, 'src'), { recursive: true });
  writeFileSync(join(tree, 'README.md'), 'hello\n');
  writeFileSync(join(tree, 'src/main.rs'), 'fn main() {}\n');
  execFileSync('git', ['init', '-q'], { cwd: tree });
  execFileSync('git', ['add', '.'], { cwd: tree });
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'one'], { cwd: tree });

  const c = join(dir, 'collective.json');
  const found = await cli(
    'found', '--file', c,
    ...files.flatMap((f) => ['--member', f]),
    ...homes.flatMap((h) => ['--home', h.base]),
    '--relay', relay.base, '--scheme', '3',
  );
  assert.match(found, /founding agreement [0-9a-f]{64}, signed by 3 members/);
  // Agreements rule 49 (F172, F178 item 11): the abandonment clause in plain words, before anything is signed.
  assert.match(found, /Absence: any 2 of the other members together may declare a member absent\. What may then follow: the member loses their voice .*\. No absence-proof cMIP stands between: their word alone is enough/);
  assert.ok(found.indexOf('No absence-proof cMIP stands between') < found.search(/founding agreement [0-9a-f]{64}/), 'shown before the signatures');
  assert.equal((found.match(/: receipt/g) ?? []).length, 3);
  assert.match(readFileSync(c, 'utf8'), /MOR TEST COLLECTIVE/);

  const rel = await cli('release', '--file', c, '--version', '1', '--root', tree);
  const id = rel.match(/release ([0-9a-f]{64})/)![1];
  assert.match(rel, /2 files \(2 new\)/);

  const first = await cli('sign', '--member', files[0], '--release', id, '--at', relay.base, '--against', tree);
  assert.match(first, /2 the same, 0 differ, 0 missing/);
  assert.match(first, /signed: [0-9a-f]{64}/);
  await assert.rejects(cli('verify', id, '--at', relay.base), (e: { stdout: string }) => /NOT VERIFIED/.test(e.stdout));
  await cli('sign', '--member', files[2], '--release', id, '--at', relay.base);

  // A separate process, knowing only the release's id and one relay.
  const out = join(dir, 'out');
  const v = await cli('verify', id, '--at', relay.base, '--out', out);
  assert.match(v, /any 2 of the Releases area's holders/);
  assert.match(v, /2 files checked against their hashes/);
  assert.match(v, /\nVERIFIED/);
  assert.equal(readFileSync(join(out, 'src/main.rs'), 'utf8'), 'fn main() {}\n');

  // A member refuses to sign a release that differs from their checkout.
  writeFileSync(join(tree, 'src/main.rs'), 'fn main() { evil() }\n');
  await assert.rejects(cli('sign', '--member', files[1], '--release', id, '--at', relay.base, '--against', tree), /differs from your checkout/);
});

// F187 (9): the command line is a test tool, not a client. It marks a
// member change from this device's copy of the collective, never asking
// Agreements first, so it can sign a mark Agreements call false (the step 11b fault);
// its help says so before anything else, and points to the collective
// client.
test('the command line says it is a test tool, not a client', async () => {
  const help = await cli('help');
  assert.match(help.split('\n').slice(0, 6).join('\n'), /A TEST TOOL, NOT A CLIENT/);
  assert.match(help, /marks a member change from this device's copy of the collective, without asking Agreements first/);
  assert.match(help, /clients\/collective/);
  assert.match(readFileSync(join(here, 'README.md'), 'utf8'), /The command line is a test tool, not a client/);
});
