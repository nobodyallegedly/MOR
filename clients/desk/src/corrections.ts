// Corrections in Edubba (decided by Nobody, allegedly, 17 October 2026:
// "Corrections can be achieved via Ummia or Edubba and labeled as such";
// the corrections cMIP, draft 1, F344): an identity held here corrects one of
// its own acts by a new text act in the corrections format naming the old
// one first; a collective's act is corrected through its Act tab, as the
// collective (the collective client's `preparePost`, `corrects`). The
// original stays signed; both are labelled wherever Edubba shows them.

import { SPECS, describeAct } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { CORRECTIONS_SPEC, CORRECTION_LABEL } from '../../barebone/src/corrections.ts';
import { readFeed } from '../../site/src/feed.ts';
import { compose } from '../../longform/src/text.ts';
import { escapeControls } from '../../connector/src/words.ts';
import type { Desk, Done } from './desk.ts';
import type { Store } from './store.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);

export { CORRECTION_LABEL };

/** Said where a correction is written. */
export const CORRECTION_SAY =
  'A correction is a new post naming the old one, labelled “Correction”. The old post stays as it was signed, shown with “corrected by”: nothing on MOR is changed or deleted. Apps that do not know the corrections cMIP show an ordinary post naming the old one.';

export interface PostShown {
  id: string;
  text: string;
  standing: string;
  /** Labelled "Correction": the act it corrects. */
  corrects: string | null;
  /** Shown "corrected by": its corrections. */
  correctedBy: string[];
}

export class Corrections {
  constructor(
    private readonly desk: Desk,
    private readonly store: Store,
  ) {}

  /** An identity's own posts, as anyone reads them, each with its label. */
  async posts(identity: string): Promise<{ items: PostShown[]; problems: string[] }> {
    if (!this.store.holds(identity)) throw new Error('This identity is not held here.');
    const { hints, via } = this.desk.places;
    try {
      const f = await readFeed([{ identity, name: null }], hints, via);
      return {
        items: f.posts.map((x) => ({ id: x.id, text: escapeControls(x.post?.text ?? ''), standing: x.post?.standing ?? x.problem ?? 'unknown', corrects: x.corrects ?? null, correctedBy: x.correctedBy ?? [] })),
        problems: f.authors.filter((a) => a.problem).map((a) => a.problem!),
      };
    } catch (e) {
      return { items: [], problems: [e instanceof Error ? e.message : String(e)] };
    }
  }

  /** Correct one of its own acts: refused where the act is not found, or is someone else's (the cMIP, 1.3). */
  async correct(identity: string, act: string, typed: string): Promise<Done> {
    if (!this.store.holds(identity)) throw new Error('This identity is not held here.');
    const { text } = compose(typed);
    if (!text.trim()) throw new Error('Write the correction first.');
    const id = act.trim().toLowerCase();
    let found: Uint8Array | null = null;
    for (const h of this.desk.places.hints) {
      try {
        found = await relayAt(h, this.desk.places.via).getAct(id);
        if (found) break;
      } catch {
        // not there
      }
    }
    if (!found) throw new Error('The act to correct was not found at the relays and homes in Settings. Nothing was signed.');
    const d = describeAct(found) as { signer?: string; public: boolean };
    if (d.signer !== identity) throw new Error('Only its own acts are corrected: this act was signed by another identity (a reply is the way to answer it). Nothing was signed.');
    const s = await this.desk.signAndSend(identity, { spec: SPECS.text, type: 0, payload: textPayload(text, CORRECTIONS_SPEC), public: true, to: [], refs: [[id, identity]] });
    const names = this.store.names();
    this.store.record({ time: now(), draft: '', verdict: 'corrected', signer: identity, title: `${names(identity)} corrected its act ${short(id)}`, note: '', act: s.id, causeAct: id, text });
    return {
      title: `${CORRECTION_LABEL} signed`,
      lines: [{ text: `${CORRECTION_LABEL} ${short(s.id)}, naming ${short(id)}, which stays as signed.`, tone: 'ok' }, ...s.sent.map((x) => ({ text: `${x.to}: ${x.answer}`, tone: (x.accepted ? 'ok' : 'bad') as 'ok' | 'bad' }))],
      acts: [s.id],
    };
  }
}
