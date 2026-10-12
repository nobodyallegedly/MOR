#!/usr/bin/env -S node --import tsx
// mor-poster: start MOR Post and open its page. Used once from a terminal to
// make the app (scripts/make-app.sh), and then by the app itself: after
// that, nothing is typed.

import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openProgram, stopProgram } from '../../desk/src/launch.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { groupId, toWords } from '../../../modules/carry/src/carry.ts';
import { serve } from './server.ts';
import { version } from './version.ts';

const HELP = `mor-poster: MOR Post. Write a text, add a picture, post, and see it published, verified.
TEST IDENTITIES ONLY, until MOR is frozen: every key is held in software, in its folder.

  open  [--dir DIR] [--port N]   Start the program if it is not running, and open
                                 its page in the browser, paired by a one-time link.
  run   [--dir DIR] [--port N]   Run the program here, in the foreground.
  stop  [--dir DIR]              Stop the running program.
  words --file FILE              For a test identity made by the genesis client:
                                 print its ID and its signing seed's words (the
                                 identity carry Module), to bring it into MOR Post.

The folder defaults to ~/mor-poster, the port to 8472. The page is at
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
  const dir = resolve(o.dir ?? join(homedir(), 'mor-poster'));
  const port = Number(o.port ?? 8472);
  switch (cmd) {
    case 'run': {
      const r = await serve({ dir, port });
      console.log(`mor-poster: ${r.base}/ (folder ${dir})`);
      const stop = () => void r.close().then(() => process.exit(0));
      process.on('SIGTERM', stop);
      process.on('SIGINT', stop);
      break;
    }
    case 'open':
      await openProgram({ dir, port, cli: fileURLToPath(import.meta.url), cwd: pkg, log: 'poster.log', version });
      break;
    case 'stop':
      stopProgram(dir);
      break;
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

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
