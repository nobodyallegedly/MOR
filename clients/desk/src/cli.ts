#!/usr/bin/env -S node --import tsx
// mor-desk: start the desk and open its page. Used once
// from a terminal to set up the launcher (scripts/make-app.sh), and then by
// the launcher itself: after that, nothing is typed.

import { spawn, execFile } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, type RunFile } from './server.ts';

const HELP = `mor-desk: the owner's desk, a client with no command line for several test identities.
TEST IDENTITIES ONLY: every key is held in software, in its folder.

  open [--dir DIR] [--port N]   Start the program if it is not running, and open
                                its page in the browser, paired by a one-time link.
  run  [--dir DIR] [--port N]   Run the program here, in the foreground.
  stop [--dir DIR]              Stop the running program.

The folder defaults to ~/mor-desk, the port to 8471. The page is at
http://127.0.0.1:PORT/ on this machine only.`;

const pkg = fileURLToPath(new URL('../', import.meta.url));

function parse(argv: string[]) {
  const o: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
  return o;
}

async function hello(port: number): Promise<boolean> {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/hello`);
    return r.ok;
  } catch {
    return false;
  }
}

function runFile(dir: string): RunFile | null {
  const p = join(dir, 'run.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as RunFile;
  } catch {
    return null;
  }
}

/** Open a link in the person's browser. */
function browse(url: string) {
  if (process.env.MOR_NO_BROWSER) return;
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  execFile(cmd, args as string[], () => undefined);
}

async function open(dir: string, port: number) {
  let run = runFile(dir);
  if (!run || !(await hello(run.port))) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const log = openSync(join(dir, 'desk.log'), 'a', 0o600);
    const child = spawn(process.execPath, ['--import', 'tsx', fileURLToPath(import.meta.url), 'run', '--dir', dir, '--port', String(port)], {
      cwd: pkg,
      detached: true,
      stdio: ['ignore', log, log],
    });
    child.unref();
    for (let i = 0; i < 200; i++) {
      await new Promise((r) => setTimeout(r, 100));
      run = runFile(dir);
      if (run && run.pid === child.pid && (await hello(run.port))) break;
      run = null;
    }
    if (!run) throw new Error(`the program did not start: see ${join(dir, 'desk.log')}`);
  }
  const r = await fetch(`http://127.0.0.1:${run.port}/local/code`, { method: 'POST', headers: { 'mor-local': run.secret } });
  const { code } = (await r.json()) as { code: string };
  const url = `http://127.0.0.1:${run.port}/#pair=${code}`;
  console.log(url);
  browse(url);
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = parse(rest);
  const dir = resolve(o.dir ?? join(homedir(), 'mor-desk'));
  const port = Number(o.port ?? 8471);
  switch (cmd) {
    case 'run': {
      const r = await serve({ dir, port });
      console.log(`mor-desk: ${r.base}/ (folder ${dir})`);
      const stop = () => void r.close().then(() => process.exit(0));
      process.on('SIGTERM', stop);
      process.on('SIGINT', stop);
      break;
    }
    case 'open':
      await open(dir, port);
      break;
    case 'stop': {
      const run = runFile(dir);
      if (!run) {
        console.log('not running');
        break;
      }
      try {
        process.kill(run.pid, 'SIGTERM');
      } catch {
        // already gone
      }
      console.log('stopped');
      break;
    }
    default:
      console.log(HELP);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
