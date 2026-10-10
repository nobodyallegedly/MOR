// The command line as a user drives it, against real homes; and an operator
// identity made by this client running a home (relay reading 4: a home runs
// under an identity made elsewhere, with no chain key on the server).

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start, type Running } from './world.ts';

const cli = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
const bin = fileURLToPath(new URL('../../../target/debug/mor-relay', import.meta.url));
let homes: Running[] = [];
let inbox: Running;
const dir = mkdtempSync(join(tmpdir(), 'mor-genesis-cli-'));

const run = (...args: string[]) => execFileSync('node', ['--import', 'tsx', cli, ...args], { encoding: 'utf8' });

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  inbox = await start('relay');
});
after(async () => {
  for (const r of [...homes, inbox]) await r.stop();
});

test('new, routes, enckey, rotate and check, from the command line', () => {
  const file = join(dir, 'a.json');
  const out = run('new', '--file', file, ...homes.flatMap((h) => ['--home', h.base]));
  assert.match(out, /TEST identity [0-9a-f]{64}/);
  assert.equal(out.match(/: receipt/g)?.length, 3);
  const id = out.match(/TEST identity ([0-9a-f]{64})/)![1];
  assert.throws(() => run('new', '--file', file, '--home', homes[0].base), /never overwrite/);
  assert.match(readFileSync(file, 'utf8'), /MOR TEST IDENTITY/);
  run('routes', '--file', file, '--outbox', homes[0].base, '--inbox', inbox.base);
  run('enckey', '--file', file);
  const rot = run('rotate', '--file', file);
  assert.match(rot, /it counts: new keys in use/);
  const c = run('check', id, '--at', homes[2].base);
  assert.match(c, /1: [0-9a-f]{64} \(homes\)/);
  assert.match(c, /then: end/);
  assert.match(c, /inbox  \* /);
  assert.match(c, /encryption key: [0-9a-f]{64}/);
  assert.match(run('show', '--file', file), /position 1/);
});

test('an operator identity made here runs a home, its chain key never on the server', async () => {
  const file = join(dir, 'op.json');
  const port = 20000 + Math.floor(Math.random() * 20000);
  const base = `http://127.0.0.1:${port}`;
  // Self-hosted at the home it will run; created before the home exists, so
  // its genesis is sent later by the home itself.
  const out = run('new', '--file', file, '--home', `self@${base}`);
  const op = out.match(/TEST identity ([0-9a-f]{64})/)![1];
  const keys = mkdtempSync(join(tmpdir(), 'mor-op-'));
  run('export-operator', '--file', file, '--out', keys);
  assert.doesNotMatch(readFileSync(join(keys, 'operator.key')).toString('latin1'), /TEST IDENTITY/);
  const data = mkdtempSync(join(tmpdir(), 'mor-op-home-'));
  const init = execFileSync(
    bin,
    ['init', '--dir', data, '--role', 'home', '--base', base, '--local-test', '--operator-key', join(keys, 'operator.key'), '--operator-chain', join(keys, 'operator-chain.mor')],
    { encoding: 'utf8' },
  );
  assert.match(init, new RegExp(op));
  const { Running } = await import('./world.ts');
  const h = new Running(data, port, base, op);
  await h.start();
  try {
    // An identity homed there gets a receipt signed by that operator, and a reader counts it.
    const who = run('new', '--file', join(dir, 'b.json'), '--home', base);
    assert.match(who, /: receipt/);
    const id = who.match(/TEST identity ([0-9a-f]{64})/)![1];
    run('rotate', '--file', join(dir, 'b.json'));
    assert.match(run('check', id, '--at', base), /1: [0-9a-f]{64} \(homes\)/);
  } finally {
    await h.stop();
  }
});
