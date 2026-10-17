// The corrections cMIP, draft 2 (`cmips/cmip-corrections-draft-2.md`, F344,
// F347): a correction is a text act whose format is one of this cMIP's two,
// naming the act it corrects first in `refs`, signed by that act's own signer
// (a collective's correction by the collective). The plain format's text is
// plain; the long-form format's text is long-form, and is used where a
// long-form act is corrected. Clients label it "Correction" and show
// "corrected by" on the original, which stays signed. Shared by Edubba, Dub,
// the site's feed, the reader and the connector.

import { cborDecode, hex, sha256 } from '../../genesis/src/core.ts';
import { POST_SPECS } from './specs.ts';
import type { ShownPost } from './post.ts';

/** The corrections cMIP, draft 2: a test value until publication. Its plain format (1.1). */
export const CORRECTIONS_SPEC = sha256('Corrections cMIP, draft 2, test value until publication');

/**
 * Its long-form format (1.1, F347): SHA-256 of the UTF-8 text made of the
 * cMIP's hash in lowercase hex, a space, and "long-form".
 */
export const LONG_FORM_CORRECTION = sha256(`${CORRECTIONS_SPEC} long-form`);

/** The label a correction carries wherever it is shown (2.1). */
export const CORRECTION_LABEL = 'Correction';

/** Whether a text's format is a correction format of this cMIP. */
export const isCorrectionFormat = (format: string | null | undefined): boolean => format === CORRECTIONS_SPEC || format === LONG_FORM_CORRECTION;

/** Whether a text is long-form: the long-form format's, or a long-form correction's (its text long-form, 1.1). */
export const isLongForm = (format: string | null | undefined): boolean => format === POST_SPECS.longform || format === LONG_FORM_CORRECTION;

/** The format a correction takes: long-form where the act it corrects is long-form (1.1, F347), else plain. */
export const correctionFormatFor = (corrected: string | null | undefined): string => (isLongForm(corrected) ? LONG_FORM_CORRECTION : CORRECTIONS_SPEC);

/** The format a text act's payload names, or null (a text act not readable, or without one). */
export function formatOfPayload(payload: Uint8Array | null | undefined): string | null {
  if (!payload) return null;
  try {
    const f = (cborDecode(payload) as Map<number, unknown>).get(1);
    return f instanceof Uint8Array ? hex(f) : null;
  } catch {
    return null;
  }
}

/**
 * The act a post corrects (1.1 to 1.3), or null: its format one of this
 * cMIP's, its first reference an act found and signed by the post's own signer.
 */
export function correctionOf(p: Pick<ShownPost, 'signer' | 'format' | 'refs'>): string | null {
  if (!isCorrectionFormat(p.format)) return null;
  const r = p.refs[0];
  if (!r || r.kind !== 'act' || !r.actSigner || r.actSigner !== p.signer) return null;
  return r.id;
}
