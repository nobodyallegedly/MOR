// Publishing a version of a site (website cMIP, "Publishing"): every file
// locked as a media object, a file unchanged since the previous version
// reusing the same object; the manifest as the media of a public
// publication signed by the site's owner; the chain carried along; the
// publication first, then the manifest, then the new files.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { cborEncode, lockMedia, unhex, workHash } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { NotJpeg, strip } from '../../../modules/jpeg/src/jpeg.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { decodeSite, encodeSite, FRONT, kindOf, type FileEntry, type SiteManifest } from './manifest.ts';
import { PUBLICATION, SITE_SPECS } from './specs.ts';
import { openVersion } from './verify.ts';

export interface FileIn {
  path: string;
  bytes: Uint8Array;
}

/** Every file under `dir`, as the site's paths. Any file the cMIP would refuse is an error, never skipped. */
export function readFolder(dir: string): FileIn[] {
  const out: FileIn[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push({ path: relative(dir, full).split(sep).join('/'), bytes: new Uint8Array(readFileSync(full)) });
    }
  };
  walk(dir);
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * What the cMIP asks of files before they are published: valid paths (rule
 * 2), known kinds (rule 4), a front page (rule 5), pictures stripped to the
 * picture alone (rule 6), pages, stylesheets and text in UTF-8. Throws every
 * reason at once.
 */
export function checkFiles(files: FileIn[]): void {
  const problems: string[] = [];
  const utf8 = new TextDecoder('utf-8', { fatal: true });
  for (const f of files) {
    const kind = kindOf(f.path);
    if (!kind) {
      problems.push(`${f.path}: not a path a site may hold (lower-case a-z, 0-9, "-", "_", "."; ending in .html, .css, .jpg or .txt)`);
      continue;
    }
    if (kind === 'picture') {
      try {
        const s = strip(f.bytes);
        if (s.removed.length) {
          problems.push(`${f.path}: carries more than the picture (${s.removed.map((c) => CARRIED_WORDS[c]).join('; ')}); strip it first (mor-site strip)`);
        }
      } catch (e) {
        problems.push(`${f.path}: ${e instanceof NotJpeg ? `not a JPEG: ${e.message}` : String(e)}`);
      }
    } else {
      try {
        utf8.decode(f.bytes);
      } catch {
        problems.push(`${f.path}: not UTF-8`);
      }
    }
  }
  if (!files.some((f) => f.path === FRONT)) problems.push('no front page (index.html)');
  if (problems.length) throw new Error(`these files cannot be published:\n  ${problems.join('\n  ')}`);
}

async function carryChain(by: TestIdentity, relays: string[]): Promise<void> {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
        // that relay's policy, or it is away
      }
    }
  }
}

export interface Published {
  /** The version: its publication's act id. */
  id: string;
  manifest: SiteManifest;
  /** Files uploaded new; the rest are the same locked objects as in the previous version. */
  uploaded: number;
}

/**
 * Publish a version of a site, signed by `by`. With `previous` (a version's
 * act id), the new version names it, and files unchanged since then reuse
 * its objects, fetched and checked from the relays first. Save the
 * identity's file after: its sequence has grown.
 */
export async function publishSite(
  by: TestIdentity,
  opts: { name: string; files: FileIn[]; relays: string[]; previous?: string; via?: Via },
): Promise<Published> {
  checkFiles(opts.files);
  const via = opts.via ?? by.via;
  const before = new Map<string, FileEntry>();
  if (opts.previous) {
    const p = await openVersion(opts.previous, by.id, opts.relays, via);
    if (!p.ok) throw new Error(`the previous version does not verify: ${p.problems.join('; ')}`);
    for (const f of p.manifest!.files) before.set(`${f.path}\0${f.work}`, f);
  }
  const entries: FileEntry[] = [];
  const upload: Uint8Array[] = [];
  for (const f of opts.files) {
    const work = workHash(f.bytes);
    const same = before.get(`${f.path}\0${work}`);
    if (same) {
      entries.push(same);
      continue;
    }
    const l = lockMedia(f.bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string };
    entries.push({ path: f.path, work, size: f.bytes.length, locked: l.lockedHash, nonce: l.nonce, key: l.key });
    upload.push(l.locked);
  }
  const manifest: SiteManifest = { name: opts.name, previous: opts.previous ?? null, files: entries };
  const encoded = encodeSite(manifest);
  decodeSite(encoded); // the same checks a verifier runs
  const lm = lockMedia(encoded) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(SITE_SPECS.site)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, encoded.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, opts.relays],
    ]),
  );
  await carryChain(by, opts.relays);
  // The publication first: a relay that keeps media only for publications it holds then takes the manifest.
  const made = await by.publish(SITE_SPECS.envelope, PUBLICATION, payload, { public: true, relays: opts.relays });
  let kept = 0;
  const errors: string[] = [];
  for (const hint of opts.relays) {
    try {
      const r = relayAt(hint, via);
      await r.putMedia(lm.locked);
      for (const u of upload) await r.putMedia(u);
      kept++;
    } catch (e) {
      errors.push(`${hint}: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (!kept) throw new Error(`no relay kept the files: ${errors.join('; ')}`);
  return { id: made.id, manifest, uploaded: upload.length };
}
