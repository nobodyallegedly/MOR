// Real homes and a relay on local ports (the relay program of step 4), the
// desk's program on another, a paired client that signs its requests
// exactly as the page does (`src/page/api.ts`, run here in Node), and the
// connector run as its own process, spoken to over MCP as Claude's app
// speaks to it, sharing a drafts folder with the desk. Nothing is mocked.

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { connect } from '../../connector/test/world.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type DraftView, type State } from '../src/page/api.ts';

export interface World {
  homes: Relay[];
  relay: Relay;
  app: Running;
  client: Client;
  drafts: string;
  claude: Awaited<ReturnType<typeof connect>>;
  stop(): Promise<void>;
}

export async function world(): Promise<World> {
  const homes = [await start('home'), await start('home'), await start('home')];
  const relay = await start('relay');
  const drafts = mkdtempSync(join(tmpdir(), 'mor-drafts-'));
  const app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-desk-')), port: 0, drafts });
  const client = await Client.open(await newKey(), app.base);
  await client.ask('pair', { code: app.access.newCode(), label: 'test' });
  await client.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts });
  // The connector knows the relay and one home, as it knows home1 and home2 when deployed.
  const claude = await connect({ MOR_RELAYS: `${relay.base},${homes[0].base}`, MOR_DRAFTS: drafts });
  return {
    homes,
    relay,
    app,
    client,
    drafts,
    claude,
    async stop() {
      await claude.close();
      await app.close();
      for (const h of [...homes, relay]) await h.stop();
    },
  };
}

export const state = (c: Client) => c.ask<State>('state');
export const waiting = (c: Client) => c.ask<DraftView[]>('drafts');

/** Everything the desk shows of a draft, as one text, to look for words in. */
export function words(d: DraftView): string {
  return [d.title, ...d.summary, ...d.blocking, ...d.sections.flatMap((s) => [s.heading, ...s.lines.map((l) => l.text)]), ...d.plain.map((p) => p.text), d.note ?? ''].join('\n');
}

/** The draft's digest, from what the connector told Claude. */
export function handed(text: string): string {
  const digest = /Draft digest: ([0-9a-f ]+)/.exec(text)?.[1].replace(/ /g, '');
  if (!digest || digest.length !== 64) throw new Error(`no draft handed over:\n${text}`);
  return digest;
}
