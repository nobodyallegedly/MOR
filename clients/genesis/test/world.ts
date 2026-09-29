// Real homes and relays on local ports, run from the relay program of step 4
// (`mor-relay`), each home under its own test operator. Nothing is mocked:
// the client talks to them over HTTP exactly as it would to the public homes.

import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import type { Home } from '../src/identity.ts';

const root = new URL('../../../', import.meta.url).pathname;
const bin = join(root, 'target/debug/mor-relay');

let built = false;
function build() {
  if (built) return;
  execFileSync('cargo', ['build', '-q', '-p', 'mor-relay'], { cwd: root, stdio: 'inherit' });
  built = true;
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const a = s.address();
      if (a && typeof a === 'object') s.close(() => resolve(a.port));
      else reject(new Error('no port'));
    });
  });
}

export class Running {
  proc: ChildProcess | null = null;
  constructor(
    readonly dir: string,
    readonly port: number,
    readonly base: string,
    readonly operator: string | null,
  ) {}

  get home(): Home {
    return { operator: this.operator, hint: this.base };
  }

  async start(): Promise<void> {
    this.proc = spawn(bin, ['run', '--dir', this.dir, '--listen', `127.0.0.1:${this.port}`, '--allow-http'], {
      stdio: 'ignore',
    });
    for (let i = 0; i < 100; i++) {
      try {
        const r = await fetch(`${this.base}/info`);
        if (r.ok) return;
      } catch {
        // not up yet
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(`relay at ${this.base} did not start`);
  }

  async stop(): Promise<void> {
    if (!this.proc) return;
    const p = this.proc;
    this.proc = null;
    await new Promise<void>((resolve) => {
      p.on('exit', () => resolve());
      p.kill('SIGTERM');
    });
  }

  allow(identity: string): void {
    execFileSync(bin, ['allow', '--dir', this.dir, identity]);
  }
}

/** A home (under a new test operator) or a basic relay, set up and running. */
export async function start(role: 'home' | 'relay', opts: { allowlist?: boolean } = {}): Promise<Running> {
  build();
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const dir = mkdtempSync(join(tmpdir(), 'mor-genesis-test-'));
  const args = ['init', '--dir', dir, '--role', role, '--base', base, '--local-test'];
  if (role === 'home') args.push('--new-test-operator');
  if (opts.allowlist) args.push('--allowlist');
  const out = execFileSync(bin, args, { encoding: 'utf8' });
  const m = out.match(/Operator[^:]*: ([0-9a-f]{64})/);
  const r = new Running(dir, port, base, m ? m[1] : null);
  await r.start();
  return r;
}
