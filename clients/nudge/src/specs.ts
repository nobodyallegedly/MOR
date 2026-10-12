// The spec hash the nudge cMIP's acts name (cmips/cmip-nudge-draft-2.md). A
// test value: the Text MIR's hash is fixed at the freeze, and this cMIP's once
// its creator is named at the first acts (step 17).

import { SPECS, sha256 } from '../../genesis/src/core.ts';

export const NUDGE_SPECS = {
  /** The Text MIR (`TEXT`): an action is a text act. */
  text: SPECS.text,
  /** The nudge cMIP, draft 2. */
  nudge: sha256('nudge cMIP, draft 2, test value until publication'),
};

/** The cMIP's three act types (items 1, 5 and 7a). */
export const NUDGE_TYPES = { terms: 0, nudge: 1, pick: 2 } as const;

/** The text act (Text MIR, "The text act"). */
export const TEXT_ACT = 0;

/** The kinds of action the terms name (item 2, `allowed`). */
export const KIND = { post: 0, reply: 1, message: 2 } as const;
export type KindNumber = 0 | 1 | 2;
export const KIND_NAMES = ['a public post', 'a reply', 'a message'] as const;
