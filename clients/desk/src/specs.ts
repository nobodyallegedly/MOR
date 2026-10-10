// The spec hashes the desk names beyond those of the other clients. Test
// values, like every spec hash before the freeze.

import { sha256 } from '../../genesis/src/core.ts';

export const DESK_SPECS = {
  /**
   * The Money MIP (`MONEY`), by the same test value the other MIPs use
   * until the freeze. No client makes Money acts yet (roadmap step 12):
   * the desk only recognises one as a payment received.
   */
  money: sha256('FINANCE, test value until the freeze'),
};
