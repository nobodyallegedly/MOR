#!/usr/bin/env -S node --import tsx
// mor-desk: start Edubba (called MOR Identities until 16 October 2026, F333)
// and open its page. Used once
// from a terminal to set up the launcher (scripts/make-app.sh), and then by
// the launcher itself: after that, nothing is typed.

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './server.ts';
import { version } from './version.ts';
import { openProgram, stopProgram, runFile } from './launch.ts';

const HELP = `mor-desk: Edubba, the tablet house: agents, identities and collectives, with no command line.
TEST IDENTITIES ONLY: every key is held in software, in its folders.

  open [--dir DIR] [--collective DIR] [--port N]   Start the program if it is not running,
                                and open its page in the browser, paired by a one-time link.
  run  [--dir DIR] [--collective DIR] [--port N]   Run the program here, in the foreground.
  stop [--dir DIR]              Stop the running program.

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

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = parse(rest);
  const dir = resolve(o.dir ?? defaultDir());
  const collective = resolve(o.collective ?? collectiveDir(dir));
  const port = Number(o.port ?? 8471);
  switch (cmd) {
    case 'run': {
      const r = await serve({ dir, port, collective });
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
      await openProgram({ dir, port, cli: fileURLToPath(import.meta.url), cwd: pkg, log: 'desk.log', version });
      break;
    case 'stop':
      await stopProgram(dir);
      break;
    default:
      console.log(HELP);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
