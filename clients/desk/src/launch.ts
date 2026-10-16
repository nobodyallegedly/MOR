// Starting a program on this machine and opening its page, paired by a
// one-time link: what the app's double-click runs, so nothing is typed. The
// desk's, shared with Dub (`clients/dub`, called MOR Post until 13 October 2026).

import { spawn, execFile } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RunFile } from './local.ts';

/** What a running program says of itself; `pid` and `version` are absent from programs started before 4 October 2026. */
interface Hello {
  app: string;
  pid?: number;
  version?: string;
}

async function hello(port: number): Promise<Hello | null> {
  try {
    // A program that never answers is no program of ours: asked for three seconds at most.
    const r = await fetch(`http://127.0.0.1:${port}/hello`, { signal: AbortSignal.timeout(3000) });
    return r.ok ? ((await r.json()) as Hello) : null;
  } catch {
    return null;
  }
}

/**
 * The process to stop for a run file, only where the program answering on
 * its port proves it is the one that wrote the file, and so one this app
 * started: it accepts the file's secret (a pairing code is asked for with it,
 * which only that program grants), and the process it names is the file's.
 * Otherwise null, and nothing is ever signalled: a stale run file, a process
 * number reused since, or another program on that port is left alone.
 */
export async function provenPid(run: RunFile): Promise<number | null> {
  const said = await hello(run.port);
  if (!said) return null;
  try {
    const r = await fetch(`http://127.0.0.1:${run.port}/local/code`, { method: 'POST', headers: { 'mor-local': run.secret }, signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
  } catch {
    return null;
  }
  // A program from before 4 October 2026 gives no process number: the file's, which it wrote.
  if (said.pid !== undefined && said.pid !== run.pid) return null;
  const pid = run.pid;
  if (!Number.isInteger(pid) || pid <= 1 || pid === process.pid || pid === process.ppid) return null;
  return pid;
}

/**
 * Stop a program left running from an older version of the code (started
 * before a pull), proven ours (`provenPid`), and wait until it has gone, so a
 * new one can take its port.
 */
async function stopOlder(run: RunFile, pid: number) {
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    // already gone
  }
  for (let i = 0; i < 100; i++) {
    if (!(await hello(run.port))) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`the program left running from an older version (process ${pid}) did not stop; quit it, or restart the computer, and open again`);
}

export function runFile(dir: string): RunFile | null {
  const p = join(dir, 'run.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as RunFile;
  } catch {
    return null;
  }
}

/** Open a link in the person's browser. */
export function browse(url: string) {
  if (process.env.MOR_NO_BROWSER) return;
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  execFile(cmd, args as string[], () => undefined);
}

/**
 * Start the program if it is not running (or restart one left running from
 * older code), then open its page with a one-time pairing code in the
 * link's fragment. `cli` is the program's command line, run as
 * `cli run --dir DIR --port N` from `cwd`; its output goes to `log` in `dir`.
 */
export async function openProgram(o: { dir: string; port: number; cli: string; cwd: string; log: string; version: () => Promise<string> }) {
  const { dir, port } = o;
  let run = runFile(dir);
  // Only a program proven to be the one that wrote the run file counts as running.
  const pid = run ? await provenPid(run) : null;
  const said = run && pid ? await hello(run.port) : null;
  if (run && said && pid && said.version !== (await o.version())) {
    // Started before the code on disk changed: what it serves is older.
    console.log('restarting the program, left running from an older version');
    await stopOlder(run, pid);
    run = null;
  }
  if (!run || !said) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const log = openSync(join(dir, o.log), 'a', 0o600);
    const child = spawn(process.execPath, ['--import', 'tsx', o.cli, 'run', '--dir', dir, '--port', String(port)], {
      cwd: o.cwd,
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
    if (!run) throw new Error(`the program did not start: see ${join(dir, o.log)}`);
  }
  const r = await fetch(`http://127.0.0.1:${run.port}/local/code`, { method: 'POST', headers: { 'mor-local': run.secret }, signal: AbortSignal.timeout(3000) });
  const { code } = (await r.json()) as { code: string };
  const url = `http://127.0.0.1:${run.port}/#pair=${code}`;
  console.log(url);
  browse(url);
}

/**
 * Stop the running program: only one proven to be the one that wrote the
 * folder's run file (`provenPid`). Any other process, whatever the file
 * says, is never signalled.
 */
export async function stopProgram(dir: string): Promise<boolean> {
  const run = runFile(dir);
  const pid = run ? await provenPid(run) : null;
  if (!run || !pid) {
    console.log(run ? 'not running (its run file names no program of this folder: nothing was stopped)' : 'not running');
    return false;
  }
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    // already gone
  }
  console.log('stopped');
  return true;
}
