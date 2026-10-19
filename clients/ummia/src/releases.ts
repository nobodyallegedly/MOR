// Releases of code under one's own name, moved from Edubba's Identities tab
// (F339: "moving releases and their anchoring out of Edubba makes sense"; a
// collective's releases stay in Edubba until Ummia's round 2, decided by
// Nobody, allegedly, 17 October 2026). Every check Edubba made is kept
// (H16): the folder chosen at each release (a git folder gives every file
// git tracks, as on disk; a plain folder every file but hidden ones; links
// never followed, and said); every file listed with its size and
// fingerprint, and the libraries it depends on, before anything is signed;
// the release before it chosen by hand, pre-set to the last of the same
// name; a file changed after the review refused; and "check it as anyone
// would": the release fetched by its id alone and every file checked.
//
// On a computer only: it reads a folder (Node). The web client has none,
// and says so.
//
// TEST IDENTITIES ONLY.

import { basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { SPECS, cborDecode, describeAct, hex, openMedia, sha256, workHash } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { filesOf } from '../../desk/src/setup.ts';
import { folderOf } from '../../desk/src/folders.ts';
import { decodeManifest, gitSource, prepareRelease, publishPrepared, resolveImplements, validPath, verifyRelease, type Prepared, type Publisher } from '../../repo/src/release.ts';
import { readRelease } from '../../collective/src/explain.ts';
import type { Done, Line, Review } from './shapes.ts';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

/** A release under one's own name, as kept (as Edubba kept them, `OwnRelease`). */
export interface OwnRelease {
  id: string;
  name: string;
  version: string;
  /** The manifest's exact bytes, base64. */
  manifest: string;
  /** The folder it was made from: a hint for the person, never in any act. */
  folder: string;
}

interface Plan {
  identity: string;
  folder: string;
  prepared: Prepared;
  previous: string | null;
  digest: string;
  expires: number;
  blocking: string[];
}

const PLAN_FOR = 15 * 60 * 1000;

/** Said of a release found on the relays rather than made here (one made in Edubba before F339, say). */
export const FOUND_THERE = '(found on the relays: made elsewhere)';

/**
 * This identity's releases on the relays given, each whose manifest is found
 * and reads as one: so a release line begun elsewhere (in Edubba, before
 * releases moved here) goes on here, its last release offered as the one
 * before. Only its own publications, by the feed's `signer` filter.
 */
export async function foundReleases(signer: string, hints: string[], via: Via): Promise<OwnRelease[]> {
  const out = new Map<string, OwnRelease>();
  for (const h of hints) {
    try {
      let after: number | undefined;
      for (;;) {
        const page = await relayAt(h, via).feed({ signer, spec: SPECS.envelopes, type: 0, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          const d = describeAct(it.item) as { id: string; signer?: string; public: boolean; payload?: Uint8Array };
          if (!d.public || !d.payload || d.signer !== signer || out.has(d.id)) continue;
          const m = cborDecode(d.payload) as Map<number, unknown>;
          if (!(m.get(0) instanceof Uint8Array) || hex(m.get(0) as Uint8Array) !== REPO_SPECS.manifest) continue;
          for (const at of [h, ...hints]) {
            try {
              const locked = await relayAt(at, via).getMedia(hex(m.get(2) as Uint8Array));
              if (!locked) continue;
              const plain = openMedia(locked, m.get(5) as Uint8Array, m.get(4) as Uint8Array) as Uint8Array;
              if (workHash(plain) !== hex(m.get(1) as Uint8Array)) continue;
              const man = decodeManifest(plain);
              out.set(d.id, { id: d.id, name: man.name, version: man.version, manifest: Buffer.from(plain).toString('base64'), folder: FOUND_THERE });
              break;
            } catch {
              // the next place
            }
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that relay is away
    }
  }
  return [...out.values()];
}

function inGit(folder: string): boolean {
  try {
    return execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: folder, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'true';
  } catch {
    return false;
  }
}

export class Releases {
  private plans = new Map<string, Plan>();

  found(signer: string, hints: string[], via: Via): Promise<OwnRelease[]> {
    return foundReleases(signer, hints, via);
  }

  /** The folder's name, to suggest as a release's name, and the release before it pre-set by that name (decided by Nobody, allegedly). */
  suggest(own: OwnRelease[], typed: string): { folder: string; how: 'git' | 'plain'; name: string; previous: string | null } {
    const folder = folderOf(typed);
    const name = basename(folder);
    const prior = [...own].reverse().find((x) => x.name === name);
    return { folder, how: inGit(folder) ? 'git' : 'plain', name, previous: prior?.id ?? null };
  }

  /** A release of a folder, made and read back, not signed. */
  async prepare(me: TestIdentity, own: OwnRelease[], a: { folder: string; name: string; version: string; previous: string | null; implements: string[]; relays: string[]; via: Via; as?: { collective: string; area: { name: string; holders: string[]; number: number } | null } }): Promise<Review> {
    const folder = folderOf(a.folder);
    const name = a.name.trim();
    const version = a.version.trim();
    const blocking: string[] = [];
    if (!name) blocking.push('Give the release a name (by default, the folder’s).');
    if (!version) blocking.push('Give the release a version, for example 1.0.');
    if (!a.relays.length) blocking.push('Name at least one relay first, under Settings: the files go there.');
    const before = a.previous ? own.find((x) => x.id === a.previous) : undefined;
    if (a.previous && !before) throw new Error('That release before it is not one of this identity’s releases here.');
    if (own.some((x) => x.name === name && x.version === version)) blocking.push(`${name} ${version} was already released by ${a.as ? 'this collective' : 'this identity'}. Choose another version.`);
    if (a.as && !a.as.area) blocking.push('No area of the collective’s constitution reaches its releases: they count on its own key, held by its founder’s Edubba.');
    const { how, files, skipped } = filesOf(folder);
    if (!files.length) blocking.push(how === 'git' ? 'Git tracks no file in this folder.' : 'This folder holds no file but hidden ones.');
    const bad = files.filter((f) => !validPath(f.path)).map((f) => f.path);
    if (bad.length) blocking.push(`These names cannot be in a release (release manifest cMIP, paths): ${bad.slice(0, 10).join(', ')}${bad.length > 10 ? ', …' : ''}.`);
    // The specifications it implements, named by spec hash, each read and decoded first (release manifest cMIP draft 4, client conformance).
    const impl = a.implements.length ? await resolveImplements(a.implements, a.relays, a.via) : { entries: [], problems: [] };
    for (const p of impl.problems) blocking.push(`It cannot name this as a specification it implements: ${p}.`);
    const p: Publisher = { id: me, relays: a.relays, releases: before ? [{ id: before.id, version: before.version, manifest: before.manifest }] : [] };
    const prepared = prepareRelease(p, { name: name || basename(folder), version: version || '0', files: files.filter((f) => validPath(f.path)), source: how === 'git' ? gitSource(folder) : undefined, implements: impl.entries });
    const m = prepared.manifest;
    const digest = sha256(Buffer.concat([Buffer.from('MOR Ummia release review, version 1\n'), Buffer.from(a.as ? `${me.id} for ${a.as.collective}` : me.id), prepared.payload, prepared.encoded]));
    const plan = sha256(`${digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(plan, { identity: me.id, folder, prepared, previous: before?.id ?? null, digest, expires: Date.now() + PLAN_FOR, blocking });
    const line: Line[] = before
      ? [{ text: `It follows ${before.name} ${before.version} (${before.id}), released from ${before.folder}: that release is named as the one before it, and what changed is said below.` }]
      : [{ text: 'It names no release before it: it starts a new release line.' }];
    return {
      plan,
      digest,
      title: a.as ? `Publish ${m.name} ${m.version} for the collective ${a.as.collective.slice(0, 8)}…` : `Publish ${m.name} ${m.version} under your own name`,
      summary: [
        `${plural(m.files.length, 'file')} listed below, each with its size and fingerprint (its work hash, as the manifest names it)${m.dependencies.length ? `, and ${plural(m.dependencies.length, 'library', 'libraries')} it depends on, from its lock files` : ''}. ${plural(prepared.upload.length, 'file is', 'files are')} new since the release before it and uploaded.`,
        'Nothing is signed until you press Sign and publish.',
      ],
      sections: [
        { heading: 'Where its files come from', lines: [{ text: how === 'git' ? `${folder} is in a git folder: every file git tracks there, as it is on disk.` : `${folder} is a plain folder: every file in it, except hidden ones (a name starting with a dot, and what is inside a hidden folder).` }] },
        { heading: 'The release before it', lines: line },
        ...(impl.entries.length ? [{ heading: 'The specifications it implements', lines: impl.entries.map((e) => ({ text: `${e.spec} (its publication ${e.hint})` })) }] : []),
        ...readRelease(m, prepared.before),
        {
          heading: 'Who signs',
          lines: [
            a.as
              ? { text: `It is published by the collective, signed with your own key for it (F353): it counts as the collective’s release once its area “${a.as.area?.name ?? '?'}” is met, ${a.as.area?.number ?? '?'} key${a.as.area?.number === 1 ? '' : 's'} of ${a.as.area?.holders.length ?? '?'}${(a.as.area?.number ?? 1) > 1 ? '; its other holders are asked for theirs, in their own app' : ''} (Agreements rule 60).` }
              : { text: 'It is published under your own name, signed by this identity alone: a release as soon as it is published (release manifest cMIP, “What counts as a release”).' },
            { text: `The manifest and every new file go to ${a.relays.join(', ')}. Anyone can then fetch the release by its id and check every file against the list.` },
          ],
        },
      ],
      files: m.files.map((f) => ({ path: f.path, size: f.size, fingerprint: f.work })),
      dependencies: m.dependencies.map((d) => ({ registry: d.registry, name: d.name, version: d.version })),
      skipped,
      blocking,
    };
  }

  /** Sign and publish exactly as reviewed: only with its digest, within 15 minutes, once, every file read again and compared. */
  async confirm(me: TestIdentity, own: OwnRelease[], planId: string, digest: string, relays: string[], via: Via, sign?: (payload: Uint8Array) => Promise<{ id: string }>): Promise<{ done: Done; release: OwnRelease }> {
    const plan = this.plans.get(planId);
    if (!plan || plan.expires < Date.now() || plan.identity !== me.id) {
      this.plans.delete(planId);
      throw new Error('This review is no longer good: review the release again. Nothing was signed.');
    }
    if (plan.digest !== digest) throw new Error('The digest is not the review’s. Nothing was signed.');
    if (plan.blocking.length) throw new Error(`${plan.blocking.join(' ')} Nothing was signed.`);
    this.plans.delete(planId);
    const now = filesOf(plan.folder).files.filter((f) => validPath(f.path));
    const listed = plan.prepared.manifest.files;
    const changed = now.length !== listed.length || now.some((f, i) => f.path !== listed[i].path || f.bytes.length !== listed[i].size || workHash(f.bytes) !== listed[i].work);
    if (changed) throw new Error(`Files in ${plan.folder} changed since the review: review the release again. Nothing was signed.`);
    const before = plan.previous ? own.find((x) => x.id === plan.previous) : undefined;
    const p: Publisher = { id: me, sign, relays, releases: before ? [{ id: before.id, version: before.version, manifest: before.manifest }] : [] };
    const out = await publishPrepared(p, plan.prepared, via);
    const release: OwnRelease = { id: out.id, name: out.manifest.name, version: out.manifest.version, manifest: Buffer.from(plan.prepared.encoded).toString('base64'), folder: plan.folder };
    return {
      release,
      done: {
        title: `${release.name} ${release.version} is published`,
        lines: [
          { text: `Release ${out.id}.`, tone: 'ok' },
          { text: `${plural(out.manifest.files.length, 'file')}, ${out.uploaded} uploaded new.` },
          ...out.refused.map((r) => ({ text: `Refused by ${r}`, tone: 'warn' as const })),
        ],
        acts: [out.id],
      },
    };
  }

  cancel(plan: string): void {
    this.plans.delete(plan);
  }

  /** Check it as anyone would: a fresh verifier knowing only the release's id and the places given, every file fetched and checked. */
  async check(id: string, hints: string[], via: Via): Promise<{ ok: boolean; checked: number; files: number; problems: string[]; lines: Line[] }> {
    const v = await verifyRelease(id, hints, { via });
    const files = v.manifest?.files.length ?? 0;
    return {
      ok: v.ok,
      checked: v.checked,
      files,
      problems: v.problems,
      lines: v.ok
        ? [
            { text: `VERIFIED: the release ${id.slice(0, 12)}…, signed by ${v.signers.length ? v.signers.map((s) => `${s.slice(0, 8)}…`).join(', ') : 'its publisher'}, valid through its signer’s chain.`, tone: 'ok' },
            { text: `Every file fetched and checked against its fingerprint: ${v.checked} of ${files}.`, tone: 'ok' },
          ]
        : v.problems.map((p) => ({ text: p, tone: 'bad' as const })),
    };
  }
}

/** A manifest kept here, read again. */
export const manifestOf = (r: OwnRelease) => decodeManifest(unb64(r.manifest));
