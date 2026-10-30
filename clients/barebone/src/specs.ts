// The spec hashes a post names. All are test values: the MIRs' hashes are
// fixed at the freeze, and the JPEG Module's once its creator is named at the
// first acts (step 17).

import { MIRS, SPECS, sha256 } from '../../genesis/src/core.ts';
import { LONGFORM_SPECS } from '../../longform/src/specs.ts';

const test = (s: string) => sha256(s);

export const POST_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: LONGFORM_SPECS.text,
  /** The Envelopes MIR (`ENVELOPES`). */
  envelopes: SPECS.envelopes,
  /** The Money MIR (`MONEY`): its price tags. */
  money: MIRS.money,
  /** The long-form text format cMIP: a post naming it is rendered with it. */
  longform: LONGFORM_SPECS.longform,
  /** The JPEG Module (modules/module-jpeg-draft-1.md). */
  jpeg: test('JPEG Module, draft 1, test value until publication'),
  /** The video Module (modules/module-video-draft-1.md): a film, named by its test value until publication, as the JPEG Module is. */
  video: test('video Module, draft 1, test value until publication'),
  /** The audio Module (modules/module-audio-draft-1.md): a recording, named by its test value until publication, as the video Module is. */
  audio: test('audio Module, draft 1, test value until publication'),
};

/** The text act (Text MIR, "Act format"). */
export const TEXT_ACT = 0;
/** Envelopes type 0: a bake ("I uploaded this"; its signer is its uploader). */
export const BAKE = 0;
/**
 * Envelopes type 3, the withdrawal, retired (Envelopes rule 24): an act of
 * this type is invalid, and a bake is never withdrawn by the protocol.
 * Named so that a reader can tell it apart; never signed.
 */
export const RETIRED_WITHDRAWAL = 3;
/** Kept for callers from before: the bake's former name (type 0). */
export const PUBLICATION = BAKE;
/** Kept for callers from before: the retired withdrawal (type 3), invalid. */
export const WITHDRAWAL = RETIRED_WITHDRAWAL;
/** Money type 5: a price tag (Money rule 18). */
export const PRICE_TAG = 5;
