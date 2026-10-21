// The appended collective cMIP, draft 1 (`cmips/cmip-appended-collective-draft-1.md`,
// the Dubsar Suite's): a member writes a private message in their own name
// and appends their collective to it (decided by Nobody, allegedly, 21
// October 2026: "the person signs in their own name, and append their
// collective"). The message is a text act in this cMIP's format, naming the
// collective's identity first in `refs`. It binds nothing: the collective
// signs nothing and is told nothing. A reader's app shows "of <the
// collective>" only where the signer is, by the collective's agreement in
// force read from its places, one of its parties and not departed; an app
// that does not know this cMIP shows an ordinary text naming an act.

import { sha256 } from '../../genesis/src/core.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { collectiveNow, collectivePlaces, termsAt } from '../../grants/src/member.ts';

/** The cMIP's format, a test value until its publication (as every Dubsar cMIP's hash is until step 17). */
export const APPENDED_FORMAT = sha256('Appended collective cMIP, draft 1, test value until publication');

/** The collective a text act appends, read from its format and its first reference; null where it appends none. */
export function appendedOf(format: string | null | undefined, refs: { id: string; signer: string | null }[]): string | null {
  if (format !== APPENDED_FORMAT) return null;
  const first = refs[0]?.id;
  return first && /^[0-9a-f]{64}$/.test(first) ? first : null;
}

/** The reference a message appending `collective` names first: the collective's identity, by its own ID (its genesis act). */
export const appendedRef = (collective: string): string => collective;

/**
 * Whether `member` is, now, a member of `collective` (rule 3 of the cMIP):
 * one of the parties of the collective's agreement in force, read from the
 * collective's places, and not departed. A collective whose agreement in
 * force cannot be read is not checked: the label is not shown, and why is
 * said.
 */
export async function membership(member: string, collective: string, hints: string[], via: Via = {}): Promise<{ checked: boolean; why: string | null }> {
  try {
    const places = await collectivePlaces(collective, hints, via);
    const now = await collectiveNow(collective, places, via);
    if (!now.agreement) return { checked: false, why: 'its agreement in force was not found at its places' };
    const t = (await termsAt(now.agreement, places, via)) as { parties?: string[] } | null;
    if (!t?.parties) return { checked: false, why: 'its agreement in force could not be read' };
    if (now.departed.includes(member)) return { checked: false, why: 'the writer has left it' };
    return t.parties.includes(member) ? { checked: true, why: null } : { checked: false, why: 'the writer is not one of its members' };
  } catch (e) {
    return { checked: false, why: `it could not be read (${e instanceof Error ? e.message : String(e)})` };
  }
}
