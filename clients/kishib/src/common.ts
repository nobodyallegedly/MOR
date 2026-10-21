// What Kišib's identity and collective sittings share: the words said where
// words are typed and where new words are shown, addresses as typed,
// putting an act at a home, and an identity held for one act in memory.

import { hex } from '../../genesis/src/core.ts';
import { TestIdentity, TEST_LABEL, type Home, type IdentityFile } from '../../genesis/src/identity.ts';
import { CODE, RelayError, relayAt } from '../../genesis/src/transport.ts';
import type { Line } from './shapes.ts';

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const b64 = (b: Uint8Array) => {
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
};

/** Said on every screen where words are typed (F335: "the one place where a chain key is used, from paper, and then forgotten"). */
export const FORGOTTEN_SAY = 'What you type here is used for this act alone, then overwritten. Kišib writes nothing to this device: close it, and nothing of your words remains.';

/** Said where the new signing key's words are shown (the carry Module, 3.2 and 3.3). */
export const NEW_WORDS_SAY = [
  'These are the new signing key’s words: whoever holds them can sign as this identity and read its private messages. They are not the chain key’s words.',
  'Write them on paper, in order. Carry them to Dub or Edubba, which take them (in Dub: the identity window, “take the new words”; in Edubba: the identity’s record).',
  'They are shown once. When you say they are written, they are hidden, three are asked back, and Kišib forgets them.',
];

/**
 * Said where the new chain key's words are shown (H79, decided by Nobody,
 * allegedly, 21 October 2026: "A rotation generates two new sets of keys,
 * chain and signing"; the air-gapped Module, rule 3.3, a fresh seed).
 */
export const NEW_CHAIN_WORDS_SAY = [
  'These are the new chain key’s words: a new paper, made for this identity now. The next change of its keys is made from them, in Kišib, and from nothing else.',
  'The old paper is spent: this change used it, and it can change these keys no more. Destroy it once these words are written.',
  'Write them on a new paper, in order, and keep it apart from the signing key’s words. Never type them into Dub, Edubba, Damgar or a wallet: only Kišib takes them.',
  'They are shown once. When you say they are written, they are hidden, three are asked back, and Kišib forgets them. The new signing key’s words come next.',
];

/** Addresses as typed: one per line, or separated by spaces or commas. */
export function addresses(typed: string): string[] {
  const out = typed
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const a of out) if (!/^https?:\/\/[^\s]+$/.test(a)) throw new Error(`“${a}”: an address starts with https:// (or http://)`);
  if (!out.length) throw new Error('Give an address where this identity is found: one of its homes.');
  return out;
}

/** Put one act at one place; a home that lacks the acts before it gets them first. One line, in plain words. */
export async function put(hint: string, bytes: Uint8Array, before: Uint8Array[]): Promise<Line> {
  const r = relayAt(hint, {});
  const once = async () => {
    const res = await r.putAct(bytes);
    return { text: `${hint}: holds it${res.receipt ? ', and signed its receipt' : ''}.`, tone: 'ok' as const };
  };
  try {
    return await once();
  } catch (e) {
    if (e instanceof RelayError && e.code === CODE.missingPredecessor) {
      try {
        for (const b of before) await r.putAct(b).catch(() => undefined);
        return await once();
      } catch (e2) {
        return { text: `${hint}: ${message(e2)}`, tone: 'warn' };
      }
    }
    return { text: `${hint}: ${message(e)}`, tone: 'warn' };
  }
}

/** An identity held for one act, in memory: its signing key from words, a new line under `binding`. Never saved. */
export function holding(id: string, binding: string, signingSeed: Uint8Array, chain: Uint8Array[], homes: Home[]): TestIdentity {
  const f: IdentityFile = {
    label: TEST_LABEL,
    identity: id,
    position: 0,
    binding,
    signingSecret: hex(signingSeed),
    safety: { scheme: 0, seeds: '' },
    chain: chain.map(b64),
    homes,
    rule: null,
    sequence: [],
    routes: null,
    encryption: [],
    pending: null,
  };
  return new TestIdentity(f, {});
}

