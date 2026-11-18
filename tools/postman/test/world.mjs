// A small world for the postman's tests: a round folder with trays, the
// reference relay running as a home on a local port (the real program,
// `relay/`), an echo relay that records exactly what reaches it, and the
// postman over them with a stand-in wallet.

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer } from 'node:http';
import { createServer as netServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkConfig } from '../lib/config.mjs';
import { Postman } from '../lib/courier.mjs';
import { MockWallet } from '../lib/wallet.mjs';
import { Kit } from '../kit/lib/kit.mjs';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const bin = join(repo, 'target/debug/mor-relay');

export async function freePort() {
  return new Promise((resolve, reject) => {
    const s = netServer();
    s.listen(0, '127.0.0.1', () => {
      const a = s.address();
      s.close(() => resolve(a.port));
    });
    s.on('error', reject);
  });
}

let built = false;
/** The reference relay, as a home under a new test operator. */
export async function startHome() {
  if (!built) {
    execFileSync('cargo', ['build', '-q', '-p', 'mor-relay'], { cwd: repo, stdio: 'inherit' });
    built = true;
  }
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const dir = fs.mkdtempSync(join(tmpdir(), 'mor-postman-home-'));
  const out = execFileSync(bin, ['init', '--dir', dir, '--role', 'home', '--base', base, '--local-test', '--new-test-operator'], { encoding: 'utf8' });
  const operator = /Operator[^:]*: ([0-9a-f]{64})/.exec(out)[1];
  const proc = spawn(bin, ['run', '--dir', dir, '--listen', `127.0.0.1:${port}`, '--allow-http'], { stdio: 'ignore' });
  for (let i = 0; i < 200; i++) {
    try {
      if ((await fetch(`${base}/info`)).ok) break;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return { base, operator, home: { operator, hint: base }, stop: () => new Promise((r) => (proc.on('exit', r), proc.kill('SIGTERM'))) };
}

/** A relay that answers every request with 202 and keeps exactly what it received. */
export async function startEcho() {
  const got = [];
  const port = await freePort();
  const server = createServer((req, res) => {
    const parts = [];
    req.on('data', (c) => parts.push(c));
    req.on('end', () => {
      got.push({ method: req.method, url: req.url, headers: req.headers, body: new Uint8Array(Buffer.concat(parts)) });
      res.writeHead(202, { 'content-type': 'application/octet-stream', 'x-echo': 'kept' });
      res.end(Buffer.from([0xa0, 0x00, 0xff, 0x0a]));
    });
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { base: `http://127.0.0.1:${port}`, got, stop: () => new Promise((r) => server.close(r)) };
}

/** A round folder with these trays, each holding its own copy of nothing but its folders; a kit for each. */
export function round(trays, relays, extra = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), 'mor-round-2-')));
  for (const t of trays) fs.mkdirSync(join(root, t));
  const cfg = checkConfig({ root, trays, companies: trays, relays, wallet: { kind: 'mock' }, limits: { settleSeconds: 0 }, ...extra });
  const wallet = new MockWallet();
  const pm = new Postman(cfg, { wallet });
  const kits = Object.fromEntries(trays.map((t) => [t, new Kit(join(root, t), t)]));
  return { root, cfg, wallet, pm, kits, log: () => readLog(cfg) };
}

export function readLog(cfg) {
  const p = join(cfg.postmanDir, 'log', 'carried.jsonl');
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
