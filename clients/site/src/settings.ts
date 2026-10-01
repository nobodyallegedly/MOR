// The gateway's settings: a small file the operator writes, never built into
// the code. Nothing in it is signed (website cMIP, rule 21): the version is
// checked against the relays, and the display client shows the signer's
// fingerprint, so that a visitor who knows it can tell. The same checks run
// on the server and in the browser, which reads the part the gateway hands
// it for the site at its address, at `/_mor/site.json`.
//
// A gateway carries only the sites its operator lists (cMIP rule 22,
// decided by Nobody, allegedly, 1 October 2026). For each, the operator says
// how the version served is chosen (rule 23): `latest`, the publisher's
// latest version, followed from the one named (the default); or `pinned`,
// the version named and no other.

/** How the gateway chooses the version it serves of one site (cMIP rule 23). */
export type Serve = 'latest' | 'pinned';

/** What the display client is told about the site at its address. */
export interface SiteSettings {
  /** The version served: its publication's act id. */
  version: string;
  /** The identity whose site it must be. */
  identity: string;
  /** What the operator calls that identity: shown as the operator's words. */
  name: string;
  /** Where the version, its signer's chain, later versions and the acts its pages show are fetched. */
  relays: string[];
  /** The release of the display client this gateway runs (rule 20), if the operator names one. */
  release: string | null;
  /** How the gateway chose the version served. */
  serve: Serve;
}

/** One site in the gateway's file. */
export interface SiteEntry {
  /** The host names it is served at: a domain, an onion address. */
  hosts: string[];
  identity: string;
  name: string;
  relays: string[];
  /** Pinned: the version served. Latest: the version followed from. */
  version: string;
  serve: Serve;
}

export interface GatewaySettings {
  /** Where the server listens, e.g. 127.0.0.1:8090 behind Caddy. */
  listen: string;
  release: string | null;
  /** Seconds between looks for later versions of the sites it follows; 0: only at start and on reload. */
  look: number;
  sites: SiteEntry[];
}

const HEX64 = /^[0-9a-f]{64}$/;
/** A host name as a browser sends it, lower-case, without a port. */
const HOST = /^(?=.{1,253}$)[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;

/** A relay's base address: https, or http on this machine only (tests, a local relay). */
export function relayAddress(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const local = u.hostname === '127.0.0.1' || u.hostname === 'localhost' || u.hostname === '[::1]';
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) return null;
  if (u.username || u.password || u.search || u.hash) return null;
  return s.replace(/\/$/, '');
}

/** The host name a request was made to: lower-case, without its port. */
export function hostOf(header: string | undefined): string | null {
  if (!header) return null;
  const h = header.trim().toLowerCase();
  if (h.startsWith('[')) return null;
  const name = h.replace(/:\d{1,5}$/, '').replace(/\.$/, '');
  return HOST.test(name) ? name : null;
}

function common(o: Record<string, unknown>, where: string) {
  if (typeof o.version !== 'string' || !HEX64.test(o.version)) throw new Error(`${where}: "version" must be an act id, 64 hex digits`);
  if (typeof o.identity !== 'string' || !HEX64.test(o.identity)) throw new Error(`${where}: "identity" must be 64 hex digits`);
  const name = typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'the owner of this identity';
  const relays = (Array.isArray(o.relays) ? o.relays : []).map(relayAddress);
  if (!relays.length || relays.some((r) => r === null)) throw new Error(`${where}: "relays" must list https addresses`);
  const serve = o.serve ?? 'latest';
  if (serve !== 'latest' && serve !== 'pinned') throw new Error(`${where}: "serve" is "latest" or "pinned"`);
  return { version: o.version, identity: o.identity, name, relays: relays as string[], serve: serve as Serve };
}

function release(v: unknown, where: string): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'string' || !HEX64.test(v)) throw new Error(`${where}: "release" must be an act id, 64 hex digits`);
  return v;
}

/** Read and check the settings a visitor's browser gets; anything malformed is an error, not a guess. */
export function parseSiteSettings(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== 'object') throw new Error('the settings are not an object');
  const o = raw as Record<string, unknown>;
  return { ...common(o, 'settings'), release: release(o.release, 'settings') };
}

export function parseGatewaySettings(raw: unknown): GatewaySettings {
  if (!raw || typeof raw !== 'object') throw new Error('the settings are not an object');
  const o = raw as Record<string, unknown>;
  const listen = typeof o.listen === 'string' ? o.listen : '127.0.0.1:8090';
  if (!/^[^\s:]+:\d{1,5}$/.test(listen) && !/^\[[0-9a-f:]+\]:\d{1,5}$/i.test(listen)) throw new Error('settings: "listen" must be host:port');
  const look = o.look ?? 600;
  if (typeof look !== 'number' || !Number.isInteger(look) || look < 0) throw new Error('settings: "look" is a whole number of seconds');
  if (!Array.isArray(o.sites) || !o.sites.length) throw new Error('settings: "sites" lists the sites this gateway carries');
  const taken = new Set<string>();
  const sites = o.sites.map((s: unknown, i: number): SiteEntry => {
    const where = `settings: site ${i + 1}`;
    if (!s || typeof s !== 'object') throw new Error(`${where} is not an object`);
    const e = s as Record<string, unknown>;
    const hosts = Array.isArray(e.hosts) ? e.hosts : [];
    if (!hosts.length) throw new Error(`${where}: "hosts" lists the addresses it is served at, such as "dubsar.org"`);
    for (const h of hosts) {
      if (typeof h !== 'string' || hostOf(h) !== h) throw new Error(`${where}: "${h}" is not a host name (lower-case, no port)`);
      if (taken.has(h)) throw new Error(`${where}: ${h} is given to two sites`);
      taken.add(h);
    }
    return { hosts: hosts as string[], ...common(e, where) };
  });
  return { listen, release: release(o.release, 'settings'), look, sites };
}

/** What the gateway hands its display client for one site: the version it serves, and nothing about other sites. */
export function forBrowser(s: SiteEntry, version: string, releaseId: string | null): SiteSettings {
  return { version, identity: s.identity, name: s.name, relays: s.relays, release: releaseId, serve: s.serve };
}
