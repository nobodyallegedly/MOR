// The launcher, as the MOR Identities app runs it (`mor-desk open`): a
// program left running from an older version of the code is stopped and
// started again from the code on disk; a program of the same version is
// left running. On the author's Mac, a program started before a pull kept
// serving its older page (retest of 2 October 2026).

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RunFile } from '../src/server.ts';
import { version } from '../src/version.ts';

const pkg = fileURLToPath(new URL('../', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'mor-desk-launcher-'));
const runFile = () => JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as RunFile;

/** `mor-desk ARGS`, as the app runs it, with no browser opened. */
const desk = (...args: string[]) => deskIn(dir, ...args);
const deskIn = (dir: string, ...args: string[]) =>
  new Promise<string>((resolve, reject) =>
    execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args, '--dir', dir], { cwd: pkg, env: { ...process.env, MOR_NO_BROWSER: '1' } }, (err, out, errs) =>
      err ? reject(new Error(`${err.message}\n${errs}`)) : resolve(out),
    ),
  );

/**
 * A program as the desk was before 4 October 2026: it answers /hello with
 * no version, and writes its run file with no version.
 */
function older(): Promise<ChildProcess> {
  const code = `
    const { createServer } = require('node:http');
    const { writeFileSync } = require('node:fs');
    const s = createServer((req, res) => {
      // As the programs of then: /hello, and a pairing code for whoever holds the run file's secret.
      const own = req.method === 'POST' && req.url === '/local/code' && req.headers['mor-local'] === 'x';
      res.writeHead(req.url === '/hello' || own ? 200 : 404, { 'content-type': 'application/json' });
      res.end(JSON.stringify(own ? { code: 'X' } : { app: 'older', time: 0 }));
    });
    s.listen(0, '127.0.0.1', () => {
      writeFileSync(${JSON.stringify(join(dir, 'run.json'))}, JSON.stringify({ port: s.address().port, pid: process.pid, secret: 'x' }));
      console.log('ready');
    });
    process.on('SIGTERM', () => process.exit(0));`;
  const child = spawn(process.execPath, ['-e', code], { stdio: ['ignore', 'pipe', 'inherit'] });
  return new Promise((resolve) => child.stdout!.once('data', () => resolve(child)));
}

after(async () => {
  await desk('stop').catch(() => undefined);
});

test('the app restarts a program left running from an older version, and leaves a current one running', async () => {
  const old = await older();
  const gone = new Promise<number | null>((resolve) => old.once('exit', (c) => resolve(c)));
  const said = await desk('open', '--port', '0');
  assert.match(said, /restarting the program, left running from an older version/);
  assert.match(said, /^http:\/\/127\.0\.0\.1:\d+\/#pair=/m);
  assert.equal(await gone, 0, 'the older program was stopped');

  const run = runFile();
  assert.notEqual(run.pid, old.pid);
  assert.equal(run.version, await version());
  const hello = (await (await fetch(`http://127.0.0.1:${run.port}/hello`)).json()) as { pid: number; version: string };
  assert.equal(hello.pid, run.pid);
  assert.equal(hello.version, run.version);

  // Opened again from the same code: the same program, not restarted.
  const again = await desk('open', '--port', '0');
  assert.doesNotMatch(again, /restarting/);
  assert.equal(runFile().pid, run.pid);
});

/** Whether a process is alive (signal 0 only asks). */
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

test('it never stops a process it did not start: a stale run file, or another program on its port, is left alone', async () => {
  const d = mkdtempSync(join(tmpdir(), 'mor-desk-stranger-'));
  // A process this app did not start, as the GitHub runner or anything else on the machine is.
  const stranger = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  const { writeFileSync } = await import('node:fs');
  const { createServer } = await import('node:http');
  try {
    // 1. A stale run file naming it, on a port where nothing answers.
    const free = createServer();
    await new Promise<void>((r) => free.listen(0, '127.0.0.1', r));
    const freePort = (free.address() as { port: number }).port;
    await new Promise((r) => free.close(r));
    writeFileSync(join(d, 'run.json'), JSON.stringify({ port: freePort, pid: stranger.pid, secret: 'stale' }));
    assert.match(await deskIn(d, 'stop'), /nothing was stopped/);
    assert.ok(alive(stranger.pid!), 'a stale run file stops nothing');

    // 2. Another program on the port, naming it, older-looking, but not knowing the file's secret.
    const other = createServer((req, res) => {
      if (req.url === '/hello') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ app: 'someone else', time: 0, pid: stranger.pid, version: 'older' }));
      } else {
        res.writeHead(403);
        res.end();
      }
    });
    await new Promise<void>((r) => other.listen(0, '127.0.0.1', r));
    const port = (other.address() as { port: number }).port;
    writeFileSync(join(d, 'run.json'), JSON.stringify({ port, pid: stranger.pid, secret: 'not theirs' }));
    assert.match(await deskIn(d, 'stop'), /nothing was stopped/);
    assert.ok(alive(stranger.pid!), 'another program on the port stops nothing');
    // Opened: it starts its own program, and restarts nothing.
    const said = await deskIn(d, 'open', '--port', '0');
    assert.doesNotMatch(said, /restarting/);
    assert.ok(alive(stranger.pid!), 'open stops nothing it did not start');
    const mine = JSON.parse(readFileSync(join(d, 'run.json'), 'utf8')) as RunFile;
    assert.notEqual(mine.pid, stranger.pid);
    // Its own program, it does stop.
    assert.match(await deskIn(d, 'stop'), /^stopped/m);
    for (let i = 0; i < 50 && alive(mine.pid); i++) await new Promise((r) => setTimeout(r, 100));
    assert.ok(!alive(mine.pid), 'its own program stopped');
    assert.ok(alive(stranger.pid!), 'and the stranger still runs');
    other.close();
  } finally {
    stranger.kill();
  }
});
