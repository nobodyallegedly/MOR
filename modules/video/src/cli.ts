#!/usr/bin/env node
// mor-video read <film.mp4>              what the video Module reads from a film, or why it refuses it
// mor-video strip <in.mp4> <out.mp4>     the film alone, as a publishing client strips it (rule 10)

import { readFileSync, writeFileSync } from 'node:fs';
import { CARRIED_WORDS, NotFilm, read, strip } from './video.ts';

const [cmd, a, b] = process.argv.slice(2);
try {
  if (cmd === 'read' && a) {
    const f = read(new Uint8Array(readFileSync(a)));
    console.log(JSON.stringify(f, null, 2));
    for (const c of f.carried) console.log(`carries: ${CARRIED_WORDS[c]}`);
  } else if (cmd === 'strip' && a && b) {
    const s = strip(new Uint8Array(readFileSync(a)));
    writeFileSync(b, s.bytes);
    console.log(s.removed.length ? `removed: ${s.removed.map((c) => CARRIED_WORDS[c]).join('; ')}` : 'nothing to remove');
  } else {
    console.error('usage: mor-video read <film.mp4> | mor-video strip <in.mp4> <out.mp4>');
    process.exit(2);
  }
} catch (e) {
  if (e instanceof NotFilm) {
    console.error(`not a film this Module plays (${e.kind}): ${e.message}`);
    process.exit(1);
  }
  throw e;
}
