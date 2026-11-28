// The round's real acts, a sample (test/real-acts/): fifty public Agreements
// acts of round two (20 Terms, 30 Statements), copied unchanged from the
// round's `_research/windows/<keptBy>/acts/<id>.mor`, with the manifest that
// drew them (`sample-manifest.json`: its rule, each act's id, type, signer,
// body cMIP and the window that kept it). A sample, not the round's data.
// For the draft-25 tests of the collective client and Edubba. TEST ONLY.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Held } from '../src/agreements-25.ts';
import { KIT } from './kit-examples.ts';

export const REAL_ACTS = join(fileURLToPath(new URL('.', import.meta.url)), 'real-acts');

export interface Sampled {
  id: string;
  type: 'Terms' | 'Statement';
  signer: string;
  keptBy: string;
  home: string;
  feedPosition: number;
  bodyCmip?: string;
}

export interface RealActs {
  rule: string;
  source: string;
  acts: (Sampled & { file: string; bytes: Uint8Array })[];
  /** Every act of the sample, held together (all public). */
  held: Held[];
}

export function realActs(): RealActs {
  const m = JSON.parse(readFileSync(join(REAL_ACTS, 'sample-manifest.json'), 'utf8')) as { rule: string; source: string; acts: Sampled[] };
  const acts = m.acts.map((a) => {
    const file = join(REAL_ACTS, `${a.id}.mor`);
    return { ...a, file, bytes: new Uint8Array(readFileSync(file)) };
  });
  return { rule: m.rule, source: m.source, acts, held: acts.map((a) => ({ act: a.bytes })) };
}

/** The kit's own command line (test/kit/mor.mjs), its JSON answer. */
export function kit(args: string[]): unknown {
  const cwd = mkdtempSync(join(tmpdir(), 'mor-kit-real-'));
  return JSON.parse(execFileSync(process.execPath, [join(KIT, 'mor.mjs'), ...args], { cwd, encoding: 'utf8' }));
}

/** One comparison: what was compared, on which act, the two answers. */
export interface Compared {
  id: string;
  what: string;
  ours: unknown;
  theirs: unknown;
}

/** Counts and every mismatch, said in lines; the test asserts there are none. */
export function tally(rows: Compared[]): { match: number; mismatch: Compared[]; lines: string[] } {
  const same = (r: Compared) => JSON.stringify(r.ours) === JSON.stringify(r.theirs);
  const mismatch = rows.filter((r) => !same(r));
  return {
    match: rows.length - mismatch.length,
    mismatch,
    lines: mismatch.map((r) => `${r.id} ${r.what}: ours ${JSON.stringify(r.ours)}, the kit's ${JSON.stringify(r.theirs)}`),
  };
}
