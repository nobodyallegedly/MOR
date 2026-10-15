// The specifications step 17 publishes (F290, F289): the MICS, the six MIRs,
// the freeze test suite, every cMIP and every Module, each the newest draft in
// the repository, each as Development's `spec` map (Part three): its kind, its
// creator (the author's identity; none for a MIR), and its text, made
// canonical (Text MIR).
//
// Development's kinds are cMIP, Module, unit, media type, MIR and signature
// scheme: none is the MICS's own document or the freeze test suite. Until
// Nobody, allegedly, decides, the rehearsal publishes both under the MIR kind,
// and says so (PROVISIONAL); docs/step-17-rehearsal.md puts the question.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cborEncode, checkText, unhex } from '../../clients/genesis/src/core.ts';
import { compose } from '../../clients/longform/src/text.ts';

export const KIND = { cMIP: 0, Module: 1, unit: 2, MIR: 4 } as const;
export const PROVISIONAL = 'the MICS and the freeze test suite published under the MIR kind (4), Development naming no kind for them';

export interface SpecFile {
  file: string;
  kind: keyof typeof KIND;
  provisional: boolean;
  content: Uint8Array;
  /** What making the file canonical text changed (its spec hash covers the canonical text). */
  changes: string[];
}

/** The newest draft of each name in `dir`: files `prefix-NAME-(draft-|v)N.md`, pointers (a line saying where a file moved) left out. */
function newest(root: string, dir: string, re: RegExp): string[] {
  const best = new Map<string, [number, string]>();
  for (const f of readdirSync(join(root, dir))) {
    const m = f.match(re);
    if (!m) continue;
    if (/^\*Moved:/.test(readFileSync(join(root, dir, f), 'utf8'))) continue;
    const n = Number(m[2]);
    const had = best.get(m[1]);
    if (!had || had[0] < n) best.set(m[1], [n, `${dir}/${f}`]);
  }
  return [...best.values()].map((x) => x[1]).sort();
}

export function specifications(root: string, creator: string): SpecFile[] {
  const files: [string, keyof typeof KIND, boolean][] = [
    ...newest(root, 'spec', /^(02-MOR-MICS)-v(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'MIR', true]),
    ...newest(root, 'spec', /^(MIR-[a-z]+)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'MIR', false]),
    ...newest(root, 'spec', /^(03-MOR-freeze-test-suite)-v(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'MIR', true]),
    ...newest(root, 'cmips', /^(cmip-[a-z-]+?)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'cMIP', false]),
    ...newest(root, 'modules', /^(module-[a-z-]+?)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'Module', false]),
    ...newest(root, 'modules', /^(units-[a-z-]+?)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'unit', false]),
  ];
  return files.map(([file, kind, provisional]) => {
    const { text, changes } = compose(readFileSync(join(root, file), 'utf8'));
    checkText(text);
    // A MIR names no creator (Development, Part three: optional for MIRs only), so its spec hash
    // can be fixed at the freeze, before the author's identity exists. Every other kind names it.
    const fields: [number, unknown][] = [[0, KIND[kind]], ...(kind === 'MIR' ? [] : [[1, unhex(creator)] as [number, unknown]]), [9, text]];
    const content = cborEncode(new Map<number, unknown>(fields));
    return { file, kind, provisional, content, changes };
  });
}
