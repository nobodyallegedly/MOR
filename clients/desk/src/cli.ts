#!/usr/bin/env -S node --import tsx
// mor-desk: start MOR Identities (the owner's desk) and open its page. Used once
// from a terminal to set up the launcher (scripts/make-app.sh), and then by
// the launcher itself: after that, nothing is typed.

import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './server.ts';
import { version } from './version.ts';
import { openProgram, stopProgram } from './launch.ts';

const HELP = `mor-desk: MOR Identities, the owner's desk: a client with no command line for several test identities.
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
      await openProgram({ dir, port, cli: fileURLToPath(import.meta.url), cwd: pkg, log: 'desk.log', version });
      break;
    case 'stop':
      stopProgram(dir);
      break;
    default:
      console.log(HELP);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
