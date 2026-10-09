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

export const LAW_TYPES = {
  terms: 0,
  signature: 1,
  release: 5,
  offer: 6,
  split: 8,
  grant: 9,
  declaration: 13,
  /** A contest of a declaration of absence (rule 52; BQ4, F188). */
  contest: 14,
  resignation: 16,
  record: 17,
  fork: 19,
  closing: 20,
  // 21, the creditor's release under F125, is retired: a Finance act now (F126).
} as const;

/** Finance act types the collective client makes (Finance draft 6). */
export const FINANCE_TYPES = { pointer: 0, obligation: 1, receipt: 2, release: 4 } as const;

/** The rail Module the test pointers name: a test value, no real rail. */
export const TEST_RAIL = test('a test rail Module, no real rail');

/** Law's declaration kind 0: the agreement a collective lives under. */
export const FOUNDING_AGREEMENT = 0;
