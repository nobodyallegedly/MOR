// The spec hashes the desk names beyond those of the other clients. Test
// values, like every spec hash before the freeze.

import { sha256 } from '../../genesis/src/core.ts';

export const DESK_SPECS = {
  /**
   * The Finance MIP (`FINANCE`), by the same test value the other MIPs use
   * until the freeze. No client makes Finance acts yet (roadmap step 12):
   * the desk only recognises one as a payment received.
   */
  finance: sha256('FINANCE, test value until the freeze'),
};
