// Bug reports (F287, F289): a report is a public text act from the
// reporter's own identity, addressed to the public reporting identity and
// left unsealed in its inbox ("Bug reports come from people truly on MOR,
// their own ID", Nobody, allegedly), as Dub sends one and as the reports
// mirror reads them (`clients/reports/src/read.ts`); its answers are the
// reporting identity's own public text acts naming it in `refs`. The mirror
// on GitHub is the reports client's, run by hand by the author: Ummia only
// says so.
//
// Nothing from Node: the web client runs it too.

import { MIRS, SPECS, Verifier, cborDecode, describeAct } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { leaveInInbox, post } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import type { Line } from './shapes.ts';

/** Said where reports are written, word for word. */
export const REPORT_SAY = [
  'A report is public: signed by your identity, addressed to the reporting identity and left in its inbox, where anyone can read it. Never put a secret in it; to tell something privately, send a sealed message from Dub instead, which is never mirrored.',
  'Public reports are mirrored on GitHub as issues, with each answer as a comment, by the reports mirror, which the author runs by hand: it may take a while to appear there.',
  'Answers are the reporting identity’s own public posts naming your report: Ummia looks for them at its relays.',
];

/** A report sent from here, as kept. */
export interface Sent {
  id: string;
  to: string;
  title: string;
  at: number;
  left: string[];
}

export interface Answer {
  id: string;
  report: string;
  text: string;
  standing: string;
}

/** Send a report: a public text act addressed to the reporting identity, on one's relays and left in its inbox. */
export async function send(me: TestIdentity, a: { to: string; text: string; relays: string[]; via: Via; save: () => Promise<void> }): Promise<{ sent: Sent; lines: Line[] }> {
  const l = await lookUp(a.to, [...a.relays, ...me.f.homes.map((h) => h.hint)], a.via);
  const inbox = l.inbox(SPECS.text) ?? [];
  if (!inbox.length) throw new Error('The reporting identity declares no inbox: no report can reach it. Nothing was signed.');
  let made;
  try {
    made = await post(me, { text: a.text, relays: a.relays, to: [a.to] });
  } finally {
    await a.save();
  }
  const left = await leaveInInbox(me, made.act, inbox);
  const title = a.text.split('\n')[0].slice(0, 120);
  return {
    sent: { id: made.id, to: a.to, title, at: Math.floor(Date.now() / 1000), left: left.left },
    lines: [
      { text: `Sent: report ${made.id.slice(0, 12)}…, public, signed by you.`, tone: 'ok' },
      left.left.length ? { text: `Left in the reporting identity’s inbox: ${left.left.join(', ')}.`, tone: 'ok' } : { text: `No inbox relay took it: ${left.failed.map((f) => `${f.relay}: ${f.reason}`).join('; ')}. It is published on your relays all the same.`, tone: 'warn' },
    ],
  };
}

/** The reporting identity's answers to the reports given: its public text acts naming one in `refs`, each checked through its chain. */
export async function answers(to: string, reports: string[], places: string[], via: Via = {}): Promise<{ answers: Answer[]; lines: Line[] }> {
  const want = new Set(reports);
  const lines: Line[] = [];
  const out = new Map<string, Answer>();
  if (!want.size) return { answers: [], lines };
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let at = places;
  try {
    const l = await lookUp(to, places, via, v);
    const outbox = l.routes.routes.filter((r) => (r.kind ?? 0) === 0);
    const route = outbox.find((r) => r.scope === POST_SPECS.text) ?? outbox.find((r) => r.scope === null);
    at = [...new Set([...(route?.hints ?? []), ...places])];
  } catch (e) {
    return { answers: [], lines: [{ text: `The reporting identity could not be looked up: ${e instanceof Error ? e.message : String(e)}.`, tone: 'warn' }] };
  }
  for (const h of at) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ signer: to, spec: POST_SPECS.text, type: TEXT_ACT, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          const d = describeAct(it.item) as { id: string; signer?: string; public: boolean; payload?: Uint8Array; refs?: string[] };
          if (!d.public || d.signer !== to || !d.payload || out.has(d.id)) continue;
          const named = (d.refs ?? []).find((r) => want.has(r));
          if (!named) continue;
          v.add(it.item);
          const t = (cborDecode(d.payload) as Map<number, unknown>).get(0);
          out.set(d.id, { id: d.id, report: named, text: typeof t === 'string' ? t : '', standing: v.status(d.id) });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e) {
      lines.push({ text: `${h}: ${e instanceof Error ? e.message : String(e)}`, tone: 'warn' });
    }
  }
  return { answers: [...out.values()], lines };
}
