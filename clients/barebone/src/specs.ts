// The spec hashes a post names. All are test values: the MIPs' hashes are
// fixed at the freeze, and the JPEG Module's once its creator is named at the
// first acts (step 17).

import { SPECS, sha256 } from '../../genesis/src/core.ts';
import { LONGFORM_SPECS } from '../../longform/src/specs.ts';

const test = (s: string) => sha256(s);

export const POST_SPECS = {
  /** The Text MIP (`TEXT`). */
  text: LONGFORM_SPECS.text,
  /** The Envelope MIP (`ENVELOPE`). */
  envelope: SPECS.envelope,
  /** The long-form text format cMIP: a post naming it is rendered with it. */
  longform: LONGFORM_SPECS.longform,
  /** The JPEG Module (modules/module-jpeg-draft-1.md). */
  jpeg: test('JPEG Module, draft 1, test value until publication'),
};

/** The text act (Text MIP, "Act format"). */
export const TEXT_ACT = 0;
/** Envelope types: a publication and a withdrawal. */
export const PUBLICATION = 0;
export const WITHDRAWAL = 3;
