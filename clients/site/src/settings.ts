// The gateway's settings: a small file the operator writes, never built into
// the code. Nothing in it is signed (website cMIP, rule 21): the version is
// checked against the relays, and the display client shows the signer's
// fingerprint, so that a visitor who knows it can tell. The same checks run
// on the server and in the browser, which reads the part the gateway hands
// it at `/_mor/site.json`.

export interface SiteSettings {
  /** The version to serve: its publication's act id. */
  version: string;
  /** The identity whose site it must be. */
  identity: string;
  /** What the operator calls that identity: shown as the operator's words. */
  name: string;
  /** Where the version, its signer's chain and the acts its pages show are fetched. */
  relays: string[];
  /** The release of the display client this gateway runs (rule 20), if the operator names one. */
  release: string | null;
}

export interface GatewaySettings extends SiteSettings {
  /** Where the server listens, e.g. 127.0.0.1:8090 behind Caddy. */
  listen: string;
}

const HEX64 = /^[0-9a-f]{64}$/;

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

/** Read and check the settings a visitor's browser gets; anything malformed is an error, not a guess. */
export function parseSiteSettings(raw: unknown): SiteSettings {
  if (!raw || typeof raw !== 'object') throw new Error('the settings are not an object');
  const o = raw as Record<string, unknown>;
  if (typeof o.version !== 'string' || !HEX64.test(o.version)) throw new Error('settings: "version" must be an act id, 64 hex digits');
  if (typeof o.identity !== 'string' || !HEX64.test(o.identity)) throw new Error('settings: "identity" must be 64 hex digits');
  const name = typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'the owner of this identity';
  const relays = (Array.isArray(o.relays) ? o.relays : []).map(relayAddress);
  if (!relays.length || relays.some((r) => r === null)) throw new Error('settings: "relays" must list https addresses');
  let release: string | null = null;
  if (o.release !== undefined && o.release !== null) {
    if (typeof o.release !== 'string' || !HEX64.test(o.release)) throw new Error('settings: "release" must be an act id, 64 hex digits');
    release = o.release;
  }
  return { version: o.version, identity: o.identity, name, relays: relays as string[], release };
}

export function parseGatewaySettings(raw: unknown): GatewaySettings {
  const s = parseSiteSettings(raw);
  const o = raw as Record<string, unknown>;
  const listen = typeof o.listen === 'string' ? o.listen : '127.0.0.1:8090';
  if (!/^[^\s:]+:\d{1,5}$/.test(listen) && !/^\[[0-9a-f:]+\]:\d{1,5}$/i.test(listen)) throw new Error('settings: "listen" must be host:port');
  return { ...s, listen };
}

/** What the gateway hands its display client: everything but where it listens. */
export function forBrowser(s: SiteSettings): SiteSettings {
  return { version: s.version, identity: s.identity, name: s.name, relays: s.relays, release: s.release };
}
