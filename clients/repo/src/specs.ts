// The spec hashes the repo client names, besides the genesis client's.
// Every one is a test value: the MIPs' hashes are fixed at the freeze, and
// the manifest cMIP's once its creator is named at the first acts (step 17).

import { createHash } from 'node:crypto';

const test = (s: string) => createHash('sha256').update(s).digest('hex');

export const REPO_SPECS = {
  /** The Law MIP (`LAW`). */
  law: test('LAW, test value until the freeze'),
  /** The release manifest cMIP (cmips/cmip-release-manifest-draft-1.md). */
  manifest: test('release manifest cMIP, draft 1, test value until publication'),
};

export const LAW_TYPES = { terms: 0, signature: 1, declaration: 13, resignation: 16, record: 17 } as const;

/** Law's declaration kind 0: the agreement a collective lives under. */
export const FOUNDING_AGREEMENT = 0;
