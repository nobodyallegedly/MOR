#!/usr/bin/env -S node --import tsx
// mor-desk: start Edubba (called MOR Identities until 16 October 2026, F333)
// and open its page. Used once
// from a terminal to set up the launcher (scripts/make-app.sh), and then by
// the launcher itself: after that, nothing is typed.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './server.ts';
import { version } from './version.ts';
import { openProgram, stopProgram, runFile } from './launch.ts';
import { chainFrom, rememberRegtest } from '../../damgar/src/chain.ts';
import { BUILT, WEB_FILES } from './web/released.ts';

const HELP = `mor-desk: Edubba, the tablet house: agents, identities and collectives, with no command line.
TEST IDENTITIES ONLY: every key is held in software, in its folders.

  open [--dir DIR] [--collective DIR] [--port N] [--regtest RUN_DIR]
                                Start the program if it is not running, and open its page in
                                the browser, paired by a one-time link. With --regtest, Edubba
                                follows that regtest network's chain, to check Bitcoin anchors.
  run  [--dir DIR] [--collective DIR] [--port N]   Run the program here, in the foreground.
  stop [--dir DIR]              Stop the running program.
  check URL [--built DIR]       Compare Edubba's web client (testing only) as a server serves it
                                with the release in built/, byte for byte.

The folder defaults to ~/edubba, or ~/mor-desk where MOR Identities was installed
(read where it is); the collectives' folder to ~/mor-collective where the
collective client was installed (read where it is), else ~/edubba/collective.
The port is 8471. The page is at http://127.0.0.1:PORT/ on this machine only.`;

/**
 * The program's folder when none is given: ~/edubba. Edubba was called MOR
 * Identities until 16 October 2026, with its folder at ~/mor-desk: an
 * install from before keeps that folder, read where it is (its identities,
 * Machine, allegedly's terms and history, its pairings), for as long as
 * ~/edubba does not exist, as Dub reads ~/mor-poster.
 */
export function defaultDir(home = homedir()): string {
  const edubba = join(home, 'edubba');
  const old = join(home, 'mor-desk');
  return !existsSync(edubba) && existsSync(old) ? old : edubba;
}

/**
 * The collective client's folder, taken in (F333): ~/mor-collective where
 * the collective client kept it, read where it is; else inside Edubba's.
 */
export function collectiveDir(dir: string, home = homedir()): string {
  const old = join(home, 'mor-collective');
  return existsSync(old) ? old : join(dir, 'collective');
}

const pkg = fileURLToPath(new URL('../', import.meta.url));

function parse(argv: string[]) {
  const o: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
  return o;
}

/** What differs between the web client a server serves at `url` and the release in `built`: nothing, when it serves the release. */
export async function check(url: string, built: string = BUILT): Promise<string[]> {
  const base = url.endsWith('/') ? url : `${url}/`;
  const out: string[] = [];
  for (const f of WEB_FILES) {
    const want = new Uint8Array(readFileSync(join(built, f)));
    let got: Uint8Array;
    try {
      const r = await fetch(new URL(f === 'index.html' ? '' : f, base), { cache: 'no-store' });
      if (!r.ok) throw new Error(`answered ${r.status}`);
      got = new Uint8Array(await r.arrayBuffer());
    } catch (e) {
      out.push(`${f}: not served (${e instanceof Error ? e.message : e})`);
      continue;
    }
    if (Buffer.compare(Buffer.from(got), Buffer.from(want)) !== 0) out.push(`${f}: not the released bytes`);
  }
  return out;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = parse(rest);
  const dir = resolve(o.dir ?? defaultDir());
  const collective = resolve(o.collective ?? collectiveDir(dir));
  const port = Number(o.port ?? 8471);
  switch (cmd) {
    case 'run': {
      const r = await serve({ dir, port, collective, chain: chainFrom(dir, o.regtest) });
      console.log(`mor-desk: ${r.base}/ (folder ${dir})`);
      const stop = () => void r.close().then(() => process.exit(0));
      process.on('SIGTERM', stop);
      process.on('SIGINT', stop);
      break;
    }
    case 'open':
      // The collective client's own program, if left running, holds the same
      // folder: it is stopped, so two programs never sign from one file.
      if (runFile(collective)) await stopProgram(collective);
      if (o.regtest) rememberRegtest(dir, o.regtest);
      await openProgram({ dir, port, cli: fileURLToPath(import.meta.url), cwd: pkg, log: 'desk.log', version });
      break;
    case 'stop':
      await stopProgram(dir);
      break;
    case 'check': {
      const url = rest.find((a) => !a.startsWith('--') && a !== o.built);
      if (!url) throw new Error('check URL: the address the web client is served at');
      const differ = await check(url, o.built ?? BUILT);
      if (differ.length) {
        for (const d of differ) console.log(`DIFFERS  ${d}`);
        process.exitCode = 1;
      } else console.log(`SAME: ${url} serves the release (${WEB_FILES.join(', ')})`);
      break;
    }
    default:
      console.log(HELP);
  }
}

// Run as a command, not when a test imports `check`.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
