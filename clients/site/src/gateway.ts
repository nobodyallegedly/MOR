// The gateway's server (website cMIP, "Gateways"). It carries the sites its
// operator lists, and no other (rule 22): the address a browser asks for
// says which. For each, it fetches the version it is to serve from relays,
// checks it, every file included, and only then serves it: the version
// named, or the publisher's latest, followed from it (rule 23). At every
// address of a site it serves its display client (the released copy in
// `built/`), never a page of the site on its own; the site's files go out
// only as bytes for the display client to check (rule 19). HTTPS is left to
// the server in front (Caddy), as for the homes.
//
//   /_mor/site.json          the settings the display client needs (unsigned: the operator's word)
//   /_mor/<file of built/>   the display client: gateway.js, gateway.css, mor_wasm_bg.wasm
//   /_mor/file/<path>        a file of the site, as bytes (application/octet-stream)
//   any other address        the display client; 404 when no file of the site is there

import { existsSync, readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { Via } from '../../genesis/src/transport.ts';
import { findLater } from './latest.ts';
import { pathFor, type SiteManifest } from './manifest.ts';
import { headers } from './headers.ts';
import { DISPLAY_FILES } from './released.ts';
import { forBrowser, hostOf, type GatewaySettings, type SiteEntry } from './settings.ts';
import { fetchFile, openVersion, type Version } from './verify.ts';

const TYPES: Record<string, string> = {
  'gateway.js': 'text/javascript; charset=utf-8',
  'gateway.css': 'text/css; charset=utf-8',
  'mor_wasm_bg.wasm': 'application/wasm',
};

export interface Loaded {
  ok: boolean;
  /** The version tried last: the one named, or, following, the latest found. */
  version: Version;
  /** Files that did not arrive, or did not match their entry. */
  problems: string[];
  /** Following: where it stopped at a fork, the versions naming the same one. */
  fork: string[];
}

/** One site the gateway carries. */
export class Carried {
  /** The checked files of the version being served, by path. Empty until a version verifies. */
  files = new Map<string, Uint8Array>();
  manifest: SiteManifest | null = null;
  /** The version being served. */
  served: string | null = null;
  last: Loaded | null = null;

  constructor(public entry: SiteEntry) {}

  /** Fetch one version's files and check each; only a version that verifies whole replaces the one served. */
  private async take(version: Version, via: Via): Promise<string[]> {
    const problems: string[] = [];
    const files = new Map<string, Uint8Array>();
    for (const f of version.manifest!.files) {
      const b = await fetchFile(f, version.places, via);
      if (b) files.set(f.path, b);
      else problems.push(`${f.path}: not found, or not matching its entry`);
    }
    if (!problems.length) {
      this.files = files;
      this.manifest = version.manifest!;
      this.served = version.version;
    }
    return problems;
  }

  /**
   * Check the version to serve (rules 18, 23). Pinned: the version named.
   * Latest: the version named, then the latest after it; if the latest does
   * not arrive whole, the one before it, and so on. On failure the gateway
   * keeps serving what it served before, if anything.
   */
  async load(entry: SiteEntry, via: Via): Promise<Loaded> {
    const named = await openVersion(entry.version, entry.identity, entry.relays, via);
    let loaded: Loaded = { ok: false, version: named, problems: [], fork: [] };
    if (named.ok) {
      const later = entry.serve === 'latest' ? await findLater(named, via) : { after: [], fork: [] };
      loaded.fork = later.fork;
      for (const v of [...later.after].reverse().concat(named)) {
        const problems = await this.take(v, via);
        loaded = { ...loaded, ok: !problems.length, version: v, problems };
        if (loaded.ok) break;
      }
    }
    if (loaded.ok) this.entry = entry;
    this.last = loaded;
    return loaded;
  }
}

export class Gateway {
  readonly sites = new Map<string, Carried>();
  private server: Server | null = null;

  constructor(
    public settings: GatewaySettings,
    readonly dist: string,
    readonly opts: { via?: Via; extraConnect?: string[] } = {},
  ) {
    for (const f of DISPLAY_FILES) {
      if (!existsSync(join(dist, f))) throw new Error(`the display client is not built: ${join(dist, f)} is missing`);
    }
    this.place(settings);
  }

  /** Give each host its site; a site keeps what it serves while its entry stays. */
  private place(settings: GatewaySettings): void {
    const before = new Map(this.sites);
    this.sites.clear();
    for (const e of settings.sites) {
      const kept = e.hosts.map((h) => before.get(h)).find((c) => c && c.entry.identity === e.identity);
      const c = kept ?? new Carried(e);
      for (const h of e.hosts) this.sites.set(h, c);
    }
  }

  /** Every site carried, once each. */
  carried(): Carried[] {
    return [...new Set(this.sites.values())];
  }

  /** Check the version to serve of every site, with these settings (read again on reload). */
  async load(settings: GatewaySettings = this.settings): Promise<{ entry: SiteEntry; loaded: Loaded }[]> {
    this.settings = settings;
    this.place(settings);
    const out = [];
    for (const e of settings.sites) {
      const c = this.sites.get(e.hosts[0])!;
      out.push({ entry: e, loaded: await c.load(e, this.opts.via ?? {}) });
    }
    return out;
  }

  private send(res: ServerResponse, status: number, type: string, body: Uint8Array | string, extra: Record<string, string> = {}) {
    res.writeHead(status, { ...headers(this.opts.extraConnect), 'content-type': type, ...extra });
    res.end(body);
  }

  /** One request. Exposed so that tests can serve through their own server. */
  handle(req: IncomingMessage, res: ServerResponse): void {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      this.send(res, 405, 'text/plain; charset=utf-8', 'only GET\n', { allow: 'GET, HEAD' });
      return;
    }
    const address = new URL(req.url ?? '/', 'http://gateway').pathname;
    const host = hostOf(req.headers.host);
    const site = host ? this.sites.get(host) : undefined;
    if (!site) {
      this.send(res, 404, 'text/plain; charset=utf-8', 'This gateway carries no site at this address.\n');
      return;
    }
    if (!site.manifest) {
      const l = site.last;
      const why = l ? [...l.version.problems, ...l.problems].join('\n') : 'not loaded yet';
      this.send(res, 503, 'text/plain; charset=utf-8', `This gateway has no version of this site that verifies.\n\n${why}\n`);
      return;
    }
    if (address === '/_mor/site.json') {
      this.send(res, 200, 'application/json', JSON.stringify(forBrowser(site.entry, site.served!, this.settings.release)));
      return;
    }
    if (address.startsWith('/_mor/file/')) {
      const path = address.slice('/_mor/file/'.length);
      const b = site.files.get(path);
      if (!b) this.send(res, 404, 'text/plain; charset=utf-8', 'no such file in this version\n');
      // Bytes for the display client to check, never a document a browser would show on its own.
      else this.send(res, 200, 'application/octet-stream', b, { 'content-disposition': 'attachment' });
      return;
    }
    if (address.startsWith('/_mor/')) {
      const name = address.slice('/_mor/'.length);
      const type = TYPES[name];
      if (!type) this.send(res, 404, 'text/plain; charset=utf-8', 'not found\n');
      else this.send(res, 200, type, readFileSync(join(this.dist, name)));
      return;
    }
    const path = pathFor(address);
    const found = path !== null && site.files.has(path);
    this.send(res, found ? 200 : 404, 'text/html; charset=utf-8', readFileSync(join(this.dist, 'index.html')));
  }

  async listen(host: string, port: number): Promise<string> {
    this.server = createServer((req, res) => this.handle(req, res));
    await new Promise<void>((r) => this.server!.listen(port, host, r));
    const a = this.server.address();
    return `http://${host}:${typeof a === 'object' && a ? a.port : port}`;
  }

  close(): void {
    this.server?.close();
  }
}
