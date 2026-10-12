// `mor-poster open`, as the app's double-click runs it: it starts the
// program, detached, on 127.0.0.1, and prints the one-time pairing link it
// opens in the browser; opened again, the same program stays; `stop` stops it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = fileURLToPath(new URL('../', import.meta.url));
const cli = (...args: string[]) =>
  execFileSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args], { cwd: pkg, env: { ...process.env, MOR_NO_BROWSER: '1' }, encoding: 'utf8' });

test('open starts the program and prints a pairing link; open again keeps it; stop stops it', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mor-poster-launch-'));
  const out = cli('open', '--dir', dir, '--port', '0');
  const m = /http:\/\/127\.0\.0\.1:(\d+)\/#pair=[0-9A-Z-]{23}/.exec(out);
  assert.ok(m, out);
  const run = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8'));
  assert.equal(String(run.port), m[1]);
  assert.equal(statSync(join(dir, 'run.json')).mode & 0o777, 0o600);
  assert.equal(statSync(dir).mode & 0o777, 0o700);
  const hello = (await (await fetch(`http://127.0.0.1:${run.port}/hello`)).json()) as { pid: number };
  assert.equal(hello.pid, run.pid);
  const again = cli('open', '--dir', dir, '--port', '0');
  assert.match(again, new RegExp(`127\\.0\\.0\\.1:${run.port}/#pair=`));
  assert.equal(JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')).pid, run.pid, 'the same program');
  assert.match(cli('stop', '--dir', dir), /stopped/);
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`http://127.0.0.1:${run.port}/hello`);
      await new Promise((r) => setTimeout(r, 100));
    } catch {
      return;
    }
  }
  assert.fail('the program did not stop');
});
