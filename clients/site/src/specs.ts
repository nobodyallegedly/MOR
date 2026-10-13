// The spec hashes a site names. All are test values: the MIRs' hashes are
// fixed at the freeze, and the website cMIP's once its creator is named at
// the first acts (step 17).

import { MIRS, SPECS, sha256 } from '../../genesis/src/core.ts';

const test = (s: string) => sha256(s);

export const SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelopes MIR (`ENVELOPES`): a version is a publication. */
  envelopes: SPECS.envelopes,
  /** The Agreements MIR (`AGREEMENTS`): only to tell that a signer is a collective. */
  agreements: test('LAW, test value until the freeze'),
  /** The website cMIP (cmips/cmip-website-draft-4.md). Draft 3 adds the icon
   * (rule 16a), draft 4 films (rules 4, 6a, 12a); both leave the manifest's
   * format as it was, so the test value stays draft 2's: versions already
   * published still verify. */
  site: test('website cMIP, draft 2, test value until publication'),
};

/** The six MIRs, as the core library's Agreements calls take them (with the site's
 * Agreements value), only to tell that a signer is a collective. */
export const SITE_AGREEMENTS_SPECS = { ...MIRS, agreements: SITE_SPECS.agreements };

/** Envelopes types: a publication and a withdrawal. */
export const PUBLICATION = 0;
export const WITHDRAWAL = 3;

/** The nudge cMIP (cmips/cmip-nudge-draft-2.md): only to read who picked a
 * visitor's note the feed shows (website cMIP draft 7). A test value until
 * publication; the agent's and the owner's clients must use the same. */
export const NUDGE = test('nudge cMIP, draft 2, test value until publication');
/** Its act types: the agency terms, a nudge, a pick. */
export const NUDGE_TYPES = { terms: 0, nudge: 1, pick: 2 } as const;
