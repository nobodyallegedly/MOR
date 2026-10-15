// The specifications step 17 publishes (F290, F289): the MICS, the six MIRs,
// the freeze test suite, every cMIP and every Module, each the newest draft in
// the repository, each as Development's `spec` map (Part three): its kind, its
// creator (the author's identity; none for a MIR), and its text, made
// canonical (Text MIR).
//
// Development draft 10 gives the MICS document and a test suite kinds of
// their own (6 and 7, F291), naming no creator, as a MIR names none; and a
// Module names, in field 5, the cMIP it implements or the MIR it works under
// (F322, F328 Q6). Which one, for each Module, is read from its text
// (`MODULE_UNDER`); the four key Modules say only that they are Identity's,
// so the rehearsal names the Identity MIR for them (the rehearsal's reading,
// in docs/code-after-step-15-part-4.md).

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cborEncode, checkText, unhex } from '../../clients/genesis/src/core.ts';
import { specHash } from '../../clients/site/src/listing.ts';
import { compose } from '../../clients/longform/src/text.ts';

export const KIND = { cMIP: 0, Module: 1, unit: 2, MIR: 4, MICS: 6, suite: 7 } as const;
/** No kind is provisional since Development draft 10 (F291): kept for the report's line. */
export const PROVISIONAL = 'none: the MICS document and the freeze test suite have kinds of their own since Development draft 10 (F291)';
/** Kinds that name no creator (Development draft 10, field 1). */
const NO_CREATOR: (keyof typeof KIND)[] = ['MIR', 'MICS', 'suite'];

/** What each Module works under (field 5), by the file of the cMIP or MIR its text names. */
const MODULE_UNDER: Record<string, string> = {
  'module-lightning-rail': 'cmip-payment',
  'module-onchain-rail': 'cmip-payment',
  'module-bitcoin-clock': 'cmip-anchoring',
  'module-clock-timestamp': 'cmip-anchoring',
  'module-jpeg': 'MIR-envelopes',
  'module-video': 'MIR-envelopes',
  'module-airgap-chain-key-signer': 'MIR-identity',
  'module-chain-key-seed-words': 'MIR-identity',
  'module-chain-key-seed-hex': 'MIR-identity',
  'module-identity-carry-words': 'MIR-identity',
};

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
    ...newest(root, 'spec', /^(02-MOR-MICS)-v(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'MICS', false]),
    ...newest(root, 'spec', /^(MIR-[a-z]+)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'MIR', false]),
    ...newest(root, 'spec', /^(03-MOR-freeze-test-suite)-v(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'suite', false]),
    ...newest(root, 'cmips', /^(cmip-[a-z-]+?)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'cMIP', false]),
    ...newest(root, 'modules', /^(module-[a-z-]+?)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'Module', false]),
    ...newest(root, 'modules', /^(units-[a-z-]+?)-draft-(\d+)\.md$/).map((f): [string, keyof typeof KIND, boolean] => [f, 'unit', false]),
  ];
  // Modules last: each names, by its spec hash, what it works under.
  const order = (k: keyof typeof KIND) => (k === 'Module' ? 1 : 0);
  const made: SpecFile[] = [];
  for (const [file, kind, provisional] of [...files].sort((a, b) => order(a[1]) - order(b[1]))) {
    const { text, changes } = compose(readFileSync(join(root, file), 'utf8'));
    checkText(text);
    // A MIR, the MICS document and a test suite name no creator, so their spec hashes
    // can be fixed at the freeze, before the author's identity exists. Every other kind names it.
    const fields: [number, unknown][] = [[0, KIND[kind]], ...(NO_CREATOR.includes(kind) ? [] : [[1, unhex(creator)] as [number, unknown]])];
    if (kind === 'Module') {
      const name = Object.keys(MODULE_UNDER).find((m) => file.includes(`${m}-draft-`));
      const under = name && made.find((x) => x.file.includes(`${MODULE_UNDER[name]}-draft-`));
      if (!under) throw new Error(`${file}: what it works under (field 5) is not known to the rehearsal`);
      fields.push([5, unhex(specHash(under.content))]);
      // A rail Module's kind and binding (Development draft 10, fields 11 and 13;
      // F301, F328 Q5): both rails are request rails binding payee and purpose
      // (their drafts 3).
      if (MODULE_UNDER[name] === 'cmip-payment') fields.push([11, 0], [13, [0, 1]]);
    }
    fields.push([9, text]);
    made.push({ file, kind, provisional, content: cborEncode(new Map<number, unknown>(fields)), changes });
  }
  return made.sort((a, b) => files.findIndex((f) => f[0] === a.file) - files.findIndex((f) => f[0] === b.file));
}
