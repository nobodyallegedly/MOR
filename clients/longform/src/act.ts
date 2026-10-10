// A long-form document as a MOR act: a public text act (Text MIP, type 0)
// whose format field names this cMIP. Publishing and reading go through the
// genesis client's identity and transport, and every judgement through the
// core library.

import { MIPS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, openWithKey, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { LONGFORM_SPECS, TEXT_ACT } from './specs.ts';

/** A text act's payload (Text MIP, "Act format"): the text and, optionally, its format. */
export function textPayload(text: string, format: string | null = LONGFORM_SPECS.longform): Uint8Array {
  const m = new Map<number, unknown>([[0, text]]);
  if (format) m.set(1, unhex(format));
  return cborEncode(m);
}

/**
 * Publish a long-form document, public, on the given relays, carrying the
 * signer's identity-chain acts along, so that a reader who knows only a
 * relay finds its genesis, and from it its homes.
 */
export async function publishDocument(by: TestIdentity, text: string, relays: string[]): Promise<{ id: string }> {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
        // that relay's policy, or it is away
      }
    }
  }
  const made = await by.publish(LONGFORM_SPECS.text, TEXT_ACT, textPayload(text), { public: true, relays });
  return { id: made.id };
}

export interface Read {
  id: string;
  signer: string;
  /** The act's standing for its signer's identity chain, as the core library judges it. */
  standing: string;
  text: string;
  /** The format the act names, if any. */
  format: string | null;
  /** Whether this client implements that format; if not, the text is shown plain (Text MIP, rule 4). */
  formatted: boolean;
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

/**
 * Fetch a text act by its id from the first place that has it, check it is
 * the act asked for, open it, and judge its standing through its signer's
 * identity chain, looked up from its homes.
 */
export async function readDocument(id: string, hints: string[], via: Via = {}): Promise<Read> {
  let act: Uint8Array | null = null;
  for (const h of hints) {
    try {
      act = await relayAt(h, via).getAct(id);
      if (act) break;
    } catch {
      // not reachable: try the next
    }
  }
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(', ')}`);
  const d = describeAct(act) as Described;
  if (d.id !== id) throw new Error(`the relay answered with ${d.id}, not ${id}`);
  if (!d.public) throw new Error('the act is not public');
  if (!d.payload) {
    // It carries its key but does not open: ask the core why (the key on
    // the outside is used; the one given here is never needed).
    openWithKey(act, new Uint8Array(32));
    throw new Error('the act does not open');
  }
  if (d.spec !== LONGFORM_SPECS.text || d.type !== TEXT_ACT) throw new Error('the act is not a text act');
  if (!d.signer) throw new Error('the act has no signer');
  const p = cborDecode(d.payload) as Map<number, unknown>;
  const text = p.get(0);
  if (typeof text !== 'string') throw new Error('the text act has no text');
  const f = p.get(1);
  const format = f instanceof Uint8Array ? hex(f) : null;

  const v = new Verifier(SPECS.identity, MIPS.money, MIPS.agreements);
  await lookUp(d.signer, hints, via, v);
  v.add(act);
  return {
    id,
    signer: d.signer,
    standing: v.status(id),
    text,
    format,
    formatted: format === LONGFORM_SPECS.longform,
  };
}
