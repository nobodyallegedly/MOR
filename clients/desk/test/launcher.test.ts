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
const desk = (...args: string[]) =>
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
      res.writeHead(req.url === '/hello' ? 200 : 404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ app: 'older', time: 0 }));
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
