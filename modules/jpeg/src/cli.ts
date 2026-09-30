#!/usr/bin/env node
// mor-jpeg: read a JPEG as the JPEG Module does, or strip it to the picture alone.
//
//   mor-jpeg read <file.jpg>
//   mor-jpeg strip <in.jpg> <out.jpg>

import { readFileSync, writeFileSync } from 'node:fs';
import { CARRIED_WORDS, NotJpeg, read, strip, type Picture } from './jpeg.ts';

function describe(p: Picture): string[] {
  return [
    `picture: ${p.shownWidth} x ${p.shownHeight} pixels as shown` +
      (p.orientation !== 1 ? ` (stored ${p.width} x ${p.height}, orientation ${p.orientation})` : ''),
    `process: ${p.process}, ${p.precision}-bit, ${p.components} component${p.components === 1 ? '' : 's'}`,
    `colour: ${p.colourProfile ? 'an embedded colour profile' : p.components === 1 ? 'grey' : 'standard (sRGB)'}${p.adobe ? ", Adobe's colour coding" : ''}`,
    p.carries.length
      ? `carries besides the picture: ${p.carries.map((c) => CARRIED_WORDS[c]).join('; ')}`
      : 'carries nothing besides the picture',
  ];
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'read' && args.length === 1) {
    console.log(describe(read(new Uint8Array(readFileSync(args[0])))).join('\n'));
  } else if (cmd === 'strip' && args.length === 2) {
    const s = strip(new Uint8Array(readFileSync(args[0])));
    writeFileSync(args[1], s.bytes);
    console.log(s.removed.length ? `removed: ${s.removed.map((c) => CARRIED_WORDS[c]).join('; ')}` : 'nothing to remove');
    console.log(describe(s.picture).join('\n'));
  } else {
    console.error('usage: mor-jpeg read <file.jpg> | mor-jpeg strip <in.jpg> <out.jpg>');
    process.exit(2);
  }
} catch (e) {
  console.error(e instanceof NotJpeg ? `not a JPEG this Module reads: ${e.message}` : e);
  process.exit(1);
}
