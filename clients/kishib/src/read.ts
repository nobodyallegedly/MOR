// Reading an identity as any reader would, before anything is signed: its
// chain and receipts from every home its chain names and the relays its
// routes name (Identity rule 23), the rotations served at its next
// position (its own, or someone else's), and every line of its everyday
// acts (Identity rule 35), each said in plain words. Nothing a relay says
// unsigned is trusted: the core library's verifier decides.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { actForm, idForm } from '../../genesis/src/forms.ts';
import { IDENTITY_TYPES, cborDecode, describeAct, hex } from '../../genesis/src/core.ts';
import { lookUp, type Home, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { actsBy, linesOf, lineWords, type FoundLine } from '../../genesis/src/lines.ts';
import { fingerprint } from './shapes.ts';
import type { Line } from './shapes.ts';

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

/** A rotation served for an identity, as read from its bytes. */
export interface Served {
  id: string;
  bytes: Uint8Array;
  position: number;
  previous: string;
  /** The new signing key it installs, and that key's fingerprint as the air-gapped Module writes it. */
  signingKey: string;
  signingFingerprint: string;
  /** The chain key it reveals, by its commitment. */
  reveals: string;
  homeless: boolean;
  successor: string | null | undefined;
  kept: number;
}

/** Everything read about an identity. */
export interface Read {
  id: string;
  look: Lookup;
  /** The chain acts as found anywhere, by id. */
  chainActs: Map<string, Uint8Array>;
  /** Where it was read: its homes, the relays its routes name, and the address given. */
  places: string[];
  /** The rotations served at the position after the latest act that counts. */
  next: Served[];
  /** The lines of everyday acts signed with the key in force. */
  lines: FoundLine[];
  /** Every everyday act of the identity found, to read the lines under another binding (the escape). */
  acts: Uint8Array[];
}

interface Described {
  id: string;
  signer?: string;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

/** A rotation's bytes, read: null where they are no rotation of `id`. */
export function served(id: string, bytes: Uint8Array, identitySpec: string): Served | null {
  let d: Described & { signatureKey?: Uint8Array };
  try {
    d = describeAct(bytes) as Described;
  } catch {
    return null;
  }
  if (d.signer !== id || d.spec !== identitySpec || d.type !== IDENTITY_TYPES.rotation || !d.payload) return null;
  const m = cborDecode(d.payload) as Map<number, unknown>;
  const key = m.get(2) as unknown[];
  const commit = m.get(3) as unknown[];
  const succ = m.get(9);
  const signingKey = hex(key[1] as Uint8Array);
  return {
    id: d.id,
    bytes,
    position: Number(m.get(1)),
    previous: hex(m.get(0) as Uint8Array),
    signingKey,
    signingFingerprint: fingerprint(1, key[1] as Uint8Array),
    reveals: hex(commit[1] as Uint8Array),
    homeless: m.get(11) === true,
    successor: succ === undefined ? undefined : succ === null ? null : hex((succ as unknown[])[1] as Uint8Array),
    kept: (m.get(4) as unknown[]).length,
  };
}

/**
 * Read an identity from `address` and every place its chain and routes
 * name: the lookup the core library judges, the chain acts each place
 * holds (a rotation another place refused is still found), the rotations
 * served at the next position, and the lines of acts under the key in
 * force.
 */
export async function readIdentity(id: string, address: string[], via: Via, identitySpec: string): Promise<Read> {
  let look: Lookup;
  try {
    look = await lookUp(id, address, via);
  } catch (e) {
    throw new Error(`This identity was not found at ${address.join(', ')}: ${message(e)}`);
  }
  const r = look.resolution;
  if (!r.links.length) throw new Error(`Its chain could not be read at ${address.join(', ')} (${r.stop}).`);
  const homes = [...new Set([...(r.homesAt ?? []).flat(), ...r.homes].map((h) => h.hint))];
  const routed = look.routes.routes.flatMap((x) => x.hints);
  const places = [...new Set([...address, ...homes, ...routed])];
  const chainActs = new Map<string, Uint8Array>();
  for (const hint of places) {
    try {
      for (const a of (await relayAt(hint, via).identity(id)).chain) chainActs.set((describeAct(a) as Described).id, a);
    } catch {
      // that place did not answer: silence proves nothing
    }
  }
  const acts = await actsBy(id, places, via);
  for (const a of acts) {
    const s = served(id, a, identitySpec);
    if (s) chainActs.set(s.id, a);
  }
  // Judged with everything found, as a reader holding it would: a rotation
  // served only at a relay (a thief's, at a self-hosted identity, F299), an
  // escape endorsement, an old home's evidence.
  for (const b of [...chainActs.values(), ...acts]) {
    try {
      look.verifier.add(b);
    } catch {
      // malformed or private: proves nothing
    }
  }
  look.resolution = look.verifier.resolve(id) as typeof look.resolution;
  const r2 = look.resolution;
  const latest = r2.links[r2.links.length - 1];
  const next: Served[] = [];
  for (const b of chainActs.values()) {
    const s = served(id, b, identitySpec);
    if (s && s.position === latest.position + 1 && s.previous === latest.act) next.push(s);
  }
  const lines = linesOf({ identity: id, binding: bindingOf(look, chainActs), own: [], acts });
  return { id, look, chainActs, places, next, lines, acts };
}

/**
 * The act that bound the signing key in force: the latest counting genesis
 * or rotation. A chain signature changes only the next commitment (F132),
 * so the key stays bound by the act before it.
 */
export function bindingOf(look: Lookup, chainActs: Map<string, Uint8Array>): string {
  const links = look.resolution.links;
  for (let i = links.length - 1; i > 0; i--) {
    const b = chainActs.get(links[i].act);
    const t = b ? (describeAct(b) as Described).type : IDENTITY_TYPES.rotation;
    if (t !== IDENTITY_TYPES.chainSignature) return links[i].act;
  }
  return links[0].act;
}

/** The lines of acts signed with the key `binding` bound (the escape keeps the lines of the key before a rival rotation). */
export function linesUnder(rd: Read, binding: string): FoundLine[] {
  return linesOf({ identity: rd.id, binding, own: [], acts: rd.acts });
}

/** The homes in plain words. */
export function homesWords(homes: Home[], effective?: string): string {
  const list = homes.map((h) => (h.operator ? `${h.hint} (operator ${short(h.operator)})` : `${h.hint} (self-hosted: the identity is its own home)`)).join('; ');
  const operators = new Set(homes.map((h) => h.operator ?? 'own')).size;
  const k = /^Threshold\((\d+)\)$/.exec(effective ?? '')?.[1];
  const rule = !effective
    ? ''
    : k
      ? ` A change of its keys counts once homes of ${k} of its ${operators} operators hold it and sign receipts.`
      : /Own/.test(effective)
        ? ' It is its own home: a change of its keys counts on its own signatures.'
        : ' One home decides: a change of its keys counts once that home signs its receipt.';
  return `Its homes: ${list}.${rule}`;
}

/** A line in plain words, as Kišib sees it: Kišib makes no line of its own, so none is "this device's". */
export function kishibLineWords(l: FoundLine): string {
  return lineWords(l).replace(/^A line made elsewhere( that this device cannot read)?/, (_, unread) => (unread ? 'A line Kišib cannot read' : 'A line of acts'));
}

/** An identity's record, in plain words (Kišib may show it: homes, receipts, lines, any contest). */
export function recordWords(rd: Read): { heading: string; lines: Line[] }[] {
  const r = rd.look.resolution;
  const out: { heading: string; lines: Line[] }[] = [];
  // Its ID and acts written for people (Identity draft 14, F349), the hexadecimal beside.
  if (r.links[0]) out.push({ heading: 'Its ID', lines: [{ text: `${idForm(r.links[0].act)} (in hexadecimal: ${r.links[0].act})` }] });
  out.push({ heading: 'Its homes', lines: [{ text: homesWords(r.homes, r.effective) }, ...(rd.look.unreachable.length ? [{ text: `Did not answer now: ${rd.look.unreachable.join(', ')}. Silence proves nothing.`, tone: 'warn' as const }] : [])] });
  const receipts = receiptsBy(rd.look.receipts);
  const chain: Line[] = r.links.map((l) => {
    const n = receipts.get(l.act) ?? 0;
    const what = l.position === 0 ? 'its genesis' : `a change of its keys (position ${l.position})`;
    const how = l.how === 'genesis' ? '' : l.how === 'homes' ? `, counting by its homes’ receipts` : l.how === 'own signatures' ? ', counting on its own signatures (self-hosted)' : `, counting as ${l.how}`;
    return { text: `${what}: act ${actForm(l.act)}${how}; ${n} receipt${n === 1 ? '' : 's'} held.`, tone: 'ok' as const };
  });
  if (r.stop === 'contested') chain.push({ text: `Contested at position ${r.links.length}: two rotations revealing one chain key are served there, and no rule settles them. Until it ends, no change of its keys counts.`, tone: 'bad' });
  if (r.stop === 'pending' || r.waiting.length) chain.push({ text: `A change of its keys waits for its homes’ receipts: ${r.waiting.join(', ') || 'one rotation'}.`, tone: 'warn' });
  for (const s of rd.next) {
    const counted = r.links.some((l) => l.act === s.id);
    if (!counted) chain.push({ text: `Served at position ${s.position}, not counting: act ${actForm(s.id)}, installing the signing key ${s.signingFingerprint}${s.homeless ? ', homeless' : ''}.`, tone: r.stop === 'contested' ? 'bad' : 'warn' });
  }
  out.push({ heading: 'Its chain and receipts', lines: chain });
  const succ = rd.look.verifier.succession(rd.id) as { state: string; successor?: string; confirmation?: string };
  if (succ.state !== 'none') {
    out.push({
      heading: 'Its succession',
      lines: [
        succ.state === 'confirmed'
          ? { text: `Declared to ${succ.successor}, and confirmed by it (act ${succ.confirmation}): clients follow it.`, tone: 'ok' }
          : succ.state === 'declared'
            ? { text: `Declared to ${succ.successor}, not yet confirmed by it: shown as declared, followed by nobody until it confirms.`, tone: 'warn' }
            : { text: `Declared to ${succ.successor ?? 'another protocol'} (${succ.state}).`, tone: 'warn' },
      ],
    });
  }
  out.push({ heading: 'Its lines of acts (each app or device keeps one)', lines: rd.lines.length ? rd.lines.map((l) => ({ text: kishibLineWords(l), tone: l.readable ? undefined : ('warn' as const) })) : [{ text: 'No everyday act under the key in force was found.' }] });
  return out;
}

/** How many receipts each chain act has, as held. */
function receiptsBy(receipts: Uint8Array[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const b of receipts) {
    try {
      const d = describeAct(b) as Described;
      const m = cborDecode(d.payload!) as Map<number, unknown>;
      const act = hex(m.get(1) as Uint8Array);
      out.set(act, (out.get(act) ?? 0) + 1);
    } catch {
      // not a receipt this reads
    }
  }
  return out;
}
