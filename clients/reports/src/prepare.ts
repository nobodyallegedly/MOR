// GitHub to MOR (F287 both ways; F289's question 6, "If we can have it
// bidirectional yes please"): an issue opened on GitHub is published again
// on MOR by the reporting identity, never automatically. This command holds
// no key. For the issues the author names (`--prepare N`), after reading
// the dry run, it writes a draft into the drafts folder MOR Identities reads
// (`clients/connector/DRAFTS.md`): a public post of the reporting identity,
// its words `republicationText`. The desk reads the draft again from its own
// bytes, shows it, and signs it only if the author approves it there, as it
// signs every draft. The reporting identity's keys stay at the desk.
//
// What the drafts folder already holds for an issue is read back each run,
// so a draft is never prepared twice: one waiting at the desk, approved,
// declined or sent back is said, and not prepared again.

import { existsSync } from 'node:fs';
import { cborDecode } from '../../genesis/src/core.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { listDrafts, loadAnswer, loadDraft, postDraft, saveDraft, type Answer } from '../../connector/src/draft.ts';
import type { Issue } from './github.ts';
import { republicationText, republishes } from './mirror.ts';

/** A draft already in the folder for an issue: its digest, and the desk's answer if there is one. */
export interface AtDesk {
  digest: string;
  answer: Answer | null;
}

/** The drafts in the folder that publish these issues again as `identity`, by issue number (the newest for each). */
export function atDesk(dir: string, identity: string, issues: Issue[]): Map<number, AtDesk> {
  const out = new Map<number, AtDesk>();
  if (!existsSync(dir)) return out;
  for (const { digest } of listDrafts(dir)) {
    let text: string;
    let answer: Answer | null;
    try {
      const { draft: d } = loadDraft(dir, digest);
      if (d.signer !== identity || d.spec !== POST_SPECS.text || d.type !== TEXT_ACT || !d.public) continue;
      const m = cborDecode(d.payload) as Map<number, unknown>;
      if (!(m instanceof Map) || typeof m.get(0) !== 'string') continue;
      text = m.get(0) as string;
      answer = loadAnswer(dir, digest);
    } catch {
      continue; // not a draft this command reads: the desk says what it is
    }
    for (const i of issues) if (!out.has(i.number) && republishes(text, i)) out.set(i.number, { digest, answer });
  }
  return out;
}

/** A note for the desk: shown beside the draft, never signed. */
export function noteFor(i: Issue): string {
  return `Prepared by mor-reports, the GitHub mirror, not by Claude: issue #${i.number} by @${i.author} (${i.url}), to publish again on MOR as the reporting identity (F287, both ways). Approve it to sign it; decline it and it is not prepared again.`;
}

/**
 * The draft publishing an issue again: a public post of the reporting
 * identity, sent once signed to where its public acts go. Written to the
 * folder, and its digest returned, with what composing changed in its words.
 */
export async function prepareRepublication(
  i: Issue,
  o: { dir: string; identity: string; relays: string[]; hints: string[]; via?: Via },
): Promise<{ digest: string; changes: string[] }> {
  const { draft, changes } = await postDraft({ signer: o.identity, relays: o.relays, note: noteFor(i), text: republicationText(i), format: 'plain' }, o.hints, o.via ?? {});
  const { digest } = saveDraft(o.dir, draft);
  return { digest, changes };
}
