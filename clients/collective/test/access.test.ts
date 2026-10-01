// Who may use the program: only a paired browser, only on this machine, each
// request once. And the launcher: it starts the program and gives a one-time
// link that pairs the browser by itself, so nothing is typed.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, requestBody, signedBytes, toHex, type State } from '../src/page/api.ts';
import { codeHash } from '../src/access.ts';

let app: Running;
before(async () => {
  app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-collective-access-')), port: 0 });
});
after(async () => {
  await app?.close();
});

const refusal = (p: Promise<unknown>) => p.then(() => 'accepted', (e: Error) => e.message);

test('only a paired browser is answered; a code works once', async () => {
  const c = await Client.open(await newKey(), app.base);
  assert.match(await refusal(c.ask('state')), /not paired/);
  assert.match(await refusal(c.ask('pair', { code: 'AAAAA-AAAAA-AAAAA-AAAAA', label: 'x' })), /not one this program gave/);
  const code = app.access.newCode();
  await c.ask('pair', { code: code.toLowerCase().replaceAll('-', ' '), label: 'test' });
  const s = await c.ask<State>('state');
  assert.equal(s.paired.length, 1);
  assert.equal(s.paired[0].you, true);
  const other = await Client.open(await newKey(), app.base);
  assert.match(await refusal(other.ask('pair', { code, label: 'x' })), /not one this program gave, or it has expired or was used/);
  // A code made on the page pairs another browser; unpairing shuts it out.
  const { code: second } = await c.ask<{ code: string }>('code');
  await other.ask('pair', { code: second, label: 'other' });
  await other.ask('state');
  await c.ask('unpair', { key: other.publicKey });
  assert.match(await refusal(other.ask('state')), /not paired/);
  // Codes are read leniently, as the relay reads its own: I and L for 1, O for 0.
  assert.equal(codeHash('0000-11111-00000-11111-0'), codeHash('OOOO-IIIII-ooooo-lllll-o'));
  assert.equal(codeHash('short'), null);
});

async function raw(body: Uint8Array, headers: Record<string, string>, host = new URL(app.base).host): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const r = request(`${app.base}/api`, { method: 'POST', headers: { ...headers, host, 'content-type': 'application/json' } }, (res) => {
      let text = '';
      res.on('data', (d) => (text += d));
      res.on('end', () => resolve({ status: res.statusCode!, text }));
    });
    r.on('error', reject);
    r.end(Buffer.from(body));
  });
}

test('a request replayed, altered, made for another program, too old, or sent to another name is refused', async () => {
  const keys = await newKey();
  const c = await Client.open(keys, app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  const pub = c.publicKey;
  const signed = async (body: Uint8Array) => ({
    'mor-key': pub,
    'mor-signature': toHex(new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, keys.privateKey, signedBytes(body as Uint8Array<ArrayBuffer>)))),
  });
  const now = Math.floor(Date.now() / 1000);
  const body = requestBody(c.hello, now, crypto.getRandomValues(new Uint8Array(16)), 'state', {});
  const h = await signed(body);
  assert.equal((await raw(body, h)).status, 200);
  const replay = await raw(body, h);
  assert.equal(replay.status, 401);
  assert.match(replay.text, /already received/);

  const altered = new Uint8Array(body);
  altered[altered.length - 3] ^= 1;
  assert.match((await raw(altered, h)).text, /signature does not match/);

  const elsewhere = requestBody({ app: 'ff'.repeat(16), time: 0 }, now, crypto.getRandomValues(new Uint8Array(16)), 'state', {});
  assert.match((await raw(elsewhere, await signed(elsewhere))).text, /made for another program/);

  const old = requestBody(c.hello, now - 3600, crypto.getRandomValues(new Uint8Array(16)), 'state', {});
  assert.match((await raw(old, await signed(old))).text, /too old/);

  // A page elsewhere pointing a name of its own at this machine (DNS rebinding) is not answered.
  const fresh = requestBody(c.hello, now, crypto.getRandomValues(new Uint8Array(16)), 'state', {});
  const rebound = await raw(fresh, await signed(fresh), `evil.example:${app.port}`);
  assert.equal(rebound.status, 421);
});

test('the page is served under a policy that runs only its own script and talks only to this program', async () => {
  const r = await fetch(`${app.base}/`);
  assert.equal(r.status, 200);
  const csp = r.headers.get('content-security-policy')!;
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /connect-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(r.headers.get('access-control-allow-origin'), null);
  const js = await (await fetch(`${app.base}/app.js`)).text();
  assert.match(js, /MOR collective client, version 1/);
});

test('the launcher starts the program and gives a link that pairs by itself', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mor-collective-open-'));
  const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
  const run = promisify(execFile);
  const env = { ...process.env, MOR_NO_BROWSER: '1' };
  const port = String(20000 + Math.floor(Math.random() * 20000));
  const first = await run(process.execPath, ['--import', 'tsx', cli, 'open', '--dir', dir, '--port', port], { env });
  const link = first.stdout.trim();
  assert.match(link, new RegExp(`^http://127\\.0\\.0\\.1:${port}/#pair=[0-9A-Z]{5}(-[0-9A-Z]{5}){3}$`));
  const pid = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')).pid as number;
  try {
    // A second launch finds it running and gives a fresh link.
    const second = await run(process.execPath, ['--import', 'tsx', cli, 'open', '--dir', dir, '--port', port], { env });
    assert.notEqual(second.stdout.trim(), link);
    assert.equal(JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')).pid, pid);
    const c = await Client.open(await newKey(), `http://127.0.0.1:${port}`);
    await c.ask('pair', { code: link.split('#pair=')[1], label: 'test' });
    await c.ask('state');
  } finally {
    await run(process.execPath, ['--import', 'tsx', cli, 'stop', '--dir', dir], { env });
  }
});
