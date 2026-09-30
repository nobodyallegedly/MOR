// The spec hashes a long-form text act names. Both are test values: the
// Text MIP's hash is fixed at the freeze, and this cMIP's once its creator
// is named at the first acts (step 17).

import { SPECS, sha256 } from '../../genesis/src/core.ts';

const test = (s: string) => sha256(s);

export const LONGFORM_SPECS = {
  /** The Text MIP (`TEXT`). */
  text: SPECS.text,
  /** The long-form text format cMIP (cmips/cmip-long-form-draft-1.md). */
  longform: test('long-form text format cMIP, draft 1, test value until publication'),
};

/** The text act (Text MIP, "Act format"). */
export const TEXT_ACT = 0;
