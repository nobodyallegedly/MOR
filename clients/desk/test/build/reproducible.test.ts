// `npm run test:build`: Edubba's web client built from these sources is the
// release in built/, byte for byte, when this machine's tools are those
// built/BUILT-WITH.txt names (otherwise it fails saying which differ, rather
// than pass). As Dub's, Kišib's, Damgar's and Ummia's.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILT, WEB_FILES } from '../../src/web/released.ts';

const digest = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

const here = fileURLToPath(new URL('../..', import.meta.url));

test('built here, the same as the release', () => {
  const listed = readFileSync(join(BUILT, 'BUILT-WITH.txt'), 'utf8');
  const tool = (name: string) => new RegExp(`^${name}: (.*)$`, 'm').exec(listed)?.[1];
  const esbuild = JSON.parse(readFileSync(join(here, 'node_modules/esbuild/package.json'), 'utf8')).version;
  const mine = {
    rustc: execFileSync('rustc', ['-V'], { encoding: 'utf8' }).trim(),
    'wasm-bindgen': execFileSync('wasm-bindgen', ['--version'], { encoding: 'utf8' }).trim(),
    esbuild,
  };
  for (const [k, v] of Object.entries(mine)) assert.equal(v, tool(k), `${k} differs from the release's: rebuild with the release's tools`);
  const out = mkdtempSync(join(tmpdir(), 'edubba-release-'));
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build-web.ts', '--out', out], { cwd: here, stdio: 'ignore' });
  // By digest: a diff of two differing WebAssembly files would exhaust the machine's memory.
  for (const f of WEB_FILES) assert.equal(digest(readFileSync(join(out, f))), digest(readFileSync(join(BUILT, f))), `${f} is not the released bytes: release again (npm run release)`);
});
