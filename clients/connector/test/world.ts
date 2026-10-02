// Real homes and a relay on local ports (the relay program of step 4), a test
// collective with a release (the repo client of step 5a), and the connector
// run as its own process, spoken to over stdio by an MCP client exactly as
// Claude's app speaks to it. Nothing is mocked.

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { TestCollective, type Governance } from '../../repo/src/collective.ts';
import { publishRelease, signRelease, type FileIn } from '../../repo/src/release.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const bytes = (s: string) => new TextEncoder().encode(s);

export const governance: Governance = {
  safetyThreshold: 2,
  releaseThreshold: 2,
  cloneThreshold: 2,
  abandonmentOthers: 2,
  text: 'The connector test collective. It publishes releases of a test tree and nothing else. Its everyday key is held by one member; its safety key is split among the members, any two of whom rebuild it. A release counts only when two members have signed it, each with an act of their own. Members change by a clone of this agreement, signed by any two members and by each member who joins, and a rotation of the collective declaring it. The other two members together decide whether a member is absent; the outcome is that member losing their voice.',
};

export const files: FileIn[] = [
  { path: 'README.md', bytes: bytes('# A test tree\n') },
  { path: 'src/lib.rs', bytes: bytes('pub fn one() -> u8 { 1 }\n') },
];

export interface World {
  homes: Running[];
  relay: Running;
  /** Four test identities: three found the collective, the fourth is outside it. */
  members: TestIdentity[];
  /** Each member's identity file, as its owner's signer keeps it. */
  files: string[];
  collective: TestCollective;
  /** A release signed by one member of the two it needs. */
  release: string;
  drafts: string;
  stop(): Promise<void>;
}

export async function world(): Promise<World> {
  const homes = [await start('home'), await start('home'), await start('home')];
  const relay = await start('relay');
  const keys = mkdtempSync(join(tmpdir(), 'mor-connector-keys-'));
  const members: TestIdentity[] = [];
  const paths: string[] = [];
  for (let i = 0; i < 4; i++) {
    const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
    await t.publishGenesis();
    members.push(t);
  }
  const { collective } = await TestCollective.found({
    members: members.slice(0, 3),
    homes: homes.map((h) => h.home),
    relays: [relay.base, homes[0].base],
    governance,
    scheme: 3,
  });
  const p = await publishRelease(collective, { name: 'Connector test tree', version: '1', files, source: 'a test' });
  await signRelease(members[0], p.id, collective.f.relays);
  members.forEach((m, i) => {
    paths.push(join(keys, `m${i}.json`));
    m.save(paths[i]);
  });
  return {
    homes,
    relay,
    members,
    files: paths,
    collective,
    release: p.id,
    drafts: mkdtempSync(join(tmpdir(), 'mor-connector-drafts-')),
    async stop() {
      for (const r of [...homes, relay]) await r.stop();
    },
  };
}

/** The connector, started as Claude's app starts it, and a client speaking MCP to it. */
export async function connect(env: Record<string, string>, opts: { launcher?: boolean } = {}): Promise<{ client: Client; ask: (tool: string, args: object) => Promise<{ text: string; isError: boolean }>; close: () => Promise<void> }> {
  const transport = new StdioClientTransport({
    // The launcher is what Claude's app starts, from whatever folder it likes.
    command: opts.launcher ? join(here, 'scripts/mor-connector.sh') : process.execPath,
    args: opts.launcher ? [] : ['--import', 'tsx', join(here, 'src/server.ts')],
    cwd: opts.launcher ? '/' : here,
    env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', ...env },
    stderr: 'inherit',
  });
  const client = new Client({ name: 'connector-test', version: '0' });
  await client.connect(transport);
  return {
    client,
    async ask(tool, args) {
      const r = (await client.callTool({ name: tool, arguments: args as Record<string, unknown> })) as { content: { type: string; text: string }[]; isError?: boolean };
      return { text: r.content.map((c) => c.text).join('\n'), isError: !!r.isError };
    },
    close: () => client.close(),
  };
}
