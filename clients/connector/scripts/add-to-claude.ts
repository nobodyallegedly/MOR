// Add the MOR connector to the Claude desktop app on this Mac.
//
// The Claude app cannot start a program kept inside ~/Documents: macOS
// refuses it ("Operation not permitted"), even with Full Disk Access (human
// test, 2 October 2026). So this script first installs a runnable copy of
// the connector outside Documents, in one folder with nothing else in it:
//
//   ~/Library/Application Support/MOR/connector/
//     mor-connector.sh        what Claude's app starts
//     bin/mor-connector.mjs   the connector and its libraries, in one file
//     wasm/mor_wasm_bg.wasm   the core library
//
// Then it adds one entry, "mor", to the app's settings file, starting that
// copy. Everything else in the file is kept as it is. The first time, a copy
// of the file as it was is kept beside it (`.before-mor`); later runs never
// overwrite that copy. Run it again after pulling new code, to refresh the
// installed copy. Restart Claude afterwards.
//
//   npm run add-to-claude [-- --relay URL ... --via ADDRESS=LOCAL ... --dir FOLDER]

import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { build } from 'esbuild';

const here = fileURLToPath(new URL('..', import.meta.url));
const WASM = join(here, '..', 'genesis', 'wasm', 'mor_wasm_bg.wasm');

export function settingsFile(home = homedir()): string {
  return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
}

/** Where the runnable copy goes: outside ~/Documents, where Claude's app may start it. */
export function installDir(home = homedir()): string {
  return join(home, 'Library', 'Application Support', 'MOR', 'connector');
}

const LAUNCHER = `#!/bin/sh
# What Claude's app starts: the installed copy of the MOR connector, made by
# "npm run add-to-claude" from the MOR repository (clients/connector). The app
# may not give it the terminal's PATH, so the usual places for Node are added.
here=$(cd "$(dirname "$0")" && pwd)
PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
export PATH
exec node "$here/bin/mor-connector.mjs"
`;

/**
 * Install a runnable copy of the connector in `dir`, replacing any earlier
 * one; returns the launcher's path. The copy needs Node only: no
 * repository, no node_modules.
 */
export async function install(dir: string): Promise<string> {
  if (!existsSync(WASM)) throw new Error(`The core library is not built yet: in clients/genesis, run "npm install && npm run wasm" first.`);
  const next = `${dir}.new`;
  rmSync(next, { recursive: true, force: true });
  mkdirSync(join(next, 'wasm'), { recursive: true });
  await build({
    entryPoints: [join(here, 'src', 'server.ts')],
    outfile: join(next, 'bin', 'mor-connector.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    // Some libraries inside still call require(); give them one.
    banner: { js: "import { createRequire as __morRequire } from 'node:module'; const require = __morRequire(import.meta.url);" },
    logLevel: 'error',
  });
  // The core library reads its WebAssembly from ../wasm/, next to bin/.
  copyFileSync(WASM, join(next, 'wasm', 'mor_wasm_bg.wasm'));
  writeFileSync(join(next, 'mor-connector.sh'), LAUNCHER);
  chmodSync(join(next, 'mor-connector.sh'), 0o755);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dirname(dir), { recursive: true });
  renameSync(next, dir);
  return join(dir, 'mor-connector.sh');
}

/** Add or replace the "mor" entry; returns the file's new text. */
export function addTo(text: string | null, launcher: string, env: Record<string, string>): string {
  const cfg = text?.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
  const servers = (cfg.mcpServers ?? {}) as Record<string, unknown>;
  servers.mor = { command: launcher, args: [], env };
  cfg.mcpServers = servers;
  return JSON.stringify(cfg, null, 2) + '\n';
}

/**
 * Keep the settings file as it was before MOR was ever added, once: a copy
 * already there is the true original and is never overwritten. Returns the
 * copy's path, or null when there was no file to keep.
 */
export function keepOriginal(file: string): string | null {
  const copy = `${file}.before-mor`;
  if (existsSync(copy)) return copy;
  if (!existsSync(file)) return null;
  copyFileSync(file, copy);
  return copy;
}

/** Install the copy, then point Claude's settings at it. */
export async function addToClaude(o: { file: string; dir: string; env: Record<string, string> }): Promise<{ launcher: string; original: string | null }> {
  const launcher = await install(o.dir);
  const before = existsSync(o.file) ? readFileSync(o.file, 'utf8') : null;
  mkdirSync(dirname(o.file), { recursive: true });
  const original = keepOriginal(o.file);
  writeFileSync(o.file, addTo(before, launcher, o.env));
  return { launcher, original };
}

async function main() {
  const { values } = parseArgs({
    options: { relay: { type: 'string', multiple: true }, via: { type: 'string', multiple: true }, file: { type: 'string' }, dir: { type: 'string' } },
  });
  const env: Record<string, string> = {};
  if (values.relay?.length) env.MOR_RELAYS = values.relay.join(',');
  if (values.via?.length) env.MOR_VIA = values.via.join(',');
  const file = values.file ?? settingsFile();
  const r = await addToClaude({ file, dir: values.dir ?? installDir(), env });
  console.log(`Installed the MOR connector in ${dirname(r.launcher)}`);
  console.log(`(outside Documents: the Claude app may not start programs kept in ~/Documents).`);
  console.log(`Added it to ${file}${r.original ? ` (the file as it was before MOR: ${r.original})` : ''}.`);
  console.log('Quit Claude completely and open it again; then ask it, for example: "Read this MOR link: ..."');
  console.log('After pulling new code, run "npm run add-to-claude" again to refresh the installed copy.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
