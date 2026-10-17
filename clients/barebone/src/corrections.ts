// The corrections cMIP, draft 1 (`cmips/cmip-corrections-draft-1.md`, F344):
// a correction is a text act whose format is this cMIP's hash, naming the act
// it corrects first in `refs`, signed by that act's own signer (a
// collective's correction by the collective). Clients label it "Correction"
// and show "corrected by" on the original, which stays signed. Shared by
// Edubba, Dub, the site's feed and the connector.

import { sha256 } from '../../genesis/src/core.ts';
import type { ShownPost } from './post.ts';

/** The corrections cMIP, draft 1: a test value until publication. */
export const CORRECTIONS_SPEC = sha256('Corrections cMIP, draft 1, test value until publication');

/** The label a correction carries wherever it is shown (2.1). */
export const CORRECTION_LABEL = 'Correction';

/**
 * The act a post corrects (1.1 to 1.3), or null: its format this cMIP's,
 * its first reference an act found and signed by the post's own signer.
 */
export function correctionOf(p: Pick<ShownPost, 'signer' | 'format' | 'refs'>): string | null {
  if (p.format !== CORRECTIONS_SPEC) return null;
  const r = p.refs[0];
  if (!r || r.kind !== 'act' || !r.actSigner || r.actSigner !== p.signer) return null;
  return r.id;
}
