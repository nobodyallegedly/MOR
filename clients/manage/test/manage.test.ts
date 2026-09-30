// The management page's code outside a browser: the committed build is the
// build of this source; requests signed here (Node's WebCrypto, the same
// Ed25519 as a browser's) are accepted by a real relay; and what strangers
// sent is escaped on the page.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start, type Running } from '../../genesis/test/world.ts';
import { DOMAIN, Manager, Refused, fromHex, newKey, requestBody, signedBytes, toHex, type Status } from '../src/api.ts';
import * as v from '../src/view.ts';

import { bin, pairingCode } from './pair.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const root = join(here, '../..');

let home: Running;

before(async () => {
  home = await start('home');
});

after(async () => {
  await home?.stop();
});

test('the page the relay serves is the build of this source', () => {
  const out = mkdtempSync(join(tmpdir(), 'mor-manage-build-'));
  execFileSync('node', ['--import', 'tsx', 'scripts/build.ts', '--out', out], { cwd: here, stdio: 'ignore' });
  for (const f of ['index.html', 'manage.js', 'manage.css']) {
    assert.equal(
      readFileSync(join(out, f), 'utf8'),
      readFileSync(join(root, 'relay/manage', f), 'utf8'),
      `relay/manage/${f} is not the build of clients/manage: run npm run build there, then rebuild the relay`,
    );
  }
});

test('a request is the exact JSON the relay reads, signed after the domain', () => {
  const body = requestBody({ relay: 'ab'.repeat(16), time: 1, role: 'home' }, 1700000000, new Uint8Array(16).fill(7), 'allow', {
    identity: 'cd'.repeat(32),
  });
  const text = new TextDecoder().decode(body);
  assert.deepEqual(JSON.parse(text), {
    relay: 'ab'.repeat(16),
    time: 1700000000,
    nonce: '07'.repeat(16),
    op: 'allow',
    args: { identity: 'cd'.repeat(32) },
  });
  const signed = new TextDecoder().decode(signedBytes(body));
  assert.equal(signed, DOMAIN + text);
  assert.equal(toHex(fromHex('00ff10')), '00ff10');
  assert.throws(() => fromHex('0g'));
});

test('a key made here cannot be read out, and pairs with a code from `mor-relay pair`', async () => {
  const keys = await newKey();
  await assert.rejects(crypto.subtle.exportKey('pkcs8', keys.privateKey));
  const m = await Manager.open(keys, `${home.base}/manage`);
  assert.equal(m.hello.role, 'home');
  await assert.rejects(m.ask('status'), (e: unknown) => e instanceof Refused && e.status === 401 && /not paired/.test(e.message));
  await assert.rejects(m.ask('pair', { code: 'AAAAA-AAAAA-AAAAA-AAAAA', label: 'node' }), /not one this relay gave/);
  await m.ask('pair', { code: pairingCode(home.dir), label: 'node' });
  const s = await m.ask<Status>('status');
  assert.equal(s.role, 'home');
  assert.equal(s.operator, home.operator);
  assert.equal(s.holdsSafetyKey, true);
  // The operator on the command line sees the same browser.
  const listed = execFileSync(bin, ['managers', '--dir', home.dir], { encoding: 'utf8' });
  assert.match(listed, new RegExp(`^${m.publicKey}  node$`, 'm'));
});

test('what strangers sent is escaped on the page', () => {
  const hostile = '<img src=x onerror=alert(1)>"\'&';
  const html = v.pending([
    {
      rotation: 'aa'.repeat(32),
      identity: 'bb'.repeat(32),
      position: 1,
      at: 0,
      approved: false,
      homeless: true,
      closure: false,
      homes: [{ operator: null, hint: hostile }],
    },
  ]);
  assert.ok(!html.includes('<img'), html);
  assert.ok(html.includes('&#60;img src=x onerror=alert(1)&#62;&#34;&#39;&#38;'));
  const label = v.managers([{ key: 'cc'.repeat(32), label: hostile, added: 0, you: true }]);
  assert.ok(!label.includes('<img'));
  assert.ok(!v.hash(hostile).includes('<img'));
});

test('the page says what each arrival is, in words', () => {
  const it = { arrival: 1, id: 'aa'.repeat(32), size: 10, signer: null };
  assert.equal(v.what({ ...it, kind: 'act', spec: 'identity', type: 2 }), 'Identity: receipt');
  assert.equal(v.what({ ...it, kind: 'act', spec: 'envelope', type: 4 }), 'Envelope: encryption key');
  assert.equal(v.what({ ...it, kind: 'act', spec: null, type: null }), 'private act');
  assert.equal(v.what({ ...it, kind: 'sealed', spec: null, type: null }), 'sealed container');
  assert.equal(v.bytes(1536), '1.5 KiB');
  assert.equal(v.bytes(64 * 1024 * 1024), '64 MiB');
});
