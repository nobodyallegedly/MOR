// What the runner reads in a request before it signs (the Dubsar runner
// cMIP, sections 4.3 and 5): the act's kind, read from its specification
// and type, never from the app's word; and the act in plain words, read from
// the exact payload bytes it will sign.

import { ENVELOPES_TYPES, IDENTITY_TYPES, MIRS, SPECS, cborDecode, hex, readKeyDelivery } from '../../genesis/src/core.ts';
import type { SignRequest } from '../../genesis/src/identity.ts';
import { refAct, refSigner } from '../../genesis/src/lookup.ts';
import { actForm, idForm } from '../../genesis/src/forms.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT, WITHDRAWAL } from '../../barebone/src/specs.ts';
import { CORRECTIONS_SPEC } from '../../barebone/src/corrections.ts';
import { NAME, NAME_WITHDRAWAL } from '../../dub/src/names.ts';
import { FOLLOW_LIST, PEOPLE_SPEC, PEOPLE_SPEC_1, SEALED_LIST } from '../../dub/src/people.ts';
import { APPENDED_FORMAT } from '../../dub/src/appended.ts';
import { MESSAGES_SPECS, SPEC as MONEY_SPECS } from '../../damgar/src/specs.ts';
import { TYPES as MONEY_TYPES, readDraft, readLaneRequest } from '../../damgar/src/messages.ts';
import { UNITS_MODULES, say as sayAmount } from '../../damgar/src/units.ts';
import { GRANT_LIMITS_SPEC } from '../../grants/src/limits.ts';
import { MEMBER_KEYS_SPEC } from '../../grants/src/member.ts';

/** The kinds of act (section 5.1). */
export type Kind = 'posts' | 'messages' | 'names' | 'contacts' | 'money' | 'agreements' | 'keys' | 'other';

export const KINDS: Kind[] = ['posts', 'messages', 'names', 'contacts', 'money', 'agreements', 'keys', 'other'];

/** Money, agreements (relying on another’s act among them, draft 2: decided) and keys always ask, and what the runner cannot read (5.3). */
export const ALWAYS_ASKS: readonly Kind[] = ['money', 'agreements', 'keys', 'other'];

/** A kind as a standing yes names it: "Dub · posts and replies". */
export const KIND_NAME: Record<Kind, string> = {
  posts: 'posts and replies',
  messages: 'private messages',
  names: 'display names',
  contacts: 'the contacts list',
  money: 'money acts',
  agreements: 'agreements, and relying on an act',
  keys: 'keys, and where the identity lives',
  other: 'acts Kišib cannot read',
};

/** One act of a kind, as the panel's title says it: "Dub asks Kišib to sign a post". */
export const KIND_ONE: Record<Kind, string> = {
  posts: 'a post',
  messages: 'a private message',
  names: 'a display name',
  contacts: 'the contacts list',
  money: 'a money act',
  agreements: 'an agreement act',
  keys: 'a key act',
  other: 'an act it cannot read',
};

/** Acts of the identity's chain: never signed by the runner, which holds no chain key (3.4). */
const CHAIN = [IDENTITY_TYPES.genesis, IDENTITY_TYPES.rotation, IDENTITY_TYPES.receipt, IDENTITY_TYPES.chainSignature] as number[];

const MONEY = new Set<string>([MIRS.money, ...MESSAGES_SPECS, MONEY_SPECS.payment, MONEY_SPECS.anchoring, MONEY_SPECS.split, MONEY_SPECS.conversion, GRANT_LIMITS_SPEC]);

/** Why the runner refuses a request outright, or null. */
export function refusedOutright(r: SignRequest): string | null {
  if (r.spec === SPECS.identity && CHAIN.includes(r.type)) return 'This is an act of the identity’s chain: only its chain key signs it, from paper, and the runner never holds the chain key. Nothing was signed.';
  if (r.line === 'public' && !r.public) return 'A private act on the public line: each app keeps its private acts on its private line. Nothing was signed.';
  if (r.line === 'private' && r.public) return 'A public act on the private line: each app keeps its public acts on its public line. Nothing was signed.';
  if (r.line === 'apart' && r.public) return 'An act on a line of its own is a private act. Nothing was signed.';
  return null;
}

/** The kind of an act, from its specification and type (5.1). */
export function kindOf(r: SignRequest): Kind {
  if (r.spec === POST_SPECS.text && r.type === TEXT_ACT) return r.public ? 'posts' : 'messages';
  if (r.spec === SPECS.envelopes) {
    if (r.type === PUBLICATION) return r.public ? 'posts' : 'messages';
    if (r.type === WITHDRAWAL) return 'posts';
    return 'keys';
  }
  if (r.spec === SPECS.identity) {
    if (r.type === NAME || r.type === NAME_WITHDRAWAL) return 'names';
    if (r.type === IDENTITY_TYPES.witness) return 'agreements';
    return 'keys';
  }
  if (r.spec === PEOPLE_SPEC || r.spec === PEOPLE_SPEC_1) return 'contacts';
  if (MONEY.has(r.spec)) return 'money';
  if (r.spec === MIRS.agreements) return 'agreements';
  if (r.spec === MEMBER_KEYS_SPEC) return 'keys';
  return 'other';
}

/** A key delivered to the identity itself: its target and key (7.3), or null. */
export function deliveredToItself(r: SignRequest): { target: string; key: Uint8Array } | null {
  if (r.spec !== SPECS.envelopes || r.type !== ENVELOPES_TYPES.keyDelivery || r.public) return null;
  if (r.to?.length !== 1 || r.to[0] !== r.identity) return null;
  try {
    const d = readKeyDelivery(r.payload) as { target: string; key: Uint8Array | number[]; media: boolean };
    if (d.media) return null;
    return { target: d.target, key: Uint8Array.from(d.key) };
  } catch {
    return null;
  }
}

const short = (form: string) => {
  const one = form.indexOf('1');
  return one < 0 || form.length < one + 10 ? form : `${form.slice(0, one + 4)}…${form.slice(-3)}`;
};
const who = (id: string) => (/^[0-9a-f]{64}$/.test(id) ? short(idForm(id)) : id);
const act = (id: string) => (/^[0-9a-f]{64}$/.test(id) ? short(actForm(id)) : id);
const UNITS = new Set(UNITS_MODULES.flatMap((m) => m.units.map((u) => u.hash)));
const map = (b: Uint8Array): Map<number, unknown> | null => {
  try {
    const m = cborDecode(b);
    return m instanceof Map ? (m as Map<number, unknown>) : null;
  } catch {
    return null;
  }
};

/** The act in plain words (4.3): what it says, then what it names. `name` is the app's. */
export function wordsOf(r: SignRequest, app: string): string[] {
  const out: string[] = [];
  const m = map(r.payload);
  const kind = kindOf(r);
  if (r.spec === POST_SPECS.text && r.type === TEXT_ACT && m) {
    const format = m.get(1) instanceof Uint8Array ? hex(m.get(1) as Uint8Array) : null;
    if (format === CORRECTIONS_SPEC) out.push('A correction of an earlier act of its own:');
    else if (format === POST_SPECS.longform) out.push('A long-form document:');
    else if (format === APPENDED_FORMAT) out.push('A message with a collective appended (it binds nothing):');
    else if (format) out.push(`A text in the format ${format.slice(0, 12)}…:`);
    out.push(`“${String(m.get(0) ?? '')}”`);
  } else if (r.spec === SPECS.envelopes && r.type === PUBLICATION && m) {
    const module = m.get(0) instanceof Uint8Array ? hex(m.get(0) as Uint8Array) : '';
    const what = module === POST_SPECS.jpeg ? 'A picture (JPEG)' : module === POST_SPECS.video ? 'A film (MP4)' : 'A publication';
    const work = m.get(1) instanceof Uint8Array ? hex(m.get(1) as Uint8Array) : '';
    out.push(`${what}, ${Number(m.get(3) ?? 0).toLocaleString('en')} bytes, its work hash ${work.slice(0, 16)}…`);
  } else if (r.spec === SPECS.envelopes && r.type === WITHDRAWAL) {
    out.push('Withdraws a publication of its own.');
  } else if (r.spec === SPECS.identity && r.type === NAME && m) {
    out.push(`The display name “${String(m.get(0) ?? '')}”.`);
  } else if (r.spec === SPECS.identity && r.type === NAME_WITHDRAWAL) {
    out.push('Withdraws an earlier display name.');
  } else if (r.spec === SPECS.identity && r.type === IDENTITY_TYPES.witness) {
    out.push('Relies on another identity’s act: it keeps that act standing should its author ever disown it (a witness act, public).');
  } else if ((r.spec === PEOPLE_SPEC || r.spec === PEOPLE_SPEC_1) && m) {
    const n = Array.isArray(m.get(2)) ? (m.get(2) as unknown[]).length : 0;
    out.push(r.type === SEALED_LIST ? `The follow list, sealed to itself: ${n} ${n === 1 ? 'identity' : 'identities'}, version ${m.get(0)}.` : r.type === FOLLOW_LIST ? `The follow list, published: ${n} ${n === 1 ? 'identity' : 'identities'}, version ${m.get(0)}. Anyone can read whom it follows.` : 'A contacts act.');
  } else if (MESSAGES_SPECS.includes(r.spec)) {
    try {
      if (r.type === MONEY_TYPES.draft) {
        const d = readDraft(r.payload);
        const amount = sayAmount(d.amount, UNITS);
        out.push(
          d.what === 'pay'
            ? `A payment prepared for Damgar: pay ${amount} to ${who(d.other)}${d.whatFor ? `, for “${d.whatFor}”` : ''}. Damgar signs the payment itself, later.`
            : d.what === 'ask'
              ? `A request prepared for Damgar: ask ${who(d.other)} to pay ${amount}${d.whatFor ? `, for “${d.whatFor}”` : ''}.`
              : d.what === 'anchor'
                ? `An anchoring prepared for Damgar: ${amount} to the anchoring service ${who(d.other)}.`
                : `A purchase’s confirmation prepared for Damgar (${amount}).`,
        );
      } else if (r.type === MONEY_TYPES.laneRequest) {
        const l = readLaneRequest(r.payload) as { words?: string };
        out.push(`A lane asked of Damgar${l.words ? `: “${l.words}”` : ''}: what this app may pay by itself, granted in Damgar.`);
      } else out.push('A money message for Damgar.');
    } catch {
      out.push('A money message Kišib cannot read in full.');
    }
  } else if (kind === 'money' || kind === 'agreements' || kind === 'keys' || kind === 'other') {
    const layer = r.spec === MIRS.agreements ? 'the Agreements MIR' : r.spec === MIRS.money ? 'the Money MIR' : r.spec === SPECS.identity ? 'the Identity MIR' : r.spec === SPECS.envelopes ? 'the Envelopes MIR' : `the specification ${r.spec.slice(0, 12)}…`;
    out.push(`An act of ${layer}, type ${r.type}, ${r.payload.length} bytes: Kišib does not read it in plain words.`);
  }
  for (const x of r.refs ?? []) out.push(`It names ${act(refAct(x))}${refSigner(x) ? ` by ${who(refSigner(x)!)}` : ''}.`);
  for (const [, o] of r.objects ?? []) out.push(`It acts on ${act(o)}.`);
  for (const a of r.acks ?? []) out.push(`It acknowledges ${act(a)}.`);
  const to = (r.to ?? []).filter((t) => t !== r.identity);
  if (to.length) out.push(`${r.public ? 'Addressed to' : 'Sealed to'} ${to.map(who).join(', ')}.`);
  if (!r.public && r.to?.length === 1 && r.to[0] === r.identity) out.push('Sealed to the identity itself, for its own apps.');
  out.push(r.line === 'apart' ? `On a line of its own, outside ${app}’s lines.` : `On ${app}’s ${r.line} line, at position ${r.sequence.length + 1}.`);
  return out;
}
