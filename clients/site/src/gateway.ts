// The gateway's server (website cMIP, "Gateways"): it fetches the version
// its operator names from relays, checks it, every file included, and only
// then serves it. At every address of the site it serves its display client
// (the page in `dist/`), never a page of the site on its own; the site's
// files go out only as bytes for the display client to check (rule 19).
// HTTPS is left to the server in front (Caddy), as for the homes.
//
//   /_mor/site.json          the settings the display client needs (unsigned: the operator's word)
//   /_mor/<file of dist/>    the display client: gateway.js, gateway.css, mor_wasm_bg.wasm
//   /_mor/file/<path>        a file of the site, as bytes (application/octet-stream)
//   any other address        the display client; 404 when no file of the site is there

import { existsSync, readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { Via } from '../../genesis/src/transport.ts';
import { pathFor, type SiteManifest } from './manifest.ts';
import { headers } from './headers.ts';
import { forBrowser, type SiteSettings } from './settings.ts';
import { fetchFile, openVersion, type Version } from './verify.ts';

const SHELL_FILES: Record<string, string> = {
  'gateway.js': 'text/javascript; charset=utf-8',
  'gateway.css': 'text/css; charset=utf-8',
  'mor_wasm_bg.wasm': 'application/wasm',
};

export interface Loaded {
  ok: boolean;
  version: Version;
  /** Files that did not arrive, or did not match their entry. */
  problems: string[];
}

export class Gateway {
  /** The checked files of the version being served, by path. Empty until a version verifies. */
  files = new Map<string, Uint8Array>();
  manifest: SiteManifest | null = null;
  last: Loaded | null = null;
  private server: Server | null = null;

  constructor(
    public settings: SiteSettings,
    readonly dist: string,
    readonly opts: { via?: Via; extraConnect?: string[] } = {},
  ) {
    for (const f of ['index.html', ...Object.keys(SHELL_FILES)]) {
      if (!existsSync(join(dist, f))) throw new Error(`the display client is not built: ${join(dist, f)} is missing (npm run build)`);
    }
  }

  /**
   * Fetch and check the version the settings name (rule 18). Only a version
   * that verifies, with every file, replaces the one being served; on
   * failure the gateway keeps serving what it served before, if anything.
   */
  async load(settings: SiteSettings = this.settings): Promise<Loaded> {
    const via = this.opts.via ?? {};
    const version = await openVersion(settings.version, settings.identity, settings.relays, via);
    const problems: string[] = [];
    const files = new Map<string, Uint8Array>();
    if (version.ok) {
      for (const f of version.manifest!.files) {
        const b = await fetchFile(f, version.places, via);
        if (b) files.set(f.path, b);
        else problems.push(`${f.path}: not found, or not matching its entry`);
      }
    }
    const ok = version.ok && !problems.length;
    if (ok) {
      this.settings = settings;
      this.files = files;
      this.manifest = version.manifest!;
    }
    this.last = { ok, version, problems };
    return this.last;
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
    if (!this.manifest) {
      const why = this.last ? [...this.last.version.problems, ...this.last.problems].join('\n') : 'not loaded yet';
      this.send(res, 503, 'text/plain; charset=utf-8', `This gateway has no version of its site that verifies.\n\n${why}\n`);
      return;
    }
    if (address === '/_mor/site.json') {
      this.send(res, 200, 'application/json', JSON.stringify(forBrowser(this.settings)));
      return;
    }
    if (address.startsWith('/_mor/file/')) {
      const path = address.slice('/_mor/file/'.length);
      const b = this.files.get(path);
      if (!b) this.send(res, 404, 'text/plain; charset=utf-8', 'no such file in this version\n');
      // Bytes for the display client to check, never a document a browser would show on its own.
      else this.send(res, 200, 'application/octet-stream', b, { 'content-disposition': 'attachment' });
      return;
    }
    if (address.startsWith('/_mor/')) {
      const name = address.slice('/_mor/'.length);
      const type = SHELL_FILES[name];
      if (!type) this.send(res, 404, 'text/plain; charset=utf-8', 'not found\n');
      else this.send(res, 200, type, readFileSync(join(this.dist, name)));
      return;
    }
    const path = pathFor(address);
    const found = path !== null && this.files.has(path);
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
