// Which version of the program this is: a fingerprint of every source file
// it runs, here and in the other clients it uses, its page and the core
// library's WebAssembly. A program started before a pull answers with the
// fingerprint of the code it started from, so the launcher can tell that it
// is older than the code on disk, and restart it.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const pkg = fileURLToPath(new URL('../', import.meta.url));

/** The fingerprint of the program as it is on disk now, in hex. */
export const version = (): Promise<string> => fingerprint(pkg, ['src/cli.ts', 'src/page/app.ts']);

/**
 * The fingerprint of a program in the folder `pkg`: every file its
 * `entries` bundle, its `static/index.html` and the core library's
 * WebAssembly. Shared with MOR Post (`clients/poster`).
 */
export async function fingerprint(pkg: string, entries: string[]): Promise<string> {
  const out = await build({
    absWorkingDir: pkg,
    entryPoints: entries,
    bundle: true,
    write: false,
    outdir: 'out',
    format: 'esm',
    platform: 'node',
    packages: 'external',
    metafile: true,
    logLevel: 'silent',
  });
  const files = new Set(Object.keys(out.metafile.inputs).map((f) => resolve(pkg, f)));
  // Read at run time, not imported: the page's frame and the core library.
  files.add(resolve(pkg, 'static/index.html'));
  files.add(resolve(pkg, '../genesis/wasm/mor_wasm_bg.wasm'));
  const h = createHash('sha256');
  for (const f of [...files].sort()) {
    h.update(`${relative(pkg, f)}\n`);
    h.update(existsSync(f) ? readFileSync(f) : Buffer.alloc(0));
    h.update('\n');
  }
  return h.digest('hex');
}
