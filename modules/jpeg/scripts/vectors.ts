// Write the JPEG Module's test vectors (vectors/jpeg.json): for each test
// picture, what the Module reads, what a posting client removes, and the
// stripped file (vectors/stripped/). vectors/check.py checks them with
// Pillow, a second, independent reader.
//
//   npm run vectors

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { NotJpeg, read, strip } from '../src/jpeg.ts';

const dir = new URL('../test/fixtures/', import.meta.url);
const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const vectors = [];
for (const name of readdirSync(dir).sort()) {
  const b = new Uint8Array(readFileSync(new URL(name, dir)));
  try {
    const p = read(b);
    const s = strip(b);
    writeFileSync(new URL(`../vectors/stripped/${name}`, import.meta.url), s.bytes);
    vectors.push({
      file: name,
      sha256: sha(b),
      picture: {
        width: p.width,
        height: p.height,
        orientation: p.orientation,
        shown: [p.shownWidth, p.shownHeight],
        components: p.components,
        process: p.process,
        colourProfile: p.colourProfile,
      },
      carries: [...p.carries].sort(),
      stripped: { file: `stripped/${name}`, sha256: sha(s.bytes), size: s.bytes.length },
    });
  } catch (e) {
    if (!(e instanceof NotJpeg)) throw e;
    vectors.push({ file: name, sha256: sha(b), notJpeg: e.message });
  }
}
writeFileSync(
  new URL('../vectors/jpeg.json', import.meta.url),
  JSON.stringify({ module: 'modules/module-jpeg-draft-1.md', fixtures: 'test/fixtures/', vectors }, null, 2) + '\n',
);
console.log(`${vectors.length} vectors`);
