// The connector's settings, from its environment: where to look for acts,
// how to reach an address another way, and the folder where drafts wait for
// their owner's signature. Nothing here is secret: the connector holds no key.

import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Via } from '../../genesis/src/transport.ts';

export interface Config {
  /** Where acts are fetched first, and where identities are looked up. */
  relays: string[];
  /** Addresses reached another way: an onion home through its local port. */
  via: Via;
  /** Drafts waiting for a signature, and the acts their owner signed. */
  drafts: string;
  /**
   * The member's own checkout of the code: a release is compared with it,
   * file by file, before a member signs it (release manifest cMIP, rule 4,
   * client conformance). By default the MOR repository this connector is part of.
   */
  checkout: string;
}

/** The MOR repository this connector is part of. */
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** The deployed homes, which also serve acts (roadmap step 4). */
export const DEFAULT_RELAYS = ['https://home1.dubsar.org', 'https://home2.dubsar.org'];

const list = (s: string | undefined) =>
  (s ?? '')
    .split(/[\s,]+/)
    .map((x) => x.trim().replace(/\/$/, ''))
    .filter(Boolean);

/**
 * `MOR_RELAYS` (comma or space separated), `MOR_VIA` (`ADDRESS=LOCAL`, comma
 * separated), `MOR_DRAFTS` (default `~/mor-connector`), `MOR_CHECKOUT` (default: this repository).
 */
export function fromEnv(env: NodeJS.ProcessEnv = process.env): Config {
  const relays = list(env.MOR_RELAYS);
  const via: Via = {};
  for (const v of list(env.MOR_VIA)) {
    const i = v.indexOf('=');
    if (i > 0) via[v.slice(0, i).replace(/\/$/, '')] = v.slice(i + 1).replace(/\/$/, '');
  }
  return {
    relays: relays.length ? relays : DEFAULT_RELAYS,
    via,
    drafts: env.MOR_DRAFTS || join(homedir(), 'mor-connector'),
    checkout: env.MOR_CHECKOUT || ROOT,
  };
}

/** The relays to ask: the configured ones first, then any others named, each once. */
export function places(c: Config, ...more: (string[] | undefined)[]): string[] {
  const out = [...c.relays];
  for (const m of more) for (const r of m ?? []) if (!out.includes(r)) out.push(r);
  return out;
}
