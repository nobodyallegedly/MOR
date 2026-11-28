// The web build's `agreements-25.ts` (see `scripts/build-web.ts`, PROGRAM_ONLY):
// the draft-25 binding is not in the web release, so an act of Agreements
// draft 25 reaching an identity on the web is said, not read. The spec hashes
// are encoding 2's (E2), checked against the binding's in
// `test/agreements-25.test.ts`.

import type { Draft25Item } from '../agreements-25.ts';

export const SPEC_DRAFT_25 = 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c';
export const SPEC_REPORT_BLOCK_4 = '7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854';

export function draft25Item(spec: string | undefined): Draft25Item | null {
  if (spec !== SPEC_DRAFT_25 && spec !== SPEC_REPORT_BLOCK_4) return null;
  return {
    kind: 'other',
    problem: 'An act of Agreements draft 25 (encoding 2): Edubba reads these in the program on a computer (the Mac, or Linux), not on the web.',
    assessment: [],
  };
}
