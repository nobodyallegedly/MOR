#!/usr/bin/env node
// mor-audio read <sound.m4a>             what the audio Module reads from a recording, or why it refuses it
// mor-audio strip <in.m4a> <out.m4a>     the sound alone, as a publishing client strips it (rule 10)

import { readFileSync, writeFileSync } from 'node:fs';
import { CARRIED_WORDS, NotSound, read, strip } from './audio.ts';

const [cmd, a, b] = process.argv.slice(2);
try {
  if (cmd === 'read' && a) {
    const s = read(new Uint8Array(readFileSync(a)));
    console.log(JSON.stringify(s, null, 2));
    for (const c of s.carried) console.log(`carries: ${CARRIED_WORDS[c]}`);
  } else if (cmd === 'strip' && a && b) {
    const s = strip(new Uint8Array(readFileSync(a)));
    writeFileSync(b, s.bytes);
    console.log(s.removed.length ? `removed: ${s.removed.map((c) => CARRIED_WORDS[c]).join('; ')}` : 'nothing to remove');
  } else {
    console.error('usage: mor-audio read <sound.m4a> | mor-audio strip <in.m4a> <out.m4a>');
    process.exit(2);
  }
} catch (e) {
  if (e instanceof NotSound) {
    console.error(`not a recording this Module plays (${e.kind}): ${e.message}`);
    process.exit(1);
  }
  throw e;
}
