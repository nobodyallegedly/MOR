// Add the MOR connector to the Claude desktop app on this Mac: one entry,
// "mor", in the app's settings file, starting the launcher of this folder.
// Everything else in the file is kept as it is, and a copy of the file as it
// was is kept beside it. Restart Claude afterwards.
//
//   npm run add-to-claude [-- --relay URL ... --via ADDRESS=LOCAL ...]

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const launcher = fileURLToPath(new URL('./mor-connector.sh', import.meta.url));

export function settingsFile(home = homedir()): string {
  return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
}

/** Add or replace the "mor" entry; returns the file's new text. */
export function addTo(text: string | null, env: Record<string, string>): string {
  const cfg = text?.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
  const servers = (cfg.mcpServers ?? {}) as Record<string, unknown>;
  servers.mor = { command: launcher, args: [], env };
  cfg.mcpServers = servers;
  return JSON.stringify(cfg, null, 2) + '\n';
}

function main() {
  const { values } = parseArgs({ options: { relay: { type: 'string', multiple: true }, via: { type: 'string', multiple: true }, file: { type: 'string' } } });
  const file = values.file ?? settingsFile();
  const env: Record<string, string> = {};
  if (values.relay?.length) env.MOR_RELAYS = values.relay.join(',');
  if (values.via?.length) env.MOR_VIA = values.via.join(',');
  const before = existsSync(file) ? readFileSync(file, 'utf8') : null;
  mkdirSync(dirname(file), { recursive: true });
  if (before !== null) copyFileSync(file, `${file}.before-mor`);
  writeFileSync(file, addTo(before, env));
  console.log(`Added the MOR connector to ${file}${before !== null ? ` (the file as it was: ${file}.before-mor)` : ''}.`);
  console.log('Quit Claude completely and open it again; then ask it, for example: "Read this MOR link: ..."');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
