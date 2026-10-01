#!/usr/bin/env -S node --import tsx
// mor-site: websites on MOR (website cMIP, draft 1), from the command line:
// publish a version of a site, verify one with no gateway at all, check what
// a gateway serves against the signed site and the released display client,
// and run a gateway.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TestIdentity } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { workHash } from '../../genesis/src/core.ts';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { Gateway } from './gateway.ts';
import { addressOf } from './manifest.ts';
import { publishSite, readFolder } from './publish.ts';
import { parseGatewaySettings, parseSiteSettings } from './settings.ts';
import { fetchFile, matches, openVersion } from './verify.ts';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));

const HELP = `mor-site: websites on MOR. A site is a signed list of its files, each named
by its hash, published on relays; a gateway serves it at an address, and
checks every page in the visitor's browser before showing it.

  publish --file ME.json --dir FOLDER --name NAME --relay URL [--relay URL ...] [--previous ID]
        Publish every file in FOLDER as a version of ME's site (a test identity
        made with the genesis client). With --previous, the new version names
        that one, and files unchanged since are not uploaded again. Prints the
        version's id: put it in the gateway's settings.
  verify ID --identity ID --at URL [--at URL ...] [--out DIR]
        As anyone, with no gateway: fetch a version from relays and verify it:
        its signer's chain, the manifest, then every file against its hash.
        --out writes the files, once every one has passed.
  check GATEWAY [--at URL ...] [--against DIR]
        Compare what a gateway serves with what was signed and released: every
        file of the version it names, against the manifest (fetched from the
        relays given, or else those the gateway names), and its display
        client, against DIR (default: this client's own build, dist/).
  gateway --settings FILE [--dist DIR]
        Run a gateway (behind Caddy for HTTPS). It checks the version its
        settings name before serving it; on SIGHUP it reads the settings again
        and switches only to a version that verifies.
  strip FILE.jpg
        Strip a JPEG to the picture alone, in place (JPEG Module, rule 6), so
        that it may go into a site.

Every command that reaches relays takes --via URL=LOCAL to reach an address
another way (for example an onion address through a local port).`;

function parse(argv: string[]) {
  const pos: string[] = [];
  const opts: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      (opts[k] ??= []).push(k === 'help' ? 'true' : argv[++i]);
    } else pos.push(a);
  }
  return { pos, opts };
}

function viaOf(opts: Record<string, string[]>): Via {
  const via: Via = {};
  for (const v of opts.via ?? []) {
    const i = v.indexOf('=');
    if (i < 0) throw new Error(`--via takes URL=LOCAL, not ${v}`);
    via[v.slice(0, i)] = v.slice(i + 1);
  }
  return via;
}

const one = (opts: Record<string, string[]>, k: string): string => {
  const v = opts[k]?.[0];
  if (!v) throw new Error(`--${k} is needed (see help)`);
  return v;
};

async function main(argv: string[]): Promise<number> {
  const { pos, opts } = parse(argv);
  const cmd = pos.shift();
  if (!cmd || cmd === 'help' || opts.help) {
    console.log(HELP);
    return 0;
  }
  const via = viaOf(opts);

  if (cmd === 'publish') {
    const file = one(opts, 'file');
    const me = TestIdentity.load(file, via);
    const relays = opts.relay ?? [];
    if (!relays.length) throw new Error('--relay is needed: where the site is published');
    const files = readFolder(resolve(one(opts, 'dir')));
    const p = await publishSite(me, { name: one(opts, 'name'), files, relays, previous: opts.previous?.[0], via });
    me.save(file);
    console.log(`published version ${p.id}`);
    console.log(`  ${p.manifest.files.length} files, ${p.uploaded} uploaded new${p.manifest.previous ? `, after ${p.manifest.previous}` : ''}`);
    for (const f of p.manifest.files) console.log(`  ${f.path}  ${f.work}`);
    return 0;
  }

  if (cmd === 'verify') {
    const id = pos[0];
    if (!id) throw new Error('verify takes the version id');
    const v = await openVersion(id, one(opts, 'identity'), opts.at ?? [], via);
    console.log(`version ${id}`);
    if (v.signer) console.log(`  signed by ${v.signer}${v.standing ? `, ${v.standing}` : ''}`);
    if (!v.ok) {
      console.log('NOT VERIFIED');
      for (const p of v.problems) console.log(`  ${p}`);
      return 1;
    }
    const got: { path: string; bytes: Uint8Array }[] = [];
    const bad: string[] = [];
    for (const f of v.manifest!.files) {
      const b = await fetchFile(f, v.places, via);
      if (b) got.push({ path: f.path, bytes: b });
      else bad.push(f.path);
      console.log(`  ${b ? 'ok  ' : 'BAD '} ${f.path}`);
    }
    if (bad.length) {
      console.log(`NOT VERIFIED: ${bad.length} file(s) not found or not matching`);
      return 1;
    }
    console.log(`VERIFIED: the site "${v.manifest!.name}", ${got.length} files, each what ${v.signer} signed`);
    const out = opts.out?.[0];
    if (out) {
      for (const f of got) {
        const p = join(out, f.path);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, f.bytes);
      }
      console.log(`  written to ${out}`);
    }
    return 0;
  }

  if (cmd === 'check') {
    const gw = pos[0]?.replace(/\/$/, '');
    if (!gw) throw new Error('check takes the gateway address');
    const get = async (path: string) => {
      const r = await fetch(gw + path, { cache: 'no-store' });
      return { status: r.status, bytes: new Uint8Array(await r.arrayBuffer()) };
    };
    const s = parseSiteSettings(JSON.parse(new TextDecoder().decode((await get('/_mor/site.json')).bytes)));
    console.log(`gateway ${gw} names version ${s.version}, of ${s.identity} ("${s.name}")`);
    const v = await openVersion(s.version, s.identity, opts.at ?? s.relays, via);
    let bad = 0;
    if (!v.ok) {
      console.log('NOT VERIFIED: the version it names');
      for (const p of v.problems) console.log(`  ${p}`);
      return 1;
    }
    console.log(`  the version verifies: the site "${v.manifest!.name}", signed by ${v.signer}`);
    for (const f of v.manifest!.files) {
      const r = await get(`/_mor/file/${f.path}`);
      const ok = r.status === 200 && matches(f, r.bytes);
      if (!ok) bad++;
      console.log(`  ${ok ? 'same' : 'DIFFERS'}  ${f.path}`);
    }
    const against = resolve(opts.against?.[0] ?? DIST);
    const shell = readFileSync(join(against, 'index.html'));
    for (const name of ['gateway.js', 'gateway.css', 'mor_wasm_bg.wasm']) {
      const r = await get(`/_mor/${name}`);
      const ok = r.status === 200 && existsSync(join(against, name)) && workHash(r.bytes) === workHash(new Uint8Array(readFileSync(join(against, name))));
      if (!ok) bad++;
      console.log(`  ${ok ? 'same' : 'DIFFERS'}  display client: ${name}`);
    }
    for (const f of v.manifest!.files) {
      const r = await get(addressOf(f.path));
      const ok = workHash(r.bytes) === workHash(new Uint8Array(shell));
      if (!ok) bad++;
      console.log(`  ${ok ? 'same' : 'DIFFERS'}  display client at ${addressOf(f.path)}`);
    }
    console.log(bad ? `DIFFERS: ${bad} thing(s) this gateway serves are not what was signed or released` : 'SAME: everything this gateway served to this machine is what was signed and released');
    return bad ? 1 : 0;
  }

  if (cmd === 'gateway') {
    const file = one(opts, 'settings');
    const read = () => parseGatewaySettings(JSON.parse(readFileSync(file, 'utf8')));
    const settings = read();
    const g = new Gateway(settings, resolve(opts.dist?.[0] ?? DIST), { via });
    const report = (what: string, l: Awaited<ReturnType<Gateway['load']>>) => {
      if (l.ok) console.log(`${what}: version ${l.version.version} verified, ${g.files.size} files; serving it`);
      else console.log(`${what}: version ${l.version.version} NOT VERIFIED${g.manifest ? '; still serving the one before' : '; serving nothing'}\n  ${[...l.version.problems, ...l.problems].join('\n  ')}`);
    };
    report('start', await g.load());
    const i = settings.listen.lastIndexOf(':');
    const at = await g.listen(settings.listen.slice(0, i).replace(/^\[|\]$/g, ''), Number(settings.listen.slice(i + 1)));
    console.log(`gateway listening at ${at}`);
    process.on('SIGHUP', () => {
      void (async () => {
        try {
          report('reload', await g.load(read()));
        } catch (e) {
          console.log(`reload: ${e instanceof Error ? e.message : e}`);
        }
      })();
    });
    await new Promise(() => {});
    return 0;
  }

  if (cmd === 'strip') {
    const file = pos[0];
    if (!file) throw new Error('strip takes a JPEG file');
    const s = strip(new Uint8Array(readFileSync(file)));
    writeFileSync(file, s.bytes);
    console.log(s.removed.length ? `stripped ${file}: removed ${s.removed.map((c) => CARRIED_WORDS[c]).join('; ')}` : `${file} carried only the picture`);
    return 0;
  }

  throw new Error(`unknown command ${cmd} (see help)`);
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (e) => {
    console.error(`mor-site: ${e instanceof Error ? e.message : e}`);
    process.exit(2);
  },
);
