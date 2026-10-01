// What both test files start from: real homes and a relay on local ports,
// run from the relay program of step 4; an owner (a test identity); a first
// post with the photograph, standing in for the first act; and the
// dubsar.org site, with that post's id in place of FIRST-ACT, published as
// a version of the owner's site.

import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { post } from '../../barebone/src/post.ts';
import { publishSite, readFolder, type Published } from '../src/publish.ts';
import { parseGatewaySettings, type GatewaySettings, type Serve } from '../src/settings.ts';

export const SITE_DIR = fileURLToPath(new URL('../../../docs/dubsar.org', import.meta.url));
export const phone = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)));

export interface World {
  homes: Running[];
  relay: Running;
  owner: TestIdentity;
  firstAct: string;
  /** The dubsar.org folder as published: FIRST-ACT replaced by the test post's id. */
  dir: string;
  site: Published;
  stop(): Promise<void>;
}

/** A copy of the dubsar.org folder with the first act's id filled in. */
export function siteCopy(firstAct: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'mor-site-'));
  cpSync(SITE_DIR, dir, { recursive: true });
  const index = join(dir, 'index.html');
  writeFileSync(index, readFileSync(index, 'utf8').replace('act="FIRST-ACT"', `act="${firstAct}"`));
  return dir;
}

export async function world(): Promise<World> {
  const homes = [await start('home'), await start('home')];
  const relay = await start('relay');
  const owner = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await owner.publishGenesis();
  const firstAct = (await post(owner, { text: 'Thank you for the shower… (a test post)', jpeg: phone, relays: [relay.base] })).id;
  const dir = siteCopy(firstAct);
  const site = await publishSite(owner, { name: 'dubsar.org', files: readFolder(dir), relays: [relay.base] });
  return {
    homes,
    relay,
    owner,
    firstAct,
    dir,
    site,
    async stop() {
      for (const r of [...homes, relay]) await r.stop();
    },
  };
}

/**
 * A gateway's settings carrying one site, at 127.0.0.1 (as the tests reach
 * it), from the world's relay; by default the owner's, following its latest.
 */
export function gatewayFor(
  w: World,
  version: string,
  o: { identity?: string; serve?: Serve; hosts?: string[]; more?: Record<string, unknown>[] } = {},
): GatewaySettings {
  return parseGatewaySettings({
    listen: '127.0.0.1:0',
    look: 0,
    sites: [
      { hosts: o.hosts ?? ['127.0.0.1'], version, identity: o.identity ?? w.owner.id, name: 'Nobody, allegedly', relays: [w.relay.base], serve: o.serve ?? 'latest' },
      ...(o.more ?? []),
    ],
  });
}
