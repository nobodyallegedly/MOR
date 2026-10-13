#!/usr/bin/env -S node --import tsx
// mor-dub: start Dub and open its page. Used once from a terminal to
// make the app (scripts/make-app.sh), and then by the app itself: after
// that, nothing is typed.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openProgram, stopProgram } from '../../desk/src/launch.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { groupId, toWords } from '../../../modules/carry/src/carry.ts';
import { serve } from './server.ts';
import { BUILT, WEB_FILES } from './web/released.ts';
import { version } from './version.ts';

const HELP = `mor-dub: Dub. Write a text, add a picture, post, and see it published, verified.
TEST IDENTITIES ONLY, until MOR is frozen: every key is held in software, in its folder.

  open  [--dir DIR] [--port N]   Start the program if it is not running, and open
                                 its page in the browser, paired by a one-time link.
  run   [--dir DIR] [--port N]   Run the program here, in the foreground.
  stop  [--dir DIR]              Stop the running program.
  check URL [--built DIR]        Compare Dub's web client as a server serves it
                                 (https://dub.dubsar.org/) with the release in
                                 built/, byte for byte: SAME, or each file that differs.
  words --file FILE              For a test identity made by the genesis client:
                                 print its ID and its signing seed's words (the
                                 identity carry Module), to bring it into Dub.

The folder defaults to ~/mor-dub (or ~/mor-poster, the folder of an install
from before Dub was renamed, while ~/mor-dub does not exist), the port to 8472.
The page is at http://127.0.0.1:PORT/ on this machine only.`;

const pkg = fileURLToPath(new URL('../', import.meta.url));

/**
 * The program's folder when none is given: ~/mor-dub. Dub was called MOR
 * Post until 13 October 2026, with its folder at ~/mor-poster: an install
 * from before keeps that folder, its identity and its paired browsers, for
 * as long as ~/mor-dub does not exist.
 */
export function defaultDir(home = homedir()): string {
  const dub = join(home, 'mor-dub');
  const old = join(home, 'mor-poster');
  return !existsSync(dub) && existsSync(old) ? old : dub;
}

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
  const dir = resolve(o.dir ?? defaultDir());
  const port = Number(o.port ?? 8472);
  switch (cmd) {
    case 'run': {
      const r = await serve({ dir, port });
      console.log(`mor-dub: ${r.base}/ (folder ${dir})`);
      const stop = () => void r.close().then(() => process.exit(0));
      process.on('SIGTERM', stop);
      process.on('SIGINT', stop);
      break;
    }
    case 'open':
      await openProgram({ dir, port, cli: fileURLToPath(import.meta.url), cwd: pkg, log: 'dub.log', version });
      break;
    case 'stop':
      stopProgram(dir);
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
    case 'words': {
      if (!o.file) throw new Error('--file is needed');
      const me = TestIdentity.load(o.file);
      console.log(`ID:    ${groupId(me.id)}`);
      console.log(`Words: ${toWords(unhex(me.f.signingSecret)).join(' ')}`);
      console.log('Whoever holds these words can post as this identity. The chain key is not in them.');
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
