// `mor-dub open`, as the app's double-click runs it: it starts the
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
  const dir = mkdtempSync(join(tmpdir(), 'mor-dub-launch-'));
  const out = cli('open', '--dir', dir, '--port', '0');
  // The program started here is stopped whatever the outcome (Part 4): a failed assertion never leaves it running.
  let stopped = false;
  try {
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
    stopped = true;
    for (let i = 0; i < 50; i++) {
      try {
        await fetch(`http://127.0.0.1:${run.port}/hello`);
        await new Promise((r) => setTimeout(r, 100));
      } catch {
        return;
      }
    }
    assert.fail('the program did not stop');
  } finally {
    if (!stopped) {
      try {
        cli('stop', '--dir', dir);
      } catch {
        // not running
      }
    }
  }
});

test('stop never stops a process Dub did not start: a stale run file, or another program on its port, is left alone', async () => {
  const { spawn, execFile } = await import('node:child_process');
  // Not the synchronous helper: this test's own server must answer while `stop` asks it.
  const stop = (dir: string) =>
    new Promise<string>((resolve, reject) =>
      execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'stop', '--dir', dir], { cwd: pkg, env: { ...process.env, MOR_NO_BROWSER: '1' } }, (err, out) => (err ? reject(err) : resolve(out))),
    );
  const { writeFileSync } = await import('node:fs');
  const { createServer } = await import('node:http');
  const alive = (pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  const dir = mkdtempSync(join(tmpdir(), 'mor-dub-stranger-'));
  const stranger = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  const other = createServer((req, res) => {
    res.writeHead(req.url === '/hello' ? 200 : 403, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ app: 'someone else', time: 0, pid: stranger.pid }));
  });
  await new Promise<void>((r) => other.listen(0, '127.0.0.1', r));
  try {
    writeFileSync(join(dir, 'run.json'), JSON.stringify({ port: (other.address() as { port: number }).port, pid: stranger.pid, secret: 'not theirs' }));
    assert.match(await stop(dir), /nothing was stopped/);
    writeFileSync(join(dir, 'run.json'), JSON.stringify({ port: 9, pid: stranger.pid, secret: 'stale' }));
    assert.match(await stop(dir), /nothing was stopped/);
    assert.ok(alive(stranger.pid!), 'the stranger still runs');
  } finally {
    other.close();
    stranger.kill();
  }
});
