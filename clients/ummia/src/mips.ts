// A path to drafting MIPs (F339, decided by Nobody, allegedly: "A) only once
// the dev is ready it truly published the specs"). A MIP is a proposal
// toward MOR 2, drafted layer by layer like the MIRs (F286, F289), a
// specification of kind 8 naming its creator and, in field 8, the MIR or
// MIP it forks, or for a new layer the MICS document (F325; F328, Q10).
//
// - Ummia helps write it in the MIP shape: a template with the MIRs'
//   headings, and a check of the shape, which advises and never blocks.
// - Drafts are published for discussion as signed long-form documents
//   (a public text act in the long form cMIP's format), not as
//   specifications: each draft its own act; replies to it, from Dub or any
//   client, are shown with it.
// - Only when its author is ready is it published as a specification
//   (`spec.ts`, kind 8), its creator the identity acting, its predecessor
//   what it would replace.
//
// Nothing from Node: the web client runs it too.

import { MIRS, SPECS, Verifier, cborDecode, describeAct, openSealed, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { publishDocument } from '../../longform/src/act.ts';
import { LONGFORM_SPECS, TEXT_ACT } from '../../longform/src/specs.ts';
import { nameOf } from '../../site/src/listing.ts';
import type { Line } from './shapes.ts';

/** What a MIP may fork, by name: the six MIRs (test values until the freeze); a MIP or the MICS document by its spec hash. */
export const FORKABLE: { key: string; name: string; hash: string }[] = [
  { key: 'identity', name: 'Identity MIR', hash: MIRS.identity },
  { key: 'envelopes', name: 'Envelopes MIR', hash: MIRS.envelopes },
  { key: 'text', name: 'Text MIR', hash: MIRS.text },
  { key: 'money', name: 'Money MIR', hash: MIRS.money },
  { key: 'agreements', name: 'Agreements MIR', hash: MIRS.agreements },
  { key: 'development', name: 'Development MIR', hash: MIRS.development },
];

/** The headings of the MIP shape, in order: those of the MIRs a proposal needs. */
export const SHAPE = ['Purpose', 'What it changes', 'Dependencies', 'Words used in this MIP', 'Rules', 'Reasoning', 'Freeze scenarios'];

/** Said where MIPs are drafted. */
export const MIP_SAY = [
  'A MIP is a proposal toward MOR 2: a fork of one MIR (or of another MIP), or, for a new layer, of the MICS document. Anyone may fork a MIP; adoption, not authority, sorts the forks.',
  'Drafts are published for discussion as signed long-form documents, readable in the reader and answerable from Dub. They are not specifications: nothing names them by a spec hash.',
  'Only when you are ready is it published as a specification (a MIP, kind 8), naming you as its creator and what it would replace. That act is for good: a changed MIP is a new one, with a new hash.',
];

/** A MIP's first draft, in the MIP shape: canonical text, no final line break. */
export function template(a: { title: string; forks: string; creator: string }): string {
  const title = a.title.trim() || 'A proposal';
  return [
    `# MIP: ${title}`,
    '',
    `*Draft 1, a proposal toward MOR 2, by ${a.creator}. It forks ${a.forks}.*`,
    '',
    ...SHAPE.flatMap((h) => [`## ${h}`, '', h === 'Purpose' ? 'What this proposal is for, in plain words.' : h === 'What it changes' ? 'Each rule it adds, changes or removes, against the text it forks.' : h === 'Rules' ? '#### Rule 1. A name\n\nThe rule, as it would read.' : '…', '']),
  ]
    .join('\n')
    .trimEnd();
}

/** The shape, checked: its title line and each heading, in plain words. Advice only: it never blocks. */
export function shapeOf(text: string): Line[] {
  const out: Line[] = [];
  const first = text.split('\n')[0] ?? '';
  out.push(/^# MIP: \S/.test(first) ? { text: `Its title: “${first.slice(7)}”.`, tone: 'ok' } : { text: 'Its first line should be its title, “# MIP: …”, as a MIR’s is “# MIR: …”.', tone: 'warn' });
  const heads = new Set(text.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim()));
  const missing = SHAPE.filter((h) => !heads.has(h));
  out.push(missing.length ? { text: `Headings of the MIP shape not found: ${missing.join(', ')}.`, tone: 'warn' } : { text: 'Every heading of the MIP shape is there.', tone: 'ok' });
  return out;
}

/** A draft, as kept: its acts in order, and the specification once published. */
export interface MipDraft {
  key: string;
  title: string;
  /** The spec hash it forks (field 8 once published). */
  forks: string;
  forksName: string;
  /** Each draft published for discussion, oldest first. */
  drafts: { id: string; at: number; name: string }[];
  /** The text as last written here (also each draft's text, as published). */
  text: string;
  /** Published as a specification: its publication and spec hash. */
  published: { id: string; hash: string } | null;
}

/** Publish a draft for discussion: a long-form document, public, signed. */
export async function publishDraft(me: TestIdentity, text: string, relays: string[]): Promise<{ id: string }> {
  return publishDocument(me, text, relays);
}

/** A reply to a draft: a text act naming it in `refs`, found in the author's inbox (sealed copies opened, F272) or at the relays named. */
export interface Reply {
  id: string;
  signer: string;
  text: string;
  standing: string;
  sealed: boolean;
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  refs?: string[];
}

/** The replies to the drafts given, from the identity's inbox and the relays named. */
export async function replies(me: TestIdentity, drafts: string[], relays: string[], via: Via = {}): Promise<{ replies: Map<string, Reply[]>; lines: Line[] }> {
  const want = new Set(drafts);
  const out = new Map<string, Reply[]>();
  const lines: Line[] = [];
  if (!want.size) return { replies: out, lines };
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const mine = await lookUp(me.id, me.f.homes.map((h) => h.hint), via, v);
  const inbox = mine.inbox(SPECS.text) ?? [];
  const seen = new Set<string>();
  const take = async (act: Uint8Array, d: Described, key: Uint8Array | undefined, sealed: boolean) => {
    if (!d.signer || seen.has(d.id) || d.spec !== LONGFORM_SPECS.text || d.type !== TEXT_ACT || !d.payload) return;
    const named = (d.refs ?? []).filter((r) => want.has(r));
    if (!named.length) return;
    seen.add(d.id);
    let standing = 'unknown';
    try {
      await lookUp(d.signer, [...relays, ...inbox], via, v);
      if (key) v.addWithKey(act, key);
      else v.add(act);
      standing = v.status(d.id);
    } catch (e) {
      standing = `not checked: ${e instanceof Error ? e.message : String(e)}`;
    }
    const t = (cborDecode(d.payload) as Map<number, unknown>).get(0);
    for (const r of named) out.set(r, [...(out.get(r) ?? []), { id: d.id, signer: d.signer, text: typeof t === 'string' ? t : '', standing, sealed }]);
  };
  const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
  for (const h of [...new Set([...inbox, ...relays])]) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed(inbox.includes(h) ? { to: me.id, after } : { spec: SPECS.text, type: TEXT_ACT, after });
        for (const it of page.items) {
          if (it.kind === 'act') {
            const d = describeAct(it.item) as Described;
            if (d.public) await take(it.item, d, undefined, false);
            continue;
          }
          for (const s of secrets) {
            try {
              const o = openSealed(it.item, me.id, s) as { act: Uint8Array; key?: Uint8Array; described: Described };
              await take(o.act, o.described, o.key, true);
              break;
            } catch {
              // not sealed to this key
            }
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e) {
      lines.push({ text: `${h}: ${e instanceof Error ? e.message : String(e)}`, tone: 'warn' });
    }
  }
  return { replies: out, lines };
}

export { nameOf };
