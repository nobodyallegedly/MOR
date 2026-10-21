// Write the audio Module's test vectors (vectors/audio.json and
// vectors/stripped/) from the test recordings in test/fixtures/: for each,
// what a reader reads from it, or why the Module refuses it; for each
// recording, its stripped file. `python3 vectors/check.py` then checks them
// with ffprobe and ffmpeg, readers independent of this one.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NotSound, read, strip } from '../src/audio.ts';

const fixtures = fileURLToPath(new URL('../test/fixtures/', import.meta.url));
const vectors = fileURLToPath(new URL('../vectors/', import.meta.url));
const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

rmSync(`${vectors}stripped`, { recursive: true, force: true });
mkdirSync(`${vectors}stripped`);
const out = [];
for (const file of readdirSync(fixtures).filter((f) => f.endsWith('.m4a')).sort()) {
  const bytes = new Uint8Array(readFileSync(fixtures + file));
  try {
    const sound = read(bytes);
    const s = strip(bytes);
    writeFileSync(`${vectors}stripped/${file}`, s.bytes);
    out.push({ file, sha256: sha256(bytes), sound, stripped: { file: `stripped/${file}`, sha256: sha256(s.bytes), removed: s.removed } });
  } catch (e) {
    if (!(e instanceof NotSound)) throw e;
    out.push({ file, sha256: sha256(bytes), refused: { kind: e.kind, reason: e.message } });
  }
}
writeFileSync(
  `${vectors}audio.json`,
  `${JSON.stringify({ module: 'modules/module-audio-draft-1.md', fixtures: '../test/fixtures', vectors: out }, null, 2)}\n`,
);
console.log(`${out.length} vectors`);
