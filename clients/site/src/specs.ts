// The spec hashes a site names. All are test values: the MIRs' hashes are
// fixed at the freeze, and the website cMIP's once its creator is named at
// the first acts (step 17).

import { MIRS, SPECS, sha256 } from '../../genesis/src/core.ts';

const test = (s: string) => sha256(s);

export const SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelopes MIR (`ENVELOPES`): a version is a bake (an upload, Envelopes type 0; called a publication before F407). */
  envelopes: SPECS.envelopes,
  /** The Agreements MIR (`AGREEMENTS`): to judge a collective's site (website cMIP draft 12, rule 3). */
  agreements: test('LAW, test value until the freeze'),
  /** The website cMIP (cmips/cmip-website-draft-4.md). Draft 3 adds the icon
   * (rule 16a), draft 4 films (rules 4, 6a, 12a); both leave the manifest's
   * format as it was, so the test value stays draft 2's: versions already
   * published still verify. */
  site: test('website cMIP, draft 2, test value until publication'),
};

/** Envelopes type 0: a bake ("I uploaded this"). The withdrawal (type 3) is
 * retired: a bake is never withdrawn (Envelopes rule 24, F407). */
export const BAKE = 0;

/** The nudge cMIP (cmips/cmip-nudge-draft-2.md): only to read who picked a
 * visitor's note the feed shows (website cMIP draft 7). A test value until
 * publication; the agent's and the owner's clients must use the same. */
export const NUDGE = test('nudge cMIP, draft 2, test value until publication');
/** Its act types: the agency terms, a nudge, a pick. */
export const NUDGE_TYPES = { terms: 0, nudge: 1, pick: 2 } as const;

/** The release manifest cMIP (cmips/cmip-release-manifest-draft-1.md): only to
 * tell that code is released for a specification a listing shows (website cMIP
 * draft 9, rule 13c). The same test value as the repo client's, until publication. */
export const RELEASE_MANIFEST = test('release manifest cMIP, draft 1, test value until publication');

/** The six MIRs, as the core library's Agreements calls take them (with the site's
 * Agreements value), to judge an act done for a collective (website cMIP draft
 * 12, rule 3). A collective's founding terms name the release manifest cMIP as
 * an extension acting on no other layer, as the repo client writes them. */
export const SITE_AGREEMENTS_SPECS = { ...MIRS, agreements: SITE_SPECS.agreements, extLayers: { [RELEASE_MANIFEST]: [] as number[] } };


/** The payment cMIP (cmips/cmip-payment-draft-3.md): only for a listing to
 * read a Module working under it, which must carry fields 11 and 13
 * (Development draft 10, F301). The same test value as the core's
 * `mor_payment::spec()`, until publication. */
export const PAYMENT_CMIP = test('payment cMIP, draft 2, test value until publication');