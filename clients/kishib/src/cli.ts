#!/usr/bin/env -S node --import tsx
// mor-kishib: start Kišib and open its page. Used once from a terminal to
// make the app (scripts/make-app.sh, make-desktop.sh), and then by the app
// itself: after that, nothing is typed.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openProgram, stopProgram } from '../../desk/src/launch.ts';
import { serve } from './server.ts';
import { BUILT, WEB_FILES } from './web/released.ts';
import { version } from './version.ts';

const HELP = `mor-kishib: Kišib, the one place where a chain key is used, from paper, and then forgotten.
TEST IDENTITIES ONLY, until MOR is frozen. It writes no word or key to its folder: the folder
holds only which browsers are paired with it.

  open  [--dir DIR] [--port N]   Start the program if it is not running, and open
                                 its page in the browser, paired by a one-time link.
  run   [--dir DIR] [--port N]   Run the program here, in the foreground.
  stop  [--dir DIR]              Stop the running program (what it held is gone).
  check URL [--built DIR]        Compare Kišib's web client as a server serves it
                                 (https://kishib.dubsar.org/) with the release in
                                 built/, byte for byte: SAME, or each file that differs.

The folder defaults to ~/mor-kishib, the port to 8474.
The page is at http://127.0.0.1:PORT/ on this machine only.`;

const pkg = fileURLToPath(new URL('../', import.meta.url));

function parse(argv: string[]) {
  const o: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
  return o;
}

/** Each file of the web client a server serves, against the release: the files that differ, with why. */
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
  const dir = resolve(o.dir ?? join(homedir(), 'mor-kishib'));
  const port = Number(o.port ?? 8474);
  switch (cmd) {
    case 'run': {
      // Quit Kišib (its page, or its seal in the menu bar): the runner locked, then the program ends (the Dubsar runner cMIP, draft 3).
      const r = await serve({ dir, port, quit: () => stop() });
      console.log(`mor-kishib: ${r.base}/ (folder ${dir})`);
      const stop = () => void r.close().then(() => process.exit(0));
      process.on('SIGTERM', stop);
      process.on('SIGINT', stop);
      break;
    }
    case 'open':
      await openProgram({ dir, port, cli: fileURLToPath(import.meta.url), cwd: pkg, log: 'kishib.log', version });
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

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
