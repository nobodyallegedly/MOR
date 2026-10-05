// The spec hashes a site names. All are test values: the MIPs' hashes are
// fixed at the freeze, and the website cMIP's once its creator is named at
// the first acts (step 17).

import { SPECS, sha256 } from '../../genesis/src/core.ts';

const test = (s: string) => sha256(s);

export const SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelope MIP (`ENVELOPE`): a version is a publication. */
  envelope: SPECS.envelope,
  /** The Law MIP (`LAW`): only to tell that a signer is a collective. */
  law: test('LAW, test value until the freeze'),
  /** The website cMIP (cmips/cmip-website-draft-2.md). */
  site: test('website cMIP, draft 2, test value until publication'),
};

/** Envelope types: a publication and a withdrawal. */
export const PUBLICATION = 0;
export const WITHDRAWAL = 3;
