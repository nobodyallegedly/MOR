// What Nakišib's tests share: its program, built from this folder and run
// on a free loopback port with a folder of its own, asked as its page asks
// (the same requests, the same header); and Kišib, Dub and real homes and a
// relay on local ports, from Kišib's own tests (`../../kishib/test/world.ts`).

import assert from 'node:assert/strict';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export { apps, closeAll, dub, kishib, start, refused, type Relay } from '../../kishib/test/world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
export const BIN = join(here, 'target/debug/nakisib');

let built = false;
/** Nakišib's program, built once per run (the page in built/ carried inside it). */
export function build() {
  if (built) return;
  execFileSync('cargo', ['build', '-q', '--locked', '--manifest-path', join(here, 'Cargo.toml')], { stdio: 'inherit' });
  built = true;
}

export interface Nakisib {
  base: string;
  dir: string;
  proc: ChildProcess;
  ask<T = Record<string, unknown>>(op: string, body?: Record<string, unknown>): Promise<T>;
  stop(): Promise<void>;
}

const running: Nakisib[] = [];

/** Nakišib started on a free port; `wrap` runs it under another program (strace, for the no-network test). */
export async function nakisib(o: { dir?: string; wrap?: string[] } = {}): Promise<Nakisib> {
  build();
  const dir = o.dir ?? join(mkdtempSync(join(tmpdir(), 'nakisib-')), 'mor-nakisib');
  const args = ['--dir', dir, '--port', '0', '--no-open'];
  const proc = o.wrap ? spawn(o.wrap[0], [...o.wrap.slice(1), BIN, ...args]) : spawn(BIN, args);
  const base = await new Promise<string>((ok, no) => {
    let out = '';
    proc.stdout!.on('data', (d) => {
      out += String(d);
      const m = /nakisib: (http:\/\/127\.0\.0\.1:\d+\/)/.exec(out);
      if (m) ok(m[1]);
    });
    proc.stderr!.on('data', (d) => process.env.NAKISIB_DEBUG && process.stderr.write(d));
    proc.on('exit', (c) => no(new Error(`nakisib ended (${c}): ${out}`)));
  });
  const n: Nakisib = {
    base,
    dir,
    proc,
    async ask<T>(op: string, body: Record<string, unknown> = {}) {
      const r = await fetch(`${base}api/${op}`, { method: 'POST', headers: { 'x-nakisib': '1', 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = (await r.json()) as T & { error?: string };
      if (!r.ok) throw new Error(j.error ?? `refused (${r.status})`);
      return j;
    },
    async stop() {
      if (proc.exitCode === null) {
        await new Promise<void>((ok) => {
          proc.once('exit', () => ok());
          proc.kill('SIGTERM');
        });
      }
      running.splice(running.indexOf(n), 1);
    },
  };
  running.push(n);
  return n;
}

export async function stopAll() {
  for (const n of [...running]) await n.stop();
}

/** A paper walked on Nakišib: shown, hidden, (a wrong part refused, nothing signed), three typed back. Returns its parts. */
export async function walkPaper(n: Nakisib, wrongFirst = true): Promise<string[]> {
  const shown = await n.ask<{ parts: string[]; say: string[] }>('show');
  const st = await n.ask<{ asked: number[] }>('hide');
  if (wrongFirst) {
    await assert.rejects(n.ask('typed', { typed: ['zoo', 'zoo', 'zoo'] }), /not the backup shown/);
  }
  await n.ask('typed', { typed: st.asked.map((i) => shown.parts[i - 1]) });
  return shown.parts;
}

/** Every file in a folder, read whole, by name. */
export function folder(dir: string): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else out.set(p.slice(dir.length + 1), readFileSync(p));
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}
